#!/usr/bin/env python3
"""Build site/live_map.json for the IOCWatch Live map.

Live activity from public sensor networks and feeds (keyless), fetched at build time.
The browser only reads the JSON. Only country-level totals, ports, CVE IDs and
ransomware group/country/time are published, never IPs, URLs or victim names.

  Scanning / brute force  blocklist.de (last hour), SANS ISC DShield (today, ports, Infocon),
                          CINS Army, Emerging Threats compromised IPs
  Phishing                OpenPhish community feed, Phishing.Database (new today)
  Malware C2              abuse.ch Feodo Tracker
  Ransomware claims       ransomware.live (group, victim country, time only)
  Exploited / critical    CISA KEV, NVD API 2.0 (critical CVEs, last 48h)
  Context                 Tor exit relays (Tor Project)
IP to country: DB-IP "IP to Country Lite" (CC BY 4.0).

Usage: live_map.py OUT.json [--dbip PATH_TO_CSV_GZ]
Env: LIVE_CACHE (dir for slow-feed cache). Keyless feeds only.
"""
import bisect, collections, concurrent.futures as cf, csv, datetime as dt, gzip, ipaddress, json, os, re, socket, sys, time, urllib.parse, urllib.request

UA = "IOCWatch live map (+https://iocwatch.com; github.com/daniyyell-dev/rapid-threat-intel)"
NOW = dt.datetime.now(dt.timezone.utc)
ISO = "%Y-%m-%dT%H:%M:%SZ"
CACHE = os.environ.get("LIVE_CACHE") or os.path.join(os.environ.get("RUNNER_TEMP", "/tmp"), "livecache")
os.makedirs(CACHE, exist_ok=True)
SERVICES = [("ssh", "SSH brute force"), ("mail", "Mail server attack"), ("imap", "IMAP/POP3 login attack"),
            ("apache", "Web server attack"), ("bruteforcelogin", "Web login brute force"), ("sip", "VoIP (SIP) scan"),
            ("bots", "Spam bot"), ("ftp", "FTP brute force")]
BINS = [300, 900, 1800, 3600]
PORTS = {22: "SSH", 23: "Telnet", 80: "HTTP", 443: "HTTPS", 445: "SMB", 3389: "RDP", 8080: "HTTP alt", 8443: "HTTPS alt",
         5900: "VNC", 1433: "MSSQL", 3306: "MySQL", 5432: "PostgreSQL", 6379: "Redis", 25: "SMTP", 21: "FTP", 53: "DNS",
         2375: "Docker", 9200: "Elasticsearch", 27017: "MongoDB", 5060: "SIP", 8000: "HTTP alt", 8888: "HTTP alt",
         81: "HTTP alt", 8081: "HTTP alt", 2222: "SSH alt", 7547: "TR-069", 5555: "ADB", 37215: "Huawei UPnP",
         52869: "UPnP", 60023: "Telnet alt", 1080: "SOCKS", 3128: "Proxy", 11211: "Memcached", 123: "NTP", 161: "SNMP",
         0: "Port 0", 2323: "Telnet alt", 9000: "HTTP alt", 10000: "Webmin", 6443: "Kubernetes", 4444: "Metasploit"}


def get(url, timeout=60, data=None, headers=None, tries=3):
    h = {"User-Agent": UA, "Accept": "*/*"}
    h.update(headers or {})
    err = None
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, data=data, headers=h), timeout=timeout) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (304, 404, 401, 403, 410):
                raise
            err = e
        except Exception as e:
            err = e
        time.sleep(2 + i * 3)
    raise err


def cached(name, ttl_min, fn):
    """Run fn() at most every ttl_min minutes; reuse the stored result in between."""
    path = os.path.join(CACHE, name + ".json")
    try:
        c = json.load(open(path))
        if time.time() - c["t"] < ttl_min * 60:
            return c["v"]
    except Exception:
        c = None
    try:
        v = fn(c["v"] if c else None)
        json.dump({"t": time.time(), "v": v}, open(path, "w"))
        return v
    except Exception:
        if c:
            return c["v"]
        raise


class Geo:
    def __init__(self, path):
        self.s, self.e, self.c = [], [], []
        with gzip.open(path, "rt", newline="") as f:
            for a, b, cc in csv.reader(f):
                if ":" in a:
                    continue
                self.s.append(int(ipaddress.IPv4Address(a))); self.e.append(int(ipaddress.IPv4Address(b))); self.c.append(cc)

    def cc(self, ip):
        try:
            n = int(ipaddress.IPv4Address(ip.strip()))
        except ValueError:
            return None
        i = bisect.bisect_right(self.s, n) - 1
        if i >= 0 and n <= self.e[i] and self.c[i] not in ("ZZ", ""):
            return self.c[i]
        return None


def dbip_path(arg):
    if arg and os.path.isfile(arg):
        return arg
    path = os.path.join(os.environ.get("RUNNER_TEMP", "/tmp"), "dbip-country-lite.csv.gz")
    if os.path.isfile(path) and time.time() - os.path.getmtime(path) < 40 * 86400:
        return path
    for back in (0, 1):
        m = (NOW.replace(day=1) - dt.timedelta(days=back * 2)).strftime("%Y-%m")
        try:
            open(path, "wb").write(get(f"https://download.db-ip.com/free/dbip-country-lite-{m}.csv.gz", 120))
            return path
        except Exception:
            continue
    raise SystemExit("DB-IP download failed")


def iso(t):
    return t.astimezone(dt.timezone.utc).strftime(ISO)


def parse_ts(s):
    s = (s or "").strip().replace(" UTC", "+00:00").replace("Z", "+00:00")
    if not s:
        return None
    if len(s) == 10:
        s += "T00:00:00+00:00"
    s = s.replace(" ", "T", 1)
    try:
        t = dt.datetime.fromisoformat(s)
    except ValueError:
        return None
    return t if t.tzinfo else t.replace(tzinfo=dt.timezone.utc)


def lines(b):
    return [x.strip() for x in b.decode("utf-8", "ignore").splitlines() if x.strip() and not x.startswith("#")]


def main():
    out = sys.argv[1]
    geo = Geo(dbip_path(sys.argv[sys.argv.index("--dbip") + 1] if "--dbip" in sys.argv else None))
    status, ticker = {}, []
    C = collections.defaultdict(lambda: collections.Counter())  # cc -> {scan, scanlist, phish, c2, ransom, tor, dshield}
    kinds = collections.defaultdict(collections.Counter)
    cats = {k: {"h1": None, "d1": None} for k in ("scan", "phish", "c2", "ransom", "cve")}

    def run(name, fn):
        try:
            fn(); status[name] = "ok"
        except Exception as e:
            status[name] = "error: " + type(e).__name__

    # --- Scanning / brute force -------------------------------------------------
    def blocklist():
        seen = set()
        for svc, label in SERVICES:
            first = {}
            for sec in BINS:
                for ip in get(f"https://api.blocklist.de/getlast.php?time={sec}&service={svc}", 30).decode("ascii", "ignore").split():
                    first.setdefault(ip, sec)
                time.sleep(0.4)
            agg = {}
            for ip, sec in first.items():
                cc = geo.cc(ip)
                if not cc:
                    continue
                a = agg.setdefault(cc, [0, 9999]); a[0] += 1; a[1] = min(a[1], sec)
                kinds[cc][label] += 1
                if ip not in seen:
                    seen.add(ip); C[cc]["scan"] += 1
            for cc, (n, sec) in agg.items():
                ticker.append({"cat": "scan", "cc": cc, "kind": label, "n": n, "unit": "IP", "ts": iso(NOW - dt.timedelta(seconds=sec)),
                               "within": sec // 60, "src": "blocklist.de"})
        cats["scan"]["h1"] = len(seen)
    run("blocklist.de", blocklist)

    def dshield():
        rows = json.loads(get("https://isc.sans.edu/api/topips/records/200?json"))
        agg = {}
        for r in rows:
            cc = geo.cc(r.get("source", ""))
            if cc:
                C[cc]["dshield"] += int(r.get("reports") or 0)
                a = agg.setdefault(cc, [0, 0]); a[0] += 1; a[1] = max(a[1], int(r.get("targets") or 0))
        for cc, (n, tmax) in sorted(agg.items(), key=lambda x: -x[1][1])[:6]:
            ticker.append({"cat": "scan", "cc": cc, "kind": "Top scanner", "n": n, "unit": "IP", "targets": tmax,
                           "ts": iso(NOW.replace(hour=0, minute=0, second=0, microsecond=0)), "day": True, "src": "DShield"})
        time.sleep(1)
        ds = json.loads(get(f"https://isc.sans.edu/api/dailysummary/{(NOW - dt.timedelta(days=1)).date()}/{NOW.date()}?json"))
        today = [d for d in ds if d.get("date") == str(NOW.date())] or ds[-1:]
        if today:
            cats["scan"]["d1"] = int(today[0].get("sources") or 0)
            cats["scan"]["reports_today"] = int(today[0].get("records") or 0)
        time.sleep(1)
        tp = json.loads(get("https://isc.sans.edu/api/topports/records/10?json"))
        tp = tp.values() if isinstance(tp, dict) else tp
        doc["ports"] = [{"port": int(p["targetport"]), "name": PORTS.get(int(p["targetport"]), ""), "records": int(p.get("records") or 0),
                         "sources": int(p.get("sources") or 0)} for p in tp if isinstance(p, dict) and "targetport" in p][:8]
        time.sleep(1)
        doc["infocon"] = json.loads(get("https://isc.sans.edu/api/infocon?json")).get("status", "")
    doc = {"ports": [], "infocon": ""}
    run("DShield", dshield)

    def lists(_prev):
        res = {}
        for name, url in (("cins", "https://cinsscore.com/list/ci-badguys.txt"),
                          ("et", "https://rules.emergingthreats.net/blockrules/compromised-ips.txt")):
            cnt = collections.Counter(cc for cc in (geo.cc(ip) for ip in lines(get(url, 60))) if cc)
            res[name] = dict(cnt)
        return res
    def scanlists():
        v = cached("scanlists", 60, lists)
        for name in ("cins", "et"):
            for cc, n in v.get(name, {}).items():
                C[cc]["scanlist"] += n
        cats["scan"]["listed"] = sum(sum(x.values()) for x in v.values())
    run("CINS Army + ET", scanlists)

    # --- Phishing ---------------------------------------------------------------
    def resolve(hosts):
        out = {}
        def doh(hn):
            r = json.loads(get("https://cloudflare-dns.com/dns-query?type=A&name=" + urllib.parse.quote(hn), 10,
                               headers={"Accept": "application/dns-json"}, tries=1))
            return next((a["data"] for a in r.get("Answer", []) if a.get("type") == 1), None)
        def one(hn):
            ip = None
            try:
                ip = socket.gethostbyname(hn)
            except Exception:
                pass
            if not ip or not ipaddress.ip_address(ip).is_global or ip.startswith("198.18.") or ip.startswith("198.19."):
                try:
                    ip = doh(hn)
                except Exception:
                    ip = None
            return hn, ip
        with cf.ThreadPoolExecutor(32) as ex:
            for hn, ip in ex.map(one, hosts):
                if ip:
                    out[hn] = ip
        return out
    def phish_fetch(_prev):
        urls = lines(get("https://raw.githubusercontent.com/openphish/public_feed/refs/heads/main/feed.txt", 60))
        new = []
        for f in ("phishing-links-NEW-today.txt", "phishing-links-NEW-last-hour.txt"):
            try:
                new += lines(get("https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/master/" + f, 60))
            except Exception:
                pass
        hosts = {}
        for u in urls + new:
            hn = (urllib.parse.urlsplit(u if "://" in u else "http://" + u).hostname or "").lower()
            if hn:
                hosts.setdefault(hn, "op" if u in urls else "pd")
        socket.setdefaulttimeout(4)
        ips = resolve(list(hosts)[:600])
        cnt = collections.Counter()
        for hn, ip in ips.items():
            cc = geo.cc(ip)
            if cc:
                cnt[cc] += 1
        return {"openphish": len(urls), "phishdb": len(new), "hosts": len(hosts), "cc": dict(cnt)}
    def phishing():
        v = cached("phishing", 60, phish_fetch)
        for cc, n in v["cc"].items():
            C[cc]["phish"] += n
        cats["phish"]["d1"] = v["openphish"] + v["phishdb"]
        cats["phish"]["window"] = "12h"
        for cc, n in sorted(v["cc"].items(), key=lambda x: -x[1])[:6]:
            ticker.append({"cat": "phish", "cc": cc, "kind": "Phishing sites hosted", "n": n, "unit": "site", "ts": None,
                           "label_when": "last 12h", "src": "OpenPhish"})
    run("OpenPhish + Phishing.Database", phishing)

    # --- Malware C2 -------------------------------------------------------------
    def feodo():
        cut = (NOW - dt.timedelta(days=30)).date().isoformat(); n = 0
        for r in json.loads(get("https://feodotracker.abuse.ch/downloads/ipblocklist.json")):
            cc = r.get("country")
            if not cc or (r.get("last_online") or "") < cut:
                continue
            n += 1; C[cc]["c2"] += 1
            ticker.append({"cat": "c2", "cc": cc, "kind": f"{r.get('malware') or 'Botnet'} C2 server online", "n": 1, "unit": "server",
                           "ts": iso(parse_ts(r.get("last_online")) or NOW), "day": True, "src": "Feodo Tracker"})
        cats["c2"]["d1"] = (cats["c2"]["d1"] or 0) + n
    run("Feodo Tracker", feodo)

    # --- Ransomware claims (group, country, time only) -------------------------
    def rw_fetch(prev):
        hdr = {}
        if prev and prev.get("etag"):
            hdr["If-None-Match"] = prev["etag"]
        req = urllib.request.Request("https://data.ransomware.live/victims.json", headers=dict({"User-Agent": UA}, **hdr))
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                etag = r.headers.get("ETag"); data = json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code == 304 and prev:
                return prev
            raise
        cut = NOW - dt.timedelta(days=2)
        rec = []
        for v in data:
            t = parse_ts(v.get("discovered") or v.get("published"))
            if t and t >= cut:
                rec.append({"g": (v.get("group_name") or "").strip(), "cc": (v.get("country") or "").upper()[:2], "ts": iso(t)})
        rec.sort(key=lambda x: x["ts"], reverse=True)
        return {"etag": etag, "rec": rec}
    def ransomware():
        v = cached("ransomware", 30, rw_fetch)
        h1 = d1 = 0; recent = []
        for x in v["rec"]:
            t = parse_ts(x["ts"]); age = NOW - t
            if age > dt.timedelta(hours=24):
                continue
            d1 += 1; h1 += age <= dt.timedelta(hours=1)
            if re.fullmatch(r"[A-Z]{2}", x["cc"]):
                C[x["cc"]]["ransom"] += 1
            recent.append({"group": x["g"].title() if x["g"].islower() else x["g"], "cc": x["cc"] if re.fullmatch(r"[A-Z]{2}", x["cc"]) else "", "ts": x["ts"]})
        cats["ransom"]["h1"], cats["ransom"]["d1"] = h1, d1
        doc["ransom"] = recent[:12]
        for x in recent[:10]:
            ticker.append({"cat": "ransom", "cc": x["cc"], "kind": f"Ransomware claim by {x['group']}", "n": 1, "unit": "victim", "ts": x["ts"], "src": "ransomware.live"})
    run("ransomware.live", ransomware)

    # --- Exploited and critical CVEs -------------------------------------------
    def kev_fetch(_prev):
        v = json.loads(get("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json", 90))["vulnerabilities"]
        v.sort(key=lambda x: x.get("dateAdded", ""), reverse=True)
        def what(x):
            a, b = (x.get("vendorProject") or "").strip(), (x.get("product") or "").strip()
            return b if b.lower().startswith(a.lower()) else f"{a} {b}".strip()
        cut = (NOW - dt.timedelta(days=7)).date().isoformat()
        return {"recent": [{"id": x["cveID"], "what": what(x), "day": x.get("dateAdded"), "ransomware": x.get("knownRansomwareCampaignUse") == "Known"} for x in v[:6]],
                "d7": sum(1 for x in v if x.get("dateAdded", "") >= cut), "ids": [x["cveID"] for x in v[:400]]}
    def nvd_fetch(_prev):
        s = (NOW - dt.timedelta(hours=48)).strftime("%Y-%m-%dT%H:%M:%S.000"); e = NOW.strftime("%Y-%m-%dT%H:%M:%S.000")
        d = json.loads(get(f"https://services.nvd.nist.gov/rest/json/cves/2.0?cvssV3Severity=CRITICAL&pubStartDate={s}&pubEndDate={e}&resultsPerPage=50", 90))
        res = []
        for it in d.get("vulnerabilities", []):
            c = it["cve"]; desc = next((x["value"] for x in c.get("descriptions", []) if x.get("lang") == "en"), "")
            score = None
            for m in (c.get("metrics", {}).get("cvssMetricV31") or c.get("metrics", {}).get("cvssMetricV30") or []):
                score = m.get("cvssData", {}).get("baseScore"); break
            short = re.split(r"(?<=[.;])\s", desc, maxsplit=1)[0]
            res.append({"id": c["id"], "score": score, "what": short[:110] + ("…" if len(short) > 110 else ""), "ts": iso(parse_ts(c.get("published")) or NOW)})
        res.sort(key=lambda x: x["ts"], reverse=True)
        return res
    def cves():
        k = cached("kev", 60, kev_fetch)
        n = cached("nvd", 60, nvd_fetch)
        kevset = set(k["ids"])
        for x in n:
            x["kev"] = x["id"] in kevset
        doc["kev"] = k["recent"]; doc["cves"] = n[:8]
        cats["cve"]["d1"] = sum(1 for x in n if NOW - parse_ts(x["ts"]) <= dt.timedelta(hours=24))
        cats["cve"]["kev7"] = k["d7"]
        for x in k["recent"][:3]:
            ticker.append({"cat": "cve", "cc": "", "kind": f"{x['id']} added to CISA KEV", "what": x["what"], "n": 0, "unit": "", "ts": iso(parse_ts(x["day"]) or NOW), "day": True, "src": "CISA KEV"})
        for x in n[:4]:
            ticker.append({"cat": "cve", "cc": "", "kind": f"Critical {x['id']}" + (f" (CVSS {x['score']})" if x["score"] else ""), "what": x["what"], "n": 0, "unit": "", "ts": x["ts"], "src": "NVD"})
    run("CISA KEV + NVD", cves)

    # --- Context: Tor exits ------------------------------------------------------
    def tor_fetch(_prev):
        return dict(collections.Counter(cc for cc in (geo.cc(ip) for ip in lines(get("https://check.torproject.org/torbulkexitlist", 60))) if cc))
    def tor():
        for cc, n in cached("tor", 60, tor_fetch).items():
            C[cc]["tor"] += n
    run("Tor exits", tor)

    # --- Assemble ----------------------------------------------------------------
    def score(c):
        return c["scan"] + c["dshield"] / 2000 + c["scanlist"] / 40 + c["phish"] * 2 + c["c2"] * 4 + c["ransom"] * 3
    countries = []
    for cc, c in C.items():
        if not re.fullmatch(r"[A-Z]{2}", cc):
            continue
        row = {"cc": cc}
        row.update({k: int(c[k]) for k in ("scan", "dshield", "scanlist", "phish", "c2", "ransom", "tor") if c[k]})
        if not any(row.get(k) for k in ("scan", "dshield", "scanlist", "phish", "c2", "ransom")):
            continue
        row["top"] = kinds[cc].most_common(1)[0][0] if kinds[cc] else ""
        row["s"] = round(score(c), 2)
        countries.append(row)
    countries.sort(key=lambda r: -r["s"])
    # Mixed ticker: each category newest first, interleaved so one feed cannot drown the rest
    cap = {"scan": 16, "phish": 6, "c2": 10, "ransom": 10, "cve": 7}
    per = {k: sorted([e for e in ticker if e["cat"] == k], key=lambda e: (e.get("ts") or "0", e.get("n", 0)), reverse=True)[:cap[k]] for k in cap}
    order = ["scan", "ransom", "scan", "phish", "c2", "scan", "cve"]
    mixed, i = [], 0
    while any(per.values()) and i < 400:
        k = order[i % len(order)]; i += 1
        if per[k]:
            mixed.append(per[k].pop(0))
    doc.update({
        "schema": 2,
        "updated": iso(NOW),
        "cats": cats,
        "countries": countries[:150],
        "ticker": mixed,
        "status": status,
        "sources": [
            {"name": "blocklist.de", "url": "https://www.blocklist.de/en/index.html", "cat": "scan", "what": "attacker IPs reported in the last hour"},
            {"name": "SANS ISC DShield", "url": "https://isc.sans.edu/", "cat": "scan", "what": "sensor reports, top ports, Infocon", "licence": "CC BY-NC-SA 4.0"},
            {"name": "CINS Army", "url": "https://cinsscore.com/", "cat": "scan", "what": "IPs with poor reputation"},
            {"name": "Emerging Threats", "url": "https://rules.emergingthreats.net/", "cat": "scan", "what": "compromised IPs"},
            {"name": "OpenPhish", "url": "https://openphish.com/", "cat": "phish", "what": "community phishing feed", "licence": "non-commercial"},
            {"name": "Phishing.Database", "url": "https://github.com/Phishing-Database/Phishing.Database", "cat": "phish", "what": "new phishing links", "licence": "MIT"},
            {"name": "Feodo Tracker", "url": "https://feodotracker.abuse.ch/", "cat": "c2", "what": "botnet C2 servers", "licence": "CC0"},

            {"name": "ransomware.live", "url": "https://www.ransomware.live/", "cat": "ransom", "what": "leak-site claims (group, country, time)"},
            {"name": "CISA KEV", "url": "https://www.cisa.gov/known-exploited-vulnerabilities-catalog", "cat": "cve", "what": "known exploited vulnerabilities"},
            {"name": "NVD", "url": "https://nvd.nist.gov/", "cat": "cve", "what": "critical CVEs published in the last 48h"},
            {"name": "Tor Project", "url": "https://check.torproject.org/torbulkexitlist", "cat": "ctx", "what": "Tor exit relays (context)"},
            {"name": "DB-IP", "url": "https://db-ip.com", "cat": "ctx", "what": "IP to country", "licence": "CC BY 4.0"},
        ],
    })
    live_ok = [k for k in ("blocklist.de", "DShield") if status.get(k) == "ok"]
    if not live_ok:
        raise SystemExit("live scanning feeds failed; keeping the previous live_map.json")
    tmp = out + ".tmp"
    with open(tmp, "w") as f:
        json.dump(doc, f, separators=(",", ":"))
    os.replace(tmp, out)
    print(f"live_map: {len(countries)} countries, {len(mixed)} ticker items, status {status}")


if __name__ == "__main__":
    main()

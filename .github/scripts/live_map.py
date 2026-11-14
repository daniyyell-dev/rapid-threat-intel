#!/usr/bin/env python3
"""Build site/live_map.json for the IOCWatch live attack map.

Keyless public feeds only, fetched at build time (nothing runs in the browser
except reading the JSON):
  - blocklist.de  attacker IPs reported in the last hour, per service
  - SANS ISC / DShield  top attacking IPs seen by its sensors today
  - abuse.ch Feodo Tracker  botnet C2 servers (country included)
  - CISA KEV  newest known exploited vulnerabilities (ticker only)
IP to country uses the DB-IP "IP to Country Lite" database (CC BY 4.0).
Only country-level aggregates are published, never individual IPs.

Usage: live_map.py OUT.json [--dbip PATH_TO_CSV_GZ]
"""
import bisect, csv, datetime as dt, gzip, io, ipaddress, json, os, sys, time, urllib.request

UA = "IOCWatch live map (+https://iocwatch.com; github.com/daniyyell-dev/rapid-threat-intel)"
NOW = dt.datetime.now(dt.timezone.utc)
SERVICES = [  # blocklist.de service -> label shown on the map
    ("ssh", "SSH brute force"), ("mail", "Mail server attack"), ("imap", "IMAP/POP3 login attack"),
    ("apache", "Web server attack"), ("bruteforcelogin", "Web login brute force"), ("sip", "VoIP (SIP) scan"),
    ("bots", "Spam bot"), ("ftp", "FTP brute force"),
]
BINS = [300, 900, 1800, 3600]  # seconds; each IP gets the newest bin it appears in


def get(url, timeout=60):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    for i in range(3):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except Exception as e:
            err = e
            time.sleep(2 + i * 3)
    raise err


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
            data = get(f"https://download.db-ip.com/free/dbip-country-lite-{m}.csv.gz", 120)
            open(path, "wb").write(data)
            return path
        except Exception:
            continue
    raise SystemExit("DB-IP download failed")


def kev_what(x):
    v, p = (x.get("vendorProject") or "").strip(), (x.get("product") or "").strip()
    return p if p.lower().startswith(v.lower()) else f"{v} {p}".strip()


def main():
    out = sys.argv[1]
    dbarg = sys.argv[sys.argv.index("--dbip") + 1] if "--dbip" in sys.argv else None
    geo = Geo(dbip_path(dbarg))
    countries, events, status = {}, [], {}

    def ctry(cc):
        return countries.setdefault(cc, {"cc": cc, "ips": 0, "dshield": 0, "c2": 0, "kinds": {}, "age": 99})

    # blocklist.de: newest bin per IP per service
    seen_ip = set(); bl_total = 0
    try:
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
                a = agg.setdefault(cc, [0, 99]); a[0] += 1; a[1] = min(a[1], sec // 60)
                if ip not in seen_ip:
                    seen_ip.add(ip); c = ctry(cc); c["ips"] += 1
                c = ctry(cc); c["kinds"][label] = c["kinds"].get(label, 0) + 1; c["age"] = min(c["age"], sec // 60)
            bl_total += len(first)
            for cc, (n, age) in agg.items():
                events.append({"cc": cc, "kind": label, "n": n, "unit": "IP" if n == 1 else "IPs", "age_min": age, "src": "blocklist"})
        status["blocklist"] = "ok"
    except Exception as e:
        status["blocklist"] = "error: " + type(e).__name__

    # SANS ISC / DShield top attacking IPs today (reports, targets)
    ds_reports = 0
    try:
        rows = json.loads(get("https://isc.sans.edu/api/topips/records/200?json"))
        agg = {}
        for r in rows:
            cc = geo.cc(r.get("source", ""))
            if not cc:
                continue
            n = int(r.get("reports") or 0); ds_reports += n
            c = ctry(cc); c["dshield"] += n
            a = agg.setdefault(cc, [0, 0]); a[0] += 1; a[1] = max(a[1], int(r.get("targets") or 0))
        for cc, (n, tmax) in agg.items():
            events.append({"cc": cc, "kind": "Scanner hitting DShield sensors", "n": n, "unit": "IP" if n == 1 else "IPs",
                           "targets": tmax, "age_min": None, "src": "dshield"})
        status["dshield"] = "ok"
    except Exception as e:
        status["dshield"] = "error: " + type(e).__name__

    # Feodo Tracker: C2 servers seen online in the last 30 days
    try:
        cut = (NOW - dt.timedelta(days=30)).date().isoformat()
        for r in json.loads(get("https://feodotracker.abuse.ch/downloads/ipblocklist.json")):
            cc = r.get("country")
            if not cc or (r.get("last_online") or "") < cut:
                continue
            ctry(cc)["c2"] += 1
            events.append({"cc": cc, "kind": f"{r.get('malware', 'Botnet')} C2 server", "n": 1, "unit": "server",
                           "age_min": None, "day": r.get("last_online"), "src": "feodo"})
        status["feodo"] = "ok"
    except Exception as e:
        status["feodo"] = "error: " + type(e).__name__

    # CISA KEV: newest three
    kev = []
    try:
        v = json.loads(get("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json", 90))["vulnerabilities"]
        v.sort(key=lambda x: x.get("dateAdded", ""), reverse=True)
        kev = [{"cve": x["cveID"], "what": kev_what(x), "day": x.get("dateAdded")} for x in v[:3]]
        status["kev"] = "ok"
    except Exception as e:
        status["kev"] = "error: " + type(e).__name__

    for c in countries.values():
        c["top"] = max(c["kinds"], key=c["kinds"].get) if c["kinds"] else ("Botnet C2" if c["c2"] else "Scanning")
        c["kinds"] = dict(sorted(c["kinds"].items(), key=lambda x: -x[1])[:3])
        if c["age"] == 99:
            c["age"] = None
    clist = sorted(countries.values(), key=lambda c: -(c["ips"] + c["dshield"] / 500 + c["c2"] * 5))
    # Ticker: freshest blocklist events first (bigger first within a bin), then DShield and C2
    bl = sorted([e for e in events if e["src"] == "blocklist"], key=lambda e: (e["age_min"], -e["n"]))
    other = sorted([e for e in events if e["src"] != "blocklist"], key=lambda e: -e.get("targets", 0) - e["n"])
    ticker = bl[:24] + other[:8]
    doc = {
        "updated": NOW.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "window_min": 60,
        "totals": {"attacker_ips_hour": len(seen_ip), "countries": len(clist), "dshield_reports_today": ds_reports},
        "countries": clist[:120],
        "ticker": ticker,
        "kev": kev,
        "status": status,
        "sources": [
            {"name": "blocklist.de", "url": "https://www.blocklist.de/en/index.html", "what": "attacker IPs reported in the last hour"},
            {"name": "SANS ISC DShield", "url": "https://isc.sans.edu/", "what": "top attacking IPs seen by its sensors today", "licence": "CC BY-NC-SA 4.0"},
            {"name": "abuse.ch Feodo Tracker", "url": "https://feodotracker.abuse.ch/", "what": "botnet C2 servers", "licence": "CC0"},
            {"name": "CISA KEV", "url": "https://www.cisa.gov/known-exploited-vulnerabilities-catalog", "what": "newly exploited vulnerabilities"},
            {"name": "DB-IP", "url": "https://db-ip.com", "what": "IP to country", "licence": "CC BY 4.0"},
        ],
    }
    if not any(v == "ok" for k, v in status.items() if k != "kev"):
        raise SystemExit("all attack feeds failed; keeping the previous live_map.json")
    tmp = out + ".tmp"
    with open(tmp, "w") as f:
        json.dump(doc, f, separators=(",", ":"))
    os.replace(tmp, out)
    print(f"live_map: {len(seen_ip)} IPs/hour, {len(clist)} countries, {len(ticker)} ticker items, status {status}")


if __name__ == "__main__":
    main()

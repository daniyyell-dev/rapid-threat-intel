(function () {
  "use strict";

  window.goatcounter = window.goatcounter || {};
  window.goatcounter.path = window.goatcounter.path || function () {
    return location.pathname + (location.hash || "");
  };

  var DATA = null;
  var RUMOURS = { rumours: [], disclaimer: "Early reports, no IOCs yet. Not on the block list." };
  var ALL_IND = [];
  var TYPE_LABEL = {
    ipv4: "IPv4", ipv6: "IPv6", domain: "Domain", url: "URL", sha256: "SHA256", sha1: "SHA1", md5: "MD5", filename: "File name",
    email: "Email", eth_address: "Ethereum/Polygon address", ssh_pubkey: "SSH public key", session_id: "Session ID",
    function_selector: "Function selector", xmr_address: "Monero address", other: "Other"
  };
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  function $(id) { return document.getElementById(id); }
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k) || attrs[k] == null || attrs[k] === false) continue;
        if (k === "text") el.textContent = attrs[k];
        else if (k === "class") el.className = attrs[k];
        else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), attrs[k]);
        else el.setAttribute(k, attrs[k]);
      }
    }
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { add(el, x); }); return; }
    el.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }
  function typeLabel(t) { return TYPE_LABEL[t] || t; }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  function fmtDay(d) {
    var p = (d || "").split(" ")[0].split("-");
    if (p.length !== 3) return d || "";
    return parseInt(p[2], 10) + " " + MONTHS[parseInt(p[1], 10) - 1].slice(0, 3) + " " + p[0];
  }
  function timeOf(d) { return (d || "").split(" ")[1] || ""; }
  function fmtAdded(d) { var t = timeOf(d); return fmtDay(d) + (t ? ", " + t + " UK" : ""); }
  function extLink(href, content, cls) {
    return h("a", { href: href, class: cls || null, rel: "noopener noreferrer", target: "_blank" }, content);
  }
  function tg(t) { var x = t.targets || {}; return { countries: x.countries || [], regions: x.regions || [], sectors: x.sectors || [], note: x.note || null, source: x.source || null }; }
  function geoKeys(t) {
    var g = tg(t);
    return g.countries.map(function (c) { return "c:" + c.code; }).concat(g.regions.map(function (r) { return "r:" + r; }));
  }
  function srcName(s) { return s.name || s.label || s.url; }
  function srcLine(list, cls, lead) {
    if (!list || !list.length) return null;
    var out = [];
    list.forEach(function (s, i) { if (i) out.push(h("span", { class: "sep", "aria-hidden": "true", text: " \u00b7 " })); out.push(extLink(s.url, srcName(s))); });
    return h("p", { class: cls || "srcline" }, h("span", { class: "sl", text: lead || (list.length === 1 ? "Source " : "Sources ") }), out);
  }
  function countryTag(c) { return h("span", { class: "ctry", title: c.name }, h("b", { text: c.code }), " " + c.name); }
  function typesOf(t) {
    return Object.keys(t.indicator_counts).sort(function (a, b) { return t.indicator_counts[b] - t.indicator_counts[a] || a.localeCompare(b); });
  }

  /* Defanging: indicators are never rendered as links, and network values are shown defanged. */
  var HOSTLIKE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/i;
  function defangHost(s) { return s.replace(/\./g, "[.]"); }
  function defang(v, type) {
    if (type === "url") {
      var m = /^([a-z][a-z0-9+.-]*):\/\/([^\/?#]*)(.*)$/i.exec(v);
      if (!m) return v;
      var scheme = m[1].toLowerCase().replace(/^http/, "hxxp").replace(/^ftp/, "fxp");
      return scheme + "://" + defangHost(m[2]) + m[3];
    }
    if (type === "ipv4" || type === "domain") return defangHost(v);
    if (type === "email") return v.replace("@", "[@]").replace(/\./g, "[.]");
    if (type === "other" && HOSTLIKE.test(v)) return defangHost(v);
    return v;
  }
  function refang(s) {
    return s.trim()
      .replace(/\[(\.|dot)\]|\((\.|dot)\)|\{(\.|dot)\}/gi, ".")
      .replace(/\[:\/\/\]/g, "://").replace(/\[:\]/g, ":").replace(/\[@\]|\[at\]/gi, "@")
      .replace(/^hxxp/i, "http").replace(/^fxp/i, "ftp")
      .replace(/^["'<\s]+|["'>\s]+$/g, "");
  }
  function urlKey(s) { return s.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "").replace(/\/+$/, "").toLowerCase(); }
  function hostOf(s) {
    var m = /^[a-z][a-z0-9+.-]*:\/\/([^\/?#:]+)/i.exec(s);
    return m ? m[1].toLowerCase() : "";
  }

  var toastTimer;
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 1800);
  }
  function shareUrl(id) {
    var path = (location.pathname || "/").replace(/\/t\/[^/]+\/?$/, "/");
    if (path.charAt(0) !== "/") path = "/" + path;
    if (path.charAt(path.length - 1) !== "/") path += "/";
    return location.origin + path + "t/" + encodeURIComponent(id) + "/";
  }
  function copyText(text, btn, msg) {
    function mark(ok) {
      if (!btn) return;
      if (btn.querySelector("svg")) {
        var prevA = btn.getAttribute("aria-label") || "";
        btn.classList.toggle("done", ok);
        btn.classList.toggle("fail", !ok);
        if (ok) btn.setAttribute("aria-label", msg || "Copied");
        setTimeout(function () {
          btn.classList.remove("done", "fail");
          if (prevA) btn.setAttribute("aria-label", prevA);
        }, 1400);
        return;
      }
      if (!ok) return;
      var prev = btn.getAttribute("data-label") || btn.textContent;
      btn.setAttribute("data-label", prev);
      btn.textContent = "Copied"; btn.classList.add("done");
      setTimeout(function () { btn.textContent = prev; btn.classList.remove("done"); }, 1400);
    }
    function done(ok) {
      toast(ok ? (msg || "Copied the real value") : "Copy failed");
      mark(ok);
    }
    function fallback() {
      var ta = h("textarea", { readonly: "", class: "offscreen" });
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    } else fallback();
  }
  function iocCell(ind) {
    var b = h("button", { type: "button", class: "copy", title: "Copy the real (not defanged) value", "aria-label": "Copy indicator " + defang(ind.value, ind.type) }, "Copy");
    b.addEventListener("click", function () { copyText(ind.value, b); trackClick("copy"); });
    return h("div", { class: "ioc" }, h("code", { text: defang(ind.value, ind.type) }), b);
  }
  function actionPill(a) { return h("span", { class: "pill " + a, text: a }); }
  function confMeter(c) { return h("span", { class: "conf " + c, title: c + " confidence" }, h("i", { "aria-hidden": "true" }, h("b")), c); }
  function typeTag(t) { return h("span", { class: "ty t-" + t, text: typeLabel(t) }); }

  /* Downloads: fetched and saved as a file; if that fails, the raw file opens in a new tab. */
  function fileLink(f, primary) {
    var ext = (f.name.split(".").pop() || "").toLowerCase();
    var a = h("a", { class: "dl" + (primary ? " primary" : ""), href: f.url, rel: "noopener noreferrer", target: "_blank", title: "Download " + (f.download || f.name) },
      h("b", { text: f.label }), h("small", { text: f.note || f.name }), h("span", { class: "ext", "aria-hidden": "true", text: ext }));
    return saveOnClick(a, f);
  }
  // Downloads and copies: every click is counted by the stats endpoint (/hit) with just its kind
  // ("download" or "copy") and this page's random id. No file name, indicator or query text is sent.
  // The shown figure goes up at once, then the endpoint's reply sets the real totals.
  var PAGE_ID = "";
  function pageId() {
    if (PAGE_ID) return PAGE_ID;
    try {
      var rnd = new Uint8Array(16); crypto.getRandomValues(rnd);
      PAGE_ID = Array.prototype.map.call(rnd, function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
    } catch (e) {
      for (var i = 0; i < 32; i++) PAGE_ID += Math.floor(Math.random() * 16).toString(16);
    }
    return PAGE_ID;
  }
  var CLICKS = null;   // last totals: {downloads, downloads24h, copies, copies24h}
  function showClicks(c) {
    if (!c) return;
    CLICKS = c;
    var dl = toCount(c.downloads), cp = toCount(c.copies);
    if (dl != null) {
      $("visits-dl-n").textContent = fmtVisitors(dl);
      $("visits-dl-24").textContent = toCount(c.downloads24h) ? "+" + fmtVisitors(toCount(c.downloads24h)) + " in 24h" : "";
      $("visits-dl").hidden = false;
    }
    if (cp != null) {
      $("visits-cp-n").textContent = fmtVisitors(cp);
      $("visits-cp-24").textContent = toCount(c.copies24h) ? "+" + fmtVisitors(toCount(c.copies24h)) + " in 24h" : "";
      $("visits-cp").hidden = false;
    }
  }
  function trackClick(kind) {
    var box = $("visits"), live = box && box.getAttribute("data-live");
    if (CLICKS) {
      var k = kind === "download" ? "downloads" : "copies", c = {};
      for (var x in CLICKS) c[x] = CLICKS[x];
      c[k] = (toCount(c[k]) || 0) + 1; c[k + "24h"] = (toCount(c[k + "24h"]) || 0) + 1;
      showClicks(c);
    }
    if (!live || !window.fetch) return;
    try {
      fetch(live.replace(/\/?$/, "/") + "hit", { method: "POST", body: pageId() + " " + kind, keepalive: true,
        headers: { "Content-Type": "text/plain" }, cache: "no-store", credentials: "omit" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { if (j && j.downloads != null) showClicks(j); }, function () {});
    } catch (e) {}
  }
  function trackDownload() { trackClick("download"); }
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest("a[data-dl]");
    if (a) trackDownload(a.getAttribute("data-dl"));
  });
  function saveOnClick(a, f) {
    a.addEventListener("click", function (e) {
      trackDownload();
      if (!window.fetch || !window.URL || !URL.createObjectURL) return;
      e.preventDefault();
      a.classList.add("busy");
      fetch(f.url, { cache: "no-store" }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.blob();
      }).then(function (b) {
        var u = URL.createObjectURL(b);
        var x = h("a", { href: u, download: f.download || f.name });
        document.body.appendChild(x); x.click(); document.body.removeChild(x);
        setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
        toast("Downloaded " + (f.download || f.name));
      }).catch(function () { window.open(f.url, "_blank", "noopener"); })
        .then(function () { a.classList.remove("busy"); });
    });
    return a;
  }
  function fileList(files) {
    return h("ul", { class: "dl-list" }, files.map(function (f, i) { return h("li", null, fileLink(f, i === 0)); }));
  }

  /* Home */
  function fmtNum(n) {
    n = Math.round(n);
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function countUp(el, target, duration) {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !target) { el.textContent = fmtNum(target); return; }
    var start = performance.now();
    function frame(now) {
      var p = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmtNum(target * eased);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  /* Times in the feed are UK wall-clock ("YYYY-MM-DD HH:MM"); turn them into real instants. */
  var UK_PARTS = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  function ukOffsetMin(ms) {
    var p = {}; UK_PARTS.formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value; });
    return (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - Math.floor(ms / 60000) * 60000) / 60000;
  }
  function ukTime(d) {
    var m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(d || "");
    if (!m) return null;
    var guess = Date.UTC(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 12, m[5] ? +m[5] : 0);
    return { ms: guess - ukOffsetMin(guess) * 60000, timed: !!m[4] };
  }
  function ago(d) {
    var t = ukTime(d);
    if (!t) return "";
    var s = Math.max(0, (Date.now() - t.ms) / 1000);
    if (!t.timed) return s < 86400 ? "today" : s < 172800 ? "yesterday" : Math.floor(s / 86400) + "d ago";
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + "m ago";
    if (s < 86400) return Math.floor(s / 3600) + "h ago";
    if (s < 172800) return "yesterday";
    return Math.floor(s / 86400) + "d ago";
  }
  function isFresh(d, hours) { var t = ukTime(d); return !!(t && t.timed && Date.now() - t.ms < hours * 3600000); }
  /* Short heading (2-5 words) for tight spots: ticker, product window, compact catalogues. */
  function stitle(t) {
    if (t.short_title) return t.short_title;
    var w = String(t.short || t.name).split(/[:(\u2013\u2014]\s?| - /)[0].split(/\s+/);
    return w.slice(0, 4).join(" ");
  }
  /* Newsy 6-12 word headline for lists and the threat page title. */
  function headlineOf(t) {
    return t.news_headline || t.headline || stitle(t);
  }
  var SRC_SKIP = /^(threatfox|malwarebazaar|urlhaus|loldrivers\.io|ransomware\.live|github\.com|spamhaus|reddit r\/msp)$/i;
  function cleanOrg(s) {
    return String(srcName(s) || "").replace(/\s+\(\d+\)\s*$/, "").trim();
  }
  function sourceOrgList(t, limit) {
    var primary = [], skipped = [], seen = {};
    function take(arr, n, url) {
      var k = n.toLowerCase();
      if (!n || seen[k]) return;
      seen[k] = 1;
      arr.push({ name: n, url: url || "" });
    }
    (t.sources || []).forEach(function (src) {
      var n = cleanOrg(src);
      if (!n) return;
      if (SRC_SKIP.test(n)) take(skipped, n, src.url);
      else take(primary, n, src.url);
    });
    return (primary.length ? primary : skipped).slice(0, limit || 3);
  }
  function joinNames(names) {
    if (!names.length) return "";
    if (names.length === 1) return names[0];
    if (names.length === 2) return names[0] + " and " + names[1];
    return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
  }
  function reportedByText(t) {
    var orgs = sourceOrgList(t, 3).map(function (o) { return o.name; });
    return orgs.length ? "Reported by " + joinNames(orgs) : "";
  }
  function reportedByLine(t, cls) {
    var orgs = sourceOrgList(t, 3);
    if (!orgs.length) return null;
    var nodes = ["Reported by "];
    orgs.forEach(function (o, i) {
      if (i) nodes.push(i === orgs.length - 1 ? " and " : ", ");
      nodes.push(o.url ? extLink(o.url, o.name) : o.name);
    });
    return h("p", { class: cls || "det-by" }, nodes);
  }
  function urgClass(tag) {
    return "tr-urg urg-" + String(tag || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
  function urgencyTags(t) {
    var cat = String(t.category || "").toLowerCase();
    var name = String(t.name || "").toLowerCase();
    var body = [t.name, t.headline, t.news_headline, t.summary, t.caveat, JSON.stringify(t.targets || {})].join(" ").toLowerCase();
    var sectors = (((t.targets || {}).sectors) || []).join(" ").toLowerCase();
    var countries = (((t.targets || {}).countries) || []).map(function (c) {
      return String((c && (c.code || c.name)) || c).toUpperCase();
    });
    var out = [];
    function add(tag) { if (out.indexOf(tag) === -1) out.push(tag); }
    var active = /\b(known exploited vulnerabilities|exploitation detected|in the wild|actively exploited|active exploitation|being exploited|was exploited|were exploited|exploited to |exploited at |exploited against|\bexploited\b|exploitation of|reported exploitation|exploitation that|widespread malicious activity|active campaign)\b/.test(body)
      || /\bused\b[\s\S]{0,60}\bexploit(s|ed|ing)?\b/.test(body)
      || (/\bkev\b/.test(body) && /cisa/.test(body))
      || (/\bexploitation\b/.test(cat) && /\b(compromised servers|xmrig|gain(?:ed)? root|full chain)\b/.test(body));
    if (active) add("Actively exploited");
    if (/\bnation-state\b/.test(cat) || /(^|[\s/])apt([\s/]|$)/.test(cat) || /\bespionage\b/.test(cat)) add("Nation-state");
    if (/\bransomware\b/.test(cat) || /\bransomware\b/.test(name)) add("Ransomware");
    if (/\bsupply chain\b/.test(cat)) add("Supply chain");
    if (/cvss 9(\.\d)?/.test(body) || /\bcritical (unauthenticated |authentication |auth )?(flaw|vulnerability|rce|bypass|zero-day|0-day)\b/.test(body)) add("Critical flaw");
    if (/\b(financial services|finance|banking|banks|securities and financial)\b/.test(sectors) || /\bfinancial sector\b/.test(cat)) add("Hits finance");
    if (countries.indexOf("GB") !== -1 || countries.indexOf("UNITED KINGDOM") !== -1) add("Hits UK");
    return out.slice(0, 2);
  }
  function urgNodes(tags) {
    return (tags || []).map(function (tag) { return h("span", { class: urgClass(tag), text: tag }); });
  }

  function huntOf(t) { return t.hunt_count != null ? t.hunt_count : Math.max(0, t.indicator_count - t.block_now_count); }
  /* Live activity: the most recently added threats, by their real entry time. Nothing is invented:
     each row is a real entry, and only entries added in the last few hours pulse. */
  var LIVE_N = 5, SEEN = null;
  function byEntry() {
    return DATA.threats.slice().sort(function (a, b) {
      var x = ukTime(a.entry_date), y = ukTime(b.entry_date);
      return ((y && y.ms) || 0) - ((x && x.ms) || 0) || b.seq - a.seq;
    });
  }
  function renderLive() {
    var el = $("live-list");
    if (!el || !DATA) return;
    var list = byEntry().slice(0, LIVE_N), first = SEEN === null;
    var prev = SEEN || {};
    SEEN = {};
    clear(el);
    list.forEach(function (t) {
      SEEN[t.id] = 1;
      var hunt = huntOf(t), fresh = isFresh(t.entry_date, 6), added = !first && !prev[t.id];
      var parts = [];
      if (t.block_now_count) parts.push(h("span", { class: "lv-b", text: t.block_now_count + " to block" }));
      if (hunt) parts.push(h("span", { class: "lv-h", text: hunt + " to hunt" }));
      if (t.ioa_count) parts.push(h("span", { text: plural(t.ioa_count, "behaviour") }));
      el.appendChild(h("li", { class: "lv" + (fresh ? " is-fresh" : "") + (added ? " is-new" : "") },
        h("a", { href: "#threat/" + encodeURIComponent(t.id) },
          h("span", { class: "lv-dot", "aria-hidden": "true" }),
          h("span", { class: "lv-kind", text: "New threat" }),
          h("span", { class: "lv-name", text: stitle(t), title: t.name }),
          h("span", { class: "lv-stats" }, plural(t.indicator_count, "indicator"), parts.length ? " \u00b7 " : null, parts.map(function (p, i) { return [i ? " \u00b7 " : null, p]; })),
          h("time", { class: "lv-ago", datetime: t.entry_date.replace(" ", "T"), title: fmtAdded(t.entry_date), "data-d": t.entry_date, text: ago(t.entry_date) }))));
    });
  }
  function tickAgo() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-d]"), function (x) { x.textContent = ago(x.getAttribute("data-d")); });
    if (DATA) renderEyebrow();
  }
  function renderEyebrow() {
    var el = $("eyebrow"), t = DATA && byEntry()[0];
    if (!el || !t) return;
    el.setAttribute("href", "#threat/" + encodeURIComponent(t.id));
    $("eyebrow-t").textContent = stitle(t) + " \u00b7 " + ago(t.entry_date);
  }
  function renderLatest() {
    var el = $("latest");
    if (!el) return;
    clear(el);
    var newest = DATA.threats[0].entry_date.split(" ")[0];
    DATA.threats.slice(0, 8).forEach(function (t) { el.appendChild(row(t, newest)); });
    if ($("latest-n")) $("latest-n").textContent = String(DATA.threat_count);
  }
  function renderStats() {
    var s = $("stats");
    if (s) {
      clear(s);
      function stat(n, label, cls) {
        var b = h("b", { class: cls || null, text: "0" });
        countUp({ set textContent(v) { b.textContent = v; } }, n, 900);
        return h("span", { class: "st" }, b, " " + label);
      }
      add(s, [stat(DATA.threat_count, "threats"), stat(DATA.indicator_count, "indicators"), stat(DATA.block_now_count, "to block now", "hot"),
        h("span", { class: "st" }, "Updated ", h("time", { "data-d": DATA.last_updated, title: fmtAdded(DATA.last_updated), text: ago(DATA.last_updated) }))]);
    }
    var pt = $("pulse-t");
    if (pt) { clear(pt); add(pt, ["Last entry ", h("time", { "data-d": DATA.last_updated, text: ago(DATA.last_updated) })]); }
    renderEyebrow();
    renderLive();
    renderLatest();
    renderShowcase();
  }
  function fillFilters() {
    var cats = {}, types = {}, days = {}, geo = {}, geoName = {}, secs = {};
    DATA.threats.forEach(function (t) {
      cats[t.category] = (cats[t.category] || 0) + 1;
      var g = tg(t);
      g.countries.forEach(function (c) { geo["c:" + c.code] = (geo["c:" + c.code] || 0) + 1; geoName["c:" + c.code] = c.name + " (" + c.code + ")"; });
      g.regions.forEach(function (r) { geo["r:" + r] = (geo["r:" + r] || 0) + 1; geoName["r:" + r] = r; });
      g.sectors.forEach(function (x) { secs[x] = (secs[x] || 0) + 1; });
      Object.keys(t.indicator_counts).forEach(function (k) { types[k] = (types[k] || 0) + 1; });
      var d = t.entry_date.split(" ")[0];
      days[d] = (days[d] || 0) + 1;
    });
    var fc = $("f-cat");
    Object.keys(cats).sort().forEach(function (c) { fc.appendChild(h("option", { value: c }, c + " (" + cats[c] + ")")); });
    var ft = $("f-type");
    Object.keys(types).sort(function (a, b) { return types[b] - types[a] || a.localeCompare(b); })
      .forEach(function (t) { ft.appendChild(h("option", { value: t }, typeLabel(t) + " (" + types[t] + ")")); });
    var fg = $("f-country"), og1 = h("optgroup", { label: "Countries" }), og2 = h("optgroup", { label: "Regions" });
    Object.keys(geo).sort(function (a, b) { return geo[b] - geo[a] || geoName[a].localeCompare(geoName[b]); }).forEach(function (k) {
      (k.charAt(0) === "c" ? og1 : og2).appendChild(h("option", { value: k }, geoName[k] + " (" + geo[k] + ")"));
    });
    if (og1.firstChild) fg.appendChild(og1);
    if (og2.firstChild) fg.appendChild(og2);
    fg.appendChild(h("option", { value: "none" }, "Not stated (" + DATA.threats.filter(function (t) { return !geoKeys(t).length; }).length + ")"));
    var fs = $("f-sector");
    Object.keys(secs).sort(function (a, b) { return secs[b] - secs[a] || a.localeCompare(b); }).forEach(function (x) { fs.appendChild(h("option", { value: x }, x + " (" + secs[x] + ")")); });
    fs.appendChild(h("option", { value: "none" }, "Not stated (" + DATA.threats.filter(function (t) { return !tg(t).sectors.length; }).length + ")"));
    renderGeo(geo, geoName);
    var fd = $("f-date"), groups = {};
    Object.keys(days).sort().reverse().forEach(function (d) {
      var mk = d.slice(0, 7);
      if (!groups[mk]) {
        groups[mk] = h("optgroup", { label: MONTHS[parseInt(d.slice(5, 7), 10) - 1] + " " + d.slice(0, 4) });
        fd.appendChild(groups[mk]);
      }
      groups[mk].appendChild(h("option", { value: d }, fmtDay(d) + " (" + days[d] + ")"));
    });
    [fc, ft, fd, fg, fs].forEach(function (el) { el.addEventListener("change", renderFeed); });
    $("f-reset").addEventListener("click", resetFilters);
  }
  function resetFilters() { ["f-cat", "f-type", "f-date", "f-country", "f-sector"].forEach(function (id) { $(id).value = ""; }); renderFeed(); }
  function renderGeo(geo, geoName) {
    var list = clear($("geo-list")), keys = Object.keys(geo).filter(function (k) { return k.charAt(0) === "c"; })
      .sort(function (a, b) { return geo[b] - geo[a] || geoName[a].localeCompare(geoName[b]); });
    var max = keys.length ? geo[keys[0]] : 1;
    keys.forEach(function (k) {
      var bar = h("i", { "aria-hidden": "true" });
      bar.style.width = Math.max(8, Math.round(geo[k] / max * 100)) + "%";
      list.appendChild(h("li", null, h("button", { type: "button", class: "geo-btn", "data-k": k, "aria-pressed": "false", onclick: function () { pickGeo(k); } },
        h("span", { class: "geo-c", text: k.slice(2) }), h("span", { class: "geo-n", text: geoName[k].replace(/ \([A-Z]{2}\)$/, "") }),
        h("span", { class: "geo-v", text: String(geo[k]) }), h("span", { class: "geo-bar" }, bar))));
    });
    var rg = clear($("geo-regions")), regs = Object.keys(geo).filter(function (k) { return k.charAt(0) === "r"; }).sort(function (a, b) { return geo[b] - geo[a] || a.localeCompare(b); });
    if (regs.length) {
      rg.appendChild(h("span", { class: "geo-rl", text: "By region: " }));
      regs.forEach(function (k, i) {
        if (i) rg.appendChild(document.createTextNode(", "));
        rg.appendChild(h("button", { type: "button", class: "link-btn geo-btn", "data-k": k, "aria-pressed": "false", onclick: function () { pickGeo(k); } }, k.slice(2) + " " + geo[k]));
      });
    }
  }
  function pickGeo(k) {
    var f = $("f-country");
    f.value = f.value === k ? "" : k;
    renderFeed();
    window.scrollTo(0, 0);
  }
  /* Behaviours (IOAs): shown first on the feed card when a threat has no network or hash indicators. */
  var NET_TYPES = ["ipv4", "domain", "url", "sha256", "sha1"];
  function behaviourFirst(t) {
    return !!t.ioa_count && !NET_TYPES.some(function (k) { return t.indicator_counts[k]; });
  }

  /* Highlight IOCs and other actionable values in card text. Links, Copy and Download
     controls are left alone (this only wraps plain-text leaves). Patterns that must
     stay case-sensitive (AWS API names) are kept off the /i flag so words such as
     "listed" or "confirmed" are not marked. */
  var IOC_PATTERNS = [
    /(?:hxxps?|https?|fxps?|ftps?):\/\/[^\s,;<>]+/gi,
    /CVE-\d{4}-\d{4,}/gi,
    /\b\d{1,3}(?:\[\.\]|\(\.\)|\.)\d{1,3}(?:\[\.\]|\(\.\)|\.)\d{1,3}(?:\[\.\]|\(\.\)|\.)\d{1,3}\b/g,
    /\b[a-fA-F0-9]{64}\b/g,
    /\b[a-fA-F0-9]{40}\b/g,
    /\b[a-fA-F0-9]{32}\b/g,
    /%[A-Za-z0-9_]+%(?:\\[\w .#*-]+)*/g,
    /(?:HK(?:LM|CU|CR|CC|U)|HKEY_[A-Z_]+)\\[^\s,;]+/g,
    /(?:[A-Za-z]:|\\\\)\\[^\s,;]+/g,
    /\/(?:etc|var|tmp|usr|opt|home|root|dev|proc|rest)(?:\/[^\s,;:]+)+/g,
    /\/\.[A-Za-z0-9_-]+/g,
    /\b[\w.+#-]+\.(?:exe|dll|sys|ps1|bat|cmd|aspx|ashx|php|jsp|jar|vbs|vbe|scr|msi|lnk|hta|wsf|so|dylib|sh|py|json|config|conf|yml|yaml)\b/gi,
    /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\[\.])+[a-z]{2,24}\b/gi,
    /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|net|org|io|dev|gov|edu|info|biz|ru|cn|uk|us|de|fr|app|xyz|top|pro|co|in|au|ca|nl|jp|br|pl|eu|cloud|local|internal|onion|gg|me|cc|tv|to|ai|sh|rs|se|ch|at|be|it|es|pt|cz|sk|hu|ro|bg|ua|by|kz|tr|ir|il|sa|ae|za|nz|mx|ar|cl|pe|id|th|vn|ph|my|sg|hk|tw|kr|tech|online|site|store|club|live|news|media|security|systems|network|digital|email|support|services|agency|solutions|software|host|hosting|server|cfd|sbs|shop|fun|icu|cyou|bond|click|link|pw)\b/gi,
    /\b(?:TCP|UDP|ports?)\s+\d{2,5}(?:(?:\s*,\s*|\s+and\s+|\s+or\s+)\d{2,5})*/gi,
    /\b[a-p]{32}\b/g,
    /\bauthenticationToken=\S+/g,
    /\b(?:Create|Describe|Get|List|Put|Delete|Invoke|Update|Assume|Pass|Confirm|Subscribe)[A-Z][A-Za-z0-9]+\b/g,
    /\b[A-Z][A-Z0-9]*_[A-Za-z0-9_]{2,}\b/g,
    /"[^"\n]{3,80}"/g,
    /\bPowerShell\b/gi
  ];
  function highlightIocs(text) {
    if (text == null || text === "") return text == null ? text : text;
    var s = String(text), marks = [];
    IOC_PATTERNS.forEach(function (pat) {
      var re = new RegExp(pat.source, pat.flags), m;
      while ((m = re.exec(s))) {
        if (!m[0]) { re.lastIndex++; continue; }
        marks.push({ a: m.index, b: m.index + m[0].length, t: m[0] });
      }
    });
    marks.sort(function (x, y) { return x.a - y.a || (y.b - y.a) - (x.b - x.a); });
    var kept = [], end = 0;
    marks.forEach(function (m) {
      if (m.a < end) return;
      kept.push(m);
      end = m.b;
    });
    if (!kept.length) return s;
    var out = [], last = 0;
    kept.forEach(function (m) {
      if (m.a > last) out.push(s.slice(last, m.a));
      out.push(h("span", { class: m.t.length > 28 ? "ioc ioc-long" : "ioc", text: m.t }));
      last = m.b;
    });
    if (last < s.length) out.push(s.slice(last));
    return out;
  }
  function highlightTree(body) {
    if (body == null || body === false) return body;
    if (typeof body === "string" || typeof body === "number") return highlightIocs(String(body));
    if (Array.isArray(body)) return body.map(highlightTree);
    return body;
  }

  function ioaSection(t) {
    if (!t.ioas || !t.ioas.length) return null;
    var multi = t.ioas.some(function (x) { return x.source_url; }) && t.sources.length > 1;
    function line(label, body, cls) { return h("p", { class: "ioa-line" + (cls ? " " + cls : "") }, h("span", { class: "ioa-lab", text: label }), h("span", { class: "ioa-val" }, highlightTree(body))); }
    return h("section", { class: "blk-sec ioa-sec", id: "ioa-sec", "aria-labelledby": "ioa-h" },
      h("h2", { id: "ioa-h" }, "Behaviours to hunt", h("span", { text: String(t.ioas.length) })),
      h("p", { class: "ioa-note", role: "note" }, highlightIocs(t.ioa_note || "")),
      h("ol", { class: "ioa-list" }, t.ioas.map(function (x, i) {
        var qs = x.queries && x.queries.length ? x.queries : (x.has_query ? ["KQL"] : []);
        return h("li", null,
          h("span", { class: "ioa-n", "aria-hidden": "true", text: String(i + 1) }),
          h("div", { class: "ioa-body" },
            h("h3", { class: "ioa-title" }, actionPill(x.action), h("span", { class: "sr", text: ": " }), h("span", { text: x.title || x.artefact })),
            line("Look for", x.artefact, "ioa-art"),
            line("Why it matters", [x.why, multi && x.source_url ? [" ", extLink(x.source_url, x.source_name || x.source_url)] : null], "ioa-why"),
            line("Log source", x.log_source),
            line("Queries", qs.length ? qs.join(" \u00b7 ") : "None yet: check by hand", qs.length ? "ioa-qs" : "ioa-qs none")));
      })));
  }
  /* Hunt: one tab per platform; the query text is fetched from the repository when its tab opens. */
  var QTEXT = {};
  var HOWTO = {
    "Defender XDR": "Defender portal > Hunting > Advanced hunting. Paste and run; it covers the last 30 days.",
    "Splunk": "Search & Reporting. Set the time picker to the last 30 days or more, paste and run. Reads the CIM data models.",
    "Google SecOps": "Detection > Rules & Detections > Rules Editor. Paste, run a Retrohunt over 30 days, then turn on live mode."
  };
  function qText(q) {
    if (QTEXT[q.url]) return QTEXT[q.url];
    QTEXT[q.url] = fetch(q.url, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); });
    QTEXT[q.url].catch(function () { delete QTEXT[q.url]; });
    return QTEXT[q.url];
  }
  function qActions(q, label) {
    var c = h("button", { type: "button", class: "hq-btn", "aria-label": "Copy " + q.name }, "Copy " + q.name);
    c.addEventListener("click", function () {
      qText(q).then(function (x) {
        copyText(x, null, "Copied " + q.name);
        trackClick("copy");
        c.textContent = "Copied"; c.classList.add("done");
        setTimeout(function () { c.textContent = "Copy " + q.name; c.classList.remove("done"); }, 1400);
      }, function () { toast("Could not load " + q.name + ". Use Download."); });
    });
    var d = saveOnClick(h("a", { class: "hq-btn", href: q.url, rel: "noopener noreferrer", target: "_blank", "aria-label": "Download " + q.name }, "Download " + q.name), q);
    return h("div", { class: "hq-act" }, c, h("span", { class: "sep", "aria-hidden": "true", text: "\u00b7" }), d);
  }
  /* Preview: comment lines are dimmed so the query itself stands out. The copied text is the file, unchanged. */
  // Syntax highlighting for the Hunt previews: a small tokenizer per language, rendered as text nodes.
  var HL_KW = {
    kql: "let union where project project-away project-rename summarize extend order sort by asc desc and or not in in~ !in has has_any has_all " +
      "has_cs contains contains_cs startswith endswith matches regex isfuzzy true false join kind on take top distinct materialize " +
      "datatable externaldata with between mv-expand parse print limit lookup invoke evaluate render",
    spl: "search tstats stats eval table rename append appendpipe multisearch where fields rex lookup inputlookup sort dedup eventstats " +
      "streamstats fillnull spath convert head tail return format by as and or not in from like datamodel nodename summariesonly " +
      "allow_old_summaries values count dc min max latest earliest true false",
    yaral: "rule meta events match outcome condition options over and or not nocase in any all if true false null"
  };
  var HL_SET = {};
  Object.keys(HL_KW).forEach(function (k) {
    HL_SET[k] = {};
    HL_KW[k].split(" ").forEach(function (w) { HL_SET[k][w] = 1; });
  });
  var HL_RX = {
    kql: /(\/\/[^\n]*)|(@?"(?:[^"\\\n]|\\.)*"|@?'(?:[^'\\\n]|\\.)*')|(\b\d{1,3}(?:\.\d{1,3}){3}\b|\b\d+(?:\.\d+)?[a-z]?\b)|([A-Za-z_][\w-]*~?)|(!?=~|==|!=|<=|>=|=>|[|=<>!~+*\/%-])/g,
    spl: /(```[\s\S]*?(?:```|$))|("(?:[^"\\]|\\.)*")|(`[^`\n]*`)|(\b\d{1,3}(?:\.\d{1,3}){3}\b|\b\d+(?:\.\d+)?\b)|([A-Za-z_][\w.*:]*)|(!=|==|<=|>=|[|=<>!+*\/%-])/g,
    yaral: /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"|`[^`\n]*`)|(\/(?:\\.|[^\/\\\n])+\/)|(\$\w+|%[\w.]+)|(\.[a-z_][\w]*(?:\.[a-z_][\w]*)*)|(\b\d{1,3}(?:\.\d{1,3}){3}\b|\b\d+(?:\.\d+)?\b)|([A-Za-z_][\w]*)|(!=|<=|>=|[=<>!+*\/%-])/g
  };
  function hlTokens(text, lang) {
    var rx = HL_RX[lang], kw = HL_SET[lang], out = [], last = 0, m, prev = "";
    rx.lastIndex = 0;
    while ((m = rx.exec(text))) {
      if (m.index > last) out.push([null, text.slice(last, m.index)]);
      var t = m[0], cls = null, after = text.slice(rx.lastIndex, rx.lastIndex + 40);
      if (lang === "kql") {
        if (m[1]) cls = "c"; else if (m[2]) cls = "s"; else if (m[3]) cls = "n";
        else if (m[4]) cls = kw[t.toLowerCase()] && !/^\s*\(/.test(after) ? "k" : /^\s*\(/.test(after) ? "f" : /^\s*=(?![=~])/.test(after) ? "v" : null;
        else if (m[5]) cls = t === "|" ? "p" : "o";
      } else if (lang === "spl") {
        if (m[1]) cls = "c"; else if (m[2]) cls = "s"; else if (m[3]) cls = "f"; else if (m[4]) cls = "n";
        else if (m[5]) cls = /^\s*\(/.test(after) ? "f" : kw[t.toLowerCase()] ? "k" : /^\s*!?=(?!=)/.test(after) ? "v" : null;
        else if (m[6]) cls = t === "|" ? "p" : "o";
      } else {
        if (m[1]) cls = "c"; else if (m[2]) cls = "s";
        else if (m[3]) {
          if (/(?:=|,|\(|\bin)\s*$/.test(prev)) cls = "r";
          else { out.push([null, "/"]); rx.lastIndex = m.index + 1; last = rx.lastIndex; prev += "/"; continue; }
        }
        else if (m[4]) cls = "v"; else if (m[5]) cls = "a"; else if (m[6]) cls = "n";
        else if (m[7]) cls = /^\s*\(/.test(after) ? "f" : kw[t] ? "k" : /^\s*=/.test(after) && /^\s*$/.test(text.slice(text.lastIndexOf("\n", m.index) + 1, m.index)) ? "v" : null;
        else if (m[8]) cls = "o";
      }
      out.push([cls, t]);
      prev = (prev + text.slice(last, rx.lastIndex)).slice(-40);
      last = rx.lastIndex;
    }
    if (last < text.length) out.push([null, text.slice(last)]);
    return out;
  }
  function renderCode(code, text, lang) {
    clear(code);
    var l = /^SPL/.test(lang) ? "spl" : /^YARA/.test(lang) ? "yaral" : "kql";
    var frag = document.createDocumentFragment();
    hlTokens(text.replace(/\n$/, ""), l).forEach(function (tk) {
      frag.appendChild(tk[0] ? h("span", { class: "t-" + tk[0], text: tk[1] }) : document.createTextNode(tk[1]));
    });
    code.appendChild(frag);
  }
  function huntSection(t) {
    var qs = (t.queries || []).filter(function (q) { return q && q.url; });
    if (!qs.length) return null;
    var tabs = h("div", { class: "hq-tabs", role: "tablist", "aria-label": "Hunting query platform" });
    var panel = h("div", { class: "hq-panel", role: "tabpanel", id: "hq-panel", tabindex: "0" });
    var btns = [];
    function show(i, focus) {
      var q = qs[i];
      btns.forEach(function (b, j) { b.setAttribute("aria-selected", j === i ? "true" : "false"); b.tabIndex = j === i ? 0 : -1; });
      if (focus) btns[i].focus();
      panel.setAttribute("aria-labelledby", btns[i].id);
      var code = h("code", { text: "Loading " + q.name + "\u2026" });
      clear(panel);
      panel.appendChild(h("p", { class: "hq-meta" }, h("span", { class: "hq-lang", text: q.language }), h("span", { class: "sep", "aria-hidden": "true", text: " \u00b7 " }),
        h("span", { class: "hq-file", text: q.name }), h("span", { class: "sep", "aria-hidden": "true", text: " \u00b7 " }), h("span", { text: HOWTO[q.platform] || "" })));
      panel.appendChild(qActions(q, "Download"));
      panel.appendChild(h("pre", { class: "hq-code", tabindex: "0", "aria-label": q.name + " preview" }, code));
      panel.appendChild(h("p", { class: "hq-hint", text: "These queries can return false positives. Know your environment, check what is normal for you, and confirm a hit is really malicious before acting. Copy and Download give the file exactly as published." }));
      qText(q).then(function (x) { renderCode(code, x, q.language); }, function () { code.textContent = "Preview unavailable here. Use Download to get " + q.name + "."; });
      if (q.alt) {
        panel.appendChild(h("div", { class: "hq-alt" }, h("p", null, h("b", { text: q.alt.label }), h("span", { class: "sep", "aria-hidden": "true", text: " \u00b7 " }),
          h("span", { class: "hq-file", text: q.alt.name }), " uses the rti_* macros from ", extLink(DATA.repository + "/blob/main/all/splunk_macros.conf", "splunk_macros.conf"), "."),
          qActions(q.alt, "Download")));
      }
    }
    qs.forEach(function (q, i) {
      var b = h("button", { type: "button", role: "tab", id: "hq-tab-" + i, class: "hq-tab p-" + q.platform.toLowerCase().replace(/[^a-z]+/g, "-"), "aria-controls": "hq-panel" }, q.platform);
      b.addEventListener("click", function () { show(i); });
      b.addEventListener("keydown", function (e) {
        var k = e.key, n = null;
        if (k === "ArrowRight") n = (i + 1) % qs.length; else if (k === "ArrowLeft") n = (i - 1 + qs.length) % qs.length;
        else if (k === "Home") n = 0; else if (k === "End") n = qs.length - 1;
        if (n !== null) { e.preventDefault(); show(n, true); }
      });
      btns.push(b); tabs.appendChild(b);
    });
    show(0);
    return h("section", { class: "blk-sec hunt-sec", id: "hunt-sec", "aria-labelledby": "hq-h" },
      h("h2", { id: "hq-h" }, "Hunt", h("span", { text: plural(qs.length, "platform") })),
      h("p", { class: "hq-intro" }, "The same hunt for each platform: " + (behaviourFirst(t) ? "the behaviours that map cleanly to log fields (the rest are under More detail)" : "the indicators" + (t.ioa_count ? " and the behaviours that map cleanly to log fields" : "")) +
        ". Run it before you block to find past activity." + (t.ioa_count ? " Behaviour hits are leads, not proof." : "")),
      tabs, panel);
  }

  function catKind(cat) {
    var c = (cat || "").toLowerCase();
    if (/ransom|encrypt|wipe/.test(c)) return "lock";
    if (/supply|vendor|msp|chain/.test(c)) return "link";
    if (/exploit|cve|rce|vuln/.test(c)) return "bug";
    if (/access|credential|phish|identity/.test(c)) return "key";
    if (/malware|backdoor|implant|c2|agent|tool/.test(c)) return "cpu";
    return "shield";
  }
  function catIcon(cat) { return catKind(cat); }
  function catSvg(cat) {
    var k = catKind(cat);
    var paths = {
      lock: "M8 10.5V8a4 4 0 1 1 8 0v2.5M7 10.5h10v8.5H7Z",
      link: "M10 13.5 8.5 15A3.2 3.2 0 1 1 4 10.5L6 8.5M14 10.5 15.5 9A3.2 3.2 0 1 1 20 13.5L18 15.5M9.5 14.5l5-5",
      bug: "M12 7.5a4 4 0 0 1 4 4v3.5a4 4 0 0 1-8 0V11.5a4 4 0 0 1 4-4Zm0 0V5M8 9.5 5.5 8M16 9.5 18.5 8M8 15.5 5.5 17M16 15.5 18.5 17M5.5 12.5H8M16 12.5h2.5",
      key: "M14.5 8.5a3.5 3.5 0 1 1 0 0ZM14.5 12v7l2.2-1.4 2 1.2M9 15.5H5.5L4 17",
      cpu: "M8 8h8v8H8Zm0-3v2m8-2v2M8 17v2m8-2v2M5 8H3m2 8H3m18-8h-2m2 8h-2",
      shield: "M12 3.5 5.5 6.2v5.2c0 4 2.7 7.5 6.5 8.6 3.8-1.1 6.5-4.6 6.5-8.6V6.2Z"
    };
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", paths[k] || paths.shield);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.7");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.appendChild(path);
    return svg;
  }

  function severityOf(t) {
    return t.block_now_count >= 10 ? "critical" : t.block_now_count >= 1 ? "high" : "medium";
  }
  function sevLabel(s) {
    return s === "critical" ? "Critical" : s === "high" ? "High" : "Medium";
  }
  function firstSentence(s) {
    s = String(s || "").replace(/\s+/g, " ").trim();
    if (!s) return "";
    var m = s.match(/^(.+?[.!?])(?:\s|$)/);
    return m ? m[1] : s;
  }
  function clipWords(s, n) {
    var w = String(s || "").trim().split(/\s+/).filter(Boolean);
    if (w.length <= n) return w.join(" ");
    return w.slice(0, n).join(" ").replace(/[.,;:]+$/, "") + "\u2026";
  }
  function sentences(s) {
    s = String(s || "").replace(/\s+/g, " ").trim();
    if (!s) return [];
    var out = [], re = /(.+?[.!?])(?:\s+|$)/g, m, last = 0;
    while ((m = re.exec(s))) { out.push(m[1]); last = re.lastIndex; }
    if (last < s.length) {
      var rest = s.slice(last).trim();
      if (rest) out.push(rest);
    }
    return out.filter(Boolean);
  }
  function ensurePeriod(s) {
    s = String(s || "").replace(/\s+/g, " ").trim();
    if (!s) return "";
    if (!/[.!?]$/.test(s)) s += ".";
    return s;
  }
  function wordCount(s) {
    return String(s || "").trim().split(/\s+/).filter(Boolean).length;
  }
  function normKey(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }
  function similarText(a, b) {
    a = normKey(a); b = normKey(b);
    if (!a || !b) return false;
    if (a === b) return true;
    var shorter = a.length < b.length ? a : b, longer = a.length < b.length ? b : a;
    if (longer.indexOf(shorter) !== -1 && shorter.split(" ").length >= 8) return true;
    var aw = a.split(" "), bw = {};
    b.split(" ").forEach(function (w) { if (w.length > 3) bw[w] = 1; });
    var hit = aw.filter(function (w) { return w.length > 3 && bw[w]; }).length;
    return hit / Math.max(aw.filter(function (w) { return w.length > 3; }).length, 1) > 0.7;
  }
  function clipToWords(s, n) {
    var parts = sentences(s), out = [], count = 0, i;
    for (i = 0; i < parts.length; i++) {
      var w = parts[i].split(/\s+/).filter(Boolean);
      if (count && count + w.length > n) break;
      if (!count && w.length > n) return clipWords(parts[i], n);
      out.push(ensurePeriod(parts[i]));
      count += w.length;
      if (out.length === 2) break;
    }
    return out.join(" ");
  }
  function shortSummary(t) {
    if (t.short_summary) return clipToWords(t.short_summary, 40);
    var picked = [];
    if (t.headline) picked.push(ensurePeriod(t.headline));
    var ss = sentences(t.summary || "");
    var i, short2 = "";
    for (i = 0; i < ss.length; i++) {
      if (picked.some(function (p) { return similarText(p, ss[i]); })) continue;
      if (wordCount(ss[i]) <= 22) { short2 = ss[i]; break; }
    }
    if (!short2) {
      for (i = 0; i < ss.length; i++) {
        if (!picked.some(function (p) { return similarText(p, ss[i]); })) { short2 = ss[i]; break; }
      }
    }
    if (short2) {
      var remain = 40 - (picked[0] ? wordCount(picked[0]) : 0);
      if (remain >= 8) picked.push(wordCount(short2) <= remain ? short2 : clipWords(short2, remain));
    }
    return clipToWords(picked.join(" "), 40);
  }
  function findCves(t) {
    var text = [t.name, t.headline, t.summary].concat(t.recommended_actions || []).join(" ");
    var re = /CVE-\d{4}-\d+/gi, m, seen = {}, out = [];
    while ((m = re.exec(text))) {
      var v = m[0].toUpperCase();
      if (!seen[v]) { seen[v] = 1; out.push(v); }
    }
    return out;
  }
  function endDot(s) {
    s = String(s || "").replace(/\s+/g, " ").trim().replace(/[.,;:]+$/, "");
    return s ? s + "." : "";
  }
  function behaviourToken(t) {
    var texts = (t.ioas || []).map(function (x) { return ((x && (x.title || "")) + " " + ((x && x.artefact) || "")); }).join("\n");
    var m = texts.match(/\bcom\.[a-z0-9.]+/i) || texts.match(/\b[\w.-]+\.(?:cmd|exe|dll|js|json|ps1|sh|bin)\b/i);
    return m ? m[0] : "";
  }
  function patchBullet(t) {
    var acts = t.recommended_actions || [], i;
    for (i = 0; i < acts.length; i++) {
      var m = String(acts[i]).match(/^(Patch|Upgrade|Install|Update)\s+(.{3,60}?)(?:\s+for\s+CVE|\s+to\s+|\s+and\s+turn|\s*;|,)/i);
      if (m && m[2].trim().split(/\s+/).length <= 6) {
        return endDot(m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase() + " " + m[2].trim() + " now");
      }
    }
    var cves = findCves(t);
    if (cves.length === 1) return "Patch " + cves[0] + " now.";
    if (cves.length === 2) return "Patch " + cves[0] + " and " + cves[1] + ".";
    if (cves.length >= 3) return "Patch the published CVEs.";
    return "";
  }
  function doNow(t) {
    var out = [];
    var n = t.block_now_count || 0;
    if (n) out.push(n === 1 ? "Block the 1 indicator." : "Block the " + n + " indicators.");
    var hn = huntOf(t);
    var hasQ = (t.queries || []).some(function (q) { return q && q.url; });
    if (hn || hasQ) out.push("Run the hunt.");
    var patch = patchBullet(t);
    if (patch) out.push(patch);
    var tok = behaviourToken(t);
    if (out.length < 3 && tok) out.push("Check for " + tok + ".");
    if (out.length < 3 && (t.ioas || []).length) out.push("Check for the listed behaviours.");
    if (out.length < 3 && (t.recommended_actions || [])[0] && !patch) {
      var a = String(t.recommended_actions[0]).replace(/\s+/g, " ").trim().replace(/^(please\s+|you should\s+|teams should\s+)/i, "");
      out.push(endDot(clipWords(a, 11)));
    }
    if (out.length < 3 && t.indicator_count && !n) {
      out.push(t.indicator_count === 1 ? "Review the 1 indicator." : "Review the " + t.indicator_count + " indicators.");
    }
    return out.slice(0, 3);
  }
  function midEllipsis(s, max) {
    s = String(s || "");
    max = max || 28;
    if (s.length <= max) return s;
    var inner = max - 1, left = Math.ceil(inner * 0.6), right = inner - left;
    if (right < 4) { right = 4; left = inner - right; }
    return s.slice(0, left) + "\u2026" + s.slice(s.length - right);
  }
  function svgStroke(d, size, cls) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", String(size || 16));
    svg.setAttribute("height", String(size || 16));
    svg.setAttribute("aria-hidden", "true");
    if (cls) svg.setAttribute("class", cls);
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.8");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.appendChild(path);
    return svg;
  }
  function copyIconBtn(value) {
    var b = h("button", { type: "button", class: "copy-ico", title: value, "aria-label": "Copy " + value });
    b.appendChild(svgStroke("M8 8h10v10H8zM6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1", 16, "i-copy"));
    b.appendChild(svgStroke("M5 12.5 9.5 17 19 7", 16, "i-check"));
    b.addEventListener("click", function () { copyText(value, b); trackClick("copy"); });
    return b;
  }
  function actionChip(ind) {
    var a = ind.recommended_action || "";
    var title = a === "block" ? "High confidence" : ((ind.confidence || "") + " confidence");
    return h("span", { class: "pill " + a, title: title, text: a });
  }
  function row(t, newest) {
    var hunt = huntOf(t);
    var isNew = t.entry_date.split(" ")[0] === newest;
    var sev = severityOf(t);
    var by = reportedByText(t);
    var tags = urgencyTags(t);
    return h("li", { class: "trow" }, h("a", { href: "#threat/" + encodeURIComponent(t.id) },
      h("span", { class: "tr-main" },
        h("span", { class: "tr-name" }, h("span", { text: headlineOf(t), title: t.name }), isNew ? h("span", { class: "new", text: "New" }) : null),
        h("span", { class: "tr-sub" },
          by ? h("span", { class: "tr-by", text: by }) : null,
          urgNodes(tags))),
      h("span", { class: "tr-meta" },
        h("span", { class: "tr-sev sev sev-" + sev, text: sevLabel(sev) }),
        h("span", { class: "tr-stats" },
          t.block_now_count ? h("span", { class: "chip blk", text: t.block_now_count + " block" }) : null,
          hunt ? h("span", { class: "chip hunt", text: hunt + " hunt" }) : null,
          t.ioa_count ? h("span", { class: "chip ioa", text: plural(t.ioa_count, "behaviour") }) : null),
        h("time", { class: "tr-when", datetime: t.entry_date.replace(" ", "T"), title: fmtAdded(t.entry_date), "data-d": t.entry_date, text: ago(t.entry_date) })),
      h("span", { class: "tr-go", "aria-hidden": "true", text: "\u2192" })));
  }
    function targetLine(t) {
    var g = tg(t), shown = g.countries.slice(0, 4), more = g.countries.length - shown.length;
    var geo = shown.length ? [shown.map(function (c, i) { return [i ? ", " : "", countryTag(c)]; }), more > 0 ? h("span", { class: "dim", text: " +" + more + " more" }) : null]
      : (g.regions.length ? g.regions.join(", ") : h("span", { class: "dim", text: "Not stated" }));
    if (shown.length && g.regions.length) geo = [geo, h("span", { class: "dim", text: " \u00b7 " + g.regions.join(", ") })];
    var sec = g.sectors.length ? g.sectors.slice(0, 3).join(", ") + (g.sectors.length > 3 ? " +" + (g.sectors.length - 3) + " more" : "") : h("span", { class: "dim", text: "Not stated" });
    var hasGeo = shown.length || g.regions.length, hasSec = g.sectors.length;
    if (!hasGeo && !hasSec) return h("p", { class: "r-tg dim", text: "Countries and sectors not stated" });
    return h("dl", { class: "r-tg" }, hasGeo ? h("div", null, h("dt", { text: !shown.length ? "Regions" : "Countries" }), h("dd", null, geo)) : null,
      hasSec ? h("div", null, h("dt", { text: "Sectors" }), h("dd", null, sec)) : null);
  }
  /* Live feed pages: 20 threats per page, kept in the URL as #page=N (page 1 has no hash). */
  var PER_PAGE = 20, PAGE = 1;
  function pageSize() { return 15; }
  function pageItems(cur, last) {
    if (last <= 7) return Array.apply(null, Array(last)).map(function (_, i) { return i + 1; });
    var out = [1], a = Math.max(2, cur - 1), b = Math.min(last - 1, cur + 1);
    if (cur <= 3) { a = 2; b = 4; } else if (cur >= last - 2) { a = last - 3; b = last - 1; }
    if (a > 2) out.push(0);
    for (var i = a; i <= b; i++) out.push(i);
    if (b < last - 1) out.push(0);
    out.push(last);
    return out;
  }
  function pager(total) {
    var el = $("feed-pager"), last = Math.ceil(total / pageSize());
    clear(el);
    el.hidden = last <= 1;
    if (last <= 1) return;
    var from = (PAGE - 1) * pageSize() + 1, to = Math.min(total, PAGE * pageSize());
    function step(label, n, cls, aria) {
      return n ? h("a", { class: "pg-btn " + cls, href: "#page=" + n, rel: cls === "pg-prev" ? "prev" : "next", "aria-label": aria }, label)
               : h("span", { class: "pg-btn " + cls, "aria-disabled": "true", "aria-label": aria }, label);
    }
    var ol = h("ol", { class: "pg-list" });
    pageItems(PAGE, last).forEach(function (n) {
      ol.appendChild(h("li", null, n === 0 ? h("span", { class: "pg-gap", "aria-hidden": "true", text: "\u2026" }) :
        n === PAGE ? h("a", { class: "pg-num on", href: "#page=" + n, "aria-current": "page", "aria-label": "Page " + n }, String(n)) :
        h("a", { class: "pg-num", href: "#page=" + n, "aria-label": "Page " + n }, String(n))));
    });
    add(el, [h("p", { class: "pg-info", text: "Showing " + from + "\u2013" + to + " of " + total + " threats" }),
      h("div", { class: "pg-ctl" }, step("\u2039 Previous", PAGE > 1 ? PAGE - 1 : 0, "pg-prev", "Previous page"), ol, step("Next \u203a", PAGE < last ? PAGE + 1 : 0, "pg-next", "Next page"))]);
  }
  function renderFeed(keepPage) {
    if (keepPage !== true && PAGE !== 1) {
      PAGE = 1;
      if (/^#page=/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search);
    }
    var c = $("f-cat").value, ty = $("f-type").value, d = $("f-date").value, gk = $("f-country").value, sc = $("f-sector").value;
    [["f-cat", c], ["f-type", ty], ["f-date", d], ["f-country", gk], ["f-sector", sc]].forEach(function (x) { $(x[0]).classList.toggle("on", !!x[1]); });
    $("f-reset").disabled = !(c || ty || d || gk || sc);
    var nOn = [c, ty, d, gk, sc].filter(Boolean).length;
    $("f-on").textContent = nOn ? nOn + " active" : "";
    Array.prototype.forEach.call(document.querySelectorAll(".geo-btn"), function (b) {
      var on = b.getAttribute("data-k") === gk;
      b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    markMap(gk);
    var nameq = ($("q-list") && $("q-list").value || "").trim().toLowerCase();
    var list = DATA.threats.filter(function (t) {
      var keys = geoKeys(t), secs = tg(t).sectors;
      var nameOk = !nameq || (t.name + " " + stitle(t) + " " + headlineOf(t) + " " + (t.headline || "") + " " + (t.category || "")).toLowerCase().indexOf(nameq) !== -1;
      return nameOk && (!c || t.category === c) && (!ty || t.indicator_counts[ty]) && (!d || t.entry_date.split(" ")[0] === d) &&
        (!gk || (gk === "none" ? !keys.length : keys.indexOf(gk) !== -1)) && (!sc || (sc === "none" ? !secs.length : secs.indexOf(sc) !== -1));
    });
    var newest = DATA.threats.length ? DATA.threats[0].entry_date.split(" ")[0] : "";
    $("feed-count").textContent = list.length === DATA.threats.length ? plural(list.length, "threat") + ", newest first" : list.length + " of " + DATA.threats.length + " threats, newest first";
    var f = clear($("feed"));
    if (!list.length) {
      f.appendChild(h("li", { class: "empty-state" }, h("b", null, "No threats match"), "Try another date, country or sector, or a different indicator type.",
        h("div", null, h("button", { type: "button", class: "link-btn", onclick: resetFilters }, "Reset filters"))));
    }
    var last = Math.max(1, Math.ceil(list.length / pageSize()));
    if (PAGE > last) PAGE = last;
    list.slice((PAGE - 1) * pageSize(), PAGE * pageSize()).forEach(function (t) { f.appendChild(row(t, newest)); });
    pager(list.length);
  }
  function renderAllFiles() {
    var el = $("all-files");
    if (el) el.parentNode.replaceChild(fileList(DATA.combined_files), el);
  }

  /* Search */
  function runSearch(raw) {
    var out = clear($("search-results"));
    var q = refang(raw || "");
    if (!q) return;
    var ql = q.toLowerCase(), qk = urlKey(q), qh = hostOf(q);
    var exact = [], related = [], partial = [];
    ALL_IND.forEach(function (x) {
      var v = x.ind.value.toLowerCase();
      var vk = x.ind.type === "url" ? urlKey(x.ind.value) : v;
      if (v === ql || vk === qk) exact.push([x, "Exact match"]);
      else if (x.ind.type === "url" && (hostOf(x.ind.value) === ql || hostOf(x.ind.value) === qh) && ql.length > 3) related.push([x, "URL on the same host"]);
      else if (qh && (x.ind.type === "domain" || x.ind.type === "ipv4") && (qh === v || qh.slice(-(v.length + 1)) === "." + v)) related.push([x, "Host matches this " + typeLabel(x.ind.type).toLowerCase()]);
      else if (x.ind.type === "domain" && ql.slice(-(v.length + 1)) === "." + v) related.push([x, "Subdomain of a listed domain"]);
      else if (ql.length >= 6 && v.indexOf(ql) !== -1) partial.push([x, "Contains your search"]);
    });
    var all = exact.concat(related, partial);
    var shown = all.slice(0, 50);
    var head;
    if (exact.length) head = h("p", { class: "res-head" }, h("span", { class: "verdict yes", text: "Listed" }), plural(exact.length, "exact match") + (related.length + partial.length ? ", plus " + plural(related.length + partial.length, "related result") : "") + ".");
    else if (all.length) head = h("p", { class: "res-head" }, h("span", { class: "verdict near", text: "Related" }), "No exact match. " + plural(all.length, "related result") + (all.length > 50 ? " (first 50 shown)" : "") + ".");
    else head = h("p", { class: "res-head" }, h("span", { class: "verdict no", text: "Not listed" }), h("span", null, "\u201c", h("code", { text: defang(q, /^[a-z]+:\/\//i.test(q) ? "url" : (HOSTLIKE.test(q) || /^\d{1,3}(\.\d{1,3}){3}$/.test(q) ? "domain" : "")) }), "\u201d is not in this feed. That does not mean it is safe; this feed only covers selected high-impact threats."));
    out.appendChild(head);
    shown.forEach(function (p) {
      var x = p[0], ind = x.ind;
      out.appendChild(h("div", { class: "hit" + (p[1] === "Exact match" ? " exact" : "") },
        iocCell(ind),
        h("div", { class: "why" }, h("span", { class: "pill", text: p[1] }), typeTag(ind.type), confMeter(ind.confidence), actionPill(ind.recommended_action)),
        h("p", null, h("a", { class: "tlink", href: "#threat/" + encodeURIComponent(x.threat.id), text: stitle(x.threat) }), " \u00b7 ", ind.description || "")));
    });
  }

  /* Detail */
  function sec(title, body, aside, id) { return h("section", { class: "blk-sec", id: id || null }, h("h2", id && title ? { id: id + "-h" } : null, title, aside ? h("span", { text: aside }) : null), body); }
  function backLink() { return h("nav", { class: "crumb", "aria-label": "Breadcrumb" }, h("a", { href: "#threats" }, h("span", { "aria-hidden": "true", text: "\u2190" }), "Threats"), h("span", { "aria-hidden": "true", text: "/" }), h("span", { text: "Threat" })); }
  function targetSection(t) {
    var g = tg(t), ns = h("span", { class: "dim", text: "Not stated in the sources" });
    var rows = [h("div", null, h("dt", { text: "Countries" }), h("dd", null, g.countries.length ? h("ul", { class: "ctry-list" }, g.countries.map(function (c) { return h("li", null, countryTag(c)); })) : ns))];
    if (g.regions.length) rows.push(h("div", null, h("dt", { text: "Regions" }), h("dd", { text: g.regions.join(", ") })));
    rows.push(h("div", null, h("dt", { text: "Sectors" }), h("dd", null, g.sectors.length ? g.sectors.join(", ") : ns.cloneNode(true))));
    return sec("Affected countries and sectors", h("div", null, h("dl", { class: "tg-dl" }, rows),
      g.note ? h("p", { class: "tg-note", text: g.note }) : null,
      g.source && t.sources.length > 1 ? srcLine([g.source], "tg-src", "Per ") : null), null, "targets-sec");
  }
  function renderDetail(id) {
    var t = null;
    DATA.threats.forEach(function (x) { if (x.id === id) t = x; });
    var el = clear($("detail"));
    var wrap = h("article", { class: "det det-tight" });
    el.appendChild(wrap);
    CURRENT_ID = t ? t.id : "";
    if (!t) {
      wrap.appendChild(backLink());
      wrap.appendChild(h("div", { class: "empty-state" }, h("b", null, "Threat not found"), "This threat is no longer in the feed. ", h("a", { href: "#threats" }, "Back to the feed")));
      return;
    }
    document.title = headlineOf(t) + " | IOCWatch";
    wrap.appendChild(backLink());
    var newest = DATA.threats[0].entry_date.split(" ")[0];
    var huntN = t.hunt_count != null ? t.hunt_count : t.indicator_count - t.block_now_count;
    var sev = t.block_now_count >= 10 ? "critical" : t.block_now_count >= 1 ? "high" : "medium";
    var tags = urgencyTags(t);
    wrap.appendChild(h("header", { class: "det-head sev-" + sev, id: "det-head" },
      h("div", { class: "r-cat" }, h("span", { text: t.category }), h("span", { class: "sev sev-" + sev, text: sevLabel(sev) }), t.entry_date.split(" ")[0] === newest ? h("span", { class: "new", text: "New today" }) : null),
      h("h1", { text: headlineOf(t) }),
      reportedByLine(t, "det-by"),
      tags.length ? h("p", { class: "det-urg" }, urgNodes(tags)) : null,
      h("p", { class: "det-full", text: t.name }),
      h("dl", { class: "facts" },
        [["Published", fmtDay(t.published)], ["Added", fmtAdded(t.entry_date)], ["Last updated", fmtDay(t.last_updated)]]
          .map(function (f) { return h("div", { class: f[2] || null }, h("dt", { text: f[0] }), h("dd", { text: String(f[1]) })); })),
      h("p", { class: "todo" },
        t.block_now_count ? h("span", { class: "blk" }, h("b", { text: String(t.block_now_count) }), " to block now") : h("span", { class: "dim", text: "Nothing to block" }),
        h("span", { class: "sep", "aria-hidden": "true", text: " \u00b7 " }),
        huntN ? h("span", { class: "hunt" }, h("b", { text: String(huntN) }), " to hunt") : h("span", { class: "dim", text: "Nothing to hunt" }),
        t.ioa_count ? [h("span", { class: "sep", "aria-hidden": "true", text: " \u00b7 " }), h("span", { class: "ioa-c" }, h("b", { text: String(t.ioa_count) }), (t.ioa_count === 1 ? " behaviour" : " behaviours") + " to hunt")] : null),
      h("p", { class: "share-line" }, h("button", { type: "button", class: "link-btn", onclick: function () { copyText(shareUrl(t.id), this, "Copied link"); } }, "Copy link"), h("span", { class: "sep", "aria-hidden": "true", text: "\u00b7" }), h("a", { class: "link-btn", href: "/t/" + encodeURIComponent(t.id) + "/" }, "Printable page"))));

    var hq = huntSection(t);
    if (hq) wrap.appendChild(hq);
    var ioa = ioaSection(t);

    var after = h("div", { class: "after-hunt" });
    var sum = shortSummary(t);
    if (sum) after.appendChild(h("section", { class: "sum-sec", id: "summary-sec", "aria-labelledby": "sum-h" },
      h("h2", { id: "sum-h" }, "Summary"),
      h("p", { class: "sum-short" }, highlightIocs(sum))));
    var steps = doNow(t);
    if (steps.length) after.appendChild(h("section", { class: "do-sec", id: "do-sec", "aria-labelledby": "do-h" },
      h("h2", { id: "do-h" }, "Do now"),
      h("ol", { class: "do-now" }, steps.map(function (b) { return h("li", { text: b }); }))));

    var tq = h("input", { type: "search", placeholder: "Filter indicators", spellcheck: "false", "aria-label": "Filter indicators" });
    var ts = h("select", { "aria-label": "Indicator type" }, h("option", { value: "" }, "All types"),
      typesOf(t).map(function (k) { return h("option", { value: k }, typeLabel(k) + " (" + t.indicator_counts[k] + ")"); }));
    if ($("f-type") && $("f-type").value && t.indicator_counts[$("f-type").value]) ts.value = $("f-type").value;
    var body = h("tbody");
    var countEl = h("span");
    var copyAll = h("button", { type: "button", class: "btn btn-ghost btn-copy-set", text: "Copy all" });
    var copyBlock = h("button", { type: "button", class: "btn btn-ghost btn-copy-set", text: "Copy block list" });
    copyAll.addEventListener("click", function () {
      var vals = (t.indicators || []).map(function (ind) { return ind.value; }).filter(Boolean);
      if (!vals.length) { toast("Nothing to copy"); return; }
      copyText(vals.join("\n"), copyAll, "Copied all");
      trackClick("copy");
    });
    copyBlock.addEventListener("click", function () {
      var vals = (t.indicators || []).filter(function (ind) { return ind.recommended_action === "block"; }).map(function (ind) { return ind.value; });
      if (!vals.length) { toast("Nothing to copy"); return; }
      copyText(vals.join("\n"), copyBlock, "Copied block list");
      trackClick("copy");
    });
    if (!(t.block_now_count)) copyBlock.hidden = true;
    function fill() {
      clear(body);
      var qv = refang(tq.value).toLowerCase(), ty = ts.value;
      var rows = [];
      t.indicators.forEach(function (ind) {
        if (ty && ind.type !== ty) return;
        if (qv && (ind.value + " " + (ind.description || "")).toLowerCase().indexOf(qv) === -1) return;
        rows.push(ind);
      });
      rows.sort(function (a, b) { return actionRank(a.recommended_action) - actionRank(b.recommended_action); });
      var n = rows.length;
      rows.forEach(function (ind) {
        body.appendChild(h("tr", { "data-action": ind.recommended_action || "" },
          h("td", { class: "val-td" }, h("code", { class: "val", title: ind.value, text: midEllipsis(ind.value, 28) })),
          h("td", { class: "typ" }, typeTag(ind.type)),
          h("td", { class: "act" }, actionChip(ind)),
          h("td", { class: "copy-td" }, copyIconBtn(ind.value))));
      });
      countEl.textContent = n === t.indicators.length ? String(n) : n + " of " + t.indicators.length;
      if (!n) body.appendChild(h("tr", null, h("td", { colspan: "4", class: "none" }, "No indicators match this filter.")));
    }
    tq.addEventListener("input", fill);
    ts.addEventListener("change", fill);
    fill();
    after.appendChild(h("section", { class: "ind-sec", id: "ind-sec", "aria-labelledby": "ind-h" },
      h("div", { class: "ind-head" }, h("h2", { id: "ind-h" }, "Indicators ", h("span", { class: "dim" }, countEl))),
      h("div", { class: "ind-toolbar" },
        copyAll, copyBlock,
        h("div", { class: "ind-tools" }, tq, ts)),
      h("div", { class: "tbl-wrap" }, h("table", { class: "ind-compact" },
        h("thead", null, h("tr", null,
          h("th", { scope: "col", text: "Value" }),
          h("th", { scope: "col", text: "Type" }),
          h("th", { scope: "col", text: "Action" }),
          h("th", { scope: "col", class: "copy-h" }, h("span", { class: "sr", text: "Copy" })))),
        body))));
    if (t.sources && t.sources.length) {
      after.appendChild(h("section", { class: "blk-sec", id: "sources-sec" }, srcLine(t.sources, "srcline det-src")));
    }
    var extra = [];
    if (t.caveat) extra.push(h("div", { class: "warn", role: "note" }, h("b", null, "Note"), " ", highlightIocs(t.caveat)));
    extra.push(sec("What to do", h("div", null,
      t.recommended_actions.length ? h("ol", { class: "steps" }, t.recommended_actions.map(function (a) { return h("li", null, h("span", null, highlightIocs(a))); })) : h("p", { class: "dim", text: "No extra steps beyond the block list and hunts." })), null, "todo-sec"));
    if (ioa) extra.push(ioa);
    extra.push(targetSection(t));
    if (t.summary) extra.push(sec("Background", h("div", { class: "prose" }, h("p", null, highlightIocs(t.summary))), null, "background-sec"));
    extra.push(sec("Downloads", h("div", null, fileList(t.files),
      h("p", { class: "rail-p" }, extLink(t.repo_url, ["View folder in repository", h("span", { class: "ext-ico", "aria-hidden": "true" })]))), null, "downloads-sec"));
    if (t.mitre.length) extra.push(sec("MITRE ATT&CK", h("ul", { class: "mitre" }, t.mitre.map(function (m) { return h("li", null, extLink(m.url, [h("b", { text: m.id }), h("span", { text: m.name })])); })), String(t.mitre.length), "mitre-sec"));
    after.appendChild(h("details", { class: "more-det", id: "more-det" },
      h("summary", { text: "More detail" }),
      h("div", { class: "more-in" }, extra)));
    wrap.appendChild(after);
    if (LAYOUT === "a") renderFeed(true);
  }

  var LAYOUT = document.body.getAttribute("data-layout") || "";
  var CURRENT_ID = "";
  var VIEW = "threats";

  function actionRank(a) {
    return a === "block" ? 0 : a === "alert" ? 1 : 2;
  }
  function uniqueSources() {
    var map = {};
    DATA.threats.forEach(function (t) {
      (t.sources || []).forEach(function (s) {
        var name = srcName(s);
        if (!map[name]) map[name] = { name: name, url: s.url, threats: [], count: 0 };
        if (map[name].threats.indexOf(t) === -1) { map[name].threats.push(t); map[name].count++; }
        if (!map[name].url && s.url) map[name].url = s.url;
      });
    });
    return Object.keys(map).map(function (k) { return map[k]; })
      .sort(function (a, b) { return b.count - a.count || a.name.localeCompare(b.name); });
  }
  function fillNavCounts() {
    if ($("nav-threats-n")) $("nav-threats-n").textContent = String(DATA.threat_count);
    if ($("nav-block-n")) $("nav-block-n").textContent = String(DATA.block_now_count);
    var hunts = DATA.threats.filter(function (t) { return (t.queries || []).some(function (q) { return q && q.url; }); }).length;
    if ($("nav-hunts-n")) $("nav-hunts-n").textContent = String(hunts);
    if ($("nav-sources-n")) $("nav-sources-n").textContent = String(uniqueSources().length);
  }
  function closeNav() {
    document.body.classList.remove("nav-open");
    var t = $("nav-toggle"), b = $("nav-backdrop");
    if (t) t.setAttribute("aria-expanded", "false");
    if (b) b.hidden = true;
  }
  function setNav(view) {
    Array.prototype.forEach.call(document.querySelectorAll("#app-nav a[data-view]"), function (a) {
      if (a.getAttribute("data-view") === view) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }
  function showView(view) {
    VIEW = view;
    closeNav();
    setNav(view === "threat" ? "threats" : view);
    var pages = { home: $("home"), threats: $("view-threats"), threat: $("detail"), block: $("view-block"), hunts: $("view-hunts"), sources: $("view-sources"), about: $("view-about"), rumours: $("view-rumours"), live: $("view-live"), darkweb: $("view-darkweb") };
    Object.keys(pages).forEach(function (k) { if (pages[k]) pages[k].hidden = k !== view; });
    document.body.setAttribute("data-view", view);
    if (view !== "threat") CURRENT_ID = "";
    if (view === "threats" && DATA) renderFeed(true);
    if (view === "rumours") renderRumours();
  }
  function renderBlock() {
    var el = $("view-block");
    if (!el || !DATA) return;
    var PAGE = 50;
    var RAW = "https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/";
    var items = [];
    DATA.threats.forEach(function (t) {
      var when = ukTime(t.entry_date);
      (t.indicators || []).forEach(function (ind) {
        if (ind.recommended_action !== "block") return;
        items.push({ ind: ind, threat: t, added: t.entry_date, ms: when ? when.ms : 0 });
      });
    });
    var counts = { all: items.length, ip: 0, domain: 0, url: 0, sha256: 0, sha1: 0, other: 0 };
    items.forEach(function (x) {
      var ty = x.ind.type;
      if (ty === "ipv4" || ty === "ipv6") counts.ip++;
      else if (ty === "domain") counts.domain++;
      else if (ty === "url") counts.url++;
      else if (ty === "sha256") counts.sha256++;
      else if (ty === "sha1") counts.sha1++;
      else counts.other++;
    });
    var tabs = [
      { id: "all", label: "All", file: "block_now.txt" },
      { id: "ip", label: "IPs", file: "block_now_ipv4.txt" },
      { id: "domain", label: "Domains", file: "block_now_domain.txt" },
      { id: "url", label: "URLs", file: "block_now_url.txt" },
      { id: "sha256", label: "SHA256", file: "block_now_sha256.txt" },
      { id: "sha1", label: "SHA1", file: "block_now_sha1.txt" },
      { id: "other", label: "Other", file: null }
    ].filter(function (tab) { return tab.id === "all" || counts[tab.id] > 0; });
    var files = {};
    ((DATA && DATA.combined_files) || []).forEach(function (f) { files[f.name] = f; });

    var state = { tab: "all", format: "plain", range: "all", q: "", page: 1 };

    function tabMatch(x) {
      var ty = x.ind.type, id = state.tab;
      if (id === "all") return true;
      if (id === "ip") return ty === "ipv4" || ty === "ipv6";
      if (id === "other") return ty !== "ipv4" && ty !== "ipv6" && ty !== "domain" && ty !== "url" && ty !== "sha256" && ty !== "sha1";
      return ty === id;
    }
    function inRange(x) {
      if (state.range === "all") return true;
      if (!x.ms) return false;
      var age = Date.now() - x.ms;
      if (state.range === "24h") return age <= 86400000;
      if (state.range === "7d") return age <= 86400000 * 7;
      return true;
    }
    function matchesQ(x) {
      var needle = refang(state.q).toLowerCase().trim();
      if (!needle) return true;
      var t = x.threat;
      var hay = (x.ind.value || "") + " " + stitle(t) + " " + (t.name || "") + " " + (t.news_headline || "") + " " + (t.short_title || "");
      return hay.toLowerCase().indexOf(needle) !== -1;
    }
    function visible() { return items.filter(function (x) { return tabMatch(x) && inRange(x) && matchesQ(x); }); }

    function shortVal(ind) {
      var s = defang(ind.value, ind.type);
      var typ = ind.type;
      if (typ === "ipv4" || typ === "ipv6") return s;
      var keep = typ === "url" ? 16 : typ === "domain" ? 14 : 10;
      if (s.length <= keep * 2 + 1) return s;
      return s.slice(0, keep) + "\u2026" + s.slice(-keep);
    }
    function combined(name) {
      return files[name] || (name ? { name: name, label: name, url: RAW + name, download: name } : null);
    }
    function currentTab() {
      for (var i = 0; i < tabs.length; i++) if (tabs[i].id === state.tab) return tabs[i];
      return tabs[0];
    }
    function officialFile() {
      var fmt = state.format, tab = currentTab();
      if (fmt === "defender") return combined("defender_xdr_indicators.csv");
      if (fmt === "splunk") return combined("splunk_rti_iocs.csv");
      if (fmt === "pihole") return combined("block_now_domain.txt");
      if (fmt === "edl" || fmt === "plain") return tab.file ? combined(tab.file) : null;
      return tab.file ? combined(tab.file) : null;
    }
    function howTo() {
      var fmt = state.format;
      if (fmt === "defender") return "Import this CSV in Microsoft Defender XDR, under Settings, Indicators.";
      if (fmt === "splunk") return "Upload this CSV as a Splunk lookup named splunk_rti_iocs.csv, then run the live-feed hunt.";
      if (fmt === "edl") return "Paste this URL as an External Dynamic List in Palo Alto or a Fortinet threat feed. It always serves the latest list.";
      if (fmt === "pihole") return "Add the domain list URL as a Pi-hole adlist, or paste the domains into Gravity.";
      return "Copy the list and paste it into your firewall, EDR or DNS blocklist. Copy all uses the filters above.";
    }

    function copyValues(list, btn) {
      var lines = list.map(function (x) { return x.ind.value; });
      if (!lines.length) { toast("Nothing to copy"); return; }
      copyText(lines.join("\n"), btn);
      trackClick("copy");
    }
    function downloadOfficial(f) {
      if (!f) return;
      var a = h("a", { href: f.url, download: f.download || f.name, rel: "noopener noreferrer", target: "_blank" });
      saveOnClick(a, f);
      a.click();
    }
    function downloadGenerated(list, name) {
      var text = list.map(function (x) { return x.ind.value; }).join("\n");
      if (!text) { toast("Nothing to download"); return; }
      var blob = new Blob([text + "\n"], { type: "text/plain" });
      var u = URL.createObjectURL(blob);
      var a = h("a", { href: u, download: name || "block_now.txt" });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
      trackDownload();
      toast("Downloaded " + (name || "block_now.txt"));
    }

    var tabBar = h("div", { class: "blk-tabs", role: "tablist", "aria-label": "Indicator type" });
    var acts = h("div", { class: "blk-acts" });
    var howEl = h("p", { class: "blk-how" });
    var urlEl = h("div", { class: "blk-url" });
    var q = h("input", { type: "search", id: "block-q", placeholder: "Search values or threats", spellcheck: "false", "aria-label": "Search values or threats" });
    var rangeBar = h("div", { class: "blk-range", role: "group", "aria-label": "Added date" });
    var tableBody = h("tbody");
    var cards = h("div", { class: "blk-cards" });
    var pageEl = h("div", { class: "blk-page" });
    var shownEl = h("span");

    function setTab(id) {
      state.tab = id;
      state.page = 1;
      Array.prototype.forEach.call(tabBar.querySelectorAll(".blk-tab"), function (b) {
        b.setAttribute("aria-selected", b.getAttribute("data-tab") === id ? "true" : "false");
      });
      draw();
    }
    function setRange(id) {
      state.range = id;
      state.page = 1;
      Array.prototype.forEach.call(rangeBar.querySelectorAll("button"), function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-range") === id ? "true" : "false");
      });
      draw();
    }

    tabs.forEach(function (tab) {
      var b = h("button", { type: "button", class: "blk-tab", role: "tab", "data-tab": tab.id, "aria-selected": tab.id === state.tab ? "true" : "false" },
        tab.label, h("b", { text: String(counts[tab.id]) }));
      b.addEventListener("click", function () { setTab(tab.id); });
      tabBar.appendChild(b);
    });
    [["24h", "Last 24h"], ["7d", "Last 7d"], ["all", "All"]].forEach(function (pair) {
      var b = h("button", { type: "button", "data-range": pair[0], "aria-pressed": pair[0] === state.range ? "true" : "false", text: pair[1] });
      b.addEventListener("click", function () { setRange(pair[0]); });
      rangeBar.appendChild(b);
    });

    var fmt = h("select", { id: "block-fmt", "aria-label": "Format" },
      h("option", { value: "plain" }, "Plain list"),
      h("option", { value: "defender" }, "Defender XDR CSV"),
      h("option", { value: "splunk" }, "Splunk lookup"),
      h("option", { value: "edl" }, "Palo Alto / Fortinet EDL"),
      h("option", { value: "pihole" }, "Pi-hole / DNS")
    );
    fmt.addEventListener("change", function () { state.format = fmt.value; draw(); });

    function valCell(x) {
      var ind = x.ind;
      var shown = shortVal(ind);
      var full = defang(ind.value, ind.type);
      var code = h("code", { class: "blk-val", title: full, text: shown });
      var btn = h("button", { type: "button", class: "copy", title: "Copy the real (not defanged) value", "aria-label": "Copy " + full }, "Copy");
      function doCopy() { copyText(ind.value, btn); trackClick("copy"); }
      btn.addEventListener("click", doCopy);
      code.addEventListener("click", doCopy);
      code.style.cursor = "pointer";
      return h("div", { class: "blk-valcell" }, code, btn);
    }
    function confEl(c) {
      var key = (c || "high").toLowerCase();
      var label = key.charAt(0).toUpperCase() + key.slice(1);
      return h("span", { class: "blk-conf " + key, text: label });
    }
    function threatLink(t) {
      var name = stitle(t);
      return h("a", { class: "blk-threat", href: "/t/" + encodeURIComponent(t.id) + "/", title: t.name || name, text: name });
    }

    function drawActions(list) {
      clear(acts);
      clear(urlEl);
      var f = officialFile();
      var fmtId = state.format;
      var copyBtn = h("button", { type: "button", class: "btn btn-ghost" });
      var dlBtn = h("button", { type: "button", class: "btn btn-ghost" }, "Download " + (fmtId === "defender" || fmtId === "splunk" ? ".csv" : ".txt"));
      if (fmtId === "plain") {
        copyBtn.textContent = "Copy all";
        copyBtn.addEventListener("click", function () { copyValues(list, copyBtn); });
        dlBtn.addEventListener("click", function () {
          var filtered = !!(state.q || state.range !== "all" || (state.tab === "ip" && counts.ip && !f));
          var tab = currentTab();
          if (!filtered && f && state.tab !== "other" && state.tab !== "ip") downloadOfficial(f);
          else downloadGenerated(list, "block_now_" + (tab.id === "all" ? "all" : tab.id) + ".txt");
        });
        add(acts, [copyBtn, dlBtn]);
        urlEl.hidden = true;
      } else {
        copyBtn.textContent = "Copy URL";
        var url = f && f.url;
        copyBtn.addEventListener("click", function () {
          if (!url) { toast("No URL for this format"); return; }
          copyText(url, copyBtn);
          trackClick("copy");
        });
        dlBtn.addEventListener("click", function () { if (f) downloadOfficial(f); });
        if (url) add(urlEl, h("code", { title: url, text: url }));
        urlEl.hidden = !url;
        add(acts, [copyBtn, dlBtn]);
      }
      howEl.textContent = howTo();
    }

    function draw() {
      var list = visible();
      var pages = Math.max(1, Math.ceil(list.length / PAGE));
      if (state.page > pages) state.page = pages;
      var start = (state.page - 1) * PAGE;
      var slice = list.slice(start, start + PAGE);
      clear(tableBody);
      clear(cards);
      if (!list.length) {
        tableBody.appendChild(h("tr", null, h("td", { colspan: "5", class: "blk-empty" }, "No indicators match this filter.")));
        cards.appendChild(h("p", { class: "blk-empty", text: "No indicators match this filter." }));
      } else {
        slice.forEach(function (x) {
          tableBody.appendChild(h("tr", null,
            h("td", null, valCell(x)),
            h("td", { class: "blk-type", text: typeLabel(x.ind.type) }),
            h("td", null, threatLink(x.threat)),
            h("td", { class: "blk-date", text: fmtDay(x.added) }),
            h("td", null, confEl(x.ind.confidence))
          ));
          cards.appendChild(h("article", { class: "blk-card" },
            valCell(x),
            h("div", { class: "blk-card-meta" },
              h("span", { class: "blk-type", text: typeLabel(x.ind.type) }),
              confEl(x.ind.confidence),
              h("span", { class: "blk-date", text: fmtDay(x.added) })
            ),
            threatLink(x.threat)
          ));
        });
      }
      var from = list.length ? start + 1 : 0;
      var to = start + slice.length;
      shownEl.textContent = list.length === items.length && state.tab === "all" && !state.q && state.range === "all"
        ? (from + "\u2013" + to + " of " + list.length)
        : (from + "\u2013" + to + " of " + list.length + " matching");
      clear(pageEl);
      var prev = h("button", { type: "button", text: "Previous" });
      var next = h("button", { type: "button", text: "Next" });
      prev.disabled = state.page <= 1;
      next.disabled = state.page >= pages;
      prev.addEventListener("click", function () { if (state.page > 1) { state.page--; draw(); } });
      next.addEventListener("click", function () { if (state.page < pages) { state.page++; draw(); } });
      add(pageEl, [shownEl, h("div", { class: "blk-page-nav" }, prev, next)]);
      pageEl.hidden = list.length <= PAGE && state.page === 1;
      drawActions(list);
    }

    q.addEventListener("input", function () { state.q = q.value; state.page = 1; draw(); });

    var total = DATA.block_now_count || items.length;
    var updated = DATA.last_updated ? fmtAdded(DATA.last_updated) : "";
    clear(el);
    add(el, [
      h("div", { class: "blk-head" },
        h("h1", null, "Block list"),
        h("p", { class: "blk-sum" },
          h("span", { class: "blk-n", text: String(total) }),
          " to block",
          updated ? h("span", { class: "blk-upd" }, " \u00b7 Updated " + updated) : null
        )
      ),
      h("p", { class: "blk-note", text: "Never block private, documentation or shared legitimate services." }),
      tabBar,
      h("div", { class: "blk-actions" }, acts, h("div", { class: "blk-fmt" }, h("label", { "for": "block-fmt" }, "Format"), fmt), howEl, urlEl),
      h("div", { class: "blk-tools" }, q, rangeBar),
      h("div", { class: "blk-table-wrap" },
        h("table", { class: "blk-table" },
          h("thead", null, h("tr", null,
            ["Value", "Type", "Threat", "Added", "Confidence"].map(function (x) { return h("th", { scope: "col", text: x }); })
          )),
          tableBody
        )
      ),
      cards,
      pageEl
    ]);
    draw();
  }

  function renderHunts() {
    var el = $("view-hunts");
    if (!el || !DATA) return;
    var list = DATA.threats.filter(function (t) { return (t.queries || []).some(function (q) { return q && q.url; }); });
    clear(el);
    add(el, [
      h("div", { class: "catalog-head" }, h("h1", null, "Hunts"), h("span", { text: plural(list.length, "threat") })),
      h("p", { class: "catalog-meta" }, "The same hunt for Defender XDR, Splunk and Google SecOps, ready to copy or download. Open a threat to run it."),
      h("ol", { class: "catalog" }, list.map(function (t) {
        var platforms = (t.queries || []).map(function (q) { return q.platform; }).filter(Boolean);
        var hunt = t.hunt_count != null ? t.hunt_count : Math.max(0, t.indicator_count - t.block_now_count);
        return h("li", { class: "catalog-item" },
          h("a", { class: "tlink", href: "#threat/" + encodeURIComponent(t.id), text: stitle(t), title: t.name }),
          h("p", { class: "catalog-meta" },
            t.category, " · ", fmtDay(t.entry_date),
            hunt ? " · " + plural(hunt, "indicator") + " to hunt" : "",
            t.ioa_count ? " · " + plural(t.ioa_count, "behaviour") : "",
            platforms.length ? " · " + platforms.join(" · ") : ""));
      }))
    ]);
  }
  var SOURCE_ORGS = null;
  var SOURCE_GROUPS = [
    { id: "vendors", label: "Vendors", kinds: { vendor: 1, research: 1 } },
    { id: "certs", label: "CERTs & government", kinds: { cert: 1 } },
    { id: "community", label: "Community", kinds: { community: 1 } },
    { id: "news", label: "News", kinds: { news: 1 } }
  ];
  function loadSourceOrgs() {
    if (SOURCE_ORGS) return Promise.resolve(SOURCE_ORGS);
    return getJSON("sources.json").then(function (d) {
      SOURCE_ORGS = (d && d.organizations) || [];
      return SOURCE_ORGS;
    }, function () { SOURCE_ORGS = []; return SOURCE_ORGS; });
  }
  function srcTile(o, decorative) {
    var cls = "src-tile" + (o.logo ? "" : " is-text") + (o.wide ? " is-wide" : "") +
      (o.tone === "light" ? " is-light" : " is-dark") + (o.colorful ? " is-colorful" : "") +
      (o.solid ? " is-solid" : "");
    var inner;
    if (o.logo) {
      inner = [h("img", { src: o.logo, alt: o.name, title: o.name, width: "96", height: "40" }),
               h("span", { class: "src-nm", text: o.name })];
    } else {
      inner = h("span", { class: "src-nm src-nm-only", text: o.name, title: o.name });
    }
    var attrs = { class: cls, href: o.homepage, target: "_blank", rel: "noopener", title: o.name };
    if (decorative) { attrs.tabindex = "-1"; attrs["aria-hidden"] = "true"; }
    return h("a", attrs, inner);
  }
  function srcMarquee(orgs) {
    var withLogo = orgs.filter(function (o) { return o.logo; });
    if (withLogo.length < 6) return null;
    var rows = [[], [], []];
    withLogo.forEach(function (o, i) { rows[i % 3].push(o); });
    return h("div", { class: "src-marquee", "aria-hidden": "true" }, rows.map(function (row, i) {
      if (!row.length) return null;
      // Repeat the row so a CSS -50% translate loops without a gap.
      var tiles = row.concat(row).map(function (o) { return srcTile(o, true); });
      // If a row is short, double again so the strip is wider than the page.
      if (row.length < 8) tiles = tiles.concat(row.concat(row).map(function (o) { return srcTile(o, true); }));
      return h("div", { class: "src-marquee-row" }, h("div", { class: "src-track" }, tiles));
    }));
  }
  function renderSources() {
    var el = $("view-sources");
    if (!el || !DATA) return;
    loadSourceOrgs().then(function (orgs) {
      if (VIEW !== "sources") return;
      clear(el);
      var n = orgs.length;
      var groups = SOURCE_GROUPS.map(function (g) {
        var list = orgs.filter(function (o) { return g.kinds[o.kind]; })
          .sort(function (a, b) { return a.name.localeCompare(b.name); });
        if (!list.length) return null;
        return h("section", { class: "src-group", "data-kind": g.id, "aria-labelledby": "src-h-" + g.id },
          h("h2", { class: "src-group-h", id: "src-h-" + g.id, text: g.label }),
          h("ul", { class: "src-grid" }, list.map(function (o) {
            return h("li", null, srcTile(o, false));
          })));
      });
      add(el, [
        h("div", { class: "catalog-head" }, h("h1", null, "Sources"), h("span", { class: "src-count", text: plural(n, "source") })),
        h("p", { class: "catalog-meta" }, "Every organisation cited in this feed. Each mark links to the organisation's site."),
        srcMarquee(orgs),
        groups,
        h("p", { class: "src-legal" }, "Logos are trademarks of their owners, used only to credit sources. No endorsement implied.")
      ]);
      el.classList.add("src-page");
    });
  }

  /* Rumours: early reports from named sources. A lead story, then a day-grouped timeline.
     Status runs Reported (Unconfirmed) > Confirmed (IOCs pending) > IOCs published (Promoted, has a threat page). */
  var RUM_STEPS = ["Reported", "Confirmed", "IOCs published"];
  var RUM_FILTER = "all";
  var RUM_FAVS = null;
  function loadRumourFavs() {
    if (RUM_FAVS) return Promise.resolve(RUM_FAVS);
    return getJSON("img/fav/index.json").then(function (d) { RUM_FAVS = Array.isArray(d) ? d : []; return RUM_FAVS; },
      function () { RUM_FAVS = []; return RUM_FAVS; });
  }
  function rumourStatusClass(st) {
    if (st === "Promoted") return "promoted";
    if (/^Confirmed/.test(st || "")) return "confirmed";
    return "unconfirmed";
  }
  function rumourStep(st) { var c = rumourStatusClass(st); return c === "promoted" ? 2 : c === "confirmed" ? 1 : 0; }
  function rumourDayKey(d) { return String(d || "").split(" ")[0]; }
  function rumourDaysAgo(d) {
    var p = rumourDayKey(d).split("-");
    if (p.length !== 3) return null;
    var now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/London" }));
    var a = Date.UTC(+p[0], +p[1] - 1, +p[2]), b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((b - a) / 86400000);
  }
  function rumourDayShort(d) {
    var p = rumourDayKey(d).split("-");
    return p.length === 3 ? parseInt(p[2], 10) + " " + MONTHS[parseInt(p[1], 10) - 1].slice(0, 3) : "";
  }
  function rumourDayLabel(d) {
    var n = rumourDaysAgo(d), p = rumourDayKey(d).split("-");
    var wd = p.length === 3 ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay()] : "";
    if (n === 0) return ["Today", wd + " " + rumourDayShort(d)];
    if (n === 1) return ["Yesterday", wd + " " + rumourDayShort(d)];
    return [wd + " " + rumourDayShort(d), n != null ? n + " days ago" : ""];
  }
  function rumourHost(u) {
    try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; }
  }
  function rumourFav(host) {
    if (!host || !RUM_FAVS) return null;
    var parts = host.split(".");
    for (var i = 0; i < parts.length - 1; i++) {
      var k = parts.slice(i).join(".");
      if (RUM_FAVS.indexOf(k) !== -1) return "img/fav/" + k + ".png";
    }
    return null;
  }
  function rumourInitials(name) {
    var w = String(name || "?").replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
    return ((w[0] || "?")[0] + (w.length > 1 ? w[1][0] : (w[0] || "")[1] || "")).toUpperCase();
  }
  function rumourSourceChip(s, iconOnly) {
    var fav = rumourFav(rumourHost(s.url)), name = s.name || rumourHost(s.url);
    var mark = fav ? h("span", { class: "rum-fav" }, h("img", { src: fav, alt: "", width: "16", height: "16", loading: "lazy" }))
      : h("span", { class: "rum-fav is-ini", "aria-hidden": "true", text: rumourInitials(name) });
    return extLink(s.url, [mark, iconOnly ? null : h("span", { class: "rum-src-nm", text: name })], "rum-chip" + (iconOnly ? " icon-only" : ""));
  }
  function rumourSources(r, iconOnly) {
    var srcs = r.sources || [];
    if (!srcs.length) return null;
    return h("div", { class: "rum-srcs" },
      iconOnly ? null : h("span", { class: "rum-srcs-k", text: "Reported by" }),
      h("span", { class: "rum-chips" }, srcs.map(function (s) {
        var c = rumourSourceChip(s, iconOnly); if (iconOnly) c.setAttribute("title", s.name || ""); return c;
      })));
  }
  function rumourStepper(st, vertical) {
    var n = rumourStep(st), cls = rumourStatusClass(st);
    return h("ol", { class: "rum-steps " + cls + (vertical ? " is-v" : ""), "aria-label": "Status: " + RUM_STEPS[n] },
      RUM_STEPS.map(function (s, i) {
        var state = i < n ? "done" : i === n ? "now" : "next";
        return h("li", { class: state, "aria-current": i === n ? "step" : null },
          h("i", { "aria-hidden": "true" }), h("span", { text: s }));
      }));
  }
  function rumourMeta(r, withDate) {
    var age = rumourDaysAgo(r.first_seen), fresh = age != null && age <= 1;
    return h("p", { class: "rum-meta" },
      fresh ? h("span", { class: "rum-live" }, h("i", { "aria-hidden": "true" }), "Developing") : null,
      r.category ? h("span", { class: "rum-cat", text: r.category }) : null,
      withDate && r.first_seen ? h("time", { datetime: rumourDayKey(r.first_seen), text: "First seen " + rumourDayShort(r.first_seen) + (r.first_seen ? " \u00b7 " + ago(r.first_seen) : "") }) : null);
  }
  function rumourTitle(r, tag, homeLink) {
    var st = rumourStatusClass(r.status), label = r.headline || r.short_title;
    var href = (st === "promoted" && r.threat_id) ? "#threat/" + encodeURIComponent(r.threat_id) : homeLink ? "#rumours" : null;
    return h(tag, { class: "rum-h" }, href ? h("a", { href: href, text: label }) : label);
  }
  function rumourMore(art, r) {
    var href = (rumourStatusClass(r.status) === "promoted" && r.threat_id) ? "#threat/" + encodeURIComponent(r.threat_id) : null;
    if (!r.note && !href) return null;
    var btn = r.note ? h("button", { type: "button", class: "rum-more", "aria-expanded": "false", onclick: function () {
      var open = art.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.firstChild.textContent = open ? "Show less" : "Why it matters";
    } }, h("span", { text: "Why it matters" }), h("i", { class: "chev", "aria-hidden": "true" })) : null;
    return [
      h("div", { class: "rum-actions" }, btn, href ? h("a", { class: "rum-go", href: href, text: "Open threat page \u2192" }) : null),
      r.note ? h("div", { class: "rum-x" }, h("div", null, h("p", { class: "rum-note", text: r.note }))) : null
    ];
  }
  function rumourStatus(r) {
    var st = r.status || "Unconfirmed", cls = rumourStatusClass(st), parts = st.split(/\s+-\s+/);
    return h("p", { class: "rum-status " + cls }, h("b", { class: "rum-st", text: parts[0] }), parts[1] ? h("span", { text: parts[1] }) : null);
  }
  function rumourLead(r) {
    var cls = rumourStatusClass(r.status);
    var art = h("article", { class: "rum-lead " + cls });
    add(art, [
      h("div", { class: "rum-lead-main" },
        h("p", { class: "rum-eyebrow", text: "Lead report" }),
        rumourMeta(r, true),
        rumourTitle(r, "h2"),
        h("p", { class: "rum-claim", text: r.claim }),
        rumourSources(r)),
      h("aside", { class: "rum-lead-side" },
        h("p", { class: "rum-side-k", text: "Status" }),
        rumourStatus(r),
        rumourStepper(r.status, true)),
      h("div", { class: "rum-lead-act" }, rumourMore(art, r))
    ]);
    return art;
  }
  function rumourItem(r) {
    var cls = rumourStatusClass(r.status);
    var art = h("article", { class: "rum-item " + cls });
    add(art, [
      h("span", { class: "rum-node", "aria-hidden": "true" }),
      h("div", { class: "rum-body" },
        h("div", { class: "rum-main" },
          rumourMeta(r, false),
          rumourTitle(r, "h3"),
          h("p", { class: "rum-claim", text: r.claim }),
          rumourSources(r)),
        h("div", { class: "rum-side" }, rumourStatus(r), rumourStepper(r.status, true)),
        h("div", { class: "rum-act" }, rumourMore(art, r)))
    ]);
    return h("li", null, art);
  }
  function sortedRumours() {
    var rank = { promoted: 0, confirmed: 1, unconfirmed: 2 };
    return (RUMOURS.rumours || []).slice().sort(function (a, b) {
      return String(b.first_seen || "").localeCompare(String(a.first_seen || "")) ||
        (rank[rumourStatusClass(a.status)] - rank[rumourStatusClass(b.status)]) ||
        ((b.sources || []).length - (a.sources || []).length);
    });
  }
  function rumourCounts(list) {
    var c = { all: list.length, unconfirmed: 0, confirmed: 0, promoted: 0 };
    list.forEach(function (r) { c[rumourStatusClass(r.status)]++; });
    return c;
  }
  function rumourFilters(list, onPick) {
    var c = rumourCounts(list);
    var keys = [["all", "All"], ["unconfirmed", "Unconfirmed"], ["confirmed", "Confirmed"], ["promoted", "Promoted"]];
    return h("div", { class: "rum-filters", role: "tablist", "aria-label": "Filter by status" }, keys.map(function (k) {
      return h("button", { type: "button", role: "tab", class: "rum-f " + k[0] + (RUM_FILTER === k[0] ? " on" : ""),
        "aria-selected": RUM_FILTER === k[0] ? "true" : "false", onclick: function () { onPick(k[0]); } },
        h("span", { text: k[1] }), h("b", { text: String(c[k[0]]) }));
    }));
  }
  function rumourHelp() {
    return h("details", { class: "rum-help" },
      h("summary", null, h("span", { text: "How status works" })),
      h("dl", null,
        h("dt", { class: "unconfirmed", text: "Unconfirmed" }), h("dd", { text: "Reported by named sources, not yet confirmed by the victim or vendor." }),
        h("dt", { class: "confirmed", text: "Confirmed" }), h("dd", { text: "Confirmed by the victim, vendor or police. IOCs pending." }),
        h("dt", { class: "promoted", text: "Promoted" }), h("dd", { text: "IOCs published. Moved to a threat page." })));
  }
  function renderRumourHome() {
    var el = $("rumour-home"), nEl = $("rumour-n");
    if (!el) return;
    loadRumourFavs().then(function () {
      var list = sortedRumours();
      var open = list.filter(function (r) { return r.status !== "Promoted"; });
      var show = (open.length ? open : list).slice(0, 3);
      clear(el);
      show.forEach(function (r) {
        var cls = rumourStatusClass(r.status);
        el.appendChild(h("li", null, h("article", { class: "rum-item is-mini " + cls },
          h("span", { class: "rum-node", "aria-hidden": "true" }),
          h("div", { class: "rum-body" },
            h("p", { class: "rum-meta" },
              h("span", { class: "rum-st " + cls, text: (r.status || "Unconfirmed").split(/\s+-\s+/)[0] }),
              rumourDaysAgo(r.first_seen) <= 1 ? h("span", { class: "rum-live" }, h("i", { "aria-hidden": "true" }), "Developing")
                : h("time", { datetime: rumourDayKey(r.first_seen), text: ago(r.first_seen) })),
            rumourTitle(r, "h3", true),
            rumourSources(r, true)))));
      });
      if (nEl) nEl.textContent = list.length ? String(list.length) : "";
    });
  }
  function renderRumours() {
    var el = $("view-rumours");
    if (!el) return;
    document.title = "Rumours | IOCWatch";
    loadRumourFavs().then(function () {
      var list = sortedRumours();
      clear(el);
      el.classList.add("rum-page");
      var bar = h("div", { class: "rum-bar" }), body = h("div", { class: "rum-feed" });
      function draw() {
        clear(bar); clear(body);
        add(bar, [rumourFilters(list, function (k) { RUM_FILTER = k; draw(); }), rumourHelp()]);
        var shown = list.filter(function (r) { return RUM_FILTER === "all" || rumourStatusClass(r.status) === RUM_FILTER; });
        if (!shown.length) { body.appendChild(h("p", { class: "rum-empty", text: "Nothing " + RUM_FILTER + " right now." })); return; }
        body.appendChild(rumourLead(shown[0]));
        var rest = shown.slice(1);
        if (!rest.length) return;
        var groups = [], cur = null;
        rest.forEach(function (r) {
          var k = rumourDayKey(r.first_seen);
          if (!cur || cur.k !== k) { cur = { k: k, items: [] }; groups.push(cur); }
          cur.items.push(r);
        });
        body.appendChild(h("div", { class: "rum-tl" },
          h("h2", { class: "rum-tl-h", text: "Earlier reports" }),
          groups.map(function (g) {
            var lab = rumourDayLabel(g.k);
            return h("section", { class: "rum-day" },
              h("h3", { class: "rum-day-h" }, h("span", { text: lab[0] }), lab[1] ? h("small", { text: lab[1] }) : null),
              h("ol", { class: "rum-tl-list" }, g.items.map(rumourItem)));
          })));
      }
      draw();
      var c = rumourCounts(list);
      add(el, [
        h("header", { class: "rum-head" },
          h("div", null,
            h("p", { class: "kick", text: "Early reports" }),
            h("h1", null, "Rumours"),
            h("p", { class: "rum-intro", text: "Early reports from named sources. No IOCs yet. Never on the block list." })),
          h("p", { class: "rum-stat" },
            h("b", { text: String(c.all) }), h("span", { text: c.all === 1 ? "open report" : "open reports" }),
            RUMOURS.updated ? h("small", { text: "Updated " + rumourDayShort(RUMOURS.updated) }) : null)),
        list.length ? [bar, body] : h("p", { class: "rum-empty", text: "No rumours right now." })
      ]);
    });
  }
  function loadRumours() {
    return fetch("rumours.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (d && d.rumours) RUMOURS = d;
      renderRumourHome();
      if (VIEW === "rumours") renderRumours();
    }, function () { renderRumourHome(); });
  }

  /* Routing: #threat/<id> opens a threat, #search/<value> runs a search, anything else shows the feed. */
  function route() {
    var hash = location.hash.replace(/^#/, "");
    if (hash.indexOf("threat/") === 0) {
      showView("threat");
      renderDetail(decodeURIComponent(hash.slice(7)));
      window.scrollTo(0, 0);
      return;
    }
    document.title = "IOCWatch – AI threat intelligence";
    if (hash.indexOf("search/") === 0) {
      showView("home");
      var q = decodeURIComponent(hash.slice(7));
      if ($("q")) $("q").value = q;
      runSearch(q);
      if ($("search-form")) $("search-form").scrollIntoView({ block: "center" });
      return;
    }
    var top = hash.split("/")[0].split("=")[0];
    var homeSecs = { check: "search-form", "search-h": "search-form", features: "get-h" };
    if (homeSecs[top]) {
      showView("home");
      setTimeout(function () { var el = $(homeSecs[top]); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 0);
      return;
    }
    var viewMap = { darkweb: "darkweb", live: "live", block: "block", hunts: "hunts", sources: "sources", about: "about", threats: "threats", rumours: "rumours", "feed-sec": "threats", "feed-h": "threats", "all-h": "block" };
    if (top === "page") {
      var pm = /^page=(\d+)$/.exec(hash), want = pm ? Math.max(1, parseInt(pm[1], 10)) : 1;
      showView("threats");
      if (DATA && want !== PAGE) { PAGE = want; renderFeed(true); }
      window.scrollTo(0, 0);
      return;
    }
    if (viewMap[top]) {
      var v = viewMap[top];
      showView(v);
      if (v === "block") renderBlock();
      if (v === "hunts") renderHunts();
      if (v === "sources") renderSources();
      if (v === "live") renderLivePage();
      if (v === "darkweb" && window.renderDarkweb) window.renderDarkweb();
      window.scrollTo(0, 0);
      if (hash === "threats/map") setTimeout(function () { var mp = $("tmap"); if (mp) mp.scrollIntoView({ behavior: "smooth", block: "start" }); }, 60);
      return;
    }
    showView("home");
  }
  /* ---- Identity build: product showcase, trusted sources, feature visuals, threat map, scroll reveal ---- */
  var NEWSY = /^(BleepingComputer|The Hacker News|X|Security Online|The Register|The Stack|Mint|SecurityWeek|GBHackers|Dark Reading|The Record|Help Net Security|Infosecurity|CyberScoop|Hackread|Cybernews|SC Media|TechCrunch|Threadlinqs|ransomware\.live|SOCRadar)/i;
  function svgIcon(d, size) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("width", size || 16); s.setAttribute("height", size || 16); s.setAttribute("aria-hidden", "true");
    s.setAttribute("class", "ico");
    d.split("|").forEach(function (pd) { var p = document.createElementNS("http://www.w3.org/2000/svg", "path"); p.setAttribute("d", pd); s.appendChild(p); });
    return s;
  }
  var ICO = {
    file: "M7 3.5h7l4 4v13H7Z|M14 3.5v4h4", shield: "M12 3.5 5 6.2v5.3c0 4.1 2.9 7.6 7 8.9 4.1-1.3 7-4.8 7-8.9V6.2Z|m9 12 2 2 4-4",
    dl: "M12 4v11|m7 10 5 5 5-5|M5 20h14", code: "m8 8-4 4 4 4|m16 8 4 4-4 4|m13.5 5-3 14", pulse: "M3 12h4l2.5-6 5 12L17 12h4",
    globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z|M3 12h18|M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z",
    target: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z|M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
  };
  var HUNT_CACHE = {};
  function codeLines(txt, n) {
    return String(txt || "").split(/\r?\n/).filter(function (l) { return l.trim() && !/^\s*(\/\/|#|``)/.test(l); }).slice(0, n || 9);
  }
  function hl(line) {
    var out = h("span", { class: "cl" }), re = /("(?:[^"\\]|\\.)*")|\b(let|where|union|project|extend|summarize|join|kind|on|in|has_any|dynamic|ago|and|or|not|by|count|distinct|order|take|isnotempty|tostring|search|stats|eval|table|rename|tstats|from|datamodel|values|as|rule|meta|events|match|condition|over)\b|(\|)/g, last = 0, m;
    while ((m = re.exec(line))) {
      if (m.index > last) out.appendChild(document.createTextNode(line.slice(last, m.index)));
      out.appendChild(h("span", { class: m[1] ? "c-s" : m[2] ? "c-k" : "c-p", text: m[0] }));
      last = re.lastIndex;
    }
    if (last < line.length) out.appendChild(document.createTextNode(line.slice(last)));
    return out;
  }
  function chips(t) {
    var hunt = huntOf(t), c = [];
    if (t.block_now_count) c.push(h("span", { class: "chip c-blk" }, h("b", { text: String(t.block_now_count) }), " to block"));
    if (hunt) c.push(h("span", { class: "chip c-hunt" }, h("b", { text: String(hunt) }), " to hunt"));
    if (t.ioa_count) c.push(h("span", { class: "chip c-ioa" }, h("b", { text: String(t.ioa_count) }), " " + (t.ioa_count === 1 ? "behaviour" : "behaviours")));
    return h("div", { class: "chips" }, c);
  }
  function renderShowcase() {
    var main = $("win-main");
    if (!main || !DATA) return;
    var t = byEntry()[0];
    if ($("win-url")) $("win-url").textContent = "iocwatch.com/#threat/" + t.id.slice(0, 28) + (t.id.length > 28 ? "\u2026" : "");
    var qs = (t.queries || []).filter(function (q) { return q && q.url; });
    var code = h("pre", { class: "win-code" }, h("code", null, h("span", { class: "cl dim" }, "Loading hunt\u2026")));
    var tabs = h("div", { class: "win-tabs", role: "presentation" }, qs.map(function (q, i) {
      return h("span", { class: "win-tab" + (i ? "" : " on") }, q.platform, h("i", { text: q.language }));
    }));
    var inds = t.indicators.filter(function (x) { return x.recommended_action === "block"; }).slice(0, 3);
    if (!inds.length) inds = t.indicators.slice(0, 3);
    var tbl = h("div", { class: "win-inds" }, inds.map(function (x) {
      return h("div", { class: "wi" }, h("span", { class: "wi-v", text: defang(x.value, x.type) }), h("span", { class: "wi-t", text: typeLabel(x.type) }),
        h("span", { class: "wi-a a-" + x.recommended_action, text: x.recommended_action === "block" ? "Block" : x.recommended_action === "hunt" ? "Hunt" : "Monitor" }));
    }));
    add(clear(main), h("a", { class: "win-card", href: "#threat/" + encodeURIComponent(t.id), "aria-label": "Open " + stitle(t) },
      h("div", { class: "wc-top" }, h("span", { class: "wc-cat", text: t.category }), isFresh(t.entry_date, 24) ? h("span", { class: "new", text: "New" }) : null,
        h("time", { class: "wc-ago", "data-d": t.entry_date, text: ago(t.entry_date) })),
      h("h3", { class: "wc-t", text: stitle(t) }), h("p", { class: "wc-full", text: t.name }), chips(t),
      h("div", { class: "wc-sec" }, h("span", { class: "wc-h hunt-h", text: "Hunt" }), tabs, code),
      h("div", { class: "wc-sec" }, h("span", { class: "wc-h", text: "Indicators" }), tbl)));
    var q0 = qs[0];
    function put(txt) {
      var lines = codeLines(txt, 8);
      if (!lines.length) lines = ["// Open the threat for the full hunt"];
      add(clear(code.firstChild), lines.map(hl));
    }
    if (q0) {
      if (HUNT_CACHE[q0.url]) put(HUNT_CACHE[q0.url]);
      else fetch(q0.url).then(function (r) { return r.ok ? r.text() : ""; }).then(function (x) { HUNT_CACHE[q0.url] = x; put(x); }, function () { put(""); });
    } else put("");
    renderTrust(); renderVisuals();
    var fu = $("foot-upd");
    if (fu) { fu.setAttribute("data-d", DATA.last_updated); fu.textContent = ago(DATA.last_updated); }
  }
  function renderTrust() {
    var el = $("trust-list");
    if (!el || el.firstChild) return;
    var n = {};
    DATA.threats.forEach(function (t) {
      var seen = {};
      (t.sources || []).forEach(function (s) {
        var nm = String(s.name || "").replace(/\s*\(\d+\)$/, "").replace(/ Security Research$| Threat Intelligence$| Labs$/, "");
        if (!nm || NEWSY.test(nm) || /\./.test(nm) || seen[nm]) return;
        seen[nm] = 1; n[nm] = (n[nm] || 0) + 1;
      });
    });
    Object.keys(n).sort(function (a, b) { return n[b] - n[a] || a.localeCompare(b); }).slice(0, 10)
      .forEach(function (nm) { el.appendChild(h("li", { title: plural(n[nm], "threat") + " cite " + nm, text: nm })); });
  }
  function renderVisuals() {
    var vb = $("vis-block"), vh = $("vis-hunt"), vp = $("vis-page");
    if (vb) {
      var by = {}, tot = 0;
      ALL_IND.forEach(function (x) { if (x.ind.recommended_action === "block") { by[x.ind.type] = (by[x.ind.type] || 0) + 1; tot++; } });
      var days = [], now = Date.now(), per = {};
      DATA.threats.forEach(function (t) { var d = t.entry_date.slice(0, 10); per[d] = (per[d] || 0) + t.block_now_count; });
      for (var i = 13; i >= 0; i--) { var d = new Date(now - i * 86400000).toISOString().slice(0, 10); days.push(per[d] || 0); }
      var mx = Math.max.apply(null, days.concat([1]));
      var files = [["block_now_ipv4.txt", "ipv4", "IPv4"], ["block_now_domain.txt", "domain", "Domains"], ["block_now_url.txt", "url", "URLs"], ["block_now_sha256.txt", "sha256", "SHA256"]];
      add(clear(vb), [h("div", { class: "vc-head" }, h("span", { class: "vc-ico" }, svgIcon(ICO.shield)), h("div", null, h("b", { class: "vc-big", text: tot.toLocaleString("en-GB") }), h("span", { class: "vc-l", text: "indicators ready to block" }))),
        h("div", { class: "spark", "aria-label": "Block-list additions over the last 14 days" }, days.map(function (v) { var b = h("i"); b.style.height = Math.max(6, Math.round(v / mx * 100)) + "%"; if (!v) b.className = "z"; return b; })),
        h("ul", { class: "vc-files" }, files.map(function (f) {
          return h("li", null, svgIcon(ICO.file), h("span", { class: "vf-n", text: f[0] }), h("span", { class: "vf-c", text: (by[f[1]] || 0).toLocaleString("en-GB") }), h("span", { class: "vf-dl" }, svgIcon(ICO.dl, 14)));
        })),
        h("p", { class: "vc-foot" }, "Plus a Defender XDR import file and a CSV of every indicator.")]);
    }
    if (vh) {
      var pc = {}, ioa = 0;
      DATA.threats.forEach(function (t) { (t.queries || []).forEach(function (q) { if (q && q.url) pc[q.platform] = (pc[q.platform] || 0) + 1; }); ioa += t.ioa_count || 0; });
      var plats = [["Defender XDR", "KQL", "Advanced hunting"], ["Splunk", "SPL", "CIM data models"], ["Google SecOps", "YARA-L 2.0", "Rules and Retrohunt"]];
      add(clear(vh), [h("div", { class: "vc-head" }, h("span", { class: "vc-ico" }, svgIcon(ICO.code)), h("div", null, h("b", { class: "vc-big", text: String(DATA.threat_count) }), h("span", { class: "vc-l", text: "threats with ready-to-run hunts" }))),
        h("ul", { class: "vc-plats" }, plats.map(function (p, i) {
          return h("li", { class: i ? "" : "on" }, h("span", { class: "vp-n", text: p[0] }), h("span", { class: "vp-l", text: p[1] }), h("span", { class: "vp-d", text: p[2] }), h("span", { class: "vp-c", text: (pc[p[0]] || 0) + " hunts" }));
        })),
        h("div", { class: "vc-ioa" }, svgIcon(ICO.pulse), h("span", null, h("b", { text: String(ioa) }), " behaviours mapped to log fields, for what indicators miss"))]);
    }
    if (vp) {
      var t = DATA.threats.filter(function (x) { return tg(x).countries.length && (x.mitre || []).length; })[0] || DATA.threats[1] || DATA.threats[0];
      var g = tg(t);
      add(clear(vp), [h("div", { class: "vpg-crumb" }, "Threats / ", h("span", { text: stitle(t) })),
        h("h3", { class: "vpg-t", text: stitle(t) }), h("p", { class: "vpg-full", text: t.name }), chips(t),
        h("div", { class: "vpg-hunt" }, h("span", { class: "vpg-h", text: "Look for" }), h("span", { class: "vpg-bar w1" }), h("span", { class: "vpg-bar w2" }), h("span", { class: "vpg-h", text: "Why it matters" }), h("span", { class: "vpg-bar w3" })),
        h("div", { class: "vpg-tags" }, g.countries.slice(0, 3).map(function (c) { return h("span", { class: "tag", text: c.name }); }).concat((t.mitre || []).slice(0, 3).map(function (m) { return h("span", { class: "tag mono", text: m.id }); })))]);
    }
  }
  /* Threat map: countries named by sources (targets), Equal Earth outline from /img/world.svg. */
  var MAP_DONE = false, MAP_GEO = null;
  function mapCounts() {
    var c = {}, names = {}, none = 0, regs = {};
    DATA.threats.forEach(function (t) {
      var g = tg(t);
      if (!geoKeys(t).length) none++;
      g.countries.forEach(function (x) { c[x.code] = (c[x.code] || 0) + 1; names[x.code] = x.name; });
      g.regions.forEach(function (r) { regs[r] = (regs[r] || 0) + 1; });
    });
    return { c: c, names: names, none: none, regs: regs };
  }
  function pickMap(k) {
    var f = $("f-country");
    f.value = f.value === k ? "" : k;
    renderFeed();
    var fl = $("feed"); if (fl) fl.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function markMap(gk) {
    var host = $("tmap");
    if (!host) return;
    Array.prototype.forEach.call(host.querySelectorAll("[data-k]"), function (el) {
      var on = el.getAttribute("data-k") === gk;
      el.classList.toggle("sel", on);
      if (el.tagName === "BUTTON") el.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  function renderMap() {
    if (MAP_DONE || !DATA || !$("tmap-map")) return;
    MAP_DONE = true;
    var m = MAP_GEO = mapCounts(), codes = Object.keys(m.c).sort(function (a, b) { return m.c[b] - m.c[a] || m.names[a].localeCompare(m.names[b]); });
    var mx = codes.length ? m.c[codes[0]] : 1;
    function lvl(n) { return n >= mx * 0.75 ? 4 : n >= mx * 0.45 ? 3 : n >= 2 ? 2 : 1; }
    var top = clear($("tmap-top"));
    codes.slice(0, 8).forEach(function (cd) {
      var bar = h("i"); bar.style.width = Math.max(6, Math.round(m.c[cd] / mx * 100)) + "%";
      top.appendChild(h("li", null, h("button", { type: "button", "data-k": "c:" + cd, "aria-pressed": "false", onclick: function () { pickMap("c:" + cd); } },
        h("span", { class: "tt-n" }, flagImg(cd, m.names[cd]), h("span", { text: m.names[cd] })), h("span", { class: "tt-v", text: String(m.c[cd]) }), h("span", { class: "tt-bar" }, bar))));
    });
    var ns = clear($("tmap-ns"));
    add(ns, [h("button", { type: "button", class: "tmap-nsb", "data-k": "none", "aria-pressed": "false", onclick: function () { pickMap("none"); } },
      h("span", { class: "ns-l", text: "Not stated" }), h("b", { text: String(m.none) }), h("span", { class: "ns-d", text: "no country or region named" })),
      h("p", { class: "tmap-regs" }, "Regions: ", Object.keys(m.regs).sort(function (a, b) { return m.regs[b] - m.regs[a]; }).slice(0, 4).map(function (r, i) {
        return [i ? ", " : null, h("button", { type: "button", class: "link-btn", "data-k": "r:" + r, onclick: function () { pickMap("r:" + r); } }, r + " " + m.regs[r])];
      }))]);
    var box = $("tmap-map"), tip = $("tmap-tip");
    worldSvg().then(function (txt) {
      if (!txt) return;
      var doc = new DOMParser().parseFromString(txt, "image/svg+xml"), svg = document.importNode(doc.documentElement, true);
      box.insertBefore(svg, tip);
      var done = {};
      Array.prototype.forEach.call(svg.querySelectorAll(".wm-land path"), function (p) {
        var cd = p.getAttribute("data-c"), n = m.c[cd];
        if (!n) return;
        p.setAttribute("class", "hit l" + lvl(n)); p.setAttribute("data-k", "c:" + cd); done[cd] = 1;
      });
      Array.prototype.forEach.call(svg.querySelectorAll(".wm-lp circle"), function (c) {
        var cd = c.getAttribute("data-c"), n = m.c[cd];
        if (!n || done[cd] || c.getAttribute("data-used")) return;
        if (svg.querySelector('.wm-lp circle[data-used="' + cd + '"]')) return;
        c.setAttribute("data-used", cd);
        c.setAttribute("r", String(2.2 + Math.sqrt(n) * 1.6)); c.setAttribute("class", "dot l" + lvl(n)); c.setAttribute("data-k", "c:" + cd);
      });
      function show(e) {
        var el = e.target.closest ? e.target.closest("[data-k]") : null;
        if (!el || !box.contains(el)) { tip.hidden = true; return; }
        var cd = el.getAttribute("data-k").slice(2), r = box.getBoundingClientRect();
        add(clear(tip), [h("b", null, flagImg(cd, m.names[cd] || cd), " " + (m.names[cd] || cd)), h("span", { text: plural(m.c[cd], "threat") + " \u00b7 click to filter" })]);
        tip.hidden = false;
        tip.style.left = Math.min(r.width - 170, Math.max(8, e.clientX - r.left + 12)) + "px";
        tip.style.top = Math.max(8, e.clientY - r.top - 44) + "px";
      }
      svg.addEventListener("mousemove", show);
      svg.addEventListener("mouseleave", function () { tip.hidden = true; });
      svg.addEventListener("click", function (e) { var el = e.target.closest && e.target.closest("[data-k]"); if (el) pickMap(el.getAttribute("data-k")); });
      markMap($("f-country").value);
    }, function () {});
  }
  /* World outline text, fetched once and shared by both map views. */
  var WORLD_P = null;
  function worldSvg() {
    if (!WORLD_P) WORLD_P = fetch("/img/world.svg").then(function (r) { return r.ok ? r.text() : ""; }, function () { return ""; });
    return WORLD_P;
  }
  /* Live map page (#live): public sensor networks and feeds, from /live_map.json (rebuilt by the scheduled deploy). */
  var LM = { data: null, timer: null, tick: null, pool: [], idx: 0, svg: null, layer: null, pos: null, dots: {}, off: {}, refresh: null };
  var LM_CATS = [
    { k: "scan", name: "Scanning and brute force", short: "Scanning" },
    { k: "phish", name: "Phishing", short: "Phishing" },
    { k: "c2", name: "Malware C2", short: "Malware C2" },
    { k: "ransom", name: "Ransomware claims", short: "Ransomware" },
    { k: "cve", name: "Exploited and critical CVEs", short: "CVEs" }
  ];
  var LM_OFF = { scan: [0, 0], phish: [3.2, -2.2], c2: [-3.2, 2.2], ransom: [2.4, 3] };
  function lmAgo(iso) {
    var t = Date.parse(iso); if (isNaN(t)) return "";
    var m = Math.max(0, Math.round((Date.now() - t) / 60000));
    return m < 1 ? "just now" : m < 60 ? m + "m ago" : m < 1440 ? Math.floor(m / 60) + "h ago" : Math.floor(m / 1440) + "d ago";
  }
  function lmWhen(e) {
    if (e.within != null) return "< " + Math.max(5, e.within) + "m ago";
    if (e.label_when) return e.label_when;
    if (e.day) { var d = Date.parse(e.ts); return isNaN(d) ? "" : (Date.now() - d < 86400000 ? "today" : lmAgo(e.ts)); }
    return lmAgo(e.ts);
  }
  function lmDay(d) { var t = Date.parse(d); return isNaN(t) ? (d || "") : new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }); }
  function lmNum(n) { return n == null ? "\u2013" : n >= 100000 ? (Math.round(n / 1000) + "k") : fmtNum(n); }
  function lmLoad() {
    return fetch("/live_map.json", { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  function renderLivePage() {
    var root = $("view-live");
    if (!root) return;
    document.title = "Live map | IOCWatch";
    if (!LM.refresh) {
      LM.refresh = setInterval(function () { if (VIEW === "live" && !document.hidden) lmLoad().then(lmApply, function () {}); }, 300000);
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden && VIEW === "live" && LM.data && Date.now() - Date.parse(LM.data.updated) > 300000) lmLoad().then(lmApply, function () {});
      });
    }
    if (LM.data) { lmUpd(); return; }
    Promise.all([worldSvg(), lmLoad()]).then(function (res) { lmMap(res[0]); lmApply(res[1]); }, function () {
      var u = $("lv-upd"); if (u) u.textContent = "Live data is unavailable right now. Try again in a few minutes.";
    });
  }
  function lmUpd() {
    var d = LM.data, u = $("lv-upd"); if (!u || !d) return;
    clear(u); add(u, [h("span", { class: "live-dot", "aria-hidden": "true" }), "Updated " + lmAgo(d.updated) + " \u00b7 refreshes every 15 min"]);
  }
  function lmMap(txt) {
    var box = $("lv-map"); if (!txt || !box || LM.svg) return;
    var doc = new DOMParser().parseFromString(txt, "image/svg+xml"), svg = document.importNode(doc.documentElement, true);
    svg.setAttribute("aria-label", "Live map of attack activity by country");
    box.insertBefore(svg, $("lv-tip"));
    var NS = "http://www.w3.org/2000/svg", layer = document.createElementNS(NS, "g"), pos = {};
    layer.setAttribute("class", "lm-layer");
    Array.prototype.forEach.call(svg.querySelectorAll(".wm-lp circle"), function (c) {
      var cd = c.getAttribute("data-c"); if (cd && !pos[cd]) pos[cd] = [+c.getAttribute("cx"), +c.getAttribute("cy")];
    });
    svg.appendChild(layer);
    LM.svg = svg; LM.layer = layer; LM.pos = pos;
    var tip = $("lv-tip");
    function show(e) {
      var el = e.target.closest ? e.target.closest("[data-cc]") : null, cd = el ? el.getAttribute("data-cc") : null;
      if (!cd) { var p = e.target.closest && e.target.closest(".wm-land path.lm-src"); if (p) cd = p.getAttribute("data-c"); }
      var c = cd && LM.byCc && LM.byCc[cd];
      if (!c) { tip.hidden = true; return; }
      var r = box.getBoundingClientRect(), nm = countryName(cd), bits = [];
      if (c.scan) bits.push(h("span", { class: "c-scan" }, h("b", { text: fmtNum(c.scan) }), " scanning IPs (1h)"));
      if (c.dshield) bits.push(h("span", { class: "c-scan" }, h("b", { text: lmNum(c.dshield) }), " DShield reports today"));
      if (c.phish) bits.push(h("span", { class: "c-phish" }, h("b", { text: fmtNum(c.phish) }), " phishing hosts"));
      if (c.c2) bits.push(h("span", { class: "c-c2" }, h("b", { text: fmtNum(c.c2) }), " malware C2"));
      if (c.ransom) bits.push(h("span", { class: "c-ransom" }, h("b", { text: fmtNum(c.ransom) }), " ransomware claims (24h)"));
      if (c.tor) bits.push(h("span", { class: "dim", text: fmtNum(c.tor) + " Tor exits (context)" }));
      add(clear(tip), [h("b", null, flagImg(cd, nm), " " + nm), bits, c.top ? h("span", { class: "lm-tk", text: "Mostly: " + c.top }) : null]);
      tip.hidden = false;
      tip.style.left = Math.min(r.width - 250, Math.max(8, e.clientX - r.left + 12)) + "px";
      tip.style.top = Math.max(8, e.clientY - r.top - 90) + "px";
    }
    svg.addEventListener("mousemove", show);
    svg.addEventListener("click", show);
    svg.addEventListener("mouseleave", function () { tip.hidden = true; });
  }
  function lmApply(d) {
    if (!d || !d.countries) return;
    LM.data = d; LM.byCc = {};
    d.countries.forEach(function (c) { LM.byCc[c.cc] = c; });
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lmUpd();
    // Infocon
    var ic = $("lv-infocon"), lvl = String(d.infocon || "").toLowerCase();
    if (ic) { clear(ic); if (lvl) add(ic, ["DShield Infocon ", h("b", { class: "ic-" + lvl, text: lvl.charAt(0).toUpperCase() + lvl.slice(1) })]); }
    // Category counters (also map layer toggles)
    var cs = clear($("lv-cats")), cats = d.cats || {};
    LM_CATS.forEach(function (c) {
      var v = cats[c.k] || {}, main, sub;
      if (c.k === "scan") { main = lmNum(v.h1); sub = "IPs in the last hour \u00b7 " + lmNum(v.d1) + " sources today"; }
      else if (c.k === "phish") { main = lmNum(v.d1); sub = "phishing URLs, last 12h"; }
      else if (c.k === "c2") { main = lmNum(v.d1); sub = v.h1 != null ? "C2 servers \u00b7 " + lmNum(v.h1) + " new IOCs (1h)" : "botnet C2 servers online (30d)"; }
      else if (c.k === "ransom") { main = lmNum(v.d1); sub = "claims in 24h \u00b7 " + lmNum(v.h1) + " in the last hour"; }
      else { main = lmNum(v.d1); sub = "critical CVEs (24h) \u00b7 " + lmNum(v.kev7) + " added to KEV (7d)"; }
      var btn = h("button", { type: "button", class: "lv-cat k-" + c.k + (LM.off[c.k] ? " off" : ""), "aria-pressed": LM.off[c.k] ? "false" : "true", title: c.k === "cve" ? c.name : "Show or hide on the map",
        onclick: c.k === "cve" ? null : function () { LM.off[c.k] = !LM.off[c.k]; btn.classList.toggle("off", !!LM.off[c.k]); btn.setAttribute("aria-pressed", LM.off[c.k] ? "false" : "true"); lmDots(reduce); } },
        h("span", { class: "lv-cat-n" }, h("i", { "aria-hidden": "true" }), c.name), h("b", { class: "lv-cat-v", text: main }), h("span", { class: "lv-cat-s", text: sub }));
      cs.appendChild(btn);
    });
    lmDots(reduce);
    // Top countries
    var top = clear($("lv-top")), tops = d.countries.slice(0, 6), mx = tops.length ? tops[0].s : 1;
    tops.forEach(function (c) {
      var nm = countryName(c.cc), bar = h("i"), bits = [];
      bar.style.width = Math.max(6, Math.round(c.s / mx * 100)) + "%";
      if (c.scan) bits.push(h("span", { class: "c-scan", text: fmtNum(c.scan) + " scanning" }));
      if (c.phish) bits.push(h("span", { class: "c-phish", text: fmtNum(c.phish) + " phishing" }));
      if (c.c2) bits.push(h("span", { class: "c-c2", text: fmtNum(c.c2) + " C2" }));
      if (c.ransom) bits.push(h("span", { class: "c-ransom", text: fmtNum(c.ransom) + " ransomware" }));
      top.appendChild(h("li", null, h("div", { class: "lv-tc", onmouseenter: function () { lmFlash(c.cc); } },
        h("span", { class: "tt-n" }, flagImg(c.cc, nm), h("span", { text: nm })),
        h("span", { class: "lv-tc-b" }, bits.map(function (b, i) { return [i ? " \u00b7 " : null, b]; })), h("span", { class: "tt-bar" }, bar))));
    });
    // Ports
    var pl = clear($("lv-ports")), ports = d.ports || [], pm = ports.length ? ports[0].records : 1;
    ports.slice(0, 6).forEach(function (p) {
      var bar = h("i"); bar.style.width = Math.max(6, Math.round(p.records / pm * 100)) + "%";
      pl.appendChild(h("li", null, h("span", { class: "lv-port" }, h("b", { text: String(p.port) }), " " + (p.name || "")),
        h("span", { class: "lv-port-v", text: lmNum(p.records) + " reports \u00b7 " + lmNum(p.sources) + " IPs" }), h("span", { class: "tt-bar" }, bar)));
    });
    // Ransomware claims (group, country, time only)
    var rl = clear($("lv-ransom"));
    (d.ransom || []).slice(0, 7).forEach(function (x) {
      var nm = x.cc ? countryName(x.cc) : "Country not stated";
      rl.appendChild(h("li", null, x.cc ? flagImg(x.cc, nm) : h("span", { class: "visits-flag lv-noflag", "aria-hidden": "true" }),
        h("span", { class: "lv-rw" }, h("b", { class: "c-ransom", text: x.group }), " \u00b7 " + nm), h("time", { datetime: x.ts, text: lmAgo(x.ts) })));
    });
    if (!rl.firstChild) rl.appendChild(h("li", { class: "dim", text: "No new claims in the last 24 hours." }));
    // CVEs
    var cl = clear($("lv-cves"));
    (d.cves || []).slice(0, 4).forEach(function (x) {
      cl.appendChild(h("li", null, h("a", { href: "https://www.cve.org/CVERecord?id=" + x.id, target: "_blank", rel: "noopener" },
        h("span", { class: "lv-cve" }, h("b", { class: "c-crit", text: x.id }), x.score ? h("span", { class: "c-crit", text: " CVSS " + x.score }) : null, x.kev ? h("span", { class: "c-cve", text: " \u00b7 in KEV" }) : null, h("time", { datetime: x.ts, text: lmAgo(x.ts) })),
        h("span", { class: "lv-cve-d", text: x.what }))));
    });
    (d.kev || []).slice(0, 3).forEach(function (x) {
      cl.appendChild(h("li", null, h("a", { href: "https://www.cve.org/CVERecord?id=" + x.id, target: "_blank", rel: "noopener" },
        h("span", { class: "lv-cve" }, h("b", { class: "c-cve", text: x.id }), h("span", { class: "c-cve", text: " \u00b7 added to CISA KEV" }), x.ransomware ? h("span", { class: "c-ransom", text: " \u00b7 used by ransomware" }) : null, h("time", { text: lmDay(x.day) })),
        h("span", { class: "lv-cve-d", text: x.what }))));
    });
    // Sources
    var sr = clear($("lv-src"));
    add(sr, ["Sources: ", (d.sources || []).map(function (s, i) { return [i ? ", " : null, h("a", { href: s.url, target: "_blank", rel: "noopener", title: s.what + (s.licence ? " (" + s.licence + ")" : ""), text: s.name })]; }),
      ". Countries show where attacking infrastructure is hosted (or where a ransomware victim is based), not who is behind it."]);
    // Ticker
    LM.pool = (d.ticker || []).slice(); LM.idx = 0;
    lmTicker(reduce);
  }
  function lmDots(reduce) {
    var d = LM.data, layer = LM.layer, pos = LM.pos; if (!d || !layer) return;
    while (layer.firstChild) layer.removeChild(layer.firstChild);
    LM.dots = {};
    Array.prototype.forEach.call(LM.svg.querySelectorAll(".wm-land path"), function (p) {
      p.setAttribute("class", LM.byCc[p.getAttribute("data-c")] ? "lm-src" : "");
    });
    var NS = "http://www.w3.org/2000/svg", mx = {};
    ["scan", "phish", "c2", "ransom"].forEach(function (k) { mx[k] = 1; d.countries.forEach(function (c) { mx[k] = Math.max(mx[k], lmVal(c, k)); }); });
    ["scan", "phish", "c2", "ransom"].forEach(function (k) {
      if (LM.off[k]) return;
      var rows = d.countries.filter(function (c) { return lmVal(c, k) > 0 && pos[c.cc]; }).sort(function (a, b) { return lmVal(a, k) - lmVal(b, k); });
      rows.forEach(function (c, i) {
        var p = pos[c.cc], o = LM_OFF[k], q = Math.sqrt(lmVal(c, k) / mx[k]), r = (k === "scan" ? 1.4 : 1.8) + q * (k === "scan" ? 5.5 : 4.2);
        var g = document.createElementNS(NS, "g");
        g.setAttribute("class", "lm-pt k-" + k); g.setAttribute("data-cc", c.cc);
        g.setAttribute("transform", "translate(" + (p[0] + o[0]) + " " + (p[1] + o[1]) + ")");
        if (!reduce && (q > 0.18 || k === "ransom" || k === "c2")) {
          var rp = document.createElementNS(NS, "circle"); rp.setAttribute("class", "lm-ring"); rp.setAttribute("r", String(r));
          rp.style.animationDelay = (-((i * 0.53) % 3.2)).toFixed(2) + "s"; g.appendChild(rp);
        }
        var dot = document.createElementNS(NS, "circle"); dot.setAttribute("class", "lm-dot"); dot.setAttribute("r", String(r)); g.appendChild(dot);
        layer.appendChild(g);
        (LM.dots[c.cc] = LM.dots[c.cc] || {})[k] = g;
      });
    });
  }
  function lmVal(c, k) { return k === "scan" ? (c.scan || 0) + (c.dshield || 0) / 2000 + (c.scanlist || 0) / 40 : (c[k] || 0); }
  function lmFlash(cc, k) {
    if (!LM.layer) return;
    Array.prototype.forEach.call(LM.layer.querySelectorAll(".lm-pt.flash"), function (g) { g.classList.remove("flash"); });
    var set = LM.dots[cc]; if (!set) return;
    var g = (k && set[k]) || set.scan || set[Object.keys(set)[0]];
    if (g) { void g.getBoundingClientRect(); g.classList.add("flash"); }
  }
  function lmRow(e) {
    var nm = e.cc ? countryName(e.cc) : "", body;
    if (e.cat === "ransom") body = [h("b", { text: "Ransomware claim" }), " \u00b7 " + e.kind.replace(/^Ransomware claim by /, "") + (nm ? " \u00b7 victim in " + nm : "")];
    else if (e.cat === "cve") body = [h("b", { text: e.kind }), e.what ? " \u00b7 " + e.what : ""];
    else if (e.cat === "phish") body = [h("b", { text: "Phishing sites" }), " hosted in " + nm + " \u00b7 " + fmtNum(e.n)];
    else if (e.cat === "c2") body = [h("b", { text: e.kind }), nm ? " in " + nm : ""];
    else body = [h("b", { text: e.kind }), " from " + nm + " \u00b7 " + fmtNum(e.n) + " " + e.unit + (e.n === 1 ? "" : "s") + (e.targets ? " \u00b7 up to " + fmtNum(e.targets) + " sensors" : "")];
    return h("li", { class: "lv-row k-" + e.cat }, h("i", { class: "lv-k", "aria-hidden": "true" }),
      e.cc ? flagImg(e.cc, nm) : h("span", { class: "visits-flag lv-noflag", "aria-hidden": "true" }),
      h("span", { class: "lv-what" }, body), h("span", { class: "lv-when" }, lmWhen(e), h("span", { class: "lv-srcn", text: e.src })));
  }
  function lmTicker(reduce) {
    var tk = clear($("lv-ticker")), pool = LM.pool, keep = window.matchMedia && window.matchMedia("(max-width: 720px)").matches ? 5 : 9;
    if (LM.tick) { clearInterval(LM.tick); LM.tick = null; }
    if (!pool.length) { tk.appendChild(h("li", { class: "lv-row dim", text: "No live events in this snapshot." })); return; }
    for (var i = 0; i < Math.min(keep, pool.length); i++) { var r0 = lmRow(pool[LM.idx++ % pool.length]); r0.classList.add("in"); tk.appendChild(r0); }
    if (reduce || pool.length <= keep) return;
    LM.tick = setInterval(function () {
      if (document.hidden || VIEW !== "live") return;
      var e = pool[LM.idx++ % pool.length], row = lmRow(e);
      tk.insertBefore(row, tk.firstChild);
      requestAnimationFrame(function () { requestAnimationFrame(function () { row.classList.add("in"); }); });
      while (tk.children.length > keep) tk.removeChild(tk.lastChild);
      if (e.cc) lmFlash(e.cc, e.cat);
    }, 4000);
  }
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) { Array.prototype.forEach.call(els, function (e) { e.classList.add("in"); }); return; }
    document.documentElement.classList.add("rv");
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(els, function (e) { io.observe(e); });
  }
  function init(data) {
    DATA = data;
    DATA.threats.forEach(function (t) { t.indicators.forEach(function (ind) { ALL_IND.push({ ind: ind, threat: t }); }); });
    if (window.matchMedia && window.matchMedia("(max-width: 720px)").matches) {
      Array.prototype.forEach.call(document.querySelectorAll("details.rail-box, details.filt-box"), function (x) { x.open = false; });
    }
    renderStats();
    fillFilters();
    renderMap();
    initReveal();
    fillNavCounts();
    renderFeed();
    loadRumours();
    renderAllFiles();
    if ($("q-list")) $("q-list").addEventListener("input", function () { renderFeed(); });
    if ($("list-search")) $("list-search").addEventListener("submit", function (e) { e.preventDefault(); renderFeed(); });
    var tog = $("nav-toggle"), back = $("nav-backdrop");
    if (tog) tog.addEventListener("click", function () {
      var open = !document.body.classList.contains("nav-open");
      document.body.classList.toggle("nav-open", open);
      tog.setAttribute("aria-expanded", open ? "true" : "false");
      if (back) back.hidden = !open;
    });
    if (back) back.addEventListener("click", closeNav);
    var onScroll = function () { document.body.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    $("search-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var q = $("q").value;
      if (refang(q)) history.replaceState(null, "", "#search/" + encodeURIComponent(refang(q)));
      runSearch(q);
    });
    $("q").addEventListener("keydown", function (e) {
      if (e.key === "Escape") { $("q").value = ""; clear($("search-results")); }
    });
    document.addEventListener("keydown", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();
      if (e.key === "/" && tag !== "input" && tag !== "select" && tag !== "textarea" && !e.metaKey && !e.ctrlKey) {
        if ($("home") && $("home").hidden) { history.pushState(null, "", location.pathname + location.search); route(); window.scrollTo(0, 0); }
        e.preventDefault();
        if ($("q")) $("q").focus();
      }
    });
    // The logo goes home without a page reload; modified clicks still open a new tab as normal.
    var mark = document.querySelector(".mark");
    if (mark) mark.addEventListener("click", function (e) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (location.hash) { history.pushState(null, "", location.pathname + location.search); route(); }
      else { showView("home"); }
      window.scrollTo(0, 0);
      mark.blur();
    });
    window.addEventListener("popstate", route);
    window.addEventListener("hashchange", function () {
      route();
      if (window.goatcounter && typeof window.goatcounter.count === "function") window.goatcounter.count();
    });
    route();
  }

  function fmtVisitors(n) {
    if (typeof n === "string") return n;
    n = Math.floor(Number(n));
    if (!isFinite(n) || n < 0) return null;
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  var regionNames = null;
  try { regionNames = new Intl.DisplayNames(["en-GB"], { type: "region" }); } catch (e) {}
  function countryName(code, name) {
    if (name && name.toUpperCase() !== code) return name;
    try { return (regionNames && regionNames.of(code)) || code; } catch (e) { return code; }
  }
  function flagImg(code, name) {
    var cc = String(code || "").toLowerCase();
    var ok = /^[a-z]{2}$/.test(cc);
    var img = h("img", { class: "visits-flag", src: ok ? "img/flags/" + cc + ".svg" : "img/flags/globe.svg",
      width: "20", height: "15", alt: name, title: name, decoding: "async" });
    img.addEventListener("error", function onErr() {
      img.removeEventListener("error", onErr);
      img.src = "img/flags/globe.svg";
    });
    return img;
  }
  // Visitors: live figures on load, then every 2 minutes while the tab is visible.
  // Sources, best first: the stats endpoint in data-live (aggregates only, the API key stays server-side),
  // GoatCounter's public site counter (all-time only), then the stats.json snapshot. The largest all-time
  // figure wins, and all-time is never shown below the last 24 hours.
  var VISITS_EVERY = 120000;
  function getJSON(url) {
    return fetch(url, { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  function toCount(v) {
    var n = Math.floor(Number(String(v == null ? "" : v).replace(/[^0-9]/g, "")));
    return v == null || v === "" || !isFinite(n) ? null : n;
  }
  function renderVisitors(all, day, countries, otherCount, dl, dl24, cp, cp24) {
    var box = $("visits");
    if (all == null && day == null && !countries) return;
    day = day == null ? 0 : day;
    all = Math.max(all || 0, day);
    $("visits-total-n").textContent = fmtVisitors(all);
    $("visits-total").hidden = false;
    $("visits-24h-n").textContent = fmtVisitors(day);
    $("visits-24h").hidden = false;
    if (dl != null || cp != null) showClicks({ downloads: dl, downloads24h: dl24, copies: cp, copies24h: cp24 });
    var geo = clear($("visits-geo")), rows = [];
    (countries || []).forEach(function (c) {
      var n = c && toCount(c.count);
      if (!c || !c.code || n == null) return;
      rows.push({ code: String(c.code).toUpperCase(), name: countryName(String(c.code).toUpperCase(), c.name), n: n });
    });
    var base = Math.max(all, rows.reduce(function (t, r) { return t + r.n; }, 0) + (otherCount || 0)) || 1;
    if (rows.length > 8 || otherCount > 0) {
      var rest = rows.splice(8).reduce(function (t, r) { return t + r.n; }, 0) + (otherCount || 0);
      if (rest > 0) rows.push({ other: true, code: "", name: "Other", n: rest });
    }
    rows.forEach(function (r) {
      var pct = Math.max(2, Math.min(100, Math.round(r.n / base * 100)));
      var fill = h("span", { class: "visits-bar-f" });
      fill.style.setProperty("width", pct + "%");
      geo.appendChild(h("li", null,
        r.other ? h("span", { class: "visits-flag visits-other", "aria-hidden": "true" }) : flagImg(r.code, r.name),
        h("span", { class: "visits-cn", text: r.name }),
        h("span", { class: "visits-cv", text: fmtVisitors(r.n) }),
        h("span", { class: "visits-bar", "aria-hidden": "true" }, fill)));
    });
    $("visits-geo-wrap").hidden = !rows.length;
    box.hidden = false;
  }
  function loadVisitors() {
    var box = $("visits");
    if (!box) return;
    var live = box.getAttribute("data-live") || "";
    var settle = function (p) { return p.then(function (v) { return v; }, function () { return null; }); };
    Promise.all([
      live ? settle(getJSON(live)) : Promise.resolve(null),
      settle(getJSON("https://daniyyell.goatcounter.com/counter/TOTAL.json?start=2019-01-01")),
      settle(getJSON("stats.json?t=" + Date.now()))
    ]).then(function (res) {
      var lv = res[0] || {}, pc = res[1] || {}, snap = res[2] || {};
      // The public counter includes download events, so it is only a fallback when the stats endpoint is down.
      var totals = [toCount(lv.total), lv.total == null ? toCount(pc.count) : null, toCount(snap.total)].filter(function (n) { return n != null; });
      var dls = [toCount(lv.downloads), toCount(snap.downloads)].filter(function (n) { return n != null; });
      var dl = dls.length ? Math.max.apply(null, dls) : null;
      var dl24 = toCount(lv.downloads24h);
      if (dl24 == null) dl24 = toCount(snap.downloads24h);
      var cps = [toCount(lv.copies), toCount(snap.copies)].filter(function (n) { return n != null; });
      var cp = cps.length ? Math.max.apply(null, cps) : null;
      var cp24 = toCount(lv.copies24h);
      if (cp24 == null) cp24 = toCount(snap.copies24h);
      var day = toCount(lv.last24h);
      if (day == null) day = toCount(snap.last24h);
      var src = (lv.top_countries && lv.top_countries.length) ? lv : snap;
      renderVisitors(totals.length ? Math.max.apply(null, totals) : null, day, src.top_countries, toCount(src.other_count) || 0, dl, dl24, cp, cp24);
    });
  }
  // Online now: this page sends a random id (new on every page load, never stored) to /online every
  // 30 seconds while the tab is visible; the endpoint answers with how many pages checked in recently.
  var ONLINE_EVERY = 30000, onlineTimer = null, onlineFails = 0, onlineId = pageId();
  function onlineURL() {
    var live = ($("visits") && $("visits").getAttribute("data-live")) || "";
    return live && onlineId ? live.replace(/\/?$/, "/") + "online" : "";
  }
  function renderOnline(n) {
    var cell = $("visits-online");
    var nav = $("nav-online"), navN = $("nav-online-n");
    function setNav(txt, hide) {
      if (!nav) return;
      if (navN) navN.textContent = txt;
      nav.hidden = !!hide;
    }
    if (n == null) {
      if (++onlineFails >= 2) { if (cell) cell.hidden = true; setNav("–", true); }
      else { if ($("visits-online-n")) $("visits-online-n").textContent = "–"; if (cell) cell.classList.add("is-off"); setNav("–", true); }
      return;
    }
    onlineFails = 0;
    var txt = fmtVisitors(Math.max(1, n));
    if ($("visits-online-n")) $("visits-online-n").textContent = txt;
    if (cell) { cell.classList.remove("is-off"); cell.hidden = false; }
    setNav(txt, false);
  }
  function onlinePing() {
    var url = onlineURL();
    if (!url) return;
    fetch(url, { method: "POST", body: onlineId, headers: { "Content-Type": "text/plain" }, cache: "no-store", credentials: "omit" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { renderOnline(toCount(j && j.online)); }, function () { renderOnline(null); });
  }
  function onlineStart() { if (!onlineTimer) { onlinePing(); onlineTimer = setInterval(onlinePing, ONLINE_EVERY); } }
  function onlineStop() { if (onlineTimer) { clearInterval(onlineTimer); onlineTimer = null; } }
  function onlineLeave() {
    var url = onlineURL();
    if (url && navigator.sendBeacon) try { navigator.sendBeacon(url, new Blob([onlineId + " leave"], { type: "text/plain" })); } catch (e) {}
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) { onlineStop(); onlineLeave(); } else onlineStart(); });
  window.addEventListener("pagehide", onlineLeave);
  if (!document.hidden) onlineStart();

  var visitsTimer = null, visitsLast = 0;
  function visitsTick() { visitsLast = Date.now(); loadVisitors(); }
  function visitsStart() {
    if (visitsTimer) return;
    if (Date.now() - visitsLast >= VISITS_EVERY) visitsTick();
    visitsTimer = setInterval(visitsTick, VISITS_EVERY);
  }
  function visitsStop() { if (visitsTimer) { clearInterval(visitsTimer); visitsTimer = null; } }
  document.addEventListener("visibilitychange", function () { if (document.hidden) visitsStop(); else visitsStart(); });
  window.addEventListener("focus", visitsStart);
  if (!document.hidden) visitsStart(); else visitsTick();

  // When the scheduled run last checked its sources (status.json), shown even when nothing new was added.
  var UK_TIME = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  var UK_DAY = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short" });
  function loadChecked() {
    getJSON("status.json?t=" + Date.now()).then(function (st) {
      var d = new Date(st && st.last_checked), el = $("pulse-ck");
      if (!el || isNaN(d)) return;
      var today = UK_DAY.format(d) === UK_DAY.format(new Date());
      add(clear(el), ["Checked ", today ? "" : UK_DAY.format(d) + " ", UK_TIME.format(d) + " UK"]);
      el.title = "Sources last checked " + UK_DAY.format(d) + " " + UK_TIME.format(d) + " UK time";
      el.hidden = false;
    }, function () {});
  }
  loadChecked();
  setInterval(function () { if (!document.hidden) loadChecked(); }, 120000);

  setInterval(function () { if (!document.hidden) tickAgo(); }, 30000);
  // New entries arrive with a rebuild: re-read feed.json every 3 minutes while the tab is visible.
  setInterval(function () {
    if (document.hidden || !DATA) return;
    fetch("feed.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || d.last_updated === DATA.last_updated && d.threat_count === DATA.threat_count) return;
      DATA = d; ALL_IND = [];
      DATA.threats.forEach(function (t) { t.indicators.forEach(function (ind) { ALL_IND.push({ ind: ind, threat: t }); }); });
      renderStats(); fillNavCounts(); if (VIEW === "threats") renderFeed(true); loadRumours();
    }, function () {});
  }, 180000);
  fetch("feed.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(init)
    .catch(function () {
      if ($("pulse-t")) $("pulse-t").textContent = "Feed unavailable";
      if ($("live-list")) clear($("live-list")).appendChild(h("li", { class: "empty-state" }, "The feed could not be loaded. Try again shortly."));
      clear($("feed")).appendChild(h("li", { class: "empty-state" }, h("b", null, "The feed could not be loaded"), "Try again shortly, or use the files in the repository."));
    });
})();

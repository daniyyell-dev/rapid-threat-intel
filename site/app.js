(function () {
  "use strict";

  window.goatcounter = window.goatcounter || {};
  window.goatcounter.path = window.goatcounter.path || function () {
    return location.pathname + (location.hash || "");
  };

  var DATA = null;
  var ALL_IND = [];
  var TYPE_LABEL = {
    ipv4: "IPv4", domain: "Domain", url: "URL", sha256: "SHA256", sha1: "SHA1", md5: "MD5", filename: "File name",
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
    function done(ok) {
      toast(ok ? (msg || "Copied the real value") : "Copy failed");
      if (ok && btn) {
        var prev = btn.getAttribute("data-label") || btn.textContent;
        btn.setAttribute("data-label", prev);
        btn.textContent = "Copied"; btn.classList.add("done");
        setTimeout(function () { btn.textContent = prev; btn.classList.remove("done"); }, 1400);
      }
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
  /* Short heading (2-5 words) for lists and page titles; the full name stays as the subtitle. */
  function stitle(t) {
    if (t.short_title) return t.short_title;
    var w = String(t.short || t.name).split(/[:(\u2013\u2014]\s?| - /)[0].split(/\s+/);
    return w.slice(0, 4).join(" ");
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
    add(clear($("eyebrow-t")), [h("b", { text: "New" }), " " + stitle(t) + " \u00b7 " + ago(t.entry_date)]);
  }
  function renderLatest() {
    var el = $("latest");
    if (!el) return;
    clear(el);
    var newest = DATA.threats[0].entry_date.split(" ")[0];
    DATA.threats.slice(0, 6).forEach(function (t) { el.appendChild(row(t, newest)); });
    if ($("latest-n")) $("latest-n").textContent = String(DATA.threat_count);
  }
  function renderStats() {
    var s = clear($("stats"));
    function stat(n, label, cls) {
      var b = h("b", { class: cls || null, text: "0" });
      countUp({ set textContent(v) { b.textContent = v; } }, n, 900);
      return h("span", { class: "st" }, b, " " + label);
    }
    add(s, [stat(DATA.threat_count, "threats"), stat(DATA.indicator_count, "indicators"), stat(DATA.block_now_count, "to block now", "hot"),
      h("span", { class: "st" }, "Updated ", h("time", { "data-d": DATA.last_updated, title: fmtAdded(DATA.last_updated), text: ago(DATA.last_updated) }))]);
    var pt = $("pulse-t");
    if (pt) { clear(pt); add(pt, ["Last entry ", h("time", { "data-d": DATA.last_updated, text: ago(DATA.last_updated) })]); }
    renderEyebrow();
    renderLive();
    renderLatest();
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
      h("p", { class: "hq-intro" }, "The same hunt for each platform: " + (behaviourFirst(t) ? "the behaviours that map cleanly to log fields (the rest are under Behaviours below)" : "the indicators" + (t.ioa_count ? " and the behaviours that map cleanly to log fields" : "")) +
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

  function row(t, newest) {
    var hunt = huntOf(t);
    var isNew = t.entry_date.split(" ")[0] === newest;
    return h("li", { class: "trow" }, h("a", { href: "#threat/" + encodeURIComponent(t.id) },
      h("span", { class: "tr-when" }, h("span", { class: "tr-day", text: fmtDay(t.entry_date).replace(/ \d{4}$/, "") }), timeOf(t.entry_date) ? h("span", { class: "tr-time", text: timeOf(t.entry_date) }) : null),
      h("span", { class: "tr-main" },
        h("span", { class: "tr-name" }, h("span", { text: stitle(t), title: t.name }), isNew ? h("span", { class: "new", text: "New" }) : null),
        h("span", { class: "tr-head", text: t.headline || t.short || "" }),
        h("span", { class: "tr-cat", text: t.category })),
      h("span", { class: "tr-stats" },
        t.block_now_count ? h("span", { class: "chip blk", text: t.block_now_count + " block" }) : null,
        hunt ? h("span", { class: "chip hunt", text: hunt + " hunt" }) : null,
        t.ioa_count ? h("span", { class: "chip ioa", text: plural(t.ioa_count, "behaviour") }) : null),
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
    var nameq = ($("q-list") && $("q-list").value || "").trim().toLowerCase();
    var list = DATA.threats.filter(function (t) {
      var keys = geoKeys(t), secs = tg(t).sectors;
      var nameOk = !nameq || (t.name + " " + stitle(t) + " " + (t.headline || "") + " " + (t.category || "")).toLowerCase().indexOf(nameq) !== -1;
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
    document.title = stitle(t) + " \u2013 " + t.name + " | IOCWatch";
    wrap.appendChild(backLink());
    var newest = DATA.threats[0].entry_date.split(" ")[0];
    var huntN = t.hunt_count != null ? t.hunt_count : t.indicator_count - t.block_now_count;
    var sev = t.block_now_count >= 10 ? "critical" : t.block_now_count >= 1 ? "high" : "medium";
    wrap.appendChild(h("header", { class: "det-head sev-" + sev, id: "det-head" },
      h("div", { class: "r-cat" }, h("span", { text: t.category }), t.entry_date.split(" ")[0] === newest ? h("span", { class: "new", text: "New today" }) : null),
      h("h1", { text: stitle(t) }),
      h("p", { class: "det-full", text: t.name }),
      h("p", { class: "lede", text: t.headline }),
      h("dl", { class: "facts" },
        [["Published", fmtDay(t.published)], ["Added", fmtAdded(t.entry_date)], ["Last updated", fmtDay(t.last_updated)]]
          .map(function (f) { return h("div", { class: f[2] || null }, h("dt", { text: f[0] }), h("dd", { text: String(f[1]) })); })),
      h("p", { class: "todo" },
        t.block_now_count ? h("span", { class: "blk" }, h("b", { text: String(t.block_now_count) }), " to block now") : h("span", { class: "dim", text: "Nothing to block" }),
        h("span", { class: "sep", "aria-hidden": "true", text: " \u00b7 " }),
        huntN ? h("span", { class: "hunt" }, h("b", { text: String(huntN) }), " to hunt") : h("span", { class: "dim", text: "Nothing to hunt" }),
        t.ioa_count ? [h("span", { class: "sep", "aria-hidden": "true", text: " \u00b7 " }), h("span", { class: "ioa-c" }, h("b", { text: String(t.ioa_count) }), (t.ioa_count === 1 ? " behaviour" : " behaviours") + " to hunt")] : null),
      h("p", { class: "share-line" }, h("button", { type: "button", class: "link-btn", onclick: function () { copyText(shareUrl(t.id), this, "Copied link"); } }, "Copy link"), h("span", { class: "sep", "aria-hidden": "true", text: "\u00b7" }), h("a", { class: "link-btn", href: "/t/" + encodeURIComponent(t.id) + "/" }, "Printable page"))));

    var navLinks = [];
    var hq = huntSection(t);
    if (hq) { wrap.appendChild(hq); navLinks.push(["hunt-sec", "Hunt"]); }
    var ioa = ioaSection(t);
    if (ioa) navLinks.push(["ioa-sec", "Behaviours"]);
    navLinks.push(["todo-sec", "What to do"]);
    navLinks.push(["ind-sec", "Indicators"]);
    navLinks.push(["downloads-sec", "Downloads"]);
    if (t.sources && t.sources.length) navLinks.push(["sources-sec", "Sources"]);
    if (LAYOUT === "b") {
      var snav = h("nav", { class: "sec-nav", "aria-label": "On this page" }, navLinks.map(function (x, i) {
        return h("a", { href: "#" + x[0], "data-sec": x[0], class: i === 0 ? "is-on" : null, text: x[1] });
      }));
      wrap.insertBefore(snav, hq || wrap.lastChild);
      // Keep the hash route as #threat/<id>; section links scroll without replacing it.
      snav.addEventListener("click", function (e) {
        var a = e.target.closest && e.target.closest("a[data-sec]");
        if (!a) return;
        e.preventDefault();
        var target = document.getElementById(a.getAttribute("data-sec"));
        if (target) target.scrollIntoView({ block: "start" });
        Array.prototype.forEach.call(snav.querySelectorAll("a"), function (l) { l.classList.toggle("is-on", l === a); });
      });
    }

    var main = h("div", { class: "det-main" });
    if (t.caveat) main.appendChild(h("div", { class: "warn", role: "note" }, h("b", null, "Note"), " ", highlightIocs(t.caveat)));
    main.appendChild(sec("What to do", h("div", null,
      t.recommended_actions.length ? h("ol", { class: "steps" }, t.recommended_actions.map(function (a) { return h("li", null, h("span", null, highlightIocs(a))); })) : h("p", { class: "dim", text: "No extra steps beyond the block list and hunts." })), null, "todo-sec"));
    if (ioa) main.appendChild(ioa);
    main.appendChild(targetSection(t));
    if (t.sources && t.sources.length) {
      main.appendChild(h("section", { class: "blk-sec", id: "sources-sec" }, srcLine(t.sources, "srcline det-src")));
    }
    if (t.summary) main.appendChild(sec("Background", h("div", { class: "prose" }, h("p", null, highlightIocs(t.summary))), null, "background-sec"));

    var side = h("aside", { class: "side", "aria-label": "Downloads and MITRE ATT&CK" });
    side.appendChild(sec("Downloads", h("div", null, fileList(t.files),
      h("p", { class: "rail-p", "aria-hidden": "false" }, extLink(t.repo_url, ["View folder in repository", h("span", { class: "ext-ico", "aria-hidden": "true" })]))), null, "downloads-sec"));
    if (t.mitre.length) side.appendChild(sec("MITRE ATT&CK", h("ul", { class: "mitre" }, t.mitre.map(function (m) { return h("li", null, extLink(m.url, [h("b", { text: m.id }), h("span", { text: m.name })])); })), String(t.mitre.length), "mitre-sec"));

    wrap.appendChild(h("div", { class: "det-grid" }, main, side));

    var tq = h("input", { type: "search", placeholder: "Filter by value or description", spellcheck: "false", "aria-label": "Filter indicators" });
    var ts = h("select", { "aria-label": "Indicator type" }, h("option", { value: "" }, "All types"),
      typesOf(t).map(function (k) { return h("option", { value: k }, typeLabel(k) + " (" + t.indicator_counts[k] + ")"); }));
    if ($("f-type") && $("f-type").value && t.indicator_counts[$("f-type").value]) ts.value = $("f-type").value;
    var body = h("tbody");
    var multi = t.sources.length > 1;
    var countEl = h("span");
    var shownAll = false;
    var LIMIT = 10;
    var moreBtn = h("button", { type: "button", class: "link-btn ind-more" });
    moreBtn.addEventListener("click", function () { shownAll = !shownAll; fill(); });
    function fill() {
      clear(body);
      var qv = refang(tq.value).toLowerCase(), ty = ts.value;
      var rows = [];
      t.indicators.forEach(function (ind) {
        if (ty && ind.type !== ty) return;
        if (qv && (ind.value + " " + ind.description).toLowerCase().indexOf(qv) === -1) return;
        rows.push(ind);
      });
      rows.sort(function (a, b) { return actionRank(a.recommended_action) - actionRank(b.recommended_action); });
      var n = rows.length;
      var show = (shownAll || n <= LIMIT) ? n : LIMIT;
      rows.slice(0, show).forEach(function (ind) {
        body.appendChild(h("tr", null,
          h("td", { class: "ind" }, iocCell(ind)),
          h("td", null, typeTag(ind.type)),
          h("td", null, confMeter(ind.confidence)),
          h("td", null, actionPill(ind.recommended_action)),
          h("td", { class: "desc" }, ind.description || "", ind.sources && ind.sources.length ? h("div", { class: "src" }, ind.sources.map(function (s, i) { return [i ? " \u00b7 " : null, extLink(s.url, s.name)]; })) : (multi && ind.source_url ? h("div", { class: "src" }, extLink(ind.source_url, ind.source_name || ind.source_label || ind.source_url)) : null))));
      });
      countEl.textContent = n === t.indicators.length ? String(n) : n + " of " + t.indicators.length;
      if (!n) body.appendChild(h("tr", null, h("td", { colspan: "5", class: "none" }, "No indicators match this filter.")));
      moreBtn.hidden = n <= LIMIT;
      moreBtn.textContent = shownAll ? "Show fewer" : "Show all " + n + " indicators";
    }
    tq.addEventListener("input", fill);
    ts.addEventListener("change", fill);
    fill();
    wrap.appendChild(h("section", { class: "ind-sec", id: "ind-sec", "aria-labelledby": "ind-h" },
      h("div", { class: "ind-head" }, h("h2", { id: "ind-h" }, h("span", { class: "idx", text: "IOC" }), "Indicators ", h("span", { class: "dim" }, countEl))),
      h("p", { class: "ind-note" }, "Indicators are shown defanged and never as links. Copy gives the real value."),
      h("div", { class: "ind-tools" }, tq, ts),
      h("div", { class: "tbl-wrap" }, h("table", null,
        h("thead", null, h("tr", null, ["Indicator", "Type", "Confidence", "Action", multi ? "Description and source" : "Description"].map(function (x) { return h("th", { scope: "col", text: x }); }))), body)),
      moreBtn));
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
    var pages = { home: $("home"), threats: $("view-threats"), threat: $("detail"), block: $("view-block"), hunts: $("view-hunts"), sources: $("view-sources"), about: $("view-about") };
    Object.keys(pages).forEach(function (k) { if (pages[k]) pages[k].hidden = k !== view; });
    document.body.setAttribute("data-view", view);
    if (view !== "threat") CURRENT_ID = "";
    if (view === "threats" && DATA) renderFeed(true);
  }
  function renderBlock() {
    var el = $("view-block");
    if (!el || !DATA) return;
    var items = [];
    DATA.threats.forEach(function (t) {
      t.indicators.forEach(function (ind) {
        if (ind.recommended_action === "block") items.push({ ind: ind, threat: t });
      });
    });
    var q = h("input", { type: "search", id: "block-q", placeholder: "Filter by value or description", spellcheck: "false", "aria-label": "Filter block list" });
    var ts = h("select", { id: "block-type", "aria-label": "Indicator type" }, h("option", { value: "" }, "All types"));
    var types = {};
    items.forEach(function (x) { types[x.ind.type] = (types[x.ind.type] || 0) + 1; });
    Object.keys(types).sort(function (a, b) { return types[b] - types[a] || a.localeCompare(b); })
      .forEach(function (t) { ts.appendChild(h("option", { value: t }, typeLabel(t) + " (" + types[t] + ")")); });
    var body = h("tbody");
    var countEl = h("span");
    function fill() {
      clear(body);
      var needle = refang(q.value).toLowerCase(), ty = ts.value, n = 0;
      items.forEach(function (x) {
        var ind = x.ind;
        if (ty && ind.type !== ty) return;
        if (needle && (ind.value + " " + (ind.description || "")).toLowerCase().indexOf(needle) === -1) return;
        n++;
        body.appendChild(h("tr", null,
          h("td", { class: "ind" }, iocCell(ind)),
          h("td", null, typeTag(ind.type)),
          h("td", null, confMeter(ind.confidence)),
          h("td", null, h("a", { class: "tlink", href: "#threat/" + encodeURIComponent(x.threat.id), text: stitle(x.threat), title: x.threat.name })),
          h("td", { class: "desc" }, ind.description || "")));
      });
      countEl.textContent = n === items.length ? plural(n, "indicator") : n + " of " + items.length;
      if (!n) body.appendChild(h("tr", null, h("td", { colspan: "5", class: "none" }, "No indicators match this filter.")));
    }
    q.addEventListener("input", fill);
    ts.addEventListener("change", fill);
    fill();
    clear(el);
    add(el, [
      h("div", { class: "catalog-head" }, h("h1", null, "Block list"), countEl),
      h("p", { class: "catalog-meta" }, "High-confidence indicators to block now, across every threat. Values are shown defanged. Copy gives the real value."),
      h("section", { class: "blk-files", "aria-labelledby": "all-h" }, h("h2", { id: "all-h", class: "sub-h", text: "Download" }), fileList(DATA.combined_files)),
      h("div", { class: "catalog-tools" }, q, ts),
      h("div", { class: "tbl-wrap" }, h("table", null,
        h("thead", null, h("tr", null, ["Indicator", "Type", "Confidence", "Threat", "Description"].map(function (x) { return h("th", { scope: "col", text: x }); }))),
        body))
    ]);
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
  function renderSources() {
    var el = $("view-sources");
    if (!el || !DATA) return;
    var list = uniqueSources();
    clear(el);
    add(el, [
      h("div", { class: "catalog-head" }, h("h1", null, "Sources"), h("span", { class: "src-count", text: plural(list.length, "source") })),
      h("p", { class: "catalog-meta" }, "Every cited source in this feed, with the threats it supports."),
      h("ol", { class: "catalog" }, list.map(function (s) {
        return h("li", { class: "catalog-item" },
          s.url ? extLink(s.url, s.name, "tlink") : h("b", { text: s.name }),
          h("p", { class: "catalog-meta" },
            plural(s.count, "threat"), " · ",
            s.threats.slice(0, 4).map(function (t, i) {
              return [i ? ", " : null, h("a", { class: "tlink", href: "#threat/" + encodeURIComponent(t.id), text: stitle(t) })];
            }),
            s.threats.length > 4 ? " +" + (s.threats.length - 4) + " more" : null));
      }))
    ]);
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
    document.title = "IOCWatch – AI threat intelligence, live";
    if (hash.indexOf("search/") === 0) {
      showView("home");
      var q = decodeURIComponent(hash.slice(7));
      if ($("q")) $("q").value = q;
      runSearch(q);
      if ($("search-form")) $("search-form").scrollIntoView({ block: "center" });
      return;
    }
    var top = hash.split("/")[0].split("=")[0];
    var homeSecs = { check: "search-form", "search-h": "search-form", features: "get-h", live: "live-h" };
    if (homeSecs[top]) {
      showView("home");
      setTimeout(function () { var el = $(homeSecs[top]); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 0);
      return;
    }
    var viewMap = { block: "block", hunts: "hunts", sources: "sources", about: "about", threats: "threats", "feed-sec": "threats", "feed-h": "threats", "all-h": "block" };
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
      window.scrollTo(0, 0);
      return;
    }
    showView("home");
  }
  function init(data) {
    DATA = data;
    DATA.threats.forEach(function (t) { t.indicators.forEach(function (ind) { ALL_IND.push({ ind: ind, threat: t }); }); });
    if (window.matchMedia && window.matchMedia("(max-width: 720px)").matches) {
      Array.prototype.forEach.call(document.querySelectorAll("details.rail-box, details.filt-box"), function (x) { x.open = false; });
    }
    renderStats();
    fillFilters();
    fillNavCounts();
    renderFeed();
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
      renderStats(); fillNavCounts(); if (VIEW === "threats") renderFeed(true);
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

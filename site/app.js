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
  function copyText(text, btn, msg) {
    function done(ok) {
      toast(ok ? (msg || "Copied the real value") : "Copy failed");
      if (ok && btn) {
        btn.textContent = "Copied"; btn.classList.add("done");
        setTimeout(function () { btn.textContent = "Copy"; btn.classList.remove("done"); }, 1400);
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
    b.addEventListener("click", function () { copyText(ind.value, b); });
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
  function saveOnClick(a, f) {
    a.addEventListener("click", function (e) {
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
  function renderStats() {
    var s = clear($("stats"));
    var t = timeOf(DATA.last_updated);
    function cell(cls, label, value, small) {
      s.appendChild(h("div", { class: "cell " + cls }, h("dt", { text: label }), h("dd", null, String(value), small ? h("small", { text: small }) : null)));
    }
    cell("", "Threats", DATA.threat_count, "tracked in this feed");
    cell("", "Indicators", DATA.indicator_count, "curated and sourced");
    cell("hot", "Block now", DATA.block_now_count, "high confidence, block");
    cell("date", "Last updated", fmtDay(DATA.last_updated), t ? t + " UK time" : "UK time");
    var pt = clear($("pulse-t")), dp = fmtDay(DATA.last_updated).split(" ");
    add(pt, [h("span", { class: "pl", text: "Updated " }), dp[0] + " " + dp[1], h("span", { class: "pl", text: " " + dp[2] }), t ? " " + t + " UK" : ""]);
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
    $("feed-h").scrollIntoView({ block: "start" });
  }
  /* Behaviours (IOAs): shown first on the feed card when a threat has no network or hash indicators. */
  var NET_TYPES = ["ipv4", "domain", "url", "sha256", "sha1"];
  function behaviourFirst(t) {
    return !!t.ioa_count && !NET_TYPES.some(function (k) { return t.indicator_counts[k]; });
  }
  function ioaSection(t) {
    if (!t.ioas || !t.ioas.length) return null;
    var multi = t.ioas.some(function (x) { return x.source_url; }) && t.sources.length > 1;
    function line(label, body, cls) { return h("p", { class: "ioa-line" + (cls ? " " + cls : "") }, h("span", { class: "ioa-lab", text: label }), body); }
    return h("section", { class: "blk-sec ioa-sec", id: "ioa-sec", "aria-labelledby": "ioa-h" },
      h("h2", { id: "ioa-h" }, "Behaviours to hunt", h("span", { text: String(t.ioas.length) })),
      h("p", { class: "ioa-note", role: "note" }, t.ioa_note || ""),
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
      panel.appendChild(h("p", { class: "hq-hint", text: "Dimmed lines are comments. Copy and Download give the file exactly as published." }));
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
      h("p", { class: "hq-intro" }, "The same hunt for each platform: " + (behaviourFirst(t) ? "the behaviours that map cleanly to log fields (the rest are under Behaviours above)" : "the indicators" + (t.ioa_count ? " and the behaviours that map cleanly to log fields" : "")) +
        ". Run it before you block to find past activity." + (t.ioa_count ? " Behaviour hits are leads, not proof." : "")),
      tabs, panel);
  }
  function row(t, newest) {
    var types = typesOf(t);
    var comp = h("div", { class: "comp", "aria-hidden": "true" });
    types.forEach(function (k) {
      var seg = h("i", { class: "t-" + k });
      seg.style.flexGrow = String(t.indicator_counts[k]);
      comp.appendChild(seg);
    });
    var shown = types.slice(0, 4), more = types.length - shown.length;
    return h("li", { class: "row" }, h("div", { class: "row-in" },
      h("div", { class: "when" }, h("b", { text: fmtDay(t.entry_date) }), timeOf(t.entry_date) ? timeOf(t.entry_date) + " UK" : null,
        t.entry_date.split(" ")[0] === newest ? h("span", { class: "new" }, "New today") : null),
      h("div", { class: "r-main" },
        h("div", { class: "r-cat", text: t.category }),
        h("h3", null, h("a", { class: "r-link", href: "#threat/" + encodeURIComponent(t.id), text: t.name })),
        h("p", { class: "r-sum", text: t.headline }),
        targetLine(t),
        h("div", { class: "r-meta" }, h("span", { text: "Published " + fmtDay(t.published) + (t.last_updated && t.last_updated !== t.entry_date.split(" ")[0] ? " \u00b7 updated " + fmtDay(t.last_updated) : "") }),
          srcLine(t.sources, "r-src"))),
      h("div", { class: "r-side" },
        behaviourFirst(t) ? h("div", { class: "r-num ioa-num" }, h("b", { text: String(t.ioa_count) }), h("span", { class: "hunt", text: (t.ioa_count === 1 ? "behaviour" : "behaviours") + " to hunt" }))
          : h("div", { class: "r-num" }, h("b", { text: String(t.indicator_count) }), h("span", null, t.block_now_count ? h("span", { class: "blk", text: t.block_now_count + " block now" }) : "none to block")),
        behaviourFirst(t) ? null : comp,
        h("div", { class: "legend" }, behaviourFirst(t) ? h("span", { text: plural(t.indicator_count, "other indicator") }) : shown.map(function (k) { return h("span", { class: "t-" + k, text: typeLabel(k) + " " + t.indicator_counts[k] }); }),
          !behaviourFirst(t) && more > 0 ? h("span", { text: "+" + more + " more" }) : null,
          !behaviourFirst(t) && t.ioa_count ? h("span", { class: "ioa-leg", text: "Behaviours " + t.ioa_count }) : null))));
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
    var el = $("feed-pager"), last = Math.ceil(total / PER_PAGE);
    clear(el);
    el.hidden = last <= 1;
    if (last <= 1) return;
    var from = (PAGE - 1) * PER_PAGE + 1, to = Math.min(total, PAGE * PER_PAGE);
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
    var list = DATA.threats.filter(function (t) {
      var keys = geoKeys(t), secs = tg(t).sectors;
      return (!c || t.category === c) && (!ty || t.indicator_counts[ty]) && (!d || t.entry_date.split(" ")[0] === d) &&
        (!gk || (gk === "none" ? !keys.length : keys.indexOf(gk) !== -1)) && (!sc || (sc === "none" ? !secs.length : secs.indexOf(sc) !== -1));
    });
    var newest = DATA.threats.length ? DATA.threats[0].entry_date.split(" ")[0] : "";
    $("feed-count").textContent = list.length === DATA.threats.length ? plural(list.length, "threat") + ", newest first" : list.length + " of " + DATA.threats.length + " threats, newest first";
    var f = clear($("feed"));
    if (!list.length) {
      f.appendChild(h("li", { class: "empty-state" }, h("b", null, "No threats match"), "Try another date, country or sector, or a different indicator type.",
        h("div", null, h("button", { type: "button", class: "link-btn", onclick: resetFilters }, "Reset filters"))));
    }
    var last = Math.max(1, Math.ceil(list.length / PER_PAGE));
    if (PAGE > last) PAGE = last;
    list.slice((PAGE - 1) * PER_PAGE, PAGE * PER_PAGE).forEach(function (t) { f.appendChild(row(t, newest)); });
    pager(list.length);
  }
  function renderAllFiles() {
    var el = $("all-files");
    el.parentNode.replaceChild(fileList(DATA.combined_files), el);
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
        h("p", null, h("a", { class: "tlink", href: "#threat/" + encodeURIComponent(x.threat.id), text: x.threat.name }), " \u00b7 ", ind.description || "")));
    });
  }

  /* Detail */
  function sec(title, body, aside) { return h("section", { class: "blk-sec" }, h("h2", null, title, aside ? h("span", { text: aside }) : null), body); }
  function backLink() { return h("nav", { class: "crumb", "aria-label": "Breadcrumb" }, h("a", { href: "#" }, h("span", { "aria-hidden": "true", text: "<" }), "Live feed"), h("span", { "aria-hidden": "true", text: "/" }), h("span", { text: "Threat" })); }
  function targetSection(t) {
    var g = tg(t), ns = h("span", { class: "dim", text: "Not stated in the sources" });
    var rows = [h("div", null, h("dt", { text: "Countries" }), h("dd", null, g.countries.length ? h("ul", { class: "ctry-list" }, g.countries.map(function (c) { return h("li", null, countryTag(c)); })) : ns))];
    if (g.regions.length) rows.push(h("div", null, h("dt", { text: "Regions" }), h("dd", { text: g.regions.join(", ") })));
    rows.push(h("div", null, h("dt", { text: "Sectors" }), h("dd", null, g.sectors.length ? g.sectors.join(", ") : ns.cloneNode(true))));
    return sec("Affected countries and sectors", h("div", null, h("dl", { class: "tg-dl" }, rows),
      g.note ? h("p", { class: "tg-note", text: g.note }) : null,
      g.source && t.sources.length > 1 ? srcLine([g.source], "tg-src", "Per ") : null));
  }
  function renderDetail(id) {
    var t = null;
    DATA.threats.forEach(function (x) { if (x.id === id) t = x; });
    var el = clear($("detail"));
    var wrap = h("article", { class: "det" });
    el.appendChild(wrap);
    if (!t) {
      wrap.appendChild(backLink());
      wrap.appendChild(h("div", { class: "empty-state" }, h("b", null, "Threat not found"), "This threat is no longer in the feed. ", h("a", { href: "#" }, "Back to the live feed")));
      return;
    }
    document.title = t.name + " \u2013 Rapid Threat Intel";
    wrap.appendChild(backLink());
    var newest = DATA.threats[0].entry_date.split(" ")[0];
    wrap.appendChild(h("header", { class: "det-head" },
      h("div", { class: "r-cat" }, h("span", { text: t.category }), t.entry_date.split(" ")[0] === newest ? h("span", { class: "new", text: "New today" }) : null),
      h("h1", { text: t.name }),
      h("p", { class: "lede", text: t.headline }),
      h("dl", { class: "facts" },
        [["Published", fmtDay(t.published)], ["Added", fmtAdded(t.entry_date)], ["Last updated", fmtDay(t.last_updated)]]
          .map(function (f) { return h("div", { class: f[2] || null }, h("dt", { text: f[0] }), h("dd", { text: String(f[1]) })); }))));

    var main = h("div", { class: "det-main" });
    if (t.caveat) main.appendChild(h("div", { class: "warn", role: "note" }, h("b", null, "Note"), t.caveat));
    var hunt = t.hunt_count != null ? t.hunt_count : t.indicator_count - t.block_now_count;
    var todo = h("p", { class: "todo" },
      t.block_now_count ? h("span", { class: "blk" }, h("b", { text: String(t.block_now_count) }), " to block now") : h("span", { class: "dim", text: "Nothing to block" }),
      h("span", { class: "sep", "aria-hidden": "true", text: " \u00b7 " }),
      hunt ? h("span", { class: "hunt" }, h("b", { text: String(hunt) }), " to hunt") : h("span", { class: "dim", text: "Nothing to hunt" }),
      h("span", { class: "sep", "aria-hidden": "true", text: " \u00b7 " }),
      t.ioa_count ? [h("span", { class: "ioa-c" }, h("b", { text: String(t.ioa_count) }), (t.ioa_count === 1 ? " behaviour" : " behaviours") + " to hunt"), h("span", { class: "sep", "aria-hidden": "true", text: " \u00b7 " })] : null,
      h("button", { type: "button", class: "link-btn", onclick: function () { $("ind-h").scrollIntoView({ block: "start" }); } }, "See " + plural(t.indicator_count, "indicator")));
    main.appendChild(sec("What to do", h("div", null, todo,
      t.recommended_actions.length ? h("ol", { class: "steps" }, t.recommended_actions.map(function (a) { return h("li", { text: a }); })) : null)));
    var ioa = ioaSection(t);
    if (ioa) main.appendChild(ioa);
    var hq = huntSection(t);
    if (hq) main.appendChild(hq);
    main.appendChild(targetSection(t));
    main.appendChild(srcLine(t.sources, "srcline det-src"));
    if (t.summary) main.appendChild(sec("Background", h("div", { class: "prose" }, h("p", { text: t.summary }))));

    var side = h("aside", { class: "side", "aria-label": "Downloads and MITRE ATT&CK" });
    side.appendChild(sec("Downloads", h("div", null, fileList(t.files),
      h("p", { class: "rail-p", "aria-hidden": "false" }, extLink(t.repo_url, ["View folder in repository", h("span", { class: "ext-ico", "aria-hidden": "true" })])))));
    if (t.mitre.length) side.appendChild(sec("MITRE ATT&CK", h("ul", { class: "mitre" }, t.mitre.map(function (m) { return h("li", null, extLink(m.url, [h("b", { text: m.id }), h("span", { text: m.name })])); })), String(t.mitre.length)));

    wrap.appendChild(h("div", { class: "det-grid" }, main, side));

    var tq = h("input", { type: "search", placeholder: "Filter by value or description", spellcheck: "false", "aria-label": "Filter indicators" });
    var ts = h("select", { "aria-label": "Indicator type" }, h("option", { value: "" }, "All types"),
      typesOf(t).map(function (k) { return h("option", { value: k }, typeLabel(k) + " (" + t.indicator_counts[k] + ")"); }));
    if ($("f-type").value && t.indicator_counts[$("f-type").value]) ts.value = $("f-type").value;
    var body = h("tbody");
    var multi = t.sources.length > 1;
    var countEl = h("span");
    function fill() {
      clear(body);
      var q = refang(tq.value).toLowerCase(), ty = ts.value, n = 0;
      t.indicators.forEach(function (ind) {
        if (ty && ind.type !== ty) return;
        if (q && (ind.value + " " + ind.description).toLowerCase().indexOf(q) === -1) return;
        n++;
        body.appendChild(h("tr", null,
          h("td", { class: "ind" }, iocCell(ind)),
          h("td", null, typeTag(ind.type)),
          h("td", null, confMeter(ind.confidence)),
          h("td", null, actionPill(ind.recommended_action)),
          h("td", { class: "desc" }, ind.description || "", multi && ind.source_url ? h("div", { class: "src" }, extLink(ind.source_url, ind.source_name || ind.source_label || ind.source_url)) : null)));
      });
      countEl.textContent = n === t.indicators.length ? plural(n, "indicator") : n + " of " + t.indicators.length;
      if (!n) body.appendChild(h("tr", null, h("td", { colspan: "5", class: "none" }, "No indicators match this filter.")));
    }
    tq.addEventListener("input", fill);
    ts.addEventListener("change", fill);
    fill();
    wrap.appendChild(h("section", { class: "ind-sec", "aria-labelledby": "ind-h" },
      h("div", { class: "ind-head" }, h("h2", { id: "ind-h" }, h("span", { class: "idx", text: "IOC" }), "Indicators ", countEl)),
      h("p", { class: "ind-note" }, "Indicators are shown defanged and never as links. Copy gives the real value."),
      h("div", { class: "ind-tools" }, tq, ts),
      h("div", { class: "tbl-wrap" }, h("table", null,
        h("thead", null, h("tr", null, ["Indicator", "Type", "Confidence", "Action", multi ? "Description and source" : "Description"].map(function (x) { return h("th", { scope: "col", text: x }); }))), body))));
  }

  /* Routing: #threat/<id> opens a threat, #search/<value> runs a search, anything else shows the feed. */
  function route() {
    var hash = location.hash.replace(/^#/, "");
    var home = $("home"), detail = $("detail");
    if (hash.indexOf("threat/") === 0) {
      home.hidden = true; detail.hidden = false;
      renderDetail(decodeURIComponent(hash.slice(7)));
      window.scrollTo(0, 0);
      return;
    }
    document.title = "Rapid Threat Intel \u2013 AI threat intel, IOCs and hunting queries";
    detail.hidden = true; home.hidden = false;
    var pm = /^page=(\d+)$/.exec(hash), want = pm ? Math.max(1, parseInt(pm[1], 10)) : 1;
    if (DATA && want !== PAGE) {
      PAGE = want; renderFeed(true);
      /* after the browser restores its own scroll on back/forward */
      setTimeout(function () { $("feed-h").scrollIntoView({ block: "start" }); }, 0);
    }
    if (hash.indexOf("search/") === 0) {
      var q = decodeURIComponent(hash.slice(7));
      $("q").value = q;
      runSearch(q);
      $("search-h").scrollIntoView();
    }
  }

  function init(data) {
    DATA = data;
    DATA.threats.forEach(function (t) { t.indicators.forEach(function (ind) { ALL_IND.push({ ind: ind, threat: t }); }); });
    if (window.matchMedia && window.matchMedia("(max-width: 720px)").matches) {
      Array.prototype.forEach.call(document.querySelectorAll("details.rail-box"), function (x) { x.open = false; });
    }
    renderStats();
    fillFilters();
    renderFeed();
    renderAllFiles();
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
        if ($("home").hidden) location.hash = "";
        e.preventDefault();
        $("q").focus();
      }
    });
    // The logo goes home without a page reload; modified clicks still open a new tab as normal.
    var mark = document.querySelector(".mark");
    if (mark) mark.addEventListener("click", function (e) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (location.hash) { history.pushState(null, "", location.pathname + location.search); route(); }
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
      width: "20", height: "15", alt: name, title: name, loading: "lazy", decoding: "async" });
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
  function renderVisitors(all, day, countries, otherCount) {
    var box = $("visits");
    if (all == null && day == null && !countries) return;
    day = day == null ? 0 : day;
    all = Math.max(all || 0, day);
    $("visits-total-n").textContent = fmtVisitors(all);
    $("visits-total").hidden = false;
    $("visits-24h-n").textContent = fmtVisitors(day);
    $("visits-24h").hidden = false;
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
      var totals = [toCount(lv.total), toCount(pc.count), toCount(snap.total)].filter(function (n) { return n != null; });
      var day = toCount(lv.last24h);
      if (day == null) day = toCount(snap.last24h);
      var src = (lv.top_countries && lv.top_countries.length) ? lv : snap;
      renderVisitors(totals.length ? Math.max.apply(null, totals) : null, day, src.top_countries, toCount(src.other_count) || 0);
    });
  }
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

  fetch("feed.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(init)
    .catch(function () {
      $("pulse-t").textContent = "Feed unavailable";
      clear($("feed")).appendChild(h("li", { class: "empty-state" }, h("b", null, "The feed could not be loaded"), "Try again shortly, or use the files in the repository."));
    });
})();

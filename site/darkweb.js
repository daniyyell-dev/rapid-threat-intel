/* IOCWatch – Dark web page (#darkweb). Reads /darkweb.json (metadata only, built locally). */
(function () {
  "use strict";
  var DW = { data: null, shown: 25, loading: null };
  function $(id) { return document.getElementById(id); }
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === "text") el.textContent = v; else if (k === "class") el.className = v; else el.setAttribute(k, v);
    });
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, c) {
    if (c == null || c === false) return el;
    if (Array.isArray(c)) { c.forEach(function (x) { add(el, x); }); return el; }
    el.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
    return el;
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }
  var REGION = null;
  try { REGION = new Intl.DisplayNames(["en-GB"], { type: "region" }); } catch (e) {}
  function cname(cc) { if (!cc) return ""; try { return (REGION && REGION.of(cc)) || cc; } catch (e) { return cc; } }
  function flag(cc) {
    var c = String(cc || "").toLowerCase(), ok = /^[a-z]{2}$/.test(c);
    var img = h("img", { class: "visits-flag", src: ok ? "img/flags/" + c + ".svg" : "img/flags/globe.svg", width: "18", height: "13",
      alt: "", "aria-hidden": "true", decoding: "async", loading: "lazy" });
    img.addEventListener("error", function onErr() { img.removeEventListener("error", onErr); img.src = "img/flags/globe.svg"; });
    return img;
  }
  function fmtDate(d) {
    if (!d) return "";
    var t = new Date(d + "T12:00:00Z");
    return isNaN(t) ? d : t.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" });
  }
  function ago(iso) {
    var s = (Date.now() - Date.parse(iso)) / 1000;
    if (!isFinite(s)) return "";
    if (s < 90) return "just now";
    if (s < 3600) return Math.round(s / 60) + " min ago";
    if (s < 86400) return Math.round(s / 3600) + " h ago";
    return Math.round(s / 86400) + " d ago";
  }
  function n(x) { return (x == null ? "–" : Number(x).toLocaleString("en-GB")); }

  function stat(label, value, sub, k) {
    return h("div", { class: "dw-stat " + (k || "") }, h("span", { class: "dw-stat-n", text: label }), h("span", { class: "dw-stat-v", text: value }), sub ? h("span", { class: "dw-stat-s", text: sub }) : null);
  }
  function claimRow(c) {
    var meta = [];
    if (c.country) meta.push(h("span", { class: "dw-cc" }, flag(c.country), cname(c.country)));
    if (c.sector) meta.push(h("span", { text: c.sector }));
    return h("li", { class: "dw-row" },
      h("div", { class: "dw-main" },
        h("p", { class: "dw-org", text: c.victim }),
        h("p", { class: "dw-meta" }, h("span", { class: "dw-grp", text: c.group }), meta.length ? [h("span", { class: "dw-sep", text: "·" }), meta.map(function (m, i) { return i ? [h("span", { class: "dw-sep", text: "·" }), m] : m; })] : null)),
      h("div", { class: "dw-side" },
        h("span", { class: "dw-st", text: "Claimed, unverified" }),
        h("time", { class: "dw-when", datetime: c.date, text: fmtDate(c.date) })));
  }
  function bars(list, label) {
    var max = list.length ? list[0].count : 1;
    return h("ol", { class: "dw-bars" }, list.map(function (x) {
      return h("li", null,
        h("span", { class: "dw-bn" }, label ? label(x) : x.name),
        h("span", { class: "dw-bv", text: String(x.count) }),
        h("span", { class: "dw-bb" }, (function () { var i = h("i"); i.style.width = Math.max(4, Math.round(100 * x.count / max)) + "%"; return i; })()));
    }));
  }
  function render() {
    var root = $("view-darkweb");
    if (!root) return;
    document.title = "Dark web | IOCWatch";
    var d = DW.data;
    clear(root);
    var head = h("div", { class: "catalog-head dw-head" }, h("h1", { text: "Dark web" }),
      h("p", { class: "hint dw-upd" }, d ? [h("span", { class: "live-dot", "aria-hidden": "true" }), "Updated " + ago(d.updated) + " · refreshes hourly"] : "Loading…"));
    if (!d) { add(root, head); return; }
    var claims = d.claims || [], st = d.stats || {}, t = d.totals || {};
    var list = h("ol", { class: "dw-list" }, claims.slice(0, DW.shown).map(claimRow));
    var more = claims.length > DW.shown ? h("button", { class: "dw-more", type: "button", text: "Show more (" + (claims.length - DW.shown) + ")" }) : null;
    if (more) more.addEventListener("click", function () { DW.shown += 25; render(); });
    var leaks = d.leaks || [], mk = d.markets || {}, leads = d.leads || [];
    add(root, [
      head,
      h("p", { class: "dw-banner", text: d.status_note }),
      h("div", { class: "dw-stats" },
        stat("Claims", n(t.claims), "last " + (d.window_days || 30) + " days", "k-claim"),
        stat("Groups", n(t.groups), "posting in this window", "k-grp"),
        stat("Countries", n(t.countries), "where known", "k-cc"),
        stat("Posts in 24 h", n(st.posts_24h), "across " + n(st.groups_online) + " live leak sites", "k-24")),
      h("div", { class: "dw-grid" },
        h("section", { class: "dw-card dw-claims", "aria-labelledby": "dw-claims-h" },
          h("h2", { id: "dw-claims-h" }, "Latest ransomware claims", h("span", { class: "dim", text: "newest first" })),
          list, more),
        h("div", { class: "dw-aside" },
          h("section", { class: "dw-card", "aria-labelledby": "dw-g-h" }, h("h2", { id: "dw-g-h", text: "By group" }), bars(d.by_group || [])),
          h("section", { class: "dw-card", "aria-labelledby": "dw-c-h" }, h("h2", { id: "dw-c-h", text: "By country" }),
            bars(d.by_country || [], function (x) { return [flag(x.name), cname(x.name)]; })),
          h("section", { class: "dw-card", "aria-labelledby": "dw-s-h" }, h("h2", { id: "dw-s-h", text: "By sector" }), bars(d.by_sector || [])))),
      h("section", { class: "dw-card dw-leaks", "aria-labelledby": "dw-l-h" },
        h("h2", { id: "dw-l-h" }, "Leak and market announcements", h("span", { class: "dim", text: "announced, unverified" })),
        leaks.length ? h("div", { class: "dw-table-wrap" }, h("table", { class: "dw-table" },
          h("thead", null, h("tr", null, h("th", { text: "Database" }), h("th", { text: "Records" }), h("th", { text: "Data types" }), h("th", { text: "Indexed" }))),
          h("tbody", null, leaks.slice(0, 10).map(function (l) {
            return h("tr", null, h("td", { class: "dw-ln", text: l.name }), h("td", { class: "num", text: l.records || "–" }),
              h("td", { class: "dw-dt", text: (l.data_types || []).join(", ") || "–" }), h("td", { class: "num", text: fmtDate(l.indexed) }));
          })))) : h("p", { class: "dw-empty", text: "No new leak announcements." }),
        h("p", { class: "dw-mk" }, h("b", { text: n(mk.tracked) }), " criminal markets and forums tracked, ",
          h("b", { text: n(mk.online) }), " online now. Names only, never links.")),
      h("section", { class: "dw-card dw-leads", "aria-labelledby": "dw-r-h" },
        h("h2", { id: "dw-r-h" }, "Access-broker and stealer-log posts"),
        h("p", null, "Posts selling network access or stealer logs go to ", h("a", { href: "#rumours", text: "Rumours" }), " as ",
          h("b", { class: "dw-alert", text: "Alert" }), " · ", h("b", { class: "dw-med", text: "Medium" }),
          " until a reputable source confirms them. They never reach the block list."),
        h("p", { class: "dw-lead-n" }, leads.length ? (leads.length + " sent to Rumours in this update.") : "None in this update.")),
      h("footer", { class: "dw-foot" },
        h("p", { text: d.disclaimer }),
        h("p", null, "Source: ", h("a", { href: "https://www.ransomlook.io/", rel: "noopener", target: "_blank", text: "RansomLook" }), " (public leak-site tracker). ",
          "Listed in error? ", h("a", { href: "https://github.com/daniyyell-dev/rapid-threat-intel/issues/new/choose", rel: "noopener", target: "_blank", text: "Ask for a review" }), ". We check takedown requests within 24 hours."))
    ]);
  }
  function load() {
    if (DW.loading) return DW.loading;
    DW.loading = fetch("darkweb.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { DW.data = d; DW.loading = null; return d; }, function () { DW.loading = null; return null; });
    return DW.loading;
  }
  window.renderDarkweb = function () {
    render();
    load().then(function (d) {
      if (!d) { var u = document.querySelector("#view-darkweb .dw-upd"); if (u) u.textContent = "Dark web data is unavailable right now."; return; }
      if (document.body.getAttribute("data-view") === "darkweb") render();
    });
  };
})();

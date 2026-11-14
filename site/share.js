/* Copy helpers for crawlable /t/<id>/ pages. Values in data-copy are the real indicators. */
(function () {
  var toastTimer;
  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 1800);
  }
  function mark(btn, ok, msg) {
    if (!btn) return;
    if (btn.querySelector("svg")) {
      var prev = btn.getAttribute("aria-label") || "";
      btn.classList.toggle("done", ok);
      btn.classList.toggle("fail", !ok);
      if (ok) btn.setAttribute("aria-label", msg || "Copied");
      setTimeout(function () {
        btn.classList.remove("done", "fail");
        if (prev) btn.setAttribute("aria-label", prev);
      }, 1400);
      return;
    }
    if (!ok) return;
    var prev = btn.getAttribute("data-label") || btn.textContent;
    btn.setAttribute("data-label", prev);
    btn.textContent = "Copied";
    btn.classList.add("done");
    setTimeout(function () { btn.textContent = prev; btn.classList.remove("done"); }, 1400);
  }
  function copyText(text, btn, msg) {
    function done(ok) {
      toast(ok ? (msg || "Copied the real value") : "Copy failed");
      mark(btn, ok, msg || "Copied");
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.className = "offscreen";
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
  function collect(sel) {
    var out = [], seen = {};
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
      var v = el.getAttribute("data-copy");
      if (!v || seen[v]) return;
      seen[v] = 1;
      out.push(v);
    });
    return out.join("\n");
  }
  document.addEventListener("click", function (e) {
    var ico = e.target.closest && e.target.closest(".copy-ico[data-copy]");
    if (ico) {
      e.preventDefault();
      copyText(ico.getAttribute("data-copy"), ico);
      return;
    }
    var all = e.target.closest && e.target.closest("[data-copy-all]");
    if (all) {
      e.preventDefault();
      var text = collect("table.ind-compact tbody [data-copy]");
      if (!text) { toast("Nothing to copy"); return; }
      copyText(text, all, "Copied all");
      return;
    }
    var blk = e.target.closest && e.target.closest("[data-copy-block]");
    if (blk) {
      e.preventDefault();
      var text = collect('table.ind-compact tbody tr[data-action="block"] [data-copy]');
      if (!text) { toast("Nothing to copy"); return; }
      copyText(text, blk, "Copied block list");
    }
  });
})();

(function (global) {
  function queryParams() {
    var params = {};
    var search = String(location.search || "").replace(/^\?/, "");
    search.split("&").forEach(function (item) {
      if (!item) return;
      var parts = item.split("=");
      if (parts[0]) {
        params[parts[0]] = decodeURIComponent((parts[1] || "").replace(/\+/g, " "));
      }
    });
    return params;
  }

  function normalizeApiBase(url) {
    var value = String(url || "").trim();
    if (!value) return "";
    if (!/^https?:\/\//i.test(value)) return "";
    value = value.replace(/\/+$/, "");
    if (!/\/api$/i.test(value)) {
      value += "/api";
    }
    return value;
  }

  function apiBase() {
    var q = queryParams();
    var fromQuery = normalizeApiBase(q.apiBase || q.api);
    if (fromQuery) return fromQuery;
    try {
      var stored = normalizeApiBase(sessionStorage.getItem("sv_api_base") || "");
      if (stored) return stored;
    } catch (e) {}
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(location.origin)) {
      return "http://localhost:5000/api";
    }
    return "https://api.schoolvertex.com/api";
  }

  function token() {
    var q = queryParams();
    return String(q.t || q.token || "").trim();
  }

  function url(name) {
    return apiBase() + "/ReportShare/" + name + "?t=" + encodeURIComponent(token());
  }

  function isLocalHost(hostname) {
    return /^(localhost|127\.0\.0\.1)$/i.test(String(hostname || ""));
  }

  function originHome(origin) {
    return String(origin || "").replace(/\/+$/, "") + "/#/";
  }

  function appHomeUrl() {
    var q = queryParams();
    var fromQuery = String(q.home || q.appHome || "").trim();
    if (fromQuery) return fromQuery;
    try {
      var stored = String(sessionStorage.getItem("sv_app_home") || "").trim();
      if (stored) return stored;
    } catch (e) {}
    try {
      if (global.top && global.top !== global && global.top.location) {
        var parentOrigin = global.top.location.origin;
        if (parentOrigin) return originHome(parentOrigin);
      }
    } catch (e) {}
    if (isLocalHost(location.hostname)) {
      if (location.port === "8100" || !location.port) {
        return originHome(location.origin);
      }
      return "http://localhost:8100/#/";
    }
    return "https://schoolvertex.com/#/";
  }

  function goHome() {
    var home = appHomeUrl();
    try {
      if (global.top && global.top !== global) {
        global.top.location.href = home;
        return;
      }
    } catch (e) {}
    location.href = home;
  }

  function isAppHost(hostname) {
    var host = String(hostname || "");
    return /^(localhost|127\.0\.0\.1)$/i.test(host) || /(^|\.)schoolvertex\.com$/i.test(host);
  }

  function isInAppView() {
    var q = queryParams();
    if (/^(1|true|hide)$/i.test(String(q.noback || q.hideBack || "").trim())) {
      return false;
    }
    if (String(q.home || q.appHome || "").trim()) return true;
    if (/\/assets\/mobile-reports\//i.test(location.pathname) && isAppHost(location.hostname)) {
      return true;
    }
    try {
      if (global.top && global.top !== global) {
        var parentHost = global.top.location.hostname;
        if (isAppHost(parentHost)) return true;
      }
    } catch (e) {}
    return false;
  }

  function injectHomeBack() {
    if (!isInAppView()) return;
    if (document.getElementById("sv-home-back")) return;
    if (!document.body) return;

    if (!document.getElementById("sv-home-back-style")) {
      var style = document.createElement("style");
      style.id = "sv-home-back-style";
      style.textContent =
        ".sv-home-back-bar{max-width:var(--shell-max,1240px);margin:0 auto;padding:12px 14px 0;box-sizing:border-box}" +
        ".sv-home-back{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;border:1px solid rgba(11,79,108,.18);background:#fff;color:#0b4f6c;font:700 .8rem/1 'DM Sans',system-ui,sans-serif;text-decoration:none;box-shadow:0 1px 2px rgba(16,40,60,.06)}" +
        ".sv-home-back:hover{background:#f4f8fb}" +
        "@media print{.sv-home-back-bar,.sv-home-back{display:none!important}}";
      document.head.appendChild(style);
    }

    var bar = document.createElement("div");
    bar.className = "sv-home-back-bar";
    var btn = document.createElement("a");
    btn.id = "sv-home-back";
    btn.className = "sv-home-back";
    btn.href = appHomeUrl();
    btn.setAttribute("aria-label", "Back to home");
    btn.innerHTML = "<span aria-hidden=\"true\">←</span> Back";
    btn.addEventListener("click", function (event) {
      event.preventDefault();
      goHome();
    });
    bar.appendChild(btn);
    document.body.insertBefore(bar, document.body.firstChild);
  }

  global.ReportShare = {
    query: queryParams,
    token: token,
    apiBase: apiBase,
    homeUrl: appHomeUrl,
    goHome: goHome,
    hasToken: function () {
      return !!token();
    },
    url: url
  };

  Object.defineProperty(global.ReportShare, "API_BASE", {
    get: apiBase
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectHomeBack);
  } else {
    injectHomeBack();
  }
})(window);

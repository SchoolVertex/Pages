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

  function hostApiBase(hostname) {
    var host = String(hostname || "").toLowerCase();
    if (/^(localhost|127\.0\.0\.1)$/.test(host)) {
      return "http://localhost:5000/api";
    }
    if (host === "dev.schoolvertex.com" || host === "dev-api.schoolvertex.com") {
      return "https://dev-api.schoolvertex.com/api";
    }
    return "https://api.schoolvertex.com/api";
  }

  function apiBase() {
    var q = queryParams();
    var fromQuery = normalizeApiBase(q.apiBase || q.api);
    if (fromQuery) return fromQuery;
    try {
      var stored = normalizeApiBase(sessionStorage.getItem("sv_api_base") || "");
      if (stored) return stored;
    } catch (e) {}
    try {
      if (global.top && global.top !== global && global.top.location) {
        return hostApiBase(global.top.location.hostname);
      }
    } catch (e) {}
    return hostApiBase(location.hostname);
  }

  function apiRoot() {
    return apiBase().replace(/\/api$/i, "") + "/";
  }

  global.SvApi = {
    apiBase: apiBase,
    apiRoot: apiRoot
  };
  Object.defineProperty(global.SvApi, "API_BASE", { get: apiBase });
  Object.defineProperty(global.SvApi, "API_ROOT", { get: apiRoot });
})(window);

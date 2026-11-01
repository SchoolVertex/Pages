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

  global.ReportShare = {
    query: queryParams,
    token: token,
    apiBase: apiBase,
    hasToken: function () {
      return !!token();
    },
    url: url
  };

  Object.defineProperty(global.ReportShare, "API_BASE", {
    get: apiBase
  });
})(window);

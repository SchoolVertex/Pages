(function (global) {
  var API_BASE = "https://api.schoolvertex.com/api";

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

  function token() {
    var q = queryParams();
    return String(q.t || q.token || "").trim();
  }

  function url(name) {
    return API_BASE + "/ReportShare/" + name + "?t=" + encodeURIComponent(token());
  }

  global.ReportShare = {
    API_BASE: API_BASE,
    query: queryParams,
    token: token,
    hasToken: function () {
      return !!token();
    },
    url: url
  };
})(window);

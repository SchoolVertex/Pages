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

  function hasOwnNonEmpty(obj, key) {
    return !!(obj && obj[key] != null && String(obj[key]).trim() !== "");
  }

  /**
   * AISensy / WhatsApp buttons allow one query param.
   * ?Id=userId-orgId (hyphen-separated, same order as the named keys).
   * Existing named params still win when present.
   */
  function expandCompactId(query, keys) {
    var out = {};
    var src = query || {};
    Object.keys(src).forEach(function (k) {
      out[k] = src[k];
    });
    keys = keys || [];
    if (!keys.length) return out;

    var compact = hasOwnNonEmpty(out, "Id")
      ? out.Id
      : hasOwnNonEmpty(out, "id")
        ? out.id
        : "";
    if (!compact) return out;

    var parts = String(compact).split("-");
    if (keys.length > 1 && parts.length < 2) {
      if (!hasOwnNonEmpty(out, keys[0])) {
        out[keys[0]] = parts[0];
      }
      return out;
    }

    for (var i = 0; i < keys.length && i < parts.length; i++) {
      if (!hasOwnNonEmpty(out, keys[i])) {
        out[keys[i]] = parts[i];
      }
    }
    return out;
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
      return "http://localhost:5050/api";
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

  global.SvApi = {
    apiBase: apiBase,
    apiRoot: apiRoot
  };
  Object.defineProperty(global.SvApi, "API_BASE", { get: apiBase });
  Object.defineProperty(global.SvApi, "API_ROOT", { get: apiRoot });

  function loadStudentCertificate($http) {
    if (!token()) {
      return Promise.reject({ message: "Open this certificate from the School Vertex app." });
    }
    return $http.get(url("StudentCertificate")).then(function (response) {
      var data = (response.data && response.data.Data) || {};
      return {
        orgInfo: data.OrgInfo || {},
        userInfo: data.UserInfo || {}
      };
    });
  }

  function loadAdmission($http) {
    if (!token()) {
      return Promise.reject({ message: "Open this admission form from the School Vertex app." });
    }
    return $http.get(url("Admission")).then(function (response) {
      var data = (response.data && response.data.Data) || {};
      return {
        orgInfo: data.OrgInfo || {},
        admInfo: data.AdmInfo || {},
        classNumber: data.ClassNumber
      };
    });
  }

  function loadInquiryForm($http) {
    if (!token()) {
      return Promise.reject({
        message: "Open this inquiry form from the School Vertex app."
      });
    }
    return $http.get(url("InquiryForm")).then(function (response) {
      var data = (response.data && response.data.Data) || {};
      return {
        orgInfo: data.OrgInfo || {}
      };
    });
  }

  function loadPoster($http, routeName, openMessage) {
    if (!token()) {
      return Promise.reject({
        message: openMessage || "Open this page from the School Vertex app."
      });
    }
    return $http.get(url(routeName)).then(function (response) {
      var data = (response.data && response.data.Data) || {};
      return {
        orgInfo: data.OrgInfo || {},
        userInfo: data.UserInfo || {},
        parentList: data.ParentList || []
      };
    });
  }

  function loadBirthday($http) {
    return loadPoster(
      $http,
      "Birthday",
      "Open this birthday poster from the School Vertex app."
    );
  }

  function loadSports($http) {
    return loadPoster(
      $http,
      "Sports",
      "Open this sports certificate from the School Vertex app."
    );
  }

  function loadAcademic($http) {
    return loadPoster(
      $http,
      "Academic",
      "Open this academic certificate from the School Vertex app."
    );
  }

  function loadStaffDocument($http, routeName, openMessage) {
    return loadPoster(
      $http,
      routeName,
      openMessage || "Open this document from the School Vertex app."
    );
  }

  function loadFeeDeclaration($http) {
    if (!token()) {
      return Promise.reject({
        message: "Open this fee declaration from the School Vertex app."
      });
    }
    return $http.get(url("FeeDeclaration")).then(function (response) {
      var data = (response.data && response.data.Data) || {};
      return {
        orgInfo: data.OrgInfo || {},
        feeInfo: data.FeeInfo || []
      };
    });
  }

  function loadFeeReceipt($http) {
    if (!token()) {
      return Promise.reject({
        message: "Open this fee receipt from the School Vertex app."
      });
    }
    return $http.get(url("FeeReceipt")).then(function (response) {
      var data = (response.data && response.data.Data) || {};
      return {
        fee: data.Fee || null,
        receiptInfo: data.ReceiptInfo || {},
        preData: data.PreData || {},
        summary: data.Summary || {}
      };
    });
  }

  function loadIdCard($http) {
    if (!token()) {
      return Promise.reject({
        message: "Open this ID card from the School Vertex app."
      });
    }
    return $http.get(url("IdCard")).then(function (response) {
      var data = (response.data && response.data.Data) || {};
      return {
        orgInfo: data.OrgInfo || {},
        card: data.Card || null,
        cards: data.Cards || []
      };
    });
  }

  function loadStaffIdCard($http) {
    if (!token()) {
      return Promise.reject({
        message: "Open this staff ID card from the School Vertex app."
      });
    }
    return $http.get(url("StaffIdCard")).then(function (response) {
      var data = (response.data && response.data.Data) || {};
      return {
        orgInfo: data.OrgInfo || {},
        card: data.Card || null,
        cards: data.Cards || []
      };
    });
  }

  function loadIdCardOrg($http) {
    if (!token()) {
      return Promise.reject({
        message: "Open this ID card page from the School Vertex app."
      });
    }
    return $http.get(url("IdCardOrg")).then(function (response) {
      var data = (response.data && response.data.Data) || {};
      return {
        orgInfo: data.OrgInfo || {}
      };
    });
  }

  function postIdCardList($http, orgId, userList) {
    if (!token()) {
      return Promise.reject({
        message: "Open this ID card page from the School Vertex app."
      });
    }
    return $http
      .post(url("IdCardList"), {
        OrgId: orgId,
        UserList: userList || []
      })
      .then(function (response) {
        var data = (response.data && response.data.Data) || {};
        return {
          orgInfo: data.OrgInfo || {},
          cards: data.Cards || []
        };
      });
  }

  global.ReportShare = {
    query: queryParams,
    expandCompactId: expandCompactId,
    token: token,
    apiBase: apiBase,
    apiRoot: apiRoot,
    homeUrl: appHomeUrl,
    goHome: goHome,
    hasToken: function () {
      return !!token();
    },
    url: url,
    loadStudentCertificate: loadStudentCertificate,
    loadAdmission: loadAdmission,
    loadInquiryForm: loadInquiryForm,
    loadBirthday: loadBirthday,
    loadSports: loadSports,
    loadAcademic: loadAcademic,
    loadStaffDocument: loadStaffDocument,
    loadFeeDeclaration: loadFeeDeclaration,
    loadFeeReceipt: loadFeeReceipt,
    loadIdCard: loadIdCard,
    loadStaffIdCard: loadStaffIdCard,
    loadIdCardOrg: loadIdCardOrg,
    postIdCardList: postIdCardList
  };

  Object.defineProperty(global.ReportShare, "API_BASE", {
    get: apiBase
  });
  Object.defineProperty(global.ReportShare, "API_ROOT", {
    get: apiRoot
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectHomeBack);
  } else {
    injectHomeBack();
  }
})(window);

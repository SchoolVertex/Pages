/**
 * Shared auth for School Vertex StudentReports (app iframe embeds).
 * Parent app posts: { type: 'sv-auth-token', token: '<jwt>' }
 * Report requests token with: { type: 'sv-auth-ready' }
 * Report can ask parent to navigate: { type: 'sv-navigate', path: '/organisation/...' }
 */
(function (global) {
  var token = null;
  var parentOrigin = "*";
  var ready = false;
  var waiters = [];
  var ALLOWED_PARENT_HOSTS = [
    "localhost",
    "127.0.0.1",
    "schoolvertex.com",
    "www.schoolvertex.com",
    "app.schoolvertex.com",
  ];

  function notify() {
    var list = waiters.slice();
    waiters = [];
    list.forEach(function (fn) {
      try {
        fn(token);
      } catch (e) {
        /* ignore */
      }
    });
  }

  function isAllowedOrigin(origin) {
    if (!origin || origin === "null") {
      // Capacitor / file / opaque origins
      return true;
    }
    try {
      var host = new URL(origin).hostname.toLowerCase();
      if (
        host === "localhost" ||
        host.indexOf("localhost") >= 0 ||
        host.indexOf("127.0.0.1") >= 0
      ) {
        return true;
      }
      for (var i = 0; i < ALLOWED_PARENT_HOSTS.length; i++) {
        var allowed = ALLOWED_PARENT_HOSTS[i];
        if (host === allowed || host.endsWith("." + allowed)) {
          return true;
        }
      }
      // Ionic / Capacitor custom schemes
      if (
        origin.indexOf("capacitor://") === 0 ||
        origin.indexOf("ionic://") === 0 ||
        origin.indexOf("http://localhost") === 0
      ) {
        return true;
      }
    } catch (e) {
      return true;
    }
    return false;
  }

  function readQueryToken() {
    try {
      var search = global.location.search || "";
      if (search.charAt(0) === "?") search = search.substring(1);
      var parts = search.split("&");
      for (var i = 0; i < parts.length; i++) {
        var pair = parts[i].split("=");
        var key = decodeURIComponent(pair[0] || "");
        if (key === "accessToken" || key === "token") {
          return decodeURIComponent((pair[1] || "").replace(/\+/g, " "));
        }
      }
    } catch (e) {
      /* ignore */
    }
    return null;
  }

  function requestToken() {
    if (!global.parent || global.parent === global) {
      token = readQueryToken();
      ready = true;
      notify();
      return;
    }
    try {
      global.parent.postMessage({ type: "sv-auth-ready" }, "*");
    } catch (e) {
      /* ignore */
    }
    // Fallback if parent never answers (opened outside app)
    setTimeout(function () {
      if (!ready) {
        token = readQueryToken();
        ready = true;
        notify();
      }
    }, 1200);
  }

  function onMessage(event) {
    var data = event && event.data;
    if (!data || typeof data !== "object") {
      return;
    }
    if (data.type !== "sv-auth-token") {
      return;
    }
    if (!isAllowedOrigin(event.origin)) {
      return;
    }
    token = data.token || null;
    parentOrigin = event.origin || "*";
    ready = true;
    notify();
  }

  global.addEventListener("message", onMessage);

  var api = {
    whenReady: function (cb) {
      if (ready) {
        cb(token);
      } else {
        waiters.push(cb);
      }
    },
    getToken: function () {
      return token;
    },
    isAuthenticated: function () {
      return !!token;
    },
    authHeaders: function (extra) {
      var headers = Object.assign({}, extra || {});
      if (token) {
        headers.Authorization = "Bearer " + token;
      }
      return headers;
    },
    /** AngularJS $http config helper */
    withAuth: function (config) {
      config = config || {};
      config.headers = api.authHeaders(config.headers || {});
      return config;
    },
    /** Ask parent Ionic app to navigate (student actions) */
    navigate: function (path) {
      if (!path) return;
      if (!global.parent || global.parent === global) {
        try {
          global.location.href = path;
        } catch (e) {
          /* ignore */
        }
        return;
      }
      try {
        global.parent.postMessage(
          { type: "sv-navigate", path: path },
          parentOrigin || "*",
        );
      } catch (e) {
        /* ignore */
      }
    },
    applyAngularDefaults: function ($http) {
      if (!$http || !$http.defaults) return;
      if (token) {
        $http.defaults.headers.common.Authorization = "Bearer " + token;
      }
    },
  };

  requestToken();
  global.SvStudentAuth = api;
})(window);

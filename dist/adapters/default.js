module.exports = function (kc) {
  return {
    login: function (options) {
      window.location.href = kc.createLoginUrl(options);
      return createPromise().promise;
    },

    logout: function (options) {
      window.location.href = kc.createLogoutUrl(options);
      return createPromise().promise;
    },

    register: function (options) {
      window.location.href = kc.createRegisterUrl(options);
      return createPromise().promise;
    },

    accountManagement: function () {
      window.location.href = kc.createAccountUrl();
      return createPromise().promise;
    },

    redirectUri: function (options, encodeHash) {
      if (arguments.length == 1) {
        encodeHash = true;
      }

      if (options && options.redirectUri) {
        return options.redirectUri;
      } else if (kc.redirectUri) {
        return kc.redirectUri;
      } else {
        var redirectUri = location.href;
        if (location.hash && encodeHash) {
          redirectUri = redirectUri.substring(0, location.href.indexOf('#'));
          redirectUri += (redirectUri.indexOf('?') == -1 ? '?' : '&') + 'redirect_fragment=' + encodeURIComponent(location.hash.substring(1));
        }
        return redirectUri;
      }
    }
  };
};
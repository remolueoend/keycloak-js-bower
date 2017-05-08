function openIFrame(frame, frameUrl, redirUrl, callback) {
  var listener = function (event) {
    var url = event.data;
    if (event.source === frame.contentWindow && url.indexOf(redirUrl) !== -1) {
      callback(url, event);
      window.removeEventListener('message', listener);
    }
  };
  window.addEventListener('message', listener, false);
  frame.src = frameUrl;
}

module.exports = function (kc) {
  return {
    login: function (options) {
      var promise = kc.createPromise();

      var loginUrl = kc.createLoginUrl(options);
      var completed = false;

      openIFrame(options.iFrame, loginUrl, options.redirectUri, function (url, event) {
        var callback = kc.parseCallback(url);
        kc.processCallback(callback, promise);
        completed = true;
      });

      return promise.promise;
    },

    logout: function (options) {
      var promise = kc.createPromise();

      var logoutUrl = kc.createLogoutUrl(options);
      var ref = window.open(logoutUrl, '_blank', 'location=no,hidden=yes');

      var error;

      ref.addEventListener('loadstart', function (event) {
        if (event.url.indexOf('http://localhost') == 0) {
          ref.close();
        }
      });

      ref.addEventListener('loaderror', function (event) {
        if (event.url.indexOf('http://localhost') == 0) {
          ref.close();
        } else {
          error = true;
          ref.close();
        }
      });

      ref.addEventListener('exit', function (event) {
        if (error) {
          promise.setError();
        } else {
          kc.clearToken();
          promise.setSuccess();
        }
      });

      return promise.promise;
    },

    register: function () {
      var registerUrl = kc.createRegisterUrl();
      var ref = window.open(registerUrl, '_blank', 'location=no');
      ref.addEventListener('loadstart', function (event) {
        if (event.url.indexOf('http://localhost') == 0) {
          ref.close();
        }
      });
    },

    accountManagement: function () {
      var accountUrl = kc.createAccountUrl();
      var ref = window.open(accountUrl, '_blank', 'location=no');
      ref.addEventListener('loadstart', function (event) {
        if (event.url.indexOf('http://localhost') == 0) {
          ref.close();
        }
      });
    },

    redirectUri: function (options) {
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
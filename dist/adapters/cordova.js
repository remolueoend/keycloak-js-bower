module.exports = function (kc) {
  return {
    login: function (options) {
      var promise = createPromise();

      var o = 'location=no';
      if (options && options.prompt == 'none') {
        o += ',hidden=yes';
      }

      var loginUrl = kc.createLoginUrl(options);
      var ref = window.open(loginUrl, '_blank', o);

      var completed = false;

      ref.addEventListener('loadstart', function (event) {
        if (event.url.indexOf('http://localhost') == 0) {
          var callback = parseCallback(event.url);
          processCallback(callback, promise);
          ref.close();
          completed = true;
        }
      });

      ref.addEventListener('loaderror', function (event) {
        if (!completed) {
          if (event.url.indexOf('http://localhost') == 0) {
            var callback = parseCallback(event.url);
            processCallback(callback, promise);
            ref.close();
            completed = true;
          } else {
            promise.setError();
            ref.close();
          }
        }
      });

      return promise.promise;
    },

    logout: function (options) {
      var promise = createPromise();

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
      return 'http://localhost';
    }
  };
};
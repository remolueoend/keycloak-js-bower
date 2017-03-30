/**
 * Opens a popup with the given url and modifiers and waits for a message event
 * sent by the popup.
 * If the message contains a url matching the provided redirect url part, the provided callback
 * is executed with the full redirected url and original message event.
 * ```javascript
 * openPopup('mysite.com/auth', 'mysite.com/callback', 'location=no', function (url, event) {
 *   // url === mysite.com/callback?state=...
 * });
 * ```
 * 
 * @param {string} popupUrl The initial url of the popup to open.
 * @param {string} redirUrl The expected redirect url (part) of the popup.
 * @param {string} popupOptsStr Optional popup modifiers as string (see window.open docs)
 * @param {function} callback Callback provided the full redirect url and original message event.
 */
function openPopup(popupUrl, redirUrl, popupOptsStr, callback) {
  var popup = window.open(popupUrl, '_blank', popupOptsStr);
  var listener = function (event) {
    var url = event.data;
    if (event.source === popup && url.indexOf(redirUrl) !== -1) {
      popup.close();
      callback(url, event);
      window.removeEventListener('message', listener);
    }
  };
  window.addEventListener('message', listener, false);
}

module.exports = function (kc) {
  return {
    login: function (options) {
      var promise = kc.createPromise();

      var o = 'location=no,width=450,height=340';
      if (options && options.prompt == 'none') {
        o += ',hidden=yes';
      }

      var loginUrl = kc.createLoginUrl(options);
      var completed = false;

      openPopup(loginUrl, options.redirectUri, o, function (url, event) {
        var callback = kc.parseCallback(url);
        kc.processCallback(callback, promise);
        completed = true;
      });

      /*ref.addEventListener('loaderror', function (event) {
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
      });*/

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
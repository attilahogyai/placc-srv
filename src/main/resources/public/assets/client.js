"use strict";

/* jshint ignore:start */



/* jshint ignore:end */

define("client/adapters/application", ["exports", "ember-data"], function (exports, _emberData) {
	var DefaultRest = _emberData["default"].JSONAPIAdapter.reopen({
		shouldReloadAll: function shouldReloadAll() {
			return true;
		},
		//host: 'http://myplacc.hu',
		namespace: "japi",
		ajaxOptions: function ajaxOptions(url, type, hash) {
			var t;
			var si = window.location.href.indexOf("?t=");
			if (si > -1) {
				t = window.location.href.substring(si + 3);
			}
			if (url.indexOf('?') === -1) {
				url += '?l=' + this.get('session.language');
			} else {
				url += '&l=' + this.get('session.language');
			}
			if (t) {
				url += "&t=" + t;
			}
			var s = this.get('session.solution');

			if (s) {
				this.set('session.solution', null);
				url = url + "&s=" + s;
			}

			var retv = this._super(url, type, hash);

			var token = this.get('session.token');
			retv.beforeSend = function (xhr) {
				if (token) {
					xhr.setRequestHeader("Authorization", "Bearer " + token);
				}
			};
			return retv;
		},
		ajax: function ajax(url, type, options) {
			var retv = this._super(url, type, options);
			retv["catch"](function (response) {
				if (parseInt(response.status) === 401) {
					window.xappc.reload();
				}
			});
			return retv;
		}
	});
	exports["default"] = DefaultRest;
});
define('client/adapters/ls-adapter', ['exports', 'ember-localstorage-adapter/adapters/ls-adapter'], function (exports, _emberLocalstorageAdapterAdaptersLsAdapter) {
  exports['default'] = _emberLocalstorageAdapterAdaptersLsAdapter['default'];
});
define('client/adapters/restadapter', ['exports', 'ember-data'], function (exports, _emberData) {

	var RestAdapter = _emberData['default'].RESTAdapter.reopen({
		namespace: "/api",
		ajaxOptions: function ajaxOptions(url, type, hash) {
			if (url.indexOf('?') === -1) {
				url += '?l=' + this.get('session.language');
			} else {
				url += '&l=' + this.get('session.language');
			}
			var s = this.get('session.solution');

			if (s) {
				this.set('session.solution', null);
				url = url + "&s=" + s;
			}
			var retv = this._super(url, type, hash);

			var token = this.get('session.token');
			retv.beforeSend = function (xhr) {
				if (token) {
					xhr.setRequestHeader("Authorization", "Bearer " + token);
				}
			};
			return retv;
		},
		ajax: function ajax(url, type, options) {
			var retv = this._super(url, type, options);
			retv['catch'](function (response) {
				if (parseInt(response.status) === 401) {
					window.xappc.reload();
				}
			});
			return retv;
		}
	});
	exports['default'] = RestAdapter;
});
define('client/adapters/session', ['exports', 'ember-localstorage-adapter'], function (exports, _emberLocalstorageAdapter) {
  exports['default'] = _emberLocalstorageAdapter['default'].extend({});
});
define('client/adapters/user', ['exports', 'client/adapters/restadapter'], function (exports, _clientAdaptersRestadapter) {

        var UserAdapter = _clientAdaptersRestadapter['default'].extend({
                createRecord: function createRecord(store, type, record) {
                        var data = {};
                        var serializer = store.serializerFor('user');

                        serializer.serializeIntoHash(data, type, record, { includeId: true });

                        return this.ajax(this.namespace + '/signup', "POST", { data: data });
                }
        });

        exports['default'] = UserAdapter;
});
define('client/app', ['exports', 'ember', 'client/resolver', 'ember-load-initializers', 'client/config/environment'], function (exports, _ember, _clientResolver, _emberLoadInitializers, _clientConfigEnvironment) {

	var App = undefined;

	_ember['default'].MODEL_FACTORY_INJECTIONS = true;

	App = _ember['default'].Application.extend({
		modulePrefix: _clientConfigEnvironment['default'].modulePrefix,
		podModulePrefix: _clientConfigEnvironment['default'].podModulePrefix,
		Resolver: _clientResolver['default']
	});

	_ember['default'].onerror = function (error) {
		var status = error.errors && error.errors[0].status || error.status;
		var errors = error.errors && error.errors[0].code || 'general';

		if (status == '403') {
			Materialize.toast('<span style="font-size:1.2em;white-space:nowrap;max-width:800px;">Sorry, accessing this content is denined! Please sign in to access this content!<span>', 10000, "", function () {/*window.xappc.reload();*/});
			_ember['default'].Logger.error("error:" + status + ":" + error.statusText);
		} else if (status == '417') {
			Materialize.toast('<span style="font-size:1.2em;white-space:nowrap;max-width:800px;">Expectation Failed, reloading session in progress!<span>', 10000, "", function () {/*window.xappc.reload(true);*/});
			_ember['default'].Logger.error("error:" + status + ":" + error.statusText);
		} else if (status == '404') {
			Materialize.toast('<span style="font-size:1.2em;white-space:nowrap;max-width:800px;">Sorry, The requested content was not found!', 10000, "", function () {/*window.xappc.reload();*/});
			_ember['default'].Logger.error("error:" + status + ":" + error.statusText);
		} else {
			var headers = {};
			if (window.xappc.session) {
				headers["Authorization"] = "Bearer " + window.xappc.session.get('token');
			}
			_ember['default'].$.ajax({
				type: 'POST',
				url: '/error-notification',
				headers: headers,
				data: {
					stack: error + " : " + error.stack,
					otherInformation: error.message
				}
			});
			if (errors === 'general') {
				Materialize.toast('<span style="font-size:0.8em;white-space:nowrap;max-width:800px;">Operation failed. Try later or <a href="javascript:document.location.reload();">refresh!</a></span>', 6000);
			} else {
				var t = 'Application error:' + errors;
				Materialize.toast('<span style="font-size:0.8em;white-space:nowrap;max-width:800px;">' + t + '</span>', 6000);
			}

			if (error.message) {
				_ember['default'].Logger.error("error:" + error.message + "-> " + error.stack);
			} else {
				_ember['default'].Logger.error("error:" + error);
			}
			//console.log("error:"+error+" : "+error.stack);
		}
	};

	window.xappc = {
		reload: function reload(clean) {
			if (clean) {
				if (window.localStorage) window.localStorage.clear();
			}
			_ember['default'].run.schedule('afterRender', function () {
				var n = window.location.href.indexOf("#");
				window.location.href = window.location.href.substring(0, n);
			});
		},
		getData: function getData(url, async, type, processdata, cache, data, success, error) {

			if (url.indexOf('ext:') === 0) {
				url = 'https://myplacc.hu' + url.substring(3, url.length);
			} else {

				url = url.charAt(0) === '/' ? url : '/' + url;
			}
			_ember['default'].$.ajaxSetup({ async: async });
			var headers = {};
			if (window.xappc.session) {
				headers["Authorization"] = "Bearer " + window.xappc.session.get('token');
			}
			return _ember['default'].$.ajax({
				type: type,
				data: data,
				url: url,
				headers: headers,
				processdata: processdata,
				cache: cache,
				success: success,
				error: error
			});
		},
		session: null,
		appInstane: null,
		i18n: null
	};

	(0, _emberLoadInitializers['default'])(App, _clientConfigEnvironment['default'].modulePrefix);

	exports['default'] = App;
});
define('client/components/app-view', ['exports', 'ember'], function (exports, _ember) {

    var view = _ember['default'].Component.extend({
        appstate: _ember['default'].inject.service(),
        tagName: '',
        didInsertElement: function didInsertElement() {
            _ember['default'].$('#preNavigation').remove();
            _ember['default'].$('.button-collapse').sideNav({
                //menuWidth: 300, // Default is 240
                //edge: 'right', // Choose the horizontal origin
                closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
            });

            _ember['default'].$(".dropdown-button").dropdown();

            _ember['default'].addChangeSizeListener('qumla-main-view', this, this.viewportSizeChanged);
            this.viewportSizeChanged();
        },
        /*
        var lastScrollTop = 0;
        var hidden = false;
        var lastMovement = null;
        var nav=$( "#navigation" );	
        var slide=function(){
        var st = $(window).scrollTop();
        if(st < lastScrollTop || st===0 ) {
        if(hidden || st===0){
        nav.velocity({ translateY:"0px"},{complete:function(){
        nav.removeAttr('style');
        }});
        hidden = false;
        }
        	}else {
        if(!hidden){
        nav.velocity({ translateY:"-50px"});// delay: 0, duration: 300 
        hidden = true;
        }
        	}
        lastScrollTop = st;
        }
        $( window ).scroll(function(){
        if(lastMovement){
        Ember.run.cancel(lastMovement);
        lastMovement=null;
        }
        lastMovement=Ember.run.debounce(this,slide,50);
        });
        */
        viewportSizeChanged: function viewportSizeChanged() {
            var fullHeight = _ember['default'].$(window).height();
            var fullWidth = _ember['default'].$(window).width();

            this.set('appstate.heigth', fullHeight);
            this.set('appstate.width', fullWidth);
            var headerSize = 0;
            var navs = _ember['default'].$("#navigation");
            navs.map(function (item) {
                var n = _ember['default'].$(navs[item]);
                if (n.css('display') !== 'none') {
                    headerSize = headerSize + n.outerHeight();
                }
            });
            var footerHeight = _ember['default'].$("#footer").outerHeight() + 20;

            var mainHeight = fullHeight - footerHeight - headerSize;
            _ember['default'].$("#main").css('min-height', mainHeight);
            window.console.log('full size:' + fullWidth + 'x' + fullHeight + ' headerSize:' + headerSize + ' footerheight:' + footerHeight + ' mainheight:' + mainHeight);
        }
    });

    function cs() {
        for (var property in _ember['default'].changeSizeListeners) {
            if (_ember['default'].changeSizeListeners.hasOwnProperty(property)) {
                var listener = _ember['default'].changeSizeListeners[property];
                if (!listener) {
                    continue;
                }
                _ember['default'].run(listener.ctx, listener.func);
            }
        }
    }

    _ember['default'].changeSizeListeners = {};
    _ember['default'].changeSize = function () {
        _ember['default'].run.debounce(this, cs, 150);
    };
    _ember['default'].addChangeSizeListener = function (owner, context, listener) {
        _ember['default'].assert("second parameter should be unique for application", owner);
        var listeners = _ember['default'].changeSizeListeners;
        listeners[owner] = { func: listener, ctx: context };
    };
    _ember['default'].removeChangeSizeListeners = function (owner) {
        var listeners = _ember['default'].changeSizeListeners;
        listeners[owner] = null;
    };

    exports['default'] = view;
});
define('client/components/infinity-loader', ['exports', 'ember-infinity/components/infinity-loader'], function (exports, _emberInfinityComponentsInfinityLoader) {
  exports['default'] = _emberInfinityComponentsInfinityLoader['default'];
});
define('client/components/one-way-checkbox', ['exports', 'ember-one-way-controls/components/one-way-checkbox'], function (exports, _emberOneWayControlsComponentsOneWayCheckbox) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWayCheckbox['default'];
    }
  });
});
define('client/components/one-way-color', ['exports', 'ember-one-way-controls/components/one-way-color'], function (exports, _emberOneWayControlsComponentsOneWayColor) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWayColor['default'];
    }
  });
});
define('client/components/one-way-date', ['exports', 'ember-one-way-controls/components/one-way-date'], function (exports, _emberOneWayControlsComponentsOneWayDate) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWayDate['default'];
    }
  });
});
define('client/components/one-way-datetime-local', ['exports', 'ember-one-way-controls/components/one-way-datetime-local'], function (exports, _emberOneWayControlsComponentsOneWayDatetimeLocal) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWayDatetimeLocal['default'];
    }
  });
});
define('client/components/one-way-email', ['exports', 'ember-one-way-controls/components/one-way-email'], function (exports, _emberOneWayControlsComponentsOneWayEmail) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWayEmail['default'];
    }
  });
});
define('client/components/one-way-file', ['exports', 'ember-one-way-controls/components/one-way-file'], function (exports, _emberOneWayControlsComponentsOneWayFile) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWayFile['default'];
    }
  });
});
define('client/components/one-way-hidden', ['exports', 'ember-one-way-controls/components/one-way-hidden'], function (exports, _emberOneWayControlsComponentsOneWayHidden) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWayHidden['default'];
    }
  });
});
define('client/components/one-way-input', ['exports', 'ember-one-way-controls/components/one-way-input'], function (exports, _emberOneWayControlsComponentsOneWayInput) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWayInput['default'];
    }
  });
});
define('client/components/one-way-month', ['exports', 'ember-one-way-controls/components/one-way-month'], function (exports, _emberOneWayControlsComponentsOneWayMonth) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWayMonth['default'];
    }
  });
});
define('client/components/one-way-number', ['exports', 'ember-one-way-controls/components/one-way-number'], function (exports, _emberOneWayControlsComponentsOneWayNumber) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWayNumber['default'];
    }
  });
});
define('client/components/one-way-password', ['exports', 'ember-one-way-controls/components/one-way-password'], function (exports, _emberOneWayControlsComponentsOneWayPassword) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWayPassword['default'];
    }
  });
});
define('client/components/one-way-radio', ['exports', 'ember-one-way-controls/components/one-way-radio'], function (exports, _emberOneWayControlsComponentsOneWayRadio) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWayRadio['default'];
    }
  });
});
define('client/components/one-way-range', ['exports', 'ember-one-way-controls/components/one-way-range'], function (exports, _emberOneWayControlsComponentsOneWayRange) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWayRange['default'];
    }
  });
});
define('client/components/one-way-search', ['exports', 'ember-one-way-controls/components/one-way-search'], function (exports, _emberOneWayControlsComponentsOneWaySearch) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWaySearch['default'];
    }
  });
});
define('client/components/one-way-select', ['exports', 'ember-one-way-controls/components/one-way-select'], function (exports, _emberOneWayControlsComponentsOneWaySelect) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWaySelect['default'];
    }
  });
});
define('client/components/one-way-select/option', ['exports', 'ember-one-way-controls/components/one-way-select/option'], function (exports, _emberOneWayControlsComponentsOneWaySelectOption) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWaySelectOption['default'];
    }
  });
});
define('client/components/one-way-tel', ['exports', 'ember-one-way-controls/components/one-way-tel'], function (exports, _emberOneWayControlsComponentsOneWayTel) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWayTel['default'];
    }
  });
});
define('client/components/one-way-text', ['exports', 'ember-one-way-controls/components/one-way-text'], function (exports, _emberOneWayControlsComponentsOneWayText) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWayText['default'];
    }
  });
});
define('client/components/one-way-textarea', ['exports', 'ember-one-way-controls/components/one-way-textarea'], function (exports, _emberOneWayControlsComponentsOneWayTextarea) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWayTextarea['default'];
    }
  });
});
define('client/components/one-way-time', ['exports', 'ember-one-way-controls/components/one-way-time'], function (exports, _emberOneWayControlsComponentsOneWayTime) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWayTime['default'];
    }
  });
});
define('client/components/one-way-url', ['exports', 'ember-one-way-controls/components/one-way-url'], function (exports, _emberOneWayControlsComponentsOneWayUrl) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWayUrl['default'];
    }
  });
});
define('client/components/one-way-week', ['exports', 'ember-one-way-controls/components/one-way-week'], function (exports, _emberOneWayControlsComponentsOneWayWeek) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsComponentsOneWayWeek['default'];
    }
  });
});
define("client/components/page-view", ["exports", "ember"], function (exports, _ember) {
	exports["default"] = _ember["default"].Component.extend({
		scrollToTop: false,
		tagName: "",
		didInsertElement: function didInsertElement() {
			if (this.get('scrollToTop')) {
				_ember["default"].run('afterRender', function () {
					_ember["default"].run.later(function () {
						_ember["default"].$("body").velocity("scroll", { duration: 1000, easing: "ease" });
					}, 200);
				});
			}
		}
	});
});
define('client/components/welcome-page', ['exports', 'ember-welcome-page/components/welcome-page'], function (exports, _emberWelcomePageComponentsWelcomePage) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberWelcomePageComponentsWelcomePage['default'];
    }
  });
});
define('client/helpers/and-b', ['exports', 'ember'], function (exports, _ember) {

	function and(params) {
		for (var i = 0; i < params.length; i++) {
			if (!params[i]) return false;
		}
		return true;
	}
	exports['default'] = _ember['default'].Helper.helper(and);
});
define('client/helpers/app-version', ['exports', 'ember', 'client/config/environment'], function (exports, _ember, _clientConfigEnvironment) {
  exports.appVersion = appVersion;
  var version = _clientConfigEnvironment['default'].APP.version;

  function appVersion() {
    return version;
  }

  exports['default'] = _ember['default'].Helper.helper(appVersion);
});
define('client/helpers/gt-num', ['exports', 'ember'], function (exports, _ember) {

	function gt(params) {
		return params[0] > params[1];
	}
	exports['default'] = _ember['default'].Helper.helper(gt);
});
define('client/helpers/not-b', ['exports', 'ember'], function (exports, _ember) {

	function not(params) {
		return !params[0];
	}
	exports['default'] = _ember['default'].Helper.helper(not);
});
define('client/helpers/one-way-select/contains', ['exports', 'ember-one-way-controls/helpers/one-way-select/contains'], function (exports, _emberOneWayControlsHelpersOneWaySelectContains) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsHelpersOneWaySelectContains['default'];
    }
  });
  Object.defineProperty(exports, 'contains', {
    enumerable: true,
    get: function get() {
      return _emberOneWayControlsHelpersOneWaySelectContains.contains;
    }
  });
});
define('client/helpers/or-b', ['exports', 'ember'], function (exports, _ember) {

	function or(params) {
		for (var i = 0; i < params.length; i++) {
			if (params[i]) return true;
		}
		return false;
	}

	exports['default'] = _ember['default'].Helper.helper(or);
});
define('client/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _emberInflectorLibHelpersPluralize) {
  exports['default'] = _emberInflectorLibHelpersPluralize['default'];
});
define('client/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _emberInflectorLibHelpersSingularize) {
  exports['default'] = _emberInflectorLibHelpersSingularize['default'];
});
define('client/helpers/starts-with', ['exports', 'ember'], function (exports, _ember) {
	exports.startwith = startwith;

	function startwith(params) {
		return params[0].indexOf(params[1]) === 0;
	}

	exports['default'] = _ember['default'].Helper.helper(startwith);
});
define('client/helpers/t', ['exports', 'ember-i18n/helper'], function (exports, _emberI18nHelper) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberI18nHelper['default'];
    }
  });
});
define("client/helpers/to-ascii", ["exports", "ember"], function (exports, _ember) {
	exports.toAscii = toAscii;

	function toAscii(params) {
		var str = params;
		if (_ember["default"].$.isArray(params)) {
			str = params[0];
		}
		if (str) {
			return str.replace(/[őóöÖŐÓ]/g, "o").replace(/[üúűÜÚŰ]/g, "u").replace(/[áÁ]/g, "a").replace(/[éÉ]/g, "e").replace(/[Íí]/g, "i").replace(/[?! #'\"\s\\\/]/g, "-");
		} else {
			return 'unknown';
		}
	}

	exports["default"] = _ember["default"].Helper.helper(toAscii);
});
define('client/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'client/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _clientConfigEnvironment) {
  var _config$APP = _clientConfigEnvironment['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(name, version)
  };
});
define('client/initializers/container-debug-adapter', ['exports', 'ember-resolver/container-debug-adapter'], function (exports, _emberResolverContainerDebugAdapter) {
  exports['default'] = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _emberResolverContainerDebugAdapter['default']);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('client/initializers/data-adapter', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `data-adapter` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'data-adapter',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('client/initializers/ember-cli-mirage', ['exports', 'ember-cli-mirage/utils/read-modules', 'client/config/environment', 'client/mirage/config', 'ember-cli-mirage/server', 'lodash/assign'], function (exports, _emberCliMirageUtilsReadModules, _clientConfigEnvironment, _clientMirageConfig, _emberCliMirageServer, _lodashAssign) {
  exports.startMirage = startMirage;
  exports['default'] = {
    name: 'ember-cli-mirage',
    initialize: function initialize(application) {
      if (arguments.length > 1) {
        // Ember < 2.1
        var container = arguments[0],
            application = arguments[1];
      }

      if (_shouldUseMirage(_clientConfigEnvironment['default'].environment, _clientConfigEnvironment['default']['ember-cli-mirage'])) {
        startMirage(_clientConfigEnvironment['default']);
      }
    }
  };

  function startMirage() {
    var env = arguments.length <= 0 || arguments[0] === undefined ? _clientConfigEnvironment['default'] : arguments[0];

    var environment = env.environment;
    var modules = (0, _emberCliMirageUtilsReadModules['default'])(env.modulePrefix);
    var options = (0, _lodashAssign['default'])(modules, { environment: environment, baseConfig: _clientMirageConfig['default'], testConfig: _clientMirageConfig.testConfig });

    return new _emberCliMirageServer['default'](options);
  }

  function _shouldUseMirage(env, addonConfig) {
    var userDeclaredEnabled = typeof addonConfig.enabled !== 'undefined';
    var defaultEnabled = _defaultEnabled(env, addonConfig);

    return userDeclaredEnabled ? addonConfig.enabled : defaultEnabled;
  }

  /*
    Returns a boolean specifying the default behavior for whether
    to initialize Mirage.
  */
  function _defaultEnabled(env, addonConfig) {
    var usingInDev = env === 'development' && !addonConfig.usingProxy;
    var usingInTest = env === 'test';

    return usingInDev || usingInTest;
  }
});
define('client/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data/-private/core'], function (exports, _emberDataSetupContainer, _emberDataPrivateCore) {

  /*
  
    This code initializes Ember-Data onto an Ember application.
  
    If an Ember.js developer defines a subclass of DS.Store on their application,
    as `App.StoreService` (or via a module system that resolves to `service:store`)
    this code will automatically instantiate it and make it available on the
    router.
  
    Additionally, after an application's controllers have been injected, they will
    each have the store made available to them.
  
    For example, imagine an Ember.js application with the following classes:
  
    App.StoreService = DS.Store.extend({
      adapter: 'custom'
    });
  
    App.PostsController = Ember.Controller.extend({
      // ...
    });
  
    When the application is initialized, `App.ApplicationStore` will automatically be
    instantiated, and the instance of `App.PostsController` will have its `store`
    property set to that instance.
  
    Note that this code will only be run if the `ember-application` package is
    loaded. If Ember Data is being used in an environment other than a
    typical application (e.g., node.js where only `ember-runtime` is available),
    this code will be ignored.
  */

  exports['default'] = {
    name: 'ember-data',
    initialize: _emberDataSetupContainer['default']
  };
});
define('client/initializers/ember-i18n', ['exports', 'ember-i18n/initializers/ember-i18n'], function (exports, _emberI18nInitializersEmberI18n) {
  exports['default'] = _emberI18nInitializersEmberI18n['default'];
});
define('client/initializers/export-application-global', ['exports', 'ember', 'client/config/environment'], function (exports, _ember, _clientConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_clientConfigEnvironment['default'].exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _clientConfigEnvironment['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember['default'].String.classify(_clientConfigEnvironment['default'].modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('client/initializers/injectStore', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `injectStore` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'injectStore',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('client/initializers/loader', ['exports'], function (exports) {
    exports.initialize = initialize;

    function initialize(application) {
        application.inject('route', 'loader', 'service:loader');
        application.inject('controller', 'loader', 'service:loader');
        application.inject('component', 'loader', 'service:loader');
    }

    exports['default'] = {
        name: 'loader',
        initialize: initialize
    };
});
define('client/initializers/session', ['exports'], function (exports) {
  exports.initialize = initialize;

  function initialize(application) {
    application.inject('route', 'session', 'service:session');
    application.inject('controller', 'session', 'service:session');
    application.inject('component', 'session', 'service:session');
    application.inject('adapter', 'session', 'service:session');
  }

  exports['default'] = {
    name: 'session',
    initialize: initialize
  };
});
define('client/initializers/store', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `store` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'store',
    after: 'ember-data',
    initialize: function initialize() {}
  };
});
define('client/initializers/transforms', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `transforms` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'transforms',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('client/initializers/uncountable', ['exports', 'ember'], function (exports, _ember) {
	exports.initialize = initialize;

	function initialize() /* application */{
		_ember['default'].Inflector.inflector.uncountable('company');
		_ember['default'].Inflector.inflector.uncountable('level');
		_ember['default'].Inflector.inflector.uncountable('building');
		_ember['default'].Inflector.inflector.uncountable('seat');
		_ember['default'].Inflector.inflector.uncountable('reservation');
		_ember['default'].Inflector.inflector.uncountable('user');
		_ember['default'].Inflector.inflector.uncountable('langtext');
	}

	exports['default'] = {
		name: 'uncountable',
		initialize: initialize
	};
});
define("client/instance-initializers/ember-data", ["exports", "ember-data/-private/instance-initializers/initialize-store-service"], function (exports, _emberDataPrivateInstanceInitializersInitializeStoreService) {
  exports["default"] = {
    name: "ember-data",
    initialize: _emberDataPrivateInstanceInitializersInitializeStoreService["default"]
  };
});
define('client/instance-initializers/ember-i18n', ['exports', 'ember-i18n/instance-initializers/ember-i18n'], function (exports, _emberI18nInstanceInitializersEmberI18n) {
  exports['default'] = _emberI18nInstanceInitializersEmberI18n['default'];
});
define('client/instance-initializers/language', ['exports', 'ember'], function (exports, _ember) {
    exports.initialize = initialize;

    function initialize(appInstance) {
        var i18n = appInstance.lookup('service:i18n');
        var modal = appInstance.lookup('service:modal');
        window.xappc.i18n = i18n;

        //appInstance.deferReadiness();
        _ember['default'].$.ajaxSetup({
            async: false
        });
        _ember['default'].$.getJSON("/common/langtext", function (langtext) {
            for (var i = 0; i < langtext.length; i++) {
                var t = {};
                t[langtext[i]['type'] + '.' + langtext[i]['code']] = langtext[i]['text'];
                i18n.addTranslations(langtext[i]['language'], t);
            }
        });
        _ember['default'].Logger.info('INIT Language DONE');
        _ember['default'].$.ajaxSetup({
            async: true
        });
        //appInstance.advanceReadiness();
    }

    exports['default'] = {
        name: 'language',
        initialize: initialize
    };
});
define('client/instance-initializers/session', ['exports', 'ember'], function (exports, _ember) {
  exports.initialize = initialize;

  function initialize(appInstance) {
    var store = appInstance.lookup('service:store');
    var modal = appInstance.lookup('service:modal');

    var session = appInstance.lookup('service:session');
    window.xappc.session = session;
    window.xappc.appInstance = appInstance;
    store.findAll('session').then(function (sessioRecords) {
      if (sessioRecords.get('length') === 0) {
        // request new session
        window.xappc.getData('/api/token', false, 'POST', true, false, {}, function (data) {
          if (data.access_token) {
            (function () {

              var sessionInfo = store.createRecord('session', {});
              window.xappc.session.updateSessionModel(data, sessionInfo);

              sessionInfo.save().then(function () /*status*/{

                window.xappc.session.setup(sessionInfo);
                /** fingerprint check
                Ember.run.later(function(){
                new Fingerprint2().get(function(fingerprint){
                  App.getData('/ping',true,'POST',false,false,{1:fingerprint},function(fp) {
                      // update session 
                      var oldToken=sessionInfo.get('token');
                      if(oldToken!==fp.access_token){
                        modal.openInfoModal({header:App.locX('/token/old_found_header'), text:App.locX('/token/old_found_text'),
                            action:function(){
                              App.session.updateSessionModel(fp).then(function(){
                                App.reload();      
                              });
                        }});
                      }
                  });
                });              
                },2000);
                */
              });
            })();
          }
        });
      } else {
          window.xappc.session.setup(sessioRecords.get('firstObject'));
          window.xappc.getData('/api/ping', true, 'POST', false, false, {}, function (data) {
            if (data !== "OK") {
              window.localStorage.clear();
              window.xappc.reload();
            }
          }, function (status) {
            if (parseInt(status.status) === 403) {
              // token not found or expired
              _ember['default'].Logger.debug('token expired request new');
              window.localStorage.clear();
              window.xappc.reload();
            }
          });
        }
    });
  }

  exports['default'] = {
    name: 'create-session',
    initialize: initialize
  };
});
define('client/locales/en/translations', ['exports'], function (exports) {
  exports['default'] = {

    'button': {
      'ok': 'OK'
    },
    'register': 'Register',
    'signin': 'Sign in',
    'reserv': 'Reservation',
    'buildings': 'Buildings',
    'levels': 'Levels',

    'user.followers.title.one': 'One Follower',
    'user.followers.title.other': 'All {{count}} Followers'

  };
});
define('client/mirage/config', ['exports'], function (exports) {
  exports['default'] = function () {

    // These comments are here to help you get started. Feel free to delete them.

    /*
      Config (with defaults).
       Note: these only affect routes defined *after* them!
    */

    // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
    // this.namespace = '';    // make this `/api`, for example, if your API is namespaced
    this.timing = 200; // delay for each request, automatically set to 0 during testing

    /*
      Shorthand cheatsheet:
       this.get('/posts');
      this.post('/posts');
      this.get('/posts/:id');
      this.put('/posts/:id'); // or this.patch
      this.del('/posts/:id');
       http://www.ember-cli-mirage.com/docs/v0.2.x/shorthands/
    */

    this.passthrough('/common/langtext', '/api/ping', '/api/token', '/error-notification', '/api/profile/setup', '/api/login', '/api/common/check/email', '/api/signup', '/api/forgot');

    this.namespace = '/api';
    this.get('/japi/level/:id', function (schema, request) {
      return schema.level.find(request.param.id);
    });
    this.get('/japi/building/:id', function (schema, request) {
      return schema.building.find(request.param.id);
    });
    this.get('/japi/company', function (schema, request) {
      return schema.company.all();
    });

    this.get('/japi/company/:id', function (schema, request) {
      return schema.company.find(request.params.id);
    });
  };
});
define('client/mirage/factories/building', ['exports', 'ember-cli-mirage'], function (exports, _emberCliMirage) {
  exports['default'] = _emberCliMirage.Factory.extend({
    name: function name(i) {
      return 'Building ' + i;
    },
    city: 'Budapest',
    address: function address(i) {
      return 'Teszt utca ' + i;
    }
  });
});
define('client/mirage/factories/company', ['exports', 'ember-cli-mirage'], function (exports, _emberCliMirage) {
  exports['default'] = _emberCliMirage.Factory.extend({});
});
define('client/mirage/factories/level', ['exports', 'ember-cli-mirage'], function (exports, _emberCliMirage) {
  exports['default'] = _emberCliMirage.Factory.extend({
    name: function name(i) {
      return 'Level ' + i;
    }
  });
});
define('client/mirage/models/building', ['exports', 'ember-cli-mirage', 'ember'], function (exports, _emberCliMirage, _ember) {
	exports['default'] = _emberCliMirage.Model.extend({
		company: (0, _emberCliMirage.belongsTo)()
	});

	_ember['default'].Inflector.inflector.uncountable('building');
});
define('client/mirage/models/company', ['exports', 'ember-cli-mirage', 'ember'], function (exports, _emberCliMirage, _ember) {
	exports['default'] = _emberCliMirage.Model.extend({
		building: (0, _emberCliMirage.hasMany)()
	});

	_ember['default'].Inflector.inflector.uncountable('company');
});
define('client/mirage/models/level', ['exports', 'ember-cli-mirage', 'ember'], function (exports, _emberCliMirage, _ember) {
	exports['default'] = _emberCliMirage.Model.extend({
		building: (0, _emberCliMirage.belongsTo)()
	});

	_ember['default'].Inflector.inflector.uncountable('level');
});
define('client/mirage/models/reservation', ['exports', 'ember-cli-mirage', 'ember'], function (exports, _emberCliMirage, _ember) {
  exports['default'] = _emberCliMirage.Model.extend({});

  _ember['default'].Inflector.inflector.uncountable('reservation');
});
define('client/mirage/models/seat', ['exports', 'ember-cli-mirage', 'ember'], function (exports, _emberCliMirage, _ember) {
  exports['default'] = _emberCliMirage.Model.extend({});

  _ember['default'].Inflector.inflector.uncountable('seat');
});
define('client/mirage/models/user', ['exports', 'ember-cli-mirage', 'ember'], function (exports, _emberCliMirage, _ember) {
  exports['default'] = _emberCliMirage.Model.extend({});

  _ember['default'].Inflector.inflector.uncountable('user');
});
define('client/mirage/scenarios/default', ['exports'], function (exports) {
		exports['default'] = function (server) {

				/*
      Seed your development database using your factories.
      This data will not be loaded in your tests.
       Make sure to define a factory for each model you want to create.
    */

				var company = server.create('company', { name: 'Dorsum Zrt.', img: 'http://www.dorsum.eu/wp-content/uploads/2016/03/Dorsum_logo_2016-300x77.png' });
				server.create('company', { name: 'T-systems', img: 'http://www.t-systems.hu/static/sw/g/logo.png' });
				server.create('company', { name: 'Balabit', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Balabit_logo_01.svg/330px-Balabit_logo_01.svg.png' });

				//server.createList('building', 10);
				var building = server.create('building', { company: company });
				server.createList('level', 4, { building: building });

				building = server.create('building', { company: company });
				server.createList('level', 1, { building: building });

				building = server.create('building');
				server.createList('level', 2, { building: building });

				building = server.create('building');
				server.createList('level', 1, { building: building });
		};
});
define('client/mirage/serializers/application', ['exports', 'ember-cli-mirage'], function (exports, _emberCliMirage) {
  exports['default'] = _emberCliMirage.JSONAPISerializer.extend({});
});
define('client/models/building', ['exports', 'ember-data'], function (exports, _emberData) {
	exports['default'] = _emberData['default'].Model.extend({
		name: _emberData['default'].attr('string'),
		address: _emberData['default'].attr('string'),
		city: _emberData['default'].attr('string'),
		company: _emberData['default'].belongsTo('company'),
		img: _emberData['default'].attr('string'),
		level: _emberData['default'].hasMany('level')
	});
});
define('client/models/company', ['exports', 'ember-data'], function (exports, _emberData) {
	exports['default'] = _emberData['default'].Model.extend({
		name: _emberData['default'].attr('string'),
		img: _emberData['default'].attr('string'),
		building: _emberData['default'].hasMany('building')
	});
});
define('client/models/langtext', ['exports', 'ember-data', 'ember'], function (exports, _emberData, _ember) {

	var LangtextModel = _emberData['default'].Model.extend({
		type: _emberData['default'].attr('string'),
		code: _emberData['default'].attr('string'),
		language: _emberData['default'].attr('string'),
		text: _emberData['default'].attr('string'),

		stringRepr: (function () {
			var text = this.get('text');
			if (!text) return 'unknown';
			if (text.length > 20) {
				text = text.substring(0, 19);
			}
			return this.get('type') + '/' + this.get('code') + ':' + text;
		}).property('type', 'text'),
		editables: function editables() {
			return ['type', 'code', 'language', 'text'];
		},
		copy: function copy() {
			var copy = {};
			this.eachAttribute(function (name, meta) {
				if (meta.name !== 'id') {
					copy[name] = this.get(meta.name);
				}
			}, this);
			return copy;
		}
	});
	exports['default'] = LangtextModel;
});
define('client/models/level', ['exports', 'ember-data'], function (exports, _emberData) {
	exports['default'] = _emberData['default'].Model.extend({
		name: _emberData['default'].attr('string'),
		building: _emberData['default'].belongsTo('building'),
		seat: _emberData['default'].hasMany('seat')
	});
});
define('client/models/reservation', ['exports', 'ember-data'], function (exports, _emberData) {
	exports['default'] = _emberData['default'].Model.extend({
		seat: _emberData['default'].belongsTo('seat'),
		user: _emberData['default'].attr('number'),
		createDt: _emberData['default'].attr('date')
	});
});
define('client/models/seat', ['exports', 'ember-data'], function (exports, _emberData) {
	exports['default'] = _emberData['default'].Model.extend({
		level: _emberData['default'].belongsTo('level'),
		name: _emberData['default'].attr('string'),
		img_x: _emberData['default'].attr('number'),
		img_y: _emberData['default'].attr('number'),
		capacity: _emberData['default'].attr('number'),
		createDt: _emberData['default'].attr('date')

	});
});
define('client/models/session', ['exports', 'ember', 'ember-data'], function (exports, _ember, _emberData) {
	var SessionModel = _emberData['default'].Model.extend({
		token: _emberData['default'].attr('string'),
		old_token: _emberData['default'].attr('string'),
		scope: _emberData['default'].attr('string'),
		username: _emberData['default'].attr('string'),
		login: _emberData['default'].attr('string'),
		userid: _emberData['default'].attr('string'),
		image: _emberData['default'].attr('boolean'),
		createDt: _emberData['default'].attr('date'),
		modifyDt: _emberData['default'].attr('datetime'),
		prevLogin: _emberData['default'].attr('date'),
		language: _emberData['default'].attr('string'),
		hash: _emberData['default'].attr('string'),
		old_hash: _emberData['default'].attr('string'),

		version: _ember['default'].computed('modifyDt', function () {
			if (!_ember['default'].isEmpty(this.get('modifyDt'))) {
				return this.get('modifyDt').format('YYMDHms');
			}
			return 1;
		}),
		isAdmin: _ember['default'].computed('scope', function () {
			if (!this.get('scope')) return false;
			return this.get('scope').indexOf("ROLE_ADMIN") >= 0;
		}),
		isCustomer: _ember['default'].computed('scope', function () {
			if (!this.get('scope')) return false;
			return this.get('scope').indexOf("ROLE_CUSTOMER") >= 0;
		}),
		isRegistered: _ember['default'].computed('scope', function () {
			if (!this.get('scope')) return false;
			return this.get('scope').indexOf("ROLE_REGISTERED") >= 0;
		})
	});
	exports['default'] = SessionModel;
});
define('client/models/user', ['exports', 'ember', 'ember-data', 'client/app', 'ember-cp-validations'], function (exports, _ember, _emberData, _clientApp, _emberCpValidations) {
  var i18n = window.xappc.i18n;
  var Validations = (0, _emberCpValidations.buildValidations)({
    name: [(0, _emberCpValidations.validator)('presence', { presence: true, message: 'aasasd ' }), (0, _emberCpValidations.validator)('length', { min: 4, max: 255 })],
    //login: [validator('unique-login', {debounce: 500}), validator('format', { regex: /^[a-zA-Z0-9]{4,32}$/, message: i18n.t('signup.nickname_error'), allowBlank:true})],
    email: [(0, _emberCpValidations.validator)('presence', { presence: true, message: ' ' }), (0, _emberCpValidations.validator)('unique-email', { debounce: 500 }), (0, _emberCpValidations.validator)('format', { type: 'email' })],
    password: [(0, _emberCpValidations.validator)('presence', true), (0, _emberCpValidations.validator)('length', { min: 6, max: 16 })],
    password2: [(0, _emberCpValidations.validator)('presence', { presence: true, message: ' ' }), (0, _emberCpValidations.validator)('confirmation', {
      on: 'password',
      description: 'Passwords'
    })]
  });
  var User = _emberData['default'].Model.extend(Validations, {
    name: _emberData['default'].attr('string'),
    //login: DS.attr('string'),	
    hash: _emberData['default'].attr('string'),
    email: _emberData['default'].attr('string'),
    password: _emberData['default'].attr('string'),
    password2: _emberData['default'].attr('string')
  });
  _ember['default'].Inflector.inflector.uncountable('user');
  exports['default'] = User;
});
define("client/pods/admin/language/controller", ["exports", "client/app", "ember"], function (exports, _clientApp, _ember) {
	var ObservableField = _ember["default"].Object.extend({
		fieldName: null,
		fieldValue: null,
		meta: null
	});

	exports["default"] = _ember["default"].Controller.extend({
		instance: null,
		objectList: null,
		modelName: null,
		mode: 'list', // list, insert, update, delete
		isError: null,
		isCompleted: false,

		instanceFields: {},
		i18n: _ember["default"].inject.service(),

		/** 
  * Builds up an object which at the end contains all model fields configuration
  * the editor form will be buildt based on this configuration.
  */
		fields: (function () {
			var c = this;
			if (this.get('instance') && !this.get('instanceFields')[this.get('modelName')] && this.get('instance').editables) {
				if (this.get('instance').editables) {
					var editableFields = this.get('instance').editables().map(function (fName) {
						var displayType = 'text';
						var type = _ember["default"].get(c.store.modelFor(c.get('modelName')), 'attributes').get(fName).type;
						if (type === 'number') {
							displayType = 'number';
						}
						_ember["default"].Logger.info('type:' + type + ' displayType:' + displayType);
						var f = ObservableField.create({
							fieldName: fName,
							meta: c.store.modelFor(c.get('modelName')),
							fieldValue: c.get('instance').getF(fName, type),
							displayType: displayType,
							isTextarea: fName === 'text'
						});
						c.addObserver('instance', f, function (sender, key, value, rev) {
							if (sender.get('instance') !== null) {
								f.set('fieldValue', sender.get('instance').getF(f.get('fieldName'), type));
							}
						});
						f.addObserver('fieldValue', f, function (sender, key, value, rev) {
							c.get('instance').setF(this.fieldName, this.fieldValue, type);
						});
						return f;
					});
					this.get('instanceFields')[this.get('modelName')] = editableFields;
				}
			}
			return this.get('instanceFields')[this.get('modelName')];
		}).property('modelName', 'mode'),

		isEditMode: (function () {
			return this.get('mode') === 'insert' || this.get('mode') === 'delete' || this.get('mode') === 'update';
		}).property('mode'),
		message: (function () {
			if (!this.get('modelName')) {
				return null;
			}

			if (this.get('isCompleted')) {
				return this.get('i18n').t('admin.' + this.get('mode') + '_completed');
			}
			if (this.get('isError')) {
				return this.get('i18n').t('admin.' + this.get('mode') + '_error', { modelName: this.get('modelName') });
			}
			return this.get('i18n').t('admin.' + this.get('mode') + '_of_', { modelName: this.get('modelName') });
		}).property('modelName', 'mode', 'isError', 'isCompleted'),

		initVariable: function initVariable() {
			this.set('isError', false);
			this.set('isCompleted', false);
			this.set('instance', null);
		},
		saveSuccess: function saveSuccess(status) {
			this.set('isError', false);
			this.set('isCompleted', true);
			// fade effect
			_ember["default"].run.later(this, function () {
				this.initVariable();
				this.set('mode', 'list');
			}, 1000);
		},
		saveError: function saveError(status) {
			_ember["default"].Logger.error(status.stack);
			this.set('isError', true);
			this.set('isCompleted', false);
		},

		actions: {
			listItems: function listItems(modelName) {
				var objectList = this.store.findAll(modelName);
				if (this.get('instance') !== null && this.get('instance').get('isDirty')) {
					this.get('instance').rollback();
				}
				this.set('isError', false);
				this.set('instance', null);
				this.set('isCompleted', false);
				this.set('objectList', objectList);
				this.set('modelName', modelName);
				this.set('mode', 'list');
				return false;
			},
			loadInstance: function loadInstance(id) {
				var c = this;
				this.store.find(this.get('modelName'), id).then(function (data) {
					c.initVariable();
					c.set('instance', data);
					c.set('mode', 'update');
				});
				return false;
			},
			initNew: function initNew() {
				var modelObject = this.store.createRecord(this.get('modelName'), {});
				this.initVariable();
				this.set('instance', modelObject);
				this.set('mode', 'insert');
				return false;
			},
			remove: function remove() {
				var cc = this;
				this.set('mode', 'delete');
				this.get('instance').destroyRecord().then(function (status) {
					return cc.saveSuccess(status);
				})["catch"](function (status) {
					return cc.saveError(status);
				});
			},
			commit: function commit() {
				var cc = this;
				this.get('instance').save().then(function (status) {
					return cc.saveSuccess(status);
				})["catch"](function (status) {
					return cc.saveError(status);
				});
				return false;
			},
			copyasnew: function copyasnew() {
				var instance = this.get('instance');
				var c = instance.copy();
				var modelObject = this.store.createRecord(this.get('modelName'), c);
				this.initVariable();
				this.set('instance', modelObject);
				this.set('mode', 'insert');
				return false;
			}
		}
	});
});
define("client/pods/admin/language/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "OX1vMLwn", "block": "{\"statements\":[[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"static-attr\",\"class\",\"waves-effect waves-light btn\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"listItems\",\"langtext\"],[[\"on\"],[\"click\"]]],[\"flush-element\"],[\"text\",\"List\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"form\",[]],[\"static-attr\",\"name\",\"input\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"commit\"],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"message\"]]],null,6],[\"block\",[\"if\"],[[\"get\",[\"isEditMode\"]]],null,4],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"objectList\"]]],null,0],[\"close-element\"],[\"text\",\"\\n\\n\\n\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"m4 s12 col\"],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"static-attr\",\"class\",\"close\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"loadInstance\",[\"get\",[\"o\",\"id\"]]],[[\"on\"],[\"click\"]]],[\"flush-element\"],[\"open-element\",\"small\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"o\",\"stringRepr\"]],false],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"o\"]},{\"statements\":[[\"text\",\"\\t\"],[\"append\",[\"helper\",[\"input\"],[[\"helper\",[\"-input-type\"],[[\"get\",[\"f\",\"displayType\"]]],null]],[[\"value\",\"type\"],[[\"get\",[\"f\",\"fieldValue\"]],[\"get\",[\"f\",\"displayType\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\t\"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"rows\",\"value\"],[\"7\",[\"get\",[\"f\",\"fieldValue\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"append\",[\"helper\",[\"log\"],[[\"get\",[\"f\",\"meta\"]]],null],false],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"l12 col\"],[\"flush-element\"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"name\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"f\",\"fieldName\"]],false],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"f\",\"isTextarea\"]]],null,2,1],[\"text\",\"\\t\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"f\"]},{\"statements\":[[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"fields\"]]],null,3],[\"text\",\"\\n \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"l12 col\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"dynamic-attr\",\"disabled\",[\"unknown\",[\"isCompleted\"]],null],[\"dynamic-attr\",\"class\",[\"concat\",[\"right button \",[\"helper\",[\"if\"],[[\"get\",[\"isCompleted\"]],\"disabled\"],null]]]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"remove\"]],[\"flush-element\"],[\"text\",\"×\"],[\"append\",[\"helper\",[\"t\"],[\"button.delete\"],null],false],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"sumbit\"],[\"dynamic-attr\",\"disabled\",[\"unknown\",[\"isCompleted\"]],null],[\"dynamic-attr\",\"class\",[\"concat\",[\"left button \",[\"helper\",[\"if\"],[[\"get\",[\"isCompleted\"]],\"disabled\"],null]]]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"commit\"]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"button.save\"],null],false],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"sumbit\"],[\"dynamic-attr\",\"disabled\",[\"unknown\",[\"isCompleted\"]],null],[\"dynamic-attr\",\"class\",[\"concat\",[\"left button \",[\"helper\",[\"if\"],[[\"get\",[\"isCompleted\"]],\"disabled\"],null]]]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"copyasnew\"]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"button.copyasnew\"],null],false],[\"close-element\"],[\"text\",\"\\n\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"l12 col\"],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"static-attr\",\"class\",\"button\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"initNew\"],[[\"on\"],[\"click\"]]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"button.new_record\"],null],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"l12 col\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"data-alert\",\"\"],[\"dynamic-attr\",\"class\",[\"concat\",[\"alert-box breadcrumb blue-text \",[\"helper\",[\"if\"],[[\"get\",[\"isError\"]],\"warning\"],null],\" \",[\"helper\",[\"if\"],[[\"get\",[\"isCompleted\"]],\"success-fade-out\"],null]]]],[\"flush-element\"],[\"append\",[\"unknown\",[\"message\"]],false],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"unless\"],[[\"get\",[\"isEditMode\"]]],null,5]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/admin/language/template.hbs" } });
});
define("client/pods/admin/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "XjnjS81u", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"regionData l12\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"inline-list\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\\t\\t\"],[\"block\",[\"link-to\"],[\"admin.language\"],[[\"class\"],[\"waves-effect waves-light btn\"]],0],[\"text\",\"\\n\\t\\t\"],[\"comment\",\"a href=\\\"#\\\" {{action \\\"listItems\\\" \\\"useracc\\\" on=\\\"click\\\"}} class=\\\"waves-effect waves-light btn\\\">User</a\"],[\"text\",\"\\n\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"append\",[\"unknown\",[\"outlet\"]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"Language\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/admin/template.hbs" } });
});
define('client/pods/application/controller', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Controller.extend({
        loading: _ember['default'].computed.readOnly('loader.loading'),
        appstate: _ember['default'].inject.service(),
        session: _ember['default'].inject.service(),
        avatarUrl: _ember['default'].computed.readOnly('session.avatarUrl'),
        username: _ember['default'].computed.readOnly('session.username'),
        isLoggedIn: _ember['default'].computed.readOnly('session.isLoggedIn'),
        modal: _ember['default'].inject.service(),

        showModal: _ember['default'].computed.alias('modal.showModal'),
        modalName: _ember['default'].computed.readOnly('modal.modalName'),
        modalModel: _ember['default'].computed.readOnly('modal.modalModel'),

        actions: {
            closeModal: function closeModal() {
                this.set('showModal', false);
            }
        }
    });
});
define('client/pods/application/route', ['exports', 'ember', 'client/app'], function (exports, _ember, _clientApp) {
  exports['default'] = _ember['default'].Route.extend({
    actions: {
      loading: function loading(transition /*, originRoute*/) {
        this.get('loader').startLoadProcess(transition.promise);
        return true;
      }
    }
  });
});
define("client/pods/application/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "RRRPbvt+", "block": "{\"statements\":[[\"block\",[\"app-view\"],null,null,15],[\"block\",[\"if\"],[[\"get\",[\"loading\"]]],null,1],[\"block\",[\"if\"],[[\"get\",[\"showModal\"]]],null,0]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"comment\",\" modal \"],[\"text\",\"\\n\"],[\"append\",[\"helper\",[\"component\"],[[\"get\",[\"modalName\"]]],[[\"model\",\"closeModal\"],[[\"get\",[\"modalModel\"]],\"closeModal\"]]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"loader\"],[\"static-attr\",\"style\",\"position:fixed;top:0px;left:0px;width:100%;height:100%;background:rgba(255, 255, 255, 0.3);z-index:10000\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"position:absolute;top:8px;width:100%;text-align:center;\"],[\"static-attr\",\"class\",\"hide-on-med-and-down\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"preloader-wrapper small active\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"spinner-layer spinner-blue-only\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"circle-clipper left\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"gap-patch\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"circle-clipper right\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"append\",[\"helper\",[\"t\"],[\"bottom.cookie_policy\"],null],false]],\"locals\":[]},{\"statements\":[[\"append\",[\"helper\",[\"t\"],[\"bottom.privacy\"],null],false]],\"locals\":[]},{\"statements\":[[\"append\",[\"helper\",[\"t\"],[\"bottom.terms\"],null],false]],\"locals\":[]},{\"statements\":[[\"append\",[\"helper\",[\"t\"],[\"button.signup\"],null],false]],\"locals\":[]},{\"statements\":[[\"append\",[\"helper\",[\"t\"],[\"header.signin\"],null],false]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"profile\"],null,6],[\"close-element\"],[\"text\",\"        \\n\"]],\"locals\":[]},{\"statements\":[[\"append\",[\"helper\",[\"t\"],[\"menu.profile\"],null],false],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"profileimgmob\"],[\"dynamic-attr\",\"style\",[\"concat\",[\"background-image:url(\",[\"unknown\",[\"avatarUrl\"]],\");\"]]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"close-element\"]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"li\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\"q-menu-profile \",[\"helper\",[\"if\"],[[\"helper\",[\"starts-with\"],[[\"get\",[\"currentPath\"]],\"profile\"],null],\"active\"],null]]]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"profile\"],null,8],[\"close-element\"],[\"text\",\"      \\n\"]],\"locals\":[]},{\"statements\":[[\"append\",[\"helper\",[\"t\"],[\"header.signin\"],null],false]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"profile\"],null,10],[\"close-element\"],[\"text\",\"        \\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"style\",\"float:left\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"append\",[\"unknown\",[\"username\"]],false],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"profileimg\"],[\"dynamic-attr\",\"style\",[\"concat\",[\"background-image:url(\",[\"unknown\",[\"avatarUrl\"]],\");\"]]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"li\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\"q-menu-profile \",[\"helper\",[\"if\"],[[\"helper\",[\"starts-with\"],[[\"get\",[\"currentPath\"]],\"profile\"],null],\"active\"],null]]]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"profile\"],null,12],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"img\",[]],[\"static-attr\",\"src\",\"/assets/images/placc_logo1.png\"],[\"static-attr\",\"data-pin-nopin\",\"true\"],[\"static-attr\",\"style\",\"padding-top:5px\"],[\"flush-element\"],[\"close-element\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"header\",[]],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"nav\",[]],[\"static-attr\",\"role\",\"navigation\"],[\"static-attr\",\"id\",\"navigation\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"nav-wrapper container\"],[\"flush-element\"],[\"block\",[\"link-to\"],[\"index\"],[[\"class\"],[\"brand-logo\"]],14],[\"text\",\"\\n      \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"right hide-on-med-and-down\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"isLoggedIn\"]]],null,13,11],[\"text\",\"      \"],[\"close-element\"],[\"text\",\"\\n\\n      \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"id\",\"slide-out\"],[\"static-attr\",\"class\",\"side-nav\"],[\"static-attr\",\"style\",\"z-index:1000\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"comment\",\"li>{{!link-to 'Popular' 'filter' 'default' 'popular'}}</li\"],[\"text\",\"   \\n\"],[\"block\",[\"if\"],[[\"get\",[\"isLoggedIn\"]]],null,9,7],[\"text\",\"        \\n        \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\" \"],[\"close-element\"],[\"text\",\"   \\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\"preloader-wrapper small active hide-on-large-only \",[\"helper\",[\"unless\"],[[\"get\",[\"loading\"]],\"hide\"],null]]]],[\"static-attr\",\"style\",\"top:8px;position:relative;\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"spinner-layer spinner-blue-only\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"circle-clipper left\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"gap-patch\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"circle-clipper right\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"circle\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"static-attr\",\"data-activates\",\"slide-out\"],[\"dynamic-attr\",\"class\",[\"concat\",[\"button-collapse \",[\"helper\",[\"if\"],[[\"get\",[\"loading\"]],\"hide\"],null]]]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"material-icons\"],[\"flush-element\"],[\"text\",\"menu\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"comment\",\"div class=\\\"q-categories container\\\">\\n        <ul>\\n        <li>Your</li>\\n        <li>Politics</li>\\n\\t\\t<li>Lifestyle</li>\\n\\t\\t<li>Funny</li>\\n      </ul>\\n\\t</div\"],[\"text\",\"\\n\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"main\",[]],[\"static-attr\",\"id\",\"main\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"footer\",[]],[\"static-attr\",\"class\",\"page-footer\"],[\"static-attr\",\"id\",\"footer\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col m6 s12\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Bio\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"bottom.bio\"],null],false],[\"close-element\"],[\"text\",\"\\n          \"],[\"block\",[\"link-to\"],[\"profile.signup\"],[[\"class\"],[\"waves-effect waves-light btn accent-btn white-text\"]],5],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col m6 s12\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Regulations\"],[\"close-element\"],[\"text\",\"        \\n          \"],[\"open-element\",\"ul\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"terms\"],null,4],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"privacy\"],null,3],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"cpolicy\"],null,2],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"footer-copyright\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n      @ 2017 myplacc.hu\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/application/template.hbs" } });
});
define('client/pods/building/route', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Route.extend({
		model: function model(params) {
			return this.get('store').findRecord('building', params.building_id);
		}
	});
});
define("client/pods/building/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "sZx0bvnH", "block": "{\"statements\":[[\"block\",[\"page-view\"],null,[[\"scrollToTop\"],[true]],2],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"append\",[\"helper\",[\"t\"],[\"button.open\"],null],false]],\"locals\":[]},{\"statements\":[[\"text\",\"\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"ember-view card question-card\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-image\"],[\"dynamic-attr\",\"style\",[\"concat\",[\"background-image:url('\",[\"helper\",[\"if\"],[[\"get\",[\"level\",\"img\"]],[\"get\",[\"level\",\"img\"]],\"/assets/images/building/level.JPG\"],null],\"');\"]]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"card-title question-title\"],[\"static-attr\",\"style\",\"display: block;padding:16px 24px\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"level\",\"name\"]],false],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-action\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"block\",[\"link-to\"],[\"level\",[\"get\",[\"level\",\"id\"]]],null,0],[\"text\",\"\\n\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"level\"]},{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"section no-pad-bot\"],[\"static-attr\",\"id\",\"index-banner\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col s12 m7\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"blockquote\",[]],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"h4\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"model\",\"name\"]],false],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"model\",\"address\"]],false],[\"text\",\", \"],[\"append\",[\"unknown\",[\"model\",\"city\"]],false],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"date-picker\"],null,[[\"label\"],[[\"helper\",[\"t\"],[\"g.target_date\"],null]]]],false],[\"close-element\"],[\"text\",\"\\n    \\t\\t\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"model\",\"level\"]]],null,1],[\"text\",\"\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col s12 m5\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"toc-wrapper\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\"],[\"append\",[\"unknown\",[\"post-question\"]],false],[\"text\",\"\\t\\t\\t\\t\\n\"],[\"text\",\"\\t\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\t\\t\\t\\t\\t\\n\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/building/template.hbs" } });
});
define('client/pods/company/route', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Route.extend({
		model: function model(params) {
			return this.get('store').findRecord('company', params.company_id);
		}
	});
});
define("client/pods/company/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "Lee1Hzr0", "block": "{\"statements\":[[\"block\",[\"page-view\"],null,[[\"scrollToTop\"],[true]],2],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"append\",[\"helper\",[\"t\"],[\"button.levels\"],null],false]],\"locals\":[]},{\"statements\":[[\"text\",\"\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"ember-view card question-card\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-image\"],[\"dynamic-attr\",\"style\",[\"concat\",[\"background-image:url('\",[\"unknown\",[\"building\",\"img\"]],\"');\"]]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"card-title question-title\"],[\"static-attr\",\"style\",\"display: block;padding: 0.7em;\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"building\",\"name\"]],false],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-action\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"block\",[\"link-to\"],[\"building\",[\"get\",[\"building\",\"id\"]]],null,0],[\"text\",\"\\n\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"building\"]},{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"section no-pad-bot\"],[\"static-attr\",\"id\",\"index-banner\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col s12 m7\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"blockquote\",[]],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"h4\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"model\",\"name\"]],false],[\"close-element\"],[\"text\",\"\\n    \\t\\t\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"model\",\"building\"]]],null,1],[\"text\",\"\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col s12 m5\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"toc-wrapper\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\"],[\"append\",[\"unknown\",[\"post-question\"]],false],[\"text\",\"\\t\\t\\t\\t\\n\"],[\"text\",\"\\t\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\t\\t\\t\\t\\t\\n\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/company/template.hbs" } });
});
define("client/pods/components/company-card/component", ["exports", "ember"], function (exports, _ember) {
	exports["default"] = _ember["default"].Component.extend({
		tagName: "",
		company: null
	});
});
define("client/pods/components/company-card/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "7pCMjiPS", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-content\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"img\",[]],[\"dynamic-attr\",\"src\",[\"concat\",[[\"unknown\",[\"company\",\"img\"]]]]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"company\",\"name\"]],false],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-action\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"helper\",[\"gt-num\"],[[\"get\",[\"company\",\"building\",\"length\"]],0],null]],null,1],[\"text\",\"  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"append\",[\"helper\",[\"t\"],[\"button.buildings\"],null],false]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"block\",[\"link-to\"],[\"company\",[\"get\",[\"company\",\"id\"]]],null,0],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/components/company-card/template.hbs" } });
});
define("client/pods/components/company-list/component", ["exports", "ember", "client/app"], function (exports, _ember, _clientApp) {
	exports["default"] = _ember["default"].Component.extend({
		tagName: "",
		noResultText: window.xappc.i18n.t('list.no_item'),
		enableEditLink: false,
		enableNoItemLink: true,
		actions: {
			infinityLoad: function infinityLoad() {
				this.sendAction('infinityLoad');
			}
		}

	});
});
define("client/pods/components/company-list/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "OECdEPX6", "block": "{\"statements\":[[\"block\",[\"each\"],[[\"get\",[\"companyList\"]]],null,0]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"append\",[\"helper\",[\"company-card\"],null,[[\"company\"],[[\"get\",[\"company\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[\"company\"]}],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/components/company-list/template.hbs" } });
});
define('client/pods/components/date-picker/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    didInsertElement: function didInsertElement() {
      this.$('.datepicker').pickadate({
        selectMonths: false, // Creates a dropdown to control month
        selectYears: 1 // Creates a dropdown of 15 years to control year
      });
    }
  });
});
define("client/pods/components/date-picker/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "1Pu+VGsU", "block": "{\"statements\":[[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"dateselector\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"label\"]],false],[\"close-element\"],[\"open-element\",\"input\",[]],[\"static-attr\",\"name\",\"dateselector\"],[\"static-attr\",\"type\",\"date\"],[\"static-attr\",\"class\",\"datepicker\"],[\"flush-element\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/components/date-picker/template.hbs" } });
});
define('client/pods/components/header-profile-box/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({});
});
define("client/pods/components/header-profile-box/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "CwckETNp", "block": "{\"statements\":[[\"yield\",\"default\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[\"default\"],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/components/header-profile-box/template.hbs" } });
});
define("client/pods/components/info-modal/component", ["exports", "ember"], function (exports, _ember) {
	exports["default"] = _ember["default"].Component.extend({
		options: {
			dismissible: false, // Modal can be dismissed by clicking outside of the modal
			opacity: 0.5, // Opacity of modal background
			inDuration: 300, // Transition in duration
			outDuration: 300, // Transition out duration
			ready: null, // Callback for Modal open
			complete: null },
		// Callback for Modal close
		didInsertElement: function didInsertElement() {
			var self = this;
			_ember["default"].run.scheduleOnce('afterRender', this, function () {
				self.$("#infoModal").modal(self.get('options'));
				self.$("#infoModal").modal('open');
			});
		},
		actions: {
			close: function close() {
				this.$("#infoModal").modal('close');
				var c = this;
				_ember["default"].run.later(function () {
					c.sendAction('closeModal');
					if (c.get('model.action')) {
						c.get('model.action').call();
					}
				}, 300);
			}
		}
	});
});
define("client/pods/components/info-modal/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "Bir1kmGn", "block": "{\"statements\":[[\"text\",\" \"],[\"comment\",\" Modal Structure \"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"infoModal\"],[\"static-attr\",\"class\",\"modal\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-content\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"model\",\"header\"]],true],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"model\",\"text\"]],true],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-footer\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#!\"],[\"static-attr\",\"class\",\" modal-action modal-close waves-effect waves-green btn-flat\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"close\"]],[\"flush-element\"],[\"text\",\"OK\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/components/info-modal/template.hbs" } });
});
define('client/pods/components/post-question/component', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Component.extend({
		tagName: ''
	});
});
define("client/pods/components/post-question/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "QfWS54vV", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card hide-on-small-only\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-image\"],[\"static-attr\",\"style\",\"background-image:url('/assets/images/q1.jpg');height:180px\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"card-title white-text\"],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"index.need_help\"],null],false],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-content\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"index.need_help_short\"],null],false],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-action\"],[\"static-attr\",\"style\",\"padding-top:0\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"static-attr\",\"class\",\"waves-effect waves-light btn accent-btn white-text\"],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"button.how_to_use\"],null],false],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/components/post-question/template.hbs" } });
});
define('client/pods/components/profile-card/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({});
});
define("client/pods/components/profile-card/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "PwUaup8I", "block": "{\"statements\":[[\"yield\",\"default\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[\"default\"],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/components/profile-card/template.hbs" } });
});
define('client/pods/components/q-input/component', ['exports', 'client/components/one-way-input', 'ember'], function (exports, _clientComponentsOneWayInput, _ember) {
	exports['default'] = _clientComponentsOneWayInput['default'].extend({
		classNameBindings: ['isValid:valid', 'isInvalid:invalid'],
		isInvalid: _ember['default'].computed('changed', 'isValid', function () {
			return this.get('changed') && !this.get('isValid');
		}),
		isValid: false,
		changed: false,
		_handleChangeEvent: function _handleChangeEvent() {
			this._super();
			_ember['default'].Logger.info('input changed: isValid' + this.get('isValid') + ' changed:' + this.get('changed'));
			this.set('changed', true);
		}
	});
});
define("client/pods/components/q-input/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "GFRfjMDq", "block": "{\"statements\":[[\"yield\",\"default\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[\"default\"],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/components/q-input/template.hbs" } });
});
define('client/pods/components/q-signup/component', ['exports', 'ember', 'client/app', 'ember-cp-validations'], function (exports, _ember, _clientApp, _emberCpValidations) {

    var Validations = (0, _emberCpValidations.buildValidations)({
        oldPassword: [(0, _emberCpValidations.validator)('presence', true), (0, _emberCpValidations.validator)('length', {
            min: 4,
            max: 16
        })],
        newPassword: [(0, _emberCpValidations.validator)('presence', true), (0, _emberCpValidations.validator)('length', {
            min: 4,
            max: 16
        })],
        forgotemail: [(0, _emberCpValidations.validator)('presence', {
            presence: true,
            message: ' '
        }), (0, _emberCpValidations.validator)('format', {
            type: 'email'
        })],
        newPassword2: [(0, _emberCpValidations.validator)('presence', {
            presence: true,
            message: ' '
        }), (0, _emberCpValidations.validator)('confirmation', {
            on: 'newPassword',
            description: 'Passwords'
        })]
    });

    exports['default'] = _ember['default'].Component.extend(Validations, {
        user: null,
        oldPassword: null,
        newPassword: null,
        newPassword2: null,
        forgotemail: null,
        privacy: false,
        modify: false,
        i18n: _ember['default'].inject.service(),

        saveDisabled: _ember['default'].computed('user.name', 'user.email', 'user.password', 'user.password2', 'privacy', function () {
            if (this.get('modify')) {

                var valid = this.get('user.validations.attrs.name.isValid') || false;
                valid = valid && (this.get('user.validations.attrs.login.isValid') || false);
                return !valid;
            } else {
                return !this.get('user.validations.isValid') || !this.get('privacy');
            }
        }),
        changePasswordEnabled: _ember['default'].computed('user.password', 'modify', function () {
            return this.get('user.password') && this.get('modify');
        }),
        forgotDisabled: _ember['default'].computed('forgotemail', 'newPassword', 'newPassword2', function () {
            var valid = this.get('validations.attrs.newPassword.isValid') && this.get('validations.attrs.newPassword2.isValid') && this.get('validations.attrs.forgotemail.isValid');
            return !valid;
        }),
        title: _ember['default'].computed('midify', function () {
            if (this.get('modify')) {
                return this.get('i18n').t('profile.modify');
            } else {
                return this.get('i18n').t('profile.signup');
            }
        }),
        actions: {
            sendData: function sendData() {
                var action = this.attrs['save'];
                if (action) {
                    action(this.get('user'));
                }
            },
            sendPassword: function sendPassword() {
                var self = this;
                var action = this.attrs['changePassword'];
                if (action) {
                    action(this.get('oldPassword'), this.get('newPassword'));
                }
            },
            forgotPassword: function forgotPassword() {
                var self = this;
                var action = this.attrs['forgotPassword'];
                if (action) {
                    action(this.get('forgotemail'), this.get('newPassword'));
                }
            },
            privacyCheck: function privacyCheck() {
                this.set('privacy', !this.get('privacy'));
            }

        }
    });
});
define("client/pods/components/q-signup/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "E8jir88X", "block": "{\"statements\":[[\"open-element\",\"form\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"sendData\"],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"forgotpassword\"]]],null,7,6],[\"close-element\"],[\"text\",\"\\n\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-content\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"card-title\"],[\"flush-element\"],[\"text\",\"Change password\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-field col s12\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"append\",[\"helper\",[\"q-input\"],null,[[\"type\",\"class\",\"id\",\"isValid\",\"value\",\"update\"],[\"password\",\"\",\"oldPassword\",[\"helper\",[\"get\"],[[\"helper\",[\"get\"],[[\"get\",[null,\"validations\",\"attrs\"]],\"oldPassword\"],null],\"isValid\"],null],[\"get\",[\"oldPassword\"]],[\"helper\",[\"action\"],[[\"get\",[null]],[\"helper\",[\"mut\"],[[\"get\",[\"oldPassword\"]]],null]],null]]]],false],[\"text\",\"\\n  \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"oldPassword\"],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"signup.old_password\"],null],false],[\"text\",\" \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-field col s12\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"append\",[\"helper\",[\"q-input\"],null,[[\"type\",\"class\",\"id\",\"isValid\",\"value\",\"update\"],[\"password\",\"\",\"newPassword\",[\"helper\",[\"get\"],[[\"helper\",[\"get\"],[[\"get\",[null,\"validations\",\"attrs\"]],\"newPassword\"],null],\"isValid\"],null],[\"get\",[\"newPassword\"]],[\"helper\",[\"action\"],[[\"get\",[null]],[\"helper\",[\"mut\"],[[\"get\",[\"newPassword\"]]],null]],null]]]],false],[\"text\",\"\\n  \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"newPassword\"],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"signup.new_password\"],null],false],[\"text\",\" \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-field col s12\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"append\",[\"helper\",[\"q-input\"],null,[[\"type\",\"class\",\"id\",\"isValid\",\"value\",\"update\"],[\"password\",\"\",\"newPassword2\",[\"helper\",[\"get\"],[[\"helper\",[\"get\"],[[\"get\",[null,\"validations\",\"attrs\"]],\"newPassword2\"],null],\"isValid\"],null],[\"get\",[\"newPassword2\"]],[\"helper\",[\"action\"],[[\"get\",[null]],[\"helper\",[\"mut\"],[[\"get\",[\"newPassword2\"]]],null]],null]]]],false],[\"text\",\"\\n  \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"newPassword2\"],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"signup.new_confirm_password\"],null],false],[\"text\",\" \"],[\"append\",[\"helper\",[\"get\"],[[\"helper\",[\"get\"],[[\"get\",[null,\"validations\",\"attrs\"]],\"newPassword2\"],null],\"message\"],null],false],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-action\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn waves-effect waves-light\"],[\"static-attr\",\"type\",\"button\"],[\"dynamic-attr\",\"disabled\",[\"helper\",[\"get\"],[[\"get\",[null,\"validations\"]],\"isInvalid\"],null],null],[\"static-attr\",\"name\",\"action\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"sendPassword\"]],[\"flush-element\"],[\"text\",\"Change password\"],[\"close-element\"],[\"text\",\" \\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn waves-effect waves-light\"],[\"static-attr\",\"type\",\"submit\"],[\"dynamic-attr\",\"disabled\",[\"unknown\",[\"saveDisabled\"]],null],[\"static-attr\",\"name\",\"action\"],[\"flush-element\"],[\"text\",\"Save\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn waves-effect waves-light\"],[\"static-attr\",\"type\",\"button\"],[\"dynamic-attr\",\"disabled\",[\"unknown\",[\"saveDisabled\"]],null],[\"static-attr\",\"name\",\"action\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"sendData\"]],[\"flush-element\"],[\"text\",\"Save\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-field col s12\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"append\",[\"helper\",[\"q-input\"],null,[[\"type\",\"class\",\"id\",\"disabled\",\"value\"],[\"text\",\"\",\"email\",true,[\"get\",[\"user\",\"email\"]]]]],false],[\"text\",\"\\n  \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"email\"],[\"dynamic-attr\",\"class\",[\"concat\",[[\"helper\",[\"if\"],[[\"get\",[\"user\",\"email\"]],\"active\"],null]]]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"signup.email\"],null],false],[\"text\",\" \"],[\"append\",[\"helper\",[\"get\"],[[\"helper\",[\"get\"],[[\"get\",[\"user\",\"validations\",\"attrs\"]],\"email\"],null],\"message\"],null],false],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"append\",[\"helper\",[\"t\"],[\"signup.privacy_check_link\"],null],false]],\"locals\":[]},{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-field col s12\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"append\",[\"helper\",[\"q-input\"],null,[[\"type\",\"class\",\"id\",\"isValid\",\"value\",\"update\"],[\"text\",\"\",\"email\",[\"helper\",[\"get\"],[[\"helper\",[\"get\"],[[\"get\",[\"user\",\"validations\",\"attrs\"]],\"email\"],null],\"isValid\"],null],[\"get\",[\"user\",\"email\"]],[\"helper\",[\"action\"],[[\"get\",[null]],[\"helper\",[\"mut\"],[[\"get\",[\"user\",\"email\"]]],null]],null]]]],false],[\"text\",\"\\n  \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"email\"],[\"dynamic-attr\",\"class\",[\"concat\",[[\"helper\",[\"if\"],[[\"get\",[\"user\",\"email\"]],\"active\"],null]]]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"signup.email\"],null],false],[\"text\",\" \"],[\"append\",[\"helper\",[\"get\"],[[\"helper\",[\"get\"],[[\"get\",[\"user\",\"validations\",\"attrs\"]],\"email\"],null],\"message\"],null],false],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-field col s12\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"append\",[\"helper\",[\"q-input\"],null,[[\"type\",\"class\",\"id\",\"isValid\",\"value\",\"update\"],[\"password\",\"\",\"password\",[\"helper\",[\"get\"],[[\"helper\",[\"get\"],[[\"get\",[\"user\",\"validations\",\"attrs\"]],\"password\"],null],\"isValid\"],null],[\"get\",[\"user\",\"password\"]],[\"helper\",[\"action\"],[[\"get\",[null]],[\"helper\",[\"mut\"],[[\"get\",[\"user\",\"password\"]]],null]],null]]]],false],[\"text\",\"\\n  \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"password\"],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"signup.password\"],null],false],[\"text\",\" \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-field col s12\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"append\",[\"helper\",[\"q-input\"],null,[[\"type\",\"class\",\"id\",\"isValid\",\"value\",\"update\"],[\"password\",\"\",\"password2\",[\"helper\",[\"get\"],[[\"helper\",[\"get\"],[[\"get\",[\"user\",\"validations\",\"attrs\"]],\"password2\"],null],\"isValid\"],null],[\"get\",[\"user\",\"password2\"]],[\"helper\",[\"action\"],[[\"get\",[null]],[\"helper\",[\"mut\"],[[\"get\",[\"user\",\"password2\"]]],null]],null]]]],false],[\"text\",\"\\n  \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"password2\"],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"signup.confirm_password\"],null],false],[\"text\",\" \"],[\"append\",[\"helper\",[\"get\"],[[\"helper\",[\"get\"],[[\"get\",[\"user\",\"validations\",\"attrs\"]],\"password2\"],null],\"message\"],null],false],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-field col s12\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"append\",[\"helper\",[\"one-way-checkbox\"],null,[[\"checked\",\"update\"],[[\"get\",[\"privacy\"]],[\"helper\",[\"action\"],[[\"get\",[null]],[\"helper\",[\"mut\"],[[\"get\",[\"privacy\"]]],null]],null]]]],false],[\"text\",\"\\n  \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"privacy\"],[\"static-attr\",\"style\",\"position:absolute\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"privacyCheck\"]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"signup.privacy_check\"],null],false],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"block\",[\"link-to\"],[\"privacy\"],null,4],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-content\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"card-title\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"title\"]],false],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-field col s12\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"name\"],[\"dynamic-attr\",\"class\",[\"concat\",[[\"helper\",[\"if\"],[[\"get\",[\"user\",\"name\"]],\"active\"],null]]]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"signup.name\"],null],false],[\"text\",\" \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"append\",[\"helper\",[\"q-input\"],null,[[\"value\",\"update\",\"class\",\"isValid\",\"id\"],[[\"get\",[\"user\",\"name\"]],[\"helper\",[\"action\"],[[\"get\",[null]],[\"helper\",[\"mut\"],[[\"get\",[\"user\",\"name\"]]],null]],null],\"\",[\"helper\",[\"get\"],[[\"helper\",[\"get\"],[[\"get\",[\"user\",\"validations\",\"attrs\"]],\"name\"],null],\"isValid\"],null],\"name\"]]],false],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"comment\",\"div class=\\\"input-field col s12\\\">\\n  <label for=\\\"login\\\" class=\\\"{{!if user.login 'active'}}\\\">{{t 'signup.nickname'}} {{v-get user 'login' 'message'}}</label>\\n{{!q-input value=user.login update=(action (mut user.login)) class=\\\"\\\" isValid=(v-get user 'login' 'isValid') id=\\\"login\\\"}}</div\"],[\"text\",\"\\n\"],[\"block\",[\"unless\"],[[\"get\",[\"modify\"]]],null,5,3],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-action\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"modify\"]]],null,2,1],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"changePasswordEnabled\"]]],null,0]],\"locals\":[]},{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-content\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"card-title\"],[\"flush-element\"],[\"text\",\"Change password\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-field col s12\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"append\",[\"helper\",[\"q-input\"],null,[[\"type\",\"class\",\"id\",\"isValid\",\"value\",\"update\"],[\"text\",\"\",\"email\",[\"helper\",[\"get\"],[[\"helper\",[\"get\"],[[\"get\",[null,\"validations\",\"attrs\"]],\"forgotemail\"],null],\"isValid\"],null],[\"get\",[\"forgotemail\"]],[\"helper\",[\"action\"],[[\"get\",[null]],[\"helper\",[\"mut\"],[[\"get\",[\"forgotemail\"]]],null]],null]]]],false],[\"text\",\"\\n  \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"email\"],[\"dynamic-attr\",\"class\",[\"concat\",[[\"helper\",[\"if\"],[[\"get\",[\"forgotemail\"]],\"active\"],null]]]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"signup.email\"],null],false],[\"text\",\" \"],[\"append\",[\"helper\",[\"get\"],[[\"helper\",[\"get\"],[[\"get\",[null,\"validations\",\"attrs\"]],\"forgotemail\"],null],\"message\"],null],false],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-field col s12\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"append\",[\"helper\",[\"q-input\"],null,[[\"type\",\"class\",\"id\",\"isValid\",\"value\",\"update\"],[\"password\",\"\",\"newPassword\",[\"helper\",[\"get\"],[[\"helper\",[\"get\"],[[\"get\",[null,\"validations\",\"attrs\"]],\"newPassword\"],null],\"isValid\"],null],[\"get\",[\"newPassword\"]],[\"helper\",[\"action\"],[[\"get\",[null]],[\"helper\",[\"mut\"],[[\"get\",[\"newPassword\"]]],null]],null]]]],false],[\"text\",\"\\n  \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"newPassword\"],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"signup.new_password\"],null],false],[\"text\",\" \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-field col s12\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"append\",[\"helper\",[\"q-input\"],null,[[\"type\",\"class\",\"id\",\"isValid\",\"value\",\"update\"],[\"password\",\"\",\"newPassword2\",[\"helper\",[\"get\"],[[\"helper\",[\"get\"],[[\"get\",[null,\"validations\",\"attrs\"]],\"newPassword2\"],null],\"isValid\"],null],[\"get\",[\"newPassword2\"]],[\"helper\",[\"action\"],[[\"get\",[null]],[\"helper\",[\"mut\"],[[\"get\",[\"newPassword2\"]]],null]],null]]]],false],[\"text\",\"\\n  \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"newPassword2\"],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"signup.new_confirm_password\"],null],false],[\"text\",\" \"],[\"append\",[\"helper\",[\"get\"],[[\"helper\",[\"get\"],[[\"get\",[null,\"validations\",\"attrs\"]],\"newPassword2\"],null],\"message\"],null],false],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-action\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn waves-effect waves-light\"],[\"static-attr\",\"type\",\"button\"],[\"dynamic-attr\",\"disabled\",[\"unknown\",[\"forgotDisabled\"]],null],[\"static-attr\",\"name\",\"action\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"forgotPassword\"]],[\"flush-element\"],[\"text\",\"Change password\"],[\"close-element\"],[\"text\",\" \\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/components/q-signup/template.hbs" } });
});
define('client/pods/components/wysiwyg-editor/component', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Component.extend({
		contentId: null,
		didInsertElement: function didInsertElement() {
			//Ember.$("#"+this.get('contentId')).trumbowyg();
		}
	});
});
define("client/pods/components/wysiwyg-editor/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "nfmMl1Ky", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"dynamic-attr\",\"id\",[\"concat\",[[\"unknown\",[\"contentId\"]]]]],[\"flush-element\"],[\"text\",\"\\n\"],[\"yield\",\"default\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[\"default\"],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/components/wysiwyg-editor/template.hbs" } });
});
define('client/pods/cpolicy/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define("client/pods/cpolicy/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "CFULTmGm", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"h4\",[]],[\"flush-element\"],[\"text\",\"Cookies\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"\\nTo make this site work properly, we sometimes place small data files called cookies on your device. Most big websites do this too.\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"\\nWhat are cookies?\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"\\nA cookie is a small text file that a website saves on your computer or mobile device when you visit the site. It enables the website to remember your actions and preferences (such as login browsing session, language and other display preferences) over a period of time, so you don’t have to keep re-entering them whenever you come back to the site or browse from one page to another.\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"\\nHow do we use cookies?\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"\\nWhen you first come to myplacc.hu we store a small identification code in you browser. This code will identify your browser (not person) and you will know what question you have already answered what are new for you. This cookie is helps us to provide you a better experience when you visit qumla.com. We are not able to provide give you a full user exprience without cookies.\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/cpolicy/template.hbs" } });
});
define('client/pods/index/controller', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller.extend({});
});
define('client/pods/index/route', ['exports', 'ember', 'client/utils/q-infinity-route', 'client/config/environment'], function (exports, _ember, _clientUtilsQInfinityRoute, _clientConfigEnvironment) {
	exports['default'] = _clientUtilsQInfinityRoute['default'].extend({
		appstate: _ember['default'].inject.service(),

		model: function model() {

			//var questionPromise=this.store.findAll('question');
			var companyPromise = this.infinityModel("company", { perPage: _clientConfigEnvironment['default'].APP.perPage, startingPage: 1, filter: {} });
			if (!this.get('appstate.isMobile')) {
				//latestQuestionPromise = this.store.query("question", { page:{limit:1,offset:1} , filter:{latest:true}});
			}

			return companyPromise;
		}
	});
});
define("client/pods/index/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "1Y6oYFP2", "block": "{\"statements\":[[\"block\",[\"page-view\"],null,[[\"scrollToTop\"],[true]],0]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"section no-pad-bot\"],[\"static-attr\",\"id\",\"index-banner\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col s12 m7\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"append\",[\"helper\",[\"company-list\"],null,[[\"companyList\",\"infinityLoad\"],[[\"get\",[\"model\"]],\"infinityLoad\"]]],false],[\"text\",\"\\n\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col s12 m5\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"toc-wrapper\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\"],[\"append\",[\"unknown\",[\"post-question\"]],false],[\"text\",\"\\t\\t\\t\\t\\n\"],[\"text\",\"\\t\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\t\\t\\t\\t\\t\\n\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/index/template.hbs" } });
});
define('client/pods/level/route', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Route.extend({
		model: function model(params) {
			return this.get('store').findRecord('level', params.level_id);
		}
	});
});
define("client/pods/level/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "/Vo2tGBq", "block": "{\"statements\":[[\"block\",[\"page-view\"],null,[[\"scrollToTop\"],[true]],1],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"    \\t\\t\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#!\"],[\"static-attr\",\"class\",\"collection-item\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"badge availability\"],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"g.free\"],null],false],[\"close-element\"],[\"append\",[\"unknown\",[\"seat\",\"name\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"seat\"]},{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"section no-pad-bot\"],[\"static-attr\",\"id\",\"index-banner\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col s12 m7\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"blockquote\",[]],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"h4\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"model\",\"name\"]],false],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"g.seats\"],[[\"count\"],[[\"get\",[\"model\",\"seat\",\"length\"]]]]],false],[\"close-element\"],[\"text\",\"\\n    \\t\\t\"],[\"close-element\"],[\"text\",\"\\n    \\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"collection\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"model\",\"seat\"]]],null,0],[\"text\",\"    \"],[\"comment\",\"a href=\\\"#!\\\" class=\\\"collection-item\\\"><span class=\\\"new badge\\\">4</span>Alan</a\"],[\"text\",\"\\n\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\\n\\t\\t\\t\\n\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col s12 m5\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"toc-wrapper\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\"],[\"append\",[\"unknown\",[\"post-question\"]],false],[\"text\",\"\\t\\t\\t\\t\\n\"],[\"text\",\"\\t\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\t\\t\\t\\t\\t\\n\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/level/template.hbs" } });
});
define('client/pods/privacy/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define("client/pods/privacy/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "enwPcwqz", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"section no-pad-bot\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"wysiwyg-editor\"],null,[[\"contentId\",\"class\"],[\"privacy\",\"container\"]],0],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"\\n\"],[\"open-element\",\"h4\",[]],[\"flush-element\"],[\"text\",\"\\nPrivacy Policy\\n\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\nMyPlacc, Inc (\\\"\"],[\"open-element\",\"b\",[]],[\"flush-element\"],[\"text\",\"MyPlacc\"],[\"close-element\"],[\"text\",\",\\\" \\\"\"],[\"open-element\",\"b\",[]],[\"flush-element\"],[\"text\",\"we\"],[\"close-element\"],[\"text\",\"\\\" or \\\"\"],[\"open-element\",\"b\",[]],[\"flush-element\"],[\"text\",\"us\"],[\"close-element\"],[\"text\",\"\\\") is committed to being a safe place for our users to anonymously share their questions. That’s why we place so much focus on protecting your privacy and personal information.\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"This Privacy Policy covers the MyPlacc website (\\\"\"],[\"open-element\",\"b\",[]],[\"flush-element\"],[\"text\",\"Site\"],[\"close-element\"],[\"text\",\"\\\") and any MyPlacc application or service (\\\"\"],[\"open-element\",\"b\",[]],[\"flush-element\"],[\"text\",\"Services\"],[\"close-element\"],[\"text\",\"\\\"). It explains how our Site or Services collect, use, protect, and disclose personal information, Usage data, and Message data (we define these last two terms below). Please note that we are not responsible for the privacy practices of, or content on, third party services or other properties to which our Site or the Services link, or into which our Services are embedded or incorporated (e.g., MyPlacc embeds).\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"h4\",[]],[\"flush-element\"],[\"text\",\"Information We Collect\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Personal Information and Anonymity\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"We collect very little information that could be used to identify you personally. A non-unique username is randomly assigned to you that you may change at any time. If you change your username, please be sure to create a username that doesn’t disclose any personally identifying information. If you decide to invite your friends to use the Services via our “invite friends” feature, you will also need to reveal your cell phone number to your friend when you send the invitation. No mobile number or email address is ever stored on our servers. \"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"Our goal is to provide you with a tool that allows you to express yourself while remaining anonymous to the community. However, please keep in mind that your questions will be publicly viewable, so if you want to preserve your anonymity you should not include any personal information in your questions. In addition, when you allow us to collect latitude and longitude location information from your device by enabling locations services, your general location (e.g., town) and proximity to other users when you post, will also be publicly viewable. Therefore, even if you do not include personal information in your questions, your use of the Services may still allow others, over time, to make a determination as to your identity based on the content of your questions as well as your general location. For instance, if you work in a small organization and post questions about your working experience, it is possible that at some point a co-worker will be able to identify you. This is part of the nature of the Services, and we encourage you to be careful and avoid including details that may be used by others to identify you.\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Usage Data\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"We automatically collect usage information. This doesn’t tell us who a user is, though. It just lets us collect information about how people access and use our Services. This collected information is called Usage Data. We gather it so we can get a better portrait of how our users are interacting with the Site and Services so that we can continue to improve the user experience over time.\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"Here are a few examples of Usage Data:\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"When you download and use our Services, we automatically collect information about the type of device you’re using, the operating system version on your device and your IP Address. Or if you’re using the Site, we automatically collect information about your operating system, web browser, Internet Service Provider (ISP), and your network-enabled machine’s Internet Protocol (IP) address, as well as the pages you view, and the time and length of your visit. This data helps us analyze trends and user behaviors, manage the site, and enhance or update our Services. In other words, it helps us give you a better experience by understanding and reacting to the ways that users interact with the Services and Site.\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"While you’re downloading or using our mobile applications or Services, we may ask for, access, or track location-based information such as device-provided latitude or longitude, if you have location services enabled for the application. One reason for doing this is to help you explore postings in your area or for us to determine how many postings come from a particular area. If you are using an Android device, our Services may continue to run in the background. In this instance, your device may also periodically send us location information. However, giving us permission to access or track any location-based data is absolutely voluntary. In fact, you may freely opt into or opt out of location-based portions of our Services at any time using the app- or device-level settings on iOS or the device-level settings on Android. However, please bear in mind that, even if you have disabled location services, we may still determine your city, state, and country location based on your IP address (but not your exact location).\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Cookies\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"Like many other websites, our Site uses cookies. These are small, removable data files that your web browser stores to help identify your computer and browser when you visit a website. They can also have the added benefit of speeding up your access to sites. We don’t use cookies to collect personal information. Instead, we use them to improve the quality of our Site and Services. Our Site is not designed to respond to “do not track” signals received from browsers.\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"Most web browsers are initially set up to accept cookies. You can reset your web browser to refuse all cookies or to let you know when a cookie is being sent.\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"Some of the Service Providers (we define this below) that we work with may use their own cookies in connection with the services they perform on our behalf. We don’t have access or control over these cookies. The use of cookies by these third parties isn’t covered by our Privacy Policy. You should review the applicable third party privacy policy for sites who link to our embed our content.\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"How We May Use Your Information\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"We use the information that we collect from you for internal purposes. This includes offering you access to the Site and Services, letting you know when we have new products or Services, and communicating with you in other ways.\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"We will not share your information except in the cases explained below.\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"How We May Disclose Your Information\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"MyPlacc is committed to the privacy and security of your information, including preserving your anonymity; however, there are a few cases when we will be unable to do so. Here are a few situations where we may disclose the information that we collect from you.\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"We respect the Law\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"This means that we may disclose information such as your created questions, IP address, and your location, if known, if we have a good faith belief it is necessary to comply with applicable laws, regulations, legal processes (such as a subpoena or court order) or enforceable governmental requests. If you want to learn more about how we do that, please review our Law Enforcement Response Guide.\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"We expect you to respect the Law as well\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"MyPlacc is not a place for criminals. You must not use the Site or Services to plan, incite, promote, or showcase any criminal act is strictly prohibited. This includes statements revealing plans or actions around human trafficking, sexual exploitation, or predation. These types of behaviors are against our mission, constitute a breach of our Terms of Service, and more importantly, are illegal. If you engage in any illegal activity we may be required, or choose to, share the information we may have about you with the appropriate authorities.\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"We don't want anybody to be harmed\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"MyPlacc is meant to be a safe place. There may be situations where we may need to disclose the information we may have about you for the greater good, such as if we see suicidal statements or statements that involve the intent to harm oneself or others, or learn information about missing children, or threats to the community. \"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"We may also share your information for technical reasons\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"From time to time, we may establish business relationships with other businesses but will only do so if we believe they are trustworthy. We carefully vet these relationships to confirm that these service providers have privacy practices that are consistent with ours. These service providers may include companies that provide us with services such as hosting and maintenance, customer relationship management, push notifications, and data storage and management.\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"style\",\"line-height: 1.5;\"],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"style\",\"line-height: 1.5;\"],[\"flush-element\"],[\"text\",\"We give service providers only the information that’s necessary for them to perform services on our behalf. What’s more, each service provider must agree to use security procedures and practices that are reasonable and appropriate for the information involved. This is another way that we work to protect your information from unauthorized access, use, or disclosure. Also, we prohibit our service providers from using your information in any manner that is not specified by us.\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"style\",\"line-height: 1.5;\"],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"style\",\"line-height: 1.5;\"],[\"flush-element\"],[\"text\",\"In addition, we may use and disclose certain Usage Data to third parties. This Usage Data doesn’t identify individual users. We use mobile analytics software to help us better understand how our Services work on your device. This software may only record information usage information, such as how often you use the application, the events that occur within the application, aggregated usage, performance data, and where the application was downloaded. But we do not link the information we store within the analytics software to any personally identifiable information you submit within the mobile app. This essentially only covers what you do, but not who does it. We may also partner with universities or other research institutions or scientists to use the limited information we have in anonymous, controlled research studies.\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"style\",\"line-height: 1.5;\"],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Affiliates and Corporate Transactions\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"style\",\"line-height: 1.5;\"],[\"flush-element\"],[\"text\",\"We may share the information that we collect from you with businesses that control, are controlled by, or are under common control with MyPlacc. This also means that if MyPlacc is merged, acquired, or sold, or in the event of a transfer of some or all of our assets, we may disclose or transfer such information in connection with that particular transaction.\\nInformation Security\\nMyPlacc is committed to protecting the security of your personal information and Message Data. This is why we employ security measures designed to protect your personal information from unauthorized access (for instance we encrypt private messages). Regardless of our efforts, however, no data transmission over the Internet or other network, including any of MyPlacc’s services, can be guaranteed to be 100% secure. We will do our part, but we can’t and don’t guarantee the security of any information you transmit on or through the Site or Services. Thus, any information you transmit is sent at your own risk.\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"h4\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"style\",\"font-size: 1.64rem; line-height: 25.256px;\"],[\"flush-element\"],[\"text\",\"Your information may be maintained outside of your jurisdiction\"],[\"close-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"style\",\"line-height: 1.5;\"],[\"flush-element\"],[\"text\",\"Please be advised that we process and store all information in Hungary or other countries where our service providers may be based. This may be important to you, as the laws of Hungary or such other countries may not be as protective of your personal information as the laws of your jurisdiction. \"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"style\",\"line-height: 1.5;\"],[\"flush-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Changes to the Privacy Policy\"],[\"close-element\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"style\",\"line-height: 1.5;\"],[\"flush-element\"],[\"text\",\"We may periodically change this Privacy Policy. If we decide to make material changes to this Privacy Policy, we’ll inform you here or by posting a prominent notice on the homepage of our Site. Any changes become effective when we post them on the Site. \"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/privacy/template.hbs" } });
});
define('client/pods/profile/controller', ['exports', 'ember', 'client/app'], function (exports, _ember, _clientApp) {
    exports['default'] = _ember['default'].Controller.extend({
        session: _ember['default'].inject.service(),
        avatarProfileUrl: _ember['default'].computed.readOnly('session.avatarProfileUrl'),
        username: _ember['default'].computed.readOnly('session.username'),
        login: _ember['default'].computed.readOnly('session.login'),
        displayName: _ember['default'].computed.readOnly('session.displayName'),
        user: _ember['default'].computed.alias('session.user'),
        isLoggedIn: _ember['default'].computed.readOnly('session.isLoggedIn'),
        modal: _ember['default'].inject.service(),
        loginname: null,
        loginpassword: null,
        uploadFile: null,
        uploadFileUrl: null,
        i18n: _ember['default'].inject.service(),

        actions: {
            loginAction: function loginAction() {
                var c = this;
                var loginPromisse = _ember['default'].$.ajax({
                    type: 'POST',
                    url: '/api/login',
                    cache: false,
                    data: {
                        login: this.get('loginname'),
                        grant_type: "client_credentials",
                        scope: "basic,qumla",
                        password: this.get('loginpassword')
                    },
                    success: function success(data) {
                        if (data.access_token) {
                            c.session.updateSessionModel(data);
                            /*
                            var reload=function(){
                                App.reload();
                            };
                            */
                            c.get('modal').openInfoModal({ header: c.get('i18n').t('login.success_header'), text: c.get('i18n').t('login.success_text') });
                        } else {
                            var self = this;
                            c.get('modal').openInfoModal({ header: c.get('i18n').t('login.usernotfound_header'), text: c.get('i18n').t('login.usernotfound_text') });
                        }
                    },
                    error: function error() {
                        c.get('modal').openInfoModal({ header: c.get('i18n').t('login.usernotfound_header'), text: c.get('i18n').t('login.usernotfound_text') });
                    }
                });
                this.get('loader').startLoadProcess(loginPromisse);
                return false;
            },
            googlelogin: function googlelogin() {
                var form = _ember['default'].$('#googlePost');
                form.submit();
                return false;
            },
            facebooklogin: function facebooklogin() {
                var form = _ember['default'].$('#facebookPost');
                form.submit();
                return false;
            },
            signout: function signout() {
                var p = this.get('session').restoreSession();
                if (p) {
                    p.then(function () {
                        _ember['default'].Logger.debug('session restored and user logged out');
                        window.xappc.reload();
                    });
                } else {
                    window.localStorage.clear();
                    window.xappc.reload();
                }
            },
            setUploadImage: function setUploadImage(file) {
                var self = this;

                if (this.get('uploadFile')) {
                    this.get('uploadFile').destroy();
                }
                this.set('uploadFile', file);

                file.read().then(function (url) {
                    self.set('uploadFileUrl', url);
                });
            },
            acceptPhoto: function acceptPhoto() {
                var self = this;
                if (this.get('uploadFile') != null) {
                    // upload image just in case if the selected is the image
                    this.get('modal').toast('Uploading image ...');
                    var uploadImagePromise = this.get('uploadFile').upload('/api/uploadprofileimage', { headers: { "Authorization": "Bearer " + this.get('session.token') } });
                    this.get('loader').startLoadProcess(uploadImagePromise);

                    uploadImagePromise.then(function (response) {
                        var t = window.xappc.i18n.get('t');
                        self.set('user.imagec', response.body.imagec);
                        self.set('user.image', true);

                        self.get('modal').toast(t('profile.image_uploaded'));
                        self.get('uploadFile').destroy();
                        self.set('uploadFileUrl', null);
                        self.get('uploadFile', null);
                    })['catch'](function () {
                        var t = window.xappc.i18n.get('t');
                        self.get('modal').toast(t('profile.image_upload_error'));
                    });
                }
            },
            cancelPhoto: function cancelPhoto() {
                this.get('uploadFile').destroy();
                this.set('uploadFileUrl', null);
                this.get('uploadFile', null);
            }

        }
    });
});
define('client/pods/profile/forgotpwchange/controller', ['exports', 'ember', 'client/app'], function (exports, _ember, _clientApp) {
    exports['default'] = _ember['default'].Controller.extend({
        session: _ember['default'].inject.service(),
        modal: _ember['default'].inject.service(),
        requestid: '',
        actions: {
            forgotPassword: function forgotPassword(email, newpPassword) {
                var reset = window.xappc.getData('/forgotchange', true, 'POST', true, false, {
                    email: email,
                    new_password: newpPassword,
                    requestid: this.get('requestid')
                }, null, null);

                var self = this;

                reset.then(function () {
                    self.get('modal').openInfoModal({ header: _clientApp['default'].locX('/profile/password_changed_header'), text: _clientApp['default'].locX('/profile/password_changed'), action: function action() {
                            self.transitionToRoute('profile.index');
                        } });
                }, function (cause) {
                    self.get('modal').openInfoModal({ header: _clientApp['default'].locX('/profile/password_change_error'), text: '' });
                });
                return reset;
            }
        }
    });
});
define('client/pods/profile/forgotpwchange/route', ['exports', 'ember', 'client/app'], function (exports, _ember, _clientApp) {
	exports['default'] = _ember['default'].Route.extend({
		model: function model(params) {
			return params;
		},

		setupController: function setupController(controller, model) {
			controller.set('requestid', model.requestid);
		}
	});
});
define("client/pods/profile/forgotpwchange/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "ycneMGoe", "block": "{\"statements\":[[\"append\",[\"helper\",[\"q-signup\"],null,[[\"user\",\"forgotPassword\",\"forgotpassword\"],[[\"get\",[\"model\"]],[\"helper\",[\"action\"],[[\"get\",[null]],\"forgotPassword\"],null],true]]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/profile/forgotpwchange/template.hbs" } });
});
define('client/pods/profile/forgotpwd/controller', ['exports', 'ember', 'ember-cp-validations', 'client/app'], function (exports, _ember, _emberCpValidations, _clientApp) {

	var Validations = (0, _emberCpValidations.buildValidations)({
		email: [(0, _emberCpValidations.validator)('presence', { presence: true, message: ' ' }), (0, _emberCpValidations.validator)('format', { type: 'email' })]
	});

	exports['default'] = _ember['default'].Controller.extend(Validations, {
		email: null,
		session: _ember['default'].inject.service(),
		modal: _ember['default'].inject.service(),

		actions: {
			sendResetPasswordEmail: function sendResetPasswordEmail() {
				var reset = window.xappc.getData('/api/forgot', true, 'POST', true, false, {
					email: this.get('email'),
					l: this.get('session.language')
				}, null, null);
				var c = this;
				this.get('loader').startLoadProcess(reset);
				reset.then(function () {
					c.get('modal').openInfoModal({ header: 'Password change request sent', text: _clientApp['default'].locX('/forgot/requestsent') });
					c.transitionToRoute('profile.index');
				}, function () {
					c.get('modal').openInfoModal({ header: 'Password change request error', text: _clientApp['default'].locX('/forgot/requestsent_error') });
				});
			}
		}
	});
});
define('client/pods/profile/forgotpwd/route', ['exports', 'ember', 'client/app'], function (exports, _ember, _clientApp) {
  exports['default'] = _ember['default'].Route.extend({});
});
define("client/pods/profile/forgotpwd/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "1x95sMey", "block": "{\"statements\":[[\"open-element\",\"form\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"sendResetPasswordEmail\"],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-content\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"card-title\"],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"forgot.title\"],null],false],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"forgot.text\"],null],false],[\"close-element\"],[\"text\",\"  \\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-field col s12\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"q-input\"],null,[[\"type\",\"class\",\"id\",\"isValid\",\"value\",\"update\"],[\"text\",\"\",\"email\",[\"helper\",[\"get\"],[[\"helper\",[\"get\"],[[\"get\",[null,\"validations\",\"attrs\"]],\"email\"],null],\"isValid\"],null],[\"get\",[\"email\"]],[\"helper\",[\"action\"],[[\"get\",[null]],[\"helper\",[\"mut\"],[[\"get\",[\"email\"]]],null]],null]]]],false],[\"text\",\"\\n      \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"email\"],[\"dynamic-attr\",\"class\",[\"concat\",[[\"helper\",[\"if\"],[[\"get\",[\"email\"]],\"active\"],null]]]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"signup.email\"],null],false],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-field col s12\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn waves-effect waves-light\"],[\"static-attr\",\"type\",\"submit\"],[\"dynamic-attr\",\"disabled\",[\"helper\",[\"get\"],[[\"get\",[null,\"validations\"]],\"isInvalid\"],null],null],[\"static-attr\",\"name\",\"action\"],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"forgot.change_request\"],null],false],[\"close-element\"],[\"text\",\" \\n    \"],[\"close-element\"],[\"text\",\"\\n \\n  \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/profile/forgotpwd/template.hbs" } });
});
define('client/pods/profile/index/controller', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller.extend({});
});
define('client/pods/profile/index/route', ['exports', 'ember', 'client/config/environment'], function (exports, _ember, _clientConfigEnvironment) {
  exports['default'] = _ember['default'].Route.extend({});
});
define("client/pods/profile/index/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "29a2NXgW", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card horizontal\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"comment\",\"div class=\\\"card-image\\\">\\n    <img src=\\\"/assets/images/card_bg.jpg\\\">\\n  </div\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-stacked\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-content\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"isLoggedIn\"]]],null,1,0],[\"text\",\"\\t\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"comment\",\"div class=\\\"card-action\\\">\\n      <a href=\\\"#\\\">This is a link</a>\\n    </div\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n           \\n\\n    \\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"\\tPlease login!\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\tHello \"],[\"append\",[\"unknown\",[\"username\"]],false],[\"text\",\"! Lets make some reservations! \\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/profile/index/template.hbs" } });
});
define('client/pods/profile/modify/controller', ['exports', 'ember', 'client/app'], function (exports, _ember, _clientApp) {
    exports['default'] = _ember['default'].Controller.extend({
        session: _ember['default'].inject.service(),
        modal: _ember['default'].inject.service(),
        actions: {
            modifyUserData: function modifyUserData(user) {
                var self = this;
                var loaderP = user.save();
                this.get('loader').startLoadProcess(loaderP);
                loaderP.then(function (data) {
                    self.transitionToRoute('profile.index');
                    self.get('modal').openInfoModal({ header: 'Modify ready', text: "Your data bas been modified." });
                })['catch'](function (result) {
                    _ember['default'].Logger.debug('signup error');
                    _ember['default'].Logger.debug(result);
                    self.get('modal').openInfoModal({ header: 'Modify error', text: "Sorry, we can't modify your data! Something went wrong: " + result });
                    _ember['default'].Logger.error(result);
                });
            },
            modifyPassword: function modifyPassword(oldPassword, newpPassword) {
                var reset = window.xappc.getData('/changepassword', true, 'POST', true, false, {
                    password: oldPassword,
                    new_password: oldPassword
                }, null, null);

                var self = this;

                reset.then(function () {
                    self.get('modal').openInfoModal({ header: 'Password changed', text: _clientApp['default'].locX('/profile/password_changed'), action: function action() {
                            self.transitionToRoute('profile.index');
                        } });
                }, function (cause) {
                    if (cause.responseText) {
                        self.get('modal').openInfoModal({ header: 'Change password error', text: _clientApp['default'].locX('/profile/' + cause.responseText) });
                    } else {
                        self.get('modal').openInfoModal({ header: 'Change password error', text: _clientApp['default'].locX('/profile/password_change_error') });
                    }
                });
                return reset;
            }
        }
    });
});
define('client/pods/profile/modify/route', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Route.extend({
		session: _ember['default'].inject.service(),
		model: function model(params, transition) {
			var userPromise = undefined;
			if (this.get('session.userid')) {
				userPromise = this.store.findRecord('user', this.get('session.userid'));
			} else {
				userPromise = this.store.findRecord('user', 0);
			}
			return userPromise;
		}
	});
});
define("client/pods/profile/modify/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "J9m4g/ca", "block": "{\"statements\":[[\"append\",[\"helper\",[\"q-signup\"],null,[[\"user\",\"save\",\"changePassword\",\"modify\"],[[\"get\",[\"model\"]],[\"helper\",[\"action\"],[[\"get\",[null]],\"modifyUserData\"],null],[\"helper\",[\"action\"],[[\"get\",[null]],\"modifyPassword\"],null],true]]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/profile/modify/template.hbs" } });
});
define('client/pods/profile/places/controller', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller.extend({});
});
define('client/pods/profile/places/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define("client/pods/profile/places/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "U5A+anjn", "block": "{\"statements\":[[\"text\",\"Places\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/profile/places/template.hbs" } });
});
define('client/pods/profile/route', ['exports', 'ember', 'client/app'], function (exports, _ember, _clientApp) {
	exports['default'] = _ember['default'].Route.extend({
		session: _ember['default'].inject.service(),
		model: function model() {
			var pageS = window.xappc.getData('/api/profile/setup', true, "GET", true, false, null, null, null);
			var userPromise = undefined;
			if (this.get('session.userid')) {
				userPromise = this.store.findRecord('user', this.get('session.userid'));
			}
			return _ember['default'].RSVP.hash({
				pageSetup: pageS,
				user: userPromise
			});
		},

		setupController: function setupController(controller, model) {
			controller.set('setup', model.pageSetup);
			this.get('session').set('user', model.user);
		}
	});
});
define('client/pods/profile/signup/controller', ['exports', 'ember', 'client/app'], function (exports, _ember, _clientApp) {
    exports['default'] = _ember['default'].Controller.extend({
        session: _ember['default'].inject.service(),
        modal: _ember['default'].inject.service(),
        actions: {
            saveUserData: function saveUserData(user) {
                var self = this;
                var loaderP = user.save();

                this.get('loader').startLoadProcess(loaderP);
                loaderP.then(function (data) {
                    self.transitionToRoute('profile.index');
                    self.get('modal').openInfoModal({ header: 'Registration confirmation',
                        text: "We've sent a confirmation email. Please check your mailbox and follow the instructions.",
                        action: function action() {
                            window.xappc.reload(true);
                        }
                    });
                })['catch'](function (result) {
                    _ember['default'].Logger.debug('signup error');
                    _ember['default'].Logger.debug(result);
                    self.get('modal').openInfoModal({ header: 'Sign up error', text: "We can't save your registration! " + result });
                    _ember['default'].Logger.error(result);
                });
            }
        }
    });
});
define('client/pods/profile/signup/route', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Route.extend({
		model: function model() {
			return this.store.createRecord('user', {});
		}
	});
});
define("client/pods/profile/signup/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "HDIybp5d", "block": "{\"statements\":[[\"append\",[\"helper\",[\"q-signup\"],null,[[\"user\",\"save\"],[[\"get\",[\"model\"]],[\"helper\",[\"action\"],[[\"get\",[null]],\"saveUserData\"],null]]]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/profile/signup/template.hbs" } });
});
define("client/pods/profile/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "j2ikXrwQ", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"section no-pad-bot\"],[\"static-attr\",\"id\",\"index-banner\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col s12 m5 push-m7\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\n\\t\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card registration\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"isLoggedIn\"]]],null,16],[\"text\",\"\\n\"],[\"block\",[\"unless\"],[[\"get\",[\"isLoggedIn\"]]],null,5,2],[\"text\",\"\\t\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col s12 m7 pull-m5\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"comment\",\"div class=\\\"q-link collection\\\">\\n\\t\\t\\t{{#link-to 'profile.index' class=\\\"collection-item\\\"}}{{t 'profile.reservations'}}{{/link-to}}\\n\\t\\t\\t{{#link-to 'profile.places' class=\\\"collection-item\\\"}}{{t 'profile.places'}} <span class=\\\"count badge\\\">2 </span>{{/link-to}}\\n\\t\\t\\t\\n\\t\\t\\t\\t</div\"],[\"text\",\"\\n\\t\\t\\t\"],[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\\n\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"append\",[\"helper\",[\"t\"],[\"profile.change_data\"],null],false]],\"locals\":[]},{\"statements\":[[\"text\",\"   \\t\\t\\t\\t\\t  \\t\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-text\"],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"material-icons\"],[\"flush-element\"],[\"text\",\"account_circle\"],[\"close-element\"],[\"text\",\" \"],[\"append\",[\"unknown\",[\"user\",\"name\"]],false],[\"close-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\t\\t\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-content\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"user\",\"name\"]]],null,1],[\"text\",\"    \\t\\t\\t\\t\\t\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-text\"],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"material-icons\"],[\"flush-element\"],[\"text\",\"contact_mail\"],[\"close-element\"],[\"text\",\" \"],[\"append\",[\"unknown\",[\"user\",\"email\"]],false],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-action\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\"],[\"block\",[\"link-to\"],[\"profile.modify\"],null,0],[\"text\",\"\\n\\t\\t\\t\\t\\t\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"static-attr\",\"class\",\"right\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"signout\"]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"profile.signout\"],null],false],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\\n\\t\\t\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"append\",[\"helper\",[\"t\"],[\"login.signup\"],null],false]],\"locals\":[]},{\"statements\":[[\"append\",[\"helper\",[\"t\"],[\"general.forgot_password\"],null],false]],\"locals\":[]},{\"statements\":[[\"text\",\"\\t\\t\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-content\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\\t\"],[\"open-element\",\"form\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"loginAction\"],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-field col s12\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\\t  \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"loginname\"],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"login.login\"],null],false],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\\t  \"],[\"append\",[\"helper\",[\"q-input\"],null,[[\"value\",\"class\",\"valid\",\"update\",\"id\"],[[\"get\",[\"loginname\"]],\"validate\",true,[\"helper\",[\"action\"],[[\"get\",[null]],[\"helper\",[\"mut\"],[[\"get\",[\"loginname\"]]],null]],null],\"loginname\"]]],false],[\"text\",\"\\n\\t\\t\\t\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-field col s12\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\\t  \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"loginpassword\"],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"login.password\"],null],false],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\\t  \"],[\"append\",[\"helper\",[\"q-input\"],null,[[\"type\",\"value\",\"isValid\",\"update\",\"id\"],[\"password\",[\"get\",[\"loginpassword\"]],true,[\"helper\",[\"action\"],[[\"get\",[null]],[\"helper\",[\"mut\"],[[\"get\",[\"loginpassword\"]]],null]],null],\"loginpassword\"]]],false],[\"text\",\"\\n\\t\\t\\t\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col s6\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\\t\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn waves-effect waves-light\"],[\"static-attr\",\"type\",\"submit\"],[\"static-attr\",\"name\",\"action\"],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"login.send_login\"],null],false],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\\t\"],[\"close-element\"],[\"text\",\" \\n\\t\\t\\t\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\n\\t\\t\\t\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"s6 col\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\\t    \"],[\"block\",[\"link-to\"],[\"profile.forgotpwd\"],null,4],[\"text\",\"\\n\\t\\t\\t\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\n\\t\\t\\t\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"s12 col padding-bottom foreign-login\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\\t\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"block\",[\"link-to\"],[\"profile.signup\"],[[\"class\"],[\"signup-link\"]],3],[\"text\",\"\\n\\t\\t\\t\\t\\t\\t\"],[\"close-element\"],[\"text\",\"  \\t\\t            \\t\\t    \\n\\t\\t\\t\\t\\n\\t\\t\\t\\t\\t\\t\"],[\"close-element\"],[\"text\",\" \\n\\t\\t\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\t\\t\\t\\t\\t\\n\\t\\t\\t\\t\\t\"],[\"comment\",\"div class=\\\"social-action\\\">\\n\\t\\t\\t\\t\\t<div>\\n\\t\\t\\t\\t\\t\\t<form method=\\\"post\\\" id=\\\"facebookPost\\\" action=\\\"/api/facebooklogin\\\">\\n\\t\\t\\t\\t\\t\\t<a href=\\\"#\\\" class=\\\"btn waves-effect waves-light facebook-button\\\" {{action 'facebooklogin'}}>{{t 'login.facebook'}}</a>\\n\\t\\t\\t\\t\\t\\t</form>\\n\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t\\t<div>\\n\\t\\t\\t\\t\\t\\t<form method=\\\"post\\\" id=\\\"googlePost\\\" action=\\\"/api/googlelogin\\\">\\n\\t\\t\\t\\t\\t\\t<a href=\\\"#\\\" class=\\\"btn waves-effect waves-light google-button\\\" {{action 'googlelogin'}}>{{t 'login.google'}}</a>\\n\\t\\t\\t\\t\\t\\t</form>\\n\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t\\t</div\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\t\\t\\t\\t\\t\\t    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"profileimg\"],[\"dynamic-attr\",\"style\",[\"concat\",[\"background-image:url(\",[\"unknown\",[\"avatarProfileUrl\"]],\");\"]]],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t        \\t\"],[\"close-element\"],[\"text\",\"\\t\\t\\t\\t\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\t\\t\\t\\t\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"profileimg\"],[\"dynamic-attr\",\"style\",[\"concat\",[\"background-image:url(\",[\"unknown\",[\"uploadFileUrl\"]],\");\"]]],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t        \\t\"],[\"close-element\"],[\"text\",\"\\t\\t\\t\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\t\\t\\t\\t\\t\\t\\t\\t          \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"id\",\"upload-image\"],[\"static-attr\",\"style\",\"font-size:12px;line-height:16px;color:#888;cursor: pointer;cursor:hand;\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\\t\\t\\t          \"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"material-icons\"],[\"static-attr\",\"style\",\"font-size:2em;line-height:16px;\"],[\"flush-element\"],[\"text\",\"add_a_photo\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\\t\\t\\t          \"],[\"open-element\",\"b\",[]],[\"flush-element\"],[\"text\",\"Click to upload (160x160 px)\"],[\"close-element\"],[\"close-element\"],[\"text\",\"  \\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"dropzone\",\"enabled\"]]],null,8]],\"locals\":[]},{\"statements\":[[\"text\",\"\\t\\t\\t\\t\\t\\t\\t\\t          Invalid\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\t\\t\\t\\t\\t\\t\\t\\t          Drop now\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"dropzone\",\"valid\"]]],null,11,10]],\"locals\":[]},{\"statements\":[[\"text\",\"\\t\\t\\t\\t\\t\\t\\t\\t      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"top:0px;position:absolute;width:100%;text-align:center;background-color:rgba(255,255,255,0.5);padding:1em\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"dropzone\",\"active\"]]],null,12,9],[\"text\",\"\\t\\t\\t\\t\\t\\t\\t\\t      \"],[\"close-element\"],[\"text\",\" \\n\"]],\"locals\":[\"queue\",\"dropzone\"]},{\"statements\":[[\"text\",\"\\n\"],[\"block\",[\"q-uploader\"],null,[[\"for-dropzone\",\"for\",\"url\",\"extensions\",\"multiple\",\"onfileadd\"],[\"upload-image\",\"upload-image\",\"uploadfile\",\"jpg jpeg png gif\",\"false\",\"setUploadImage\"]],13],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\t\\t\\t\\t\\t\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"top:0px;position:absolute;width:100%;text-align:center;background-color:rgba(255,255,255,0.5);padding:1em\"],[\"flush-element\"],[\"text\",\"\\n\\n\\t\\t\\t\\t\\t\\t\\t\\t\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"id\",\"upload-image\"],[\"static-attr\",\"class\",\"btn\"],[\"static-attr\",\"style\",\"padding:0 0.5em\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"acceptPhoto\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"material-icons\"],[\"static-attr\",\"style\",\"font-size:2em;line-height:16px;\"],[\"flush-element\"],[\"text\",\"done\"],[\"close-element\"],[\"close-element\"],[\"text\",\"  \\n\\t\\t\\t\\t\\t\\t\\t\\t\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"id\",\"upload-image\"],[\"static-attr\",\"class\",\"btn error\"],[\"static-attr\",\"style\",\"padding:0 0.5em; background-color:#CC0030\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"cancelPhoto\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"material-icons\"],[\"static-attr\",\"style\",\"font-size:2em;line-height:16px;\"],[\"flush-element\"],[\"text\",\"clear\"],[\"close-element\"],[\"close-element\"],[\"text\",\"  \\n\\n\\t\\t\\t\\t\\t\\t\\t\\t\"],[\"close-element\"],[\"text\",\" \\n\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\t\\t\\t\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"card-image\"],[\"static-attr\",\"style\",\"background-image:url('/assets/images/profile.jpg')\"],[\"dynamic-attr\",\"id\",[\"unknown\",[\"dropzone\",\"id\"]],null],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"uploadFileUrl\"]]],null,15,14],[\"block\",[\"if\"],[[\"get\",[\"uploadFileUrl\"]]],null,7,6],[\"text\",\"\\t\\t\\t\\t\\t\\t\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"card-title white-text\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"displayName\"]],false],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/profile/template.hbs" } });
});
define('client/pods/terms/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define("client/pods/terms/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "5vZaVbUg", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"h4\",[]],[\"flush-element\"],[\"text\",\"Terms of Use\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Updated 2017-02-10\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"We are committed to enable you, our users (\\\"\"],[\"open-element\",\"b\",[]],[\"flush-element\"],[\"text\",\"User(s)\"],[\"close-element\"],[\"text\",\"\\\" or \\\"\"],[\"open-element\",\"b\",[]],[\"flush-element\"],[\"text\",\"you\"],[\"close-element\"],[\"text\",\"\\\"), to request workplace reservations in our partner offices. This document states or refers to these rules and guidelines.\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"By using our Services, you are accepting these Terms, so please review them carefully before using our Services. If you do not agree with our Terms, then please do not use our Services. Your right to access and use our Services is conditioned upon acceptance of and compliance with these Terms, so if you do not consent and adhere to these Terms, you have no right to access or use our Services. These Terms of Service (\\\"\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"b\",[]],[\"flush-element\"],[\"text\",\"Terms\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"\\\") cover the MyPlacc website (\\\"\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"b\",[]],[\"flush-element\"],[\"text\",\"Site\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"\\\"). The Site and service are collectively referred to as the \\\"Services\\\". When using our Services, you may submit content, including without limitation picture posts and user comments (\\\"\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"b\",[]],[\"flush-element\"],[\"text\",\"User Content\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"\\\").\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Acceptance; Changes to the Terms\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"By accessing or using our Services, you are accepting these Terms, expressing your consent to all the provisions in these Terms, and agreeing to be bound by and comply with all the terms and conditions of these Terms.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"We reserve the right to change these Terms at any time at our sole discretion. You will be notified of such changes by a notice on our Site. The new Terms will become effective thirty (15) days after we post the notice on our Site. Your continued access to or use of the Services after the new Terms become effective will constitute acceptance of the new Terms.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"If your rights regarding access to and use of the Services are suspended or terminated, you agree to make no further attempt to access or use the Services during such suspension or after termination.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Our Services\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"We administer and operate our Services from our location in Budapest, Hungary. Although our Services are accessible throughout the world, not all services or features provided or offered as part of our Services may be available to all persons or in all geographic locations. We reserve the right to limit, in our sole discretion, the provision and quantity of any feature or part of our Services to any person or geographic area.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"We also reserve the right to modify, suspend, interrupt or terminate our Services or any part thereof, at any time and for any reason, and with or without notice to you. You agree that we will not be liable to you or any third party for any such modification, suspension, interruption or termination of the Services or any part thereof.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"You are not permitted to use our Services if you are not at least thirteen (13) years of age. By accessing or using our Services, you affirm that you are over thirteen (13) years of age and that you have not been previously barred from using our Services.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"You understand that when you use our Services, you will be exposed to content from a variety of sources, which may be inaccurate, offensive, indecent or objectionable. We are not responsible for the accuracy, appropriateness or usefulness of the content provided through our Services, nor do we endorse such content nor any opinion, recommendation or advice expressed therein. We therefore expressly disclaim any and all liability in connection therewith and you hereby waive any legal or equitable rights or remedies you have or may have against us with respect thereto.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Third Party Content\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Through our Services, third parties may make available materials, information and services, such as photographs, text, graphics, pictures, sound, video, information and software applications (collectively \\\"\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Third Party Content\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"\\\"). Such Third Party Content may be governed by separate license agreements that accompany such content.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Although we may monitor Third Party Content, and may set up controls of the same, we are under no obligation to investigate, monitor or check for accuracy, appropriateness, or completeness of such Third Party Content. We offer no guarantees and we assume no responsibility or liability of any type with respect to such Third Party Content, including any liability resulting from incompatibility between the Third Party Content and our Services. You agree that you will not hold us responsible or liable with respect to the Third Party Content or seek to do so.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"To the extent our Services contain links to outside services and resources, or that our content or Services are embedded or incorporated into third party websites or other properties (i.e., MyPlacc embeds), you acknowledge that: (1) we are not responsible for the content of any linked site or any link contained in a linked site, or any changes or updates to such sites; (2) we are not responsible for any other form of transmission received from any linked site, and (3) and you should review the terms of use and policies of these third party websites or other properties.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Also, we may provide links to third party websites or other properties you only as a convenience, and the inclusion of a link does not imply our approval or endorsement. Any issues or concerns regarding any such site should be directed to the owner or operator of that site or property.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Conditional Right to Access and Use\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Conditioned upon your full compliance with these Terms (and the Related Documents, including the Community Guidelines, we grant you a limited, non-exclusive, non-transferable and revocable right and license to access and use our Services for your personal use. For clarification, if you fail to comply with any of the provisions of these Terms, then you are no longer entitled to access and use our Services and will be in violation of our proprietary rights therein. Except as expressly provided herein, we do not grant you any express or implied rights in or to our Services or to any content or intellectual property rights provided through our Services.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"What You Cannot Do\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Your conditional right to access and use our Services is limited in that you are, except as expressly stated otherwise in these Terms, not allowed to:\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"ol\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Use our Services for any commercial purpose, such as, without limitation, sell, rent, lease, loan, assign, license, sublicense or in any other way, in whole or in part, exploit any of the content provided through our Services;\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Download (other than page caching), copy, reproduce, republish, frame, transmit, distribute, publicly display or perform, or modify or create derivative works based on, any content provided on our Services, the selection and arrangement thereof, or our Services themselves;\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Solicit any activity, unlawful or otherwise, that infringes our or any third party’s rights;\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Access our Services by means of robots, data mining or similar data gathering and extraction tools or methods;\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Access our Services in order to build a competitive product or service or to analyze or reverse engineer any part of our Services;\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Impose an unreasonable burden on the network or infrastructure on which our Services are provided or in any other way interfere with the operation of our Services or with any other user’s use of our Services;\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Remove, circumvent, interfere with or otherwise attempt to breach the security-related features of our Services or in any other way attempt to gain unauthorized access to our Services or any part thereof; or\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Use our Services for any purpose that is beyond the scope of our Services’ reasonably expected use, is illegal, or is prohibited by these Terms or our Community Guidelines.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"User Account\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"It is your responsibility to keep your account information secret. You must notify us immediately if the secrecy of your account information has been compromised or if you discover or suspect any unauthorized use of your account.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"You are responsible for all activity that occurs through the use of your account and you may be held responsible for any losses incurred by us or any other user of our Services that are in any way related to your failure to maintain the secrecy of your account information.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"User Conduct\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Our Community Guidelines provide important information about permissible User Content and User conduct. While we cannot guarantee that you will not encounter objectionable content on our Services, the Community Guidelines are an important part of making our Services a creative environment that all users can enjoy. Accordingly, you must observe the Community Guidelines and they constitute an integral part of these Terms.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"User Content\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"When using our Services, you may submit content, including without limitation picture posts and user comments (\\\"\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"b\",[]],[\"flush-element\"],[\"text\",\"User Content\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"\\\"). You are solely responsible for your User Content and the consequences of submitting and publishing your User Content through our Services.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"We reserve the right to suppress or delete any User Content that we, in our sole discretion, deem inappropriate or to be violating these Terms or our Community Guidelines, such as, but not limited to, User Content containing nudity, pornography, obscenity, or abusive or bullying content. For more information about permissible and prohibited User Content, please refer to our Community Guidelines.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"By submitting User Content to our Services, you affirm, represent and warrant that you are the creator and owner of or have the necessary licenses, rights, consents, and permissions to submit such User Content to our Services and to grant us the rights and licenses as set forth hereinafter. You also represent that your User Content does not and will not infringe, violate or misappropriate any third-party rights, including any patent, trademark, trade secret, copyright, right of publicity, or any other intellectual property or proprietary right.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"By submitting User Content to our Services, you are hereby granting us a license to all Intellectual Property and other proprietary rights in and to such User Content for the use of your User Content with our Services. For clarification, you retain all of your ownership rights in your User Content, but by submitting your User Content to our Services, you hereby: (a) grant us a worldwide, non-exclusive, royalty-free, perpetual, irrevocable, transferable and sublicensable license to use, reproduce, distribute, publish, modify and prepare derivative works of, publicly display and perform such User Content in connection with our Services and our (and our successors’, assigns’ and affiliates’) business, including without limitation for promoting and redistributing part or all of the Services (and derivative works thereof) in any media formats and through any media channels; and (b) grant each user of our Services a worldwide, non-exclusive, royalty-free, perpetual, irrevocable and sublicensable license to use, reproduce, distribute, publish, modify and prepare derivative works of, publicly display and perform your User Content as permitted through the functionality of our Services and under these Terms. The above license granted by you to each other user of our Services in your User Content terminates after you remove or delete your User Content from our Services, unless you have published your User Content or shared it with other users prior to its removal, and they have not deleted it.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"MyPlacc Intellectual Property\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Unless otherwise stated, all materials on our Services, including, but not limited to, text, graphics, images, illustrations, designs, icons, photographs, video clips, and any written and other content that appear as part of our Services, as well as their selection and arrangement and their \\\"look and feel\\\", are, insofar applicable, protected by copyright, trademark, trade dress, patent and/or other intellectual property and proprietary rights (collectively \\\"\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"b\",[]],[\"flush-element\"],[\"text\",\"MyPlacc Intellectual Property\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"\\\"), and any unauthorized use of such material may violate the MyPlacc Intellectual Property.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Nothing in these Terms shall transfer from us or any of our third party licensors to you any MyPlacc Intellectual Property or third party Intellectual Property. All right, title and interest in and to our Services and the MyPlacc Intellectual Property are and will remain the exclusive property of MyPlacc.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"The MyPlacc Intellectual Property, as well as any third party trademarks, logos and service marks contained in our Services, may not be used in connection with any product or service in any manner that is likely to cause confusion, and may not be copied, imitated, or used, in whole or in part, without our or the third party owner’s prior written permission.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Indemnification\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"You agree to defend, indemnify and hold harmless MyPlacc, its officers, members, predecessors, successors and assigns, directors, employees, agents, subsidiaries, affiliates, licensors and suppliers from and against any and all claims, charges, complaints, damages, losses, liabilities, costs and expenses (including attorneys’ fees) due to, arising out of or relating in any way to your use of our Services.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Warranty Disclaimer\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"OUR SERVICES AND ANY CONTENT MADE AVAILABLE THROUGH OUR SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE”, WITHOUT ANY REPRESENTATIONS OR WARRANTIES OF ANY KIND.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT, TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, YOUR USE OF OUR SERVICES IS AT YOUR SOLE RISK.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, WE HEREBY SPECIFICALLY DISCLAIM ANY AND ALL WARRANTIES AND CONDITIONS WITH RESPECT TO OUR SERVICES AND CONTENT MADE AVAILABLE THROUGH OUR SERVICES, EITHER EXPRESS, IMPLIED OR STATUTORY, INCLUDING, BUT NOT LIMITED TO, ANY IMPLIED WARRANTIES AND/OR CONDITIONS OF MERCHANTABILITY, SATISFACTORY QUALITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, QUIET ENJOYMENT, NON-INFRINGEMENT OF THIRD PARTY RIGHTS, AND ANY WARRANTIES ARISING OUT OF THE COURSE OF DEALING OR USAGE OF TRADE. WE DO NOT WARRANT AGAINST INTERFERENCE WITH YOUR ENJOYMENT OF OUR SERVICES, THAT THE FUNCTIONS CONTAINED IN OUR SERVICES OR PERFORMED BY OUR SERVICES WILL MEET YOUR REQUIREMENTS, THAT THE OPERATION OF OUR SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE, THAT ANY PART OF OUR SERVICES WILL CONTINUE TO BE MADE AVAILABLE, THAT DEFECTS IN OUR SERVICES WILL BE CORRECTED, OR THAT OUR SERVICES WILL BE COMPATIBLE OR WORK WITH ANY THIRD PARTY SOFTWARE, APPLICATIONS OR THIRD PARTY SERVICES. NO ORAL OR WRITTEN INFORMATION OR ADVICE GIVEN BY US OR AN APPROVED REPRESENTATIVE SHALL CREATE A WARRANTY.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"ALL INFORMATION PROVIDED ON OR THROUGH OUR SERVICES IS SUBJECT TO CHANGE WITHOUT NOTICE. WE CANNOT AND DO NOT ENSURE OR WARRANT THAT ANYTHING YOU DOWNLOAD FROM OUR SERVICES WILL NOT CONTAIN VIRUSES OR OTHER DESTRUCTIVE ELEMENTS.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"In such jurisdiction that do not allow for the exclusion of implied warranties or limitations on statutory rights of a consumer, the above exclusions and limitations will be valid to the fullest extent allowed by applicable law.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Limitation of Liability\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"EXCEPT WHERE PROHIBITED BY LAW, IN NO EVENT WILL WE OR ANY OF OUR AFFILIATED ENTITIES BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, SPECIAL, INDIRECT, INCIDENTAL, PUNITIVE, EXEMPLARY OR CONSEQUENTIAL DAMAGES OF ANY KIND ARISING OUT OF OR IN CONNECTION WITH (1) THE USE OF, OR INABILITY TO USE, OUR SERVICES; (2) ANY CONTENT MADE AVAILABLE THROUGH OUR SERVICES; OR (3) THE CONDUCT OF OTHER USERS OF OUR SERVICES, REGARDLESS OF THE FORM OF ACTION, WHETHER IN CONTRACT, TORT, STRICT LIABILITY OR OTHERWISE, EVEN IF WE HAVE BEEN ADVISED OF OR ARE AWARE OF THE POSSIBILITY OF SUCH DAMAGES.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"IF, NOTWITHSTANDING THESE TERMS, WE ARE FOUND LIABLE TO YOU FOR ANY DAMAGE OR LOSS WHICH ARISES OUT OF OR IS IN ANY WAY CONNECTED WITH YOUR USE OF OUR SERVICES OR ANY CONTENT MADE AVAILABLE THROUGH OUR SERVICES, THEN OUR LIABILITY SHALL IN NO EVENT EXCEED THE AMOUNT PAID BY YOU, IF ANY, FOR THE PROVISION OF OUR SERVICES DURING THE SIX (6) MONTHS IMMEDIATELY PRECEDING THE DATE OF THE CLAIM OR ONE (1) U.S. DOLLAR, WHICHEVER IS GREATER.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"In such jurisdictions that do not allow for the limitation of liability set forth herein, our liability will be limited to the fullest extent allowed by applicable law.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Miscellaneous\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"These Terms are the complete and exclusive agreement between you, the User, and us, MyPlacc, with respect to the subject matter hereof, superseding and replacing any and all prior and contemporaneous agreements, communications, and understandings (both written and oral) regarding such subject matter. If any provision of these Terms is deemed invalid or for any reason unenforceable, then that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions of these Terms will remain in full force and effect. If MyPlacc chooses not to enforce strict performance of any right or provision under these Terms, this shall not be construed as a waiver of such right or provision. You may not transfer or assign these Terms, or any rights and licenses granted hereunder, but MyPlacc may do so without restriction. Any attempted transfer or assignment in violation hereof will be null and void. These Terms shall be construed in accordance with the laws of Hungary, without regard to any conflict of law provisions. Notwithstanding this, either party may apply for injunctive or other equitable relief to protect or enforce that party’s intellectual property rights in any court of competent jurisdiction where the other party resides or has its principal place of business. You agree that any cause of action that you may desire to bring arising out of or related to these Terms and/or the Services must commence within one (1) year after the cause of action arises; otherwise, such cause of action is hereby waived and permanently barred. In such jurisdictions that do not allow for the shortening of the time period in which a cause of action must be brought, the applicable time period shall be the minimum allowed by law.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Feedback\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"We welcome your questions, comments and concerns. If you choose to submit such feedback to us, you agree that we are free to use this feedback in any way we see fit, without any restriction or compensation to you. Please send your feedback to:info@MyPlacc.hu\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Community Guidelines\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"The intent of this section is to clarify what we consider to be acceptable use of MyPlacc, Inc’s (“MyPlacc,” “we” or “us”) website, [MyPlacc.hu] (the “Site”), and MyPlacc’s iPhone and other applications (those applications together with the Site, “Service”).\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Redundant Content\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Service is not intended to be an all-purpose content aggregator. Users who import or aggregate content in a less-than-meaningful way are likely to be suspended.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Illegal Use\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Service may not be used for illegal purposes. Examples of this include using Service for fraudulent purposes or operating a phishing site (used to obtain account and password information).\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Spam\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Users that do not publish meaningful content, use deceptive means to generate revenue or traffic, or whose primary purpose is affiliate marketing, will be suspended.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Identity Theft and Privacy\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Users that misleadingly appropriate the identity of another person are not permitted. Users may not post other people’s personally identifying or confidential information, including but not limited to credit card numbers, Social Security Numbers, and driver’s and other license numbers. You may not post information such as other people’s passwords, usernames, phone numbers, addresses and e-mail addresses unless already publicly accessible on the Web.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Hate Content, Defamation, and Libel\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Hate speech and other objectionable content that is unlawful, defamatory, and fraudulent. Note that an allegation of defamatory expression, in and of itself, does not establish defamation. The truth or falsehood of a bit of expression is a key element in establishing defamation, and we are not in a position to make that sort of fact-based judgment. That said, if we have reason to believe that a particular statement is defamatory (a court order, for example), we will remove that statement.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Copyright\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Using copyrighted material does not constitute infringement in all cases. In general, however, users should be careful when using copyrighted content without the permission of those who created it. It is our policy to respond to notices of alleged infringement that comply with the Digital Millennium Copyright Act (“DMCA”).\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Mass Registration and Automation\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Accounts that are registered automatically or systematically will be removed and access will be permanently suspended.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Sexually Explicit Content\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Accounts that regularly upload sexually explicit or pornographic material will be suspended.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Malicious Bigotry\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Don’t actively promote violence or extreme hatred against individuals or groups, on the basis of race, ethnic origin, religion, disability, gender, age, veteran status, or sexual orientation. While we firmly believe that the best response to hateful speech is not censorship but more speech, we will take down malicious bigotry, as defined here.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Harm to Minors\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Be thoughtful when posting anything involving a minor. Don’t post anything relating to minors that is sexually suggestive or violent. Don’t bully minors, even if you are one. Life as a teenager is hard enough without the fear, anguish, and isolation caused by online bullying.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Promotion and Glorification of Self-Harm\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Don’t post content that actively promotes or glorifies self-harm. This includes content that urges or encourages readers to cut or injure themselves; embrace anorexia, bulimia, or other eating disorders; or commit suicide rather than, e.g., seeking counseling or treatment, or joining together in supportive conversation with those suffering or recovering from depression or other conditions. Dialogue about these behaviors is incredibly important and online communities can be extraordinarily helpful to people struggling with these difficult conditions.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Gore and Mutilation Content\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Don’t post gore just to be shocking. Don’t showcase the mutilation or torture of human beings, animals, or their remains.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Unauthorized Sweepstakes or Giveaways\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Everyone wants to be a winner, but there are many reasons (including legal ones) why the Service can’t be used for sweepstakes without our involvement and consent. If you’re planning something like this, let us know.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Copyright and Trademark Infringement\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Respect the copyrights and trademarks of others. If you aren’t authorized to use someone else’s copyrighted or trademarked work (either expressly or by legal exceptions and limitations like fair use), don’t. It is our policy to respond to notices of alleged copyright infringement as per our Terms of Service and the Digital Millennium Copyright Act.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Impersonation, Stalking, or Harassment\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Treat the community the way you’d like to be treated. Don’t attempt to circumvent the Block feature. If you want to parody or ridicule a public figure (and who doesn’t?), don’t try to trick readers into thinking you are actually that public figure.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Privacy Violations\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Don’t use MyPlacc to deceptively obtain personal information. Don’t post content that violates anyone’s privacy, including personally identifying or confidential information like credit card numbers, social security numbers, unlisted contact information, or private photos of your ex’s junk (no matter how attractive).\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Disruptions, Exploits, and Resource Abuse\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Our servers and the valiant engineers that support them work hard for you. Don’t attempt unauthorized use, disruption, or exploitation of MyPlacc or our other products and MyPlacc, or otherwise abuse MyPlacc’s resources.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Unlawful Uses and Content\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"This one’s pretty obvious, but MyPlacc is not a place for illegal behavior, including fraud, phishing, or illegally inciting violence.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"h5\",[]],[\"flush-element\"],[\"text\",\"Account Termination\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"If we conclude you are violating these policies, you may receive a notice via email or direct message. If you don’t explain or correct your behavior, your account may be suspended and/or your User ID may be blocked. We do our best to ensure fair outcomes, but in all cases we reserve the right to suspend accounts or remove content, without notice, for any reason, but particularly to protect our services, infrastructure, users, or community. We reserve the right to enforce, or not enforce, these policies in our sole discretion, and these policies don’t create a duty or contractual obligation for us to act in any particular manner. We also reserve the right to amend these policies.\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "client/pods/terms/template.hbs" } });
});
define('client/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  exports['default'] = _emberResolver['default'];
});
define('client/router', ['exports', 'ember', 'client/config/environment'], function (exports, _ember, _clientConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _clientConfigEnvironment['default'].locationType,
    rootURL: _clientConfigEnvironment['default'].rootURL
  });

  Router.map(function () {
    this.route('building', { path: 'building/:building_id' });
    this.route('level', { path: 'level/:level_id' });
    this.route('profile', function () {
      this.route('index');
      this.route('places');
      this.route('signup');
      this.route('modify');
      this.route('forgotpwd');
      this.route('forgotpwchange', { path: '/forgotpwchange/:requestid' });
    });
    this.route('terms');
    this.route('privacy');
    this.route('cpolicy');
    this.route('admin', { path: 'admin' }, function () {
      this.route("language", { path: "language" });
    });
    this.route('company', { path: 'company/:company_id' });
  });

  exports['default'] = Router;
});
define('client/serializers/application', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].JSONAPISerializer.extend({
    keyForAttribute: function keyForAttribute(attr, method) {
      return attr;
      //return Ember.String.underscore(attr).toUpperCase();
    }
  });
});
define('client/serializers/ls-serializer', ['exports', 'ember-localstorage-adapter/serializers/ls-serializer'], function (exports, _emberLocalstorageAdapterSerializersLsSerializer) {
  exports['default'] = _emberLocalstorageAdapterSerializersLsSerializer['default'];
});
define('client/serializers/session', ['exports', 'ember-localstorage-adapter'], function (exports, _emberLocalstorageAdapter) {
  exports['default'] = _emberLocalstorageAdapter.LSSerializer.extend();
});
define('client/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _emberAjaxServicesAjax) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberAjaxServicesAjax['default'];
    }
  });
});
define('client/services/appstate', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Service.extend({
		width: 0,
		height: 0,
		isMobile: _ember['default'].computed('width', function () {
			if (this.get("width") === 0) {
				this.set('width', _ember['default'].$(window).width());
			}
			if (this.get("width") < 703) {
				return true;
			}
			return false;
		})
	});
});
define('client/services/i18n', ['exports', 'ember-i18n/services/i18n'], function (exports, _emberI18nServicesI18n) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberI18nServicesI18n['default'];
    }
  });
});
define('client/services/loader', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Service.extend({
		__processName: null,
		__obj: null,
		promisCount: 0,
		loading: false,
		startAppLoadProcess: function startAppLoadProcess() {
			this.startLoadProcess();
		},
		finishAppLoadProcess: function finishAppLoadProcess(listenToObject) {
			this.listenTo(listenToObject);
		},

		startLoadProcess: function startLoadProcess(listenToObject) {
			this.set('loading', true);
			this.startProcess(null, 'load', listenToObject);
		},
		startSaveProcess: function startSaveProcess(listenToObject) {
			this.startProcess(null, 'save', listenToObject);
		},
		startProcess: function startProcess(obj, name, promise) {
			if (this.get('__obj') !== null) {
				// disable previous process
				this.get('__obj').set(this.get('__processName') + 'Processing', false);
			}
			this.set('__processName', name);
			if (obj !== null) {
				this.set('__obj', obj);
				this.get('__obj').set(this.get('__processName') + 'Processing', true);
			}
			if (promise) {
				this.listenTo(promise);
			}
		},
		finishProcess: function finishProcess() {
			this.decrementProperty('promisCount');
			if (this.get('promisCount') === 0) {
				if (this.get('__processName') === 'load') {
					this.set('loading', false);
				}
				if (this.get('__obj') !== null) {
					this.get('__obj').set(this.get('__processName') + 'Processing', false);
				}
				this.set('__processName', null);
				this.set('__obj', null);
			}
		},
		listenTo: function listenTo(promise) {
			if (this.get('__processName') !== null) {
				// start listen to promise
				var l = this;
				this.incrementProperty('promisCount');
				promise.then(function () {
					l.finishProcess();
				});
				if (promise['catch']) {
					promise['catch'](function () {
						l.finishProcess();
					});
				} else {
					if (promise.fail) {
						promise.fail(function () {
							l.finishProcess();
						});
					}
				}
			}
		}
	});
});
define('client/services/modal', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Service.extend({
		showModal: false,
		modalName: null,
		modalModel: null,
		openInfoModal: function openInfoModal(data) {
			this.set('modalName', 'info-modal');
			this.set('modalModel', data);
			this.set('showModal', true);
		},
		openConfirmModal: function openConfirmModal(data) {
			this.set('modalName', 'confirm-modal');
			this.set('modalModel', data);
			this.set('showModal', true);
		},
		openQuestionSavedModal: function openQuestionSavedModal(data) {
			this.set('modalName', 'question-saved');
			this.set('modalModel', data);
			this.set('showModal', true);
		},
		toast: function toast(text) {
			Materialize.toast('<span style="font-size:0.8em;white-space:nowrap;max-width:800px;">' + text + '</span>', 6000);
		}
	});
});
define('client/services/session', ['exports', 'ember', 'client/app'], function (exports, _ember, _clientApp) {
	exports['default'] = _ember['default'].Service.extend({
		token: _ember['default'].computed.readOnly('sessionData.token'),
		language: _ember['default'].computed.readOnly('sessionData.language'),
		email: _ember['default'].computed.readOnly('sessionData.email'),
		name: _ember['default'].computed.readOnly('sessionData.name'),
		login: _ember['default'].computed.readOnly('sessionData.login'),
		displayName: _ember['default'].computed('sessionData.name', 'sessionData.login', function () {
			if (this.get('sessionData.login')) {
				return '@' + this.get('sessionData.login');
			} else {
				return this.get('sessionData.username');
			}
		}),
		userid: _ember['default'].computed.readOnly('sessionData.userid'),
		isAdmin: _ember['default'].computed.readOnly('sessionData.isAdmin'),
		isCustomer: _ember['default'].computed.readOnly('sessionData.isCustomer'),
		isRegistered: _ember['default'].computed.readOnly('sessionData.isRegistered'),

		user: null,
		username: _ember['default'].computed('sessionData.username', 'sessionData.login', function () {
			if (this.get('sessionData.username')) {
				return this.get('sessionData.username');
			} else {
				return '@' + this.get('sessionData.login');
			}
		}),
		avatarUrl: _ember['default'].computed('sessionData.hash', 'sessionData.image', 'user.imagec', function () {
			return "/api/profileimage?u=" + this.get('userid') + "&c=" + this.get('user.imagec');
		}),

		isLoggedIn: _ember['default'].computed('sessionData.userid', function () {
			return !!this.get('sessionData.userid');
		}),
		sessionData: null,
		solution: null,
		setup: function setup(sessionData) {
			var lang = 'en';
			if (lang === null) {
				// later when we relase the multilanguage support, this sample will read the language from browser
				lang = navigator.language || navigator.userLanguage;
				if (!_ember['default'].isEmpty(lang)) {
					var l = lang.split('-');
					_clientApp['default'].moment.lang(l[0]);
					lang = l[0];
				}
			}
			sessionData.set('language', lang);
			this.set('sessionData', sessionData);
		},
		updateSessionModel: function updateSessionModel(data, sessionData) {
			if (sessionData) {
				this.set('sessionData', sessionData);
			}
			sessionData = this.get('sessionData');
			if (sessionData.get('old_token') !== sessionData.get('token') && sessionData.get('token') !== null) {
				sessionData.set('old_token', sessionData.get('token'));
				sessionData.set('old_hash', sessionData.get('hash'));
			}
			sessionData.set('token', data.access_token);
			sessionData.set('scope', data.scope);
			sessionData.set('username', data.name);
			sessionData.set('login', data.login);
			sessionData.set('userid', data.userid);
			sessionData.set('createDt', new Date());
			sessionData.set('modifyDt', moment(data.modifyDt));
			if (data.prevLogin != null) {
				sessionData.set('prevLogin', moment(data.prevLogin).toDate());
			}
			sessionData.set('hash', data.hash);
			this.set('user', data.user);
			sessionData.set('image', data.user.image);
			return sessionData.save();
		},
		restoreSession: function restoreSession() {
			var sessionData = this.get('sessionData');
			if (sessionData.get('old_token') != null) {
				if (sessionData.get('token') === sessionData.get('old_token')) {
					window.localStorage.clear();
					_clientApp['default'].reload();
					return null;
				}
				sessionData.set('token', sessionData.get('old_token'));
				sessionData.set('hash', sessionData.get('old_hash'));
				sessionData.set('old_hash', null);
				sessionData.set('old_token', null);
				sessionData.set('userid', null);
				sessionData.set('user', null);
				sessionData.set('email', null);
				sessionData.set('image', null);
				sessionData.set('login', 'anonyme');
				sessionData.set('username', 'Anonyme');
				sessionData.set('scope', null);
				return sessionData.save();
			}
			return null;
		}
		/*,
  updateSessionObject:function(session,data){
  	session.set('token',data.access_token);
  	session.set('scope',data.scope);
  	session.set('username',data.name);
  	session.set('login',data.login);
  	session.set('userid',data.userid);
  	session.set('createDt',new Date());
  	session.set('modifyDt',moment(data.modifyDt));
  	if(data.prevLogin!=null){
  		session.set('prevLogin',moment(data.prevLogin).toDate());
  	}
  	session.set('hash',data.hash); 		 
  	return session;
  }
  */
	});
});
define("client/templates/components/infinity-loader", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "Y6HNuQA4", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"has-block\",\"default\"]],null,3,2]],\"locals\":[],\"named\":[],\"yields\":[\"default\"],\"blocks\":[{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"loadingText\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"loadedText\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"infinityModel\",\"reachedInfinity\"]]],null,1,0]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"yield\",\"default\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "client/templates/components/infinity-loader.hbs" } });
});
define('client/tests/mirage/mirage/config.jshint.lint-test', ['exports'], function (exports) {
  QUnit.module('JSHint | mirage/config.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'mirage/config.js should pass jshint.');
  });
});
define('client/tests/mirage/mirage/factories/building.jshint.lint-test', ['exports'], function (exports) {
  QUnit.module('JSHint | mirage/factories/building.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'mirage/factories/building.js should pass jshint.');
  });
});
define('client/tests/mirage/mirage/factories/company.jshint.lint-test', ['exports'], function (exports) {
  QUnit.module('JSHint | mirage/factories/company.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'mirage/factories/company.js should pass jshint.');
  });
});
define('client/tests/mirage/mirage/factories/level.jshint.lint-test', ['exports'], function (exports) {
  QUnit.module('JSHint | mirage/factories/level.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'mirage/factories/level.js should pass jshint.');
  });
});
define('client/tests/mirage/mirage/models/building.jshint.lint-test', ['exports'], function (exports) {
  QUnit.module('JSHint | mirage/models/building.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'mirage/models/building.js should pass jshint.');
  });
});
define('client/tests/mirage/mirage/models/company.jshint.lint-test', ['exports'], function (exports) {
  QUnit.module('JSHint | mirage/models/company.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'mirage/models/company.js should pass jshint.');
  });
});
define('client/tests/mirage/mirage/models/level.jshint.lint-test', ['exports'], function (exports) {
  QUnit.module('JSHint | mirage/models/level.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'mirage/models/level.js should pass jshint.');
  });
});
define('client/tests/mirage/mirage/models/reservation.jshint.lint-test', ['exports'], function (exports) {
  QUnit.module('JSHint | mirage/models/reservation.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'mirage/models/reservation.js should pass jshint.');
  });
});
define('client/tests/mirage/mirage/models/seat.jshint.lint-test', ['exports'], function (exports) {
  QUnit.module('JSHint | mirage/models/seat.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'mirage/models/seat.js should pass jshint.');
  });
});
define('client/tests/mirage/mirage/models/user.jshint.lint-test', ['exports'], function (exports) {
  QUnit.module('JSHint | mirage/models/user.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'mirage/models/user.js should pass jshint.');
  });
});
define('client/tests/mirage/mirage/scenarios/default.jshint.lint-test', ['exports'], function (exports) {
  QUnit.module('JSHint | mirage/scenarios/default.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'mirage/scenarios/default.js should pass jshint.');
  });
});
define('client/tests/mirage/mirage/serializers/application.jshint.lint-test', ['exports'], function (exports) {
  QUnit.module('JSHint | mirage/serializers/application.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'mirage/serializers/application.js should pass jshint.');
  });
});
define('client/transforms/datetime', ['exports', 'ember-data', 'ember'], function (exports, _emberData, _ember) {
	exports['default'] = _emberData['default'].Transform.extend({
		deserialize: function deserialize(serialized) {
			if (_ember['default'].isEmpty(serialized)) {
				return;
			}
			_ember['default'].assert("Value type is not string", !!serialized.indexOf);
			return moment(serialized, 'YYYY-MM-DDTHH:mm:ss.SSSZZ');
		},

		serialize: function serialize(deserialized) {
			if (_ember['default'].isEmpty(deserialized)) {
				return;
			}
			_ember['default'].assert("Value type is not moment", !!deserialized.format);
			return deserialized.format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
		}
	});
});
define('client/transforms/mdate', ['exports', 'ember-data', 'ember'], function (exports, _emberData, _ember) {
	exports['default'] = _emberData['default'].Transform.extend({
		deserialize: function deserialize(serialized) {
			if (_ember['default'].isEmpty(serialized)) {
				return;
			}
			_ember['default'].assert("Value type is not string", !!serialized.indexOf);
			return moment(serialized, 'YYYY-MM-DD');
		},
		serialize: function serialize(deserialized) {
			if (_ember['default'].isEmpty(deserialized)) {
				return;
			}
			_ember['default'].assert("Value type is not moment", !!deserialized.format);
			return deserialized.format('YYYY-MM-DD');
		}
	});
});
define('client/transforms/raw', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Transform.extend({
    deserialize: function deserialize(serialized) {
      return serialized;
    },

    serialize: function serialize(deserialized) {
      return deserialized;
    }
  });
});
define('client/transforms/time', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Transform.extend({
    deserialize: function deserialize(serialized) {
      return serialized;
    },

    serialize: function serialize(deserialized) {
      return deserialized;
    }
  });
});
define('client/transforms/timestamp', ['exports', 'ember-data', 'ember'], function (exports, _emberData, _ember) {
	exports['default'] = _emberData['default'].Transform.extend({
		deserialize: function deserialize(serialized) {
			if (_ember['default'].isEmpty(serialized)) {
				return;
			}
			_ember['default'].assert("Value type is not integer", !isNaN(serialized));
			return moment(serialized);
		},
		serialize: function serialize(deserialized) {
			if (_ember['default'].isEmpty(deserialized)) {
				return;
			}
			_ember['default'].assert("Value type is not moment", !!deserialized.format);
			return deserialized.format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
		}
	});
});
define('client/utils/i18n/compile-template', ['exports', 'ember-i18n/utils/i18n/compile-template'], function (exports, _emberI18nUtilsI18nCompileTemplate) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberI18nUtilsI18nCompileTemplate['default'];
    }
  });
});
define('client/utils/i18n/missing-message', ['exports'], function (exports) {
  exports['default'] = function (locale, key, context) {
    var values = Object.keys(context).map(function (key) {
      return context[key];
    });
    return key + ': ' + values.join(', ');
  };
});
define("client/utils/q-infinity-route", ["exports", "ember", "ember-infinity/mixins/route"], function (exports, _ember, _emberInfinityMixinsRoute) {
	exports["default"] = _ember["default"].Route.extend(_emberInfinityMixinsRoute["default"], {
		perPageParam: "page[limit]", // instead of "per_page"
		pageParam: "page[offset]", // instead of "page"
		totalPagesParam: "meta.totalPages", // instead of "meta.total_pages"	
		count: "meta.count", // instead of "meta.total_pages"	

		actions: {
			infinityModelUpdated: function infinityModelUpdated(totalPages) {
				_ember["default"].Logger.debug('updated with more items');
			},
			infinityModelLoaded: function infinityModelLoaded(lastPageLoaded, totalPages, infinityModel) {
				_ember["default"].Logger.info('no more items to load');
			}
		}
	});
});
define('client/validators/alias', ['exports', 'ember-cp-validations/validators/alias'], function (exports, _emberCpValidationsValidatorsAlias) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCpValidationsValidatorsAlias['default'];
    }
  });
});
define('client/validators/belongs-to', ['exports', 'ember-cp-validations/validators/belongs-to'], function (exports, _emberCpValidationsValidatorsBelongsTo) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCpValidationsValidatorsBelongsTo['default'];
    }
  });
});
define('client/validators/collection', ['exports', 'ember-cp-validations/validators/collection'], function (exports, _emberCpValidationsValidatorsCollection) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCpValidationsValidatorsCollection['default'];
    }
  });
});
define('client/validators/confirmation', ['exports', 'ember-cp-validations/validators/confirmation'], function (exports, _emberCpValidationsValidatorsConfirmation) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCpValidationsValidatorsConfirmation['default'];
    }
  });
});
define('client/validators/date', ['exports', 'ember-cp-validations/validators/date'], function (exports, _emberCpValidationsValidatorsDate) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCpValidationsValidatorsDate['default'];
    }
  });
});
define('client/validators/dependent', ['exports', 'ember-cp-validations/validators/dependent'], function (exports, _emberCpValidationsValidatorsDependent) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCpValidationsValidatorsDependent['default'];
    }
  });
});
define('client/validators/ds-error', ['exports', 'ember-cp-validations/validators/ds-error'], function (exports, _emberCpValidationsValidatorsDsError) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCpValidationsValidatorsDsError['default'];
    }
  });
});
define('client/validators/exclusion', ['exports', 'ember-cp-validations/validators/exclusion'], function (exports, _emberCpValidationsValidatorsExclusion) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCpValidationsValidatorsExclusion['default'];
    }
  });
});
define('client/validators/format', ['exports', 'ember-cp-validations/validators/format'], function (exports, _emberCpValidationsValidatorsFormat) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCpValidationsValidatorsFormat['default'];
    }
  });
});
define('client/validators/has-many', ['exports', 'ember-cp-validations/validators/has-many'], function (exports, _emberCpValidationsValidatorsHasMany) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCpValidationsValidatorsHasMany['default'];
    }
  });
});
define('client/validators/inclusion', ['exports', 'ember-cp-validations/validators/inclusion'], function (exports, _emberCpValidationsValidatorsInclusion) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCpValidationsValidatorsInclusion['default'];
    }
  });
});
define('client/validators/length', ['exports', 'ember-cp-validations/validators/length'], function (exports, _emberCpValidationsValidatorsLength) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCpValidationsValidatorsLength['default'];
    }
  });
});
define('client/validators/messages', ['exports', 'ember-cp-validations/validators/messages'], function (exports, _emberCpValidationsValidatorsMessages) {
  /**
   * Copyright 2016, Yahoo! Inc.
   * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
   */

  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCpValidationsValidatorsMessages['default'];
    }
  });
});
define('client/validators/no-whitespace-around', ['exports', 'ember-cp-validations/validators/base'], function (exports, _emberCpValidationsValidatorsBase) {

  var NoWhitespaceAround = _emberCpValidationsValidatorsBase['default'].extend({
    validate: function validate(value, options, model, attribute) {
      return value.indexOf(' ') == -1;
    }
  });

  NoWhitespaceAround.reopenClass({
    /**
     * Define attribute specific dependent keys for your validator
     *
     * [
     * 	`model.array.@each.${attribute}` --> Dependent is created on the model's context
     * 	`${attribute}.isValid` --> Dependent is created on the `model.validations.attrs` context
     * ]
     *
     * @param {String}  attribute   The attribute being evaluated
     * @param {Unknown} options     Options passed into your validator
     * @return {Array}
     */
    getDependentsFor: function getDependentsFor() /* attribute, options */{
      return [];
    }
  });

  exports['default'] = NoWhitespaceAround;
});
define('client/validators/number', ['exports', 'ember-cp-validations/validators/number'], function (exports, _emberCpValidationsValidatorsNumber) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCpValidationsValidatorsNumber['default'];
    }
  });
});
define('client/validators/presence', ['exports', 'ember-cp-validations/validators/presence'], function (exports, _emberCpValidationsValidatorsPresence) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCpValidationsValidatorsPresence['default'];
    }
  });
});
define('client/validators/unique-email', ['exports', 'ember-cp-validations/validators/base', 'ember'], function (exports, _emberCpValidationsValidatorsBase, _ember) {
  var UniqueEmail = _emberCpValidationsValidatorsBase['default'].extend({
    i18n: _ember['default'].inject.service(),
    validate: function validate(value, options, model, attribute) {
      if (!value) return true;
      var id = model.get('id') || 0;
      var c = this;
      return window.xappc.getData("/api/common/check/email?email=" + value + "&eId=" + id, true, "GET", true, false, {}).then(function (result) {
        if (result === 'NULL') {
          return true;
        } else {

          return c.get('i18n').t("signup.alreadyexists") + ' ';
        }
      });
    }
  });

  UniqueEmail.reopenClass({
    /**
     * Define attribute specific dependent keys for your validator
     *
     * [
     * 	`model.array.@each.${attribute}` --> Dependent is created on the model's context
     * 	`${attribute}.isValid` --> Dependent is created on the `model.validations.attrs` context
     * ]
     *
     * @param {String}  attribute   The attribute being evaluated
     * @param {Unknown} options     Options passed into your validator
     * @return {Array}
     */
    getDependentsFor: function getDependentsFor() /* attribute, options */{
      return [];
    }
  });

  exports['default'] = UniqueEmail;
});
define('client/validators/unique-login', ['exports', 'ember', 'ember-cp-validations/validators/base'], function (exports, _ember, _emberCpValidationsValidatorsBase) {
  exports['default'] = _emberCpValidationsValidatorsBase['default'].extend({
    store: _ember['default'].inject.service(),

    validate: function validate(value, options, model, attribute) {
      if (!value) return true;
      var id = model.get('id') || 0;
      return window.xappc.getData("/api/common/check/login?login=" + value + "&eId=" + id, true, "GET", true, false, {}).then(function (result) {
        if (result === 'NULL') {
          return true;
        } else {
          return window.xappc.i18n("signup.alreadyexists");
        }
      });
    }
  });
});
/* jshint ignore:start */



/* jshint ignore:end */

/* jshint ignore:start */

define('client/config/environment', ['ember'], function(Ember) {
  var prefix = 'client';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

/* jshint ignore:end */

/* jshint ignore:start */

if (!runningTests) {
  require("client/app")["default"].create({"perPage":5,"name":"client","version":"0.0.0+"});
}

/* jshint ignore:end */
//# sourceMappingURL=client.map

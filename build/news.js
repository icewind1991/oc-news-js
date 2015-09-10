(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * Mappersmith __VERSION__
 * https://github.com/tulios/mappersmith
 */
'use strict';

module.exports = {
  Env: require('./src/env'),
  Utils: require('./src/utils'),
  Gateway: require('./src/gateway'),
  Mapper: require('./src/mapper'),
  VanillaGateway: require('./src/gateway/vanilla-gateway'),
  JQueryGateway: require('./src/gateway/jquery-gateway'),

  forge: require('./src/forge'),
  createGateway: require('./src/create-gateway')
};

},{"./src/create-gateway":3,"./src/env":4,"./src/forge":5,"./src/gateway":6,"./src/gateway/jquery-gateway":7,"./src/gateway/vanilla-gateway":9,"./src/mapper":10,"./src/utils":11}],2:[function(require,module,exports){
'use strict';

var mainModule = require('./');
module.exports = mainModule.Utils.extend(mainModule, {
  node: {

    NodeVanillaGateway: require('./src/gateway/node-vanilla-gateway')

  }
});

},{"./":1,"./src/gateway/node-vanilla-gateway":8}],3:[function(require,module,exports){
'use strict';

var Utils = require('./utils');
var Gateway = require('./gateway');

module.exports = function (methods) {
  var newGateway = function newGateway() {
    this.init && this.init();
    return Gateway.apply(this, arguments);
  };

  newGateway.prototype = Utils.extend({}, Gateway.prototype, methods);
  return newGateway;
};

},{"./gateway":6,"./utils":11}],4:[function(require,module,exports){
"use strict";

module.exports = {
  USE_PROMISES: false
};

},{}],5:[function(require,module,exports){
'use strict';

var Mapper = require('./mapper');
var VanillaGateway = require('./gateway/vanilla-gateway');

module.exports = function (manifest, gateway, bodyAttr) {
  return new Mapper(manifest, gateway || VanillaGateway, bodyAttr || 'body').build();
};

},{"./gateway/vanilla-gateway":9,"./mapper":10}],6:[function(require,module,exports){
'use strict';

var Utils = require('./utils');

/**
 * Gateway constructor
 * @param args {Object} with url, method, params and opts
 *
 * * url: The full url of the resource, including host and query strings
 * * host: The resolved host
 * * path: The resolved path (e.g. /path?a=true&b=3)
 * * method: The name of the HTTP method (get, head, post, put, delete and patch)
 *           to be used, in lower case.
 * * params: request params (query strings, url params and body)
 * * opts: gateway implementation specific options
 */
var Gateway = function Gateway(args) {
  this.url = args.url;
  this.host = args.host;
  this.path = args.path;
  this.params = args.params || {};

  this.method = args.method;
  this.body = args.body;
  this.processor = args.processor;
  this.opts = args.opts || {};

  this.timeStart = null;
  this.timeEnd = null;
  this.timeElapsed = null;

  this.successCallback = Utils.noop;
  this.failCallback = Utils.noop;
  this.completeCallback = Utils.noop;
};

Gateway.prototype = {

  call: function call() {
    this.timeStart = Utils.performanceNow();
    this[this.method].apply(this, arguments);
    return this;
  },

  promisify: function promisify(thenCallback) {
    var promise = new Promise((function (resolve, reject) {
      this.success(function (data, stats) {
        resolve({ data: data, stats: stats });
      });
      this.fail(function () {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
          args.push(arguments[i]);
        }

        var request = args.shift();
        reject({ request: request, err: args });
      });

      this.call();
    }).bind(this));

    if (thenCallback !== undefined) return promise.then(thenCallback);
    return promise;
  },

  success: function success(callback) {
    this.successCallback = (function (data, extraStats) {
      this.timeEnd = Utils.performanceNow();
      this.timeElapsed = this.timeEnd - this.timeStart;
      if (this.processor) data = this.processor(data);
      var requestedResource = this.getRequestedResource();

      var stats = Utils.extend({
        timeElapsed: this.timeElapsed,
        timeElapsedHumanized: Utils.humanizeTimeElapsed(this.timeElapsed)
      }, requestedResource, extraStats);

      callback(data, stats);
    }).bind(this);

    return this;
  },

  fail: function fail(callback) {
    this.failCallback = (function () {
      var args = [this.getRequestedResource()];

      // remember, `arguments` isn't an array
      for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
      }

      callback.apply(this, args);
    }).bind(this);

    return this;
  },

  complete: function complete(callback) {
    this.completeCallback = callback;
    return this;
  },

  getRequestedResource: function getRequestedResource() {
    return {
      url: this.url,
      host: this.host,
      path: this.path,
      params: this.params
    };
  },

  shouldEmulateHTTP: function shouldEmulateHTTP(method) {
    return !!(this.opts.emulateHTTP && /^(delete|put|patch)/i.test(method));
  },

  get: function get() {
    throw new Utils.Exception('Gateway#get not implemented');
  },

  post: function post() {
    throw new Utils.Exception('Gateway#post not implemented');
  },

  put: function put() {
    throw new Utils.Exception('Gateway#put not implemented');
  },

  'delete': function _delete() {
    throw new Utils.Exception('Gateway#delete not implemented');
  },

  patch: function patch() {
    throw new Utils.Exception('Gateway#patch not implemented');
  }

};

module.exports = Gateway;

},{"./utils":11}],7:[function(require,module,exports){
'use strict';

var Utils = require('../utils');
var CreateGateway = require('../create-gateway');

var JQueryGateway = CreateGateway({

  init: function init() {
    if (window.jQuery === undefined) {
      throw new Utils.Exception('JQueryGateway requires jQuery but it was not found! ' + 'Change the gateway implementation or add jQuery on the page');
    }
  },

  get: function get() {
    this._jQueryAjax(this.opts);
    return this;
  },

  post: function post() {
    return this._performRequest('POST');
  },

  put: function put() {
    return this._performRequest('PUT');
  },

  patch: function patch() {
    return this._performRequest('PATCH');
  },

  'delete': function _delete() {
    return this._performRequest('DELETE');
  },

  _performRequest: function _performRequest(method) {
    var requestMethod = method;

    if (this.shouldEmulateHTTP(method)) {
      requestMethod = 'POST';
      this.body = this.body || {};
      if (typeof this.body === 'object') this.body._method = method;
      this.opts.headers = Utils.extend({ 'X-HTTP-Method-Override': method }, this.opts.headers);
    }

    var defaults = { type: requestMethod, data: Utils.params(this.body) };
    this._jQueryAjax(Utils.extend(defaults, this.opts));
    return this;
  },

  _jQueryAjax: function _jQueryAjax(config) {
    jQuery.ajax(Utils.extend({ url: this.url }, config)).done((function () {
      this.successCallback(arguments[0]);
    }).bind(this)).fail((function () {
      this.failCallback.apply(this, arguments);
    }).bind(this)).always((function () {
      this.completeCallback.apply(this, arguments);
    }).bind(this));
  }

});

module.exports = JQueryGateway;

},{"../create-gateway":3,"../utils":11}],8:[function(require,module,exports){
'use strict';

var Utils = require('../utils');
var CreateGateway = require('../create-gateway');

var url = require('url');
var http = require('http');
var https = require('https');

var NodeVanillaGateway = CreateGateway({

  performRequest: function performRequest(method) {
    var defaults = url.parse(this.url);
    var emulateHTTP = this.shouldEmulateHTTP(method);

    var requestMethod = emulateHTTP ? 'post' : method;
    var opts = Utils.extend({ method: requestMethod }, defaults, this.opts);
    var canIncludeBody = !/get/i.test(method);

    if (emulateHTTP) {
      this.body = this.body || {};
      if (typeof this.body === 'object') this.body._method = method;
      opts.headers = Utils.extend({}, {
        'X-HTTP-Method-Override': method
      }, opts.headers);
    }

    var body = this.body ? Utils.params(this.body) : '';

    if (canIncludeBody) {
      opts.headers = Utils.extend({}, {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': body.length
      }, opts.headers);
    }

    if (defaults.protocol === 'https:') {
      var handler = https;
    } else {
      handler = http;
    }
    var request = handler.request(opts, this.onResponse.bind(this));
    request.on('error', this.onError.bind(this));

    if (body) request.write(body);
    request.end();
  },

  onResponse: function onResponse(response) {
    var data = '';
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      data += chunk;
    });
    response.on('end', (function () {

      try {
        if (response.statusCode >= 200 && response.statusCode < 400) {
          if (this.isContentTypeJSON(response)) data = JSON.parse(data);
          this.successCallback(data);
        } else {
          this.failCallback(response);
        }
      } catch (e) {
        this.failCallback(response, e);
      } finally {
        this.completeCallback(data, response);
      }
    }).bind(this));
  },

  onError: function onError() {
    this.failCallback.apply(this, arguments);
    this.completeCallback.apply(this, arguments);
  },

  isContentTypeJSON: function isContentTypeJSON(response) {
    return (/application\/json/.test(response.headers['content-type'])
    );
  },

  get: function get() {
    this.performRequest('GET');
  },

  post: function post() {
    this.performRequest('POST');
  },

  put: function put() {
    this.performRequest('PUT');
  },

  'delete': function _delete() {
    this.performRequest('DELETE');
  },

  patch: function patch() {
    this.performRequest('PATCH');
  }

});

module.exports = NodeVanillaGateway;

},{"../create-gateway":3,"../utils":11,"http":undefined,"https":undefined,"url":undefined}],9:[function(require,module,exports){
'use strict';

var Utils = require('../utils');
var CreateGateway = require('../create-gateway');

var VanillaGateway = CreateGateway({

  get: function get() {
    var request = new XMLHttpRequest();
    this._configureCallbacks(request);
    request.open('GET', this.url, true);
    request.send();
  },

  post: function post() {
    this._performRequest('POST');
  },

  put: function put() {
    this._performRequest('PUT');
  },

  patch: function patch() {
    this._performRequest('PATCH');
  },

  'delete': function _delete() {
    this._performRequest('DELETE');
  },

  _performRequest: function _performRequest(method) {
    var emulateHTTP = this.shouldEmulateHTTP(method);
    var requestMethod = method;
    var request = new XMLHttpRequest();
    this._configureCallbacks(request);

    if (emulateHTTP) {
      this.body = this.body || {};
      if (typeof this.body === 'object') this.body._method = method;
      requestMethod = 'POST';
    }

    request.open(requestMethod, this.url, true);
    if (emulateHTTP) request.setRequestHeader('X-HTTP-Method-Override', method);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    var args = [];
    if (this.body !== undefined) {
      args.push(Utils.params(this.body));
    }

    request.send.apply(request, args);
  },

  _configureCallbacks: function _configureCallbacks(request) {
    request.onload = (function () {
      var data = null;

      try {
        if (request.status >= 200 && request.status < 400) {
          if (this._isContentTypeJSON(request)) {
            data = JSON.parse(request.responseText);
          } else {
            data = request.responseText;
          }

          this.successCallback(data);
        } else {
          this.failCallback(request);
        }
      } catch (e) {
        this.failCallback(request);
      } finally {
        this.completeCallback(data, request);
      }
    }).bind(this);

    request.onerror = (function () {
      this.failCallback.apply(this, arguments);
      this.completeCallback.apply(this, arguments);
    }).bind(this);

    if (this.opts.configure) {
      this.opts.configure(request);
    }
  },

  _isContentTypeJSON: function _isContentTypeJSON(request) {
    return (/application\/json/.test(request.getResponseHeader('Content-Type'))
    );
  }

});

module.exports = VanillaGateway;

},{"../create-gateway":3,"../utils":11}],10:[function(require,module,exports){
'use strict';

var Utils = require('./utils');
var Env = require('./env');

/**
 * Mapper constructor
 * @param manifest {Object} with host and resources
 * @param gateway {Object} with an implementation of {Mappersmith.Gateway}
 * @param bodyAttr {String}, name of the body attribute used for HTTP methods
 *        such as POST and PUT
 */
var Mapper = function Mapper(manifest, Gateway, bodyAttr) {
  this.manifest = manifest;
  this.rules = this.manifest.rules || [];
  this.Gateway = Gateway;
  this.bodyAttr = bodyAttr;
};

Mapper.prototype = {

  build: function build() {
    return Object.keys(this.manifest.resources || {}).map((function (name) {
      return this.buildResource(name);
    }).bind(this)).reduce(function (context, resource) {
      context[resource.name] = resource.methods;
      return context;
    }, {});
  },

  buildResource: function buildResource(resourceName) {
    var methods = this.manifest.resources[resourceName];
    return Object.keys(methods).reduce((function (context, methodName) {

      var descriptor = methods[methodName];

      // Compact Syntax
      if (typeof descriptor === 'string') {
        var compactDefinitionMethod = descriptor.match(/^(get|post|delete|put|patch):(.*)/);
        if (compactDefinitionMethod != null) {
          descriptor = { method: compactDefinitionMethod[1], path: compactDefinitionMethod[2] };
        } else {
          descriptor = { method: 'get', path: descriptor };
        }
      }

      descriptor.method = (descriptor.method || 'get').toLowerCase();
      context.methods[methodName] = this.newGatewayRequest(descriptor);
      return context;
    }).bind(this), { name: resourceName, methods: {} });
  },

  resolvePath: function resolvePath(pathDefinition, urlParams) {
    // using `Utils.extend` avoids undesired changes to `urlParams`
    var params = Utils.extend({}, urlParams);
    var resolvedPath = pathDefinition;

    // does not includes the body param into the URL
    delete params[this.bodyAttr];

    Object.keys(params).forEach(function (key) {
      var value = params[key];
      var pattern = '\{' + key + '\}';

      if (new RegExp(pattern).test(resolvedPath)) {
        resolvedPath = resolvedPath.replace('\{' + key + '\}', value);
        delete params[key];
      }
    });

    var paramsString = Utils.params(params);
    if (paramsString.length !== 0) {
      paramsString = '?' + paramsString;
    }

    return resolvedPath + paramsString;
  },

  resolveHost: function resolveHost(value) {
    if (typeof value === "undefined" || value === null) value = this.manifest.host;
    if (value === false) value = '';
    return value.replace(/\/$/, '');
  },

  newGatewayRequest: function newGatewayRequest(descriptor) {
    var rules = this.rules.filter(function (rule) {
      return rule.match === undefined || rule.match.test(descriptor.path);
    }).reduce(function (context, rule) {
      var mergedGateway = Utils.extend(context.gateway, rule.values.gateway);
      context = Utils.extend(context, rule.values);
      context.gateway = mergedGateway;
      return context;
    }, {});

    return (function (params, callback, opts) {
      if (typeof params === 'function') {
        opts = callback;
        callback = params;
        params = undefined;
      }

      if (!!descriptor.params) {
        params = Utils.extend({}, descriptor.params, params);
      }

      opts = Utils.extend({}, opts, rules.gateway);
      if (Utils.isObjEmpty(opts)) opts = undefined;

      var host = this.resolveHost(descriptor.host);
      var path = this.resolvePath(descriptor.path, params);

      if (host !== '') {
        path = /^\//.test(path) ? path : '/' + path;
      }

      var fullUrl = host + path;
      var body = (params || {})[this.bodyAttr];

      var gatewayOpts = Utils.extend({}, {
        url: fullUrl,
        host: host,
        path: path,
        params: params,

        body: body,
        method: descriptor.method,

        processor: descriptor.processor || rules.processor,
        opts: opts
      });

      var gateway = new this.Gateway(gatewayOpts);
      if (Env.USE_PROMISES) return gateway.promisify(callback);
      return gateway.success(callback).call();
    }).bind(this);
  }

};

module.exports = Mapper;

},{"./env":4,"./utils":11}],11:[function(require,module,exports){
'use strict';

if (typeof window !== 'undefined' && window !== null) {
  window.performance = window.performance || {};
  performance.now = (function () {
    return performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function () {
      return new Date().getTime();
    };
  })();
}

// avoid browserify shim
var _process;
try {
  _process = eval("process");
} catch (e) {}

var hasProcessHrtime = function hasProcessHrtime() {
  return typeof _process !== 'undefined' && _process !== null && _process.hrtime;
};

var getNanoSeconds, loadTime;
if (hasProcessHrtime()) {
  getNanoSeconds = function () {
    var hr = _process.hrtime();
    return hr[0] * 1e9 + hr[1];
  };
  loadTime = getNanoSeconds();
}

var Utils = {
  r20: /%20/g,
  noop: function noop() {},

  isObjEmpty: function isObjEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }

    return true;
  },

  extend: function extend(out) {
    out = out || {};

    for (var i = 1; i < arguments.length; i++) {
      if (!arguments[i]) continue;

      for (var key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key) && arguments[i][key] !== undefined) out[key] = arguments[i][key];
      }
    }

    return out;
  },

  params: function params(entry) {
    if (typeof entry !== 'object') {
      return entry;
    }

    var validKeys = function validKeys(entry) {
      return Object.keys(entry).filter(function (key) {
        return entry[key] !== undefined && entry[key] !== null;
      });
    };

    var buildRecursive = function buildRecursive(key, value, suffix) {
      suffix = suffix || '';
      var isArray = Array.isArray(value);
      var isObject = typeof value === 'object';

      if (!isArray && !isObject) {
        return encodeURIComponent(key + suffix) + '=' + encodeURIComponent(value);
      }

      if (isArray) {
        return value.map(function (v) {
          return buildRecursive(key, v, suffix + '[]');
        }).join('&');
      }

      return validKeys(value).map(function (k) {
        return buildRecursive(key, value[k], suffix + '[' + k + ']');
      }).join('&');
    };

    return validKeys(entry).map(function (key) {
      return buildRecursive(key, entry[key]);
    }).join('&').replace(Utils.r20, '+');
  },

  /*
   * Gives time in miliseconds, but with sub-milisecond precision for Browser
   * and Nodejs
   */
  performanceNow: function performanceNow() {
    if (hasProcessHrtime()) {
      return (getNanoSeconds() - loadTime) / 1e6;
    }

    return performance.now();
  },

  humanizeTimeElapsed: function humanizeTimeElapsed(timeElapsed) {
    if (timeElapsed >= 1000.0) {
      return (timeElapsed / 1000.0).toFixed(2) + ' s';
    }

    return timeElapsed.toFixed(2) + ' ms';
  },

  Exception: function Exception(message) {
    this.message = message;
    this.toString = function () {
      return '[Mappersmith] ' + this.message;
    };
  }
};

module.exports = Utils;

},{}],12:[function(require,module,exports){
;(function () {

  var object = typeof exports != 'undefined' ? exports : this; // #8: web workers
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  function InvalidCharacterError(message) {
    this.message = message;
  }
  InvalidCharacterError.prototype = new Error;
  InvalidCharacterError.prototype.name = 'InvalidCharacterError';

  // encoder
  // [https://gist.github.com/999166] by [https://github.com/nignag]
  object.btoa || (
  object.btoa = function (input) {
    var str = String(input);
    for (
      // initialize result and counter
      var block, charCode, idx = 0, map = chars, output = '';
      // if the next str index does not exist:
      //   change the mapping table to "="
      //   check if d has no fractional digits
      str.charAt(idx | 0) || (map = '=', idx % 1);
      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = str.charCodeAt(idx += 3/4);
      if (charCode > 0xFF) {
        throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  });

  // decoder
  // [https://gist.github.com/1020396] by [https://github.com/atk]
  object.atob || (
  object.atob = function (input) {
    var str = String(input).replace(/=+$/, '');
    if (str.length % 4 == 1) {
      throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (
      // initialize result and counters
      var bc = 0, bs, buffer, idx = 0, output = '';
      // get next character
      buffer = str.charAt(idx++);
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        // and if not first of each 4 characters,
        // convert the first 8 bits to one ascii character
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      // try to find character in table (0-63, not found => -1)
      buffer = chars.indexOf(buffer);
    }
    return output;
  });

}());

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Mapper = require('./Mapper');

var _Folder = require('./Folder');

var _Folder2 = _interopRequireDefault(_Folder);

var _Feed = require('./Feed');

var _Feed2 = _interopRequireDefault(_Feed);

var _Status = require('./Status');

var _Status2 = _interopRequireDefault(_Status);

var _ResultParser = require('./ResultParser');

var Client = (function () {
	function Client(endpoint, user, pass) {
		_classCallCheck(this, Client);

		this.client = (0, _Mapper.getClient)('http://localhost/owncloud', 'test', 'test');
	}

	_createClass(Client, [{
		key: 'listFolders',
		value: function listFolders() {
			var result;
			return regeneratorRuntime.async(function listFolders$(context$2$0) {
				var _this = this;

				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return regeneratorRuntime.awrap(this.client.Folder.all());

					case 2:
						result = context$2$0.sent;
						return context$2$0.abrupt('return', result.data.folders.map(function (folder) {
							return new _Folder2['default'](folder.id, folder.name, _this.client);
						}));

					case 4:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}
	}, {
		key: 'newFolder',
		value: function newFolder(name) {
			var result, folder;
			return regeneratorRuntime.async(function newFolder$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return regeneratorRuntime.awrap(this.client.Folder.newFolder({
							name: name
						}));

					case 2:
						result = context$2$0.sent;
						folder = result.data.folders[0];
						return context$2$0.abrupt('return', new _Folder2['default'](folder.id, folder.name, this.client));

					case 5:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}
	}, {
		key: 'listFeeds',
		value: function listFeeds() {
			var result;
			return regeneratorRuntime.async(function listFeeds$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return regeneratorRuntime.awrap(this.client.Feed.all());

					case 2:
						result = context$2$0.sent;
						return context$2$0.abrupt('return', result.data.feeds.map(_ResultParser.feedFromResult.bind(this, this.client)));

					case 4:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}
	}, {
		key: 'newFeed',
		value: function newFeed(url) {
			var folderId = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
			var result;
			return regeneratorRuntime.async(function newFeed$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return regeneratorRuntime.awrap(this.client.Feed.newFeed({
							url: url,
							folderId: folderId
						}));

					case 2:
						result = context$2$0.sent;
						return context$2$0.abrupt('return', (0, _ResultParser.feedFromResult)(this.client, result.data.feeds[0]));

					case 4:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}
	}, {
		key: 'getVersion',
		value: function getVersion() {
			var result;
			return regeneratorRuntime.async(function getVersion$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return regeneratorRuntime.awrap(this.client.Status.version());

					case 2:
						result = context$2$0.sent;
						return context$2$0.abrupt('return', result.data.version);

					case 4:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}
	}, {
		key: 'getStatus',
		value: function getStatus() {
			var result;
			return regeneratorRuntime.async(function getStatus$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return regeneratorRuntime.awrap(this.client.Status.get());

					case 2:
						result = context$2$0.sent;
						return context$2$0.abrupt('return', new _Status2['default'](result.data.version, result.data.warnings));

					case 4:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}
	}, {
		key: 'getItems',
		value: function getItems() {
			var size = arguments.length <= 0 || arguments[0] === undefined ? 20 : arguments[0];
			var offset = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			var getRead = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];
			var oldestFirst = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
			var result;
			return regeneratorRuntime.async(function getItems$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return regeneratorRuntime.awrap(this.client.Item.list({
							size: size,
							offset: offset,
							getRead: getRead,
							oldestFirst: oldestFirst,
							type: 3, // All
							id: 0
						}));

					case 2:
						result = context$2$0.sent;
						return context$2$0.abrupt('return', result.data.items.map(_ResultParser.itemFromResult.bind(this, this.client)));

					case 4:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}
	}, {
		key: 'getStarredItems',
		value: function getStarredItems() {
			var size = arguments.length <= 0 || arguments[0] === undefined ? 20 : arguments[0];
			var offset = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			var getRead = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];
			var oldestFirst = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
			var result;
			return regeneratorRuntime.async(function getStarredItems$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return regeneratorRuntime.awrap(this.client.Item.list({
							size: size,
							offset: offset,
							getRead: getRead,
							oldestFirst: oldestFirst,
							type: 2, // Starred
							id: 0
						}));

					case 2:
						result = context$2$0.sent;
						return context$2$0.abrupt('return', result.data.items.map(_ResultParser.itemFromResult.bind(this, this.client)));

					case 4:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}
	}, {
		key: 'getNewItems',
		value: function getNewItems(lastModified) {
			var result;
			return regeneratorRuntime.async(function getNewItems$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return regeneratorRuntime.awrap(this.client.Item.list({
							lastModified: lastModified,
							type: 3, // All
							id: 0
						}));

					case 2:
						result = context$2$0.sent;
						return context$2$0.abrupt('return', result.data.items.map(_ResultParser.itemFromResult.bind(this, this.client)));

					case 4:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}
	}]);

	return Client;
})();

exports['default'] = Client;
module.exports = exports['default'];

},{"./Feed":14,"./Folder":15,"./Mapper":17,"./ResultParser":18,"./Status":19}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ResultParser = require('./ResultParser');

var Feed = (function () {
	function Feed(id, url, title, faviconLink, added, folderId, unreadCount, ordering, link, pinned, client) {
		_classCallCheck(this, Feed);

		this.id = id;
		this.url = url;
		this.title = title;
		this.faviconLink = faviconLink;
		this.added = added;
		this.folderId = folderId;
		this.unreadCount = unreadCount;
		this.ordering = ordering;
		this.link = link;
		this.pinned = pinned;
		this.client = client;
	}

	_createClass(Feed, [{
		key: 'move',
		value: function move(folderId) {
			this.folderId = folderId;
			return this.client.Feed.move({
				id: this.id,
				folderId: folderId
			});
		}
	}, {
		key: 'rename',
		value: function rename(newTitle) {
			this.title = newTitle;
			return this.client.Feed.rename({
				id: this.id,
				feedTitle: newTitle
			});
		}
	}, {
		key: 'markAsRead',
		value: function markAsRead(newestItemId) {
			return this.client.Feed.markAsRead({
				id: this.id,
				newestItemId: newestItemId
			});
		}
	}, {
		key: 'delete',
		value: function _delete() {
			return this.client.Feed['delete']({
				id: this.id
			});
		}
	}, {
		key: 'getItems',
		value: function getItems() {
			var size = arguments.length <= 0 || arguments[0] === undefined ? 20 : arguments[0];
			var offset = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			var getRead = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];
			var oldestFirst = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
			var result;
			return regeneratorRuntime.async(function getItems$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return regeneratorRuntime.awrap(this.client.Item.list({
							size: size,
							offset: offset,
							getRead: getRead,
							oldestFirst: oldestFirst,
							type: 0, // Feed
							id: this.id
						}));

					case 2:
						result = context$2$0.sent;
						return context$2$0.abrupt('return', result.data.items.map(_ResultParser.itemFromResult.bind(this, this.client)));

					case 4:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}
	}, {
		key: 'getNewItems',
		value: function getNewItems(lastModified) {
			var result;
			return regeneratorRuntime.async(function getNewItems$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return regeneratorRuntime.awrap(this.client.Item.list({
							lastModified: lastModified,
							type: 0,
							id: this.id
						}));

					case 2:
						result = context$2$0.sent;
						return context$2$0.abrupt('return', result.data.items.map(_ResultParser.itemFromResult.bind(this, this.client)));

					case 4:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}
	}]);

	return Feed;
})();

exports['default'] = Feed;
module.exports = exports['default'];

},{"./ResultParser":18}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ResultParser = require('./ResultParser');

var Folder = (function () {
	function Folder(id, name, client) {
		_classCallCheck(this, Folder);

		this.id = id;
		this.name = name;
		this.client = client;
	}

	_createClass(Folder, [{
		key: 'rename',
		value: function rename(newName) {
			this.name = newName;
			return this.client.Folder.rename({
				id: this.id,
				name: newName
			});
		}
	}, {
		key: 'markAsRead',
		value: function markAsRead(newestItemId) {
			return this.client.Folder.markAsRead({
				id: this.id,
				newestItemId: newestItemId
			});
		}
	}, {
		key: 'delete',
		value: function _delete() {
			return this.client.Folder['delete']({
				id: this.id
			});
		}
	}, {
		key: 'listFeeds',
		value: function listFeeds() {
			var result, feeds;
			return regeneratorRuntime.async(function listFeeds$(context$2$0) {
				var _this = this;

				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return regeneratorRuntime.awrap(this.client.Feed.all());

					case 2:
						result = context$2$0.sent;
						feeds = result.data.feeds.map(_ResultParser.feedFromResult.bind(this, this.client));
						return context$2$0.abrupt('return', feeds.filter(function (feed) {
							return feed.folderId === _this.id;
						}));

					case 5:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}
	}, {
		key: 'getItems',
		value: function getItems() {
			var size = arguments.length <= 0 || arguments[0] === undefined ? 20 : arguments[0];
			var offset = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			var getRead = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];
			var oldestFirst = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
			var result;
			return regeneratorRuntime.async(function getItems$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return regeneratorRuntime.awrap(this.client.Item.list({
							size: size,
							offset: offset,
							getRead: getRead,
							oldestFirst: oldestFirst,
							type: 1, // Folder
							id: this.id
						}));

					case 2:
						result = context$2$0.sent;
						return context$2$0.abrupt('return', result.data.items.map(_ResultParser.itemFromResult.bind(this, this.client)));

					case 4:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}
	}, {
		key: 'getNewItems',
		value: function getNewItems(lastModified) {
			var result;
			return regeneratorRuntime.async(function getNewItems$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return regeneratorRuntime.awrap(this.client.Item.list({
							lastModified: lastModified,
							type: 1,
							id: this.id
						}));

					case 2:
						result = context$2$0.sent;
						return context$2$0.abrupt('return', result.data.items.map(_ResultParser.itemFromResult.bind(this, this.client)));

					case 4:
					case 'end':
						return context$2$0.stop();
				}
			}, null, this);
		}
	}]);

	return Folder;
})();

exports['default'] = Folder;
module.exports = exports['default'];

},{"./ResultParser":18}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Item = (function () {
	function Item(id, guid, guidHash, url, title, author, pubDate, body, enclosureMime, enclosureLink, feedId, unread, starred, lastModified, client) {
		_classCallCheck(this, Item);

		this.id = id;
		this.guid = guid;
		this.guidHash = guidHash;
		this.url = url;
		this.title = title;
		this.author = author;
		this.pubDate = pubDate;
		this.body = body;
		this.enclosureMime = enclosureMime;
		this.enclosureLink = enclosureLink;
		this.feedId = feedId;
		this.unread = unread;
		this.starred = starred;
		this.lastModified = lastModified;
		this.client = client;
	}

	_createClass(Item, [{
		key: "markAsRead",
		value: function markAsRead() {
			this.unread = false;
			return this.client.Item.markAsRead({
				id: this.id
			});
		}
	}, {
		key: "markAsUnread",
		value: function markAsUnread() {
			this.unread = true;
			return this.client.Item.markAsUnread({
				id: this.id
			});
		}
	}, {
		key: "markAsStarred",
		value: function markAsStarred() {
			this.starred = true;
			return this.client.Item.markAsStarred({
				feedId: this.feedId,
				guidHash: this.guidHash
			});
		}
	}, {
		key: "markAsUnstarred",
		value: function markAsUnstarred() {
			this.starred = true;
			return this.client.Item.markAsUnstarred({
				feedId: this.feedId,
				guidHash: this.guidHash
			});
		}
	}]);

	return Item;
})();

exports["default"] = Item;
module.exports = exports["default"];

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.getClient = getClient;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mappersmithNode = require('mappersmith/node');

var _mappersmithNode2 = _interopRequireDefault(_mappersmithNode);

var _Base64 = require('Base64');

_mappersmithNode2['default'].Env.USE_PROMISES = true;

var resources = require('./resources.json');

function getClient(base, user, password) {
	var manifest = {
		host: base + '/index.php/apps/news/api/v1-2/',
		resources: resources,
		rules: [{
			values: {
				gateway: {
					headers: {
						Authorization: 'Basic ' + (0, _Base64.btoa)(user + ':' + password)
					}
				}
			}
		}]
	};
	var gateway = typeof document !== 'undefined' ? _mappersmithNode2['default'].VanillaGateway : _mappersmithNode2['default'].node.NodeVanillaGateway;
	return _mappersmithNode2['default'].forge(manifest, gateway);
}

},{"./resources.json":20,"Base64":12,"mappersmith/node":2}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.feedFromResult = feedFromResult;
exports.itemFromResult = itemFromResult;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Feed = require('./Feed');

var _Feed2 = _interopRequireDefault(_Feed);

var _Item = require('./Item');

var _Item2 = _interopRequireDefault(_Item);

function feedFromResult(client, feed) {
	return new _Feed2['default'](feed.id, feed.url, feed.title, feed.faviconLink, feed.added, feed.folderId, feed.unreadCount, feed.ordering, feed.link, feed.pinned, client);
}

function itemFromResult(client, item) {
	return new _Item2['default'](item.id, item.guid, item.guidHash, item.url, item.title, item.author, item.pubDate, item.body, item.enclosureMime, item.enclosureLink, item.feedId, item.unread, item.starred, item.lastModifed, client);
}

},{"./Feed":14,"./Item":16}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Status = function Status(version, warnings) {
	_classCallCheck(this, Status);

	this.version = version;
	this.improperlyConfiguredCron = warnings.improperlyConfiguredCron;
};

exports["default"] = Status;
module.exports = exports["default"];

},{}],20:[function(require,module,exports){
module.exports={
  "Folder": {
    "all": {
      "path": "/folders"
    },
    "byId": {
      "path": "/folders/{id}"
    },
    "rename": {
      "method": "PUT",
      "path": "/folders/{id}"
    },
    "markAsRead": {
      "method": "PUT",
      "path": "/folders/{id}/read"
    },
    "delete": {
      "method": "DELETE",
      "path": "/folders/{id}"
    },
    "newFolder": {
      "method": "POST",
      "path": "/folders"
    }
  },
  "Feed": {
    "all": {
      "path": "/feeds"
    },
    "newFeed": {
      "method": "POST",
      "path": "/feeds"
    },
    "delete": {
      "method": "DELETE",
      "path": "/feeds/{id}"
    },
    "move": {
      "method": "PUT",
      "path": "/feeds/{id}/move"
    },
    "rename": {
      "method": "PUT",
      "path": "/feeds/{id}/rename"
    },
    "markAsRead": {
      "method": "PUT",
      "path": "/feeds/{id}/read"
    }
  },
  "Status": {
    "version": {
      "path": "/version"
    },
    "get": {
      "path": "/status"
    }
  },
  "Item": {
    "list": {
      "path": "/items"
    },
    "updated": {
      "path": "/items/updated"
    },
    "markAsRead": {
      "method": "PUT",
      "path": "/items/{id}/read"
    },
    "markAsUnread": {
      "method": "PUT",
      "path": "/items/{id}/unread"
    },
    "markMultipleAsRead": {
      "method": "PUT",
      "path": "/items/read/multiple"
    },
    "markMultipleAsUnread": {
      "method": "PUT",
      "path": "/items/unread/multiple"
    },
    "markAsStarred": {
      "method": "PUT",
      "path": "/items/{feedId}/{guidHash}/star"
    },
    "markAsUnstarred": {
      "method": "PUT",
      "path": "/items/{feedId}/{guidHash}/unstar"
    },
    "markMultipleAsStarred": {
      "method": "PUT",
      "path": "/items/star/multiple"
    },
    "markMultipleAsUnstarred": {
      "method": "PUT",
      "path": "/items/unstar/multiple"
    },
    "markAllAsRead": {
      "method": "PUT",
      "path": "/items/read"
    }
  }
}

},{}]},{},[13]);

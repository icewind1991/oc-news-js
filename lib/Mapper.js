'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.getClient = getClient;

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
'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

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

		this.client = (0, _Mapper.getClient)(endpoint, user, pass);
	}

	_createClass(Client, [{
		key: 'listFolders',
		value: function listFolders() {
			var result;
			return _regeneratorRuntime.async(function listFolders$(context$2$0) {
				var _this = this;

				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return _regeneratorRuntime.awrap(this.client.Folder.all());

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
			return _regeneratorRuntime.async(function newFolder$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return _regeneratorRuntime.awrap(this.client.Folder.newFolder({
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
			return _regeneratorRuntime.async(function listFeeds$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return _regeneratorRuntime.awrap(this.client.Feed.all());

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
			return _regeneratorRuntime.async(function newFeed$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return _regeneratorRuntime.awrap(this.client.Feed.newFeed({
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
			return _regeneratorRuntime.async(function getVersion$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return _regeneratorRuntime.awrap(this.client.Status.version());

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
			return _regeneratorRuntime.async(function getStatus$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return _regeneratorRuntime.awrap(this.client.Status.get());

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
			return _regeneratorRuntime.async(function getItems$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return _regeneratorRuntime.awrap(this.client.Item.list({
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
			return _regeneratorRuntime.async(function getStarredItems$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return _regeneratorRuntime.awrap(this.client.Item.list({
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
			return _regeneratorRuntime.async(function getNewItems$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return _regeneratorRuntime.awrap(this.client.Item.list({
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
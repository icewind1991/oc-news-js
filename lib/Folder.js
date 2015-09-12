'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

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
			return _regeneratorRuntime.async(function listFeeds$(context$2$0) {
				var _this = this;

				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return _regeneratorRuntime.awrap(this.client.Feed.all());

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
			return _regeneratorRuntime.async(function getItems$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return _regeneratorRuntime.awrap(this.client.Item.list({
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
			return _regeneratorRuntime.async(function getNewItems$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return _regeneratorRuntime.awrap(this.client.Item.list({
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
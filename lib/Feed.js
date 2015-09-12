'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

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
			return _regeneratorRuntime.async(function getItems$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return _regeneratorRuntime.awrap(this.client.Item.list({
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
			return _regeneratorRuntime.async(function getNewItems$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						context$2$0.next = 2;
						return _regeneratorRuntime.awrap(this.client.Item.list({
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
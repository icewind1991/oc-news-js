"use strict";

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

Object.defineProperty(exports, "__esModule", {
	value: true
});

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
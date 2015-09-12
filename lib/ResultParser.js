'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.feedFromResult = feedFromResult;
exports.itemFromResult = itemFromResult;

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
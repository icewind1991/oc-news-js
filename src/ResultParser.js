import Feed from './Feed';
import Item from './Item';

export function feedFromResult (client, feed) {
	return new Feed(
		feed.id,
		feed.url,
		feed.title,
		feed.faviconLink,
		feed.added,
		feed.folderId,
		feed.unreadCount,
		feed.ordering,
		feed.link,
		feed.pinned,
		client
	);
}

export function itemFromResult (client, item) {
	return new Item(
		item.id,
		item.guid,
		item.guidHash,
		item.url,
		item.title,
		item.author,
		item.pubDate,
		item.body,
		item.enclosureMime,
		item.enclosureLink,
		item.feedId,
		item.unread,
		item.starred,
		item.lastModifed,
		client
	);
}

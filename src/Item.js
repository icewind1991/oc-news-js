export default class Item {
	constructor (id, guid, guidHash, url, title, author, pubDate, body, enclosureMime, enclosureLink, feedId, unread, starred, lastModified, client) {
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

	markAsRead () {
		this.unread = false;
		return this.client.Item.markAsRead({
			id: this.id
		});
	}

	markAsUnread () {
		this.unread = true;
		return this.client.Item.markAsUnread({
			id: this.id
		});
	}

	markAsStarred () {
		this.starred = true;
		return this.client.Item.markAsStarred({
			feedId: this.feedId,
			guidHash: this.guidHash
		})
	}

	markAsUnstarred () {
		this.starred = true;
		return this.client.Item.markAsUnstarred({
			feedId: this.feedId,
			guidHash: this.guidHash
		})
	}
}

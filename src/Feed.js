import {itemFromResult} from './ResultParser'

export default class Feed {
	constructor (id, url, title, faviconLink, added, folderId, unreadCount, ordering, link, pinned, client) {
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

	move (folderId) {
		this.folderId = folderId;
		return this.client.Feed.move({
			id: this.id,
			folderId: folderId
		})
	}

	rename (newTitle) {
		this.title = newTitle;
		return this.client.Feed.rename({
			id: this.id,
			feedTitle: newTitle
		})
	}

	markAsRead (newestItemId) {
		return this.client.Feed.markAsRead({
			id: this.id,
			newestItemId: newestItemId
		});
	}

	delete () {
		return this.client.Feed.delete({
			id: this.id
		});
	}

	async getItems (size = 20, offset = null, getRead = true, oldestFirst = false) {
		const result = await this.client.Item.list({
			size: size,
			offset: offset,
			getRead: getRead,
			oldestFirst: oldestFirst,
			type: 0,// Feed
			id: this.id
		});
		return result.data.items.map(itemFromResult.bind(this, this.client));
	}

	async getNewItems (lastModified) {
		const result = await this.client.Item.list({
			lastModified: lastModified,
			type: 0,
			id: this.id
		});
		return result.data.items.map(itemFromResult.bind(this, this.client));
	}
}

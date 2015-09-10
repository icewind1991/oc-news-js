import {feedFromResult, itemFromResult} from './ResultParser';

export default class Folder {
	constructor (id, name, client) {
		this.id = id;
		this.name = name;
		this.client = client;
	}

	rename (newName) {
		this.name = newName;
		return this.client.Folder.rename({
			id: this.id,
			name: newName
		});
	}

	markAsRead (newestItemId) {
		return this.client.Folder.markAsRead({
			id: this.id,
			newestItemId: newestItemId
		});
	}

	delete () {
		return this.client.Folder.delete({
			id: this.id
		});
	}

	async listFeeds () {
		const result = await this.client.Feed.all();
		const feeds = result.data.feeds.map(feedFromResult.bind(this, this.client));
		return feeds.filter(feed => feed.folderId === this.id);
	}

	async getItems (size = 20, offset = null, getRead = true, oldestFirst = false) {
		const result = await this.client.Item.list({
			size: size,
			offset: offset,
			getRead: getRead,
			oldestFirst: oldestFirst,
			type: 1,// Folder
			id: this.id
		});
		return result.data.items.map(itemFromResult.bind(this, this.client));
	}

	async getNewItems (lastModified) {
		const result = await this.client.Item.list({
			lastModified: lastModified,
			type: 1,
			id: this.id
		});
		return result.data.items.map(itemFromResult.bind(this, this.client));
	}
}

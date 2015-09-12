import {getClient} from './Mapper';

import Folder from './Folder';
import Feed from './Feed';
import Status from './Status';

import {feedFromResult, itemFromResult} from './ResultParser'

export default class Client {
	constructor (endpoint, user, pass) {
		this.client = getClient(endpoint, user, pass);
	}

	async listFolders () {
		const result = await this.client.Folder.all();
		return result.data.folders.map(folder => new Folder(folder.id, folder.name, this.client));
	}

	async newFolder (name) {
		const result = await this.client.Folder.newFolder({
			name: name
		});
		const folder = result.data.folders[0];
		return new Folder(folder.id, folder.name, this.client);
	}

	async listFeeds () {
		const result = await this.client.Feed.all();
		return result.data.feeds.map(feedFromResult.bind(this, this.client));
	}

	async newFeed (url, folderId = 0) {
		const result = await this.client.Feed.newFeed({
			url: url,
			folderId: folderId
		});
		return feedFromResult(this.client, result.data.feeds[0]);
	}

	async getVersion () {
		const result = await this.client.Status.version();
		return result.data.version;
	}

	async getStatus () {
		const result = await this.client.Status.get();
		return new Status(result.data.version, result.data.warnings);
	}

	async getItems (size = 20, offset = null, getRead = true, oldestFirst = false) {
		const result = await this.client.Item.list({
			size: size,
			offset: offset,
			getRead: getRead,
			oldestFirst: oldestFirst,
			type: 3,// All
			id: 0
		});
		return result.data.items.map(itemFromResult.bind(this, this.client));
	}

	async getStarredItems (size = 20, offset = null, getRead = true, oldestFirst = false) {
		const result = await this.client.Item.list({
			size: size,
			offset: offset,
			getRead: getRead,
			oldestFirst: oldestFirst,
			type: 2,// Starred
			id: 0
		});
		return result.data.items.map(itemFromResult.bind(this, this.client));
	}

	async getNewItems (lastModified) {
		const result = await this.client.Item.list({
			lastModified: lastModified,
			type: 3,// All
			id: 0
		});
		return result.data.items.map(itemFromResult.bind(this, this.client));
	}
}

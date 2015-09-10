import assert from "assert";

import Client from '../src/Client';
import {clean} from './clean';

const client = new Client('http://localhost/owncloud', 'test', 'test');

const sampleFeed = 'http://www.feedforall.com/sample.xml';

beforeEach(() => {
	return clean(client);
});

describe('Folder', () => {
	describe('#listFolders', () => {
		it('should an empty array if no folders exist', async () => {
			const folders = await client.listFolders();
			assert.equal(0, folders.length);
		});
	});
	describe('#newFolder', () => {
		it('should return the new folder', async () => {
			const folder = await client.newFolder('Foo');
			assert.equal('Foo', folder.name);
		});
		it('should create a folder which shows up in the list', async () => {
			await client.newFolder('Foo');
			const folders = await client.listFolders();
			assert.equal(1, folders.length);
			assert.equal('Foo', folders[0].name);
		});
		it('should fail on duplicate names', async () => {
			await client.newFolder('Foo');
			try {
				await client.newFolder('Foo');
				assert.fail('Expected error');
			} catch (e) {

			}
			const folders = await client.listFolders();
			assert.equal(1, folders.length);
			assert.equal('Foo', folders[0].name);
		});
	});
	describe('#rename', () => {
		it('should set the name on the existing object', async () => {
			const folder = await client.newFolder('Foo');
			await folder.rename('Bar');
			assert.equal('Bar', folder.name);
		});
		it('should give the new name when listing folders', async () => {
			const folder = await client.newFolder('Foo');
			await folder.rename('Bar');
			const folders = await client.listFolders();
			assert.equal(1, folders.length);
			assert.equal('Bar', folders[0].name);
		});
	});
	describe('#delete', () => {
		it('should remove the folder from the list', async () => {
			const folder = await client.newFolder('Foo');
			await folder.delete();
			const folders = await client.listFolders();
			assert.equal(0, folders.length);
		});
	});
	describe('#listFeeds', function () {
		this.timeout(5000);
		it('should not show feeds outside the folder', async () => {
			const folder = await client.newFolder('Foo');
			await client.newFeed(sampleFeed, 0);
			const feeds = await folder.listFeeds();
			assert.equal(0, feeds.length);
		});

		it('should show feeds inside the folder', async () => {
			const folder = await client.newFolder('Foo');
			await client.newFeed(sampleFeed, folder.id);
			const feeds = await folder.listFeeds();
			assert.equal(1, feeds.length);
		});
	});

	describe('#getItems', function () {
		this.timeout(5000);
		it('should not show items of feeds outside the folder', async () => {
			const folder = await client.newFolder('Foo');
			await client.newFeed(sampleFeed, 0);
			const items = await folder.getItems();
			assert.equal(0, items.length);
		});

		it('should show items of feeds inside the folder', async () => {
			const folder = await client.newFolder('Foo');
			await client.newFeed(sampleFeed, folder.id);
			const items = await folder.getItems();
			assert(items.length > 1);
		});
	});

	describe('#getNewItems', function () {
		this.timeout(5000);
		it('should not show new items of feeds outside the folder', async () => {
			const folder = await client.newFolder('Foo');
			await client.newFeed(sampleFeed, 0);
			const items = await folder.getNewItems(500);
			assert.equal(0, items.length);
		});

		it('should show new items of feeds inside the folder', async () => {
			const folder = await client.newFolder('Foo');
			await client.newFeed(sampleFeed, folder.id);
			const items = await folder.getNewItems(500);
			assert(items.length > 1);
		});
	});

	describe('#markAsRead', function () {
		this.timeout(5000);
		it('should not mark items of feeds outside the folder as read', async () => {
			const folder = await client.newFolder('Foo');
			await client.newFeed(sampleFeed, 0);
			await folder.markAsRead(999999999);
			const items = await client.getItems();
			assert(items.length > 1);
			for (let item of items) {
				assert(item.unread === true);
			}
		});

		it('should mark items of feeds inside the folder as read', async () => {
			const folder = await client.newFolder('Foo');
			await client.newFeed(sampleFeed, folder.id);
			await folder.markAsRead(999999999);
			const items = await client.getItems();
			assert(items.length > 1);
			for (let item of items) {
				assert(item.unread === false);
			}
		});
	});
});

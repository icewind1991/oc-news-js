# oc-news-js

Javascript client for the ownCloud news app for node and the browser

# installing

For node or browserify

- `npm install --save oc-news-js`
- `var Client = require('oc-news-js')`

For plain browser usage

- Include `build/news.js` or `build/news.min.js`

# Usage

```js
var client = new Client('https://example.com/owncloud', 'username', 'password');
```

# Structure

- `src/` source files
- `lib/` prebuild files for npm using `npm run build-npm`
- `build/` prebuild files for the browser using `npm run build-browser`, `npm run release` 

# API

All functions return a promise and can also be used with es7 style async/await

- Client
 - `client.listFolders()`: `Promise<Folder[]>`
 - `client.newFolder(name)`: `Promise<Folder>`
 - `client.listFeeds()`: `Promise<Feed[]>`
 - `client.newFeed(url, folderId)`: `Promise<Feed>`
 - `client.getItems(size = 20, offset = null, getRead = true, oldestFirst = false)`: `Promise<Item[]>`
 - `client.getStarredItems(size = 20, offset = null, getRead = true, oldestFirst = false)`: `Promise<Item[]>`
 - `client.getNewItems(lastModifed)`: `Promise<Item[]>`
 - `client.getVersion()`: `Promise<string>`
 - `client.getStatus()`: `Promise<Status>`
- Folder
 - `folder.id`: `int`
 - `folder.name`: `string`
 - `folder.rename(newName)`: `Promise<>`
 - `folder.delete()`: `Promise<>`
 - `folder.markAsRead(newestItemId)`: `Promise<>`
 - `folder.listFeeds()`: `Promise<Feed[]>`
 - `folder.getItems(size = 20, offset = null, getRead = true, oldestFirst = false)`: `Promise<Item[]>`
 - `folder.getNewItems(lastModifed)`: `Promise<Item[]>`
- Feed
 - `feed.id`: `int`
 - `feed.url`: `string`
 - `feed.title`: `string`
 - `feed.favIconLink`: `string`
 - `feed.added`: `int` as unix timestamp
 - `feed.folderId`: `int`
 - `feed.unreadCount`: `int`
 - `feed.ordering`: `int` 0 for default, 1 oldest first, 2 newest first
 - `feed.link`: `string`
 - `feed.pinned`: `bool`
 - `feed.rename(newName)`: `Promise<>`
 - `feed.delete()`: `Promise<>`
 - `feed.move(newFolderId)`: `Promise<>`
 - `feed.markAsRead(newestItemId)`: `Promise<>`
 - `feed.getItems(size = 20, offset = null, getRead = true, oldestFirst = false)`: `Promise<Item[]>`
 - `feed.getNewItems(lastModifed)`: `Promise<Item[]>`
- Item
 - `item.id`: `int`
 - `item.guid`: `string`
 - `item.guidHash`: `string`
 - `item.url`: `string`
 - `item.title`: `string`
 - `item.author`: `string`
 - `item.pubDate`: `int` as unix timestamp
 - `item.body`: `string`
 - `item.enclosureMime`: `string`
 - `item.enclosureLink`: `string`
 - `item.feedId`: `int`
 - `item.unread`: `bool`
 - `item.starred`: `bool`
 - `item.lastModified`: `int` as unix timestamp
 - `item.markAsRead()`: `Promise<>`
 - `item.markAsUnread()`: `Promise<>`
 - `item.markAsStarred()`: `Promise<>`
 - `item.markAsUnstarred()`: `Promise<>`
- Status
 - `status.version`: `string` as `'x.y.z'`
 - `status.improperlyConfiguredCron`: `bool`

Additional information about the meaning of fields, methods or arguments can be find in the [API documentation for the news client](https://github.com/owncloud/news/wiki/API-1.2)

# Example

- Using es6/es7 style syntax:

```js
var client = new Client('http://localhost/owncloud', 'test', 'test');

async function listItems () {
	const items = await client.getItems();
	console.log(items);
}

listItems();
```

- Using es5 style syntax:

```js
var client = new Client('http://localhost/owncloud', 'test', 'test');

client.getItems().then(function (items) {
	console.log(items);
});
```

export async function clean (client) {
	const feeds = await client.listFeeds();
	for (let feed of feeds) {
		await feed.delete();
	}

	const folders = await client.listFolders();
	for (let folder of folders) {
		await folder.delete();
	}
}

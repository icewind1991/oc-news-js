import MapperSmith from 'mappersmith/node';
import {btoa} from 'Base64';

MapperSmith.Env.USE_PROMISES = true;

const resources = require('./resources.json');

export function getClient (base, user, password) {
	const manifest = {
		host: base + '/index.php/apps/news/api/v1-2/',
		resources: resources,
		rules: [
			{
				values: {
					gateway: {
						headers: {
							Authorization: 'Basic ' + btoa(user + ':' + password)
						}
					}
				}
			}
		]
	};
	const gateway = (typeof document !== 'undefined') ? MapperSmith.VanillaGateway : MapperSmith.node.NodeVanillaGateway;
	return MapperSmith.forge(manifest, gateway);
}

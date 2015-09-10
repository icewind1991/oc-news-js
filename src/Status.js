export default class Status {
	constructor (version, warnings) {
		this.version = version;
		this.improperlyConfiguredCron = warnings.improperlyConfiguredCron;
	}
}

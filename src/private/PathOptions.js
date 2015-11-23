import {last} from './util'

export default class PathOptions {
	constructor(filename) {
		this.filename = filename
	}

	modulePath() {
		return this.filename
	}

	moduleName() {
		return noExt(basename(this.filename))
	}

	jsBaseName() {
		return `${this.moduleName()}.js`
	}
}

function basename(path) {
	return last(path.split('/'))
}

function extname(path) {
	return last(path.split('.'))
}

function noExt(path) {
	// - 1 for the '.'
	return path.substring(0, path.length - 1 - extname(path).length)
}

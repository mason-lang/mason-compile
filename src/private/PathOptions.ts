import {last} from './util'

export default class PathOptions {
	constructor(public modulePath: string) {}

	get moduleName(): string {
		return noExt(basename(this.modulePath))
	}

	get jsBaseName(): string {
		return `${this.moduleName}.js`
	}
}

function basename(path: string): string {
	return last(path.split('/'))
}

function extname(path: string): string {
	return last(path.split('.'))
}

function noExt(path: string): string {
	// - 1 for the '.'
	return path.substring(0, path.length - 1 - extname(path).length)
}

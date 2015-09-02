import { last, type } from './util'

export default class CompileOptions {
	constructor(opts) {
		// TODO:ES6 Optional arguments
		if (opts === undefined) opts = { }
		type(opts, Object)

		const defaultTo = (name, _default) => {
			const _ = opts[name]
			if (_ === undefined)
				return _default
			else {
				type(_, _default.constructor)
				return _
			}
		}

		const define = (name, _default) => {
			this[`_${name}`] = defaultTo(name, _default)
		}

		const defaults = {
			includeAmdefine: true,
			includeSourceMap: true,
			includeModuleName: true,
			forceNonLazyModule: false,
			useStrict: true,
			checks: true,
			'warn-as-error': false,
			useBoot: true,
			mslPath: 'msl'
		}

		for (const _ in defaults)
			define(_, defaults[_])

		this._inFile = opts.inFile

		if (this._inFile === undefined) {
			if (this._includeSourceMap)
				throw new Error('Either supply `inFile` option or make `includeSourceMap` false.')
			if (this._includeModuleName)
				throw new Error('Either supply `inFile` option or make `includeModuleName` false.')
		} else
			type(this._inFile, String)
	}

	moduleName() {
		return this._inFile === undefined ? 'anonymous' : noExt(basename(this._inFile))
	}

	jsBaseName() { return `${this.moduleName()}.js` }
	modulePath() { return this._inFile }

	includeChecks() { return this._checks }

	warnAsError() { return this['_warn-as-error'] }

	includeAmdefine() { return this._includeAmdefine }
	includeSourceMap() { return this._includeSourceMap }
	includeModuleName() { return this._includeModuleName }
	includeUseStrict() { return this._useStrict }

	lazyModule() { return !this._forceNonLazyModule }

	useBoot() { return this._useBoot }
	bootPath() { return `${this._mslPath}/private/boot` }
}

const
	basename = path =>
		last(path.split('/')),
	extname = path =>
		last(path.split('.')),
	noExt = path =>
		// - 1 for the '.'
		path.substring(0, path.length - 1 - extname(path).length)

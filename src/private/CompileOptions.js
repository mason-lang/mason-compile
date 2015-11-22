import defaultBuiltins from './defaultBuiltins'
import {last, type} from './util'

/**
Stores `opts` parameter to compile methods and supplies defaults.
See {@link compile} for description of options.
*/
export default class CompileOptions {
	constructor(opts) {
		const define = (name, _default) => {
			this[`_${name}`] = opts[name] === undefined ? _default : opts[name]
		}

		const defaults = {
			includeAmdefine: false,
			includeSourceMap: true,
			lazyModules: false,
			useStrict: true,
			checks: true,
			importBoot: true,
			mslPath: 'msl',
			indent: '\t'
		}

		const allOpts = new Set(Object.keys(defaults).concat(['inFile', 'builtins']))

		for (const _ in defaults)
			define(_, defaults[_])

		for (const _ in opts)
			if (!allOpts.has(_))
				throw new Error(`Unrecognized option ${_}`)

		const inFile = opts.inFile
		if (inFile === undefined) {
			if (this._includeSourceMap)
				throw new Error('Either supply `inFile` option or make `includeSourceMap` false.')
		} else {
			type(inFile, String)
			this._inFile = inFile
		}

		const minIndent = 2, maxIndent = 8
		if (!(this._indent === '\t' || minIndent <= this._indent && this._indent <= maxIndent))
			throw new Error(`opts.indent must be '\t' or a number 2-8, got: ${this._indent}`)

		const builtins = opts.builtins || getDefaultBuiltins(this._mslPath)
		this.builtinNameToPath = generateBuiltinsMap(builtins)
	}

	indent() {
		return this._indent
	}

	moduleName() {
		return this._inFile === undefined ? 'anonymous' : noExt(basename(this._inFile))
	}

	jsBaseName() { return `${this.moduleName()}.js` }
	modulePath() { return this._inFile }

	includeChecks() { return this._checks }

	includeAmdefine() { return this._includeAmdefine }
	includeSourceMap() { return this._includeSourceMap }
	includeUseStrict() { return this._useStrict }

	lazyModule() { return this._lazyModules }

	importBoot() { return this._importBoot }
	bootPath() { return `${this._mslPath}/private/boot` }
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

function getDefaultBuiltins(mslPath) {
	const builtins = Object.assign({}, defaultBuiltins)
	if (mslPath !== 'msl')
		for (const key in builtins) {
			const x = builtins[key]
			delete builtins[key]
			builtins[key.replace(/msl/g, mslPath)] = x
		}
	return builtins
}

function generateBuiltinsMap(builtins) {
	const m = new Map()
	for (const path in builtins) {
		const realPath = path.replace(/\./g, '/')
		for (let imported of builtins[path]) {
			if (imported === '_')
				imported = last(path.split('.'))
			if (m.has(imported))
				throw new Error(`Builtin ${imported} defined more than once.`)
			m.set(imported, realPath)
		}
	}
	return m
}

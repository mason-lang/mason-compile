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
			mslPath: 'msl',
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

		const builtins = opts.builtins || defaultBuiltins(this._mslPath)
		this.builtinNameToPath = generateBuiltinsMap(builtins)
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
		path.substring(0, path.length - 1 - extname(path).length),
	defaultBuiltins = mslPath => {
		const builtins = {
			global: [ 'Array', 'Boolean', 'Error', 'Function', 'Math', 'Number', 'Object',
				'RegExp', 'String', 'Symbol' ],
			'msl.@.?': [ 'un-?' ],
			'msl.@.@': [ '_', '-!', 'all?', 'count', 'empty', 'empty?', 'empty!', 'iterator' ],
			'msl.@.Map.Map': [ '_', 'assoc!', '?get' ],
			'msl.@.Range': [ '_' ],
			'msl.@.Seq.Seq': [ '_', '+>!' ],
			'msl.@.Seq.Stream': [ '_' ],
			'msl.@.Set.Set': [ '_' ],
			'msl.compare': [ '=?', '<?', '<=?', '>?', '>=?', 'min', 'max' ],
			'msl.Generator': [ 'gen-next!' ],
			'msl.math.methods': [ '+', '-', '*', '/' ],
			'msl.math.Number': [ 'neg' ],
			'msl.Type.Kind': [ '_', 'kind!', 'self-kind!' ],
			'msl.Type.Method': [ '_', 'impl!', 'impl-for', 'self-impl!' ],
			'msl.Type.Type': [ '=>' ]
		}
		if (mslPath !== 'msl')
			for (let key in builtins) {
				const x = builtins[key]
				delete builtins[key]
				builtins[key.replace(/msl/g, opts.mslPath)] = x
			}
		return builtins
	},
	generateBuiltinsMap = builtins => {
		const m = new Map()
		for (const path in builtins) {
			const realPath = path.replace(/\./g, '/')
			for (let used of builtins[path]) {
				if (used === '_')
					used = last(path.split('.'))
				if (m.has(used))
					throw new Error(`Builtin ${used} defined more than once.`)
				m.set(used, realPath)
			}
		}
		return m
	}

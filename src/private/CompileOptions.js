import {last, type} from './util'

export default class CompileOptions {
	constructor(opts = {}) {
		if (opts === undefined) opts = {}
		type(opts, Object)

		const define = (name, _default) => {
			const getDefault = () => {
				const _ = opts[name]
				if (_ === undefined)
					return _default
				else {
					type(_, _default.constructor)
					return _
				}
			}
			this[`_${name}`] = getDefault()
		}

		const defaults = {
			includeAmdefine: false,
			includeSourceMap: true,
			includeModuleName: true,
			lazyModules: true,
			useStrict: true,
			checks: true,
			'warn-as-error': false,
			useBoot: true,
			mslPath: 'msl'
		}

		const allOpts = new Set(Object.keys(defaults).concat(['inFile', 'builtins']))

		for (const _ in defaults)
			define(_, defaults[_])

		for (const _ in opts)
			if (!allOpts.has(_))
				throw new Error(`Unrecognized key ${_}`)

		const inFile = opts.inFile
		if (inFile === undefined) {
			if (this._includeSourceMap)
				throw new Error('Either supply `inFile` option or make `includeSourceMap` false.')
			if (this._includeModuleName)
				throw new Error('Either supply `inFile` option or make `includeModuleName` false.')
		} else {
			type(inFile, String)
			this._inFile = inFile
		}

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

	lazyModule() { return !this._lazyModules }

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
			global: ['Array', 'Boolean', 'Error', 'Function', 'Math', 'Number', 'Object',
				'RegExp', 'String', 'Symbol'],
			'msl.@.?': ['un-?'],
			'msl.@.@': ['_', '-!', 'all?', 'count', 'empty?', 'empty!', 'iterator'],
			'msl.@.@-Type': ['empty'],
			'msl.@.Map.Map': ['_', 'assoc!', '?get'],
			'msl.@.Range': ['_'],
			'msl.@.Seq.Seq': ['_', '+>!'],
			'msl.@.Seq.Stream': ['_'],
			'msl.@.Set.Set': ['_'],
			'msl.$': ['_'],
			'msl.compare': ['=?', '<?', '<=?', '>?', '>=?', 'min', 'max'],
			'msl.Generator': ['gen-next!'],
			'msl.math.methods': ['+', '-', '*', '/'],
			'msl.math.Number': ['divisible?', 'int/', 'modulo', 'neg', 'log'],
			'msl.to-string': ['_', 'inspect'],
			'msl.Type.Kind': ['_', 'kind!', 'self-kind!'],
			'msl.Type.Method': ['_', 'impl!', 'impl-for', 'self-impl!'],
			'msl.Type.Type': ['=>']
		}
		if (mslPath !== 'msl')
			for (let key in builtins) {
				const x = builtins[key]
				delete builtins[key]
				builtins[key.replace(/msl/g, mslPath)] = x
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

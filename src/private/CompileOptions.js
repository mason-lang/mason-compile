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
			includeModuleName: true,
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
			if (this._includeModuleName)
				throw new Error('Either supply `inFile` option or make `includeModuleName` false.')
		} else {
			type(inFile, String)
			this._inFile = inFile
		}

		if (!(this._indent === '\t' || 2 <= this._indent && this._indent <= 8))
			throw new Error(`opts.indent must be '\t' or a number 2-8, got: ${this._indent}`)

		const builtins = opts.builtins || defaultBuiltins(this._mslPath)
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
	includeModuleName() { return this._includeModuleName }
	includeUseStrict() { return this._useStrict }

	lazyModule() { return this._lazyModules }

	importBoot() { return this._importBoot }
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

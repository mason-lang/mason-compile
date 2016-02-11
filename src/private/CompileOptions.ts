import defaultBuiltins from './defaultBuiltins'
import {applyDefaults, last} from './util'
import allLanguages from './languages/allLanguages'
import Language from './languages/Language'

/** Stores options passed into [[Compiler]] constructor. */
export default class CompileOptions {
	includeAmdefine: boolean
	includeSourceMap: boolean
	lazyModules: boolean
	useStrict: boolean
	checks: boolean
	importBoot: boolean
	indent: '\t' | number
	language: Language
	// TODO:ES6 Won't need this option
	noModuleBoilerplate: boolean

	private mslPath: string

	private builtinNameToPath: Map<string, string>

	constructor(opts: OptionsObject) {
		const o = applyDefaults<OptionsObject>(opts, {
			includeAmdefine: false,
			includeSourceMap: true,
			lazyModules: false,
			useStrict: true,
			checks: true,
			importBoot: true,
			mslPath: 'msl',
			indent: '\t',
			language: 'english',
			builtins: null,
			noModuleBoilerplate: false
		})

		this.includeAmdefine = o.includeAmdefine
		this.includeSourceMap = o.includeSourceMap
		this.lazyModules = o.lazyModules
		this.useStrict = o.useStrict
		this.checks = o.checks
		this.importBoot = o.importBoot
		this.mslPath = o.mslPath
		this.indent = o.indent
		this.noModuleBoilerplate = o.noModuleBoilerplate

		const builtins = o.builtins === null ? getDefaultBuiltins(this.mslPath) : o.builtins
		this.builtinNameToPath = generateBuiltinNameToPath(builtins)

		this.language = (<any> allLanguages)[o.language]

		const minIndent = 2, maxIndent = 8
		const i = this.indent
		if (!(typeof i === 'number' ? (minIndent <= i && i <= maxIndent) : i === '\t'))
			throw new Error(`opts.indent must be '\t' or a number 2-8, got: ${i}`)
	}

	get bootPath(): string {
		return `${this.mslPath}/private/boot`
	}

	opBuiltinPath(name: string): string {
		return this.builtinNameToPath.get(name)
	}
}

export interface OptionsObject {
	/**
	If true, `amdefine` will be imported at the top.
	Allow modules to work in a non-AMD environment.
	*/
	includeAmdefine?: boolean,
	/** If false, source map in result will be null. */
	includeSourceMap?: boolean,
	/**
	Do not use this option!
	If false, lazy imports will not work.
	*/
	lazyModules?: boolean,
	useStrict?: boolean,
	/** If false, leave out type checks and assertions. */
	checks?: boolean,
	/**
	This option is only intended for use by `msl`.
	Settings this to `false` means that `msl/private/boot` won't be imported.
	*/
	importBoot?: boolean,
	/** Path to `msl`. This may be `msl/lib`. */
	mslPath?: string,
	/**
	Mason does not allow mixed kinds of indentation,
	so indent type must be set once here and used consistently.
	If '\t', use tabs to indent.
	If a Number, indent with that many spaces. Should be an int 2 through 8.
	*/
	indent?: '\t' | number,
	/** Language to use for errors and warnings. */
	language?: 'english',
	/**
	Currently only intended for use by `msl`.
	Represents a custom set of builtins.
	*/
	builtins?: Builtins,
	// Just for tests.
	// TODO:ES6 Won't be necessary
	noModuleBoilerplate?: boolean
}

export interface Builtins {
	[moduleName: string]: Array<string>
}

function getDefaultBuiltins(mslPath: string): Builtins {
	const builtins: Builtins = Object.assign({}, defaultBuiltins)
	if (mslPath !== 'msl')
		for (const key in builtins) {
			const x = builtins[key]
			delete builtins[key]
			builtins[key.replace(/msl/g, mslPath)] = x
		}
	return builtins
}

function generateBuiltinNameToPath(builtins: Builtins): Map<string, string> {
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

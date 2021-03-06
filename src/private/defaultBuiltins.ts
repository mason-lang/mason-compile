import {Builtins} from './CompileOptions'

/**
Default set of builtin functions.
Keys are modules, values are imports from that module.
*/
const defaultBuiltins: Builtins = {
	global: [
		// Standard globals
		'Array',
		'Boolean',
		'console',
		'Date',
		'Error',
		'Function',
		'Intl',
		'JSON',
		'Promise',
		'Proxy',
		'Math',
		'Number',
		'Object',
		'Reflect',
		'RegExp',
		'SIMD',
		'String',
		'Symbol',

		// Errors
		'EvalError',
		'InternalError',
		'RangeError',
		'ReferenceError',
		'SyntaxError',
		'TypeError',
		'URIError',

		// ArrayBuffer and views
		'ArrayBuffer',
		'DataView',
		'Float32Array',
		'Float64Array',
		'Int16Array',
		'Int32Array',
		'Int8Array',
		'Uint16Array',
		'Uint32Array',
		'Uint8Array',
		'Uint8ClampedArray',

		// URI functions
		'decodeURI',
		'decodeURIComponent',
		'encodeURI',
		'encodeURIComponent'

		/*
		Missing globals:
		eval: Want to discourage use
		isFinite, isNaN, parseFloat, parseInt: use Number.xxx functions
		Map, Set: have different meanings for msl. Use Id-Map and Id-Set for native versions.
		WeakMap, WeakSet: use Weak-Id-Map and Weak-Id-Set
		*/
	],
	'msl.@.?': [
		'_',
		'?None',
		'Opt->?',
		'?->Opt',
		'?-or',
		'?-cond',
		'?some',
		'un-?'
	],
	'msl.@.@': [
		'_',
		'++',
		'++~',
		'+!',
		'++!',
		'--',
		'--~',
		'-!',
		'--!',
		'all?',
		'any?',
		'count',
		'each!',
		'empty',
		'empty!',
		'empty?',
		'?find',
		'fold',
		'@flat-map',
		'@flat-map~',
		'@flatten',
		'@flatten~',
		'iterator',
		'@keep',
		'@keep~',
		'@toss',
		'@toss~',
		'@map',
		'@map~'
	],
	'msl.@.Map.Id-Map': ['_'],
	'msl.@.Map.Hash-Map': ['_'],
	'msl.@.Map.Map': [
		'_',
		'?get',
		'@keys',
		'make-map',
		'map=?',
		'@values'
	],
	'msl.@.Range': ['_'],
	'msl.@.Seq.Seq': [
		'_',
		'+>!',
		'@drop',
		'@drop~',
		'@drop-while',
		'@drop-while~',
		'first',
		'?first',
		'@indexes',
		'last',
		'?last',
		'?nth',
		'@reverse',
		'@reverse~',
		'@rtail',
		'@slice',
		'@slice~',
		'@split',
		'@split~',
		'seq=?',
		'@tail',
		'@take',
		'@take~',
		'@take-while',
		'@take-while~',
		'@zip',
		'@zip~'
	],
	'msl.@.Seq.Stream': ['_'],
	'msl.@.Set.Id-Set': ['_'],
	'msl.@.Set.Set': ['_', 'set=?'],
	'msl.compare': [
		'?min',
		'min',
		'?min-by',
		'min-by',
		'?max',
		'max',
		'?max-by',
		'max-by',
		'same?'
	],
	'msl.Function': ['Action', 'identity'],
	'msl.js': [
		'defined?',
		'exists?',
		'null?'
	],
	'msl.math.Number': [
		'divisible?',
		'Int',
		'int/',
		'log-base',
		'modulo',
		'nearest-ceil',
		'nearest-floor',
		'nearest-round',
		'Nat'
	],
	'msl.math.util': ['average', 'product', 'sum'],
	'msl.polys': ['sub', 'set-sub!', 'del-sub!'],
	'msl.to-string': ['_', 'inspect'],
	'msl.Type.Poly': ['_', 'impl!', 'impl-for', 'self-impl!'],
	'msl.Type.Trait': ['_'],
	'msl.Type.Pred-Type': ['_', 'Any', 'ObjLit'],
	'msl.Type.primitive': ['Bool', 'Num', 'Str', 'Sym'],
	'msl.Type.Type': ['_', '=>', 'has-instance?', 'extract']
}
export default defaultBuiltins

import {Operators, SpecialVals, UnaryOperators} from '../ast/Val'
import {Kw} from './Keyword'

// This includes names used for debug (like Kw.Ampersand -> '&')
export const kwToName = new Map<Kw, string>([
	[Kw.Abstract, 'abstract'],
	[Kw.Ampersand, '&'],
	[Kw.As, 'as'],
	[Kw.Assert, 'assert'],
	[Kw.Assign, '='],
	[Kw.AssignMutate, ':='],
	[Kw.Await, '$'],
	[Kw.Break, 'break'],
	[Kw.Built, 'built'],
	[Kw.Case, 'case'],
	[Kw.Catch, 'catch'],
	[Kw.Cond, 'cond'],
	[Kw.Class, 'class'],
	[Kw.Colon, ':'],
	[Kw.Construct, 'construct'],
	[Kw.Debugger, 'debugger'],
	[Kw.Del, 'del'],
	[Kw.Do, 'do'],
	[Kw.Dot, '.'],
	[Kw.Dot2, '..'],
	[Kw.Dot3, '...'],
	[Kw.Else, 'else'],
	[Kw.Except, 'except'],
	[Kw.Extends, 'extends'],
	[Kw.Finally, 'finally'],
	[Kw.Focus, '_'],
	[Kw.For, 'for'],
	[Kw.ForAsync, '$for'],
	[Kw.ForBag, '@for'],
	[Kw.Forbid, 'forbid'],
	[Kw.Get, 'get'],
	[Kw.If, 'if'],
	[Kw.Ignore, 'ignore'],
	[Kw.Import, 'import'],
	[Kw.ImportDo, 'import!'],
	[Kw.ImportLazy, 'import~'],
	[Kw.Lazy, '~'],
	[Kw.MapEntry, '->'],
	[Kw.My, 'my'],
	[Kw.New, 'new'],
	[Kw.ObjEntry, '. '],
	[Kw.Of, 'of'],
	[Kw.Override, 'override'],
	[Kw.Pass, 'pass'],
	[Kw.Pipe, 'pipe'],
	[Kw.Poly, 'poly'],
	[Kw.Set, 'set'],
	[Kw.Super, 'super'],
	[Kw.Static, 'static'],
	[Kw.Switch, 'switch'],
	[Kw.Tick, '\''],
	[Kw.Throw, 'throw'],
	[Kw.Trait, 'trait'],
	[Kw.TraitDo, 'trait!'],
	[Kw.Try, 'try'],
	[Kw.Unless, 'unless'],
	[Kw.Virtual, 'virtual'],
	[Kw.With, 'with'],
	[Kw.Yield, 'yield'],
	[Kw.YieldTo, 'yield*']
])

export const operatorToName = new Map<Operators, string>([
	[Operators.And, 'and'],
	[Operators.Div, '/'],
	[Operators.Eq, '=?'],
	[Operators.EqExact, '==?'],
	[Operators.Exponent, '**'],
	[Operators.Greater, '>?'],
	[Operators.GreaterOrEqual, '>=?'],
	[Operators.Less, '<?'],
	[Operators.LessOrEqual, '<=?'],
	[Operators.Minus, '-'],
	[Operators.Or, 'or'],
	[Operators.Plus, '+'],
	[Operators.Remainder, '%'],
	[Operators.Times, '*']
])

export const unaryOperatorToName = new Map<UnaryOperators, string>([
	[UnaryOperators.Neg, 'neg'],
	[UnaryOperators.Not, 'not']
])

export const specialValToName = new Map<SpecialVals, string>([
	[SpecialVals.False, 'false'],
	[SpecialVals.Name, 'name'],
	[SpecialVals.Null, 'null'],
	[SpecialVals.True, 'true'],
	[SpecialVals.Undefined, 'undefined']
])

export const reservedWords = new Set([
	// JavaScript reserved words
	'enum',
	'from',
	'implements',
	'interface',
	'package',
	'private',
	'protected',
	'public',

	// JavaScript keywords
	'arguments',
	'continue',
	'delete',
	'eval',
	'in',
	'instanceof',
	'return',
	'typeof',
	'void',
	'while',

	// Types
	'any',
	'boolean',
	'int',
	'int8',
	'int16',
	'int32',
	'int64',
	'uint',
	'uint8',
	'uint16',
	'uint32',
	'uint64',
	'float',
	'float32',
	'float64',
	'float128',
	'bignum',
	'decimal',
	'decimal32',
	'decimal64',
	'decimal128',
	'rational',
	'complex',
	'mixed',
	'number',
	'object',
	'ptr',
	'string',
	'symbol',
	'type',

	// Parallel
	'actor',
	'move',
	'send',
	'shared',
	'synchronized',
	'transient',
	'volatile',

	// Other
	'!',
	'<',
	'<-',
	'>',
	'data',
	'declare',
	'del?',
	'do-while',
	'do-until',
	'final',
	'flags',
	'implicit',
	'is',
	'macro',
	'meta',
	'mut',
	'native',
	'nothrow',
	'operator',
	'out',
	'pure',
	'readonly',
	'sealed',
	'sizeof',
	'struct',
	'then',
	'throws',
	'to',
	'until',
	'use'
])

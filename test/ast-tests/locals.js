import { AssignDestructure, AssignSingle, Debug, LocalAccess, LD_Lazy, LD_Mutable, LocalDeclare,
	LocalMutate, Throw } from '../../dist/MsAst'
import { aDeclare, assignAZero, bDeclare, funDo, loc, one, zero } from './util/ast-util'
import { test } from './util/test-asts'

describe('locals', () => {
	// TODO: Lazy

	test(
		`
			ze-ro = 0
			throw! ze-ro`,
		[
			AssignSingle(loc, LocalDeclare.plain(loc, 'ze-ro'), zero),
			Throw(loc, LocalAccess(loc, 'ze-ro'))
		],
		`
			const ze_45ro=0;
			throw _ms.error(ze_45ro)`,
		{ name: 'LocalAccess' })

	describe('AssignSingle', () => {
		test(
			'a = 0',
			assignAZero,
			'const a=0')
		test(
			'a ::= 0',
			AssignSingle(loc, LocalDeclare.untyped(loc, 'a', LD_Mutable), zero),
			'let a=0')
		test(
			'~a = 0',
			AssignSingle(loc, LocalDeclare.untyped(loc, 'a', LD_Lazy), zero),
			`
					const a=_ms.lazy(()=>{
						return 0
					})`)
	})

	test(
		'a b = 0',
		AssignDestructure(loc, [ aDeclare, bDeclare ], zero),
		'const _$1=0,a=_$1.a,b=_$1.b')

	test(
		// Must test inside of a Fun because `debug` can only transpile in a block context.
		`
			!|
				debug throw!`,
		funDo([ Debug(loc, [Throw(loc)]) ]),
		`
			()=>{
				throw _ms.error("An error occurred.")
			}`)

	test(
		`
			a ::= 0
			a := 1`,
		[
			AssignSingle(loc, LocalDeclare.untyped(loc, 'a', LD_Mutable), zero),
			LocalMutate(loc, 'a', one)
		],
		`
			let a=0;
			a=1`,
		{
			warnings: [ 'Unused local variable {{a}}.' ]
		})
})

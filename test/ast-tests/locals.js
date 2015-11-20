import {AssignDestructure, AssignSingle, LocalDeclare, LocalDeclares
	} from '../../dist/private/MsAst'
import {aDeclare, assignAZero, bDeclare, loc, zero} from './util/ast-util'
import {test} from './util/test-asts'

describe('locals', () => {
	// TODO: Lazy

	// TODO: multi-line test
	/*
	test(
		`
			ze-ro = 0
			throw ze-ro`,
		[
			new AssignSingle(loc, LocalDeclare.plain(loc, 'ze-ro'), zero),
			new Throw(loc, new LocalAccess(loc, 'ze-ro'))
		],
		`
			const ze_45ro=0;
			throw ze_45ro`,
		{name: 'LocalAccess'})
	*/

	describe('AssignSingle', () => {
		test(
			'a = 0',
			assignAZero,
			'let a=0',
			{warnings: ['Unused local variable {{a}}.']})
		test(
			'~a = 0',
			new AssignSingle(loc, LocalDeclare.untyped(loc, 'a', LocalDeclares.Lazy), zero),
			'let a=_ms.lazy(()=>0)',
			{warnings: ['Unused local variable {{a}}.']})
	})

	test(
		'a b = 0',
		new AssignDestructure(loc, [aDeclare, bDeclare], zero),
		'let _$0=0,a=_$0.a,b=_$0.b',
		{warnings: ['Unused local variable {{b}}.', 'Unused local variable {{a}}.']})

	// TODO: multi-line test
	/*
	test(
		`
			a ::= 0
			a := 1`,
		[
			new AssignSingle(loc, LocalDeclare.untyped(loc, 'a', LocalDeclares.Mutable), zero),
			new LocalMutate(loc, 'a', one)
		],
		`
			let a=0;
			a=1`,
		{
			warnings: ['Unused local variable {{a}}.']
		})
	*/
})

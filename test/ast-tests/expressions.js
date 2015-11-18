import {BagSimple, Block, Call, Member, New, ObjPair, ObjSimple, QuotePlain, QuoteSimple,
	QuoteTaggedTemplate, SpecialVal, SpecialVals, Spread, With} from '../../dist/private/MsAst'
import {aDeclare, blockPass, focusAccess, focusDeclare, loc, one, two, zero} from './util/ast-util'
import {test} from './util/test-asts'

describe('expressions', () => {
	test(
		'[0 1]',
		new BagSimple(loc, [zero, one]),
		'[0,1]')

	test(
		'(a. 0 b. 1)',
		new ObjSimple(loc, [
			new ObjPair(loc, 'a', zero),
			new ObjPair(loc, 'b', one)
		]),
		`
			{
				a:0,
				b:1
			}`)

	test(
		'0',
		zero,
		'0')

	test(
		'0.x',
		new Member(loc, zero, 'x'),
		'0..x')

	describe('Call', () => {
		test(
			'0 1',
			new Call(loc, zero, [one]),
			'0(1)')

		test(
			'0()',
			new Call(loc, zero, []),
			'0()')

		test(
			'0 ...1',
			new Call(loc, zero, [new Spread(loc, one)]),
			'0(...1)')

		test(
			'0[1 2]',
			Call.sub(loc, zero, [one, two]),
			'_ms.sub(0,1,2)')

		test(
			'0:1',
			Call.contains(loc, one, zero),
			'_ms.contains(1,0)')

		test(
			'new 0',
			new New(loc, zero, []),
			'new (0)()')
	})

	describe('SpecialVal', () => {
		// TODO: Move to types test?
		test(
			`0:1`,
			Call.contains(loc, one, zero),
			'_ms.contains(1,0)')
		test('false', new SpecialVal(loc, SpecialVals.False), 'false')
		test('null', new SpecialVal(loc, SpecialVals.Null), 'null')
		test('true', new SpecialVal(loc, SpecialVals.True), 'true')
		test('undefined', new SpecialVal(loc, SpecialVals.Undefined), 'void 0')
		// todo: other special vals
	})

	describe('Quote', () => {
		test(
			'\'a',
			new QuoteSimple(loc, 'a'),
			'"a"')

		test(
			'"a"',
			new QuotePlain(loc, ['a']),
			'`a`',
			{warnings: ['Quoted text could be a simple quote {{\'a}}.']})

		test(
			'"a b"',
			new QuotePlain(loc, ['a b']),
			'`a b`')

		test(
			`
				"
					a
						b
					c`,
			new QuotePlain(loc, ['a\n\tb\nc']),
			'`a\n\tb\nc`')

		test(
			'"a\\{\\n"',
			new QuotePlain(loc, ['a\\{\\n']),
			'`a\\{\\n`')

		test(
			'"a{0}b"',
			new QuotePlain(loc, ['a', zero, 'b']),
			'`a${0}b`')

		test(
			'0"a{0}b"',
			new QuoteTaggedTemplate(loc, zero, new QuotePlain(loc, ['a', zero, 'b'])),
			'0`a${0}b`')
	})

	describe('With', () => {
		// OK to not use the var if it's the focus
		test(
			`
				with 0
					pass`,
			new With(loc, focusDeclare, zero, blockPass),
			`
				(()=>{
					const _=0;
					return _
				})()`)
		test(
			`
				with 0 as a
					pass`,
			new With(loc, aDeclare, zero, blockPass),
			`
				(()=>{
					const a=0;
					return a
				})()`,
			{warnings: ['Unused local variable {{a}}.']})
		test(
			`
				with 0
					_ _`,
			new With(loc, focusDeclare, zero,
				new Block(loc, null, [new Call(loc, focusAccess, [focusAccess])])),
			`
				(()=>{
					const _=0;
					_(_);
					return _
				})()`)
	})
})

// TODO:
// BlockWrap
// Range (`a..b`, `a...b`, `a...`)
// MemberFun
// GetterFun
// Method
// Pipe

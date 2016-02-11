import Block from '../../lib/private/ast/Block'
import Call, {New, Spread} from '../../lib/private/ast/Call'
import {MsRegExp, QuoteSimple, QuoteTagged, QuoteTemplate} from '../../lib/private/ast/Quote'
import {BagSimple, Member, ObjPair, ObjSimple, SpecialVal, SpecialVals
	} from '../../lib/private/ast/Val'
import With from '../../lib/private/ast/With'
import {aDeclare, blockPass, focusAccess, focusDeclare, loc, objectAccess, one, zero
	} from './util/ast-util'
import {test} from './util/test-asts'

describe('expressions', () => {
	test(
		'[0 1]',
		new BagSimple(loc, [zero, one]),
		'[0,1]')

	test(
		'{a. 0 b. 1}',
		new ObjSimple(loc, [
			new ObjPair(loc, 'a', zero),
			new ObjPair(loc, 'b', one)
		]),
		`
			{
				a:0,
				b:1
			}`)
	// todo: other ObjSimple types

	test(
		'0',
		zero,
		'0')
	// todo: other numbers (0.1, 0b0101, 002)

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
	})

	test(
		'new 0',
		new New(loc, zero, []),
		'new (0)()')

	describe('SpecialVal', () => {
		test('false', new SpecialVal(loc, SpecialVals.False), 'false')
		test('null', new SpecialVal(loc, SpecialVals.Null), 'null')
		test('true', new SpecialVal(loc, SpecialVals.True), 'true')
		test('undefined', new SpecialVal(loc, SpecialVals.Undefined), 'void 0')
		// todo: SpecialVals.Name
	})

	describe('Quote', () => {
		test(
			'\'a',
			new QuoteSimple(loc, 'a'),
			'"a"')

		test(
			'"a"',
			new QuoteTemplate(loc, ['a']),
			'`a`',
			{warnings: ['Quoted text could be a simple quote {{\'a}}.']})

		test(
			'"a b"',
			new QuoteTemplate(loc, ['a b']),
			'`a b`')

		test(
			`
				"
					a
						b
					c`,
			new QuoteTemplate(loc, ['a\n\tb\nc']),
			'`a\n\tb\nc`')

		test(
			'"a`\\"\\#\\n"',
			new QuoteTemplate(loc, ['a\\`"#\\n']),
			'\`a\\`"#\\n\`')

		test(
			'"a#(0)b"',
			new QuoteTemplate(loc, ['a', zero, 'b']),
			'`a${0}b`')

		test(
			'"a#Object"',
			new QuoteTemplate(loc, ['a', objectAccess]),
			'`a${Object}`')

		test(
			'0"a#(0)b"',
			new QuoteTagged(loc, zero, new QuoteTemplate(loc, ['a', zero, 'b'])),
			'0`a${0}b`')

		test(
			'``g',
			new MsRegExp(loc, [], 'g'),
			'/(?:)/g')

		test(
			'`a`im',
			new MsRegExp(loc, ['a'], 'im'),
			'/a/im')

		test(
			'`a#(0)#Object`g',
			new MsRegExp(loc, ['a', zero, objectAccess], 'g'),
			'_ms.regexp(["a",0,Object],"g")')

		test(
			`
				\`
					a
					b`,
			new MsRegExp(loc, ['a\nb']),
			'/a\\nb/')
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
					let _=0;
					return _
				})()`)
		test(
			`
				with 0 as a
					pass`,
			new With(loc, aDeclare, zero, blockPass),
			`
				(()=>{
					let a=0;
					return a
				})()`,
			{warnings: ['Unused local variable {{a}}.']})
		test(
			`
				with 0
					_ _`,
			new With(
				loc,
				focusDeclare,
				zero,
				new Block(loc, null, [new Call(loc, focusAccess, [focusAccess])])),
			`
				(()=>{
					let _=0;
					_(_);
					return _
				})()`)
	})
})

// TODO:
// BlockWrap
// Range (`a..b`, `a...b`, `a...`)
// Fun
// Method
// Pipe
// Literal (NumberLiteral, RegExpLiteral)
// InstanceOf, Sub, Del

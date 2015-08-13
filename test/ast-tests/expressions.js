import { AssignSingle, BagSimple, BlockDo, Call, LD_Const, LocalDeclare, Member, New, ObjPair,
	ObjSimple, Quote, QuoteTemplate, SpecialVal, Splat, SV_False, SV_Null, SV_ThisModuleDirectory,
	SV_True, SV_Undefined, With } from '../../dist/MsAst'
import { aAccess, aDeclare, assignAZero, blockPass, focusAccess, focusDeclare, loc, one, two, zero
	} from './util/ast-util'
import { test } from './util/test-asts'

describe('expressions', () => {
	test(
		'[ 0 1 ]',
		BagSimple(loc, [ zero, one ]),
		'[0,1]')

	test(
		'(a. 0 b. 1)',
		ObjSimple(loc, [
			ObjPair(loc, 'a', zero),
			ObjPair(loc, 'b', one)
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
		Member(loc, zero, 'x'),
		'0..x')

	describe('Call', () => {
		test(
			'0 1',
			Call(loc, zero, [ one ]),
			'0(1)')

		test(
			'0()',
			Call(loc, zero, [ ]),
			'0()')

		test(
			`
				a = 0
				a ...a`,
			[
				assignAZero,
				Call(loc, aAccess, [ Splat(loc, aAccess) ])
			],
			`
				const a=0;
				return a(...a)`)

		test(
			'0[1 2]',
			Call.sub(loc, [ zero, one, two ]),
			'_ms.sub(0,1,2)')

		test(
			'0:1',
			Call.contains(loc, one, zero),
			'_ms.contains(1,0)')

		test(
			'new 0',
			New(loc, zero, [ ]),
			'new (0)()')
	})

	describe('SpecialVal', () => {
		// TODO: Move to types test?
		test(
			`
				a = 0
				_ = 0
				:a`,
			[
				assignAZero,
				// TODO: assignFocusZero (but that uses LocalDeclareFocus, not a plain LocalDeclare)
				AssignSingle(loc, LocalDeclare(loc, '_', null, LD_Const), zero),
				Call.contains(loc, aAccess, focusAccess)
			],
			`
				const a=0;
				const _=0;
				return _ms.contains(a,_)`)

		test('false', SpecialVal(loc, SV_False), 'false')
		test('null', SpecialVal(loc, SV_Null), 'null')
		test('this-module-directory', SpecialVal(loc, SV_ThisModuleDirectory), '__dirname')
		test('true', SpecialVal(loc, SV_True), 'true')
		test('undefined', SpecialVal(loc, SV_Undefined), 'void 0')
	})

	describe('Quote', () => {
		test(
			'"a"',
			Quote(loc, [ 'a' ]),
			'`a`')

		test(
			`
				"
					a
						b
					c`,
			Quote(loc, [ 'a\n\tb\nc' ]),
			'`a\\n\\tb\\nc`')

		test(
			'"a\\{\\n"',
			Quote(loc, [ 'a\{\n' ]),
			'`a\\{\\n`')

		test(
			'"a{0}b"',
			Quote(loc, [ 'a', zero, 'b' ]),
			'`a${0}b`')

		test(
			'0"a{0}b"',
			QuoteTemplate(loc, zero, Quote(loc, [ 'a', zero, 'b' ])),
			'0`a${0}b`')
	})

	describe('With', () => {
		// OK to not use the var if it's the focus
		test(
			`
				with 0
					pass`,
			With(loc, focusDeclare, zero, blockPass),
			`
				(_=>{
					return _
				})(0)`)
		test(
			`
				with 0 as a
					pass`,
			With(loc, aDeclare, zero, blockPass),
			`
				(a=>{
					return a
				})(0)`,
			{ warnings: [ 'Unused local variable {{a}}.' ] })
		test(
			`
				with 0
					_ _`,
			With(loc, focusDeclare, zero,
				BlockDo(loc, [ Call(loc, focusAccess, [ focusAccess ]) ])),
			`
				(_=>{
					_(_);
					return _
				})(0)`)
	})
})

// TODO:
// BlockWrap

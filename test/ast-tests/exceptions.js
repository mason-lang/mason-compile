import { Assert, Throw } from '../../dist/MsAst'
import { loc, one, zero } from './util/ast-util'
import { test } from './util/test-asts'

describe('except', () => {
	// TODO:
	// except, try, try!, catch, catch!, else, else!, finally!
})

describe('assert', () => {
	test(
		'assert! 0',
		Assert(loc, false, zero, null),
		'if(! 0)throw new (Error)("Assertion failed.")')
	test('forbid! 0',
		Assert(loc, true, zero, null),
		'if(0)throw new (Error)("Assertion failed.")')

	test(
		'assert! 0 throw! 1',
		Assert(loc, false, zero, one),
		'if(! 0)throw _ms.error(1)')
	test(
		'forbid! 0 throw! 1',
		Assert(loc, true, zero, one),
		'if(0)throw _ms.error(1)')
})

describe('throw', () => {
	test(
		'throw!',
		Throw(loc),
		'throw _ms.error("An error occurred.")')
	test(
		'throw! 0',
		Throw(loc, zero),
		'throw _ms.error(0)')
})

import { Assert, Throw } from '../../dist/private/MsAst'
import { loc, one, strA, zero } from './util/ast-util'
import { test } from './util/test-asts'

describe('except', () => {
	// TODO:
	// except, try, try!, catch, catch!, else, else!, finally!
})

describe('assert', () => {
	test(
		'assert! 0',
		new Assert(loc, false, zero, null),
		'if(! 0)throw new (Error)("Assertion failed.")')
	test('forbid! 0',
		new Assert(loc, true, zero, null),
		'if(0)throw new (Error)("Assertion failed.")')

	test(
		'assert! 0 throw! 1',
		new Assert(loc, false, zero, one),
		'if(! 0)throw 1')
	test(
		'forbid! 0 throw! 1',
		new Assert(loc, true, zero, one),
		'if(0)throw 1')
})

describe('throw', () => {
	test(
		'throw!',
		new Throw(loc),
		'throw new (Error)("An error occurred.")')
	test(
		'throw! "a"',
		new Throw(loc, strA),
		'throw new (Error)(`a`)')
	test(
		'throw! 0',
		new Throw(loc, zero),
		'throw 0')
})

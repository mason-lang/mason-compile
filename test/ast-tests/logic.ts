import {Logic, Logics} from '../../lib/private/ast/booleans'
import {loc, one, two, zero} from './util/ast-util'
import {test} from './util/test-asts'

describe('logic', () => {
	test(
		'and 0 1 2',
		new Logic(loc, Logics.And, [zero, one, two]),
		'((0&&1)&&2)')
	test(
		'or 0 1 2',
		new Logic(loc, Logics.Or, [zero, one, two]),
		'((0||1)||2)')
})

import { L_And, L_Or, Logic } from '../../dist/private/MsAst'
import { loc, one, two, zero } from './util/ast-util'
import { test } from './util/test-asts'

describe('logic', () => {
	test(
		'and 0 1 2',
		new Logic(loc, L_And, [ zero, one, two ]),
		'((0&&1)&&2)')
	test(
		'or 0 1 2',
		new Logic(loc, L_Or, [ zero, one, two ]),
		'((0||1)||2)')
})

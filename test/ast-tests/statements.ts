import {MemberSet, Pass, SpecialDo, SpecialDos} from '../../lib/private/ast/Do'
import {loc, one, zero} from './util/ast-util'
import {test} from './util/test-asts'

describe('statements', () => {
	test(
		'debugger',
		new SpecialDo(loc, SpecialDos.Debugger),
		'debugger')

	// TODO: parse with type

	test(
		'0.x := 1',
		new MemberSet(loc, zero, 'x', null, one),
		'0..x=1')

	test(
		'pass 1',
		new Pass(loc, one),
		'1')
})

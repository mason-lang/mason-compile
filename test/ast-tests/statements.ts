import {MemberSet, Pass, Setters, SpecialDo, SpecialDos} from '../../dist/private/ast/Do'
import {loc, one, zero} from './util/ast-util'
import {test} from './util/test-asts'

describe('statements', () => {
	test(
		'debugger',
		new SpecialDo(loc, SpecialDos.Debugger),
		'debugger')

	// TODO: parse with type

	test(
		'0.x = 1',
		new MemberSet(loc, zero, 'x', null, Setters.Init, one),
		'_ms.newProperty(0,"x",1)')

	test(
		'0.x := 1',
		new MemberSet(loc, zero, 'x', null, Setters.Mutate, one),
		'0..x=1')

	test(
		'pass 1',
		new Pass(loc, one),
		'1')
})

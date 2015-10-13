import {MemberSet, SD_Debugger, SET_Init, SET_InitMutable, SET_Mutate, SpecialDo
	} from '../../dist/private/MsAst'
import {loc, one, zero} from './util/ast-util'
import {test} from './util/test-asts'

describe('statements', () => {
	test(
		'debugger!',
		new SpecialDo(loc, SD_Debugger),
		'debugger')

	// TODO: parse with type

	test(
		'0.x = 1',
		new MemberSet(loc, zero, 'x', null, SET_Init, one),
		'_ms.newProperty(0,"x",1)')

	test(
		'0.x ::= 1',
		new MemberSet(loc, zero, 'x', null, SET_InitMutable, one),
		'_ms.newMutableProperty(0,"x",1)')

	test(
		'0.x := 1',
		new MemberSet(loc, zero, 'x', null, SET_Mutate, one),
		'0..x=1')
})

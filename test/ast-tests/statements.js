import { MemberSet, MS_New, MS_NewMutable, MS_Mutate, SD_Debugger, SpecialDo
	} from '../../dist/MsAst'
import { loc, one, zero } from './util/ast-util'
import { test } from './util/test-asts'

describe('statements', () => {
	test(
		'debugger!',
		SpecialDo(loc, SD_Debugger),
		'debugger')

	test(
		'0.x = 1',
		MemberSet(loc, zero, 'x', MS_New, one),
		'_ms.newProperty(0,"x",1)')

	test(
		'0.x ::= 1',
		MemberSet(loc, zero, 'x', MS_NewMutable, one),
		'_ms.newMutableProperty(0,"x",1)')

	test(
		'0.x := 1',
		MemberSet(loc, zero, 'x', MS_Mutate, one),
		'0..x=1')
})

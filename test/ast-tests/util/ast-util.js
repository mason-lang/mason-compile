import Loc, { StartPos } from 'esast/dist/Loc'
import { AssignSingle, BlockDo, BlockWithReturn, Fun, LocalDeclare, LocalAccess, LocalDeclareFocus,
	NumberLiteral, SD_Debugger, SpecialDo } from '../../../dist/MsAst'

export const
	loc = Loc(StartPos, StartPos),
	aDeclare = LocalDeclare.plain(loc, 'a'),
	bDeclare = LocalDeclare.plain(loc, 'b'),
	aAccess = LocalAccess(loc, 'a'),
	bAccess = LocalAccess(loc, 'b'),
	focusAccess = LocalAccess(loc, '_'),
	focusDeclare = LocalDeclareFocus(loc),

	// Used where a value is expected.
	zero = NumberLiteral(loc, 0),
	one = NumberLiteral(loc, 1),
	two = NumberLiteral(loc, 2),

	assignAZero = AssignSingle(loc, aDeclare, zero),
	assignFocusZero = AssignSingle(loc, focusDeclare, zero),

	blockDbg = BlockDo(loc, [ SpecialDo(loc, SD_Debugger) ]),
	blockOne = BlockWithReturn(loc, [ ], one),
	blockTwo = BlockWithReturn(loc, [ ], two),
	blockPass = BlockDo(loc, [ ]),

	funDo = lines =>
		Fun(
			loc,
			null,
			false,
			[ ],
			null,
			BlockDo(loc, lines),
			null,
			null,
			null,
			null)

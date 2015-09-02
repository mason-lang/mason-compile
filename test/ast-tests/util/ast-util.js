import Loc, { StartPos } from 'esast/dist/Loc'
import { AssignSingle, BlockDo, BlockWithReturn, Fun, LocalDeclare, LocalAccess, LocalDeclareFocus,
	NumberLiteral, Quote, SD_Debugger, SpecialDo } from '../../../dist/private/MsAst'

export const
	loc = new Loc(StartPos, StartPos),
	aDeclare = LocalDeclare.plain(loc, 'a'),
	bDeclare = LocalDeclare.plain(loc, 'b'),
	aAccess = new LocalAccess(loc, 'a'),
	bAccess = new LocalAccess(loc, 'b'),
	focusAccess = new LocalAccess(loc, '_'),
	focusDeclare = new LocalDeclareFocus(loc),

	// Used where a value is expected.
	zero = new NumberLiteral(loc, '0'),
	one = new NumberLiteral(loc, '1'),
	two = new NumberLiteral(loc, '2'),

	strA = Quote.forString(loc, 'a'),

	assignAZero = new AssignSingle(loc, aDeclare, zero),
	assignFocusZero = new AssignSingle(loc, focusDeclare, zero),

	blockDbg = new BlockDo(loc, [ new SpecialDo(loc, SD_Debugger) ]),
	blockOne = new BlockWithReturn(loc, [ ], one),
	blockTwo = new BlockWithReturn(loc, [ ], two),
	blockPass = new BlockDo(loc, [ ]),

	funDo = lines =>
		new Fun(
			loc,
			null,
			false,
			[ ],
			null,
			new BlockDo(loc, lines),
			null,
			null,
			null,
			null)

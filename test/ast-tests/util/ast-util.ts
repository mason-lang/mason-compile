import Loc, {Pos} from 'esast/lib/Loc'
import {AssignSingle} from '../../../dist/private/ast/locals'
import Block from '../../../dist/private/ast/Block'
import {SpecialDo, SpecialDos} from '../../../dist/private/ast/Do'
import Fun from '../../../dist/private/ast/Fun'
import {Do} from '../../../dist/private/ast/LineContent'
import {LocalAccess, LocalDeclare} from '../../../dist/private/ast/locals'
import {NumberLiteral, QuoteSimple} from '../../../dist/private/ast/Val'

export const
	loc = new Loc(Pos.start, Pos.start),
	aDeclare = LocalDeclare.plain(loc, 'a'),
	bDeclare = LocalDeclare.plain(loc, 'b'),
	aAccess = new LocalAccess(loc, 'a'),
	bAccess = new LocalAccess(loc, 'b'),
	objectAccess = new LocalAccess(loc, 'Object'),
	focusAccess = new LocalAccess(loc, '_'),
	focusDeclare = LocalDeclare.focus(loc),

	// Used where a value is expected.
	zero = new NumberLiteral(loc, '0'),
	one = new NumberLiteral(loc, '1'),
	two = new NumberLiteral(loc, '2'),

	strA = new QuoteSimple(loc, 'a'),

	assignAZero = new AssignSingle(loc, aDeclare, zero),
	assignFocusZero = new AssignSingle(loc, focusDeclare, zero),

	blockDbg = new Block(loc, null, [new SpecialDo(loc, SpecialDos.Debugger)]),
	blockOne = new Block(loc, null, [one]),
	blockTwo = new Block(loc, null, [two]),
	blockPass = new Block(loc, null, [])

export function funDo(lines: Array<Do>): Fun {
	return new Fun(loc, [], null, new Block(loc, null, lines), {isDo: true})
}

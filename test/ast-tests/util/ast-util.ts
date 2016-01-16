import Loc, {Pos} from 'esast/lib/Loc'
import {AssignSingle} from '../../../lib/private/ast/locals'
import Block from '../../../lib/private/ast/Block'
import {SpecialDo, SpecialDos} from '../../../lib/private/ast/Do'
import {FunBlock} from '../../../lib/private/ast/Fun'
import {Do} from '../../../lib/private/ast/LineContent'
import {LocalAccess, LocalDeclare} from '../../../lib/private/ast/locals'
import {QuoteSimple} from '../../../lib/private/ast/Quote'
import {NumberLiteral} from '../../../lib/private/ast/Val'

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

export function funDo(lines: Array<Do>): FunBlock {
	return new FunBlock(loc, [], null, new Block(loc, null, lines), {isDo: true})
}

import {Pos} from 'esast/lib/Loc'
import Char from 'typescript-char/Char'
import {Funs} from '../ast/Fun'
import {GroupSpace} from '../token/Group'
import {Kw} from '../token/Keyword'
import {closeSpaceOKIfEmpty, openGroup} from './groupContext'
import {peek, pos, skip, tryEat} from './sourceContext'
import {addKeywordFun, addKeywordPlain} from './util'

/**
This is called *after* having eaten a [[Char.Period]].
Handling for this is complex because many [[KeywordFun]]s start with a period.
*/
export default function lexAfterPeriod(startPos: Pos): void {
	function kw(kind: Kw): void {
		addKeywordPlain(startPos, kind)
	}
	function funKw(opts: {isDo?: boolean, isThisFun?: boolean, kind?: Funs}): void {
		addKeywordFun(startPos, opts)
	}

	const peeked = peek()
	switch (peeked) {
		case Char.Space: case Char.LineFeed:
			// Kw.ObjEntry in its own spaced group.
			// We can't just create a new Group here because we want to
			// ensure it's not part of the preceding or following spaced group.
			closeSpaceOKIfEmpty(startPos)
			kw(Kw.ObjEntry)
			break

		case Char.CloseBrace:
			// Allow `{a. 1 b.}`
			closeSpaceOKIfEmpty(startPos)
			kw(Kw.ObjEntry)
			openGroup(pos(), GroupSpace)
			break

		case Char.Period:
			skip()
			if (tryEat(Char.Period))
				kw(Kw.Dot3)
			else
				kw(Kw.Dot2)
			break

		case Char.Backslash:
			skip()
			funKw({isThisFun: true})
			break

		case Char.ExclamationMark:
			if (peek(1) === Char.Backslash) {
				skip(2)
				funKw({isDo: true, isThisFun: true})
			} else
				kw(Kw.Dot)
			break

		case Char.Asterisk: case Char.$:
			const kind = peeked === Char.Asterisk ? Funs.Generator : Funs.Async
			if (peek(1) === Char.Backslash) {
				skip(2)
				funKw({isThisFun: true, kind})
			} else if (peek(1) === Char.ExclamationMark && peek(2) === Char.Backslash) {
				skip(3)
				funKw({isDo: true, isThisFun: true, kind})
			} else
				kw(Kw.Dot)
			break

		default:
			kw(Kw.Dot)
	}
}

import Loc, {Pos} from 'esast/lib/Loc'
import {Funs} from '../ast/Fun'
import {KeywordFun, KeywordPlain, Kw} from '../token/Keyword'
import {addToCurrentGroup, space} from './groupContext'
import {pos} from './sourceContext'

export function addKeywordFun(
	startPos: Pos,
	opts: {isDo?: boolean, isThisFun?: boolean, kind?: Funs}
	): void {
	const options = {
		isDo: Boolean(opts.isDo),
		isThisFun: Boolean(opts.isThisFun),
		kind: 'kind' in opts ? opts.kind : Funs.Plain
	}
	const loc = new Loc(startPos, pos())
	addToCurrentGroup(new KeywordFun(loc, options))
	// First arg (`a` in `\a`) goes its own spaced group, despite no space between the `\` and it.
	space(loc)
}

export function addKeywordPlain(startPos: Pos, kind: Kw): void {
	addToCurrentGroup(new KeywordPlain(new Loc(startPos, pos()), kind))
}

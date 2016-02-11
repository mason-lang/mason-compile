import Loc, {Pos} from 'esast/lib/Loc'
import {nonNull} from 'op/Op'
import Char from 'typescript-char/Char'
import {check} from '../context'
import {KeywordComment, Kw, opKeywordFromName} from '../token/Keyword'
import {NameToken} from '../token/Token'
import {isNameCharacter} from './chars'
import {addToCurrentGroup, closeInterpolation, openInterpolation} from './groupContext'
import {peek, pos, skipRestOfLine, takeWhileWithPrev} from './sourceContext'
import {addKeywordPlain} from './util'

/**
This is called *after* having eaten the first character of the name.
@param startPos Position of first character.
@param isInterpolation Whether this is a quote interpolation name like `#foo`.
*/
export default function lexName(startPos: Pos, isInterpolation: boolean): void {
	const name = takeWhileWithPrev(isNameCharacter)
	if (peek(-1) === Char.Underscore) {
		// `foo_` is lexed as 2 tokens, `foo` and `_`.
		// Inside an interpolation we put these tokens in their own [[GroupInterpolation]].
		if (name.length > 1) {
			if (isInterpolation)
				openInterpolation(Loc.singleChar(startPos))

			handleNameText(startPos, name.slice(0, name.length - 1), false)
			addKeywordPlain(pos().onPrevColumn(), Kw.Focus)

			if (isInterpolation)
				closeInterpolation(Loc.singleChar(pos()))
		} else
			addKeywordPlain(startPos, Kw.Focus)
	} else
		handleNameText(startPos, name, !isInterpolation)
}

function handleNameText(startPos: Pos, name: string, allowSpecialKeywords: boolean): void {
	const loc = new Loc(startPos, pos())
	const keyword = opKeywordFromName(loc, name)
	if (nonNull(keyword)) {
		if (keyword instanceof KeywordComment) {
			check(allowSpecialKeywords, startPos, _ => _.noSpecialKeyword(keyword.kind))
			skipRestOfLine()
			// todo: warn for todo comments
			if (keyword.kind === 'region')
				addToCurrentGroup(keyword)
		} else
			addToCurrentGroup(keyword)
	} else
		addToCurrentGroup(new NameToken(new Loc(startPos, pos()), name))
}

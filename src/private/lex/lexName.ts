import Loc, {Pos} from 'esast/lib/Loc'
import {nonNull} from 'op/Op'
import Char from 'typescript-char/Char'
import {check} from '../context'
import {KeywordComment, KeywordPlain, Kw, opKeywordFromName} from '../token/Keyword'
import {NameToken} from '../token/Token'
import {isNameCharacter} from './chars'
import {addToCurrentGroup, closeInterpolation, openInterpolation} from './groupContext'
import {peek, pos, skipRestOfLine, takeWhileWithPrev} from './sourceContext'

/**
This is called *after* having eaten the first character of the name.
@param startPos Position of first character.
@param isInterpolation Whether this is a quote interpolation name like `#foo`.
*/
export default function lexName(startPos: Pos, isInterpolation: boolean): void {
	const name = takeWhileWithPrev(isNameCharacter)
	if (peek(-1) === Char.Underscore) {
		if (name.length > 1) {
			if (isInterpolation)
				openInterpolation(Loc.singleChar(startPos))

			handleNameText(startPos, name.slice(0, name.length - 1), false)
			keyword(pos(), Kw.Focus)

			if (isInterpolation)
				closeInterpolation(Loc.singleChar(pos()))
		} else
			keyword(startPos, Kw.Focus)
	} else
		handleNameText(startPos, name, !isInterpolation)
}

function handleNameText(startPos: Pos, name: string, allowSpecialKeywords: boolean): void {
	const loc = new Loc(startPos, pos())
	const keyword = opKeywordFromName(loc, name)
	if (nonNull(keyword)) {
		if (keyword instanceof KeywordComment) {
			if (keyword.kind === 'todo') {
				check(allowSpecialKeywords, startPos, _ => _.noSpecialKeyword('todo'))
				skipRestOfLine()
				// todo: warn for todo comments
			} else {
				check(allowSpecialKeywords, startPos, _ => _.noSpecialKeyword('region'))
				skipRestOfLine()
				addToCurrentGroup(keyword)
			}
		} else
			addToCurrentGroup(keyword)
	} else
		addToCurrentGroup(new NameToken(new Loc(startPos, pos()), name))
}

function keyword(startPos: Pos, kind: Kw): void {
	addToCurrentGroup(new KeywordPlain(new Loc(startPos, pos()), kind))
}

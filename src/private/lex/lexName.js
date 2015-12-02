import Loc from 'esast/dist/Loc'
import {check} from '../context'
import {Name, Keyword, Keywords, opKeywordKindFromName, showKeyword} from '../Token'
import {ifElse} from '../util'
import {isNameCharacter} from './chars'
import {addToCurrentGroup} from './groupContext'
import {pos, skipRestOfLine, takeWhileWithPrev} from './sourceContext'

/**
This is called *after* having eaten the first character of the name.
@param {Pos} startPos Position of first character.
@param {boolean} isInterpolation
	Whether this is a quote interpolation name like `#foo`.
*/
export default function lexName(startPos, isInterpolation) {
	const name = takeWhileWithPrev(isNameCharacter)
	if (name.endsWith('_')) {
		if (name.length > 1)
			handleNameText(startPos, name.slice(0, name.length - 1), false)
		keyword(pos(), Keywords.Focus)
	} else
		handleNameText(startPos, name, !isInterpolation)
}

function handleNameText(startPos, name, allowSpecialKeywords) {
	ifElse(opKeywordKindFromName(name),
		kind => {
			switch (kind) {
				case Keywords.Region: case Keywords.Todo:
					check(allowSpecialKeywords, startPos, () =>
						`${showKeyword(kind)} is not allowed here.`)
					skipRestOfLine()
					if (kind === Keywords.Region)
						keyword(startPos, Keywords.Region)
					// todo: warn for all todo comments
					break
				default:
					keyword(startPos, kind)
			}
		},
		() => {
			addToCurrentGroup(new Name(new Loc(startPos, pos()), name))
		})
}

function keyword(startPos, kind) {
	addToCurrentGroup(new Keyword(new Loc(startPos, pos()), kind))
}

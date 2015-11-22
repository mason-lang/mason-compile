import {check} from '../context'
import {LocalDeclare, LocalDeclares} from '../MsAst'
import {Groups, isGroup, isKeyword, Keywords, Name} from '../Token'
import {opIf} from '../util'
import {checkNonEmpty, checkKeyword} from './checks'
import {parseSpaced} from './parse*'
import Slice from './Slice'

/**
Parse locals (`a` or `a:b`).
@return {Array<LocalDeclare>}
*/
export default function parseLocalDeclares(tokens) {
	return tokens.map(parseLocalDeclare)
}

/**
Parse locals with no types allowed.
@return {Array<LocalDeclare>}
*/
export function parseLocalDeclaresJustNames(tokens) {
	return tokens.map(_ => LocalDeclare.plain(_.loc, parseLocalName(_)))
}

/** Parse a single local declare. */
export function parseLocalDeclare(token) {
	return _parseLocalDeclare(token)
}

/** Parse a single local declare from the tokens in a {@link Groups.Space}. */
export function parseLocalDeclareFromSpaced(tokens) {
	return _parseLocalDeclareFromSpaced(tokens)
}

/**
For constructor. Parse local declares while allowing `.x`-style arguments.
@return {{declares: Array<LocalDeclare>, memberArgs: Array<LocalDeclare>}}
	`memberArgs` is  a subset of `declares`.
*/
export function parseLocalDeclaresAndMemberArgs(tokens) {
	const declares = [], memberArgs = []
	for (const token of tokens) {
		const {declare, isMember} = _parseLocalDeclare(token, true)
		declares.push(declare)
		if (isMember)
			memberArgs.push(declare)
	}
	return {declares, memberArgs}
}

/**
Parse a name for a local variable.
Unlike {@link parseName}, `_` is the only allowed Keyword.
@return {string}
*/
export function parseLocalName(token) {
	if (isKeyword(Keywords.Focus, token))
		return '_'
	else {
		check(token instanceof Name, token.loc, () => `Expected a local name, not ${token}.`)
		return token.name
	}
}

/**
If `tokens` is:
	empty: untyped focus
	`:Type`: typed focus
	`foo` or `foo:Type`: A normal LocalDeclare.
*/
export function parseLocalDeclareOrFocus(tokens) {
	if (tokens.isEmpty())
		return LocalDeclare.focus(tokens.loc)
	else {
		check(tokens.size() === 1, tokens.loc, 'Expected only one local declare.')
		const token = tokens.head()
		if (isGroup(Groups.Space, token)) {
			const slice = Slice.group(token)
			if (isKeyword(Keywords.Colon, slice.head()))
				return LocalDeclare.typedFocus(tokens.loc, parseSpaced(slice.tail()))
		}
		return parseLocalDeclare(token)
	}
}

function _parseLocalDeclare(token, orMember = false) {
	if (isGroup(Groups.Space, token))
		return _parseLocalDeclareFromSpaced(Slice.group(token), orMember)
	else {
		const declare = LocalDeclare.plain(token.loc, parseLocalName(token))
		return orMember ? {declare, isMember: false} : declare
	}
}

function _parseLocalDeclareFromSpaced(tokens, orMember = false) {
	const [rest, kind, isMember] =
		isKeyword(Keywords.Lazy, tokens.head()) ?
			[tokens.tail(), LocalDeclares.Lazy, false] :
			orMember && isKeyword(Keywords.Dot, tokens.head()) ?
			[tokens.tail(), LocalDeclares.Eager, true] :
			[tokens, LocalDeclares.Eager, false]
	const name = parseLocalName(rest.head())
	const rest2 = rest.tail()
	const opType = opIf(!rest2.isEmpty(), () => {
		const colon = rest2.head()
		checkKeyword(Keywords.Colon, colon)
		const tokensType = rest2.tail()
		checkNonEmpty(tokensType, () => `Expected something after ${colon}`)
		return parseSpaced(tokensType)
	})
	const declare = new LocalDeclare(tokens.loc, name, opType, kind)
	return orMember ? {declare, isMember} : declare
}

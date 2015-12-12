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
	const {name, opType, kind} = parseLocalParts(token)
	return new LocalDeclare(token.loc, name, opType, kind)
}

/** Parse a single local declare from the tokens in a {@link Groups.Space}. */
export function parseLocalDeclareFromSpaced(tokens) {
	const {name, opType, kind} = parseLocalPartsFromSpaced(tokens)
	return new LocalDeclare(tokens.loc, name, opType, kind)
}

/**
For constructor. Parse local declares while allowing `.x`-style arguments.
@return {{declares: Array<LocalDeclare>, memberArgs: Array<LocalDeclare>}}
	`memberArgs` is  a subset of `declares`.
*/
export function parseLocalDeclaresAndMemberArgs(tokens) {
	const declares = [], memberArgs = []
	for (const token of tokens) {
		const {name, opType, kind, isMember} = parseLocalParts(token, true)
		const declare = new LocalDeclare(token.loc, name, opType, kind)
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
		check(token instanceof Name, token.loc, 'expectedLocalName', token)
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
		check(tokens.size() === 1, tokens.loc, 'expectedOneLocal')
		const token = tokens.head()
		if (isGroup(Groups.Space, token)) {
			const slice = Slice.group(token)
			if (isKeyword(Keywords.Colon, slice.head()))
				return LocalDeclare.typedFocus(tokens.loc, parseSpaced(slice.tail()))
		}
		return parseLocalDeclare(token)
	}
}

/**
@param {boolean} orMember If true, parse locals like `.x` and return `isMember` with result.
@return {{name, opType, kind, isMember}}
*/
export function parseLocalParts(token, orMember = false) {
	return isGroup(Groups.Space, token) ?
		parseLocalPartsFromSpaced(Slice.group(token), orMember) :
		{name: parseLocalName(token), opType: null, kind: LocalDeclares.Eager, isMember: false}
}

function parseLocalPartsFromSpaced(tokens, orMember = false) {
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
		checkNonEmpty(tokensType, 'expectedAfterColon')
		return parseSpaced(tokensType)
	})
	return {name, opType, kind, isMember}
}

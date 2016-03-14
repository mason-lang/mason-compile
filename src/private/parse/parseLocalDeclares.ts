import Op, {opIf} from 'op/Op'
import {Val} from '../ast/LineContent'
import {LocalDeclare, LocalDeclares} from '../ast/locals'
import {check, fail} from '../context'
import {GroupSpace} from '../token/Group'
import {isKeyword, Kw} from '../token/Keyword'
import Token, {NameToken} from '../token/Token'
import {checkNonEmpty, checkKeyword} from './checks'
import parseSpaced from './parseSpaced'
import {Tokens} from './Slice'

/** Parse locals (`a` or `a:b`). */
export default function parseLocalDeclares(tokens: Tokens): Array<LocalDeclare> {
	return tokens.map(parseLocalDeclare)
}

/** Parse locals with no types allowed. */
export function parseLocalDeclaresJustNames(tokens: Tokens): Array<LocalDeclare> {
	return tokens.map(_ => LocalDeclare.plain(_.loc, parseLocalName(_)))
}

/** Parse a single local declare. */
export function parseLocalDeclare(token: Token): LocalDeclare {
	const {name, opType, kind} = parseLocalParts(token)
	return new LocalDeclare(token.loc, name, opType, kind)
}

/** Parse a single local declare from the tokens in a [[GroupSpace]]. */
export function parseLocalDeclareFromSpaced(tokens: Tokens): LocalDeclare {
	const {name, opType, kind} = parseLocalPartsFromSpaced(tokens)
	return new LocalDeclare(tokens.loc, name, opType, kind)
}

/**
For constructor. Parse local declares while allowing `.x`-style arguments.
@return `memberArgs` is  a subset of `declares`.
*/
export function parseLocalDeclaresAndMemberArgs(tokens: Tokens
	): {declares: Array<LocalDeclare>, memberArgs: Array<LocalDeclare>} {
	const declares: Array<LocalDeclare> = [], memberArgs: Array<LocalDeclare> = []
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
Unlike [[parseName]], `_` is the only allowed Keyword.
*/
export function parseLocalName(token: Token): string {
	if (isKeyword(Kw.Focus, token))
		return '_'
	else if (token instanceof NameToken)
		return token.name
	else
		throw fail(token.loc, _ => _.expectedLocalName(token))
}

/**
If `tokens` is:
	empty: untyped focus
	`:Type`: typed focus
	`foo` or `foo:Type`: A normal LocalDeclare.
*/
export function parseLocalDeclareOrFocus(tokens: Tokens): LocalDeclare {
	if (tokens.isEmpty())
		return LocalDeclare.focus(tokens.loc)
	else {
		check(tokens.size() === 1, tokens.loc, _ => _.expectedOneLocal)
		const token = tokens.head()
		if (token instanceof GroupSpace) {
			const slice = Tokens.of(token)
			if (isKeyword(Kw.Colon, slice.head()))
				return LocalDeclare.typedFocus(tokens.loc, parseSpaced(slice.tail()))
		}
		return parseLocalDeclare(token)
	}
}

/** @param orMember If true, parse locals like `.x` and return `isMember` with result. */
export function parseLocalParts(token: Token, orMember: boolean = false
	): {name: string, opType: Op<Val>, kind: LocalDeclares, isMember: boolean} {
	return token instanceof GroupSpace ?
		parseLocalPartsFromSpaced(Tokens.of(token), orMember) :
		{name: parseLocalName(token), opType: null, kind: LocalDeclares.Eager, isMember: false}
}

function parseLocalPartsFromSpaced(tokens: Tokens, orMember: boolean = false
	): {name: string, opType: Op<Val>, kind: LocalDeclares, isMember: boolean} {
	const [rest, kind, isMember] =
		isKeyword(Kw.Lazy, tokens.head()) ?
			[tokens.tail(), LocalDeclares.Lazy, false] :
			orMember && isKeyword(Kw.Dot, tokens.head()) ?
			[tokens.tail(), LocalDeclares.Eager, true] :
			[tokens, LocalDeclares.Eager, false]
	const name = parseLocalName(rest.head())
	const rest2 = rest.tail()
	const opType = opIf(!rest2.isEmpty(), () => {
		const colon = rest2.head()
		checkKeyword(Kw.Colon, colon)
		const tokensType = rest2.tail()
		checkNonEmpty(tokensType, _ => _.expectedAfterColon)
		return parseSpaced(tokensType)
	})
	return {name, opType, kind, isMember}
}

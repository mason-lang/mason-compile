import {Block, Fun, FunAbstract, Funs, LocalDeclare} from '../MsAst'
import {Groups, isAnyKeyword, isGroup, isKeyword, Keywords} from '../Token'
import {head} from '../util'
import {checkNonEmpty} from './checks'
import parseBlock, {beforeAndBlock} from './parseBlock'
import parseCase from './parseCase'
import parseLocalDeclares, {parseLocalDeclareFromSpaced, parseLocalDeclaresAndMemberArgs
	} from './parseLocalDeclares'
import parseSpaced from './parseSpaced'
import parseSwitch from './parseSwitch'
import Slice from './Slice'
import tryTakeComment from './tryTakeComment'

/**
Parse a {@link Fun}.
@param keywordKind {Keywords} A function keyword.
@param {Slice} tokens Rest of the line after the function keyword.
*/
export default function parseFun(keywordKind, tokens) {
	const [isThisFun, isDo, kind] = funKind(keywordKind)
	const {opReturnType, rest} = tryTakeReturnType(tokens)
	const {args, opRestArg, block} = funArgsAndBlock(rest, !isDo)
	return new Fun(tokens.loc, args, opRestArg, block, {kind, isThisFun, isDo, opReturnType})
}

/** Parse a {@link FunLike}. */
export function parseFunLike(keywordKind, tokens) {
	const [isThisFun, isDo, kind] = funKind(keywordKind)
	const {opReturnType, rest} = tryTakeReturnType(tokens)
	const [before, blockLines] = beforeAndBlock(rest)
	const [opComment, restLines] = tryTakeComment(blockLines)

	if (restLines.size() === 1) {
		const h = restLines.headSlice()
		if (h.size() === 1 && isKeyword(Keywords.Abstract, h.head())) {
			const {args, opRestArg} = parseFunLocals(before)
			return new FunAbstract(tokens.loc, args, opRestArg, opReturnType, opComment)
		}
	}

	const {args, opRestArg, block} = funArgsAndBlock(rest, !isDo)
	return new Fun(tokens.loc, args, opRestArg, block, {kind, isThisFun, isDo, opReturnType})
}

/**
Parse function arguments and body.
This also handles the `|case` and `|switch` forms.
@param {Slice} tokens
@param {boolean} isVal Whether this is a `|` as opposed to a `!|`
@param [includeMemberArgs]
	This is for constructors.
	If true, output will include `memberArgs`.
	This is the subset of `args` whose names are prefixed with `.`.
	e.g.: `construct! .x .y`
@return {
	args: Array<LocalDeclare>,
	opRestArg: ?LocalDeclare,
	memberArgs:Array<LocalDeclare>,
	block: Block
}
*/
export function funArgsAndBlock(tokens, isVal, includeMemberArgs = false) {
	checkNonEmpty(tokens, 'expectedBlock')
	const h = tokens.head()

	// Might be `|case` or `|switch`
	if (isAnyKeyword(funFocusKeywords, h)) {
		const expr = (h.kind === Keywords.Case ? parseCase : parseSwitch)(true, tokens.tail())
		const args = [LocalDeclare.focus(h.loc)]
		return {args, opRestArg: null, memberArgs: [], block: new Block(tokens.loc, null, [expr])}
	} else {
		const [before, blockLines] = beforeAndBlock(tokens)
		const {args, opRestArg, memberArgs} = parseFunLocals(before, includeMemberArgs)
		const block = parseBlock(blockLines)
		return {args, opRestArg, memberArgs, block}
	}
}

const funFocusKeywords = new Set([Keywords.Case, Keywords.Switch])

function funKind(keywordKind) {
	switch (keywordKind) {
		case Keywords.Fun:
			return [false, false, Funs.Plain]
		case Keywords.FunDo:
			return [false, true, Funs.Plain]
		case Keywords.FunThis:
			return [true, false, Funs.Plain]
		case Keywords.FunThisDo:
			return [true, true, Funs.Plain]
		case Keywords.FunAsync:
			return [false, false, Funs.Async]
		case Keywords.FunAsyncDo:
			return [false, true, Funs.Async]
		case Keywords.FunThisAsync:
			return [true, false, Funs.Async]
		case Keywords.FunThisAsyncDo:
			return [true, true, Funs.Async]
		case Keywords.FunGen:
			return [false, false, Funs.Generator]
		case Keywords.FunGenDo:
			return [false, true, Funs.Generator]
		case Keywords.FunThisGen:
			return [true, false, Funs.Generator]
		case Keywords.FunThisGenDo:
			return [true, true, Funs.Generator]
		default:
			throw new Error(keywordKind)
	}
}

function tryTakeReturnType(tokens) {
	if (!tokens.isEmpty()) {
		const h = tokens.head()
		if (isGroup(Groups.Space, h) && isKeyword(Keywords.Colon, head(h.subTokens)))
			return {
				opReturnType: parseSpaced(Slice.group(h).tail()),
				rest: tokens.tail()
			}
	}
	return {opReturnType: null, rest: tokens}
}

function parseFunLocals(tokens, includeMemberArgs) {
	if (tokens.isEmpty())
		return {args: [], memberArgs: [], opRestArg: null}
	else {
		let rest = tokens, opRestArg = null
		const l = tokens.last()
		if (isGroup(Groups.Space, l)) {
			const g = Slice.group(l)
			if (isKeyword(Keywords.Dot3, g.head())) {
				rest = tokens.rtail()
				opRestArg = parseLocalDeclareFromSpaced(g.tail())
			}
		}
		if (includeMemberArgs) {
			const {declares: args, memberArgs} = parseLocalDeclaresAndMemberArgs(rest)
			return {args, memberArgs, opRestArg}
		} else
			return {args: parseLocalDeclares(rest), opRestArg}
	}
}

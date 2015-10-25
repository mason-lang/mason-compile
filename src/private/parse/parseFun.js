import {BlockDo, BlockValReturn, Fun, Funs, LocalDeclare, LocalDeclares} from '../MsAst'
import {Groups, isAnyKeyword, isGroup, isKeyword, Keywords} from '../Token'
import {head} from '../util'
import {checkNonEmpty} from './checks'
import {beforeAndBlock, parseBlockDo, parseBlockVal} from './parseBlock'
import parseCase from './parseCase'
import parseLocalDeclares, {parseLocalDeclareFromSpaced, parseLocalDeclaresAndMemberArgs
	} from './parseLocalDeclares'
import parseSpaced from './parseSpaced'
import parseSwitch from './parseSwitch'
import Slice from './Slice'

/**
Parse a function.
@param kind {Keywords} A function keyword.
@param {Slice} tokens Rest of the line after the function keyword.
@return {Fun}
*/
export default function parseFun(keywordKind, tokens) {
	const [isThis, isDo, kind] = funKind(keywordKind)
	const {opReturnType, rest} = tryTakeReturnType(tokens)
	const {args, opRestArg, block} = funArgsAndBlock(rest, isDo)
	return new Fun(tokens.loc, args, opRestArg, block, kind, isThis, opReturnType)
}

/**
Parse function arguments and body.
This also handles the `|case` and `|switch` forms.
@param {Slice} tokens
@param {boolean} isDo Whether this is a `!|`
@param {includeMemberArgs}
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
export function funArgsAndBlock(tokens, isDo, includeMemberArgs=false) {
	checkNonEmpty(tokens, 'Expected an indented block.')
	const h = tokens.head()

	// Might be `|case` (or `|case!`, `|switch`, `|switch!`)
	if (isAnyKeyword(funFocusKeywords, h)) {
		const isVal = h.kind === Keywords.CaseVal || h.kind === Keywords.SwitchVal
		const isCase = h.kind === Keywords.CaseVal || h.kind === Keywords.CaseDo
		const expr = (isCase ? parseCase : parseSwitch)(isVal, true, tokens.tail())

		const args = [LocalDeclare.focus(h.loc)]
		return isVal ?
			{
				args, opRestArg: null, memberArgs: [],
				block: new BlockValReturn(tokens.loc, null, [], expr)
			} :
			{
				args, opRestArg: null, memberArgs: [],
				block: new BlockDo(tokens.loc, null, [expr])
			}
	} else {
		const [before, blockLines] = beforeAndBlock(tokens)
		const {args, opRestArg, memberArgs} = parseFunLocals(before, includeMemberArgs)
		for (const arg of args)
			if (!arg.isLazy())
				arg.kind = LocalDeclares.Mutable
		const block = (isDo ? parseBlockDo : parseBlockVal)(blockLines)
		return {args, opRestArg, memberArgs, block}
	}
}

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
		if (isGroup(Groups.Space, h) && isKeyword(Keywords.Type, head(h.subTokens)))
			return {
				opReturnType: parseSpaced(Slice.group(h).tail()),
				rest: tokens.tail()
			}
	}
	return {opReturnType: null, rest: tokens}
}

const funFocusKeywords = new Set([
	Keywords.CaseVal, Keywords.CaseDo, Keywords.SwitchVal, Keywords.SwitchDo
])

function parseFunLocals(tokens, includeMemberArgs) {
	if (tokens.isEmpty())
		return {args: [], memberArgs: [], opRestArg: null}
	else {
		let rest = tokens, opRestArg = null
		const l = tokens.last()
		if (isGroup(Groups.Space, l)) {
			const g = Slice.group(l)
			if (isKeyword(Keywords.Ellipsis, g.head())) {
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

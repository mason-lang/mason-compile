import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import Block from '../ast/Block'
import {FunBlock, Funs} from '../ast/Fun'
import {Val} from '../ast/LineContent'
import {LocalDeclare} from '../ast/locals'
import {FunAbstract, PolyValue} from '../ast/Poly'
import {GroupSpace} from '../token/Group'
import {isAnyKeyword, isKeyword, Keywords} from '../token/Keyword'
import {head} from '../util'
import {checkEmpty, checkNonEmpty} from './checks'
import parseBlock, {beforeAndBlock} from './parseBlock'
import {parseCaseFun} from './parseCase'
import parseLocalDeclares, {parseLocalDeclareFromSpaced, parseLocalDeclaresAndMemberArgs
	} from './parseLocalDeclares'
import {parsePipeFun} from './parsePipe'
import parseSpaced from './parseSpaced'
import {parseSwitchFun} from './parseSwitch'
import {Lines, Tokens} from './Slice'
import tryTakeComment from './tryTakeComment'

/**
Parse a [[Fun]].
@param keywordKind A function keyword.
@param tokens Rest of the line after the function keyword.
*/
export default function parseFunBlock(keywordKind: Keywords, tokens: Tokens): FunBlock {
	const [isThisFun, isDo, kind] = funKind(keywordKind)
	const [opReturnType, rest] = tryTakeReturnType(tokens)
	const {args, opRestArg, block} = funArgsAndBlock(rest, !isDo)
	return new FunBlock(tokens.loc, args, opRestArg, block, {kind, isThisFun, isDo, opReturnType})
}

export function parsePolyValue(keywordKind: Keywords, tokens: Tokens): PolyValue {
	const [isThisFun, isDo, kind] = funKind(keywordKind)
	const [opReturnType, rest] = tryTakeReturnType(tokens)
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
	return new FunBlock(tokens.loc, args, opRestArg, block, {kind, isThisFun, isDo, opReturnType})
}

/**
Parse function arguments and body.
This also handles the `|case` and `|switch` forms.
@param isVal Whether this is a `|` as opposed to a `!|`
@param [includeMemberArgs]
	This is for constructors.
	If true, output will include `memberArgs`.
	This is the subset of `args` whose names are prefixed with `.`.
	e.g.: `construct .x .y`
*/
export function funArgsAndBlock(
	tokens: Tokens,
	isVal: boolean,
	includeMemberArgs: boolean = false)
	: {
		args: Array<LocalDeclare>,
		opRestArg: Op<LocalDeclare>,
		memberArgs: Array<LocalDeclare>,
		block: Block
	} {
	checkNonEmpty(tokens, _ => _.expectedBlock)
	const h = tokens.head()

	if (isAnyKeyword(funFocusKeywords, h)) {
		const args = [LocalDeclare.focus(h.loc)]
		const [before, block] = beforeAndBlock(tokens.tail())
		checkEmpty(before, _ => _.funFocusArgIsImplicit(h.kind))
		const parser = ((): (loc: Loc, block: Lines) => Val => {
			switch (h.kind) {
				case Keywords.Case:
					return parseCaseFun
				case Keywords.Pipe:
					return parsePipeFun
				case Keywords.Switch:
					return parseSwitchFun
				default:
					throw new Error(String(h.kind))
			}
		})()
		const expr = parser(tokens.loc, block)
		return {args, opRestArg: null, memberArgs: [], block: new Block(tokens.loc, null, [expr])}
	} else {
		const [before, blockLines] = beforeAndBlock(tokens)
		const {args, opRestArg, memberArgs} = parseFunLocals(before, includeMemberArgs)
		const block = parseBlock(blockLines)
		return {args, opRestArg, memberArgs, block}
	}
}

const funFocusKeywords = new Set([Keywords.Case, Keywords.Pipe, Keywords.Switch])

function funKind(keywordKind: Keywords): [boolean, boolean, Funs] {
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
		case Keywords.FunAsynDo:
			return [false, true, Funs.Async]
		case Keywords.FunThisAsync:
			return [true, false, Funs.Async]
		case Keywords.FunThisAsynDo:
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
			throw new Error(String(keywordKind))
	}
}

function tryTakeReturnType(tokens: Tokens): [Op<Val>, Tokens] {
	if (!tokens.isEmpty()) {
		const h = tokens.head()
		if (h instanceof GroupSpace && isKeyword(Keywords.Colon, head(h.subTokens)))
			return [parseSpaced(Tokens.of(h).tail()), tokens.tail()]
	}
	return [null, tokens]
}

function parseFunLocals(tokens: Tokens, includeMemberArgs: boolean = false)
	: {args: Array<LocalDeclare>, memberArgs: Array<LocalDeclare>, opRestArg: Op<LocalDeclare>} {
	if (tokens.isEmpty())
		return {args: [], memberArgs: [], opRestArg: null}
	else {
		let rest = tokens, opRestArg: Op<LocalDeclare> = null
		const l = tokens.last()
		if (l instanceof GroupSpace) {
			const g = Tokens.of(l)
			if (isKeyword(Keywords.Dot3, g.head())) {
				rest = tokens.rtail()
				opRestArg = parseLocalDeclareFromSpaced(g.tail())
			}
		}
		if (includeMemberArgs) {
			const {declares: args, memberArgs} = parseLocalDeclaresAndMemberArgs(rest)
			return {args, memberArgs, opRestArg}
		} else
			return {args: parseLocalDeclares(rest), memberArgs: [], opRestArg}
	}
}

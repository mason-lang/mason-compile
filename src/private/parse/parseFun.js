import {BlockDo, BlockWithReturn, Fun, LD_Mutable, LocalDeclareFocus, LocalDeclareRes,
	LocalDeclareThis} from '../MsAst'
import {G_Space, isAnyKeyword, isGroup, isKeyword, KW_CaseDo, KW_CaseVal, KW_Ellipsis, KW_Fun,
	KW_FunDo, KW_FunGen, KW_FunGenDo, KW_FunThis, KW_FunThisDo, KW_FunThisGen, KW_FunThisGenDo,
	KW_SwitchDo, KW_SwitchVal, KW_Type} from '../Token'
import {head, opIf, opMap} from '../util'
import {checkNonEmpty} from './checks'
import {beforeAndBlock, parseBlockDo, parseBlockVal} from './parseBlock'
import parseCase from './parseCase'
import parseLocalDeclares, {parseLocalDeclareFromSpaced, parseLocalDeclaresAndMemberArgs
	} from './parseLocalDeclares'
import parseSpaced from './parseSpaced'
import parseSwitch from './parseSwitch'
import Slice from './Slice'

export default (kind, tokens) => {
	let isThis = false, isDo = false, isGen = false
	switch (kind) {
		case KW_Fun:
			break
		case KW_FunDo:
			isDo = true
			break
		case KW_FunGen:
			isGen = true
			break
		case KW_FunGenDo:
			isGen = true
			isDo = true
			break
		case KW_FunThis:
			isThis = true
			break
		case KW_FunThisDo:
			isThis = true
			isDo = true
			break
		case KW_FunThisGen:
			isThis = true
			isGen = true
			break
		case KW_FunThisGenDo:
			isThis = true
			isGen = true
			isDo = true
			break
		default: throw new Error()
	}
	const opDeclareThis = opIf(isThis, () => new LocalDeclareThis(tokens.loc))

	const {opReturnType, rest} = tryTakeReturnType(tokens)
	const {args, opRestArg, block, opComment} = _funArgsAndBlock(isDo, rest)
	// Need res declare if there is a return type.
	const opDeclareRes = opMap(opReturnType, _ => new LocalDeclareRes(_.loc, _))
	return new Fun(tokens.loc,
		opDeclareThis, isGen, args, opRestArg, block, opDeclareRes, opComment)
}

/*
includeMemberArgs:
	if true, output will include `memberArgs`.
	This is a subset of `args` whose names are prefixed with `.`
	e.g.: `construct! .x .y`
	This is for constructors only.
*/
export const _funArgsAndBlock = (isDo, tokens, includeMemberArgs) => {
	checkNonEmpty(tokens, 'Expected an indented block.')
	const h = tokens.head()

	// Might be `|case` (or `|case!`, `|switch`, `|switch!`)
	if (isAnyKeyword(funFocusKeywords, h)) {
		const isVal = h.kind === KW_CaseVal || h.kind === KW_SwitchVal
		const isCase = h.kind === KW_CaseVal || h.kind === KW_CaseDo
		const expr = (isCase ? parseCase : parseSwitch)(isVal, true, tokens.tail())

		const args = [new LocalDeclareFocus(h.loc)]
		return isVal ?
			{
				args, opRestArg: null, memberArgs: [],
				block: new BlockWithReturn(tokens.loc, null, [], expr)
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
				arg.kind = LD_Mutable
		const block = (isDo ? parseBlockDo : parseBlockVal)(blockLines)
		return {args, opRestArg, memberArgs, block}
	}
}

const
	tryTakeReturnType = tokens => {
		if (!tokens.isEmpty()) {
			const h = tokens.head()
			if (isGroup(G_Space, h) && isKeyword(KW_Type, head(h.subTokens)))
				return {
					opReturnType: parseSpaced(Slice.group(h).tail()),
					rest: tokens.tail()
				}
		}
		return {opReturnType: null, rest: tokens}
	},

	funFocusKeywords = new Set([KW_CaseVal, KW_CaseDo, KW_SwitchVal, KW_SwitchDo]),

	parseFunLocals = (tokens, includeMemberArgs) => {
		if (tokens.isEmpty())
			return {args: [], memberArgs: [], opRestArg: null}
		else {
			let rest = tokens, opRestArg = null
			const l = tokens.last()
			if (isGroup(G_Space, l)) {
				const g = Slice.group(l)
				if (isKeyword(KW_Ellipsis, g.head())) {
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

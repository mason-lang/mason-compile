import {BlockDo, BlockValReturn, Fun, LocalDeclareFocus, LocalDeclareRes, LocalDeclares,
	LocalDeclareThis} from '../MsAst'
import {Groups, isAnyKeyword, isGroup, isKeyword, Keywords} from '../Token'
import {head, opIf, opMap} from '../util'
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
export default function parseFun(kind, tokens) {
	let isThis = false, isDo = false, isGenerator = false
	switch (kind) {
		case Keywords.Fun:
			break
		case Keywords.FunDo:
			isDo = true
			break
		case Keywords.FunGen:
			isGenerator = true
			break
		case Keywords.FunGenDo:
			isGenerator = true
			isDo = true
			break
		case Keywords.FunThis:
			isThis = true
			break
		case Keywords.FunThisDo:
			isThis = true
			isDo = true
			break
		case Keywords.FunThisGen:
			isThis = true
			isGenerator = true
			break
		case Keywords.FunThisGenDo:
			isThis = true
			isGenerator = true
			isDo = true
			break
		default: throw new Error()
	}
	const opDeclareThis = opIf(isThis, () => new LocalDeclareThis(tokens.loc))

	const {opReturnType, rest} = tryTakeReturnType(tokens)
	const {args, opRestArg, block} = funArgsAndBlock(rest, isDo)
	// Need res declare if there is a return type.
	const opDeclareRes = opMap(opReturnType, _ => new LocalDeclareRes(_.loc, _))
	return new Fun(tokens.loc, args, opRestArg, block, isGenerator, opDeclareThis, opDeclareRes)
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

		const args = [new LocalDeclareFocus(h.loc)]
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

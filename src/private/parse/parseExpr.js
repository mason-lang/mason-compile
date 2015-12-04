import Loc from 'esast/dist/Loc'
import {check, warn} from '../context'
import {Await, Call, Cond, Conditional, LocalDeclare, Logic, Logics, New, Not, ObjPair, ObjSimple,
	Pipe, SuperCall, With, Yield, YieldTo} from '../MsAst'
import {Groups, isAnyKeyword, isGroup, isKeyword, Keywords, Name, showGroup, showKeyword
	} from '../Token'
import {cat, head, ifElse, opIf, tail} from '../util'
import {checkNonEmpty} from './checks'
import {parseClass, parseExcept, parseSingle, parseSwitch} from './parse*'
import parseBlock, {beforeAndBlock, beforeAndOpBlock} from './parseBlock'
import parseCase from './parseCase'
import parseDel from './parseDel'
import parseFor from './parseFor'
import parseFun from './parseFun'
import parseMethod from './parseMethod'
import parseKind from './parseKind'
import {parseLocalDeclare} from './parseLocalDeclares'
import Slice from './Slice'

/** Parse a {@link Val}. */
export default function parseExpr(tokens) {
	return ifElse(tokens.opSplitMany(_ => isKeyword(Keywords.ObjAssign, _)),
		splits => {
			// Short object form, such as (a. 1, b. 2)
			const first = splits[0].before
			checkNonEmpty(first, () => `Unexpected ${splits[0].at}`)
			const tokensCaller = first.rtail()

			const pairs = []
			for (let i = 0; i < splits.length - 1; i = i + 1) {
				const name = splits[i].before.last()
				check(name instanceof Name, name.loc, () =>
					`Expected a name, not ${name}`)
				const tokensValue = i === splits.length - 2 ?
					splits[i + 1].before :
					splits[i + 1].before.rtail()
				const value = parseExprPlain(tokensValue)
				const loc = new Loc(name.loc.start, tokensValue.loc.end)
				pairs.push(new ObjPair(loc, name.name, value))
			}
			const val = new ObjSimple(tokens.loc, pairs)
			if (tokensCaller.isEmpty())
				return val
			else {
				const parts = parseExprParts(tokensCaller)
				return new Call(tokens.loc, head(parts), cat(tail(parts), val))
			}
		},
		() => parseExprPlain(tokens))
}

export function opParseExpr(tokens) {
	return opIf(!tokens.isEmpty(), () => parseExpr(tokens))
}

/**
Treating tokens separately, parse {@link Val}s.
This is called for e.g. the contents of an array (`[a b c]`).
This is different from {@link parseExpr} because `a b` will parse as 2 different things, not a call.
However, `cond a b c` will still parse as a single expression.
@return {Array<Val>}
*/
export function parseExprParts(tokens) {
	return ifElse(tokens.opSplitOnce(isSplitKeyword),
		({before, at, after}) => cat(before.map(parseSingle), keywordExpr(at, after)),
		() => {
			// If the last part starts with a keyword, parens are unnecessary.
			// e.g.: `foo (not true)` can just be `foo not true`.
			// Note that `foo (not true) false` does need the parens.
			const last = tokens.last()
			if (isGroup(Groups.Parenthesis, last)) {
				const h = Slice.group(last).head()
				if (isSplitKeyword(h))
					warn(h.loc, `Unnecessary ${showGroup(Groups.Parenthesis)}`)
			}
			return tokens.map(parseSingle)
		})
}

/** The keyword `at` groups with everything after it. */
function keywordExpr(at, after) {
	switch (at.kind) {
		case Keywords.And: case Keywords.Or: {
			const kind = at.kind === Keywords.And ? Logics.And : Logics.Or
			return new Logic(at.loc, kind, parseExprParts(after))
		}
		case Keywords.Await:
			return new Await(at.loc, parseExprPlain(after))
		case Keywords.Case:
			return parseCase(false, after)
		case Keywords.Class:
			return parseClass(after)
		case Keywords.Cond:
			return parseCond(after)
		case Keywords.Del:
			return parseDel(after)
		case Keywords.Except:
			return parseExcept(after)
		case Keywords.For: case Keywords.ForAsync: case Keywords.ForBag:
			return parseFor(at.kind, after)
		case Keywords.Fun: case Keywords.FunDo:
		case Keywords.FunThis: case Keywords.FunThisDo:
		case Keywords.FunAsync: case Keywords.FunAsyncDo:
		case Keywords.FunThisAsync: case Keywords.FunThisAsyncDo:
		case Keywords.FunGen: case Keywords.FunGenDo:
		case Keywords.FunThisGen: case Keywords.FunThisGenDo:
			return parseFun(at.kind, after)
		case Keywords.If: case Keywords.Unless:
			return parseConditional(at.kind, after)
		case Keywords.Kind:
			return parseKind(after)
		case Keywords.Method:
			return parseMethod(after)
		case Keywords.New: {
			const parts = parseExprParts(after)
			return new New(at.loc, head(parts), tail(parts))
		}
		case Keywords.Not:
			return new Not(at.loc, parseExprPlain(after))
		case Keywords.Pipe:
			return parsePipe(after)
		case Keywords.Super:
			return new SuperCall(at.loc, parseExprParts(after))
		case Keywords.Switch:
			return parseSwitch(false, after)
		case Keywords.With:
			return parseWith(after)
		case Keywords.Yield:
			return new Yield(at.loc, opIf(!after.isEmpty(), () => parseExprPlain(after)))
		case Keywords.YieldTo:
			return new YieldTo(at.loc, parseExprPlain(after))
		default:
			throw new Error(at.kind)
	}
}

const exprSplitKeywords = new Set([
	Keywords.And, Keywords.Await, Keywords.Case, Keywords.Class, Keywords.Cond, Keywords.Del,
	Keywords.Except, Keywords.For, Keywords.ForAsync, Keywords.ForBag, Keywords.Fun, Keywords.FunDo,
	Keywords.FunThis, Keywords.FunThisDo, Keywords.FunAsync, Keywords.FunAsyncDo,
	Keywords.FunThisAsync, Keywords.FunThisAsyncDo, Keywords.FunGen, Keywords.FunGenDo,
	Keywords.FunThisGen, Keywords.FunThisGenDo, Keywords.If, Keywords.Kind, Keywords.Method,
	Keywords.New, Keywords.Not, Keywords.Or, Keywords.Pipe, Keywords.Super, Keywords.Switch,
	Keywords.Unless, Keywords.With, Keywords.Yield, Keywords.YieldTo
])

function isSplitKeyword(_) {
	return isAnyKeyword(exprSplitKeywords, _)
}

function parseExprPlain(tokens) {
	checkNonEmpty(tokens, 'Expected an expression, got nothing.')
	const parts = parseExprParts(tokens)
	if (parts.length === 1) {
		/*
		Warn if an expression consists only of a Groups.Parenthesis.
		e.g.: `(not true)` on a line by itself
		e.g.: `not (not true)` because the first `not` takes an expression after it.
		*/
		// todo: this is a good reason to change the ObjSimple syntax.
		// `a. 1 b. 2` is interpreted as the ObjEntry `a. 1 (b. 2)`, so it needs parentheses.
		if (isGroup(Groups.Parenthesis, tokens.head()) && !head(parts) instanceof ObjSimple)
			warn(tokens.loc, `Unnecessary ${showGroup(Groups.Parenthesis)}.`)
		return head(parts)
	} else
		return new Call(tokens.loc, head(parts), tail(parts))
}

function parseCond(tokens) {
	const parts = parseExprParts(tokens)
	check(parts.length === 3, tokens.loc, () =>
		`${showKeyword(Keywords.Cond)} takes exactly 3 arguments.`)
	return new Cond(tokens.loc, ...parts)
}

function parseConditional(kind, tokens) {
	const [before, opBlock] = beforeAndOpBlock(tokens)
	const [condition, result] = ifElse(opBlock,
		_ => [parseExprPlain(before), parseBlock(_)],
		() => {
			const parts = parseExprParts(before)
			check(parts.length === 2, tokens.loc, () =>
				`${showKeyword(kind)} with no block takes exactly 2 arguments.`)
			return parts
		})
	return new Conditional(tokens.loc, condition, result, kind === Keywords.Unless)
}

function parsePipe(tokens) {
	const [before, block] = beforeAndBlock(tokens)
	const val = parseExpr(before)
	const pipes = block.mapSlices(parseExpr)
	return new Pipe(tokens.loc, val, pipes)
}

function parseWith(tokens) {
	const [before, block] = beforeAndBlock(tokens)

	const [val, declare] = ifElse(before.opSplitOnce(_ => isKeyword(Keywords.As, _)),
		({before, after}) => {
			check(after.size() === 1, () =>
				`Expected only 1 token after ${showKeyword(Keywords.As)}.`)
			return [parseExprPlain(before), parseLocalDeclare(after.head())]
		},
		() => [parseExprPlain(before), LocalDeclare.focus(tokens.loc)])

	return new With(tokens.loc, declare, val, parseBlock(block))
}

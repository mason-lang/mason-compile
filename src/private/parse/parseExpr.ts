import Op, {caseOp, opIf} from 'op/Op'
import Loc from 'esast/lib/Loc'
import Await from '../ast/Await'
import {Cond, Conditional, Logic, Logics, Not} from '../ast/booleans'
import Block from '../ast/Block'
import Call, {New} from '../ast/Call'
import {SuperCall} from '../ast/Class'
import {Val} from '../ast/LineContent'
import {LocalDeclare} from '../ast/locals'
import {ObjPair, ObjSimple, Pipe} from '../ast/Val'
import With from '../ast/With'
import {Yield, YieldTo} from '../ast/YieldLike'
import {check, warn} from '../context'
import Language from '../languages/Language'
import {GroupParenthesis} from '../token/Group'
import Keyword, {isAnyKeyword, isKeyword, Keywords} from '../token/Keyword'
import Token from '../token/Token'
import {cat, head, tail} from '../util'
import {checkNonEmpty} from './checks'
import parseBlock, {beforeAndBlock, beforeAndOpBlock} from './parseBlock'
import parseClass from './parseClass'
import parseCase from './parseCase'
import parseDel from './parseDel'
import parseExcept from './parseExcept'
import {parseFor, parseForAsync, parseForBag} from './parseFor'
import parseFun from './parseFunBlock'
import parseMemberName from './parseMemberName'
import parseMethod from './parseMethod'
import parseSingle from './parseSingle'
import parseSwitch from './parseSwitch'
import parseTrait from './parseTrait'
import {parseLocalDeclare} from './parseLocalDeclares'
import {Lines, Tokens} from './Slice'

/** Parse a [[Val]]. */
export default function parseExpr(tokens: Tokens): Val {
	return caseOp(
		tokens.opSplitMany(_ => isKeyword(Keywords.ObjEntry, _)),
		_ => parseObjSimple(tokens.loc, _),
		() => parseExprPlain(tokens))
}

export function opParseExpr(tokens: Tokens): Op<Val> {
	return opIf(!tokens.isEmpty(), () => parseExpr(tokens))
}

/**
Treating tokens separately, parse [[Val]]s.
This is called for e.g. the contents of an array (`[a b c]`).
This is different from [[parseExpr]] because `a b` will parse as 2 different things, not a call.
However, `cond a b c` will still parse as a single expression.
*/
export function parseExprParts(tokens: Tokens): Array<Val> {
	return caseOp(
		tokens.opSplitOnce(isSplitKeyword),
		({before, at, after}) =>
			cat(before.map(parseSingle), keywordExpr(<Keyword> at, after)),
		() => {
			// If the last part starts with a keyword, parens are unnecessary.
			// e.g.: `foo (not true)` can just be `foo not true`.
			// Note that `foo (not true) false` does need the parens.
			const last = tokens.last()
			if (last instanceof GroupParenthesis) {
				const h = Tokens.of(last).head()
				if (isSplitKeyword(h))
					warn(h.loc, _ => _.extraParens)
			}
			return tokens.map(parseSingle)
		})
}

/** Parse exactly `n` Vals, or fail with `errorCode`. */
export function parseNExprParts(tokens: Tokens, n: number, message: (_: Language) => string)
	: Array<Val> {
	const parts = parseExprParts(tokens)
	check(parts.length === n, tokens.loc, message)
	return parts
}

function parseObjSimple(loc: Loc, splits: Array<{before: Tokens, at: Token}>): Val {
	// Short object form, such as (a. 1, b. 2)
	const first = splits[0].before
	checkNonEmpty(first, _ => _.unexpected(splits[0].at))
	const tokensCaller = first.rtail()

	const pairs: Array<ObjPair> = []
	for (let i = 0; i < splits.length - 1; i = i + 1) {
		const nameToken = splits[i].before.last()
		const name = parseMemberName(nameToken)
		const tokensValue = i === splits.length - 2 ?
			splits[i + 1].before :
			splits[i + 1].before.rtail()
		const value = parseExprPlain(tokensValue)
		const loc = new Loc(nameToken.loc.start, tokensValue.loc.end)
		pairs.push(new ObjPair(loc, name, value))
	}
	const val = new ObjSimple(loc, pairs)
	if (tokensCaller.isEmpty())
		return val
	else {
		const parts = parseExprParts(tokensCaller)
		return new Call(loc, head(parts), cat(tail(parts), val))
	}
}

/** The keyword `at` groups with everything after it. */
function keywordExpr(at: Keyword, after: Tokens): Val {
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
		case Keywords.For:
			return parseFor(after)
		case Keywords.ForAsync:
			return parseForAsync(after)
		case Keywords.ForBag:
			return parseForBag(after)
		case Keywords.Fun: case Keywords.FunDo:
		case Keywords.FunThis: case Keywords.FunThisDo:
		case Keywords.FunAsync: case Keywords.FunAsynDo:
		case Keywords.FunThisAsync: case Keywords.FunThisAsynDo:
		case Keywords.FunGen: case Keywords.FunGenDo:
		case Keywords.FunThisGen: case Keywords.FunThisGenDo:
			return parseFun(at.kind, after)
		case Keywords.If: case Keywords.Unless:
			return parseConditional(at.kind, after)
		case Keywords.Trait:
			return parseTrait(after)
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
			throw new Error(String(at.kind))
	}
}

const exprSplitKeywords = new Set<Keywords>([
	Keywords.And, Keywords.Await, Keywords.Case, Keywords.Class, Keywords.Cond, Keywords.Del,
	Keywords.Except, Keywords.For, Keywords.ForAsync, Keywords.ForBag, Keywords.Fun, Keywords.FunDo,
	Keywords.FunThis, Keywords.FunThisDo, Keywords.FunAsync, Keywords.FunAsynDo,
	Keywords.FunThisAsync, Keywords.FunThisAsynDo, Keywords.FunGen, Keywords.FunGenDo,
	Keywords.FunThisGen, Keywords.FunThisGenDo, Keywords.If, Keywords.Method, Keywords.New,
	Keywords.Not, Keywords.Or, Keywords.Pipe, Keywords.Super, Keywords.Switch, Keywords.Trait,
	Keywords.Unless, Keywords.With, Keywords.Yield, Keywords.YieldTo
])

function isSplitKeyword(_: Token): boolean {
	return isAnyKeyword(exprSplitKeywords, _)
}

function parseExprPlain(tokens: Tokens): Val {
	checkNonEmpty(tokens, _ => _.expectedExpression)
	const parts = parseExprParts(tokens)
	if (parts.length === 1) {
		/*
		Warn if an expression consists only of a GroupParenthesis.
		e.g.: `(not true)` on a line by itself
		e.g.: `not (not true)` because the first `not` takes an expression after it.
		*/
		// todo: this is a good reason to change the ObjSimple syntax.
		// `a. 1 b. 2` is interpreted as the ObjEntry `a. 1 (b. 2)`, so it needs parentheses.
		if (tokens.head() instanceof GroupParenthesis && !(head(parts) instanceof ObjSimple))
			warn(tokens.loc, _ => _.extraParens)
		return head(parts)
	} else
		return new Call(tokens.loc, head(parts), tail(parts))
}

function parseCond(tokens: Tokens): Val {
	const [cond, ifTrue, ifFalse] = parseNExprParts(tokens, 3, _ => _.argsCond)
	return new Cond(tokens.loc, cond, ifTrue, ifFalse)
}

function parseConditional(kind: Keywords, tokens: Tokens): Conditional {
	const [before, opBlock] = beforeAndOpBlock(tokens)
	const [condition, result] = caseOp<Lines, [Val, Block | Val]>(
		opBlock,
		_ => [parseExprPlain(before), parseBlock(_)],
		() => <[Val, Block | Val]> (<any> parseNExprParts(before, 2, _ => _.argsConditional(kind))))
	return new Conditional(tokens.loc, condition, result, kind === Keywords.Unless)
}

function parsePipe(tokens: Tokens): Pipe {
	const [before, block] = beforeAndBlock(tokens)
	return new Pipe(tokens.loc, parseExpr(before), block.mapSlices(parseExpr))
}

function parseWith(tokens: Tokens): With {
	const [before, block] = beforeAndBlock(tokens)
	const [val, declare] = caseOp<{before: Tokens, after: Tokens}, [Val, LocalDeclare]>(
		before.opSplitOnce(_ => isKeyword(Keywords.As, _)),
		({before, after}) => {
			check(after.size() === 1, after.loc, _ => _.asToken)
			return [parseExprPlain(before), parseLocalDeclare(after.head())]
		},
		() => [parseExprPlain(before), LocalDeclare.focus(tokens.loc)])

	return new With(tokens.loc, declare, val, parseBlock(block))
}
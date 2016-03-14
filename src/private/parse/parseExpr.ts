import Op, {caseOp, opIf} from 'op/Op'
import Await from '../ast/Await'
import {Cond, Conditional} from '../ast/booleans'
import Block from '../ast/Block'
import Call, {New} from '../ast/Call'
import {SuperCall} from '../ast/Class'
import {Val} from '../ast/LineContent'
import {LocalDeclare} from '../ast/locals'
import {Operator, UnaryOperator} from '../ast/Val'
import With from '../ast/With'
import {Yield, YieldTo} from '../ast/YieldLike'
import {check, warn} from '../context'
import Language from '../languages/Language'
import {GroupParenthesis} from '../token/Group'
import Keyword, {isExprSplitKeyword, isKeyword, KeywordFun, KeywordOperator, KeywordPlain,
	KeywordUnaryOperator, Kw} from '../token/Keyword'
import {cat, head, tail} from '../util'
import {checkNonEmpty} from './checks'
import parseBlock, {beforeAndBlock, beforeAndOpBlock} from './parseBlock'
import parseClass from './parseClass'
import parseCase from './parseCase'
import parseDel from './parseDel'
import parseExcept from './parseExcept'
import {parseFor, parseForAsync, parseForBag} from './parseFor'
import parseFun from './parseFunBlock'
import parsePipe from './parsePipe'
import parsePoly from './parsePoly'
import parseSingle from './parseSingle'
import parseSwitch from './parseSwitch'
import parseTrait from './parseTrait'
import {parseLocalDeclare} from './parseLocalDeclares'
import {Lines, Tokens} from './Slice'

/** Parse a [[Val]]. */
export default function parseExpr(tokens: Tokens): Val {
	checkNonEmpty(tokens, _ => _.expectedExpression)
	const parts = parseExprParts(tokens)
	if (parts.length === 1) {
		/*
		Warn if an expression consists only of a GroupParenthesis.
		e.g.: `(not true)` on a line by itself
		e.g.: `not (not true)` because the first `not` takes an expression after it.
		*/
		if (tokens.head() instanceof GroupParenthesis)
			warn(tokens.loc, _ => _.extraParens)
		return head(parts)
	} else
		return new Call(tokens.loc, head(parts), tail(parts))
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
		tokens.opSplitOnce(isExprSplitKeyword),
		({before, at, after}) =>
			cat(before.map(parseSingle), keywordExpr(<KeywordPlain> at, after)),
		() => {
			// If the last part starts with a keyword, parens are unnecessary.
			// e.g.: `foo (not true)` can just be `foo not true`.
			// Note that `foo (not true) false` does need the parens.
			const last = tokens.last()
			if (last instanceof GroupParenthesis) {
				const h = Tokens.of(last).head()
				if (isExprSplitKeyword(h))
					warn(h.loc, _ => _.extraParens)
			}
			return tokens.map(parseSingle)
		})
}

/** Parse exactly `n` Vals, or fail with `errorCode`. */
export function parseNExprParts(tokens: Tokens, n: number, message: (_: Language) => string
	): Array<Val> {
	const parts = parseExprParts(tokens)
	check(parts.length === n, tokens.loc, message)
	return parts
}

function keywordExpr(at: Keyword, after: Tokens): Val {
	if (at instanceof KeywordFun)
		return parseFun(at.options, after)
	else if (at instanceof KeywordOperator)
		return new Operator(at.loc, at.kind, parseExprParts(after))
	else if (at instanceof KeywordUnaryOperator)
		return new UnaryOperator(at.loc, at.kind, parseExpr(after))
	else if (at instanceof KeywordPlain)
		return keywordPlainExpr(at, after)
	else
		throw new Error(at.name())
}

/** The keyword `at` groups with everything after it. */
function keywordPlainExpr({kind, loc}: KeywordPlain, after: Tokens): Val {
	switch (kind) {
		case Kw.Await:
			return new Await(loc, parseExpr(after))
		case Kw.Case:
			return parseCase(after)
		case Kw.Class:
			return parseClass(after)
		case Kw.Cond:
			return parseCond(after)
		case Kw.Del:
			return parseDel(after)
		case Kw.Except:
			return parseExcept(after)
		case Kw.For:
			return parseFor(after)
		case Kw.ForAsync:
			return parseForAsync(after)
		case Kw.ForBag:
			return parseForBag(after)
		case Kw.If: case Kw.Unless:
			return parseConditional(kind, after)
		case Kw.New: {
			const parts = parseExprParts(after)
			return new New(loc, head(parts), tail(parts))
		}
		case Kw.Pipe:
			return parsePipe(after)
		case Kw.Poly:
			return parsePoly(after)
		case Kw.Super:
			return new SuperCall(loc, parseExprParts(after))
		case Kw.Switch:
			return parseSwitch(after)
		case Kw.Trait:
			return parseTrait(after)
		case Kw.With:
			return parseWith(after)
		case Kw.Yield:
			return new Yield(loc, opIf(!after.isEmpty(), () => parseExpr(after)))
		case Kw.YieldTo:
			return new YieldTo(loc, parseExpr(after))
		default:
			throw new Error(String(kind))
	}
}

function parseCond(tokens: Tokens): Val {
	const [cond, ifTrue, ifFalse] = parseNExprParts(tokens, 3, _ => _.argsCond)
	return new Cond(tokens.loc, cond, ifTrue, ifFalse)
}

function parseConditional(kind: Kw, tokens: Tokens): Conditional {
	const [before, opBlock] = beforeAndOpBlock(tokens)
	const [condition, result] = caseOp<Lines, [Val, Block | Val]>(
		opBlock,
		_ => [parseExpr(before), parseBlock(_)],
		() => <[Val, Block | Val]> (<any> parseNExprParts(before, 2, _ => _.argsConditional(kind))))
	return new Conditional(tokens.loc, condition, result, kind === Kw.Unless)
}

function parseWith(tokens: Tokens): With {
	const [before, block] = beforeAndBlock(tokens)
	const [val, declare] = caseOp<{before: Tokens, after: Tokens}, [Val, LocalDeclare]>(
		before.opSplitOnce(_ => isKeyword(Kw.As, _)),
		({before, after}) => {
			check(after.size() === 1, after.loc, _ => _.asToken)
			return [parseExpr(before), parseLocalDeclare(after.head())]
		},
		() => [parseExpr(before), LocalDeclare.focus(tokens.loc)])

	return new With(tokens.loc, declare, val, parseBlock(block))
}

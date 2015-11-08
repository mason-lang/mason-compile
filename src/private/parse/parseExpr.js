import Loc from 'esast/dist/Loc'
import {check, fail} from '../context'
import {Call, Cond, Conditional, LocalDeclare, Logic, Logics, New, Not, ObjPair, ObjSimple,
	SuperCall, With, Yield, YieldTo} from '../MsAst'
import {isAnyKeyword, isKeyword, Keywords, Name, showKeyword} from '../Token'
import {cat, head, ifElse, opIf, tail} from '../util'
import {checkNonEmpty} from './checks'
import {parseClass, parseExcept, parseSingle, parseSwitch} from './parse*'
import parseBlock, {beforeAndBlock} from './parseBlock'
import parseCase from './parseCase'
import parseDel from './parseDel'
import {parseFor, parseForBag} from './parseFor'
import parseFun from './parseFun'
import parseMethod from './parseMethod'
import parseKind from './parseKind'
import {parseLocalDeclare} from './parseLocalDeclares'

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
	return ifElse(tokens.opSplitOnce(_ => isAnyKeyword(exprSplitKeywords, _)),
		({before, at, after}) => {
			const getLast = () => {
				switch (at.kind) {
					case Keywords.And: case Keywords.Or: {
						const kind = at.kind === Keywords.And ? Logics.And : Logics.Or
						return new Logic(at.loc, kind, parseExprParts(after))
					}
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
					case Keywords.ForBag:
						return parseForBag(after)
					case Keywords.For:
						return parseFor(after)
					case Keywords.Fun: case Keywords.FunDo:
					case Keywords.FunThis: case Keywords.FunThisDo:
					case Keywords.FunAsync: case Keywords.FunAsyncDo:
					case Keywords.FunThisAsync: case Keywords.FunThisAsyncDo:
					case Keywords.FunGen: case Keywords.FunGenDo:
					case Keywords.FunThisGen: case Keywords.FunThisGenDo:
						return parseFun(at.kind, after)
					case Keywords.If: case Keywords.Unless: {
						const [before, block] = beforeAndBlock(after)
						return new Conditional(tokens.loc,
							parseExprPlain(before),
							parseBlock(block),
							at.kind === Keywords.Unless)
					}
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
					case Keywords.Super:
						return new SuperCall(at.loc, parseExprParts(after))
					case Keywords.Switch:
						return parseSwitch(false, after)
					case Keywords.With:
						return parseWith(after)
					case Keywords.Yield:
						return new Yield(at.loc,
							opIf(!after.isEmpty(), () => parseExprPlain(after)))
					case Keywords.YieldTo:
						return new YieldTo(at.loc, parseExprPlain(after))
					default:
						throw new Error(at.kind)
				}
			}
			return cat(before.map(parseSingle), getLast())
		},
		() => tokens.map(parseSingle))
}

const exprSplitKeywords = new Set([
	Keywords.And, Keywords.Case, Keywords.Class, Keywords.Cond, Keywords.Del, Keywords.Except,
	Keywords.ForBag, Keywords.For, Keywords.Fun, Keywords.FunDo, Keywords.FunThis,
	Keywords.FunThisDo, Keywords.FunAsync, Keywords.FunAsyncDo, Keywords.FunThisAsync,
	Keywords.FunThisAsyncDo, Keywords.FunGen, Keywords.FunGenDo, Keywords.FunThisGen,
	Keywords.FunThisGenDo, Keywords.If, Keywords.Kind, Keywords.Method, Keywords.New, Keywords.Not,
	Keywords.Or, Keywords.Super, Keywords.Switch, Keywords.Unless, Keywords.With, Keywords.Yield,
	Keywords.YieldTo
])

function parseExprPlain(tokens) {
	const parts = parseExprParts(tokens)
	switch (parts.length) {
		case 0:
			fail(tokens.loc, 'Expected an expression, got nothing.')
		case 1:
			return head(parts)
		default:
			return new Call(tokens.loc, head(parts), tail(parts))
	}
}

function parseCond(tokens) {
	const parts = parseExprParts(tokens)
	check(parts.length === 3, tokens.loc, () =>
		`${showKeyword(Keywords.Cond)} takes exactly 3 arguments.`)
	return new Cond(tokens.loc, ...parts)
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

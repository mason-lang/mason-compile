import Loc from 'esast/dist/Loc'
import {code} from '../../CompileError'
import {check, fail} from '../context'
import {Call, Cond, ConditionalVal, LocalDeclare, Logic, Logics, New, Not, ObjPair, ObjSimple,
	SuperCall, With, Yield, YieldTo} from '../MsAst'
import {isAnyKeyword, isKeyword, Keywords, Name} from '../Token'
import {cat, head, ifElse, opIf, tail} from '../util'
import {checkNonEmpty} from './checks'
import {parseClass, parseExcept, parseSingle, parseSwitch} from './parse*'
import {beforeAndBlock, parseBlockDo, parseBlockVal} from './parseBlock'
import parseCase from './parseCase'
import parseDel from './parseDel'
import {parseForBag, parseForVal} from './parseFor'
import parseFun from './parseFun'
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
					case Keywords.CaseVal:
						return parseCase(true, false, after)
					case Keywords.Class:
						return parseClass(after)
					case Keywords.Cond:
						return parseCond(after)
					case Keywords.DelVal:
						return parseDel(after)
					case Keywords.ExceptVal:
						return parseExcept(Keywords.ExceptVal, after)
					case Keywords.ForBag:
						return parseForBag(after)
					case Keywords.ForVal:
						return parseForVal(after)
					case Keywords.Fun: case Keywords.FunDo: case Keywords.FunGen:
					case Keywords.FunGenDo: case Keywords.FunThis: case Keywords.FunThisDo:
					case Keywords.FunThisGen: case Keywords.FunThisGenDo:
						return parseFun(at.kind, after)
					case Keywords.IfVal: case Keywords.UnlessVal: {
						const [before, block] = beforeAndBlock(after)
						return new ConditionalVal(tokens.loc,
							parseExprPlain(before),
							parseBlockVal(block),
							at.kind === Keywords.UnlessVal)
					}
					case Keywords.New: {
						const parts = parseExprParts(after)
						return new New(at.loc, parts[0], tail(parts))
					}
					case Keywords.Not:
						return new Not(at.loc, parseExprPlain(after))
					case Keywords.SuperVal:
						return new SuperCall(at.loc, parseExprParts(after))
					case Keywords.SwitchVal:
						return parseSwitch(true, false, after)
					case Keywords.With:
						return parseWith(after)
					case Keywords.Yield:
						return new Yield(at.loc,
							opIf(!after.isEmpty(), () => parseExprPlain(after)))
					case Keywords.YieldTo:
						return new YieldTo(at.loc, parseExprPlain(after))
					default: throw new Error(at.kind)
				}
			}
			return cat(before.map(parseSingle), getLast())
		},
		() => tokens.map(parseSingle))
}

const exprSplitKeywords = new Set([
	Keywords.And, Keywords.CaseVal, Keywords.Class, Keywords.Cond, Keywords.DelVal,
	Keywords.ExceptVal, Keywords.ForBag, Keywords.ForVal, Keywords.Fun, Keywords.FunDo,
	Keywords.FunGen, Keywords.FunGenDo, Keywords.FunThis, Keywords.FunThisDo, Keywords.FunThisGen,
	Keywords.FunThisGenDo, Keywords.IfVal, Keywords.New, Keywords.Not, Keywords.Or,
	Keywords.SuperVal, Keywords.SwitchVal, Keywords.UnlessVal, Keywords.With, Keywords.Yield,
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
	check(parts.length === 3, tokens.loc, () => `${code('cond')} takes exactly 3 arguments.`)
	return new Cond(tokens.loc, parts[0], parts[1], parts[2])
}

function parseWith(tokens) {
	const [before, block] = beforeAndBlock(tokens)

	const [val, declare] = ifElse(before.opSplitOnce(_ => isKeyword(Keywords.As, _)),
		({before, after}) => {
			check(after.size() === 1, () =>
				`Expected only 1 token after ${code('as')}.`)
			return [parseExprPlain(before), parseLocalDeclare(after.head())]
		},
		() => [parseExprPlain(before), LocalDeclare.focus(tokens.loc)])

	return new With(tokens.loc, declare, val, parseBlockDo(block))
}

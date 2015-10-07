import Loc from 'esast/dist/Loc'
import {code} from '../../CompileError'
import {Call, Cond, ConditionalVal, LocalDeclareFocus, Logic, L_And, L_Or, New, Not, ObjPair,
	ObjSimple, SuperCall, With, Yield, YieldTo} from '../MsAst'
import {isKeyword, Keyword, KW_And, KW_As, KW_CaseVal, KW_Class, KW_Cond, KW_ExceptVal, KW_ForBag,
	KW_ForVal, KW_Fun, KW_FunDo, KW_FunGen, KW_FunGenDo, KW_FunThis, KW_FunThisDo, KW_FunThisGen,
	KW_FunThisGenDo, KW_IfVal, KW_New, KW_Not, KW_ObjAssign, KW_Or, KW_SuperVal, KW_SwitchVal,
	KW_UnlessVal, KW_With, KW_Yield, KW_YieldTo, Name} from '../Token'
import {cat, head, ifElse, opIf, tail} from '../util'
import {checkNonEmpty, context} from './context'
import {parseClass, parseExcept, parseSingle, parseSwitch} from './parse*'
import {beforeAndBlock, parseBlockDo, parseBlockVal} from './parseBlock'
import parseCase from './parseCase'
import {parseForBag, parseForVal} from './parseFor'
import parseFun from './parseFun'
import {parseLocalDeclare} from './parseLocalDeclares'

export default tokens =>
	ifElse(tokens.opSplitManyWhere(_ => isKeyword(KW_ObjAssign, _)),
		splits => {
			// Short object form, such as (a. 1, b. 2)
			const first = splits[0].before
			checkNonEmpty(first, () => `Unexpected ${splits[0].at}`)
			const tokensCaller = first.rtail()

			const pairs = []
			for (let i = 0; i < splits.length - 1; i = i + 1) {
				const name = splits[i].before.last()
				context.check(name instanceof Name, name.loc, () =>
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

export const parseExprParts = tokens => {
	const opSplit = tokens.opSplitOnceWhere(token => {
		if (token instanceof Keyword)
			switch (token.kind) {
				case KW_And: case KW_CaseVal: case KW_Class: case KW_Cond: case KW_ExceptVal:
				case KW_ForBag: case KW_ForVal: case KW_Fun: case KW_FunDo: case KW_FunGen:
				case KW_FunGenDo: case KW_FunThis: case KW_FunThisDo: case KW_FunThisGen:
				case KW_FunThisGenDo: case KW_IfVal: case KW_New: case KW_Not: case KW_Or:
				case KW_SuperVal: case KW_SwitchVal: case KW_UnlessVal: case KW_With:
				case KW_Yield: case KW_YieldTo:
					return true
				default:
					return false
			}
		return false
	})
	return ifElse(opSplit,
		({before, at, after}) => {
			const getLast = () => {
				switch (at.kind) {
					case KW_And: case KW_Or:
						return new Logic(at.loc, at.kind === KW_And ? L_And : L_Or,
							parseExprParts(after))
					case KW_CaseVal:
						return parseCase(true, false, after)
					case KW_Class:
						return parseClass(after)
					case KW_Cond:
						return parseCond(after)
					case KW_ExceptVal:
						return parseExcept(KW_ExceptVal, after)
					case KW_ForBag:
						return parseForBag(after)
					case KW_ForVal:
						return parseForVal(after)
					case KW_Fun: case KW_FunDo: case KW_FunGen: case KW_FunGenDo:
					case KW_FunThis: case KW_FunThisDo: case KW_FunThisGen:
					case KW_FunThisGenDo:
						return parseFun(at.kind, after)
					case KW_IfVal: case KW_UnlessVal: {
						const [before, block] = beforeAndBlock(after)
						return new ConditionalVal(tokens.loc,
							parseExprPlain(before),
							parseBlockVal(block),
							at.kind === KW_UnlessVal)
					}
					case KW_New: {
						const parts = parseExprParts(after)
						return new New(at.loc, parts[0], tail(parts))
					}
					case KW_Not:
						return new Not(at.loc, parseExprPlain(after))
					case KW_SuperVal:
						return new SuperCall(at.loc, parseExprParts(after))
					case KW_SwitchVal:
						return parseSwitch(true, false, after)
					case KW_With:
						return parseWith(after)
					case KW_Yield:
						return new Yield(at.loc,
							opIf(!after.isEmpty(), () => parseExprPlain(after)))
					case KW_YieldTo:
						return new YieldTo(at.loc, parseExprPlain(after))
					default: throw new Error(at.kind)
				}
			}
			return cat(before.map(parseSingle), getLast())
		},
		() => tokens.map(parseSingle))
}

const
	parseExprPlain = tokens => {
		const parts = parseExprParts(tokens)
		switch (parts.length) {
			case 0:
				context.fail(tokens.loc, 'Expected an expression, got nothing.')
			case 1:
				return head(parts)
			default:
				return new Call(tokens.loc, head(parts), tail(parts))
		}
	},

	parseCond = tokens => {
		const parts = parseExprParts(tokens)
		context.check(parts.length === 3, tokens.loc, () =>
			`${code('cond')} takes exactly 3 arguments.`)
		return new Cond(tokens.loc, parts[0], parts[1], parts[2])
	},

	parseWith = tokens => {
		const [before, block] = beforeAndBlock(tokens)

		const [val, declare] = ifElse(before.opSplitOnceWhere(_ => isKeyword(KW_As, _)),
			({before, after}) => {
				context.check(after.size() === 1, () =>
					`Expected only 1 token after ${code('as')}.`)
				return [parseExprPlain(before), parseLocalDeclare(after.head())]
			},
			() => [parseExprPlain(before), new LocalDeclareFocus(tokens.loc)])

		return new With(tokens.loc, declare, val, parseBlockDo(block))
	}

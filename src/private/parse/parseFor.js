import {check} from '../context'
import {BagEntry, ForDo, ForBag, ForVal, Iteratee, LocalDeclareFocus, Val} from '../MsAst'
import {isKeyword, KW_Of} from '../Token'
import {ifElse, opIf} from '../util'
import {parseExpr} from './parse*'
import {beforeAndBlock, parseBlockDo} from './parseBlock'
import {parseLocalDeclaresJustNames} from './parseLocalDeclares'

export const
	parseForDo = tokens =>
		parseFor(ForDo, tokens),

	parseForVal = tokens =>
		parseFor(ForVal, tokens),

	// TODO: -> out-type
	parseForBag = tokens => {
		const [before, lines] = beforeAndBlock(tokens)
		const block = parseBlockDo(lines)
		// TODO: Better way?
		if (block.lines.length === 1 && block.lines[0] instanceof Val)
			block.lines[0] = new BagEntry(block.lines[0].loc, block.lines[0])
		return new ForBag(tokens.loc, parseOpIteratee(before), block)
	}

const
	parseFor = (ctr, tokens) => {
		const [before, block] = beforeAndBlock(tokens)
		return new ctr(tokens.loc, parseOpIteratee(before), parseBlockDo(block))
	},

	parseOpIteratee = tokens =>
		opIf(!tokens.isEmpty(), () => {
			const [element, bag] =
				ifElse(tokens.opSplitOnceWhere(_ => isKeyword(KW_Of, _)),
					({before, after}) => {
						check(before.size() === 1, before.loc, 'TODO: pattern in for')
						return [parseLocalDeclaresJustNames(before)[0], parseExpr(after)]
					},
					() => [new LocalDeclareFocus(tokens.loc), parseExpr(tokens)])
			return new Iteratee(tokens.loc, element, bag)
		})

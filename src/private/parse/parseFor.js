import {check} from '../context'
import {For, ForAsync, ForBag, Iteratee, LocalDeclare} from '../MsAst'
import {isKeyword, Keywords} from '../Token'
import {ifElse, opIf} from '../util'
import {parseExpr} from './parse*'
import parseBlock, {beforeAndBlock} from './parseBlock'
import {parseLocalDeclaresJustNames} from './parseLocalDeclares'

export default function parseFor(kind, tokens) {
	const [before, block] = beforeAndBlock(tokens)
	const Ctr = kindToCtr.get(kind)
	const opIter = Ctr === ForAsync ?
		parseIteratee(before) :
		opIf(!before.isEmpty(), () => parseIteratee(before))
	return new Ctr(tokens.loc, opIter, parseBlock(block))
}

const kindToCtr = new Map(
	[[Keywords.For, For], [Keywords.ForAsync, ForAsync], [Keywords.ForBag, ForBag]])

function parseIteratee(tokens) {
	const [element, bag] =
		ifElse(tokens.opSplitOnce(_ => isKeyword(Keywords.Of, _)),
			({before, after}) => {
				check(before.size() === 1, before.loc, 'forPattern')
				return [parseLocalDeclaresJustNames(before)[0], parseExpr(after)]
			},
			() => [LocalDeclare.focus(tokens.loc), parseExpr(tokens)])
	return new Iteratee(tokens.loc, element, bag)
}

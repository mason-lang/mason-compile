import {check} from '../context'
import {For, ForBag, Iteratee, LocalDeclare} from '../MsAst'
import {isKeyword, Keywords} from '../Token'
import {ifElse, opIf} from '../util'
import {parseExpr} from './parse*'
import parseBlock, {beforeAndBlock} from './parseBlock'
import {parseLocalDeclaresJustNames} from './parseLocalDeclares'


// TODO: -> out-type
/** Parse a {@link ForBag}. */
export function parseForBag(tokens) {
	const [before, lines] = beforeAndBlock(tokens)
	return new ForBag(tokens.loc, parseOpIteratee(before), parseBlock(lines))
}

/** Parse a {@link For}. */
export function parseFor(tokens) {
	const [before, block] = beforeAndBlock(tokens)
	return new For(tokens.loc, parseOpIteratee(before), parseBlock(block))
}

function parseOpIteratee(tokens) {
	return opIf(!tokens.isEmpty(), () => {
		const [element, bag] =
			ifElse(tokens.opSplitOnce(_ => isKeyword(Keywords.Of, _)),
				({before, after}) => {
					check(before.size() === 1, before.loc, 'TODO: pattern in for')
					return [parseLocalDeclaresJustNames(before)[0], parseExpr(after)]
				},
				() => [LocalDeclare.focus(tokens.loc), parseExpr(tokens)])
		return new Iteratee(tokens.loc, element, bag)
	})
}

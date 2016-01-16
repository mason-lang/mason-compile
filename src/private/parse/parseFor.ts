import Op, {caseOp, opIf} from 'op/Op'
import {LocalDeclare} from '../ast/locals'
import {For, ForAsync, ForBag, Iteratee} from '../ast/Loop'
import {Val} from '../ast/LineContent'
import {check} from '../context'
import {isKeyword, Keywords} from '../token/Keyword'
import parseBlock, {beforeAndBlock} from './parseBlock'
import parseExpr from './parseExpr'
import {parseLocalDeclaresJustNames} from './parseLocalDeclares'
import {Tokens} from './Slice'

export function parseFor(tokens: Tokens): For {
	const [before, block] = beforeAndBlock(tokens)
	return new For(tokens.loc, opParseIteratee(before), parseBlock(block))
}

export function parseForAsync(tokens: Tokens): ForAsync {
	const [before, block] = beforeAndBlock(tokens)
	return new ForAsync(tokens.loc, parseIteratee(before), parseBlock(block))
}

export function parseForBag(tokens: Tokens): ForBag {
	const [before, block] = beforeAndBlock(tokens)
	return new ForBag(tokens.loc, opParseIteratee(before), parseBlock(block))
}

function opParseIteratee(tokens: Tokens): Op<Iteratee> {
	return opIf(!tokens.isEmpty(), () => parseIteratee(tokens))
}

function parseIteratee(tokens: Tokens): Iteratee {
	const [element, bag]: any = caseOp<{before: Tokens, after: Tokens}, [LocalDeclare, Val]>(
		tokens.opSplitOnce(_ => isKeyword(Keywords.Of, _)),
		({before, after}) => {
			check(before.size() === 1, before.loc, _ => _.todoForPattern)
			return [parseLocalDeclaresJustNames(before)[0], parseExpr(after)]
		},
		() => [LocalDeclare.focus(tokens.loc), parseExpr(tokens)])
	return new Iteratee(tokens.loc, element, bag)
}

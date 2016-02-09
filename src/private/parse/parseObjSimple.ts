import Loc from 'esast/lib/Loc'
import {caseOp} from 'op/Op'
import {Val} from '../ast/LineContent'
import {LocalAccess} from '../ast/locals'
import {ObjPair, ObjSimple} from '../ast/Val'
import {isKeyword, Kw} from '../token/Keyword'
import Token from '../token/Token'
import {checkEmpty, checkNonEmpty} from './checks'
import parseExpr from './parseExpr'
import {parseLocalName} from './parseLocalDeclares'
import parseMemberName from './parseMemberName'
import {Tokens} from './Slice'

export default function parseObjSimple(tokens: Tokens): Val {
	const pairs = caseOp(
		tokens.opSplitMany(_ => isKeyword(Kw.ObjEntry, _)),
		_ => complexPairs(tokens.loc, _),
		// Parse 'pairs' like in `{a b}` (equivalent to `{a. a b. b}`),
		// where every pair is a single identifier.
		() => tokens.map(simplePair))
	return new ObjSimple(tokens.loc, pairs)
}

// Parse pairs like in `{a. 1 b.}`, where each pair may have a value and `.` tokens are required.
function complexPairs(loc: Loc, splits: Array<{before: Tokens, at: Token}>): Array<ObjPair> {
	// We split on `.`, but that's not really how it's grouped.
	// The single token preceding each `.` is a key.
	// Every token after the `.` but the last one (that's the key of the next pair) is the value.

	// For the first pair, we must specially ensure that there is exactly 1 token before the `.`.
	const first = splits[0].before
	// No `{. a. 1}`
	checkNonEmpty(first, _ => _.unexpected(splits[0].at))
	// No `{a b. 1}`
	checkEmpty(first.rtail(), _ => _.unexpected(first.rtail()))

	// We iterate over the splits, using the last token of the previous split and
	// all but the last token of the current split.
	// (For the last split we include the last token too.)
	const pairs: Array<ObjPair> = []
	for (let i = 0; i < splits.length - 1; i = i + 1) {
		const key = splits[i].before.last()
		const val = i === splits.length - 2 ? splits[i + 1].before : splits[i + 1].before.rtail()
		pairs.push(val.isEmpty() ?
			simplePair(key) :
			new ObjPair(new Loc(key.loc.start, val.loc.end), parseMemberName(key), parseExpr(val)))
	}
	return pairs
}

function simplePair(key: Token): ObjPair {
	const name = parseLocalName(key)
	return new ObjPair(key.loc, name, new LocalAccess(key.loc, name))
}

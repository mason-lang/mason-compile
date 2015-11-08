import {check} from '../context'
import {Call} from '../MsAst'
import {unexpected} from './checks'
import {Groups, isGroup, Keywords, showKeyword} from '../Token'
import {parseExprParts, parseSpaced} from './parse*'
import Slice from './Slice'

export default function parseDel(tokens) {
	check(tokens.size() === 1, tokens.loc, () =>
		`${showKeyword(Keywords.Del)} takes only one argument.`)
	const spaced = tokens.head()
	if (!isGroup(Groups.Space, spaced))
		unexpected(spaced)

	const parts = Slice.group(spaced)
	const last = parts.last()
	if (isGroup(Groups.Bracket, last)) {
		const object = parseSpaced(parts.rtail())
		const args = parseExprParts(Slice.group(last))
		return Call.delSub(tokens.loc, object, args)
	} else
		unexpected(spaced)
}

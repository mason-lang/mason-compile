import Del from '../ast/Del'
import {check} from '../context'
import {GroupBracket, GroupSpace} from '../token/Group'
import {unexpected} from './checks'
import {parseExprParts} from './parseExpr'
import parseSpaced from './parseSpaced'
import {Tokens} from './Slice'

export default function parseDel(tokens: Tokens) : Del{
	check(tokens.size() === 1, tokens.loc, _ => _.argsDel)
	const spaced = tokens.head()
	if (spaced instanceof GroupSpace) {
		const parts = Tokens.of(spaced)
		const last = parts.last()
		if (last instanceof GroupBracket) {
			const object = parseSpaced(parts.rtail())
			const args = parseExprParts(Tokens.of(last))
			return new Del(tokens.loc, object, args)
		} else
			throw unexpected(spaced)
	} else
		throw unexpected(spaced)
}

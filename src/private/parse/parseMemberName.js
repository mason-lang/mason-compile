import {Groups, isGroup} from '../Token'
import {unexpected} from './checks'
import {tryParseName} from './parseName'
import parseQuote from './parseQuote'
import Slice from './Slice'

/**
Parse a plain member (`a.b`) or computed member (`a."b"`).
@param {Token} token
@return {string|Quote}
*/
export default function parseMemberName(token) {
	const name = tryParseName(token)
	if (name !== null)
		return name
	else if (isGroup(Groups.Quote, token))
		return parseQuote(Slice.group(token))
	else
		unexpected(token)
}

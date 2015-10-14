import {G_Quote, isGroup} from '../Token'
import {unexpected} from './checks'
import {tryParseName} from './parseName'
import parseQuote from './parseQuote'
import Slice from './Slice'

export default token => {
	const name = tryParseName(token)
	if (name !== null)
		return name
	else if (isGroup(G_Quote, token))
		return parseQuote(Slice.group(token))
	else
		unexpected(token)
}

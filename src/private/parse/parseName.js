import {unexpected} from './checks'
import {isNameKeyword, keywordName, Name} from '../Token'
import {opOr} from '../util'

export default token =>
	opOr(tryParseName(token), () => unexpected(token))

export const tryParseName = token =>
	token instanceof Name ?
		token.name :
		isNameKeyword(token) ?
		keywordName(token.kind) :
		null

import Method from '../ast/Method'
import {checkEmpty} from './checks'
import {parseMethodValue} from './parseFunBlock'
import parseMethodSplit from './parseMethodSplit'
import {Tokens} from './Slice'

export default function parseMethod(tokens: Tokens): Method {
	const {before, kind, after} = parseMethodSplit(tokens)
	checkEmpty(before, _ => _.unexpectedAfterMethod)
	return new Method(tokens.loc, parseMethodValue(kind, after))
}

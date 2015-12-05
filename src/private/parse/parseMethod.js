import {Method} from '../MsAst'
import {checkEmpty} from './checks'
import {parseFunLike} from './parseFun'
import parseMethodSplit from './parseMethodSplit'

export default function parseMethod(tokens) {
	const {before, kind, after} = parseMethodSplit(tokens)
	checkEmpty(before, 'unexpectedAfterMethod')
	return new Method(tokens.loc, parseFunLike(kind, after))
}

import {Method} from '../MsAst'
import {Keywords, showKeyword} from '../Token'
import {checkEmpty} from './checks'
import {parseFunLike} from './parseFun'
import parseMethodSplit from './parseMethodSplit'

export default function parseMethod(tokens) {
	const {before, kind, after} = parseMethodSplit(tokens)
	checkEmpty(before, () =>
		`Did not expect anything between ${showKeyword(Keywords.Method)} and function.`)
	return new Method(tokens.loc, parseFunLike(kind, after))
}

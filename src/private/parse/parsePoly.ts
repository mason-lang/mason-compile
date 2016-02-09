import Poly from '../ast/Poly'
import {checkEmpty} from './checks'
import {parsePolyValue} from './parseFunBlock'
import parseMethodSplit from './parseMethodSplit'
import {Tokens} from './Slice'

export default function parsePoly(tokens: Tokens): Poly {
	const {before, options, after} = parseMethodSplit(tokens)
	checkEmpty(before, _ => _.unexpectedAfterPoly)
	return new Poly(tokens.loc, parsePolyValue(options, after))
}

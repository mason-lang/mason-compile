import Op from 'op/Op'
import {ClassTraitDo, MethodImpl, MethodImplLike, MethodGetter, MethodSetter, Name, QuoteSimple} from '../MsAst'
import {isKeyword, Keywords} from '../Token'
import parseBlock, {beforeAndBlock, justBlock, parseJustBlock} from './parseBlock'
import parseExpr from './parseExpr'
import parseFun from './parseFun'
import parseMethodSplit from './parseMethodSplit'
import {Lines, Tokens} from './Slice'

export default function parseMethodImpls(lines: Lines): Array<MethodImplLike> {
	return lines.mapSlices(parseMethodImpl)
}

export function takeStatics(lines: Lines): [Array<MethodImplLike>, Lines] {
	const line = lines.headSlice()
	return isKeyword(Keywords.Static, line.head()) ?
		[parseMethodImpls(justBlock(Keywords.Static, line.tail())), lines.tail()] :
		[[], lines]
}

export function parseStaticsAndMethods(lines: Lines): [Array<MethodImplLike>, Array<MethodImplLike>] {
	const [statics, rest] = takeStatics(lines)
	return [statics, parseMethodImpls(rest)]
}

export function opTakeDo(lines: Lines): [Op<ClassTraitDo>, Lines] {
	const line = lines.headSlice()
	return isKeyword(Keywords.Do, line.head()) ?
		[new ClassTraitDo(line.loc, parseJustBlock(Keywords.Do, line.tail())), lines.tail()] :
		[null, lines]
}

function parseMethodImpl(tokens: Tokens): MethodImplLike {
	let head = tokens.head()

	const isMy = isKeyword(Keywords.My, head)
	if (isMy) {
		tokens = tokens.tail()
		head = tokens.head()
	}

	if (isKeyword(Keywords.Get, head)) {
		const [before, block] = beforeAndBlock(tokens.tail())
		return new MethodGetter(tokens.loc, isMy, parseExprOrQuoteSimple(before), parseBlock(block))
	} else if (isKeyword(Keywords.Set, head)) {
		const [before, block] = beforeAndBlock(tokens.tail())
		return new MethodSetter(tokens.loc, isMy, parseExprOrQuoteSimple(before), parseBlock(block))
	} else {
		const {before, kind, after} = parseMethodSplit(tokens)
		const fun = parseFun(kind, after)
		return new MethodImpl(tokens.loc, isMy, parseExprOrQuoteSimple(before), fun)
	}
}

// If symbol is just a quoted name, store it as a string, which is handled specially.
function parseExprOrQuoteSimple(tokens: Tokens): Name {
	const expr = parseExpr(tokens)
	return expr instanceof QuoteSimple ? expr.value : expr
}

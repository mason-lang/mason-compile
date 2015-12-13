import {ClassTraitDo, MethodImpl, MethodGetter, MethodSetter, QuoteSimple} from '../MsAst'
import {isKeyword, Keywords} from '../Token'
import {parseExpr} from './parse*'
import parseBlock, {beforeAndBlock, justBlock, parseJustBlock} from './parseBlock'
import parseFun from './parseFun'
import parseMethodSplit from './parseMethodSplit'

export default function parseMethodImpls(tokens) {
	return tokens.mapSlices(parseMethodImpl)
}

export function takeStatics(tokens) {
	const line = tokens.headSlice()
	return isKeyword(Keywords.Static, line.head()) ?
		[parseMethodImpls(justBlock(Keywords.Static, line.tail())), tokens.tail()] :
		[[], tokens]
}

export function parseStaticsAndMethods(tokens) {
	const [statics, rest] = takeStatics(tokens)
	return [statics, parseMethodImpls(rest)]
}

/** Take a {@link ClassTraitDo}. */
export function opTakeDo(tokens) {
	const line = tokens.headSlice()
	return isKeyword(Keywords.Do, line.head()) ?
		[new ClassTraitDo(line.loc, parseJustBlock(Keywords.Do, line.tail())), tokens.tail()] :
		[null, tokens]
}

function parseMethodImpl(tokens) {
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
function parseExprOrQuoteSimple(tokens) {
	const expr = parseExpr(tokens)
	return expr instanceof QuoteSimple ? expr.name : expr
}

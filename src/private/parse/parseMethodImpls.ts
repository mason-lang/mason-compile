import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import {ClassTraitDo, MethodImpl, MethodImplKind, MethodImplLike, MethodGetter, MethodSetter
	} from '../ast/classTraitCommon'
import MemberName from '../ast/MemberName'
import {check} from '../context'
import {isKeyword, KeywordPlain, Kw} from '../token/Keyword'
import Token from '../token/Token'
import parseBlock, {beforeAndBlock, justBlock, parseJustBlock} from './parseBlock'
import parseFun from './parseFunBlock'
import parseMemberName from './parseMemberName'
import parseMethodSplit from './parseMethodSplit'
import {Lines, Tokens} from './Slice'

export default function parseMethodImpls(lines: Lines): Array<MethodImplLike> {
	return lines.mapSlices(parseMethodImpl)
}

export function takeStatics(lines: Lines): [Array<MethodImplLike>, Lines] {
	if (lines.isEmpty())
		return [[], lines]
	else {
		const line = lines.headSlice()
		return isKeyword(Kw.Static, line.head()) ?
			[parseMethodImpls(justBlock(Kw.Static, line.tail())), lines.tail()] :
			[[], lines]
	}
}

export function parseStaticsAndMethods(lines: Lines)
	: [Array<MethodImplLike>, Array<MethodImplLike>] {
	const [statics, rest] = takeStatics(lines)
	return [statics, parseMethodImpls(rest)]
}

export function opTakeDo(lines: Lines): [Op<ClassTraitDo>, Lines] {
	const line = lines.headSlice()
	return isKeyword(Kw.Do, line.head()) ?
		[new ClassTraitDo(line.loc, parseJustBlock(Kw.Do, line.tail())), lines.tail()] :
		[null, lines]
}

function parseMethodImpl(tokens: Tokens): MethodImplLike {
	const [[isMy, isVirtual, isOverride], rest] =
		tokens.takeKeywords(Kw.My, Kw.Virtual, Kw.Override)
	const kind = methodKind(tokens.loc, isMy, isVirtual, isOverride)
	const head = rest.head()
	if (isGetSet(head)) {
		const [before, block] = beforeAndBlock(rest.tail())
		const ctr = head.kind === Kw.Get ? MethodGetter : MethodSetter
		return new ctr(rest.loc, parseMethodName(before), parseBlock(block), kind)
	} else {
		const {before, options, after} = parseMethodSplit(rest)
		const fun = parseFun(options, after)
		return new MethodImpl(rest.loc, parseMethodName(before), fun, kind)
	}
}

function methodKind(loc: Loc, isMy: boolean, isVirtual: boolean, isOverride: boolean)
	: MethodImplKind {
	check(!(isMy && isOverride), loc, _ => _.noMyOverride)
	const m = isMy ? 0b100 : 0
	const v = isVirtual ? 0b010 : 0
	const o = isOverride ? 0b001 : 0
	return m | v | o
}

function isGetSet(token: Token): token is KeywordPlain {
	// TODO: typescript makes me do this instead of `&&`
	if (token instanceof KeywordPlain)
		return token.kind === Kw.Get || token.kind === Kw.Set
	else
		return null
}

function parseMethodName(tokens: Tokens): MemberName {
	check(tokens.size() === 1, tokens.loc, _ => _.methodName)
	return parseMemberName(tokens.head())
}

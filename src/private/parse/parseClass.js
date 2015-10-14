import {check, fail} from '../context'
import {Class, ClassDo, Constructor, Fun, LocalDeclareFocus, LocalDeclareThis, MethodImpl,
	MethodGetter, MethodSetter, Quote} from '../MsAst'
import {isKeyword, Keyword, KW_Construct, KW_Do, KW_Fun, KW_FunDo, KW_FunGen, KW_FunGenDo,
	KW_FunThis, KW_FunThisDo, KW_FunThisGen, KW_FunThisGenDo, KW_Get, KW_Set, KW_Static
	} from '../Token'
import {opIf} from '../util'
import {parseExpr} from './parse*'
import {beforeAndBlock, justBlock, justBlockDo, parseBlockDo, parseBlockVal,} from './parseBlock'
import parseFun, {_funArgsAndBlock} from './parseFun'
import tryTakeComment from './tryTakeComment'

export default tokens => {
	const [before, block] = beforeAndBlock(tokens)
	const opExtended = opIf(!before.isEmpty(), () => parseExpr(before))

	let opDo = null, statics = [], opConstructor = null, methods = []

	let [opComment, rest] = tryTakeComment(block)

	const line1 = rest.headSlice()
	if (isKeyword(KW_Do, line1.head())) {
		const done = justBlockDo(KW_Do, line1.tail())
		opDo = new ClassDo(line1.loc, new LocalDeclareFocus(line1.loc), done)
		rest = rest.tail()
	}
	if (!rest.isEmpty()) {
		const line2 = rest.headSlice()
		if (isKeyword(KW_Static, line2.head())) {
			statics = parseStatics(line2.tail())
			rest = rest.tail()
		}
		if (!rest.isEmpty()) {
			const line3 = rest.headSlice()
			if (isKeyword(KW_Construct, line3.head())) {
				opConstructor = parseConstructor(line3.tail())
				rest = rest.tail()
			}
			methods = parseMethods(rest)
		}
	}

	return new Class(tokens.loc, opExtended, opComment, opDo, statics, opConstructor, methods)
}

const
	parseConstructor = tokens => {
		const {args, memberArgs, opRestArg, block} = _funArgsAndBlock(true, tokens, true)
		const _this = new LocalDeclareThis(tokens.loc)
		const isGenerator = false, opDeclareRes = null
		const fun = new Fun(tokens.loc, _this, isGenerator, args, opRestArg, block, opDeclareRes)
		return new Constructor(tokens.loc, fun, memberArgs)
	},

	parseStatics = tokens => {
		const block = justBlock(KW_Static, tokens)
		return parseMethods(block)
	},

	parseMethods = tokens => tokens.mapSlices(parseMethod),

	parseMethod = tokens => {
		const head = tokens.head()

		if (isKeyword(KW_Get, head)) {
			const [before, block] = beforeAndBlock(tokens.tail())
			return new MethodGetter(tokens.loc, parseExprOrStrLit(before), parseBlockVal(block))
		} else if (isKeyword(KW_Set, head)) {
			const [before, block] = beforeAndBlock(tokens.tail())
			return new MethodSetter(tokens.loc, parseExprOrStrLit(before), parseBlockDo(block))
		} else {
			const baa = tokens.opSplitOnceWhere(isFunKeyword)
			check(baa !== null, tokens.loc, 'Expected a function keyword somewhere.')
			const {before, at, after} = baa
			const fun = parseFun(methodFunKind(at), after)
			return new MethodImpl(tokens.loc, parseExprOrStrLit(before), fun)
		}
	},

	// If symbol is just a literal string, store it as a string, which is handled specially.
	parseExprOrStrLit = tokens => {
		const expr = parseExpr(tokens)
		const isStrLit = expr instanceof Quote &&
			expr.parts.length === 1 &&
			typeof expr.parts[0] === 'string'
		return isStrLit ? expr.parts[0] : expr
	},

	methodFunKind = funKindToken => {
		switch (funKindToken.kind) {
			case KW_Fun: return KW_FunThis
			case KW_FunDo: return KW_FunThisDo
			case KW_FunGen: return KW_FunThisGen
			case KW_FunGenDo: return KW_FunThisGenDo
			case KW_FunThis: case KW_FunThisDo: case KW_FunThisGen: case KW_FunThisGenDo:
				fail(funKindToken.loc, 'Function `.` is implicit for methods.')
			default:
				fail(funKindToken.loc, `Expected function kind, got ${funKindToken}`)
		}
	},

	isFunKeyword = funKindToken => {
		if (funKindToken instanceof Keyword)
			switch (funKindToken.kind) {
				case KW_Fun: case KW_FunDo: case KW_FunGen: case KW_FunGenDo:
				case KW_FunThis: case KW_FunThisDo: case KW_FunThisGen:
				case KW_FunThisGenDo:
					return true
				default:
					return false
			}
		else
			return false
	}

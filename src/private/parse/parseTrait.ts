import Op, {caseOp} from 'op/Op'
import {ClassTraitDo, MethodImplLike, Trait} from '../MsAst'
import {parseExprParts} from './parse*'
import {beforeAndOpBlock} from './parseBlock'
import {opTakeDo, parseStaticsAndMethods} from './parseMethodImpls'
import tryTakeComment from './tryTakeComment'
import {Lines, Tokens} from './Slice'

/** Parse a [[Trait]]. */
export default function parseTrait(tokens: Tokens): Trait {
	const [before, opBlock] = beforeAndOpBlock(tokens)
	const superTraits = parseExprParts(before)
	// todo: https://github.com/Microsoft/TypeScript/issues/6310
	type tuple = [Op<string>, Op<ClassTraitDo>, Array<MethodImplLike>, Array<MethodImplLike>]
	const [opComment, opDo, statics, methods] = caseOp<Lines, tuple>(
		opBlock,
		_ => {
			const [opComment, rest] = tryTakeComment(_)
			if (rest.isEmpty())
				return [opComment, null, [], []]
			else {
				const [opDo, rest2] = opTakeDo(rest)
				const [statics, methods] = parseStaticsAndMethods(rest2)
				return [opComment, opDo, statics, methods]
			}
		},
		() => ([null, null, [], []]))
	return new Trait(tokens.loc, superTraits, opComment, opDo, statics, methods)
}

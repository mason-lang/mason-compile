import {Trait} from '../MsAst'
import {ifElse} from '../util'
import {parseExprParts} from './parse*'
import {beforeAndOpBlock} from './parseBlock'
import {opTakeDo, parseStaticsAndMethods} from './parseMethodImpls'
import tryTakeComment from './tryTakeComment'

/** Parse a {@link Trait}. */
export default function parseTrait(tokens) {
	const [before, opBlock] = beforeAndOpBlock(tokens)
	const superTraits = parseExprParts(before)
	const [opComment, opDo, statics, methods] = ifElse(opBlock,
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

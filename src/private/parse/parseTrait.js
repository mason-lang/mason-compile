import {ClassTraitDo, Trait} from '../MsAst'
import {isKeyword, Keywords} from '../Token'
import {parseExprParts} from './parse*'
import {beforeAndOpBlock, parseJustBlock} from './parseBlock'
import parseMethodImpls, {parseStatics} from './parseMethodImpls'
import tryTakeComment from './tryTakeComment'

/** Parse a {@link Trait}. */
export default function parseTrait(tokens) {
	const [before, opBlock] = beforeAndOpBlock(tokens)
	const superTraits = parseExprParts(before)

	let opComment = null, opDo = null, statics = [], methods = []
	const finish = () => new Trait(tokens.loc,
		superTraits, opComment, opDo, statics, methods)

	if (opBlock === null)
		return finish()

	const [_opComment, _rest] = tryTakeComment(opBlock)
	opComment = _opComment
	let rest = _rest

	if (rest.isEmpty())
		return finish()

	const line1 = rest.headSlice()
	if (isKeyword(Keywords.Do, line1.head())) {
		const done = parseJustBlock(Keywords.Do, line1.tail())
		opDo = new ClassTraitDo(line1.loc, done)
		rest = rest.tail()
	}

	if (rest.isEmpty())
		return finish()

	const line2 = rest.headSlice()
	if (isKeyword(Keywords.Static, line2.head())) {
		statics = parseStatics(line2.tail())
		rest = rest.tail()
	}

	if (rest.isEmpty())
		return finish()

	methods = parseMethodImpls(rest)

	return finish()
}

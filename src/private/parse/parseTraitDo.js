import {TraitDo} from '../MsAst'
import {ifElse} from '../util'
import {parseNExprParts} from './parse*'
import {beforeAndOpBlock} from './parseBlock'
import {parseStaticsAndMethods} from './parseMethodImpls'

export default function parseTraitDo(tokens) {
	const [before, opBlock] = beforeAndOpBlock(tokens)
	const [implementor, trait] = parseNExprParts(before, 2, 'argsTraitDo')
	const [statics, methods] = ifElse(opBlock, parseStaticsAndMethods, () => [[], []])
	return new TraitDo(tokens.loc, implementor, trait, statics, methods)
}

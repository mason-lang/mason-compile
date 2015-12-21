import {caseOp} from 'op/Op'
import {TraitDo} from '../MsAst'
import {parseNExprParts} from './parse*'
import {beforeAndOpBlock} from './parseBlock'
import {parseStaticsAndMethods} from './parseMethodImpls'
import {Tokens} from './Slice'

export default function parseTraitDo(tokens: Tokens): TraitDo {
	const [before, opBlock] = beforeAndOpBlock(tokens)
	const [implementor, trait] = parseNExprParts(before, 2, 'argsTraitDo')
	const [statics, methods] = caseOp(opBlock, parseStaticsAndMethods, () => [[], []])
	return new TraitDo(tokens.loc, implementor, trait, statics, methods)
}

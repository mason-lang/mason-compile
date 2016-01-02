import {caseOp} from 'op/Op'
import {TraitDo} from '../MsAst'
import {beforeAndOpBlock} from './parseBlock'
import {parseNExprParts} from './parseExpr'
import {parseStaticsAndMethods} from './parseMethodImpls'
import {Tokens} from './Slice'

export default function parseTraitDo(tokens: Tokens): TraitDo {
	const [before, opBlock] = beforeAndOpBlock(tokens)
	const [implementor, trait] = parseNExprParts(before, 2, _ => _.argsTraitDo)
	const [statics, methods] = caseOp(opBlock, parseStaticsAndMethods, () => [[], []])
	return new TraitDo(tokens.loc, implementor, trait, statics, methods)
}

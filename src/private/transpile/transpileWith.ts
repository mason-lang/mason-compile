import Expression from 'esast/lib/Expression'
import Identifier from 'esast/lib/Identifier'
import Statement, {ReturnStatement} from 'esast/lib/Statement'
import With from '../ast/With'
import {transpileBlockNoLoc, transpileBlockVal} from './transpileBlock'
import {idForDeclareCached, plainLet} from './transpileLocals'
import transpileVal from './transpileVal'

export function transpileWithDoNoLoc(_: With): Statement {
		const {lead} = withParts(_)
		return transpileBlockNoLoc(_.block, {lead})
}

export function transpileWithValNoLoc(_: With): Expression {
		const {idDeclare, lead} = withParts(_)
		return transpileBlockVal(_.block, {lead, follow: new ReturnStatement(idDeclare)})
}

function withParts({declare, value}: With): {idDeclare: Identifier, lead: Statement} {
	const idDeclare = idForDeclareCached(declare)
	const val = transpileVal(value)
	const lead = plainLet(idDeclare, val)
	return {idDeclare, lead}
}

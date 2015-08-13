import { ExpressionStatement, ForStatement, Identifier, Literal, NewExpression, Statement,
	TemplateElement, ThrowStatement, VariableDeclarator } from 'esast/dist/ast'
import { escapeStringForTemplate } from 'esast/dist/util'
import mangleIdentifier from 'esast/dist/mangle-identifier'
import specialize, { variableDeclarationConst } from 'esast/dist/specialize'
import { opIf, opMap } from '../util'
import { msCheckContains, msUnlazy } from './ms-call'
import { t0 } from './transpile'

// Define this here to avoid circular dependency with ast-constants.
export const _IdError = Identifier('Error')

export const
	accessLocalDeclare = localDeclare =>
		localDeclare.isLazy() ?
			msUnlazy(idForDeclareCached(localDeclare)) :
			Identifier(idForDeclareCached(localDeclare).name),

	declare = (localDeclare, val) =>
		variableDeclarationConst([ VariableDeclarator(idForDeclareCached(localDeclare), val) ]),

	forStatementInfinite = specialize(ForStatement,
		[ 'body', Statement ],
		{ init: null, test: null, update: null }),

	idForDeclareCached = localDeclare => {
		let _ = declareToId.get(localDeclare)
		if (_ === undefined) {
			_ = Identifier(mangleIdentifier(localDeclare.name))
			declareToId.set(localDeclare, _)
		}
		return _
	},

	opTypeCheckForLocalDeclare = localDeclare =>
		// TODO: Way to typecheck lazies
		opIf(!localDeclare.isLazy(), () =>
			opMap(localDeclare.opType, type =>
				ExpressionStatement(msCheckContains(
					t0(type),
					accessLocalDeclare(localDeclare),
					Literal(localDeclare.name))))),

	throwErrorFromString = msg =>
		ThrowStatement(NewExpression(_IdError, [ Literal(msg) ])),

	templateElementForString = str =>
		TemplateElement(false, { cooked: str, raw: escapeStringForTemplate(str) })

const
	declareToId = new WeakMap()

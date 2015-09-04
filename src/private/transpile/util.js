import { ExpressionStatement, ForStatement, Identifier, Literal, NewExpression, ThrowStatement,
	VariableDeclarator, VariableDeclaration } from 'esast/dist/ast'
import mangleIdentifier from 'esast/dist/mangle-identifier'
import { opIf, opMap } from '../util'
import { msCheckContains, msUnlazy } from './ms-call'
import { t0 } from './transpile'

// Define this here to avoid circular dependency with ast-constants.
export const _IdError = new Identifier('Error')

export const
	accessLocalDeclare = localDeclare => {
		const id = idForDeclareCached(localDeclare)
		return localDeclare.isLazy() ? msUnlazy(id) : new Identifier(id.name)
	},

	declare = (localDeclare, val) =>
		new VariableDeclaration('const',
			[ new VariableDeclarator(idForDeclareCached(localDeclare), val) ]),

	forStatementInfinite = body =>
		new ForStatement(null, null, null, body),

	idForDeclareCached = localDeclare => {
		let _ = declareToId.get(localDeclare)
		if (_ === undefined) {
			_ = new Identifier(mangleIdentifier(localDeclare.name))
			declareToId.set(localDeclare, _)
		}
		return _
	},

	opTypeCheckForLocalDeclare = localDeclare =>
		// TODO: Way to typecheck lazies
		opIf(!localDeclare.isLazy(), () =>
			opMap(localDeclare.opType, type =>
				new ExpressionStatement(msCheckContains(
					t0(type),
					accessLocalDeclare(localDeclare),
					new Literal(localDeclare.name))))),

	throwErrorFromString = msg =>
		new ThrowStatement(new NewExpression(_IdError, [ new Literal(msg) ]))

const
	declareToId = new WeakMap()

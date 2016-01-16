import {VariableDeclarationLet, VariableDeclarator} from 'esast/lib/Declaration'
import {ArrayExpression, AssignmentExpression, NewExpression, ThisExpression, UnaryExpression
	} from 'esast/lib/Expression'
import Identifier from 'esast/lib/Identifier'
import {LiteralNull, LiteralNumber} from 'esast/lib/Literal'
import ObjectExpression from 'esast/lib/ObjectExpression'
import {ExpressionStatement, ReturnStatement} from 'esast/lib/Statement'
import {member} from 'esast-create-util/lib/util'

export const
	esGlobalError = new Identifier('Error'),
	idBuilt = new Identifier('built'),
	idError = new Identifier('Error'),
	idFocus = new Identifier('_'),
	idLexicalThis = new Identifier('_this'),
	litNull = new LiteralNull(),
	litUndefined = new UnaryExpression('void', new LiteralNumber(0)),
	returnFocus = new ReturnStatement(idFocus),
	esThis = new ThisExpression(),

	declareBuiltBag = new VariableDeclarationLet(
		[new VariableDeclarator(idBuilt, new ArrayExpression([]))]),
	declareBuiltMap = new VariableDeclarationLet([
		new VariableDeclarator(
			idBuilt,
			new NewExpression(member(new Identifier('global'), 'Map'), []))]),
	declareBuiltObj = new VariableDeclarationLet(
		[new VariableDeclarator(idBuilt, new ObjectExpression([]))]),

	declareLexicalThis = new VariableDeclarationLet(
		[new VariableDeclarator(idLexicalThis, esThis)]),
	letLexicalThis = new VariableDeclarationLet([new VariableDeclarator(idLexicalThis)]),
	setLexicalThis = new ExpressionStatement(new AssignmentExpression('=', idLexicalThis, esThis))

import {VariableDeclarationLet, VariableDeclarator} from 'esast/lib/Declaration'
import {ArrayExpression, AssignmentExpression, LiteralNull, LiteralNumber, NewExpression, ThisExpression, UnaryExpression} from 'esast/lib/Expression'
import Identifier from 'esast/lib/Identifier'
import ObjectExpression from 'esast/lib/ObjectExpression'
import {ExpressionStatement, ReturnStatement} from 'esast/lib/Statement'
import {member} from 'esast-create-util/lib/util'

export const
	GlobalError = new Identifier('Error'),
	IdBuilt = new Identifier('built'),
	IdError = new Identifier('Error'),
	IdExports = new Identifier('exports'),
	IdFocus = new Identifier('_'),
	IdLexicalThis = new Identifier('_this'),
	IdSuper = new Identifier('super'),
	LitNull = new LiteralNull(),
	LitUndefined = new UnaryExpression('void', new LiteralNumber(0)),
	ReturnFocus = new ReturnStatement(IdFocus),
	This = new ThisExpression(),

	DeclareBuiltBag = new VariableDeclarationLet(
		[new VariableDeclarator(IdBuilt, new ArrayExpression([]))]),
	DeclareBuiltMap = new VariableDeclarationLet([
		new VariableDeclarator(IdBuilt,
			new NewExpression(member(new Identifier('global'), 'Map'), []))]),
	DeclareBuiltObj = new VariableDeclarationLet([
		new VariableDeclarator(IdBuilt, new ObjectExpression([]))]),

	DeclareLexicalThis = new VariableDeclarationLet(
		[new VariableDeclarator(IdLexicalThis, This)]),
	LetLexicalThis = new VariableDeclarationLet([new VariableDeclarator(IdLexicalThis)]),
	SetLexicalThis = new ExpressionStatement(new AssignmentExpression('=', IdLexicalThis, This))

import {ArrayExpression, AssignmentExpression, Identifier, Literal, NewExpression, ObjectExpression,
	ReturnStatement, ThisExpression, VariableDeclaration, VariableDeclarator} from 'esast/dist/ast'
import {member} from 'esast/dist/util'

export const
	GlobalError = new Identifier('Error'),
	IdBuilt = new Identifier('built'),
	IdError = new Identifier('Error'),
	IdExports = new Identifier('exports'),
	IdFocus = new Identifier('_'),
	IdLexicalThis = new Identifier('_this'),
	IdSuper = new Identifier('super'),
	LitNull = new Literal(null),
	ReturnFocus = new ReturnStatement(IdFocus),
	This = new ThisExpression(),

	DeclareBuiltBag = new VariableDeclaration('let',
		[new VariableDeclarator(IdBuilt, new ArrayExpression([]))]),
	DeclareBuiltMap = new VariableDeclaration('let', [
		new VariableDeclarator(IdBuilt,
			new NewExpression(member(new Identifier('global'), 'Map'), []))]),
	DeclareBuiltObj = new VariableDeclaration('let', [
		new VariableDeclarator(IdBuilt, new ObjectExpression([]))]),

	DeclareLexicalThis = new VariableDeclaration('let',
		[new VariableDeclarator(IdLexicalThis, This)]),
	LetLexicalThis = new VariableDeclaration('let', [new VariableDeclarator(IdLexicalThis)]),
	SetLexicalThis = new AssignmentExpression('=', IdLexicalThis, This)

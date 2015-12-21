import {ArrayExpression, AssignmentExpression, Identifier, LiteralNull, LiteralNumber, NewExpression, ObjectExpression,
	ReturnStatement, ThisExpression, UnaryExpression, VariableDeclaration, VariableDeclarator} from 'esast/lib/ast'
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

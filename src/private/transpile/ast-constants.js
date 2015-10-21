import {ArrayExpression, BinaryExpression, CallExpression, ExpressionStatement, Identifier,
	IfStatement, Literal, NewExpression, ObjectExpression, ReturnStatement, SwitchCase,
	ThisExpression, UnaryExpression, VariableDeclaration, VariableDeclarator} from 'esast/dist/ast'
import {member} from 'esast/dist/util'
import {_IdError, throwErrorFromString} from './util'

export const
	GlobalError = new Identifier('Error'),
	IdArguments = new Identifier('arguments'),
	IdBuilt = new Identifier('built'),
	IdDefine = new Identifier('define'),
	IdError = _IdError,
	IdExports = new Identifier('exports'),
	IdExtract = new Identifier('_$'),
	IdFocus = new Identifier('_'),
	// TODO:ES6 Shouldn't need, just use arrow functions.
	IdLexicalThis = new Identifier('_this'),
	IdSuper = new Identifier('super'),
	LitEmptyArray = new ArrayExpression([]),
	LitEmptyString = new Literal(''),
	LitNull = new Literal(null),
	LitStrExports = new Literal('exports'),
	LitStrThrow = new Literal('An error occurred.'),
	LitTrue = new Literal(true),
	LitZero = new Literal(0),
	ReturnBuilt = new ReturnStatement(IdBuilt),
	ReturnExports = new ReturnStatement(IdExports),
	SwitchCaseNoMatch = new SwitchCase(undefined, [
		throwErrorFromString('No branch of `switch` matches.')]),
	SymbolIterator = member(new Identifier('Symbol'), 'iterator'),
	ThrowAssertFail = throwErrorFromString('Assertion failed.'),
	ThrowNoCaseMatch = throwErrorFromString('No branch of `case` matches.'),
	UseStrict = new ExpressionStatement(new Literal('use strict')),

	ArraySliceCall = member(member(LitEmptyArray, 'slice'), 'call'),
	// if (typeof define !== 'function') var define = require('amdefine')(module)
	AmdefineHeader = new IfStatement(
		new BinaryExpression('!==',
			new UnaryExpression('typeof', IdDefine),
			new Literal('function')),
		new VariableDeclaration('var', [
			new VariableDeclarator(IdDefine, new CallExpression(
				new CallExpression(new Identifier('require'), [new Literal('amdefine')]),
				[new Identifier('module')]))])),
	DeclareBuiltBag = new VariableDeclaration('const',
		[new VariableDeclarator(IdBuilt, LitEmptyArray)]),
	DeclareBuiltMap = new VariableDeclaration('const', [
		new VariableDeclarator(IdBuilt,
			new NewExpression(member(new Identifier('global'), 'Map'), []))]),
	DeclareBuiltObj = new VariableDeclaration('const', [
		new VariableDeclarator(IdBuilt, new ObjectExpression([]))]),
	DeclareLexicalThis = new VariableDeclaration('const',
		[new VariableDeclarator(IdLexicalThis, new ThisExpression())]),
	ExportsDefault = member(IdExports, 'default'),
	ExportsGet = member(IdExports, '_get')

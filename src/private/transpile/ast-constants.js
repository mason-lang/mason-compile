import { ArrayExpression, BinaryExpression, CallExpression, ExpressionStatement, Identifier,
	IfStatement, Literal, NewExpression, ObjectExpression, ReturnStatement, SwitchCase,
	UnaryExpression, VariableDeclaration, VariableDeclarator } from 'esast/dist/ast'
import { member } from 'esast/dist/util'
import { _IdError, templateElementForString, throwErrorFromString } from './util'

export const
	EmptyTemplateElement = templateElementForString(''),
	IdArguments = Identifier('arguments'),
	IdBuilt = Identifier('built'),
	IdDefine = Identifier('define'),
	IdError = _IdError,
	IdExports = Identifier('exports'),
	IdExtract = Identifier('_$'),
	IdFunctionApplyCall = member(member(Identifier('Function'), 'apply'), 'call'),
	// TODO:ES6 Shouldn't need, just use arrow functions.
	IdLexicalThis = Identifier('_this'),
	LitEmptyArray = ArrayExpression([]),
	LitEmptyString = Literal(''),
	LitNull = Literal(null),
	LitStrExports = Literal('exports'),
	LitStrThrow = Literal('An error occurred.'),
	LitTrue = Literal(true),
	LitZero = Literal(0),
	ReturnBuilt = ReturnStatement(IdBuilt),
	ReturnExports = ReturnStatement(IdExports),
	ReturnRes = ReturnStatement(Identifier('res')),
	SwitchCaseNoMatch = SwitchCase(undefined, [
		throwErrorFromString('No branch of `switch` matches.') ]),
	SymbolIterator = member(Identifier('Symbol'), 'iterator'),
	ThrowAssertFail = throwErrorFromString('Assertion failed.'),
	ThrowNoCaseMatch = throwErrorFromString('No branch of `case` matches.'),
	UseStrict = ExpressionStatement(Literal('use strict')),

	ArraySliceCall = member(member(LitEmptyArray, 'slice'), 'call'),
	// if (typeof define !== 'function') var define = require('amdefine')(module)
	AmdefineHeader = IfStatement(
		BinaryExpression('!==', UnaryExpression('typeof', IdDefine), Literal('function')),
		VariableDeclaration('var', [
			VariableDeclarator(IdDefine, CallExpression(
				CallExpression(Identifier('require'), [ Literal('amdefine') ]),
				[ Identifier('module') ])) ])),
	DeclareBuiltBag = VariableDeclaration('const', [ VariableDeclarator(IdBuilt, LitEmptyArray) ]),
	DeclareBuiltMap = VariableDeclaration('const', [
		VariableDeclarator(IdBuilt,
			NewExpression(member(Identifier('global'), 'Map'), [ ])) ]),
	DeclareBuiltObj = VariableDeclaration('const', [
		VariableDeclarator(IdBuilt, ObjectExpression([ ])) ]),
	ExportsDefault = member(IdExports, 'default'),
	ExportsGet = member(IdExports, '_get')

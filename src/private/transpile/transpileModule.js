import {ArrayExpression, ArrowFunctionExpression, AssignmentExpression, BinaryExpression,
	BlockStatement, CallExpression, ExpressionStatement, Identifier, IfStatement, Literal, Program,
	VariableDeclaration, VariableDeclarator, ReturnStatement, UnaryExpression
	} from 'esast/dist/ast'
import {identifier, loc, member, toStatement} from 'esast/dist/util'
import {options} from '../context'
import manglePath from '../manglePath'
import {Import, LocalDeclare} from '../MsAst'
import {cat, flatMap, isEmpty, last, opIf, opMap, rtail} from '../util'
import {Modules} from '../VerifyResults'
import {DeclareBuiltBag, DeclareBuiltMap, ExportsDefault, IdBuilt, IdExports} from './ast-constants'
import {verifyResults} from './context'
import {idForDeclareCached, lazyWrap, makeDestructureDeclarators, msCall, t0, tLines} from './util'

export default function transpileModule() {
	const body = moduleBody(verifyResults.moduleKind, this.lines)

	verifyResults.builtinPathToNames.forEach((imported, path) => {
		if (path !== 'global') {
			const importedDeclares = []
			let opImportDefault = null
			let defaultName = last(path.split('/'))
			for (const name of imported) {
				const declare = LocalDeclare.plain(this.loc, name)
				if (name === defaultName)
					opImportDefault = declare
				else
					importedDeclares.push(declare)
			}
			this.imports.push(new Import(this.loc, path, importedDeclares, opImportDefault))
		}
	})

	const amd = amdWrapModule(this.doImports, this.imports, body)

	return new Program(cat(
		opIf(options.includeUseStrict(), () => UseStrict),
		opIf(options.includeAmdefine(), () => AmdefineHeader),
		toStatement(amd)))
}

function moduleBody(kind, lines) {
	switch (kind) {
		case Modules.Do: case Modules.Exports:
			return tLines(lines)
		case Modules.Val: {
			const a = tLines(rtail(lines))
			const b = t0(last(lines))
			return cat(a, exportDefault(b))
		}
		case Modules.Bag: case Modules.Map: {
			const declare = kind === Modules.Bag ? DeclareBuiltBag : DeclareBuiltMap
			return cat(declare, tLines(lines), exportDefault(IdBuilt))
		}
		default:
			throw new Error(verifyResults.moduleKind)
	}
}

export function exportNamedOrDefault(val, name) {
	if (name === options.moduleName())
		return exportDefault(val)
	else
		return exportNamed(val, name)
}

function exportNamed(val, name) {
	return new AssignmentExpression('=', member(IdExports, name), val)
}
function exportDefault(val) {
	return new AssignmentExpression('=', ExportsDefault, val)
}


function amdWrapModule(doImports, imports, body) {
	const shouldImportBoot = options.importBoot()

	const allImports = doImports.concat(imports)
	const allImportPaths = allImports.map(_ => manglePath(_.path))

	const arrImportPaths = new ArrayExpression(cat(
		LitStrExports,
		opIf(shouldImportBoot, () => new Literal(options.bootPath())),
		allImportPaths.map(_ => new Literal(_))))

	const importToIdentifier = new Map()
	const importIdentifiers = []
	for (let i = 0; i < allImports.length; i = i + 1) {
		const _ = allImports[i]
		const id = identifier(`${pathBaseName(_.path)}_${i}`)
		importIdentifiers.push(id)
		importToIdentifier.set(_, id)
	}

	const importArgs = cat(IdExports, opIf(shouldImportBoot, () => IdBoot), importIdentifiers)

	const doBoot = opIf(shouldImportBoot, () =>
		new ExpressionStatement(msCall('getModule', IdBoot)))

	const importDos = doImports.map(_ =>
		loc(new ExpressionStatement(msCall('getModule', importToIdentifier.get(_))), _.loc))

	// Extracts imported values from the modules.
	const opDeclareImportedLocals = opIf(!isEmpty(imports),
		() => new VariableDeclaration('const',
			flatMap(imports, _ => importDeclarators(_, importToIdentifier.get(_)))))

	const fullBody = new BlockStatement(cat(
		doBoot, importDos, opDeclareImportedLocals, body, ReturnExports))

	const lazyBody =
		options.lazyModule() ?
			new BlockStatement([new ExpressionStatement(
				new AssignmentExpression('=', ExportsGet,
					msCall('lazy', new ArrowFunctionExpression([], fullBody))))]) :
			fullBody

	return new CallExpression(IdDefine,
		[arrImportPaths, new ArrowFunctionExpression(importArgs, lazyBody)])
}

function pathBaseName(path) {
	return path.substr(path.lastIndexOf('/') + 1)
}

function importDeclarators({imported, opImportDefault}, moduleIdentifier) {
	// TODO: Could be neater about this
	const isLazy = (isEmpty(imported) ? opImportDefault : imported[0]).isLazy()
	const value = msCall(isLazy ? 'lazyGetModule' : 'getModule', moduleIdentifier)

	const importedDefault = opMap(opImportDefault, def => {
		const defexp = msCall('getDefaultExport', moduleIdentifier)
		const val = isLazy ? lazyWrap(defexp) : defexp
		return loc(new VariableDeclarator(idForDeclareCached(def), val), def.loc)
	})

	const importedDestruct = isEmpty(imported) ? null :
		makeDestructureDeclarators(imported, isLazy, value, true, false)

	return cat(importedDefault, importedDestruct)
}

const IdBoot = new Identifier('_boot')
const IdDefine = new Identifier('define')
const ExportsGet = member(IdExports, '_get')
const LitStrExports = new Literal('exports')
const ReturnExports = new ReturnStatement(IdExports)
const UseStrict = new ExpressionStatement(new Literal('use strict'))

// if (typeof define !== 'function') var define = require('amdefine')(module)
const AmdefineHeader = new IfStatement(
	new BinaryExpression('!==',
		new UnaryExpression('typeof', IdDefine),
		new Literal('function')),
	new VariableDeclaration('var', [
		new VariableDeclarator(IdDefine, new CallExpression(
			new CallExpression(new Identifier('require'), [new Literal('amdefine')]),
			[new Identifier('module')]))]))

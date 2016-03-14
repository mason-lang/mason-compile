import {VariableDeclarationLet, VariableDeclarationVar, VariableDeclarator
	} from 'esast/lib/Declaration'
import Expression, {ArrayExpression, AssignmentExpression, BinaryExpression, CallExpression,
	UnaryExpression} from 'esast/lib/Expression'
import {ArrowFunctionExpression} from 'esast/lib/Function'
import Identifier from 'esast/lib/Identifier'
import {LiteralString} from 'esast/lib/Literal'
import {Script} from 'esast/lib/Program'
import Statement, {BlockStatement, ExpressionStatement, IfStatement, ReturnStatement
	} from 'esast/lib/Statement'
import {identifier, member} from 'esast-create-util/lib/util'
import Op, {opIf, opMap} from 'op/Op'
import {compileOptions, pathOptions} from '../context'
import manglePath from '../manglePath'
import LineContent, {Do, Val} from '../ast/LineContent'
import {LocalDeclare} from '../ast/locals'
import Module, {Import, ImportDo} from '../ast/Module'
import {cat, flatMap, isEmpty, last, rtail} from '../util'
import {Modules} from '../VerifyResults'
import {verifyResults} from './context'
import {declareBuiltBag, declareBuiltMap, idBuilt} from './esast-constants'
import {msCall} from './ms'
import {idForDeclareCached, makeDestructureDeclarators} from './transpileLocals'
import transpileVal from './transpileVal'
import {lazyWrap, loc, transpileLines} from './util'

// TODO:ES6 return esast.Module
export default function transpileModule(_: Module): Script {
	const {doImports, lines} = _

	const body = moduleBody(verifyResults.moduleKind, lines)

	if (compileOptions.noModuleBoilerplate)
		return new Script(body)

	const amd = amdWrapModule(doImports, transpiledImports(_), body)

	return loc(_, new Script(cat(
		opIf(compileOptions.useStrict, () => useStrict),
		opIf(compileOptions.includeAmdefine, () => amdefineHeader),
		amd)))
}

function transpiledImports(_: Module): Array<Import> {
	const {imports} = _

	const res = imports.filter(_ => _.path !== 'global')

	for (const [path, imported] of verifyResults.builtinPathToNames)
		if (path !== 'global') {
			const importedDeclares: Array<LocalDeclare> = []
			let opImportDefault: Op<LocalDeclare> = null
			const defaultName = last(path.split('/'))
			for (const name of imported) {
				const declare = LocalDeclare.plain(_.loc, name)
				if (name === defaultName)
					opImportDefault = declare
				else
					importedDeclares.push(declare)
			}
			res.push(new Import(_.loc, path, importedDeclares, opImportDefault))
		}

	return res
}

function moduleBody(kind: Modules, lines: Array<LineContent>): Array<Statement> {
	switch (kind) {
		case Modules.Do: case Modules.Exports:
			return transpileLines(<Array<Do>> lines)
		case Modules.Val:
			const dos = transpileLines(<Array<Do>> rtail(lines))
			const val = transpileVal(<Val> last(lines))
			if (compileOptions.noModuleBoilerplate)
				return cat(dos, new ExpressionStatement(val))
			else
				return cat(dos, new ExpressionStatement(exportDefault(val)))
		case Modules.Bag: case Modules.Map: {
			const declare = kind === Modules.Bag ? declareBuiltBag : declareBuiltMap
			const dos = transpileLines(<Array<Do>> lines)
			if (compileOptions.noModuleBoilerplate)
				return cat(declare, dos)
			else
				return cat(declare, dos, new ExpressionStatement(exportDefault(idBuilt)))
		}
		default:
			throw new Error(String(verifyResults.moduleKind))
	}
}

export function exportNamedOrDefault(val: Expression, name: string): AssignmentExpression {
	return name === pathOptions.moduleName ?
		exportDefault(val) :
		exportNamed(val, name)
}

function exportNamed(val: Expression, name: string): AssignmentExpression {
	return new AssignmentExpression('=', member(idExports, name), val)
}
function exportDefault(val: Expression): AssignmentExpression {
	return new AssignmentExpression('=', exportsDefault, val)
}

function amdWrapModule(
	doImports: Array<ImportDo>,
	imports: Array<Import>,
	body: Array<Statement>
	): Statement {
	const shouldImportBoot = compileOptions.importBoot

	const allImports = doImports.concat(imports)
	const allImportPaths = allImports.map(_ => manglePath(_.path))

	const arrImportPaths = new ArrayExpression(cat(
		litStrExports,
		opIf(shouldImportBoot, () => new LiteralString(compileOptions.bootPath)),
		allImportPaths.map(_ => new LiteralString(_))))

	const importToIdentifier = new Map()
	const importIdentifiers: Array<Identifier> = []
	for (let i = 0; i < allImports.length; i = i + 1) {
		const _ = allImports[i]
		const id = identifier(`${pathBaseName(_.path)}_${i}`)
		importIdentifiers.push(id)
		importToIdentifier.set(_, id)
	}

	function getIdentifier(_: ImportDo | Import): Identifier {
		return <Identifier> importToIdentifier.get(_)
	}

	const importArgs = cat(idExports, opIf(shouldImportBoot, () => idBoot), importIdentifiers)

	const doBoot = opIf(shouldImportBoot, () =>
		new ExpressionStatement(msCall('getModule', idBoot)))

	const importDos = doImports.map(_ =>
		loc(_, new ExpressionStatement(msCall('getModule', getIdentifier(_)))))

	// Extracts imported values from the modules.
	const opDeclareImportedLocals = opIf(!isEmpty(imports), () =>
		new VariableDeclarationLet(
			flatMap(imports, _ => importDeclarators(_, getIdentifier(_)))))

	const fullBody = new BlockStatement(cat(
		doBoot, importDos, opDeclareImportedLocals, body, returnExports))

	const lazyBody = compileOptions.lazyModules ?
		new BlockStatement([new ExpressionStatement(
			new AssignmentExpression(
				'=',
				exportsGet,
				msCall('lazy', new ArrowFunctionExpression([], fullBody))))]) :
		fullBody

	return new ExpressionStatement(new CallExpression(
		idDefine,
		[arrImportPaths, new ArrowFunctionExpression(importArgs, lazyBody)]))
}

function pathBaseName(path: string): string {
	return path.substr(path.lastIndexOf('/') + 1)
}

function importDeclarators({imported, opImportDefault}: Import, moduleIdentifier: Identifier
	): Array<VariableDeclarator> {
	// TODO: Could be neater about this
	const isLazy = (<LocalDeclare> (isEmpty(imported) ? opImportDefault : imported[0])).isLazy
	const value = msCall(isLazy ? 'lazyGetModule' : 'getModule', moduleIdentifier)

	const importedDefault = opMap(opImportDefault, def => {
		const defexp = msCall('getDefaultExport', moduleIdentifier)
		const val = isLazy ? lazyWrap(defexp) : defexp
		return loc(def, new VariableDeclarator(idForDeclareCached(def), val))
	})

	const importedDestruct = isEmpty(imported) ? null :
		makeDestructureDeclarators(imported, isLazy, value, true)

	return cat(importedDefault, importedDestruct)
}

const idBoot = new Identifier('_boot')
const idDefine = new Identifier('define')
const idExports = new Identifier('exports')
const exportsGet = member(idExports, '_get')
const litStrExports = new LiteralString('exports')
const returnExports = new ReturnStatement(idExports)
const useStrict = new ExpressionStatement(new LiteralString('use strict'))

// if (typeof define !== 'function') var define = require('amdefine')(module)
const amdefineHeader = new IfStatement(
	new BinaryExpression(
		'!==',
		new UnaryExpression('typeof', idDefine),
		new LiteralString('function')),
	new VariableDeclarationVar([
		new VariableDeclarator(idDefine, new CallExpression(
			new CallExpression(new Identifier('require'), [new LiteralString('amdefine')]),
			[new Identifier('module')]))]))

const exportsDefault = member(idExports, 'default')

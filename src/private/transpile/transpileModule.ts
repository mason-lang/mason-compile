import {ArrayExpression, ArrowFunctionExpression, AssignmentExpression, BinaryExpression,
	BlockStatement, CallExpression, Expression, ExpressionStatement, Identifier, IfStatement, LiteralString, Program,
	ReturnStatement, Script, Statement, UnaryExpression, VariableDeclaration, VariableDeclarator} from 'esast/lib/ast'
import {identifier, loc, member, toLineContent} from 'esast-create-util/lib/util'
import Op, {opIf, opMap} from 'op/Op'
import {options, pathOptions} from '../context'
import manglePath from '../manglePath'
import {Import, ImportDo, LineContent, LocalDeclare} from '../MsAst'
import {cat, flatMap, isEmpty, last, rtail} from '../util'
import {Modules} from '../VerifyResults'
import {DeclareBuiltBag, DeclareBuiltMap, IdBuilt, IdExports} from './ast-constants'
import {verifyResults} from './context'
import {idForDeclareCached, lazyWrap, makeDestructureDeclarators, msCall, t0, tLines} from './util'

export default function(): Program {
	const body = moduleBody(verifyResults.moduleKind, this.lines)

	const imports = this.imports.filter((_: Import) => _.path !== 'global')

	for (const [path, imported] of verifyResults.builtinPathToNames)
		if (path !== 'global') {
			const importedDeclares: Array<LocalDeclare> = []
			let opImportDefault: Op<LocalDeclare> = null
			const defaultName = last(path.split('/'))
			for (const name of imported) {
				const declare = LocalDeclare.plain(this.loc, name)
				if (name === defaultName)
					opImportDefault = declare
				else
					importedDeclares.push(declare)
			}
			imports.push(new Import(this.loc, path, importedDeclares, opImportDefault))
		}

	const amd = amdWrapModule(this.doImports, imports, body)

	return new Script(cat(
		opIf(options.useStrict, () => UseStrict),
		opIf(options.includeAmdefine, () => AmdefineHeader),
		toLineContent(amd)))
}

function moduleBody(kind: Modules, lines: Array<LineContent>): Array<Statement> {
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
			throw new Error(String(verifyResults.moduleKind))
	}
}

export function exportNamedOrDefault(val: Expression, name: string): AssignmentExpression {
	return name === pathOptions.moduleName ?
		exportDefault(val) :
		exportNamed(val, name)
}

function exportNamed(val: Expression, name: string): AssignmentExpression {
	return new AssignmentExpression('=', member(IdExports, name), val)
}
function exportDefault(val: Expression): AssignmentExpression {
	return new AssignmentExpression('=', ExportsDefault, val)
}


function amdWrapModule(doImports: Array<ImportDo>, imports: Array<Import>, body: Array<Statement>) {
	const shouldImportBoot = options.importBoot

	const allImports = doImports.concat(imports)
	const allImportPaths = allImports.map(_ => manglePath(_.path))

	const arrImportPaths = new ArrayExpression(cat(
		LitStrExports,
		opIf(shouldImportBoot, () => new LiteralString(options.bootPath)),
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

	const importArgs = cat(IdExports, opIf(shouldImportBoot, () => IdBoot), importIdentifiers)

	const doBoot = opIf(shouldImportBoot, () =>
		new ExpressionStatement(msCall('getModule', IdBoot)))

	const importDos = doImports.map(_ =>
		loc(new ExpressionStatement(msCall('getModule', getIdentifier(_))), _.loc))

	// Extracts imported values from the modules.
	const opDeclareImportedLocals = opIf(!isEmpty(imports),
		() => new VariableDeclaration('let',
			flatMap(imports, _ => importDeclarators(_, getIdentifier(_)))))

	const fullBody = new BlockStatement(cat(
		doBoot, importDos, opDeclareImportedLocals, body, ReturnExports))

	const lazyBody =
		options.lazyModules ?
			new BlockStatement([new ExpressionStatement(
				new AssignmentExpression('=', ExportsGet,
					msCall('lazy', new ArrowFunctionExpression([], fullBody))))]) :
			fullBody

	return new CallExpression(IdDefine,
		[arrImportPaths, new ArrowFunctionExpression(importArgs, lazyBody)])
}

function pathBaseName(path: string): string {
	return path.substr(path.lastIndexOf('/') + 1)
}

function importDeclarators({imported, opImportDefault}: Import, moduleIdentifier: Identifier): Array<VariableDeclarator> {
	// TODO: Could be neater about this
	const isLazy = (<LocalDeclare> (isEmpty(imported) ? opImportDefault : imported[0])).isLazy
	const value = msCall(isLazy ? 'lazyGetModule' : 'getModule', moduleIdentifier)

	const importedDefault = opMap(opImportDefault, def => {
		const defexp = msCall('getDefaultExport', moduleIdentifier)
		const val = isLazy ? lazyWrap(defexp) : defexp
		return loc(new VariableDeclarator(idForDeclareCached(def), val), def.loc)
	})

	const importedDestruct = isEmpty(imported) ? null :
		makeDestructureDeclarators(imported, isLazy, value, true)

	return cat(importedDefault, importedDestruct)
}

const IdBoot = new Identifier('_boot')
const IdDefine = new Identifier('define')
const ExportsGet = member(IdExports, '_get')
const LitStrExports = new LiteralString('exports')
const ReturnExports = new ReturnStatement(IdExports)
const UseStrict = new ExpressionStatement(new LiteralString('use strict'))

// if (typeof define !== 'function') var define = require('amdefine')(module)
const AmdefineHeader = new IfStatement(
	new BinaryExpression('!==',
		new UnaryExpression('typeof', IdDefine),
		new LiteralString('function')),
	new VariableDeclaration('var', [
		new VariableDeclarator(IdDefine, new CallExpression(
			new CallExpression(new Identifier('require'), [new LiteralString('amdefine')]),
			[new Identifier('module')]))]))

const ExportsDefault = member(IdExports, 'default')

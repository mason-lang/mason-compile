'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/util', '../context', '../manglePath', '../MsAst', '../util', './ast-constants', './transpile', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('esast/dist/util'), require('../context'), require('../manglePath'), require('../MsAst'), require('../util'), require('./ast-constants'), require('./transpile'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.context, global.manglePath, global.MsAst, global.util, global.astConstants, global.transpile, global.util);
		global.transpileModule = mod.exports;
	}
})(this, function (exports, _ast, _util, _context, _manglePath, _MsAst, _util2, _astConstants, _transpile, _util3) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = transpileModule;

	var _manglePath2 = _interopRequireDefault(_manglePath);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function transpileModule() {
		const body = (0, _util3.tLines)(this.lines);

		_transpile.verifyResults.builtinPathToNames.forEach((imported, path) => {
			if (path !== 'global') {
				const importedDeclares = [];
				let opImportDefault = null;
				let defaultName = (0, _util2.last)(path.split('/'));

				for (const name of imported) {
					const declare = _MsAst.LocalDeclare.plain(this.loc, name);

					if (name === defaultName) opImportDefault = declare;else importedDeclares.push(declare);
				}

				this.imports.push(new _MsAst.Import(this.loc, path, importedDeclares, opImportDefault));
			}
		});

		const amd = amdWrapModule(this.doImports, this.imports, body);
		return new _ast.Program((0, _util2.cat)((0, _util2.opIf)(_context.options.includeUseStrict(), () => UseStrict), (0, _util2.opIf)(_context.options.includeAmdefine(), () => AmdefineHeader), (0, _util.toStatement)(amd)));
	}

	function amdWrapModule(doImports, imports, body) {
		const shouldImportBoot = _context.options.importBoot();

		const allImports = doImports.concat(imports);
		const allImportPaths = allImports.map(_ => (0, _manglePath2.default)(_.path));
		const arrImportPaths = new _ast.ArrayExpression((0, _util2.cat)((0, _util2.opIf)(shouldImportBoot, () => new _ast.Literal(_context.options.bootPath())), LitStrExports, allImportPaths.map(_ => new _ast.Literal(_))));
		const importToIdentifier = new Map();
		const importIdentifiers = [];

		for (let i = 0; i < allImports.length; i = i + 1) {
			const _ = allImports[i];
			const id = (0, _util.identifier)(`${ pathBaseName(_.path) }_${ i }`);
			importIdentifiers.push(id);
			importToIdentifier.set(_, id);
		}

		const importArgs = (0, _util2.cat)((0, _util2.opIf)(shouldImportBoot, () => IdBoot), _astConstants.IdExports, importIdentifiers);
		const doBoot = (0, _util2.opIf)(shouldImportBoot, () => new _ast.ExpressionStatement((0, _util3.msCall)('getModule', IdBoot)));
		const importDos = doImports.map(_ => (0, _util.loc)(new _ast.ExpressionStatement((0, _util3.msCall)('getModule', importToIdentifier.get(_))), _.loc));
		const opDeclareImportedLocals = (0, _util2.opIf)(!(0, _util2.isEmpty)(imports), () => new _ast.VariableDeclaration('const', (0, _util2.flatMap)(imports, _ => importDeclarators(_, importToIdentifier.get(_)))));
		const fullBody = new _ast.BlockStatement((0, _util2.cat)(doBoot, importDos, opDeclareImportedLocals, body, ReturnExports));
		const lazyBody = _context.options.lazyModule() ? new _ast.BlockStatement([new _ast.ExpressionStatement(new _ast.AssignmentExpression('=', ExportsGet, (0, _util3.msCall)('lazy', new _ast.ArrowFunctionExpression([], fullBody))))]) : fullBody;
		return new _ast.CallExpression(IdDefine, [arrImportPaths, new _ast.ArrowFunctionExpression(importArgs, lazyBody)]);
	}

	function pathBaseName(path) {
		return path.substr(path.lastIndexOf('/') + 1);
	}

	function importDeclarators(_ref, moduleIdentifier) {
		let imported = _ref.imported;
		let opImportDefault = _ref.opImportDefault;
		const isLazy = ((0, _util2.isEmpty)(imported) ? opImportDefault : imported[0]).isLazy();
		const value = (0, _util3.msCall)(isLazy ? 'lazyGetModule' : 'getModule', moduleIdentifier);
		const importedDefault = (0, _util2.opMap)(opImportDefault, def => {
			const defexp = (0, _util3.msCall)('getDefaultExport', moduleIdentifier);
			const val = isLazy ? (0, _util3.lazyWrap)(defexp) : defexp;
			return (0, _util.loc)(new _ast.VariableDeclarator((0, _util3.idForDeclareCached)(def), val), def.loc);
		});
		const importedDestruct = (0, _util2.isEmpty)(imported) ? null : (0, _transpile.makeDestructureDeclarators)(imported, isLazy, value, true, false);
		return (0, _util2.cat)(importedDefault, importedDestruct);
	}

	const IdBoot = new _ast.Identifier('_boot');
	const IdDefine = new _ast.Identifier('define');
	const ExportsGet = (0, _util.member)(_astConstants.IdExports, '_get');
	const LitStrExports = new _ast.Literal('exports');
	const ReturnExports = new _ast.ReturnStatement(_astConstants.IdExports);
	const UseStrict = new _ast.ExpressionStatement(new _ast.Literal('use strict'));
	const AmdefineHeader = new _ast.IfStatement(new _ast.BinaryExpression('!==', new _ast.UnaryExpression('typeof', IdDefine), new _ast.Literal('function')), new _ast.VariableDeclaration('var', [new _ast.VariableDeclarator(IdDefine, new _ast.CallExpression(new _ast.CallExpression(new _ast.Identifier('require'), [new _ast.Literal('amdefine')]), [new _ast.Identifier('module')]))]));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGVNb2R1bGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQWF3QixlQUFlOzs7Ozs7VUFBZixlQUFlIiwiZmlsZSI6InRyYW5zcGlsZU1vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXJyYXlFeHByZXNzaW9uLCBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbiwgQXNzaWdubWVudEV4cHJlc3Npb24sIEJpbmFyeUV4cHJlc3Npb24sXG5cdEJsb2NrU3RhdGVtZW50LCBDYWxsRXhwcmVzc2lvbiwgRXhwcmVzc2lvblN0YXRlbWVudCwgSWRlbnRpZmllciwgSWZTdGF0ZW1lbnQsIExpdGVyYWwsIFByb2dyYW0sXG5cdFZhcmlhYmxlRGVjbGFyYXRpb24sIFZhcmlhYmxlRGVjbGFyYXRvciwgUmV0dXJuU3RhdGVtZW50LCBVbmFyeUV4cHJlc3Npb25cblx0fSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7aWRlbnRpZmllciwgbG9jLCBtZW1iZXIsIHRvU3RhdGVtZW50fSBmcm9tICdlc2FzdC9kaXN0L3V0aWwnXG5pbXBvcnQge29wdGlvbnN9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQgbWFuZ2xlUGF0aCBmcm9tICcuLi9tYW5nbGVQYXRoJ1xuaW1wb3J0IHtJbXBvcnQsIExvY2FsRGVjbGFyZX0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2NhdCwgZmxhdE1hcCwgaXNFbXB0eSwgbGFzdCwgb3BJZiwgb3BNYXB9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0lkRXhwb3J0c30gZnJvbSAnLi9hc3QtY29uc3RhbnRzJ1xuaW1wb3J0IHttYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycywgdmVyaWZ5UmVzdWx0c30gZnJvbSAnLi90cmFuc3BpbGUnXG5pbXBvcnQge2lkRm9yRGVjbGFyZUNhY2hlZCwgbGF6eVdyYXAsIG1zQ2FsbCwgdExpbmVzfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRyYW5zcGlsZU1vZHVsZSgpIHtcblx0Y29uc3QgYm9keSA9IHRMaW5lcyh0aGlzLmxpbmVzKVxuXG5cdHZlcmlmeVJlc3VsdHMuYnVpbHRpblBhdGhUb05hbWVzLmZvckVhY2goKGltcG9ydGVkLCBwYXRoKSA9PiB7XG5cdFx0aWYgKHBhdGggIT09ICdnbG9iYWwnKSB7XG5cdFx0XHRjb25zdCBpbXBvcnRlZERlY2xhcmVzID0gW11cblx0XHRcdGxldCBvcEltcG9ydERlZmF1bHQgPSBudWxsXG5cdFx0XHRsZXQgZGVmYXVsdE5hbWUgPSBsYXN0KHBhdGguc3BsaXQoJy8nKSlcblx0XHRcdGZvciAoY29uc3QgbmFtZSBvZiBpbXBvcnRlZCkge1xuXHRcdFx0XHRjb25zdCBkZWNsYXJlID0gTG9jYWxEZWNsYXJlLnBsYWluKHRoaXMubG9jLCBuYW1lKVxuXHRcdFx0XHRpZiAobmFtZSA9PT0gZGVmYXVsdE5hbWUpXG5cdFx0XHRcdFx0b3BJbXBvcnREZWZhdWx0ID0gZGVjbGFyZVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0aW1wb3J0ZWREZWNsYXJlcy5wdXNoKGRlY2xhcmUpXG5cdFx0XHR9XG5cdFx0XHR0aGlzLmltcG9ydHMucHVzaChuZXcgSW1wb3J0KHRoaXMubG9jLCBwYXRoLCBpbXBvcnRlZERlY2xhcmVzLCBvcEltcG9ydERlZmF1bHQpKVxuXHRcdH1cblx0fSlcblxuXHRjb25zdCBhbWQgPSBhbWRXcmFwTW9kdWxlKHRoaXMuZG9JbXBvcnRzLCB0aGlzLmltcG9ydHMsIGJvZHkpXG5cblx0cmV0dXJuIG5ldyBQcm9ncmFtKGNhdChcblx0XHRvcElmKG9wdGlvbnMuaW5jbHVkZVVzZVN0cmljdCgpLCAoKSA9PiBVc2VTdHJpY3QpLFxuXHRcdG9wSWYob3B0aW9ucy5pbmNsdWRlQW1kZWZpbmUoKSwgKCkgPT4gQW1kZWZpbmVIZWFkZXIpLFxuXHRcdHRvU3RhdGVtZW50KGFtZCkpKVxufVxuXG5mdW5jdGlvbiBhbWRXcmFwTW9kdWxlKGRvSW1wb3J0cywgaW1wb3J0cywgYm9keSkge1xuXHRjb25zdCBzaG91bGRJbXBvcnRCb290ID0gb3B0aW9ucy5pbXBvcnRCb290KClcblxuXHRjb25zdCBhbGxJbXBvcnRzID0gZG9JbXBvcnRzLmNvbmNhdChpbXBvcnRzKVxuXHRjb25zdCBhbGxJbXBvcnRQYXRocyA9IGFsbEltcG9ydHMubWFwKF8gPT4gbWFuZ2xlUGF0aChfLnBhdGgpKVxuXG5cdGNvbnN0IGFyckltcG9ydFBhdGhzID0gbmV3IEFycmF5RXhwcmVzc2lvbihjYXQoXG5cdFx0b3BJZihzaG91bGRJbXBvcnRCb290LCAoKSA9PiBuZXcgTGl0ZXJhbChvcHRpb25zLmJvb3RQYXRoKCkpKSxcblx0XHRMaXRTdHJFeHBvcnRzLFxuXHRcdGFsbEltcG9ydFBhdGhzLm1hcChfID0+IG5ldyBMaXRlcmFsKF8pKSkpXG5cblx0Y29uc3QgaW1wb3J0VG9JZGVudGlmaWVyID0gbmV3IE1hcCgpXG5cdGNvbnN0IGltcG9ydElkZW50aWZpZXJzID0gW11cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhbGxJbXBvcnRzLmxlbmd0aDsgaSA9IGkgKyAxKSB7XG5cdFx0Y29uc3QgXyA9IGFsbEltcG9ydHNbaV1cblx0XHRjb25zdCBpZCA9IGlkZW50aWZpZXIoYCR7cGF0aEJhc2VOYW1lKF8ucGF0aCl9XyR7aX1gKVxuXHRcdGltcG9ydElkZW50aWZpZXJzLnB1c2goaWQpXG5cdFx0aW1wb3J0VG9JZGVudGlmaWVyLnNldChfLCBpZClcblx0fVxuXG5cdGNvbnN0IGltcG9ydEFyZ3MgPSBjYXQob3BJZihzaG91bGRJbXBvcnRCb290LCAoKSA9PiBJZEJvb3QpLCBJZEV4cG9ydHMsIGltcG9ydElkZW50aWZpZXJzKVxuXG5cdGNvbnN0IGRvQm9vdCA9IG9wSWYoc2hvdWxkSW1wb3J0Qm9vdCwgKCkgPT5cblx0XHRuZXcgRXhwcmVzc2lvblN0YXRlbWVudChtc0NhbGwoJ2dldE1vZHVsZScsIElkQm9vdCkpKVxuXG5cdGNvbnN0IGltcG9ydERvcyA9IGRvSW1wb3J0cy5tYXAoXyA9PlxuXHRcdGxvYyhuZXcgRXhwcmVzc2lvblN0YXRlbWVudChtc0NhbGwoJ2dldE1vZHVsZScsIGltcG9ydFRvSWRlbnRpZmllci5nZXQoXykpKSwgXy5sb2MpKVxuXG5cdC8vIEV4dHJhY3RzIGltcG9ydGVkIHZhbHVlcyBmcm9tIHRoZSBtb2R1bGVzLlxuXHRjb25zdCBvcERlY2xhcmVJbXBvcnRlZExvY2FscyA9IG9wSWYoIWlzRW1wdHkoaW1wb3J0cyksXG5cdFx0KCkgPT4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0Jyxcblx0XHRcdGZsYXRNYXAoaW1wb3J0cywgXyA9PiBpbXBvcnREZWNsYXJhdG9ycyhfLCBpbXBvcnRUb0lkZW50aWZpZXIuZ2V0KF8pKSkpKVxuXG5cdGNvbnN0IGZ1bGxCb2R5ID0gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChcblx0XHRkb0Jvb3QsIGltcG9ydERvcywgb3BEZWNsYXJlSW1wb3J0ZWRMb2NhbHMsIGJvZHksIFJldHVybkV4cG9ydHMpKVxuXG5cdGNvbnN0IGxhenlCb2R5ID1cblx0XHRvcHRpb25zLmxhenlNb2R1bGUoKSA/XG5cdFx0XHRuZXcgQmxvY2tTdGF0ZW1lbnQoW25ldyBFeHByZXNzaW9uU3RhdGVtZW50KFxuXHRcdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBFeHBvcnRzR2V0LFxuXHRcdFx0XHRcdG1zQ2FsbCgnbGF6eScsIG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihbXSwgZnVsbEJvZHkpKSkpXSkgOlxuXHRcdFx0ZnVsbEJvZHlcblxuXHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKElkRGVmaW5lLFxuXHRcdFthcnJJbXBvcnRQYXRocywgbmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKGltcG9ydEFyZ3MsIGxhenlCb2R5KV0pXG59XG5cbmZ1bmN0aW9uIHBhdGhCYXNlTmFtZShwYXRoKSB7XG5cdHJldHVybiBwYXRoLnN1YnN0cihwYXRoLmxhc3RJbmRleE9mKCcvJykgKyAxKVxufVxuXG5mdW5jdGlvbiBpbXBvcnREZWNsYXJhdG9ycyh7aW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdH0sIG1vZHVsZUlkZW50aWZpZXIpIHtcblx0Ly8gVE9ETzogQ291bGQgYmUgbmVhdGVyIGFib3V0IHRoaXNcblx0Y29uc3QgaXNMYXp5ID0gKGlzRW1wdHkoaW1wb3J0ZWQpID8gb3BJbXBvcnREZWZhdWx0IDogaW1wb3J0ZWRbMF0pLmlzTGF6eSgpXG5cdGNvbnN0IHZhbHVlID0gbXNDYWxsKGlzTGF6eSA/ICdsYXp5R2V0TW9kdWxlJyA6ICdnZXRNb2R1bGUnLCBtb2R1bGVJZGVudGlmaWVyKVxuXG5cdGNvbnN0IGltcG9ydGVkRGVmYXVsdCA9IG9wTWFwKG9wSW1wb3J0RGVmYXVsdCwgZGVmID0+IHtcblx0XHRjb25zdCBkZWZleHAgPSBtc0NhbGwoJ2dldERlZmF1bHRFeHBvcnQnLCBtb2R1bGVJZGVudGlmaWVyKVxuXHRcdGNvbnN0IHZhbCA9IGlzTGF6eSA/IGxhenlXcmFwKGRlZmV4cCkgOiBkZWZleHBcblx0XHRyZXR1cm4gbG9jKG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoaWRGb3JEZWNsYXJlQ2FjaGVkKGRlZiksIHZhbCksIGRlZi5sb2MpXG5cdH0pXG5cblx0Y29uc3QgaW1wb3J0ZWREZXN0cnVjdCA9IGlzRW1wdHkoaW1wb3J0ZWQpID8gbnVsbCA6XG5cdFx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMoaW1wb3J0ZWQsIGlzTGF6eSwgdmFsdWUsIHRydWUsIGZhbHNlKVxuXG5cdHJldHVybiBjYXQoaW1wb3J0ZWREZWZhdWx0LCBpbXBvcnRlZERlc3RydWN0KVxufVxuXG5jb25zdCBJZEJvb3QgPSBuZXcgSWRlbnRpZmllcignX2Jvb3QnKVxuY29uc3QgSWREZWZpbmUgPSBuZXcgSWRlbnRpZmllcignZGVmaW5lJylcbmNvbnN0IEV4cG9ydHNHZXQgPSBtZW1iZXIoSWRFeHBvcnRzLCAnX2dldCcpXG5jb25zdCBMaXRTdHJFeHBvcnRzID0gbmV3IExpdGVyYWwoJ2V4cG9ydHMnKVxuY29uc3QgUmV0dXJuRXhwb3J0cyA9IG5ldyBSZXR1cm5TdGF0ZW1lbnQoSWRFeHBvcnRzKVxuY29uc3QgVXNlU3RyaWN0ID0gbmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQobmV3IExpdGVyYWwoJ3VzZSBzdHJpY3QnKSlcblxuLy8gaWYgKHR5cGVvZiBkZWZpbmUgIT09ICdmdW5jdGlvbicpIHZhciBkZWZpbmUgPSByZXF1aXJlKCdhbWRlZmluZScpKG1vZHVsZSlcbmNvbnN0IEFtZGVmaW5lSGVhZGVyID0gbmV3IElmU3RhdGVtZW50KFxuXHRuZXcgQmluYXJ5RXhwcmVzc2lvbignIT09Jyxcblx0XHRuZXcgVW5hcnlFeHByZXNzaW9uKCd0eXBlb2YnLCBJZERlZmluZSksXG5cdFx0bmV3IExpdGVyYWwoJ2Z1bmN0aW9uJykpLFxuXHRuZXcgVmFyaWFibGVEZWNsYXJhdGlvbigndmFyJywgW1xuXHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWREZWZpbmUsIG5ldyBDYWxsRXhwcmVzc2lvbihcblx0XHRcdG5ldyBDYWxsRXhwcmVzc2lvbihuZXcgSWRlbnRpZmllcigncmVxdWlyZScpLCBbbmV3IExpdGVyYWwoJ2FtZGVmaW5lJyldKSxcblx0XHRcdFtuZXcgSWRlbnRpZmllcignbW9kdWxlJyldKSldKSlcbiJdfQ==
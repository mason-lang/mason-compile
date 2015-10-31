'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/util', '../context', '../manglePath', '../MsAst', '../util', './ast-constants', './ms-call', './transpile', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('esast/dist/util'), require('../context'), require('../manglePath'), require('../MsAst'), require('../util'), require('./ast-constants'), require('./ms-call'), require('./transpile'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.context, global.manglePath, global.MsAst, global.util, global.astConstants, global.msCall, global.transpile, global.util);
		global.transpileModule = mod.exports;
	}
})(this, function (exports, _ast, _util, _context, _manglePath, _MsAst, _util2, _astConstants, _msCall, _transpile, _util3) {
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
		const doBoot = (0, _util2.opIf)(shouldImportBoot, () => new _ast.ExpressionStatement((0, _msCall.msGetModule)(IdBoot)));
		const importDos = doImports.map(_ => (0, _util.loc)(new _ast.ExpressionStatement((0, _msCall.msGetModule)(importToIdentifier.get(_))), _.loc));
		const opDeclareImportedLocals = (0, _util2.opIf)(!(0, _util2.isEmpty)(imports), () => new _ast.VariableDeclaration('const', (0, _util2.flatMap)(imports, _ => importDeclarators(_, importToIdentifier.get(_)))));
		const fullBody = new _ast.BlockStatement((0, _util2.cat)(doBoot, importDos, opDeclareImportedLocals, body, ReturnExports));
		const lazyBody = _context.options.lazyModule() ? new _ast.BlockStatement([new _ast.ExpressionStatement(new _ast.AssignmentExpression('=', ExportsGet, (0, _msCall.msLazy)((0, _util.functionExpressionThunk)(fullBody))))]) : fullBody;
		return new _ast.CallExpression(IdDefine, [arrImportPaths, new _ast.ArrowFunctionExpression(importArgs, lazyBody)]);
	}

	function pathBaseName(path) {
		return path.substr(path.lastIndexOf('/') + 1);
	}

	function importDeclarators(_ref, moduleIdentifier) {
		let imported = _ref.imported;
		let opImportDefault = _ref.opImportDefault;
		const isLazy = ((0, _util2.isEmpty)(imported) ? opImportDefault : imported[0]).isLazy();
		const value = (isLazy ? _msCall.msLazyGetModule : _msCall.msGetModule)(moduleIdentifier);
		const importedDefault = (0, _util2.opMap)(opImportDefault, def => {
			const defexp = (0, _msCall.msGetDefaultExport)(moduleIdentifier);
			const val = isLazy ? (0, _msCall.lazyWrap)(defexp) : defexp;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGVNb2R1bGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQWN3QixlQUFlOzs7Ozs7VUFBZixlQUFlIiwiZmlsZSI6InRyYW5zcGlsZU1vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXJyYXlFeHByZXNzaW9uLCBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbiwgQXNzaWdubWVudEV4cHJlc3Npb24sIEJpbmFyeUV4cHJlc3Npb24sXG5cdEJsb2NrU3RhdGVtZW50LCBDYWxsRXhwcmVzc2lvbiwgRXhwcmVzc2lvblN0YXRlbWVudCwgSWRlbnRpZmllciwgSWZTdGF0ZW1lbnQsIExpdGVyYWwsIFByb2dyYW0sXG5cdFZhcmlhYmxlRGVjbGFyYXRpb24sIFZhcmlhYmxlRGVjbGFyYXRvciwgUmV0dXJuU3RhdGVtZW50LCBVbmFyeUV4cHJlc3Npb25cblx0fSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7ZnVuY3Rpb25FeHByZXNzaW9uVGh1bmssIGlkZW50aWZpZXIsIGxvYywgbWVtYmVyLCB0b1N0YXRlbWVudH0gZnJvbSAnZXNhc3QvZGlzdC91dGlsJ1xuaW1wb3J0IHtvcHRpb25zfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IG1hbmdsZVBhdGggZnJvbSAnLi4vbWFuZ2xlUGF0aCdcbmltcG9ydCB7SW1wb3J0LCBMb2NhbERlY2xhcmV9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtjYXQsIGZsYXRNYXAsIGlzRW1wdHksIGxhc3QsIG9wSWYsIG9wTWFwfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtJZEV4cG9ydHN9IGZyb20gJy4vYXN0LWNvbnN0YW50cydcbmltcG9ydCB7bGF6eVdyYXAsIG1zR2V0RGVmYXVsdEV4cG9ydCwgbXNHZXRNb2R1bGUsIG1zTGF6eSwgbXNMYXp5R2V0TW9kdWxlfSBmcm9tICcuL21zLWNhbGwnXG5pbXBvcnQge21ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzLCB2ZXJpZnlSZXN1bHRzfSBmcm9tICcuL3RyYW5zcGlsZSdcbmltcG9ydCB7aWRGb3JEZWNsYXJlQ2FjaGVkLCB0TGluZXN9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhbnNwaWxlTW9kdWxlKCkge1xuXHRjb25zdCBib2R5ID0gdExpbmVzKHRoaXMubGluZXMpXG5cblx0dmVyaWZ5UmVzdWx0cy5idWlsdGluUGF0aFRvTmFtZXMuZm9yRWFjaCgoaW1wb3J0ZWQsIHBhdGgpID0+IHtcblx0XHRpZiAocGF0aCAhPT0gJ2dsb2JhbCcpIHtcblx0XHRcdGNvbnN0IGltcG9ydGVkRGVjbGFyZXMgPSBbXVxuXHRcdFx0bGV0IG9wSW1wb3J0RGVmYXVsdCA9IG51bGxcblx0XHRcdGxldCBkZWZhdWx0TmFtZSA9IGxhc3QocGF0aC5zcGxpdCgnLycpKVxuXHRcdFx0Zm9yIChjb25zdCBuYW1lIG9mIGltcG9ydGVkKSB7XG5cdFx0XHRcdGNvbnN0IGRlY2xhcmUgPSBMb2NhbERlY2xhcmUucGxhaW4odGhpcy5sb2MsIG5hbWUpXG5cdFx0XHRcdGlmIChuYW1lID09PSBkZWZhdWx0TmFtZSlcblx0XHRcdFx0XHRvcEltcG9ydERlZmF1bHQgPSBkZWNsYXJlXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRpbXBvcnRlZERlY2xhcmVzLnB1c2goZGVjbGFyZSlcblx0XHRcdH1cblx0XHRcdHRoaXMuaW1wb3J0cy5wdXNoKG5ldyBJbXBvcnQodGhpcy5sb2MsIHBhdGgsIGltcG9ydGVkRGVjbGFyZXMsIG9wSW1wb3J0RGVmYXVsdCkpXG5cdFx0fVxuXHR9KVxuXG5cdGNvbnN0IGFtZCA9IGFtZFdyYXBNb2R1bGUodGhpcy5kb0ltcG9ydHMsIHRoaXMuaW1wb3J0cywgYm9keSlcblxuXHRyZXR1cm4gbmV3IFByb2dyYW0oY2F0KFxuXHRcdG9wSWYob3B0aW9ucy5pbmNsdWRlVXNlU3RyaWN0KCksICgpID0+IFVzZVN0cmljdCksXG5cdFx0b3BJZihvcHRpb25zLmluY2x1ZGVBbWRlZmluZSgpLCAoKSA9PiBBbWRlZmluZUhlYWRlciksXG5cdFx0dG9TdGF0ZW1lbnQoYW1kKSkpXG59XG5cbmZ1bmN0aW9uIGFtZFdyYXBNb2R1bGUoZG9JbXBvcnRzLCBpbXBvcnRzLCBib2R5KSB7XG5cdGNvbnN0IHNob3VsZEltcG9ydEJvb3QgPSBvcHRpb25zLmltcG9ydEJvb3QoKVxuXG5cdGNvbnN0IGFsbEltcG9ydHMgPSBkb0ltcG9ydHMuY29uY2F0KGltcG9ydHMpXG5cdGNvbnN0IGFsbEltcG9ydFBhdGhzID0gYWxsSW1wb3J0cy5tYXAoXyA9PiBtYW5nbGVQYXRoKF8ucGF0aCkpXG5cblx0Y29uc3QgYXJySW1wb3J0UGF0aHMgPSBuZXcgQXJyYXlFeHByZXNzaW9uKGNhdChcblx0XHRvcElmKHNob3VsZEltcG9ydEJvb3QsICgpID0+IG5ldyBMaXRlcmFsKG9wdGlvbnMuYm9vdFBhdGgoKSkpLFxuXHRcdExpdFN0ckV4cG9ydHMsXG5cdFx0YWxsSW1wb3J0UGF0aHMubWFwKF8gPT4gbmV3IExpdGVyYWwoXykpKSlcblxuXHRjb25zdCBpbXBvcnRUb0lkZW50aWZpZXIgPSBuZXcgTWFwKClcblx0Y29uc3QgaW1wb3J0SWRlbnRpZmllcnMgPSBbXVxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGFsbEltcG9ydHMubGVuZ3RoOyBpID0gaSArIDEpIHtcblx0XHRjb25zdCBfID0gYWxsSW1wb3J0c1tpXVxuXHRcdGNvbnN0IGlkID0gaWRlbnRpZmllcihgJHtwYXRoQmFzZU5hbWUoXy5wYXRoKX1fJHtpfWApXG5cdFx0aW1wb3J0SWRlbnRpZmllcnMucHVzaChpZClcblx0XHRpbXBvcnRUb0lkZW50aWZpZXIuc2V0KF8sIGlkKVxuXHR9XG5cblx0Y29uc3QgaW1wb3J0QXJncyA9IGNhdChvcElmKHNob3VsZEltcG9ydEJvb3QsICgpID0+IElkQm9vdCksIElkRXhwb3J0cywgaW1wb3J0SWRlbnRpZmllcnMpXG5cblx0Y29uc3QgZG9Cb290ID0gb3BJZihzaG91bGRJbXBvcnRCb290LCAoKSA9PiBuZXcgRXhwcmVzc2lvblN0YXRlbWVudChtc0dldE1vZHVsZShJZEJvb3QpKSlcblxuXHRjb25zdCBpbXBvcnREb3MgPSBkb0ltcG9ydHMubWFwKF8gPT5cblx0XHRsb2MobmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQobXNHZXRNb2R1bGUoaW1wb3J0VG9JZGVudGlmaWVyLmdldChfKSkpLCBfLmxvYykpXG5cblx0Ly8gRXh0cmFjdHMgaW1wb3J0ZWQgdmFsdWVzIGZyb20gdGhlIG1vZHVsZXMuXG5cdGNvbnN0IG9wRGVjbGFyZUltcG9ydGVkTG9jYWxzID0gb3BJZighaXNFbXB0eShpbXBvcnRzKSxcblx0XHQoKSA9PiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLFxuXHRcdFx0ZmxhdE1hcChpbXBvcnRzLCBfID0+IGltcG9ydERlY2xhcmF0b3JzKF8sIGltcG9ydFRvSWRlbnRpZmllci5nZXQoXykpKSkpXG5cblx0Y29uc3QgZnVsbEJvZHkgPSBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KFxuXHRcdGRvQm9vdCwgaW1wb3J0RG9zLCBvcERlY2xhcmVJbXBvcnRlZExvY2FscywgYm9keSwgUmV0dXJuRXhwb3J0cykpXG5cblx0Y29uc3QgbGF6eUJvZHkgPVxuXHRcdG9wdGlvbnMubGF6eU1vZHVsZSgpID9cblx0XHRcdG5ldyBCbG9ja1N0YXRlbWVudChbbmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQoXG5cdFx0XHRcdG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIEV4cG9ydHNHZXQsXG5cdFx0XHRcdFx0bXNMYXp5KGZ1bmN0aW9uRXhwcmVzc2lvblRodW5rKGZ1bGxCb2R5KSkpKV0pIDpcblx0XHRcdGZ1bGxCb2R5XG5cblx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbihJZERlZmluZSxcblx0XHRbYXJySW1wb3J0UGF0aHMsIG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihpbXBvcnRBcmdzLCBsYXp5Qm9keSldKVxufVxuXG5mdW5jdGlvbiBwYXRoQmFzZU5hbWUocGF0aCkge1xuXHRyZXR1cm4gcGF0aC5zdWJzdHIocGF0aC5sYXN0SW5kZXhPZignLycpICsgMSlcbn1cblxuZnVuY3Rpb24gaW1wb3J0RGVjbGFyYXRvcnMoe2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9LCBtb2R1bGVJZGVudGlmaWVyKSB7XG5cdC8vIFRPRE86IENvdWxkIGJlIG5lYXRlciBhYm91dCB0aGlzXG5cdGNvbnN0IGlzTGF6eSA9IChpc0VtcHR5KGltcG9ydGVkKSA/IG9wSW1wb3J0RGVmYXVsdCA6IGltcG9ydGVkWzBdKS5pc0xhenkoKVxuXHRjb25zdCB2YWx1ZSA9IChpc0xhenkgPyBtc0xhenlHZXRNb2R1bGUgOiBtc0dldE1vZHVsZSkobW9kdWxlSWRlbnRpZmllcilcblxuXHRjb25zdCBpbXBvcnRlZERlZmF1bHQgPSBvcE1hcChvcEltcG9ydERlZmF1bHQsIGRlZiA9PiB7XG5cdFx0Y29uc3QgZGVmZXhwID0gbXNHZXREZWZhdWx0RXhwb3J0KG1vZHVsZUlkZW50aWZpZXIpXG5cdFx0Y29uc3QgdmFsID0gaXNMYXp5ID8gbGF6eVdyYXAoZGVmZXhwKSA6IGRlZmV4cFxuXHRcdHJldHVybiBsb2MobmV3IFZhcmlhYmxlRGVjbGFyYXRvcihpZEZvckRlY2xhcmVDYWNoZWQoZGVmKSwgdmFsKSwgZGVmLmxvYylcblx0fSlcblxuXHRjb25zdCBpbXBvcnRlZERlc3RydWN0ID0gaXNFbXB0eShpbXBvcnRlZCkgPyBudWxsIDpcblx0XHRtYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycyhpbXBvcnRlZCwgaXNMYXp5LCB2YWx1ZSwgdHJ1ZSwgZmFsc2UpXG5cblx0cmV0dXJuIGNhdChpbXBvcnRlZERlZmF1bHQsIGltcG9ydGVkRGVzdHJ1Y3QpXG59XG5cbmNvbnN0IElkQm9vdCA9IG5ldyBJZGVudGlmaWVyKCdfYm9vdCcpXG5jb25zdCBJZERlZmluZSA9IG5ldyBJZGVudGlmaWVyKCdkZWZpbmUnKVxuY29uc3QgRXhwb3J0c0dldCA9IG1lbWJlcihJZEV4cG9ydHMsICdfZ2V0JylcbmNvbnN0IExpdFN0ckV4cG9ydHMgPSBuZXcgTGl0ZXJhbCgnZXhwb3J0cycpXG5jb25zdCBSZXR1cm5FeHBvcnRzID0gbmV3IFJldHVyblN0YXRlbWVudChJZEV4cG9ydHMpXG5jb25zdCBVc2VTdHJpY3QgPSBuZXcgRXhwcmVzc2lvblN0YXRlbWVudChuZXcgTGl0ZXJhbCgndXNlIHN0cmljdCcpKVxuXG4vLyBpZiAodHlwZW9mIGRlZmluZSAhPT0gJ2Z1bmN0aW9uJykgdmFyIGRlZmluZSA9IHJlcXVpcmUoJ2FtZGVmaW5lJykobW9kdWxlKVxuY29uc3QgQW1kZWZpbmVIZWFkZXIgPSBuZXcgSWZTdGF0ZW1lbnQoXG5cdG5ldyBCaW5hcnlFeHByZXNzaW9uKCchPT0nLFxuXHRcdG5ldyBVbmFyeUV4cHJlc3Npb24oJ3R5cGVvZicsIElkRGVmaW5lKSxcblx0XHRuZXcgTGl0ZXJhbCgnZnVuY3Rpb24nKSksXG5cdG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCd2YXInLCBbXG5cdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZERlZmluZSwgbmV3IENhbGxFeHByZXNzaW9uKFxuXHRcdFx0bmV3IENhbGxFeHByZXNzaW9uKG5ldyBJZGVudGlmaWVyKCdyZXF1aXJlJyksIFtuZXcgTGl0ZXJhbCgnYW1kZWZpbmUnKV0pLFxuXHRcdFx0W25ldyBJZGVudGlmaWVyKCdtb2R1bGUnKV0pKV0pKVxuIl19
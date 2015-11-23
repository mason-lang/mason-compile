'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/util', '../context', '../manglePath', '../MsAst', '../util', '../VerifyResults', './ast-constants', './context', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('esast/dist/util'), require('../context'), require('../manglePath'), require('../MsAst'), require('../util'), require('../VerifyResults'), require('./ast-constants'), require('./context'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.context, global.manglePath, global.MsAst, global.util, global.VerifyResults, global.astConstants, global.context, global.util);
		global.transpileModule = mod.exports;
	}
})(this, function (exports, _ast, _util, _context, _manglePath, _MsAst, _util2, _VerifyResults, _astConstants, _context2, _util3) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = transpileModule;
	exports.exportNamedOrDefault = exportNamedOrDefault;

	var _manglePath2 = _interopRequireDefault(_manglePath);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	var _slicedToArray = (function () {
		function sliceIterator(arr, i) {
			var _arr = [];
			var _n = true;
			var _d = false;
			var _e = undefined;

			try {
				for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
					_arr.push(_s.value);

					if (i && _arr.length === i) break;
				}
			} catch (err) {
				_d = true;
				_e = err;
			} finally {
				try {
					if (!_n && _i["return"]) _i["return"]();
				} finally {
					if (_d) throw _e;
				}
			}

			return _arr;
		}

		return function (arr, i) {
			if (Array.isArray(arr)) {
				return arr;
			} else if (Symbol.iterator in Object(arr)) {
				return sliceIterator(arr, i);
			} else {
				throw new TypeError("Invalid attempt to destructure non-iterable instance");
			}
		};
	})();

	function transpileModule() {
		const body = moduleBody(_context2.verifyResults.moduleKind, this.lines);
		const imports = this.imports.filter(_ => _.path !== 'global');

		for (const _ref of _context2.verifyResults.builtinPathToNames) {
			var _ref2 = _slicedToArray(_ref, 2);

			const path = _ref2[0];
			const imported = _ref2[1];

			if (path !== 'global') {
				const importedDeclares = [];
				let opImportDefault = null;
				const defaultName = (0, _util2.last)(path.split('/'));

				for (const name of imported) {
					const declare = _MsAst.LocalDeclare.plain(this.loc, name);

					if (name === defaultName) opImportDefault = declare;else importedDeclares.push(declare);
				}

				imports.push(new _MsAst.Import(this.loc, path, importedDeclares, opImportDefault));
			}
		}

		const amd = amdWrapModule(this.doImports, imports, body);
		return new _ast.Program((0, _util2.cat)((0, _util2.opIf)(_context.options.includeUseStrict(), () => UseStrict), (0, _util2.opIf)(_context.options.includeAmdefine(), () => AmdefineHeader), (0, _util.toStatement)(amd)));
	}

	function moduleBody(kind, lines) {
		switch (kind) {
			case _VerifyResults.Modules.Do:
			case _VerifyResults.Modules.Exports:
				return (0, _util3.tLines)(lines);

			case _VerifyResults.Modules.Val:
				{
					const a = (0, _util3.tLines)((0, _util2.rtail)(lines));
					const b = (0, _util3.t0)((0, _util2.last)(lines));
					return (0, _util2.cat)(a, exportDefault(b));
				}

			case _VerifyResults.Modules.Bag:
			case _VerifyResults.Modules.Map:
				{
					const declare = kind === _VerifyResults.Modules.Bag ? _astConstants.DeclareBuiltBag : _astConstants.DeclareBuiltMap;
					return (0, _util2.cat)(declare, (0, _util3.tLines)(lines), exportDefault(_astConstants.IdBuilt));
				}

			default:
				throw new Error(_context2.verifyResults.moduleKind);
		}
	}

	function exportNamedOrDefault(val, name) {
		if (name === _context.pathOptions.moduleName()) return exportDefault(val);else return exportNamed(val, name);
	}

	function exportNamed(val, name) {
		return new _ast.AssignmentExpression('=', (0, _util.member)(_astConstants.IdExports, name), val);
	}

	function exportDefault(val) {
		return new _ast.AssignmentExpression('=', _astConstants.ExportsDefault, val);
	}

	function amdWrapModule(doImports, imports, body) {
		const shouldImportBoot = _context.options.importBoot();

		const allImports = doImports.concat(imports);
		const allImportPaths = allImports.map(_ => (0, _manglePath2.default)(_.path));
		const arrImportPaths = new _ast.ArrayExpression((0, _util2.cat)(LitStrExports, (0, _util2.opIf)(shouldImportBoot, () => new _ast.Literal(_context.options.bootPath())), allImportPaths.map(_ => new _ast.Literal(_))));
		const importToIdentifier = new Map();
		const importIdentifiers = [];

		for (let i = 0; i < allImports.length; i = i + 1) {
			const _ = allImports[i];
			const id = (0, _util.identifier)(`${ pathBaseName(_.path) }_${ i }`);
			importIdentifiers.push(id);
			importToIdentifier.set(_, id);
		}

		const importArgs = (0, _util2.cat)(_astConstants.IdExports, (0, _util2.opIf)(shouldImportBoot, () => IdBoot), importIdentifiers);
		const doBoot = (0, _util2.opIf)(shouldImportBoot, () => new _ast.ExpressionStatement((0, _util3.msCall)('getModule', IdBoot)));
		const importDos = doImports.map(_ => (0, _util.loc)(new _ast.ExpressionStatement((0, _util3.msCall)('getModule', importToIdentifier.get(_))), _.loc));
		const opDeclareImportedLocals = (0, _util2.opIf)(!(0, _util2.isEmpty)(imports), () => new _ast.VariableDeclaration('let', (0, _util2.flatMap)(imports, _ => importDeclarators(_, importToIdentifier.get(_)))));
		const fullBody = new _ast.BlockStatement((0, _util2.cat)(doBoot, importDos, opDeclareImportedLocals, body, ReturnExports));
		const lazyBody = _context.options.lazyModule() ? new _ast.BlockStatement([new _ast.ExpressionStatement(new _ast.AssignmentExpression('=', ExportsGet, (0, _util3.msCall)('lazy', new _ast.ArrowFunctionExpression([], fullBody))))]) : fullBody;
		return new _ast.CallExpression(IdDefine, [arrImportPaths, new _ast.ArrowFunctionExpression(importArgs, lazyBody)]);
	}

	function pathBaseName(path) {
		return path.substr(path.lastIndexOf('/') + 1);
	}

	function importDeclarators(_ref3, moduleIdentifier) {
		let imported = _ref3.imported;
		let opImportDefault = _ref3.opImportDefault;
		const isLazy = ((0, _util2.isEmpty)(imported) ? opImportDefault : imported[0]).isLazy();
		const value = (0, _util3.msCall)(isLazy ? 'lazyGetModule' : 'getModule', moduleIdentifier);
		const importedDefault = (0, _util2.opMap)(opImportDefault, def => {
			const defexp = (0, _util3.msCall)('getDefaultExport', moduleIdentifier);
			const val = isLazy ? (0, _util3.lazyWrap)(defexp) : defexp;
			return (0, _util.loc)(new _ast.VariableDeclarator((0, _util3.idForDeclareCached)(def), val), def.loc);
		});
		const importedDestruct = (0, _util2.isEmpty)(imported) ? null : (0, _util3.makeDestructureDeclarators)(imported, isLazy, value, true, false);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGVNb2R1bGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQWN3QixlQUFlO1NBOEN2QixvQkFBb0IsR0FBcEIsb0JBQW9COzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUE5Q1osZUFBZTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBOEN2QixvQkFBb0IiLCJmaWxlIjoidHJhbnNwaWxlTW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcnJheUV4cHJlc3Npb24sIEFycm93RnVuY3Rpb25FeHByZXNzaW9uLCBBc3NpZ25tZW50RXhwcmVzc2lvbiwgQmluYXJ5RXhwcmVzc2lvbixcblx0QmxvY2tTdGF0ZW1lbnQsIENhbGxFeHByZXNzaW9uLCBFeHByZXNzaW9uU3RhdGVtZW50LCBJZGVudGlmaWVyLCBJZlN0YXRlbWVudCwgTGl0ZXJhbCwgUHJvZ3JhbSxcblx0VmFyaWFibGVEZWNsYXJhdGlvbiwgVmFyaWFibGVEZWNsYXJhdG9yLCBSZXR1cm5TdGF0ZW1lbnQsIFVuYXJ5RXhwcmVzc2lvblxuXHR9IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IHtpZGVudGlmaWVyLCBsb2MsIG1lbWJlciwgdG9TdGF0ZW1lbnR9IGZyb20gJ2VzYXN0L2Rpc3QvdXRpbCdcbmltcG9ydCB7b3B0aW9ucywgcGF0aE9wdGlvbnN9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQgbWFuZ2xlUGF0aCBmcm9tICcuLi9tYW5nbGVQYXRoJ1xuaW1wb3J0IHtJbXBvcnQsIExvY2FsRGVjbGFyZX0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2NhdCwgZmxhdE1hcCwgaXNFbXB0eSwgbGFzdCwgb3BJZiwgb3BNYXAsIHJ0YWlsfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtNb2R1bGVzfSBmcm9tICcuLi9WZXJpZnlSZXN1bHRzJ1xuaW1wb3J0IHtEZWNsYXJlQnVpbHRCYWcsIERlY2xhcmVCdWlsdE1hcCwgRXhwb3J0c0RlZmF1bHQsIElkQnVpbHQsIElkRXhwb3J0c30gZnJvbSAnLi9hc3QtY29uc3RhbnRzJ1xuaW1wb3J0IHt2ZXJpZnlSZXN1bHRzfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge2lkRm9yRGVjbGFyZUNhY2hlZCwgbGF6eVdyYXAsIG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzLCBtc0NhbGwsIHQwLCB0TGluZXN9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhbnNwaWxlTW9kdWxlKCkge1xuXHRjb25zdCBib2R5ID0gbW9kdWxlQm9keSh2ZXJpZnlSZXN1bHRzLm1vZHVsZUtpbmQsIHRoaXMubGluZXMpXG5cblx0Y29uc3QgaW1wb3J0cyA9IHRoaXMuaW1wb3J0cy5maWx0ZXIoXyA9PiBfLnBhdGggIT09ICdnbG9iYWwnKVxuXG5cdGZvciAoY29uc3QgW3BhdGgsIGltcG9ydGVkXSBvZiB2ZXJpZnlSZXN1bHRzLmJ1aWx0aW5QYXRoVG9OYW1lcylcblx0XHRpZiAocGF0aCAhPT0gJ2dsb2JhbCcpIHtcblx0XHRcdGNvbnN0IGltcG9ydGVkRGVjbGFyZXMgPSBbXVxuXHRcdFx0bGV0IG9wSW1wb3J0RGVmYXVsdCA9IG51bGxcblx0XHRcdGNvbnN0IGRlZmF1bHROYW1lID0gbGFzdChwYXRoLnNwbGl0KCcvJykpXG5cdFx0XHRmb3IgKGNvbnN0IG5hbWUgb2YgaW1wb3J0ZWQpIHtcblx0XHRcdFx0Y29uc3QgZGVjbGFyZSA9IExvY2FsRGVjbGFyZS5wbGFpbih0aGlzLmxvYywgbmFtZSlcblx0XHRcdFx0aWYgKG5hbWUgPT09IGRlZmF1bHROYW1lKVxuXHRcdFx0XHRcdG9wSW1wb3J0RGVmYXVsdCA9IGRlY2xhcmVcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGltcG9ydGVkRGVjbGFyZXMucHVzaChkZWNsYXJlKVxuXHRcdFx0fVxuXHRcdFx0aW1wb3J0cy5wdXNoKG5ldyBJbXBvcnQodGhpcy5sb2MsIHBhdGgsIGltcG9ydGVkRGVjbGFyZXMsIG9wSW1wb3J0RGVmYXVsdCkpXG5cdFx0fVxuXG5cdGNvbnN0IGFtZCA9IGFtZFdyYXBNb2R1bGUodGhpcy5kb0ltcG9ydHMsIGltcG9ydHMsIGJvZHkpXG5cblx0cmV0dXJuIG5ldyBQcm9ncmFtKGNhdChcblx0XHRvcElmKG9wdGlvbnMuaW5jbHVkZVVzZVN0cmljdCgpLCAoKSA9PiBVc2VTdHJpY3QpLFxuXHRcdG9wSWYob3B0aW9ucy5pbmNsdWRlQW1kZWZpbmUoKSwgKCkgPT4gQW1kZWZpbmVIZWFkZXIpLFxuXHRcdHRvU3RhdGVtZW50KGFtZCkpKVxufVxuXG5mdW5jdGlvbiBtb2R1bGVCb2R5KGtpbmQsIGxpbmVzKSB7XG5cdHN3aXRjaCAoa2luZCkge1xuXHRcdGNhc2UgTW9kdWxlcy5EbzogY2FzZSBNb2R1bGVzLkV4cG9ydHM6XG5cdFx0XHRyZXR1cm4gdExpbmVzKGxpbmVzKVxuXHRcdGNhc2UgTW9kdWxlcy5WYWw6IHtcblx0XHRcdGNvbnN0IGEgPSB0TGluZXMocnRhaWwobGluZXMpKVxuXHRcdFx0Y29uc3QgYiA9IHQwKGxhc3QobGluZXMpKVxuXHRcdFx0cmV0dXJuIGNhdChhLCBleHBvcnREZWZhdWx0KGIpKVxuXHRcdH1cblx0XHRjYXNlIE1vZHVsZXMuQmFnOiBjYXNlIE1vZHVsZXMuTWFwOiB7XG5cdFx0XHRjb25zdCBkZWNsYXJlID0ga2luZCA9PT0gTW9kdWxlcy5CYWcgPyBEZWNsYXJlQnVpbHRCYWcgOiBEZWNsYXJlQnVpbHRNYXBcblx0XHRcdHJldHVybiBjYXQoZGVjbGFyZSwgdExpbmVzKGxpbmVzKSwgZXhwb3J0RGVmYXVsdChJZEJ1aWx0KSlcblx0XHR9XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHRocm93IG5ldyBFcnJvcih2ZXJpZnlSZXN1bHRzLm1vZHVsZUtpbmQpXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4cG9ydE5hbWVkT3JEZWZhdWx0KHZhbCwgbmFtZSkge1xuXHRpZiAobmFtZSA9PT0gcGF0aE9wdGlvbnMubW9kdWxlTmFtZSgpKVxuXHRcdHJldHVybiBleHBvcnREZWZhdWx0KHZhbClcblx0ZWxzZVxuXHRcdHJldHVybiBleHBvcnROYW1lZCh2YWwsIG5hbWUpXG59XG5cbmZ1bmN0aW9uIGV4cG9ydE5hbWVkKHZhbCwgbmFtZSkge1xuXHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyKElkRXhwb3J0cywgbmFtZSksIHZhbClcbn1cbmZ1bmN0aW9uIGV4cG9ydERlZmF1bHQodmFsKSB7XG5cdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBFeHBvcnRzRGVmYXVsdCwgdmFsKVxufVxuXG5cbmZ1bmN0aW9uIGFtZFdyYXBNb2R1bGUoZG9JbXBvcnRzLCBpbXBvcnRzLCBib2R5KSB7XG5cdGNvbnN0IHNob3VsZEltcG9ydEJvb3QgPSBvcHRpb25zLmltcG9ydEJvb3QoKVxuXG5cdGNvbnN0IGFsbEltcG9ydHMgPSBkb0ltcG9ydHMuY29uY2F0KGltcG9ydHMpXG5cdGNvbnN0IGFsbEltcG9ydFBhdGhzID0gYWxsSW1wb3J0cy5tYXAoXyA9PiBtYW5nbGVQYXRoKF8ucGF0aCkpXG5cblx0Y29uc3QgYXJySW1wb3J0UGF0aHMgPSBuZXcgQXJyYXlFeHByZXNzaW9uKGNhdChcblx0XHRMaXRTdHJFeHBvcnRzLFxuXHRcdG9wSWYoc2hvdWxkSW1wb3J0Qm9vdCwgKCkgPT4gbmV3IExpdGVyYWwob3B0aW9ucy5ib290UGF0aCgpKSksXG5cdFx0YWxsSW1wb3J0UGF0aHMubWFwKF8gPT4gbmV3IExpdGVyYWwoXykpKSlcblxuXHRjb25zdCBpbXBvcnRUb0lkZW50aWZpZXIgPSBuZXcgTWFwKClcblx0Y29uc3QgaW1wb3J0SWRlbnRpZmllcnMgPSBbXVxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGFsbEltcG9ydHMubGVuZ3RoOyBpID0gaSArIDEpIHtcblx0XHRjb25zdCBfID0gYWxsSW1wb3J0c1tpXVxuXHRcdGNvbnN0IGlkID0gaWRlbnRpZmllcihgJHtwYXRoQmFzZU5hbWUoXy5wYXRoKX1fJHtpfWApXG5cdFx0aW1wb3J0SWRlbnRpZmllcnMucHVzaChpZClcblx0XHRpbXBvcnRUb0lkZW50aWZpZXIuc2V0KF8sIGlkKVxuXHR9XG5cblx0Y29uc3QgaW1wb3J0QXJncyA9IGNhdChJZEV4cG9ydHMsIG9wSWYoc2hvdWxkSW1wb3J0Qm9vdCwgKCkgPT4gSWRCb290KSwgaW1wb3J0SWRlbnRpZmllcnMpXG5cblx0Y29uc3QgZG9Cb290ID0gb3BJZihzaG91bGRJbXBvcnRCb290LCAoKSA9PlxuXHRcdG5ldyBFeHByZXNzaW9uU3RhdGVtZW50KG1zQ2FsbCgnZ2V0TW9kdWxlJywgSWRCb290KSkpXG5cblx0Y29uc3QgaW1wb3J0RG9zID0gZG9JbXBvcnRzLm1hcChfID0+XG5cdFx0bG9jKG5ldyBFeHByZXNzaW9uU3RhdGVtZW50KG1zQ2FsbCgnZ2V0TW9kdWxlJywgaW1wb3J0VG9JZGVudGlmaWVyLmdldChfKSkpLCBfLmxvYykpXG5cblx0Ly8gRXh0cmFjdHMgaW1wb3J0ZWQgdmFsdWVzIGZyb20gdGhlIG1vZHVsZXMuXG5cdGNvbnN0IG9wRGVjbGFyZUltcG9ydGVkTG9jYWxzID0gb3BJZighaXNFbXB0eShpbXBvcnRzKSxcblx0XHQoKSA9PiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignbGV0Jyxcblx0XHRcdGZsYXRNYXAoaW1wb3J0cywgXyA9PiBpbXBvcnREZWNsYXJhdG9ycyhfLCBpbXBvcnRUb0lkZW50aWZpZXIuZ2V0KF8pKSkpKVxuXG5cdGNvbnN0IGZ1bGxCb2R5ID0gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChcblx0XHRkb0Jvb3QsIGltcG9ydERvcywgb3BEZWNsYXJlSW1wb3J0ZWRMb2NhbHMsIGJvZHksIFJldHVybkV4cG9ydHMpKVxuXG5cdGNvbnN0IGxhenlCb2R5ID1cblx0XHRvcHRpb25zLmxhenlNb2R1bGUoKSA/XG5cdFx0XHRuZXcgQmxvY2tTdGF0ZW1lbnQoW25ldyBFeHByZXNzaW9uU3RhdGVtZW50KFxuXHRcdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBFeHBvcnRzR2V0LFxuXHRcdFx0XHRcdG1zQ2FsbCgnbGF6eScsIG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihbXSwgZnVsbEJvZHkpKSkpXSkgOlxuXHRcdFx0ZnVsbEJvZHlcblxuXHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKElkRGVmaW5lLFxuXHRcdFthcnJJbXBvcnRQYXRocywgbmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKGltcG9ydEFyZ3MsIGxhenlCb2R5KV0pXG59XG5cbmZ1bmN0aW9uIHBhdGhCYXNlTmFtZShwYXRoKSB7XG5cdHJldHVybiBwYXRoLnN1YnN0cihwYXRoLmxhc3RJbmRleE9mKCcvJykgKyAxKVxufVxuXG5mdW5jdGlvbiBpbXBvcnREZWNsYXJhdG9ycyh7aW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdH0sIG1vZHVsZUlkZW50aWZpZXIpIHtcblx0Ly8gVE9ETzogQ291bGQgYmUgbmVhdGVyIGFib3V0IHRoaXNcblx0Y29uc3QgaXNMYXp5ID0gKGlzRW1wdHkoaW1wb3J0ZWQpID8gb3BJbXBvcnREZWZhdWx0IDogaW1wb3J0ZWRbMF0pLmlzTGF6eSgpXG5cdGNvbnN0IHZhbHVlID0gbXNDYWxsKGlzTGF6eSA/ICdsYXp5R2V0TW9kdWxlJyA6ICdnZXRNb2R1bGUnLCBtb2R1bGVJZGVudGlmaWVyKVxuXG5cdGNvbnN0IGltcG9ydGVkRGVmYXVsdCA9IG9wTWFwKG9wSW1wb3J0RGVmYXVsdCwgZGVmID0+IHtcblx0XHRjb25zdCBkZWZleHAgPSBtc0NhbGwoJ2dldERlZmF1bHRFeHBvcnQnLCBtb2R1bGVJZGVudGlmaWVyKVxuXHRcdGNvbnN0IHZhbCA9IGlzTGF6eSA/IGxhenlXcmFwKGRlZmV4cCkgOiBkZWZleHBcblx0XHRyZXR1cm4gbG9jKG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoaWRGb3JEZWNsYXJlQ2FjaGVkKGRlZiksIHZhbCksIGRlZi5sb2MpXG5cdH0pXG5cblx0Y29uc3QgaW1wb3J0ZWREZXN0cnVjdCA9IGlzRW1wdHkoaW1wb3J0ZWQpID8gbnVsbCA6XG5cdFx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMoaW1wb3J0ZWQsIGlzTGF6eSwgdmFsdWUsIHRydWUsIGZhbHNlKVxuXG5cdHJldHVybiBjYXQoaW1wb3J0ZWREZWZhdWx0LCBpbXBvcnRlZERlc3RydWN0KVxufVxuXG5jb25zdCBJZEJvb3QgPSBuZXcgSWRlbnRpZmllcignX2Jvb3QnKVxuY29uc3QgSWREZWZpbmUgPSBuZXcgSWRlbnRpZmllcignZGVmaW5lJylcbmNvbnN0IEV4cG9ydHNHZXQgPSBtZW1iZXIoSWRFeHBvcnRzLCAnX2dldCcpXG5jb25zdCBMaXRTdHJFeHBvcnRzID0gbmV3IExpdGVyYWwoJ2V4cG9ydHMnKVxuY29uc3QgUmV0dXJuRXhwb3J0cyA9IG5ldyBSZXR1cm5TdGF0ZW1lbnQoSWRFeHBvcnRzKVxuY29uc3QgVXNlU3RyaWN0ID0gbmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQobmV3IExpdGVyYWwoJ3VzZSBzdHJpY3QnKSlcblxuLy8gaWYgKHR5cGVvZiBkZWZpbmUgIT09ICdmdW5jdGlvbicpIHZhciBkZWZpbmUgPSByZXF1aXJlKCdhbWRlZmluZScpKG1vZHVsZSlcbmNvbnN0IEFtZGVmaW5lSGVhZGVyID0gbmV3IElmU3RhdGVtZW50KFxuXHRuZXcgQmluYXJ5RXhwcmVzc2lvbignIT09Jyxcblx0XHRuZXcgVW5hcnlFeHByZXNzaW9uKCd0eXBlb2YnLCBJZERlZmluZSksXG5cdFx0bmV3IExpdGVyYWwoJ2Z1bmN0aW9uJykpLFxuXHRuZXcgVmFyaWFibGVEZWNsYXJhdGlvbigndmFyJywgW1xuXHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWREZWZpbmUsIG5ldyBDYWxsRXhwcmVzc2lvbihcblx0XHRcdG5ldyBDYWxsRXhwcmVzc2lvbihuZXcgSWRlbnRpZmllcigncmVxdWlyZScpLCBbbmV3IExpdGVyYWwoJ2FtZGVmaW5lJyldKSxcblx0XHRcdFtuZXcgSWRlbnRpZmllcignbW9kdWxlJyldKSldKSlcbiJdfQ==
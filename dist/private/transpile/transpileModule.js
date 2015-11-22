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
				let defaultName = (0, _util2.last)(path.split('/'));

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
		if (name === _context.options.moduleName()) return exportDefault(val);else return exportNamed(val, name);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGVNb2R1bGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQWN3QixlQUFlO1NBOEN2QixvQkFBb0IsR0FBcEIsb0JBQW9COzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUE5Q1osZUFBZTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBOEN2QixvQkFBb0IiLCJmaWxlIjoidHJhbnNwaWxlTW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcnJheUV4cHJlc3Npb24sIEFycm93RnVuY3Rpb25FeHByZXNzaW9uLCBBc3NpZ25tZW50RXhwcmVzc2lvbiwgQmluYXJ5RXhwcmVzc2lvbixcblx0QmxvY2tTdGF0ZW1lbnQsIENhbGxFeHByZXNzaW9uLCBFeHByZXNzaW9uU3RhdGVtZW50LCBJZGVudGlmaWVyLCBJZlN0YXRlbWVudCwgTGl0ZXJhbCwgUHJvZ3JhbSxcblx0VmFyaWFibGVEZWNsYXJhdGlvbiwgVmFyaWFibGVEZWNsYXJhdG9yLCBSZXR1cm5TdGF0ZW1lbnQsIFVuYXJ5RXhwcmVzc2lvblxuXHR9IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IHtpZGVudGlmaWVyLCBsb2MsIG1lbWJlciwgdG9TdGF0ZW1lbnR9IGZyb20gJ2VzYXN0L2Rpc3QvdXRpbCdcbmltcG9ydCB7b3B0aW9uc30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCBtYW5nbGVQYXRoIGZyb20gJy4uL21hbmdsZVBhdGgnXG5pbXBvcnQge0ltcG9ydCwgTG9jYWxEZWNsYXJlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7Y2F0LCBmbGF0TWFwLCBpc0VtcHR5LCBsYXN0LCBvcElmLCBvcE1hcCwgcnRhaWx9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge01vZHVsZXN9IGZyb20gJy4uL1ZlcmlmeVJlc3VsdHMnXG5pbXBvcnQge0RlY2xhcmVCdWlsdEJhZywgRGVjbGFyZUJ1aWx0TWFwLCBFeHBvcnRzRGVmYXVsdCwgSWRCdWlsdCwgSWRFeHBvcnRzfSBmcm9tICcuL2FzdC1jb25zdGFudHMnXG5pbXBvcnQge3ZlcmlmeVJlc3VsdHN9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB7aWRGb3JEZWNsYXJlQ2FjaGVkLCBsYXp5V3JhcCwgbWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMsIG1zQ2FsbCwgdDAsIHRMaW5lc30gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFuc3BpbGVNb2R1bGUoKSB7XG5cdGNvbnN0IGJvZHkgPSBtb2R1bGVCb2R5KHZlcmlmeVJlc3VsdHMubW9kdWxlS2luZCwgdGhpcy5saW5lcylcblxuXHRjb25zdCBpbXBvcnRzID0gdGhpcy5pbXBvcnRzLmZpbHRlcihfID0+IF8ucGF0aCAhPT0gJ2dsb2JhbCcpXG5cblx0Zm9yIChjb25zdCBbcGF0aCwgaW1wb3J0ZWRdIG9mIHZlcmlmeVJlc3VsdHMuYnVpbHRpblBhdGhUb05hbWVzKVxuXHRcdGlmIChwYXRoICE9PSAnZ2xvYmFsJykge1xuXHRcdFx0Y29uc3QgaW1wb3J0ZWREZWNsYXJlcyA9IFtdXG5cdFx0XHRsZXQgb3BJbXBvcnREZWZhdWx0ID0gbnVsbFxuXHRcdFx0bGV0IGRlZmF1bHROYW1lID0gbGFzdChwYXRoLnNwbGl0KCcvJykpXG5cdFx0XHRmb3IgKGNvbnN0IG5hbWUgb2YgaW1wb3J0ZWQpIHtcblx0XHRcdFx0Y29uc3QgZGVjbGFyZSA9IExvY2FsRGVjbGFyZS5wbGFpbih0aGlzLmxvYywgbmFtZSlcblx0XHRcdFx0aWYgKG5hbWUgPT09IGRlZmF1bHROYW1lKVxuXHRcdFx0XHRcdG9wSW1wb3J0RGVmYXVsdCA9IGRlY2xhcmVcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGltcG9ydGVkRGVjbGFyZXMucHVzaChkZWNsYXJlKVxuXHRcdFx0fVxuXHRcdFx0aW1wb3J0cy5wdXNoKG5ldyBJbXBvcnQodGhpcy5sb2MsIHBhdGgsIGltcG9ydGVkRGVjbGFyZXMsIG9wSW1wb3J0RGVmYXVsdCkpXG5cdFx0fVxuXG5cdGNvbnN0IGFtZCA9IGFtZFdyYXBNb2R1bGUodGhpcy5kb0ltcG9ydHMsIGltcG9ydHMsIGJvZHkpXG5cblx0cmV0dXJuIG5ldyBQcm9ncmFtKGNhdChcblx0XHRvcElmKG9wdGlvbnMuaW5jbHVkZVVzZVN0cmljdCgpLCAoKSA9PiBVc2VTdHJpY3QpLFxuXHRcdG9wSWYob3B0aW9ucy5pbmNsdWRlQW1kZWZpbmUoKSwgKCkgPT4gQW1kZWZpbmVIZWFkZXIpLFxuXHRcdHRvU3RhdGVtZW50KGFtZCkpKVxufVxuXG5mdW5jdGlvbiBtb2R1bGVCb2R5KGtpbmQsIGxpbmVzKSB7XG5cdHN3aXRjaCAoa2luZCkge1xuXHRcdGNhc2UgTW9kdWxlcy5EbzogY2FzZSBNb2R1bGVzLkV4cG9ydHM6XG5cdFx0XHRyZXR1cm4gdExpbmVzKGxpbmVzKVxuXHRcdGNhc2UgTW9kdWxlcy5WYWw6IHtcblx0XHRcdGNvbnN0IGEgPSB0TGluZXMocnRhaWwobGluZXMpKVxuXHRcdFx0Y29uc3QgYiA9IHQwKGxhc3QobGluZXMpKVxuXHRcdFx0cmV0dXJuIGNhdChhLCBleHBvcnREZWZhdWx0KGIpKVxuXHRcdH1cblx0XHRjYXNlIE1vZHVsZXMuQmFnOiBjYXNlIE1vZHVsZXMuTWFwOiB7XG5cdFx0XHRjb25zdCBkZWNsYXJlID0ga2luZCA9PT0gTW9kdWxlcy5CYWcgPyBEZWNsYXJlQnVpbHRCYWcgOiBEZWNsYXJlQnVpbHRNYXBcblx0XHRcdHJldHVybiBjYXQoZGVjbGFyZSwgdExpbmVzKGxpbmVzKSwgZXhwb3J0RGVmYXVsdChJZEJ1aWx0KSlcblx0XHR9XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHRocm93IG5ldyBFcnJvcih2ZXJpZnlSZXN1bHRzLm1vZHVsZUtpbmQpXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4cG9ydE5hbWVkT3JEZWZhdWx0KHZhbCwgbmFtZSkge1xuXHRpZiAobmFtZSA9PT0gb3B0aW9ucy5tb2R1bGVOYW1lKCkpXG5cdFx0cmV0dXJuIGV4cG9ydERlZmF1bHQodmFsKVxuXHRlbHNlXG5cdFx0cmV0dXJuIGV4cG9ydE5hbWVkKHZhbCwgbmFtZSlcbn1cblxuZnVuY3Rpb24gZXhwb3J0TmFtZWQodmFsLCBuYW1lKSB7XG5cdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRFeHBvcnRzLCBuYW1lKSwgdmFsKVxufVxuZnVuY3Rpb24gZXhwb3J0RGVmYXVsdCh2YWwpIHtcblx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIEV4cG9ydHNEZWZhdWx0LCB2YWwpXG59XG5cblxuZnVuY3Rpb24gYW1kV3JhcE1vZHVsZShkb0ltcG9ydHMsIGltcG9ydHMsIGJvZHkpIHtcblx0Y29uc3Qgc2hvdWxkSW1wb3J0Qm9vdCA9IG9wdGlvbnMuaW1wb3J0Qm9vdCgpXG5cblx0Y29uc3QgYWxsSW1wb3J0cyA9IGRvSW1wb3J0cy5jb25jYXQoaW1wb3J0cylcblx0Y29uc3QgYWxsSW1wb3J0UGF0aHMgPSBhbGxJbXBvcnRzLm1hcChfID0+IG1hbmdsZVBhdGgoXy5wYXRoKSlcblxuXHRjb25zdCBhcnJJbXBvcnRQYXRocyA9IG5ldyBBcnJheUV4cHJlc3Npb24oY2F0KFxuXHRcdExpdFN0ckV4cG9ydHMsXG5cdFx0b3BJZihzaG91bGRJbXBvcnRCb290LCAoKSA9PiBuZXcgTGl0ZXJhbChvcHRpb25zLmJvb3RQYXRoKCkpKSxcblx0XHRhbGxJbXBvcnRQYXRocy5tYXAoXyA9PiBuZXcgTGl0ZXJhbChfKSkpKVxuXG5cdGNvbnN0IGltcG9ydFRvSWRlbnRpZmllciA9IG5ldyBNYXAoKVxuXHRjb25zdCBpbXBvcnRJZGVudGlmaWVycyA9IFtdXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgYWxsSW1wb3J0cy5sZW5ndGg7IGkgPSBpICsgMSkge1xuXHRcdGNvbnN0IF8gPSBhbGxJbXBvcnRzW2ldXG5cdFx0Y29uc3QgaWQgPSBpZGVudGlmaWVyKGAke3BhdGhCYXNlTmFtZShfLnBhdGgpfV8ke2l9YClcblx0XHRpbXBvcnRJZGVudGlmaWVycy5wdXNoKGlkKVxuXHRcdGltcG9ydFRvSWRlbnRpZmllci5zZXQoXywgaWQpXG5cdH1cblxuXHRjb25zdCBpbXBvcnRBcmdzID0gY2F0KElkRXhwb3J0cywgb3BJZihzaG91bGRJbXBvcnRCb290LCAoKSA9PiBJZEJvb3QpLCBpbXBvcnRJZGVudGlmaWVycylcblxuXHRjb25zdCBkb0Jvb3QgPSBvcElmKHNob3VsZEltcG9ydEJvb3QsICgpID0+XG5cdFx0bmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQobXNDYWxsKCdnZXRNb2R1bGUnLCBJZEJvb3QpKSlcblxuXHRjb25zdCBpbXBvcnREb3MgPSBkb0ltcG9ydHMubWFwKF8gPT5cblx0XHRsb2MobmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQobXNDYWxsKCdnZXRNb2R1bGUnLCBpbXBvcnRUb0lkZW50aWZpZXIuZ2V0KF8pKSksIF8ubG9jKSlcblxuXHQvLyBFeHRyYWN0cyBpbXBvcnRlZCB2YWx1ZXMgZnJvbSB0aGUgbW9kdWxlcy5cblx0Y29uc3Qgb3BEZWNsYXJlSW1wb3J0ZWRMb2NhbHMgPSBvcElmKCFpc0VtcHR5KGltcG9ydHMpLFxuXHRcdCgpID0+IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdsZXQnLFxuXHRcdFx0ZmxhdE1hcChpbXBvcnRzLCBfID0+IGltcG9ydERlY2xhcmF0b3JzKF8sIGltcG9ydFRvSWRlbnRpZmllci5nZXQoXykpKSkpXG5cblx0Y29uc3QgZnVsbEJvZHkgPSBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KFxuXHRcdGRvQm9vdCwgaW1wb3J0RG9zLCBvcERlY2xhcmVJbXBvcnRlZExvY2FscywgYm9keSwgUmV0dXJuRXhwb3J0cykpXG5cblx0Y29uc3QgbGF6eUJvZHkgPVxuXHRcdG9wdGlvbnMubGF6eU1vZHVsZSgpID9cblx0XHRcdG5ldyBCbG9ja1N0YXRlbWVudChbbmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQoXG5cdFx0XHRcdG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIEV4cG9ydHNHZXQsXG5cdFx0XHRcdFx0bXNDYWxsKCdsYXp5JywgbmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKFtdLCBmdWxsQm9keSkpKSldKSA6XG5cdFx0XHRmdWxsQm9keVxuXG5cdHJldHVybiBuZXcgQ2FsbEV4cHJlc3Npb24oSWREZWZpbmUsXG5cdFx0W2FyckltcG9ydFBhdGhzLCBuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oaW1wb3J0QXJncywgbGF6eUJvZHkpXSlcbn1cblxuZnVuY3Rpb24gcGF0aEJhc2VOYW1lKHBhdGgpIHtcblx0cmV0dXJuIHBhdGguc3Vic3RyKHBhdGgubGFzdEluZGV4T2YoJy8nKSArIDEpXG59XG5cbmZ1bmN0aW9uIGltcG9ydERlY2xhcmF0b3JzKHtpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0fSwgbW9kdWxlSWRlbnRpZmllcikge1xuXHQvLyBUT0RPOiBDb3VsZCBiZSBuZWF0ZXIgYWJvdXQgdGhpc1xuXHRjb25zdCBpc0xhenkgPSAoaXNFbXB0eShpbXBvcnRlZCkgPyBvcEltcG9ydERlZmF1bHQgOiBpbXBvcnRlZFswXSkuaXNMYXp5KClcblx0Y29uc3QgdmFsdWUgPSBtc0NhbGwoaXNMYXp5ID8gJ2xhenlHZXRNb2R1bGUnIDogJ2dldE1vZHVsZScsIG1vZHVsZUlkZW50aWZpZXIpXG5cblx0Y29uc3QgaW1wb3J0ZWREZWZhdWx0ID0gb3BNYXAob3BJbXBvcnREZWZhdWx0LCBkZWYgPT4ge1xuXHRcdGNvbnN0IGRlZmV4cCA9IG1zQ2FsbCgnZ2V0RGVmYXVsdEV4cG9ydCcsIG1vZHVsZUlkZW50aWZpZXIpXG5cdFx0Y29uc3QgdmFsID0gaXNMYXp5ID8gbGF6eVdyYXAoZGVmZXhwKSA6IGRlZmV4cFxuXHRcdHJldHVybiBsb2MobmV3IFZhcmlhYmxlRGVjbGFyYXRvcihpZEZvckRlY2xhcmVDYWNoZWQoZGVmKSwgdmFsKSwgZGVmLmxvYylcblx0fSlcblxuXHRjb25zdCBpbXBvcnRlZERlc3RydWN0ID0gaXNFbXB0eShpbXBvcnRlZCkgPyBudWxsIDpcblx0XHRtYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycyhpbXBvcnRlZCwgaXNMYXp5LCB2YWx1ZSwgdHJ1ZSwgZmFsc2UpXG5cblx0cmV0dXJuIGNhdChpbXBvcnRlZERlZmF1bHQsIGltcG9ydGVkRGVzdHJ1Y3QpXG59XG5cbmNvbnN0IElkQm9vdCA9IG5ldyBJZGVudGlmaWVyKCdfYm9vdCcpXG5jb25zdCBJZERlZmluZSA9IG5ldyBJZGVudGlmaWVyKCdkZWZpbmUnKVxuY29uc3QgRXhwb3J0c0dldCA9IG1lbWJlcihJZEV4cG9ydHMsICdfZ2V0JylcbmNvbnN0IExpdFN0ckV4cG9ydHMgPSBuZXcgTGl0ZXJhbCgnZXhwb3J0cycpXG5jb25zdCBSZXR1cm5FeHBvcnRzID0gbmV3IFJldHVyblN0YXRlbWVudChJZEV4cG9ydHMpXG5jb25zdCBVc2VTdHJpY3QgPSBuZXcgRXhwcmVzc2lvblN0YXRlbWVudChuZXcgTGl0ZXJhbCgndXNlIHN0cmljdCcpKVxuXG4vLyBpZiAodHlwZW9mIGRlZmluZSAhPT0gJ2Z1bmN0aW9uJykgdmFyIGRlZmluZSA9IHJlcXVpcmUoJ2FtZGVmaW5lJykobW9kdWxlKVxuY29uc3QgQW1kZWZpbmVIZWFkZXIgPSBuZXcgSWZTdGF0ZW1lbnQoXG5cdG5ldyBCaW5hcnlFeHByZXNzaW9uKCchPT0nLFxuXHRcdG5ldyBVbmFyeUV4cHJlc3Npb24oJ3R5cGVvZicsIElkRGVmaW5lKSxcblx0XHRuZXcgTGl0ZXJhbCgnZnVuY3Rpb24nKSksXG5cdG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCd2YXInLCBbXG5cdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZERlZmluZSwgbmV3IENhbGxFeHByZXNzaW9uKFxuXHRcdFx0bmV3IENhbGxFeHByZXNzaW9uKG5ldyBJZGVudGlmaWVyKCdyZXF1aXJlJyksIFtuZXcgTGl0ZXJhbCgnYW1kZWZpbmUnKV0pLFxuXHRcdFx0W25ldyBJZGVudGlmaWVyKCdtb2R1bGUnKV0pKV0pKVxuIl19
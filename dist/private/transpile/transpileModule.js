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
		const opDeclareImportedLocals = (0, _util2.opIf)(!(0, _util2.isEmpty)(imports), () => new _ast.VariableDeclaration('const', (0, _util2.flatMap)(imports, _ => importDeclarators(_, importToIdentifier.get(_)))));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGVNb2R1bGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQWN3QixlQUFlO1NBOEN2QixvQkFBb0IsR0FBcEIsb0JBQW9COzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUE5Q1osZUFBZTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBOEN2QixvQkFBb0IiLCJmaWxlIjoidHJhbnNwaWxlTW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcnJheUV4cHJlc3Npb24sIEFycm93RnVuY3Rpb25FeHByZXNzaW9uLCBBc3NpZ25tZW50RXhwcmVzc2lvbiwgQmluYXJ5RXhwcmVzc2lvbixcblx0QmxvY2tTdGF0ZW1lbnQsIENhbGxFeHByZXNzaW9uLCBFeHByZXNzaW9uU3RhdGVtZW50LCBJZGVudGlmaWVyLCBJZlN0YXRlbWVudCwgTGl0ZXJhbCwgUHJvZ3JhbSxcblx0VmFyaWFibGVEZWNsYXJhdGlvbiwgVmFyaWFibGVEZWNsYXJhdG9yLCBSZXR1cm5TdGF0ZW1lbnQsIFVuYXJ5RXhwcmVzc2lvblxuXHR9IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IHtpZGVudGlmaWVyLCBsb2MsIG1lbWJlciwgdG9TdGF0ZW1lbnR9IGZyb20gJ2VzYXN0L2Rpc3QvdXRpbCdcbmltcG9ydCB7b3B0aW9uc30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCBtYW5nbGVQYXRoIGZyb20gJy4uL21hbmdsZVBhdGgnXG5pbXBvcnQge0ltcG9ydCwgTG9jYWxEZWNsYXJlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7Y2F0LCBmbGF0TWFwLCBpc0VtcHR5LCBsYXN0LCBvcElmLCBvcE1hcCwgcnRhaWx9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge01vZHVsZXN9IGZyb20gJy4uL1ZlcmlmeVJlc3VsdHMnXG5pbXBvcnQge0RlY2xhcmVCdWlsdEJhZywgRGVjbGFyZUJ1aWx0TWFwLCBFeHBvcnRzRGVmYXVsdCwgSWRCdWlsdCwgSWRFeHBvcnRzfSBmcm9tICcuL2FzdC1jb25zdGFudHMnXG5pbXBvcnQge3ZlcmlmeVJlc3VsdHN9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB7aWRGb3JEZWNsYXJlQ2FjaGVkLCBsYXp5V3JhcCwgbWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMsIG1zQ2FsbCwgdDAsIHRMaW5lc30gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFuc3BpbGVNb2R1bGUoKSB7XG5cdGNvbnN0IGJvZHkgPSBtb2R1bGVCb2R5KHZlcmlmeVJlc3VsdHMubW9kdWxlS2luZCwgdGhpcy5saW5lcylcblxuXHRjb25zdCBpbXBvcnRzID0gdGhpcy5pbXBvcnRzLmZpbHRlcihfID0+IF8ucGF0aCAhPT0gJ2dsb2JhbCcpXG5cblx0Zm9yIChjb25zdCBbcGF0aCwgaW1wb3J0ZWRdIG9mIHZlcmlmeVJlc3VsdHMuYnVpbHRpblBhdGhUb05hbWVzKVxuXHRcdGlmIChwYXRoICE9PSAnZ2xvYmFsJykge1xuXHRcdFx0Y29uc3QgaW1wb3J0ZWREZWNsYXJlcyA9IFtdXG5cdFx0XHRsZXQgb3BJbXBvcnREZWZhdWx0ID0gbnVsbFxuXHRcdFx0bGV0IGRlZmF1bHROYW1lID0gbGFzdChwYXRoLnNwbGl0KCcvJykpXG5cdFx0XHRmb3IgKGNvbnN0IG5hbWUgb2YgaW1wb3J0ZWQpIHtcblx0XHRcdFx0Y29uc3QgZGVjbGFyZSA9IExvY2FsRGVjbGFyZS5wbGFpbih0aGlzLmxvYywgbmFtZSlcblx0XHRcdFx0aWYgKG5hbWUgPT09IGRlZmF1bHROYW1lKVxuXHRcdFx0XHRcdG9wSW1wb3J0RGVmYXVsdCA9IGRlY2xhcmVcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGltcG9ydGVkRGVjbGFyZXMucHVzaChkZWNsYXJlKVxuXHRcdFx0fVxuXHRcdFx0aW1wb3J0cy5wdXNoKG5ldyBJbXBvcnQodGhpcy5sb2MsIHBhdGgsIGltcG9ydGVkRGVjbGFyZXMsIG9wSW1wb3J0RGVmYXVsdCkpXG5cdFx0fVxuXG5cdGNvbnN0IGFtZCA9IGFtZFdyYXBNb2R1bGUodGhpcy5kb0ltcG9ydHMsIGltcG9ydHMsIGJvZHkpXG5cblx0cmV0dXJuIG5ldyBQcm9ncmFtKGNhdChcblx0XHRvcElmKG9wdGlvbnMuaW5jbHVkZVVzZVN0cmljdCgpLCAoKSA9PiBVc2VTdHJpY3QpLFxuXHRcdG9wSWYob3B0aW9ucy5pbmNsdWRlQW1kZWZpbmUoKSwgKCkgPT4gQW1kZWZpbmVIZWFkZXIpLFxuXHRcdHRvU3RhdGVtZW50KGFtZCkpKVxufVxuXG5mdW5jdGlvbiBtb2R1bGVCb2R5KGtpbmQsIGxpbmVzKSB7XG5cdHN3aXRjaCAoa2luZCkge1xuXHRcdGNhc2UgTW9kdWxlcy5EbzogY2FzZSBNb2R1bGVzLkV4cG9ydHM6XG5cdFx0XHRyZXR1cm4gdExpbmVzKGxpbmVzKVxuXHRcdGNhc2UgTW9kdWxlcy5WYWw6IHtcblx0XHRcdGNvbnN0IGEgPSB0TGluZXMocnRhaWwobGluZXMpKVxuXHRcdFx0Y29uc3QgYiA9IHQwKGxhc3QobGluZXMpKVxuXHRcdFx0cmV0dXJuIGNhdChhLCBleHBvcnREZWZhdWx0KGIpKVxuXHRcdH1cblx0XHRjYXNlIE1vZHVsZXMuQmFnOiBjYXNlIE1vZHVsZXMuTWFwOiB7XG5cdFx0XHRjb25zdCBkZWNsYXJlID0ga2luZCA9PT0gTW9kdWxlcy5CYWcgPyBEZWNsYXJlQnVpbHRCYWcgOiBEZWNsYXJlQnVpbHRNYXBcblx0XHRcdHJldHVybiBjYXQoZGVjbGFyZSwgdExpbmVzKGxpbmVzKSwgZXhwb3J0RGVmYXVsdChJZEJ1aWx0KSlcblx0XHR9XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHRocm93IG5ldyBFcnJvcih2ZXJpZnlSZXN1bHRzLm1vZHVsZUtpbmQpXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4cG9ydE5hbWVkT3JEZWZhdWx0KHZhbCwgbmFtZSkge1xuXHRpZiAobmFtZSA9PT0gb3B0aW9ucy5tb2R1bGVOYW1lKCkpXG5cdFx0cmV0dXJuIGV4cG9ydERlZmF1bHQodmFsKVxuXHRlbHNlXG5cdFx0cmV0dXJuIGV4cG9ydE5hbWVkKHZhbCwgbmFtZSlcbn1cblxuZnVuY3Rpb24gZXhwb3J0TmFtZWQodmFsLCBuYW1lKSB7XG5cdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRFeHBvcnRzLCBuYW1lKSwgdmFsKVxufVxuZnVuY3Rpb24gZXhwb3J0RGVmYXVsdCh2YWwpIHtcblx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIEV4cG9ydHNEZWZhdWx0LCB2YWwpXG59XG5cblxuZnVuY3Rpb24gYW1kV3JhcE1vZHVsZShkb0ltcG9ydHMsIGltcG9ydHMsIGJvZHkpIHtcblx0Y29uc3Qgc2hvdWxkSW1wb3J0Qm9vdCA9IG9wdGlvbnMuaW1wb3J0Qm9vdCgpXG5cblx0Y29uc3QgYWxsSW1wb3J0cyA9IGRvSW1wb3J0cy5jb25jYXQoaW1wb3J0cylcblx0Y29uc3QgYWxsSW1wb3J0UGF0aHMgPSBhbGxJbXBvcnRzLm1hcChfID0+IG1hbmdsZVBhdGgoXy5wYXRoKSlcblxuXHRjb25zdCBhcnJJbXBvcnRQYXRocyA9IG5ldyBBcnJheUV4cHJlc3Npb24oY2F0KFxuXHRcdExpdFN0ckV4cG9ydHMsXG5cdFx0b3BJZihzaG91bGRJbXBvcnRCb290LCAoKSA9PiBuZXcgTGl0ZXJhbChvcHRpb25zLmJvb3RQYXRoKCkpKSxcblx0XHRhbGxJbXBvcnRQYXRocy5tYXAoXyA9PiBuZXcgTGl0ZXJhbChfKSkpKVxuXG5cdGNvbnN0IGltcG9ydFRvSWRlbnRpZmllciA9IG5ldyBNYXAoKVxuXHRjb25zdCBpbXBvcnRJZGVudGlmaWVycyA9IFtdXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgYWxsSW1wb3J0cy5sZW5ndGg7IGkgPSBpICsgMSkge1xuXHRcdGNvbnN0IF8gPSBhbGxJbXBvcnRzW2ldXG5cdFx0Y29uc3QgaWQgPSBpZGVudGlmaWVyKGAke3BhdGhCYXNlTmFtZShfLnBhdGgpfV8ke2l9YClcblx0XHRpbXBvcnRJZGVudGlmaWVycy5wdXNoKGlkKVxuXHRcdGltcG9ydFRvSWRlbnRpZmllci5zZXQoXywgaWQpXG5cdH1cblxuXHRjb25zdCBpbXBvcnRBcmdzID0gY2F0KElkRXhwb3J0cywgb3BJZihzaG91bGRJbXBvcnRCb290LCAoKSA9PiBJZEJvb3QpLCBpbXBvcnRJZGVudGlmaWVycylcblxuXHRjb25zdCBkb0Jvb3QgPSBvcElmKHNob3VsZEltcG9ydEJvb3QsICgpID0+XG5cdFx0bmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQobXNDYWxsKCdnZXRNb2R1bGUnLCBJZEJvb3QpKSlcblxuXHRjb25zdCBpbXBvcnREb3MgPSBkb0ltcG9ydHMubWFwKF8gPT5cblx0XHRsb2MobmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQobXNDYWxsKCdnZXRNb2R1bGUnLCBpbXBvcnRUb0lkZW50aWZpZXIuZ2V0KF8pKSksIF8ubG9jKSlcblxuXHQvLyBFeHRyYWN0cyBpbXBvcnRlZCB2YWx1ZXMgZnJvbSB0aGUgbW9kdWxlcy5cblx0Y29uc3Qgb3BEZWNsYXJlSW1wb3J0ZWRMb2NhbHMgPSBvcElmKCFpc0VtcHR5KGltcG9ydHMpLFxuXHRcdCgpID0+IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsXG5cdFx0XHRmbGF0TWFwKGltcG9ydHMsIF8gPT4gaW1wb3J0RGVjbGFyYXRvcnMoXywgaW1wb3J0VG9JZGVudGlmaWVyLmdldChfKSkpKSlcblxuXHRjb25zdCBmdWxsQm9keSA9IG5ldyBCbG9ja1N0YXRlbWVudChjYXQoXG5cdFx0ZG9Cb290LCBpbXBvcnREb3MsIG9wRGVjbGFyZUltcG9ydGVkTG9jYWxzLCBib2R5LCBSZXR1cm5FeHBvcnRzKSlcblxuXHRjb25zdCBsYXp5Qm9keSA9XG5cdFx0b3B0aW9ucy5sYXp5TW9kdWxlKCkgP1xuXHRcdFx0bmV3IEJsb2NrU3RhdGVtZW50KFtuZXcgRXhwcmVzc2lvblN0YXRlbWVudChcblx0XHRcdFx0bmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgRXhwb3J0c0dldCxcblx0XHRcdFx0XHRtc0NhbGwoJ2xhenknLCBuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oW10sIGZ1bGxCb2R5KSkpKV0pIDpcblx0XHRcdGZ1bGxCb2R5XG5cblx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbihJZERlZmluZSxcblx0XHRbYXJySW1wb3J0UGF0aHMsIG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihpbXBvcnRBcmdzLCBsYXp5Qm9keSldKVxufVxuXG5mdW5jdGlvbiBwYXRoQmFzZU5hbWUocGF0aCkge1xuXHRyZXR1cm4gcGF0aC5zdWJzdHIocGF0aC5sYXN0SW5kZXhPZignLycpICsgMSlcbn1cblxuZnVuY3Rpb24gaW1wb3J0RGVjbGFyYXRvcnMoe2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9LCBtb2R1bGVJZGVudGlmaWVyKSB7XG5cdC8vIFRPRE86IENvdWxkIGJlIG5lYXRlciBhYm91dCB0aGlzXG5cdGNvbnN0IGlzTGF6eSA9IChpc0VtcHR5KGltcG9ydGVkKSA/IG9wSW1wb3J0RGVmYXVsdCA6IGltcG9ydGVkWzBdKS5pc0xhenkoKVxuXHRjb25zdCB2YWx1ZSA9IG1zQ2FsbChpc0xhenkgPyAnbGF6eUdldE1vZHVsZScgOiAnZ2V0TW9kdWxlJywgbW9kdWxlSWRlbnRpZmllcilcblxuXHRjb25zdCBpbXBvcnRlZERlZmF1bHQgPSBvcE1hcChvcEltcG9ydERlZmF1bHQsIGRlZiA9PiB7XG5cdFx0Y29uc3QgZGVmZXhwID0gbXNDYWxsKCdnZXREZWZhdWx0RXhwb3J0JywgbW9kdWxlSWRlbnRpZmllcilcblx0XHRjb25zdCB2YWwgPSBpc0xhenkgPyBsYXp5V3JhcChkZWZleHApIDogZGVmZXhwXG5cdFx0cmV0dXJuIGxvYyhuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRm9yRGVjbGFyZUNhY2hlZChkZWYpLCB2YWwpLCBkZWYubG9jKVxuXHR9KVxuXG5cdGNvbnN0IGltcG9ydGVkRGVzdHJ1Y3QgPSBpc0VtcHR5KGltcG9ydGVkKSA/IG51bGwgOlxuXHRcdG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzKGltcG9ydGVkLCBpc0xhenksIHZhbHVlLCB0cnVlLCBmYWxzZSlcblxuXHRyZXR1cm4gY2F0KGltcG9ydGVkRGVmYXVsdCwgaW1wb3J0ZWREZXN0cnVjdClcbn1cblxuY29uc3QgSWRCb290ID0gbmV3IElkZW50aWZpZXIoJ19ib290JylcbmNvbnN0IElkRGVmaW5lID0gbmV3IElkZW50aWZpZXIoJ2RlZmluZScpXG5jb25zdCBFeHBvcnRzR2V0ID0gbWVtYmVyKElkRXhwb3J0cywgJ19nZXQnKVxuY29uc3QgTGl0U3RyRXhwb3J0cyA9IG5ldyBMaXRlcmFsKCdleHBvcnRzJylcbmNvbnN0IFJldHVybkV4cG9ydHMgPSBuZXcgUmV0dXJuU3RhdGVtZW50KElkRXhwb3J0cylcbmNvbnN0IFVzZVN0cmljdCA9IG5ldyBFeHByZXNzaW9uU3RhdGVtZW50KG5ldyBMaXRlcmFsKCd1c2Ugc3RyaWN0JykpXG5cbi8vIGlmICh0eXBlb2YgZGVmaW5lICE9PSAnZnVuY3Rpb24nKSB2YXIgZGVmaW5lID0gcmVxdWlyZSgnYW1kZWZpbmUnKShtb2R1bGUpXG5jb25zdCBBbWRlZmluZUhlYWRlciA9IG5ldyBJZlN0YXRlbWVudChcblx0bmV3IEJpbmFyeUV4cHJlc3Npb24oJyE9PScsXG5cdFx0bmV3IFVuYXJ5RXhwcmVzc2lvbigndHlwZW9mJywgSWREZWZpbmUpLFxuXHRcdG5ldyBMaXRlcmFsKCdmdW5jdGlvbicpKSxcblx0bmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ3ZhcicsIFtcblx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKElkRGVmaW5lLCBuZXcgQ2FsbEV4cHJlc3Npb24oXG5cdFx0XHRuZXcgQ2FsbEV4cHJlc3Npb24obmV3IElkZW50aWZpZXIoJ3JlcXVpcmUnKSwgW25ldyBMaXRlcmFsKCdhbWRlZmluZScpXSksXG5cdFx0XHRbbmV3IElkZW50aWZpZXIoJ21vZHVsZScpXSkpXSkpXG4iXX0=
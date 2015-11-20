'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', './checks', './parseBlock', './parseLine', './parseLocalDeclares', './parseName', './Slice', './tryTakeComment'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('./checks'), require('./parseBlock'), require('./parseLine'), require('./parseLocalDeclares'), require('./parseName'), require('./Slice'), require('./tryTakeComment'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.checks, global.parseBlock, global.parseLine, global.parseLocalDeclares, global.parseName, global.Slice, global.tryTakeComment);
		global.parseModule = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _checks, _parseBlock, _parseLine, _parseLocalDeclares, _parseName, _Slice, _tryTakeComment3) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseModule;

	var _parseName2 = _interopRequireDefault(_parseName);

	var _Slice2 = _interopRequireDefault(_Slice);

	var _tryTakeComment4 = _interopRequireDefault(_tryTakeComment3);

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

	function parseModule(tokens) {
		var _tryTakeComment = (0, _tryTakeComment4.default)(tokens);

		var _tryTakeComment2 = _slicedToArray(_tryTakeComment, 2);

		const opComment = _tryTakeComment2[0];
		const rest0 = _tryTakeComment2[1];

		var _takeImports = takeImports(_Token.Keywords.ImportDo, rest0);

		var _takeImports2 = _slicedToArray(_takeImports, 2);

		const doImports = _takeImports2[0];
		const rest1 = _takeImports2[1];

		var _takeImports3 = takeImports(_Token.Keywords.Import, rest1);

		var _takeImports4 = _slicedToArray(_takeImports3, 2);

		const plainImports = _takeImports4[0];
		const rest2 = _takeImports4[1];

		var _takeImports5 = takeImports(_Token.Keywords.ImportLazy, rest2);

		var _takeImports6 = _slicedToArray(_takeImports5, 2);

		const lazyImports = _takeImports6[0];
		const rest3 = _takeImports6[1];
		const lines = (0, _parseLine.parseLines)(rest3);
		const imports = plainImports.concat(lazyImports);
		return new _MsAst.Module(tokens.loc, _context.options.moduleName(), opComment, doImports, imports, lines);
	}

	function takeImports(importKeywordKind, lines) {
		if (!lines.isEmpty()) {
			const line = lines.headSlice();
			if ((0, _Token.isKeyword)(importKeywordKind, line.head())) return [parseImports(importKeywordKind, line.tail()), lines.tail()];
		}

		return [[], lines];
	}

	function parseImports(importKeywordKind, tokens) {
		const lines = (0, _parseBlock.justBlock)(importKeywordKind, tokens);
		return lines.mapSlices(line => {
			var _parseRequire = parseRequire(line.head());

			const path = _parseRequire.path;
			const name = _parseRequire.name;
			const rest = line.tail();

			if (importKeywordKind === _Token.Keywords.ImportDo) {
				(0, _checks.checkEmpty)(rest, () => `This is an ${ (0, _Token.showKeyword)(_Token.Keywords.ImportDo) }, so you can't import any values.`);
				return new _MsAst.ImportDo(line.loc, path);
			} else {
				var _parseThingsImported = parseThingsImported(name, importKeywordKind === _Token.Keywords.ImportLazy, rest);

				const imported = _parseThingsImported.imported;
				const opImportDefault = _parseThingsImported.opImportDefault;
				return new _MsAst.Import(line.loc, path, imported, opImportDefault);
			}
		});
	}

	function parseThingsImported(name, isLazy, tokens) {
		const importDefault = () => _MsAst.LocalDeclare.untyped(tokens.loc, name, isLazy ? _MsAst.LocalDeclares.Lazy : _MsAst.LocalDeclares.Eager);

		if (tokens.isEmpty()) return {
			imported: [],
			opImportDefault: importDefault()
		};else {
			var _ref = (0, _Token.isKeyword)(_Token.Keywords.Focus, tokens.head()) ? [importDefault(), tokens.tail()] : [null, tokens];

			var _ref2 = _slicedToArray(_ref, 2);

			const opImportDefault = _ref2[0];
			const rest = _ref2[1];
			const imported = (0, _parseLocalDeclares.parseLocalDeclaresJustNames)(rest).map(l => {
				(0, _context.check)(l.name !== '_', l.pos, () => `${ (0, _Token.showKeyword)(_Token.Keywords.Focus) } not allowed as import name.`);
				if (isLazy) l.kind = _MsAst.LocalDeclares.Lazy;
				return l;
			});
			return {
				imported,
				opImportDefault
			};
		}
	}

	function parseRequire(token) {
		const name = (0, _parseName.tryParseName)(token);
		if (name !== null) return {
			path: name,
			name
		};else {
			(0, _context.check)((0, _Token.isGroup)(_Token.Groups.Space, token), token.loc, 'Not a valid module name.');

			const tokens = _Slice2.default.group(token);

			let rest = tokens;
			const parts = [];
			const head = rest.head();
			const n = tryTakeNDots(head);

			if (n !== null) {
				parts.push('.');

				for (let i = 1; i < n; i = i + 1) parts.push('..');

				rest = rest.tail();

				while (!rest.isEmpty()) {
					const n = tryTakeNDots(rest.head());
					if (n === null) break;

					for (let i = 0; i < n; i = i + 1) parts.push('..');

					rest = rest.tail();
				}
			}

			for (;;) {
				(0, _checks.checkNonEmpty)(rest);
				parts.push((0, _parseName2.default)(rest.head()));
				rest = rest.tail();
				if (rest.isEmpty()) break;
				(0, _checks.checkKeyword)(_Token.Keywords.Dot, rest.head());
				rest = rest.tail();
			}

			return {
				path: parts.join('/'),
				name: parts[parts.length - 1]
			};
		}
	}

	function tryTakeNDots(token) {
		if (!(token instanceof _Token.Keyword)) return null;

		switch (token.kind) {
			case _Token.Keywords.Dot:
				return 1;

			case _Token.Keywords.Dot2:
				return 2;

			case _Token.Keywords.Dot3:
				return 3;

			default:
				return null;
		}
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYXJzZU1vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbXX0=
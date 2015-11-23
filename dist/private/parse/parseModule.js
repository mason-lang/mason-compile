'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', '../util', './checks', './parseBlock', './parseLine', './parseLocalDeclares', './parseName', './Slice', './tryTakeComment'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parseBlock'), require('./parseLine'), require('./parseLocalDeclares'), require('./parseName'), require('./Slice'), require('./tryTakeComment'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.util, global.checks, global.parseBlock, global.parseLine, global.parseLocalDeclares, global.parseName, global.Slice, global.tryTakeComment);
		global.parseModule = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _util, _checks, _parseBlock, _parseLine, _parseLocalDeclares, _parseName, _Slice, _tryTakeComment3) {
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
		return new _MsAst.Module(tokens.loc, _context.pathOptions.moduleName(), opComment, doImports, imports, lines);
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
		return (0, _util.ifElse)((0, _parseName.tryParseName)(token), name => ({
			path: name,
			name
		}), () => {
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
		});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTW9kdWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFpQndCLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFBWCxXQUFXIiwiZmlsZSI6InBhcnNlTW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVjaywgcGF0aE9wdGlvbnN9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0ltcG9ydERvLCBJbXBvcnQsIExvY2FsRGVjbGFyZSwgTG9jYWxEZWNsYXJlcywgTW9kdWxlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXBzLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtleXdvcmQsIEtleXdvcmRzLCBzaG93S2V5d29yZH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2lmRWxzZX0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tFbXB0eSwgY2hlY2tOb25FbXB0eSwgY2hlY2tLZXl3b3JkfSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7anVzdEJsb2NrfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQge3BhcnNlTGluZXN9IGZyb20gJy4vcGFyc2VMaW5lJ1xuaW1wb3J0IHtwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXN9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuaW1wb3J0IHBhcnNlTmFtZSwge3RyeVBhcnNlTmFtZX0gZnJvbSAnLi9wYXJzZU5hbWUnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcbmltcG9ydCB0cnlUYWtlQ29tbWVudCBmcm9tICcuL3RyeVRha2VDb21tZW50J1xuXG4vKipcblBhcnNlIHRoZSB3aG9sZSBUb2tlbiB0cmVlLlxuQHBhcmFtIHtTbGljZX0gdG9rZW5zXG5AcmV0dXJuIHtNb2R1bGV9XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VNb2R1bGUodG9rZW5zKSB7XG5cdC8vIE1vZHVsZSBkb2MgY29tbWVudCBtdXN0IGNvbWUgZmlyc3QuXG5cdGNvbnN0IFtvcENvbW1lbnQsIHJlc3QwXSA9IHRyeVRha2VDb21tZW50KHRva2Vucylcblx0Ly8gSW1wb3J0IHN0YXRlbWVudHMgbXVzdCBhcHBlYXIgaW4gb3JkZXIuXG5cdGNvbnN0IFtkb0ltcG9ydHMsIHJlc3QxXSA9IHRha2VJbXBvcnRzKEtleXdvcmRzLkltcG9ydERvLCByZXN0MClcblx0Y29uc3QgW3BsYWluSW1wb3J0cywgcmVzdDJdID0gdGFrZUltcG9ydHMoS2V5d29yZHMuSW1wb3J0LCByZXN0MSlcblx0Y29uc3QgW2xhenlJbXBvcnRzLCByZXN0M10gPSB0YWtlSW1wb3J0cyhLZXl3b3Jkcy5JbXBvcnRMYXp5LCByZXN0Milcblx0Y29uc3QgbGluZXMgPSBwYXJzZUxpbmVzKHJlc3QzKVxuXHRjb25zdCBpbXBvcnRzID0gcGxhaW5JbXBvcnRzLmNvbmNhdChsYXp5SW1wb3J0cylcblx0cmV0dXJuIG5ldyBNb2R1bGUodG9rZW5zLmxvYywgcGF0aE9wdGlvbnMubW9kdWxlTmFtZSgpLCBvcENvbW1lbnQsIGRvSW1wb3J0cywgaW1wb3J0cywgbGluZXMpXG59XG5cbmZ1bmN0aW9uIHRha2VJbXBvcnRzKGltcG9ydEtleXdvcmRLaW5kLCBsaW5lcykge1xuXHRpZiAoIWxpbmVzLmlzRW1wdHkoKSkge1xuXHRcdGNvbnN0IGxpbmUgPSBsaW5lcy5oZWFkU2xpY2UoKVxuXHRcdGlmIChpc0tleXdvcmQoaW1wb3J0S2V5d29yZEtpbmQsIGxpbmUuaGVhZCgpKSlcblx0XHRcdHJldHVybiBbcGFyc2VJbXBvcnRzKGltcG9ydEtleXdvcmRLaW5kLCBsaW5lLnRhaWwoKSksIGxpbmVzLnRhaWwoKV1cblx0fVxuXHRyZXR1cm4gW1tdLCBsaW5lc11cbn1cblxuZnVuY3Rpb24gcGFyc2VJbXBvcnRzKGltcG9ydEtleXdvcmRLaW5kLCB0b2tlbnMpIHtcblx0Y29uc3QgbGluZXMgPSBqdXN0QmxvY2soaW1wb3J0S2V5d29yZEtpbmQsIHRva2Vucylcblx0cmV0dXJuIGxpbmVzLm1hcFNsaWNlcyhsaW5lID0+IHtcblx0XHRjb25zdCB7cGF0aCwgbmFtZX0gPSBwYXJzZVJlcXVpcmUobGluZS5oZWFkKCkpXG5cdFx0Y29uc3QgcmVzdCA9IGxpbmUudGFpbCgpXG5cdFx0aWYgKGltcG9ydEtleXdvcmRLaW5kID09PSBLZXl3b3Jkcy5JbXBvcnREbykge1xuXHRcdFx0Y2hlY2tFbXB0eShyZXN0LCAoKSA9PlxuXHRcdFx0XHRgVGhpcyBpcyBhbiAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkltcG9ydERvKX0sIHNvIHlvdSBjYW4ndCBpbXBvcnQgYW55IHZhbHVlcy5gKVxuXHRcdFx0cmV0dXJuIG5ldyBJbXBvcnREbyhsaW5lLmxvYywgcGF0aClcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3Qge2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9ID1cblx0XHRcdFx0cGFyc2VUaGluZ3NJbXBvcnRlZChuYW1lLCBpbXBvcnRLZXl3b3JkS2luZCA9PT0gS2V5d29yZHMuSW1wb3J0TGF6eSwgcmVzdClcblx0XHRcdHJldHVybiBuZXcgSW1wb3J0KGxpbmUubG9jLCBwYXRoLCBpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0KVxuXHRcdH1cblx0fSlcbn1cblxuZnVuY3Rpb24gcGFyc2VUaGluZ3NJbXBvcnRlZChuYW1lLCBpc0xhenksIHRva2Vucykge1xuXHRjb25zdCBpbXBvcnREZWZhdWx0ID0gKCkgPT5cblx0XHRMb2NhbERlY2xhcmUudW50eXBlZChcblx0XHRcdHRva2Vucy5sb2MsXG5cdFx0XHRuYW1lLFxuXHRcdFx0aXNMYXp5ID8gTG9jYWxEZWNsYXJlcy5MYXp5IDogTG9jYWxEZWNsYXJlcy5FYWdlcilcblxuXHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRyZXR1cm4ge2ltcG9ydGVkOiBbXSwgb3BJbXBvcnREZWZhdWx0OiBpbXBvcnREZWZhdWx0KCl9XG5cdGVsc2Uge1xuXHRcdGNvbnN0IFtvcEltcG9ydERlZmF1bHQsIHJlc3RdID0gaXNLZXl3b3JkKEtleXdvcmRzLkZvY3VzLCB0b2tlbnMuaGVhZCgpKSA/XG5cdFx0XHRbaW1wb3J0RGVmYXVsdCgpLCB0b2tlbnMudGFpbCgpXSA6XG5cdFx0XHRbbnVsbCwgdG9rZW5zXVxuXHRcdGNvbnN0IGltcG9ydGVkID0gcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKHJlc3QpLm1hcChsID0+IHtcblx0XHRcdGNoZWNrKGwubmFtZSAhPT0gJ18nLCBsLnBvcywgKCkgPT5cblx0XHRcdFx0YCR7c2hvd0tleXdvcmQoS2V5d29yZHMuRm9jdXMpfSBub3QgYWxsb3dlZCBhcyBpbXBvcnQgbmFtZS5gKVxuXHRcdFx0aWYgKGlzTGF6eSlcblx0XHRcdFx0bC5raW5kID0gTG9jYWxEZWNsYXJlcy5MYXp5XG5cdFx0XHRyZXR1cm4gbFxuXHRcdH0pXG5cdFx0cmV0dXJuIHtpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlUmVxdWlyZSh0b2tlbikge1xuXHRyZXR1cm4gaWZFbHNlKHRyeVBhcnNlTmFtZSh0b2tlbiksXG5cdFx0bmFtZSA9PiAoe3BhdGg6IG5hbWUsIG5hbWV9KSxcblx0XHQoKSA9PiB7XG5cdFx0XHRjaGVjayhpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgdG9rZW4pLCB0b2tlbi5sb2MsICdOb3QgYSB2YWxpZCBtb2R1bGUgbmFtZS4nKVxuXHRcdFx0Y29uc3QgdG9rZW5zID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cblx0XHRcdC8vIFRha2UgbGVhZGluZyBkb3RzLlxuXHRcdFx0bGV0IHJlc3QgPSB0b2tlbnNcblx0XHRcdGNvbnN0IHBhcnRzID0gW11cblx0XHRcdGNvbnN0IGhlYWQgPSByZXN0LmhlYWQoKVxuXHRcdFx0Y29uc3QgbiA9IHRyeVRha2VORG90cyhoZWFkKVxuXHRcdFx0aWYgKG4gIT09IG51bGwpIHtcblx0XHRcdFx0cGFydHMucHVzaCgnLicpXG5cdFx0XHRcdGZvciAobGV0IGkgPSAxOyBpIDwgbjsgaSA9IGkgKyAxKVxuXHRcdFx0XHRcdHBhcnRzLnB1c2goJy4uJylcblx0XHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdFx0XHRcdHdoaWxlICghcmVzdC5pc0VtcHR5KCkpIHtcblx0XHRcdFx0XHRjb25zdCBuID0gdHJ5VGFrZU5Eb3RzKHJlc3QuaGVhZCgpKVxuXHRcdFx0XHRcdGlmIChuID09PSBudWxsKVxuXHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG47IGkgPSBpICsgMSlcblx0XHRcdFx0XHRcdHBhcnRzLnB1c2goJy4uJylcblx0XHRcdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBUYWtlIG5hbWUsIHRoZW4gYW55IG51bWJlciBvZiBkb3QtdGhlbi1uYW1lIChgLnhgKVxuXHRcdFx0Zm9yICg7Oykge1xuXHRcdFx0XHRjaGVja05vbkVtcHR5KHJlc3QpXG5cdFx0XHRcdHBhcnRzLnB1c2gocGFyc2VOYW1lKHJlc3QuaGVhZCgpKSlcblx0XHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cblx0XHRcdFx0aWYgKHJlc3QuaXNFbXB0eSgpKVxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0Ly8gSWYgdGhlcmUncyBzb21ldGhpbmcgbGVmdCwgaXQgc2hvdWxkIGJlIGEgZG90LCBmb2xsb3dlZCBieSBhIG5hbWUuXG5cdFx0XHRcdGNoZWNrS2V5d29yZChLZXl3b3Jkcy5Eb3QsIHJlc3QuaGVhZCgpKVxuXHRcdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHtwYXRoOiBwYXJ0cy5qb2luKCcvJyksIG5hbWU6IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdfVxuXHRcdH0pXG59XG5cbmZ1bmN0aW9uIHRyeVRha2VORG90cyh0b2tlbikge1xuXHRpZiAoISh0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpKVxuXHRcdHJldHVybiBudWxsXG5cdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuRG90OlxuXHRcdFx0cmV0dXJuIDFcblx0XHRjYXNlIEtleXdvcmRzLkRvdDI6XG5cdFx0XHRyZXR1cm4gMlxuXHRcdGNhc2UgS2V5d29yZHMuRG90Mzpcblx0XHRcdHJldHVybiAzXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBudWxsXG5cdH1cbn1cbiJdfQ==
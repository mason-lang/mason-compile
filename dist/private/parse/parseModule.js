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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTW9kdWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFnQndCLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFBWCxXQUFXIiwiZmlsZSI6InBhcnNlTW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVjaywgb3B0aW9uc30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7SW1wb3J0RG8sIEltcG9ydCwgTG9jYWxEZWNsYXJlLCBMb2NhbERlY2xhcmVzLCBNb2R1bGV9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtHcm91cHMsIGlzR3JvdXAsIGlzS2V5d29yZCwgS2V5d29yZCwgS2V5d29yZHMsIHNob3dLZXl3b3JkfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7Y2hlY2tFbXB0eSwgY2hlY2tOb25FbXB0eSwgY2hlY2tLZXl3b3JkfSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7anVzdEJsb2NrfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQge3BhcnNlTGluZXN9IGZyb20gJy4vcGFyc2VMaW5lJ1xuaW1wb3J0IHtwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXN9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuaW1wb3J0IHBhcnNlTmFtZSwge3RyeVBhcnNlTmFtZX0gZnJvbSAnLi9wYXJzZU5hbWUnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcbmltcG9ydCB0cnlUYWtlQ29tbWVudCBmcm9tICcuL3RyeVRha2VDb21tZW50J1xuXG4vKipcblBhcnNlIHRoZSB3aG9sZSBUb2tlbiB0cmVlLlxuQHBhcmFtIHtTbGljZX0gdG9rZW5zXG5AcmV0dXJuIHtNb2R1bGV9XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VNb2R1bGUodG9rZW5zKSB7XG5cdC8vIE1vZHVsZSBkb2MgY29tbWVudCBtdXN0IGNvbWUgZmlyc3QuXG5cdGNvbnN0IFtvcENvbW1lbnQsIHJlc3QwXSA9IHRyeVRha2VDb21tZW50KHRva2Vucylcblx0Ly8gSW1wb3J0IHN0YXRlbWVudHMgbXVzdCBhcHBlYXIgaW4gb3JkZXIuXG5cdGNvbnN0IFtkb0ltcG9ydHMsIHJlc3QxXSA9IHRha2VJbXBvcnRzKEtleXdvcmRzLkltcG9ydERvLCByZXN0MClcblx0Y29uc3QgW3BsYWluSW1wb3J0cywgcmVzdDJdID0gdGFrZUltcG9ydHMoS2V5d29yZHMuSW1wb3J0LCByZXN0MSlcblx0Y29uc3QgW2xhenlJbXBvcnRzLCByZXN0M10gPSB0YWtlSW1wb3J0cyhLZXl3b3Jkcy5JbXBvcnRMYXp5LCByZXN0Milcblx0Y29uc3QgbGluZXMgPSBwYXJzZUxpbmVzKHJlc3QzKVxuXHRjb25zdCBpbXBvcnRzID0gcGxhaW5JbXBvcnRzLmNvbmNhdChsYXp5SW1wb3J0cylcblx0cmV0dXJuIG5ldyBNb2R1bGUodG9rZW5zLmxvYywgb3B0aW9ucy5tb2R1bGVOYW1lKCksIG9wQ29tbWVudCwgZG9JbXBvcnRzLCBpbXBvcnRzLCBsaW5lcylcbn1cblxuZnVuY3Rpb24gdGFrZUltcG9ydHMoaW1wb3J0S2V5d29yZEtpbmQsIGxpbmVzKSB7XG5cdGlmICghbGluZXMuaXNFbXB0eSgpKSB7XG5cdFx0Y29uc3QgbGluZSA9IGxpbmVzLmhlYWRTbGljZSgpXG5cdFx0aWYgKGlzS2V5d29yZChpbXBvcnRLZXl3b3JkS2luZCwgbGluZS5oZWFkKCkpKVxuXHRcdFx0cmV0dXJuIFtwYXJzZUltcG9ydHMoaW1wb3J0S2V5d29yZEtpbmQsIGxpbmUudGFpbCgpKSwgbGluZXMudGFpbCgpXVxuXHR9XG5cdHJldHVybiBbW10sIGxpbmVzXVxufVxuXG5mdW5jdGlvbiBwYXJzZUltcG9ydHMoaW1wb3J0S2V5d29yZEtpbmQsIHRva2Vucykge1xuXHRjb25zdCBsaW5lcyA9IGp1c3RCbG9jayhpbXBvcnRLZXl3b3JkS2luZCwgdG9rZW5zKVxuXHRyZXR1cm4gbGluZXMubWFwU2xpY2VzKGxpbmUgPT4ge1xuXHRcdGNvbnN0IHtwYXRoLCBuYW1lfSA9IHBhcnNlUmVxdWlyZShsaW5lLmhlYWQoKSlcblx0XHRjb25zdCByZXN0ID0gbGluZS50YWlsKClcblx0XHRpZiAoaW1wb3J0S2V5d29yZEtpbmQgPT09IEtleXdvcmRzLkltcG9ydERvKSB7XG5cdFx0XHRjaGVja0VtcHR5KHJlc3QsICgpID0+XG5cdFx0XHRcdGBUaGlzIGlzIGFuICR7c2hvd0tleXdvcmQoS2V5d29yZHMuSW1wb3J0RG8pfSwgc28geW91IGNhbid0IGltcG9ydCBhbnkgdmFsdWVzLmApXG5cdFx0XHRyZXR1cm4gbmV3IEltcG9ydERvKGxpbmUubG9jLCBwYXRoKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCB7aW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdH0gPVxuXHRcdFx0XHRwYXJzZVRoaW5nc0ltcG9ydGVkKG5hbWUsIGltcG9ydEtleXdvcmRLaW5kID09PSBLZXl3b3Jkcy5JbXBvcnRMYXp5LCByZXN0KVxuXHRcdFx0cmV0dXJuIG5ldyBJbXBvcnQobGluZS5sb2MsIHBhdGgsIGltcG9ydGVkLCBvcEltcG9ydERlZmF1bHQpXG5cdFx0fVxuXHR9KVxufVxuXG5mdW5jdGlvbiBwYXJzZVRoaW5nc0ltcG9ydGVkKG5hbWUsIGlzTGF6eSwgdG9rZW5zKSB7XG5cdGNvbnN0IGltcG9ydERlZmF1bHQgPSAoKSA9PlxuXHRcdExvY2FsRGVjbGFyZS51bnR5cGVkKFxuXHRcdFx0dG9rZW5zLmxvYyxcblx0XHRcdG5hbWUsXG5cdFx0XHRpc0xhenkgPyBMb2NhbERlY2xhcmVzLkxhenkgOiBMb2NhbERlY2xhcmVzLkVhZ2VyKVxuXG5cdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdHJldHVybiB7aW1wb3J0ZWQ6IFtdLCBvcEltcG9ydERlZmF1bHQ6IGltcG9ydERlZmF1bHQoKX1cblx0ZWxzZSB7XG5cdFx0Y29uc3QgW29wSW1wb3J0RGVmYXVsdCwgcmVzdF0gPSBpc0tleXdvcmQoS2V5d29yZHMuRm9jdXMsIHRva2Vucy5oZWFkKCkpID9cblx0XHRcdFtpbXBvcnREZWZhdWx0KCksIHRva2Vucy50YWlsKCldIDpcblx0XHRcdFtudWxsLCB0b2tlbnNdXG5cdFx0Y29uc3QgaW1wb3J0ZWQgPSBwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMocmVzdCkubWFwKGwgPT4ge1xuXHRcdFx0Y2hlY2sobC5uYW1lICE9PSAnXycsIGwucG9zLCAoKSA9PlxuXHRcdFx0XHRgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5Gb2N1cyl9IG5vdCBhbGxvd2VkIGFzIGltcG9ydCBuYW1lLmApXG5cdFx0XHRpZiAoaXNMYXp5KVxuXHRcdFx0XHRsLmtpbmQgPSBMb2NhbERlY2xhcmVzLkxhenlcblx0XHRcdHJldHVybiBsXG5cdFx0fSlcblx0XHRyZXR1cm4ge2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VSZXF1aXJlKHRva2VuKSB7XG5cdGNvbnN0IG5hbWUgPSB0cnlQYXJzZU5hbWUodG9rZW4pXG5cdGlmIChuYW1lICE9PSBudWxsKVxuXHRcdHJldHVybiB7cGF0aDogbmFtZSwgbmFtZX1cblx0ZWxzZSB7XG5cdFx0Y2hlY2soaXNHcm91cChHcm91cHMuU3BhY2UsIHRva2VuKSwgdG9rZW4ubG9jLCAnTm90IGEgdmFsaWQgbW9kdWxlIG5hbWUuJylcblx0XHRjb25zdCB0b2tlbnMgPSBTbGljZS5ncm91cCh0b2tlbilcblxuXHRcdC8vIFRha2UgbGVhZGluZyBkb3RzLlxuXHRcdGxldCByZXN0ID0gdG9rZW5zXG5cdFx0Y29uc3QgcGFydHMgPSBbXVxuXHRcdGNvbnN0IGhlYWQgPSByZXN0LmhlYWQoKVxuXHRcdGNvbnN0IG4gPSB0cnlUYWtlTkRvdHMoaGVhZClcblx0XHRpZiAobiAhPT0gbnVsbCkge1xuXHRcdFx0cGFydHMucHVzaCgnLicpXG5cdFx0XHRmb3IgKGxldCBpID0gMTsgaSA8IG47IGkgPSBpICsgMSlcblx0XHRcdFx0cGFydHMucHVzaCgnLi4nKVxuXHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdFx0XHR3aGlsZSAoIXJlc3QuaXNFbXB0eSgpKSB7XG5cdFx0XHRcdGNvbnN0IG4gPSB0cnlUYWtlTkRvdHMocmVzdC5oZWFkKCkpXG5cdFx0XHRcdGlmIChuID09PSBudWxsKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbjsgaSA9IGkgKyAxKVxuXHRcdFx0XHRcdHBhcnRzLnB1c2goJy4uJylcblx0XHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gVGFrZSBuYW1lLCB0aGVuIGFueSBudW1iZXIgb2YgZG90LXRoZW4tbmFtZSAoYC54YClcblx0XHRmb3IgKDs7KSB7XG5cdFx0XHRjaGVja05vbkVtcHR5KHJlc3QpXG5cdFx0XHRwYXJ0cy5wdXNoKHBhcnNlTmFtZShyZXN0LmhlYWQoKSkpXG5cdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblxuXHRcdFx0aWYgKHJlc3QuaXNFbXB0eSgpKVxuXHRcdFx0XHRicmVha1xuXG5cdFx0XHQvLyBJZiB0aGVyZSdzIHNvbWV0aGluZyBsZWZ0LCBpdCBzaG91bGQgYmUgYSBkb3QsIGZvbGxvd2VkIGJ5IGEgbmFtZS5cblx0XHRcdGNoZWNrS2V5d29yZChLZXl3b3Jkcy5Eb3QsIHJlc3QuaGVhZCgpKVxuXHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtwYXRoOiBwYXJ0cy5qb2luKCcvJyksIG5hbWU6IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdfVxuXHR9XG59XG5cbmZ1bmN0aW9uIHRyeVRha2VORG90cyh0b2tlbikge1xuXHRpZiAoISh0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpKVxuXHRcdHJldHVybiBudWxsXG5cdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuRG90OlxuXHRcdFx0cmV0dXJuIDFcblx0XHRjYXNlIEtleXdvcmRzLkRvdDI6XG5cdFx0XHRyZXR1cm4gMlxuXHRcdGNhc2UgS2V5d29yZHMuRG90Mzpcblx0XHRcdHJldHVybiAzXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBudWxsXG5cdH1cbn1cbiJdfQ==
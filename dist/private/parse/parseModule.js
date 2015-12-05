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
				(0, _checks.checkEmpty)(rest, 'unexpectedAfterImportDo');
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
				(0, _context.check)(l.name !== '_', l.pos, () => 'noImportFocus');
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
			(0, _context.check)((0, _Token.isGroup)(_Token.Groups.Space, token), token.loc, 'invalidImportModule');

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
				(0, _checks.checkNonEmpty)(rest, 'expectedImportModuleName');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTW9kdWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFpQndCLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFBWCxXQUFXIiwiZmlsZSI6InBhcnNlTW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVjaywgcGF0aE9wdGlvbnN9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0ltcG9ydERvLCBJbXBvcnQsIExvY2FsRGVjbGFyZSwgTG9jYWxEZWNsYXJlcywgTW9kdWxlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXBzLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aWZFbHNlfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtjaGVja0VtcHR5LCBjaGVja05vbkVtcHR5LCBjaGVja0tleXdvcmR9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtqdXN0QmxvY2t9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCB7cGFyc2VMaW5lc30gZnJvbSAnLi9wYXJzZUxpbmUnXG5pbXBvcnQge3BhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lc30gZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5pbXBvcnQgcGFyc2VOYW1lLCB7dHJ5UGFyc2VOYW1lfSBmcm9tICcuL3BhcnNlTmFtZSdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuaW1wb3J0IHRyeVRha2VDb21tZW50IGZyb20gJy4vdHJ5VGFrZUNvbW1lbnQnXG5cbi8qKlxuUGFyc2UgdGhlIHdob2xlIFRva2VuIHRyZWUuXG5AcGFyYW0ge1NsaWNlfSB0b2tlbnNcbkByZXR1cm4ge01vZHVsZX1cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZU1vZHVsZSh0b2tlbnMpIHtcblx0Ly8gTW9kdWxlIGRvYyBjb21tZW50IG11c3QgY29tZSBmaXJzdC5cblx0Y29uc3QgW29wQ29tbWVudCwgcmVzdDBdID0gdHJ5VGFrZUNvbW1lbnQodG9rZW5zKVxuXHQvLyBJbXBvcnQgc3RhdGVtZW50cyBtdXN0IGFwcGVhciBpbiBvcmRlci5cblx0Y29uc3QgW2RvSW1wb3J0cywgcmVzdDFdID0gdGFrZUltcG9ydHMoS2V5d29yZHMuSW1wb3J0RG8sIHJlc3QwKVxuXHRjb25zdCBbcGxhaW5JbXBvcnRzLCByZXN0Ml0gPSB0YWtlSW1wb3J0cyhLZXl3b3Jkcy5JbXBvcnQsIHJlc3QxKVxuXHRjb25zdCBbbGF6eUltcG9ydHMsIHJlc3QzXSA9IHRha2VJbXBvcnRzKEtleXdvcmRzLkltcG9ydExhenksIHJlc3QyKVxuXHRjb25zdCBsaW5lcyA9IHBhcnNlTGluZXMocmVzdDMpXG5cdGNvbnN0IGltcG9ydHMgPSBwbGFpbkltcG9ydHMuY29uY2F0KGxhenlJbXBvcnRzKVxuXHRyZXR1cm4gbmV3IE1vZHVsZSh0b2tlbnMubG9jLCBwYXRoT3B0aW9ucy5tb2R1bGVOYW1lKCksIG9wQ29tbWVudCwgZG9JbXBvcnRzLCBpbXBvcnRzLCBsaW5lcylcbn1cblxuZnVuY3Rpb24gdGFrZUltcG9ydHMoaW1wb3J0S2V5d29yZEtpbmQsIGxpbmVzKSB7XG5cdGlmICghbGluZXMuaXNFbXB0eSgpKSB7XG5cdFx0Y29uc3QgbGluZSA9IGxpbmVzLmhlYWRTbGljZSgpXG5cdFx0aWYgKGlzS2V5d29yZChpbXBvcnRLZXl3b3JkS2luZCwgbGluZS5oZWFkKCkpKVxuXHRcdFx0cmV0dXJuIFtwYXJzZUltcG9ydHMoaW1wb3J0S2V5d29yZEtpbmQsIGxpbmUudGFpbCgpKSwgbGluZXMudGFpbCgpXVxuXHR9XG5cdHJldHVybiBbW10sIGxpbmVzXVxufVxuXG5mdW5jdGlvbiBwYXJzZUltcG9ydHMoaW1wb3J0S2V5d29yZEtpbmQsIHRva2Vucykge1xuXHRjb25zdCBsaW5lcyA9IGp1c3RCbG9jayhpbXBvcnRLZXl3b3JkS2luZCwgdG9rZW5zKVxuXHRyZXR1cm4gbGluZXMubWFwU2xpY2VzKGxpbmUgPT4ge1xuXHRcdGNvbnN0IHtwYXRoLCBuYW1lfSA9IHBhcnNlUmVxdWlyZShsaW5lLmhlYWQoKSlcblx0XHRjb25zdCByZXN0ID0gbGluZS50YWlsKClcblx0XHRpZiAoaW1wb3J0S2V5d29yZEtpbmQgPT09IEtleXdvcmRzLkltcG9ydERvKSB7XG5cdFx0XHRjaGVja0VtcHR5KHJlc3QsICd1bmV4cGVjdGVkQWZ0ZXJJbXBvcnREbycpXG5cdFx0XHRyZXR1cm4gbmV3IEltcG9ydERvKGxpbmUubG9jLCBwYXRoKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCB7aW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdH0gPVxuXHRcdFx0XHRwYXJzZVRoaW5nc0ltcG9ydGVkKG5hbWUsIGltcG9ydEtleXdvcmRLaW5kID09PSBLZXl3b3Jkcy5JbXBvcnRMYXp5LCByZXN0KVxuXHRcdFx0cmV0dXJuIG5ldyBJbXBvcnQobGluZS5sb2MsIHBhdGgsIGltcG9ydGVkLCBvcEltcG9ydERlZmF1bHQpXG5cdFx0fVxuXHR9KVxufVxuXG5mdW5jdGlvbiBwYXJzZVRoaW5nc0ltcG9ydGVkKG5hbWUsIGlzTGF6eSwgdG9rZW5zKSB7XG5cdGNvbnN0IGltcG9ydERlZmF1bHQgPSAoKSA9PlxuXHRcdExvY2FsRGVjbGFyZS51bnR5cGVkKFxuXHRcdFx0dG9rZW5zLmxvYyxcblx0XHRcdG5hbWUsXG5cdFx0XHRpc0xhenkgPyBMb2NhbERlY2xhcmVzLkxhenkgOiBMb2NhbERlY2xhcmVzLkVhZ2VyKVxuXG5cdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdHJldHVybiB7aW1wb3J0ZWQ6IFtdLCBvcEltcG9ydERlZmF1bHQ6IGltcG9ydERlZmF1bHQoKX1cblx0ZWxzZSB7XG5cdFx0Y29uc3QgW29wSW1wb3J0RGVmYXVsdCwgcmVzdF0gPSBpc0tleXdvcmQoS2V5d29yZHMuRm9jdXMsIHRva2Vucy5oZWFkKCkpID9cblx0XHRcdFtpbXBvcnREZWZhdWx0KCksIHRva2Vucy50YWlsKCldIDpcblx0XHRcdFtudWxsLCB0b2tlbnNdXG5cdFx0Y29uc3QgaW1wb3J0ZWQgPSBwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMocmVzdCkubWFwKGwgPT4ge1xuXHRcdFx0Y2hlY2sobC5uYW1lICE9PSAnXycsIGwucG9zLCAoKSA9PiAnbm9JbXBvcnRGb2N1cycpXG5cdFx0XHRpZiAoaXNMYXp5KVxuXHRcdFx0XHRsLmtpbmQgPSBMb2NhbERlY2xhcmVzLkxhenlcblx0XHRcdHJldHVybiBsXG5cdFx0fSlcblx0XHRyZXR1cm4ge2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VSZXF1aXJlKHRva2VuKSB7XG5cdHJldHVybiBpZkVsc2UodHJ5UGFyc2VOYW1lKHRva2VuKSxcblx0XHRuYW1lID0+ICh7cGF0aDogbmFtZSwgbmFtZX0pLFxuXHRcdCgpID0+IHtcblx0XHRcdGNoZWNrKGlzR3JvdXAoR3JvdXBzLlNwYWNlLCB0b2tlbiksIHRva2VuLmxvYywgJ2ludmFsaWRJbXBvcnRNb2R1bGUnKVxuXHRcdFx0Y29uc3QgdG9rZW5zID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cblx0XHRcdC8vIFRha2UgbGVhZGluZyBkb3RzLlxuXHRcdFx0bGV0IHJlc3QgPSB0b2tlbnNcblx0XHRcdGNvbnN0IHBhcnRzID0gW11cblx0XHRcdGNvbnN0IGhlYWQgPSByZXN0LmhlYWQoKVxuXHRcdFx0Y29uc3QgbiA9IHRyeVRha2VORG90cyhoZWFkKVxuXHRcdFx0aWYgKG4gIT09IG51bGwpIHtcblx0XHRcdFx0cGFydHMucHVzaCgnLicpXG5cdFx0XHRcdGZvciAobGV0IGkgPSAxOyBpIDwgbjsgaSA9IGkgKyAxKVxuXHRcdFx0XHRcdHBhcnRzLnB1c2goJy4uJylcblx0XHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdFx0XHRcdHdoaWxlICghcmVzdC5pc0VtcHR5KCkpIHtcblx0XHRcdFx0XHRjb25zdCBuID0gdHJ5VGFrZU5Eb3RzKHJlc3QuaGVhZCgpKVxuXHRcdFx0XHRcdGlmIChuID09PSBudWxsKVxuXHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG47IGkgPSBpICsgMSlcblx0XHRcdFx0XHRcdHBhcnRzLnB1c2goJy4uJylcblx0XHRcdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBUYWtlIG5hbWUsIHRoZW4gYW55IG51bWJlciBvZiBkb3QtdGhlbi1uYW1lIChgLnhgKVxuXHRcdFx0Zm9yICg7Oykge1xuXHRcdFx0XHRjaGVja05vbkVtcHR5KHJlc3QsICdleHBlY3RlZEltcG9ydE1vZHVsZU5hbWUnKVxuXHRcdFx0XHRwYXJ0cy5wdXNoKHBhcnNlTmFtZShyZXN0LmhlYWQoKSkpXG5cdFx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXG5cdFx0XHRcdGlmIChyZXN0LmlzRW1wdHkoKSlcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdC8vIElmIHRoZXJlJ3Mgc29tZXRoaW5nIGxlZnQsIGl0IHNob3VsZCBiZSBhIGRvdCwgZm9sbG93ZWQgYnkgYSBuYW1lLlxuXHRcdFx0XHRjaGVja0tleXdvcmQoS2V5d29yZHMuRG90LCByZXN0LmhlYWQoKSlcblx0XHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7cGF0aDogcGFydHMuam9pbignLycpLCBuYW1lOiBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXX1cblx0XHR9KVxufVxuXG5mdW5jdGlvbiB0cnlUYWtlTkRvdHModG9rZW4pIHtcblx0aWYgKCEodG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkKSlcblx0XHRyZXR1cm4gbnVsbFxuXHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRjYXNlIEtleXdvcmRzLkRvdDpcblx0XHRcdHJldHVybiAxXG5cdFx0Y2FzZSBLZXl3b3Jkcy5Eb3QyOlxuXHRcdFx0cmV0dXJuIDJcblx0XHRjYXNlIEtleXdvcmRzLkRvdDM6XG5cdFx0XHRyZXR1cm4gM1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHR9XG59XG4iXX0=
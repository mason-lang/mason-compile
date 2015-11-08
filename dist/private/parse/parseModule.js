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

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	function parseModule(tokens) {
		var _tryTakeComment = (0, _tryTakeComment4.default)(tokens);

		var _tryTakeComment2 = _slicedToArray(_tryTakeComment, 2);

		const opComment = _tryTakeComment2[0];
		const rest0 = _tryTakeComment2[1];

		var _tryParseImports = tryParseImports(_Token.Keywords.ImportDo, rest0);

		const doImports = _tryParseImports.imports;
		const rest1 = _tryParseImports.rest;

		var _tryParseImports2 = tryParseImports(_Token.Keywords.Import, rest1);

		const plainImports = _tryParseImports2.imports;
		const opImportGlobal = _tryParseImports2.opImportGlobal;
		const rest2 = _tryParseImports2.rest;

		var _tryParseImports3 = tryParseImports(_Token.Keywords.ImportLazy, rest2);

		const lazyImports = _tryParseImports3.imports;
		const rest3 = _tryParseImports3.rest;
		const lines = (0, _parseLine.parseLines)(rest3);
		const imports = plainImports.concat(lazyImports);
		return new _MsAst.Module(tokens.loc, _context.options.moduleName(), opComment, doImports, imports, opImportGlobal, lines);
	}

	function tryParseImports(importKeywordKind, tokens) {
		if (!tokens.isEmpty()) {
			const line0 = tokens.headSlice();

			if ((0, _Token.isKeyword)(importKeywordKind, line0.head())) {
				var _parseImports = parseImports(importKeywordKind, line0.tail());

				const imports = _parseImports.imports;
				const opImportGlobal = _parseImports.opImportGlobal;
				if (importKeywordKind !== _Token.Keywords.Import) (0, _context.check)(opImportGlobal === null, line0.loc, 'Can\'t use global here.');
				return {
					imports,
					opImportGlobal,
					rest: tokens.tail()
				};
			}
		}

		return {
			imports: [],
			opImportGlobal: null,
			rest: tokens
		};
	}

	function parseImports(importKeywordKind, tokens) {
		const lines = (0, _parseBlock.justBlock)(importKeywordKind, tokens);
		let opImportGlobal = null;
		const imports = [];

		for (const line of lines.slices()) {
			var _parseRequire = parseRequire(line.head());

			const path = _parseRequire.path;
			const name = _parseRequire.name;

			if (importKeywordKind === _Token.Keywords.ImportDo) {
				if (line.size() > 1) (0, _checks.unexpected)(line.second());
				imports.push(new _MsAst.ImportDo(line.loc, path));
			} else if (path === 'global') {
				(0, _context.check)(opImportGlobal === null, line.loc, 'Can\'t use global twice');

				var _parseThingsImported = parseThingsImported(name, false, line.tail());

				const imported = _parseThingsImported.imported;
				const opImportDefault = _parseThingsImported.opImportDefault;
				opImportGlobal = new _MsAst.ImportGlobal(line.loc, imported, opImportDefault);
			} else {
				var _parseThingsImported2 = parseThingsImported(name, importKeywordKind === _Token.Keywords.ImportLazy, line.tail());

				const imported = _parseThingsImported2.imported;
				const opImportDefault = _parseThingsImported2.opImportDefault;
				imports.push(new _MsAst.Import(line.loc, path, imported, opImportDefault));
			}
		}

		return {
			imports,
			opImportGlobal
		};
	}

	function parseThingsImported(name, isLazy, tokens) {
		const importDefault = () => _MsAst.LocalDeclare.untyped(tokens.loc, name, isLazy ? _MsAst.LocalDeclares.Lazy : _MsAst.LocalDeclares.Const);

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
				if (!(0, _Token.isKeyword)(_Token.Keywords.Dot, rest.head())) (0, _checks.unexpected)(rest.head());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTW9kdWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFnQndCLFdBQVc7Ozs7Ozs7Ozs7OztVQUFYLFdBQVciLCJmaWxlIjoicGFyc2VNb2R1bGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoZWNrLCBvcHRpb25zfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtJbXBvcnREbywgSW1wb3J0R2xvYmFsLCBJbXBvcnQsIExvY2FsRGVjbGFyZSwgTG9jYWxEZWNsYXJlcywgTW9kdWxlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXBzLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtleXdvcmQsIEtleXdvcmRzLCBzaG93S2V5d29yZH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2NoZWNrTm9uRW1wdHksIHVuZXhwZWN0ZWR9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtqdXN0QmxvY2t9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCB7cGFyc2VMaW5lc30gZnJvbSAnLi9wYXJzZUxpbmUnXG5pbXBvcnQge3BhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lc30gZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5pbXBvcnQgcGFyc2VOYW1lLCB7dHJ5UGFyc2VOYW1lfSBmcm9tICcuL3BhcnNlTmFtZSdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuaW1wb3J0IHRyeVRha2VDb21tZW50IGZyb20gJy4vdHJ5VGFrZUNvbW1lbnQnXG5cbi8qKlxuUGFyc2UgdGhlIHdob2xlIFRva2VuIHRyZWUuXG5AcGFyYW0ge1NsaWNlfSB0b2tlbnNcbkByZXR1cm4ge01vZHVsZX1cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZU1vZHVsZSh0b2tlbnMpIHtcblx0Ly8gTW9kdWxlIGRvYyBjb21tZW50IG11c3QgY29tZSBmaXJzdC5cblx0Y29uc3QgW29wQ29tbWVudCwgcmVzdDBdID0gdHJ5VGFrZUNvbW1lbnQodG9rZW5zKVxuXHQvLyBJbXBvcnQgc3RhdGVtZW50cyBtdXN0IGFwcGVhciBpbiBvcmRlci5cblx0Y29uc3Qge2ltcG9ydHM6IGRvSW1wb3J0cywgcmVzdDogcmVzdDF9ID0gdHJ5UGFyc2VJbXBvcnRzKEtleXdvcmRzLkltcG9ydERvLCByZXN0MClcblx0Y29uc3Qge2ltcG9ydHM6IHBsYWluSW1wb3J0cywgb3BJbXBvcnRHbG9iYWwsIHJlc3Q6IHJlc3QyfSA9XG5cdFx0dHJ5UGFyc2VJbXBvcnRzKEtleXdvcmRzLkltcG9ydCwgcmVzdDEpXG5cdGNvbnN0IHtpbXBvcnRzOiBsYXp5SW1wb3J0cywgcmVzdDogcmVzdDN9ID0gdHJ5UGFyc2VJbXBvcnRzKEtleXdvcmRzLkltcG9ydExhenksIHJlc3QyKVxuXHRjb25zdCBsaW5lcyA9IHBhcnNlTGluZXMocmVzdDMpXG5cdGNvbnN0IGltcG9ydHMgPSBwbGFpbkltcG9ydHMuY29uY2F0KGxhenlJbXBvcnRzKVxuXHRyZXR1cm4gbmV3IE1vZHVsZShcblx0XHR0b2tlbnMubG9jLCBvcHRpb25zLm1vZHVsZU5hbWUoKSwgb3BDb21tZW50LCBkb0ltcG9ydHMsIGltcG9ydHMsIG9wSW1wb3J0R2xvYmFsLCBsaW5lcylcbn1cblxuZnVuY3Rpb24gdHJ5UGFyc2VJbXBvcnRzKGltcG9ydEtleXdvcmRLaW5kLCB0b2tlbnMpIHtcblx0aWYgKCF0b2tlbnMuaXNFbXB0eSgpKSB7XG5cdFx0Y29uc3QgbGluZTAgPSB0b2tlbnMuaGVhZFNsaWNlKClcblx0XHRpZiAoaXNLZXl3b3JkKGltcG9ydEtleXdvcmRLaW5kLCBsaW5lMC5oZWFkKCkpKSB7XG5cdFx0XHRjb25zdCB7aW1wb3J0cywgb3BJbXBvcnRHbG9iYWx9ID0gcGFyc2VJbXBvcnRzKGltcG9ydEtleXdvcmRLaW5kLCBsaW5lMC50YWlsKCkpXG5cdFx0XHRpZiAoaW1wb3J0S2V5d29yZEtpbmQgIT09IEtleXdvcmRzLkltcG9ydClcblx0XHRcdFx0Y2hlY2sob3BJbXBvcnRHbG9iYWwgPT09IG51bGwsIGxpbmUwLmxvYywgJ0NhblxcJ3QgdXNlIGdsb2JhbCBoZXJlLicpXG5cdFx0XHRyZXR1cm4ge2ltcG9ydHMsIG9wSW1wb3J0R2xvYmFsLCByZXN0OiB0b2tlbnMudGFpbCgpfVxuXHRcdH1cblx0fVxuXHRyZXR1cm4ge2ltcG9ydHM6IFtdLCBvcEltcG9ydEdsb2JhbDogbnVsbCwgcmVzdDogdG9rZW5zfVxufVxuXG5mdW5jdGlvbiBwYXJzZUltcG9ydHMoaW1wb3J0S2V5d29yZEtpbmQsIHRva2Vucykge1xuXHRjb25zdCBsaW5lcyA9IGp1c3RCbG9jayhpbXBvcnRLZXl3b3JkS2luZCwgdG9rZW5zKVxuXHRsZXQgb3BJbXBvcnRHbG9iYWwgPSBudWxsXG5cblx0Y29uc3QgaW1wb3J0cyA9IFtdXG5cblx0Zm9yIChjb25zdCBsaW5lIG9mIGxpbmVzLnNsaWNlcygpKSB7XG5cdFx0Y29uc3Qge3BhdGgsIG5hbWV9ID0gcGFyc2VSZXF1aXJlKGxpbmUuaGVhZCgpKVxuXHRcdGlmIChpbXBvcnRLZXl3b3JkS2luZCA9PT0gS2V5d29yZHMuSW1wb3J0RG8pIHtcblx0XHRcdGlmIChsaW5lLnNpemUoKSA+IDEpXG5cdFx0XHRcdHVuZXhwZWN0ZWQobGluZS5zZWNvbmQoKSlcblx0XHRcdGltcG9ydHMucHVzaChuZXcgSW1wb3J0RG8obGluZS5sb2MsIHBhdGgpKVxuXHRcdH0gZWxzZVxuXHRcdFx0aWYgKHBhdGggPT09ICdnbG9iYWwnKSB7XG5cdFx0XHRcdGNoZWNrKG9wSW1wb3J0R2xvYmFsID09PSBudWxsLCBsaW5lLmxvYywgJ0NhblxcJ3QgdXNlIGdsb2JhbCB0d2ljZScpXG5cdFx0XHRcdGNvbnN0IHtpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0fSA9XG5cdFx0XHRcdFx0cGFyc2VUaGluZ3NJbXBvcnRlZChuYW1lLCBmYWxzZSwgbGluZS50YWlsKCkpXG5cdFx0XHRcdG9wSW1wb3J0R2xvYmFsID0gbmV3IEltcG9ydEdsb2JhbChsaW5lLmxvYywgaW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHtpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0fSA9XG5cdFx0XHRcdFx0cGFyc2VUaGluZ3NJbXBvcnRlZChcblx0XHRcdFx0XHRcdG5hbWUsXG5cdFx0XHRcdFx0XHRpbXBvcnRLZXl3b3JkS2luZCA9PT0gS2V5d29yZHMuSW1wb3J0TGF6eSxcblx0XHRcdFx0XHRcdGxpbmUudGFpbCgpKVxuXHRcdFx0XHRpbXBvcnRzLnB1c2gobmV3IEltcG9ydChsaW5lLmxvYywgcGF0aCwgaW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdCkpXG5cdFx0XHR9XG5cdH1cblxuXHRyZXR1cm4ge2ltcG9ydHMsIG9wSW1wb3J0R2xvYmFsfVxufVxuXG5mdW5jdGlvbiBwYXJzZVRoaW5nc0ltcG9ydGVkKG5hbWUsIGlzTGF6eSwgdG9rZW5zKSB7XG5cdGNvbnN0IGltcG9ydERlZmF1bHQgPSAoKSA9PlxuXHRcdExvY2FsRGVjbGFyZS51bnR5cGVkKFxuXHRcdFx0dG9rZW5zLmxvYyxcblx0XHRcdG5hbWUsXG5cdFx0XHRpc0xhenkgPyBMb2NhbERlY2xhcmVzLkxhenkgOiBMb2NhbERlY2xhcmVzLkNvbnN0KVxuXG5cdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdHJldHVybiB7aW1wb3J0ZWQ6IFtdLCBvcEltcG9ydERlZmF1bHQ6IGltcG9ydERlZmF1bHQoKX1cblx0ZWxzZSB7XG5cdFx0Y29uc3QgW29wSW1wb3J0RGVmYXVsdCwgcmVzdF0gPSBpc0tleXdvcmQoS2V5d29yZHMuRm9jdXMsIHRva2Vucy5oZWFkKCkpID9cblx0XHRcdFtpbXBvcnREZWZhdWx0KCksIHRva2Vucy50YWlsKCldIDpcblx0XHRcdFtudWxsLCB0b2tlbnNdXG5cdFx0Y29uc3QgaW1wb3J0ZWQgPSBwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMocmVzdCkubWFwKGwgPT4ge1xuXHRcdFx0Y2hlY2sobC5uYW1lICE9PSAnXycsIGwucG9zLCAoKSA9PlxuXHRcdFx0XHRgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5Gb2N1cyl9IG5vdCBhbGxvd2VkIGFzIGltcG9ydCBuYW1lLmApXG5cdFx0XHRpZiAoaXNMYXp5KVxuXHRcdFx0XHRsLmtpbmQgPSBMb2NhbERlY2xhcmVzLkxhenlcblx0XHRcdHJldHVybiBsXG5cdFx0fSlcblx0XHRyZXR1cm4ge2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VSZXF1aXJlKHRva2VuKSB7XG5cdGNvbnN0IG5hbWUgPSB0cnlQYXJzZU5hbWUodG9rZW4pXG5cdGlmIChuYW1lICE9PSBudWxsKVxuXHRcdHJldHVybiB7cGF0aDogbmFtZSwgbmFtZX1cblx0ZWxzZSB7XG5cdFx0Y2hlY2soaXNHcm91cChHcm91cHMuU3BhY2UsIHRva2VuKSwgdG9rZW4ubG9jLCAnTm90IGEgdmFsaWQgbW9kdWxlIG5hbWUuJylcblx0XHRjb25zdCB0b2tlbnMgPSBTbGljZS5ncm91cCh0b2tlbilcblxuXHRcdC8vIFRha2UgbGVhZGluZyBkb3RzLlxuXHRcdGxldCByZXN0ID0gdG9rZW5zXG5cdFx0Y29uc3QgcGFydHMgPSBbXVxuXHRcdGNvbnN0IGhlYWQgPSByZXN0LmhlYWQoKVxuXHRcdGNvbnN0IG4gPSB0cnlUYWtlTkRvdHMoaGVhZClcblx0XHRpZiAobiAhPT0gbnVsbCkge1xuXHRcdFx0cGFydHMucHVzaCgnLicpXG5cdFx0XHRmb3IgKGxldCBpID0gMTsgaSA8IG47IGkgPSBpICsgMSlcblx0XHRcdFx0cGFydHMucHVzaCgnLi4nKVxuXHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdFx0XHR3aGlsZSAoIXJlc3QuaXNFbXB0eSgpKSB7XG5cdFx0XHRcdGNvbnN0IG4gPSB0cnlUYWtlTkRvdHMocmVzdC5oZWFkKCkpXG5cdFx0XHRcdGlmIChuID09PSBudWxsKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbjsgaSA9IGkgKyAxKVxuXHRcdFx0XHRcdHBhcnRzLnB1c2goJy4uJylcblx0XHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gVGFrZSBuYW1lLCB0aGVuIGFueSBudW1iZXIgb2YgZG90LXRoZW4tbmFtZSAoYC54YClcblx0XHRmb3IgKDs7KSB7XG5cdFx0XHRjaGVja05vbkVtcHR5KHJlc3QpXG5cdFx0XHRwYXJ0cy5wdXNoKHBhcnNlTmFtZShyZXN0LmhlYWQoKSkpXG5cdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblxuXHRcdFx0aWYgKHJlc3QuaXNFbXB0eSgpKVxuXHRcdFx0XHRicmVha1xuXG5cdFx0XHQvLyBJZiB0aGVyZSdzIHNvbWV0aGluZyBsZWZ0LCBpdCBzaG91bGQgYmUgYSBkb3QsIGZvbGxvd2VkIGJ5IGEgbmFtZS5cblx0XHRcdGlmICghaXNLZXl3b3JkKEtleXdvcmRzLkRvdCwgcmVzdC5oZWFkKCkpKVxuXHRcdFx0XHR1bmV4cGVjdGVkKHJlc3QuaGVhZCgpKVxuXHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtwYXRoOiBwYXJ0cy5qb2luKCcvJyksIG5hbWU6IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdfVxuXHR9XG59XG5cbmZ1bmN0aW9uIHRyeVRha2VORG90cyh0b2tlbikge1xuXHRpZiAoISh0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpKVxuXHRcdHJldHVybiBudWxsXG5cdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuRG90OlxuXHRcdFx0cmV0dXJuIDFcblx0XHRjYXNlIEtleXdvcmRzLkRvdDI6XG5cdFx0XHRyZXR1cm4gMlxuXHRcdGNhc2UgS2V5d29yZHMuRG90Mzpcblx0XHRcdHJldHVybiAzXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBudWxsXG5cdH1cbn1cbiJdfQ==
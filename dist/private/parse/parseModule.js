'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../../CompileError', '../context', '../MsAst', '../Token', './checks', './parseBlock', './parseLine', './parseLocalDeclares', './parseName', './Slice', './tryTakeComment'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../../CompileError'), require('../context'), require('../MsAst'), require('../Token'), require('./checks'), require('./parseBlock'), require('./parseLine'), require('./parseLocalDeclares'), require('./parseName'), require('./Slice'), require('./tryTakeComment'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.MsAst, global.Token, global.checks, global.parseBlock, global.parseLine, global.parseLocalDeclares, global.parseName, global.Slice, global.tryTakeComment);
		global.parseModule = mod.exports;
	}
})(this, function (exports, _CompileError, _context, _MsAst, _Token, _checks, _parseBlock, _parseLine, _parseLocalDeclares, _parseName, _Slice, _tryTakeComment3) {
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
				(0, _context.check)(l.name !== '_', l.pos, () => `${ (0, _CompileError.code)('_') } not allowed as import name.`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTW9kdWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFpQndCLFdBQVc7Ozs7Ozs7Ozs7OztVQUFYLFdBQVciLCJmaWxlIjoicGFyc2VNb2R1bGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2ssIG9wdGlvbnN9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0ltcG9ydERvLCBJbXBvcnRHbG9iYWwsIEltcG9ydCwgTG9jYWxEZWNsYXJlLCBMb2NhbERlY2xhcmVzLCBNb2R1bGV9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtHcm91cHMsIGlzR3JvdXAsIGlzS2V5d29yZCwgS2V5d29yZCwgS2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtjaGVja05vbkVtcHR5LCB1bmV4cGVjdGVkfSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7anVzdEJsb2NrfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQge3BhcnNlTGluZXN9IGZyb20gJy4vcGFyc2VMaW5lJ1xuaW1wb3J0IHtwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXN9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuaW1wb3J0IHBhcnNlTmFtZSwge3RyeVBhcnNlTmFtZX0gZnJvbSAnLi9wYXJzZU5hbWUnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcbmltcG9ydCB0cnlUYWtlQ29tbWVudCBmcm9tICcuL3RyeVRha2VDb21tZW50J1xuXG4vKipcblBhcnNlIHRoZSB3aG9sZSBUb2tlbiB0cmVlLlxuQHBhcmFtIHtTbGljZX0gdG9rZW5zXG5AcmV0dXJuIHtNb2R1bGV9XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VNb2R1bGUodG9rZW5zKSB7XG5cdC8vIE1vZHVsZSBkb2MgY29tbWVudCBtdXN0IGNvbWUgZmlyc3QuXG5cdGNvbnN0IFtvcENvbW1lbnQsIHJlc3QwXSA9IHRyeVRha2VDb21tZW50KHRva2Vucylcblx0Ly8gSW1wb3J0IHN0YXRlbWVudHMgbXVzdCBhcHBlYXIgaW4gb3JkZXIuXG5cdGNvbnN0IHtpbXBvcnRzOiBkb0ltcG9ydHMsIHJlc3Q6IHJlc3QxfSA9IHRyeVBhcnNlSW1wb3J0cyhLZXl3b3Jkcy5JbXBvcnREbywgcmVzdDApXG5cdGNvbnN0IHtpbXBvcnRzOiBwbGFpbkltcG9ydHMsIG9wSW1wb3J0R2xvYmFsLCByZXN0OiByZXN0Mn0gPVxuXHRcdHRyeVBhcnNlSW1wb3J0cyhLZXl3b3Jkcy5JbXBvcnQsIHJlc3QxKVxuXHRjb25zdCB7aW1wb3J0czogbGF6eUltcG9ydHMsIHJlc3Q6IHJlc3QzfSA9IHRyeVBhcnNlSW1wb3J0cyhLZXl3b3Jkcy5JbXBvcnRMYXp5LCByZXN0Milcblx0Y29uc3QgbGluZXMgPSBwYXJzZUxpbmVzKHJlc3QzKVxuXHRjb25zdCBpbXBvcnRzID0gcGxhaW5JbXBvcnRzLmNvbmNhdChsYXp5SW1wb3J0cylcblx0cmV0dXJuIG5ldyBNb2R1bGUoXG5cdFx0dG9rZW5zLmxvYywgb3B0aW9ucy5tb2R1bGVOYW1lKCksIG9wQ29tbWVudCwgZG9JbXBvcnRzLCBpbXBvcnRzLCBvcEltcG9ydEdsb2JhbCwgbGluZXMpXG59XG5cbmZ1bmN0aW9uIHRyeVBhcnNlSW1wb3J0cyhpbXBvcnRLZXl3b3JkS2luZCwgdG9rZW5zKSB7XG5cdGlmICghdG9rZW5zLmlzRW1wdHkoKSkge1xuXHRcdGNvbnN0IGxpbmUwID0gdG9rZW5zLmhlYWRTbGljZSgpXG5cdFx0aWYgKGlzS2V5d29yZChpbXBvcnRLZXl3b3JkS2luZCwgbGluZTAuaGVhZCgpKSkge1xuXHRcdFx0Y29uc3Qge2ltcG9ydHMsIG9wSW1wb3J0R2xvYmFsfSA9IHBhcnNlSW1wb3J0cyhpbXBvcnRLZXl3b3JkS2luZCwgbGluZTAudGFpbCgpKVxuXHRcdFx0aWYgKGltcG9ydEtleXdvcmRLaW5kICE9PSBLZXl3b3Jkcy5JbXBvcnQpXG5cdFx0XHRcdGNoZWNrKG9wSW1wb3J0R2xvYmFsID09PSBudWxsLCBsaW5lMC5sb2MsICdDYW5cXCd0IHVzZSBnbG9iYWwgaGVyZS4nKVxuXHRcdFx0cmV0dXJuIHtpbXBvcnRzLCBvcEltcG9ydEdsb2JhbCwgcmVzdDogdG9rZW5zLnRhaWwoKX1cblx0XHR9XG5cdH1cblx0cmV0dXJuIHtpbXBvcnRzOiBbXSwgb3BJbXBvcnRHbG9iYWw6IG51bGwsIHJlc3Q6IHRva2Vuc31cbn1cblxuZnVuY3Rpb24gcGFyc2VJbXBvcnRzKGltcG9ydEtleXdvcmRLaW5kLCB0b2tlbnMpIHtcblx0Y29uc3QgbGluZXMgPSBqdXN0QmxvY2soaW1wb3J0S2V5d29yZEtpbmQsIHRva2Vucylcblx0bGV0IG9wSW1wb3J0R2xvYmFsID0gbnVsbFxuXG5cdGNvbnN0IGltcG9ydHMgPSBbXVxuXG5cdGZvciAoY29uc3QgbGluZSBvZiBsaW5lcy5zbGljZXMoKSkge1xuXHRcdGNvbnN0IHtwYXRoLCBuYW1lfSA9IHBhcnNlUmVxdWlyZShsaW5lLmhlYWQoKSlcblx0XHRpZiAoaW1wb3J0S2V5d29yZEtpbmQgPT09IEtleXdvcmRzLkltcG9ydERvKSB7XG5cdFx0XHRpZiAobGluZS5zaXplKCkgPiAxKVxuXHRcdFx0XHR1bmV4cGVjdGVkKGxpbmUuc2Vjb25kKCkpXG5cdFx0XHRpbXBvcnRzLnB1c2gobmV3IEltcG9ydERvKGxpbmUubG9jLCBwYXRoKSlcblx0XHR9IGVsc2Vcblx0XHRcdGlmIChwYXRoID09PSAnZ2xvYmFsJykge1xuXHRcdFx0XHRjaGVjayhvcEltcG9ydEdsb2JhbCA9PT0gbnVsbCwgbGluZS5sb2MsICdDYW5cXCd0IHVzZSBnbG9iYWwgdHdpY2UnKVxuXHRcdFx0XHRjb25zdCB7aW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdH0gPVxuXHRcdFx0XHRcdHBhcnNlVGhpbmdzSW1wb3J0ZWQobmFtZSwgZmFsc2UsIGxpbmUudGFpbCgpKVxuXHRcdFx0XHRvcEltcG9ydEdsb2JhbCA9IG5ldyBJbXBvcnRHbG9iYWwobGluZS5sb2MsIGltcG9ydGVkLCBvcEltcG9ydERlZmF1bHQpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCB7aW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdH0gPVxuXHRcdFx0XHRcdHBhcnNlVGhpbmdzSW1wb3J0ZWQoXG5cdFx0XHRcdFx0XHRuYW1lLFxuXHRcdFx0XHRcdFx0aW1wb3J0S2V5d29yZEtpbmQgPT09IEtleXdvcmRzLkltcG9ydExhenksXG5cdFx0XHRcdFx0XHRsaW5lLnRhaWwoKSlcblx0XHRcdFx0aW1wb3J0cy5wdXNoKG5ldyBJbXBvcnQobGluZS5sb2MsIHBhdGgsIGltcG9ydGVkLCBvcEltcG9ydERlZmF1bHQpKVxuXHRcdFx0fVxuXHR9XG5cblx0cmV0dXJuIHtpbXBvcnRzLCBvcEltcG9ydEdsb2JhbH1cbn1cblxuZnVuY3Rpb24gcGFyc2VUaGluZ3NJbXBvcnRlZChuYW1lLCBpc0xhenksIHRva2Vucykge1xuXHRjb25zdCBpbXBvcnREZWZhdWx0ID0gKCkgPT5cblx0XHRMb2NhbERlY2xhcmUudW50eXBlZChcblx0XHRcdHRva2Vucy5sb2MsXG5cdFx0XHRuYW1lLFxuXHRcdFx0aXNMYXp5ID8gTG9jYWxEZWNsYXJlcy5MYXp5IDogTG9jYWxEZWNsYXJlcy5Db25zdClcblxuXHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRyZXR1cm4ge2ltcG9ydGVkOiBbXSwgb3BJbXBvcnREZWZhdWx0OiBpbXBvcnREZWZhdWx0KCl9XG5cdGVsc2Uge1xuXHRcdGNvbnN0IFtvcEltcG9ydERlZmF1bHQsIHJlc3RdID0gaXNLZXl3b3JkKEtleXdvcmRzLkZvY3VzLCB0b2tlbnMuaGVhZCgpKSA/XG5cdFx0XHRbaW1wb3J0RGVmYXVsdCgpLCB0b2tlbnMudGFpbCgpXSA6XG5cdFx0XHRbbnVsbCwgdG9rZW5zXVxuXHRcdGNvbnN0IGltcG9ydGVkID0gcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKHJlc3QpLm1hcChsID0+IHtcblx0XHRcdGNoZWNrKGwubmFtZSAhPT0gJ18nLCBsLnBvcywgKCkgPT4gYCR7Y29kZSgnXycpfSBub3QgYWxsb3dlZCBhcyBpbXBvcnQgbmFtZS5gKVxuXHRcdFx0aWYgKGlzTGF6eSlcblx0XHRcdFx0bC5raW5kID0gTG9jYWxEZWNsYXJlcy5MYXp5XG5cdFx0XHRyZXR1cm4gbFxuXHRcdH0pXG5cdFx0cmV0dXJuIHtpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlUmVxdWlyZSh0b2tlbikge1xuXHRjb25zdCBuYW1lID0gdHJ5UGFyc2VOYW1lKHRva2VuKVxuXHRpZiAobmFtZSAhPT0gbnVsbClcblx0XHRyZXR1cm4ge3BhdGg6IG5hbWUsIG5hbWV9XG5cdGVsc2Uge1xuXHRcdGNoZWNrKGlzR3JvdXAoR3JvdXBzLlNwYWNlLCB0b2tlbiksIHRva2VuLmxvYywgJ05vdCBhIHZhbGlkIG1vZHVsZSBuYW1lLicpXG5cdFx0Y29uc3QgdG9rZW5zID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cblx0XHQvLyBUYWtlIGxlYWRpbmcgZG90cy5cblx0XHRsZXQgcmVzdCA9IHRva2Vuc1xuXHRcdGNvbnN0IHBhcnRzID0gW11cblx0XHRjb25zdCBoZWFkID0gcmVzdC5oZWFkKClcblx0XHRjb25zdCBuID0gdHJ5VGFrZU5Eb3RzKGhlYWQpXG5cdFx0aWYgKG4gIT09IG51bGwpIHtcblx0XHRcdHBhcnRzLnB1c2goJy4nKVxuXHRcdFx0Zm9yIChsZXQgaSA9IDE7IGkgPCBuOyBpID0gaSArIDEpXG5cdFx0XHRcdHBhcnRzLnB1c2goJy4uJylcblx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdFx0d2hpbGUgKCFyZXN0LmlzRW1wdHkoKSkge1xuXHRcdFx0XHRjb25zdCBuID0gdHJ5VGFrZU5Eb3RzKHJlc3QuaGVhZCgpKVxuXHRcdFx0XHRpZiAobiA9PT0gbnVsbClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG47IGkgPSBpICsgMSlcblx0XHRcdFx0XHRwYXJ0cy5wdXNoKCcuLicpXG5cdFx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIFRha2UgbmFtZSwgdGhlbiBhbnkgbnVtYmVyIG9mIGRvdC10aGVuLW5hbWUgKGAueGApXG5cdFx0Zm9yICg7Oykge1xuXHRcdFx0Y2hlY2tOb25FbXB0eShyZXN0KVxuXHRcdFx0cGFydHMucHVzaChwYXJzZU5hbWUocmVzdC5oZWFkKCkpKVxuXHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cblx0XHRcdGlmIChyZXN0LmlzRW1wdHkoKSlcblx0XHRcdFx0YnJlYWtcblxuXHRcdFx0Ly8gSWYgdGhlcmUncyBzb21ldGhpbmcgbGVmdCwgaXQgc2hvdWxkIGJlIGEgZG90LCBmb2xsb3dlZCBieSBhIG5hbWUuXG5cdFx0XHRpZiAoIWlzS2V5d29yZChLZXl3b3Jkcy5Eb3QsIHJlc3QuaGVhZCgpKSlcblx0XHRcdFx0dW5leHBlY3RlZChyZXN0LmhlYWQoKSlcblx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdH1cblxuXHRcdHJldHVybiB7cGF0aDogcGFydHMuam9pbignLycpLCBuYW1lOiBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXX1cblx0fVxufVxuXG5mdW5jdGlvbiB0cnlUYWtlTkRvdHModG9rZW4pIHtcblx0aWYgKCEodG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkKSlcblx0XHRyZXR1cm4gbnVsbFxuXHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRjYXNlIEtleXdvcmRzLkRvdDpcblx0XHRcdHJldHVybiAxXG5cdFx0Y2FzZSBLZXl3b3Jkcy5Eb3QyOlxuXHRcdFx0cmV0dXJuIDJcblx0XHRjYXNlIEtleXdvcmRzLkRvdDM6XG5cdFx0XHRyZXR1cm4gM1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHR9XG59XG4iXX0=
(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', '../../CompileError', '../context', '../MsAst', '../Token', './checks', './parseBlock', './parseLocalDeclares', './parseName', './Slice', './tryTakeComment'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('../../CompileError'), require('../context'), require('../MsAst'), require('../Token'), require('./checks'), require('./parseBlock'), require('./parseLocalDeclares'), require('./parseName'), require('./Slice'), require('./tryTakeComment'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.CompileError, global.context, global.MsAst, global.Token, global.checks, global.parseBlock, global.parseLocalDeclares, global.parseName, global.Slice, global.tryTakeComment);
		global.parseModule = mod.exports;
	}
})(this, function (exports, module, _CompileError, _context, _MsAst, _Token, _checks, _parseBlock, _parseLocalDeclares, _parseName, _Slice, _tryTakeComment3) {
	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	module.exports = parseModule;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseName2 = _interopRequireDefault(_parseName);

	var _Slice2 = _interopRequireDefault(_Slice);

	var _tryTakeComment4 = _interopRequireDefault(_tryTakeComment3);

	/**
 Parse the whole Token tree.
 @param {Slice} tokens
 @return {Module}
 */

	function parseModule(tokens) {
		// Module doc comment must come first.

		var _tryTakeComment = (0, _tryTakeComment4.default)(tokens);

		var _tryTakeComment2 = _slicedToArray(_tryTakeComment, 2);

		const opComment = _tryTakeComment2[0];
		const rest0 = _tryTakeComment2[1];

		// Import statements must appear in order.

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

		const lines = (0, _parseBlock.parseModuleBlock)(rest3);

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
				return { imports, opImportGlobal, rest: tokens.tail() };
			}
		}
		return { imports: [], opImportGlobal: null, rest: tokens };
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

		return { imports, opImportGlobal };
	}

	function parseThingsImported(name, isLazy, tokens) {
		const importDefault = () => _MsAst.LocalDeclare.untyped(tokens.loc, name, isLazy ? _MsAst.LocalDeclares.Lazy : _MsAst.LocalDeclares.Const);

		if (tokens.isEmpty()) return { imported: [], opImportDefault: importDefault() };else {
			var _ref = (0, _Token.isKeyword)(_Token.Keywords.Focus, tokens.head()) ? [importDefault(), tokens.tail()] : [null, tokens];

			var _ref2 = _slicedToArray(_ref, 2);

			const opImportDefault = _ref2[0];
			const rest = _ref2[1];

			const imported = (0, _parseLocalDeclares.parseLocalDeclaresJustNames)(rest).map(l => {
				(0, _context.check)(l.name !== '_', l.pos, () => `${ (0, _CompileError.code)('_') } not allowed as import name.`);
				if (isLazy) l.kind = _MsAst.LocalDeclares.Lazy;
				return l;
			});
			return { imported, opImportDefault };
		}
	}

	function parseRequire(token) {
		const name = (0, _parseName.tryParseName)(token);
		if (name !== null) return { path: name, name };else {
			(0, _context.check)((0, _Token.isGroup)(_Token.Groups.Space, token), token.loc, 'Not a valid module name.');
			const tokens = _Slice2.default.group(token);

			// Take leading dots.
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

			// Take name, then any number of dot-then-name (`.x`)
			for (;;) {
				(0, _checks.checkNonEmpty)(rest);
				parts.push((0, _parseName2.default)(rest.head()));
				rest = rest.tail();

				if (rest.isEmpty()) break;

				// If there's something left, it should be a dot, followed by a name.
				if (!(0, _Token.isKeyword)(_Token.Keywords.Dot, rest.head())) (0, _checks.unexpected)(rest.head());
				rest = rest.tail();
			}

			return { path: parts.join('/'), name: parts[parts.length - 1] };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTW9kdWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQWdCd0IsV0FBVzs7Ozs7Ozs7Ozs7Ozs7OztBQUFwQixVQUFTLFdBQVcsQ0FBQyxNQUFNLEVBQUU7Ozt3QkFFaEIsOEJBQWUsTUFBTSxDQUFDOzs7O1FBQTFDLFNBQVM7UUFBRSxLQUFLOzs7O3lCQUVtQixlQUFlLENBQUMsT0FqQmQsUUFBUSxDQWlCZSxRQUFRLEVBQUUsS0FBSyxDQUFDOztRQUFuRSxTQUFTLG9CQUFsQixPQUFPO1FBQW1CLEtBQUssb0JBQVgsSUFBSTs7MEJBRTlCLGVBQWUsQ0FBQyxPQW5CMkIsUUFBUSxDQW1CMUIsTUFBTSxFQUFFLEtBQUssQ0FBQzs7UUFEeEIsWUFBWSxxQkFBckIsT0FBTztRQUFnQixjQUFjLHFCQUFkLGNBQWM7UUFBUSxLQUFLLHFCQUFYLElBQUk7OzBCQUVOLGVBQWUsQ0FBQyxPQXBCaEIsUUFBUSxDQW9CaUIsVUFBVSxFQUFFLEtBQUssQ0FBQzs7UUFBdkUsV0FBVyxxQkFBcEIsT0FBTztRQUFxQixLQUFLLHFCQUFYLElBQUk7O0FBRWpDLFFBQU0sS0FBSyxHQUFHLGdCQXBCSSxnQkFBZ0IsRUFvQkgsS0FBSyxDQUFDLENBQUE7O0FBRXJDLFFBQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDaEQsU0FBTyxXQTFCNkQsTUFBTSxDQTJCekUsTUFBTSxDQUFDLEdBQUcsRUFBRSxTQTVCQyxPQUFPLENBNEJBLFVBQVUsRUFBRSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQTtFQUN4Rjs7QUFFRCxVQUFTLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLEVBQUU7QUFDbkQsTUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRTtBQUN0QixTQUFNLEtB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fSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCBvcHRpb25zfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtJbXBvcnREbywgSW1wb3J0R2xvYmFsLCBJbXBvcnQsIExvY2FsRGVjbGFyZSwgTG9jYWxEZWNsYXJlcywgTW9kdWxlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXBzLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7Y2hlY2tOb25FbXB0eSwgdW5leHBlY3RlZH0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge2p1c3RCbG9jaywgcGFyc2VNb2R1bGVCbG9ja30gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHtwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXN9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuaW1wb3J0IHBhcnNlTmFtZSwge3RyeVBhcnNlTmFtZX0gZnJvbSAnLi9wYXJzZU5hbWUnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcbmltcG9ydCB0cnlUYWtlQ29tbWVudCBmcm9tICcuL3RyeVRha2VDb21tZW50J1xuXG4vKipcblBhcnNlIHRoZSB3aG9sZSBUb2tlbiB0cmVlLlxuQHBhcmFtIHtTbGljZX0gdG9rZW5zXG5AcmV0dXJuIHtNb2R1bGV9XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VNb2R1bGUodG9rZW5zKSB7XG5cdC8vIE1vZHVsZSBkb2MgY29tbWVudCBtdXN0IGNvbWUgZmlyc3QuXG5cdGNvbnN0IFtvcENvbW1lbnQsIHJlc3QwXSA9IHRyeVRha2VDb21tZW50KHRva2Vucylcblx0Ly8gSW1wb3J0IHN0YXRlbWVudHMgbXVzdCBhcHBlYXIgaW4gb3JkZXIuXG5cdGNvbnN0IHtpbXBvcnRzOiBkb0ltcG9ydHMsIHJlc3Q6IHJlc3QxfSA9IHRyeVBhcnNlSW1wb3J0cyhLZXl3b3Jkcy5JbXBvcnREbywgcmVzdDApXG5cdGNvbnN0IHtpbXBvcnRzOiBwbGFpbkltcG9ydHMsIG9wSW1wb3J0R2xvYmFsLCByZXN0OiByZXN0Mn0gPVxuXHRcdHRyeVBhcnNlSW1wb3J0cyhLZXl3b3Jkcy5JbXBvcnQsIHJlc3QxKVxuXHRjb25zdCB7aW1wb3J0czogbGF6eUltcG9ydHMsIHJlc3Q6IHJlc3QzfSA9IHRyeVBhcnNlSW1wb3J0cyhLZXl3b3Jkcy5JbXBvcnRMYXp5LCByZXN0MilcblxuXHRjb25zdCBsaW5lcyA9IHBhcnNlTW9kdWxlQmxvY2socmVzdDMpXG5cblx0Y29uc3QgaW1wb3J0cyA9IHBsYWluSW1wb3J0cy5jb25jYXQobGF6eUltcG9ydHMpXG5cdHJldHVybiBuZXcgTW9kdWxlKFxuXHRcdHRva2Vucy5sb2MsIG9wdGlvbnMubW9kdWxlTmFtZSgpLCBvcENvbW1lbnQsIGRvSW1wb3J0cywgaW1wb3J0cywgb3BJbXBvcnRHbG9iYWwsIGxpbmVzKVxufVxuXG5mdW5jdGlvbiB0cnlQYXJzZUltcG9ydHMoaW1wb3J0S2V5d29yZEtpbmQsIHRva2Vucykge1xuXHRpZiAoIXRva2Vucy5pc0VtcHR5KCkpIHtcblx0XHRjb25zdCBsaW5lMCA9IHRva2Vucy5oZWFkU2xpY2UoKVxuXHRcdGlmIChpc0tleXdvcmQoaW1wb3J0S2V5d29yZEtpbmQsIGxpbmUwLmhlYWQoKSkpIHtcblx0XHRcdGNvbnN0IHtpbXBvcnRzLCBvcEltcG9ydEdsb2JhbH0gPSBwYXJzZUltcG9ydHMoaW1wb3J0S2V5d29yZEtpbmQsIGxpbmUwLnRhaWwoKSlcblx0XHRcdGlmIChpbXBvcnRLZXl3b3JkS2luZCAhPT0gS2V5d29yZHMuSW1wb3J0KVxuXHRcdFx0XHRjaGVjayhvcEltcG9ydEdsb2JhbCA9PT0gbnVsbCwgbGluZTAubG9jLCAnQ2FuXFwndCB1c2UgZ2xvYmFsIGhlcmUuJylcblx0XHRcdHJldHVybiB7aW1wb3J0cywgb3BJbXBvcnRHbG9iYWwsIHJlc3Q6IHRva2Vucy50YWlsKCl9XG5cdFx0fVxuXHR9XG5cdHJldHVybiB7aW1wb3J0czogW10sIG9wSW1wb3J0R2xvYmFsOiBudWxsLCByZXN0OiB0b2tlbnN9XG59XG5cbmZ1bmN0aW9uIHBhcnNlSW1wb3J0cyhpbXBvcnRLZXl3b3JkS2luZCwgdG9rZW5zKSB7XG5cdGNvbnN0IGxpbmVzID0ganVzdEJsb2NrKGltcG9ydEtleXdvcmRLaW5kLCB0b2tlbnMpXG5cdGxldCBvcEltcG9ydEdsb2JhbCA9IG51bGxcblxuXHRjb25zdCBpbXBvcnRzID0gW11cblxuXHRmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMuc2xpY2VzKCkpIHtcblx0XHRjb25zdCB7cGF0aCwgbmFtZX0gPSBwYXJzZVJlcXVpcmUobGluZS5oZWFkKCkpXG5cdFx0aWYgKGltcG9ydEtleXdvcmRLaW5kID09PSBLZXl3b3Jkcy5JbXBvcnREbykge1xuXHRcdFx0aWYgKGxpbmUuc2l6ZSgpID4gMSlcblx0XHRcdFx0dW5leHBlY3RlZChsaW5lLnNlY29uZCgpKVxuXHRcdFx0aW1wb3J0cy5wdXNoKG5ldyBJbXBvcnREbyhsaW5lLmxvYywgcGF0aCkpXG5cdFx0fSBlbHNlXG5cdFx0XHRpZiAocGF0aCA9PT0gJ2dsb2JhbCcpIHtcblx0XHRcdFx0Y2hlY2sob3BJbXBvcnRHbG9iYWwgPT09IG51bGwsIGxpbmUubG9jLCAnQ2FuXFwndCB1c2UgZ2xvYmFsIHR3aWNlJylcblx0XHRcdFx0Y29uc3Qge2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9ID1cblx0XHRcdFx0XHRwYXJzZVRoaW5nc0ltcG9ydGVkKG5hbWUsIGZhbHNlLCBsaW5lLnRhaWwoKSlcblx0XHRcdFx0b3BJbXBvcnRHbG9iYWwgPSBuZXcgSW1wb3J0R2xvYmFsKGxpbmUubG9jLCBpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0KVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qge2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9ID1cblx0XHRcdFx0XHRwYXJzZVRoaW5nc0ltcG9ydGVkKFxuXHRcdFx0XHRcdFx0bmFtZSxcblx0XHRcdFx0XHRcdGltcG9ydEtleXdvcmRLaW5kID09PSBLZXl3b3Jkcy5JbXBvcnRMYXp5LFxuXHRcdFx0XHRcdFx0bGluZS50YWlsKCkpXG5cdFx0XHRcdGltcG9ydHMucHVzaChuZXcgSW1wb3J0KGxpbmUubG9jLCBwYXRoLCBpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0KSlcblx0XHRcdH1cblx0fVxuXG5cdHJldHVybiB7aW1wb3J0cywgb3BJbXBvcnRHbG9iYWx9XG59XG5cbmZ1bmN0aW9uIHBhcnNlVGhpbmdzSW1wb3J0ZWQobmFtZSwgaXNMYXp5LCB0b2tlbnMpIHtcblx0Y29uc3QgaW1wb3J0RGVmYXVsdCA9ICgpID0+XG5cdFx0TG9jYWxEZWNsYXJlLnVudHlwZWQoXG5cdFx0XHR0b2tlbnMubG9jLFxuXHRcdFx0bmFtZSxcblx0XHRcdGlzTGF6eSA/IExvY2FsRGVjbGFyZXMuTGF6eSA6IExvY2FsRGVjbGFyZXMuQ29uc3QpXG5cblx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIHtpbXBvcnRlZDogW10sIG9wSW1wb3J0RGVmYXVsdDogaW1wb3J0RGVmYXVsdCgpfVxuXHRlbHNlIHtcblx0XHRjb25zdCBbb3BJbXBvcnREZWZhdWx0LCByZXN0XSA9IGlzS2V5d29yZChLZXl3b3Jkcy5Gb2N1cywgdG9rZW5zLmhlYWQoKSkgP1xuXHRcdFx0W2ltcG9ydERlZmF1bHQoKSwgdG9rZW5zLnRhaWwoKV0gOlxuXHRcdFx0W251bGwsIHRva2Vuc11cblx0XHRjb25zdCBpbXBvcnRlZCA9IHBhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcyhyZXN0KS5tYXAobCA9PiB7XG5cdFx0XHRjaGVjayhsLm5hbWUgIT09ICdfJywgbC5wb3MsICgpID0+IGAke2NvZGUoJ18nKX0gbm90IGFsbG93ZWQgYXMgaW1wb3J0IG5hbWUuYClcblx0XHRcdGlmIChpc0xhenkpXG5cdFx0XHRcdGwua2luZCA9IExvY2FsRGVjbGFyZXMuTGF6eVxuXHRcdFx0cmV0dXJuIGxcblx0XHR9KVxuXHRcdHJldHVybiB7aW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdH1cblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZVJlcXVpcmUodG9rZW4pIHtcblx0Y29uc3QgbmFtZSA9IHRyeVBhcnNlTmFtZSh0b2tlbilcblx0aWYgKG5hbWUgIT09IG51bGwpXG5cdFx0cmV0dXJuIHtwYXRoOiBuYW1lLCBuYW1lfVxuXHRlbHNlIHtcblx0XHRjaGVjayhpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgdG9rZW4pLCB0b2tlbi5sb2MsICdOb3QgYSB2YWxpZCBtb2R1bGUgbmFtZS4nKVxuXHRcdGNvbnN0IHRva2VucyA9IFNsaWNlLmdyb3VwKHRva2VuKVxuXG5cdFx0Ly8gVGFrZSBsZWFkaW5nIGRvdHMuXG5cdFx0bGV0IHJlc3QgPSB0b2tlbnNcblx0XHRjb25zdCBwYXJ0cyA9IFtdXG5cdFx0Y29uc3QgaGVhZCA9IHJlc3QuaGVhZCgpXG5cdFx0Y29uc3QgbiA9IHRyeVRha2VORG90cyhoZWFkKVxuXHRcdGlmIChuICE9PSBudWxsKSB7XG5cdFx0XHRwYXJ0cy5wdXNoKCcuJylcblx0XHRcdGZvciAobGV0IGkgPSAxOyBpIDwgbjsgaSA9IGkgKyAxKVxuXHRcdFx0XHRwYXJ0cy5wdXNoKCcuLicpXG5cdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHRcdHdoaWxlICghcmVzdC5pc0VtcHR5KCkpIHtcblx0XHRcdFx0Y29uc3QgbiA9IHRyeVRha2VORG90cyhyZXN0LmhlYWQoKSlcblx0XHRcdFx0aWYgKG4gPT09IG51bGwpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpID0gaSArIDEpXG5cdFx0XHRcdFx0cGFydHMucHVzaCgnLi4nKVxuXHRcdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBUYWtlIG5hbWUsIHRoZW4gYW55IG51bWJlciBvZiBkb3QtdGhlbi1uYW1lIChgLnhgKVxuXHRcdGZvciAoOzspIHtcblx0XHRcdGNoZWNrTm9uRW1wdHkocmVzdClcblx0XHRcdHBhcnRzLnB1c2gocGFyc2VOYW1lKHJlc3QuaGVhZCgpKSlcblx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXG5cdFx0XHRpZiAocmVzdC5pc0VtcHR5KCkpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdC8vIElmIHRoZXJlJ3Mgc29tZXRoaW5nIGxlZnQsIGl0IHNob3VsZCBiZSBhIGRvdCwgZm9sbG93ZWQgYnkgYSBuYW1lLlxuXHRcdFx0aWYgKCFpc0tleXdvcmQoS2V5d29yZHMuRG90LCByZXN0LmhlYWQoKSkpXG5cdFx0XHRcdHVuZXhwZWN0ZWQocmVzdC5oZWFkKCkpXG5cdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHR9XG5cblx0XHRyZXR1cm4ge3BhdGg6IHBhcnRzLmpvaW4oJy8nKSwgbmFtZTogcGFydHNbcGFydHMubGVuZ3RoIC0gMV19XG5cdH1cbn1cblxuZnVuY3Rpb24gdHJ5VGFrZU5Eb3RzKHRva2VuKSB7XG5cdGlmICghKHRva2VuIGluc3RhbmNlb2YgS2V5d29yZCkpXG5cdFx0cmV0dXJuIG51bGxcblx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0Y2FzZSBLZXl3b3Jkcy5Eb3Q6XG5cdFx0XHRyZXR1cm4gMVxuXHRcdGNhc2UgS2V5d29yZHMuRG90Mjpcblx0XHRcdHJldHVybiAyXG5cdFx0Y2FzZSBLZXl3b3Jkcy5Eb3QzOlxuXHRcdFx0cmV0dXJuIDNcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIG51bGxcblx0fVxufVxuIl19
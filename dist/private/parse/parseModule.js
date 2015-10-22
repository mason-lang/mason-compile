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

			// Take leading dots. There can be any number, so count ellipsis as 3 dots in a row.
			let rest = tokens;
			const parts = [];
			const isDotty = _ => (0, _Token.isKeyword)(_Token.Keywords.Dot, _) || (0, _Token.isKeyword)(_Token.Keywords.Ellipsis, _);
			const head = rest.head();
			if (isDotty(head)) {
				parts.push('.');
				if ((0, _Token.isKeyword)(_Token.Keywords.Ellipsis, head)) {
					parts.push('..');
					parts.push('..');
				}
				rest = rest.tail();

				while (!rest.isEmpty() && isDotty(rest.head())) {
					parts.push('..');
					if ((0, _Token.isKeyword)(_Token.Keywords.Ellipsis, rest.head())) {
						parts.push('..');
						parts.push('..');
					}
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTW9kdWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQWdCd0IsV0FBVzs7Ozs7Ozs7Ozs7Ozs7OztBQUFwQixVQUFTLFdBQVcsQ0FBQyxNQUFNLEVBQUU7Ozt3QkFFaEIsOEJBQWUsTUFBTSxDQUFDOzs7O1FBQTFDLFNBQVM7UUFBRSxLQUFLOzs7O3lCQUVtQixlQUFlLENBQUMsT0FqQnZCLFFBQVEsQ0FpQndCLFFBQVEsRUFBRSxLQUFLLENBQUM7O1FBQW5FLFNBQVMsb0JBQWxCLE9BQU87UUFBbUIsS0FBSyxvQkFBWCxJQUFJOzswQkFFOUIsZUFBZSxDQUFDLE9BbkJrQixRQUFRLENBbUJqQixNQUFNLEVBQUUsS0FBSyxDQUFDOztRQUR4QixZQUFZLHFCQUFyQixPQUFPO1FBQWdCLGNBQWMscUJBQWQsY0FBYztRQUFRLEtBQUsscUJBQVgsSUFBSTs7MEJBRU4sZUFBZSxDQUFDLE9BcEJ6QixRQUFRLENBb0IwQixVQUFVLEVBQUUsS0FBSyxDQUFDOztRQUF2RSxXQUFXLHFCQUFwQixPQUFPO1FBQXFCLEtBQUsscUJBQVgsSUFBSTs7QUFFakMsUUFBTSxLQUFLLEdBQUcsZ0JBcEJJLGdCQUFnQixFQW9CSCxLQUFLLENBQUMsQ0FBQTs7QUFFckMsUUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUNoRCxTQUFPLFdBMUI2RCxNQUFNLENBMkJ6RSxNQUFNLENBQUMsR0FBRyxFQUFFLFNBNUJDLE9BQU8sQ0E0QkEsVUFBVSxFQUFFLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFBO0VBQ3hGOztBQUVELFVBQVMsZUFBZSxDQUFDLGlCQUFpQixFQUFFLE1BQU0sRUFBRTtBQUNuRCxNQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFO0FBQ3RCLFNBQU0s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SSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUU7QUFDOUMsV0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNoQixXQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO01BQ2hCO0FBQ0QsU0FBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtLQUNsQjtJQUNEOzs7QUFHRCxZQUFTO0FBQ1IsZ0JBaklLLGFBQWEsRUFpSUosSUFBSSxDQUFDLENBQUE7QUFDbkIsU0FBSyxDQUFDLElBQUksQ0FBQyx5QkFBVSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ2xDLFFBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7O0FBRWxCLFFBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUNqQixNQUFLOzs7QUFHTixRQUFJLENBQUMsV0ExSWlCLFNBQVMsRUEwSWhCLE9BMUlrQixRQUFRLENBMElqQixHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQ3hDLFlBMUltQixVQUFVLEVBMElsQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUN4QixRQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO0lBQ2xCOztBQUVELFVBQU8sRUFBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQTtHQUM3RDtFQUNEIiwiZmlsZSI6InBhcnNlTW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCBvcHRpb25zfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtJbXBvcnREbywgSW1wb3J0R2xvYmFsLCBJbXBvcnQsIExvY2FsRGVjbGFyZSwgTG9jYWxEZWNsYXJlcywgTW9kdWxlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXBzLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7Y2hlY2tOb25FbXB0eSwgdW5leHBlY3RlZH0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge2p1c3RCbG9jaywgcGFyc2VNb2R1bGVCbG9ja30gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHtwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXN9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuaW1wb3J0IHBhcnNlTmFtZSwge3RyeVBhcnNlTmFtZX0gZnJvbSAnLi9wYXJzZU5hbWUnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcbmltcG9ydCB0cnlUYWtlQ29tbWVudCBmcm9tICcuL3RyeVRha2VDb21tZW50J1xuXG4vKipcblBhcnNlIHRoZSB3aG9sZSBUb2tlbiB0cmVlLlxuQHBhcmFtIHtTbGljZX0gdG9rZW5zXG5AcmV0dXJuIHtNb2R1bGV9XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VNb2R1bGUodG9rZW5zKSB7XG5cdC8vIE1vZHVsZSBkb2MgY29tbWVudCBtdXN0IGNvbWUgZmlyc3QuXG5cdGNvbnN0IFtvcENvbW1lbnQsIHJlc3QwXSA9IHRyeVRha2VDb21tZW50KHRva2Vucylcblx0Ly8gSW1wb3J0IHN0YXRlbWVudHMgbXVzdCBhcHBlYXIgaW4gb3JkZXIuXG5cdGNvbnN0IHtpbXBvcnRzOiBkb0ltcG9ydHMsIHJlc3Q6IHJlc3QxfSA9IHRyeVBhcnNlSW1wb3J0cyhLZXl3b3Jkcy5JbXBvcnREbywgcmVzdDApXG5cdGNvbnN0IHtpbXBvcnRzOiBwbGFpbkltcG9ydHMsIG9wSW1wb3J0R2xvYmFsLCByZXN0OiByZXN0Mn0gPVxuXHRcdHRyeVBhcnNlSW1wb3J0cyhLZXl3b3Jkcy5JbXBvcnQsIHJlc3QxKVxuXHRjb25zdCB7aW1wb3J0czogbGF6eUltcG9ydHMsIHJlc3Q6IHJlc3QzfSA9IHRyeVBhcnNlSW1wb3J0cyhLZXl3b3Jkcy5JbXBvcnRMYXp5LCByZXN0MilcblxuXHRjb25zdCBsaW5lcyA9IHBhcnNlTW9kdWxlQmxvY2socmVzdDMpXG5cblx0Y29uc3QgaW1wb3J0cyA9IHBsYWluSW1wb3J0cy5jb25jYXQobGF6eUltcG9ydHMpXG5cdHJldHVybiBuZXcgTW9kdWxlKFxuXHRcdHRva2Vucy5sb2MsIG9wdGlvbnMubW9kdWxlTmFtZSgpLCBvcENvbW1lbnQsIGRvSW1wb3J0cywgaW1wb3J0cywgb3BJbXBvcnRHbG9iYWwsIGxpbmVzKVxufVxuXG5mdW5jdGlvbiB0cnlQYXJzZUltcG9ydHMoaW1wb3J0S2V5d29yZEtpbmQsIHRva2Vucykge1xuXHRpZiAoIXRva2Vucy5pc0VtcHR5KCkpIHtcblx0XHRjb25zdCBsaW5lMCA9IHRva2Vucy5oZWFkU2xpY2UoKVxuXHRcdGlmIChpc0tleXdvcmQoaW1wb3J0S2V5d29yZEtpbmQsIGxpbmUwLmhlYWQoKSkpIHtcblx0XHRcdGNvbnN0IHtpbXBvcnRzLCBvcEltcG9ydEdsb2JhbH0gPSBwYXJzZUltcG9ydHMoaW1wb3J0S2V5d29yZEtpbmQsIGxpbmUwLnRhaWwoKSlcblx0XHRcdGlmIChpbXBvcnRLZXl3b3JkS2luZCAhPT0gS2V5d29yZHMuSW1wb3J0KVxuXHRcdFx0XHRjaGVjayhvcEltcG9ydEdsb2JhbCA9PT0gbnVsbCwgbGluZTAubG9jLCAnQ2FuXFwndCB1c2UgZ2xvYmFsIGhlcmUuJylcblx0XHRcdHJldHVybiB7aW1wb3J0cywgb3BJbXBvcnRHbG9iYWwsIHJlc3Q6IHRva2Vucy50YWlsKCl9XG5cdFx0fVxuXHR9XG5cdHJldHVybiB7aW1wb3J0czogW10sIG9wSW1wb3J0R2xvYmFsOiBudWxsLCByZXN0OiB0b2tlbnN9XG59XG5cbmZ1bmN0aW9uIHBhcnNlSW1wb3J0cyhpbXBvcnRLZXl3b3JkS2luZCwgdG9rZW5zKSB7XG5cdGNvbnN0IGxpbmVzID0ganVzdEJsb2NrKGltcG9ydEtleXdvcmRLaW5kLCB0b2tlbnMpXG5cdGxldCBvcEltcG9ydEdsb2JhbCA9IG51bGxcblxuXHRjb25zdCBpbXBvcnRzID0gW11cblxuXHRmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMuc2xpY2VzKCkpIHtcblx0XHRjb25zdCB7cGF0aCwgbmFtZX0gPSBwYXJzZVJlcXVpcmUobGluZS5oZWFkKCkpXG5cdFx0aWYgKGltcG9ydEtleXdvcmRLaW5kID09PSBLZXl3b3Jkcy5JbXBvcnREbykge1xuXHRcdFx0aWYgKGxpbmUuc2l6ZSgpID4gMSlcblx0XHRcdFx0dW5leHBlY3RlZChsaW5lLnNlY29uZCgpKVxuXHRcdFx0aW1wb3J0cy5wdXNoKG5ldyBJbXBvcnREbyhsaW5lLmxvYywgcGF0aCkpXG5cdFx0fSBlbHNlXG5cdFx0XHRpZiAocGF0aCA9PT0gJ2dsb2JhbCcpIHtcblx0XHRcdFx0Y2hlY2sob3BJbXBvcnRHbG9iYWwgPT09IG51bGwsIGxpbmUubG9jLCAnQ2FuXFwndCB1c2UgZ2xvYmFsIHR3aWNlJylcblx0XHRcdFx0Y29uc3Qge2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9ID1cblx0XHRcdFx0XHRwYXJzZVRoaW5nc0ltcG9ydGVkKG5hbWUsIGZhbHNlLCBsaW5lLnRhaWwoKSlcblx0XHRcdFx0b3BJbXBvcnRHbG9iYWwgPSBuZXcgSW1wb3J0R2xvYmFsKGxpbmUubG9jLCBpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0KVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qge2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9ID1cblx0XHRcdFx0XHRwYXJzZVRoaW5nc0ltcG9ydGVkKFxuXHRcdFx0XHRcdFx0bmFtZSxcblx0XHRcdFx0XHRcdGltcG9ydEtleXdvcmRLaW5kID09PSBLZXl3b3Jkcy5JbXBvcnRMYXp5LFxuXHRcdFx0XHRcdFx0bGluZS50YWlsKCkpXG5cdFx0XHRcdGltcG9ydHMucHVzaChuZXcgSW1wb3J0KGxpbmUubG9jLCBwYXRoLCBpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0KSlcblx0XHRcdH1cblx0fVxuXG5cdHJldHVybiB7aW1wb3J0cywgb3BJbXBvcnRHbG9iYWx9XG59XG5cbmZ1bmN0aW9uIHBhcnNlVGhpbmdzSW1wb3J0ZWQobmFtZSwgaXNMYXp5LCB0b2tlbnMpIHtcblx0Y29uc3QgaW1wb3J0RGVmYXVsdCA9ICgpID0+XG5cdFx0TG9jYWxEZWNsYXJlLnVudHlwZWQoXG5cdFx0XHR0b2tlbnMubG9jLFxuXHRcdFx0bmFtZSxcblx0XHRcdGlzTGF6eSA/IExvY2FsRGVjbGFyZXMuTGF6eSA6IExvY2FsRGVjbGFyZXMuQ29uc3QpXG5cblx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIHtpbXBvcnRlZDogW10sIG9wSW1wb3J0RGVmYXVsdDogaW1wb3J0RGVmYXVsdCgpfVxuXHRlbHNlIHtcblx0XHRjb25zdCBbb3BJbXBvcnREZWZhdWx0LCByZXN0XSA9IGlzS2V5d29yZChLZXl3b3Jkcy5Gb2N1cywgdG9rZW5zLmhlYWQoKSkgP1xuXHRcdFx0W2ltcG9ydERlZmF1bHQoKSwgdG9rZW5zLnRhaWwoKV0gOlxuXHRcdFx0W251bGwsIHRva2Vuc11cblx0XHRjb25zdCBpbXBvcnRlZCA9IHBhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcyhyZXN0KS5tYXAobCA9PiB7XG5cdFx0XHRjaGVjayhsLm5hbWUgIT09ICdfJywgbC5wb3MsICgpID0+IGAke2NvZGUoJ18nKX0gbm90IGFsbG93ZWQgYXMgaW1wb3J0IG5hbWUuYClcblx0XHRcdGlmIChpc0xhenkpXG5cdFx0XHRcdGwua2luZCA9IExvY2FsRGVjbGFyZXMuTGF6eVxuXHRcdFx0cmV0dXJuIGxcblx0XHR9KVxuXHRcdHJldHVybiB7aW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdH1cblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZVJlcXVpcmUodG9rZW4pIHtcblx0Y29uc3QgbmFtZSA9IHRyeVBhcnNlTmFtZSh0b2tlbilcblx0aWYgKG5hbWUgIT09IG51bGwpXG5cdFx0cmV0dXJuIHtwYXRoOiBuYW1lLCBuYW1lfVxuXHRlbHNlIHtcblx0XHRjaGVjayhpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgdG9rZW4pLCB0b2tlbi5sb2MsICdOb3QgYSB2YWxpZCBtb2R1bGUgbmFtZS4nKVxuXHRcdGNvbnN0IHRva2VucyA9IFNsaWNlLmdyb3VwKHRva2VuKVxuXG5cdFx0Ly8gVGFrZSBsZWFkaW5nIGRvdHMuIFRoZXJlIGNhbiBiZSBhbnkgbnVtYmVyLCBzbyBjb3VudCBlbGxpcHNpcyBhcyAzIGRvdHMgaW4gYSByb3cuXG5cdFx0bGV0IHJlc3QgPSB0b2tlbnNcblx0XHRjb25zdCBwYXJ0cyA9IFtdXG5cdFx0Y29uc3QgaXNEb3R0eSA9IF8gPT5cblx0XHRcdGlzS2V5d29yZChLZXl3b3Jkcy5Eb3QsIF8pIHx8IGlzS2V5d29yZChLZXl3b3Jkcy5FbGxpcHNpcywgXylcblx0XHRjb25zdCBoZWFkID0gcmVzdC5oZWFkKClcblx0XHRpZiAoaXNEb3R0eShoZWFkKSkge1xuXHRcdFx0cGFydHMucHVzaCgnLicpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkVsbGlwc2lzLCBoZWFkKSkge1xuXHRcdFx0XHRwYXJ0cy5wdXNoKCcuLicpXG5cdFx0XHRcdHBhcnRzLnB1c2goJy4uJylcblx0XHRcdH1cblx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXG5cdFx0XHR3aGlsZSAoIXJlc3QuaXNFbXB0eSgpICYmIGlzRG90dHkocmVzdC5oZWFkKCkpKSB7XG5cdFx0XHRcdHBhcnRzLnB1c2goJy4uJylcblx0XHRcdFx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5FbGxpcHNpcywgcmVzdC5oZWFkKCkpKSB7XG5cdFx0XHRcdFx0cGFydHMucHVzaCgnLi4nKVxuXHRcdFx0XHRcdHBhcnRzLnB1c2goJy4uJylcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBUYWtlIG5hbWUsIHRoZW4gYW55IG51bWJlciBvZiBkb3QtdGhlbi1uYW1lIChgLnhgKVxuXHRcdGZvciAoOzspIHtcblx0XHRcdGNoZWNrTm9uRW1wdHkocmVzdClcblx0XHRcdHBhcnRzLnB1c2gocGFyc2VOYW1lKHJlc3QuaGVhZCgpKSlcblx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXG5cdFx0XHRpZiAocmVzdC5pc0VtcHR5KCkpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdC8vIElmIHRoZXJlJ3Mgc29tZXRoaW5nIGxlZnQsIGl0IHNob3VsZCBiZSBhIGRvdCwgZm9sbG93ZWQgYnkgYSBuYW1lLlxuXHRcdFx0aWYgKCFpc0tleXdvcmQoS2V5d29yZHMuRG90LCByZXN0LmhlYWQoKSkpXG5cdFx0XHRcdHVuZXhwZWN0ZWQocmVzdC5oZWFkKCkpXG5cdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHR9XG5cblx0XHRyZXR1cm4ge3BhdGg6IHBhcnRzLmpvaW4oJy8nKSwgbmFtZTogcGFydHNbcGFydHMubGVuZ3RoIC0gMV19XG5cdH1cbn1cbiJdfQ==
if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../../CompileError', '../context', '../MsAst', '../Token', './checks', './parseBlock', './parseLocalDeclares', './parseName', './Slice', './tryTakeComment'], function (exports, module, _CompileError, _context, _MsAst, _Token, _checks, _parseBlock, _parseLocalDeclares, _parseName, _Slice, _tryTakeComment3) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlTW9kdWxlLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZU1vZHVsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7a0JDZ0J3QixXQUFXOzs7Ozs7Ozs7Ozs7Ozs7O0FBQXBCLFVBQVMsV0FBVyxDQUFDLE1BQU0sRUFBRTs7O3dCQUVoQiw4QkFBZSxNQUFNLENBQUM7Ozs7UUFBMUMsU0FBUztRQUFFLEtBQUs7Ozs7eUJBRW1CLGVBQWUsQ0FBQyxPQWpCdkIsUUFBUSxDQWlCd0IsUUFBUSxFQUFFLEtBQUssQ0FBQzs7UUFBbkUsU0FBUyxvQkFBbEIsT0FBTztRQUFtQixLQUFLLG9CQUFYLElBQUk7OzBCQUU5QixlQUFlLENBQUMsT0FuQmtCLFFBQVEsQ0FtQmpCLE1BQU0sRUFBRSxLQUFLLENBQUM7O1FBRHhCLFlBQVkscUJBQXJCLE9BQU87UUFBZ0IsY0FBYyxxQkFBZCxjQUFjO1FBQVEsS0FBSyxxQkFBWCxJQUFJOzswQkFFTixlQUFlLENBQUMsT0FwQnpCLFFBQVEsQ0FvQjBCLFVBQVUsRUFBRSxLQUFLLENBQUM7O1FBQXZFLFdBQVcscUJBQXBCLE9BQU87UUFBcUIsS0FBSyxxQkFBWCxJQUFJOztBQUVqQyxRQUFNLEtBQUssR0FBRyxnQkFwQkksZ0JBQWdCLEVBb0JILEtBQUssQ0FBQyxDQUFBOztBQUVyQyxRQUFNLE9BQU8sR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ2hELFNBQU8sV0ExQjZELE1BQU0sQ0EyQnpFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsU0E1QkMsT0FBTyxDQTRCQSxVQUFVLEVBQUUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUE7RUFDeEY7O0FBRUQsVUFBUyxlQUFlLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxFQUFFO0FBQ25ELE1BQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDdEIsU0FBTSxLQUFL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QUMsSUFBSSxFQUFFLENBQUMsRUFBRTtBQUM5QyxXQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2hCLFdBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7TUFDaEI7QUFDRCxTQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO0tBQ2xCO0lBQ0Q7OztBQUdELFlBQVM7QUFDUixnQkFqSUssYUFBYSxFQWlJSixJQUFJLENBQUMsQ0FBQTtBQUNuQixTQUFLLENBQUMsSUFBSSxDQUFDLHlCQUFVLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDbEMsUUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTs7QUFFbEIsUUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQ2pCLE1BQUs7OztBQUdOLFFBQUksQ0FBQyxXQTFJaUIsU0FBUyxFQTBJaEIsT0ExSWtCLFFBQVEsQ0EwSWpCLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFDeEMsWUExSW1CLFVBQVUsRUEwSWxCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQ3hCLFFBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7SUFDbEI7O0FBRUQsVUFBTyxFQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBQyxDQUFBO0dBQzdEO0VBQ0QiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9wYXJzZU1vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCBvcHRpb25zfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtJbXBvcnREbywgSW1wb3J0R2xvYmFsLCBJbXBvcnQsIExvY2FsRGVjbGFyZSwgTG9jYWxEZWNsYXJlcywgTW9kdWxlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXBzLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7Y2hlY2tOb25FbXB0eSwgdW5leHBlY3RlZH0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge2p1c3RCbG9jaywgcGFyc2VNb2R1bGVCbG9ja30gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHtwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXN9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuaW1wb3J0IHBhcnNlTmFtZSwge3RyeVBhcnNlTmFtZX0gZnJvbSAnLi9wYXJzZU5hbWUnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcbmltcG9ydCB0cnlUYWtlQ29tbWVudCBmcm9tICcuL3RyeVRha2VDb21tZW50J1xuXG4vKipcblBhcnNlIHRoZSB3aG9sZSBUb2tlbiB0cmVlLlxuQHBhcmFtIHtTbGljZX0gdG9rZW5zXG5AcmV0dXJuIHtNb2R1bGV9XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VNb2R1bGUodG9rZW5zKSB7XG5cdC8vIE1vZHVsZSBkb2MgY29tbWVudCBtdXN0IGNvbWUgZmlyc3QuXG5cdGNvbnN0IFtvcENvbW1lbnQsIHJlc3QwXSA9IHRyeVRha2VDb21tZW50KHRva2Vucylcblx0Ly8gSW1wb3J0IHN0YXRlbWVudHMgbXVzdCBhcHBlYXIgaW4gb3JkZXIuXG5cdGNvbnN0IHtpbXBvcnRzOiBkb0ltcG9ydHMsIHJlc3Q6IHJlc3QxfSA9IHRyeVBhcnNlSW1wb3J0cyhLZXl3b3Jkcy5JbXBvcnREbywgcmVzdDApXG5cdGNvbnN0IHtpbXBvcnRzOiBwbGFpbkltcG9ydHMsIG9wSW1wb3J0R2xvYmFsLCByZXN0OiByZXN0Mn0gPVxuXHRcdHRyeVBhcnNlSW1wb3J0cyhLZXl3b3Jkcy5JbXBvcnQsIHJlc3QxKVxuXHRjb25zdCB7aW1wb3J0czogbGF6eUltcG9ydHMsIHJlc3Q6IHJlc3QzfSA9IHRyeVBhcnNlSW1wb3J0cyhLZXl3b3Jkcy5JbXBvcnRMYXp5LCByZXN0MilcblxuXHRjb25zdCBsaW5lcyA9IHBhcnNlTW9kdWxlQmxvY2socmVzdDMpXG5cblx0Y29uc3QgaW1wb3J0cyA9IHBsYWluSW1wb3J0cy5jb25jYXQobGF6eUltcG9ydHMpXG5cdHJldHVybiBuZXcgTW9kdWxlKFxuXHRcdHRva2Vucy5sb2MsIG9wdGlvbnMubW9kdWxlTmFtZSgpLCBvcENvbW1lbnQsIGRvSW1wb3J0cywgaW1wb3J0cywgb3BJbXBvcnRHbG9iYWwsIGxpbmVzKVxufVxuXG5mdW5jdGlvbiB0cnlQYXJzZUltcG9ydHMoaW1wb3J0S2V5d29yZEtpbmQsIHRva2Vucykge1xuXHRpZiAoIXRva2Vucy5pc0VtcHR5KCkpIHtcblx0XHRjb25zdCBsaW5lMCA9IHRva2Vucy5oZWFkU2xpY2UoKVxuXHRcdGlmIChpc0tleXdvcmQoaW1wb3J0S2V5d29yZEtpbmQsIGxpbmUwLmhlYWQoKSkpIHtcblx0XHRcdGNvbnN0IHtpbXBvcnRzLCBvcEltcG9ydEdsb2JhbH0gPSBwYXJzZUltcG9ydHMoaW1wb3J0S2V5d29yZEtpbmQsIGxpbmUwLnRhaWwoKSlcblx0XHRcdGlmIChpbXBvcnRLZXl3b3JkS2luZCAhPT0gS2V5d29yZHMuSW1wb3J0KVxuXHRcdFx0XHRjaGVjayhvcEltcG9ydEdsb2JhbCA9PT0gbnVsbCwgbGluZTAubG9jLCAnQ2FuXFwndCB1c2UgZ2xvYmFsIGhlcmUuJylcblx0XHRcdHJldHVybiB7aW1wb3J0cywgb3BJbXBvcnRHbG9iYWwsIHJlc3Q6IHRva2Vucy50YWlsKCl9XG5cdFx0fVxuXHR9XG5cdHJldHVybiB7aW1wb3J0czogW10sIG9wSW1wb3J0R2xvYmFsOiBudWxsLCByZXN0OiB0b2tlbnN9XG59XG5cbmZ1bmN0aW9uIHBhcnNlSW1wb3J0cyhpbXBvcnRLZXl3b3JkS2luZCwgdG9rZW5zKSB7XG5cdGNvbnN0IGxpbmVzID0ganVzdEJsb2NrKGltcG9ydEtleXdvcmRLaW5kLCB0b2tlbnMpXG5cdGxldCBvcEltcG9ydEdsb2JhbCA9IG51bGxcblxuXHRjb25zdCBpbXBvcnRzID0gW11cblxuXHRmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMuc2xpY2VzKCkpIHtcblx0XHRjb25zdCB7cGF0aCwgbmFtZX0gPSBwYXJzZVJlcXVpcmUobGluZS5oZWFkKCkpXG5cdFx0aWYgKGltcG9ydEtleXdvcmRLaW5kID09PSBLZXl3b3Jkcy5JbXBvcnREbykge1xuXHRcdFx0aWYgKGxpbmUuc2l6ZSgpID4gMSlcblx0XHRcdFx0dW5leHBlY3RlZChsaW5lLnNlY29uZCgpKVxuXHRcdFx0aW1wb3J0cy5wdXNoKG5ldyBJbXBvcnREbyhsaW5lLmxvYywgcGF0aCkpXG5cdFx0fSBlbHNlXG5cdFx0XHRpZiAocGF0aCA9PT0gJ2dsb2JhbCcpIHtcblx0XHRcdFx0Y2hlY2sob3BJbXBvcnRHbG9iYWwgPT09IG51bGwsIGxpbmUubG9jLCAnQ2FuXFwndCB1c2UgZ2xvYmFsIHR3aWNlJylcblx0XHRcdFx0Y29uc3Qge2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9ID1cblx0XHRcdFx0XHRwYXJzZVRoaW5nc0ltcG9ydGVkKG5hbWUsIGZhbHNlLCBsaW5lLnRhaWwoKSlcblx0XHRcdFx0b3BJbXBvcnRHbG9iYWwgPSBuZXcgSW1wb3J0R2xvYmFsKGxpbmUubG9jLCBpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0KVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qge2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9ID1cblx0XHRcdFx0XHRwYXJzZVRoaW5nc0ltcG9ydGVkKFxuXHRcdFx0XHRcdFx0bmFtZSxcblx0XHRcdFx0XHRcdGltcG9ydEtleXdvcmRLaW5kID09PSBLZXl3b3Jkcy5JbXBvcnRMYXp5LFxuXHRcdFx0XHRcdFx0bGluZS50YWlsKCkpXG5cdFx0XHRcdGltcG9ydHMucHVzaChuZXcgSW1wb3J0KGxpbmUubG9jLCBwYXRoLCBpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0KSlcblx0XHRcdH1cblx0fVxuXG5cdHJldHVybiB7aW1wb3J0cywgb3BJbXBvcnRHbG9iYWx9XG59XG5cbmZ1bmN0aW9uIHBhcnNlVGhpbmdzSW1wb3J0ZWQobmFtZSwgaXNMYXp5LCB0b2tlbnMpIHtcblx0Y29uc3QgaW1wb3J0RGVmYXVsdCA9ICgpID0+XG5cdFx0TG9jYWxEZWNsYXJlLnVudHlwZWQoXG5cdFx0XHR0b2tlbnMubG9jLFxuXHRcdFx0bmFtZSxcblx0XHRcdGlzTGF6eSA/IExvY2FsRGVjbGFyZXMuTGF6eSA6IExvY2FsRGVjbGFyZXMuQ29uc3QpXG5cblx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIHtpbXBvcnRlZDogW10sIG9wSW1wb3J0RGVmYXVsdDogaW1wb3J0RGVmYXVsdCgpfVxuXHRlbHNlIHtcblx0XHRjb25zdCBbb3BJbXBvcnREZWZhdWx0LCByZXN0XSA9IGlzS2V5d29yZChLZXl3b3Jkcy5Gb2N1cywgdG9rZW5zLmhlYWQoKSkgP1xuXHRcdFx0W2ltcG9ydERlZmF1bHQoKSwgdG9rZW5zLnRhaWwoKV0gOlxuXHRcdFx0W251bGwsIHRva2Vuc11cblx0XHRjb25zdCBpbXBvcnRlZCA9IHBhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcyhyZXN0KS5tYXAobCA9PiB7XG5cdFx0XHRjaGVjayhsLm5hbWUgIT09ICdfJywgbC5wb3MsICgpID0+IGAke2NvZGUoJ18nKX0gbm90IGFsbG93ZWQgYXMgaW1wb3J0IG5hbWUuYClcblx0XHRcdGlmIChpc0xhenkpXG5cdFx0XHRcdGwua2luZCA9IExvY2FsRGVjbGFyZXMuTGF6eVxuXHRcdFx0cmV0dXJuIGxcblx0XHR9KVxuXHRcdHJldHVybiB7aW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdH1cblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZVJlcXVpcmUodG9rZW4pIHtcblx0Y29uc3QgbmFtZSA9IHRyeVBhcnNlTmFtZSh0b2tlbilcblx0aWYgKG5hbWUgIT09IG51bGwpXG5cdFx0cmV0dXJuIHtwYXRoOiBuYW1lLCBuYW1lfVxuXHRlbHNlIHtcblx0XHRjaGVjayhpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgdG9rZW4pLCB0b2tlbi5sb2MsICdOb3QgYSB2YWxpZCBtb2R1bGUgbmFtZS4nKVxuXHRcdGNvbnN0IHRva2VucyA9IFNsaWNlLmdyb3VwKHRva2VuKVxuXG5cdFx0Ly8gVGFrZSBsZWFkaW5nIGRvdHMuIFRoZXJlIGNhbiBiZSBhbnkgbnVtYmVyLCBzbyBjb3VudCBlbGxpcHNpcyBhcyAzIGRvdHMgaW4gYSByb3cuXG5cdFx0bGV0IHJlc3QgPSB0b2tlbnNcblx0XHRjb25zdCBwYXJ0cyA9IFtdXG5cdFx0Y29uc3QgaXNEb3R0eSA9IF8gPT5cblx0XHRcdGlzS2V5d29yZChLZXl3b3Jkcy5Eb3QsIF8pIHx8IGlzS2V5d29yZChLZXl3b3Jkcy5FbGxpcHNpcywgXylcblx0XHRjb25zdCBoZWFkID0gcmVzdC5oZWFkKClcblx0XHRpZiAoaXNEb3R0eShoZWFkKSkge1xuXHRcdFx0cGFydHMucHVzaCgnLicpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkVsbGlwc2lzLCBoZWFkKSkge1xuXHRcdFx0XHRwYXJ0cy5wdXNoKCcuLicpXG5cdFx0XHRcdHBhcnRzLnB1c2goJy4uJylcblx0XHRcdH1cblx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXG5cdFx0XHR3aGlsZSAoIXJlc3QuaXNFbXB0eSgpICYmIGlzRG90dHkocmVzdC5oZWFkKCkpKSB7XG5cdFx0XHRcdHBhcnRzLnB1c2goJy4uJylcblx0XHRcdFx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5FbGxpcHNpcywgcmVzdC5oZWFkKCkpKSB7XG5cdFx0XHRcdFx0cGFydHMucHVzaCgnLi4nKVxuXHRcdFx0XHRcdHBhcnRzLnB1c2goJy4uJylcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBUYWtlIG5hbWUsIHRoZW4gYW55IG51bWJlciBvZiBkb3QtdGhlbi1uYW1lIChgLnhgKVxuXHRcdGZvciAoOzspIHtcblx0XHRcdGNoZWNrTm9uRW1wdHkocmVzdClcblx0XHRcdHBhcnRzLnB1c2gocGFyc2VOYW1lKHJlc3QuaGVhZCgpKSlcblx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXG5cdFx0XHRpZiAocmVzdC5pc0VtcHR5KCkpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdC8vIElmIHRoZXJlJ3Mgc29tZXRoaW5nIGxlZnQsIGl0IHNob3VsZCBiZSBhIGRvdCwgZm9sbG93ZWQgYnkgYSBuYW1lLlxuXHRcdFx0aWYgKCFpc0tleXdvcmQoS2V5d29yZHMuRG90LCByZXN0LmhlYWQoKSkpXG5cdFx0XHRcdHVuZXhwZWN0ZWQocmVzdC5oZWFkKCkpXG5cdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHR9XG5cblx0XHRyZXR1cm4ge3BhdGg6IHBhcnRzLmpvaW4oJy8nKSwgbmFtZTogcGFydHNbcGFydHMubGVuZ3RoIC0gMV19XG5cdH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

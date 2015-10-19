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

		if (_context.options.includeModuleName()) {
			const name = new _MsAst.LocalDeclareName(tokens.loc);
			const assign = new _MsAst.AssignSingle(tokens.loc, name, _MsAst.Quote.forString(tokens.loc, _context.options.moduleName()));
			lines.push(new _MsAst.ModuleExportNamed(tokens.loc, assign));
		}

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlTW9kdWxlLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZU1vZHVsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7a0JDaUJ3QixXQUFXOzs7Ozs7Ozs7Ozs7Ozs7O0FBQXBCLFVBQVMsV0FBVyxDQUFDLE1BQU0sRUFBRTs7O3dCQUVoQiw4QkFBZSxNQUFNLENBQUM7Ozs7UUFBMUMsU0FBUztRQUFFLEtBQUs7Ozs7eUJBRW1CLGVBQWUsQ0FBQyxPQWpCdkIsUUFBUSxDQWlCd0IsUUFBUSxFQUFFLEtBQUssQ0FBQzs7UUFBbkUsU0FBUyxvQkFBbEIsT0FBTztRQUFtQixLQUFLLG9CQUFYLElBQUk7OzBCQUU5QixlQUFlLENBQUMsT0FuQmtCLFFBQVEsQ0FtQmpCLE1BQU0sRUFBRSxLQUFLLENBQUM7O1FBRHhCLFlBQVkscUJBQXJCLE9BQU87UUFBZ0IsY0FBYyxxQkFBZCxjQUFjO1FBQVEsS0FBSyxxQkFBWCxJQUFJOzswQkFFTixlQUFlLENBQUMsT0FwQnpCLFFBQVEsQ0FvQjBCLFVBQVUsRUFBRSxLQUFLLENBQUM7O1FBQXZFLFdBQVcscUJBQXBCLE9BQU87UUFBcUIsS0FBSyxxQkFBWCxJQUFJOztBQUVqQyxRQUFNLEtBQUssR0FBRyxnQkFwQkksZ0JBQWdCLEVBb0JILEtBQUssQ0FBQyxDQUFBOztBQUVyQyxNQUFJLFNBM0JVLE9BQU8sQ0EyQlQsaUJBQWlCLEVBQUUsRUFBRTtBQUNoQyxTQUFNLElBQUksR0FBRyxXQTNCcUQsZ0JBQWdCLENBMkJoRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDN0MsU0FBTSxNQUFNLEdBQUcsV0E1QlQsWUFBWSxDQTRCYyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFDL0MsT0E1QndDLEtBQUssQ0E0QnZDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLFNBOUJoQixPQUFPLENBOEJpQixVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDbkQsUUFBSyxDQUFDLElBQUksQ0FB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LEVBQUUsQ0FBQTtJQUNsQjs7QUFFRCxVQUFPLEVBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFDLENBQUE7R0FDN0Q7RUFDRCIsImZpbGUiOiJwcml2YXRlL3BhcnNlL3BhcnNlTW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2ssIG9wdGlvbnN9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0Fzc2lnblNpbmdsZSwgSW1wb3J0RG8sIEltcG9ydEdsb2JhbCwgSW1wb3J0LCBMb2NhbERlY2xhcmUsIExvY2FsRGVjbGFyZU5hbWUsXG5cdExvY2FsRGVjbGFyZXMsIE1vZHVsZSwgTW9kdWxlRXhwb3J0TmFtZWQsIFF1b3RlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXBzLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7Y2hlY2tOb25FbXB0eSwgdW5leHBlY3RlZH0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge2p1c3RCbG9jaywgcGFyc2VNb2R1bGVCbG9ja30gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHtwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXN9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuaW1wb3J0IHBhcnNlTmFtZSwge3RyeVBhcnNlTmFtZX0gZnJvbSAnLi9wYXJzZU5hbWUnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcbmltcG9ydCB0cnlUYWtlQ29tbWVudCBmcm9tICcuL3RyeVRha2VDb21tZW50J1xuXG4vKipcblBhcnNlIHRoZSB3aG9sZSBUb2tlbiB0cmVlLlxuQHBhcmFtIHtTbGljZX0gdG9rZW5zXG5AcmV0dXJuIHtNb2R1bGV9XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VNb2R1bGUodG9rZW5zKSB7XG5cdC8vIE1vZHVsZSBkb2MgY29tbWVudCBtdXN0IGNvbWUgZmlyc3QuXG5cdGNvbnN0IFtvcENvbW1lbnQsIHJlc3QwXSA9IHRyeVRha2VDb21tZW50KHRva2Vucylcblx0Ly8gSW1wb3J0IHN0YXRlbWVudHMgbXVzdCBhcHBlYXIgaW4gb3JkZXIuXG5cdGNvbnN0IHtpbXBvcnRzOiBkb0ltcG9ydHMsIHJlc3Q6IHJlc3QxfSA9IHRyeVBhcnNlSW1wb3J0cyhLZXl3b3Jkcy5JbXBvcnREbywgcmVzdDApXG5cdGNvbnN0IHtpbXBvcnRzOiBwbGFpbkltcG9ydHMsIG9wSW1wb3J0R2xvYmFsLCByZXN0OiByZXN0Mn0gPVxuXHRcdHRyeVBhcnNlSW1wb3J0cyhLZXl3b3Jkcy5JbXBvcnQsIHJlc3QxKVxuXHRjb25zdCB7aW1wb3J0czogbGF6eUltcG9ydHMsIHJlc3Q6IHJlc3QzfSA9IHRyeVBhcnNlSW1wb3J0cyhLZXl3b3Jkcy5JbXBvcnRMYXp5LCByZXN0MilcblxuXHRjb25zdCBsaW5lcyA9IHBhcnNlTW9kdWxlQmxvY2socmVzdDMpXG5cblx0aWYgKG9wdGlvbnMuaW5jbHVkZU1vZHVsZU5hbWUoKSkge1xuXHRcdGNvbnN0IG5hbWUgPSBuZXcgTG9jYWxEZWNsYXJlTmFtZSh0b2tlbnMubG9jKVxuXHRcdGNvbnN0IGFzc2lnbiA9IG5ldyBBc3NpZ25TaW5nbGUodG9rZW5zLmxvYywgbmFtZSxcblx0XHRcdFF1b3RlLmZvclN0cmluZyh0b2tlbnMubG9jLCBvcHRpb25zLm1vZHVsZU5hbWUoKSkpXG5cdFx0bGluZXMucHVzaChuZXcgTW9kdWxlRXhwb3J0TmFtZWQodG9rZW5zLmxvYywgYXNzaWduKSlcblx0fVxuXG5cdGNvbnN0IGltcG9ydHMgPSBwbGFpbkltcG9ydHMuY29uY2F0KGxhenlJbXBvcnRzKVxuXHRyZXR1cm4gbmV3IE1vZHVsZShcblx0XHR0b2tlbnMubG9jLCBvcHRpb25zLm1vZHVsZU5hbWUoKSwgb3BDb21tZW50LCBkb0ltcG9ydHMsIGltcG9ydHMsIG9wSW1wb3J0R2xvYmFsLCBsaW5lcylcbn1cblxuZnVuY3Rpb24gdHJ5UGFyc2VJbXBvcnRzKGltcG9ydEtleXdvcmRLaW5kLCB0b2tlbnMpIHtcblx0aWYgKCF0b2tlbnMuaXNFbXB0eSgpKSB7XG5cdFx0Y29uc3QgbGluZTAgPSB0b2tlbnMuaGVhZFNsaWNlKClcblx0XHRpZiAoaXNLZXl3b3JkKGltcG9ydEtleXdvcmRLaW5kLCBsaW5lMC5oZWFkKCkpKSB7XG5cdFx0XHRjb25zdCB7aW1wb3J0cywgb3BJbXBvcnRHbG9iYWx9ID0gcGFyc2VJbXBvcnRzKGltcG9ydEtleXdvcmRLaW5kLCBsaW5lMC50YWlsKCkpXG5cdFx0XHRpZiAoaW1wb3J0S2V5d29yZEtpbmQgIT09IEtleXdvcmRzLkltcG9ydClcblx0XHRcdFx0Y2hlY2sob3BJbXBvcnRHbG9iYWwgPT09IG51bGwsIGxpbmUwLmxvYywgJ0NhblxcJ3QgdXNlIGdsb2JhbCBoZXJlLicpXG5cdFx0XHRyZXR1cm4ge2ltcG9ydHMsIG9wSW1wb3J0R2xvYmFsLCByZXN0OiB0b2tlbnMudGFpbCgpfVxuXHRcdH1cblx0fVxuXHRyZXR1cm4ge2ltcG9ydHM6IFtdLCBvcEltcG9ydEdsb2JhbDogbnVsbCwgcmVzdDogdG9rZW5zfVxufVxuXG5mdW5jdGlvbiBwYXJzZUltcG9ydHMoaW1wb3J0S2V5d29yZEtpbmQsIHRva2Vucykge1xuXHRjb25zdCBsaW5lcyA9IGp1c3RCbG9jayhpbXBvcnRLZXl3b3JkS2luZCwgdG9rZW5zKVxuXHRsZXQgb3BJbXBvcnRHbG9iYWwgPSBudWxsXG5cblx0Y29uc3QgaW1wb3J0cyA9IFtdXG5cblx0Zm9yIChjb25zdCBsaW5lIG9mIGxpbmVzLnNsaWNlcygpKSB7XG5cdFx0Y29uc3Qge3BhdGgsIG5hbWV9ID0gcGFyc2VSZXF1aXJlKGxpbmUuaGVhZCgpKVxuXHRcdGlmIChpbXBvcnRLZXl3b3JkS2luZCA9PT0gS2V5d29yZHMuSW1wb3J0RG8pIHtcblx0XHRcdGlmIChsaW5lLnNpemUoKSA+IDEpXG5cdFx0XHRcdHVuZXhwZWN0ZWQobGluZS5zZWNvbmQoKSlcblx0XHRcdGltcG9ydHMucHVzaChuZXcgSW1wb3J0RG8obGluZS5sb2MsIHBhdGgpKVxuXHRcdH0gZWxzZVxuXHRcdFx0aWYgKHBhdGggPT09ICdnbG9iYWwnKSB7XG5cdFx0XHRcdGNoZWNrKG9wSW1wb3J0R2xvYmFsID09PSBudWxsLCBsaW5lLmxvYywgJ0NhblxcJ3QgdXNlIGdsb2JhbCB0d2ljZScpXG5cdFx0XHRcdGNvbnN0IHtpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0fSA9XG5cdFx0XHRcdFx0cGFyc2VUaGluZ3NJbXBvcnRlZChuYW1lLCBmYWxzZSwgbGluZS50YWlsKCkpXG5cdFx0XHRcdG9wSW1wb3J0R2xvYmFsID0gbmV3IEltcG9ydEdsb2JhbChsaW5lLmxvYywgaW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHtpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0fSA9XG5cdFx0XHRcdFx0cGFyc2VUaGluZ3NJbXBvcnRlZChcblx0XHRcdFx0XHRcdG5hbWUsXG5cdFx0XHRcdFx0XHRpbXBvcnRLZXl3b3JkS2luZCA9PT0gS2V5d29yZHMuSW1wb3J0TGF6eSxcblx0XHRcdFx0XHRcdGxpbmUudGFpbCgpKVxuXHRcdFx0XHRpbXBvcnRzLnB1c2gobmV3IEltcG9ydChsaW5lLmxvYywgcGF0aCwgaW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdCkpXG5cdFx0XHR9XG5cdH1cblxuXHRyZXR1cm4ge2ltcG9ydHMsIG9wSW1wb3J0R2xvYmFsfVxufVxuXG5mdW5jdGlvbiBwYXJzZVRoaW5nc0ltcG9ydGVkKG5hbWUsIGlzTGF6eSwgdG9rZW5zKSB7XG5cdGNvbnN0IGltcG9ydERlZmF1bHQgPSAoKSA9PlxuXHRcdExvY2FsRGVjbGFyZS51bnR5cGVkKFxuXHRcdFx0dG9rZW5zLmxvYyxcblx0XHRcdG5hbWUsXG5cdFx0XHRpc0xhenkgPyBMb2NhbERlY2xhcmVzLkxhenkgOiBMb2NhbERlY2xhcmVzLkNvbnN0KVxuXG5cdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdHJldHVybiB7aW1wb3J0ZWQ6IFtdLCBvcEltcG9ydERlZmF1bHQ6IGltcG9ydERlZmF1bHQoKX1cblx0ZWxzZSB7XG5cdFx0Y29uc3QgW29wSW1wb3J0RGVmYXVsdCwgcmVzdF0gPSBpc0tleXdvcmQoS2V5d29yZHMuRm9jdXMsIHRva2Vucy5oZWFkKCkpID9cblx0XHRcdFtpbXBvcnREZWZhdWx0KCksIHRva2Vucy50YWlsKCldIDpcblx0XHRcdFtudWxsLCB0b2tlbnNdXG5cdFx0Y29uc3QgaW1wb3J0ZWQgPSBwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMocmVzdCkubWFwKGwgPT4ge1xuXHRcdFx0Y2hlY2sobC5uYW1lICE9PSAnXycsIGwucG9zLCAoKSA9PiBgJHtjb2RlKCdfJyl9IG5vdCBhbGxvd2VkIGFzIGltcG9ydCBuYW1lLmApXG5cdFx0XHRpZiAoaXNMYXp5KVxuXHRcdFx0XHRsLmtpbmQgPSBMb2NhbERlY2xhcmVzLkxhenlcblx0XHRcdHJldHVybiBsXG5cdFx0fSlcblx0XHRyZXR1cm4ge2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VSZXF1aXJlKHRva2VuKSB7XG5cdGNvbnN0IG5hbWUgPSB0cnlQYXJzZU5hbWUodG9rZW4pXG5cdGlmIChuYW1lICE9PSBudWxsKVxuXHRcdHJldHVybiB7cGF0aDogbmFtZSwgbmFtZX1cblx0ZWxzZSB7XG5cdFx0Y2hlY2soaXNHcm91cChHcm91cHMuU3BhY2UsIHRva2VuKSwgdG9rZW4ubG9jLCAnTm90IGEgdmFsaWQgbW9kdWxlIG5hbWUuJylcblx0XHRjb25zdCB0b2tlbnMgPSBTbGljZS5ncm91cCh0b2tlbilcblxuXHRcdC8vIFRha2UgbGVhZGluZyBkb3RzLiBUaGVyZSBjYW4gYmUgYW55IG51bWJlciwgc28gY291bnQgZWxsaXBzaXMgYXMgMyBkb3RzIGluIGEgcm93LlxuXHRcdGxldCByZXN0ID0gdG9rZW5zXG5cdFx0Y29uc3QgcGFydHMgPSBbXVxuXHRcdGNvbnN0IGlzRG90dHkgPSBfID0+XG5cdFx0XHRpc0tleXdvcmQoS2V5d29yZHMuRG90LCBfKSB8fCBpc0tleXdvcmQoS2V5d29yZHMuRWxsaXBzaXMsIF8pXG5cdFx0Y29uc3QgaGVhZCA9IHJlc3QuaGVhZCgpXG5cdFx0aWYgKGlzRG90dHkoaGVhZCkpIHtcblx0XHRcdHBhcnRzLnB1c2goJy4nKVxuXHRcdFx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5FbGxpcHNpcywgaGVhZCkpIHtcblx0XHRcdFx0cGFydHMucHVzaCgnLi4nKVxuXHRcdFx0XHRwYXJ0cy5wdXNoKCcuLicpXG5cdFx0XHR9XG5cdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblxuXHRcdFx0d2hpbGUgKCFyZXN0LmlzRW1wdHkoKSAmJiBpc0RvdHR5KHJlc3QuaGVhZCgpKSkge1xuXHRcdFx0XHRwYXJ0cy5wdXNoKCcuLicpXG5cdFx0XHRcdGlmIChpc0tleXdvcmQoS2V5d29yZHMuRWxsaXBzaXMsIHJlc3QuaGVhZCgpKSkge1xuXHRcdFx0XHRcdHBhcnRzLnB1c2goJy4uJylcblx0XHRcdFx0XHRwYXJ0cy5wdXNoKCcuLicpXG5cdFx0XHRcdH1cblx0XHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gVGFrZSBuYW1lLCB0aGVuIGFueSBudW1iZXIgb2YgZG90LXRoZW4tbmFtZSAoYC54YClcblx0XHRmb3IgKDs7KSB7XG5cdFx0XHRjaGVja05vbkVtcHR5KHJlc3QpXG5cdFx0XHRwYXJ0cy5wdXNoKHBhcnNlTmFtZShyZXN0LmhlYWQoKSkpXG5cdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblxuXHRcdFx0aWYgKHJlc3QuaXNFbXB0eSgpKVxuXHRcdFx0XHRicmVha1xuXG5cdFx0XHQvLyBJZiB0aGVyZSdzIHNvbWV0aGluZyBsZWZ0LCBpdCBzaG91bGQgYmUgYSBkb3QsIGZvbGxvd2VkIGJ5IGEgbmFtZS5cblx0XHRcdGlmICghaXNLZXl3b3JkKEtleXdvcmRzLkRvdCwgcmVzdC5oZWFkKCkpKVxuXHRcdFx0XHR1bmV4cGVjdGVkKHJlc3QuaGVhZCgpKVxuXHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtwYXRoOiBwYXJ0cy5qb2luKCcvJyksIG5hbWU6IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdfVxuXHR9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

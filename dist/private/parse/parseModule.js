if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../../CompileError', '../MsAst', '../Token', '../util', './context', './parseBlock', './parseLocalDeclares', './Slice', './tryTakeComment'], function (exports, module, _CompileError, _MsAst, _Token, _util, _context, _parseBlock, _parseLocalDeclares, _Slice, _tryTakeComment3) {
	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _Slice2 = _interopRequireDefault(_Slice);

	var _tryTakeComment4 = _interopRequireDefault(_tryTakeComment3);

	module.exports = tokens => {
		// Module doc comment must come first.

		var _tryTakeComment = (0, _tryTakeComment4.default)(tokens);

		var _tryTakeComment2 = _slicedToArray(_tryTakeComment, 2);

		const opComment = _tryTakeComment2[0];
		const rest0 = _tryTakeComment2[1];

		// Import statements must appear in order.

		var _tryParseImports = tryParseImports(_Token.KW_ImportDo, rest0);

		const doImports = _tryParseImports.imports;
		const rest1 = _tryParseImports.rest;

		var _tryParseImports2 = tryParseImports(_Token.KW_Import, rest1);

		const plainImports = _tryParseImports2.imports;
		const opImportGlobal = _tryParseImports2.opImportGlobal;
		const rest2 = _tryParseImports2.rest;

		var _tryParseImports3 = tryParseImports(_Token.KW_ImportLazy, rest2);

		const lazyImports = _tryParseImports3.imports;
		const rest3 = _tryParseImports3.rest;

		const lines = (0, _parseBlock.parseModuleBlock)(rest3);

		if (_context.context.opts.includeModuleName()) {
			const name = new _MsAst.LocalDeclareName(tokens.loc);
			const assign = new _MsAst.AssignSingle(tokens.loc, name, _MsAst.Quote.forString(tokens.loc, _context.context.opts.moduleName()));
			lines.push(new _MsAst.ModuleExportNamed(tokens.loc, assign));
		}

		const imports = plainImports.concat(lazyImports);
		return new _MsAst.Module(tokens.loc, opComment, doImports, imports, opImportGlobal, lines);
	};

	const tryParseImports = (importKeywordKind, tokens) => {
		if (!tokens.isEmpty()) {
			const line0 = tokens.headSlice();
			if ((0, _Token.isKeyword)(importKeywordKind, line0.head())) {
				var _parseImports = parseImports(importKeywordKind, line0.tail());

				const imports = _parseImports.imports;
				const opImportGlobal = _parseImports.opImportGlobal;

				if (importKeywordKind !== _Token.KW_Import) _context.context.check(opImportGlobal === null, line0.loc, 'Can\'t use global here.');
				return { imports, opImportGlobal, rest: tokens.tail() };
			}
		}
		return { imports: [], opImportGlobal: null, rest: tokens };
	},
	      parseImports = (importKeywordKind, tokens) => {
		const lines = (0, _parseBlock.justBlock)(importKeywordKind, tokens);
		let opImportGlobal = null;

		const imports = [];

		for (const line of lines.slices()) {
			var _parseRequire = parseRequire(line.head());

			const path = _parseRequire.path;
			const name = _parseRequire.name;

			if (importKeywordKind === _Token.KW_ImportDo) {
				if (line.size() > 1) (0, _context.unexpected)(line.second());
				imports.push(new _MsAst.ImportDo(line.loc, path));
			} else if (path === 'global') {
				_context.context.check(opImportGlobal === null, line.loc, 'Can\'t use global twice');

				var _parseThingsImported = parseThingsImported(name, false, line.tail());

				const imported = _parseThingsImported.imported;
				const opImportDefault = _parseThingsImported.opImportDefault;

				opImportGlobal = new _MsAst.ImportGlobal(line.loc, imported, opImportDefault);
			} else {
				var _parseThingsImported2 = parseThingsImported(name, importKeywordKind === _Token.KW_ImportLazy, line.tail());

				const imported = _parseThingsImported2.imported;
				const opImportDefault = _parseThingsImported2.opImportDefault;

				imports.push(new _MsAst.Import(line.loc, path, imported, opImportDefault));
			}
		}

		return { imports, opImportGlobal };
	},
	      parseThingsImported = (name, isLazy, tokens) => {
		const importDefault = () => _MsAst.LocalDeclare.untyped(tokens.loc, name, isLazy ? _MsAst.LD_Lazy : _MsAst.LD_Const);
		if (tokens.isEmpty()) return { imported: [], opImportDefault: importDefault() };else {
			var _ref = (0, _Token.isKeyword)(_Token.KW_Focus, tokens.head()) ? [importDefault(), tokens.tail()] : [null, tokens];

			var _ref2 = _slicedToArray(_ref, 2);

			const opImportDefault = _ref2[0];
			const rest = _ref2[1];

			const imported = (0, _parseLocalDeclares.parseLocalDeclaresJustNames)(rest).map(l => {
				_context.context.check(l.name !== '_', l.pos, () => `${ (0, _CompileError.code)('_') } not allowed as import name.`);
				if (isLazy) l.kind = _MsAst.LD_Lazy;
				return l;
			});
			return { imported, opImportDefault };
		}
	},
	      parseRequire = t => {
		if (t instanceof _Token.Name) return { path: t.name, name: t.name };else if (t instanceof _Token.DotName) return { path: (0, _util.cat)(partsFromDotName(t), t.name).join('/'), name: t.name };else {
			_context.context.check((0, _Token.isGroup)(_Token.G_Space, t), t.loc, 'Not a valid module name.');
			return parseSpacedRequire(_Slice2.default.group(t));
		}
	},
	      parseSpacedRequire = tokens => {
		const first = tokens.head();
		let parts;
		if (first instanceof _Token.DotName) parts = partsFromDotName(first);else {
			_context.context.check(first instanceof _Token.Name, first.loc, 'Not a valid part of module path.');
			parts = [];
		}
		parts.push(first.name);
		for (const token of tokens.tail()) {
			_context.context.check(token instanceof _Token.DotName && token.nDots === 1, token.loc, 'Not a valid part of module path.');
			parts.push(token.name);
		}
		return { path: parts.join('/'), name: tokens.last().name };
	},
	      partsFromDotName = dotName => dotName.nDots === 1 ? ['.'] : (0, _util.repeat)('..', dotName.nDots - 1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlTW9kdWxlLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZU1vZHVsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7a0JDWWUsTUFBTSxJQUFJOzs7d0JBRUcsOEJBQWUsTUFBTSxDQUFDOzs7O1FBQTFDLFNBQVM7UUFBRSxLQUFLOzs7O3lCQUVtQixlQUFlLFFBYmUsV0FBVyxFQWFaLEtBQUssQ0FBQzs7UUFBN0QsU0FBUyxvQkFBbEIsT0FBTztRQUFtQixLQUFLLG9CQUFYLElBQUk7OzBCQUM4QixlQUFlLFFBZGYsU0FBUyxFQWNrQixLQUFLLENBQUM7O1FBQTlFLFlBQVkscUJBQXJCLE9BQU87UUFBZ0IsY0FBYyxxQkFBZCxjQUFjO1FBQVEsS0FBSyxxQkFBWCxJQUFJOzswQkFDTixlQUFlLFFBZjBCLGFBQWEsRUFldkIsS0FBSyxDQUFDOztRQUFqRSxXQUFXLHFCQUFwQixPQUFPO1FBQXFCLEtBQUsscUJBQVgsSUFBSTs7QUFFakMsUUFBTSxLQUFLLEdBQUcsZ0JBYkksZ0JBQWdCLEVBYUgsS0FBSyxDQUFDLENBQUE7O0FBRXJDLE1BQUksU0FoQkcsT0FBTyxDQWdCRixJQUFJLENBQUMsaUJBQWlCLEVBQUUsRUFBRTtBQUNyQyxTQUFNLElBQUksR0FBRyxXQXJCZCxnQkFBZ0IsQ0FxQm1CLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUM3QyxTQUFNLE1BQU0sR0FBRyxXQXZCVCxZQUFZLENBdUJjLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUMvQyxPQXZCMkMsS0FBSyxDQXVCMUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsU0FuQnZCLE9BQU8sQ0FtQndCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDeEQsUUFBSyxDQUFDLElBQUksQ0FBQyxXQXhCYyxpQkFBaUIsQ0F3QlQsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFBO0dBQ3JEOztBQUVELFFB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Q0FBQyxDQUFBO0FBQ3RCLE9BQUssTUFBTSxLQUFLLElBQUksTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFO0FBQ2xDLFlBaEhLLE9BQU8sQ0FnSEosS0FBSyxDQUFDLEtBQUssbUJBbkhkLE9BQU8sQUFtSDBCLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFDckUsa0NBQWtDLENBQUMsQ0FBQTtBQUNwQyxRQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtHQUN0QjtBQUNELFNBQU8sRUFBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBQyxDQUFBO0VBQ3hEO09BRUQsZ0JBQWdCLEdBQUcsT0FBTyxJQUN6QixPQUFPLENBQUMsS0FBSyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBekhuQixNQUFNLEVBeUhvQixJQUFJLEVBQUUsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQSIsImZpbGUiOiJwcml2YXRlL3BhcnNlL3BhcnNlTW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7QXNzaWduU2luZ2xlLCBJbXBvcnREbywgSW1wb3J0R2xvYmFsLCBJbXBvcnQsIExEX0NvbnN0LCBMRF9MYXp5LCBMb2NhbERlY2xhcmUsXG5cdExvY2FsRGVjbGFyZU5hbWUsIE1vZHVsZSwgTW9kdWxlRXhwb3J0TmFtZWQsIFF1b3RlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7RG90TmFtZSwgR19TcGFjZSwgaXNHcm91cCwgaXNLZXl3b3JkLCBOYW1lLCBLV19Gb2N1cywgS1dfSW1wb3J0LCBLV19JbXBvcnREbywgS1dfSW1wb3J0TGF6eVxuXHR9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtjYXQsIHJlcGVhdH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y29udGV4dCwgdW5leHBlY3RlZH0gZnJvbSAnLi9jb250ZXh0J1xuaW1wb3J0IHtqdXN0QmxvY2ssIHBhcnNlTW9kdWxlQmxvY2t9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCB7cGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzfSBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuaW1wb3J0IHRyeVRha2VDb21tZW50IGZyb20gJy4vdHJ5VGFrZUNvbW1lbnQnXG5cbmV4cG9ydCBkZWZhdWx0IHRva2VucyA9PiB7XG5cdC8vIE1vZHVsZSBkb2MgY29tbWVudCBtdXN0IGNvbWUgZmlyc3QuXG5cdGNvbnN0IFtvcENvbW1lbnQsIHJlc3QwXSA9IHRyeVRha2VDb21tZW50KHRva2Vucylcblx0Ly8gSW1wb3J0IHN0YXRlbWVudHMgbXVzdCBhcHBlYXIgaW4gb3JkZXIuXG5cdGNvbnN0IHtpbXBvcnRzOiBkb0ltcG9ydHMsIHJlc3Q6IHJlc3QxfSA9IHRyeVBhcnNlSW1wb3J0cyhLV19JbXBvcnREbywgcmVzdDApXG5cdGNvbnN0IHtpbXBvcnRzOiBwbGFpbkltcG9ydHMsIG9wSW1wb3J0R2xvYmFsLCByZXN0OiByZXN0Mn0gPSB0cnlQYXJzZUltcG9ydHMoS1dfSW1wb3J0LCByZXN0MSlcblx0Y29uc3Qge2ltcG9ydHM6IGxhenlJbXBvcnRzLCByZXN0OiByZXN0M30gPSB0cnlQYXJzZUltcG9ydHMoS1dfSW1wb3J0TGF6eSwgcmVzdDIpXG5cblx0Y29uc3QgbGluZXMgPSBwYXJzZU1vZHVsZUJsb2NrKHJlc3QzKVxuXG5cdGlmIChjb250ZXh0Lm9wdHMuaW5jbHVkZU1vZHVsZU5hbWUoKSkge1xuXHRcdGNvbnN0IG5hbWUgPSBuZXcgTG9jYWxEZWNsYXJlTmFtZSh0b2tlbnMubG9jKVxuXHRcdGNvbnN0IGFzc2lnbiA9IG5ldyBBc3NpZ25TaW5nbGUodG9rZW5zLmxvYywgbmFtZSxcblx0XHRcdFF1b3RlLmZvclN0cmluZyh0b2tlbnMubG9jLCBjb250ZXh0Lm9wdHMubW9kdWxlTmFtZSgpKSlcblx0XHRsaW5lcy5wdXNoKG5ldyBNb2R1bGVFeHBvcnROYW1lZCh0b2tlbnMubG9jLCBhc3NpZ24pKVxuXHR9XG5cblx0Y29uc3QgaW1wb3J0cyA9IHBsYWluSW1wb3J0cy5jb25jYXQobGF6eUltcG9ydHMpXG5cdHJldHVybiBuZXcgTW9kdWxlKFxuXHRcdHRva2Vucy5sb2MsIG9wQ29tbWVudCwgZG9JbXBvcnRzLCBpbXBvcnRzLCBvcEltcG9ydEdsb2JhbCwgbGluZXMpXG59XG5cbmNvbnN0XG5cdHRyeVBhcnNlSW1wb3J0cyA9IChpbXBvcnRLZXl3b3JkS2luZCwgdG9rZW5zKSA9PiB7XG5cdFx0aWYgKCF0b2tlbnMuaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCBsaW5lMCA9IHRva2Vucy5oZWFkU2xpY2UoKVxuXHRcdFx0aWYgKGlzS2V5d29yZChpbXBvcnRLZXl3b3JkS2luZCwgbGluZTAuaGVhZCgpKSkge1xuXHRcdFx0XHRjb25zdCB7aW1wb3J0cywgb3BJbXBvcnRHbG9iYWx9ID0gcGFyc2VJbXBvcnRzKGltcG9ydEtleXdvcmRLaW5kLCBsaW5lMC50YWlsKCkpXG5cdFx0XHRcdGlmIChpbXBvcnRLZXl3b3JkS2luZCAhPT0gS1dfSW1wb3J0KVxuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2sob3BJbXBvcnRHbG9iYWwgPT09IG51bGwsIGxpbmUwLmxvYywgJ0NhblxcJ3QgdXNlIGdsb2JhbCBoZXJlLicpXG5cdFx0XHRcdHJldHVybiB7aW1wb3J0cywgb3BJbXBvcnRHbG9iYWwsIHJlc3Q6IHRva2Vucy50YWlsKCl9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB7aW1wb3J0czogW10sIG9wSW1wb3J0R2xvYmFsOiBudWxsLCByZXN0OiB0b2tlbnN9XG5cdH0sXG5cblx0cGFyc2VJbXBvcnRzID0gKGltcG9ydEtleXdvcmRLaW5kLCB0b2tlbnMpID0+IHtcblx0XHRjb25zdCBsaW5lcyA9IGp1c3RCbG9jayhpbXBvcnRLZXl3b3JkS2luZCwgdG9rZW5zKVxuXHRcdGxldCBvcEltcG9ydEdsb2JhbCA9IG51bGxcblxuXHRcdGNvbnN0IGltcG9ydHMgPSBbXVxuXG5cdFx0Zm9yIChjb25zdCBsaW5lIG9mIGxpbmVzLnNsaWNlcygpKSB7XG5cdFx0XHRjb25zdCB7cGF0aCwgbmFtZX0gPSBwYXJzZVJlcXVpcmUobGluZS5oZWFkKCkpXG5cdFx0XHRpZiAoaW1wb3J0S2V5d29yZEtpbmQgPT09IEtXX0ltcG9ydERvKSB7XG5cdFx0XHRcdGlmIChsaW5lLnNpemUoKSA+IDEpXG5cdFx0XHRcdFx0dW5leHBlY3RlZChsaW5lLnNlY29uZCgpKVxuXHRcdFx0XHRpbXBvcnRzLnB1c2gobmV3IEltcG9ydERvKGxpbmUubG9jLCBwYXRoKSlcblx0XHRcdH0gZWxzZVxuXHRcdFx0XHRpZiAocGF0aCA9PT0gJ2dsb2JhbCcpIHtcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKG9wSW1wb3J0R2xvYmFsID09PSBudWxsLCBsaW5lLmxvYywgJ0NhblxcJ3QgdXNlIGdsb2JhbCB0d2ljZScpXG5cdFx0XHRcdFx0Y29uc3Qge2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9ID1cblx0XHRcdFx0XHRcdHBhcnNlVGhpbmdzSW1wb3J0ZWQobmFtZSwgZmFsc2UsIGxpbmUudGFpbCgpKVxuXHRcdFx0XHRcdG9wSW1wb3J0R2xvYmFsID0gbmV3IEltcG9ydEdsb2JhbChsaW5lLmxvYywgaW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdClcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCB7aW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdH0gPVxuXHRcdFx0XHRcdFx0cGFyc2VUaGluZ3NJbXBvcnRlZChuYW1lLCBpbXBvcnRLZXl3b3JkS2luZCA9PT0gS1dfSW1wb3J0TGF6eSwgbGluZS50YWlsKCkpXG5cdFx0XHRcdFx0aW1wb3J0cy5wdXNoKG5ldyBJbXBvcnQobGluZS5sb2MsIHBhdGgsIGltcG9ydGVkLCBvcEltcG9ydERlZmF1bHQpKVxuXHRcdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtpbXBvcnRzLCBvcEltcG9ydEdsb2JhbH1cblx0fSxcblxuXHRwYXJzZVRoaW5nc0ltcG9ydGVkID0gKG5hbWUsIGlzTGF6eSwgdG9rZW5zKSA9PiB7XG5cdFx0Y29uc3QgaW1wb3J0RGVmYXVsdCA9ICgpID0+XG5cdFx0XHRMb2NhbERlY2xhcmUudW50eXBlZCh0b2tlbnMubG9jLCBuYW1lLCBpc0xhenkgPyBMRF9MYXp5IDogTERfQ29uc3QpXG5cdFx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0XHRyZXR1cm4ge2ltcG9ydGVkOiBbXSwgb3BJbXBvcnREZWZhdWx0OiBpbXBvcnREZWZhdWx0KCl9XG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBbb3BJbXBvcnREZWZhdWx0LCByZXN0XSA9IGlzS2V5d29yZChLV19Gb2N1cywgdG9rZW5zLmhlYWQoKSkgP1xuXHRcdFx0XHRbaW1wb3J0RGVmYXVsdCgpLCB0b2tlbnMudGFpbCgpXSA6XG5cdFx0XHRcdFtudWxsLCB0b2tlbnNdXG5cdFx0XHRjb25zdCBpbXBvcnRlZCA9IHBhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcyhyZXN0KS5tYXAobCA9PiB7XG5cdFx0XHRcdGNvbnRleHQuY2hlY2sobC5uYW1lICE9PSAnXycsIGwucG9zLFxuXHRcdFx0XHRcdCgpID0+IGAke2NvZGUoJ18nKX0gbm90IGFsbG93ZWQgYXMgaW1wb3J0IG5hbWUuYClcblx0XHRcdFx0aWYgKGlzTGF6eSlcblx0XHRcdFx0XHRsLmtpbmQgPSBMRF9MYXp5XG5cdFx0XHRcdHJldHVybiBsXG5cdFx0XHR9KVxuXHRcdFx0cmV0dXJuIHtpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0fVxuXHRcdH1cblx0fSxcblxuXHRwYXJzZVJlcXVpcmUgPSB0ID0+IHtcblx0XHRpZiAodCBpbnN0YW5jZW9mIE5hbWUpXG5cdFx0XHRyZXR1cm4ge3BhdGg6IHQubmFtZSwgbmFtZTogdC5uYW1lfVxuXHRcdGVsc2UgaWYgKHQgaW5zdGFuY2VvZiBEb3ROYW1lKVxuXHRcdFx0cmV0dXJuIHtwYXRoOiBjYXQocGFydHNGcm9tRG90TmFtZSh0KSwgdC5uYW1lKS5qb2luKCcvJyksIG5hbWU6IHQubmFtZX1cblx0XHRlbHNlIHtcblx0XHRcdGNvbnRleHQuY2hlY2soaXNHcm91cChHX1NwYWNlLCB0KSwgdC5sb2MsICdOb3QgYSB2YWxpZCBtb2R1bGUgbmFtZS4nKVxuXHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkUmVxdWlyZShTbGljZS5ncm91cCh0KSlcblx0XHR9XG5cdH0sXG5cblx0cGFyc2VTcGFjZWRSZXF1aXJlID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBmaXJzdCA9IHRva2Vucy5oZWFkKClcblx0XHRsZXQgcGFydHNcblx0XHRpZiAoZmlyc3QgaW5zdGFuY2VvZiBEb3ROYW1lKVxuXHRcdFx0cGFydHMgPSBwYXJ0c0Zyb21Eb3ROYW1lKGZpcnN0KVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29udGV4dC5jaGVjayhmaXJzdCBpbnN0YW5jZW9mIE5hbWUsIGZpcnN0LmxvYywgJ05vdCBhIHZhbGlkIHBhcnQgb2YgbW9kdWxlIHBhdGguJylcblx0XHRcdHBhcnRzID0gW11cblx0XHR9XG5cdFx0cGFydHMucHVzaChmaXJzdC5uYW1lKVxuXHRcdGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zLnRhaWwoKSkge1xuXHRcdFx0Y29udGV4dC5jaGVjayh0b2tlbiBpbnN0YW5jZW9mIERvdE5hbWUgJiYgdG9rZW4ubkRvdHMgPT09IDEsIHRva2VuLmxvYyxcblx0XHRcdFx0J05vdCBhIHZhbGlkIHBhcnQgb2YgbW9kdWxlIHBhdGguJylcblx0XHRcdHBhcnRzLnB1c2godG9rZW4ubmFtZSlcblx0XHR9XG5cdFx0cmV0dXJuIHtwYXRoOiBwYXJ0cy5qb2luKCcvJyksIG5hbWU6IHRva2Vucy5sYXN0KCkubmFtZX1cblx0fSxcblxuXHRwYXJ0c0Zyb21Eb3ROYW1lID0gZG90TmFtZSA9PlxuXHRcdGRvdE5hbWUubkRvdHMgPT09IDEgPyBbJy4nXSA6IHJlcGVhdCgnLi4nLCBkb3ROYW1lLm5Eb3RzIC0gMSlcbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

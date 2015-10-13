if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../../CompileError', '../MsAst', '../Token', './context', './parseBlock', './parseLocalDeclares', './parseName', './Slice', './tryTakeComment'], function (exports, module, _CompileError, _MsAst, _Token, _context, _parseBlock, _parseLocalDeclares, _parseName, _Slice, _tryTakeComment3) {
	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseName2 = _interopRequireDefault(_parseName);

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
	      parseRequire = token => {
		const name = (0, _parseName.tryParseName)(token);
		if (name !== null) return { path: name, name };else {
			_context.context.check((0, _Token.isGroup)(_Token.G_Space, token), token.loc, 'Not a valid module name.');
			const tokens = _Slice2.default.group(token);

			// Take leading dots. There can be any number, so count ellipsis as 3 dots in a row.
			let rest = tokens;
			const parts = [];
			const isDotty = _ => (0, _Token.isKeyword)(_Token.KW_Dot, _) || (0, _Token.isKeyword)(_Token.KW_Ellipsis, _);
			const head = rest.head();
			if (isDotty(head)) {
				parts.push('.');
				if ((0, _Token.isKeyword)(_Token.KW_Ellipsis, head)) {
					parts.push('..');
					parts.push('..');
				}
				rest = rest.tail();

				while (!rest.isEmpty() && isDotty(rest.head())) {
					parts.push('..');
					if ((0, _Token.isKeyword)(_Token.KW_Ellipsis, rest.head())) {
						parts.push('..');
						parts.push('..');
					}
					rest = rest.tail();
				}
			}

			// Take name, then any number of dot-then-name (`.x`)
			for (;;) {
				(0, _context.checkNonEmpty)(rest);
				parts.push((0, _parseName2.default)(rest.head()));
				rest = rest.tail();

				if (rest.isEmpty()) break;

				// If there's something left, it should be a dot, followed by a name.
				if (!(0, _Token.isKeyword)(_Token.KW_Dot, rest.head())) (0, _context.unexpected)(rest.head());
				rest = rest.tail();
			}

			return { path: parts.join('/'), name: parts[parts.length - 1] };
		}
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlTW9kdWxlLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZU1vZHVsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztrQkNZZSxNQUFNLElBQUk7Ozt3QkFFRyw4QkFBZSxNQUFNLENBQUM7Ozs7UUFBMUMsU0FBUztRQUFFLEtBQUs7Ozs7eUJBRW1CLGVBQWUsUUFicUIsV0FBVyxFQWFsQixLQUFLLENBQUM7O1FBQTdELFNBQVMsb0JBQWxCLE9BQU87UUFBbUIsS0FBSyxvQkFBWCxJQUFJOzswQkFDOEIsZUFBZSxRQWRULFNBQVMsRUFjWSxLQUFLLENBQUM7O1FBQTlFLFlBQVkscUJBQXJCLE9BQU87UUFBZ0IsY0FBYyxxQkFBZCxjQUFjO1FBQVEsS0FBSyxxQkFBWCxJQUFJOzswQkFDTixlQUFlLFFBZDNELGFBQWEsRUFjOEQsS0FBSyxDQUFDOztRQUFqRSxXQUFXLHFCQUFwQixPQUFPO1FBQXFCLEtBQUsscUJBQVgsSUFBSTs7QUFFakMsUUFBTSxLQUFLLEdBQUcsZ0JBZEksZ0JBQWdCLEVBY0gsS0FBSyxDQUFDLENBQUE7O0FBRXJDLE1BQUksU0FqQmtCLE9BQU8sQ0FpQmpCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO0FBQ3JDLFNBQU0sSUFBSSxHQUFHLFdBckJkLGdCQUFnQixDQXFCbUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQzdDLFNBQU0sTUFBTSxHQUFHLFdBdkJULFlBQVksQ0F1QmMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQy9DLE9BdkIyQyxLQUFLLENBdUIxQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxTQXBCUixPQUFPLENBb0JTLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDeEQsUUFBSyxDQUFDLElBQUksQ0FBQyxXQXhCYyxpQkFBaUIsQ0F3QlQsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFBO0dBQ3JEOztBQUVE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QUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRTtBQUMvQyxVQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2hCLFNBQUksV0FySGlCLFNBQVMsU0FBVSxXQUFXLEVBcUh4QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRTtBQUN4QyxXQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2hCLFdBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7TUFDaEI7QUFDRCxTQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO0tBQ2xCO0lBQ0Q7OztBQUdELFlBQVM7QUFDUixpQkE3SEksYUFBYSxFQTZISCxJQUFJLENBQUMsQ0FBQTtBQUNuQixTQUFLLENBQUMsSUFBSSxDQUFDLHlCQUFVLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDbEMsUUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTs7QUFFbEIsUUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQ2pCLE1BQUs7OztBQUdOLFFBQUksQ0FBQyxXQXZJaUIsU0FBUyxTQUFFLE1BQU0sRUF1SWhCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUNsQyxhQXRJMkIsVUFBVSxFQXNJMUIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7QUFDeEIsUUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUNsQjs7QUFFRCxVQUFPLEVBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFDLENBQUE7R0FDN0Q7RUFDRCxDQUFBIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvcGFyc2VNb2R1bGUuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtBc3NpZ25TaW5nbGUsIEltcG9ydERvLCBJbXBvcnRHbG9iYWwsIEltcG9ydCwgTERfQ29uc3QsIExEX0xhenksIExvY2FsRGVjbGFyZSxcblx0TG9jYWxEZWNsYXJlTmFtZSwgTW9kdWxlLCBNb2R1bGVFeHBvcnROYW1lZCwgUXVvdGV9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtHX1NwYWNlLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtXX0RvdCwgS1dfRWxsaXBzaXMsIEtXX0ZvY3VzLCBLV19JbXBvcnQsIEtXX0ltcG9ydERvLFxuXHRLV19JbXBvcnRMYXp5fSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7Y2hlY2tOb25FbXB0eSwgY29udGV4dCwgdW5leHBlY3RlZH0gZnJvbSAnLi9jb250ZXh0J1xuaW1wb3J0IHtqdXN0QmxvY2ssIHBhcnNlTW9kdWxlQmxvY2t9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCB7cGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzfSBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcbmltcG9ydCBwYXJzZU5hbWUsIHt0cnlQYXJzZU5hbWV9IGZyb20gJy4vcGFyc2VOYW1lJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5pbXBvcnQgdHJ5VGFrZUNvbW1lbnQgZnJvbSAnLi90cnlUYWtlQ29tbWVudCdcblxuZXhwb3J0IGRlZmF1bHQgdG9rZW5zID0+IHtcblx0Ly8gTW9kdWxlIGRvYyBjb21tZW50IG11c3QgY29tZSBmaXJzdC5cblx0Y29uc3QgW29wQ29tbWVudCwgcmVzdDBdID0gdHJ5VGFrZUNvbW1lbnQodG9rZW5zKVxuXHQvLyBJbXBvcnQgc3RhdGVtZW50cyBtdXN0IGFwcGVhciBpbiBvcmRlci5cblx0Y29uc3Qge2ltcG9ydHM6IGRvSW1wb3J0cywgcmVzdDogcmVzdDF9ID0gdHJ5UGFyc2VJbXBvcnRzKEtXX0ltcG9ydERvLCByZXN0MClcblx0Y29uc3Qge2ltcG9ydHM6IHBsYWluSW1wb3J0cywgb3BJbXBvcnRHbG9iYWwsIHJlc3Q6IHJlc3QyfSA9IHRyeVBhcnNlSW1wb3J0cyhLV19JbXBvcnQsIHJlc3QxKVxuXHRjb25zdCB7aW1wb3J0czogbGF6eUltcG9ydHMsIHJlc3Q6IHJlc3QzfSA9IHRyeVBhcnNlSW1wb3J0cyhLV19JbXBvcnRMYXp5LCByZXN0MilcblxuXHRjb25zdCBsaW5lcyA9IHBhcnNlTW9kdWxlQmxvY2socmVzdDMpXG5cblx0aWYgKGNvbnRleHQub3B0cy5pbmNsdWRlTW9kdWxlTmFtZSgpKSB7XG5cdFx0Y29uc3QgbmFtZSA9IG5ldyBMb2NhbERlY2xhcmVOYW1lKHRva2Vucy5sb2MpXG5cdFx0Y29uc3QgYXNzaWduID0gbmV3IEFzc2lnblNpbmdsZSh0b2tlbnMubG9jLCBuYW1lLFxuXHRcdFx0UXVvdGUuZm9yU3RyaW5nKHRva2Vucy5sb2MsIGNvbnRleHQub3B0cy5tb2R1bGVOYW1lKCkpKVxuXHRcdGxpbmVzLnB1c2gobmV3IE1vZHVsZUV4cG9ydE5hbWVkKHRva2Vucy5sb2MsIGFzc2lnbikpXG5cdH1cblxuXHRjb25zdCBpbXBvcnRzID0gcGxhaW5JbXBvcnRzLmNvbmNhdChsYXp5SW1wb3J0cylcblx0cmV0dXJuIG5ldyBNb2R1bGUoXG5cdFx0dG9rZW5zLmxvYywgb3BDb21tZW50LCBkb0ltcG9ydHMsIGltcG9ydHMsIG9wSW1wb3J0R2xvYmFsLCBsaW5lcylcbn1cblxuY29uc3Rcblx0dHJ5UGFyc2VJbXBvcnRzID0gKGltcG9ydEtleXdvcmRLaW5kLCB0b2tlbnMpID0+IHtcblx0XHRpZiAoIXRva2Vucy5pc0VtcHR5KCkpIHtcblx0XHRcdGNvbnN0IGxpbmUwID0gdG9rZW5zLmhlYWRTbGljZSgpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKGltcG9ydEtleXdvcmRLaW5kLCBsaW5lMC5oZWFkKCkpKSB7XG5cdFx0XHRcdGNvbnN0IHtpbXBvcnRzLCBvcEltcG9ydEdsb2JhbH0gPSBwYXJzZUltcG9ydHMoaW1wb3J0S2V5d29yZEtpbmQsIGxpbmUwLnRhaWwoKSlcblx0XHRcdFx0aWYgKGltcG9ydEtleXdvcmRLaW5kICE9PSBLV19JbXBvcnQpXG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayhvcEltcG9ydEdsb2JhbCA9PT0gbnVsbCwgbGluZTAubG9jLCAnQ2FuXFwndCB1c2UgZ2xvYmFsIGhlcmUuJylcblx0XHRcdFx0cmV0dXJuIHtpbXBvcnRzLCBvcEltcG9ydEdsb2JhbCwgcmVzdDogdG9rZW5zLnRhaWwoKX1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHtpbXBvcnRzOiBbXSwgb3BJbXBvcnRHbG9iYWw6IG51bGwsIHJlc3Q6IHRva2Vuc31cblx0fSxcblxuXHRwYXJzZUltcG9ydHMgPSAoaW1wb3J0S2V5d29yZEtpbmQsIHRva2VucykgPT4ge1xuXHRcdGNvbnN0IGxpbmVzID0ganVzdEJsb2NrKGltcG9ydEtleXdvcmRLaW5kLCB0b2tlbnMpXG5cdFx0bGV0IG9wSW1wb3J0R2xvYmFsID0gbnVsbFxuXG5cdFx0Y29uc3QgaW1wb3J0cyA9IFtdXG5cblx0XHRmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMuc2xpY2VzKCkpIHtcblx0XHRcdGNvbnN0IHtwYXRoLCBuYW1lfSA9IHBhcnNlUmVxdWlyZShsaW5lLmhlYWQoKSlcblx0XHRcdGlmIChpbXBvcnRLZXl3b3JkS2luZCA9PT0gS1dfSW1wb3J0RG8pIHtcblx0XHRcdFx0aWYgKGxpbmUuc2l6ZSgpID4gMSlcblx0XHRcdFx0XHR1bmV4cGVjdGVkKGxpbmUuc2Vjb25kKCkpXG5cdFx0XHRcdGltcG9ydHMucHVzaChuZXcgSW1wb3J0RG8obGluZS5sb2MsIHBhdGgpKVxuXHRcdFx0fSBlbHNlXG5cdFx0XHRcdGlmIChwYXRoID09PSAnZ2xvYmFsJykge1xuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2sob3BJbXBvcnRHbG9iYWwgPT09IG51bGwsIGxpbmUubG9jLCAnQ2FuXFwndCB1c2UgZ2xvYmFsIHR3aWNlJylcblx0XHRcdFx0XHRjb25zdCB7aW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdH0gPVxuXHRcdFx0XHRcdFx0cGFyc2VUaGluZ3NJbXBvcnRlZChuYW1lLCBmYWxzZSwgbGluZS50YWlsKCkpXG5cdFx0XHRcdFx0b3BJbXBvcnRHbG9iYWwgPSBuZXcgSW1wb3J0R2xvYmFsKGxpbmUubG9jLCBpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0KVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IHtpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0fSA9XG5cdFx0XHRcdFx0XHRwYXJzZVRoaW5nc0ltcG9ydGVkKG5hbWUsIGltcG9ydEtleXdvcmRLaW5kID09PSBLV19JbXBvcnRMYXp5LCBsaW5lLnRhaWwoKSlcblx0XHRcdFx0XHRpbXBvcnRzLnB1c2gobmV3IEltcG9ydChsaW5lLmxvYywgcGF0aCwgaW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdCkpXG5cdFx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4ge2ltcG9ydHMsIG9wSW1wb3J0R2xvYmFsfVxuXHR9LFxuXG5cdHBhcnNlVGhpbmdzSW1wb3J0ZWQgPSAobmFtZSwgaXNMYXp5LCB0b2tlbnMpID0+IHtcblx0XHRjb25zdCBpbXBvcnREZWZhdWx0ID0gKCkgPT5cblx0XHRcdExvY2FsRGVjbGFyZS51bnR5cGVkKHRva2Vucy5sb2MsIG5hbWUsIGlzTGF6eSA/IExEX0xhenkgOiBMRF9Db25zdClcblx0XHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRcdHJldHVybiB7aW1wb3J0ZWQ6IFtdLCBvcEltcG9ydERlZmF1bHQ6IGltcG9ydERlZmF1bHQoKX1cblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IFtvcEltcG9ydERlZmF1bHQsIHJlc3RdID0gaXNLZXl3b3JkKEtXX0ZvY3VzLCB0b2tlbnMuaGVhZCgpKSA/XG5cdFx0XHRcdFtpbXBvcnREZWZhdWx0KCksIHRva2Vucy50YWlsKCldIDpcblx0XHRcdFx0W251bGwsIHRva2Vuc11cblx0XHRcdGNvbnN0IGltcG9ydGVkID0gcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKHJlc3QpLm1hcChsID0+IHtcblx0XHRcdFx0Y29udGV4dC5jaGVjayhsLm5hbWUgIT09ICdfJywgbC5wb3MsXG5cdFx0XHRcdFx0KCkgPT4gYCR7Y29kZSgnXycpfSBub3QgYWxsb3dlZCBhcyBpbXBvcnQgbmFtZS5gKVxuXHRcdFx0XHRpZiAoaXNMYXp5KVxuXHRcdFx0XHRcdGwua2luZCA9IExEX0xhenlcblx0XHRcdFx0cmV0dXJuIGxcblx0XHRcdH0pXG5cdFx0XHRyZXR1cm4ge2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9XG5cdFx0fVxuXHR9LFxuXG5cdHBhcnNlUmVxdWlyZSA9IHRva2VuID0+IHtcblx0XHRjb25zdCBuYW1lID0gdHJ5UGFyc2VOYW1lKHRva2VuKVxuXHRcdGlmIChuYW1lICE9PSBudWxsKVxuXHRcdFx0cmV0dXJuIHtwYXRoOiBuYW1lLCBuYW1lfVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29udGV4dC5jaGVjayhpc0dyb3VwKEdfU3BhY2UsIHRva2VuKSwgdG9rZW4ubG9jLCAnTm90IGEgdmFsaWQgbW9kdWxlIG5hbWUuJylcblx0XHRcdGNvbnN0IHRva2VucyA9IFNsaWNlLmdyb3VwKHRva2VuKVxuXG5cdFx0XHQvLyBUYWtlIGxlYWRpbmcgZG90cy4gVGhlcmUgY2FuIGJlIGFueSBudW1iZXIsIHNvIGNvdW50IGVsbGlwc2lzIGFzIDMgZG90cyBpbiBhIHJvdy5cblx0XHRcdGxldCByZXN0ID0gdG9rZW5zXG5cdFx0XHRjb25zdCBwYXJ0cyA9IFtdXG5cdFx0XHRjb25zdCBpc0RvdHR5ID0gXyA9PlxuXHRcdFx0XHRpc0tleXdvcmQoS1dfRG90LCBfKSB8fCBpc0tleXdvcmQoS1dfRWxsaXBzaXMsIF8pXG5cdFx0XHRjb25zdCBoZWFkID0gcmVzdC5oZWFkKClcblx0XHRcdGlmIChpc0RvdHR5KGhlYWQpKSB7XG5cdFx0XHRcdHBhcnRzLnB1c2goJy4nKVxuXHRcdFx0XHRpZiAoaXNLZXl3b3JkKEtXX0VsbGlwc2lzLCBoZWFkKSkge1xuXHRcdFx0XHRcdHBhcnRzLnB1c2goJy4uJylcblx0XHRcdFx0XHRwYXJ0cy5wdXNoKCcuLicpXG5cdFx0XHRcdH1cblx0XHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cblx0XHRcdFx0d2hpbGUgKCFyZXN0LmlzRW1wdHkoKSAmJiBpc0RvdHR5KHJlc3QuaGVhZCgpKSkge1xuXHRcdFx0XHRcdHBhcnRzLnB1c2goJy4uJylcblx0XHRcdFx0XHRpZiAoaXNLZXl3b3JkKEtXX0VsbGlwc2lzLCByZXN0LmhlYWQoKSkpIHtcblx0XHRcdFx0XHRcdHBhcnRzLnB1c2goJy4uJylcblx0XHRcdFx0XHRcdHBhcnRzLnB1c2goJy4uJylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gVGFrZSBuYW1lLCB0aGVuIGFueSBudW1iZXIgb2YgZG90LXRoZW4tbmFtZSAoYC54YClcblx0XHRcdGZvciAoOzspIHtcblx0XHRcdFx0Y2hlY2tOb25FbXB0eShyZXN0KVxuXHRcdFx0XHRwYXJ0cy5wdXNoKHBhcnNlTmFtZShyZXN0LmhlYWQoKSkpXG5cdFx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXG5cdFx0XHRcdGlmIChyZXN0LmlzRW1wdHkoKSlcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdC8vIElmIHRoZXJlJ3Mgc29tZXRoaW5nIGxlZnQsIGl0IHNob3VsZCBiZSBhIGRvdCwgZm9sbG93ZWQgYnkgYSBuYW1lLlxuXHRcdFx0XHRpZiAoIWlzS2V5d29yZChLV19Eb3QsIHJlc3QuaGVhZCgpKSlcblx0XHRcdFx0XHR1bmV4cGVjdGVkKHJlc3QuaGVhZCgpKVxuXHRcdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHtwYXRoOiBwYXJ0cy5qb2luKCcvJyksIG5hbWU6IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdfVxuXHRcdH1cblx0fVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

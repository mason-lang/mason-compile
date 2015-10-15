if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../../CompileError', '../context', '../MsAst', '../Token', './checks', './parseBlock', './parseLocalDeclares', './parseName', './Slice', './tryTakeComment'], function (exports, module, _CompileError, _context, _MsAst, _Token, _checks, _parseBlock, _parseLocalDeclares, _parseName, _Slice, _tryTakeComment3) {
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

		if (_context.options.includeModuleName()) {
			const name = new _MsAst.LocalDeclareName(tokens.loc);
			const assign = new _MsAst.AssignSingle(tokens.loc, name, _MsAst.Quote.forString(tokens.loc, _context.options.moduleName()));
			lines.push(new _MsAst.ModuleExportNamed(tokens.loc, assign));
		}

		const imports = plainImports.concat(lazyImports);
		return new _MsAst.Module(tokens.loc, _context.options.moduleName(), opComment, doImports, imports, opImportGlobal, lines);
	};

	const tryParseImports = (importKeywordKind, tokens) => {
		if (!tokens.isEmpty()) {
			const line0 = tokens.headSlice();
			if ((0, _Token.isKeyword)(importKeywordKind, line0.head())) {
				var _parseImports = parseImports(importKeywordKind, line0.tail());

				const imports = _parseImports.imports;
				const opImportGlobal = _parseImports.opImportGlobal;

				if (importKeywordKind !== _Token.KW_Import) (0, _context.check)(opImportGlobal === null, line0.loc, 'Can\'t use global here.');
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
				if (line.size() > 1) (0, _checks.unexpected)(line.second());
				imports.push(new _MsAst.ImportDo(line.loc, path));
			} else if (path === 'global') {
				(0, _context.check)(opImportGlobal === null, line.loc, 'Can\'t use global twice');

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
				(0, _context.check)(l.name !== '_', l.pos, () => `${ (0, _CompileError.code)('_') } not allowed as import name.`);
				if (isLazy) l.kind = _MsAst.LD_Lazy;
				return l;
			});
			return { imported, opImportDefault };
		}
	},
	      parseRequire = token => {
		const name = (0, _parseName.tryParseName)(token);
		if (name !== null) return { path: name, name };else {
			(0, _context.check)((0, _Token.isGroup)(_Token.G_Space, token), token.loc, 'Not a valid module name.');
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
				(0, _checks.checkNonEmpty)(rest);
				parts.push((0, _parseName2.default)(rest.head()));
				rest = rest.tail();

				if (rest.isEmpty()) break;

				// If there's something left, it should be a dot, followed by a name.
				if (!(0, _Token.isKeyword)(_Token.KW_Dot, rest.head())) (0, _checks.unexpected)(rest.head());
				rest = rest.tail();
			}

			return { path: parts.join('/'), name: parts[parts.length - 1] };
		}
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlTW9kdWxlLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZU1vZHVsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztrQkNhZSxNQUFNLElBQUk7Ozt3QkFFRyw4QkFBZSxNQUFNLENBQUM7Ozs7UUFBMUMsU0FBUztRQUFFLEtBQUs7Ozs7eUJBRW1CLGVBQWUsUUFicUIsV0FBVyxFQWFsQixLQUFLLENBQUM7O1FBQTdELFNBQVMsb0JBQWxCLE9BQU87UUFBbUIsS0FBSyxvQkFBWCxJQUFJOzswQkFDOEIsZUFBZSxRQWRULFNBQVMsRUFjWSxLQUFLLENBQUM7O1FBQTlFLFlBQVkscUJBQXJCLE9BQU87UUFBZ0IsY0FBYyxxQkFBZCxjQUFjO1FBQVEsS0FBSyxxQkFBWCxJQUFJOzswQkFDTixlQUFlLFFBZDNELGFBQWEsRUFjOEQsS0FBSyxDQUFDOztRQUFqRSxXQUFXLHFCQUFwQixPQUFPO1FBQXFCLEtBQUsscUJBQVgsSUFBSTs7QUFFakMsUUFBTSxLQUFLLEdBQUcsZ0JBZEksZ0JBQWdCLEVBY0gsS0FBSyxDQUFDLENBQUE7O0FBRXJDLE1BQUksU0F0QlUsT0FBTyxDQXNCVCxpQkFBaUIsRUFBRSxFQUFFO0FBQ2hDLFNBQU0sSUFBSSxHQUFHLFdBckJkLGdCQUFnQixDQXFCbUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQzdDLFNBQU0sTUFBTSxHQUFHLFdBdkJULFlBQVksQ0F1QmMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQy9DLE9BdkIyQyxLQUFLLENBdUIxQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxTQXpCaEIsT0FBTyxDQXlCaUIsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ25ELFFBQUssQ0FBQyxJQUFJLENBQUMsV0F4QmMsaUJBQWlCLENBd0JULE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQTtHQUNyRDs7QUFFRCxRQUFNLE9BQU8sR0FBRyxZQUFZ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LENBQUMsRUFBRTtBQUMvQyxVQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2hCLFNBQUksV0FwSGlCLFNBQVMsU0FBVSxXQUFXLEVBb0h4QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRTtBQUN4QyxXQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2hCLFdBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7TUFDaEI7QUFDRCxTQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO0tBQ2xCO0lBQ0Q7OztBQUdELFlBQVM7QUFDUixnQkE1SEksYUFBYSxFQTRISCxJQUFJLENBQUMsQ0FBQTtBQUNuQixTQUFLLENBQUMsSUFBSSxDQUFDLHlCQUFVLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDbEMsUUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTs7QUFFbEIsUUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQ2pCLE1BQUs7OztBQUdOLFFBQUksQ0FBQyxXQXRJaUIsU0FBUyxTQUFFLE1BQU0sRUFzSWhCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUNsQyxZQXJJa0IsVUFBVSxFQXFJakIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7QUFDeEIsUUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUNsQjs7QUFFRCxVQUFPLEVBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFDLENBQUE7R0FDN0Q7RUFDRCxDQUFBIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvcGFyc2VNb2R1bGUuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVjaywgb3B0aW9uc30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7QXNzaWduU2luZ2xlLCBJbXBvcnREbywgSW1wb3J0R2xvYmFsLCBJbXBvcnQsIExEX0NvbnN0LCBMRF9MYXp5LCBMb2NhbERlY2xhcmUsXG5cdExvY2FsRGVjbGFyZU5hbWUsIE1vZHVsZSwgTW9kdWxlRXhwb3J0TmFtZWQsIFF1b3RlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R19TcGFjZSwgaXNHcm91cCwgaXNLZXl3b3JkLCBLV19Eb3QsIEtXX0VsbGlwc2lzLCBLV19Gb2N1cywgS1dfSW1wb3J0LCBLV19JbXBvcnREbyxcblx0S1dfSW1wb3J0TGF6eX0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2NoZWNrTm9uRW1wdHksIHVuZXhwZWN0ZWR9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtqdXN0QmxvY2ssIHBhcnNlTW9kdWxlQmxvY2t9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCB7cGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzfSBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcbmltcG9ydCBwYXJzZU5hbWUsIHt0cnlQYXJzZU5hbWV9IGZyb20gJy4vcGFyc2VOYW1lJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5pbXBvcnQgdHJ5VGFrZUNvbW1lbnQgZnJvbSAnLi90cnlUYWtlQ29tbWVudCdcblxuZXhwb3J0IGRlZmF1bHQgdG9rZW5zID0+IHtcblx0Ly8gTW9kdWxlIGRvYyBjb21tZW50IG11c3QgY29tZSBmaXJzdC5cblx0Y29uc3QgW29wQ29tbWVudCwgcmVzdDBdID0gdHJ5VGFrZUNvbW1lbnQodG9rZW5zKVxuXHQvLyBJbXBvcnQgc3RhdGVtZW50cyBtdXN0IGFwcGVhciBpbiBvcmRlci5cblx0Y29uc3Qge2ltcG9ydHM6IGRvSW1wb3J0cywgcmVzdDogcmVzdDF9ID0gdHJ5UGFyc2VJbXBvcnRzKEtXX0ltcG9ydERvLCByZXN0MClcblx0Y29uc3Qge2ltcG9ydHM6IHBsYWluSW1wb3J0cywgb3BJbXBvcnRHbG9iYWwsIHJlc3Q6IHJlc3QyfSA9IHRyeVBhcnNlSW1wb3J0cyhLV19JbXBvcnQsIHJlc3QxKVxuXHRjb25zdCB7aW1wb3J0czogbGF6eUltcG9ydHMsIHJlc3Q6IHJlc3QzfSA9IHRyeVBhcnNlSW1wb3J0cyhLV19JbXBvcnRMYXp5LCByZXN0MilcblxuXHRjb25zdCBsaW5lcyA9IHBhcnNlTW9kdWxlQmxvY2socmVzdDMpXG5cblx0aWYgKG9wdGlvbnMuaW5jbHVkZU1vZHVsZU5hbWUoKSkge1xuXHRcdGNvbnN0IG5hbWUgPSBuZXcgTG9jYWxEZWNsYXJlTmFtZSh0b2tlbnMubG9jKVxuXHRcdGNvbnN0IGFzc2lnbiA9IG5ldyBBc3NpZ25TaW5nbGUodG9rZW5zLmxvYywgbmFtZSxcblx0XHRcdFF1b3RlLmZvclN0cmluZyh0b2tlbnMubG9jLCBvcHRpb25zLm1vZHVsZU5hbWUoKSkpXG5cdFx0bGluZXMucHVzaChuZXcgTW9kdWxlRXhwb3J0TmFtZWQodG9rZW5zLmxvYywgYXNzaWduKSlcblx0fVxuXG5cdGNvbnN0IGltcG9ydHMgPSBwbGFpbkltcG9ydHMuY29uY2F0KGxhenlJbXBvcnRzKVxuXHRyZXR1cm4gbmV3IE1vZHVsZShcblx0XHR0b2tlbnMubG9jLCBvcHRpb25zLm1vZHVsZU5hbWUoKSwgb3BDb21tZW50LCBkb0ltcG9ydHMsIGltcG9ydHMsIG9wSW1wb3J0R2xvYmFsLCBsaW5lcylcbn1cblxuY29uc3Rcblx0dHJ5UGFyc2VJbXBvcnRzID0gKGltcG9ydEtleXdvcmRLaW5kLCB0b2tlbnMpID0+IHtcblx0XHRpZiAoIXRva2Vucy5pc0VtcHR5KCkpIHtcblx0XHRcdGNvbnN0IGxpbmUwID0gdG9rZW5zLmhlYWRTbGljZSgpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKGltcG9ydEtleXdvcmRLaW5kLCBsaW5lMC5oZWFkKCkpKSB7XG5cdFx0XHRcdGNvbnN0IHtpbXBvcnRzLCBvcEltcG9ydEdsb2JhbH0gPSBwYXJzZUltcG9ydHMoaW1wb3J0S2V5d29yZEtpbmQsIGxpbmUwLnRhaWwoKSlcblx0XHRcdFx0aWYgKGltcG9ydEtleXdvcmRLaW5kICE9PSBLV19JbXBvcnQpXG5cdFx0XHRcdFx0Y2hlY2sob3BJbXBvcnRHbG9iYWwgPT09IG51bGwsIGxpbmUwLmxvYywgJ0NhblxcJ3QgdXNlIGdsb2JhbCBoZXJlLicpXG5cdFx0XHRcdHJldHVybiB7aW1wb3J0cywgb3BJbXBvcnRHbG9iYWwsIHJlc3Q6IHRva2Vucy50YWlsKCl9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB7aW1wb3J0czogW10sIG9wSW1wb3J0R2xvYmFsOiBudWxsLCByZXN0OiB0b2tlbnN9XG5cdH0sXG5cblx0cGFyc2VJbXBvcnRzID0gKGltcG9ydEtleXdvcmRLaW5kLCB0b2tlbnMpID0+IHtcblx0XHRjb25zdCBsaW5lcyA9IGp1c3RCbG9jayhpbXBvcnRLZXl3b3JkS2luZCwgdG9rZW5zKVxuXHRcdGxldCBvcEltcG9ydEdsb2JhbCA9IG51bGxcblxuXHRcdGNvbnN0IGltcG9ydHMgPSBbXVxuXG5cdFx0Zm9yIChjb25zdCBsaW5lIG9mIGxpbmVzLnNsaWNlcygpKSB7XG5cdFx0XHRjb25zdCB7cGF0aCwgbmFtZX0gPSBwYXJzZVJlcXVpcmUobGluZS5oZWFkKCkpXG5cdFx0XHRpZiAoaW1wb3J0S2V5d29yZEtpbmQgPT09IEtXX0ltcG9ydERvKSB7XG5cdFx0XHRcdGlmIChsaW5lLnNpemUoKSA+IDEpXG5cdFx0XHRcdFx0dW5leHBlY3RlZChsaW5lLnNlY29uZCgpKVxuXHRcdFx0XHRpbXBvcnRzLnB1c2gobmV3IEltcG9ydERvKGxpbmUubG9jLCBwYXRoKSlcblx0XHRcdH0gZWxzZVxuXHRcdFx0XHRpZiAocGF0aCA9PT0gJ2dsb2JhbCcpIHtcblx0XHRcdFx0XHRjaGVjayhvcEltcG9ydEdsb2JhbCA9PT0gbnVsbCwgbGluZS5sb2MsICdDYW5cXCd0IHVzZSBnbG9iYWwgdHdpY2UnKVxuXHRcdFx0XHRcdGNvbnN0IHtpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0fSA9XG5cdFx0XHRcdFx0XHRwYXJzZVRoaW5nc0ltcG9ydGVkKG5hbWUsIGZhbHNlLCBsaW5lLnRhaWwoKSlcblx0XHRcdFx0XHRvcEltcG9ydEdsb2JhbCA9IG5ldyBJbXBvcnRHbG9iYWwobGluZS5sb2MsIGltcG9ydGVkLCBvcEltcG9ydERlZmF1bHQpXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3Qge2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9ID1cblx0XHRcdFx0XHRcdHBhcnNlVGhpbmdzSW1wb3J0ZWQobmFtZSwgaW1wb3J0S2V5d29yZEtpbmQgPT09IEtXX0ltcG9ydExhenksIGxpbmUudGFpbCgpKVxuXHRcdFx0XHRcdGltcG9ydHMucHVzaChuZXcgSW1wb3J0KGxpbmUubG9jLCBwYXRoLCBpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0KSlcblx0XHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7aW1wb3J0cywgb3BJbXBvcnRHbG9iYWx9XG5cdH0sXG5cblx0cGFyc2VUaGluZ3NJbXBvcnRlZCA9IChuYW1lLCBpc0xhenksIHRva2VucykgPT4ge1xuXHRcdGNvbnN0IGltcG9ydERlZmF1bHQgPSAoKSA9PlxuXHRcdFx0TG9jYWxEZWNsYXJlLnVudHlwZWQodG9rZW5zLmxvYywgbmFtZSwgaXNMYXp5ID8gTERfTGF6eSA6IExEX0NvbnN0KVxuXHRcdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdFx0cmV0dXJuIHtpbXBvcnRlZDogW10sIG9wSW1wb3J0RGVmYXVsdDogaW1wb3J0RGVmYXVsdCgpfVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgW29wSW1wb3J0RGVmYXVsdCwgcmVzdF0gPSBpc0tleXdvcmQoS1dfRm9jdXMsIHRva2Vucy5oZWFkKCkpID9cblx0XHRcdFx0W2ltcG9ydERlZmF1bHQoKSwgdG9rZW5zLnRhaWwoKV0gOlxuXHRcdFx0XHRbbnVsbCwgdG9rZW5zXVxuXHRcdFx0Y29uc3QgaW1wb3J0ZWQgPSBwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMocmVzdCkubWFwKGwgPT4ge1xuXHRcdFx0XHRjaGVjayhsLm5hbWUgIT09ICdfJywgbC5wb3MsICgpID0+IGAke2NvZGUoJ18nKX0gbm90IGFsbG93ZWQgYXMgaW1wb3J0IG5hbWUuYClcblx0XHRcdFx0aWYgKGlzTGF6eSlcblx0XHRcdFx0XHRsLmtpbmQgPSBMRF9MYXp5XG5cdFx0XHRcdHJldHVybiBsXG5cdFx0XHR9KVxuXHRcdFx0cmV0dXJuIHtpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0fVxuXHRcdH1cblx0fSxcblxuXHRwYXJzZVJlcXVpcmUgPSB0b2tlbiA9PiB7XG5cdFx0Y29uc3QgbmFtZSA9IHRyeVBhcnNlTmFtZSh0b2tlbilcblx0XHRpZiAobmFtZSAhPT0gbnVsbClcblx0XHRcdHJldHVybiB7cGF0aDogbmFtZSwgbmFtZX1cblx0XHRlbHNlIHtcblx0XHRcdGNoZWNrKGlzR3JvdXAoR19TcGFjZSwgdG9rZW4pLCB0b2tlbi5sb2MsICdOb3QgYSB2YWxpZCBtb2R1bGUgbmFtZS4nKVxuXHRcdFx0Y29uc3QgdG9rZW5zID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cblx0XHRcdC8vIFRha2UgbGVhZGluZyBkb3RzLiBUaGVyZSBjYW4gYmUgYW55IG51bWJlciwgc28gY291bnQgZWxsaXBzaXMgYXMgMyBkb3RzIGluIGEgcm93LlxuXHRcdFx0bGV0IHJlc3QgPSB0b2tlbnNcblx0XHRcdGNvbnN0IHBhcnRzID0gW11cblx0XHRcdGNvbnN0IGlzRG90dHkgPSBfID0+XG5cdFx0XHRcdGlzS2V5d29yZChLV19Eb3QsIF8pIHx8IGlzS2V5d29yZChLV19FbGxpcHNpcywgXylcblx0XHRcdGNvbnN0IGhlYWQgPSByZXN0LmhlYWQoKVxuXHRcdFx0aWYgKGlzRG90dHkoaGVhZCkpIHtcblx0XHRcdFx0cGFydHMucHVzaCgnLicpXG5cdFx0XHRcdGlmIChpc0tleXdvcmQoS1dfRWxsaXBzaXMsIGhlYWQpKSB7XG5cdFx0XHRcdFx0cGFydHMucHVzaCgnLi4nKVxuXHRcdFx0XHRcdHBhcnRzLnB1c2goJy4uJylcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblxuXHRcdFx0XHR3aGlsZSAoIXJlc3QuaXNFbXB0eSgpICYmIGlzRG90dHkocmVzdC5oZWFkKCkpKSB7XG5cdFx0XHRcdFx0cGFydHMucHVzaCgnLi4nKVxuXHRcdFx0XHRcdGlmIChpc0tleXdvcmQoS1dfRWxsaXBzaXMsIHJlc3QuaGVhZCgpKSkge1xuXHRcdFx0XHRcdFx0cGFydHMucHVzaCgnLi4nKVxuXHRcdFx0XHRcdFx0cGFydHMucHVzaCgnLi4nKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBUYWtlIG5hbWUsIHRoZW4gYW55IG51bWJlciBvZiBkb3QtdGhlbi1uYW1lIChgLnhgKVxuXHRcdFx0Zm9yICg7Oykge1xuXHRcdFx0XHRjaGVja05vbkVtcHR5KHJlc3QpXG5cdFx0XHRcdHBhcnRzLnB1c2gocGFyc2VOYW1lKHJlc3QuaGVhZCgpKSlcblx0XHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cblx0XHRcdFx0aWYgKHJlc3QuaXNFbXB0eSgpKVxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0Ly8gSWYgdGhlcmUncyBzb21ldGhpbmcgbGVmdCwgaXQgc2hvdWxkIGJlIGEgZG90LCBmb2xsb3dlZCBieSBhIG5hbWUuXG5cdFx0XHRcdGlmICghaXNLZXl3b3JkKEtXX0RvdCwgcmVzdC5oZWFkKCkpKVxuXHRcdFx0XHRcdHVuZXhwZWN0ZWQocmVzdC5oZWFkKCkpXG5cdFx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4ge3BhdGg6IHBhcnRzLmpvaW4oJy8nKSwgbmFtZTogcGFydHNbcGFydHMubGVuZ3RoIC0gMV19XG5cdFx0fVxuXHR9XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

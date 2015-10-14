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
		return new _MsAst.Module(tokens.loc, opComment, doImports, imports, opImportGlobal, lines);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlTW9kdWxlLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZU1vZHVsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztrQkNhZSxNQUFNLElBQUk7Ozt3QkFFRyw4QkFBZSxNQUFNLENBQUM7Ozs7UUFBMUMsU0FBUztRQUFFLEtBQUs7Ozs7eUJBRW1CLGVBQWUsUUFicUIsV0FBVyxFQWFsQixLQUFLLENBQUM7O1FBQTdELFNBQVMsb0JBQWxCLE9BQU87UUFBbUIsS0FBSyxvQkFBWCxJQUFJOzswQkFDOEIsZUFBZSxRQWRULFNBQVMsRUFjWSxLQUFLLENBQUM7O1FBQTlFLFlBQVkscUJBQXJCLE9BQU87UUFBZ0IsY0FBYyxxQkFBZCxjQUFjO1FBQVEsS0FBSyxxQkFBWCxJQUFJOzswQkFDTixlQUFlLFFBZDNELGFBQWEsRUFjOEQsS0FBSyxDQUFDOztRQUFqRSxXQUFXLHFCQUFwQixPQUFPO1FBQXFCLEtBQUsscUJBQVgsSUFBSTs7QUFFakMsUUFBTSxLQUFLLEdBQUcsZ0JBZEksZ0JBQWdCLEVBY0gsS0FBSyxDQUFDLENBQUE7O0FBRXJDLE1BQUksU0F0QlUsT0FBTyxDQXNCVCxpQkFBaUIsRUFBRSxFQUFFO0FBQ2hDLFNBQU0sSUFBSSxHQUFHLFdBckJkLGdCQUFnQixDQXFCbUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQzdDLFNBQU0sTUFBTSxHQUFHLFdBdkJULFlBQVksQ0F1QmMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQy9DLE9BdkIyQyxLQUFLLENBdUIxQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxTQXpCaEIsT0FBTyxDQXlCaUIsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ25ELFFBQUssQ0FBQyxJQUFJLENBQUMsV0F4QmMsaUJBQWlCLENBd0JULE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQTtHQUNyRDs7QUFFRCxRQUFNLE9BQU8sR0FBRyxZQUFZ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Q0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNoQixTQUFJLFdBcEhpQixTQUFTLFNBQVUsV0FBVyxFQW9IeEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUU7QUFDeEMsV0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNoQixXQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO01BQ2hCO0FBQ0QsU0FBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtLQUNsQjtJQUNEOzs7QUFHRCxZQUFTO0FBQ1IsZ0JBNUhJLGFBQWEsRUE0SEgsSUFBSSxDQUFDLENBQUE7QUFDbkIsU0FBSyxDQUFDLElBQUksQ0FBQyx5QkFBVSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ2xDLFFBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7O0FBRWxCLFFBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUNqQixNQUFLOzs7QUFHTixRQUFJLENBQUMsV0F0SWlCLFNBQVMsU0FBRSxNQUFNLEVBc0loQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFDbEMsWUFySWtCLFVBQVUsRUFxSWpCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQ3hCLFFBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7SUFDbEI7O0FBRUQsVUFBTyxFQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBQyxDQUFBO0dBQzdEO0VBQ0QsQ0FBQSIsImZpbGUiOiJwcml2YXRlL3BhcnNlL3BhcnNlTW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2ssIG9wdGlvbnN9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0Fzc2lnblNpbmdsZSwgSW1wb3J0RG8sIEltcG9ydEdsb2JhbCwgSW1wb3J0LCBMRF9Db25zdCwgTERfTGF6eSwgTG9jYWxEZWNsYXJlLFxuXHRMb2NhbERlY2xhcmVOYW1lLCBNb2R1bGUsIE1vZHVsZUV4cG9ydE5hbWVkLCBRdW90ZX0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dfU3BhY2UsIGlzR3JvdXAsIGlzS2V5d29yZCwgS1dfRG90LCBLV19FbGxpcHNpcywgS1dfRm9jdXMsIEtXX0ltcG9ydCwgS1dfSW1wb3J0RG8sXG5cdEtXX0ltcG9ydExhenl9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtjaGVja05vbkVtcHR5LCB1bmV4cGVjdGVkfSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7anVzdEJsb2NrLCBwYXJzZU1vZHVsZUJsb2NrfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQge3BhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lc30gZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5pbXBvcnQgcGFyc2VOYW1lLCB7dHJ5UGFyc2VOYW1lfSBmcm9tICcuL3BhcnNlTmFtZSdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuaW1wb3J0IHRyeVRha2VDb21tZW50IGZyb20gJy4vdHJ5VGFrZUNvbW1lbnQnXG5cbmV4cG9ydCBkZWZhdWx0IHRva2VucyA9PiB7XG5cdC8vIE1vZHVsZSBkb2MgY29tbWVudCBtdXN0IGNvbWUgZmlyc3QuXG5cdGNvbnN0IFtvcENvbW1lbnQsIHJlc3QwXSA9IHRyeVRha2VDb21tZW50KHRva2Vucylcblx0Ly8gSW1wb3J0IHN0YXRlbWVudHMgbXVzdCBhcHBlYXIgaW4gb3JkZXIuXG5cdGNvbnN0IHtpbXBvcnRzOiBkb0ltcG9ydHMsIHJlc3Q6IHJlc3QxfSA9IHRyeVBhcnNlSW1wb3J0cyhLV19JbXBvcnREbywgcmVzdDApXG5cdGNvbnN0IHtpbXBvcnRzOiBwbGFpbkltcG9ydHMsIG9wSW1wb3J0R2xvYmFsLCByZXN0OiByZXN0Mn0gPSB0cnlQYXJzZUltcG9ydHMoS1dfSW1wb3J0LCByZXN0MSlcblx0Y29uc3Qge2ltcG9ydHM6IGxhenlJbXBvcnRzLCByZXN0OiByZXN0M30gPSB0cnlQYXJzZUltcG9ydHMoS1dfSW1wb3J0TGF6eSwgcmVzdDIpXG5cblx0Y29uc3QgbGluZXMgPSBwYXJzZU1vZHVsZUJsb2NrKHJlc3QzKVxuXG5cdGlmIChvcHRpb25zLmluY2x1ZGVNb2R1bGVOYW1lKCkpIHtcblx0XHRjb25zdCBuYW1lID0gbmV3IExvY2FsRGVjbGFyZU5hbWUodG9rZW5zLmxvYylcblx0XHRjb25zdCBhc3NpZ24gPSBuZXcgQXNzaWduU2luZ2xlKHRva2Vucy5sb2MsIG5hbWUsXG5cdFx0XHRRdW90ZS5mb3JTdHJpbmcodG9rZW5zLmxvYywgb3B0aW9ucy5tb2R1bGVOYW1lKCkpKVxuXHRcdGxpbmVzLnB1c2gobmV3IE1vZHVsZUV4cG9ydE5hbWVkKHRva2Vucy5sb2MsIGFzc2lnbikpXG5cdH1cblxuXHRjb25zdCBpbXBvcnRzID0gcGxhaW5JbXBvcnRzLmNvbmNhdChsYXp5SW1wb3J0cylcblx0cmV0dXJuIG5ldyBNb2R1bGUoXG5cdFx0dG9rZW5zLmxvYywgb3BDb21tZW50LCBkb0ltcG9ydHMsIGltcG9ydHMsIG9wSW1wb3J0R2xvYmFsLCBsaW5lcylcbn1cblxuY29uc3Rcblx0dHJ5UGFyc2VJbXBvcnRzID0gKGltcG9ydEtleXdvcmRLaW5kLCB0b2tlbnMpID0+IHtcblx0XHRpZiAoIXRva2Vucy5pc0VtcHR5KCkpIHtcblx0XHRcdGNvbnN0IGxpbmUwID0gdG9rZW5zLmhlYWRTbGljZSgpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKGltcG9ydEtleXdvcmRLaW5kLCBsaW5lMC5oZWFkKCkpKSB7XG5cdFx0XHRcdGNvbnN0IHtpbXBvcnRzLCBvcEltcG9ydEdsb2JhbH0gPSBwYXJzZUltcG9ydHMoaW1wb3J0S2V5d29yZEtpbmQsIGxpbmUwLnRhaWwoKSlcblx0XHRcdFx0aWYgKGltcG9ydEtleXdvcmRLaW5kICE9PSBLV19JbXBvcnQpXG5cdFx0XHRcdFx0Y2hlY2sob3BJbXBvcnRHbG9iYWwgPT09IG51bGwsIGxpbmUwLmxvYywgJ0NhblxcJ3QgdXNlIGdsb2JhbCBoZXJlLicpXG5cdFx0XHRcdHJldHVybiB7aW1wb3J0cywgb3BJbXBvcnRHbG9iYWwsIHJlc3Q6IHRva2Vucy50YWlsKCl9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB7aW1wb3J0czogW10sIG9wSW1wb3J0R2xvYmFsOiBudWxsLCByZXN0OiB0b2tlbnN9XG5cdH0sXG5cblx0cGFyc2VJbXBvcnRzID0gKGltcG9ydEtleXdvcmRLaW5kLCB0b2tlbnMpID0+IHtcblx0XHRjb25zdCBsaW5lcyA9IGp1c3RCbG9jayhpbXBvcnRLZXl3b3JkS2luZCwgdG9rZW5zKVxuXHRcdGxldCBvcEltcG9ydEdsb2JhbCA9IG51bGxcblxuXHRcdGNvbnN0IGltcG9ydHMgPSBbXVxuXG5cdFx0Zm9yIChjb25zdCBsaW5lIG9mIGxpbmVzLnNsaWNlcygpKSB7XG5cdFx0XHRjb25zdCB7cGF0aCwgbmFtZX0gPSBwYXJzZVJlcXVpcmUobGluZS5oZWFkKCkpXG5cdFx0XHRpZiAoaW1wb3J0S2V5d29yZEtpbmQgPT09IEtXX0ltcG9ydERvKSB7XG5cdFx0XHRcdGlmIChsaW5lLnNpemUoKSA+IDEpXG5cdFx0XHRcdFx0dW5leHBlY3RlZChsaW5lLnNlY29uZCgpKVxuXHRcdFx0XHRpbXBvcnRzLnB1c2gobmV3IEltcG9ydERvKGxpbmUubG9jLCBwYXRoKSlcblx0XHRcdH0gZWxzZVxuXHRcdFx0XHRpZiAocGF0aCA9PT0gJ2dsb2JhbCcpIHtcblx0XHRcdFx0XHRjaGVjayhvcEltcG9ydEdsb2JhbCA9PT0gbnVsbCwgbGluZS5sb2MsICdDYW5cXCd0IHVzZSBnbG9iYWwgdHdpY2UnKVxuXHRcdFx0XHRcdGNvbnN0IHtpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0fSA9XG5cdFx0XHRcdFx0XHRwYXJzZVRoaW5nc0ltcG9ydGVkKG5hbWUsIGZhbHNlLCBsaW5lLnRhaWwoKSlcblx0XHRcdFx0XHRvcEltcG9ydEdsb2JhbCA9IG5ldyBJbXBvcnRHbG9iYWwobGluZS5sb2MsIGltcG9ydGVkLCBvcEltcG9ydERlZmF1bHQpXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3Qge2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9ID1cblx0XHRcdFx0XHRcdHBhcnNlVGhpbmdzSW1wb3J0ZWQobmFtZSwgaW1wb3J0S2V5d29yZEtpbmQgPT09IEtXX0ltcG9ydExhenksIGxpbmUudGFpbCgpKVxuXHRcdFx0XHRcdGltcG9ydHMucHVzaChuZXcgSW1wb3J0KGxpbmUubG9jLCBwYXRoLCBpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0KSlcblx0XHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7aW1wb3J0cywgb3BJbXBvcnRHbG9iYWx9XG5cdH0sXG5cblx0cGFyc2VUaGluZ3NJbXBvcnRlZCA9IChuYW1lLCBpc0xhenksIHRva2VucykgPT4ge1xuXHRcdGNvbnN0IGltcG9ydERlZmF1bHQgPSAoKSA9PlxuXHRcdFx0TG9jYWxEZWNsYXJlLnVudHlwZWQodG9rZW5zLmxvYywgbmFtZSwgaXNMYXp5ID8gTERfTGF6eSA6IExEX0NvbnN0KVxuXHRcdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdFx0cmV0dXJuIHtpbXBvcnRlZDogW10sIG9wSW1wb3J0RGVmYXVsdDogaW1wb3J0RGVmYXVsdCgpfVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgW29wSW1wb3J0RGVmYXVsdCwgcmVzdF0gPSBpc0tleXdvcmQoS1dfRm9jdXMsIHRva2Vucy5oZWFkKCkpID9cblx0XHRcdFx0W2ltcG9ydERlZmF1bHQoKSwgdG9rZW5zLnRhaWwoKV0gOlxuXHRcdFx0XHRbbnVsbCwgdG9rZW5zXVxuXHRcdFx0Y29uc3QgaW1wb3J0ZWQgPSBwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMocmVzdCkubWFwKGwgPT4ge1xuXHRcdFx0XHRjaGVjayhsLm5hbWUgIT09ICdfJywgbC5wb3MsICgpID0+IGAke2NvZGUoJ18nKX0gbm90IGFsbG93ZWQgYXMgaW1wb3J0IG5hbWUuYClcblx0XHRcdFx0aWYgKGlzTGF6eSlcblx0XHRcdFx0XHRsLmtpbmQgPSBMRF9MYXp5XG5cdFx0XHRcdHJldHVybiBsXG5cdFx0XHR9KVxuXHRcdFx0cmV0dXJuIHtpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0fVxuXHRcdH1cblx0fSxcblxuXHRwYXJzZVJlcXVpcmUgPSB0b2tlbiA9PiB7XG5cdFx0Y29uc3QgbmFtZSA9IHRyeVBhcnNlTmFtZSh0b2tlbilcblx0XHRpZiAobmFtZSAhPT0gbnVsbClcblx0XHRcdHJldHVybiB7cGF0aDogbmFtZSwgbmFtZX1cblx0XHRlbHNlIHtcblx0XHRcdGNoZWNrKGlzR3JvdXAoR19TcGFjZSwgdG9rZW4pLCB0b2tlbi5sb2MsICdOb3QgYSB2YWxpZCBtb2R1bGUgbmFtZS4nKVxuXHRcdFx0Y29uc3QgdG9rZW5zID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cblx0XHRcdC8vIFRha2UgbGVhZGluZyBkb3RzLiBUaGVyZSBjYW4gYmUgYW55IG51bWJlciwgc28gY291bnQgZWxsaXBzaXMgYXMgMyBkb3RzIGluIGEgcm93LlxuXHRcdFx0bGV0IHJlc3QgPSB0b2tlbnNcblx0XHRcdGNvbnN0IHBhcnRzID0gW11cblx0XHRcdGNvbnN0IGlzRG90dHkgPSBfID0+XG5cdFx0XHRcdGlzS2V5d29yZChLV19Eb3QsIF8pIHx8IGlzS2V5d29yZChLV19FbGxpcHNpcywgXylcblx0XHRcdGNvbnN0IGhlYWQgPSByZXN0LmhlYWQoKVxuXHRcdFx0aWYgKGlzRG90dHkoaGVhZCkpIHtcblx0XHRcdFx0cGFydHMucHVzaCgnLicpXG5cdFx0XHRcdGlmIChpc0tleXdvcmQoS1dfRWxsaXBzaXMsIGhlYWQpKSB7XG5cdFx0XHRcdFx0cGFydHMucHVzaCgnLi4nKVxuXHRcdFx0XHRcdHBhcnRzLnB1c2goJy4uJylcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblxuXHRcdFx0XHR3aGlsZSAoIXJlc3QuaXNFbXB0eSgpICYmIGlzRG90dHkocmVzdC5oZWFkKCkpKSB7XG5cdFx0XHRcdFx0cGFydHMucHVzaCgnLi4nKVxuXHRcdFx0XHRcdGlmIChpc0tleXdvcmQoS1dfRWxsaXBzaXMsIHJlc3QuaGVhZCgpKSkge1xuXHRcdFx0XHRcdFx0cGFydHMucHVzaCgnLi4nKVxuXHRcdFx0XHRcdFx0cGFydHMucHVzaCgnLi4nKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBUYWtlIG5hbWUsIHRoZW4gYW55IG51bWJlciBvZiBkb3QtdGhlbi1uYW1lIChgLnhgKVxuXHRcdFx0Zm9yICg7Oykge1xuXHRcdFx0XHRjaGVja05vbkVtcHR5KHJlc3QpXG5cdFx0XHRcdHBhcnRzLnB1c2gocGFyc2VOYW1lKHJlc3QuaGVhZCgpKSlcblx0XHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cblx0XHRcdFx0aWYgKHJlc3QuaXNFbXB0eSgpKVxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0Ly8gSWYgdGhlcmUncyBzb21ldGhpbmcgbGVmdCwgaXQgc2hvdWxkIGJlIGEgZG90LCBmb2xsb3dlZCBieSBhIG5hbWUuXG5cdFx0XHRcdGlmICghaXNLZXl3b3JkKEtXX0RvdCwgcmVzdC5oZWFkKCkpKVxuXHRcdFx0XHRcdHVuZXhwZWN0ZWQocmVzdC5oZWFkKCkpXG5cdFx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4ge3BhdGg6IHBhcnRzLmpvaW4oJy8nKSwgbmFtZTogcGFydHNbcGFydHMubGVuZ3RoIC0gMV19XG5cdFx0fVxuXHR9XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

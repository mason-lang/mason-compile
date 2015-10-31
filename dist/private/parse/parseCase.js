'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../../CompileError', '../context', '../MsAst', '../Token', '../util', './checks', './parse*', './parseBlock', './parseLocalDeclares', './parseSpaced', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../../CompileError'), require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parse*'), require('./parseBlock'), require('./parseLocalDeclares'), require('./parseSpaced'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.MsAst, global.Token, global.util, global.checks, global.parse, global.parseBlock, global.parseLocalDeclares, global.parseSpaced, global.Slice);
		global.parseCase = mod.exports;
	}
})(this, function (exports, _CompileError, _context, _MsAst, _Token, _util, _checks, _parse, _parseBlock, _parseLocalDeclares, _parseSpaced, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseCase;

	var _parseLocalDeclares2 = _interopRequireDefault(_parseLocalDeclares);

	var _parseSpaced2 = _interopRequireDefault(_parseSpaced);

	var _Slice2 = _interopRequireDefault(_Slice);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	function parseCase(isVal, casedFromFun, tokens) {
		const parseJustBlock = isVal ? _parseBlock.parseJustBlockVal : _parseBlock.parseJustBlockDo,
		      Case = isVal ? _MsAst.CaseVal : _MsAst.CaseDo;

		var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const block = _beforeAndBlock2[1];
		let opCased;

		if (casedFromFun) {
			(0, _checks.checkEmpty)(before, 'Can\'t make focus — is implicitly provided as first argument.');
			opCased = null;
		} else opCased = (0, _util.opIf)(!before.isEmpty(), () => _MsAst.AssignSingle.focus(before.loc, (0, _parse.parseExpr)(before)));

		const lastLine = _Slice2.default.group(block.last());

		var _ref = (0, _Token.isKeyword)(_Token.Keywords.Else, lastLine.head()) ? [block.rtail(), parseJustBlock(_Token.Keywords.Else, lastLine.tail())] : [block, null];

		var _ref2 = _slicedToArray(_ref, 2);

		const partLines = _ref2[0];
		const opElse = _ref2[1];
		const parts = partLines.mapSlices(line => parseCaseLine(isVal, line));
		(0, _context.check)(parts.length > 0, tokens.loc, () => `Must have at least 1 non-${ (0, _CompileError.code)('else') } test.`);
		return new Case(tokens.loc, opCased, parts, opElse);
	}

	function parseCaseLine(isVal, line) {
		var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(line);

		var _beforeAndBlock4 = _slicedToArray(_beforeAndBlock3, 2);

		const before = _beforeAndBlock4[0];
		const block = _beforeAndBlock4[1];
		const test = parseCaseTest(before);
		const result = (isVal ? _parseBlock.parseBlockVal : _parseBlock.parseBlockDo)(block);
		return new (isVal ? _MsAst.CaseValPart : _MsAst.CaseDoPart)(line.loc, test, result);
	}

	function parseCaseTest(tokens) {
		const first = tokens.head();

		if ((0, _Token.isGroup)(_Token.Groups.Space, first) && tokens.size() > 1) {
			const ft = _Slice2.default.group(first);

			if ((0, _Token.isKeyword)(_Token.Keywords.Type, ft.head())) {
				const type = (0, _parseSpaced2.default)(ft.tail());
				const locals = (0, _parseLocalDeclares2.default)(tokens.tail());
				return new _MsAst.Pattern(tokens.loc, type, locals);
			}
		}

		return (0, _parse.parseExpr)(tokens);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQ2FzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBY3dCLFNBQVM7Ozs7Ozs7Ozs7OztVQUFULFNBQVMiLCJmaWxlIjoicGFyc2VDYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtBc3NpZ25TaW5nbGUsIENhc2VEbywgQ2FzZURvUGFydCwgQ2FzZVZhbCwgQ2FzZVZhbFBhcnQsIFBhdHRlcm59IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtHcm91cHMsIGlzR3JvdXAsIGlzS2V5d29yZCwgS2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtvcElmfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtjaGVja0VtcHR5fSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7cGFyc2VFeHByfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCB7YmVmb3JlQW5kQmxvY2ssIHBhcnNlQmxvY2tEbywgcGFyc2VCbG9ja1ZhbCwgcGFyc2VKdXN0QmxvY2tEbywgcGFyc2VKdXN0QmxvY2tWYWxcblx0fSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQgcGFyc2VMb2NhbERlY2xhcmVzIGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuaW1wb3J0IHBhcnNlU3BhY2VkIGZyb20gJy4vcGFyc2VTcGFjZWQnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLyoqIFBhcnNlIGEge0BsaW5rIENhc2VEb30gb3Ige0BsaW5rIENhc2VWYWx9LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VDYXNlKGlzVmFsLCBjYXNlZEZyb21GdW4sIHRva2Vucykge1xuXHRjb25zdFxuXHRcdHBhcnNlSnVzdEJsb2NrID0gaXNWYWwgPyBwYXJzZUp1c3RCbG9ja1ZhbCA6IHBhcnNlSnVzdEJsb2NrRG8sXG5cdFx0Q2FzZSA9IGlzVmFsID8gQ2FzZVZhbCA6IENhc2VEb1xuXG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2VucylcblxuXHRsZXQgb3BDYXNlZFxuXHRpZiAoY2FzZWRGcm9tRnVuKSB7XG5cdFx0Y2hlY2tFbXB0eShiZWZvcmUsICdDYW5cXCd0IG1ha2UgZm9jdXMg4oCUIGlzIGltcGxpY2l0bHkgcHJvdmlkZWQgYXMgZmlyc3QgYXJndW1lbnQuJylcblx0XHRvcENhc2VkID0gbnVsbFxuXHR9IGVsc2Vcblx0XHRvcENhc2VkID0gb3BJZighYmVmb3JlLmlzRW1wdHkoKSwgKCkgPT4gQXNzaWduU2luZ2xlLmZvY3VzKGJlZm9yZS5sb2MsIHBhcnNlRXhwcihiZWZvcmUpKSlcblxuXHRjb25zdCBsYXN0TGluZSA9IFNsaWNlLmdyb3VwKGJsb2NrLmxhc3QoKSlcblx0Y29uc3QgW3BhcnRMaW5lcywgb3BFbHNlXSA9IGlzS2V5d29yZChLZXl3b3Jkcy5FbHNlLCBsYXN0TGluZS5oZWFkKCkpID9cblx0XHRbYmxvY2sucnRhaWwoKSwgcGFyc2VKdXN0QmxvY2soS2V5d29yZHMuRWxzZSwgbGFzdExpbmUudGFpbCgpKV0gOlxuXHRcdFtibG9jaywgbnVsbF1cblxuXHRjb25zdCBwYXJ0cyA9IHBhcnRMaW5lcy5tYXBTbGljZXMobGluZSA9PiBwYXJzZUNhc2VMaW5lKGlzVmFsLCBsaW5lKSlcblx0Y2hlY2socGFydHMubGVuZ3RoID4gMCwgdG9rZW5zLmxvYywgKCkgPT5cblx0XHRgTXVzdCBoYXZlIGF0IGxlYXN0IDEgbm9uLSR7Y29kZSgnZWxzZScpfSB0ZXN0LmApXG5cblx0cmV0dXJuIG5ldyBDYXNlKHRva2Vucy5sb2MsIG9wQ2FzZWQsIHBhcnRzLCBvcEVsc2UpXG59XG5cbmZ1bmN0aW9uIHBhcnNlQ2FzZUxpbmUoaXNWYWwsIGxpbmUpIHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sobGluZSlcblx0Y29uc3QgdGVzdCA9IHBhcnNlQ2FzZVRlc3QoYmVmb3JlKVxuXHRjb25zdCByZXN1bHQgPSAoaXNWYWwgPyBwYXJzZUJsb2NrVmFsIDogcGFyc2VCbG9ja0RvKShibG9jaylcblx0cmV0dXJuIG5ldyAoaXNWYWwgPyBDYXNlVmFsUGFydCA6IENhc2VEb1BhcnQpKGxpbmUubG9jLCB0ZXN0LCByZXN1bHQpXG59XG5cbmZ1bmN0aW9uIHBhcnNlQ2FzZVRlc3QodG9rZW5zKSB7XG5cdGNvbnN0IGZpcnN0ID0gdG9rZW5zLmhlYWQoKVxuXHQvLyBQYXR0ZXJuIG1hdGNoIHN0YXJ0cyB3aXRoIHR5cGUgdGVzdCBhbmQgaXMgZm9sbG93ZWQgYnkgbG9jYWwgZGVjbGFyZXMuXG5cdC8vIEUuZy4sIGA6U29tZSB2YWxgXG5cdGlmIChpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgZmlyc3QpICYmIHRva2Vucy5zaXplKCkgPiAxKSB7XG5cdFx0Y29uc3QgZnQgPSBTbGljZS5ncm91cChmaXJzdClcblx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLlR5cGUsIGZ0LmhlYWQoKSkpIHtcblx0XHRcdGNvbnN0IHR5cGUgPSBwYXJzZVNwYWNlZChmdC50YWlsKCkpXG5cdFx0XHRjb25zdCBsb2NhbHMgPSBwYXJzZUxvY2FsRGVjbGFyZXModG9rZW5zLnRhaWwoKSlcblx0XHRcdHJldHVybiBuZXcgUGF0dGVybih0b2tlbnMubG9jLCB0eXBlLCBsb2NhbHMpXG5cdFx0fVxuXHR9XG5cdHJldHVybiBwYXJzZUV4cHIodG9rZW5zKVxufVxuIl19
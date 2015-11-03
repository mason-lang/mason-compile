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
		var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const block = _beforeAndBlock2[1];
		let opCased;

		if (casedFromFun) {
			(0, _checks.checkEmpty)(before, 'Can\'t make focus — is implicitly provided as first argument.');
			opCased = null;
		} else opCased = (0, _util.opMap)((0, _parse.opParseExpr)(before), _ => _MsAst.AssignSingle.focus(_.loc, _));

		const lastLine = _Slice2.default.group(block.last());

		var _ref = (0, _Token.isKeyword)(_Token.Keywords.Else, lastLine.head()) ? [block.rtail(), (0, _parseBlock.parseJustBlockDoOrVal)(isVal, _Token.Keywords.Else, lastLine.tail())] : [block, null];

		var _ref2 = _slicedToArray(_ref, 2);

		const partLines = _ref2[0];
		const opElse = _ref2[1];
		const parts = partLines.mapSlices(line => parseCaseLine(isVal, line));
		(0, _context.check)(parts.length > 0, tokens.loc, () => `Must have at least 1 non-${ (0, _CompileError.code)('else') } test.`);
		return new _MsAst.Case(tokens.loc, opCased, parts, opElse);
	}

	function parseCaseLine(isVal, line) {
		var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(line);

		var _beforeAndBlock4 = _slicedToArray(_beforeAndBlock3, 2);

		const before = _beforeAndBlock4[0];
		const block = _beforeAndBlock4[1];
		const test = parseCaseTest(before);
		const result = (0, _parseBlock.parseBlockDoOrVal)(isVal, block);
		return new _MsAst.CasePart(line.loc, test, result);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQ2FzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBYXdCLFNBQVM7Ozs7Ozs7Ozs7OztVQUFULFNBQVMiLCJmaWxlIjoicGFyc2VDYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtBc3NpZ25TaW5nbGUsIENhc2UsIENhc2VQYXJ0LCBQYXR0ZXJufSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXBzLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7b3BNYXB9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2NoZWNrRW1wdHl9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtvcFBhcnNlRXhwciwgcGFyc2VFeHByfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCB7YmVmb3JlQW5kQmxvY2ssIHBhcnNlQmxvY2tEb09yVmFsLCBwYXJzZUp1c3RCbG9ja0RvT3JWYWx9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZUxvY2FsRGVjbGFyZXMgZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5pbXBvcnQgcGFyc2VTcGFjZWQgZnJvbSAnLi9wYXJzZVNwYWNlZCdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKiogUGFyc2UgYSB7QGxpbmsgQ2FzZX0uICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUNhc2UoaXNWYWwsIGNhc2VkRnJvbUZ1biwgdG9rZW5zKSB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2VucylcblxuXHRsZXQgb3BDYXNlZFxuXHRpZiAoY2FzZWRGcm9tRnVuKSB7XG5cdFx0Y2hlY2tFbXB0eShiZWZvcmUsICdDYW5cXCd0IG1ha2UgZm9jdXMg4oCUIGlzIGltcGxpY2l0bHkgcHJvdmlkZWQgYXMgZmlyc3QgYXJndW1lbnQuJylcblx0XHRvcENhc2VkID0gbnVsbFxuXHR9IGVsc2Vcblx0XHRvcENhc2VkID0gb3BNYXAob3BQYXJzZUV4cHIoYmVmb3JlKSwgXyA9PiBBc3NpZ25TaW5nbGUuZm9jdXMoXy5sb2MsIF8pKVxuXG5cdGNvbnN0IGxhc3RMaW5lID0gU2xpY2UuZ3JvdXAoYmxvY2subGFzdCgpKVxuXHRjb25zdCBbcGFydExpbmVzLCBvcEVsc2VdID0gaXNLZXl3b3JkKEtleXdvcmRzLkVsc2UsIGxhc3RMaW5lLmhlYWQoKSkgP1xuXHRcdFtibG9jay5ydGFpbCgpLCBwYXJzZUp1c3RCbG9ja0RvT3JWYWwoaXNWYWwsIEtleXdvcmRzLkVsc2UsIGxhc3RMaW5lLnRhaWwoKSldIDpcblx0XHRbYmxvY2ssIG51bGxdXG5cblx0Y29uc3QgcGFydHMgPSBwYXJ0TGluZXMubWFwU2xpY2VzKGxpbmUgPT4gcGFyc2VDYXNlTGluZShpc1ZhbCwgbGluZSkpXG5cdGNoZWNrKHBhcnRzLmxlbmd0aCA+IDAsIHRva2Vucy5sb2MsICgpID0+XG5cdFx0YE11c3QgaGF2ZSBhdCBsZWFzdCAxIG5vbi0ke2NvZGUoJ2Vsc2UnKX0gdGVzdC5gKVxuXG5cdHJldHVybiBuZXcgQ2FzZSh0b2tlbnMubG9jLCBvcENhc2VkLCBwYXJ0cywgb3BFbHNlKVxufVxuXG5mdW5jdGlvbiBwYXJzZUNhc2VMaW5lKGlzVmFsLCBsaW5lKSB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKGxpbmUpXG5cdGNvbnN0IHRlc3QgPSBwYXJzZUNhc2VUZXN0KGJlZm9yZSlcblx0Y29uc3QgcmVzdWx0ID0gcGFyc2VCbG9ja0RvT3JWYWwoaXNWYWwsIGJsb2NrKVxuXHRyZXR1cm4gbmV3IENhc2VQYXJ0KGxpbmUubG9jLCB0ZXN0LCByZXN1bHQpXG59XG5cbmZ1bmN0aW9uIHBhcnNlQ2FzZVRlc3QodG9rZW5zKSB7XG5cdGNvbnN0IGZpcnN0ID0gdG9rZW5zLmhlYWQoKVxuXHQvLyBQYXR0ZXJuIG1hdGNoIHN0YXJ0cyB3aXRoIHR5cGUgdGVzdCBhbmQgaXMgZm9sbG93ZWQgYnkgbG9jYWwgZGVjbGFyZXMuXG5cdC8vIEUuZy4sIGA6U29tZSB2YWxgXG5cdGlmIChpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgZmlyc3QpICYmIHRva2Vucy5zaXplKCkgPiAxKSB7XG5cdFx0Y29uc3QgZnQgPSBTbGljZS5ncm91cChmaXJzdClcblx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLlR5cGUsIGZ0LmhlYWQoKSkpIHtcblx0XHRcdGNvbnN0IHR5cGUgPSBwYXJzZVNwYWNlZChmdC50YWlsKCkpXG5cdFx0XHRjb25zdCBsb2NhbHMgPSBwYXJzZUxvY2FsRGVjbGFyZXModG9rZW5zLnRhaWwoKSlcblx0XHRcdHJldHVybiBuZXcgUGF0dGVybih0b2tlbnMubG9jLCB0eXBlLCBsb2NhbHMpXG5cdFx0fVxuXHR9XG5cdHJldHVybiBwYXJzZUV4cHIodG9rZW5zKVxufVxuIl19
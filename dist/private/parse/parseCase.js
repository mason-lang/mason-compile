'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', '../util', './checks', './parse*', './parseBlock', './parseLocalDeclares', './parseSpaced', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parse*'), require('./parseBlock'), require('./parseLocalDeclares'), require('./parseSpaced'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.util, global.checks, global.parse, global.parseBlock, global.parseLocalDeclares, global.parseSpaced, global.Slice);
		global.parseCase = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _util, _checks, _parse, _parseBlock, _parseLocalDeclares, _parseSpaced, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseCase;

	var _parseBlock2 = _interopRequireDefault(_parseBlock);

	var _parseLocalDeclares2 = _interopRequireDefault(_parseLocalDeclares);

	var _parseSpaced2 = _interopRequireDefault(_parseSpaced);

	var _Slice2 = _interopRequireDefault(_Slice);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	var _slicedToArray = (function () {
		function sliceIterator(arr, i) {
			var _arr = [];
			var _n = true;
			var _d = false;
			var _e = undefined;

			try {
				for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
					_arr.push(_s.value);

					if (i && _arr.length === i) break;
				}
			} catch (err) {
				_d = true;
				_e = err;
			} finally {
				try {
					if (!_n && _i["return"]) _i["return"]();
				} finally {
					if (_d) throw _e;
				}
			}

			return _arr;
		}

		return function (arr, i) {
			if (Array.isArray(arr)) {
				return arr;
			} else if (Symbol.iterator in Object(arr)) {
				return sliceIterator(arr, i);
			} else {
				throw new TypeError("Invalid attempt to destructure non-iterable instance");
			}
		};
	})();

	function parseCase(casedFromFun, tokens) {
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

		var _ref = (0, _Token.isKeyword)(_Token.Keywords.Else, lastLine.head()) ? [block.rtail(), (0, _parseBlock.parseJustBlock)(_Token.Keywords.Else, lastLine.tail())] : [block, null];

		var _ref2 = _slicedToArray(_ref, 2);

		const partLines = _ref2[0];
		const opElse = _ref2[1];
		const parts = partLines.mapSlices(line => {
			var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(line);

			var _beforeAndBlock4 = _slicedToArray(_beforeAndBlock3, 2);

			const before = _beforeAndBlock4[0];
			const block = _beforeAndBlock4[1];
			return new _MsAst.CasePart(line.loc, parseCaseTest(before), (0, _parseBlock2.default)(block));
		});
		(0, _context.check)(parts.length > 0, tokens.loc, () => `Must have at least 1 non-${ (0, _Token.showKeyword)(_Token.Keywords.Else) } test.`);
		return new _MsAst.Case(tokens.loc, opCased, parts, opElse);
	}

	function parseCaseTest(tokens) {
		const first = tokens.head();

		if ((0, _Token.isGroup)(_Token.Groups.Space, first) && tokens.size() > 1) {
			const ft = _Slice2.default.group(first);

			if ((0, _Token.isKeyword)(_Token.Keywords.Colon, ft.head())) {
				const type = (0, _parseSpaced2.default)(ft.tail());
				const locals = (0, _parseLocalDeclares2.default)(tokens.tail());
				return new _MsAst.Pattern(tokens.loc, type, locals);
			}
		}

		return (0, _parse.parseExpr)(tokens);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQ2FzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBWXdCLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQUFULFNBQVMiLCJmaWxlIjoicGFyc2VDYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVja30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7QXNzaWduU2luZ2xlLCBDYXNlLCBDYXNlUGFydCwgUGF0dGVybn0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwcywgaXNHcm91cCwgaXNLZXl3b3JkLCBLZXl3b3Jkcywgc2hvd0tleXdvcmR9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtvcE1hcH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tFbXB0eX0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge29wUGFyc2VFeHByLCBwYXJzZUV4cHJ9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IHBhcnNlQmxvY2ssIHtiZWZvcmVBbmRCbG9jaywgcGFyc2VKdXN0QmxvY2t9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZUxvY2FsRGVjbGFyZXMgZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5pbXBvcnQgcGFyc2VTcGFjZWQgZnJvbSAnLi9wYXJzZVNwYWNlZCdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKiogUGFyc2UgYSB7QGxpbmsgQ2FzZX0uICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUNhc2UoY2FzZWRGcm9tRnVuLCB0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXG5cdGxldCBvcENhc2VkXG5cdGlmIChjYXNlZEZyb21GdW4pIHtcblx0XHRjaGVja0VtcHR5KGJlZm9yZSwgJ0NhblxcJ3QgbWFrZSBmb2N1cyDigJQgaXMgaW1wbGljaXRseSBwcm92aWRlZCBhcyBmaXJzdCBhcmd1bWVudC4nKVxuXHRcdG9wQ2FzZWQgPSBudWxsXG5cdH0gZWxzZVxuXHRcdG9wQ2FzZWQgPSBvcE1hcChvcFBhcnNlRXhwcihiZWZvcmUpLCBfID0+IEFzc2lnblNpbmdsZS5mb2N1cyhfLmxvYywgXykpXG5cblx0Y29uc3QgbGFzdExpbmUgPSBTbGljZS5ncm91cChibG9jay5sYXN0KCkpXG5cdGNvbnN0IFtwYXJ0TGluZXMsIG9wRWxzZV0gPSBpc0tleXdvcmQoS2V5d29yZHMuRWxzZSwgbGFzdExpbmUuaGVhZCgpKSA/XG5cdFx0W2Jsb2NrLnJ0YWlsKCksIHBhcnNlSnVzdEJsb2NrKEtleXdvcmRzLkVsc2UsIGxhc3RMaW5lLnRhaWwoKSldIDpcblx0XHRbYmxvY2ssIG51bGxdXG5cblx0Y29uc3QgcGFydHMgPSBwYXJ0TGluZXMubWFwU2xpY2VzKGxpbmUgPT4ge1xuXHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKGxpbmUpXG5cdFx0cmV0dXJuIG5ldyBDYXNlUGFydChsaW5lLmxvYywgcGFyc2VDYXNlVGVzdChiZWZvcmUpLCBwYXJzZUJsb2NrKGJsb2NrKSlcblx0fSlcblx0Y2hlY2socGFydHMubGVuZ3RoID4gMCwgdG9rZW5zLmxvYywgKCkgPT5cblx0XHRgTXVzdCBoYXZlIGF0IGxlYXN0IDEgbm9uLSR7c2hvd0tleXdvcmQoS2V5d29yZHMuRWxzZSl9IHRlc3QuYClcblxuXHRyZXR1cm4gbmV3IENhc2UodG9rZW5zLmxvYywgb3BDYXNlZCwgcGFydHMsIG9wRWxzZSlcbn1cblxuZnVuY3Rpb24gcGFyc2VDYXNlVGVzdCh0b2tlbnMpIHtcblx0Y29uc3QgZmlyc3QgPSB0b2tlbnMuaGVhZCgpXG5cdC8vIFBhdHRlcm4gbWF0Y2ggc3RhcnRzIHdpdGggdHlwZSB0ZXN0IGFuZCBpcyBmb2xsb3dlZCBieSBsb2NhbCBkZWNsYXJlcy5cblx0Ly8gRS5nLiwgYDpTb21lIHZhbGBcblx0aWYgKGlzR3JvdXAoR3JvdXBzLlNwYWNlLCBmaXJzdCkgJiYgdG9rZW5zLnNpemUoKSA+IDEpIHtcblx0XHRjb25zdCBmdCA9IFNsaWNlLmdyb3VwKGZpcnN0KVxuXHRcdGlmIChpc0tleXdvcmQoS2V5d29yZHMuQ29sb24sIGZ0LmhlYWQoKSkpIHtcblx0XHRcdGNvbnN0IHR5cGUgPSBwYXJzZVNwYWNlZChmdC50YWlsKCkpXG5cdFx0XHRjb25zdCBsb2NhbHMgPSBwYXJzZUxvY2FsRGVjbGFyZXModG9rZW5zLnRhaWwoKSlcblx0XHRcdHJldHVybiBuZXcgUGF0dGVybih0b2tlbnMubG9jLCB0eXBlLCBsb2NhbHMpXG5cdFx0fVxuXHR9XG5cdHJldHVybiBwYXJzZUV4cHIodG9rZW5zKVxufVxuIl19
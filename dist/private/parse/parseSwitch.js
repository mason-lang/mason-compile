'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', './checks', './parse*', './parseBlock', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('./checks'), require('./parse*'), require('./parseBlock'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.checks, global.parse, global.parseBlock, global.Slice);
		global.parseSwitch = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _checks, _parse, _parseBlock, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseSwitch;

	var _parseBlock2 = _interopRequireDefault(_parseBlock);

	var _Slice2 = _interopRequireDefault(_Slice);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	function parseSwitch(switchedFromFun, tokens) {
		var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const block = _beforeAndBlock2[1];
		if (switchedFromFun) (0, _checks.checkEmpty)(before, 'Value to switch on is `_`, the function\'s implicit argument.');
		const switched = switchedFromFun ? _MsAst.LocalAccess.focus(tokens.loc) : (0, _parse.parseExpr)(before);

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
			return new _MsAst.SwitchPart(line.loc, (0, _parse.parseExprParts)(before), (0, _parseBlock2.default)(block));
		});
		(0, _context.check)(parts.length > 0, tokens.loc, () => `Must have at least 1 non-${ (0, _Token.showKeyword)(_Token.Keywords.Else) } test.`);
		return new _MsAst.Switch(tokens.loc, switched, parts, opElse);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlU3dpdGNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFTd0IsV0FBVzs7Ozs7Ozs7OztVQUFYLFdBQVciLCJmaWxlIjoicGFyc2VTd2l0Y2guanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtMb2NhbEFjY2VzcywgU3dpdGNoLCBTd2l0Y2hQYXJ0fSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7aXNLZXl3b3JkLCBLZXl3b3Jkcywgc2hvd0tleXdvcmR9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtjaGVja0VtcHR5fSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7cGFyc2VFeHByLCBwYXJzZUV4cHJQYXJ0c30gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQgcGFyc2VCbG9jaywge2JlZm9yZUFuZEJsb2NrLCBwYXJzZUp1c3RCbG9ja30gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8qKiBQYXJzZSBhIHtAbGluayBTd2l0Y2h9LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VTd2l0Y2goc3dpdGNoZWRGcm9tRnVuLCB0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXG5cdGlmIChzd2l0Y2hlZEZyb21GdW4pXG5cdFx0Y2hlY2tFbXB0eShiZWZvcmUsICdWYWx1ZSB0byBzd2l0Y2ggb24gaXMgYF9gLCB0aGUgZnVuY3Rpb25cXCdzIGltcGxpY2l0IGFyZ3VtZW50LicpXG5cdGNvbnN0IHN3aXRjaGVkID0gc3dpdGNoZWRGcm9tRnVuID8gTG9jYWxBY2Nlc3MuZm9jdXModG9rZW5zLmxvYykgOiBwYXJzZUV4cHIoYmVmb3JlKVxuXG5cdGNvbnN0IGxhc3RMaW5lID0gU2xpY2UuZ3JvdXAoYmxvY2subGFzdCgpKVxuXHRjb25zdCBbcGFydExpbmVzLCBvcEVsc2VdID0gaXNLZXl3b3JkKEtleXdvcmRzLkVsc2UsIGxhc3RMaW5lLmhlYWQoKSkgP1xuXHRcdFtibG9jay5ydGFpbCgpLCBwYXJzZUp1c3RCbG9jayhLZXl3b3Jkcy5FbHNlLCBsYXN0TGluZS50YWlsKCkpXSA6XG5cdFx0W2Jsb2NrLCBudWxsXVxuXG5cdGNvbnN0IHBhcnRzID0gcGFydExpbmVzLm1hcFNsaWNlcyhsaW5lID0+IHtcblx0XHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayhsaW5lKVxuXHRcdHJldHVybiBuZXcgU3dpdGNoUGFydChsaW5lLmxvYywgcGFyc2VFeHByUGFydHMoYmVmb3JlKSwgcGFyc2VCbG9jayhibG9jaykpXG5cdH0pXG5cdGNoZWNrKHBhcnRzLmxlbmd0aCA+IDAsIHRva2Vucy5sb2MsICgpID0+XG5cdFx0YE11c3QgaGF2ZSBhdCBsZWFzdCAxIG5vbi0ke3Nob3dLZXl3b3JkKEtleXdvcmRzLkVsc2UpfSB0ZXN0LmApXG5cdHJldHVybiBuZXcgU3dpdGNoKHRva2Vucy5sb2MsIHN3aXRjaGVkLCBwYXJ0cywgb3BFbHNlKVxufVxuIl19
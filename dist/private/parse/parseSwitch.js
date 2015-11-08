'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', './checks', './parse*', './parseBlock', './parseSingle', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('./checks'), require('./parse*'), require('./parseBlock'), require('./parseSingle'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.checks, global.parse, global.parseBlock, global.parseSingle, global.Slice);
		global.parseSwitch = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _checks, _parse, _parseBlock, _parseSingle, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseSwitch;

	var _parseBlock2 = _interopRequireDefault(_parseBlock);

	var _parseSingle2 = _interopRequireDefault(_parseSingle);

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
		const parts = partLines.mapSlices(line => parseSwitchLine(line));
		(0, _context.check)(parts.length > 0, tokens.loc, () => `Must have at least 1 non-${ (0, _Token.showKeyword)(_Token.Keywords.Else) } test.`);
		return new _MsAst.Switch(tokens.loc, switched, parts, opElse);
	}

	function parseSwitchLine(line) {
		var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(line);

		var _beforeAndBlock4 = _slicedToArray(_beforeAndBlock3, 2);

		const before = _beforeAndBlock4[0];
		const block = _beforeAndBlock4[1];
		const values = (0, _Token.isKeyword)(_Token.Keywords.Or, before.head()) ? before.tail().map(_parseSingle2.default) : [(0, _parse.parseExpr)(before)];
		return new _MsAst.SwitchPart(line.loc, values, (0, _parseBlock2.default)(block));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlU3dpdGNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFVd0IsV0FBVzs7Ozs7Ozs7Ozs7O1VBQVgsV0FBVyIsImZpbGUiOiJwYXJzZVN3aXRjaC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0xvY2FsQWNjZXNzLCBTd2l0Y2gsIFN3aXRjaFBhcnR9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtpc0tleXdvcmQsIEtleXdvcmRzLCBzaG93S2V5d29yZH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2NoZWNrRW1wdHl9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtwYXJzZUV4cHJ9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IHBhcnNlQmxvY2ssIHtiZWZvcmVBbmRCbG9jaywgcGFyc2VKdXN0QmxvY2t9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZVNpbmdsZSBmcm9tICcuL3BhcnNlU2luZ2xlJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8qKiBQYXJzZSBhIHtAbGluayBTd2l0Y2h9LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VTd2l0Y2goc3dpdGNoZWRGcm9tRnVuLCB0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXG5cdGlmIChzd2l0Y2hlZEZyb21GdW4pXG5cdFx0Y2hlY2tFbXB0eShiZWZvcmUsICdWYWx1ZSB0byBzd2l0Y2ggb24gaXMgYF9gLCB0aGUgZnVuY3Rpb25cXCdzIGltcGxpY2l0IGFyZ3VtZW50LicpXG5cdGNvbnN0IHN3aXRjaGVkID0gc3dpdGNoZWRGcm9tRnVuID8gTG9jYWxBY2Nlc3MuZm9jdXModG9rZW5zLmxvYykgOiBwYXJzZUV4cHIoYmVmb3JlKVxuXG5cdGNvbnN0IGxhc3RMaW5lID0gU2xpY2UuZ3JvdXAoYmxvY2subGFzdCgpKVxuXHRjb25zdCBbcGFydExpbmVzLCBvcEVsc2VdID0gaXNLZXl3b3JkKEtleXdvcmRzLkVsc2UsIGxhc3RMaW5lLmhlYWQoKSkgP1xuXHRcdFtibG9jay5ydGFpbCgpLCBwYXJzZUp1c3RCbG9jayhLZXl3b3Jkcy5FbHNlLCBsYXN0TGluZS50YWlsKCkpXSA6XG5cdFx0W2Jsb2NrLCBudWxsXVxuXG5cdGNvbnN0IHBhcnRzID0gcGFydExpbmVzLm1hcFNsaWNlcyhsaW5lID0+IHBhcnNlU3dpdGNoTGluZShsaW5lKSlcblx0Y2hlY2socGFydHMubGVuZ3RoID4gMCwgdG9rZW5zLmxvYywgKCkgPT5cblx0XHRgTXVzdCBoYXZlIGF0IGxlYXN0IDEgbm9uLSR7c2hvd0tleXdvcmQoS2V5d29yZHMuRWxzZSl9IHRlc3QuYClcblxuXHRyZXR1cm4gbmV3IFN3aXRjaCh0b2tlbnMubG9jLCBzd2l0Y2hlZCwgcGFydHMsIG9wRWxzZSlcbn1cblxuZnVuY3Rpb24gcGFyc2VTd2l0Y2hMaW5lKGxpbmUpIHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sobGluZSlcblx0Y29uc3QgdmFsdWVzID0gaXNLZXl3b3JkKEtleXdvcmRzLk9yLCBiZWZvcmUuaGVhZCgpKSA/XG5cdFx0YmVmb3JlLnRhaWwoKS5tYXAocGFyc2VTaW5nbGUpIDpcblx0XHRbcGFyc2VFeHByKGJlZm9yZSldXG5cdHJldHVybiBuZXcgU3dpdGNoUGFydChsaW5lLmxvYywgdmFsdWVzLCBwYXJzZUJsb2NrKGJsb2NrKSlcbn1cbiJdfQ==
'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../../CompileError', '../context', '../MsAst', '../Token', './checks', './parse*', './parseBlock', './parseSingle', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../../CompileError'), require('../context'), require('../MsAst'), require('../Token'), require('./checks'), require('./parse*'), require('./parseBlock'), require('./parseSingle'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.MsAst, global.Token, global.checks, global.parse, global.parseBlock, global.parseSingle, global.Slice);
		global.parseSwitch = mod.exports;
	}
})(this, function (exports, _CompileError, _context, _MsAst, _Token, _checks, _parse, _parseBlock, _parseSingle, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseSwitch;

	var _parseSingle2 = _interopRequireDefault(_parseSingle);

	var _Slice2 = _interopRequireDefault(_Slice);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	function parseSwitch(isVal, switchedFromFun, tokens) {
		var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const block = _beforeAndBlock2[1];
		if (switchedFromFun) (0, _checks.checkEmpty)(before, 'Value to switch on is `_`, the function\'s implicit argument.');
		const switched = switchedFromFun ? _MsAst.LocalAccess.focus(tokens.loc) : (0, _parse.parseExpr)(before);

		const lastLine = _Slice2.default.group(block.last());

		var _ref = (0, _Token.isKeyword)(_Token.Keywords.Else, lastLine.head()) ? [block.rtail(), (0, _parseBlock.parseJustBlockDoOrVal)(isVal, _Token.Keywords.Else, lastLine.tail())] : [block, null];

		var _ref2 = _slicedToArray(_ref, 2);

		const partLines = _ref2[0];
		const opElse = _ref2[1];
		const parts = partLines.mapSlices(line => parseSwitchLine(isVal, line));
		(0, _context.check)(parts.length > 0, tokens.loc, () => `Must have at least 1 non-${ (0, _CompileError.code)('else') } test.`);
		return new _MsAst.Switch(tokens.loc, switched, parts, opElse);
	}

	function parseSwitchLine(isVal, line) {
		var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(line);

		var _beforeAndBlock4 = _slicedToArray(_beforeAndBlock3, 2);

		const before = _beforeAndBlock4[0];
		const block = _beforeAndBlock4[1];
		const values = (0, _Token.isKeyword)(_Token.Keywords.Or, before.head()) ? before.tail().map(_parseSingle2.default) : [(0, _parse.parseExpr)(before)];
		return new _MsAst.SwitchPart(line.loc, values, (0, _parseBlock.parseBlockDoOrVal)(isVal, block));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlU3dpdGNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFXd0IsV0FBVzs7Ozs7Ozs7OztVQUFYLFdBQVciLCJmaWxlIjoicGFyc2VTd2l0Y2guanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0xvY2FsQWNjZXNzLCBTd2l0Y2gsIFN3aXRjaFBhcnR9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7Y2hlY2tFbXB0eX0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge3BhcnNlRXhwcn0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQge2JlZm9yZUFuZEJsb2NrLCBwYXJzZUJsb2NrRG9PclZhbCwgcGFyc2VKdXN0QmxvY2tEb09yVmFsfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQgcGFyc2VTaW5nbGUgZnJvbSAnLi9wYXJzZVNpbmdsZSdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKiogUGFyc2UgYSB7QGxpbmsgU3dpdGNofS4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlU3dpdGNoKGlzVmFsLCBzd2l0Y2hlZEZyb21GdW4sIHRva2Vucykge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cblx0aWYgKHN3aXRjaGVkRnJvbUZ1bilcblx0XHRjaGVja0VtcHR5KGJlZm9yZSwgJ1ZhbHVlIHRvIHN3aXRjaCBvbiBpcyBgX2AsIHRoZSBmdW5jdGlvblxcJ3MgaW1wbGljaXQgYXJndW1lbnQuJylcblx0Y29uc3Qgc3dpdGNoZWQgPSBzd2l0Y2hlZEZyb21GdW4gPyBMb2NhbEFjY2Vzcy5mb2N1cyh0b2tlbnMubG9jKSA6IHBhcnNlRXhwcihiZWZvcmUpXG5cblx0Y29uc3QgbGFzdExpbmUgPSBTbGljZS5ncm91cChibG9jay5sYXN0KCkpXG5cdGNvbnN0IFtwYXJ0TGluZXMsIG9wRWxzZV0gPSBpc0tleXdvcmQoS2V5d29yZHMuRWxzZSwgbGFzdExpbmUuaGVhZCgpKSA/XG5cdFx0W2Jsb2NrLnJ0YWlsKCksIHBhcnNlSnVzdEJsb2NrRG9PclZhbChpc1ZhbCwgS2V5d29yZHMuRWxzZSwgbGFzdExpbmUudGFpbCgpKV0gOlxuXHRcdFtibG9jaywgbnVsbF1cblxuXHRjb25zdCBwYXJ0cyA9IHBhcnRMaW5lcy5tYXBTbGljZXMobGluZSA9PiBwYXJzZVN3aXRjaExpbmUoaXNWYWwsIGxpbmUpKVxuXHRjaGVjayhwYXJ0cy5sZW5ndGggPiAwLCB0b2tlbnMubG9jLCAoKSA9PiBgTXVzdCBoYXZlIGF0IGxlYXN0IDEgbm9uLSR7Y29kZSgnZWxzZScpfSB0ZXN0LmApXG5cblx0cmV0dXJuIG5ldyBTd2l0Y2godG9rZW5zLmxvYywgc3dpdGNoZWQsIHBhcnRzLCBvcEVsc2UpXG59XG5cbmZ1bmN0aW9uIHBhcnNlU3dpdGNoTGluZShpc1ZhbCwgbGluZSkge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayhsaW5lKVxuXHRjb25zdCB2YWx1ZXMgPSBpc0tleXdvcmQoS2V5d29yZHMuT3IsIGJlZm9yZS5oZWFkKCkpID9cblx0XHRiZWZvcmUudGFpbCgpLm1hcChwYXJzZVNpbmdsZSkgOlxuXHRcdFtwYXJzZUV4cHIoYmVmb3JlKV1cblx0cmV0dXJuIG5ldyBTd2l0Y2hQYXJ0KGxpbmUubG9jLCB2YWx1ZXMsIHBhcnNlQmxvY2tEb09yVmFsKGlzVmFsLCBibG9jaykpXG59XG4iXX0=
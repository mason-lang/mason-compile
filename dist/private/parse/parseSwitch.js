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
		const parseJustBlock = isVal ? _parseBlock.parseJustBlockVal : _parseBlock.parseJustBlockDo,
		      Switch = isVal ? _MsAst.SwitchVal : _MsAst.SwitchDo;

		var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const block = _beforeAndBlock2[1];
		let switched;

		if (switchedFromFun) {
			(0, _checks.checkEmpty)(before, 'Value to switch on is `_`, the function\'s implicit argument.');
			switched = _MsAst.LocalAccess.focus(tokens.loc);
		} else switched = (0, _parse.parseExpr)(before);

		const lastLine = _Slice2.default.group(block.last());

		var _ref = (0, _Token.isKeyword)(_Token.Keywords.Else, lastLine.head()) ? [block.rtail(), parseJustBlock(_Token.Keywords.Else, lastLine.tail())] : [block, null];

		var _ref2 = _slicedToArray(_ref, 2);

		const partLines = _ref2[0];
		const opElse = _ref2[1];
		const parts = partLines.mapSlices(line => parseSwitchLine(isVal, line));
		(0, _context.check)(parts.length > 0, tokens.loc, () => `Must have at least 1 non-${ (0, _CompileError.code)('else') } test.`);
		return new Switch(tokens.loc, switched, parts, opElse);
	}

	function parseSwitchLine(isVal, line) {
		var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(line);

		var _beforeAndBlock4 = _slicedToArray(_beforeAndBlock3, 2);

		const before = _beforeAndBlock4[0];
		const block = _beforeAndBlock4[1];
		let values;
		if ((0, _Token.isKeyword)(_Token.Keywords.Or, before.head())) values = before.tail().map(_parseSingle2.default);else values = [(0, _parse.parseExpr)(before)];
		const result = (isVal ? _parseBlock.parseBlockVal : _parseBlock.parseBlockDo)(block);
		return new (isVal ? _MsAst.SwitchValPart : _MsAst.SwitchDoPart)(line.loc, values, result);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlU3dpdGNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFZd0IsV0FBVzs7Ozs7Ozs7OztVQUFYLFdBQVciLCJmaWxlIjoicGFyc2VTd2l0Y2guanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0xvY2FsQWNjZXNzLCBTd2l0Y2hEbywgU3dpdGNoRG9QYXJ0LCBTd2l0Y2hWYWwsIFN3aXRjaFZhbFBhcnR9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7Y2hlY2tFbXB0eX0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge3BhcnNlRXhwcn0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQge2JlZm9yZUFuZEJsb2NrLCBwYXJzZUp1c3RCbG9ja0RvLCBwYXJzZUp1c3RCbG9ja1ZhbCwgcGFyc2VCbG9ja0RvLCBwYXJzZUJsb2NrVmFsXG5cdH0gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlU2luZ2xlIGZyb20gJy4vcGFyc2VTaW5nbGUnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLyoqIFBhcnNlIGEge0BsaW5rIFN3aXRjaERvfSBvciB7QGxpbmsgU3dpdGNoVmFsfS4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlU3dpdGNoKGlzVmFsLCBzd2l0Y2hlZEZyb21GdW4sIHRva2Vucykge1xuXHRjb25zdFxuXHRcdHBhcnNlSnVzdEJsb2NrID0gaXNWYWwgPyBwYXJzZUp1c3RCbG9ja1ZhbCA6IHBhcnNlSnVzdEJsb2NrRG8sXG5cdFx0U3dpdGNoID0gaXNWYWwgPyBTd2l0Y2hWYWwgOiBTd2l0Y2hEb1xuXG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2VucylcblxuXHRsZXQgc3dpdGNoZWRcblx0aWYgKHN3aXRjaGVkRnJvbUZ1bikge1xuXHRcdGNoZWNrRW1wdHkoYmVmb3JlLCAnVmFsdWUgdG8gc3dpdGNoIG9uIGlzIGBfYCwgdGhlIGZ1bmN0aW9uXFwncyBpbXBsaWNpdCBhcmd1bWVudC4nKVxuXHRcdHN3aXRjaGVkID0gTG9jYWxBY2Nlc3MuZm9jdXModG9rZW5zLmxvYylcblx0fSBlbHNlXG5cdFx0c3dpdGNoZWQgPSBwYXJzZUV4cHIoYmVmb3JlKVxuXG5cdGNvbnN0IGxhc3RMaW5lID0gU2xpY2UuZ3JvdXAoYmxvY2subGFzdCgpKVxuXHRjb25zdCBbcGFydExpbmVzLCBvcEVsc2VdID0gaXNLZXl3b3JkKEtleXdvcmRzLkVsc2UsIGxhc3RMaW5lLmhlYWQoKSkgP1xuXHRcdFtibG9jay5ydGFpbCgpLCBwYXJzZUp1c3RCbG9jayhLZXl3b3Jkcy5FbHNlLCBsYXN0TGluZS50YWlsKCkpXSA6XG5cdFx0W2Jsb2NrLCBudWxsXVxuXG5cdGNvbnN0IHBhcnRzID0gcGFydExpbmVzLm1hcFNsaWNlcyhsaW5lID0+IHBhcnNlU3dpdGNoTGluZShpc1ZhbCwgbGluZSkpXG5cdGNoZWNrKHBhcnRzLmxlbmd0aCA+IDAsIHRva2Vucy5sb2MsICgpID0+IGBNdXN0IGhhdmUgYXQgbGVhc3QgMSBub24tJHtjb2RlKCdlbHNlJyl9IHRlc3QuYClcblxuXHRyZXR1cm4gbmV3IFN3aXRjaCh0b2tlbnMubG9jLCBzd2l0Y2hlZCwgcGFydHMsIG9wRWxzZSlcbn1cblxuZnVuY3Rpb24gcGFyc2VTd2l0Y2hMaW5lKGlzVmFsLCBsaW5lKSB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKGxpbmUpXG5cblx0bGV0IHZhbHVlc1xuXHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLk9yLCBiZWZvcmUuaGVhZCgpKSlcblx0XHR2YWx1ZXMgPSBiZWZvcmUudGFpbCgpLm1hcChwYXJzZVNpbmdsZSlcblx0ZWxzZVxuXHRcdHZhbHVlcyA9IFtwYXJzZUV4cHIoYmVmb3JlKV1cblxuXHRjb25zdCByZXN1bHQgPSAoaXNWYWwgPyBwYXJzZUJsb2NrVmFsIDogcGFyc2VCbG9ja0RvKShibG9jaylcblx0cmV0dXJuIG5ldyAoaXNWYWwgPyBTd2l0Y2hWYWxQYXJ0IDogU3dpdGNoRG9QYXJ0KShsaW5lLmxvYywgdmFsdWVzLCByZXN1bHQpXG59XG4iXX0=
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
		(0, _context.check)(parts.length > 0, tokens.loc, () => `Must have at least 1 non-${ (0, _CompileError.code)('else') } test.`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlU3dpdGNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFXd0IsV0FBVzs7Ozs7Ozs7Ozs7O1VBQVgsV0FBVyIsImZpbGUiOiJwYXJzZVN3aXRjaC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVja30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7TG9jYWxBY2Nlc3MsIFN3aXRjaCwgU3dpdGNoUGFydH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2lzS2V5d29yZCwgS2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtjaGVja0VtcHR5fSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7cGFyc2VFeHByfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCBwYXJzZUJsb2NrLCB7YmVmb3JlQW5kQmxvY2ssIHBhcnNlSnVzdEJsb2NrfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQgcGFyc2VTaW5nbGUgZnJvbSAnLi9wYXJzZVNpbmdsZSdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKiogUGFyc2UgYSB7QGxpbmsgU3dpdGNofS4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlU3dpdGNoKHN3aXRjaGVkRnJvbUZ1biwgdG9rZW5zKSB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2VucylcblxuXHRpZiAoc3dpdGNoZWRGcm9tRnVuKVxuXHRcdGNoZWNrRW1wdHkoYmVmb3JlLCAnVmFsdWUgdG8gc3dpdGNoIG9uIGlzIGBfYCwgdGhlIGZ1bmN0aW9uXFwncyBpbXBsaWNpdCBhcmd1bWVudC4nKVxuXHRjb25zdCBzd2l0Y2hlZCA9IHN3aXRjaGVkRnJvbUZ1biA/IExvY2FsQWNjZXNzLmZvY3VzKHRva2Vucy5sb2MpIDogcGFyc2VFeHByKGJlZm9yZSlcblxuXHRjb25zdCBsYXN0TGluZSA9IFNsaWNlLmdyb3VwKGJsb2NrLmxhc3QoKSlcblx0Y29uc3QgW3BhcnRMaW5lcywgb3BFbHNlXSA9IGlzS2V5d29yZChLZXl3b3Jkcy5FbHNlLCBsYXN0TGluZS5oZWFkKCkpID9cblx0XHRbYmxvY2sucnRhaWwoKSwgcGFyc2VKdXN0QmxvY2soS2V5d29yZHMuRWxzZSwgbGFzdExpbmUudGFpbCgpKV0gOlxuXHRcdFtibG9jaywgbnVsbF1cblxuXHRjb25zdCBwYXJ0cyA9IHBhcnRMaW5lcy5tYXBTbGljZXMobGluZSA9PiBwYXJzZVN3aXRjaExpbmUobGluZSkpXG5cdGNoZWNrKHBhcnRzLmxlbmd0aCA+IDAsIHRva2Vucy5sb2MsICgpID0+IGBNdXN0IGhhdmUgYXQgbGVhc3QgMSBub24tJHtjb2RlKCdlbHNlJyl9IHRlc3QuYClcblxuXHRyZXR1cm4gbmV3IFN3aXRjaCh0b2tlbnMubG9jLCBzd2l0Y2hlZCwgcGFydHMsIG9wRWxzZSlcbn1cblxuZnVuY3Rpb24gcGFyc2VTd2l0Y2hMaW5lKGxpbmUpIHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sobGluZSlcblx0Y29uc3QgdmFsdWVzID0gaXNLZXl3b3JkKEtleXdvcmRzLk9yLCBiZWZvcmUuaGVhZCgpKSA/XG5cdFx0YmVmb3JlLnRhaWwoKS5tYXAocGFyc2VTaW5nbGUpIDpcblx0XHRbcGFyc2VFeHByKGJlZm9yZSldXG5cdHJldHVybiBuZXcgU3dpdGNoUGFydChsaW5lLmxvYywgdmFsdWVzLCBwYXJzZUJsb2NrKGJsb2NrKSlcbn1cbiJdfQ==
if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../../CompileError', '../context', '../MsAst', '../Token', './checks', './parse*', './parseBlock', './parseSingle', './Slice'], function (exports, module, _CompileError, _context, _MsAst, _Token, _checks, _parse, _parseBlock, _parseSingle, _Slice) {
	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	module.exports = parseSwitch;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseSingle2 = _interopRequireDefault(_parseSingle);

	var _Slice2 = _interopRequireDefault(_Slice);

	/** Parse a {@link SwitchDo} or {@link SwitchVal}. */

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

		var _beforeAndBlock32 = _slicedToArray(_beforeAndBlock3, 2);

		const before = _beforeAndBlock32[0];
		const block = _beforeAndBlock32[1];

		let values;
		if ((0, _Token.isKeyword)(_Token.Keywords.Or, before.head())) values = before.tail().map(_parseSingle2.default);else values = [(0, _parse.parseExpr)(before)];

		const result = (isVal ? _parseBlock.parseBlockVal : _parseBlock.parseBlockDo)(block);
		return new (isVal ? _MsAst.SwitchValPart : _MsAst.SwitchDoPart)(line.loc, values, result);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlU3dpdGNoLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZVN3aXRjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7a0JDWXdCLFdBQVc7Ozs7Ozs7Ozs7QUFBcEIsVUFBUyxXQUFXLENBQUMsS0FBSyxFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUU7QUFDbkUsUUFDQyxjQUFjLEdBQUcsS0FBSyxlQVJrQixpQkFBaUIsZUFBbkMsZ0JBQWdCLEFBUXVCO1FBQzdELE1BQU0sR0FBRyxLQUFLLFVBYjZCLFNBQVMsVUFBakMsUUFBUSxBQWFVLENBQUE7O3dCQUVkLGdCQVhqQixjQUFjLEVBV2tCLE1BQU0sQ0FBQzs7OztRQUF2QyxNQUFNO1FBQUUsS0FBSzs7QUFFcEIsTUFBSSxRQUFRLENBQUE7QUFDWixNQUFJLGVBQWUsRUFBRTtBQUNwQixlQWpCTSxVQUFVLEVBaUJMLE1BQU0sRUFBRSwrREFBK0QsQ0FBQyxDQUFBO0FBQ25GLFdBQVEsR0FBRyxPQXBCTCxXQUFXLENBb0JNLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7R0FDeEMsTUFDQSxRQUFRLEdBQUcsV0FuQkwsU0FBUyxFQW1CTSxNQUFNLENBQUMsQ0FBQTs7QUFFN0IsUUFBTSxRQUFRLEdBQUcsZ0JBQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBOzthQUNkLFdBeEJyQixTQUFTLEVBd0JzQixPQXhCcEIsUUFBUSxDQXdCcUIsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUNwRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxjQUFjLENBQUMsT0F6QmQsUUFBUSxDQXlCZSxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FDL0QsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDOzs7O1FBRlAsU0FBUztRQUFFLE1BQU07O0FBSXhCLFFBQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLGVBQWUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUN2RSxlQS9CTyxLQUFLLEVBK0JOLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLHlCQUF5QixHQUFFLGtCQWhDL0QsSUFBSSxFQWdDZ0UsTUFBTSxDQUFDLEVBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTs7QUFFM0YsU0FBTyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUE7RUFDdEQ7O0FBRUQsVUFBUyxlQUFlLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRTt5QkFDYixnQkFoQ2pCLGNBQWMsRUFnQ2tCLElBQUksQ0FBQzs7OztRQUFyQyxNQUFNO1FBQUUsS0FBSzs7QUFFcEIsTUFBSSxNQUFNLENBQUE7QUFDVixNQUFJLFdBdENHLFNBQVMsRUFzQ0YsT0F0Q0ksUUFBUSxDQXNDSCxFQUFFLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQ3hDLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyx1QkFBYSxDQUFBLEtBRXZDLE1BQU0sR0FBRyxDQUFDLFdBdkNKLFNBQVMsRUF1Q0ssTUFBTSxDQUFDLENBQUMsQ0FBQTs7QUFFN0IsUUFBTSxNQUFNLEdBQUcsQ0FBQyxLQUFLLGVBeENxRCxhQUFhLGVBQTNCLFlBQVksQ0F3Q3BCLENBQUUsS0FBSyxDQUFDLENBQUE7QUFDNUQsU0FBTyxLQUFLLEtBQUssVUE3Q3NDLGFBQWEsVUFBdEMsWUFBWSxDQTZDTSxDQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0VBQzNFIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvcGFyc2VTd2l0Y2guanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVja30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7TG9jYWxBY2Nlc3MsIFN3aXRjaERvLCBTd2l0Y2hEb1BhcnQsIFN3aXRjaFZhbCwgU3dpdGNoVmFsUGFydH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2lzS2V5d29yZCwgS2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtjaGVja0VtcHR5fSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7cGFyc2VFeHByfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCB7YmVmb3JlQW5kQmxvY2ssIHBhcnNlSnVzdEJsb2NrRG8sIHBhcnNlSnVzdEJsb2NrVmFsLCBwYXJzZUJsb2NrRG8sIHBhcnNlQmxvY2tWYWxcblx0fSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQgcGFyc2VTaW5nbGUgZnJvbSAnLi9wYXJzZVNpbmdsZSdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKiogUGFyc2UgYSB7QGxpbmsgU3dpdGNoRG99IG9yIHtAbGluayBTd2l0Y2hWYWx9LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VTd2l0Y2goaXNWYWwsIHN3aXRjaGVkRnJvbUZ1biwgdG9rZW5zKSB7XG5cdGNvbnN0XG5cdFx0cGFyc2VKdXN0QmxvY2sgPSBpc1ZhbCA/IHBhcnNlSnVzdEJsb2NrVmFsIDogcGFyc2VKdXN0QmxvY2tEbyxcblx0XHRTd2l0Y2ggPSBpc1ZhbCA/IFN3aXRjaFZhbCA6IFN3aXRjaERvXG5cblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXG5cdGxldCBzd2l0Y2hlZFxuXHRpZiAoc3dpdGNoZWRGcm9tRnVuKSB7XG5cdFx0Y2hlY2tFbXB0eShiZWZvcmUsICdWYWx1ZSB0byBzd2l0Y2ggb24gaXMgYF9gLCB0aGUgZnVuY3Rpb25cXCdzIGltcGxpY2l0IGFyZ3VtZW50LicpXG5cdFx0c3dpdGNoZWQgPSBMb2NhbEFjY2Vzcy5mb2N1cyh0b2tlbnMubG9jKVxuXHR9IGVsc2Vcblx0XHRzd2l0Y2hlZCA9IHBhcnNlRXhwcihiZWZvcmUpXG5cblx0Y29uc3QgbGFzdExpbmUgPSBTbGljZS5ncm91cChibG9jay5sYXN0KCkpXG5cdGNvbnN0IFtwYXJ0TGluZXMsIG9wRWxzZV0gPSBpc0tleXdvcmQoS2V5d29yZHMuRWxzZSwgbGFzdExpbmUuaGVhZCgpKSA/XG5cdFx0W2Jsb2NrLnJ0YWlsKCksIHBhcnNlSnVzdEJsb2NrKEtleXdvcmRzLkVsc2UsIGxhc3RMaW5lLnRhaWwoKSldIDpcblx0XHRbYmxvY2ssIG51bGxdXG5cblx0Y29uc3QgcGFydHMgPSBwYXJ0TGluZXMubWFwU2xpY2VzKGxpbmUgPT4gcGFyc2VTd2l0Y2hMaW5lKGlzVmFsLCBsaW5lKSlcblx0Y2hlY2socGFydHMubGVuZ3RoID4gMCwgdG9rZW5zLmxvYywgKCkgPT4gYE11c3QgaGF2ZSBhdCBsZWFzdCAxIG5vbi0ke2NvZGUoJ2Vsc2UnKX0gdGVzdC5gKVxuXG5cdHJldHVybiBuZXcgU3dpdGNoKHRva2Vucy5sb2MsIHN3aXRjaGVkLCBwYXJ0cywgb3BFbHNlKVxufVxuXG5mdW5jdGlvbiBwYXJzZVN3aXRjaExpbmUoaXNWYWwsIGxpbmUpIHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sobGluZSlcblxuXHRsZXQgdmFsdWVzXG5cdGlmIChpc0tleXdvcmQoS2V5d29yZHMuT3IsIGJlZm9yZS5oZWFkKCkpKVxuXHRcdHZhbHVlcyA9IGJlZm9yZS50YWlsKCkubWFwKHBhcnNlU2luZ2xlKVxuXHRlbHNlXG5cdFx0dmFsdWVzID0gW3BhcnNlRXhwcihiZWZvcmUpXVxuXG5cdGNvbnN0IHJlc3VsdCA9IChpc1ZhbCA/IHBhcnNlQmxvY2tWYWwgOiBwYXJzZUJsb2NrRG8pKGJsb2NrKVxuXHRyZXR1cm4gbmV3IChpc1ZhbCA/IFN3aXRjaFZhbFBhcnQgOiBTd2l0Y2hEb1BhcnQpKGxpbmUubG9jLCB2YWx1ZXMsIHJlc3VsdClcbn1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

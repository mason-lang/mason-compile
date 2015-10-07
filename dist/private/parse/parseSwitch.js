if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../../CompileError', '../MsAst', '../Token', './context', './parse*', './parseBlock', './parseSingle', './Slice'], function (exports, module, _CompileError, _MsAst, _Token, _context, _parse, _parseBlock, _parseSingle, _Slice) {
	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseSingle2 = _interopRequireDefault(_parseSingle);

	var _Slice2 = _interopRequireDefault(_Slice);

	module.exports = (isVal, switchedFromFun, tokens) => {
		var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const block = _beforeAndBlock2[1];

		let switched;
		if (switchedFromFun) {
			(0, _context.checkEmpty)(before, 'Value to switch on is `_`, the function\'s implicit argument.');
			switched = _MsAst.LocalAccess.focus(tokens.loc);
		} else switched = (0, _parse.parseExpr)(before);

		const lastLine = _Slice2.default.group(block.last());

		var _ref = (0, _Token.isKeyword)(_Token.KW_Else, lastLine.head()) ? [block.rtail(), (isVal ? _parseBlock.justBlockVal : _parseBlock.justBlockDo)(_Token.KW_Else, lastLine.tail())] : [block, null];

		var _ref2 = _slicedToArray(_ref, 2);

		const partLines = _ref2[0];
		const opElse = _ref2[1];

		const parts = partLines.mapSlices(parseSwitchLine(isVal));
		_context.context.check(parts.length > 0, tokens.loc, () => `Must have at least 1 non-${ (0, _CompileError.code)('else') } test.`);

		return new (isVal ? _MsAst.SwitchVal : _MsAst.SwitchDo)(tokens.loc, switched, parts, opElse);
	};

	const parseSwitchLine = isVal => line => {
		var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(line);

		var _beforeAndBlock32 = _slicedToArray(_beforeAndBlock3, 2);

		const before = _beforeAndBlock32[0];
		const block = _beforeAndBlock32[1];

		let values;
		if ((0, _Token.isKeyword)(_Token.KW_Or, before.head())) values = before.tail().map(_parseSingle2.default);else values = [(0, _parse.parseExpr)(before)];

		const result = (isVal ? _parseBlock.parseBlockVal : _parseBlock.parseBlockDo)(block);
		return new (isVal ? _MsAst.SwitchValPart : _MsAst.SwitchDoPart)(line.loc, values, result);
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlU3dpdGNoLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZVN3aXRjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7a0JDU2UsQ0FBQyxLQUFLLEVBQUUsZUFBZSxFQUFFLE1BQU0sS0FBSzt3QkFDMUIsZ0JBTGpCLGNBQWMsRUFLa0IsTUFBTSxDQUFDOzs7O1FBQXZDLE1BQU07UUFBRSxLQUFLOztBQUVwQixNQUFJLFFBQVEsQ0FBQTtBQUNaLE1BQUksZUFBZSxFQUFFO0FBQ3BCLGdCQVhNLFVBQVUsRUFXTCxNQUFNLEVBQUUsK0RBQStELENBQUMsQ0FBQTtBQUNuRixXQUFRLEdBQUcsT0FkTCxXQUFXLENBY00sS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtHQUN4QyxNQUNBLFFBQVEsR0FBRyxXQWJMLFNBQVMsRUFhTSxNQUFNLENBQUMsQ0FBQTs7QUFFN0IsUUFBTSxRQUFRLEdBQUcsZ0JBQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBOzthQUNkLFdBbEJyQixTQUFTLFNBQUUsT0FBTyxFQWtCc0IsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQzlELENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxlQWhCYSxZQUFZLGVBQXpCLFdBQVcsQ0FnQmtCLFFBbkJsQyxPQUFPLEVBbUJzQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUMvRSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7Ozs7UUFGUCxTQUFTO1FBQUUsTUFBTTs7QUFJeEIsUUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtBQUN6RCxXQXRCbUIsT0FBTyxDQXNCbEIsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFDM0MsQ0FBQyx5QkFBeUIsR0FBRSxrQkExQnRCLElBQUksRUEwQnVCLE1BQU0sQ0FBQyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7O0FBRWxELFNBQU8sS0FBSyxLQUFLLFVBM0IyQixTQUFTLFVBQWpDLFFBQVEsQ0EyQlksQ0FBRSxNQUFNLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUE7RUFDOUU7O0FBRUQsT0FBTSxlQUFlLEdBQUcsS0FBSyxJQUFJLElBQUksSUFBSTt5QkFDaEIsZ0JBM0JqQixjQUFjLEVBMkJrQixJQUFJLENBQUM7Ozs7UUFBckMsTUFBTTtRQUFFLEtBQUs7O0FBRXBCLE1BQUksTUFBTSxDQUFBO0FBQ1YsTUFBSSxXQWpDRyxTQUFTLFNBQVcsS0FBSyxFQWlDWCxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsRUFDbEMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLHVCQUFhLENBQUEsS0FFdkMsTUFBTSxHQUFHLENBQUMsV0FsQ0osU0FBUyxFQWtDSyxNQUFNLENBQUMsQ0FBQyxDQUFBOztBQUU3QixRQUFNLE1BQU0sR0FBRyxDQUFDLEtBQUssZUFuQzJDLGFBQWEsZUFBM0IsWUFBWSxDQW1DVixDQUFFLEtBQUssQ0FBQyxDQUFBO0FBQzVELFNBQU8sS0FBSyxLQUFLLFVBeENzQyxhQUFhLFVBQXRDLFlBQVksQ0F3Q00sQ0FBRSxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTtFQUMzRSxDQUFBIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvcGFyc2VTd2l0Y2guanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtMb2NhbEFjY2VzcywgU3dpdGNoRG8sIFN3aXRjaERvUGFydCwgU3dpdGNoVmFsLCBTd2l0Y2hWYWxQYXJ0fSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7aXNLZXl3b3JkLCBLV19FbHNlLCBLV19Pcn0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2NoZWNrRW1wdHksIGNvbnRleHR9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB7cGFyc2VFeHByfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCB7YmVmb3JlQW5kQmxvY2ssIGp1c3RCbG9ja0RvLCBqdXN0QmxvY2tWYWwsIHBhcnNlQmxvY2tEbywgcGFyc2VCbG9ja1ZhbH0gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlU2luZ2xlIGZyb20gJy4vcGFyc2VTaW5nbGUnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuZXhwb3J0IGRlZmF1bHQgKGlzVmFsLCBzd2l0Y2hlZEZyb21GdW4sIHRva2VucykgPT4ge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cblx0bGV0IHN3aXRjaGVkXG5cdGlmIChzd2l0Y2hlZEZyb21GdW4pIHtcblx0XHRjaGVja0VtcHR5KGJlZm9yZSwgJ1ZhbHVlIHRvIHN3aXRjaCBvbiBpcyBgX2AsIHRoZSBmdW5jdGlvblxcJ3MgaW1wbGljaXQgYXJndW1lbnQuJylcblx0XHRzd2l0Y2hlZCA9IExvY2FsQWNjZXNzLmZvY3VzKHRva2Vucy5sb2MpXG5cdH0gZWxzZVxuXHRcdHN3aXRjaGVkID0gcGFyc2VFeHByKGJlZm9yZSlcblxuXHRjb25zdCBsYXN0TGluZSA9IFNsaWNlLmdyb3VwKGJsb2NrLmxhc3QoKSlcblx0Y29uc3QgW3BhcnRMaW5lcywgb3BFbHNlXSA9IGlzS2V5d29yZChLV19FbHNlLCBsYXN0TGluZS5oZWFkKCkpID9cblx0XHRbYmxvY2sucnRhaWwoKSwgKGlzVmFsID8ganVzdEJsb2NrVmFsIDoganVzdEJsb2NrRG8pKEtXX0Vsc2UsIGxhc3RMaW5lLnRhaWwoKSldIDpcblx0XHRbYmxvY2ssIG51bGxdXG5cblx0Y29uc3QgcGFydHMgPSBwYXJ0TGluZXMubWFwU2xpY2VzKHBhcnNlU3dpdGNoTGluZShpc1ZhbCkpXG5cdGNvbnRleHQuY2hlY2socGFydHMubGVuZ3RoID4gMCwgdG9rZW5zLmxvYywgKCkgPT5cblx0XHRgTXVzdCBoYXZlIGF0IGxlYXN0IDEgbm9uLSR7Y29kZSgnZWxzZScpfSB0ZXN0LmApXG5cblx0cmV0dXJuIG5ldyAoaXNWYWwgPyBTd2l0Y2hWYWwgOiBTd2l0Y2hEbykodG9rZW5zLmxvYywgc3dpdGNoZWQsIHBhcnRzLCBvcEVsc2UpXG59XG5cbmNvbnN0IHBhcnNlU3dpdGNoTGluZSA9IGlzVmFsID0+IGxpbmUgPT4ge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayhsaW5lKVxuXG5cdGxldCB2YWx1ZXNcblx0aWYgKGlzS2V5d29yZChLV19PciwgYmVmb3JlLmhlYWQoKSkpXG5cdFx0dmFsdWVzID0gYmVmb3JlLnRhaWwoKS5tYXAocGFyc2VTaW5nbGUpXG5cdGVsc2Vcblx0XHR2YWx1ZXMgPSBbcGFyc2VFeHByKGJlZm9yZSldXG5cblx0Y29uc3QgcmVzdWx0ID0gKGlzVmFsID8gcGFyc2VCbG9ja1ZhbCA6IHBhcnNlQmxvY2tEbykoYmxvY2spXG5cdHJldHVybiBuZXcgKGlzVmFsID8gU3dpdGNoVmFsUGFydCA6IFN3aXRjaERvUGFydCkobGluZS5sb2MsIHZhbHVlcywgcmVzdWx0KVxufSJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

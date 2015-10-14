if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../../CompileError', '../context', '../MsAst', '../Token', './checks', './parse*', './parseBlock', './parseSingle', './Slice'], function (exports, module, _CompileError, _context, _MsAst, _Token, _checks, _parse, _parseBlock, _parseSingle, _Slice) {
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
			(0, _checks.checkEmpty)(before, 'Value to switch on is `_`, the function\'s implicit argument.');
			switched = _MsAst.LocalAccess.focus(tokens.loc);
		} else switched = (0, _parse.parseExpr)(before);

		const lastLine = _Slice2.default.group(block.last());

		var _ref = (0, _Token.isKeyword)(_Token.KW_Else, lastLine.head()) ? [block.rtail(), (isVal ? _parseBlock.justBlockVal : _parseBlock.justBlockDo)(_Token.KW_Else, lastLine.tail())] : [block, null];

		var _ref2 = _slicedToArray(_ref, 2);

		const partLines = _ref2[0];
		const opElse = _ref2[1];

		const parts = partLines.mapSlices(parseSwitchLine(isVal));
		(0, _context.check)(parts.length > 0, tokens.loc, () => `Must have at least 1 non-${ (0, _CompileError.code)('else') } test.`);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlU3dpdGNoLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZVN3aXRjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7a0JDVWUsQ0FBQyxLQUFLLEVBQUUsZUFBZSxFQUFFLE1BQU0sS0FBSzt3QkFDMUIsZ0JBTGpCLGNBQWMsRUFLa0IsTUFBTSxDQUFDOzs7O1FBQXZDLE1BQU07UUFBRSxLQUFLOztBQUVwQixNQUFJLFFBQVEsQ0FBQTtBQUNaLE1BQUksZUFBZSxFQUFFO0FBQ3BCLGVBWE0sVUFBVSxFQVdMLE1BQU0sRUFBRSwrREFBK0QsQ0FBQyxDQUFBO0FBQ25GLFdBQVEsR0FBRyxPQWRMLFdBQVcsQ0FjTSxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0dBQ3hDLE1BQ0EsUUFBUSxHQUFHLFdBYkwsU0FBUyxFQWFNLE1BQU0sQ0FBQyxDQUFBOztBQUU3QixRQUFNLFFBQVEsR0FBRyxnQkFBTSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7O2FBQ2QsV0FsQnJCLFNBQVMsU0FBRSxPQUFPLEVBa0JzQixRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsR0FDOUQsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLGVBaEJhLFlBQVksZUFBekIsV0FBVyxDQWdCa0IsUUFuQmxDLE9BQU8sRUFtQnNDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQy9FLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQzs7OztRQUZQLFNBQVM7UUFBRSxNQUFNOztBQUl4QixRQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQ3pELGVBekJPLEtBQUssRUF5Qk4sS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMseUJBQXlCLEdBQUUsa0JBMUIvRCxJQUFJLEVBMEJnRSxNQUFNLENBQUMsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFBOztBQUUzRixTQUFPLEtBQUssS0FBSyxVQTFCMkIsU0FBUyxVQUFqQyxRQUFRLENBMEJZLENBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0VBQzlFOztBQUVELE9BQU0sZUFBZSxHQUFHLEtBQUssSUFBSSxJQUFJLElBQUk7eUJBQ2hCLGdCQTFCakIsY0FBYyxFQTBCa0IsSUFBSSxDQUFDOzs7O1FBQXJDLE1BQU07UUFBRSxLQUFLOztBQUVwQixNQUFJLE1BQU0sQ0FBQTtBQUNWLE1BQUksV0FoQ0csU0FBUyxTQUFXLEtBQUssRUFnQ1gsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQ2xDLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyx1QkFBYSxDQUFBLEtBRXZDLE1BQU0sR0FBRyxDQUFDLFdBakNKLFNBQVMsRUFpQ0ssTUFBTSxDQUFDLENBQUMsQ0FBQTs7QUFFN0IsUUFBTSxNQUFNLEdBQUcsQ0FBQyxLQUFLLGVBbEMyQyxhQUFhLGVBQTNCLFlBQVksQ0FrQ1YsQ0FBRSxLQUFLLENBQUMsQ0FBQTtBQUM1RCxTQUFPLEtBQUssS0FBSyxVQXZDc0MsYUFBYSxVQUF0QyxZQUFZLENBdUNNLENBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUE7RUFDM0UsQ0FBQSIsImZpbGUiOiJwcml2YXRlL3BhcnNlL3BhcnNlU3dpdGNoLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0xvY2FsQWNjZXNzLCBTd2l0Y2hEbywgU3dpdGNoRG9QYXJ0LCBTd2l0Y2hWYWwsIFN3aXRjaFZhbFBhcnR9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtpc0tleXdvcmQsIEtXX0Vsc2UsIEtXX09yfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7Y2hlY2tFbXB0eX0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge3BhcnNlRXhwcn0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQge2JlZm9yZUFuZEJsb2NrLCBqdXN0QmxvY2tEbywganVzdEJsb2NrVmFsLCBwYXJzZUJsb2NrRG8sIHBhcnNlQmxvY2tWYWx9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZVNpbmdsZSBmcm9tICcuL3BhcnNlU2luZ2xlJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbmV4cG9ydCBkZWZhdWx0IChpc1ZhbCwgc3dpdGNoZWRGcm9tRnVuLCB0b2tlbnMpID0+IHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXG5cdGxldCBzd2l0Y2hlZFxuXHRpZiAoc3dpdGNoZWRGcm9tRnVuKSB7XG5cdFx0Y2hlY2tFbXB0eShiZWZvcmUsICdWYWx1ZSB0byBzd2l0Y2ggb24gaXMgYF9gLCB0aGUgZnVuY3Rpb25cXCdzIGltcGxpY2l0IGFyZ3VtZW50LicpXG5cdFx0c3dpdGNoZWQgPSBMb2NhbEFjY2Vzcy5mb2N1cyh0b2tlbnMubG9jKVxuXHR9IGVsc2Vcblx0XHRzd2l0Y2hlZCA9IHBhcnNlRXhwcihiZWZvcmUpXG5cblx0Y29uc3QgbGFzdExpbmUgPSBTbGljZS5ncm91cChibG9jay5sYXN0KCkpXG5cdGNvbnN0IFtwYXJ0TGluZXMsIG9wRWxzZV0gPSBpc0tleXdvcmQoS1dfRWxzZSwgbGFzdExpbmUuaGVhZCgpKSA/XG5cdFx0W2Jsb2NrLnJ0YWlsKCksIChpc1ZhbCA/IGp1c3RCbG9ja1ZhbCA6IGp1c3RCbG9ja0RvKShLV19FbHNlLCBsYXN0TGluZS50YWlsKCkpXSA6XG5cdFx0W2Jsb2NrLCBudWxsXVxuXG5cdGNvbnN0IHBhcnRzID0gcGFydExpbmVzLm1hcFNsaWNlcyhwYXJzZVN3aXRjaExpbmUoaXNWYWwpKVxuXHRjaGVjayhwYXJ0cy5sZW5ndGggPiAwLCB0b2tlbnMubG9jLCAoKSA9PiBgTXVzdCBoYXZlIGF0IGxlYXN0IDEgbm9uLSR7Y29kZSgnZWxzZScpfSB0ZXN0LmApXG5cblx0cmV0dXJuIG5ldyAoaXNWYWwgPyBTd2l0Y2hWYWwgOiBTd2l0Y2hEbykodG9rZW5zLmxvYywgc3dpdGNoZWQsIHBhcnRzLCBvcEVsc2UpXG59XG5cbmNvbnN0IHBhcnNlU3dpdGNoTGluZSA9IGlzVmFsID0+IGxpbmUgPT4ge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayhsaW5lKVxuXG5cdGxldCB2YWx1ZXNcblx0aWYgKGlzS2V5d29yZChLV19PciwgYmVmb3JlLmhlYWQoKSkpXG5cdFx0dmFsdWVzID0gYmVmb3JlLnRhaWwoKS5tYXAocGFyc2VTaW5nbGUpXG5cdGVsc2Vcblx0XHR2YWx1ZXMgPSBbcGFyc2VFeHByKGJlZm9yZSldXG5cblx0Y29uc3QgcmVzdWx0ID0gKGlzVmFsID8gcGFyc2VCbG9ja1ZhbCA6IHBhcnNlQmxvY2tEbykoYmxvY2spXG5cdHJldHVybiBuZXcgKGlzVmFsID8gU3dpdGNoVmFsUGFydCA6IFN3aXRjaERvUGFydCkobGluZS5sb2MsIHZhbHVlcywgcmVzdWx0KVxufSJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

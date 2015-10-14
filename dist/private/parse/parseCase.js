if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../../CompileError', '../context', '../MsAst', '../Token', '../util', './checks', './parse*', './parseBlock', './parseLocalDeclares', './parseSpaced', './Slice'], function (exports, module, _CompileError, _context, _MsAst, _Token, _util, _checks, _parse, _parseBlock, _parseLocalDeclares, _parseSpaced, _Slice) {
	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseLocalDeclares2 = _interopRequireDefault(_parseLocalDeclares);

	var _parseSpaced2 = _interopRequireDefault(_parseSpaced);

	var _Slice2 = _interopRequireDefault(_Slice);

	module.exports = (isVal, casedFromFun, tokens) => {
		var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const block = _beforeAndBlock2[1];

		let opCased;
		if (casedFromFun) {
			(0, _checks.checkEmpty)(before, 'Can\'t make focus — is implicitly provided as first argument.');
			opCased = null;
		} else opCased = (0, _util.opIf)(!before.isEmpty(), () => _MsAst.AssignSingle.focus(before.loc, (0, _parse.parseExpr)(before)));

		const lastLine = _Slice2.default.group(block.last());

		var _ref = (0, _Token.isKeyword)(_Token.KW_Else, lastLine.head()) ? [block.rtail(), (isVal ? _parseBlock.justBlockVal : _parseBlock.justBlockDo)(_Token.KW_Else, lastLine.tail())] : [block, null];

		var _ref2 = _slicedToArray(_ref, 2);

		const partLines = _ref2[0];
		const opElse = _ref2[1];

		const parts = partLines.mapSlices(line => parseCaseLine(isVal, line));
		(0, _context.check)(parts.length > 0, tokens.loc, () => `Must have at least 1 non-${ (0, _CompileError.code)('else') } test.`);

		return new (isVal ? _MsAst.CaseVal : _MsAst.CaseDo)(tokens.loc, opCased, parts, opElse);
	};

	const parseCaseLine = (isVal, line) => {
		var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(line);

		var _beforeAndBlock32 = _slicedToArray(_beforeAndBlock3, 2);

		const before = _beforeAndBlock32[0];
		const block = _beforeAndBlock32[1];

		const test = parseCaseTest(before);
		const result = (isVal ? _parseBlock.parseBlockVal : _parseBlock.parseBlockDo)(block);
		return new (isVal ? _MsAst.CaseValPart : _MsAst.CaseDoPart)(line.loc, test, result);
	},
	      parseCaseTest = tokens => {
		const first = tokens.head();
		// Pattern match starts with type test and is followed by local declares.
		// E.g., `:Some val`
		if ((0, _Token.isGroup)(_Token.G_Space, first) && tokens.size() > 1) {
			const ft = _Slice2.default.group(first);
			if ((0, _Token.isKeyword)(_Token.KW_Type, ft.head())) {
				const type = (0, _parseSpaced2.default)(ft.tail());
				const locals = (0, _parseLocalDeclares2.default)(tokens.tail());
				return new _MsAst.Pattern(first.loc, type, locals, _MsAst.LocalAccess.focus(tokens.loc));
			}
		}
		return (0, _parse.parseExpr)(tokens);
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlQ2FzZS5qcyIsInByaXZhdGUvcGFyc2UvcGFyc2VDYXNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O2tCQ2FlLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxNQUFNLEtBQUs7d0JBQ3ZCLGdCQU5qQixjQUFjLEVBTWtCLE1BQU0sQ0FBQzs7OztRQUF2QyxNQUFNO1FBQUUsS0FBSzs7QUFFcEIsTUFBSSxPQUFPLENBQUE7QUFDWCxNQUFJLFlBQVksRUFBRTtBQUNqQixlQVpNLFVBQVUsRUFZTCxNQUFNLEVBQUUsK0RBQStELENBQUMsQ0FBQTtBQUNuRixVQUFPLEdBQUcsSUFBSSxDQUFBO0dBQ2QsTUFDQSxPQUFPLEdBQUcsVUFoQkosSUFBSSxFQWdCSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLE9BbkJsQyxZQUFZLENBbUJtQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxXQWRqRSxTQUFTLEVBY2tFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTs7QUFFM0YsUUFBTSxRQUFRLEdBQUcsZ0JBQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBOzthQUNkLFdBcEJILFNBQVMsU0FBRSxPQUFPLEVBb0JJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUM5RCxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssZUFqQjBDLFlBQVksZUFBekIsV0FBVyxDQWlCWCxRQXJCaEIsT0FBTyxFQXFCb0IsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FDL0UsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDOzs7O1FBRlAsU0FBUztRQUFFLE1BQU07O0FBSXhCLFFBQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLGFBQWEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUNyRSxlQTVCTyxLQUFLLEVBNEJOLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFDbkMsQ0FBQyx5QkFBeUIsR0FBRSxrQkE5QnRCLElBQUksRUE4QnVCLE1BQU0sQ0FBQyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7O0FBRWxELFNBQU8sS0FBSyxLQUFLLFVBOUJ3QixPQUFPLFVBQTNCLE1BQU0sQ0E4QlMsQ0FBRSxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUE7RUFDekU7O0FBRUQsT0FDQyxhQUFhLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxLQUFLO3lCQUNSLGdCQTdCbEIsY0FBYyxFQTZCbUIsSUFBSSxDQUFDOzs7O1FBQXJDLE1BQU07UUFBRSxLQUFLOztBQUNwQixRQUFNLElBQUksR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDbEMsUUFBTSxNQUFNLEdBQUcsQ0FBQyxLQUFLLGVBL0JlLGFBQWEsZUFBM0IsWUFBWSxDQStCa0IsQ0FBRSxLQUFLLENBQUMsQ0FBQTtBQUM1RCxTQUFPLEtBQUssS0FBSyxVQXRDZ0MsV0FBVyxVQUFoQyxVQUFVLENBc0NNLENBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7RUFDckU7T0FFRCxhQUFhLEdBQUcsTUFBTSxJQUFJO0FBQ3pCLFFBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQTs7O0FBRzNCLE1BQUksV0EzQ1csT0FBTyxTQUFoQixPQUFPLEVBMkNRLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUU7QUFDakQsU0FBTSxFQUFFLEdBQUcsZ0JBQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQzdCLE9BQUksV0E3Q21CLFNBQVMsU0FBVyxPQUFPLEVBNkMzQixFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRTtBQUNsQyxVQUFNLElBQUksR0FBRywyQkFBWSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUNuQyxVQUFNLE1BQU0sR0FBRyxrQ0FBbUIsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7QUFDaEQsV0FBTyxXQWxEa0UsT0FBTyxDQWtEN0QsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BbERnQixXQUFXLENBa0RmLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUMxRTtHQUNEO0FBQ0QsU0FBTyxXQWhERCxTQUFTLEVBZ0RFLE1BQU0sQ0FBQyxDQUFBO0VBQ3hCLENBQUEiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9wYXJzZUNhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVja30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7QXNzaWduU2luZ2xlLCBDYXNlRG8sIENhc2VEb1BhcnQsIENhc2VWYWwsIENhc2VWYWxQYXJ0LCBMb2NhbEFjY2VzcywgUGF0dGVyblxuXHR9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtHX1NwYWNlLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtXX0Vsc2UsIEtXX1R5cGV9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtvcElmfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtjaGVja0VtcHR5fSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7cGFyc2VFeHByfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCB7YmVmb3JlQW5kQmxvY2ssIHBhcnNlQmxvY2tEbywgcGFyc2VCbG9ja1ZhbCwganVzdEJsb2NrRG8sIGp1c3RCbG9ja1ZhbH0gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlTG9jYWxEZWNsYXJlcyBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcbmltcG9ydCBwYXJzZVNwYWNlZCBmcm9tICcuL3BhcnNlU3BhY2VkJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbmV4cG9ydCBkZWZhdWx0IChpc1ZhbCwgY2FzZWRGcm9tRnVuLCB0b2tlbnMpID0+IHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXG5cdGxldCBvcENhc2VkXG5cdGlmIChjYXNlZEZyb21GdW4pIHtcblx0XHRjaGVja0VtcHR5KGJlZm9yZSwgJ0NhblxcJ3QgbWFrZSBmb2N1cyDigJQgaXMgaW1wbGljaXRseSBwcm92aWRlZCBhcyBmaXJzdCBhcmd1bWVudC4nKVxuXHRcdG9wQ2FzZWQgPSBudWxsXG5cdH0gZWxzZVxuXHRcdG9wQ2FzZWQgPSBvcElmKCFiZWZvcmUuaXNFbXB0eSgpLCAoKSA9PiBBc3NpZ25TaW5nbGUuZm9jdXMoYmVmb3JlLmxvYywgcGFyc2VFeHByKGJlZm9yZSkpKVxuXG5cdGNvbnN0IGxhc3RMaW5lID0gU2xpY2UuZ3JvdXAoYmxvY2subGFzdCgpKVxuXHRjb25zdCBbcGFydExpbmVzLCBvcEVsc2VdID0gaXNLZXl3b3JkKEtXX0Vsc2UsIGxhc3RMaW5lLmhlYWQoKSkgP1xuXHRcdFtibG9jay5ydGFpbCgpLCAoaXNWYWwgPyBqdXN0QmxvY2tWYWwgOiBqdXN0QmxvY2tEbykoS1dfRWxzZSwgbGFzdExpbmUudGFpbCgpKV0gOlxuXHRcdFtibG9jaywgbnVsbF1cblxuXHRjb25zdCBwYXJ0cyA9IHBhcnRMaW5lcy5tYXBTbGljZXMobGluZSA9PiBwYXJzZUNhc2VMaW5lKGlzVmFsLCBsaW5lKSlcblx0Y2hlY2socGFydHMubGVuZ3RoID4gMCwgdG9rZW5zLmxvYywgKCkgPT5cblx0XHRgTXVzdCBoYXZlIGF0IGxlYXN0IDEgbm9uLSR7Y29kZSgnZWxzZScpfSB0ZXN0LmApXG5cblx0cmV0dXJuIG5ldyAoaXNWYWwgPyBDYXNlVmFsIDogQ2FzZURvKSh0b2tlbnMubG9jLCBvcENhc2VkLCBwYXJ0cywgb3BFbHNlKVxufVxuXG5jb25zdFxuXHRwYXJzZUNhc2VMaW5lID0gKGlzVmFsLCBsaW5lKSA9PiB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sobGluZSlcblx0XHRjb25zdCB0ZXN0ID0gcGFyc2VDYXNlVGVzdChiZWZvcmUpXG5cdFx0Y29uc3QgcmVzdWx0ID0gKGlzVmFsID8gcGFyc2VCbG9ja1ZhbCA6IHBhcnNlQmxvY2tEbykoYmxvY2spXG5cdFx0cmV0dXJuIG5ldyAoaXNWYWwgPyBDYXNlVmFsUGFydCA6IENhc2VEb1BhcnQpKGxpbmUubG9jLCB0ZXN0LCByZXN1bHQpXG5cdH0sXG5cblx0cGFyc2VDYXNlVGVzdCA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgZmlyc3QgPSB0b2tlbnMuaGVhZCgpXG5cdFx0Ly8gUGF0dGVybiBtYXRjaCBzdGFydHMgd2l0aCB0eXBlIHRlc3QgYW5kIGlzIGZvbGxvd2VkIGJ5IGxvY2FsIGRlY2xhcmVzLlxuXHRcdC8vIEUuZy4sIGA6U29tZSB2YWxgXG5cdFx0aWYgKGlzR3JvdXAoR19TcGFjZSwgZmlyc3QpICYmIHRva2Vucy5zaXplKCkgPiAxKSB7XG5cdFx0XHRjb25zdCBmdCA9IFNsaWNlLmdyb3VwKGZpcnN0KVxuXHRcdFx0aWYgKGlzS2V5d29yZChLV19UeXBlLCBmdC5oZWFkKCkpKSB7XG5cdFx0XHRcdGNvbnN0IHR5cGUgPSBwYXJzZVNwYWNlZChmdC50YWlsKCkpXG5cdFx0XHRcdGNvbnN0IGxvY2FscyA9IHBhcnNlTG9jYWxEZWNsYXJlcyh0b2tlbnMudGFpbCgpKVxuXHRcdFx0XHRyZXR1cm4gbmV3IFBhdHRlcm4oZmlyc3QubG9jLCB0eXBlLCBsb2NhbHMsIExvY2FsQWNjZXNzLmZvY3VzKHRva2Vucy5sb2MpKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcGFyc2VFeHByKHRva2Vucylcblx0fSJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

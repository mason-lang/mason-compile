if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../../CompileError', '../context', '../MsAst', '../Token', '../util', './checks', './parse*', './parseBlock', './parseLocalDeclares', './parseSpaced', './Slice'], function (exports, module, _CompileError, _context, _MsAst, _Token, _util, _checks, _parse, _parseBlock, _parseLocalDeclares, _parseSpaced, _Slice) {
	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	module.exports = parseCase;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseLocalDeclares2 = _interopRequireDefault(_parseLocalDeclares);

	var _parseSpaced2 = _interopRequireDefault(_parseSpaced);

	var _Slice2 = _interopRequireDefault(_Slice);

	/** Parse a {@link CaseDo} or {@link CaseVal}. */

	function parseCase(isVal, casedFromFun, tokens) {
		const parseJustBlock = isVal ? _parseBlock.parseJustBlockVal : _parseBlock.parseJustBlockDo,
		      Case = isVal ? _MsAst.CaseVal : _MsAst.CaseDo;

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

		var _ref = (0, _Token.isKeyword)(_Token.Keywords.Else, lastLine.head()) ? [block.rtail(), parseJustBlock(_Token.Keywords.Else, lastLine.tail())] : [block, null];

		var _ref2 = _slicedToArray(_ref, 2);

		const partLines = _ref2[0];
		const opElse = _ref2[1];

		const parts = partLines.mapSlices(line => parseCaseLine(isVal, line));
		(0, _context.check)(parts.length > 0, tokens.loc, () => `Must have at least 1 non-${ (0, _CompileError.code)('else') } test.`);

		return new Case(tokens.loc, opCased, parts, opElse);
	}

	function parseCaseLine(isVal, line) {
		var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(line);

		var _beforeAndBlock32 = _slicedToArray(_beforeAndBlock3, 2);

		const before = _beforeAndBlock32[0];
		const block = _beforeAndBlock32[1];

		const test = parseCaseTest(before);
		const result = (isVal ? _parseBlock.parseBlockVal : _parseBlock.parseBlockDo)(block);
		return new (isVal ? _MsAst.CaseValPart : _MsAst.CaseDoPart)(line.loc, test, result);
	}

	function parseCaseTest(tokens) {
		const first = tokens.head();
		// Pattern match starts with type test and is followed by local declares.
		// E.g., `:Some val`
		if ((0, _Token.isGroup)(_Token.Groups.Space, first) && tokens.size() > 1) {
			const ft = _Slice2.default.group(first);
			if ((0, _Token.isKeyword)(_Token.Keywords.Type, ft.head())) {
				const type = (0, _parseSpaced2.default)(ft.tail());
				const locals = (0, _parseLocalDeclares2.default)(tokens.tail());
				return new _MsAst.Pattern(tokens.loc, type, locals);
			}
		}
		return (0, _parse.parseExpr)(tokens);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlQ2FzZS5qcyIsInByaXZhdGUvcGFyc2UvcGFyc2VDYXNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztrQkNjd0IsU0FBUzs7Ozs7Ozs7Ozs7O0FBQWxCLFVBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFO0FBQzlELFFBQ0MsY0FBYyxHQUFHLEtBQUssZUFUK0MsaUJBQWlCLGVBQW5DLGdCQUFnQixBQVNOO1FBQzdELElBQUksR0FBRyxLQUFLLFVBZjRCLE9BQU8sVUFBM0IsTUFBTSxBQWVLLENBQUE7O3dCQUVSLGdCQVpqQixjQUFjLEVBWWtCLE1BQU0sQ0FBQzs7OztRQUF2QyxNQUFNO1FBQUUsS0FBSzs7QUFFcEIsTUFBSSxPQUFPLENBQUE7QUFDWCxNQUFJLFlBQVksRUFBRTtBQUNqQixlQWxCTSxVQUFVLEVBa0JMLE1BQU0sRUFBRSwrREFBK0QsQ0FBQyxDQUFBO0FBQ25GLFVBQU8sR0FBRyxJQUFJLENBQUE7R0FDZCxNQUNBLE9BQU8sR0FBRyxVQXRCSixJQUFJLEVBc0JLLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sT0F4QmxDLFlBQVksQ0F3Qm1DLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLFdBcEJqRSxTQUFTLEVBb0JrRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7O0FBRTNGLFFBQU0sUUFBUSxHQUFHLGdCQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTs7YUFDZCxXQTFCSixTQUFTLEVBMEJLLE9BMUJILFFBQVEsQ0EwQkksSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUNwRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxjQUFjLENBQUMsT0EzQkcsUUFBUSxDQTJCRixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FDL0QsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDOzs7O1FBRlAsU0FBUztRQUFFLE1BQU07O0FBSXhCLFFBQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLGFBQWEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUNyRSxlQWpDTyxLQUFLLEVBaUNOLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFDbkMsQ0FBQyx5QkFBeUIsR0FBRSxrQkFuQ3RCLElBQUksRUFtQ3VCLE1BQU0sQ0FBQyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7O0FBRWxELFNBQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0VBQ25EOztBQUVELFVBQVMsYUFBYSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUU7eUJBQ1gsZ0JBbENqQixjQUFjLEVBa0NrQixJQUFJLENBQUM7Ozs7UUFBckMsTUFBTTtRQUFFLEtBQUs7O0FBQ3BCLFFBQU0sSUFBSSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNsQyxRQUFNLE1BQU0sR0FBRyxDQUFDLEtBQUssZUFwQ2dCLGFBQWEsZUFBM0IsWUFBWSxDQW9DaUIsQ0FBRSxLQUFLLENBQUMsQ0FBQTtBQUM1RCxTQUFPLEtBQUssS0FBSyxVQTFDaUMsV0FBVyxVQUFoQyxVQUFVLENBMENLLENBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7RUFDckU7O0FBRUQsVUFBUyxhQUFhLENBQUMsTUFBTSxFQUFFO0FBQzlCLFFBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQTs7O0FBRzNCLE1BQUksV0FoRFcsT0FBTyxFQWdEVixPQWhETCxNQUFNLENBZ0RNLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFO0FBQ3RELFNBQU0sRUFBRSxHQUFHLGdCQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUM3QixPQUFJLFdBbERtQixTQUFTLEVBa0RsQixPQWxEb0IsUUFBUSxDQWtEbkIsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFO0FBQ3hDLFVBQU0sSUFBSSxHQUFHLDJCQUFZLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQ25DLFVBQU0sTUFBTSxHQUFHLGtDQUFtQixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUNoRCxXQUFPLFdBdERzRCxPQUFPLENBc0RqRCxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUM1QztHQUNEO0FBQ0QsU0FBTyxXQXJEQSxTQUFTLEVBcURDLE1BQU0sQ0FBQyxDQUFBO0VBQ3hCIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvcGFyc2VDYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0Fzc2lnblNpbmdsZSwgQ2FzZURvLCBDYXNlRG9QYXJ0LCBDYXNlVmFsLCBDYXNlVmFsUGFydCwgUGF0dGVybn0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwcywgaXNHcm91cCwgaXNLZXl3b3JkLCBLZXl3b3Jkc30gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge29wSWZ9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2NoZWNrRW1wdHl9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtwYXJzZUV4cHJ9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IHtiZWZvcmVBbmRCbG9jaywgcGFyc2VCbG9ja0RvLCBwYXJzZUJsb2NrVmFsLCBwYXJzZUp1c3RCbG9ja0RvLCBwYXJzZUp1c3RCbG9ja1ZhbFxuXHR9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZUxvY2FsRGVjbGFyZXMgZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5pbXBvcnQgcGFyc2VTcGFjZWQgZnJvbSAnLi9wYXJzZVNwYWNlZCdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKiogUGFyc2UgYSB7QGxpbmsgQ2FzZURvfSBvciB7QGxpbmsgQ2FzZVZhbH0uICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUNhc2UoaXNWYWwsIGNhc2VkRnJvbUZ1biwgdG9rZW5zKSB7XG5cdGNvbnN0XG5cdFx0cGFyc2VKdXN0QmxvY2sgPSBpc1ZhbCA/IHBhcnNlSnVzdEJsb2NrVmFsIDogcGFyc2VKdXN0QmxvY2tEbyxcblx0XHRDYXNlID0gaXNWYWwgPyBDYXNlVmFsIDogQ2FzZURvXG5cblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXG5cdGxldCBvcENhc2VkXG5cdGlmIChjYXNlZEZyb21GdW4pIHtcblx0XHRjaGVja0VtcHR5KGJlZm9yZSwgJ0NhblxcJ3QgbWFrZSBmb2N1cyDigJQgaXMgaW1wbGljaXRseSBwcm92aWRlZCBhcyBmaXJzdCBhcmd1bWVudC4nKVxuXHRcdG9wQ2FzZWQgPSBudWxsXG5cdH0gZWxzZVxuXHRcdG9wQ2FzZWQgPSBvcElmKCFiZWZvcmUuaXNFbXB0eSgpLCAoKSA9PiBBc3NpZ25TaW5nbGUuZm9jdXMoYmVmb3JlLmxvYywgcGFyc2VFeHByKGJlZm9yZSkpKVxuXG5cdGNvbnN0IGxhc3RMaW5lID0gU2xpY2UuZ3JvdXAoYmxvY2subGFzdCgpKVxuXHRjb25zdCBbcGFydExpbmVzLCBvcEVsc2VdID0gaXNLZXl3b3JkKEtleXdvcmRzLkVsc2UsIGxhc3RMaW5lLmhlYWQoKSkgP1xuXHRcdFtibG9jay5ydGFpbCgpLCBwYXJzZUp1c3RCbG9jayhLZXl3b3Jkcy5FbHNlLCBsYXN0TGluZS50YWlsKCkpXSA6XG5cdFx0W2Jsb2NrLCBudWxsXVxuXG5cdGNvbnN0IHBhcnRzID0gcGFydExpbmVzLm1hcFNsaWNlcyhsaW5lID0+IHBhcnNlQ2FzZUxpbmUoaXNWYWwsIGxpbmUpKVxuXHRjaGVjayhwYXJ0cy5sZW5ndGggPiAwLCB0b2tlbnMubG9jLCAoKSA9PlxuXHRcdGBNdXN0IGhhdmUgYXQgbGVhc3QgMSBub24tJHtjb2RlKCdlbHNlJyl9IHRlc3QuYClcblxuXHRyZXR1cm4gbmV3IENhc2UodG9rZW5zLmxvYywgb3BDYXNlZCwgcGFydHMsIG9wRWxzZSlcbn1cblxuZnVuY3Rpb24gcGFyc2VDYXNlTGluZShpc1ZhbCwgbGluZSkge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayhsaW5lKVxuXHRjb25zdCB0ZXN0ID0gcGFyc2VDYXNlVGVzdChiZWZvcmUpXG5cdGNvbnN0IHJlc3VsdCA9IChpc1ZhbCA/IHBhcnNlQmxvY2tWYWwgOiBwYXJzZUJsb2NrRG8pKGJsb2NrKVxuXHRyZXR1cm4gbmV3IChpc1ZhbCA/IENhc2VWYWxQYXJ0IDogQ2FzZURvUGFydCkobGluZS5sb2MsIHRlc3QsIHJlc3VsdClcbn1cblxuZnVuY3Rpb24gcGFyc2VDYXNlVGVzdCh0b2tlbnMpIHtcblx0Y29uc3QgZmlyc3QgPSB0b2tlbnMuaGVhZCgpXG5cdC8vIFBhdHRlcm4gbWF0Y2ggc3RhcnRzIHdpdGggdHlwZSB0ZXN0IGFuZCBpcyBmb2xsb3dlZCBieSBsb2NhbCBkZWNsYXJlcy5cblx0Ly8gRS5nLiwgYDpTb21lIHZhbGBcblx0aWYgKGlzR3JvdXAoR3JvdXBzLlNwYWNlLCBmaXJzdCkgJiYgdG9rZW5zLnNpemUoKSA+IDEpIHtcblx0XHRjb25zdCBmdCA9IFNsaWNlLmdyb3VwKGZpcnN0KVxuXHRcdGlmIChpc0tleXdvcmQoS2V5d29yZHMuVHlwZSwgZnQuaGVhZCgpKSkge1xuXHRcdFx0Y29uc3QgdHlwZSA9IHBhcnNlU3BhY2VkKGZ0LnRhaWwoKSlcblx0XHRcdGNvbnN0IGxvY2FscyA9IHBhcnNlTG9jYWxEZWNsYXJlcyh0b2tlbnMudGFpbCgpKVxuXHRcdFx0cmV0dXJuIG5ldyBQYXR0ZXJuKHRva2Vucy5sb2MsIHR5cGUsIGxvY2Fscylcblx0XHR9XG5cdH1cblx0cmV0dXJuIHBhcnNlRXhwcih0b2tlbnMpXG59XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

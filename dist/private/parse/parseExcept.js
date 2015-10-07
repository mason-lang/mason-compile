if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../../CompileError', '../MsAst', '../util', '../Token', './context', './parseBlock', './parseLocalDeclares'], function (exports, module, _CompileError, _MsAst, _util, _Token, _context, _parseBlock, _parseLocalDeclares) {
	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseLocalDeclares2 = _interopRequireDefault(_parseLocalDeclares);

	module.exports = (kwExcept, tokens) => {
		const isVal = kwExcept === _Token.KW_ExceptVal,
		      justDoValBlock = isVal ? _parseBlock.justBlockVal : _parseBlock.justBlockDo,
		      parseBlock = isVal ? _parseBlock.parseBlockVal : _parseBlock.parseBlockDo,
		      Except = isVal ? _MsAst.ExceptVal : _MsAst.ExceptDo,
		      kwTry = isVal ? _Token.KW_TryVal : _Token.KW_TryDo,
		      kwCatch = isVal ? _Token.KW_CatchVal : _Token.KW_CatchDo,
		      nameTry = () => (0, _CompileError.code)((0, _Token.keywordName)(kwTry)),
		      nameCatch = () => (0, _CompileError.code)((0, _Token.keywordName)(kwCatch)),
		      nameFinally = () => (0, _CompileError.code)((0, _Token.keywordName)(_Token.KW_Finally));

		const lines = (0, _parseBlock.justBlock)(kwExcept, tokens);

		// `try` *must* come first.
		const firstLine = lines.headSlice();
		const tokenTry = firstLine.head();
		_context.context.check((0, _Token.isKeyword)(kwTry, tokenTry), tokenTry.loc, () => `Must start with ${ nameTry() }`);
		const _try = justDoValBlock(kwTry, firstLine.tail());

		const restLines = lines.tail();
		(0, _context.checkNonEmpty)(restLines, () => `Must have at least one of ${ nameCatch() } or ${ nameFinally() }`);

		const handleFinally = restLines => {
			const line = restLines.headSlice();
			const tokenFinally = line.head();
			_context.context.check((0, _Token.isKeyword)(_Token.KW_Finally, tokenFinally), tokenFinally.loc, () => `Expected ${ nameFinally() }`);
			_context.context.check(restLines.size() === 1, restLines.loc, () => `Nothing is allowed to come after ${ nameFinally() }.`);
			return (0, _parseBlock.justBlockDo)(_Token.KW_Finally, line.tail());
		};

		let _catch, _finally;

		const line2 = restLines.headSlice();
		const head2 = line2.head();
		if ((0, _Token.isKeyword)(kwCatch, head2)) {
			var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(line2.tail());

			var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

			const before2 = _beforeAndBlock2[0];
			const block2 = _beforeAndBlock2[1];

			const caught = parseOneLocalDeclareOrFocus(before2);
			_catch = new _MsAst.Catch(line2.loc, caught, parseBlock(block2));
			_finally = (0, _util.opIf)(restLines.size() > 1, () => handleFinally(restLines.tail()));
		} else {
			_catch = null;
			_finally = handleFinally(restLines);
		}

		return new Except(tokens.loc, _try, _catch, _finally);
	};

	const parseOneLocalDeclareOrFocus = tokens => {
		if (tokens.isEmpty()) return new _MsAst.LocalDeclareFocus(tokens.loc);else {
			_context.context.check(tokens.size() === 1, 'Expected only one local declare.');
			return (0, _parseLocalDeclares2.default)(tokens)[0];
		}
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlRXhjZXB0LmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZUV4Y2VwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O2tCQ1VlLENBQUMsUUFBUSxFQUFFLE1BQU0sS0FBSztBQUNwQyxRQUNDLEtBQUssR0FBRyxRQUFRLFlBVHVDLFlBQVksQUFTbEM7UUFDakMsY0FBYyxHQUFHLEtBQUssZUFQcUQsWUFBWSxlQUF6QixXQUFXLEFBT3RCO1FBQ25ELFVBQVUsR0FBRyxLQUFLLGVBUkksYUFBYSxlQUFFLFlBQVksQUFRQTtRQUNqRCxNQUFNLEdBQUcsS0FBSyxVQWRTLFNBQVMsVUFBbkIsUUFBUSxBQWNnQjtRQUNyQyxLQUFLLEdBQUcsS0FBSyxVQVpkLFNBQVMsVUFEeUUsUUFBUSxBQWFyRDtRQUNwQyxPQUFPLEdBQUcsS0FBSyxVQWQyQixXQUFXLFVBQXZCLFVBQVUsQUFjRTtRQUMxQyxPQUFPLEdBQUcsTUFBTSxrQkFsQlYsSUFBSSxFQWtCVyxXQWZKLFdBQVcsRUFlSyxLQUFLLENBQUMsQ0FBQztRQUN4QyxTQUFTLEdBQUcsTUFBTSxrQkFuQlosSUFBSSxFQW1CYSxXQWhCTixXQUFXLEVBZ0JPLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLFdBQVcsR0FBRyxNQUFNLGtCQXBCZCxJQUFJLEVBb0JlLFdBakJSLFdBQVcsU0FBeUMsVUFBVSxDQWlCL0IsQ0FBQyxDQUFBOztBQUVsRCxRQUFNLEtBQUssR0FBRyxnQkFoQnNDLFNBQVMsRUFnQnJDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQTs7O0FBR3pDLFFBQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUNuQyxRQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDakMsV0F0QnNCLE9BQU8sQ0FzQnJCLEtBQUssQ0FBQyxXQXhCUCxTQUFTLEVBd0JRLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLE1B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dWxsLCJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Q2F0Y2gsIEV4Y2VwdERvLCBFeGNlcHRWYWwsIExvY2FsRGVjbGFyZUZvY3VzfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7b3BJZn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7aXNLZXl3b3JkLCBrZXl3b3JkTmFtZSwgS1dfQ2F0Y2hEbywgS1dfQ2F0Y2hWYWwsIEtXX0V4Y2VwdFZhbCwgS1dfRmluYWxseSwgS1dfVHJ5RG8sXG5cdEtXX1RyeVZhbH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2NoZWNrTm9uRW1wdHksIGNvbnRleHR9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB7YmVmb3JlQW5kQmxvY2ssIHBhcnNlQmxvY2tWYWwsIHBhcnNlQmxvY2tEbywganVzdEJsb2NrLCBqdXN0QmxvY2tEbywganVzdEJsb2NrVmFsXG5cdH0gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlTG9jYWxEZWNsYXJlcyBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcblxuZXhwb3J0IGRlZmF1bHQgKGt3RXhjZXB0LCB0b2tlbnMpID0+IHtcblx0Y29uc3Rcblx0XHRpc1ZhbCA9IGt3RXhjZXB0ID09PSBLV19FeGNlcHRWYWwsXG5cdFx0anVzdERvVmFsQmxvY2sgPSBpc1ZhbCA/IGp1c3RCbG9ja1ZhbCA6IGp1c3RCbG9ja0RvLFxuXHRcdHBhcnNlQmxvY2sgPSBpc1ZhbCA/IHBhcnNlQmxvY2tWYWwgOiBwYXJzZUJsb2NrRG8sXG5cdFx0RXhjZXB0ID0gaXNWYWwgPyBFeGNlcHRWYWwgOiBFeGNlcHREbyxcblx0XHRrd1RyeSA9IGlzVmFsID8gS1dfVHJ5VmFsIDogS1dfVHJ5RG8sXG5cdFx0a3dDYXRjaCA9IGlzVmFsID8gS1dfQ2F0Y2hWYWwgOiBLV19DYXRjaERvLFxuXHRcdG5hbWVUcnkgPSAoKSA9PiBjb2RlKGtleXdvcmROYW1lKGt3VHJ5KSksXG5cdFx0bmFtZUNhdGNoID0gKCkgPT4gY29kZShrZXl3b3JkTmFtZShrd0NhdGNoKSksXG5cdFx0bmFtZUZpbmFsbHkgPSAoKSA9PiBjb2RlKGtleXdvcmROYW1lKEtXX0ZpbmFsbHkpKVxuXG5cdGNvbnN0IGxpbmVzID0ganVzdEJsb2NrKGt3RXhjZXB0LCB0b2tlbnMpXG5cblx0Ly8gYHRyeWAgKm11c3QqIGNvbWUgZmlyc3QuXG5cdGNvbnN0IGZpcnN0TGluZSA9IGxpbmVzLmhlYWRTbGljZSgpXG5cdGNvbnN0IHRva2VuVHJ5ID0gZmlyc3RMaW5lLmhlYWQoKVxuXHRjb250ZXh0LmNoZWNrKGlzS2V5d29yZChrd1RyeSwgdG9rZW5UcnkpLCB0b2tlblRyeS5sb2MsICgpID0+XG5cdFx0YE11c3Qgc3RhcnQgd2l0aCAke25hbWVUcnkoKX1gKVxuXHRjb25zdCBfdHJ5ID0ganVzdERvVmFsQmxvY2soa3dUcnksIGZpcnN0TGluZS50YWlsKCkpXG5cblx0Y29uc3QgcmVzdExpbmVzID0gbGluZXMudGFpbCgpXG5cdGNoZWNrTm9uRW1wdHkocmVzdExpbmVzLCAoKSA9PlxuXHRcdGBNdXN0IGhhdmUgYXQgbGVhc3Qgb25lIG9mICR7bmFtZUNhdGNoKCl9IG9yICR7bmFtZUZpbmFsbHkoKX1gKVxuXG5cdGNvbnN0IGhhbmRsZUZpbmFsbHkgPSByZXN0TGluZXMgPT4ge1xuXHRcdGNvbnN0IGxpbmUgPSByZXN0TGluZXMuaGVhZFNsaWNlKClcblx0XHRjb25zdCB0b2tlbkZpbmFsbHkgPSBsaW5lLmhlYWQoKVxuXHRcdGNvbnRleHQuY2hlY2soaXNLZXl3b3JkKEtXX0ZpbmFsbHksIHRva2VuRmluYWxseSksIHRva2VuRmluYWxseS5sb2MsICgpID0+XG5cdFx0XHRgRXhwZWN0ZWQgJHtuYW1lRmluYWxseSgpfWApXG5cdFx0Y29udGV4dC5jaGVjayhyZXN0TGluZXMuc2l6ZSgpID09PSAxLCByZXN0TGluZXMubG9jLCAoKSA9PlxuXHRcdFx0YE5vdGhpbmcgaXMgYWxsb3dlZCB0byBjb21lIGFmdGVyICR7bmFtZUZpbmFsbHkoKX0uYClcblx0XHRyZXR1cm4ganVzdEJsb2NrRG8oS1dfRmluYWxseSwgbGluZS50YWlsKCkpXG5cdH1cblxuXHRsZXQgX2NhdGNoLCBfZmluYWxseVxuXG5cdGNvbnN0IGxpbmUyID0gcmVzdExpbmVzLmhlYWRTbGljZSgpXG5cdGNvbnN0IGhlYWQyID0gbGluZTIuaGVhZCgpXG5cdGlmIChpc0tleXdvcmQoa3dDYXRjaCwgaGVhZDIpKSB7XG5cdFx0Y29uc3QgW2JlZm9yZTIsIGJsb2NrMl0gPSBiZWZvcmVBbmRCbG9jayhsaW5lMi50YWlsKCkpXG5cdFx0Y29uc3QgY2F1Z2h0ID0gcGFyc2VPbmVMb2NhbERlY2xhcmVPckZvY3VzKGJlZm9yZTIpXG5cdFx0X2NhdGNoID0gbmV3IENhdGNoKGxpbmUyLmxvYywgY2F1Z2h0LCBwYXJzZUJsb2NrKGJsb2NrMikpXG5cdFx0X2ZpbmFsbHkgPSBvcElmKHJlc3RMaW5lcy5zaXplKCkgPiAxLCAoKSA9PiBoYW5kbGVGaW5hbGx5KHJlc3RMaW5lcy50YWlsKCkpKVxuXHR9IGVsc2Uge1xuXHRcdF9jYXRjaCA9IG51bGxcblx0XHRfZmluYWxseSA9IGhhbmRsZUZpbmFsbHkocmVzdExpbmVzKVxuXHR9XG5cblx0cmV0dXJuIG5ldyBFeGNlcHQodG9rZW5zLmxvYywgX3RyeSwgX2NhdGNoLCBfZmluYWxseSlcbn1cblxuY29uc3QgcGFyc2VPbmVMb2NhbERlY2xhcmVPckZvY3VzID0gdG9rZW5zID0+IHtcblx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIG5ldyBMb2NhbERlY2xhcmVGb2N1cyh0b2tlbnMubG9jKVxuXHRlbHNlIHtcblx0XHRjb250ZXh0LmNoZWNrKHRva2Vucy5zaXplKCkgPT09IDEsICdFeHBlY3RlZCBvbmx5IG9uZSBsb2NhbCBkZWNsYXJlLicpXG5cdFx0cmV0dXJuIHBhcnNlTG9jYWxEZWNsYXJlcyh0b2tlbnMpWzBdXG5cdH1cbn0iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

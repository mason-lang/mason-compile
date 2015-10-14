if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../../CompileError', '../context', '../MsAst', '../util', '../Token', './checks', './parseBlock', './parseLocalDeclares'], function (exports, module, _CompileError, _context, _MsAst, _util, _Token, _checks, _parseBlock, _parseLocalDeclares) {
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
		(0, _context.check)((0, _Token.isKeyword)(kwTry, tokenTry), tokenTry.loc, () => `Must start with ${ nameTry() }`);
		const _try = justDoValBlock(kwTry, firstLine.tail());

		const restLines = lines.tail();
		(0, _checks.checkNonEmpty)(restLines, () => `Must have at least one of ${ nameCatch() } or ${ nameFinally() }`);

		const handleFinally = restLines => {
			const line = restLines.headSlice();
			const tokenFinally = line.head();
			(0, _context.check)((0, _Token.isKeyword)(_Token.KW_Finally, tokenFinally), tokenFinally.loc, () => `Expected ${ nameFinally() }`);
			(0, _context.check)(restLines.size() === 1, restLines.loc, () => `Nothing is allowed to come after ${ nameFinally() }.`);
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
			(0, _context.check)(tokens.size() === 1, 'Expected only one local declare.');
			return (0, _parseLocalDeclares2.default)(tokens)[0];
		}
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlRXhjZXB0LmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZUV4Y2VwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O2tCQ1dlLENBQUMsUUFBUSxFQUFFLE1BQU0sS0FBSztBQUNwQyxRQUNDLEtBQUssR0FBRyxRQUFRLFlBVHVDLFlBQVksQUFTbEM7UUFDakMsY0FBYyxHQUFHLEtBQUssZUFQcUQsWUFBWSxlQUF6QixXQUFXLEFBT3RCO1FBQ25ELFVBQVUsR0FBRyxLQUFLLGVBUkksYUFBYSxlQUFFLFlBQVksQUFRQTtRQUNqRCxNQUFNLEdBQUcsS0FBSyxVQWRTLFNBQVMsVUFBbkIsUUFBUSxBQWNnQjtRQUNyQyxLQUFLLEdBQUcsS0FBSyxVQVpkLFNBQVMsVUFEeUUsUUFBUSxBQWFyRDtRQUNwQyxPQUFPLEdBQUcsS0FBSyxVQWQyQixXQUFXLFVBQXZCLFVBQVUsQUFjRTtRQUMxQyxPQUFPLEdBQUcsTUFBTSxrQkFuQlYsSUFBSSxFQW1CVyxXQWZKLFdBQVcsRUFlSyxLQUFLLENBQUMsQ0FBQztRQUN4QyxTQUFTLEdBQUcsTUFBTSxrQkFwQlosSUFBSSxFQW9CYSxXQWhCTixXQUFXLEVBZ0JPLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLFdBQVcsR0FBRyxNQUFNLGtCQXJCZCxJQUFJLEVBcUJlLFdBakJSLFdBQVcsU0FBeUMsVUFBVSxDQWlCL0IsQ0FBQyxDQUFBOztBQUVsRCxRQUFNLEtBQUssR0FBRyxnQkFoQnNDLFNBQVMsRUFnQnJDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQTs7O0FBR3pDLFFBQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUNuQyxRQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDakMsZUEzQk8sS0FBSyxFQTJCTixXQXhCQyxTQUFTLEVBd0JBLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLE1BQy9DLENBQUMsZ0JBQWdCLEdBQUUsT0FBTyxFQUFFLEVBQUMsQ0FBQyxDQUFDLENBQUE7QUFDaEMsUUFBTSxJQUFJLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTs7QUFFcEQsUUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFBO0FBQzlCLGNBM0JPLGFBQWEsRUEyQk4sU0FBUyxFQUFFLE1BQ3hCLENBQUMsMEJBQTBCLEdBQUUsU0FBUyxFQUFFLEVBQUMsSUFBSSxHQUFFLFdBQVcsRUFBRSxFQUFDLENBQUMsQ0FBQyxDQUFBOztBQUVoRSxRQUFNLGFBQWEsR0FBRyxTQUFTLElBQUk7QUFDbEMsU0FBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFBO0FBQ2xDLFNBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUNoQyxnQkF0Q00sS0FBSyxFQXNDTCxXQW5DQSxTQUFTLFNBQXNELFVBQVUsRUFtQ25ELFlBQVksQ0FBQyxFQUFFLFlBQVksQ0FBQyxHQUFHLEVBQUUsTUFDNUQsQ0FBQyxTQUFTLEdBQUUsV0FBVyxFQUFFLEVBQUMsQ0FBQyxDQUFDLENBQUE7QUFDN0IsZ0JBeENNLEtBQUssRUF3Q0wsU0FBUyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsR0FBRyxFQUFFLE1BQzVDLENBQUMsaUNBQWlDLEdBQUUsV0FBVyxFQUFFLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN0RCxVQUFPLGdCQXBDdUQsV0FBVyxTQUhKLFVBQVUsRUF1Q2hELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0dBQzNDLENBQUE7O0FBRUQsTUFBSSxNQUFNLEVBQUUsUUFBUSxDQUFBOztBQUVwQixRQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUE7QUFDbkMsUUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFBO0FBQzFCLE1BQUksV0E5Q0csU0FBUyxFQThDRixPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUU7eUJBQ0osZ0JBNUNwQixjQUFjLEVBNENxQixLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7Ozs7U0FBL0MsT0FBTztTQUFFLE1BQU07O0FBQ3RCLFNBQU0sTUFBTSxHQUFHLDJCQUEyQixDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ25ELFNBQU0sR0FBRyxXQW5ESCxLQUFLLENBbURRLEtBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO0FBQ3pELFdBQVEsR0FBRyxVQW5ETCxJQUFJLEVBbURNLFNBQVMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsTUFBTSxhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQTtHQUM1RSxNQUFNO0FBQ04sU0FBTSxHQUFHLElBQUksQ0FBQTtBQUNiLFdBQVEsR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUE7R0FDbkM7O0FBRUQsU0FBTyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7RUFDckQ7O0FBRUQsT0FBTSwyQkFBMkIsR0FBRyxNQUFNLElBQUk7QUFDN0MsTUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQ25CLE9BQU8sV0EvRDJCLGlCQUFpQixDQStEdEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBLEtBQ3BDO0FBQ0osZ0JBbEVNLEtBQUssRUFrRUwsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFBO0FBQzlELFVBQU8sa0NBQW1CLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQ3BDO0VBQ0QsQ0FBQSIsImZpbGUiOiJwcml2YXRlL3BhcnNlL3BhcnNlRXhjZXB0LmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0NhdGNoLCBFeGNlcHREbywgRXhjZXB0VmFsLCBMb2NhbERlY2xhcmVGb2N1c30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge29wSWZ9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2lzS2V5d29yZCwga2V5d29yZE5hbWUsIEtXX0NhdGNoRG8sIEtXX0NhdGNoVmFsLCBLV19FeGNlcHRWYWwsIEtXX0ZpbmFsbHksIEtXX1RyeURvLFxuXHRLV19UcnlWYWx9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtjaGVja05vbkVtcHR5fSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7YmVmb3JlQW5kQmxvY2ssIHBhcnNlQmxvY2tWYWwsIHBhcnNlQmxvY2tEbywganVzdEJsb2NrLCBqdXN0QmxvY2tEbywganVzdEJsb2NrVmFsXG5cdH0gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlTG9jYWxEZWNsYXJlcyBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcblxuZXhwb3J0IGRlZmF1bHQgKGt3RXhjZXB0LCB0b2tlbnMpID0+IHtcblx0Y29uc3Rcblx0XHRpc1ZhbCA9IGt3RXhjZXB0ID09PSBLV19FeGNlcHRWYWwsXG5cdFx0anVzdERvVmFsQmxvY2sgPSBpc1ZhbCA/IGp1c3RCbG9ja1ZhbCA6IGp1c3RCbG9ja0RvLFxuXHRcdHBhcnNlQmxvY2sgPSBpc1ZhbCA/IHBhcnNlQmxvY2tWYWwgOiBwYXJzZUJsb2NrRG8sXG5cdFx0RXhjZXB0ID0gaXNWYWwgPyBFeGNlcHRWYWwgOiBFeGNlcHREbyxcblx0XHRrd1RyeSA9IGlzVmFsID8gS1dfVHJ5VmFsIDogS1dfVHJ5RG8sXG5cdFx0a3dDYXRjaCA9IGlzVmFsID8gS1dfQ2F0Y2hWYWwgOiBLV19DYXRjaERvLFxuXHRcdG5hbWVUcnkgPSAoKSA9PiBjb2RlKGtleXdvcmROYW1lKGt3VHJ5KSksXG5cdFx0bmFtZUNhdGNoID0gKCkgPT4gY29kZShrZXl3b3JkTmFtZShrd0NhdGNoKSksXG5cdFx0bmFtZUZpbmFsbHkgPSAoKSA9PiBjb2RlKGtleXdvcmROYW1lKEtXX0ZpbmFsbHkpKVxuXG5cdGNvbnN0IGxpbmVzID0ganVzdEJsb2NrKGt3RXhjZXB0LCB0b2tlbnMpXG5cblx0Ly8gYHRyeWAgKm11c3QqIGNvbWUgZmlyc3QuXG5cdGNvbnN0IGZpcnN0TGluZSA9IGxpbmVzLmhlYWRTbGljZSgpXG5cdGNvbnN0IHRva2VuVHJ5ID0gZmlyc3RMaW5lLmhlYWQoKVxuXHRjaGVjayhpc0tleXdvcmQoa3dUcnksIHRva2VuVHJ5KSwgdG9rZW5UcnkubG9jLCAoKSA9PlxuXHRcdGBNdXN0IHN0YXJ0IHdpdGggJHtuYW1lVHJ5KCl9YClcblx0Y29uc3QgX3RyeSA9IGp1c3REb1ZhbEJsb2NrKGt3VHJ5LCBmaXJzdExpbmUudGFpbCgpKVxuXG5cdGNvbnN0IHJlc3RMaW5lcyA9IGxpbmVzLnRhaWwoKVxuXHRjaGVja05vbkVtcHR5KHJlc3RMaW5lcywgKCkgPT5cblx0XHRgTXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBvZiAke25hbWVDYXRjaCgpfSBvciAke25hbWVGaW5hbGx5KCl9YClcblxuXHRjb25zdCBoYW5kbGVGaW5hbGx5ID0gcmVzdExpbmVzID0+IHtcblx0XHRjb25zdCBsaW5lID0gcmVzdExpbmVzLmhlYWRTbGljZSgpXG5cdFx0Y29uc3QgdG9rZW5GaW5hbGx5ID0gbGluZS5oZWFkKClcblx0XHRjaGVjayhpc0tleXdvcmQoS1dfRmluYWxseSwgdG9rZW5GaW5hbGx5KSwgdG9rZW5GaW5hbGx5LmxvYywgKCkgPT5cblx0XHRcdGBFeHBlY3RlZCAke25hbWVGaW5hbGx5KCl9YClcblx0XHRjaGVjayhyZXN0TGluZXMuc2l6ZSgpID09PSAxLCByZXN0TGluZXMubG9jLCAoKSA9PlxuXHRcdFx0YE5vdGhpbmcgaXMgYWxsb3dlZCB0byBjb21lIGFmdGVyICR7bmFtZUZpbmFsbHkoKX0uYClcblx0XHRyZXR1cm4ganVzdEJsb2NrRG8oS1dfRmluYWxseSwgbGluZS50YWlsKCkpXG5cdH1cblxuXHRsZXQgX2NhdGNoLCBfZmluYWxseVxuXG5cdGNvbnN0IGxpbmUyID0gcmVzdExpbmVzLmhlYWRTbGljZSgpXG5cdGNvbnN0IGhlYWQyID0gbGluZTIuaGVhZCgpXG5cdGlmIChpc0tleXdvcmQoa3dDYXRjaCwgaGVhZDIpKSB7XG5cdFx0Y29uc3QgW2JlZm9yZTIsIGJsb2NrMl0gPSBiZWZvcmVBbmRCbG9jayhsaW5lMi50YWlsKCkpXG5cdFx0Y29uc3QgY2F1Z2h0ID0gcGFyc2VPbmVMb2NhbERlY2xhcmVPckZvY3VzKGJlZm9yZTIpXG5cdFx0X2NhdGNoID0gbmV3IENhdGNoKGxpbmUyLmxvYywgY2F1Z2h0LCBwYXJzZUJsb2NrKGJsb2NrMikpXG5cdFx0X2ZpbmFsbHkgPSBvcElmKHJlc3RMaW5lcy5zaXplKCkgPiAxLCAoKSA9PiBoYW5kbGVGaW5hbGx5KHJlc3RMaW5lcy50YWlsKCkpKVxuXHR9IGVsc2Uge1xuXHRcdF9jYXRjaCA9IG51bGxcblx0XHRfZmluYWxseSA9IGhhbmRsZUZpbmFsbHkocmVzdExpbmVzKVxuXHR9XG5cblx0cmV0dXJuIG5ldyBFeGNlcHQodG9rZW5zLmxvYywgX3RyeSwgX2NhdGNoLCBfZmluYWxseSlcbn1cblxuY29uc3QgcGFyc2VPbmVMb2NhbERlY2xhcmVPckZvY3VzID0gdG9rZW5zID0+IHtcblx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIG5ldyBMb2NhbERlY2xhcmVGb2N1cyh0b2tlbnMubG9jKVxuXHRlbHNlIHtcblx0XHRjaGVjayh0b2tlbnMuc2l6ZSgpID09PSAxLCAnRXhwZWN0ZWQgb25seSBvbmUgbG9jYWwgZGVjbGFyZS4nKVxuXHRcdHJldHVybiBwYXJzZUxvY2FsRGVjbGFyZXModG9rZW5zKVswXVxuXHR9XG59Il0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

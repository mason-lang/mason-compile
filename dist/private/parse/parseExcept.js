(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', '../../CompileError', '../context', '../MsAst', '../util', '../Token', './checks', './parseBlock', './parseLocalDeclares'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('../../CompileError'), require('../context'), require('../MsAst'), require('../util'), require('../Token'), require('./checks'), require('./parseBlock'), require('./parseLocalDeclares'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.CompileError, global.context, global.MsAst, global.util, global.Token, global.checks, global.parseBlock, global.parseLocalDeclares);
		global.parseExcept = mod.exports;
	}
})(this, function (exports, module, _CompileError, _context, _MsAst, _util, _Token, _checks, _parseBlock, _parseLocalDeclares) {
	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	module.exports = parseExcept;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseLocalDeclares2 = _interopRequireDefault(_parseLocalDeclares);

	/** Parse an {@link ExceptDo} or {@link ExceptVal}. */

	function parseExcept(kwExcept, tokens) {
		const isVal = kwExcept === _Token.Keywords.ExceptVal,
		      justDoValBlock = isVal ? _parseBlock.parseJustBlockVal : _parseBlock.parseJustBlockDo,
		      parseBlock = isVal ? _parseBlock.parseBlockVal : _parseBlock.parseBlockDo,
		      Except = isVal ? _MsAst.ExceptVal : _MsAst.ExceptDo,
		      kwTry = isVal ? _Token.Keywords.TryVal : _Token.Keywords.TryDo,
		      kwCatch = isVal ? _Token.Keywords.CatchVal : _Token.Keywords.CatchDo,
		      nameTry = () => (0, _CompileError.code)((0, _Token.keywordName)(kwTry)),
		      nameCatch = () => (0, _CompileError.code)((0, _Token.keywordName)(kwCatch)),
		      nameFinally = () => (0, _CompileError.code)((0, _Token.keywordName)(_Token.Keywords.Finally));

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
			(0, _context.check)((0, _Token.isKeyword)(_Token.Keywords.Finally, tokenFinally), tokenFinally.loc, () => `Expected ${ nameFinally() }`);
			(0, _context.check)(restLines.size() === 1, restLines.loc, () => `Nothing is allowed to come after ${ nameFinally() }.`);
			return (0, _parseBlock.parseJustBlockDo)(_Token.Keywords.Finally, line.tail());
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
	}

	function parseOneLocalDeclareOrFocus(tokens) {
		if (tokens.isEmpty()) return _MsAst.LocalDeclare.focus(tokens.loc);else {
			(0, _context.check)(tokens.size() === 1, 'Expected only one local declare.');
			return (0, _parseLocalDeclares2.default)(tokens)[0];
		}
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRXhjZXB0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQVd3QixXQUFXOzs7Ozs7OztBQUFwQixVQUFTLFdBQVcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFO0FBQ3JELFFBQ0MsS0FBSyxHQUFHLFFBQVEsS0FBSyxPQVRTLFFBQVEsQ0FTUixTQUFTO1FBQ3ZDLGNBQWMsR0FBRyxLQUFLLGVBUjBELGlCQUFpQixlQUFuQyxnQkFBZ0IsQUFRakI7UUFDN0QsVUFBVSxHQUFHLEtBQUssZUFUSSxhQUFhLGVBQUUsWUFBWSxBQVNBO1FBQ2pELE1BQU0sR0FBRyxLQUFLLFVBZFMsU0FBUyxVQUFuQixRQUFRLEFBY2dCO1FBQ3JDLEtBQUssR0FBRyxLQUFLLEdBQUcsT0FiYyxRQUFRLENBYWIsTUFBTSxHQUFHLE9BYkosUUFBUSxDQWFLLEtBQUs7UUFDaEQsT0FBTyxHQUFHLEtBQUssR0FBRyxPQWRZLFFBQVEsQ0FjWCxRQUFRLEdBQUcsT0FkUixRQUFRLENBY1MsT0FBTztRQUN0RCxPQUFPLEdBQUcsTUFBTSxrQkFuQlYsSUFBSSxFQW1CVyxXQWZKLFdBQVcsRUFlSyxLQUFLLENBQUMsQ0FBQztRQUN4QyxTQUFTLEdBQUcsTUFBTSxrQkFwQlosSUFBSSxFQW9CYSxXQWhCTixXQUFXLEVBZ0JPLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLFdBQVcsR0FBRyxNQUFNLGtCQXJCZCxJQUFJLEVBcUJlLFdBakJSLFdBQVcsRUFpQlMsT0FqQlAsUUFBUSxDQWlCUSxPQUFPLENBQUMsQ0FBQyxDQUFBOztBQUV4RCxRQUFNLEtBQUssR0FBRyxnQkFqQnNDLFNBQVMsRUFpQnJDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQTs7O0FBR3pDLFFBQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUNuQyxRQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLENB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Q0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQ3BDO0VBQ0QiLCJmaWxlIjoicGFyc2VFeGNlcHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0NhdGNoLCBFeGNlcHREbywgRXhjZXB0VmFsLCBMb2NhbERlY2xhcmV9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtvcElmfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtpc0tleXdvcmQsIGtleXdvcmROYW1lLCBLZXl3b3Jkc30gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2NoZWNrTm9uRW1wdHl9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtiZWZvcmVBbmRCbG9jaywgcGFyc2VCbG9ja1ZhbCwgcGFyc2VCbG9ja0RvLCBqdXN0QmxvY2ssIHBhcnNlSnVzdEJsb2NrRG8sIHBhcnNlSnVzdEJsb2NrVmFsXG5cdH0gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlTG9jYWxEZWNsYXJlcyBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcblxuLyoqIFBhcnNlIGFuIHtAbGluayBFeGNlcHREb30gb3Ige0BsaW5rIEV4Y2VwdFZhbH0uICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUV4Y2VwdChrd0V4Y2VwdCwgdG9rZW5zKSB7XG5cdGNvbnN0XG5cdFx0aXNWYWwgPSBrd0V4Y2VwdCA9PT0gS2V5d29yZHMuRXhjZXB0VmFsLFxuXHRcdGp1c3REb1ZhbEJsb2NrID0gaXNWYWwgPyBwYXJzZUp1c3RCbG9ja1ZhbCA6IHBhcnNlSnVzdEJsb2NrRG8sXG5cdFx0cGFyc2VCbG9jayA9IGlzVmFsID8gcGFyc2VCbG9ja1ZhbCA6IHBhcnNlQmxvY2tEbyxcblx0XHRFeGNlcHQgPSBpc1ZhbCA/IEV4Y2VwdFZhbCA6IEV4Y2VwdERvLFxuXHRcdGt3VHJ5ID0gaXNWYWwgPyBLZXl3b3Jkcy5UcnlWYWwgOiBLZXl3b3Jkcy5UcnlEbyxcblx0XHRrd0NhdGNoID0gaXNWYWwgPyBLZXl3b3Jkcy5DYXRjaFZhbCA6IEtleXdvcmRzLkNhdGNoRG8sXG5cdFx0bmFtZVRyeSA9ICgpID0+IGNvZGUoa2V5d29yZE5hbWUoa3dUcnkpKSxcblx0XHRuYW1lQ2F0Y2ggPSAoKSA9PiBjb2RlKGtleXdvcmROYW1lKGt3Q2F0Y2gpKSxcblx0XHRuYW1lRmluYWxseSA9ICgpID0+IGNvZGUoa2V5d29yZE5hbWUoS2V5d29yZHMuRmluYWxseSkpXG5cblx0Y29uc3QgbGluZXMgPSBqdXN0QmxvY2soa3dFeGNlcHQsIHRva2VucylcblxuXHQvLyBgdHJ5YCAqbXVzdCogY29tZSBmaXJzdC5cblx0Y29uc3QgZmlyc3RMaW5lID0gbGluZXMuaGVhZFNsaWNlKClcblx0Y29uc3QgdG9rZW5UcnkgPSBmaXJzdExpbmUuaGVhZCgpXG5cdGNoZWNrKGlzS2V5d29yZChrd1RyeSwgdG9rZW5UcnkpLCB0b2tlblRyeS5sb2MsICgpID0+XG5cdFx0YE11c3Qgc3RhcnQgd2l0aCAke25hbWVUcnkoKX1gKVxuXHRjb25zdCBfdHJ5ID0ganVzdERvVmFsQmxvY2soa3dUcnksIGZpcnN0TGluZS50YWlsKCkpXG5cblx0Y29uc3QgcmVzdExpbmVzID0gbGluZXMudGFpbCgpXG5cdGNoZWNrTm9uRW1wdHkocmVzdExpbmVzLCAoKSA9PlxuXHRcdGBNdXN0IGhhdmUgYXQgbGVhc3Qgb25lIG9mICR7bmFtZUNhdGNoKCl9IG9yICR7bmFtZUZpbmFsbHkoKX1gKVxuXG5cdGNvbnN0IGhhbmRsZUZpbmFsbHkgPSByZXN0TGluZXMgPT4ge1xuXHRcdGNvbnN0IGxpbmUgPSByZXN0TGluZXMuaGVhZFNsaWNlKClcblx0XHRjb25zdCB0b2tlbkZpbmFsbHkgPSBsaW5lLmhlYWQoKVxuXHRcdGNoZWNrKGlzS2V5d29yZChLZXl3b3Jkcy5GaW5hbGx5LCB0b2tlbkZpbmFsbHkpLCB0b2tlbkZpbmFsbHkubG9jLCAoKSA9PlxuXHRcdFx0YEV4cGVjdGVkICR7bmFtZUZpbmFsbHkoKX1gKVxuXHRcdGNoZWNrKHJlc3RMaW5lcy5zaXplKCkgPT09IDEsIHJlc3RMaW5lcy5sb2MsICgpID0+XG5cdFx0XHRgTm90aGluZyBpcyBhbGxvd2VkIHRvIGNvbWUgYWZ0ZXIgJHtuYW1lRmluYWxseSgpfS5gKVxuXHRcdHJldHVybiBwYXJzZUp1c3RCbG9ja0RvKEtleXdvcmRzLkZpbmFsbHksIGxpbmUudGFpbCgpKVxuXHR9XG5cblx0bGV0IF9jYXRjaCwgX2ZpbmFsbHlcblxuXHRjb25zdCBsaW5lMiA9IHJlc3RMaW5lcy5oZWFkU2xpY2UoKVxuXHRjb25zdCBoZWFkMiA9IGxpbmUyLmhlYWQoKVxuXHRpZiAoaXNLZXl3b3JkKGt3Q2F0Y2gsIGhlYWQyKSkge1xuXHRcdGNvbnN0IFtiZWZvcmUyLCBibG9jazJdID0gYmVmb3JlQW5kQmxvY2sobGluZTIudGFpbCgpKVxuXHRcdGNvbnN0IGNhdWdodCA9IHBhcnNlT25lTG9jYWxEZWNsYXJlT3JGb2N1cyhiZWZvcmUyKVxuXHRcdF9jYXRjaCA9IG5ldyBDYXRjaChsaW5lMi5sb2MsIGNhdWdodCwgcGFyc2VCbG9jayhibG9jazIpKVxuXHRcdF9maW5hbGx5ID0gb3BJZihyZXN0TGluZXMuc2l6ZSgpID4gMSwgKCkgPT4gaGFuZGxlRmluYWxseShyZXN0TGluZXMudGFpbCgpKSlcblx0fSBlbHNlIHtcblx0XHRfY2F0Y2ggPSBudWxsXG5cdFx0X2ZpbmFsbHkgPSBoYW5kbGVGaW5hbGx5KHJlc3RMaW5lcylcblx0fVxuXG5cdHJldHVybiBuZXcgRXhjZXB0KHRva2Vucy5sb2MsIF90cnksIF9jYXRjaCwgX2ZpbmFsbHkpXG59XG5cbmZ1bmN0aW9uIHBhcnNlT25lTG9jYWxEZWNsYXJlT3JGb2N1cyh0b2tlbnMpIHtcblx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIExvY2FsRGVjbGFyZS5mb2N1cyh0b2tlbnMubG9jKVxuXHRlbHNlIHtcblx0XHRjaGVjayh0b2tlbnMuc2l6ZSgpID09PSAxLCAnRXhwZWN0ZWQgb25seSBvbmUgbG9jYWwgZGVjbGFyZS4nKVxuXHRcdHJldHVybiBwYXJzZUxvY2FsRGVjbGFyZXModG9rZW5zKVswXVxuXHR9XG59XG4iXX0=
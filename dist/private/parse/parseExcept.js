'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../util', '../Token', './checks', './parseBlock', './parseLocalDeclares'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../util'), require('../Token'), require('./checks'), require('./parseBlock'), require('./parseLocalDeclares'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.util, global.Token, global.checks, global.parseBlock, global.parseLocalDeclares);
		global.parseExcept = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _util, _Token, _checks, _parseBlock, _parseLocalDeclares) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseExcept;

	var _parseBlock2 = _interopRequireDefault(_parseBlock);

	var _parseLocalDeclares2 = _interopRequireDefault(_parseLocalDeclares);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	function parseExcept(tokens) {
		const lines = (0, _parseBlock.justBlock)(_Token.Keywords.Except, tokens);
		const firstLine = lines.headSlice();
		const tokenTry = firstLine.head();
		(0, _context.check)((0, _Token.isKeyword)(_Token.Keywords.Try, tokenTry), tokenTry.loc, () => `Must start with ${ (0, _Token.showKeyword)(_Token.Keywords.Try) }`);

		const _try = (0, _parseBlock.parseJustBlock)(_Token.Keywords.Try, firstLine.tail());

		const restLines = lines.tail();
		(0, _checks.checkNonEmpty)(restLines, () => 'Must have at least one of ' + `${ (0, _Token.showKeyword)(_Token.Keywords.Catch) } or ${ (0, _Token.showKeyword)(_Token.Keywords.Finally) }`);

		const handleFinally = restLines => {
			const line = restLines.headSlice();
			const tokenFinally = line.head();
			(0, _context.check)((0, _Token.isKeyword)(_Token.Keywords.Finally, tokenFinally), tokenFinally.loc, () => `Expected ${ (0, _Token.showKeyword)(_Token.Keywords.Finally) }`);
			(0, _context.check)(restLines.size() === 1, restLines.loc, () => `Nothing is allowed to come after ${ (0, _Token.showKeyword)(_Token.Keywords.Finally) }.`);
			return (0, _parseBlock.parseJustBlock)(_Token.Keywords.Finally, line.tail());
		};

		let _catch, _finally;

		const line2 = restLines.headSlice();
		const head2 = line2.head();

		if ((0, _Token.isKeyword)(_Token.Keywords.Catch, head2)) {
			var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(line2.tail());

			var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

			const before2 = _beforeAndBlock2[0];
			const block2 = _beforeAndBlock2[1];
			const caught = parseOneLocalDeclareOrFocus(before2);
			_catch = new _MsAst.Catch(line2.loc, caught, (0, _parseBlock2.default)(block2));
			_finally = (0, _util.opIf)(restLines.size() > 1, () => handleFinally(restLines.tail()));
		} else {
			_catch = null;
			_finally = handleFinally(restLines);
		}

		return new _MsAst.Except(tokens.loc, _try, _catch, _finally);
	}

	function parseOneLocalDeclareOrFocus(tokens) {
		if (tokens.isEmpty()) return _MsAst.LocalDeclare.focus(tokens.loc);else {
			(0, _context.check)(tokens.size() === 1, 'Expected only one local declare.');
			return (0, _parseLocalDeclares2.default)(tokens)[0];
		}
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRXhjZXB0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFTd0IsV0FBVzs7Ozs7Ozs7OztVQUFYLFdBQVciLCJmaWxlIjoicGFyc2VFeGNlcHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtDYXRjaCwgRXhjZXB0LCBMb2NhbERlY2xhcmV9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtvcElmfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtpc0tleXdvcmQsIEtleXdvcmRzLCBzaG93S2V5d29yZH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2NoZWNrTm9uRW1wdHl9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHBhcnNlQmxvY2ssIHtiZWZvcmVBbmRCbG9jaywganVzdEJsb2NrLCBwYXJzZUp1c3RCbG9ja30gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlTG9jYWxEZWNsYXJlcyBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcblxuLyoqIFBhcnNlIGFuIHtAbGluayBFeGNlcHR9LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VFeGNlcHQodG9rZW5zKSB7XG5cdGNvbnN0IGxpbmVzID0ganVzdEJsb2NrKEtleXdvcmRzLkV4Y2VwdCwgdG9rZW5zKVxuXG5cdC8vIGB0cnlgICptdXN0KiBjb21lIGZpcnN0LlxuXHRjb25zdCBmaXJzdExpbmUgPSBsaW5lcy5oZWFkU2xpY2UoKVxuXHRjb25zdCB0b2tlblRyeSA9IGZpcnN0TGluZS5oZWFkKClcblx0Y2hlY2soaXNLZXl3b3JkKEtleXdvcmRzLlRyeSwgdG9rZW5UcnkpLCB0b2tlblRyeS5sb2MsICgpID0+XG5cdFx0YE11c3Qgc3RhcnQgd2l0aCAke3Nob3dLZXl3b3JkKEtleXdvcmRzLlRyeSl9YClcblx0Y29uc3QgX3RyeSA9IHBhcnNlSnVzdEJsb2NrKEtleXdvcmRzLlRyeSwgZmlyc3RMaW5lLnRhaWwoKSlcblxuXHRjb25zdCByZXN0TGluZXMgPSBsaW5lcy50YWlsKClcblx0Y2hlY2tOb25FbXB0eShyZXN0TGluZXMsICgpID0+XG5cdFx0J011c3QgaGF2ZSBhdCBsZWFzdCBvbmUgb2YgJyArXG5cdFx0YCR7c2hvd0tleXdvcmQoS2V5d29yZHMuQ2F0Y2gpfSBvciAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkZpbmFsbHkpfWApXG5cblx0Y29uc3QgaGFuZGxlRmluYWxseSA9IHJlc3RMaW5lcyA9PiB7XG5cdFx0Y29uc3QgbGluZSA9IHJlc3RMaW5lcy5oZWFkU2xpY2UoKVxuXHRcdGNvbnN0IHRva2VuRmluYWxseSA9IGxpbmUuaGVhZCgpXG5cdFx0Y2hlY2soaXNLZXl3b3JkKEtleXdvcmRzLkZpbmFsbHksIHRva2VuRmluYWxseSksIHRva2VuRmluYWxseS5sb2MsICgpID0+XG5cdFx0XHRgRXhwZWN0ZWQgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5GaW5hbGx5KX1gKVxuXHRcdGNoZWNrKHJlc3RMaW5lcy5zaXplKCkgPT09IDEsIHJlc3RMaW5lcy5sb2MsICgpID0+XG5cdFx0XHRgTm90aGluZyBpcyBhbGxvd2VkIHRvIGNvbWUgYWZ0ZXIgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5GaW5hbGx5KX0uYClcblx0XHRyZXR1cm4gcGFyc2VKdXN0QmxvY2soS2V5d29yZHMuRmluYWxseSwgbGluZS50YWlsKCkpXG5cdH1cblxuXHRsZXQgX2NhdGNoLCBfZmluYWxseVxuXG5cdGNvbnN0IGxpbmUyID0gcmVzdExpbmVzLmhlYWRTbGljZSgpXG5cdGNvbnN0IGhlYWQyID0gbGluZTIuaGVhZCgpXG5cdGlmIChpc0tleXdvcmQoS2V5d29yZHMuQ2F0Y2gsIGhlYWQyKSkge1xuXHRcdGNvbnN0IFtiZWZvcmUyLCBibG9jazJdID0gYmVmb3JlQW5kQmxvY2sobGluZTIudGFpbCgpKVxuXHRcdGNvbnN0IGNhdWdodCA9IHBhcnNlT25lTG9jYWxEZWNsYXJlT3JGb2N1cyhiZWZvcmUyKVxuXHRcdF9jYXRjaCA9IG5ldyBDYXRjaChsaW5lMi5sb2MsIGNhdWdodCwgcGFyc2VCbG9jayhibG9jazIpKVxuXHRcdF9maW5hbGx5ID0gb3BJZihyZXN0TGluZXMuc2l6ZSgpID4gMSwgKCkgPT4gaGFuZGxlRmluYWxseShyZXN0TGluZXMudGFpbCgpKSlcblx0fSBlbHNlIHtcblx0XHRfY2F0Y2ggPSBudWxsXG5cdFx0X2ZpbmFsbHkgPSBoYW5kbGVGaW5hbGx5KHJlc3RMaW5lcylcblx0fVxuXG5cdHJldHVybiBuZXcgRXhjZXB0KHRva2Vucy5sb2MsIF90cnksIF9jYXRjaCwgX2ZpbmFsbHkpXG59XG5cbmZ1bmN0aW9uIHBhcnNlT25lTG9jYWxEZWNsYXJlT3JGb2N1cyh0b2tlbnMpIHtcblx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIExvY2FsRGVjbGFyZS5mb2N1cyh0b2tlbnMubG9jKVxuXHRlbHNlIHtcblx0XHRjaGVjayh0b2tlbnMuc2l6ZSgpID09PSAxLCAnRXhwZWN0ZWQgb25seSBvbmUgbG9jYWwgZGVjbGFyZS4nKVxuXHRcdHJldHVybiBwYXJzZUxvY2FsRGVjbGFyZXModG9rZW5zKVswXVxuXHR9XG59XG4iXX0=
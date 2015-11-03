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

	var _parseLocalDeclares2 = _interopRequireDefault(_parseLocalDeclares);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	function parseExcept(isVal, tokens) {
		const lines = (0, _parseBlock.justBlock)(_Token.Keywords.Except, tokens);
		const firstLine = lines.headSlice();
		const tokenTry = firstLine.head();
		(0, _context.check)((0, _Token.isKeyword)(_Token.Keywords.Try, tokenTry), tokenTry.loc, () => `Must start with ${ (0, _Token.showKeyword)(_Token.Keywords.Try) }`);

		const _try = (0, _parseBlock.parseJustBlockDoOrVal)(isVal, _Token.Keywords.Try, firstLine.tail());

		const restLines = lines.tail();
		(0, _checks.checkNonEmpty)(restLines, () => 'Must have at least one of ' + `${ (0, _Token.showKeyword)(_Token.Keywords.Catch) } or ${ (0, _Token.showKeyword)(_Token.Keywords.Finally) }`);

		const handleFinally = restLines => {
			const line = restLines.headSlice();
			const tokenFinally = line.head();
			(0, _context.check)((0, _Token.isKeyword)(_Token.Keywords.Finally, tokenFinally), tokenFinally.loc, () => `Expected ${ (0, _Token.showKeyword)(_Token.Keywords.Finally) }`);
			(0, _context.check)(restLines.size() === 1, restLines.loc, () => `Nothing is allowed to come after ${ (0, _Token.showKeyword)(_Token.Keywords.Finally) }.`);
			return (0, _parseBlock.parseJustBlockDo)(_Token.Keywords.Finally, line.tail());
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
			_catch = new _MsAst.Catch(line2.loc, caught, (0, _parseBlock.parseBlockDoOrVal)(isVal, block2));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRXhjZXB0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFVd0IsV0FBVzs7Ozs7Ozs7VUFBWCxXQUFXIiwiZmlsZSI6InBhcnNlRXhjZXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVja30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7Q2F0Y2gsIEV4Y2VwdCwgTG9jYWxEZWNsYXJlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7b3BJZn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7aXNLZXl3b3JkLCBLZXl3b3Jkcywgc2hvd0tleXdvcmR9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtjaGVja05vbkVtcHR5fSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7YmVmb3JlQW5kQmxvY2ssIHBhcnNlQmxvY2tEb09yVmFsLCBqdXN0QmxvY2ssIHBhcnNlSnVzdEJsb2NrRG9PclZhbCwgcGFyc2VKdXN0QmxvY2tEb1xuXHR9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZUxvY2FsRGVjbGFyZXMgZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5cbi8qKiBQYXJzZSBhbiB7QGxpbmsgRXhjZXB0fS4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlRXhjZXB0KGlzVmFsLCB0b2tlbnMpIHtcblx0Y29uc3QgbGluZXMgPSBqdXN0QmxvY2soS2V5d29yZHMuRXhjZXB0LCB0b2tlbnMpXG5cblx0Ly8gYHRyeWAgKm11c3QqIGNvbWUgZmlyc3QuXG5cdGNvbnN0IGZpcnN0TGluZSA9IGxpbmVzLmhlYWRTbGljZSgpXG5cdGNvbnN0IHRva2VuVHJ5ID0gZmlyc3RMaW5lLmhlYWQoKVxuXHRjaGVjayhpc0tleXdvcmQoS2V5d29yZHMuVHJ5LCB0b2tlblRyeSksIHRva2VuVHJ5LmxvYywgKCkgPT5cblx0XHRgTXVzdCBzdGFydCB3aXRoICR7c2hvd0tleXdvcmQoS2V5d29yZHMuVHJ5KX1gKVxuXHRjb25zdCBfdHJ5ID0gcGFyc2VKdXN0QmxvY2tEb09yVmFsKGlzVmFsLCBLZXl3b3Jkcy5UcnksIGZpcnN0TGluZS50YWlsKCkpXG5cblx0Y29uc3QgcmVzdExpbmVzID0gbGluZXMudGFpbCgpXG5cdGNoZWNrTm9uRW1wdHkocmVzdExpbmVzLCAoKSA9PlxuXHRcdCdNdXN0IGhhdmUgYXQgbGVhc3Qgb25lIG9mICcgK1xuXHRcdGAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkNhdGNoKX0gb3IgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5GaW5hbGx5KX1gKVxuXG5cdGNvbnN0IGhhbmRsZUZpbmFsbHkgPSByZXN0TGluZXMgPT4ge1xuXHRcdGNvbnN0IGxpbmUgPSByZXN0TGluZXMuaGVhZFNsaWNlKClcblx0XHRjb25zdCB0b2tlbkZpbmFsbHkgPSBsaW5lLmhlYWQoKVxuXHRcdGNoZWNrKGlzS2V5d29yZChLZXl3b3Jkcy5GaW5hbGx5LCB0b2tlbkZpbmFsbHkpLCB0b2tlbkZpbmFsbHkubG9jLCAoKSA9PlxuXHRcdFx0YEV4cGVjdGVkICR7c2hvd0tleXdvcmQoS2V5d29yZHMuRmluYWxseSl9YClcblx0XHRjaGVjayhyZXN0TGluZXMuc2l6ZSgpID09PSAxLCByZXN0TGluZXMubG9jLCAoKSA9PlxuXHRcdFx0YE5vdGhpbmcgaXMgYWxsb3dlZCB0byBjb21lIGFmdGVyICR7c2hvd0tleXdvcmQoS2V5d29yZHMuRmluYWxseSl9LmApXG5cdFx0cmV0dXJuIHBhcnNlSnVzdEJsb2NrRG8oS2V5d29yZHMuRmluYWxseSwgbGluZS50YWlsKCkpXG5cdH1cblxuXHRsZXQgX2NhdGNoLCBfZmluYWxseVxuXG5cdGNvbnN0IGxpbmUyID0gcmVzdExpbmVzLmhlYWRTbGljZSgpXG5cdGNvbnN0IGhlYWQyID0gbGluZTIuaGVhZCgpXG5cdGlmIChpc0tleXdvcmQoS2V5d29yZHMuQ2F0Y2gsIGhlYWQyKSkge1xuXHRcdGNvbnN0IFtiZWZvcmUyLCBibG9jazJdID0gYmVmb3JlQW5kQmxvY2sobGluZTIudGFpbCgpKVxuXHRcdGNvbnN0IGNhdWdodCA9IHBhcnNlT25lTG9jYWxEZWNsYXJlT3JGb2N1cyhiZWZvcmUyKVxuXHRcdF9jYXRjaCA9IG5ldyBDYXRjaChsaW5lMi5sb2MsIGNhdWdodCwgcGFyc2VCbG9ja0RvT3JWYWwoaXNWYWwsIGJsb2NrMikpXG5cdFx0X2ZpbmFsbHkgPSBvcElmKHJlc3RMaW5lcy5zaXplKCkgPiAxLCAoKSA9PiBoYW5kbGVGaW5hbGx5KHJlc3RMaW5lcy50YWlsKCkpKVxuXHR9IGVsc2Uge1xuXHRcdF9jYXRjaCA9IG51bGxcblx0XHRfZmluYWxseSA9IGhhbmRsZUZpbmFsbHkocmVzdExpbmVzKVxuXHR9XG5cblx0cmV0dXJuIG5ldyBFeGNlcHQodG9rZW5zLmxvYywgX3RyeSwgX2NhdGNoLCBfZmluYWxseSlcbn1cblxuZnVuY3Rpb24gcGFyc2VPbmVMb2NhbERlY2xhcmVPckZvY3VzKHRva2Vucykge1xuXHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRyZXR1cm4gTG9jYWxEZWNsYXJlLmZvY3VzKHRva2Vucy5sb2MpXG5cdGVsc2Uge1xuXHRcdGNoZWNrKHRva2Vucy5zaXplKCkgPT09IDEsICdFeHBlY3RlZCBvbmx5IG9uZSBsb2NhbCBkZWNsYXJlLicpXG5cdFx0cmV0dXJuIHBhcnNlTG9jYWxEZWNsYXJlcyh0b2tlbnMpWzBdXG5cdH1cbn1cbiJdfQ==
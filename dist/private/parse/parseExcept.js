'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../../CompileError', '../context', '../MsAst', '../util', '../Token', './checks', './parseBlock', './parseLocalDeclares'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../../CompileError'), require('../context'), require('../MsAst'), require('../util'), require('../Token'), require('./checks'), require('./parseBlock'), require('./parseLocalDeclares'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.MsAst, global.util, global.Token, global.checks, global.parseBlock, global.parseLocalDeclares);
		global.parseExcept = mod.exports;
	}
})(this, function (exports, _CompileError, _context, _MsAst, _util, _Token, _checks, _parseBlock, _parseLocalDeclares) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseExcept;

	var _parseLocalDeclares2 = _interopRequireDefault(_parseLocalDeclares);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRXhjZXB0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFXd0IsV0FBVzs7Ozs7Ozs7VUFBWCxXQUFXIiwiZmlsZSI6InBhcnNlRXhjZXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtDYXRjaCwgRXhjZXB0RG8sIEV4Y2VwdFZhbCwgTG9jYWxEZWNsYXJlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7b3BJZn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7aXNLZXl3b3JkLCBrZXl3b3JkTmFtZSwgS2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtjaGVja05vbkVtcHR5fSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7YmVmb3JlQW5kQmxvY2ssIHBhcnNlQmxvY2tWYWwsIHBhcnNlQmxvY2tEbywganVzdEJsb2NrLCBwYXJzZUp1c3RCbG9ja0RvLCBwYXJzZUp1c3RCbG9ja1ZhbFxuXHR9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZUxvY2FsRGVjbGFyZXMgZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5cbi8qKiBQYXJzZSBhbiB7QGxpbmsgRXhjZXB0RG99IG9yIHtAbGluayBFeGNlcHRWYWx9LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VFeGNlcHQoa3dFeGNlcHQsIHRva2Vucykge1xuXHRjb25zdFxuXHRcdGlzVmFsID0ga3dFeGNlcHQgPT09IEtleXdvcmRzLkV4Y2VwdFZhbCxcblx0XHRqdXN0RG9WYWxCbG9jayA9IGlzVmFsID8gcGFyc2VKdXN0QmxvY2tWYWwgOiBwYXJzZUp1c3RCbG9ja0RvLFxuXHRcdHBhcnNlQmxvY2sgPSBpc1ZhbCA/IHBhcnNlQmxvY2tWYWwgOiBwYXJzZUJsb2NrRG8sXG5cdFx0RXhjZXB0ID0gaXNWYWwgPyBFeGNlcHRWYWwgOiBFeGNlcHREbyxcblx0XHRrd1RyeSA9IGlzVmFsID8gS2V5d29yZHMuVHJ5VmFsIDogS2V5d29yZHMuVHJ5RG8sXG5cdFx0a3dDYXRjaCA9IGlzVmFsID8gS2V5d29yZHMuQ2F0Y2hWYWwgOiBLZXl3b3Jkcy5DYXRjaERvLFxuXHRcdG5hbWVUcnkgPSAoKSA9PiBjb2RlKGtleXdvcmROYW1lKGt3VHJ5KSksXG5cdFx0bmFtZUNhdGNoID0gKCkgPT4gY29kZShrZXl3b3JkTmFtZShrd0NhdGNoKSksXG5cdFx0bmFtZUZpbmFsbHkgPSAoKSA9PiBjb2RlKGtleXdvcmROYW1lKEtleXdvcmRzLkZpbmFsbHkpKVxuXG5cdGNvbnN0IGxpbmVzID0ganVzdEJsb2NrKGt3RXhjZXB0LCB0b2tlbnMpXG5cblx0Ly8gYHRyeWAgKm11c3QqIGNvbWUgZmlyc3QuXG5cdGNvbnN0IGZpcnN0TGluZSA9IGxpbmVzLmhlYWRTbGljZSgpXG5cdGNvbnN0IHRva2VuVHJ5ID0gZmlyc3RMaW5lLmhlYWQoKVxuXHRjaGVjayhpc0tleXdvcmQoa3dUcnksIHRva2VuVHJ5KSwgdG9rZW5UcnkubG9jLCAoKSA9PlxuXHRcdGBNdXN0IHN0YXJ0IHdpdGggJHtuYW1lVHJ5KCl9YClcblx0Y29uc3QgX3RyeSA9IGp1c3REb1ZhbEJsb2NrKGt3VHJ5LCBmaXJzdExpbmUudGFpbCgpKVxuXG5cdGNvbnN0IHJlc3RMaW5lcyA9IGxpbmVzLnRhaWwoKVxuXHRjaGVja05vbkVtcHR5KHJlc3RMaW5lcywgKCkgPT5cblx0XHRgTXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBvZiAke25hbWVDYXRjaCgpfSBvciAke25hbWVGaW5hbGx5KCl9YClcblxuXHRjb25zdCBoYW5kbGVGaW5hbGx5ID0gcmVzdExpbmVzID0+IHtcblx0XHRjb25zdCBsaW5lID0gcmVzdExpbmVzLmhlYWRTbGljZSgpXG5cdFx0Y29uc3QgdG9rZW5GaW5hbGx5ID0gbGluZS5oZWFkKClcblx0XHRjaGVjayhpc0tleXdvcmQoS2V5d29yZHMuRmluYWxseSwgdG9rZW5GaW5hbGx5KSwgdG9rZW5GaW5hbGx5LmxvYywgKCkgPT5cblx0XHRcdGBFeHBlY3RlZCAke25hbWVGaW5hbGx5KCl9YClcblx0XHRjaGVjayhyZXN0TGluZXMuc2l6ZSgpID09PSAxLCByZXN0TGluZXMubG9jLCAoKSA9PlxuXHRcdFx0YE5vdGhpbmcgaXMgYWxsb3dlZCB0byBjb21lIGFmdGVyICR7bmFtZUZpbmFsbHkoKX0uYClcblx0XHRyZXR1cm4gcGFyc2VKdXN0QmxvY2tEbyhLZXl3b3Jkcy5GaW5hbGx5LCBsaW5lLnRhaWwoKSlcblx0fVxuXG5cdGxldCBfY2F0Y2gsIF9maW5hbGx5XG5cblx0Y29uc3QgbGluZTIgPSByZXN0TGluZXMuaGVhZFNsaWNlKClcblx0Y29uc3QgaGVhZDIgPSBsaW5lMi5oZWFkKClcblx0aWYgKGlzS2V5d29yZChrd0NhdGNoLCBoZWFkMikpIHtcblx0XHRjb25zdCBbYmVmb3JlMiwgYmxvY2syXSA9IGJlZm9yZUFuZEJsb2NrKGxpbmUyLnRhaWwoKSlcblx0XHRjb25zdCBjYXVnaHQgPSBwYXJzZU9uZUxvY2FsRGVjbGFyZU9yRm9jdXMoYmVmb3JlMilcblx0XHRfY2F0Y2ggPSBuZXcgQ2F0Y2gobGluZTIubG9jLCBjYXVnaHQsIHBhcnNlQmxvY2soYmxvY2syKSlcblx0XHRfZmluYWxseSA9IG9wSWYocmVzdExpbmVzLnNpemUoKSA+IDEsICgpID0+IGhhbmRsZUZpbmFsbHkocmVzdExpbmVzLnRhaWwoKSkpXG5cdH0gZWxzZSB7XG5cdFx0X2NhdGNoID0gbnVsbFxuXHRcdF9maW5hbGx5ID0gaGFuZGxlRmluYWxseShyZXN0TGluZXMpXG5cdH1cblxuXHRyZXR1cm4gbmV3IEV4Y2VwdCh0b2tlbnMubG9jLCBfdHJ5LCBfY2F0Y2gsIF9maW5hbGx5KVxufVxuXG5mdW5jdGlvbiBwYXJzZU9uZUxvY2FsRGVjbGFyZU9yRm9jdXModG9rZW5zKSB7XG5cdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdHJldHVybiBMb2NhbERlY2xhcmUuZm9jdXModG9rZW5zLmxvYylcblx0ZWxzZSB7XG5cdFx0Y2hlY2sodG9rZW5zLnNpemUoKSA9PT0gMSwgJ0V4cGVjdGVkIG9ubHkgb25lIGxvY2FsIGRlY2xhcmUuJylcblx0XHRyZXR1cm4gcGFyc2VMb2NhbERlY2xhcmVzKHRva2VucylbMF1cblx0fVxufVxuIl19
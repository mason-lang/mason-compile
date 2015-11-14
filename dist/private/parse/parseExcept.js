'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', './checks', './parseBlock', './parseLocalDeclares'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('./checks'), require('./parseBlock'), require('./parseLocalDeclares'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.checks, global.parseBlock, global.parseLocalDeclares);
		global.parseExcept = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _checks, _parseBlock, _parseLocalDeclares) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseExcept;

	var _parseBlock2 = _interopRequireDefault(_parseBlock);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	var _slicedToArray = (function () {
		function sliceIterator(arr, i) {
			var _arr = [];
			var _n = true;
			var _d = false;
			var _e = undefined;

			try {
				for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
					_arr.push(_s.value);

					if (i && _arr.length === i) break;
				}
			} catch (err) {
				_d = true;
				_e = err;
			} finally {
				try {
					if (!_n && _i["return"]) _i["return"]();
				} finally {
					if (_d) throw _e;
				}
			}

			return _arr;
		}

		return function (arr, i) {
			if (Array.isArray(arr)) {
				return arr;
			} else if (Symbol.iterator in Object(arr)) {
				return sliceIterator(arr, i);
			} else {
				throw new TypeError("Invalid attempt to destructure non-iterable instance");
			}
		};
	})();

	function parseExcept(tokens) {
		const lines = (0, _parseBlock.justBlock)(_Token.Keywords.Except, tokens);

		var _takeTry = takeTry(lines);

		var _takeTry2 = _slicedToArray(_takeTry, 2);

		const _try = _takeTry2[0];
		const rest = _takeTry2[1];

		var _takeTypedCatches = takeTypedCatches(rest);

		var _takeTypedCatches2 = _slicedToArray(_takeTypedCatches, 3);

		const typedCatches = _takeTypedCatches2[0];
		const opCatchAll = _takeTypedCatches2[1];
		const rest2 = _takeTypedCatches2[2];

		var _opTakeElse = opTakeElse(rest2);

		var _opTakeElse2 = _slicedToArray(_opTakeElse, 2);

		const opElse = _opTakeElse2[0];
		const rest3 = _opTakeElse2[1];
		const opFinally = parseOpFinally(rest3);
		return new _MsAst.Except(tokens.loc, _try, typedCatches, opCatchAll, opElse, opFinally);
	}

	function takeTry(lines) {
		const line = lines.headSlice();
		(0, _checks.checkKeyword)(_Token.Keywords.Try, line.head());
		return [(0, _parseBlock.parseJustBlock)(_Token.Keywords.Try, line.tail()), lines.tail()];
	}

	function takeTypedCatches(lines) {
		const typedCatches = [];
		let opCatchAll = null;

		while (!lines.isEmpty()) {
			const line = lines.headSlice();
			if (!(0, _Token.isKeyword)(_Token.Keywords.Catch, line.head())) break;

			var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(line.tail());

			var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

			const before = _beforeAndBlock2[0];
			const block = _beforeAndBlock2[1];
			const caught = (0, _parseLocalDeclares.parseLocalDeclareOrFocus)(before);

			const _catch = new _MsAst.Catch(line.loc, caught, (0, _parseBlock2.default)(block));

			lines = lines.tail();

			if (caught.opType === null) {
				opCatchAll = _catch;
				break;
			} else typedCatches.push(_catch);
		}

		return [typedCatches, opCatchAll, lines];
	}

	function opTakeElse(lines) {
		if (lines.isEmpty()) return [null, lines];
		const line = lines.headSlice();
		const tokenElse = line.head();
		return (0, _Token.isKeyword)(_Token.Keywords.Else, tokenElse) ? [(0, _parseBlock.parseJustBlock)(_Token.Keywords.Else, line.tail()), lines.tail()] : [null, lines];
	}

	function parseOpFinally(lines) {
		if (lines.isEmpty()) return null;
		const line = lines.headSlice();
		(0, _checks.checkKeyword)(_Token.Keywords.Finally, line.head());
		(0, _context.check)(lines.size() === 1, lines.loc, () => `Nothing may come after ${ (0, _Token.showKeyword)(_Token.Keywords.Finally) }.`);
		return (0, _parseBlock.parseJustBlock)(_Token.Keywords.Finally, line.tail());
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRXhjZXB0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFRd0IsV0FBVzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBQVgsV0FBVyIsImZpbGUiOiJwYXJzZUV4Y2VwdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0NhdGNoLCBFeGNlcHR9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtpc0tleXdvcmQsIEtleXdvcmRzLCBzaG93S2V5d29yZH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2NoZWNrS2V5d29yZH0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQgcGFyc2VCbG9jaywge2JlZm9yZUFuZEJsb2NrLCBqdXN0QmxvY2ssIHBhcnNlSnVzdEJsb2NrfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQge3BhcnNlTG9jYWxEZWNsYXJlT3JGb2N1c30gZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5cbi8qKiBQYXJzZSBhbiB7QGxpbmsgRXhjZXB0fS4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlRXhjZXB0KHRva2Vucykge1xuXHRjb25zdCBsaW5lcyA9IGp1c3RCbG9jayhLZXl3b3Jkcy5FeGNlcHQsIHRva2Vucylcblx0Y29uc3QgW190cnksIHJlc3RdID0gdGFrZVRyeShsaW5lcylcblx0Y29uc3QgW3R5cGVkQ2F0Y2hlcywgb3BDYXRjaEFsbCwgcmVzdDJdID0gdGFrZVR5cGVkQ2F0Y2hlcyhyZXN0KVxuXHRjb25zdCBbb3BFbHNlLCByZXN0M10gPSBvcFRha2VFbHNlKHJlc3QyKVxuXHRjb25zdCBvcEZpbmFsbHkgPSBwYXJzZU9wRmluYWxseShyZXN0Mylcblx0cmV0dXJuIG5ldyBFeGNlcHQodG9rZW5zLmxvYywgX3RyeSwgdHlwZWRDYXRjaGVzLCBvcENhdGNoQWxsLCBvcEVsc2UsIG9wRmluYWxseSlcbn1cblxuZnVuY3Rpb24gdGFrZVRyeShsaW5lcykge1xuXHRjb25zdCBsaW5lID0gbGluZXMuaGVhZFNsaWNlKClcblx0Y2hlY2tLZXl3b3JkKEtleXdvcmRzLlRyeSwgbGluZS5oZWFkKCkpXG5cdHJldHVybiBbcGFyc2VKdXN0QmxvY2soS2V5d29yZHMuVHJ5LCBsaW5lLnRhaWwoKSksIGxpbmVzLnRhaWwoKV1cbn1cblxuZnVuY3Rpb24gdGFrZVR5cGVkQ2F0Y2hlcyhsaW5lcykge1xuXHRjb25zdCB0eXBlZENhdGNoZXMgPSBbXVxuXHRsZXQgb3BDYXRjaEFsbCA9IG51bGxcblxuXHR3aGlsZSAoIWxpbmVzLmlzRW1wdHkoKSkge1xuXHRcdGNvbnN0IGxpbmUgPSBsaW5lcy5oZWFkU2xpY2UoKVxuXHRcdGlmICghaXNLZXl3b3JkKEtleXdvcmRzLkNhdGNoLCBsaW5lLmhlYWQoKSkpXG5cdFx0XHRicmVha1xuXG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sobGluZS50YWlsKCkpXG5cdFx0Y29uc3QgY2F1Z2h0ID0gcGFyc2VMb2NhbERlY2xhcmVPckZvY3VzKGJlZm9yZSlcblx0XHRjb25zdCBfY2F0Y2ggPSBuZXcgQ2F0Y2gobGluZS5sb2MsIGNhdWdodCwgcGFyc2VCbG9jayhibG9jaykpXG5cblx0XHRsaW5lcyA9IGxpbmVzLnRhaWwoKVxuXG5cdFx0aWYgKGNhdWdodC5vcFR5cGUgPT09IG51bGwpIHtcblx0XHRcdG9wQ2F0Y2hBbGwgPSBfY2F0Y2hcblx0XHRcdGJyZWFrXG5cdFx0fSBlbHNlXG5cdFx0XHR0eXBlZENhdGNoZXMucHVzaChfY2F0Y2gpXG5cdH1cblx0cmV0dXJuIFt0eXBlZENhdGNoZXMsIG9wQ2F0Y2hBbGwsIGxpbmVzXVxufVxuXG5mdW5jdGlvbiBvcFRha2VFbHNlKGxpbmVzKSB7XG5cdGlmIChsaW5lcy5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIFtudWxsLCBsaW5lc11cblxuXHRjb25zdCBsaW5lID0gbGluZXMuaGVhZFNsaWNlKClcblx0Y29uc3QgdG9rZW5FbHNlID0gbGluZS5oZWFkKClcblx0cmV0dXJuIGlzS2V5d29yZChLZXl3b3Jkcy5FbHNlLCB0b2tlbkVsc2UpID9cblx0XHRbcGFyc2VKdXN0QmxvY2soS2V5d29yZHMuRWxzZSwgbGluZS50YWlsKCkpLCBsaW5lcy50YWlsKCldIDpcblx0XHRbbnVsbCwgbGluZXNdXG59XG5cbmZ1bmN0aW9uIHBhcnNlT3BGaW5hbGx5KGxpbmVzKSB7XG5cdGlmIChsaW5lcy5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIG51bGxcblxuXHRjb25zdCBsaW5lID0gbGluZXMuaGVhZFNsaWNlKClcblx0Y2hlY2tLZXl3b3JkKEtleXdvcmRzLkZpbmFsbHksIGxpbmUuaGVhZCgpKVxuXHRjaGVjayhsaW5lcy5zaXplKCkgPT09IDEsIGxpbmVzLmxvYywgKCkgPT5cblx0XHRgTm90aGluZyBtYXkgY29tZSBhZnRlciAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkZpbmFsbHkpfS5gKVxuXHRyZXR1cm4gcGFyc2VKdXN0QmxvY2soS2V5d29yZHMuRmluYWxseSwgbGluZS50YWlsKCkpXG59XG4iXX0=
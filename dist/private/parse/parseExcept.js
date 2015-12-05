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
		(0, _context.check)(lines.size() === 1, lines.loc, () => 'nothingAfterFinally');
		return (0, _parseBlock.parseJustBlock)(_Token.Keywords.Finally, line.tail());
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRXhjZXB0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFRd0IsV0FBVzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBQVgsV0FBVyIsImZpbGUiOiJwYXJzZUV4Y2VwdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0NhdGNoLCBFeGNlcHR9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7Y2hlY2tLZXl3b3JkfSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCBwYXJzZUJsb2NrLCB7YmVmb3JlQW5kQmxvY2ssIGp1c3RCbG9jaywgcGFyc2VKdXN0QmxvY2t9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCB7cGFyc2VMb2NhbERlY2xhcmVPckZvY3VzfSBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcblxuLyoqIFBhcnNlIGFuIHtAbGluayBFeGNlcHR9LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VFeGNlcHQodG9rZW5zKSB7XG5cdGNvbnN0IGxpbmVzID0ganVzdEJsb2NrKEtleXdvcmRzLkV4Y2VwdCwgdG9rZW5zKVxuXHRjb25zdCBbX3RyeSwgcmVzdF0gPSB0YWtlVHJ5KGxpbmVzKVxuXHRjb25zdCBbdHlwZWRDYXRjaGVzLCBvcENhdGNoQWxsLCByZXN0Ml0gPSB0YWtlVHlwZWRDYXRjaGVzKHJlc3QpXG5cdGNvbnN0IFtvcEVsc2UsIHJlc3QzXSA9IG9wVGFrZUVsc2UocmVzdDIpXG5cdGNvbnN0IG9wRmluYWxseSA9IHBhcnNlT3BGaW5hbGx5KHJlc3QzKVxuXHRyZXR1cm4gbmV3IEV4Y2VwdCh0b2tlbnMubG9jLCBfdHJ5LCB0eXBlZENhdGNoZXMsIG9wQ2F0Y2hBbGwsIG9wRWxzZSwgb3BGaW5hbGx5KVxufVxuXG5mdW5jdGlvbiB0YWtlVHJ5KGxpbmVzKSB7XG5cdGNvbnN0IGxpbmUgPSBsaW5lcy5oZWFkU2xpY2UoKVxuXHRjaGVja0tleXdvcmQoS2V5d29yZHMuVHJ5LCBsaW5lLmhlYWQoKSlcblx0cmV0dXJuIFtwYXJzZUp1c3RCbG9jayhLZXl3b3Jkcy5UcnksIGxpbmUudGFpbCgpKSwgbGluZXMudGFpbCgpXVxufVxuXG5mdW5jdGlvbiB0YWtlVHlwZWRDYXRjaGVzKGxpbmVzKSB7XG5cdGNvbnN0IHR5cGVkQ2F0Y2hlcyA9IFtdXG5cdGxldCBvcENhdGNoQWxsID0gbnVsbFxuXG5cdHdoaWxlICghbGluZXMuaXNFbXB0eSgpKSB7XG5cdFx0Y29uc3QgbGluZSA9IGxpbmVzLmhlYWRTbGljZSgpXG5cdFx0aWYgKCFpc0tleXdvcmQoS2V5d29yZHMuQ2F0Y2gsIGxpbmUuaGVhZCgpKSlcblx0XHRcdGJyZWFrXG5cblx0XHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayhsaW5lLnRhaWwoKSlcblx0XHRjb25zdCBjYXVnaHQgPSBwYXJzZUxvY2FsRGVjbGFyZU9yRm9jdXMoYmVmb3JlKVxuXHRcdGNvbnN0IF9jYXRjaCA9IG5ldyBDYXRjaChsaW5lLmxvYywgY2F1Z2h0LCBwYXJzZUJsb2NrKGJsb2NrKSlcblxuXHRcdGxpbmVzID0gbGluZXMudGFpbCgpXG5cblx0XHRpZiAoY2F1Z2h0Lm9wVHlwZSA9PT0gbnVsbCkge1xuXHRcdFx0b3BDYXRjaEFsbCA9IF9jYXRjaFxuXHRcdFx0YnJlYWtcblx0XHR9IGVsc2Vcblx0XHRcdHR5cGVkQ2F0Y2hlcy5wdXNoKF9jYXRjaClcblx0fVxuXHRyZXR1cm4gW3R5cGVkQ2F0Y2hlcywgb3BDYXRjaEFsbCwgbGluZXNdXG59XG5cbmZ1bmN0aW9uIG9wVGFrZUVsc2UobGluZXMpIHtcblx0aWYgKGxpbmVzLmlzRW1wdHkoKSlcblx0XHRyZXR1cm4gW251bGwsIGxpbmVzXVxuXG5cdGNvbnN0IGxpbmUgPSBsaW5lcy5oZWFkU2xpY2UoKVxuXHRjb25zdCB0b2tlbkVsc2UgPSBsaW5lLmhlYWQoKVxuXHRyZXR1cm4gaXNLZXl3b3JkKEtleXdvcmRzLkVsc2UsIHRva2VuRWxzZSkgP1xuXHRcdFtwYXJzZUp1c3RCbG9jayhLZXl3b3Jkcy5FbHNlLCBsaW5lLnRhaWwoKSksIGxpbmVzLnRhaWwoKV0gOlxuXHRcdFtudWxsLCBsaW5lc11cbn1cblxuZnVuY3Rpb24gcGFyc2VPcEZpbmFsbHkobGluZXMpIHtcblx0aWYgKGxpbmVzLmlzRW1wdHkoKSlcblx0XHRyZXR1cm4gbnVsbFxuXG5cdGNvbnN0IGxpbmUgPSBsaW5lcy5oZWFkU2xpY2UoKVxuXHRjaGVja0tleXdvcmQoS2V5d29yZHMuRmluYWxseSwgbGluZS5oZWFkKCkpXG5cdGNoZWNrKGxpbmVzLnNpemUoKSA9PT0gMSwgbGluZXMubG9jLCAoKSA9PiAnbm90aGluZ0FmdGVyRmluYWxseScpXG5cdHJldHVybiBwYXJzZUp1c3RCbG9jayhLZXl3b3Jkcy5GaW5hbGx5LCBsaW5lLnRhaWwoKSlcbn1cbiJdfQ==
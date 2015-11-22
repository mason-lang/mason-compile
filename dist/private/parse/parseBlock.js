'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', './checks', './parseLine', './tryTakeComment', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('./checks'), require('./parseLine'), require('./tryTakeComment'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.checks, global.parseLine, global.tryTakeComment, global.Slice);
		global.parseBlock = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _checks, _parseLine, _tryTakeComment3, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseBlock;
	exports.beforeAndBlock = beforeAndBlock;
	exports.beforeAndOpBlock = beforeAndOpBlock;
	exports.parseBlockWrap = parseBlockWrap;
	exports.justBlock = justBlock;
	exports.parseJustBlock = parseJustBlock;

	var _tryTakeComment4 = _interopRequireDefault(_tryTakeComment3);

	var _Slice2 = _interopRequireDefault(_Slice);

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

	function parseBlock(lineTokens) {
		var _tryTakeComment = (0, _tryTakeComment4.default)(lineTokens);

		var _tryTakeComment2 = _slicedToArray(_tryTakeComment, 2);

		const opComment = _tryTakeComment2[0];
		const rest = _tryTakeComment2[1];
		return new _MsAst.Block(lineTokens.loc, opComment, (0, _parseLine.parseLines)(rest));
	}

	function beforeAndBlock(tokens) {
		var _beforeAndOpBlock = beforeAndOpBlock(tokens);

		var _beforeAndOpBlock2 = _slicedToArray(_beforeAndOpBlock, 2);

		const before = _beforeAndOpBlock2[0];
		const opBlock = _beforeAndOpBlock2[1];
		(0, _context.check)(opBlock !== null, tokens.loc, 'Expected an indented block at the end.');
		return [before, opBlock];
	}

	function beforeAndOpBlock(tokens) {
		if (tokens.isEmpty()) return [tokens, null];else {
			const block = tokens.last();
			return (0, _Token.isGroup)(_Token.Groups.Block, block) ? [tokens.rtail(), _Slice2.default.group(block)] : [tokens, null];
		}
	}

	function parseBlockWrap(tokens) {
		return new _MsAst.BlockWrap(tokens.loc, parseBlock(tokens));
	}

	function justBlock(keywordKind, tokens) {
		var _beforeAndBlock = beforeAndBlock(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const block = _beforeAndBlock2[1];
		(0, _checks.checkEmpty)(before, () => `Did not expect anything between ${ (0, _Token.showKeyword)(keywordKind) } and block.`);
		return block;
	}

	function parseJustBlock(keywordKind, tokens) {
		return parseBlock(justBlock(keywordKind, tokens));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQmxvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQVN3QixVQUFVO1NBU2xCLGNBQWMsR0FBZCxjQUFjO1NBVWQsZ0JBQWdCLEdBQWhCLGdCQUFnQjtTQVVoQixjQUFjLEdBQWQsY0FBYztTQVNkLFNBQVMsR0FBVCxTQUFTO1NBUVQsY0FBYyxHQUFkLGNBQWM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBOUNOLFVBQVU7Ozs7Ozs7Ozs7VUFTbEIsY0FBYzs7Ozs7Ozs7Ozs7VUFVZCxnQkFBZ0I7Ozs7Ozs7VUFVaEIsY0FBYzs7OztVQVNkLFNBQVM7Ozs7Ozs7Ozs7O1VBUVQsY0FBYyIsImZpbGUiOiJwYXJzZUJsb2NrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVja30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7QmxvY2ssIEJsb2NrV3JhcH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwcywgaXNHcm91cCwgc2hvd0tleXdvcmR9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtjaGVja0VtcHR5fSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7cGFyc2VMaW5lc30gZnJvbSAnLi9wYXJzZUxpbmUnXG5pbXBvcnQgdHJ5VGFrZUNvbW1lbnQgZnJvbSAnLi90cnlUYWtlQ29tbWVudCdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKiogUGFyc2UgbGluZXMgaW4gYSBibG9jayBhbmQgbGVhZGluZyBkb2MgY29tbWVudC4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlQmxvY2sobGluZVRva2Vucykge1xuXHRjb25zdCBbb3BDb21tZW50LCByZXN0XSA9IHRyeVRha2VDb21tZW50KGxpbmVUb2tlbnMpXG5cdHJldHVybiBuZXcgQmxvY2sobGluZVRva2Vucy5sb2MsIG9wQ29tbWVudCwgcGFyc2VMaW5lcyhyZXN0KSlcbn1cblxuLyoqXG5Ub2tlbnMgb24gdGhlIGxpbmUgYmVmb3JlIGEgYmxvY2ssIGFuZCB0b2tlbnMgZm9yIHRoZSBibG9jayBpdHNlbGYuXG5AcmV0dXJuIHtbU2xpY2UsIFNsaWNlXX1cbiovXG5leHBvcnQgZnVuY3Rpb24gYmVmb3JlQW5kQmxvY2sodG9rZW5zKSB7XG5cdGNvbnN0IFtiZWZvcmUsIG9wQmxvY2tdID0gYmVmb3JlQW5kT3BCbG9jayh0b2tlbnMpXG5cdGNoZWNrKG9wQmxvY2sgIT09IG51bGwsIHRva2Vucy5sb2MsICdFeHBlY3RlZCBhbiBpbmRlbnRlZCBibG9jayBhdCB0aGUgZW5kLicpXG5cdHJldHVybiBbYmVmb3JlLCBvcEJsb2NrXVxufVxuXG4vKipcbmBiZWZvcmVBbmRCbG9ja2AgdGhhdCByZXR1cm5zIGBudWxsYCBmb3IgbWlzc2luZyBibG9jay5cbkByZXR1cm4ge1tTbGljZSwgP1NsaWNlXX1cbiovXG5leHBvcnQgZnVuY3Rpb24gYmVmb3JlQW5kT3BCbG9jayh0b2tlbnMpIHtcblx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIFt0b2tlbnMsIG51bGxdXG5cdGVsc2Uge1xuXHRcdGNvbnN0IGJsb2NrID0gdG9rZW5zLmxhc3QoKVxuXHRcdHJldHVybiBpc0dyb3VwKEdyb3Vwcy5CbG9jaywgYmxvY2spID8gW3Rva2Vucy5ydGFpbCgpLCBTbGljZS5ncm91cChibG9jayldIDogW3Rva2VucywgbnVsbF1cblx0fVxufVxuXG4vKiogUGFyc2UgYSBCbG9jayBhcyBhIHNpbmdsZSB2YWx1ZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUJsb2NrV3JhcCh0b2tlbnMpIHtcblx0cmV0dXJuIG5ldyBCbG9ja1dyYXAodG9rZW5zLmxvYywgcGFyc2VCbG9jayh0b2tlbnMpKVxufVxuXG4vKipcblBhcnNlIGEgYmxvY2ssIGZhaWxpbmcgaWYgdGhlcmUncyBzb21ldGhpbmcgcHJlY2VkaW5nIGl0LlxuQHBhcmFtIHtLZXl3b3Jkc30ga2V5d29yZEtpbmQgS2V5d29yZCB0aGF0IHByZWNlZGVzIHRoZSBibG9jay4gVXNlZCBmb3IgZXJyb3IgbWVzc2FnZS5cbkBwYXJhbSB7U2xpY2V9IHRva2VucyBUb2tlbnMgd2hpY2ggc2hvdWxkIGhhdmUgYSBibG9jayBhdCB0aGUgZW5kLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBqdXN0QmxvY2soa2V5d29yZEtpbmQsIHRva2Vucykge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdGNoZWNrRW1wdHkoYmVmb3JlLCAoKSA9PlxuXHRcdGBEaWQgbm90IGV4cGVjdCBhbnl0aGluZyBiZXR3ZWVuICR7c2hvd0tleXdvcmQoa2V5d29yZEtpbmQpfSBhbmQgYmxvY2suYClcblx0cmV0dXJuIGJsb2NrXG59XG5cbi8qKiBQYXJzZSBhIGJsb2NrIGZyb20gdGhlIGVuZCBvZiBgdG9rZW5zYCwgZmFpbGluZyBpZiB0aGVyZSdzIHNvbWV0aGluZyBwcmVjZWRpbmcgaXQuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VKdXN0QmxvY2soa2V5d29yZEtpbmQsIHRva2Vucykge1xuXHRyZXR1cm4gcGFyc2VCbG9jayhqdXN0QmxvY2soa2V5d29yZEtpbmQsIHRva2VucykpXG59XG4iXX0=
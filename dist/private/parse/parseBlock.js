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
		(0, _context.check)(opBlock !== null, tokens.loc, 'expectedBlock');
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
		(0, _checks.checkEmpty)(before, 'unexpectedAfterKind', keywordKind);
		return block;
	}

	function parseJustBlock(keywordKind, tokens) {
		return parseBlock(justBlock(keywordKind, tokens));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQmxvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQVN3QixVQUFVO1NBU2xCLGNBQWMsR0FBZCxjQUFjO1NBVWQsZ0JBQWdCLEdBQWhCLGdCQUFnQjtTQVVoQixjQUFjLEdBQWQsY0FBYztTQVNkLFNBQVMsR0FBVCxTQUFTO1NBT1QsY0FBYyxHQUFkLGNBQWM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBN0NOLFVBQVU7Ozs7Ozs7Ozs7VUFTbEIsY0FBYzs7Ozs7Ozs7Ozs7VUFVZCxnQkFBZ0I7Ozs7Ozs7VUFVaEIsY0FBYzs7OztVQVNkLFNBQVM7Ozs7Ozs7Ozs7O1VBT1QsY0FBYyIsImZpbGUiOiJwYXJzZUJsb2NrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVja30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7QmxvY2ssIEJsb2NrV3JhcH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwcywgaXNHcm91cH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2NoZWNrRW1wdHl9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtwYXJzZUxpbmVzfSBmcm9tICcuL3BhcnNlTGluZSdcbmltcG9ydCB0cnlUYWtlQ29tbWVudCBmcm9tICcuL3RyeVRha2VDb21tZW50J1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8qKiBQYXJzZSBsaW5lcyBpbiBhIGJsb2NrIGFuZCBsZWFkaW5nIGRvYyBjb21tZW50LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VCbG9jayhsaW5lVG9rZW5zKSB7XG5cdGNvbnN0IFtvcENvbW1lbnQsIHJlc3RdID0gdHJ5VGFrZUNvbW1lbnQobGluZVRva2Vucylcblx0cmV0dXJuIG5ldyBCbG9jayhsaW5lVG9rZW5zLmxvYywgb3BDb21tZW50LCBwYXJzZUxpbmVzKHJlc3QpKVxufVxuXG4vKipcblRva2VucyBvbiB0aGUgbGluZSBiZWZvcmUgYSBibG9jaywgYW5kIHRva2VucyBmb3IgdGhlIGJsb2NrIGl0c2VsZi5cbkByZXR1cm4ge1tTbGljZSwgU2xpY2VdfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmVBbmRCbG9jayh0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgb3BCbG9ja10gPSBiZWZvcmVBbmRPcEJsb2NrKHRva2Vucylcblx0Y2hlY2sob3BCbG9jayAhPT0gbnVsbCwgdG9rZW5zLmxvYywgJ2V4cGVjdGVkQmxvY2snKVxuXHRyZXR1cm4gW2JlZm9yZSwgb3BCbG9ja11cbn1cblxuLyoqXG5gYmVmb3JlQW5kQmxvY2tgIHRoYXQgcmV0dXJucyBgbnVsbGAgZm9yIG1pc3NpbmcgYmxvY2suXG5AcmV0dXJuIHtbU2xpY2UsID9TbGljZV19XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGJlZm9yZUFuZE9wQmxvY2sodG9rZW5zKSB7XG5cdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdHJldHVybiBbdG9rZW5zLCBudWxsXVxuXHRlbHNlIHtcblx0XHRjb25zdCBibG9jayA9IHRva2Vucy5sYXN0KClcblx0XHRyZXR1cm4gaXNHcm91cChHcm91cHMuQmxvY2ssIGJsb2NrKSA/IFt0b2tlbnMucnRhaWwoKSwgU2xpY2UuZ3JvdXAoYmxvY2spXSA6IFt0b2tlbnMsIG51bGxdXG5cdH1cbn1cblxuLyoqIFBhcnNlIGEgQmxvY2sgYXMgYSBzaW5nbGUgdmFsdWUuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCbG9ja1dyYXAodG9rZW5zKSB7XG5cdHJldHVybiBuZXcgQmxvY2tXcmFwKHRva2Vucy5sb2MsIHBhcnNlQmxvY2sodG9rZW5zKSlcbn1cblxuLyoqXG5QYXJzZSBhIGJsb2NrLCBmYWlsaW5nIGlmIHRoZXJlJ3Mgc29tZXRoaW5nIHByZWNlZGluZyBpdC5cbkBwYXJhbSB7S2V5d29yZHN9IGtleXdvcmRLaW5kIEtleXdvcmQgdGhhdCBwcmVjZWRlcyB0aGUgYmxvY2suIFVzZWQgZm9yIGVycm9yIG1lc3NhZ2UuXG5AcGFyYW0ge1NsaWNlfSB0b2tlbnMgVG9rZW5zIHdoaWNoIHNob3VsZCBoYXZlIGEgYmxvY2sgYXQgdGhlIGVuZC5cbiovXG5leHBvcnQgZnVuY3Rpb24ganVzdEJsb2NrKGtleXdvcmRLaW5kLCB0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRjaGVja0VtcHR5KGJlZm9yZSwgJ3VuZXhwZWN0ZWRBZnRlcktpbmQnLCBrZXl3b3JkS2luZClcblx0cmV0dXJuIGJsb2NrXG59XG5cbi8qKiBQYXJzZSBhIGJsb2NrIGZyb20gdGhlIGVuZCBvZiBgdG9rZW5zYCwgZmFpbGluZyBpZiB0aGVyZSdzIHNvbWV0aGluZyBwcmVjZWRpbmcgaXQuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VKdXN0QmxvY2soa2V5d29yZEtpbmQsIHRva2Vucykge1xuXHRyZXR1cm4gcGFyc2VCbG9jayhqdXN0QmxvY2soa2V5d29yZEtpbmQsIHRva2VucykpXG59XG4iXX0=
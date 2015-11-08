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

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQmxvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQVN3QixVQUFVO1NBU2xCLGNBQWMsR0FBZCxjQUFjO1NBVWQsZ0JBQWdCLEdBQWhCLGdCQUFnQjtTQVVoQixjQUFjLEdBQWQsY0FBYztTQVNkLFNBQVMsR0FBVCxTQUFTO1NBUVQsY0FBYyxHQUFkLGNBQWM7Ozs7Ozs7Ozs7VUE5Q04sVUFBVTs7Ozs7Ozs7OztVQVNsQixjQUFjOzs7Ozs7Ozs7OztVQVVkLGdCQUFnQjs7Ozs7OztVQVVoQixjQUFjOzs7O1VBU2QsU0FBUzs7Ozs7Ozs7Ozs7VUFRVCxjQUFjIiwiZmlsZSI6InBhcnNlQmxvY2suanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtCbG9jaywgQmxvY2tXcmFwfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXBzLCBpc0dyb3VwLCBzaG93S2V5d29yZH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2NoZWNrRW1wdHl9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtwYXJzZUxpbmVzfSBmcm9tICcuL3BhcnNlTGluZSdcbmltcG9ydCB0cnlUYWtlQ29tbWVudCBmcm9tICcuL3RyeVRha2VDb21tZW50J1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8qKiBQYXJzZSBsaW5lcyBpbiBhIGJsb2NrIGFuZCBsZWFkaW5nIGRvYyBjb21tZW50LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VCbG9jayhsaW5lVG9rZW5zKSB7XG5cdGNvbnN0IFtvcENvbW1lbnQsIHJlc3RdID0gdHJ5VGFrZUNvbW1lbnQobGluZVRva2Vucylcblx0cmV0dXJuIG5ldyBCbG9jayhsaW5lVG9rZW5zLmxvYywgb3BDb21tZW50LCBwYXJzZUxpbmVzKHJlc3QpKVxufVxuXG4vKipcblRva2VucyBvbiB0aGUgbGluZSBiZWZvcmUgYSBibG9jaywgYW5kIHRva2VucyBmb3IgdGhlIGJsb2NrIGl0c2VsZi5cbkByZXR1cm4ge1tTbGljZSwgU2xpY2VdfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmVBbmRCbG9jayh0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgb3BCbG9ja10gPSBiZWZvcmVBbmRPcEJsb2NrKHRva2Vucylcblx0Y2hlY2sob3BCbG9jayAhPT0gbnVsbCwgdG9rZW5zLmxvYywgJ0V4cGVjdGVkIGFuIGluZGVudGVkIGJsb2NrIGF0IHRoZSBlbmQuJylcblx0cmV0dXJuIFtiZWZvcmUsIG9wQmxvY2tdXG59XG5cbi8qKlxuYGJlZm9yZUFuZEJsb2NrYCB0aGF0IHJldHVybnMgYG51bGxgIGZvciBtaXNzaW5nIGJsb2NrLlxuQHJldHVybiB7W1NsaWNlLCA/U2xpY2VdfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmVBbmRPcEJsb2NrKHRva2Vucykge1xuXHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRyZXR1cm4gW3Rva2VucywgbnVsbF1cblx0ZWxzZSB7XG5cdFx0Y29uc3QgYmxvY2sgPSB0b2tlbnMubGFzdCgpXG5cdFx0cmV0dXJuIGlzR3JvdXAoR3JvdXBzLkJsb2NrLCBibG9jaykgPyBbdG9rZW5zLnJ0YWlsKCksIFNsaWNlLmdyb3VwKGJsb2NrKV0gOiBbdG9rZW5zLCBudWxsXVxuXHR9XG59XG5cbi8qKiBQYXJzZSBhIEJsb2NrIGFzIGEgc2luZ2xlIHZhbHVlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQmxvY2tXcmFwKHRva2Vucykge1xuXHRyZXR1cm4gbmV3IEJsb2NrV3JhcCh0b2tlbnMubG9jLCBwYXJzZUJsb2NrKHRva2VucykpXG59XG5cbi8qKlxuUGFyc2UgYSBibG9jaywgZmFpbGluZyBpZiB0aGVyZSdzIHNvbWV0aGluZyBwcmVjZWRpbmcgaXQuXG5AcGFyYW0ge0tleXdvcmRzfSBrZXl3b3JkS2luZCBLZXl3b3JkIHRoYXQgcHJlY2VkZXMgdGhlIGJsb2NrLiBVc2VkIGZvciBlcnJvciBtZXNzYWdlLlxuQHBhcmFtIHtTbGljZX0gdG9rZW5zIFRva2VucyB3aGljaCBzaG91bGQgaGF2ZSBhIGJsb2NrIGF0IHRoZSBlbmQuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGp1c3RCbG9jayhrZXl3b3JkS2luZCwgdG9rZW5zKSB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0Y2hlY2tFbXB0eShiZWZvcmUsICgpID0+XG5cdFx0YERpZCBub3QgZXhwZWN0IGFueXRoaW5nIGJldHdlZW4gJHtzaG93S2V5d29yZChrZXl3b3JkS2luZCl9IGFuZCBibG9jay5gKVxuXHRyZXR1cm4gYmxvY2tcbn1cblxuLyoqIFBhcnNlIGEgYmxvY2sgZnJvbSB0aGUgZW5kIG9mIGB0b2tlbnNgLCBmYWlsaW5nIGlmIHRoZXJlJ3Mgc29tZXRoaW5nIHByZWNlZGluZyBpdC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUp1c3RCbG9jayhrZXl3b3JkS2luZCwgdG9rZW5zKSB7XG5cdHJldHVybiBwYXJzZUJsb2NrKGp1c3RCbG9jayhrZXl3b3JkS2luZCwgdG9rZW5zKSlcbn1cbiJdfQ==
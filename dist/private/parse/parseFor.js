'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', '../util', './parse*', './parseBlock', './parseLocalDeclares'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./parse*'), require('./parseBlock'), require('./parseLocalDeclares'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.util, global.parse, global.parseBlock, global.parseLocalDeclares);
		global.parseFor = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _util, _parse, _parseBlock, _parseLocalDeclares) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.parseForDo = parseForDo;
	exports.parseForVal = parseForVal;
	exports.parseForBag = parseForBag;

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	function parseForDo(tokens) {
		return parseFor(_MsAst.ForDo, tokens);
	}

	function parseForVal(tokens) {
		return parseFor(_MsAst.ForVal, tokens);
	}

	function parseForBag(tokens) {
		var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const lines = _beforeAndBlock2[1];
		const block = (0, _parseBlock.parseBlockDo)(lines);
		if (block.lines.length === 1 && block.lines[0] instanceof _MsAst.Val) block.lines[0] = new _MsAst.BagEntry(block.lines[0].loc, block.lines[0]);
		return new _MsAst.ForBag(tokens.loc, parseOpIteratee(before), block);
	}

	function parseFor(ctr, tokens) {
		var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock4 = _slicedToArray(_beforeAndBlock3, 2);

		const before = _beforeAndBlock4[0];
		const block = _beforeAndBlock4[1];
		return new ctr(tokens.loc, parseOpIteratee(before), (0, _parseBlock.parseBlockDo)(block));
	}

	function parseOpIteratee(tokens) {
		return (0, _util.opIf)(!tokens.isEmpty(), () => {
			var _ifElse = (0, _util.ifElse)(tokens.opSplitOnce(_ => (0, _Token.isKeyword)(_Token.Keywords.Of, _)), _ref => {
				let before = _ref.before;
				let after = _ref.after;
				(0, _context.check)(before.size() === 1, before.loc, 'TODO: pattern in for');
				return [(0, _parseLocalDeclares.parseLocalDeclaresJustNames)(before)[0], (0, _parse.parseExpr)(after)];
			}, () => [_MsAst.LocalDeclare.focus(tokens.loc), (0, _parse.parseExpr)(tokens)]);

			var _ifElse2 = _slicedToArray(_ifElse, 2);

			const element = _ifElse2[0];
			const bag = _ifElse2[1];
			return new _MsAst.Iteratee(tokens.loc, element, bag);
		});
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRm9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQVNnQixVQUFVLEdBQVYsVUFBVTtTQUtWLFdBQVcsR0FBWCxXQUFXO1NBTVgsV0FBVyxHQUFYLFdBQVc7Ozs7VUFYWCxVQUFVOzs7O1VBS1YsV0FBVzs7OztVQU1YLFdBQVciLCJmaWxlIjoicGFyc2VGb3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtCYWdFbnRyeSwgRm9yRG8sIEZvckJhZywgRm9yVmFsLCBJdGVyYXRlZSwgTG9jYWxEZWNsYXJlLCBWYWx9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aWZFbHNlLCBvcElmfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtwYXJzZUV4cHJ9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IHtiZWZvcmVBbmRCbG9jaywgcGFyc2VCbG9ja0RvfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQge3BhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lc30gZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5cbi8qKiBQYXJzZSBhIHtAbGluayBGb3JEb30uICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VGb3JEbyh0b2tlbnMpIHtcblx0cmV0dXJuIHBhcnNlRm9yKEZvckRvLCB0b2tlbnMpXG59XG5cbi8qKiBQYXJzZSBhIHtAbGluayBGb3JWYWx9LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRm9yVmFsKHRva2Vucykge1xuXHRyZXR1cm4gcGFyc2VGb3IoRm9yVmFsLCB0b2tlbnMpXG59XG5cbi8vIFRPRE86IC0+IG91dC10eXBlXG4vKiogUGFyc2UgYSB7QGxpbmsgRm9yQmFnfS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUZvckJhZyh0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgbGluZXNdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRjb25zdCBibG9jayA9IHBhcnNlQmxvY2tEbyhsaW5lcylcblx0Ly8gVE9ETzogQmV0dGVyIHdheT9cblx0aWYgKGJsb2NrLmxpbmVzLmxlbmd0aCA9PT0gMSAmJiBibG9jay5saW5lc1swXSBpbnN0YW5jZW9mIFZhbClcblx0XHRibG9jay5saW5lc1swXSA9IG5ldyBCYWdFbnRyeShibG9jay5saW5lc1swXS5sb2MsIGJsb2NrLmxpbmVzWzBdKVxuXHRyZXR1cm4gbmV3IEZvckJhZyh0b2tlbnMubG9jLCBwYXJzZU9wSXRlcmF0ZWUoYmVmb3JlKSwgYmxvY2spXG59XG5cbmZ1bmN0aW9uIHBhcnNlRm9yKGN0ciwgdG9rZW5zKSB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0cmV0dXJuIG5ldyBjdHIodG9rZW5zLmxvYywgcGFyc2VPcEl0ZXJhdGVlKGJlZm9yZSksIHBhcnNlQmxvY2tEbyhibG9jaykpXG59XG5cbmZ1bmN0aW9uIHBhcnNlT3BJdGVyYXRlZSh0b2tlbnMpIHtcblx0cmV0dXJuIG9wSWYoIXRva2Vucy5pc0VtcHR5KCksICgpID0+IHtcblx0XHRjb25zdCBbZWxlbWVudCwgYmFnXSA9XG5cdFx0XHRpZkVsc2UodG9rZW5zLm9wU3BsaXRPbmNlKF8gPT4gaXNLZXl3b3JkKEtleXdvcmRzLk9mLCBfKSksXG5cdFx0XHRcdCh7YmVmb3JlLCBhZnRlcn0pID0+IHtcblx0XHRcdFx0XHRjaGVjayhiZWZvcmUuc2l6ZSgpID09PSAxLCBiZWZvcmUubG9jLCAnVE9ETzogcGF0dGVybiBpbiBmb3InKVxuXHRcdFx0XHRcdHJldHVybiBbcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKGJlZm9yZSlbMF0sIHBhcnNlRXhwcihhZnRlcildXG5cdFx0XHRcdH0sXG5cdFx0XHRcdCgpID0+IFtMb2NhbERlY2xhcmUuZm9jdXModG9rZW5zLmxvYyksIHBhcnNlRXhwcih0b2tlbnMpXSlcblx0XHRyZXR1cm4gbmV3IEl0ZXJhdGVlKHRva2Vucy5sb2MsIGVsZW1lbnQsIGJhZylcblx0fSlcbn1cbiJdfQ==
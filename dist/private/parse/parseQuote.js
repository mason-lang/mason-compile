'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../MsAst', '../Token', '../util', './parse*', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../MsAst'), require('../Token'), require('../util'), require('./parse*'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst, global.Token, global.util, global.parse, global.Slice);
		global.parseQuote = mod.exports;
	}
})(this, function (exports, _MsAst, _Token, _util, _parse, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseQuote;
	exports.parseRegExp = parseRegExp;

	var _Slice2 = _interopRequireDefault(_Slice);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function parseQuote(tokens) {
		return new _MsAst.QuotePlain(tokens.loc, parseParts(tokens));
	}

	function parseRegExp(tokens, flags) {
		return new _MsAst.MsRegExp(tokens.loc, parseParts(tokens), flags);
	}

	function parseParts(tokens) {
		return tokens.map(_ => {
			if (typeof _ === 'string') return _;else if (_ instanceof _Token.Name) return new _MsAst.LocalAccess(_.loc, _.name);else if ((0, _Token.isKeyword)(_Token.Keywords.Focus, _)) return _MsAst.LocalAccess.focus(_.loc);else {
				(0, _util.assert)((0, _Token.isGroup)(_Token.Groups.Interpolation, _));
				return (0, _parse.parseExpr)(_Slice2.default.group(_));
			}
		});
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlUXVvdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQU93QixVQUFVO1NBS2xCLFdBQVcsR0FBWCxXQUFXOzs7Ozs7Ozs7O1VBTEgsVUFBVTs7OztVQUtsQixXQUFXIiwiZmlsZSI6InBhcnNlUXVvdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xvY2FsQWNjZXNzLCBNc1JlZ0V4cCwgUXVvdGVQbGFpbn0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwcywgaXNHcm91cCwgaXNLZXl3b3JkLCBOYW1lLCBLZXl3b3Jkc30gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2Fzc2VydH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7cGFyc2VFeHByfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKiogUGFyc2UgYSB7QGxpbmsgUXVvdGVQbGFpbn0gZnJvbSBhIHtAbGluayBHcm91cHMuUXVvdGV9LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VRdW90ZSh0b2tlbnMpIHtcblx0cmV0dXJuIG5ldyBRdW90ZVBsYWluKHRva2Vucy5sb2MsIHBhcnNlUGFydHModG9rZW5zKSlcbn1cblxuLyoqIFBhcnNlIGFuIHtAbGluayBNc1JlZ0V4cH0gZnJvbSBhIHtAbGluayBHcm91cHMuUmVnRXhwfS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVJlZ0V4cCh0b2tlbnMsIGZsYWdzKSB7XG5cdHJldHVybiBuZXcgTXNSZWdFeHAodG9rZW5zLmxvYywgcGFyc2VQYXJ0cyh0b2tlbnMpLCBmbGFncylcbn1cblxuZnVuY3Rpb24gcGFyc2VQYXJ0cyh0b2tlbnMpIHtcblx0cmV0dXJuIHRva2Vucy5tYXAoXyA9PiB7XG5cdFx0aWYgKHR5cGVvZiBfID09PSAnc3RyaW5nJylcblx0XHRcdHJldHVybiBfXG5cdFx0ZWxzZSBpZiAoXyBpbnN0YW5jZW9mIE5hbWUpXG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsQWNjZXNzKF8ubG9jLCBfLm5hbWUpXG5cdFx0ZWxzZSBpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkZvY3VzLCBfKSlcblx0XHRcdHJldHVybiBMb2NhbEFjY2Vzcy5mb2N1cyhfLmxvYylcblx0XHRlbHNlIHtcblx0XHRcdGFzc2VydChpc0dyb3VwKEdyb3Vwcy5JbnRlcnBvbGF0aW9uLCBfKSlcblx0XHRcdHJldHVybiBwYXJzZUV4cHIoU2xpY2UuZ3JvdXAoXykpXG5cdFx0fVxuXHR9KVxufVxuIl19
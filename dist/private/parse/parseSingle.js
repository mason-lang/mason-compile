'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../MsAst', '../Token', '../util', './checks', './parseBlock', './parseQuote', './parse*', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parseBlock'), require('./parseQuote'), require('./parse*'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst, global.Token, global.util, global.checks, global.parseBlock, global.parseQuote, global.parse, global.Slice);
		global.parseSingle = mod.exports;
	}
})(this, function (exports, _MsAst, _Token, _util, _checks, _parseBlock, _parseQuote, _parse, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseSingle;

	var _parseQuote2 = _interopRequireDefault(_parseQuote);

	var _Slice2 = _interopRequireDefault(_Slice);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function parseSingle(token) {
		const loc = token.loc;
		if (token instanceof _Token.Name) return new _MsAst.LocalAccess(loc, token.name);else if (token instanceof _Token.Group) {
			const slice = _Slice2.default.group(token);

			switch (token.kind) {
				case _Token.Groups.Space:
					return (0, _parse.parseSpaced)(slice);

				case _Token.Groups.Parenthesis:
					return (0, _parse.parseExpr)(slice);

				case _Token.Groups.Bracket:
					return new _MsAst.BagSimple(loc, (0, _parse.parseExprParts)(slice));

				case _Token.Groups.Block:
					return (0, _parseBlock.parseBlockWrap)(slice);

				case _Token.Groups.Quote:
					return (0, _parseQuote2.default)(slice);

				default:
					throw new Error(token.kind);
			}
		} else if (token instanceof _MsAst.NumberLiteral) return token;else if (token instanceof _Token.Keyword) switch (token.kind) {
			case _Token.Keywords.Focus:
				return _MsAst.LocalAccess.focus(loc);

			default:
				return (0, _util.ifElse)((0, _Token.opKeywordKindToSpecialValueKind)(token.kind), _ => new _MsAst.SpecialVal(loc, _), () => (0, _checks.unexpected)(token));
		} else (0, _checks.unexpected)(token);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlU2luZ2xlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFVd0IsV0FBVzs7Ozs7Ozs7Ozs7O1VBQVgsV0FBVyIsImZpbGUiOiJwYXJzZVNpbmdsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QmFnU2ltcGxlLCBMb2NhbEFjY2VzcywgTnVtYmVyTGl0ZXJhbCwgU3BlY2lhbFZhbH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwLCBHcm91cHMsIE5hbWUsIG9wS2V5d29yZEtpbmRUb1NwZWNpYWxWYWx1ZUtpbmQsIEtleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aWZFbHNlfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHt1bmV4cGVjdGVkfSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7cGFyc2VCbG9ja1dyYXB9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZVF1b3RlIGZyb20gJy4vcGFyc2VRdW90ZSdcbmltcG9ydCB7cGFyc2VFeHByLCBwYXJzZUV4cHJQYXJ0cywgcGFyc2VTcGFjZWR9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8qKiBQYXJzZSBhIHNpbmdsZSB0b2tlbi4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlU2luZ2xlKHRva2VuKSB7XG5cdGNvbnN0IHtsb2N9ID0gdG9rZW5cblx0aWYgKHRva2VuIGluc3RhbmNlb2YgTmFtZSlcblx0XHRyZXR1cm4gbmV3IExvY2FsQWNjZXNzKGxvYywgdG9rZW4ubmFtZSlcblx0ZWxzZSBpZiAodG9rZW4gaW5zdGFuY2VvZiBHcm91cCkge1xuXHRcdGNvbnN0IHNsaWNlID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRjYXNlIEdyb3Vwcy5TcGFjZTpcblx0XHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkKHNsaWNlKVxuXHRcdFx0Y2FzZSBHcm91cHMuUGFyZW50aGVzaXM6XG5cdFx0XHRcdHJldHVybiBwYXJzZUV4cHIoc2xpY2UpXG5cdFx0XHRjYXNlIEdyb3Vwcy5CcmFja2V0OlxuXHRcdFx0XHRyZXR1cm4gbmV3IEJhZ1NpbXBsZShsb2MsIHBhcnNlRXhwclBhcnRzKHNsaWNlKSlcblx0XHRcdGNhc2UgR3JvdXBzLkJsb2NrOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VCbG9ja1dyYXAoc2xpY2UpXG5cdFx0XHRjYXNlIEdyb3Vwcy5RdW90ZTpcblx0XHRcdFx0cmV0dXJuIHBhcnNlUXVvdGUoc2xpY2UpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IodG9rZW4ua2luZClcblx0XHR9XG5cdH0gZWxzZSBpZiAodG9rZW4gaW5zdGFuY2VvZiBOdW1iZXJMaXRlcmFsKVxuXHRcdHJldHVybiB0b2tlblxuXHRlbHNlIGlmICh0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRjYXNlIEtleXdvcmRzLkZvY3VzOlxuXHRcdFx0XHRyZXR1cm4gTG9jYWxBY2Nlc3MuZm9jdXMobG9jKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIGlmRWxzZShvcEtleXdvcmRLaW5kVG9TcGVjaWFsVmFsdWVLaW5kKHRva2VuLmtpbmQpLFxuXHRcdFx0XHRcdF8gPT4gbmV3IFNwZWNpYWxWYWwobG9jLCBfKSxcblx0XHRcdFx0XHQoKSA9PiB1bmV4cGVjdGVkKHRva2VuKSlcblx0XHR9XG5cdGVsc2Vcblx0XHR1bmV4cGVjdGVkKHRva2VuKVxufVxuIl19
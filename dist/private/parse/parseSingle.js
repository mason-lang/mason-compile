(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', '../MsAst', '../Token', '../util', './checks', './parseBlock', './parseQuote', './parse*', './Slice'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parseBlock'), require('./parseQuote'), require('./parse*'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.MsAst, global.Token, global.util, global.checks, global.parseBlock, global.parseQuote, global.parse, global.Slice);
		global.parseSingle = mod.exports;
	}
})(this, function (exports, module, _MsAst, _Token, _util, _checks, _parseBlock, _parseQuote, _parse, _Slice) {
	'use strict';

	module.exports = parseSingle;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseQuote2 = _interopRequireDefault(_parseQuote);

	var _Slice2 = _interopRequireDefault(_Slice);

	/**
 Parse a single token.
 @return {Val}
 */

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlU2luZ2xlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztrQkFhd0IsV0FBVzs7Ozs7Ozs7Ozs7OztBQUFwQixVQUFTLFdBQVcsQ0FBQyxLQUFLLEVBQUU7UUFDbkMsR0FBRyxHQUFJLEtBQUssQ0FBWixHQUFHOztBQUNWLE1BQUksS0FBSyxtQkFkYSxJQUFJLEFBY0QsRUFDeEIsT0FBTyxXQWhCVSxXQUFXLENBZ0JMLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUEsS0FDbkMsSUFBSSxLQUFLLG1CQWhCUCxLQUFLLEFBZ0JtQixFQUFFO0FBQ2hDLFNBQU0sS0FBSyxHQUFHLGdCQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUNoQyxXQUFRLEtBQUssQ0FBQyxJQUFJO0FBQ2pCLFNBQUssT0FuQk8sTUFBTSxDQW1CTixLQUFLO0FBQ2hCLFlBQU8sV0Fmd0IsV0FBVyxFQWV2QixLQUFLLENBQUMsQ0FBQTtBQUFBLEFBQzFCLFNBQUssT0FyQk8sTUFBTSxDQXFCTixXQUFXO0FBQ3RCLFlBQU8sV0FqQkgsU0FBUyxFQWlCSSxLQUFLLENBQUMsQ0FBQTtBQUFBLEFBQ3hCLFNBQUssT0F2Qk8sTUFBTSxDQXVCTixPQUFPO0FBQ2xCLFlBQU8sV0F6QkgsU0FBUyxDQXlCUSxHQUFHLEVBQUUsV0FuQlgsY0FBYyxFQW1CWSxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQUEsQUFDakQsU0FBSyxPQXpCTyxNQUFNLENBeUJOLEtBQUs7QUFDaEIsWUFBTyxnQkF2QkgsY0FBYyxFQXVCSSxLQUFLLENBQUMsQ0FBQTtBQUFBLEFBQzdCLFNBQUssT0EzQk8sTUFBTSxDQTJCTixLQUFLO0FBQ2hCLFlBQU8sMEJBQVcsS0FBSyxDQUFDLENBQUE7QUFBQSxBQUN6QjtBQUNDLFdBQU0sSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQUEsSUFDNUI7R0FDRCxNQUFNLElBQUksS0FBSyxtQkFqQ2UsYUFBYSxBQWlDSCxFQUN4QyxPQUFPLEtBQUssQ0FBQSxLQUNSLElBQUksS0FBSyxtQkFsQytDLE9BQU8sQUFrQ25DLEVBQ2hDLFFBQVEsS0FBSyxDQUFDLElBQUk7QUFDakIsUUFBSyxPQXBDK0QsUUFBUSxDQW9DOUQsS0FBSztBQUNsQixXQUFPLE9BdENRLFdBQVcsQ0FzQ1AsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQUEsQUFDOUI7QUFDQyxXQUFPLFVBdENILE1BQU0sRUFzQ0ksV0F2Q1csK0JBQStCLEVBdUNWLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFDeEQsQ0FBQyxJQUFJLFdBekNxQyxVQUFVLENBeUNoQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQzNCLE1BQU0sWUF2Q0gsVUFBVSxFQXVDSSxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQUEsR0FDMUIsTUFFRCxZQTFDTSxVQUFVLEVBMENMLEtBQUssQ0FBQyxDQUFBO0VBQ2xCIiwiZmlsZSI6InBhcnNlU2luZ2xlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtCYWdTaW1wbGUsIExvY2FsQWNjZXNzLCBOdW1iZXJMaXRlcmFsLCBTcGVjaWFsVmFsfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXAsIEdyb3VwcywgTmFtZSwgb3BLZXl3b3JkS2luZFRvU3BlY2lhbFZhbHVlS2luZCwgS2V5d29yZCwgS2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtpZkVsc2V9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge3VuZXhwZWN0ZWR9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtwYXJzZUJsb2NrV3JhcH0gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlUXVvdGUgZnJvbSAnLi9wYXJzZVF1b3RlJ1xuaW1wb3J0IHtwYXJzZUV4cHIsIHBhcnNlRXhwclBhcnRzLCBwYXJzZVNwYWNlZH0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLyoqXG5QYXJzZSBhIHNpbmdsZSB0b2tlbi5cbkByZXR1cm4ge1ZhbH1cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZVNpbmdsZSh0b2tlbikge1xuXHRjb25zdCB7bG9jfSA9IHRva2VuXG5cdGlmICh0b2tlbiBpbnN0YW5jZW9mIE5hbWUpXG5cdFx0cmV0dXJuIG5ldyBMb2NhbEFjY2Vzcyhsb2MsIHRva2VuLm5hbWUpXG5cdGVsc2UgaWYgKHRva2VuIGluc3RhbmNlb2YgR3JvdXApIHtcblx0XHRjb25zdCBzbGljZSA9IFNsaWNlLmdyb3VwKHRva2VuKVxuXHRcdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdFx0Y2FzZSBHcm91cHMuU3BhY2U6XG5cdFx0XHRcdHJldHVybiBwYXJzZVNwYWNlZChzbGljZSlcblx0XHRcdGNhc2UgR3JvdXBzLlBhcmVudGhlc2lzOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VFeHByKHNsaWNlKVxuXHRcdFx0Y2FzZSBHcm91cHMuQnJhY2tldDpcblx0XHRcdFx0cmV0dXJuIG5ldyBCYWdTaW1wbGUobG9jLCBwYXJzZUV4cHJQYXJ0cyhzbGljZSkpXG5cdFx0XHRjYXNlIEdyb3Vwcy5CbG9jazpcblx0XHRcdFx0cmV0dXJuIHBhcnNlQmxvY2tXcmFwKHNsaWNlKVxuXHRcdFx0Y2FzZSBHcm91cHMuUXVvdGU6XG5cdFx0XHRcdHJldHVybiBwYXJzZVF1b3RlKHNsaWNlKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKHRva2VuLmtpbmQpXG5cdFx0fVxuXHR9IGVsc2UgaWYgKHRva2VuIGluc3RhbmNlb2YgTnVtYmVyTGl0ZXJhbClcblx0XHRyZXR1cm4gdG9rZW5cblx0ZWxzZSBpZiAodG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5Gb2N1czpcblx0XHRcdFx0cmV0dXJuIExvY2FsQWNjZXNzLmZvY3VzKGxvYylcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBpZkVsc2Uob3BLZXl3b3JkS2luZFRvU3BlY2lhbFZhbHVlS2luZCh0b2tlbi5raW5kKSxcblx0XHRcdFx0XHRfID0+IG5ldyBTcGVjaWFsVmFsKGxvYywgXyksXG5cdFx0XHRcdFx0KCkgPT4gdW5leHBlY3RlZCh0b2tlbikpXG5cdFx0fVxuXHRlbHNlXG5cdFx0dW5leHBlY3RlZCh0b2tlbilcbn1cbiJdfQ==
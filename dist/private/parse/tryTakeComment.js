(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', '../Token', '../util'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('../Token'), require('../util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.Token, global.util);
		global.tryTakeComment = mod.exports;
	}
})(this, function (exports, module, _Token, _util) {
	'use strict';

	module.exports = tryTakeComment;

	/**
 Takes DocComment lines and puts them into a comment.
 @return {?string}
 */

	function tryTakeComment(lines) {
		let comments = [];
		let rest = lines;

		while (true) {
			if (rest.isEmpty()) break;

			const hs = rest.headSlice();
			const h = hs.head();
			if (!(h instanceof _Token.DocComment)) break;

			(0, _util.assert)(hs.size() === 1);
			comments.push(h);
			rest = rest.tail();
		}

		return [(0, _util.isEmpty)(comments) ? null : comments.map(_ => _.text).join('\n'), rest];
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3RyeVRha2VDb21tZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztrQkFPd0IsY0FBYzs7Ozs7OztBQUF2QixVQUFTLGNBQWMsQ0FBQyxLQUFLLEVBQUU7QUFDN0MsTUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFBO0FBQ2pCLE1BQUksSUFBSSxHQUFHLEtBQUssQ0FBQTs7QUFFaEIsU0FBTyxJQUFJLEVBQUU7QUFDWixPQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFDakIsTUFBSzs7QUFFTixTQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7QUFDM0IsU0FBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ25CLE9BQUksRUFBRSxDQUFDLG1CQWpCRCxVQUFVLENBaUJhLEFBQUMsRUFDN0IsTUFBSzs7QUFFTixhQW5CTSxNQUFNLEVBbUJMLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQTtBQUN2QixXQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2hCLE9BQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7R0FDbEI7O0FBRUQsU0FBTyxDQUFDLFVBeEJPLE9BQU8sRUF3Qk4sUUFBUSxDQUFDLEdBQUcsSUFBSSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7RUFDOUUiLCJmaWxlIjoidHJ5VGFrZUNvbW1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RvY0NvbW1lbnR9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHthc3NlcnQsIGlzRW1wdHl9IGZyb20gJy4uL3V0aWwnXG5cbi8qKlxuVGFrZXMgRG9jQ29tbWVudCBsaW5lcyBhbmQgcHV0cyB0aGVtIGludG8gYSBjb21tZW50LlxuQHJldHVybiB7P3N0cmluZ31cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cnlUYWtlQ29tbWVudChsaW5lcykge1xuXHRsZXQgY29tbWVudHMgPSBbXVxuXHRsZXQgcmVzdCA9IGxpbmVzXG5cblx0d2hpbGUgKHRydWUpIHtcblx0XHRpZiAocmVzdC5pc0VtcHR5KCkpXG5cdFx0XHRicmVha1xuXG5cdFx0Y29uc3QgaHMgPSByZXN0LmhlYWRTbGljZSgpXG5cdFx0Y29uc3QgaCA9IGhzLmhlYWQoKVxuXHRcdGlmICghKGggaW5zdGFuY2VvZiBEb2NDb21tZW50KSlcblx0XHRcdGJyZWFrXG5cblx0XHRhc3NlcnQoaHMuc2l6ZSgpID09PSAxKVxuXHRcdGNvbW1lbnRzLnB1c2goaClcblx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0fVxuXG5cdHJldHVybiBbaXNFbXB0eShjb21tZW50cykgPyBudWxsIDogY29tbWVudHMubWFwKF8gPT4gXy50ZXh0KS5qb2luKCdcXG4nKSwgcmVzdF1cbn1cbiJdfQ==
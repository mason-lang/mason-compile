if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../Token', '../util'], function (exports, module, _Token, _util) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyeVRha2VDb21tZW50LmpzIiwicHJpdmF0ZS9wYXJzZS90cnlUYWtlQ29tbWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2tCQ093QixjQUFjOzs7Ozs7O0FBQXZCLFVBQVMsY0FBYyxDQUFDLEtBQUssRUFBRTtBQUM3QyxNQUFJLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDakIsTUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFBOztBQUVoQixTQUFPLElBQUksRUFBRTtBQUNaLE9BQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUNqQixNQUFLOztBQUVOLFNBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUMzQixTQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDbkIsT0FBSSxFQUFFLENBQUMsbUJBakJELFVBQVUsQ0FpQmEsQUFBQyxFQUM3QixNQUFLOztBQUVOLGFBbkJNLE1BQU0sRUFtQkwsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQ3ZCLFdBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDaEIsT0FBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtHQUNsQjs7QUFFRCxTQUFPLENBQUMsVUF4Qk8sT0FBTyxFQXdCTixRQUFRLENBQUMsR0FBRyxJQUFJLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtFQUM5RSIsImZpbGUiOiJwcml2YXRlL3BhcnNlL3RyeVRha2VDb21tZW50LmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge0RvY0NvbW1lbnR9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHthc3NlcnQsIGlzRW1wdHl9IGZyb20gJy4uL3V0aWwnXG5cbi8qKlxuVGFrZXMgRG9jQ29tbWVudCBsaW5lcyBhbmQgcHV0cyB0aGVtIGludG8gYSBjb21tZW50LlxuQHJldHVybiB7P3N0cmluZ31cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cnlUYWtlQ29tbWVudChsaW5lcykge1xuXHRsZXQgY29tbWVudHMgPSBbXVxuXHRsZXQgcmVzdCA9IGxpbmVzXG5cblx0d2hpbGUgKHRydWUpIHtcblx0XHRpZiAocmVzdC5pc0VtcHR5KCkpXG5cdFx0XHRicmVha1xuXG5cdFx0Y29uc3QgaHMgPSByZXN0LmhlYWRTbGljZSgpXG5cdFx0Y29uc3QgaCA9IGhzLmhlYWQoKVxuXHRcdGlmICghKGggaW5zdGFuY2VvZiBEb2NDb21tZW50KSlcblx0XHRcdGJyZWFrXG5cblx0XHRhc3NlcnQoaHMuc2l6ZSgpID09PSAxKVxuXHRcdGNvbW1lbnRzLnB1c2goaClcblx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0fVxuXG5cdHJldHVybiBbaXNFbXB0eShjb21tZW50cykgPyBudWxsIDogY29tbWVudHMubWFwKF8gPT4gXy50ZXh0KS5qb2luKCdcXG4nKSwgcmVzdF1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

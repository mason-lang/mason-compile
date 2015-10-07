if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../Token', '../util'], function (exports, module, _Token, _util) {
	'use strict';

	module.exports = lines => {
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
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyeVRha2VDb21tZW50LmpzIiwicHJpdmF0ZS9wYXJzZS90cnlUYWtlQ29tbWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2tCQ0dlLEtBQUssSUFBSTtBQUN2QixNQUFJLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDakIsTUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFBOztBQUVoQixTQUFPLElBQUksRUFBRTtBQUNaLE9BQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUNqQixNQUFLOztBQUVOLFNBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUMzQixTQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDbkIsT0FBSSxFQUFFLENBQUMsbUJBYkQsVUFBVSxDQWFhLEFBQUMsRUFDN0IsTUFBSzs7QUFFTixhQWZNLE1BQU0sRUFlTCxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFDdkIsV0FBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNoQixPQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO0dBQ2xCOztBQUVELFNBQU8sQ0FBQyxVQXBCTyxPQUFPLEVBb0JOLFFBQVEsQ0FBQyxHQUFHLElBQUksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO0VBQzlFIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvdHJ5VGFrZUNvbW1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7RG9jQ29tbWVudH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2Fzc2VydCwgaXNFbXB0eX0gZnJvbSAnLi4vdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgbGluZXMgPT4ge1xuXHRsZXQgY29tbWVudHMgPSBbXVxuXHRsZXQgcmVzdCA9IGxpbmVzXG5cblx0d2hpbGUgKHRydWUpIHtcblx0XHRpZiAocmVzdC5pc0VtcHR5KCkpXG5cdFx0XHRicmVha1xuXG5cdFx0Y29uc3QgaHMgPSByZXN0LmhlYWRTbGljZSgpXG5cdFx0Y29uc3QgaCA9IGhzLmhlYWQoKVxuXHRcdGlmICghKGggaW5zdGFuY2VvZiBEb2NDb21tZW50KSlcblx0XHRcdGJyZWFrXG5cblx0XHRhc3NlcnQoaHMuc2l6ZSgpID09PSAxKVxuXHRcdGNvbW1lbnRzLnB1c2goaClcblx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0fVxuXG5cdHJldHVybiBbaXNFbXB0eShjb21tZW50cykgPyBudWxsIDogY29tbWVudHMubWFwKF8gPT4gXy50ZXh0KS5qb2luKCdcXG4nKSwgcmVzdF1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

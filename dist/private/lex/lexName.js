'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', '../context', '../Token', '../util', './chars', './groupContext', './sourceContext'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('../context'), require('../Token'), require('../util'), require('./chars'), require('./groupContext'), require('./sourceContext'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.context, global.Token, global.util, global.chars, global.groupContext, global.sourceContext);
		global.lexName = mod.exports;
	}
})(this, function (exports, _Loc, _context, _Token, _util, _chars, _groupContext, _sourceContext) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = lexName;

	var _Loc2 = _interopRequireDefault(_Loc);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function lexName(startPos, isInterpolation) {
		const name = (0, _sourceContext.takeWhileWithPrev)(_chars.isNameCharacter);

		if (name.endsWith('_')) {
			if (name.length > 1) handleNameText(startPos, name.slice(0, name.length - 1), false);
			keyword((0, _sourceContext.pos)(), _Token.Keywords.Focus);
		} else handleNameText(startPos, name, !isInterpolation);
	}

	function handleNameText(startPos, name, allowSpecialKeywords) {
		(0, _util.ifElse)((0, _Token.opKeywordKindFromName)(name), kind => {
			switch (kind) {
				case _Token.Keywords.Region:
				case _Token.Keywords.Todo:
					(0, _context.check)(allowSpecialKeywords, startPos, 'noSpecialKeyword', kind);
					(0, _sourceContext.skipRestOfLine)();
					if (kind === _Token.Keywords.Region) keyword(startPos, _Token.Keywords.Region);
					break;

				default:
					keyword(startPos, kind);
			}
		}, () => {
			(0, _groupContext.addToCurrentGroup)(new _Token.Name(new _Loc2.default(startPos, (0, _sourceContext.pos)()), name));
		});
	}

	function keyword(startPos, kind) {
		(0, _groupContext.addToCurrentGroup)(new _Token.Keyword(new _Loc2.default(startPos, (0, _sourceContext.pos)()), kind));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXhOYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFjd0IsT0FBTzs7Ozs7Ozs7OztVQUFQLE9BQU8iLCJmaWxlIjoibGV4TmFtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2MgZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtOYW1lLCBLZXl3b3JkLCBLZXl3b3Jkcywgb3BLZXl3b3JkS2luZEZyb21OYW1lfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aWZFbHNlfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtpc05hbWVDaGFyYWN0ZXJ9IGZyb20gJy4vY2hhcnMnXG5pbXBvcnQge2FkZFRvQ3VycmVudEdyb3VwfSBmcm9tICcuL2dyb3VwQ29udGV4dCdcbmltcG9ydCB7cG9zLCBza2lwUmVzdE9mTGluZSwgdGFrZVdoaWxlV2l0aFByZXZ9IGZyb20gJy4vc291cmNlQ29udGV4dCdcblxuLyoqXG5UaGlzIGlzIGNhbGxlZCAqYWZ0ZXIqIGhhdmluZyBlYXRlbiB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBuYW1lLlxuQHBhcmFtIHtQb3N9IHN0YXJ0UG9zIFBvc2l0aW9uIG9mIGZpcnN0IGNoYXJhY3Rlci5cbkBwYXJhbSB7Ym9vbGVhbn0gaXNJbnRlcnBvbGF0aW9uXG5cdFdoZXRoZXIgdGhpcyBpcyBhIHF1b3RlIGludGVycG9sYXRpb24gbmFtZSBsaWtlIGAjZm9vYC5cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBsZXhOYW1lKHN0YXJ0UG9zLCBpc0ludGVycG9sYXRpb24pIHtcblx0Y29uc3QgbmFtZSA9IHRha2VXaGlsZVdpdGhQcmV2KGlzTmFtZUNoYXJhY3Rlcilcblx0aWYgKG5hbWUuZW5kc1dpdGgoJ18nKSkge1xuXHRcdGlmIChuYW1lLmxlbmd0aCA+IDEpXG5cdFx0XHRoYW5kbGVOYW1lVGV4dChzdGFydFBvcywgbmFtZS5zbGljZSgwLCBuYW1lLmxlbmd0aCAtIDEpLCBmYWxzZSlcblx0XHRrZXl3b3JkKHBvcygpLCBLZXl3b3Jkcy5Gb2N1cylcblx0fSBlbHNlXG5cdFx0aGFuZGxlTmFtZVRleHQoc3RhcnRQb3MsIG5hbWUsICFpc0ludGVycG9sYXRpb24pXG59XG5cbmZ1bmN0aW9uIGhhbmRsZU5hbWVUZXh0KHN0YXJ0UG9zLCBuYW1lLCBhbGxvd1NwZWNpYWxLZXl3b3Jkcykge1xuXHRpZkVsc2Uob3BLZXl3b3JkS2luZEZyb21OYW1lKG5hbWUpLFxuXHRcdGtpbmQgPT4ge1xuXHRcdFx0c3dpdGNoIChraW5kKSB7XG5cdFx0XHRcdGNhc2UgS2V5d29yZHMuUmVnaW9uOiBjYXNlIEtleXdvcmRzLlRvZG86XG5cdFx0XHRcdFx0Y2hlY2soYWxsb3dTcGVjaWFsS2V5d29yZHMsIHN0YXJ0UG9zLCAnbm9TcGVjaWFsS2V5d29yZCcsIGtpbmQpXG5cdFx0XHRcdFx0c2tpcFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRcdGlmIChraW5kID09PSBLZXl3b3Jkcy5SZWdpb24pXG5cdFx0XHRcdFx0XHRrZXl3b3JkKHN0YXJ0UG9zLCBLZXl3b3Jkcy5SZWdpb24pXG5cdFx0XHRcdFx0Ly8gdG9kbzogd2FybiBmb3IgYWxsIHRvZG8gY29tbWVudHNcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdGtleXdvcmQoc3RhcnRQb3MsIGtpbmQpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHQoKSA9PiB7XG5cdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgTmFtZShuZXcgTG9jKHN0YXJ0UG9zLCBwb3MoKSksIG5hbWUpKVxuXHRcdH0pXG59XG5cbmZ1bmN0aW9uIGtleXdvcmQoc3RhcnRQb3MsIGtpbmQpIHtcblx0YWRkVG9DdXJyZW50R3JvdXAobmV3IEtleXdvcmQobmV3IExvYyhzdGFydFBvcywgcG9zKCkpLCBraW5kKSlcbn1cbiJdfQ==
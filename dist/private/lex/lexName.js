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
					(0, _context.check)(allowSpecialKeywords, startPos, () => `${ (0, _Token.showKeyword)(kind) } is not allowed here.`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXhOYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFjd0IsT0FBTzs7Ozs7Ozs7OztVQUFQLE9BQU8iLCJmaWxlIjoibGV4TmFtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2MgZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtOYW1lLCBLZXl3b3JkLCBLZXl3b3Jkcywgb3BLZXl3b3JkS2luZEZyb21OYW1lLCBzaG93S2V5d29yZH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2lmRWxzZX0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7aXNOYW1lQ2hhcmFjdGVyfSBmcm9tICcuL2NoYXJzJ1xuaW1wb3J0IHthZGRUb0N1cnJlbnRHcm91cH0gZnJvbSAnLi9ncm91cENvbnRleHQnXG5pbXBvcnQge3Bvcywgc2tpcFJlc3RPZkxpbmUsIHRha2VXaGlsZVdpdGhQcmV2fSBmcm9tICcuL3NvdXJjZUNvbnRleHQnXG5cbi8qKlxuVGhpcyBpcyBjYWxsZWQgKmFmdGVyKiBoYXZpbmcgZWF0ZW4gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbmFtZS5cbkBwYXJhbSB7UG9zfSBzdGFydFBvcyBQb3NpdGlvbiBvZiBmaXJzdCBjaGFyYWN0ZXIuXG5AcGFyYW0ge2Jvb2xlYW59IGlzSW50ZXJwb2xhdGlvblxuXHRXaGV0aGVyIHRoaXMgaXMgYSBxdW90ZSBpbnRlcnBvbGF0aW9uIG5hbWUgbGlrZSBgI2Zvb2AuXG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbGV4TmFtZShzdGFydFBvcywgaXNJbnRlcnBvbGF0aW9uKSB7XG5cdGNvbnN0IG5hbWUgPSB0YWtlV2hpbGVXaXRoUHJldihpc05hbWVDaGFyYWN0ZXIpXG5cdGlmIChuYW1lLmVuZHNXaXRoKCdfJykpIHtcblx0XHRpZiAobmFtZS5sZW5ndGggPiAxKVxuXHRcdFx0aGFuZGxlTmFtZVRleHQoc3RhcnRQb3MsIG5hbWUuc2xpY2UoMCwgbmFtZS5sZW5ndGggLSAxKSwgZmFsc2UpXG5cdFx0a2V5d29yZChwb3MoKSwgS2V5d29yZHMuRm9jdXMpXG5cdH0gZWxzZVxuXHRcdGhhbmRsZU5hbWVUZXh0KHN0YXJ0UG9zLCBuYW1lLCAhaXNJbnRlcnBvbGF0aW9uKVxufVxuXG5mdW5jdGlvbiBoYW5kbGVOYW1lVGV4dChzdGFydFBvcywgbmFtZSwgYWxsb3dTcGVjaWFsS2V5d29yZHMpIHtcblx0aWZFbHNlKG9wS2V5d29yZEtpbmRGcm9tTmFtZShuYW1lKSxcblx0XHRraW5kID0+IHtcblx0XHRcdHN3aXRjaCAoa2luZCkge1xuXHRcdFx0XHRjYXNlIEtleXdvcmRzLlJlZ2lvbjogY2FzZSBLZXl3b3Jkcy5Ub2RvOlxuXHRcdFx0XHRcdGNoZWNrKGFsbG93U3BlY2lhbEtleXdvcmRzLCBzdGFydFBvcywgKCkgPT5cblx0XHRcdFx0XHRcdGAke3Nob3dLZXl3b3JkKGtpbmQpfSBpcyBub3QgYWxsb3dlZCBoZXJlLmApXG5cdFx0XHRcdFx0c2tpcFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRcdGlmIChraW5kID09PSBLZXl3b3Jkcy5SZWdpb24pXG5cdFx0XHRcdFx0XHRrZXl3b3JkKHN0YXJ0UG9zLCBLZXl3b3Jkcy5SZWdpb24pXG5cdFx0XHRcdFx0Ly8gdG9kbzogd2FybiBmb3IgYWxsIHRvZG8gY29tbWVudHNcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdGtleXdvcmQoc3RhcnRQb3MsIGtpbmQpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHQoKSA9PiB7XG5cdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgTmFtZShuZXcgTG9jKHN0YXJ0UG9zLCBwb3MoKSksIG5hbWUpKVxuXHRcdH0pXG59XG5cbmZ1bmN0aW9uIGtleXdvcmQoc3RhcnRQb3MsIGtpbmQpIHtcblx0YWRkVG9DdXJyZW50R3JvdXAobmV3IEtleXdvcmQobmV3IExvYyhzdGFydFBvcywgcG9zKCkpLCBraW5kKSlcbn1cbiJdfQ==
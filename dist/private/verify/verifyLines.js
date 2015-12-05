'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../util', './context', './locals', './SK'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../util'), require('./context'), require('./locals'), require('./SK'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.util, global.context, global.locals, global.SK);
		global.verifyLines = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _util, _context2, _locals, _SK) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = verifyLines;

	var _SK2 = _interopRequireDefault(_SK);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function verifyLines(lines) {
		const newLocals = [];

		for (const line of (0, _util.reverseIter)(lines)) for (const _ of (0, _util.reverseIter)(lineNewLocals(line))) {
			(0, _locals.registerLocal)(_);
			newLocals.push(_);
		}

		_context2.pendingBlockLocals.push(...newLocals);

		const thisBlockLocalNames = new Set();
		const shadowed = [];

		for (const line of lines) {
			line.verify(_SK2.default.Do);

			for (const newLocal of lineNewLocals(line)) {
				const name = newLocal.name;
				const loc = newLocal.loc;

				const oldLocal = _context2.locals.get(name);

				if (oldLocal !== undefined) {
					(0, _context.check)(!thisBlockLocalNames.has(name), loc, 'duplicateLocal', name);
					shadowed.push(oldLocal);
				}

				thisBlockLocalNames.add(name);
				(0, _locals.setLocal)(newLocal);

				const popped = _context2.pendingBlockLocals.pop();

				(0, _util.assert)(popped === newLocal);
			}
		}

		newLocals.forEach(_locals.deleteLocal);
		shadowed.forEach(_locals.setLocal);
		return newLocals;
	}

	function lineNewLocals(line) {
		return line instanceof _MsAst.AssignSingle ? [line.assignee] : line instanceof _MsAst.AssignDestructure ? line.assignees : line instanceof _MsAst.ObjEntry ? lineNewLocals(line.assign) : [];
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnlMaW5lcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBV3dCLFdBQVc7Ozs7Ozs7Ozs7VUFBWCxXQUFXIiwiZmlsZSI6InZlcmlmeUxpbmVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVja30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7QXNzaWduRGVzdHJ1Y3R1cmUsIEFzc2lnblNpbmdsZSwgT2JqRW50cnl9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHthc3NlcnQsIHJldmVyc2VJdGVyfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtsb2NhbHMsIHBlbmRpbmdCbG9ja0xvY2Fsc30gZnJvbSAnLi9jb250ZXh0J1xuaW1wb3J0IHtkZWxldGVMb2NhbCwgcmVnaXN0ZXJMb2NhbCwgc2V0TG9jYWx9IGZyb20gJy4vbG9jYWxzJ1xuaW1wb3J0IFNLIGZyb20gJy4vU0snXG5cbi8qKlxuVmVyaWZpZXMgZWFjaCBsaW5lLCBhY2N1bXVsYXRpbmcgbG9jYWxzLlxuQHJldHVybiBMaXN0IG9mIGV2ZXJ5IG5ldyBsb2NhbCBmcm9tIGBsaW5lc2AuXG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdmVyaWZ5TGluZXMobGluZXMpIHtcblx0Lypcblx0V2UgbmVlZCB0byBnZXQgYWxsIGJsb2NrIGxvY2FscyB1cC1mcm9udCBiZWNhdXNlXG5cdEZ1bmN0aW9ucyB3aXRoaW4gbGluZXMgY2FuIGFjY2VzcyBsb2NhbHMgZnJvbSBsYXRlciBsaW5lcy5cblx0Tk9URTogV2UgcHVzaCB0aGVzZSBvbnRvIHBlbmRpbmdCbG9ja0xvY2FscyBpbiByZXZlcnNlXG5cdHNvIHRoYXQgd2hlbiB3ZSBpdGVyYXRlIHRocm91Z2ggbGluZXMgZm9yd2FyZHMsIHdlIGNhbiBwb3AgZnJvbSBwZW5kaW5nQmxvY2tMb2NhbHNcblx0dG8gcmVtb3ZlIHBlbmRpbmcgbG9jYWxzIGFzIHRoZXkgYmVjb21lIHJlYWwgbG9jYWxzLlxuXHRJdCBkb2Vzbid0IHJlYWxseSBtYXR0ZXIgd2hhdCBvcmRlciB3ZSBhZGQgbG9jYWxzIGluIHNpbmNlIGl0J3Mgbm90IGFsbG93ZWRcblx0dG8gaGF2ZSB0d28gbG9jYWxzIG9mIHRoZSBzYW1lIG5hbWUgaW4gdGhlIHNhbWUgYmxvY2suXG5cdCovXG5cdGNvbnN0IG5ld0xvY2FscyA9IFtdXG5cblx0Zm9yIChjb25zdCBsaW5lIG9mIHJldmVyc2VJdGVyKGxpbmVzKSlcblx0XHRmb3IgKGNvbnN0IF8gb2YgcmV2ZXJzZUl0ZXIobGluZU5ld0xvY2FscyhsaW5lKSkpIHtcblx0XHRcdC8vIFJlZ2lzdGVyIHRoZSBsb2NhbCBub3cuIENhbid0IHdhaXQgdW50aWwgdGhlIGFzc2lnbiBpcyB2ZXJpZmllZC5cblx0XHRcdHJlZ2lzdGVyTG9jYWwoXylcblx0XHRcdG5ld0xvY2Fscy5wdXNoKF8pXG5cdFx0fVxuXG5cdHBlbmRpbmdCbG9ja0xvY2Fscy5wdXNoKC4uLm5ld0xvY2FscylcblxuXHQvKlxuXHRLZWVwcyB0cmFjayBvZiBsb2NhbHMgd2hpY2ggaGF2ZSBhbHJlYWR5IGJlZW4gYWRkZWQgaW4gdGhpcyBibG9jay5cblx0TWFzb24gYWxsb3dzIHNoYWRvd2luZywgYnV0IG5vdCB3aXRoaW4gdGhlIHNhbWUgYmxvY2suXG5cdFNvLCB0aGlzIGlzIGFsbG93ZWQ6XG5cdFx0YSA9IDFcblx0XHRiID1cblx0XHRcdGEgPSAyXG5cdFx0XHQuLi5cblx0QnV0IG5vdDpcblx0XHRhID0gMVxuXHRcdGEgPSAyXG5cdCovXG5cdGNvbnN0IHRoaXNCbG9ja0xvY2FsTmFtZXMgPSBuZXcgU2V0KClcblxuXHQvLyBBbGwgc2hhZG93ZWQgbG9jYWxzIGZvciB0aGlzIGJsb2NrLlxuXHRjb25zdCBzaGFkb3dlZCA9IFtdXG5cblx0Zm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG5cdFx0bGluZS52ZXJpZnkoU0suRG8pXG5cdFx0Zm9yIChjb25zdCBuZXdMb2NhbCBvZiBsaW5lTmV3TG9jYWxzKGxpbmUpKSB7XG5cdFx0XHRjb25zdCB7bmFtZSwgbG9jfSA9IG5ld0xvY2FsXG5cdFx0XHRjb25zdCBvbGRMb2NhbCA9IGxvY2Fscy5nZXQobmFtZSlcblx0XHRcdGlmIChvbGRMb2NhbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGNoZWNrKCF0aGlzQmxvY2tMb2NhbE5hbWVzLmhhcyhuYW1lKSwgbG9jLCAnZHVwbGljYXRlTG9jYWwnLCBuYW1lKVxuXHRcdFx0XHRzaGFkb3dlZC5wdXNoKG9sZExvY2FsKVxuXHRcdFx0fVxuXHRcdFx0dGhpc0Jsb2NrTG9jYWxOYW1lcy5hZGQobmFtZSlcblx0XHRcdHNldExvY2FsKG5ld0xvY2FsKVxuXG5cdFx0XHQvLyBOb3cgdGhhdCBpdCdzIGFkZGVkIGFzIGEgbG9jYWwsIGl0J3Mgbm8gbG9uZ2VyIHBlbmRpbmcuXG5cdFx0XHQvLyBXZSBhZGRlZCBwZW5kaW5nQmxvY2tMb2NhbHMgaW4gdGhlIHJpZ2h0IG9yZGVyIHRoYXQgd2UgY2FuIGp1c3QgcG9wIHRoZW0gb2ZmLlxuXHRcdFx0Y29uc3QgcG9wcGVkID0gcGVuZGluZ0Jsb2NrTG9jYWxzLnBvcCgpXG5cdFx0XHRhc3NlcnQocG9wcGVkID09PSBuZXdMb2NhbClcblx0XHR9XG5cdH1cblxuXHRuZXdMb2NhbHMuZm9yRWFjaChkZWxldGVMb2NhbClcblx0c2hhZG93ZWQuZm9yRWFjaChzZXRMb2NhbClcblx0cmV0dXJuIG5ld0xvY2Fsc1xufVxuXG5mdW5jdGlvbiBsaW5lTmV3TG9jYWxzKGxpbmUpIHtcblx0cmV0dXJuIGxpbmUgaW5zdGFuY2VvZiBBc3NpZ25TaW5nbGUgP1xuXHRcdFtsaW5lLmFzc2lnbmVlXSA6XG5cdFx0bGluZSBpbnN0YW5jZW9mIEFzc2lnbkRlc3RydWN0dXJlID9cblx0XHRsaW5lLmFzc2lnbmVlcyA6XG5cdFx0bGluZSBpbnN0YW5jZW9mIE9iakVudHJ5ID9cblx0XHRsaW5lTmV3TG9jYWxzKGxpbmUuYXNzaWduKSA6XG5cdFx0W11cbn1cbiJdfQ==
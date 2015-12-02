'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../../CompileError', '../context', '../MsAst', '../util', './context', './locals', './SK'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../../CompileError'), require('../context'), require('../MsAst'), require('../util'), require('./context'), require('./locals'), require('./SK'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.MsAst, global.util, global.context, global.locals, global.SK);
		global.verifyLines = mod.exports;
	}
})(this, function (exports, _CompileError, _context, _MsAst, _util, _context2, _locals, _SK) {
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
					(0, _context.check)(!thisBlockLocalNames.has(name), loc, () => `A local ${ (0, _CompileError.code)(name) } is already in this block.`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnlMaW5lcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBWXdCLFdBQVc7Ozs7Ozs7Ozs7VUFBWCxXQUFXIiwiZmlsZSI6InZlcmlmeUxpbmVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtBc3NpZ25EZXN0cnVjdHVyZSwgQXNzaWduU2luZ2xlLCBPYmpFbnRyeX0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2Fzc2VydCwgcmV2ZXJzZUl0ZXJ9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2xvY2FscywgcGVuZGluZ0Jsb2NrTG9jYWxzfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge2RlbGV0ZUxvY2FsLCByZWdpc3RlckxvY2FsLCBzZXRMb2NhbH0gZnJvbSAnLi9sb2NhbHMnXG5pbXBvcnQgU0sgZnJvbSAnLi9TSydcblxuLyoqXG5WZXJpZmllcyBlYWNoIGxpbmUsIGFjY3VtdWxhdGluZyBsb2NhbHMuXG5AcmV0dXJuIExpc3Qgb2YgZXZlcnkgbmV3IGxvY2FsIGZyb20gYGxpbmVzYC5cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB2ZXJpZnlMaW5lcyhsaW5lcykge1xuXHQvKlxuXHRXZSBuZWVkIHRvIGdldCBhbGwgYmxvY2sgbG9jYWxzIHVwLWZyb250IGJlY2F1c2Vcblx0RnVuY3Rpb25zIHdpdGhpbiBsaW5lcyBjYW4gYWNjZXNzIGxvY2FscyBmcm9tIGxhdGVyIGxpbmVzLlxuXHROT1RFOiBXZSBwdXNoIHRoZXNlIG9udG8gcGVuZGluZ0Jsb2NrTG9jYWxzIGluIHJldmVyc2Vcblx0c28gdGhhdCB3aGVuIHdlIGl0ZXJhdGUgdGhyb3VnaCBsaW5lcyBmb3J3YXJkcywgd2UgY2FuIHBvcCBmcm9tIHBlbmRpbmdCbG9ja0xvY2Fsc1xuXHR0byByZW1vdmUgcGVuZGluZyBsb2NhbHMgYXMgdGhleSBiZWNvbWUgcmVhbCBsb2NhbHMuXG5cdEl0IGRvZXNuJ3QgcmVhbGx5IG1hdHRlciB3aGF0IG9yZGVyIHdlIGFkZCBsb2NhbHMgaW4gc2luY2UgaXQncyBub3QgYWxsb3dlZFxuXHR0byBoYXZlIHR3byBsb2NhbHMgb2YgdGhlIHNhbWUgbmFtZSBpbiB0aGUgc2FtZSBibG9jay5cblx0Ki9cblx0Y29uc3QgbmV3TG9jYWxzID0gW11cblxuXHRmb3IgKGNvbnN0IGxpbmUgb2YgcmV2ZXJzZUl0ZXIobGluZXMpKVxuXHRcdGZvciAoY29uc3QgXyBvZiByZXZlcnNlSXRlcihsaW5lTmV3TG9jYWxzKGxpbmUpKSkge1xuXHRcdFx0Ly8gUmVnaXN0ZXIgdGhlIGxvY2FsIG5vdy4gQ2FuJ3Qgd2FpdCB1bnRpbCB0aGUgYXNzaWduIGlzIHZlcmlmaWVkLlxuXHRcdFx0cmVnaXN0ZXJMb2NhbChfKVxuXHRcdFx0bmV3TG9jYWxzLnB1c2goXylcblx0XHR9XG5cblx0cGVuZGluZ0Jsb2NrTG9jYWxzLnB1c2goLi4ubmV3TG9jYWxzKVxuXG5cdC8qXG5cdEtlZXBzIHRyYWNrIG9mIGxvY2FscyB3aGljaCBoYXZlIGFscmVhZHkgYmVlbiBhZGRlZCBpbiB0aGlzIGJsb2NrLlxuXHRNYXNvbiBhbGxvd3Mgc2hhZG93aW5nLCBidXQgbm90IHdpdGhpbiB0aGUgc2FtZSBibG9jay5cblx0U28sIHRoaXMgaXMgYWxsb3dlZDpcblx0XHRhID0gMVxuXHRcdGIgPVxuXHRcdFx0YSA9IDJcblx0XHRcdC4uLlxuXHRCdXQgbm90OlxuXHRcdGEgPSAxXG5cdFx0YSA9IDJcblx0Ki9cblx0Y29uc3QgdGhpc0Jsb2NrTG9jYWxOYW1lcyA9IG5ldyBTZXQoKVxuXG5cdC8vIEFsbCBzaGFkb3dlZCBsb2NhbHMgZm9yIHRoaXMgYmxvY2suXG5cdGNvbnN0IHNoYWRvd2VkID0gW11cblxuXHRmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcblx0XHRsaW5lLnZlcmlmeShTSy5Ebylcblx0XHRmb3IgKGNvbnN0IG5ld0xvY2FsIG9mIGxpbmVOZXdMb2NhbHMobGluZSkpIHtcblx0XHRcdGNvbnN0IHtuYW1lLCBsb2N9ID0gbmV3TG9jYWxcblx0XHRcdGNvbnN0IG9sZExvY2FsID0gbG9jYWxzLmdldChuYW1lKVxuXHRcdFx0aWYgKG9sZExvY2FsICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0Y2hlY2soIXRoaXNCbG9ja0xvY2FsTmFtZXMuaGFzKG5hbWUpLCBsb2MsXG5cdFx0XHRcdFx0KCkgPT4gYEEgbG9jYWwgJHtjb2RlKG5hbWUpfSBpcyBhbHJlYWR5IGluIHRoaXMgYmxvY2suYClcblx0XHRcdFx0c2hhZG93ZWQucHVzaChvbGRMb2NhbClcblx0XHRcdH1cblx0XHRcdHRoaXNCbG9ja0xvY2FsTmFtZXMuYWRkKG5hbWUpXG5cdFx0XHRzZXRMb2NhbChuZXdMb2NhbClcblxuXHRcdFx0Ly8gTm93IHRoYXQgaXQncyBhZGRlZCBhcyBhIGxvY2FsLCBpdCdzIG5vIGxvbmdlciBwZW5kaW5nLlxuXHRcdFx0Ly8gV2UgYWRkZWQgcGVuZGluZ0Jsb2NrTG9jYWxzIGluIHRoZSByaWdodCBvcmRlciB0aGF0IHdlIGNhbiBqdXN0IHBvcCB0aGVtIG9mZi5cblx0XHRcdGNvbnN0IHBvcHBlZCA9IHBlbmRpbmdCbG9ja0xvY2Fscy5wb3AoKVxuXHRcdFx0YXNzZXJ0KHBvcHBlZCA9PT0gbmV3TG9jYWwpXG5cdFx0fVxuXHR9XG5cblx0bmV3TG9jYWxzLmZvckVhY2goZGVsZXRlTG9jYWwpXG5cdHNoYWRvd2VkLmZvckVhY2goc2V0TG9jYWwpXG5cdHJldHVybiBuZXdMb2NhbHNcbn1cblxuZnVuY3Rpb24gbGluZU5ld0xvY2FscyhsaW5lKSB7XG5cdHJldHVybiBsaW5lIGluc3RhbmNlb2YgQXNzaWduU2luZ2xlID9cblx0XHRbbGluZS5hc3NpZ25lZV0gOlxuXHRcdGxpbmUgaW5zdGFuY2VvZiBBc3NpZ25EZXN0cnVjdHVyZSA/XG5cdFx0bGluZS5hc3NpZ25lZXMgOlxuXHRcdGxpbmUgaW5zdGFuY2VvZiBPYmpFbnRyeSA/XG5cdFx0bGluZU5ld0xvY2FscyhsaW5lLmFzc2lnbikgOlxuXHRcdFtdXG59XG4iXX0=
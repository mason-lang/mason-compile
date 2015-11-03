'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../../CompileError', '../context', '../MsAst', '../util', './context', './locals'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../../CompileError'), require('../context'), require('../MsAst'), require('../util'), require('./context'), require('./locals'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.MsAst, global.util, global.context, global.locals);
		global.verifyLines = mod.exports;
	}
})(this, function (exports, _CompileError, _context, _MsAst, _util, _context2, _locals) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = verifyLines;

	function verifyLines(lines) {
		const newLocals = [];

		const getLineLocals = line => {
			for (const _ of (0, _util.reverseIter)(lineNewLocals(line))) {
				(0, _locals.registerLocal)(_);
				newLocals.push(_);
			}
		};

		for (const _ of (0, _util.reverseIter)(lines)) getLineLocals(_);

		_context2.pendingBlockLocals.push(...newLocals);

		const thisBlockLocalNames = new Set();
		const shadowed = [];

		const verifyLine = line => {
			if (!line.canBeStatement()) (0, _context.warn)(line.loc, 'Expression in statement position.');

			for (const newLocal of lineNewLocals(line)) {
				const name = newLocal.name;

				const oldLocal = _context2.locals.get(name);

				if (oldLocal !== undefined) {
					(0, _context.check)(!thisBlockLocalNames.has(name), newLocal.loc, () => `A local ${ (0, _CompileError.code)(name) } is already in this block.`);
					shadowed.push(oldLocal);
				}

				thisBlockLocalNames.add(name);
				(0, _locals.setLocal)(newLocal);

				const popped = _context2.pendingBlockLocals.pop();

				(0, _util.assert)(popped === newLocal);
			}

			line.verify();
		};

		for (const _ of lines) verifyLine(_);

		for (const _ of newLocals) (0, _locals.deleteLocal)(_);

		for (const _ of shadowed) (0, _locals.setLocal)(_);

		return newLocals;
	}

	function lineNewLocals(line) {
		return line instanceof _MsAst.AssignSingle ? [line.assignee] : line instanceof _MsAst.AssignDestructure ? line.assignees : line instanceof _MsAst.ObjEntry ? lineNewLocals(line.assign) : line instanceof _MsAst.ModuleExport ? lineNewLocals(line.assign) : [];
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnlMaW5lcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBV3dCLFdBQVc7O1VBQVgsV0FBVyIsImZpbGUiOiJ2ZXJpZnlMaW5lcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVjaywgd2Fybn0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7QXNzaWduRGVzdHJ1Y3R1cmUsIEFzc2lnblNpbmdsZSwgTW9kdWxlRXhwb3J0LCBPYmpFbnRyeX0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2Fzc2VydCwgcmV2ZXJzZUl0ZXJ9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2xvY2FscywgcGVuZGluZ0Jsb2NrTG9jYWxzfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge2RlbGV0ZUxvY2FsLCByZWdpc3RlckxvY2FsLCBzZXRMb2NhbH0gZnJvbSAnLi9sb2NhbHMnXG5cbi8qKlxuVmVyaWZpZXMgZWFjaCBsaW5lLCBhY2N1bXVsYXRpbmcgbG9jYWxzLlxuQHJldHVybiBMaXN0IG9mIGV2ZXJ5IG5ldyBsb2NhbCBmcm9tIGBsaW5lc2AuXG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdmVyaWZ5TGluZXMobGluZXMpIHtcblx0Lypcblx0V2UgbmVlZCB0byBnZXQgYWxsIGJsb2NrIGxvY2FscyB1cC1mcm9udCBiZWNhdXNlXG5cdEZ1bmN0aW9ucyB3aXRoaW4gbGluZXMgY2FuIGFjY2VzcyBsb2NhbHMgZnJvbSBsYXRlciBsaW5lcy5cblx0Tk9URTogV2UgcHVzaCB0aGVzZSBvbnRvIHBlbmRpbmdCbG9ja0xvY2FscyBpbiByZXZlcnNlXG5cdHNvIHRoYXQgd2hlbiB3ZSBpdGVyYXRlIHRocm91Z2ggbGluZXMgZm9yd2FyZHMsIHdlIGNhbiBwb3AgZnJvbSBwZW5kaW5nQmxvY2tMb2NhbHNcblx0dG8gcmVtb3ZlIHBlbmRpbmcgbG9jYWxzIGFzIHRoZXkgYmVjb21lIHJlYWwgbG9jYWxzLlxuXHRJdCBkb2Vzbid0IHJlYWxseSBtYXR0ZXIgd2hhdCBvcmRlciB3ZSBhZGQgbG9jYWxzIGluIHNpbmNlIGl0J3Mgbm90IGFsbG93ZWRcblx0dG8gaGF2ZSB0d28gbG9jYWxzIG9mIHRoZSBzYW1lIG5hbWUgaW4gdGhlIHNhbWUgYmxvY2suXG5cdCovXG5cdGNvbnN0IG5ld0xvY2FscyA9IFtdXG5cblx0Y29uc3QgZ2V0TGluZUxvY2FscyA9IGxpbmUgPT4ge1xuXHRcdGZvciAoY29uc3QgXyBvZiByZXZlcnNlSXRlcihsaW5lTmV3TG9jYWxzKGxpbmUpKSkge1xuXHRcdFx0Ly8gUmVnaXN0ZXIgdGhlIGxvY2FsIG5vdy4gQ2FuJ3Qgd2FpdCB1bnRpbCB0aGUgYXNzaWduIGlzIHZlcmlmaWVkLlxuXHRcdFx0cmVnaXN0ZXJMb2NhbChfKVxuXHRcdFx0bmV3TG9jYWxzLnB1c2goXylcblx0XHR9XG5cdH1cblx0Zm9yIChjb25zdCBfIG9mIHJldmVyc2VJdGVyKGxpbmVzKSlcblx0XHRnZXRMaW5lTG9jYWxzKF8pXG5cdHBlbmRpbmdCbG9ja0xvY2Fscy5wdXNoKC4uLm5ld0xvY2FscylcblxuXHQvKlxuXHRLZWVwcyB0cmFjayBvZiBsb2NhbHMgd2hpY2ggaGF2ZSBhbHJlYWR5IGJlZW4gYWRkZWQgaW4gdGhpcyBibG9jay5cblx0TWFzb24gYWxsb3dzIHNoYWRvd2luZywgYnV0IG5vdCB3aXRoaW4gdGhlIHNhbWUgYmxvY2suXG5cdFNvLCB0aGlzIGlzIGFsbG93ZWQ6XG5cdFx0YSA9IDFcblx0XHRiID1cblx0XHRcdGEgPSAyXG5cdFx0XHQuLi5cblx0QnV0IG5vdDpcblx0XHRhID0gMVxuXHRcdGEgPSAyXG5cdCovXG5cdGNvbnN0IHRoaXNCbG9ja0xvY2FsTmFtZXMgPSBuZXcgU2V0KClcblxuXHQvLyBBbGwgc2hhZG93ZWQgbG9jYWxzIGZvciB0aGlzIGJsb2NrLlxuXHRjb25zdCBzaGFkb3dlZCA9IFtdXG5cblx0Y29uc3QgdmVyaWZ5TGluZSA9IGxpbmUgPT4ge1xuXHRcdGlmICghbGluZS5jYW5CZVN0YXRlbWVudCgpKVxuXHRcdFx0d2FybihsaW5lLmxvYywgJ0V4cHJlc3Npb24gaW4gc3RhdGVtZW50IHBvc2l0aW9uLicpXG5cdFx0Zm9yIChjb25zdCBuZXdMb2NhbCBvZiBsaW5lTmV3TG9jYWxzKGxpbmUpKSB7XG5cdFx0XHRjb25zdCBuYW1lID0gbmV3TG9jYWwubmFtZVxuXHRcdFx0Y29uc3Qgb2xkTG9jYWwgPSBsb2NhbHMuZ2V0KG5hbWUpXG5cdFx0XHRpZiAob2xkTG9jYWwgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRjaGVjayghdGhpc0Jsb2NrTG9jYWxOYW1lcy5oYXMobmFtZSksIG5ld0xvY2FsLmxvYyxcblx0XHRcdFx0XHQoKSA9PiBgQSBsb2NhbCAke2NvZGUobmFtZSl9IGlzIGFscmVhZHkgaW4gdGhpcyBibG9jay5gKVxuXHRcdFx0XHRzaGFkb3dlZC5wdXNoKG9sZExvY2FsKVxuXHRcdFx0fVxuXHRcdFx0dGhpc0Jsb2NrTG9jYWxOYW1lcy5hZGQobmFtZSlcblx0XHRcdHNldExvY2FsKG5ld0xvY2FsKVxuXG5cdFx0XHQvLyBOb3cgdGhhdCBpdCdzIGFkZGVkIGFzIGEgbG9jYWwsIGl0J3Mgbm8gbG9uZ2VyIHBlbmRpbmcuXG5cdFx0XHQvLyBXZSBhZGRlZCBwZW5kaW5nQmxvY2tMb2NhbHMgaW4gdGhlIHJpZ2h0IG9yZGVyIHRoYXQgd2UgY2FuIGp1c3QgcG9wIHRoZW0gb2ZmLlxuXHRcdFx0Y29uc3QgcG9wcGVkID0gcGVuZGluZ0Jsb2NrTG9jYWxzLnBvcCgpXG5cdFx0XHRhc3NlcnQocG9wcGVkID09PSBuZXdMb2NhbClcblx0XHR9XG5cdFx0bGluZS52ZXJpZnkoKVxuXHR9XG5cblx0Zm9yIChjb25zdCBfIG9mIGxpbmVzKVxuXHRcdHZlcmlmeUxpbmUoXylcblxuXHRmb3IgKGNvbnN0IF8gb2YgbmV3TG9jYWxzKVxuXHRcdGRlbGV0ZUxvY2FsKF8pXG5cdGZvciAoY29uc3QgXyBvZiBzaGFkb3dlZClcblx0XHRzZXRMb2NhbChfKVxuXG5cdHJldHVybiBuZXdMb2NhbHNcbn1cblxuZnVuY3Rpb24gbGluZU5ld0xvY2FscyhsaW5lKSB7XG5cdHJldHVybiBsaW5lIGluc3RhbmNlb2YgQXNzaWduU2luZ2xlID9cblx0XHRbbGluZS5hc3NpZ25lZV0gOlxuXHRcdGxpbmUgaW5zdGFuY2VvZiBBc3NpZ25EZXN0cnVjdHVyZSA/XG5cdFx0bGluZS5hc3NpZ25lZXMgOlxuXHRcdGxpbmUgaW5zdGFuY2VvZiBPYmpFbnRyeSA/XG5cdFx0bGluZU5ld0xvY2FscyhsaW5lLmFzc2lnbikgOlxuXHRcdGxpbmUgaW5zdGFuY2VvZiBNb2R1bGVFeHBvcnQgP1xuXHRcdGxpbmVOZXdMb2NhbHMobGluZS5hc3NpZ24pIDpcblx0XHRbXVxufVxuIl19
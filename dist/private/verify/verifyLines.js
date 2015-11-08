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

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

		function verifyLine(line) {
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

			line.verify(_SK2.default.Do);
		}

		for (const _ of lines) verifyLine(_);

		for (const _ of newLocals) (0, _locals.deleteLocal)(_);

		for (const _ of shadowed) (0, _locals.setLocal)(_);

		return newLocals;
	}

	function lineNewLocals(line) {
		return line instanceof _MsAst.AssignSingle ? [line.assignee] : line instanceof _MsAst.AssignDestructure ? line.assignees : line instanceof _MsAst.ObjEntry ? lineNewLocals(line.assign) : [];
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnlMaW5lcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBWXdCLFdBQVc7Ozs7OztVQUFYLFdBQVciLCJmaWxlIjoidmVyaWZ5TGluZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0Fzc2lnbkRlc3RydWN0dXJlLCBBc3NpZ25TaW5nbGUsIE9iakVudHJ5fSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7YXNzZXJ0LCByZXZlcnNlSXRlcn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7bG9jYWxzLCBwZW5kaW5nQmxvY2tMb2NhbHN9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB7ZGVsZXRlTG9jYWwsIHJlZ2lzdGVyTG9jYWwsIHNldExvY2FsfSBmcm9tICcuL2xvY2FscydcbmltcG9ydCBTSyBmcm9tICcuL1NLJ1xuXG4vKipcblZlcmlmaWVzIGVhY2ggbGluZSwgYWNjdW11bGF0aW5nIGxvY2Fscy5cbkByZXR1cm4gTGlzdCBvZiBldmVyeSBuZXcgbG9jYWwgZnJvbSBgbGluZXNgLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHZlcmlmeUxpbmVzKGxpbmVzKSB7XG5cdC8qXG5cdFdlIG5lZWQgdG8gZ2V0IGFsbCBibG9jayBsb2NhbHMgdXAtZnJvbnQgYmVjYXVzZVxuXHRGdW5jdGlvbnMgd2l0aGluIGxpbmVzIGNhbiBhY2Nlc3MgbG9jYWxzIGZyb20gbGF0ZXIgbGluZXMuXG5cdE5PVEU6IFdlIHB1c2ggdGhlc2Ugb250byBwZW5kaW5nQmxvY2tMb2NhbHMgaW4gcmV2ZXJzZVxuXHRzbyB0aGF0IHdoZW4gd2UgaXRlcmF0ZSB0aHJvdWdoIGxpbmVzIGZvcndhcmRzLCB3ZSBjYW4gcG9wIGZyb20gcGVuZGluZ0Jsb2NrTG9jYWxzXG5cdHRvIHJlbW92ZSBwZW5kaW5nIGxvY2FscyBhcyB0aGV5IGJlY29tZSByZWFsIGxvY2Fscy5cblx0SXQgZG9lc24ndCByZWFsbHkgbWF0dGVyIHdoYXQgb3JkZXIgd2UgYWRkIGxvY2FscyBpbiBzaW5jZSBpdCdzIG5vdCBhbGxvd2VkXG5cdHRvIGhhdmUgdHdvIGxvY2FscyBvZiB0aGUgc2FtZSBuYW1lIGluIHRoZSBzYW1lIGJsb2NrLlxuXHQqL1xuXHRjb25zdCBuZXdMb2NhbHMgPSBbXVxuXG5cdGNvbnN0IGdldExpbmVMb2NhbHMgPSBsaW5lID0+IHtcblx0XHRmb3IgKGNvbnN0IF8gb2YgcmV2ZXJzZUl0ZXIobGluZU5ld0xvY2FscyhsaW5lKSkpIHtcblx0XHRcdC8vIFJlZ2lzdGVyIHRoZSBsb2NhbCBub3cuIENhbid0IHdhaXQgdW50aWwgdGhlIGFzc2lnbiBpcyB2ZXJpZmllZC5cblx0XHRcdHJlZ2lzdGVyTG9jYWwoXylcblx0XHRcdG5ld0xvY2Fscy5wdXNoKF8pXG5cdFx0fVxuXHR9XG5cdGZvciAoY29uc3QgXyBvZiByZXZlcnNlSXRlcihsaW5lcykpXG5cdFx0Z2V0TGluZUxvY2FscyhfKVxuXHRwZW5kaW5nQmxvY2tMb2NhbHMucHVzaCguLi5uZXdMb2NhbHMpXG5cblx0Lypcblx0S2VlcHMgdHJhY2sgb2YgbG9jYWxzIHdoaWNoIGhhdmUgYWxyZWFkeSBiZWVuIGFkZGVkIGluIHRoaXMgYmxvY2suXG5cdE1hc29uIGFsbG93cyBzaGFkb3dpbmcsIGJ1dCBub3Qgd2l0aGluIHRoZSBzYW1lIGJsb2NrLlxuXHRTbywgdGhpcyBpcyBhbGxvd2VkOlxuXHRcdGEgPSAxXG5cdFx0YiA9XG5cdFx0XHRhID0gMlxuXHRcdFx0Li4uXG5cdEJ1dCBub3Q6XG5cdFx0YSA9IDFcblx0XHRhID0gMlxuXHQqL1xuXHRjb25zdCB0aGlzQmxvY2tMb2NhbE5hbWVzID0gbmV3IFNldCgpXG5cblx0Ly8gQWxsIHNoYWRvd2VkIGxvY2FscyBmb3IgdGhpcyBibG9jay5cblx0Y29uc3Qgc2hhZG93ZWQgPSBbXVxuXG5cdGZ1bmN0aW9uIHZlcmlmeUxpbmUobGluZSkge1xuXHRcdGZvciAoY29uc3QgbmV3TG9jYWwgb2YgbGluZU5ld0xvY2FscyhsaW5lKSkge1xuXHRcdFx0Y29uc3QgbmFtZSA9IG5ld0xvY2FsLm5hbWVcblx0XHRcdGNvbnN0IG9sZExvY2FsID0gbG9jYWxzLmdldChuYW1lKVxuXHRcdFx0aWYgKG9sZExvY2FsICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0Y2hlY2soIXRoaXNCbG9ja0xvY2FsTmFtZXMuaGFzKG5hbWUpLCBuZXdMb2NhbC5sb2MsXG5cdFx0XHRcdFx0KCkgPT4gYEEgbG9jYWwgJHtjb2RlKG5hbWUpfSBpcyBhbHJlYWR5IGluIHRoaXMgYmxvY2suYClcblx0XHRcdFx0c2hhZG93ZWQucHVzaChvbGRMb2NhbClcblx0XHRcdH1cblx0XHRcdHRoaXNCbG9ja0xvY2FsTmFtZXMuYWRkKG5hbWUpXG5cdFx0XHRzZXRMb2NhbChuZXdMb2NhbClcblxuXHRcdFx0Ly8gTm93IHRoYXQgaXQncyBhZGRlZCBhcyBhIGxvY2FsLCBpdCdzIG5vIGxvbmdlciBwZW5kaW5nLlxuXHRcdFx0Ly8gV2UgYWRkZWQgcGVuZGluZ0Jsb2NrTG9jYWxzIGluIHRoZSByaWdodCBvcmRlciB0aGF0IHdlIGNhbiBqdXN0IHBvcCB0aGVtIG9mZi5cblx0XHRcdGNvbnN0IHBvcHBlZCA9IHBlbmRpbmdCbG9ja0xvY2Fscy5wb3AoKVxuXHRcdFx0YXNzZXJ0KHBvcHBlZCA9PT0gbmV3TG9jYWwpXG5cdFx0fVxuXHRcdGxpbmUudmVyaWZ5KFNLLkRvKVxuXHR9XG5cblx0Zm9yIChjb25zdCBfIG9mIGxpbmVzKVxuXHRcdHZlcmlmeUxpbmUoXylcblxuXHRmb3IgKGNvbnN0IF8gb2YgbmV3TG9jYWxzKVxuXHRcdGRlbGV0ZUxvY2FsKF8pXG5cdGZvciAoY29uc3QgXyBvZiBzaGFkb3dlZClcblx0XHRzZXRMb2NhbChfKVxuXG5cdHJldHVybiBuZXdMb2NhbHNcbn1cblxuZnVuY3Rpb24gbGluZU5ld0xvY2FscyhsaW5lKSB7XG5cdHJldHVybiBsaW5lIGluc3RhbmNlb2YgQXNzaWduU2luZ2xlID9cblx0XHRbbGluZS5hc3NpZ25lZV0gOlxuXHRcdGxpbmUgaW5zdGFuY2VvZiBBc3NpZ25EZXN0cnVjdHVyZSA/XG5cdFx0bGluZS5hc3NpZ25lZXMgOlxuXHRcdGxpbmUgaW5zdGFuY2VvZiBPYmpFbnRyeSA/XG5cdFx0bGluZU5ld0xvY2FscyhsaW5lLmFzc2lnbikgOlxuXHRcdFtdXG59XG4iXX0=
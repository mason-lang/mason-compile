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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnlMaW5lcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBWXdCLFdBQVc7Ozs7Ozs7Ozs7VUFBWCxXQUFXIiwiZmlsZSI6InZlcmlmeUxpbmVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtBc3NpZ25EZXN0cnVjdHVyZSwgQXNzaWduU2luZ2xlLCBPYmpFbnRyeX0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2Fzc2VydCwgcmV2ZXJzZUl0ZXJ9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2xvY2FscywgcGVuZGluZ0Jsb2NrTG9jYWxzfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge2RlbGV0ZUxvY2FsLCByZWdpc3RlckxvY2FsLCBzZXRMb2NhbH0gZnJvbSAnLi9sb2NhbHMnXG5pbXBvcnQgU0sgZnJvbSAnLi9TSydcblxuLyoqXG5WZXJpZmllcyBlYWNoIGxpbmUsIGFjY3VtdWxhdGluZyBsb2NhbHMuXG5AcmV0dXJuIExpc3Qgb2YgZXZlcnkgbmV3IGxvY2FsIGZyb20gYGxpbmVzYC5cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB2ZXJpZnlMaW5lcyhsaW5lcykge1xuXHQvKlxuXHRXZSBuZWVkIHRvIGdldCBhbGwgYmxvY2sgbG9jYWxzIHVwLWZyb250IGJlY2F1c2Vcblx0RnVuY3Rpb25zIHdpdGhpbiBsaW5lcyBjYW4gYWNjZXNzIGxvY2FscyBmcm9tIGxhdGVyIGxpbmVzLlxuXHROT1RFOiBXZSBwdXNoIHRoZXNlIG9udG8gcGVuZGluZ0Jsb2NrTG9jYWxzIGluIHJldmVyc2Vcblx0c28gdGhhdCB3aGVuIHdlIGl0ZXJhdGUgdGhyb3VnaCBsaW5lcyBmb3J3YXJkcywgd2UgY2FuIHBvcCBmcm9tIHBlbmRpbmdCbG9ja0xvY2Fsc1xuXHR0byByZW1vdmUgcGVuZGluZyBsb2NhbHMgYXMgdGhleSBiZWNvbWUgcmVhbCBsb2NhbHMuXG5cdEl0IGRvZXNuJ3QgcmVhbGx5IG1hdHRlciB3aGF0IG9yZGVyIHdlIGFkZCBsb2NhbHMgaW4gc2luY2UgaXQncyBub3QgYWxsb3dlZFxuXHR0byBoYXZlIHR3byBsb2NhbHMgb2YgdGhlIHNhbWUgbmFtZSBpbiB0aGUgc2FtZSBibG9jay5cblx0Ki9cblx0Y29uc3QgbmV3TG9jYWxzID0gW11cblxuXHRjb25zdCBnZXRMaW5lTG9jYWxzID0gbGluZSA9PiB7XG5cdFx0Zm9yIChjb25zdCBfIG9mIHJldmVyc2VJdGVyKGxpbmVOZXdMb2NhbHMobGluZSkpKSB7XG5cdFx0XHQvLyBSZWdpc3RlciB0aGUgbG9jYWwgbm93LiBDYW4ndCB3YWl0IHVudGlsIHRoZSBhc3NpZ24gaXMgdmVyaWZpZWQuXG5cdFx0XHRyZWdpc3RlckxvY2FsKF8pXG5cdFx0XHRuZXdMb2NhbHMucHVzaChfKVxuXHRcdH1cblx0fVxuXHRmb3IgKGNvbnN0IF8gb2YgcmV2ZXJzZUl0ZXIobGluZXMpKVxuXHRcdGdldExpbmVMb2NhbHMoXylcblx0cGVuZGluZ0Jsb2NrTG9jYWxzLnB1c2goLi4ubmV3TG9jYWxzKVxuXG5cdC8qXG5cdEtlZXBzIHRyYWNrIG9mIGxvY2FscyB3aGljaCBoYXZlIGFscmVhZHkgYmVlbiBhZGRlZCBpbiB0aGlzIGJsb2NrLlxuXHRNYXNvbiBhbGxvd3Mgc2hhZG93aW5nLCBidXQgbm90IHdpdGhpbiB0aGUgc2FtZSBibG9jay5cblx0U28sIHRoaXMgaXMgYWxsb3dlZDpcblx0XHRhID0gMVxuXHRcdGIgPVxuXHRcdFx0YSA9IDJcblx0XHRcdC4uLlxuXHRCdXQgbm90OlxuXHRcdGEgPSAxXG5cdFx0YSA9IDJcblx0Ki9cblx0Y29uc3QgdGhpc0Jsb2NrTG9jYWxOYW1lcyA9IG5ldyBTZXQoKVxuXG5cdC8vIEFsbCBzaGFkb3dlZCBsb2NhbHMgZm9yIHRoaXMgYmxvY2suXG5cdGNvbnN0IHNoYWRvd2VkID0gW11cblxuXHRmdW5jdGlvbiB2ZXJpZnlMaW5lKGxpbmUpIHtcblx0XHRmb3IgKGNvbnN0IG5ld0xvY2FsIG9mIGxpbmVOZXdMb2NhbHMobGluZSkpIHtcblx0XHRcdGNvbnN0IG5hbWUgPSBuZXdMb2NhbC5uYW1lXG5cdFx0XHRjb25zdCBvbGRMb2NhbCA9IGxvY2Fscy5nZXQobmFtZSlcblx0XHRcdGlmIChvbGRMb2NhbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGNoZWNrKCF0aGlzQmxvY2tMb2NhbE5hbWVzLmhhcyhuYW1lKSwgbmV3TG9jYWwubG9jLFxuXHRcdFx0XHRcdCgpID0+IGBBIGxvY2FsICR7Y29kZShuYW1lKX0gaXMgYWxyZWFkeSBpbiB0aGlzIGJsb2NrLmApXG5cdFx0XHRcdHNoYWRvd2VkLnB1c2gob2xkTG9jYWwpXG5cdFx0XHR9XG5cdFx0XHR0aGlzQmxvY2tMb2NhbE5hbWVzLmFkZChuYW1lKVxuXHRcdFx0c2V0TG9jYWwobmV3TG9jYWwpXG5cblx0XHRcdC8vIE5vdyB0aGF0IGl0J3MgYWRkZWQgYXMgYSBsb2NhbCwgaXQncyBubyBsb25nZXIgcGVuZGluZy5cblx0XHRcdC8vIFdlIGFkZGVkIHBlbmRpbmdCbG9ja0xvY2FscyBpbiB0aGUgcmlnaHQgb3JkZXIgdGhhdCB3ZSBjYW4ganVzdCBwb3AgdGhlbSBvZmYuXG5cdFx0XHRjb25zdCBwb3BwZWQgPSBwZW5kaW5nQmxvY2tMb2NhbHMucG9wKClcblx0XHRcdGFzc2VydChwb3BwZWQgPT09IG5ld0xvY2FsKVxuXHRcdH1cblx0XHRsaW5lLnZlcmlmeShTSy5Ebylcblx0fVxuXG5cdGZvciAoY29uc3QgXyBvZiBsaW5lcylcblx0XHR2ZXJpZnlMaW5lKF8pXG5cblx0Zm9yIChjb25zdCBfIG9mIG5ld0xvY2Fscylcblx0XHRkZWxldGVMb2NhbChfKVxuXHRmb3IgKGNvbnN0IF8gb2Ygc2hhZG93ZWQpXG5cdFx0c2V0TG9jYWwoXylcblxuXHRyZXR1cm4gbmV3TG9jYWxzXG59XG5cbmZ1bmN0aW9uIGxpbmVOZXdMb2NhbHMobGluZSkge1xuXHRyZXR1cm4gbGluZSBpbnN0YW5jZW9mIEFzc2lnblNpbmdsZSA/XG5cdFx0W2xpbmUuYXNzaWduZWVdIDpcblx0XHRsaW5lIGluc3RhbmNlb2YgQXNzaWduRGVzdHJ1Y3R1cmUgP1xuXHRcdGxpbmUuYXNzaWduZWVzIDpcblx0XHRsaW5lIGluc3RhbmNlb2YgT2JqRW50cnkgP1xuXHRcdGxpbmVOZXdMb2NhbHMobGluZS5hc3NpZ24pIDpcblx0XHRbXVxufVxuIl19
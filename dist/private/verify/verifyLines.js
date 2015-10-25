(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', '../../CompileError', '../context', '../MsAst', '../util', './context', './locals'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('../../CompileError'), require('../context'), require('../MsAst'), require('../util'), require('./context'), require('./locals'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.CompileError, global.context, global.MsAst, global.util, global.context, global.locals);
		global.verifyLines = mod.exports;
	}
})(this, function (exports, module, _CompileError, _context, _MsAst, _util, _context2, _locals) {
	'use strict';

	module.exports = verifyLines;

	/**
 Verifies each line, accumulating locals.
 @return List of every new local from `lines`.
 */

	function verifyLines(lines) {
		/*
  We need to get all block locals up-front because
  Functions within lines can access locals from later lines.
  NOTE: We push these onto pendingBlockLocals in reverse
  so that when we iterate through lines forwards, we can pop from pendingBlockLocals
  to remove pending locals as they become real locals.
  It doesn't really matter what order we add locals in since it's not allowed
  to have two locals of the same name in the same block.
  */
		const newLocals = [];

		const getLineLocals = line => {
			for (const _ of (0, _util.reverseIter)(lineNewLocals(line))) {
				// Register the local now. Can't wait until the assign is verified.
				(0, _locals.registerLocal)(_);
				newLocals.push(_);
			}
		};
		for (const _ of (0, _util.reverseIter)(lines)) getLineLocals(_);
		_context2.pendingBlockLocals.push.apply(_context2.pendingBlockLocals, newLocals);

		/*
  Keeps track of locals which have already been added in this block.
  Mason allows shadowing, but not within the same block.
  So, this is allowed:
  	a = 1
  	b =
  		a = 2
  		...
  But not:
  	a = 1
  	a = 2
  */
		const thisBlockLocalNames = new Set();

		// All shadowed locals for this block.
		const shadowed = [];

		const verifyLine = line => {
			verifyIsStatement(line);
			for (const newLocal of lineNewLocals(line)) {
				const name = newLocal.name;
				const oldLocal = _context2.locals.get(name);
				if (oldLocal !== undefined) {
					(0, _context.check)(!thisBlockLocalNames.has(name), newLocal.loc, () => `A local ${ (0, _CompileError.code)(name) } is already in this block.`);
					shadowed.push(oldLocal);
				}
				thisBlockLocalNames.add(name);
				(0, _locals.setLocal)(newLocal);

				// Now that it's added as a local, it's no longer pending.
				// We added pendingBlockLocals in the right order that we can just pop them off.
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

	/** Warn if a line makes no sense as a statement. */
	function verifyIsStatement(line) {
		if (!(line instanceof _MsAst.Do || line instanceof _MsAst.Call || line instanceof _MsAst.Yield || line instanceof _MsAst.YieldTo)) (0, _context.warn)(line.loc, 'Expression in statement position.');
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnlMaW5lcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7a0JBWXdCLFdBQVc7Ozs7Ozs7QUFBcEIsVUFBUyxXQUFXLENBQUMsS0FBSyxFQUFFOzs7Ozs7Ozs7O0FBVTFDLFFBQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQTs7QUFFcEIsUUFBTSxhQUFhLEdBQUcsSUFBSSxJQUFJO0FBQzdCLFFBQUssTUFBTSxDQUFDLElBQUksVUFyQkYsV0FBVyxFQXFCRyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTs7QUFFakQsZ0JBckJrQixhQUFhLEVBcUJqQixDQUFDLENBQUMsQ0FBQTtBQUNoQixhQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ2pCO0dBQ0QsQ0FBQTtBQUNELE9BQUssTUFBTSxDQUFDLElBQUksVUEzQkQsV0FBVyxFQTJCRSxLQUFLLENBQUMsRUFDakMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2pCLFlBNUJlLGtCQUFrQixDQTRCZCxJQUFJLE1BQUEsV0E1QlIsa0JBQWtCLEVBNEJOLFNBQVMsQ0FBQyxDQUFBOzs7Ozs7Ozs7Ozs7OztBQWNyQyxRQUFNLG1CQUFtQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7OztBQUdyQyxRQUFNLFFBQVEsR0FBRyxFQUFFLENBQUE7O0FBRW5CLFFBQU0sVUFBVSxHQUFHLElBQUksSUFBSTtBQUMxQixvQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN2QixRQUFLLE1BQU0sUUFBUSxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUMzQyxVQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFBO0FBQzFCLFVBQU0sUUFBUSxHQUFHLFVBbkRaLE1BQU0sQ0FtRGEsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2pDLFFBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtBQUMzQixrQkF6REksS0FBSyxFQXlESCxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLENBQUMsR0FBRyxFQUNqRCxNQUFNLENBQUMsUUFBUSxHQUFFLGtCQTNEZCxJQUFJLEVBMkRlLElBQUksQ0FBQyxFQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQTtBQUN6RCxhQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQ3ZCO0FBQ0QsdUJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzdCLGdCQXpEaUMsUUFBUSxFQXlEaEMsUUFBUSxDQUFDLENBQUE7Ozs7QUFJbEIsVUFBTSxNQUFNLEdBQUcsVUE5REYsa0JBQWtCLENBOERHLEdBQUcsRUFBRSxDQUFBO0FBQ3ZDLGNBaEVLLE1BQU0sRUFnRUosTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFBO0lBQzNCO0FBQ0QsT0FBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO0dBQ2IsQ0FBQTs7QUFFRCxPQUFLLE1BQU0sQ0FBQyxJQUFJLEtBQUssRUFDcEIsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBOztBQUVkLE9BQUssTUFBTSxDQUFDLElBQUksU0FBUyxFQUN4QixZQXZFTSxXQUFXLEVBdUVMLENBQUMsQ0FBQyxDQUFBO0FBQ2YsT0FBSyxNQUFNLENBQUMsSUFBSSxRQUFRLEVBQ3ZCLFlBekVrQyxRQUFRLEVBeUVqQyxDQUFDLENBQUMsQ0FBQTs7QUFFWixTQUFPLFNBQVMsQ0FBQTtFQUNoQjs7QUFFRCxVQUFTLGFBQWEsQ0FBQyxJQUFJLEVBQUU7QUFDNUIsU0FBTyxJQUFJLG1CQW5GZSxZQUFZLEFBbUZILEdBQ2xDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUNmLElBQUksbUJBckZFLGlCQUFpQixBQXFGVSxHQUNqQyxJQUFJLENBQUMsU0FBUyxHQUNkLElBQUksbUJBdkYyRCxRQUFRLEFBdUYvQyxHQUN4QixhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUMxQixJQUFJLG1CQXpGNkMsWUFBWSxBQXlGakMsR0FDNUIsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FDMUIsRUFBRSxDQUFBO0VBQ0g7OztBQUdELFVBQVMsaUJBQWlCLENBQUMsSUFBSSxFQUFFO0FBQ2hDLE1BQUksRUFBRSxJQUFJLG1CQWhHb0MsRUFBRSxBQWdHeEIsSUFDdkIsSUFBSSxtQkFqR21DLElBQUksQUFpR3ZCLElBQUksSUFBSSxtQkFqRzZDLEtBQUssQUFpR2pDLElBQUksSUFBSSxtQkFqRzJCLE9BQU8sQUFpR2YsQ0FBQSxBQUFDLEVBQ3pFLGFBbkdhLElBQUksRUFtR1osSUFBSSxDQUFDLEdBQUcsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFBO0VBQ3BEIiwiZmlsZSI6InZlcmlmeUxpbmVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCB3YXJufSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtBc3NpZ25EZXN0cnVjdHVyZSwgQXNzaWduU2luZ2xlLCBDYWxsLCBEbywgTW9kdWxlRXhwb3J0LCBPYmpFbnRyeSwgWWllbGQsIFlpZWxkVG9cblx0fSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7YXNzZXJ0LCByZXZlcnNlSXRlcn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7bG9jYWxzLCBwZW5kaW5nQmxvY2tMb2NhbHN9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB7ZGVsZXRlTG9jYWwsIHJlZ2lzdGVyTG9jYWwsIHNldExvY2FsfSBmcm9tICcuL2xvY2FscydcblxuLyoqXG5WZXJpZmllcyBlYWNoIGxpbmUsIGFjY3VtdWxhdGluZyBsb2NhbHMuXG5AcmV0dXJuIExpc3Qgb2YgZXZlcnkgbmV3IGxvY2FsIGZyb20gYGxpbmVzYC5cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB2ZXJpZnlMaW5lcyhsaW5lcykge1xuXHQvKlxuXHRXZSBuZWVkIHRvIGdldCBhbGwgYmxvY2sgbG9jYWxzIHVwLWZyb250IGJlY2F1c2Vcblx0RnVuY3Rpb25zIHdpdGhpbiBsaW5lcyBjYW4gYWNjZXNzIGxvY2FscyBmcm9tIGxhdGVyIGxpbmVzLlxuXHROT1RFOiBXZSBwdXNoIHRoZXNlIG9udG8gcGVuZGluZ0Jsb2NrTG9jYWxzIGluIHJldmVyc2Vcblx0c28gdGhhdCB3aGVuIHdlIGl0ZXJhdGUgdGhyb3VnaCBsaW5lcyBmb3J3YXJkcywgd2UgY2FuIHBvcCBmcm9tIHBlbmRpbmdCbG9ja0xvY2Fsc1xuXHR0byByZW1vdmUgcGVuZGluZyBsb2NhbHMgYXMgdGhleSBiZWNvbWUgcmVhbCBsb2NhbHMuXG5cdEl0IGRvZXNuJ3QgcmVhbGx5IG1hdHRlciB3aGF0IG9yZGVyIHdlIGFkZCBsb2NhbHMgaW4gc2luY2UgaXQncyBub3QgYWxsb3dlZFxuXHR0byBoYXZlIHR3byBsb2NhbHMgb2YgdGhlIHNhbWUgbmFtZSBpbiB0aGUgc2FtZSBibG9jay5cblx0Ki9cblx0Y29uc3QgbmV3TG9jYWxzID0gW11cblxuXHRjb25zdCBnZXRMaW5lTG9jYWxzID0gbGluZSA9PiB7XG5cdFx0Zm9yIChjb25zdCBfIG9mIHJldmVyc2VJdGVyKGxpbmVOZXdMb2NhbHMobGluZSkpKSB7XG5cdFx0XHQvLyBSZWdpc3RlciB0aGUgbG9jYWwgbm93LiBDYW4ndCB3YWl0IHVudGlsIHRoZSBhc3NpZ24gaXMgdmVyaWZpZWQuXG5cdFx0XHRyZWdpc3RlckxvY2FsKF8pXG5cdFx0XHRuZXdMb2NhbHMucHVzaChfKVxuXHRcdH1cblx0fVxuXHRmb3IgKGNvbnN0IF8gb2YgcmV2ZXJzZUl0ZXIobGluZXMpKVxuXHRcdGdldExpbmVMb2NhbHMoXylcblx0cGVuZGluZ0Jsb2NrTG9jYWxzLnB1c2goLi4ubmV3TG9jYWxzKVxuXG5cdC8qXG5cdEtlZXBzIHRyYWNrIG9mIGxvY2FscyB3aGljaCBoYXZlIGFscmVhZHkgYmVlbiBhZGRlZCBpbiB0aGlzIGJsb2NrLlxuXHRNYXNvbiBhbGxvd3Mgc2hhZG93aW5nLCBidXQgbm90IHdpdGhpbiB0aGUgc2FtZSBibG9jay5cblx0U28sIHRoaXMgaXMgYWxsb3dlZDpcblx0XHRhID0gMVxuXHRcdGIgPVxuXHRcdFx0YSA9IDJcblx0XHRcdC4uLlxuXHRCdXQgbm90OlxuXHRcdGEgPSAxXG5cdFx0YSA9IDJcblx0Ki9cblx0Y29uc3QgdGhpc0Jsb2NrTG9jYWxOYW1lcyA9IG5ldyBTZXQoKVxuXG5cdC8vIEFsbCBzaGFkb3dlZCBsb2NhbHMgZm9yIHRoaXMgYmxvY2suXG5cdGNvbnN0IHNoYWRvd2VkID0gW11cblxuXHRjb25zdCB2ZXJpZnlMaW5lID0gbGluZSA9PiB7XG5cdFx0dmVyaWZ5SXNTdGF0ZW1lbnQobGluZSlcblx0XHRmb3IgKGNvbnN0IG5ld0xvY2FsIG9mIGxpbmVOZXdMb2NhbHMobGluZSkpIHtcblx0XHRcdGNvbnN0IG5hbWUgPSBuZXdMb2NhbC5uYW1lXG5cdFx0XHRjb25zdCBvbGRMb2NhbCA9IGxvY2Fscy5nZXQobmFtZSlcblx0XHRcdGlmIChvbGRMb2NhbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGNoZWNrKCF0aGlzQmxvY2tMb2NhbE5hbWVzLmhhcyhuYW1lKSwgbmV3TG9jYWwubG9jLFxuXHRcdFx0XHRcdCgpID0+IGBBIGxvY2FsICR7Y29kZShuYW1lKX0gaXMgYWxyZWFkeSBpbiB0aGlzIGJsb2NrLmApXG5cdFx0XHRcdHNoYWRvd2VkLnB1c2gob2xkTG9jYWwpXG5cdFx0XHR9XG5cdFx0XHR0aGlzQmxvY2tMb2NhbE5hbWVzLmFkZChuYW1lKVxuXHRcdFx0c2V0TG9jYWwobmV3TG9jYWwpXG5cblx0XHRcdC8vIE5vdyB0aGF0IGl0J3MgYWRkZWQgYXMgYSBsb2NhbCwgaXQncyBubyBsb25nZXIgcGVuZGluZy5cblx0XHRcdC8vIFdlIGFkZGVkIHBlbmRpbmdCbG9ja0xvY2FscyBpbiB0aGUgcmlnaHQgb3JkZXIgdGhhdCB3ZSBjYW4ganVzdCBwb3AgdGhlbSBvZmYuXG5cdFx0XHRjb25zdCBwb3BwZWQgPSBwZW5kaW5nQmxvY2tMb2NhbHMucG9wKClcblx0XHRcdGFzc2VydChwb3BwZWQgPT09IG5ld0xvY2FsKVxuXHRcdH1cblx0XHRsaW5lLnZlcmlmeSgpXG5cdH1cblxuXHRmb3IgKGNvbnN0IF8gb2YgbGluZXMpXG5cdFx0dmVyaWZ5TGluZShfKVxuXG5cdGZvciAoY29uc3QgXyBvZiBuZXdMb2NhbHMpXG5cdFx0ZGVsZXRlTG9jYWwoXylcblx0Zm9yIChjb25zdCBfIG9mIHNoYWRvd2VkKVxuXHRcdHNldExvY2FsKF8pXG5cblx0cmV0dXJuIG5ld0xvY2Fsc1xufVxuXG5mdW5jdGlvbiBsaW5lTmV3TG9jYWxzKGxpbmUpIHtcblx0cmV0dXJuIGxpbmUgaW5zdGFuY2VvZiBBc3NpZ25TaW5nbGUgP1xuXHRcdFtsaW5lLmFzc2lnbmVlXSA6XG5cdFx0bGluZSBpbnN0YW5jZW9mIEFzc2lnbkRlc3RydWN0dXJlID9cblx0XHRsaW5lLmFzc2lnbmVlcyA6XG5cdFx0bGluZSBpbnN0YW5jZW9mIE9iakVudHJ5ID9cblx0XHRsaW5lTmV3TG9jYWxzKGxpbmUuYXNzaWduKSA6XG5cdFx0bGluZSBpbnN0YW5jZW9mIE1vZHVsZUV4cG9ydCA/XG5cdFx0bGluZU5ld0xvY2FscyhsaW5lLmFzc2lnbikgOlxuXHRcdFtdXG59XG5cbi8qKiBXYXJuIGlmIGEgbGluZSBtYWtlcyBubyBzZW5zZSBhcyBhIHN0YXRlbWVudC4gKi9cbmZ1bmN0aW9uIHZlcmlmeUlzU3RhdGVtZW50KGxpbmUpIHtcblx0aWYgKCEobGluZSBpbnN0YW5jZW9mIERvIHx8XG5cdFx0bGluZSBpbnN0YW5jZW9mIENhbGwgfHwgbGluZSBpbnN0YW5jZW9mIFlpZWxkIHx8IGxpbmUgaW5zdGFuY2VvZiBZaWVsZFRvKSlcblx0XHR3YXJuKGxpbmUubG9jLCAnRXhwcmVzc2lvbiBpbiBzdGF0ZW1lbnQgcG9zaXRpb24uJylcbn1cbiJdfQ==
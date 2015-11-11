'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', '../../CompileError', '../context', './chars'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('../../CompileError'), require('../context'), require('./chars'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.CompileError, global.context, global.chars);
		global.sourceContext = mod.exports;
	}
})(this, function (exports, _Loc, _CompileError, _context, _chars) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.sourceString = exports.column = exports.line = exports.index = undefined;
	exports.setupSourceContext = setupSourceContext;
	exports.pos = pos;
	exports.peek = peek;
	exports.eat = eat;
	exports.skip = skip;
	exports.tryEat = tryEat;
	exports.tryEat2 = tryEat2;
	exports.tryEat3 = tryEat3;
	exports.mustEat = mustEat;
	exports.tryEatNewline = tryEatNewline;
	exports.stepBackMany = stepBackMany;
	exports.takeWhile = takeWhile;
	exports.takeWhileWithPrev = takeWhileWithPrev;
	exports._takeWhileWithStart = _takeWhileWithStart;
	exports.skipWhileEquals = skipWhileEquals;
	exports.skipRestOfLine = skipRestOfLine;
	exports.eatRestOfLine = eatRestOfLine;
	exports.skipWhile = skipWhile;
	exports.skipNewlines = skipNewlines;
	let index = exports.index = undefined;
	let line = exports.line = undefined;
	let column = exports.column = undefined;
	let sourceString = exports.sourceString = undefined;

	function setupSourceContext(_sourceString) {
		exports.sourceString = sourceString = _sourceString;
		exports.index = index = 0;
		exports.line = line = _Loc.StartLine;
		exports.column = column = _Loc.StartColumn;
	}

	function pos() {
		return new _Loc.Pos(line, column);
	}

	function peek() {
		let n = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
		return sourceString.charCodeAt(index + n);
	}

	function eat() {
		const char = sourceString.charCodeAt(index);
		skip();
		return char;
	}

	function skip() {
		let n = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
		exports.index = index = index + n;
		exports.column = column = column + n;
	}

	function tryEat(charToEat) {
		const canEat = peek() === charToEat;
		if (canEat) skip();
		return canEat;
	}

	function tryEat2(char1, char2) {
		const canEat = peek() === char1 && peek(1) === char2;
		if (canEat) skip(2);
		return canEat;
	}

	function tryEat3(char1, char2, char3) {
		const canEat = peek() === char1 && peek(1) === char2 && peek(2) === char3;
		if (canEat) skip(3);
		return canEat;
	}

	function mustEat(charToEat, precededBy) {
		const canEat = tryEat(charToEat);
		(0, _context.check)(canEat, pos, () => `${ (0, _CompileError.code)(precededBy) } must be followed by ${ (0, _chars.showChar)(charToEat) }`);
	}

	function tryEatNewline() {
		const canEat = peek() === _chars.Chars.Newline;

		if (canEat) {
			exports.index = index = index + 1;
			exports.line = line = line + 1;
			exports.column = column = _Loc.StartColumn;
		}

		return canEat;
	}

	function stepBackMany(oldPos, nCharsToBackUp) {
		exports.index = index = index - nCharsToBackUp;
		exports.line = line = oldPos.line;
		exports.column = column = oldPos.column;
	}

	function takeWhile(characterPredicate) {
		return _takeWhileWithStart(index, characterPredicate);
	}

	function takeWhileWithPrev(characterPredicate) {
		return _takeWhileWithStart(index - 1, characterPredicate);
	}

	function _takeWhileWithStart(startIndex, characterPredicate) {
		skipWhile(characterPredicate);
		return sourceString.slice(startIndex, index);
	}

	function skipWhileEquals(char) {
		return skipWhile(_ => _ === char);
	}

	function skipRestOfLine() {
		return skipWhile(_ => _ !== _chars.Chars.Newline);
	}

	function eatRestOfLine() {
		return takeWhile(_ => _ !== _chars.Chars.Newline);
	}

	function skipWhile(characterPredicate) {
		const startIndex = index;

		while (characterPredicate(peek())) exports.index = index = index + 1;

		const diff = index - startIndex;
		exports.column = column = column + diff;
		return diff;
	}

	function skipNewlines() {
		const startLine = line;
		exports.line = line = line + 1;

		while (peek() === _chars.Chars.Newline) {
			exports.index = index = index + 1;
			exports.line = line = line + 1;
		}

		exports.column = column = _Loc.StartColumn;
		return line - startLine;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9zb3VyY2VDb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FlZ0Isa0JBQWtCLEdBQWxCLGtCQUFrQjtTQVlsQixHQUFHLEdBQUgsR0FBRztTQUlILElBQUksR0FBSixJQUFJO1NBTUosR0FBRyxHQUFILEdBQUc7U0FLSCxJQUFJLEdBQUosSUFBSTtTQU1KLE1BQU0sR0FBTixNQUFNO1NBUU4sT0FBTyxHQUFQLE9BQU87U0FPUCxPQUFPLEdBQVAsT0FBTztTQU9QLE9BQU8sR0FBUCxPQUFPO1NBTVAsYUFBYSxHQUFiLGFBQWE7U0FXYixZQUFZLEdBQVosWUFBWTtTQVNaLFNBQVMsR0FBVCxTQUFTO1NBR1QsaUJBQWlCLEdBQWpCLGlCQUFpQjtTQUdqQixtQkFBbUIsR0FBbkIsbUJBQW1CO1NBS25CLGVBQWUsR0FBZixlQUFlO1NBSWYsY0FBYyxHQUFkLGNBQWM7U0FJZCxhQUFhLEdBQWIsYUFBYTtTQUliLFNBQVMsR0FBVCxTQUFTO1NBV1QsWUFBWSxHQUFaLFlBQVk7S0F4SGpCLEtBQUssV0FBTCxLQUFLO0tBQ0wsSUFBSSxXQUFKLElBQUk7S0FDSixNQUFNLFdBQU4sTUFBTTtLQUNOLFlBQVksV0FBWixZQUFZOztVQUVQLGtCQUFrQjtVQUZ2QixZQUFZLEdBR3RCLFlBQVksR0FBRyxhQUFhO1VBTmxCLEtBQUssR0FPZixLQUFLLEdBQUcsQ0FBQztVQU5DLElBQUksR0FPZCxJQUFJLFFBbEJRLFNBQVMsQUFrQkw7VUFOTixNQUFNLEdBT2hCLE1BQU0sUUFuQmlCLFdBQVcsQUFtQmQ7OztVQVFMLEdBQUc7Ozs7VUFJSCxJQUFJO01BQUMsQ0FBQyx5REFBQyxDQUFDOzs7O1VBTVIsR0FBRzs7Ozs7O1VBS0gsSUFBSTtNQUFDLENBQUMseURBQUMsQ0FBQztVQWhDYixLQUFLLEdBaUNmLEtBQUssR0FBRyxLQUFLLEdBQUcsQ0FBQztVQS9CUCxNQUFNLEdBZ0NoQixNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUM7OztVQUlKLE1BQU07Ozs7OztVQVFOLE9BQU87Ozs7OztVQU9QLE9BQU87Ozs7OztVQU9QLE9BQU87Ozs7O1VBTVAsYUFBYTs7OztXQWxFbEIsS0FBSyxHQXFFZCxLQUFLLEdBQUcsS0FBSyxHQUFHLENBQUM7V0FwRVIsSUFBSSxHQXFFYixJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUM7V0FwRU4sTUFBTSxHQXFFZixNQUFNLFFBakZnQixXQUFXLEFBaUZiOzs7Ozs7VUFNTixZQUFZO1VBN0VqQixLQUFLLEdBOEVmLEtBQUssR0FBRyxLQUFLLEdBQUcsY0FBYztVQTdFcEIsSUFBSSxHQThFZCxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUk7VUE3RVIsTUFBTSxHQThFaEIsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNOzs7VUFNUCxTQUFTOzs7O1VBR1QsaUJBQWlCOzs7O1VBR2pCLG1CQUFtQjs7Ozs7VUFLbkIsZUFBZTs7OztVQUlmLGNBQWM7Ozs7VUFJZCxhQUFhOzs7O1VBSWIsU0FBUzs7OzZDQTdHZCxLQUFLLEdBZ0hkLEtBQUssR0FBRyxLQUFLLEdBQUcsQ0FBQzs7O1VBOUdSLE1BQU0sR0FnSGhCLE1BQU0sR0FBRyxNQUFNLEdBQUcsSUFBSTs7OztVQU1QLFlBQVk7O1VBdkhqQixJQUFJLEdBeUhkLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQzs7O1dBMUhMLEtBQUssR0E0SGQsS0FBSyxHQUFHLEtBQUssR0FBRyxDQUFDO1dBM0hSLElBQUksR0E0SGIsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDOzs7VUEzSE4sTUFBTSxHQTZIaEIsTUFBTSxRQXpJaUIsV0FBVyxBQXlJZCIsImZpbGUiOiJzb3VyY2VDb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQb3MsIFN0YXJ0TGluZSwgU3RhcnRDb2x1bW59IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtDaGFycywgc2hvd0NoYXJ9IGZyb20gJy4vY2hhcnMnXG5cbi8qXG5UaGVzZSBhcmUga2VwdCB1cC10by1kYXRlIGFzIHdlIGl0ZXJhdGUgdGhyb3VnaCBzb3VyY2VTdHJpbmcuXG5FdmVyeSBhY2Nlc3MgdG8gaW5kZXggaGFzIGNvcnJlc3BvbmRpbmcgY2hhbmdlcyB0byBsaW5lIGFuZC9vciBjb2x1bW4uXG5UaGlzIGFsc28gZXhwbGFpbnMgd2h5IHRoZXJlIGFyZSBkaWZmZXJlbnQgZnVuY3Rpb25zIGZvciBuZXdsaW5lcyB2cyBvdGhlciBjaGFyYWN0ZXJzLlxuKi9cbmV4cG9ydCBsZXQgaW5kZXhcbmV4cG9ydCBsZXQgbGluZVxuZXhwb3J0IGxldCBjb2x1bW5cbmV4cG9ydCBsZXQgc291cmNlU3RyaW5nXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cFNvdXJjZUNvbnRleHQoX3NvdXJjZVN0cmluZykge1xuXHRzb3VyY2VTdHJpbmcgPSBfc291cmNlU3RyaW5nXG5cdGluZGV4ID0gMFxuXHRsaW5lID0gU3RhcnRMaW5lXG5cdGNvbHVtbiA9IFN0YXJ0Q29sdW1uXG59XG5cbi8qXG5OT1RFOiBXZSB1c2UgY2hhcmFjdGVyICpjb2RlcyogZm9yIGV2ZXJ5dGhpbmcuXG5DaGFyYWN0ZXJzIGFyZSBvZiB0eXBlIE51bWJlciBhbmQgbm90IGp1c3QgU3RyaW5ncyBvZiBsZW5ndGggb25lLlxuKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHBvcygpIHtcblx0cmV0dXJuIG5ldyBQb3MobGluZSwgY29sdW1uKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGVlayhuPTApIHtcblx0cmV0dXJuIHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4ICsgbilcbn1cblxuLy8gTWF5IGVhdCBhIE5ld2xpbmUuXG4vLyBDYWxsZXIgKm11c3QqIGNoZWNrIGZvciB0aGF0IGNhc2UgYW5kIGluY3JlbWVudCBsaW5lIVxuZXhwb3J0IGZ1bmN0aW9uIGVhdCgpIHtcblx0Y29uc3QgY2hhciA9IHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4KVxuXHRza2lwKClcblx0cmV0dXJuIGNoYXJcbn1cbmV4cG9ydCBmdW5jdGlvbiBza2lwKG49MSkge1xuXHRpbmRleCA9IGluZGV4ICsgblxuXHRjb2x1bW4gPSBjb2x1bW4gKyBuXG59XG5cbi8vIGNoYXJUb0VhdCBtdXN0IG5vdCBiZSBOZXdsaW5lLlxuZXhwb3J0IGZ1bmN0aW9uIHRyeUVhdChjaGFyVG9FYXQpIHtcblx0Y29uc3QgY2FuRWF0ID0gcGVlaygpID09PSBjaGFyVG9FYXRcblx0aWYgKGNhbkVhdClcblx0XHRza2lwKClcblx0cmV0dXJuIGNhbkVhdFxufVxuXG4vLyBjaGFycyBtdXN0IG5vdCBiZSBOZXdsaW5lXG5leHBvcnQgZnVuY3Rpb24gdHJ5RWF0MihjaGFyMSwgY2hhcjIpIHtcblx0Y29uc3QgY2FuRWF0ID0gcGVlaygpID09PSBjaGFyMSAmJiBwZWVrKDEpID09PSBjaGFyMlxuXHRpZiAoY2FuRWF0KVxuXHRcdHNraXAoMilcblx0cmV0dXJuIGNhbkVhdFxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJ5RWF0MyhjaGFyMSwgY2hhcjIsIGNoYXIzKSB7XG5cdGNvbnN0IGNhbkVhdCA9IHBlZWsoKSA9PT0gY2hhcjEgJiYgcGVlaygxKSA9PT0gY2hhcjIgJiYgcGVlaygyKSA9PT0gY2hhcjNcblx0aWYgKGNhbkVhdClcblx0XHRza2lwKDMpXG5cdHJldHVybiBjYW5FYXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG11c3RFYXQoY2hhclRvRWF0LCBwcmVjZWRlZEJ5KSB7XG5cdGNvbnN0IGNhbkVhdCA9IHRyeUVhdChjaGFyVG9FYXQpXG5cdGNoZWNrKGNhbkVhdCwgcG9zLCAoKSA9PlxuXHRcdGAke2NvZGUocHJlY2VkZWRCeSl9IG11c3QgYmUgZm9sbG93ZWQgYnkgJHtzaG93Q2hhcihjaGFyVG9FYXQpfWApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cnlFYXROZXdsaW5lKCkge1xuXHRjb25zdCBjYW5FYXQgPSBwZWVrKCkgPT09IENoYXJzLk5ld2xpbmVcblx0aWYgKGNhbkVhdCkge1xuXHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdFx0bGluZSA9IGxpbmUgKyAxXG5cdFx0Y29sdW1uID0gU3RhcnRDb2x1bW5cblx0fVxuXHRyZXR1cm4gY2FuRWF0XG59XG5cbi8vIENhbGxlciBtdXN0IGVuc3VyZSB0aGF0IGJhY2tpbmcgdXAgbkNoYXJzVG9CYWNrVXAgY2hhcmFjdGVycyBicmluZ3MgdXMgdG8gb2xkUG9zLlxuZXhwb3J0IGZ1bmN0aW9uIHN0ZXBCYWNrTWFueShvbGRQb3MsIG5DaGFyc1RvQmFja1VwKSB7XG5cdGluZGV4ID0gaW5kZXggLSBuQ2hhcnNUb0JhY2tVcFxuXHRsaW5lID0gb2xkUG9zLmxpbmVcblx0Y29sdW1uID0gb2xkUG9zLmNvbHVtblxufVxuXG4vLyBGb3IgdGFrZVdoaWxlLCB0YWtlV2hpbGVXaXRoUHJldiwgYW5kIHNraXBXaGlsZUVxdWFscyxcbi8vIGNoYXJhY3RlclByZWRpY2F0ZSBtdXN0ICpub3QqIGFjY2VwdCBOZXdsaW5lLlxuLy8gT3RoZXJ3aXNlIHRoZXJlIG1heSBiZSBhbiBpbmZpbml0ZSBsb29wIVxuZXhwb3J0IGZ1bmN0aW9uIHRha2VXaGlsZShjaGFyYWN0ZXJQcmVkaWNhdGUpIHtcblx0cmV0dXJuIF90YWtlV2hpbGVXaXRoU3RhcnQoaW5kZXgsIGNoYXJhY3RlclByZWRpY2F0ZSlcbn1cbmV4cG9ydCBmdW5jdGlvbiB0YWtlV2hpbGVXaXRoUHJldihjaGFyYWN0ZXJQcmVkaWNhdGUpIHtcblx0cmV0dXJuIF90YWtlV2hpbGVXaXRoU3RhcnQoaW5kZXggLSAxLCBjaGFyYWN0ZXJQcmVkaWNhdGUpXG59XG5leHBvcnQgZnVuY3Rpb24gX3Rha2VXaGlsZVdpdGhTdGFydChzdGFydEluZGV4LCBjaGFyYWN0ZXJQcmVkaWNhdGUpIHtcblx0c2tpcFdoaWxlKGNoYXJhY3RlclByZWRpY2F0ZSlcblx0cmV0dXJuIHNvdXJjZVN0cmluZy5zbGljZShzdGFydEluZGV4LCBpbmRleClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNraXBXaGlsZUVxdWFscyhjaGFyKSB7XG5cdHJldHVybiBza2lwV2hpbGUoXyA9PiBfID09PSBjaGFyKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2tpcFJlc3RPZkxpbmUoKSB7XG5cdHJldHVybiBza2lwV2hpbGUoXyA9PiBfICE9PSBDaGFycy5OZXdsaW5lKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZWF0UmVzdE9mTGluZSgpIHtcblx0cmV0dXJuIHRha2VXaGlsZShfID0+IF8gIT09IENoYXJzLk5ld2xpbmUpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBza2lwV2hpbGUoY2hhcmFjdGVyUHJlZGljYXRlKSB7XG5cdGNvbnN0IHN0YXJ0SW5kZXggPSBpbmRleFxuXHR3aGlsZSAoY2hhcmFjdGVyUHJlZGljYXRlKHBlZWsoKSkpXG5cdFx0aW5kZXggPSBpbmRleCArIDFcblx0Y29uc3QgZGlmZiA9IGluZGV4IC0gc3RhcnRJbmRleFxuXHRjb2x1bW4gPSBjb2x1bW4gKyBkaWZmXG5cdHJldHVybiBkaWZmXG59XG5cbi8vIENhbGxlZCBhZnRlciBzZWVpbmcgdGhlIGZpcnN0IG5ld2xpbmUuXG4vLyBSZXR1cm5zICMgdG90YWwgbmV3bGluZXMsIGluY2x1ZGluZyB0aGUgZmlyc3QuXG5leHBvcnQgZnVuY3Rpb24gc2tpcE5ld2xpbmVzKCkge1xuXHRjb25zdCBzdGFydExpbmUgPSBsaW5lXG5cdGxpbmUgPSBsaW5lICsgMVxuXHR3aGlsZSAocGVlaygpID09PSBDaGFycy5OZXdsaW5lKSB7XG5cdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRsaW5lID0gbGluZSArIDFcblx0fVxuXHRjb2x1bW4gPSBTdGFydENvbHVtblxuXHRyZXR1cm4gbGluZSAtIHN0YXJ0TGluZVxufVxuXG4vLyBTcHJpbmtsZSBjaGVja1BvcygpIGFyb3VuZCB0byBkZWJ1ZyBsaW5lIGFuZCBjb2x1bW4gdHJhY2tpbmcgZXJyb3JzLlxuLypcbmZ1bmN0aW9uIGNoZWNrUG9zKCkge1xuXHRjb25zdCBwID0gX2dldENvcnJlY3RQb3MoKVxuXHRpZiAocC5saW5lICE9PSBsaW5lIHx8IHAuY29sdW1uICE9PSBjb2x1bW4pXG5cdFx0dGhyb3cgbmV3IEVycm9yKGBpbmRleDogJHtpbmRleH0sIHdyb25nOiAke1BvcyhsaW5lLCBjb2x1bW4pfSwgcmlnaHQ6ICR7cH1gKVxufVxuY29uc3QgX2luZGV4VG9Qb3MgPSBuZXcgTWFwKClcbmZ1bmN0aW9uIF9nZXRDb3JyZWN0UG9zKCkge1xuXHRpZiAoaW5kZXggPT09IDApXG5cdFx0cmV0dXJuIFBvcyhTdGFydExpbmUsIFN0YXJ0Q29sdW1uKVxuXG5cdGxldCBvbGRQb3MsIG9sZEluZGV4XG5cdGZvciAob2xkSW5kZXggPSBpbmRleCAtIDE7IDsgb2xkSW5kZXggPSBvbGRJbmRleCAtIDEpIHtcblx0XHRvbGRQb3MgPSBfaW5kZXhUb1Bvcy5nZXQob2xkSW5kZXgpXG5cdFx0aWYgKG9sZFBvcyAhPT0gdW5kZWZpbmVkKVxuXHRcdFx0YnJlYWtcblx0XHRhc3NlcnQob2xkSW5kZXggPj0gMClcblx0fVxuXHRsZXQgbmV3TGluZSA9IG9sZFBvcy5saW5lLCBuZXdDb2x1bW4gPSBvbGRQb3MuY29sdW1uXG5cdGZvciAoOyBvbGRJbmRleCA8IGluZGV4OyBvbGRJbmRleCA9IG9sZEluZGV4ICsgMSlcblx0XHRpZiAoc291cmNlU3RyaW5nLmNoYXJDb2RlQXQob2xkSW5kZXgpID09PSBOZXdsaW5lKSB7XG5cdFx0XHRuZXdMaW5lID0gbmV3TGluZSArIDFcblx0XHRcdG5ld0NvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cdFx0fSBlbHNlXG5cdFx0XHRuZXdDb2x1bW4gPSBuZXdDb2x1bW4gKyAxXG5cblx0Y29uc3QgcCA9IFBvcyhuZXdMaW5lLCBuZXdDb2x1bW4pXG5cdF9pbmRleFRvUG9zLnNldChpbmRleCwgcClcblx0cmV0dXJuIHBcbn1cbiovXG4iXX0=
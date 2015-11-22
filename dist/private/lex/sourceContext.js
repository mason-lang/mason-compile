'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', './chars'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('./chars'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.chars);
		global.sourceContext = mod.exports;
	}
})(this, function (exports, _Loc, _chars) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9zb3VyY2VDb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FhZ0Isa0JBQWtCLEdBQWxCLGtCQUFrQjtTQVlsQixHQUFHLEdBQUgsR0FBRztTQUlILElBQUksR0FBSixJQUFJO1NBTUosR0FBRyxHQUFILEdBQUc7U0FLSCxJQUFJLEdBQUosSUFBSTtTQU1KLE1BQU0sR0FBTixNQUFNO1NBUU4sT0FBTyxHQUFQLE9BQU87U0FPUCxPQUFPLEdBQVAsT0FBTztTQU9QLGFBQWEsR0FBYixhQUFhO1NBV2IsWUFBWSxHQUFaLFlBQVk7U0FTWixTQUFTLEdBQVQsU0FBUztTQUdULGlCQUFpQixHQUFqQixpQkFBaUI7U0FHakIsbUJBQW1CLEdBQW5CLG1CQUFtQjtTQUtuQixlQUFlLEdBQWYsZUFBZTtTQUlmLGNBQWMsR0FBZCxjQUFjO1NBSWQsYUFBYSxHQUFiLGFBQWE7U0FJYixTQUFTLEdBQVQsU0FBUztTQVdULFlBQVksR0FBWixZQUFZO0tBbEhqQixLQUFLLFdBQUwsS0FBSztLQUNMLElBQUksV0FBSixJQUFJO0tBQ0osTUFBTSxXQUFOLE1BQU07S0FDTixZQUFZLFdBQVosWUFBWTs7VUFFUCxrQkFBa0I7VUFGdkIsWUFBWSxHQUd0QixZQUFZLEdBQUcsYUFBYTtVQU5sQixLQUFLLEdBT2YsS0FBSyxHQUFHLENBQUM7VUFOQyxJQUFJLEdBT2QsSUFBSSxRQWhCUSxTQUFTLEFBZ0JMO1VBTk4sTUFBTSxHQU9oQixNQUFNLFFBakJpQixXQUFXLEFBaUJkOzs7VUFRTCxHQUFHOzs7O1VBSUgsSUFBSTtNQUFDLENBQUMseURBQUMsQ0FBQzs7OztVQU1SLEdBQUc7Ozs7OztVQUtILElBQUk7TUFBQyxDQUFDLHlEQUFDLENBQUM7VUFoQ2IsS0FBSyxHQWlDZixLQUFLLEdBQUcsS0FBSyxHQUFHLENBQUM7VUEvQlAsTUFBTSxHQWdDaEIsTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDOzs7VUFJSixNQUFNOzs7Ozs7VUFRTixPQUFPOzs7Ozs7VUFPUCxPQUFPOzs7Ozs7VUFPUCxhQUFhOzs7O1dBNURsQixLQUFLLEdBK0RkLEtBQUssR0FBRyxLQUFLLEdBQUcsQ0FBQztXQTlEUixJQUFJLEdBK0RiLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQztXQTlETixNQUFNLEdBK0RmLE1BQU0sUUF6RWdCLFdBQVcsQUF5RWI7Ozs7OztVQU1OLFlBQVk7VUF2RWpCLEtBQUssR0F3RWYsS0FBSyxHQUFHLEtBQUssR0FBRyxjQUFjO1VBdkVwQixJQUFJLEdBd0VkLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSTtVQXZFUixNQUFNLEdBd0VoQixNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU07OztVQU1QLFNBQVM7Ozs7VUFHVCxpQkFBaUI7Ozs7VUFHakIsbUJBQW1COzs7OztVQUtuQixlQUFlOzs7O1VBSWYsY0FBYzs7OztVQUlkLGFBQWE7Ozs7VUFJYixTQUFTOzs7NkNBdkdkLEtBQUssR0EwR2QsS0FBSyxHQUFHLEtBQUssR0FBRyxDQUFDOzs7VUF4R1IsTUFBTSxHQTBHaEIsTUFBTSxHQUFHLE1BQU0sR0FBRyxJQUFJOzs7O1VBTVAsWUFBWTs7VUFqSGpCLElBQUksR0FtSGQsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDOzs7V0FwSEwsS0FBSyxHQXNIZCxLQUFLLEdBQUcsS0FBSyxHQUFHLENBQUM7V0FySFIsSUFBSSxHQXNIYixJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUM7OztVQXJITixNQUFNLEdBdUhoQixNQUFNLFFBaklpQixXQUFXLEFBaUlkIiwiZmlsZSI6InNvdXJjZUNvbnRleHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1BvcywgU3RhcnRMaW5lLCBTdGFydENvbHVtbn0gZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQge0NoYXJzfSBmcm9tICcuL2NoYXJzJ1xuXG4vKlxuVGhlc2UgYXJlIGtlcHQgdXAtdG8tZGF0ZSBhcyB3ZSBpdGVyYXRlIHRocm91Z2ggc291cmNlU3RyaW5nLlxuRXZlcnkgYWNjZXNzIHRvIGluZGV4IGhhcyBjb3JyZXNwb25kaW5nIGNoYW5nZXMgdG8gbGluZSBhbmQvb3IgY29sdW1uLlxuVGhpcyBhbHNvIGV4cGxhaW5zIHdoeSB0aGVyZSBhcmUgZGlmZmVyZW50IGZ1bmN0aW9ucyBmb3IgbmV3bGluZXMgdnMgb3RoZXIgY2hhcmFjdGVycy5cbiovXG5leHBvcnQgbGV0IGluZGV4XG5leHBvcnQgbGV0IGxpbmVcbmV4cG9ydCBsZXQgY29sdW1uXG5leHBvcnQgbGV0IHNvdXJjZVN0cmluZ1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBTb3VyY2VDb250ZXh0KF9zb3VyY2VTdHJpbmcpIHtcblx0c291cmNlU3RyaW5nID0gX3NvdXJjZVN0cmluZ1xuXHRpbmRleCA9IDBcblx0bGluZSA9IFN0YXJ0TGluZVxuXHRjb2x1bW4gPSBTdGFydENvbHVtblxufVxuXG4vKlxuTk9URTogV2UgdXNlIGNoYXJhY3RlciAqY29kZXMqIGZvciBldmVyeXRoaW5nLlxuQ2hhcmFjdGVycyBhcmUgb2YgdHlwZSBOdW1iZXIgYW5kIG5vdCBqdXN0IFN0cmluZ3Mgb2YgbGVuZ3RoIG9uZS5cbiovXG5cbmV4cG9ydCBmdW5jdGlvbiBwb3MoKSB7XG5cdHJldHVybiBuZXcgUG9zKGxpbmUsIGNvbHVtbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBlZWsobj0wKSB7XG5cdHJldHVybiBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleCArIG4pXG59XG5cbi8vIE1heSBlYXQgYSBOZXdsaW5lLlxuLy8gQ2FsbGVyICptdXN0KiBjaGVjayBmb3IgdGhhdCBjYXNlIGFuZCBpbmNyZW1lbnQgbGluZSFcbmV4cG9ydCBmdW5jdGlvbiBlYXQoKSB7XG5cdGNvbnN0IGNoYXIgPSBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleClcblx0c2tpcCgpXG5cdHJldHVybiBjaGFyXG59XG5leHBvcnQgZnVuY3Rpb24gc2tpcChuPTEpIHtcblx0aW5kZXggPSBpbmRleCArIG5cblx0Y29sdW1uID0gY29sdW1uICsgblxufVxuXG4vLyBjaGFyVG9FYXQgbXVzdCBub3QgYmUgTmV3bGluZS5cbmV4cG9ydCBmdW5jdGlvbiB0cnlFYXQoY2hhclRvRWF0KSB7XG5cdGNvbnN0IGNhbkVhdCA9IHBlZWsoKSA9PT0gY2hhclRvRWF0XG5cdGlmIChjYW5FYXQpXG5cdFx0c2tpcCgpXG5cdHJldHVybiBjYW5FYXRcbn1cblxuLy8gY2hhcnMgbXVzdCBub3QgYmUgTmV3bGluZVxuZXhwb3J0IGZ1bmN0aW9uIHRyeUVhdDIoY2hhcjEsIGNoYXIyKSB7XG5cdGNvbnN0IGNhbkVhdCA9IHBlZWsoKSA9PT0gY2hhcjEgJiYgcGVlaygxKSA9PT0gY2hhcjJcblx0aWYgKGNhbkVhdClcblx0XHRza2lwKDIpXG5cdHJldHVybiBjYW5FYXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyeUVhdDMoY2hhcjEsIGNoYXIyLCBjaGFyMykge1xuXHRjb25zdCBjYW5FYXQgPSBwZWVrKCkgPT09IGNoYXIxICYmIHBlZWsoMSkgPT09IGNoYXIyICYmIHBlZWsoMikgPT09IGNoYXIzXG5cdGlmIChjYW5FYXQpXG5cdFx0c2tpcCgzKVxuXHRyZXR1cm4gY2FuRWF0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cnlFYXROZXdsaW5lKCkge1xuXHRjb25zdCBjYW5FYXQgPSBwZWVrKCkgPT09IENoYXJzLk5ld2xpbmVcblx0aWYgKGNhbkVhdCkge1xuXHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdFx0bGluZSA9IGxpbmUgKyAxXG5cdFx0Y29sdW1uID0gU3RhcnRDb2x1bW5cblx0fVxuXHRyZXR1cm4gY2FuRWF0XG59XG5cbi8vIENhbGxlciBtdXN0IGVuc3VyZSB0aGF0IGJhY2tpbmcgdXAgbkNoYXJzVG9CYWNrVXAgY2hhcmFjdGVycyBicmluZ3MgdXMgdG8gb2xkUG9zLlxuZXhwb3J0IGZ1bmN0aW9uIHN0ZXBCYWNrTWFueShvbGRQb3MsIG5DaGFyc1RvQmFja1VwKSB7XG5cdGluZGV4ID0gaW5kZXggLSBuQ2hhcnNUb0JhY2tVcFxuXHRsaW5lID0gb2xkUG9zLmxpbmVcblx0Y29sdW1uID0gb2xkUG9zLmNvbHVtblxufVxuXG4vLyBGb3IgdGFrZVdoaWxlLCB0YWtlV2hpbGVXaXRoUHJldiwgYW5kIHNraXBXaGlsZUVxdWFscyxcbi8vIGNoYXJhY3RlclByZWRpY2F0ZSBtdXN0ICpub3QqIGFjY2VwdCBOZXdsaW5lLlxuLy8gT3RoZXJ3aXNlIHRoZXJlIG1heSBiZSBhbiBpbmZpbml0ZSBsb29wIVxuZXhwb3J0IGZ1bmN0aW9uIHRha2VXaGlsZShjaGFyYWN0ZXJQcmVkaWNhdGUpIHtcblx0cmV0dXJuIF90YWtlV2hpbGVXaXRoU3RhcnQoaW5kZXgsIGNoYXJhY3RlclByZWRpY2F0ZSlcbn1cbmV4cG9ydCBmdW5jdGlvbiB0YWtlV2hpbGVXaXRoUHJldihjaGFyYWN0ZXJQcmVkaWNhdGUpIHtcblx0cmV0dXJuIF90YWtlV2hpbGVXaXRoU3RhcnQoaW5kZXggLSAxLCBjaGFyYWN0ZXJQcmVkaWNhdGUpXG59XG5leHBvcnQgZnVuY3Rpb24gX3Rha2VXaGlsZVdpdGhTdGFydChzdGFydEluZGV4LCBjaGFyYWN0ZXJQcmVkaWNhdGUpIHtcblx0c2tpcFdoaWxlKGNoYXJhY3RlclByZWRpY2F0ZSlcblx0cmV0dXJuIHNvdXJjZVN0cmluZy5zbGljZShzdGFydEluZGV4LCBpbmRleClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNraXBXaGlsZUVxdWFscyhjaGFyKSB7XG5cdHJldHVybiBza2lwV2hpbGUoXyA9PiBfID09PSBjaGFyKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2tpcFJlc3RPZkxpbmUoKSB7XG5cdHJldHVybiBza2lwV2hpbGUoXyA9PiBfICE9PSBDaGFycy5OZXdsaW5lKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZWF0UmVzdE9mTGluZSgpIHtcblx0cmV0dXJuIHRha2VXaGlsZShfID0+IF8gIT09IENoYXJzLk5ld2xpbmUpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBza2lwV2hpbGUoY2hhcmFjdGVyUHJlZGljYXRlKSB7XG5cdGNvbnN0IHN0YXJ0SW5kZXggPSBpbmRleFxuXHR3aGlsZSAoY2hhcmFjdGVyUHJlZGljYXRlKHBlZWsoKSkpXG5cdFx0aW5kZXggPSBpbmRleCArIDFcblx0Y29uc3QgZGlmZiA9IGluZGV4IC0gc3RhcnRJbmRleFxuXHRjb2x1bW4gPSBjb2x1bW4gKyBkaWZmXG5cdHJldHVybiBkaWZmXG59XG5cbi8vIENhbGxlZCBhZnRlciBzZWVpbmcgdGhlIGZpcnN0IG5ld2xpbmUuXG4vLyBSZXR1cm5zICMgdG90YWwgbmV3bGluZXMsIGluY2x1ZGluZyB0aGUgZmlyc3QuXG5leHBvcnQgZnVuY3Rpb24gc2tpcE5ld2xpbmVzKCkge1xuXHRjb25zdCBzdGFydExpbmUgPSBsaW5lXG5cdGxpbmUgPSBsaW5lICsgMVxuXHR3aGlsZSAocGVlaygpID09PSBDaGFycy5OZXdsaW5lKSB7XG5cdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRsaW5lID0gbGluZSArIDFcblx0fVxuXHRjb2x1bW4gPSBTdGFydENvbHVtblxuXHRyZXR1cm4gbGluZSAtIHN0YXJ0TGluZVxufVxuXG4vLyBTcHJpbmtsZSBjaGVja1BvcygpIGFyb3VuZCB0byBkZWJ1ZyBsaW5lIGFuZCBjb2x1bW4gdHJhY2tpbmcgZXJyb3JzLlxuLypcbmZ1bmN0aW9uIGNoZWNrUG9zKCkge1xuXHRjb25zdCBwID0gX2dldENvcnJlY3RQb3MoKVxuXHRpZiAocC5saW5lICE9PSBsaW5lIHx8IHAuY29sdW1uICE9PSBjb2x1bW4pXG5cdFx0dGhyb3cgbmV3IEVycm9yKGBpbmRleDogJHtpbmRleH0sIHdyb25nOiAke1BvcyhsaW5lLCBjb2x1bW4pfSwgcmlnaHQ6ICR7cH1gKVxufVxuY29uc3QgX2luZGV4VG9Qb3MgPSBuZXcgTWFwKClcbmZ1bmN0aW9uIF9nZXRDb3JyZWN0UG9zKCkge1xuXHRpZiAoaW5kZXggPT09IDApXG5cdFx0cmV0dXJuIFBvcyhTdGFydExpbmUsIFN0YXJ0Q29sdW1uKVxuXG5cdGxldCBvbGRQb3MsIG9sZEluZGV4XG5cdGZvciAob2xkSW5kZXggPSBpbmRleCAtIDE7IDsgb2xkSW5kZXggPSBvbGRJbmRleCAtIDEpIHtcblx0XHRvbGRQb3MgPSBfaW5kZXhUb1Bvcy5nZXQob2xkSW5kZXgpXG5cdFx0aWYgKG9sZFBvcyAhPT0gdW5kZWZpbmVkKVxuXHRcdFx0YnJlYWtcblx0XHRhc3NlcnQob2xkSW5kZXggPj0gMClcblx0fVxuXHRsZXQgbmV3TGluZSA9IG9sZFBvcy5saW5lLCBuZXdDb2x1bW4gPSBvbGRQb3MuY29sdW1uXG5cdGZvciAoOyBvbGRJbmRleCA8IGluZGV4OyBvbGRJbmRleCA9IG9sZEluZGV4ICsgMSlcblx0XHRpZiAoc291cmNlU3RyaW5nLmNoYXJDb2RlQXQob2xkSW5kZXgpID09PSBOZXdsaW5lKSB7XG5cdFx0XHRuZXdMaW5lID0gbmV3TGluZSArIDFcblx0XHRcdG5ld0NvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cdFx0fSBlbHNlXG5cdFx0XHRuZXdDb2x1bW4gPSBuZXdDb2x1bW4gKyAxXG5cblx0Y29uc3QgcCA9IFBvcyhuZXdMaW5lLCBuZXdDb2x1bW4pXG5cdF9pbmRleFRvUG9zLnNldChpbmRleCwgcClcblx0cmV0dXJuIHBcbn1cbiovXG4iXX0=
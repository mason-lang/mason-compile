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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9zb3VyY2VDb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FhZ0Isa0JBQWtCLEdBQWxCLGtCQUFrQjtTQVlsQixHQUFHLEdBQUgsR0FBRztTQUlILElBQUksR0FBSixJQUFJO1NBTUosR0FBRyxHQUFILEdBQUc7U0FLSCxJQUFJLEdBQUosSUFBSTtTQU1KLE1BQU0sR0FBTixNQUFNO1NBUU4sT0FBTyxHQUFQLE9BQU87U0FPUCxPQUFPLEdBQVAsT0FBTztTQU9QLGFBQWEsR0FBYixhQUFhO1NBV2IsWUFBWSxHQUFaLFlBQVk7U0FTWixTQUFTLEdBQVQsU0FBUztTQUdULGlCQUFpQixHQUFqQixpQkFBaUI7U0FHakIsbUJBQW1CLEdBQW5CLG1CQUFtQjtTQUtuQixlQUFlLEdBQWYsZUFBZTtTQUlmLGNBQWMsR0FBZCxjQUFjO1NBSWQsYUFBYSxHQUFiLGFBQWE7U0FJYixTQUFTLEdBQVQsU0FBUztTQVdULFlBQVksR0FBWixZQUFZO0tBbEhqQixLQUFLLFdBQUwsS0FBSztLQUNMLElBQUksV0FBSixJQUFJO0tBQ0osTUFBTSxXQUFOLE1BQU07S0FDTixZQUFZLFdBQVosWUFBWTs7VUFFUCxrQkFBa0I7VUFGdkIsWUFBWSxHQUd0QixZQUFZLEdBQUcsYUFBYTtVQU5sQixLQUFLLEdBT2YsS0FBSyxHQUFHLENBQUM7VUFOQyxJQUFJLEdBT2QsSUFBSSxRQWhCUSxTQUFTLEFBZ0JMO1VBTk4sTUFBTSxHQU9oQixNQUFNLFFBakJpQixXQUFXLEFBaUJkOzs7VUFRTCxHQUFHOzs7O1VBSUgsSUFBSTtNQUFDLENBQUMseURBQUcsQ0FBQzs7OztVQU1WLEdBQUc7Ozs7OztVQUtILElBQUk7TUFBQyxDQUFDLHlEQUFHLENBQUM7VUFoQ2YsS0FBSyxHQWlDZixLQUFLLEdBQUcsS0FBSyxHQUFHLENBQUM7VUEvQlAsTUFBTSxHQWdDaEIsTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDOzs7VUFJSixNQUFNOzs7Ozs7VUFRTixPQUFPOzs7Ozs7VUFPUCxPQUFPOzs7Ozs7VUFPUCxhQUFhOzs7O1dBNURsQixLQUFLLEdBK0RkLEtBQUssR0FBRyxLQUFLLEdBQUcsQ0FBQztXQTlEUixJQUFJLEdBK0RiLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQztXQTlETixNQUFNLEdBK0RmLE1BQU0sUUF6RWdCLFdBQVcsQUF5RWI7Ozs7OztVQU1OLFlBQVk7VUF2RWpCLEtBQUssR0F3RWYsS0FBSyxHQUFHLEtBQUssR0FBRyxjQUFjO1VBdkVwQixJQUFJLEdBd0VkLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSTtVQXZFUixNQUFNLEdBd0VoQixNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU07OztVQU1QLFNBQVM7Ozs7VUFHVCxpQkFBaUI7Ozs7VUFHakIsbUJBQW1COzs7OztVQUtuQixlQUFlOzs7O1VBSWYsY0FBYzs7OztVQUlkLGFBQWE7Ozs7VUFJYixTQUFTOzs7NkNBdkdkLEtBQUssR0EwR2QsS0FBSyxHQUFHLEtBQUssR0FBRyxDQUFDOzs7VUF4R1IsTUFBTSxHQTBHaEIsTUFBTSxHQUFHLE1BQU0sR0FBRyxJQUFJOzs7O1VBTVAsWUFBWTs7VUFqSGpCLElBQUksR0FtSGQsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDOzs7V0FwSEwsS0FBSyxHQXNIZCxLQUFLLEdBQUcsS0FBSyxHQUFHLENBQUM7V0FySFIsSUFBSSxHQXNIYixJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUM7OztVQXJITixNQUFNLEdBdUhoQixNQUFNLFFBaklpQixXQUFXLEFBaUlkIiwiZmlsZSI6InNvdXJjZUNvbnRleHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1BvcywgU3RhcnRMaW5lLCBTdGFydENvbHVtbn0gZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQge0NoYXJzfSBmcm9tICcuL2NoYXJzJ1xuXG4vKlxuVGhlc2UgYXJlIGtlcHQgdXAtdG8tZGF0ZSBhcyB3ZSBpdGVyYXRlIHRocm91Z2ggc291cmNlU3RyaW5nLlxuRXZlcnkgYWNjZXNzIHRvIGluZGV4IGhhcyBjb3JyZXNwb25kaW5nIGNoYW5nZXMgdG8gbGluZSBhbmQvb3IgY29sdW1uLlxuVGhpcyBhbHNvIGV4cGxhaW5zIHdoeSB0aGVyZSBhcmUgZGlmZmVyZW50IGZ1bmN0aW9ucyBmb3IgbmV3bGluZXMgdnMgb3RoZXIgY2hhcmFjdGVycy5cbiovXG5leHBvcnQgbGV0IGluZGV4XG5leHBvcnQgbGV0IGxpbmVcbmV4cG9ydCBsZXQgY29sdW1uXG5leHBvcnQgbGV0IHNvdXJjZVN0cmluZ1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBTb3VyY2VDb250ZXh0KF9zb3VyY2VTdHJpbmcpIHtcblx0c291cmNlU3RyaW5nID0gX3NvdXJjZVN0cmluZ1xuXHRpbmRleCA9IDBcblx0bGluZSA9IFN0YXJ0TGluZVxuXHRjb2x1bW4gPSBTdGFydENvbHVtblxufVxuXG4vKlxuTk9URTogV2UgdXNlIGNoYXJhY3RlciAqY29kZXMqIGZvciBldmVyeXRoaW5nLlxuQ2hhcmFjdGVycyBhcmUgb2YgdHlwZSBOdW1iZXIgYW5kIG5vdCBqdXN0IFN0cmluZ3Mgb2YgbGVuZ3RoIG9uZS5cbiovXG5cbmV4cG9ydCBmdW5jdGlvbiBwb3MoKSB7XG5cdHJldHVybiBuZXcgUG9zKGxpbmUsIGNvbHVtbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBlZWsobiA9IDApIHtcblx0cmV0dXJuIHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4ICsgbilcbn1cblxuLy8gTWF5IGVhdCBhIE5ld2xpbmUuXG4vLyBDYWxsZXIgKm11c3QqIGNoZWNrIGZvciB0aGF0IGNhc2UgYW5kIGluY3JlbWVudCBsaW5lIVxuZXhwb3J0IGZ1bmN0aW9uIGVhdCgpIHtcblx0Y29uc3QgY2hhciA9IHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4KVxuXHRza2lwKClcblx0cmV0dXJuIGNoYXJcbn1cbmV4cG9ydCBmdW5jdGlvbiBza2lwKG4gPSAxKSB7XG5cdGluZGV4ID0gaW5kZXggKyBuXG5cdGNvbHVtbiA9IGNvbHVtbiArIG5cbn1cblxuLy8gY2hhclRvRWF0IG11c3Qgbm90IGJlIE5ld2xpbmUuXG5leHBvcnQgZnVuY3Rpb24gdHJ5RWF0KGNoYXJUb0VhdCkge1xuXHRjb25zdCBjYW5FYXQgPSBwZWVrKCkgPT09IGNoYXJUb0VhdFxuXHRpZiAoY2FuRWF0KVxuXHRcdHNraXAoKVxuXHRyZXR1cm4gY2FuRWF0XG59XG5cbi8vIGNoYXJzIG11c3Qgbm90IGJlIE5ld2xpbmVcbmV4cG9ydCBmdW5jdGlvbiB0cnlFYXQyKGNoYXIxLCBjaGFyMikge1xuXHRjb25zdCBjYW5FYXQgPSBwZWVrKCkgPT09IGNoYXIxICYmIHBlZWsoMSkgPT09IGNoYXIyXG5cdGlmIChjYW5FYXQpXG5cdFx0c2tpcCgyKVxuXHRyZXR1cm4gY2FuRWF0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cnlFYXQzKGNoYXIxLCBjaGFyMiwgY2hhcjMpIHtcblx0Y29uc3QgY2FuRWF0ID0gcGVlaygpID09PSBjaGFyMSAmJiBwZWVrKDEpID09PSBjaGFyMiAmJiBwZWVrKDIpID09PSBjaGFyM1xuXHRpZiAoY2FuRWF0KVxuXHRcdHNraXAoMylcblx0cmV0dXJuIGNhbkVhdFxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJ5RWF0TmV3bGluZSgpIHtcblx0Y29uc3QgY2FuRWF0ID0gcGVlaygpID09PSBDaGFycy5OZXdsaW5lXG5cdGlmIChjYW5FYXQpIHtcblx0XHRpbmRleCA9IGluZGV4ICsgMVxuXHRcdGxpbmUgPSBsaW5lICsgMVxuXHRcdGNvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cdH1cblx0cmV0dXJuIGNhbkVhdFxufVxuXG4vLyBDYWxsZXIgbXVzdCBlbnN1cmUgdGhhdCBiYWNraW5nIHVwIG5DaGFyc1RvQmFja1VwIGNoYXJhY3RlcnMgYnJpbmdzIHVzIHRvIG9sZFBvcy5cbmV4cG9ydCBmdW5jdGlvbiBzdGVwQmFja01hbnkob2xkUG9zLCBuQ2hhcnNUb0JhY2tVcCkge1xuXHRpbmRleCA9IGluZGV4IC0gbkNoYXJzVG9CYWNrVXBcblx0bGluZSA9IG9sZFBvcy5saW5lXG5cdGNvbHVtbiA9IG9sZFBvcy5jb2x1bW5cbn1cblxuLy8gRm9yIHRha2VXaGlsZSwgdGFrZVdoaWxlV2l0aFByZXYsIGFuZCBza2lwV2hpbGVFcXVhbHMsXG4vLyBjaGFyYWN0ZXJQcmVkaWNhdGUgbXVzdCAqbm90KiBhY2NlcHQgTmV3bGluZS5cbi8vIE90aGVyd2lzZSB0aGVyZSBtYXkgYmUgYW4gaW5maW5pdGUgbG9vcCFcbmV4cG9ydCBmdW5jdGlvbiB0YWtlV2hpbGUoY2hhcmFjdGVyUHJlZGljYXRlKSB7XG5cdHJldHVybiBfdGFrZVdoaWxlV2l0aFN0YXJ0KGluZGV4LCBjaGFyYWN0ZXJQcmVkaWNhdGUpXG59XG5leHBvcnQgZnVuY3Rpb24gdGFrZVdoaWxlV2l0aFByZXYoY2hhcmFjdGVyUHJlZGljYXRlKSB7XG5cdHJldHVybiBfdGFrZVdoaWxlV2l0aFN0YXJ0KGluZGV4IC0gMSwgY2hhcmFjdGVyUHJlZGljYXRlKVxufVxuZXhwb3J0IGZ1bmN0aW9uIF90YWtlV2hpbGVXaXRoU3RhcnQoc3RhcnRJbmRleCwgY2hhcmFjdGVyUHJlZGljYXRlKSB7XG5cdHNraXBXaGlsZShjaGFyYWN0ZXJQcmVkaWNhdGUpXG5cdHJldHVybiBzb3VyY2VTdHJpbmcuc2xpY2Uoc3RhcnRJbmRleCwgaW5kZXgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBza2lwV2hpbGVFcXVhbHMoY2hhcikge1xuXHRyZXR1cm4gc2tpcFdoaWxlKF8gPT4gXyA9PT0gY2hhcilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNraXBSZXN0T2ZMaW5lKCkge1xuXHRyZXR1cm4gc2tpcFdoaWxlKF8gPT4gXyAhPT0gQ2hhcnMuTmV3bGluZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVhdFJlc3RPZkxpbmUoKSB7XG5cdHJldHVybiB0YWtlV2hpbGUoXyA9PiBfICE9PSBDaGFycy5OZXdsaW5lKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2tpcFdoaWxlKGNoYXJhY3RlclByZWRpY2F0ZSkge1xuXHRjb25zdCBzdGFydEluZGV4ID0gaW5kZXhcblx0d2hpbGUgKGNoYXJhY3RlclByZWRpY2F0ZShwZWVrKCkpKVxuXHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdGNvbnN0IGRpZmYgPSBpbmRleCAtIHN0YXJ0SW5kZXhcblx0Y29sdW1uID0gY29sdW1uICsgZGlmZlxuXHRyZXR1cm4gZGlmZlxufVxuXG4vLyBDYWxsZWQgYWZ0ZXIgc2VlaW5nIHRoZSBmaXJzdCBuZXdsaW5lLlxuLy8gUmV0dXJucyAjIHRvdGFsIG5ld2xpbmVzLCBpbmNsdWRpbmcgdGhlIGZpcnN0LlxuZXhwb3J0IGZ1bmN0aW9uIHNraXBOZXdsaW5lcygpIHtcblx0Y29uc3Qgc3RhcnRMaW5lID0gbGluZVxuXHRsaW5lID0gbGluZSArIDFcblx0d2hpbGUgKHBlZWsoKSA9PT0gQ2hhcnMuTmV3bGluZSkge1xuXHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdFx0bGluZSA9IGxpbmUgKyAxXG5cdH1cblx0Y29sdW1uID0gU3RhcnRDb2x1bW5cblx0cmV0dXJuIGxpbmUgLSBzdGFydExpbmVcbn1cblxuLy8gU3ByaW5rbGUgY2hlY2tQb3MoKSBhcm91bmQgdG8gZGVidWcgbGluZSBhbmQgY29sdW1uIHRyYWNraW5nIGVycm9ycy5cbi8qXG5mdW5jdGlvbiBjaGVja1BvcygpIHtcblx0Y29uc3QgcCA9IF9nZXRDb3JyZWN0UG9zKClcblx0aWYgKHAubGluZSAhPT0gbGluZSB8fCBwLmNvbHVtbiAhPT0gY29sdW1uKVxuXHRcdHRocm93IG5ldyBFcnJvcihgaW5kZXg6ICR7aW5kZXh9LCB3cm9uZzogJHtQb3MobGluZSwgY29sdW1uKX0sIHJpZ2h0OiAke3B9YClcbn1cbmNvbnN0IF9pbmRleFRvUG9zID0gbmV3IE1hcCgpXG5mdW5jdGlvbiBfZ2V0Q29ycmVjdFBvcygpIHtcblx0aWYgKGluZGV4ID09PSAwKVxuXHRcdHJldHVybiBQb3MoU3RhcnRMaW5lLCBTdGFydENvbHVtbilcblxuXHRsZXQgb2xkUG9zLCBvbGRJbmRleFxuXHRmb3IgKG9sZEluZGV4ID0gaW5kZXggLSAxOyA7IG9sZEluZGV4ID0gb2xkSW5kZXggLSAxKSB7XG5cdFx0b2xkUG9zID0gX2luZGV4VG9Qb3MuZ2V0KG9sZEluZGV4KVxuXHRcdGlmIChvbGRQb3MgIT09IHVuZGVmaW5lZClcblx0XHRcdGJyZWFrXG5cdFx0YXNzZXJ0KG9sZEluZGV4ID49IDApXG5cdH1cblx0bGV0IG5ld0xpbmUgPSBvbGRQb3MubGluZSwgbmV3Q29sdW1uID0gb2xkUG9zLmNvbHVtblxuXHRmb3IgKDsgb2xkSW5kZXggPCBpbmRleDsgb2xkSW5kZXggPSBvbGRJbmRleCArIDEpXG5cdFx0aWYgKHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KG9sZEluZGV4KSA9PT0gTmV3bGluZSkge1xuXHRcdFx0bmV3TGluZSA9IG5ld0xpbmUgKyAxXG5cdFx0XHRuZXdDb2x1bW4gPSBTdGFydENvbHVtblxuXHRcdH0gZWxzZVxuXHRcdFx0bmV3Q29sdW1uID0gbmV3Q29sdW1uICsgMVxuXG5cdGNvbnN0IHAgPSBQb3MobmV3TGluZSwgbmV3Q29sdW1uKVxuXHRfaW5kZXhUb1Bvcy5zZXQoaW5kZXgsIHApXG5cdHJldHVybiBwXG59XG4qL1xuIl19
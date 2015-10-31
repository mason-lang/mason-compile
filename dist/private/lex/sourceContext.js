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
	exports.peekNext = peekNext;
	exports.peekPrev = peekPrev;
	exports.peek2Before = peek2Before;
	exports.eat = eat;
	exports.skip = skip;
	exports.tryEat = tryEat;
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
		return sourceString.charCodeAt(index);
	}

	function peekNext() {
		return sourceString.charCodeAt(index + 1);
	}

	function peekPrev() {
		return sourceString.charCodeAt(index - 1);
	}

	function peek2Before() {
		return sourceString.charCodeAt(index - 2);
	}

	function eat() {
		const char = sourceString.charCodeAt(index);
		skip();
		return char;
	}

	function skip() {
		exports.index = index = index + 1;
		exports.column = column = column + 1;
	}

	function tryEat(charToEat) {
		const canEat = peek() === charToEat;

		if (canEat) {
			exports.index = index = index + 1;
			exports.column = column = column + 1;
		}

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9zb3VyY2VDb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FlZ0Isa0JBQWtCLEdBQWxCLGtCQUFrQjtTQVlsQixHQUFHLEdBQUgsR0FBRztTQUlILElBQUksR0FBSixJQUFJO1NBR0osUUFBUSxHQUFSLFFBQVE7U0FHUixRQUFRLEdBQVIsUUFBUTtTQUdSLFdBQVcsR0FBWCxXQUFXO1NBTVgsR0FBRyxHQUFILEdBQUc7U0FLSCxJQUFJLEdBQUosSUFBSTtTQU1KLE1BQU0sR0FBTixNQUFNO1NBU04sT0FBTyxHQUFQLE9BQU87U0FNUCxhQUFhLEdBQWIsYUFBYTtTQVdiLFlBQVksR0FBWixZQUFZO1NBU1osU0FBUyxHQUFULFNBQVM7U0FHVCxpQkFBaUIsR0FBakIsaUJBQWlCO1NBR2pCLG1CQUFtQixHQUFuQixtQkFBbUI7U0FLbkIsZUFBZSxHQUFmLGVBQWU7U0FJZixjQUFjLEdBQWQsY0FBYztTQUlkLGFBQWEsR0FBYixhQUFhO1NBSWIsU0FBUyxHQUFULFNBQVM7U0FXVCxZQUFZLEdBQVosWUFBWTtLQXBIakIsS0FBSyxXQUFMLEtBQUs7S0FDTCxJQUFJLFdBQUosSUFBSTtLQUNKLE1BQU0sV0FBTixNQUFNO0tBQ04sWUFBWSxXQUFaLFlBQVk7O1VBRVAsa0JBQWtCO1VBRnZCLFlBQVksR0FHdEIsWUFBWSxHQUFHLGFBQWE7VUFObEIsS0FBSyxHQU9mLEtBQUssR0FBRyxDQUFDO1VBTkMsSUFBSSxHQU9kLElBQUksUUFsQlEsU0FBUyxBQWtCTDtVQU5OLE1BQU0sR0FPaEIsTUFBTSxRQW5CaUIsV0FBVyxBQW1CZDs7O1VBUUwsR0FBRzs7OztVQUlILElBQUk7Ozs7VUFHSixRQUFROzs7O1VBR1IsUUFBUTs7OztVQUdSLFdBQVc7Ozs7VUFNWCxHQUFHOzs7Ozs7VUFLSCxJQUFJO1VBekNULEtBQUssR0EwQ2YsS0FBSyxHQUFHLEtBQUssR0FBRyxDQUFDO1VBeENQLE1BQU0sR0F5Q2hCLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQzs7O1VBSUosTUFBTTs7OztXQS9DWCxLQUFLLEdBa0RkLEtBQUssR0FBRyxLQUFLLEdBQUcsQ0FBQztXQWhEUixNQUFNLEdBaURmLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQzs7Ozs7O1VBS0wsT0FBTzs7Ozs7VUFNUCxhQUFhOzs7O1dBOURsQixLQUFLLEdBaUVkLEtBQUssR0FBRyxLQUFLLEdBQUcsQ0FBQztXQWhFUixJQUFJLEdBaUViLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQztXQWhFTixNQUFNLEdBaUVmLE1BQU0sUUE3RWdCLFdBQVcsQUE2RWI7Ozs7OztVQU1OLFlBQVk7VUF6RWpCLEtBQUssR0EwRWYsS0FBSyxHQUFHLEtBQUssR0FBRyxjQUFjO1VBekVwQixJQUFJLEdBMEVkLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSTtVQXpFUixNQUFNLEdBMEVoQixNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU07OztVQU1QLFNBQVM7Ozs7VUFHVCxpQkFBaUI7Ozs7VUFHakIsbUJBQW1COzs7OztVQUtuQixlQUFlOzs7O1VBSWYsY0FBYzs7OztVQUlkLGFBQWE7Ozs7VUFJYixTQUFTOzs7NkNBekdkLEtBQUssR0E0R2QsS0FBSyxHQUFHLEtBQUssR0FBRyxDQUFDOzs7VUExR1IsTUFBTSxHQTRHaEIsTUFBTSxHQUFHLE1BQU0sR0FBRyxJQUFJOzs7O1VBTVAsWUFBWTs7VUFuSGpCLElBQUksR0FxSGQsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDOzs7V0F0SEwsS0FBSyxHQXdIZCxLQUFLLEdBQUcsS0FBSyxHQUFHLENBQUM7V0F2SFIsSUFBSSxHQXdIYixJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUM7OztVQXZITixNQUFNLEdBeUhoQixNQUFNLFFBcklpQixXQUFXLEFBcUlkIiwiZmlsZSI6InNvdXJjZUNvbnRleHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1BvcywgU3RhcnRMaW5lLCBTdGFydENvbHVtbn0gZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0NoYXJzLCBzaG93Q2hhcn0gZnJvbSAnLi9jaGFycydcblxuLypcblRoZXNlIGFyZSBrZXB0IHVwLXRvLWRhdGUgYXMgd2UgaXRlcmF0ZSB0aHJvdWdoIHNvdXJjZVN0cmluZy5cbkV2ZXJ5IGFjY2VzcyB0byBpbmRleCBoYXMgY29ycmVzcG9uZGluZyBjaGFuZ2VzIHRvIGxpbmUgYW5kL29yIGNvbHVtbi5cblRoaXMgYWxzbyBleHBsYWlucyB3aHkgdGhlcmUgYXJlIGRpZmZlcmVudCBmdW5jdGlvbnMgZm9yIG5ld2xpbmVzIHZzIG90aGVyIGNoYXJhY3RlcnMuXG4qL1xuZXhwb3J0IGxldCBpbmRleFxuZXhwb3J0IGxldCBsaW5lXG5leHBvcnQgbGV0IGNvbHVtblxuZXhwb3J0IGxldCBzb3VyY2VTdHJpbmdcblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwU291cmNlQ29udGV4dChfc291cmNlU3RyaW5nKSB7XG5cdHNvdXJjZVN0cmluZyA9IF9zb3VyY2VTdHJpbmdcblx0aW5kZXggPSAwXG5cdGxpbmUgPSBTdGFydExpbmVcblx0Y29sdW1uID0gU3RhcnRDb2x1bW5cbn1cblxuLypcbk5PVEU6IFdlIHVzZSBjaGFyYWN0ZXIgKmNvZGVzKiBmb3IgZXZlcnl0aGluZy5cbkNoYXJhY3RlcnMgYXJlIG9mIHR5cGUgTnVtYmVyIGFuZCBub3QganVzdCBTdHJpbmdzIG9mIGxlbmd0aCBvbmUuXG4qL1xuXG5leHBvcnQgZnVuY3Rpb24gcG9zKCkge1xuXHRyZXR1cm4gbmV3IFBvcyhsaW5lLCBjb2x1bW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwZWVrKCkge1xuXHRyZXR1cm4gc291cmNlU3RyaW5nLmNoYXJDb2RlQXQoaW5kZXgpXG59XG5leHBvcnQgZnVuY3Rpb24gcGVla05leHQoKSB7XG5cdHJldHVybiBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleCArIDEpXG59XG5leHBvcnQgZnVuY3Rpb24gcGVla1ByZXYoKSB7XG5cdHJldHVybiBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleCAtIDEpXG59XG5leHBvcnQgZnVuY3Rpb24gcGVlazJCZWZvcmUoKSB7XG5cdHJldHVybiBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleCAtIDIpXG59XG5cbi8vIE1heSBlYXQgYSBOZXdsaW5lLlxuLy8gQ2FsbGVyICptdXN0KiBjaGVjayBmb3IgdGhhdCBjYXNlIGFuZCBpbmNyZW1lbnQgbGluZSFcbmV4cG9ydCBmdW5jdGlvbiBlYXQoKSB7XG5cdGNvbnN0IGNoYXIgPSBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleClcblx0c2tpcCgpXG5cdHJldHVybiBjaGFyXG59XG5leHBvcnQgZnVuY3Rpb24gc2tpcCgpIHtcblx0aW5kZXggPSBpbmRleCArIDFcblx0Y29sdW1uID0gY29sdW1uICsgMVxufVxuXG4vLyBjaGFyVG9FYXQgbXVzdCBub3QgYmUgTmV3bGluZS5cbmV4cG9ydCBmdW5jdGlvbiB0cnlFYXQoY2hhclRvRWF0KSB7XG5cdGNvbnN0IGNhbkVhdCA9IHBlZWsoKSA9PT0gY2hhclRvRWF0XG5cdGlmIChjYW5FYXQpIHtcblx0XHRpbmRleCA9IGluZGV4ICsgMVxuXHRcdGNvbHVtbiA9IGNvbHVtbiArIDFcblx0fVxuXHRyZXR1cm4gY2FuRWF0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtdXN0RWF0KGNoYXJUb0VhdCwgcHJlY2VkZWRCeSkge1xuXHRjb25zdCBjYW5FYXQgPSB0cnlFYXQoY2hhclRvRWF0KVxuXHRjaGVjayhjYW5FYXQsIHBvcywgKCkgPT5cblx0XHRgJHtjb2RlKHByZWNlZGVkQnkpfSBtdXN0IGJlIGZvbGxvd2VkIGJ5ICR7c2hvd0NoYXIoY2hhclRvRWF0KX1gKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJ5RWF0TmV3bGluZSgpIHtcblx0Y29uc3QgY2FuRWF0ID0gcGVlaygpID09PSBDaGFycy5OZXdsaW5lXG5cdGlmIChjYW5FYXQpIHtcblx0XHRpbmRleCA9IGluZGV4ICsgMVxuXHRcdGxpbmUgPSBsaW5lICsgMVxuXHRcdGNvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cdH1cblx0cmV0dXJuIGNhbkVhdFxufVxuXG4vLyBDYWxsZXIgbXVzdCBlbnN1cmUgdGhhdCBiYWNraW5nIHVwIG5DaGFyc1RvQmFja1VwIGNoYXJhY3RlcnMgYnJpbmdzIHVzIHRvIG9sZFBvcy5cbmV4cG9ydCBmdW5jdGlvbiBzdGVwQmFja01hbnkob2xkUG9zLCBuQ2hhcnNUb0JhY2tVcCkge1xuXHRpbmRleCA9IGluZGV4IC0gbkNoYXJzVG9CYWNrVXBcblx0bGluZSA9IG9sZFBvcy5saW5lXG5cdGNvbHVtbiA9IG9sZFBvcy5jb2x1bW5cbn1cblxuLy8gRm9yIHRha2VXaGlsZSwgdGFrZVdoaWxlV2l0aFByZXYsIGFuZCBza2lwV2hpbGVFcXVhbHMsXG4vLyBjaGFyYWN0ZXJQcmVkaWNhdGUgbXVzdCAqbm90KiBhY2NlcHQgTmV3bGluZS5cbi8vIE90aGVyd2lzZSB0aGVyZSBtYXkgYmUgYW4gaW5maW5pdGUgbG9vcCFcbmV4cG9ydCBmdW5jdGlvbiB0YWtlV2hpbGUoY2hhcmFjdGVyUHJlZGljYXRlKSB7XG5cdHJldHVybiBfdGFrZVdoaWxlV2l0aFN0YXJ0KGluZGV4LCBjaGFyYWN0ZXJQcmVkaWNhdGUpXG59XG5leHBvcnQgZnVuY3Rpb24gdGFrZVdoaWxlV2l0aFByZXYoY2hhcmFjdGVyUHJlZGljYXRlKSB7XG5cdHJldHVybiBfdGFrZVdoaWxlV2l0aFN0YXJ0KGluZGV4IC0gMSwgY2hhcmFjdGVyUHJlZGljYXRlKVxufVxuZXhwb3J0IGZ1bmN0aW9uIF90YWtlV2hpbGVXaXRoU3RhcnQoc3RhcnRJbmRleCwgY2hhcmFjdGVyUHJlZGljYXRlKSB7XG5cdHNraXBXaGlsZShjaGFyYWN0ZXJQcmVkaWNhdGUpXG5cdHJldHVybiBzb3VyY2VTdHJpbmcuc2xpY2Uoc3RhcnRJbmRleCwgaW5kZXgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBza2lwV2hpbGVFcXVhbHMoY2hhcikge1xuXHRyZXR1cm4gc2tpcFdoaWxlKF8gPT4gXyA9PT0gY2hhcilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNraXBSZXN0T2ZMaW5lKCkge1xuXHRyZXR1cm4gc2tpcFdoaWxlKF8gPT4gXyAhPT0gQ2hhcnMuTmV3bGluZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVhdFJlc3RPZkxpbmUoKSB7XG5cdHJldHVybiB0YWtlV2hpbGUoXyA9PiBfICE9PSBDaGFycy5OZXdsaW5lKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2tpcFdoaWxlKGNoYXJhY3RlclByZWRpY2F0ZSkge1xuXHRjb25zdCBzdGFydEluZGV4ID0gaW5kZXhcblx0d2hpbGUgKGNoYXJhY3RlclByZWRpY2F0ZShwZWVrKCkpKVxuXHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdGNvbnN0IGRpZmYgPSBpbmRleCAtIHN0YXJ0SW5kZXhcblx0Y29sdW1uID0gY29sdW1uICsgZGlmZlxuXHRyZXR1cm4gZGlmZlxufVxuXG4vLyBDYWxsZWQgYWZ0ZXIgc2VlaW5nIHRoZSBmaXJzdCBuZXdsaW5lLlxuLy8gUmV0dXJucyAjIHRvdGFsIG5ld2xpbmVzLCBpbmNsdWRpbmcgdGhlIGZpcnN0LlxuZXhwb3J0IGZ1bmN0aW9uIHNraXBOZXdsaW5lcygpIHtcblx0Y29uc3Qgc3RhcnRMaW5lID0gbGluZVxuXHRsaW5lID0gbGluZSArIDFcblx0d2hpbGUgKHBlZWsoKSA9PT0gQ2hhcnMuTmV3bGluZSkge1xuXHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdFx0bGluZSA9IGxpbmUgKyAxXG5cdH1cblx0Y29sdW1uID0gU3RhcnRDb2x1bW5cblx0cmV0dXJuIGxpbmUgLSBzdGFydExpbmVcbn1cblxuLy8gU3ByaW5rbGUgY2hlY2tQb3MoKSBhcm91bmQgdG8gZGVidWcgbGluZSBhbmQgY29sdW1uIHRyYWNraW5nIGVycm9ycy5cbi8qXG5mdW5jdGlvbiBjaGVja1BvcygpIHtcblx0Y29uc3QgcCA9IF9nZXRDb3JyZWN0UG9zKClcblx0aWYgKHAubGluZSAhPT0gbGluZSB8fCBwLmNvbHVtbiAhPT0gY29sdW1uKVxuXHRcdHRocm93IG5ldyBFcnJvcihgaW5kZXg6ICR7aW5kZXh9LCB3cm9uZzogJHtQb3MobGluZSwgY29sdW1uKX0sIHJpZ2h0OiAke3B9YClcbn1cbmNvbnN0IF9pbmRleFRvUG9zID0gbmV3IE1hcCgpXG5mdW5jdGlvbiBfZ2V0Q29ycmVjdFBvcygpIHtcblx0aWYgKGluZGV4ID09PSAwKVxuXHRcdHJldHVybiBQb3MoU3RhcnRMaW5lLCBTdGFydENvbHVtbilcblxuXHRsZXQgb2xkUG9zLCBvbGRJbmRleFxuXHRmb3IgKG9sZEluZGV4ID0gaW5kZXggLSAxOyA7IG9sZEluZGV4ID0gb2xkSW5kZXggLSAxKSB7XG5cdFx0b2xkUG9zID0gX2luZGV4VG9Qb3MuZ2V0KG9sZEluZGV4KVxuXHRcdGlmIChvbGRQb3MgIT09IHVuZGVmaW5lZClcblx0XHRcdGJyZWFrXG5cdFx0YXNzZXJ0KG9sZEluZGV4ID49IDApXG5cdH1cblx0bGV0IG5ld0xpbmUgPSBvbGRQb3MubGluZSwgbmV3Q29sdW1uID0gb2xkUG9zLmNvbHVtblxuXHRmb3IgKDsgb2xkSW5kZXggPCBpbmRleDsgb2xkSW5kZXggPSBvbGRJbmRleCArIDEpXG5cdFx0aWYgKHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KG9sZEluZGV4KSA9PT0gTmV3bGluZSkge1xuXHRcdFx0bmV3TGluZSA9IG5ld0xpbmUgKyAxXG5cdFx0XHRuZXdDb2x1bW4gPSBTdGFydENvbHVtblxuXHRcdH0gZWxzZVxuXHRcdFx0bmV3Q29sdW1uID0gbmV3Q29sdW1uICsgMVxuXG5cdGNvbnN0IHAgPSBQb3MobmV3TGluZSwgbmV3Q29sdW1uKVxuXHRfaW5kZXhUb1Bvcy5zZXQoaW5kZXgsIHApXG5cdHJldHVybiBwXG59XG4qL1xuIl19
(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'esast/dist/Loc', '../../CompileError', '../context', './chars'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports, require('esast/dist/Loc'), require('../../CompileError'), require('../context'), require('./chars'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.CompileError, global.context, global.chars);
		global.sourceContext = mod.exports;
	}
})(this, function (exports, _esastDistLoc, _CompileError, _context, _chars) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
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

	/*
 These are kept up-to-date as we iterate through sourceString.
 Every access to index has corresponding changes to line and/or column.
 This also explains why there are different functions for newlines vs other characters.
 */
	let index;
	exports.index = index;
	let line;
	exports.line = line;
	let column;
	exports.column = column;
	let sourceString;

	exports.sourceString = sourceString;

	function setupSourceContext(_sourceString) {
		exports.sourceString = sourceString = _sourceString;
		exports.index = index = 0;
		exports.line = line = _esastDistLoc.StartLine;
		exports.column = column = _esastDistLoc.StartColumn;
	}

	/*
 NOTE: We use character *codes* for everything.
 Characters are of type Number and not just Strings of length one.
 */

	function pos() {
		return new _esastDistLoc.Pos(line, column);
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

	// May eat a Newline.
	// Caller *must* check for that case and increment line!

	function eat() {
		const char = sourceString.charCodeAt(index);
		skip();
		return char;
	}

	function skip() {
		exports.index = index = index + 1;
		exports.column = column = column + 1;
	}

	// charToEat must not be Newline.

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
			exports.column = column = _esastDistLoc.StartColumn;
		}
		return canEat;
	}

	// Caller must ensure that backing up nCharsToBackUp characters brings us to oldPos.

	function stepBackMany(oldPos, nCharsToBackUp) {
		exports.index = index = index - nCharsToBackUp;
		exports.line = line = oldPos.line;
		exports.column = column = oldPos.column;
	}

	// For takeWhile, takeWhileWithPrev, and skipWhileEquals,
	// characterPredicate must *not* accept Newline.
	// Otherwise there may be an infinite loop!

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

	// Called after seeing the first newline.
	// Returns # total newlines, including the first.

	function skipNewlines() {
		const startLine = line;
		exports.line = line = line + 1;
		while (peek() === _chars.Chars.Newline) {
			exports.index = index = index + 1;
			exports.line = line = line + 1;
		}
		exports.column = column = _esastDistLoc.StartColumn;
		return line - startLine;
	}

	// Sprinkle checkPos() around to debug line and column tracking errors.
	/*
 function checkPos() {
 	const p = _getCorrectPos()
 	if (p.line !== line || p.column !== column)
 		throw new Error(`index: ${index}, wrong: ${Pos(line, column)}, right: ${p}`)
 }
 const _indexToPos = new Map()
 function _getCorrectPos() {
 	if (index === 0)
 		return Pos(StartLine, StartColumn)
 
 	let oldPos, oldIndex
 	for (oldIndex = index - 1; ; oldIndex = oldIndex - 1) {
 		oldPos = _indexToPos.get(oldIndex)
 		if (oldPos !== undefined)
 			break
 		assert(oldIndex >= 0)
 	}
 	let newLine = oldPos.line, newColumn = oldPos.column
 	for (; oldIndex < index; oldIndex = oldIndex + 1)
 		if (sourceString.charCodeAt(oldIndex) === Newline) {
 			newLine = newLine + 1
 			newColumn = StartColumn
 		} else
 			newColumn = newColumn + 1
 
 	const p = Pos(newLine, newColumn)
 	_indexToPos.set(index, p)
 	return p
 }
 */
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9zb3VyY2VDb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBVU8sS0FBSSxLQUFLLENBQUE7O0FBQ1QsS0FBSSxJQUFJLENBQUE7O0FBQ1IsS0FBSSxNQUFNLENBQUE7O0FBQ1YsS0FBSSxZQUFZLENBQUE7Ozs7QUFFaEIsVUFBUyxrQkFBa0IsQ0FBQyxhQUFhLEVBQUU7QUFDakQsVUFIVSxZQUFZLEdBR3RCLFlBQVksR0FBRyxhQUFhLENBQUE7QUFDNUIsVUFQVSxLQUFLLEdBT2YsS0FBSyxHQUFHLENBQUMsQ0FBQTtBQUNULFVBUFUsSUFBSSxHQU9kLElBQUksaUJBbEJRLFNBQVMsQUFrQkwsQ0FBQTtBQUNoQixVQVBVLE1BQU0sR0FPaEIsTUFBTSxpQkFuQmlCLFdBQVcsQUFtQmQsQ0FBQTtFQUNwQjs7Ozs7OztBQU9NLFVBQVMsR0FBRyxHQUFHO0FBQ3JCLFNBQU8sa0JBNUJBLEdBQUcsQ0E0QkssSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0VBQzVCOztBQUVNLFVBQVMsSUFBSSxHQUFHO0FBQ3RCLFNBQU8sWUFBWSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQTtFQUNyQzs7QUFDTSxVQUFTLFFBQVEsR0FBRztBQUMxQixTQUFPLFlBQVksQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFBO0VBQ3pDOztBQUNNLFVBQVMsUUFBUSxHQUFHO0FBQzFCLFNBQU8sWUFBWSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUE7RUFDekM7O0FBQ00sVUFBUyxXQUFXLEdBQUc7QUFDN0IsU0FBTyxZQUFZLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQTtFQUN6Qzs7Ozs7QUFJTSxVQUFTLEdBQUcsR0FBRztBQUNyQixRQUFNLElBQUksR0FBRyxZQUFZ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QTZHc0IsT0FBTyxDQUFDLENBQUE7RUFDMUM7O0FBRU0sVUFBUyxTQUFTLENBQUMsa0JBQWtCLEVBQUU7QUFDN0MsUUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFBO0FBQ3hCLFNBQU8sa0JBQWtCLENBQUMsSUFBSSxFQUFFLENBQUMsRUFDaEMsUUE1R1MsS0FBSyxHQTRHZCxLQUFLLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQTtBQUNsQixRQUFNLElBQUksR0FBRyxLQUFLLEdBQUcsVUFBVSxDQUFBO0FBQy9CLFVBNUdVLE1BQU0sR0E0R2hCLE1BQU0sR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ3RCLFNBQU8sSUFBSSxDQUFBO0VBQ1g7Ozs7O0FBSU0sVUFBUyxZQUFZLEdBQUc7QUFDOUIsUUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFBO0FBQ3RCLFVBckhVLElBQUksR0FxSGQsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUE7QUFDZixTQUFPLElBQUksRUFBRSxLQUFLLE9BOUhYLEtBQUssQ0E4SFksT0FBTyxFQUFFO0FBQ2hDLFdBeEhTLEtBQUssR0F3SGQsS0FBSyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUE7QUFDakIsV0F4SFMsSUFBSSxHQXdIYixJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQTtHQUNmO0FBQ0QsVUF6SFUsTUFBTSxHQXlIaEIsTUFBTSxpQkFySWlCLFdBQVcsQUFxSWQsQ0FBQTtBQUNwQixTQUFPLElBQUksR0FBRyxTQUFTLENBQUE7RUFDdkIiLCJmaWxlIjoic291cmNlQ29udGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UG9zLCBTdGFydExpbmUsIFN0YXJ0Q29sdW1ufSBmcm9tICdlc2FzdC9kaXN0L0xvYydcbmltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVja30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7Q2hhcnMsIHNob3dDaGFyfSBmcm9tICcuL2NoYXJzJ1xuXG4vKlxuVGhlc2UgYXJlIGtlcHQgdXAtdG8tZGF0ZSBhcyB3ZSBpdGVyYXRlIHRocm91Z2ggc291cmNlU3RyaW5nLlxuRXZlcnkgYWNjZXNzIHRvIGluZGV4IGhhcyBjb3JyZXNwb25kaW5nIGNoYW5nZXMgdG8gbGluZSBhbmQvb3IgY29sdW1uLlxuVGhpcyBhbHNvIGV4cGxhaW5zIHdoeSB0aGVyZSBhcmUgZGlmZmVyZW50IGZ1bmN0aW9ucyBmb3IgbmV3bGluZXMgdnMgb3RoZXIgY2hhcmFjdGVycy5cbiovXG5leHBvcnQgbGV0IGluZGV4XG5leHBvcnQgbGV0IGxpbmVcbmV4cG9ydCBsZXQgY29sdW1uXG5leHBvcnQgbGV0IHNvdXJjZVN0cmluZ1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBTb3VyY2VDb250ZXh0KF9zb3VyY2VTdHJpbmcpIHtcblx0c291cmNlU3RyaW5nID0gX3NvdXJjZVN0cmluZ1xuXHRpbmRleCA9IDBcblx0bGluZSA9IFN0YXJ0TGluZVxuXHRjb2x1bW4gPSBTdGFydENvbHVtblxufVxuXG4vKlxuTk9URTogV2UgdXNlIGNoYXJhY3RlciAqY29kZXMqIGZvciBldmVyeXRoaW5nLlxuQ2hhcmFjdGVycyBhcmUgb2YgdHlwZSBOdW1iZXIgYW5kIG5vdCBqdXN0IFN0cmluZ3Mgb2YgbGVuZ3RoIG9uZS5cbiovXG5cbmV4cG9ydCBmdW5jdGlvbiBwb3MoKSB7XG5cdHJldHVybiBuZXcgUG9zKGxpbmUsIGNvbHVtbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBlZWsoKSB7XG5cdHJldHVybiBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleClcbn1cbmV4cG9ydCBmdW5jdGlvbiBwZWVrTmV4dCgpIHtcblx0cmV0dXJuIHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4ICsgMSlcbn1cbmV4cG9ydCBmdW5jdGlvbiBwZWVrUHJldigpIHtcblx0cmV0dXJuIHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4IC0gMSlcbn1cbmV4cG9ydCBmdW5jdGlvbiBwZWVrMkJlZm9yZSgpIHtcblx0cmV0dXJuIHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4IC0gMilcbn1cblxuLy8gTWF5IGVhdCBhIE5ld2xpbmUuXG4vLyBDYWxsZXIgKm11c3QqIGNoZWNrIGZvciB0aGF0IGNhc2UgYW5kIGluY3JlbWVudCBsaW5lIVxuZXhwb3J0IGZ1bmN0aW9uIGVhdCgpIHtcblx0Y29uc3QgY2hhciA9IHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4KVxuXHRza2lwKClcblx0cmV0dXJuIGNoYXJcbn1cbmV4cG9ydCBmdW5jdGlvbiBza2lwKCkge1xuXHRpbmRleCA9IGluZGV4ICsgMVxuXHRjb2x1bW4gPSBjb2x1bW4gKyAxXG59XG5cbi8vIGNoYXJUb0VhdCBtdXN0IG5vdCBiZSBOZXdsaW5lLlxuZXhwb3J0IGZ1bmN0aW9uIHRyeUVhdChjaGFyVG9FYXQpIHtcblx0Y29uc3QgY2FuRWF0ID0gcGVlaygpID09PSBjaGFyVG9FYXRcblx0aWYgKGNhbkVhdCkge1xuXHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdFx0Y29sdW1uID0gY29sdW1uICsgMVxuXHR9XG5cdHJldHVybiBjYW5FYXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG11c3RFYXQoY2hhclRvRWF0LCBwcmVjZWRlZEJ5KSB7XG5cdGNvbnN0IGNhbkVhdCA9IHRyeUVhdChjaGFyVG9FYXQpXG5cdGNoZWNrKGNhbkVhdCwgcG9zLCAoKSA9PlxuXHRcdGAke2NvZGUocHJlY2VkZWRCeSl9IG11c3QgYmUgZm9sbG93ZWQgYnkgJHtzaG93Q2hhcihjaGFyVG9FYXQpfWApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cnlFYXROZXdsaW5lKCkge1xuXHRjb25zdCBjYW5FYXQgPSBwZWVrKCkgPT09IENoYXJzLk5ld2xpbmVcblx0aWYgKGNhbkVhdCkge1xuXHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdFx0bGluZSA9IGxpbmUgKyAxXG5cdFx0Y29sdW1uID0gU3RhcnRDb2x1bW5cblx0fVxuXHRyZXR1cm4gY2FuRWF0XG59XG5cbi8vIENhbGxlciBtdXN0IGVuc3VyZSB0aGF0IGJhY2tpbmcgdXAgbkNoYXJzVG9CYWNrVXAgY2hhcmFjdGVycyBicmluZ3MgdXMgdG8gb2xkUG9zLlxuZXhwb3J0IGZ1bmN0aW9uIHN0ZXBCYWNrTWFueShvbGRQb3MsIG5DaGFyc1RvQmFja1VwKSB7XG5cdGluZGV4ID0gaW5kZXggLSBuQ2hhcnNUb0JhY2tVcFxuXHRsaW5lID0gb2xkUG9zLmxpbmVcblx0Y29sdW1uID0gb2xkUG9zLmNvbHVtblxufVxuXG4vLyBGb3IgdGFrZVdoaWxlLCB0YWtlV2hpbGVXaXRoUHJldiwgYW5kIHNraXBXaGlsZUVxdWFscyxcbi8vIGNoYXJhY3RlclByZWRpY2F0ZSBtdXN0ICpub3QqIGFjY2VwdCBOZXdsaW5lLlxuLy8gT3RoZXJ3aXNlIHRoZXJlIG1heSBiZSBhbiBpbmZpbml0ZSBsb29wIVxuZXhwb3J0IGZ1bmN0aW9uIHRha2VXaGlsZShjaGFyYWN0ZXJQcmVkaWNhdGUpIHtcblx0cmV0dXJuIF90YWtlV2hpbGVXaXRoU3RhcnQoaW5kZXgsIGNoYXJhY3RlclByZWRpY2F0ZSlcbn1cbmV4cG9ydCBmdW5jdGlvbiB0YWtlV2hpbGVXaXRoUHJldihjaGFyYWN0ZXJQcmVkaWNhdGUpIHtcblx0cmV0dXJuIF90YWtlV2hpbGVXaXRoU3RhcnQoaW5kZXggLSAxLCBjaGFyYWN0ZXJQcmVkaWNhdGUpXG59XG5leHBvcnQgZnVuY3Rpb24gX3Rha2VXaGlsZVdpdGhTdGFydChzdGFydEluZGV4LCBjaGFyYWN0ZXJQcmVkaWNhdGUpIHtcblx0c2tpcFdoaWxlKGNoYXJhY3RlclByZWRpY2F0ZSlcblx0cmV0dXJuIHNvdXJjZVN0cmluZy5zbGljZShzdGFydEluZGV4LCBpbmRleClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNraXBXaGlsZUVxdWFscyhjaGFyKSB7XG5cdHJldHVybiBza2lwV2hpbGUoXyA9PiBfID09PSBjaGFyKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2tpcFJlc3RPZkxpbmUoKSB7XG5cdHJldHVybiBza2lwV2hpbGUoXyA9PiBfICE9PSBDaGFycy5OZXdsaW5lKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZWF0UmVzdE9mTGluZSgpIHtcblx0cmV0dXJuIHRha2VXaGlsZShfID0+IF8gIT09IENoYXJzLk5ld2xpbmUpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBza2lwV2hpbGUoY2hhcmFjdGVyUHJlZGljYXRlKSB7XG5cdGNvbnN0IHN0YXJ0SW5kZXggPSBpbmRleFxuXHR3aGlsZSAoY2hhcmFjdGVyUHJlZGljYXRlKHBlZWsoKSkpXG5cdFx0aW5kZXggPSBpbmRleCArIDFcblx0Y29uc3QgZGlmZiA9IGluZGV4IC0gc3RhcnRJbmRleFxuXHRjb2x1bW4gPSBjb2x1bW4gKyBkaWZmXG5cdHJldHVybiBkaWZmXG59XG5cbi8vIENhbGxlZCBhZnRlciBzZWVpbmcgdGhlIGZpcnN0IG5ld2xpbmUuXG4vLyBSZXR1cm5zICMgdG90YWwgbmV3bGluZXMsIGluY2x1ZGluZyB0aGUgZmlyc3QuXG5leHBvcnQgZnVuY3Rpb24gc2tpcE5ld2xpbmVzKCkge1xuXHRjb25zdCBzdGFydExpbmUgPSBsaW5lXG5cdGxpbmUgPSBsaW5lICsgMVxuXHR3aGlsZSAocGVlaygpID09PSBDaGFycy5OZXdsaW5lKSB7XG5cdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRsaW5lID0gbGluZSArIDFcblx0fVxuXHRjb2x1bW4gPSBTdGFydENvbHVtblxuXHRyZXR1cm4gbGluZSAtIHN0YXJ0TGluZVxufVxuXG4vLyBTcHJpbmtsZSBjaGVja1BvcygpIGFyb3VuZCB0byBkZWJ1ZyBsaW5lIGFuZCBjb2x1bW4gdHJhY2tpbmcgZXJyb3JzLlxuLypcbmZ1bmN0aW9uIGNoZWNrUG9zKCkge1xuXHRjb25zdCBwID0gX2dldENvcnJlY3RQb3MoKVxuXHRpZiAocC5saW5lICE9PSBsaW5lIHx8IHAuY29sdW1uICE9PSBjb2x1bW4pXG5cdFx0dGhyb3cgbmV3IEVycm9yKGBpbmRleDogJHtpbmRleH0sIHdyb25nOiAke1BvcyhsaW5lLCBjb2x1bW4pfSwgcmlnaHQ6ICR7cH1gKVxufVxuY29uc3QgX2luZGV4VG9Qb3MgPSBuZXcgTWFwKClcbmZ1bmN0aW9uIF9nZXRDb3JyZWN0UG9zKCkge1xuXHRpZiAoaW5kZXggPT09IDApXG5cdFx0cmV0dXJuIFBvcyhTdGFydExpbmUsIFN0YXJ0Q29sdW1uKVxuXG5cdGxldCBvbGRQb3MsIG9sZEluZGV4XG5cdGZvciAob2xkSW5kZXggPSBpbmRleCAtIDE7IDsgb2xkSW5kZXggPSBvbGRJbmRleCAtIDEpIHtcblx0XHRvbGRQb3MgPSBfaW5kZXhUb1Bvcy5nZXQob2xkSW5kZXgpXG5cdFx0aWYgKG9sZFBvcyAhPT0gdW5kZWZpbmVkKVxuXHRcdFx0YnJlYWtcblx0XHRhc3NlcnQob2xkSW5kZXggPj0gMClcblx0fVxuXHRsZXQgbmV3TGluZSA9IG9sZFBvcy5saW5lLCBuZXdDb2x1bW4gPSBvbGRQb3MuY29sdW1uXG5cdGZvciAoOyBvbGRJbmRleCA8IGluZGV4OyBvbGRJbmRleCA9IG9sZEluZGV4ICsgMSlcblx0XHRpZiAoc291cmNlU3RyaW5nLmNoYXJDb2RlQXQob2xkSW5kZXgpID09PSBOZXdsaW5lKSB7XG5cdFx0XHRuZXdMaW5lID0gbmV3TGluZSArIDFcblx0XHRcdG5ld0NvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cdFx0fSBlbHNlXG5cdFx0XHRuZXdDb2x1bW4gPSBuZXdDb2x1bW4gKyAxXG5cblx0Y29uc3QgcCA9IFBvcyhuZXdMaW5lLCBuZXdDb2x1bW4pXG5cdF9pbmRleFRvUG9zLnNldChpbmRleCwgcClcblx0cmV0dXJuIHBcbn1cbiovXG4iXX0=
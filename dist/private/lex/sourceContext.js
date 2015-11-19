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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzb3VyY2VDb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOltdfQ==
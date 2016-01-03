(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Loc'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Loc_1 = require('esast/lib/Loc');
    function setupSourceContext(_sourceString) {
        exports.sourceString = _sourceString;
        exports.index = 0;
        exports.line = Loc_1.Pos.start.line;
        exports.column = Loc_1.Pos.start.column;
    }
    exports.setupSourceContext = setupSourceContext;
    function pos() {
        return new Loc_1.Pos(exports.line, exports.column);
    }
    exports.pos = pos;
    function peek() {
        let n = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

        return exports.sourceString.charCodeAt(exports.index + n);
    }
    exports.peek = peek;
    function eat() {
        const char = exports.sourceString.charCodeAt(exports.index);
        skip();
        return char;
    }
    exports.eat = eat;
    function skip() {
        let n = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

        exports.index = exports.index + n;
        exports.column = exports.column + n;
    }
    exports.skip = skip;
    function tryEat(charToEat) {
        const canEat = peek() === charToEat;
        if (canEat) skip();
        return canEat;
    }
    exports.tryEat = tryEat;
    function tryEat2(char1, char2) {
        const canEat = peek() === char1 && peek(1) === char2;
        if (canEat) skip(2);
        return canEat;
    }
    exports.tryEat2 = tryEat2;
    function tryEat3(char1, char2, char3) {
        const canEat = peek() === char1 && peek(1) === char2 && peek(2) === char3;
        if (canEat) skip(3);
        return canEat;
    }
    exports.tryEat3 = tryEat3;
    function tryEatNewline() {
        const canEat = peek() === 10;
        if (canEat) {
            exports.index = exports.index + 1;
            exports.line = exports.line + 1;
            exports.column = Loc_1.Pos.start.column;
        }
        return canEat;
    }
    exports.tryEatNewline = tryEatNewline;
    function stepBackMany(oldPos, nCharsToBackUp) {
        exports.index = exports.index - nCharsToBackUp;
        exports.line = oldPos.line;
        exports.column = oldPos.column;
    }
    exports.stepBackMany = stepBackMany;
    function takeWhile(characterPredicate) {
        return takeWhileWithStart(exports.index, characterPredicate);
    }
    exports.takeWhile = takeWhile;
    function takeWhileWithPrev(characterPredicate) {
        return takeWhileWithStart(exports.index - 1, characterPredicate);
    }
    exports.takeWhileWithPrev = takeWhileWithPrev;
    function takeWhileWithStart(startIndex, characterPredicate) {
        skipWhile(characterPredicate);
        return exports.sourceString.slice(startIndex, exports.index);
    }
    function skipWhileEquals(char) {
        return skipWhile(_ => _ === char);
    }
    exports.skipWhileEquals = skipWhileEquals;
    function skipRestOfLine() {
        return skipWhile(_ => _ !== 10);
    }
    exports.skipRestOfLine = skipRestOfLine;
    function eatRestOfLine() {
        return takeWhile(_ => _ !== 10);
    }
    exports.eatRestOfLine = eatRestOfLine;
    function skipWhile(characterPredicate) {
        const startIndex = exports.index;
        while (characterPredicate(peek())) exports.index = exports.index + 1;
        const diff = exports.index - startIndex;
        exports.column = exports.column + diff;
        return diff;
    }
    exports.skipWhile = skipWhile;
    function skipNewlines() {
        const startLine = exports.line;
        exports.line = exports.line + 1;
        while (peek() === 10) {
            exports.index = exports.index + 1;
            exports.line = exports.line + 1;
        }
        exports.column = Loc_1.Pos.start.column;
        return exports.line - startLine;
    }
    exports.skipNewlines = skipNewlines;
});
//# sourceMappingURL=sourceContext.js.map

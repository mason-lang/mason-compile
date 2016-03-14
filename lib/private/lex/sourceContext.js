(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Loc', '../util'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Loc_1 = require('esast/lib/Loc');
    const util_1 = require('../util');
    function setupSourceContext(source) {
        exports.sourceString = source;
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
        return tryEatIf(_ => _ === charToEat);
    }
    exports.tryEat = tryEat;
    function tryEatIf(pred) {
        const canEat = pred(peek());
        if (canEat) skip();
        return canEat;
    }
    exports.tryEatIf = tryEatIf;
    function tryEat2(char1, char2) {
        const canEat = peek() === char1 && peek(1) === char2;
        if (canEat) skip(2);
        return canEat;
    }
    exports.tryEat2 = tryEat2;
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
    function skipRestOfLine() {
        skipUntilRegExp(lineFeedRgx);
    }
    exports.skipRestOfLine = skipRestOfLine;
    const lineFeedRgx = /\n/g;
    function takeRestOfLine() {
        return takeUntilRegExp(lineFeedRgx);
    }
    exports.takeRestOfLine = takeRestOfLine;
    function skipUntilRegExp(rgx) {
        const startIndex = exports.index;
        rgx.lastIndex = startIndex;
        exports.index = rgx.exec(exports.sourceString).index;
        util_1.assert(exports.index !== null);
        const diff = exports.index - startIndex;
        exports.column = exports.column + diff;
        return diff;
    }
    function takeUntilRegExp(rgx) {
        const startIndex = exports.index;
        skipUntilRegExp(rgx);
        return exports.sourceString.slice(startIndex, exports.index);
    }
    function takeName() {
        const startIndex = exports.index - 1;
        skipUntilRegExp(nameRgx);
        return exports.sourceString.slice(startIndex, exports.index);
    }
    exports.takeName = takeName;
    const nameRgx = /[`&\(\)\[\]\{\}|:'". \n\t#^\\;,]/g;
    function isNameCharacter(ch) {
        return isAllNameCharacters(String.fromCharCode(ch));
    }
    exports.isNameCharacter = isNameCharacter;
    function isAllNameCharacters(str) {
        nameRgx.lastIndex = 0;
        return !nameRgx.test(str);
    }
    exports.isAllNameCharacters = isAllNameCharacters;
    function skipSpaces() {
        return skipUntilRegExp(spacesRgx);
    }
    exports.skipSpaces = skipSpaces;
    const spacesRgx = /[^ ]/g;
    function skipTabs() {
        return skipUntilRegExp(tabsRgx);
    }
    exports.skipTabs = skipTabs;
    const tabsRgx = /[^\t]/g;
    function skipNumBinary() {
        skipUntilRegExp(binRgx);
    }
    exports.skipNumBinary = skipNumBinary;
    const binRgx = /[^01]/g;
    function skipNumOctal() {
        skipUntilRegExp(octRgx);
    }
    exports.skipNumOctal = skipNumOctal;
    const octRgx = /[^0-8]/g;
    function skipNumHex() {
        skipUntilRegExp(hexRgx);
    }
    exports.skipNumHex = skipNumHex;
    const hexRgx = /[^\da-f]/g;
    function skipNumDecimal() {
        skipUntilRegExp(decRgx);
    }
    exports.skipNumDecimal = skipNumDecimal;
    const decRgx = /[^\d]/g;
    function isDigitDecimal(_) {
        return 48 <= _ && _ <= 57;
    }
    exports.isDigitDecimal = isDigitDecimal;
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

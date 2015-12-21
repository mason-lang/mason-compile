(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Loc', '../context', '../Token', '../util', './chars', './groupContext', './lexName', './lexPlain', './sourceContext'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Loc_1 = require('esast/lib/Loc');
    var context_1 = require('../context');
    var Token_1 = require('../Token');
    var util_1 = require('../util');
    var chars_1 = require('./chars');
    var groupContext_1 = require('./groupContext');
    var lexName_1 = require('./lexName');
    var lexPlain_1 = require('./lexPlain');
    var sourceContext_1 = require('./sourceContext');
    function lexQuote(indent, isRegExp) {
        const quoteIndent = indent + 1;
        const isIndented = sourceContext_1.tryEatNewline();
        if (isIndented) {
            const actualIndent = sourceContext_1.skipWhileEquals(chars_1.Char.Tab);
            context_1.check(actualIndent === quoteIndent, sourceContext_1.pos, _ => _.tooMuchIndentQuote);
        }
        let read = '';
        function add(str) {
            read = `${ read }${ str }`;
        }
        function addChar(char) {
            add(String.fromCharCode(char));
        }
        function maybeOutputRead() {
            if (read !== '') {
                groupContext_1.addToCurrentGroup(new Token_1.StringToken(null, read));
                read = '';
            }
        }
        function locSingle() {
            return Loc_1.default.singleChar(sourceContext_1.pos());
        }
        const groupType = isRegExp ? Token_1.GroupRegExp : Token_1.GroupQuote;
        groupContext_1.openGroup(locSingle().start, groupType);
        eatChars: for (;;) {
            const char = sourceContext_1.eat();
            switch (char) {
                case chars_1.Char.Backslash:
                    {
                        const next = sourceContext_1.eat();
                        if (next === chars_1.Char.Hash || next === (isRegExp ? chars_1.Char.Backtick : chars_1.Char.Quote)) addChar(next);else add(`\\${ String.fromCharCode(next) }`);
                        break;
                    }
                case chars_1.Char.Hash:
                    maybeOutputRead();
                    if (sourceContext_1.tryEat(chars_1.Char.OpenParenthesis)) {
                        const l = locSingle();
                        groupContext_1.openInterpolation(l);
                        lexPlain_1.default(true);
                    } else {
                        const startPos = sourceContext_1.pos();
                        const firstChar = sourceContext_1.eat();
                        context_1.check(chars_1.isNameCharacter(firstChar), sourceContext_1.pos, _ => _.badInterpolation);
                        lexName_1.default(startPos, true);
                    }
                    break;
                case chars_1.Char.Newline:
                    {
                        const originalPos = sourceContext_1.pos();
                        originalPos.column = originalPos.column - 1;
                        context_1.check(isIndented, sourceContext_1.pos, _ => _.unclosedQuote);
                        const numNewlines = sourceContext_1.skipNewlines();
                        const newIndent = sourceContext_1.skipWhileEquals(chars_1.Char.Tab);
                        if (newIndent < quoteIndent) {
                            sourceContext_1.stepBackMany(originalPos, numNewlines + newIndent);
                            util_1.assert(sourceContext_1.peek() === chars_1.Char.Newline);
                            break eatChars;
                        } else add('\n'.repeat(numNewlines) + '\t'.repeat(newIndent - quoteIndent));
                        break;
                    }
                case chars_1.Char.Backtick:
                    if (isRegExp) {
                        if (isIndented) addChar(char);else break eatChars;
                    } else add('\\\`');
                    break;
                case chars_1.Char.Quote:
                    if (!isRegExp && !isIndented) break eatChars;else addChar(char);
                    break;
                default:
                    addChar(char);
            }
        }
        maybeOutputRead();
        if (isRegExp) groupContext_1.curGroup.flags = lexRegExpFlags();else warnForSimpleQuote(groupContext_1.curGroup);
        groupContext_1.closeGroup(sourceContext_1.pos(), groupType);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = lexQuote;
    function warnForSimpleQuote(quoteGroup) {
        const tokens = quoteGroup.subTokens;
        if (tokens.length === 1) {
            const name = tokens[0];
            if (name instanceof Token_1.StringToken && isName(name.value)) context_1.warn(sourceContext_1.pos(), _ => _.suggestSimpleQuote(name.value));
        }
    }
    function isName(str) {
        const cc0 = str.charCodeAt(0);
        if (chars_1.isDigit(cc0) || cc0 === chars_1.Char.Tilde) return false;
        for (let i = 0; i < str.length; i = i + 1) if (!chars_1.isNameCharacter(str.charCodeAt(i))) return false;
        return true;
    }
    function lexRegExpFlags() {
        let flags = '';
        for (const ch of [chars_1.Char.G, chars_1.Char.I, chars_1.Char.M, chars_1.Char.Y]) if (sourceContext_1.tryEat(ch)) flags = flags + String.fromCharCode(ch);
        return flags;
    }
});
//# sourceMappingURL=lexQuote.js.map

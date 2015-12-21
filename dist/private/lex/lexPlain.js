(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Loc', '../context', '../Token', '../util', './chars', './groupContext', './lex*', './lexName', './sourceContext'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Loc_1 = require('esast/lib/Loc');
    var context_1 = require('../context');
    var Token_1 = require('../Token');
    var util_1 = require('../util');
    var chars_1 = require('./chars');
    var groupContext_1 = require('./groupContext');
    var lex_1 = require('./lex*');
    var lexName_1 = require('./lexName');
    var sourceContext_1 = require('./sourceContext');
    function lexPlain(isInQuote) {
        let indent = 0;
        let startColumn;
        function startPos() {
            return new Loc_1.Pos(sourceContext_1.line, startColumn);
        }
        function loc() {
            return new Loc_1.default(startPos(), sourceContext_1.pos());
        }
        function keyword(kind) {
            groupContext_1.addToCurrentGroup(new Token_1.Keyword(loc(), kind));
        }
        function funKeyword(kind) {
            keyword(kind);
            groupContext_1.space(loc());
        }
        function eatAndAddNumber() {
            const startIndex = sourceContext_1.index - 1;
            sourceContext_1.tryEat(chars_1.Char.Hyphen);
            if (sourceContext_1.peek(-1) === chars_1.Char.N0) {
                const p = sourceContext_1.peek();
                switch (p) {
                    case chars_1.Char.LetterB:
                    case chars_1.Char.LetterO:
                    case chars_1.Char.LetterX:
                        {
                            sourceContext_1.skip();
                            const isDigitSpecial = p === chars_1.Char.LetterB ? chars_1.isDigitBinary : p === chars_1.Char.LetterO ? chars_1.isDigitOctal : chars_1.isDigitHex;
                            sourceContext_1.skipWhile(isDigitSpecial);
                            break;
                        }
                    case chars_1.Char.Dot:
                        if (chars_1.isDigit(sourceContext_1.peek(1))) {
                            sourceContext_1.skip();
                            sourceContext_1.skipWhile(chars_1.isDigit);
                        }
                        break;
                    default:
                }
            } else {
                sourceContext_1.skipWhile(chars_1.isDigit);
                if (sourceContext_1.peek() === chars_1.Char.Dot && chars_1.isDigit(sourceContext_1.peek(1))) {
                    sourceContext_1.skip();
                    sourceContext_1.skipWhile(chars_1.isDigit);
                }
            }
            const str = sourceContext_1.sourceString.slice(startIndex, sourceContext_1.index);
            groupContext_1.addToCurrentGroup(new Token_1.NumberToken(loc(), str));
        }
        function eatIndent() {
            const optIndent = context_1.options.indent;
            if (typeof optIndent === 'number') {
                const spaces = sourceContext_1.skipWhileEquals(chars_1.Char.Space);
                context_1.check(spaces % optIndent === 0, sourceContext_1.pos, _ => _.badSpacedIndent(optIndent));
                return spaces / optIndent;
            } else {
                const indent = sourceContext_1.skipWhileEquals(chars_1.Char.Tab);
                context_1.check(sourceContext_1.peek() !== chars_1.Char.Space, sourceContext_1.pos, _ => _.noLeadingSpace);
                return indent;
            }
        }
        function handleName() {
            lexName_1.default(startPos(), false);
        }
        loop: for (;;) {
            startColumn = sourceContext_1.column;
            const characterEaten = sourceContext_1.eat();
            switch (characterEaten) {
                case chars_1.Char.Null:
                    break loop;
                case chars_1.Char.Backtick:
                case chars_1.Char.Quote:
                    lex_1.lexQuote(indent, characterEaten === chars_1.Char.Backtick);
                    break;
                case chars_1.Char.OpenParenthesis:
                    if (sourceContext_1.tryEat(chars_1.Char.CloseParenthesis)) groupContext_1.addToCurrentGroup(new Token_1.GroupParenthesis(loc(), []));else groupContext_1.openParenthesis(loc());
                    break;
                case chars_1.Char.OpenBracket:
                    if (sourceContext_1.tryEat(chars_1.Char.CloseBracket)) groupContext_1.addToCurrentGroup(new Token_1.GroupBracket(loc(), []));else {
                        groupContext_1.openGroup(startPos(), Token_1.GroupBracket);
                        groupContext_1.openGroup(sourceContext_1.pos(), Token_1.GroupSpace);
                    }
                    break;
                case chars_1.Char.CloseParenthesis:
                    if (groupContext_1.closeInterpolationOrParenthesis(loc())) {
                        util_1.assert(isInQuote);
                        break loop;
                    }
                    break;
                case chars_1.Char.CloseBracket:
                    groupContext_1.closeGroup(startPos(), Token_1.GroupSpace);
                    groupContext_1.closeGroup(sourceContext_1.pos(), Token_1.GroupBracket);
                    break;
                case chars_1.Char.Space:
                    groupContext_1.space(loc());
                    break;
                case chars_1.Char.Newline:
                    {
                        context_1.check(!isInQuote, loc, _ => _.noNewlineInInterpolation);
                        if (sourceContext_1.peek(-2) === chars_1.Char.Space) context_1.warn(sourceContext_1.pos(), _ => _.trailingSpace);
                        sourceContext_1.skipNewlines();
                        const oldIndent = indent;
                        indent = eatIndent();
                        if (indent > oldIndent) {
                            context_1.check(indent === oldIndent + 1, loc, _ => _.tooMuchIndent);
                            const l = loc();
                            if (util_1.isEmpty(groupContext_1.curGroup.subTokens) || !Token_1.isKeyword(83, util_1.last(groupContext_1.curGroup.subTokens))) {
                                if (groupContext_1.curGroup instanceof Token_1.GroupSpace) groupContext_1.closeSpaceOKIfEmpty(l.start);
                                groupContext_1.openGroup(l.end, Token_1.GroupSpace);
                            }
                            groupContext_1.openGroup(l.start, Token_1.GroupBlock);
                            groupContext_1.openLine(l.end);
                        } else {
                            const l = loc();
                            for (let i = indent; i < oldIndent; i = i + 1) groupContext_1.closeGroupsForDedent(l.start);
                            groupContext_1.closeLine(l.start);
                            groupContext_1.openLine(l.end);
                        }
                        break;
                    }
                case chars_1.Char.Tab:
                    throw context_1.fail(loc(), _ => _.nonLeadingTab);
                case chars_1.Char.Bang:
                    if (sourceContext_1.tryEat(chars_1.Char.Bar)) funKeyword(66);else handleName();
                    break;
                case chars_1.Char.Cash:
                    if (sourceContext_1.tryEat2(chars_1.Char.Bang, chars_1.Char.Bar)) funKeyword(70);else if (sourceContext_1.tryEat(chars_1.Char.Bar)) funKeyword(69);else handleName();
                    break;
                case chars_1.Char.Star:
                    if (sourceContext_1.tryEat2(chars_1.Char.Bang, chars_1.Char.Bar)) funKeyword(74);else if (sourceContext_1.tryEat(chars_1.Char.Bar)) funKeyword(73);else handleName();
                    break;
                case chars_1.Char.Bar:
                    if (sourceContext_1.tryEat(chars_1.Char.Space) || sourceContext_1.tryEat(chars_1.Char.Tab)) {
                        const text = sourceContext_1.eatRestOfLine();
                        groupContext_1.closeSpaceOKIfEmpty(startPos());
                        context_1.check(groupContext_1.curGroup instanceof Token_1.GroupLine && groupContext_1.curGroup.subTokens.length === 0, loc, _ => _.trailingDocComment);
                        groupContext_1.addToCurrentGroup(new Token_1.DocComment(loc(), text));
                    } else if (sourceContext_1.tryEat(chars_1.Char.Bar)) sourceContext_1.skipRestOfLine();else funKeyword(65);
                    break;
                case chars_1.Char.Hyphen:
                    if (chars_1.isDigit(sourceContext_1.peek())) eatAndAddNumber();else handleName();
                    break;
                case chars_1.Char.N0:
                case chars_1.Char.N1:
                case chars_1.Char.N2:
                case chars_1.Char.N3:
                case chars_1.Char.N4:
                case chars_1.Char.N5:
                case chars_1.Char.N6:
                case chars_1.Char.N7:
                case chars_1.Char.N8:
                case chars_1.Char.N9:
                    eatAndAddNumber();
                    break;
                case chars_1.Char.Dot:
                    {
                        if (sourceContext_1.peek() === chars_1.Char.Space || sourceContext_1.peek() === chars_1.Char.Newline) {
                            groupContext_1.closeSpaceOKIfEmpty(startPos());
                            keyword(92);
                        } else if (sourceContext_1.tryEat(chars_1.Char.Bar)) funKeyword(67);else if (sourceContext_1.tryEat2(chars_1.Char.Bang, chars_1.Char.Bar)) funKeyword(68);else if (sourceContext_1.tryEat2(chars_1.Char.Star, chars_1.Char.Bar)) funKeyword(75);else if (sourceContext_1.tryEat3(chars_1.Char.Star, chars_1.Char.Bang, chars_1.Char.Bar)) funKeyword(76);else if (sourceContext_1.tryEat(chars_1.Char.Dot)) {
                            if (sourceContext_1.tryEat(chars_1.Char.Dot)) keyword(54);else keyword(53);
                        } else keyword(52);
                        break;
                    }
                case chars_1.Char.Colon:
                    if (sourceContext_1.tryEat(chars_1.Char.Equal)) keyword(84);else keyword(47);
                    break;
                case chars_1.Char.Tick:
                    keyword(102);
                    break;
                case chars_1.Char.Tilde:
                    keyword(83);
                    break;
                case chars_1.Char.Ampersand:
                    keyword(35);
                    break;
                case chars_1.Char.Backslash:
                case chars_1.Char.Caret:
                case chars_1.Char.CloseBrace:
                case chars_1.Char.Comma:
                case chars_1.Char.Hash:
                case chars_1.Char.OpenBrace:
                case chars_1.Char.Percent:
                case chars_1.Char.Semicolon:
                    throw context_1.fail(loc(), _ => _.reservedChar(characterEaten));
                default:
                    handleName();
            }
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = lexPlain;
});
//# sourceMappingURL=lexPlain.js.map

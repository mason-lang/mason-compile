(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Loc', '../context', '../token/Group', '../token/Keyword', '../token/Token', '../util', './chars', './groupContext', './lexName', './lexQuote', './sourceContext'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Loc_1 = require('esast/lib/Loc');
    const context_1 = require('../context');
    const Group_1 = require('../token/Group');
    const Keyword_1 = require('../token/Keyword');
    const Token_1 = require('../token/Token');
    const util_1 = require('../util');
    const chars_1 = require('./chars');
    const groupContext_1 = require('./groupContext');
    const lexName_1 = require('./lexName');
    const lexQuote_1 = require('./lexQuote');
    const sourceContext_1 = require('./sourceContext');
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
            groupContext_1.addToCurrentGroup(new Keyword_1.default(loc(), kind));
        }
        function funKeyword(kind) {
            keyword(kind);
            groupContext_1.space(loc());
        }
        function eatAndAddNumber() {
            const startIndex = sourceContext_1.index - 1;
            sourceContext_1.tryEat(45);
            if (sourceContext_1.peek(-1) === 48) {
                const p = sourceContext_1.peek();
                switch (p) {
                    case 66:
                    case 79:
                    case 88:
                        {
                            sourceContext_1.skip();
                            const isDigitSpecial = p === 66 ? chars_1.isDigitBinary : p === 79 ? chars_1.isDigitOctal : chars_1.isDigitHex;
                            sourceContext_1.skipWhile(isDigitSpecial);
                            break;
                        }
                    case 46:
                        if (chars_1.isDigitDecimal(sourceContext_1.peek(1))) {
                            sourceContext_1.skip();
                            sourceContext_1.skipWhile(chars_1.isDigitDecimal);
                        }
                        break;
                    default:
                }
            } else {
                sourceContext_1.skipWhile(chars_1.isDigitDecimal);
                if (sourceContext_1.peek() === 46 && chars_1.isDigitDecimal(sourceContext_1.peek(1))) {
                    sourceContext_1.skip();
                    sourceContext_1.skipWhile(chars_1.isDigitDecimal);
                }
            }
            const str = sourceContext_1.sourceString.slice(startIndex, sourceContext_1.index);
            groupContext_1.addToCurrentGroup(new Token_1.NumberToken(loc(), str));
        }
        function eatIndent() {
            const optIndent = context_1.compileOptions.indent;
            if (typeof optIndent === 'number') {
                const spaces = sourceContext_1.skipWhileEquals(32);
                context_1.check(spaces % optIndent === 0, sourceContext_1.pos, _ => _.badSpacedIndent(optIndent));
                return spaces / optIndent;
            } else {
                const indent = sourceContext_1.skipWhileEquals(9);
                context_1.check(sourceContext_1.peek() !== 32, sourceContext_1.pos, _ => _.noLeadingSpace);
                return indent;
            }
        }
        function handleName() {
            lexName_1.default(startPos(), false);
        }
        while (true) {
            startColumn = sourceContext_1.column;
            const characterEaten = sourceContext_1.eat();
            switch (characterEaten) {
                case 0:
                    return;
                case 96:
                case 34:
                    lexQuote_1.default(indent, characterEaten === 96);
                    break;
                case 40:
                    if (sourceContext_1.tryEat(41)) groupContext_1.addToCurrentGroup(new Group_1.GroupParenthesis(loc(), []));else groupContext_1.openParenthesis(loc());
                    break;
                case 91:
                    if (sourceContext_1.tryEat(93)) groupContext_1.addToCurrentGroup(new Group_1.GroupBracket(loc(), []));else {
                        groupContext_1.openGroup(startPos(), Group_1.GroupBracket);
                        groupContext_1.openGroup(sourceContext_1.pos(), Group_1.GroupSpace);
                    }
                    break;
                case 41:
                    if (groupContext_1.closeInterpolationOrParenthesis(loc())) {
                        util_1.assert(isInQuote);
                        return;
                    }
                    break;
                case 93:
                    groupContext_1.closeGroup(startPos(), Group_1.GroupSpace);
                    groupContext_1.closeGroup(sourceContext_1.pos(), Group_1.GroupBracket);
                    break;
                case 32:
                    groupContext_1.space(loc());
                    break;
                case 10:
                    {
                        context_1.check(!isInQuote, loc, _ => _.noNewlineInInterpolation);
                        if (sourceContext_1.peek(-2) === 32) context_1.warn(sourceContext_1.pos(), _ => _.trailingSpace);
                        sourceContext_1.skipNewlines();
                        const oldIndent = indent;
                        indent = eatIndent();
                        if (indent > oldIndent) {
                            context_1.check(indent === oldIndent + 1, loc, _ => _.tooMuchIndent);
                            const l = loc();
                            if (util_1.isEmpty(groupContext_1.curGroup.subTokens) || !Keyword_1.isKeyword(132, util_1.last(groupContext_1.curGroup.subTokens))) {
                                if (groupContext_1.curGroup instanceof Group_1.GroupSpace) groupContext_1.closeSpaceOKIfEmpty(l.start);
                                groupContext_1.openGroup(l.end, Group_1.GroupSpace);
                            }
                            groupContext_1.openGroup(l.start, Group_1.GroupBlock);
                            groupContext_1.openLine(l.end);
                        } else {
                            const l = loc();
                            for (let i = indent; i < oldIndent; i = i + 1) groupContext_1.closeGroupsForDedent(l.start);
                            groupContext_1.closeLine(l.start);
                            groupContext_1.openLine(l.end);
                        }
                        break;
                    }
                case 9:
                    throw context_1.fail(loc(), _ => _.nonLeadingTab);
                case 33:
                    if (sourceContext_1.tryEat(92)) funKeyword(115);else handleName();
                    break;
                case 36:
                    if (sourceContext_1.tryEat2(33, 92)) funKeyword(119);else if (sourceContext_1.tryEat(92)) funKeyword(118);else handleName();
                    break;
                case 42:
                    if (sourceContext_1.tryEat2(33, 92)) funKeyword(123);else if (sourceContext_1.tryEat(92)) funKeyword(122);else handleName();
                    break;
                case 92:
                    funKeyword(114);
                    break;
                case 124:
                    const isDocComment = !sourceContext_1.tryEat(124);
                    if (!(sourceContext_1.tryEat(32) || sourceContext_1.tryEat(9) || sourceContext_1.peek() === 10)) context_1.warn(sourceContext_1.pos(), _ => _.commentNeedsSpace);
                    if (isDocComment) {
                        const text = sourceContext_1.eatRestOfLine();
                        groupContext_1.closeSpaceOKIfEmpty(startPos());
                        context_1.check(groupContext_1.curGroup instanceof Group_1.GroupLine && groupContext_1.curGroup.subTokens.length === 0, loc, _ => _.trailingDocComment);
                        groupContext_1.addToCurrentGroup(new Token_1.DocComment(loc(), text));
                    } else sourceContext_1.skipRestOfLine();
                    break;
                case 45:
                    if (chars_1.isDigitDecimal(sourceContext_1.peek())) eatAndAddNumber();else handleName();
                    break;
                case 48:
                case 49:
                case 50:
                case 51:
                case 52:
                case 53:
                case 54:
                case 55:
                case 56:
                case 57:
                    eatAndAddNumber();
                    break;
                case 46:
                    {
                        if (sourceContext_1.peek() === 32 || sourceContext_1.peek() === 10) {
                            groupContext_1.closeSpaceOKIfEmpty(startPos());
                            keyword(140);
                        } else if (sourceContext_1.tryEat(92)) funKeyword(116);else if (sourceContext_1.tryEat2(33, 92)) funKeyword(117);else if (sourceContext_1.tryEat2(42, 92)) funKeyword(124);else if (sourceContext_1.tryEat3(42, 33, 92)) funKeyword(125);else if (sourceContext_1.tryEat(46)) {
                            if (sourceContext_1.tryEat(46)) keyword(103);else keyword(102);
                        } else keyword(101);
                        break;
                    }
                case 58:
                    if (sourceContext_1.tryEat(61)) keyword(133);else keyword(96);
                    break;
                case 39:
                    keyword(164);
                    break;
                case 126:
                    keyword(132);
                    break;
                case 38:
                    keyword(85);
                    break;
                case 92:
                case 94:
                case 125:
                case 44:
                case 35:
                case 123:
                case 59:
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

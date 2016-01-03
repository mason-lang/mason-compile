var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../ast/Block', '../ast/Fun', '../ast/locals', '../token/Group', '../token/Keyword', '../util', './checks', './parseBlock', './parseCase', './parseLocalDeclares', './parseSpaced', './parseSwitch', './Slice', './tryTakeComment'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Block_1 = require('../ast/Block');
    var Fun_1 = require('../ast/Fun');
    var locals_1 = require('../ast/locals');
    var Group_1 = require('../token/Group');
    var Keyword_1 = require('../token/Keyword');
    var util_1 = require('../util');
    var checks_1 = require('./checks');
    var parseBlock_1 = require('./parseBlock');
    var parseCase_1 = require('./parseCase');
    var parseLocalDeclares_1 = require('./parseLocalDeclares');
    var parseSpaced_1 = require('./parseSpaced');
    var parseSwitch_1 = require('./parseSwitch');
    var Slice_1 = require('./Slice');
    var tryTakeComment_1 = require('./tryTakeComment');
    function parseFun(keywordKind, tokens) {
        var _funKind = funKind(keywordKind);

        var _funKind2 = _slicedToArray(_funKind, 3);

        const isThisFun = _funKind2[0];
        const isDo = _funKind2[1];
        const kind = _funKind2[2];

        var _tryTakeReturnType = tryTakeReturnType(tokens);

        var _tryTakeReturnType2 = _slicedToArray(_tryTakeReturnType, 2);

        const opReturnType = _tryTakeReturnType2[0];
        const rest = _tryTakeReturnType2[1];

        var _funArgsAndBlock = funArgsAndBlock(rest, !isDo);

        const args = _funArgsAndBlock.args;
        const opRestArg = _funArgsAndBlock.opRestArg;
        const block = _funArgsAndBlock.block;

        return new Fun_1.default(tokens.loc, args, opRestArg, block, { kind: kind, isThisFun: isThisFun, isDo: isDo, opReturnType: opReturnType });
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseFun;
    function parseFunLike(keywordKind, tokens) {
        var _funKind3 = funKind(keywordKind);

        var _funKind4 = _slicedToArray(_funKind3, 3);

        const isThisFun = _funKind4[0];
        const isDo = _funKind4[1];
        const kind = _funKind4[2];

        var _tryTakeReturnType3 = tryTakeReturnType(tokens);

        var _tryTakeReturnType4 = _slicedToArray(_tryTakeReturnType3, 2);

        const opReturnType = _tryTakeReturnType4[0];
        const rest = _tryTakeReturnType4[1];

        var _parseBlock_1$beforeA = parseBlock_1.beforeAndBlock(rest);

        var _parseBlock_1$beforeA2 = _slicedToArray(_parseBlock_1$beforeA, 2);

        const before = _parseBlock_1$beforeA2[0];
        const blockLines = _parseBlock_1$beforeA2[1];

        var _tryTakeComment_1$def = tryTakeComment_1.default(blockLines);

        var _tryTakeComment_1$def2 = _slicedToArray(_tryTakeComment_1$def, 2);

        const opComment = _tryTakeComment_1$def2[0];
        const restLines = _tryTakeComment_1$def2[1];

        if (restLines.size() === 1) {
            const h = restLines.headSlice();
            if (h.size() === 1 && Keyword_1.isKeyword(76, h.head())) {
                var _parseFunLocals = parseFunLocals(before);

                const args = _parseFunLocals.args;
                const opRestArg = _parseFunLocals.opRestArg;

                return new Fun_1.FunAbstract(tokens.loc, args, opRestArg, opReturnType, opComment);
            }
        }

        var _funArgsAndBlock2 = funArgsAndBlock(rest, !isDo);

        const args = _funArgsAndBlock2.args;
        const opRestArg = _funArgsAndBlock2.opRestArg;
        const block = _funArgsAndBlock2.block;

        return new Fun_1.default(tokens.loc, args, opRestArg, block, { kind: kind, isThisFun: isThisFun, isDo: isDo, opReturnType: opReturnType });
    }
    exports.parseFunLike = parseFunLike;
    function funArgsAndBlock(tokens, isVal) {
        let includeMemberArgs = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        checks_1.checkNonEmpty(tokens, _ => _.expectedBlock);
        const h = tokens.head();
        if (Keyword_1.isAnyKeyword(funFocusKeywords, h)) {
            const expr = (h.kind === 85 ? parseCase_1.default : parseSwitch_1.default)(true, tokens.tail());
            const args = [locals_1.LocalDeclare.focus(h.loc)];
            return { args: args, opRestArg: null, memberArgs: [], block: new Block_1.default(tokens.loc, null, [expr]) };
        } else {
            var _parseBlock_1$beforeA3 = parseBlock_1.beforeAndBlock(tokens);

            var _parseBlock_1$beforeA4 = _slicedToArray(_parseBlock_1$beforeA3, 2);

            const before = _parseBlock_1$beforeA4[0];
            const blockLines = _parseBlock_1$beforeA4[1];

            var _parseFunLocals2 = parseFunLocals(before, includeMemberArgs);

            const args = _parseFunLocals2.args;
            const opRestArg = _parseFunLocals2.opRestArg;
            const memberArgs = _parseFunLocals2.memberArgs;

            const block = parseBlock_1.default(blockLines);
            return { args: args, opRestArg: opRestArg, memberArgs: memberArgs, block: block };
        }
    }
    exports.funArgsAndBlock = funArgsAndBlock;
    const funFocusKeywords = new Set([85, 144]);
    function funKind(keywordKind) {
        switch (keywordKind) {
            case 107:
                return [false, false, 0];
            case 108:
                return [false, true, 0];
            case 109:
                return [true, false, 0];
            case 110:
                return [true, true, 0];
            case 111:
                return [false, false, 1];
            case 112:
                return [false, true, 1];
            case 113:
                return [true, false, 1];
            case 114:
                return [true, true, 1];
            case 115:
                return [false, false, 2];
            case 116:
                return [false, true, 2];
            case 117:
                return [true, false, 2];
            case 118:
                return [true, true, 2];
            default:
                throw new Error(String(keywordKind));
        }
    }
    function tryTakeReturnType(tokens) {
        if (!tokens.isEmpty()) {
            const h = tokens.head();
            if (h instanceof Group_1.GroupSpace && Keyword_1.isKeyword(89, util_1.head(h.subTokens))) return [parseSpaced_1.default(Slice_1.Tokens.of(h).tail()), tokens.tail()];
        }
        return [null, tokens];
    }
    function parseFunLocals(tokens) {
        let includeMemberArgs = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        if (tokens.isEmpty()) return { args: [], memberArgs: [], opRestArg: null };else {
            let rest = tokens,
                opRestArg = null;
            const l = tokens.last();
            if (l instanceof Group_1.GroupSpace) {
                const g = Slice_1.Tokens.of(l);
                if (Keyword_1.isKeyword(96, g.head())) {
                    rest = tokens.rtail();
                    opRestArg = parseLocalDeclares_1.parseLocalDeclareFromSpaced(g.tail());
                }
            }
            if (includeMemberArgs) {
                var _parseLocalDeclares_ = parseLocalDeclares_1.parseLocalDeclaresAndMemberArgs(rest);

                const args = _parseLocalDeclares_.declares;
                const memberArgs = _parseLocalDeclares_.memberArgs;

                return { args: args, memberArgs: memberArgs, opRestArg: opRestArg };
            } else return { args: parseLocalDeclares_1.default(rest), memberArgs: [], opRestArg: opRestArg };
        }
    }
});
//# sourceMappingURL=parseFun.js.map

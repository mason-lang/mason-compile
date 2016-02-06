(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Loc', 'op/Op', '../context', '../token/Keyword', '../token/Token', './chars', './groupContext', './sourceContext'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Loc_1 = require('esast/lib/Loc');
    const Op_1 = require('op/Op');
    const context_1 = require('../context');
    const Keyword_1 = require('../token/Keyword');
    const Token_1 = require('../token/Token');
    const chars_1 = require('./chars');
    const groupContext_1 = require('./groupContext');
    const sourceContext_1 = require('./sourceContext');
    function lexName(startPos, isInterpolation) {
        const name = sourceContext_1.takeWhileWithPrev(chars_1.isNameCharacter);
        if (name.endsWith('_')) {
            if (name.length > 1) handleNameText(startPos, name.slice(0, name.length - 1), false);
            keyword(sourceContext_1.pos(), 110);
        } else handleNameText(startPos, name, !isInterpolation);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = lexName;
    function handleNameText(startPos, name, allowSpecialKeywords) {
        Op_1.caseOp(Keyword_1.opKeywordKindFromName(name), kind => {
            switch (kind) {
                case 159:
                case 166:
                    context_1.check(allowSpecialKeywords, startPos, _ => _.noSpecialKeyword(kind));
                    sourceContext_1.skipRestOfLine();
                    if (kind === 159) keyword(startPos, 159);
                    break;
                default:
                    keyword(startPos, kind);
            }
        }, () => {
            groupContext_1.addToCurrentGroup(new Token_1.NameToken(new Loc_1.default(startPos, sourceContext_1.pos()), name));
        });
    }
    function keyword(startPos, kind) {
        groupContext_1.addToCurrentGroup(new Keyword_1.default(new Loc_1.default(startPos, sourceContext_1.pos()), kind));
    }
});
//# sourceMappingURL=lexName.js.map

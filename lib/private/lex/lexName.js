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
        if (sourceContext_1.peek(-1) === 95) {
            if (name.length > 1) {
                if (isInterpolation) groupContext_1.openInterpolation(Loc_1.default.singleChar(startPos));
                handleNameText(startPos, name.slice(0, name.length - 1), false);
                keyword(sourceContext_1.pos(), 46);
                if (isInterpolation) groupContext_1.closeInterpolation(Loc_1.default.singleChar(sourceContext_1.pos()));
            } else keyword(startPos, 46);
        } else handleNameText(startPos, name, !isInterpolation);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = lexName;
    function handleNameText(startPos, name, allowSpecialKeywords) {
        const loc = new Loc_1.default(startPos, sourceContext_1.pos());
        const keyword = Keyword_1.opKeywordFromName(loc, name);
        if (Op_1.nonNull(keyword)) {
            if (keyword instanceof Keyword_1.KeywordComment) {
                if (keyword.kind === 'todo') {
                    context_1.check(allowSpecialKeywords, startPos, _ => _.noSpecialKeyword('todo'));
                    sourceContext_1.skipRestOfLine();
                } else {
                    context_1.check(allowSpecialKeywords, startPos, _ => _.noSpecialKeyword('region'));
                    sourceContext_1.skipRestOfLine();
                    groupContext_1.addToCurrentGroup(keyword);
                }
            } else groupContext_1.addToCurrentGroup(keyword);
        } else groupContext_1.addToCurrentGroup(new Token_1.NameToken(new Loc_1.default(startPos, sourceContext_1.pos()), name));
    }
    function keyword(startPos, kind) {
        groupContext_1.addToCurrentGroup(new Keyword_1.KeywordPlain(new Loc_1.default(startPos, sourceContext_1.pos()), kind));
    }
});
//# sourceMappingURL=lexName.js.map

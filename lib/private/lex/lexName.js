(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Loc', 'op/Op', '../context', '../token/Keyword', '../token/Token', './chars', './groupContext', './sourceContext', './util'], factory);
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
    const util_1 = require('./util');
    function lexName(startPos, isInterpolation) {
        const name = sourceContext_1.takeWhileWithPrev(chars_1.isNameCharacter);
        if (sourceContext_1.peek(-1) === 95) {
            if (name.length > 1) {
                if (isInterpolation) groupContext_1.openInterpolation(Loc_1.default.singleChar(startPos));
                handleNameText(startPos, name.slice(0, name.length - 1), false);
                util_1.addKeywordPlain(sourceContext_1.pos().onPrevColumn(), 46);
                if (isInterpolation) groupContext_1.closeInterpolation(Loc_1.default.singleChar(sourceContext_1.pos()));
            } else util_1.addKeywordPlain(startPos, 46);
        } else handleNameText(startPos, name, !isInterpolation);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = lexName;
    function handleNameText(startPos, name, allowSpecialKeywords) {
        const loc = new Loc_1.default(startPos, sourceContext_1.pos());
        const keyword = Keyword_1.opKeywordFromName(loc, name);
        if (Op_1.nonNull(keyword)) {
            if (keyword instanceof Keyword_1.KeywordComment) {
                context_1.check(allowSpecialKeywords, startPos, _ => _.noSpecialKeyword(keyword.kind));
                sourceContext_1.skipRestOfLine();
                if (keyword.kind === 'region') groupContext_1.addToCurrentGroup(keyword);
            } else groupContext_1.addToCurrentGroup(keyword);
        } else groupContext_1.addToCurrentGroup(new Token_1.NameToken(new Loc_1.default(startPos, sourceContext_1.pos()), name));
    }
});
//# sourceMappingURL=lexName.js.map

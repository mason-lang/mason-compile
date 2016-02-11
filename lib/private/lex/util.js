(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Loc', '../token/Keyword', './groupContext', './sourceContext'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Loc_1 = require('esast/lib/Loc');
    const Keyword_1 = require('../token/Keyword');
    const groupContext_1 = require('./groupContext');
    const sourceContext_1 = require('./sourceContext');
    function addKeywordFun(startPos, opts) {
        const options = {
            isDo: Boolean(opts.isDo),
            isThisFun: Boolean(opts.isThisFun),
            kind: 'kind' in opts ? opts.kind : 0
        };
        const loc = new Loc_1.default(startPos, sourceContext_1.pos());
        groupContext_1.addToCurrentGroup(new Keyword_1.KeywordFun(loc, options));
        groupContext_1.space(loc);
    }
    exports.addKeywordFun = addKeywordFun;
    function addKeywordPlain(startPos, kind) {
        groupContext_1.addToCurrentGroup(new Keyword_1.KeywordPlain(new Loc_1.default(startPos, sourceContext_1.pos()), kind));
    }
    exports.addKeywordPlain = addKeywordPlain;
});
//# sourceMappingURL=util.js.map

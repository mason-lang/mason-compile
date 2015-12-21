(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Loc', 'op/Op', '../context', '../Token', './chars', './groupContext', './sourceContext'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Loc_1 = require('esast/lib/Loc');
    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var Token_1 = require('../Token');
    var chars_1 = require('./chars');
    var groupContext_1 = require('./groupContext');
    var sourceContext_1 = require('./sourceContext');
    function lexName(startPos, isInterpolation) {
        const name = sourceContext_1.takeWhileWithPrev(chars_1.isNameCharacter);
        if (name.endsWith('_')) {
            if (name.length > 1) handleNameText(startPos, name.slice(0, name.length - 1), false);
            keyword(sourceContext_1.pos(), 60);
        } else handleNameText(startPos, name, !isInterpolation);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = lexName;
    function handleNameText(startPos, name, allowSpecialKeywords) {
        Op_1.caseOp(Token_1.opKeywordKindFromName(name), kind => {
            switch (kind) {
                case 97:
                case 104:
                    context_1.check(allowSpecialKeywords, startPos, _ => _.noSpecialKeyword(kind));
                    sourceContext_1.skipRestOfLine();
                    if (kind === 97) keyword(startPos, 97);
                    break;
                default:
                    keyword(startPos, kind);
            }
        }, () => {
            groupContext_1.addToCurrentGroup(new Token_1.Name(new Loc_1.default(startPos, sourceContext_1.pos()), name));
        });
    }
    function keyword(startPos, kind) {
        groupContext_1.addToCurrentGroup(new Token_1.Keyword(new Loc_1.default(startPos, sourceContext_1.pos()), kind));
    }
});
//# sourceMappingURL=lexName.js.map

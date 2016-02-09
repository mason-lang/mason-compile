(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Loc', 'op/Op', '../ast/locals', '../ast/Val', '../token/Keyword', './checks', './parseExpr', './parseLocalDeclares', './parseMemberName'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Loc_1 = require('esast/lib/Loc');
    const Op_1 = require('op/Op');
    const locals_1 = require('../ast/locals');
    const Val_1 = require('../ast/Val');
    const Keyword_1 = require('../token/Keyword');
    const checks_1 = require('./checks');
    const parseExpr_1 = require('./parseExpr');
    const parseLocalDeclares_1 = require('./parseLocalDeclares');
    const parseMemberName_1 = require('./parseMemberName');
    function parseObjSimple(tokens) {
        const pairs = Op_1.caseOp(tokens.opSplitMany(_ => Keyword_1.isKeyword(23, _)), _ => complexPairs(tokens.loc, _), () => tokens.map(simplePair));
        return new Val_1.ObjSimple(tokens.loc, pairs);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseObjSimple;
    function complexPairs(loc, splits) {
        const first = splits[0].before;
        checks_1.checkNonEmpty(first, _ => _.unexpected(splits[0].at));
        checks_1.checkEmpty(first.rtail(), _ => _.unexpected(first.rtail()));
        const pairs = [];
        for (let i = 0; i < splits.length - 1; i = i + 1) {
            const key = splits[i].before.last();
            const val = i === splits.length - 2 ? splits[i + 1].before : splits[i + 1].before.rtail();
            pairs.push(val.isEmpty() ? simplePair(key) : new Val_1.ObjPair(new Loc_1.default(key.loc.start, val.loc.end), parseMemberName_1.default(key), parseExpr_1.default(val)));
        }
        return pairs;
    }
    function simplePair(key) {
        const name = parseLocalDeclares_1.parseLocalName(key);
        return new Val_1.ObjPair(key.loc, name, new locals_1.LocalAccess(key.loc, name));
    }
});
//# sourceMappingURL=parseObjSimple.js.map

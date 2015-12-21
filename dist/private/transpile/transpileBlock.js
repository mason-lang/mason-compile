(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/ast', '../util', './ast-constants', './context', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var ast_1 = require('esast/lib/ast');
    var util_1 = require('../util');
    var ast_constants_1 = require('./ast-constants');
    var context_1 = require('./context');
    var util_2 = require('./util');
    function default_1() {
        let lead = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
        let opReturnType = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        let follow = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

        const kind = context_1.verifyResults.blockKind(this);
        switch (kind) {
            case 0:
                util_1.assert(opReturnType === null);
                return new ast_1.BlockStatement(util_1.cat(lead, util_2.tLines(this.lines), follow));
            case 1:
                return new ast_1.BlockStatement(util_1.cat(lead, util_2.tLines(util_1.rtail(this.lines)), util_2.t0(util_1.last(this.lines))));
            case 2:
                return transpileBlockReturn(util_2.t0(util_1.last(this.lines)), util_2.tLines(util_1.rtail(this.lines)), lead, opReturnType);
            case 3:
            case 4:
            case 5:
                {
                    const declare = kind === 3 ? ast_constants_1.DeclareBuiltBag : kind === 4 ? ast_constants_1.DeclareBuiltMap : ast_constants_1.DeclareBuiltObj;
                    const body = util_1.cat(declare, util_2.tLines(this.lines));
                    return transpileBlockReturn(ast_constants_1.IdBuilt, body, lead, opReturnType);
                }
            default:
                throw new Error(String(kind));
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = default_1;
    function transpileBlockReturn(returned, lines, lead, opReturnType) {
        const ret = new ast_1.ReturnStatement(util_2.maybeWrapInCheckInstance(returned, opReturnType, 'returned value'));
        return new ast_1.BlockStatement(util_1.cat(lead, lines, ret));
    }
});
//# sourceMappingURL=transpileBlock.js.map

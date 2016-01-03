(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../ast/errors', '../ast/Block', '../context', '../util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var errors_1 = require('../ast/errors');
    var Block_1 = require('../ast/Block');
    var context_1 = require('../context');
    var util_1 = require('../util');
    function autoBlockKind(lines, loc) {
        return Op_1.orDefault(opBlockBuildKind(lines, loc), () => !util_1.isEmpty(lines) && util_1.last(lines) instanceof errors_1.Throw ? 1 : 2);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = autoBlockKind;
    function opBlockBuildKind(lines, loc) {
        let isBag = false,
            isMap = false,
            isObj = false;
        for (const line of lines) if (line instanceof Block_1.BagEntry) isBag = true;else if (line instanceof Block_1.MapEntry) isMap = true;else if (line instanceof Block_1.ObjEntry) isObj = true;
        context_1.check(!(isBag && isMap) && !(isMap && isObj) && !(isBag && isObj), loc, _ => _.cantInferBlockKind);
        return isBag ? 3 : isMap ? 4 : isObj ? 5 : null;
    }
    exports.opBlockBuildKind = opBlockBuildKind;
});
//# sourceMappingURL=autoBlockKind.js.map

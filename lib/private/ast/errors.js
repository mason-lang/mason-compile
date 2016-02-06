(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../util', './LineContent', './MsAst'], factory);
    }
})(function (require, exports) {
    "use strict";

    const util_1 = require('../util');
    const LineContent_1 = require('./LineContent');
    const MsAst_1 = require('./MsAst');
    class Throw extends LineContent_1.DoOnly {
        constructor(loc, opThrown) {
            super(loc);
            this.opThrown = opThrown;
        }
    }
    exports.Throw = Throw;
    class Assert extends LineContent_1.DoOnly {
        constructor(loc, negate, condition, opThrown) {
            super(loc);
            this.negate = negate;
            this.condition = condition;
            this.opThrown = opThrown;
        }
    }
    exports.Assert = Assert;
    class Except extends LineContent_1.ValOrDo {
        constructor(loc, tried, typedCatches, opCatchAll, opElse, opFinally) {
            super(loc);
            this.tried = tried;
            this.typedCatches = typedCatches;
            this.opCatchAll = opCatchAll;
            this.opElse = opElse;
            this.opFinally = opFinally;
        }
        get allCatches() {
            return util_1.cat(this.typedCatches, this.opCatchAll);
        }
    }
    exports.Except = Except;
    class Catch extends MsAst_1.default {
        constructor(loc, caught, block) {
            super(loc);
            this.caught = caught;
            this.block = block;
            util_1.assert(!caught.isLazy);
        }
    }
    exports.Catch = Catch;
});
//# sourceMappingURL=errors.js.map

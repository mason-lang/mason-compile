(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './LineContent', './locals', './MsAst'], factory);
    }
})(function (require, exports) {
    "use strict";

    const LineContent_1 = require('./LineContent');
    const locals_1 = require('./locals');
    const MsAst_1 = require('./MsAst');
    class For extends LineContent_1.ValOrDo {
        constructor(loc, opIteratee, block) {
            super(loc);
            this.opIteratee = opIteratee;
            this.block = block;
        }
    }
    exports.For = For;
    class ForAsync extends LineContent_1.ValOrDo {
        constructor(loc, iteratee, block) {
            super(loc);
            this.iteratee = iteratee;
            this.block = block;
        }
    }
    exports.ForAsync = ForAsync;
    class ForBag extends LineContent_1.ValOnly {
        constructor(loc, opIteratee, block) {
            super(loc);
            this.opIteratee = opIteratee;
            this.block = block;
            this.built = locals_1.LocalDeclare.built(loc);
        }
    }
    exports.ForBag = ForBag;
    class Iteratee extends MsAst_1.default {
        constructor(loc, element, bag) {
            super(loc);
            this.element = element;
            this.bag = bag;
        }
    }
    exports.Iteratee = Iteratee;
    class Break extends LineContent_1.DoOnly {
        constructor(loc) {
            let opValue = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            super(loc);
            this.opValue = opValue;
        }
    }
    exports.Break = Break;
});
//# sourceMappingURL=Loop.js.map

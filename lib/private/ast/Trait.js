(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './LineContent'], factory);
    }
})(function (require, exports) {
    "use strict";

    const LineContent_1 = require('./LineContent');
    class Trait extends LineContent_1.ValOnly {
        constructor(loc, superTraits) {
            let opComment = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
            let opDo = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
            let statics = arguments.length <= 4 || arguments[4] === undefined ? [] : arguments[4];
            let methods = arguments.length <= 5 || arguments[5] === undefined ? [] : arguments[5];

            super(loc);
            this.superTraits = superTraits;
            this.opComment = opComment;
            this.opDo = opDo;
            this.statics = statics;
            this.methods = methods;
        }
        isNamed() {}
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Trait;
    class TraitDo extends LineContent_1.DoOnly {
        constructor(loc, implementor, trait) {
            let statics = arguments.length <= 3 || arguments[3] === undefined ? [] : arguments[3];
            let methods = arguments.length <= 4 || arguments[4] === undefined ? [] : arguments[4];

            super(loc);
            this.implementor = implementor;
            this.trait = trait;
            this.statics = statics;
            this.methods = methods;
        }
    }
    exports.TraitDo = TraitDo;
});
//# sourceMappingURL=Trait.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './Class', './Fun', './Poly', './Trait', './Val'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Class_1 = require('./Class');
    const Fun_1 = require('./Fun');
    const Poly_1 = require('./Poly');
    const Trait_1 = require('./Trait');
    const Val_1 = require('./Val');
    function isNamed(_) {
        return _ instanceof Class_1.default || _ instanceof Fun_1.FunBlock || _ instanceof Poly_1.default || _ instanceof Trait_1.default || _ instanceof Val_1.SpecialVal && _.kind === 1;
    }
    exports.isNamed = isNamed;
});
//# sourceMappingURL=Named.js.map

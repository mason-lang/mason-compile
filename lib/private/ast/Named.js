(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './Class', './Fun', './Method', './Trait', './Val'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Class_1 = require('./Class');
    var Fun_1 = require('./Fun');
    var Method_1 = require('./Method');
    var Trait_1 = require('./Trait');
    var Val_1 = require('./Val');
    function isNamed(_) {
        return _ instanceof Class_1.default || _ instanceof Fun_1.FunBlock || _ instanceof Method_1.default || _ instanceof Trait_1.default || _ instanceof Val_1.SpecialVal && _.kind === 1;
    }
    exports.isNamed = isNamed;
});
//# sourceMappingURL=Named.js.map

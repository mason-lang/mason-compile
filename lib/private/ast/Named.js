(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './Val'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Val_1 = require('./Val');
    function isNamed(_) {
        return 'isNamed' in _ && !(_ instanceof Val_1.SpecialVal && _.kind !== 1);
    }
    exports.isNamed = isNamed;
});
//# sourceMappingURL=Named.js.map

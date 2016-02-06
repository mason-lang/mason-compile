(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './ms', './transpileVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    const ms_1 = require('./ms');
    const transpileVal_1 = require('./transpileVal');
    function transpileDelNoLoc(_ref) {
        let subbed = _ref.subbed;
        let args = _ref.args;

        return ms_1.msCall('del', transpileVal_1.default(subbed), ...args.map(transpileVal_1.default));
    }
    exports.transpileDelNoLoc = transpileDelNoLoc;
});
//# sourceMappingURL=transpileDel.js.map

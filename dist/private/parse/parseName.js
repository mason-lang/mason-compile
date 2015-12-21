(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../Token', './checks'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var Token_1 = require('../Token');
    var checks_1 = require('./checks');
    function parseName(token) {
        const name = tryParseName(token);
        if (Op_1.nonNull(name)) return name;else throw checks_1.unexpected(token);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseName;
    function tryParseName(token) {
        return token instanceof Token_1.Name ? token.name : token instanceof Token_1.Keyword ? Token_1.tryGetKeywordName(token) : null;
    }
    exports.tryParseName = tryParseName;
});
//# sourceMappingURL=parseName.js.map

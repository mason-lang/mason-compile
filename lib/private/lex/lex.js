(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Loc', './groupContext', './lexPlain', './sourceContext'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Loc_1 = require('esast/lib/Loc');
    var groupContext_1 = require('./groupContext');
    var lexPlain_1 = require('./lexPlain');
    var sourceContext_1 = require('./sourceContext');
    function lex(sourceString) {
        if (!sourceString.endsWith('\n')) sourceString = `${ sourceString }\n`;
        sourceString = `${ sourceString }\0`;
        groupContext_1.setupGroupContext();
        sourceContext_1.setupSourceContext(sourceString);
        groupContext_1.openLine(Loc_1.Pos.start);
        lexPlain_1.default(false);
        const endPos = sourceContext_1.pos();
        return groupContext_1.tearDownGroupContext(endPos);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = lex;
});
//# sourceMappingURL=lex.js.map

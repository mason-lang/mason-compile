(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Statement', './transpileBlock', './transpileLocals', './transpileVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Statement_1 = require('esast/lib/Statement');
    var transpileBlock_1 = require('./transpileBlock');
    var transpileLocals_1 = require('./transpileLocals');
    var transpileVal_1 = require('./transpileVal');
    function transpileWithDoNoLoc(_) {
        var _withParts = withParts(_);

        const lead = _withParts.lead;

        return transpileBlock_1.transpileBlockNoLoc(_.block, { lead: lead });
    }
    exports.transpileWithDoNoLoc = transpileWithDoNoLoc;
    function transpileWithValNoLoc(_) {
        var _withParts2 = withParts(_);

        const idDeclare = _withParts2.idDeclare;
        const lead = _withParts2.lead;

        return transpileBlock_1.transpileBlockVal(_.block, { lead: lead, follow: new Statement_1.ReturnStatement(idDeclare) });
    }
    exports.transpileWithValNoLoc = transpileWithValNoLoc;
    function withParts(_ref) {
        let declare = _ref.declare;
        let value = _ref.value;

        const idDeclare = transpileLocals_1.idForDeclareCached(declare);
        const val = transpileVal_1.default(value);
        const lead = transpileLocals_1.plainLet(idDeclare, val);
        return { idDeclare: idDeclare, lead: lead };
    }
});
//# sourceMappingURL=transpileWith.js.map

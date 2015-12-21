(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Loc', '../CompileError', './PathOptions'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Loc_1 = require('esast/lib/Loc');
    var CompileError_1 = require('../CompileError');
    var PathOptions_1 = require('./PathOptions');
    let warnings;
    function withContext(_options, filename, getResult) {
        exports.options = _options;
        exports.pathOptions = new PathOptions_1.default(filename);
        warnings = [];
        try {
            let result;
            try {
                result = getResult();
            } catch (error) {
                if (!(error instanceof CompileError_1.default)) throw error;
                result = error;
            }
            warnings.sort((a, b) => a.loc.compare(b.loc));
            return { warnings: warnings, result: result };
        } finally {
            exports.options = exports.pathOptions = warnings = null;
        }
    }
    exports.withContext = withContext;
    function check(cond, loc, message) {
        if (!cond) throw fail(loc instanceof Function ? loc() : loc, message);
    }
    exports.check = check;
    function fail(loc, message) {
        return new CompileError_1.default(errorMessage(loc, message));
    }
    exports.fail = fail;
    function warn(loc, message) {
        warnings.push(errorMessage(loc, message));
    }
    exports.warn = warn;
    function errorMessage(loc, message) {
        const l = loc instanceof Loc_1.Pos ? Loc_1.default.singleChar(loc) : loc;
        return new CompileError_1.ErrorMessage(l, message(exports.options.language));
    }
});
//# sourceMappingURL=context.js.map

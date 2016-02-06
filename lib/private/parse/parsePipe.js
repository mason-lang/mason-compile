var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../ast/locals', '../ast/Val', './parseBlock', './parseExpr'], factory);
    }
})(function (require, exports) {
    "use strict";

    const locals_1 = require('../ast/locals');
    const Val_1 = require('../ast/Val');
    const parseBlock_1 = require('./parseBlock');
    const parseExpr_1 = require('./parseExpr');
    function parsePipe(tokens) {
        var _parseBlock_1$beforeA = parseBlock_1.beforeAndBlock(tokens);

        var _parseBlock_1$beforeA2 = _slicedToArray(_parseBlock_1$beforeA, 2);

        const before = _parseBlock_1$beforeA2[0];
        const block = _parseBlock_1$beforeA2[1];

        return new Val_1.Pipe(tokens.loc, parseExpr_1.default(before), block.mapSlices(parseExpr_1.default));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parsePipe;
    function parsePipeFun(loc, lines) {
        return new Val_1.Pipe(loc, locals_1.LocalAccess.focus(loc), lines.mapSlices(parseExpr_1.default));
    }
    exports.parsePipeFun = parsePipeFun;
});
//# sourceMappingURL=parsePipe.js.map

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../context', '../ast/locals', '../ast/Switch', '../token/Keyword', './checks', './parseBlock', './parseExpr'], factory);
    }
})(function (require, exports) {
    "use strict";

    var context_1 = require('../context');
    var locals_1 = require('../ast/locals');
    var Switch_1 = require('../ast/Switch');
    var Keyword_1 = require('../token/Keyword');
    var checks_1 = require('./checks');
    var parseBlock_1 = require('./parseBlock');
    var parseExpr_1 = require('./parseExpr');
    function parseSwitch(switchedFromFun, tokens) {
        var _parseBlock_1$beforeA = parseBlock_1.beforeAndBlock(tokens);

        var _parseBlock_1$beforeA2 = _slicedToArray(_parseBlock_1$beforeA, 2);

        const before = _parseBlock_1$beforeA2[0];
        const block = _parseBlock_1$beforeA2[1];

        if (switchedFromFun) checks_1.checkEmpty(before, _ => _.switchArgIsImplicit);
        const switched = switchedFromFun ? locals_1.LocalAccess.focus(tokens.loc) : parseExpr_1.default(before);
        const lastLine = block.lastSlice();

        var _ref = Keyword_1.isKeyword(97, lastLine.head()) ? [block.rtail(), parseBlock_1.parseJustBlock(97, lastLine.tail())] : [block, null];

        var _ref2 = _slicedToArray(_ref, 2);

        const partLines = _ref2[0];
        const opElse = _ref2[1];

        const parts = partLines.mapSlices(line => {
            var _parseBlock_1$beforeA3 = parseBlock_1.beforeAndBlock(line);

            var _parseBlock_1$beforeA4 = _slicedToArray(_parseBlock_1$beforeA3, 2);

            const before = _parseBlock_1$beforeA4[0];
            const block = _parseBlock_1$beforeA4[1];

            return new Switch_1.SwitchPart(line.loc, parseExpr_1.parseExprParts(before), parseBlock_1.default(block));
        });
        context_1.check(parts.length > 0, tokens.loc, _ => _.caseSwitchNeedsParts);
        return new Switch_1.default(tokens.loc, switched, parts, opElse);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseSwitch;
});
//# sourceMappingURL=parseSwitch.js.map

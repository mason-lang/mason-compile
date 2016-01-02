var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../MsAst', '../Token', './checks', './parseBlock', './parseExpr', './parseLocalDeclares', './parseSpaced', './Slice'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var MsAst_1 = require('../MsAst');
    var Token_1 = require('../Token');
    var checks_1 = require('./checks');
    var parseBlock_1 = require('./parseBlock');
    var parseExpr_1 = require('./parseExpr');
    var parseLocalDeclares_1 = require('./parseLocalDeclares');
    var parseSpaced_1 = require('./parseSpaced');
    var Slice_1 = require('./Slice');
    function parseCase(casedFromFun, tokens) {
        var _parseBlock_1$beforeA = parseBlock_1.beforeAndBlock(tokens);

        var _parseBlock_1$beforeA2 = _slicedToArray(_parseBlock_1$beforeA, 2);

        const before = _parseBlock_1$beforeA2[0];
        const block = _parseBlock_1$beforeA2[1];

        let opCased;
        if (casedFromFun) {
            checks_1.checkEmpty(before, _ => _.caseFocusIsImplicit);
            opCased = null;
        } else opCased = Op_1.opMap(parseExpr_1.opParseExpr(before), _ => MsAst_1.AssignSingle.focus(_.loc, _));
        const lastLine = Slice_1.Tokens.of(block.last());

        var _ref = Token_1.isKeyword(55, lastLine.head()) ? [block.rtail(), parseBlock_1.parseJustBlock(55, lastLine.tail())] : [block, null];

        var _ref2 = _slicedToArray(_ref, 2);

        const partLines = _ref2[0];
        const opElse = _ref2[1];

        const parts = partLines.mapSlices(line => {
            var _parseBlock_1$beforeA3 = parseBlock_1.beforeAndBlock(line);

            var _parseBlock_1$beforeA4 = _slicedToArray(_parseBlock_1$beforeA3, 2);

            const before = _parseBlock_1$beforeA4[0];
            const block = _parseBlock_1$beforeA4[1];

            return new MsAst_1.CasePart(line.loc, parseCaseTest(before), parseBlock_1.default(block));
        });
        context_1.check(parts.length > 0, tokens.loc, _ => _.caseSwitchNeedsParts);
        return new MsAst_1.Case(tokens.loc, opCased, parts, opElse);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseCase;
    function parseCaseTest(tokens) {
        const first = tokens.head();
        if (first instanceof Token_1.GroupSpace && tokens.size() > 1) {
            const ft = Slice_1.Tokens.of(first);
            if (Token_1.isKeyword(47, ft.head())) {
                const type = parseSpaced_1.default(ft.tail());
                const locals = parseLocalDeclares_1.default(tokens.tail());
                return new MsAst_1.Pattern(tokens.loc, type, locals);
            }
        }
        return parseExpr_1.default(tokens);
    }
});
//# sourceMappingURL=parseCase.js.map

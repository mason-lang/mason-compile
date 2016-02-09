var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../ast/Case', '../ast/locals', '../token/Group', '../token/Keyword', './checks', './parseBlock', './parseExpr', './parseLocalDeclares', './parseSpaced', './Slice'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Op_1 = require('op/Op');
    const Case_1 = require('../ast/Case');
    const locals_1 = require('../ast/locals');
    const Group_1 = require('../token/Group');
    const Keyword_1 = require('../token/Keyword');
    const checks_1 = require('./checks');
    const parseBlock_1 = require('./parseBlock');
    const parseExpr_1 = require('./parseExpr');
    const parseLocalDeclares_1 = require('./parseLocalDeclares');
    const parseSpaced_1 = require('./parseSpaced');
    const Slice_1 = require('./Slice');
    function parseCase(tokens) {
        var _parseBlock_1$beforeA = parseBlock_1.beforeAndBlock(tokens);

        var _parseBlock_1$beforeA2 = _slicedToArray(_parseBlock_1$beforeA, 2);

        const before = _parseBlock_1$beforeA2[0];
        const block = _parseBlock_1$beforeA2[1];

        const opCased = Op_1.opMap(parseExpr_1.opParseExpr(before), _ => locals_1.AssignSingle.focus(_.loc, _));

        var _parseCaseParts = parseCaseParts(block);

        const parts = _parseCaseParts.parts;
        const opElse = _parseCaseParts.opElse;

        return new Case_1.default(tokens.loc, opCased, parts, opElse);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseCase;
    function parseCaseFun(loc, lines) {
        var _parseCaseParts2 = parseCaseParts(lines);

        const parts = _parseCaseParts2.parts;
        const opElse = _parseCaseParts2.opElse;

        return new Case_1.default(loc, null, parts, opElse);
    }
    exports.parseCaseFun = parseCaseFun;
    function parseCaseParts(block) {
        return parseCaseSwitchParts(block, (loc, before, block) => new Case_1.CasePart(loc, parseCaseTest(before), block));
    }
    function parseCaseTest(tokens) {
        const first = tokens.head();
        if (first instanceof Group_1.GroupSpace && tokens.size() > 1) {
            const ft = Slice_1.Tokens.of(first);
            if (Keyword_1.isKeyword(38, ft.head())) {
                const type = parseSpaced_1.default(ft.tail());
                const locals = parseLocalDeclares_1.default(tokens.tail());
                return new Case_1.Pattern(tokens.loc, type, locals);
            }
        }
        return parseExpr_1.default(tokens);
    }
    function parseCaseSwitchParts(block, ctr) {
        var _takeOpElseFromEnd = takeOpElseFromEnd(block);

        var _takeOpElseFromEnd2 = _slicedToArray(_takeOpElseFromEnd, 2);

        const partLines = _takeOpElseFromEnd2[0];
        const opElse = _takeOpElseFromEnd2[1];

        const parts = partLines.mapSlices(line => {
            var _parseBlock_1$beforeA3 = parseBlock_1.beforeAndBlock(line);

            var _parseBlock_1$beforeA4 = _slicedToArray(_parseBlock_1$beforeA3, 2);

            const before = _parseBlock_1$beforeA4[0];
            const block = _parseBlock_1$beforeA4[1];

            return ctr(line.loc, before, parseBlock_1.default(block));
        });
        return { parts: parts, opElse: opElse };
    }
    exports.parseCaseSwitchParts = parseCaseSwitchParts;
    function takeOpElseFromEnd(block) {
        const lastLine = block.lastSlice();

        var _ref = Keyword_1.isKeyword(43, lastLine.head()) ? [block.rtail(), parseBlock_1.parseJustBlock(43, lastLine.tail())] : [block, null];

        var _ref2 = _slicedToArray(_ref, 2);

        const partLines = _ref2[0];
        const opElse = _ref2[1];

        checks_1.checkNonEmpty(partLines, _ => _.caseSwitchNeedsParts);
        return [partLines, opElse];
    }
});
//# sourceMappingURL=parseCase.js.map

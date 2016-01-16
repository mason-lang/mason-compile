var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../ast/errors', '../context', '../token/Keyword', './checks', './parseBlock', './parseLocalDeclares'], factory);
    }
})(function (require, exports) {
    "use strict";

    var errors_1 = require('../ast/errors');
    var context_1 = require('../context');
    var Keyword_1 = require('../token/Keyword');
    var checks_1 = require('./checks');
    var parseBlock_1 = require('./parseBlock');
    var parseLocalDeclares_1 = require('./parseLocalDeclares');
    function parseExcept(tokens) {
        const lines = parseBlock_1.justBlock(99, tokens);

        var _takeTried = takeTried(lines);

        var _takeTried2 = _slicedToArray(_takeTried, 2);

        const tried = _takeTried2[0];
        const rest = _takeTried2[1];

        var _takeCatches = takeCatches(rest);

        var _takeCatches2 = _slicedToArray(_takeCatches, 3);

        const typedCatches = _takeCatches2[0];
        const opCatchAll = _takeCatches2[1];
        const rest2 = _takeCatches2[2];

        var _opTakeElse = opTakeElse(rest2);

        var _opTakeElse2 = _slicedToArray(_opTakeElse, 2);

        const opElse = _opTakeElse2[0];
        const rest3 = _opTakeElse2[1];

        const opFinally = parseOpFinally(rest3);
        return new errors_1.Except(tokens.loc, tried, typedCatches, opCatchAll, opElse, opFinally);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseExcept;
    function takeTried(lines) {
        const line = lines.headSlice();
        checks_1.checkKeyword(152, line.head());
        return [parseBlock_1.parseJustBlock(152, line.tail()), lines.tail()];
    }
    function takeCatches(lines) {
        const typedCatches = [];
        let opCatchAll = null;
        while (!lines.isEmpty()) {
            const line = lines.headSlice();
            if (!Keyword_1.isKeyword(87, line.head())) break;

            var _parseBlock_1$beforeA = parseBlock_1.beforeAndBlock(line.tail());

            var _parseBlock_1$beforeA2 = _slicedToArray(_parseBlock_1$beforeA, 2);

            const before = _parseBlock_1$beforeA2[0];
            const block = _parseBlock_1$beforeA2[1];

            const caught = parseLocalDeclares_1.parseLocalDeclareOrFocus(before);
            const catcher = new errors_1.Catch(line.loc, caught, parseBlock_1.default(block));
            lines = lines.tail();
            if (caught.opType === null) {
                opCatchAll = catcher;
                break;
            } else typedCatches.push(catcher);
        }
        return [typedCatches, opCatchAll, lines];
    }
    function opTakeElse(lines) {
        if (lines.isEmpty()) return [null, lines];
        const line = lines.headSlice();
        const tokenElse = line.head();
        return Keyword_1.isKeyword(98, tokenElse) ? [parseBlock_1.parseJustBlock(98, line.tail()), lines.tail()] : [null, lines];
    }
    function parseOpFinally(lines) {
        if (lines.isEmpty()) return null;
        const line = lines.headSlice();
        checks_1.checkKeyword(102, line.head());
        context_1.check(lines.size() === 1, lines.loc, _ => _.nothingAfterFinally);
        return parseBlock_1.parseJustBlock(102, line.tail());
    }
});
//# sourceMappingURL=parseExcept.js.map

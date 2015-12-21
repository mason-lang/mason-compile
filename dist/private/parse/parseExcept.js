var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../context', '../MsAst', '../Token', './checks', './parseBlock', './parseLocalDeclares'], factory);
    }
})(function (require, exports) {
    "use strict";

    var context_1 = require('../context');
    var MsAst_1 = require('../MsAst');
    var Token_1 = require('../Token');
    var checks_1 = require('./checks');
    var parseBlock_1 = require('./parseBlock');
    var parseLocalDeclares_1 = require('./parseLocalDeclares');
    function parseExcept(tokens) {
        const lines = parseBlock_1.justBlock(56, tokens);

        var _takeTry = takeTry(lines);

        var _takeTry2 = _slicedToArray(_takeTry, 2);

        const _try = _takeTry2[0];
        const rest = _takeTry2[1];

        var _takeTypedCatches = takeTypedCatches(rest);

        var _takeTypedCatches2 = _slicedToArray(_takeTypedCatches, 3);

        const typedCatches = _takeTypedCatches2[0];
        const opCatchAll = _takeTypedCatches2[1];
        const rest2 = _takeTypedCatches2[2];

        var _opTakeElse = opTakeElse(rest2);

        var _opTakeElse2 = _slicedToArray(_opTakeElse, 2);

        const opElse = _opTakeElse2[0];
        const rest3 = _opTakeElse2[1];

        const opFinally = parseOpFinally(rest3);
        return new MsAst_1.Except(tokens.loc, _try, typedCatches, opCatchAll, opElse, opFinally);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseExcept;
    function takeTry(lines) {
        const line = lines.headSlice();
        checks_1.checkKeyword(108, line.head());
        return [parseBlock_1.parseJustBlock(108, line.tail()), lines.tail()];
    }
    function takeTypedCatches(lines) {
        const typedCatches = [];
        let opCatchAll = null;
        while (!lines.isEmpty()) {
            const line = lines.headSlice();
            if (!Token_1.isKeyword(44, line.head())) break;

            var _parseBlock_1$beforeA = parseBlock_1.beforeAndBlock(line.tail());

            var _parseBlock_1$beforeA2 = _slicedToArray(_parseBlock_1$beforeA, 2);

            const before = _parseBlock_1$beforeA2[0];
            const block = _parseBlock_1$beforeA2[1];

            const caught = parseLocalDeclares_1.parseLocalDeclareOrFocus(before);
            const _catch = new MsAst_1.Catch(line.loc, caught, parseBlock_1.default(block));
            lines = lines.tail();
            if (caught.opType === null) {
                opCatchAll = _catch;
                break;
            } else typedCatches.push(_catch);
        }
        return [typedCatches, opCatchAll, lines];
    }
    function opTakeElse(lines) {
        if (lines.isEmpty()) return [null, lines];
        const line = lines.headSlice();
        const tokenElse = line.head();
        return Token_1.isKeyword(55, tokenElse) ? [parseBlock_1.parseJustBlock(55, line.tail()), lines.tail()] : [null, lines];
    }
    function parseOpFinally(lines) {
        if (lines.isEmpty()) return null;
        const line = lines.headSlice();
        checks_1.checkKeyword(59, line.head());
        context_1.check(lines.size() === 1, lines.loc, _ => _.nothingAfterFinally);
        return parseBlock_1.parseJustBlock(59, line.tail());
    }
});
//# sourceMappingURL=parseExcept.js.map

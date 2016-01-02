var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../MsAst', '../Token', './parseBlock', './parseExpr', './parseFun', './parseMethodSplit'], factory);
    }
})(function (require, exports) {
    "use strict";

    var MsAst_1 = require('../MsAst');
    var Token_1 = require('../Token');
    var parseBlock_1 = require('./parseBlock');
    var parseExpr_1 = require('./parseExpr');
    var parseFun_1 = require('./parseFun');
    var parseMethodSplit_1 = require('./parseMethodSplit');
    function parseMethodImpls(lines) {
        return lines.mapSlices(parseMethodImpl);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseMethodImpls;
    function takeStatics(lines) {
        const line = lines.headSlice();
        return Token_1.isKeyword(100, line.head()) ? [parseMethodImpls(parseBlock_1.justBlock(100, line.tail())), lines.tail()] : [[], lines];
    }
    exports.takeStatics = takeStatics;
    function parseStaticsAndMethods(lines) {
        var _takeStatics = takeStatics(lines);

        var _takeStatics2 = _slicedToArray(_takeStatics, 2);

        const statics = _takeStatics2[0];
        const rest = _takeStatics2[1];

        return [statics, parseMethodImpls(rest)];
    }
    exports.parseStaticsAndMethods = parseStaticsAndMethods;
    function opTakeDo(lines) {
        const line = lines.headSlice();
        return Token_1.isKeyword(51, line.head()) ? [new MsAst_1.ClassTraitDo(line.loc, parseBlock_1.parseJustBlock(51, line.tail())), lines.tail()] : [null, lines];
    }
    exports.opTakeDo = opTakeDo;
    function parseMethodImpl(tokens) {
        let head = tokens.head();
        const isMy = Token_1.isKeyword(87, head);
        if (isMy) {
            tokens = tokens.tail();
            head = tokens.head();
        }
        if (Token_1.isKeyword(77, head)) {
            var _parseBlock_1$beforeA = parseBlock_1.beforeAndBlock(tokens.tail());

            var _parseBlock_1$beforeA2 = _slicedToArray(_parseBlock_1$beforeA, 2);

            const before = _parseBlock_1$beforeA2[0];
            const block = _parseBlock_1$beforeA2[1];

            return new MsAst_1.MethodGetter(tokens.loc, isMy, parseExprOrQuoteSimple(before), parseBlock_1.default(block));
        } else if (Token_1.isKeyword(98, head)) {
            var _parseBlock_1$beforeA3 = parseBlock_1.beforeAndBlock(tokens.tail());

            var _parseBlock_1$beforeA4 = _slicedToArray(_parseBlock_1$beforeA3, 2);

            const before = _parseBlock_1$beforeA4[0];
            const block = _parseBlock_1$beforeA4[1];

            return new MsAst_1.MethodSetter(tokens.loc, isMy, parseExprOrQuoteSimple(before), parseBlock_1.default(block));
        } else {
            var _parseMethodSplit_1$d = parseMethodSplit_1.default(tokens);

            const before = _parseMethodSplit_1$d.before;
            const kind = _parseMethodSplit_1$d.kind;
            const after = _parseMethodSplit_1$d.after;

            const fun = parseFun_1.default(kind, after);
            return new MsAst_1.MethodImpl(tokens.loc, isMy, parseExprOrQuoteSimple(before), fun);
        }
    }
    function parseExprOrQuoteSimple(tokens) {
        const expr = parseExpr_1.default(tokens);
        return expr instanceof MsAst_1.QuoteSimple ? expr.value : expr;
    }
});
//# sourceMappingURL=parseMethodImpls.js.map

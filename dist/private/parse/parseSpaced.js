(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../MsAst', '../Token', '../util', './checks', './parse*', './parseMemberName', './parseName', './parseQuote', './parseSingle', './Slice'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var MsAst_1 = require('../MsAst');
    var Token_1 = require('../Token');
    var util_1 = require('../util');
    var checks_1 = require('./checks');
    var parse_1 = require('./parse*');
    var parseMemberName_1 = require('./parseMemberName');
    var parseName_1 = require('./parseName');
    var parseQuote_1 = require('./parseQuote');
    var parseSingle_1 = require('./parseSingle');
    var Slice_1 = require('./Slice');
    function parseSpaced(tokens) {
        const h = tokens.head(),
              rest = tokens.tail();
        if (h instanceof Token_1.Keyword) switch (h.kind) {
            case 35:
                {
                    const h2 = rest.head();
                    if (h2 instanceof Token_1.GroupParenthesis) return new MsAst_1.SimpleFun(tokens.loc, parse_1.parseExpr(Slice_1.Tokens.of(h2)));else if (Token_1.isKeyword(52, h2)) {
                        const tail = rest.tail();
                        const h3 = tail.head();
                        const fun = new MsAst_1.GetterFun(h3.loc, parseMemberName_1.default(h3));
                        return parseSpacedFold(fun, tail.tail());
                    } else {
                        const fun = new MsAst_1.MemberFun(h2.loc, null, parseMemberName_1.default(h2));
                        return parseSpacedFold(fun, rest.tail());
                    }
                }
            case 52:
                {
                    const h2 = rest.head();
                    if (Token_1.isKeyword(35, h2)) {
                        const tail = rest.tail();
                        const h3 = tail.head();
                        const name = parseMemberName_1.default(h3);
                        const fun = new MsAst_1.MemberFun(h2.loc, MsAst_1.LocalAccess.this(h2.loc), name);
                        return parseSpacedFold(fun, tail.tail());
                    } else {
                        const name = parseMemberName_1.default(rest.head());
                        const member = new MsAst_1.Member(h.loc, MsAst_1.LocalAccess.this(h.loc), name);
                        return parseSpacedFold(member, rest.tail());
                    }
                }
            case 54:
                return new MsAst_1.Spread(tokens.loc, parseSpacedFold(parseSingle_1.default(rest.head()), rest.tail()));
            case 83:
                return new MsAst_1.Lazy(h.loc, parseSpaced(rest));
            case 99:
                {
                    const h2 = rest.head();
                    if (Token_1.isKeyword(52, h2)) {
                        const tail = rest.tail();
                        const sup = new MsAst_1.SuperMember(h2.loc, parseMemberName_1.default(tail.head()));
                        return parseSpacedFold(sup, tail.tail());
                    } else if (h2 instanceof Token_1.GroupParenthesis && Slice_1.Tokens.of(h2).isEmpty()) {
                        const x = new MsAst_1.SuperCall(h2.loc, []);
                        return parseSpacedFold(x, rest.tail());
                    } else throw context_1.fail(h2.loc, _ => _.tokenAfterSuper);
                }
            case 102:
                {
                    const h2 = rest.head();
                    const quote = new MsAst_1.QuoteSimple(h2.loc, parseName_1.default(h2));
                    return parseSpacedFold(quote, rest.tail());
                }
            case 47:
                return new MsAst_1.InstanceOf(h.loc, MsAst_1.LocalAccess.focus(h.loc), parseSpaced(rest));
            default:
        }
        return parseSpacedFold(parseSingle_1.default(h, true), rest);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseSpaced;
    function parseSpacedFold(start, rest) {
        let acc = start;
        for (let i = rest.start; i < rest.end; i = i + 1) {
            function restVal() {
                return parseSpaced(rest.chopStart(i + 1));
            }
            const token = rest.tokens[i];
            const loc = token.loc;
            if (token instanceof Token_1.Keyword) switch (token.kind) {
                case 35:
                    if (i === rest.end - 1) throw checks_1.unexpected(token);
                    i = i + 1;
                    acc = new MsAst_1.MemberFun(token.loc, acc, parseMemberName_1.default(rest.tokens[i]));
                    break;
                case 52:
                    {
                        util_1.assert(i < rest.end - 1);
                        i = i + 1;
                        acc = new MsAst_1.Member(token.loc, acc, parseMemberName_1.default(rest.tokens[i]));
                        break;
                    }
                case 53:
                    context_1.check(i < rest.end - 1, token.loc, _ => _.infiniteRange);
                    return new MsAst_1.Range(token.loc, acc, restVal(), false);
                case 54:
                    return new MsAst_1.Range(token.loc, acc, Op_1.opIf(i < rest.end - 1, restVal), true);
                case 60:
                    acc = new MsAst_1.Call(token.loc, acc, [MsAst_1.LocalAccess.focus(loc)]);
                    break;
                case 47:
                    return new MsAst_1.InstanceOf(token.loc, acc, restVal());
                default:
                    throw checks_1.unexpected(token);
            } else if (token instanceof Token_1.GroupBracket) acc = new MsAst_1.Sub(loc, acc, parse_1.parseExprParts(Slice_1.Tokens.of(token)));else if (token instanceof Token_1.GroupParenthesis) {
                checks_1.checkEmpty(Slice_1.Tokens.of(token), _ => _.parensOutsideCall);
                acc = new MsAst_1.Call(loc, acc, []);
            } else if (token instanceof Token_1.GroupQuote) acc = new MsAst_1.QuoteTaggedTemplate(loc, acc, parseQuote_1.default(Slice_1.default.of(token)));else throw checks_1.unexpected(token);
        }
        return acc;
    }
});
//# sourceMappingURL=parseSpaced.js.map

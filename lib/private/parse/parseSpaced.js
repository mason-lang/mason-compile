(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../ast/Call', '../ast/Class', '../ast/Fun', '../ast/locals', '../ast/Quote', '../ast/Val', '../token/Group', '../token/Keyword', '../util', './checks', './parseExpr', './parseMemberName', './parseName', './parseQuote', './parseSingle', './Slice'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var Call_1 = require('../ast/Call');
    var Class_1 = require('../ast/Class');
    var Fun_1 = require('../ast/Fun');
    var locals_1 = require('../ast/locals');
    var Quote_1 = require('../ast/Quote');
    var Val_1 = require('../ast/Val');
    var Group_1 = require('../token/Group');
    var Keyword_1 = require('../token/Keyword');
    var util_1 = require('../util');
    var checks_1 = require('./checks');
    var parseExpr_1 = require('./parseExpr');
    var parseMemberName_1 = require('./parseMemberName');
    var parseName_1 = require('./parseName');
    var parseQuote_1 = require('./parseQuote');
    var parseSingle_1 = require('./parseSingle');
    var Slice_1 = require('./Slice');
    function parseSpaced(tokens) {
        const h = tokens.head(),
              rest = tokens.tail();
        if (h instanceof Keyword_1.default) switch (h.kind) {
            case 78:
                {
                    const h2 = rest.head();
                    if (h2 instanceof Group_1.GroupParenthesis) return new Fun_1.FunSimple(tokens.loc, parseExpr_1.default(Slice_1.Tokens.of(h2)));else if (Keyword_1.isKeyword(95, h2)) {
                        const tail = rest.tail();
                        const h3 = tail.head();
                        const fun = new Fun_1.FunGetter(h3.loc, parseMemberName_1.default(h3));
                        return parseSpacedFold(fun, tail.tail());
                    } else {
                        const fun = new Fun_1.FunMember(h2.loc, null, parseMemberName_1.default(h2));
                        return parseSpacedFold(fun, rest.tail());
                    }
                }
            case 95:
                {
                    const h2 = rest.head();
                    if (Keyword_1.isKeyword(78, h2)) {
                        const tail = rest.tail();
                        const h3 = tail.head();
                        const name = parseMemberName_1.default(h3);
                        const fun = new Fun_1.FunMember(h2.loc, locals_1.LocalAccess.this(h2.loc), name);
                        return parseSpacedFold(fun, tail.tail());
                    } else {
                        const name = parseMemberName_1.default(rest.head());
                        const member = new Val_1.Member(h.loc, locals_1.LocalAccess.this(h.loc), name);
                        return parseSpacedFold(member, rest.tail());
                    }
                }
            case 97:
                return new Call_1.Spread(tokens.loc, parseSpacedFold(parseSingle_1.default(rest.head()), rest.tail()));
            case 126:
                return new Val_1.Lazy(h.loc, parseSpaced(rest));
            case 143:
                {
                    const h2 = rest.head();
                    if (Keyword_1.isKeyword(95, h2)) {
                        const tail = rest.tail();
                        const sup = new Class_1.SuperMember(h2.loc, parseMemberName_1.default(tail.head()));
                        return parseSpacedFold(sup, tail.tail());
                    } else if (h2 instanceof Group_1.GroupParenthesis && Slice_1.Tokens.of(h2).isEmpty()) {
                        const x = new Class_1.SuperCall(h2.loc, []);
                        return parseSpacedFold(x, rest.tail());
                    } else throw context_1.fail(h2.loc, _ => _.tokenAfterSuper);
                }
            case 146:
                {
                    const h2 = rest.head();
                    const quote = new Quote_1.QuoteSimple(h2.loc, parseName_1.default(h2));
                    return parseSpacedFold(quote, rest.tail());
                }
            case 90:
                return new Val_1.InstanceOf(h.loc, locals_1.LocalAccess.focus(h.loc), parseSpaced(rest));
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
            if (token instanceof Keyword_1.default) switch (token.kind) {
                case 78:
                    if (i === rest.end - 1) throw checks_1.unexpected(token);
                    i = i + 1;
                    acc = new Fun_1.FunMember(token.loc, acc, parseMemberName_1.default(rest.tokens[i]));
                    break;
                case 95:
                    {
                        util_1.assert(i < rest.end - 1);
                        i = i + 1;
                        acc = new Val_1.Member(token.loc, acc, parseMemberName_1.default(rest.tokens[i]));
                        break;
                    }
                case 96:
                    context_1.check(i < rest.end - 1, token.loc, _ => _.infiniteRange);
                    return new Val_1.Range(token.loc, acc, restVal(), false);
                case 97:
                    return new Val_1.Range(token.loc, acc, Op_1.opIf(i < rest.end - 1, restVal), true);
                case 103:
                    acc = new Call_1.default(token.loc, acc, [locals_1.LocalAccess.focus(loc)]);
                    break;
                case 90:
                    return new Val_1.InstanceOf(token.loc, acc, restVal());
                default:
                    throw checks_1.unexpected(token);
            } else if (token instanceof Group_1.GroupBracket) acc = new Val_1.Sub(loc, acc, parseExpr_1.parseExprParts(Slice_1.Tokens.of(token)));else if (token instanceof Group_1.GroupParenthesis) {
                checks_1.checkEmpty(Slice_1.Tokens.of(token), _ => _.parensOutsideCall);
                acc = new Call_1.default(loc, acc, []);
            } else if (token instanceof Group_1.GroupQuote) acc = new Quote_1.QuoteTagged(loc, acc, parseQuote_1.default(Slice_1.default.of(token)));else throw checks_1.unexpected(token);
        }
        return acc;
    }
});
//# sourceMappingURL=parseSpaced.js.map

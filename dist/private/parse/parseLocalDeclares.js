var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../MsAst', '../Token', './checks', './parse*', './Slice'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var MsAst_1 = require('../MsAst');
    var Token_1 = require('../Token');
    var checks_1 = require('./checks');
    var parse_1 = require('./parse*');
    var Slice_1 = require('./Slice');
    function parseLocalDeclares(tokens) {
        return tokens.map(parseLocalDeclare);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseLocalDeclares;
    function parseLocalDeclaresJustNames(tokens) {
        return tokens.map(_ => MsAst_1.LocalDeclare.plain(_.loc, parseLocalName(_)));
    }
    exports.parseLocalDeclaresJustNames = parseLocalDeclaresJustNames;
    function parseLocalDeclare(token) {
        var _parseLocalParts = parseLocalParts(token);

        const name = _parseLocalParts.name;
        const opType = _parseLocalParts.opType;
        const kind = _parseLocalParts.kind;

        return new MsAst_1.LocalDeclare(token.loc, name, opType, kind);
    }
    exports.parseLocalDeclare = parseLocalDeclare;
    function parseLocalDeclareFromSpaced(tokens) {
        var _parseLocalPartsFromS = parseLocalPartsFromSpaced(tokens);

        const name = _parseLocalPartsFromS.name;
        const opType = _parseLocalPartsFromS.opType;
        const kind = _parseLocalPartsFromS.kind;

        return new MsAst_1.LocalDeclare(tokens.loc, name, opType, kind);
    }
    exports.parseLocalDeclareFromSpaced = parseLocalDeclareFromSpaced;
    function parseLocalDeclaresAndMemberArgs(tokens) {
        const declares = [],
              memberArgs = [];
        for (const token of tokens) {
            var _parseLocalParts2 = parseLocalParts(token, true);

            const name = _parseLocalParts2.name;
            const opType = _parseLocalParts2.opType;
            const kind = _parseLocalParts2.kind;
            const isMember = _parseLocalParts2.isMember;

            const declare = new MsAst_1.LocalDeclare(token.loc, name, opType, kind);
            declares.push(declare);
            if (isMember) memberArgs.push(declare);
        }
        return { declares: declares, memberArgs: memberArgs };
    }
    exports.parseLocalDeclaresAndMemberArgs = parseLocalDeclaresAndMemberArgs;
    function parseLocalName(token) {
        if (Token_1.isKeyword(60, token)) return '_';else if (token instanceof Token_1.Name) return token.name;else throw context_1.fail(token.loc, _ => _.expectedLocalName(token));
    }
    exports.parseLocalName = parseLocalName;
    function parseLocalDeclareOrFocus(tokens) {
        if (tokens.isEmpty()) return MsAst_1.LocalDeclare.focus(tokens.loc);else {
            context_1.check(tokens.size() === 1, tokens.loc, _ => _.expectedOneLocal);
            const token = tokens.head();
            if (token instanceof Token_1.GroupSpace) {
                const slice = Slice_1.Tokens.of(token);
                if (Token_1.isKeyword(47, slice.head())) return MsAst_1.LocalDeclare.typedFocus(tokens.loc, parse_1.parseSpaced(slice.tail()));
            }
            return parseLocalDeclare(token);
        }
    }
    exports.parseLocalDeclareOrFocus = parseLocalDeclareOrFocus;
    function parseLocalParts(token) {
        let orMember = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        return token instanceof Token_1.GroupSpace ? parseLocalPartsFromSpaced(Slice_1.Tokens.of(token), orMember) : { name: parseLocalName(token), opType: null, kind: 0, isMember: false };
    }
    exports.parseLocalParts = parseLocalParts;
    function parseLocalPartsFromSpaced(tokens) {
        let orMember = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        var _ref = Token_1.isKeyword(83, tokens.head()) ? [tokens.tail(), 1, false] : orMember && Token_1.isKeyword(52, tokens.head()) ? [tokens.tail(), 0, true] : [tokens, 0, false];

        var _ref2 = _slicedToArray(_ref, 3);

        const rest = _ref2[0];
        const kind = _ref2[1];
        const isMember = _ref2[2];

        const name = parseLocalName(rest.head());
        const rest2 = rest.tail();
        const opType = Op_1.opIf(!rest2.isEmpty(), () => {
            const colon = rest2.head();
            checks_1.checkKeyword(47, colon);
            const tokensType = rest2.tail();
            checks_1.checkNonEmpty(tokensType, _ => _.expectedAfterColon);
            return parse_1.parseSpaced(tokensType);
        });
        return { name: name, opType: opType, kind: kind, isMember: isMember };
    }
});
//# sourceMappingURL=parseLocalDeclares.js.map

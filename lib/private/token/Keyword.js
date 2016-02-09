var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', './keywordNames', './Token'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Op_1 = require('op/Op');
    const keywordNames_1 = require('./keywordNames');
    const Token_1 = require('./Token');
    class Keyword extends Token_1.default {}
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Keyword;
    class KeywordReserved extends Keyword {
        constructor(loc, kind) {
            super(loc);
            this.kind = kind;
        }
        name() {
            return this.kind;
        }
    }
    exports.KeywordReserved = KeywordReserved;
    class KeywordPlain extends Keyword {
        constructor(loc, kind) {
            super(loc);
            this.kind = kind;
        }
        name() {
            return keywordName(this.kind);
        }
    }
    exports.KeywordPlain = KeywordPlain;
    class KeywordOperator extends Keyword {
        constructor(loc, kind) {
            super(loc);
            this.kind = kind;
        }
        name() {
            return keywordNames_1.operatorToName.get(this.kind);
        }
    }
    exports.KeywordOperator = KeywordOperator;
    class KeywordUnaryOperator extends Keyword {
        constructor(loc, kind) {
            super(loc);
            this.kind = kind;
        }
        name() {
            return keywordNames_1.unaryOperatorToName.get(this.kind);
        }
    }
    exports.KeywordUnaryOperator = KeywordUnaryOperator;
    class KeywordSpecialVal extends Keyword {
        constructor(loc, kind) {
            super(loc);
            this.kind = kind;
        }
        name() {
            return keywordNames_1.specialValToName.get(this.kind);
        }
    }
    exports.KeywordSpecialVal = KeywordSpecialVal;
    class KeywordFun extends Keyword {
        constructor(loc, options) {
            super(loc);
            this.options = options;
        }
        name() {
            var _options = this.options;
            const isDo = _options.isDo;
            const isThisFun = _options.isThisFun;
            const kind = _options.kind;

            let s = isThisFun ? '.' : '';
            switch (kind) {
                case 1:
                    s = `${ s }$`;
                    break;
                case 2:
                    s = `${ s }*`;
                    break;
                default:
            }
            if (isDo) s = `${ s }!`;
            return `${ s }\\`;
        }
    }
    exports.KeywordFun = KeywordFun;
    class KeywordComment extends Keyword {
        constructor(loc, kind) {
            super(loc);
            this.kind = kind;
        }
        name() {
            return this.kind;
        }
    }
    exports.KeywordComment = KeywordComment;
    function isExprSplitKeyword(_) {
        return _ instanceof Keyword && (_ instanceof KeywordFun || _ instanceof KeywordOperator || _ instanceof KeywordUnaryOperator || _ instanceof KeywordPlain && _.kind <= 19);
    }
    exports.isExprSplitKeyword = isExprSplitKeyword;
    function isLineSplitKeyword(_) {
        return _ instanceof KeywordPlain && 20 <= _.kind && _.kind <= 23;
    }
    exports.isLineSplitKeyword = isLineSplitKeyword;
    function isLineStartKeyword(_) {
        return _ instanceof KeywordPlain && 23 <= _.kind && _.kind <= 32;
    }
    exports.isLineStartKeyword = isLineStartKeyword;
    function keywordName(_) {
        return keywordNames_1.kwToName.get(_);
    }
    exports.keywordName = keywordName;
    function isKeyword(kind, token) {
        return token instanceof KeywordPlain && token.kind === kind;
    }
    exports.isKeyword = isKeyword;
    const notNameKeywords = new Set([34, 21, 38, 41, 42, 27, 51, 23, 58]);
    function isNameKeyword(_) {
        return _ instanceof Keyword && !(_ instanceof KeywordFun || _ instanceof KeywordPlain && notNameKeywords.has(_.kind));
    }
    exports.isNameKeyword = isNameKeyword;
    function opKeywordFromName(loc, name) {
        return Op_1.opMap(nameToKeywordCreator.get(name), _ => _(loc));
    }
    exports.opKeywordFromName = opKeywordFromName;
    const nameToKeywordCreator = (() => {
        const m = new Map();
        for (const _ of keywordNames_1.reservedWords) m.set(_, loc => new KeywordReserved(loc, _));
        for (const _ref of keywordNames_1.operatorToName) {
            var _ref2 = _slicedToArray(_ref, 2);

            const operator = _ref2[0];
            const name = _ref2[1];

            m.set(name, loc => new KeywordOperator(loc, operator));
        }for (const _ref3 of keywordNames_1.unaryOperatorToName) {
            var _ref4 = _slicedToArray(_ref3, 2);

            const unaryOperator = _ref4[0];
            const name = _ref4[1];

            m.set(name, loc => new KeywordUnaryOperator(loc, unaryOperator));
        }for (const _ref5 of keywordNames_1.specialValToName) {
            var _ref6 = _slicedToArray(_ref5, 2);

            const specialVal = _ref6[0];
            const name = _ref6[1];

            m.set(name, loc => new KeywordSpecialVal(loc, specialVal));
        }for (const kw of keywordNames_1.kwToName.keys()) if (!notNameKeywords.has(kw)) {
            const name = keywordNames_1.kwToName.get(kw);
            m.set(name, loc => new KeywordPlain(loc, kw));
        }
        m.set('region', loc => new KeywordComment(loc, 'region'));
        m.set('todo', loc => new KeywordComment(loc, 'todo'));
        return m;
    })();
    exports.allKeywords = nameToKeywordCreator.keys();
});
//# sourceMappingURL=Keyword.js.map

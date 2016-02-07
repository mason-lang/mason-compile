(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './Token'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Token_1 = require('./Token');
    class Group extends Token_1.default {
        constructor(loc, subTokens) {
            super(loc);
            this.subTokens = subTokens;
        }
        get type() {
            return this.constructor;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Group;
    class GroupBlock extends Group {}
    exports.GroupBlock = GroupBlock;
    class GroupQuote extends Group {}
    exports.GroupQuote = GroupQuote;
    class GroupRegExp extends Group {}
    exports.GroupRegExp = GroupRegExp;
    class GroupParenthesis extends Group {}
    exports.GroupParenthesis = GroupParenthesis;
    class GroupBracket extends Group {}
    exports.GroupBracket = GroupBracket;
    class GroupBrace extends Group {}
    exports.GroupBrace = GroupBrace;
    class GroupLine extends Group {
        showType() {
            return 'line';
        }
    }
    exports.GroupLine = GroupLine;
    class GroupSpace extends Group {
        showType() {
            return 'space';
        }
    }
    exports.GroupSpace = GroupSpace;
    class GroupInterpolation extends Group {
        showType() {
            return 'interpolation';
        }
    }
    exports.GroupInterpolation = GroupInterpolation;
});
//# sourceMappingURL=Group.js.map

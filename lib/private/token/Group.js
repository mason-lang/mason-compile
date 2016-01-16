(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './Token'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Token_1 = require('./Token');
    class Group extends Token_1.default {
        constructor(loc, subTokens) {
            super(loc);
            this.subTokens = subTokens;
        }
        get type() {
            return this.constructor;
        }
        toString() {
            return this.constructor.name;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Group;
    class GroupBlock extends Group {
        showType() {
            return 'indented block';
        }
    }
    exports.GroupBlock = GroupBlock;
    class GroupQuote extends Group {
        showType() {
            return 'quote';
        }
    }
    exports.GroupQuote = GroupQuote;
    class GroupRegExp extends Group {
        showType() {
            return 'regexp';
        }
    }
    exports.GroupRegExp = GroupRegExp;
    class GroupParenthesis extends Group {
        showType() {
            return '()';
        }
    }
    exports.GroupParenthesis = GroupParenthesis;
    class GroupBracket extends Group {
        showType() {
            return '[]';
        }
    }
    exports.GroupBracket = GroupBracket;
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

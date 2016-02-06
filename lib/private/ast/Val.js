(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './LineContent', './MsAst'], factory);
    }
})(function (require, exports) {
    "use strict";

    const LineContent_1 = require('./LineContent');
    const MsAst_1 = require('./MsAst');
    class BagSimple extends LineContent_1.ValOnly {
        constructor(loc, parts) {
            super(loc);
            this.parts = parts;
        }
    }
    exports.BagSimple = BagSimple;
    class ObjSimple extends LineContent_1.ValOnly {
        constructor(loc, pairs) {
            super(loc);
            this.pairs = pairs;
        }
    }
    exports.ObjSimple = ObjSimple;
    class ObjPair extends MsAst_1.default {
        constructor(loc, key, value) {
            super(loc);
            this.key = key;
            this.value = value;
        }
    }
    exports.ObjPair = ObjPair;
    class NumberLiteral extends LineContent_1.ValOnly {
        constructor(loc, value) {
            super(loc);
            this.value = value;
        }
        toString() {
            return this.value.toString();
        }
    }
    exports.NumberLiteral = NumberLiteral;
    class Member extends LineContent_1.ValOnly {
        constructor(loc, object, name) {
            super(loc);
            this.object = object;
            this.name = name;
        }
    }
    exports.Member = Member;
    class Pipe extends LineContent_1.ValOnly {
        constructor(loc, startValue, pipes) {
            super(loc);
            this.startValue = startValue;
            this.pipes = pipes;
        }
    }
    exports.Pipe = Pipe;
    class Range extends LineContent_1.ValOnly {
        constructor(loc, start, opEnd, isExclusive) {
            super(loc);
            this.start = start;
            this.opEnd = opEnd;
            this.isExclusive = isExclusive;
        }
    }
    exports.Range = Range;
    class Lazy extends LineContent_1.ValOnly {
        constructor(loc, value) {
            super(loc);
            this.value = value;
        }
    }
    exports.Lazy = Lazy;
    class InstanceOf extends LineContent_1.ValOnly {
        constructor(loc, instance, type) {
            super(loc);
            this.instance = instance;
            this.type = type;
        }
    }
    exports.InstanceOf = InstanceOf;
    class Sub extends LineContent_1.ValOnly {
        constructor(loc, subbed, args) {
            super(loc);
            this.subbed = subbed;
            this.args = args;
        }
    }
    exports.Sub = Sub;
    class SpecialVal extends LineContent_1.ValOnly {
        constructor(loc, kind) {
            super(loc);
            this.kind = kind;
        }
    }
    exports.SpecialVal = SpecialVal;
    class Operator extends LineContent_1.ValOnly {
        constructor(loc, kind, args) {
            super(loc);
            this.kind = kind;
            this.args = args;
        }
    }
    exports.Operator = Operator;
    class UnaryOperator extends LineContent_1.ValOnly {
        constructor(loc, kind, arg) {
            super(loc);
            this.kind = kind;
            this.arg = arg;
        }
    }
    exports.UnaryOperator = UnaryOperator;
});
//# sourceMappingURL=Val.js.map

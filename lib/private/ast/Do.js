(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './LineContent'], factory);
    }
})(function (require, exports) {
    "use strict";

    const LineContent_1 = require('./LineContent');
    class Ignore extends LineContent_1.DoOnly {
        constructor(loc, ignoredNames) {
            super(loc);
            this.ignoredNames = ignoredNames;
        }
    }
    exports.Ignore = Ignore;
    class Pass extends LineContent_1.DoOnly {
        constructor(loc, ignored) {
            super(loc);
            this.ignored = ignored;
        }
    }
    exports.Pass = Pass;
    class SpecialDo extends LineContent_1.DoOnly {
        constructor(loc, kind) {
            super(loc);
            this.kind = kind;
        }
    }
    exports.SpecialDo = SpecialDo;
    class MemberSet extends LineContent_1.DoOnly {
        constructor(loc, object, name, opType, value) {
            super(loc);
            this.object = object;
            this.name = name;
            this.opType = opType;
            this.value = value;
        }
    }
    exports.MemberSet = MemberSet;
    class SetSub extends LineContent_1.DoOnly {
        constructor(loc, object, subbeds, opType, value) {
            super(loc);
            this.object = object;
            this.subbeds = subbeds;
            this.opType = opType;
            this.value = value;
        }
    }
    exports.SetSub = SetSub;
});
//# sourceMappingURL=Do.js.map

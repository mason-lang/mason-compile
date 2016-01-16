(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './LineContent', './MsAst'], factory);
    }
})(function (require, exports) {
    "use strict";

    var LineContent_1 = require('./LineContent');
    var MsAst_1 = require('./MsAst');
    class LocalDeclare extends MsAst_1.default {
        constructor(loc, name, opType, kind) {
            super(loc);
            this.name = name;
            this.opType = opType;
            this.kind = kind;
        }
        static untyped(loc, name, kind) {
            return new LocalDeclare(loc, name, null, kind);
        }
        static plain(loc, name) {
            return new LocalDeclare(loc, name, null, 0);
        }
        static built(loc) {
            return this.plain(loc, 'built');
        }
        static focus(loc) {
            return this.plain(loc, '_');
        }
        static typedFocus(loc, type) {
            return new LocalDeclare(loc, '_', type, 0);
        }
        static this(loc) {
            return this.plain(loc, 'this');
        }
        get isLazy() {
            return this.kind === 1;
        }
    }
    exports.LocalDeclare = LocalDeclare;
    class LocalAccess extends LineContent_1.ValOnly {
        constructor(loc, name) {
            super(loc);
            this.name = name;
        }
        static focus(loc) {
            return new LocalAccess(loc, '_');
        }
        static this(loc) {
            return new LocalAccess(loc, 'this');
        }
    }
    exports.LocalAccess = LocalAccess;
    class LocalMutate extends LineContent_1.DoOnly {
        constructor(loc, name, value) {
            super(loc);
            this.name = name;
            this.value = value;
        }
    }
    exports.LocalMutate = LocalMutate;
    class Assign extends LineContent_1.DoOnly {}
    exports.Assign = Assign;
    class AssignSingle extends Assign {
        constructor(loc, assignee, value) {
            super(loc);
            this.assignee = assignee;
            this.value = value;
        }
        static focus(loc, value) {
            return new AssignSingle(loc, LocalDeclare.focus(loc), value);
        }
        allAssignees() {
            return [this.assignee];
        }
    }
    exports.AssignSingle = AssignSingle;
    class AssignDestructure extends Assign {
        constructor(loc, assignees, value) {
            super(loc);
            this.assignees = assignees;
            this.value = value;
        }
        get kind() {
            return this.assignees[0].kind;
        }
        allAssignees() {
            return this.assignees;
        }
    }
    exports.AssignDestructure = AssignDestructure;
});
//# sourceMappingURL=locals.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', './context'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Op_1 = require('op/Op');
    const context_1 = require('./context');
    class VerifyResults {
        constructor() {
            this.localAccessToDeclare = new Map();
            this.localDeclareToAccesses = new Map();
            this.names = new Map();
            this.builtinPathToNames = new Map();
            this.superCallToMethod = new Map();
            this.constructorToSuper = new Map();
            this.blockToKind = new Map();
            this.objEntryExports = new Set();
            this.moduleKind = null;
            this.loopsNeedingLabel = new Set();
            this.breaksInSwitch = new Set();
        }
        localDeclareForAccess(localAccess) {
            return this.localAccessToDeclare.get(localAccess);
        }
        name(expr) {
            const name = this.names.get(expr);
            if (name === undefined) throw context_1.fail(expr.loc, _ => _.cantDetermineName);
            return name;
        }
        opName(expr) {
            const x = this.names.get(expr);
            return x === undefined ? null : x;
        }
        blockKind(block) {
            return this.blockToKind.get(block);
        }
        isObjEntryExport(objEntry) {
            return this.objEntryExports.has(objEntry);
        }
        constructorHasSuper(ctr) {
            return this.constructorToSuper.has(ctr);
        }
        loopNeedsLabel(loop) {
            return this.loopsNeedingLabel.has(loop);
        }
        isBreakInSwitch(breakAst) {
            return this.breaksInSwitch.has(breakAst);
        }
        accessBuiltin(name, path) {
            Op_1.caseOp(this.builtinPathToNames.get(path), _ => {
                _.add(name);
            }, () => {
                this.builtinPathToNames.set(path, new Set([name]));
            });
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = VerifyResults;
});
//# sourceMappingURL=VerifyResults.js.map

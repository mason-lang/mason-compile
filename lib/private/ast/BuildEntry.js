(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './LineContent', './locals'], factory);
    }
})(function (require, exports) {
    "use strict";

    const LineContent_1 = require('./LineContent');
    const locals_1 = require('./locals');
    class BuildEntry extends LineContent_1.DoOnly {
        isBuildEntry() {}
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BuildEntry;
    class ObjEntry extends BuildEntry {
        isObjEntry() {}
    }
    exports.ObjEntry = ObjEntry;
    class ObjEntryAssign extends ObjEntry {
        constructor(loc, assign) {
            super(loc);
            this.assign = assign;
        }
    }
    exports.ObjEntryAssign = ObjEntryAssign;
    class ObjEntryPlain extends ObjEntry {
        constructor(loc, name, value) {
            super(loc);
            this.name = name;
            this.value = value;
        }
        static access(loc, name) {
            return new ObjEntryPlain(loc, name, new locals_1.LocalAccess(loc, name));
        }
        static nameEntry(loc, value) {
            return new ObjEntryPlain(loc, 'name', value);
        }
    }
    exports.ObjEntryPlain = ObjEntryPlain;
    class BagEntry extends BuildEntry {
        constructor(loc, value) {
            let isMany = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

            super(loc);
            this.value = value;
            this.isMany = isMany;
        }
    }
    exports.BagEntry = BagEntry;
    class MapEntry extends BuildEntry {
        constructor(loc, key, val) {
            super(loc);
            this.key = key;
            this.val = val;
        }
    }
    exports.MapEntry = MapEntry;
});
//# sourceMappingURL=BuildEntry.js.map

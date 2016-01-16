(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var util_1 = require('./util');
    class PathOptions {
        constructor(modulePath) {
            this.modulePath = modulePath;
        }
        get moduleName() {
            return noExt(basename(this.modulePath));
        }
        get jsBaseName() {
            return `${ this.moduleName }.js`;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = PathOptions;
    function basename(path) {
        return util_1.last(path.split('/'));
    }
    function extname(path) {
        return util_1.last(path.split('.'));
    }
    function noExt(path) {
        return path.substring(0, path.length - 1 - extname(path).length);
    }
});
//# sourceMappingURL=PathOptions.js.map

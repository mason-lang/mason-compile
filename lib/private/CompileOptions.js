(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './defaultBuiltins', './util', './languages/allLanguages'], factory);
    }
})(function (require, exports) {
    "use strict";

    const defaultBuiltins_1 = require('./defaultBuiltins');
    const util_1 = require('./util');
    const allLanguages_1 = require('./languages/allLanguages');
    class CompileOptions {
        constructor(opts) {
            const o = util_1.applyDefaults(opts, {
                includeAmdefine: false,
                includeSourceMap: true,
                lazyModules: false,
                useStrict: true,
                checks: true,
                importBoot: true,
                mslPath: 'msl',
                indent: '\t',
                language: 'english',
                builtins: null,
                noModuleBoilerplate: false
            });
            this.includeAmdefine = o.includeAmdefine;
            this.includeSourceMap = o.includeSourceMap;
            this.lazyModules = o.lazyModules;
            this.useStrict = o.useStrict;
            this.checks = o.checks;
            this.importBoot = o.importBoot;
            this.mslPath = o.mslPath;
            this.indent = o.indent;
            this.noModuleBoilerplate = o.noModuleBoilerplate;
            const builtins = o.builtins === null ? getDefaultBuiltins(this.mslPath) : o.builtins;
            this.builtinNameToPath = generateBuiltinNameToPath(builtins);
            this.language = allLanguages_1.default[o.language];
            const minIndent = 2,
                  maxIndent = 8;
            const i = this.indent;
            if (!(typeof i === 'number' ? minIndent <= i && i <= maxIndent : i === '\t')) throw new Error(`opts.indent must be '\t' or a number 2-8, got: ${ i }`);
        }
        get bootPath() {
            return `${ this.mslPath }/private/boot`;
        }
        opBuiltinPath(name) {
            return this.builtinNameToPath.get(name);
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = CompileOptions;
    function getDefaultBuiltins(mslPath) {
        const builtins = Object.assign({}, defaultBuiltins_1.default);
        if (mslPath !== 'msl') for (const key in builtins) {
            const x = builtins[key];
            delete builtins[key];
            builtins[key.replace(/msl/g, mslPath)] = x;
        }
        return builtins;
    }
    function generateBuiltinNameToPath(builtins) {
        const m = new Map();
        for (const path in builtins) {
            const realPath = path.replace(/\./g, '/');
            for (let imported of builtins[path]) {
                if (imported === '_') imported = util_1.last(path.split('.'));
                if (m.has(imported)) throw new Error(`Builtin ${ imported } defined more than once.`);
                m.set(imported, realPath);
            }
        }
        return m;
    }
});
//# sourceMappingURL=CompileOptions.js.map

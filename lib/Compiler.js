(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './CompileError', './private/CompileOptions', './private/context', './private/lex/lex', './private/parse/parse', './private/render', './private/transpile/transpile', './private/verify/verify'], factory);
    }
})(function (require, exports) {
    "use strict";

    var CompileError_1 = require('./CompileError');
    var CompileOptions_1 = require('./private/CompileOptions');
    var context_1 = require('./private/context');
    var lex_1 = require('./private/lex/lex');
    var parse_1 = require('./private/parse/parse');
    var render_1 = require('./private/render');
    var transpile_1 = require('./private/transpile/transpile');
    var verify_1 = require('./private/verify/verify');
    class Compiler {
        constructor() {
            let options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            this.options = new CompileOptions_1.default(options);
        }
        compile(source, filename) {
            return context_1.withContext(this.options, filename, () => {
                const ast = parse_1.default(lex_1.default(source));
                return render_1.default(transpile_1.default(ast, verify_1.default(ast)));
            });
        }
        parse(source, filename) {
            return context_1.withContext(this.options, filename, () => {
                const ast = parse_1.default(lex_1.default(source));
                verify_1.default(ast);
                return ast;
            });
        }
        get CompileError() {
            return CompileError_1.default;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Compiler;
});
//# sourceMappingURL=Compiler.js.map

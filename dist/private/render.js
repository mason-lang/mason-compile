(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast-render-fast/lib/render', './context'], factory);
    }
})(function (require, exports) {
    "use strict";

    var render_1 = require('esast-render-fast/lib/render');
    var context_1 = require('./context');
    function render(esAst) {
        return context_1.options.includeSourceMap ? render_1.renderWithSourceMap(esAst, context_1.pathOptions.modulePath, `./${ context_1.pathOptions.jsBaseName }`) : { code: render_1.default(esAst), sourceMap: '' };
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = render;
});
//# sourceMappingURL=render.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../Token', '../util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Token_1 = require('../Token');
    var util_1 = require('../util');
    function tryTakeComment(lines) {
        const comments = [];
        let rest = lines;
        while (!rest.isEmpty()) {
            const hs = rest.headSlice();
            const h = hs.head();
            if (h instanceof Token_1.DocComment) {
                util_1.assert(hs.size() === 1);
                comments.push(h);
                rest = rest.tail();
            } else break;
        }
        return [util_1.isEmpty(comments) ? null : comments.map(_ => _.text).join('\n'), rest];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = tryTakeComment;
});
//# sourceMappingURL=tryTakeComment.js.map

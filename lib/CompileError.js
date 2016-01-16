(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";

    class CompileError extends Error {
        constructor(errorMessage) {
            super(errorMessage.message);
            this.errorMessage = errorMessage;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = CompileError;
    class ErrorMessage {
        constructor(loc, message) {
            this.loc = loc;
            this.message = message;
        }
        *messageParts(codeFormatter) {
            const message = this.message;
            const codeRegex = /{{(.*?)}}/g;
            let prevIdx = 0;
            while (true) {
                const match = codeRegex.exec(message);
                if (match === null) {
                    yield message.slice(prevIdx, message.length);
                    break;
                } else {
                    yield message.slice(prevIdx, match.index);
                    yield codeFormatter(match[1]);
                    prevIdx = codeRegex.lastIndex;
                }
            }
        }
    }
    exports.ErrorMessage = ErrorMessage;
});
//# sourceMappingURL=CompileError.js.map

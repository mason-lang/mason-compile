"use strict";

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(["exports"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports);
		global.CompileError = mod.exports;
	}
})(this, function (exports) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	class CompileError extends Error {
		constructor(warning) {
			super(warning.message);
			this.warning = warning;
		}

	}

	exports.default = CompileError;

	class Warning {
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

	exports.Warning = Warning;

	const code = exports.code = str => `{{${ str }}}`;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJDb21waWxlRXJyb3IuanMiLCJzb3VyY2VzQ29udGVudCI6W119
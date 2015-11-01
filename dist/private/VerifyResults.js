'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './context'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./context'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context);
		global.VerifyResults = mod.exports;
	}
})(this, function (exports, _context) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	class VerifyResults {
		constructor() {
			this.localAccessToDeclare = new Map();
			this.localDeclareToAccesses = new Map();
			this.names = new Map();
			this.builtinPathToNames = new Map();
			this.superCallToMethod = new Map();
			this.constructorToSuper = new Map();
		}

		localDeclareForAccess(localAccess) {
			return this.localAccessToDeclare.get(localAccess);
		}

		name(expr) {
			const name = this.names.get(expr);
			(0, _context.check)(name !== undefined, expr.loc, 'Expression must be placed in a position where name can be determined.');
			return name;
		}

		opName(expr) {
			const x = this.names.get(expr);
			return x === undefined ? null : x;
		}

	}

	exports.default = VerifyResults;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL1ZlcmlmeVJlc3VsdHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQU1xQixhQUFhOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBQWIsYUFBYSIsImZpbGUiOiJWZXJpZnlSZXN1bHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVja30gZnJvbSAnLi9jb250ZXh0J1xuXG4vKipcblJlc3VsdHMgb2Yge0BsaW5rIHZlcmlmeX0uXG5UaGlzIGlzIG9ubHkgdGhlIGRhdGEgbmVlZGVkIGJ5IHtAbGluayB0cmFuc3BpbGV9LlxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZlcmlmeVJlc3VsdHMge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHQvKipcblx0XHRMb2NhbEFjY2VzcyAtPiBMb2NhbERlY2xhcmUuXG5cdFx0TmVlZGVkIGJlY2F1c2UgbGF6eSBhY2Nlc3NlcyBtdXN0IGJlIGNvbXBpbGVkIGRpZmZlcmVudGx5LlxuXHRcdCovXG5cdFx0dGhpcy5sb2NhbEFjY2Vzc1RvRGVjbGFyZSA9IG5ldyBNYXAoKVxuXHRcdC8qKlxuXHRcdExvY2FsRGVjbGFyZSAtPiBBcnJheVtMb2NhbEFjY2Vzc10uXG5cdFx0RGVidWcgbG9jYWxzIHdpbGwgbm90IGJlIG91dHB1dCBpZiBub3QgaW4gZGVidWcgbW9kZS5cblx0XHQqL1xuXHRcdHRoaXMubG9jYWxEZWNsYXJlVG9BY2Nlc3NlcyA9IG5ldyBNYXAoKVxuXHRcdC8qKlxuXHRcdE1hcHMgQ2xhc3MvRnVuIHRvIG5hbWUgaWYgb25lIGlzIGFwcHJvcHJpYXRlLlxuXHRcdE1hcHMgKmV2ZXJ5KiB7QGxpbmsgU3BlY2lhbFZhbHMuTmFtZX0gdG8gdGhlIG5lYXJlc3QgbmFtZS5cblx0XHQqL1xuXHRcdHRoaXMubmFtZXMgPSBuZXcgTWFwKClcblx0XHQvKipcblx0XHRTdHJpbmcgLT4gU2V0LlxuXHRcdEZvciBlYWNoIHBhdGgsIHRoZSBuYW1lcyBvZiBlYWNoIGJ1aWx0aW4gaW1wb3J0ZWQuXG5cdFx0TGlrZSB0aGUgaW52ZXJzZSBvZiBjb250ZXh0Lm9wdHMuYnVpbHRpbk5hbWVUb1BhdGgsXG5cdFx0YnV0IG9ubHkgaW5jbHVkZXMgbmFtZXMgYWN0dWFsbHkgdXNlZC5cblx0XHQqL1xuXHRcdHRoaXMuYnVpbHRpblBhdGhUb05hbWVzID0gbmV3IE1hcCgpXG5cdFx0LyoqIFZhbHVlcyBhcmUgZWl0aGVyIE1ldGhvZEltcGwgb3IgdGhlIHN0cmluZyAnY29uc3RydWN0b3InICovXG5cdFx0dGhpcy5zdXBlckNhbGxUb01ldGhvZCA9IG5ldyBNYXAoKVxuXHRcdC8qKiBMaW5rcyBhIGNvbnN0cnVjdG9yIHRvIGl0cyBzdXBlciEgY2FsbC4gKi9cblx0XHR0aGlzLmNvbnN0cnVjdG9yVG9TdXBlciA9IG5ldyBNYXAoKVxuXHR9XG5cblx0bG9jYWxEZWNsYXJlRm9yQWNjZXNzKGxvY2FsQWNjZXNzKSB7XG5cdFx0cmV0dXJuIHRoaXMubG9jYWxBY2Nlc3NUb0RlY2xhcmUuZ2V0KGxvY2FsQWNjZXNzKVxuXHR9XG5cblx0LyoqIEdldCBjbG9zZXN0IGFzc2lnbm1lbnQgbmFtZSB0byBhbiBleHByZXNzaW9uLiAqL1xuXHRuYW1lKGV4cHIpIHtcblx0XHRjb25zdCBuYW1lID0gdGhpcy5uYW1lcy5nZXQoZXhwcilcblx0XHRjaGVjayhuYW1lICE9PSB1bmRlZmluZWQsIGV4cHIubG9jLFxuXHRcdFx0J0V4cHJlc3Npb24gbXVzdCBiZSBwbGFjZWQgaW4gYSBwb3NpdGlvbiB3aGVyZSBuYW1lIGNhbiBiZSBkZXRlcm1pbmVkLicpXG5cdFx0cmV0dXJuIG5hbWVcblx0fVxuXG5cdC8qKlxuXHRHZXQgY2xvc2VzdCBhc3NpZ25tZW50IG5hbWUgdG8gYW4gZXhwcmVzc2lvbixcblx0b3IgYG51bGxgIGlmIG5vbmUgaXMgYXZhaWxhYmxlLlxuXHQqL1xuXHRvcE5hbWUoZXhwcikge1xuXHRcdGNvbnN0IHggPSB0aGlzLm5hbWVzLmdldChleHByKVxuXHRcdHJldHVybiB4ID09PSB1bmRlZmluZWQgPyBudWxsIDogeFxuXHR9XG59XG4iXX0=
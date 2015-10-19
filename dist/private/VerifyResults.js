if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', './util'], function (exports, module, _util) {
	'use strict';

	/**
 Results of {@link verify}.
 This is only the data needed by {@link transpile}.
 */

	class VerifyResults {
		constructor() {
			/**
   LocalAccess -> LocalDeclare.
   Needed because lazy accesses must be compiled differently.
   */
			this.localAccessToDeclare = new Map();
			/**
   LocalDeclare -> Array[LocalAccess].
   Debug locals will not be output if not in debug mode.
   */
			this.localDeclareToAccesses = new Map();
			/**
   Maps Class/Fun to name if one is appropriate.
   Maps *every* {@link SpecialVals.Name} to the nearest name.
   */
			this.names = new Map();
			/**
   String -> Set.
   For each path, the names of each builtin imported.
   Like the inverse of context.opts.builtinNameToPath,
   but only includes names actually used.
   */
			this.builtinPathToNames = new Map();
			/** Values are either MethodImpl or the string 'constructor' */
			this.superCallToMethod = new Map();
			/** Links a constructor to its super! call. */
			this.constructorToSuper = new Map();
		}

		localDeclareForAccess(localAccess) {
			return this.localAccessToDeclare.get(localAccess);
		}

		/** Get closest assignment name to an expression. */
		name(expr) {
			const name = this.names.get(expr);
			(0, _util.assert)(name !== undefined);
			return name;
		}

		/**
  Get closest assignment name to an expression,
  or `null` if none is available.
  */
		opName(expr) {
			const x = this.names.get(expr);
			return x === undefined ? null : x;
		}
	}

	module.exports = VerifyResults;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlZlcmlmeVJlc3VsdHMuanMiLCJwcml2YXRlL1ZlcmlmeVJlc3VsdHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7O0FDTWUsT0FBTSxhQUFhLENBQUM7QUFDbEMsYUFBVyxHQUFHOzs7OztBQUtiLE9BQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBOzs7OztBQUtyQyxPQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTs7Ozs7QUFLdkMsT0FBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBOzs7Ozs7O0FBT3RCLE9BQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBOztBQUVuQyxPQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTs7QUFFbEMsT0FBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7R0FDbkM7O0FBRUQsdUJBQXFCLENBQUMsV0FBVyxFQUFFO0FBQ2xDLFVBQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtHQUNqRDs7O0FBR0QsTUFBSSxDQUFDLElBQUksRUFBRTtBQUNWLFNBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2pDLGFBM0NNLE1BQU0sRUEyQ0wsSUFBSSxLQUFLLFNBQVMsQ0FBQyxDQUFBO0FBQzFCLFVBQU8sSUFBSSxDQUFBO0dBQ1g7Ozs7OztBQU1ELFFBQU0sQ0FBQyxJQUFJLEVBQUU7QUFDWixTQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUM5QixVQUFPLENBQUMsS0FBSyxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQTtHQUNqQztFQUNEOztrQkFqRG9CLGFBQWEiLCJmaWxlIjoicHJpdmF0ZS9WZXJpZnlSZXN1bHRzLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge2Fzc2VydH0gZnJvbSAnLi91dGlsJ1xuXG4vKipcblJlc3VsdHMgb2Yge0BsaW5rIHZlcmlmeX0uXG5UaGlzIGlzIG9ubHkgdGhlIGRhdGEgbmVlZGVkIGJ5IHtAbGluayB0cmFuc3BpbGV9LlxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZlcmlmeVJlc3VsdHMge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHQvKipcblx0XHRMb2NhbEFjY2VzcyAtPiBMb2NhbERlY2xhcmUuXG5cdFx0TmVlZGVkIGJlY2F1c2UgbGF6eSBhY2Nlc3NlcyBtdXN0IGJlIGNvbXBpbGVkIGRpZmZlcmVudGx5LlxuXHRcdCovXG5cdFx0dGhpcy5sb2NhbEFjY2Vzc1RvRGVjbGFyZSA9IG5ldyBNYXAoKVxuXHRcdC8qKlxuXHRcdExvY2FsRGVjbGFyZSAtPiBBcnJheVtMb2NhbEFjY2Vzc10uXG5cdFx0RGVidWcgbG9jYWxzIHdpbGwgbm90IGJlIG91dHB1dCBpZiBub3QgaW4gZGVidWcgbW9kZS5cblx0XHQqL1xuXHRcdHRoaXMubG9jYWxEZWNsYXJlVG9BY2Nlc3NlcyA9IG5ldyBNYXAoKVxuXHRcdC8qKlxuXHRcdE1hcHMgQ2xhc3MvRnVuIHRvIG5hbWUgaWYgb25lIGlzIGFwcHJvcHJpYXRlLlxuXHRcdE1hcHMgKmV2ZXJ5KiB7QGxpbmsgU3BlY2lhbFZhbHMuTmFtZX0gdG8gdGhlIG5lYXJlc3QgbmFtZS5cblx0XHQqL1xuXHRcdHRoaXMubmFtZXMgPSBuZXcgTWFwKClcblx0XHQvKipcblx0XHRTdHJpbmcgLT4gU2V0LlxuXHRcdEZvciBlYWNoIHBhdGgsIHRoZSBuYW1lcyBvZiBlYWNoIGJ1aWx0aW4gaW1wb3J0ZWQuXG5cdFx0TGlrZSB0aGUgaW52ZXJzZSBvZiBjb250ZXh0Lm9wdHMuYnVpbHRpbk5hbWVUb1BhdGgsXG5cdFx0YnV0IG9ubHkgaW5jbHVkZXMgbmFtZXMgYWN0dWFsbHkgdXNlZC5cblx0XHQqL1xuXHRcdHRoaXMuYnVpbHRpblBhdGhUb05hbWVzID0gbmV3IE1hcCgpXG5cdFx0LyoqIFZhbHVlcyBhcmUgZWl0aGVyIE1ldGhvZEltcGwgb3IgdGhlIHN0cmluZyAnY29uc3RydWN0b3InICovXG5cdFx0dGhpcy5zdXBlckNhbGxUb01ldGhvZCA9IG5ldyBNYXAoKVxuXHRcdC8qKiBMaW5rcyBhIGNvbnN0cnVjdG9yIHRvIGl0cyBzdXBlciEgY2FsbC4gKi9cblx0XHR0aGlzLmNvbnN0cnVjdG9yVG9TdXBlciA9IG5ldyBNYXAoKVxuXHR9XG5cblx0bG9jYWxEZWNsYXJlRm9yQWNjZXNzKGxvY2FsQWNjZXNzKSB7XG5cdFx0cmV0dXJuIHRoaXMubG9jYWxBY2Nlc3NUb0RlY2xhcmUuZ2V0KGxvY2FsQWNjZXNzKVxuXHR9XG5cblx0LyoqIEdldCBjbG9zZXN0IGFzc2lnbm1lbnQgbmFtZSB0byBhbiBleHByZXNzaW9uLiAqL1xuXHRuYW1lKGV4cHIpIHtcblx0XHRjb25zdCBuYW1lID0gdGhpcy5uYW1lcy5nZXQoZXhwcilcblx0XHRhc3NlcnQobmFtZSAhPT0gdW5kZWZpbmVkKVxuXHRcdHJldHVybiBuYW1lXG5cdH1cblxuXHQvKipcblx0R2V0IGNsb3Nlc3QgYXNzaWdubWVudCBuYW1lIHRvIGFuIGV4cHJlc3Npb24sXG5cdG9yIGBudWxsYCBpZiBub25lIGlzIGF2YWlsYWJsZS5cblx0Ki9cblx0b3BOYW1lKGV4cHIpIHtcblx0XHRjb25zdCB4ID0gdGhpcy5uYW1lcy5nZXQoZXhwcilcblx0XHRyZXR1cm4geCA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IHhcblx0fVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', './util'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.util);
		global.VerifyResults = mod.exports;
	}
})(this, function (exports, module, _util) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL1ZlcmlmeVJlc3VsdHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFNZSxPQUFNLGFBQWEsQ0FBQztBQUNsQyxhQUFXLEdBQUc7Ozs7O0FBS2IsT0FBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7Ozs7O0FBS3JDLE9BQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBOzs7OztBQUt2QyxPQUFJLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7Ozs7Ozs7QUFPdEIsT0FBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7O0FBRW5DLE9BQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBOztBQUVsQyxPQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtHQUNuQzs7QUFFRCx1QkFBcUIsQ0FBQyxXQUFXLEVBQUU7QUFDbEMsVUFBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0dBQ2pEOzs7QUFHRCxNQUFJLENBQUMsSUFBSSxFQUFFO0FBQ1YsU0FBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDakMsYUEzQ00sTUFBTSxFQTJDTCxJQUFJLEtBQUssU0FBUyxDQUFDLENBQUE7QUFDMUIsVUFBTyxJQUFJLENBQUE7R0FDWDs7Ozs7O0FBTUQsUUFBTSxDQUFDLElBQUksRUFBRTtBQUNaLFNBQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzlCLFVBQU8sQ0FBQyxLQUFLLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFBO0dBQ2pDO0VBQ0Q7O2tCQWpEb0IsYUFBYSIsImZpbGUiOiJWZXJpZnlSZXN1bHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHthc3NlcnR9IGZyb20gJy4vdXRpbCdcblxuLyoqXG5SZXN1bHRzIG9mIHtAbGluayB2ZXJpZnl9LlxuVGhpcyBpcyBvbmx5IHRoZSBkYXRhIG5lZWRlZCBieSB7QGxpbmsgdHJhbnNwaWxlfS5cbiovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWZXJpZnlSZXN1bHRzIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0LyoqXG5cdFx0TG9jYWxBY2Nlc3MgLT4gTG9jYWxEZWNsYXJlLlxuXHRcdE5lZWRlZCBiZWNhdXNlIGxhenkgYWNjZXNzZXMgbXVzdCBiZSBjb21waWxlZCBkaWZmZXJlbnRseS5cblx0XHQqL1xuXHRcdHRoaXMubG9jYWxBY2Nlc3NUb0RlY2xhcmUgPSBuZXcgTWFwKClcblx0XHQvKipcblx0XHRMb2NhbERlY2xhcmUgLT4gQXJyYXlbTG9jYWxBY2Nlc3NdLlxuXHRcdERlYnVnIGxvY2FscyB3aWxsIG5vdCBiZSBvdXRwdXQgaWYgbm90IGluIGRlYnVnIG1vZGUuXG5cdFx0Ki9cblx0XHR0aGlzLmxvY2FsRGVjbGFyZVRvQWNjZXNzZXMgPSBuZXcgTWFwKClcblx0XHQvKipcblx0XHRNYXBzIENsYXNzL0Z1biB0byBuYW1lIGlmIG9uZSBpcyBhcHByb3ByaWF0ZS5cblx0XHRNYXBzICpldmVyeSoge0BsaW5rIFNwZWNpYWxWYWxzLk5hbWV9IHRvIHRoZSBuZWFyZXN0IG5hbWUuXG5cdFx0Ki9cblx0XHR0aGlzLm5hbWVzID0gbmV3IE1hcCgpXG5cdFx0LyoqXG5cdFx0U3RyaW5nIC0+IFNldC5cblx0XHRGb3IgZWFjaCBwYXRoLCB0aGUgbmFtZXMgb2YgZWFjaCBidWlsdGluIGltcG9ydGVkLlxuXHRcdExpa2UgdGhlIGludmVyc2Ugb2YgY29udGV4dC5vcHRzLmJ1aWx0aW5OYW1lVG9QYXRoLFxuXHRcdGJ1dCBvbmx5IGluY2x1ZGVzIG5hbWVzIGFjdHVhbGx5IHVzZWQuXG5cdFx0Ki9cblx0XHR0aGlzLmJ1aWx0aW5QYXRoVG9OYW1lcyA9IG5ldyBNYXAoKVxuXHRcdC8qKiBWYWx1ZXMgYXJlIGVpdGhlciBNZXRob2RJbXBsIG9yIHRoZSBzdHJpbmcgJ2NvbnN0cnVjdG9yJyAqL1xuXHRcdHRoaXMuc3VwZXJDYWxsVG9NZXRob2QgPSBuZXcgTWFwKClcblx0XHQvKiogTGlua3MgYSBjb25zdHJ1Y3RvciB0byBpdHMgc3VwZXIhIGNhbGwuICovXG5cdFx0dGhpcy5jb25zdHJ1Y3RvclRvU3VwZXIgPSBuZXcgTWFwKClcblx0fVxuXG5cdGxvY2FsRGVjbGFyZUZvckFjY2Vzcyhsb2NhbEFjY2Vzcykge1xuXHRcdHJldHVybiB0aGlzLmxvY2FsQWNjZXNzVG9EZWNsYXJlLmdldChsb2NhbEFjY2Vzcylcblx0fVxuXG5cdC8qKiBHZXQgY2xvc2VzdCBhc3NpZ25tZW50IG5hbWUgdG8gYW4gZXhwcmVzc2lvbi4gKi9cblx0bmFtZShleHByKSB7XG5cdFx0Y29uc3QgbmFtZSA9IHRoaXMubmFtZXMuZ2V0KGV4cHIpXG5cdFx0YXNzZXJ0KG5hbWUgIT09IHVuZGVmaW5lZClcblx0XHRyZXR1cm4gbmFtZVxuXHR9XG5cblx0LyoqXG5cdEdldCBjbG9zZXN0IGFzc2lnbm1lbnQgbmFtZSB0byBhbiBleHByZXNzaW9uLFxuXHRvciBgbnVsbGAgaWYgbm9uZSBpcyBhdmFpbGFibGUuXG5cdCovXG5cdG9wTmFtZShleHByKSB7XG5cdFx0Y29uc3QgeCA9IHRoaXMubmFtZXMuZ2V0KGV4cHIpXG5cdFx0cmV0dXJuIHggPT09IHVuZGVmaW5lZCA/IG51bGwgOiB4XG5cdH1cbn1cbiJdfQ==
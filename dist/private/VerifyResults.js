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
	exports.Modules = exports.Blocks = undefined;

	class VerifyResults {
		constructor() {
			this.localAccessToDeclare = new Map();
			this.localDeclareToAccesses = new Map();
			this.names = new Map();
			this.builtinPathToNames = new Map();
			this.superCallToMethod = new Map();
			this.constructorToSuper = new Map();
			this.blockToKind = new Map();
			this.statements = new Set();
			this.objEntryExports = new Set();
			this.moduleKind = null;
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

		isStatement(expr) {
			return this.statements.has(expr);
		}

		blockKind(block) {
			return this.blockToKind.get(block);
		}

		isObjEntryExport(objEntry) {
			return this.objEntryExports.has(objEntry);
		}

		constructorHasSuper(ctr) {
			return this.constructorToSuper.has(ctr);
		}

	}

	exports.default = VerifyResults;
	const Blocks = exports.Blocks = {
		Do: 0,
		Throw: 1,
		Return: 2,
		Bag: 3,
		Map: 4,
		Obj: 5
	};
	const Modules = exports.Modules = {
		Do: 0,
		Val: 1,
		Exports: 2,
		Bag: 3,
		Map: 4
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL1ZlcmlmeVJlc3VsdHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FNcUIsYUFBYTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBQWIsYUFBYTtPQXFGckIsTUFBTSxXQUFOLE1BQU0sR0FBRztBQUNyQixJQUFFLEVBQUUsQ0FBQztBQUNMLE9BQUssRUFBRSxDQUFDO0FBQ1IsUUFBTSxFQUFFLENBQUM7QUFDVCxLQUFHLEVBQUUsQ0FBQztBQUNOLEtBQUcsRUFBRSxDQUFDO0FBQ04sS0FBRyxFQUFFLENBQUM7RUFDTjtPQUdZLE9BQU8sV0FBUCxPQUFPLEdBQUc7QUFDdEIsSUFBRSxFQUFFLENBQUM7QUFDTCxLQUFHLEVBQUUsQ0FBQztBQUNOLFNBQU8sRUFBRSxDQUFDO0FBQ1YsS0FBRyxFQUFFLENBQUM7QUFDTixLQUFHLEVBQUUsQ0FBQztFQUNOIiwiZmlsZSI6IlZlcmlmeVJlc3VsdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoZWNrfSBmcm9tICcuL2NvbnRleHQnXG5cbi8qKlxuUmVzdWx0cyBvZiB7QGxpbmsgdmVyaWZ5fS5cblRoaXMgaXMgb25seSB0aGUgZGF0YSBuZWVkZWQgYnkge0BsaW5rIHRyYW5zcGlsZX0uXG4qL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmVyaWZ5UmVzdWx0cyB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdC8qKlxuXHRcdExvY2FsQWNjZXNzIC0+IExvY2FsRGVjbGFyZS5cblx0XHROZWVkZWQgYmVjYXVzZSBsYXp5IGFjY2Vzc2VzIG11c3QgYmUgY29tcGlsZWQgZGlmZmVyZW50bHkuXG5cdFx0Ki9cblx0XHR0aGlzLmxvY2FsQWNjZXNzVG9EZWNsYXJlID0gbmV3IE1hcCgpXG5cdFx0LyoqXG5cdFx0TG9jYWxEZWNsYXJlIC0+IEFycmF5W0xvY2FsQWNjZXNzXS5cblx0XHREZWJ1ZyBsb2NhbHMgd2lsbCBub3QgYmUgb3V0cHV0IGlmIG5vdCBpbiBkZWJ1ZyBtb2RlLlxuXHRcdCovXG5cdFx0dGhpcy5sb2NhbERlY2xhcmVUb0FjY2Vzc2VzID0gbmV3IE1hcCgpXG5cdFx0LyoqXG5cdFx0TWFwcyBDbGFzcy9GdW4gdG8gbmFtZSBpZiBvbmUgaXMgYXBwcm9wcmlhdGUuXG5cdFx0TWFwcyAqZXZlcnkqIHtAbGluayBTcGVjaWFsVmFscy5OYW1lfSB0byB0aGUgbmVhcmVzdCBuYW1lLlxuXHRcdCovXG5cdFx0dGhpcy5uYW1lcyA9IG5ldyBNYXAoKVxuXHRcdC8qKlxuXHRcdFN0cmluZyAtPiBTZXQuXG5cdFx0Rm9yIGVhY2ggcGF0aCwgdGhlIG5hbWVzIG9mIGVhY2ggYnVpbHRpbiBpbXBvcnRlZC5cblx0XHRMaWtlIHRoZSBpbnZlcnNlIG9mIGNvbnRleHQub3B0cy5idWlsdGluTmFtZVRvUGF0aCxcblx0XHRidXQgb25seSBpbmNsdWRlcyBuYW1lcyBhY3R1YWxseSB1c2VkLlxuXHRcdCovXG5cdFx0dGhpcy5idWlsdGluUGF0aFRvTmFtZXMgPSBuZXcgTWFwKClcblx0XHQvKiogVmFsdWVzIGFyZSBlaXRoZXIgTWV0aG9kSW1wbCBvciB0aGUgc3RyaW5nICdjb25zdHJ1Y3RvcicgKi9cblx0XHR0aGlzLnN1cGVyQ2FsbFRvTWV0aG9kID0gbmV3IE1hcCgpXG5cdFx0LyoqIExpbmtzIGEgY29uc3RydWN0b3IgdG8gaXRzIHN1cGVyISBjYWxsLiAqL1xuXHRcdHRoaXMuY29uc3RydWN0b3JUb1N1cGVyID0gbmV3IE1hcCgpXG5cdFx0LyoqIFN0b3JlcyB2ZXJpZmllZCBibG9jayBraW5kIChzZWUgdmVyaWZ5QmxvY2suanMpICovXG5cdFx0dGhpcy5ibG9ja1RvS2luZCA9IG5ldyBNYXAoKVxuXHRcdC8qKlxuXHRcdFNldCBvZiBNc0FzdHMgdGhhdCBoYXZlIGJlZW4gbWFya2VkIGFzIGJlaW5nIHN0YXRlbWVudHMuXG5cdFx0VGhvc2Ugd2hpY2ggYXJlIGFsd2F5cyBzdGF0ZW1lbnRzIChsaWtlIFRocm93KSBhcmUgbm90IG1hcmtlZC5cblx0XHRVc2UgYSBzZXQgb2Ygc3RhdGVtZW50cyBiZWNhdXNlIHRoZXJlIGFyZSB1c3VhbGx5IG1hbnkgbW9yZSB2YWxzIHRoYW4gc3RhdGVtZW50cy5cblx0XHQqL1xuXHRcdHRoaXMuc3RhdGVtZW50cyA9IG5ldyBTZXQoKVxuXHRcdC8qKiBPYmpFbnRyeV9zIHRoYXQgYXJlIG1vZHVsZSBleHBvcnRzICovXG5cdFx0dGhpcy5vYmpFbnRyeUV4cG9ydHMgPSBuZXcgU2V0KClcblx0XHQvKiogQHR5cGUge01vZHVsZXN9ICovXG5cdFx0dGhpcy5tb2R1bGVLaW5kID0gbnVsbFxuXHR9XG5cblx0LyoqIEdldHMgdGhlIExvY2FsRGVjbGFyZSB0aGF0IHdhcyB2ZXJpZmllZCB0byBiZSB0aGUgb25lIGFjY2Vzc2VkLiAqL1xuXHRsb2NhbERlY2xhcmVGb3JBY2Nlc3MobG9jYWxBY2Nlc3MpIHtcblx0XHRyZXR1cm4gdGhpcy5sb2NhbEFjY2Vzc1RvRGVjbGFyZS5nZXQobG9jYWxBY2Nlc3MpXG5cdH1cblxuXHQvKiogR2V0IGNsb3Nlc3QgYXNzaWdubWVudCBuYW1lIHRvIGFuIGV4cHJlc3Npb24uICovXG5cdG5hbWUoZXhwcikge1xuXHRcdGNvbnN0IG5hbWUgPSB0aGlzLm5hbWVzLmdldChleHByKVxuXHRcdGNoZWNrKG5hbWUgIT09IHVuZGVmaW5lZCwgZXhwci5sb2MsXG5cdFx0XHQnRXhwcmVzc2lvbiBtdXN0IGJlIHBsYWNlZCBpbiBhIHBvc2l0aW9uIHdoZXJlIG5hbWUgY2FuIGJlIGRldGVybWluZWQuJylcblx0XHRyZXR1cm4gbmFtZVxuXHR9XG5cblx0LyoqXG5cdEdldCBjbG9zZXN0IGFzc2lnbm1lbnQgbmFtZSB0byBhbiBleHByZXNzaW9uLFxuXHRvciBgbnVsbGAgaWYgbm9uZSBpcyBhdmFpbGFibGUuXG5cdCovXG5cdG9wTmFtZShleHByKSB7XG5cdFx0Y29uc3QgeCA9IHRoaXMubmFtZXMuZ2V0KGV4cHIpXG5cdFx0cmV0dXJuIHggPT09IHVuZGVmaW5lZCA/IG51bGwgOiB4XG5cdH1cblxuXHQvKiogQ2VydGFpbiBleHByZXNzaW9ucyAoc3VjaCBhcyBgaWZgKSBhcmUgbWFya2VkIGlmIHRoZXkgYXJlIHN0YXRlbWVudHMuICovXG5cdGlzU3RhdGVtZW50KGV4cHIpIHtcblx0XHRyZXR1cm4gdGhpcy5zdGF0ZW1lbnRzLmhhcyhleHByKVxuXHR9XG5cblx0LyoqIFdoYXQga2luZCBvZiBibG9jayB0aGUgdmVyaWZpZXIgZGV0ZXJtaW5lZCB0aGlzIHRvIGJlLiAqL1xuXHRibG9ja0tpbmQoYmxvY2spIHtcblx0XHRyZXR1cm4gdGhpcy5ibG9ja1RvS2luZC5nZXQoYmxvY2spXG5cdH1cblxuXHQvKiogV2hldGhlciBhbiBPYmpFbnRyeSBpcyBhIG1vZHVsZSBleHBvcnQuICovXG5cdGlzT2JqRW50cnlFeHBvcnQob2JqRW50cnkpIHtcblx0XHRyZXR1cm4gdGhpcy5vYmpFbnRyeUV4cG9ydHMuaGFzKG9iakVudHJ5KVxuXHR9XG5cblx0Y29uc3RydWN0b3JIYXNTdXBlcihjdHIpIHtcblx0XHRyZXR1cm4gdGhpcy5jb25zdHJ1Y3RvclRvU3VwZXIuaGFzKGN0cilcblx0fVxufVxuXG4vKiogS2luZHMgb2Yge0BsaW5rIEJsb2NrfS4gKi9cbmV4cG9ydCBjb25zdCBCbG9ja3MgPSB7XG5cdERvOiAwLFxuXHRUaHJvdzogMSxcblx0UmV0dXJuOiAyLFxuXHRCYWc6IDMsXG5cdE1hcDogNCxcblx0T2JqOiA1XG59XG5cbi8qKiBLaW5kcyBvZiB7QGxpbmsgTW9kdWxlfS4gKi9cbmV4cG9ydCBjb25zdCBNb2R1bGVzID0ge1xuXHREbzogMCxcblx0VmFsOiAxLFxuXHRFeHBvcnRzOiAyLFxuXHRCYWc6IDMsXG5cdE1hcDogNCxcbn1cbiJdfQ==
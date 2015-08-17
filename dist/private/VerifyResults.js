if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', './util'], function (exports, _util) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	class VerifyResults {
		constructor() {
			// LocalAccess -> LocalDeclare.
			// Needed because lazy accesses must be compiled differently.
			this.localAccessToDeclare = new Map();
			// LocalDeclare -> VrLocalInfo.
			// Debug locals will not be output if not in debug mode.
			this.localDeclareToInfo = new Map();
			// TODO:ES6 Can use do `export { a, b, ... }` at the end, so shouldn't need this.
			// Includes both Assigns and AssignDestructures.
			this.exportAssigns = new Set();
		}

		isDebugLocal(localDeclare) {
			return this.localDeclareToInfo.get(localDeclare).isInDebug;
		}

		isAccessed(localDeclare) {
			const info = this.localDeclareToInfo.get(localDeclare);
			return !((0, _util.isEmpty)(info.debugAccesses) && (0, _util.isEmpty)(info.nonDebugAccesses));
		}

		isExportAssign(assign) {
			return this.exportAssigns.has(assign);
		}

		localDeclareForAccess(localAccess) {
			return this.localAccessToDeclare.get(localAccess);
		}
	}

	exports.default = VerifyResults;

	class LocalInfo {
		static empty(isInDebug) {
			return new LocalInfo(isInDebug, [], []);
		}

		constructor(isInDebug, /* Boolean */
		debugAccesses, /* LocalAccess */
		nonDebugAccesses /* Array[LocalAccess] */) {
			this.isInDebug = isInDebug;
			this.debugAccesses = debugAccesses;
			this.nonDebugAccesses = nonDebugAccesses;
		}
	}

	exports.LocalInfo = LocalInfo;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaXZhdGUvVmVyaWZ5UmVzdWx0cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBRWUsT0FBTSxhQUFhLENBQUM7QUFDbEMsYUFBVyxHQUFHOzs7QUFHYixPQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTs7O0FBR3JDLE9BQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBOzs7QUFHbkMsT0FBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0dBQzlCOztBQUVELGNBQVksQ0FBQyxZQUFZLEVBQUU7QUFDMUIsVUFBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLFNBQVMsQ0FBQTtHQUMxRDs7QUFFRCxZQUFVLENBQUMsWUFBWSxFQUFFO0FBQ3hCLFNBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7QUFDdEQsVUFBTyxFQUFFLFVBckJGLE9BQU8sRUFxQkcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLFVBckJqQyxPQUFPLEVBcUJrQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQSxBQUFDLENBQUE7R0FDdkU7O0FBRUQsZ0JBQWMsQ0FBQyxNQUFNLEVBQUU7QUFDdEIsVUFBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtHQUNyQzs7QUFFRCx1QkFBcUIsQ0FBQyxXQUFXLEVBQUU7QUFDbEMsVUFBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0dBQ2pEO0VBQ0Q7O21CQTdCb0IsYUFBYTs7QUErQjNCLE9BQU0sU0FBUyxDQUFDO0FBQ3RCLFNBQU8sS0FBSyxDQUFDLFNBQVMsRUFBRTtBQUN2QixVQUFPLElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRSxFQUFHLEVBQUUsRUFBRyxDQUFDLENBQUE7R0FDekM7O0FBRUQsYUFBVyxDQUNWLFNBQVM7QUFDVCxlQUFhO0FBQ2Isa0JBQWdCLDJCQUEyQjtBQUMzQyxPQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtBQUMxQixPQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQTtBQUNsQyxPQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUE7R0FDeEM7RUFDRCIsImZpbGUiOiJwcml2YXRlL1ZlcmlmeVJlc3VsdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc0VtcHR5IH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWZXJpZnlSZXN1bHRzIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0Ly8gTG9jYWxBY2Nlc3MgLT4gTG9jYWxEZWNsYXJlLlxuXHRcdC8vIE5lZWRlZCBiZWNhdXNlIGxhenkgYWNjZXNzZXMgbXVzdCBiZSBjb21waWxlZCBkaWZmZXJlbnRseS5cblx0XHR0aGlzLmxvY2FsQWNjZXNzVG9EZWNsYXJlID0gbmV3IE1hcCgpXG5cdFx0Ly8gTG9jYWxEZWNsYXJlIC0+IFZyTG9jYWxJbmZvLlxuXHRcdC8vIERlYnVnIGxvY2FscyB3aWxsIG5vdCBiZSBvdXRwdXQgaWYgbm90IGluIGRlYnVnIG1vZGUuXG5cdFx0dGhpcy5sb2NhbERlY2xhcmVUb0luZm8gPSBuZXcgTWFwKClcblx0XHQvLyBUT0RPOkVTNiBDYW4gdXNlIGRvIGBleHBvcnQgeyBhLCBiLCAuLi4gfWAgYXQgdGhlIGVuZCwgc28gc2hvdWxkbid0IG5lZWQgdGhpcy5cblx0XHQvLyBJbmNsdWRlcyBib3RoIEFzc2lnbnMgYW5kIEFzc2lnbkRlc3RydWN0dXJlcy5cblx0XHR0aGlzLmV4cG9ydEFzc2lnbnMgPSBuZXcgU2V0KClcblx0fVxuXG5cdGlzRGVidWdMb2NhbChsb2NhbERlY2xhcmUpIHtcblx0XHRyZXR1cm4gdGhpcy5sb2NhbERlY2xhcmVUb0luZm8uZ2V0KGxvY2FsRGVjbGFyZSkuaXNJbkRlYnVnXG5cdH1cblxuXHRpc0FjY2Vzc2VkKGxvY2FsRGVjbGFyZSkge1xuXHRcdGNvbnN0IGluZm8gPSB0aGlzLmxvY2FsRGVjbGFyZVRvSW5mby5nZXQobG9jYWxEZWNsYXJlKVxuXHRcdHJldHVybiAhKGlzRW1wdHkoaW5mby5kZWJ1Z0FjY2Vzc2VzKSAmJiBpc0VtcHR5KGluZm8ubm9uRGVidWdBY2Nlc3NlcykpXG5cdH1cblxuXHRpc0V4cG9ydEFzc2lnbihhc3NpZ24pIHtcblx0XHRyZXR1cm4gdGhpcy5leHBvcnRBc3NpZ25zLmhhcyhhc3NpZ24pXG5cdH1cblxuXHRsb2NhbERlY2xhcmVGb3JBY2Nlc3MobG9jYWxBY2Nlc3MpIHtcblx0XHRyZXR1cm4gdGhpcy5sb2NhbEFjY2Vzc1RvRGVjbGFyZS5nZXQobG9jYWxBY2Nlc3MpXG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIExvY2FsSW5mbyB7XG5cdHN0YXRpYyBlbXB0eShpc0luRGVidWcpIHtcblx0XHRyZXR1cm4gbmV3IExvY2FsSW5mbyhpc0luRGVidWcsIFsgXSwgWyBdKVxuXHR9XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0aXNJbkRlYnVnIC8qIEJvb2xlYW4gKi8sXG5cdFx0ZGVidWdBY2Nlc3NlcyAvKiBMb2NhbEFjY2VzcyAqLyxcblx0XHRub25EZWJ1Z0FjY2Vzc2VzIC8qIEFycmF5W0xvY2FsQWNjZXNzXSAqLykge1xuXHRcdHRoaXMuaXNJbkRlYnVnID0gaXNJbkRlYnVnXG5cdFx0dGhpcy5kZWJ1Z0FjY2Vzc2VzID0gZGVidWdBY2Nlc3Nlc1xuXHRcdHRoaXMubm9uRGVidWdBY2Nlc3NlcyA9IG5vbkRlYnVnQWNjZXNzZXNcblx0fVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
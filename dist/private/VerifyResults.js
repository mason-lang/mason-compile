if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'tupl/dist//tupl', '../MsAst', './util'], function (exports, _tuplDistTupl, _MsAst, _util) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _tupl = _interopRequireDefault(_tuplDistTupl);

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
	const LocalInfo = (0, _tupl.default)('VrLocalInfo', Object, 'TODO:doc', ['isInDebug', Boolean, 'debugAccesses', [_MsAst.LocalAccess], 'nonDebugAccesses', [_MsAst.LocalAccess]], {}, {
		empty: isInDebug => LocalInfo(isInDebug, [], [])
	});
	exports.LocalInfo = LocalInfo;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaXZhdGUvVmVyaWZ5UmVzdWx0cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUllLE9BQU0sYUFBYSxDQUFDO0FBQ2xDLGFBQVcsR0FBRzs7O0FBR2IsT0FBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7OztBQUdyQyxPQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTs7O0FBR25DLE9BQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtHQUM5Qjs7QUFFRCxjQUFZLENBQUMsWUFBWSxFQUFFO0FBQzFCLFVBQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxTQUFTLENBQUE7R0FDMUQ7O0FBRUQsWUFBVSxDQUFDLFlBQVksRUFBRTtBQUN4QixTQUFNLElBQUksR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQ3RELFVBQU8sRUFBRSxVQXJCRixPQUFPLEVBcUJHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxVQXJCakMsT0FBTyxFQXFCa0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUEsQUFBQyxDQUFBO0dBQ3ZFOztBQUVELGdCQUFjLENBQUMsTUFBTSxFQUFFO0FBQ3RCLFVBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7R0FDckM7O0FBRUQsdUJBQXFCLENBQUMsV0FBVyxFQUFFO0FBQ2xDLFVBQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtHQUNqRDtFQUNEOzttQkE3Qm9CLGFBQWE7QUErQjNCLE9BQU0sU0FBUyxHQUFHLG1CQUFLLGFBQWEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUM5RCxDQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLFFBbkNqQyxXQUFXLENBbUNtQyxFQUFFLGtCQUFrQixFQUFFLFFBbkNwRSxXQUFXLENBbUNzRSxDQUFFLEVBQzNGLEVBQUcsRUFDSDtBQUNDLE9BQUssRUFBRSxTQUFTLElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRSxFQUFHLEVBQUUsRUFBRyxDQUFDO0VBQ2xELENBQUMsQ0FBQSIsImZpbGUiOiJwcml2YXRlL1ZlcmlmeVJlc3VsdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHVwbCBmcm9tICd0dXBsL2Rpc3QvL3R1cGwnXG5pbXBvcnQgeyBMb2NhbEFjY2VzcyB9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHsgaXNFbXB0eSB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmVyaWZ5UmVzdWx0cyB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdC8vIExvY2FsQWNjZXNzIC0+IExvY2FsRGVjbGFyZS5cblx0XHQvLyBOZWVkZWQgYmVjYXVzZSBsYXp5IGFjY2Vzc2VzIG11c3QgYmUgY29tcGlsZWQgZGlmZmVyZW50bHkuXG5cdFx0dGhpcy5sb2NhbEFjY2Vzc1RvRGVjbGFyZSA9IG5ldyBNYXAoKVxuXHRcdC8vIExvY2FsRGVjbGFyZSAtPiBWckxvY2FsSW5mby5cblx0XHQvLyBEZWJ1ZyBsb2NhbHMgd2lsbCBub3QgYmUgb3V0cHV0IGlmIG5vdCBpbiBkZWJ1ZyBtb2RlLlxuXHRcdHRoaXMubG9jYWxEZWNsYXJlVG9JbmZvID0gbmV3IE1hcCgpXG5cdFx0Ly8gVE9ETzpFUzYgQ2FuIHVzZSBkbyBgZXhwb3J0IHsgYSwgYiwgLi4uIH1gIGF0IHRoZSBlbmQsIHNvIHNob3VsZG4ndCBuZWVkIHRoaXMuXG5cdFx0Ly8gSW5jbHVkZXMgYm90aCBBc3NpZ25zIGFuZCBBc3NpZ25EZXN0cnVjdHVyZXMuXG5cdFx0dGhpcy5leHBvcnRBc3NpZ25zID0gbmV3IFNldCgpXG5cdH1cblxuXHRpc0RlYnVnTG9jYWwobG9jYWxEZWNsYXJlKSB7XG5cdFx0cmV0dXJuIHRoaXMubG9jYWxEZWNsYXJlVG9JbmZvLmdldChsb2NhbERlY2xhcmUpLmlzSW5EZWJ1Z1xuXHR9XG5cblx0aXNBY2Nlc3NlZChsb2NhbERlY2xhcmUpIHtcblx0XHRjb25zdCBpbmZvID0gdGhpcy5sb2NhbERlY2xhcmVUb0luZm8uZ2V0KGxvY2FsRGVjbGFyZSlcblx0XHRyZXR1cm4gIShpc0VtcHR5KGluZm8uZGVidWdBY2Nlc3NlcykgJiYgaXNFbXB0eShpbmZvLm5vbkRlYnVnQWNjZXNzZXMpKVxuXHR9XG5cblx0aXNFeHBvcnRBc3NpZ24oYXNzaWduKSB7XG5cdFx0cmV0dXJuIHRoaXMuZXhwb3J0QXNzaWducy5oYXMoYXNzaWduKVxuXHR9XG5cblx0bG9jYWxEZWNsYXJlRm9yQWNjZXNzKGxvY2FsQWNjZXNzKSB7XG5cdFx0cmV0dXJuIHRoaXMubG9jYWxBY2Nlc3NUb0RlY2xhcmUuZ2V0KGxvY2FsQWNjZXNzKVxuXHR9XG59XG5cbmV4cG9ydCBjb25zdCBMb2NhbEluZm8gPSB0dXBsKCdWckxvY2FsSW5mbycsIE9iamVjdCwgJ1RPRE86ZG9jJyxcblx0WyAnaXNJbkRlYnVnJywgQm9vbGVhbiwgJ2RlYnVnQWNjZXNzZXMnLCBbTG9jYWxBY2Nlc3NdLCAnbm9uRGVidWdBY2Nlc3NlcycsIFtMb2NhbEFjY2Vzc10gXSxcblx0eyB9LFxuXHR7XG5cdFx0ZW1wdHk6IGlzSW5EZWJ1ZyA9PiBMb2NhbEluZm8oaXNJbkRlYnVnLCBbIF0sIFsgXSlcblx0fSlcbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9
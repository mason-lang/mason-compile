'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../util', '../VerifyResults', './autoBlockKind', './context', './locals', './SK', './verifyLines'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../util'), require('../VerifyResults'), require('./autoBlockKind'), require('./context'), require('./locals'), require('./SK'), require('./verifyLines'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.util, global.VerifyResults, global.autoBlockKind, global.context, global.locals, global.SK, global.verifyLines);
		global.verifyBlock = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _util, _VerifyResults, _autoBlockKind, _context2, _locals, _SK, _verifyLines) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = verifyBlock;
	exports.verifyModuleLines = verifyModuleLines;

	var _autoBlockKind2 = _interopRequireDefault(_autoBlockKind);

	var _SK2 = _interopRequireDefault(_SK);

	var _verifyLines2 = _interopRequireDefault(_verifyLines);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function verifyBlock(sk) {
		if (sk === _SK2.default.Do) {
			(0, _verifyLines2.default)(this.lines);

			_context2.results.blockToKind.set(this, _VerifyResults.Blocks.Do);
		} else {
			(0, _context.check)(!(0, _util.isEmpty)(this.lines), 'Value block must have some content.');
			const kind = (0, _autoBlockKind2.default)(this.lines, this.loc);

			switch (kind) {
				case _VerifyResults.Blocks.Bag:
				case _VerifyResults.Blocks.Map:
				case _VerifyResults.Blocks.Obj:
					verifyBuiltLines(this.lines, this.loc);
					break;

				case _VerifyResults.Blocks.Throw:
					(0, _verifyLines2.default)(this.lines);
					break;

				case _VerifyResults.Blocks.Return:
					(0, _locals.plusLocals)((0, _verifyLines2.default)((0, _util.rtail)(this.lines)), () => {
						(0, _util.last)(this.lines).verify(_SK2.default.Val);
					});
					break;

				default:
					throw new Error(kind);
			}

			_context2.results.blockToKind.set(this, kind);
		}
	}

	function verifyModuleLines(lines, loc) {
		_context2.results.moduleKind = (0, _util.ifElse)((0, _autoBlockKind.opBlockBuildKind)(lines, loc), buildKind => {
			if (buildKind === _VerifyResults.Blocks.Obj) {
				for (const line of lines) if (line instanceof _MsAst.ObjEntry) _context2.results.objEntryExports.add(line);

				(0, _verifyLines2.default)(lines);
				return _VerifyResults.Modules.Exports;
			} else {
				verifyBuiltLines(lines, loc);
				return buildKind === _VerifyResults.Blocks.Bag ? _VerifyResults.Modules.Bag : _VerifyResults.Modules.Map;
			}
		}, () => {
			if ((0, _util.isEmpty)(lines)) return _VerifyResults.Modules.Do;else {
				const l = (0, _util.last)(lines);
				const lastSK = (0, _SK.getSK)(l);

				if (lastSK === _SK2.default.Do) {
					(0, _verifyLines2.default)(lines);
					return _VerifyResults.Modules.Do;
				} else {
					const newLocals = (0, _verifyLines2.default)((0, _util.rtail)(lines));
					(0, _locals.plusLocals)(newLocals, () => {
						l.verify(lastSK);
					});
					return _VerifyResults.Modules.Val;
				}
			}
		});
	}

	function verifyBuiltLines(lines, loc) {
		(0, _locals.verifyAndPlusLocal)(_MsAst.LocalDeclare.built(loc), () => {
			(0, _verifyLines2.default)(lines);
		});
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnlCbG9jay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBVXdCLFdBQVc7U0EwQm5CLGlCQUFpQixHQUFqQixpQkFBaUI7Ozs7Ozs7Ozs7VUExQlQsV0FBVzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQTBCbkIsaUJBQWlCIiwiZmlsZSI6InZlcmlmeUJsb2NrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVja30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7T2JqRW50cnksIExvY2FsRGVjbGFyZX0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2lmRWxzZSwgaXNFbXB0eSwgbGFzdCwgcnRhaWx9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0Jsb2NrcywgTW9kdWxlc30gZnJvbSAnLi4vVmVyaWZ5UmVzdWx0cydcbmltcG9ydCBhdXRvQmxvY2tLaW5kLCB7b3BCbG9ja0J1aWxkS2luZH0gZnJvbSAnLi9hdXRvQmxvY2tLaW5kJ1xuaW1wb3J0IHtyZXN1bHRzfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge3BsdXNMb2NhbHMsIHZlcmlmeUFuZFBsdXNMb2NhbH0gZnJvbSAnLi9sb2NhbHMnXG5pbXBvcnQgU0ssIHtnZXRTS30gZnJvbSAnLi9TSydcbmltcG9ydCB2ZXJpZnlMaW5lcyBmcm9tICcuL3ZlcmlmeUxpbmVzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB2ZXJpZnlCbG9jayhzaykge1xuXHRpZiAoc2sgPT09IFNLLkRvKSB7XG5cdFx0dmVyaWZ5TGluZXModGhpcy5saW5lcylcblx0XHRyZXN1bHRzLmJsb2NrVG9LaW5kLnNldCh0aGlzLCBCbG9ja3MuRG8pXG5cdH0gZWxzZSB7XG5cdFx0Y2hlY2soIWlzRW1wdHkodGhpcy5saW5lcyksICdWYWx1ZSBibG9jayBtdXN0IGhhdmUgc29tZSBjb250ZW50LicpXG5cdFx0Y29uc3Qga2luZCA9IGF1dG9CbG9ja0tpbmQodGhpcy5saW5lcywgdGhpcy5sb2MpXG5cdFx0c3dpdGNoIChraW5kKSB7XG5cdFx0XHRjYXNlIEJsb2Nrcy5CYWc6IGNhc2UgQmxvY2tzLk1hcDogY2FzZSBCbG9ja3MuT2JqOlxuXHRcdFx0XHR2ZXJpZnlCdWlsdExpbmVzKHRoaXMubGluZXMsIHRoaXMubG9jKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBCbG9ja3MuVGhyb3c6XG5cdFx0XHRcdHZlcmlmeUxpbmVzKHRoaXMubGluZXMpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIEJsb2Nrcy5SZXR1cm46XG5cdFx0XHRcdHBsdXNMb2NhbHModmVyaWZ5TGluZXMocnRhaWwodGhpcy5saW5lcykpLCAoKSA9PiB7XG5cdFx0XHRcdFx0bGFzdCh0aGlzLmxpbmVzKS52ZXJpZnkoU0suVmFsKVxuXHRcdFx0XHR9KVxuXHRcdFx0XHRicmVha1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGtpbmQpXG5cdFx0fVxuXHRcdHJlc3VsdHMuYmxvY2tUb0tpbmQuc2V0KHRoaXMsIGtpbmQpXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeU1vZHVsZUxpbmVzKGxpbmVzLCBsb2MpIHtcblx0cmVzdWx0cy5tb2R1bGVLaW5kID0gaWZFbHNlKG9wQmxvY2tCdWlsZEtpbmQobGluZXMsIGxvYyksXG5cdFx0YnVpbGRLaW5kID0+IHtcblx0XHRcdGlmIChidWlsZEtpbmQgPT09IEJsb2Nrcy5PYmopIHtcblx0XHRcdFx0Zm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKVxuXHRcdFx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgT2JqRW50cnkpXG5cdFx0XHRcdFx0XHRyZXN1bHRzLm9iakVudHJ5RXhwb3J0cy5hZGQobGluZSlcblx0XHRcdFx0dmVyaWZ5TGluZXMobGluZXMpXG5cdFx0XHRcdHJldHVybiBNb2R1bGVzLkV4cG9ydHNcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZlcmlmeUJ1aWx0TGluZXMobGluZXMsIGxvYylcblx0XHRcdFx0cmV0dXJuIGJ1aWxkS2luZCA9PT0gQmxvY2tzLkJhZyA/IE1vZHVsZXMuQmFnIDogTW9kdWxlcy5NYXBcblx0XHRcdH1cblx0XHR9LFxuXHRcdCgpID0+IHtcblx0XHRcdGlmIChpc0VtcHR5KGxpbmVzKSlcblx0XHRcdFx0cmV0dXJuIE1vZHVsZXMuRG9cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRjb25zdCBsID0gbGFzdChsaW5lcylcblx0XHRcdFx0Y29uc3QgbGFzdFNLID0gZ2V0U0sobClcblx0XHRcdFx0aWYgKGxhc3RTSyA9PT0gU0suRG8pIHtcblx0XHRcdFx0XHR2ZXJpZnlMaW5lcyhsaW5lcylcblx0XHRcdFx0XHRyZXR1cm4gTW9kdWxlcy5Eb1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IG5ld0xvY2FscyA9IHZlcmlmeUxpbmVzKHJ0YWlsKGxpbmVzKSlcblx0XHRcdFx0XHRwbHVzTG9jYWxzKG5ld0xvY2FscywgKCkgPT4ge1xuXHRcdFx0XHRcdFx0bC52ZXJpZnkobGFzdFNLKVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0cmV0dXJuIE1vZHVsZXMuVmFsXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlCdWlsdExpbmVzKGxpbmVzLCBsb2MpIHtcblx0dmVyaWZ5QW5kUGx1c0xvY2FsKExvY2FsRGVjbGFyZS5idWlsdChsb2MpLCAoKSA9PiB7IHZlcmlmeUxpbmVzKGxpbmVzKSB9KVxufVxuIl19
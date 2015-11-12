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

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnlCbG9jay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBVXdCLFdBQVc7U0EwQm5CLGlCQUFpQixHQUFqQixpQkFBaUI7Ozs7Ozs7Ozs7Ozs7O1VBMUJULFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUEwQm5CLGlCQUFpQiIsImZpbGUiOiJ2ZXJpZnlCbG9jay5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge09iakVudHJ5LCBMb2NhbERlY2xhcmV9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtpZkVsc2UsIGlzRW1wdHksIGxhc3QsIHJ0YWlsfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtCbG9ja3MsIE1vZHVsZXN9IGZyb20gJy4uL1ZlcmlmeVJlc3VsdHMnXG5pbXBvcnQgYXV0b0Jsb2NrS2luZCwge29wQmxvY2tCdWlsZEtpbmR9IGZyb20gJy4vYXV0b0Jsb2NrS2luZCdcbmltcG9ydCB7cmVzdWx0c30gZnJvbSAnLi9jb250ZXh0J1xuaW1wb3J0IHtwbHVzTG9jYWxzLCB2ZXJpZnlBbmRQbHVzTG9jYWx9IGZyb20gJy4vbG9jYWxzJ1xuaW1wb3J0IFNLLCB7Z2V0U0t9IGZyb20gJy4vU0snXG5pbXBvcnQgdmVyaWZ5TGluZXMgZnJvbSAnLi92ZXJpZnlMaW5lcydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdmVyaWZ5QmxvY2soc2spIHtcblx0aWYgKHNrID09PSBTSy5Ebykge1xuXHRcdHZlcmlmeUxpbmVzKHRoaXMubGluZXMpXG5cdFx0cmVzdWx0cy5ibG9ja1RvS2luZC5zZXQodGhpcywgQmxvY2tzLkRvKVxuXHR9IGVsc2Uge1xuXHRcdGNoZWNrKCFpc0VtcHR5KHRoaXMubGluZXMpLCAnVmFsdWUgYmxvY2sgbXVzdCBoYXZlIHNvbWUgY29udGVudC4nKVxuXHRcdGNvbnN0IGtpbmQgPSBhdXRvQmxvY2tLaW5kKHRoaXMubGluZXMsIHRoaXMubG9jKVxuXHRcdHN3aXRjaCAoa2luZCkge1xuXHRcdFx0Y2FzZSBCbG9ja3MuQmFnOiBjYXNlIEJsb2Nrcy5NYXA6IGNhc2UgQmxvY2tzLk9iajpcblx0XHRcdFx0dmVyaWZ5QnVpbHRMaW5lcyh0aGlzLmxpbmVzLCB0aGlzLmxvYylcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQmxvY2tzLlRocm93OlxuXHRcdFx0XHR2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBCbG9ja3MuUmV0dXJuOlxuXHRcdFx0XHRwbHVzTG9jYWxzKHZlcmlmeUxpbmVzKHJ0YWlsKHRoaXMubGluZXMpKSwgKCkgPT4ge1xuXHRcdFx0XHRcdGxhc3QodGhpcy5saW5lcykudmVyaWZ5KFNLLlZhbClcblx0XHRcdFx0fSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihraW5kKVxuXHRcdH1cblx0XHRyZXN1bHRzLmJsb2NrVG9LaW5kLnNldCh0aGlzLCBraW5kKVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlNb2R1bGVMaW5lcyhsaW5lcywgbG9jKSB7XG5cdHJlc3VsdHMubW9kdWxlS2luZCA9IGlmRWxzZShvcEJsb2NrQnVpbGRLaW5kKGxpbmVzLCBsb2MpLFxuXHRcdGJ1aWxkS2luZCA9PiB7XG5cdFx0XHRpZiAoYnVpbGRLaW5kID09PSBCbG9ja3MuT2JqKSB7XG5cdFx0XHRcdGZvciAoY29uc3QgbGluZSBvZiBsaW5lcylcblx0XHRcdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIE9iakVudHJ5KVxuXHRcdFx0XHRcdFx0cmVzdWx0cy5vYmpFbnRyeUV4cG9ydHMuYWRkKGxpbmUpXG5cdFx0XHRcdHZlcmlmeUxpbmVzKGxpbmVzKVxuXHRcdFx0XHRyZXR1cm4gTW9kdWxlcy5FeHBvcnRzXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2ZXJpZnlCdWlsdExpbmVzKGxpbmVzLCBsb2MpXG5cdFx0XHRcdHJldHVybiBidWlsZEtpbmQgPT09IEJsb2Nrcy5CYWcgPyBNb2R1bGVzLkJhZyA6IE1vZHVsZXMuTWFwXG5cdFx0XHR9XG5cdFx0fSxcblx0XHQoKSA9PiB7XG5cdFx0XHRpZiAoaXNFbXB0eShsaW5lcykpXG5cdFx0XHRcdHJldHVybiBNb2R1bGVzLkRvXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc3QgbCA9IGxhc3QobGluZXMpXG5cdFx0XHRcdGNvbnN0IGxhc3RTSyA9IGdldFNLKGwpXG5cdFx0XHRcdGlmIChsYXN0U0sgPT09IFNLLkRvKSB7XG5cdFx0XHRcdFx0dmVyaWZ5TGluZXMobGluZXMpXG5cdFx0XHRcdFx0cmV0dXJuIE1vZHVsZXMuRG9cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBuZXdMb2NhbHMgPSB2ZXJpZnlMaW5lcyhydGFpbChsaW5lcykpXG5cdFx0XHRcdFx0cGx1c0xvY2FscyhuZXdMb2NhbHMsICgpID0+IHtcblx0XHRcdFx0XHRcdGwudmVyaWZ5KGxhc3RTSylcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdHJldHVybiBNb2R1bGVzLlZhbFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSlcbn1cblxuZnVuY3Rpb24gdmVyaWZ5QnVpbHRMaW5lcyhsaW5lcywgbG9jKSB7XG5cdHZlcmlmeUFuZFBsdXNMb2NhbChMb2NhbERlY2xhcmUuYnVpbHQobG9jKSwgKCkgPT4geyB2ZXJpZnlMaW5lcyhsaW5lcykgfSlcbn1cbiJdfQ==
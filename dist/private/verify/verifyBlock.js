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
	exports.verifyDoBlock = verifyDoBlock;
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
		if (sk === _SK2.default.Do) verifyDoBlock(this);else {
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

	function verifyDoBlock(_) {
		_context2.results.blockToKind.set(_, _VerifyResults.Blocks.Do);

		return (0, _verifyLines2.default)(_.lines);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnlCbG9jay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBVXdCLFdBQVc7U0F5Qm5CLGFBQWEsR0FBYixhQUFhO1NBS2IsaUJBQWlCLEdBQWpCLGlCQUFpQjs7Ozs7Ozs7Ozs7Ozs7VUE5QlQsV0FBVzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBeUJuQixhQUFhOzs7Ozs7VUFLYixpQkFBaUIiLCJmaWxlIjoidmVyaWZ5QmxvY2suanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtPYmpFbnRyeSwgTG9jYWxEZWNsYXJlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7aWZFbHNlLCBpc0VtcHR5LCBsYXN0LCBydGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7QmxvY2tzLCBNb2R1bGVzfSBmcm9tICcuLi9WZXJpZnlSZXN1bHRzJ1xuaW1wb3J0IGF1dG9CbG9ja0tpbmQsIHtvcEJsb2NrQnVpbGRLaW5kfSBmcm9tICcuL2F1dG9CbG9ja0tpbmQnXG5pbXBvcnQge3Jlc3VsdHN9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB7cGx1c0xvY2FscywgdmVyaWZ5QW5kUGx1c0xvY2FsfSBmcm9tICcuL2xvY2FscydcbmltcG9ydCBTSywge2dldFNLfSBmcm9tICcuL1NLJ1xuaW1wb3J0IHZlcmlmeUxpbmVzIGZyb20gJy4vdmVyaWZ5TGluZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHZlcmlmeUJsb2NrKHNrKSB7XG5cdGlmIChzayA9PT0gU0suRG8pXG5cdFx0dmVyaWZ5RG9CbG9jayh0aGlzKVxuXHRlbHNlIHtcblx0XHRjaGVjayghaXNFbXB0eSh0aGlzLmxpbmVzKSwgJ1ZhbHVlIGJsb2NrIG11c3QgaGF2ZSBzb21lIGNvbnRlbnQuJylcblx0XHRjb25zdCBraW5kID0gYXV0b0Jsb2NrS2luZCh0aGlzLmxpbmVzLCB0aGlzLmxvYylcblx0XHRzd2l0Y2ggKGtpbmQpIHtcblx0XHRcdGNhc2UgQmxvY2tzLkJhZzogY2FzZSBCbG9ja3MuTWFwOiBjYXNlIEJsb2Nrcy5PYmo6XG5cdFx0XHRcdHZlcmlmeUJ1aWx0TGluZXModGhpcy5saW5lcywgdGhpcy5sb2MpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIEJsb2Nrcy5UaHJvdzpcblx0XHRcdFx0dmVyaWZ5TGluZXModGhpcy5saW5lcylcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQmxvY2tzLlJldHVybjpcblx0XHRcdFx0cGx1c0xvY2Fscyh2ZXJpZnlMaW5lcyhydGFpbCh0aGlzLmxpbmVzKSksICgpID0+IHtcblx0XHRcdFx0XHRsYXN0KHRoaXMubGluZXMpLnZlcmlmeShTSy5WYWwpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3Ioa2luZClcblx0XHR9XG5cdFx0cmVzdWx0cy5ibG9ja1RvS2luZC5zZXQodGhpcywga2luZClcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5RG9CbG9jayhfKSB7XG5cdHJlc3VsdHMuYmxvY2tUb0tpbmQuc2V0KF8sIEJsb2Nrcy5Ebylcblx0cmV0dXJuIHZlcmlmeUxpbmVzKF8ubGluZXMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlNb2R1bGVMaW5lcyhsaW5lcywgbG9jKSB7XG5cdHJlc3VsdHMubW9kdWxlS2luZCA9IGlmRWxzZShvcEJsb2NrQnVpbGRLaW5kKGxpbmVzLCBsb2MpLFxuXHRcdGJ1aWxkS2luZCA9PiB7XG5cdFx0XHRpZiAoYnVpbGRLaW5kID09PSBCbG9ja3MuT2JqKSB7XG5cdFx0XHRcdGZvciAoY29uc3QgbGluZSBvZiBsaW5lcylcblx0XHRcdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIE9iakVudHJ5KVxuXHRcdFx0XHRcdFx0cmVzdWx0cy5vYmpFbnRyeUV4cG9ydHMuYWRkKGxpbmUpXG5cdFx0XHRcdHZlcmlmeUxpbmVzKGxpbmVzKVxuXHRcdFx0XHRyZXR1cm4gTW9kdWxlcy5FeHBvcnRzXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2ZXJpZnlCdWlsdExpbmVzKGxpbmVzLCBsb2MpXG5cdFx0XHRcdHJldHVybiBidWlsZEtpbmQgPT09IEJsb2Nrcy5CYWcgPyBNb2R1bGVzLkJhZyA6IE1vZHVsZXMuTWFwXG5cdFx0XHR9XG5cdFx0fSxcblx0XHQoKSA9PiB7XG5cdFx0XHRpZiAoaXNFbXB0eShsaW5lcykpXG5cdFx0XHRcdHJldHVybiBNb2R1bGVzLkRvXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc3QgbCA9IGxhc3QobGluZXMpXG5cdFx0XHRcdGNvbnN0IGxhc3RTSyA9IGdldFNLKGwpXG5cdFx0XHRcdGlmIChsYXN0U0sgPT09IFNLLkRvKSB7XG5cdFx0XHRcdFx0dmVyaWZ5TGluZXMobGluZXMpXG5cdFx0XHRcdFx0cmV0dXJuIE1vZHVsZXMuRG9cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBuZXdMb2NhbHMgPSB2ZXJpZnlMaW5lcyhydGFpbChsaW5lcykpXG5cdFx0XHRcdFx0cGx1c0xvY2FscyhuZXdMb2NhbHMsICgpID0+IHtcblx0XHRcdFx0XHRcdGwudmVyaWZ5KGxhc3RTSylcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdHJldHVybiBNb2R1bGVzLlZhbFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSlcbn1cblxuZnVuY3Rpb24gdmVyaWZ5QnVpbHRMaW5lcyhsaW5lcywgbG9jKSB7XG5cdHZlcmlmeUFuZFBsdXNMb2NhbChMb2NhbERlY2xhcmUuYnVpbHQobG9jKSwgKCkgPT4ge1xuXHRcdHZlcmlmeUxpbmVzKGxpbmVzKVxuXHR9KVxufVxuIl19
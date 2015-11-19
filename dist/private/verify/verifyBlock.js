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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJ2ZXJpZnlCbG9jay5qcyIsInNvdXJjZXNDb250ZW50IjpbXX0=
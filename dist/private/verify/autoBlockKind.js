'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../util', '../VerifyResults'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../util'), require('../VerifyResults'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.util, global.VerifyResults);
		global.autoBlockKind = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _util, _VerifyResults) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = autoBlockKind;
	exports.opBlockBuildKind = opBlockBuildKind;

	function autoBlockKind(lines, loc) {
		return (0, _util.opOr)(opBlockBuildKind(lines, loc), () => !(0, _util.isEmpty)(lines) && (0, _util.last)(lines) instanceof _MsAst.Throw ? _VerifyResults.Blocks.Throw : _VerifyResults.Blocks.Return);
	}

	function opBlockBuildKind(lines, loc) {
		let isBag = false,
		    isMap = false,
		    isObj = false;

		for (const line of lines) {
			if (line instanceof _MsAst.BagEntry) isBag = true;else if (line instanceof _MsAst.MapEntry) isMap = true;else if (line instanceof _MsAst.ObjEntry) isObj = true;
		}

		(0, _context.check)(!(isBag && isMap) && !(isMap && isObj) && !(isBag && isObj), loc, 'Block has mixed bag/map/obj entries — can not infer type.');
		return isBag ? _VerifyResults.Blocks.Bag : isMap ? _VerifyResults.Blocks.Map : isObj ? _VerifyResults.Blocks.Obj : null;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJhdXRvQmxvY2tLaW5kLmpzIiwic291cmNlc0NvbnRlbnQiOltdfQ==
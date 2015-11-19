'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', './groupContext', './lexPlain', './sourceContext', './loadLex*'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('./groupContext'), require('./lexPlain'), require('./sourceContext'), require('./loadLex*'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.groupContext, global.lexPlain, global.sourceContext, global.loadLex);
		global.lex = mod.exports;
	}
})(this, function (exports, _Loc, _groupContext, _lexPlain, _sourceContext) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = lex;

	var _lexPlain2 = _interopRequireDefault(_lexPlain);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function lex(sourceString) {
		if (!sourceString.endsWith('\n')) sourceString = `${ sourceString }\n`;
		sourceString = `${ sourceString }\0`;
		(0, _groupContext.setupGroupContext)();
		(0, _sourceContext.setupSourceContext)(sourceString);
		(0, _groupContext.openLine)(_Loc.StartPos);
		(0, _lexPlain2.default)(false);
		const endPos = (0, _sourceContext.pos)();
		return (0, _groupContext.tearDownGroupContext)(endPos);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJsZXguanMiLCJzb3VyY2VzQ29udGVudCI6W119
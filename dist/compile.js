'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './CompileError', './private/context', './private/lex/lex', './private/parse/parse', './private/render', './private/transpile/transpile', './private/util', './private/verify/verify'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./CompileError'), require('./private/context'), require('./private/lex/lex'), require('./private/parse/parse'), require('./private/render'), require('./private/transpile/transpile'), require('./private/util'), require('./private/verify/verify'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.lex, global.parse, global.render, global.transpile, global.util, global.verify);
		global.compile = mod.exports;
	}
})(this, function (exports, _CompileError, _context, _lex, _parse, _render, _transpile, _util, _verify) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = compile;
	exports.parseAst = parseAst;

	var _CompileError2 = _interopRequireDefault(_CompileError);

	var _lex2 = _interopRequireDefault(_lex);

	var _parse2 = _interopRequireDefault(_parse);

	var _render2 = _interopRequireDefault(_render);

	var _transpile2 = _interopRequireDefault(_transpile);

	var _verify2 = _interopRequireDefault(_verify);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function compile(source) {
		let opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
		(0, _util.type)(source, String);
		(0, _context.setContext)(opts);

		try {
			const ast = (0, _parse2.default)((0, _lex2.default)(source));
			const esAst = (0, _transpile2.default)(ast, (0, _verify2.default)(ast));
			return {
				warnings: _context.warnings,
				result: (0, _render2.default)(esAst)
			};
		} catch (error) {
			if (!(error instanceof _CompileError2.default)) throw error;
			return {
				warnings: _context.warnings,
				result: error
			};
		} finally {
			(0, _context.unsetContext)();
		}
	}

	function parseAst(source) {
		let opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
		(0, _util.type)(source, String);
		(0, _context.setContext)(opts);

		try {
			const ast = (0, _parse2.default)((0, _lex2.default)(source));
			(0, _verify2.default)(ast);
			return {
				warnings: _context.warnings,
				result: ast
			};
		} catch (error) {
			if (!(error instanceof _CompileError2.default)) throw error;
			return {
				warnings: _context.warnings,
				result: error
			};
		} finally {
			(0, _context.unsetContext)();
		}
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJjb21waWxlLmpzIiwic291cmNlc0NvbnRlbnQiOltdfQ==
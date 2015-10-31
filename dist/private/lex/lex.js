'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', '../context', './groupContext', './lexPlain', './sourceContext', './loadLex*'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('../context'), require('./groupContext'), require('./lexPlain'), require('./sourceContext'), require('./loadLex*'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.context, global.groupContext, global.lexPlain, global.sourceContext, global.loadLex);
		global.lex = mod.exports;
	}
})(this, function (exports, _Loc, _context, _groupContext, _lexPlain, _sourceContext) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = lex;

	var _lexPlain2 = _interopRequireDefault(_lexPlain);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function lex(sourceString) {
		(0, _context.check)(sourceString.endsWith('\n'), () => lastCharPos(sourceString), 'Source code must end in newline.');
		sourceString = `${ sourceString }\0`;
		(0, _groupContext.setupGroupContext)();
		(0, _sourceContext.setupSourceContext)(sourceString);
		(0, _groupContext.openLine)(_Loc.StartPos);
		(0, _lexPlain2.default)(false);
		const endPos = (0, _sourceContext.pos)();
		return (0, _groupContext.tearDownGroupContext)(endPos);
	}

	function lastCharPos(str) {
		const splits = str.split('\n');
		return new _Loc.Pos(splits.length, splits[splits.length - 1].length);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQWlCd0IsR0FBRzs7Ozs7O1VBQUgsR0FBRyIsImZpbGUiOiJsZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vbG9hZExleConXG5pbXBvcnQge1BvcywgU3RhcnRQb3N9IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHtjaGVja30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7b3BlbkxpbmUsIHNldHVwR3JvdXBDb250ZXh0LCB0ZWFyRG93bkdyb3VwQ29udGV4dH0gZnJvbSAnLi9ncm91cENvbnRleHQnXG5pbXBvcnQgbGV4UGxhaW4gZnJvbSAnLi9sZXhQbGFpbidcbmltcG9ydCB7cG9zLCBzZXR1cFNvdXJjZUNvbnRleHR9IGZyb20gJy4vc291cmNlQ29udGV4dCdcblxuLyoqXG5MZXhlcyB0aGUgc291cmNlIGNvZGUgaW50byB7QGxpbmsgVG9rZW59cy5cblRoZSBNYXNvbiBsZXhlciBhbHNvIGdyb3VwcyB0b2tlbnMgYXMgcGFydCBvZiBsZXhpbmcuXG5UaGlzIG1ha2VzIHdyaXRpbmcgYSByZWN1cnNpdmUtZGVzY2VudCBwYXJzZXIgZWFzeS5cblNlZSB7QGxpbmsgR3JvdXB9LlxuXG5AcGFyYW0ge3N0cmluZ30gc291cmNlU3RyaW5nXG5AcmV0dXJuIHtHcm91cDxHcm91cHMuQmxvY2s+fVxuXHRCbG9jayB0b2tlbiByZXByZXNlbnRpbmcgdGhlIHdob2xlIG1vZHVsZS5cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBsZXgoc291cmNlU3RyaW5nKSB7XG5cdC8vIEFsZ29yaXRobSByZXF1aXJlcyB0cmFpbGluZyBuZXdsaW5lIHRvIGNsb3NlIGFueSBibG9ja3MuXG5cdGNoZWNrKHNvdXJjZVN0cmluZy5lbmRzV2l0aCgnXFxuJyksICgpID0+IGxhc3RDaGFyUG9zKHNvdXJjZVN0cmluZyksXG5cdFx0J1NvdXJjZSBjb2RlIG11c3QgZW5kIGluIG5ld2xpbmUuJylcblxuXHQvKlxuXHRVc2UgYSAwLXRlcm1pbmF0ZWQgc3RyaW5nIHNvIHRoYXQgd2UgY2FuIHVzZSBgMGAgYXMgYSBzd2l0Y2ggY2FzZSBpbiBsZXhQbGFpbi5cblx0VGhpcyBpcyBmYXN0ZXIgdGhhbiBjaGVja2luZyB3aGV0aGVyIGluZGV4ID09PSBsZW5ndGguXG5cdChJZiB3ZSBjaGVjayBwYXN0IHRoZSBlbmQgb2YgdGhlIHN0cmluZyB3ZSBnZXQgYE5hTmAsIHdoaWNoIGNhbid0IGJlIHN3aXRjaGVkIG9uLilcblx0Ki9cblx0c291cmNlU3RyaW5nID0gYCR7c291cmNlU3RyaW5nfVxcMGBcblxuXHRzZXR1cEdyb3VwQ29udGV4dCgpXG5cdHNldHVwU291cmNlQ29udGV4dChzb3VyY2VTdHJpbmcpXG5cblx0b3BlbkxpbmUoU3RhcnRQb3MpXG5cblx0bGV4UGxhaW4oZmFsc2UpXG5cblx0Y29uc3QgZW5kUG9zID0gcG9zKClcblx0cmV0dXJuIHRlYXJEb3duR3JvdXBDb250ZXh0KGVuZFBvcylcbn1cblxuZnVuY3Rpb24gbGFzdENoYXJQb3Moc3RyKSB7XG5cdGNvbnN0IHNwbGl0cyA9IHN0ci5zcGxpdCgnXFxuJylcblx0cmV0dXJuIG5ldyBQb3MoXG5cdFx0c3BsaXRzLmxlbmd0aCxcblx0XHRzcGxpdHNbc3BsaXRzLmxlbmd0aC0xXS5sZW5ndGgpXG59XG4iXX0=
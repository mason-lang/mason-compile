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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQWdCd0IsR0FBRzs7Ozs7Ozs7OztVQUFILEdBQUciLCJmaWxlIjoibGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuL2xvYWRMZXgqJ1xuaW1wb3J0IHtTdGFydFBvc30gZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQge29wZW5MaW5lLCBzZXR1cEdyb3VwQ29udGV4dCwgdGVhckRvd25Hcm91cENvbnRleHR9IGZyb20gJy4vZ3JvdXBDb250ZXh0J1xuaW1wb3J0IGxleFBsYWluIGZyb20gJy4vbGV4UGxhaW4nXG5pbXBvcnQge3Bvcywgc2V0dXBTb3VyY2VDb250ZXh0fSBmcm9tICcuL3NvdXJjZUNvbnRleHQnXG5cbi8qKlxuTGV4ZXMgdGhlIHNvdXJjZSBjb2RlIGludG8ge0BsaW5rIFRva2VufXMuXG5UaGUgTWFzb24gbGV4ZXIgYWxzbyBncm91cHMgdG9rZW5zIGFzIHBhcnQgb2YgbGV4aW5nLlxuVGhpcyBtYWtlcyB3cml0aW5nIGEgcmVjdXJzaXZlLWRlc2NlbnQgcGFyc2VyIGVhc3kuXG5TZWUge0BsaW5rIEdyb3VwfS5cblxuQHBhcmFtIHtzdHJpbmd9IHNvdXJjZVN0cmluZ1xuQHJldHVybiB7R3JvdXA8R3JvdXBzLkJsb2NrPn1cblx0QmxvY2sgdG9rZW4gcmVwcmVzZW50aW5nIHRoZSB3aG9sZSBtb2R1bGUuXG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbGV4KHNvdXJjZVN0cmluZykge1xuXHQvLyBBbGdvcml0aG0gcmVxdWlyZXMgdHJhaWxpbmcgbmV3bGluZSB0byBjbG9zZSBhbnkgYmxvY2tzLlxuXHRpZiAoIXNvdXJjZVN0cmluZy5lbmRzV2l0aCgnXFxuJykpXG5cdFx0c291cmNlU3RyaW5nID0gYCR7c291cmNlU3RyaW5nfVxcbmBcblxuXHQvKlxuXHRVc2UgYSAwLXRlcm1pbmF0ZWQgc3RyaW5nIHNvIHRoYXQgd2UgY2FuIHVzZSBgMGAgYXMgYSBzd2l0Y2ggY2FzZSBpbiBsZXhQbGFpbi5cblx0VGhpcyBpcyBmYXN0ZXIgdGhhbiBjaGVja2luZyB3aGV0aGVyIGluZGV4ID09PSBsZW5ndGguXG5cdChJZiB3ZSBjaGVjayBwYXN0IHRoZSBlbmQgb2YgdGhlIHN0cmluZyB3ZSBnZXQgYE5hTmAsIHdoaWNoIGNhbid0IGJlIHN3aXRjaGVkIG9uLilcblx0Ki9cblx0c291cmNlU3RyaW5nID0gYCR7c291cmNlU3RyaW5nfVxcMGBcblxuXHRzZXR1cEdyb3VwQ29udGV4dCgpXG5cdHNldHVwU291cmNlQ29udGV4dChzb3VyY2VTdHJpbmcpXG5cblx0b3BlbkxpbmUoU3RhcnRQb3MpXG5cblx0bGV4UGxhaW4oZmFsc2UpXG5cblx0Y29uc3QgZW5kUG9zID0gcG9zKClcblx0cmV0dXJuIHRlYXJEb3duR3JvdXBDb250ZXh0KGVuZFBvcylcbn1cbiJdfQ==
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

		for (const line of lines) if (line instanceof _MsAst.BagEntry) isBag = true;else if (line instanceof _MsAst.MapEntry) isMap = true;else if (line instanceof _MsAst.ObjEntry) isObj = true;

		(0, _context.check)(!(isBag && isMap) && !(isMap && isObj) && !(isBag && isObj), loc, 'cantInferBlockKind');
		return isBag ? _VerifyResults.Blocks.Bag : isMap ? _VerifyResults.Blocks.Map : isObj ? _VerifyResults.Blocks.Obj : null;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS9hdXRvQmxvY2tLaW5kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFLd0IsYUFBYTtTQUtyQixnQkFBZ0IsR0FBaEIsZ0JBQWdCOztVQUxSLGFBQWE7Ozs7VUFLckIsZ0JBQWdCIiwiZmlsZSI6ImF1dG9CbG9ja0tpbmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtCYWdFbnRyeSwgTWFwRW50cnksIE9iakVudHJ5LCBUaHJvd30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2lzRW1wdHksIGxhc3QsIG9wT3J9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0Jsb2Nrc30gZnJvbSAnLi4vVmVyaWZ5UmVzdWx0cydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXV0b0Jsb2NrS2luZChsaW5lcywgbG9jKSB7XG5cdHJldHVybiBvcE9yKG9wQmxvY2tCdWlsZEtpbmQobGluZXMsIGxvYyksICgpID0+XG5cdFx0IWlzRW1wdHkobGluZXMpICYmIGxhc3QobGluZXMpIGluc3RhbmNlb2YgVGhyb3cgPyBCbG9ja3MuVGhyb3cgOiBCbG9ja3MuUmV0dXJuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3BCbG9ja0J1aWxkS2luZChsaW5lcywgbG9jKSB7XG5cdGxldCBpc0JhZyA9IGZhbHNlLCBpc01hcCA9IGZhbHNlLCBpc09iaiA9IGZhbHNlXG5cdGZvciAoY29uc3QgbGluZSBvZiBsaW5lcylcblx0XHRpZiAobGluZSBpbnN0YW5jZW9mIEJhZ0VudHJ5KVxuXHRcdFx0aXNCYWcgPSB0cnVlXG5cdFx0ZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIE1hcEVudHJ5KVxuXHRcdFx0aXNNYXAgPSB0cnVlXG5cdFx0ZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIE9iakVudHJ5KVxuXHRcdFx0aXNPYmogPSB0cnVlXG5cblx0Y2hlY2soIShpc0JhZyAmJiBpc01hcCkgJiYgIShpc01hcCAmJiBpc09iaikgJiYgIShpc0JhZyAmJiBpc09iaiksIGxvYywgJ2NhbnRJbmZlckJsb2NrS2luZCcpXG5cblx0cmV0dXJuIGlzQmFnID8gQmxvY2tzLkJhZyA6IGlzTWFwID8gQmxvY2tzLk1hcCA6IGlzT2JqID8gQmxvY2tzLk9iaiA6IG51bGxcbn1cbiJdfQ==
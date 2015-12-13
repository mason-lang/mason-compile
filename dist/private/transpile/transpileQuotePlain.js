'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', '../util', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('../util'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.util);
		global.transpileQuotePlain = mod.exports;
	}
})(this, function (exports, _ast, _util, _util2) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	exports.default = function () {
		if ((0, _util.isEmpty)(this.parts)) return LitEmptyString;else {
			const quasis = [],
			      expressions = [];

			// TemplateLiteral must start with a TemplateElement
			if (typeof this.parts[0] !== 'string') quasis.push(_ast.TemplateElement.empty);

			for (const part of this.parts) if (typeof part === 'string') quasis.push(_ast.TemplateElement.forRawString(part));else {
				// "{1}{1}" needs an empty quasi in the middle (and on the ends).
				// There are never more than 2 string parts in a row,
				// so quasis.length === expressions.length or is exactly 1 more.
				if (quasis.length === expressions.length) quasis.push(_ast.TemplateElement.empty);
				expressions.push((0, _util2.t0)(part));
			}

			// TemplateLiteral must end with a TemplateElement, so one more quasi than expression.
			if (quasis.length === expressions.length) quasis.push(_ast.TemplateElement.empty);

			return new _ast.TemplateLiteral(quasis, expressions);
		}
	};

	const LitEmptyString = new _ast.Literal('');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGVRdW90ZVBsYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBSWUsWUFBVztBQUN6QixNQUFJLFVBSkcsT0FBTyxFQUlGLElBQUksQ0FBQyxLQUFLLENBQUMsRUFDdEIsT0FBTyxjQUFjLENBQUEsS0FDakI7QUFDSixTQUFNLE1BQU0sR0FBRyxFQUFFO1NBQUUsV0FBVyxHQUFHLEVBQUU7OztBQUFBLEFBR25DLE9BQUksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFDcEMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQVpFLGVBQWUsQ0FZRCxLQUFLLENBQUMsQ0FBQTs7QUFFbkMsUUFBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUM1QixJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFDM0IsTUFBTSxDQUFDLElBQUksQ0FBQyxLQWhCQyxlQUFlLENBZ0JBLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBLEtBQzNDOzs7O0FBSUosUUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFdBQVcsQ0FBQyxNQUFNLEVBQ3ZDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0F0QkEsZUFBZSxDQXNCQyxLQUFLLENBQUMsQ0FBQTtBQUNuQyxlQUFXLENBQUMsSUFBSSxDQUFDLFdBckJiLEVBQUUsRUFxQmMsSUFBSSxDQUFDLENBQUMsQ0FBQTtJQUMxQjs7O0FBQUEsQUFHRixPQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssV0FBVyxDQUFDLE1BQU0sRUFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQTVCRSxlQUFlLENBNEJELEtBQUssQ0FBQyxDQUFBOztBQUVuQyxVQUFPLFNBOUJ5QixlQUFlLENBOEJwQixNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUE7R0FDL0M7RUFDRCIsImZpbGUiOiJ0cmFuc3BpbGVRdW90ZVBsYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXRlcmFsLCBUZW1wbGF0ZUVsZW1lbnQsIFRlbXBsYXRlTGl0ZXJhbH0gZnJvbSAnZXNhc3QvZGlzdC9hc3QnXG5pbXBvcnQge2lzRW1wdHl9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge3QwfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuXHRpZiAoaXNFbXB0eSh0aGlzLnBhcnRzKSlcblx0XHRyZXR1cm4gTGl0RW1wdHlTdHJpbmdcblx0ZWxzZSB7XG5cdFx0Y29uc3QgcXVhc2lzID0gW10sIGV4cHJlc3Npb25zID0gW11cblxuXHRcdC8vIFRlbXBsYXRlTGl0ZXJhbCBtdXN0IHN0YXJ0IHdpdGggYSBUZW1wbGF0ZUVsZW1lbnRcblx0XHRpZiAodHlwZW9mIHRoaXMucGFydHNbMF0gIT09ICdzdHJpbmcnKVxuXHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmVtcHR5KVxuXG5cdFx0Zm9yIChjb25zdCBwYXJ0IG9mIHRoaXMucGFydHMpXG5cdFx0XHRpZiAodHlwZW9mIHBhcnQgPT09ICdzdHJpbmcnKVxuXHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZm9yUmF3U3RyaW5nKHBhcnQpKVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdC8vIFwiezF9ezF9XCIgbmVlZHMgYW4gZW1wdHkgcXVhc2kgaW4gdGhlIG1pZGRsZSAoYW5kIG9uIHRoZSBlbmRzKS5cblx0XHRcdFx0Ly8gVGhlcmUgYXJlIG5ldmVyIG1vcmUgdGhhbiAyIHN0cmluZyBwYXJ0cyBpbiBhIHJvdyxcblx0XHRcdFx0Ly8gc28gcXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoIG9yIGlzIGV4YWN0bHkgMSBtb3JlLlxuXHRcdFx0XHRpZiAocXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoKVxuXHRcdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5lbXB0eSlcblx0XHRcdFx0ZXhwcmVzc2lvbnMucHVzaCh0MChwYXJ0KSlcblx0XHRcdH1cblxuXHRcdC8vIFRlbXBsYXRlTGl0ZXJhbCBtdXN0IGVuZCB3aXRoIGEgVGVtcGxhdGVFbGVtZW50LCBzbyBvbmUgbW9yZSBxdWFzaSB0aGFuIGV4cHJlc3Npb24uXG5cdFx0aWYgKHF1YXNpcy5sZW5ndGggPT09IGV4cHJlc3Npb25zLmxlbmd0aClcblx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5lbXB0eSlcblxuXHRcdHJldHVybiBuZXcgVGVtcGxhdGVMaXRlcmFsKHF1YXNpcywgZXhwcmVzc2lvbnMpXG5cdH1cbn1cblxuY29uc3QgTGl0RW1wdHlTdHJpbmcgPSBuZXcgTGl0ZXJhbCgnJylcbiJdfQ==
(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/util'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports, require('esast/dist/ast'), require('esast/dist/util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util);
		global.msCall = mod.exports;
	}
})(this, function (exports, _esastDistAst, _esastDistUtil) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	const ms = name => {
		const m = (0, _esastDistUtil.member)(IdMs, name);
		// TODO:ES6 (...args) => new CallExpression(m, args)
		return function () {
			return new _esastDistAst.CallExpression(m, Array.prototype.slice.call(arguments));
		};
	};
	const IdMs = new _esastDistAst.Identifier('_ms'),
	      lazyWrap = value => msLazy(new _esastDistAst.ArrowFunctionExpression([], value)),
	      msAdd = ms('add'),
	      msAddMany = ms('addMany'),
	      msAssert = ms('assert'),
	      msAssertMember = ms('assertMember'),
	      msAssertNot = ms('assertNot'),
	      msAssertNotMember = ms('assertNotMember'),
	      msCheckContains = ms('checkContains'),
	      msError = ms('error'),
	      msGet = ms('get'),
	      msGetDefaultExport = ms('getDefaultExport'),
	      msExtract = ms('extract'),
	      msGetModule = ms('getModule'),
	      msLazy = ms('lazy'),
	      msLazyGet = ms('lazyProp'),
	      msLazyGetModule = ms('lazyGetModule'),
	      msNewMutableProperty = ms('newMutableProperty'),
	      msNewProperty = ms('newProperty'),
	      msSetLazy = ms('setLazy'),
	      msSetSub = ms('setSub'),
	      msSome = ms('some'),
	      msSymbol = ms('symbol'),
	      msUnlazy = ms('unlazy'),
	      MsNone = (0, _esastDistUtil.member)(IdMs, 'None');
	exports.IdMs = IdMs;
	exports.lazyWrap = lazyWrap;
	exports.msAdd = msAdd;
	exports.msAddMany = msAddMany;
	exports.msAssert = msAssert;
	exports.msAssertMember = msAssertMember;
	exports.msAssertNot = msAssertNot;
	exports.msAssertNotMember = msAssertNotMember;
	exports.msCheckContains = msCheckContains;
	exports.msError = msError;
	exports.msGet = msGet;
	exports.msGetDefaultExport = msGetDefaultExport;
	exports.msExtract = msExtract;
	exports.msGetModule = msGetModule;
	exports.msLazy = msLazy;
	exports.msLazyGet = msLazyGet;
	exports.msLazyGetModule = msLazyGetModule;
	exports.msNewMutableProperty = msNewMutableProperty;
	exports.msNewProperty = msNewProperty;
	exports.msSetLazy = msSetLazy;
	exports.msSetSub = msSetSub;
	exports.msSome = msSome;
	exports.msSymbol = msSymbol;
	exports.msUnlazy = msUnlazy;
	exports.MsNone = MsNone;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS9tcy1jYWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHQSxPQUFNLEVBQUUsR0FBRyxJQUFJLElBQUk7QUFDbEIsUUFBTSxDQUFDLEdBQUcsbUJBSEgsTUFBTSxFQUdJLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQTs7QUFFNUIsU0FBTyxZQUFXO0FBQUUsVUFBTyxrQkFOSyxjQUFjLENBTUEsQ0FBQyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO0dBQUUsQ0FBQTtFQUN6RixDQUFBO0FBQ00sT0FDTixJQUFJLEdBQUcsa0JBVHlDLFVBQVUsQ0FTcEMsS0FBSyxDQUFDO09BQzVCLFFBQVEsR0FBRyxLQUFLLElBQ2YsTUFBTSxDQUFDLGtCQVhELHVCQUF1QixDQVdNLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztPQUMvQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUNqQixTQUFTLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQztPQUN6QixRQUFRLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUN2QixjQUFjLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQztPQUNuQyxXQUFXLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQztPQUM3QixpQkFBaUIsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUM7T0FDekMsZUFBZSxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUM7T0FDckMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7T0FDckIsS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7T0FDakIsa0JBQWtCLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFDO09BQzNDLFNBQVMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQ3pCLFdBQVcsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDO09BQzdCLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ25CLFNBQVMsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDO09BQzFCLGVBQWUsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDO09BQ3JDLG9CQUFvQixHQUFHLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztPQUMvQyxhQUFhLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQztPQUNqQyxTQUFTLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQztPQUN6QixRQUFRLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUN2QixNQUFNLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztPQUNuQixRQUFRLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUN2QixRQUFRLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUN2QixNQUFNLEdBQUcsbUJBakNGLE1BQU0sRUFpQ0csSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFBIiwiZmlsZSI6Im1zLWNhbGwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Fycm93RnVuY3Rpb25FeHByZXNzaW9uLCBDYWxsRXhwcmVzc2lvbiwgSWRlbnRpZmllcn0gZnJvbSAnZXNhc3QvZGlzdC9hc3QnXG5pbXBvcnQge21lbWJlcn0gZnJvbSAnZXNhc3QvZGlzdC91dGlsJ1xuXG5jb25zdCBtcyA9IG5hbWUgPT4ge1xuXHRjb25zdCBtID0gbWVtYmVyKElkTXMsIG5hbWUpXG5cdC8vIFRPRE86RVM2ICguLi5hcmdzKSA9PiBuZXcgQ2FsbEV4cHJlc3Npb24obSwgYXJncylcblx0cmV0dXJuIGZ1bmN0aW9uKCkgeyByZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKG0sIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpIH1cbn1cbmV4cG9ydCBjb25zdFxuXHRJZE1zID0gbmV3IElkZW50aWZpZXIoJ19tcycpLFxuXHRsYXp5V3JhcCA9IHZhbHVlID0+XG5cdFx0bXNMYXp5KG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihbXSwgdmFsdWUpKSxcblx0bXNBZGQgPSBtcygnYWRkJyksXG5cdG1zQWRkTWFueSA9IG1zKCdhZGRNYW55JyksXG5cdG1zQXNzZXJ0ID0gbXMoJ2Fzc2VydCcpLFxuXHRtc0Fzc2VydE1lbWJlciA9IG1zKCdhc3NlcnRNZW1iZXInKSxcblx0bXNBc3NlcnROb3QgPSBtcygnYXNzZXJ0Tm90JyksXG5cdG1zQXNzZXJ0Tm90TWVtYmVyID0gbXMoJ2Fzc2VydE5vdE1lbWJlcicpLFxuXHRtc0NoZWNrQ29udGFpbnMgPSBtcygnY2hlY2tDb250YWlucycpLFxuXHRtc0Vycm9yID0gbXMoJ2Vycm9yJyksXG5cdG1zR2V0ID0gbXMoJ2dldCcpLFxuXHRtc0dldERlZmF1bHRFeHBvcnQgPSBtcygnZ2V0RGVmYXVsdEV4cG9ydCcpLFxuXHRtc0V4dHJhY3QgPSBtcygnZXh0cmFjdCcpLFxuXHRtc0dldE1vZHVsZSA9IG1zKCdnZXRNb2R1bGUnKSxcblx0bXNMYXp5ID0gbXMoJ2xhenknKSxcblx0bXNMYXp5R2V0ID0gbXMoJ2xhenlQcm9wJyksXG5cdG1zTGF6eUdldE1vZHVsZSA9IG1zKCdsYXp5R2V0TW9kdWxlJyksXG5cdG1zTmV3TXV0YWJsZVByb3BlcnR5ID0gbXMoJ25ld011dGFibGVQcm9wZXJ0eScpLFxuXHRtc05ld1Byb3BlcnR5ID0gbXMoJ25ld1Byb3BlcnR5JyksXG5cdG1zU2V0TGF6eSA9IG1zKCdzZXRMYXp5JyksXG5cdG1zU2V0U3ViID0gbXMoJ3NldFN1YicpLFxuXHRtc1NvbWUgPSBtcygnc29tZScpLFxuXHRtc1N5bWJvbCA9IG1zKCdzeW1ib2wnKSxcblx0bXNVbmxhenkgPSBtcygndW5sYXp5JyksXG5cdE1zTm9uZSA9IG1lbWJlcihJZE1zLCAnTm9uZScpXG4iXX0=
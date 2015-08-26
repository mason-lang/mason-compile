if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'esast/dist/ast', 'esast/dist/util'], function (exports, _esastDistAst, _esastDistUtil) {
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
	      lazyWrap = value => msLazy((0, _esastDistUtil.thunk)(value)),
	      msAdd = ms('add'),
	      msAddMany = ms('addMany'),
	      msAssert = ms('assert'),
	      msAssertNot = ms('assertNot'),
	      msAssoc = ms('assoc'),
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
	      msSet = ms('set'),
	      msSetName = ms('setName'),
	      msSetLazy = ms('setLazy'),
	      msSome = ms('some'),
	      msSymbol = ms('symbol'),
	      msUnlazy = ms('unlazy'),
	      MsNone = (0, _esastDistUtil.member)(IdMs, 'None');
	exports.IdMs = IdMs;
	exports.lazyWrap = lazyWrap;
	exports.msAdd = msAdd;
	exports.msAddMany = msAddMany;
	exports.msAssert = msAssert;
	exports.msAssertNot = msAssertNot;
	exports.msAssoc = msAssoc;
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
	exports.msSet = msSet;
	exports.msSetName = msSetName;
	exports.msSetLazy = msSetLazy;
	exports.msSome = msSome;
	exports.msSymbol = msSymbol;
	exports.msUnlazy = msUnlazy;
	exports.MsNone = MsNone;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaXZhdGUvdHJhbnNwaWxlL21zLWNhbGwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUdBLE9BQU0sRUFBRSxHQUFHLElBQUksSUFBSTtBQUNsQixRQUFNLENBQUMsR0FBRyxtQkFIRixNQUFNLEVBR0csSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBOztBQUU1QixTQUFPLFlBQVc7QUFBRSxVQUFPLGtCQU5uQixjQUFjLENBTXdCLENBQUMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtHQUFFLENBQUE7RUFDekYsQ0FBQTtBQUNNLE9BQ04sSUFBSSxHQUFHLGtCQVRpQixVQUFVLENBU1osS0FBSyxDQUFDO09BQzVCLFFBQVEsR0FBRyxLQUFLLElBQUksTUFBTSxDQUFDLG1CQVRYLEtBQUssRUFTWSxLQUFLLENBQUMsQ0FBQztPQUN4QyxLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUNqQixTQUFTLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQztPQUN6QixRQUFRLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUN2QixXQUFXLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQztPQUM3QixPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQztPQUNyQixlQUFlLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQztPQUNyQyxPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQztPQUNyQixLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUNqQixrQkFBa0IsR0FBRyxFQUFFLENBQUMsa0JBQWtCLENBQUM7T0FDM0MsU0FBUyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUM7T0FDekIsV0FBVyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUM7T0FDN0IsTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7T0FDbkIsU0FBUyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUM7T0FDMUIsZUFBZSxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUM7T0FDckMsb0JBQW9CLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixDQUFDO09BQy9DLGFBQWEsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDO09BQ2pDLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ2pCLFNBQVMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQ3pCLFNBQVMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQ3pCLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ25CLFFBQVEsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3ZCLFFBQVEsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3ZCLE1BQU0sR0FBRyxtQkFoQ0QsTUFBTSxFQWdDRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUEiLCJmaWxlIjoicHJpdmF0ZS90cmFuc3BpbGUvbXMtY2FsbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENhbGxFeHByZXNzaW9uLCBJZGVudGlmaWVyIH0gZnJvbSAnZXNhc3QvZGlzdC9hc3QnXG5pbXBvcnQgeyBtZW1iZXIsIHRodW5rIH0gZnJvbSAnZXNhc3QvZGlzdC91dGlsJ1xuXG5jb25zdCBtcyA9IG5hbWUgPT4ge1xuXHRjb25zdCBtID0gbWVtYmVyKElkTXMsIG5hbWUpXG5cdC8vIFRPRE86RVM2ICguLi5hcmdzKSA9PiBuZXcgQ2FsbEV4cHJlc3Npb24obSwgYXJncylcblx0cmV0dXJuIGZ1bmN0aW9uKCkgeyByZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKG0sIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpIH1cbn1cbmV4cG9ydCBjb25zdFxuXHRJZE1zID0gbmV3IElkZW50aWZpZXIoJ19tcycpLFxuXHRsYXp5V3JhcCA9IHZhbHVlID0+IG1zTGF6eSh0aHVuayh2YWx1ZSkpLFxuXHRtc0FkZCA9IG1zKCdhZGQnKSxcblx0bXNBZGRNYW55ID0gbXMoJ2FkZE1hbnknKSxcblx0bXNBc3NlcnQgPSBtcygnYXNzZXJ0JyksXG5cdG1zQXNzZXJ0Tm90ID0gbXMoJ2Fzc2VydE5vdCcpLFxuXHRtc0Fzc29jID0gbXMoJ2Fzc29jJyksXG5cdG1zQ2hlY2tDb250YWlucyA9IG1zKCdjaGVja0NvbnRhaW5zJyksXG5cdG1zRXJyb3IgPSBtcygnZXJyb3InKSxcblx0bXNHZXQgPSBtcygnZ2V0JyksXG5cdG1zR2V0RGVmYXVsdEV4cG9ydCA9IG1zKCdnZXREZWZhdWx0RXhwb3J0JyksXG5cdG1zRXh0cmFjdCA9IG1zKCdleHRyYWN0JyksXG5cdG1zR2V0TW9kdWxlID0gbXMoJ2dldE1vZHVsZScpLFxuXHRtc0xhenkgPSBtcygnbGF6eScpLFxuXHRtc0xhenlHZXQgPSBtcygnbGF6eVByb3AnKSxcblx0bXNMYXp5R2V0TW9kdWxlID0gbXMoJ2xhenlHZXRNb2R1bGUnKSxcblx0bXNOZXdNdXRhYmxlUHJvcGVydHkgPSBtcygnbmV3TXV0YWJsZVByb3BlcnR5JyksXG5cdG1zTmV3UHJvcGVydHkgPSBtcygnbmV3UHJvcGVydHknKSxcblx0bXNTZXQgPSBtcygnc2V0JyksXG5cdG1zU2V0TmFtZSA9IG1zKCdzZXROYW1lJyksXG5cdG1zU2V0TGF6eSA9IG1zKCdzZXRMYXp5JyksXG5cdG1zU29tZSA9IG1zKCdzb21lJyksXG5cdG1zU3ltYm9sID0gbXMoJ3N5bWJvbCcpLFxuXHRtc1VubGF6eSA9IG1zKCd1bmxhenknKSxcblx0TXNOb25lID0gbWVtYmVyKElkTXMsICdOb25lJylcbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9
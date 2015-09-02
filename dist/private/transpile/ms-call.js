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
	      msAssertMember = ms('assertMember'),
	      msAssertNot = ms('assertNot'),
	      msAssertNotMember = ms('assertNotMember'),
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
	exports.msAssertMember = msAssertMember;
	exports.msAssertNot = msAssertNot;
	exports.msAssertNotMember = msAssertNotMember;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1zLWNhbGwuanMiLCJwcml2YXRlL3RyYW5zcGlsZS9tcy1jYWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDR0EsT0FBTSxFQUFFLEdBQUcsSUFBSSxJQUFJO0FBQ2xCLFFBQU0sQ0FBQyxHQUFHLG1CQUhGLE1BQU0sRUFHRyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7O0FBRTVCLFNBQU8sWUFBVztBQUFFLFVBQU8sa0JBTm5CLGNBQWMsQ0FNd0IsQ0FBQyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO0dBQUUsQ0FBQTtFQUN6RixDQUFBO0FBQ00sT0FDTixJQUFJLEdBQUcsa0JBVGlCLFVBQVUsQ0FTWixLQUFLLENBQUM7T0FDNUIsUUFBUSxHQUFHLEtBQUssSUFBSSxNQUFNLENBQUMsbUJBVFgsS0FBSyxFQVNZLEtBQUssQ0FBQyxDQUFDO09BQ3hDLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ2pCLFNBQVMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQ3pCLFFBQVEsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3ZCLGNBQWMsR0FBRyxFQUFFLENBQUMsY0FBYyxDQUFDO09BQ25DLFdBQVcsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDO09BQzdCLGlCQUFpQixHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztPQUN6QyxPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQztPQUNyQixlQUFlLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQztPQUNyQyxPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQztPQUNyQixLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUNqQixrQkFBa0IsR0FBRyxFQUFFLENBQUMsa0JBQWtCLENBQUM7T0FDM0MsU0FBUyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUM7T0FDekIsV0FBVyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUM7T0FDN0IsTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7T0FDbkIsU0FBUyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUM7T0FDMUIsZUFBZSxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUM7T0FDckMsb0JBQW9CLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixDQUFDO09BQy9DLGFBQWEsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDO09BQ2pDLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ2pCLFNBQVMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQ3pCLFNBQVMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQ3pCLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ25CLFFBQVEsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3ZCLFFBQVEsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3ZCLE1BQU0sR0FBRyxtQkFsQ0QsTUFBTSxFQWtDRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUEiLCJmaWxlIjoicHJpdmF0ZS90cmFuc3BpbGUvbXMtY2FsbC5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHsgQ2FsbEV4cHJlc3Npb24sIElkZW50aWZpZXIgfSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7IG1lbWJlciwgdGh1bmsgfSBmcm9tICdlc2FzdC9kaXN0L3V0aWwnXG5cbmNvbnN0IG1zID0gbmFtZSA9PiB7XG5cdGNvbnN0IG0gPSBtZW1iZXIoSWRNcywgbmFtZSlcblx0Ly8gVE9ETzpFUzYgKC4uLmFyZ3MpID0+IG5ldyBDYWxsRXhwcmVzc2lvbihtLCBhcmdzKVxuXHRyZXR1cm4gZnVuY3Rpb24oKSB7IHJldHVybiBuZXcgQ2FsbEV4cHJlc3Npb24obSwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSkgfVxufVxuZXhwb3J0IGNvbnN0XG5cdElkTXMgPSBuZXcgSWRlbnRpZmllcignX21zJyksXG5cdGxhenlXcmFwID0gdmFsdWUgPT4gbXNMYXp5KHRodW5rKHZhbHVlKSksXG5cdG1zQWRkID0gbXMoJ2FkZCcpLFxuXHRtc0FkZE1hbnkgPSBtcygnYWRkTWFueScpLFxuXHRtc0Fzc2VydCA9IG1zKCdhc3NlcnQnKSxcblx0bXNBc3NlcnRNZW1iZXIgPSBtcygnYXNzZXJ0TWVtYmVyJyksXG5cdG1zQXNzZXJ0Tm90ID0gbXMoJ2Fzc2VydE5vdCcpLFxuXHRtc0Fzc2VydE5vdE1lbWJlciA9IG1zKCdhc3NlcnROb3RNZW1iZXInKSxcblx0bXNBc3NvYyA9IG1zKCdhc3NvYycpLFxuXHRtc0NoZWNrQ29udGFpbnMgPSBtcygnY2hlY2tDb250YWlucycpLFxuXHRtc0Vycm9yID0gbXMoJ2Vycm9yJyksXG5cdG1zR2V0ID0gbXMoJ2dldCcpLFxuXHRtc0dldERlZmF1bHRFeHBvcnQgPSBtcygnZ2V0RGVmYXVsdEV4cG9ydCcpLFxuXHRtc0V4dHJhY3QgPSBtcygnZXh0cmFjdCcpLFxuXHRtc0dldE1vZHVsZSA9IG1zKCdnZXRNb2R1bGUnKSxcblx0bXNMYXp5ID0gbXMoJ2xhenknKSxcblx0bXNMYXp5R2V0ID0gbXMoJ2xhenlQcm9wJyksXG5cdG1zTGF6eUdldE1vZHVsZSA9IG1zKCdsYXp5R2V0TW9kdWxlJyksXG5cdG1zTmV3TXV0YWJsZVByb3BlcnR5ID0gbXMoJ25ld011dGFibGVQcm9wZXJ0eScpLFxuXHRtc05ld1Byb3BlcnR5ID0gbXMoJ25ld1Byb3BlcnR5JyksXG5cdG1zU2V0ID0gbXMoJ3NldCcpLFxuXHRtc1NldE5hbWUgPSBtcygnc2V0TmFtZScpLFxuXHRtc1NldExhenkgPSBtcygnc2V0TGF6eScpLFxuXHRtc1NvbWUgPSBtcygnc29tZScpLFxuXHRtc1N5bWJvbCA9IG1zKCdzeW1ib2wnKSxcblx0bXNVbmxhenkgPSBtcygndW5sYXp5JyksXG5cdE1zTm9uZSA9IG1lbWJlcihJZE1zLCAnTm9uZScpXG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==
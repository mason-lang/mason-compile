if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'esast/dist/ast', 'esast/dist/util'], function (exports, _esastDistAst, _esastDistUtil) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	const ms = name => {
		const m = (0, _esastDistUtil.member)(IdMs, name);
		// TODO:ES6 (...args) => CallExpression(m, args)
		return function () {
			return (0, _esastDistAst.CallExpression)(m, Array.prototype.slice.call(arguments));
		};
	};
	const IdMs = (0, _esastDistAst.Identifier)('_ms'),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaXZhdGUvdHJhbnNwaWxlL21zLWNhbGwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUdBLE9BQU0sRUFBRSxHQUFHLElBQUksSUFBSTtBQUNsQixRQUFNLENBQUMsR0FBRyxtQkFIRixNQUFNLEVBR0csSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBOztBQUU1QixTQUFPLFlBQVc7QUFBRSxVQUFPLGtCQU5uQixjQUFjLEVBTW9CLENBQUMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtHQUFFLENBQUE7RUFDckYsQ0FBQTtBQUNNLE9BQ04sSUFBSSxHQUFHLGtCQVRpQixVQUFVLEVBU2hCLEtBQUssQ0FBQztPQUN4QixRQUFRLEdBQUcsS0FBSyxJQUFJLE1BQU0sQ0FBQyxtQkFUWCxLQUFLLEVBU1ksS0FBSyxDQUFDLENBQUM7T0FDeEMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7T0FDakIsU0FBUyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUM7T0FDekIsUUFBUSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUM7T0FDdkIsV0FBVyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUM7T0FDN0IsT0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7T0FDckIsZUFBZSxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUM7T0FDckMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7T0FDckIsS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7T0FDakIsa0JBQWtCLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFDO09BQzNDLFNBQVMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQ3pCLFdBQVcsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDO09BQzdCLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ25CLFNBQVMsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDO09BQzFCLGVBQWUsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDO09BQ3JDLG9CQUFvQixHQUFHLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztPQUMvQyxhQUFhLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQztPQUNqQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUNqQixTQUFTLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQztPQUN6QixTQUFTLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQztPQUN6QixNQUFNLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztPQUNuQixRQUFRLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUN2QixRQUFRLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUN2QixNQUFNLEdBQUcsbUJBaENELE1BQU0sRUFnQ0UsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFBIiwiZmlsZSI6InByaXZhdGUvdHJhbnNwaWxlL21zLWNhbGwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDYWxsRXhwcmVzc2lvbiwgSWRlbnRpZmllciB9IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IHsgbWVtYmVyLCB0aHVuayB9IGZyb20gJ2VzYXN0L2Rpc3QvdXRpbCdcblxuY29uc3QgbXMgPSBuYW1lID0+IHtcblx0Y29uc3QgbSA9IG1lbWJlcihJZE1zLCBuYW1lKVxuXHQvLyBUT0RPOkVTNiAoLi4uYXJncykgPT4gQ2FsbEV4cHJlc3Npb24obSwgYXJncylcblx0cmV0dXJuIGZ1bmN0aW9uKCkgeyByZXR1cm4gQ2FsbEV4cHJlc3Npb24obSwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSkgfVxufVxuZXhwb3J0IGNvbnN0XG5cdElkTXMgPSBJZGVudGlmaWVyKCdfbXMnKSxcblx0bGF6eVdyYXAgPSB2YWx1ZSA9PiBtc0xhenkodGh1bmsodmFsdWUpKSxcblx0bXNBZGQgPSBtcygnYWRkJyksXG5cdG1zQWRkTWFueSA9IG1zKCdhZGRNYW55JyksXG5cdG1zQXNzZXJ0ID0gbXMoJ2Fzc2VydCcpLFxuXHRtc0Fzc2VydE5vdCA9IG1zKCdhc3NlcnROb3QnKSxcblx0bXNBc3NvYyA9IG1zKCdhc3NvYycpLFxuXHRtc0NoZWNrQ29udGFpbnMgPSBtcygnY2hlY2tDb250YWlucycpLFxuXHRtc0Vycm9yID0gbXMoJ2Vycm9yJyksXG5cdG1zR2V0ID0gbXMoJ2dldCcpLFxuXHRtc0dldERlZmF1bHRFeHBvcnQgPSBtcygnZ2V0RGVmYXVsdEV4cG9ydCcpLFxuXHRtc0V4dHJhY3QgPSBtcygnZXh0cmFjdCcpLFxuXHRtc0dldE1vZHVsZSA9IG1zKCdnZXRNb2R1bGUnKSxcblx0bXNMYXp5ID0gbXMoJ2xhenknKSxcblx0bXNMYXp5R2V0ID0gbXMoJ2xhenlQcm9wJyksXG5cdG1zTGF6eUdldE1vZHVsZSA9IG1zKCdsYXp5R2V0TW9kdWxlJyksXG5cdG1zTmV3TXV0YWJsZVByb3BlcnR5ID0gbXMoJ25ld011dGFibGVQcm9wZXJ0eScpLFxuXHRtc05ld1Byb3BlcnR5ID0gbXMoJ25ld1Byb3BlcnR5JyksXG5cdG1zU2V0ID0gbXMoJ3NldCcpLFxuXHRtc1NldE5hbWUgPSBtcygnc2V0TmFtZScpLFxuXHRtc1NldExhenkgPSBtcygnc2V0TGF6eScpLFxuXHRtc1NvbWUgPSBtcygnc29tZScpLFxuXHRtc1N5bWJvbCA9IG1zKCdzeW1ib2wnKSxcblx0bXNVbmxhenkgPSBtcygndW5sYXp5JyksXG5cdE1zTm9uZSA9IG1lbWJlcihJZE1zLCAnTm9uZScpXG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==
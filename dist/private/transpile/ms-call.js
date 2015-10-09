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
	exports.msSetLazy = msSetLazy;
	exports.msSome = msSome;
	exports.msSymbol = msSymbol;
	exports.msUnlazy = msUnlazy;
	exports.MsNone = MsNone;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1zLWNhbGwuanMiLCJwcml2YXRlL3RyYW5zcGlsZS9tcy1jYWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDR0EsT0FBTSxFQUFFLEdBQUcsSUFBSSxJQUFJO0FBQ2xCLFFBQU0sQ0FBQyxHQUFHLG1CQUhILE1BQU0sRUFHSSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7O0FBRTVCLFNBQU8sWUFBVztBQUFFLFVBQU8sa0JBTnBCLGNBQWMsQ0FNeUIsQ0FBQyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO0dBQUUsQ0FBQTtFQUN6RixDQUFBO0FBQ00sT0FDTixJQUFJLEdBQUcsa0JBVGdCLFVBQVUsQ0FTWCxLQUFLLENBQUM7T0FDNUIsUUFBUSxHQUFHLEtBQUssSUFBSSxNQUFNLENBQUMsbUJBVFosS0FBSyxFQVNhLEtBQUssQ0FBQyxDQUFDO09BQ3hDLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ2pCLFNBQVMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQ3pCLFFBQVEsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3ZCLGNBQWMsR0FBRyxFQUFFLENBQUMsY0FBYyxDQUFDO09BQ25DLFdBQVcsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDO09BQzdCLGlCQUFpQixHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztPQUN6QyxPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQztPQUNyQixlQUFlLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQztPQUNyQyxPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQztPQUNyQixLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUNqQixrQkFBa0IsR0FBRyxFQUFFLENBQUMsa0JBQWtCLENBQUM7T0FDM0MsU0FBUyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUM7T0FDekIsV0FBVyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUM7T0FDN0IsTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7T0FDbkIsU0FBUyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUM7T0FDMUIsZUFBZSxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUM7T0FDckMsb0JBQW9CLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixDQUFDO09BQy9DLGFBQWEsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDO09BQ2pDLFNBQVMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQ3pCLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ25CLFFBQVEsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3ZCLFFBQVEsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3ZCLE1BQU0sR0FBRyxtQkFoQ0YsTUFBTSxFQWdDRyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUEiLCJmaWxlIjoicHJpdmF0ZS90cmFuc3BpbGUvbXMtY2FsbC5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHtDYWxsRXhwcmVzc2lvbiwgSWRlbnRpZmllcn0gZnJvbSAnZXNhc3QvZGlzdC9hc3QnXG5pbXBvcnQge21lbWJlciwgdGh1bmt9IGZyb20gJ2VzYXN0L2Rpc3QvdXRpbCdcblxuY29uc3QgbXMgPSBuYW1lID0+IHtcblx0Y29uc3QgbSA9IG1lbWJlcihJZE1zLCBuYW1lKVxuXHQvLyBUT0RPOkVTNiAoLi4uYXJncykgPT4gbmV3IENhbGxFeHByZXNzaW9uKG0sIGFyZ3MpXG5cdHJldHVybiBmdW5jdGlvbigpIHsgcmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbihtLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSB9XG59XG5leHBvcnQgY29uc3Rcblx0SWRNcyA9IG5ldyBJZGVudGlmaWVyKCdfbXMnKSxcblx0bGF6eVdyYXAgPSB2YWx1ZSA9PiBtc0xhenkodGh1bmsodmFsdWUpKSxcblx0bXNBZGQgPSBtcygnYWRkJyksXG5cdG1zQWRkTWFueSA9IG1zKCdhZGRNYW55JyksXG5cdG1zQXNzZXJ0ID0gbXMoJ2Fzc2VydCcpLFxuXHRtc0Fzc2VydE1lbWJlciA9IG1zKCdhc3NlcnRNZW1iZXInKSxcblx0bXNBc3NlcnROb3QgPSBtcygnYXNzZXJ0Tm90JyksXG5cdG1zQXNzZXJ0Tm90TWVtYmVyID0gbXMoJ2Fzc2VydE5vdE1lbWJlcicpLFxuXHRtc0Fzc29jID0gbXMoJ2Fzc29jJyksXG5cdG1zQ2hlY2tDb250YWlucyA9IG1zKCdjaGVja0NvbnRhaW5zJyksXG5cdG1zRXJyb3IgPSBtcygnZXJyb3InKSxcblx0bXNHZXQgPSBtcygnZ2V0JyksXG5cdG1zR2V0RGVmYXVsdEV4cG9ydCA9IG1zKCdnZXREZWZhdWx0RXhwb3J0JyksXG5cdG1zRXh0cmFjdCA9IG1zKCdleHRyYWN0JyksXG5cdG1zR2V0TW9kdWxlID0gbXMoJ2dldE1vZHVsZScpLFxuXHRtc0xhenkgPSBtcygnbGF6eScpLFxuXHRtc0xhenlHZXQgPSBtcygnbGF6eVByb3AnKSxcblx0bXNMYXp5R2V0TW9kdWxlID0gbXMoJ2xhenlHZXRNb2R1bGUnKSxcblx0bXNOZXdNdXRhYmxlUHJvcGVydHkgPSBtcygnbmV3TXV0YWJsZVByb3BlcnR5JyksXG5cdG1zTmV3UHJvcGVydHkgPSBtcygnbmV3UHJvcGVydHknKSxcblx0bXNTZXRMYXp5ID0gbXMoJ3NldExhenknKSxcblx0bXNTb21lID0gbXMoJ3NvbWUnKSxcblx0bXNTeW1ib2wgPSBtcygnc3ltYm9sJyksXG5cdG1zVW5sYXp5ID0gbXMoJ3VubGF6eScpLFxuXHRNc05vbmUgPSBtZW1iZXIoSWRNcywgJ05vbmUnKVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

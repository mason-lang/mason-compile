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

	function ms(name) {
		const m = (0, _esastDistUtil.member)(IdMs, name);
		// TODO:ES6 (...args) => new CallExpression(m, args)
		return function () {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			return new _esastDistAst.CallExpression(m, args);
		};
	}
	const IdMs = new _esastDistAst.Identifier('_ms'),
	      lazyWrap = value => msLazy(new _esastDistAst.ArrowFunctionExpression([], value)),
	      msAdd = ms('add'),
	      msAddMany = ms('addMany'),
	      msAssert = ms('assert'),
	      msAssertMember = ms('assertMember'),
	      msAssertNot = ms('assertNot'),
	      msAssertNotMember = ms('assertNotMember'),
	      msAsync = ms('async'),
	      msCheckContains = ms('checkContains'),
	      msError = ms('error'),
	      msGet = ms('get'),
	      msGetDefaultExport = ms('getDefaultExport'),
	      msExtract = ms('extract'),
	      msGetModule = ms('getModule'),
	      msLazy = ms('lazy'),
	      msLazyGet = ms('lazyProp'),
	      msLazyGetModule = ms('lazyGetModule'),
	      msMethodBound = ms('methodBound'),
	      msMethodUnbound = ms('methodUnbound'),
	      msNewMutableProperty = ms('newMutableProperty'),
	      msNewProperty = ms('newProperty'),
	      msRange = ms('range'),
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
	exports.msAsync = msAsync;
	exports.msCheckContains = msCheckContains;
	exports.msError = msError;
	exports.msGet = msGet;
	exports.msGetDefaultExport = msGetDefaultExport;
	exports.msExtract = msExtract;
	exports.msGetModule = msGetModule;
	exports.msLazy = msLazy;
	exports.msLazyGet = msLazyGet;
	exports.msLazyGetModule = msLazyGetModule;
	exports.msMethodBound = msMethodBound;
	exports.msMethodUnbound = msMethodUnbound;
	exports.msNewMutableProperty = msNewMutableProperty;
	exports.msNewProperty = msNewProperty;
	exports.msRange = msRange;
	exports.msSetLazy = msSetLazy;
	exports.msSetSub = msSetSub;
	exports.msSome = msSome;
	exports.msSymbol = msSymbol;
	exports.msUnlazy = msUnlazy;
	exports.MsNone = MsNone;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS9tcy1jYWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHQSxVQUFTLEVBQUUsQ0FBQyxJQUFJLEVBQUU7QUFDakIsUUFBTSxDQUFDLEdBQUcsbUJBSEgsTUFBTSxFQUdJLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQTs7QUFFNUIsU0FBTyxZQUFrQjtxQ0FBTixJQUFJO0FBQUosUUFBSTs7O0FBQUksVUFBTyxrQkFORixjQUFjLENBTU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO0dBQUUsQ0FBQTtFQUMvRDtBQUNNLE9BQ04sSUFBSSxHQUFHLGtCQVR5QyxVQUFVLENBU3BDLEtBQUssQ0FBQztPQUM1QixRQUFRLEdBQUcsS0FBSyxJQUNmLE1BQU0sQ0FBQyxrQkFYRCx1QkFBdUIsQ0FXTSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7T0FDL0MsS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7T0FDakIsU0FBUyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUM7T0FDekIsUUFBUSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUM7T0FDdkIsY0FBYyxHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUM7T0FDbkMsV0FBVyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUM7T0FDN0IsaUJBQWlCLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDO09BQ3pDLE9BQU8sR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO09BQ3JCLGVBQWUsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDO09BQ3JDLE9BQU8sR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO09BQ3JCLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ2pCLGtCQUFrQixHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQztPQUMzQyxTQUFTLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQztPQUN6QixXQUFXLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQztPQUM3QixNQUFNLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztPQUNuQixTQUFTLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQztPQUMxQixlQUFlLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQztPQUNyQyxhQUFhLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQztPQUNqQyxlQUFlLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQztPQUNyQyxvQkFBb0IsR0FBRyxFQUFFLENBQUMsb0JBQW9CLENBQUM7T0FDL0MsYUFBYSxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUM7T0FDakMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7T0FDckIsU0FBUyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUM7T0FDekIsUUFBUSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUM7T0FDdkIsTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7T0FDbkIsUUFBUSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUM7T0FDdkIsUUFBUSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUM7T0FDdkIsTUFBTSxHQUFHLG1CQXJDRixNQUFNLEVBcUNHLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQSIsImZpbGUiOiJtcy1jYWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbiwgQ2FsbEV4cHJlc3Npb24sIElkZW50aWZpZXJ9IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IHttZW1iZXJ9IGZyb20gJ2VzYXN0L2Rpc3QvdXRpbCdcblxuZnVuY3Rpb24gbXMobmFtZSkge1xuXHRjb25zdCBtID0gbWVtYmVyKElkTXMsIG5hbWUpXG5cdC8vIFRPRE86RVM2ICguLi5hcmdzKSA9PiBuZXcgQ2FsbEV4cHJlc3Npb24obSwgYXJncylcblx0cmV0dXJuIGZ1bmN0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbihtLCBhcmdzKSB9XG59XG5leHBvcnQgY29uc3Rcblx0SWRNcyA9IG5ldyBJZGVudGlmaWVyKCdfbXMnKSxcblx0bGF6eVdyYXAgPSB2YWx1ZSA9PlxuXHRcdG1zTGF6eShuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oW10sIHZhbHVlKSksXG5cdG1zQWRkID0gbXMoJ2FkZCcpLFxuXHRtc0FkZE1hbnkgPSBtcygnYWRkTWFueScpLFxuXHRtc0Fzc2VydCA9IG1zKCdhc3NlcnQnKSxcblx0bXNBc3NlcnRNZW1iZXIgPSBtcygnYXNzZXJ0TWVtYmVyJyksXG5cdG1zQXNzZXJ0Tm90ID0gbXMoJ2Fzc2VydE5vdCcpLFxuXHRtc0Fzc2VydE5vdE1lbWJlciA9IG1zKCdhc3NlcnROb3RNZW1iZXInKSxcblx0bXNBc3luYyA9IG1zKCdhc3luYycpLFxuXHRtc0NoZWNrQ29udGFpbnMgPSBtcygnY2hlY2tDb250YWlucycpLFxuXHRtc0Vycm9yID0gbXMoJ2Vycm9yJyksXG5cdG1zR2V0ID0gbXMoJ2dldCcpLFxuXHRtc0dldERlZmF1bHRFeHBvcnQgPSBtcygnZ2V0RGVmYXVsdEV4cG9ydCcpLFxuXHRtc0V4dHJhY3QgPSBtcygnZXh0cmFjdCcpLFxuXHRtc0dldE1vZHVsZSA9IG1zKCdnZXRNb2R1bGUnKSxcblx0bXNMYXp5ID0gbXMoJ2xhenknKSxcblx0bXNMYXp5R2V0ID0gbXMoJ2xhenlQcm9wJyksXG5cdG1zTGF6eUdldE1vZHVsZSA9IG1zKCdsYXp5R2V0TW9kdWxlJyksXG5cdG1zTWV0aG9kQm91bmQgPSBtcygnbWV0aG9kQm91bmQnKSxcblx0bXNNZXRob2RVbmJvdW5kID0gbXMoJ21ldGhvZFVuYm91bmQnKSxcblx0bXNOZXdNdXRhYmxlUHJvcGVydHkgPSBtcygnbmV3TXV0YWJsZVByb3BlcnR5JyksXG5cdG1zTmV3UHJvcGVydHkgPSBtcygnbmV3UHJvcGVydHknKSxcblx0bXNSYW5nZSA9IG1zKCdyYW5nZScpLFxuXHRtc1NldExhenkgPSBtcygnc2V0TGF6eScpLFxuXHRtc1NldFN1YiA9IG1zKCdzZXRTdWInKSxcblx0bXNTb21lID0gbXMoJ3NvbWUnKSxcblx0bXNTeW1ib2wgPSBtcygnc3ltYm9sJyksXG5cdG1zVW5sYXp5ID0gbXMoJ3VubGF6eScpLFxuXHRNc05vbmUgPSBtZW1iZXIoSWRNcywgJ05vbmUnKVxuIl19
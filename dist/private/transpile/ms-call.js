'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('esast/dist/util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util);
		global.msCall = mod.exports;
	}
})(this, function (exports, _ast, _util) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.MsNone = exports.msUnlazy = exports.msSymbol = exports.msSome = exports.msSetSub = exports.msSetLazy = exports.msRange = exports.msNewProperty = exports.msNewMutableProperty = exports.msMethodUnbound = exports.msMethodBound = exports.msLazyGetModule = exports.msLazyGet = exports.msLazy = exports.msGetModule = exports.msExtract = exports.msGetDefaultExport = exports.msGet = exports.msError = exports.msCheckContains = exports.msAsync = exports.msAssertNotMember = exports.msAssertNot = exports.msAssertMember = exports.msAssert = exports.msAddMany = exports.msAdd = exports.lazyWrap = exports.IdMs = undefined;

	function ms(name) {
		const m = (0, _util.member)(IdMs, name);
		return function () {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			return new _ast.CallExpression(m, args);
		};
	}

	const IdMs = exports.IdMs = new _ast.Identifier('_ms'),
	      lazyWrap = exports.lazyWrap = value => msLazy(new _ast.ArrowFunctionExpression([], value)),
	      msAdd = exports.msAdd = ms('add'),
	      msAddMany = exports.msAddMany = ms('addMany'),
	      msAssert = exports.msAssert = ms('assert'),
	      msAssertMember = exports.msAssertMember = ms('assertMember'),
	      msAssertNot = exports.msAssertNot = ms('assertNot'),
	      msAssertNotMember = exports.msAssertNotMember = ms('assertNotMember'),
	      msAsync = exports.msAsync = ms('async'),
	      msCheckContains = exports.msCheckContains = ms('checkContains'),
	      msError = exports.msError = ms('error'),
	      msGet = exports.msGet = ms('get'),
	      msGetDefaultExport = exports.msGetDefaultExport = ms('getDefaultExport'),
	      msExtract = exports.msExtract = ms('extract'),
	      msGetModule = exports.msGetModule = ms('getModule'),
	      msLazy = exports.msLazy = ms('lazy'),
	      msLazyGet = exports.msLazyGet = ms('lazyProp'),
	      msLazyGetModule = exports.msLazyGetModule = ms('lazyGetModule'),
	      msMethodBound = exports.msMethodBound = ms('methodBound'),
	      msMethodUnbound = exports.msMethodUnbound = ms('methodUnbound'),
	      msNewMutableProperty = exports.msNewMutableProperty = ms('newMutableProperty'),
	      msNewProperty = exports.msNewProperty = ms('newProperty'),
	      msRange = exports.msRange = ms('range'),
	      msSetLazy = exports.msSetLazy = ms('setLazy'),
	      msSetSub = exports.msSetSub = ms('setSub'),
	      msSome = exports.msSome = ms('some'),
	      msSymbol = exports.msSymbol = ms('symbol'),
	      msUnlazy = exports.msUnlazy = ms('unlazy'),
	      MsNone = exports.MsNone = (0, _util.member)(IdMs, 'None');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS9tcy1jYWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3FDQU1vQixJQUFJO0FBQUosUUFBSTs7Ozs7OztPQUd2QixJQUFJLFdBQUosSUFBSSxHQUFHLFNBVHlDLFVBQVUsQ0FTcEMsS0FBSyxDQUFDO09BQzVCLFFBQVEsV0FBUixRQUFRLEdBQUcsS0FBSyxJQUNmLE1BQU0sQ0FBQyxTQVhELHVCQUF1QixDQVdNLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztPQUMvQyxLQUFLLFdBQUwsS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7T0FDakIsU0FBUyxXQUFULFNBQVMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQ3pCLFFBQVEsV0FBUixRQUFRLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUN2QixjQUFjLFdBQWQsY0FBYyxHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUM7T0FDbkMsV0FBVyxXQUFYLFdBQVcsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDO09BQzdCLGlCQUFpQixXQUFqQixpQkFBaUIsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUM7T0FDekMsT0FBTyxXQUFQLE9BQU8sR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO09BQ3JCLGVBQWUsV0FBZixlQUFlLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQztPQUNyQyxPQUFPLFdBQVAsT0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7T0FDckIsS0FBSyxXQUFMLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ2pCLGtCQUFrQixXQUFsQixrQkFBa0IsR0FBRyxFQUFFLENBQUMsa0JBQWtCLENBQUM7T0FDM0MsU0FBUyxXQUFULFNBQVMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQ3pCLFdBQVcsV0FBWCxXQUFXLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQztPQUM3QixNQUFNLFdBQU4sTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7T0FDbkIsU0FBUyxXQUFULFNBQVMsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDO09BQzFCLGVBQWUsV0FBZixlQUFlLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQztPQUNyQyxhQUFhLFdBQWIsYUFBYSxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUM7T0FDakMsZUFBZSxXQUFmLGVBQWUsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDO09BQ3JDLG9CQUFvQixXQUFwQixvQkFBb0IsR0FBRyxFQUFFLENBQUMsb0JBQW9CLENBQUM7T0FDL0MsYUFBYSxXQUFiLGFBQWEsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDO09BQ2pDLE9BQU8sV0FBUCxPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQztPQUNyQixTQUFTLFdBQVQsU0FBUyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUM7T0FDekIsUUFBUSxXQUFSLFFBQVEsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3ZCLE1BQU0sV0FBTixNQUFNLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztPQUNuQixRQUFRLFdBQVIsUUFBUSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUM7T0FDdkIsUUFBUSxXQUFSLFFBQVEsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3ZCLE1BQU0sV0FBTixNQUFNLEdBQUcsa0JBQU8sSUFBSSxFQUFFLE1BQU0sQ0FBQyIsImZpbGUiOiJtcy1jYWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbiwgQ2FsbEV4cHJlc3Npb24sIElkZW50aWZpZXJ9IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IHttZW1iZXJ9IGZyb20gJ2VzYXN0L2Rpc3QvdXRpbCdcblxuZnVuY3Rpb24gbXMobmFtZSkge1xuXHRjb25zdCBtID0gbWVtYmVyKElkTXMsIG5hbWUpXG5cdC8vIFRPRE86RVM2ICguLi5hcmdzKSA9PiBuZXcgQ2FsbEV4cHJlc3Npb24obSwgYXJncylcblx0cmV0dXJuIGZ1bmN0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbihtLCBhcmdzKSB9XG59XG5leHBvcnQgY29uc3Rcblx0SWRNcyA9IG5ldyBJZGVudGlmaWVyKCdfbXMnKSxcblx0bGF6eVdyYXAgPSB2YWx1ZSA9PlxuXHRcdG1zTGF6eShuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oW10sIHZhbHVlKSksXG5cdG1zQWRkID0gbXMoJ2FkZCcpLFxuXHRtc0FkZE1hbnkgPSBtcygnYWRkTWFueScpLFxuXHRtc0Fzc2VydCA9IG1zKCdhc3NlcnQnKSxcblx0bXNBc3NlcnRNZW1iZXIgPSBtcygnYXNzZXJ0TWVtYmVyJyksXG5cdG1zQXNzZXJ0Tm90ID0gbXMoJ2Fzc2VydE5vdCcpLFxuXHRtc0Fzc2VydE5vdE1lbWJlciA9IG1zKCdhc3NlcnROb3RNZW1iZXInKSxcblx0bXNBc3luYyA9IG1zKCdhc3luYycpLFxuXHRtc0NoZWNrQ29udGFpbnMgPSBtcygnY2hlY2tDb250YWlucycpLFxuXHRtc0Vycm9yID0gbXMoJ2Vycm9yJyksXG5cdG1zR2V0ID0gbXMoJ2dldCcpLFxuXHRtc0dldERlZmF1bHRFeHBvcnQgPSBtcygnZ2V0RGVmYXVsdEV4cG9ydCcpLFxuXHRtc0V4dHJhY3QgPSBtcygnZXh0cmFjdCcpLFxuXHRtc0dldE1vZHVsZSA9IG1zKCdnZXRNb2R1bGUnKSxcblx0bXNMYXp5ID0gbXMoJ2xhenknKSxcblx0bXNMYXp5R2V0ID0gbXMoJ2xhenlQcm9wJyksXG5cdG1zTGF6eUdldE1vZHVsZSA9IG1zKCdsYXp5R2V0TW9kdWxlJyksXG5cdG1zTWV0aG9kQm91bmQgPSBtcygnbWV0aG9kQm91bmQnKSxcblx0bXNNZXRob2RVbmJvdW5kID0gbXMoJ21ldGhvZFVuYm91bmQnKSxcblx0bXNOZXdNdXRhYmxlUHJvcGVydHkgPSBtcygnbmV3TXV0YWJsZVByb3BlcnR5JyksXG5cdG1zTmV3UHJvcGVydHkgPSBtcygnbmV3UHJvcGVydHknKSxcblx0bXNSYW5nZSA9IG1zKCdyYW5nZScpLFxuXHRtc1NldExhenkgPSBtcygnc2V0TGF6eScpLFxuXHRtc1NldFN1YiA9IG1zKCdzZXRTdWInKSxcblx0bXNTb21lID0gbXMoJ3NvbWUnKSxcblx0bXNTeW1ib2wgPSBtcygnc3ltYm9sJyksXG5cdG1zVW5sYXp5ID0gbXMoJ3VubGF6eScpLFxuXHRNc05vbmUgPSBtZW1iZXIoSWRNcywgJ05vbmUnKVxuIl19
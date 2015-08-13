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
	      msArr = ms('arr'),
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
	exports.msArr = msArr;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaXZhdGUvdHJhbnNwaWxlL21zLWNhbGwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUdBLE9BQU0sRUFBRSxHQUFHLElBQUksSUFBSTtBQUNsQixRQUFNLENBQUMsR0FBRyxtQkFIRixNQUFNLEVBR0csSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBOztBQUU1QixTQUFPLFlBQVc7QUFBRSxVQUFPLGtCQU5uQixjQUFjLEVBTW9CLENBQUMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtHQUFFLENBQUE7RUFDckYsQ0FBQTtBQUNNLE9BQ04sSUFBSSxHQUFHLGtCQVRpQixVQUFVLEVBU2hCLEtBQUssQ0FBQztPQUN4QixRQUFRLEdBQUcsS0FBSyxJQUFJLE1BQU0sQ0FBQyxtQkFUWCxLQUFLLEVBU1ksS0FBSyxDQUFDLENBQUM7T0FDeEMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7T0FDakIsU0FBUyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUM7T0FDekIsS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7T0FDakIsUUFBUSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUM7T0FDdkIsV0FBVyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUM7T0FDN0IsT0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7T0FDckIsZUFBZSxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUM7T0FDckMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7T0FDckIsS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7T0FDakIsa0JBQWtCLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFDO09BQzNDLFNBQVMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQ3pCLFdBQVcsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDO09BQzdCLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ25CLFNBQVMsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDO09BQzFCLGVBQWUsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDO09BQ3JDLG9CQUFvQixHQUFHLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztPQUMvQyxhQUFhLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQztPQUNqQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUNqQixTQUFTLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQztPQUN6QixTQUFTLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQztPQUN6QixNQUFNLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztPQUNuQixRQUFRLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUN2QixRQUFRLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUN2QixNQUFNLEdBQUcsbUJBakNELE1BQU0sRUFpQ0UsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFBIiwiZmlsZSI6InByaXZhdGUvdHJhbnNwaWxlL21zLWNhbGwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDYWxsRXhwcmVzc2lvbiwgSWRlbnRpZmllciB9IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IHsgbWVtYmVyLCB0aHVuayB9IGZyb20gJ2VzYXN0L2Rpc3QvdXRpbCdcblxuY29uc3QgbXMgPSBuYW1lID0+IHtcblx0Y29uc3QgbSA9IG1lbWJlcihJZE1zLCBuYW1lKVxuXHQvLyBUT0RPOkVTNiAoLi4uYXJncykgPT4gQ2FsbEV4cHJlc3Npb24obSwgYXJncylcblx0cmV0dXJuIGZ1bmN0aW9uKCkgeyByZXR1cm4gQ2FsbEV4cHJlc3Npb24obSwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSkgfVxufVxuZXhwb3J0IGNvbnN0XG5cdElkTXMgPSBJZGVudGlmaWVyKCdfbXMnKSxcblx0bGF6eVdyYXAgPSB2YWx1ZSA9PiBtc0xhenkodGh1bmsodmFsdWUpKSxcblx0bXNBZGQgPSBtcygnYWRkJyksXG5cdG1zQWRkTWFueSA9IG1zKCdhZGRNYW55JyksXG5cdG1zQXJyID0gbXMoJ2FycicpLFxuXHRtc0Fzc2VydCA9IG1zKCdhc3NlcnQnKSxcblx0bXNBc3NlcnROb3QgPSBtcygnYXNzZXJ0Tm90JyksXG5cdG1zQXNzb2MgPSBtcygnYXNzb2MnKSxcblx0bXNDaGVja0NvbnRhaW5zID0gbXMoJ2NoZWNrQ29udGFpbnMnKSxcblx0bXNFcnJvciA9IG1zKCdlcnJvcicpLFxuXHRtc0dldCA9IG1zKCdnZXQnKSxcblx0bXNHZXREZWZhdWx0RXhwb3J0ID0gbXMoJ2dldERlZmF1bHRFeHBvcnQnKSxcblx0bXNFeHRyYWN0ID0gbXMoJ2V4dHJhY3QnKSxcblx0bXNHZXRNb2R1bGUgPSBtcygnZ2V0TW9kdWxlJyksXG5cdG1zTGF6eSA9IG1zKCdsYXp5JyksXG5cdG1zTGF6eUdldCA9IG1zKCdsYXp5UHJvcCcpLFxuXHRtc0xhenlHZXRNb2R1bGUgPSBtcygnbGF6eUdldE1vZHVsZScpLFxuXHRtc05ld011dGFibGVQcm9wZXJ0eSA9IG1zKCduZXdNdXRhYmxlUHJvcGVydHknKSxcblx0bXNOZXdQcm9wZXJ0eSA9IG1zKCduZXdQcm9wZXJ0eScpLFxuXHRtc1NldCA9IG1zKCdzZXQnKSxcblx0bXNTZXROYW1lID0gbXMoJ3NldE5hbWUnKSxcblx0bXNTZXRMYXp5ID0gbXMoJ3NldExhenknKSxcblx0bXNTb21lID0gbXMoJ3NvbWUnKSxcblx0bXNTeW1ib2wgPSBtcygnc3ltYm9sJyksXG5cdG1zVW5sYXp5ID0gbXMoJ3VubGF6eScpLFxuXHRNc05vbmUgPSBtZW1iZXIoSWRNcywgJ05vbmUnKVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
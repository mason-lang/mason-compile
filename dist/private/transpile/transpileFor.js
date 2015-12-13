'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', '../util', './ast-constants', './context', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('../util'), require('./ast-constants'), require('./context'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.astConstants, global.context, global.util);
		global.transpileFor = mod.exports;
	}
})(this, function (exports, _ast, _util, _astConstants, _context, _util2) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.transpileBreak = transpileBreak;
	exports.transpileFor = transpileFor;
	exports.transpileForAsync = transpileForAsync;
	exports.transpileForBag = transpileForBag;

	function transpileBreak() {
		return (0, _util.ifElse)(this.opValue, _ => new _ast.ReturnStatement((0, _util2.t0)(_)), () => new _ast.BreakStatement(_context.verifyResults.isBreakInSwitch(this) ? IdLoop : null));
	}

	function transpileFor() {
		const loop = forLoop(this.opIteratee, this.block);
		return _context.verifyResults.isStatement(this) ? maybeLabelLoop(this, loop) : (0, _util2.blockWrap)(new _ast.BlockStatement([loop]));
	}

	function transpileForAsync() {
		var _iteratee = this.iteratee;
		const element = _iteratee.element;
		const bag = _iteratee.bag;
		const func = new _ast.FunctionExpression(null, [(0, _util2.t0)(element)], (0, _util2.t0)(this.block), true);
		const call = (0, _util2.msCall)('$for', (0, _util2.t0)(bag), func);
		return _context.verifyResults.isStatement(this) ? new _ast.YieldExpression(call) : call;
	}

	function transpileForBag() {
		const loop = maybeLabelLoop(this, forLoop(this.opIteratee, this.block));
		return (0, _util2.blockWrap)(new _ast.BlockStatement([_astConstants.DeclareBuiltBag, loop, ReturnBuilt]));
	}

	function forLoop(opIteratee, block) {
		const jsBlock = (0, _util2.t0)(block);
		return (0, _util.ifElse)(opIteratee, _ref => {
			let element = _ref.element;
			let bag = _ref.bag;
			return new _ast.ForOfStatement(new _ast.VariableDeclaration('let', [new _ast.VariableDeclarator((0, _util2.t0)(element))]), (0, _util2.t0)(bag), jsBlock);
		}, () => new _ast.ForStatement(null, null, null, jsBlock));
	}

	function maybeLabelLoop(ast, loop) {
		return _context.verifyResults.loopNeedsLabel(ast) ? new _ast.LabeledStatement(IdLoop, loop) : loop;
	}

	const IdLoop = new _ast.Identifier('loop');
	const ReturnBuilt = new _ast.ReturnStatement(_astConstants.IdBuilt);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGVGb3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBUWdCLGNBQWMsR0FBZCxjQUFjO1NBTWQsWUFBWSxHQUFaLFlBQVk7U0FRWixpQkFBaUIsR0FBakIsaUJBQWlCO1NBT2pCLGVBQWUsR0FBZixlQUFlOztVQXJCZixjQUFjOzs7O1VBTWQsWUFBWTs7Ozs7VUFRWixpQkFBaUI7Ozs7Ozs7OztVQU9qQixlQUFlIiwiZmlsZSI6InRyYW5zcGlsZUZvci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QmxvY2tTdGF0ZW1lbnQsIEJyZWFrU3RhdGVtZW50LCBGb3JTdGF0ZW1lbnQsIEZvck9mU3RhdGVtZW50LCBGdW5jdGlvbkV4cHJlc3Npb24sXG5cdElkZW50aWZpZXIsIExhYmVsZWRTdGF0ZW1lbnQsIFJldHVyblN0YXRlbWVudCwgVmFyaWFibGVEZWNsYXJhdGlvbiwgVmFyaWFibGVEZWNsYXJhdG9yLFxuXHRZaWVsZEV4cHJlc3Npb259IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IHtpZkVsc2V9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0RlY2xhcmVCdWlsdEJhZywgSWRCdWlsdH0gZnJvbSAnLi9hc3QtY29uc3RhbnRzJ1xuaW1wb3J0IHt2ZXJpZnlSZXN1bHRzfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge2Jsb2NrV3JhcCwgbXNDYWxsLCB0MH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNwaWxlQnJlYWsoKSB7XG5cdHJldHVybiBpZkVsc2UodGhpcy5vcFZhbHVlLFxuXHRcdF8gPT4gbmV3IFJldHVyblN0YXRlbWVudCh0MChfKSksXG5cdFx0KCkgPT4gbmV3IEJyZWFrU3RhdGVtZW50KHZlcmlmeVJlc3VsdHMuaXNCcmVha0luU3dpdGNoKHRoaXMpID8gSWRMb29wIDogbnVsbCkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc3BpbGVGb3IoKSB7XG5cdGNvbnN0IGxvb3AgPSBmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jaylcblx0cmV0dXJuIHZlcmlmeVJlc3VsdHMuaXNTdGF0ZW1lbnQodGhpcykgP1xuXHRcdG1heWJlTGFiZWxMb29wKHRoaXMsIGxvb3ApIDpcblx0XHQvLyB1c2UgYHJldHVybmAgaW5zdGVhZCBvZiBgYnJlYWtgLCBzbyBubyBsYWJlbCBuZWVkZWRcblx0XHRibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFtsb29wXSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc3BpbGVGb3JBc3luYygpIHtcblx0Y29uc3Qge2VsZW1lbnQsIGJhZ30gPSB0aGlzLml0ZXJhdGVlXG5cdGNvbnN0IGZ1bmMgPSBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFt0MChlbGVtZW50KV0sIHQwKHRoaXMuYmxvY2spLCB0cnVlKVxuXHRjb25zdCBjYWxsID0gbXNDYWxsKCckZm9yJywgdDAoYmFnKSwgZnVuYylcblx0cmV0dXJuIHZlcmlmeVJlc3VsdHMuaXNTdGF0ZW1lbnQodGhpcykgPyBuZXcgWWllbGRFeHByZXNzaW9uKGNhbGwpIDogY2FsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNwaWxlRm9yQmFnKCkge1xuXHRjb25zdCBsb29wID0gbWF5YmVMYWJlbExvb3AodGhpcywgZm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spKVxuXHRyZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChbRGVjbGFyZUJ1aWx0QmFnLCBsb29wLCBSZXR1cm5CdWlsdF0pKVxufVxuXG5mdW5jdGlvbiBmb3JMb29wKG9wSXRlcmF0ZWUsIGJsb2NrKSB7XG5cdGNvbnN0IGpzQmxvY2sgPSB0MChibG9jaylcblx0cmV0dXJuIGlmRWxzZShvcEl0ZXJhdGVlLFxuXHRcdCh7ZWxlbWVudCwgYmFnfSkgPT5cblx0XHRcdG5ldyBGb3JPZlN0YXRlbWVudChcblx0XHRcdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2xldCcsIFtuZXcgVmFyaWFibGVEZWNsYXJhdG9yKHQwKGVsZW1lbnQpKV0pLFxuXHRcdFx0XHR0MChiYWcpLFxuXHRcdFx0XHRqc0Jsb2NrKSxcblx0XHQoKSA9PiBuZXcgRm9yU3RhdGVtZW50KG51bGwsIG51bGwsIG51bGwsIGpzQmxvY2spKVxufVxuXG5mdW5jdGlvbiBtYXliZUxhYmVsTG9vcChhc3QsIGxvb3ApIHtcblx0cmV0dXJuIHZlcmlmeVJlc3VsdHMubG9vcE5lZWRzTGFiZWwoYXN0KSA/IG5ldyBMYWJlbGVkU3RhdGVtZW50KElkTG9vcCwgbG9vcCkgOiBsb29wXG59XG5cbmNvbnN0IElkTG9vcCA9IG5ldyBJZGVudGlmaWVyKCdsb29wJylcbmNvbnN0IFJldHVybkJ1aWx0ID0gbmV3IFJldHVyblN0YXRlbWVudChJZEJ1aWx0KVxuIl19
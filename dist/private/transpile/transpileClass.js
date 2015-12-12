'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/util', '../util', './ast-constants', './context', './transpileMethod', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('esast/dist/util'), require('../util'), require('./ast-constants'), require('./context'), require('./transpileMethod'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.util, global.astConstants, global.context, global.transpileMethod, global.util);
		global.transpileClass = mod.exports;
	}
})(this, function (exports, _ast, _util, _util2, _astConstants, _context, _transpileMethod, _util3) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = transpileClass;
	exports.transpileConstructor = transpileConstructor;
	exports.constructorSetMembers = constructorSetMembers;

	function transpileClass() {
		const opName = (0, _util2.opMap)(_context.verifyResults.opName(this), _util.identifier);
		const methods = (0, _util2.cat)(this.statics.map(_ => (0, _transpileMethod.transpileMethodToDefinition)(_, true)), (0, _util2.ifElse)(this.opConstructor, _util3.t0, () => (0, _util2.opMap)(this.opFields, _ => defaultConstructor(_, this.opSuperClass !== null))), this.methods.map(_ => (0, _transpileMethod.transpileMethodToDefinition)(_, false)));
		const classExpr = new _ast.ClassExpression(opName, (0, _util2.opMap)(this.opSuperClass, _util3.t0), new _ast.ClassBody(methods));
		if (this.opDo === null && !this.isRecord && (0, _util2.isEmpty)(this.kinds)) return classExpr;else {
			const lead = (0, _util2.cat)((0, _util3.plainLet)(_astConstants.IdFocus, classExpr), (0, _util2.opMap)(this.opFields, beRecord), this.kinds.map(_ => (0, _util3.msCall)('kindDo', _astConstants.IdFocus, (0, _util3.t0)(_))));
			const block = (0, _util2.ifElse)(this.opDo, _ => (0, _util3.t3)(_.block, lead, null, _astConstants.ReturnFocus), () => new _ast.BlockStatement((0, _util2.cat)(lead, _astConstants.ReturnFocus)));
			return (0, _util3.blockWrap)(block);
		}
	}

	function transpileConstructor() {
		return _ast.MethodDefinition.constructor(_context.verifyResults.constructorHasSuper(this) ? (0, _util3.t2)(this.fun, _astConstants.LetLexicalThis, true) : (0, _util3.t1)(this.fun, constructorSetMembers(this)));
	}

	function constructorSetMembers(constructor) {
		return constructor.memberArgs.map(_ => (0, _util3.msCall)('newProperty', _astConstants.This, new _ast.Literal(_.name), (0, _util3.idForDeclareCached)(_)));
	}

	function beRecord(fields) {
		const fieldNames = new _ast.ArrayExpression(fields.map(_ => new _ast.Literal(_.name)));
		return (0, _util3.msCall)('beRecord', _astConstants.IdFocus, fieldNames);
	}

	function defaultConstructor(fields, classHasSuper) {
		const args = fields.map(_ => (0, _util.identifier)(_.name));
		const opSuper = (0, _util2.opIf)(classHasSuper, () => new _ast.CallExpression(_astConstants.IdSuper, []));
		const fieldSetters = fields.map((_, i) => new _ast.AssignmentExpression('=', (0, _util.member)(_astConstants.This, _.name), (0, _util3.maybeWrapInCheckInstance)(args[i], _.opType, _.name)));
		const body = new _ast.BlockStatement((0, _util2.cat)(opSuper, fieldSetters, FreezeThis));
		return _ast.MethodDefinition.constructor(new _ast.FunctionExpression(null, args, body));
	}

	const FreezeThis = new _ast.ExpressionStatement(new _ast.CallExpression(new _ast.MemberExpression(new _ast.Identifier('Object'), new _ast.Identifier('freeze')), [_astConstants.This]));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGVDbGFzcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBV3dCLGNBQWM7U0EyQnRCLG9CQUFvQixHQUFwQixvQkFBb0I7U0FTcEIscUJBQXFCLEdBQXJCLHFCQUFxQjs7VUFwQ2IsY0FBYzs7Ozs7Ozs7Ozs7VUEyQnRCLG9CQUFvQjs7OztVQVNwQixxQkFBcUIiLCJmaWxlIjoidHJhbnNwaWxlQ2xhc3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FycmF5RXhwcmVzc2lvbiwgQXNzaWdubWVudEV4cHJlc3Npb24sIEJsb2NrU3RhdGVtZW50LCBDYWxsRXhwcmVzc2lvbiwgQ2xhc3NCb2R5LFxuXHRDbGFzc0V4cHJlc3Npb24sIEV4cHJlc3Npb25TdGF0ZW1lbnQsIEZ1bmN0aW9uRXhwcmVzc2lvbiwgSWRlbnRpZmllciwgTGl0ZXJhbCwgTWVtYmVyRXhwcmVzc2lvbixcblx0TWV0aG9kRGVmaW5pdGlvbn0gZnJvbSAnZXNhc3QvZGlzdC9hc3QnXG5pbXBvcnQge2lkZW50aWZpZXIsIG1lbWJlcn0gZnJvbSAnZXNhc3QvZGlzdC91dGlsJ1xuaW1wb3J0IHtjYXQsIGlmRWxzZSwgaXNFbXB0eSwgb3BJZiwgb3BNYXB9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0lkRm9jdXMsIElkU3VwZXIsIExldExleGljYWxUaGlzLCBSZXR1cm5Gb2N1cywgVGhpc30gZnJvbSAnLi9hc3QtY29uc3RhbnRzJ1xuaW1wb3J0IHt2ZXJpZnlSZXN1bHRzfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge3RyYW5zcGlsZU1ldGhvZFRvRGVmaW5pdGlvbn0gZnJvbSAnLi90cmFuc3BpbGVNZXRob2QnXG5pbXBvcnQge2Jsb2NrV3JhcCwgaWRGb3JEZWNsYXJlQ2FjaGVkLCBtYXliZVdyYXBJbkNoZWNrSW5zdGFuY2UsIG1zQ2FsbCwgcGxhaW5MZXQsIHQwLCB0MSwgdDIsIHQzXG5cdH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFuc3BpbGVDbGFzcygpIHtcblx0Y29uc3Qgb3BOYW1lID0gb3BNYXAodmVyaWZ5UmVzdWx0cy5vcE5hbWUodGhpcyksIGlkZW50aWZpZXIpXG5cblx0Y29uc3QgbWV0aG9kcyA9IGNhdChcblx0XHR0aGlzLnN0YXRpY3MubWFwKF8gPT4gdHJhbnNwaWxlTWV0aG9kVG9EZWZpbml0aW9uKF8sIHRydWUpKSxcblx0XHRpZkVsc2UodGhpcy5vcENvbnN0cnVjdG9yLCB0MCxcblx0XHRcdCgpID0+IG9wTWFwKHRoaXMub3BGaWVsZHMsIF8gPT5cblx0XHRcdFx0ZGVmYXVsdENvbnN0cnVjdG9yKF8sIHRoaXMub3BTdXBlckNsYXNzICE9PSBudWxsKSkpLFxuXHRcdHRoaXMubWV0aG9kcy5tYXAoXyA9PiB0cmFuc3BpbGVNZXRob2RUb0RlZmluaXRpb24oXywgZmFsc2UpKSlcblxuXHRjb25zdCBjbGFzc0V4cHIgPSBuZXcgQ2xhc3NFeHByZXNzaW9uKG9wTmFtZSxcblx0XHRvcE1hcCh0aGlzLm9wU3VwZXJDbGFzcywgdDApLCBuZXcgQ2xhc3NCb2R5KG1ldGhvZHMpKVxuXG5cdGlmICh0aGlzLm9wRG8gPT09IG51bGwgJiYgIXRoaXMuaXNSZWNvcmQgJiYgaXNFbXB0eSh0aGlzLmtpbmRzKSlcblx0XHRyZXR1cm4gY2xhc3NFeHByXG5cdGVsc2Uge1xuXHRcdGNvbnN0IGxlYWQgPSBjYXQoXG5cdFx0XHRwbGFpbkxldChJZEZvY3VzLCBjbGFzc0V4cHIpLFxuXHRcdFx0b3BNYXAodGhpcy5vcEZpZWxkcywgYmVSZWNvcmQpLFxuXHRcdFx0dGhpcy5raW5kcy5tYXAoXyA9PiBtc0NhbGwoJ2tpbmREbycsIElkRm9jdXMsIHQwKF8pKSkpXG5cdFx0Y29uc3QgYmxvY2sgPSBpZkVsc2UodGhpcy5vcERvLFxuXHRcdFx0XyA9PiB0MyhfLmJsb2NrLCBsZWFkLCBudWxsLCBSZXR1cm5Gb2N1cyksXG5cdFx0XHQoKSA9PiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIFJldHVybkZvY3VzKSkpXG5cdFx0cmV0dXJuIGJsb2NrV3JhcChibG9jaylcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNwaWxlQ29uc3RydWN0b3IoKSB7XG5cdC8vIElmIHRoZXJlIGlzIGEgYHN1cGVyYCwgYHRoaXNgIHdpbGwgbm90IGJlIGRlZmluZWQgdW50aWwgdGhlbixcblx0Ly8gc28gbXVzdCB3YWl0IHVudGlsIHRoZW4uXG5cdC8vIE90aGVyd2lzZSwgZG8gaXQgYXQgdGhlIGJlZ2lubmluZy5cblx0cmV0dXJuIE1ldGhvZERlZmluaXRpb24uY29uc3RydWN0b3IodmVyaWZ5UmVzdWx0cy5jb25zdHJ1Y3Rvckhhc1N1cGVyKHRoaXMpID9cblx0XHR0Mih0aGlzLmZ1biwgTGV0TGV4aWNhbFRoaXMsIHRydWUpIDpcblx0XHR0MSh0aGlzLmZ1biwgY29uc3RydWN0b3JTZXRNZW1iZXJzKHRoaXMpKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN0cnVjdG9yU2V0TWVtYmVycyhjb25zdHJ1Y3Rvcikge1xuXHRyZXR1cm4gY29uc3RydWN0b3IubWVtYmVyQXJncy5tYXAoXyA9PlxuXHRcdG1zQ2FsbCgnbmV3UHJvcGVydHknLCBUaGlzLCBuZXcgTGl0ZXJhbChfLm5hbWUpLCBpZEZvckRlY2xhcmVDYWNoZWQoXykpKVxufVxuXG5mdW5jdGlvbiBiZVJlY29yZChmaWVsZHMpIHtcblx0Y29uc3QgZmllbGROYW1lcyA9IG5ldyBBcnJheUV4cHJlc3Npb24oZmllbGRzLm1hcChfID0+IG5ldyBMaXRlcmFsKF8ubmFtZSkpKVxuXHRyZXR1cm4gbXNDYWxsKCdiZVJlY29yZCcsIElkRm9jdXMsIGZpZWxkTmFtZXMpXG59XG5cbi8qXG5lLmcuIGZvciBgY2xhc3MgeDpOdW0geTpOdW1gOlxuY29uc3RydWN0b3IoeCwgeSkge1xuXHR0aGlzLnggPSBfbXMuY2hlY2tJbnN0YW5jZShOdW0sIHgpXG5cdHRoaXMueSA9IF9tcy5jaGVja0luc3RhbmNlKE51bSwgeSlcblx0T2JqZWN0LmZyZWV6ZSh0aGlzKVxufVxuKi9cbmZ1bmN0aW9uIGRlZmF1bHRDb25zdHJ1Y3RvcihmaWVsZHMsIGNsYXNzSGFzU3VwZXIpIHtcblx0Y29uc3QgYXJncyA9IGZpZWxkcy5tYXAoXyA9PiBpZGVudGlmaWVyKF8ubmFtZSkpXG5cdGNvbnN0IG9wU3VwZXIgPSBvcElmKGNsYXNzSGFzU3VwZXIsICgpID0+XG5cdFx0bmV3IENhbGxFeHByZXNzaW9uKElkU3VwZXIsIFtdKSlcblx0Y29uc3QgZmllbGRTZXR0ZXJzID0gZmllbGRzLm1hcCgoXywgaSkgPT5cblx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oXG5cdFx0XHQnPScsXG5cdFx0XHRtZW1iZXIoVGhpcywgXy5uYW1lKSxcblx0XHRcdG1heWJlV3JhcEluQ2hlY2tJbnN0YW5jZShhcmdzW2ldLCBfLm9wVHlwZSwgXy5uYW1lKSkpXG5cdGNvbnN0IGJvZHkgPSBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KG9wU3VwZXIsIGZpZWxkU2V0dGVycywgRnJlZXplVGhpcykpXG5cdHJldHVybiBNZXRob2REZWZpbml0aW9uLmNvbnN0cnVjdG9yKG5ldyBGdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgYXJncywgYm9keSkpXG59XG5jb25zdCBGcmVlemVUaGlzID0gbmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQoXG5cdG5ldyBDYWxsRXhwcmVzc2lvbihcblx0XHRuZXcgTWVtYmVyRXhwcmVzc2lvbihuZXcgSWRlbnRpZmllcignT2JqZWN0JyksIG5ldyBJZGVudGlmaWVyKCdmcmVlemUnKSksXG5cdFx0W1RoaXNdKSlcbiJdfQ==
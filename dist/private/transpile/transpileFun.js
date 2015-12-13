'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/util', '../context', '../MsAst', '../util', './ast-constants', './context', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('esast/dist/util'), require('../context'), require('../MsAst'), require('../util'), require('./ast-constants'), require('./context'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.context, global.MsAst, global.util, global.astConstants, global.context, global.util);
		global.transpileFun = mod.exports;
	}
})(this, function (exports, _ast, _util, _context, _MsAst, _util2, _astConstants, _context2, _util3) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	exports.default = function () {
		let leadStatements = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
		let dontDeclareThis = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

		return (0, _context2.withFunKind)(this.kind, () => {
			// TODO:ES6 use `...`f
			const nArgs = new _ast.Literal(this.args.length);
			const opDeclareRest = (0, _util2.opMap)(this.opRestArg, rest => (0, _util3.declare)(rest, new _ast.CallExpression(ArraySliceCall, [IdArguments, nArgs])));
			const argChecks = (0, _util2.opIf)(_context.options.includeChecks(), () => (0, _util2.flatOpMap)(this.args, _util3.opTypeCheckForLocalDeclare));

			const opDeclareThis = (0, _util2.opIf)(this.opDeclareThis !== null && !dontDeclareThis, () => _astConstants.DeclareLexicalThis);

			const lead = (0, _util2.cat)(opDeclareRest, opDeclareThis, argChecks, leadStatements);

			const body = () => (0, _util3.t2)(this.block, lead, this.opReturnType);
			const args = this.args.map(_util3.t0);
			const id = (0, _util2.opMap)(_context2.verifyResults.opName(this), _util.identifier);

			switch (this.kind) {
				case _MsAst.Funs.Plain:
					// TODO:ES6 Should be able to use rest args in arrow function
					return id === null && this.opDeclareThis === null && opDeclareRest === null ? new _ast.ArrowFunctionExpression(args, body()) : new _ast.FunctionExpression(id, args, body());
				case _MsAst.Funs.Async:
					{
						const plainBody = (0, _util3.t2)(this.block, null, this.opReturnType);
						const genFunc = new _ast.FunctionExpression(null, [], plainBody, true);
						const ret = new _ast.ReturnStatement((0, _util3.msCall)('async', genFunc));
						return new _ast.FunctionExpression(id, args, new _ast.BlockStatement((0, _util2.cat)(lead, ret)));
					}
				case _MsAst.Funs.Generator:
					return new _ast.FunctionExpression(id, args, body(), true);
				default:
					throw new Error(this.kind);
			}
		});
	};

	const ArraySliceCall = (0, _util.member)((0, _util.member)(new _ast.ArrayExpression([]), 'slice'), 'call');
	const IdArguments = new _ast.Identifier('arguments');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGVGdW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFlZSxZQUF5RDtNQUFoRCxjQUFjLHlEQUFHLElBQUk7TUFBRSxlQUFlLHlEQUFHLEtBQUs7O0FBQ3JFLFNBQU8sY0FUZSxXQUFXLEVBU2QsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNOztBQUVuQyxTQUFNLEtBQUssR0FBRyxTQWpCaUIsT0FBTyxDQWlCWixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzNDLFNBQU0sYUFBYSxHQUFHLFdBZE0sS0FBSyxFQWNMLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxJQUMvQyxXQVpLLE9BQU8sRUFZSixJQUFJLEVBQUUsU0FwQmlELGNBQWMsQ0FvQjVDLGNBQWMsRUFBRSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN6RSxTQUFNLFNBQVMsR0FBRyxXQWhCSSxJQUFJLEVBZ0JILFNBbEJqQixPQUFPLENBa0JrQixhQUFhLEVBQUUsRUFBRSxNQUMvQyxXQWpCVSxTQUFTLEVBaUJULElBQUksQ0FBQyxJQUFJLFNBZEcsMEJBQTBCLENBY0EsQ0FBQyxDQUFBOztBQUVsRCxTQUFNLGFBQWEsR0FBRyxXQW5CQSxJQUFJLEVBbUJDLElBQUksQ0FBQyxhQUFhLEtBQUssSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLG9CQWxCdEUsa0JBQWtCLEFBbUJMLENBQUMsQ0FBQTs7QUFFcEIsU0FBTSxJQUFJLEdBQUcsV0F0QlAsR0FBRyxFQXNCUSxhQUFhLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxjQUFjLENBQUMsQ0FBQTs7QUFFekUsU0FBTSxJQUFJLEdBQUcsTUFBTSxXQXJCb0MsRUFBRSxFQXFCbkMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQzFELFNBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxRQXRCeUIsRUFBRSxDQXNCdkIsQ0FBQTtBQUM5QixTQUFNLEVBQUUsR0FBRyxXQTFCaUIsS0FBSyxFQTBCaEIsVUF4QlgsYUFBYSxDQXdCWSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBN0JyQyxVQUFVLENBNkJ3QyxDQUFBOztBQUV4RCxXQUFRLElBQUksQ0FBQyxJQUFJO0FBQ2hCLFNBQUssT0E5QkEsSUFBSSxDQThCQyxLQUFLOztBQUVkLFlBQU8sRUFBRSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsYUFBYSxLQUFLLElBQUksSUFBSSxhQUFhLEtBQUssSUFBSSxHQUMxRSxTQXJDb0IsdUJBQXVCLENBcUNmLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUN6QyxTQXJDSixrQkFBa0IsQ0FxQ1MsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQUEsQUFDMUMsU0FBSyxPQW5DQSxJQUFJLENBbUNDLEtBQUs7QUFBRTtBQUNoQixZQUFNLFNBQVMsR0FBRyxXQWhDbUMsRUFBRSxFQWdDbEMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQ3pELFlBQU0sT0FBTyxHQUFHLFNBeENuQixrQkFBa0IsQ0F3Q3dCLElBQUksRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQ2pFLFlBQU0sR0FBRyxHQUFHLFNBekMwQixlQUFlLENBeUNyQixXQWxDbkIsTUFBTSxFQWtDb0IsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUE7QUFDekQsYUFBTyxTQTFDVixrQkFBa0IsQ0EwQ2UsRUFBRSxFQUFFLElBQUksRUFBRSxTQTNDTSxjQUFjLENBMkNELFdBdEN2RCxHQUFHLEVBc0N3RCxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO01BQzNFO0FBQUEsQUFDRCxTQUFLLE9BekNBLElBQUksQ0F5Q0MsU0FBUztBQUNsQixZQUFPLFNBN0NWLGtCQUFrQixDQTZDZSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQUEsQUFDdEQ7QUFDQyxXQUFNLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUFBLElBQzNCO0dBQ0QsQ0FBQyxDQUFBO0VBQ0YiLCJmaWxlIjoidHJhbnNwaWxlRnVuLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcnJheUV4cHJlc3Npb24sIEFycm93RnVuY3Rpb25FeHByZXNzaW9uLCBCbG9ja1N0YXRlbWVudCwgQ2FsbEV4cHJlc3Npb24sXG5cdEZ1bmN0aW9uRXhwcmVzc2lvbiwgSWRlbnRpZmllciwgTGl0ZXJhbCwgUmV0dXJuU3RhdGVtZW50fSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7aWRlbnRpZmllciwgbWVtYmVyfSBmcm9tICdlc2FzdC9kaXN0L3V0aWwnXG5pbXBvcnQge29wdGlvbnN9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0Z1bnN9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtjYXQsIGZsYXRPcE1hcCwgb3BJZiwgb3BNYXB9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0RlY2xhcmVMZXhpY2FsVGhpc30gZnJvbSAnLi9hc3QtY29uc3RhbnRzJ1xuaW1wb3J0IHt2ZXJpZnlSZXN1bHRzLCB3aXRoRnVuS2luZH0gZnJvbSAnLi9jb250ZXh0J1xuaW1wb3J0IHtkZWNsYXJlLCBtc0NhbGwsIG9wVHlwZUNoZWNrRm9yTG9jYWxEZWNsYXJlLCB0MCwgdDJ9IGZyb20gJy4vdXRpbCdcblxuLypcbmxlYWRTdGF0ZW1lbnRzIGNvbWVzIGZyb20gY29uc3RydWN0b3IgbWVtYmVyc1xuZG9udERlY2xhcmVUaGlzOiBhcHBsaWVzIGlmIHRoaXMgaXMgdGhlIGZ1biBmb3IgYSBDb25zdHJ1Y3RvcixcbndoaWNoIG1heSBkZWNsYXJlIGB0aGlzYCBhdCBhIGBzdXBlcmAgY2FsbC5cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihsZWFkU3RhdGVtZW50cyA9IG51bGwsIGRvbnREZWNsYXJlVGhpcyA9IGZhbHNlKSB7XG5cdHJldHVybiB3aXRoRnVuS2luZCh0aGlzLmtpbmQsICgpID0+IHtcblx0XHQvLyBUT0RPOkVTNiB1c2UgYC4uLmBmXG5cdFx0Y29uc3QgbkFyZ3MgPSBuZXcgTGl0ZXJhbCh0aGlzLmFyZ3MubGVuZ3RoKVxuXHRcdGNvbnN0IG9wRGVjbGFyZVJlc3QgPSBvcE1hcCh0aGlzLm9wUmVzdEFyZywgcmVzdCA9PlxuXHRcdFx0ZGVjbGFyZShyZXN0LCBuZXcgQ2FsbEV4cHJlc3Npb24oQXJyYXlTbGljZUNhbGwsIFtJZEFyZ3VtZW50cywgbkFyZ3NdKSkpXG5cdFx0Y29uc3QgYXJnQ2hlY2tzID0gb3BJZihvcHRpb25zLmluY2x1ZGVDaGVja3MoKSwgKCkgPT5cblx0XHRcdGZsYXRPcE1hcCh0aGlzLmFyZ3MsIG9wVHlwZUNoZWNrRm9yTG9jYWxEZWNsYXJlKSlcblxuXHRcdGNvbnN0IG9wRGVjbGFyZVRoaXMgPSBvcElmKHRoaXMub3BEZWNsYXJlVGhpcyAhPT0gbnVsbCAmJiAhZG9udERlY2xhcmVUaGlzLCAoKSA9PlxuXHRcdFx0RGVjbGFyZUxleGljYWxUaGlzKVxuXG5cdFx0Y29uc3QgbGVhZCA9IGNhdChvcERlY2xhcmVSZXN0LCBvcERlY2xhcmVUaGlzLCBhcmdDaGVja3MsIGxlYWRTdGF0ZW1lbnRzKVxuXG5cdFx0Y29uc3QgYm9keSA9ICgpID0+IHQyKHRoaXMuYmxvY2ssIGxlYWQsIHRoaXMub3BSZXR1cm5UeXBlKVxuXHRcdGNvbnN0IGFyZ3MgPSB0aGlzLmFyZ3MubWFwKHQwKVxuXHRcdGNvbnN0IGlkID0gb3BNYXAodmVyaWZ5UmVzdWx0cy5vcE5hbWUodGhpcyksIGlkZW50aWZpZXIpXG5cblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBGdW5zLlBsYWluOlxuXHRcdFx0XHQvLyBUT0RPOkVTNiBTaG91bGQgYmUgYWJsZSB0byB1c2UgcmVzdCBhcmdzIGluIGFycm93IGZ1bmN0aW9uXG5cdFx0XHRcdHJldHVybiBpZCA9PT0gbnVsbCAmJiB0aGlzLm9wRGVjbGFyZVRoaXMgPT09IG51bGwgJiYgb3BEZWNsYXJlUmVzdCA9PT0gbnVsbCA/XG5cdFx0XHRcdFx0bmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKGFyZ3MsIGJvZHkoKSkgOlxuXHRcdFx0XHRcdG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIGFyZ3MsIGJvZHkoKSlcblx0XHRcdGNhc2UgRnVucy5Bc3luYzoge1xuXHRcdFx0XHRjb25zdCBwbGFpbkJvZHkgPSB0Mih0aGlzLmJsb2NrLCBudWxsLCB0aGlzLm9wUmV0dXJuVHlwZSlcblx0XHRcdFx0Y29uc3QgZ2VuRnVuYyA9IG5ldyBGdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgW10sIHBsYWluQm9keSwgdHJ1ZSlcblx0XHRcdFx0Y29uc3QgcmV0ID0gbmV3IFJldHVyblN0YXRlbWVudChtc0NhbGwoJ2FzeW5jJywgZ2VuRnVuYykpXG5cdFx0XHRcdHJldHVybiBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKGlkLCBhcmdzLCBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHJldCkpKVxuXHRcdFx0fVxuXHRcdFx0Y2FzZSBGdW5zLkdlbmVyYXRvcjpcblx0XHRcdFx0cmV0dXJuIG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIGFyZ3MsIGJvZHkoKSwgdHJ1ZSlcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcih0aGlzLmtpbmQpXG5cdFx0fVxuXHR9KVxufVxuXG5jb25zdCBBcnJheVNsaWNlQ2FsbCA9IG1lbWJlcihtZW1iZXIobmV3IEFycmF5RXhwcmVzc2lvbihbXSksICdzbGljZScpLCAnY2FsbCcpXG5jb25zdCBJZEFyZ3VtZW50cyA9IG5ldyBJZGVudGlmaWVyKCdhcmd1bWVudHMnKVxuIl19
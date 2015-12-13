'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/util', '../MsAst', '../util', './ast-constants', './context', './transpileAssert', './transpileBlock', './transpileCase', './transpileClass', './transpileExcept', './transpileFor', './transpileFun', './transpileModule', './transpileQuotePlain', './transpileSpecial', './transpileSwitch', './transpileTrait', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('esast/dist/util'), require('../MsAst'), require('../util'), require('./ast-constants'), require('./context'), require('./transpileAssert'), require('./transpileBlock'), require('./transpileCase'), require('./transpileClass'), require('./transpileExcept'), require('./transpileFor'), require('./transpileFun'), require('./transpileModule'), require('./transpileQuotePlain'), require('./transpileSpecial'), require('./transpileSwitch'), require('./transpileTrait'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.MsAst, global.util, global.astConstants, global.context, global.transpileAssert, global.transpileBlock, global.transpileCase, global.transpileClass, global.transpileExcept, global.transpileFor, global.transpileFun, global.transpileModule, global.transpileQuotePlain, global.transpileSpecial, global.transpileSwitch, global.transpileTrait, global.util);
		global.transpile = mod.exports;
	}
})(this, function (exports, _ast, _util, _MsAst, _util2, _astConstants, _context, _transpileAssert, _transpileBlock, _transpileCase, _transpileClass, _transpileExcept, _transpileFor, _transpileFun, _transpileModule, _transpileQuotePlain, _transpileSpecial, _transpileSwitch, _transpileTrait, _util3) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = transpile;

	var MsAstTypes = _interopRequireWildcard(_MsAst);

	var _transpileAssert2 = _interopRequireDefault(_transpileAssert);

	var _transpileBlock2 = _interopRequireDefault(_transpileBlock);

	var _transpileCase2 = _interopRequireDefault(_transpileCase);

	var _transpileClass2 = _interopRequireDefault(_transpileClass);

	var _transpileExcept2 = _interopRequireDefault(_transpileExcept);

	var _transpileFun2 = _interopRequireDefault(_transpileFun);

	var _transpileModule2 = _interopRequireDefault(_transpileModule);

	var _transpileQuotePlain2 = _interopRequireDefault(_transpileQuotePlain);

	var _transpileSwitch2 = _interopRequireDefault(_transpileSwitch);

	var _transpileTrait2 = _interopRequireDefault(_transpileTrait);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function _interopRequireWildcard(obj) {
		if (obj && obj.__esModule) {
			return obj;
		} else {
			var newObj = {};

			if (obj != null) {
				for (var key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
				}
			}

			newObj.default = obj;
			return newObj;
		}
	}

	var _slicedToArray = (function () {
		function sliceIterator(arr, i) {
			var _arr = [];
			var _n = true;
			var _d = false;
			var _e = undefined;

			try {
				for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
					_arr.push(_s.value);

					if (i && _arr.length === i) break;
				}
			} catch (err) {
				_d = true;
				_e = err;
			} finally {
				try {
					if (!_n && _i["return"]) _i["return"]();
				} finally {
					if (_d) throw _e;
				}
			}

			return _arr;
		}

		return function (arr, i) {
			if (Array.isArray(arr)) {
				return arr;
			} else if (Symbol.iterator in Object(arr)) {
				return sliceIterator(arr, i);
			} else {
				throw new TypeError("Invalid attempt to destructure non-iterable instance");
			}
		};
	})();

	function transpile(moduleExpression, verifyResults) {
		(0, _context.setup)(verifyResults);
		const res = (0, _util3.t0)(moduleExpression);
		(0, _context.tearDown)();
		return res;
	}

	(0, _util2.implementMany)(MsAstTypes, 'transpile', {
		Assert: _transpileAssert2.default,

		AssignSingle(valWrap) {
			const val = valWrap === undefined ? (0, _util3.t0)(this.value) : valWrap((0, _util3.t0)(this.value));
			return new _ast.VariableDeclaration('let', [(0, _util3.makeDeclarator)(this.assignee, val, false)]);
		},

		AssignDestructure() {
			return new _ast.VariableDeclaration('let', (0, _util3.makeDestructureDeclarators)(this.assignees, this.kind() === _MsAst.LocalDeclares.Lazy, (0, _util3.t0)(this.value), false));
		},

		Await() {
			return new _ast.YieldExpression((0, _util3.t0)(this.value), false);
		},

		BagEntry() {
			return (0, _util3.msCall)(this.isMany ? 'addMany' : 'add', _astConstants.IdBuilt, (0, _util3.t0)(this.value));
		},

		BagSimple() {
			return new _ast.ArrayExpression(this.parts.map(_util3.t0));
		},

		Block: _transpileBlock2.default,

		BlockWrap() {
			return (0, _util3.blockWrap)((0, _util3.t0)(this.block));
		},

		Break: _transpileFor.transpileBreak,

		Call() {
			return new _ast.CallExpression((0, _util3.t0)(this.called), this.args.map(_util3.t0));
		},

		Case: _transpileCase2.default,
		CasePart: _transpileCase.transpileCasePart,
		Catch: _transpileExcept.transpileCatch,
		Class: _transpileClass2.default,

		Cond() {
			return new _ast.ConditionalExpression((0, _util3.t0)(this.test), (0, _util3.t0)(this.ifTrue), (0, _util3.t0)(this.ifFalse));
		},

		Conditional() {
			const test = (0, _util3.t0)(this.test);
			if (_context.verifyResults.isStatement(this)) return new _ast.IfStatement(this.isUnless ? new _ast.UnaryExpression('!', test) : test, (0, _util3.t0)(this.result));else {
				const result = (0, _util3.msCall)('some', (0, _util3.blockWrapIfBlock)(this.result));
				const none = (0, _util3.msMember)('None');

				var _ref = this.isUnless ? [none, result] : [result, none];

				var _ref2 = _slicedToArray(_ref, 2);

				const then = _ref2[0];
				const _else = _ref2[1];
				return new _ast.ConditionalExpression(test, then, _else);
			}
		},

		Constructor: _transpileClass.transpileConstructor,

		Del() {
			return (0, _util3.msCall)('del', (0, _util3.t0)(this.subbed), ...this.args.map(_util3.t0));
		},

		Except: _transpileExcept2.default,
		For: _transpileFor.transpileFor,
		ForAsync: _transpileFor.transpileForAsync,
		ForBag: _transpileFor.transpileForBag,
		Fun: _transpileFun2.default,

		GetterFun() {
			return (0, _util3.focusFun)((0, _util3.memberStringOrVal)(_astConstants.IdFocus, this.name));
		},

		Ignore() {
			return [];
		},

		InstanceOf() {
			return (0, _util3.msCall)('hasInstance', (0, _util3.t0)(this.type), (0, _util3.t0)(this.instance));
		},

		Lazy() {
			return (0, _util3.lazyWrap)((0, _util3.t0)(this.value));
		},

		NumberLiteral() {
			const value = Number(this.value);
			const lit = new _ast.Literal(Math.abs(value));
			const isPositive = value >= 0 && 1 / value !== -Infinity;
			return isPositive ? lit : new _ast.UnaryExpression('-', lit);
		},

		LocalAccess() {
			if (this.name === 'this') return _astConstants.IdLexicalThis;else {
				const ld = _context.verifyResults.localDeclareForAccess(this);

				return ld === undefined ? (0, _util.identifier)(this.name) : (0, _util3.accessLocalDeclare)(ld);
			}
		},

		LocalDeclare() {
			return new _ast.Identifier((0, _util3.idForDeclareCached)(this).name);
		},

		LocalMutate() {
			return new _ast.AssignmentExpression('=', (0, _util.identifier)(this.name), (0, _util3.t0)(this.value));
		},

		Logic() {
			const op = this.kind === _MsAst.Logics.And ? '&&' : '||';
			return (0, _util2.tail)(this.args).reduce((a, b) => new _ast.LogicalExpression(op, a, (0, _util3.t0)(b)), (0, _util3.t0)(this.args[0]));
		},

		MapEntry() {
			return (0, _util3.msCall)('setSub', _astConstants.IdBuilt, (0, _util3.t0)(this.key), (0, _util3.t0)(this.val));
		},

		Member() {
			return (0, _util3.memberStringOrVal)((0, _util3.t0)(this.object), this.name);
		},

		MemberFun() {
			const name = (0, _util3.transpileName)(this.name);
			return (0, _util2.ifElse)(this.opObject, _ => (0, _util3.msCall)('methodBound', (0, _util3.t0)(_), name), () => (0, _util3.msCall)('methodUnbound', name));
		},

		MemberSet() {
			const obj = (0, _util3.t0)(this.object);
			const val = (0, _util3.maybeWrapInCheckInstance)((0, _util3.t0)(this.value), this.opType, this.name);

			switch (this.kind) {
				case _MsAst.Setters.Init:
					return (0, _util3.msCall)('newProperty', obj, (0, _util3.transpileName)(this.name), val);

				case _MsAst.Setters.Mutate:
					return new _ast.AssignmentExpression('=', (0, _util3.memberStringOrVal)(obj, this.name), val);

				default:
					throw new Error();
			}
		},

		Method() {
			const name = new _ast.Literal(_context.verifyResults.name(this));
			const args = this.fun.opRestArg === null ? new _ast.ArrayExpression(this.fun.args.map(arg => {
				const name = new _ast.Literal(arg.name);
				const opType = (0, _util2.opMap)(arg.opType, _util3.t0);
				return (0, _util2.ifElse)(opType, _ => new _ast.ArrayExpression([name, _]), () => name);
			})) : new _ast.UnaryExpression('void', new _ast.Literal(0));
			const impl = this.fun instanceof _MsAst.Fun ? [(0, _util3.t0)(this.fun)] : [];
			return (0, _util3.msCall)('method', name, args, ...impl);
		},

		Module: _transpileModule2.default,

		MsRegExp() {
			return this.parts.length === 0 ? new _ast.Literal(new RegExp('', this.flags)) : this.parts.length === 1 && typeof this.parts[0] === 'string' ? new _ast.Literal(new RegExp(this.parts[0].replace('\n', '\\n'), this.flags)) : (0, _util3.msCall)('regexp', new _ast.ArrayExpression(this.parts.map(_util3.transpileName)), new _ast.Literal(this.flags));
		},

		New() {
			return new _ast.NewExpression((0, _util3.t0)(this.type), this.args.map(_util3.t0));
		},

		Not() {
			return new _ast.UnaryExpression('!', (0, _util3.t0)(this.arg));
		},

		ObjEntryAssign() {
			if (this.assign instanceof _MsAst.AssignSingle && !this.assign.assignee.isLazy()) {
				const name = this.assign.assignee.name;
				return (0, _util3.t1)(this.assign, val => _context.verifyResults.isObjEntryExport(this) ? (0, _transpileModule.exportNamedOrDefault)(val, name) : new _ast.AssignmentExpression('=', (0, _util.member)(_astConstants.IdBuilt, name), val));
			} else {
				const assigns = this.assign.allAssignees().map(_ => (0, _util3.msCall)('setLazy', _astConstants.IdBuilt, new _ast.Literal(_.name), (0, _util3.idForDeclareCached)(_)));
				return (0, _util2.cat)((0, _util3.t0)(this.assign), assigns);
			}
		},

		ObjEntryPlain() {
			const val = (0, _util3.t0)(this.value);
			return _context.verifyResults.isObjEntryExport(this) ? (0, _transpileModule.exportNamedOrDefault)(val, this.name) : new _ast.AssignmentExpression('=', (0, _util3.memberStringOrVal)(_astConstants.IdBuilt, this.name), val);
		},

		ObjSimple() {
			return new _ast.ObjectExpression(this.pairs.map(pair => new _ast.Property('init', (0, _util.propertyIdOrLiteral)(pair.key), (0, _util3.t0)(pair.value))));
		},

		Pass() {
			return (0, _util3.t0)(this.ignored);
		},

		Pipe() {
			return this.pipes.reduce((expr, pipe) => (0, _util3.callFocusFun)((0, _util3.t0)(pipe), expr), (0, _util3.t0)(this.value));
		},

		QuotePlain: _transpileQuotePlain2.default,

		QuoteSimple() {
			return new _ast.Literal(this.name);
		},

		QuoteTaggedTemplate() {
			return new _ast.TaggedTemplateExpression((0, _util3.t0)(this.tag), (0, _util3.t0)(this.quote));
		},

		Range() {
			const end = (0, _util2.ifElse)(this.end, _util3.t0, () => GlobalInfinity);
			return (0, _util3.msCall)('range', (0, _util3.t0)(this.start), end, new _ast.Literal(this.isExclusive));
		},

		SetSub() {
			const getKind = () => {
				switch (this.kind) {
					case _MsAst.Setters.Init:
						return 'init';

					case _MsAst.Setters.Mutate:
						return 'mutate';

					default:
						throw new Error();
				}
			};

			const kind = getKind();
			return (0, _util3.msCall)('setSub', (0, _util3.t0)(this.object), this.subbeds.length === 1 ? (0, _util3.t0)(this.subbeds[0]) : this.subbeds.map(_util3.t0), (0, _util3.maybeWrapInCheckInstance)((0, _util3.t0)(this.value), this.opType, 'value'), new _ast.Literal(kind));
		},

		SimpleFun() {
			return (0, _util3.focusFun)((0, _util3.t0)(this.value));
		},

		SpecialDo: _transpileSpecial.transpileSpecialDo,
		SpecialVal: _transpileSpecial.transpileSpecialVal,

		Spread() {
			return new _ast.SpreadElement((0, _util3.t0)(this.spreaded));
		},

		Sub() {
			return (0, _util3.msCall)('sub', (0, _util3.t0)(this.subbed), ...this.args.map(_util3.t0));
		},

		SuperCall() {
			const args = this.args.map(_util3.t0);

			const method = _context.verifyResults.superCallToMethod.get(this);

			if (method instanceof _MsAst.Constructor) {
				const call = new _ast.CallExpression(_astConstants.IdSuper, args);
				const memberSets = (0, _transpileClass.constructorSetMembers)(method);
				return (0, _util2.cat)(call, memberSets, _astConstants.SetLexicalThis);
			} else return new _ast.CallExpression((0, _util3.memberStringOrVal)(_astConstants.IdSuper, method.symbol), args);
		},

		SuperMember() {
			return (0, _util3.memberStringOrVal)(_astConstants.IdSuper, this.name);
		},

		Switch: _transpileSwitch2.default,
		SwitchPart: _transpileSwitch.transpileSwitchPart,

		Throw() {
			return (0, _util2.ifElse)(this.opThrown, _ => (0, _util3.doThrow)(_), () => new _ast.ThrowStatement(new _ast.NewExpression(_astConstants.GlobalError, [LitStrThrow])));
		},

		Trait: _transpileTrait2.default,

		With() {
			const idDeclare = (0, _util3.idForDeclareCached)(this.declare);
			const val = (0, _util3.t0)(this.value);
			const lead = (0, _util3.plainLet)(idDeclare, val);
			return _context.verifyResults.isStatement(this) ? (0, _util3.t1)(this.block, lead) : (0, _util3.blockWrap)((0, _util3.t3)(this.block, lead, null, new _ast.ReturnStatement(idDeclare)));
		},

		Yield() {
			return new _ast.YieldExpression((0, _util2.opMap)(this.opValue, _util3.t0), false);
		},

		YieldTo() {
			return new _ast.YieldExpression((0, _util3.t0)(this.value), true);
		}

	});
	const GlobalInfinity = new _ast.Identifier('Infinity');
	const LitStrThrow = new _ast.Literal('An error occurred.');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQTZCd0IsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQUFULFNBQVMiLCJmaWxlIjoidHJhbnNwaWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcnJheUV4cHJlc3Npb24sIEFzc2lnbm1lbnRFeHByZXNzaW9uLCBDYWxsRXhwcmVzc2lvbiwgQ29uZGl0aW9uYWxFeHByZXNzaW9uLFxuXHRJZGVudGlmaWVyLCBJZlN0YXRlbWVudCwgTGl0ZXJhbCwgTG9naWNhbEV4cHJlc3Npb24sIE5ld0V4cHJlc3Npb24sIE9iamVjdEV4cHJlc3Npb24sIFByb3BlcnR5LFxuXHRSZXR1cm5TdGF0ZW1lbnQsIFNwcmVhZEVsZW1lbnQsIFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbiwgVGhyb3dTdGF0ZW1lbnQsIFVuYXJ5RXhwcmVzc2lvbixcblx0VmFyaWFibGVEZWNsYXJhdGlvbiwgWWllbGRFeHByZXNzaW9ufSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7aWRlbnRpZmllciwgbWVtYmVyLCBwcm9wZXJ0eUlkT3JMaXRlcmFsfSBmcm9tICdlc2FzdC9kaXN0L3V0aWwnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtBc3NpZ25TaW5nbGUsIENvbnN0cnVjdG9yLCBGdW4sIExvZ2ljcywgTG9jYWxEZWNsYXJlcywgU2V0dGVyc30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2NhdCwgaWZFbHNlLCBpbXBsZW1lbnRNYW55LCBvcE1hcCwgdGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7SWRCdWlsdCwgSWRGb2N1cywgSWRMZXhpY2FsVGhpcywgSWRTdXBlciwgR2xvYmFsRXJyb3IsIFNldExleGljYWxUaGlzXG5cdH0gZnJvbSAnLi9hc3QtY29uc3RhbnRzJ1xuaW1wb3J0IHtzZXR1cCwgdGVhckRvd24sIHZlcmlmeVJlc3VsdHN9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB0cmFuc3BpbGVBc3NlcnQgZnJvbSAnLi90cmFuc3BpbGVBc3NlcnQnXG5pbXBvcnQgdHJhbnNwaWxlQmxvY2sgZnJvbSAnLi90cmFuc3BpbGVCbG9jaydcbmltcG9ydCB0cmFuc3BpbGVDYXNlLCB7dHJhbnNwaWxlQ2FzZVBhcnR9IGZyb20gJy4vdHJhbnNwaWxlQ2FzZSdcbmltcG9ydCB0cmFuc3BpbGVDbGFzcywge2NvbnN0cnVjdG9yU2V0TWVtYmVycywgdHJhbnNwaWxlQ29uc3RydWN0b3J9IGZyb20gJy4vdHJhbnNwaWxlQ2xhc3MnXG5pbXBvcnQgdHJhbnNwaWxlRXhjZXB0LCB7dHJhbnNwaWxlQ2F0Y2h9IGZyb20gJy4vdHJhbnNwaWxlRXhjZXB0J1xuaW1wb3J0IHt0cmFuc3BpbGVCcmVhaywgdHJhbnNwaWxlRm9yLCB0cmFuc3BpbGVGb3JBc3luYywgdHJhbnNwaWxlRm9yQmFnfSBmcm9tICcuL3RyYW5zcGlsZUZvcidcbmltcG9ydCB0cmFuc3BpbGVGdW4gZnJvbSAnLi90cmFuc3BpbGVGdW4nXG5pbXBvcnQgdHJhbnNwaWxlTW9kdWxlLCB7ZXhwb3J0TmFtZWRPckRlZmF1bHR9IGZyb20gJy4vdHJhbnNwaWxlTW9kdWxlJ1xuaW1wb3J0IHRyYW5zcGlsZVF1b3RlUGxhaW4gZnJvbSAnLi90cmFuc3BpbGVRdW90ZVBsYWluJ1xuaW1wb3J0IHt0cmFuc3BpbGVTcGVjaWFsRG8sIHRyYW5zcGlsZVNwZWNpYWxWYWx9IGZyb20gJy4vdHJhbnNwaWxlU3BlY2lhbCdcbmltcG9ydCB0cmFuc3BpbGVTd2l0Y2gsIHt0cmFuc3BpbGVTd2l0Y2hQYXJ0fSBmcm9tICcuL3RyYW5zcGlsZVN3aXRjaCdcbmltcG9ydCB0cmFuc3BpbGVUcmFpdCBmcm9tICcuL3RyYW5zcGlsZVRyYWl0J1xuaW1wb3J0IHthY2Nlc3NMb2NhbERlY2xhcmUsIGJsb2NrV3JhcCwgYmxvY2tXcmFwSWZCbG9jaywgY2FsbEZvY3VzRnVuLCBkb1Rocm93LCBmb2N1c0Z1bixcblx0aWRGb3JEZWNsYXJlQ2FjaGVkLCBsYXp5V3JhcCwgbWFrZURlY2xhcmF0b3IsIG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzLFxuXHRtYXliZVdyYXBJbkNoZWNrSW5zdGFuY2UsIG1lbWJlclN0cmluZ09yVmFsLCBtc0NhbGwsIG1zTWVtYmVyLCBwbGFpbkxldCwgdDAsIHQxLCB0Myxcblx0dHJhbnNwaWxlTmFtZX0gZnJvbSAnLi91dGlsJ1xuXG4vKiogVHJhbnNmb3JtIGEge0BsaW5rIE1zQXN0fSBpbnRvIGFuIGVzYXN0LiAqKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRyYW5zcGlsZShtb2R1bGVFeHByZXNzaW9uLCB2ZXJpZnlSZXN1bHRzKSB7XG5cdHNldHVwKHZlcmlmeVJlc3VsdHMpXG5cdGNvbnN0IHJlcyA9IHQwKG1vZHVsZUV4cHJlc3Npb24pXG5cdHRlYXJEb3duKClcblx0cmV0dXJuIHJlc1xufVxuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICd0cmFuc3BpbGUnLCB7XG5cdEFzc2VydDogdHJhbnNwaWxlQXNzZXJ0LFxuXG5cdEFzc2lnblNpbmdsZSh2YWxXcmFwKSB7XG5cdFx0Y29uc3QgdmFsID0gdmFsV3JhcCA9PT0gdW5kZWZpbmVkID8gdDAodGhpcy52YWx1ZSkgOiB2YWxXcmFwKHQwKHRoaXMudmFsdWUpKVxuXHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignbGV0JywgW21ha2VEZWNsYXJhdG9yKHRoaXMuYXNzaWduZWUsIHZhbCwgZmFsc2UpXSlcblx0fSxcblxuXHQvLyBUT0RPOkVTNiBKdXN0IHVzZSBuYXRpdmUgZGVzdHJ1Y3R1cmluZyBhc3NpZ25cblx0QXNzaWduRGVzdHJ1Y3R1cmUoKSB7XG5cdFx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKFxuXHRcdFx0J2xldCcsXG5cdFx0XHRtYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycyhcblx0XHRcdFx0dGhpcy5hc3NpZ25lZXMsXG5cdFx0XHRcdHRoaXMua2luZCgpID09PSBMb2NhbERlY2xhcmVzLkxhenksXG5cdFx0XHRcdHQwKHRoaXMudmFsdWUpLFxuXHRcdFx0XHRmYWxzZSkpXG5cdH0sXG5cblx0QXdhaXQoKSB7XG5cdFx0cmV0dXJuIG5ldyBZaWVsZEV4cHJlc3Npb24odDAodGhpcy52YWx1ZSksIGZhbHNlKVxuXHR9LFxuXG5cdEJhZ0VudHJ5KCkge1xuXHRcdHJldHVybiBtc0NhbGwodGhpcy5pc01hbnkgPyAnYWRkTWFueScgOiAnYWRkJywgSWRCdWlsdCwgdDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0QmFnU2ltcGxlKCkge1xuXHRcdHJldHVybiBuZXcgQXJyYXlFeHByZXNzaW9uKHRoaXMucGFydHMubWFwKHQwKSlcblx0fSxcblxuXHRCbG9jazogdHJhbnNwaWxlQmxvY2ssXG5cblx0QmxvY2tXcmFwKCkge1xuXHRcdHJldHVybiBibG9ja1dyYXAodDAodGhpcy5ibG9jaykpXG5cdH0sXG5cblx0QnJlYWs6IHRyYW5zcGlsZUJyZWFrLFxuXG5cdENhbGwoKSB7XG5cdFx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbih0MCh0aGlzLmNhbGxlZCksIHRoaXMuYXJncy5tYXAodDApKVxuXHR9LFxuXG5cdENhc2U6IHRyYW5zcGlsZUNhc2UsXG5cdENhc2VQYXJ0OiB0cmFuc3BpbGVDYXNlUGFydCxcblx0Q2F0Y2g6IHRyYW5zcGlsZUNhdGNoLFxuXHRDbGFzczogdHJhbnNwaWxlQ2xhc3MsXG5cblx0Q29uZCgpIHtcblx0XHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0MCh0aGlzLnRlc3QpLCB0MCh0aGlzLmlmVHJ1ZSksIHQwKHRoaXMuaWZGYWxzZSkpXG5cdH0sXG5cblx0Q29uZGl0aW9uYWwoKSB7XG5cdFx0Y29uc3QgdGVzdCA9IHQwKHRoaXMudGVzdClcblx0XHRpZiAodmVyaWZ5UmVzdWx0cy5pc1N0YXRlbWVudCh0aGlzKSlcblx0XHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQoXG5cdFx0XHRcdHRoaXMuaXNVbmxlc3MgPyBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgdGVzdCkgOiB0ZXN0LCB0MCh0aGlzLnJlc3VsdCkpXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBtc0NhbGwoJ3NvbWUnLCBibG9ja1dyYXBJZkJsb2NrKHRoaXMucmVzdWx0KSlcblx0XHRcdGNvbnN0IG5vbmUgPSBtc01lbWJlcignTm9uZScpXG5cdFx0XHRjb25zdCBbdGhlbiwgX2Vsc2VdID0gdGhpcy5pc1VubGVzcyA/IFtub25lLCByZXN1bHRdIDogW3Jlc3VsdCwgbm9uZV1cblx0XHRcdHJldHVybiBuZXcgQ29uZGl0aW9uYWxFeHByZXNzaW9uKHRlc3QsIHRoZW4sIF9lbHNlKVxuXHRcdH1cblx0fSxcblxuXHRDb25zdHJ1Y3RvcjogdHJhbnNwaWxlQ29uc3RydWN0b3IsXG5cblx0RGVsKCkge1xuXHRcdHJldHVybiBtc0NhbGwoJ2RlbCcsIHQwKHRoaXMuc3ViYmVkKSwgLi4udGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0RXhjZXB0OiB0cmFuc3BpbGVFeGNlcHQsXG5cdEZvcjogdHJhbnNwaWxlRm9yLFxuXHRGb3JBc3luYzogdHJhbnNwaWxlRm9yQXN5bmMsXG5cdEZvckJhZzogdHJhbnNwaWxlRm9yQmFnLFxuXHRGdW46IHRyYW5zcGlsZUZ1bixcblxuXHRHZXR0ZXJGdW4oKSB7XG5cdFx0Ly8gXyA9PiBfLmZvb1xuXHRcdHJldHVybiBmb2N1c0Z1bihtZW1iZXJTdHJpbmdPclZhbChJZEZvY3VzLCB0aGlzLm5hbWUpKVxuXHR9LFxuXG5cdElnbm9yZSgpIHtcblx0XHRyZXR1cm4gW11cblx0fSxcblxuXHRJbnN0YW5jZU9mKCkge1xuXHRcdC8vIFRPRE86RVM2IG5ldyBCaW5hcnlFeHByZXNzaW9uKCdpbnN0YW5jZW9mJywgdDAodGhpcy5pbnN0YW5jZSksIHQwKHRoaXMudHlwZSkpXG5cdFx0cmV0dXJuIG1zQ2FsbCgnaGFzSW5zdGFuY2UnLCB0MCh0aGlzLnR5cGUpLCB0MCh0aGlzLmluc3RhbmNlKSlcblx0fSxcblxuXHRMYXp5KCkge1xuXHRcdHJldHVybiBsYXp5V3JhcCh0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHROdW1iZXJMaXRlcmFsKCkge1xuXHRcdC8vIE5lZ2F0aXZlIG51bWJlcnMgYXJlIG5vdCBwYXJ0IG9mIEVTIHNwZWMuXG5cdFx0Ly8gaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzUuMS8jc2VjLTcuOC4zXG5cdFx0Y29uc3QgdmFsdWUgPSBOdW1iZXIodGhpcy52YWx1ZSlcblx0XHRjb25zdCBsaXQgPSBuZXcgTGl0ZXJhbChNYXRoLmFicyh2YWx1ZSkpXG5cdFx0Y29uc3QgaXNQb3NpdGl2ZSA9IHZhbHVlID49IDAgJiYgMSAvIHZhbHVlICE9PSAtSW5maW5pdHlcblx0XHRyZXR1cm4gaXNQb3NpdGl2ZSA/IGxpdCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJy0nLCBsaXQpXG5cdH0sXG5cblx0TG9jYWxBY2Nlc3MoKSB7XG5cdFx0aWYgKHRoaXMubmFtZSA9PT0gJ3RoaXMnKVxuXHRcdFx0cmV0dXJuIElkTGV4aWNhbFRoaXNcblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IGxkID0gdmVyaWZ5UmVzdWx0cy5sb2NhbERlY2xhcmVGb3JBY2Nlc3ModGhpcylcblx0XHRcdC8vIElmIGxkIG1pc3NpbmcsIHRoaXMgaXMgYSBidWlsdGluLCBhbmQgYnVpbHRpbnMgYXJlIG5ldmVyIGxhenlcblx0XHRcdHJldHVybiBsZCA9PT0gdW5kZWZpbmVkID8gaWRlbnRpZmllcih0aGlzLm5hbWUpIDogYWNjZXNzTG9jYWxEZWNsYXJlKGxkKVxuXHRcdH1cblx0fSxcblxuXHRMb2NhbERlY2xhcmUoKSB7XG5cdFx0cmV0dXJuIG5ldyBJZGVudGlmaWVyKGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzKS5uYW1lKVxuXHR9LFxuXG5cdExvY2FsTXV0YXRlKCkge1xuXHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBpZGVudGlmaWVyKHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdExvZ2ljKCkge1xuXHRcdGNvbnN0IG9wID0gdGhpcy5raW5kID09PSBMb2dpY3MuQW5kID8gJyYmJyA6ICd8fCdcblx0XHRyZXR1cm4gdGFpbCh0aGlzLmFyZ3MpLnJlZHVjZShcblx0XHRcdChhLCBiKSA9PiBuZXcgTG9naWNhbEV4cHJlc3Npb24ob3AsIGEsIHQwKGIpKSxcblx0XHRcdHQwKHRoaXMuYXJnc1swXSkpXG5cdH0sXG5cblx0TWFwRW50cnkoKSB7XG5cdFx0cmV0dXJuIG1zQ2FsbCgnc2V0U3ViJywgSWRCdWlsdCwgdDAodGhpcy5rZXkpLCB0MCh0aGlzLnZhbCkpXG5cdH0sXG5cblx0TWVtYmVyKCkge1xuXHRcdHJldHVybiBtZW1iZXJTdHJpbmdPclZhbCh0MCh0aGlzLm9iamVjdCksIHRoaXMubmFtZSlcblx0fSxcblxuXHRNZW1iZXJGdW4oKSB7XG5cdFx0Y29uc3QgbmFtZSA9IHRyYW5zcGlsZU5hbWUodGhpcy5uYW1lKVxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcE9iamVjdCxcblx0XHRcdF8gPT4gbXNDYWxsKCdtZXRob2RCb3VuZCcsIHQwKF8pLCBuYW1lKSxcblx0XHRcdCgpID0+IG1zQ2FsbCgnbWV0aG9kVW5ib3VuZCcsIG5hbWUpKVxuXHR9LFxuXG5cdE1lbWJlclNldCgpIHtcblx0XHRjb25zdCBvYmogPSB0MCh0aGlzLm9iamVjdClcblx0XHRjb25zdCB2YWwgPSBtYXliZVdyYXBJbkNoZWNrSW5zdGFuY2UodDAodGhpcy52YWx1ZSksIHRoaXMub3BUeXBlLCB0aGlzLm5hbWUpXG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU2V0dGVycy5Jbml0OlxuXHRcdFx0XHRyZXR1cm4gbXNDYWxsKCduZXdQcm9wZXJ0eScsIG9iaiwgdHJhbnNwaWxlTmFtZSh0aGlzLm5hbWUpLCB2YWwpXG5cdFx0XHRjYXNlIFNldHRlcnMuTXV0YXRlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyU3RyaW5nT3JWYWwob2JqLCB0aGlzLm5hbWUpLCB2YWwpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdH1cblx0fSxcblxuXHRNZXRob2QoKSB7XG5cdFx0Y29uc3QgbmFtZSA9IG5ldyBMaXRlcmFsKHZlcmlmeVJlc3VsdHMubmFtZSh0aGlzKSlcblx0XHRjb25zdCBhcmdzID0gdGhpcy5mdW4ub3BSZXN0QXJnID09PSBudWxsID9cblx0XHRcdG5ldyBBcnJheUV4cHJlc3Npb24odGhpcy5mdW4uYXJncy5tYXAoYXJnID0+IHtcblx0XHRcdFx0Y29uc3QgbmFtZSA9IG5ldyBMaXRlcmFsKGFyZy5uYW1lKVxuXHRcdFx0XHRjb25zdCBvcFR5cGUgPSBvcE1hcChhcmcub3BUeXBlLCB0MClcblx0XHRcdFx0cmV0dXJuIGlmRWxzZShvcFR5cGUsXG5cdFx0XHRcdFx0XyA9PiBuZXcgQXJyYXlFeHByZXNzaW9uKFtuYW1lLCBfXSksXG5cdFx0XHRcdFx0KCkgPT4gbmFtZSlcblx0XHRcdH0pKSA6XG5cdFx0XHRuZXcgVW5hcnlFeHByZXNzaW9uKCd2b2lkJywgbmV3IExpdGVyYWwoMCkpXG5cdFx0Y29uc3QgaW1wbCA9IHRoaXMuZnVuIGluc3RhbmNlb2YgRnVuID8gW3QwKHRoaXMuZnVuKV0gOiBbXVxuXHRcdHJldHVybiBtc0NhbGwoJ21ldGhvZCcsIG5hbWUsIGFyZ3MsIC4uLmltcGwpXG5cdH0sXG5cblx0TW9kdWxlOiB0cmFuc3BpbGVNb2R1bGUsXG5cblx0TXNSZWdFeHAoKSB7XG5cdFx0cmV0dXJuIHRoaXMucGFydHMubGVuZ3RoID09PSAwID9cblx0XHRcdG5ldyBMaXRlcmFsKG5ldyBSZWdFeHAoJycsIHRoaXMuZmxhZ3MpKSA6XG5cdFx0XHR0aGlzLnBhcnRzLmxlbmd0aCA9PT0gMSAmJiB0eXBlb2YgdGhpcy5wYXJ0c1swXSA9PT0gJ3N0cmluZycgP1xuXHRcdFx0bmV3IExpdGVyYWwobmV3IFJlZ0V4cCh0aGlzLnBhcnRzWzBdLnJlcGxhY2UoJ1xcbicsICdcXFxcbicpLCB0aGlzLmZsYWdzKSkgOlxuXHRcdFx0bXNDYWxsKCdyZWdleHAnLFxuXHRcdFx0XHRuZXcgQXJyYXlFeHByZXNzaW9uKHRoaXMucGFydHMubWFwKHRyYW5zcGlsZU5hbWUpKSwgbmV3IExpdGVyYWwodGhpcy5mbGFncykpXG5cdH0sXG5cblx0TmV3KCkge1xuXHRcdHJldHVybiBuZXcgTmV3RXhwcmVzc2lvbih0MCh0aGlzLnR5cGUpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHROb3QoKSB7XG5cdFx0cmV0dXJuIG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCB0MCh0aGlzLmFyZykpXG5cdH0sXG5cblx0T2JqRW50cnlBc3NpZ24oKSB7XG5cdFx0aWYgKHRoaXMuYXNzaWduIGluc3RhbmNlb2YgQXNzaWduU2luZ2xlICYmICF0aGlzLmFzc2lnbi5hc3NpZ25lZS5pc0xhenkoKSkge1xuXHRcdFx0Y29uc3QgbmFtZSA9IHRoaXMuYXNzaWduLmFzc2lnbmVlLm5hbWVcblx0XHRcdHJldHVybiB0MSh0aGlzLmFzc2lnbiwgdmFsID0+XG5cdFx0XHRcdHZlcmlmeVJlc3VsdHMuaXNPYmpFbnRyeUV4cG9ydCh0aGlzKSA/XG5cdFx0XHRcdFx0ZXhwb3J0TmFtZWRPckRlZmF1bHQodmFsLCBuYW1lKSA6XG5cdFx0XHRcdFx0bmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyKElkQnVpbHQsIG5hbWUpLCB2YWwpKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBhc3NpZ25zID0gdGhpcy5hc3NpZ24uYWxsQXNzaWduZWVzKCkubWFwKF8gPT5cblx0XHRcdFx0bXNDYWxsKCdzZXRMYXp5JywgSWRCdWlsdCwgbmV3IExpdGVyYWwoXy5uYW1lKSwgaWRGb3JEZWNsYXJlQ2FjaGVkKF8pKSlcblx0XHRcdHJldHVybiBjYXQodDAodGhpcy5hc3NpZ24pLCBhc3NpZ25zKVxuXHRcdH1cblx0fSxcblxuXHRPYmpFbnRyeVBsYWluKCkge1xuXHRcdGNvbnN0IHZhbCA9IHQwKHRoaXMudmFsdWUpXG5cdFx0cmV0dXJuIHZlcmlmeVJlc3VsdHMuaXNPYmpFbnRyeUV4cG9ydCh0aGlzKSA/XG5cdFx0XHQvLyBXZSd2ZSB2ZXJpZmllZCB0aGF0IGZvciBtb2R1bGUgZXhwb3J0LCB0aGlzLm5hbWUgbXVzdCBiZSBhIHN0cmluZy5cblx0XHRcdGV4cG9ydE5hbWVkT3JEZWZhdWx0KHZhbCwgdGhpcy5uYW1lKSA6XG5cdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXJTdHJpbmdPclZhbChJZEJ1aWx0LCB0aGlzLm5hbWUpLCB2YWwpXG5cdH0sXG5cblx0T2JqU2ltcGxlKCkge1xuXHRcdHJldHVybiBuZXcgT2JqZWN0RXhwcmVzc2lvbih0aGlzLnBhaXJzLm1hcChwYWlyID0+XG5cdFx0XHRuZXcgUHJvcGVydHkoJ2luaXQnLCBwcm9wZXJ0eUlkT3JMaXRlcmFsKHBhaXIua2V5KSwgdDAocGFpci52YWx1ZSkpKSlcblx0fSxcblxuXHRQYXNzKCkge1xuXHRcdHJldHVybiB0MCh0aGlzLmlnbm9yZWQpXG5cdH0sXG5cblx0UGlwZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5waXBlcy5yZWR1Y2UoKGV4cHIsIHBpcGUpID0+IGNhbGxGb2N1c0Z1bih0MChwaXBlKSwgZXhwciksIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdFF1b3RlUGxhaW46IHRyYW5zcGlsZVF1b3RlUGxhaW4sXG5cblx0UXVvdGVTaW1wbGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBMaXRlcmFsKHRoaXMubmFtZSlcblx0fSxcblxuXHRRdW90ZVRhZ2dlZFRlbXBsYXRlKCkge1xuXHRcdHJldHVybiBuZXcgVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uKHQwKHRoaXMudGFnKSwgdDAodGhpcy5xdW90ZSkpXG5cdH0sXG5cblx0UmFuZ2UoKSB7XG5cdFx0Y29uc3QgZW5kID0gaWZFbHNlKHRoaXMuZW5kLCB0MCwgKCkgPT4gR2xvYmFsSW5maW5pdHkpXG5cdFx0cmV0dXJuIG1zQ2FsbCgncmFuZ2UnLCB0MCh0aGlzLnN0YXJ0KSwgZW5kLCBuZXcgTGl0ZXJhbCh0aGlzLmlzRXhjbHVzaXZlKSlcblx0fSxcblxuXHRTZXRTdWIoKSB7XG5cdFx0Y29uc3QgZ2V0S2luZCA9ICgpID0+IHtcblx0XHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRcdGNhc2UgU2V0dGVycy5Jbml0OlxuXHRcdFx0XHRcdHJldHVybiAnaW5pdCdcblx0XHRcdFx0Y2FzZSBTZXR0ZXJzLk11dGF0ZTpcblx0XHRcdFx0XHRyZXR1cm4gJ211dGF0ZSdcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRjb25zdCBraW5kID0gZ2V0S2luZCgpXG5cdFx0cmV0dXJuIG1zQ2FsbChcblx0XHRcdCdzZXRTdWInLFxuXHRcdFx0dDAodGhpcy5vYmplY3QpLFxuXHRcdFx0dGhpcy5zdWJiZWRzLmxlbmd0aCA9PT0gMSA/IHQwKHRoaXMuc3ViYmVkc1swXSkgOiB0aGlzLnN1YmJlZHMubWFwKHQwKSxcblx0XHRcdG1heWJlV3JhcEluQ2hlY2tJbnN0YW5jZSh0MCh0aGlzLnZhbHVlKSwgdGhpcy5vcFR5cGUsICd2YWx1ZScpLFxuXHRcdFx0bmV3IExpdGVyYWwoa2luZCkpXG5cdH0sXG5cblx0U2ltcGxlRnVuKCkge1xuXHRcdHJldHVybiBmb2N1c0Z1bih0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRTcGVjaWFsRG86IHRyYW5zcGlsZVNwZWNpYWxEbyxcblx0U3BlY2lhbFZhbDogdHJhbnNwaWxlU3BlY2lhbFZhbCxcblxuXHRTcHJlYWQoKSB7XG5cdFx0cmV0dXJuIG5ldyBTcHJlYWRFbGVtZW50KHQwKHRoaXMuc3ByZWFkZWQpKVxuXHR9LFxuXG5cdFN1YigpIHtcblx0XHRyZXR1cm4gbXNDYWxsKCdzdWInLCB0MCh0aGlzLnN1YmJlZCksIC4uLnRoaXMuYXJncy5tYXAodDApKVxuXHR9LFxuXG5cdFN1cGVyQ2FsbCgpIHtcblx0XHRjb25zdCBhcmdzID0gdGhpcy5hcmdzLm1hcCh0MClcblx0XHRjb25zdCBtZXRob2QgPSB2ZXJpZnlSZXN1bHRzLnN1cGVyQ2FsbFRvTWV0aG9kLmdldCh0aGlzKVxuXG5cdFx0aWYgKG1ldGhvZCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB7XG5cdFx0XHQvLyBzdXBlciBtdXN0IGFwcGVhciBhcyBhIHN0YXRlbWVudCwgc28gT0sgdG8gZGVjYWxyZSBgdGhpc2Bcblx0XHRcdGNvbnN0IGNhbGwgPSBuZXcgQ2FsbEV4cHJlc3Npb24oSWRTdXBlciwgYXJncylcblx0XHRcdGNvbnN0IG1lbWJlclNldHMgPSBjb25zdHJ1Y3RvclNldE1lbWJlcnMobWV0aG9kKVxuXHRcdFx0cmV0dXJuIGNhdChjYWxsLCBtZW1iZXJTZXRzLCBTZXRMZXhpY2FsVGhpcylcblx0XHR9IGVsc2Vcblx0XHRcdHJldHVybiBuZXcgQ2FsbEV4cHJlc3Npb24obWVtYmVyU3RyaW5nT3JWYWwoSWRTdXBlciwgbWV0aG9kLnN5bWJvbCksIGFyZ3MpXG5cdH0sXG5cblx0U3VwZXJNZW1iZXIoKSB7XG5cdFx0cmV0dXJuIG1lbWJlclN0cmluZ09yVmFsKElkU3VwZXIsIHRoaXMubmFtZSlcblx0fSxcblxuXHRTd2l0Y2g6IHRyYW5zcGlsZVN3aXRjaCxcblx0U3dpdGNoUGFydDogdHJhbnNwaWxlU3dpdGNoUGFydCxcblxuXHRUaHJvdygpIHtcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BUaHJvd24sXG5cdFx0XHRfID0+IGRvVGhyb3coXyksXG5cdFx0XHQoKSA9PiBuZXcgVGhyb3dTdGF0ZW1lbnQobmV3IE5ld0V4cHJlc3Npb24oR2xvYmFsRXJyb3IsIFtMaXRTdHJUaHJvd10pKSlcblx0fSxcblxuXHRUcmFpdDogdHJhbnNwaWxlVHJhaXQsXG5cblx0V2l0aCgpIHtcblx0XHRjb25zdCBpZERlY2xhcmUgPSBpZEZvckRlY2xhcmVDYWNoZWQodGhpcy5kZWNsYXJlKVxuXHRcdGNvbnN0IHZhbCA9IHQwKHRoaXMudmFsdWUpXG5cdFx0Y29uc3QgbGVhZCA9IHBsYWluTGV0KGlkRGVjbGFyZSwgdmFsKVxuXHRcdHJldHVybiB2ZXJpZnlSZXN1bHRzLmlzU3RhdGVtZW50KHRoaXMpID9cblx0XHRcdHQxKHRoaXMuYmxvY2ssIGxlYWQpIDpcblx0XHRcdGJsb2NrV3JhcCh0Myh0aGlzLmJsb2NrLCBsZWFkLCBudWxsLCBuZXcgUmV0dXJuU3RhdGVtZW50KGlkRGVjbGFyZSkpKVxuXHR9LFxuXG5cdFlpZWxkKCkge1xuXHRcdHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKG9wTWFwKHRoaXMub3BWYWx1ZSwgdDApLCBmYWxzZSlcblx0fSxcblxuXHRZaWVsZFRvKCkge1xuXHRcdHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKHQwKHRoaXMudmFsdWUpLCB0cnVlKVxuXHR9XG59KVxuXG5jb25zdCBHbG9iYWxJbmZpbml0eSA9IG5ldyBJZGVudGlmaWVyKCdJbmZpbml0eScpXG5jb25zdCBMaXRTdHJUaHJvdyA9IG5ldyBMaXRlcmFsKCdBbiBlcnJvciBvY2N1cnJlZC4nKVxuIl19
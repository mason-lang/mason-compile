'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/util', '../MsAst', '../util', './ast-constants', './context', './transpileAssert', './transpileBlock', './transpileCase', './transpileClass', './transpileExcept', './transpileFor', './transpileFun', './transpileKind', './transpileModule', './transpileQuotePlain', './transpileSpecial', './transpileSwitch', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('esast/dist/util'), require('../MsAst'), require('../util'), require('./ast-constants'), require('./context'), require('./transpileAssert'), require('./transpileBlock'), require('./transpileCase'), require('./transpileClass'), require('./transpileExcept'), require('./transpileFor'), require('./transpileFun'), require('./transpileKind'), require('./transpileModule'), require('./transpileQuotePlain'), require('./transpileSpecial'), require('./transpileSwitch'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.MsAst, global.util, global.astConstants, global.context, global.transpileAssert, global.transpileBlock, global.transpileCase, global.transpileClass, global.transpileExcept, global.transpileFor, global.transpileFun, global.transpileKind, global.transpileModule, global.transpileQuotePlain, global.transpileSpecial, global.transpileSwitch, global.util);
		global.transpile = mod.exports;
	}
})(this, function (exports, _ast, _util, _MsAst, _util2, _astConstants, _context, _transpileAssert, _transpileBlock, _transpileCase, _transpileClass, _transpileExcept, _transpileFor, _transpileFun, _transpileKind, _transpileModule, _transpileQuotePlain, _transpileSpecial, _transpileSwitch, _util3) {
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

	var _transpileKind2 = _interopRequireDefault(_transpileKind);

	var _transpileModule2 = _interopRequireDefault(_transpileModule);

	var _transpileQuotePlain2 = _interopRequireDefault(_transpileQuotePlain);

	var _transpileSwitch2 = _interopRequireDefault(_transpileSwitch);

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

		Kind: _transpileKind2.default,

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQTZCd0IsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQUFULFNBQVMiLCJmaWxlIjoidHJhbnNwaWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcnJheUV4cHJlc3Npb24sIEFzc2lnbm1lbnRFeHByZXNzaW9uLCBDYWxsRXhwcmVzc2lvbiwgQ29uZGl0aW9uYWxFeHByZXNzaW9uLFxuXHRJZGVudGlmaWVyLCBJZlN0YXRlbWVudCwgTGl0ZXJhbCwgTG9naWNhbEV4cHJlc3Npb24sIE5ld0V4cHJlc3Npb24sIE9iamVjdEV4cHJlc3Npb24sIFByb3BlcnR5LFxuXHRSZXR1cm5TdGF0ZW1lbnQsIFNwcmVhZEVsZW1lbnQsIFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbiwgVGhyb3dTdGF0ZW1lbnQsIFVuYXJ5RXhwcmVzc2lvbixcblx0VmFyaWFibGVEZWNsYXJhdGlvbiwgWWllbGRFeHByZXNzaW9ufSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7aWRlbnRpZmllciwgbWVtYmVyLCBwcm9wZXJ0eUlkT3JMaXRlcmFsfSBmcm9tICdlc2FzdC9kaXN0L3V0aWwnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtBc3NpZ25TaW5nbGUsIENvbnN0cnVjdG9yLCBGdW4sIExvZ2ljcywgTG9jYWxEZWNsYXJlcywgU2V0dGVyc30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2NhdCwgaWZFbHNlLCBpbXBsZW1lbnRNYW55LCBvcE1hcCwgdGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7SWRCdWlsdCwgSWRGb2N1cywgSWRMZXhpY2FsVGhpcywgSWRTdXBlciwgR2xvYmFsRXJyb3IsIFNldExleGljYWxUaGlzXG5cdH0gZnJvbSAnLi9hc3QtY29uc3RhbnRzJ1xuaW1wb3J0IHtzZXR1cCwgdGVhckRvd24sIHZlcmlmeVJlc3VsdHN9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB0cmFuc3BpbGVBc3NlcnQgZnJvbSAnLi90cmFuc3BpbGVBc3NlcnQnXG5pbXBvcnQgdHJhbnNwaWxlQmxvY2sgZnJvbSAnLi90cmFuc3BpbGVCbG9jaydcbmltcG9ydCB0cmFuc3BpbGVDYXNlLCB7dHJhbnNwaWxlQ2FzZVBhcnR9IGZyb20gJy4vdHJhbnNwaWxlQ2FzZSdcbmltcG9ydCB0cmFuc3BpbGVDbGFzcywge2NvbnN0cnVjdG9yU2V0TWVtYmVycywgdHJhbnNwaWxlQ29uc3RydWN0b3J9IGZyb20gJy4vdHJhbnNwaWxlQ2xhc3MnXG5pbXBvcnQgdHJhbnNwaWxlRXhjZXB0LCB7dHJhbnNwaWxlQ2F0Y2h9IGZyb20gJy4vdHJhbnNwaWxlRXhjZXB0J1xuaW1wb3J0IHt0cmFuc3BpbGVCcmVhaywgdHJhbnNwaWxlRm9yLCB0cmFuc3BpbGVGb3JBc3luYywgdHJhbnNwaWxlRm9yQmFnfSBmcm9tICcuL3RyYW5zcGlsZUZvcidcbmltcG9ydCB0cmFuc3BpbGVGdW4gZnJvbSAnLi90cmFuc3BpbGVGdW4nXG5pbXBvcnQgdHJhbnNwaWxlS2luZCBmcm9tICcuL3RyYW5zcGlsZUtpbmQnXG5pbXBvcnQgdHJhbnNwaWxlTW9kdWxlLCB7ZXhwb3J0TmFtZWRPckRlZmF1bHR9IGZyb20gJy4vdHJhbnNwaWxlTW9kdWxlJ1xuaW1wb3J0IHRyYW5zcGlsZVF1b3RlUGxhaW4gZnJvbSAnLi90cmFuc3BpbGVRdW90ZVBsYWluJ1xuaW1wb3J0IHt0cmFuc3BpbGVTcGVjaWFsRG8sIHRyYW5zcGlsZVNwZWNpYWxWYWx9IGZyb20gJy4vdHJhbnNwaWxlU3BlY2lhbCdcbmltcG9ydCB0cmFuc3BpbGVTd2l0Y2gsIHt0cmFuc3BpbGVTd2l0Y2hQYXJ0fSBmcm9tICcuL3RyYW5zcGlsZVN3aXRjaCdcbmltcG9ydCB7YWNjZXNzTG9jYWxEZWNsYXJlLCBibG9ja1dyYXAsIGJsb2NrV3JhcElmQmxvY2ssIGNhbGxGb2N1c0Z1biwgZG9UaHJvdywgZm9jdXNGdW4sXG5cdGlkRm9yRGVjbGFyZUNhY2hlZCwgbGF6eVdyYXAsIG1ha2VEZWNsYXJhdG9yLCBtYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycyxcblx0bWF5YmVXcmFwSW5DaGVja0luc3RhbmNlLCBtZW1iZXJTdHJpbmdPclZhbCwgbXNDYWxsLCBtc01lbWJlciwgcGxhaW5MZXQsIHQwLCB0MSwgdDMsXG5cdHRyYW5zcGlsZU5hbWV9IGZyb20gJy4vdXRpbCdcblxuLyoqIFRyYW5zZm9ybSBhIHtAbGluayBNc0FzdH0gaW50byBhbiBlc2FzdC4gKiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFuc3BpbGUobW9kdWxlRXhwcmVzc2lvbiwgdmVyaWZ5UmVzdWx0cykge1xuXHRzZXR1cCh2ZXJpZnlSZXN1bHRzKVxuXHRjb25zdCByZXMgPSB0MChtb2R1bGVFeHByZXNzaW9uKVxuXHR0ZWFyRG93bigpXG5cdHJldHVybiByZXNcbn1cblxuaW1wbGVtZW50TWFueShNc0FzdFR5cGVzLCAndHJhbnNwaWxlJywge1xuXHRBc3NlcnQ6IHRyYW5zcGlsZUFzc2VydCxcblxuXHRBc3NpZ25TaW5nbGUodmFsV3JhcCkge1xuXHRcdGNvbnN0IHZhbCA9IHZhbFdyYXAgPT09IHVuZGVmaW5lZCA/IHQwKHRoaXMudmFsdWUpIDogdmFsV3JhcCh0MCh0aGlzLnZhbHVlKSlcblx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2xldCcsIFttYWtlRGVjbGFyYXRvcih0aGlzLmFzc2lnbmVlLCB2YWwsIGZhbHNlKV0pXG5cdH0sXG5cblx0Ly8gVE9ETzpFUzYgSnVzdCB1c2UgbmF0aXZlIGRlc3RydWN0dXJpbmcgYXNzaWduXG5cdEFzc2lnbkRlc3RydWN0dXJlKCkge1xuXHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbihcblx0XHRcdCdsZXQnLFxuXHRcdFx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMoXG5cdFx0XHRcdHRoaXMuYXNzaWduZWVzLFxuXHRcdFx0XHR0aGlzLmtpbmQoKSA9PT0gTG9jYWxEZWNsYXJlcy5MYXp5LFxuXHRcdFx0XHR0MCh0aGlzLnZhbHVlKSxcblx0XHRcdFx0ZmFsc2UpKVxuXHR9LFxuXG5cdEF3YWl0KCkge1xuXHRcdHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKHQwKHRoaXMudmFsdWUpLCBmYWxzZSlcblx0fSxcblxuXHRCYWdFbnRyeSgpIHtcblx0XHRyZXR1cm4gbXNDYWxsKHRoaXMuaXNNYW55ID8gJ2FkZE1hbnknIDogJ2FkZCcsIElkQnVpbHQsIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdEJhZ1NpbXBsZSgpIHtcblx0XHRyZXR1cm4gbmV3IEFycmF5RXhwcmVzc2lvbih0aGlzLnBhcnRzLm1hcCh0MCkpXG5cdH0sXG5cblx0QmxvY2s6IHRyYW5zcGlsZUJsb2NrLFxuXG5cdEJsb2NrV3JhcCgpIHtcblx0XHRyZXR1cm4gYmxvY2tXcmFwKHQwKHRoaXMuYmxvY2spKVxuXHR9LFxuXG5cdEJyZWFrOiB0cmFuc3BpbGVCcmVhayxcblxuXHRDYWxsKCkge1xuXHRcdHJldHVybiBuZXcgQ2FsbEV4cHJlc3Npb24odDAodGhpcy5jYWxsZWQpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHRDYXNlOiB0cmFuc3BpbGVDYXNlLFxuXHRDYXNlUGFydDogdHJhbnNwaWxlQ2FzZVBhcnQsXG5cdENhdGNoOiB0cmFuc3BpbGVDYXRjaCxcblx0Q2xhc3M6IHRyYW5zcGlsZUNsYXNzLFxuXG5cdENvbmQoKSB7XG5cdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odDAodGhpcy50ZXN0KSwgdDAodGhpcy5pZlRydWUpLCB0MCh0aGlzLmlmRmFsc2UpKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsKCkge1xuXHRcdGNvbnN0IHRlc3QgPSB0MCh0aGlzLnRlc3QpXG5cdFx0aWYgKHZlcmlmeVJlc3VsdHMuaXNTdGF0ZW1lbnQodGhpcykpXG5cdFx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KFxuXHRcdFx0XHR0aGlzLmlzVW5sZXNzID8gbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIHRlc3QpIDogdGVzdCwgdDAodGhpcy5yZXN1bHQpKVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gbXNDYWxsKCdzb21lJywgYmxvY2tXcmFwSWZCbG9jayh0aGlzLnJlc3VsdCkpXG5cdFx0XHRjb25zdCBub25lID0gbXNNZW1iZXIoJ05vbmUnKVxuXHRcdFx0Y29uc3QgW3RoZW4sIF9lbHNlXSA9IHRoaXMuaXNVbmxlc3MgPyBbbm9uZSwgcmVzdWx0XSA6IFtyZXN1bHQsIG5vbmVdXG5cdFx0XHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXN0LCB0aGVuLCBfZWxzZSlcblx0XHR9XG5cdH0sXG5cblx0Q29uc3RydWN0b3I6IHRyYW5zcGlsZUNvbnN0cnVjdG9yLFxuXG5cdERlbCgpIHtcblx0XHRyZXR1cm4gbXNDYWxsKCdkZWwnLCB0MCh0aGlzLnN1YmJlZCksIC4uLnRoaXMuYXJncy5tYXAodDApKVxuXHR9LFxuXG5cdEV4Y2VwdDogdHJhbnNwaWxlRXhjZXB0LFxuXHRGb3I6IHRyYW5zcGlsZUZvcixcblx0Rm9yQXN5bmM6IHRyYW5zcGlsZUZvckFzeW5jLFxuXHRGb3JCYWc6IHRyYW5zcGlsZUZvckJhZyxcblx0RnVuOiB0cmFuc3BpbGVGdW4sXG5cblx0R2V0dGVyRnVuKCkge1xuXHRcdC8vIF8gPT4gXy5mb29cblx0XHRyZXR1cm4gZm9jdXNGdW4obWVtYmVyU3RyaW5nT3JWYWwoSWRGb2N1cywgdGhpcy5uYW1lKSlcblx0fSxcblxuXHRJZ25vcmUoKSB7XG5cdFx0cmV0dXJuIFtdXG5cdH0sXG5cblx0SW5zdGFuY2VPZigpIHtcblx0XHQvLyBUT0RPOkVTNiBuZXcgQmluYXJ5RXhwcmVzc2lvbignaW5zdGFuY2VvZicsIHQwKHRoaXMuaW5zdGFuY2UpLCB0MCh0aGlzLnR5cGUpKVxuXHRcdHJldHVybiBtc0NhbGwoJ2hhc0luc3RhbmNlJywgdDAodGhpcy50eXBlKSwgdDAodGhpcy5pbnN0YW5jZSkpXG5cdH0sXG5cblx0S2luZDogdHJhbnNwaWxlS2luZCxcblxuXHRMYXp5KCkge1xuXHRcdHJldHVybiBsYXp5V3JhcCh0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHROdW1iZXJMaXRlcmFsKCkge1xuXHRcdC8vIE5lZ2F0aXZlIG51bWJlcnMgYXJlIG5vdCBwYXJ0IG9mIEVTIHNwZWMuXG5cdFx0Ly8gaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzUuMS8jc2VjLTcuOC4zXG5cdFx0Y29uc3QgdmFsdWUgPSBOdW1iZXIodGhpcy52YWx1ZSlcblx0XHRjb25zdCBsaXQgPSBuZXcgTGl0ZXJhbChNYXRoLmFicyh2YWx1ZSkpXG5cdFx0Y29uc3QgaXNQb3NpdGl2ZSA9IHZhbHVlID49IDAgJiYgMSAvIHZhbHVlICE9PSAtSW5maW5pdHlcblx0XHRyZXR1cm4gaXNQb3NpdGl2ZSA/IGxpdCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJy0nLCBsaXQpXG5cdH0sXG5cblx0TG9jYWxBY2Nlc3MoKSB7XG5cdFx0aWYgKHRoaXMubmFtZSA9PT0gJ3RoaXMnKVxuXHRcdFx0cmV0dXJuIElkTGV4aWNhbFRoaXNcblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IGxkID0gdmVyaWZ5UmVzdWx0cy5sb2NhbERlY2xhcmVGb3JBY2Nlc3ModGhpcylcblx0XHRcdC8vIElmIGxkIG1pc3NpbmcsIHRoaXMgaXMgYSBidWlsdGluLCBhbmQgYnVpbHRpbnMgYXJlIG5ldmVyIGxhenlcblx0XHRcdHJldHVybiBsZCA9PT0gdW5kZWZpbmVkID8gaWRlbnRpZmllcih0aGlzLm5hbWUpIDogYWNjZXNzTG9jYWxEZWNsYXJlKGxkKVxuXHRcdH1cblx0fSxcblxuXHRMb2NhbERlY2xhcmUoKSB7XG5cdFx0cmV0dXJuIG5ldyBJZGVudGlmaWVyKGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzKS5uYW1lKVxuXHR9LFxuXG5cdExvY2FsTXV0YXRlKCkge1xuXHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBpZGVudGlmaWVyKHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdExvZ2ljKCkge1xuXHRcdGNvbnN0IG9wID0gdGhpcy5raW5kID09PSBMb2dpY3MuQW5kID8gJyYmJyA6ICd8fCdcblx0XHRyZXR1cm4gdGFpbCh0aGlzLmFyZ3MpLnJlZHVjZShcblx0XHRcdChhLCBiKSA9PiBuZXcgTG9naWNhbEV4cHJlc3Npb24ob3AsIGEsIHQwKGIpKSxcblx0XHRcdHQwKHRoaXMuYXJnc1swXSkpXG5cdH0sXG5cblx0TWFwRW50cnkoKSB7XG5cdFx0cmV0dXJuIG1zQ2FsbCgnc2V0U3ViJywgSWRCdWlsdCwgdDAodGhpcy5rZXkpLCB0MCh0aGlzLnZhbCkpXG5cdH0sXG5cblx0TWVtYmVyKCkge1xuXHRcdHJldHVybiBtZW1iZXJTdHJpbmdPclZhbCh0MCh0aGlzLm9iamVjdCksIHRoaXMubmFtZSlcblx0fSxcblxuXHRNZW1iZXJGdW4oKSB7XG5cdFx0Y29uc3QgbmFtZSA9IHRyYW5zcGlsZU5hbWUodGhpcy5uYW1lKVxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcE9iamVjdCxcblx0XHRcdF8gPT4gbXNDYWxsKCdtZXRob2RCb3VuZCcsIHQwKF8pLCBuYW1lKSxcblx0XHRcdCgpID0+IG1zQ2FsbCgnbWV0aG9kVW5ib3VuZCcsIG5hbWUpKVxuXHR9LFxuXG5cdE1lbWJlclNldCgpIHtcblx0XHRjb25zdCBvYmogPSB0MCh0aGlzLm9iamVjdClcblx0XHRjb25zdCB2YWwgPSBtYXliZVdyYXBJbkNoZWNrSW5zdGFuY2UodDAodGhpcy52YWx1ZSksIHRoaXMub3BUeXBlLCB0aGlzLm5hbWUpXG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU2V0dGVycy5Jbml0OlxuXHRcdFx0XHRyZXR1cm4gbXNDYWxsKCduZXdQcm9wZXJ0eScsIG9iaiwgdHJhbnNwaWxlTmFtZSh0aGlzLm5hbWUpLCB2YWwpXG5cdFx0XHRjYXNlIFNldHRlcnMuTXV0YXRlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyU3RyaW5nT3JWYWwob2JqLCB0aGlzLm5hbWUpLCB2YWwpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdH1cblx0fSxcblxuXHRNZXRob2QoKSB7XG5cdFx0Y29uc3QgbmFtZSA9IG5ldyBMaXRlcmFsKHZlcmlmeVJlc3VsdHMubmFtZSh0aGlzKSlcblx0XHRjb25zdCBhcmdzID0gdGhpcy5mdW4ub3BSZXN0QXJnID09PSBudWxsID9cblx0XHRcdG5ldyBBcnJheUV4cHJlc3Npb24odGhpcy5mdW4uYXJncy5tYXAoYXJnID0+IHtcblx0XHRcdFx0Y29uc3QgbmFtZSA9IG5ldyBMaXRlcmFsKGFyZy5uYW1lKVxuXHRcdFx0XHRjb25zdCBvcFR5cGUgPSBvcE1hcChhcmcub3BUeXBlLCB0MClcblx0XHRcdFx0cmV0dXJuIGlmRWxzZShvcFR5cGUsXG5cdFx0XHRcdFx0XyA9PiBuZXcgQXJyYXlFeHByZXNzaW9uKFtuYW1lLCBfXSksXG5cdFx0XHRcdFx0KCkgPT4gbmFtZSlcblx0XHRcdH0pKSA6XG5cdFx0XHRuZXcgVW5hcnlFeHByZXNzaW9uKCd2b2lkJywgbmV3IExpdGVyYWwoMCkpXG5cdFx0Y29uc3QgaW1wbCA9IHRoaXMuZnVuIGluc3RhbmNlb2YgRnVuID8gW3QwKHRoaXMuZnVuKV0gOiBbXVxuXHRcdHJldHVybiBtc0NhbGwoJ21ldGhvZCcsIG5hbWUsIGFyZ3MsIC4uLmltcGwpXG5cdH0sXG5cblx0TW9kdWxlOiB0cmFuc3BpbGVNb2R1bGUsXG5cblx0TXNSZWdFeHAoKSB7XG5cdFx0cmV0dXJuIHRoaXMucGFydHMubGVuZ3RoID09PSAwID9cblx0XHRcdG5ldyBMaXRlcmFsKG5ldyBSZWdFeHAoJycsIHRoaXMuZmxhZ3MpKSA6XG5cdFx0XHR0aGlzLnBhcnRzLmxlbmd0aCA9PT0gMSAmJiB0eXBlb2YgdGhpcy5wYXJ0c1swXSA9PT0gJ3N0cmluZycgP1xuXHRcdFx0bmV3IExpdGVyYWwobmV3IFJlZ0V4cCh0aGlzLnBhcnRzWzBdLnJlcGxhY2UoJ1xcbicsICdcXFxcbicpLCB0aGlzLmZsYWdzKSkgOlxuXHRcdFx0bXNDYWxsKCdyZWdleHAnLFxuXHRcdFx0XHRuZXcgQXJyYXlFeHByZXNzaW9uKHRoaXMucGFydHMubWFwKHRyYW5zcGlsZU5hbWUpKSwgbmV3IExpdGVyYWwodGhpcy5mbGFncykpXG5cdH0sXG5cblx0TmV3KCkge1xuXHRcdHJldHVybiBuZXcgTmV3RXhwcmVzc2lvbih0MCh0aGlzLnR5cGUpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHROb3QoKSB7XG5cdFx0cmV0dXJuIG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCB0MCh0aGlzLmFyZykpXG5cdH0sXG5cblx0T2JqRW50cnlBc3NpZ24oKSB7XG5cdFx0aWYgKHRoaXMuYXNzaWduIGluc3RhbmNlb2YgQXNzaWduU2luZ2xlICYmICF0aGlzLmFzc2lnbi5hc3NpZ25lZS5pc0xhenkoKSkge1xuXHRcdFx0Y29uc3QgbmFtZSA9IHRoaXMuYXNzaWduLmFzc2lnbmVlLm5hbWVcblx0XHRcdHJldHVybiB0MSh0aGlzLmFzc2lnbiwgdmFsID0+XG5cdFx0XHRcdHZlcmlmeVJlc3VsdHMuaXNPYmpFbnRyeUV4cG9ydCh0aGlzKSA/XG5cdFx0XHRcdFx0ZXhwb3J0TmFtZWRPckRlZmF1bHQodmFsLCBuYW1lKSA6XG5cdFx0XHRcdFx0bmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyKElkQnVpbHQsIG5hbWUpLCB2YWwpKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBhc3NpZ25zID0gdGhpcy5hc3NpZ24uYWxsQXNzaWduZWVzKCkubWFwKF8gPT5cblx0XHRcdFx0bXNDYWxsKCdzZXRMYXp5JywgSWRCdWlsdCwgbmV3IExpdGVyYWwoXy5uYW1lKSwgaWRGb3JEZWNsYXJlQ2FjaGVkKF8pKSlcblx0XHRcdHJldHVybiBjYXQodDAodGhpcy5hc3NpZ24pLCBhc3NpZ25zKVxuXHRcdH1cblx0fSxcblxuXHRPYmpFbnRyeVBsYWluKCkge1xuXHRcdGNvbnN0IHZhbCA9IHQwKHRoaXMudmFsdWUpXG5cdFx0cmV0dXJuIHZlcmlmeVJlc3VsdHMuaXNPYmpFbnRyeUV4cG9ydCh0aGlzKSA/XG5cdFx0XHQvLyBXZSd2ZSB2ZXJpZmllZCB0aGF0IGZvciBtb2R1bGUgZXhwb3J0LCB0aGlzLm5hbWUgbXVzdCBiZSBhIHN0cmluZy5cblx0XHRcdGV4cG9ydE5hbWVkT3JEZWZhdWx0KHZhbCwgdGhpcy5uYW1lKSA6XG5cdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXJTdHJpbmdPclZhbChJZEJ1aWx0LCB0aGlzLm5hbWUpLCB2YWwpXG5cdH0sXG5cblx0T2JqU2ltcGxlKCkge1xuXHRcdHJldHVybiBuZXcgT2JqZWN0RXhwcmVzc2lvbih0aGlzLnBhaXJzLm1hcChwYWlyID0+XG5cdFx0XHRuZXcgUHJvcGVydHkoJ2luaXQnLCBwcm9wZXJ0eUlkT3JMaXRlcmFsKHBhaXIua2V5KSwgdDAocGFpci52YWx1ZSkpKSlcblx0fSxcblxuXHRQYXNzKCkge1xuXHRcdHJldHVybiB0MCh0aGlzLmlnbm9yZWQpXG5cdH0sXG5cblx0UGlwZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5waXBlcy5yZWR1Y2UoKGV4cHIsIHBpcGUpID0+IGNhbGxGb2N1c0Z1bih0MChwaXBlKSwgZXhwciksIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdFF1b3RlUGxhaW46IHRyYW5zcGlsZVF1b3RlUGxhaW4sXG5cblx0UXVvdGVTaW1wbGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBMaXRlcmFsKHRoaXMubmFtZSlcblx0fSxcblxuXHRRdW90ZVRhZ2dlZFRlbXBsYXRlKCkge1xuXHRcdHJldHVybiBuZXcgVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uKHQwKHRoaXMudGFnKSwgdDAodGhpcy5xdW90ZSkpXG5cdH0sXG5cblx0UmFuZ2UoKSB7XG5cdFx0Y29uc3QgZW5kID0gaWZFbHNlKHRoaXMuZW5kLCB0MCwgKCkgPT4gR2xvYmFsSW5maW5pdHkpXG5cdFx0cmV0dXJuIG1zQ2FsbCgncmFuZ2UnLCB0MCh0aGlzLnN0YXJ0KSwgZW5kLCBuZXcgTGl0ZXJhbCh0aGlzLmlzRXhjbHVzaXZlKSlcblx0fSxcblxuXHRTZXRTdWIoKSB7XG5cdFx0Y29uc3QgZ2V0S2luZCA9ICgpID0+IHtcblx0XHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRcdGNhc2UgU2V0dGVycy5Jbml0OlxuXHRcdFx0XHRcdHJldHVybiAnaW5pdCdcblx0XHRcdFx0Y2FzZSBTZXR0ZXJzLk11dGF0ZTpcblx0XHRcdFx0XHRyZXR1cm4gJ211dGF0ZSdcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRjb25zdCBraW5kID0gZ2V0S2luZCgpXG5cdFx0cmV0dXJuIG1zQ2FsbChcblx0XHRcdCdzZXRTdWInLFxuXHRcdFx0dDAodGhpcy5vYmplY3QpLFxuXHRcdFx0dGhpcy5zdWJiZWRzLmxlbmd0aCA9PT0gMSA/IHQwKHRoaXMuc3ViYmVkc1swXSkgOiB0aGlzLnN1YmJlZHMubWFwKHQwKSxcblx0XHRcdG1heWJlV3JhcEluQ2hlY2tJbnN0YW5jZSh0MCh0aGlzLnZhbHVlKSwgdGhpcy5vcFR5cGUsICd2YWx1ZScpLFxuXHRcdFx0bmV3IExpdGVyYWwoa2luZCkpXG5cdH0sXG5cblx0U2ltcGxlRnVuKCkge1xuXHRcdHJldHVybiBmb2N1c0Z1bih0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRTcGVjaWFsRG86IHRyYW5zcGlsZVNwZWNpYWxEbyxcblx0U3BlY2lhbFZhbDogdHJhbnNwaWxlU3BlY2lhbFZhbCxcblxuXHRTcHJlYWQoKSB7XG5cdFx0cmV0dXJuIG5ldyBTcHJlYWRFbGVtZW50KHQwKHRoaXMuc3ByZWFkZWQpKVxuXHR9LFxuXG5cdFN1YigpIHtcblx0XHRyZXR1cm4gbXNDYWxsKCdzdWInLCB0MCh0aGlzLnN1YmJlZCksIC4uLnRoaXMuYXJncy5tYXAodDApKVxuXHR9LFxuXG5cdFN1cGVyQ2FsbCgpIHtcblx0XHRjb25zdCBhcmdzID0gdGhpcy5hcmdzLm1hcCh0MClcblx0XHRjb25zdCBtZXRob2QgPSB2ZXJpZnlSZXN1bHRzLnN1cGVyQ2FsbFRvTWV0aG9kLmdldCh0aGlzKVxuXG5cdFx0aWYgKG1ldGhvZCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB7XG5cdFx0XHQvLyBzdXBlciBtdXN0IGFwcGVhciBhcyBhIHN0YXRlbWVudCwgc28gT0sgdG8gZGVjYWxyZSBgdGhpc2Bcblx0XHRcdGNvbnN0IGNhbGwgPSBuZXcgQ2FsbEV4cHJlc3Npb24oSWRTdXBlciwgYXJncylcblx0XHRcdGNvbnN0IG1lbWJlclNldHMgPSBjb25zdHJ1Y3RvclNldE1lbWJlcnMobWV0aG9kKVxuXHRcdFx0cmV0dXJuIGNhdChjYWxsLCBtZW1iZXJTZXRzLCBTZXRMZXhpY2FsVGhpcylcblx0XHR9IGVsc2Vcblx0XHRcdHJldHVybiBuZXcgQ2FsbEV4cHJlc3Npb24obWVtYmVyU3RyaW5nT3JWYWwoSWRTdXBlciwgbWV0aG9kLnN5bWJvbCksIGFyZ3MpXG5cdH0sXG5cblx0U3VwZXJNZW1iZXIoKSB7XG5cdFx0cmV0dXJuIG1lbWJlclN0cmluZ09yVmFsKElkU3VwZXIsIHRoaXMubmFtZSlcblx0fSxcblxuXHRTd2l0Y2g6IHRyYW5zcGlsZVN3aXRjaCxcblx0U3dpdGNoUGFydDogdHJhbnNwaWxlU3dpdGNoUGFydCxcblxuXHRUaHJvdygpIHtcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BUaHJvd24sXG5cdFx0XHRfID0+IGRvVGhyb3coXyksXG5cdFx0XHQoKSA9PiBuZXcgVGhyb3dTdGF0ZW1lbnQobmV3IE5ld0V4cHJlc3Npb24oR2xvYmFsRXJyb3IsIFtMaXRTdHJUaHJvd10pKSlcblx0fSxcblxuXHRXaXRoKCkge1xuXHRcdGNvbnN0IGlkRGVjbGFyZSA9IGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzLmRlY2xhcmUpXG5cdFx0Y29uc3QgdmFsID0gdDAodGhpcy52YWx1ZSlcblx0XHRjb25zdCBsZWFkID0gcGxhaW5MZXQoaWREZWNsYXJlLCB2YWwpXG5cdFx0cmV0dXJuIHZlcmlmeVJlc3VsdHMuaXNTdGF0ZW1lbnQodGhpcykgP1xuXHRcdFx0dDEodGhpcy5ibG9jaywgbGVhZCkgOlxuXHRcdFx0YmxvY2tXcmFwKHQzKHRoaXMuYmxvY2ssIGxlYWQsIG51bGwsIG5ldyBSZXR1cm5TdGF0ZW1lbnQoaWREZWNsYXJlKSkpXG5cdH0sXG5cblx0WWllbGQoKSB7XG5cdFx0cmV0dXJuIG5ldyBZaWVsZEV4cHJlc3Npb24ob3BNYXAodGhpcy5vcFZhbHVlLCB0MCksIGZhbHNlKVxuXHR9LFxuXG5cdFlpZWxkVG8oKSB7XG5cdFx0cmV0dXJuIG5ldyBZaWVsZEV4cHJlc3Npb24odDAodGhpcy52YWx1ZSksIHRydWUpXG5cdH1cbn0pXG5cbmNvbnN0IEdsb2JhbEluZmluaXR5ID0gbmV3IElkZW50aWZpZXIoJ0luZmluaXR5JylcbmNvbnN0IExpdFN0clRocm93ID0gbmV3IExpdGVyYWwoJ0FuIGVycm9yIG9jY3VycmVkLicpXG4iXX0=
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
		TraitDo: _transpileTrait.transpileTraitDo,

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQTZCd0IsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQUFULFNBQVMiLCJmaWxlIjoidHJhbnNwaWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcnJheUV4cHJlc3Npb24sIEFzc2lnbm1lbnRFeHByZXNzaW9uLCBDYWxsRXhwcmVzc2lvbiwgQ29uZGl0aW9uYWxFeHByZXNzaW9uLFxuXHRJZGVudGlmaWVyLCBJZlN0YXRlbWVudCwgTGl0ZXJhbCwgTG9naWNhbEV4cHJlc3Npb24sIE5ld0V4cHJlc3Npb24sIE9iamVjdEV4cHJlc3Npb24sIFByb3BlcnR5LFxuXHRSZXR1cm5TdGF0ZW1lbnQsIFNwcmVhZEVsZW1lbnQsIFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbiwgVGhyb3dTdGF0ZW1lbnQsIFVuYXJ5RXhwcmVzc2lvbixcblx0VmFyaWFibGVEZWNsYXJhdGlvbiwgWWllbGRFeHByZXNzaW9ufSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7aWRlbnRpZmllciwgbWVtYmVyLCBwcm9wZXJ0eUlkT3JMaXRlcmFsfSBmcm9tICdlc2FzdC9kaXN0L3V0aWwnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtBc3NpZ25TaW5nbGUsIENvbnN0cnVjdG9yLCBGdW4sIExvZ2ljcywgTG9jYWxEZWNsYXJlcywgU2V0dGVyc30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2NhdCwgaWZFbHNlLCBpbXBsZW1lbnRNYW55LCBvcE1hcCwgdGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7SWRCdWlsdCwgSWRGb2N1cywgSWRMZXhpY2FsVGhpcywgSWRTdXBlciwgR2xvYmFsRXJyb3IsIFNldExleGljYWxUaGlzXG5cdH0gZnJvbSAnLi9hc3QtY29uc3RhbnRzJ1xuaW1wb3J0IHtzZXR1cCwgdGVhckRvd24sIHZlcmlmeVJlc3VsdHN9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB0cmFuc3BpbGVBc3NlcnQgZnJvbSAnLi90cmFuc3BpbGVBc3NlcnQnXG5pbXBvcnQgdHJhbnNwaWxlQmxvY2sgZnJvbSAnLi90cmFuc3BpbGVCbG9jaydcbmltcG9ydCB0cmFuc3BpbGVDYXNlLCB7dHJhbnNwaWxlQ2FzZVBhcnR9IGZyb20gJy4vdHJhbnNwaWxlQ2FzZSdcbmltcG9ydCB0cmFuc3BpbGVDbGFzcywge2NvbnN0cnVjdG9yU2V0TWVtYmVycywgdHJhbnNwaWxlQ29uc3RydWN0b3J9IGZyb20gJy4vdHJhbnNwaWxlQ2xhc3MnXG5pbXBvcnQgdHJhbnNwaWxlRXhjZXB0LCB7dHJhbnNwaWxlQ2F0Y2h9IGZyb20gJy4vdHJhbnNwaWxlRXhjZXB0J1xuaW1wb3J0IHt0cmFuc3BpbGVCcmVhaywgdHJhbnNwaWxlRm9yLCB0cmFuc3BpbGVGb3JBc3luYywgdHJhbnNwaWxlRm9yQmFnfSBmcm9tICcuL3RyYW5zcGlsZUZvcidcbmltcG9ydCB0cmFuc3BpbGVGdW4gZnJvbSAnLi90cmFuc3BpbGVGdW4nXG5pbXBvcnQgdHJhbnNwaWxlTW9kdWxlLCB7ZXhwb3J0TmFtZWRPckRlZmF1bHR9IGZyb20gJy4vdHJhbnNwaWxlTW9kdWxlJ1xuaW1wb3J0IHRyYW5zcGlsZVF1b3RlUGxhaW4gZnJvbSAnLi90cmFuc3BpbGVRdW90ZVBsYWluJ1xuaW1wb3J0IHt0cmFuc3BpbGVTcGVjaWFsRG8sIHRyYW5zcGlsZVNwZWNpYWxWYWx9IGZyb20gJy4vdHJhbnNwaWxlU3BlY2lhbCdcbmltcG9ydCB0cmFuc3BpbGVTd2l0Y2gsIHt0cmFuc3BpbGVTd2l0Y2hQYXJ0fSBmcm9tICcuL3RyYW5zcGlsZVN3aXRjaCdcbmltcG9ydCB0cmFuc3BpbGVUcmFpdCwge3RyYW5zcGlsZVRyYWl0RG99IGZyb20gJy4vdHJhbnNwaWxlVHJhaXQnXG5pbXBvcnQge2FjY2Vzc0xvY2FsRGVjbGFyZSwgYmxvY2tXcmFwLCBibG9ja1dyYXBJZkJsb2NrLCBjYWxsRm9jdXNGdW4sIGRvVGhyb3csIGZvY3VzRnVuLFxuXHRpZEZvckRlY2xhcmVDYWNoZWQsIGxhenlXcmFwLCBtYWtlRGVjbGFyYXRvciwgbWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMsXG5cdG1heWJlV3JhcEluQ2hlY2tJbnN0YW5jZSwgbWVtYmVyU3RyaW5nT3JWYWwsIG1zQ2FsbCwgbXNNZW1iZXIsIHBsYWluTGV0LCB0MCwgdDEsIHQzLFxuXHR0cmFuc3BpbGVOYW1lfSBmcm9tICcuL3V0aWwnXG5cbi8qKiBUcmFuc2Zvcm0gYSB7QGxpbmsgTXNBc3R9IGludG8gYW4gZXNhc3QuICoqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhbnNwaWxlKG1vZHVsZUV4cHJlc3Npb24sIHZlcmlmeVJlc3VsdHMpIHtcblx0c2V0dXAodmVyaWZ5UmVzdWx0cylcblx0Y29uc3QgcmVzID0gdDAobW9kdWxlRXhwcmVzc2lvbilcblx0dGVhckRvd24oKVxuXHRyZXR1cm4gcmVzXG59XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ3RyYW5zcGlsZScsIHtcblx0QXNzZXJ0OiB0cmFuc3BpbGVBc3NlcnQsXG5cblx0QXNzaWduU2luZ2xlKHZhbFdyYXApIHtcblx0XHRjb25zdCB2YWwgPSB2YWxXcmFwID09PSB1bmRlZmluZWQgPyB0MCh0aGlzLnZhbHVlKSA6IHZhbFdyYXAodDAodGhpcy52YWx1ZSkpXG5cdFx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdsZXQnLCBbbWFrZURlY2xhcmF0b3IodGhpcy5hc3NpZ25lZSwgdmFsLCBmYWxzZSldKVxuXHR9LFxuXG5cdC8vIFRPRE86RVM2IEp1c3QgdXNlIG5hdGl2ZSBkZXN0cnVjdHVyaW5nIGFzc2lnblxuXHRBc3NpZ25EZXN0cnVjdHVyZSgpIHtcblx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oXG5cdFx0XHQnbGV0Jyxcblx0XHRcdG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzKFxuXHRcdFx0XHR0aGlzLmFzc2lnbmVlcyxcblx0XHRcdFx0dGhpcy5raW5kKCkgPT09IExvY2FsRGVjbGFyZXMuTGF6eSxcblx0XHRcdFx0dDAodGhpcy52YWx1ZSksXG5cdFx0XHRcdGZhbHNlKSlcblx0fSxcblxuXHRBd2FpdCgpIHtcblx0XHRyZXR1cm4gbmV3IFlpZWxkRXhwcmVzc2lvbih0MCh0aGlzLnZhbHVlKSwgZmFsc2UpXG5cdH0sXG5cblx0QmFnRW50cnkoKSB7XG5cdFx0cmV0dXJuIG1zQ2FsbCh0aGlzLmlzTWFueSA/ICdhZGRNYW55JyA6ICdhZGQnLCBJZEJ1aWx0LCB0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRCYWdTaW1wbGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBBcnJheUV4cHJlc3Npb24odGhpcy5wYXJ0cy5tYXAodDApKVxuXHR9LFxuXG5cdEJsb2NrOiB0cmFuc3BpbGVCbG9jayxcblxuXHRCbG9ja1dyYXAoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcCh0MCh0aGlzLmJsb2NrKSlcblx0fSxcblxuXHRCcmVhazogdHJhbnNwaWxlQnJlYWssXG5cblx0Q2FsbCgpIHtcblx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKHQwKHRoaXMuY2FsbGVkKSwgdGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0Q2FzZTogdHJhbnNwaWxlQ2FzZSxcblx0Q2FzZVBhcnQ6IHRyYW5zcGlsZUNhc2VQYXJ0LFxuXHRDYXRjaDogdHJhbnNwaWxlQ2F0Y2gsXG5cdENsYXNzOiB0cmFuc3BpbGVDbGFzcyxcblxuXHRDb25kKCkge1xuXHRcdHJldHVybiBuZXcgQ29uZGl0aW9uYWxFeHByZXNzaW9uKHQwKHRoaXMudGVzdCksIHQwKHRoaXMuaWZUcnVlKSwgdDAodGhpcy5pZkZhbHNlKSlcblx0fSxcblxuXHRDb25kaXRpb25hbCgpIHtcblx0XHRjb25zdCB0ZXN0ID0gdDAodGhpcy50ZXN0KVxuXHRcdGlmICh2ZXJpZnlSZXN1bHRzLmlzU3RhdGVtZW50KHRoaXMpKVxuXHRcdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudChcblx0XHRcdFx0dGhpcy5pc1VubGVzcyA/IG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCB0ZXN0KSA6IHRlc3QsIHQwKHRoaXMucmVzdWx0KSlcblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IG1zQ2FsbCgnc29tZScsIGJsb2NrV3JhcElmQmxvY2sodGhpcy5yZXN1bHQpKVxuXHRcdFx0Y29uc3Qgbm9uZSA9IG1zTWVtYmVyKCdOb25lJylcblx0XHRcdGNvbnN0IFt0aGVuLCBfZWxzZV0gPSB0aGlzLmlzVW5sZXNzID8gW25vbmUsIHJlc3VsdF0gOiBbcmVzdWx0LCBub25lXVxuXHRcdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odGVzdCwgdGhlbiwgX2Vsc2UpXG5cdFx0fVxuXHR9LFxuXG5cdENvbnN0cnVjdG9yOiB0cmFuc3BpbGVDb25zdHJ1Y3RvcixcblxuXHREZWwoKSB7XG5cdFx0cmV0dXJuIG1zQ2FsbCgnZGVsJywgdDAodGhpcy5zdWJiZWQpLCAuLi50aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHRFeGNlcHQ6IHRyYW5zcGlsZUV4Y2VwdCxcblx0Rm9yOiB0cmFuc3BpbGVGb3IsXG5cdEZvckFzeW5jOiB0cmFuc3BpbGVGb3JBc3luYyxcblx0Rm9yQmFnOiB0cmFuc3BpbGVGb3JCYWcsXG5cdEZ1bjogdHJhbnNwaWxlRnVuLFxuXG5cdEdldHRlckZ1bigpIHtcblx0XHQvLyBfID0+IF8uZm9vXG5cdFx0cmV0dXJuIGZvY3VzRnVuKG1lbWJlclN0cmluZ09yVmFsKElkRm9jdXMsIHRoaXMubmFtZSkpXG5cdH0sXG5cblx0SWdub3JlKCkge1xuXHRcdHJldHVybiBbXVxuXHR9LFxuXG5cdEluc3RhbmNlT2YoKSB7XG5cdFx0Ly8gVE9ETzpFUzYgbmV3IEJpbmFyeUV4cHJlc3Npb24oJ2luc3RhbmNlb2YnLCB0MCh0aGlzLmluc3RhbmNlKSwgdDAodGhpcy50eXBlKSlcblx0XHRyZXR1cm4gbXNDYWxsKCdoYXNJbnN0YW5jZScsIHQwKHRoaXMudHlwZSksIHQwKHRoaXMuaW5zdGFuY2UpKVxuXHR9LFxuXG5cdExhenkoKSB7XG5cdFx0cmV0dXJuIGxhenlXcmFwKHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdE51bWJlckxpdGVyYWwoKSB7XG5cdFx0Ly8gTmVnYXRpdmUgbnVtYmVycyBhcmUgbm90IHBhcnQgb2YgRVMgc3BlYy5cblx0XHQvLyBodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNS4xLyNzZWMtNy44LjNcblx0XHRjb25zdCB2YWx1ZSA9IE51bWJlcih0aGlzLnZhbHVlKVxuXHRcdGNvbnN0IGxpdCA9IG5ldyBMaXRlcmFsKE1hdGguYWJzKHZhbHVlKSlcblx0XHRjb25zdCBpc1Bvc2l0aXZlID0gdmFsdWUgPj0gMCAmJiAxIC8gdmFsdWUgIT09IC1JbmZpbml0eVxuXHRcdHJldHVybiBpc1Bvc2l0aXZlID8gbGl0IDogbmV3IFVuYXJ5RXhwcmVzc2lvbignLScsIGxpdClcblx0fSxcblxuXHRMb2NhbEFjY2VzcygpIHtcblx0XHRpZiAodGhpcy5uYW1lID09PSAndGhpcycpXG5cdFx0XHRyZXR1cm4gSWRMZXhpY2FsVGhpc1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgbGQgPSB2ZXJpZnlSZXN1bHRzLmxvY2FsRGVjbGFyZUZvckFjY2Vzcyh0aGlzKVxuXHRcdFx0Ly8gSWYgbGQgbWlzc2luZywgdGhpcyBpcyBhIGJ1aWx0aW4sIGFuZCBidWlsdGlucyBhcmUgbmV2ZXIgbGF6eVxuXHRcdFx0cmV0dXJuIGxkID09PSB1bmRlZmluZWQgPyBpZGVudGlmaWVyKHRoaXMubmFtZSkgOiBhY2Nlc3NMb2NhbERlY2xhcmUobGQpXG5cdFx0fVxuXHR9LFxuXG5cdExvY2FsRGVjbGFyZSgpIHtcblx0XHRyZXR1cm4gbmV3IElkZW50aWZpZXIoaWRGb3JEZWNsYXJlQ2FjaGVkKHRoaXMpLm5hbWUpXG5cdH0sXG5cblx0TG9jYWxNdXRhdGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIGlkZW50aWZpZXIodGhpcy5uYW1lKSwgdDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0TG9naWMoKSB7XG5cdFx0Y29uc3Qgb3AgPSB0aGlzLmtpbmQgPT09IExvZ2ljcy5BbmQgPyAnJiYnIDogJ3x8J1xuXHRcdHJldHVybiB0YWlsKHRoaXMuYXJncykucmVkdWNlKFxuXHRcdFx0KGEsIGIpID0+IG5ldyBMb2dpY2FsRXhwcmVzc2lvbihvcCwgYSwgdDAoYikpLFxuXHRcdFx0dDAodGhpcy5hcmdzWzBdKSlcblx0fSxcblxuXHRNYXBFbnRyeSgpIHtcblx0XHRyZXR1cm4gbXNDYWxsKCdzZXRTdWInLCBJZEJ1aWx0LCB0MCh0aGlzLmtleSksIHQwKHRoaXMudmFsKSlcblx0fSxcblxuXHRNZW1iZXIoKSB7XG5cdFx0cmV0dXJuIG1lbWJlclN0cmluZ09yVmFsKHQwKHRoaXMub2JqZWN0KSwgdGhpcy5uYW1lKVxuXHR9LFxuXG5cdE1lbWJlckZ1bigpIHtcblx0XHRjb25zdCBuYW1lID0gdHJhbnNwaWxlTmFtZSh0aGlzLm5hbWUpXG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wT2JqZWN0LFxuXHRcdFx0XyA9PiBtc0NhbGwoJ21ldGhvZEJvdW5kJywgdDAoXyksIG5hbWUpLFxuXHRcdFx0KCkgPT4gbXNDYWxsKCdtZXRob2RVbmJvdW5kJywgbmFtZSkpXG5cdH0sXG5cblx0TWVtYmVyU2V0KCkge1xuXHRcdGNvbnN0IG9iaiA9IHQwKHRoaXMub2JqZWN0KVxuXHRcdGNvbnN0IHZhbCA9IG1heWJlV3JhcEluQ2hlY2tJbnN0YW5jZSh0MCh0aGlzLnZhbHVlKSwgdGhpcy5vcFR5cGUsIHRoaXMubmFtZSlcblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTZXR0ZXJzLkluaXQ6XG5cdFx0XHRcdHJldHVybiBtc0NhbGwoJ25ld1Byb3BlcnR5Jywgb2JqLCB0cmFuc3BpbGVOYW1lKHRoaXMubmFtZSksIHZhbClcblx0XHRcdGNhc2UgU2V0dGVycy5NdXRhdGU6XG5cdFx0XHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXJTdHJpbmdPclZhbChvYmosIHRoaXMubmFtZSksIHZhbClcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0fVxuXHR9LFxuXG5cdE1ldGhvZCgpIHtcblx0XHRjb25zdCBuYW1lID0gbmV3IExpdGVyYWwodmVyaWZ5UmVzdWx0cy5uYW1lKHRoaXMpKVxuXHRcdGNvbnN0IGFyZ3MgPSB0aGlzLmZ1bi5vcFJlc3RBcmcgPT09IG51bGwgP1xuXHRcdFx0bmV3IEFycmF5RXhwcmVzc2lvbih0aGlzLmZ1bi5hcmdzLm1hcChhcmcgPT4ge1xuXHRcdFx0XHRjb25zdCBuYW1lID0gbmV3IExpdGVyYWwoYXJnLm5hbWUpXG5cdFx0XHRcdGNvbnN0IG9wVHlwZSA9IG9wTWFwKGFyZy5vcFR5cGUsIHQwKVxuXHRcdFx0XHRyZXR1cm4gaWZFbHNlKG9wVHlwZSxcblx0XHRcdFx0XHRfID0+IG5ldyBBcnJheUV4cHJlc3Npb24oW25hbWUsIF9dKSxcblx0XHRcdFx0XHQoKSA9PiBuYW1lKVxuXHRcdFx0fSkpIDpcblx0XHRcdG5ldyBVbmFyeUV4cHJlc3Npb24oJ3ZvaWQnLCBuZXcgTGl0ZXJhbCgwKSlcblx0XHRjb25zdCBpbXBsID0gdGhpcy5mdW4gaW5zdGFuY2VvZiBGdW4gPyBbdDAodGhpcy5mdW4pXSA6IFtdXG5cdFx0cmV0dXJuIG1zQ2FsbCgnbWV0aG9kJywgbmFtZSwgYXJncywgLi4uaW1wbClcblx0fSxcblxuXHRNb2R1bGU6IHRyYW5zcGlsZU1vZHVsZSxcblxuXHRNc1JlZ0V4cCgpIHtcblx0XHRyZXR1cm4gdGhpcy5wYXJ0cy5sZW5ndGggPT09IDAgP1xuXHRcdFx0bmV3IExpdGVyYWwobmV3IFJlZ0V4cCgnJywgdGhpcy5mbGFncykpIDpcblx0XHRcdHRoaXMucGFydHMubGVuZ3RoID09PSAxICYmIHR5cGVvZiB0aGlzLnBhcnRzWzBdID09PSAnc3RyaW5nJyA/XG5cdFx0XHRuZXcgTGl0ZXJhbChuZXcgUmVnRXhwKHRoaXMucGFydHNbMF0ucmVwbGFjZSgnXFxuJywgJ1xcXFxuJyksIHRoaXMuZmxhZ3MpKSA6XG5cdFx0XHRtc0NhbGwoJ3JlZ2V4cCcsXG5cdFx0XHRcdG5ldyBBcnJheUV4cHJlc3Npb24odGhpcy5wYXJ0cy5tYXAodHJhbnNwaWxlTmFtZSkpLCBuZXcgTGl0ZXJhbCh0aGlzLmZsYWdzKSlcblx0fSxcblxuXHROZXcoKSB7XG5cdFx0cmV0dXJuIG5ldyBOZXdFeHByZXNzaW9uKHQwKHRoaXMudHlwZSksIHRoaXMuYXJncy5tYXAodDApKVxuXHR9LFxuXG5cdE5vdCgpIHtcblx0XHRyZXR1cm4gbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIHQwKHRoaXMuYXJnKSlcblx0fSxcblxuXHRPYmpFbnRyeUFzc2lnbigpIHtcblx0XHRpZiAodGhpcy5hc3NpZ24gaW5zdGFuY2VvZiBBc3NpZ25TaW5nbGUgJiYgIXRoaXMuYXNzaWduLmFzc2lnbmVlLmlzTGF6eSgpKSB7XG5cdFx0XHRjb25zdCBuYW1lID0gdGhpcy5hc3NpZ24uYXNzaWduZWUubmFtZVxuXHRcdFx0cmV0dXJuIHQxKHRoaXMuYXNzaWduLCB2YWwgPT5cblx0XHRcdFx0dmVyaWZ5UmVzdWx0cy5pc09iakVudHJ5RXhwb3J0KHRoaXMpID9cblx0XHRcdFx0XHRleHBvcnROYW1lZE9yRGVmYXVsdCh2YWwsIG5hbWUpIDpcblx0XHRcdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRCdWlsdCwgbmFtZSksIHZhbCkpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IGFzc2lnbnMgPSB0aGlzLmFzc2lnbi5hbGxBc3NpZ25lZXMoKS5tYXAoXyA9PlxuXHRcdFx0XHRtc0NhbGwoJ3NldExhenknLCBJZEJ1aWx0LCBuZXcgTGl0ZXJhbChfLm5hbWUpLCBpZEZvckRlY2xhcmVDYWNoZWQoXykpKVxuXHRcdFx0cmV0dXJuIGNhdCh0MCh0aGlzLmFzc2lnbiksIGFzc2lnbnMpXG5cdFx0fVxuXHR9LFxuXG5cdE9iakVudHJ5UGxhaW4oKSB7XG5cdFx0Y29uc3QgdmFsID0gdDAodGhpcy52YWx1ZSlcblx0XHRyZXR1cm4gdmVyaWZ5UmVzdWx0cy5pc09iakVudHJ5RXhwb3J0KHRoaXMpID9cblx0XHRcdC8vIFdlJ3ZlIHZlcmlmaWVkIHRoYXQgZm9yIG1vZHVsZSBleHBvcnQsIHRoaXMubmFtZSBtdXN0IGJlIGEgc3RyaW5nLlxuXHRcdFx0ZXhwb3J0TmFtZWRPckRlZmF1bHQodmFsLCB0aGlzLm5hbWUpIDpcblx0XHRcdG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlclN0cmluZ09yVmFsKElkQnVpbHQsIHRoaXMubmFtZSksIHZhbClcblx0fSxcblxuXHRPYmpTaW1wbGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBPYmplY3RFeHByZXNzaW9uKHRoaXMucGFpcnMubWFwKHBhaXIgPT5cblx0XHRcdG5ldyBQcm9wZXJ0eSgnaW5pdCcsIHByb3BlcnR5SWRPckxpdGVyYWwocGFpci5rZXkpLCB0MChwYWlyLnZhbHVlKSkpKVxuXHR9LFxuXG5cdFBhc3MoKSB7XG5cdFx0cmV0dXJuIHQwKHRoaXMuaWdub3JlZClcblx0fSxcblxuXHRQaXBlKCkge1xuXHRcdHJldHVybiB0aGlzLnBpcGVzLnJlZHVjZSgoZXhwciwgcGlwZSkgPT4gY2FsbEZvY3VzRnVuKHQwKHBpcGUpLCBleHByKSwgdDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0UXVvdGVQbGFpbjogdHJhbnNwaWxlUXVvdGVQbGFpbixcblxuXHRRdW90ZVNpbXBsZSgpIHtcblx0XHRyZXR1cm4gbmV3IExpdGVyYWwodGhpcy5uYW1lKVxuXHR9LFxuXG5cdFF1b3RlVGFnZ2VkVGVtcGxhdGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBUYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb24odDAodGhpcy50YWcpLCB0MCh0aGlzLnF1b3RlKSlcblx0fSxcblxuXHRSYW5nZSgpIHtcblx0XHRjb25zdCBlbmQgPSBpZkVsc2UodGhpcy5lbmQsIHQwLCAoKSA9PiBHbG9iYWxJbmZpbml0eSlcblx0XHRyZXR1cm4gbXNDYWxsKCdyYW5nZScsIHQwKHRoaXMuc3RhcnQpLCBlbmQsIG5ldyBMaXRlcmFsKHRoaXMuaXNFeGNsdXNpdmUpKVxuXHR9LFxuXG5cdFNldFN1YigpIHtcblx0XHRjb25zdCBnZXRLaW5kID0gKCkgPT4ge1xuXHRcdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBTZXR0ZXJzLkluaXQ6XG5cdFx0XHRcdFx0cmV0dXJuICdpbml0J1xuXHRcdFx0XHRjYXNlIFNldHRlcnMuTXV0YXRlOlxuXHRcdFx0XHRcdHJldHVybiAnbXV0YXRlJ1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNvbnN0IGtpbmQgPSBnZXRLaW5kKClcblx0XHRyZXR1cm4gbXNDYWxsKFxuXHRcdFx0J3NldFN1YicsXG5cdFx0XHR0MCh0aGlzLm9iamVjdCksXG5cdFx0XHR0aGlzLnN1YmJlZHMubGVuZ3RoID09PSAxID8gdDAodGhpcy5zdWJiZWRzWzBdKSA6IHRoaXMuc3ViYmVkcy5tYXAodDApLFxuXHRcdFx0bWF5YmVXcmFwSW5DaGVja0luc3RhbmNlKHQwKHRoaXMudmFsdWUpLCB0aGlzLm9wVHlwZSwgJ3ZhbHVlJyksXG5cdFx0XHRuZXcgTGl0ZXJhbChraW5kKSlcblx0fSxcblxuXHRTaW1wbGVGdW4oKSB7XG5cdFx0cmV0dXJuIGZvY3VzRnVuKHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdFNwZWNpYWxEbzogdHJhbnNwaWxlU3BlY2lhbERvLFxuXHRTcGVjaWFsVmFsOiB0cmFuc3BpbGVTcGVjaWFsVmFsLFxuXG5cdFNwcmVhZCgpIHtcblx0XHRyZXR1cm4gbmV3IFNwcmVhZEVsZW1lbnQodDAodGhpcy5zcHJlYWRlZCkpXG5cdH0sXG5cblx0U3ViKCkge1xuXHRcdHJldHVybiBtc0NhbGwoJ3N1YicsIHQwKHRoaXMuc3ViYmVkKSwgLi4udGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0U3VwZXJDYWxsKCkge1xuXHRcdGNvbnN0IGFyZ3MgPSB0aGlzLmFyZ3MubWFwKHQwKVxuXHRcdGNvbnN0IG1ldGhvZCA9IHZlcmlmeVJlc3VsdHMuc3VwZXJDYWxsVG9NZXRob2QuZ2V0KHRoaXMpXG5cblx0XHRpZiAobWV0aG9kIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpIHtcblx0XHRcdC8vIHN1cGVyIG11c3QgYXBwZWFyIGFzIGEgc3RhdGVtZW50LCBzbyBPSyB0byBkZWNhbHJlIGB0aGlzYFxuXHRcdFx0Y29uc3QgY2FsbCA9IG5ldyBDYWxsRXhwcmVzc2lvbihJZFN1cGVyLCBhcmdzKVxuXHRcdFx0Y29uc3QgbWVtYmVyU2V0cyA9IGNvbnN0cnVjdG9yU2V0TWVtYmVycyhtZXRob2QpXG5cdFx0XHRyZXR1cm4gY2F0KGNhbGwsIG1lbWJlclNldHMsIFNldExleGljYWxUaGlzKVxuXHRcdH0gZWxzZVxuXHRcdFx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbihtZW1iZXJTdHJpbmdPclZhbChJZFN1cGVyLCBtZXRob2Quc3ltYm9sKSwgYXJncylcblx0fSxcblxuXHRTdXBlck1lbWJlcigpIHtcblx0XHRyZXR1cm4gbWVtYmVyU3RyaW5nT3JWYWwoSWRTdXBlciwgdGhpcy5uYW1lKVxuXHR9LFxuXG5cdFN3aXRjaDogdHJhbnNwaWxlU3dpdGNoLFxuXHRTd2l0Y2hQYXJ0OiB0cmFuc3BpbGVTd2l0Y2hQYXJ0LFxuXG5cdFRocm93KCkge1xuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcFRocm93bixcblx0XHRcdF8gPT4gZG9UaHJvdyhfKSxcblx0XHRcdCgpID0+IG5ldyBUaHJvd1N0YXRlbWVudChuZXcgTmV3RXhwcmVzc2lvbihHbG9iYWxFcnJvciwgW0xpdFN0clRocm93XSkpKVxuXHR9LFxuXG5cdFRyYWl0OiB0cmFuc3BpbGVUcmFpdCxcblx0VHJhaXREbzogdHJhbnNwaWxlVHJhaXREbyxcblxuXHRXaXRoKCkge1xuXHRcdGNvbnN0IGlkRGVjbGFyZSA9IGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzLmRlY2xhcmUpXG5cdFx0Y29uc3QgdmFsID0gdDAodGhpcy52YWx1ZSlcblx0XHRjb25zdCBsZWFkID0gcGxhaW5MZXQoaWREZWNsYXJlLCB2YWwpXG5cdFx0cmV0dXJuIHZlcmlmeVJlc3VsdHMuaXNTdGF0ZW1lbnQodGhpcykgP1xuXHRcdFx0dDEodGhpcy5ibG9jaywgbGVhZCkgOlxuXHRcdFx0YmxvY2tXcmFwKHQzKHRoaXMuYmxvY2ssIGxlYWQsIG51bGwsIG5ldyBSZXR1cm5TdGF0ZW1lbnQoaWREZWNsYXJlKSkpXG5cdH0sXG5cblx0WWllbGQoKSB7XG5cdFx0cmV0dXJuIG5ldyBZaWVsZEV4cHJlc3Npb24ob3BNYXAodGhpcy5vcFZhbHVlLCB0MCksIGZhbHNlKVxuXHR9LFxuXG5cdFlpZWxkVG8oKSB7XG5cdFx0cmV0dXJuIG5ldyBZaWVsZEV4cHJlc3Npb24odDAodGhpcy52YWx1ZSksIHRydWUpXG5cdH1cbn0pXG5cbmNvbnN0IEdsb2JhbEluZmluaXR5ID0gbmV3IElkZW50aWZpZXIoJ0luZmluaXR5JylcbmNvbnN0IExpdFN0clRocm93ID0gbmV3IExpdGVyYWwoJ0FuIGVycm9yIG9jY3VycmVkLicpXG4iXX0=
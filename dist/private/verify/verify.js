'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', '../util', './context', './locals', './SK', './util', './verifyBlock'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./context'), require('./locals'), require('./SK'), require('./util'), require('./verifyBlock'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.util, global.context, global.locals, global.SK, global.util, global.verifyBlock);
		global.verify = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _util, _context2, _locals, _SK, _util2, _verifyBlock) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = verify;

	var MsAstTypes = _interopRequireWildcard(_MsAst);

	var _SK2 = _interopRequireDefault(_SK);

	var _verifyBlock2 = _interopRequireDefault(_verifyBlock);

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

	function verify(msAst) {
		(0, _context2.setup)();
		msAst.verify();
		(0, _locals.warnUnusedLocals)();
		const res = _context2.results;
		(0, _context2.tearDown)();
		return res;
	}

	(0, _util.implementMany)(MsAstTypes, 'verify', {
		Assert(sk) {
			(0, _SK.checkDo)(this, sk);
			this.condition.verify(_SK2.default.Val);
			(0, _util2.verifyOp)(this.opThrown, _SK2.default.Val);
		},

		AssignSingle(sk) {
			(0, _SK.checkDo)(this, sk);
			(0, _context2.withName)(this.assignee.name, () => {
				const doV = () => {
					if (this.value instanceof _MsAst.Class || this.value instanceof _MsAst.Fun || this.value instanceof _MsAst.Method || this.value instanceof _MsAst.Trait) (0, _util2.setName)(this.value);
					this.assignee.verify();
					this.value.verify(_SK2.default.Val);
				};

				if (this.assignee.isLazy()) (0, _locals.withBlockLocals)(doV);else doV();
			});
		},

		AssignDestructure(sk) {
			(0, _SK.checkDo)(this, sk);
			(0, _util2.verifyEach)(this.assignees);
			this.value.verify(_SK2.default.Val);
		},

		Await(_sk) {
			(0, _context.check)(_context2.funKind === _MsAst.Funs.Async, this.loc, 'misplacedAwait');
			this.value.verify(_SK2.default.Val);
		},

		BagEntry(sk) {
			(0, _SK.checkDo)(this, sk);
			(0, _locals.accessLocal)(this, 'built');
			this.value.verify(_SK2.default.Val);
		},

		BagSimple(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _util2.verifyEachValOrSpread)(this.parts, _SK2.default.Val);
		},

		Block: _verifyBlock2.default,

		BlockWrap(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _context2.withIife)(() => this.block.verify(sk));
		},

		Break(sk) {
			(0, _SK.checkDo)(this, sk);
			(0, _util2.verifyOp)(this.opValue, _SK2.default.Val);
			(0, _context.check)(_context2.opLoop !== null, this.loc, 'misplacedBreak');
			const loop = _context2.opLoop;
			if (loop instanceof _MsAst.For) {
				if (_context2.results.isStatement(loop)) (0, _context.check)(this.opValue === null, this.loc, 'breakCantHaveValue');else (0, _context.check)(this.opValue !== null, this.loc, 'breakNeedsValue');
			} else {
				(0, _util.assert)(loop instanceof _MsAst.ForBag);
				(0, _context.check)(this.opValue === null, this.loc, 'breakValInForBag');
			}

			if (_context2.isInSwitch) {
				_context2.results.loopsNeedingLabel.add(loop);

				_context2.results.breaksInSwitch.add(this);
			}
		},

		Call(_sk) {
			this.called.verify(_SK2.default.Val);
			(0, _util2.verifyEachValOrSpread)(this.args);
		},

		Case(sk) {
			(0, _SK.markStatement)(this, sk);
			(0, _context2.withIifeIfVal)(sk, () => {
				const doIt = () => {
					(0, _util2.verifyEach)(this.parts, sk);
					(0, _util2.verifyOp)(this.opElse, sk);
				};

				(0, _util.ifElse)(this.opCased, _ => {
					_.verify(_SK2.default.Do);

					(0, _locals.verifyAndPlusLocal)(_.assignee, doIt);
				}, doIt);
			});
		},

		CasePart(sk) {
			if (this.test instanceof _MsAst.Pattern) {
				this.test.type.verify(_SK2.default.Val);
				this.test.patterned.verify(_SK2.default.Val);
				(0, _locals.verifyAndPlusLocals)(this.test.locals, () => this.result.verify(sk));
			} else {
				this.test.verify(_SK2.default.Val);
				this.result.verify(sk);
			}
		},

		Catch(sk) {
			(0, _util2.makeUseOptionalIfFocus)(this.caught);
			(0, _util2.verifyNotLazy)(this.caught, 'noLazyCatch');
			(0, _locals.verifyAndPlusLocal)(this.caught, () => {
				this.block.verify(sk);
			});
		},

		Class(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _util.opEach)(this.opFields, _util2.verifyEach);
			(0, _util2.verifyOp)(this.opSuperClass, _SK2.default.Val);
			(0, _util2.verifyEach)(this.traits, _SK2.default.Val);
			(0, _context2.withIife)(() => {
				(0, _util2.verifyOp)(this.opDo);
			});
			(0, _context2.withMethods)(() => {
				(0, _util2.verifyEach)(this.statics);
				(0, _util2.verifyOp)(this.opConstructor, this.opSuperClass !== null);
				(0, _util2.verifyEach)(this.methods);
			});
		},

		ClassTraitDo() {
			(0, _locals.verifyAndPlusLocal)(this.declareFocus, () => this.block.verify(_SK2.default.Do));
		},

		Cond(sk) {
			this.test.verify(_SK2.default.Val);
			this.ifTrue.verify(sk);
			this.ifFalse.verify(sk);
		},

		Conditional(sk) {
			(0, _SK.markStatement)(this, sk);
			this.test.verify(_SK2.default.Val);
			(0, _context2.withIifeIf)(this.result instanceof _MsAst.Block && sk === _SK2.default.Val, () => {
				this.result.verify(sk);
			});
		},

		Constructor(classHasSuper) {
			(0, _util2.makeUseOptional)(this.fun.opDeclareThis);
			(0, _context2.withMethod)(this, () => {
				this.fun.verify(_SK2.default.Val);
			});

			const superCall = _context2.results.constructorToSuper.get(this);

			if (classHasSuper) (0, _context.check)(superCall !== undefined, this.loc, 'superNeeded');else (0, _context.check)(superCall === undefined, () => superCall.loc, 'superForbidden');

			for (const _ of this.memberArgs) (0, _locals.setDeclareAccessed)(_, this);
		},

		Del(_sk) {
			this.subbed.verify(_SK2.default.Val);
			(0, _util2.verifyEach)(this.args, _SK2.default.Val);
		},

		Except(sk) {
			(0, _SK.markStatement)(this, sk);
			if (this.opElse === null) this.try.verify(sk);else {
				(0, _locals.plusLocals)((0, _verifyBlock.verifyDoBlock)(this.try), () => this.opElse.verify(sk));
				if ((0, _util.isEmpty)(this.allCatches)) (0, _context.warn)(this.loc, 'elseRequiresCatch');
			}
			if ((0, _util.isEmpty)(this.allCatches) && this.opFinally === null) (0, _context.warn)(this.loc, 'uselessExcept');
			(0, _util2.verifyEach)(this.typedCatches, sk);
			(0, _util2.verifyOp)(this.opCatchAll, sk);
			(0, _util2.verifyOp)(this.opFinally, _SK2.default.Do);
		},

		Field() {
			(0, _util2.verifyOp)(this.opType, _SK2.default.Val);
		},

		For(sk) {
			(0, _SK.markStatement)(this, sk);
			verifyFor(this);
		},

		ForAsync(sk) {
			(0, _SK.markStatement)(this, sk);
			(0, _context.check)(sk !== _SK2.default.Do || _context2.funKind === _MsAst.Funs.Async, this.loc, 'forAsyncNeedsAsync');
			withVerifyIteratee(this.iteratee, () => {
				(0, _context2.withFun)(_MsAst.Funs.Async, () => {
					this.block.verify((0, _SK.getSK)(this.block));
				});
			});
		},

		ForBag(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _locals.verifyAndPlusLocal)(this.built, () => verifyFor(this));
		},

		Fun(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _context.check)(this.opReturnType === null || !this.isDo, this.loc, 'doFuncCantHaveType');
			(0, _util2.verifyOp)(this.opReturnType, _SK2.default.Val);
			const args = (0, _util.cat)(this.opDeclareThis, this.args, this.opRestArg);
			(0, _context2.withFun)(this.kind, () => {
				(0, _locals.verifyAndPlusLocals)(args, () => {
					this.block.verify(this.isDo ? _SK2.default.Do : _SK2.default.Val);
				});
			});
		},

		FunAbstract() {
			(0, _util2.verifyEach)(this.args);
			(0, _util2.verifyOp)(this.opRestArg);
			(0, _util2.verifyOp)(this.opReturnType, _SK2.default.Val);
		},

		GetterFun(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _util2.verifyName)(this.name);
		},

		Ignore(sk) {
			(0, _SK.checkDo)(this, sk);

			for (const _ of this.ignoredNames) (0, _locals.accessLocal)(this, _);
		},

		Import() {
			function addUseLocal(_) {
				const prev = _context2.locals.get(_.name);

				if (prev !== undefined) (0, _context.fail)(_.loc, 'duplicateImport', _.name, prev.loc);
				(0, _locals.verifyLocalDeclare)(_);
				(0, _locals.setLocal)(_);
			}

			for (const _ of this.imported) addUseLocal(_);

			(0, _util.opEach)(this.opImportDefault, addUseLocal);
		},

		InstanceOf(sk) {
			(0, _SK.checkVal)(this, sk);
			this.instance.verify(_SK2.default.Val);
			this.type.verify(_SK2.default.Val);
		},

		Lazy(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _locals.withBlockLocals)(() => this.value.verify(_SK2.default.Val));
		},

		LocalAccess(sk) {
			(0, _SK.checkVal)(this, sk);

			const declare = _context2.locals.get(this.name);

			if (declare === undefined) {
				const builtinPath = _context.options.builtinNameToPath.get(this.name);

				if (builtinPath === undefined) (0, _locals.failMissingLocal)(this.loc, this.name);else {
					const names = _context2.results.builtinPathToNames.get(builtinPath);

					if (names === undefined) _context2.results.builtinPathToNames.set(builtinPath, new Set([this.name]));else names.add(this.name);
				}
			} else {
				_context2.results.localAccessToDeclare.set(this, declare);

				(0, _locals.setDeclareAccessed)(declare, this);
			}
		},

		LocalDeclare() {
			const builtinPath = _context.options.builtinNameToPath.get(this.name);

			if (builtinPath !== undefined) (0, _context.warn)(this.loc, 'overriddenBuiltin', this.name, builtinPath);
			(0, _util2.verifyOp)(this.opType, _SK2.default.Val);
		},

		LocalMutate(sk) {
			(0, _SK.checkDo)(this, sk);
			this.value.verify(_SK2.default.Val);
		},

		Logic(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _context.check)(this.args.length > 1, this.loc, 'logicNeedsArgs');
			(0, _util2.verifyEach)(this.args, _SK2.default.Val);
		},

		Not(sk) {
			(0, _SK.checkVal)(this, sk);
			this.arg.verify(_SK2.default.Val);
		},

		NumberLiteral(sk) {
			(0, _SK.checkVal)(this, sk);
		},

		MapEntry(sk) {
			(0, _SK.checkDo)(this, sk);
			(0, _locals.accessLocal)(this, 'built');
			this.key.verify(_SK2.default.Val);
			this.val.verify(_SK2.default.Val);
		},

		Member(sk) {
			(0, _SK.checkVal)(this, sk);
			this.object.verify(_SK2.default.Val);
			(0, _util2.verifyName)(this.name);
		},

		MemberFun(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _util2.verifyOp)(this.opObject, _SK2.default.Val);
			(0, _util2.verifyName)(this.name);
		},

		MemberSet(sk) {
			(0, _SK.checkDo)(this, sk);
			this.object.verify(_SK2.default.Val);
			(0, _util2.verifyName)(this.name);
			(0, _util2.verifyOp)(this.opType, _SK2.default.Val);
			this.value.verify(_SK2.default.Val);
		},

		Method(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _util2.makeUseOptional)(this.fun.opDeclareThis);
			this.fun.args.forEach(_util2.makeUseOptional);
			(0, _util.opEach)(this.fun.opRestArg, _util2.makeUseOptional);
			this.fun.verify(_SK2.default.Val);
		},

		MethodImpl() {
			verifyMethodImpl(this, () => {
				(0, _util2.makeUseOptional)(this.fun.opDeclareThis);
				this.fun.verify(_SK2.default.Val);
			});
		},

		MethodGetter() {
			verifyMethodImpl(this, () => {
				(0, _util2.makeUseOptional)(this.declareThis);
				(0, _locals.verifyAndPlusLocals)([this.declareThis], () => {
					this.block.verify(_SK2.default.Val);
				});
			});
		},

		MethodSetter() {
			verifyMethodImpl(this, () => {
				(0, _locals.verifyAndPlusLocals)([this.declareThis, this.declareFocus], () => {
					this.block.verify(_SK2.default.Do);
				});
			});
		},

		Module() {
			(0, _util2.verifyEach)(this.imports);
			(0, _context2.withName)(_context.pathOptions.moduleName(), () => {
				(0, _verifyBlock.verifyModuleLines)(this.lines, this.loc);
			});
		},

		MsRegExp(sk) {
			(0, _SK.checkVal)(this, sk);
			this.parts.forEach(_util2.verifyName);
			if (this.parts.length === 1 && typeof this.parts[0] === 'string') try {
				new RegExp(this.parts[0]);
			} catch (err) {
				if (!(err instanceof SyntaxError)) throw err;
				(0, _context.fail)(this.loc, 'badRegExp', this.parts[0]);
			}
		},

		New(sk) {
			(0, _SK.checkVal)(this, sk);
			this.type.verify(_SK2.default.Val);
			(0, _util2.verifyEachValOrSpread)(this.args, _SK2.default.val);
		},

		ObjEntryAssign(sk) {
			(0, _SK.checkDo)(this, sk);
			if (!_context2.results.isObjEntryExport(this)) (0, _locals.accessLocal)(this, 'built');
			this.assign.verify(_SK2.default.Do);

			for (const _ of this.assign.allAssignees()) (0, _locals.setDeclareAccessed)(_, this);
		},

		ObjEntryPlain(sk) {
			(0, _SK.checkDo)(this, sk);
			if (_context2.results.isObjEntryExport(this)) (0, _context.check)(typeof this.name === 'string', this.loc, 'exportName');else {
				(0, _locals.accessLocal)(this, 'built');
				(0, _util2.verifyName)(this.name);
			}
			this.value.verify(_SK2.default.Val);
		},

		ObjSimple(sk) {
			(0, _SK.checkVal)(this, sk);
			const keys = new Set();

			for (const _ref of this.pairs) {
				const key = _ref.key;
				const value = _ref.value;
				const loc = _ref.loc;
				(0, _context.check)(!keys.has(key), loc, 'duplicateKey', key);
				keys.add(key);
				value.verify(_SK2.default.Val);
			}
		},

		Pass(sk) {
			(0, _SK.checkDo)(this, sk);
			this.ignored.verify(_SK2.default.Val);
		},

		Pipe(sk) {
			(0, _SK.checkVal)(this, sk);
			this.value.verify();

			for (const pipe of this.pipes) (0, _locals.registerAndPlusLocal)(_MsAst.LocalDeclare.focus(this.loc), () => {
				pipe.verify(_SK2.default.Val);
			});
		},

		QuotePlain(sk) {
			(0, _SK.checkVal)(this, sk);
			this.parts.forEach(_util2.verifyName);
		},

		QuoteSimple(sk) {
			(0, _SK.checkVal)(this, sk);
		},

		QuoteTaggedTemplate(sk) {
			(0, _SK.checkVal)(this, sk);
			this.tag.verify(_SK2.default.Val);
			this.quote.verify(_SK2.default.Val);
		},

		Range(sk) {
			(0, _SK.checkVal)(this, sk);
			this.start.verify(_SK2.default.Val);
			(0, _util2.verifyOp)(this.end, _SK2.default.Val);
		},

		SetSub(sk) {
			(0, _SK.checkDo)(this, sk);
			this.object.verify(_SK2.default.Val);
			(0, _util2.verifyEach)(this.subbeds, _SK2.default.Val);
			(0, _util2.verifyOp)(this.opType, _SK2.default.Val);
			this.value.verify(_SK2.default.Val);
		},

		SimpleFun(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _context2.withFun)(_MsAst.Funs.Plain, () => {
				(0, _locals.registerAndPlusLocal)(_MsAst.LocalDeclare.focus(this.loc), () => {
					this.value.verify();
				});
			});
		},

		SpecialDo(sk) {
			(0, _SK.checkDo)(this, sk);
		},

		SpecialVal(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _util2.setName)(this);
		},

		Spread(sk) {
			if (sk !== null) (0, _context.fail)(this.loc, sk === _SK2.default.Val ? 'misplacedSpreadVal' : 'misplacedSpreadDo');
			this.spreaded.verify(_SK2.default.Val);
		},

		Sub(sk) {
			(0, _SK.checkVal)(this, sk);
			this.subbed.verify(_SK2.default.Val);
			(0, _util2.verifyEach)(this.args, _SK2.default.Val);
		},

		SuperCall(sk) {
			(0, _context.check)(_context2.method !== null, this.loc, 'superNeedsMethod');

			_context2.results.superCallToMethod.set(this, _context2.method);

			if (_context2.method instanceof _MsAst.Constructor) {
				(0, _context.check)(sk === _SK2.default.Do, this.loc, 'superMustBeStatement');

				_context2.results.constructorToSuper.set(_context2.method, this);
			}

			(0, _util2.verifyEach)(this.args, _SK2.default.Val);
		},

		SuperMember(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _context.check)(_context2.method !== null, this.loc, 'superNeedsMethod');
			(0, _util2.verifyName)(this.name);
		},

		Switch(sk) {
			(0, _SK.markStatement)(this, sk);
			(0, _context2.withIifeIfVal)(sk, () => {
				(0, _context2.withInSwitch)(true, () => {
					this.switched.verify(_SK2.default.Val);
					(0, _util2.verifyEach)(this.parts, sk);
					(0, _util2.verifyOp)(this.opElse, sk);
				});
			});
		},

		SwitchPart(sk) {
			(0, _SK.markStatement)(this, sk);
			(0, _util2.verifyEach)(this.values, _SK2.default.Val);
			this.result.verify(sk);
		},

		Throw() {
			(0, _util2.verifyOp)(this.opThrown, _SK2.default.Val);
		},

		Trait(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _util2.verifyEach)(this.superTraits, _SK2.default.Val);
			(0, _util2.verifyOp)(this.opDo, _SK2.default.Do);
			(0, _context2.withMethods)(() => {
				(0, _util2.verifyEach)(this.statics);
				(0, _util2.verifyEach)(this.methods);
			});
		},

		With(sk) {
			(0, _SK.markStatement)(this, sk);
			this.value.verify(_SK2.default.Val);
			(0, _context2.withIifeIfVal)(sk, () => {
				if (sk === _SK2.default.Val) (0, _util2.makeUseOptionalIfFocus)(this.declare);
				(0, _locals.verifyAndPlusLocal)(this.declare, () => {
					this.block.verify(_SK2.default.Do);
				});
			});
		},

		Yield(_sk) {
			(0, _context.check)(_context2.funKind === _MsAst.Funs.Generator, this.loc, 'misplacedYield', _Token.Keywords.Yield);
			(0, _util2.verifyOp)(this.opValue, _SK2.default.Val);
		},

		YieldTo(_sk) {
			(0, _context.check)(_context2.funKind === _MsAst.Funs.Generator, this.loc, 'misplacedYield', _Token.Keywords.YieldTo);
			this.value.verify(_SK2.default.Val);
		}

	});

	function verifyFor(forLoop) {
		function verifyForBlock() {
			(0, _context2.withLoop)(forLoop, () => {
				forLoop.block.verify(_SK2.default.Do);
			});
		}

		(0, _util.ifElse)(forLoop.opIteratee, _ => {
			withVerifyIteratee(_, verifyForBlock);
		}, verifyForBlock);
	}

	function withVerifyIteratee(_ref2, action) {
		let element = _ref2.element;
		let bag = _ref2.bag;
		bag.verify(_SK2.default.Val);
		(0, _util2.verifyNotLazy)(element, 'noLazyIteratee');
		(0, _locals.verifyAndPlusLocal)(element, action);
	}

	function verifyMethodImpl(_, doVerify) {
		(0, _util2.verifyName)(_.symbol);
		(0, _context2.withMethod)(_, doVerify);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQXNCd0IsTUFBTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQUFOLE1BQU0iLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVjaywgZmFpbCwgb3B0aW9ucywgcGF0aE9wdGlvbnMsIHdhcm59IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtCbG9jaywgQ2xhc3MsIENvbnN0cnVjdG9yLCBGb3IsIEZvckJhZywgRnVuLCBGdW5zLCBMb2NhbERlY2xhcmUsIE1ldGhvZCwgUGF0dGVybiwgVHJhaXRcblx0fSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7S2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHthc3NlcnQsIGNhdCwgaWZFbHNlLCBpbXBsZW1lbnRNYW55LCBpc0VtcHR5LCBvcEVhY2h9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2Z1bktpbmQsIGlzSW5Td2l0Y2gsIGxvY2FscywgbWV0aG9kLCBvcExvb3AsIHJlc3VsdHMsIHNldHVwLCB0ZWFyRG93biwgd2l0aEZ1biwgd2l0aElpZmUsXG5cdHdpdGhJaWZlSWYsIHdpdGhJaWZlSWZWYWwsIHdpdGhJblN3aXRjaCwgd2l0aE1ldGhvZCwgd2l0aE1ldGhvZHMsIHdpdGhMb29wLCB3aXRoTmFtZVxuXHR9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB7YWNjZXNzTG9jYWwsIGZhaWxNaXNzaW5nTG9jYWwsIHBsdXNMb2NhbHMsIHJlZ2lzdGVyQW5kUGx1c0xvY2FsLCBzZXREZWNsYXJlQWNjZXNzZWQsXG5cdHNldExvY2FsLCB2ZXJpZnlBbmRQbHVzTG9jYWwsIHZlcmlmeUFuZFBsdXNMb2NhbHMsIHZlcmlmeUxvY2FsRGVjbGFyZSwgd2FyblVudXNlZExvY2Fscyxcblx0d2l0aEJsb2NrTG9jYWxzfSBmcm9tICcuL2xvY2FscydcbmltcG9ydCBTSywge2NoZWNrRG8sIGNoZWNrVmFsLCBnZXRTSywgbWFya1N0YXRlbWVudH0gZnJvbSAnLi9TSydcbmltcG9ydCB7bWFrZVVzZU9wdGlvbmFsLCBtYWtlVXNlT3B0aW9uYWxJZkZvY3VzLCBzZXROYW1lLCB2ZXJpZnlFYWNoLCB2ZXJpZnlFYWNoVmFsT3JTcHJlYWQsXG5cdHZlcmlmeU5hbWUsIHZlcmlmeU5vdExhenksIHZlcmlmeU9wfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgdmVyaWZ5QmxvY2ssIHt2ZXJpZnlEb0Jsb2NrLCB2ZXJpZnlNb2R1bGVMaW5lc30gZnJvbSAnLi92ZXJpZnlCbG9jaydcblxuLyoqXG5HZW5lcmF0ZXMgaW5mb3JtYXRpb24gbmVlZGVkIGR1cmluZyB0cmFuc3BpbGluZywgdGhlIFZlcmlmeVJlc3VsdHMuXG5BbHNvIGNoZWNrcyBmb3IgZXhpc3RlbmNlIG9mIGxvY2FsIHZhcmlhYmxlcyBhbmQgd2FybnMgZm9yIHVudXNlZCBsb2NhbHMuXG5AcGFyYW0ge01zQXN0fSBtc0FzdFxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHZlcmlmeShtc0FzdCkge1xuXHRzZXR1cCgpXG5cdG1zQXN0LnZlcmlmeSgpXG5cdHdhcm5VbnVzZWRMb2NhbHMoKVxuXHRjb25zdCByZXMgPSByZXN1bHRzXG5cdHRlYXJEb3duKClcblx0cmV0dXJuIHJlc1xufVxuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICd2ZXJpZnknLCB7XG5cdEFzc2VydChzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0dGhpcy5jb25kaXRpb24udmVyaWZ5KFNLLlZhbClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVGhyb3duLCBTSy5WYWwpXG5cdH0sXG5cblx0QXNzaWduU2luZ2xlKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHR3aXRoTmFtZSh0aGlzLmFzc2lnbmVlLm5hbWUsICgpID0+IHtcblx0XHRcdGNvbnN0IGRvViA9ICgpID0+IHtcblx0XHRcdFx0Lypcblx0XHRcdFx0RnVuIGFuZCBDbGFzcyBvbmx5IGdldCBuYW1lIGlmIHRoZXkgYXJlIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBhc3NpZ25tZW50LlxuXHRcdFx0XHRzbyBpbiBgeCA9ICRhZnRlci10aW1lIDEwMDAgfGAgdGhlIGZ1bmN0aW9uIGlzIG5vdCBuYW1lZC5cblx0XHRcdFx0Ki9cblx0XHRcdFx0aWYgKHRoaXMudmFsdWUgaW5zdGFuY2VvZiBDbGFzcyB8fFxuXHRcdFx0XHRcdHRoaXMudmFsdWUgaW5zdGFuY2VvZiBGdW4gfHxcblx0XHRcdFx0XHR0aGlzLnZhbHVlIGluc3RhbmNlb2YgTWV0aG9kIHx8XG5cdFx0XHRcdFx0dGhpcy52YWx1ZSBpbnN0YW5jZW9mIFRyYWl0KVxuXHRcdFx0XHRcdHNldE5hbWUodGhpcy52YWx1ZSlcblxuXHRcdFx0XHQvLyBBc3NpZ25lZSByZWdpc3RlcmVkIGJ5IHZlcmlmeUxpbmVzLlxuXHRcdFx0XHR0aGlzLmFzc2lnbmVlLnZlcmlmeSgpXG5cdFx0XHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLmFzc2lnbmVlLmlzTGF6eSgpKVxuXHRcdFx0XHR3aXRoQmxvY2tMb2NhbHMoZG9WKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRkb1YoKVxuXHRcdH0pXG5cdH0sXG5cblx0QXNzaWduRGVzdHJ1Y3R1cmUoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdC8vIEFzc2lnbmVlcyByZWdpc3RlcmVkIGJ5IHZlcmlmeUxpbmVzLlxuXHRcdHZlcmlmeUVhY2godGhpcy5hc3NpZ25lZXMpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdEF3YWl0KF9zaykge1xuXHRcdGNoZWNrKGZ1bktpbmQgPT09IEZ1bnMuQXN5bmMsIHRoaXMubG9jLCAnbWlzcGxhY2VkQXdhaXQnKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRCYWdFbnRyeShzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0QmFnU2ltcGxlKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dmVyaWZ5RWFjaFZhbE9yU3ByZWFkKHRoaXMucGFydHMsIFNLLlZhbClcblx0fSxcblxuXHRCbG9jazogdmVyaWZ5QmxvY2ssXG5cblx0QmxvY2tXcmFwKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0d2l0aElpZmUoKCkgPT4gdGhpcy5ibG9jay52ZXJpZnkoc2spKVxuXHR9LFxuXG5cdEJyZWFrKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVmFsdWUsIFNLLlZhbClcblx0XHRjaGVjayhvcExvb3AgIT09IG51bGwsIHRoaXMubG9jLCAnbWlzcGxhY2VkQnJlYWsnKVxuXHRcdGNvbnN0IGxvb3AgPSBvcExvb3BcblxuXHRcdGlmIChsb29wIGluc3RhbmNlb2YgRm9yKVxuXHRcdFx0aWYgKHJlc3VsdHMuaXNTdGF0ZW1lbnQobG9vcCkpXG5cdFx0XHRcdGNoZWNrKHRoaXMub3BWYWx1ZSA9PT0gbnVsbCwgdGhpcy5sb2MsICdicmVha0NhbnRIYXZlVmFsdWUnKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRjaGVjayh0aGlzLm9wVmFsdWUgIT09IG51bGwsIHRoaXMubG9jLCAnYnJlYWtOZWVkc1ZhbHVlJylcblx0XHRlbHNlIHtcblx0XHRcdC8vIChGb3JBc3luYyBpc24ndCByZWFsbHkgYSBsb29wKVxuXHRcdFx0YXNzZXJ0KGxvb3AgaW5zdGFuY2VvZiBGb3JCYWcpXG5cdFx0XHRjaGVjayh0aGlzLm9wVmFsdWUgPT09IG51bGwsIHRoaXMubG9jLCAnYnJlYWtWYWxJbkZvckJhZycpXG5cdFx0fVxuXG5cdFx0aWYgKGlzSW5Td2l0Y2gpIHtcblx0XHRcdHJlc3VsdHMubG9vcHNOZWVkaW5nTGFiZWwuYWRkKGxvb3ApXG5cdFx0XHRyZXN1bHRzLmJyZWFrc0luU3dpdGNoLmFkZCh0aGlzKVxuXHRcdH1cblx0fSxcblxuXHRDYWxsKF9zaykge1xuXHRcdC8vIENhbGwgY2FuIGJlIGVpdGhlciBTSy5WYWwgb3IgU0suRG9cblx0XHR0aGlzLmNhbGxlZC52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeUVhY2hWYWxPclNwcmVhZCh0aGlzLmFyZ3MpXG5cdH0sXG5cblx0Q2FzZShzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0d2l0aElpZmVJZlZhbChzaywgKCkgPT4ge1xuXHRcdFx0Y29uc3QgZG9JdCA9ICgpID0+IHtcblx0XHRcdFx0dmVyaWZ5RWFjaCh0aGlzLnBhcnRzLCBzaylcblx0XHRcdFx0dmVyaWZ5T3AodGhpcy5vcEVsc2UsIHNrKVxuXHRcdFx0fVxuXHRcdFx0aWZFbHNlKHRoaXMub3BDYXNlZCxcblx0XHRcdFx0XyA9PiB7XG5cdFx0XHRcdFx0Xy52ZXJpZnkoU0suRG8pXG5cdFx0XHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKF8uYXNzaWduZWUsIGRvSXQpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRvSXQpXG5cdFx0fSlcblx0fSxcblxuXHRDYXNlUGFydChzaykge1xuXHRcdGlmICh0aGlzLnRlc3QgaW5zdGFuY2VvZiBQYXR0ZXJuKSB7XG5cdFx0XHR0aGlzLnRlc3QudHlwZS52ZXJpZnkoU0suVmFsKVxuXHRcdFx0dGhpcy50ZXN0LnBhdHRlcm5lZC52ZXJpZnkoU0suVmFsKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2Fscyh0aGlzLnRlc3QubG9jYWxzLCAoKSA9PiB0aGlzLnJlc3VsdC52ZXJpZnkoc2spKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnRlc3QudmVyaWZ5KFNLLlZhbClcblx0XHRcdHRoaXMucmVzdWx0LnZlcmlmeShzaylcblx0XHR9XG5cdH0sXG5cblx0Q2F0Y2goc2spIHtcblx0XHQvLyBObyBuZWVkIHRvIGRvIGFueXRoaW5nIHdpdGggYHNrYCBleGNlcHQgcGFzcyBpdCB0byBteSBibG9jay5cblx0XHRtYWtlVXNlT3B0aW9uYWxJZkZvY3VzKHRoaXMuY2F1Z2h0KVxuXHRcdHZlcmlmeU5vdExhenkodGhpcy5jYXVnaHQsICdub0xhenlDYXRjaCcpXG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuY2F1Z2h0LCAoKSA9PiB7XG5cdFx0XHR0aGlzLmJsb2NrLnZlcmlmeShzaylcblx0XHR9KVxuXHR9LFxuXG5cdENsYXNzKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0b3BFYWNoKHRoaXMub3BGaWVsZHMsIHZlcmlmeUVhY2gpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFN1cGVyQ2xhc3MsIFNLLlZhbClcblx0XHR2ZXJpZnlFYWNoKHRoaXMudHJhaXRzLCBTSy5WYWwpXG5cblx0XHR3aXRoSWlmZSgoKSA9PiB7XG5cdFx0XHR2ZXJpZnlPcCh0aGlzLm9wRG8pXG5cdFx0fSlcblxuXHRcdC8vIENsYXNzIGFjdHMgbGlrZSBhIEZ1bjogbG9vcC9nZW5lcmF0b3IgY29udGV4dCBpcyBsb3N0IGFuZCB3ZSBnZXQgYmxvY2sgbG9jYWxzLlxuXHRcdHdpdGhNZXRob2RzKCgpID0+IHtcblx0XHRcdHZlcmlmeUVhY2godGhpcy5zdGF0aWNzKVxuXHRcdFx0dmVyaWZ5T3AodGhpcy5vcENvbnN0cnVjdG9yLCB0aGlzLm9wU3VwZXJDbGFzcyAhPT0gbnVsbClcblx0XHRcdHZlcmlmeUVhY2godGhpcy5tZXRob2RzKVxuXHRcdH0pXG5cdFx0Ly8gbmFtZSBzZXQgYnkgQXNzaWduU2luZ2xlXG5cdH0sXG5cblx0Q2xhc3NUcmFpdERvKCkge1xuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmRlY2xhcmVGb2N1cywgKCkgPT4gdGhpcy5ibG9jay52ZXJpZnkoU0suRG8pKVxuXHR9LFxuXG5cdENvbmQoc2spIHtcblx0XHQvLyBDb3VsZCBiZSBhIHN0YXRlbWVudCBpZiBib3RoIHJlc3VsdHMgYXJlLlxuXHRcdHRoaXMudGVzdC52ZXJpZnkoU0suVmFsKVxuXHRcdHRoaXMuaWZUcnVlLnZlcmlmeShzaylcblx0XHR0aGlzLmlmRmFsc2UudmVyaWZ5KHNrKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsKHNrKSB7XG5cdFx0bWFya1N0YXRlbWVudCh0aGlzLCBzaylcblx0XHR0aGlzLnRlc3QudmVyaWZ5KFNLLlZhbClcblx0XHR3aXRoSWlmZUlmKHRoaXMucmVzdWx0IGluc3RhbmNlb2YgQmxvY2sgJiYgc2sgPT09IFNLLlZhbCwgKCkgPT4ge1xuXHRcdFx0dGhpcy5yZXN1bHQudmVyaWZ5KHNrKVxuXHRcdH0pXG5cdH0sXG5cblx0Q29uc3RydWN0b3IoY2xhc3NIYXNTdXBlcikge1xuXHRcdG1ha2VVc2VPcHRpb25hbCh0aGlzLmZ1bi5vcERlY2xhcmVUaGlzKVxuXHRcdHdpdGhNZXRob2QodGhpcywgKCkgPT4ge1xuXHRcdFx0dGhpcy5mdW4udmVyaWZ5KFNLLlZhbClcblx0XHR9KVxuXG5cdFx0Y29uc3Qgc3VwZXJDYWxsID0gcmVzdWx0cy5jb25zdHJ1Y3RvclRvU3VwZXIuZ2V0KHRoaXMpXG5cblx0XHRpZiAoY2xhc3NIYXNTdXBlcilcblx0XHRcdGNoZWNrKHN1cGVyQ2FsbCAhPT0gdW5kZWZpbmVkLCB0aGlzLmxvYywgJ3N1cGVyTmVlZGVkJylcblx0XHRlbHNlXG5cdFx0XHRjaGVjayhzdXBlckNhbGwgPT09IHVuZGVmaW5lZCwgKCkgPT4gc3VwZXJDYWxsLmxvYywgJ3N1cGVyRm9yYmlkZGVuJylcblxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLm1lbWJlckFyZ3MpXG5cdFx0XHRzZXREZWNsYXJlQWNjZXNzZWQoXywgdGhpcylcblx0fSxcblxuXHREZWwoX3NrKSB7XG5cdFx0Ly8gRGVsU3ViIGNhbiBiZSBlaXRoZXIgU0suVmFsIG9yIFNLLkRvXG5cdFx0dGhpcy5zdWJiZWQudmVyaWZ5KFNLLlZhbClcblx0XHR2ZXJpZnlFYWNoKHRoaXMuYXJncywgU0suVmFsKVxuXHR9LFxuXG5cdEV4Y2VwdChzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0aWYgKHRoaXMub3BFbHNlID09PSBudWxsKVxuXHRcdFx0dGhpcy50cnkudmVyaWZ5KHNrKVxuXHRcdGVsc2Uge1xuXHRcdFx0cGx1c0xvY2Fscyh2ZXJpZnlEb0Jsb2NrKHRoaXMudHJ5KSwgKCkgPT4gdGhpcy5vcEVsc2UudmVyaWZ5KHNrKSlcblx0XHRcdGlmIChpc0VtcHR5KHRoaXMuYWxsQ2F0Y2hlcykpXG5cdFx0XHRcdHdhcm4odGhpcy5sb2MsICdlbHNlUmVxdWlyZXNDYXRjaCcpXG5cdFx0fVxuXG5cdFx0aWYgKGlzRW1wdHkodGhpcy5hbGxDYXRjaGVzKSAmJiB0aGlzLm9wRmluYWxseSA9PT0gbnVsbClcblx0XHRcdHdhcm4odGhpcy5sb2MsICd1c2VsZXNzRXhjZXB0JylcblxuXHRcdHZlcmlmeUVhY2godGhpcy50eXBlZENhdGNoZXMsIHNrKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BDYXRjaEFsbCwgc2spXG5cdFx0dmVyaWZ5T3AodGhpcy5vcEZpbmFsbHksIFNLLkRvKVxuXHR9LFxuXG5cdEZpZWxkKCkge1xuXHRcdHZlcmlmeU9wKHRoaXMub3BUeXBlLCBTSy5WYWwpXG5cdH0sXG5cblx0Rm9yKHNrKSB7XG5cdFx0bWFya1N0YXRlbWVudCh0aGlzLCBzaylcblx0XHR2ZXJpZnlGb3IodGhpcylcblx0fSxcblxuXHRGb3JBc3luYyhzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0Y2hlY2soc2sgIT09IFNLLkRvIHx8IGZ1bktpbmQgPT09IEZ1bnMuQXN5bmMsIHRoaXMubG9jLCAnZm9yQXN5bmNOZWVkc0FzeW5jJylcblx0XHR3aXRoVmVyaWZ5SXRlcmF0ZWUodGhpcy5pdGVyYXRlZSwgKCkgPT4ge1xuXHRcdFx0d2l0aEZ1bihGdW5zLkFzeW5jLCAoKSA9PiB7XG5cdFx0XHRcdC8vIERlZmF1bHQgYmxvY2sgdG8gcmV0dXJuaW5nIGEgdmFsdWUsIGJ1dCBPSyBpZiBpdCBkb2Vzbid0LlxuXHRcdFx0XHQvLyBJZiBhIHN0YXRlbWVudCwgc3RhdGVtZW50LCB0aGUgY29tcGlsZWQgY29kZSB3aWxsIG1ha2UgYSBQcm9taXNlXG5cdFx0XHRcdC8vIHRoYXQgcmVzb2x2ZXMgdG8gYW4gYXJyYXkgZnVsbCBvZiBgdW5kZWZpbmVkYC5cblx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoZ2V0U0sodGhpcy5ibG9jaykpXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH0sXG5cblx0Rm9yQmFnKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuYnVpbHQsICgpID0+IHZlcmlmeUZvcih0aGlzKSlcblx0fSxcblxuXHRGdW4oc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRjaGVjayh0aGlzLm9wUmV0dXJuVHlwZSA9PT0gbnVsbCB8fCAhdGhpcy5pc0RvLCB0aGlzLmxvYywgJ2RvRnVuY0NhbnRIYXZlVHlwZScpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFJldHVyblR5cGUsIFNLLlZhbClcblx0XHRjb25zdCBhcmdzID0gY2F0KHRoaXMub3BEZWNsYXJlVGhpcywgdGhpcy5hcmdzLCB0aGlzLm9wUmVzdEFyZylcblx0XHR3aXRoRnVuKHRoaXMua2luZCwgKCkgPT4ge1xuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FscyhhcmdzLCAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuYmxvY2sudmVyaWZ5KHRoaXMuaXNEbyA/IFNLLkRvIDogU0suVmFsKVxuXHRcdFx0fSlcblx0XHR9KVxuXHRcdC8vIG5hbWUgc2V0IGJ5IEFzc2lnblNpbmdsZVxuXHR9LFxuXG5cdEZ1bkFic3RyYWN0KCkge1xuXHRcdHZlcmlmeUVhY2godGhpcy5hcmdzKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BSZXN0QXJnKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BSZXR1cm5UeXBlLCBTSy5WYWwpXG5cdH0sXG5cblx0R2V0dGVyRnVuKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdH0sXG5cblx0SWdub3JlKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5pZ25vcmVkTmFtZXMpXG5cdFx0XHRhY2Nlc3NMb2NhbCh0aGlzLCBfKVxuXHR9LFxuXG5cdEltcG9ydCgpIHtcblx0XHQvLyBTaW5jZSBVc2VzIGFyZSBhbHdheXMgaW4gdGhlIG91dGVybW9zdCBzY29wZSwgZG9uJ3QgaGF2ZSB0byB3b3JyeSBhYm91dCBzaGFkb3dpbmcuXG5cdFx0Ly8gU28gd2UgbXV0YXRlIGBsb2NhbHNgIGRpcmVjdGx5LlxuXHRcdGZ1bmN0aW9uIGFkZFVzZUxvY2FsKF8pIHtcblx0XHRcdGNvbnN0IHByZXYgPSBsb2NhbHMuZ2V0KF8ubmFtZSlcblx0XHRcdGlmIChwcmV2ICE9PSB1bmRlZmluZWQpXG5cdFx0XHRcdGZhaWwoXy5sb2MsICdkdXBsaWNhdGVJbXBvcnQnLCBfLm5hbWUsIHByZXYubG9jKVxuXHRcdFx0dmVyaWZ5TG9jYWxEZWNsYXJlKF8pXG5cdFx0XHRzZXRMb2NhbChfKVxuXHRcdH1cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5pbXBvcnRlZClcblx0XHRcdGFkZFVzZUxvY2FsKF8pXG5cdFx0b3BFYWNoKHRoaXMub3BJbXBvcnREZWZhdWx0LCBhZGRVc2VMb2NhbClcblx0fSxcblxuXHRJbnN0YW5jZU9mKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy5pbnN0YW5jZS52ZXJpZnkoU0suVmFsKVxuXHRcdHRoaXMudHlwZS52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdExhenkoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR3aXRoQmxvY2tMb2NhbHMoKCkgPT4gdGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKSlcblx0fSxcblxuXHRMb2NhbEFjY2Vzcyhzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdGNvbnN0IGRlY2xhcmUgPSBsb2NhbHMuZ2V0KHRoaXMubmFtZSlcblx0XHRpZiAoZGVjbGFyZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjb25zdCBidWlsdGluUGF0aCA9IG9wdGlvbnMuYnVpbHRpbk5hbWVUb1BhdGguZ2V0KHRoaXMubmFtZSlcblx0XHRcdGlmIChidWlsdGluUGF0aCA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRmYWlsTWlzc2luZ0xvY2FsKHRoaXMubG9jLCB0aGlzLm5hbWUpXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc3QgbmFtZXMgPSByZXN1bHRzLmJ1aWx0aW5QYXRoVG9OYW1lcy5nZXQoYnVpbHRpblBhdGgpXG5cdFx0XHRcdGlmIChuYW1lcyA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRcdHJlc3VsdHMuYnVpbHRpblBhdGhUb05hbWVzLnNldChidWlsdGluUGF0aCwgbmV3IFNldChbdGhpcy5uYW1lXSkpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRuYW1lcy5hZGQodGhpcy5uYW1lKVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHRzLmxvY2FsQWNjZXNzVG9EZWNsYXJlLnNldCh0aGlzLCBkZWNsYXJlKVxuXHRcdFx0c2V0RGVjbGFyZUFjY2Vzc2VkKGRlY2xhcmUsIHRoaXMpXG5cdFx0fVxuXHR9LFxuXG5cdC8vIEFkZGluZyBMb2NhbERlY2xhcmVzIHRvIHRoZSBhdmFpbGFibGUgbG9jYWxzIGlzIGRvbmUgYnkgRnVuIG9yIGxpbmVOZXdMb2NhbHMuXG5cdExvY2FsRGVjbGFyZSgpIHtcblx0XHRjb25zdCBidWlsdGluUGF0aCA9IG9wdGlvbnMuYnVpbHRpbk5hbWVUb1BhdGguZ2V0KHRoaXMubmFtZSlcblx0XHRpZiAoYnVpbHRpblBhdGggIT09IHVuZGVmaW5lZClcblx0XHRcdHdhcm4odGhpcy5sb2MsICdvdmVycmlkZGVuQnVpbHRpbicsIHRoaXMubmFtZSwgYnVpbHRpblBhdGgpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFR5cGUsIFNLLlZhbClcblx0fSxcblxuXHRMb2NhbE11dGF0ZShzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdExvZ2ljKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0Y2hlY2sodGhpcy5hcmdzLmxlbmd0aCA+IDEsIHRoaXMubG9jLCAnbG9naWNOZWVkc0FyZ3MnKVxuXHRcdHZlcmlmeUVhY2godGhpcy5hcmdzLCBTSy5WYWwpXG5cdH0sXG5cblx0Tm90KHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy5hcmcudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHROdW1iZXJMaXRlcmFsKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdH0sXG5cblx0TWFwRW50cnkoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdFx0dGhpcy5rZXkudmVyaWZ5KFNLLlZhbClcblx0XHR0aGlzLnZhbC52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdE1lbWJlcihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHRoaXMub2JqZWN0LnZlcmlmeShTSy5WYWwpXG5cdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdH0sXG5cblx0TWVtYmVyRnVuKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dmVyaWZ5T3AodGhpcy5vcE9iamVjdCwgU0suVmFsKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdE1lbWJlclNldChzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0dGhpcy5vYmplY3QudmVyaWZ5KFNLLlZhbClcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVHlwZSwgU0suVmFsKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRNZXRob2Qoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRtYWtlVXNlT3B0aW9uYWwodGhpcy5mdW4ub3BEZWNsYXJlVGhpcylcblx0XHR0aGlzLmZ1bi5hcmdzLmZvckVhY2gobWFrZVVzZU9wdGlvbmFsKVxuXHRcdG9wRWFjaCh0aGlzLmZ1bi5vcFJlc3RBcmcsIG1ha2VVc2VPcHRpb25hbClcblx0XHR0aGlzLmZ1bi52ZXJpZnkoU0suVmFsKVxuXHRcdC8vIG5hbWUgc2V0IGJ5IEFzc2lnblNpbmdsZVxuXHR9LFxuXG5cdE1ldGhvZEltcGwoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kSW1wbCh0aGlzLCAoKSA9PiB7XG5cdFx0XHRtYWtlVXNlT3B0aW9uYWwodGhpcy5mdW4ub3BEZWNsYXJlVGhpcylcblx0XHRcdHRoaXMuZnVuLnZlcmlmeShTSy5WYWwpXG5cdFx0fSlcblx0fSxcblx0TWV0aG9kR2V0dGVyKCkge1xuXHRcdHZlcmlmeU1ldGhvZEltcGwodGhpcywgKCkgPT4ge1xuXHRcdFx0bWFrZVVzZU9wdGlvbmFsKHRoaXMuZGVjbGFyZVRoaXMpXG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKFt0aGlzLmRlY2xhcmVUaGlzXSwgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeShTSy5WYWwpXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH0sXG5cdE1ldGhvZFNldHRlcigpIHtcblx0XHR2ZXJpZnlNZXRob2RJbXBsKHRoaXMsICgpID0+IHtcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoW3RoaXMuZGVjbGFyZVRoaXMsIHRoaXMuZGVjbGFyZUZvY3VzXSwgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeShTSy5Ebylcblx0XHRcdH0pXG5cdFx0fSlcblx0fSxcblxuXHRNb2R1bGUoKSB7XG5cdFx0Ly8gTm8gbmVlZCB0byB2ZXJpZnkgdGhpcy5kb0ltcG9ydHMuXG5cdFx0dmVyaWZ5RWFjaCh0aGlzLmltcG9ydHMpXG5cdFx0d2l0aE5hbWUocGF0aE9wdGlvbnMubW9kdWxlTmFtZSgpLCAoKSA9PiB7XG5cdFx0XHR2ZXJpZnlNb2R1bGVMaW5lcyh0aGlzLmxpbmVzLCB0aGlzLmxvYylcblx0XHR9KVxuXHR9LFxuXG5cdE1zUmVnRXhwKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy5wYXJ0cy5mb3JFYWNoKHZlcmlmeU5hbWUpXG5cdFx0Ly8gQ2hlY2sgUmVnRXhwIHZhbGlkaXR5OyBvbmx5IHBvc3NpYmxlIGlmIHRoaXMgaGFzIGEgc2luZ2xlIHBhcnQuXG5cdFx0aWYgKHRoaXMucGFydHMubGVuZ3RoID09PSAxICYmIHR5cGVvZiB0aGlzLnBhcnRzWzBdID09PSAnc3RyaW5nJylcblx0XHRcdHRyeSB7XG5cdFx0XHRcdC8qIGVzbGludC1kaXNhYmxlIG5vLW5ldyAqL1xuXHRcdFx0XHRuZXcgUmVnRXhwKHRoaXMucGFydHNbMF0pXG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0aWYgKCEoZXJyIGluc3RhbmNlb2YgU3ludGF4RXJyb3IpKVxuXHRcdFx0XHRcdC8vIFRoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbi5cblx0XHRcdFx0XHR0aHJvdyBlcnJcblx0XHRcdFx0ZmFpbCh0aGlzLmxvYywgJ2JhZFJlZ0V4cCcsIHRoaXMucGFydHNbMF0pXG5cdFx0XHR9XG5cdH0sXG5cblx0TmV3KHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy50eXBlLnZlcmlmeShTSy5WYWwpXG5cdFx0dmVyaWZ5RWFjaFZhbE9yU3ByZWFkKHRoaXMuYXJncywgU0sudmFsKVxuXHR9LFxuXG5cdE9iakVudHJ5QXNzaWduKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHRpZiAoIXJlc3VsdHMuaXNPYmpFbnRyeUV4cG9ydCh0aGlzKSlcblx0XHRcdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdFx0dGhpcy5hc3NpZ24udmVyaWZ5KFNLLkRvKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFzc2lnbi5hbGxBc3NpZ25lZXMoKSlcblx0XHRcdHNldERlY2xhcmVBY2Nlc3NlZChfLCB0aGlzKVxuXHR9LFxuXG5cdE9iakVudHJ5UGxhaW4oc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdGlmIChyZXN1bHRzLmlzT2JqRW50cnlFeHBvcnQodGhpcykpXG5cdFx0XHRjaGVjayh0eXBlb2YgdGhpcy5uYW1lID09PSAnc3RyaW5nJywgdGhpcy5sb2MsICdleHBvcnROYW1lJylcblx0XHRlbHNlIHtcblx0XHRcdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdFx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0XHR9XG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdE9ialNpbXBsZShzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdGNvbnN0IGtleXMgPSBuZXcgU2V0KClcblx0XHRmb3IgKGNvbnN0IHtrZXksIHZhbHVlLCBsb2N9IG9mIHRoaXMucGFpcnMpIHtcblx0XHRcdGNoZWNrKCFrZXlzLmhhcyhrZXkpLCBsb2MsICdkdXBsaWNhdGVLZXknLCBrZXkpXG5cdFx0XHRrZXlzLmFkZChrZXkpXG5cdFx0XHR2YWx1ZS52ZXJpZnkoU0suVmFsKVxuXHRcdH1cblx0fSxcblxuXHRQYXNzKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHR0aGlzLmlnbm9yZWQudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRQaXBlKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHRcdGZvciAoY29uc3QgcGlwZSBvZiB0aGlzLnBpcGVzKVxuXHRcdFx0cmVnaXN0ZXJBbmRQbHVzTG9jYWwoTG9jYWxEZWNsYXJlLmZvY3VzKHRoaXMubG9jKSwgKCkgPT4ge1xuXHRcdFx0XHRwaXBlLnZlcmlmeShTSy5WYWwpXG5cdFx0XHR9KVxuXHR9LFxuXG5cdFF1b3RlUGxhaW4oc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR0aGlzLnBhcnRzLmZvckVhY2godmVyaWZ5TmFtZSlcblx0fSxcblxuXHRRdW90ZVNpbXBsZShzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHR9LFxuXG5cdFF1b3RlVGFnZ2VkVGVtcGxhdGUoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR0aGlzLnRhZy52ZXJpZnkoU0suVmFsKVxuXHRcdHRoaXMucXVvdGUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRSYW5nZShzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHRoaXMuc3RhcnQudmVyaWZ5KFNLLlZhbClcblx0XHR2ZXJpZnlPcCh0aGlzLmVuZCwgU0suVmFsKVxuXHR9LFxuXG5cdFNldFN1Yihzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0dGhpcy5vYmplY3QudmVyaWZ5KFNLLlZhbClcblx0XHR2ZXJpZnlFYWNoKHRoaXMuc3ViYmVkcywgU0suVmFsKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BUeXBlLCBTSy5WYWwpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdFNpbXBsZUZ1bihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHdpdGhGdW4oRnVucy5QbGFpbiwgKCkgPT4ge1xuXHRcdFx0cmVnaXN0ZXJBbmRQbHVzTG9jYWwoTG9jYWxEZWNsYXJlLmZvY3VzKHRoaXMubG9jKSwgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH0sXG5cblx0U3BlY2lhbERvKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0fSxcblxuXHRTcGVjaWFsVmFsKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0c2V0TmFtZSh0aGlzKVxuXHR9LFxuXG5cdFNwcmVhZChzaykge1xuXHRcdGlmIChzayAhPT0gbnVsbClcblx0XHRcdGZhaWwodGhpcy5sb2MsIHNrID09PSBTSy5WYWwgPyAnbWlzcGxhY2VkU3ByZWFkVmFsJyA6ICdtaXNwbGFjZWRTcHJlYWREbycpXG5cdFx0dGhpcy5zcHJlYWRlZC52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdFN1Yihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHRoaXMuc3ViYmVkLnZlcmlmeShTSy5WYWwpXG5cdFx0dmVyaWZ5RWFjaCh0aGlzLmFyZ3MsIFNLLlZhbClcblx0fSxcblxuXHRTdXBlckNhbGwoc2spIHtcblx0XHRjaGVjayhtZXRob2QgIT09IG51bGwsIHRoaXMubG9jLCAnc3VwZXJOZWVkc01ldGhvZCcpXG5cdFx0cmVzdWx0cy5zdXBlckNhbGxUb01ldGhvZC5zZXQodGhpcywgbWV0aG9kKVxuXG5cdFx0aWYgKG1ldGhvZCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB7XG5cdFx0XHRjaGVjayhzayA9PT0gU0suRG8sIHRoaXMubG9jLCAnc3VwZXJNdXN0QmVTdGF0ZW1lbnQnKVxuXHRcdFx0cmVzdWx0cy5jb25zdHJ1Y3RvclRvU3VwZXIuc2V0KG1ldGhvZCwgdGhpcylcblx0XHR9XG5cblx0XHR2ZXJpZnlFYWNoKHRoaXMuYXJncywgU0suVmFsKVxuXHR9LFxuXG5cdFN1cGVyTWVtYmVyKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0Y2hlY2sobWV0aG9kICE9PSBudWxsLCB0aGlzLmxvYywgJ3N1cGVyTmVlZHNNZXRob2QnKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdFN3aXRjaChzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0d2l0aElpZmVJZlZhbChzaywgKCkgPT4ge1xuXHRcdFx0d2l0aEluU3dpdGNoKHRydWUsICgpID0+IHtcblx0XHRcdFx0dGhpcy5zd2l0Y2hlZC52ZXJpZnkoU0suVmFsKVxuXHRcdFx0XHR2ZXJpZnlFYWNoKHRoaXMucGFydHMsIHNrKVxuXHRcdFx0XHR2ZXJpZnlPcCh0aGlzLm9wRWxzZSwgc2spXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH0sXG5cblx0U3dpdGNoUGFydChzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0dmVyaWZ5RWFjaCh0aGlzLnZhbHVlcywgU0suVmFsKVxuXHRcdHRoaXMucmVzdWx0LnZlcmlmeShzaylcblx0fSxcblxuXHRUaHJvdygpIHtcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVGhyb3duLCBTSy5WYWwpXG5cdH0sXG5cblx0VHJhaXQoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR2ZXJpZnlFYWNoKHRoaXMuc3VwZXJUcmFpdHMsIFNLLlZhbClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wRG8sIFNLLkRvKVxuXHRcdHdpdGhNZXRob2RzKCgpID0+IHtcblx0XHRcdHZlcmlmeUVhY2godGhpcy5zdGF0aWNzKVxuXHRcdFx0dmVyaWZ5RWFjaCh0aGlzLm1ldGhvZHMpXG5cdFx0fSlcblx0XHQvLyBuYW1lIHNldCBieSBBc3NpZ25TaW5nbGVcblx0fSxcblxuXHRXaXRoKHNrKSB7XG5cdFx0bWFya1N0YXRlbWVudCh0aGlzLCBzaylcblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdFx0d2l0aElpZmVJZlZhbChzaywgKCkgPT4ge1xuXHRcdFx0aWYgKHNrID09PSBTSy5WYWwpXG5cdFx0XHRcdG1ha2VVc2VPcHRpb25hbElmRm9jdXModGhpcy5kZWNsYXJlKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuZGVjbGFyZSwgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeShTSy5Ebylcblx0XHRcdH0pXG5cdFx0fSlcblx0fSxcblxuXHRZaWVsZChfc2spIHtcblx0XHRjaGVjayhmdW5LaW5kID09PSBGdW5zLkdlbmVyYXRvciwgdGhpcy5sb2MsICdtaXNwbGFjZWRZaWVsZCcsIEtleXdvcmRzLllpZWxkKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BWYWx1ZSwgU0suVmFsKVxuXHR9LFxuXG5cdFlpZWxkVG8oX3NrKSB7XG5cdFx0Y2hlY2soZnVuS2luZCA9PT0gRnVucy5HZW5lcmF0b3IsIHRoaXMubG9jLCAnbWlzcGxhY2VkWWllbGQnLCBLZXl3b3Jkcy5ZaWVsZFRvKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fVxufSlcblxuLy8gSGVscGVycyBzcGVjaWZpYyB0byBjZXJ0YWluIE1zQXN0IHR5cGVzXG5cbmZ1bmN0aW9uIHZlcmlmeUZvcihmb3JMb29wKSB7XG5cdGZ1bmN0aW9uIHZlcmlmeUZvckJsb2NrKCkge1xuXHRcdHdpdGhMb29wKGZvckxvb3AsICgpID0+IHtcblx0XHRcdGZvckxvb3AuYmxvY2sudmVyaWZ5KFNLLkRvKVxuXHRcdH0pXG5cdH1cblx0aWZFbHNlKGZvckxvb3Aub3BJdGVyYXRlZSxcblx0XHRfID0+IHtcblx0XHRcdHdpdGhWZXJpZnlJdGVyYXRlZShfLCB2ZXJpZnlGb3JCbG9jaylcblx0XHR9LFxuXHRcdHZlcmlmeUZvckJsb2NrKVxufVxuXG5mdW5jdGlvbiB3aXRoVmVyaWZ5SXRlcmF0ZWUoe2VsZW1lbnQsIGJhZ30sIGFjdGlvbikge1xuXHRiYWcudmVyaWZ5KFNLLlZhbClcblx0dmVyaWZ5Tm90TGF6eShlbGVtZW50LCAnbm9MYXp5SXRlcmF0ZWUnKVxuXHR2ZXJpZnlBbmRQbHVzTG9jYWwoZWxlbWVudCwgYWN0aW9uKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlNZXRob2RJbXBsKF8sIGRvVmVyaWZ5KSB7XG5cdHZlcmlmeU5hbWUoXy5zeW1ib2wpXG5cdHdpdGhNZXRob2QoXywgZG9WZXJpZnkpXG59XG4iXX0=
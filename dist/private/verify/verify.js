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
					if (this.value instanceof _MsAst.Class || this.value instanceof _MsAst.Fun || this.value instanceof _MsAst.Method || this.value instanceof _MsAst.Kind) (0, _util2.setName)(this.value);
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
			(0, _util2.verifyEach)(this.kinds, _SK2.default.Val);
			(0, _util2.verifyOp)(this.opDo);
			(0, _util2.verifyEach)(this.statics);
			(0, _util2.verifyOp)(this.opConstructor, this.opSuperClass !== null);
			(0, _util2.verifyEach)(this.methods);
		},

		ClassKindDo() {
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

		InstanceOf(sk) {
			(0, _SK.checkVal)(this, sk);
			this.instance.verify(_SK2.default.Val);
			this.type.verify(_SK2.default.Val);
		},

		Kind(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _util2.verifyEach)(this.superKinds, _SK2.default.Val);
			(0, _util2.verifyOp)(this.opDo, _SK2.default.Do);
			(0, _util2.verifyEach)(this.statics);
			(0, _util2.verifyEach)(this.methods);
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
			(0, _locals.withBlockLocals)(() => {
				(0, _context2.withInFunKind)(_MsAst.Funs.Plain, () => {
					(0, _locals.registerAndPlusLocal)(_MsAst.LocalDeclare.focus(this.loc), () => {
						this.value.verify();
					});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQXNCd0IsTUFBTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQUFOLE1BQU0iLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVjaywgZmFpbCwgb3B0aW9ucywgcGF0aE9wdGlvbnMsIHdhcm59IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtCbG9jaywgQ2xhc3MsIENvbnN0cnVjdG9yLCBGb3IsIEZvckJhZywgRnVuLCBGdW5zLCBLaW5kLCBMb2NhbERlY2xhcmUsIE1ldGhvZCwgUGF0dGVyblxuXHR9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtLZXl3b3Jkc30gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2Fzc2VydCwgY2F0LCBpZkVsc2UsIGltcGxlbWVudE1hbnksIGlzRW1wdHksIG9wRWFjaH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7ZnVuS2luZCwgaXNJblN3aXRjaCwgbG9jYWxzLCBtZXRob2QsIG9wTG9vcCwgcmVzdWx0cywgc2V0dXAsIHRlYXJEb3duLCB3aXRoRnVuLCB3aXRoSWlmZSxcblx0d2l0aElpZmVJZiwgd2l0aElpZmVJZlZhbCwgd2l0aEluRnVuS2luZCwgd2l0aEluU3dpdGNoLCB3aXRoTWV0aG9kLCB3aXRoTG9vcCwgd2l0aE5hbWVcblx0fSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge2FjY2Vzc0xvY2FsLCBmYWlsTWlzc2luZ0xvY2FsLCBwbHVzTG9jYWxzLCByZWdpc3RlckFuZFBsdXNMb2NhbCwgc2V0RGVjbGFyZUFjY2Vzc2VkLFxuXHRzZXRMb2NhbCwgdmVyaWZ5QW5kUGx1c0xvY2FsLCB2ZXJpZnlBbmRQbHVzTG9jYWxzLCB2ZXJpZnlMb2NhbERlY2xhcmUsIHdhcm5VbnVzZWRMb2NhbHMsXG5cdHdpdGhCbG9ja0xvY2Fsc30gZnJvbSAnLi9sb2NhbHMnXG5pbXBvcnQgU0ssIHtjaGVja0RvLCBjaGVja1ZhbCwgZ2V0U0ssIG1hcmtTdGF0ZW1lbnR9IGZyb20gJy4vU0snXG5pbXBvcnQge21ha2VVc2VPcHRpb25hbCwgbWFrZVVzZU9wdGlvbmFsSWZGb2N1cywgc2V0TmFtZSwgdmVyaWZ5RWFjaCwgdmVyaWZ5RWFjaFZhbE9yU3ByZWFkLFxuXHR2ZXJpZnlOYW1lLCB2ZXJpZnlOb3RMYXp5LCB2ZXJpZnlPcH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHZlcmlmeUJsb2NrLCB7dmVyaWZ5RG9CbG9jaywgdmVyaWZ5TW9kdWxlTGluZXN9IGZyb20gJy4vdmVyaWZ5QmxvY2snXG5cbi8qKlxuR2VuZXJhdGVzIGluZm9ybWF0aW9uIG5lZWRlZCBkdXJpbmcgdHJhbnNwaWxpbmcsIHRoZSBWZXJpZnlSZXN1bHRzLlxuQWxzbyBjaGVja3MgZm9yIGV4aXN0ZW5jZSBvZiBsb2NhbCB2YXJpYWJsZXMgYW5kIHdhcm5zIGZvciB1bnVzZWQgbG9jYWxzLlxuQHBhcmFtIHtNc0FzdH0gbXNBc3RcbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB2ZXJpZnkobXNBc3QpIHtcblx0c2V0dXAoKVxuXHRtc0FzdC52ZXJpZnkoKVxuXHR3YXJuVW51c2VkTG9jYWxzKClcblx0Y29uc3QgcmVzID0gcmVzdWx0c1xuXHR0ZWFyRG93bigpXG5cdHJldHVybiByZXNcbn1cblxuaW1wbGVtZW50TWFueShNc0FzdFR5cGVzLCAndmVyaWZ5Jywge1xuXHRBc3NlcnQoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdHRoaXMuY29uZGl0aW9uLnZlcmlmeShTSy5WYWwpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFRocm93biwgU0suVmFsKVxuXHR9LFxuXG5cdEFzc2lnblNpbmdsZShzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0d2l0aE5hbWUodGhpcy5hc3NpZ25lZS5uYW1lLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBkb1YgPSAoKSA9PiB7XG5cdFx0XHRcdC8qXG5cdFx0XHRcdEZ1biBhbmQgQ2xhc3Mgb25seSBnZXQgbmFtZSBpZiB0aGV5IGFyZSBpbW1lZGlhdGVseSBhZnRlciB0aGUgYXNzaWdubWVudC5cblx0XHRcdFx0c28gaW4gYHggPSAkYWZ0ZXItdGltZSAxMDAwIHxgIHRoZSBmdW5jdGlvbiBpcyBub3QgbmFtZWQuXG5cdFx0XHRcdCovXG5cdFx0XHRcdGlmICh0aGlzLnZhbHVlIGluc3RhbmNlb2YgQ2xhc3MgfHxcblx0XHRcdFx0XHR0aGlzLnZhbHVlIGluc3RhbmNlb2YgRnVuIHx8XG5cdFx0XHRcdFx0dGhpcy52YWx1ZSBpbnN0YW5jZW9mIE1ldGhvZCB8fFxuXHRcdFx0XHRcdHRoaXMudmFsdWUgaW5zdGFuY2VvZiBLaW5kKVxuXHRcdFx0XHRcdHNldE5hbWUodGhpcy52YWx1ZSlcblxuXHRcdFx0XHQvLyBBc3NpZ25lZSByZWdpc3RlcmVkIGJ5IHZlcmlmeUxpbmVzLlxuXHRcdFx0XHR0aGlzLmFzc2lnbmVlLnZlcmlmeSgpXG5cdFx0XHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLmFzc2lnbmVlLmlzTGF6eSgpKVxuXHRcdFx0XHR3aXRoQmxvY2tMb2NhbHMoZG9WKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRkb1YoKVxuXHRcdH0pXG5cdH0sXG5cblx0QXNzaWduRGVzdHJ1Y3R1cmUoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdC8vIEFzc2lnbmVlcyByZWdpc3RlcmVkIGJ5IHZlcmlmeUxpbmVzLlxuXHRcdHZlcmlmeUVhY2godGhpcy5hc3NpZ25lZXMpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdEF3YWl0KF9zaykge1xuXHRcdGNoZWNrKGZ1bktpbmQgPT09IEZ1bnMuQXN5bmMsIHRoaXMubG9jLCAnbWlzcGxhY2VkQXdhaXQnKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRCYWdFbnRyeShzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0QmFnU2ltcGxlKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dmVyaWZ5RWFjaFZhbE9yU3ByZWFkKHRoaXMucGFydHMsIFNLLlZhbClcblx0fSxcblxuXHRCbG9jazogdmVyaWZ5QmxvY2ssXG5cblx0QmxvY2tXcmFwKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0d2l0aElpZmUoKCkgPT4gdGhpcy5ibG9jay52ZXJpZnkoc2spKVxuXHR9LFxuXG5cdEJyZWFrKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVmFsdWUsIFNLLlZhbClcblx0XHRjaGVjayhvcExvb3AgIT09IG51bGwsIHRoaXMubG9jLCAnbWlzcGxhY2VkQnJlYWsnKVxuXHRcdGNvbnN0IGxvb3AgPSBvcExvb3BcblxuXHRcdGlmIChsb29wIGluc3RhbmNlb2YgRm9yKVxuXHRcdFx0aWYgKHJlc3VsdHMuaXNTdGF0ZW1lbnQobG9vcCkpXG5cdFx0XHRcdGNoZWNrKHRoaXMub3BWYWx1ZSA9PT0gbnVsbCwgdGhpcy5sb2MsICdicmVha0NhbnRIYXZlVmFsdWUnKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRjaGVjayh0aGlzLm9wVmFsdWUgIT09IG51bGwsIHRoaXMubG9jLCAnYnJlYWtOZWVkc1ZhbHVlJylcblx0XHRlbHNlIHtcblx0XHRcdC8vIChGb3JBc3luYyBpc24ndCByZWFsbHkgYSBsb29wKVxuXHRcdFx0YXNzZXJ0KGxvb3AgaW5zdGFuY2VvZiBGb3JCYWcpXG5cdFx0XHRjaGVjayh0aGlzLm9wVmFsdWUgPT09IG51bGwsIHRoaXMubG9jLCAnYnJlYWtWYWxJbkZvckJhZycpXG5cdFx0fVxuXG5cdFx0aWYgKGlzSW5Td2l0Y2gpIHtcblx0XHRcdHJlc3VsdHMubG9vcHNOZWVkaW5nTGFiZWwuYWRkKGxvb3ApXG5cdFx0XHRyZXN1bHRzLmJyZWFrc0luU3dpdGNoLmFkZCh0aGlzKVxuXHRcdH1cblx0fSxcblxuXHRDYWxsKF9zaykge1xuXHRcdC8vIENhbGwgY2FuIGJlIGVpdGhlciBTSy5WYWwgb3IgU0suRG9cblx0XHR0aGlzLmNhbGxlZC52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeUVhY2hWYWxPclNwcmVhZCh0aGlzLmFyZ3MpXG5cdH0sXG5cblx0Q2FzZShzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0d2l0aElpZmVJZlZhbChzaywgKCkgPT4ge1xuXHRcdFx0Y29uc3QgZG9JdCA9ICgpID0+IHtcblx0XHRcdFx0dmVyaWZ5RWFjaCh0aGlzLnBhcnRzLCBzaylcblx0XHRcdFx0dmVyaWZ5T3AodGhpcy5vcEVsc2UsIHNrKVxuXHRcdFx0fVxuXHRcdFx0aWZFbHNlKHRoaXMub3BDYXNlZCxcblx0XHRcdFx0XyA9PiB7XG5cdFx0XHRcdFx0Xy52ZXJpZnkoU0suRG8pXG5cdFx0XHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKF8uYXNzaWduZWUsIGRvSXQpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRvSXQpXG5cdFx0fSlcblx0fSxcblxuXHRDYXNlUGFydChzaykge1xuXHRcdGlmICh0aGlzLnRlc3QgaW5zdGFuY2VvZiBQYXR0ZXJuKSB7XG5cdFx0XHR0aGlzLnRlc3QudHlwZS52ZXJpZnkoU0suVmFsKVxuXHRcdFx0dGhpcy50ZXN0LnBhdHRlcm5lZC52ZXJpZnkoU0suVmFsKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2Fscyh0aGlzLnRlc3QubG9jYWxzLCAoKSA9PiB0aGlzLnJlc3VsdC52ZXJpZnkoc2spKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnRlc3QudmVyaWZ5KFNLLlZhbClcblx0XHRcdHRoaXMucmVzdWx0LnZlcmlmeShzaylcblx0XHR9XG5cdH0sXG5cblx0Q2F0Y2goc2spIHtcblx0XHQvLyBObyBuZWVkIHRvIGRvIGFueXRoaW5nIHdpdGggYHNrYCBleGNlcHQgcGFzcyBpdCB0byBteSBibG9jay5cblx0XHRtYWtlVXNlT3B0aW9uYWxJZkZvY3VzKHRoaXMuY2F1Z2h0KVxuXHRcdHZlcmlmeU5vdExhenkodGhpcy5jYXVnaHQsICdub0xhenlDYXRjaCcpXG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuY2F1Z2h0LCAoKSA9PiB7XG5cdFx0XHR0aGlzLmJsb2NrLnZlcmlmeShzaylcblx0XHR9KVxuXHR9LFxuXG5cdENsYXNzKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0b3BFYWNoKHRoaXMub3BGaWVsZHMsIHZlcmlmeUVhY2gpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFN1cGVyQ2xhc3MsIFNLLlZhbClcblx0XHR2ZXJpZnlFYWNoKHRoaXMua2luZHMsIFNLLlZhbClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wRG8pXG5cdFx0dmVyaWZ5RWFjaCh0aGlzLnN0YXRpY3MpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcENvbnN0cnVjdG9yLCB0aGlzLm9wU3VwZXJDbGFzcyAhPT0gbnVsbClcblx0XHR2ZXJpZnlFYWNoKHRoaXMubWV0aG9kcylcblx0XHQvLyBuYW1lIHNldCBieSBBc3NpZ25TaW5nbGVcblx0fSxcblxuXHRDbGFzc0tpbmREbygpIHtcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5kZWNsYXJlRm9jdXMsICgpID0+IHRoaXMuYmxvY2sudmVyaWZ5KFNLLkRvKSlcblx0fSxcblxuXHRDb25kKHNrKSB7XG5cdFx0Ly8gQ291bGQgYmUgYSBzdGF0ZW1lbnQgaWYgYm90aCByZXN1bHRzIGFyZS5cblx0XHR0aGlzLnRlc3QudmVyaWZ5KFNLLlZhbClcblx0XHR0aGlzLmlmVHJ1ZS52ZXJpZnkoc2spXG5cdFx0dGhpcy5pZkZhbHNlLnZlcmlmeShzaylcblx0fSxcblxuXHRDb25kaXRpb25hbChzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0dGhpcy50ZXN0LnZlcmlmeShTSy5WYWwpXG5cdFx0d2l0aElpZmVJZih0aGlzLnJlc3VsdCBpbnN0YW5jZW9mIEJsb2NrICYmIHNrID09PSBTSy5WYWwsICgpID0+IHtcblx0XHRcdHRoaXMucmVzdWx0LnZlcmlmeShzaylcblx0XHR9KVxuXHR9LFxuXG5cdENvbnN0cnVjdG9yKGNsYXNzSGFzU3VwZXIpIHtcblx0XHRtYWtlVXNlT3B0aW9uYWwodGhpcy5mdW4ub3BEZWNsYXJlVGhpcylcblx0XHR3aXRoTWV0aG9kKHRoaXMsICgpID0+IHtcblx0XHRcdHRoaXMuZnVuLnZlcmlmeShTSy5WYWwpXG5cdFx0fSlcblxuXHRcdGNvbnN0IHN1cGVyQ2FsbCA9IHJlc3VsdHMuY29uc3RydWN0b3JUb1N1cGVyLmdldCh0aGlzKVxuXG5cdFx0aWYgKGNsYXNzSGFzU3VwZXIpXG5cdFx0XHRjaGVjayhzdXBlckNhbGwgIT09IHVuZGVmaW5lZCwgdGhpcy5sb2MsICdzdXBlck5lZWRlZCcpXG5cdFx0ZWxzZVxuXHRcdFx0Y2hlY2soc3VwZXJDYWxsID09PSB1bmRlZmluZWQsICgpID0+IHN1cGVyQ2FsbC5sb2MsICdzdXBlckZvcmJpZGRlbicpXG5cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5tZW1iZXJBcmdzKVxuXHRcdFx0c2V0RGVjbGFyZUFjY2Vzc2VkKF8sIHRoaXMpXG5cdH0sXG5cblx0RGVsKF9zaykge1xuXHRcdC8vIERlbFN1YiBjYW4gYmUgZWl0aGVyIFNLLlZhbCBvciBTSy5Eb1xuXHRcdHRoaXMuc3ViYmVkLnZlcmlmeShTSy5WYWwpXG5cdFx0dmVyaWZ5RWFjaCh0aGlzLmFyZ3MsIFNLLlZhbClcblx0fSxcblxuXHRFeGNlcHQoc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdGlmICh0aGlzLm9wRWxzZSA9PT0gbnVsbClcblx0XHRcdHRoaXMudHJ5LnZlcmlmeShzaylcblx0XHRlbHNlIHtcblx0XHRcdHBsdXNMb2NhbHModmVyaWZ5RG9CbG9jayh0aGlzLnRyeSksICgpID0+IHRoaXMub3BFbHNlLnZlcmlmeShzaykpXG5cdFx0XHRpZiAoaXNFbXB0eSh0aGlzLmFsbENhdGNoZXMpKVxuXHRcdFx0XHR3YXJuKHRoaXMubG9jLCAnZWxzZVJlcXVpcmVzQ2F0Y2gnKVxuXHRcdH1cblxuXHRcdGlmIChpc0VtcHR5KHRoaXMuYWxsQ2F0Y2hlcykgJiYgdGhpcy5vcEZpbmFsbHkgPT09IG51bGwpXG5cdFx0XHR3YXJuKHRoaXMubG9jLCAndXNlbGVzc0V4Y2VwdCcpXG5cblx0XHR2ZXJpZnlFYWNoKHRoaXMudHlwZWRDYXRjaGVzLCBzaylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wQ2F0Y2hBbGwsIHNrKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BGaW5hbGx5LCBTSy5Ebylcblx0fSxcblxuXHRGaWVsZCgpIHtcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVHlwZSwgU0suVmFsKVxuXHR9LFxuXG5cdEZvcihzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0dmVyaWZ5Rm9yKHRoaXMpXG5cdH0sXG5cblx0Rm9yQXN5bmMoc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdGNoZWNrKHNrICE9PSBTSy5EbyB8fCBmdW5LaW5kID09PSBGdW5zLkFzeW5jLCB0aGlzLmxvYywgJ2ZvckFzeW5jTmVlZHNBc3luYycpXG5cdFx0d2l0aFZlcmlmeUl0ZXJhdGVlKHRoaXMuaXRlcmF0ZWUsICgpID0+IHtcblx0XHRcdHdpdGhGdW4oRnVucy5Bc3luYywgKCkgPT4ge1xuXHRcdFx0XHQvLyBEZWZhdWx0IGJsb2NrIHRvIHJldHVybmluZyBhIHZhbHVlLCBidXQgT0sgaWYgaXQgZG9lc24ndC5cblx0XHRcdFx0Ly8gSWYgYSBzdGF0ZW1lbnQsIHN0YXRlbWVudCwgdGhlIGNvbXBpbGVkIGNvZGUgd2lsbCBtYWtlIGEgUHJvbWlzZVxuXHRcdFx0XHQvLyB0aGF0IHJlc29sdmVzIHRvIGFuIGFycmF5IGZ1bGwgb2YgYHVuZGVmaW5lZGAuXG5cdFx0XHRcdHRoaXMuYmxvY2sudmVyaWZ5KGdldFNLKHRoaXMuYmxvY2spKVxuXHRcdFx0fSlcblx0XHR9KVxuXHR9LFxuXG5cdEZvckJhZyhzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmJ1aWx0LCAoKSA9PiB2ZXJpZnlGb3IodGhpcykpXG5cdH0sXG5cblx0RnVuKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0Y2hlY2sodGhpcy5vcFJldHVyblR5cGUgPT09IG51bGwgfHwgIXRoaXMuaXNEbywgdGhpcy5sb2MsICdkb0Z1bmNDYW50SGF2ZVR5cGUnKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BSZXR1cm5UeXBlLCBTSy5WYWwpXG5cdFx0Y29uc3QgYXJncyA9IGNhdCh0aGlzLm9wRGVjbGFyZVRoaXMsIHRoaXMuYXJncywgdGhpcy5vcFJlc3RBcmcpXG5cdFx0d2l0aEZ1bih0aGlzLmtpbmQsICgpID0+IHtcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoYXJncywgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeSh0aGlzLmlzRG8gPyBTSy5EbyA6IFNLLlZhbClcblx0XHRcdH0pXG5cdFx0fSlcblx0XHQvLyBuYW1lIHNldCBieSBBc3NpZ25TaW5nbGVcblx0fSxcblxuXHRGdW5BYnN0cmFjdCgpIHtcblx0XHR2ZXJpZnlFYWNoKHRoaXMuYXJncylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wUmVzdEFyZylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wUmV0dXJuVHlwZSwgU0suVmFsKVxuXHR9LFxuXG5cdEdldHRlckZ1bihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdElnbm9yZShzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuaWdub3JlZE5hbWVzKVxuXHRcdFx0YWNjZXNzTG9jYWwodGhpcywgXylcblx0fSxcblxuXHRJbnN0YW5jZU9mKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy5pbnN0YW5jZS52ZXJpZnkoU0suVmFsKVxuXHRcdHRoaXMudHlwZS52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdEtpbmQoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR2ZXJpZnlFYWNoKHRoaXMuc3VwZXJLaW5kcywgU0suVmFsKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BEbywgU0suRG8pXG5cdFx0dmVyaWZ5RWFjaCh0aGlzLnN0YXRpY3MpXG5cdFx0dmVyaWZ5RWFjaCh0aGlzLm1ldGhvZHMpXG5cdFx0Ly8gbmFtZSBzZXQgYnkgQXNzaWduU2luZ2xlXG5cdH0sXG5cblx0TGF6eShzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHdpdGhCbG9ja0xvY2FscygoKSA9PiB0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpKVxuXHR9LFxuXG5cdExvY2FsQWNjZXNzKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0Y29uc3QgZGVjbGFyZSA9IGxvY2Fscy5nZXQodGhpcy5uYW1lKVxuXHRcdGlmIChkZWNsYXJlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdGNvbnN0IGJ1aWx0aW5QYXRoID0gb3B0aW9ucy5idWlsdGluTmFtZVRvUGF0aC5nZXQodGhpcy5uYW1lKVxuXHRcdFx0aWYgKGJ1aWx0aW5QYXRoID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdGZhaWxNaXNzaW5nTG9jYWwodGhpcy5sb2MsIHRoaXMubmFtZSlcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRjb25zdCBuYW1lcyA9IHJlc3VsdHMuYnVpbHRpblBhdGhUb05hbWVzLmdldChidWlsdGluUGF0aClcblx0XHRcdFx0aWYgKG5hbWVzID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdFx0cmVzdWx0cy5idWlsdGluUGF0aFRvTmFtZXMuc2V0KGJ1aWx0aW5QYXRoLCBuZXcgU2V0KFt0aGlzLm5hbWVdKSlcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdG5hbWVzLmFkZCh0aGlzLm5hbWUpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc3VsdHMubG9jYWxBY2Nlc3NUb0RlY2xhcmUuc2V0KHRoaXMsIGRlY2xhcmUpXG5cdFx0XHRzZXREZWNsYXJlQWNjZXNzZWQoZGVjbGFyZSwgdGhpcylcblx0XHR9XG5cdH0sXG5cblx0Ly8gQWRkaW5nIExvY2FsRGVjbGFyZXMgdG8gdGhlIGF2YWlsYWJsZSBsb2NhbHMgaXMgZG9uZSBieSBGdW4gb3IgbGluZU5ld0xvY2Fscy5cblx0TG9jYWxEZWNsYXJlKCkge1xuXHRcdGNvbnN0IGJ1aWx0aW5QYXRoID0gb3B0aW9ucy5idWlsdGluTmFtZVRvUGF0aC5nZXQodGhpcy5uYW1lKVxuXHRcdGlmIChidWlsdGluUGF0aCAhPT0gdW5kZWZpbmVkKVxuXHRcdFx0d2Fybih0aGlzLmxvYywgJ292ZXJyaWRkZW5CdWlsdGluJywgdGhpcy5uYW1lLCBidWlsdGluUGF0aClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVHlwZSwgU0suVmFsKVxuXHR9LFxuXG5cdExvY2FsTXV0YXRlKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0TG9naWMoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRjaGVjayh0aGlzLmFyZ3MubGVuZ3RoID4gMSwgdGhpcy5sb2MsICdsb2dpY05lZWRzQXJncycpXG5cdFx0dmVyaWZ5RWFjaCh0aGlzLmFyZ3MsIFNLLlZhbClcblx0fSxcblxuXHROb3Qoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR0aGlzLmFyZy52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdE51bWJlckxpdGVyYWwoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0fSxcblxuXHRNYXBFbnRyeShzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR0aGlzLmtleS52ZXJpZnkoU0suVmFsKVxuXHRcdHRoaXMudmFsLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0TWVtYmVyKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy5vYmplY3QudmVyaWZ5KFNLLlZhbClcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0fSxcblxuXHRNZW1iZXJGdW4oc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wT2JqZWN0LCBTSy5WYWwpXG5cdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdH0sXG5cblx0TWVtYmVyU2V0KHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHR0aGlzLm9iamVjdC52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BUeXBlLCBTSy5WYWwpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdE1ldGhvZChzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdG1ha2VVc2VPcHRpb25hbCh0aGlzLmZ1bi5vcERlY2xhcmVUaGlzKVxuXHRcdHRoaXMuZnVuLmFyZ3MuZm9yRWFjaChtYWtlVXNlT3B0aW9uYWwpXG5cdFx0b3BFYWNoKHRoaXMuZnVuLm9wUmVzdEFyZywgbWFrZVVzZU9wdGlvbmFsKVxuXHRcdHRoaXMuZnVuLnZlcmlmeShTSy5WYWwpXG5cdFx0Ly8gbmFtZSBzZXQgYnkgQXNzaWduU2luZ2xlXG5cdH0sXG5cblx0TWV0aG9kSW1wbCgpIHtcblx0XHR2ZXJpZnlNZXRob2RJbXBsKHRoaXMsICgpID0+IHtcblx0XHRcdG1ha2VVc2VPcHRpb25hbCh0aGlzLmZ1bi5vcERlY2xhcmVUaGlzKVxuXHRcdFx0dGhpcy5mdW4udmVyaWZ5KFNLLlZhbClcblx0XHR9KVxuXHR9LFxuXHRNZXRob2RHZXR0ZXIoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kSW1wbCh0aGlzLCAoKSA9PiB7XG5cdFx0XHRtYWtlVXNlT3B0aW9uYWwodGhpcy5kZWNsYXJlVGhpcylcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoW3RoaXMuZGVjbGFyZVRoaXNdLCAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuYmxvY2sudmVyaWZ5KFNLLlZhbClcblx0XHRcdH0pXG5cdFx0fSlcblx0fSxcblx0TWV0aG9kU2V0dGVyKCkge1xuXHRcdHZlcmlmeU1ldGhvZEltcGwodGhpcywgKCkgPT4ge1xuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FscyhbdGhpcy5kZWNsYXJlVGhpcywgdGhpcy5kZWNsYXJlRm9jdXNdLCAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuYmxvY2sudmVyaWZ5KFNLLkRvKVxuXHRcdFx0fSlcblx0XHR9KVxuXHR9LFxuXG5cdE1vZHVsZSgpIHtcblx0XHQvLyBObyBuZWVkIHRvIHZlcmlmeSB0aGlzLmRvSW1wb3J0cy5cblx0XHR2ZXJpZnlFYWNoKHRoaXMuaW1wb3J0cylcblx0XHR3aXRoTmFtZShwYXRoT3B0aW9ucy5tb2R1bGVOYW1lKCksICgpID0+IHtcblx0XHRcdHZlcmlmeU1vZHVsZUxpbmVzKHRoaXMubGluZXMsIHRoaXMubG9jKVxuXHRcdH0pXG5cdH0sXG5cblx0TXNSZWdFeHAoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR0aGlzLnBhcnRzLmZvckVhY2godmVyaWZ5TmFtZSlcblx0XHQvLyBDaGVjayBSZWdFeHAgdmFsaWRpdHk7IG9ubHkgcG9zc2libGUgaWYgdGhpcyBoYXMgYSBzaW5nbGUgcGFydC5cblx0XHRpZiAodGhpcy5wYXJ0cy5sZW5ndGggPT09IDEgJiYgdHlwZW9mIHRoaXMucGFydHNbMF0gPT09ICdzdHJpbmcnKVxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0LyogZXNsaW50LWRpc2FibGUgbm8tbmV3ICovXG5cdFx0XHRcdG5ldyBSZWdFeHAodGhpcy5wYXJ0c1swXSlcblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRpZiAoIShlcnIgaW5zdGFuY2VvZiBTeW50YXhFcnJvcikpXG5cdFx0XHRcdFx0Ly8gVGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuLlxuXHRcdFx0XHRcdHRocm93IGVyclxuXHRcdFx0XHRmYWlsKHRoaXMubG9jLCAnYmFkUmVnRXhwJywgdGhpcy5wYXJ0c1swXSlcblx0XHRcdH1cblx0fSxcblxuXHROZXcoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR0aGlzLnR5cGUudmVyaWZ5KFNLLlZhbClcblx0XHR2ZXJpZnlFYWNoVmFsT3JTcHJlYWQodGhpcy5hcmdzLCBTSy52YWwpXG5cdH0sXG5cblx0T2JqRW50cnlBc3NpZ24oc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdGlmICghcmVzdWx0cy5pc09iakVudHJ5RXhwb3J0KHRoaXMpKVxuXHRcdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR0aGlzLmFzc2lnbi52ZXJpZnkoU0suRG8pXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXNzaWduLmFsbEFzc2lnbmVlcygpKVxuXHRcdFx0c2V0RGVjbGFyZUFjY2Vzc2VkKF8sIHRoaXMpXG5cdH0sXG5cblx0T2JqRW50cnlQbGFpbihzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0aWYgKHJlc3VsdHMuaXNPYmpFbnRyeUV4cG9ydCh0aGlzKSlcblx0XHRcdGNoZWNrKHR5cGVvZiB0aGlzLm5hbWUgPT09ICdzdHJpbmcnLCB0aGlzLmxvYywgJ2V4cG9ydE5hbWUnKVxuXHRcdGVsc2Uge1xuXHRcdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHRcdH1cblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0T2JqU2ltcGxlKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0Y29uc3Qga2V5cyA9IG5ldyBTZXQoKVxuXHRcdGZvciAoY29uc3Qge2tleSwgdmFsdWUsIGxvY30gb2YgdGhpcy5wYWlycykge1xuXHRcdFx0Y2hlY2soIWtleXMuaGFzKGtleSksIGxvYywgJ2R1cGxpY2F0ZUtleScsIGtleSlcblx0XHRcdGtleXMuYWRkKGtleSlcblx0XHRcdHZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdFx0fVxuXHR9LFxuXG5cdFBhc3Moc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdHRoaXMuaWdub3JlZC52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdFBpcGUoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBwaXBlIG9mIHRoaXMucGlwZXMpXG5cdFx0XHRyZWdpc3RlckFuZFBsdXNMb2NhbChMb2NhbERlY2xhcmUuZm9jdXModGhpcy5sb2MpLCAoKSA9PiB7XG5cdFx0XHRcdHBpcGUudmVyaWZ5KFNLLlZhbClcblx0XHRcdH0pXG5cdH0sXG5cblx0UXVvdGVQbGFpbihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHRoaXMucGFydHMuZm9yRWFjaCh2ZXJpZnlOYW1lKVxuXHR9LFxuXG5cdFF1b3RlU2ltcGxlKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdH0sXG5cblx0UXVvdGVUYWdnZWRUZW1wbGF0ZShzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHRoaXMudGFnLnZlcmlmeShTSy5WYWwpXG5cdFx0dGhpcy5xdW90ZS52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdFJhbmdlKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy5zdGFydC52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeU9wKHRoaXMuZW5kLCBTSy5WYWwpXG5cdH0sXG5cblx0U2V0U3ViKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHR0aGlzLm9iamVjdC52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeUVhY2godGhpcy5zdWJiZWRzLCBTSy5WYWwpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFR5cGUsIFNLLlZhbClcblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0U2ltcGxlRnVuKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0d2l0aEJsb2NrTG9jYWxzKCgpID0+IHtcblx0XHRcdHdpdGhJbkZ1bktpbmQoRnVucy5QbGFpbiwgKCkgPT4ge1xuXHRcdFx0XHRyZWdpc3RlckFuZFBsdXNMb2NhbChMb2NhbERlY2xhcmUuZm9jdXModGhpcy5sb2MpLCAoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHRcdFx0XHR9KVxuXHRcdFx0fSlcblx0XHR9KVxuXHR9LFxuXG5cdFNwZWNpYWxEbyhzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdH0sXG5cblx0U3BlY2lhbFZhbChzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHNldE5hbWUodGhpcylcblx0fSxcblxuXHRTcHJlYWQoc2spIHtcblx0XHRpZiAoc2sgIT09IG51bGwpXG5cdFx0XHRmYWlsKHRoaXMubG9jLCBzayA9PT0gU0suVmFsID8gJ21pc3BsYWNlZFNwcmVhZFZhbCcgOiAnbWlzcGxhY2VkU3ByZWFkRG8nKVxuXHRcdHRoaXMuc3ByZWFkZWQudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRTdWIoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR0aGlzLnN1YmJlZC52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeUVhY2godGhpcy5hcmdzLCBTSy5WYWwpXG5cdH0sXG5cblx0U3VwZXJDYWxsKHNrKSB7XG5cdFx0Y2hlY2sobWV0aG9kICE9PSBudWxsLCB0aGlzLmxvYywgJ3N1cGVyTmVlZHNNZXRob2QnKVxuXHRcdHJlc3VsdHMuc3VwZXJDYWxsVG9NZXRob2Quc2V0KHRoaXMsIG1ldGhvZClcblxuXHRcdGlmIChtZXRob2QgaW5zdGFuY2VvZiBDb25zdHJ1Y3Rvcikge1xuXHRcdFx0Y2hlY2soc2sgPT09IFNLLkRvLCB0aGlzLmxvYywgJ3N1cGVyTXVzdEJlU3RhdGVtZW50Jylcblx0XHRcdHJlc3VsdHMuY29uc3RydWN0b3JUb1N1cGVyLnNldChtZXRob2QsIHRoaXMpXG5cdFx0fVxuXG5cdFx0dmVyaWZ5RWFjaCh0aGlzLmFyZ3MsIFNLLlZhbClcblx0fSxcblxuXHRTdXBlck1lbWJlcihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdGNoZWNrKG1ldGhvZCAhPT0gbnVsbCwgdGhpcy5sb2MsICdzdXBlck5lZWRzTWV0aG9kJylcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0fSxcblxuXHRTd2l0Y2goc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdHdpdGhJaWZlSWZWYWwoc2ssICgpID0+IHtcblx0XHRcdHdpdGhJblN3aXRjaCh0cnVlLCAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuc3dpdGNoZWQudmVyaWZ5KFNLLlZhbClcblx0XHRcdFx0dmVyaWZ5RWFjaCh0aGlzLnBhcnRzLCBzaylcblx0XHRcdFx0dmVyaWZ5T3AodGhpcy5vcEVsc2UsIHNrKVxuXHRcdFx0fSlcblx0XHR9KVxuXHR9LFxuXG5cdFN3aXRjaFBhcnQoc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdHZlcmlmeUVhY2godGhpcy52YWx1ZXMsIFNLLlZhbClcblx0XHR0aGlzLnJlc3VsdC52ZXJpZnkoc2spXG5cdH0sXG5cblx0VGhyb3coKSB7XG5cdFx0dmVyaWZ5T3AodGhpcy5vcFRocm93biwgU0suVmFsKVxuXHR9LFxuXG5cdEltcG9ydCgpIHtcblx0XHQvLyBTaW5jZSBVc2VzIGFyZSBhbHdheXMgaW4gdGhlIG91dGVybW9zdCBzY29wZSwgZG9uJ3QgaGF2ZSB0byB3b3JyeSBhYm91dCBzaGFkb3dpbmcuXG5cdFx0Ly8gU28gd2UgbXV0YXRlIGBsb2NhbHNgIGRpcmVjdGx5LlxuXHRcdGZ1bmN0aW9uIGFkZFVzZUxvY2FsKF8pIHtcblx0XHRcdGNvbnN0IHByZXYgPSBsb2NhbHMuZ2V0KF8ubmFtZSlcblx0XHRcdGlmIChwcmV2ICE9PSB1bmRlZmluZWQpXG5cdFx0XHRcdGZhaWwoXy5sb2MsICdkdXBsaWNhdGVJbXBvcnQnLCBfLm5hbWUsIHByZXYubG9jKVxuXHRcdFx0dmVyaWZ5TG9jYWxEZWNsYXJlKF8pXG5cdFx0XHRzZXRMb2NhbChfKVxuXHRcdH1cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5pbXBvcnRlZClcblx0XHRcdGFkZFVzZUxvY2FsKF8pXG5cdFx0b3BFYWNoKHRoaXMub3BJbXBvcnREZWZhdWx0LCBhZGRVc2VMb2NhbClcblx0fSxcblxuXHRXaXRoKHNrKSB7XG5cdFx0bWFya1N0YXRlbWVudCh0aGlzLCBzaylcblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdFx0d2l0aElpZmVJZlZhbChzaywgKCkgPT4ge1xuXHRcdFx0aWYgKHNrID09PSBTSy5WYWwpXG5cdFx0XHRcdG1ha2VVc2VPcHRpb25hbElmRm9jdXModGhpcy5kZWNsYXJlKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuZGVjbGFyZSwgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeShTSy5Ebylcblx0XHRcdH0pXG5cdFx0fSlcblx0fSxcblxuXHRZaWVsZChfc2spIHtcblx0XHRjaGVjayhmdW5LaW5kID09PSBGdW5zLkdlbmVyYXRvciwgdGhpcy5sb2MsICdtaXNwbGFjZWRZaWVsZCcsIEtleXdvcmRzLllpZWxkKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BWYWx1ZSwgU0suVmFsKVxuXHR9LFxuXG5cdFlpZWxkVG8oX3NrKSB7XG5cdFx0Y2hlY2soZnVuS2luZCA9PT0gRnVucy5HZW5lcmF0b3IsIHRoaXMubG9jLCAnbWlzcGxhY2VkWWllbGQnLCBLZXl3b3Jkcy5ZaWVsZFRvKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fVxufSlcblxuLy8gSGVscGVycyBzcGVjaWZpYyB0byBjZXJ0YWluIE1zQXN0IHR5cGVzXG5cbmZ1bmN0aW9uIHZlcmlmeUZvcihmb3JMb29wKSB7XG5cdGZ1bmN0aW9uIHZlcmlmeUZvckJsb2NrKCkge1xuXHRcdHdpdGhMb29wKGZvckxvb3AsICgpID0+IHtcblx0XHRcdGZvckxvb3AuYmxvY2sudmVyaWZ5KFNLLkRvKVxuXHRcdH0pXG5cdH1cblx0aWZFbHNlKGZvckxvb3Aub3BJdGVyYXRlZSxcblx0XHRfID0+IHtcblx0XHRcdHdpdGhWZXJpZnlJdGVyYXRlZShfLCB2ZXJpZnlGb3JCbG9jaylcblx0XHR9LFxuXHRcdHZlcmlmeUZvckJsb2NrKVxufVxuXG5mdW5jdGlvbiB3aXRoVmVyaWZ5SXRlcmF0ZWUoe2VsZW1lbnQsIGJhZ30sIGFjdGlvbikge1xuXHRiYWcudmVyaWZ5KFNLLlZhbClcblx0dmVyaWZ5Tm90TGF6eShlbGVtZW50LCAnbm9MYXp5SXRlcmF0ZWUnKVxuXHR2ZXJpZnlBbmRQbHVzTG9jYWwoZWxlbWVudCwgYWN0aW9uKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlNZXRob2RJbXBsKF8sIGRvVmVyaWZ5KSB7XG5cdHZlcmlmeU5hbWUoXy5zeW1ib2wpXG5cdHdpdGhNZXRob2QoXywgZG9WZXJpZnkpXG59XG4iXX0=
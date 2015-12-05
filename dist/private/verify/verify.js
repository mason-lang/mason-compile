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
			(0, _util2.verifyEach)(this.parts, _SK2.default.Val);
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
			(0, _util2.verifyEach)(this.args, _SK2.default.Val);
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
			(0, _util2.verifyEach)(this.args, _SK2.default.val);
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

		Spread() {
			this.spreaded.verify(_SK2.default.Val);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQXNCd0IsTUFBTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQUFOLE1BQU0iLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVjaywgZmFpbCwgb3B0aW9ucywgcGF0aE9wdGlvbnMsIHdhcm59IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtCbG9jaywgQ2xhc3MsIENvbnN0cnVjdG9yLCBGb3IsIEZvckJhZywgRnVuLCBGdW5zLCBLaW5kLCBMb2NhbERlY2xhcmUsIE1ldGhvZCwgUGF0dGVyblxuXHR9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtLZXl3b3Jkc30gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2Fzc2VydCwgY2F0LCBpZkVsc2UsIGltcGxlbWVudE1hbnksIGlzRW1wdHksIG9wRWFjaH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7ZnVuS2luZCwgaXNJblN3aXRjaCwgbG9jYWxzLCBtZXRob2QsIG9wTG9vcCwgcmVzdWx0cywgc2V0dXAsIHRlYXJEb3duLCB3aXRoRnVuLCB3aXRoSWlmZSxcblx0d2l0aElpZmVJZiwgd2l0aElpZmVJZlZhbCwgd2l0aEluRnVuS2luZCwgd2l0aEluU3dpdGNoLCB3aXRoTWV0aG9kLCB3aXRoTG9vcCwgd2l0aE5hbWVcblx0fSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge2FjY2Vzc0xvY2FsLCBmYWlsTWlzc2luZ0xvY2FsLCBwbHVzTG9jYWxzLCByZWdpc3RlckFuZFBsdXNMb2NhbCwgc2V0RGVjbGFyZUFjY2Vzc2VkLFxuXHRzZXRMb2NhbCwgdmVyaWZ5QW5kUGx1c0xvY2FsLCB2ZXJpZnlBbmRQbHVzTG9jYWxzLCB2ZXJpZnlMb2NhbERlY2xhcmUsIHdhcm5VbnVzZWRMb2NhbHMsXG5cdHdpdGhCbG9ja0xvY2Fsc30gZnJvbSAnLi9sb2NhbHMnXG5pbXBvcnQgU0ssIHtjaGVja0RvLCBjaGVja1ZhbCwgZ2V0U0ssIG1hcmtTdGF0ZW1lbnR9IGZyb20gJy4vU0snXG5pbXBvcnQge21ha2VVc2VPcHRpb25hbCwgbWFrZVVzZU9wdGlvbmFsSWZGb2N1cywgc2V0TmFtZSwgdmVyaWZ5RWFjaCwgdmVyaWZ5TmFtZSwgdmVyaWZ5Tm90TGF6eSxcblx0dmVyaWZ5T3B9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB2ZXJpZnlCbG9jaywge3ZlcmlmeURvQmxvY2ssIHZlcmlmeU1vZHVsZUxpbmVzfSBmcm9tICcuL3ZlcmlmeUJsb2NrJ1xuXG4vKipcbkdlbmVyYXRlcyBpbmZvcm1hdGlvbiBuZWVkZWQgZHVyaW5nIHRyYW5zcGlsaW5nLCB0aGUgVmVyaWZ5UmVzdWx0cy5cbkFsc28gY2hlY2tzIGZvciBleGlzdGVuY2Ugb2YgbG9jYWwgdmFyaWFibGVzIGFuZCB3YXJucyBmb3IgdW51c2VkIGxvY2Fscy5cbkBwYXJhbSB7TXNBc3R9IG1zQXN0XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdmVyaWZ5KG1zQXN0KSB7XG5cdHNldHVwKClcblx0bXNBc3QudmVyaWZ5KClcblx0d2FyblVudXNlZExvY2FscygpXG5cdGNvbnN0IHJlcyA9IHJlc3VsdHNcblx0dGVhckRvd24oKVxuXHRyZXR1cm4gcmVzXG59XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ3ZlcmlmeScsIHtcblx0QXNzZXJ0KHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHR0aGlzLmNvbmRpdGlvbi52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BUaHJvd24sIFNLLlZhbClcblx0fSxcblxuXHRBc3NpZ25TaW5nbGUoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdHdpdGhOYW1lKHRoaXMuYXNzaWduZWUubmFtZSwgKCkgPT4ge1xuXHRcdFx0Y29uc3QgZG9WID0gKCkgPT4ge1xuXHRcdFx0XHQvKlxuXHRcdFx0XHRGdW4gYW5kIENsYXNzIG9ubHkgZ2V0IG5hbWUgaWYgdGhleSBhcmUgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIGFzc2lnbm1lbnQuXG5cdFx0XHRcdHNvIGluIGB4ID0gJGFmdGVyLXRpbWUgMTAwMCB8YCB0aGUgZnVuY3Rpb24gaXMgbm90IG5hbWVkLlxuXHRcdFx0XHQqL1xuXHRcdFx0XHRpZiAodGhpcy52YWx1ZSBpbnN0YW5jZW9mIENsYXNzIHx8XG5cdFx0XHRcdFx0dGhpcy52YWx1ZSBpbnN0YW5jZW9mIEZ1biB8fFxuXHRcdFx0XHRcdHRoaXMudmFsdWUgaW5zdGFuY2VvZiBNZXRob2QgfHxcblx0XHRcdFx0XHR0aGlzLnZhbHVlIGluc3RhbmNlb2YgS2luZClcblx0XHRcdFx0XHRzZXROYW1lKHRoaXMudmFsdWUpXG5cblx0XHRcdFx0Ly8gQXNzaWduZWUgcmVnaXN0ZXJlZCBieSB2ZXJpZnlMaW5lcy5cblx0XHRcdFx0dGhpcy5hc3NpZ25lZS52ZXJpZnkoKVxuXHRcdFx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy5hc3NpZ25lZS5pc0xhenkoKSlcblx0XHRcdFx0d2l0aEJsb2NrTG9jYWxzKGRvVilcblx0XHRcdGVsc2Vcblx0XHRcdFx0ZG9WKClcblx0XHR9KVxuXHR9LFxuXG5cdEFzc2lnbkRlc3RydWN0dXJlKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHQvLyBBc3NpZ25lZXMgcmVnaXN0ZXJlZCBieSB2ZXJpZnlMaW5lcy5cblx0XHR2ZXJpZnlFYWNoKHRoaXMuYXNzaWduZWVzKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRBd2FpdChfc2spIHtcblx0XHRjaGVjayhmdW5LaW5kID09PSBGdW5zLkFzeW5jLCB0aGlzLmxvYywgJ21pc3BsYWNlZEF3YWl0Jylcblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0QmFnRW50cnkoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdEJhZ1NpbXBsZShzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHZlcmlmeUVhY2godGhpcy5wYXJ0cywgU0suVmFsKVxuXHR9LFxuXG5cdEJsb2NrOiB2ZXJpZnlCbG9jayxcblxuXHRCbG9ja1dyYXAoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR3aXRoSWlmZSgoKSA9PiB0aGlzLmJsb2NrLnZlcmlmeShzaykpXG5cdH0sXG5cblx0QnJlYWsoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BWYWx1ZSwgU0suVmFsKVxuXHRcdGNoZWNrKG9wTG9vcCAhPT0gbnVsbCwgdGhpcy5sb2MsICdtaXNwbGFjZWRCcmVhaycpXG5cdFx0Y29uc3QgbG9vcCA9IG9wTG9vcFxuXG5cdFx0aWYgKGxvb3AgaW5zdGFuY2VvZiBGb3IpXG5cdFx0XHRpZiAocmVzdWx0cy5pc1N0YXRlbWVudChsb29wKSlcblx0XHRcdFx0Y2hlY2sodGhpcy5vcFZhbHVlID09PSBudWxsLCB0aGlzLmxvYywgJ2JyZWFrQ2FudEhhdmVWYWx1ZScpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGNoZWNrKHRoaXMub3BWYWx1ZSAhPT0gbnVsbCwgdGhpcy5sb2MsICdicmVha05lZWRzVmFsdWUnKVxuXHRcdGVsc2Uge1xuXHRcdFx0Ly8gKEZvckFzeW5jIGlzbid0IHJlYWxseSBhIGxvb3ApXG5cdFx0XHRhc3NlcnQobG9vcCBpbnN0YW5jZW9mIEZvckJhZylcblx0XHRcdGNoZWNrKHRoaXMub3BWYWx1ZSA9PT0gbnVsbCwgdGhpcy5sb2MsICdicmVha1ZhbEluRm9yQmFnJylcblx0XHR9XG5cblx0XHRpZiAoaXNJblN3aXRjaCkge1xuXHRcdFx0cmVzdWx0cy5sb29wc05lZWRpbmdMYWJlbC5hZGQobG9vcClcblx0XHRcdHJlc3VsdHMuYnJlYWtzSW5Td2l0Y2guYWRkKHRoaXMpXG5cdFx0fVxuXHR9LFxuXG5cdENhbGwoX3NrKSB7XG5cdFx0dGhpcy5jYWxsZWQudmVyaWZ5KFNLLlZhbClcblx0XHR2ZXJpZnlFYWNoKHRoaXMuYXJncywgU0suVmFsKVxuXHR9LFxuXG5cdENhc2Uoc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdHdpdGhJaWZlSWZWYWwoc2ssICgpID0+IHtcblx0XHRcdGNvbnN0IGRvSXQgPSAoKSA9PiB7XG5cdFx0XHRcdHZlcmlmeUVhY2godGhpcy5wYXJ0cywgc2spXG5cdFx0XHRcdHZlcmlmeU9wKHRoaXMub3BFbHNlLCBzaylcblx0XHRcdH1cblx0XHRcdGlmRWxzZSh0aGlzLm9wQ2FzZWQsXG5cdFx0XHRcdF8gPT4ge1xuXHRcdFx0XHRcdF8udmVyaWZ5KFNLLkRvKVxuXHRcdFx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbChfLmFzc2lnbmVlLCBkb0l0KVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkb0l0KVxuXHRcdH0pXG5cdH0sXG5cblx0Q2FzZVBhcnQoc2spIHtcblx0XHRpZiAodGhpcy50ZXN0IGluc3RhbmNlb2YgUGF0dGVybikge1xuXHRcdFx0dGhpcy50ZXN0LnR5cGUudmVyaWZ5KFNLLlZhbClcblx0XHRcdHRoaXMudGVzdC5wYXR0ZXJuZWQudmVyaWZ5KFNLLlZhbClcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHModGhpcy50ZXN0LmxvY2FscywgKCkgPT4gdGhpcy5yZXN1bHQudmVyaWZ5KHNrKSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy50ZXN0LnZlcmlmeShTSy5WYWwpXG5cdFx0XHR0aGlzLnJlc3VsdC52ZXJpZnkoc2spXG5cdFx0fVxuXHR9LFxuXG5cdENhdGNoKHNrKSB7XG5cdFx0Ly8gTm8gbmVlZCB0byBkbyBhbnl0aGluZyB3aXRoIGBza2AgZXhjZXB0IHBhc3MgaXQgdG8gbXkgYmxvY2suXG5cdFx0bWFrZVVzZU9wdGlvbmFsSWZGb2N1cyh0aGlzLmNhdWdodClcblx0XHR2ZXJpZnlOb3RMYXp5KHRoaXMuY2F1Z2h0LCAnbm9MYXp5Q2F0Y2gnKVxuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmNhdWdodCwgKCkgPT4ge1xuXHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoc2spXG5cdFx0fSlcblx0fSxcblxuXHRDbGFzcyhzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BTdXBlckNsYXNzLCBTSy5WYWwpXG5cdFx0dmVyaWZ5RWFjaCh0aGlzLmtpbmRzLCBTSy5WYWwpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcERvKVxuXHRcdHZlcmlmeUVhY2godGhpcy5zdGF0aWNzKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BDb25zdHJ1Y3RvciwgdGhpcy5vcFN1cGVyQ2xhc3MgIT09IG51bGwpXG5cdFx0dmVyaWZ5RWFjaCh0aGlzLm1ldGhvZHMpXG5cdFx0Ly8gbmFtZSBzZXQgYnkgQXNzaWduU2luZ2xlXG5cdH0sXG5cblx0Q2xhc3NLaW5kRG8oKSB7XG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuZGVjbGFyZUZvY3VzLCAoKSA9PiB0aGlzLmJsb2NrLnZlcmlmeShTSy5EbykpXG5cdH0sXG5cblx0Q29uZChzaykge1xuXHRcdC8vIENvdWxkIGJlIGEgc3RhdGVtZW50IGlmIGJvdGggcmVzdWx0cyBhcmUuXG5cdFx0dGhpcy50ZXN0LnZlcmlmeShTSy5WYWwpXG5cdFx0dGhpcy5pZlRydWUudmVyaWZ5KHNrKVxuXHRcdHRoaXMuaWZGYWxzZS52ZXJpZnkoc2spXG5cdH0sXG5cblx0Q29uZGl0aW9uYWwoc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdHRoaXMudGVzdC52ZXJpZnkoU0suVmFsKVxuXHRcdHdpdGhJaWZlSWYodGhpcy5yZXN1bHQgaW5zdGFuY2VvZiBCbG9jayAmJiBzayA9PT0gU0suVmFsLCAoKSA9PiB7XG5cdFx0XHR0aGlzLnJlc3VsdC52ZXJpZnkoc2spXG5cdFx0fSlcblx0fSxcblxuXHRDb25zdHJ1Y3RvcihjbGFzc0hhc1N1cGVyKSB7XG5cdFx0bWFrZVVzZU9wdGlvbmFsKHRoaXMuZnVuLm9wRGVjbGFyZVRoaXMpXG5cdFx0d2l0aE1ldGhvZCh0aGlzLCAoKSA9PiB7XG5cdFx0XHR0aGlzLmZ1bi52ZXJpZnkoU0suVmFsKVxuXHRcdH0pXG5cblx0XHRjb25zdCBzdXBlckNhbGwgPSByZXN1bHRzLmNvbnN0cnVjdG9yVG9TdXBlci5nZXQodGhpcylcblxuXHRcdGlmIChjbGFzc0hhc1N1cGVyKVxuXHRcdFx0Y2hlY2soc3VwZXJDYWxsICE9PSB1bmRlZmluZWQsIHRoaXMubG9jLCAnc3VwZXJOZWVkZWQnKVxuXHRcdGVsc2Vcblx0XHRcdGNoZWNrKHN1cGVyQ2FsbCA9PT0gdW5kZWZpbmVkLCAoKSA9PiBzdXBlckNhbGwubG9jLCAnc3VwZXJGb3JiaWRkZW4nKVxuXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMubWVtYmVyQXJncylcblx0XHRcdHNldERlY2xhcmVBY2Nlc3NlZChfLCB0aGlzKVxuXHR9LFxuXG5cdEV4Y2VwdChzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0aWYgKHRoaXMub3BFbHNlID09PSBudWxsKVxuXHRcdFx0dGhpcy50cnkudmVyaWZ5KHNrKVxuXHRcdGVsc2Uge1xuXHRcdFx0cGx1c0xvY2Fscyh2ZXJpZnlEb0Jsb2NrKHRoaXMudHJ5KSwgKCkgPT4gdGhpcy5vcEVsc2UudmVyaWZ5KHNrKSlcblx0XHRcdGlmIChpc0VtcHR5KHRoaXMuYWxsQ2F0Y2hlcykpXG5cdFx0XHRcdHdhcm4odGhpcy5sb2MsICdlbHNlUmVxdWlyZXNDYXRjaCcpXG5cdFx0fVxuXG5cdFx0aWYgKGlzRW1wdHkodGhpcy5hbGxDYXRjaGVzKSAmJiB0aGlzLm9wRmluYWxseSA9PT0gbnVsbClcblx0XHRcdHdhcm4odGhpcy5sb2MsICd1c2VsZXNzRXhjZXB0JylcblxuXHRcdHZlcmlmeUVhY2godGhpcy50eXBlZENhdGNoZXMsIHNrKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BDYXRjaEFsbCwgc2spXG5cdFx0dmVyaWZ5T3AodGhpcy5vcEZpbmFsbHksIFNLLkRvKVxuXHR9LFxuXG5cdEZvcihzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0dmVyaWZ5Rm9yKHRoaXMpXG5cdH0sXG5cblx0Rm9yQXN5bmMoc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdGNoZWNrKHNrICE9PSBTSy5EbyB8fCBmdW5LaW5kID09PSBGdW5zLkFzeW5jLCB0aGlzLmxvYywgJ2ZvckFzeW5jTmVlZHNBc3luYycpXG5cdFx0d2l0aFZlcmlmeUl0ZXJhdGVlKHRoaXMuaXRlcmF0ZWUsICgpID0+IHtcblx0XHRcdHdpdGhGdW4oRnVucy5Bc3luYywgKCkgPT4ge1xuXHRcdFx0XHQvLyBEZWZhdWx0IGJsb2NrIHRvIHJldHVybmluZyBhIHZhbHVlLCBidXQgT0sgaWYgaXQgZG9lc24ndC5cblx0XHRcdFx0Ly8gSWYgYSBzdGF0ZW1lbnQsIHN0YXRlbWVudCwgdGhlIGNvbXBpbGVkIGNvZGUgd2lsbCBtYWtlIGEgUHJvbWlzZVxuXHRcdFx0XHQvLyB0aGF0IHJlc29sdmVzIHRvIGFuIGFycmF5IGZ1bGwgb2YgYHVuZGVmaW5lZGAuXG5cdFx0XHRcdHRoaXMuYmxvY2sudmVyaWZ5KGdldFNLKHRoaXMuYmxvY2spKVxuXHRcdFx0fSlcblx0XHR9KVxuXHR9LFxuXG5cdEZvckJhZyhzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmJ1aWx0LCAoKSA9PiB2ZXJpZnlGb3IodGhpcykpXG5cdH0sXG5cblx0RnVuKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0Y2hlY2sodGhpcy5vcFJldHVyblR5cGUgPT09IG51bGwgfHwgIXRoaXMuaXNEbywgdGhpcy5sb2MsICdkb0Z1bmNDYW50SGF2ZVR5cGUnKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BSZXR1cm5UeXBlLCBTSy5WYWwpXG5cdFx0Y29uc3QgYXJncyA9IGNhdCh0aGlzLm9wRGVjbGFyZVRoaXMsIHRoaXMuYXJncywgdGhpcy5vcFJlc3RBcmcpXG5cdFx0d2l0aEZ1bih0aGlzLmtpbmQsICgpID0+IHtcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoYXJncywgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeSh0aGlzLmlzRG8gPyBTSy5EbyA6IFNLLlZhbClcblx0XHRcdH0pXG5cdFx0fSlcblx0XHQvLyBuYW1lIHNldCBieSBBc3NpZ25TaW5nbGVcblx0fSxcblxuXHRGdW5BYnN0cmFjdCgpIHtcblx0XHR2ZXJpZnlFYWNoKHRoaXMuYXJncylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wUmVzdEFyZylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wUmV0dXJuVHlwZSwgU0suVmFsKVxuXHR9LFxuXG5cdEdldHRlckZ1bihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdElnbm9yZShzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuaWdub3JlZE5hbWVzKVxuXHRcdFx0YWNjZXNzTG9jYWwodGhpcywgXylcblx0fSxcblxuXHRLaW5kKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dmVyaWZ5RWFjaCh0aGlzLnN1cGVyS2luZHMsIFNLLlZhbClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wRG8sIFNLLkRvKVxuXHRcdHZlcmlmeUVhY2godGhpcy5zdGF0aWNzKVxuXHRcdHZlcmlmeUVhY2godGhpcy5tZXRob2RzKVxuXHRcdC8vIG5hbWUgc2V0IGJ5IEFzc2lnblNpbmdsZVxuXHR9LFxuXG5cdExhenkoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR3aXRoQmxvY2tMb2NhbHMoKCkgPT4gdGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKSlcblx0fSxcblxuXHRMb2NhbEFjY2Vzcyhzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdGNvbnN0IGRlY2xhcmUgPSBsb2NhbHMuZ2V0KHRoaXMubmFtZSlcblx0XHRpZiAoZGVjbGFyZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjb25zdCBidWlsdGluUGF0aCA9IG9wdGlvbnMuYnVpbHRpbk5hbWVUb1BhdGguZ2V0KHRoaXMubmFtZSlcblx0XHRcdGlmIChidWlsdGluUGF0aCA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRmYWlsTWlzc2luZ0xvY2FsKHRoaXMubG9jLCB0aGlzLm5hbWUpXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc3QgbmFtZXMgPSByZXN1bHRzLmJ1aWx0aW5QYXRoVG9OYW1lcy5nZXQoYnVpbHRpblBhdGgpXG5cdFx0XHRcdGlmIChuYW1lcyA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRcdHJlc3VsdHMuYnVpbHRpblBhdGhUb05hbWVzLnNldChidWlsdGluUGF0aCwgbmV3IFNldChbdGhpcy5uYW1lXSkpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRuYW1lcy5hZGQodGhpcy5uYW1lKVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHRzLmxvY2FsQWNjZXNzVG9EZWNsYXJlLnNldCh0aGlzLCBkZWNsYXJlKVxuXHRcdFx0c2V0RGVjbGFyZUFjY2Vzc2VkKGRlY2xhcmUsIHRoaXMpXG5cdFx0fVxuXHR9LFxuXG5cdC8vIEFkZGluZyBMb2NhbERlY2xhcmVzIHRvIHRoZSBhdmFpbGFibGUgbG9jYWxzIGlzIGRvbmUgYnkgRnVuIG9yIGxpbmVOZXdMb2NhbHMuXG5cdExvY2FsRGVjbGFyZSgpIHtcblx0XHRjb25zdCBidWlsdGluUGF0aCA9IG9wdGlvbnMuYnVpbHRpbk5hbWVUb1BhdGguZ2V0KHRoaXMubmFtZSlcblx0XHRpZiAoYnVpbHRpblBhdGggIT09IHVuZGVmaW5lZClcblx0XHRcdHdhcm4odGhpcy5sb2MsICdvdmVycmlkZGVuQnVpbHRpbicsIHRoaXMubmFtZSwgYnVpbHRpblBhdGgpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFR5cGUsIFNLLlZhbClcblx0fSxcblxuXHRMb2NhbE11dGF0ZShzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdExvZ2ljKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0Y2hlY2sodGhpcy5hcmdzLmxlbmd0aCA+IDEsIHRoaXMubG9jLCAnbG9naWNOZWVkc0FyZ3MnKVxuXHRcdHZlcmlmeUVhY2godGhpcy5hcmdzLCBTSy5WYWwpXG5cdH0sXG5cblx0Tm90KHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy5hcmcudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHROdW1iZXJMaXRlcmFsKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdH0sXG5cblx0TWFwRW50cnkoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdFx0dGhpcy5rZXkudmVyaWZ5KFNLLlZhbClcblx0XHR0aGlzLnZhbC52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdE1lbWJlcihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHRoaXMub2JqZWN0LnZlcmlmeShTSy5WYWwpXG5cdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdH0sXG5cblx0TWVtYmVyRnVuKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dmVyaWZ5T3AodGhpcy5vcE9iamVjdCwgU0suVmFsKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdE1lbWJlclNldChzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0dGhpcy5vYmplY3QudmVyaWZ5KFNLLlZhbClcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVHlwZSwgU0suVmFsKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRNZXRob2Qoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRtYWtlVXNlT3B0aW9uYWwodGhpcy5mdW4ub3BEZWNsYXJlVGhpcylcblx0XHR0aGlzLmZ1bi5hcmdzLmZvckVhY2gobWFrZVVzZU9wdGlvbmFsKVxuXHRcdG9wRWFjaCh0aGlzLmZ1bi5vcFJlc3RBcmcsIG1ha2VVc2VPcHRpb25hbClcblx0XHR0aGlzLmZ1bi52ZXJpZnkoU0suVmFsKVxuXHRcdC8vIG5hbWUgc2V0IGJ5IEFzc2lnblNpbmdsZVxuXHR9LFxuXG5cdE1ldGhvZEltcGwoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kSW1wbCh0aGlzLCAoKSA9PiB7XG5cdFx0XHRtYWtlVXNlT3B0aW9uYWwodGhpcy5mdW4ub3BEZWNsYXJlVGhpcylcblx0XHRcdHRoaXMuZnVuLnZlcmlmeShTSy5WYWwpXG5cdFx0fSlcblx0fSxcblx0TWV0aG9kR2V0dGVyKCkge1xuXHRcdHZlcmlmeU1ldGhvZEltcGwodGhpcywgKCkgPT4ge1xuXHRcdFx0bWFrZVVzZU9wdGlvbmFsKHRoaXMuZGVjbGFyZVRoaXMpXG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKFt0aGlzLmRlY2xhcmVUaGlzXSwgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeShTSy5WYWwpXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH0sXG5cdE1ldGhvZFNldHRlcigpIHtcblx0XHR2ZXJpZnlNZXRob2RJbXBsKHRoaXMsICgpID0+IHtcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoW3RoaXMuZGVjbGFyZVRoaXMsIHRoaXMuZGVjbGFyZUZvY3VzXSwgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeShTSy5Ebylcblx0XHRcdH0pXG5cdFx0fSlcblx0fSxcblxuXHRNb2R1bGUoKSB7XG5cdFx0Ly8gTm8gbmVlZCB0byB2ZXJpZnkgdGhpcy5kb0ltcG9ydHMuXG5cdFx0dmVyaWZ5RWFjaCh0aGlzLmltcG9ydHMpXG5cdFx0d2l0aE5hbWUocGF0aE9wdGlvbnMubW9kdWxlTmFtZSgpLCAoKSA9PiB7XG5cdFx0XHR2ZXJpZnlNb2R1bGVMaW5lcyh0aGlzLmxpbmVzLCB0aGlzLmxvYylcblx0XHR9KVxuXHR9LFxuXG5cdE1zUmVnRXhwKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy5wYXJ0cy5mb3JFYWNoKHZlcmlmeU5hbWUpXG5cdFx0Ly8gQ2hlY2sgUmVnRXhwIHZhbGlkaXR5OyBvbmx5IHBvc3NpYmxlIGlmIHRoaXMgaGFzIGEgc2luZ2xlIHBhcnQuXG5cdFx0aWYgKHRoaXMucGFydHMubGVuZ3RoID09PSAxICYmIHR5cGVvZiB0aGlzLnBhcnRzWzBdID09PSAnc3RyaW5nJylcblx0XHRcdHRyeSB7XG5cdFx0XHRcdC8qIGVzbGludC1kaXNhYmxlIG5vLW5ldyAqL1xuXHRcdFx0XHRuZXcgUmVnRXhwKHRoaXMucGFydHNbMF0pXG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0aWYgKCEoZXJyIGluc3RhbmNlb2YgU3ludGF4RXJyb3IpKVxuXHRcdFx0XHRcdC8vIFRoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbi5cblx0XHRcdFx0XHR0aHJvdyBlcnJcblx0XHRcdFx0ZmFpbCh0aGlzLmxvYywgJ2JhZFJlZ0V4cCcsIHRoaXMucGFydHNbMF0pXG5cdFx0XHR9XG5cdH0sXG5cblx0TmV3KHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy50eXBlLnZlcmlmeShTSy5WYWwpXG5cdFx0dmVyaWZ5RWFjaCh0aGlzLmFyZ3MsIFNLLnZhbClcblx0fSxcblxuXHRPYmpFbnRyeUFzc2lnbihzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0aWYgKCFyZXN1bHRzLmlzT2JqRW50cnlFeHBvcnQodGhpcykpXG5cdFx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHRoaXMuYXNzaWduLnZlcmlmeShTSy5Ebylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hc3NpZ24uYWxsQXNzaWduZWVzKCkpXG5cdFx0XHRzZXREZWNsYXJlQWNjZXNzZWQoXywgdGhpcylcblx0fSxcblxuXHRPYmpFbnRyeVBsYWluKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHRpZiAocmVzdWx0cy5pc09iakVudHJ5RXhwb3J0KHRoaXMpKVxuXHRcdFx0Y2hlY2sodHlwZW9mIHRoaXMubmFtZSA9PT0gJ3N0cmluZycsIHRoaXMubG9jLCAnZXhwb3J0TmFtZScpXG5cdFx0ZWxzZSB7XG5cdFx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdFx0fVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRPYmpTaW1wbGUoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRjb25zdCBrZXlzID0gbmV3IFNldCgpXG5cdFx0Zm9yIChjb25zdCB7a2V5LCB2YWx1ZSwgbG9jfSBvZiB0aGlzLnBhaXJzKSB7XG5cdFx0XHRjaGVjaygha2V5cy5oYXMoa2V5KSwgbG9jLCAnZHVwbGljYXRlS2V5Jywga2V5KVxuXHRcdFx0a2V5cy5hZGQoa2V5KVxuXHRcdFx0dmFsdWUudmVyaWZ5KFNLLlZhbClcblx0XHR9XG5cdH0sXG5cblx0UGlwZShzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IHBpcGUgb2YgdGhpcy5waXBlcylcblx0XHRcdHJlZ2lzdGVyQW5kUGx1c0xvY2FsKExvY2FsRGVjbGFyZS5mb2N1cyh0aGlzLmxvYyksICgpID0+IHtcblx0XHRcdFx0cGlwZS52ZXJpZnkoU0suVmFsKVxuXHRcdFx0fSlcblx0fSxcblxuXHRRdW90ZVBsYWluKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy5wYXJ0cy5mb3JFYWNoKHZlcmlmeU5hbWUpXG5cdH0sXG5cblx0UXVvdGVTaW1wbGUoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0fSxcblxuXHRRdW90ZVRhZ2dlZFRlbXBsYXRlKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy50YWcudmVyaWZ5KFNLLlZhbClcblx0XHR0aGlzLnF1b3RlLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0UmFuZ2Uoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR0aGlzLnN0YXJ0LnZlcmlmeShTSy5WYWwpXG5cdFx0dmVyaWZ5T3AodGhpcy5lbmQsIFNLLlZhbClcblx0fSxcblxuXHRTZXRTdWIoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdHRoaXMub2JqZWN0LnZlcmlmeShTSy5WYWwpXG5cdFx0dmVyaWZ5RWFjaCh0aGlzLnN1YmJlZHMsIFNLLlZhbClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVHlwZSwgU0suVmFsKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRTaW1wbGVGdW4oc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR3aXRoQmxvY2tMb2NhbHMoKCkgPT4ge1xuXHRcdFx0d2l0aEluRnVuS2luZChGdW5zLlBsYWluLCAoKSA9PiB7XG5cdFx0XHRcdHJlZ2lzdGVyQW5kUGx1c0xvY2FsKExvY2FsRGVjbGFyZS5mb2N1cyh0aGlzLmxvYyksICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdFx0XHRcdH0pXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH0sXG5cblx0U3BlY2lhbERvKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0fSxcblxuXHRTcGVjaWFsVmFsKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0c2V0TmFtZSh0aGlzKVxuXHR9LFxuXG5cdFNwcmVhZCgpIHtcblx0XHR0aGlzLnNwcmVhZGVkLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0U3VwZXJDYWxsKHNrKSB7XG5cdFx0Y2hlY2sobWV0aG9kICE9PSBudWxsLCB0aGlzLmxvYywgJ3N1cGVyTmVlZHNNZXRob2QnKVxuXHRcdHJlc3VsdHMuc3VwZXJDYWxsVG9NZXRob2Quc2V0KHRoaXMsIG1ldGhvZClcblxuXHRcdGlmIChtZXRob2QgaW5zdGFuY2VvZiBDb25zdHJ1Y3Rvcikge1xuXHRcdFx0Y2hlY2soc2sgPT09IFNLLkRvLCB0aGlzLmxvYywgJ3N1cGVyTXVzdEJlU3RhdGVtZW50Jylcblx0XHRcdHJlc3VsdHMuY29uc3RydWN0b3JUb1N1cGVyLnNldChtZXRob2QsIHRoaXMpXG5cdFx0fVxuXG5cdFx0dmVyaWZ5RWFjaCh0aGlzLmFyZ3MsIFNLLlZhbClcblx0fSxcblxuXHRTdXBlck1lbWJlcihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdGNoZWNrKG1ldGhvZCAhPT0gbnVsbCwgdGhpcy5sb2MsICdzdXBlck5lZWRzTWV0aG9kJylcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0fSxcblxuXHRTd2l0Y2goc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdHdpdGhJaWZlSWZWYWwoc2ssICgpID0+IHtcblx0XHRcdHdpdGhJblN3aXRjaCh0cnVlLCAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuc3dpdGNoZWQudmVyaWZ5KFNLLlZhbClcblx0XHRcdFx0dmVyaWZ5RWFjaCh0aGlzLnBhcnRzLCBzaylcblx0XHRcdFx0dmVyaWZ5T3AodGhpcy5vcEVsc2UsIHNrKVxuXHRcdFx0fSlcblx0XHR9KVxuXHR9LFxuXG5cdFN3aXRjaFBhcnQoc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdHZlcmlmeUVhY2godGhpcy52YWx1ZXMsIFNLLlZhbClcblx0XHR0aGlzLnJlc3VsdC52ZXJpZnkoc2spXG5cdH0sXG5cblx0VGhyb3coKSB7XG5cdFx0dmVyaWZ5T3AodGhpcy5vcFRocm93biwgU0suVmFsKVxuXHR9LFxuXG5cdEltcG9ydCgpIHtcblx0XHQvLyBTaW5jZSBVc2VzIGFyZSBhbHdheXMgaW4gdGhlIG91dGVybW9zdCBzY29wZSwgZG9uJ3QgaGF2ZSB0byB3b3JyeSBhYm91dCBzaGFkb3dpbmcuXG5cdFx0Ly8gU28gd2UgbXV0YXRlIGBsb2NhbHNgIGRpcmVjdGx5LlxuXHRcdGZ1bmN0aW9uIGFkZFVzZUxvY2FsKF8pIHtcblx0XHRcdGNvbnN0IHByZXYgPSBsb2NhbHMuZ2V0KF8ubmFtZSlcblx0XHRcdGlmIChwcmV2ICE9PSB1bmRlZmluZWQpXG5cdFx0XHRcdGZhaWwoXy5sb2MsICdkdXBsaWNhdGVJbXBvcnQnLCBfLm5hbWUsIHByZXYubG9jKVxuXHRcdFx0dmVyaWZ5TG9jYWxEZWNsYXJlKF8pXG5cdFx0XHRzZXRMb2NhbChfKVxuXHRcdH1cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5pbXBvcnRlZClcblx0XHRcdGFkZFVzZUxvY2FsKF8pXG5cdFx0b3BFYWNoKHRoaXMub3BJbXBvcnREZWZhdWx0LCBhZGRVc2VMb2NhbClcblx0fSxcblxuXHRXaXRoKHNrKSB7XG5cdFx0bWFya1N0YXRlbWVudCh0aGlzLCBzaylcblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdFx0d2l0aElpZmVJZlZhbChzaywgKCkgPT4ge1xuXHRcdFx0aWYgKHNrID09PSBTSy5WYWwpXG5cdFx0XHRcdG1ha2VVc2VPcHRpb25hbElmRm9jdXModGhpcy5kZWNsYXJlKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuZGVjbGFyZSwgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeShTSy5Ebylcblx0XHRcdH0pXG5cdFx0fSlcblx0fSxcblxuXHRZaWVsZChfc2spIHtcblx0XHRjaGVjayhmdW5LaW5kID09PSBGdW5zLkdlbmVyYXRvciwgdGhpcy5sb2MsICdtaXNwbGFjZWRZaWVsZCcsIEtleXdvcmRzLllpZWxkKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BWYWx1ZSwgU0suVmFsKVxuXHR9LFxuXG5cdFlpZWxkVG8oX3NrKSB7XG5cdFx0Y2hlY2soZnVuS2luZCA9PT0gRnVucy5HZW5lcmF0b3IsIHRoaXMubG9jLCAnbWlzcGxhY2VkWWllbGQnLCBLZXl3b3Jkcy5ZaWVsZFRvKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fVxufSlcblxuLy8gSGVscGVycyBzcGVjaWZpYyB0byBjZXJ0YWluIE1zQXN0IHR5cGVzXG5cbmZ1bmN0aW9uIHZlcmlmeUZvcihmb3JMb29wKSB7XG5cdGZ1bmN0aW9uIHZlcmlmeUZvckJsb2NrKCkge1xuXHRcdHdpdGhMb29wKGZvckxvb3AsICgpID0+IHtcblx0XHRcdGZvckxvb3AuYmxvY2sudmVyaWZ5KFNLLkRvKVxuXHRcdH0pXG5cdH1cblx0aWZFbHNlKGZvckxvb3Aub3BJdGVyYXRlZSxcblx0XHRfID0+IHtcblx0XHRcdHdpdGhWZXJpZnlJdGVyYXRlZShfLCB2ZXJpZnlGb3JCbG9jaylcblx0XHR9LFxuXHRcdHZlcmlmeUZvckJsb2NrKVxufVxuXG5mdW5jdGlvbiB3aXRoVmVyaWZ5SXRlcmF0ZWUoe2VsZW1lbnQsIGJhZ30sIGFjdGlvbikge1xuXHRiYWcudmVyaWZ5KFNLLlZhbClcblx0dmVyaWZ5Tm90TGF6eShlbGVtZW50LCAnbm9MYXp5SXRlcmF0ZWUnKVxuXHR2ZXJpZnlBbmRQbHVzTG9jYWwoZWxlbWVudCwgYWN0aW9uKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlNZXRob2RJbXBsKF8sIGRvVmVyaWZ5KSB7XG5cdHZlcmlmeU5hbWUoXy5zeW1ib2wpXG5cdHdpdGhNZXRob2QoXywgZG9WZXJpZnkpXG59XG4iXX0=
'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../../CompileError', '../context', '../MsAst', '../Token', '../util', './context', './locals', './SK', './util', './verifyBlock'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../../CompileError'), require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./context'), require('./locals'), require('./SK'), require('./util'), require('./verifyBlock'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.MsAst, global.Token, global.util, global.context, global.locals, global.SK, global.util, global.verifyBlock);
		global.verify = mod.exports;
	}
})(this, function (exports, _CompileError, _context, _MsAst, _Token, _util, _context2, _locals, _SK, _util2, _verifyBlock) {
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
			(0, _context.check)(_context2.funKind === _MsAst.Funs.Async, this.loc, () => `Cannot ${ (0, _Token.showKeyword)(_Token.Keywords.Await) } outside of async function.`);
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
			(0, _context.check)(_context2.opLoop !== null, this.loc, 'Not in a loop.');
			const loop = _context2.opLoop;
			if (loop instanceof _MsAst.For) {
				if (_context2.results.isStatement(loop)) (0, _context.check)(this.opValue === null, this.loc, () => `${ (0, _Token.showKeyword)(_Token.Keywords.Break) } with value is only valid in ` + `${ (0, _Token.showKeyword)(_Token.Keywords.For) } in expression position.`);else (0, _context.check)(this.opValue !== null, this.loc, () => `${ (0, _Token.showKeyword)(_Token.Keywords.For) } in expression position must ` + `${ (0, _Token.showKeyword)(_Token.Keywords.Break) } with a value.`);
			} else {
				(0, _util.assert)(loop instanceof _MsAst.ForBag);
				(0, _context.check)(this.opValue === null, this.loc, () => `${ (0, _Token.showKeyword)(_Token.Keywords.Break) } in ${ (0, _Token.showKeyword)(_Token.Keywords.ForBag) } ` + `may not have value.`);
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
			(0, _util2.verifyNotLazy)(this.caught, 'Caught error can not be lazy.');
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

			if (classHasSuper) (0, _context.check)(superCall !== undefined, this.loc, () => `Constructor must contain ${ (0, _Token.showKeyword)(_Token.Keywords.Super) }`);else (0, _context.check)(superCall === undefined, () => superCall.loc, () => `Class has no superclass, so ${ (0, _Token.showKeyword)(_Token.Keywords.Super) } is not allowed.`);

			for (const _ of this.memberArgs) (0, _locals.setDeclareAccessed)(_, this);
		},

		Except(sk) {
			(0, _SK.markStatement)(this, sk);
			if (this.opElse === null) this.try.verify(sk);else {
				(0, _locals.plusLocals)((0, _verifyBlock.verifyDoBlock)(this.try), () => this.opElse.verify(sk));
				if ((0, _util.isEmpty)(this.allCatches)) (0, _context.warn)(this.loc, `${ (0, _Token.showKeyword)(_Token.Keywords.Else) } must come after ${ (0, _Token.showKeyword)(_Token.Keywords.Catch) }.`);
			}
			if ((0, _util.isEmpty)(this.allCatches) && this.opFinally === null) (0, _context.warn)(this.loc, `${ (0, _Token.showKeyword)(_Token.Keywords.Except) } is pointless without ` + `${ (0, _Token.showKeyword)(_Token.Keywords.Catch) } or ${ (0, _Token.showKeyword)(_Token.Keywords.Finally) }.`);
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
			(0, _context.check)(sk !== _SK2.default.Do || _context2.funKind === _MsAst.Funs.Async, this.loc, () => `${ (0, _Token.showKeyword)(_Token.Keywords.ForAsync) } as statement must be inside an async function.`);
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
			(0, _context.check)(this.opReturnType === null || !this.isDo, this.loc, 'Function with return type must return something.');
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

			if (builtinPath !== undefined) (0, _context.warn)(this.loc, `Local ${ (0, _CompileError.code)(this.name) } overrides builtin from ${ (0, _CompileError.code)(builtinPath) }.`);
			(0, _util2.verifyOp)(this.opType, _SK2.default.Val);
		},

		LocalMutate(sk) {
			(0, _SK.checkDo)(this, sk);
			this.value.verify(_SK2.default.Val);
		},

		Logic(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _context.check)(this.args.length > 1, this.loc, 'Logic expression needs at least 2 arguments.');
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
				(0, _context.fail)(this.loc, err.message);
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
			if (_context2.results.isObjEntryExport(this)) (0, _context.check)(typeof this.name === 'string', this.loc, 'Module export must have a constant name.');else {
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
				(0, _context.check)(!keys.has(key), loc, () => `Duplicate key ${ key }`);
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
			(0, _context.check)(_context2.method !== null, this.loc, 'Must be in a method.');

			_context2.results.superCallToMethod.set(this, _context2.method);

			if (_context2.method instanceof _MsAst.Constructor) {
				(0, _context.check)(sk === _SK2.default.Do, this.loc, () => `${ (0, _Token.showKeyword)(_Token.Keywords.Super) } in constructor must appear as a statement.'`);

				_context2.results.constructorToSuper.set(_context2.method, this);
			}

			(0, _util2.verifyEach)(this.args, _SK2.default.Val);
		},

		SuperMember(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _context.check)(_context2.method !== null, this.loc, 'Must be in method.');
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

				(0, _context.check)(prev === undefined, _.loc, () => `${ (0, _CompileError.code)(_.name) } already imported at ${ prev.loc }`);
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
			(0, _context.check)(_context2.funKind === _MsAst.Funs.Generator, this.loc, () => `Cannot ${ (0, _Token.showKeyword)(_Token.Keywords.Yield) } outside of generator function.`);
			(0, _util2.verifyOp)(this.opValue, _SK2.default.Val);
		},

		YieldTo(_sk) {
			(0, _context.check)(_context2.funKind === _MsAst.Funs.Generator, this.loc, () => `Cannot ${ (0, _Token.showKeyword)(_Token.Keywords.YieldTo) } outside of generator function.`);
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
		(0, _util2.verifyNotLazy)(element, 'Iteration element can not be lazy.');
		(0, _locals.verifyAndPlusLocal)(element, action);
	}

	function verifyMethodImpl(_, doVerify) {
		(0, _util2.verifyName)(_.symbol);
		(0, _context2.withMethod)(_, doVerify);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQXVCd0IsTUFBTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQUFOLE1BQU0iLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCBmYWlsLCBvcHRpb25zLCBwYXRoT3B0aW9ucywgd2Fybn0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCAqIGFzIE1zQXN0VHlwZXMgZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0Jsb2NrLCBDbGFzcywgQ29uc3RydWN0b3IsIEZvciwgRm9yQmFnLCBGdW4sIEZ1bnMsIEtpbmQsIExvY2FsRGVjbGFyZSwgTWV0aG9kLCBQYXR0ZXJuXG5cdH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0tleXdvcmRzLCBzaG93S2V5d29yZH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2Fzc2VydCwgY2F0LCBpZkVsc2UsIGltcGxlbWVudE1hbnksIGlzRW1wdHksIG9wRWFjaH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7ZnVuS2luZCwgaXNJblN3aXRjaCwgbG9jYWxzLCBtZXRob2QsIG9wTG9vcCwgcmVzdWx0cywgc2V0dXAsIHRlYXJEb3duLCB3aXRoRnVuLCB3aXRoSWlmZSxcblx0d2l0aElpZmVJZiwgd2l0aElpZmVJZlZhbCwgd2l0aEluRnVuS2luZCwgd2l0aEluU3dpdGNoLCB3aXRoTWV0aG9kLCB3aXRoTG9vcCwgd2l0aE5hbWVcblx0fSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge2FjY2Vzc0xvY2FsLCBmYWlsTWlzc2luZ0xvY2FsLCBwbHVzTG9jYWxzLCByZWdpc3RlckFuZFBsdXNMb2NhbCwgc2V0RGVjbGFyZUFjY2Vzc2VkLFxuXHRzZXRMb2NhbCwgdmVyaWZ5QW5kUGx1c0xvY2FsLCB2ZXJpZnlBbmRQbHVzTG9jYWxzLCB2ZXJpZnlMb2NhbERlY2xhcmUsIHdhcm5VbnVzZWRMb2NhbHMsXG5cdHdpdGhCbG9ja0xvY2Fsc30gZnJvbSAnLi9sb2NhbHMnXG5pbXBvcnQgU0ssIHtjaGVja0RvLCBjaGVja1ZhbCwgZ2V0U0ssIG1hcmtTdGF0ZW1lbnR9IGZyb20gJy4vU0snXG5pbXBvcnQge21ha2VVc2VPcHRpb25hbCwgbWFrZVVzZU9wdGlvbmFsSWZGb2N1cywgc2V0TmFtZSwgdmVyaWZ5RWFjaCwgdmVyaWZ5TmFtZSwgdmVyaWZ5Tm90TGF6eSxcblx0dmVyaWZ5T3B9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB2ZXJpZnlCbG9jaywge3ZlcmlmeURvQmxvY2ssIHZlcmlmeU1vZHVsZUxpbmVzfSBmcm9tICcuL3ZlcmlmeUJsb2NrJ1xuXG4vKipcbkdlbmVyYXRlcyBpbmZvcm1hdGlvbiBuZWVkZWQgZHVyaW5nIHRyYW5zcGlsaW5nLCB0aGUgVmVyaWZ5UmVzdWx0cy5cbkFsc28gY2hlY2tzIGZvciBleGlzdGVuY2Ugb2YgbG9jYWwgdmFyaWFibGVzIGFuZCB3YXJucyBmb3IgdW51c2VkIGxvY2Fscy5cbkBwYXJhbSB7TXNBc3R9IG1zQXN0XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdmVyaWZ5KG1zQXN0KSB7XG5cdHNldHVwKClcblx0bXNBc3QudmVyaWZ5KClcblx0d2FyblVudXNlZExvY2FscygpXG5cdGNvbnN0IHJlcyA9IHJlc3VsdHNcblx0dGVhckRvd24oKVxuXHRyZXR1cm4gcmVzXG59XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ3ZlcmlmeScsIHtcblx0QXNzZXJ0KHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHR0aGlzLmNvbmRpdGlvbi52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BUaHJvd24sIFNLLlZhbClcblx0fSxcblxuXHRBc3NpZ25TaW5nbGUoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdHdpdGhOYW1lKHRoaXMuYXNzaWduZWUubmFtZSwgKCkgPT4ge1xuXHRcdFx0Y29uc3QgZG9WID0gKCkgPT4ge1xuXHRcdFx0XHQvKlxuXHRcdFx0XHRGdW4gYW5kIENsYXNzIG9ubHkgZ2V0IG5hbWUgaWYgdGhleSBhcmUgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIGFzc2lnbm1lbnQuXG5cdFx0XHRcdHNvIGluIGB4ID0gJGFmdGVyLXRpbWUgMTAwMCB8YCB0aGUgZnVuY3Rpb24gaXMgbm90IG5hbWVkLlxuXHRcdFx0XHQqL1xuXHRcdFx0XHRpZiAodGhpcy52YWx1ZSBpbnN0YW5jZW9mIENsYXNzIHx8XG5cdFx0XHRcdFx0dGhpcy52YWx1ZSBpbnN0YW5jZW9mIEZ1biB8fFxuXHRcdFx0XHRcdHRoaXMudmFsdWUgaW5zdGFuY2VvZiBNZXRob2QgfHxcblx0XHRcdFx0XHR0aGlzLnZhbHVlIGluc3RhbmNlb2YgS2luZClcblx0XHRcdFx0XHRzZXROYW1lKHRoaXMudmFsdWUpXG5cblx0XHRcdFx0Ly8gQXNzaWduZWUgcmVnaXN0ZXJlZCBieSB2ZXJpZnlMaW5lcy5cblx0XHRcdFx0dGhpcy5hc3NpZ25lZS52ZXJpZnkoKVxuXHRcdFx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy5hc3NpZ25lZS5pc0xhenkoKSlcblx0XHRcdFx0d2l0aEJsb2NrTG9jYWxzKGRvVilcblx0XHRcdGVsc2Vcblx0XHRcdFx0ZG9WKClcblx0XHR9KVxuXHR9LFxuXG5cdEFzc2lnbkRlc3RydWN0dXJlKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHQvLyBBc3NpZ25lZXMgcmVnaXN0ZXJlZCBieSB2ZXJpZnlMaW5lcy5cblx0XHR2ZXJpZnlFYWNoKHRoaXMuYXNzaWduZWVzKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRBd2FpdChfc2spIHtcblx0XHRjaGVjayhmdW5LaW5kID09PSBGdW5zLkFzeW5jLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdGBDYW5ub3QgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5Bd2FpdCl9IG91dHNpZGUgb2YgYXN5bmMgZnVuY3Rpb24uYClcblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0QmFnRW50cnkoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdEJhZ1NpbXBsZShzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHZlcmlmeUVhY2godGhpcy5wYXJ0cywgU0suVmFsKVxuXHR9LFxuXG5cdEJsb2NrOiB2ZXJpZnlCbG9jayxcblxuXHRCbG9ja1dyYXAoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR3aXRoSWlmZSgoKSA9PiB0aGlzLmJsb2NrLnZlcmlmeShzaykpXG5cdH0sXG5cblx0QnJlYWsoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BWYWx1ZSwgU0suVmFsKVxuXHRcdGNoZWNrKG9wTG9vcCAhPT0gbnVsbCwgdGhpcy5sb2MsICdOb3QgaW4gYSBsb29wLicpXG5cdFx0Y29uc3QgbG9vcCA9IG9wTG9vcFxuXG5cdFx0aWYgKGxvb3AgaW5zdGFuY2VvZiBGb3IpXG5cdFx0XHRpZiAocmVzdWx0cy5pc1N0YXRlbWVudChsb29wKSlcblx0XHRcdFx0Y2hlY2sodGhpcy5vcFZhbHVlID09PSBudWxsLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdFx0XHRgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5CcmVhayl9IHdpdGggdmFsdWUgaXMgb25seSB2YWxpZCBpbiBgICtcblx0XHRcdFx0XHRgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5Gb3IpfSBpbiBleHByZXNzaW9uIHBvc2l0aW9uLmApXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGNoZWNrKHRoaXMub3BWYWx1ZSAhPT0gbnVsbCwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRcdFx0YCR7c2hvd0tleXdvcmQoS2V5d29yZHMuRm9yKX0gaW4gZXhwcmVzc2lvbiBwb3NpdGlvbiBtdXN0IGAgK1xuXHRcdFx0XHRcdGAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkJyZWFrKX0gd2l0aCBhIHZhbHVlLmApXG5cdFx0ZWxzZSB7XG5cdFx0XHQvLyAoRm9yQXN5bmMgaXNuJ3QgcmVhbGx5IGEgbG9vcClcblx0XHRcdGFzc2VydChsb29wIGluc3RhbmNlb2YgRm9yQmFnKVxuXHRcdFx0Y2hlY2sodGhpcy5vcFZhbHVlID09PSBudWxsLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdFx0YCR7c2hvd0tleXdvcmQoS2V5d29yZHMuQnJlYWspfSBpbiAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkZvckJhZyl9IGAgK1xuXHRcdFx0XHRgbWF5IG5vdCBoYXZlIHZhbHVlLmApXG5cdFx0fVxuXG5cdFx0aWYgKGlzSW5Td2l0Y2gpIHtcblx0XHRcdHJlc3VsdHMubG9vcHNOZWVkaW5nTGFiZWwuYWRkKGxvb3ApXG5cdFx0XHRyZXN1bHRzLmJyZWFrc0luU3dpdGNoLmFkZCh0aGlzKVxuXHRcdH1cblx0fSxcblxuXHRDYWxsKF9zaykge1xuXHRcdHRoaXMuY2FsbGVkLnZlcmlmeShTSy5WYWwpXG5cdFx0dmVyaWZ5RWFjaCh0aGlzLmFyZ3MsIFNLLlZhbClcblx0fSxcblxuXHRDYXNlKHNrKSB7XG5cdFx0bWFya1N0YXRlbWVudCh0aGlzLCBzaylcblx0XHR3aXRoSWlmZUlmVmFsKHNrLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBkb0l0ID0gKCkgPT4ge1xuXHRcdFx0XHR2ZXJpZnlFYWNoKHRoaXMucGFydHMsIHNrKVxuXHRcdFx0XHR2ZXJpZnlPcCh0aGlzLm9wRWxzZSwgc2spXG5cdFx0XHR9XG5cdFx0XHRpZkVsc2UodGhpcy5vcENhc2VkLFxuXHRcdFx0XHRfID0+IHtcblx0XHRcdFx0XHRfLnZlcmlmeShTSy5Ebylcblx0XHRcdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwoXy5hc3NpZ25lZSwgZG9JdClcblx0XHRcdFx0fSxcblx0XHRcdFx0ZG9JdClcblx0XHR9KVxuXHR9LFxuXG5cdENhc2VQYXJ0KHNrKSB7XG5cdFx0aWYgKHRoaXMudGVzdCBpbnN0YW5jZW9mIFBhdHRlcm4pIHtcblx0XHRcdHRoaXMudGVzdC50eXBlLnZlcmlmeShTSy5WYWwpXG5cdFx0XHR0aGlzLnRlc3QucGF0dGVybmVkLnZlcmlmeShTSy5WYWwpXG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKHRoaXMudGVzdC5sb2NhbHMsICgpID0+IHRoaXMucmVzdWx0LnZlcmlmeShzaykpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudGVzdC52ZXJpZnkoU0suVmFsKVxuXHRcdFx0dGhpcy5yZXN1bHQudmVyaWZ5KHNrKVxuXHRcdH1cblx0fSxcblxuXHRDYXRjaChzaykge1xuXHRcdC8vIE5vIG5lZWQgdG8gZG8gYW55dGhpbmcgd2l0aCBgc2tgIGV4Y2VwdCBwYXNzIGl0IHRvIG15IGJsb2NrLlxuXHRcdG1ha2VVc2VPcHRpb25hbElmRm9jdXModGhpcy5jYXVnaHQpXG5cdFx0dmVyaWZ5Tm90TGF6eSh0aGlzLmNhdWdodCwgJ0NhdWdodCBlcnJvciBjYW4gbm90IGJlIGxhenkuJylcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5jYXVnaHQsICgpID0+IHtcblx0XHRcdHRoaXMuYmxvY2sudmVyaWZ5KHNrKVxuXHRcdH0pXG5cdH0sXG5cblx0Q2xhc3Moc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wU3VwZXJDbGFzcywgU0suVmFsKVxuXHRcdHZlcmlmeUVhY2godGhpcy5raW5kcywgU0suVmFsKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BEbylcblx0XHR2ZXJpZnlFYWNoKHRoaXMuc3RhdGljcylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wQ29uc3RydWN0b3IsIHRoaXMub3BTdXBlckNsYXNzICE9PSBudWxsKVxuXHRcdHZlcmlmeUVhY2godGhpcy5tZXRob2RzKVxuXHRcdC8vIG5hbWUgc2V0IGJ5IEFzc2lnblNpbmdsZVxuXHR9LFxuXG5cdENsYXNzS2luZERvKCkge1xuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmRlY2xhcmVGb2N1cywgKCkgPT4gdGhpcy5ibG9jay52ZXJpZnkoU0suRG8pKVxuXHR9LFxuXG5cdENvbmQoc2spIHtcblx0XHQvLyBDb3VsZCBiZSBhIHN0YXRlbWVudCBpZiBib3RoIHJlc3VsdHMgYXJlLlxuXHRcdHRoaXMudGVzdC52ZXJpZnkoU0suVmFsKVxuXHRcdHRoaXMuaWZUcnVlLnZlcmlmeShzaylcblx0XHR0aGlzLmlmRmFsc2UudmVyaWZ5KHNrKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsKHNrKSB7XG5cdFx0bWFya1N0YXRlbWVudCh0aGlzLCBzaylcblx0XHR0aGlzLnRlc3QudmVyaWZ5KFNLLlZhbClcblx0XHR3aXRoSWlmZUlmKHRoaXMucmVzdWx0IGluc3RhbmNlb2YgQmxvY2sgJiYgc2sgPT09IFNLLlZhbCwgKCkgPT4ge1xuXHRcdFx0dGhpcy5yZXN1bHQudmVyaWZ5KHNrKVxuXHRcdH0pXG5cdH0sXG5cblx0Q29uc3RydWN0b3IoY2xhc3NIYXNTdXBlcikge1xuXHRcdG1ha2VVc2VPcHRpb25hbCh0aGlzLmZ1bi5vcERlY2xhcmVUaGlzKVxuXHRcdHdpdGhNZXRob2QodGhpcywgKCkgPT4ge1xuXHRcdFx0dGhpcy5mdW4udmVyaWZ5KFNLLlZhbClcblx0XHR9KVxuXG5cdFx0Y29uc3Qgc3VwZXJDYWxsID0gcmVzdWx0cy5jb25zdHJ1Y3RvclRvU3VwZXIuZ2V0KHRoaXMpXG5cblx0XHRpZiAoY2xhc3NIYXNTdXBlcilcblx0XHRcdGNoZWNrKHN1cGVyQ2FsbCAhPT0gdW5kZWZpbmVkLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdFx0YENvbnN0cnVjdG9yIG11c3QgY29udGFpbiAke3Nob3dLZXl3b3JkKEtleXdvcmRzLlN1cGVyKX1gKVxuXHRcdGVsc2Vcblx0XHRcdGNoZWNrKHN1cGVyQ2FsbCA9PT0gdW5kZWZpbmVkLCAoKSA9PiBzdXBlckNhbGwubG9jLCAoKSA9PlxuXHRcdFx0XHRgQ2xhc3MgaGFzIG5vIHN1cGVyY2xhc3MsIHNvICR7c2hvd0tleXdvcmQoS2V5d29yZHMuU3VwZXIpfSBpcyBub3QgYWxsb3dlZC5gKVxuXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMubWVtYmVyQXJncylcblx0XHRcdHNldERlY2xhcmVBY2Nlc3NlZChfLCB0aGlzKVxuXHR9LFxuXG5cdEV4Y2VwdChzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0aWYgKHRoaXMub3BFbHNlID09PSBudWxsKVxuXHRcdFx0dGhpcy50cnkudmVyaWZ5KHNrKVxuXHRcdGVsc2Uge1xuXHRcdFx0cGx1c0xvY2Fscyh2ZXJpZnlEb0Jsb2NrKHRoaXMudHJ5KSwgKCkgPT4gdGhpcy5vcEVsc2UudmVyaWZ5KHNrKSlcblx0XHRcdGlmIChpc0VtcHR5KHRoaXMuYWxsQ2F0Y2hlcykpXG5cdFx0XHRcdHdhcm4odGhpcy5sb2MsXG5cdFx0XHRcdFx0YCR7c2hvd0tleXdvcmQoS2V5d29yZHMuRWxzZSl9IG11c3QgY29tZSBhZnRlciAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkNhdGNoKX0uYClcblx0XHR9XG5cblx0XHRpZiAoaXNFbXB0eSh0aGlzLmFsbENhdGNoZXMpICYmIHRoaXMub3BGaW5hbGx5ID09PSBudWxsKVxuXHRcdFx0d2Fybih0aGlzLmxvYywgYCR7c2hvd0tleXdvcmQoS2V5d29yZHMuRXhjZXB0KX0gaXMgcG9pbnRsZXNzIHdpdGhvdXQgYCArXG5cdFx0XHRcdGAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkNhdGNoKX0gb3IgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5GaW5hbGx5KX0uYClcblxuXHRcdHZlcmlmeUVhY2godGhpcy50eXBlZENhdGNoZXMsIHNrKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BDYXRjaEFsbCwgc2spXG5cdFx0dmVyaWZ5T3AodGhpcy5vcEZpbmFsbHksIFNLLkRvKVxuXHR9LFxuXG5cdEZvcihzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0dmVyaWZ5Rm9yKHRoaXMpXG5cdH0sXG5cblx0Rm9yQXN5bmMoc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdGNoZWNrKHNrICE9PSBTSy5EbyB8fCBmdW5LaW5kID09PSBGdW5zLkFzeW5jLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdGAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkZvckFzeW5jKX0gYXMgc3RhdGVtZW50IG11c3QgYmUgaW5zaWRlIGFuIGFzeW5jIGZ1bmN0aW9uLmApXG5cblx0XHR3aXRoVmVyaWZ5SXRlcmF0ZWUodGhpcy5pdGVyYXRlZSwgKCkgPT4ge1xuXHRcdFx0d2l0aEZ1bihGdW5zLkFzeW5jLCAoKSA9PiB7XG5cdFx0XHRcdC8vIERlZmF1bHQgYmxvY2sgdG8gcmV0dXJuaW5nIGEgdmFsdWUsIGJ1dCBPSyBpZiBpdCBkb2Vzbid0LlxuXHRcdFx0XHQvLyBJZiBhIHN0YXRlbWVudCwgc3RhdGVtZW50LCB0aGUgY29tcGlsZWQgY29kZSB3aWxsIG1ha2UgYSBQcm9taXNlXG5cdFx0XHRcdC8vIHRoYXQgcmVzb2x2ZXMgdG8gYW4gYXJyYXkgZnVsbCBvZiBgdW5kZWZpbmVkYC5cblx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoZ2V0U0sodGhpcy5ibG9jaykpXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH0sXG5cblx0Rm9yQmFnKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuYnVpbHQsICgpID0+IHZlcmlmeUZvcih0aGlzKSlcblx0fSxcblxuXHRGdW4oc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRjaGVjayh0aGlzLm9wUmV0dXJuVHlwZSA9PT0gbnVsbCB8fCAhdGhpcy5pc0RvLCB0aGlzLmxvYyxcblx0XHRcdCdGdW5jdGlvbiB3aXRoIHJldHVybiB0eXBlIG11c3QgcmV0dXJuIHNvbWV0aGluZy4nKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BSZXR1cm5UeXBlLCBTSy5WYWwpXG5cdFx0Y29uc3QgYXJncyA9IGNhdCh0aGlzLm9wRGVjbGFyZVRoaXMsIHRoaXMuYXJncywgdGhpcy5vcFJlc3RBcmcpXG5cdFx0d2l0aEZ1bih0aGlzLmtpbmQsICgpID0+IHtcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoYXJncywgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeSh0aGlzLmlzRG8gPyBTSy5EbyA6IFNLLlZhbClcblx0XHRcdH0pXG5cdFx0fSlcblx0XHQvLyBuYW1lIHNldCBieSBBc3NpZ25TaW5nbGVcblx0fSxcblxuXHRGdW5BYnN0cmFjdCgpIHtcblx0XHR2ZXJpZnlFYWNoKHRoaXMuYXJncylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wUmVzdEFyZylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wUmV0dXJuVHlwZSwgU0suVmFsKVxuXHR9LFxuXG5cdEdldHRlckZ1bihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdElnbm9yZShzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuaWdub3JlZE5hbWVzKVxuXHRcdFx0YWNjZXNzTG9jYWwodGhpcywgXylcblx0fSxcblxuXHRLaW5kKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dmVyaWZ5RWFjaCh0aGlzLnN1cGVyS2luZHMsIFNLLlZhbClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wRG8sIFNLLkRvKVxuXHRcdHZlcmlmeUVhY2godGhpcy5zdGF0aWNzKVxuXHRcdHZlcmlmeUVhY2godGhpcy5tZXRob2RzKVxuXHRcdC8vIG5hbWUgc2V0IGJ5IEFzc2lnblNpbmdsZVxuXHR9LFxuXG5cdExhenkoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR3aXRoQmxvY2tMb2NhbHMoKCkgPT4gdGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKSlcblx0fSxcblxuXHRMb2NhbEFjY2Vzcyhzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdGNvbnN0IGRlY2xhcmUgPSBsb2NhbHMuZ2V0KHRoaXMubmFtZSlcblx0XHRpZiAoZGVjbGFyZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjb25zdCBidWlsdGluUGF0aCA9IG9wdGlvbnMuYnVpbHRpbk5hbWVUb1BhdGguZ2V0KHRoaXMubmFtZSlcblx0XHRcdGlmIChidWlsdGluUGF0aCA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRmYWlsTWlzc2luZ0xvY2FsKHRoaXMubG9jLCB0aGlzLm5hbWUpXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc3QgbmFtZXMgPSByZXN1bHRzLmJ1aWx0aW5QYXRoVG9OYW1lcy5nZXQoYnVpbHRpblBhdGgpXG5cdFx0XHRcdGlmIChuYW1lcyA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRcdHJlc3VsdHMuYnVpbHRpblBhdGhUb05hbWVzLnNldChidWlsdGluUGF0aCwgbmV3IFNldChbdGhpcy5uYW1lXSkpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRuYW1lcy5hZGQodGhpcy5uYW1lKVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHRzLmxvY2FsQWNjZXNzVG9EZWNsYXJlLnNldCh0aGlzLCBkZWNsYXJlKVxuXHRcdFx0c2V0RGVjbGFyZUFjY2Vzc2VkKGRlY2xhcmUsIHRoaXMpXG5cdFx0fVxuXHR9LFxuXG5cdC8vIEFkZGluZyBMb2NhbERlY2xhcmVzIHRvIHRoZSBhdmFpbGFibGUgbG9jYWxzIGlzIGRvbmUgYnkgRnVuIG9yIGxpbmVOZXdMb2NhbHMuXG5cdExvY2FsRGVjbGFyZSgpIHtcblx0XHRjb25zdCBidWlsdGluUGF0aCA9IG9wdGlvbnMuYnVpbHRpbk5hbWVUb1BhdGguZ2V0KHRoaXMubmFtZSlcblx0XHRpZiAoYnVpbHRpblBhdGggIT09IHVuZGVmaW5lZClcblx0XHRcdHdhcm4odGhpcy5sb2MsIGBMb2NhbCAke2NvZGUodGhpcy5uYW1lKX0gb3ZlcnJpZGVzIGJ1aWx0aW4gZnJvbSAke2NvZGUoYnVpbHRpblBhdGgpfS5gKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BUeXBlLCBTSy5WYWwpXG5cdH0sXG5cblx0TG9jYWxNdXRhdGUoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRMb2dpYyhzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdGNoZWNrKHRoaXMuYXJncy5sZW5ndGggPiAxLCB0aGlzLmxvYywgJ0xvZ2ljIGV4cHJlc3Npb24gbmVlZHMgYXQgbGVhc3QgMiBhcmd1bWVudHMuJylcblx0XHR2ZXJpZnlFYWNoKHRoaXMuYXJncywgU0suVmFsKVxuXHR9LFxuXG5cdE5vdChzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHRoaXMuYXJnLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0TnVtYmVyTGl0ZXJhbChzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHR9LFxuXG5cdE1hcEVudHJ5KHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHRoaXMua2V5LnZlcmlmeShTSy5WYWwpXG5cdFx0dGhpcy52YWwudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRNZW1iZXIoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR0aGlzLm9iamVjdC52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdE1lbWJlckZ1bihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BPYmplY3QsIFNLLlZhbClcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0fSxcblxuXHRNZW1iZXJTZXQoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdHRoaXMub2JqZWN0LnZlcmlmeShTSy5WYWwpXG5cdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFR5cGUsIFNLLlZhbClcblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0TWV0aG9kKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0bWFrZVVzZU9wdGlvbmFsKHRoaXMuZnVuLm9wRGVjbGFyZVRoaXMpXG5cdFx0dGhpcy5mdW4uYXJncy5mb3JFYWNoKG1ha2VVc2VPcHRpb25hbClcblx0XHRvcEVhY2godGhpcy5mdW4ub3BSZXN0QXJnLCBtYWtlVXNlT3B0aW9uYWwpXG5cdFx0dGhpcy5mdW4udmVyaWZ5KFNLLlZhbClcblx0XHQvLyBuYW1lIHNldCBieSBBc3NpZ25TaW5nbGVcblx0fSxcblxuXHRNZXRob2RJbXBsKCkge1xuXHRcdHZlcmlmeU1ldGhvZEltcGwodGhpcywgKCkgPT4ge1xuXHRcdFx0bWFrZVVzZU9wdGlvbmFsKHRoaXMuZnVuLm9wRGVjbGFyZVRoaXMpXG5cdFx0XHR0aGlzLmZ1bi52ZXJpZnkoU0suVmFsKVxuXHRcdH0pXG5cdH0sXG5cdE1ldGhvZEdldHRlcigpIHtcblx0XHR2ZXJpZnlNZXRob2RJbXBsKHRoaXMsICgpID0+IHtcblx0XHRcdG1ha2VVc2VPcHRpb25hbCh0aGlzLmRlY2xhcmVUaGlzKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FscyhbdGhpcy5kZWNsYXJlVGhpc10sICgpID0+IHtcblx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoU0suVmFsKVxuXHRcdFx0fSlcblx0XHR9KVxuXHR9LFxuXHRNZXRob2RTZXR0ZXIoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kSW1wbCh0aGlzLCAoKSA9PiB7XG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKFt0aGlzLmRlY2xhcmVUaGlzLCB0aGlzLmRlY2xhcmVGb2N1c10sICgpID0+IHtcblx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoU0suRG8pXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH0sXG5cblx0TW9kdWxlKCkge1xuXHRcdC8vIE5vIG5lZWQgdG8gdmVyaWZ5IHRoaXMuZG9JbXBvcnRzLlxuXHRcdHZlcmlmeUVhY2godGhpcy5pbXBvcnRzKVxuXHRcdHdpdGhOYW1lKHBhdGhPcHRpb25zLm1vZHVsZU5hbWUoKSwgKCkgPT4ge1xuXHRcdFx0dmVyaWZ5TW9kdWxlTGluZXModGhpcy5saW5lcywgdGhpcy5sb2MpXG5cdFx0fSlcblx0fSxcblxuXHRNc1JlZ0V4cChzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHRoaXMucGFydHMuZm9yRWFjaCh2ZXJpZnlOYW1lKVxuXHRcdC8vIENoZWNrIFJlZ0V4cCB2YWxpZGl0eTsgb25seSBwb3NzaWJsZSBpZiB0aGlzIGhhcyBhIHNpbmdsZSBwYXJ0LlxuXHRcdGlmICh0aGlzLnBhcnRzLmxlbmd0aCA9PT0gMSAmJiB0eXBlb2YgdGhpcy5wYXJ0c1swXSA9PT0gJ3N0cmluZycpXG5cdFx0XHR0cnkge1xuXHRcdFx0XHQvKiBlc2xpbnQtZGlzYWJsZSBuby1uZXcgKi9cblx0XHRcdFx0bmV3IFJlZ0V4cCh0aGlzLnBhcnRzWzBdKVxuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdGlmICghKGVyciBpbnN0YW5jZW9mIFN5bnRheEVycm9yKSlcblx0XHRcdFx0XHQvLyBUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4uXG5cdFx0XHRcdFx0dGhyb3cgZXJyXG5cdFx0XHRcdGZhaWwodGhpcy5sb2MsIGVyci5tZXNzYWdlKVxuXHRcdFx0fVxuXHR9LFxuXG5cdE5ldyhzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHRoaXMudHlwZS52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeUVhY2godGhpcy5hcmdzLCBTSy52YWwpXG5cdH0sXG5cblx0T2JqRW50cnlBc3NpZ24oc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdGlmICghcmVzdWx0cy5pc09iakVudHJ5RXhwb3J0KHRoaXMpKVxuXHRcdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR0aGlzLmFzc2lnbi52ZXJpZnkoU0suRG8pXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXNzaWduLmFsbEFzc2lnbmVlcygpKVxuXHRcdFx0c2V0RGVjbGFyZUFjY2Vzc2VkKF8sIHRoaXMpXG5cdH0sXG5cblx0T2JqRW50cnlQbGFpbihzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0aWYgKHJlc3VsdHMuaXNPYmpFbnRyeUV4cG9ydCh0aGlzKSlcblx0XHRcdGNoZWNrKHR5cGVvZiB0aGlzLm5hbWUgPT09ICdzdHJpbmcnLCB0aGlzLmxvYyxcblx0XHRcdFx0J01vZHVsZSBleHBvcnQgbXVzdCBoYXZlIGEgY29uc3RhbnQgbmFtZS4nKVxuXHRcdGVsc2Uge1xuXHRcdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHRcdH1cblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0T2JqU2ltcGxlKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0Y29uc3Qga2V5cyA9IG5ldyBTZXQoKVxuXHRcdGZvciAoY29uc3Qge2tleSwgdmFsdWUsIGxvY30gb2YgdGhpcy5wYWlycykge1xuXHRcdFx0Y2hlY2soIWtleXMuaGFzKGtleSksIGxvYywgKCkgPT4gYER1cGxpY2F0ZSBrZXkgJHtrZXl9YClcblx0XHRcdGtleXMuYWRkKGtleSlcblx0XHRcdHZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdFx0fVxuXHR9LFxuXG5cdFBpcGUoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBwaXBlIG9mIHRoaXMucGlwZXMpXG5cdFx0XHRyZWdpc3RlckFuZFBsdXNMb2NhbChMb2NhbERlY2xhcmUuZm9jdXModGhpcy5sb2MpLCAoKSA9PiB7XG5cdFx0XHRcdHBpcGUudmVyaWZ5KFNLLlZhbClcblx0XHRcdH0pXG5cdH0sXG5cblx0UXVvdGVQbGFpbihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHRoaXMucGFydHMuZm9yRWFjaCh2ZXJpZnlOYW1lKVxuXHR9LFxuXG5cdFF1b3RlU2ltcGxlKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdH0sXG5cblx0UXVvdGVUYWdnZWRUZW1wbGF0ZShzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHRoaXMudGFnLnZlcmlmeShTSy5WYWwpXG5cdFx0dGhpcy5xdW90ZS52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdFJhbmdlKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy5zdGFydC52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeU9wKHRoaXMuZW5kLCBTSy5WYWwpXG5cdH0sXG5cblx0U2V0U3ViKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHR0aGlzLm9iamVjdC52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeUVhY2godGhpcy5zdWJiZWRzLCBTSy5WYWwpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFR5cGUsIFNLLlZhbClcblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0U2ltcGxlRnVuKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0d2l0aEJsb2NrTG9jYWxzKCgpID0+IHtcblx0XHRcdHdpdGhJbkZ1bktpbmQoRnVucy5QbGFpbiwgKCkgPT4ge1xuXHRcdFx0XHRyZWdpc3RlckFuZFBsdXNMb2NhbChMb2NhbERlY2xhcmUuZm9jdXModGhpcy5sb2MpLCAoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHRcdFx0XHR9KVxuXHRcdFx0fSlcblx0XHR9KVxuXHR9LFxuXG5cdFNwZWNpYWxEbyhzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdH0sXG5cblx0U3BlY2lhbFZhbChzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHNldE5hbWUodGhpcylcblx0fSxcblxuXHRTcHJlYWQoKSB7XG5cdFx0dGhpcy5zcHJlYWRlZC52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdFN1cGVyQ2FsbChzaykge1xuXHRcdGNoZWNrKG1ldGhvZCAhPT0gbnVsbCwgdGhpcy5sb2MsICdNdXN0IGJlIGluIGEgbWV0aG9kLicpXG5cdFx0cmVzdWx0cy5zdXBlckNhbGxUb01ldGhvZC5zZXQodGhpcywgbWV0aG9kKVxuXG5cdFx0aWYgKG1ldGhvZCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB7XG5cdFx0XHRjaGVjayhzayA9PT0gU0suRG8sIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0XHRgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5TdXBlcil9IGluIGNvbnN0cnVjdG9yIG11c3QgYXBwZWFyIGFzIGEgc3RhdGVtZW50LidgKVxuXHRcdFx0cmVzdWx0cy5jb25zdHJ1Y3RvclRvU3VwZXIuc2V0KG1ldGhvZCwgdGhpcylcblx0XHR9XG5cblx0XHR2ZXJpZnlFYWNoKHRoaXMuYXJncywgU0suVmFsKVxuXHR9LFxuXG5cdFN1cGVyTWVtYmVyKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0Y2hlY2sobWV0aG9kICE9PSBudWxsLCB0aGlzLmxvYywgJ011c3QgYmUgaW4gbWV0aG9kLicpXG5cdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdH0sXG5cblx0U3dpdGNoKHNrKSB7XG5cdFx0bWFya1N0YXRlbWVudCh0aGlzLCBzaylcblx0XHR3aXRoSWlmZUlmVmFsKHNrLCAoKSA9PiB7XG5cdFx0XHR3aXRoSW5Td2l0Y2godHJ1ZSwgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLnN3aXRjaGVkLnZlcmlmeShTSy5WYWwpXG5cdFx0XHRcdHZlcmlmeUVhY2godGhpcy5wYXJ0cywgc2spXG5cdFx0XHRcdHZlcmlmeU9wKHRoaXMub3BFbHNlLCBzaylcblx0XHRcdH0pXG5cdFx0fSlcblx0fSxcblxuXHRTd2l0Y2hQYXJ0KHNrKSB7XG5cdFx0bWFya1N0YXRlbWVudCh0aGlzLCBzaylcblx0XHR2ZXJpZnlFYWNoKHRoaXMudmFsdWVzLCBTSy5WYWwpXG5cdFx0dGhpcy5yZXN1bHQudmVyaWZ5KHNrKVxuXHR9LFxuXG5cdFRocm93KCkge1xuXHRcdHZlcmlmeU9wKHRoaXMub3BUaHJvd24sIFNLLlZhbClcblx0fSxcblxuXHRJbXBvcnQoKSB7XG5cdFx0Ly8gU2luY2UgVXNlcyBhcmUgYWx3YXlzIGluIHRoZSBvdXRlcm1vc3Qgc2NvcGUsIGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgc2hhZG93aW5nLlxuXHRcdC8vIFNvIHdlIG11dGF0ZSBgbG9jYWxzYCBkaXJlY3RseS5cblx0XHRmdW5jdGlvbiBhZGRVc2VMb2NhbChfKSB7XG5cdFx0XHRjb25zdCBwcmV2ID0gbG9jYWxzLmdldChfLm5hbWUpXG5cdFx0XHRjaGVjayhwcmV2ID09PSB1bmRlZmluZWQsIF8ubG9jLCAoKSA9PlxuXHRcdFx0XHRgJHtjb2RlKF8ubmFtZSl9IGFscmVhZHkgaW1wb3J0ZWQgYXQgJHtwcmV2LmxvY31gKVxuXHRcdFx0dmVyaWZ5TG9jYWxEZWNsYXJlKF8pXG5cdFx0XHRzZXRMb2NhbChfKVxuXHRcdH1cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5pbXBvcnRlZClcblx0XHRcdGFkZFVzZUxvY2FsKF8pXG5cdFx0b3BFYWNoKHRoaXMub3BJbXBvcnREZWZhdWx0LCBhZGRVc2VMb2NhbClcblx0fSxcblxuXHRXaXRoKHNrKSB7XG5cdFx0bWFya1N0YXRlbWVudCh0aGlzLCBzaylcblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdFx0d2l0aElpZmVJZlZhbChzaywgKCkgPT4ge1xuXHRcdFx0aWYgKHNrID09PSBTSy5WYWwpXG5cdFx0XHRcdG1ha2VVc2VPcHRpb25hbElmRm9jdXModGhpcy5kZWNsYXJlKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuZGVjbGFyZSwgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeShTSy5Ebylcblx0XHRcdH0pXG5cdFx0fSlcblx0fSxcblxuXHRZaWVsZChfc2spIHtcblx0XHRjaGVjayhmdW5LaW5kID09PSBGdW5zLkdlbmVyYXRvciwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRgQ2Fubm90ICR7c2hvd0tleXdvcmQoS2V5d29yZHMuWWllbGQpfSBvdXRzaWRlIG9mIGdlbmVyYXRvciBmdW5jdGlvbi5gKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BWYWx1ZSwgU0suVmFsKVxuXHR9LFxuXG5cdFlpZWxkVG8oX3NrKSB7XG5cdFx0Y2hlY2soZnVuS2luZCA9PT0gRnVucy5HZW5lcmF0b3IsIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0YENhbm5vdCAke3Nob3dLZXl3b3JkKEtleXdvcmRzLllpZWxkVG8pfSBvdXRzaWRlIG9mIGdlbmVyYXRvciBmdW5jdGlvbi5gKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fVxufSlcblxuLy8gSGVscGVycyBzcGVjaWZpYyB0byBjZXJ0YWluIE1zQXN0IHR5cGVzXG5cbmZ1bmN0aW9uIHZlcmlmeUZvcihmb3JMb29wKSB7XG5cdGZ1bmN0aW9uIHZlcmlmeUZvckJsb2NrKCkge1xuXHRcdHdpdGhMb29wKGZvckxvb3AsICgpID0+IHtcblx0XHRcdGZvckxvb3AuYmxvY2sudmVyaWZ5KFNLLkRvKVxuXHRcdH0pXG5cdH1cblx0aWZFbHNlKGZvckxvb3Aub3BJdGVyYXRlZSwgXyA9PiB7IHdpdGhWZXJpZnlJdGVyYXRlZShfLCB2ZXJpZnlGb3JCbG9jaykgfSwgdmVyaWZ5Rm9yQmxvY2spXG59XG5cbmZ1bmN0aW9uIHdpdGhWZXJpZnlJdGVyYXRlZSh7ZWxlbWVudCwgYmFnfSwgYWN0aW9uKSB7XG5cdGJhZy52ZXJpZnkoU0suVmFsKVxuXHR2ZXJpZnlOb3RMYXp5KGVsZW1lbnQsICdJdGVyYXRpb24gZWxlbWVudCBjYW4gbm90IGJlIGxhenkuJylcblx0dmVyaWZ5QW5kUGx1c0xvY2FsKGVsZW1lbnQsIGFjdGlvbilcbn1cblxuZnVuY3Rpb24gdmVyaWZ5TWV0aG9kSW1wbChfLCBkb1ZlcmlmeSkge1xuXHR2ZXJpZnlOYW1lKF8uc3ltYm9sKVxuXHR3aXRoTWV0aG9kKF8sIGRvVmVyaWZ5KVxufVxuIl19
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

			for (const _ of this.assignees) _.verify();

			this.value.verify(_SK2.default.Val);
		},

		BagEntry(sk) {
			(0, _SK.checkDo)(this, sk);
			(0, _locals.accessLocal)(this, 'built');
			this.value.verify(_SK2.default.Val);
		},

		BagSimple(sk) {
			(0, _SK.checkVal)(this, sk);

			for (const _ of this.parts) _.verify(_SK2.default.Val);
		},

		Block: _verifyBlock2.default,

		BlockWrap(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _context2.withIife)(() => this.block.verify(sk));
		},

		Break(sk) {
			(0, _SK.checkDo)(this, sk);
			verifyInLoop(this);
			(0, _util2.verifyOp)(this.opValue, _SK2.default.Val);
			(0, _context.check)(_context2.results.isStatement(_context2.opLoop) === (this.opValue === null), this.loc, () => this.opValue === null ? `${ (0, _Token.showKeyword)(_Token.Keywords.For) } in expression position must break with a value.` : `${ (0, _Token.showKeyword)(_Token.Keywords.Break) } with value is only valid in ` + `${ (0, _Token.showKeyword)(_Token.Keywords.For) } in expression position.`);
		},

		Call(_sk) {
			this.called.verify(_SK2.default.Val);

			for (const _ of this.args) _.verify(_SK2.default.Val);
		},

		Case(sk) {
			(0, _SK.markStatement)(this, sk);
			(0, _context2.withIifeIfVal)(sk, () => {
				const doIt = () => {
					for (const part of this.parts) part.verify(sk);

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
			(0, _util2.okToNotUseIfFocus)(this.caught);
			(0, _util2.verifyNotLazy)(this.caught, 'Caught error can not be lazy.');
			(0, _locals.verifyAndPlusLocal)(this.caught, () => {
				this.block.verify(sk);
			});
		},

		Class(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _util2.verifyOp)(this.opSuperClass, _SK2.default.Val);

			for (const _ of this.kinds) _.verify(_SK2.default.Val);

			(0, _util2.verifyOp)(this.opDo);

			for (const _ of this.statics) _.verify();

			if (this.opConstructor !== null) this.opConstructor.verify(this.opSuperClass !== null);

			for (const _ of this.methods) _.verify();
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
			_context2.okToNotUse.add(this.fun.opDeclareThis);

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

			for (const _ of this.typedCatches) _.verify();

			(0, _util2.verifyOp)(this.opCatchAll, sk);
			(0, _util2.verifyOp)(this.opFinally, _SK2.default.Do);
		},

		ForBag(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _locals.verifyAndPlusLocal)(this.built, () => verifyFor(this));
		},

		For(sk) {
			(0, _SK.markStatement)(this, sk);
			verifyFor(this);
		},

		Fun(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _context.check)(this.opReturnType === null || !this.isDo, this.loc, 'Function with return type must return something.');
			(0, _locals.withBlockLocals)(() => {
				(0, _context2.withInFunKind)(this.kind, () => (0, _context2.withLoop)(null, () => {
					const allArgs = (0, _util.cat)(this.opDeclareThis, this.args, this.opRestArg);
					(0, _locals.verifyAndPlusLocals)(allArgs, () => {
						this.block.verify(this.isDo ? _SK2.default.Do : _SK2.default.Val);
						(0, _util2.verifyOp)(this.opReturnType, _SK2.default.Val);
					});
				}));
			});
		},

		FunAbstract() {
			for (const _ of this.args) _.verify();

			(0, _util2.verifyOp)(this.opRestArg);
			(0, _util2.verifyOp)(this.opReturnType, _SK2.default.Val);
		},

		Ignore(sk) {
			(0, _SK.checkDo)(this, sk);

			for (const _ of this.ignoredNames) (0, _locals.accessLocal)(this, _);
		},

		Kind(sk) {
			(0, _SK.checkVal)(this, sk);

			for (const _ of this.superKinds) _.verify(_SK2.default.Val);

			(0, _util2.verifyOp)(this.opDo, _SK2.default.Do);

			for (const _ of this.statics) _.verify();

			for (const _ of this.methods) _.verify();
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
			const declare = (0, _locals.getLocalDeclare)(this.name, this.loc);
			(0, _context.check)(declare.isMutable(), this.loc, () => `${ (0, _CompileError.code)(this.name) } is not mutable.`);
			this.value.verify(_SK2.default.Val);
		},

		Logic(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _context.check)(this.args.length > 1, this.loc, 'Logic expression needs at least 2 arguments.');

			for (const _ of this.args) _.verify(_SK2.default.Val);
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

			_context2.okToNotUse.add(this.fun.opDeclareThis);

			for (const _ of this.fun.args) _context2.okToNotUse.add(_);

			(0, _util.opEach)(this.fun.opRestArg, _ => _context2.okToNotUse.add(_));
			this.fun.verify(_SK2.default.Val);
		},

		MethodImpl() {
			verifyMethodImpl(this, () => {
				_context2.okToNotUse.add(this.fun.opDeclareThis);

				this.fun.verify(_SK2.default.Val);
			});
		},

		MethodGetter() {
			verifyMethodImpl(this, () => {
				_context2.okToNotUse.add(this.declareThis);

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
			for (const _ of this.imports) _.verify();

			(0, _context2.withName)(_context.options.moduleName(), () => {
				(0, _verifyBlock.verifyModuleLines)(this.lines, this.loc);
			});
		},

		New(sk) {
			(0, _SK.checkVal)(this, sk);
			this.type.verify(_SK2.default.Val);

			for (const _ of this.args) _.verify(_SK2.default.Val);
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

			for (const pair of this.pairs) {
				const key = pair.key;
				const value = pair.value;
				(0, _context.check)(!keys.has(key), pair.loc, () => `Duplicate key ${ key }`);
				keys.add(key);
				value.verify(_SK2.default.Val);
			}
		},

		GetterFun(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _util2.verifyName)(this.name);
		},

		QuotePlain(sk) {
			(0, _SK.checkVal)(this, sk);

			for (const _ of this.parts) (0, _util2.verifyName)(_);
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

			for (const _ of this.subbeds) _.verify(_SK2.default.Val);

			(0, _util2.verifyOp)(this.opType, _SK2.default.Val);
			this.value.verify(_SK2.default.Val);
		},

		SimpleFun(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _locals.verifyAndPlusLocal)(_MsAst.LocalDeclare.focus(this.loc), () => {
				this.value.verify();
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

			for (const _ of this.args) _.verify(_SK2.default.Val);
		},

		SuperMember(sk) {
			(0, _SK.checkVal)(this, sk);
			(0, _context.check)(_context2.method !== null, this.loc, 'Must be in method.');
			(0, _util2.verifyName)(this.name);
		},

		Switch(sk) {
			(0, _SK.markStatement)(this, sk);
			(0, _context2.withIifeIfVal)(sk, () => {
				this.switched.verify(_SK2.default.Val);

				for (const part of this.parts) part.verify(sk);

				(0, _util2.verifyOp)(this.opElse, sk);
			});
		},

		SwitchPart(sk) {
			(0, _SK.markStatement)(this, sk);

			for (const _ of this.values) _.verify(_SK2.default.Val);

			this.result.verify(sk);
		},

		Throw() {
			(0, _util2.verifyOp)(this.opThrown, _SK2.default.Val);
		},

		Import() {
			const addUseLocal = _ => {
				const prev = _context2.locals.get(_.name);

				(0, _context.check)(prev === undefined, _.loc, () => `${ (0, _CompileError.code)(_.name) } already imported at ${ prev.loc }`);
				(0, _locals.verifyLocalDeclare)(_);
				(0, _locals.setLocal)(_);
			};

			for (const _ of this.imported) addUseLocal(_);

			(0, _util.opEach)(this.opImportDefault, addUseLocal);
		},

		With(sk) {
			(0, _SK.markStatement)(this, sk);
			this.value.verify(_SK2.default.Val);
			(0, _context2.withIifeIfVal)(sk, () => {
				if (sk === _SK2.default.Val) (0, _util2.okToNotUseIfFocus)(this.declare);
				(0, _locals.verifyAndPlusLocal)(this.declare, () => {
					this.block.verify(_SK2.default.Do);
				});
			});
		},

		Yield(_sk) {
			(0, _context.check)(_context2.funKind !== _MsAst.Funs.Plain, this.loc, () => `Cannot ${ (0, _Token.showKeyword)(_Token.Keywords.Yield) } outside of async/generator.`);
			if (_context2.funKind === _MsAst.Funs.Async) (0, _context.check)(this.opYielded !== null, this.loc, 'Cannot await nothing.');
			(0, _util2.verifyOp)(this.opYielded, _SK2.default.Val);
		},

		YieldTo(_sk) {
			(0, _context.check)(_context2.funKind === _MsAst.Funs.Generator, this.loc, () => `Cannot ${ (0, _Token.showKeyword)(_Token.Keywords.YieldTo) } outside of generator.`);
			this.yieldedTo.verify(_SK2.default.Val);
		}

	});

	function verifyFor(forLoop) {
		const verifyBlock = () => (0, _context2.withLoop)(forLoop, () => {
			forLoop.block.verify(_SK2.default.Do);
		});

		(0, _util.ifElse)(forLoop.opIteratee, _ref => {
			let element = _ref.element;
			let bag = _ref.bag;
			bag.verify(_SK2.default.Val);
			(0, _util2.verifyNotLazy)(element, 'Iteration element can not be lazy.');
			(0, _locals.verifyAndPlusLocal)(element, verifyBlock);
		}, verifyBlock);
	}

	function verifyInLoop(loopUser) {
		(0, _context.check)(_context2.opLoop !== null, loopUser.loc, 'Not in a loop.');
	}

	function verifyMethodImpl(_, doVerify) {
		(0, _util2.verifyName)(_.symbol);
		(0, _context2.withMethod)(_, doVerify);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQW9Cd0IsTUFBTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQUFOLE1BQU0iLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCBvcHRpb25zLCB3YXJufSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0ICogYXMgTXNBc3RUeXBlcyBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7QmxvY2ssIENsYXNzLCBDb25zdHJ1Y3RvciwgRnVuLCBGdW5zLCBLaW5kLCBMb2NhbERlY2xhcmUsIE1ldGhvZCwgUGF0dGVybn0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0tleXdvcmRzLCBzaG93S2V5d29yZH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2NhdCwgaWZFbHNlLCBpbXBsZW1lbnRNYW55LCBpc0VtcHR5LCBvcEVhY2h9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2Z1bktpbmQsIGxvY2FscywgbWV0aG9kLCBva1RvTm90VXNlLCBvcExvb3AsIHJlc3VsdHMsIHNldHVwLCB0ZWFyRG93biwgd2l0aElpZmUsXG5cdHdpdGhJaWZlSWYsIHdpdGhJaWZlSWZWYWwsIHdpdGhJbkZ1bktpbmQsIHdpdGhNZXRob2QsIHdpdGhMb29wLCB3aXRoTmFtZX0gZnJvbSAnLi9jb250ZXh0J1xuaW1wb3J0IHthY2Nlc3NMb2NhbCwgZ2V0TG9jYWxEZWNsYXJlLCBmYWlsTWlzc2luZ0xvY2FsLCBwbHVzTG9jYWxzLCBzZXREZWNsYXJlQWNjZXNzZWQsIHNldExvY2FsLFxuXHR2ZXJpZnlBbmRQbHVzTG9jYWwsIHZlcmlmeUFuZFBsdXNMb2NhbHMsIHZlcmlmeUxvY2FsRGVjbGFyZSwgd2FyblVudXNlZExvY2Fscywgd2l0aEJsb2NrTG9jYWxzXG5cdH0gZnJvbSAnLi9sb2NhbHMnXG5pbXBvcnQgU0sse2NoZWNrRG8sIGNoZWNrVmFsLCBtYXJrU3RhdGVtZW50fSBmcm9tICcuL1NLJ1xuaW1wb3J0IHtva1RvTm90VXNlSWZGb2N1cywgc2V0TmFtZSwgdmVyaWZ5TmFtZSwgdmVyaWZ5Tm90TGF6eSwgdmVyaWZ5T3B9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB2ZXJpZnlCbG9jaywge3ZlcmlmeURvQmxvY2ssIHZlcmlmeU1vZHVsZUxpbmVzfSBmcm9tICcuL3ZlcmlmeUJsb2NrJ1xuXG4vKipcbkdlbmVyYXRlcyBpbmZvcm1hdGlvbiBuZWVkZWQgZHVyaW5nIHRyYW5zcGlsaW5nLCB0aGUgVmVyaWZ5UmVzdWx0cy5cbkFsc28gY2hlY2tzIGZvciBleGlzdGVuY2Ugb2YgbG9jYWwgdmFyaWFibGVzIGFuZCB3YXJucyBmb3IgdW51c2VkIGxvY2Fscy5cbkBwYXJhbSB7TXNBc3R9IG1zQXN0XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdmVyaWZ5KG1zQXN0KSB7XG5cdHNldHVwKClcblx0bXNBc3QudmVyaWZ5KClcblx0d2FyblVudXNlZExvY2FscygpXG5cdGNvbnN0IHJlcyA9IHJlc3VsdHNcblx0dGVhckRvd24oKVxuXHRyZXR1cm4gcmVzXG59XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ3ZlcmlmeScsIHtcblx0QXNzZXJ0KHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHR0aGlzLmNvbmRpdGlvbi52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BUaHJvd24sIFNLLlZhbClcblx0fSxcblxuXHRBc3NpZ25TaW5nbGUoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdHdpdGhOYW1lKHRoaXMuYXNzaWduZWUubmFtZSwgKCkgPT4ge1xuXHRcdFx0Y29uc3QgZG9WID0gKCkgPT4ge1xuXHRcdFx0XHQvKlxuXHRcdFx0XHRGdW4gYW5kIENsYXNzIG9ubHkgZ2V0IG5hbWUgaWYgdGhleSBhcmUgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIGFzc2lnbm1lbnQuXG5cdFx0XHRcdHNvIGluIGB4ID0gJGFmdGVyLXRpbWUgMTAwMCB8YCB0aGUgZnVuY3Rpb24gaXMgbm90IG5hbWVkLlxuXHRcdFx0XHQqL1xuXHRcdFx0XHRpZiAodGhpcy52YWx1ZSBpbnN0YW5jZW9mIENsYXNzIHx8XG5cdFx0XHRcdFx0dGhpcy52YWx1ZSBpbnN0YW5jZW9mIEZ1biB8fFxuXHRcdFx0XHRcdHRoaXMudmFsdWUgaW5zdGFuY2VvZiBNZXRob2QgfHxcblx0XHRcdFx0XHR0aGlzLnZhbHVlIGluc3RhbmNlb2YgS2luZClcblx0XHRcdFx0XHRzZXROYW1lKHRoaXMudmFsdWUpXG5cblx0XHRcdFx0Ly8gQXNzaWduZWUgcmVnaXN0ZXJlZCBieSB2ZXJpZnlMaW5lcy5cblx0XHRcdFx0dGhpcy5hc3NpZ25lZS52ZXJpZnkoKVxuXHRcdFx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy5hc3NpZ25lZS5pc0xhenkoKSlcblx0XHRcdFx0d2l0aEJsb2NrTG9jYWxzKGRvVilcblx0XHRcdGVsc2Vcblx0XHRcdFx0ZG9WKClcblx0XHR9KVxuXHR9LFxuXG5cdEFzc2lnbkRlc3RydWN0dXJlKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHQvLyBBc3NpZ25lZXMgcmVnaXN0ZXJlZCBieSB2ZXJpZnlMaW5lcy5cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hc3NpZ25lZXMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdEJhZ0VudHJ5KHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRCYWdTaW1wbGUoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5wYXJ0cylcblx0XHRcdF8udmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRCbG9jazogdmVyaWZ5QmxvY2ssXG5cblx0QmxvY2tXcmFwKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0d2l0aElpZmUoKCkgPT4gdGhpcy5ibG9jay52ZXJpZnkoc2spKVxuXHR9LFxuXG5cdEJyZWFrKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHR2ZXJpZnlJbkxvb3AodGhpcylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVmFsdWUsIFNLLlZhbClcblx0XHRjaGVjayhyZXN1bHRzLmlzU3RhdGVtZW50KG9wTG9vcCkgPT09ICh0aGlzLm9wVmFsdWUgPT09IG51bGwpLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdHRoaXMub3BWYWx1ZSA9PT0gbnVsbCA/XG5cdFx0XHRcdGAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkZvcil9IGluIGV4cHJlc3Npb24gcG9zaXRpb24gbXVzdCBicmVhayB3aXRoIGEgdmFsdWUuYCA6XG5cdFx0XHRcdGAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkJyZWFrKX0gd2l0aCB2YWx1ZSBpcyBvbmx5IHZhbGlkIGluIGAgK1xuXHRcdFx0XHRgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5Gb3IpfSBpbiBleHByZXNzaW9uIHBvc2l0aW9uLmApXG5cdH0sXG5cblx0Q2FsbChfc2spIHtcblx0XHR0aGlzLmNhbGxlZC52ZXJpZnkoU0suVmFsKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0XHRfLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0Q2FzZShzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0d2l0aElpZmVJZlZhbChzaywgKCkgPT4ge1xuXHRcdFx0Y29uc3QgZG9JdCA9ICgpID0+IHtcblx0XHRcdFx0Zm9yIChjb25zdCBwYXJ0IG9mIHRoaXMucGFydHMpXG5cdFx0XHRcdFx0cGFydC52ZXJpZnkoc2spXG5cdFx0XHRcdHZlcmlmeU9wKHRoaXMub3BFbHNlLCBzaylcblx0XHRcdH1cblx0XHRcdGlmRWxzZSh0aGlzLm9wQ2FzZWQsXG5cdFx0XHRcdF8gPT4ge1xuXHRcdFx0XHRcdF8udmVyaWZ5KFNLLkRvKVxuXHRcdFx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbChfLmFzc2lnbmVlLCBkb0l0KVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkb0l0KVxuXHRcdH0pXG5cdH0sXG5cblx0Q2FzZVBhcnQoc2spIHtcblx0XHRpZiAodGhpcy50ZXN0IGluc3RhbmNlb2YgUGF0dGVybikge1xuXHRcdFx0dGhpcy50ZXN0LnR5cGUudmVyaWZ5KFNLLlZhbClcblx0XHRcdHRoaXMudGVzdC5wYXR0ZXJuZWQudmVyaWZ5KFNLLlZhbClcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHModGhpcy50ZXN0LmxvY2FscywgKCkgPT4gdGhpcy5yZXN1bHQudmVyaWZ5KHNrKSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy50ZXN0LnZlcmlmeShTSy5WYWwpXG5cdFx0XHR0aGlzLnJlc3VsdC52ZXJpZnkoc2spXG5cdFx0fVxuXHR9LFxuXG5cdENhdGNoKHNrKSB7XG5cdFx0b2tUb05vdFVzZUlmRm9jdXModGhpcy5jYXVnaHQpXG5cdFx0dmVyaWZ5Tm90TGF6eSh0aGlzLmNhdWdodCwgJ0NhdWdodCBlcnJvciBjYW4gbm90IGJlIGxhenkuJylcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5jYXVnaHQsICgpID0+IHtcblx0XHRcdHRoaXMuYmxvY2sudmVyaWZ5KHNrKVxuXHRcdH0pXG5cdH0sXG5cblx0Q2xhc3Moc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wU3VwZXJDbGFzcywgU0suVmFsKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmtpbmRzKVxuXHRcdFx0Xy52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BEbylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5zdGF0aWNzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdGlmICh0aGlzLm9wQ29uc3RydWN0b3IgIT09IG51bGwpXG5cdFx0XHR0aGlzLm9wQ29uc3RydWN0b3IudmVyaWZ5KHRoaXMub3BTdXBlckNsYXNzICE9PSBudWxsKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLm1ldGhvZHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0Ly8gbmFtZSBzZXQgYnkgQXNzaWduU2luZ2xlXG5cdH0sXG5cblx0Q2xhc3NLaW5kRG8oKSB7XG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuZGVjbGFyZUZvY3VzLCAoKSA9PiB0aGlzLmJsb2NrLnZlcmlmeShTSy5EbykpXG5cdH0sXG5cblx0Q29uZChzaykge1xuXHRcdC8vIENvdWxkIGJlIGEgc3RhdGVtZW50IGlmIGJvdGggcmVzdWx0cyBhcmUuXG5cdFx0dGhpcy50ZXN0LnZlcmlmeShTSy5WYWwpXG5cdFx0dGhpcy5pZlRydWUudmVyaWZ5KHNrKVxuXHRcdHRoaXMuaWZGYWxzZS52ZXJpZnkoc2spXG5cdH0sXG5cblx0Q29uZGl0aW9uYWwoc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdHRoaXMudGVzdC52ZXJpZnkoU0suVmFsKVxuXHRcdHdpdGhJaWZlSWYodGhpcy5yZXN1bHQgaW5zdGFuY2VvZiBCbG9jayAmJiBzayA9PT0gU0suVmFsLCAoKSA9PiB7XG5cdFx0XHR0aGlzLnJlc3VsdC52ZXJpZnkoc2spXG5cdFx0fSlcblx0fSxcblxuXHRDb25zdHJ1Y3RvcihjbGFzc0hhc1N1cGVyKSB7XG5cdFx0b2tUb05vdFVzZS5hZGQodGhpcy5mdW4ub3BEZWNsYXJlVGhpcylcblx0XHR3aXRoTWV0aG9kKHRoaXMsICgpID0+IHsgdGhpcy5mdW4udmVyaWZ5KFNLLlZhbCkgfSlcblxuXHRcdGNvbnN0IHN1cGVyQ2FsbCA9IHJlc3VsdHMuY29uc3RydWN0b3JUb1N1cGVyLmdldCh0aGlzKVxuXG5cdFx0aWYgKGNsYXNzSGFzU3VwZXIpXG5cdFx0XHRjaGVjayhzdXBlckNhbGwgIT09IHVuZGVmaW5lZCwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRcdGBDb25zdHJ1Y3RvciBtdXN0IGNvbnRhaW4gJHtzaG93S2V5d29yZChLZXl3b3Jkcy5TdXBlcil9YClcblx0XHRlbHNlXG5cdFx0XHRjaGVjayhzdXBlckNhbGwgPT09IHVuZGVmaW5lZCwgKCkgPT4gc3VwZXJDYWxsLmxvYywgKCkgPT5cblx0XHRcdFx0YENsYXNzIGhhcyBubyBzdXBlcmNsYXNzLCBzbyAke3Nob3dLZXl3b3JkKEtleXdvcmRzLlN1cGVyKX0gaXMgbm90IGFsbG93ZWQuYClcblxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLm1lbWJlckFyZ3MpXG5cdFx0XHRzZXREZWNsYXJlQWNjZXNzZWQoXywgdGhpcylcblx0fSxcblxuXHRFeGNlcHQoc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdGlmICh0aGlzLm9wRWxzZSA9PT0gbnVsbClcblx0XHRcdHRoaXMudHJ5LnZlcmlmeShzaylcblx0XHRlbHNlIHtcblx0XHRcdHBsdXNMb2NhbHModmVyaWZ5RG9CbG9jayh0aGlzLnRyeSksICgpID0+IHRoaXMub3BFbHNlLnZlcmlmeShzaykpXG5cdFx0XHRpZiAoaXNFbXB0eSh0aGlzLmFsbENhdGNoZXMpKVxuXHRcdFx0XHR3YXJuKHRoaXMubG9jLFxuXHRcdFx0XHRcdGAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkVsc2UpfSBtdXN0IGNvbWUgYWZ0ZXIgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5DYXRjaCl9LmApXG5cdFx0fVxuXG5cdFx0aWYgKGlzRW1wdHkodGhpcy5hbGxDYXRjaGVzKSAmJiB0aGlzLm9wRmluYWxseSA9PT0gbnVsbClcblx0XHRcdHdhcm4odGhpcy5sb2MsIGAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkV4Y2VwdCl9IGlzIHBvaW50bGVzcyB3aXRob3V0IGAgK1xuXHRcdFx0XHRgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5DYXRjaCl9IG9yICR7c2hvd0tleXdvcmQoS2V5d29yZHMuRmluYWxseSl9LmApXG5cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy50eXBlZENhdGNoZXMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcENhdGNoQWxsLCBzaylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wRmluYWxseSwgU0suRG8pXG5cdH0sXG5cblx0Rm9yQmFnKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuYnVpbHQsICgpID0+IHZlcmlmeUZvcih0aGlzKSlcblx0fSxcblxuXHRGb3Ioc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdHZlcmlmeUZvcih0aGlzKVxuXHR9LFxuXG5cdEZ1bihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdGNoZWNrKHRoaXMub3BSZXR1cm5UeXBlID09PSBudWxsIHx8ICF0aGlzLmlzRG8sIHRoaXMubG9jLFxuXHRcdFx0J0Z1bmN0aW9uIHdpdGggcmV0dXJuIHR5cGUgbXVzdCByZXR1cm4gc29tZXRoaW5nLicpXG5cdFx0d2l0aEJsb2NrTG9jYWxzKCgpID0+IHtcblx0XHRcdHdpdGhJbkZ1bktpbmQodGhpcy5raW5kLCAoKSA9PlxuXHRcdFx0XHR3aXRoTG9vcChudWxsLCAoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgYWxsQXJncyA9IGNhdCh0aGlzLm9wRGVjbGFyZVRoaXMsIHRoaXMuYXJncywgdGhpcy5vcFJlc3RBcmcpXG5cdFx0XHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FscyhhbGxBcmdzLCAoKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeSh0aGlzLmlzRG8gPyBTSy5EbyA6IFNLLlZhbClcblx0XHRcdFx0XHRcdHZlcmlmeU9wKHRoaXMub3BSZXR1cm5UeXBlLCBTSy5WYWwpXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fSkpXG5cdFx0fSlcblx0XHQvLyBuYW1lIHNldCBieSBBc3NpZ25TaW5nbGVcblx0fSxcblxuXHRGdW5BYnN0cmFjdCgpIHtcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hcmdzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BSZXN0QXJnKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BSZXR1cm5UeXBlLCBTSy5WYWwpXG5cdH0sXG5cblx0SWdub3JlKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5pZ25vcmVkTmFtZXMpXG5cdFx0XHRhY2Nlc3NMb2NhbCh0aGlzLCBfKVxuXHR9LFxuXG5cdEtpbmQoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5zdXBlcktpbmRzKVxuXHRcdFx0Xy52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BEbywgU0suRG8pXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuc3RhdGljcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5tZXRob2RzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdC8vIG5hbWUgc2V0IGJ5IEFzc2lnblNpbmdsZVxuXHR9LFxuXG5cdExhenkoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR3aXRoQmxvY2tMb2NhbHMoKCkgPT4gdGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKSlcblx0fSxcblxuXHRMb2NhbEFjY2Vzcyhzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdGNvbnN0IGRlY2xhcmUgPSBsb2NhbHMuZ2V0KHRoaXMubmFtZSlcblx0XHRpZiAoZGVjbGFyZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjb25zdCBidWlsdGluUGF0aCA9IG9wdGlvbnMuYnVpbHRpbk5hbWVUb1BhdGguZ2V0KHRoaXMubmFtZSlcblx0XHRcdGlmIChidWlsdGluUGF0aCA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRmYWlsTWlzc2luZ0xvY2FsKHRoaXMubG9jLCB0aGlzLm5hbWUpXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc3QgbmFtZXMgPSByZXN1bHRzLmJ1aWx0aW5QYXRoVG9OYW1lcy5nZXQoYnVpbHRpblBhdGgpXG5cdFx0XHRcdGlmIChuYW1lcyA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRcdHJlc3VsdHMuYnVpbHRpblBhdGhUb05hbWVzLnNldChidWlsdGluUGF0aCwgbmV3IFNldChbdGhpcy5uYW1lXSkpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRuYW1lcy5hZGQodGhpcy5uYW1lKVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHRzLmxvY2FsQWNjZXNzVG9EZWNsYXJlLnNldCh0aGlzLCBkZWNsYXJlKVxuXHRcdFx0c2V0RGVjbGFyZUFjY2Vzc2VkKGRlY2xhcmUsIHRoaXMpXG5cdFx0fVxuXHR9LFxuXG5cdC8vIEFkZGluZyBMb2NhbERlY2xhcmVzIHRvIHRoZSBhdmFpbGFibGUgbG9jYWxzIGlzIGRvbmUgYnkgRnVuIG9yIGxpbmVOZXdMb2NhbHMuXG5cdExvY2FsRGVjbGFyZSgpIHtcblx0XHRjb25zdCBidWlsdGluUGF0aCA9IG9wdGlvbnMuYnVpbHRpbk5hbWVUb1BhdGguZ2V0KHRoaXMubmFtZSlcblx0XHRpZiAoYnVpbHRpblBhdGggIT09IHVuZGVmaW5lZClcblx0XHRcdHdhcm4odGhpcy5sb2MsIGBMb2NhbCAke2NvZGUodGhpcy5uYW1lKX0gb3ZlcnJpZGVzIGJ1aWx0aW4gZnJvbSAke2NvZGUoYnVpbHRpblBhdGgpfS5gKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BUeXBlLCBTSy5WYWwpXG5cdH0sXG5cblx0TG9jYWxNdXRhdGUoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdGNvbnN0IGRlY2xhcmUgPSBnZXRMb2NhbERlY2xhcmUodGhpcy5uYW1lLCB0aGlzLmxvYylcblx0XHRjaGVjayhkZWNsYXJlLmlzTXV0YWJsZSgpLCB0aGlzLmxvYywgKCkgPT4gYCR7Y29kZSh0aGlzLm5hbWUpfSBpcyBub3QgbXV0YWJsZS5gKVxuXHRcdC8vIFRPRE86IFRyYWNrIG11dGF0aW9ucy4gTXV0YWJsZSBsb2NhbCBtdXN0IGJlIG11dGF0ZWQgc29tZXdoZXJlLlxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRMb2dpYyhzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdGNoZWNrKHRoaXMuYXJncy5sZW5ndGggPiAxLCB0aGlzLmxvYywgJ0xvZ2ljIGV4cHJlc3Npb24gbmVlZHMgYXQgbGVhc3QgMiBhcmd1bWVudHMuJylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hcmdzKVxuXHRcdFx0Xy52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdE5vdChzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHRoaXMuYXJnLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0TnVtYmVyTGl0ZXJhbChzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHR9LFxuXG5cdE1hcEVudHJ5KHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHRoaXMua2V5LnZlcmlmeShTSy5WYWwpXG5cdFx0dGhpcy52YWwudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRNZW1iZXIoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR0aGlzLm9iamVjdC52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdE1lbWJlckZ1bihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BPYmplY3QsIFNLLlZhbClcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0fSxcblxuXHRNZW1iZXJTZXQoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdHRoaXMub2JqZWN0LnZlcmlmeShTSy5WYWwpXG5cdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFR5cGUsIFNLLlZhbClcblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0TWV0aG9kKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0b2tUb05vdFVzZS5hZGQodGhpcy5mdW4ub3BEZWNsYXJlVGhpcylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5mdW4uYXJncylcblx0XHRcdG9rVG9Ob3RVc2UuYWRkKF8pXG5cdFx0b3BFYWNoKHRoaXMuZnVuLm9wUmVzdEFyZywgXyA9PiBva1RvTm90VXNlLmFkZChfKSlcblx0XHR0aGlzLmZ1bi52ZXJpZnkoU0suVmFsKVxuXHRcdC8vIG5hbWUgc2V0IGJ5IEFzc2lnblNpbmdsZVxuXHR9LFxuXG5cdE1ldGhvZEltcGwoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kSW1wbCh0aGlzLCAoKSA9PiB7XG5cdFx0XHRva1RvTm90VXNlLmFkZCh0aGlzLmZ1bi5vcERlY2xhcmVUaGlzKVxuXHRcdFx0dGhpcy5mdW4udmVyaWZ5KFNLLlZhbClcblx0XHR9KVxuXHR9LFxuXHRNZXRob2RHZXR0ZXIoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kSW1wbCh0aGlzLCAoKSA9PiB7XG5cdFx0XHRva1RvTm90VXNlLmFkZCh0aGlzLmRlY2xhcmVUaGlzKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FscyhbdGhpcy5kZWNsYXJlVGhpc10sICgpID0+IHtcblx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoU0suVmFsKVxuXHRcdFx0fSlcblx0XHR9KVxuXHR9LFxuXHRNZXRob2RTZXR0ZXIoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kSW1wbCh0aGlzLCAoKSA9PiB7XG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKFt0aGlzLmRlY2xhcmVUaGlzLCB0aGlzLmRlY2xhcmVGb2N1c10sICgpID0+IHtcblx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoU0suRG8pXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH0sXG5cblx0TW9kdWxlKCkge1xuXHRcdC8vIE5vIG5lZWQgdG8gdmVyaWZ5IHRoaXMuZG9JbXBvcnRzLlxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmltcG9ydHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0d2l0aE5hbWUob3B0aW9ucy5tb2R1bGVOYW1lKCksICgpID0+IHtcblx0XHRcdHZlcmlmeU1vZHVsZUxpbmVzKHRoaXMubGluZXMsIHRoaXMubG9jKVxuXHRcdH0pXG5cdH0sXG5cblx0TmV3KHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy50eXBlLnZlcmlmeShTSy5WYWwpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRPYmpFbnRyeUFzc2lnbihzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0aWYgKCFyZXN1bHRzLmlzT2JqRW50cnlFeHBvcnQodGhpcykpXG5cdFx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHRoaXMuYXNzaWduLnZlcmlmeShTSy5Ebylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hc3NpZ24uYWxsQXNzaWduZWVzKCkpXG5cdFx0XHRzZXREZWNsYXJlQWNjZXNzZWQoXywgdGhpcylcblx0fSxcblxuXHRPYmpFbnRyeVBsYWluKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHRpZiAocmVzdWx0cy5pc09iakVudHJ5RXhwb3J0KHRoaXMpKVxuXHRcdFx0Y2hlY2sodHlwZW9mIHRoaXMubmFtZSA9PT0gJ3N0cmluZycsIHRoaXMubG9jLFxuXHRcdFx0XHQnTW9kdWxlIGV4cG9ydCBtdXN0IGhhdmUgYSBjb25zdGFudCBuYW1lLicpXG5cdFx0ZWxzZSB7XG5cdFx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdFx0fVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRPYmpTaW1wbGUoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRjb25zdCBrZXlzID0gbmV3IFNldCgpXG5cdFx0Zm9yIChjb25zdCBwYWlyIG9mIHRoaXMucGFpcnMpIHtcblx0XHRcdGNvbnN0IHtrZXksIHZhbHVlfSA9IHBhaXJcblx0XHRcdGNoZWNrKCFrZXlzLmhhcyhrZXkpLCBwYWlyLmxvYywgKCkgPT4gYER1cGxpY2F0ZSBrZXkgJHtrZXl9YClcblx0XHRcdGtleXMuYWRkKGtleSlcblx0XHRcdHZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdFx0fVxuXHR9LFxuXG5cdEdldHRlckZ1bihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdFF1b3RlUGxhaW4oc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5wYXJ0cylcblx0XHRcdHZlcmlmeU5hbWUoXylcblx0fSxcblxuXHRRdW90ZVNpbXBsZShzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHR9LFxuXG5cdFF1b3RlVGFnZ2VkVGVtcGxhdGUoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR0aGlzLnRhZy52ZXJpZnkoU0suVmFsKVxuXHRcdHRoaXMucXVvdGUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRSYW5nZShzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHRoaXMuc3RhcnQudmVyaWZ5KFNLLlZhbClcblx0XHR2ZXJpZnlPcCh0aGlzLmVuZCwgU0suVmFsKVxuXHR9LFxuXG5cdFNldFN1Yihzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0dGhpcy5vYmplY3QudmVyaWZ5KFNLLlZhbClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5zdWJiZWRzKVxuXHRcdFx0Xy52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BUeXBlLCBTSy5WYWwpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdFNpbXBsZUZ1bihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbChMb2NhbERlY2xhcmUuZm9jdXModGhpcy5sb2MpLCAoKSA9PiB7XG5cdFx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdFx0fSlcblx0fSxcblxuXHRTcGVjaWFsRG8oc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHR9LFxuXG5cdFNwZWNpYWxWYWwoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRzZXROYW1lKHRoaXMpXG5cdH0sXG5cblx0U3ByZWFkKCkge1xuXHRcdHRoaXMuc3ByZWFkZWQudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRTdXBlckNhbGwoc2spIHtcblx0XHRjaGVjayhtZXRob2QgIT09IG51bGwsIHRoaXMubG9jLCAnTXVzdCBiZSBpbiBhIG1ldGhvZC4nKVxuXHRcdHJlc3VsdHMuc3VwZXJDYWxsVG9NZXRob2Quc2V0KHRoaXMsIG1ldGhvZClcblxuXHRcdGlmIChtZXRob2QgaW5zdGFuY2VvZiBDb25zdHJ1Y3Rvcikge1xuXHRcdFx0Y2hlY2soc2sgPT09IFNLLkRvLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdFx0YCR7c2hvd0tleXdvcmQoS2V5d29yZHMuU3VwZXIpfSBpbiBjb25zdHJ1Y3RvciBtdXN0IGFwcGVhciBhcyBhIHN0YXRlbWVudC4nYClcblx0XHRcdHJlc3VsdHMuY29uc3RydWN0b3JUb1N1cGVyLnNldChtZXRob2QsIHRoaXMpXG5cdFx0fVxuXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRTdXBlck1lbWJlcihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdGNoZWNrKG1ldGhvZCAhPT0gbnVsbCwgdGhpcy5sb2MsICdNdXN0IGJlIGluIG1ldGhvZC4nKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdFN3aXRjaChzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0d2l0aElpZmVJZlZhbChzaywgKCkgPT4ge1xuXHRcdFx0dGhpcy5zd2l0Y2hlZC52ZXJpZnkoU0suVmFsKVxuXHRcdFx0Zm9yIChjb25zdCBwYXJ0IG9mIHRoaXMucGFydHMpXG5cdFx0XHRcdHBhcnQudmVyaWZ5KHNrKVxuXHRcdFx0dmVyaWZ5T3AodGhpcy5vcEVsc2UsIHNrKVxuXHRcdH0pXG5cdH0sXG5cblx0U3dpdGNoUGFydChzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMudmFsdWVzKVxuXHRcdFx0Xy52ZXJpZnkoU0suVmFsKVxuXHRcdHRoaXMucmVzdWx0LnZlcmlmeShzaylcblx0fSxcblxuXHRUaHJvdygpIHtcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVGhyb3duLCBTSy5WYWwpXG5cdH0sXG5cblx0SW1wb3J0KCkge1xuXHRcdC8vIFNpbmNlIFVzZXMgYXJlIGFsd2F5cyBpbiB0aGUgb3V0ZXJtb3N0IHNjb3BlLCBkb24ndCBoYXZlIHRvIHdvcnJ5IGFib3V0IHNoYWRvd2luZy5cblx0XHQvLyBTbyB3ZSBtdXRhdGUgYGxvY2Fsc2AgZGlyZWN0bHkuXG5cdFx0Y29uc3QgYWRkVXNlTG9jYWwgPSBfID0+IHtcblx0XHRcdGNvbnN0IHByZXYgPSBsb2NhbHMuZ2V0KF8ubmFtZSlcblx0XHRcdGNoZWNrKHByZXYgPT09IHVuZGVmaW5lZCwgXy5sb2MsICgpID0+XG5cdFx0XHRcdGAke2NvZGUoXy5uYW1lKX0gYWxyZWFkeSBpbXBvcnRlZCBhdCAke3ByZXYubG9jfWApXG5cdFx0XHR2ZXJpZnlMb2NhbERlY2xhcmUoXylcblx0XHRcdHNldExvY2FsKF8pXG5cdFx0fVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmltcG9ydGVkKVxuXHRcdFx0YWRkVXNlTG9jYWwoXylcblx0XHRvcEVhY2godGhpcy5vcEltcG9ydERlZmF1bHQsIGFkZFVzZUxvY2FsKVxuXHR9LFxuXG5cdFdpdGgoc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0XHR3aXRoSWlmZUlmVmFsKHNrLCAoKSA9PiB7XG5cdFx0XHRpZiAoc2sgPT09IFNLLlZhbClcblx0XHRcdFx0b2tUb05vdFVzZUlmRm9jdXModGhpcy5kZWNsYXJlKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuZGVjbGFyZSwgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeShTSy5Ebylcblx0XHRcdH0pXG5cdFx0fSlcblx0fSxcblxuXHRZaWVsZChfc2spIHtcblx0XHRjaGVjayhmdW5LaW5kICE9PSBGdW5zLlBsYWluLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdGBDYW5ub3QgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5ZaWVsZCl9IG91dHNpZGUgb2YgYXN5bmMvZ2VuZXJhdG9yLmApXG5cdFx0aWYgKGZ1bktpbmQgPT09IEZ1bnMuQXN5bmMpXG5cdFx0XHRjaGVjayh0aGlzLm9wWWllbGRlZCAhPT0gbnVsbCwgdGhpcy5sb2MsICdDYW5ub3QgYXdhaXQgbm90aGluZy4nKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BZaWVsZGVkLCBTSy5WYWwpXG5cdH0sXG5cblx0WWllbGRUbyhfc2spIHtcblx0XHRjaGVjayhmdW5LaW5kID09PSBGdW5zLkdlbmVyYXRvciwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRgQ2Fubm90ICR7c2hvd0tleXdvcmQoS2V5d29yZHMuWWllbGRUbyl9IG91dHNpZGUgb2YgZ2VuZXJhdG9yLmApXG5cdFx0dGhpcy55aWVsZGVkVG8udmVyaWZ5KFNLLlZhbClcblx0fVxufSlcblxuLy8gSGVscGVycyBzcGVjaWZpYyB0byBjZXJ0YWluIE1zQXN0IHR5cGVzXG5cbmZ1bmN0aW9uIHZlcmlmeUZvcihmb3JMb29wKSB7XG5cdGNvbnN0IHZlcmlmeUJsb2NrID0gKCkgPT4gd2l0aExvb3AoZm9yTG9vcCwgKCkgPT4ge1xuXHRcdGZvckxvb3AuYmxvY2sudmVyaWZ5KFNLLkRvKVxuXHR9KVxuXHRpZkVsc2UoZm9yTG9vcC5vcEl0ZXJhdGVlLFxuXHRcdCh7ZWxlbWVudCwgYmFnfSkgPT4ge1xuXHRcdFx0YmFnLnZlcmlmeShTSy5WYWwpXG5cdFx0XHR2ZXJpZnlOb3RMYXp5KGVsZW1lbnQsICdJdGVyYXRpb24gZWxlbWVudCBjYW4gbm90IGJlIGxhenkuJylcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbChlbGVtZW50LCB2ZXJpZnlCbG9jaylcblx0XHR9LFxuXHRcdHZlcmlmeUJsb2NrKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlJbkxvb3AobG9vcFVzZXIpIHtcblx0Y2hlY2sob3BMb29wICE9PSBudWxsLCBsb29wVXNlci5sb2MsICdOb3QgaW4gYSBsb29wLicpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeU1ldGhvZEltcGwoXywgZG9WZXJpZnkpIHtcblx0dmVyaWZ5TmFtZShfLnN5bWJvbClcblx0d2l0aE1ldGhvZChfLCBkb1ZlcmlmeSlcbn1cbiJdfQ==
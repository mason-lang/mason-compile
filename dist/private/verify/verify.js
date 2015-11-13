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
			(0, _context.check)(this.caught.opType === null, this.caught.loc, 'TODO: Caught types');
			(0, _locals.verifyAndPlusLocal)(this.caught, () => this.block.verify(sk));
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
			this.try.verify(sk);
			(0, _util2.verifyOp)(this.opCatch, sk);
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

			(0, _util2.verifyOp)(this.opImportGlobal);
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

		Import: verifyImport,
		ImportGlobal: verifyImport,

		With(sk) {
			(0, _SK.markStatement)(this, sk);
			this.value.verify(_SK2.default.Val);
			(0, _context2.withIifeIfVal)(sk, () => {
				if (sk === _SK2.default.Val && this.declare.name === '_') _context2.okToNotUse.add(this.declare);
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

	function verifyImport() {
		const addUseLocal = _ => {
			const prev = _context2.locals.get(_.name);

			(0, _context.check)(prev === undefined, _.loc, () => `${ (0, _CompileError.code)(_.name) } already imported at ${ prev.loc }`);
			(0, _locals.verifyLocalDeclare)(_);
			(0, _locals.setLocal)(_);
		};

		for (const _ of this.imported) addUseLocal(_);

		(0, _util.opEach)(this.opImportDefault, addUseLocal);
	}

	function verifyFor(forLoop) {
		const verifyBlock = () => (0, _context2.withLoop)(forLoop, () => {
			forLoop.block.verify(_SK2.default.Do);
		});

		(0, _util.ifElse)(forLoop.opIteratee, _ref => {
			let element = _ref.element;
			let bag = _ref.bag;
			bag.verify(_SK2.default.Val);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQW9Cd0IsTUFBTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQUFOLE1BQU0iLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCBvcHRpb25zLCB3YXJufSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0ICogYXMgTXNBc3RUeXBlcyBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7QmxvY2ssIENsYXNzLCBDb25zdHJ1Y3RvciwgRnVuLCBGdW5zLCBLaW5kLCBMb2NhbERlY2xhcmUsIE1ldGhvZCwgUGF0dGVybn0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0tleXdvcmRzLCBzaG93S2V5d29yZH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2NhdCwgaWZFbHNlLCBpbXBsZW1lbnRNYW55LCBvcEVhY2h9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2Z1bktpbmQsIGxvY2FscywgbWV0aG9kLCBva1RvTm90VXNlLCBvcExvb3AsIHJlc3VsdHMsIHNldHVwLCB0ZWFyRG93biwgd2l0aElpZmUsXG5cdHdpdGhJaWZlSWYsIHdpdGhJaWZlSWZWYWwsIHdpdGhJbkZ1bktpbmQsIHdpdGhNZXRob2QsIHdpdGhMb29wLCB3aXRoTmFtZX0gZnJvbSAnLi9jb250ZXh0J1xuaW1wb3J0IHthY2Nlc3NMb2NhbCwgZ2V0TG9jYWxEZWNsYXJlLCBmYWlsTWlzc2luZ0xvY2FsLCBzZXREZWNsYXJlQWNjZXNzZWQsIHNldExvY2FsLFxuXHR2ZXJpZnlBbmRQbHVzTG9jYWwsIHZlcmlmeUFuZFBsdXNMb2NhbHMsIHZlcmlmeUxvY2FsRGVjbGFyZSwgd2FyblVudXNlZExvY2Fscywgd2l0aEJsb2NrTG9jYWxzXG5cdH0gZnJvbSAnLi9sb2NhbHMnXG5pbXBvcnQgU0sse2NoZWNrRG8sIGNoZWNrVmFsLCBtYXJrU3RhdGVtZW50fSBmcm9tICcuL1NLJ1xuaW1wb3J0IHtzZXROYW1lLCB2ZXJpZnlOYW1lLCB2ZXJpZnlPcH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHZlcmlmeUJsb2NrLCB7dmVyaWZ5TW9kdWxlTGluZXN9IGZyb20gJy4vdmVyaWZ5QmxvY2snXG5cbi8qKlxuR2VuZXJhdGVzIGluZm9ybWF0aW9uIG5lZWRlZCBkdXJpbmcgdHJhbnNwaWxpbmcsIHRoZSBWZXJpZnlSZXN1bHRzLlxuQWxzbyBjaGVja3MgZm9yIGV4aXN0ZW5jZSBvZiBsb2NhbCB2YXJpYWJsZXMgYW5kIHdhcm5zIGZvciB1bnVzZWQgbG9jYWxzLlxuQHBhcmFtIHtNc0FzdH0gbXNBc3RcbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB2ZXJpZnkobXNBc3QpIHtcblx0c2V0dXAoKVxuXHRtc0FzdC52ZXJpZnkoKVxuXHR3YXJuVW51c2VkTG9jYWxzKClcblx0Y29uc3QgcmVzID0gcmVzdWx0c1xuXHR0ZWFyRG93bigpXG5cdHJldHVybiByZXNcbn1cblxuaW1wbGVtZW50TWFueShNc0FzdFR5cGVzLCAndmVyaWZ5Jywge1xuXHRBc3NlcnQoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdHRoaXMuY29uZGl0aW9uLnZlcmlmeShTSy5WYWwpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFRocm93biwgU0suVmFsKVxuXHR9LFxuXG5cdEFzc2lnblNpbmdsZShzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0d2l0aE5hbWUodGhpcy5hc3NpZ25lZS5uYW1lLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBkb1YgPSAoKSA9PiB7XG5cdFx0XHRcdC8qXG5cdFx0XHRcdEZ1biBhbmQgQ2xhc3Mgb25seSBnZXQgbmFtZSBpZiB0aGV5IGFyZSBpbW1lZGlhdGVseSBhZnRlciB0aGUgYXNzaWdubWVudC5cblx0XHRcdFx0c28gaW4gYHggPSAkYWZ0ZXItdGltZSAxMDAwIHxgIHRoZSBmdW5jdGlvbiBpcyBub3QgbmFtZWQuXG5cdFx0XHRcdCovXG5cdFx0XHRcdGlmICh0aGlzLnZhbHVlIGluc3RhbmNlb2YgQ2xhc3MgfHxcblx0XHRcdFx0XHR0aGlzLnZhbHVlIGluc3RhbmNlb2YgRnVuIHx8XG5cdFx0XHRcdFx0dGhpcy52YWx1ZSBpbnN0YW5jZW9mIE1ldGhvZCB8fFxuXHRcdFx0XHRcdHRoaXMudmFsdWUgaW5zdGFuY2VvZiBLaW5kKVxuXHRcdFx0XHRcdHNldE5hbWUodGhpcy52YWx1ZSlcblxuXHRcdFx0XHQvLyBBc3NpZ25lZSByZWdpc3RlcmVkIGJ5IHZlcmlmeUxpbmVzLlxuXHRcdFx0XHR0aGlzLmFzc2lnbmVlLnZlcmlmeSgpXG5cdFx0XHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLmFzc2lnbmVlLmlzTGF6eSgpKVxuXHRcdFx0XHR3aXRoQmxvY2tMb2NhbHMoZG9WKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRkb1YoKVxuXHRcdH0pXG5cdH0sXG5cblx0QXNzaWduRGVzdHJ1Y3R1cmUoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdC8vIEFzc2lnbmVlcyByZWdpc3RlcmVkIGJ5IHZlcmlmeUxpbmVzLlxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFzc2lnbmVlcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0QmFnRW50cnkoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdEJhZ1NpbXBsZShzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLnBhcnRzKVxuXHRcdFx0Xy52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdEJsb2NrOiB2ZXJpZnlCbG9jayxcblxuXHRCbG9ja1dyYXAoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR3aXRoSWlmZSgoKSA9PiB0aGlzLmJsb2NrLnZlcmlmeShzaykpXG5cdH0sXG5cblx0QnJlYWsoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdHZlcmlmeUluTG9vcCh0aGlzKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BWYWx1ZSwgU0suVmFsKVxuXHRcdGNoZWNrKHJlc3VsdHMuaXNTdGF0ZW1lbnQob3BMb29wKSA9PT0gKHRoaXMub3BWYWx1ZSA9PT0gbnVsbCksIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0dGhpcy5vcFZhbHVlID09PSBudWxsID9cblx0XHRcdFx0YCR7c2hvd0tleXdvcmQoS2V5d29yZHMuRm9yKX0gaW4gZXhwcmVzc2lvbiBwb3NpdGlvbiBtdXN0IGJyZWFrIHdpdGggYSB2YWx1ZS5gIDpcblx0XHRcdFx0YCR7c2hvd0tleXdvcmQoS2V5d29yZHMuQnJlYWspfSB3aXRoIHZhbHVlIGlzIG9ubHkgdmFsaWQgaW4gYCArXG5cdFx0XHRcdGAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkZvcil9IGluIGV4cHJlc3Npb24gcG9zaXRpb24uYClcblx0fSxcblxuXHRDYWxsKF9zaykge1xuXHRcdHRoaXMuY2FsbGVkLnZlcmlmeShTSy5WYWwpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRDYXNlKHNrKSB7XG5cdFx0bWFya1N0YXRlbWVudCh0aGlzLCBzaylcblx0XHR3aXRoSWlmZUlmVmFsKHNrLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBkb0l0ID0gKCkgPT4ge1xuXHRcdFx0XHRmb3IgKGNvbnN0IHBhcnQgb2YgdGhpcy5wYXJ0cylcblx0XHRcdFx0XHRwYXJ0LnZlcmlmeShzaylcblx0XHRcdFx0dmVyaWZ5T3AodGhpcy5vcEVsc2UsIHNrKVxuXHRcdFx0fVxuXHRcdFx0aWZFbHNlKHRoaXMub3BDYXNlZCxcblx0XHRcdFx0XyA9PiB7XG5cdFx0XHRcdFx0Xy52ZXJpZnkoU0suRG8pXG5cdFx0XHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKF8uYXNzaWduZWUsIGRvSXQpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRvSXQpXG5cdFx0fSlcblx0fSxcblxuXHRDYXNlUGFydChzaykge1xuXHRcdGlmICh0aGlzLnRlc3QgaW5zdGFuY2VvZiBQYXR0ZXJuKSB7XG5cdFx0XHR0aGlzLnRlc3QudHlwZS52ZXJpZnkoU0suVmFsKVxuXHRcdFx0dGhpcy50ZXN0LnBhdHRlcm5lZC52ZXJpZnkoU0suVmFsKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2Fscyh0aGlzLnRlc3QubG9jYWxzLCAoKSA9PiB0aGlzLnJlc3VsdC52ZXJpZnkoc2spKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnRlc3QudmVyaWZ5KFNLLlZhbClcblx0XHRcdHRoaXMucmVzdWx0LnZlcmlmeShzaylcblx0XHR9XG5cdH0sXG5cblx0Q2F0Y2goc2spIHtcblx0XHRjaGVjayh0aGlzLmNhdWdodC5vcFR5cGUgPT09IG51bGwsIHRoaXMuY2F1Z2h0LmxvYywgJ1RPRE86IENhdWdodCB0eXBlcycpXG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuY2F1Z2h0LCAoKSA9PiB0aGlzLmJsb2NrLnZlcmlmeShzaykpXG5cdH0sXG5cblx0Q2xhc3Moc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wU3VwZXJDbGFzcywgU0suVmFsKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmtpbmRzKVxuXHRcdFx0Xy52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BEbylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5zdGF0aWNzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdGlmICh0aGlzLm9wQ29uc3RydWN0b3IgIT09IG51bGwpXG5cdFx0XHR0aGlzLm9wQ29uc3RydWN0b3IudmVyaWZ5KHRoaXMub3BTdXBlckNsYXNzICE9PSBudWxsKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLm1ldGhvZHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0Ly8gbmFtZSBzZXQgYnkgQXNzaWduU2luZ2xlXG5cdH0sXG5cblx0Q2xhc3NLaW5kRG8oKSB7XG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuZGVjbGFyZUZvY3VzLCAoKSA9PiB0aGlzLmJsb2NrLnZlcmlmeShTSy5EbykpXG5cdH0sXG5cblx0Q29uZChzaykge1xuXHRcdC8vIENvdWxkIGJlIGEgc3RhdGVtZW50IGlmIGJvdGggcmVzdWx0cyBhcmUuXG5cdFx0dGhpcy50ZXN0LnZlcmlmeShTSy5WYWwpXG5cdFx0dGhpcy5pZlRydWUudmVyaWZ5KHNrKVxuXHRcdHRoaXMuaWZGYWxzZS52ZXJpZnkoc2spXG5cdH0sXG5cblx0Q29uZGl0aW9uYWwoc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdHRoaXMudGVzdC52ZXJpZnkoU0suVmFsKVxuXHRcdHdpdGhJaWZlSWYodGhpcy5yZXN1bHQgaW5zdGFuY2VvZiBCbG9jayAmJiBzayA9PT0gU0suVmFsLCAoKSA9PiB7XG5cdFx0XHR0aGlzLnJlc3VsdC52ZXJpZnkoc2spXG5cdFx0fSlcblx0fSxcblxuXHRDb25zdHJ1Y3RvcihjbGFzc0hhc1N1cGVyKSB7XG5cdFx0b2tUb05vdFVzZS5hZGQodGhpcy5mdW4ub3BEZWNsYXJlVGhpcylcblx0XHR3aXRoTWV0aG9kKHRoaXMsICgpID0+IHsgdGhpcy5mdW4udmVyaWZ5KFNLLlZhbCkgfSlcblxuXHRcdGNvbnN0IHN1cGVyQ2FsbCA9IHJlc3VsdHMuY29uc3RydWN0b3JUb1N1cGVyLmdldCh0aGlzKVxuXG5cdFx0aWYgKGNsYXNzSGFzU3VwZXIpXG5cdFx0XHRjaGVjayhzdXBlckNhbGwgIT09IHVuZGVmaW5lZCwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRcdGBDb25zdHJ1Y3RvciBtdXN0IGNvbnRhaW4gJHtzaG93S2V5d29yZChLZXl3b3Jkcy5TdXBlcil9YClcblx0XHRlbHNlXG5cdFx0XHRjaGVjayhzdXBlckNhbGwgPT09IHVuZGVmaW5lZCwgKCkgPT4gc3VwZXJDYWxsLmxvYywgKCkgPT5cblx0XHRcdFx0YENsYXNzIGhhcyBubyBzdXBlcmNsYXNzLCBzbyAke3Nob3dLZXl3b3JkKEtleXdvcmRzLlN1cGVyKX0gaXMgbm90IGFsbG93ZWQuYClcblxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLm1lbWJlckFyZ3MpXG5cdFx0XHRzZXREZWNsYXJlQWNjZXNzZWQoXywgdGhpcylcblx0fSxcblxuXHRFeGNlcHQoc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdHRoaXMudHJ5LnZlcmlmeShzaylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wQ2F0Y2gsIHNrKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BGaW5hbGx5LCBTSy5Ebylcblx0fSxcblxuXHRGb3JCYWcoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5idWlsdCwgKCkgPT4gdmVyaWZ5Rm9yKHRoaXMpKVxuXHR9LFxuXG5cdEZvcihzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0dmVyaWZ5Rm9yKHRoaXMpXG5cdH0sXG5cblx0RnVuKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0Y2hlY2sodGhpcy5vcFJldHVyblR5cGUgPT09IG51bGwgfHwgIXRoaXMuaXNEbywgdGhpcy5sb2MsXG5cdFx0XHQnRnVuY3Rpb24gd2l0aCByZXR1cm4gdHlwZSBtdXN0IHJldHVybiBzb21ldGhpbmcuJylcblx0XHR3aXRoQmxvY2tMb2NhbHMoKCkgPT4ge1xuXHRcdFx0d2l0aEluRnVuS2luZCh0aGlzLmtpbmQsICgpID0+XG5cdFx0XHRcdHdpdGhMb29wKG51bGwsICgpID0+IHtcblx0XHRcdFx0XHRjb25zdCBhbGxBcmdzID0gY2F0KHRoaXMub3BEZWNsYXJlVGhpcywgdGhpcy5hcmdzLCB0aGlzLm9wUmVzdEFyZylcblx0XHRcdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKGFsbEFyZ3MsICgpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMuYmxvY2sudmVyaWZ5KHRoaXMuaXNEbyA/IFNLLkRvIDogU0suVmFsKVxuXHRcdFx0XHRcdFx0dmVyaWZ5T3AodGhpcy5vcFJldHVyblR5cGUsIFNLLlZhbClcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9KSlcblx0XHR9KVxuXHRcdC8vIG5hbWUgc2V0IGJ5IEFzc2lnblNpbmdsZVxuXHR9LFxuXG5cdEZ1bkFic3RyYWN0KCkge1xuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFJlc3RBcmcpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFJldHVyblR5cGUsIFNLLlZhbClcblx0fSxcblxuXHRJZ25vcmUoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmlnbm9yZWROYW1lcylcblx0XHRcdGFjY2Vzc0xvY2FsKHRoaXMsIF8pXG5cdH0sXG5cblx0S2luZChzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLnN1cGVyS2luZHMpXG5cdFx0XHRfLnZlcmlmeShTSy5WYWwpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcERvLCBTSy5Ebylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5zdGF0aWNzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLm1ldGhvZHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0Ly8gbmFtZSBzZXQgYnkgQXNzaWduU2luZ2xlXG5cdH0sXG5cblx0TGF6eShzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHdpdGhCbG9ja0xvY2FscygoKSA9PiB0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpKVxuXHR9LFxuXG5cdExvY2FsQWNjZXNzKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0Y29uc3QgZGVjbGFyZSA9IGxvY2Fscy5nZXQodGhpcy5uYW1lKVxuXHRcdGlmIChkZWNsYXJlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdGNvbnN0IGJ1aWx0aW5QYXRoID0gb3B0aW9ucy5idWlsdGluTmFtZVRvUGF0aC5nZXQodGhpcy5uYW1lKVxuXHRcdFx0aWYgKGJ1aWx0aW5QYXRoID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdGZhaWxNaXNzaW5nTG9jYWwodGhpcy5sb2MsIHRoaXMubmFtZSlcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRjb25zdCBuYW1lcyA9IHJlc3VsdHMuYnVpbHRpblBhdGhUb05hbWVzLmdldChidWlsdGluUGF0aClcblx0XHRcdFx0aWYgKG5hbWVzID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdFx0cmVzdWx0cy5idWlsdGluUGF0aFRvTmFtZXMuc2V0KGJ1aWx0aW5QYXRoLCBuZXcgU2V0KFt0aGlzLm5hbWVdKSlcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdG5hbWVzLmFkZCh0aGlzLm5hbWUpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc3VsdHMubG9jYWxBY2Nlc3NUb0RlY2xhcmUuc2V0KHRoaXMsIGRlY2xhcmUpXG5cdFx0XHRzZXREZWNsYXJlQWNjZXNzZWQoZGVjbGFyZSwgdGhpcylcblx0XHR9XG5cdH0sXG5cblx0Ly8gQWRkaW5nIExvY2FsRGVjbGFyZXMgdG8gdGhlIGF2YWlsYWJsZSBsb2NhbHMgaXMgZG9uZSBieSBGdW4gb3IgbGluZU5ld0xvY2Fscy5cblx0TG9jYWxEZWNsYXJlKCkge1xuXHRcdGNvbnN0IGJ1aWx0aW5QYXRoID0gb3B0aW9ucy5idWlsdGluTmFtZVRvUGF0aC5nZXQodGhpcy5uYW1lKVxuXHRcdGlmIChidWlsdGluUGF0aCAhPT0gdW5kZWZpbmVkKVxuXHRcdFx0d2Fybih0aGlzLmxvYywgYExvY2FsICR7Y29kZSh0aGlzLm5hbWUpfSBvdmVycmlkZXMgYnVpbHRpbiBmcm9tICR7Y29kZShidWlsdGluUGF0aCl9LmApXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFR5cGUsIFNLLlZhbClcblx0fSxcblxuXHRMb2NhbE11dGF0ZShzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0Y29uc3QgZGVjbGFyZSA9IGdldExvY2FsRGVjbGFyZSh0aGlzLm5hbWUsIHRoaXMubG9jKVxuXHRcdGNoZWNrKGRlY2xhcmUuaXNNdXRhYmxlKCksIHRoaXMubG9jLCAoKSA9PiBgJHtjb2RlKHRoaXMubmFtZSl9IGlzIG5vdCBtdXRhYmxlLmApXG5cdFx0Ly8gVE9ETzogVHJhY2sgbXV0YXRpb25zLiBNdXRhYmxlIGxvY2FsIG11c3QgYmUgbXV0YXRlZCBzb21ld2hlcmUuXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdExvZ2ljKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0Y2hlY2sodGhpcy5hcmdzLmxlbmd0aCA+IDEsIHRoaXMubG9jLCAnTG9naWMgZXhwcmVzc2lvbiBuZWVkcyBhdCBsZWFzdCAyIGFyZ3VtZW50cy4nKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0XHRfLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0Tm90KHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy5hcmcudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHROdW1iZXJMaXRlcmFsKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdH0sXG5cblx0TWFwRW50cnkoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdFx0dGhpcy5rZXkudmVyaWZ5KFNLLlZhbClcblx0XHR0aGlzLnZhbC52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdE1lbWJlcihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHRoaXMub2JqZWN0LnZlcmlmeShTSy5WYWwpXG5cdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdH0sXG5cblx0TWVtYmVyRnVuKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dmVyaWZ5T3AodGhpcy5vcE9iamVjdCwgU0suVmFsKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdE1lbWJlclNldChzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0dGhpcy5vYmplY3QudmVyaWZ5KFNLLlZhbClcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVHlwZSwgU0suVmFsKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRNZXRob2Qoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRva1RvTm90VXNlLmFkZCh0aGlzLmZ1bi5vcERlY2xhcmVUaGlzKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmZ1bi5hcmdzKVxuXHRcdFx0b2tUb05vdFVzZS5hZGQoXylcblx0XHRvcEVhY2godGhpcy5mdW4ub3BSZXN0QXJnLCBfID0+IG9rVG9Ob3RVc2UuYWRkKF8pKVxuXHRcdHRoaXMuZnVuLnZlcmlmeShTSy5WYWwpXG5cdFx0Ly8gbmFtZSBzZXQgYnkgQXNzaWduU2luZ2xlXG5cdH0sXG5cblx0TWV0aG9kSW1wbCgpIHtcblx0XHR2ZXJpZnlNZXRob2RJbXBsKHRoaXMsICgpID0+IHtcblx0XHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZnVuLm9wRGVjbGFyZVRoaXMpXG5cdFx0XHR0aGlzLmZ1bi52ZXJpZnkoU0suVmFsKVxuXHRcdH0pXG5cdH0sXG5cdE1ldGhvZEdldHRlcigpIHtcblx0XHR2ZXJpZnlNZXRob2RJbXBsKHRoaXMsICgpID0+IHtcblx0XHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZGVjbGFyZVRoaXMpXG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKFt0aGlzLmRlY2xhcmVUaGlzXSwgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeShTSy5WYWwpXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH0sXG5cdE1ldGhvZFNldHRlcigpIHtcblx0XHR2ZXJpZnlNZXRob2RJbXBsKHRoaXMsICgpID0+IHtcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoW3RoaXMuZGVjbGFyZVRoaXMsIHRoaXMuZGVjbGFyZUZvY3VzXSwgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeShTSy5Ebylcblx0XHRcdH0pXG5cdFx0fSlcblx0fSxcblxuXHRNb2R1bGUoKSB7XG5cdFx0Ly8gTm8gbmVlZCB0byB2ZXJpZnkgdGhpcy5kb0ltcG9ydHMuXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuaW1wb3J0cylcblx0XHRcdF8udmVyaWZ5KClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wSW1wb3J0R2xvYmFsKVxuXG5cdFx0d2l0aE5hbWUob3B0aW9ucy5tb2R1bGVOYW1lKCksICgpID0+IHtcblx0XHRcdHZlcmlmeU1vZHVsZUxpbmVzKHRoaXMubGluZXMsIHRoaXMubG9jKVxuXHRcdH0pXG5cdH0sXG5cblx0TmV3KHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy50eXBlLnZlcmlmeShTSy5WYWwpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRPYmpFbnRyeUFzc2lnbihzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0aWYgKCFyZXN1bHRzLmlzT2JqRW50cnlFeHBvcnQodGhpcykpXG5cdFx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHRoaXMuYXNzaWduLnZlcmlmeShTSy5Ebylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hc3NpZ24uYWxsQXNzaWduZWVzKCkpXG5cdFx0XHRzZXREZWNsYXJlQWNjZXNzZWQoXywgdGhpcylcblx0fSxcblxuXHRPYmpFbnRyeVBsYWluKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHRpZiAocmVzdWx0cy5pc09iakVudHJ5RXhwb3J0KHRoaXMpKVxuXHRcdFx0Y2hlY2sodHlwZW9mIHRoaXMubmFtZSA9PT0gJ3N0cmluZycsIHRoaXMubG9jLFxuXHRcdFx0XHQnTW9kdWxlIGV4cG9ydCBtdXN0IGhhdmUgYSBjb25zdGFudCBuYW1lLicpXG5cdFx0ZWxzZSB7XG5cdFx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdFx0fVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRPYmpTaW1wbGUoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRjb25zdCBrZXlzID0gbmV3IFNldCgpXG5cdFx0Zm9yIChjb25zdCBwYWlyIG9mIHRoaXMucGFpcnMpIHtcblx0XHRcdGNvbnN0IHtrZXksIHZhbHVlfSA9IHBhaXJcblx0XHRcdGNoZWNrKCFrZXlzLmhhcyhrZXkpLCBwYWlyLmxvYywgKCkgPT4gYER1cGxpY2F0ZSBrZXkgJHtrZXl9YClcblx0XHRcdGtleXMuYWRkKGtleSlcblx0XHRcdHZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdFx0fVxuXHR9LFxuXG5cdEdldHRlckZ1bihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdFF1b3RlUGxhaW4oc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5wYXJ0cylcblx0XHRcdHZlcmlmeU5hbWUoXylcblx0fSxcblxuXHRRdW90ZVNpbXBsZShzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHR9LFxuXG5cdFF1b3RlVGFnZ2VkVGVtcGxhdGUoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR0aGlzLnRhZy52ZXJpZnkoU0suVmFsKVxuXHRcdHRoaXMucXVvdGUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRSYW5nZShzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHRoaXMuc3RhcnQudmVyaWZ5KFNLLlZhbClcblx0XHR2ZXJpZnlPcCh0aGlzLmVuZCwgU0suVmFsKVxuXHR9LFxuXG5cdFNldFN1Yihzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0dGhpcy5vYmplY3QudmVyaWZ5KFNLLlZhbClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5zdWJiZWRzKVxuXHRcdFx0Xy52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BUeXBlLCBTSy5WYWwpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdFNpbXBsZUZ1bihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbChMb2NhbERlY2xhcmUuZm9jdXModGhpcy5sb2MpLCAoKSA9PiB7XG5cdFx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdFx0fSlcblx0fSxcblxuXHRTcGVjaWFsRG8oc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHR9LFxuXG5cdFNwZWNpYWxWYWwoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRzZXROYW1lKHRoaXMpXG5cdH0sXG5cblx0U3ByZWFkKCkge1xuXHRcdHRoaXMuc3ByZWFkZWQudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRTdXBlckNhbGwoc2spIHtcblx0XHRjaGVjayhtZXRob2QgIT09IG51bGwsIHRoaXMubG9jLCAnTXVzdCBiZSBpbiBhIG1ldGhvZC4nKVxuXHRcdHJlc3VsdHMuc3VwZXJDYWxsVG9NZXRob2Quc2V0KHRoaXMsIG1ldGhvZClcblxuXHRcdGlmIChtZXRob2QgaW5zdGFuY2VvZiBDb25zdHJ1Y3Rvcikge1xuXHRcdFx0Y2hlY2soc2sgPT09IFNLLkRvLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdFx0YCR7c2hvd0tleXdvcmQoS2V5d29yZHMuU3VwZXIpfSBpbiBjb25zdHJ1Y3RvciBtdXN0IGFwcGVhciBhcyBhIHN0YXRlbWVudC4nYClcblx0XHRcdHJlc3VsdHMuY29uc3RydWN0b3JUb1N1cGVyLnNldChtZXRob2QsIHRoaXMpXG5cdFx0fVxuXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRTdXBlck1lbWJlcihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdGNoZWNrKG1ldGhvZCAhPT0gbnVsbCwgdGhpcy5sb2MsICdNdXN0IGJlIGluIG1ldGhvZC4nKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdFN3aXRjaChzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0d2l0aElpZmVJZlZhbChzaywgKCkgPT4ge1xuXHRcdFx0dGhpcy5zd2l0Y2hlZC52ZXJpZnkoU0suVmFsKVxuXHRcdFx0Zm9yIChjb25zdCBwYXJ0IG9mIHRoaXMucGFydHMpXG5cdFx0XHRcdHBhcnQudmVyaWZ5KHNrKVxuXHRcdFx0dmVyaWZ5T3AodGhpcy5vcEVsc2UsIHNrKVxuXHRcdH0pXG5cdH0sXG5cblx0U3dpdGNoUGFydChzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMudmFsdWVzKVxuXHRcdFx0Xy52ZXJpZnkoU0suVmFsKVxuXHRcdHRoaXMucmVzdWx0LnZlcmlmeShzaylcblx0fSxcblxuXHRUaHJvdygpIHtcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVGhyb3duLCBTSy5WYWwpXG5cdH0sXG5cblx0SW1wb3J0OiB2ZXJpZnlJbXBvcnQsXG5cdEltcG9ydEdsb2JhbDogdmVyaWZ5SW1wb3J0LFxuXG5cdFdpdGgoc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0XHR3aXRoSWlmZUlmVmFsKHNrLCAoKSA9PiB7XG5cdFx0XHRpZiAoc2sgPT09IFNLLlZhbCAmJiB0aGlzLmRlY2xhcmUubmFtZSA9PT0gJ18nKVxuXHRcdFx0XHRva1RvTm90VXNlLmFkZCh0aGlzLmRlY2xhcmUpXG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5kZWNsYXJlLCAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuYmxvY2sudmVyaWZ5KFNLLkRvKVxuXHRcdFx0fSlcblx0XHR9KVxuXHR9LFxuXG5cdFlpZWxkKF9zaykge1xuXHRcdGNoZWNrKGZ1bktpbmQgIT09IEZ1bnMuUGxhaW4sIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0YENhbm5vdCAke3Nob3dLZXl3b3JkKEtleXdvcmRzLllpZWxkKX0gb3V0c2lkZSBvZiBhc3luYy9nZW5lcmF0b3IuYClcblx0XHRpZiAoZnVuS2luZCA9PT0gRnVucy5Bc3luYylcblx0XHRcdGNoZWNrKHRoaXMub3BZaWVsZGVkICE9PSBudWxsLCB0aGlzLmxvYywgJ0Nhbm5vdCBhd2FpdCBub3RoaW5nLicpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFlpZWxkZWQsIFNLLlZhbClcblx0fSxcblxuXHRZaWVsZFRvKF9zaykge1xuXHRcdGNoZWNrKGZ1bktpbmQgPT09IEZ1bnMuR2VuZXJhdG9yLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdGBDYW5ub3QgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5ZaWVsZFRvKX0gb3V0c2lkZSBvZiBnZW5lcmF0b3IuYClcblx0XHR0aGlzLnlpZWxkZWRUby52ZXJpZnkoU0suVmFsKVxuXHR9XG59KVxuXG4vLyBTaGFyZWQgaW1wbGVtZW50YXRpb25zXG5cbmZ1bmN0aW9uIHZlcmlmeUltcG9ydCgpIHtcblx0Ly8gU2luY2UgVXNlcyBhcmUgYWx3YXlzIGluIHRoZSBvdXRlcm1vc3Qgc2NvcGUsIGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgc2hhZG93aW5nLlxuXHQvLyBTbyB3ZSBtdXRhdGUgYGxvY2Fsc2AgZGlyZWN0bHkuXG5cdGNvbnN0IGFkZFVzZUxvY2FsID0gXyA9PiB7XG5cdFx0Y29uc3QgcHJldiA9IGxvY2Fscy5nZXQoXy5uYW1lKVxuXHRcdGNoZWNrKHByZXYgPT09IHVuZGVmaW5lZCwgXy5sb2MsICgpID0+XG5cdFx0XHRgJHtjb2RlKF8ubmFtZSl9IGFscmVhZHkgaW1wb3J0ZWQgYXQgJHtwcmV2LmxvY31gKVxuXHRcdHZlcmlmeUxvY2FsRGVjbGFyZShfKVxuXHRcdHNldExvY2FsKF8pXG5cdH1cblx0Zm9yIChjb25zdCBfIG9mIHRoaXMuaW1wb3J0ZWQpXG5cdFx0YWRkVXNlTG9jYWwoXylcblx0b3BFYWNoKHRoaXMub3BJbXBvcnREZWZhdWx0LCBhZGRVc2VMb2NhbClcbn1cblxuLy8gSGVscGVycyBzcGVjaWZpYyB0byBjZXJ0YWluIE1zQXN0IHR5cGVzXG5cbmZ1bmN0aW9uIHZlcmlmeUZvcihmb3JMb29wKSB7XG5cdGNvbnN0IHZlcmlmeUJsb2NrID0gKCkgPT4gd2l0aExvb3AoZm9yTG9vcCwgKCkgPT4ge1xuXHRcdGZvckxvb3AuYmxvY2sudmVyaWZ5KFNLLkRvKVxuXHR9KVxuXHRpZkVsc2UoZm9yTG9vcC5vcEl0ZXJhdGVlLFxuXHRcdCh7ZWxlbWVudCwgYmFnfSkgPT4ge1xuXHRcdFx0YmFnLnZlcmlmeShTSy5WYWwpXG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwoZWxlbWVudCwgdmVyaWZ5QmxvY2spXG5cdFx0fSxcblx0XHR2ZXJpZnlCbG9jaylcbn1cblxuZnVuY3Rpb24gdmVyaWZ5SW5Mb29wKGxvb3BVc2VyKSB7XG5cdGNoZWNrKG9wTG9vcCAhPT0gbnVsbCwgbG9vcFVzZXIubG9jLCAnTm90IGluIGEgbG9vcC4nKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlNZXRob2RJbXBsKF8sIGRvVmVyaWZ5KSB7XG5cdHZlcmlmeU5hbWUoXy5zeW1ib2wpXG5cdHdpdGhNZXRob2QoXywgZG9WZXJpZnkpXG59XG4iXX0=
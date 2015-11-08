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

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
			(0, _SK.checkVal)(this, sk);
			this.test.verify(_SK2.default.Val);
			this.ifTrue.verify(_SK2.default.Val);
			this.ifFalse.verify(_SK2.default.Val);
		},

		Conditional(sk) {
			(0, _SK.markStatement)(this, sk);
			this.test.verify(_SK2.default.Val);
			(0, _context2.withIifeIfVal)(sk, () => {
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
			(0, _context.check)(this.args.length > 1, 'Logic expression needs at least 2 arguments.');

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
			(0, _locals.accessLocal)(this, 'built');
			(0, _util2.verifyName)(this.name);
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
			(0, _context.check)(_context2.funKind !== _MsAst.Funs.Plain, () => `Cannot ${ (0, _Token.showKeyword)(_Token.Keywords.Yield) } outside of async/generator.`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQW9Cd0IsTUFBTTs7Ozs7Ozs7Ozs7O1VBQU4sTUFBTSIsImZpbGUiOiJ2ZXJpZnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2ssIG9wdGlvbnMsIHdhcm59IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtDbGFzcywgQ29uc3RydWN0b3IsIEZ1biwgRnVucywgS2luZCwgTWV0aG9kLCBQYXR0ZXJufSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7S2V5d29yZHMsIHNob3dLZXl3b3JkfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7Y2F0LCBpZkVsc2UsIGltcGxlbWVudE1hbnksIG9wRWFjaH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7ZnVuS2luZCwgbG9jYWxzLCBtZXRob2QsIG9rVG9Ob3RVc2UsIG9wTG9vcCwgcmVzdWx0cywgc2V0dXAsIHRlYXJEb3duLCB3aXRoSWlmZSxcblx0d2l0aElpZmVJZlZhbCwgd2l0aEluRnVuS2luZCwgd2l0aE1ldGhvZCwgd2l0aExvb3AsIHdpdGhOYW1lfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge2FjY2Vzc0xvY2FsLCBnZXRMb2NhbERlY2xhcmUsIGZhaWxNaXNzaW5nTG9jYWwsIHNldERlY2xhcmVBY2Nlc3NlZCwgc2V0TG9jYWwsXG5cdHZlcmlmeUFuZFBsdXNMb2NhbCwgdmVyaWZ5QW5kUGx1c0xvY2FscywgdmVyaWZ5TG9jYWxEZWNsYXJlLCB3YXJuVW51c2VkTG9jYWxzLCB3aXRoQmxvY2tMb2NhbHNcblx0fSBmcm9tICcuL2xvY2FscydcbmltcG9ydCBTSyx7Y2hlY2tEbywgY2hlY2tWYWwsIG1hcmtTdGF0ZW1lbnR9IGZyb20gJy4vU0snXG5pbXBvcnQge3NldE5hbWUsIHZlcmlmeU5hbWUsIHZlcmlmeU9wfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgdmVyaWZ5QmxvY2ssIHt2ZXJpZnlNb2R1bGVMaW5lc30gZnJvbSAnLi92ZXJpZnlCbG9jaydcblxuLyoqXG5HZW5lcmF0ZXMgaW5mb3JtYXRpb24gbmVlZGVkIGR1cmluZyB0cmFuc3BpbGluZywgdGhlIFZlcmlmeVJlc3VsdHMuXG5BbHNvIGNoZWNrcyBmb3IgZXhpc3RlbmNlIG9mIGxvY2FsIHZhcmlhYmxlcyBhbmQgd2FybnMgZm9yIHVudXNlZCBsb2NhbHMuXG5AcGFyYW0ge01zQXN0fSBtc0FzdFxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHZlcmlmeShtc0FzdCkge1xuXHRzZXR1cCgpXG5cdG1zQXN0LnZlcmlmeSgpXG5cdHdhcm5VbnVzZWRMb2NhbHMoKVxuXHRjb25zdCByZXMgPSByZXN1bHRzXG5cdHRlYXJEb3duKClcblx0cmV0dXJuIHJlc1xufVxuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICd2ZXJpZnknLCB7XG5cdEFzc2VydChzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0dGhpcy5jb25kaXRpb24udmVyaWZ5KFNLLlZhbClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVGhyb3duLCBTSy5WYWwpXG5cdH0sXG5cblx0QXNzaWduU2luZ2xlKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHR3aXRoTmFtZSh0aGlzLmFzc2lnbmVlLm5hbWUsICgpID0+IHtcblx0XHRcdGNvbnN0IGRvViA9ICgpID0+IHtcblx0XHRcdFx0Lypcblx0XHRcdFx0RnVuIGFuZCBDbGFzcyBvbmx5IGdldCBuYW1lIGlmIHRoZXkgYXJlIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBhc3NpZ25tZW50LlxuXHRcdFx0XHRzbyBpbiBgeCA9ICRhZnRlci10aW1lIDEwMDAgfGAgdGhlIGZ1bmN0aW9uIGlzIG5vdCBuYW1lZC5cblx0XHRcdFx0Ki9cblx0XHRcdFx0aWYgKHRoaXMudmFsdWUgaW5zdGFuY2VvZiBDbGFzcyB8fFxuXHRcdFx0XHRcdHRoaXMudmFsdWUgaW5zdGFuY2VvZiBGdW4gfHxcblx0XHRcdFx0XHR0aGlzLnZhbHVlIGluc3RhbmNlb2YgTWV0aG9kIHx8XG5cdFx0XHRcdFx0dGhpcy52YWx1ZSBpbnN0YW5jZW9mIEtpbmQpXG5cdFx0XHRcdFx0c2V0TmFtZSh0aGlzLnZhbHVlKVxuXG5cdFx0XHRcdC8vIEFzc2lnbmVlIHJlZ2lzdGVyZWQgYnkgdmVyaWZ5TGluZXMuXG5cdFx0XHRcdHRoaXMuYXNzaWduZWUudmVyaWZ5KClcblx0XHRcdFx0dGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKVxuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMuYXNzaWduZWUuaXNMYXp5KCkpXG5cdFx0XHRcdHdpdGhCbG9ja0xvY2Fscyhkb1YpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGRvVigpXG5cdFx0fSlcblx0fSxcblxuXHRBc3NpZ25EZXN0cnVjdHVyZShzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0Ly8gQXNzaWduZWVzIHJlZ2lzdGVyZWQgYnkgdmVyaWZ5TGluZXMuXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXNzaWduZWVzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRCYWdFbnRyeShzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0QmFnU2ltcGxlKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMucGFydHMpXG5cdFx0XHRfLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0QmxvY2s6IHZlcmlmeUJsb2NrLFxuXG5cdEJsb2NrV3JhcChzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHdpdGhJaWZlKCgpID0+IHRoaXMuYmxvY2sudmVyaWZ5KHNrKSlcblx0fSxcblxuXHRCcmVhayhzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0dmVyaWZ5SW5Mb29wKHRoaXMpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFZhbHVlLCBTSy5WYWwpXG5cdFx0Y2hlY2socmVzdWx0cy5pc1N0YXRlbWVudChvcExvb3ApID09PSAodGhpcy5vcFZhbHVlID09PSBudWxsKSwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHR0aGlzLm9wVmFsdWUgPT09IG51bGwgP1xuXHRcdFx0XHRgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5Gb3IpfSBpbiBleHByZXNzaW9uIHBvc2l0aW9uIG11c3QgYnJlYWsgd2l0aCBhIHZhbHVlLmAgOlxuXHRcdFx0XHRgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5CcmVhayl9IHdpdGggdmFsdWUgaXMgb25seSB2YWxpZCBpbiBgICtcblx0XHRcdFx0YCR7c2hvd0tleXdvcmQoS2V5d29yZHMuRm9yKX0gaW4gZXhwcmVzc2lvbiBwb3NpdGlvbi5gKVxuXHR9LFxuXG5cdENhbGwoX3NrKSB7XG5cdFx0dGhpcy5jYWxsZWQudmVyaWZ5KFNLLlZhbClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hcmdzKVxuXHRcdFx0Xy52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdENhc2Uoc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdHdpdGhJaWZlSWZWYWwoc2ssICgpID0+IHtcblx0XHRcdGNvbnN0IGRvSXQgPSAoKSA9PiB7XG5cdFx0XHRcdGZvciAoY29uc3QgcGFydCBvZiB0aGlzLnBhcnRzKVxuXHRcdFx0XHRcdHBhcnQudmVyaWZ5KHNrKVxuXHRcdFx0XHR2ZXJpZnlPcCh0aGlzLm9wRWxzZSwgc2spXG5cdFx0XHR9XG5cdFx0XHRpZkVsc2UodGhpcy5vcENhc2VkLFxuXHRcdFx0XHRfID0+IHtcblx0XHRcdFx0XHRfLnZlcmlmeShTSy5Ebylcblx0XHRcdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwoXy5hc3NpZ25lZSwgZG9JdClcblx0XHRcdFx0fSxcblx0XHRcdFx0ZG9JdClcblx0XHR9KVxuXHR9LFxuXG5cdENhc2VQYXJ0KHNrKSB7XG5cdFx0aWYgKHRoaXMudGVzdCBpbnN0YW5jZW9mIFBhdHRlcm4pIHtcblx0XHRcdHRoaXMudGVzdC50eXBlLnZlcmlmeShTSy5WYWwpXG5cdFx0XHR0aGlzLnRlc3QucGF0dGVybmVkLnZlcmlmeShTSy5WYWwpXG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKHRoaXMudGVzdC5sb2NhbHMsICgpID0+IHRoaXMucmVzdWx0LnZlcmlmeShzaykpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudGVzdC52ZXJpZnkoU0suVmFsKVxuXHRcdFx0dGhpcy5yZXN1bHQudmVyaWZ5KHNrKVxuXHRcdH1cblx0fSxcblxuXHRDYXRjaChzaykge1xuXHRcdGNoZWNrKHRoaXMuY2F1Z2h0Lm9wVHlwZSA9PT0gbnVsbCwgdGhpcy5jYXVnaHQubG9jLCAnVE9ETzogQ2F1Z2h0IHR5cGVzJylcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5jYXVnaHQsICgpID0+IHRoaXMuYmxvY2sudmVyaWZ5KHNrKSlcblx0fSxcblxuXHRDbGFzcyhzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BTdXBlckNsYXNzLCBTSy5WYWwpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMua2luZHMpXG5cdFx0XHRfLnZlcmlmeShTSy5WYWwpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcERvKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLnN0YXRpY3MpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0aWYgKHRoaXMub3BDb25zdHJ1Y3RvciAhPT0gbnVsbClcblx0XHRcdHRoaXMub3BDb25zdHJ1Y3Rvci52ZXJpZnkodGhpcy5vcFN1cGVyQ2xhc3MgIT09IG51bGwpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMubWV0aG9kcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHQvLyBuYW1lIHNldCBieSBBc3NpZ25TaW5nbGVcblx0fSxcblxuXHRDbGFzc0tpbmREbygpIHtcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5kZWNsYXJlRm9jdXMsICgpID0+IHRoaXMuYmxvY2sudmVyaWZ5KFNLLkRvKSlcblx0fSxcblxuXHRDb25kKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy50ZXN0LnZlcmlmeShTSy5WYWwpXG5cdFx0dGhpcy5pZlRydWUudmVyaWZ5KFNLLlZhbClcblx0XHR0aGlzLmlmRmFsc2UudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRDb25kaXRpb25hbChzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0dGhpcy50ZXN0LnZlcmlmeShTSy5WYWwpXG5cdFx0d2l0aElpZmVJZlZhbChzaywgKCkgPT4ge1xuXHRcdFx0dGhpcy5yZXN1bHQudmVyaWZ5KHNrKVxuXHRcdH0pXG5cdH0sXG5cblx0Q29uc3RydWN0b3IoY2xhc3NIYXNTdXBlcikge1xuXHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZnVuLm9wRGVjbGFyZVRoaXMpXG5cdFx0d2l0aE1ldGhvZCh0aGlzLCAoKSA9PiB7IHRoaXMuZnVuLnZlcmlmeShTSy5WYWwpIH0pXG5cblx0XHRjb25zdCBzdXBlckNhbGwgPSByZXN1bHRzLmNvbnN0cnVjdG9yVG9TdXBlci5nZXQodGhpcylcblxuXHRcdGlmIChjbGFzc0hhc1N1cGVyKVxuXHRcdFx0Y2hlY2soc3VwZXJDYWxsICE9PSB1bmRlZmluZWQsIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0XHRgQ29uc3RydWN0b3IgbXVzdCBjb250YWluICR7c2hvd0tleXdvcmQoS2V5d29yZHMuU3VwZXIpfWApXG5cdFx0ZWxzZVxuXHRcdFx0Y2hlY2soc3VwZXJDYWxsID09PSB1bmRlZmluZWQsICgpID0+IHN1cGVyQ2FsbC5sb2MsICgpID0+XG5cdFx0XHRcdGBDbGFzcyBoYXMgbm8gc3VwZXJjbGFzcywgc28gJHtzaG93S2V5d29yZChLZXl3b3Jkcy5TdXBlcil9IGlzIG5vdCBhbGxvd2VkLmApXG5cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5tZW1iZXJBcmdzKVxuXHRcdFx0c2V0RGVjbGFyZUFjY2Vzc2VkKF8sIHRoaXMpXG5cdH0sXG5cblx0RXhjZXB0KHNrKSB7XG5cdFx0bWFya1N0YXRlbWVudCh0aGlzLCBzaylcblx0XHR0aGlzLnRyeS52ZXJpZnkoc2spXG5cdFx0dmVyaWZ5T3AodGhpcy5vcENhdGNoLCBzaylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wRmluYWxseSwgU0suRG8pXG5cdH0sXG5cblx0Rm9yQmFnKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuYnVpbHQsICgpID0+IHZlcmlmeUZvcih0aGlzKSlcblx0fSxcblxuXHRGb3Ioc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdHZlcmlmeUZvcih0aGlzKVxuXHR9LFxuXG5cdEZ1bihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdGNoZWNrKHRoaXMub3BSZXR1cm5UeXBlID09PSBudWxsIHx8ICF0aGlzLmlzRG8sIHRoaXMubG9jLFxuXHRcdFx0J0Z1bmN0aW9uIHdpdGggcmV0dXJuIHR5cGUgbXVzdCByZXR1cm4gc29tZXRoaW5nLicpXG5cdFx0d2l0aEJsb2NrTG9jYWxzKCgpID0+IHtcblx0XHRcdHdpdGhJbkZ1bktpbmQodGhpcy5raW5kLCAoKSA9PlxuXHRcdFx0XHR3aXRoTG9vcChudWxsLCAoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgYWxsQXJncyA9IGNhdCh0aGlzLm9wRGVjbGFyZVRoaXMsIHRoaXMuYXJncywgdGhpcy5vcFJlc3RBcmcpXG5cdFx0XHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FscyhhbGxBcmdzLCAoKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeSh0aGlzLmlzRG8gPyBTSy5EbyA6IFNLLlZhbClcblx0XHRcdFx0XHRcdHZlcmlmeU9wKHRoaXMub3BSZXR1cm5UeXBlLCBTSy5WYWwpXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fSkpXG5cdFx0fSlcblx0XHQvLyBuYW1lIHNldCBieSBBc3NpZ25TaW5nbGVcblx0fSxcblxuXHRGdW5BYnN0cmFjdCgpIHtcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hcmdzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BSZXN0QXJnKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BSZXR1cm5UeXBlLCBTSy5WYWwpXG5cdH0sXG5cblx0SWdub3JlKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5pZ25vcmVkTmFtZXMpXG5cdFx0XHRhY2Nlc3NMb2NhbCh0aGlzLCBfKVxuXHR9LFxuXG5cdEtpbmQoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5zdXBlcktpbmRzKVxuXHRcdFx0Xy52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BEbywgU0suRG8pXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuc3RhdGljcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5tZXRob2RzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdC8vIG5hbWUgc2V0IGJ5IEFzc2lnblNpbmdsZVxuXHR9LFxuXG5cdExhenkoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR3aXRoQmxvY2tMb2NhbHMoKCkgPT4gdGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKSlcblx0fSxcblxuXHRMb2NhbEFjY2Vzcyhzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdGNvbnN0IGRlY2xhcmUgPSBsb2NhbHMuZ2V0KHRoaXMubmFtZSlcblx0XHRpZiAoZGVjbGFyZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjb25zdCBidWlsdGluUGF0aCA9IG9wdGlvbnMuYnVpbHRpbk5hbWVUb1BhdGguZ2V0KHRoaXMubmFtZSlcblx0XHRcdGlmIChidWlsdGluUGF0aCA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRmYWlsTWlzc2luZ0xvY2FsKHRoaXMubG9jLCB0aGlzLm5hbWUpXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc3QgbmFtZXMgPSByZXN1bHRzLmJ1aWx0aW5QYXRoVG9OYW1lcy5nZXQoYnVpbHRpblBhdGgpXG5cdFx0XHRcdGlmIChuYW1lcyA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRcdHJlc3VsdHMuYnVpbHRpblBhdGhUb05hbWVzLnNldChidWlsdGluUGF0aCwgbmV3IFNldChbdGhpcy5uYW1lXSkpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRuYW1lcy5hZGQodGhpcy5uYW1lKVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHRzLmxvY2FsQWNjZXNzVG9EZWNsYXJlLnNldCh0aGlzLCBkZWNsYXJlKVxuXHRcdFx0c2V0RGVjbGFyZUFjY2Vzc2VkKGRlY2xhcmUsIHRoaXMpXG5cdFx0fVxuXHR9LFxuXG5cdC8vIEFkZGluZyBMb2NhbERlY2xhcmVzIHRvIHRoZSBhdmFpbGFibGUgbG9jYWxzIGlzIGRvbmUgYnkgRnVuIG9yIGxpbmVOZXdMb2NhbHMuXG5cdExvY2FsRGVjbGFyZSgpIHtcblx0XHRjb25zdCBidWlsdGluUGF0aCA9IG9wdGlvbnMuYnVpbHRpbk5hbWVUb1BhdGguZ2V0KHRoaXMubmFtZSlcblx0XHRpZiAoYnVpbHRpblBhdGggIT09IHVuZGVmaW5lZClcblx0XHRcdHdhcm4odGhpcy5sb2MsIGBMb2NhbCAke2NvZGUodGhpcy5uYW1lKX0gb3ZlcnJpZGVzIGJ1aWx0aW4gZnJvbSAke2NvZGUoYnVpbHRpblBhdGgpfS5gKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BUeXBlLCBTSy5WYWwpXG5cdH0sXG5cblx0TG9jYWxNdXRhdGUoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdGNvbnN0IGRlY2xhcmUgPSBnZXRMb2NhbERlY2xhcmUodGhpcy5uYW1lLCB0aGlzLmxvYylcblx0XHRjaGVjayhkZWNsYXJlLmlzTXV0YWJsZSgpLCB0aGlzLmxvYywgKCkgPT4gYCR7Y29kZSh0aGlzLm5hbWUpfSBpcyBub3QgbXV0YWJsZS5gKVxuXHRcdC8vIFRPRE86IFRyYWNrIG11dGF0aW9ucy4gTXV0YWJsZSBsb2NhbCBtdXN0IGJlIG11dGF0ZWQgc29tZXdoZXJlLlxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRMb2dpYyhzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdGNoZWNrKHRoaXMuYXJncy5sZW5ndGggPiAxLCAnTG9naWMgZXhwcmVzc2lvbiBuZWVkcyBhdCBsZWFzdCAyIGFyZ3VtZW50cy4nKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0XHRfLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0Tm90KHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy5hcmcudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHROdW1iZXJMaXRlcmFsKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdH0sXG5cblx0TWFwRW50cnkoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdFx0dGhpcy5rZXkudmVyaWZ5KFNLLlZhbClcblx0XHR0aGlzLnZhbC52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdE1lbWJlcihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHRoaXMub2JqZWN0LnZlcmlmeShTSy5WYWwpXG5cdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdH0sXG5cblx0TWVtYmVyRnVuKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dmVyaWZ5T3AodGhpcy5vcE9iamVjdCwgU0suVmFsKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdE1lbWJlclNldChzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0dGhpcy5vYmplY3QudmVyaWZ5KFNLLlZhbClcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVHlwZSwgU0suVmFsKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRNZXRob2Qoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRva1RvTm90VXNlLmFkZCh0aGlzLmZ1bi5vcERlY2xhcmVUaGlzKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmZ1bi5hcmdzKVxuXHRcdFx0b2tUb05vdFVzZS5hZGQoXylcblx0XHRvcEVhY2godGhpcy5mdW4ub3BSZXN0QXJnLCBfID0+IG9rVG9Ob3RVc2UuYWRkKF8pKVxuXHRcdHRoaXMuZnVuLnZlcmlmeShTSy5WYWwpXG5cdFx0Ly8gbmFtZSBzZXQgYnkgQXNzaWduU2luZ2xlXG5cdH0sXG5cblx0TWV0aG9kSW1wbCgpIHtcblx0XHR2ZXJpZnlNZXRob2RJbXBsKHRoaXMsICgpID0+IHtcblx0XHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZnVuLm9wRGVjbGFyZVRoaXMpXG5cdFx0XHR0aGlzLmZ1bi52ZXJpZnkoU0suVmFsKVxuXHRcdH0pXG5cdH0sXG5cdE1ldGhvZEdldHRlcigpIHtcblx0XHR2ZXJpZnlNZXRob2RJbXBsKHRoaXMsICgpID0+IHtcblx0XHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZGVjbGFyZVRoaXMpXG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKFt0aGlzLmRlY2xhcmVUaGlzXSwgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeShTSy5WYWwpXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH0sXG5cdE1ldGhvZFNldHRlcigpIHtcblx0XHR2ZXJpZnlNZXRob2RJbXBsKHRoaXMsICgpID0+IHtcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoW3RoaXMuZGVjbGFyZVRoaXMsIHRoaXMuZGVjbGFyZUZvY3VzXSwgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeShTSy5Ebylcblx0XHRcdH0pXG5cdFx0fSlcblx0fSxcblxuXHRNb2R1bGUoKSB7XG5cdFx0Ly8gTm8gbmVlZCB0byB2ZXJpZnkgdGhpcy5kb0ltcG9ydHMuXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuaW1wb3J0cylcblx0XHRcdF8udmVyaWZ5KClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wSW1wb3J0R2xvYmFsKVxuXG5cdFx0d2l0aE5hbWUob3B0aW9ucy5tb2R1bGVOYW1lKCksICgpID0+IHtcblx0XHRcdHZlcmlmeU1vZHVsZUxpbmVzKHRoaXMubGluZXMsIHRoaXMubG9jKVxuXHRcdH0pXG5cdH0sXG5cblx0TmV3KHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy50eXBlLnZlcmlmeShTSy5WYWwpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRPYmpFbnRyeUFzc2lnbihzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0aWYgKCFyZXN1bHRzLmlzT2JqRW50cnlFeHBvcnQodGhpcykpXG5cdFx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHRoaXMuYXNzaWduLnZlcmlmeShTSy5Ebylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hc3NpZ24uYWxsQXNzaWduZWVzKCkpXG5cdFx0XHRzZXREZWNsYXJlQWNjZXNzZWQoXywgdGhpcylcblx0fSxcblxuXHRPYmpFbnRyeVBsYWluKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRPYmpTaW1wbGUoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRjb25zdCBrZXlzID0gbmV3IFNldCgpXG5cdFx0Zm9yIChjb25zdCBwYWlyIG9mIHRoaXMucGFpcnMpIHtcblx0XHRcdGNvbnN0IHtrZXksIHZhbHVlfSA9IHBhaXJcblx0XHRcdGNoZWNrKCFrZXlzLmhhcyhrZXkpLCBwYWlyLmxvYywgKCkgPT4gYER1cGxpY2F0ZSBrZXkgJHtrZXl9YClcblx0XHRcdGtleXMuYWRkKGtleSlcblx0XHRcdHZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdFx0fVxuXHR9LFxuXG5cdEdldHRlckZ1bihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdFF1b3RlUGxhaW4oc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5wYXJ0cylcblx0XHRcdHZlcmlmeU5hbWUoXylcblx0fSxcblxuXHRRdW90ZVNpbXBsZShzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHR9LFxuXG5cdFF1b3RlVGFnZ2VkVGVtcGxhdGUoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR0aGlzLnRhZy52ZXJpZnkoU0suVmFsKVxuXHRcdHRoaXMucXVvdGUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRSYW5nZShzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHRoaXMuc3RhcnQudmVyaWZ5KFNLLlZhbClcblx0XHR2ZXJpZnlPcCh0aGlzLmVuZCwgU0suVmFsKVxuXHR9LFxuXG5cdFNldFN1Yihzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0dGhpcy5vYmplY3QudmVyaWZ5KFNLLlZhbClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5zdWJiZWRzKVxuXHRcdFx0Xy52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BUeXBlLCBTSy5WYWwpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdFNwZWNpYWxEbyhzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdH0sXG5cblx0U3BlY2lhbFZhbChzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHNldE5hbWUodGhpcylcblx0fSxcblxuXHRTcHJlYWQoKSB7XG5cdFx0dGhpcy5zcHJlYWRlZC52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdFN1cGVyQ2FsbChzaykge1xuXHRcdGNoZWNrKG1ldGhvZCAhPT0gbnVsbCwgdGhpcy5sb2MsICdNdXN0IGJlIGluIGEgbWV0aG9kLicpXG5cdFx0cmVzdWx0cy5zdXBlckNhbGxUb01ldGhvZC5zZXQodGhpcywgbWV0aG9kKVxuXG5cdFx0aWYgKG1ldGhvZCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB7XG5cdFx0XHRjaGVjayhzayA9PT0gU0suRG8sIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0XHRgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5TdXBlcil9IGluIGNvbnN0cnVjdG9yIG11c3QgYXBwZWFyIGFzIGEgc3RhdGVtZW50LidgKVxuXHRcdFx0cmVzdWx0cy5jb25zdHJ1Y3RvclRvU3VwZXIuc2V0KG1ldGhvZCwgdGhpcylcblx0XHR9XG5cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hcmdzKVxuXHRcdFx0Xy52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdFN1cGVyTWVtYmVyKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0Y2hlY2sobWV0aG9kICE9PSBudWxsLCB0aGlzLmxvYywgJ011c3QgYmUgaW4gbWV0aG9kLicpXG5cdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdH0sXG5cblx0U3dpdGNoKHNrKSB7XG5cdFx0bWFya1N0YXRlbWVudCh0aGlzLCBzaylcblx0XHR3aXRoSWlmZUlmVmFsKHNrLCAoKSA9PiB7XG5cdFx0XHR0aGlzLnN3aXRjaGVkLnZlcmlmeShTSy5WYWwpXG5cdFx0XHRmb3IgKGNvbnN0IHBhcnQgb2YgdGhpcy5wYXJ0cylcblx0XHRcdFx0cGFydC52ZXJpZnkoc2spXG5cdFx0XHR2ZXJpZnlPcCh0aGlzLm9wRWxzZSwgc2spXG5cdFx0fSlcblx0fSxcblxuXHRTd2l0Y2hQYXJ0KHNrKSB7XG5cdFx0bWFya1N0YXRlbWVudCh0aGlzLCBzaylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy52YWx1ZXMpXG5cdFx0XHRfLnZlcmlmeShTSy5WYWwpXG5cdFx0dGhpcy5yZXN1bHQudmVyaWZ5KHNrKVxuXHR9LFxuXG5cdFRocm93KCkge1xuXHRcdHZlcmlmeU9wKHRoaXMub3BUaHJvd24sIFNLLlZhbClcblx0fSxcblxuXHRJbXBvcnQ6IHZlcmlmeUltcG9ydCxcblx0SW1wb3J0R2xvYmFsOiB2ZXJpZnlJbXBvcnQsXG5cblx0V2l0aChzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKVxuXHRcdHdpdGhJaWZlSWZWYWwoc2ssICgpID0+IHtcblx0XHRcdGlmIChzayA9PT0gU0suVmFsICYmIHRoaXMuZGVjbGFyZS5uYW1lID09PSAnXycpXG5cdFx0XHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZGVjbGFyZSlcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmRlY2xhcmUsICgpID0+IHtcblx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoU0suRG8pXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH0sXG5cblx0WWllbGQoX3NrKSB7XG5cdFx0Y2hlY2soZnVuS2luZCAhPT0gRnVucy5QbGFpbiwgKCkgPT5cblx0XHRcdGBDYW5ub3QgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5ZaWVsZCl9IG91dHNpZGUgb2YgYXN5bmMvZ2VuZXJhdG9yLmApXG5cdFx0aWYgKGZ1bktpbmQgPT09IEZ1bnMuQXN5bmMpXG5cdFx0XHRjaGVjayh0aGlzLm9wWWllbGRlZCAhPT0gbnVsbCwgdGhpcy5sb2MsICdDYW5ub3QgYXdhaXQgbm90aGluZy4nKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BZaWVsZGVkLCBTSy5WYWwpXG5cdH0sXG5cblx0WWllbGRUbyhfc2spIHtcblx0XHRjaGVjayhmdW5LaW5kID09PSBGdW5zLkdlbmVyYXRvciwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRgQ2Fubm90ICR7c2hvd0tleXdvcmQoS2V5d29yZHMuWWllbGRUbyl9IG91dHNpZGUgb2YgZ2VuZXJhdG9yLmApXG5cdFx0dGhpcy55aWVsZGVkVG8udmVyaWZ5KFNLLlZhbClcblx0fVxufSlcblxuLy8gU2hhcmVkIGltcGxlbWVudGF0aW9uc1xuXG5mdW5jdGlvbiB2ZXJpZnlJbXBvcnQoKSB7XG5cdC8vIFNpbmNlIFVzZXMgYXJlIGFsd2F5cyBpbiB0aGUgb3V0ZXJtb3N0IHNjb3BlLCBkb24ndCBoYXZlIHRvIHdvcnJ5IGFib3V0IHNoYWRvd2luZy5cblx0Ly8gU28gd2UgbXV0YXRlIGBsb2NhbHNgIGRpcmVjdGx5LlxuXHRjb25zdCBhZGRVc2VMb2NhbCA9IF8gPT4ge1xuXHRcdGNvbnN0IHByZXYgPSBsb2NhbHMuZ2V0KF8ubmFtZSlcblx0XHRjaGVjayhwcmV2ID09PSB1bmRlZmluZWQsIF8ubG9jLCAoKSA9PlxuXHRcdFx0YCR7Y29kZShfLm5hbWUpfSBhbHJlYWR5IGltcG9ydGVkIGF0ICR7cHJldi5sb2N9YClcblx0XHR2ZXJpZnlMb2NhbERlY2xhcmUoXylcblx0XHRzZXRMb2NhbChfKVxuXHR9XG5cdGZvciAoY29uc3QgXyBvZiB0aGlzLmltcG9ydGVkKVxuXHRcdGFkZFVzZUxvY2FsKF8pXG5cdG9wRWFjaCh0aGlzLm9wSW1wb3J0RGVmYXVsdCwgYWRkVXNlTG9jYWwpXG59XG5cbi8vIEhlbHBlcnMgc3BlY2lmaWMgdG8gY2VydGFpbiBNc0FzdCB0eXBlc1xuXG5mdW5jdGlvbiB2ZXJpZnlGb3IoZm9yTG9vcCkge1xuXHRjb25zdCB2ZXJpZnlCbG9jayA9ICgpID0+IHdpdGhMb29wKGZvckxvb3AsICgpID0+IHtcblx0XHRmb3JMb29wLmJsb2NrLnZlcmlmeShTSy5Ebylcblx0fSlcblx0aWZFbHNlKGZvckxvb3Aub3BJdGVyYXRlZSxcblx0XHQoe2VsZW1lbnQsIGJhZ30pID0+IHtcblx0XHRcdGJhZy52ZXJpZnkoU0suVmFsKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKGVsZW1lbnQsIHZlcmlmeUJsb2NrKVxuXHRcdH0sXG5cdFx0dmVyaWZ5QmxvY2spXG59XG5cbmZ1bmN0aW9uIHZlcmlmeUluTG9vcChsb29wVXNlcikge1xuXHRjaGVjayhvcExvb3AgIT09IG51bGwsIGxvb3BVc2VyLmxvYywgJ05vdCBpbiBhIGxvb3AuJylcbn1cblxuZnVuY3Rpb24gdmVyaWZ5TWV0aG9kSW1wbChfLCBkb1ZlcmlmeSkge1xuXHR2ZXJpZnlOYW1lKF8uc3ltYm9sKVxuXHR3aXRoTWV0aG9kKF8sIGRvVmVyaWZ5KVxufVxuIl19
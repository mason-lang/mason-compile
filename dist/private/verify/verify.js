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

			if (classHasSuper) (0, _context.check)(superCall !== undefined, this.loc, () => `Constructor must contain ${ (0, _CompileError.code)('super!') }`);else (0, _context.check)(superCall === undefined, () => superCall.loc, () => `Class has no superclass, so ${ (0, _CompileError.code)('super!') } is not allowed.`);

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
				(0, _context.check)(sk === _SK2.default.Do, this.loc, () => `${ (0, _CompileError.code)('super') } in constructor must appear as a statement.'`);

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
			(0, _context.check)(_context2.funKind !== _MsAst.Funs.Plain, `Cannot ${ (0, _CompileError.code)('<~') } outside of async/generator.`);
			if (_context2.funKind === _MsAst.Funs.Async) (0, _context.check)(this.opYielded !== null, this.loc, 'Cannot await nothing.');
			(0, _util2.verifyOp)(this.opYielded, _SK2.default.Val);
		},

		YieldTo(_sk) {
			(0, _context.check)(_context2.funKind === _MsAst.Funs.Generator, this.loc, `Cannot ${ (0, _CompileError.code)('<~~') } outside of generator.`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQW9Cd0IsTUFBTTs7Ozs7Ozs7Ozs7O1VBQU4sTUFBTSIsImZpbGUiOiJ2ZXJpZnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2ssIG9wdGlvbnMsIHdhcm59IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtDbGFzcywgQ29uc3RydWN0b3IsIEZ1biwgRnVucywgS2luZCwgTWV0aG9kLCBQYXR0ZXJufSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7c2hvd0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7Y2F0LCBpZkVsc2UsIGltcGxlbWVudE1hbnksIG9wRWFjaH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7ZnVuS2luZCwgbG9jYWxzLCBtZXRob2QsIG9rVG9Ob3RVc2UsIG9wTG9vcCwgcmVzdWx0cywgc2V0dXAsIHRlYXJEb3duLCB3aXRoSWlmZSxcblx0d2l0aElpZmVJZlZhbCwgd2l0aEluRnVuS2luZCwgd2l0aE1ldGhvZCwgd2l0aExvb3AsIHdpdGhOYW1lfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge2FjY2Vzc0xvY2FsLCBnZXRMb2NhbERlY2xhcmUsIGZhaWxNaXNzaW5nTG9jYWwsIHNldERlY2xhcmVBY2Nlc3NlZCwgc2V0TG9jYWwsXG5cdHZlcmlmeUFuZFBsdXNMb2NhbCwgdmVyaWZ5QW5kUGx1c0xvY2FscywgdmVyaWZ5TG9jYWxEZWNsYXJlLCB3YXJuVW51c2VkTG9jYWxzLCB3aXRoQmxvY2tMb2NhbHNcblx0fSBmcm9tICcuL2xvY2FscydcbmltcG9ydCBTSyx7Y2hlY2tEbywgY2hlY2tWYWwsIG1hcmtTdGF0ZW1lbnR9IGZyb20gJy4vU0snXG5pbXBvcnQge3NldE5hbWUsIHZlcmlmeU5hbWUsIHZlcmlmeU9wfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgdmVyaWZ5QmxvY2ssIHt2ZXJpZnlNb2R1bGVMaW5lc30gZnJvbSAnLi92ZXJpZnlCbG9jaydcblxuLyoqXG5HZW5lcmF0ZXMgaW5mb3JtYXRpb24gbmVlZGVkIGR1cmluZyB0cmFuc3BpbGluZywgdGhlIFZlcmlmeVJlc3VsdHMuXG5BbHNvIGNoZWNrcyBmb3IgZXhpc3RlbmNlIG9mIGxvY2FsIHZhcmlhYmxlcyBhbmQgd2FybnMgZm9yIHVudXNlZCBsb2NhbHMuXG5AcGFyYW0ge01zQXN0fSBtc0FzdFxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHZlcmlmeShtc0FzdCkge1xuXHRzZXR1cCgpXG5cdG1zQXN0LnZlcmlmeSgpXG5cdHdhcm5VbnVzZWRMb2NhbHMoKVxuXHRjb25zdCByZXMgPSByZXN1bHRzXG5cdHRlYXJEb3duKClcblx0cmV0dXJuIHJlc1xufVxuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICd2ZXJpZnknLCB7XG5cdEFzc2VydChzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0dGhpcy5jb25kaXRpb24udmVyaWZ5KFNLLlZhbClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVGhyb3duLCBTSy5WYWwpXG5cdH0sXG5cblx0QXNzaWduU2luZ2xlKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHR3aXRoTmFtZSh0aGlzLmFzc2lnbmVlLm5hbWUsICgpID0+IHtcblx0XHRcdGNvbnN0IGRvViA9ICgpID0+IHtcblx0XHRcdFx0Lypcblx0XHRcdFx0RnVuIGFuZCBDbGFzcyBvbmx5IGdldCBuYW1lIGlmIHRoZXkgYXJlIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBhc3NpZ25tZW50LlxuXHRcdFx0XHRzbyBpbiBgeCA9ICRhZnRlci10aW1lIDEwMDAgfGAgdGhlIGZ1bmN0aW9uIGlzIG5vdCBuYW1lZC5cblx0XHRcdFx0Ki9cblx0XHRcdFx0aWYgKHRoaXMudmFsdWUgaW5zdGFuY2VvZiBDbGFzcyB8fFxuXHRcdFx0XHRcdHRoaXMudmFsdWUgaW5zdGFuY2VvZiBGdW4gfHxcblx0XHRcdFx0XHR0aGlzLnZhbHVlIGluc3RhbmNlb2YgTWV0aG9kIHx8XG5cdFx0XHRcdFx0dGhpcy52YWx1ZSBpbnN0YW5jZW9mIEtpbmQpXG5cdFx0XHRcdFx0c2V0TmFtZSh0aGlzLnZhbHVlKVxuXG5cdFx0XHRcdC8vIEFzc2lnbmVlIHJlZ2lzdGVyZWQgYnkgdmVyaWZ5TGluZXMuXG5cdFx0XHRcdHRoaXMuYXNzaWduZWUudmVyaWZ5KClcblx0XHRcdFx0dGhpcy52YWx1ZS52ZXJpZnkoU0suVmFsKVxuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMuYXNzaWduZWUuaXNMYXp5KCkpXG5cdFx0XHRcdHdpdGhCbG9ja0xvY2Fscyhkb1YpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGRvVigpXG5cdFx0fSlcblx0fSxcblxuXHRBc3NpZ25EZXN0cnVjdHVyZShzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0Ly8gQXNzaWduZWVzIHJlZ2lzdGVyZWQgYnkgdmVyaWZ5TGluZXMuXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXNzaWduZWVzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRCYWdFbnRyeShzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0QmFnU2ltcGxlKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMucGFydHMpXG5cdFx0XHRfLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0QmxvY2s6IHZlcmlmeUJsb2NrLFxuXG5cdEJsb2NrV3JhcChzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHdpdGhJaWZlKCgpID0+IHRoaXMuYmxvY2sudmVyaWZ5KHNrKSlcblx0fSxcblxuXHRCcmVhayhzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0dmVyaWZ5SW5Mb29wKHRoaXMpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFZhbHVlLCBTSy5WYWwpXG5cdFx0Y2hlY2socmVzdWx0cy5pc1N0YXRlbWVudChvcExvb3ApID09PSAodGhpcy5vcFZhbHVlID09PSBudWxsKSwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHR0aGlzLm9wVmFsdWUgPT09IG51bGwgP1xuXHRcdFx0XHRgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5Gb3IpfSBpbiBleHByZXNzaW9uIHBvc2l0aW9uIG11c3QgYnJlYWsgd2l0aCBhIHZhbHVlLmAgOlxuXHRcdFx0XHRgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5CcmVhayl9IHdpdGggdmFsdWUgaXMgb25seSB2YWxpZCBpbiBgICtcblx0XHRcdFx0YCR7c2hvd0tleXdvcmQoS2V5d29yZHMuRm9yKX0gaW4gZXhwcmVzc2lvbiBwb3NpdGlvbi5gKVxuXHR9LFxuXG5cdENhbGwoX3NrKSB7XG5cdFx0dGhpcy5jYWxsZWQudmVyaWZ5KFNLLlZhbClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hcmdzKVxuXHRcdFx0Xy52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdENhc2Uoc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdHdpdGhJaWZlSWZWYWwoc2ssICgpID0+IHtcblx0XHRcdGNvbnN0IGRvSXQgPSAoKSA9PiB7XG5cdFx0XHRcdGZvciAoY29uc3QgcGFydCBvZiB0aGlzLnBhcnRzKVxuXHRcdFx0XHRcdHBhcnQudmVyaWZ5KHNrKVxuXHRcdFx0XHR2ZXJpZnlPcCh0aGlzLm9wRWxzZSwgc2spXG5cdFx0XHR9XG5cdFx0XHRpZkVsc2UodGhpcy5vcENhc2VkLFxuXHRcdFx0XHRfID0+IHtcblx0XHRcdFx0XHRfLnZlcmlmeShTSy5Ebylcblx0XHRcdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwoXy5hc3NpZ25lZSwgZG9JdClcblx0XHRcdFx0fSxcblx0XHRcdFx0ZG9JdClcblx0XHR9KVxuXHR9LFxuXG5cdENhc2VQYXJ0KHNrKSB7XG5cdFx0aWYgKHRoaXMudGVzdCBpbnN0YW5jZW9mIFBhdHRlcm4pIHtcblx0XHRcdHRoaXMudGVzdC50eXBlLnZlcmlmeShTSy5WYWwpXG5cdFx0XHR0aGlzLnRlc3QucGF0dGVybmVkLnZlcmlmeShTSy5WYWwpXG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKHRoaXMudGVzdC5sb2NhbHMsICgpID0+IHRoaXMucmVzdWx0LnZlcmlmeShzaykpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudGVzdC52ZXJpZnkoU0suVmFsKVxuXHRcdFx0dGhpcy5yZXN1bHQudmVyaWZ5KHNrKVxuXHRcdH1cblx0fSxcblxuXHRDYXRjaChzaykge1xuXHRcdGNoZWNrKHRoaXMuY2F1Z2h0Lm9wVHlwZSA9PT0gbnVsbCwgdGhpcy5jYXVnaHQubG9jLCAnVE9ETzogQ2F1Z2h0IHR5cGVzJylcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5jYXVnaHQsICgpID0+IHRoaXMuYmxvY2sudmVyaWZ5KHNrKSlcblx0fSxcblxuXHRDbGFzcyhzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BTdXBlckNsYXNzLCBTSy5WYWwpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMua2luZHMpXG5cdFx0XHRfLnZlcmlmeShTSy5WYWwpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcERvKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLnN0YXRpY3MpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0aWYgKHRoaXMub3BDb25zdHJ1Y3RvciAhPT0gbnVsbClcblx0XHRcdHRoaXMub3BDb25zdHJ1Y3Rvci52ZXJpZnkodGhpcy5vcFN1cGVyQ2xhc3MgIT09IG51bGwpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMubWV0aG9kcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHQvLyBuYW1lIHNldCBieSBBc3NpZ25TaW5nbGVcblx0fSxcblxuXHRDbGFzc0tpbmREbygpIHtcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5kZWNsYXJlRm9jdXMsICgpID0+IHRoaXMuYmxvY2sudmVyaWZ5KFNLLkRvKSlcblx0fSxcblxuXHRDb25kKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy50ZXN0LnZlcmlmeShTSy5WYWwpXG5cdFx0dGhpcy5pZlRydWUudmVyaWZ5KFNLLlZhbClcblx0XHR0aGlzLmlmRmFsc2UudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRDb25kaXRpb25hbChzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0dGhpcy50ZXN0LnZlcmlmeShTSy5WYWwpXG5cdFx0d2l0aElpZmVJZlZhbChzaywgKCkgPT4ge1xuXHRcdFx0dGhpcy5yZXN1bHQudmVyaWZ5KHNrKVxuXHRcdH0pXG5cdH0sXG5cblx0Q29uc3RydWN0b3IoY2xhc3NIYXNTdXBlcikge1xuXHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZnVuLm9wRGVjbGFyZVRoaXMpXG5cdFx0d2l0aE1ldGhvZCh0aGlzLCAoKSA9PiB7IHRoaXMuZnVuLnZlcmlmeShTSy5WYWwpIH0pXG5cblx0XHRjb25zdCBzdXBlckNhbGwgPSByZXN1bHRzLmNvbnN0cnVjdG9yVG9TdXBlci5nZXQodGhpcylcblxuXHRcdGlmIChjbGFzc0hhc1N1cGVyKVxuXHRcdFx0Y2hlY2soc3VwZXJDYWxsICE9PSB1bmRlZmluZWQsIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0XHRgQ29uc3RydWN0b3IgbXVzdCBjb250YWluICR7Y29kZSgnc3VwZXIhJyl9YClcblx0XHRlbHNlXG5cdFx0XHRjaGVjayhzdXBlckNhbGwgPT09IHVuZGVmaW5lZCwgKCkgPT4gc3VwZXJDYWxsLmxvYywgKCkgPT5cblx0XHRcdFx0YENsYXNzIGhhcyBubyBzdXBlcmNsYXNzLCBzbyAke2NvZGUoJ3N1cGVyIScpfSBpcyBub3QgYWxsb3dlZC5gKVxuXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMubWVtYmVyQXJncylcblx0XHRcdHNldERlY2xhcmVBY2Nlc3NlZChfLCB0aGlzKVxuXHR9LFxuXG5cdEV4Y2VwdChzaykge1xuXHRcdG1hcmtTdGF0ZW1lbnQodGhpcywgc2spXG5cdFx0dGhpcy50cnkudmVyaWZ5KHNrKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BDYXRjaCwgc2spXG5cdFx0dmVyaWZ5T3AodGhpcy5vcEZpbmFsbHksIFNLLkRvKVxuXHR9LFxuXG5cdEZvckJhZyhzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmJ1aWx0LCAoKSA9PiB2ZXJpZnlGb3IodGhpcykpXG5cdH0sXG5cblx0Rm9yKHNrKSB7XG5cdFx0bWFya1N0YXRlbWVudCh0aGlzLCBzaylcblx0XHR2ZXJpZnlGb3IodGhpcylcblx0fSxcblxuXHRGdW4oc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRjaGVjayh0aGlzLm9wUmV0dXJuVHlwZSA9PT0gbnVsbCB8fCAhdGhpcy5pc0RvLCB0aGlzLmxvYyxcblx0XHRcdCdGdW5jdGlvbiB3aXRoIHJldHVybiB0eXBlIG11c3QgcmV0dXJuIHNvbWV0aGluZy4nKVxuXHRcdHdpdGhCbG9ja0xvY2FscygoKSA9PiB7XG5cdFx0XHR3aXRoSW5GdW5LaW5kKHRoaXMua2luZCwgKCkgPT5cblx0XHRcdFx0d2l0aExvb3AobnVsbCwgKCkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGFsbEFyZ3MgPSBjYXQodGhpcy5vcERlY2xhcmVUaGlzLCB0aGlzLmFyZ3MsIHRoaXMub3BSZXN0QXJnKVxuXHRcdFx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoYWxsQXJncywgKCkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkodGhpcy5pc0RvID8gU0suRG8gOiBTSy5WYWwpXG5cdFx0XHRcdFx0XHR2ZXJpZnlPcCh0aGlzLm9wUmV0dXJuVHlwZSwgU0suVmFsKVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH0pKVxuXHRcdH0pXG5cdFx0Ly8gbmFtZSBzZXQgYnkgQXNzaWduU2luZ2xlXG5cdH0sXG5cblx0RnVuQWJzdHJhY3QoKSB7XG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wUmVzdEFyZylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wUmV0dXJuVHlwZSwgU0suVmFsKVxuXHR9LFxuXG5cdElnbm9yZShzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuaWdub3JlZE5hbWVzKVxuXHRcdFx0YWNjZXNzTG9jYWwodGhpcywgXylcblx0fSxcblxuXHRLaW5kKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuc3VwZXJLaW5kcylcblx0XHRcdF8udmVyaWZ5KFNLLlZhbClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wRG8sIFNLLkRvKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLnN0YXRpY3MpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMubWV0aG9kcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHQvLyBuYW1lIHNldCBieSBBc3NpZ25TaW5nbGVcblx0fSxcblxuXHRMYXp5KHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0d2l0aEJsb2NrTG9jYWxzKCgpID0+IHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbCkpXG5cdH0sXG5cblx0TG9jYWxBY2Nlc3Moc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRjb25zdCBkZWNsYXJlID0gbG9jYWxzLmdldCh0aGlzLm5hbWUpXG5cdFx0aWYgKGRlY2xhcmUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3QgYnVpbHRpblBhdGggPSBvcHRpb25zLmJ1aWx0aW5OYW1lVG9QYXRoLmdldCh0aGlzLm5hbWUpXG5cdFx0XHRpZiAoYnVpbHRpblBhdGggPT09IHVuZGVmaW5lZClcblx0XHRcdFx0ZmFpbE1pc3NpbmdMb2NhbCh0aGlzLmxvYywgdGhpcy5uYW1lKVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGNvbnN0IG5hbWVzID0gcmVzdWx0cy5idWlsdGluUGF0aFRvTmFtZXMuZ2V0KGJ1aWx0aW5QYXRoKVxuXHRcdFx0XHRpZiAobmFtZXMgPT09IHVuZGVmaW5lZClcblx0XHRcdFx0XHRyZXN1bHRzLmJ1aWx0aW5QYXRoVG9OYW1lcy5zZXQoYnVpbHRpblBhdGgsIG5ldyBTZXQoW3RoaXMubmFtZV0pKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0bmFtZXMuYWRkKHRoaXMubmFtZSlcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzdWx0cy5sb2NhbEFjY2Vzc1RvRGVjbGFyZS5zZXQodGhpcywgZGVjbGFyZSlcblx0XHRcdHNldERlY2xhcmVBY2Nlc3NlZChkZWNsYXJlLCB0aGlzKVxuXHRcdH1cblx0fSxcblxuXHQvLyBBZGRpbmcgTG9jYWxEZWNsYXJlcyB0byB0aGUgYXZhaWxhYmxlIGxvY2FscyBpcyBkb25lIGJ5IEZ1biBvciBsaW5lTmV3TG9jYWxzLlxuXHRMb2NhbERlY2xhcmUoKSB7XG5cdFx0Y29uc3QgYnVpbHRpblBhdGggPSBvcHRpb25zLmJ1aWx0aW5OYW1lVG9QYXRoLmdldCh0aGlzLm5hbWUpXG5cdFx0aWYgKGJ1aWx0aW5QYXRoICE9PSB1bmRlZmluZWQpXG5cdFx0XHR3YXJuKHRoaXMubG9jLCBgTG9jYWwgJHtjb2RlKHRoaXMubmFtZSl9IG92ZXJyaWRlcyBidWlsdGluIGZyb20gJHtjb2RlKGJ1aWx0aW5QYXRoKX0uYClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVHlwZSwgU0suVmFsKVxuXHR9LFxuXG5cdExvY2FsTXV0YXRlKHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHRjb25zdCBkZWNsYXJlID0gZ2V0TG9jYWxEZWNsYXJlKHRoaXMubmFtZSwgdGhpcy5sb2MpXG5cdFx0Y2hlY2soZGVjbGFyZS5pc011dGFibGUoKSwgdGhpcy5sb2MsICgpID0+IGAke2NvZGUodGhpcy5uYW1lKX0gaXMgbm90IG11dGFibGUuYClcblx0XHQvLyBUT0RPOiBUcmFjayBtdXRhdGlvbnMuIE11dGFibGUgbG9jYWwgbXVzdCBiZSBtdXRhdGVkIHNvbWV3aGVyZS5cblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0TG9naWMoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRjaGVjayh0aGlzLmFyZ3MubGVuZ3RoID4gMSwgJ0xvZ2ljIGV4cHJlc3Npb24gbmVlZHMgYXQgbGVhc3QgMiBhcmd1bWVudHMuJylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hcmdzKVxuXHRcdFx0Xy52ZXJpZnkoU0suVmFsKVxuXHR9LFxuXG5cdE5vdChzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHRoaXMuYXJnLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0TnVtYmVyTGl0ZXJhbChzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHR9LFxuXG5cdE1hcEVudHJ5KHNrKSB7XG5cdFx0Y2hlY2tEbyh0aGlzLCBzaylcblx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHRoaXMua2V5LnZlcmlmeShTSy5WYWwpXG5cdFx0dGhpcy52YWwudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRNZW1iZXIoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR0aGlzLm9iamVjdC52ZXJpZnkoU0suVmFsKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdE1lbWJlckZ1bihzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BPYmplY3QsIFNLLlZhbClcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0fSxcblxuXHRNZW1iZXJTZXQoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdHRoaXMub2JqZWN0LnZlcmlmeShTSy5WYWwpXG5cdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFR5cGUsIFNLLlZhbClcblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0TWV0aG9kKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0b2tUb05vdFVzZS5hZGQodGhpcy5mdW4ub3BEZWNsYXJlVGhpcylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5mdW4uYXJncylcblx0XHRcdG9rVG9Ob3RVc2UuYWRkKF8pXG5cdFx0b3BFYWNoKHRoaXMuZnVuLm9wUmVzdEFyZywgXyA9PiBva1RvTm90VXNlLmFkZChfKSlcblx0XHR0aGlzLmZ1bi52ZXJpZnkoU0suVmFsKVxuXHRcdC8vIG5hbWUgc2V0IGJ5IEFzc2lnblNpbmdsZVxuXHR9LFxuXG5cdE1ldGhvZEltcGwoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kSW1wbCh0aGlzLCAoKSA9PiB7XG5cdFx0XHRva1RvTm90VXNlLmFkZCh0aGlzLmZ1bi5vcERlY2xhcmVUaGlzKVxuXHRcdFx0dGhpcy5mdW4udmVyaWZ5KFNLLlZhbClcblx0XHR9KVxuXHR9LFxuXHRNZXRob2RHZXR0ZXIoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kSW1wbCh0aGlzLCAoKSA9PiB7XG5cdFx0XHRva1RvTm90VXNlLmFkZCh0aGlzLmRlY2xhcmVUaGlzKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FscyhbdGhpcy5kZWNsYXJlVGhpc10sICgpID0+IHtcblx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoU0suVmFsKVxuXHRcdFx0fSlcblx0XHR9KVxuXHR9LFxuXHRNZXRob2RTZXR0ZXIoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kSW1wbCh0aGlzLCAoKSA9PiB7XG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKFt0aGlzLmRlY2xhcmVUaGlzLCB0aGlzLmRlY2xhcmVGb2N1c10sICgpID0+IHtcblx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoU0suRG8pXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH0sXG5cblx0TW9kdWxlKCkge1xuXHRcdC8vIE5vIG5lZWQgdG8gdmVyaWZ5IHRoaXMuZG9JbXBvcnRzLlxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmltcG9ydHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcEltcG9ydEdsb2JhbClcblxuXHRcdHdpdGhOYW1lKG9wdGlvbnMubW9kdWxlTmFtZSgpLCAoKSA9PiB7XG5cdFx0XHR2ZXJpZnlNb2R1bGVMaW5lcyh0aGlzLmxpbmVzLCB0aGlzLmxvYylcblx0XHR9KVxuXHR9LFxuXG5cdE5ldyhzaykge1xuXHRcdGNoZWNrVmFsKHRoaXMsIHNrKVxuXHRcdHRoaXMudHlwZS52ZXJpZnkoU0suVmFsKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0XHRfLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0T2JqRW50cnlBc3NpZ24oc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdGlmICghcmVzdWx0cy5pc09iakVudHJ5RXhwb3J0KHRoaXMpKVxuXHRcdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR0aGlzLmFzc2lnbi52ZXJpZnkoU0suRG8pXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXNzaWduLmFsbEFzc2lnbmVlcygpKVxuXHRcdFx0c2V0RGVjbGFyZUFjY2Vzc2VkKF8sIHRoaXMpXG5cdH0sXG5cblx0T2JqRW50cnlQbGFpbihzaykge1xuXHRcdGNoZWNrRG8odGhpcywgc2spXG5cdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0T2JqU2ltcGxlKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0Y29uc3Qga2V5cyA9IG5ldyBTZXQoKVxuXHRcdGZvciAoY29uc3QgcGFpciBvZiB0aGlzLnBhaXJzKSB7XG5cdFx0XHRjb25zdCB7a2V5LCB2YWx1ZX0gPSBwYWlyXG5cdFx0XHRjaGVjaygha2V5cy5oYXMoa2V5KSwgcGFpci5sb2MsICgpID0+IGBEdXBsaWNhdGUga2V5ICR7a2V5fWApXG5cdFx0XHRrZXlzLmFkZChrZXkpXG5cdFx0XHR2YWx1ZS52ZXJpZnkoU0suVmFsKVxuXHRcdH1cblx0fSxcblxuXHRHZXR0ZXJGdW4oc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0fSxcblxuXHRRdW90ZVBsYWluKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMucGFydHMpXG5cdFx0XHR2ZXJpZnlOYW1lKF8pXG5cdH0sXG5cblx0UXVvdGVTaW1wbGUoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0fSxcblxuXHRRdW90ZVRhZ2dlZFRlbXBsYXRlKHNrKSB7XG5cdFx0Y2hlY2tWYWwodGhpcywgc2spXG5cdFx0dGhpcy50YWcudmVyaWZ5KFNLLlZhbClcblx0XHR0aGlzLnF1b3RlLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0UmFuZ2Uoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHR0aGlzLnN0YXJ0LnZlcmlmeShTSy5WYWwpXG5cdFx0dmVyaWZ5T3AodGhpcy5lbmQsIFNLLlZhbClcblx0fSxcblxuXHRTZXRTdWIoc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHRcdHRoaXMub2JqZWN0LnZlcmlmeShTSy5WYWwpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuc3ViYmVkcylcblx0XHRcdF8udmVyaWZ5KFNLLlZhbClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVHlwZSwgU0suVmFsKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRTcGVjaWFsRG8oc2spIHtcblx0XHRjaGVja0RvKHRoaXMsIHNrKVxuXHR9LFxuXG5cdFNwZWNpYWxWYWwoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRzZXROYW1lKHRoaXMpXG5cdH0sXG5cblx0U3ByZWFkKCkge1xuXHRcdHRoaXMuc3ByZWFkZWQudmVyaWZ5KFNLLlZhbClcblx0fSxcblxuXHRTdXBlckNhbGwoc2spIHtcblx0XHRjaGVjayhtZXRob2QgIT09IG51bGwsIHRoaXMubG9jLCAnTXVzdCBiZSBpbiBhIG1ldGhvZC4nKVxuXHRcdHJlc3VsdHMuc3VwZXJDYWxsVG9NZXRob2Quc2V0KHRoaXMsIG1ldGhvZClcblxuXHRcdGlmIChtZXRob2QgaW5zdGFuY2VvZiBDb25zdHJ1Y3Rvcikge1xuXHRcdFx0Y2hlY2soc2sgPT09IFNLLkRvLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdFx0YCR7Y29kZSgnc3VwZXInKX0gaW4gY29uc3RydWN0b3IgbXVzdCBhcHBlYXIgYXMgYSBzdGF0ZW1lbnQuJ2ApXG5cdFx0XHRyZXN1bHRzLmNvbnN0cnVjdG9yVG9TdXBlci5zZXQobWV0aG9kLCB0aGlzKVxuXHRcdH1cblxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0XHRfLnZlcmlmeShTSy5WYWwpXG5cdH0sXG5cblx0U3VwZXJNZW1iZXIoc2spIHtcblx0XHRjaGVja1ZhbCh0aGlzLCBzaylcblx0XHRjaGVjayhtZXRob2QgIT09IG51bGwsIHRoaXMubG9jLCAnTXVzdCBiZSBpbiBtZXRob2QuJylcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0fSxcblxuXHRTd2l0Y2goc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdHdpdGhJaWZlSWZWYWwoc2ssICgpID0+IHtcblx0XHRcdHRoaXMuc3dpdGNoZWQudmVyaWZ5KFNLLlZhbClcblx0XHRcdGZvciAoY29uc3QgcGFydCBvZiB0aGlzLnBhcnRzKVxuXHRcdFx0XHRwYXJ0LnZlcmlmeShzaylcblx0XHRcdHZlcmlmeU9wKHRoaXMub3BFbHNlLCBzaylcblx0XHR9KVxuXHR9LFxuXG5cdFN3aXRjaFBhcnQoc2spIHtcblx0XHRtYXJrU3RhdGVtZW50KHRoaXMsIHNrKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLnZhbHVlcylcblx0XHRcdF8udmVyaWZ5KFNLLlZhbClcblx0XHR0aGlzLnJlc3VsdC52ZXJpZnkoc2spXG5cdH0sXG5cblx0VGhyb3coKSB7XG5cdFx0dmVyaWZ5T3AodGhpcy5vcFRocm93biwgU0suVmFsKVxuXHR9LFxuXG5cdEltcG9ydDogdmVyaWZ5SW1wb3J0LFxuXHRJbXBvcnRHbG9iYWw6IHZlcmlmeUltcG9ydCxcblxuXHRXaXRoKHNrKSB7XG5cdFx0bWFya1N0YXRlbWVudCh0aGlzLCBzaylcblx0XHR0aGlzLnZhbHVlLnZlcmlmeShTSy5WYWwpXG5cdFx0d2l0aElpZmVJZlZhbChzaywgKCkgPT4ge1xuXHRcdFx0aWYgKHNrID09PSBTSy5WYWwgJiYgdGhpcy5kZWNsYXJlLm5hbWUgPT09ICdfJylcblx0XHRcdFx0b2tUb05vdFVzZS5hZGQodGhpcy5kZWNsYXJlKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuZGVjbGFyZSwgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeShTSy5Ebylcblx0XHRcdH0pXG5cdFx0fSlcblx0fSxcblxuXHRZaWVsZChfc2spIHtcblx0XHRjaGVjayhmdW5LaW5kICE9PSBGdW5zLlBsYWluLCBgQ2Fubm90ICR7Y29kZSgnPH4nKX0gb3V0c2lkZSBvZiBhc3luYy9nZW5lcmF0b3IuYClcblx0XHRpZiAoZnVuS2luZCA9PT0gRnVucy5Bc3luYylcblx0XHRcdGNoZWNrKHRoaXMub3BZaWVsZGVkICE9PSBudWxsLCB0aGlzLmxvYywgJ0Nhbm5vdCBhd2FpdCBub3RoaW5nLicpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFlpZWxkZWQsIFNLLlZhbClcblx0fSxcblxuXHRZaWVsZFRvKF9zaykge1xuXHRcdGNoZWNrKGZ1bktpbmQgPT09IEZ1bnMuR2VuZXJhdG9yLCB0aGlzLmxvYywgYENhbm5vdCAke2NvZGUoJzx+ficpfSBvdXRzaWRlIG9mIGdlbmVyYXRvci5gKVxuXHRcdHRoaXMueWllbGRlZFRvLnZlcmlmeShTSy5WYWwpXG5cdH1cbn0pXG5cbi8vIFNoYXJlZCBpbXBsZW1lbnRhdGlvbnNcblxuZnVuY3Rpb24gdmVyaWZ5SW1wb3J0KCkge1xuXHQvLyBTaW5jZSBVc2VzIGFyZSBhbHdheXMgaW4gdGhlIG91dGVybW9zdCBzY29wZSwgZG9uJ3QgaGF2ZSB0byB3b3JyeSBhYm91dCBzaGFkb3dpbmcuXG5cdC8vIFNvIHdlIG11dGF0ZSBgbG9jYWxzYCBkaXJlY3RseS5cblx0Y29uc3QgYWRkVXNlTG9jYWwgPSBfID0+IHtcblx0XHRjb25zdCBwcmV2ID0gbG9jYWxzLmdldChfLm5hbWUpXG5cdFx0Y2hlY2socHJldiA9PT0gdW5kZWZpbmVkLCBfLmxvYywgKCkgPT5cblx0XHRcdGAke2NvZGUoXy5uYW1lKX0gYWxyZWFkeSBpbXBvcnRlZCBhdCAke3ByZXYubG9jfWApXG5cdFx0dmVyaWZ5TG9jYWxEZWNsYXJlKF8pXG5cdFx0c2V0TG9jYWwoXylcblx0fVxuXHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5pbXBvcnRlZClcblx0XHRhZGRVc2VMb2NhbChfKVxuXHRvcEVhY2godGhpcy5vcEltcG9ydERlZmF1bHQsIGFkZFVzZUxvY2FsKVxufVxuXG4vLyBIZWxwZXJzIHNwZWNpZmljIHRvIGNlcnRhaW4gTXNBc3QgdHlwZXNcblxuZnVuY3Rpb24gdmVyaWZ5Rm9yKGZvckxvb3ApIHtcblx0Y29uc3QgdmVyaWZ5QmxvY2sgPSAoKSA9PiB3aXRoTG9vcChmb3JMb29wLCAoKSA9PiB7XG5cdFx0Zm9yTG9vcC5ibG9jay52ZXJpZnkoU0suRG8pXG5cdH0pXG5cdGlmRWxzZShmb3JMb29wLm9wSXRlcmF0ZWUsXG5cdFx0KHtlbGVtZW50LCBiYWd9KSA9PiB7XG5cdFx0XHRiYWcudmVyaWZ5KFNLLlZhbClcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbChlbGVtZW50LCB2ZXJpZnlCbG9jaylcblx0XHR9LFxuXHRcdHZlcmlmeUJsb2NrKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlJbkxvb3AobG9vcFVzZXIpIHtcblx0Y2hlY2sob3BMb29wICE9PSBudWxsLCBsb29wVXNlci5sb2MsICdOb3QgaW4gYSBsb29wLicpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeU1ldGhvZEltcGwoXywgZG9WZXJpZnkpIHtcblx0dmVyaWZ5TmFtZShfLnN5bWJvbClcblx0d2l0aE1ldGhvZChfLCBkb1ZlcmlmeSlcbn1cbiJdfQ==
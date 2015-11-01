'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../../CompileError', '../context', '../MsAst', '../util', './context', './locals', './util', './verifyLines'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../../CompileError'), require('../context'), require('../MsAst'), require('../util'), require('./context'), require('./locals'), require('./util'), require('./verifyLines'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.MsAst, global.util, global.context, global.locals, global.util, global.verifyLines);
		global.verify = mod.exports;
	}
})(this, function (exports, _CompileError, _context, _MsAst, _util, _context2, _locals, _util2, _verifyLines) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = verify;

	var MsAstTypes = _interopRequireWildcard(_MsAst);

	var _verifyLines2 = _interopRequireDefault(_verifyLines);

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
		Assert() {
			this.condition.verify();
			(0, _util2.verifyOp)(this.opThrown);
		},

		AssignSingle() {
			(0, _context2.withName)(this.assignee.name, () => {
				const doV = () => {
					if (this.value instanceof _MsAst.Class || this.value instanceof _MsAst.Fun || this.value instanceof _MsAst.Kind) (0, _util2.setName)(this.value);
					this.assignee.verify();
					this.value.verify();
				};

				if (this.assignee.isLazy()) (0, _locals.withBlockLocals)(doV);else doV();
			});
		},

		AssignDestructure() {
			for (const _ of this.assignees) _.verify();

			this.value.verify();
		},

		BagEntry: verifyBagEntry,
		BagEntryMany: verifyBagEntry,

		BagSimple() {
			for (const _ of this.parts) _.verify();
		},

		BlockDo() {
			(0, _verifyLines2.default)(this.lines);
		},

		BlockValThrow() {
			const newLocals = (0, _verifyLines2.default)(this.lines);
			(0, _locals.plusLocals)(newLocals, () => this.throw.verify());
		},

		BlockValReturn() {
			const newLocals = (0, _verifyLines2.default)(this.lines);
			(0, _locals.plusLocals)(newLocals, () => this.returned.verify());
		},

		BlockObj: verifyBlockBuild,
		BlockBag: verifyBlockBuild,
		BlockMap: verifyBlockBuild,

		BlockWrap() {
			(0, _context2.withIIFE)(() => this.block.verify());
		},

		Break() {
			verifyInLoop(this);
			(0, _context.check)(!(_context2.opLoop instanceof _MsAst.ForVal), this.loc, () => `${ (0, _CompileError.code)('for') } must break with a value.`);
		},

		BreakWithVal() {
			verifyInLoop(this);
			(0, _context.check)(_context2.opLoop instanceof _MsAst.ForVal, this.loc, () => `${ (0, _CompileError.code)('break') } only valid inside ${ (0, _CompileError.code)('for') }`);
			this.value.verify();
		},

		Call() {
			this.called.verify();

			for (const _ of this.args) _.verify();
		},

		CaseDo() {
			verifyCase(this);
		},

		CaseDoPart: verifyCasePart,

		CaseVal() {
			(0, _context2.withIIFE)(() => verifyCase(this));
		},

		CaseValPart: verifyCasePart,

		Catch() {
			(0, _context.check)(this.caught.opType === null, this.caught.loc, 'TODO: Caught types');
			(0, _locals.verifyAndPlusLocal)(this.caught, () => this.block.verify());
		},

		Class() {
			(0, _util2.verifyOp)(this.opSuperClass);

			for (const _ of this.kinds) _.verify();

			(0, _util2.verifyOp)(this.opDo);

			for (const _ of this.statics) _.verify();

			if (this.opConstructor !== null) this.opConstructor.verify(this.opSuperClass !== null);

			for (const _ of this.methods) _.verify();
		},

		ClassKindDo() {
			(0, _locals.verifyAndPlusLocal)(this.declareFocus, () => this.block.verify());
		},

		Cond() {
			this.test.verify();
			this.ifTrue.verify();
			this.ifFalse.verify();
		},

		ConditionalDo() {
			this.test.verify();
			this.result.verify();
		},

		ConditionalVal() {
			this.test.verify();
			(0, _context2.withIIFE)(() => this.result.verify());
		},

		Constructor(classHasSuper) {
			_context2.okToNotUse.add(this.fun.opDeclareThis);

			(0, _context2.withMethod)(this, () => {
				this.fun.verify();
			});

			const superCall = _context2.results.constructorToSuper.get(this);

			if (classHasSuper) (0, _context.check)(superCall !== undefined, this.loc, () => `Constructor must contain ${ (0, _CompileError.code)('super!') }`);else (0, _context.check)(superCall === undefined, () => superCall.loc, () => `Class has no superclass, so ${ (0, _CompileError.code)('super!') } is not allowed.`);

			for (const _ of this.memberArgs) (0, _locals.setDeclareAccessed)(_, this);
		},

		ExceptDo: verifyExcept,
		ExceptVal: verifyExcept,

		ForBag() {
			(0, _locals.verifyAndPlusLocal)(this.built, () => verifyFor(this));
		},

		ForDo() {
			verifyFor(this);
		},

		ForVal() {
			verifyFor(this);
		},

		Fun() {
			if (this.opReturnType !== null) {
				(0, _context.check)(this.block instanceof _MsAst.BlockVal, this.loc, 'Function with return type must return something.');
				if (this.block instanceof _MsAst.BlockValThrow) (0, _context.warn)('Return type ignored because the block always throws.');
			}

			(0, _locals.withBlockLocals)(() => {
				(0, _context2.withInFunKind)(this.kind, () => (0, _context2.withLoop)(null, () => {
					const allArgs = (0, _util.cat)(this.opDeclareThis, this.args, this.opRestArg);
					(0, _locals.verifyAndPlusLocals)(allArgs, () => {
						this.block.verify();
						(0, _util2.verifyOp)(this.opReturnType);
					});
				}));
			});
		},

		Ignore() {
			for (const _ of this.ignoredNames) (0, _locals.accessLocal)(this, _);
		},

		Kind() {
			for (const _ of this.superKinds) _.verify();

			(0, _util2.verifyOp)(this.opDo);

			for (const _ of this.statics) _.verify();

			for (const _ of this.methods) _.verify();
		},

		Lazy() {
			(0, _locals.withBlockLocals)(() => this.value.verify());
		},

		LocalAccess() {
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
			(0, _util2.verifyOp)(this.opType);
		},

		LocalMutate() {
			const declare = (0, _locals.getLocalDeclare)(this.name, this.loc);
			(0, _context.check)(declare.isMutable(), this.loc, () => `${ (0, _CompileError.code)(this.name) } is not mutable.`);
			this.value.verify();
		},

		Logic() {
			(0, _context.check)(this.args.length > 1, 'Logic expression needs at least 2 arguments.');

			for (const _ of this.args) _.verify();
		},

		Not() {
			this.arg.verify();
		},

		NumberLiteral() {},

		MapEntry() {
			(0, _locals.accessLocal)(this, 'built');
			this.key.verify();
			this.val.verify();
		},

		Member() {
			this.object.verify();
			(0, _util2.verifyName)(this.name);
		},

		MemberFun() {
			(0, _util2.verifyOp)(this.opObject);
			(0, _util2.verifyName)(this.name);
		},

		MemberSet() {
			this.object.verify();
			(0, _util2.verifyName)(this.name);
			(0, _util2.verifyOp)(this.opType);
			this.value.verify();
		},

		MethodImpl() {
			verifyMethod(this, () => {
				_context2.okToNotUse.add(this.fun.opDeclareThis);

				this.fun.verify();
			});
		},

		MethodGetter() {
			verifyMethod(this, () => {
				_context2.okToNotUse.add(this.declareThis);

				(0, _locals.verifyAndPlusLocals)([this.declareThis], () => {
					this.block.verify();
				});
			});
		},

		MethodSetter() {
			verifyMethod(this, () => {
				(0, _locals.verifyAndPlusLocals)([this.declareThis, this.declareFocus], () => {
					this.block.verify();
				});
			});
		},

		Module() {
			for (const _ of this.imports) _.verify();

			(0, _util2.verifyOp)(this.opImportGlobal);
			(0, _context2.withName)(_context.options.moduleName(), () => {
				(0, _verifyLines2.default)(this.lines);
			});
		},

		ModuleExport() {
			this.assign.verify();

			for (const _ of this.assign.allAssignees()) (0, _locals.setDeclareAccessed)(_, this);
		},

		New() {
			this.type.verify();

			for (const _ of this.args) _.verify();
		},

		ObjEntryAssign() {
			(0, _locals.accessLocal)(this, 'built');
			this.assign.verify();

			for (const _ of this.assign.allAssignees()) (0, _locals.setDeclareAccessed)(_, this);
		},

		ObjEntryPlain() {
			(0, _locals.accessLocal)(this, 'built');
			(0, _util2.verifyName)(this.name);
			this.value.verify();
		},

		ObjSimple() {
			const keys = new Set();

			for (const pair of this.pairs) {
				const key = pair.key;
				const value = pair.value;
				(0, _context.check)(!keys.has(key), pair.loc, () => `Duplicate key ${ key }`);
				keys.add(key);
				value.verify();
			}
		},

		GetterFun() {
			(0, _util2.verifyName)(this.name);
		},

		QuotePlain() {
			for (const _ of this.parts) (0, _util2.verifyName)(_);
		},

		QuoteSimple() {},

		QuoteTaggedTemplate() {
			this.tag.verify();
			this.quote.verify();
		},

		Range() {
			this.start.verify();
			(0, _util2.verifyOp)(this.end);
		},

		SetSub() {
			this.object.verify();

			for (const _ of this.subbeds) _.verify();

			(0, _util2.verifyOp)(this.opType);
			this.value.verify();
		},

		SpecialDo() {},

		SpecialVal() {
			(0, _util2.setName)(this);
		},

		Spread() {
			this.spreaded.verify();
		},

		SuperCall: verifySuperCall,
		SuperCallDo: verifySuperCall,

		SuperMember() {
			(0, _context.check)(_context2.method !== null, this.loc, 'Must be in method.');
			(0, _util2.verifyName)(this.name);
		},

		SwitchDo() {
			verifySwitch(this);
		},

		SwitchDoPart: verifySwitchPart,

		SwitchVal() {
			(0, _context2.withIIFE)(() => verifySwitch(this));
		},

		SwitchValPart: verifySwitchPart,

		Throw() {
			(0, _util2.verifyOp)(this.opThrown);
		},

		Import: verifyImport,
		ImportGlobal: verifyImport,

		With() {
			this.value.verify();
			(0, _context2.withIIFE)(() => {
				if (this.declare.name === '_') _context2.okToNotUse.add(this.declare);
				(0, _locals.verifyAndPlusLocal)(this.declare, () => {
					this.block.verify();
				});
			});
		},

		Yield() {
			(0, _context.check)(_context2.funKind !== _MsAst.Funs.Plain, `Cannot ${ (0, _CompileError.code)('<~') } outside of async/generator.`);
			if (_context2.funKind === _MsAst.Funs.Async) (0, _context.check)(this.opYielded !== null, this.loc, 'Cannot await nothing.');
			(0, _util2.verifyOp)(this.opYielded);
		},

		YieldTo() {
			(0, _context.check)(_context2.funKind === _MsAst.Funs.Generator, this.loc, `Cannot ${ (0, _CompileError.code)('<~~') } outside of generator.`);
			this.yieldedTo.verify();
		}

	});

	function verifyBagEntry() {
		(0, _locals.accessLocal)(this, 'built');
		this.value.verify();
	}

	function verifyBlockBuild() {
		(0, _locals.verifyAndPlusLocal)(this.built, () => {
			(0, _verifyLines2.default)(this.lines);
		});
	}

	function verifyCasePart() {
		if (this.test instanceof _MsAst.Pattern) {
			this.test.type.verify();
			this.test.patterned.verify();
			(0, _locals.verifyAndPlusLocals)(this.test.locals, () => this.result.verify());
		} else {
			this.test.verify();
			this.result.verify();
		}
	}

	function verifySwitchPart() {
		for (const _ of this.values) _.verify();

		this.result.verify();
	}

	function verifyExcept() {
		this.try.verify();
		(0, _util2.verifyOp)(this.catch);
		(0, _util2.verifyOp)(this.finally);
	}

	function verifySuperCall() {
		(0, _context.check)(_context2.method !== null, this.loc, 'Must be in a method.');

		_context2.results.superCallToMethod.set(this, _context2.method);

		if (_context2.method instanceof _MsAst.Constructor) {
			(0, _context.check)(this instanceof _MsAst.SuperCallDo, this.loc, () => `${ (0, _CompileError.code)('super') } not supported in constructor; use ${ (0, _CompileError.code)('super!') }`);

			_context2.results.constructorToSuper.set(_context2.method, this);
		}

		for (const _ of this.args) _.verify();
	}

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
		const verifyBlock = () => (0, _context2.withLoop)(forLoop, () => forLoop.block.verify());

		(0, _util.ifElse)(forLoop.opIteratee, _ref => {
			let element = _ref.element;
			let bag = _ref.bag;
			bag.verify();
			(0, _locals.verifyAndPlusLocal)(element, verifyBlock);
		}, verifyBlock);
	}

	function verifyInLoop(loopUser) {
		(0, _context.check)(_context2.opLoop !== null, loopUser.loc, 'Not in a loop.');
	}

	function verifyCase(_) {
		const doIt = () => {
			for (const part of _.parts) part.verify();

			(0, _util2.verifyOp)(_.opElse);
		};

		(0, _util.ifElse)(_.opCased, _ => {
			_.verify();

			(0, _locals.verifyAndPlusLocal)(_.assignee, doIt);
		}, doIt);
	}

	function verifyMethod(_, doVerify) {
		(0, _util2.verifyName)(_.symbol);
		(0, _context2.withMethod)(_, doVerify);
	}

	function verifySwitch(_) {
		_.switched.verify();

		for (const part of _.parts) part.verify();

		(0, _util2.verifyOp)(_.opElse);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQW1Cd0IsTUFBTTs7Ozs7Ozs7OztVQUFOLE1BQU0iLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCBvcHRpb25zLCB3YXJufSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0ICogYXMgTXNBc3RUeXBlcyBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7QmxvY2tWYWwsIEJsb2NrVmFsVGhyb3csIENsYXNzLCBDb25zdHJ1Y3Rvcixcblx0Rm9yVmFsLCBGdW4sIEZ1bnMsIEtpbmQsIFBhdHRlcm4sIFN1cGVyQ2FsbERvfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7Y2F0LCBpZkVsc2UsIGltcGxlbWVudE1hbnksIG9wRWFjaH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7ZnVuS2luZCwgbG9jYWxzLCBtZXRob2QsIG9rVG9Ob3RVc2UsIG9wTG9vcCwgcmVzdWx0cywgc2V0dXAsIHRlYXJEb3duLCB3aXRoSUlGRSxcblx0d2l0aEluRnVuS2luZCwgd2l0aE1ldGhvZCwgd2l0aExvb3AsIHdpdGhOYW1lfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge2FjY2Vzc0xvY2FsLCBnZXRMb2NhbERlY2xhcmUsIGZhaWxNaXNzaW5nTG9jYWwsIHBsdXNMb2NhbHMsIHNldERlY2xhcmVBY2Nlc3NlZCwgc2V0TG9jYWwsXG5cdHZlcmlmeUFuZFBsdXNMb2NhbCwgdmVyaWZ5QW5kUGx1c0xvY2FscywgdmVyaWZ5TG9jYWxEZWNsYXJlLCB3YXJuVW51c2VkTG9jYWxzLCB3aXRoQmxvY2tMb2NhbHNcblx0fSBmcm9tICcuL2xvY2FscydcbmltcG9ydCB7c2V0TmFtZSwgdmVyaWZ5TmFtZSwgdmVyaWZ5T3B9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB2ZXJpZnlMaW5lcyBmcm9tICcuL3ZlcmlmeUxpbmVzJ1xuXG4vKipcbkdlbmVyYXRlcyBpbmZvcm1hdGlvbiBuZWVkZWQgZHVyaW5nIHRyYW5zcGlsaW5nLCB0aGUgVmVyaWZ5UmVzdWx0cy5cbkFsc28gY2hlY2tzIGZvciBleGlzdGVuY2Ugb2YgbG9jYWwgdmFyaWFibGVzIGFuZCB3YXJucyBmb3IgdW51c2VkIGxvY2Fscy5cbkBwYXJhbSB7TXNBc3R9IG1zQXN0XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdmVyaWZ5KG1zQXN0KSB7XG5cdHNldHVwKClcblx0bXNBc3QudmVyaWZ5KClcblx0d2FyblVudXNlZExvY2FscygpXG5cdGNvbnN0IHJlcyA9IHJlc3VsdHNcblx0dGVhckRvd24oKVxuXHRyZXR1cm4gcmVzXG59XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ3ZlcmlmeScsIHtcblx0QXNzZXJ0KCkge1xuXHRcdHRoaXMuY29uZGl0aW9uLnZlcmlmeSgpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFRocm93bilcblx0fSxcblxuXHRBc3NpZ25TaW5nbGUoKSB7XG5cdFx0d2l0aE5hbWUodGhpcy5hc3NpZ25lZS5uYW1lLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBkb1YgPSAoKSA9PiB7XG5cdFx0XHRcdC8qXG5cdFx0XHRcdEZ1biBhbmQgQ2xhc3Mgb25seSBnZXQgbmFtZSBpZiB0aGV5IGFyZSBpbW1lZGlhdGVseSBhZnRlciB0aGUgYXNzaWdubWVudC5cblx0XHRcdFx0c28gaW4gYHggPSAkYWZ0ZXItdGltZSAxMDAwIHxgIHRoZSBmdW5jdGlvbiBpcyBub3QgbmFtZWQuXG5cdFx0XHRcdCovXG5cdFx0XHRcdGlmICh0aGlzLnZhbHVlIGluc3RhbmNlb2YgQ2xhc3MgfHxcblx0XHRcdFx0XHR0aGlzLnZhbHVlIGluc3RhbmNlb2YgRnVuIHx8XG5cdFx0XHRcdFx0dGhpcy52YWx1ZSBpbnN0YW5jZW9mIEtpbmQpXG5cdFx0XHRcdFx0c2V0TmFtZSh0aGlzLnZhbHVlKVxuXG5cdFx0XHRcdC8vIEFzc2lnbmVlIHJlZ2lzdGVyZWQgYnkgdmVyaWZ5TGluZXMuXG5cdFx0XHRcdHRoaXMuYXNzaWduZWUudmVyaWZ5KClcblx0XHRcdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMuYXNzaWduZWUuaXNMYXp5KCkpXG5cdFx0XHRcdHdpdGhCbG9ja0xvY2Fscyhkb1YpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGRvVigpXG5cdFx0fSlcblx0fSxcblxuXHRBc3NpZ25EZXN0cnVjdHVyZSgpIHtcblx0XHQvLyBBc3NpZ25lZXMgcmVnaXN0ZXJlZCBieSB2ZXJpZnlMaW5lcy5cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hc3NpZ25lZXMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdEJhZ0VudHJ5OiB2ZXJpZnlCYWdFbnRyeSxcblx0QmFnRW50cnlNYW55OiB2ZXJpZnlCYWdFbnRyeSxcblxuXHRCYWdTaW1wbGUoKSB7XG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMucGFydHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0QmxvY2tEbygpIHtcblx0XHR2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHR9LFxuXG5cdEJsb2NrVmFsVGhyb3coKSB7XG5cdFx0Y29uc3QgbmV3TG9jYWxzID0gdmVyaWZ5TGluZXModGhpcy5saW5lcylcblx0XHRwbHVzTG9jYWxzKG5ld0xvY2FscywgKCkgPT4gdGhpcy50aHJvdy52ZXJpZnkoKSlcblx0fSxcblxuXHRCbG9ja1ZhbFJldHVybigpIHtcblx0XHRjb25zdCBuZXdMb2NhbHMgPSB2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHRcdHBsdXNMb2NhbHMobmV3TG9jYWxzLCAoKSA9PiB0aGlzLnJldHVybmVkLnZlcmlmeSgpKVxuXHR9LFxuXG5cblx0QmxvY2tPYmo6IHZlcmlmeUJsb2NrQnVpbGQsXG5cdEJsb2NrQmFnOiB2ZXJpZnlCbG9ja0J1aWxkLFxuXHRCbG9ja01hcDogdmVyaWZ5QmxvY2tCdWlsZCxcblxuXHRCbG9ja1dyYXAoKSB7XG5cdFx0d2l0aElJRkUoKCkgPT4gdGhpcy5ibG9jay52ZXJpZnkoKSlcblx0fSxcblxuXHRCcmVhaygpIHtcblx0XHR2ZXJpZnlJbkxvb3AodGhpcylcblx0XHRjaGVjayghKG9wTG9vcCBpbnN0YW5jZW9mIEZvclZhbCksIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0YCR7Y29kZSgnZm9yJyl9IG11c3QgYnJlYWsgd2l0aCBhIHZhbHVlLmApXG5cdH0sXG5cblx0QnJlYWtXaXRoVmFsKCkge1xuXHRcdHZlcmlmeUluTG9vcCh0aGlzKVxuXHRcdGNoZWNrKG9wTG9vcCBpbnN0YW5jZW9mIEZvclZhbCwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRgJHtjb2RlKCdicmVhaycpfSBvbmx5IHZhbGlkIGluc2lkZSAke2NvZGUoJ2ZvcicpfWApXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdENhbGwoKSB7XG5cdFx0dGhpcy5jYWxsZWQudmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hcmdzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHR9LFxuXG5cdENhc2VEbygpIHtcblx0XHR2ZXJpZnlDYXNlKHRoaXMpXG5cdH0sXG5cdENhc2VEb1BhcnQ6IHZlcmlmeUNhc2VQYXJ0LFxuXHRDYXNlVmFsKCkge1xuXHRcdHdpdGhJSUZFKCgpID0+IHZlcmlmeUNhc2UodGhpcykpXG5cdH0sXG5cdENhc2VWYWxQYXJ0OiB2ZXJpZnlDYXNlUGFydCxcblxuXHRDYXRjaCgpIHtcblx0XHRjaGVjayh0aGlzLmNhdWdodC5vcFR5cGUgPT09IG51bGwsIHRoaXMuY2F1Z2h0LmxvYywgJ1RPRE86IENhdWdodCB0eXBlcycpXG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuY2F1Z2h0LCAoKSA9PiB0aGlzLmJsb2NrLnZlcmlmeSgpKVxuXHR9LFxuXG5cdENsYXNzKCkge1xuXHRcdHZlcmlmeU9wKHRoaXMub3BTdXBlckNsYXNzKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmtpbmRzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BEbylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5zdGF0aWNzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdGlmICh0aGlzLm9wQ29uc3RydWN0b3IgIT09IG51bGwpXG5cdFx0XHR0aGlzLm9wQ29uc3RydWN0b3IudmVyaWZ5KHRoaXMub3BTdXBlckNsYXNzICE9PSBudWxsKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLm1ldGhvZHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0Ly8gbmFtZSBzZXQgYnkgQXNzaWduU2luZ2xlXG5cdH0sXG5cblx0Q2xhc3NLaW5kRG8oKSB7XG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuZGVjbGFyZUZvY3VzLCAoKSA9PiB0aGlzLmJsb2NrLnZlcmlmeSgpKVxuXHR9LFxuXG5cdENvbmQoKSB7XG5cdFx0dGhpcy50ZXN0LnZlcmlmeSgpXG5cdFx0dGhpcy5pZlRydWUudmVyaWZ5KClcblx0XHR0aGlzLmlmRmFsc2UudmVyaWZ5KClcblx0fSxcblxuXHRDb25kaXRpb25hbERvKCkge1xuXHRcdHRoaXMudGVzdC52ZXJpZnkoKVxuXHRcdHRoaXMucmVzdWx0LnZlcmlmeSgpXG5cdH0sXG5cdENvbmRpdGlvbmFsVmFsKCkge1xuXHRcdHRoaXMudGVzdC52ZXJpZnkoKVxuXHRcdHdpdGhJSUZFKCgpID0+IHRoaXMucmVzdWx0LnZlcmlmeSgpKVxuXHR9LFxuXG5cdENvbnN0cnVjdG9yKGNsYXNzSGFzU3VwZXIpIHtcblx0XHRva1RvTm90VXNlLmFkZCh0aGlzLmZ1bi5vcERlY2xhcmVUaGlzKVxuXHRcdHdpdGhNZXRob2QodGhpcywgKCkgPT4geyB0aGlzLmZ1bi52ZXJpZnkoKSB9KVxuXG5cdFx0Y29uc3Qgc3VwZXJDYWxsID0gcmVzdWx0cy5jb25zdHJ1Y3RvclRvU3VwZXIuZ2V0KHRoaXMpXG5cblx0XHRpZiAoY2xhc3NIYXNTdXBlcilcblx0XHRcdGNoZWNrKHN1cGVyQ2FsbCAhPT0gdW5kZWZpbmVkLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdFx0YENvbnN0cnVjdG9yIG11c3QgY29udGFpbiAke2NvZGUoJ3N1cGVyIScpfWApXG5cdFx0ZWxzZVxuXHRcdFx0Y2hlY2soc3VwZXJDYWxsID09PSB1bmRlZmluZWQsICgpID0+IHN1cGVyQ2FsbC5sb2MsICgpID0+XG5cdFx0XHRcdGBDbGFzcyBoYXMgbm8gc3VwZXJjbGFzcywgc28gJHtjb2RlKCdzdXBlciEnKX0gaXMgbm90IGFsbG93ZWQuYClcblxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLm1lbWJlckFyZ3MpXG5cdFx0XHRzZXREZWNsYXJlQWNjZXNzZWQoXywgdGhpcylcblx0fSxcblxuXHRFeGNlcHREbzogdmVyaWZ5RXhjZXB0LFxuXHRFeGNlcHRWYWw6IHZlcmlmeUV4Y2VwdCxcblxuXHRGb3JCYWcoKSB7XG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuYnVpbHQsICgpID0+IHZlcmlmeUZvcih0aGlzKSlcblx0fSxcblxuXHRGb3JEbygpIHtcblx0XHR2ZXJpZnlGb3IodGhpcylcblx0fSxcblxuXHRGb3JWYWwoKSB7XG5cdFx0dmVyaWZ5Rm9yKHRoaXMpXG5cdH0sXG5cblx0RnVuKCkge1xuXHRcdGlmICh0aGlzLm9wUmV0dXJuVHlwZSAhPT0gbnVsbCkge1xuXHRcdFx0Y2hlY2sodGhpcy5ibG9jayBpbnN0YW5jZW9mIEJsb2NrVmFsLCB0aGlzLmxvYyxcblx0XHRcdFx0J0Z1bmN0aW9uIHdpdGggcmV0dXJuIHR5cGUgbXVzdCByZXR1cm4gc29tZXRoaW5nLicpXG5cdFx0XHRpZiAodGhpcy5ibG9jayBpbnN0YW5jZW9mIEJsb2NrVmFsVGhyb3cpXG5cdFx0XHRcdHdhcm4oJ1JldHVybiB0eXBlIGlnbm9yZWQgYmVjYXVzZSB0aGUgYmxvY2sgYWx3YXlzIHRocm93cy4nKVxuXHRcdH1cblxuXHRcdHdpdGhCbG9ja0xvY2FscygoKSA9PiB7XG5cdFx0XHR3aXRoSW5GdW5LaW5kKHRoaXMua2luZCwgKCkgPT5cblx0XHRcdFx0d2l0aExvb3AobnVsbCwgKCkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGFsbEFyZ3MgPSBjYXQodGhpcy5vcERlY2xhcmVUaGlzLCB0aGlzLmFyZ3MsIHRoaXMub3BSZXN0QXJnKVxuXHRcdFx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoYWxsQXJncywgKCkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoKVxuXHRcdFx0XHRcdFx0dmVyaWZ5T3AodGhpcy5vcFJldHVyblR5cGUpXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fSkpXG5cdFx0fSlcblxuXHRcdC8vIG5hbWUgc2V0IGJ5IEFzc2lnblNpbmdsZVxuXHR9LFxuXG5cdElnbm9yZSgpIHtcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5pZ25vcmVkTmFtZXMpXG5cdFx0XHRhY2Nlc3NMb2NhbCh0aGlzLCBfKVxuXHR9LFxuXG5cdEtpbmQoKSB7XG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuc3VwZXJLaW5kcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wRG8pXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuc3RhdGljcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5tZXRob2RzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdC8vIG5hbWUgc2V0IGJ5IEFzc2lnblNpbmdsZVxuXHR9LFxuXG5cdExhenkoKSB7XG5cdFx0d2l0aEJsb2NrTG9jYWxzKCgpID0+IHRoaXMudmFsdWUudmVyaWZ5KCkpXG5cdH0sXG5cblx0TG9jYWxBY2Nlc3MoKSB7XG5cdFx0Y29uc3QgZGVjbGFyZSA9IGxvY2Fscy5nZXQodGhpcy5uYW1lKVxuXHRcdGlmIChkZWNsYXJlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdGNvbnN0IGJ1aWx0aW5QYXRoID0gb3B0aW9ucy5idWlsdGluTmFtZVRvUGF0aC5nZXQodGhpcy5uYW1lKVxuXHRcdFx0aWYgKGJ1aWx0aW5QYXRoID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdGZhaWxNaXNzaW5nTG9jYWwodGhpcy5sb2MsIHRoaXMubmFtZSlcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRjb25zdCBuYW1lcyA9IHJlc3VsdHMuYnVpbHRpblBhdGhUb05hbWVzLmdldChidWlsdGluUGF0aClcblx0XHRcdFx0aWYgKG5hbWVzID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdFx0cmVzdWx0cy5idWlsdGluUGF0aFRvTmFtZXMuc2V0KGJ1aWx0aW5QYXRoLCBuZXcgU2V0KFt0aGlzLm5hbWVdKSlcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdG5hbWVzLmFkZCh0aGlzLm5hbWUpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc3VsdHMubG9jYWxBY2Nlc3NUb0RlY2xhcmUuc2V0KHRoaXMsIGRlY2xhcmUpXG5cdFx0XHRzZXREZWNsYXJlQWNjZXNzZWQoZGVjbGFyZSwgdGhpcylcblx0XHR9XG5cdH0sXG5cblx0Ly8gQWRkaW5nIExvY2FsRGVjbGFyZXMgdG8gdGhlIGF2YWlsYWJsZSBsb2NhbHMgaXMgZG9uZSBieSBGdW4gb3IgbGluZU5ld0xvY2Fscy5cblx0TG9jYWxEZWNsYXJlKCkge1xuXHRcdGNvbnN0IGJ1aWx0aW5QYXRoID0gb3B0aW9ucy5idWlsdGluTmFtZVRvUGF0aC5nZXQodGhpcy5uYW1lKVxuXHRcdGlmIChidWlsdGluUGF0aCAhPT0gdW5kZWZpbmVkKVxuXHRcdFx0d2Fybih0aGlzLmxvYywgYExvY2FsICR7Y29kZSh0aGlzLm5hbWUpfSBvdmVycmlkZXMgYnVpbHRpbiBmcm9tICR7Y29kZShidWlsdGluUGF0aCl9LmApXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFR5cGUpXG5cdH0sXG5cblx0TG9jYWxNdXRhdGUoKSB7XG5cdFx0Y29uc3QgZGVjbGFyZSA9IGdldExvY2FsRGVjbGFyZSh0aGlzLm5hbWUsIHRoaXMubG9jKVxuXHRcdGNoZWNrKGRlY2xhcmUuaXNNdXRhYmxlKCksIHRoaXMubG9jLCAoKSA9PiBgJHtjb2RlKHRoaXMubmFtZSl9IGlzIG5vdCBtdXRhYmxlLmApXG5cdFx0Ly8gVE9ETzogVHJhY2sgbXV0YXRpb25zLiBNdXRhYmxlIGxvY2FsIG11c3QgYmUgbXV0YXRlZCBzb21ld2hlcmUuXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdExvZ2ljKCkge1xuXHRcdGNoZWNrKHRoaXMuYXJncy5sZW5ndGggPiAxLCAnTG9naWMgZXhwcmVzc2lvbiBuZWVkcyBhdCBsZWFzdCAyIGFyZ3VtZW50cy4nKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0Tm90KCkge1xuXHRcdHRoaXMuYXJnLnZlcmlmeSgpXG5cdH0sXG5cblx0TnVtYmVyTGl0ZXJhbCgpIHsgfSxcblxuXHRNYXBFbnRyeSgpIHtcblx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHRoaXMua2V5LnZlcmlmeSgpXG5cdFx0dGhpcy52YWwudmVyaWZ5KClcblx0fSxcblxuXHRNZW1iZXIoKSB7XG5cdFx0dGhpcy5vYmplY3QudmVyaWZ5KClcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0fSxcblxuXHRNZW1iZXJGdW4oKSB7XG5cdFx0dmVyaWZ5T3AodGhpcy5vcE9iamVjdClcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0fSxcblxuXHRNZW1iZXJTZXQoKSB7XG5cdFx0dGhpcy5vYmplY3QudmVyaWZ5KClcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVHlwZSlcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0TWV0aG9kSW1wbCgpIHtcblx0XHR2ZXJpZnlNZXRob2QodGhpcywgKCkgPT4ge1xuXHRcdFx0b2tUb05vdFVzZS5hZGQodGhpcy5mdW4ub3BEZWNsYXJlVGhpcylcblx0XHRcdHRoaXMuZnVuLnZlcmlmeSgpXG5cdFx0fSlcblx0fSxcblx0TWV0aG9kR2V0dGVyKCkge1xuXHRcdHZlcmlmeU1ldGhvZCh0aGlzLCAoKSA9PiB7XG5cdFx0XHRva1RvTm90VXNlLmFkZCh0aGlzLmRlY2xhcmVUaGlzKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FscyhbdGhpcy5kZWNsYXJlVGhpc10sICgpID0+IHsgdGhpcy5ibG9jay52ZXJpZnkoKSB9KVxuXHRcdH0pXG5cdH0sXG5cdE1ldGhvZFNldHRlcigpIHtcblx0XHR2ZXJpZnlNZXRob2QodGhpcywgKCkgPT4ge1xuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FscyhbdGhpcy5kZWNsYXJlVGhpcywgdGhpcy5kZWNsYXJlRm9jdXNdLCAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuYmxvY2sudmVyaWZ5KClcblx0XHRcdH0pXG5cdFx0fSlcblx0fSxcblxuXHRNb2R1bGUoKSB7XG5cdFx0Ly8gTm8gbmVlZCB0byB2ZXJpZnkgdGhpcy5kb0ltcG9ydHMuXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuaW1wb3J0cylcblx0XHRcdF8udmVyaWZ5KClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wSW1wb3J0R2xvYmFsKVxuXG5cdFx0d2l0aE5hbWUob3B0aW9ucy5tb2R1bGVOYW1lKCksICgpID0+IHtcblx0XHRcdHZlcmlmeUxpbmVzKHRoaXMubGluZXMpXG5cdFx0fSlcblx0fSxcblxuXHRNb2R1bGVFeHBvcnQoKSB7XG5cdFx0dGhpcy5hc3NpZ24udmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hc3NpZ24uYWxsQXNzaWduZWVzKCkpXG5cdFx0XHRzZXREZWNsYXJlQWNjZXNzZWQoXywgdGhpcylcblx0fSxcblxuXHROZXcoKSB7XG5cdFx0dGhpcy50eXBlLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHRPYmpFbnRyeUFzc2lnbigpIHtcblx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHRoaXMuYXNzaWduLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXNzaWduLmFsbEFzc2lnbmVlcygpKVxuXHRcdFx0c2V0RGVjbGFyZUFjY2Vzc2VkKF8sIHRoaXMpXG5cdH0sXG5cblx0T2JqRW50cnlQbGFpbigpIHtcblx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0fSxcblxuXHRPYmpTaW1wbGUoKSB7XG5cdFx0Y29uc3Qga2V5cyA9IG5ldyBTZXQoKVxuXHRcdGZvciAoY29uc3QgcGFpciBvZiB0aGlzLnBhaXJzKSB7XG5cdFx0XHRjb25zdCB7a2V5LCB2YWx1ZX0gPSBwYWlyXG5cdFx0XHRjaGVjaygha2V5cy5oYXMoa2V5KSwgcGFpci5sb2MsICgpID0+IGBEdXBsaWNhdGUga2V5ICR7a2V5fWApXG5cdFx0XHRrZXlzLmFkZChrZXkpXG5cdFx0XHR2YWx1ZS52ZXJpZnkoKVxuXHRcdH1cblx0fSxcblxuXHRHZXR0ZXJGdW4oKSB7XG5cdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdH0sXG5cblx0UXVvdGVQbGFpbigpIHtcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5wYXJ0cylcblx0XHRcdHZlcmlmeU5hbWUoXylcblx0fSxcblxuXHRRdW90ZVNpbXBsZSgpIHt9LFxuXG5cdFF1b3RlVGFnZ2VkVGVtcGxhdGUoKSB7XG5cdFx0dGhpcy50YWcudmVyaWZ5KClcblx0XHR0aGlzLnF1b3RlLnZlcmlmeSgpXG5cdH0sXG5cblx0UmFuZ2UoKSB7XG5cdFx0dGhpcy5zdGFydC52ZXJpZnkoKVxuXHRcdHZlcmlmeU9wKHRoaXMuZW5kKVxuXHR9LFxuXG5cdFNldFN1YigpIHtcblx0XHR0aGlzLm9iamVjdC52ZXJpZnkoKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLnN1YmJlZHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFR5cGUpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdFNwZWNpYWxEbygpIHsgfSxcblxuXHRTcGVjaWFsVmFsKCkge1xuXHRcdHNldE5hbWUodGhpcylcblx0fSxcblxuXHRTcHJlYWQoKSB7XG5cdFx0dGhpcy5zcHJlYWRlZC52ZXJpZnkoKVxuXHR9LFxuXG5cdFN1cGVyQ2FsbDogdmVyaWZ5U3VwZXJDYWxsLFxuXHRTdXBlckNhbGxEbzogdmVyaWZ5U3VwZXJDYWxsLFxuXHRTdXBlck1lbWJlcigpIHtcblx0XHRjaGVjayhtZXRob2QgIT09IG51bGwsIHRoaXMubG9jLCAnTXVzdCBiZSBpbiBtZXRob2QuJylcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0fSxcblxuXHRTd2l0Y2hEbygpIHtcblx0XHR2ZXJpZnlTd2l0Y2godGhpcylcblx0fSxcblx0U3dpdGNoRG9QYXJ0OiB2ZXJpZnlTd2l0Y2hQYXJ0LFxuXHRTd2l0Y2hWYWwoKSB7XG5cdFx0d2l0aElJRkUoKCkgPT4gdmVyaWZ5U3dpdGNoKHRoaXMpKVxuXHR9LFxuXHRTd2l0Y2hWYWxQYXJ0OiB2ZXJpZnlTd2l0Y2hQYXJ0LFxuXG5cdFRocm93KCkge1xuXHRcdHZlcmlmeU9wKHRoaXMub3BUaHJvd24pXG5cdH0sXG5cblx0SW1wb3J0OiB2ZXJpZnlJbXBvcnQsXG5cdEltcG9ydEdsb2JhbDogdmVyaWZ5SW1wb3J0LFxuXG5cdFdpdGgoKSB7XG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHRcdHdpdGhJSUZFKCgpID0+IHtcblx0XHRcdGlmICh0aGlzLmRlY2xhcmUubmFtZSA9PT0gJ18nKVxuXHRcdFx0XHRva1RvTm90VXNlLmFkZCh0aGlzLmRlY2xhcmUpXG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5kZWNsYXJlLCAoKSA9PiB7IHRoaXMuYmxvY2sudmVyaWZ5KCkgfSlcblx0XHR9KVxuXHR9LFxuXG5cdFlpZWxkKCkge1xuXHRcdGNoZWNrKGZ1bktpbmQgIT09IEZ1bnMuUGxhaW4sIGBDYW5ub3QgJHtjb2RlKCc8ficpfSBvdXRzaWRlIG9mIGFzeW5jL2dlbmVyYXRvci5gKVxuXHRcdGlmIChmdW5LaW5kID09PSBGdW5zLkFzeW5jKVxuXHRcdFx0Y2hlY2sodGhpcy5vcFlpZWxkZWQgIT09IG51bGwsIHRoaXMubG9jLCAnQ2Fubm90IGF3YWl0IG5vdGhpbmcuJylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wWWllbGRlZClcblx0fSxcblxuXHRZaWVsZFRvKCkge1xuXHRcdGNoZWNrKGZ1bktpbmQgPT09IEZ1bnMuR2VuZXJhdG9yLCB0aGlzLmxvYywgYENhbm5vdCAke2NvZGUoJzx+ficpfSBvdXRzaWRlIG9mIGdlbmVyYXRvci5gKVxuXHRcdHRoaXMueWllbGRlZFRvLnZlcmlmeSgpXG5cdH1cbn0pXG5cbi8vIFNoYXJlZCBpbXBsZW1lbnRhdGlvbnNcblxuZnVuY3Rpb24gdmVyaWZ5QmFnRW50cnkoKSB7XG5cdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdHRoaXMudmFsdWUudmVyaWZ5KClcbn1cblxuZnVuY3Rpb24gdmVyaWZ5QmxvY2tCdWlsZCgpIHtcblx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuYnVpbHQsICgpID0+IHtcblx0XHR2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHR9KVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlDYXNlUGFydCgpIHtcblx0aWYgKHRoaXMudGVzdCBpbnN0YW5jZW9mIFBhdHRlcm4pIHtcblx0XHR0aGlzLnRlc3QudHlwZS52ZXJpZnkoKVxuXHRcdHRoaXMudGVzdC5wYXR0ZXJuZWQudmVyaWZ5KClcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKHRoaXMudGVzdC5sb2NhbHMsICgpID0+IHRoaXMucmVzdWx0LnZlcmlmeSgpKVxuXHR9IGVsc2Uge1xuXHRcdHRoaXMudGVzdC52ZXJpZnkoKVxuXHRcdHRoaXMucmVzdWx0LnZlcmlmeSgpXG5cdH1cbn1cblxuZnVuY3Rpb24gdmVyaWZ5U3dpdGNoUGFydCgpIHtcblx0Zm9yIChjb25zdCBfIG9mIHRoaXMudmFsdWVzKVxuXHRcdF8udmVyaWZ5KClcblx0dGhpcy5yZXN1bHQudmVyaWZ5KClcbn1cblxuZnVuY3Rpb24gdmVyaWZ5RXhjZXB0KCkge1xuXHR0aGlzLnRyeS52ZXJpZnkoKVxuXHR2ZXJpZnlPcCh0aGlzLmNhdGNoKVxuXHR2ZXJpZnlPcCh0aGlzLmZpbmFsbHkpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeVN1cGVyQ2FsbCgpIHtcblx0Y2hlY2sobWV0aG9kICE9PSBudWxsLCB0aGlzLmxvYywgJ011c3QgYmUgaW4gYSBtZXRob2QuJylcblx0cmVzdWx0cy5zdXBlckNhbGxUb01ldGhvZC5zZXQodGhpcywgbWV0aG9kKVxuXG5cdGlmIChtZXRob2QgaW5zdGFuY2VvZiBDb25zdHJ1Y3Rvcikge1xuXHRcdGNoZWNrKHRoaXMgaW5zdGFuY2VvZiBTdXBlckNhbGxEbywgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRgJHtjb2RlKCdzdXBlcicpfSBub3Qgc3VwcG9ydGVkIGluIGNvbnN0cnVjdG9yOyB1c2UgJHtjb2RlKCdzdXBlciEnKX1gKVxuXHRcdHJlc3VsdHMuY29uc3RydWN0b3JUb1N1cGVyLnNldChtZXRob2QsIHRoaXMpXG5cdH1cblxuXHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hcmdzKVxuXHRcdF8udmVyaWZ5KClcbn1cblxuZnVuY3Rpb24gdmVyaWZ5SW1wb3J0KCkge1xuXHQvLyBTaW5jZSBVc2VzIGFyZSBhbHdheXMgaW4gdGhlIG91dGVybW9zdCBzY29wZSwgZG9uJ3QgaGF2ZSB0byB3b3JyeSBhYm91dCBzaGFkb3dpbmcuXG5cdC8vIFNvIHdlIG11dGF0ZSBgbG9jYWxzYCBkaXJlY3RseS5cblx0Y29uc3QgYWRkVXNlTG9jYWwgPSBfID0+IHtcblx0XHRjb25zdCBwcmV2ID0gbG9jYWxzLmdldChfLm5hbWUpXG5cdFx0Y2hlY2socHJldiA9PT0gdW5kZWZpbmVkLCBfLmxvYywgKCkgPT5cblx0XHRcdGAke2NvZGUoXy5uYW1lKX0gYWxyZWFkeSBpbXBvcnRlZCBhdCAke3ByZXYubG9jfWApXG5cdFx0dmVyaWZ5TG9jYWxEZWNsYXJlKF8pXG5cdFx0c2V0TG9jYWwoXylcblx0fVxuXHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5pbXBvcnRlZClcblx0XHRhZGRVc2VMb2NhbChfKVxuXHRvcEVhY2godGhpcy5vcEltcG9ydERlZmF1bHQsIGFkZFVzZUxvY2FsKVxufVxuXG4vLyBIZWxwZXJzIHNwZWNpZmljIHRvIGNlcnRhaW4gTXNBc3QgdHlwZXNcblxuZnVuY3Rpb24gdmVyaWZ5Rm9yKGZvckxvb3ApIHtcblx0Y29uc3QgdmVyaWZ5QmxvY2sgPSAoKSA9PiB3aXRoTG9vcChmb3JMb29wLCAoKSA9PiBmb3JMb29wLmJsb2NrLnZlcmlmeSgpKVxuXHRpZkVsc2UoZm9yTG9vcC5vcEl0ZXJhdGVlLFxuXHRcdCh7ZWxlbWVudCwgYmFnfSkgPT4ge1xuXHRcdFx0YmFnLnZlcmlmeSgpXG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwoZWxlbWVudCwgdmVyaWZ5QmxvY2spXG5cdFx0fSxcblx0XHR2ZXJpZnlCbG9jaylcbn1cblxuZnVuY3Rpb24gdmVyaWZ5SW5Mb29wKGxvb3BVc2VyKSB7XG5cdGNoZWNrKG9wTG9vcCAhPT0gbnVsbCwgbG9vcFVzZXIubG9jLCAnTm90IGluIGEgbG9vcC4nKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlDYXNlKF8pIHtcblx0Y29uc3QgZG9JdCA9ICgpID0+IHtcblx0XHRmb3IgKGNvbnN0IHBhcnQgb2YgXy5wYXJ0cylcblx0XHRcdHBhcnQudmVyaWZ5KClcblx0XHR2ZXJpZnlPcChfLm9wRWxzZSlcblx0fVxuXHRpZkVsc2UoXy5vcENhc2VkLFxuXHRcdF8gPT4ge1xuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKF8uYXNzaWduZWUsIGRvSXQpXG5cdFx0fSxcblx0XHRkb0l0KVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlNZXRob2QoXywgZG9WZXJpZnkpIHtcblx0dmVyaWZ5TmFtZShfLnN5bWJvbClcblx0d2l0aE1ldGhvZChfLCBkb1ZlcmlmeSlcbn1cblxuZnVuY3Rpb24gdmVyaWZ5U3dpdGNoKF8pIHtcblx0Xy5zd2l0Y2hlZC52ZXJpZnkoKVxuXHRmb3IgKGNvbnN0IHBhcnQgb2YgXy5wYXJ0cylcblx0XHRwYXJ0LnZlcmlmeSgpXG5cdHZlcmlmeU9wKF8ub3BFbHNlKVxufVxuIl19
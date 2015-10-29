(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', '../../CompileError', '../context', '../MsAst', '../util', './context', './locals', './util', './verifyLines'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('../../CompileError'), require('../context'), require('../MsAst'), require('../util'), require('./context'), require('./locals'), require('./util'), require('./verifyLines'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.CompileError, global.context, global.MsAstTypes, global.util, global.context, global.locals, global.util, global.verifyLines);
		global.verify = mod.exports;
	}
})(this, function (exports, module, _CompileError, _context, _MsAst, _util, _context2, _locals, _util2, _verifyLines) {
	'use strict';

	module.exports = verify;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _verifyLines2 = _interopRequireDefault(_verifyLines);

	/**
 Generates information needed during transpiling, the VerifyResults.
 Also checks for existence of local variables and warns for unused locals.
 @param {MsAst} msAst
 */

	function verify(msAst) {
		(0, _context2.setup)();
		msAst.verify();
		(0, _locals.warnUnusedLocals)();
		const res = _context2.results;
		(0, _context2.tearDown)();
		return res;
	}

	(0, _util.implementMany)(_MsAst, 'verify', {
		Assert() {
			this.condition.verify();
			(0, _util2.verifyOp)(this.opThrown);
		},

		AssignSingle() {
			(0, _context2.withName)(this.assignee.name, () => {
				const doV = () => {
					/*
     Fun and Class only get name if they are immediately after the assignment.
     so in `x = $after-time 1000 |` the function is not named.
     */
					if (this.value instanceof _MsAst.Class || this.value instanceof _MsAst.Fun) (0, _util2.setName)(this.value);

					// Assignee registered by verifyLines.
					this.assignee.verify();
					this.value.verify();
				};
				if (this.assignee.isLazy()) (0, _locals.withBlockLocals)(doV);else doV();
			});
		},

		AssignDestructure() {
			// Assignees registered by verifyLines.
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
			(0, _util2.verifyOp)(this.opDo);
			for (const _ of this.statics) _.verify();
			if (this.opConstructor !== null) this.opConstructor.verify(this.opSuperClass !== null);
			for (const _ of this.methods) _.verify();
			// name set by AssignSingle
		},

		ClassDo() {
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

			// name set by AssignSingle
		},

		Ignore() {
			for (const _ of this.ignoredNames) (0, _locals.accessLocal)(this, _);
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

		// Adding LocalDeclares to the available locals is done by Fun or lineNewLocals.
		LocalDeclare() {
			const builtinPath = _context.options.builtinNameToPath.get(this.name);
			if (builtinPath !== undefined) (0, _context.warn)(this.loc, `Local ${ (0, _CompileError.code)(this.name) } overrides builtin from ${ (0, _CompileError.code)(builtinPath) }.`);
			(0, _util2.verifyOp)(this.opType);
		},

		LocalMutate() {
			const declare = (0, _locals.getLocalDeclare)(this.name, this.loc);
			(0, _context.check)(declare.isMutable(), this.loc, () => `${ (0, _CompileError.code)(this.name) } is not mutable.`);
			// TODO: Track mutations. Mutable local must be mutated somewhere.
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
			// No need to verify this.doImports.
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

		Splat() {
			this.splatted.verify();
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

	// Shared implementations

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
		// Since Uses are always in the outermost scope, don't have to worry about shadowing.
		// So we mutate `locals` directly.
		const addUseLocal = _ => {
			const prev = _context2.locals.get(_.name);
			(0, _context.check)(prev === undefined, _.loc, () => `${ (0, _CompileError.code)(_.name) } already imported at ${ prev.loc }`);
			(0, _locals.verifyLocalDeclare)(_);
			(0, _locals.setLocal)(_);
		};
		for (const _ of this.imported) addUseLocal(_);
		(0, _util.opEach)(this.opImportDefault, addUseLocal);
	}

	// Helpers specific to certain MsAst types

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O2tCQW1Cd0IsTUFBTTs7Ozs7Ozs7Ozs7O0FBQWYsVUFBUyxNQUFNLENBQUMsS0FBSyxFQUFFO0FBQ3JDLGdCQWQ2RCxLQUFLLEdBYzNELENBQUE7QUFDUCxPQUFLLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDZCxjQWI2RCxnQkFBZ0IsR0FhM0QsQ0FBQTtBQUNsQixRQUFNLEdBQUcsYUFqQjJDLE9BQU8sQUFpQnhDLENBQUE7QUFDbkIsZ0JBbEJvRSxRQUFRLEdBa0JsRSxDQUFBO0FBQ1YsU0FBTyxHQUFHLENBQUE7RUFDVjs7QUFFRCxXQXZCcUIsYUFBYSxVQXVCUixRQUFRLEVBQUU7QUFDbkMsUUFBTSxHQUFHO0FBQ1IsT0FBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUN2QixjQXBCMkIsUUFBUSxFQW9CMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0dBQ3ZCOztBQUVELGNBQVksR0FBRztBQUNkLGlCQTVCb0MsUUFBUSxFQTRCbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTTtBQUNsQyxVQUFNLEdBQUcsR0FBRyxNQUFNOzs7OztBQUtqQixTQUFJLElBQUksQ0FBQyxLQUFLLG1CQXRDZSxLQUFLLEFBc0NILElBQUksSUFBSSxDQUFDLEtBQUssbUJBckN4QyxHQUFHLEFBcUNvRCxFQUMzRCxXQS9CRyxPQUFPLEVBK0JGLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTs7O0FBR3BCLFNBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDdEIsU0FBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQTtLQUNuQixDQUFBO0FBQ0QsUUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxFQUN6QixZQXhDNEUsZUFBZSxFQXdDM0UsR0FBRyxDQUFDLENBQUEs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QUFDLENBQUMsT0FBTyxFQUNmLENBQUMsSUFBSTtBQUNKLElBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUNWLGVBcGdCRixrQkFBa0IsRUFvZ0JHLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUE7R0FDcEMsRUFDRCxJQUFJLENBQUMsQ0FBQTtFQUNOOztBQUVELFVBQVMsWUFBWSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUU7QUFDbEMsYUF4Z0JnQixVQUFVLEVBd2dCZixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDcEIsZ0JBN2dCZSxVQUFVLEVBNmdCZCxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUE7RUFDdkI7O0FBRUQsVUFBUyxZQUFZLENBQUMsQ0FBQyxFQUFFO0FBQ3hCLEdBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDbkIsT0FBSyxNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxFQUN6QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDZCxhQWhoQjRCLFFBQVEsRUFnaEIzQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUE7RUFDbEIiLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCBvcHRpb25zLCB3YXJufSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0ICogYXMgTXNBc3RUeXBlcyBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7QmxvY2tWYWwsIEJsb2NrVmFsVGhyb3csIENsYXNzLCBDb25zdHJ1Y3Rvcixcblx0Rm9yVmFsLCBGdW4sIEZ1bnMsIFBhdHRlcm4sIFN1cGVyQ2FsbERvfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7Y2F0LCBpZkVsc2UsIGltcGxlbWVudE1hbnksIG9wRWFjaH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7ZnVuS2luZCwgbG9jYWxzLCBtZXRob2QsIG9rVG9Ob3RVc2UsIG9wTG9vcCwgcmVzdWx0cywgc2V0dXAsIHRlYXJEb3duLCB3aXRoSUlGRSxcblx0d2l0aEluRnVuS2luZCwgd2l0aE1ldGhvZCwgd2l0aExvb3AsIHdpdGhOYW1lfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge2FjY2Vzc0xvY2FsLCBnZXRMb2NhbERlY2xhcmUsIGZhaWxNaXNzaW5nTG9jYWwsIHBsdXNMb2NhbHMsIHNldERlY2xhcmVBY2Nlc3NlZCwgc2V0TG9jYWwsXG5cdHZlcmlmeUFuZFBsdXNMb2NhbCwgdmVyaWZ5QW5kUGx1c0xvY2FscywgdmVyaWZ5TG9jYWxEZWNsYXJlLCB3YXJuVW51c2VkTG9jYWxzLCB3aXRoQmxvY2tMb2NhbHNcblx0fSBmcm9tICcuL2xvY2FscydcbmltcG9ydCB7c2V0TmFtZSwgdmVyaWZ5TmFtZSwgdmVyaWZ5T3B9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB2ZXJpZnlMaW5lcyBmcm9tICcuL3ZlcmlmeUxpbmVzJ1xuXG4vKipcbkdlbmVyYXRlcyBpbmZvcm1hdGlvbiBuZWVkZWQgZHVyaW5nIHRyYW5zcGlsaW5nLCB0aGUgVmVyaWZ5UmVzdWx0cy5cbkFsc28gY2hlY2tzIGZvciBleGlzdGVuY2Ugb2YgbG9jYWwgdmFyaWFibGVzIGFuZCB3YXJucyBmb3IgdW51c2VkIGxvY2Fscy5cbkBwYXJhbSB7TXNBc3R9IG1zQXN0XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdmVyaWZ5KG1zQXN0KSB7XG5cdHNldHVwKClcblx0bXNBc3QudmVyaWZ5KClcblx0d2FyblVudXNlZExvY2FscygpXG5cdGNvbnN0IHJlcyA9IHJlc3VsdHNcblx0dGVhckRvd24oKVxuXHRyZXR1cm4gcmVzXG59XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ3ZlcmlmeScsIHtcblx0QXNzZXJ0KCkge1xuXHRcdHRoaXMuY29uZGl0aW9uLnZlcmlmeSgpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFRocm93bilcblx0fSxcblxuXHRBc3NpZ25TaW5nbGUoKSB7XG5cdFx0d2l0aE5hbWUodGhpcy5hc3NpZ25lZS5uYW1lLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBkb1YgPSAoKSA9PiB7XG5cdFx0XHRcdC8qXG5cdFx0XHRcdEZ1biBhbmQgQ2xhc3Mgb25seSBnZXQgbmFtZSBpZiB0aGV5IGFyZSBpbW1lZGlhdGVseSBhZnRlciB0aGUgYXNzaWdubWVudC5cblx0XHRcdFx0c28gaW4gYHggPSAkYWZ0ZXItdGltZSAxMDAwIHxgIHRoZSBmdW5jdGlvbiBpcyBub3QgbmFtZWQuXG5cdFx0XHRcdCovXG5cdFx0XHRcdGlmICh0aGlzLnZhbHVlIGluc3RhbmNlb2YgQ2xhc3MgfHwgdGhpcy52YWx1ZSBpbnN0YW5jZW9mIEZ1bilcblx0XHRcdFx0XHRzZXROYW1lKHRoaXMudmFsdWUpXG5cblx0XHRcdFx0Ly8gQXNzaWduZWUgcmVnaXN0ZXJlZCBieSB2ZXJpZnlMaW5lcy5cblx0XHRcdFx0dGhpcy5hc3NpZ25lZS52ZXJpZnkoKVxuXHRcdFx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy5hc3NpZ25lZS5pc0xhenkoKSlcblx0XHRcdFx0d2l0aEJsb2NrTG9jYWxzKGRvVilcblx0XHRcdGVsc2Vcblx0XHRcdFx0ZG9WKClcblx0XHR9KVxuXHR9LFxuXG5cdEFzc2lnbkRlc3RydWN0dXJlKCkge1xuXHRcdC8vIEFzc2lnbmVlcyByZWdpc3RlcmVkIGJ5IHZlcmlmeUxpbmVzLlxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFzc2lnbmVlcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0QmFnRW50cnk6IHZlcmlmeUJhZ0VudHJ5LFxuXHRCYWdFbnRyeU1hbnk6IHZlcmlmeUJhZ0VudHJ5LFxuXG5cdEJhZ1NpbXBsZSgpIHtcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5wYXJ0cylcblx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHRCbG9ja0RvKCkge1xuXHRcdHZlcmlmeUxpbmVzKHRoaXMubGluZXMpXG5cdH0sXG5cblx0QmxvY2tWYWxUaHJvdygpIHtcblx0XHRjb25zdCBuZXdMb2NhbHMgPSB2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHRcdHBsdXNMb2NhbHMobmV3TG9jYWxzLCAoKSA9PiB0aGlzLnRocm93LnZlcmlmeSgpKVxuXHR9LFxuXG5cdEJsb2NrVmFsUmV0dXJuKCkge1xuXHRcdGNvbnN0IG5ld0xvY2FscyA9IHZlcmlmeUxpbmVzKHRoaXMubGluZXMpXG5cdFx0cGx1c0xvY2FscyhuZXdMb2NhbHMsICgpID0+IHRoaXMucmV0dXJuZWQudmVyaWZ5KCkpXG5cdH0sXG5cblxuXHRCbG9ja09iajogdmVyaWZ5QmxvY2tCdWlsZCxcblx0QmxvY2tCYWc6IHZlcmlmeUJsb2NrQnVpbGQsXG5cdEJsb2NrTWFwOiB2ZXJpZnlCbG9ja0J1aWxkLFxuXG5cdEJsb2NrV3JhcCgpIHtcblx0XHR3aXRoSUlGRSgoKSA9PiB0aGlzLmJsb2NrLnZlcmlmeSgpKVxuXHR9LFxuXG5cdEJyZWFrKCkge1xuXHRcdHZlcmlmeUluTG9vcCh0aGlzKVxuXHRcdGNoZWNrKCEob3BMb29wIGluc3RhbmNlb2YgRm9yVmFsKSwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRgJHtjb2RlKCdmb3InKX0gbXVzdCBicmVhayB3aXRoIGEgdmFsdWUuYClcblx0fSxcblxuXHRCcmVha1dpdGhWYWwoKSB7XG5cdFx0dmVyaWZ5SW5Mb29wKHRoaXMpXG5cdFx0Y2hlY2sob3BMb29wIGluc3RhbmNlb2YgRm9yVmFsLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdGAke2NvZGUoJ2JyZWFrJyl9IG9ubHkgdmFsaWQgaW5zaWRlICR7Y29kZSgnZm9yJyl9YClcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0Q2FsbCgpIHtcblx0XHR0aGlzLmNhbGxlZC52ZXJpZnkoKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0Q2FzZURvKCkge1xuXHRcdHZlcmlmeUNhc2UodGhpcylcblx0fSxcblx0Q2FzZURvUGFydDogdmVyaWZ5Q2FzZVBhcnQsXG5cdENhc2VWYWwoKSB7XG5cdFx0d2l0aElJRkUoKCkgPT4gdmVyaWZ5Q2FzZSh0aGlzKSlcblx0fSxcblx0Q2FzZVZhbFBhcnQ6IHZlcmlmeUNhc2VQYXJ0LFxuXG5cdENhdGNoKCkge1xuXHRcdGNoZWNrKHRoaXMuY2F1Z2h0Lm9wVHlwZSA9PT0gbnVsbCwgdGhpcy5jYXVnaHQubG9jLCAnVE9ETzogQ2F1Z2h0IHR5cGVzJylcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5jYXVnaHQsICgpID0+IHRoaXMuYmxvY2sudmVyaWZ5KCkpXG5cdH0sXG5cblx0Q2xhc3MoKSB7XG5cdFx0dmVyaWZ5T3AodGhpcy5vcFN1cGVyQ2xhc3MpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcERvKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLnN0YXRpY3MpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0aWYgKHRoaXMub3BDb25zdHJ1Y3RvciAhPT0gbnVsbClcblx0XHRcdHRoaXMub3BDb25zdHJ1Y3Rvci52ZXJpZnkodGhpcy5vcFN1cGVyQ2xhc3MgIT09IG51bGwpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMubWV0aG9kcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHQvLyBuYW1lIHNldCBieSBBc3NpZ25TaW5nbGVcblx0fSxcblxuXHRDbGFzc0RvKCkge1xuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmRlY2xhcmVGb2N1cywgKCkgPT4gdGhpcy5ibG9jay52ZXJpZnkoKSlcblx0fSxcblxuXHRDb25kKCkge1xuXHRcdHRoaXMudGVzdC52ZXJpZnkoKVxuXHRcdHRoaXMuaWZUcnVlLnZlcmlmeSgpXG5cdFx0dGhpcy5pZkZhbHNlLnZlcmlmeSgpXG5cdH0sXG5cblx0Q29uZGl0aW9uYWxEbygpIHtcblx0XHR0aGlzLnRlc3QudmVyaWZ5KClcblx0XHR0aGlzLnJlc3VsdC52ZXJpZnkoKVxuXHR9LFxuXHRDb25kaXRpb25hbFZhbCgpIHtcblx0XHR0aGlzLnRlc3QudmVyaWZ5KClcblx0XHR3aXRoSUlGRSgoKSA9PiB0aGlzLnJlc3VsdC52ZXJpZnkoKSlcblx0fSxcblxuXHRDb25zdHJ1Y3RvcihjbGFzc0hhc1N1cGVyKSB7XG5cdFx0b2tUb05vdFVzZS5hZGQodGhpcy5mdW4ub3BEZWNsYXJlVGhpcylcblx0XHR3aXRoTWV0aG9kKHRoaXMsICgpID0+IHsgdGhpcy5mdW4udmVyaWZ5KCkgfSlcblxuXHRcdGNvbnN0IHN1cGVyQ2FsbCA9IHJlc3VsdHMuY29uc3RydWN0b3JUb1N1cGVyLmdldCh0aGlzKVxuXG5cdFx0aWYgKGNsYXNzSGFzU3VwZXIpXG5cdFx0XHRjaGVjayhzdXBlckNhbGwgIT09IHVuZGVmaW5lZCwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRcdGBDb25zdHJ1Y3RvciBtdXN0IGNvbnRhaW4gJHtjb2RlKCdzdXBlciEnKX1gKVxuXHRcdGVsc2Vcblx0XHRcdGNoZWNrKHN1cGVyQ2FsbCA9PT0gdW5kZWZpbmVkLCAoKSA9PiBzdXBlckNhbGwubG9jLCAoKSA9PlxuXHRcdFx0XHRgQ2xhc3MgaGFzIG5vIHN1cGVyY2xhc3MsIHNvICR7Y29kZSgnc3VwZXIhJyl9IGlzIG5vdCBhbGxvd2VkLmApXG5cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5tZW1iZXJBcmdzKVxuXHRcdFx0c2V0RGVjbGFyZUFjY2Vzc2VkKF8sIHRoaXMpXG5cdH0sXG5cblx0RXhjZXB0RG86IHZlcmlmeUV4Y2VwdCxcblx0RXhjZXB0VmFsOiB2ZXJpZnlFeGNlcHQsXG5cblx0Rm9yQmFnKCkge1xuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmJ1aWx0LCAoKSA9PiB2ZXJpZnlGb3IodGhpcykpXG5cdH0sXG5cblx0Rm9yRG8oKSB7XG5cdFx0dmVyaWZ5Rm9yKHRoaXMpXG5cdH0sXG5cblx0Rm9yVmFsKCkge1xuXHRcdHZlcmlmeUZvcih0aGlzKVxuXHR9LFxuXG5cdEZ1bigpIHtcblx0XHRpZiAodGhpcy5vcFJldHVyblR5cGUgIT09IG51bGwpIHtcblx0XHRcdGNoZWNrKHRoaXMuYmxvY2sgaW5zdGFuY2VvZiBCbG9ja1ZhbCwgdGhpcy5sb2MsXG5cdFx0XHRcdCdGdW5jdGlvbiB3aXRoIHJldHVybiB0eXBlIG11c3QgcmV0dXJuIHNvbWV0aGluZy4nKVxuXHRcdFx0aWYgKHRoaXMuYmxvY2sgaW5zdGFuY2VvZiBCbG9ja1ZhbFRocm93KVxuXHRcdFx0XHR3YXJuKCdSZXR1cm4gdHlwZSBpZ25vcmVkIGJlY2F1c2UgdGhlIGJsb2NrIGFsd2F5cyB0aHJvd3MuJylcblx0XHR9XG5cblx0XHR3aXRoQmxvY2tMb2NhbHMoKCkgPT4ge1xuXHRcdFx0d2l0aEluRnVuS2luZCh0aGlzLmtpbmQsICgpID0+XG5cdFx0XHRcdHdpdGhMb29wKG51bGwsICgpID0+IHtcblx0XHRcdFx0XHRjb25zdCBhbGxBcmdzID0gY2F0KHRoaXMub3BEZWNsYXJlVGhpcywgdGhpcy5hcmdzLCB0aGlzLm9wUmVzdEFyZylcblx0XHRcdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKGFsbEFyZ3MsICgpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMuYmxvY2sudmVyaWZ5KClcblx0XHRcdFx0XHRcdHZlcmlmeU9wKHRoaXMub3BSZXR1cm5UeXBlKVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH0pKVxuXHRcdH0pXG5cblx0XHQvLyBuYW1lIHNldCBieSBBc3NpZ25TaW5nbGVcblx0fSxcblxuXHRJZ25vcmUoKSB7XG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuaWdub3JlZE5hbWVzKVxuXHRcdFx0YWNjZXNzTG9jYWwodGhpcywgXylcblx0fSxcblxuXHRMYXp5KCkge1xuXHRcdHdpdGhCbG9ja0xvY2FscygoKSA9PiB0aGlzLnZhbHVlLnZlcmlmeSgpKVxuXHR9LFxuXG5cdExvY2FsQWNjZXNzKCkge1xuXHRcdGNvbnN0IGRlY2xhcmUgPSBsb2NhbHMuZ2V0KHRoaXMubmFtZSlcblx0XHRpZiAoZGVjbGFyZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjb25zdCBidWlsdGluUGF0aCA9IG9wdGlvbnMuYnVpbHRpbk5hbWVUb1BhdGguZ2V0KHRoaXMubmFtZSlcblx0XHRcdGlmIChidWlsdGluUGF0aCA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRmYWlsTWlzc2luZ0xvY2FsKHRoaXMubG9jLCB0aGlzLm5hbWUpXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc3QgbmFtZXMgPSByZXN1bHRzLmJ1aWx0aW5QYXRoVG9OYW1lcy5nZXQoYnVpbHRpblBhdGgpXG5cdFx0XHRcdGlmIChuYW1lcyA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRcdHJlc3VsdHMuYnVpbHRpblBhdGhUb05hbWVzLnNldChidWlsdGluUGF0aCwgbmV3IFNldChbdGhpcy5uYW1lXSkpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRuYW1lcy5hZGQodGhpcy5uYW1lKVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHRzLmxvY2FsQWNjZXNzVG9EZWNsYXJlLnNldCh0aGlzLCBkZWNsYXJlKVxuXHRcdFx0c2V0RGVjbGFyZUFjY2Vzc2VkKGRlY2xhcmUsIHRoaXMpXG5cdFx0fVxuXHR9LFxuXG5cdC8vIEFkZGluZyBMb2NhbERlY2xhcmVzIHRvIHRoZSBhdmFpbGFibGUgbG9jYWxzIGlzIGRvbmUgYnkgRnVuIG9yIGxpbmVOZXdMb2NhbHMuXG5cdExvY2FsRGVjbGFyZSgpIHtcblx0XHRjb25zdCBidWlsdGluUGF0aCA9IG9wdGlvbnMuYnVpbHRpbk5hbWVUb1BhdGguZ2V0KHRoaXMubmFtZSlcblx0XHRpZiAoYnVpbHRpblBhdGggIT09IHVuZGVmaW5lZClcblx0XHRcdHdhcm4odGhpcy5sb2MsIGBMb2NhbCAke2NvZGUodGhpcy5uYW1lKX0gb3ZlcnJpZGVzIGJ1aWx0aW4gZnJvbSAke2NvZGUoYnVpbHRpblBhdGgpfS5gKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BUeXBlKVxuXHR9LFxuXG5cdExvY2FsTXV0YXRlKCkge1xuXHRcdGNvbnN0IGRlY2xhcmUgPSBnZXRMb2NhbERlY2xhcmUodGhpcy5uYW1lLCB0aGlzLmxvYylcblx0XHRjaGVjayhkZWNsYXJlLmlzTXV0YWJsZSgpLCB0aGlzLmxvYywgKCkgPT4gYCR7Y29kZSh0aGlzLm5hbWUpfSBpcyBub3QgbXV0YWJsZS5gKVxuXHRcdC8vIFRPRE86IFRyYWNrIG11dGF0aW9ucy4gTXV0YWJsZSBsb2NhbCBtdXN0IGJlIG11dGF0ZWQgc29tZXdoZXJlLlxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0fSxcblxuXHRMb2dpYygpIHtcblx0XHRjaGVjayh0aGlzLmFyZ3MubGVuZ3RoID4gMSwgJ0xvZ2ljIGV4cHJlc3Npb24gbmVlZHMgYXQgbGVhc3QgMiBhcmd1bWVudHMuJylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hcmdzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHR9LFxuXG5cdE5vdCgpIHtcblx0XHR0aGlzLmFyZy52ZXJpZnkoKVxuXHR9LFxuXG5cdE51bWJlckxpdGVyYWwoKSB7IH0sXG5cblx0TWFwRW50cnkoKSB7XG5cdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR0aGlzLmtleS52ZXJpZnkoKVxuXHRcdHRoaXMudmFsLnZlcmlmeSgpXG5cdH0sXG5cblx0TWVtYmVyKCkge1xuXHRcdHRoaXMub2JqZWN0LnZlcmlmeSgpXG5cdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdH0sXG5cblx0TWVtYmVyRnVuKCkge1xuXHRcdHZlcmlmeU9wKHRoaXMub3BPYmplY3QpXG5cdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdH0sXG5cblx0TWVtYmVyU2V0KCkge1xuXHRcdHRoaXMub2JqZWN0LnZlcmlmeSgpXG5cdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFR5cGUpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdE1ldGhvZEltcGwoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kKHRoaXMsICgpID0+IHtcblx0XHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZnVuLm9wRGVjbGFyZVRoaXMpXG5cdFx0XHR0aGlzLmZ1bi52ZXJpZnkoKVxuXHRcdH0pXG5cdH0sXG5cdE1ldGhvZEdldHRlcigpIHtcblx0XHR2ZXJpZnlNZXRob2QodGhpcywgKCkgPT4ge1xuXHRcdFx0b2tUb05vdFVzZS5hZGQodGhpcy5kZWNsYXJlVGhpcylcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoW3RoaXMuZGVjbGFyZVRoaXNdLCAoKSA9PiB7IHRoaXMuYmxvY2sudmVyaWZ5KCkgfSlcblx0XHR9KVxuXHR9LFxuXHRNZXRob2RTZXR0ZXIoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kKHRoaXMsICgpID0+IHtcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoW3RoaXMuZGVjbGFyZVRoaXMsIHRoaXMuZGVjbGFyZUZvY3VzXSwgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeSgpXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH0sXG5cblx0TW9kdWxlKCkge1xuXHRcdC8vIE5vIG5lZWQgdG8gdmVyaWZ5IHRoaXMuZG9JbXBvcnRzLlxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmltcG9ydHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcEltcG9ydEdsb2JhbClcblxuXHRcdHdpdGhOYW1lKG9wdGlvbnMubW9kdWxlTmFtZSgpLCAoKSA9PiB7XG5cdFx0XHR2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHRcdH0pXG5cdH0sXG5cblx0TW9kdWxlRXhwb3J0KCkge1xuXHRcdHRoaXMuYXNzaWduLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXNzaWduLmFsbEFzc2lnbmVlcygpKVxuXHRcdFx0c2V0RGVjbGFyZUFjY2Vzc2VkKF8sIHRoaXMpXG5cdH0sXG5cblx0TmV3KCkge1xuXHRcdHRoaXMudHlwZS52ZXJpZnkoKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0T2JqRW50cnlBc3NpZ24oKSB7XG5cdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR0aGlzLmFzc2lnbi52ZXJpZnkoKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFzc2lnbi5hbGxBc3NpZ25lZXMoKSlcblx0XHRcdHNldERlY2xhcmVBY2Nlc3NlZChfLCB0aGlzKVxuXHR9LFxuXG5cdE9iakVudHJ5UGxhaW4oKSB7XG5cdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0T2JqU2ltcGxlKCkge1xuXHRcdGNvbnN0IGtleXMgPSBuZXcgU2V0KClcblx0XHRmb3IgKGNvbnN0IHBhaXIgb2YgdGhpcy5wYWlycykge1xuXHRcdFx0Y29uc3Qge2tleSwgdmFsdWV9ID0gcGFpclxuXHRcdFx0Y2hlY2soIWtleXMuaGFzKGtleSksIHBhaXIubG9jLCAoKSA9PiBgRHVwbGljYXRlIGtleSAke2tleX1gKVxuXHRcdFx0a2V5cy5hZGQoa2V5KVxuXHRcdFx0dmFsdWUudmVyaWZ5KClcblx0XHR9XG5cdH0sXG5cblx0UXVvdGVQbGFpbigpIHtcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5wYXJ0cylcblx0XHRcdHZlcmlmeU5hbWUoXylcblx0fSxcblxuXHRRdW90ZVNpbXBsZSgpIHt9LFxuXG5cdFF1b3RlVGFnZ2VkVGVtcGxhdGUoKSB7XG5cdFx0dGhpcy50YWcudmVyaWZ5KClcblx0XHR0aGlzLnF1b3RlLnZlcmlmeSgpXG5cdH0sXG5cblx0UmFuZ2UoKSB7XG5cdFx0dGhpcy5zdGFydC52ZXJpZnkoKVxuXHRcdHZlcmlmeU9wKHRoaXMuZW5kKVxuXHR9LFxuXG5cdFNldFN1YigpIHtcblx0XHR0aGlzLm9iamVjdC52ZXJpZnkoKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLnN1YmJlZHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFR5cGUpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdFNwZWNpYWxEbygpIHsgfSxcblxuXHRTcGVjaWFsVmFsKCkge1xuXHRcdHNldE5hbWUodGhpcylcblx0fSxcblxuXHRTcGxhdCgpIHtcblx0XHR0aGlzLnNwbGF0dGVkLnZlcmlmeSgpXG5cdH0sXG5cblx0U3VwZXJDYWxsOiB2ZXJpZnlTdXBlckNhbGwsXG5cdFN1cGVyQ2FsbERvOiB2ZXJpZnlTdXBlckNhbGwsXG5cdFN1cGVyTWVtYmVyKCkge1xuXHRcdGNoZWNrKG1ldGhvZCAhPT0gbnVsbCwgdGhpcy5sb2MsICdNdXN0IGJlIGluIG1ldGhvZC4nKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdFN3aXRjaERvKCkge1xuXHRcdHZlcmlmeVN3aXRjaCh0aGlzKVxuXHR9LFxuXHRTd2l0Y2hEb1BhcnQ6IHZlcmlmeVN3aXRjaFBhcnQsXG5cdFN3aXRjaFZhbCgpIHtcblx0XHR3aXRoSUlGRSgoKSA9PiB2ZXJpZnlTd2l0Y2godGhpcykpXG5cdH0sXG5cdFN3aXRjaFZhbFBhcnQ6IHZlcmlmeVN3aXRjaFBhcnQsXG5cblx0VGhyb3coKSB7XG5cdFx0dmVyaWZ5T3AodGhpcy5vcFRocm93bilcblx0fSxcblxuXHRJbXBvcnQ6IHZlcmlmeUltcG9ydCxcblx0SW1wb3J0R2xvYmFsOiB2ZXJpZnlJbXBvcnQsXG5cblx0V2l0aCgpIHtcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdFx0d2l0aElJRkUoKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuZGVjbGFyZS5uYW1lID09PSAnXycpXG5cdFx0XHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZGVjbGFyZSlcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmRlY2xhcmUsICgpID0+IHsgdGhpcy5ibG9jay52ZXJpZnkoKSB9KVxuXHRcdH0pXG5cdH0sXG5cblx0WWllbGQoKSB7XG5cdFx0Y2hlY2soZnVuS2luZCAhPT0gRnVucy5QbGFpbiwgYENhbm5vdCAke2NvZGUoJzx+Jyl9IG91dHNpZGUgb2YgYXN5bmMvZ2VuZXJhdG9yLmApXG5cdFx0aWYgKGZ1bktpbmQgPT09IEZ1bnMuQXN5bmMpXG5cdFx0XHRjaGVjayh0aGlzLm9wWWllbGRlZCAhPT0gbnVsbCwgdGhpcy5sb2MsICdDYW5ub3QgYXdhaXQgbm90aGluZy4nKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BZaWVsZGVkKVxuXHR9LFxuXG5cdFlpZWxkVG8oKSB7XG5cdFx0Y2hlY2soZnVuS2luZCA9PT0gRnVucy5HZW5lcmF0b3IsIHRoaXMubG9jLCBgQ2Fubm90ICR7Y29kZSgnPH5+Jyl9IG91dHNpZGUgb2YgZ2VuZXJhdG9yLmApXG5cdFx0dGhpcy55aWVsZGVkVG8udmVyaWZ5KClcblx0fVxufSlcblxuLy8gU2hhcmVkIGltcGxlbWVudGF0aW9uc1xuXG5mdW5jdGlvbiB2ZXJpZnlCYWdFbnRyeSgpIHtcblx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0dGhpcy52YWx1ZS52ZXJpZnkoKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlCbG9ja0J1aWxkKCkge1xuXHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5idWlsdCwgKCkgPT4ge1xuXHRcdHZlcmlmeUxpbmVzKHRoaXMubGluZXMpXG5cdH0pXG59XG5cbmZ1bmN0aW9uIHZlcmlmeUNhc2VQYXJ0KCkge1xuXHRpZiAodGhpcy50ZXN0IGluc3RhbmNlb2YgUGF0dGVybikge1xuXHRcdHRoaXMudGVzdC50eXBlLnZlcmlmeSgpXG5cdFx0dGhpcy50ZXN0LnBhdHRlcm5lZC52ZXJpZnkoKVxuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbHModGhpcy50ZXN0LmxvY2FscywgKCkgPT4gdGhpcy5yZXN1bHQudmVyaWZ5KCkpXG5cdH0gZWxzZSB7XG5cdFx0dGhpcy50ZXN0LnZlcmlmeSgpXG5cdFx0dGhpcy5yZXN1bHQudmVyaWZ5KClcblx0fVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlTd2l0Y2hQYXJ0KCkge1xuXHRmb3IgKGNvbnN0IF8gb2YgdGhpcy52YWx1ZXMpXG5cdFx0Xy52ZXJpZnkoKVxuXHR0aGlzLnJlc3VsdC52ZXJpZnkoKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlFeGNlcHQoKSB7XG5cdHRoaXMudHJ5LnZlcmlmeSgpXG5cdHZlcmlmeU9wKHRoaXMuY2F0Y2gpXG5cdHZlcmlmeU9wKHRoaXMuZmluYWxseSlcbn1cblxuZnVuY3Rpb24gdmVyaWZ5U3VwZXJDYWxsKCkge1xuXHRjaGVjayhtZXRob2QgIT09IG51bGwsIHRoaXMubG9jLCAnTXVzdCBiZSBpbiBhIG1ldGhvZC4nKVxuXHRyZXN1bHRzLnN1cGVyQ2FsbFRvTWV0aG9kLnNldCh0aGlzLCBtZXRob2QpXG5cblx0aWYgKG1ldGhvZCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB7XG5cdFx0Y2hlY2sodGhpcyBpbnN0YW5jZW9mIFN1cGVyQ2FsbERvLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdGAke2NvZGUoJ3N1cGVyJyl9IG5vdCBzdXBwb3J0ZWQgaW4gY29uc3RydWN0b3I7IHVzZSAke2NvZGUoJ3N1cGVyIScpfWApXG5cdFx0cmVzdWx0cy5jb25zdHJ1Y3RvclRvU3VwZXIuc2V0KG1ldGhvZCwgdGhpcylcblx0fVxuXG5cdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0Xy52ZXJpZnkoKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlJbXBvcnQoKSB7XG5cdC8vIFNpbmNlIFVzZXMgYXJlIGFsd2F5cyBpbiB0aGUgb3V0ZXJtb3N0IHNjb3BlLCBkb24ndCBoYXZlIHRvIHdvcnJ5IGFib3V0IHNoYWRvd2luZy5cblx0Ly8gU28gd2UgbXV0YXRlIGBsb2NhbHNgIGRpcmVjdGx5LlxuXHRjb25zdCBhZGRVc2VMb2NhbCA9IF8gPT4ge1xuXHRcdGNvbnN0IHByZXYgPSBsb2NhbHMuZ2V0KF8ubmFtZSlcblx0XHRjaGVjayhwcmV2ID09PSB1bmRlZmluZWQsIF8ubG9jLCAoKSA9PlxuXHRcdFx0YCR7Y29kZShfLm5hbWUpfSBhbHJlYWR5IGltcG9ydGVkIGF0ICR7cHJldi5sb2N9YClcblx0XHR2ZXJpZnlMb2NhbERlY2xhcmUoXylcblx0XHRzZXRMb2NhbChfKVxuXHR9XG5cdGZvciAoY29uc3QgXyBvZiB0aGlzLmltcG9ydGVkKVxuXHRcdGFkZFVzZUxvY2FsKF8pXG5cdG9wRWFjaCh0aGlzLm9wSW1wb3J0RGVmYXVsdCwgYWRkVXNlTG9jYWwpXG59XG5cbi8vIEhlbHBlcnMgc3BlY2lmaWMgdG8gY2VydGFpbiBNc0FzdCB0eXBlc1xuXG5mdW5jdGlvbiB2ZXJpZnlGb3IoZm9yTG9vcCkge1xuXHRjb25zdCB2ZXJpZnlCbG9jayA9ICgpID0+IHdpdGhMb29wKGZvckxvb3AsICgpID0+IGZvckxvb3AuYmxvY2sudmVyaWZ5KCkpXG5cdGlmRWxzZShmb3JMb29wLm9wSXRlcmF0ZWUsXG5cdFx0KHtlbGVtZW50LCBiYWd9KSA9PiB7XG5cdFx0XHRiYWcudmVyaWZ5KClcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbChlbGVtZW50LCB2ZXJpZnlCbG9jaylcblx0XHR9LFxuXHRcdHZlcmlmeUJsb2NrKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlJbkxvb3AobG9vcFVzZXIpIHtcblx0Y2hlY2sob3BMb29wICE9PSBudWxsLCBsb29wVXNlci5sb2MsICdOb3QgaW4gYSBsb29wLicpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeUNhc2UoXykge1xuXHRjb25zdCBkb0l0ID0gKCkgPT4ge1xuXHRcdGZvciAoY29uc3QgcGFydCBvZiBfLnBhcnRzKVxuXHRcdFx0cGFydC52ZXJpZnkoKVxuXHRcdHZlcmlmeU9wKF8ub3BFbHNlKVxuXHR9XG5cdGlmRWxzZShfLm9wQ2FzZWQsXG5cdFx0XyA9PiB7XG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwoXy5hc3NpZ25lZSwgZG9JdClcblx0XHR9LFxuXHRcdGRvSXQpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeU1ldGhvZChfLCBkb1ZlcmlmeSkge1xuXHR2ZXJpZnlOYW1lKF8uc3ltYm9sKVxuXHR3aXRoTWV0aG9kKF8sIGRvVmVyaWZ5KVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlTd2l0Y2goXykge1xuXHRfLnN3aXRjaGVkLnZlcmlmeSgpXG5cdGZvciAoY29uc3QgcGFydCBvZiBfLnBhcnRzKVxuXHRcdHBhcnQudmVyaWZ5KClcblx0dmVyaWZ5T3AoXy5vcEVsc2UpXG59XG4iXX0=
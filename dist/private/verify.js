if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../CompileError', './MsAst', './util', './VerifyResults'], function (exports, module, _CompileError, _MsAst, _util, _VerifyResults) {
	'use strict';

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _VerifyResults2 = _interopRequireDefault(_VerifyResults);

	/*
 The verifier generates information needed during transpiling, the VerifyResults.
 */

	module.exports = (_context, msAst) => {
		context = _context;
		locals = new Map();
		pendingBlockLocals = [];
		isInDebug = isInGenerator = false;
		okToNotUse = new Set();
		opLoop = null;
		results = new _VerifyResults2.default();

		msAst.verify();
		verifyLocalUse();

		const res = results;
		// Release for garbage collection.
		context = locals = okToNotUse = opLoop = pendingBlockLocals = results = undefined;
		return res;
	};

	// Use a trick like in parse.js and have everything close over these mutable variables.
	let context,
	// Map from names to LocalDeclares.
	locals,
	// Locals that don't have to be accessed.
	okToNotUse, opLoop,
	/*
 Locals for this block.
 These are added to locals when entering a Function or lazy evaluation.
 In:
 	a = |
 		b
 	b = 1
 `b` will be a pending local.
 However:
 	a = b
 	b = 1
 will fail to verify, because `b` comes after `a` and is not accessed inside a function.
 It would work for `~a is b`, though.
 */
	pendingBlockLocals, isInDebug,
	// Whether we are currently able to yield.
	isInGenerator, results;

	const verifyOpEach = op => {
		if (op !== null) op.verify();
	},
	      deleteLocal = localDeclare => locals.delete(localDeclare.name),
	      setLocal = localDeclare => locals.set(localDeclare.name, localDeclare),
	     

	// When a local is returned from a BlockObj or Module,
	// the return 'access' is considered to be 'debug' if the local is.
	accessLocalForReturn = (declare, access) => {
		const info = results.localDeclareToInfo.get(declare);
		_addLocalAccess(info, access, info.isInDebug);
	},
	      accessLocal = (access, name) => {
		const declare = getLocalDeclare(name, access.loc);
		results.localAccessToDeclare.set(access, declare);
		_addLocalAccess(results.localDeclareToInfo.get(declare), access, isInDebug);
	},
	      _addLocalAccess = (localInfo, access, isDebugAccess) => (isDebugAccess ? localInfo.debugAccesses : localInfo.nonDebugAccesses).push(access),
	     

	// For expressions affecting lineNewLocals, they will be registered before being verified.
	// So, LocalDeclare.verify just the type.
	// For locals not affecting lineNewLocals, use this instead of just declare.verify()
	verifyLocalDeclare = localDeclare => {
		registerLocal(localDeclare);
		localDeclare.verify();
	},
	      registerLocal = localDeclare => results.localDeclareToInfo.set(localDeclare, _VerifyResults.LocalInfo.empty(isInDebug));

	// These functions change verifier state and efficiently return to the old state when finished.
	const withInDebug = action => {
		const oldIsInDebug = isInDebug;
		isInDebug = true;
		action();
		isInDebug = oldIsInDebug;
	},
	      withInGenerator = (newIsInGenerator, action) => {
		const oldIsInGenerator = isInGenerator;
		isInGenerator = newIsInGenerator;
		action();
		isInGenerator = oldIsInGenerator;
	},
	      withInLoop = (newLoop, action) => {
		const oldLoop = opLoop;
		opLoop = newLoop;
		action();
		opLoop = oldLoop;
	},
	      plusLocal = (addedLocal, action) => {
		const shadowed = locals.get(addedLocal.name);
		locals.set(addedLocal.name, addedLocal);
		action();
		if (shadowed === undefined) deleteLocal(addedLocal);else setLocal(shadowed);
	},
	     

	// Should have verified that addedLocals all have different names.
	plusLocals = (addedLocals, action) => {
		const shadowedLocals = [];
		for (const _ of addedLocals) {
			const shadowed = locals.get(_.name);
			if (shadowed !== undefined) shadowedLocals.push(shadowed);
			setLocal(_);
		}

		action();

		addedLocals.forEach(deleteLocal);
		shadowedLocals.forEach(setLocal);
	},
	      verifyAndPlusLocal = (addedLocal, action) => {
		verifyLocalDeclare(addedLocal);
		plusLocal(addedLocal, action);
	},
	      verifyAndPlusLocals = (addedLocals, action) => {
		addedLocals.forEach(verifyLocalDeclare);
		const names = new Set();
		for (const _ of addedLocals) {
			context.check(!names.has(_.name), _.loc, () => `Duplicate local ${ (0, _CompileError.code)(_.name) }`);
			names.add(_.name);
		}
		plusLocals(addedLocals, action);
	},
	      withBlockLocals = action => {
		const oldPendingBlockLocals = pendingBlockLocals;
		pendingBlockLocals = [];
		plusLocals(oldPendingBlockLocals, action);
		pendingBlockLocals = oldPendingBlockLocals;
	},
	     

	// Can't break out of loop inside of IIFE.
	withIIFE = action => {
		withInLoop(false, action);
	};

	const verifyLocalUse = () => results.localDeclareToInfo.forEach((info, local) => {
		if (!(local instanceof _MsAst.LocalDeclareBuilt || local instanceof _MsAst.LocalDeclareRes)) {
			const noNonDebug = (0, _util.isEmpty)(info.nonDebugAccesses);
			if (noNonDebug && (0, _util.isEmpty)(info.debugAccesses)) context.warnIf(!okToNotUse.has(local), local.loc, () => `Unused local variable ${ (0, _CompileError.code)(local.name) }.`);else if (info.isInDebug) context.warnIf(!noNonDebug, () => (0, _util.head)(info.nonDebugAccesses).loc, () => `Debug-only local ${ (0, _CompileError.code)(local.name) } used outside of debug.`);else context.warnIf(noNonDebug, local.loc, () => `Local ${ (0, _CompileError.code)(local.name) } used only in debug.`);
		}
	});

	(0, _util.implementMany)(_MsAst, 'verify', {
		Assert() {
			this.condition.verify();
			verifyOpEach(this.opThrown);
		},

		AssignSingle() {
			const doV = () => {
				// Assignee registered by verifyLines.
				this.assignee.verify();
				this.value.verify();
			};
			if (this.assignee.isLazy()) withBlockLocals(doV);else doV();
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
			verifyLines(this.lines);
		},

		BlockValThrow() {
			const newLocals = verifyLines(this.lines);
			plusLocals(newLocals, () => this.throw.verify());
		},

		BlockWithReturn() {
			const newLocals = verifyLines(this.lines);
			plusLocals(newLocals, () => this.returned.verify());
		},

		BlockObj() {
			verifyAndPlusLocal(this.built, () => {
				const newLocals = verifyLines(this.lines);
				(0, _util.opEach)(this.opObjed, _ => plusLocals(newLocals, () => _.verify()));
			});
		},

		BlockBag: verifyBlockBagOrMap,
		BlockMap: verifyBlockBagOrMap,

		BlockWrap() {
			withIIFE(() => this.block.verify());
		},

		Break() {
			verifyInLoop(this);
			context.check(!(opLoop instanceof _MsAst.ForVal), this.loc, () => `${ (0, _CompileError.code)('for') } must break with a value.`);
		},

		BreakWithVal() {
			verifyInLoop(this);
			context.check(opLoop instanceof _MsAst.ForVal, this.loc, () => `${ (0, _CompileError.code)('break') } only valid inside ${ (0, _CompileError.code)('for') }`);
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
			withIIFE(() => verifyCase(this));
		},
		CaseValPart: verifyCasePart,

		Catch() {
			context.check(this.caught.opType === null, this.caught.loc, 'TODO: Caught types');
			verifyAndPlusLocal(this.caught, () => this.block.verify());
		},

		Class() {
			verifyOpEach(this.opSuperClass);
			verifyOpEach(this.opDo);
			for (const _ of this.statics) _.verify();
			verifyOpEach(this.opConstructor);
			for (const _ of this.methods) _.verify();
		},

		ClassDo() {
			verifyAndPlusLocal(this.declareFocus, () => this.block.verify());
		},

		ConditionalDo() {
			this.test.verify();
			this.result.verify();
		},
		ConditionalVal() {
			this.test.verify();
			withIIFE(() => this.result.verify());
		},

		// Only reach here for in/out condition.
		Debug() {
			verifyLines([this]);
		},

		ExceptDo: verifyExcept,
		ExceptVal: verifyExcept,

		ForBag() {
			verifyAndPlusLocal(this.built, () => verifyFor(this));
		},

		ForDo() {
			verifyFor(this);
		},

		ForVal() {
			verifyFor(this);
		},

		// isForMethodImpl is set if this is a MethodImpl's implementation.
		Fun(isForMethodImpl) {
			withBlockLocals(() => {
				context.check(this.opDeclareRes === null || this.block instanceof _MsAst.BlockVal, this.loc, 'Function with return condition must return something.');
				withInGenerator(this.isGenerator, () => withInLoop(false, () => {
					const allArgs = (0, _util.cat)(this.opDeclareThis, this.args, this.opRestArg);
					if (isForMethodImpl) okToNotUse.add(this.opDeclareThis);
					verifyAndPlusLocals(allArgs, () => {
						verifyOpEach(this.opIn);
						this.block.verify();
						(0, _util.opEach)(this.opDeclareRes, verifyLocalDeclare);
						const verifyOut = () => verifyOpEach(this.opOut);
						(0, _util.ifElse)(this.opDeclareRes, _ => plusLocal(_, verifyOut), verifyOut);
					});
				}));
			});
		},

		GlobalAccess() {},

		Ignore() {
			for (const _ of this.ignored) accessLocal(this, _);
		},

		Lazy() {
			withBlockLocals(() => this.value.verify());
		},

		LocalAccess() {
			accessLocal(this, this.name);
		},

		// Adding LocalDeclares to the available locals is done by Fun or lineNewLocals.
		LocalDeclare() {
			verifyOpEach(this.opType);
		},

		LocalMutate() {
			const declare = getLocalDeclare(this.name, this.loc);
			context.check(declare.isMutable(), this.loc, () => `${ (0, _CompileError.code)(this.name) } is not mutable.`);
			// TODO: Track mutations. Mutable local must be mutated somewhere.
			this.value.verify();
		},

		Logic() {
			context.check(this.args.length > 1, 'Logic expression needs at least 2 arguments.');
			for (const _ of this.args) _.verify();
		},

		Not() {
			this.arg.verify();
		},

		NumberLiteral() {},

		MapEntry() {
			accessLocal(this, 'built');
			this.key.verify();
			this.val.verify();
		},

		Member() {
			this.object.verify();
		},

		MemberSet() {
			this.object.verify();
			this.value.verify();
		},

		MethodImpl() {
			if (typeof this.symbol !== 'string') this.symbol.verify();
			this.fun.verify(true);
		},

		Module() {
			// No need to verify this.doUses.
			for (const _ of this.uses) _.verify();
			withInDebug(() => {
				for (const _ of this.debugUses) _.verify();
			});
			const newLocals = verifyLines(this.lines);
			for (const _ of this.exports) accessLocalForReturn(_, this);
			(0, _util.opEach)(this.opDefaultExport, _ => plusLocals(newLocals, () => _.verify()));

			const exports = new Set(this.exports);
			const markExportLines = line => {
				if (line instanceof _MsAst.Assign && line.allAssignees().some(_ => exports.has(_))) results.exportAssigns.add(line);else if (line instanceof _MsAst.Debug) line.lines.forEach(markExportLines);
			};
			this.lines.forEach(markExportLines);
		},

		New() {
			this.type.verify();
			for (const _ of this.args) _.verify();
		},

		ObjEntry() {
			accessLocal(this, 'built');
			this.assign.verify();
			for (const _ of this.assign.allAssignees()) accessLocal(this, _.name);
		},

		ObjSimple() {
			const keys = new Set();
			for (const pair of this.pairs) {
				const key = pair.key;
				const value = pair.value;

				context.check(!keys.has(key), pair.loc, () => `Duplicate key ${ key }`);
				keys.add(key);
				value.verify();
			}
		},

		Quote() {
			for (const _ of this.parts) if (typeof _ !== 'string') _.verify();
		},

		QuoteTemplate() {
			this.tag.verify();
			this.quote.verify();
		},

		SpecialDo() {},

		SpecialVal() {},

		Splat() {
			this.splatted.verify();
		},

		SwitchDo() {
			verifySwitch(this);
		},
		SwitchDoPart: verifySwitchPart,
		SwitchVal() {
			withIIFE(() => verifySwitch(this));
		},
		SwitchValPart: verifySwitchPart,

		Throw() {
			verifyOpEach(this.opThrown);
		},

		Use() {
			// Since Uses are always in the outermost scope, don't have to worry about shadowing.
			// So we mutate `locals` directly.
			const addUseLocal = _ => {
				const prev = locals.get(_.name);
				context.check(prev === undefined, _.loc, () => `${ (0, _CompileError.code)(_.name) } already imported at ${ prev.loc }`);
				verifyLocalDeclare(_);
				setLocal(_);
			};
			this.used.forEach(addUseLocal);
			(0, _util.opEach)(this.opUseDefault, addUseLocal);
		},

		With() {
			this.value.verify();
			withIIFE(() => {
				if (this.declare instanceof _MsAst.LocalDeclareFocus) okToNotUse.add(this.declare);
				verifyAndPlusLocal(this.declare, () => {
					this.block.verify();
				});
			});
		},

		Yield() {
			context.check(isInGenerator, this.loc, 'Cannot yield outside of generator context');
			verifyOpEach(this.opYielded);
		},

		YieldTo() {
			context.check(isInGenerator, this.loc, 'Cannot yield outside of generator context');
			this.yieldedTo.verify();
		}
	});

	function verifyBagEntry() {
		accessLocal(this, 'built');
		this.value.verify();
	}

	function verifyBlockBagOrMap() {
		verifyAndPlusLocal(this.built, () => verifyLines(this.lines));
	}

	function verifyCasePart() {
		if (this.test instanceof _MsAst.Pattern) {
			this.test.type.verify();
			this.test.patterned.verify();
			verifyAndPlusLocals(this.test.locals, () => this.result.verify());
		} else {
			this.test.verify();
			this.result.verify();
		}
	}

	function verifySwitchPart() {
		this.value.verify();
		this.result.verify();
	}

	function verifyExcept() {
		this._try.verify();
		verifyOpEach(this._catch);
		verifyOpEach(this._finally);
	}

	// Helpers specific to certain MsAst types:
	const verifyFor = forLoop => {
		const verifyBlock = () => withInLoop(forLoop, () => forLoop.block.verify());
		(0, _util.ifElse)(forLoop.opIteratee, _ref => {
			let element = _ref.element;
			let bag = _ref.bag;

			bag.verify();
			verifyAndPlusLocal(element, verifyBlock);
		}, verifyBlock);
	},
	      verifyInLoop = loopUser => context.check(opLoop !== null, loopUser.loc, 'Not in a loop.'),
	      verifyCase = _ => {
		const doIt = () => {
			for (const part of _.parts) part.verify();
			verifyOpEach(_.opElse);
		};
		(0, _util.ifElse)(_.opCased, _ => {
			_.verify();
			verifyAndPlusLocal(_.assignee, doIt);
		}, doIt);
	},
	      verifySwitch = _ => {
		_.switched.verify();
		for (const part of _.parts) part.verify();
		verifyOpEach(_.opElse);
	};

	// General utilities:
	const getLocalDeclare = (name, accessLoc) => {
		const declare = locals.get(name);
		context.check(declare !== undefined, accessLoc, () => {
			const showLocals = (0, _CompileError.code)((0, _util.iteratorToArray)(locals.keys()).join(' '));
			return `No such local ${ (0, _CompileError.code)(name) }.\nLocals are:\n${ showLocals }.`;
		});
		return declare;
	},
	      lineNewLocals = line => line instanceof _MsAst.AssignSingle ? [line.assignee] : line instanceof _MsAst.AssignDestructure ? line.assignees : line instanceof _MsAst.ObjEntry ? lineNewLocals(line.assign) : [],
	      verifyLines = lines => {
		/*
  We need to bet all block locals up-front because
  Functions within lines can access locals from later lines.
  NOTE: We push these onto pendingBlockLocals in reverse
  so that when we iterate through lines forwards, we can pop from pendingBlockLocals
  to remove pending locals as they become real locals.
  It doesn't really matter what order we add locals in since it's not allowed
  to have two locals of the same name in the same block.
  */
		const newLocals = [];

		const getLineLocals = line => {
			if (line instanceof _MsAst.Debug) withInDebug(() => (0, _util.eachReverse)(line.lines, getLineLocals));else (0, _util.eachReverse)(lineNewLocals(line), _ => {
				// Register the local now. Can't wait until the assign is verified.
				registerLocal(_);
				newLocals.push(_);
			});
		};
		(0, _util.eachReverse)(lines, getLineLocals);
		pendingBlockLocals.push(...newLocals);

		/*
  Keeps track of locals which have already been added in this block.
  Mason allows shadowing, but not within the same block.
  So, this is allowed:
  	a = 1
  	b =
  		a = 2
  		...
  But not:
  	a = 1
  	a = 2
  */
		const thisBlockLocalNames = new Set();

		// All shadowed locals for this block.
		const shadowed = [];

		const verifyLine = line => {
			if (line instanceof _MsAst.Debug)
				// TODO: Do anything in this situation?
				// context.check(!inDebug, line.loc, 'Redundant `debug`.')
				withInDebug(() => line.lines.forEach(verifyLine));else {
				verifyIsStatement(line);
				for (const newLocal of lineNewLocals(line)) {
					const name = newLocal.name;
					const oldLocal = locals.get(name);
					if (oldLocal !== undefined) {
						context.check(!thisBlockLocalNames.has(name), newLocal.loc, () => `A local ${ (0, _CompileError.code)(name) } is already in this block.`);
						shadowed.push(oldLocal);
					}
					thisBlockLocalNames.add(name);
					setLocal(newLocal);

					// Now that it's added as a local, it's no longer pending.
					// We added pendingBlockLocals in the right order that we can just pop them off.
					const popped = pendingBlockLocals.pop();
					(0, _util.assert)(popped === newLocal);
				}
				line.verify();
			}
		};

		lines.forEach(verifyLine);

		newLocals.forEach(deleteLocal);
		shadowed.forEach(setLocal);

		return newLocals;
	},
	      verifyIsStatement = line => {
		const isStatement = line instanceof _MsAst.Do ||
		// Some values are also acceptable.
		line instanceof _MsAst.Call || line instanceof _MsAst.Yield || line instanceof _MsAst.YieldTo;
		context.check(isStatement, line.loc, 'Expression in statement position.');
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZlcmlmeS5qcyIsInByaXZhdGUvdmVyaWZ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztrQkNZZSxDQUFDLFFBQVEsRUFBRSxLQUFLLEtBQUs7QUFDbkMsU0FBTyxHQUFHLFFBQVEsQ0FBQTtBQUNsQixRQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUNsQixvQkFBa0IsR0FBRyxFQUFHLENBQUE7QUFDeEIsV0FBUyxHQUFHLGFBQWEsR0FBRyxLQUFLLENBQUE7QUFDakMsWUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDdEIsUUFBTSxHQUFHLElBQUksQ0FBQTtBQUNiLFNBQU8sR0FBRyw2QkFBbUIsQ0FBQTs7QUFFN0IsT0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBQ2QsZ0JBQWMsRUFBRSxDQUFBOztBQUVoQixRQUFNLEdBQUcsR0FBRyxPQUFPLENBQUE7O0FBRW5CLFNBQU8sR0FBRyxNQUFNLEdBQUcsVUFBVSxHQUFHLE1BQU0sR0FBRyxrQkFBa0IsR0FBRyxPQUFPLEdBQUcsU0FBUyxDQUFBO0FBQ2pGLFNBQU8sR0FBRyxDQUFBO0VBQ1Y7OztBQUdELEtBQ0MsT0FBTzs7QUFFUCxPQUFNOztBQUVOLFdBQVUsRUFDVixNQUFNOzs7Ozs7Ozs7Ozs7Ozs7QUFlTixtQkFBa0IsRUFDbEIsU0FBUzs7QUFFVCxjQUFhLEVBQ2IsT0FBTyxDQUFBOztBQUVSLE9BQ0MsWUFBWSxHQUFHLEVBQUUsSUFBSTtBQUNwQixNQUFJLEVBQUUsS0FBSyxJQUFJLEVBQ2QsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFBO0VBQ1o7T0FFRCxXQUFXLEdBQUcsWUFBWSxJQUN6QixNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7T0FFakMsUUFBUSxHQUFHLFlBQVksSUFDdEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQzs7Ozs7QUFJNUMscUJBQW9CLEdBQUcs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Q0FBQyxDQUFBOztBQUUxQixTQUFPLFNBQVMsQ0FBQTtFQUNoQjtPQUVELGlCQUFpQixHQUFHLElBQUksSUFBSTtBQUMzQixRQUFNLFdBQVcsR0FDaEIsSUFBSSxtQkE5b0JrRSxFQUFFLEFBOG9CdEQ7O0FBRWxCLE1BQUksbUJBaHBCcUQsSUFBSSxBQWdwQnpDLElBQ3BCLElBQUksbUJBaHBCb0UsS0FBSyxBQWdwQnhELElBQ3JCLElBQUksbUJBanBCMkUsT0FBTyxBQWlwQi9ELENBQUE7QUFDeEIsU0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFBO0VBQ3pFLENBQUEiLCJmaWxlIjoicHJpdmF0ZS92ZXJpZnkuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7IGNvZGUgfSBmcm9tICcuLi9Db21waWxlRXJyb3InXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4vTXNBc3QnXG5pbXBvcnQgeyBBc3NpZ24sIEFzc2lnbkRlc3RydWN0dXJlLCBBc3NpZ25TaW5nbGUsIEJsb2NrVmFsLCBDYWxsLCBEZWJ1ZywgRG8sIEZvclZhbCxcblx0TG9jYWxEZWNsYXJlQnVpbHQsIExvY2FsRGVjbGFyZUZvY3VzLCBMb2NhbERlY2xhcmVSZXMsIE9iakVudHJ5LCBQYXR0ZXJuLCBZaWVsZCwgWWllbGRUb1xuXHR9IGZyb20gJy4vTXNBc3QnXG5pbXBvcnQgeyBhc3NlcnQsIGNhdCwgZWFjaFJldmVyc2UsIGhlYWQsIGlmRWxzZSwgaW1wbGVtZW50TWFueSxcblx0aXNFbXB0eSwgaXRlcmF0b3JUb0FycmF5LCBvcEVhY2ggfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgVmVyaWZ5UmVzdWx0cywgeyBMb2NhbEluZm8gfSBmcm9tICcuL1ZlcmlmeVJlc3VsdHMnXG5cbi8qXG5UaGUgdmVyaWZpZXIgZ2VuZXJhdGVzIGluZm9ybWF0aW9uIG5lZWRlZCBkdXJpbmcgdHJhbnNwaWxpbmcsIHRoZSBWZXJpZnlSZXN1bHRzLlxuKi9cbmV4cG9ydCBkZWZhdWx0IChfY29udGV4dCwgbXNBc3QpID0+IHtcblx0Y29udGV4dCA9IF9jb250ZXh0XG5cdGxvY2FscyA9IG5ldyBNYXAoKVxuXHRwZW5kaW5nQmxvY2tMb2NhbHMgPSBbIF1cblx0aXNJbkRlYnVnID0gaXNJbkdlbmVyYXRvciA9IGZhbHNlXG5cdG9rVG9Ob3RVc2UgPSBuZXcgU2V0KClcblx0b3BMb29wID0gbnVsbFxuXHRyZXN1bHRzID0gbmV3IFZlcmlmeVJlc3VsdHMoKVxuXG5cdG1zQXN0LnZlcmlmeSgpXG5cdHZlcmlmeUxvY2FsVXNlKClcblxuXHRjb25zdCByZXMgPSByZXN1bHRzXG5cdC8vIFJlbGVhc2UgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cblx0Y29udGV4dCA9IGxvY2FscyA9IG9rVG9Ob3RVc2UgPSBvcExvb3AgPSBwZW5kaW5nQmxvY2tMb2NhbHMgPSByZXN1bHRzID0gdW5kZWZpbmVkXG5cdHJldHVybiByZXNcbn1cblxuLy8gVXNlIGEgdHJpY2sgbGlrZSBpbiBwYXJzZS5qcyBhbmQgaGF2ZSBldmVyeXRoaW5nIGNsb3NlIG92ZXIgdGhlc2UgbXV0YWJsZSB2YXJpYWJsZXMuXG5sZXRcblx0Y29udGV4dCxcblx0Ly8gTWFwIGZyb20gbmFtZXMgdG8gTG9jYWxEZWNsYXJlcy5cblx0bG9jYWxzLFxuXHQvLyBMb2NhbHMgdGhhdCBkb24ndCBoYXZlIHRvIGJlIGFjY2Vzc2VkLlxuXHRva1RvTm90VXNlLFxuXHRvcExvb3AsXG5cdC8qXG5cdExvY2FscyBmb3IgdGhpcyBibG9jay5cblx0VGhlc2UgYXJlIGFkZGVkIHRvIGxvY2FscyB3aGVuIGVudGVyaW5nIGEgRnVuY3Rpb24gb3IgbGF6eSBldmFsdWF0aW9uLlxuXHRJbjpcblx0XHRhID0gfFxuXHRcdFx0YlxuXHRcdGIgPSAxXG5cdGBiYCB3aWxsIGJlIGEgcGVuZGluZyBsb2NhbC5cblx0SG93ZXZlcjpcblx0XHRhID0gYlxuXHRcdGIgPSAxXG5cdHdpbGwgZmFpbCB0byB2ZXJpZnksIGJlY2F1c2UgYGJgIGNvbWVzIGFmdGVyIGBhYCBhbmQgaXMgbm90IGFjY2Vzc2VkIGluc2lkZSBhIGZ1bmN0aW9uLlxuXHRJdCB3b3VsZCB3b3JrIGZvciBgfmEgaXMgYmAsIHRob3VnaC5cblx0Ki9cblx0cGVuZGluZ0Jsb2NrTG9jYWxzLFxuXHRpc0luRGVidWcsXG5cdC8vIFdoZXRoZXIgd2UgYXJlIGN1cnJlbnRseSBhYmxlIHRvIHlpZWxkLlxuXHRpc0luR2VuZXJhdG9yLFxuXHRyZXN1bHRzXG5cbmNvbnN0XG5cdHZlcmlmeU9wRWFjaCA9IG9wID0+IHtcblx0XHRpZiAob3AgIT09IG51bGwpXG5cdFx0XHRvcC52ZXJpZnkoKVxuXHR9LFxuXG5cdGRlbGV0ZUxvY2FsID0gbG9jYWxEZWNsYXJlID0+XG5cdFx0bG9jYWxzLmRlbGV0ZShsb2NhbERlY2xhcmUubmFtZSksXG5cblx0c2V0TG9jYWwgPSBsb2NhbERlY2xhcmUgPT5cblx0XHRsb2NhbHMuc2V0KGxvY2FsRGVjbGFyZS5uYW1lLCBsb2NhbERlY2xhcmUpLFxuXG5cdC8vIFdoZW4gYSBsb2NhbCBpcyByZXR1cm5lZCBmcm9tIGEgQmxvY2tPYmogb3IgTW9kdWxlLFxuXHQvLyB0aGUgcmV0dXJuICdhY2Nlc3MnIGlzIGNvbnNpZGVyZWQgdG8gYmUgJ2RlYnVnJyBpZiB0aGUgbG9jYWwgaXMuXG5cdGFjY2Vzc0xvY2FsRm9yUmV0dXJuID0gKGRlY2xhcmUsIGFjY2VzcykgPT4ge1xuXHRcdGNvbnN0IGluZm8gPSByZXN1bHRzLmxvY2FsRGVjbGFyZVRvSW5mby5nZXQoZGVjbGFyZSlcblx0XHRfYWRkTG9jYWxBY2Nlc3MoaW5mbywgYWNjZXNzLCBpbmZvLmlzSW5EZWJ1Zylcblx0fSxcblxuXHRhY2Nlc3NMb2NhbCA9IChhY2Nlc3MsIG5hbWUpID0+IHtcblx0XHRjb25zdCBkZWNsYXJlID0gZ2V0TG9jYWxEZWNsYXJlKG5hbWUsIGFjY2Vzcy5sb2MpXG5cdFx0cmVzdWx0cy5sb2NhbEFjY2Vzc1RvRGVjbGFyZS5zZXQoYWNjZXNzLCBkZWNsYXJlKVxuXHRcdF9hZGRMb2NhbEFjY2VzcyhyZXN1bHRzLmxvY2FsRGVjbGFyZVRvSW5mby5nZXQoZGVjbGFyZSksIGFjY2VzcywgaXNJbkRlYnVnKVxuXHR9LFxuXG5cdF9hZGRMb2NhbEFjY2VzcyA9IChsb2NhbEluZm8sIGFjY2VzcywgaXNEZWJ1Z0FjY2VzcykgPT5cblx0XHQoaXNEZWJ1Z0FjY2VzcyA/IGxvY2FsSW5mby5kZWJ1Z0FjY2Vzc2VzIDogbG9jYWxJbmZvLm5vbkRlYnVnQWNjZXNzZXMpLnB1c2goYWNjZXNzKSxcblxuXHQvLyBGb3IgZXhwcmVzc2lvbnMgYWZmZWN0aW5nIGxpbmVOZXdMb2NhbHMsIHRoZXkgd2lsbCBiZSByZWdpc3RlcmVkIGJlZm9yZSBiZWluZyB2ZXJpZmllZC5cblx0Ly8gU28sIExvY2FsRGVjbGFyZS52ZXJpZnkganVzdCB0aGUgdHlwZS5cblx0Ly8gRm9yIGxvY2FscyBub3QgYWZmZWN0aW5nIGxpbmVOZXdMb2NhbHMsIHVzZSB0aGlzIGluc3RlYWQgb2YganVzdCBkZWNsYXJlLnZlcmlmeSgpXG5cdHZlcmlmeUxvY2FsRGVjbGFyZSA9IGxvY2FsRGVjbGFyZSA9PiB7XG5cdFx0cmVnaXN0ZXJMb2NhbChsb2NhbERlY2xhcmUpXG5cdFx0bG9jYWxEZWNsYXJlLnZlcmlmeSgpXG5cdH0sXG5cblx0cmVnaXN0ZXJMb2NhbCA9IGxvY2FsRGVjbGFyZSA9PlxuXHRcdHJlc3VsdHMubG9jYWxEZWNsYXJlVG9JbmZvLnNldChsb2NhbERlY2xhcmUsIExvY2FsSW5mby5lbXB0eShpc0luRGVidWcpKVxuXG4vLyBUaGVzZSBmdW5jdGlvbnMgY2hhbmdlIHZlcmlmaWVyIHN0YXRlIGFuZCBlZmZpY2llbnRseSByZXR1cm4gdG8gdGhlIG9sZCBzdGF0ZSB3aGVuIGZpbmlzaGVkLlxuY29uc3Rcblx0d2l0aEluRGVidWcgPSBhY3Rpb24gPT4ge1xuXHRcdGNvbnN0IG9sZElzSW5EZWJ1ZyA9IGlzSW5EZWJ1Z1xuXHRcdGlzSW5EZWJ1ZyA9IHRydWVcblx0XHRhY3Rpb24oKVxuXHRcdGlzSW5EZWJ1ZyA9IG9sZElzSW5EZWJ1Z1xuXHR9LFxuXG5cdHdpdGhJbkdlbmVyYXRvciA9IChuZXdJc0luR2VuZXJhdG9yLCBhY3Rpb24pID0+IHtcblx0XHRjb25zdCBvbGRJc0luR2VuZXJhdG9yID0gaXNJbkdlbmVyYXRvclxuXHRcdGlzSW5HZW5lcmF0b3IgPSBuZXdJc0luR2VuZXJhdG9yXG5cdFx0YWN0aW9uKClcblx0XHRpc0luR2VuZXJhdG9yID0gb2xkSXNJbkdlbmVyYXRvclxuXHR9LFxuXG5cdHdpdGhJbkxvb3AgPSAobmV3TG9vcCwgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgb2xkTG9vcCA9IG9wTG9vcFxuXHRcdG9wTG9vcCA9IG5ld0xvb3Bcblx0XHRhY3Rpb24oKVxuXHRcdG9wTG9vcCA9IG9sZExvb3Bcblx0fSxcblxuXHRwbHVzTG9jYWwgPSAoYWRkZWRMb2NhbCwgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgc2hhZG93ZWQgPSBsb2NhbHMuZ2V0KGFkZGVkTG9jYWwubmFtZSlcblx0XHRsb2NhbHMuc2V0KGFkZGVkTG9jYWwubmFtZSwgYWRkZWRMb2NhbClcblx0XHRhY3Rpb24oKVxuXHRcdGlmIChzaGFkb3dlZCA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0ZGVsZXRlTG9jYWwoYWRkZWRMb2NhbClcblx0XHRlbHNlXG5cdFx0XHRzZXRMb2NhbChzaGFkb3dlZClcblx0fSxcblxuXHQvLyBTaG91bGQgaGF2ZSB2ZXJpZmllZCB0aGF0IGFkZGVkTG9jYWxzIGFsbCBoYXZlIGRpZmZlcmVudCBuYW1lcy5cblx0cGx1c0xvY2FscyA9IChhZGRlZExvY2FscywgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgc2hhZG93ZWRMb2NhbHMgPSBbIF1cblx0XHRmb3IgKGNvbnN0IF8gb2YgYWRkZWRMb2NhbHMpIHtcblx0XHRcdGNvbnN0IHNoYWRvd2VkID0gbG9jYWxzLmdldChfLm5hbWUpXG5cdFx0XHRpZiAoc2hhZG93ZWQgIT09IHVuZGVmaW5lZClcblx0XHRcdFx0c2hhZG93ZWRMb2NhbHMucHVzaChzaGFkb3dlZClcblx0XHRcdHNldExvY2FsKF8pXG5cdFx0fVxuXG5cdFx0YWN0aW9uKClcblxuXHRcdGFkZGVkTG9jYWxzLmZvckVhY2goZGVsZXRlTG9jYWwpXG5cdFx0c2hhZG93ZWRMb2NhbHMuZm9yRWFjaChzZXRMb2NhbClcblx0fSxcblxuXHR2ZXJpZnlBbmRQbHVzTG9jYWwgPSAoYWRkZWRMb2NhbCwgYWN0aW9uKSA9PiB7XG5cdFx0dmVyaWZ5TG9jYWxEZWNsYXJlKGFkZGVkTG9jYWwpXG5cdFx0cGx1c0xvY2FsKGFkZGVkTG9jYWwsIGFjdGlvbilcblx0fSxcblxuXHR2ZXJpZnlBbmRQbHVzTG9jYWxzID0gKGFkZGVkTG9jYWxzLCBhY3Rpb24pID0+IHtcblx0XHRhZGRlZExvY2Fscy5mb3JFYWNoKHZlcmlmeUxvY2FsRGVjbGFyZSlcblx0XHRjb25zdCBuYW1lcyA9IG5ldyBTZXQoKVxuXHRcdGZvciAoY29uc3QgXyBvZiBhZGRlZExvY2Fscykge1xuXHRcdFx0Y29udGV4dC5jaGVjayghbmFtZXMuaGFzKF8ubmFtZSksIF8ubG9jLCAoKSA9PlxuXHRcdFx0XHRgRHVwbGljYXRlIGxvY2FsICR7Y29kZShfLm5hbWUpfWApXG5cdFx0XHRuYW1lcy5hZGQoXy5uYW1lKVxuXHRcdH1cblx0XHRwbHVzTG9jYWxzKGFkZGVkTG9jYWxzLCBhY3Rpb24pXG5cdH0sXG5cblx0d2l0aEJsb2NrTG9jYWxzID0gYWN0aW9uID0+IHtcblx0XHRjb25zdCBvbGRQZW5kaW5nQmxvY2tMb2NhbHMgPSBwZW5kaW5nQmxvY2tMb2NhbHNcblx0XHRwZW5kaW5nQmxvY2tMb2NhbHMgPSBbIF1cblx0XHRwbHVzTG9jYWxzKG9sZFBlbmRpbmdCbG9ja0xvY2FscywgYWN0aW9uKVxuXHRcdHBlbmRpbmdCbG9ja0xvY2FscyA9IG9sZFBlbmRpbmdCbG9ja0xvY2Fsc1xuXHR9LFxuXG5cdC8vIENhbid0IGJyZWFrIG91dCBvZiBsb29wIGluc2lkZSBvZiBJSUZFLlxuXHR3aXRoSUlGRSA9IGFjdGlvbiA9PiB7XG5cdFx0d2l0aEluTG9vcChmYWxzZSwgYWN0aW9uKVxuXHR9XG5cbmNvbnN0IHZlcmlmeUxvY2FsVXNlID0gKCkgPT5cblx0cmVzdWx0cy5sb2NhbERlY2xhcmVUb0luZm8uZm9yRWFjaCgoaW5mbywgbG9jYWwpID0+IHtcblx0XHRpZiAoIShsb2NhbCBpbnN0YW5jZW9mIExvY2FsRGVjbGFyZUJ1aWx0IHx8IGxvY2FsIGluc3RhbmNlb2YgTG9jYWxEZWNsYXJlUmVzKSkge1xuXHRcdFx0Y29uc3Qgbm9Ob25EZWJ1ZyA9IGlzRW1wdHkoaW5mby5ub25EZWJ1Z0FjY2Vzc2VzKVxuXHRcdFx0aWYgKG5vTm9uRGVidWcgJiYgaXNFbXB0eShpbmZvLmRlYnVnQWNjZXNzZXMpKVxuXHRcdFx0XHRjb250ZXh0Lndhcm5JZighb2tUb05vdFVzZS5oYXMobG9jYWwpLCBsb2NhbC5sb2MsICgpID0+XG5cdFx0XHRcdFx0YFVudXNlZCBsb2NhbCB2YXJpYWJsZSAke2NvZGUobG9jYWwubmFtZSl9LmApXG5cdFx0XHRlbHNlIGlmIChpbmZvLmlzSW5EZWJ1Zylcblx0XHRcdFx0Y29udGV4dC53YXJuSWYoIW5vTm9uRGVidWcsICgpID0+IGhlYWQoaW5mby5ub25EZWJ1Z0FjY2Vzc2VzKS5sb2MsICgpID0+XG5cdFx0XHRcdFx0YERlYnVnLW9ubHkgbG9jYWwgJHtjb2RlKGxvY2FsLm5hbWUpfSB1c2VkIG91dHNpZGUgb2YgZGVidWcuYClcblx0XHRcdGVsc2Vcblx0XHRcdFx0Y29udGV4dC53YXJuSWYobm9Ob25EZWJ1ZywgbG9jYWwubG9jLCAoKSA9PlxuXHRcdFx0XHRcdGBMb2NhbCAke2NvZGUobG9jYWwubmFtZSl9IHVzZWQgb25seSBpbiBkZWJ1Zy5gKVxuXHRcdH1cblx0fSlcblxuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICd2ZXJpZnknLCB7XG5cdEFzc2VydCgpIHtcblx0XHR0aGlzLmNvbmRpdGlvbi52ZXJpZnkoKVxuXHRcdHZlcmlmeU9wRWFjaCh0aGlzLm9wVGhyb3duKVxuXHR9LFxuXG5cdEFzc2lnblNpbmdsZSgpIHtcblx0XHRjb25zdCBkb1YgPSAoKSA9PiB7XG5cdFx0XHQvLyBBc3NpZ25lZSByZWdpc3RlcmVkIGJ5IHZlcmlmeUxpbmVzLlxuXHRcdFx0dGhpcy5hc3NpZ25lZS52ZXJpZnkoKVxuXHRcdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHRcdH1cblx0XHRpZiAodGhpcy5hc3NpZ25lZS5pc0xhenkoKSlcblx0XHRcdHdpdGhCbG9ja0xvY2Fscyhkb1YpXG5cdFx0ZWxzZVxuXHRcdFx0ZG9WKClcblx0fSxcblxuXHRBc3NpZ25EZXN0cnVjdHVyZSgpIHtcblx0XHQvLyBBc3NpZ25lZXMgcmVnaXN0ZXJlZCBieSB2ZXJpZnlMaW5lcy5cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hc3NpZ25lZXMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdEJhZ0VudHJ5OiB2ZXJpZnlCYWdFbnRyeSxcblx0QmFnRW50cnlNYW55OiB2ZXJpZnlCYWdFbnRyeSxcblxuXHRCYWdTaW1wbGUoKSB7XG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMucGFydHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0QmxvY2tEbygpIHsgdmVyaWZ5TGluZXModGhpcy5saW5lcykgfSxcblxuXHRCbG9ja1ZhbFRocm93KCkge1xuXHRcdGNvbnN0IG5ld0xvY2FscyA9IHZlcmlmeUxpbmVzKHRoaXMubGluZXMpXG5cdFx0cGx1c0xvY2FscyhuZXdMb2NhbHMsICgpID0+IHRoaXMudGhyb3cudmVyaWZ5KCkpXG5cdH0sXG5cblx0QmxvY2tXaXRoUmV0dXJuKCkge1xuXHRcdGNvbnN0IG5ld0xvY2FscyA9IHZlcmlmeUxpbmVzKHRoaXMubGluZXMpXG5cdFx0cGx1c0xvY2FscyhuZXdMb2NhbHMsICgpID0+IHRoaXMucmV0dXJuZWQudmVyaWZ5KCkpXG5cdH0sXG5cblx0QmxvY2tPYmooKSB7XG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuYnVpbHQsICgpID0+IHtcblx0XHRcdGNvbnN0IG5ld0xvY2FscyA9IHZlcmlmeUxpbmVzKHRoaXMubGluZXMpXG5cdFx0XHRvcEVhY2godGhpcy5vcE9iamVkLCBfID0+IHBsdXNMb2NhbHMobmV3TG9jYWxzLCAoKSA9PiBfLnZlcmlmeSgpKSlcblx0XHR9KVxuXHR9LFxuXG5cdEJsb2NrQmFnOiB2ZXJpZnlCbG9ja0JhZ09yTWFwLFxuXHRCbG9ja01hcDogdmVyaWZ5QmxvY2tCYWdPck1hcCxcblxuXHRCbG9ja1dyYXAoKSB7IHdpdGhJSUZFKCgpID0+IHRoaXMuYmxvY2sudmVyaWZ5KCkpIH0sXG5cblx0QnJlYWsoKSB7XG5cdFx0dmVyaWZ5SW5Mb29wKHRoaXMpXG5cdFx0Y29udGV4dC5jaGVjayghKG9wTG9vcCBpbnN0YW5jZW9mIEZvclZhbCksIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0YCR7Y29kZSgnZm9yJyl9IG11c3QgYnJlYWsgd2l0aCBhIHZhbHVlLmApXG5cdH0sXG5cblx0QnJlYWtXaXRoVmFsKCkge1xuXHRcdHZlcmlmeUluTG9vcCh0aGlzKVxuXHRcdGNvbnRleHQuY2hlY2sob3BMb29wIGluc3RhbmNlb2YgRm9yVmFsLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdGAke2NvZGUoJ2JyZWFrJyl9IG9ubHkgdmFsaWQgaW5zaWRlICR7Y29kZSgnZm9yJyl9YClcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0Q2FsbCgpIHtcblx0XHR0aGlzLmNhbGxlZC52ZXJpZnkoKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0Q2FzZURvKCkgeyB2ZXJpZnlDYXNlKHRoaXMpIH0sXG5cdENhc2VEb1BhcnQ6IHZlcmlmeUNhc2VQYXJ0LFxuXHRDYXNlVmFsKCkgeyB3aXRoSUlGRSgoKSA9PiB2ZXJpZnlDYXNlKHRoaXMpKSB9LFxuXHRDYXNlVmFsUGFydDogdmVyaWZ5Q2FzZVBhcnQsXG5cblx0Q2F0Y2goKSB7XG5cdFx0Y29udGV4dC5jaGVjayh0aGlzLmNhdWdodC5vcFR5cGUgPT09IG51bGwsIHRoaXMuY2F1Z2h0LmxvYywgJ1RPRE86IENhdWdodCB0eXBlcycpXG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuY2F1Z2h0LCAoKSA9PiB0aGlzLmJsb2NrLnZlcmlmeSgpKVxuXHR9LFxuXG5cdENsYXNzKCkge1xuXHRcdHZlcmlmeU9wRWFjaCh0aGlzLm9wU3VwZXJDbGFzcylcblx0XHR2ZXJpZnlPcEVhY2godGhpcy5vcERvKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLnN0YXRpY3MpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0dmVyaWZ5T3BFYWNoKHRoaXMub3BDb25zdHJ1Y3Rvcilcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5tZXRob2RzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHR9LFxuXG5cdENsYXNzRG8oKSB7XG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuZGVjbGFyZUZvY3VzLCAoKSA9PiB0aGlzLmJsb2NrLnZlcmlmeSgpKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsRG8oKSB7XG5cdFx0dGhpcy50ZXN0LnZlcmlmeSgpXG5cdFx0dGhpcy5yZXN1bHQudmVyaWZ5KClcblx0fSxcblx0Q29uZGl0aW9uYWxWYWwoKSB7XG5cdFx0dGhpcy50ZXN0LnZlcmlmeSgpXG5cdFx0d2l0aElJRkUoKCkgPT4gdGhpcy5yZXN1bHQudmVyaWZ5KCkpXG5cdH0sXG5cblx0Ly8gT25seSByZWFjaCBoZXJlIGZvciBpbi9vdXQgY29uZGl0aW9uLlxuXHREZWJ1ZygpIHsgdmVyaWZ5TGluZXMoWyB0aGlzIF0pIH0sXG5cblx0RXhjZXB0RG86IHZlcmlmeUV4Y2VwdCxcblx0RXhjZXB0VmFsOiB2ZXJpZnlFeGNlcHQsXG5cblx0Rm9yQmFnKCkgeyB2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5idWlsdCwgKCkgPT4gdmVyaWZ5Rm9yKHRoaXMpKSB9LFxuXG5cdEZvckRvKCkgeyB2ZXJpZnlGb3IodGhpcykgfSxcblxuXHRGb3JWYWwoKSB7IHZlcmlmeUZvcih0aGlzKSB9LFxuXG5cdC8vIGlzRm9yTWV0aG9kSW1wbCBpcyBzZXQgaWYgdGhpcyBpcyBhIE1ldGhvZEltcGwncyBpbXBsZW1lbnRhdGlvbi5cblx0RnVuKGlzRm9yTWV0aG9kSW1wbCkge1xuXHRcdHdpdGhCbG9ja0xvY2FscygoKSA9PiB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKHRoaXMub3BEZWNsYXJlUmVzID09PSBudWxsIHx8IHRoaXMuYmxvY2sgaW5zdGFuY2VvZiBCbG9ja1ZhbCwgdGhpcy5sb2MsXG5cdFx0XHRcdCdGdW5jdGlvbiB3aXRoIHJldHVybiBjb25kaXRpb24gbXVzdCByZXR1cm4gc29tZXRoaW5nLicpXG5cdFx0XHR3aXRoSW5HZW5lcmF0b3IodGhpcy5pc0dlbmVyYXRvciwgKCkgPT5cblx0XHRcdFx0d2l0aEluTG9vcChmYWxzZSwgKCkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGFsbEFyZ3MgPSBjYXQodGhpcy5vcERlY2xhcmVUaGlzLCB0aGlzLmFyZ3MsIHRoaXMub3BSZXN0QXJnKVxuXHRcdFx0XHRcdGlmIChpc0Zvck1ldGhvZEltcGwpXG5cdFx0XHRcdFx0XHRva1RvTm90VXNlLmFkZCh0aGlzLm9wRGVjbGFyZVRoaXMpXG5cdFx0XHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FscyhhbGxBcmdzLCAoKSA9PiB7XG5cdFx0XHRcdFx0XHR2ZXJpZnlPcEVhY2godGhpcy5vcEluKVxuXHRcdFx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoKVxuXHRcdFx0XHRcdFx0b3BFYWNoKHRoaXMub3BEZWNsYXJlUmVzLCB2ZXJpZnlMb2NhbERlY2xhcmUpXG5cdFx0XHRcdFx0XHRjb25zdCB2ZXJpZnlPdXQgPSAoKSA9PiB2ZXJpZnlPcEVhY2godGhpcy5vcE91dClcblx0XHRcdFx0XHRcdGlmRWxzZSh0aGlzLm9wRGVjbGFyZVJlcywgXyA9PiBwbHVzTG9jYWwoXywgdmVyaWZ5T3V0KSwgdmVyaWZ5T3V0KVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH0pKVxuXHRcdH0pXG5cdH0sXG5cblx0R2xvYmFsQWNjZXNzKCkgeyB9LFxuXG5cdElnbm9yZSgpIHtcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5pZ25vcmVkKVxuXHRcdFx0YWNjZXNzTG9jYWwodGhpcywgXylcblx0fSxcblxuXHRMYXp5KCkgeyB3aXRoQmxvY2tMb2NhbHMoKCkgPT4gdGhpcy52YWx1ZS52ZXJpZnkoKSkgfSxcblxuXHRMb2NhbEFjY2VzcygpIHsgYWNjZXNzTG9jYWwodGhpcywgdGhpcy5uYW1lKSB9LFxuXG5cdC8vIEFkZGluZyBMb2NhbERlY2xhcmVzIHRvIHRoZSBhdmFpbGFibGUgbG9jYWxzIGlzIGRvbmUgYnkgRnVuIG9yIGxpbmVOZXdMb2NhbHMuXG5cdExvY2FsRGVjbGFyZSgpIHsgdmVyaWZ5T3BFYWNoKHRoaXMub3BUeXBlKSB9LFxuXG5cdExvY2FsTXV0YXRlKCkge1xuXHRcdGNvbnN0IGRlY2xhcmUgPSBnZXRMb2NhbERlY2xhcmUodGhpcy5uYW1lLCB0aGlzLmxvYylcblx0XHRjb250ZXh0LmNoZWNrKGRlY2xhcmUuaXNNdXRhYmxlKCksIHRoaXMubG9jLCAoKSA9PiBgJHtjb2RlKHRoaXMubmFtZSl9IGlzIG5vdCBtdXRhYmxlLmApXG5cdFx0Ly8gVE9ETzogVHJhY2sgbXV0YXRpb25zLiBNdXRhYmxlIGxvY2FsIG11c3QgYmUgbXV0YXRlZCBzb21ld2hlcmUuXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdExvZ2ljKCkge1xuXHRcdGNvbnRleHQuY2hlY2sodGhpcy5hcmdzLmxlbmd0aCA+IDEsICdMb2dpYyBleHByZXNzaW9uIG5lZWRzIGF0IGxlYXN0IDIgYXJndW1lbnRzLicpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHROb3QoKSB7IHRoaXMuYXJnLnZlcmlmeSgpIH0sXG5cblx0TnVtYmVyTGl0ZXJhbCgpIHsgfSxcblxuXHRNYXBFbnRyeSgpIHtcblx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHRoaXMua2V5LnZlcmlmeSgpXG5cdFx0dGhpcy52YWwudmVyaWZ5KClcblx0fSxcblxuXHRNZW1iZXIoKSB7IHRoaXMub2JqZWN0LnZlcmlmeSgpIH0sXG5cblx0TWVtYmVyU2V0KCkge1xuXHRcdHRoaXMub2JqZWN0LnZlcmlmeSgpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdE1ldGhvZEltcGwoKSB7XG5cdFx0aWYgKHR5cGVvZiB0aGlzLnN5bWJvbCAhPT0gJ3N0cmluZycpXG5cdFx0XHR0aGlzLnN5bWJvbC52ZXJpZnkoKVxuXHRcdHRoaXMuZnVuLnZlcmlmeSh0cnVlKVxuXHR9LFxuXG5cdE1vZHVsZSgpIHtcblx0XHQvLyBObyBuZWVkIHRvIHZlcmlmeSB0aGlzLmRvVXNlcy5cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy51c2VzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdHdpdGhJbkRlYnVnKCgpID0+IHtcblx0XHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmRlYnVnVXNlcylcblx0XHRcdFx0Xy52ZXJpZnkoKVxuXHRcdH0pXG5cdFx0Y29uc3QgbmV3TG9jYWxzID0gdmVyaWZ5TGluZXModGhpcy5saW5lcylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5leHBvcnRzKVxuXHRcdFx0YWNjZXNzTG9jYWxGb3JSZXR1cm4oXywgdGhpcylcblx0XHRvcEVhY2godGhpcy5vcERlZmF1bHRFeHBvcnQsIF8gPT4gcGx1c0xvY2FscyhuZXdMb2NhbHMsICgpID0+IF8udmVyaWZ5KCkpKVxuXG5cdFx0Y29uc3QgZXhwb3J0cyA9IG5ldyBTZXQodGhpcy5leHBvcnRzKVxuXHRcdGNvbnN0IG1hcmtFeHBvcnRMaW5lcyA9IGxpbmUgPT4ge1xuXHRcdFx0aWYgKGxpbmUgaW5zdGFuY2VvZiBBc3NpZ24gJiYgbGluZS5hbGxBc3NpZ25lZXMoKS5zb21lKF8gPT4gZXhwb3J0cy5oYXMoXykpKVxuXHRcdFx0XHRyZXN1bHRzLmV4cG9ydEFzc2lnbnMuYWRkKGxpbmUpXG5cdFx0XHRlbHNlIGlmIChsaW5lIGluc3RhbmNlb2YgRGVidWcpXG5cdFx0XHRcdGxpbmUubGluZXMuZm9yRWFjaChtYXJrRXhwb3J0TGluZXMpXG5cdFx0fVxuXHRcdHRoaXMubGluZXMuZm9yRWFjaChtYXJrRXhwb3J0TGluZXMpXG5cdH0sXG5cblx0TmV3KCkge1xuXHRcdHRoaXMudHlwZS52ZXJpZnkoKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0T2JqRW50cnkoKSB7XG5cdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR0aGlzLmFzc2lnbi52ZXJpZnkoKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFzc2lnbi5hbGxBc3NpZ25lZXMoKSlcblx0XHRcdGFjY2Vzc0xvY2FsKHRoaXMsIF8ubmFtZSlcblx0fSxcblxuXHRPYmpTaW1wbGUoKSB7XG5cdFx0Y29uc3Qga2V5cyA9IG5ldyBTZXQoKVxuXHRcdGZvciAoY29uc3QgcGFpciBvZiB0aGlzLnBhaXJzKSB7XG5cdFx0XHRjb25zdCB7IGtleSwgdmFsdWUgfSA9IHBhaXJcblx0XHRcdGNvbnRleHQuY2hlY2soIWtleXMuaGFzKGtleSksIHBhaXIubG9jLCAoKSA9PiBgRHVwbGljYXRlIGtleSAke2tleX1gKVxuXHRcdFx0a2V5cy5hZGQoa2V5KVxuXHRcdFx0dmFsdWUudmVyaWZ5KClcblx0XHR9XG5cdH0sXG5cblx0UXVvdGUoKSB7XG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMucGFydHMpXG5cdFx0XHRpZiAodHlwZW9mIF8gIT09ICdzdHJpbmcnKVxuXHRcdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0UXVvdGVUZW1wbGF0ZSgpIHtcblx0XHR0aGlzLnRhZy52ZXJpZnkoKVxuXHRcdHRoaXMucXVvdGUudmVyaWZ5KClcblx0fSxcblxuXHRTcGVjaWFsRG8oKSB7IH0sXG5cblx0U3BlY2lhbFZhbCgpIHsgfSxcblxuXHRTcGxhdCgpIHsgdGhpcy5zcGxhdHRlZC52ZXJpZnkoKSB9LFxuXG5cdFN3aXRjaERvKCkgeyB2ZXJpZnlTd2l0Y2godGhpcykgfSxcblx0U3dpdGNoRG9QYXJ0OiB2ZXJpZnlTd2l0Y2hQYXJ0LFxuXHRTd2l0Y2hWYWwoKSB7IHdpdGhJSUZFKCgpID0+IHZlcmlmeVN3aXRjaCh0aGlzKSkgfSxcblx0U3dpdGNoVmFsUGFydDogdmVyaWZ5U3dpdGNoUGFydCxcblxuXHRUaHJvdygpIHtcblx0XHR2ZXJpZnlPcEVhY2godGhpcy5vcFRocm93bilcblx0fSxcblxuXHRVc2UoKSB7XG5cdFx0Ly8gU2luY2UgVXNlcyBhcmUgYWx3YXlzIGluIHRoZSBvdXRlcm1vc3Qgc2NvcGUsIGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgc2hhZG93aW5nLlxuXHRcdC8vIFNvIHdlIG11dGF0ZSBgbG9jYWxzYCBkaXJlY3RseS5cblx0XHRjb25zdCBhZGRVc2VMb2NhbCA9IF8gPT4ge1xuXHRcdFx0Y29uc3QgcHJldiA9IGxvY2Fscy5nZXQoXy5uYW1lKVxuXHRcdFx0Y29udGV4dC5jaGVjayhwcmV2ID09PSB1bmRlZmluZWQsIF8ubG9jLCAoKSA9PlxuXHRcdFx0XHRgJHtjb2RlKF8ubmFtZSl9IGFscmVhZHkgaW1wb3J0ZWQgYXQgJHtwcmV2LmxvY31gKVxuXHRcdFx0dmVyaWZ5TG9jYWxEZWNsYXJlKF8pXG5cdFx0XHRzZXRMb2NhbChfKVxuXHRcdH1cblx0XHR0aGlzLnVzZWQuZm9yRWFjaChhZGRVc2VMb2NhbClcblx0XHRvcEVhY2godGhpcy5vcFVzZURlZmF1bHQsIGFkZFVzZUxvY2FsKVxuXHR9LFxuXG5cdFdpdGgoKSB7XG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHRcdHdpdGhJSUZFKCgpID0+IHtcblx0XHRcdGlmICh0aGlzLmRlY2xhcmUgaW5zdGFuY2VvZiBMb2NhbERlY2xhcmVGb2N1cylcblx0XHRcdFx0b2tUb05vdFVzZS5hZGQodGhpcy5kZWNsYXJlKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuZGVjbGFyZSwgKCkgPT4geyB0aGlzLmJsb2NrLnZlcmlmeSgpIH0pXG5cdFx0fSlcblx0fSxcblxuXHRZaWVsZCgpIHtcblx0XHRjb250ZXh0LmNoZWNrKGlzSW5HZW5lcmF0b3IsIHRoaXMubG9jLCAnQ2Fubm90IHlpZWxkIG91dHNpZGUgb2YgZ2VuZXJhdG9yIGNvbnRleHQnKVxuXHRcdHZlcmlmeU9wRWFjaCh0aGlzLm9wWWllbGRlZClcblx0fSxcblxuXHRZaWVsZFRvKCkge1xuXHRcdGNvbnRleHQuY2hlY2soaXNJbkdlbmVyYXRvciwgdGhpcy5sb2MsICdDYW5ub3QgeWllbGQgb3V0c2lkZSBvZiBnZW5lcmF0b3IgY29udGV4dCcpXG5cdFx0dGhpcy55aWVsZGVkVG8udmVyaWZ5KClcblx0fVxufSlcblxuZnVuY3Rpb24gdmVyaWZ5QmFnRW50cnkoKSB7XG5cdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdHRoaXMudmFsdWUudmVyaWZ5KClcbn1cblxuZnVuY3Rpb24gdmVyaWZ5QmxvY2tCYWdPck1hcCgpIHtcblx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuYnVpbHQsICgpID0+IHZlcmlmeUxpbmVzKHRoaXMubGluZXMpKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlDYXNlUGFydCgpIHtcblx0aWYgKHRoaXMudGVzdCBpbnN0YW5jZW9mIFBhdHRlcm4pIHtcblx0XHR0aGlzLnRlc3QudHlwZS52ZXJpZnkoKVxuXHRcdHRoaXMudGVzdC5wYXR0ZXJuZWQudmVyaWZ5KClcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKHRoaXMudGVzdC5sb2NhbHMsICgpID0+IHRoaXMucmVzdWx0LnZlcmlmeSgpKVxuXHR9IGVsc2Uge1xuXHRcdHRoaXMudGVzdC52ZXJpZnkoKVxuXHRcdHRoaXMucmVzdWx0LnZlcmlmeSgpXG5cdH1cbn1cblxuZnVuY3Rpb24gdmVyaWZ5U3dpdGNoUGFydCgpIHtcblx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR0aGlzLnJlc3VsdC52ZXJpZnkoKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlFeGNlcHQoKSB7XG5cdHRoaXMuX3RyeS52ZXJpZnkoKVxuXHR2ZXJpZnlPcEVhY2godGhpcy5fY2F0Y2gpXG5cdHZlcmlmeU9wRWFjaCh0aGlzLl9maW5hbGx5KVxufVxuXG4vLyBIZWxwZXJzIHNwZWNpZmljIHRvIGNlcnRhaW4gTXNBc3QgdHlwZXM6XG5jb25zdFxuXHR2ZXJpZnlGb3IgPSBmb3JMb29wID0+IHtcblx0XHRjb25zdCB2ZXJpZnlCbG9jayA9ICgpID0+IHdpdGhJbkxvb3AoZm9yTG9vcCwgKCkgPT4gZm9yTG9vcC5ibG9jay52ZXJpZnkoKSlcblx0XHRpZkVsc2UoZm9yTG9vcC5vcEl0ZXJhdGVlLFxuXHRcdFx0KHsgZWxlbWVudCwgYmFnIH0pID0+IHtcblx0XHRcdFx0YmFnLnZlcmlmeSgpXG5cdFx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbChlbGVtZW50LCB2ZXJpZnlCbG9jaylcblx0XHRcdH0sXG5cdFx0XHR2ZXJpZnlCbG9jaylcblx0fSxcblxuXHR2ZXJpZnlJbkxvb3AgPSBsb29wVXNlciA9PlxuXHRcdGNvbnRleHQuY2hlY2sob3BMb29wICE9PSBudWxsLCBsb29wVXNlci5sb2MsICdOb3QgaW4gYSBsb29wLicpLFxuXG5cblx0dmVyaWZ5Q2FzZSA9IF8gPT4ge1xuXHRcdGNvbnN0IGRvSXQgPSAoKSA9PiB7XG5cdFx0XHRmb3IgKGNvbnN0IHBhcnQgb2YgXy5wYXJ0cylcblx0XHRcdFx0cGFydC52ZXJpZnkoKVxuXHRcdFx0dmVyaWZ5T3BFYWNoKF8ub3BFbHNlKVxuXHRcdH1cblx0XHRpZkVsc2UoXy5vcENhc2VkLFxuXHRcdFx0XyA9PiB7XG5cdFx0XHRcdF8udmVyaWZ5KClcblx0XHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKF8uYXNzaWduZWUsIGRvSXQpXG5cdFx0XHR9LFxuXHRcdFx0ZG9JdClcblx0fSxcblxuXHR2ZXJpZnlTd2l0Y2ggPSBfID0+IHtcblx0XHRfLnN3aXRjaGVkLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBwYXJ0IG9mIF8ucGFydHMpXG5cdFx0XHRwYXJ0LnZlcmlmeSgpXG5cdFx0dmVyaWZ5T3BFYWNoKF8ub3BFbHNlKVxuXHR9XG5cbi8vIEdlbmVyYWwgdXRpbGl0aWVzOlxuY29uc3Rcblx0Z2V0TG9jYWxEZWNsYXJlID0gKG5hbWUsIGFjY2Vzc0xvYykgPT4ge1xuXHRcdGNvbnN0IGRlY2xhcmUgPSBsb2NhbHMuZ2V0KG5hbWUpXG5cdFx0Y29udGV4dC5jaGVjayhkZWNsYXJlICE9PSB1bmRlZmluZWQsIGFjY2Vzc0xvYywgKCkgPT4ge1xuXHRcdFx0Y29uc3Qgc2hvd0xvY2FscyA9IGNvZGUoaXRlcmF0b3JUb0FycmF5KGxvY2Fscy5rZXlzKCkpLmpvaW4oJyAnKSlcblx0XHRcdHJldHVybiBgTm8gc3VjaCBsb2NhbCAke2NvZGUobmFtZSl9LlxcbkxvY2FscyBhcmU6XFxuJHtzaG93TG9jYWxzfS5gXG5cdFx0fSlcblx0XHRyZXR1cm4gZGVjbGFyZVxuXHR9LFxuXG5cdGxpbmVOZXdMb2NhbHMgPSBsaW5lID0+XG5cdFx0bGluZSBpbnN0YW5jZW9mIEFzc2lnblNpbmdsZSA/XG5cdFx0XHRbIGxpbmUuYXNzaWduZWUgXSA6XG5cdFx0XHRsaW5lIGluc3RhbmNlb2YgQXNzaWduRGVzdHJ1Y3R1cmUgP1xuXHRcdFx0bGluZS5hc3NpZ25lZXMgOlxuXHRcdFx0bGluZSBpbnN0YW5jZW9mIE9iakVudHJ5ID9cblx0XHRcdGxpbmVOZXdMb2NhbHMobGluZS5hc3NpZ24pIDpcblx0XHRcdFsgXSxcblxuXHR2ZXJpZnlMaW5lcyA9IGxpbmVzID0+IHtcblx0XHQvKlxuXHRcdFdlIG5lZWQgdG8gYmV0IGFsbCBibG9jayBsb2NhbHMgdXAtZnJvbnQgYmVjYXVzZVxuXHRcdEZ1bmN0aW9ucyB3aXRoaW4gbGluZXMgY2FuIGFjY2VzcyBsb2NhbHMgZnJvbSBsYXRlciBsaW5lcy5cblx0XHROT1RFOiBXZSBwdXNoIHRoZXNlIG9udG8gcGVuZGluZ0Jsb2NrTG9jYWxzIGluIHJldmVyc2Vcblx0XHRzbyB0aGF0IHdoZW4gd2UgaXRlcmF0ZSB0aHJvdWdoIGxpbmVzIGZvcndhcmRzLCB3ZSBjYW4gcG9wIGZyb20gcGVuZGluZ0Jsb2NrTG9jYWxzXG5cdFx0dG8gcmVtb3ZlIHBlbmRpbmcgbG9jYWxzIGFzIHRoZXkgYmVjb21lIHJlYWwgbG9jYWxzLlxuXHRcdEl0IGRvZXNuJ3QgcmVhbGx5IG1hdHRlciB3aGF0IG9yZGVyIHdlIGFkZCBsb2NhbHMgaW4gc2luY2UgaXQncyBub3QgYWxsb3dlZFxuXHRcdHRvIGhhdmUgdHdvIGxvY2FscyBvZiB0aGUgc2FtZSBuYW1lIGluIHRoZSBzYW1lIGJsb2NrLlxuXHRcdCovXG5cdFx0Y29uc3QgbmV3TG9jYWxzID0gWyBdXG5cblx0XHRjb25zdCBnZXRMaW5lTG9jYWxzID0gbGluZSA9PiB7XG5cdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIERlYnVnKVxuXHRcdFx0XHR3aXRoSW5EZWJ1ZygoKSA9PiBlYWNoUmV2ZXJzZShsaW5lLmxpbmVzLCBnZXRMaW5lTG9jYWxzKSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0ZWFjaFJldmVyc2UobGluZU5ld0xvY2FscyhsaW5lKSwgXyA9PiB7XG5cdFx0XHRcdFx0Ly8gUmVnaXN0ZXIgdGhlIGxvY2FsIG5vdy4gQ2FuJ3Qgd2FpdCB1bnRpbCB0aGUgYXNzaWduIGlzIHZlcmlmaWVkLlxuXHRcdFx0XHRcdHJlZ2lzdGVyTG9jYWwoXylcblx0XHRcdFx0XHRuZXdMb2NhbHMucHVzaChfKVxuXHRcdFx0XHR9KVxuXHRcdH1cblx0XHRlYWNoUmV2ZXJzZShsaW5lcywgZ2V0TGluZUxvY2Fscylcblx0XHRwZW5kaW5nQmxvY2tMb2NhbHMucHVzaCguLi5uZXdMb2NhbHMpXG5cblx0XHQvKlxuXHRcdEtlZXBzIHRyYWNrIG9mIGxvY2FscyB3aGljaCBoYXZlIGFscmVhZHkgYmVlbiBhZGRlZCBpbiB0aGlzIGJsb2NrLlxuXHRcdE1hc29uIGFsbG93cyBzaGFkb3dpbmcsIGJ1dCBub3Qgd2l0aGluIHRoZSBzYW1lIGJsb2NrLlxuXHRcdFNvLCB0aGlzIGlzIGFsbG93ZWQ6XG5cdFx0XHRhID0gMVxuXHRcdFx0YiA9XG5cdFx0XHRcdGEgPSAyXG5cdFx0XHRcdC4uLlxuXHRcdEJ1dCBub3Q6XG5cdFx0XHRhID0gMVxuXHRcdFx0YSA9IDJcblx0XHQqL1xuXHRcdGNvbnN0IHRoaXNCbG9ja0xvY2FsTmFtZXMgPSBuZXcgU2V0KClcblxuXHRcdC8vIEFsbCBzaGFkb3dlZCBsb2NhbHMgZm9yIHRoaXMgYmxvY2suXG5cdFx0Y29uc3Qgc2hhZG93ZWQgPSBbIF1cblxuXHRcdGNvbnN0IHZlcmlmeUxpbmUgPSBsaW5lID0+IHtcblx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgRGVidWcpXG5cdFx0XHRcdC8vIFRPRE86IERvIGFueXRoaW5nIGluIHRoaXMgc2l0dWF0aW9uP1xuXHRcdFx0XHQvLyBjb250ZXh0LmNoZWNrKCFpbkRlYnVnLCBsaW5lLmxvYywgJ1JlZHVuZGFudCBgZGVidWdgLicpXG5cdFx0XHRcdHdpdGhJbkRlYnVnKCgpID0+IGxpbmUubGluZXMuZm9yRWFjaCh2ZXJpZnlMaW5lKSlcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR2ZXJpZnlJc1N0YXRlbWVudChsaW5lKVxuXHRcdFx0XHRmb3IgKGNvbnN0IG5ld0xvY2FsIG9mIGxpbmVOZXdMb2NhbHMobGluZSkpIHtcblx0XHRcdFx0XHRjb25zdCBuYW1lID0gbmV3TG9jYWwubmFtZVxuXHRcdFx0XHRcdGNvbnN0IG9sZExvY2FsID0gbG9jYWxzLmdldChuYW1lKVxuXHRcdFx0XHRcdGlmIChvbGRMb2NhbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKCF0aGlzQmxvY2tMb2NhbE5hbWVzLmhhcyhuYW1lKSwgbmV3TG9jYWwubG9jLFxuXHRcdFx0XHRcdFx0XHQoKSA9PiBgQSBsb2NhbCAke2NvZGUobmFtZSl9IGlzIGFscmVhZHkgaW4gdGhpcyBibG9jay5gKVxuXHRcdFx0XHRcdFx0c2hhZG93ZWQucHVzaChvbGRMb2NhbClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpc0Jsb2NrTG9jYWxOYW1lcy5hZGQobmFtZSlcblx0XHRcdFx0XHRzZXRMb2NhbChuZXdMb2NhbClcblxuXHRcdFx0XHRcdC8vIE5vdyB0aGF0IGl0J3MgYWRkZWQgYXMgYSBsb2NhbCwgaXQncyBubyBsb25nZXIgcGVuZGluZy5cblx0XHRcdFx0XHQvLyBXZSBhZGRlZCBwZW5kaW5nQmxvY2tMb2NhbHMgaW4gdGhlIHJpZ2h0IG9yZGVyIHRoYXQgd2UgY2FuIGp1c3QgcG9wIHRoZW0gb2ZmLlxuXHRcdFx0XHRcdGNvbnN0IHBvcHBlZCA9IHBlbmRpbmdCbG9ja0xvY2Fscy5wb3AoKVxuXHRcdFx0XHRcdGFzc2VydChwb3BwZWQgPT09IG5ld0xvY2FsKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGxpbmUudmVyaWZ5KClcblx0XHRcdH1cblx0XHR9XG5cblx0XHRsaW5lcy5mb3JFYWNoKHZlcmlmeUxpbmUpXG5cblx0XHRuZXdMb2NhbHMuZm9yRWFjaChkZWxldGVMb2NhbClcblx0XHRzaGFkb3dlZC5mb3JFYWNoKHNldExvY2FsKVxuXG5cdFx0cmV0dXJuIG5ld0xvY2Fsc1xuXHR9LFxuXG5cdHZlcmlmeUlzU3RhdGVtZW50ID0gbGluZSA9PiB7XG5cdFx0Y29uc3QgaXNTdGF0ZW1lbnQgPVxuXHRcdFx0bGluZSBpbnN0YW5jZW9mIERvIHx8XG5cdFx0XHQvLyBTb21lIHZhbHVlcyBhcmUgYWxzbyBhY2NlcHRhYmxlLlxuXHRcdFx0bGluZSBpbnN0YW5jZW9mIENhbGwgfHxcblx0XHRcdGxpbmUgaW5zdGFuY2VvZiBZaWVsZCB8fFxuXHRcdFx0bGluZSBpbnN0YW5jZW9mIFlpZWxkVG9cblx0XHRjb250ZXh0LmNoZWNrKGlzU3RhdGVtZW50LCBsaW5lLmxvYywgJ0V4cHJlc3Npb24gaW4gc3RhdGVtZW50IHBvc2l0aW9uLicpXG5cdH1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9
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
	isInGenerator, results,
	// Name of the closest AssignSingle
	name;

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
		setLocalDeclareAccessed(declare, access);
	},
	      setLocalDeclareAccessed = (declare, access) => {
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
	      registerLocal = localDeclare => {
		results.localDeclareToInfo.set(localDeclare, _VerifyResults.LocalInfo.empty(isInDebug));
	},
	      setName = expr => {
		results.names.set(expr, name);
	};

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
	      withName = (newName, action) => {
		const oldName = name;
		name = newName;
		action();
		name = oldName;
	},
	     

	// Can't break out of loop inside of IIFE.
	withIIFE = action => {
		withInLoop(false, action);
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
			withName(this.assignee.name, () => {
				const doV = () => {
					/*
     Fun and Class only get name if they are immediately after the assignment.
     so in `x = $after-time 1000 |` the function is not named.
     */
					if (this.value instanceof _MsAst.Class || this.value instanceof _MsAst.Fun) setName(this.value);

					// Assignee registered by verifyLines.
					this.assignee.verify();
					this.value.verify();
				};
				if (this.assignee.isLazy()) withBlockLocals(doV);else doV();
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
			// name set by AssignSingle
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
			// name set by AssignSingle
		},

		Ignore() {
			for (const _ of this.ignored) accessLocal(this, _);
		},

		Lazy() {
			withBlockLocals(() => this.value.verify());
		},

		LocalAccess() {
			const declare = locals.get(this.name);
			if (declare === undefined) {
				const builtinPath = context.opts.builtinNameToPath.get(this.name);
				if (builtinPath === undefined) failMissingLocal(this.loc, this.name);else {
					const names = results.builtinPathToNames.get(builtinPath);
					if (names === undefined) results.builtinPathToNames.set(builtinPath, new Set([this.name]));else names.add(this.name);
				}
			} else {
				results.localAccessToDeclare.set(this, declare);
				setLocalDeclareAccessed(declare, this);
			}
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
			verifyOpEach(this.opUseGlobal);
			withInDebug(() => {
				for (const _ of this.debugUses) _.verify();
			});

			withName(context.opts.moduleName(), () => {
				const newLocals = verifyLines(this.lines);
				for (const _ of this.exports) accessLocalForReturn(_, this);
				(0, _util.opEach)(this.opDefaultExport, _ => {
					if (_ instanceof _MsAst.Class || _ instanceof _MsAst.Fun) setName(_);
					plusLocals(newLocals, () => {
						_.verify();
					});
				});

				const exports = new Set(this.exports);
				const markExportLines = line => {
					if (line instanceof _MsAst.Assign && line.allAssignees().some(_ => exports.has(_))) results.exportAssigns.add(line);else if (line instanceof _MsAst.Debug) line.lines.forEach(markExportLines);
				};
				this.lines.forEach(markExportLines);
			});
		},

		New() {
			this.type.verify();
			for (const _ of this.args) _.verify();
		},

		ObjEntryAssign() {
			accessLocal(this, 'built');
			this.assign.verify();
			for (const _ of this.assign.allAssignees()) accessLocal(this, _.name);
		},

		ObjEntryComputed() {
			accessLocal(this, 'built');
			this.key.verify();
			this.value.verify();
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

		SpecialVal() {
			setName(this);
		},

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

		Use: verifyUse,
		UseGlobal: verifyUse,

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
		for (const _ of this.values) _.verify();
		this.result.verify();
	}

	function verifyExcept() {
		this._try.verify();
		verifyOpEach(this._catch);
		verifyOpEach(this._finally);
	}

	function verifyUse() {
		// Since Uses are always in the outermost scope, don't have to worry about shadowing.
		// So we mutate `locals` directly.
		const addUseLocal = _ => {
			const prev = locals.get(_.name);
			context.check(prev === undefined, _.loc, () => `${ (0, _CompileError.code)(_.name) } already imported at ${ prev.loc }`);
			verifyLocalDeclare(_);
			setLocal(_);
		};
		for (const _ of this.used) addUseLocal(_);
		(0, _util.opEach)(this.opUseDefault, addUseLocal);
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
		if (declare === undefined) failMissingLocal(accessLoc, name);
		return declare;
	},
	      failMissingLocal = (loc, name) => {
		context.fail(loc, () => {
			const showLocals = (0, _CompileError.code)(Array(...locals.keys()).join(' '));
			return `No such local ${ (0, _CompileError.code)(name) }.\nLocals are:\n${ showLocals }.`;
		});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZlcmlmeS5qcyIsInByaXZhdGUvdmVyaWZ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztrQkNXZSxDQUFDLFFBQVEsRUFBRSxLQUFLLEtBQUs7QUFDbkMsU0FBTyxHQUFHLFFBQVEsQ0FBQTtBQUNsQixRQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUNsQixvQkFBa0IsR0FBRyxFQUFHLENBQUE7QUFDeEIsV0FBUyxHQUFHLGFBQWEsR0FBRyxLQUFLLENBQUE7QUFDakMsWUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDdEIsUUFBTSxHQUFHLElBQUksQ0FBQTtBQUNiLFNBQU8sR0FBRyw2QkFBbUIsQ0FBQTs7QUFFN0IsT0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBQ2QsZ0JBQWMsRUFBRSxDQUFBOztBQUVoQixRQUFNLEdBQUcsR0FBRyxPQUFPLENBQUE7O0FBRW5CLFNBQU8sR0FBRyxNQUFNLEdBQUcsVUFBVSxHQUFHLE1BQU0sR0FBRyxrQkFBa0IsR0FBRyxPQUFPLEdBQUcsU0FBUyxDQUFBO0FBQ2pGLFNBQU8sR0FBRyxDQUFBO0VBQ1Y7OztBQUdELEtBQ0MsT0FBTzs7QUFFUCxPQUFNOztBQUVOLFdBQVUsRUFDVixNQUFNOzs7Ozs7Ozs7Ozs7Ozs7QUFlTixtQkFBa0IsRUFDbEIsU0FBUzs7QUFFVCxjQUFhLEVBQ2IsT0FBTzs7QUFFUCxLQUFJLENBQUE7O0FBRUwsT0FDQyxZQUFZLEdBQUcsRUFBRSxJQUFJO0FBQ3BCLE1BQUksRUFBRSxLQUFLLElBQUksRUFDZCxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUE7RUFDWjtPQUVELFdBQVcsR0FBRyxZQUFZLElBQ3pCLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQztPQUVqQyxRQUFRLEdBQUcsWUFBWSxJQUN0QixNQUFNLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDOzs7OztBQUk1Qyxx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RDs7QUFFbEIsTUFBSSxtQkFwdEJxRCxJQUFJLEFBb3RCekMsSUFDcEIsSUFBSSxtQkFwdEJvRSxLQUFLLEFBb3RCeEQsSUFDckIsSUFBSSxtQkFydEIyRSxPQUFPLEFBcXRCL0QsQ0FBQTtBQUN4QixTQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLG1DQUFtQyxDQUFDLENBQUE7RUFDekUsQ0FBQSIsImZpbGUiOiJwcml2YXRlL3ZlcmlmeS5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHsgY29kZSB9IGZyb20gJy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCAqIGFzIE1zQXN0VHlwZXMgZnJvbSAnLi9Nc0FzdCdcbmltcG9ydCB7IEFzc2lnbiwgQXNzaWduRGVzdHJ1Y3R1cmUsIEFzc2lnblNpbmdsZSwgQmxvY2tWYWwsIENhbGwsIENsYXNzLCBEZWJ1ZywgRG8sIEZvclZhbCwgRnVuLFxuXHRMb2NhbERlY2xhcmVCdWlsdCwgTG9jYWxEZWNsYXJlRm9jdXMsIExvY2FsRGVjbGFyZVJlcywgT2JqRW50cnksIFBhdHRlcm4sIFlpZWxkLCBZaWVsZFRvXG5cdH0gZnJvbSAnLi9Nc0FzdCdcbmltcG9ydCB7IGFzc2VydCwgY2F0LCBlYWNoUmV2ZXJzZSwgaGVhZCwgaWZFbHNlLCBpbXBsZW1lbnRNYW55LCBpc0VtcHR5LCBvcEVhY2ggfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgVmVyaWZ5UmVzdWx0cywgeyBMb2NhbEluZm8gfSBmcm9tICcuL1ZlcmlmeVJlc3VsdHMnXG5cbi8qXG5UaGUgdmVyaWZpZXIgZ2VuZXJhdGVzIGluZm9ybWF0aW9uIG5lZWRlZCBkdXJpbmcgdHJhbnNwaWxpbmcsIHRoZSBWZXJpZnlSZXN1bHRzLlxuKi9cbmV4cG9ydCBkZWZhdWx0IChfY29udGV4dCwgbXNBc3QpID0+IHtcblx0Y29udGV4dCA9IF9jb250ZXh0XG5cdGxvY2FscyA9IG5ldyBNYXAoKVxuXHRwZW5kaW5nQmxvY2tMb2NhbHMgPSBbIF1cblx0aXNJbkRlYnVnID0gaXNJbkdlbmVyYXRvciA9IGZhbHNlXG5cdG9rVG9Ob3RVc2UgPSBuZXcgU2V0KClcblx0b3BMb29wID0gbnVsbFxuXHRyZXN1bHRzID0gbmV3IFZlcmlmeVJlc3VsdHMoKVxuXG5cdG1zQXN0LnZlcmlmeSgpXG5cdHZlcmlmeUxvY2FsVXNlKClcblxuXHRjb25zdCByZXMgPSByZXN1bHRzXG5cdC8vIFJlbGVhc2UgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cblx0Y29udGV4dCA9IGxvY2FscyA9IG9rVG9Ob3RVc2UgPSBvcExvb3AgPSBwZW5kaW5nQmxvY2tMb2NhbHMgPSByZXN1bHRzID0gdW5kZWZpbmVkXG5cdHJldHVybiByZXNcbn1cblxuLy8gVXNlIGEgdHJpY2sgbGlrZSBpbiBwYXJzZS5qcyBhbmQgaGF2ZSBldmVyeXRoaW5nIGNsb3NlIG92ZXIgdGhlc2UgbXV0YWJsZSB2YXJpYWJsZXMuXG5sZXRcblx0Y29udGV4dCxcblx0Ly8gTWFwIGZyb20gbmFtZXMgdG8gTG9jYWxEZWNsYXJlcy5cblx0bG9jYWxzLFxuXHQvLyBMb2NhbHMgdGhhdCBkb24ndCBoYXZlIHRvIGJlIGFjY2Vzc2VkLlxuXHRva1RvTm90VXNlLFxuXHRvcExvb3AsXG5cdC8qXG5cdExvY2FscyBmb3IgdGhpcyBibG9jay5cblx0VGhlc2UgYXJlIGFkZGVkIHRvIGxvY2FscyB3aGVuIGVudGVyaW5nIGEgRnVuY3Rpb24gb3IgbGF6eSBldmFsdWF0aW9uLlxuXHRJbjpcblx0XHRhID0gfFxuXHRcdFx0YlxuXHRcdGIgPSAxXG5cdGBiYCB3aWxsIGJlIGEgcGVuZGluZyBsb2NhbC5cblx0SG93ZXZlcjpcblx0XHRhID0gYlxuXHRcdGIgPSAxXG5cdHdpbGwgZmFpbCB0byB2ZXJpZnksIGJlY2F1c2UgYGJgIGNvbWVzIGFmdGVyIGBhYCBhbmQgaXMgbm90IGFjY2Vzc2VkIGluc2lkZSBhIGZ1bmN0aW9uLlxuXHRJdCB3b3VsZCB3b3JrIGZvciBgfmEgaXMgYmAsIHRob3VnaC5cblx0Ki9cblx0cGVuZGluZ0Jsb2NrTG9jYWxzLFxuXHRpc0luRGVidWcsXG5cdC8vIFdoZXRoZXIgd2UgYXJlIGN1cnJlbnRseSBhYmxlIHRvIHlpZWxkLlxuXHRpc0luR2VuZXJhdG9yLFxuXHRyZXN1bHRzLFxuXHQvLyBOYW1lIG9mIHRoZSBjbG9zZXN0IEFzc2lnblNpbmdsZVxuXHRuYW1lXG5cbmNvbnN0XG5cdHZlcmlmeU9wRWFjaCA9IG9wID0+IHtcblx0XHRpZiAob3AgIT09IG51bGwpXG5cdFx0XHRvcC52ZXJpZnkoKVxuXHR9LFxuXG5cdGRlbGV0ZUxvY2FsID0gbG9jYWxEZWNsYXJlID0+XG5cdFx0bG9jYWxzLmRlbGV0ZShsb2NhbERlY2xhcmUubmFtZSksXG5cblx0c2V0TG9jYWwgPSBsb2NhbERlY2xhcmUgPT5cblx0XHRsb2NhbHMuc2V0KGxvY2FsRGVjbGFyZS5uYW1lLCBsb2NhbERlY2xhcmUpLFxuXG5cdC8vIFdoZW4gYSBsb2NhbCBpcyByZXR1cm5lZCBmcm9tIGEgQmxvY2tPYmogb3IgTW9kdWxlLFxuXHQvLyB0aGUgcmV0dXJuICdhY2Nlc3MnIGlzIGNvbnNpZGVyZWQgdG8gYmUgJ2RlYnVnJyBpZiB0aGUgbG9jYWwgaXMuXG5cdGFjY2Vzc0xvY2FsRm9yUmV0dXJuID0gKGRlY2xhcmUsIGFjY2VzcykgPT4ge1xuXHRcdGNvbnN0IGluZm8gPSByZXN1bHRzLmxvY2FsRGVjbGFyZVRvSW5mby5nZXQoZGVjbGFyZSlcblx0XHRfYWRkTG9jYWxBY2Nlc3MoaW5mbywgYWNjZXNzLCBpbmZvLmlzSW5EZWJ1Zylcblx0fSxcblxuXHRhY2Nlc3NMb2NhbCA9IChhY2Nlc3MsIG5hbWUpID0+IHtcblx0XHRjb25zdCBkZWNsYXJlID0gZ2V0TG9jYWxEZWNsYXJlKG5hbWUsIGFjY2Vzcy5sb2MpXG5cdFx0c2V0TG9jYWxEZWNsYXJlQWNjZXNzZWQoZGVjbGFyZSwgYWNjZXNzKVxuXHR9LFxuXG5cdHNldExvY2FsRGVjbGFyZUFjY2Vzc2VkID0gKGRlY2xhcmUsIGFjY2VzcykgPT4ge1xuXHRcdF9hZGRMb2NhbEFjY2VzcyhyZXN1bHRzLmxvY2FsRGVjbGFyZVRvSW5mby5nZXQoZGVjbGFyZSksIGFjY2VzcywgaXNJbkRlYnVnKVxuXHR9LFxuXG5cdF9hZGRMb2NhbEFjY2VzcyA9IChsb2NhbEluZm8sIGFjY2VzcywgaXNEZWJ1Z0FjY2VzcykgPT5cblx0XHQoaXNEZWJ1Z0FjY2VzcyA/IGxvY2FsSW5mby5kZWJ1Z0FjY2Vzc2VzIDogbG9jYWxJbmZvLm5vbkRlYnVnQWNjZXNzZXMpLnB1c2goYWNjZXNzKSxcblxuXHQvLyBGb3IgZXhwcmVzc2lvbnMgYWZmZWN0aW5nIGxpbmVOZXdMb2NhbHMsIHRoZXkgd2lsbCBiZSByZWdpc3RlcmVkIGJlZm9yZSBiZWluZyB2ZXJpZmllZC5cblx0Ly8gU28sIExvY2FsRGVjbGFyZS52ZXJpZnkganVzdCB0aGUgdHlwZS5cblx0Ly8gRm9yIGxvY2FscyBub3QgYWZmZWN0aW5nIGxpbmVOZXdMb2NhbHMsIHVzZSB0aGlzIGluc3RlYWQgb2YganVzdCBkZWNsYXJlLnZlcmlmeSgpXG5cdHZlcmlmeUxvY2FsRGVjbGFyZSA9IGxvY2FsRGVjbGFyZSA9PiB7XG5cdFx0cmVnaXN0ZXJMb2NhbChsb2NhbERlY2xhcmUpXG5cdFx0bG9jYWxEZWNsYXJlLnZlcmlmeSgpXG5cdH0sXG5cblx0cmVnaXN0ZXJMb2NhbCA9IGxvY2FsRGVjbGFyZSA9PiB7XG5cdFx0cmVzdWx0cy5sb2NhbERlY2xhcmVUb0luZm8uc2V0KGxvY2FsRGVjbGFyZSwgTG9jYWxJbmZvLmVtcHR5KGlzSW5EZWJ1ZykpXG5cdH0sXG5cblx0c2V0TmFtZSA9IGV4cHIgPT4ge1xuXHRcdHJlc3VsdHMubmFtZXMuc2V0KGV4cHIsIG5hbWUpXG5cdH1cblxuLy8gVGhlc2UgZnVuY3Rpb25zIGNoYW5nZSB2ZXJpZmllciBzdGF0ZSBhbmQgZWZmaWNpZW50bHkgcmV0dXJuIHRvIHRoZSBvbGQgc3RhdGUgd2hlbiBmaW5pc2hlZC5cbmNvbnN0XG5cdHdpdGhJbkRlYnVnID0gYWN0aW9uID0+IHtcblx0XHRjb25zdCBvbGRJc0luRGVidWcgPSBpc0luRGVidWdcblx0XHRpc0luRGVidWcgPSB0cnVlXG5cdFx0YWN0aW9uKClcblx0XHRpc0luRGVidWcgPSBvbGRJc0luRGVidWdcblx0fSxcblxuXHR3aXRoSW5HZW5lcmF0b3IgPSAobmV3SXNJbkdlbmVyYXRvciwgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgb2xkSXNJbkdlbmVyYXRvciA9IGlzSW5HZW5lcmF0b3Jcblx0XHRpc0luR2VuZXJhdG9yID0gbmV3SXNJbkdlbmVyYXRvclxuXHRcdGFjdGlvbigpXG5cdFx0aXNJbkdlbmVyYXRvciA9IG9sZElzSW5HZW5lcmF0b3Jcblx0fSxcblxuXHR3aXRoSW5Mb29wID0gKG5ld0xvb3AsIGFjdGlvbikgPT4ge1xuXHRcdGNvbnN0IG9sZExvb3AgPSBvcExvb3Bcblx0XHRvcExvb3AgPSBuZXdMb29wXG5cdFx0YWN0aW9uKClcblx0XHRvcExvb3AgPSBvbGRMb29wXG5cdH0sXG5cblx0d2l0aE5hbWUgPSAobmV3TmFtZSwgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgb2xkTmFtZSA9IG5hbWVcblx0XHRuYW1lID0gbmV3TmFtZVxuXHRcdGFjdGlvbigpXG5cdFx0bmFtZSA9IG9sZE5hbWVcblx0fSxcblxuXHQvLyBDYW4ndCBicmVhayBvdXQgb2YgbG9vcCBpbnNpZGUgb2YgSUlGRS5cblx0d2l0aElJRkUgPSBhY3Rpb24gPT4ge1xuXHRcdHdpdGhJbkxvb3AoZmFsc2UsIGFjdGlvbilcblx0fSxcblxuXHRwbHVzTG9jYWwgPSAoYWRkZWRMb2NhbCwgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgc2hhZG93ZWQgPSBsb2NhbHMuZ2V0KGFkZGVkTG9jYWwubmFtZSlcblx0XHRsb2NhbHMuc2V0KGFkZGVkTG9jYWwubmFtZSwgYWRkZWRMb2NhbClcblx0XHRhY3Rpb24oKVxuXHRcdGlmIChzaGFkb3dlZCA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0ZGVsZXRlTG9jYWwoYWRkZWRMb2NhbClcblx0XHRlbHNlXG5cdFx0XHRzZXRMb2NhbChzaGFkb3dlZClcblx0fSxcblxuXHQvLyBTaG91bGQgaGF2ZSB2ZXJpZmllZCB0aGF0IGFkZGVkTG9jYWxzIGFsbCBoYXZlIGRpZmZlcmVudCBuYW1lcy5cblx0cGx1c0xvY2FscyA9IChhZGRlZExvY2FscywgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgc2hhZG93ZWRMb2NhbHMgPSBbIF1cblx0XHRmb3IgKGNvbnN0IF8gb2YgYWRkZWRMb2NhbHMpIHtcblx0XHRcdGNvbnN0IHNoYWRvd2VkID0gbG9jYWxzLmdldChfLm5hbWUpXG5cdFx0XHRpZiAoc2hhZG93ZWQgIT09IHVuZGVmaW5lZClcblx0XHRcdFx0c2hhZG93ZWRMb2NhbHMucHVzaChzaGFkb3dlZClcblx0XHRcdHNldExvY2FsKF8pXG5cdFx0fVxuXG5cdFx0YWN0aW9uKClcblxuXHRcdGFkZGVkTG9jYWxzLmZvckVhY2goZGVsZXRlTG9jYWwpXG5cdFx0c2hhZG93ZWRMb2NhbHMuZm9yRWFjaChzZXRMb2NhbClcblx0fSxcblxuXHR2ZXJpZnlBbmRQbHVzTG9jYWwgPSAoYWRkZWRMb2NhbCwgYWN0aW9uKSA9PiB7XG5cdFx0dmVyaWZ5TG9jYWxEZWNsYXJlKGFkZGVkTG9jYWwpXG5cdFx0cGx1c0xvY2FsKGFkZGVkTG9jYWwsIGFjdGlvbilcblx0fSxcblxuXHR2ZXJpZnlBbmRQbHVzTG9jYWxzID0gKGFkZGVkTG9jYWxzLCBhY3Rpb24pID0+IHtcblx0XHRhZGRlZExvY2Fscy5mb3JFYWNoKHZlcmlmeUxvY2FsRGVjbGFyZSlcblx0XHRjb25zdCBuYW1lcyA9IG5ldyBTZXQoKVxuXHRcdGZvciAoY29uc3QgXyBvZiBhZGRlZExvY2Fscykge1xuXHRcdFx0Y29udGV4dC5jaGVjayghbmFtZXMuaGFzKF8ubmFtZSksIF8ubG9jLCAoKSA9PlxuXHRcdFx0XHRgRHVwbGljYXRlIGxvY2FsICR7Y29kZShfLm5hbWUpfWApXG5cdFx0XHRuYW1lcy5hZGQoXy5uYW1lKVxuXHRcdH1cblx0XHRwbHVzTG9jYWxzKGFkZGVkTG9jYWxzLCBhY3Rpb24pXG5cdH0sXG5cblx0d2l0aEJsb2NrTG9jYWxzID0gYWN0aW9uID0+IHtcblx0XHRjb25zdCBvbGRQZW5kaW5nQmxvY2tMb2NhbHMgPSBwZW5kaW5nQmxvY2tMb2NhbHNcblx0XHRwZW5kaW5nQmxvY2tMb2NhbHMgPSBbIF1cblx0XHRwbHVzTG9jYWxzKG9sZFBlbmRpbmdCbG9ja0xvY2FscywgYWN0aW9uKVxuXHRcdHBlbmRpbmdCbG9ja0xvY2FscyA9IG9sZFBlbmRpbmdCbG9ja0xvY2Fsc1xuXHR9XG5cbmNvbnN0IHZlcmlmeUxvY2FsVXNlID0gKCkgPT5cblx0cmVzdWx0cy5sb2NhbERlY2xhcmVUb0luZm8uZm9yRWFjaCgoaW5mbywgbG9jYWwpID0+IHtcblx0XHRpZiAoIShsb2NhbCBpbnN0YW5jZW9mIExvY2FsRGVjbGFyZUJ1aWx0IHx8IGxvY2FsIGluc3RhbmNlb2YgTG9jYWxEZWNsYXJlUmVzKSkge1xuXHRcdFx0Y29uc3Qgbm9Ob25EZWJ1ZyA9IGlzRW1wdHkoaW5mby5ub25EZWJ1Z0FjY2Vzc2VzKVxuXHRcdFx0aWYgKG5vTm9uRGVidWcgJiYgaXNFbXB0eShpbmZvLmRlYnVnQWNjZXNzZXMpKVxuXHRcdFx0XHRjb250ZXh0Lndhcm5JZighb2tUb05vdFVzZS5oYXMobG9jYWwpLCBsb2NhbC5sb2MsICgpID0+XG5cdFx0XHRcdFx0YFVudXNlZCBsb2NhbCB2YXJpYWJsZSAke2NvZGUobG9jYWwubmFtZSl9LmApXG5cdFx0XHRlbHNlIGlmIChpbmZvLmlzSW5EZWJ1Zylcblx0XHRcdFx0Y29udGV4dC53YXJuSWYoIW5vTm9uRGVidWcsICgpID0+IGhlYWQoaW5mby5ub25EZWJ1Z0FjY2Vzc2VzKS5sb2MsICgpID0+XG5cdFx0XHRcdFx0YERlYnVnLW9ubHkgbG9jYWwgJHtjb2RlKGxvY2FsLm5hbWUpfSB1c2VkIG91dHNpZGUgb2YgZGVidWcuYClcblx0XHRcdGVsc2Vcblx0XHRcdFx0Y29udGV4dC53YXJuSWYobm9Ob25EZWJ1ZywgbG9jYWwubG9jLCAoKSA9PlxuXHRcdFx0XHRcdGBMb2NhbCAke2NvZGUobG9jYWwubmFtZSl9IHVzZWQgb25seSBpbiBkZWJ1Zy5gKVxuXHRcdH1cblx0fSlcblxuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICd2ZXJpZnknLCB7XG5cdEFzc2VydCgpIHtcblx0XHR0aGlzLmNvbmRpdGlvbi52ZXJpZnkoKVxuXHRcdHZlcmlmeU9wRWFjaCh0aGlzLm9wVGhyb3duKVxuXHR9LFxuXG5cdEFzc2lnblNpbmdsZSgpIHtcblx0XHR3aXRoTmFtZSh0aGlzLmFzc2lnbmVlLm5hbWUsICgpID0+IHtcblx0XHRcdGNvbnN0IGRvViA9ICgpID0+IHtcblx0XHRcdFx0Lypcblx0XHRcdFx0RnVuIGFuZCBDbGFzcyBvbmx5IGdldCBuYW1lIGlmIHRoZXkgYXJlIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBhc3NpZ25tZW50LlxuXHRcdFx0XHRzbyBpbiBgeCA9ICRhZnRlci10aW1lIDEwMDAgfGAgdGhlIGZ1bmN0aW9uIGlzIG5vdCBuYW1lZC5cblx0XHRcdFx0Ki9cblx0XHRcdFx0aWYgKHRoaXMudmFsdWUgaW5zdGFuY2VvZiBDbGFzcyB8fCB0aGlzLnZhbHVlIGluc3RhbmNlb2YgRnVuKVxuXHRcdFx0XHRcdHNldE5hbWUodGhpcy52YWx1ZSlcblxuXHRcdFx0XHQvLyBBc3NpZ25lZSByZWdpc3RlcmVkIGJ5IHZlcmlmeUxpbmVzLlxuXHRcdFx0XHR0aGlzLmFzc2lnbmVlLnZlcmlmeSgpXG5cdFx0XHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLmFzc2lnbmVlLmlzTGF6eSgpKVxuXHRcdFx0XHR3aXRoQmxvY2tMb2NhbHMoZG9WKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRkb1YoKVxuXHRcdH0pXG5cdH0sXG5cblx0QXNzaWduRGVzdHJ1Y3R1cmUoKSB7XG5cdFx0Ly8gQXNzaWduZWVzIHJlZ2lzdGVyZWQgYnkgdmVyaWZ5TGluZXMuXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXNzaWduZWVzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0fSxcblxuXHRCYWdFbnRyeTogdmVyaWZ5QmFnRW50cnksXG5cdEJhZ0VudHJ5TWFueTogdmVyaWZ5QmFnRW50cnksXG5cblx0QmFnU2ltcGxlKCkge1xuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLnBhcnRzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHR9LFxuXG5cdEJsb2NrRG8oKSB7IHZlcmlmeUxpbmVzKHRoaXMubGluZXMpIH0sXG5cblx0QmxvY2tWYWxUaHJvdygpIHtcblx0XHRjb25zdCBuZXdMb2NhbHMgPSB2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHRcdHBsdXNMb2NhbHMobmV3TG9jYWxzLCAoKSA9PiB0aGlzLnRocm93LnZlcmlmeSgpKVxuXHR9LFxuXG5cdEJsb2NrV2l0aFJldHVybigpIHtcblx0XHRjb25zdCBuZXdMb2NhbHMgPSB2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHRcdHBsdXNMb2NhbHMobmV3TG9jYWxzLCAoKSA9PiB0aGlzLnJldHVybmVkLnZlcmlmeSgpKVxuXHR9LFxuXG5cdEJsb2NrT2JqKCkge1xuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmJ1aWx0LCAoKSA9PiB7XG5cdFx0XHRjb25zdCBuZXdMb2NhbHMgPSB2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHRcdFx0b3BFYWNoKHRoaXMub3BPYmplZCwgXyA9PiBwbHVzTG9jYWxzKG5ld0xvY2FscywgKCkgPT4gXy52ZXJpZnkoKSkpXG5cdFx0fSlcblx0fSxcblxuXHRCbG9ja0JhZzogdmVyaWZ5QmxvY2tCYWdPck1hcCxcblx0QmxvY2tNYXA6IHZlcmlmeUJsb2NrQmFnT3JNYXAsXG5cblx0QmxvY2tXcmFwKCkgeyB3aXRoSUlGRSgoKSA9PiB0aGlzLmJsb2NrLnZlcmlmeSgpKSB9LFxuXG5cdEJyZWFrKCkge1xuXHRcdHZlcmlmeUluTG9vcCh0aGlzKVxuXHRcdGNvbnRleHQuY2hlY2soIShvcExvb3AgaW5zdGFuY2VvZiBGb3JWYWwpLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdGAke2NvZGUoJ2ZvcicpfSBtdXN0IGJyZWFrIHdpdGggYSB2YWx1ZS5gKVxuXHR9LFxuXG5cdEJyZWFrV2l0aFZhbCgpIHtcblx0XHR2ZXJpZnlJbkxvb3AodGhpcylcblx0XHRjb250ZXh0LmNoZWNrKG9wTG9vcCBpbnN0YW5jZW9mIEZvclZhbCwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRgJHtjb2RlKCdicmVhaycpfSBvbmx5IHZhbGlkIGluc2lkZSAke2NvZGUoJ2ZvcicpfWApXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdENhbGwoKSB7XG5cdFx0dGhpcy5jYWxsZWQudmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hcmdzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHR9LFxuXG5cdENhc2VEbygpIHsgdmVyaWZ5Q2FzZSh0aGlzKSB9LFxuXHRDYXNlRG9QYXJ0OiB2ZXJpZnlDYXNlUGFydCxcblx0Q2FzZVZhbCgpIHsgd2l0aElJRkUoKCkgPT4gdmVyaWZ5Q2FzZSh0aGlzKSkgfSxcblx0Q2FzZVZhbFBhcnQ6IHZlcmlmeUNhc2VQYXJ0LFxuXG5cdENhdGNoKCkge1xuXHRcdGNvbnRleHQuY2hlY2sodGhpcy5jYXVnaHQub3BUeXBlID09PSBudWxsLCB0aGlzLmNhdWdodC5sb2MsICdUT0RPOiBDYXVnaHQgdHlwZXMnKVxuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmNhdWdodCwgKCkgPT4gdGhpcy5ibG9jay52ZXJpZnkoKSlcblx0fSxcblxuXHRDbGFzcygpIHtcblx0XHR2ZXJpZnlPcEVhY2godGhpcy5vcFN1cGVyQ2xhc3MpXG5cdFx0dmVyaWZ5T3BFYWNoKHRoaXMub3BEbylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5zdGF0aWNzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdHZlcmlmeU9wRWFjaCh0aGlzLm9wQ29uc3RydWN0b3IpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMubWV0aG9kcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHQvLyBuYW1lIHNldCBieSBBc3NpZ25TaW5nbGVcblx0fSxcblxuXHRDbGFzc0RvKCkge1xuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmRlY2xhcmVGb2N1cywgKCkgPT4gdGhpcy5ibG9jay52ZXJpZnkoKSlcblx0fSxcblxuXHRDb25kaXRpb25hbERvKCkge1xuXHRcdHRoaXMudGVzdC52ZXJpZnkoKVxuXHRcdHRoaXMucmVzdWx0LnZlcmlmeSgpXG5cdH0sXG5cdENvbmRpdGlvbmFsVmFsKCkge1xuXHRcdHRoaXMudGVzdC52ZXJpZnkoKVxuXHRcdHdpdGhJSUZFKCgpID0+IHRoaXMucmVzdWx0LnZlcmlmeSgpKVxuXHR9LFxuXG5cdC8vIE9ubHkgcmVhY2ggaGVyZSBmb3IgaW4vb3V0IGNvbmRpdGlvbi5cblx0RGVidWcoKSB7IHZlcmlmeUxpbmVzKFsgdGhpcyBdKSB9LFxuXG5cdEV4Y2VwdERvOiB2ZXJpZnlFeGNlcHQsXG5cdEV4Y2VwdFZhbDogdmVyaWZ5RXhjZXB0LFxuXG5cdEZvckJhZygpIHsgdmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuYnVpbHQsICgpID0+IHZlcmlmeUZvcih0aGlzKSkgfSxcblxuXHRGb3JEbygpIHsgdmVyaWZ5Rm9yKHRoaXMpIH0sXG5cblx0Rm9yVmFsKCkgeyB2ZXJpZnlGb3IodGhpcykgfSxcblxuXHQvLyBpc0Zvck1ldGhvZEltcGwgaXMgc2V0IGlmIHRoaXMgaXMgYSBNZXRob2RJbXBsJ3MgaW1wbGVtZW50YXRpb24uXG5cdEZ1bihpc0Zvck1ldGhvZEltcGwpIHtcblx0XHR3aXRoQmxvY2tMb2NhbHMoKCkgPT4ge1xuXHRcdFx0Y29udGV4dC5jaGVjayh0aGlzLm9wRGVjbGFyZVJlcyA9PT0gbnVsbCB8fCB0aGlzLmJsb2NrIGluc3RhbmNlb2YgQmxvY2tWYWwsIHRoaXMubG9jLFxuXHRcdFx0XHQnRnVuY3Rpb24gd2l0aCByZXR1cm4gY29uZGl0aW9uIG11c3QgcmV0dXJuIHNvbWV0aGluZy4nKVxuXHRcdFx0d2l0aEluR2VuZXJhdG9yKHRoaXMuaXNHZW5lcmF0b3IsICgpID0+XG5cdFx0XHRcdHdpdGhJbkxvb3AoZmFsc2UsICgpID0+IHtcblx0XHRcdFx0XHRjb25zdCBhbGxBcmdzID0gY2F0KHRoaXMub3BEZWNsYXJlVGhpcywgdGhpcy5hcmdzLCB0aGlzLm9wUmVzdEFyZylcblx0XHRcdFx0XHRpZiAoaXNGb3JNZXRob2RJbXBsKVxuXHRcdFx0XHRcdFx0b2tUb05vdFVzZS5hZGQodGhpcy5vcERlY2xhcmVUaGlzKVxuXHRcdFx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoYWxsQXJncywgKCkgPT4ge1xuXHRcdFx0XHRcdFx0dmVyaWZ5T3BFYWNoKHRoaXMub3BJbilcblx0XHRcdFx0XHRcdHRoaXMuYmxvY2sudmVyaWZ5KClcblx0XHRcdFx0XHRcdG9wRWFjaCh0aGlzLm9wRGVjbGFyZVJlcywgdmVyaWZ5TG9jYWxEZWNsYXJlKVxuXHRcdFx0XHRcdFx0Y29uc3QgdmVyaWZ5T3V0ID0gKCkgPT4gdmVyaWZ5T3BFYWNoKHRoaXMub3BPdXQpXG5cdFx0XHRcdFx0XHRpZkVsc2UodGhpcy5vcERlY2xhcmVSZXMsIF8gPT4gcGx1c0xvY2FsKF8sIHZlcmlmeU91dCksIHZlcmlmeU91dClcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9KSlcblx0XHR9KVxuXHRcdC8vIG5hbWUgc2V0IGJ5IEFzc2lnblNpbmdsZVxuXHR9LFxuXG5cdElnbm9yZSgpIHtcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5pZ25vcmVkKVxuXHRcdFx0YWNjZXNzTG9jYWwodGhpcywgXylcblx0fSxcblxuXHRMYXp5KCkgeyB3aXRoQmxvY2tMb2NhbHMoKCkgPT4gdGhpcy52YWx1ZS52ZXJpZnkoKSkgfSxcblxuXHRMb2NhbEFjY2VzcygpIHtcblx0XHRjb25zdCBkZWNsYXJlID0gbG9jYWxzLmdldCh0aGlzLm5hbWUpXG5cdFx0aWYgKGRlY2xhcmUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3QgYnVpbHRpblBhdGggPSBjb250ZXh0Lm9wdHMuYnVpbHRpbk5hbWVUb1BhdGguZ2V0KHRoaXMubmFtZSlcblx0XHRcdGlmIChidWlsdGluUGF0aCA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRmYWlsTWlzc2luZ0xvY2FsKHRoaXMubG9jLCB0aGlzLm5hbWUpXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc3QgbmFtZXMgPSByZXN1bHRzLmJ1aWx0aW5QYXRoVG9OYW1lcy5nZXQoYnVpbHRpblBhdGgpXG5cdFx0XHRcdGlmIChuYW1lcyA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRcdHJlc3VsdHMuYnVpbHRpblBhdGhUb05hbWVzLnNldChidWlsdGluUGF0aCwgbmV3IFNldChbIHRoaXMubmFtZSBdKSlcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdG5hbWVzLmFkZCh0aGlzLm5hbWUpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc3VsdHMubG9jYWxBY2Nlc3NUb0RlY2xhcmUuc2V0KHRoaXMsIGRlY2xhcmUpXG5cdFx0XHRzZXRMb2NhbERlY2xhcmVBY2Nlc3NlZChkZWNsYXJlLCB0aGlzKVxuXHRcdH1cblx0fSxcblxuXHQvLyBBZGRpbmcgTG9jYWxEZWNsYXJlcyB0byB0aGUgYXZhaWxhYmxlIGxvY2FscyBpcyBkb25lIGJ5IEZ1biBvciBsaW5lTmV3TG9jYWxzLlxuXHRMb2NhbERlY2xhcmUoKSB7IHZlcmlmeU9wRWFjaCh0aGlzLm9wVHlwZSkgfSxcblxuXHRMb2NhbE11dGF0ZSgpIHtcblx0XHRjb25zdCBkZWNsYXJlID0gZ2V0TG9jYWxEZWNsYXJlKHRoaXMubmFtZSwgdGhpcy5sb2MpXG5cdFx0Y29udGV4dC5jaGVjayhkZWNsYXJlLmlzTXV0YWJsZSgpLCB0aGlzLmxvYywgKCkgPT4gYCR7Y29kZSh0aGlzLm5hbWUpfSBpcyBub3QgbXV0YWJsZS5gKVxuXHRcdC8vIFRPRE86IFRyYWNrIG11dGF0aW9ucy4gTXV0YWJsZSBsb2NhbCBtdXN0IGJlIG11dGF0ZWQgc29tZXdoZXJlLlxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0fSxcblxuXHRMb2dpYygpIHtcblx0XHRjb250ZXh0LmNoZWNrKHRoaXMuYXJncy5sZW5ndGggPiAxLCAnTG9naWMgZXhwcmVzc2lvbiBuZWVkcyBhdCBsZWFzdCAyIGFyZ3VtZW50cy4nKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0Tm90KCkgeyB0aGlzLmFyZy52ZXJpZnkoKSB9LFxuXG5cdE51bWJlckxpdGVyYWwoKSB7IH0sXG5cblx0TWFwRW50cnkoKSB7XG5cdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR0aGlzLmtleS52ZXJpZnkoKVxuXHRcdHRoaXMudmFsLnZlcmlmeSgpXG5cdH0sXG5cblx0TWVtYmVyKCkgeyB0aGlzLm9iamVjdC52ZXJpZnkoKSB9LFxuXG5cdE1lbWJlclNldCgpIHtcblx0XHR0aGlzLm9iamVjdC52ZXJpZnkoKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0fSxcblxuXHRNZXRob2RJbXBsKCkge1xuXHRcdGlmICh0eXBlb2YgdGhpcy5zeW1ib2wgIT09ICdzdHJpbmcnKVxuXHRcdFx0dGhpcy5zeW1ib2wudmVyaWZ5KClcblx0XHR0aGlzLmZ1bi52ZXJpZnkodHJ1ZSlcblx0fSxcblxuXHRNb2R1bGUoKSB7XG5cdFx0Ly8gTm8gbmVlZCB0byB2ZXJpZnkgdGhpcy5kb1VzZXMuXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMudXNlcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHR2ZXJpZnlPcEVhY2godGhpcy5vcFVzZUdsb2JhbClcblx0XHR3aXRoSW5EZWJ1ZygoKSA9PiB7XG5cdFx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5kZWJ1Z1VzZXMpXG5cdFx0XHRcdF8udmVyaWZ5KClcblx0XHR9KVxuXG5cdFx0d2l0aE5hbWUoY29udGV4dC5vcHRzLm1vZHVsZU5hbWUoKSwgKCkgPT4ge1xuXHRcdFx0Y29uc3QgbmV3TG9jYWxzID0gdmVyaWZ5TGluZXModGhpcy5saW5lcylcblx0XHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmV4cG9ydHMpXG5cdFx0XHRcdGFjY2Vzc0xvY2FsRm9yUmV0dXJuKF8sIHRoaXMpXG5cdFx0XHRvcEVhY2godGhpcy5vcERlZmF1bHRFeHBvcnQsIF8gPT4ge1xuXHRcdFx0XHRpZiAoXyBpbnN0YW5jZW9mIENsYXNzIHx8IF8gaW5zdGFuY2VvZiBGdW4pXG5cdFx0XHRcdFx0c2V0TmFtZShfKVxuXHRcdFx0XHRwbHVzTG9jYWxzKG5ld0xvY2FscywgKCkgPT4geyBfLnZlcmlmeSgpIH0pXG5cdFx0XHR9KVxuXG5cdFx0XHRjb25zdCBleHBvcnRzID0gbmV3IFNldCh0aGlzLmV4cG9ydHMpXG5cdFx0XHRjb25zdCBtYXJrRXhwb3J0TGluZXMgPSBsaW5lID0+IHtcblx0XHRcdFx0aWYgKGxpbmUgaW5zdGFuY2VvZiBBc3NpZ24gJiYgbGluZS5hbGxBc3NpZ25lZXMoKS5zb21lKF8gPT4gZXhwb3J0cy5oYXMoXykpKVxuXHRcdFx0XHRcdHJlc3VsdHMuZXhwb3J0QXNzaWducy5hZGQobGluZSlcblx0XHRcdFx0ZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIERlYnVnKVxuXHRcdFx0XHRcdGxpbmUubGluZXMuZm9yRWFjaChtYXJrRXhwb3J0TGluZXMpXG5cdFx0XHR9XG5cdFx0XHR0aGlzLmxpbmVzLmZvckVhY2gobWFya0V4cG9ydExpbmVzKVxuXHRcdH0pXG5cdH0sXG5cblx0TmV3KCkge1xuXHRcdHRoaXMudHlwZS52ZXJpZnkoKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0T2JqRW50cnlBc3NpZ24oKSB7XG5cdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR0aGlzLmFzc2lnbi52ZXJpZnkoKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFzc2lnbi5hbGxBc3NpZ25lZXMoKSlcblx0XHRcdGFjY2Vzc0xvY2FsKHRoaXMsIF8ubmFtZSlcblx0fSxcblxuXHRPYmpFbnRyeUNvbXB1dGVkKCkge1xuXHRcdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdFx0dGhpcy5rZXkudmVyaWZ5KClcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0T2JqU2ltcGxlKCkge1xuXHRcdGNvbnN0IGtleXMgPSBuZXcgU2V0KClcblx0XHRmb3IgKGNvbnN0IHBhaXIgb2YgdGhpcy5wYWlycykge1xuXHRcdFx0Y29uc3QgeyBrZXksIHZhbHVlIH0gPSBwYWlyXG5cdFx0XHRjb250ZXh0LmNoZWNrKCFrZXlzLmhhcyhrZXkpLCBwYWlyLmxvYywgKCkgPT4gYER1cGxpY2F0ZSBrZXkgJHtrZXl9YClcblx0XHRcdGtleXMuYWRkKGtleSlcblx0XHRcdHZhbHVlLnZlcmlmeSgpXG5cdFx0fVxuXHR9LFxuXG5cdFF1b3RlKCkge1xuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLnBhcnRzKVxuXHRcdFx0aWYgKHR5cGVvZiBfICE9PSAnc3RyaW5nJylcblx0XHRcdFx0Xy52ZXJpZnkoKVxuXHR9LFxuXG5cdFF1b3RlVGVtcGxhdGUoKSB7XG5cdFx0dGhpcy50YWcudmVyaWZ5KClcblx0XHR0aGlzLnF1b3RlLnZlcmlmeSgpXG5cdH0sXG5cblx0U3BlY2lhbERvKCkgeyB9LFxuXG5cdFNwZWNpYWxWYWwoKSB7XG5cdFx0c2V0TmFtZSh0aGlzKVxuXHR9LFxuXG5cdFNwbGF0KCkgeyB0aGlzLnNwbGF0dGVkLnZlcmlmeSgpIH0sXG5cblx0U3dpdGNoRG8oKSB7IHZlcmlmeVN3aXRjaCh0aGlzKSB9LFxuXHRTd2l0Y2hEb1BhcnQ6IHZlcmlmeVN3aXRjaFBhcnQsXG5cdFN3aXRjaFZhbCgpIHsgd2l0aElJRkUoKCkgPT4gdmVyaWZ5U3dpdGNoKHRoaXMpKSB9LFxuXHRTd2l0Y2hWYWxQYXJ0OiB2ZXJpZnlTd2l0Y2hQYXJ0LFxuXG5cdFRocm93KCkge1xuXHRcdHZlcmlmeU9wRWFjaCh0aGlzLm9wVGhyb3duKVxuXHR9LFxuXG5cdFVzZTogdmVyaWZ5VXNlLFxuXHRVc2VHbG9iYWw6IHZlcmlmeVVzZSxcblxuXHRXaXRoKCkge1xuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0XHR3aXRoSUlGRSgoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5kZWNsYXJlIGluc3RhbmNlb2YgTG9jYWxEZWNsYXJlRm9jdXMpXG5cdFx0XHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZGVjbGFyZSlcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmRlY2xhcmUsICgpID0+IHsgdGhpcy5ibG9jay52ZXJpZnkoKSB9KVxuXHRcdH0pXG5cdH0sXG5cblx0WWllbGQoKSB7XG5cdFx0Y29udGV4dC5jaGVjayhpc0luR2VuZXJhdG9yLCB0aGlzLmxvYywgJ0Nhbm5vdCB5aWVsZCBvdXRzaWRlIG9mIGdlbmVyYXRvciBjb250ZXh0Jylcblx0XHR2ZXJpZnlPcEVhY2godGhpcy5vcFlpZWxkZWQpXG5cdH0sXG5cblx0WWllbGRUbygpIHtcblx0XHRjb250ZXh0LmNoZWNrKGlzSW5HZW5lcmF0b3IsIHRoaXMubG9jLCAnQ2Fubm90IHlpZWxkIG91dHNpZGUgb2YgZ2VuZXJhdG9yIGNvbnRleHQnKVxuXHRcdHRoaXMueWllbGRlZFRvLnZlcmlmeSgpXG5cdH1cbn0pXG5cbmZ1bmN0aW9uIHZlcmlmeUJhZ0VudHJ5KCkge1xuXHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHR0aGlzLnZhbHVlLnZlcmlmeSgpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeUJsb2NrQmFnT3JNYXAoKSB7XG5cdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmJ1aWx0LCAoKSA9PiB2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKSlcbn1cblxuZnVuY3Rpb24gdmVyaWZ5Q2FzZVBhcnQoKSB7XG5cdGlmICh0aGlzLnRlc3QgaW5zdGFuY2VvZiBQYXR0ZXJuKSB7XG5cdFx0dGhpcy50ZXN0LnR5cGUudmVyaWZ5KClcblx0XHR0aGlzLnRlc3QucGF0dGVybmVkLnZlcmlmeSgpXG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2Fscyh0aGlzLnRlc3QubG9jYWxzLCAoKSA9PiB0aGlzLnJlc3VsdC52ZXJpZnkoKSlcblx0fSBlbHNlIHtcblx0XHR0aGlzLnRlc3QudmVyaWZ5KClcblx0XHR0aGlzLnJlc3VsdC52ZXJpZnkoKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHZlcmlmeVN3aXRjaFBhcnQoKSB7XG5cdGZvciAoY29uc3QgXyBvZiB0aGlzLnZhbHVlcylcblx0XHRfLnZlcmlmeSgpXG5cdHRoaXMucmVzdWx0LnZlcmlmeSgpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeUV4Y2VwdCgpIHtcblx0dGhpcy5fdHJ5LnZlcmlmeSgpXG5cdHZlcmlmeU9wRWFjaCh0aGlzLl9jYXRjaClcblx0dmVyaWZ5T3BFYWNoKHRoaXMuX2ZpbmFsbHkpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeVVzZSgpIHtcblx0Ly8gU2luY2UgVXNlcyBhcmUgYWx3YXlzIGluIHRoZSBvdXRlcm1vc3Qgc2NvcGUsIGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgc2hhZG93aW5nLlxuXHQvLyBTbyB3ZSBtdXRhdGUgYGxvY2Fsc2AgZGlyZWN0bHkuXG5cdGNvbnN0IGFkZFVzZUxvY2FsID0gXyA9PiB7XG5cdFx0Y29uc3QgcHJldiA9IGxvY2Fscy5nZXQoXy5uYW1lKVxuXHRcdGNvbnRleHQuY2hlY2socHJldiA9PT0gdW5kZWZpbmVkLCBfLmxvYywgKCkgPT5cblx0XHRcdGAke2NvZGUoXy5uYW1lKX0gYWxyZWFkeSBpbXBvcnRlZCBhdCAke3ByZXYubG9jfWApXG5cdFx0dmVyaWZ5TG9jYWxEZWNsYXJlKF8pXG5cdFx0c2V0TG9jYWwoXylcblx0fVxuXHRmb3IgKGNvbnN0IF8gb2YgdGhpcy51c2VkKVxuXHRcdGFkZFVzZUxvY2FsKF8pXG5cdG9wRWFjaCh0aGlzLm9wVXNlRGVmYXVsdCwgYWRkVXNlTG9jYWwpXG59XG5cbi8vIEhlbHBlcnMgc3BlY2lmaWMgdG8gY2VydGFpbiBNc0FzdCB0eXBlczpcbmNvbnN0XG5cdHZlcmlmeUZvciA9IGZvckxvb3AgPT4ge1xuXHRcdGNvbnN0IHZlcmlmeUJsb2NrID0gKCkgPT4gd2l0aEluTG9vcChmb3JMb29wLCAoKSA9PiBmb3JMb29wLmJsb2NrLnZlcmlmeSgpKVxuXHRcdGlmRWxzZShmb3JMb29wLm9wSXRlcmF0ZWUsXG5cdFx0XHQoeyBlbGVtZW50LCBiYWcgfSkgPT4ge1xuXHRcdFx0XHRiYWcudmVyaWZ5KClcblx0XHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKGVsZW1lbnQsIHZlcmlmeUJsb2NrKVxuXHRcdFx0fSxcblx0XHRcdHZlcmlmeUJsb2NrKVxuXHR9LFxuXG5cdHZlcmlmeUluTG9vcCA9IGxvb3BVc2VyID0+XG5cdFx0Y29udGV4dC5jaGVjayhvcExvb3AgIT09IG51bGwsIGxvb3BVc2VyLmxvYywgJ05vdCBpbiBhIGxvb3AuJyksXG5cblxuXHR2ZXJpZnlDYXNlID0gXyA9PiB7XG5cdFx0Y29uc3QgZG9JdCA9ICgpID0+IHtcblx0XHRcdGZvciAoY29uc3QgcGFydCBvZiBfLnBhcnRzKVxuXHRcdFx0XHRwYXJ0LnZlcmlmeSgpXG5cdFx0XHR2ZXJpZnlPcEVhY2goXy5vcEVsc2UpXG5cdFx0fVxuXHRcdGlmRWxzZShfLm9wQ2FzZWQsXG5cdFx0XHRfID0+IHtcblx0XHRcdFx0Xy52ZXJpZnkoKVxuXHRcdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwoXy5hc3NpZ25lZSwgZG9JdClcblx0XHRcdH0sXG5cdFx0XHRkb0l0KVxuXHR9LFxuXG5cdHZlcmlmeVN3aXRjaCA9IF8gPT4ge1xuXHRcdF8uc3dpdGNoZWQudmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IHBhcnQgb2YgXy5wYXJ0cylcblx0XHRcdHBhcnQudmVyaWZ5KClcblx0XHR2ZXJpZnlPcEVhY2goXy5vcEVsc2UpXG5cdH1cblxuLy8gR2VuZXJhbCB1dGlsaXRpZXM6XG5jb25zdFxuXHRnZXRMb2NhbERlY2xhcmUgPSAobmFtZSwgYWNjZXNzTG9jKSA9PiB7XG5cdFx0Y29uc3QgZGVjbGFyZSA9IGxvY2Fscy5nZXQobmFtZSlcblx0XHRpZiAoZGVjbGFyZSA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0ZmFpbE1pc3NpbmdMb2NhbChhY2Nlc3NMb2MsIG5hbWUpXG5cdFx0cmV0dXJuIGRlY2xhcmVcblx0fSxcblxuXHRmYWlsTWlzc2luZ0xvY2FsID0gKGxvYywgbmFtZSkgPT4ge1xuXHRcdGNvbnRleHQuZmFpbChsb2MsICgpID0+IHtcblx0XHRcdGNvbnN0IHNob3dMb2NhbHMgPSBjb2RlKEFycmF5KC4uLmxvY2Fscy5rZXlzKCkpLmpvaW4oJyAnKSlcblx0XHRcdHJldHVybiBgTm8gc3VjaCBsb2NhbCAke2NvZGUobmFtZSl9LlxcbkxvY2FscyBhcmU6XFxuJHtzaG93TG9jYWxzfS5gXG5cdFx0fSlcblx0fSxcblxuXHRsaW5lTmV3TG9jYWxzID0gbGluZSA9PlxuXHRcdGxpbmUgaW5zdGFuY2VvZiBBc3NpZ25TaW5nbGUgP1xuXHRcdFx0WyBsaW5lLmFzc2lnbmVlIF0gOlxuXHRcdFx0bGluZSBpbnN0YW5jZW9mIEFzc2lnbkRlc3RydWN0dXJlID9cblx0XHRcdGxpbmUuYXNzaWduZWVzIDpcblx0XHRcdGxpbmUgaW5zdGFuY2VvZiBPYmpFbnRyeSA/XG5cdFx0XHRsaW5lTmV3TG9jYWxzKGxpbmUuYXNzaWduKSA6XG5cdFx0XHRbIF0sXG5cblx0dmVyaWZ5TGluZXMgPSBsaW5lcyA9PiB7XG5cdFx0Lypcblx0XHRXZSBuZWVkIHRvIGJldCBhbGwgYmxvY2sgbG9jYWxzIHVwLWZyb250IGJlY2F1c2Vcblx0XHRGdW5jdGlvbnMgd2l0aGluIGxpbmVzIGNhbiBhY2Nlc3MgbG9jYWxzIGZyb20gbGF0ZXIgbGluZXMuXG5cdFx0Tk9URTogV2UgcHVzaCB0aGVzZSBvbnRvIHBlbmRpbmdCbG9ja0xvY2FscyBpbiByZXZlcnNlXG5cdFx0c28gdGhhdCB3aGVuIHdlIGl0ZXJhdGUgdGhyb3VnaCBsaW5lcyBmb3J3YXJkcywgd2UgY2FuIHBvcCBmcm9tIHBlbmRpbmdCbG9ja0xvY2Fsc1xuXHRcdHRvIHJlbW92ZSBwZW5kaW5nIGxvY2FscyBhcyB0aGV5IGJlY29tZSByZWFsIGxvY2Fscy5cblx0XHRJdCBkb2Vzbid0IHJlYWxseSBtYXR0ZXIgd2hhdCBvcmRlciB3ZSBhZGQgbG9jYWxzIGluIHNpbmNlIGl0J3Mgbm90IGFsbG93ZWRcblx0XHR0byBoYXZlIHR3byBsb2NhbHMgb2YgdGhlIHNhbWUgbmFtZSBpbiB0aGUgc2FtZSBibG9jay5cblx0XHQqL1xuXHRcdGNvbnN0IG5ld0xvY2FscyA9IFsgXVxuXG5cdFx0Y29uc3QgZ2V0TGluZUxvY2FscyA9IGxpbmUgPT4ge1xuXHRcdFx0aWYgKGxpbmUgaW5zdGFuY2VvZiBEZWJ1Zylcblx0XHRcdFx0d2l0aEluRGVidWcoKCkgPT4gZWFjaFJldmVyc2UobGluZS5saW5lcywgZ2V0TGluZUxvY2FscykpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGVhY2hSZXZlcnNlKGxpbmVOZXdMb2NhbHMobGluZSksIF8gPT4ge1xuXHRcdFx0XHRcdC8vIFJlZ2lzdGVyIHRoZSBsb2NhbCBub3cuIENhbid0IHdhaXQgdW50aWwgdGhlIGFzc2lnbiBpcyB2ZXJpZmllZC5cblx0XHRcdFx0XHRyZWdpc3RlckxvY2FsKF8pXG5cdFx0XHRcdFx0bmV3TG9jYWxzLnB1c2goXylcblx0XHRcdFx0fSlcblx0XHR9XG5cdFx0ZWFjaFJldmVyc2UobGluZXMsIGdldExpbmVMb2NhbHMpXG5cdFx0cGVuZGluZ0Jsb2NrTG9jYWxzLnB1c2goLi4ubmV3TG9jYWxzKVxuXG5cdFx0Lypcblx0XHRLZWVwcyB0cmFjayBvZiBsb2NhbHMgd2hpY2ggaGF2ZSBhbHJlYWR5IGJlZW4gYWRkZWQgaW4gdGhpcyBibG9jay5cblx0XHRNYXNvbiBhbGxvd3Mgc2hhZG93aW5nLCBidXQgbm90IHdpdGhpbiB0aGUgc2FtZSBibG9jay5cblx0XHRTbywgdGhpcyBpcyBhbGxvd2VkOlxuXHRcdFx0YSA9IDFcblx0XHRcdGIgPVxuXHRcdFx0XHRhID0gMlxuXHRcdFx0XHQuLi5cblx0XHRCdXQgbm90OlxuXHRcdFx0YSA9IDFcblx0XHRcdGEgPSAyXG5cdFx0Ki9cblx0XHRjb25zdCB0aGlzQmxvY2tMb2NhbE5hbWVzID0gbmV3IFNldCgpXG5cblx0XHQvLyBBbGwgc2hhZG93ZWQgbG9jYWxzIGZvciB0aGlzIGJsb2NrLlxuXHRcdGNvbnN0IHNoYWRvd2VkID0gWyBdXG5cblx0XHRjb25zdCB2ZXJpZnlMaW5lID0gbGluZSA9PiB7XG5cdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIERlYnVnKVxuXHRcdFx0XHQvLyBUT0RPOiBEbyBhbnl0aGluZyBpbiB0aGlzIHNpdHVhdGlvbj9cblx0XHRcdFx0Ly8gY29udGV4dC5jaGVjayghaW5EZWJ1ZywgbGluZS5sb2MsICdSZWR1bmRhbnQgYGRlYnVnYC4nKVxuXHRcdFx0XHR3aXRoSW5EZWJ1ZygoKSA9PiBsaW5lLmxpbmVzLmZvckVhY2godmVyaWZ5TGluZSkpXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dmVyaWZ5SXNTdGF0ZW1lbnQobGluZSlcblx0XHRcdFx0Zm9yIChjb25zdCBuZXdMb2NhbCBvZiBsaW5lTmV3TG9jYWxzKGxpbmUpKSB7XG5cdFx0XHRcdFx0Y29uc3QgbmFtZSA9IG5ld0xvY2FsLm5hbWVcblx0XHRcdFx0XHRjb25zdCBvbGRMb2NhbCA9IGxvY2Fscy5nZXQobmFtZSlcblx0XHRcdFx0XHRpZiAob2xkTG9jYWwgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0Y29udGV4dC5jaGVjayghdGhpc0Jsb2NrTG9jYWxOYW1lcy5oYXMobmFtZSksIG5ld0xvY2FsLmxvYyxcblx0XHRcdFx0XHRcdFx0KCkgPT4gYEEgbG9jYWwgJHtjb2RlKG5hbWUpfSBpcyBhbHJlYWR5IGluIHRoaXMgYmxvY2suYClcblx0XHRcdFx0XHRcdHNoYWRvd2VkLnB1c2gob2xkTG9jYWwpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXNCbG9ja0xvY2FsTmFtZXMuYWRkKG5hbWUpXG5cdFx0XHRcdFx0c2V0TG9jYWwobmV3TG9jYWwpXG5cblx0XHRcdFx0XHQvLyBOb3cgdGhhdCBpdCdzIGFkZGVkIGFzIGEgbG9jYWwsIGl0J3Mgbm8gbG9uZ2VyIHBlbmRpbmcuXG5cdFx0XHRcdFx0Ly8gV2UgYWRkZWQgcGVuZGluZ0Jsb2NrTG9jYWxzIGluIHRoZSByaWdodCBvcmRlciB0aGF0IHdlIGNhbiBqdXN0IHBvcCB0aGVtIG9mZi5cblx0XHRcdFx0XHRjb25zdCBwb3BwZWQgPSBwZW5kaW5nQmxvY2tMb2NhbHMucG9wKClcblx0XHRcdFx0XHRhc3NlcnQocG9wcGVkID09PSBuZXdMb2NhbClcblx0XHRcdFx0fVxuXHRcdFx0XHRsaW5lLnZlcmlmeSgpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bGluZXMuZm9yRWFjaCh2ZXJpZnlMaW5lKVxuXG5cdFx0bmV3TG9jYWxzLmZvckVhY2goZGVsZXRlTG9jYWwpXG5cdFx0c2hhZG93ZWQuZm9yRWFjaChzZXRMb2NhbClcblxuXHRcdHJldHVybiBuZXdMb2NhbHNcblx0fSxcblxuXHR2ZXJpZnlJc1N0YXRlbWVudCA9IGxpbmUgPT4ge1xuXHRcdGNvbnN0IGlzU3RhdGVtZW50ID1cblx0XHRcdGxpbmUgaW5zdGFuY2VvZiBEbyB8fFxuXHRcdFx0Ly8gU29tZSB2YWx1ZXMgYXJlIGFsc28gYWNjZXB0YWJsZS5cblx0XHRcdGxpbmUgaW5zdGFuY2VvZiBDYWxsIHx8XG5cdFx0XHRsaW5lIGluc3RhbmNlb2YgWWllbGQgfHxcblx0XHRcdGxpbmUgaW5zdGFuY2VvZiBZaWVsZFRvXG5cdFx0Y29udGV4dC5jaGVjayhpc1N0YXRlbWVudCwgbGluZS5sb2MsICdFeHByZXNzaW9uIGluIHN0YXRlbWVudCBwb3NpdGlvbi4nKVxuXHR9XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==
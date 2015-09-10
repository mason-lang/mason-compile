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
		method = null;
		results = new _VerifyResults2.default();

		msAst.verify();
		verifyLocalUse();

		const res = results;
		// Release for garbage collection.
		context = locals = okToNotUse = opLoop = pendingBlockLocals = method = results = null;
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
	isInGenerator,
	// Current method we are in, or 'constructor', or null.
	method, results,
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
	      withLoop = (newLoop, action) => {
		const oldLoop = opLoop;
		opLoop = newLoop;
		action();
		opLoop = oldLoop;
	},
	      withMethod = (newMethod, action) => {
		const oldMethod = method;
		method = newMethod;
		action();
		method = oldMethod;
	},
	      withName = (newName, action) => {
		const oldName = name;
		name = newName;
		action();
		name = oldName;
	},
	     

	// Can't break out of loop inside of IIFE.
	withIIFE = action => {
		withLoop(false, action);
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
			if (this.opConstructor !== null) {
				okToNotUse.add(this.opConstructor.opDeclareThis);
				withMethod('constructor', () => this.opConstructor.verify(true));
			}
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

		Fun() {
			withBlockLocals(() => {
				context.check(this.opDeclareRes === null || this.block instanceof _MsAst.BlockVal, this.loc, 'Function with return condition must return something.');
				withInGenerator(this.isGenerator, () => withLoop(null, () => {
					const allArgs = (0, _util.cat)(this.opDeclareThis, this.args, this.opRestArg);
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
			const builtinPath = context.opts.builtinNameToPath.get(this.name);
			context.warnIf(builtinPath !== undefined, this.loc, () => `Local ${ (0, _CompileError.code)(this.name) } overrides builtin from ${ (0, _CompileError.code)(builtinPath) }.`);
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
			verifyMethod(this, () => {
				okToNotUse.add(this.fun.opDeclareThis);
				this.fun.verify();
			});
		},
		MethodGetter() {
			verifyMethod(this, () => {
				okToNotUse.add(this.declareThis);
				verifyAndPlusLocals([this.declareThis], () => {
					this.block.verify();
				});
			});
		},
		MethodSetter() {
			verifyMethod(this, () => {
				verifyAndPlusLocals([this.declareThis, this.declareFocus], () => {
					this.block.verify();
				});
			});
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

		SuperCall: verifySuperCall,
		SuperCallDo: verifySuperCall,
		SuperMember() {
			context.check(method !== null, this.loc, 'Must be in method.');
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

	function verifySuperCall() {
		context.check(method !== null, this.loc, 'Must be in a method.');
		results.superCallToMethod.set(this, method);
		for (const _ of this.args) _.verify();
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
		const verifyBlock = () => withLoop(forLoop, () => forLoop.block.verify());
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
	      verifyMethod = (_, doVerify) => {
		if (typeof _.symbol !== 'string') _.symbol.verify();
		withMethod(_, doVerify);
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
			if (line instanceof _MsAst.Debug) withInDebug(() => {
				for (const _ of (0, _util.reverseIter)(line.lines)) getLineLocals(_);
			});else for (const _ of (0, _util.reverseIter)(lineNewLocals(line))) {
				// Register the local now. Can't wait until the assign is verified.
				registerLocal(_);
				newLocals.push(_);
			}
		};
		for (const _ of (0, _util.reverseIter)(lines)) getLineLocals(_);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZlcmlmeS5qcyIsInByaXZhdGUvdmVyaWZ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztrQkNXZSxDQUFDLFFBQVEsRUFBRSxLQUFLLEtBQUs7QUFDbkMsU0FBTyxHQUFHLFFBQVEsQ0FBQTtBQUNsQixRQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUNsQixvQkFBa0IsR0FBRyxFQUFHLENBQUE7QUFDeEIsV0FBUyxHQUFHLGFBQWEsR0FBRyxLQUFLLENBQUE7QUFDakMsWUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDdEIsUUFBTSxHQUFHLElBQUksQ0FBQTtBQUNiLFFBQU0sR0FBRyxJQUFJLENBQUE7QUFDYixTQUFPLEdBQUcsNkJBQW1CLENBQUE7O0FBRTdCLE9BQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUNkLGdCQUFjLEVBQUUsQ0FBQTs7QUFFaEIsUUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFBOztBQUVuQixTQUFPLEdBQUcsTUFBTSxHQUFHLFVBQVUsR0FBRyxNQUFNLEdBQUcsa0JBQWtCLEdBQUcsTUFBTSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUE7QUFDckYsU0FBTyxHQUFHLENBQUE7RUFDVjs7O0FBR0QsS0FDQyxPQUFPOztBQUVQLE9BQU07O0FBRU4sV0FBVSxFQUNWLE1BQU07Ozs7Ozs7Ozs7Ozs7OztBQWVOLG1CQUFrQixFQUNsQixTQUFTOztBQUVULGNBQWE7O0FBRWIsT0FBTSxFQUNOLE9BQU87O0FBRVAsS0FBSSxDQUFBOztBQUVMLE9BQ0MsWUFBWSxHQUFHLEVBQUUsSUFBSTtBQUNwQixNQUFJLEVBQUUsS0FBSyxJQUFJLEVBQ2QsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFBO0VBQ1o7T0FFRCxXQUFXLEdBQUcsWUFBWSxJQUN6QixNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7T0FFakMsUUFBUSxHQUFHLFlBQVksSUFDdEIsTUFBTSxDQUFDLEdBQUcs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RSxtQ0FBbUMsQ0FBQyxDQUFBO0VBQ3pFLENBQUEiLCJmaWxlIjoicHJpdmF0ZS92ZXJpZnkuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7IGNvZGUgfSBmcm9tICcuLi9Db21waWxlRXJyb3InXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4vTXNBc3QnXG5pbXBvcnQgeyBBc3NpZ24sIEFzc2lnbkRlc3RydWN0dXJlLCBBc3NpZ25TaW5nbGUsIEJsb2NrVmFsLCBDYWxsLCBDbGFzcywgRGVidWcsIERvLCBGb3JWYWwsIEZ1bixcblx0TG9jYWxEZWNsYXJlQnVpbHQsIExvY2FsRGVjbGFyZUZvY3VzLCBMb2NhbERlY2xhcmVSZXMsIE9iakVudHJ5LCBQYXR0ZXJuLCBZaWVsZCwgWWllbGRUb1xuXHR9IGZyb20gJy4vTXNBc3QnXG5pbXBvcnQgeyBhc3NlcnQsIGNhdCwgaGVhZCwgaWZFbHNlLCBpbXBsZW1lbnRNYW55LCBpc0VtcHR5LCBvcEVhY2gsIHJldmVyc2VJdGVyIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IFZlcmlmeVJlc3VsdHMsIHsgTG9jYWxJbmZvIH0gZnJvbSAnLi9WZXJpZnlSZXN1bHRzJ1xuXG4vKlxuVGhlIHZlcmlmaWVyIGdlbmVyYXRlcyBpbmZvcm1hdGlvbiBuZWVkZWQgZHVyaW5nIHRyYW5zcGlsaW5nLCB0aGUgVmVyaWZ5UmVzdWx0cy5cbiovXG5leHBvcnQgZGVmYXVsdCAoX2NvbnRleHQsIG1zQXN0KSA9PiB7XG5cdGNvbnRleHQgPSBfY29udGV4dFxuXHRsb2NhbHMgPSBuZXcgTWFwKClcblx0cGVuZGluZ0Jsb2NrTG9jYWxzID0gWyBdXG5cdGlzSW5EZWJ1ZyA9IGlzSW5HZW5lcmF0b3IgPSBmYWxzZVxuXHRva1RvTm90VXNlID0gbmV3IFNldCgpXG5cdG9wTG9vcCA9IG51bGxcblx0bWV0aG9kID0gbnVsbFxuXHRyZXN1bHRzID0gbmV3IFZlcmlmeVJlc3VsdHMoKVxuXG5cdG1zQXN0LnZlcmlmeSgpXG5cdHZlcmlmeUxvY2FsVXNlKClcblxuXHRjb25zdCByZXMgPSByZXN1bHRzXG5cdC8vIFJlbGVhc2UgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cblx0Y29udGV4dCA9IGxvY2FscyA9IG9rVG9Ob3RVc2UgPSBvcExvb3AgPSBwZW5kaW5nQmxvY2tMb2NhbHMgPSBtZXRob2QgPSByZXN1bHRzID0gbnVsbFxuXHRyZXR1cm4gcmVzXG59XG5cbi8vIFVzZSBhIHRyaWNrIGxpa2UgaW4gcGFyc2UuanMgYW5kIGhhdmUgZXZlcnl0aGluZyBjbG9zZSBvdmVyIHRoZXNlIG11dGFibGUgdmFyaWFibGVzLlxubGV0XG5cdGNvbnRleHQsXG5cdC8vIE1hcCBmcm9tIG5hbWVzIHRvIExvY2FsRGVjbGFyZXMuXG5cdGxvY2Fscyxcblx0Ly8gTG9jYWxzIHRoYXQgZG9uJ3QgaGF2ZSB0byBiZSBhY2Nlc3NlZC5cblx0b2tUb05vdFVzZSxcblx0b3BMb29wLFxuXHQvKlxuXHRMb2NhbHMgZm9yIHRoaXMgYmxvY2suXG5cdFRoZXNlIGFyZSBhZGRlZCB0byBsb2NhbHMgd2hlbiBlbnRlcmluZyBhIEZ1bmN0aW9uIG9yIGxhenkgZXZhbHVhdGlvbi5cblx0SW46XG5cdFx0YSA9IHxcblx0XHRcdGJcblx0XHRiID0gMVxuXHRgYmAgd2lsbCBiZSBhIHBlbmRpbmcgbG9jYWwuXG5cdEhvd2V2ZXI6XG5cdFx0YSA9IGJcblx0XHRiID0gMVxuXHR3aWxsIGZhaWwgdG8gdmVyaWZ5LCBiZWNhdXNlIGBiYCBjb21lcyBhZnRlciBgYWAgYW5kIGlzIG5vdCBhY2Nlc3NlZCBpbnNpZGUgYSBmdW5jdGlvbi5cblx0SXQgd291bGQgd29yayBmb3IgYH5hIGlzIGJgLCB0aG91Z2guXG5cdCovXG5cdHBlbmRpbmdCbG9ja0xvY2Fscyxcblx0aXNJbkRlYnVnLFxuXHQvLyBXaGV0aGVyIHdlIGFyZSBjdXJyZW50bHkgYWJsZSB0byB5aWVsZC5cblx0aXNJbkdlbmVyYXRvcixcblx0Ly8gQ3VycmVudCBtZXRob2Qgd2UgYXJlIGluLCBvciAnY29uc3RydWN0b3InLCBvciBudWxsLlxuXHRtZXRob2QsXG5cdHJlc3VsdHMsXG5cdC8vIE5hbWUgb2YgdGhlIGNsb3Nlc3QgQXNzaWduU2luZ2xlXG5cdG5hbWVcblxuY29uc3Rcblx0dmVyaWZ5T3BFYWNoID0gb3AgPT4ge1xuXHRcdGlmIChvcCAhPT0gbnVsbClcblx0XHRcdG9wLnZlcmlmeSgpXG5cdH0sXG5cblx0ZGVsZXRlTG9jYWwgPSBsb2NhbERlY2xhcmUgPT5cblx0XHRsb2NhbHMuZGVsZXRlKGxvY2FsRGVjbGFyZS5uYW1lKSxcblxuXHRzZXRMb2NhbCA9IGxvY2FsRGVjbGFyZSA9PlxuXHRcdGxvY2Fscy5zZXQobG9jYWxEZWNsYXJlLm5hbWUsIGxvY2FsRGVjbGFyZSksXG5cblx0Ly8gV2hlbiBhIGxvY2FsIGlzIHJldHVybmVkIGZyb20gYSBCbG9ja09iaiBvciBNb2R1bGUsXG5cdC8vIHRoZSByZXR1cm4gJ2FjY2VzcycgaXMgY29uc2lkZXJlZCB0byBiZSAnZGVidWcnIGlmIHRoZSBsb2NhbCBpcy5cblx0YWNjZXNzTG9jYWxGb3JSZXR1cm4gPSAoZGVjbGFyZSwgYWNjZXNzKSA9PiB7XG5cdFx0Y29uc3QgaW5mbyA9IHJlc3VsdHMubG9jYWxEZWNsYXJlVG9JbmZvLmdldChkZWNsYXJlKVxuXHRcdF9hZGRMb2NhbEFjY2VzcyhpbmZvLCBhY2Nlc3MsIGluZm8uaXNJbkRlYnVnKVxuXHR9LFxuXG5cdGFjY2Vzc0xvY2FsID0gKGFjY2VzcywgbmFtZSkgPT4ge1xuXHRcdGNvbnN0IGRlY2xhcmUgPSBnZXRMb2NhbERlY2xhcmUobmFtZSwgYWNjZXNzLmxvYylcblx0XHRzZXRMb2NhbERlY2xhcmVBY2Nlc3NlZChkZWNsYXJlLCBhY2Nlc3MpXG5cdH0sXG5cblx0c2V0TG9jYWxEZWNsYXJlQWNjZXNzZWQgPSAoZGVjbGFyZSwgYWNjZXNzKSA9PiB7XG5cdFx0X2FkZExvY2FsQWNjZXNzKHJlc3VsdHMubG9jYWxEZWNsYXJlVG9JbmZvLmdldChkZWNsYXJlKSwgYWNjZXNzLCBpc0luRGVidWcpXG5cdH0sXG5cblx0X2FkZExvY2FsQWNjZXNzID0gKGxvY2FsSW5mbywgYWNjZXNzLCBpc0RlYnVnQWNjZXNzKSA9PlxuXHRcdChpc0RlYnVnQWNjZXNzID8gbG9jYWxJbmZvLmRlYnVnQWNjZXNzZXMgOiBsb2NhbEluZm8ubm9uRGVidWdBY2Nlc3NlcykucHVzaChhY2Nlc3MpLFxuXG5cdC8vIEZvciBleHByZXNzaW9ucyBhZmZlY3RpbmcgbGluZU5ld0xvY2FscywgdGhleSB3aWxsIGJlIHJlZ2lzdGVyZWQgYmVmb3JlIGJlaW5nIHZlcmlmaWVkLlxuXHQvLyBTbywgTG9jYWxEZWNsYXJlLnZlcmlmeSBqdXN0IHRoZSB0eXBlLlxuXHQvLyBGb3IgbG9jYWxzIG5vdCBhZmZlY3RpbmcgbGluZU5ld0xvY2FscywgdXNlIHRoaXMgaW5zdGVhZCBvZiBqdXN0IGRlY2xhcmUudmVyaWZ5KClcblx0dmVyaWZ5TG9jYWxEZWNsYXJlID0gbG9jYWxEZWNsYXJlID0+IHtcblx0XHRyZWdpc3RlckxvY2FsKGxvY2FsRGVjbGFyZSlcblx0XHRsb2NhbERlY2xhcmUudmVyaWZ5KClcblx0fSxcblxuXHRyZWdpc3RlckxvY2FsID0gbG9jYWxEZWNsYXJlID0+IHtcblx0XHRyZXN1bHRzLmxvY2FsRGVjbGFyZVRvSW5mby5zZXQobG9jYWxEZWNsYXJlLCBMb2NhbEluZm8uZW1wdHkoaXNJbkRlYnVnKSlcblx0fSxcblxuXHRzZXROYW1lID0gZXhwciA9PiB7XG5cdFx0cmVzdWx0cy5uYW1lcy5zZXQoZXhwciwgbmFtZSlcblx0fVxuXG4vLyBUaGVzZSBmdW5jdGlvbnMgY2hhbmdlIHZlcmlmaWVyIHN0YXRlIGFuZCBlZmZpY2llbnRseSByZXR1cm4gdG8gdGhlIG9sZCBzdGF0ZSB3aGVuIGZpbmlzaGVkLlxuY29uc3Rcblx0d2l0aEluRGVidWcgPSBhY3Rpb24gPT4ge1xuXHRcdGNvbnN0IG9sZElzSW5EZWJ1ZyA9IGlzSW5EZWJ1Z1xuXHRcdGlzSW5EZWJ1ZyA9IHRydWVcblx0XHRhY3Rpb24oKVxuXHRcdGlzSW5EZWJ1ZyA9IG9sZElzSW5EZWJ1Z1xuXHR9LFxuXG5cdHdpdGhJbkdlbmVyYXRvciA9IChuZXdJc0luR2VuZXJhdG9yLCBhY3Rpb24pID0+IHtcblx0XHRjb25zdCBvbGRJc0luR2VuZXJhdG9yID0gaXNJbkdlbmVyYXRvclxuXHRcdGlzSW5HZW5lcmF0b3IgPSBuZXdJc0luR2VuZXJhdG9yXG5cdFx0YWN0aW9uKClcblx0XHRpc0luR2VuZXJhdG9yID0gb2xkSXNJbkdlbmVyYXRvclxuXHR9LFxuXG5cdHdpdGhMb29wID0gKG5ld0xvb3AsIGFjdGlvbikgPT4ge1xuXHRcdGNvbnN0IG9sZExvb3AgPSBvcExvb3Bcblx0XHRvcExvb3AgPSBuZXdMb29wXG5cdFx0YWN0aW9uKClcblx0XHRvcExvb3AgPSBvbGRMb29wXG5cdH0sXG5cblx0d2l0aE1ldGhvZCA9IChuZXdNZXRob2QsIGFjdGlvbikgPT4ge1xuXHRcdGNvbnN0IG9sZE1ldGhvZCA9IG1ldGhvZFxuXHRcdG1ldGhvZCA9IG5ld01ldGhvZFxuXHRcdGFjdGlvbigpXG5cdFx0bWV0aG9kID0gb2xkTWV0aG9kXG5cdH0sXG5cblx0d2l0aE5hbWUgPSAobmV3TmFtZSwgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgb2xkTmFtZSA9IG5hbWVcblx0XHRuYW1lID0gbmV3TmFtZVxuXHRcdGFjdGlvbigpXG5cdFx0bmFtZSA9IG9sZE5hbWVcblx0fSxcblxuXHQvLyBDYW4ndCBicmVhayBvdXQgb2YgbG9vcCBpbnNpZGUgb2YgSUlGRS5cblx0d2l0aElJRkUgPSBhY3Rpb24gPT4ge1xuXHRcdHdpdGhMb29wKGZhbHNlLCBhY3Rpb24pXG5cdH0sXG5cblx0cGx1c0xvY2FsID0gKGFkZGVkTG9jYWwsIGFjdGlvbikgPT4ge1xuXHRcdGNvbnN0IHNoYWRvd2VkID0gbG9jYWxzLmdldChhZGRlZExvY2FsLm5hbWUpXG5cdFx0bG9jYWxzLnNldChhZGRlZExvY2FsLm5hbWUsIGFkZGVkTG9jYWwpXG5cdFx0YWN0aW9uKClcblx0XHRpZiAoc2hhZG93ZWQgPT09IHVuZGVmaW5lZClcblx0XHRcdGRlbGV0ZUxvY2FsKGFkZGVkTG9jYWwpXG5cdFx0ZWxzZVxuXHRcdFx0c2V0TG9jYWwoc2hhZG93ZWQpXG5cdH0sXG5cblx0Ly8gU2hvdWxkIGhhdmUgdmVyaWZpZWQgdGhhdCBhZGRlZExvY2FscyBhbGwgaGF2ZSBkaWZmZXJlbnQgbmFtZXMuXG5cdHBsdXNMb2NhbHMgPSAoYWRkZWRMb2NhbHMsIGFjdGlvbikgPT4ge1xuXHRcdGNvbnN0IHNoYWRvd2VkTG9jYWxzID0gWyBdXG5cdFx0Zm9yIChjb25zdCBfIG9mIGFkZGVkTG9jYWxzKSB7XG5cdFx0XHRjb25zdCBzaGFkb3dlZCA9IGxvY2Fscy5nZXQoXy5uYW1lKVxuXHRcdFx0aWYgKHNoYWRvd2VkICE9PSB1bmRlZmluZWQpXG5cdFx0XHRcdHNoYWRvd2VkTG9jYWxzLnB1c2goc2hhZG93ZWQpXG5cdFx0XHRzZXRMb2NhbChfKVxuXHRcdH1cblxuXHRcdGFjdGlvbigpXG5cblx0XHRhZGRlZExvY2Fscy5mb3JFYWNoKGRlbGV0ZUxvY2FsKVxuXHRcdHNoYWRvd2VkTG9jYWxzLmZvckVhY2goc2V0TG9jYWwpXG5cdH0sXG5cblx0dmVyaWZ5QW5kUGx1c0xvY2FsID0gKGFkZGVkTG9jYWwsIGFjdGlvbikgPT4ge1xuXHRcdHZlcmlmeUxvY2FsRGVjbGFyZShhZGRlZExvY2FsKVxuXHRcdHBsdXNMb2NhbChhZGRlZExvY2FsLCBhY3Rpb24pXG5cdH0sXG5cblx0dmVyaWZ5QW5kUGx1c0xvY2FscyA9IChhZGRlZExvY2FscywgYWN0aW9uKSA9PiB7XG5cdFx0YWRkZWRMb2NhbHMuZm9yRWFjaCh2ZXJpZnlMb2NhbERlY2xhcmUpXG5cdFx0Y29uc3QgbmFtZXMgPSBuZXcgU2V0KClcblx0XHRmb3IgKGNvbnN0IF8gb2YgYWRkZWRMb2NhbHMpIHtcblx0XHRcdGNvbnRleHQuY2hlY2soIW5hbWVzLmhhcyhfLm5hbWUpLCBfLmxvYywgKCkgPT5cblx0XHRcdFx0YER1cGxpY2F0ZSBsb2NhbCAke2NvZGUoXy5uYW1lKX1gKVxuXHRcdFx0bmFtZXMuYWRkKF8ubmFtZSlcblx0XHR9XG5cdFx0cGx1c0xvY2FscyhhZGRlZExvY2FscywgYWN0aW9uKVxuXHR9LFxuXG5cdHdpdGhCbG9ja0xvY2FscyA9IGFjdGlvbiA9PiB7XG5cdFx0Y29uc3Qgb2xkUGVuZGluZ0Jsb2NrTG9jYWxzID0gcGVuZGluZ0Jsb2NrTG9jYWxzXG5cdFx0cGVuZGluZ0Jsb2NrTG9jYWxzID0gWyBdXG5cdFx0cGx1c0xvY2FscyhvbGRQZW5kaW5nQmxvY2tMb2NhbHMsIGFjdGlvbilcblx0XHRwZW5kaW5nQmxvY2tMb2NhbHMgPSBvbGRQZW5kaW5nQmxvY2tMb2NhbHNcblx0fVxuXG5jb25zdCB2ZXJpZnlMb2NhbFVzZSA9ICgpID0+XG5cdHJlc3VsdHMubG9jYWxEZWNsYXJlVG9JbmZvLmZvckVhY2goKGluZm8sIGxvY2FsKSA9PiB7XG5cdFx0aWYgKCEobG9jYWwgaW5zdGFuY2VvZiBMb2NhbERlY2xhcmVCdWlsdCB8fCBsb2NhbCBpbnN0YW5jZW9mIExvY2FsRGVjbGFyZVJlcykpIHtcblx0XHRcdGNvbnN0IG5vTm9uRGVidWcgPSBpc0VtcHR5KGluZm8ubm9uRGVidWdBY2Nlc3Nlcylcblx0XHRcdGlmIChub05vbkRlYnVnICYmIGlzRW1wdHkoaW5mby5kZWJ1Z0FjY2Vzc2VzKSlcblx0XHRcdFx0Y29udGV4dC53YXJuSWYoIW9rVG9Ob3RVc2UuaGFzKGxvY2FsKSwgbG9jYWwubG9jLCAoKSA9PlxuXHRcdFx0XHRcdGBVbnVzZWQgbG9jYWwgdmFyaWFibGUgJHtjb2RlKGxvY2FsLm5hbWUpfS5gKVxuXHRcdFx0ZWxzZSBpZiAoaW5mby5pc0luRGVidWcpXG5cdFx0XHRcdGNvbnRleHQud2FybklmKCFub05vbkRlYnVnLCAoKSA9PiBoZWFkKGluZm8ubm9uRGVidWdBY2Nlc3NlcykubG9jLCAoKSA9PlxuXHRcdFx0XHRcdGBEZWJ1Zy1vbmx5IGxvY2FsICR7Y29kZShsb2NhbC5uYW1lKX0gdXNlZCBvdXRzaWRlIG9mIGRlYnVnLmApXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGNvbnRleHQud2FybklmKG5vTm9uRGVidWcsIGxvY2FsLmxvYywgKCkgPT5cblx0XHRcdFx0XHRgTG9jYWwgJHtjb2RlKGxvY2FsLm5hbWUpfSB1c2VkIG9ubHkgaW4gZGVidWcuYClcblx0XHR9XG5cdH0pXG5cblxuaW1wbGVtZW50TWFueShNc0FzdFR5cGVzLCAndmVyaWZ5Jywge1xuXHRBc3NlcnQoKSB7XG5cdFx0dGhpcy5jb25kaXRpb24udmVyaWZ5KClcblx0XHR2ZXJpZnlPcEVhY2godGhpcy5vcFRocm93bilcblx0fSxcblxuXHRBc3NpZ25TaW5nbGUoKSB7XG5cdFx0d2l0aE5hbWUodGhpcy5hc3NpZ25lZS5uYW1lLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBkb1YgPSAoKSA9PiB7XG5cdFx0XHRcdC8qXG5cdFx0XHRcdEZ1biBhbmQgQ2xhc3Mgb25seSBnZXQgbmFtZSBpZiB0aGV5IGFyZSBpbW1lZGlhdGVseSBhZnRlciB0aGUgYXNzaWdubWVudC5cblx0XHRcdFx0c28gaW4gYHggPSAkYWZ0ZXItdGltZSAxMDAwIHxgIHRoZSBmdW5jdGlvbiBpcyBub3QgbmFtZWQuXG5cdFx0XHRcdCovXG5cdFx0XHRcdGlmICh0aGlzLnZhbHVlIGluc3RhbmNlb2YgQ2xhc3MgfHwgdGhpcy52YWx1ZSBpbnN0YW5jZW9mIEZ1bilcblx0XHRcdFx0XHRzZXROYW1lKHRoaXMudmFsdWUpXG5cblx0XHRcdFx0Ly8gQXNzaWduZWUgcmVnaXN0ZXJlZCBieSB2ZXJpZnlMaW5lcy5cblx0XHRcdFx0dGhpcy5hc3NpZ25lZS52ZXJpZnkoKVxuXHRcdFx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy5hc3NpZ25lZS5pc0xhenkoKSlcblx0XHRcdFx0d2l0aEJsb2NrTG9jYWxzKGRvVilcblx0XHRcdGVsc2Vcblx0XHRcdFx0ZG9WKClcblx0XHR9KVxuXHR9LFxuXG5cdEFzc2lnbkRlc3RydWN0dXJlKCkge1xuXHRcdC8vIEFzc2lnbmVlcyByZWdpc3RlcmVkIGJ5IHZlcmlmeUxpbmVzLlxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFzc2lnbmVlcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0QmFnRW50cnk6IHZlcmlmeUJhZ0VudHJ5LFxuXHRCYWdFbnRyeU1hbnk6IHZlcmlmeUJhZ0VudHJ5LFxuXG5cdEJhZ1NpbXBsZSgpIHtcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5wYXJ0cylcblx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHRCbG9ja0RvKCkgeyB2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKSB9LFxuXG5cdEJsb2NrVmFsVGhyb3coKSB7XG5cdFx0Y29uc3QgbmV3TG9jYWxzID0gdmVyaWZ5TGluZXModGhpcy5saW5lcylcblx0XHRwbHVzTG9jYWxzKG5ld0xvY2FscywgKCkgPT4gdGhpcy50aHJvdy52ZXJpZnkoKSlcblx0fSxcblxuXHRCbG9ja1dpdGhSZXR1cm4oKSB7XG5cdFx0Y29uc3QgbmV3TG9jYWxzID0gdmVyaWZ5TGluZXModGhpcy5saW5lcylcblx0XHRwbHVzTG9jYWxzKG5ld0xvY2FscywgKCkgPT4gdGhpcy5yZXR1cm5lZC52ZXJpZnkoKSlcblx0fSxcblxuXHRCbG9ja09iaigpIHtcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5idWlsdCwgKCkgPT4ge1xuXHRcdFx0Y29uc3QgbmV3TG9jYWxzID0gdmVyaWZ5TGluZXModGhpcy5saW5lcylcblx0XHRcdG9wRWFjaCh0aGlzLm9wT2JqZWQsIF8gPT4gcGx1c0xvY2FscyhuZXdMb2NhbHMsICgpID0+IF8udmVyaWZ5KCkpKVxuXHRcdH0pXG5cdH0sXG5cblx0QmxvY2tCYWc6IHZlcmlmeUJsb2NrQmFnT3JNYXAsXG5cdEJsb2NrTWFwOiB2ZXJpZnlCbG9ja0JhZ09yTWFwLFxuXG5cdEJsb2NrV3JhcCgpIHsgd2l0aElJRkUoKCkgPT4gdGhpcy5ibG9jay52ZXJpZnkoKSkgfSxcblxuXHRCcmVhaygpIHtcblx0XHR2ZXJpZnlJbkxvb3AodGhpcylcblx0XHRjb250ZXh0LmNoZWNrKCEob3BMb29wIGluc3RhbmNlb2YgRm9yVmFsKSwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRgJHtjb2RlKCdmb3InKX0gbXVzdCBicmVhayB3aXRoIGEgdmFsdWUuYClcblx0fSxcblxuXHRCcmVha1dpdGhWYWwoKSB7XG5cdFx0dmVyaWZ5SW5Mb29wKHRoaXMpXG5cdFx0Y29udGV4dC5jaGVjayhvcExvb3AgaW5zdGFuY2VvZiBGb3JWYWwsIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0YCR7Y29kZSgnYnJlYWsnKX0gb25seSB2YWxpZCBpbnNpZGUgJHtjb2RlKCdmb3InKX1gKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0fSxcblxuXHRDYWxsKCkge1xuXHRcdHRoaXMuY2FsbGVkLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHRDYXNlRG8oKSB7IHZlcmlmeUNhc2UodGhpcykgfSxcblx0Q2FzZURvUGFydDogdmVyaWZ5Q2FzZVBhcnQsXG5cdENhc2VWYWwoKSB7IHdpdGhJSUZFKCgpID0+IHZlcmlmeUNhc2UodGhpcykpIH0sXG5cdENhc2VWYWxQYXJ0OiB2ZXJpZnlDYXNlUGFydCxcblxuXHRDYXRjaCgpIHtcblx0XHRjb250ZXh0LmNoZWNrKHRoaXMuY2F1Z2h0Lm9wVHlwZSA9PT0gbnVsbCwgdGhpcy5jYXVnaHQubG9jLCAnVE9ETzogQ2F1Z2h0IHR5cGVzJylcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5jYXVnaHQsICgpID0+IHRoaXMuYmxvY2sudmVyaWZ5KCkpXG5cdH0sXG5cblx0Q2xhc3MoKSB7XG5cdFx0dmVyaWZ5T3BFYWNoKHRoaXMub3BTdXBlckNsYXNzKVxuXHRcdHZlcmlmeU9wRWFjaCh0aGlzLm9wRG8pXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuc3RhdGljcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHRpZiAodGhpcy5vcENvbnN0cnVjdG9yICE9PSBudWxsKSB7XG5cdFx0XHRva1RvTm90VXNlLmFkZCh0aGlzLm9wQ29uc3RydWN0b3Iub3BEZWNsYXJlVGhpcylcblx0XHRcdHdpdGhNZXRob2QoJ2NvbnN0cnVjdG9yJywgKCkgPT4gdGhpcy5vcENvbnN0cnVjdG9yLnZlcmlmeSh0cnVlKSlcblx0XHR9XG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMubWV0aG9kcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHQvLyBuYW1lIHNldCBieSBBc3NpZ25TaW5nbGVcblx0fSxcblxuXHRDbGFzc0RvKCkge1xuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmRlY2xhcmVGb2N1cywgKCkgPT4gdGhpcy5ibG9jay52ZXJpZnkoKSlcblx0fSxcblxuXHRDb25kaXRpb25hbERvKCkge1xuXHRcdHRoaXMudGVzdC52ZXJpZnkoKVxuXHRcdHRoaXMucmVzdWx0LnZlcmlmeSgpXG5cdH0sXG5cdENvbmRpdGlvbmFsVmFsKCkge1xuXHRcdHRoaXMudGVzdC52ZXJpZnkoKVxuXHRcdHdpdGhJSUZFKCgpID0+IHRoaXMucmVzdWx0LnZlcmlmeSgpKVxuXHR9LFxuXG5cdC8vIE9ubHkgcmVhY2ggaGVyZSBmb3IgaW4vb3V0IGNvbmRpdGlvbi5cblx0RGVidWcoKSB7IHZlcmlmeUxpbmVzKFsgdGhpcyBdKSB9LFxuXG5cdEV4Y2VwdERvOiB2ZXJpZnlFeGNlcHQsXG5cdEV4Y2VwdFZhbDogdmVyaWZ5RXhjZXB0LFxuXG5cdEZvckJhZygpIHsgdmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuYnVpbHQsICgpID0+IHZlcmlmeUZvcih0aGlzKSkgfSxcblxuXHRGb3JEbygpIHsgdmVyaWZ5Rm9yKHRoaXMpIH0sXG5cblx0Rm9yVmFsKCkgeyB2ZXJpZnlGb3IodGhpcykgfSxcblxuXHRGdW4oKSB7XG5cdFx0d2l0aEJsb2NrTG9jYWxzKCgpID0+IHtcblx0XHRcdGNvbnRleHQuY2hlY2sodGhpcy5vcERlY2xhcmVSZXMgPT09IG51bGwgfHwgdGhpcy5ibG9jayBpbnN0YW5jZW9mIEJsb2NrVmFsLCB0aGlzLmxvYyxcblx0XHRcdFx0J0Z1bmN0aW9uIHdpdGggcmV0dXJuIGNvbmRpdGlvbiBtdXN0IHJldHVybiBzb21ldGhpbmcuJylcblx0XHRcdHdpdGhJbkdlbmVyYXRvcih0aGlzLmlzR2VuZXJhdG9yLCAoKSA9PlxuXHRcdFx0XHR3aXRoTG9vcChudWxsLCAoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgYWxsQXJncyA9IGNhdCh0aGlzLm9wRGVjbGFyZVRoaXMsIHRoaXMuYXJncywgdGhpcy5vcFJlc3RBcmcpXG5cdFx0XHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FscyhhbGxBcmdzLCAoKSA9PiB7XG5cdFx0XHRcdFx0XHR2ZXJpZnlPcEVhY2godGhpcy5vcEluKVxuXHRcdFx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoKVxuXHRcdFx0XHRcdFx0b3BFYWNoKHRoaXMub3BEZWNsYXJlUmVzLCB2ZXJpZnlMb2NhbERlY2xhcmUpXG5cdFx0XHRcdFx0XHRjb25zdCB2ZXJpZnlPdXQgPSAoKSA9PiB2ZXJpZnlPcEVhY2godGhpcy5vcE91dClcblx0XHRcdFx0XHRcdGlmRWxzZSh0aGlzLm9wRGVjbGFyZVJlcywgXyA9PiBwbHVzTG9jYWwoXywgdmVyaWZ5T3V0KSwgdmVyaWZ5T3V0KVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH0pKVxuXHRcdH0pXG5cdFx0Ly8gbmFtZSBzZXQgYnkgQXNzaWduU2luZ2xlXG5cdH0sXG5cblx0SWdub3JlKCkge1xuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmlnbm9yZWQpXG5cdFx0XHRhY2Nlc3NMb2NhbCh0aGlzLCBfKVxuXHR9LFxuXG5cdExhenkoKSB7IHdpdGhCbG9ja0xvY2FscygoKSA9PiB0aGlzLnZhbHVlLnZlcmlmeSgpKSB9LFxuXG5cdExvY2FsQWNjZXNzKCkge1xuXHRcdGNvbnN0IGRlY2xhcmUgPSBsb2NhbHMuZ2V0KHRoaXMubmFtZSlcblx0XHRpZiAoZGVjbGFyZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjb25zdCBidWlsdGluUGF0aCA9IGNvbnRleHQub3B0cy5idWlsdGluTmFtZVRvUGF0aC5nZXQodGhpcy5uYW1lKVxuXHRcdFx0aWYgKGJ1aWx0aW5QYXRoID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdGZhaWxNaXNzaW5nTG9jYWwodGhpcy5sb2MsIHRoaXMubmFtZSlcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRjb25zdCBuYW1lcyA9IHJlc3VsdHMuYnVpbHRpblBhdGhUb05hbWVzLmdldChidWlsdGluUGF0aClcblx0XHRcdFx0aWYgKG5hbWVzID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdFx0cmVzdWx0cy5idWlsdGluUGF0aFRvTmFtZXMuc2V0KGJ1aWx0aW5QYXRoLCBuZXcgU2V0KFsgdGhpcy5uYW1lIF0pKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0bmFtZXMuYWRkKHRoaXMubmFtZSlcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzdWx0cy5sb2NhbEFjY2Vzc1RvRGVjbGFyZS5zZXQodGhpcywgZGVjbGFyZSlcblx0XHRcdHNldExvY2FsRGVjbGFyZUFjY2Vzc2VkKGRlY2xhcmUsIHRoaXMpXG5cdFx0fVxuXHR9LFxuXG5cdC8vIEFkZGluZyBMb2NhbERlY2xhcmVzIHRvIHRoZSBhdmFpbGFibGUgbG9jYWxzIGlzIGRvbmUgYnkgRnVuIG9yIGxpbmVOZXdMb2NhbHMuXG5cdExvY2FsRGVjbGFyZSgpIHtcblx0XHRjb25zdCBidWlsdGluUGF0aCA9IGNvbnRleHQub3B0cy5idWlsdGluTmFtZVRvUGF0aC5nZXQodGhpcy5uYW1lKVxuXHRcdGNvbnRleHQud2FybklmKGJ1aWx0aW5QYXRoICE9PSB1bmRlZmluZWQsIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0YExvY2FsICR7Y29kZSh0aGlzLm5hbWUpfSBvdmVycmlkZXMgYnVpbHRpbiBmcm9tICR7Y29kZShidWlsdGluUGF0aCl9LmApXG5cdFx0dmVyaWZ5T3BFYWNoKHRoaXMub3BUeXBlKVxuXHR9LFxuXG5cdExvY2FsTXV0YXRlKCkge1xuXHRcdGNvbnN0IGRlY2xhcmUgPSBnZXRMb2NhbERlY2xhcmUodGhpcy5uYW1lLCB0aGlzLmxvYylcblx0XHRjb250ZXh0LmNoZWNrKGRlY2xhcmUuaXNNdXRhYmxlKCksIHRoaXMubG9jLCAoKSA9PiBgJHtjb2RlKHRoaXMubmFtZSl9IGlzIG5vdCBtdXRhYmxlLmApXG5cdFx0Ly8gVE9ETzogVHJhY2sgbXV0YXRpb25zLiBNdXRhYmxlIGxvY2FsIG11c3QgYmUgbXV0YXRlZCBzb21ld2hlcmUuXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdExvZ2ljKCkge1xuXHRcdGNvbnRleHQuY2hlY2sodGhpcy5hcmdzLmxlbmd0aCA+IDEsICdMb2dpYyBleHByZXNzaW9uIG5lZWRzIGF0IGxlYXN0IDIgYXJndW1lbnRzLicpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHROb3QoKSB7IHRoaXMuYXJnLnZlcmlmeSgpIH0sXG5cblx0TnVtYmVyTGl0ZXJhbCgpIHsgfSxcblxuXHRNYXBFbnRyeSgpIHtcblx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHRoaXMua2V5LnZlcmlmeSgpXG5cdFx0dGhpcy52YWwudmVyaWZ5KClcblx0fSxcblxuXHRNZW1iZXIoKSB7IHRoaXMub2JqZWN0LnZlcmlmeSgpIH0sXG5cblx0TWVtYmVyU2V0KCkge1xuXHRcdHRoaXMub2JqZWN0LnZlcmlmeSgpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdE1ldGhvZEltcGwoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kKHRoaXMsICgpID0+IHtcblx0XHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZnVuLm9wRGVjbGFyZVRoaXMpXG5cdFx0XHR0aGlzLmZ1bi52ZXJpZnkoKVxuXHRcdH0pXG5cdH0sXG5cdE1ldGhvZEdldHRlcigpIHtcblx0XHR2ZXJpZnlNZXRob2QodGhpcywgKCkgPT4ge1xuXHRcdFx0b2tUb05vdFVzZS5hZGQodGhpcy5kZWNsYXJlVGhpcylcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoWyB0aGlzLmRlY2xhcmVUaGlzIF0sICgpID0+IHsgdGhpcy5ibG9jay52ZXJpZnkoKSB9KVxuXHRcdH0pXG5cdH0sXG5cdE1ldGhvZFNldHRlcigpIHtcblx0XHR2ZXJpZnlNZXRob2QodGhpcywgKCkgPT4ge1xuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FscyhbIHRoaXMuZGVjbGFyZVRoaXMsIHRoaXMuZGVjbGFyZUZvY3VzIF0sICgpID0+IHtcblx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoKVxuXHRcdFx0fSlcblx0XHR9KVxuXHR9LFxuXG5cdE1vZHVsZSgpIHtcblx0XHQvLyBObyBuZWVkIHRvIHZlcmlmeSB0aGlzLmRvVXNlcy5cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy51c2VzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdHZlcmlmeU9wRWFjaCh0aGlzLm9wVXNlR2xvYmFsKVxuXHRcdHdpdGhJbkRlYnVnKCgpID0+IHtcblx0XHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmRlYnVnVXNlcylcblx0XHRcdFx0Xy52ZXJpZnkoKVxuXHRcdH0pXG5cblx0XHR3aXRoTmFtZShjb250ZXh0Lm9wdHMubW9kdWxlTmFtZSgpLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBuZXdMb2NhbHMgPSB2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHRcdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuZXhwb3J0cylcblx0XHRcdFx0YWNjZXNzTG9jYWxGb3JSZXR1cm4oXywgdGhpcylcblx0XHRcdG9wRWFjaCh0aGlzLm9wRGVmYXVsdEV4cG9ydCwgXyA9PiB7XG5cdFx0XHRcdGlmIChfIGluc3RhbmNlb2YgQ2xhc3MgfHwgXyBpbnN0YW5jZW9mIEZ1bilcblx0XHRcdFx0XHRzZXROYW1lKF8pXG5cdFx0XHRcdHBsdXNMb2NhbHMobmV3TG9jYWxzLCAoKSA9PiB7IF8udmVyaWZ5KCkgfSlcblx0XHRcdH0pXG5cblx0XHRcdGNvbnN0IGV4cG9ydHMgPSBuZXcgU2V0KHRoaXMuZXhwb3J0cylcblx0XHRcdGNvbnN0IG1hcmtFeHBvcnRMaW5lcyA9IGxpbmUgPT4ge1xuXHRcdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIEFzc2lnbiAmJiBsaW5lLmFsbEFzc2lnbmVlcygpLnNvbWUoXyA9PiBleHBvcnRzLmhhcyhfKSkpXG5cdFx0XHRcdFx0cmVzdWx0cy5leHBvcnRBc3NpZ25zLmFkZChsaW5lKVxuXHRcdFx0XHRlbHNlIGlmIChsaW5lIGluc3RhbmNlb2YgRGVidWcpXG5cdFx0XHRcdFx0bGluZS5saW5lcy5mb3JFYWNoKG1hcmtFeHBvcnRMaW5lcylcblx0XHRcdH1cblx0XHRcdHRoaXMubGluZXMuZm9yRWFjaChtYXJrRXhwb3J0TGluZXMpXG5cdFx0fSlcblx0fSxcblxuXHROZXcoKSB7XG5cdFx0dGhpcy50eXBlLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHRPYmpFbnRyeUFzc2lnbigpIHtcblx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHRoaXMuYXNzaWduLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXNzaWduLmFsbEFzc2lnbmVlcygpKVxuXHRcdFx0YWNjZXNzTG9jYWwodGhpcywgXy5uYW1lKVxuXHR9LFxuXG5cdE9iakVudHJ5Q29tcHV0ZWQoKSB7XG5cdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR0aGlzLmtleS52ZXJpZnkoKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0fSxcblxuXHRPYmpTaW1wbGUoKSB7XG5cdFx0Y29uc3Qga2V5cyA9IG5ldyBTZXQoKVxuXHRcdGZvciAoY29uc3QgcGFpciBvZiB0aGlzLnBhaXJzKSB7XG5cdFx0XHRjb25zdCB7IGtleSwgdmFsdWUgfSA9IHBhaXJcblx0XHRcdGNvbnRleHQuY2hlY2soIWtleXMuaGFzKGtleSksIHBhaXIubG9jLCAoKSA9PiBgRHVwbGljYXRlIGtleSAke2tleX1gKVxuXHRcdFx0a2V5cy5hZGQoa2V5KVxuXHRcdFx0dmFsdWUudmVyaWZ5KClcblx0XHR9XG5cdH0sXG5cblx0UXVvdGUoKSB7XG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMucGFydHMpXG5cdFx0XHRpZiAodHlwZW9mIF8gIT09ICdzdHJpbmcnKVxuXHRcdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0UXVvdGVUZW1wbGF0ZSgpIHtcblx0XHR0aGlzLnRhZy52ZXJpZnkoKVxuXHRcdHRoaXMucXVvdGUudmVyaWZ5KClcblx0fSxcblxuXHRTcGVjaWFsRG8oKSB7IH0sXG5cblx0U3BlY2lhbFZhbCgpIHtcblx0XHRzZXROYW1lKHRoaXMpXG5cdH0sXG5cblx0U3BsYXQoKSB7IHRoaXMuc3BsYXR0ZWQudmVyaWZ5KCkgfSxcblxuXHRTdXBlckNhbGw6IHZlcmlmeVN1cGVyQ2FsbCxcblx0U3VwZXJDYWxsRG86IHZlcmlmeVN1cGVyQ2FsbCxcblx0U3VwZXJNZW1iZXIoKSB7XG5cdFx0Y29udGV4dC5jaGVjayhtZXRob2QgIT09IG51bGwsIHRoaXMubG9jLCAnTXVzdCBiZSBpbiBtZXRob2QuJylcblx0fSxcblxuXHRTd2l0Y2hEbygpIHsgdmVyaWZ5U3dpdGNoKHRoaXMpIH0sXG5cdFN3aXRjaERvUGFydDogdmVyaWZ5U3dpdGNoUGFydCxcblx0U3dpdGNoVmFsKCkgeyB3aXRoSUlGRSgoKSA9PiB2ZXJpZnlTd2l0Y2godGhpcykpIH0sXG5cdFN3aXRjaFZhbFBhcnQ6IHZlcmlmeVN3aXRjaFBhcnQsXG5cblx0VGhyb3coKSB7XG5cdFx0dmVyaWZ5T3BFYWNoKHRoaXMub3BUaHJvd24pXG5cdH0sXG5cblx0VXNlOiB2ZXJpZnlVc2UsXG5cdFVzZUdsb2JhbDogdmVyaWZ5VXNlLFxuXG5cdFdpdGgoKSB7XG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHRcdHdpdGhJSUZFKCgpID0+IHtcblx0XHRcdGlmICh0aGlzLmRlY2xhcmUgaW5zdGFuY2VvZiBMb2NhbERlY2xhcmVGb2N1cylcblx0XHRcdFx0b2tUb05vdFVzZS5hZGQodGhpcy5kZWNsYXJlKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuZGVjbGFyZSwgKCkgPT4geyB0aGlzLmJsb2NrLnZlcmlmeSgpIH0pXG5cdFx0fSlcblx0fSxcblxuXHRZaWVsZCgpIHtcblx0XHRjb250ZXh0LmNoZWNrKGlzSW5HZW5lcmF0b3IsIHRoaXMubG9jLCAnQ2Fubm90IHlpZWxkIG91dHNpZGUgb2YgZ2VuZXJhdG9yIGNvbnRleHQnKVxuXHRcdHZlcmlmeU9wRWFjaCh0aGlzLm9wWWllbGRlZClcblx0fSxcblxuXHRZaWVsZFRvKCkge1xuXHRcdGNvbnRleHQuY2hlY2soaXNJbkdlbmVyYXRvciwgdGhpcy5sb2MsICdDYW5ub3QgeWllbGQgb3V0c2lkZSBvZiBnZW5lcmF0b3IgY29udGV4dCcpXG5cdFx0dGhpcy55aWVsZGVkVG8udmVyaWZ5KClcblx0fVxufSlcblxuZnVuY3Rpb24gdmVyaWZ5QmFnRW50cnkoKSB7XG5cdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdHRoaXMudmFsdWUudmVyaWZ5KClcbn1cblxuZnVuY3Rpb24gdmVyaWZ5QmxvY2tCYWdPck1hcCgpIHtcblx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuYnVpbHQsICgpID0+IHZlcmlmeUxpbmVzKHRoaXMubGluZXMpKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlDYXNlUGFydCgpIHtcblx0aWYgKHRoaXMudGVzdCBpbnN0YW5jZW9mIFBhdHRlcm4pIHtcblx0XHR0aGlzLnRlc3QudHlwZS52ZXJpZnkoKVxuXHRcdHRoaXMudGVzdC5wYXR0ZXJuZWQudmVyaWZ5KClcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKHRoaXMudGVzdC5sb2NhbHMsICgpID0+IHRoaXMucmVzdWx0LnZlcmlmeSgpKVxuXHR9IGVsc2Uge1xuXHRcdHRoaXMudGVzdC52ZXJpZnkoKVxuXHRcdHRoaXMucmVzdWx0LnZlcmlmeSgpXG5cdH1cbn1cblxuZnVuY3Rpb24gdmVyaWZ5U3dpdGNoUGFydCgpIHtcblx0Zm9yIChjb25zdCBfIG9mIHRoaXMudmFsdWVzKVxuXHRcdF8udmVyaWZ5KClcblx0dGhpcy5yZXN1bHQudmVyaWZ5KClcbn1cblxuZnVuY3Rpb24gdmVyaWZ5RXhjZXB0KCkge1xuXHR0aGlzLl90cnkudmVyaWZ5KClcblx0dmVyaWZ5T3BFYWNoKHRoaXMuX2NhdGNoKVxuXHR2ZXJpZnlPcEVhY2godGhpcy5fZmluYWxseSlcbn1cblxuZnVuY3Rpb24gdmVyaWZ5U3VwZXJDYWxsKCkge1xuXHRjb250ZXh0LmNoZWNrKG1ldGhvZCAhPT0gbnVsbCwgdGhpcy5sb2MsICdNdXN0IGJlIGluIGEgbWV0aG9kLicpXG5cdHJlc3VsdHMuc3VwZXJDYWxsVG9NZXRob2Quc2V0KHRoaXMsIG1ldGhvZClcblx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRfLnZlcmlmeSgpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeVVzZSgpIHtcblx0Ly8gU2luY2UgVXNlcyBhcmUgYWx3YXlzIGluIHRoZSBvdXRlcm1vc3Qgc2NvcGUsIGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgc2hhZG93aW5nLlxuXHQvLyBTbyB3ZSBtdXRhdGUgYGxvY2Fsc2AgZGlyZWN0bHkuXG5cdGNvbnN0IGFkZFVzZUxvY2FsID0gXyA9PiB7XG5cdFx0Y29uc3QgcHJldiA9IGxvY2Fscy5nZXQoXy5uYW1lKVxuXHRcdGNvbnRleHQuY2hlY2socHJldiA9PT0gdW5kZWZpbmVkLCBfLmxvYywgKCkgPT5cblx0XHRcdGAke2NvZGUoXy5uYW1lKX0gYWxyZWFkeSBpbXBvcnRlZCBhdCAke3ByZXYubG9jfWApXG5cdFx0dmVyaWZ5TG9jYWxEZWNsYXJlKF8pXG5cdFx0c2V0TG9jYWwoXylcblx0fVxuXHRmb3IgKGNvbnN0IF8gb2YgdGhpcy51c2VkKVxuXHRcdGFkZFVzZUxvY2FsKF8pXG5cdG9wRWFjaCh0aGlzLm9wVXNlRGVmYXVsdCwgYWRkVXNlTG9jYWwpXG59XG5cbi8vIEhlbHBlcnMgc3BlY2lmaWMgdG8gY2VydGFpbiBNc0FzdCB0eXBlczpcbmNvbnN0XG5cdHZlcmlmeUZvciA9IGZvckxvb3AgPT4ge1xuXHRcdGNvbnN0IHZlcmlmeUJsb2NrID0gKCkgPT4gd2l0aExvb3AoZm9yTG9vcCwgKCkgPT4gZm9yTG9vcC5ibG9jay52ZXJpZnkoKSlcblx0XHRpZkVsc2UoZm9yTG9vcC5vcEl0ZXJhdGVlLFxuXHRcdFx0KHsgZWxlbWVudCwgYmFnIH0pID0+IHtcblx0XHRcdFx0YmFnLnZlcmlmeSgpXG5cdFx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbChlbGVtZW50LCB2ZXJpZnlCbG9jaylcblx0XHRcdH0sXG5cdFx0XHR2ZXJpZnlCbG9jaylcblx0fSxcblxuXHR2ZXJpZnlJbkxvb3AgPSBsb29wVXNlciA9PlxuXHRcdGNvbnRleHQuY2hlY2sob3BMb29wICE9PSBudWxsLCBsb29wVXNlci5sb2MsICdOb3QgaW4gYSBsb29wLicpLFxuXG5cblx0dmVyaWZ5Q2FzZSA9IF8gPT4ge1xuXHRcdGNvbnN0IGRvSXQgPSAoKSA9PiB7XG5cdFx0XHRmb3IgKGNvbnN0IHBhcnQgb2YgXy5wYXJ0cylcblx0XHRcdFx0cGFydC52ZXJpZnkoKVxuXHRcdFx0dmVyaWZ5T3BFYWNoKF8ub3BFbHNlKVxuXHRcdH1cblx0XHRpZkVsc2UoXy5vcENhc2VkLFxuXHRcdFx0XyA9PiB7XG5cdFx0XHRcdF8udmVyaWZ5KClcblx0XHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKF8uYXNzaWduZWUsIGRvSXQpXG5cdFx0XHR9LFxuXHRcdFx0ZG9JdClcblx0fSxcblxuXHR2ZXJpZnlNZXRob2QgPSAoXywgZG9WZXJpZnkpID0+IHtcblx0XHRpZiAodHlwZW9mIF8uc3ltYm9sICE9PSAnc3RyaW5nJylcblx0XHRcdF8uc3ltYm9sLnZlcmlmeSgpXG5cdFx0d2l0aE1ldGhvZChfLCBkb1ZlcmlmeSlcblx0fSxcblxuXHR2ZXJpZnlTd2l0Y2ggPSBfID0+IHtcblx0XHRfLnN3aXRjaGVkLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBwYXJ0IG9mIF8ucGFydHMpXG5cdFx0XHRwYXJ0LnZlcmlmeSgpXG5cdFx0dmVyaWZ5T3BFYWNoKF8ub3BFbHNlKVxuXHR9XG5cbi8vIEdlbmVyYWwgdXRpbGl0aWVzOlxuY29uc3Rcblx0Z2V0TG9jYWxEZWNsYXJlID0gKG5hbWUsIGFjY2Vzc0xvYykgPT4ge1xuXHRcdGNvbnN0IGRlY2xhcmUgPSBsb2NhbHMuZ2V0KG5hbWUpXG5cdFx0aWYgKGRlY2xhcmUgPT09IHVuZGVmaW5lZClcblx0XHRcdGZhaWxNaXNzaW5nTG9jYWwoYWNjZXNzTG9jLCBuYW1lKVxuXHRcdHJldHVybiBkZWNsYXJlXG5cdH0sXG5cblx0ZmFpbE1pc3NpbmdMb2NhbCA9IChsb2MsIG5hbWUpID0+IHtcblx0XHRjb250ZXh0LmZhaWwobG9jLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBzaG93TG9jYWxzID0gY29kZShBcnJheSguLi5sb2NhbHMua2V5cygpKS5qb2luKCcgJykpXG5cdFx0XHRyZXR1cm4gYE5vIHN1Y2ggbG9jYWwgJHtjb2RlKG5hbWUpfS5cXG5Mb2NhbHMgYXJlOlxcbiR7c2hvd0xvY2Fsc30uYFxuXHRcdH0pXG5cdH0sXG5cblx0bGluZU5ld0xvY2FscyA9IGxpbmUgPT5cblx0XHRsaW5lIGluc3RhbmNlb2YgQXNzaWduU2luZ2xlID9cblx0XHRcdFsgbGluZS5hc3NpZ25lZSBdIDpcblx0XHRcdGxpbmUgaW5zdGFuY2VvZiBBc3NpZ25EZXN0cnVjdHVyZSA/XG5cdFx0XHRsaW5lLmFzc2lnbmVlcyA6XG5cdFx0XHRsaW5lIGluc3RhbmNlb2YgT2JqRW50cnkgP1xuXHRcdFx0bGluZU5ld0xvY2FscyhsaW5lLmFzc2lnbikgOlxuXHRcdFx0WyBdLFxuXG5cdHZlcmlmeUxpbmVzID0gbGluZXMgPT4ge1xuXHRcdC8qXG5cdFx0V2UgbmVlZCB0byBiZXQgYWxsIGJsb2NrIGxvY2FscyB1cC1mcm9udCBiZWNhdXNlXG5cdFx0RnVuY3Rpb25zIHdpdGhpbiBsaW5lcyBjYW4gYWNjZXNzIGxvY2FscyBmcm9tIGxhdGVyIGxpbmVzLlxuXHRcdE5PVEU6IFdlIHB1c2ggdGhlc2Ugb250byBwZW5kaW5nQmxvY2tMb2NhbHMgaW4gcmV2ZXJzZVxuXHRcdHNvIHRoYXQgd2hlbiB3ZSBpdGVyYXRlIHRocm91Z2ggbGluZXMgZm9yd2FyZHMsIHdlIGNhbiBwb3AgZnJvbSBwZW5kaW5nQmxvY2tMb2NhbHNcblx0XHR0byByZW1vdmUgcGVuZGluZyBsb2NhbHMgYXMgdGhleSBiZWNvbWUgcmVhbCBsb2NhbHMuXG5cdFx0SXQgZG9lc24ndCByZWFsbHkgbWF0dGVyIHdoYXQgb3JkZXIgd2UgYWRkIGxvY2FscyBpbiBzaW5jZSBpdCdzIG5vdCBhbGxvd2VkXG5cdFx0dG8gaGF2ZSB0d28gbG9jYWxzIG9mIHRoZSBzYW1lIG5hbWUgaW4gdGhlIHNhbWUgYmxvY2suXG5cdFx0Ki9cblx0XHRjb25zdCBuZXdMb2NhbHMgPSBbIF1cblxuXHRcdGNvbnN0IGdldExpbmVMb2NhbHMgPSBsaW5lID0+IHtcblx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgRGVidWcpXG5cdFx0XHRcdHdpdGhJbkRlYnVnKCgpID0+IHtcblx0XHRcdFx0XHRmb3IgKGNvbnN0IF8gb2YgcmV2ZXJzZUl0ZXIobGluZS5saW5lcykpXG5cdFx0XHRcdFx0XHRnZXRMaW5lTG9jYWxzKF8pXG5cdFx0XHRcdH0pXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGZvciAoY29uc3QgXyBvZiByZXZlcnNlSXRlcihsaW5lTmV3TG9jYWxzKGxpbmUpKSkge1xuXHRcdFx0XHRcdC8vIFJlZ2lzdGVyIHRoZSBsb2NhbCBub3cuIENhbid0IHdhaXQgdW50aWwgdGhlIGFzc2lnbiBpcyB2ZXJpZmllZC5cblx0XHRcdFx0XHRyZWdpc3RlckxvY2FsKF8pXG5cdFx0XHRcdFx0bmV3TG9jYWxzLnB1c2goXylcblx0XHRcdFx0fVxuXHRcdH1cblx0XHRmb3IgKGNvbnN0IF8gb2YgcmV2ZXJzZUl0ZXIobGluZXMpKVxuXHRcdFx0Z2V0TGluZUxvY2FscyhfKVxuXHRcdHBlbmRpbmdCbG9ja0xvY2Fscy5wdXNoKC4uLm5ld0xvY2FscylcblxuXHRcdC8qXG5cdFx0S2VlcHMgdHJhY2sgb2YgbG9jYWxzIHdoaWNoIGhhdmUgYWxyZWFkeSBiZWVuIGFkZGVkIGluIHRoaXMgYmxvY2suXG5cdFx0TWFzb24gYWxsb3dzIHNoYWRvd2luZywgYnV0IG5vdCB3aXRoaW4gdGhlIHNhbWUgYmxvY2suXG5cdFx0U28sIHRoaXMgaXMgYWxsb3dlZDpcblx0XHRcdGEgPSAxXG5cdFx0XHRiID1cblx0XHRcdFx0YSA9IDJcblx0XHRcdFx0Li4uXG5cdFx0QnV0IG5vdDpcblx0XHRcdGEgPSAxXG5cdFx0XHRhID0gMlxuXHRcdCovXG5cdFx0Y29uc3QgdGhpc0Jsb2NrTG9jYWxOYW1lcyA9IG5ldyBTZXQoKVxuXG5cdFx0Ly8gQWxsIHNoYWRvd2VkIGxvY2FscyBmb3IgdGhpcyBibG9jay5cblx0XHRjb25zdCBzaGFkb3dlZCA9IFsgXVxuXG5cdFx0Y29uc3QgdmVyaWZ5TGluZSA9IGxpbmUgPT4ge1xuXHRcdFx0aWYgKGxpbmUgaW5zdGFuY2VvZiBEZWJ1Zylcblx0XHRcdFx0Ly8gVE9ETzogRG8gYW55dGhpbmcgaW4gdGhpcyBzaXR1YXRpb24/XG5cdFx0XHRcdC8vIGNvbnRleHQuY2hlY2soIWluRGVidWcsIGxpbmUubG9jLCAnUmVkdW5kYW50IGBkZWJ1Z2AuJylcblx0XHRcdFx0d2l0aEluRGVidWcoKCkgPT4gbGluZS5saW5lcy5mb3JFYWNoKHZlcmlmeUxpbmUpKVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHZlcmlmeUlzU3RhdGVtZW50KGxpbmUpXG5cdFx0XHRcdGZvciAoY29uc3QgbmV3TG9jYWwgb2YgbGluZU5ld0xvY2FscyhsaW5lKSkge1xuXHRcdFx0XHRcdGNvbnN0IG5hbWUgPSBuZXdMb2NhbC5uYW1lXG5cdFx0XHRcdFx0Y29uc3Qgb2xkTG9jYWwgPSBsb2NhbHMuZ2V0KG5hbWUpXG5cdFx0XHRcdFx0aWYgKG9sZExvY2FsICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdGNvbnRleHQuY2hlY2soIXRoaXNCbG9ja0xvY2FsTmFtZXMuaGFzKG5hbWUpLCBuZXdMb2NhbC5sb2MsXG5cdFx0XHRcdFx0XHRcdCgpID0+IGBBIGxvY2FsICR7Y29kZShuYW1lKX0gaXMgYWxyZWFkeSBpbiB0aGlzIGJsb2NrLmApXG5cdFx0XHRcdFx0XHRzaGFkb3dlZC5wdXNoKG9sZExvY2FsKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzQmxvY2tMb2NhbE5hbWVzLmFkZChuYW1lKVxuXHRcdFx0XHRcdHNldExvY2FsKG5ld0xvY2FsKVxuXG5cdFx0XHRcdFx0Ly8gTm93IHRoYXQgaXQncyBhZGRlZCBhcyBhIGxvY2FsLCBpdCdzIG5vIGxvbmdlciBwZW5kaW5nLlxuXHRcdFx0XHRcdC8vIFdlIGFkZGVkIHBlbmRpbmdCbG9ja0xvY2FscyBpbiB0aGUgcmlnaHQgb3JkZXIgdGhhdCB3ZSBjYW4ganVzdCBwb3AgdGhlbSBvZmYuXG5cdFx0XHRcdFx0Y29uc3QgcG9wcGVkID0gcGVuZGluZ0Jsb2NrTG9jYWxzLnBvcCgpXG5cdFx0XHRcdFx0YXNzZXJ0KHBvcHBlZCA9PT0gbmV3TG9jYWwpXG5cdFx0XHRcdH1cblx0XHRcdFx0bGluZS52ZXJpZnkoKVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGxpbmVzLmZvckVhY2godmVyaWZ5TGluZSlcblxuXHRcdG5ld0xvY2Fscy5mb3JFYWNoKGRlbGV0ZUxvY2FsKVxuXHRcdHNoYWRvd2VkLmZvckVhY2goc2V0TG9jYWwpXG5cblx0XHRyZXR1cm4gbmV3TG9jYWxzXG5cdH0sXG5cblx0dmVyaWZ5SXNTdGF0ZW1lbnQgPSBsaW5lID0+IHtcblx0XHRjb25zdCBpc1N0YXRlbWVudCA9XG5cdFx0XHRsaW5lIGluc3RhbmNlb2YgRG8gfHxcblx0XHRcdC8vIFNvbWUgdmFsdWVzIGFyZSBhbHNvIGFjY2VwdGFibGUuXG5cdFx0XHRsaW5lIGluc3RhbmNlb2YgQ2FsbCB8fFxuXHRcdFx0bGluZSBpbnN0YW5jZW9mIFlpZWxkIHx8XG5cdFx0XHRsaW5lIGluc3RhbmNlb2YgWWllbGRUb1xuXHRcdGNvbnRleHQuY2hlY2soaXNTdGF0ZW1lbnQsIGxpbmUubG9jLCAnRXhwcmVzc2lvbiBpbiBzdGF0ZW1lbnQgcG9zaXRpb24uJylcblx0fVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
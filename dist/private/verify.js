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
	// Current method we are in, or a Constructor, or null.
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
	accessLocalForReturn = (access, declare) => {
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
			if (this.opConstructor !== null) this.opConstructor.verify(this.opSuperClass !== null);
			for (const _ of this.methods) _.verify();
			// name set by AssignSingle
		},

		ClassDo() {
			verifyAndPlusLocal(this.declareFocus, () => this.block.verify());
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
			withIIFE(() => this.result.verify());
		},

		Constructor(classHasSuper) {
			okToNotUse.add(this.fun.opDeclareThis);
			withMethod(this, () => {
				this.fun.verify();
			});

			const superCall = results.constructorToSuper.get(this);

			if (classHasSuper) context.check(superCall !== undefined, this.loc, () => `Constructor must contain ${ (0, _CompileError.code)('super!') }`);else context.check(superCall === undefined, () => superCall.loc, () => `Class has no superclass, so ${ (0, _CompileError.code)('super!') } is not allowed.`);

			for (const _ of this.memberArgs) setLocalDeclareAccessed(_, this);
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
			// No need to verify this.doImports.
			for (const _ of this.imports) _.verify();
			verifyOpEach(this.opImportGlobal);
			withInDebug(() => {
				for (const _ of this.debugImports) _.verify();
			});

			withName(context.opts.moduleName(), () => {
				verifyLines(this.lines);
			});
		},

		ModuleExport() {
			this.assign.verify();
			for (const _ of this.assign.allAssignees()) accessLocalForReturn(this, _);
		},

		New() {
			this.type.verify();
			for (const _ of this.args) _.verify();
		},

		ObjEntryAssign() {
			accessLocal(this, 'built');
			this.assign.verify();
			for (const _ of this.assign.allAssignees()) accessLocalForReturn(this, _);
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

		Import: verifyImport,
		ImportGlobal: verifyImport,

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
		verifyAndPlusLocal(this.built, () => {
			verifyLines(this.lines);
		});
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

		if (method instanceof _MsAst.Constructor) {
			context.check(this instanceof _MsAst.SuperCallDo, this.loc, () => `${ (0, _CompileError.code)('super') } not supported in constructor; use ${ (0, _CompileError.code)('super!') }`);
			results.constructorToSuper.set(method, this);
		}

		for (const _ of this.args) _.verify();
	}

	function verifyImport() {
		// Since Uses are always in the outermost scope, don't have to worry about shadowing.
		// So we mutate `locals` directly.
		const addUseLocal = _ => {
			const prev = locals.get(_.name);
			context.check(prev === undefined, _.loc, () => `${ (0, _CompileError.code)(_.name) } already imported at ${ prev.loc }`);
			verifyLocalDeclare(_);
			setLocal(_);
		};
		for (const _ of this.imported) addUseLocal(_);
		(0, _util.opEach)(this.opImportDefault, addUseLocal);
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
			// TODO:ES6 `Array.from(locals.keys())` should work
			const keys = [];
			for (const key of locals.keys()) keys.push(key);
			const showLocals = (0, _CompileError.code)(keys.join(' '));
			return `No such local ${ (0, _CompileError.code)(name) }.\nLocals are:\n${ showLocals }.`;
		});
	},
	      lineNewLocals = line => line instanceof _MsAst.AssignSingle ? [line.assignee] : line instanceof _MsAst.AssignDestructure ? line.assignees : line instanceof _MsAst.ObjEntry ? lineNewLocals(line.assign) : line instanceof _MsAst.ModuleExport ? lineNewLocals(line.assign) : [],
	      verifyLines = lines => {
		var _pendingBlockLocals;

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
		(_pendingBlockLocals = pendingBlockLocals).push.apply(_pendingBlockLocals, newLocals);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZlcmlmeS5qcyIsInByaXZhdGUvdmVyaWZ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztrQkNXZSxDQUFDLFFBQVEsRUFBRSxLQUFLLEtBQUs7QUFDbkMsU0FBTyxHQUFHLFFBQVEsQ0FBQTtBQUNsQixRQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUNsQixvQkFBa0IsR0FBRyxFQUFFLENBQUE7QUFDdkIsV0FBUyxHQUFHLGFBQWEsR0FBRyxLQUFLLENBQUE7QUFDakMsWUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDdEIsUUFBTSxHQUFHLElBQUksQ0FBQTtBQUNiLFFBQU0sR0FBRyxJQUFJLENBQUE7QUFDYixTQUFPLEdBQUcsNkJBQW1CLENBQUE7O0FBRTdCLE9BQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUNkLGdCQUFjLEVBQUUsQ0FBQTs7QUFFaEIsUUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFBOztBQUVuQixTQUFPLEdBQUcsTUFBTSxHQUFHLFVBQVUsR0FBRyxNQUFNLEdBQUcsa0JBQWtCLEdBQUcsTUFBTSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUE7QUFDckYsU0FBTyxHQUFHLENBQUE7RUFDVjs7O0FBR0QsS0FDQyxPQUFPOztBQUVQLE9BQU07O0FBRU4sV0FBVSxFQUNWLE1BQU07Ozs7Ozs7Ozs7Ozs7OztBQWVOLG1CQUFrQixFQUNsQixTQUFTOztBQUVULGNBQWE7O0FBRWIsT0FBTSxFQUNOLE9BQU87O0FBRVAsS0FBSSxDQUFBOztBQUVMLE9BQ0MsWUFBWSxHQUFHLEVBQUUsSUFBSTtBQUNwQixNQUFJLEVBQUUsS0FBSyxJQUFJLEVBQ2QsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFBO0VBQ1o7T0FFRCxXQUFXLEdBQUcsWUFBWSxJQUN6QixNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7T0FFakMsUUFBUSxHQUFHLFlBQVksSUFDdEIsTUFBTSxDQUFDLEdBQUcs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QUksQ0FBQyxDQUFBO0FBQzdCLGFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTs7OztBQUlsQixXQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUN2QyxlQXp5QkcsTUFBTSxFQXl5QkYsTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFBO0tBQzNCO0FBQ0QsUUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO0lBQ2I7R0FDRCxDQUFBOztBQUVELE9BQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7O0FBRXpCLFdBQVMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDOUIsVUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTs7QUFFMUIsU0FBTyxTQUFTLENBQUE7RUFDaEI7T0FFRCxpQkFBaUIsR0FBRyxJQUFJLElBQUk7QUFDM0IsUUFBTSxXQUFXLEdBQ2hCLElBQUksbUJBNXpCNkUsRUFBRSxBQTR6QmpFOztBQUVsQixNQUFJLG1CQTl6QjRDLElBQUksQUE4ekJoQyxJQUNwQixJQUFJLG1CQTd6Qk8sS0FBSyxBQTZ6QkssSUFDckIsSUFBSSxtQkE5ekJjLE9BQU8sQUE4ekJGLENBQUE7QUFDeEIsU0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFBO0VBQ3pFLENBQUEiLCJmaWxlIjoicHJpdmF0ZS92ZXJpZnkuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0ICogYXMgTXNBc3RUeXBlcyBmcm9tICcuL01zQXN0J1xuaW1wb3J0IHtBc3NpZ25EZXN0cnVjdHVyZSwgQXNzaWduU2luZ2xlLCBCbG9ja1ZhbCwgQ2FsbCwgQ2xhc3MsIENvbnN0cnVjdG9yLCBEZWJ1ZywgRG8sIEZvclZhbCxcblx0RnVuLCBMb2NhbERlY2xhcmVCdWlsdCwgTG9jYWxEZWNsYXJlRm9jdXMsIExvY2FsRGVjbGFyZVJlcywgTW9kdWxlRXhwb3J0LCBPYmpFbnRyeSwgUGF0dGVybixcblx0U3VwZXJDYWxsRG8sIFlpZWxkLCBZaWVsZFRvfSBmcm9tICcuL01zQXN0J1xuaW1wb3J0IHthc3NlcnQsIGNhdCwgaGVhZCwgaWZFbHNlLCBpbXBsZW1lbnRNYW55LCBpc0VtcHR5LCBvcEVhY2gsIHJldmVyc2VJdGVyfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgVmVyaWZ5UmVzdWx0cywge0xvY2FsSW5mb30gZnJvbSAnLi9WZXJpZnlSZXN1bHRzJ1xuXG4vKlxuVGhlIHZlcmlmaWVyIGdlbmVyYXRlcyBpbmZvcm1hdGlvbiBuZWVkZWQgZHVyaW5nIHRyYW5zcGlsaW5nLCB0aGUgVmVyaWZ5UmVzdWx0cy5cbiovXG5leHBvcnQgZGVmYXVsdCAoX2NvbnRleHQsIG1zQXN0KSA9PiB7XG5cdGNvbnRleHQgPSBfY29udGV4dFxuXHRsb2NhbHMgPSBuZXcgTWFwKClcblx0cGVuZGluZ0Jsb2NrTG9jYWxzID0gW11cblx0aXNJbkRlYnVnID0gaXNJbkdlbmVyYXRvciA9IGZhbHNlXG5cdG9rVG9Ob3RVc2UgPSBuZXcgU2V0KClcblx0b3BMb29wID0gbnVsbFxuXHRtZXRob2QgPSBudWxsXG5cdHJlc3VsdHMgPSBuZXcgVmVyaWZ5UmVzdWx0cygpXG5cblx0bXNBc3QudmVyaWZ5KClcblx0dmVyaWZ5TG9jYWxVc2UoKVxuXG5cdGNvbnN0IHJlcyA9IHJlc3VsdHNcblx0Ly8gUmVsZWFzZSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuXHRjb250ZXh0ID0gbG9jYWxzID0gb2tUb05vdFVzZSA9IG9wTG9vcCA9IHBlbmRpbmdCbG9ja0xvY2FscyA9IG1ldGhvZCA9IHJlc3VsdHMgPSBudWxsXG5cdHJldHVybiByZXNcbn1cblxuLy8gVXNlIGEgdHJpY2sgbGlrZSBpbiBwYXJzZS5qcyBhbmQgaGF2ZSBldmVyeXRoaW5nIGNsb3NlIG92ZXIgdGhlc2UgbXV0YWJsZSB2YXJpYWJsZXMuXG5sZXRcblx0Y29udGV4dCxcblx0Ly8gTWFwIGZyb20gbmFtZXMgdG8gTG9jYWxEZWNsYXJlcy5cblx0bG9jYWxzLFxuXHQvLyBMb2NhbHMgdGhhdCBkb24ndCBoYXZlIHRvIGJlIGFjY2Vzc2VkLlxuXHRva1RvTm90VXNlLFxuXHRvcExvb3AsXG5cdC8qXG5cdExvY2FscyBmb3IgdGhpcyBibG9jay5cblx0VGhlc2UgYXJlIGFkZGVkIHRvIGxvY2FscyB3aGVuIGVudGVyaW5nIGEgRnVuY3Rpb24gb3IgbGF6eSBldmFsdWF0aW9uLlxuXHRJbjpcblx0XHRhID0gfFxuXHRcdFx0YlxuXHRcdGIgPSAxXG5cdGBiYCB3aWxsIGJlIGEgcGVuZGluZyBsb2NhbC5cblx0SG93ZXZlcjpcblx0XHRhID0gYlxuXHRcdGIgPSAxXG5cdHdpbGwgZmFpbCB0byB2ZXJpZnksIGJlY2F1c2UgYGJgIGNvbWVzIGFmdGVyIGBhYCBhbmQgaXMgbm90IGFjY2Vzc2VkIGluc2lkZSBhIGZ1bmN0aW9uLlxuXHRJdCB3b3VsZCB3b3JrIGZvciBgfmEgaXMgYmAsIHRob3VnaC5cblx0Ki9cblx0cGVuZGluZ0Jsb2NrTG9jYWxzLFxuXHRpc0luRGVidWcsXG5cdC8vIFdoZXRoZXIgd2UgYXJlIGN1cnJlbnRseSBhYmxlIHRvIHlpZWxkLlxuXHRpc0luR2VuZXJhdG9yLFxuXHQvLyBDdXJyZW50IG1ldGhvZCB3ZSBhcmUgaW4sIG9yIGEgQ29uc3RydWN0b3IsIG9yIG51bGwuXG5cdG1ldGhvZCxcblx0cmVzdWx0cyxcblx0Ly8gTmFtZSBvZiB0aGUgY2xvc2VzdCBBc3NpZ25TaW5nbGVcblx0bmFtZVxuXG5jb25zdFxuXHR2ZXJpZnlPcEVhY2ggPSBvcCA9PiB7XG5cdFx0aWYgKG9wICE9PSBudWxsKVxuXHRcdFx0b3AudmVyaWZ5KClcblx0fSxcblxuXHRkZWxldGVMb2NhbCA9IGxvY2FsRGVjbGFyZSA9PlxuXHRcdGxvY2Fscy5kZWxldGUobG9jYWxEZWNsYXJlLm5hbWUpLFxuXG5cdHNldExvY2FsID0gbG9jYWxEZWNsYXJlID0+XG5cdFx0bG9jYWxzLnNldChsb2NhbERlY2xhcmUubmFtZSwgbG9jYWxEZWNsYXJlKSxcblxuXHQvLyBXaGVuIGEgbG9jYWwgaXMgcmV0dXJuZWQgZnJvbSBhIEJsb2NrT2JqIG9yIE1vZHVsZSxcblx0Ly8gdGhlIHJldHVybiAnYWNjZXNzJyBpcyBjb25zaWRlcmVkIHRvIGJlICdkZWJ1ZycgaWYgdGhlIGxvY2FsIGlzLlxuXHRhY2Nlc3NMb2NhbEZvclJldHVybiA9IChhY2Nlc3MsIGRlY2xhcmUpID0+IHtcblx0XHRjb25zdCBpbmZvID0gcmVzdWx0cy5sb2NhbERlY2xhcmVUb0luZm8uZ2V0KGRlY2xhcmUpXG5cdFx0X2FkZExvY2FsQWNjZXNzKGluZm8sIGFjY2VzcywgaW5mby5pc0luRGVidWcpXG5cdH0sXG5cblx0YWNjZXNzTG9jYWwgPSAoYWNjZXNzLCBuYW1lKSA9PiB7XG5cdFx0Y29uc3QgZGVjbGFyZSA9IGdldExvY2FsRGVjbGFyZShuYW1lLCBhY2Nlc3MubG9jKVxuXHRcdHNldExvY2FsRGVjbGFyZUFjY2Vzc2VkKGRlY2xhcmUsIGFjY2Vzcylcblx0fSxcblxuXHRzZXRMb2NhbERlY2xhcmVBY2Nlc3NlZCA9IChkZWNsYXJlLCBhY2Nlc3MpID0+IHtcblx0XHRfYWRkTG9jYWxBY2Nlc3MocmVzdWx0cy5sb2NhbERlY2xhcmVUb0luZm8uZ2V0KGRlY2xhcmUpLCBhY2Nlc3MsIGlzSW5EZWJ1Zylcblx0fSxcblxuXHRfYWRkTG9jYWxBY2Nlc3MgPSAobG9jYWxJbmZvLCBhY2Nlc3MsIGlzRGVidWdBY2Nlc3MpID0+XG5cdFx0KGlzRGVidWdBY2Nlc3MgPyBsb2NhbEluZm8uZGVidWdBY2Nlc3NlcyA6IGxvY2FsSW5mby5ub25EZWJ1Z0FjY2Vzc2VzKS5wdXNoKGFjY2VzcyksXG5cblx0Ly8gRm9yIGV4cHJlc3Npb25zIGFmZmVjdGluZyBsaW5lTmV3TG9jYWxzLCB0aGV5IHdpbGwgYmUgcmVnaXN0ZXJlZCBiZWZvcmUgYmVpbmcgdmVyaWZpZWQuXG5cdC8vIFNvLCBMb2NhbERlY2xhcmUudmVyaWZ5IGp1c3QgdGhlIHR5cGUuXG5cdC8vIEZvciBsb2NhbHMgbm90IGFmZmVjdGluZyBsaW5lTmV3TG9jYWxzLCB1c2UgdGhpcyBpbnN0ZWFkIG9mIGp1c3QgZGVjbGFyZS52ZXJpZnkoKVxuXHR2ZXJpZnlMb2NhbERlY2xhcmUgPSBsb2NhbERlY2xhcmUgPT4ge1xuXHRcdHJlZ2lzdGVyTG9jYWwobG9jYWxEZWNsYXJlKVxuXHRcdGxvY2FsRGVjbGFyZS52ZXJpZnkoKVxuXHR9LFxuXG5cdHJlZ2lzdGVyTG9jYWwgPSBsb2NhbERlY2xhcmUgPT4ge1xuXHRcdHJlc3VsdHMubG9jYWxEZWNsYXJlVG9JbmZvLnNldChsb2NhbERlY2xhcmUsIExvY2FsSW5mby5lbXB0eShpc0luRGVidWcpKVxuXHR9LFxuXG5cdHNldE5hbWUgPSBleHByID0+IHtcblx0XHRyZXN1bHRzLm5hbWVzLnNldChleHByLCBuYW1lKVxuXHR9XG5cbi8vIFRoZXNlIGZ1bmN0aW9ucyBjaGFuZ2UgdmVyaWZpZXIgc3RhdGUgYW5kIGVmZmljaWVudGx5IHJldHVybiB0byB0aGUgb2xkIHN0YXRlIHdoZW4gZmluaXNoZWQuXG5jb25zdFxuXHR3aXRoSW5EZWJ1ZyA9IGFjdGlvbiA9PiB7XG5cdFx0Y29uc3Qgb2xkSXNJbkRlYnVnID0gaXNJbkRlYnVnXG5cdFx0aXNJbkRlYnVnID0gdHJ1ZVxuXHRcdGFjdGlvbigpXG5cdFx0aXNJbkRlYnVnID0gb2xkSXNJbkRlYnVnXG5cdH0sXG5cblx0d2l0aEluR2VuZXJhdG9yID0gKG5ld0lzSW5HZW5lcmF0b3IsIGFjdGlvbikgPT4ge1xuXHRcdGNvbnN0IG9sZElzSW5HZW5lcmF0b3IgPSBpc0luR2VuZXJhdG9yXG5cdFx0aXNJbkdlbmVyYXRvciA9IG5ld0lzSW5HZW5lcmF0b3Jcblx0XHRhY3Rpb24oKVxuXHRcdGlzSW5HZW5lcmF0b3IgPSBvbGRJc0luR2VuZXJhdG9yXG5cdH0sXG5cblx0d2l0aExvb3AgPSAobmV3TG9vcCwgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgb2xkTG9vcCA9IG9wTG9vcFxuXHRcdG9wTG9vcCA9IG5ld0xvb3Bcblx0XHRhY3Rpb24oKVxuXHRcdG9wTG9vcCA9IG9sZExvb3Bcblx0fSxcblxuXHR3aXRoTWV0aG9kID0gKG5ld01ldGhvZCwgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgb2xkTWV0aG9kID0gbWV0aG9kXG5cdFx0bWV0aG9kID0gbmV3TWV0aG9kXG5cdFx0YWN0aW9uKClcblx0XHRtZXRob2QgPSBvbGRNZXRob2Rcblx0fSxcblxuXHR3aXRoTmFtZSA9IChuZXdOYW1lLCBhY3Rpb24pID0+IHtcblx0XHRjb25zdCBvbGROYW1lID0gbmFtZVxuXHRcdG5hbWUgPSBuZXdOYW1lXG5cdFx0YWN0aW9uKClcblx0XHRuYW1lID0gb2xkTmFtZVxuXHR9LFxuXG5cdC8vIENhbid0IGJyZWFrIG91dCBvZiBsb29wIGluc2lkZSBvZiBJSUZFLlxuXHR3aXRoSUlGRSA9IGFjdGlvbiA9PiB7XG5cdFx0d2l0aExvb3AoZmFsc2UsIGFjdGlvbilcblx0fSxcblxuXHRwbHVzTG9jYWwgPSAoYWRkZWRMb2NhbCwgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgc2hhZG93ZWQgPSBsb2NhbHMuZ2V0KGFkZGVkTG9jYWwubmFtZSlcblx0XHRsb2NhbHMuc2V0KGFkZGVkTG9jYWwubmFtZSwgYWRkZWRMb2NhbClcblx0XHRhY3Rpb24oKVxuXHRcdGlmIChzaGFkb3dlZCA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0ZGVsZXRlTG9jYWwoYWRkZWRMb2NhbClcblx0XHRlbHNlXG5cdFx0XHRzZXRMb2NhbChzaGFkb3dlZClcblx0fSxcblxuXHQvLyBTaG91bGQgaGF2ZSB2ZXJpZmllZCB0aGF0IGFkZGVkTG9jYWxzIGFsbCBoYXZlIGRpZmZlcmVudCBuYW1lcy5cblx0cGx1c0xvY2FscyA9IChhZGRlZExvY2FscywgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgc2hhZG93ZWRMb2NhbHMgPSBbXVxuXHRcdGZvciAoY29uc3QgXyBvZiBhZGRlZExvY2Fscykge1xuXHRcdFx0Y29uc3Qgc2hhZG93ZWQgPSBsb2NhbHMuZ2V0KF8ubmFtZSlcblx0XHRcdGlmIChzaGFkb3dlZCAhPT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRzaGFkb3dlZExvY2Fscy5wdXNoKHNoYWRvd2VkKVxuXHRcdFx0c2V0TG9jYWwoXylcblx0XHR9XG5cblx0XHRhY3Rpb24oKVxuXG5cdFx0YWRkZWRMb2NhbHMuZm9yRWFjaChkZWxldGVMb2NhbClcblx0XHRzaGFkb3dlZExvY2Fscy5mb3JFYWNoKHNldExvY2FsKVxuXHR9LFxuXG5cdHZlcmlmeUFuZFBsdXNMb2NhbCA9IChhZGRlZExvY2FsLCBhY3Rpb24pID0+IHtcblx0XHR2ZXJpZnlMb2NhbERlY2xhcmUoYWRkZWRMb2NhbClcblx0XHRwbHVzTG9jYWwoYWRkZWRMb2NhbCwgYWN0aW9uKVxuXHR9LFxuXG5cdHZlcmlmeUFuZFBsdXNMb2NhbHMgPSAoYWRkZWRMb2NhbHMsIGFjdGlvbikgPT4ge1xuXHRcdGFkZGVkTG9jYWxzLmZvckVhY2godmVyaWZ5TG9jYWxEZWNsYXJlKVxuXHRcdGNvbnN0IG5hbWVzID0gbmV3IFNldCgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIGFkZGVkTG9jYWxzKSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKCFuYW1lcy5oYXMoXy5uYW1lKSwgXy5sb2MsICgpID0+XG5cdFx0XHRcdGBEdXBsaWNhdGUgbG9jYWwgJHtjb2RlKF8ubmFtZSl9YClcblx0XHRcdG5hbWVzLmFkZChfLm5hbWUpXG5cdFx0fVxuXHRcdHBsdXNMb2NhbHMoYWRkZWRMb2NhbHMsIGFjdGlvbilcblx0fSxcblxuXHR3aXRoQmxvY2tMb2NhbHMgPSBhY3Rpb24gPT4ge1xuXHRcdGNvbnN0IG9sZFBlbmRpbmdCbG9ja0xvY2FscyA9IHBlbmRpbmdCbG9ja0xvY2Fsc1xuXHRcdHBlbmRpbmdCbG9ja0xvY2FscyA9IFtdXG5cdFx0cGx1c0xvY2FscyhvbGRQZW5kaW5nQmxvY2tMb2NhbHMsIGFjdGlvbilcblx0XHRwZW5kaW5nQmxvY2tMb2NhbHMgPSBvbGRQZW5kaW5nQmxvY2tMb2NhbHNcblx0fVxuXG5jb25zdCB2ZXJpZnlMb2NhbFVzZSA9ICgpID0+XG5cdHJlc3VsdHMubG9jYWxEZWNsYXJlVG9JbmZvLmZvckVhY2goKGluZm8sIGxvY2FsKSA9PiB7XG5cdFx0aWYgKCEobG9jYWwgaW5zdGFuY2VvZiBMb2NhbERlY2xhcmVCdWlsdCB8fCBsb2NhbCBpbnN0YW5jZW9mIExvY2FsRGVjbGFyZVJlcykpIHtcblx0XHRcdGNvbnN0IG5vTm9uRGVidWcgPSBpc0VtcHR5KGluZm8ubm9uRGVidWdBY2Nlc3Nlcylcblx0XHRcdGlmIChub05vbkRlYnVnICYmIGlzRW1wdHkoaW5mby5kZWJ1Z0FjY2Vzc2VzKSlcblx0XHRcdFx0Y29udGV4dC53YXJuSWYoIW9rVG9Ob3RVc2UuaGFzKGxvY2FsKSwgbG9jYWwubG9jLCAoKSA9PlxuXHRcdFx0XHRcdGBVbnVzZWQgbG9jYWwgdmFyaWFibGUgJHtjb2RlKGxvY2FsLm5hbWUpfS5gKVxuXHRcdFx0ZWxzZSBpZiAoaW5mby5pc0luRGVidWcpXG5cdFx0XHRcdGNvbnRleHQud2FybklmKCFub05vbkRlYnVnLCAoKSA9PiBoZWFkKGluZm8ubm9uRGVidWdBY2Nlc3NlcykubG9jLCAoKSA9PlxuXHRcdFx0XHRcdGBEZWJ1Zy1vbmx5IGxvY2FsICR7Y29kZShsb2NhbC5uYW1lKX0gdXNlZCBvdXRzaWRlIG9mIGRlYnVnLmApXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGNvbnRleHQud2FybklmKG5vTm9uRGVidWcsIGxvY2FsLmxvYywgKCkgPT5cblx0XHRcdFx0XHRgTG9jYWwgJHtjb2RlKGxvY2FsLm5hbWUpfSB1c2VkIG9ubHkgaW4gZGVidWcuYClcblx0XHR9XG5cdH0pXG5cblxuaW1wbGVtZW50TWFueShNc0FzdFR5cGVzLCAndmVyaWZ5Jywge1xuXHRBc3NlcnQoKSB7XG5cdFx0dGhpcy5jb25kaXRpb24udmVyaWZ5KClcblx0XHR2ZXJpZnlPcEVhY2godGhpcy5vcFRocm93bilcblx0fSxcblxuXHRBc3NpZ25TaW5nbGUoKSB7XG5cdFx0d2l0aE5hbWUodGhpcy5hc3NpZ25lZS5uYW1lLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBkb1YgPSAoKSA9PiB7XG5cdFx0XHRcdC8qXG5cdFx0XHRcdEZ1biBhbmQgQ2xhc3Mgb25seSBnZXQgbmFtZSBpZiB0aGV5IGFyZSBpbW1lZGlhdGVseSBhZnRlciB0aGUgYXNzaWdubWVudC5cblx0XHRcdFx0c28gaW4gYHggPSAkYWZ0ZXItdGltZSAxMDAwIHxgIHRoZSBmdW5jdGlvbiBpcyBub3QgbmFtZWQuXG5cdFx0XHRcdCovXG5cdFx0XHRcdGlmICh0aGlzLnZhbHVlIGluc3RhbmNlb2YgQ2xhc3MgfHwgdGhpcy52YWx1ZSBpbnN0YW5jZW9mIEZ1bilcblx0XHRcdFx0XHRzZXROYW1lKHRoaXMudmFsdWUpXG5cblx0XHRcdFx0Ly8gQXNzaWduZWUgcmVnaXN0ZXJlZCBieSB2ZXJpZnlMaW5lcy5cblx0XHRcdFx0dGhpcy5hc3NpZ25lZS52ZXJpZnkoKVxuXHRcdFx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy5hc3NpZ25lZS5pc0xhenkoKSlcblx0XHRcdFx0d2l0aEJsb2NrTG9jYWxzKGRvVilcblx0XHRcdGVsc2Vcblx0XHRcdFx0ZG9WKClcblx0XHR9KVxuXHR9LFxuXG5cdEFzc2lnbkRlc3RydWN0dXJlKCkge1xuXHRcdC8vIEFzc2lnbmVlcyByZWdpc3RlcmVkIGJ5IHZlcmlmeUxpbmVzLlxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFzc2lnbmVlcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0QmFnRW50cnk6IHZlcmlmeUJhZ0VudHJ5LFxuXHRCYWdFbnRyeU1hbnk6IHZlcmlmeUJhZ0VudHJ5LFxuXG5cdEJhZ1NpbXBsZSgpIHtcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5wYXJ0cylcblx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHRCbG9ja0RvKCkge1xuXHRcdHZlcmlmeUxpbmVzKHRoaXMubGluZXMpXG5cdH0sXG5cblx0QmxvY2tWYWxUaHJvdygpIHtcblx0XHRjb25zdCBuZXdMb2NhbHMgPSB2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHRcdHBsdXNMb2NhbHMobmV3TG9jYWxzLCAoKSA9PiB0aGlzLnRocm93LnZlcmlmeSgpKVxuXHR9LFxuXG5cdEJsb2NrV2l0aFJldHVybigpIHtcblx0XHRjb25zdCBuZXdMb2NhbHMgPSB2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHRcdHBsdXNMb2NhbHMobmV3TG9jYWxzLCAoKSA9PiB0aGlzLnJldHVybmVkLnZlcmlmeSgpKVxuXHR9LFxuXG5cdEJsb2NrT2JqKCkge1xuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmJ1aWx0LCAoKSA9PiB7XG5cdFx0XHRjb25zdCBuZXdMb2NhbHMgPSB2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHRcdFx0b3BFYWNoKHRoaXMub3BPYmplZCwgXyA9PiBwbHVzTG9jYWxzKG5ld0xvY2FscywgKCkgPT4gXy52ZXJpZnkoKSkpXG5cdFx0fSlcblx0fSxcblxuXHRCbG9ja0JhZzogdmVyaWZ5QmxvY2tCYWdPck1hcCxcblx0QmxvY2tNYXA6IHZlcmlmeUJsb2NrQmFnT3JNYXAsXG5cblx0QmxvY2tXcmFwKCkge1xuXHRcdHdpdGhJSUZFKCgpID0+IHRoaXMuYmxvY2sudmVyaWZ5KCkpXG5cdH0sXG5cblx0QnJlYWsoKSB7XG5cdFx0dmVyaWZ5SW5Mb29wKHRoaXMpXG5cdFx0Y29udGV4dC5jaGVjayghKG9wTG9vcCBpbnN0YW5jZW9mIEZvclZhbCksIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0YCR7Y29kZSgnZm9yJyl9IG11c3QgYnJlYWsgd2l0aCBhIHZhbHVlLmApXG5cdH0sXG5cblx0QnJlYWtXaXRoVmFsKCkge1xuXHRcdHZlcmlmeUluTG9vcCh0aGlzKVxuXHRcdGNvbnRleHQuY2hlY2sob3BMb29wIGluc3RhbmNlb2YgRm9yVmFsLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdGAke2NvZGUoJ2JyZWFrJyl9IG9ubHkgdmFsaWQgaW5zaWRlICR7Y29kZSgnZm9yJyl9YClcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0Q2FsbCgpIHtcblx0XHR0aGlzLmNhbGxlZC52ZXJpZnkoKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0Q2FzZURvKCkge1xuXHRcdHZlcmlmeUNhc2UodGhpcylcblx0fSxcblx0Q2FzZURvUGFydDogdmVyaWZ5Q2FzZVBhcnQsXG5cdENhc2VWYWwoKSB7XG5cdFx0d2l0aElJRkUoKCkgPT4gdmVyaWZ5Q2FzZSh0aGlzKSlcblx0fSxcblx0Q2FzZVZhbFBhcnQ6IHZlcmlmeUNhc2VQYXJ0LFxuXG5cdENhdGNoKCkge1xuXHRcdGNvbnRleHQuY2hlY2sodGhpcy5jYXVnaHQub3BUeXBlID09PSBudWxsLCB0aGlzLmNhdWdodC5sb2MsICdUT0RPOiBDYXVnaHQgdHlwZXMnKVxuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmNhdWdodCwgKCkgPT4gdGhpcy5ibG9jay52ZXJpZnkoKSlcblx0fSxcblxuXHRDbGFzcygpIHtcblx0XHR2ZXJpZnlPcEVhY2godGhpcy5vcFN1cGVyQ2xhc3MpXG5cdFx0dmVyaWZ5T3BFYWNoKHRoaXMub3BEbylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5zdGF0aWNzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdGlmICh0aGlzLm9wQ29uc3RydWN0b3IgIT09IG51bGwpXG5cdFx0XHR0aGlzLm9wQ29uc3RydWN0b3IudmVyaWZ5KHRoaXMub3BTdXBlckNsYXNzICE9PSBudWxsKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLm1ldGhvZHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0Ly8gbmFtZSBzZXQgYnkgQXNzaWduU2luZ2xlXG5cdH0sXG5cblx0Q2xhc3NEbygpIHtcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5kZWNsYXJlRm9jdXMsICgpID0+IHRoaXMuYmxvY2sudmVyaWZ5KCkpXG5cdH0sXG5cblx0Q29uZCgpIHtcblx0XHR0aGlzLnRlc3QudmVyaWZ5KClcblx0XHR0aGlzLmlmVHJ1ZS52ZXJpZnkoKVxuXHRcdHRoaXMuaWZGYWxzZS52ZXJpZnkoKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsRG8oKSB7XG5cdFx0dGhpcy50ZXN0LnZlcmlmeSgpXG5cdFx0dGhpcy5yZXN1bHQudmVyaWZ5KClcblx0fSxcblx0Q29uZGl0aW9uYWxWYWwoKSB7XG5cdFx0dGhpcy50ZXN0LnZlcmlmeSgpXG5cdFx0d2l0aElJRkUoKCkgPT4gdGhpcy5yZXN1bHQudmVyaWZ5KCkpXG5cdH0sXG5cblx0Q29uc3RydWN0b3IoY2xhc3NIYXNTdXBlcikge1xuXHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZnVuLm9wRGVjbGFyZVRoaXMpXG5cdFx0d2l0aE1ldGhvZCh0aGlzLCAoKSA9PiB7IHRoaXMuZnVuLnZlcmlmeSgpIH0pXG5cblx0XHRjb25zdCBzdXBlckNhbGwgPSByZXN1bHRzLmNvbnN0cnVjdG9yVG9TdXBlci5nZXQodGhpcylcblxuXHRcdGlmIChjbGFzc0hhc1N1cGVyKVxuXHRcdFx0Y29udGV4dC5jaGVjayhzdXBlckNhbGwgIT09IHVuZGVmaW5lZCwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRcdGBDb25zdHJ1Y3RvciBtdXN0IGNvbnRhaW4gJHtjb2RlKCdzdXBlciEnKX1gKVxuXHRcdGVsc2Vcblx0XHRcdGNvbnRleHQuY2hlY2soc3VwZXJDYWxsID09PSB1bmRlZmluZWQsICgpID0+IHN1cGVyQ2FsbC5sb2MsICgpID0+XG5cdFx0XHRcdGBDbGFzcyBoYXMgbm8gc3VwZXJjbGFzcywgc28gJHtjb2RlKCdzdXBlciEnKX0gaXMgbm90IGFsbG93ZWQuYClcblxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLm1lbWJlckFyZ3MpXG5cdFx0XHRzZXRMb2NhbERlY2xhcmVBY2Nlc3NlZChfLCB0aGlzKVxuXHR9LFxuXG5cdC8vIE9ubHkgcmVhY2ggaGVyZSBmb3IgaW4vb3V0IGNvbmRpdGlvbi5cblx0RGVidWcoKSB7XG5cdFx0dmVyaWZ5TGluZXMoW3RoaXNdKVxuXHR9LFxuXG5cdEV4Y2VwdERvOiB2ZXJpZnlFeGNlcHQsXG5cdEV4Y2VwdFZhbDogdmVyaWZ5RXhjZXB0LFxuXG5cdEZvckJhZygpIHtcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5idWlsdCwgKCkgPT4gdmVyaWZ5Rm9yKHRoaXMpKVxuXHR9LFxuXG5cdEZvckRvKCkge1xuXHRcdHZlcmlmeUZvcih0aGlzKVxuXHR9LFxuXG5cdEZvclZhbCgpIHtcblx0XHR2ZXJpZnlGb3IodGhpcylcblx0fSxcblxuXHRGdW4oKSB7XG5cdFx0d2l0aEJsb2NrTG9jYWxzKCgpID0+IHtcblx0XHRcdGNvbnRleHQuY2hlY2sodGhpcy5vcERlY2xhcmVSZXMgPT09IG51bGwgfHwgdGhpcy5ibG9jayBpbnN0YW5jZW9mIEJsb2NrVmFsLCB0aGlzLmxvYyxcblx0XHRcdFx0J0Z1bmN0aW9uIHdpdGggcmV0dXJuIGNvbmRpdGlvbiBtdXN0IHJldHVybiBzb21ldGhpbmcuJylcblx0XHRcdHdpdGhJbkdlbmVyYXRvcih0aGlzLmlzR2VuZXJhdG9yLCAoKSA9PlxuXHRcdFx0XHR3aXRoTG9vcChudWxsLCAoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgYWxsQXJncyA9IGNhdCh0aGlzLm9wRGVjbGFyZVRoaXMsIHRoaXMuYXJncywgdGhpcy5vcFJlc3RBcmcpXG5cdFx0XHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FscyhhbGxBcmdzLCAoKSA9PiB7XG5cdFx0XHRcdFx0XHR2ZXJpZnlPcEVhY2godGhpcy5vcEluKVxuXHRcdFx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoKVxuXHRcdFx0XHRcdFx0b3BFYWNoKHRoaXMub3BEZWNsYXJlUmVzLCB2ZXJpZnlMb2NhbERlY2xhcmUpXG5cdFx0XHRcdFx0XHRjb25zdCB2ZXJpZnlPdXQgPSAoKSA9PiB2ZXJpZnlPcEVhY2godGhpcy5vcE91dClcblx0XHRcdFx0XHRcdGlmRWxzZSh0aGlzLm9wRGVjbGFyZVJlcywgXyA9PiBwbHVzTG9jYWwoXywgdmVyaWZ5T3V0KSwgdmVyaWZ5T3V0KVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH0pKVxuXHRcdH0pXG5cdFx0Ly8gbmFtZSBzZXQgYnkgQXNzaWduU2luZ2xlXG5cdH0sXG5cblx0SWdub3JlKCkge1xuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmlnbm9yZWQpXG5cdFx0XHRhY2Nlc3NMb2NhbCh0aGlzLCBfKVxuXHR9LFxuXG5cdExhenkoKSB7XG5cdFx0d2l0aEJsb2NrTG9jYWxzKCgpID0+IHRoaXMudmFsdWUudmVyaWZ5KCkpXG5cdH0sXG5cblx0TG9jYWxBY2Nlc3MoKSB7XG5cdFx0Y29uc3QgZGVjbGFyZSA9IGxvY2Fscy5nZXQodGhpcy5uYW1lKVxuXHRcdGlmIChkZWNsYXJlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdGNvbnN0IGJ1aWx0aW5QYXRoID0gY29udGV4dC5vcHRzLmJ1aWx0aW5OYW1lVG9QYXRoLmdldCh0aGlzLm5hbWUpXG5cdFx0XHRpZiAoYnVpbHRpblBhdGggPT09IHVuZGVmaW5lZClcblx0XHRcdFx0ZmFpbE1pc3NpbmdMb2NhbCh0aGlzLmxvYywgdGhpcy5uYW1lKVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGNvbnN0IG5hbWVzID0gcmVzdWx0cy5idWlsdGluUGF0aFRvTmFtZXMuZ2V0KGJ1aWx0aW5QYXRoKVxuXHRcdFx0XHRpZiAobmFtZXMgPT09IHVuZGVmaW5lZClcblx0XHRcdFx0XHRyZXN1bHRzLmJ1aWx0aW5QYXRoVG9OYW1lcy5zZXQoYnVpbHRpblBhdGgsIG5ldyBTZXQoW3RoaXMubmFtZV0pKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0bmFtZXMuYWRkKHRoaXMubmFtZSlcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzdWx0cy5sb2NhbEFjY2Vzc1RvRGVjbGFyZS5zZXQodGhpcywgZGVjbGFyZSlcblx0XHRcdHNldExvY2FsRGVjbGFyZUFjY2Vzc2VkKGRlY2xhcmUsIHRoaXMpXG5cdFx0fVxuXHR9LFxuXG5cdC8vIEFkZGluZyBMb2NhbERlY2xhcmVzIHRvIHRoZSBhdmFpbGFibGUgbG9jYWxzIGlzIGRvbmUgYnkgRnVuIG9yIGxpbmVOZXdMb2NhbHMuXG5cdExvY2FsRGVjbGFyZSgpIHtcblx0XHRjb25zdCBidWlsdGluUGF0aCA9IGNvbnRleHQub3B0cy5idWlsdGluTmFtZVRvUGF0aC5nZXQodGhpcy5uYW1lKVxuXHRcdGNvbnRleHQud2FybklmKGJ1aWx0aW5QYXRoICE9PSB1bmRlZmluZWQsIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0YExvY2FsICR7Y29kZSh0aGlzLm5hbWUpfSBvdmVycmlkZXMgYnVpbHRpbiBmcm9tICR7Y29kZShidWlsdGluUGF0aCl9LmApXG5cdFx0dmVyaWZ5T3BFYWNoKHRoaXMub3BUeXBlKVxuXHR9LFxuXG5cdExvY2FsTXV0YXRlKCkge1xuXHRcdGNvbnN0IGRlY2xhcmUgPSBnZXRMb2NhbERlY2xhcmUodGhpcy5uYW1lLCB0aGlzLmxvYylcblx0XHRjb250ZXh0LmNoZWNrKGRlY2xhcmUuaXNNdXRhYmxlKCksIHRoaXMubG9jLCAoKSA9PiBgJHtjb2RlKHRoaXMubmFtZSl9IGlzIG5vdCBtdXRhYmxlLmApXG5cdFx0Ly8gVE9ETzogVHJhY2sgbXV0YXRpb25zLiBNdXRhYmxlIGxvY2FsIG11c3QgYmUgbXV0YXRlZCBzb21ld2hlcmUuXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdExvZ2ljKCkge1xuXHRcdGNvbnRleHQuY2hlY2sodGhpcy5hcmdzLmxlbmd0aCA+IDEsICdMb2dpYyBleHByZXNzaW9uIG5lZWRzIGF0IGxlYXN0IDIgYXJndW1lbnRzLicpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHROb3QoKSB7XG5cdFx0dGhpcy5hcmcudmVyaWZ5KClcblx0fSxcblxuXHROdW1iZXJMaXRlcmFsKCkgeyB9LFxuXG5cdE1hcEVudHJ5KCkge1xuXHRcdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdFx0dGhpcy5rZXkudmVyaWZ5KClcblx0XHR0aGlzLnZhbC52ZXJpZnkoKVxuXHR9LFxuXG5cdE1lbWJlcigpIHtcblx0XHR0aGlzLm9iamVjdC52ZXJpZnkoKVxuXHR9LFxuXG5cdE1lbWJlclNldCgpIHtcblx0XHR0aGlzLm9iamVjdC52ZXJpZnkoKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0fSxcblxuXHRNZXRob2RJbXBsKCkge1xuXHRcdHZlcmlmeU1ldGhvZCh0aGlzLCAoKSA9PiB7XG5cdFx0XHRva1RvTm90VXNlLmFkZCh0aGlzLmZ1bi5vcERlY2xhcmVUaGlzKVxuXHRcdFx0dGhpcy5mdW4udmVyaWZ5KClcblx0XHR9KVxuXHR9LFxuXHRNZXRob2RHZXR0ZXIoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kKHRoaXMsICgpID0+IHtcblx0XHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZGVjbGFyZVRoaXMpXG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKFt0aGlzLmRlY2xhcmVUaGlzXSwgKCkgPT4geyB0aGlzLmJsb2NrLnZlcmlmeSgpIH0pXG5cdFx0fSlcblx0fSxcblx0TWV0aG9kU2V0dGVyKCkge1xuXHRcdHZlcmlmeU1ldGhvZCh0aGlzLCAoKSA9PiB7XG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKFt0aGlzLmRlY2xhcmVUaGlzLCB0aGlzLmRlY2xhcmVGb2N1c10sICgpID0+IHtcblx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoKVxuXHRcdFx0fSlcblx0XHR9KVxuXHR9LFxuXG5cdE1vZHVsZSgpIHtcblx0XHQvLyBObyBuZWVkIHRvIHZlcmlmeSB0aGlzLmRvSW1wb3J0cy5cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5pbXBvcnRzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdHZlcmlmeU9wRWFjaCh0aGlzLm9wSW1wb3J0R2xvYmFsKVxuXHRcdHdpdGhJbkRlYnVnKCgpID0+IHtcblx0XHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmRlYnVnSW1wb3J0cylcblx0XHRcdFx0Xy52ZXJpZnkoKVxuXHRcdH0pXG5cblx0XHR3aXRoTmFtZShjb250ZXh0Lm9wdHMubW9kdWxlTmFtZSgpLCAoKSA9PiB7XG5cdFx0XHR2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHRcdH0pXG5cdH0sXG5cblx0TW9kdWxlRXhwb3J0KCkge1xuXHRcdHRoaXMuYXNzaWduLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXNzaWduLmFsbEFzc2lnbmVlcygpKVxuXHRcdFx0YWNjZXNzTG9jYWxGb3JSZXR1cm4odGhpcywgXylcblx0fSxcblxuXHROZXcoKSB7XG5cdFx0dGhpcy50eXBlLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHRPYmpFbnRyeUFzc2lnbigpIHtcblx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHRoaXMuYXNzaWduLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXNzaWduLmFsbEFzc2lnbmVlcygpKVxuXHRcdFx0YWNjZXNzTG9jYWxGb3JSZXR1cm4odGhpcywgXylcblx0fSxcblxuXHRPYmpFbnRyeUNvbXB1dGVkKCkge1xuXHRcdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdFx0dGhpcy5rZXkudmVyaWZ5KClcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0T2JqU2ltcGxlKCkge1xuXHRcdGNvbnN0IGtleXMgPSBuZXcgU2V0KClcblx0XHRmb3IgKGNvbnN0IHBhaXIgb2YgdGhpcy5wYWlycykge1xuXHRcdFx0Y29uc3Qge2tleSwgdmFsdWV9ID0gcGFpclxuXHRcdFx0Y29udGV4dC5jaGVjaygha2V5cy5oYXMoa2V5KSwgcGFpci5sb2MsICgpID0+IGBEdXBsaWNhdGUga2V5ICR7a2V5fWApXG5cdFx0XHRrZXlzLmFkZChrZXkpXG5cdFx0XHR2YWx1ZS52ZXJpZnkoKVxuXHRcdH1cblx0fSxcblxuXHRRdW90ZSgpIHtcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5wYXJ0cylcblx0XHRcdGlmICh0eXBlb2YgXyAhPT0gJ3N0cmluZycpXG5cdFx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHRRdW90ZVRlbXBsYXRlKCkge1xuXHRcdHRoaXMudGFnLnZlcmlmeSgpXG5cdFx0dGhpcy5xdW90ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdFNwZWNpYWxEbygpIHsgfSxcblxuXHRTcGVjaWFsVmFsKCkge1xuXHRcdHNldE5hbWUodGhpcylcblx0fSxcblxuXHRTcGxhdCgpIHtcblx0XHR0aGlzLnNwbGF0dGVkLnZlcmlmeSgpXG5cdH0sXG5cblx0U3VwZXJDYWxsOiB2ZXJpZnlTdXBlckNhbGwsXG5cdFN1cGVyQ2FsbERvOiB2ZXJpZnlTdXBlckNhbGwsXG5cdFN1cGVyTWVtYmVyKCkge1xuXHRcdGNvbnRleHQuY2hlY2sobWV0aG9kICE9PSBudWxsLCB0aGlzLmxvYywgJ011c3QgYmUgaW4gbWV0aG9kLicpXG5cdH0sXG5cblx0U3dpdGNoRG8oKSB7XG5cdFx0dmVyaWZ5U3dpdGNoKHRoaXMpXG5cdH0sXG5cdFN3aXRjaERvUGFydDogdmVyaWZ5U3dpdGNoUGFydCxcblx0U3dpdGNoVmFsKCkge1xuXHRcdHdpdGhJSUZFKCgpID0+IHZlcmlmeVN3aXRjaCh0aGlzKSlcblx0fSxcblx0U3dpdGNoVmFsUGFydDogdmVyaWZ5U3dpdGNoUGFydCxcblxuXHRUaHJvdygpIHtcblx0XHR2ZXJpZnlPcEVhY2godGhpcy5vcFRocm93bilcblx0fSxcblxuXHRJbXBvcnQ6IHZlcmlmeUltcG9ydCxcblx0SW1wb3J0R2xvYmFsOiB2ZXJpZnlJbXBvcnQsXG5cblx0V2l0aCgpIHtcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdFx0d2l0aElJRkUoKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuZGVjbGFyZSBpbnN0YW5jZW9mIExvY2FsRGVjbGFyZUZvY3VzKVxuXHRcdFx0XHRva1RvTm90VXNlLmFkZCh0aGlzLmRlY2xhcmUpXG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5kZWNsYXJlLCAoKSA9PiB7IHRoaXMuYmxvY2sudmVyaWZ5KCkgfSlcblx0XHR9KVxuXHR9LFxuXG5cdFlpZWxkKCkge1xuXHRcdGNvbnRleHQuY2hlY2soaXNJbkdlbmVyYXRvciwgdGhpcy5sb2MsICdDYW5ub3QgeWllbGQgb3V0c2lkZSBvZiBnZW5lcmF0b3IgY29udGV4dCcpXG5cdFx0dmVyaWZ5T3BFYWNoKHRoaXMub3BZaWVsZGVkKVxuXHR9LFxuXG5cdFlpZWxkVG8oKSB7XG5cdFx0Y29udGV4dC5jaGVjayhpc0luR2VuZXJhdG9yLCB0aGlzLmxvYywgJ0Nhbm5vdCB5aWVsZCBvdXRzaWRlIG9mIGdlbmVyYXRvciBjb250ZXh0Jylcblx0XHR0aGlzLnlpZWxkZWRUby52ZXJpZnkoKVxuXHR9XG59KVxuXG5mdW5jdGlvbiB2ZXJpZnlCYWdFbnRyeSgpIHtcblx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0dGhpcy52YWx1ZS52ZXJpZnkoKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlCbG9ja0JhZ09yTWFwKCkge1xuXHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5idWlsdCwgKCkgPT4ge1xuXHRcdHZlcmlmeUxpbmVzKHRoaXMubGluZXMpXG5cdH0pXG59XG5cbmZ1bmN0aW9uIHZlcmlmeUNhc2VQYXJ0KCkge1xuXHRpZiAodGhpcy50ZXN0IGluc3RhbmNlb2YgUGF0dGVybikge1xuXHRcdHRoaXMudGVzdC50eXBlLnZlcmlmeSgpXG5cdFx0dGhpcy50ZXN0LnBhdHRlcm5lZC52ZXJpZnkoKVxuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbHModGhpcy50ZXN0LmxvY2FscywgKCkgPT4gdGhpcy5yZXN1bHQudmVyaWZ5KCkpXG5cdH0gZWxzZSB7XG5cdFx0dGhpcy50ZXN0LnZlcmlmeSgpXG5cdFx0dGhpcy5yZXN1bHQudmVyaWZ5KClcblx0fVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlTd2l0Y2hQYXJ0KCkge1xuXHRmb3IgKGNvbnN0IF8gb2YgdGhpcy52YWx1ZXMpXG5cdFx0Xy52ZXJpZnkoKVxuXHR0aGlzLnJlc3VsdC52ZXJpZnkoKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlFeGNlcHQoKSB7XG5cdHRoaXMuX3RyeS52ZXJpZnkoKVxuXHR2ZXJpZnlPcEVhY2godGhpcy5fY2F0Y2gpXG5cdHZlcmlmeU9wRWFjaCh0aGlzLl9maW5hbGx5KVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlTdXBlckNhbGwoKSB7XG5cdGNvbnRleHQuY2hlY2sobWV0aG9kICE9PSBudWxsLCB0aGlzLmxvYywgJ011c3QgYmUgaW4gYSBtZXRob2QuJylcblx0cmVzdWx0cy5zdXBlckNhbGxUb01ldGhvZC5zZXQodGhpcywgbWV0aG9kKVxuXG5cdGlmIChtZXRob2QgaW5zdGFuY2VvZiBDb25zdHJ1Y3Rvcikge1xuXHRcdGNvbnRleHQuY2hlY2sodGhpcyBpbnN0YW5jZW9mIFN1cGVyQ2FsbERvLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdGAke2NvZGUoJ3N1cGVyJyl9IG5vdCBzdXBwb3J0ZWQgaW4gY29uc3RydWN0b3I7IHVzZSAke2NvZGUoJ3N1cGVyIScpfWApXG5cdFx0cmVzdWx0cy5jb25zdHJ1Y3RvclRvU3VwZXIuc2V0KG1ldGhvZCwgdGhpcylcblx0fVxuXG5cdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0Xy52ZXJpZnkoKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlJbXBvcnQoKSB7XG5cdC8vIFNpbmNlIFVzZXMgYXJlIGFsd2F5cyBpbiB0aGUgb3V0ZXJtb3N0IHNjb3BlLCBkb24ndCBoYXZlIHRvIHdvcnJ5IGFib3V0IHNoYWRvd2luZy5cblx0Ly8gU28gd2UgbXV0YXRlIGBsb2NhbHNgIGRpcmVjdGx5LlxuXHRjb25zdCBhZGRVc2VMb2NhbCA9IF8gPT4ge1xuXHRcdGNvbnN0IHByZXYgPSBsb2NhbHMuZ2V0KF8ubmFtZSlcblx0XHRjb250ZXh0LmNoZWNrKHByZXYgPT09IHVuZGVmaW5lZCwgXy5sb2MsICgpID0+XG5cdFx0XHRgJHtjb2RlKF8ubmFtZSl9IGFscmVhZHkgaW1wb3J0ZWQgYXQgJHtwcmV2LmxvY31gKVxuXHRcdHZlcmlmeUxvY2FsRGVjbGFyZShfKVxuXHRcdHNldExvY2FsKF8pXG5cdH1cblx0Zm9yIChjb25zdCBfIG9mIHRoaXMuaW1wb3J0ZWQpXG5cdFx0YWRkVXNlTG9jYWwoXylcblx0b3BFYWNoKHRoaXMub3BJbXBvcnREZWZhdWx0LCBhZGRVc2VMb2NhbClcbn1cblxuLy8gSGVscGVycyBzcGVjaWZpYyB0byBjZXJ0YWluIE1zQXN0IHR5cGVzOlxuY29uc3Rcblx0dmVyaWZ5Rm9yID0gZm9yTG9vcCA9PiB7XG5cdFx0Y29uc3QgdmVyaWZ5QmxvY2sgPSAoKSA9PiB3aXRoTG9vcChmb3JMb29wLCAoKSA9PiBmb3JMb29wLmJsb2NrLnZlcmlmeSgpKVxuXHRcdGlmRWxzZShmb3JMb29wLm9wSXRlcmF0ZWUsXG5cdFx0XHQoe2VsZW1lbnQsIGJhZ30pID0+IHtcblx0XHRcdFx0YmFnLnZlcmlmeSgpXG5cdFx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbChlbGVtZW50LCB2ZXJpZnlCbG9jaylcblx0XHRcdH0sXG5cdFx0XHR2ZXJpZnlCbG9jaylcblx0fSxcblxuXHR2ZXJpZnlJbkxvb3AgPSBsb29wVXNlciA9PlxuXHRcdGNvbnRleHQuY2hlY2sob3BMb29wICE9PSBudWxsLCBsb29wVXNlci5sb2MsICdOb3QgaW4gYSBsb29wLicpLFxuXG5cblx0dmVyaWZ5Q2FzZSA9IF8gPT4ge1xuXHRcdGNvbnN0IGRvSXQgPSAoKSA9PiB7XG5cdFx0XHRmb3IgKGNvbnN0IHBhcnQgb2YgXy5wYXJ0cylcblx0XHRcdFx0cGFydC52ZXJpZnkoKVxuXHRcdFx0dmVyaWZ5T3BFYWNoKF8ub3BFbHNlKVxuXHRcdH1cblx0XHRpZkVsc2UoXy5vcENhc2VkLFxuXHRcdFx0XyA9PiB7XG5cdFx0XHRcdF8udmVyaWZ5KClcblx0XHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKF8uYXNzaWduZWUsIGRvSXQpXG5cdFx0XHR9LFxuXHRcdFx0ZG9JdClcblx0fSxcblxuXHR2ZXJpZnlNZXRob2QgPSAoXywgZG9WZXJpZnkpID0+IHtcblx0XHRpZiAodHlwZW9mIF8uc3ltYm9sICE9PSAnc3RyaW5nJylcblx0XHRcdF8uc3ltYm9sLnZlcmlmeSgpXG5cdFx0d2l0aE1ldGhvZChfLCBkb1ZlcmlmeSlcblx0fSxcblxuXHR2ZXJpZnlTd2l0Y2ggPSBfID0+IHtcblx0XHRfLnN3aXRjaGVkLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBwYXJ0IG9mIF8ucGFydHMpXG5cdFx0XHRwYXJ0LnZlcmlmeSgpXG5cdFx0dmVyaWZ5T3BFYWNoKF8ub3BFbHNlKVxuXHR9XG5cbi8vIEdlbmVyYWwgdXRpbGl0aWVzOlxuY29uc3Rcblx0Z2V0TG9jYWxEZWNsYXJlID0gKG5hbWUsIGFjY2Vzc0xvYykgPT4ge1xuXHRcdGNvbnN0IGRlY2xhcmUgPSBsb2NhbHMuZ2V0KG5hbWUpXG5cdFx0aWYgKGRlY2xhcmUgPT09IHVuZGVmaW5lZClcblx0XHRcdGZhaWxNaXNzaW5nTG9jYWwoYWNjZXNzTG9jLCBuYW1lKVxuXHRcdHJldHVybiBkZWNsYXJlXG5cdH0sXG5cblx0ZmFpbE1pc3NpbmdMb2NhbCA9IChsb2MsIG5hbWUpID0+IHtcblx0XHRjb250ZXh0LmZhaWwobG9jLCAoKSA9PiB7XG5cdFx0XHQvLyBUT0RPOkVTNiBgQXJyYXkuZnJvbShsb2NhbHMua2V5cygpKWAgc2hvdWxkIHdvcmtcblx0XHRcdGNvbnN0IGtleXMgPSBbXVxuXHRcdFx0Zm9yIChjb25zdCBrZXkgb2YgbG9jYWxzLmtleXMoKSlcblx0XHRcdFx0a2V5cy5wdXNoKGtleSlcblx0XHRcdGNvbnN0IHNob3dMb2NhbHMgPSBjb2RlKGtleXMuam9pbignICcpKVxuXHRcdFx0cmV0dXJuIGBObyBzdWNoIGxvY2FsICR7Y29kZShuYW1lKX0uXFxuTG9jYWxzIGFyZTpcXG4ke3Nob3dMb2NhbHN9LmBcblx0XHR9KVxuXHR9LFxuXG5cdGxpbmVOZXdMb2NhbHMgPSBsaW5lID0+XG5cdFx0bGluZSBpbnN0YW5jZW9mIEFzc2lnblNpbmdsZSA/XG5cdFx0XHRbbGluZS5hc3NpZ25lZV0gOlxuXHRcdFx0bGluZSBpbnN0YW5jZW9mIEFzc2lnbkRlc3RydWN0dXJlID9cblx0XHRcdGxpbmUuYXNzaWduZWVzIDpcblx0XHRcdGxpbmUgaW5zdGFuY2VvZiBPYmpFbnRyeSA/XG5cdFx0XHRsaW5lTmV3TG9jYWxzKGxpbmUuYXNzaWduKSA6XG5cdFx0XHRsaW5lIGluc3RhbmNlb2YgTW9kdWxlRXhwb3J0ID9cblx0XHRcdGxpbmVOZXdMb2NhbHMobGluZS5hc3NpZ24pIDpcblx0XHRcdFtdLFxuXG5cdHZlcmlmeUxpbmVzID0gbGluZXMgPT4ge1xuXHRcdC8qXG5cdFx0V2UgbmVlZCB0byBiZXQgYWxsIGJsb2NrIGxvY2FscyB1cC1mcm9udCBiZWNhdXNlXG5cdFx0RnVuY3Rpb25zIHdpdGhpbiBsaW5lcyBjYW4gYWNjZXNzIGxvY2FscyBmcm9tIGxhdGVyIGxpbmVzLlxuXHRcdE5PVEU6IFdlIHB1c2ggdGhlc2Ugb250byBwZW5kaW5nQmxvY2tMb2NhbHMgaW4gcmV2ZXJzZVxuXHRcdHNvIHRoYXQgd2hlbiB3ZSBpdGVyYXRlIHRocm91Z2ggbGluZXMgZm9yd2FyZHMsIHdlIGNhbiBwb3AgZnJvbSBwZW5kaW5nQmxvY2tMb2NhbHNcblx0XHR0byByZW1vdmUgcGVuZGluZyBsb2NhbHMgYXMgdGhleSBiZWNvbWUgcmVhbCBsb2NhbHMuXG5cdFx0SXQgZG9lc24ndCByZWFsbHkgbWF0dGVyIHdoYXQgb3JkZXIgd2UgYWRkIGxvY2FscyBpbiBzaW5jZSBpdCdzIG5vdCBhbGxvd2VkXG5cdFx0dG8gaGF2ZSB0d28gbG9jYWxzIG9mIHRoZSBzYW1lIG5hbWUgaW4gdGhlIHNhbWUgYmxvY2suXG5cdFx0Ki9cblx0XHRjb25zdCBuZXdMb2NhbHMgPSBbXVxuXG5cdFx0Y29uc3QgZ2V0TGluZUxvY2FscyA9IGxpbmUgPT4ge1xuXHRcdFx0aWYgKGxpbmUgaW5zdGFuY2VvZiBEZWJ1Zylcblx0XHRcdFx0d2l0aEluRGVidWcoKCkgPT4ge1xuXHRcdFx0XHRcdGZvciAoY29uc3QgXyBvZiByZXZlcnNlSXRlcihsaW5lLmxpbmVzKSlcblx0XHRcdFx0XHRcdGdldExpbmVMb2NhbHMoXylcblx0XHRcdFx0fSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIHJldmVyc2VJdGVyKGxpbmVOZXdMb2NhbHMobGluZSkpKSB7XG5cdFx0XHRcdFx0Ly8gUmVnaXN0ZXIgdGhlIGxvY2FsIG5vdy4gQ2FuJ3Qgd2FpdCB1bnRpbCB0aGUgYXNzaWduIGlzIHZlcmlmaWVkLlxuXHRcdFx0XHRcdHJlZ2lzdGVyTG9jYWwoXylcblx0XHRcdFx0XHRuZXdMb2NhbHMucHVzaChfKVxuXHRcdFx0XHR9XG5cdFx0fVxuXHRcdGZvciAoY29uc3QgXyBvZiByZXZlcnNlSXRlcihsaW5lcykpXG5cdFx0XHRnZXRMaW5lTG9jYWxzKF8pXG5cdFx0cGVuZGluZ0Jsb2NrTG9jYWxzLnB1c2goLi4ubmV3TG9jYWxzKVxuXG5cdFx0Lypcblx0XHRLZWVwcyB0cmFjayBvZiBsb2NhbHMgd2hpY2ggaGF2ZSBhbHJlYWR5IGJlZW4gYWRkZWQgaW4gdGhpcyBibG9jay5cblx0XHRNYXNvbiBhbGxvd3Mgc2hhZG93aW5nLCBidXQgbm90IHdpdGhpbiB0aGUgc2FtZSBibG9jay5cblx0XHRTbywgdGhpcyBpcyBhbGxvd2VkOlxuXHRcdFx0YSA9IDFcblx0XHRcdGIgPVxuXHRcdFx0XHRhID0gMlxuXHRcdFx0XHQuLi5cblx0XHRCdXQgbm90OlxuXHRcdFx0YSA9IDFcblx0XHRcdGEgPSAyXG5cdFx0Ki9cblx0XHRjb25zdCB0aGlzQmxvY2tMb2NhbE5hbWVzID0gbmV3IFNldCgpXG5cblx0XHQvLyBBbGwgc2hhZG93ZWQgbG9jYWxzIGZvciB0aGlzIGJsb2NrLlxuXHRcdGNvbnN0IHNoYWRvd2VkID0gW11cblxuXHRcdGNvbnN0IHZlcmlmeUxpbmUgPSBsaW5lID0+IHtcblx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgRGVidWcpXG5cdFx0XHRcdC8vIFRPRE86IERvIGFueXRoaW5nIGluIHRoaXMgc2l0dWF0aW9uP1xuXHRcdFx0XHQvLyBjb250ZXh0LmNoZWNrKCFpbkRlYnVnLCBsaW5lLmxvYywgJ1JlZHVuZGFudCBgZGVidWdgLicpXG5cdFx0XHRcdHdpdGhJbkRlYnVnKCgpID0+IGxpbmUubGluZXMuZm9yRWFjaCh2ZXJpZnlMaW5lKSlcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR2ZXJpZnlJc1N0YXRlbWVudChsaW5lKVxuXHRcdFx0XHRmb3IgKGNvbnN0IG5ld0xvY2FsIG9mIGxpbmVOZXdMb2NhbHMobGluZSkpIHtcblx0XHRcdFx0XHRjb25zdCBuYW1lID0gbmV3TG9jYWwubmFtZVxuXHRcdFx0XHRcdGNvbnN0IG9sZExvY2FsID0gbG9jYWxzLmdldChuYW1lKVxuXHRcdFx0XHRcdGlmIChvbGRMb2NhbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKCF0aGlzQmxvY2tMb2NhbE5hbWVzLmhhcyhuYW1lKSwgbmV3TG9jYWwubG9jLFxuXHRcdFx0XHRcdFx0XHQoKSA9PiBgQSBsb2NhbCAke2NvZGUobmFtZSl9IGlzIGFscmVhZHkgaW4gdGhpcyBibG9jay5gKVxuXHRcdFx0XHRcdFx0c2hhZG93ZWQucHVzaChvbGRMb2NhbClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpc0Jsb2NrTG9jYWxOYW1lcy5hZGQobmFtZSlcblx0XHRcdFx0XHRzZXRMb2NhbChuZXdMb2NhbClcblxuXHRcdFx0XHRcdC8vIE5vdyB0aGF0IGl0J3MgYWRkZWQgYXMgYSBsb2NhbCwgaXQncyBubyBsb25nZXIgcGVuZGluZy5cblx0XHRcdFx0XHQvLyBXZSBhZGRlZCBwZW5kaW5nQmxvY2tMb2NhbHMgaW4gdGhlIHJpZ2h0IG9yZGVyIHRoYXQgd2UgY2FuIGp1c3QgcG9wIHRoZW0gb2ZmLlxuXHRcdFx0XHRcdGNvbnN0IHBvcHBlZCA9IHBlbmRpbmdCbG9ja0xvY2Fscy5wb3AoKVxuXHRcdFx0XHRcdGFzc2VydChwb3BwZWQgPT09IG5ld0xvY2FsKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGxpbmUudmVyaWZ5KClcblx0XHRcdH1cblx0XHR9XG5cblx0XHRsaW5lcy5mb3JFYWNoKHZlcmlmeUxpbmUpXG5cblx0XHRuZXdMb2NhbHMuZm9yRWFjaChkZWxldGVMb2NhbClcblx0XHRzaGFkb3dlZC5mb3JFYWNoKHNldExvY2FsKVxuXG5cdFx0cmV0dXJuIG5ld0xvY2Fsc1xuXHR9LFxuXG5cdHZlcmlmeUlzU3RhdGVtZW50ID0gbGluZSA9PiB7XG5cdFx0Y29uc3QgaXNTdGF0ZW1lbnQgPVxuXHRcdFx0bGluZSBpbnN0YW5jZW9mIERvIHx8XG5cdFx0XHQvLyBTb21lIHZhbHVlcyBhcmUgYWxzbyBhY2NlcHRhYmxlLlxuXHRcdFx0bGluZSBpbnN0YW5jZW9mIENhbGwgfHxcblx0XHRcdGxpbmUgaW5zdGFuY2VvZiBZaWVsZCB8fFxuXHRcdFx0bGluZSBpbnN0YW5jZW9mIFlpZWxkVG9cblx0XHRjb250ZXh0LmNoZWNrKGlzU3RhdGVtZW50LCBsaW5lLmxvYywgJ0V4cHJlc3Npb24gaW4gc3RhdGVtZW50IHBvc2l0aW9uLicpXG5cdH1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

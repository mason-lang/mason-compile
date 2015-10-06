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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZlcmlmeS5qcyIsInByaXZhdGUvdmVyaWZ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztrQkNXZSxDQUFDLFFBQVEsRUFBRSxLQUFLLEtBQUs7QUFDbkMsU0FBTyxHQUFHLFFBQVEsQ0FBQTtBQUNsQixRQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUNsQixvQkFBa0IsR0FBRyxFQUFFLENBQUE7QUFDdkIsV0FBUyxHQUFHLGFBQWEsR0FBRyxLQUFLLENBQUE7QUFDakMsWUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDdEIsUUFBTSxHQUFHLElBQUksQ0FBQTtBQUNiLFFBQU0sR0FBRyxJQUFJLENBQUE7QUFDYixTQUFPLEdBQUcsNkJBQW1CLENBQUE7O0FBRTdCLE9BQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUNkLGdCQUFjLEVBQUUsQ0FBQTs7QUFFaEIsUUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFBOztBQUVuQixTQUFPLEdBQUcsTUFBTSxHQUFHLFVBQVUsR0FBRyxNQUFNLEdBQUcsa0JBQWtCLEdBQUcsTUFBTSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUE7QUFDckYsU0FBTyxHQUFHLENBQUE7RUFDVjs7O0FBR0QsS0FDQyxPQUFPOztBQUVQLE9BQU07O0FBRU4sV0FBVSxFQUNWLE1BQU07Ozs7Ozs7Ozs7Ozs7OztBQWVOLG1CQUFrQixFQUNsQixTQUFTOztBQUVULGNBQWE7O0FBRWIsT0FBTSxFQUNOLE9BQU87O0FBRVAsS0FBSSxDQUFBOztBQUVMLE9BQ0MsWUFBWSxHQUFHLEVBQUUsSUFBSTtBQUNwQixNQUFJLEVBQUUsS0FBSyxJQUFJLEVBQ2QsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFBO0VBQ1o7T0FFRCxXQUFXLEdBQUcsWUFBWSxJQUN6QixNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7T0FFakMsUUFBUSxHQUFHLFlBQVksSUFDdEIsTUFBTSxDQUFDLEdBQUcs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QzdCLGFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTs7OztBQUlsQixXQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUN2QyxlQXp3QkcsTUFBTSxFQXl3QkYsTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFBO0tBQzNCO0FBQ0QsUUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO0lBQ2I7R0FDRCxDQUFBOztBQUVELE9BQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7O0FBRXpCLFdBQVMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDOUIsVUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTs7QUFFMUIsU0FBTyxTQUFTLENBQUE7RUFDaEI7T0FFRCxpQkFBaUIsR0FBRyxJQUFJLElBQUk7QUFDM0IsUUFBTSxXQUFXLEdBQ2hCLElBQUksbUJBNXhCNkUsRUFBRSxBQTR4QmpFOztBQUVsQixNQUFJLG1CQTl4QjRDLElBQUksQUE4eEJoQyxJQUNwQixJQUFJLG1CQTd4Qk8sS0FBSyxBQTZ4QkssSUFDckIsSUFBSSxtQkE5eEJjLE9BQU8sQUE4eEJGLENBQUE7QUFDeEIsU0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFBO0VBQ3pFLENBQUEiLCJmaWxlIjoicHJpdmF0ZS92ZXJpZnkuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0ICogYXMgTXNBc3RUeXBlcyBmcm9tICcuL01zQXN0J1xuaW1wb3J0IHtBc3NpZ25EZXN0cnVjdHVyZSwgQXNzaWduU2luZ2xlLCBCbG9ja1ZhbCwgQ2FsbCwgQ2xhc3MsIENvbnN0cnVjdG9yLCBEZWJ1ZywgRG8sIEZvclZhbCxcblx0RnVuLCBMb2NhbERlY2xhcmVCdWlsdCwgTG9jYWxEZWNsYXJlRm9jdXMsIExvY2FsRGVjbGFyZVJlcywgTW9kdWxlRXhwb3J0LCBPYmpFbnRyeSwgUGF0dGVybixcblx0U3VwZXJDYWxsRG8sIFlpZWxkLCBZaWVsZFRvfSBmcm9tICcuL01zQXN0J1xuaW1wb3J0IHthc3NlcnQsIGNhdCwgaGVhZCwgaWZFbHNlLCBpbXBsZW1lbnRNYW55LCBpc0VtcHR5LCBvcEVhY2gsIHJldmVyc2VJdGVyfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgVmVyaWZ5UmVzdWx0cywge0xvY2FsSW5mb30gZnJvbSAnLi9WZXJpZnlSZXN1bHRzJ1xuXG4vKlxuVGhlIHZlcmlmaWVyIGdlbmVyYXRlcyBpbmZvcm1hdGlvbiBuZWVkZWQgZHVyaW5nIHRyYW5zcGlsaW5nLCB0aGUgVmVyaWZ5UmVzdWx0cy5cbiovXG5leHBvcnQgZGVmYXVsdCAoX2NvbnRleHQsIG1zQXN0KSA9PiB7XG5cdGNvbnRleHQgPSBfY29udGV4dFxuXHRsb2NhbHMgPSBuZXcgTWFwKClcblx0cGVuZGluZ0Jsb2NrTG9jYWxzID0gW11cblx0aXNJbkRlYnVnID0gaXNJbkdlbmVyYXRvciA9IGZhbHNlXG5cdG9rVG9Ob3RVc2UgPSBuZXcgU2V0KClcblx0b3BMb29wID0gbnVsbFxuXHRtZXRob2QgPSBudWxsXG5cdHJlc3VsdHMgPSBuZXcgVmVyaWZ5UmVzdWx0cygpXG5cblx0bXNBc3QudmVyaWZ5KClcblx0dmVyaWZ5TG9jYWxVc2UoKVxuXG5cdGNvbnN0IHJlcyA9IHJlc3VsdHNcblx0Ly8gUmVsZWFzZSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuXHRjb250ZXh0ID0gbG9jYWxzID0gb2tUb05vdFVzZSA9IG9wTG9vcCA9IHBlbmRpbmdCbG9ja0xvY2FscyA9IG1ldGhvZCA9IHJlc3VsdHMgPSBudWxsXG5cdHJldHVybiByZXNcbn1cblxuLy8gVXNlIGEgdHJpY2sgbGlrZSBpbiBwYXJzZS5qcyBhbmQgaGF2ZSBldmVyeXRoaW5nIGNsb3NlIG92ZXIgdGhlc2UgbXV0YWJsZSB2YXJpYWJsZXMuXG5sZXRcblx0Y29udGV4dCxcblx0Ly8gTWFwIGZyb20gbmFtZXMgdG8gTG9jYWxEZWNsYXJlcy5cblx0bG9jYWxzLFxuXHQvLyBMb2NhbHMgdGhhdCBkb24ndCBoYXZlIHRvIGJlIGFjY2Vzc2VkLlxuXHRva1RvTm90VXNlLFxuXHRvcExvb3AsXG5cdC8qXG5cdExvY2FscyBmb3IgdGhpcyBibG9jay5cblx0VGhlc2UgYXJlIGFkZGVkIHRvIGxvY2FscyB3aGVuIGVudGVyaW5nIGEgRnVuY3Rpb24gb3IgbGF6eSBldmFsdWF0aW9uLlxuXHRJbjpcblx0XHRhID0gfFxuXHRcdFx0YlxuXHRcdGIgPSAxXG5cdGBiYCB3aWxsIGJlIGEgcGVuZGluZyBsb2NhbC5cblx0SG93ZXZlcjpcblx0XHRhID0gYlxuXHRcdGIgPSAxXG5cdHdpbGwgZmFpbCB0byB2ZXJpZnksIGJlY2F1c2UgYGJgIGNvbWVzIGFmdGVyIGBhYCBhbmQgaXMgbm90IGFjY2Vzc2VkIGluc2lkZSBhIGZ1bmN0aW9uLlxuXHRJdCB3b3VsZCB3b3JrIGZvciBgfmEgaXMgYmAsIHRob3VnaC5cblx0Ki9cblx0cGVuZGluZ0Jsb2NrTG9jYWxzLFxuXHRpc0luRGVidWcsXG5cdC8vIFdoZXRoZXIgd2UgYXJlIGN1cnJlbnRseSBhYmxlIHRvIHlpZWxkLlxuXHRpc0luR2VuZXJhdG9yLFxuXHQvLyBDdXJyZW50IG1ldGhvZCB3ZSBhcmUgaW4sIG9yIGEgQ29uc3RydWN0b3IsIG9yIG51bGwuXG5cdG1ldGhvZCxcblx0cmVzdWx0cyxcblx0Ly8gTmFtZSBvZiB0aGUgY2xvc2VzdCBBc3NpZ25TaW5nbGVcblx0bmFtZVxuXG5jb25zdFxuXHR2ZXJpZnlPcEVhY2ggPSBvcCA9PiB7XG5cdFx0aWYgKG9wICE9PSBudWxsKVxuXHRcdFx0b3AudmVyaWZ5KClcblx0fSxcblxuXHRkZWxldGVMb2NhbCA9IGxvY2FsRGVjbGFyZSA9PlxuXHRcdGxvY2Fscy5kZWxldGUobG9jYWxEZWNsYXJlLm5hbWUpLFxuXG5cdHNldExvY2FsID0gbG9jYWxEZWNsYXJlID0+XG5cdFx0bG9jYWxzLnNldChsb2NhbERlY2xhcmUubmFtZSwgbG9jYWxEZWNsYXJlKSxcblxuXHQvLyBXaGVuIGEgbG9jYWwgaXMgcmV0dXJuZWQgZnJvbSBhIEJsb2NrT2JqIG9yIE1vZHVsZSxcblx0Ly8gdGhlIHJldHVybiAnYWNjZXNzJyBpcyBjb25zaWRlcmVkIHRvIGJlICdkZWJ1ZycgaWYgdGhlIGxvY2FsIGlzLlxuXHRhY2Nlc3NMb2NhbEZvclJldHVybiA9IChhY2Nlc3MsIGRlY2xhcmUpID0+IHtcblx0XHRjb25zdCBpbmZvID0gcmVzdWx0cy5sb2NhbERlY2xhcmVUb0luZm8uZ2V0KGRlY2xhcmUpXG5cdFx0X2FkZExvY2FsQWNjZXNzKGluZm8sIGFjY2VzcywgaW5mby5pc0luRGVidWcpXG5cdH0sXG5cblx0YWNjZXNzTG9jYWwgPSAoYWNjZXNzLCBuYW1lKSA9PiB7XG5cdFx0Y29uc3QgZGVjbGFyZSA9IGdldExvY2FsRGVjbGFyZShuYW1lLCBhY2Nlc3MubG9jKVxuXHRcdHNldExvY2FsRGVjbGFyZUFjY2Vzc2VkKGRlY2xhcmUsIGFjY2Vzcylcblx0fSxcblxuXHRzZXRMb2NhbERlY2xhcmVBY2Nlc3NlZCA9IChkZWNsYXJlLCBhY2Nlc3MpID0+IHtcblx0XHRfYWRkTG9jYWxBY2Nlc3MocmVzdWx0cy5sb2NhbERlY2xhcmVUb0luZm8uZ2V0KGRlY2xhcmUpLCBhY2Nlc3MsIGlzSW5EZWJ1Zylcblx0fSxcblxuXHRfYWRkTG9jYWxBY2Nlc3MgPSAobG9jYWxJbmZvLCBhY2Nlc3MsIGlzRGVidWdBY2Nlc3MpID0+XG5cdFx0KGlzRGVidWdBY2Nlc3MgPyBsb2NhbEluZm8uZGVidWdBY2Nlc3NlcyA6IGxvY2FsSW5mby5ub25EZWJ1Z0FjY2Vzc2VzKS5wdXNoKGFjY2VzcyksXG5cblx0Ly8gRm9yIGV4cHJlc3Npb25zIGFmZmVjdGluZyBsaW5lTmV3TG9jYWxzLCB0aGV5IHdpbGwgYmUgcmVnaXN0ZXJlZCBiZWZvcmUgYmVpbmcgdmVyaWZpZWQuXG5cdC8vIFNvLCBMb2NhbERlY2xhcmUudmVyaWZ5IGp1c3QgdGhlIHR5cGUuXG5cdC8vIEZvciBsb2NhbHMgbm90IGFmZmVjdGluZyBsaW5lTmV3TG9jYWxzLCB1c2UgdGhpcyBpbnN0ZWFkIG9mIGp1c3QgZGVjbGFyZS52ZXJpZnkoKVxuXHR2ZXJpZnlMb2NhbERlY2xhcmUgPSBsb2NhbERlY2xhcmUgPT4ge1xuXHRcdHJlZ2lzdGVyTG9jYWwobG9jYWxEZWNsYXJlKVxuXHRcdGxvY2FsRGVjbGFyZS52ZXJpZnkoKVxuXHR9LFxuXG5cdHJlZ2lzdGVyTG9jYWwgPSBsb2NhbERlY2xhcmUgPT4ge1xuXHRcdHJlc3VsdHMubG9jYWxEZWNsYXJlVG9JbmZvLnNldChsb2NhbERlY2xhcmUsIExvY2FsSW5mby5lbXB0eShpc0luRGVidWcpKVxuXHR9LFxuXG5cdHNldE5hbWUgPSBleHByID0+IHtcblx0XHRyZXN1bHRzLm5hbWVzLnNldChleHByLCBuYW1lKVxuXHR9XG5cbi8vIFRoZXNlIGZ1bmN0aW9ucyBjaGFuZ2UgdmVyaWZpZXIgc3RhdGUgYW5kIGVmZmljaWVudGx5IHJldHVybiB0byB0aGUgb2xkIHN0YXRlIHdoZW4gZmluaXNoZWQuXG5jb25zdFxuXHR3aXRoSW5EZWJ1ZyA9IGFjdGlvbiA9PiB7XG5cdFx0Y29uc3Qgb2xkSXNJbkRlYnVnID0gaXNJbkRlYnVnXG5cdFx0aXNJbkRlYnVnID0gdHJ1ZVxuXHRcdGFjdGlvbigpXG5cdFx0aXNJbkRlYnVnID0gb2xkSXNJbkRlYnVnXG5cdH0sXG5cblx0d2l0aEluR2VuZXJhdG9yID0gKG5ld0lzSW5HZW5lcmF0b3IsIGFjdGlvbikgPT4ge1xuXHRcdGNvbnN0IG9sZElzSW5HZW5lcmF0b3IgPSBpc0luR2VuZXJhdG9yXG5cdFx0aXNJbkdlbmVyYXRvciA9IG5ld0lzSW5HZW5lcmF0b3Jcblx0XHRhY3Rpb24oKVxuXHRcdGlzSW5HZW5lcmF0b3IgPSBvbGRJc0luR2VuZXJhdG9yXG5cdH0sXG5cblx0d2l0aExvb3AgPSAobmV3TG9vcCwgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgb2xkTG9vcCA9IG9wTG9vcFxuXHRcdG9wTG9vcCA9IG5ld0xvb3Bcblx0XHRhY3Rpb24oKVxuXHRcdG9wTG9vcCA9IG9sZExvb3Bcblx0fSxcblxuXHR3aXRoTWV0aG9kID0gKG5ld01ldGhvZCwgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgb2xkTWV0aG9kID0gbWV0aG9kXG5cdFx0bWV0aG9kID0gbmV3TWV0aG9kXG5cdFx0YWN0aW9uKClcblx0XHRtZXRob2QgPSBvbGRNZXRob2Rcblx0fSxcblxuXHR3aXRoTmFtZSA9IChuZXdOYW1lLCBhY3Rpb24pID0+IHtcblx0XHRjb25zdCBvbGROYW1lID0gbmFtZVxuXHRcdG5hbWUgPSBuZXdOYW1lXG5cdFx0YWN0aW9uKClcblx0XHRuYW1lID0gb2xkTmFtZVxuXHR9LFxuXG5cdC8vIENhbid0IGJyZWFrIG91dCBvZiBsb29wIGluc2lkZSBvZiBJSUZFLlxuXHR3aXRoSUlGRSA9IGFjdGlvbiA9PiB7XG5cdFx0d2l0aExvb3AoZmFsc2UsIGFjdGlvbilcblx0fSxcblxuXHRwbHVzTG9jYWwgPSAoYWRkZWRMb2NhbCwgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgc2hhZG93ZWQgPSBsb2NhbHMuZ2V0KGFkZGVkTG9jYWwubmFtZSlcblx0XHRsb2NhbHMuc2V0KGFkZGVkTG9jYWwubmFtZSwgYWRkZWRMb2NhbClcblx0XHRhY3Rpb24oKVxuXHRcdGlmIChzaGFkb3dlZCA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0ZGVsZXRlTG9jYWwoYWRkZWRMb2NhbClcblx0XHRlbHNlXG5cdFx0XHRzZXRMb2NhbChzaGFkb3dlZClcblx0fSxcblxuXHQvLyBTaG91bGQgaGF2ZSB2ZXJpZmllZCB0aGF0IGFkZGVkTG9jYWxzIGFsbCBoYXZlIGRpZmZlcmVudCBuYW1lcy5cblx0cGx1c0xvY2FscyA9IChhZGRlZExvY2FscywgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgc2hhZG93ZWRMb2NhbHMgPSBbXVxuXHRcdGZvciAoY29uc3QgXyBvZiBhZGRlZExvY2Fscykge1xuXHRcdFx0Y29uc3Qgc2hhZG93ZWQgPSBsb2NhbHMuZ2V0KF8ubmFtZSlcblx0XHRcdGlmIChzaGFkb3dlZCAhPT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRzaGFkb3dlZExvY2Fscy5wdXNoKHNoYWRvd2VkKVxuXHRcdFx0c2V0TG9jYWwoXylcblx0XHR9XG5cblx0XHRhY3Rpb24oKVxuXG5cdFx0YWRkZWRMb2NhbHMuZm9yRWFjaChkZWxldGVMb2NhbClcblx0XHRzaGFkb3dlZExvY2Fscy5mb3JFYWNoKHNldExvY2FsKVxuXHR9LFxuXG5cdHZlcmlmeUFuZFBsdXNMb2NhbCA9IChhZGRlZExvY2FsLCBhY3Rpb24pID0+IHtcblx0XHR2ZXJpZnlMb2NhbERlY2xhcmUoYWRkZWRMb2NhbClcblx0XHRwbHVzTG9jYWwoYWRkZWRMb2NhbCwgYWN0aW9uKVxuXHR9LFxuXG5cdHZlcmlmeUFuZFBsdXNMb2NhbHMgPSAoYWRkZWRMb2NhbHMsIGFjdGlvbikgPT4ge1xuXHRcdGFkZGVkTG9jYWxzLmZvckVhY2godmVyaWZ5TG9jYWxEZWNsYXJlKVxuXHRcdGNvbnN0IG5hbWVzID0gbmV3IFNldCgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIGFkZGVkTG9jYWxzKSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKCFuYW1lcy5oYXMoXy5uYW1lKSwgXy5sb2MsICgpID0+XG5cdFx0XHRcdGBEdXBsaWNhdGUgbG9jYWwgJHtjb2RlKF8ubmFtZSl9YClcblx0XHRcdG5hbWVzLmFkZChfLm5hbWUpXG5cdFx0fVxuXHRcdHBsdXNMb2NhbHMoYWRkZWRMb2NhbHMsIGFjdGlvbilcblx0fSxcblxuXHR3aXRoQmxvY2tMb2NhbHMgPSBhY3Rpb24gPT4ge1xuXHRcdGNvbnN0IG9sZFBlbmRpbmdCbG9ja0xvY2FscyA9IHBlbmRpbmdCbG9ja0xvY2Fsc1xuXHRcdHBlbmRpbmdCbG9ja0xvY2FscyA9IFtdXG5cdFx0cGx1c0xvY2FscyhvbGRQZW5kaW5nQmxvY2tMb2NhbHMsIGFjdGlvbilcblx0XHRwZW5kaW5nQmxvY2tMb2NhbHMgPSBvbGRQZW5kaW5nQmxvY2tMb2NhbHNcblx0fVxuXG5jb25zdCB2ZXJpZnlMb2NhbFVzZSA9ICgpID0+XG5cdHJlc3VsdHMubG9jYWxEZWNsYXJlVG9JbmZvLmZvckVhY2goKGluZm8sIGxvY2FsKSA9PiB7XG5cdFx0aWYgKCEobG9jYWwgaW5zdGFuY2VvZiBMb2NhbERlY2xhcmVCdWlsdCB8fCBsb2NhbCBpbnN0YW5jZW9mIExvY2FsRGVjbGFyZVJlcykpIHtcblx0XHRcdGNvbnN0IG5vTm9uRGVidWcgPSBpc0VtcHR5KGluZm8ubm9uRGVidWdBY2Nlc3Nlcylcblx0XHRcdGlmIChub05vbkRlYnVnICYmIGlzRW1wdHkoaW5mby5kZWJ1Z0FjY2Vzc2VzKSlcblx0XHRcdFx0Y29udGV4dC53YXJuSWYoIW9rVG9Ob3RVc2UuaGFzKGxvY2FsKSwgbG9jYWwubG9jLCAoKSA9PlxuXHRcdFx0XHRcdGBVbnVzZWQgbG9jYWwgdmFyaWFibGUgJHtjb2RlKGxvY2FsLm5hbWUpfS5gKVxuXHRcdFx0ZWxzZSBpZiAoaW5mby5pc0luRGVidWcpXG5cdFx0XHRcdGNvbnRleHQud2FybklmKCFub05vbkRlYnVnLCAoKSA9PiBoZWFkKGluZm8ubm9uRGVidWdBY2Nlc3NlcykubG9jLCAoKSA9PlxuXHRcdFx0XHRcdGBEZWJ1Zy1vbmx5IGxvY2FsICR7Y29kZShsb2NhbC5uYW1lKX0gdXNlZCBvdXRzaWRlIG9mIGRlYnVnLmApXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGNvbnRleHQud2FybklmKG5vTm9uRGVidWcsIGxvY2FsLmxvYywgKCkgPT5cblx0XHRcdFx0XHRgTG9jYWwgJHtjb2RlKGxvY2FsLm5hbWUpfSB1c2VkIG9ubHkgaW4gZGVidWcuYClcblx0XHR9XG5cdH0pXG5cblxuaW1wbGVtZW50TWFueShNc0FzdFR5cGVzLCAndmVyaWZ5Jywge1xuXHRBc3NlcnQoKSB7XG5cdFx0dGhpcy5jb25kaXRpb24udmVyaWZ5KClcblx0XHR2ZXJpZnlPcEVhY2godGhpcy5vcFRocm93bilcblx0fSxcblxuXHRBc3NpZ25TaW5nbGUoKSB7XG5cdFx0d2l0aE5hbWUodGhpcy5hc3NpZ25lZS5uYW1lLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBkb1YgPSAoKSA9PiB7XG5cdFx0XHRcdC8qXG5cdFx0XHRcdEZ1biBhbmQgQ2xhc3Mgb25seSBnZXQgbmFtZSBpZiB0aGV5IGFyZSBpbW1lZGlhdGVseSBhZnRlciB0aGUgYXNzaWdubWVudC5cblx0XHRcdFx0c28gaW4gYHggPSAkYWZ0ZXItdGltZSAxMDAwIHxgIHRoZSBmdW5jdGlvbiBpcyBub3QgbmFtZWQuXG5cdFx0XHRcdCovXG5cdFx0XHRcdGlmICh0aGlzLnZhbHVlIGluc3RhbmNlb2YgQ2xhc3MgfHwgdGhpcy52YWx1ZSBpbnN0YW5jZW9mIEZ1bilcblx0XHRcdFx0XHRzZXROYW1lKHRoaXMudmFsdWUpXG5cblx0XHRcdFx0Ly8gQXNzaWduZWUgcmVnaXN0ZXJlZCBieSB2ZXJpZnlMaW5lcy5cblx0XHRcdFx0dGhpcy5hc3NpZ25lZS52ZXJpZnkoKVxuXHRcdFx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy5hc3NpZ25lZS5pc0xhenkoKSlcblx0XHRcdFx0d2l0aEJsb2NrTG9jYWxzKGRvVilcblx0XHRcdGVsc2Vcblx0XHRcdFx0ZG9WKClcblx0XHR9KVxuXHR9LFxuXG5cdEFzc2lnbkRlc3RydWN0dXJlKCkge1xuXHRcdC8vIEFzc2lnbmVlcyByZWdpc3RlcmVkIGJ5IHZlcmlmeUxpbmVzLlxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFzc2lnbmVlcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0QmFnRW50cnk6IHZlcmlmeUJhZ0VudHJ5LFxuXHRCYWdFbnRyeU1hbnk6IHZlcmlmeUJhZ0VudHJ5LFxuXG5cdEJhZ1NpbXBsZSgpIHtcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5wYXJ0cylcblx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHRCbG9ja0RvKCkgeyB2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKSB9LFxuXG5cdEJsb2NrVmFsVGhyb3coKSB7XG5cdFx0Y29uc3QgbmV3TG9jYWxzID0gdmVyaWZ5TGluZXModGhpcy5saW5lcylcblx0XHRwbHVzTG9jYWxzKG5ld0xvY2FscywgKCkgPT4gdGhpcy50aHJvdy52ZXJpZnkoKSlcblx0fSxcblxuXHRCbG9ja1dpdGhSZXR1cm4oKSB7XG5cdFx0Y29uc3QgbmV3TG9jYWxzID0gdmVyaWZ5TGluZXModGhpcy5saW5lcylcblx0XHRwbHVzTG9jYWxzKG5ld0xvY2FscywgKCkgPT4gdGhpcy5yZXR1cm5lZC52ZXJpZnkoKSlcblx0fSxcblxuXHRCbG9ja09iaigpIHtcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5idWlsdCwgKCkgPT4ge1xuXHRcdFx0Y29uc3QgbmV3TG9jYWxzID0gdmVyaWZ5TGluZXModGhpcy5saW5lcylcblx0XHRcdG9wRWFjaCh0aGlzLm9wT2JqZWQsIF8gPT4gcGx1c0xvY2FscyhuZXdMb2NhbHMsICgpID0+IF8udmVyaWZ5KCkpKVxuXHRcdH0pXG5cdH0sXG5cblx0QmxvY2tCYWc6IHZlcmlmeUJsb2NrQmFnT3JNYXAsXG5cdEJsb2NrTWFwOiB2ZXJpZnlCbG9ja0JhZ09yTWFwLFxuXG5cdEJsb2NrV3JhcCgpIHsgd2l0aElJRkUoKCkgPT4gdGhpcy5ibG9jay52ZXJpZnkoKSkgfSxcblxuXHRCcmVhaygpIHtcblx0XHR2ZXJpZnlJbkxvb3AodGhpcylcblx0XHRjb250ZXh0LmNoZWNrKCEob3BMb29wIGluc3RhbmNlb2YgRm9yVmFsKSwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRgJHtjb2RlKCdmb3InKX0gbXVzdCBicmVhayB3aXRoIGEgdmFsdWUuYClcblx0fSxcblxuXHRCcmVha1dpdGhWYWwoKSB7XG5cdFx0dmVyaWZ5SW5Mb29wKHRoaXMpXG5cdFx0Y29udGV4dC5jaGVjayhvcExvb3AgaW5zdGFuY2VvZiBGb3JWYWwsIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0YCR7Y29kZSgnYnJlYWsnKX0gb25seSB2YWxpZCBpbnNpZGUgJHtjb2RlKCdmb3InKX1gKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0fSxcblxuXHRDYWxsKCkge1xuXHRcdHRoaXMuY2FsbGVkLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHRDYXNlRG8oKSB7IHZlcmlmeUNhc2UodGhpcykgfSxcblx0Q2FzZURvUGFydDogdmVyaWZ5Q2FzZVBhcnQsXG5cdENhc2VWYWwoKSB7IHdpdGhJSUZFKCgpID0+IHZlcmlmeUNhc2UodGhpcykpIH0sXG5cdENhc2VWYWxQYXJ0OiB2ZXJpZnlDYXNlUGFydCxcblxuXHRDYXRjaCgpIHtcblx0XHRjb250ZXh0LmNoZWNrKHRoaXMuY2F1Z2h0Lm9wVHlwZSA9PT0gbnVsbCwgdGhpcy5jYXVnaHQubG9jLCAnVE9ETzogQ2F1Z2h0IHR5cGVzJylcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5jYXVnaHQsICgpID0+IHRoaXMuYmxvY2sudmVyaWZ5KCkpXG5cdH0sXG5cblx0Q2xhc3MoKSB7XG5cdFx0dmVyaWZ5T3BFYWNoKHRoaXMub3BTdXBlckNsYXNzKVxuXHRcdHZlcmlmeU9wRWFjaCh0aGlzLm9wRG8pXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuc3RhdGljcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHRpZiAodGhpcy5vcENvbnN0cnVjdG9yICE9PSBudWxsKVxuXHRcdFx0dGhpcy5vcENvbnN0cnVjdG9yLnZlcmlmeSh0aGlzLm9wU3VwZXJDbGFzcyAhPT0gbnVsbClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5tZXRob2RzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdC8vIG5hbWUgc2V0IGJ5IEFzc2lnblNpbmdsZVxuXHR9LFxuXG5cdENsYXNzRG8oKSB7XG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuZGVjbGFyZUZvY3VzLCAoKSA9PiB0aGlzLmJsb2NrLnZlcmlmeSgpKVxuXHR9LFxuXG5cdENvbmQoKSB7XG5cdFx0dGhpcy50ZXN0LnZlcmlmeSgpXG5cdFx0dGhpcy5pZlRydWUudmVyaWZ5KClcblx0XHR0aGlzLmlmRmFsc2UudmVyaWZ5KClcblx0fSxcblxuXHRDb25kaXRpb25hbERvKCkge1xuXHRcdHRoaXMudGVzdC52ZXJpZnkoKVxuXHRcdHRoaXMucmVzdWx0LnZlcmlmeSgpXG5cdH0sXG5cdENvbmRpdGlvbmFsVmFsKCkge1xuXHRcdHRoaXMudGVzdC52ZXJpZnkoKVxuXHRcdHdpdGhJSUZFKCgpID0+IHRoaXMucmVzdWx0LnZlcmlmeSgpKVxuXHR9LFxuXG5cdENvbnN0cnVjdG9yKGNsYXNzSGFzU3VwZXIpIHtcblx0XHRva1RvTm90VXNlLmFkZCh0aGlzLmZ1bi5vcERlY2xhcmVUaGlzKVxuXHRcdHdpdGhNZXRob2QodGhpcywgKCkgPT4geyB0aGlzLmZ1bi52ZXJpZnkoKSB9KVxuXG5cdFx0Y29uc3Qgc3VwZXJDYWxsID0gcmVzdWx0cy5jb25zdHJ1Y3RvclRvU3VwZXIuZ2V0KHRoaXMpXG5cblx0XHRpZiAoY2xhc3NIYXNTdXBlcilcblx0XHRcdGNvbnRleHQuY2hlY2soc3VwZXJDYWxsICE9PSB1bmRlZmluZWQsIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0XHRgQ29uc3RydWN0b3IgbXVzdCBjb250YWluICR7Y29kZSgnc3VwZXIhJyl9YClcblx0XHRlbHNlXG5cdFx0XHRjb250ZXh0LmNoZWNrKHN1cGVyQ2FsbCA9PT0gdW5kZWZpbmVkLCAoKSA9PiBzdXBlckNhbGwubG9jLCAoKSA9PlxuXHRcdFx0XHRgQ2xhc3MgaGFzIG5vIHN1cGVyY2xhc3MsIHNvICR7Y29kZSgnc3VwZXIhJyl9IGlzIG5vdCBhbGxvd2VkLmApXG5cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5tZW1iZXJBcmdzKVxuXHRcdFx0c2V0TG9jYWxEZWNsYXJlQWNjZXNzZWQoXywgdGhpcylcblx0fSxcblxuXHQvLyBPbmx5IHJlYWNoIGhlcmUgZm9yIGluL291dCBjb25kaXRpb24uXG5cdERlYnVnKCkgeyB2ZXJpZnlMaW5lcyhbdGhpc10pIH0sXG5cblx0RXhjZXB0RG86IHZlcmlmeUV4Y2VwdCxcblx0RXhjZXB0VmFsOiB2ZXJpZnlFeGNlcHQsXG5cblx0Rm9yQmFnKCkgeyB2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5idWlsdCwgKCkgPT4gdmVyaWZ5Rm9yKHRoaXMpKSB9LFxuXG5cdEZvckRvKCkgeyB2ZXJpZnlGb3IodGhpcykgfSxcblxuXHRGb3JWYWwoKSB7IHZlcmlmeUZvcih0aGlzKSB9LFxuXG5cdEZ1bigpIHtcblx0XHR3aXRoQmxvY2tMb2NhbHMoKCkgPT4ge1xuXHRcdFx0Y29udGV4dC5jaGVjayh0aGlzLm9wRGVjbGFyZVJlcyA9PT0gbnVsbCB8fCB0aGlzLmJsb2NrIGluc3RhbmNlb2YgQmxvY2tWYWwsIHRoaXMubG9jLFxuXHRcdFx0XHQnRnVuY3Rpb24gd2l0aCByZXR1cm4gY29uZGl0aW9uIG11c3QgcmV0dXJuIHNvbWV0aGluZy4nKVxuXHRcdFx0d2l0aEluR2VuZXJhdG9yKHRoaXMuaXNHZW5lcmF0b3IsICgpID0+XG5cdFx0XHRcdHdpdGhMb29wKG51bGwsICgpID0+IHtcblx0XHRcdFx0XHRjb25zdCBhbGxBcmdzID0gY2F0KHRoaXMub3BEZWNsYXJlVGhpcywgdGhpcy5hcmdzLCB0aGlzLm9wUmVzdEFyZylcblx0XHRcdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKGFsbEFyZ3MsICgpID0+IHtcblx0XHRcdFx0XHRcdHZlcmlmeU9wRWFjaCh0aGlzLm9wSW4pXG5cdFx0XHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeSgpXG5cdFx0XHRcdFx0XHRvcEVhY2godGhpcy5vcERlY2xhcmVSZXMsIHZlcmlmeUxvY2FsRGVjbGFyZSlcblx0XHRcdFx0XHRcdGNvbnN0IHZlcmlmeU91dCA9ICgpID0+IHZlcmlmeU9wRWFjaCh0aGlzLm9wT3V0KVxuXHRcdFx0XHRcdFx0aWZFbHNlKHRoaXMub3BEZWNsYXJlUmVzLCBfID0+IHBsdXNMb2NhbChfLCB2ZXJpZnlPdXQpLCB2ZXJpZnlPdXQpXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fSkpXG5cdFx0fSlcblx0XHQvLyBuYW1lIHNldCBieSBBc3NpZ25TaW5nbGVcblx0fSxcblxuXHRJZ25vcmUoKSB7XG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuaWdub3JlZClcblx0XHRcdGFjY2Vzc0xvY2FsKHRoaXMsIF8pXG5cdH0sXG5cblx0TGF6eSgpIHsgd2l0aEJsb2NrTG9jYWxzKCgpID0+IHRoaXMudmFsdWUudmVyaWZ5KCkpIH0sXG5cblx0TG9jYWxBY2Nlc3MoKSB7XG5cdFx0Y29uc3QgZGVjbGFyZSA9IGxvY2Fscy5nZXQodGhpcy5uYW1lKVxuXHRcdGlmIChkZWNsYXJlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdGNvbnN0IGJ1aWx0aW5QYXRoID0gY29udGV4dC5vcHRzLmJ1aWx0aW5OYW1lVG9QYXRoLmdldCh0aGlzLm5hbWUpXG5cdFx0XHRpZiAoYnVpbHRpblBhdGggPT09IHVuZGVmaW5lZClcblx0XHRcdFx0ZmFpbE1pc3NpbmdMb2NhbCh0aGlzLmxvYywgdGhpcy5uYW1lKVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGNvbnN0IG5hbWVzID0gcmVzdWx0cy5idWlsdGluUGF0aFRvTmFtZXMuZ2V0KGJ1aWx0aW5QYXRoKVxuXHRcdFx0XHRpZiAobmFtZXMgPT09IHVuZGVmaW5lZClcblx0XHRcdFx0XHRyZXN1bHRzLmJ1aWx0aW5QYXRoVG9OYW1lcy5zZXQoYnVpbHRpblBhdGgsIG5ldyBTZXQoW3RoaXMubmFtZV0pKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0bmFtZXMuYWRkKHRoaXMubmFtZSlcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzdWx0cy5sb2NhbEFjY2Vzc1RvRGVjbGFyZS5zZXQodGhpcywgZGVjbGFyZSlcblx0XHRcdHNldExvY2FsRGVjbGFyZUFjY2Vzc2VkKGRlY2xhcmUsIHRoaXMpXG5cdFx0fVxuXHR9LFxuXG5cdC8vIEFkZGluZyBMb2NhbERlY2xhcmVzIHRvIHRoZSBhdmFpbGFibGUgbG9jYWxzIGlzIGRvbmUgYnkgRnVuIG9yIGxpbmVOZXdMb2NhbHMuXG5cdExvY2FsRGVjbGFyZSgpIHtcblx0XHRjb25zdCBidWlsdGluUGF0aCA9IGNvbnRleHQub3B0cy5idWlsdGluTmFtZVRvUGF0aC5nZXQodGhpcy5uYW1lKVxuXHRcdGNvbnRleHQud2FybklmKGJ1aWx0aW5QYXRoICE9PSB1bmRlZmluZWQsIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0YExvY2FsICR7Y29kZSh0aGlzLm5hbWUpfSBvdmVycmlkZXMgYnVpbHRpbiBmcm9tICR7Y29kZShidWlsdGluUGF0aCl9LmApXG5cdFx0dmVyaWZ5T3BFYWNoKHRoaXMub3BUeXBlKVxuXHR9LFxuXG5cdExvY2FsTXV0YXRlKCkge1xuXHRcdGNvbnN0IGRlY2xhcmUgPSBnZXRMb2NhbERlY2xhcmUodGhpcy5uYW1lLCB0aGlzLmxvYylcblx0XHRjb250ZXh0LmNoZWNrKGRlY2xhcmUuaXNNdXRhYmxlKCksIHRoaXMubG9jLCAoKSA9PiBgJHtjb2RlKHRoaXMubmFtZSl9IGlzIG5vdCBtdXRhYmxlLmApXG5cdFx0Ly8gVE9ETzogVHJhY2sgbXV0YXRpb25zLiBNdXRhYmxlIGxvY2FsIG11c3QgYmUgbXV0YXRlZCBzb21ld2hlcmUuXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdExvZ2ljKCkge1xuXHRcdGNvbnRleHQuY2hlY2sodGhpcy5hcmdzLmxlbmd0aCA+IDEsICdMb2dpYyBleHByZXNzaW9uIG5lZWRzIGF0IGxlYXN0IDIgYXJndW1lbnRzLicpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHROb3QoKSB7IHRoaXMuYXJnLnZlcmlmeSgpIH0sXG5cblx0TnVtYmVyTGl0ZXJhbCgpIHsgfSxcblxuXHRNYXBFbnRyeSgpIHtcblx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHRoaXMua2V5LnZlcmlmeSgpXG5cdFx0dGhpcy52YWwudmVyaWZ5KClcblx0fSxcblxuXHRNZW1iZXIoKSB7IHRoaXMub2JqZWN0LnZlcmlmeSgpIH0sXG5cblx0TWVtYmVyU2V0KCkge1xuXHRcdHRoaXMub2JqZWN0LnZlcmlmeSgpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdE1ldGhvZEltcGwoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kKHRoaXMsICgpID0+IHtcblx0XHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZnVuLm9wRGVjbGFyZVRoaXMpXG5cdFx0XHR0aGlzLmZ1bi52ZXJpZnkoKVxuXHRcdH0pXG5cdH0sXG5cdE1ldGhvZEdldHRlcigpIHtcblx0XHR2ZXJpZnlNZXRob2QodGhpcywgKCkgPT4ge1xuXHRcdFx0b2tUb05vdFVzZS5hZGQodGhpcy5kZWNsYXJlVGhpcylcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoW3RoaXMuZGVjbGFyZVRoaXNdLCAoKSA9PiB7IHRoaXMuYmxvY2sudmVyaWZ5KCkgfSlcblx0XHR9KVxuXHR9LFxuXHRNZXRob2RTZXR0ZXIoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kKHRoaXMsICgpID0+IHtcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoW3RoaXMuZGVjbGFyZVRoaXMsIHRoaXMuZGVjbGFyZUZvY3VzXSwgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeSgpXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH0sXG5cblx0TW9kdWxlKCkge1xuXHRcdC8vIE5vIG5lZWQgdG8gdmVyaWZ5IHRoaXMuZG9JbXBvcnRzLlxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmltcG9ydHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0dmVyaWZ5T3BFYWNoKHRoaXMub3BJbXBvcnRHbG9iYWwpXG5cdFx0d2l0aEluRGVidWcoKCkgPT4ge1xuXHRcdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuZGVidWdJbXBvcnRzKVxuXHRcdFx0XHRfLnZlcmlmeSgpXG5cdFx0fSlcblxuXHRcdHdpdGhOYW1lKGNvbnRleHQub3B0cy5tb2R1bGVOYW1lKCksICgpID0+IHsgdmVyaWZ5TGluZXModGhpcy5saW5lcykgfSlcblx0fSxcblxuXHRNb2R1bGVFeHBvcnQoKSB7XG5cdFx0dGhpcy5hc3NpZ24udmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hc3NpZ24uYWxsQXNzaWduZWVzKCkpXG5cdFx0XHRhY2Nlc3NMb2NhbEZvclJldHVybih0aGlzLCBfKVxuXHR9LFxuXG5cdE5ldygpIHtcblx0XHR0aGlzLnR5cGUudmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hcmdzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHR9LFxuXG5cdE9iakVudHJ5QXNzaWduKCkge1xuXHRcdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdFx0dGhpcy5hc3NpZ24udmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hc3NpZ24uYWxsQXNzaWduZWVzKCkpXG5cdFx0XHRhY2Nlc3NMb2NhbEZvclJldHVybih0aGlzLCBfKVxuXHR9LFxuXG5cdE9iakVudHJ5Q29tcHV0ZWQoKSB7XG5cdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR0aGlzLmtleS52ZXJpZnkoKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0fSxcblxuXHRPYmpTaW1wbGUoKSB7XG5cdFx0Y29uc3Qga2V5cyA9IG5ldyBTZXQoKVxuXHRcdGZvciAoY29uc3QgcGFpciBvZiB0aGlzLnBhaXJzKSB7XG5cdFx0XHRjb25zdCB7a2V5LCB2YWx1ZX0gPSBwYWlyXG5cdFx0XHRjb250ZXh0LmNoZWNrKCFrZXlzLmhhcyhrZXkpLCBwYWlyLmxvYywgKCkgPT4gYER1cGxpY2F0ZSBrZXkgJHtrZXl9YClcblx0XHRcdGtleXMuYWRkKGtleSlcblx0XHRcdHZhbHVlLnZlcmlmeSgpXG5cdFx0fVxuXHR9LFxuXG5cdFF1b3RlKCkge1xuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLnBhcnRzKVxuXHRcdFx0aWYgKHR5cGVvZiBfICE9PSAnc3RyaW5nJylcblx0XHRcdFx0Xy52ZXJpZnkoKVxuXHR9LFxuXG5cdFF1b3RlVGVtcGxhdGUoKSB7XG5cdFx0dGhpcy50YWcudmVyaWZ5KClcblx0XHR0aGlzLnF1b3RlLnZlcmlmeSgpXG5cdH0sXG5cblx0U3BlY2lhbERvKCkgeyB9LFxuXG5cdFNwZWNpYWxWYWwoKSB7XG5cdFx0c2V0TmFtZSh0aGlzKVxuXHR9LFxuXG5cdFNwbGF0KCkgeyB0aGlzLnNwbGF0dGVkLnZlcmlmeSgpIH0sXG5cblx0U3VwZXJDYWxsOiB2ZXJpZnlTdXBlckNhbGwsXG5cdFN1cGVyQ2FsbERvOiB2ZXJpZnlTdXBlckNhbGwsXG5cdFN1cGVyTWVtYmVyKCkge1xuXHRcdGNvbnRleHQuY2hlY2sobWV0aG9kICE9PSBudWxsLCB0aGlzLmxvYywgJ011c3QgYmUgaW4gbWV0aG9kLicpXG5cdH0sXG5cblx0U3dpdGNoRG8oKSB7IHZlcmlmeVN3aXRjaCh0aGlzKSB9LFxuXHRTd2l0Y2hEb1BhcnQ6IHZlcmlmeVN3aXRjaFBhcnQsXG5cdFN3aXRjaFZhbCgpIHsgd2l0aElJRkUoKCkgPT4gdmVyaWZ5U3dpdGNoKHRoaXMpKSB9LFxuXHRTd2l0Y2hWYWxQYXJ0OiB2ZXJpZnlTd2l0Y2hQYXJ0LFxuXG5cdFRocm93KCkge1xuXHRcdHZlcmlmeU9wRWFjaCh0aGlzLm9wVGhyb3duKVxuXHR9LFxuXG5cdEltcG9ydDogdmVyaWZ5SW1wb3J0LFxuXHRJbXBvcnRHbG9iYWw6IHZlcmlmeUltcG9ydCxcblxuXHRXaXRoKCkge1xuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0XHR3aXRoSUlGRSgoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5kZWNsYXJlIGluc3RhbmNlb2YgTG9jYWxEZWNsYXJlRm9jdXMpXG5cdFx0XHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZGVjbGFyZSlcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmRlY2xhcmUsICgpID0+IHsgdGhpcy5ibG9jay52ZXJpZnkoKSB9KVxuXHRcdH0pXG5cdH0sXG5cblx0WWllbGQoKSB7XG5cdFx0Y29udGV4dC5jaGVjayhpc0luR2VuZXJhdG9yLCB0aGlzLmxvYywgJ0Nhbm5vdCB5aWVsZCBvdXRzaWRlIG9mIGdlbmVyYXRvciBjb250ZXh0Jylcblx0XHR2ZXJpZnlPcEVhY2godGhpcy5vcFlpZWxkZWQpXG5cdH0sXG5cblx0WWllbGRUbygpIHtcblx0XHRjb250ZXh0LmNoZWNrKGlzSW5HZW5lcmF0b3IsIHRoaXMubG9jLCAnQ2Fubm90IHlpZWxkIG91dHNpZGUgb2YgZ2VuZXJhdG9yIGNvbnRleHQnKVxuXHRcdHRoaXMueWllbGRlZFRvLnZlcmlmeSgpXG5cdH1cbn0pXG5cbmZ1bmN0aW9uIHZlcmlmeUJhZ0VudHJ5KCkge1xuXHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHR0aGlzLnZhbHVlLnZlcmlmeSgpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeUJsb2NrQmFnT3JNYXAoKSB7XG5cdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmJ1aWx0LCAoKSA9PiB2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKSlcbn1cblxuZnVuY3Rpb24gdmVyaWZ5Q2FzZVBhcnQoKSB7XG5cdGlmICh0aGlzLnRlc3QgaW5zdGFuY2VvZiBQYXR0ZXJuKSB7XG5cdFx0dGhpcy50ZXN0LnR5cGUudmVyaWZ5KClcblx0XHR0aGlzLnRlc3QucGF0dGVybmVkLnZlcmlmeSgpXG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2Fscyh0aGlzLnRlc3QubG9jYWxzLCAoKSA9PiB0aGlzLnJlc3VsdC52ZXJpZnkoKSlcblx0fSBlbHNlIHtcblx0XHR0aGlzLnRlc3QudmVyaWZ5KClcblx0XHR0aGlzLnJlc3VsdC52ZXJpZnkoKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHZlcmlmeVN3aXRjaFBhcnQoKSB7XG5cdGZvciAoY29uc3QgXyBvZiB0aGlzLnZhbHVlcylcblx0XHRfLnZlcmlmeSgpXG5cdHRoaXMucmVzdWx0LnZlcmlmeSgpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeUV4Y2VwdCgpIHtcblx0dGhpcy5fdHJ5LnZlcmlmeSgpXG5cdHZlcmlmeU9wRWFjaCh0aGlzLl9jYXRjaClcblx0dmVyaWZ5T3BFYWNoKHRoaXMuX2ZpbmFsbHkpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeVN1cGVyQ2FsbCgpIHtcblx0Y29udGV4dC5jaGVjayhtZXRob2QgIT09IG51bGwsIHRoaXMubG9jLCAnTXVzdCBiZSBpbiBhIG1ldGhvZC4nKVxuXHRyZXN1bHRzLnN1cGVyQ2FsbFRvTWV0aG9kLnNldCh0aGlzLCBtZXRob2QpXG5cblx0aWYgKG1ldGhvZCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB7XG5cdFx0Y29udGV4dC5jaGVjayh0aGlzIGluc3RhbmNlb2YgU3VwZXJDYWxsRG8sIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0YCR7Y29kZSgnc3VwZXInKX0gbm90IHN1cHBvcnRlZCBpbiBjb25zdHJ1Y3RvcjsgdXNlICR7Y29kZSgnc3VwZXIhJyl9YClcblx0XHRyZXN1bHRzLmNvbnN0cnVjdG9yVG9TdXBlci5zZXQobWV0aG9kLCB0aGlzKVxuXHR9XG5cblx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRfLnZlcmlmeSgpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeUltcG9ydCgpIHtcblx0Ly8gU2luY2UgVXNlcyBhcmUgYWx3YXlzIGluIHRoZSBvdXRlcm1vc3Qgc2NvcGUsIGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgc2hhZG93aW5nLlxuXHQvLyBTbyB3ZSBtdXRhdGUgYGxvY2Fsc2AgZGlyZWN0bHkuXG5cdGNvbnN0IGFkZFVzZUxvY2FsID0gXyA9PiB7XG5cdFx0Y29uc3QgcHJldiA9IGxvY2Fscy5nZXQoXy5uYW1lKVxuXHRcdGNvbnRleHQuY2hlY2socHJldiA9PT0gdW5kZWZpbmVkLCBfLmxvYywgKCkgPT5cblx0XHRcdGAke2NvZGUoXy5uYW1lKX0gYWxyZWFkeSBpbXBvcnRlZCBhdCAke3ByZXYubG9jfWApXG5cdFx0dmVyaWZ5TG9jYWxEZWNsYXJlKF8pXG5cdFx0c2V0TG9jYWwoXylcblx0fVxuXHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5pbXBvcnRlZClcblx0XHRhZGRVc2VMb2NhbChfKVxuXHRvcEVhY2godGhpcy5vcEltcG9ydERlZmF1bHQsIGFkZFVzZUxvY2FsKVxufVxuXG4vLyBIZWxwZXJzIHNwZWNpZmljIHRvIGNlcnRhaW4gTXNBc3QgdHlwZXM6XG5jb25zdFxuXHR2ZXJpZnlGb3IgPSBmb3JMb29wID0+IHtcblx0XHRjb25zdCB2ZXJpZnlCbG9jayA9ICgpID0+IHdpdGhMb29wKGZvckxvb3AsICgpID0+IGZvckxvb3AuYmxvY2sudmVyaWZ5KCkpXG5cdFx0aWZFbHNlKGZvckxvb3Aub3BJdGVyYXRlZSxcblx0XHRcdCh7ZWxlbWVudCwgYmFnfSkgPT4ge1xuXHRcdFx0XHRiYWcudmVyaWZ5KClcblx0XHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKGVsZW1lbnQsIHZlcmlmeUJsb2NrKVxuXHRcdFx0fSxcblx0XHRcdHZlcmlmeUJsb2NrKVxuXHR9LFxuXG5cdHZlcmlmeUluTG9vcCA9IGxvb3BVc2VyID0+XG5cdFx0Y29udGV4dC5jaGVjayhvcExvb3AgIT09IG51bGwsIGxvb3BVc2VyLmxvYywgJ05vdCBpbiBhIGxvb3AuJyksXG5cblxuXHR2ZXJpZnlDYXNlID0gXyA9PiB7XG5cdFx0Y29uc3QgZG9JdCA9ICgpID0+IHtcblx0XHRcdGZvciAoY29uc3QgcGFydCBvZiBfLnBhcnRzKVxuXHRcdFx0XHRwYXJ0LnZlcmlmeSgpXG5cdFx0XHR2ZXJpZnlPcEVhY2goXy5vcEVsc2UpXG5cdFx0fVxuXHRcdGlmRWxzZShfLm9wQ2FzZWQsXG5cdFx0XHRfID0+IHtcblx0XHRcdFx0Xy52ZXJpZnkoKVxuXHRcdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwoXy5hc3NpZ25lZSwgZG9JdClcblx0XHRcdH0sXG5cdFx0XHRkb0l0KVxuXHR9LFxuXG5cdHZlcmlmeU1ldGhvZCA9IChfLCBkb1ZlcmlmeSkgPT4ge1xuXHRcdGlmICh0eXBlb2YgXy5zeW1ib2wgIT09ICdzdHJpbmcnKVxuXHRcdFx0Xy5zeW1ib2wudmVyaWZ5KClcblx0XHR3aXRoTWV0aG9kKF8sIGRvVmVyaWZ5KVxuXHR9LFxuXG5cdHZlcmlmeVN3aXRjaCA9IF8gPT4ge1xuXHRcdF8uc3dpdGNoZWQudmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IHBhcnQgb2YgXy5wYXJ0cylcblx0XHRcdHBhcnQudmVyaWZ5KClcblx0XHR2ZXJpZnlPcEVhY2goXy5vcEVsc2UpXG5cdH1cblxuLy8gR2VuZXJhbCB1dGlsaXRpZXM6XG5jb25zdFxuXHRnZXRMb2NhbERlY2xhcmUgPSAobmFtZSwgYWNjZXNzTG9jKSA9PiB7XG5cdFx0Y29uc3QgZGVjbGFyZSA9IGxvY2Fscy5nZXQobmFtZSlcblx0XHRpZiAoZGVjbGFyZSA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0ZmFpbE1pc3NpbmdMb2NhbChhY2Nlc3NMb2MsIG5hbWUpXG5cdFx0cmV0dXJuIGRlY2xhcmVcblx0fSxcblxuXHRmYWlsTWlzc2luZ0xvY2FsID0gKGxvYywgbmFtZSkgPT4ge1xuXHRcdGNvbnRleHQuZmFpbChsb2MsICgpID0+IHtcblx0XHRcdC8vIFRPRE86RVM2IGBBcnJheS5mcm9tKGxvY2Fscy5rZXlzKCkpYCBzaG91bGQgd29ya1xuXHRcdFx0Y29uc3Qga2V5cyA9IFtdXG5cdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBsb2NhbHMua2V5cygpKVxuXHRcdFx0XHRrZXlzLnB1c2goa2V5KVxuXHRcdFx0Y29uc3Qgc2hvd0xvY2FscyA9IGNvZGUoa2V5cy5qb2luKCcgJykpXG5cdFx0XHRyZXR1cm4gYE5vIHN1Y2ggbG9jYWwgJHtjb2RlKG5hbWUpfS5cXG5Mb2NhbHMgYXJlOlxcbiR7c2hvd0xvY2Fsc30uYFxuXHRcdH0pXG5cdH0sXG5cblx0bGluZU5ld0xvY2FscyA9IGxpbmUgPT5cblx0XHRsaW5lIGluc3RhbmNlb2YgQXNzaWduU2luZ2xlID9cblx0XHRcdFtsaW5lLmFzc2lnbmVlXSA6XG5cdFx0XHRsaW5lIGluc3RhbmNlb2YgQXNzaWduRGVzdHJ1Y3R1cmUgP1xuXHRcdFx0bGluZS5hc3NpZ25lZXMgOlxuXHRcdFx0bGluZSBpbnN0YW5jZW9mIE9iakVudHJ5ID9cblx0XHRcdGxpbmVOZXdMb2NhbHMobGluZS5hc3NpZ24pIDpcblx0XHRcdGxpbmUgaW5zdGFuY2VvZiBNb2R1bGVFeHBvcnQgP1xuXHRcdFx0bGluZU5ld0xvY2FscyhsaW5lLmFzc2lnbikgOlxuXHRcdFx0W10sXG5cblx0dmVyaWZ5TGluZXMgPSBsaW5lcyA9PiB7XG5cdFx0Lypcblx0XHRXZSBuZWVkIHRvIGJldCBhbGwgYmxvY2sgbG9jYWxzIHVwLWZyb250IGJlY2F1c2Vcblx0XHRGdW5jdGlvbnMgd2l0aGluIGxpbmVzIGNhbiBhY2Nlc3MgbG9jYWxzIGZyb20gbGF0ZXIgbGluZXMuXG5cdFx0Tk9URTogV2UgcHVzaCB0aGVzZSBvbnRvIHBlbmRpbmdCbG9ja0xvY2FscyBpbiByZXZlcnNlXG5cdFx0c28gdGhhdCB3aGVuIHdlIGl0ZXJhdGUgdGhyb3VnaCBsaW5lcyBmb3J3YXJkcywgd2UgY2FuIHBvcCBmcm9tIHBlbmRpbmdCbG9ja0xvY2Fsc1xuXHRcdHRvIHJlbW92ZSBwZW5kaW5nIGxvY2FscyBhcyB0aGV5IGJlY29tZSByZWFsIGxvY2Fscy5cblx0XHRJdCBkb2Vzbid0IHJlYWxseSBtYXR0ZXIgd2hhdCBvcmRlciB3ZSBhZGQgbG9jYWxzIGluIHNpbmNlIGl0J3Mgbm90IGFsbG93ZWRcblx0XHR0byBoYXZlIHR3byBsb2NhbHMgb2YgdGhlIHNhbWUgbmFtZSBpbiB0aGUgc2FtZSBibG9jay5cblx0XHQqL1xuXHRcdGNvbnN0IG5ld0xvY2FscyA9IFtdXG5cblx0XHRjb25zdCBnZXRMaW5lTG9jYWxzID0gbGluZSA9PiB7XG5cdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIERlYnVnKVxuXHRcdFx0XHR3aXRoSW5EZWJ1ZygoKSA9PiB7XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIHJldmVyc2VJdGVyKGxpbmUubGluZXMpKVxuXHRcdFx0XHRcdFx0Z2V0TGluZUxvY2FscyhfKVxuXHRcdFx0XHR9KVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRmb3IgKGNvbnN0IF8gb2YgcmV2ZXJzZUl0ZXIobGluZU5ld0xvY2FscyhsaW5lKSkpIHtcblx0XHRcdFx0XHQvLyBSZWdpc3RlciB0aGUgbG9jYWwgbm93LiBDYW4ndCB3YWl0IHVudGlsIHRoZSBhc3NpZ24gaXMgdmVyaWZpZWQuXG5cdFx0XHRcdFx0cmVnaXN0ZXJMb2NhbChfKVxuXHRcdFx0XHRcdG5ld0xvY2Fscy5wdXNoKF8pXG5cdFx0XHRcdH1cblx0XHR9XG5cdFx0Zm9yIChjb25zdCBfIG9mIHJldmVyc2VJdGVyKGxpbmVzKSlcblx0XHRcdGdldExpbmVMb2NhbHMoXylcblx0XHRwZW5kaW5nQmxvY2tMb2NhbHMucHVzaCguLi5uZXdMb2NhbHMpXG5cblx0XHQvKlxuXHRcdEtlZXBzIHRyYWNrIG9mIGxvY2FscyB3aGljaCBoYXZlIGFscmVhZHkgYmVlbiBhZGRlZCBpbiB0aGlzIGJsb2NrLlxuXHRcdE1hc29uIGFsbG93cyBzaGFkb3dpbmcsIGJ1dCBub3Qgd2l0aGluIHRoZSBzYW1lIGJsb2NrLlxuXHRcdFNvLCB0aGlzIGlzIGFsbG93ZWQ6XG5cdFx0XHRhID0gMVxuXHRcdFx0YiA9XG5cdFx0XHRcdGEgPSAyXG5cdFx0XHRcdC4uLlxuXHRcdEJ1dCBub3Q6XG5cdFx0XHRhID0gMVxuXHRcdFx0YSA9IDJcblx0XHQqL1xuXHRcdGNvbnN0IHRoaXNCbG9ja0xvY2FsTmFtZXMgPSBuZXcgU2V0KClcblxuXHRcdC8vIEFsbCBzaGFkb3dlZCBsb2NhbHMgZm9yIHRoaXMgYmxvY2suXG5cdFx0Y29uc3Qgc2hhZG93ZWQgPSBbXVxuXG5cdFx0Y29uc3QgdmVyaWZ5TGluZSA9IGxpbmUgPT4ge1xuXHRcdFx0aWYgKGxpbmUgaW5zdGFuY2VvZiBEZWJ1Zylcblx0XHRcdFx0Ly8gVE9ETzogRG8gYW55dGhpbmcgaW4gdGhpcyBzaXR1YXRpb24/XG5cdFx0XHRcdC8vIGNvbnRleHQuY2hlY2soIWluRGVidWcsIGxpbmUubG9jLCAnUmVkdW5kYW50IGBkZWJ1Z2AuJylcblx0XHRcdFx0d2l0aEluRGVidWcoKCkgPT4gbGluZS5saW5lcy5mb3JFYWNoKHZlcmlmeUxpbmUpKVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHZlcmlmeUlzU3RhdGVtZW50KGxpbmUpXG5cdFx0XHRcdGZvciAoY29uc3QgbmV3TG9jYWwgb2YgbGluZU5ld0xvY2FscyhsaW5lKSkge1xuXHRcdFx0XHRcdGNvbnN0IG5hbWUgPSBuZXdMb2NhbC5uYW1lXG5cdFx0XHRcdFx0Y29uc3Qgb2xkTG9jYWwgPSBsb2NhbHMuZ2V0KG5hbWUpXG5cdFx0XHRcdFx0aWYgKG9sZExvY2FsICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdGNvbnRleHQuY2hlY2soIXRoaXNCbG9ja0xvY2FsTmFtZXMuaGFzKG5hbWUpLCBuZXdMb2NhbC5sb2MsXG5cdFx0XHRcdFx0XHRcdCgpID0+IGBBIGxvY2FsICR7Y29kZShuYW1lKX0gaXMgYWxyZWFkeSBpbiB0aGlzIGJsb2NrLmApXG5cdFx0XHRcdFx0XHRzaGFkb3dlZC5wdXNoKG9sZExvY2FsKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzQmxvY2tMb2NhbE5hbWVzLmFkZChuYW1lKVxuXHRcdFx0XHRcdHNldExvY2FsKG5ld0xvY2FsKVxuXG5cdFx0XHRcdFx0Ly8gTm93IHRoYXQgaXQncyBhZGRlZCBhcyBhIGxvY2FsLCBpdCdzIG5vIGxvbmdlciBwZW5kaW5nLlxuXHRcdFx0XHRcdC8vIFdlIGFkZGVkIHBlbmRpbmdCbG9ja0xvY2FscyBpbiB0aGUgcmlnaHQgb3JkZXIgdGhhdCB3ZSBjYW4ganVzdCBwb3AgdGhlbSBvZmYuXG5cdFx0XHRcdFx0Y29uc3QgcG9wcGVkID0gcGVuZGluZ0Jsb2NrTG9jYWxzLnBvcCgpXG5cdFx0XHRcdFx0YXNzZXJ0KHBvcHBlZCA9PT0gbmV3TG9jYWwpXG5cdFx0XHRcdH1cblx0XHRcdFx0bGluZS52ZXJpZnkoKVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGxpbmVzLmZvckVhY2godmVyaWZ5TGluZSlcblxuXHRcdG5ld0xvY2Fscy5mb3JFYWNoKGRlbGV0ZUxvY2FsKVxuXHRcdHNoYWRvd2VkLmZvckVhY2goc2V0TG9jYWwpXG5cblx0XHRyZXR1cm4gbmV3TG9jYWxzXG5cdH0sXG5cblx0dmVyaWZ5SXNTdGF0ZW1lbnQgPSBsaW5lID0+IHtcblx0XHRjb25zdCBpc1N0YXRlbWVudCA9XG5cdFx0XHRsaW5lIGluc3RhbmNlb2YgRG8gfHxcblx0XHRcdC8vIFNvbWUgdmFsdWVzIGFyZSBhbHNvIGFjY2VwdGFibGUuXG5cdFx0XHRsaW5lIGluc3RhbmNlb2YgQ2FsbCB8fFxuXHRcdFx0bGluZSBpbnN0YW5jZW9mIFlpZWxkIHx8XG5cdFx0XHRsaW5lIGluc3RhbmNlb2YgWWllbGRUb1xuXHRcdGNvbnRleHQuY2hlY2soaXNTdGF0ZW1lbnQsIGxpbmUubG9jLCAnRXhwcmVzc2lvbiBpbiBzdGF0ZW1lbnQgcG9zaXRpb24uJylcblx0fVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

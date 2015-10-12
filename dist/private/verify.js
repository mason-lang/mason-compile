if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../CompileError', './MsAst', './util', './VerifyResults'], function (exports, module, _CompileError, _MsAst, _util, _VerifyResults) {
	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _VerifyResults2 = _interopRequireDefault(_VerifyResults);

	/*
 The verifier generates information needed during transpiling, the VerifyResults.
 */

	module.exports = (_context, msAst) => {
		context = _context;
		locals = new Map();
		pendingBlockLocals = [];
		isInGenerator = false;
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
	pendingBlockLocals,
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
	      accessLocal = (access, name) => {
		const declare = getLocalDeclare(name, access.loc);
		setDeclareAccessed(declare, access);
	},
	      setDeclareAccessed = (declare, access) => {
		results.localDeclareToAccesses.get(declare).push(access);
	},
	     

	// For expressions affecting lineNewLocals, they will be registered before being verified.
	// So, LocalDeclare.verify just the type.
	// For locals not affecting lineNewLocals, use this instead of just declare.verify()
	verifyLocalDeclare = localDeclare => {
		registerLocal(localDeclare);
		localDeclare.verify();
	},
	      registerLocal = localDeclare => {
		results.localDeclareToAccesses.set(localDeclare, []);
	},
	      setName = expr => {
		results.names.set(expr, name);
	};

	// These functions change verifier state and efficiently return to the old state when finished.
	const withInGenerator = (newIsInGenerator, action) => {
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

	const verifyLocalUse = () => {
		for (const _ref of results.localDeclareToAccesses) {
			var _ref2 = _slicedToArray(_ref, 2);

			const local = _ref2[0];
			const accesses = _ref2[1];

			if (!(local instanceof _MsAst.LocalDeclareBuilt || local instanceof _MsAst.LocalDeclareRes)) context.warnIf((0, _util.isEmpty)(accesses) && !okToNotUse.has(local), local.loc, () => `Unused local variable ${ (0, _CompileError.code)(local.name) }.`);
		}
	};

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

		BlockObj: verifyBlockBuild,
		BlockBag: verifyBlockBuild,
		BlockMap: verifyBlockBuild,

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

			for (const _ of this.memberArgs) setDeclareAccessed(_, this);
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
				setDeclareAccessed(declare, this);
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

			withName(context.opts.moduleName(), () => {
				verifyLines(this.lines);
			});
		},

		ModuleExport() {
			this.assign.verify();
			for (const _ of this.assign.allAssignees()) setDeclareAccessed(_, this);
		},

		New() {
			this.type.verify();
			for (const _ of this.args) _.verify();
		},

		ObjEntryAssign() {
			accessLocal(this, 'built');
			this.assign.verify();
			for (const _ of this.assign.allAssignees()) setDeclareAccessed(_, this);
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

	function verifyBlockBuild() {
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
		(0, _util.ifElse)(forLoop.opIteratee, _ref3 => {
			let element = _ref3.element;
			let bag = _ref3.bag;

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
			for (const _ of (0, _util.reverseIter)(lineNewLocals(line))) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZlcmlmeS5qcyIsInByaXZhdGUvdmVyaWZ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O2tCQ1dlLENBQUMsUUFBUSxFQUFFLEtBQUssS0FBSztBQUNuQyxTQUFPLEdBQUcsUUFBUSxDQUFBO0FBQ2xCLFFBQU0sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQ2xCLG9CQUFrQixHQUFHLEVBQUUsQ0FBQTtBQUN2QixlQUFhLEdBQUcsS0FBSyxDQUFBO0FBQ3JCLFlBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQ3RCLFFBQU0sR0FBRyxJQUFJLENBQUE7QUFDYixRQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2IsU0FBTyxHQUFHLDZCQUFtQixDQUFBOztBQUU3QixPQUFLLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDZCxnQkFBYyxFQUFFLENBQUE7O0FBRWhCLFFBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQTs7QUFFbkIsU0FBTyxHQUFHLE1BQU0sR0FBRyxVQUFVLEdBQUcsTUFBTSxHQUFHLGtCQUFrQixHQUFHLE1BQU0sR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFBO0FBQ3JGLFNBQU8sR0FBRyxDQUFBO0VBQ1Y7OztBQUdELEtBQ0MsT0FBTzs7QUFFUCxPQUFNOztBQUVOLFdBQVUsRUFDVixNQUFNOzs7Ozs7Ozs7Ozs7Ozs7QUFlTixtQkFBa0I7O0FBRWxCLGNBQWE7O0FBRWIsT0FBTSxFQUNOLE9BQU87O0FBRVAsS0FBSSxDQUFBOztBQUVMLE9BQ0MsWUFBWSxHQUFHLEVBQUUsSUFBSTtBQUNwQixNQUFJLEVBQUUsS0FBSyxJQUFJLEVBQ2QsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFBO0VBQ1o7T0FFRCxXQUFXLEdBQUcsWUFBWSxJQUN6QixNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7T0FFakMsUUFBUSxHQUFHLFlBQVksSUFDdEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFB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QWh2QmYsSUFBSSxFQWd2QmdCLElBQUksQ0FBQyxFQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQTtBQUN6RCxhQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQ3ZCO0FBQ0QsdUJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzdCLFlBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTs7OztBQUlsQixVQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUN2QyxjQXB2QkksTUFBTSxFQW92QkgsTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFBO0lBQzNCO0FBQ0QsT0FBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO0dBQ2IsQ0FBQTs7QUFFRCxPQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFBOztBQUV6QixXQUFTLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQzlCLFVBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7O0FBRTFCLFNBQU8sU0FBUyxDQUFBO0VBQ2hCO09BRUQsaUJBQWlCLEdBQUcsSUFBSSxJQUFJO0FBQzNCLFFBQU0sV0FBVyxHQUNoQixJQUFJLG1CQXR3QnNFLEVBQUUsQUFzd0IxRDs7QUFFbEIsTUFBSSxtQkF4d0I0QyxJQUFJLEFBd3dCaEMsSUFDcEIsSUFBSSxtQkF2d0JPLEtBQUssQUF1d0JLLElBQ3JCLElBQUksbUJBeHdCYyxPQUFPLEFBd3dCRixDQUFBO0FBQ3hCLFNBQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsbUNBQW1DLENBQUMsQ0FBQTtFQUN6RSxDQUFBIiwiZmlsZSI6InByaXZhdGUvdmVyaWZ5LmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge2NvZGV9IGZyb20gJy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCAqIGFzIE1zQXN0VHlwZXMgZnJvbSAnLi9Nc0FzdCdcbmltcG9ydCB7QXNzaWduRGVzdHJ1Y3R1cmUsIEFzc2lnblNpbmdsZSwgQmxvY2tWYWwsIENhbGwsIENsYXNzLCBDb25zdHJ1Y3RvciwgRG8sIEZvclZhbCwgRnVuLFxuXHRMb2NhbERlY2xhcmVCdWlsdCwgTG9jYWxEZWNsYXJlRm9jdXMsIExvY2FsRGVjbGFyZVJlcywgTW9kdWxlRXhwb3J0LCBPYmpFbnRyeSwgUGF0dGVybixcblx0U3VwZXJDYWxsRG8sIFlpZWxkLCBZaWVsZFRvfSBmcm9tICcuL01zQXN0J1xuaW1wb3J0IHthc3NlcnQsIGNhdCwgaWZFbHNlLCBpbXBsZW1lbnRNYW55LCBpc0VtcHR5LCBvcEVhY2gsIHJldmVyc2VJdGVyfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgVmVyaWZ5UmVzdWx0cyBmcm9tICcuL1ZlcmlmeVJlc3VsdHMnXG5cbi8qXG5UaGUgdmVyaWZpZXIgZ2VuZXJhdGVzIGluZm9ybWF0aW9uIG5lZWRlZCBkdXJpbmcgdHJhbnNwaWxpbmcsIHRoZSBWZXJpZnlSZXN1bHRzLlxuKi9cbmV4cG9ydCBkZWZhdWx0IChfY29udGV4dCwgbXNBc3QpID0+IHtcblx0Y29udGV4dCA9IF9jb250ZXh0XG5cdGxvY2FscyA9IG5ldyBNYXAoKVxuXHRwZW5kaW5nQmxvY2tMb2NhbHMgPSBbXVxuXHRpc0luR2VuZXJhdG9yID0gZmFsc2Vcblx0b2tUb05vdFVzZSA9IG5ldyBTZXQoKVxuXHRvcExvb3AgPSBudWxsXG5cdG1ldGhvZCA9IG51bGxcblx0cmVzdWx0cyA9IG5ldyBWZXJpZnlSZXN1bHRzKClcblxuXHRtc0FzdC52ZXJpZnkoKVxuXHR2ZXJpZnlMb2NhbFVzZSgpXG5cblx0Y29uc3QgcmVzID0gcmVzdWx0c1xuXHQvLyBSZWxlYXNlIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXG5cdGNvbnRleHQgPSBsb2NhbHMgPSBva1RvTm90VXNlID0gb3BMb29wID0gcGVuZGluZ0Jsb2NrTG9jYWxzID0gbWV0aG9kID0gcmVzdWx0cyA9IG51bGxcblx0cmV0dXJuIHJlc1xufVxuXG4vLyBVc2UgYSB0cmljayBsaWtlIGluIHBhcnNlLmpzIGFuZCBoYXZlIGV2ZXJ5dGhpbmcgY2xvc2Ugb3ZlciB0aGVzZSBtdXRhYmxlIHZhcmlhYmxlcy5cbmxldFxuXHRjb250ZXh0LFxuXHQvLyBNYXAgZnJvbSBuYW1lcyB0byBMb2NhbERlY2xhcmVzLlxuXHRsb2NhbHMsXG5cdC8vIExvY2FscyB0aGF0IGRvbid0IGhhdmUgdG8gYmUgYWNjZXNzZWQuXG5cdG9rVG9Ob3RVc2UsXG5cdG9wTG9vcCxcblx0Lypcblx0TG9jYWxzIGZvciB0aGlzIGJsb2NrLlxuXHRUaGVzZSBhcmUgYWRkZWQgdG8gbG9jYWxzIHdoZW4gZW50ZXJpbmcgYSBGdW5jdGlvbiBvciBsYXp5IGV2YWx1YXRpb24uXG5cdEluOlxuXHRcdGEgPSB8XG5cdFx0XHRiXG5cdFx0YiA9IDFcblx0YGJgIHdpbGwgYmUgYSBwZW5kaW5nIGxvY2FsLlxuXHRIb3dldmVyOlxuXHRcdGEgPSBiXG5cdFx0YiA9IDFcblx0d2lsbCBmYWlsIHRvIHZlcmlmeSwgYmVjYXVzZSBgYmAgY29tZXMgYWZ0ZXIgYGFgIGFuZCBpcyBub3QgYWNjZXNzZWQgaW5zaWRlIGEgZnVuY3Rpb24uXG5cdEl0IHdvdWxkIHdvcmsgZm9yIGB+YSBpcyBiYCwgdGhvdWdoLlxuXHQqL1xuXHRwZW5kaW5nQmxvY2tMb2NhbHMsXG5cdC8vIFdoZXRoZXIgd2UgYXJlIGN1cnJlbnRseSBhYmxlIHRvIHlpZWxkLlxuXHRpc0luR2VuZXJhdG9yLFxuXHQvLyBDdXJyZW50IG1ldGhvZCB3ZSBhcmUgaW4sIG9yIGEgQ29uc3RydWN0b3IsIG9yIG51bGwuXG5cdG1ldGhvZCxcblx0cmVzdWx0cyxcblx0Ly8gTmFtZSBvZiB0aGUgY2xvc2VzdCBBc3NpZ25TaW5nbGVcblx0bmFtZVxuXG5jb25zdFxuXHR2ZXJpZnlPcEVhY2ggPSBvcCA9PiB7XG5cdFx0aWYgKG9wICE9PSBudWxsKVxuXHRcdFx0b3AudmVyaWZ5KClcblx0fSxcblxuXHRkZWxldGVMb2NhbCA9IGxvY2FsRGVjbGFyZSA9PlxuXHRcdGxvY2Fscy5kZWxldGUobG9jYWxEZWNsYXJlLm5hbWUpLFxuXG5cdHNldExvY2FsID0gbG9jYWxEZWNsYXJlID0+XG5cdFx0bG9jYWxzLnNldChsb2NhbERlY2xhcmUubmFtZSwgbG9jYWxEZWNsYXJlKSxcblxuXHRhY2Nlc3NMb2NhbCA9IChhY2Nlc3MsIG5hbWUpID0+IHtcblx0XHRjb25zdCBkZWNsYXJlID0gZ2V0TG9jYWxEZWNsYXJlKG5hbWUsIGFjY2Vzcy5sb2MpXG5cdFx0c2V0RGVjbGFyZUFjY2Vzc2VkKGRlY2xhcmUsIGFjY2Vzcylcblx0fSxcblxuXHRzZXREZWNsYXJlQWNjZXNzZWQgPSAoZGVjbGFyZSwgYWNjZXNzKSA9PiB7XG5cdFx0cmVzdWx0cy5sb2NhbERlY2xhcmVUb0FjY2Vzc2VzLmdldChkZWNsYXJlKS5wdXNoKGFjY2Vzcylcblx0fSxcblxuXHQvLyBGb3IgZXhwcmVzc2lvbnMgYWZmZWN0aW5nIGxpbmVOZXdMb2NhbHMsIHRoZXkgd2lsbCBiZSByZWdpc3RlcmVkIGJlZm9yZSBiZWluZyB2ZXJpZmllZC5cblx0Ly8gU28sIExvY2FsRGVjbGFyZS52ZXJpZnkganVzdCB0aGUgdHlwZS5cblx0Ly8gRm9yIGxvY2FscyBub3QgYWZmZWN0aW5nIGxpbmVOZXdMb2NhbHMsIHVzZSB0aGlzIGluc3RlYWQgb2YganVzdCBkZWNsYXJlLnZlcmlmeSgpXG5cdHZlcmlmeUxvY2FsRGVjbGFyZSA9IGxvY2FsRGVjbGFyZSA9PiB7XG5cdFx0cmVnaXN0ZXJMb2NhbChsb2NhbERlY2xhcmUpXG5cdFx0bG9jYWxEZWNsYXJlLnZlcmlmeSgpXG5cdH0sXG5cblx0cmVnaXN0ZXJMb2NhbCA9IGxvY2FsRGVjbGFyZSA9PiB7XG5cdFx0cmVzdWx0cy5sb2NhbERlY2xhcmVUb0FjY2Vzc2VzLnNldChsb2NhbERlY2xhcmUsIFtdKVxuXHR9LFxuXG5cdHNldE5hbWUgPSBleHByID0+IHtcblx0XHRyZXN1bHRzLm5hbWVzLnNldChleHByLCBuYW1lKVxuXHR9XG5cbi8vIFRoZXNlIGZ1bmN0aW9ucyBjaGFuZ2UgdmVyaWZpZXIgc3RhdGUgYW5kIGVmZmljaWVudGx5IHJldHVybiB0byB0aGUgb2xkIHN0YXRlIHdoZW4gZmluaXNoZWQuXG5jb25zdFxuXHR3aXRoSW5HZW5lcmF0b3IgPSAobmV3SXNJbkdlbmVyYXRvciwgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgb2xkSXNJbkdlbmVyYXRvciA9IGlzSW5HZW5lcmF0b3Jcblx0XHRpc0luR2VuZXJhdG9yID0gbmV3SXNJbkdlbmVyYXRvclxuXHRcdGFjdGlvbigpXG5cdFx0aXNJbkdlbmVyYXRvciA9IG9sZElzSW5HZW5lcmF0b3Jcblx0fSxcblxuXHR3aXRoTG9vcCA9IChuZXdMb29wLCBhY3Rpb24pID0+IHtcblx0XHRjb25zdCBvbGRMb29wID0gb3BMb29wXG5cdFx0b3BMb29wID0gbmV3TG9vcFxuXHRcdGFjdGlvbigpXG5cdFx0b3BMb29wID0gb2xkTG9vcFxuXHR9LFxuXG5cdHdpdGhNZXRob2QgPSAobmV3TWV0aG9kLCBhY3Rpb24pID0+IHtcblx0XHRjb25zdCBvbGRNZXRob2QgPSBtZXRob2Rcblx0XHRtZXRob2QgPSBuZXdNZXRob2Rcblx0XHRhY3Rpb24oKVxuXHRcdG1ldGhvZCA9IG9sZE1ldGhvZFxuXHR9LFxuXG5cdHdpdGhOYW1lID0gKG5ld05hbWUsIGFjdGlvbikgPT4ge1xuXHRcdGNvbnN0IG9sZE5hbWUgPSBuYW1lXG5cdFx0bmFtZSA9IG5ld05hbWVcblx0XHRhY3Rpb24oKVxuXHRcdG5hbWUgPSBvbGROYW1lXG5cdH0sXG5cblx0Ly8gQ2FuJ3QgYnJlYWsgb3V0IG9mIGxvb3AgaW5zaWRlIG9mIElJRkUuXG5cdHdpdGhJSUZFID0gYWN0aW9uID0+IHtcblx0XHR3aXRoTG9vcChmYWxzZSwgYWN0aW9uKVxuXHR9LFxuXG5cdHBsdXNMb2NhbCA9IChhZGRlZExvY2FsLCBhY3Rpb24pID0+IHtcblx0XHRjb25zdCBzaGFkb3dlZCA9IGxvY2Fscy5nZXQoYWRkZWRMb2NhbC5uYW1lKVxuXHRcdGxvY2Fscy5zZXQoYWRkZWRMb2NhbC5uYW1lLCBhZGRlZExvY2FsKVxuXHRcdGFjdGlvbigpXG5cdFx0aWYgKHNoYWRvd2VkID09PSB1bmRlZmluZWQpXG5cdFx0XHRkZWxldGVMb2NhbChhZGRlZExvY2FsKVxuXHRcdGVsc2Vcblx0XHRcdHNldExvY2FsKHNoYWRvd2VkKVxuXHR9LFxuXG5cdC8vIFNob3VsZCBoYXZlIHZlcmlmaWVkIHRoYXQgYWRkZWRMb2NhbHMgYWxsIGhhdmUgZGlmZmVyZW50IG5hbWVzLlxuXHRwbHVzTG9jYWxzID0gKGFkZGVkTG9jYWxzLCBhY3Rpb24pID0+IHtcblx0XHRjb25zdCBzaGFkb3dlZExvY2FscyA9IFtdXG5cdFx0Zm9yIChjb25zdCBfIG9mIGFkZGVkTG9jYWxzKSB7XG5cdFx0XHRjb25zdCBzaGFkb3dlZCA9IGxvY2Fscy5nZXQoXy5uYW1lKVxuXHRcdFx0aWYgKHNoYWRvd2VkICE9PSB1bmRlZmluZWQpXG5cdFx0XHRcdHNoYWRvd2VkTG9jYWxzLnB1c2goc2hhZG93ZWQpXG5cdFx0XHRzZXRMb2NhbChfKVxuXHRcdH1cblxuXHRcdGFjdGlvbigpXG5cblx0XHRhZGRlZExvY2Fscy5mb3JFYWNoKGRlbGV0ZUxvY2FsKVxuXHRcdHNoYWRvd2VkTG9jYWxzLmZvckVhY2goc2V0TG9jYWwpXG5cdH0sXG5cblx0dmVyaWZ5QW5kUGx1c0xvY2FsID0gKGFkZGVkTG9jYWwsIGFjdGlvbikgPT4ge1xuXHRcdHZlcmlmeUxvY2FsRGVjbGFyZShhZGRlZExvY2FsKVxuXHRcdHBsdXNMb2NhbChhZGRlZExvY2FsLCBhY3Rpb24pXG5cdH0sXG5cblx0dmVyaWZ5QW5kUGx1c0xvY2FscyA9IChhZGRlZExvY2FscywgYWN0aW9uKSA9PiB7XG5cdFx0YWRkZWRMb2NhbHMuZm9yRWFjaCh2ZXJpZnlMb2NhbERlY2xhcmUpXG5cdFx0Y29uc3QgbmFtZXMgPSBuZXcgU2V0KClcblx0XHRmb3IgKGNvbnN0IF8gb2YgYWRkZWRMb2NhbHMpIHtcblx0XHRcdGNvbnRleHQuY2hlY2soIW5hbWVzLmhhcyhfLm5hbWUpLCBfLmxvYywgKCkgPT5cblx0XHRcdFx0YER1cGxpY2F0ZSBsb2NhbCAke2NvZGUoXy5uYW1lKX1gKVxuXHRcdFx0bmFtZXMuYWRkKF8ubmFtZSlcblx0XHR9XG5cdFx0cGx1c0xvY2FscyhhZGRlZExvY2FscywgYWN0aW9uKVxuXHR9LFxuXG5cdHdpdGhCbG9ja0xvY2FscyA9IGFjdGlvbiA9PiB7XG5cdFx0Y29uc3Qgb2xkUGVuZGluZ0Jsb2NrTG9jYWxzID0gcGVuZGluZ0Jsb2NrTG9jYWxzXG5cdFx0cGVuZGluZ0Jsb2NrTG9jYWxzID0gW11cblx0XHRwbHVzTG9jYWxzKG9sZFBlbmRpbmdCbG9ja0xvY2FscywgYWN0aW9uKVxuXHRcdHBlbmRpbmdCbG9ja0xvY2FscyA9IG9sZFBlbmRpbmdCbG9ja0xvY2Fsc1xuXHR9XG5cbmNvbnN0IHZlcmlmeUxvY2FsVXNlID0gKCkgPT4ge1xuXHRmb3IgKGNvbnN0IFtsb2NhbCwgYWNjZXNzZXNdIG9mIHJlc3VsdHMubG9jYWxEZWNsYXJlVG9BY2Nlc3Nlcylcblx0XHRpZiAoIShsb2NhbCBpbnN0YW5jZW9mIExvY2FsRGVjbGFyZUJ1aWx0IHx8IGxvY2FsIGluc3RhbmNlb2YgTG9jYWxEZWNsYXJlUmVzKSlcblx0XHRcdGNvbnRleHQud2FybklmKGlzRW1wdHkoYWNjZXNzZXMpICYmICFva1RvTm90VXNlLmhhcyhsb2NhbCksIGxvY2FsLmxvYywgKCkgPT5cblx0XHRcdFx0YFVudXNlZCBsb2NhbCB2YXJpYWJsZSAke2NvZGUobG9jYWwubmFtZSl9LmApXG59XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ3ZlcmlmeScsIHtcblx0QXNzZXJ0KCkge1xuXHRcdHRoaXMuY29uZGl0aW9uLnZlcmlmeSgpXG5cdFx0dmVyaWZ5T3BFYWNoKHRoaXMub3BUaHJvd24pXG5cdH0sXG5cblx0QXNzaWduU2luZ2xlKCkge1xuXHRcdHdpdGhOYW1lKHRoaXMuYXNzaWduZWUubmFtZSwgKCkgPT4ge1xuXHRcdFx0Y29uc3QgZG9WID0gKCkgPT4ge1xuXHRcdFx0XHQvKlxuXHRcdFx0XHRGdW4gYW5kIENsYXNzIG9ubHkgZ2V0IG5hbWUgaWYgdGhleSBhcmUgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIGFzc2lnbm1lbnQuXG5cdFx0XHRcdHNvIGluIGB4ID0gJGFmdGVyLXRpbWUgMTAwMCB8YCB0aGUgZnVuY3Rpb24gaXMgbm90IG5hbWVkLlxuXHRcdFx0XHQqL1xuXHRcdFx0XHRpZiAodGhpcy52YWx1ZSBpbnN0YW5jZW9mIENsYXNzIHx8IHRoaXMudmFsdWUgaW5zdGFuY2VvZiBGdW4pXG5cdFx0XHRcdFx0c2V0TmFtZSh0aGlzLnZhbHVlKVxuXG5cdFx0XHRcdC8vIEFzc2lnbmVlIHJlZ2lzdGVyZWQgYnkgdmVyaWZ5TGluZXMuXG5cdFx0XHRcdHRoaXMuYXNzaWduZWUudmVyaWZ5KClcblx0XHRcdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMuYXNzaWduZWUuaXNMYXp5KCkpXG5cdFx0XHRcdHdpdGhCbG9ja0xvY2Fscyhkb1YpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGRvVigpXG5cdFx0fSlcblx0fSxcblxuXHRBc3NpZ25EZXN0cnVjdHVyZSgpIHtcblx0XHQvLyBBc3NpZ25lZXMgcmVnaXN0ZXJlZCBieSB2ZXJpZnlMaW5lcy5cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hc3NpZ25lZXMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdEJhZ0VudHJ5OiB2ZXJpZnlCYWdFbnRyeSxcblx0QmFnRW50cnlNYW55OiB2ZXJpZnlCYWdFbnRyeSxcblxuXHRCYWdTaW1wbGUoKSB7XG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMucGFydHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0QmxvY2tEbygpIHtcblx0XHR2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHR9LFxuXG5cdEJsb2NrVmFsVGhyb3coKSB7XG5cdFx0Y29uc3QgbmV3TG9jYWxzID0gdmVyaWZ5TGluZXModGhpcy5saW5lcylcblx0XHRwbHVzTG9jYWxzKG5ld0xvY2FscywgKCkgPT4gdGhpcy50aHJvdy52ZXJpZnkoKSlcblx0fSxcblxuXHRCbG9ja1dpdGhSZXR1cm4oKSB7XG5cdFx0Y29uc3QgbmV3TG9jYWxzID0gdmVyaWZ5TGluZXModGhpcy5saW5lcylcblx0XHRwbHVzTG9jYWxzKG5ld0xvY2FscywgKCkgPT4gdGhpcy5yZXR1cm5lZC52ZXJpZnkoKSlcblx0fSxcblxuXG5cdEJsb2NrT2JqOiB2ZXJpZnlCbG9ja0J1aWxkLFxuXHRCbG9ja0JhZzogdmVyaWZ5QmxvY2tCdWlsZCxcblx0QmxvY2tNYXA6IHZlcmlmeUJsb2NrQnVpbGQsXG5cblx0QmxvY2tXcmFwKCkge1xuXHRcdHdpdGhJSUZFKCgpID0+IHRoaXMuYmxvY2sudmVyaWZ5KCkpXG5cdH0sXG5cblx0QnJlYWsoKSB7XG5cdFx0dmVyaWZ5SW5Mb29wKHRoaXMpXG5cdFx0Y29udGV4dC5jaGVjayghKG9wTG9vcCBpbnN0YW5jZW9mIEZvclZhbCksIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0YCR7Y29kZSgnZm9yJyl9IG11c3QgYnJlYWsgd2l0aCBhIHZhbHVlLmApXG5cdH0sXG5cblx0QnJlYWtXaXRoVmFsKCkge1xuXHRcdHZlcmlmeUluTG9vcCh0aGlzKVxuXHRcdGNvbnRleHQuY2hlY2sob3BMb29wIGluc3RhbmNlb2YgRm9yVmFsLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdGAke2NvZGUoJ2JyZWFrJyl9IG9ubHkgdmFsaWQgaW5zaWRlICR7Y29kZSgnZm9yJyl9YClcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0Q2FsbCgpIHtcblx0XHR0aGlzLmNhbGxlZC52ZXJpZnkoKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0Q2FzZURvKCkge1xuXHRcdHZlcmlmeUNhc2UodGhpcylcblx0fSxcblx0Q2FzZURvUGFydDogdmVyaWZ5Q2FzZVBhcnQsXG5cdENhc2VWYWwoKSB7XG5cdFx0d2l0aElJRkUoKCkgPT4gdmVyaWZ5Q2FzZSh0aGlzKSlcblx0fSxcblx0Q2FzZVZhbFBhcnQ6IHZlcmlmeUNhc2VQYXJ0LFxuXG5cdENhdGNoKCkge1xuXHRcdGNvbnRleHQuY2hlY2sodGhpcy5jYXVnaHQub3BUeXBlID09PSBudWxsLCB0aGlzLmNhdWdodC5sb2MsICdUT0RPOiBDYXVnaHQgdHlwZXMnKVxuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmNhdWdodCwgKCkgPT4gdGhpcy5ibG9jay52ZXJpZnkoKSlcblx0fSxcblxuXHRDbGFzcygpIHtcblx0XHR2ZXJpZnlPcEVhY2godGhpcy5vcFN1cGVyQ2xhc3MpXG5cdFx0dmVyaWZ5T3BFYWNoKHRoaXMub3BEbylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5zdGF0aWNzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdGlmICh0aGlzLm9wQ29uc3RydWN0b3IgIT09IG51bGwpXG5cdFx0XHR0aGlzLm9wQ29uc3RydWN0b3IudmVyaWZ5KHRoaXMub3BTdXBlckNsYXNzICE9PSBudWxsKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLm1ldGhvZHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0Ly8gbmFtZSBzZXQgYnkgQXNzaWduU2luZ2xlXG5cdH0sXG5cblx0Q2xhc3NEbygpIHtcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5kZWNsYXJlRm9jdXMsICgpID0+IHRoaXMuYmxvY2sudmVyaWZ5KCkpXG5cdH0sXG5cblx0Q29uZCgpIHtcblx0XHR0aGlzLnRlc3QudmVyaWZ5KClcblx0XHR0aGlzLmlmVHJ1ZS52ZXJpZnkoKVxuXHRcdHRoaXMuaWZGYWxzZS52ZXJpZnkoKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsRG8oKSB7XG5cdFx0dGhpcy50ZXN0LnZlcmlmeSgpXG5cdFx0dGhpcy5yZXN1bHQudmVyaWZ5KClcblx0fSxcblx0Q29uZGl0aW9uYWxWYWwoKSB7XG5cdFx0dGhpcy50ZXN0LnZlcmlmeSgpXG5cdFx0d2l0aElJRkUoKCkgPT4gdGhpcy5yZXN1bHQudmVyaWZ5KCkpXG5cdH0sXG5cblx0Q29uc3RydWN0b3IoY2xhc3NIYXNTdXBlcikge1xuXHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZnVuLm9wRGVjbGFyZVRoaXMpXG5cdFx0d2l0aE1ldGhvZCh0aGlzLCAoKSA9PiB7IHRoaXMuZnVuLnZlcmlmeSgpIH0pXG5cblx0XHRjb25zdCBzdXBlckNhbGwgPSByZXN1bHRzLmNvbnN0cnVjdG9yVG9TdXBlci5nZXQodGhpcylcblxuXHRcdGlmIChjbGFzc0hhc1N1cGVyKVxuXHRcdFx0Y29udGV4dC5jaGVjayhzdXBlckNhbGwgIT09IHVuZGVmaW5lZCwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRcdGBDb25zdHJ1Y3RvciBtdXN0IGNvbnRhaW4gJHtjb2RlKCdzdXBlciEnKX1gKVxuXHRcdGVsc2Vcblx0XHRcdGNvbnRleHQuY2hlY2soc3VwZXJDYWxsID09PSB1bmRlZmluZWQsICgpID0+IHN1cGVyQ2FsbC5sb2MsICgpID0+XG5cdFx0XHRcdGBDbGFzcyBoYXMgbm8gc3VwZXJjbGFzcywgc28gJHtjb2RlKCdzdXBlciEnKX0gaXMgbm90IGFsbG93ZWQuYClcblxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLm1lbWJlckFyZ3MpXG5cdFx0XHRzZXREZWNsYXJlQWNjZXNzZWQoXywgdGhpcylcblx0fSxcblxuXHRFeGNlcHREbzogdmVyaWZ5RXhjZXB0LFxuXHRFeGNlcHRWYWw6IHZlcmlmeUV4Y2VwdCxcblxuXHRGb3JCYWcoKSB7XG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuYnVpbHQsICgpID0+IHZlcmlmeUZvcih0aGlzKSlcblx0fSxcblxuXHRGb3JEbygpIHtcblx0XHR2ZXJpZnlGb3IodGhpcylcblx0fSxcblxuXHRGb3JWYWwoKSB7XG5cdFx0dmVyaWZ5Rm9yKHRoaXMpXG5cdH0sXG5cblx0RnVuKCkge1xuXHRcdHdpdGhCbG9ja0xvY2FscygoKSA9PiB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKHRoaXMub3BEZWNsYXJlUmVzID09PSBudWxsIHx8IHRoaXMuYmxvY2sgaW5zdGFuY2VvZiBCbG9ja1ZhbCwgdGhpcy5sb2MsXG5cdFx0XHRcdCdGdW5jdGlvbiB3aXRoIHJldHVybiBjb25kaXRpb24gbXVzdCByZXR1cm4gc29tZXRoaW5nLicpXG5cdFx0XHR3aXRoSW5HZW5lcmF0b3IodGhpcy5pc0dlbmVyYXRvciwgKCkgPT5cblx0XHRcdFx0d2l0aExvb3AobnVsbCwgKCkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGFsbEFyZ3MgPSBjYXQodGhpcy5vcERlY2xhcmVUaGlzLCB0aGlzLmFyZ3MsIHRoaXMub3BSZXN0QXJnKVxuXHRcdFx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoYWxsQXJncywgKCkgPT4ge1xuXHRcdFx0XHRcdFx0dmVyaWZ5T3BFYWNoKHRoaXMub3BJbilcblx0XHRcdFx0XHRcdHRoaXMuYmxvY2sudmVyaWZ5KClcblx0XHRcdFx0XHRcdG9wRWFjaCh0aGlzLm9wRGVjbGFyZVJlcywgdmVyaWZ5TG9jYWxEZWNsYXJlKVxuXHRcdFx0XHRcdFx0Y29uc3QgdmVyaWZ5T3V0ID0gKCkgPT4gdmVyaWZ5T3BFYWNoKHRoaXMub3BPdXQpXG5cdFx0XHRcdFx0XHRpZkVsc2UodGhpcy5vcERlY2xhcmVSZXMsIF8gPT4gcGx1c0xvY2FsKF8sIHZlcmlmeU91dCksIHZlcmlmeU91dClcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9KSlcblx0XHR9KVxuXHRcdC8vIG5hbWUgc2V0IGJ5IEFzc2lnblNpbmdsZVxuXHR9LFxuXG5cdElnbm9yZSgpIHtcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5pZ25vcmVkKVxuXHRcdFx0YWNjZXNzTG9jYWwodGhpcywgXylcblx0fSxcblxuXHRMYXp5KCkge1xuXHRcdHdpdGhCbG9ja0xvY2FscygoKSA9PiB0aGlzLnZhbHVlLnZlcmlmeSgpKVxuXHR9LFxuXG5cdExvY2FsQWNjZXNzKCkge1xuXHRcdGNvbnN0IGRlY2xhcmUgPSBsb2NhbHMuZ2V0KHRoaXMubmFtZSlcblx0XHRpZiAoZGVjbGFyZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjb25zdCBidWlsdGluUGF0aCA9IGNvbnRleHQub3B0cy5idWlsdGluTmFtZVRvUGF0aC5nZXQodGhpcy5uYW1lKVxuXHRcdFx0aWYgKGJ1aWx0aW5QYXRoID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdGZhaWxNaXNzaW5nTG9jYWwodGhpcy5sb2MsIHRoaXMubmFtZSlcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRjb25zdCBuYW1lcyA9IHJlc3VsdHMuYnVpbHRpblBhdGhUb05hbWVzLmdldChidWlsdGluUGF0aClcblx0XHRcdFx0aWYgKG5hbWVzID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdFx0cmVzdWx0cy5idWlsdGluUGF0aFRvTmFtZXMuc2V0KGJ1aWx0aW5QYXRoLCBuZXcgU2V0KFt0aGlzLm5hbWVdKSlcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdG5hbWVzLmFkZCh0aGlzLm5hbWUpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc3VsdHMubG9jYWxBY2Nlc3NUb0RlY2xhcmUuc2V0KHRoaXMsIGRlY2xhcmUpXG5cdFx0XHRzZXREZWNsYXJlQWNjZXNzZWQoZGVjbGFyZSwgdGhpcylcblx0XHR9XG5cdH0sXG5cblx0Ly8gQWRkaW5nIExvY2FsRGVjbGFyZXMgdG8gdGhlIGF2YWlsYWJsZSBsb2NhbHMgaXMgZG9uZSBieSBGdW4gb3IgbGluZU5ld0xvY2Fscy5cblx0TG9jYWxEZWNsYXJlKCkge1xuXHRcdGNvbnN0IGJ1aWx0aW5QYXRoID0gY29udGV4dC5vcHRzLmJ1aWx0aW5OYW1lVG9QYXRoLmdldCh0aGlzLm5hbWUpXG5cdFx0Y29udGV4dC53YXJuSWYoYnVpbHRpblBhdGggIT09IHVuZGVmaW5lZCwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRgTG9jYWwgJHtjb2RlKHRoaXMubmFtZSl9IG92ZXJyaWRlcyBidWlsdGluIGZyb20gJHtjb2RlKGJ1aWx0aW5QYXRoKX0uYClcblx0XHR2ZXJpZnlPcEVhY2godGhpcy5vcFR5cGUpXG5cdH0sXG5cblx0TG9jYWxNdXRhdGUoKSB7XG5cdFx0Y29uc3QgZGVjbGFyZSA9IGdldExvY2FsRGVjbGFyZSh0aGlzLm5hbWUsIHRoaXMubG9jKVxuXHRcdGNvbnRleHQuY2hlY2soZGVjbGFyZS5pc011dGFibGUoKSwgdGhpcy5sb2MsICgpID0+IGAke2NvZGUodGhpcy5uYW1lKX0gaXMgbm90IG11dGFibGUuYClcblx0XHQvLyBUT0RPOiBUcmFjayBtdXRhdGlvbnMuIE11dGFibGUgbG9jYWwgbXVzdCBiZSBtdXRhdGVkIHNvbWV3aGVyZS5cblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0TG9naWMoKSB7XG5cdFx0Y29udGV4dC5jaGVjayh0aGlzLmFyZ3MubGVuZ3RoID4gMSwgJ0xvZ2ljIGV4cHJlc3Npb24gbmVlZHMgYXQgbGVhc3QgMiBhcmd1bWVudHMuJylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hcmdzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHR9LFxuXG5cdE5vdCgpIHtcblx0XHR0aGlzLmFyZy52ZXJpZnkoKVxuXHR9LFxuXG5cdE51bWJlckxpdGVyYWwoKSB7IH0sXG5cblx0TWFwRW50cnkoKSB7XG5cdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR0aGlzLmtleS52ZXJpZnkoKVxuXHRcdHRoaXMudmFsLnZlcmlmeSgpXG5cdH0sXG5cblx0TWVtYmVyKCkge1xuXHRcdHRoaXMub2JqZWN0LnZlcmlmeSgpXG5cdH0sXG5cblx0TWVtYmVyU2V0KCkge1xuXHRcdHRoaXMub2JqZWN0LnZlcmlmeSgpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdE1ldGhvZEltcGwoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kKHRoaXMsICgpID0+IHtcblx0XHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZnVuLm9wRGVjbGFyZVRoaXMpXG5cdFx0XHR0aGlzLmZ1bi52ZXJpZnkoKVxuXHRcdH0pXG5cdH0sXG5cdE1ldGhvZEdldHRlcigpIHtcblx0XHR2ZXJpZnlNZXRob2QodGhpcywgKCkgPT4ge1xuXHRcdFx0b2tUb05vdFVzZS5hZGQodGhpcy5kZWNsYXJlVGhpcylcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoW3RoaXMuZGVjbGFyZVRoaXNdLCAoKSA9PiB7IHRoaXMuYmxvY2sudmVyaWZ5KCkgfSlcblx0XHR9KVxuXHR9LFxuXHRNZXRob2RTZXR0ZXIoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kKHRoaXMsICgpID0+IHtcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoW3RoaXMuZGVjbGFyZVRoaXMsIHRoaXMuZGVjbGFyZUZvY3VzXSwgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeSgpXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH0sXG5cblx0TW9kdWxlKCkge1xuXHRcdC8vIE5vIG5lZWQgdG8gdmVyaWZ5IHRoaXMuZG9JbXBvcnRzLlxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmltcG9ydHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0dmVyaWZ5T3BFYWNoKHRoaXMub3BJbXBvcnRHbG9iYWwpXG5cblx0XHR3aXRoTmFtZShjb250ZXh0Lm9wdHMubW9kdWxlTmFtZSgpLCAoKSA9PiB7XG5cdFx0XHR2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHRcdH0pXG5cdH0sXG5cblx0TW9kdWxlRXhwb3J0KCkge1xuXHRcdHRoaXMuYXNzaWduLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXNzaWduLmFsbEFzc2lnbmVlcygpKVxuXHRcdFx0c2V0RGVjbGFyZUFjY2Vzc2VkKF8sIHRoaXMpXG5cdH0sXG5cblx0TmV3KCkge1xuXHRcdHRoaXMudHlwZS52ZXJpZnkoKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0T2JqRW50cnlBc3NpZ24oKSB7XG5cdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR0aGlzLmFzc2lnbi52ZXJpZnkoKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFzc2lnbi5hbGxBc3NpZ25lZXMoKSlcblx0XHRcdHNldERlY2xhcmVBY2Nlc3NlZChfLCB0aGlzKVxuXHR9LFxuXG5cdE9iakVudHJ5Q29tcHV0ZWQoKSB7XG5cdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR0aGlzLmtleS52ZXJpZnkoKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0fSxcblxuXHRPYmpTaW1wbGUoKSB7XG5cdFx0Y29uc3Qga2V5cyA9IG5ldyBTZXQoKVxuXHRcdGZvciAoY29uc3QgcGFpciBvZiB0aGlzLnBhaXJzKSB7XG5cdFx0XHRjb25zdCB7a2V5LCB2YWx1ZX0gPSBwYWlyXG5cdFx0XHRjb250ZXh0LmNoZWNrKCFrZXlzLmhhcyhrZXkpLCBwYWlyLmxvYywgKCkgPT4gYER1cGxpY2F0ZSBrZXkgJHtrZXl9YClcblx0XHRcdGtleXMuYWRkKGtleSlcblx0XHRcdHZhbHVlLnZlcmlmeSgpXG5cdFx0fVxuXHR9LFxuXG5cdFF1b3RlKCkge1xuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLnBhcnRzKVxuXHRcdFx0aWYgKHR5cGVvZiBfICE9PSAnc3RyaW5nJylcblx0XHRcdFx0Xy52ZXJpZnkoKVxuXHR9LFxuXG5cdFF1b3RlVGVtcGxhdGUoKSB7XG5cdFx0dGhpcy50YWcudmVyaWZ5KClcblx0XHR0aGlzLnF1b3RlLnZlcmlmeSgpXG5cdH0sXG5cblx0U3BlY2lhbERvKCkgeyB9LFxuXG5cdFNwZWNpYWxWYWwoKSB7XG5cdFx0c2V0TmFtZSh0aGlzKVxuXHR9LFxuXG5cdFNwbGF0KCkge1xuXHRcdHRoaXMuc3BsYXR0ZWQudmVyaWZ5KClcblx0fSxcblxuXHRTdXBlckNhbGw6IHZlcmlmeVN1cGVyQ2FsbCxcblx0U3VwZXJDYWxsRG86IHZlcmlmeVN1cGVyQ2FsbCxcblx0U3VwZXJNZW1iZXIoKSB7XG5cdFx0Y29udGV4dC5jaGVjayhtZXRob2QgIT09IG51bGwsIHRoaXMubG9jLCAnTXVzdCBiZSBpbiBtZXRob2QuJylcblx0fSxcblxuXHRTd2l0Y2hEbygpIHtcblx0XHR2ZXJpZnlTd2l0Y2godGhpcylcblx0fSxcblx0U3dpdGNoRG9QYXJ0OiB2ZXJpZnlTd2l0Y2hQYXJ0LFxuXHRTd2l0Y2hWYWwoKSB7XG5cdFx0d2l0aElJRkUoKCkgPT4gdmVyaWZ5U3dpdGNoKHRoaXMpKVxuXHR9LFxuXHRTd2l0Y2hWYWxQYXJ0OiB2ZXJpZnlTd2l0Y2hQYXJ0LFxuXG5cdFRocm93KCkge1xuXHRcdHZlcmlmeU9wRWFjaCh0aGlzLm9wVGhyb3duKVxuXHR9LFxuXG5cdEltcG9ydDogdmVyaWZ5SW1wb3J0LFxuXHRJbXBvcnRHbG9iYWw6IHZlcmlmeUltcG9ydCxcblxuXHRXaXRoKCkge1xuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0XHR3aXRoSUlGRSgoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5kZWNsYXJlIGluc3RhbmNlb2YgTG9jYWxEZWNsYXJlRm9jdXMpXG5cdFx0XHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZGVjbGFyZSlcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmRlY2xhcmUsICgpID0+IHsgdGhpcy5ibG9jay52ZXJpZnkoKSB9KVxuXHRcdH0pXG5cdH0sXG5cblx0WWllbGQoKSB7XG5cdFx0Y29udGV4dC5jaGVjayhpc0luR2VuZXJhdG9yLCB0aGlzLmxvYywgJ0Nhbm5vdCB5aWVsZCBvdXRzaWRlIG9mIGdlbmVyYXRvciBjb250ZXh0Jylcblx0XHR2ZXJpZnlPcEVhY2godGhpcy5vcFlpZWxkZWQpXG5cdH0sXG5cblx0WWllbGRUbygpIHtcblx0XHRjb250ZXh0LmNoZWNrKGlzSW5HZW5lcmF0b3IsIHRoaXMubG9jLCAnQ2Fubm90IHlpZWxkIG91dHNpZGUgb2YgZ2VuZXJhdG9yIGNvbnRleHQnKVxuXHRcdHRoaXMueWllbGRlZFRvLnZlcmlmeSgpXG5cdH1cbn0pXG5cbmZ1bmN0aW9uIHZlcmlmeUJhZ0VudHJ5KCkge1xuXHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHR0aGlzLnZhbHVlLnZlcmlmeSgpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeUJsb2NrQnVpbGQoKSB7XG5cdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmJ1aWx0LCAoKSA9PiB7XG5cdFx0dmVyaWZ5TGluZXModGhpcy5saW5lcylcblx0fSlcbn1cblxuZnVuY3Rpb24gdmVyaWZ5Q2FzZVBhcnQoKSB7XG5cdGlmICh0aGlzLnRlc3QgaW5zdGFuY2VvZiBQYXR0ZXJuKSB7XG5cdFx0dGhpcy50ZXN0LnR5cGUudmVyaWZ5KClcblx0XHR0aGlzLnRlc3QucGF0dGVybmVkLnZlcmlmeSgpXG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2Fscyh0aGlzLnRlc3QubG9jYWxzLCAoKSA9PiB0aGlzLnJlc3VsdC52ZXJpZnkoKSlcblx0fSBlbHNlIHtcblx0XHR0aGlzLnRlc3QudmVyaWZ5KClcblx0XHR0aGlzLnJlc3VsdC52ZXJpZnkoKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHZlcmlmeVN3aXRjaFBhcnQoKSB7XG5cdGZvciAoY29uc3QgXyBvZiB0aGlzLnZhbHVlcylcblx0XHRfLnZlcmlmeSgpXG5cdHRoaXMucmVzdWx0LnZlcmlmeSgpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeUV4Y2VwdCgpIHtcblx0dGhpcy5fdHJ5LnZlcmlmeSgpXG5cdHZlcmlmeU9wRWFjaCh0aGlzLl9jYXRjaClcblx0dmVyaWZ5T3BFYWNoKHRoaXMuX2ZpbmFsbHkpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeVN1cGVyQ2FsbCgpIHtcblx0Y29udGV4dC5jaGVjayhtZXRob2QgIT09IG51bGwsIHRoaXMubG9jLCAnTXVzdCBiZSBpbiBhIG1ldGhvZC4nKVxuXHRyZXN1bHRzLnN1cGVyQ2FsbFRvTWV0aG9kLnNldCh0aGlzLCBtZXRob2QpXG5cblx0aWYgKG1ldGhvZCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB7XG5cdFx0Y29udGV4dC5jaGVjayh0aGlzIGluc3RhbmNlb2YgU3VwZXJDYWxsRG8sIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0YCR7Y29kZSgnc3VwZXInKX0gbm90IHN1cHBvcnRlZCBpbiBjb25zdHJ1Y3RvcjsgdXNlICR7Y29kZSgnc3VwZXIhJyl9YClcblx0XHRyZXN1bHRzLmNvbnN0cnVjdG9yVG9TdXBlci5zZXQobWV0aG9kLCB0aGlzKVxuXHR9XG5cblx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRfLnZlcmlmeSgpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeUltcG9ydCgpIHtcblx0Ly8gU2luY2UgVXNlcyBhcmUgYWx3YXlzIGluIHRoZSBvdXRlcm1vc3Qgc2NvcGUsIGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgc2hhZG93aW5nLlxuXHQvLyBTbyB3ZSBtdXRhdGUgYGxvY2Fsc2AgZGlyZWN0bHkuXG5cdGNvbnN0IGFkZFVzZUxvY2FsID0gXyA9PiB7XG5cdFx0Y29uc3QgcHJldiA9IGxvY2Fscy5nZXQoXy5uYW1lKVxuXHRcdGNvbnRleHQuY2hlY2socHJldiA9PT0gdW5kZWZpbmVkLCBfLmxvYywgKCkgPT5cblx0XHRcdGAke2NvZGUoXy5uYW1lKX0gYWxyZWFkeSBpbXBvcnRlZCBhdCAke3ByZXYubG9jfWApXG5cdFx0dmVyaWZ5TG9jYWxEZWNsYXJlKF8pXG5cdFx0c2V0TG9jYWwoXylcblx0fVxuXHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5pbXBvcnRlZClcblx0XHRhZGRVc2VMb2NhbChfKVxuXHRvcEVhY2godGhpcy5vcEltcG9ydERlZmF1bHQsIGFkZFVzZUxvY2FsKVxufVxuXG4vLyBIZWxwZXJzIHNwZWNpZmljIHRvIGNlcnRhaW4gTXNBc3QgdHlwZXM6XG5jb25zdFxuXHR2ZXJpZnlGb3IgPSBmb3JMb29wID0+IHtcblx0XHRjb25zdCB2ZXJpZnlCbG9jayA9ICgpID0+IHdpdGhMb29wKGZvckxvb3AsICgpID0+IGZvckxvb3AuYmxvY2sudmVyaWZ5KCkpXG5cdFx0aWZFbHNlKGZvckxvb3Aub3BJdGVyYXRlZSxcblx0XHRcdCh7ZWxlbWVudCwgYmFnfSkgPT4ge1xuXHRcdFx0XHRiYWcudmVyaWZ5KClcblx0XHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKGVsZW1lbnQsIHZlcmlmeUJsb2NrKVxuXHRcdFx0fSxcblx0XHRcdHZlcmlmeUJsb2NrKVxuXHR9LFxuXG5cdHZlcmlmeUluTG9vcCA9IGxvb3BVc2VyID0+XG5cdFx0Y29udGV4dC5jaGVjayhvcExvb3AgIT09IG51bGwsIGxvb3BVc2VyLmxvYywgJ05vdCBpbiBhIGxvb3AuJyksXG5cblxuXHR2ZXJpZnlDYXNlID0gXyA9PiB7XG5cdFx0Y29uc3QgZG9JdCA9ICgpID0+IHtcblx0XHRcdGZvciAoY29uc3QgcGFydCBvZiBfLnBhcnRzKVxuXHRcdFx0XHRwYXJ0LnZlcmlmeSgpXG5cdFx0XHR2ZXJpZnlPcEVhY2goXy5vcEVsc2UpXG5cdFx0fVxuXHRcdGlmRWxzZShfLm9wQ2FzZWQsXG5cdFx0XHRfID0+IHtcblx0XHRcdFx0Xy52ZXJpZnkoKVxuXHRcdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwoXy5hc3NpZ25lZSwgZG9JdClcblx0XHRcdH0sXG5cdFx0XHRkb0l0KVxuXHR9LFxuXG5cdHZlcmlmeU1ldGhvZCA9IChfLCBkb1ZlcmlmeSkgPT4ge1xuXHRcdGlmICh0eXBlb2YgXy5zeW1ib2wgIT09ICdzdHJpbmcnKVxuXHRcdFx0Xy5zeW1ib2wudmVyaWZ5KClcblx0XHR3aXRoTWV0aG9kKF8sIGRvVmVyaWZ5KVxuXHR9LFxuXG5cdHZlcmlmeVN3aXRjaCA9IF8gPT4ge1xuXHRcdF8uc3dpdGNoZWQudmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IHBhcnQgb2YgXy5wYXJ0cylcblx0XHRcdHBhcnQudmVyaWZ5KClcblx0XHR2ZXJpZnlPcEVhY2goXy5vcEVsc2UpXG5cdH1cblxuLy8gR2VuZXJhbCB1dGlsaXRpZXM6XG5jb25zdFxuXHRnZXRMb2NhbERlY2xhcmUgPSAobmFtZSwgYWNjZXNzTG9jKSA9PiB7XG5cdFx0Y29uc3QgZGVjbGFyZSA9IGxvY2Fscy5nZXQobmFtZSlcblx0XHRpZiAoZGVjbGFyZSA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0ZmFpbE1pc3NpbmdMb2NhbChhY2Nlc3NMb2MsIG5hbWUpXG5cdFx0cmV0dXJuIGRlY2xhcmVcblx0fSxcblxuXHRmYWlsTWlzc2luZ0xvY2FsID0gKGxvYywgbmFtZSkgPT4ge1xuXHRcdGNvbnRleHQuZmFpbChsb2MsICgpID0+IHtcblx0XHRcdC8vIFRPRE86RVM2IGBBcnJheS5mcm9tKGxvY2Fscy5rZXlzKCkpYCBzaG91bGQgd29ya1xuXHRcdFx0Y29uc3Qga2V5cyA9IFtdXG5cdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBsb2NhbHMua2V5cygpKVxuXHRcdFx0XHRrZXlzLnB1c2goa2V5KVxuXHRcdFx0Y29uc3Qgc2hvd0xvY2FscyA9IGNvZGUoa2V5cy5qb2luKCcgJykpXG5cdFx0XHRyZXR1cm4gYE5vIHN1Y2ggbG9jYWwgJHtjb2RlKG5hbWUpfS5cXG5Mb2NhbHMgYXJlOlxcbiR7c2hvd0xvY2Fsc30uYFxuXHRcdH0pXG5cdH0sXG5cblx0bGluZU5ld0xvY2FscyA9IGxpbmUgPT5cblx0XHRsaW5lIGluc3RhbmNlb2YgQXNzaWduU2luZ2xlID9cblx0XHRcdFtsaW5lLmFzc2lnbmVlXSA6XG5cdFx0XHRsaW5lIGluc3RhbmNlb2YgQXNzaWduRGVzdHJ1Y3R1cmUgP1xuXHRcdFx0bGluZS5hc3NpZ25lZXMgOlxuXHRcdFx0bGluZSBpbnN0YW5jZW9mIE9iakVudHJ5ID9cblx0XHRcdGxpbmVOZXdMb2NhbHMobGluZS5hc3NpZ24pIDpcblx0XHRcdGxpbmUgaW5zdGFuY2VvZiBNb2R1bGVFeHBvcnQgP1xuXHRcdFx0bGluZU5ld0xvY2FscyhsaW5lLmFzc2lnbikgOlxuXHRcdFx0W10sXG5cblx0dmVyaWZ5TGluZXMgPSBsaW5lcyA9PiB7XG5cdFx0Lypcblx0XHRXZSBuZWVkIHRvIGJldCBhbGwgYmxvY2sgbG9jYWxzIHVwLWZyb250IGJlY2F1c2Vcblx0XHRGdW5jdGlvbnMgd2l0aGluIGxpbmVzIGNhbiBhY2Nlc3MgbG9jYWxzIGZyb20gbGF0ZXIgbGluZXMuXG5cdFx0Tk9URTogV2UgcHVzaCB0aGVzZSBvbnRvIHBlbmRpbmdCbG9ja0xvY2FscyBpbiByZXZlcnNlXG5cdFx0c28gdGhhdCB3aGVuIHdlIGl0ZXJhdGUgdGhyb3VnaCBsaW5lcyBmb3J3YXJkcywgd2UgY2FuIHBvcCBmcm9tIHBlbmRpbmdCbG9ja0xvY2Fsc1xuXHRcdHRvIHJlbW92ZSBwZW5kaW5nIGxvY2FscyBhcyB0aGV5IGJlY29tZSByZWFsIGxvY2Fscy5cblx0XHRJdCBkb2Vzbid0IHJlYWxseSBtYXR0ZXIgd2hhdCBvcmRlciB3ZSBhZGQgbG9jYWxzIGluIHNpbmNlIGl0J3Mgbm90IGFsbG93ZWRcblx0XHR0byBoYXZlIHR3byBsb2NhbHMgb2YgdGhlIHNhbWUgbmFtZSBpbiB0aGUgc2FtZSBibG9jay5cblx0XHQqL1xuXHRcdGNvbnN0IG5ld0xvY2FscyA9IFtdXG5cblx0XHRjb25zdCBnZXRMaW5lTG9jYWxzID0gbGluZSA9PiB7XG5cdFx0XHRmb3IgKGNvbnN0IF8gb2YgcmV2ZXJzZUl0ZXIobGluZU5ld0xvY2FscyhsaW5lKSkpIHtcblx0XHRcdFx0Ly8gUmVnaXN0ZXIgdGhlIGxvY2FsIG5vdy4gQ2FuJ3Qgd2FpdCB1bnRpbCB0aGUgYXNzaWduIGlzIHZlcmlmaWVkLlxuXHRcdFx0XHRyZWdpc3RlckxvY2FsKF8pXG5cdFx0XHRcdG5ld0xvY2Fscy5wdXNoKF8pXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGZvciAoY29uc3QgXyBvZiByZXZlcnNlSXRlcihsaW5lcykpXG5cdFx0XHRnZXRMaW5lTG9jYWxzKF8pXG5cdFx0cGVuZGluZ0Jsb2NrTG9jYWxzLnB1c2goLi4ubmV3TG9jYWxzKVxuXG5cdFx0Lypcblx0XHRLZWVwcyB0cmFjayBvZiBsb2NhbHMgd2hpY2ggaGF2ZSBhbHJlYWR5IGJlZW4gYWRkZWQgaW4gdGhpcyBibG9jay5cblx0XHRNYXNvbiBhbGxvd3Mgc2hhZG93aW5nLCBidXQgbm90IHdpdGhpbiB0aGUgc2FtZSBibG9jay5cblx0XHRTbywgdGhpcyBpcyBhbGxvd2VkOlxuXHRcdFx0YSA9IDFcblx0XHRcdGIgPVxuXHRcdFx0XHRhID0gMlxuXHRcdFx0XHQuLi5cblx0XHRCdXQgbm90OlxuXHRcdFx0YSA9IDFcblx0XHRcdGEgPSAyXG5cdFx0Ki9cblx0XHRjb25zdCB0aGlzQmxvY2tMb2NhbE5hbWVzID0gbmV3IFNldCgpXG5cblx0XHQvLyBBbGwgc2hhZG93ZWQgbG9jYWxzIGZvciB0aGlzIGJsb2NrLlxuXHRcdGNvbnN0IHNoYWRvd2VkID0gW11cblxuXHRcdGNvbnN0IHZlcmlmeUxpbmUgPSBsaW5lID0+IHtcblx0XHRcdHZlcmlmeUlzU3RhdGVtZW50KGxpbmUpXG5cdFx0XHRmb3IgKGNvbnN0IG5ld0xvY2FsIG9mIGxpbmVOZXdMb2NhbHMobGluZSkpIHtcblx0XHRcdFx0Y29uc3QgbmFtZSA9IG5ld0xvY2FsLm5hbWVcblx0XHRcdFx0Y29uc3Qgb2xkTG9jYWwgPSBsb2NhbHMuZ2V0KG5hbWUpXG5cdFx0XHRcdGlmIChvbGRMb2NhbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayghdGhpc0Jsb2NrTG9jYWxOYW1lcy5oYXMobmFtZSksIG5ld0xvY2FsLmxvYyxcblx0XHRcdFx0XHRcdCgpID0+IGBBIGxvY2FsICR7Y29kZShuYW1lKX0gaXMgYWxyZWFkeSBpbiB0aGlzIGJsb2NrLmApXG5cdFx0XHRcdFx0c2hhZG93ZWQucHVzaChvbGRMb2NhbClcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzQmxvY2tMb2NhbE5hbWVzLmFkZChuYW1lKVxuXHRcdFx0XHRzZXRMb2NhbChuZXdMb2NhbClcblxuXHRcdFx0XHQvLyBOb3cgdGhhdCBpdCdzIGFkZGVkIGFzIGEgbG9jYWwsIGl0J3Mgbm8gbG9uZ2VyIHBlbmRpbmcuXG5cdFx0XHRcdC8vIFdlIGFkZGVkIHBlbmRpbmdCbG9ja0xvY2FscyBpbiB0aGUgcmlnaHQgb3JkZXIgdGhhdCB3ZSBjYW4ganVzdCBwb3AgdGhlbSBvZmYuXG5cdFx0XHRcdGNvbnN0IHBvcHBlZCA9IHBlbmRpbmdCbG9ja0xvY2Fscy5wb3AoKVxuXHRcdFx0XHRhc3NlcnQocG9wcGVkID09PSBuZXdMb2NhbClcblx0XHRcdH1cblx0XHRcdGxpbmUudmVyaWZ5KClcblx0XHR9XG5cblx0XHRsaW5lcy5mb3JFYWNoKHZlcmlmeUxpbmUpXG5cblx0XHRuZXdMb2NhbHMuZm9yRWFjaChkZWxldGVMb2NhbClcblx0XHRzaGFkb3dlZC5mb3JFYWNoKHNldExvY2FsKVxuXG5cdFx0cmV0dXJuIG5ld0xvY2Fsc1xuXHR9LFxuXG5cdHZlcmlmeUlzU3RhdGVtZW50ID0gbGluZSA9PiB7XG5cdFx0Y29uc3QgaXNTdGF0ZW1lbnQgPVxuXHRcdFx0bGluZSBpbnN0YW5jZW9mIERvIHx8XG5cdFx0XHQvLyBTb21lIHZhbHVlcyBhcmUgYWxzbyBhY2NlcHRhYmxlLlxuXHRcdFx0bGluZSBpbnN0YW5jZW9mIENhbGwgfHxcblx0XHRcdGxpbmUgaW5zdGFuY2VvZiBZaWVsZCB8fFxuXHRcdFx0bGluZSBpbnN0YW5jZW9mIFlpZWxkVG9cblx0XHRjb250ZXh0LmNoZWNrKGlzU3RhdGVtZW50LCBsaW5lLmxvYywgJ0V4cHJlc3Npb24gaW4gc3RhdGVtZW50IHBvc2l0aW9uLicpXG5cdH1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

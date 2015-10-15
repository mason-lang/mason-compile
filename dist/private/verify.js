if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../CompileError', './context', './MsAst', './util', './VerifyResults'], function (exports, module, _CompileError, _context, _MsAst, _util, _VerifyResults) {
	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _VerifyResults2 = _interopRequireDefault(_VerifyResults);

	/*
 The verifier generates information needed during transpiling, the VerifyResults.
 */

	module.exports = msAst => {
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
		locals = okToNotUse = opLoop = pendingBlockLocals = method = results = null;
		return res;
	};

	// Use a trick like in parse.js and have everything close over these mutable variables.
	let
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

	const verifyOp = _ => {
		if (_ !== null) _.verify();
	},
	      verifyName = _ => {
		if (typeof _ !== 'string') _.verify();
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
			(0, _context.check)(!names.has(_.name), _.loc, () => `Duplicate local ${ (0, _CompileError.code)(_.name) }`);
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

			if (!(local instanceof _MsAst.LocalDeclareBuilt || local instanceof _MsAst.LocalDeclareRes)) (0, _context.warnIf)((0, _util.isEmpty)(accesses) && !okToNotUse.has(local), local.loc, () => `Unused local variable ${ (0, _CompileError.code)(local.name) }.`);
		}
	};

	(0, _util.implementMany)(_MsAst, 'verify', {
		Assert() {
			this.condition.verify();
			verifyOp(this.opThrown);
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
			(0, _context.check)(!(opLoop instanceof _MsAst.ForVal), this.loc, () => `${ (0, _CompileError.code)('for') } must break with a value.`);
		},

		BreakWithVal() {
			verifyInLoop(this);
			(0, _context.check)(opLoop instanceof _MsAst.ForVal, this.loc, () => `${ (0, _CompileError.code)('break') } only valid inside ${ (0, _CompileError.code)('for') }`);
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
			(0, _context.check)(this.caught.opType === null, this.caught.loc, 'TODO: Caught types');
			verifyAndPlusLocal(this.caught, () => this.block.verify());
		},

		Class() {
			verifyOp(this.opSuperClass);
			verifyOp(this.opDo);
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

			if (classHasSuper) (0, _context.check)(superCall !== undefined, this.loc, () => `Constructor must contain ${ (0, _CompileError.code)('super!') }`);else (0, _context.check)(superCall === undefined, () => superCall.loc, () => `Class has no superclass, so ${ (0, _CompileError.code)('super!') } is not allowed.`);

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
				(0, _context.check)(this.opDeclareRes === null || this.block instanceof _MsAst.BlockVal, this.loc, 'Function with return condition must return something.');
				withInGenerator(this.isGenerator, () => withLoop(null, () => {
					const allArgs = (0, _util.cat)(this.opDeclareThis, this.args, this.opRestArg);
					verifyAndPlusLocals(allArgs, () => {
						this.block.verify();
						(0, _util.opEach)(this.opDeclareRes, verifyLocalDeclare);
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
				const builtinPath = _context.options.builtinNameToPath.get(this.name);
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
			const builtinPath = _context.options.builtinNameToPath.get(this.name);
			(0, _context.warnIf)(builtinPath !== undefined, this.loc, () => `Local ${ (0, _CompileError.code)(this.name) } overrides builtin from ${ (0, _CompileError.code)(builtinPath) }.`);
			verifyOp(this.opType);
		},

		LocalMutate() {
			const declare = getLocalDeclare(this.name, this.loc);
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
			accessLocal(this, 'built');
			this.key.verify();
			this.val.verify();
		},

		Member() {
			this.object.verify();
			verifyName(this.name);
		},

		MemberSet() {
			this.object.verify();
			verifyName(this.name);
			verifyOp(this.opType);
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
			verifyOp(this.opImportGlobal);

			withName(_context.options.moduleName(), () => {
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

		ObjEntryPlain() {
			accessLocal(this, 'built');
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

		Quote() {
			for (const _ of this.parts) verifyName(_);
		},

		QuoteTemplate() {
			this.tag.verify();
			this.quote.verify();
		},

		SetSub() {
			this.object.verify();
			for (const _ of this.subbeds) _.verify();
			verifyOp(this.opType);
			this.value.verify();
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
			(0, _context.check)(method !== null, this.loc, 'Must be in method.');
			verifyName(this.name);
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
			verifyOp(this.opThrown);
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
			(0, _context.check)(isInGenerator, this.loc, 'Cannot yield outside of generator context');
			verifyOp(this.opYielded);
		},

		YieldTo() {
			(0, _context.check)(isInGenerator, this.loc, 'Cannot yield outside of generator context');
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
		verifyOp(this._catch);
		verifyOp(this._finally);
	}

	function verifySuperCall() {
		(0, _context.check)(method !== null, this.loc, 'Must be in a method.');
		results.superCallToMethod.set(this, method);

		if (method instanceof _MsAst.Constructor) {
			(0, _context.check)(this instanceof _MsAst.SuperCallDo, this.loc, () => `${ (0, _CompileError.code)('super') } not supported in constructor; use ${ (0, _CompileError.code)('super!') }`);
			results.constructorToSuper.set(method, this);
		}

		for (const _ of this.args) _.verify();
	}

	function verifyImport() {
		// Since Uses are always in the outermost scope, don't have to worry about shadowing.
		// So we mutate `locals` directly.
		const addUseLocal = _ => {
			const prev = locals.get(_.name);
			(0, _context.check)(prev === undefined, _.loc, () => `${ (0, _CompileError.code)(_.name) } already imported at ${ prev.loc }`);
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
	      verifyInLoop = loopUser => (0, _context.check)(opLoop !== null, loopUser.loc, 'Not in a loop.'),
	      verifyCase = _ => {
		const doIt = () => {
			for (const part of _.parts) part.verify();
			verifyOp(_.opElse);
		};
		(0, _util.ifElse)(_.opCased, _ => {
			_.verify();
			verifyAndPlusLocal(_.assignee, doIt);
		}, doIt);
	},
	      verifyMethod = (_, doVerify) => {
		verifyName(_.symbol);
		withMethod(_, doVerify);
	},
	      verifySwitch = _ => {
		_.switched.verify();
		for (const part of _.parts) part.verify();
		verifyOp(_.opElse);
	};

	// General utilities:
	const getLocalDeclare = (name, accessLoc) => {
		const declare = locals.get(name);
		if (declare === undefined) failMissingLocal(accessLoc, name);
		return declare;
	},
	      failMissingLocal = (loc, name) => {
		(0, _context.fail)(loc, () => {
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
					(0, _context.check)(!thisBlockLocalNames.has(name), newLocal.loc, () => `A local ${ (0, _CompileError.code)(name) } is already in this block.`);
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
		(0, _context.check)(isStatement, line.loc, 'Expression in statement position.');
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZlcmlmeS5qcyIsInByaXZhdGUvdmVyaWZ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O2tCQ1llLEtBQUssSUFBSTtBQUN2QixRQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUNsQixvQkFBa0IsR0FBRyxFQUFFLENBQUE7QUFDdkIsZUFBYSxHQUFHLEtBQUssQ0FBQTtBQUNyQixZQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUN0QixRQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2IsUUFBTSxHQUFHLElBQUksQ0FBQTtBQUNiLFNBQU8sR0FBRyw2QkFBbUIsQ0FBQTs7QUFFN0IsT0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBQ2QsZ0JBQWMsRUFBRSxDQUFBOztBQUVoQixRQUFNLEdBQUcsR0FBRyxPQUFPLENBQUE7O0FBRW5CLFFBQU0sR0FBRyxVQUFVLEdBQUcsTUFBTSxHQUFHLGtCQUFrQixHQUFHLE1BQU0sR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFBO0FBQzNFLFNBQU8sR0FBRyxDQUFBO0VBQ1Y7OztBQUdEOztBQUVDLE9BQU07O0FBRU4sV0FBVSxFQUNWLE1BQU07Ozs7Ozs7Ozs7Ozs7OztBQWVOLG1CQUFrQjs7QUFFbEIsY0FBYTs7QUFFYixPQUFNLEVBQ04sT0FBTzs7QUFFUCxLQUFJLENBQUE7O0FBRUwsT0FDQyxRQUFRLEdBQUcsQ0FBQyxJQUFJO0FBQ2YsTUFBSSxDQUFDLEtBQUssSUFBSSxFQUNiLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtFQUNYO09BRUQsVUFBVSxHQUFHLENBQUMsSUFBSTtBQUNqQixNQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVEsRUFDeEIsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFBO0VBQ1g7T0FFRCxXQUFXLEdBQUcsWUFBWSxJQUN6QixNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7T0FFakMsUUFBUSxHQUFHLFlBQVksSUFDdEIsTUFB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RSxtQ0FBbUMsQ0FBQyxDQUFBO0VBQ2pFLENBQUEiLCJmaWxlIjoicHJpdmF0ZS92ZXJpZnkuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVjaywgZmFpbCwgb3B0aW9ucywgd2FybklmfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4vTXNBc3QnXG5pbXBvcnQge0Fzc2lnbkRlc3RydWN0dXJlLCBBc3NpZ25TaW5nbGUsIEJsb2NrVmFsLCBDYWxsLCBDbGFzcywgQ29uc3RydWN0b3IsIERvLCBGb3JWYWwsIEZ1bixcblx0TG9jYWxEZWNsYXJlQnVpbHQsIExvY2FsRGVjbGFyZUZvY3VzLCBMb2NhbERlY2xhcmVSZXMsIE1vZHVsZUV4cG9ydCwgT2JqRW50cnksIFBhdHRlcm4sXG5cdFN1cGVyQ2FsbERvLCBZaWVsZCwgWWllbGRUb30gZnJvbSAnLi9Nc0FzdCdcbmltcG9ydCB7YXNzZXJ0LCBjYXQsIGlmRWxzZSwgaW1wbGVtZW50TWFueSwgaXNFbXB0eSwgb3BFYWNoLCByZXZlcnNlSXRlcn0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IFZlcmlmeVJlc3VsdHMgZnJvbSAnLi9WZXJpZnlSZXN1bHRzJ1xuXG4vKlxuVGhlIHZlcmlmaWVyIGdlbmVyYXRlcyBpbmZvcm1hdGlvbiBuZWVkZWQgZHVyaW5nIHRyYW5zcGlsaW5nLCB0aGUgVmVyaWZ5UmVzdWx0cy5cbiovXG5leHBvcnQgZGVmYXVsdCBtc0FzdCA9PiB7XG5cdGxvY2FscyA9IG5ldyBNYXAoKVxuXHRwZW5kaW5nQmxvY2tMb2NhbHMgPSBbXVxuXHRpc0luR2VuZXJhdG9yID0gZmFsc2Vcblx0b2tUb05vdFVzZSA9IG5ldyBTZXQoKVxuXHRvcExvb3AgPSBudWxsXG5cdG1ldGhvZCA9IG51bGxcblx0cmVzdWx0cyA9IG5ldyBWZXJpZnlSZXN1bHRzKClcblxuXHRtc0FzdC52ZXJpZnkoKVxuXHR2ZXJpZnlMb2NhbFVzZSgpXG5cblx0Y29uc3QgcmVzID0gcmVzdWx0c1xuXHQvLyBSZWxlYXNlIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXG5cdGxvY2FscyA9IG9rVG9Ob3RVc2UgPSBvcExvb3AgPSBwZW5kaW5nQmxvY2tMb2NhbHMgPSBtZXRob2QgPSByZXN1bHRzID0gbnVsbFxuXHRyZXR1cm4gcmVzXG59XG5cbi8vIFVzZSBhIHRyaWNrIGxpa2UgaW4gcGFyc2UuanMgYW5kIGhhdmUgZXZlcnl0aGluZyBjbG9zZSBvdmVyIHRoZXNlIG11dGFibGUgdmFyaWFibGVzLlxubGV0XG5cdC8vIE1hcCBmcm9tIG5hbWVzIHRvIExvY2FsRGVjbGFyZXMuXG5cdGxvY2Fscyxcblx0Ly8gTG9jYWxzIHRoYXQgZG9uJ3QgaGF2ZSB0byBiZSBhY2Nlc3NlZC5cblx0b2tUb05vdFVzZSxcblx0b3BMb29wLFxuXHQvKlxuXHRMb2NhbHMgZm9yIHRoaXMgYmxvY2suXG5cdFRoZXNlIGFyZSBhZGRlZCB0byBsb2NhbHMgd2hlbiBlbnRlcmluZyBhIEZ1bmN0aW9uIG9yIGxhenkgZXZhbHVhdGlvbi5cblx0SW46XG5cdFx0YSA9IHxcblx0XHRcdGJcblx0XHRiID0gMVxuXHRgYmAgd2lsbCBiZSBhIHBlbmRpbmcgbG9jYWwuXG5cdEhvd2V2ZXI6XG5cdFx0YSA9IGJcblx0XHRiID0gMVxuXHR3aWxsIGZhaWwgdG8gdmVyaWZ5LCBiZWNhdXNlIGBiYCBjb21lcyBhZnRlciBgYWAgYW5kIGlzIG5vdCBhY2Nlc3NlZCBpbnNpZGUgYSBmdW5jdGlvbi5cblx0SXQgd291bGQgd29yayBmb3IgYH5hIGlzIGJgLCB0aG91Z2guXG5cdCovXG5cdHBlbmRpbmdCbG9ja0xvY2Fscyxcblx0Ly8gV2hldGhlciB3ZSBhcmUgY3VycmVudGx5IGFibGUgdG8geWllbGQuXG5cdGlzSW5HZW5lcmF0b3IsXG5cdC8vIEN1cnJlbnQgbWV0aG9kIHdlIGFyZSBpbiwgb3IgYSBDb25zdHJ1Y3Rvciwgb3IgbnVsbC5cblx0bWV0aG9kLFxuXHRyZXN1bHRzLFxuXHQvLyBOYW1lIG9mIHRoZSBjbG9zZXN0IEFzc2lnblNpbmdsZVxuXHRuYW1lXG5cbmNvbnN0XG5cdHZlcmlmeU9wID0gXyA9PiB7XG5cdFx0aWYgKF8gIT09IG51bGwpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0dmVyaWZ5TmFtZSA9IF8gPT4ge1xuXHRcdGlmICh0eXBlb2YgXyAhPT0gJ3N0cmluZycpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0ZGVsZXRlTG9jYWwgPSBsb2NhbERlY2xhcmUgPT5cblx0XHRsb2NhbHMuZGVsZXRlKGxvY2FsRGVjbGFyZS5uYW1lKSxcblxuXHRzZXRMb2NhbCA9IGxvY2FsRGVjbGFyZSA9PlxuXHRcdGxvY2Fscy5zZXQobG9jYWxEZWNsYXJlLm5hbWUsIGxvY2FsRGVjbGFyZSksXG5cblx0YWNjZXNzTG9jYWwgPSAoYWNjZXNzLCBuYW1lKSA9PiB7XG5cdFx0Y29uc3QgZGVjbGFyZSA9IGdldExvY2FsRGVjbGFyZShuYW1lLCBhY2Nlc3MubG9jKVxuXHRcdHNldERlY2xhcmVBY2Nlc3NlZChkZWNsYXJlLCBhY2Nlc3MpXG5cdH0sXG5cblx0c2V0RGVjbGFyZUFjY2Vzc2VkID0gKGRlY2xhcmUsIGFjY2VzcykgPT4ge1xuXHRcdHJlc3VsdHMubG9jYWxEZWNsYXJlVG9BY2Nlc3Nlcy5nZXQoZGVjbGFyZSkucHVzaChhY2Nlc3MpXG5cdH0sXG5cblx0Ly8gRm9yIGV4cHJlc3Npb25zIGFmZmVjdGluZyBsaW5lTmV3TG9jYWxzLCB0aGV5IHdpbGwgYmUgcmVnaXN0ZXJlZCBiZWZvcmUgYmVpbmcgdmVyaWZpZWQuXG5cdC8vIFNvLCBMb2NhbERlY2xhcmUudmVyaWZ5IGp1c3QgdGhlIHR5cGUuXG5cdC8vIEZvciBsb2NhbHMgbm90IGFmZmVjdGluZyBsaW5lTmV3TG9jYWxzLCB1c2UgdGhpcyBpbnN0ZWFkIG9mIGp1c3QgZGVjbGFyZS52ZXJpZnkoKVxuXHR2ZXJpZnlMb2NhbERlY2xhcmUgPSBsb2NhbERlY2xhcmUgPT4ge1xuXHRcdHJlZ2lzdGVyTG9jYWwobG9jYWxEZWNsYXJlKVxuXHRcdGxvY2FsRGVjbGFyZS52ZXJpZnkoKVxuXHR9LFxuXG5cdHJlZ2lzdGVyTG9jYWwgPSBsb2NhbERlY2xhcmUgPT4ge1xuXHRcdHJlc3VsdHMubG9jYWxEZWNsYXJlVG9BY2Nlc3Nlcy5zZXQobG9jYWxEZWNsYXJlLCBbXSlcblx0fSxcblxuXHRzZXROYW1lID0gZXhwciA9PiB7XG5cdFx0cmVzdWx0cy5uYW1lcy5zZXQoZXhwciwgbmFtZSlcblx0fVxuXG4vLyBUaGVzZSBmdW5jdGlvbnMgY2hhbmdlIHZlcmlmaWVyIHN0YXRlIGFuZCBlZmZpY2llbnRseSByZXR1cm4gdG8gdGhlIG9sZCBzdGF0ZSB3aGVuIGZpbmlzaGVkLlxuY29uc3Rcblx0d2l0aEluR2VuZXJhdG9yID0gKG5ld0lzSW5HZW5lcmF0b3IsIGFjdGlvbikgPT4ge1xuXHRcdGNvbnN0IG9sZElzSW5HZW5lcmF0b3IgPSBpc0luR2VuZXJhdG9yXG5cdFx0aXNJbkdlbmVyYXRvciA9IG5ld0lzSW5HZW5lcmF0b3Jcblx0XHRhY3Rpb24oKVxuXHRcdGlzSW5HZW5lcmF0b3IgPSBvbGRJc0luR2VuZXJhdG9yXG5cdH0sXG5cblx0d2l0aExvb3AgPSAobmV3TG9vcCwgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgb2xkTG9vcCA9IG9wTG9vcFxuXHRcdG9wTG9vcCA9IG5ld0xvb3Bcblx0XHRhY3Rpb24oKVxuXHRcdG9wTG9vcCA9IG9sZExvb3Bcblx0fSxcblxuXHR3aXRoTWV0aG9kID0gKG5ld01ldGhvZCwgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgb2xkTWV0aG9kID0gbWV0aG9kXG5cdFx0bWV0aG9kID0gbmV3TWV0aG9kXG5cdFx0YWN0aW9uKClcblx0XHRtZXRob2QgPSBvbGRNZXRob2Rcblx0fSxcblxuXHR3aXRoTmFtZSA9IChuZXdOYW1lLCBhY3Rpb24pID0+IHtcblx0XHRjb25zdCBvbGROYW1lID0gbmFtZVxuXHRcdG5hbWUgPSBuZXdOYW1lXG5cdFx0YWN0aW9uKClcblx0XHRuYW1lID0gb2xkTmFtZVxuXHR9LFxuXG5cdC8vIENhbid0IGJyZWFrIG91dCBvZiBsb29wIGluc2lkZSBvZiBJSUZFLlxuXHR3aXRoSUlGRSA9IGFjdGlvbiA9PiB7XG5cdFx0d2l0aExvb3AoZmFsc2UsIGFjdGlvbilcblx0fSxcblxuXHRwbHVzTG9jYWwgPSAoYWRkZWRMb2NhbCwgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgc2hhZG93ZWQgPSBsb2NhbHMuZ2V0KGFkZGVkTG9jYWwubmFtZSlcblx0XHRsb2NhbHMuc2V0KGFkZGVkTG9jYWwubmFtZSwgYWRkZWRMb2NhbClcblx0XHRhY3Rpb24oKVxuXHRcdGlmIChzaGFkb3dlZCA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0ZGVsZXRlTG9jYWwoYWRkZWRMb2NhbClcblx0XHRlbHNlXG5cdFx0XHRzZXRMb2NhbChzaGFkb3dlZClcblx0fSxcblxuXHQvLyBTaG91bGQgaGF2ZSB2ZXJpZmllZCB0aGF0IGFkZGVkTG9jYWxzIGFsbCBoYXZlIGRpZmZlcmVudCBuYW1lcy5cblx0cGx1c0xvY2FscyA9IChhZGRlZExvY2FscywgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgc2hhZG93ZWRMb2NhbHMgPSBbXVxuXHRcdGZvciAoY29uc3QgXyBvZiBhZGRlZExvY2Fscykge1xuXHRcdFx0Y29uc3Qgc2hhZG93ZWQgPSBsb2NhbHMuZ2V0KF8ubmFtZSlcblx0XHRcdGlmIChzaGFkb3dlZCAhPT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRzaGFkb3dlZExvY2Fscy5wdXNoKHNoYWRvd2VkKVxuXHRcdFx0c2V0TG9jYWwoXylcblx0XHR9XG5cblx0XHRhY3Rpb24oKVxuXG5cdFx0YWRkZWRMb2NhbHMuZm9yRWFjaChkZWxldGVMb2NhbClcblx0XHRzaGFkb3dlZExvY2Fscy5mb3JFYWNoKHNldExvY2FsKVxuXHR9LFxuXG5cdHZlcmlmeUFuZFBsdXNMb2NhbCA9IChhZGRlZExvY2FsLCBhY3Rpb24pID0+IHtcblx0XHR2ZXJpZnlMb2NhbERlY2xhcmUoYWRkZWRMb2NhbClcblx0XHRwbHVzTG9jYWwoYWRkZWRMb2NhbCwgYWN0aW9uKVxuXHR9LFxuXG5cdHZlcmlmeUFuZFBsdXNMb2NhbHMgPSAoYWRkZWRMb2NhbHMsIGFjdGlvbikgPT4ge1xuXHRcdGFkZGVkTG9jYWxzLmZvckVhY2godmVyaWZ5TG9jYWxEZWNsYXJlKVxuXHRcdGNvbnN0IG5hbWVzID0gbmV3IFNldCgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIGFkZGVkTG9jYWxzKSB7XG5cdFx0XHRjaGVjayghbmFtZXMuaGFzKF8ubmFtZSksIF8ubG9jLCAoKSA9PiBgRHVwbGljYXRlIGxvY2FsICR7Y29kZShfLm5hbWUpfWApXG5cdFx0XHRuYW1lcy5hZGQoXy5uYW1lKVxuXHRcdH1cblx0XHRwbHVzTG9jYWxzKGFkZGVkTG9jYWxzLCBhY3Rpb24pXG5cdH0sXG5cblx0d2l0aEJsb2NrTG9jYWxzID0gYWN0aW9uID0+IHtcblx0XHRjb25zdCBvbGRQZW5kaW5nQmxvY2tMb2NhbHMgPSBwZW5kaW5nQmxvY2tMb2NhbHNcblx0XHRwZW5kaW5nQmxvY2tMb2NhbHMgPSBbXVxuXHRcdHBsdXNMb2NhbHMob2xkUGVuZGluZ0Jsb2NrTG9jYWxzLCBhY3Rpb24pXG5cdFx0cGVuZGluZ0Jsb2NrTG9jYWxzID0gb2xkUGVuZGluZ0Jsb2NrTG9jYWxzXG5cdH1cblxuY29uc3QgdmVyaWZ5TG9jYWxVc2UgPSAoKSA9PiB7XG5cdGZvciAoY29uc3QgW2xvY2FsLCBhY2Nlc3Nlc10gb2YgcmVzdWx0cy5sb2NhbERlY2xhcmVUb0FjY2Vzc2VzKVxuXHRcdGlmICghKGxvY2FsIGluc3RhbmNlb2YgTG9jYWxEZWNsYXJlQnVpbHQgfHwgbG9jYWwgaW5zdGFuY2VvZiBMb2NhbERlY2xhcmVSZXMpKVxuXHRcdFx0d2FybklmKGlzRW1wdHkoYWNjZXNzZXMpICYmICFva1RvTm90VXNlLmhhcyhsb2NhbCksIGxvY2FsLmxvYywgKCkgPT5cblx0XHRcdFx0YFVudXNlZCBsb2NhbCB2YXJpYWJsZSAke2NvZGUobG9jYWwubmFtZSl9LmApXG59XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ3ZlcmlmeScsIHtcblx0QXNzZXJ0KCkge1xuXHRcdHRoaXMuY29uZGl0aW9uLnZlcmlmeSgpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFRocm93bilcblx0fSxcblxuXHRBc3NpZ25TaW5nbGUoKSB7XG5cdFx0d2l0aE5hbWUodGhpcy5hc3NpZ25lZS5uYW1lLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBkb1YgPSAoKSA9PiB7XG5cdFx0XHRcdC8qXG5cdFx0XHRcdEZ1biBhbmQgQ2xhc3Mgb25seSBnZXQgbmFtZSBpZiB0aGV5IGFyZSBpbW1lZGlhdGVseSBhZnRlciB0aGUgYXNzaWdubWVudC5cblx0XHRcdFx0c28gaW4gYHggPSAkYWZ0ZXItdGltZSAxMDAwIHxgIHRoZSBmdW5jdGlvbiBpcyBub3QgbmFtZWQuXG5cdFx0XHRcdCovXG5cdFx0XHRcdGlmICh0aGlzLnZhbHVlIGluc3RhbmNlb2YgQ2xhc3MgfHwgdGhpcy52YWx1ZSBpbnN0YW5jZW9mIEZ1bilcblx0XHRcdFx0XHRzZXROYW1lKHRoaXMudmFsdWUpXG5cblx0XHRcdFx0Ly8gQXNzaWduZWUgcmVnaXN0ZXJlZCBieSB2ZXJpZnlMaW5lcy5cblx0XHRcdFx0dGhpcy5hc3NpZ25lZS52ZXJpZnkoKVxuXHRcdFx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy5hc3NpZ25lZS5pc0xhenkoKSlcblx0XHRcdFx0d2l0aEJsb2NrTG9jYWxzKGRvVilcblx0XHRcdGVsc2Vcblx0XHRcdFx0ZG9WKClcblx0XHR9KVxuXHR9LFxuXG5cdEFzc2lnbkRlc3RydWN0dXJlKCkge1xuXHRcdC8vIEFzc2lnbmVlcyByZWdpc3RlcmVkIGJ5IHZlcmlmeUxpbmVzLlxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFzc2lnbmVlcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0QmFnRW50cnk6IHZlcmlmeUJhZ0VudHJ5LFxuXHRCYWdFbnRyeU1hbnk6IHZlcmlmeUJhZ0VudHJ5LFxuXG5cdEJhZ1NpbXBsZSgpIHtcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5wYXJ0cylcblx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHRCbG9ja0RvKCkge1xuXHRcdHZlcmlmeUxpbmVzKHRoaXMubGluZXMpXG5cdH0sXG5cblx0QmxvY2tWYWxUaHJvdygpIHtcblx0XHRjb25zdCBuZXdMb2NhbHMgPSB2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHRcdHBsdXNMb2NhbHMobmV3TG9jYWxzLCAoKSA9PiB0aGlzLnRocm93LnZlcmlmeSgpKVxuXHR9LFxuXG5cdEJsb2NrV2l0aFJldHVybigpIHtcblx0XHRjb25zdCBuZXdMb2NhbHMgPSB2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHRcdHBsdXNMb2NhbHMobmV3TG9jYWxzLCAoKSA9PiB0aGlzLnJldHVybmVkLnZlcmlmeSgpKVxuXHR9LFxuXG5cblx0QmxvY2tPYmo6IHZlcmlmeUJsb2NrQnVpbGQsXG5cdEJsb2NrQmFnOiB2ZXJpZnlCbG9ja0J1aWxkLFxuXHRCbG9ja01hcDogdmVyaWZ5QmxvY2tCdWlsZCxcblxuXHRCbG9ja1dyYXAoKSB7XG5cdFx0d2l0aElJRkUoKCkgPT4gdGhpcy5ibG9jay52ZXJpZnkoKSlcblx0fSxcblxuXHRCcmVhaygpIHtcblx0XHR2ZXJpZnlJbkxvb3AodGhpcylcblx0XHRjaGVjayghKG9wTG9vcCBpbnN0YW5jZW9mIEZvclZhbCksIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0YCR7Y29kZSgnZm9yJyl9IG11c3QgYnJlYWsgd2l0aCBhIHZhbHVlLmApXG5cdH0sXG5cblx0QnJlYWtXaXRoVmFsKCkge1xuXHRcdHZlcmlmeUluTG9vcCh0aGlzKVxuXHRcdGNoZWNrKG9wTG9vcCBpbnN0YW5jZW9mIEZvclZhbCwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRgJHtjb2RlKCdicmVhaycpfSBvbmx5IHZhbGlkIGluc2lkZSAke2NvZGUoJ2ZvcicpfWApXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdENhbGwoKSB7XG5cdFx0dGhpcy5jYWxsZWQudmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hcmdzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHR9LFxuXG5cdENhc2VEbygpIHtcblx0XHR2ZXJpZnlDYXNlKHRoaXMpXG5cdH0sXG5cdENhc2VEb1BhcnQ6IHZlcmlmeUNhc2VQYXJ0LFxuXHRDYXNlVmFsKCkge1xuXHRcdHdpdGhJSUZFKCgpID0+IHZlcmlmeUNhc2UodGhpcykpXG5cdH0sXG5cdENhc2VWYWxQYXJ0OiB2ZXJpZnlDYXNlUGFydCxcblxuXHRDYXRjaCgpIHtcblx0XHRjaGVjayh0aGlzLmNhdWdodC5vcFR5cGUgPT09IG51bGwsIHRoaXMuY2F1Z2h0LmxvYywgJ1RPRE86IENhdWdodCB0eXBlcycpXG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuY2F1Z2h0LCAoKSA9PiB0aGlzLmJsb2NrLnZlcmlmeSgpKVxuXHR9LFxuXG5cdENsYXNzKCkge1xuXHRcdHZlcmlmeU9wKHRoaXMub3BTdXBlckNsYXNzKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BEbylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5zdGF0aWNzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdGlmICh0aGlzLm9wQ29uc3RydWN0b3IgIT09IG51bGwpXG5cdFx0XHR0aGlzLm9wQ29uc3RydWN0b3IudmVyaWZ5KHRoaXMub3BTdXBlckNsYXNzICE9PSBudWxsKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLm1ldGhvZHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0Ly8gbmFtZSBzZXQgYnkgQXNzaWduU2luZ2xlXG5cdH0sXG5cblx0Q2xhc3NEbygpIHtcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5kZWNsYXJlRm9jdXMsICgpID0+IHRoaXMuYmxvY2sudmVyaWZ5KCkpXG5cdH0sXG5cblx0Q29uZCgpIHtcblx0XHR0aGlzLnRlc3QudmVyaWZ5KClcblx0XHR0aGlzLmlmVHJ1ZS52ZXJpZnkoKVxuXHRcdHRoaXMuaWZGYWxzZS52ZXJpZnkoKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsRG8oKSB7XG5cdFx0dGhpcy50ZXN0LnZlcmlmeSgpXG5cdFx0dGhpcy5yZXN1bHQudmVyaWZ5KClcblx0fSxcblx0Q29uZGl0aW9uYWxWYWwoKSB7XG5cdFx0dGhpcy50ZXN0LnZlcmlmeSgpXG5cdFx0d2l0aElJRkUoKCkgPT4gdGhpcy5yZXN1bHQudmVyaWZ5KCkpXG5cdH0sXG5cblx0Q29uc3RydWN0b3IoY2xhc3NIYXNTdXBlcikge1xuXHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZnVuLm9wRGVjbGFyZVRoaXMpXG5cdFx0d2l0aE1ldGhvZCh0aGlzLCAoKSA9PiB7IHRoaXMuZnVuLnZlcmlmeSgpIH0pXG5cblx0XHRjb25zdCBzdXBlckNhbGwgPSByZXN1bHRzLmNvbnN0cnVjdG9yVG9TdXBlci5nZXQodGhpcylcblxuXHRcdGlmIChjbGFzc0hhc1N1cGVyKVxuXHRcdFx0Y2hlY2soc3VwZXJDYWxsICE9PSB1bmRlZmluZWQsIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0XHRgQ29uc3RydWN0b3IgbXVzdCBjb250YWluICR7Y29kZSgnc3VwZXIhJyl9YClcblx0XHRlbHNlXG5cdFx0XHRjaGVjayhzdXBlckNhbGwgPT09IHVuZGVmaW5lZCwgKCkgPT4gc3VwZXJDYWxsLmxvYywgKCkgPT5cblx0XHRcdFx0YENsYXNzIGhhcyBubyBzdXBlcmNsYXNzLCBzbyAke2NvZGUoJ3N1cGVyIScpfSBpcyBub3QgYWxsb3dlZC5gKVxuXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMubWVtYmVyQXJncylcblx0XHRcdHNldERlY2xhcmVBY2Nlc3NlZChfLCB0aGlzKVxuXHR9LFxuXG5cdEV4Y2VwdERvOiB2ZXJpZnlFeGNlcHQsXG5cdEV4Y2VwdFZhbDogdmVyaWZ5RXhjZXB0LFxuXG5cdEZvckJhZygpIHtcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5idWlsdCwgKCkgPT4gdmVyaWZ5Rm9yKHRoaXMpKVxuXHR9LFxuXG5cdEZvckRvKCkge1xuXHRcdHZlcmlmeUZvcih0aGlzKVxuXHR9LFxuXG5cdEZvclZhbCgpIHtcblx0XHR2ZXJpZnlGb3IodGhpcylcblx0fSxcblxuXHRGdW4oKSB7XG5cdFx0d2l0aEJsb2NrTG9jYWxzKCgpID0+IHtcblx0XHRcdGNoZWNrKHRoaXMub3BEZWNsYXJlUmVzID09PSBudWxsIHx8IHRoaXMuYmxvY2sgaW5zdGFuY2VvZiBCbG9ja1ZhbCwgdGhpcy5sb2MsXG5cdFx0XHRcdCdGdW5jdGlvbiB3aXRoIHJldHVybiBjb25kaXRpb24gbXVzdCByZXR1cm4gc29tZXRoaW5nLicpXG5cdFx0XHR3aXRoSW5HZW5lcmF0b3IodGhpcy5pc0dlbmVyYXRvciwgKCkgPT5cblx0XHRcdFx0d2l0aExvb3AobnVsbCwgKCkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGFsbEFyZ3MgPSBjYXQodGhpcy5vcERlY2xhcmVUaGlzLCB0aGlzLmFyZ3MsIHRoaXMub3BSZXN0QXJnKVxuXHRcdFx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoYWxsQXJncywgKCkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoKVxuXHRcdFx0XHRcdFx0b3BFYWNoKHRoaXMub3BEZWNsYXJlUmVzLCB2ZXJpZnlMb2NhbERlY2xhcmUpXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fSkpXG5cdFx0fSlcblx0XHQvLyBuYW1lIHNldCBieSBBc3NpZ25TaW5nbGVcblx0fSxcblxuXHRJZ25vcmUoKSB7XG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuaWdub3JlZClcblx0XHRcdGFjY2Vzc0xvY2FsKHRoaXMsIF8pXG5cdH0sXG5cblx0TGF6eSgpIHtcblx0XHR3aXRoQmxvY2tMb2NhbHMoKCkgPT4gdGhpcy52YWx1ZS52ZXJpZnkoKSlcblx0fSxcblxuXHRMb2NhbEFjY2VzcygpIHtcblx0XHRjb25zdCBkZWNsYXJlID0gbG9jYWxzLmdldCh0aGlzLm5hbWUpXG5cdFx0aWYgKGRlY2xhcmUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3QgYnVpbHRpblBhdGggPSBvcHRpb25zLmJ1aWx0aW5OYW1lVG9QYXRoLmdldCh0aGlzLm5hbWUpXG5cdFx0XHRpZiAoYnVpbHRpblBhdGggPT09IHVuZGVmaW5lZClcblx0XHRcdFx0ZmFpbE1pc3NpbmdMb2NhbCh0aGlzLmxvYywgdGhpcy5uYW1lKVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGNvbnN0IG5hbWVzID0gcmVzdWx0cy5idWlsdGluUGF0aFRvTmFtZXMuZ2V0KGJ1aWx0aW5QYXRoKVxuXHRcdFx0XHRpZiAobmFtZXMgPT09IHVuZGVmaW5lZClcblx0XHRcdFx0XHRyZXN1bHRzLmJ1aWx0aW5QYXRoVG9OYW1lcy5zZXQoYnVpbHRpblBhdGgsIG5ldyBTZXQoW3RoaXMubmFtZV0pKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0bmFtZXMuYWRkKHRoaXMubmFtZSlcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzdWx0cy5sb2NhbEFjY2Vzc1RvRGVjbGFyZS5zZXQodGhpcywgZGVjbGFyZSlcblx0XHRcdHNldERlY2xhcmVBY2Nlc3NlZChkZWNsYXJlLCB0aGlzKVxuXHRcdH1cblx0fSxcblxuXHQvLyBBZGRpbmcgTG9jYWxEZWNsYXJlcyB0byB0aGUgYXZhaWxhYmxlIGxvY2FscyBpcyBkb25lIGJ5IEZ1biBvciBsaW5lTmV3TG9jYWxzLlxuXHRMb2NhbERlY2xhcmUoKSB7XG5cdFx0Y29uc3QgYnVpbHRpblBhdGggPSBvcHRpb25zLmJ1aWx0aW5OYW1lVG9QYXRoLmdldCh0aGlzLm5hbWUpXG5cdFx0d2FybklmKGJ1aWx0aW5QYXRoICE9PSB1bmRlZmluZWQsIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0YExvY2FsICR7Y29kZSh0aGlzLm5hbWUpfSBvdmVycmlkZXMgYnVpbHRpbiBmcm9tICR7Y29kZShidWlsdGluUGF0aCl9LmApXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFR5cGUpXG5cdH0sXG5cblx0TG9jYWxNdXRhdGUoKSB7XG5cdFx0Y29uc3QgZGVjbGFyZSA9IGdldExvY2FsRGVjbGFyZSh0aGlzLm5hbWUsIHRoaXMubG9jKVxuXHRcdGNoZWNrKGRlY2xhcmUuaXNNdXRhYmxlKCksIHRoaXMubG9jLCAoKSA9PiBgJHtjb2RlKHRoaXMubmFtZSl9IGlzIG5vdCBtdXRhYmxlLmApXG5cdFx0Ly8gVE9ETzogVHJhY2sgbXV0YXRpb25zLiBNdXRhYmxlIGxvY2FsIG11c3QgYmUgbXV0YXRlZCBzb21ld2hlcmUuXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdExvZ2ljKCkge1xuXHRcdGNoZWNrKHRoaXMuYXJncy5sZW5ndGggPiAxLCAnTG9naWMgZXhwcmVzc2lvbiBuZWVkcyBhdCBsZWFzdCAyIGFyZ3VtZW50cy4nKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0Tm90KCkge1xuXHRcdHRoaXMuYXJnLnZlcmlmeSgpXG5cdH0sXG5cblx0TnVtYmVyTGl0ZXJhbCgpIHsgfSxcblxuXHRNYXBFbnRyeSgpIHtcblx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHRoaXMua2V5LnZlcmlmeSgpXG5cdFx0dGhpcy52YWwudmVyaWZ5KClcblx0fSxcblxuXHRNZW1iZXIoKSB7XG5cdFx0dGhpcy5vYmplY3QudmVyaWZ5KClcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0fSxcblxuXHRNZW1iZXJTZXQoKSB7XG5cdFx0dGhpcy5vYmplY3QudmVyaWZ5KClcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVHlwZSlcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0TWV0aG9kSW1wbCgpIHtcblx0XHR2ZXJpZnlNZXRob2QodGhpcywgKCkgPT4ge1xuXHRcdFx0b2tUb05vdFVzZS5hZGQodGhpcy5mdW4ub3BEZWNsYXJlVGhpcylcblx0XHRcdHRoaXMuZnVuLnZlcmlmeSgpXG5cdFx0fSlcblx0fSxcblx0TWV0aG9kR2V0dGVyKCkge1xuXHRcdHZlcmlmeU1ldGhvZCh0aGlzLCAoKSA9PiB7XG5cdFx0XHRva1RvTm90VXNlLmFkZCh0aGlzLmRlY2xhcmVUaGlzKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FscyhbdGhpcy5kZWNsYXJlVGhpc10sICgpID0+IHsgdGhpcy5ibG9jay52ZXJpZnkoKSB9KVxuXHRcdH0pXG5cdH0sXG5cdE1ldGhvZFNldHRlcigpIHtcblx0XHR2ZXJpZnlNZXRob2QodGhpcywgKCkgPT4ge1xuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FscyhbdGhpcy5kZWNsYXJlVGhpcywgdGhpcy5kZWNsYXJlRm9jdXNdLCAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuYmxvY2sudmVyaWZ5KClcblx0XHRcdH0pXG5cdFx0fSlcblx0fSxcblxuXHRNb2R1bGUoKSB7XG5cdFx0Ly8gTm8gbmVlZCB0byB2ZXJpZnkgdGhpcy5kb0ltcG9ydHMuXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuaW1wb3J0cylcblx0XHRcdF8udmVyaWZ5KClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wSW1wb3J0R2xvYmFsKVxuXG5cdFx0d2l0aE5hbWUob3B0aW9ucy5tb2R1bGVOYW1lKCksICgpID0+IHtcblx0XHRcdHZlcmlmeUxpbmVzKHRoaXMubGluZXMpXG5cdFx0fSlcblx0fSxcblxuXHRNb2R1bGVFeHBvcnQoKSB7XG5cdFx0dGhpcy5hc3NpZ24udmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hc3NpZ24uYWxsQXNzaWduZWVzKCkpXG5cdFx0XHRzZXREZWNsYXJlQWNjZXNzZWQoXywgdGhpcylcblx0fSxcblxuXHROZXcoKSB7XG5cdFx0dGhpcy50eXBlLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHRPYmpFbnRyeUFzc2lnbigpIHtcblx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHRoaXMuYXNzaWduLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXNzaWduLmFsbEFzc2lnbmVlcygpKVxuXHRcdFx0c2V0RGVjbGFyZUFjY2Vzc2VkKF8sIHRoaXMpXG5cdH0sXG5cblx0T2JqRW50cnlDb21wdXRlZCgpIHtcblx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHRoaXMua2V5LnZlcmlmeSgpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdE9iakVudHJ5UGxhaW4oKSB7XG5cdFx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0T2JqU2ltcGxlKCkge1xuXHRcdGNvbnN0IGtleXMgPSBuZXcgU2V0KClcblx0XHRmb3IgKGNvbnN0IHBhaXIgb2YgdGhpcy5wYWlycykge1xuXHRcdFx0Y29uc3Qge2tleSwgdmFsdWV9ID0gcGFpclxuXHRcdFx0Y2hlY2soIWtleXMuaGFzKGtleSksIHBhaXIubG9jLCAoKSA9PiBgRHVwbGljYXRlIGtleSAke2tleX1gKVxuXHRcdFx0a2V5cy5hZGQoa2V5KVxuXHRcdFx0dmFsdWUudmVyaWZ5KClcblx0XHR9XG5cdH0sXG5cblx0UXVvdGUoKSB7XG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMucGFydHMpXG5cdFx0XHR2ZXJpZnlOYW1lKF8pXG5cdH0sXG5cblx0UXVvdGVUZW1wbGF0ZSgpIHtcblx0XHR0aGlzLnRhZy52ZXJpZnkoKVxuXHRcdHRoaXMucXVvdGUudmVyaWZ5KClcblx0fSxcblxuXHRTZXRTdWIoKSB7XG5cdFx0dGhpcy5vYmplY3QudmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5zdWJiZWRzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BUeXBlKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0fSxcblxuXHRTcGVjaWFsRG8oKSB7IH0sXG5cblx0U3BlY2lhbFZhbCgpIHtcblx0XHRzZXROYW1lKHRoaXMpXG5cdH0sXG5cblx0U3BsYXQoKSB7XG5cdFx0dGhpcy5zcGxhdHRlZC52ZXJpZnkoKVxuXHR9LFxuXG5cdFN1cGVyQ2FsbDogdmVyaWZ5U3VwZXJDYWxsLFxuXHRTdXBlckNhbGxEbzogdmVyaWZ5U3VwZXJDYWxsLFxuXHRTdXBlck1lbWJlcigpIHtcblx0XHRjaGVjayhtZXRob2QgIT09IG51bGwsIHRoaXMubG9jLCAnTXVzdCBiZSBpbiBtZXRob2QuJylcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0fSxcblxuXHRTd2l0Y2hEbygpIHtcblx0XHR2ZXJpZnlTd2l0Y2godGhpcylcblx0fSxcblx0U3dpdGNoRG9QYXJ0OiB2ZXJpZnlTd2l0Y2hQYXJ0LFxuXHRTd2l0Y2hWYWwoKSB7XG5cdFx0d2l0aElJRkUoKCkgPT4gdmVyaWZ5U3dpdGNoKHRoaXMpKVxuXHR9LFxuXHRTd2l0Y2hWYWxQYXJ0OiB2ZXJpZnlTd2l0Y2hQYXJ0LFxuXG5cdFRocm93KCkge1xuXHRcdHZlcmlmeU9wKHRoaXMub3BUaHJvd24pXG5cdH0sXG5cblx0SW1wb3J0OiB2ZXJpZnlJbXBvcnQsXG5cdEltcG9ydEdsb2JhbDogdmVyaWZ5SW1wb3J0LFxuXG5cdFdpdGgoKSB7XG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHRcdHdpdGhJSUZFKCgpID0+IHtcblx0XHRcdGlmICh0aGlzLmRlY2xhcmUgaW5zdGFuY2VvZiBMb2NhbERlY2xhcmVGb2N1cylcblx0XHRcdFx0b2tUb05vdFVzZS5hZGQodGhpcy5kZWNsYXJlKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuZGVjbGFyZSwgKCkgPT4geyB0aGlzLmJsb2NrLnZlcmlmeSgpIH0pXG5cdFx0fSlcblx0fSxcblxuXHRZaWVsZCgpIHtcblx0XHRjaGVjayhpc0luR2VuZXJhdG9yLCB0aGlzLmxvYywgJ0Nhbm5vdCB5aWVsZCBvdXRzaWRlIG9mIGdlbmVyYXRvciBjb250ZXh0Jylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wWWllbGRlZClcblx0fSxcblxuXHRZaWVsZFRvKCkge1xuXHRcdGNoZWNrKGlzSW5HZW5lcmF0b3IsIHRoaXMubG9jLCAnQ2Fubm90IHlpZWxkIG91dHNpZGUgb2YgZ2VuZXJhdG9yIGNvbnRleHQnKVxuXHRcdHRoaXMueWllbGRlZFRvLnZlcmlmeSgpXG5cdH1cbn0pXG5cbmZ1bmN0aW9uIHZlcmlmeUJhZ0VudHJ5KCkge1xuXHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHR0aGlzLnZhbHVlLnZlcmlmeSgpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeUJsb2NrQnVpbGQoKSB7XG5cdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmJ1aWx0LCAoKSA9PiB7XG5cdFx0dmVyaWZ5TGluZXModGhpcy5saW5lcylcblx0fSlcbn1cblxuZnVuY3Rpb24gdmVyaWZ5Q2FzZVBhcnQoKSB7XG5cdGlmICh0aGlzLnRlc3QgaW5zdGFuY2VvZiBQYXR0ZXJuKSB7XG5cdFx0dGhpcy50ZXN0LnR5cGUudmVyaWZ5KClcblx0XHR0aGlzLnRlc3QucGF0dGVybmVkLnZlcmlmeSgpXG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2Fscyh0aGlzLnRlc3QubG9jYWxzLCAoKSA9PiB0aGlzLnJlc3VsdC52ZXJpZnkoKSlcblx0fSBlbHNlIHtcblx0XHR0aGlzLnRlc3QudmVyaWZ5KClcblx0XHR0aGlzLnJlc3VsdC52ZXJpZnkoKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHZlcmlmeVN3aXRjaFBhcnQoKSB7XG5cdGZvciAoY29uc3QgXyBvZiB0aGlzLnZhbHVlcylcblx0XHRfLnZlcmlmeSgpXG5cdHRoaXMucmVzdWx0LnZlcmlmeSgpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeUV4Y2VwdCgpIHtcblx0dGhpcy5fdHJ5LnZlcmlmeSgpXG5cdHZlcmlmeU9wKHRoaXMuX2NhdGNoKVxuXHR2ZXJpZnlPcCh0aGlzLl9maW5hbGx5KVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlTdXBlckNhbGwoKSB7XG5cdGNoZWNrKG1ldGhvZCAhPT0gbnVsbCwgdGhpcy5sb2MsICdNdXN0IGJlIGluIGEgbWV0aG9kLicpXG5cdHJlc3VsdHMuc3VwZXJDYWxsVG9NZXRob2Quc2V0KHRoaXMsIG1ldGhvZClcblxuXHRpZiAobWV0aG9kIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpIHtcblx0XHRjaGVjayh0aGlzIGluc3RhbmNlb2YgU3VwZXJDYWxsRG8sIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0YCR7Y29kZSgnc3VwZXInKX0gbm90IHN1cHBvcnRlZCBpbiBjb25zdHJ1Y3RvcjsgdXNlICR7Y29kZSgnc3VwZXIhJyl9YClcblx0XHRyZXN1bHRzLmNvbnN0cnVjdG9yVG9TdXBlci5zZXQobWV0aG9kLCB0aGlzKVxuXHR9XG5cblx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRfLnZlcmlmeSgpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeUltcG9ydCgpIHtcblx0Ly8gU2luY2UgVXNlcyBhcmUgYWx3YXlzIGluIHRoZSBvdXRlcm1vc3Qgc2NvcGUsIGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgc2hhZG93aW5nLlxuXHQvLyBTbyB3ZSBtdXRhdGUgYGxvY2Fsc2AgZGlyZWN0bHkuXG5cdGNvbnN0IGFkZFVzZUxvY2FsID0gXyA9PiB7XG5cdFx0Y29uc3QgcHJldiA9IGxvY2Fscy5nZXQoXy5uYW1lKVxuXHRcdGNoZWNrKHByZXYgPT09IHVuZGVmaW5lZCwgXy5sb2MsICgpID0+XG5cdFx0XHRgJHtjb2RlKF8ubmFtZSl9IGFscmVhZHkgaW1wb3J0ZWQgYXQgJHtwcmV2LmxvY31gKVxuXHRcdHZlcmlmeUxvY2FsRGVjbGFyZShfKVxuXHRcdHNldExvY2FsKF8pXG5cdH1cblx0Zm9yIChjb25zdCBfIG9mIHRoaXMuaW1wb3J0ZWQpXG5cdFx0YWRkVXNlTG9jYWwoXylcblx0b3BFYWNoKHRoaXMub3BJbXBvcnREZWZhdWx0LCBhZGRVc2VMb2NhbClcbn1cblxuLy8gSGVscGVycyBzcGVjaWZpYyB0byBjZXJ0YWluIE1zQXN0IHR5cGVzOlxuY29uc3Rcblx0dmVyaWZ5Rm9yID0gZm9yTG9vcCA9PiB7XG5cdFx0Y29uc3QgdmVyaWZ5QmxvY2sgPSAoKSA9PiB3aXRoTG9vcChmb3JMb29wLCAoKSA9PiBmb3JMb29wLmJsb2NrLnZlcmlmeSgpKVxuXHRcdGlmRWxzZShmb3JMb29wLm9wSXRlcmF0ZWUsXG5cdFx0XHQoe2VsZW1lbnQsIGJhZ30pID0+IHtcblx0XHRcdFx0YmFnLnZlcmlmeSgpXG5cdFx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbChlbGVtZW50LCB2ZXJpZnlCbG9jaylcblx0XHRcdH0sXG5cdFx0XHR2ZXJpZnlCbG9jaylcblx0fSxcblxuXHR2ZXJpZnlJbkxvb3AgPSBsb29wVXNlciA9PlxuXHRcdGNoZWNrKG9wTG9vcCAhPT0gbnVsbCwgbG9vcFVzZXIubG9jLCAnTm90IGluIGEgbG9vcC4nKSxcblxuXHR2ZXJpZnlDYXNlID0gXyA9PiB7XG5cdFx0Y29uc3QgZG9JdCA9ICgpID0+IHtcblx0XHRcdGZvciAoY29uc3QgcGFydCBvZiBfLnBhcnRzKVxuXHRcdFx0XHRwYXJ0LnZlcmlmeSgpXG5cdFx0XHR2ZXJpZnlPcChfLm9wRWxzZSlcblx0XHR9XG5cdFx0aWZFbHNlKF8ub3BDYXNlZCxcblx0XHRcdF8gPT4ge1xuXHRcdFx0XHRfLnZlcmlmeSgpXG5cdFx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbChfLmFzc2lnbmVlLCBkb0l0KVxuXHRcdFx0fSxcblx0XHRcdGRvSXQpXG5cdH0sXG5cblx0dmVyaWZ5TWV0aG9kID0gKF8sIGRvVmVyaWZ5KSA9PiB7XG5cdFx0dmVyaWZ5TmFtZShfLnN5bWJvbClcblx0XHR3aXRoTWV0aG9kKF8sIGRvVmVyaWZ5KVxuXHR9LFxuXG5cdHZlcmlmeVN3aXRjaCA9IF8gPT4ge1xuXHRcdF8uc3dpdGNoZWQudmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IHBhcnQgb2YgXy5wYXJ0cylcblx0XHRcdHBhcnQudmVyaWZ5KClcblx0XHR2ZXJpZnlPcChfLm9wRWxzZSlcblx0fVxuXG4vLyBHZW5lcmFsIHV0aWxpdGllczpcbmNvbnN0XG5cdGdldExvY2FsRGVjbGFyZSA9IChuYW1lLCBhY2Nlc3NMb2MpID0+IHtcblx0XHRjb25zdCBkZWNsYXJlID0gbG9jYWxzLmdldChuYW1lKVxuXHRcdGlmIChkZWNsYXJlID09PSB1bmRlZmluZWQpXG5cdFx0XHRmYWlsTWlzc2luZ0xvY2FsKGFjY2Vzc0xvYywgbmFtZSlcblx0XHRyZXR1cm4gZGVjbGFyZVxuXHR9LFxuXG5cdGZhaWxNaXNzaW5nTG9jYWwgPSAobG9jLCBuYW1lKSA9PiB7XG5cdFx0ZmFpbChsb2MsICgpID0+IHtcblx0XHRcdC8vIFRPRE86RVM2IGBBcnJheS5mcm9tKGxvY2Fscy5rZXlzKCkpYCBzaG91bGQgd29ya1xuXHRcdFx0Y29uc3Qga2V5cyA9IFtdXG5cdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBsb2NhbHMua2V5cygpKVxuXHRcdFx0XHRrZXlzLnB1c2goa2V5KVxuXHRcdFx0Y29uc3Qgc2hvd0xvY2FscyA9IGNvZGUoa2V5cy5qb2luKCcgJykpXG5cdFx0XHRyZXR1cm4gYE5vIHN1Y2ggbG9jYWwgJHtjb2RlKG5hbWUpfS5cXG5Mb2NhbHMgYXJlOlxcbiR7c2hvd0xvY2Fsc30uYFxuXHRcdH0pXG5cdH0sXG5cblx0bGluZU5ld0xvY2FscyA9IGxpbmUgPT5cblx0XHRsaW5lIGluc3RhbmNlb2YgQXNzaWduU2luZ2xlID9cblx0XHRcdFtsaW5lLmFzc2lnbmVlXSA6XG5cdFx0XHRsaW5lIGluc3RhbmNlb2YgQXNzaWduRGVzdHJ1Y3R1cmUgP1xuXHRcdFx0bGluZS5hc3NpZ25lZXMgOlxuXHRcdFx0bGluZSBpbnN0YW5jZW9mIE9iakVudHJ5ID9cblx0XHRcdGxpbmVOZXdMb2NhbHMobGluZS5hc3NpZ24pIDpcblx0XHRcdGxpbmUgaW5zdGFuY2VvZiBNb2R1bGVFeHBvcnQgP1xuXHRcdFx0bGluZU5ld0xvY2FscyhsaW5lLmFzc2lnbikgOlxuXHRcdFx0W10sXG5cblx0dmVyaWZ5TGluZXMgPSBsaW5lcyA9PiB7XG5cdFx0Lypcblx0XHRXZSBuZWVkIHRvIGJldCBhbGwgYmxvY2sgbG9jYWxzIHVwLWZyb250IGJlY2F1c2Vcblx0XHRGdW5jdGlvbnMgd2l0aGluIGxpbmVzIGNhbiBhY2Nlc3MgbG9jYWxzIGZyb20gbGF0ZXIgbGluZXMuXG5cdFx0Tk9URTogV2UgcHVzaCB0aGVzZSBvbnRvIHBlbmRpbmdCbG9ja0xvY2FscyBpbiByZXZlcnNlXG5cdFx0c28gdGhhdCB3aGVuIHdlIGl0ZXJhdGUgdGhyb3VnaCBsaW5lcyBmb3J3YXJkcywgd2UgY2FuIHBvcCBmcm9tIHBlbmRpbmdCbG9ja0xvY2Fsc1xuXHRcdHRvIHJlbW92ZSBwZW5kaW5nIGxvY2FscyBhcyB0aGV5IGJlY29tZSByZWFsIGxvY2Fscy5cblx0XHRJdCBkb2Vzbid0IHJlYWxseSBtYXR0ZXIgd2hhdCBvcmRlciB3ZSBhZGQgbG9jYWxzIGluIHNpbmNlIGl0J3Mgbm90IGFsbG93ZWRcblx0XHR0byBoYXZlIHR3byBsb2NhbHMgb2YgdGhlIHNhbWUgbmFtZSBpbiB0aGUgc2FtZSBibG9jay5cblx0XHQqL1xuXHRcdGNvbnN0IG5ld0xvY2FscyA9IFtdXG5cblx0XHRjb25zdCBnZXRMaW5lTG9jYWxzID0gbGluZSA9PiB7XG5cdFx0XHRmb3IgKGNvbnN0IF8gb2YgcmV2ZXJzZUl0ZXIobGluZU5ld0xvY2FscyhsaW5lKSkpIHtcblx0XHRcdFx0Ly8gUmVnaXN0ZXIgdGhlIGxvY2FsIG5vdy4gQ2FuJ3Qgd2FpdCB1bnRpbCB0aGUgYXNzaWduIGlzIHZlcmlmaWVkLlxuXHRcdFx0XHRyZWdpc3RlckxvY2FsKF8pXG5cdFx0XHRcdG5ld0xvY2Fscy5wdXNoKF8pXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGZvciAoY29uc3QgXyBvZiByZXZlcnNlSXRlcihsaW5lcykpXG5cdFx0XHRnZXRMaW5lTG9jYWxzKF8pXG5cdFx0cGVuZGluZ0Jsb2NrTG9jYWxzLnB1c2goLi4ubmV3TG9jYWxzKVxuXG5cdFx0Lypcblx0XHRLZWVwcyB0cmFjayBvZiBsb2NhbHMgd2hpY2ggaGF2ZSBhbHJlYWR5IGJlZW4gYWRkZWQgaW4gdGhpcyBibG9jay5cblx0XHRNYXNvbiBhbGxvd3Mgc2hhZG93aW5nLCBidXQgbm90IHdpdGhpbiB0aGUgc2FtZSBibG9jay5cblx0XHRTbywgdGhpcyBpcyBhbGxvd2VkOlxuXHRcdFx0YSA9IDFcblx0XHRcdGIgPVxuXHRcdFx0XHRhID0gMlxuXHRcdFx0XHQuLi5cblx0XHRCdXQgbm90OlxuXHRcdFx0YSA9IDFcblx0XHRcdGEgPSAyXG5cdFx0Ki9cblx0XHRjb25zdCB0aGlzQmxvY2tMb2NhbE5hbWVzID0gbmV3IFNldCgpXG5cblx0XHQvLyBBbGwgc2hhZG93ZWQgbG9jYWxzIGZvciB0aGlzIGJsb2NrLlxuXHRcdGNvbnN0IHNoYWRvd2VkID0gW11cblxuXHRcdGNvbnN0IHZlcmlmeUxpbmUgPSBsaW5lID0+IHtcblx0XHRcdHZlcmlmeUlzU3RhdGVtZW50KGxpbmUpXG5cdFx0XHRmb3IgKGNvbnN0IG5ld0xvY2FsIG9mIGxpbmVOZXdMb2NhbHMobGluZSkpIHtcblx0XHRcdFx0Y29uc3QgbmFtZSA9IG5ld0xvY2FsLm5hbWVcblx0XHRcdFx0Y29uc3Qgb2xkTG9jYWwgPSBsb2NhbHMuZ2V0KG5hbWUpXG5cdFx0XHRcdGlmIChvbGRMb2NhbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Y2hlY2soIXRoaXNCbG9ja0xvY2FsTmFtZXMuaGFzKG5hbWUpLCBuZXdMb2NhbC5sb2MsXG5cdFx0XHRcdFx0XHQoKSA9PiBgQSBsb2NhbCAke2NvZGUobmFtZSl9IGlzIGFscmVhZHkgaW4gdGhpcyBibG9jay5gKVxuXHRcdFx0XHRcdHNoYWRvd2VkLnB1c2gob2xkTG9jYWwpXG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpc0Jsb2NrTG9jYWxOYW1lcy5hZGQobmFtZSlcblx0XHRcdFx0c2V0TG9jYWwobmV3TG9jYWwpXG5cblx0XHRcdFx0Ly8gTm93IHRoYXQgaXQncyBhZGRlZCBhcyBhIGxvY2FsLCBpdCdzIG5vIGxvbmdlciBwZW5kaW5nLlxuXHRcdFx0XHQvLyBXZSBhZGRlZCBwZW5kaW5nQmxvY2tMb2NhbHMgaW4gdGhlIHJpZ2h0IG9yZGVyIHRoYXQgd2UgY2FuIGp1c3QgcG9wIHRoZW0gb2ZmLlxuXHRcdFx0XHRjb25zdCBwb3BwZWQgPSBwZW5kaW5nQmxvY2tMb2NhbHMucG9wKClcblx0XHRcdFx0YXNzZXJ0KHBvcHBlZCA9PT0gbmV3TG9jYWwpXG5cdFx0XHR9XG5cdFx0XHRsaW5lLnZlcmlmeSgpXG5cdFx0fVxuXG5cdFx0bGluZXMuZm9yRWFjaCh2ZXJpZnlMaW5lKVxuXG5cdFx0bmV3TG9jYWxzLmZvckVhY2goZGVsZXRlTG9jYWwpXG5cdFx0c2hhZG93ZWQuZm9yRWFjaChzZXRMb2NhbClcblxuXHRcdHJldHVybiBuZXdMb2NhbHNcblx0fSxcblxuXHR2ZXJpZnlJc1N0YXRlbWVudCA9IGxpbmUgPT4ge1xuXHRcdGNvbnN0IGlzU3RhdGVtZW50ID1cblx0XHRcdGxpbmUgaW5zdGFuY2VvZiBEbyB8fFxuXHRcdFx0Ly8gU29tZSB2YWx1ZXMgYXJlIGFsc28gYWNjZXB0YWJsZS5cblx0XHRcdGxpbmUgaW5zdGFuY2VvZiBDYWxsIHx8XG5cdFx0XHRsaW5lIGluc3RhbmNlb2YgWWllbGQgfHxcblx0XHRcdGxpbmUgaW5zdGFuY2VvZiBZaWVsZFRvXG5cdFx0Y2hlY2soaXNTdGF0ZW1lbnQsIGxpbmUubG9jLCAnRXhwcmVzc2lvbiBpbiBzdGF0ZW1lbnQgcG9zaXRpb24uJylcblx0fVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

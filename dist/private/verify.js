(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', '../CompileError', './context', './MsAst', './util', './VerifyResults'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('../CompileError'), require('./context'), require('./MsAst'), require('./util'), require('./VerifyResults'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.CompileError, global.context, global.MsAstTypes, global.util, global.VerifyResults);
		global.verify = mod.exports;
	}
})(this, function (exports, module, _CompileError, _context, _MsAst, _util, _VerifyResults) {
	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	module.exports = verify;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _VerifyResults2 = _interopRequireDefault(_VerifyResults);

	/**
 Generates information needed during transpiling, the VerifyResults.
 Also checks for existence of local variables and warns for unused locals.
 @param {MsAst} msAst
 */

	function verify(msAst) {
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
	}

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

			if ((0, _util.isEmpty)(accesses) && !isOkToNotUse(local)) (0, _context.warn)(local.loc, `Unused local variable ${ (0, _CompileError.code)(local.name) }.`);
		}
	};
	const isOkToNotUse = local => local.name === 'built' || okToNotUse.has(local);

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

		BlockValReturn() {
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
			if (this.opReturnType !== null) {
				(0, _context.check)(this.block instanceof _MsAst.BlockVal, this.loc, 'Function with return type must return something.');
				if (this.block instanceof _MsAst.BlockValThrow) (0, _context.warn)('Return type ignored because the block always throws.');
			}

			withBlockLocals(() => {
				withInGenerator(this.isGenerator, () => withLoop(null, () => {
					const allArgs = (0, _util.cat)(this.opDeclareThis, this.args, this.opRestArg);
					verifyAndPlusLocals(allArgs, () => {
						this.block.verify();
						verifyOp(this.opReturnType);
					});
				}));
			});

			// name set by AssignSingle
		},

		Ignore() {
			for (const _ of this.ignoredNames) accessLocal(this, _);
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
			if (builtinPath !== undefined) (0, _context.warn)(this.loc, `Local ${ (0, _CompileError.code)(this.name) } overrides builtin from ${ (0, _CompileError.code)(builtinPath) }.`);
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

		ObjEntryPlain() {
			accessLocal(this, 'built');
			verifyName(this.name);
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
				if (this.declare.name === '_') okToNotUse.add(this.declare);
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

	// Shared implementations

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
		this.try.verify();
		verifyOp(this.catch);
		verifyOp(this.finally);
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

	// Helpers specific to certain MsAst types

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

	// General utilities

	function getLocalDeclare(name, accessLoc) {
		const declare = locals.get(name);
		if (declare === undefined) failMissingLocal(accessLoc, name);
		return declare;
	}

	function failMissingLocal(loc, name) {
		// TODO:ES6 `Array.from(locals.keys())` should work
		const keys = [];
		for (const key of locals.keys()) keys.push(key);
		const showLocals = (0, _CompileError.code)(keys.join(' '));
		(0, _context.fail)(loc, `No such local ${ (0, _CompileError.code)(name) }.\nLocals are:\n${ showLocals }.`);
	}

	function lineNewLocals(line) {
		return line instanceof _MsAst.AssignSingle ? [line.assignee] : line instanceof _MsAst.AssignDestructure ? line.assignees : line instanceof _MsAst.ObjEntry ? lineNewLocals(line.assign) : line instanceof _MsAst.ModuleExport ? lineNewLocals(line.assign) : [];
	}

	function verifyLines(lines) {
		var _pendingBlockLocals;

		/*
  We need to get all block locals up-front because
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
	}

	function verifyIsStatement(line) {
		const isStatement = line instanceof _MsAst.Do ||
		// Some values are also acceptable.
		line instanceof _MsAst.Call || line instanceof _MsAst.Yield || line instanceof _MsAst.YieldTo;
		(0, _context.check)(isStatement, line.loc, 'Expression in statement position.');
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztrQkFhd0IsTUFBTTs7Ozs7Ozs7Ozs7O0FBQWYsVUFBUyxNQUFNLENBQUMsS0FBSyxFQUFFO0FBQ3JDLFFBQU0sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQ2xCLG9CQUFrQixHQUFHLEVBQUUsQ0FBQTtBQUN2QixlQUFhLEdBQUcsS0FBSyxDQUFBO0FBQ3JCLFlBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQ3RCLFFBQU0sR0FBRyxJQUFJLENBQUE7QUFDYixRQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2IsU0FBTyxHQUFHLDZCQUFtQixDQUFBOztBQUU3QixPQUFLLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDZCxnQkFBYyxFQUFFLENBQUE7O0FBRWhCLFFBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQTs7QUFFbkIsUUFBTSxHQUFHLFVBQVUsR0FBRyxNQUFNLEdBQUcsa0JBQWtCLEdBQUcsTUFBTSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUE7QUFDM0UsU0FBTyxHQUFHLENBQUE7RUFDVjs7O0FBR0Q7O0FBRUMsT0FBTTs7QUFFTixXQUFVLEVBQ1YsTUFBTTs7Ozs7Ozs7Ozs7Ozs7O0FBZU4sbUJBQWtCOztBQUVsQixjQUFhOztBQUViLE9BQU0sRUFDTixPQUFPOztBQUVQLEtBQUksQ0FBQTs7QUFFTCxPQUNDLFFBQVEsR0FBRyxDQUFDLElBQUk7QUFDZixNQUFJLENBQUMsS0FBSyxJQUFJLEVBQ2IsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFBO0VBQ1g7T0FFRCxVQUFVLEdBQUcsQ0FBQyxJQUFJO0FBQ2pCLE1BQUksT0FBTyxDQUFDLEtBQUssUUFBUSxFQUN4QixDQUFDLENBQUMsTUFBTSxFQUFFLENBQUE7RUFDWDtPQUVELFdBQVcsR0FBRyxZQUFZLElBQ3pCLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUks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V0FBVyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsbUNBQW1DLENBQUMsQ0FBQTtFQUNqRSIsImZpbGUiOiJ2ZXJpZnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvZGV9IGZyb20gJy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2ssIGZhaWwsIG9wdGlvbnMsIHdhcm59IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCAqIGFzIE1zQXN0VHlwZXMgZnJvbSAnLi9Nc0FzdCdcbmltcG9ydCB7QXNzaWduRGVzdHJ1Y3R1cmUsIEFzc2lnblNpbmdsZSwgQmxvY2tWYWwsIEJsb2NrVmFsVGhyb3csIENhbGwsIENsYXNzLCBDb25zdHJ1Y3RvciwgRG8sXG5cdEZvclZhbCwgRnVuLCBNb2R1bGVFeHBvcnQsIE9iakVudHJ5LCBQYXR0ZXJuLCBTdXBlckNhbGxEbywgWWllbGQsIFlpZWxkVG99IGZyb20gJy4vTXNBc3QnXG5pbXBvcnQge2Fzc2VydCwgY2F0LCBpZkVsc2UsIGltcGxlbWVudE1hbnksIGlzRW1wdHksIG9wRWFjaCwgcmV2ZXJzZUl0ZXJ9IGZyb20gJy4vdXRpbCdcbmltcG9ydCBWZXJpZnlSZXN1bHRzIGZyb20gJy4vVmVyaWZ5UmVzdWx0cydcblxuLyoqXG5HZW5lcmF0ZXMgaW5mb3JtYXRpb24gbmVlZGVkIGR1cmluZyB0cmFuc3BpbGluZywgdGhlIFZlcmlmeVJlc3VsdHMuXG5BbHNvIGNoZWNrcyBmb3IgZXhpc3RlbmNlIG9mIGxvY2FsIHZhcmlhYmxlcyBhbmQgd2FybnMgZm9yIHVudXNlZCBsb2NhbHMuXG5AcGFyYW0ge01zQXN0fSBtc0FzdFxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHZlcmlmeShtc0FzdCkge1xuXHRsb2NhbHMgPSBuZXcgTWFwKClcblx0cGVuZGluZ0Jsb2NrTG9jYWxzID0gW11cblx0aXNJbkdlbmVyYXRvciA9IGZhbHNlXG5cdG9rVG9Ob3RVc2UgPSBuZXcgU2V0KClcblx0b3BMb29wID0gbnVsbFxuXHRtZXRob2QgPSBudWxsXG5cdHJlc3VsdHMgPSBuZXcgVmVyaWZ5UmVzdWx0cygpXG5cblx0bXNBc3QudmVyaWZ5KClcblx0dmVyaWZ5TG9jYWxVc2UoKVxuXG5cdGNvbnN0IHJlcyA9IHJlc3VsdHNcblx0Ly8gUmVsZWFzZSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuXHRsb2NhbHMgPSBva1RvTm90VXNlID0gb3BMb29wID0gcGVuZGluZ0Jsb2NrTG9jYWxzID0gbWV0aG9kID0gcmVzdWx0cyA9IG51bGxcblx0cmV0dXJuIHJlc1xufVxuXG4vLyBVc2UgYSB0cmljayBsaWtlIGluIHBhcnNlLmpzIGFuZCBoYXZlIGV2ZXJ5dGhpbmcgY2xvc2Ugb3ZlciB0aGVzZSBtdXRhYmxlIHZhcmlhYmxlcy5cbmxldFxuXHQvLyBNYXAgZnJvbSBuYW1lcyB0byBMb2NhbERlY2xhcmVzLlxuXHRsb2NhbHMsXG5cdC8vIExvY2FscyB0aGF0IGRvbid0IGhhdmUgdG8gYmUgYWNjZXNzZWQuXG5cdG9rVG9Ob3RVc2UsXG5cdG9wTG9vcCxcblx0Lypcblx0TG9jYWxzIGZvciB0aGlzIGJsb2NrLlxuXHRUaGVzZSBhcmUgYWRkZWQgdG8gbG9jYWxzIHdoZW4gZW50ZXJpbmcgYSBGdW5jdGlvbiBvciBsYXp5IGV2YWx1YXRpb24uXG5cdEluOlxuXHRcdGEgPSB8XG5cdFx0XHRiXG5cdFx0YiA9IDFcblx0YGJgIHdpbGwgYmUgYSBwZW5kaW5nIGxvY2FsLlxuXHRIb3dldmVyOlxuXHRcdGEgPSBiXG5cdFx0YiA9IDFcblx0d2lsbCBmYWlsIHRvIHZlcmlmeSwgYmVjYXVzZSBgYmAgY29tZXMgYWZ0ZXIgYGFgIGFuZCBpcyBub3QgYWNjZXNzZWQgaW5zaWRlIGEgZnVuY3Rpb24uXG5cdEl0IHdvdWxkIHdvcmsgZm9yIGB+YSBpcyBiYCwgdGhvdWdoLlxuXHQqL1xuXHRwZW5kaW5nQmxvY2tMb2NhbHMsXG5cdC8vIFdoZXRoZXIgd2UgYXJlIGN1cnJlbnRseSBhYmxlIHRvIHlpZWxkLlxuXHRpc0luR2VuZXJhdG9yLFxuXHQvLyBDdXJyZW50IG1ldGhvZCB3ZSBhcmUgaW4sIG9yIGEgQ29uc3RydWN0b3IsIG9yIG51bGwuXG5cdG1ldGhvZCxcblx0cmVzdWx0cyxcblx0Ly8gTmFtZSBvZiB0aGUgY2xvc2VzdCBBc3NpZ25TaW5nbGVcblx0bmFtZVxuXG5jb25zdFxuXHR2ZXJpZnlPcCA9IF8gPT4ge1xuXHRcdGlmIChfICE9PSBudWxsKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHR9LFxuXG5cdHZlcmlmeU5hbWUgPSBfID0+IHtcblx0XHRpZiAodHlwZW9mIF8gIT09ICdzdHJpbmcnKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHR9LFxuXG5cdGRlbGV0ZUxvY2FsID0gbG9jYWxEZWNsYXJlID0+XG5cdFx0bG9jYWxzLmRlbGV0ZShsb2NhbERlY2xhcmUubmFtZSksXG5cblx0c2V0TG9jYWwgPSBsb2NhbERlY2xhcmUgPT5cblx0XHRsb2NhbHMuc2V0KGxvY2FsRGVjbGFyZS5uYW1lLCBsb2NhbERlY2xhcmUpLFxuXG5cdGFjY2Vzc0xvY2FsID0gKGFjY2VzcywgbmFtZSkgPT4ge1xuXHRcdGNvbnN0IGRlY2xhcmUgPSBnZXRMb2NhbERlY2xhcmUobmFtZSwgYWNjZXNzLmxvYylcblx0XHRzZXREZWNsYXJlQWNjZXNzZWQoZGVjbGFyZSwgYWNjZXNzKVxuXHR9LFxuXG5cdHNldERlY2xhcmVBY2Nlc3NlZCA9IChkZWNsYXJlLCBhY2Nlc3MpID0+IHtcblx0XHRyZXN1bHRzLmxvY2FsRGVjbGFyZVRvQWNjZXNzZXMuZ2V0KGRlY2xhcmUpLnB1c2goYWNjZXNzKVxuXHR9LFxuXG5cdC8vIEZvciBleHByZXNzaW9ucyBhZmZlY3RpbmcgbGluZU5ld0xvY2FscywgdGhleSB3aWxsIGJlIHJlZ2lzdGVyZWQgYmVmb3JlIGJlaW5nIHZlcmlmaWVkLlxuXHQvLyBTbywgTG9jYWxEZWNsYXJlLnZlcmlmeSBqdXN0IHRoZSB0eXBlLlxuXHQvLyBGb3IgbG9jYWxzIG5vdCBhZmZlY3RpbmcgbGluZU5ld0xvY2FscywgdXNlIHRoaXMgaW5zdGVhZCBvZiBqdXN0IGRlY2xhcmUudmVyaWZ5KClcblx0dmVyaWZ5TG9jYWxEZWNsYXJlID0gbG9jYWxEZWNsYXJlID0+IHtcblx0XHRyZWdpc3RlckxvY2FsKGxvY2FsRGVjbGFyZSlcblx0XHRsb2NhbERlY2xhcmUudmVyaWZ5KClcblx0fSxcblxuXHRyZWdpc3RlckxvY2FsID0gbG9jYWxEZWNsYXJlID0+IHtcblx0XHRyZXN1bHRzLmxvY2FsRGVjbGFyZVRvQWNjZXNzZXMuc2V0KGxvY2FsRGVjbGFyZSwgW10pXG5cdH0sXG5cblx0c2V0TmFtZSA9IGV4cHIgPT4ge1xuXHRcdHJlc3VsdHMubmFtZXMuc2V0KGV4cHIsIG5hbWUpXG5cdH1cblxuLy8gVGhlc2UgZnVuY3Rpb25zIGNoYW5nZSB2ZXJpZmllciBzdGF0ZSBhbmQgZWZmaWNpZW50bHkgcmV0dXJuIHRvIHRoZSBvbGQgc3RhdGUgd2hlbiBmaW5pc2hlZC5cbmNvbnN0XG5cdHdpdGhJbkdlbmVyYXRvciA9IChuZXdJc0luR2VuZXJhdG9yLCBhY3Rpb24pID0+IHtcblx0XHRjb25zdCBvbGRJc0luR2VuZXJhdG9yID0gaXNJbkdlbmVyYXRvclxuXHRcdGlzSW5HZW5lcmF0b3IgPSBuZXdJc0luR2VuZXJhdG9yXG5cdFx0YWN0aW9uKClcblx0XHRpc0luR2VuZXJhdG9yID0gb2xkSXNJbkdlbmVyYXRvclxuXHR9LFxuXG5cdHdpdGhMb29wID0gKG5ld0xvb3AsIGFjdGlvbikgPT4ge1xuXHRcdGNvbnN0IG9sZExvb3AgPSBvcExvb3Bcblx0XHRvcExvb3AgPSBuZXdMb29wXG5cdFx0YWN0aW9uKClcblx0XHRvcExvb3AgPSBvbGRMb29wXG5cdH0sXG5cblx0d2l0aE1ldGhvZCA9IChuZXdNZXRob2QsIGFjdGlvbikgPT4ge1xuXHRcdGNvbnN0IG9sZE1ldGhvZCA9IG1ldGhvZFxuXHRcdG1ldGhvZCA9IG5ld01ldGhvZFxuXHRcdGFjdGlvbigpXG5cdFx0bWV0aG9kID0gb2xkTWV0aG9kXG5cdH0sXG5cblx0d2l0aE5hbWUgPSAobmV3TmFtZSwgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgb2xkTmFtZSA9IG5hbWVcblx0XHRuYW1lID0gbmV3TmFtZVxuXHRcdGFjdGlvbigpXG5cdFx0bmFtZSA9IG9sZE5hbWVcblx0fSxcblxuXHQvLyBDYW4ndCBicmVhayBvdXQgb2YgbG9vcCBpbnNpZGUgb2YgSUlGRS5cblx0d2l0aElJRkUgPSBhY3Rpb24gPT4ge1xuXHRcdHdpdGhMb29wKGZhbHNlLCBhY3Rpb24pXG5cdH0sXG5cblx0cGx1c0xvY2FsID0gKGFkZGVkTG9jYWwsIGFjdGlvbikgPT4ge1xuXHRcdGNvbnN0IHNoYWRvd2VkID0gbG9jYWxzLmdldChhZGRlZExvY2FsLm5hbWUpXG5cdFx0bG9jYWxzLnNldChhZGRlZExvY2FsLm5hbWUsIGFkZGVkTG9jYWwpXG5cdFx0YWN0aW9uKClcblx0XHRpZiAoc2hhZG93ZWQgPT09IHVuZGVmaW5lZClcblx0XHRcdGRlbGV0ZUxvY2FsKGFkZGVkTG9jYWwpXG5cdFx0ZWxzZVxuXHRcdFx0c2V0TG9jYWwoc2hhZG93ZWQpXG5cdH0sXG5cblx0Ly8gU2hvdWxkIGhhdmUgdmVyaWZpZWQgdGhhdCBhZGRlZExvY2FscyBhbGwgaGF2ZSBkaWZmZXJlbnQgbmFtZXMuXG5cdHBsdXNMb2NhbHMgPSAoYWRkZWRMb2NhbHMsIGFjdGlvbikgPT4ge1xuXHRcdGNvbnN0IHNoYWRvd2VkTG9jYWxzID0gW11cblx0XHRmb3IgKGNvbnN0IF8gb2YgYWRkZWRMb2NhbHMpIHtcblx0XHRcdGNvbnN0IHNoYWRvd2VkID0gbG9jYWxzLmdldChfLm5hbWUpXG5cdFx0XHRpZiAoc2hhZG93ZWQgIT09IHVuZGVmaW5lZClcblx0XHRcdFx0c2hhZG93ZWRMb2NhbHMucHVzaChzaGFkb3dlZClcblx0XHRcdHNldExvY2FsKF8pXG5cdFx0fVxuXG5cdFx0YWN0aW9uKClcblxuXHRcdGFkZGVkTG9jYWxzLmZvckVhY2goZGVsZXRlTG9jYWwpXG5cdFx0c2hhZG93ZWRMb2NhbHMuZm9yRWFjaChzZXRMb2NhbClcblx0fSxcblxuXHR2ZXJpZnlBbmRQbHVzTG9jYWwgPSAoYWRkZWRMb2NhbCwgYWN0aW9uKSA9PiB7XG5cdFx0dmVyaWZ5TG9jYWxEZWNsYXJlKGFkZGVkTG9jYWwpXG5cdFx0cGx1c0xvY2FsKGFkZGVkTG9jYWwsIGFjdGlvbilcblx0fSxcblxuXHR2ZXJpZnlBbmRQbHVzTG9jYWxzID0gKGFkZGVkTG9jYWxzLCBhY3Rpb24pID0+IHtcblx0XHRhZGRlZExvY2Fscy5mb3JFYWNoKHZlcmlmeUxvY2FsRGVjbGFyZSlcblx0XHRjb25zdCBuYW1lcyA9IG5ldyBTZXQoKVxuXHRcdGZvciAoY29uc3QgXyBvZiBhZGRlZExvY2Fscykge1xuXHRcdFx0Y2hlY2soIW5hbWVzLmhhcyhfLm5hbWUpLCBfLmxvYywgKCkgPT4gYER1cGxpY2F0ZSBsb2NhbCAke2NvZGUoXy5uYW1lKX1gKVxuXHRcdFx0bmFtZXMuYWRkKF8ubmFtZSlcblx0XHR9XG5cdFx0cGx1c0xvY2FscyhhZGRlZExvY2FscywgYWN0aW9uKVxuXHR9LFxuXG5cdHdpdGhCbG9ja0xvY2FscyA9IGFjdGlvbiA9PiB7XG5cdFx0Y29uc3Qgb2xkUGVuZGluZ0Jsb2NrTG9jYWxzID0gcGVuZGluZ0Jsb2NrTG9jYWxzXG5cdFx0cGVuZGluZ0Jsb2NrTG9jYWxzID0gW11cblx0XHRwbHVzTG9jYWxzKG9sZFBlbmRpbmdCbG9ja0xvY2FscywgYWN0aW9uKVxuXHRcdHBlbmRpbmdCbG9ja0xvY2FscyA9IG9sZFBlbmRpbmdCbG9ja0xvY2Fsc1xuXHR9XG5cbmNvbnN0IHZlcmlmeUxvY2FsVXNlID0gKCkgPT4ge1xuXHRmb3IgKGNvbnN0IFtsb2NhbCwgYWNjZXNzZXNdIG9mIHJlc3VsdHMubG9jYWxEZWNsYXJlVG9BY2Nlc3Nlcylcblx0XHRpZiAoaXNFbXB0eShhY2Nlc3NlcykgJiYgIWlzT2tUb05vdFVzZShsb2NhbCkpXG5cdFx0XHR3YXJuKGxvY2FsLmxvYywgYFVudXNlZCBsb2NhbCB2YXJpYWJsZSAke2NvZGUobG9jYWwubmFtZSl9LmApXG59XG5jb25zdCBpc09rVG9Ob3RVc2UgPSBsb2NhbCA9PlxuXHRsb2NhbC5uYW1lID09PSAnYnVpbHQnIHx8IG9rVG9Ob3RVc2UuaGFzKGxvY2FsKVxuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICd2ZXJpZnknLCB7XG5cdEFzc2VydCgpIHtcblx0XHR0aGlzLmNvbmRpdGlvbi52ZXJpZnkoKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BUaHJvd24pXG5cdH0sXG5cblx0QXNzaWduU2luZ2xlKCkge1xuXHRcdHdpdGhOYW1lKHRoaXMuYXNzaWduZWUubmFtZSwgKCkgPT4ge1xuXHRcdFx0Y29uc3QgZG9WID0gKCkgPT4ge1xuXHRcdFx0XHQvKlxuXHRcdFx0XHRGdW4gYW5kIENsYXNzIG9ubHkgZ2V0IG5hbWUgaWYgdGhleSBhcmUgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIGFzc2lnbm1lbnQuXG5cdFx0XHRcdHNvIGluIGB4ID0gJGFmdGVyLXRpbWUgMTAwMCB8YCB0aGUgZnVuY3Rpb24gaXMgbm90IG5hbWVkLlxuXHRcdFx0XHQqL1xuXHRcdFx0XHRpZiAodGhpcy52YWx1ZSBpbnN0YW5jZW9mIENsYXNzIHx8IHRoaXMudmFsdWUgaW5zdGFuY2VvZiBGdW4pXG5cdFx0XHRcdFx0c2V0TmFtZSh0aGlzLnZhbHVlKVxuXG5cdFx0XHRcdC8vIEFzc2lnbmVlIHJlZ2lzdGVyZWQgYnkgdmVyaWZ5TGluZXMuXG5cdFx0XHRcdHRoaXMuYXNzaWduZWUudmVyaWZ5KClcblx0XHRcdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMuYXNzaWduZWUuaXNMYXp5KCkpXG5cdFx0XHRcdHdpdGhCbG9ja0xvY2Fscyhkb1YpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGRvVigpXG5cdFx0fSlcblx0fSxcblxuXHRBc3NpZ25EZXN0cnVjdHVyZSgpIHtcblx0XHQvLyBBc3NpZ25lZXMgcmVnaXN0ZXJlZCBieSB2ZXJpZnlMaW5lcy5cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hc3NpZ25lZXMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdEJhZ0VudHJ5OiB2ZXJpZnlCYWdFbnRyeSxcblx0QmFnRW50cnlNYW55OiB2ZXJpZnlCYWdFbnRyeSxcblxuXHRCYWdTaW1wbGUoKSB7XG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMucGFydHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0QmxvY2tEbygpIHtcblx0XHR2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHR9LFxuXG5cdEJsb2NrVmFsVGhyb3coKSB7XG5cdFx0Y29uc3QgbmV3TG9jYWxzID0gdmVyaWZ5TGluZXModGhpcy5saW5lcylcblx0XHRwbHVzTG9jYWxzKG5ld0xvY2FscywgKCkgPT4gdGhpcy50aHJvdy52ZXJpZnkoKSlcblx0fSxcblxuXHRCbG9ja1ZhbFJldHVybigpIHtcblx0XHRjb25zdCBuZXdMb2NhbHMgPSB2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHRcdHBsdXNMb2NhbHMobmV3TG9jYWxzLCAoKSA9PiB0aGlzLnJldHVybmVkLnZlcmlmeSgpKVxuXHR9LFxuXG5cblx0QmxvY2tPYmo6IHZlcmlmeUJsb2NrQnVpbGQsXG5cdEJsb2NrQmFnOiB2ZXJpZnlCbG9ja0J1aWxkLFxuXHRCbG9ja01hcDogdmVyaWZ5QmxvY2tCdWlsZCxcblxuXHRCbG9ja1dyYXAoKSB7XG5cdFx0d2l0aElJRkUoKCkgPT4gdGhpcy5ibG9jay52ZXJpZnkoKSlcblx0fSxcblxuXHRCcmVhaygpIHtcblx0XHR2ZXJpZnlJbkxvb3AodGhpcylcblx0XHRjaGVjayghKG9wTG9vcCBpbnN0YW5jZW9mIEZvclZhbCksIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0YCR7Y29kZSgnZm9yJyl9IG11c3QgYnJlYWsgd2l0aCBhIHZhbHVlLmApXG5cdH0sXG5cblx0QnJlYWtXaXRoVmFsKCkge1xuXHRcdHZlcmlmeUluTG9vcCh0aGlzKVxuXHRcdGNoZWNrKG9wTG9vcCBpbnN0YW5jZW9mIEZvclZhbCwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRgJHtjb2RlKCdicmVhaycpfSBvbmx5IHZhbGlkIGluc2lkZSAke2NvZGUoJ2ZvcicpfWApXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdENhbGwoKSB7XG5cdFx0dGhpcy5jYWxsZWQudmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hcmdzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHR9LFxuXG5cdENhc2VEbygpIHtcblx0XHR2ZXJpZnlDYXNlKHRoaXMpXG5cdH0sXG5cdENhc2VEb1BhcnQ6IHZlcmlmeUNhc2VQYXJ0LFxuXHRDYXNlVmFsKCkge1xuXHRcdHdpdGhJSUZFKCgpID0+IHZlcmlmeUNhc2UodGhpcykpXG5cdH0sXG5cdENhc2VWYWxQYXJ0OiB2ZXJpZnlDYXNlUGFydCxcblxuXHRDYXRjaCgpIHtcblx0XHRjaGVjayh0aGlzLmNhdWdodC5vcFR5cGUgPT09IG51bGwsIHRoaXMuY2F1Z2h0LmxvYywgJ1RPRE86IENhdWdodCB0eXBlcycpXG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuY2F1Z2h0LCAoKSA9PiB0aGlzLmJsb2NrLnZlcmlmeSgpKVxuXHR9LFxuXG5cdENsYXNzKCkge1xuXHRcdHZlcmlmeU9wKHRoaXMub3BTdXBlckNsYXNzKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BEbylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5zdGF0aWNzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdGlmICh0aGlzLm9wQ29uc3RydWN0b3IgIT09IG51bGwpXG5cdFx0XHR0aGlzLm9wQ29uc3RydWN0b3IudmVyaWZ5KHRoaXMub3BTdXBlckNsYXNzICE9PSBudWxsKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLm1ldGhvZHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0Ly8gbmFtZSBzZXQgYnkgQXNzaWduU2luZ2xlXG5cdH0sXG5cblx0Q2xhc3NEbygpIHtcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5kZWNsYXJlRm9jdXMsICgpID0+IHRoaXMuYmxvY2sudmVyaWZ5KCkpXG5cdH0sXG5cblx0Q29uZCgpIHtcblx0XHR0aGlzLnRlc3QudmVyaWZ5KClcblx0XHR0aGlzLmlmVHJ1ZS52ZXJpZnkoKVxuXHRcdHRoaXMuaWZGYWxzZS52ZXJpZnkoKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsRG8oKSB7XG5cdFx0dGhpcy50ZXN0LnZlcmlmeSgpXG5cdFx0dGhpcy5yZXN1bHQudmVyaWZ5KClcblx0fSxcblx0Q29uZGl0aW9uYWxWYWwoKSB7XG5cdFx0dGhpcy50ZXN0LnZlcmlmeSgpXG5cdFx0d2l0aElJRkUoKCkgPT4gdGhpcy5yZXN1bHQudmVyaWZ5KCkpXG5cdH0sXG5cblx0Q29uc3RydWN0b3IoY2xhc3NIYXNTdXBlcikge1xuXHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZnVuLm9wRGVjbGFyZVRoaXMpXG5cdFx0d2l0aE1ldGhvZCh0aGlzLCAoKSA9PiB7IHRoaXMuZnVuLnZlcmlmeSgpIH0pXG5cblx0XHRjb25zdCBzdXBlckNhbGwgPSByZXN1bHRzLmNvbnN0cnVjdG9yVG9TdXBlci5nZXQodGhpcylcblxuXHRcdGlmIChjbGFzc0hhc1N1cGVyKVxuXHRcdFx0Y2hlY2soc3VwZXJDYWxsICE9PSB1bmRlZmluZWQsIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0XHRgQ29uc3RydWN0b3IgbXVzdCBjb250YWluICR7Y29kZSgnc3VwZXIhJyl9YClcblx0XHRlbHNlXG5cdFx0XHRjaGVjayhzdXBlckNhbGwgPT09IHVuZGVmaW5lZCwgKCkgPT4gc3VwZXJDYWxsLmxvYywgKCkgPT5cblx0XHRcdFx0YENsYXNzIGhhcyBubyBzdXBlcmNsYXNzLCBzbyAke2NvZGUoJ3N1cGVyIScpfSBpcyBub3QgYWxsb3dlZC5gKVxuXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMubWVtYmVyQXJncylcblx0XHRcdHNldERlY2xhcmVBY2Nlc3NlZChfLCB0aGlzKVxuXHR9LFxuXG5cdEV4Y2VwdERvOiB2ZXJpZnlFeGNlcHQsXG5cdEV4Y2VwdFZhbDogdmVyaWZ5RXhjZXB0LFxuXG5cdEZvckJhZygpIHtcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5idWlsdCwgKCkgPT4gdmVyaWZ5Rm9yKHRoaXMpKVxuXHR9LFxuXG5cdEZvckRvKCkge1xuXHRcdHZlcmlmeUZvcih0aGlzKVxuXHR9LFxuXG5cdEZvclZhbCgpIHtcblx0XHR2ZXJpZnlGb3IodGhpcylcblx0fSxcblxuXHRGdW4oKSB7XG5cdFx0aWYgKHRoaXMub3BSZXR1cm5UeXBlICE9PSBudWxsKSB7XG5cdFx0XHRjaGVjayh0aGlzLmJsb2NrIGluc3RhbmNlb2YgQmxvY2tWYWwsIHRoaXMubG9jLFxuXHRcdFx0XHQnRnVuY3Rpb24gd2l0aCByZXR1cm4gdHlwZSBtdXN0IHJldHVybiBzb21ldGhpbmcuJylcblx0XHRcdGlmICh0aGlzLmJsb2NrIGluc3RhbmNlb2YgQmxvY2tWYWxUaHJvdylcblx0XHRcdFx0d2FybignUmV0dXJuIHR5cGUgaWdub3JlZCBiZWNhdXNlIHRoZSBibG9jayBhbHdheXMgdGhyb3dzLicpXG5cdFx0fVxuXG5cdFx0d2l0aEJsb2NrTG9jYWxzKCgpID0+IHtcblx0XHRcdHdpdGhJbkdlbmVyYXRvcih0aGlzLmlzR2VuZXJhdG9yLCAoKSA9PlxuXHRcdFx0XHR3aXRoTG9vcChudWxsLCAoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgYWxsQXJncyA9IGNhdCh0aGlzLm9wRGVjbGFyZVRoaXMsIHRoaXMuYXJncywgdGhpcy5vcFJlc3RBcmcpXG5cdFx0XHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FscyhhbGxBcmdzLCAoKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLmJsb2NrLnZlcmlmeSgpXG5cdFx0XHRcdFx0XHR2ZXJpZnlPcCh0aGlzLm9wUmV0dXJuVHlwZSlcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9KSlcblx0XHR9KVxuXG5cdFx0Ly8gbmFtZSBzZXQgYnkgQXNzaWduU2luZ2xlXG5cdH0sXG5cblx0SWdub3JlKCkge1xuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmlnbm9yZWROYW1lcylcblx0XHRcdGFjY2Vzc0xvY2FsKHRoaXMsIF8pXG5cdH0sXG5cblx0TGF6eSgpIHtcblx0XHR3aXRoQmxvY2tMb2NhbHMoKCkgPT4gdGhpcy52YWx1ZS52ZXJpZnkoKSlcblx0fSxcblxuXHRMb2NhbEFjY2VzcygpIHtcblx0XHRjb25zdCBkZWNsYXJlID0gbG9jYWxzLmdldCh0aGlzLm5hbWUpXG5cdFx0aWYgKGRlY2xhcmUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3QgYnVpbHRpblBhdGggPSBvcHRpb25zLmJ1aWx0aW5OYW1lVG9QYXRoLmdldCh0aGlzLm5hbWUpXG5cdFx0XHRpZiAoYnVpbHRpblBhdGggPT09IHVuZGVmaW5lZClcblx0XHRcdFx0ZmFpbE1pc3NpbmdMb2NhbCh0aGlzLmxvYywgdGhpcy5uYW1lKVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGNvbnN0IG5hbWVzID0gcmVzdWx0cy5idWlsdGluUGF0aFRvTmFtZXMuZ2V0KGJ1aWx0aW5QYXRoKVxuXHRcdFx0XHRpZiAobmFtZXMgPT09IHVuZGVmaW5lZClcblx0XHRcdFx0XHRyZXN1bHRzLmJ1aWx0aW5QYXRoVG9OYW1lcy5zZXQoYnVpbHRpblBhdGgsIG5ldyBTZXQoW3RoaXMubmFtZV0pKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0bmFtZXMuYWRkKHRoaXMubmFtZSlcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzdWx0cy5sb2NhbEFjY2Vzc1RvRGVjbGFyZS5zZXQodGhpcywgZGVjbGFyZSlcblx0XHRcdHNldERlY2xhcmVBY2Nlc3NlZChkZWNsYXJlLCB0aGlzKVxuXHRcdH1cblx0fSxcblxuXHQvLyBBZGRpbmcgTG9jYWxEZWNsYXJlcyB0byB0aGUgYXZhaWxhYmxlIGxvY2FscyBpcyBkb25lIGJ5IEZ1biBvciBsaW5lTmV3TG9jYWxzLlxuXHRMb2NhbERlY2xhcmUoKSB7XG5cdFx0Y29uc3QgYnVpbHRpblBhdGggPSBvcHRpb25zLmJ1aWx0aW5OYW1lVG9QYXRoLmdldCh0aGlzLm5hbWUpXG5cdFx0aWYgKGJ1aWx0aW5QYXRoICE9PSB1bmRlZmluZWQpXG5cdFx0XHR3YXJuKHRoaXMubG9jLCBgTG9jYWwgJHtjb2RlKHRoaXMubmFtZSl9IG92ZXJyaWRlcyBidWlsdGluIGZyb20gJHtjb2RlKGJ1aWx0aW5QYXRoKX0uYClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVHlwZSlcblx0fSxcblxuXHRMb2NhbE11dGF0ZSgpIHtcblx0XHRjb25zdCBkZWNsYXJlID0gZ2V0TG9jYWxEZWNsYXJlKHRoaXMubmFtZSwgdGhpcy5sb2MpXG5cdFx0Y2hlY2soZGVjbGFyZS5pc011dGFibGUoKSwgdGhpcy5sb2MsICgpID0+IGAke2NvZGUodGhpcy5uYW1lKX0gaXMgbm90IG11dGFibGUuYClcblx0XHQvLyBUT0RPOiBUcmFjayBtdXRhdGlvbnMuIE11dGFibGUgbG9jYWwgbXVzdCBiZSBtdXRhdGVkIHNvbWV3aGVyZS5cblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0TG9naWMoKSB7XG5cdFx0Y2hlY2sodGhpcy5hcmdzLmxlbmd0aCA+IDEsICdMb2dpYyBleHByZXNzaW9uIG5lZWRzIGF0IGxlYXN0IDIgYXJndW1lbnRzLicpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHROb3QoKSB7XG5cdFx0dGhpcy5hcmcudmVyaWZ5KClcblx0fSxcblxuXHROdW1iZXJMaXRlcmFsKCkgeyB9LFxuXG5cdE1hcEVudHJ5KCkge1xuXHRcdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdFx0dGhpcy5rZXkudmVyaWZ5KClcblx0XHR0aGlzLnZhbC52ZXJpZnkoKVxuXHR9LFxuXG5cdE1lbWJlcigpIHtcblx0XHR0aGlzLm9iamVjdC52ZXJpZnkoKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdE1lbWJlclNldCgpIHtcblx0XHR0aGlzLm9iamVjdC52ZXJpZnkoKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BUeXBlKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0fSxcblxuXHRNZXRob2RJbXBsKCkge1xuXHRcdHZlcmlmeU1ldGhvZCh0aGlzLCAoKSA9PiB7XG5cdFx0XHRva1RvTm90VXNlLmFkZCh0aGlzLmZ1bi5vcERlY2xhcmVUaGlzKVxuXHRcdFx0dGhpcy5mdW4udmVyaWZ5KClcblx0XHR9KVxuXHR9LFxuXHRNZXRob2RHZXR0ZXIoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kKHRoaXMsICgpID0+IHtcblx0XHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZGVjbGFyZVRoaXMpXG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKFt0aGlzLmRlY2xhcmVUaGlzXSwgKCkgPT4geyB0aGlzLmJsb2NrLnZlcmlmeSgpIH0pXG5cdFx0fSlcblx0fSxcblx0TWV0aG9kU2V0dGVyKCkge1xuXHRcdHZlcmlmeU1ldGhvZCh0aGlzLCAoKSA9PiB7XG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKFt0aGlzLmRlY2xhcmVUaGlzLCB0aGlzLmRlY2xhcmVGb2N1c10sICgpID0+IHtcblx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoKVxuXHRcdFx0fSlcblx0XHR9KVxuXHR9LFxuXG5cdE1vZHVsZSgpIHtcblx0XHQvLyBObyBuZWVkIHRvIHZlcmlmeSB0aGlzLmRvSW1wb3J0cy5cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5pbXBvcnRzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BJbXBvcnRHbG9iYWwpXG5cblx0XHR3aXRoTmFtZShvcHRpb25zLm1vZHVsZU5hbWUoKSwgKCkgPT4ge1xuXHRcdFx0dmVyaWZ5TGluZXModGhpcy5saW5lcylcblx0XHR9KVxuXHR9LFxuXG5cdE1vZHVsZUV4cG9ydCgpIHtcblx0XHR0aGlzLmFzc2lnbi52ZXJpZnkoKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFzc2lnbi5hbGxBc3NpZ25lZXMoKSlcblx0XHRcdHNldERlY2xhcmVBY2Nlc3NlZChfLCB0aGlzKVxuXHR9LFxuXG5cdE5ldygpIHtcblx0XHR0aGlzLnR5cGUudmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hcmdzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHR9LFxuXG5cdE9iakVudHJ5QXNzaWduKCkge1xuXHRcdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdFx0dGhpcy5hc3NpZ24udmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hc3NpZ24uYWxsQXNzaWduZWVzKCkpXG5cdFx0XHRzZXREZWNsYXJlQWNjZXNzZWQoXywgdGhpcylcblx0fSxcblxuXHRPYmpFbnRyeVBsYWluKCkge1xuXHRcdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdE9ialNpbXBsZSgpIHtcblx0XHRjb25zdCBrZXlzID0gbmV3IFNldCgpXG5cdFx0Zm9yIChjb25zdCBwYWlyIG9mIHRoaXMucGFpcnMpIHtcblx0XHRcdGNvbnN0IHtrZXksIHZhbHVlfSA9IHBhaXJcblx0XHRcdGNoZWNrKCFrZXlzLmhhcyhrZXkpLCBwYWlyLmxvYywgKCkgPT4gYER1cGxpY2F0ZSBrZXkgJHtrZXl9YClcblx0XHRcdGtleXMuYWRkKGtleSlcblx0XHRcdHZhbHVlLnZlcmlmeSgpXG5cdFx0fVxuXHR9LFxuXG5cdFF1b3RlKCkge1xuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLnBhcnRzKVxuXHRcdFx0dmVyaWZ5TmFtZShfKVxuXHR9LFxuXG5cdFF1b3RlVGVtcGxhdGUoKSB7XG5cdFx0dGhpcy50YWcudmVyaWZ5KClcblx0XHR0aGlzLnF1b3RlLnZlcmlmeSgpXG5cdH0sXG5cblx0U2V0U3ViKCkge1xuXHRcdHRoaXMub2JqZWN0LnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuc3ViYmVkcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVHlwZSlcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0U3BlY2lhbERvKCkgeyB9LFxuXG5cdFNwZWNpYWxWYWwoKSB7XG5cdFx0c2V0TmFtZSh0aGlzKVxuXHR9LFxuXG5cdFNwbGF0KCkge1xuXHRcdHRoaXMuc3BsYXR0ZWQudmVyaWZ5KClcblx0fSxcblxuXHRTdXBlckNhbGw6IHZlcmlmeVN1cGVyQ2FsbCxcblx0U3VwZXJDYWxsRG86IHZlcmlmeVN1cGVyQ2FsbCxcblx0U3VwZXJNZW1iZXIoKSB7XG5cdFx0Y2hlY2sobWV0aG9kICE9PSBudWxsLCB0aGlzLmxvYywgJ011c3QgYmUgaW4gbWV0aG9kLicpXG5cdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdH0sXG5cblx0U3dpdGNoRG8oKSB7XG5cdFx0dmVyaWZ5U3dpdGNoKHRoaXMpXG5cdH0sXG5cdFN3aXRjaERvUGFydDogdmVyaWZ5U3dpdGNoUGFydCxcblx0U3dpdGNoVmFsKCkge1xuXHRcdHdpdGhJSUZFKCgpID0+IHZlcmlmeVN3aXRjaCh0aGlzKSlcblx0fSxcblx0U3dpdGNoVmFsUGFydDogdmVyaWZ5U3dpdGNoUGFydCxcblxuXHRUaHJvdygpIHtcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVGhyb3duKVxuXHR9LFxuXG5cdEltcG9ydDogdmVyaWZ5SW1wb3J0LFxuXHRJbXBvcnRHbG9iYWw6IHZlcmlmeUltcG9ydCxcblxuXHRXaXRoKCkge1xuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0XHR3aXRoSUlGRSgoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5kZWNsYXJlLm5hbWUgPT09ICdfJylcblx0XHRcdFx0b2tUb05vdFVzZS5hZGQodGhpcy5kZWNsYXJlKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuZGVjbGFyZSwgKCkgPT4geyB0aGlzLmJsb2NrLnZlcmlmeSgpIH0pXG5cdFx0fSlcblx0fSxcblxuXHRZaWVsZCgpIHtcblx0XHRjaGVjayhpc0luR2VuZXJhdG9yLCB0aGlzLmxvYywgJ0Nhbm5vdCB5aWVsZCBvdXRzaWRlIG9mIGdlbmVyYXRvciBjb250ZXh0Jylcblx0XHR2ZXJpZnlPcCh0aGlzLm9wWWllbGRlZClcblx0fSxcblxuXHRZaWVsZFRvKCkge1xuXHRcdGNoZWNrKGlzSW5HZW5lcmF0b3IsIHRoaXMubG9jLCAnQ2Fubm90IHlpZWxkIG91dHNpZGUgb2YgZ2VuZXJhdG9yIGNvbnRleHQnKVxuXHRcdHRoaXMueWllbGRlZFRvLnZlcmlmeSgpXG5cdH1cbn0pXG5cbi8vIFNoYXJlZCBpbXBsZW1lbnRhdGlvbnNcblxuZnVuY3Rpb24gdmVyaWZ5QmFnRW50cnkoKSB7XG5cdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdHRoaXMudmFsdWUudmVyaWZ5KClcbn1cblxuZnVuY3Rpb24gdmVyaWZ5QmxvY2tCdWlsZCgpIHtcblx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuYnVpbHQsICgpID0+IHtcblx0XHR2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHR9KVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlDYXNlUGFydCgpIHtcblx0aWYgKHRoaXMudGVzdCBpbnN0YW5jZW9mIFBhdHRlcm4pIHtcblx0XHR0aGlzLnRlc3QudHlwZS52ZXJpZnkoKVxuXHRcdHRoaXMudGVzdC5wYXR0ZXJuZWQudmVyaWZ5KClcblx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKHRoaXMudGVzdC5sb2NhbHMsICgpID0+IHRoaXMucmVzdWx0LnZlcmlmeSgpKVxuXHR9IGVsc2Uge1xuXHRcdHRoaXMudGVzdC52ZXJpZnkoKVxuXHRcdHRoaXMucmVzdWx0LnZlcmlmeSgpXG5cdH1cbn1cblxuZnVuY3Rpb24gdmVyaWZ5U3dpdGNoUGFydCgpIHtcblx0Zm9yIChjb25zdCBfIG9mIHRoaXMudmFsdWVzKVxuXHRcdF8udmVyaWZ5KClcblx0dGhpcy5yZXN1bHQudmVyaWZ5KClcbn1cblxuZnVuY3Rpb24gdmVyaWZ5RXhjZXB0KCkge1xuXHR0aGlzLnRyeS52ZXJpZnkoKVxuXHR2ZXJpZnlPcCh0aGlzLmNhdGNoKVxuXHR2ZXJpZnlPcCh0aGlzLmZpbmFsbHkpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeVN1cGVyQ2FsbCgpIHtcblx0Y2hlY2sobWV0aG9kICE9PSBudWxsLCB0aGlzLmxvYywgJ011c3QgYmUgaW4gYSBtZXRob2QuJylcblx0cmVzdWx0cy5zdXBlckNhbGxUb01ldGhvZC5zZXQodGhpcywgbWV0aG9kKVxuXG5cdGlmIChtZXRob2QgaW5zdGFuY2VvZiBDb25zdHJ1Y3Rvcikge1xuXHRcdGNoZWNrKHRoaXMgaW5zdGFuY2VvZiBTdXBlckNhbGxEbywgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRgJHtjb2RlKCdzdXBlcicpfSBub3Qgc3VwcG9ydGVkIGluIGNvbnN0cnVjdG9yOyB1c2UgJHtjb2RlKCdzdXBlciEnKX1gKVxuXHRcdHJlc3VsdHMuY29uc3RydWN0b3JUb1N1cGVyLnNldChtZXRob2QsIHRoaXMpXG5cdH1cblxuXHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hcmdzKVxuXHRcdF8udmVyaWZ5KClcbn1cblxuZnVuY3Rpb24gdmVyaWZ5SW1wb3J0KCkge1xuXHQvLyBTaW5jZSBVc2VzIGFyZSBhbHdheXMgaW4gdGhlIG91dGVybW9zdCBzY29wZSwgZG9uJ3QgaGF2ZSB0byB3b3JyeSBhYm91dCBzaGFkb3dpbmcuXG5cdC8vIFNvIHdlIG11dGF0ZSBgbG9jYWxzYCBkaXJlY3RseS5cblx0Y29uc3QgYWRkVXNlTG9jYWwgPSBfID0+IHtcblx0XHRjb25zdCBwcmV2ID0gbG9jYWxzLmdldChfLm5hbWUpXG5cdFx0Y2hlY2socHJldiA9PT0gdW5kZWZpbmVkLCBfLmxvYywgKCkgPT5cblx0XHRcdGAke2NvZGUoXy5uYW1lKX0gYWxyZWFkeSBpbXBvcnRlZCBhdCAke3ByZXYubG9jfWApXG5cdFx0dmVyaWZ5TG9jYWxEZWNsYXJlKF8pXG5cdFx0c2V0TG9jYWwoXylcblx0fVxuXHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5pbXBvcnRlZClcblx0XHRhZGRVc2VMb2NhbChfKVxuXHRvcEVhY2godGhpcy5vcEltcG9ydERlZmF1bHQsIGFkZFVzZUxvY2FsKVxufVxuXG4vLyBIZWxwZXJzIHNwZWNpZmljIHRvIGNlcnRhaW4gTXNBc3QgdHlwZXNcblxuY29uc3Rcblx0dmVyaWZ5Rm9yID0gZm9yTG9vcCA9PiB7XG5cdFx0Y29uc3QgdmVyaWZ5QmxvY2sgPSAoKSA9PiB3aXRoTG9vcChmb3JMb29wLCAoKSA9PiBmb3JMb29wLmJsb2NrLnZlcmlmeSgpKVxuXHRcdGlmRWxzZShmb3JMb29wLm9wSXRlcmF0ZWUsXG5cdFx0XHQoe2VsZW1lbnQsIGJhZ30pID0+IHtcblx0XHRcdFx0YmFnLnZlcmlmeSgpXG5cdFx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbChlbGVtZW50LCB2ZXJpZnlCbG9jaylcblx0XHRcdH0sXG5cdFx0XHR2ZXJpZnlCbG9jaylcblx0fSxcblxuXHR2ZXJpZnlJbkxvb3AgPSBsb29wVXNlciA9PlxuXHRcdGNoZWNrKG9wTG9vcCAhPT0gbnVsbCwgbG9vcFVzZXIubG9jLCAnTm90IGluIGEgbG9vcC4nKSxcblxuXHR2ZXJpZnlDYXNlID0gXyA9PiB7XG5cdFx0Y29uc3QgZG9JdCA9ICgpID0+IHtcblx0XHRcdGZvciAoY29uc3QgcGFydCBvZiBfLnBhcnRzKVxuXHRcdFx0XHRwYXJ0LnZlcmlmeSgpXG5cdFx0XHR2ZXJpZnlPcChfLm9wRWxzZSlcblx0XHR9XG5cdFx0aWZFbHNlKF8ub3BDYXNlZCxcblx0XHRcdF8gPT4ge1xuXHRcdFx0XHRfLnZlcmlmeSgpXG5cdFx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbChfLmFzc2lnbmVlLCBkb0l0KVxuXHRcdFx0fSxcblx0XHRcdGRvSXQpXG5cdH0sXG5cblx0dmVyaWZ5TWV0aG9kID0gKF8sIGRvVmVyaWZ5KSA9PiB7XG5cdFx0dmVyaWZ5TmFtZShfLnN5bWJvbClcblx0XHR3aXRoTWV0aG9kKF8sIGRvVmVyaWZ5KVxuXHR9LFxuXG5cdHZlcmlmeVN3aXRjaCA9IF8gPT4ge1xuXHRcdF8uc3dpdGNoZWQudmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IHBhcnQgb2YgXy5wYXJ0cylcblx0XHRcdHBhcnQudmVyaWZ5KClcblx0XHR2ZXJpZnlPcChfLm9wRWxzZSlcblx0fVxuXG4vLyBHZW5lcmFsIHV0aWxpdGllc1xuXG5mdW5jdGlvbiBnZXRMb2NhbERlY2xhcmUobmFtZSwgYWNjZXNzTG9jKSB7XG5cdGNvbnN0IGRlY2xhcmUgPSBsb2NhbHMuZ2V0KG5hbWUpXG5cdGlmIChkZWNsYXJlID09PSB1bmRlZmluZWQpXG5cdFx0ZmFpbE1pc3NpbmdMb2NhbChhY2Nlc3NMb2MsIG5hbWUpXG5cdHJldHVybiBkZWNsYXJlXG59XG5cbmZ1bmN0aW9uIGZhaWxNaXNzaW5nTG9jYWwobG9jLCBuYW1lKSB7XG5cdC8vIFRPRE86RVM2IGBBcnJheS5mcm9tKGxvY2Fscy5rZXlzKCkpYCBzaG91bGQgd29ya1xuXHRjb25zdCBrZXlzID0gW11cblx0Zm9yIChjb25zdCBrZXkgb2YgbG9jYWxzLmtleXMoKSlcblx0XHRrZXlzLnB1c2goa2V5KVxuXHRjb25zdCBzaG93TG9jYWxzID0gY29kZShrZXlzLmpvaW4oJyAnKSlcblx0ZmFpbChsb2MsIGBObyBzdWNoIGxvY2FsICR7Y29kZShuYW1lKX0uXFxuTG9jYWxzIGFyZTpcXG4ke3Nob3dMb2NhbHN9LmApXG59XG5cbmZ1bmN0aW9uIGxpbmVOZXdMb2NhbHMobGluZSkge1xuXHRyZXR1cm4gbGluZSBpbnN0YW5jZW9mIEFzc2lnblNpbmdsZSA/XG5cdFx0W2xpbmUuYXNzaWduZWVdIDpcblx0XHRsaW5lIGluc3RhbmNlb2YgQXNzaWduRGVzdHJ1Y3R1cmUgP1xuXHRcdGxpbmUuYXNzaWduZWVzIDpcblx0XHRsaW5lIGluc3RhbmNlb2YgT2JqRW50cnkgP1xuXHRcdGxpbmVOZXdMb2NhbHMobGluZS5hc3NpZ24pIDpcblx0XHRsaW5lIGluc3RhbmNlb2YgTW9kdWxlRXhwb3J0ID9cblx0XHRsaW5lTmV3TG9jYWxzKGxpbmUuYXNzaWduKSA6XG5cdFx0W11cbn1cblxuZnVuY3Rpb24gdmVyaWZ5TGluZXMobGluZXMpIHtcblx0Lypcblx0V2UgbmVlZCB0byBnZXQgYWxsIGJsb2NrIGxvY2FscyB1cC1mcm9udCBiZWNhdXNlXG5cdEZ1bmN0aW9ucyB3aXRoaW4gbGluZXMgY2FuIGFjY2VzcyBsb2NhbHMgZnJvbSBsYXRlciBsaW5lcy5cblx0Tk9URTogV2UgcHVzaCB0aGVzZSBvbnRvIHBlbmRpbmdCbG9ja0xvY2FscyBpbiByZXZlcnNlXG5cdHNvIHRoYXQgd2hlbiB3ZSBpdGVyYXRlIHRocm91Z2ggbGluZXMgZm9yd2FyZHMsIHdlIGNhbiBwb3AgZnJvbSBwZW5kaW5nQmxvY2tMb2NhbHNcblx0dG8gcmVtb3ZlIHBlbmRpbmcgbG9jYWxzIGFzIHRoZXkgYmVjb21lIHJlYWwgbG9jYWxzLlxuXHRJdCBkb2Vzbid0IHJlYWxseSBtYXR0ZXIgd2hhdCBvcmRlciB3ZSBhZGQgbG9jYWxzIGluIHNpbmNlIGl0J3Mgbm90IGFsbG93ZWRcblx0dG8gaGF2ZSB0d28gbG9jYWxzIG9mIHRoZSBzYW1lIG5hbWUgaW4gdGhlIHNhbWUgYmxvY2suXG5cdCovXG5cdGNvbnN0IG5ld0xvY2FscyA9IFtdXG5cblx0Y29uc3QgZ2V0TGluZUxvY2FscyA9IGxpbmUgPT4ge1xuXHRcdGZvciAoY29uc3QgXyBvZiByZXZlcnNlSXRlcihsaW5lTmV3TG9jYWxzKGxpbmUpKSkge1xuXHRcdFx0Ly8gUmVnaXN0ZXIgdGhlIGxvY2FsIG5vdy4gQ2FuJ3Qgd2FpdCB1bnRpbCB0aGUgYXNzaWduIGlzIHZlcmlmaWVkLlxuXHRcdFx0cmVnaXN0ZXJMb2NhbChfKVxuXHRcdFx0bmV3TG9jYWxzLnB1c2goXylcblx0XHR9XG5cdH1cblx0Zm9yIChjb25zdCBfIG9mIHJldmVyc2VJdGVyKGxpbmVzKSlcblx0XHRnZXRMaW5lTG9jYWxzKF8pXG5cdHBlbmRpbmdCbG9ja0xvY2Fscy5wdXNoKC4uLm5ld0xvY2FscylcblxuXHQvKlxuXHRLZWVwcyB0cmFjayBvZiBsb2NhbHMgd2hpY2ggaGF2ZSBhbHJlYWR5IGJlZW4gYWRkZWQgaW4gdGhpcyBibG9jay5cblx0TWFzb24gYWxsb3dzIHNoYWRvd2luZywgYnV0IG5vdCB3aXRoaW4gdGhlIHNhbWUgYmxvY2suXG5cdFNvLCB0aGlzIGlzIGFsbG93ZWQ6XG5cdFx0YSA9IDFcblx0XHRiID1cblx0XHRcdGEgPSAyXG5cdFx0XHQuLi5cblx0QnV0IG5vdDpcblx0XHRhID0gMVxuXHRcdGEgPSAyXG5cdCovXG5cdGNvbnN0IHRoaXNCbG9ja0xvY2FsTmFtZXMgPSBuZXcgU2V0KClcblxuXHQvLyBBbGwgc2hhZG93ZWQgbG9jYWxzIGZvciB0aGlzIGJsb2NrLlxuXHRjb25zdCBzaGFkb3dlZCA9IFtdXG5cblx0Y29uc3QgdmVyaWZ5TGluZSA9IGxpbmUgPT4ge1xuXHRcdHZlcmlmeUlzU3RhdGVtZW50KGxpbmUpXG5cdFx0Zm9yIChjb25zdCBuZXdMb2NhbCBvZiBsaW5lTmV3TG9jYWxzKGxpbmUpKSB7XG5cdFx0XHRjb25zdCBuYW1lID0gbmV3TG9jYWwubmFtZVxuXHRcdFx0Y29uc3Qgb2xkTG9jYWwgPSBsb2NhbHMuZ2V0KG5hbWUpXG5cdFx0XHRpZiAob2xkTG9jYWwgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRjaGVjayghdGhpc0Jsb2NrTG9jYWxOYW1lcy5oYXMobmFtZSksIG5ld0xvY2FsLmxvYyxcblx0XHRcdFx0XHQoKSA9PiBgQSBsb2NhbCAke2NvZGUobmFtZSl9IGlzIGFscmVhZHkgaW4gdGhpcyBibG9jay5gKVxuXHRcdFx0XHRzaGFkb3dlZC5wdXNoKG9sZExvY2FsKVxuXHRcdFx0fVxuXHRcdFx0dGhpc0Jsb2NrTG9jYWxOYW1lcy5hZGQobmFtZSlcblx0XHRcdHNldExvY2FsKG5ld0xvY2FsKVxuXG5cdFx0XHQvLyBOb3cgdGhhdCBpdCdzIGFkZGVkIGFzIGEgbG9jYWwsIGl0J3Mgbm8gbG9uZ2VyIHBlbmRpbmcuXG5cdFx0XHQvLyBXZSBhZGRlZCBwZW5kaW5nQmxvY2tMb2NhbHMgaW4gdGhlIHJpZ2h0IG9yZGVyIHRoYXQgd2UgY2FuIGp1c3QgcG9wIHRoZW0gb2ZmLlxuXHRcdFx0Y29uc3QgcG9wcGVkID0gcGVuZGluZ0Jsb2NrTG9jYWxzLnBvcCgpXG5cdFx0XHRhc3NlcnQocG9wcGVkID09PSBuZXdMb2NhbClcblx0XHR9XG5cdFx0bGluZS52ZXJpZnkoKVxuXHR9XG5cblx0bGluZXMuZm9yRWFjaCh2ZXJpZnlMaW5lKVxuXG5cdG5ld0xvY2Fscy5mb3JFYWNoKGRlbGV0ZUxvY2FsKVxuXHRzaGFkb3dlZC5mb3JFYWNoKHNldExvY2FsKVxuXG5cdHJldHVybiBuZXdMb2NhbHNcbn1cblxuZnVuY3Rpb24gdmVyaWZ5SXNTdGF0ZW1lbnQobGluZSkge1xuXHRjb25zdCBpc1N0YXRlbWVudCA9XG5cdFx0bGluZSBpbnN0YW5jZW9mIERvIHx8XG5cdFx0Ly8gU29tZSB2YWx1ZXMgYXJlIGFsc28gYWNjZXB0YWJsZS5cblx0XHRsaW5lIGluc3RhbmNlb2YgQ2FsbCB8fFxuXHRcdGxpbmUgaW5zdGFuY2VvZiBZaWVsZCB8fFxuXHRcdGxpbmUgaW5zdGFuY2VvZiBZaWVsZFRvXG5cdGNoZWNrKGlzU3RhdGVtZW50LCBsaW5lLmxvYywgJ0V4cHJlc3Npb24gaW4gc3RhdGVtZW50IHBvc2l0aW9uLicpXG59XG4iXX0=
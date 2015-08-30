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
			for (const method of this.methods) method.verify();
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
				withInGenerator(this.isGenerator, () => withInLoop(false, () => {
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
		},

		GlobalAccess() {},

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
			this.symbol.verify();
			this.fun.verify();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZlcmlmeS5qcyIsInByaXZhdGUvdmVyaWZ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztrQkNZZSxDQUFDLFFBQVEsRUFBRSxLQUFLLEtBQUs7QUFDbkMsU0FBTyxHQUFHLFFBQVEsQ0FBQTtBQUNsQixRQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUNsQixvQkFBa0IsR0FBRyxFQUFHLENBQUE7QUFDeEIsV0FBUyxHQUFHLGFBQWEsR0FBRyxLQUFLLENBQUE7QUFDakMsWUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDdEIsUUFBTSxHQUFHLElBQUksQ0FBQTtBQUNiLFNBQU8sR0FBRyw2QkFBbUIsQ0FBQTs7QUFFN0IsT0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBQ2QsZ0JBQWMsRUFBRSxDQUFBOztBQUVoQixRQUFNLEdBQUcsR0FBRyxPQUFPLENBQUE7O0FBRW5CLFNBQU8sR0FBRyxNQUFNLEdBQUcsVUFBVSxHQUFHLE1BQU0sR0FBRyxrQkFBa0IsR0FBRyxPQUFPLEdBQUcsU0FBUyxDQUFBO0FBQ2pGLFNBQU8sR0FBRyxDQUFBO0VBQ1Y7OztBQUdELEtBQ0MsT0FBTzs7QUFFUCxPQUFNOztBQUVOLFdBQVUsRUFDVixNQUFNOzs7Ozs7Ozs7Ozs7Ozs7QUFlTixtQkFBa0IsRUFDbEIsU0FBUzs7QUFFVCxjQUFhLEVBQ2IsT0FBTyxDQUFBOztBQUVSLE9BQ0MsWUFBWSxHQUFHLEVBQUUsSUFBSTtBQUNwQixNQUFJLEVBQUUsS0FBSyxJQUFJLEVBQ2QsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFBO0VBQ1o7T0FFRCxXQUFXLEdBQUcsWUFBWSxJQUN6QixNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7T0FFakMsUUFBUSxHQUFHLFlBQVksSUFDdEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQzs7Ozs7QUFJNUMscUJBQW9CLEdBQUcs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LEtBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFBO0VBQ3pFLENBQUEiLCJmaWxlIjoicHJpdmF0ZS92ZXJpZnkuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7IGNvZGUgfSBmcm9tICcuLi9Db21waWxlRXJyb3InXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4vTXNBc3QnXG5pbXBvcnQgeyBBc3NpZ24sIEFzc2lnbkRlc3RydWN0dXJlLCBBc3NpZ25TaW5nbGUsIEJsb2NrVmFsLCBDYWxsLCBEZWJ1ZywgRG8sIEZvclZhbCxcblx0TG9jYWxEZWNsYXJlQnVpbHQsIExvY2FsRGVjbGFyZUZvY3VzLCBMb2NhbERlY2xhcmVSZXMsIE9iakVudHJ5LCBQYXR0ZXJuLCBZaWVsZCwgWWllbGRUb1xuXHR9IGZyb20gJy4vTXNBc3QnXG5pbXBvcnQgeyBhc3NlcnQsIGNhdCwgZWFjaFJldmVyc2UsIGhlYWQsIGlmRWxzZSwgaW1wbGVtZW50TWFueSxcblx0aXNFbXB0eSwgaXRlcmF0b3JUb0FycmF5LCBvcEVhY2ggfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgVmVyaWZ5UmVzdWx0cywgeyBMb2NhbEluZm8gfSBmcm9tICcuL1ZlcmlmeVJlc3VsdHMnXG5cbi8qXG5UaGUgdmVyaWZpZXIgZ2VuZXJhdGVzIGluZm9ybWF0aW9uIG5lZWRlZCBkdXJpbmcgdHJhbnNwaWxpbmcsIHRoZSBWZXJpZnlSZXN1bHRzLlxuKi9cbmV4cG9ydCBkZWZhdWx0IChfY29udGV4dCwgbXNBc3QpID0+IHtcblx0Y29udGV4dCA9IF9jb250ZXh0XG5cdGxvY2FscyA9IG5ldyBNYXAoKVxuXHRwZW5kaW5nQmxvY2tMb2NhbHMgPSBbIF1cblx0aXNJbkRlYnVnID0gaXNJbkdlbmVyYXRvciA9IGZhbHNlXG5cdG9rVG9Ob3RVc2UgPSBuZXcgU2V0KClcblx0b3BMb29wID0gbnVsbFxuXHRyZXN1bHRzID0gbmV3IFZlcmlmeVJlc3VsdHMoKVxuXG5cdG1zQXN0LnZlcmlmeSgpXG5cdHZlcmlmeUxvY2FsVXNlKClcblxuXHRjb25zdCByZXMgPSByZXN1bHRzXG5cdC8vIFJlbGVhc2UgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cblx0Y29udGV4dCA9IGxvY2FscyA9IG9rVG9Ob3RVc2UgPSBvcExvb3AgPSBwZW5kaW5nQmxvY2tMb2NhbHMgPSByZXN1bHRzID0gdW5kZWZpbmVkXG5cdHJldHVybiByZXNcbn1cblxuLy8gVXNlIGEgdHJpY2sgbGlrZSBpbiBwYXJzZS5qcyBhbmQgaGF2ZSBldmVyeXRoaW5nIGNsb3NlIG92ZXIgdGhlc2UgbXV0YWJsZSB2YXJpYWJsZXMuXG5sZXRcblx0Y29udGV4dCxcblx0Ly8gTWFwIGZyb20gbmFtZXMgdG8gTG9jYWxEZWNsYXJlcy5cblx0bG9jYWxzLFxuXHQvLyBMb2NhbHMgdGhhdCBkb24ndCBoYXZlIHRvIGJlIGFjY2Vzc2VkLlxuXHRva1RvTm90VXNlLFxuXHRvcExvb3AsXG5cdC8qXG5cdExvY2FscyBmb3IgdGhpcyBibG9jay5cblx0VGhlc2UgYXJlIGFkZGVkIHRvIGxvY2FscyB3aGVuIGVudGVyaW5nIGEgRnVuY3Rpb24gb3IgbGF6eSBldmFsdWF0aW9uLlxuXHRJbjpcblx0XHRhID0gfFxuXHRcdFx0YlxuXHRcdGIgPSAxXG5cdGBiYCB3aWxsIGJlIGEgcGVuZGluZyBsb2NhbC5cblx0SG93ZXZlcjpcblx0XHRhID0gYlxuXHRcdGIgPSAxXG5cdHdpbGwgZmFpbCB0byB2ZXJpZnksIGJlY2F1c2UgYGJgIGNvbWVzIGFmdGVyIGBhYCBhbmQgaXMgbm90IGFjY2Vzc2VkIGluc2lkZSBhIGZ1bmN0aW9uLlxuXHRJdCB3b3VsZCB3b3JrIGZvciBgfmEgaXMgYmAsIHRob3VnaC5cblx0Ki9cblx0cGVuZGluZ0Jsb2NrTG9jYWxzLFxuXHRpc0luRGVidWcsXG5cdC8vIFdoZXRoZXIgd2UgYXJlIGN1cnJlbnRseSBhYmxlIHRvIHlpZWxkLlxuXHRpc0luR2VuZXJhdG9yLFxuXHRyZXN1bHRzXG5cbmNvbnN0XG5cdHZlcmlmeU9wRWFjaCA9IG9wID0+IHtcblx0XHRpZiAob3AgIT09IG51bGwpXG5cdFx0XHRvcC52ZXJpZnkoKVxuXHR9LFxuXG5cdGRlbGV0ZUxvY2FsID0gbG9jYWxEZWNsYXJlID0+XG5cdFx0bG9jYWxzLmRlbGV0ZShsb2NhbERlY2xhcmUubmFtZSksXG5cblx0c2V0TG9jYWwgPSBsb2NhbERlY2xhcmUgPT5cblx0XHRsb2NhbHMuc2V0KGxvY2FsRGVjbGFyZS5uYW1lLCBsb2NhbERlY2xhcmUpLFxuXG5cdC8vIFdoZW4gYSBsb2NhbCBpcyByZXR1cm5lZCBmcm9tIGEgQmxvY2tPYmogb3IgTW9kdWxlLFxuXHQvLyB0aGUgcmV0dXJuICdhY2Nlc3MnIGlzIGNvbnNpZGVyZWQgdG8gYmUgJ2RlYnVnJyBpZiB0aGUgbG9jYWwgaXMuXG5cdGFjY2Vzc0xvY2FsRm9yUmV0dXJuID0gKGRlY2xhcmUsIGFjY2VzcykgPT4ge1xuXHRcdGNvbnN0IGluZm8gPSByZXN1bHRzLmxvY2FsRGVjbGFyZVRvSW5mby5nZXQoZGVjbGFyZSlcblx0XHRfYWRkTG9jYWxBY2Nlc3MoaW5mbywgYWNjZXNzLCBpbmZvLmlzSW5EZWJ1Zylcblx0fSxcblxuXHRhY2Nlc3NMb2NhbCA9IChhY2Nlc3MsIG5hbWUpID0+IHtcblx0XHRjb25zdCBkZWNsYXJlID0gZ2V0TG9jYWxEZWNsYXJlKG5hbWUsIGFjY2Vzcy5sb2MpXG5cdFx0cmVzdWx0cy5sb2NhbEFjY2Vzc1RvRGVjbGFyZS5zZXQoYWNjZXNzLCBkZWNsYXJlKVxuXHRcdF9hZGRMb2NhbEFjY2VzcyhyZXN1bHRzLmxvY2FsRGVjbGFyZVRvSW5mby5nZXQoZGVjbGFyZSksIGFjY2VzcywgaXNJbkRlYnVnKVxuXHR9LFxuXG5cdF9hZGRMb2NhbEFjY2VzcyA9IChsb2NhbEluZm8sIGFjY2VzcywgaXNEZWJ1Z0FjY2VzcykgPT5cblx0XHQoaXNEZWJ1Z0FjY2VzcyA/IGxvY2FsSW5mby5kZWJ1Z0FjY2Vzc2VzIDogbG9jYWxJbmZvLm5vbkRlYnVnQWNjZXNzZXMpLnB1c2goYWNjZXNzKSxcblxuXHQvLyBGb3IgZXhwcmVzc2lvbnMgYWZmZWN0aW5nIGxpbmVOZXdMb2NhbHMsIHRoZXkgd2lsbCBiZSByZWdpc3RlcmVkIGJlZm9yZSBiZWluZyB2ZXJpZmllZC5cblx0Ly8gU28sIExvY2FsRGVjbGFyZS52ZXJpZnkganVzdCB0aGUgdHlwZS5cblx0Ly8gRm9yIGxvY2FscyBub3QgYWZmZWN0aW5nIGxpbmVOZXdMb2NhbHMsIHVzZSB0aGlzIGluc3RlYWQgb2YganVzdCBkZWNsYXJlLnZlcmlmeSgpXG5cdHZlcmlmeUxvY2FsRGVjbGFyZSA9IGxvY2FsRGVjbGFyZSA9PiB7XG5cdFx0cmVnaXN0ZXJMb2NhbChsb2NhbERlY2xhcmUpXG5cdFx0bG9jYWxEZWNsYXJlLnZlcmlmeSgpXG5cdH0sXG5cblx0cmVnaXN0ZXJMb2NhbCA9IGxvY2FsRGVjbGFyZSA9PlxuXHRcdHJlc3VsdHMubG9jYWxEZWNsYXJlVG9JbmZvLnNldChsb2NhbERlY2xhcmUsIExvY2FsSW5mby5lbXB0eShpc0luRGVidWcpKVxuXG4vLyBUaGVzZSBmdW5jdGlvbnMgY2hhbmdlIHZlcmlmaWVyIHN0YXRlIGFuZCBlZmZpY2llbnRseSByZXR1cm4gdG8gdGhlIG9sZCBzdGF0ZSB3aGVuIGZpbmlzaGVkLlxuY29uc3Rcblx0d2l0aEluRGVidWcgPSBhY3Rpb24gPT4ge1xuXHRcdGNvbnN0IG9sZElzSW5EZWJ1ZyA9IGlzSW5EZWJ1Z1xuXHRcdGlzSW5EZWJ1ZyA9IHRydWVcblx0XHRhY3Rpb24oKVxuXHRcdGlzSW5EZWJ1ZyA9IG9sZElzSW5EZWJ1Z1xuXHR9LFxuXG5cdHdpdGhJbkdlbmVyYXRvciA9IChuZXdJc0luR2VuZXJhdG9yLCBhY3Rpb24pID0+IHtcblx0XHRjb25zdCBvbGRJc0luR2VuZXJhdG9yID0gaXNJbkdlbmVyYXRvclxuXHRcdGlzSW5HZW5lcmF0b3IgPSBuZXdJc0luR2VuZXJhdG9yXG5cdFx0YWN0aW9uKClcblx0XHRpc0luR2VuZXJhdG9yID0gb2xkSXNJbkdlbmVyYXRvclxuXHR9LFxuXG5cdHdpdGhJbkxvb3AgPSAobmV3TG9vcCwgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgb2xkTG9vcCA9IG9wTG9vcFxuXHRcdG9wTG9vcCA9IG5ld0xvb3Bcblx0XHRhY3Rpb24oKVxuXHRcdG9wTG9vcCA9IG9sZExvb3Bcblx0fSxcblxuXHRwbHVzTG9jYWwgPSAoYWRkZWRMb2NhbCwgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgc2hhZG93ZWQgPSBsb2NhbHMuZ2V0KGFkZGVkTG9jYWwubmFtZSlcblx0XHRsb2NhbHMuc2V0KGFkZGVkTG9jYWwubmFtZSwgYWRkZWRMb2NhbClcblx0XHRhY3Rpb24oKVxuXHRcdGlmIChzaGFkb3dlZCA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0ZGVsZXRlTG9jYWwoYWRkZWRMb2NhbClcblx0XHRlbHNlXG5cdFx0XHRzZXRMb2NhbChzaGFkb3dlZClcblx0fSxcblxuXHQvLyBTaG91bGQgaGF2ZSB2ZXJpZmllZCB0aGF0IGFkZGVkTG9jYWxzIGFsbCBoYXZlIGRpZmZlcmVudCBuYW1lcy5cblx0cGx1c0xvY2FscyA9IChhZGRlZExvY2FscywgYWN0aW9uKSA9PiB7XG5cdFx0Y29uc3Qgc2hhZG93ZWRMb2NhbHMgPSBbIF1cblx0XHRmb3IgKGNvbnN0IF8gb2YgYWRkZWRMb2NhbHMpIHtcblx0XHRcdGNvbnN0IHNoYWRvd2VkID0gbG9jYWxzLmdldChfLm5hbWUpXG5cdFx0XHRpZiAoc2hhZG93ZWQgIT09IHVuZGVmaW5lZClcblx0XHRcdFx0c2hhZG93ZWRMb2NhbHMucHVzaChzaGFkb3dlZClcblx0XHRcdHNldExvY2FsKF8pXG5cdFx0fVxuXG5cdFx0YWN0aW9uKClcblxuXHRcdGFkZGVkTG9jYWxzLmZvckVhY2goZGVsZXRlTG9jYWwpXG5cdFx0c2hhZG93ZWRMb2NhbHMuZm9yRWFjaChzZXRMb2NhbClcblx0fSxcblxuXHR2ZXJpZnlBbmRQbHVzTG9jYWwgPSAoYWRkZWRMb2NhbCwgYWN0aW9uKSA9PiB7XG5cdFx0dmVyaWZ5TG9jYWxEZWNsYXJlKGFkZGVkTG9jYWwpXG5cdFx0cGx1c0xvY2FsKGFkZGVkTG9jYWwsIGFjdGlvbilcblx0fSxcblxuXHR2ZXJpZnlBbmRQbHVzTG9jYWxzID0gKGFkZGVkTG9jYWxzLCBhY3Rpb24pID0+IHtcblx0XHRhZGRlZExvY2Fscy5mb3JFYWNoKHZlcmlmeUxvY2FsRGVjbGFyZSlcblx0XHRjb25zdCBuYW1lcyA9IG5ldyBTZXQoKVxuXHRcdGZvciAoY29uc3QgXyBvZiBhZGRlZExvY2Fscykge1xuXHRcdFx0Y29udGV4dC5jaGVjayghbmFtZXMuaGFzKF8ubmFtZSksIF8ubG9jLCAoKSA9PlxuXHRcdFx0XHRgRHVwbGljYXRlIGxvY2FsICR7Y29kZShfLm5hbWUpfWApXG5cdFx0XHRuYW1lcy5hZGQoXy5uYW1lKVxuXHRcdH1cblx0XHRwbHVzTG9jYWxzKGFkZGVkTG9jYWxzLCBhY3Rpb24pXG5cdH0sXG5cblx0d2l0aEJsb2NrTG9jYWxzID0gYWN0aW9uID0+IHtcblx0XHRjb25zdCBvbGRQZW5kaW5nQmxvY2tMb2NhbHMgPSBwZW5kaW5nQmxvY2tMb2NhbHNcblx0XHRwZW5kaW5nQmxvY2tMb2NhbHMgPSBbIF1cblx0XHRwbHVzTG9jYWxzKG9sZFBlbmRpbmdCbG9ja0xvY2FscywgYWN0aW9uKVxuXHRcdHBlbmRpbmdCbG9ja0xvY2FscyA9IG9sZFBlbmRpbmdCbG9ja0xvY2Fsc1xuXHR9LFxuXG5cdC8vIENhbid0IGJyZWFrIG91dCBvZiBsb29wIGluc2lkZSBvZiBJSUZFLlxuXHR3aXRoSUlGRSA9IGFjdGlvbiA9PiB7XG5cdFx0d2l0aEluTG9vcChmYWxzZSwgYWN0aW9uKVxuXHR9XG5cbmNvbnN0IHZlcmlmeUxvY2FsVXNlID0gKCkgPT5cblx0cmVzdWx0cy5sb2NhbERlY2xhcmVUb0luZm8uZm9yRWFjaCgoaW5mbywgbG9jYWwpID0+IHtcblx0XHRpZiAoIShsb2NhbCBpbnN0YW5jZW9mIExvY2FsRGVjbGFyZUJ1aWx0IHx8IGxvY2FsIGluc3RhbmNlb2YgTG9jYWxEZWNsYXJlUmVzKSkge1xuXHRcdFx0Y29uc3Qgbm9Ob25EZWJ1ZyA9IGlzRW1wdHkoaW5mby5ub25EZWJ1Z0FjY2Vzc2VzKVxuXHRcdFx0aWYgKG5vTm9uRGVidWcgJiYgaXNFbXB0eShpbmZvLmRlYnVnQWNjZXNzZXMpKVxuXHRcdFx0XHRjb250ZXh0Lndhcm5JZighb2tUb05vdFVzZS5oYXMobG9jYWwpLCBsb2NhbC5sb2MsICgpID0+XG5cdFx0XHRcdFx0YFVudXNlZCBsb2NhbCB2YXJpYWJsZSAke2NvZGUobG9jYWwubmFtZSl9LmApXG5cdFx0XHRlbHNlIGlmIChpbmZvLmlzSW5EZWJ1Zylcblx0XHRcdFx0Y29udGV4dC53YXJuSWYoIW5vTm9uRGVidWcsICgpID0+IGhlYWQoaW5mby5ub25EZWJ1Z0FjY2Vzc2VzKS5sb2MsICgpID0+XG5cdFx0XHRcdFx0YERlYnVnLW9ubHkgbG9jYWwgJHtjb2RlKGxvY2FsLm5hbWUpfSB1c2VkIG91dHNpZGUgb2YgZGVidWcuYClcblx0XHRcdGVsc2Vcblx0XHRcdFx0Y29udGV4dC53YXJuSWYobm9Ob25EZWJ1ZywgbG9jYWwubG9jLCAoKSA9PlxuXHRcdFx0XHRcdGBMb2NhbCAke2NvZGUobG9jYWwubmFtZSl9IHVzZWQgb25seSBpbiBkZWJ1Zy5gKVxuXHRcdH1cblx0fSlcblxuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICd2ZXJpZnknLCB7XG5cdEFzc2VydCgpIHtcblx0XHR0aGlzLmNvbmRpdGlvbi52ZXJpZnkoKVxuXHRcdHZlcmlmeU9wRWFjaCh0aGlzLm9wVGhyb3duKVxuXHR9LFxuXG5cdEFzc2lnblNpbmdsZSgpIHtcblx0XHRjb25zdCBkb1YgPSAoKSA9PiB7XG5cdFx0XHQvLyBBc3NpZ25lZSByZWdpc3RlcmVkIGJ5IHZlcmlmeUxpbmVzLlxuXHRcdFx0dGhpcy5hc3NpZ25lZS52ZXJpZnkoKVxuXHRcdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHRcdH1cblx0XHRpZiAodGhpcy5hc3NpZ25lZS5pc0xhenkoKSlcblx0XHRcdHdpdGhCbG9ja0xvY2Fscyhkb1YpXG5cdFx0ZWxzZVxuXHRcdFx0ZG9WKClcblx0fSxcblxuXHRBc3NpZ25EZXN0cnVjdHVyZSgpIHtcblx0XHQvLyBBc3NpZ25lZXMgcmVnaXN0ZXJlZCBieSB2ZXJpZnlMaW5lcy5cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hc3NpZ25lZXMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdEJhZ0VudHJ5OiB2ZXJpZnlCYWdFbnRyeSxcblx0QmFnRW50cnlNYW55OiB2ZXJpZnlCYWdFbnRyeSxcblxuXHRCYWdTaW1wbGUoKSB7XG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMucGFydHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0QmxvY2tEbygpIHsgdmVyaWZ5TGluZXModGhpcy5saW5lcykgfSxcblxuXHRCbG9ja1ZhbFRocm93KCkge1xuXHRcdGNvbnN0IG5ld0xvY2FscyA9IHZlcmlmeUxpbmVzKHRoaXMubGluZXMpXG5cdFx0cGx1c0xvY2FscyhuZXdMb2NhbHMsICgpID0+IHRoaXMudGhyb3cudmVyaWZ5KCkpXG5cdH0sXG5cblx0QmxvY2tXaXRoUmV0dXJuKCkge1xuXHRcdGNvbnN0IG5ld0xvY2FscyA9IHZlcmlmeUxpbmVzKHRoaXMubGluZXMpXG5cdFx0cGx1c0xvY2FscyhuZXdMb2NhbHMsICgpID0+IHRoaXMucmV0dXJuZWQudmVyaWZ5KCkpXG5cdH0sXG5cblx0QmxvY2tPYmooKSB7XG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuYnVpbHQsICgpID0+IHtcblx0XHRcdGNvbnN0IG5ld0xvY2FscyA9IHZlcmlmeUxpbmVzKHRoaXMubGluZXMpXG5cdFx0XHRvcEVhY2godGhpcy5vcE9iamVkLCBfID0+IHBsdXNMb2NhbHMobmV3TG9jYWxzLCAoKSA9PiBfLnZlcmlmeSgpKSlcblx0XHR9KVxuXHR9LFxuXG5cdEJsb2NrQmFnOiB2ZXJpZnlCbG9ja0JhZ09yTWFwLFxuXHRCbG9ja01hcDogdmVyaWZ5QmxvY2tCYWdPck1hcCxcblxuXHRCbG9ja1dyYXAoKSB7IHdpdGhJSUZFKCgpID0+IHRoaXMuYmxvY2sudmVyaWZ5KCkpIH0sXG5cblx0QnJlYWsoKSB7XG5cdFx0dmVyaWZ5SW5Mb29wKHRoaXMpXG5cdFx0Y29udGV4dC5jaGVjayghKG9wTG9vcCBpbnN0YW5jZW9mIEZvclZhbCksIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0YCR7Y29kZSgnZm9yJyl9IG11c3QgYnJlYWsgd2l0aCBhIHZhbHVlLmApXG5cdH0sXG5cblx0QnJlYWtXaXRoVmFsKCkge1xuXHRcdHZlcmlmeUluTG9vcCh0aGlzKVxuXHRcdGNvbnRleHQuY2hlY2sob3BMb29wIGluc3RhbmNlb2YgRm9yVmFsLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdGAke2NvZGUoJ2JyZWFrJyl9IG9ubHkgdmFsaWQgaW5zaWRlICR7Y29kZSgnZm9yJyl9YClcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0Q2FsbCgpIHtcblx0XHR0aGlzLmNhbGxlZC52ZXJpZnkoKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdH0sXG5cblx0Q2FzZURvKCkgeyB2ZXJpZnlDYXNlKHRoaXMpIH0sXG5cdENhc2VEb1BhcnQ6IHZlcmlmeUNhc2VQYXJ0LFxuXHRDYXNlVmFsKCkgeyB3aXRoSUlGRSgoKSA9PiB2ZXJpZnlDYXNlKHRoaXMpKSB9LFxuXHRDYXNlVmFsUGFydDogdmVyaWZ5Q2FzZVBhcnQsXG5cblx0Q2F0Y2goKSB7XG5cdFx0Y29udGV4dC5jaGVjayh0aGlzLmNhdWdodC5vcFR5cGUgPT09IG51bGwsIHRoaXMuY2F1Z2h0LmxvYywgJ1RPRE86IENhdWdodCB0eXBlcycpXG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuY2F1Z2h0LCAoKSA9PiB0aGlzLmJsb2NrLnZlcmlmeSgpKVxuXHR9LFxuXG5cdENsYXNzKCkge1xuXHRcdHZlcmlmeU9wRWFjaCh0aGlzLm9wU3VwZXJDbGFzcylcblx0XHR2ZXJpZnlPcEVhY2godGhpcy5vcERvKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLnN0YXRpY3MpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0dmVyaWZ5T3BFYWNoKHRoaXMub3BDb25zdHJ1Y3Rvcilcblx0XHRmb3IgKGNvbnN0IG1ldGhvZCBvZiB0aGlzLm1ldGhvZHMpXG5cdFx0XHRtZXRob2QudmVyaWZ5KClcblx0fSxcblxuXHRDbGFzc0RvKCkge1xuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmRlY2xhcmVGb2N1cywgKCkgPT4gdGhpcy5ibG9jay52ZXJpZnkoKSlcblx0fSxcblxuXHRDb25kaXRpb25hbERvKCkge1xuXHRcdHRoaXMudGVzdC52ZXJpZnkoKVxuXHRcdHRoaXMucmVzdWx0LnZlcmlmeSgpXG5cdH0sXG5cdENvbmRpdGlvbmFsVmFsKCkge1xuXHRcdHRoaXMudGVzdC52ZXJpZnkoKVxuXHRcdHdpdGhJSUZFKCgpID0+IHRoaXMucmVzdWx0LnZlcmlmeSgpKVxuXHR9LFxuXG5cdC8vIE9ubHkgcmVhY2ggaGVyZSBmb3IgaW4vb3V0IGNvbmRpdGlvbi5cblx0RGVidWcoKSB7IHZlcmlmeUxpbmVzKFsgdGhpcyBdKSB9LFxuXG5cdEV4Y2VwdERvOiB2ZXJpZnlFeGNlcHQsXG5cdEV4Y2VwdFZhbDogdmVyaWZ5RXhjZXB0LFxuXG5cdEZvckJhZygpIHsgdmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuYnVpbHQsICgpID0+IHZlcmlmeUZvcih0aGlzKSkgfSxcblxuXHRGb3JEbygpIHsgdmVyaWZ5Rm9yKHRoaXMpIH0sXG5cblx0Rm9yVmFsKCkgeyB2ZXJpZnlGb3IodGhpcykgfSxcblxuXHRGdW4oKSB7XG5cdFx0d2l0aEJsb2NrTG9jYWxzKCgpID0+IHtcblx0XHRcdGNvbnRleHQuY2hlY2sodGhpcy5vcERlY2xhcmVSZXMgPT09IG51bGwgfHwgdGhpcy5ibG9jayBpbnN0YW5jZW9mIEJsb2NrVmFsLCB0aGlzLmxvYyxcblx0XHRcdFx0J0Z1bmN0aW9uIHdpdGggcmV0dXJuIGNvbmRpdGlvbiBtdXN0IHJldHVybiBzb21ldGhpbmcuJylcblx0XHRcdHdpdGhJbkdlbmVyYXRvcih0aGlzLmlzR2VuZXJhdG9yLCAoKSA9PlxuXHRcdFx0XHR3aXRoSW5Mb29wKGZhbHNlLCAoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgYWxsQXJncyA9IGNhdCh0aGlzLm9wRGVjbGFyZVRoaXMsIHRoaXMuYXJncywgdGhpcy5vcFJlc3RBcmcpXG5cdFx0XHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FscyhhbGxBcmdzLCAoKSA9PiB7XG5cdFx0XHRcdFx0XHR2ZXJpZnlPcEVhY2godGhpcy5vcEluKVxuXHRcdFx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoKVxuXHRcdFx0XHRcdFx0b3BFYWNoKHRoaXMub3BEZWNsYXJlUmVzLCB2ZXJpZnlMb2NhbERlY2xhcmUpXG5cdFx0XHRcdFx0XHRjb25zdCB2ZXJpZnlPdXQgPSAoKSA9PiB2ZXJpZnlPcEVhY2godGhpcy5vcE91dClcblx0XHRcdFx0XHRcdGlmRWxzZSh0aGlzLm9wRGVjbGFyZVJlcywgXyA9PiBwbHVzTG9jYWwoXywgdmVyaWZ5T3V0KSwgdmVyaWZ5T3V0KVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH0pKVxuXHRcdH0pXG5cdH0sXG5cblx0R2xvYmFsQWNjZXNzKCkgeyB9LFxuXG5cdExhenkoKSB7IHdpdGhCbG9ja0xvY2FscygoKSA9PiB0aGlzLnZhbHVlLnZlcmlmeSgpKSB9LFxuXG5cdExvY2FsQWNjZXNzKCkgeyBhY2Nlc3NMb2NhbCh0aGlzLCB0aGlzLm5hbWUpIH0sXG5cblx0Ly8gQWRkaW5nIExvY2FsRGVjbGFyZXMgdG8gdGhlIGF2YWlsYWJsZSBsb2NhbHMgaXMgZG9uZSBieSBGdW4gb3IgbGluZU5ld0xvY2Fscy5cblx0TG9jYWxEZWNsYXJlKCkgeyB2ZXJpZnlPcEVhY2godGhpcy5vcFR5cGUpIH0sXG5cblx0TG9jYWxNdXRhdGUoKSB7XG5cdFx0Y29uc3QgZGVjbGFyZSA9IGdldExvY2FsRGVjbGFyZSh0aGlzLm5hbWUsIHRoaXMubG9jKVxuXHRcdGNvbnRleHQuY2hlY2soZGVjbGFyZS5pc011dGFibGUoKSwgdGhpcy5sb2MsICgpID0+IGAke2NvZGUodGhpcy5uYW1lKX0gaXMgbm90IG11dGFibGUuYClcblx0XHQvLyBUT0RPOiBUcmFjayBtdXRhdGlvbnMuIE11dGFibGUgbG9jYWwgbXVzdCBiZSBtdXRhdGVkIHNvbWV3aGVyZS5cblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0TG9naWMoKSB7XG5cdFx0Y29udGV4dC5jaGVjayh0aGlzLmFyZ3MubGVuZ3RoID4gMSwgJ0xvZ2ljIGV4cHJlc3Npb24gbmVlZHMgYXQgbGVhc3QgMiBhcmd1bWVudHMuJylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hcmdzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHR9LFxuXG5cdE5vdCgpIHsgdGhpcy5hcmcudmVyaWZ5KCkgfSxcblxuXHROdW1iZXJMaXRlcmFsKCkgeyB9LFxuXG5cdE1hcEVudHJ5KCkge1xuXHRcdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdFx0dGhpcy5rZXkudmVyaWZ5KClcblx0XHR0aGlzLnZhbC52ZXJpZnkoKVxuXHR9LFxuXG5cdE1lbWJlcigpIHsgdGhpcy5vYmplY3QudmVyaWZ5KCkgfSxcblxuXHRNZW1iZXJTZXQoKSB7XG5cdFx0dGhpcy5vYmplY3QudmVyaWZ5KClcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0TWV0aG9kSW1wbCgpIHtcblx0XHR0aGlzLnN5bWJvbC52ZXJpZnkoKVxuXHRcdHRoaXMuZnVuLnZlcmlmeSgpXG5cdH0sXG5cblx0TW9kdWxlKCkge1xuXHRcdC8vIE5vIG5lZWQgdG8gdmVyaWZ5IHRoaXMuZG9Vc2VzLlxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLnVzZXMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0d2l0aEluRGVidWcoKCkgPT4ge1xuXHRcdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuZGVidWdVc2VzKVxuXHRcdFx0XHRfLnZlcmlmeSgpXG5cdFx0fSlcblx0XHRjb25zdCBuZXdMb2NhbHMgPSB2ZXJpZnlMaW5lcyh0aGlzLmxpbmVzKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmV4cG9ydHMpXG5cdFx0XHRhY2Nlc3NMb2NhbEZvclJldHVybihfLCB0aGlzKVxuXHRcdG9wRWFjaCh0aGlzLm9wRGVmYXVsdEV4cG9ydCwgXyA9PiBwbHVzTG9jYWxzKG5ld0xvY2FscywgKCkgPT4gXy52ZXJpZnkoKSkpXG5cblx0XHRjb25zdCBleHBvcnRzID0gbmV3IFNldCh0aGlzLmV4cG9ydHMpXG5cdFx0Y29uc3QgbWFya0V4cG9ydExpbmVzID0gbGluZSA9PiB7XG5cdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIEFzc2lnbiAmJiBsaW5lLmFsbEFzc2lnbmVlcygpLnNvbWUoXyA9PiBleHBvcnRzLmhhcyhfKSkpXG5cdFx0XHRcdHJlc3VsdHMuZXhwb3J0QXNzaWducy5hZGQobGluZSlcblx0XHRcdGVsc2UgaWYgKGxpbmUgaW5zdGFuY2VvZiBEZWJ1Zylcblx0XHRcdFx0bGluZS5saW5lcy5mb3JFYWNoKG1hcmtFeHBvcnRMaW5lcylcblx0XHR9XG5cdFx0dGhpcy5saW5lcy5mb3JFYWNoKG1hcmtFeHBvcnRMaW5lcylcblx0fSxcblxuXHROZXcoKSB7XG5cdFx0dGhpcy50eXBlLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHRPYmpFbnRyeSgpIHtcblx0XHRhY2Nlc3NMb2NhbCh0aGlzLCAnYnVpbHQnKVxuXHRcdHRoaXMuYXNzaWduLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXNzaWduLmFsbEFzc2lnbmVlcygpKVxuXHRcdFx0YWNjZXNzTG9jYWwodGhpcywgXy5uYW1lKVxuXHR9LFxuXG5cdE9ialNpbXBsZSgpIHtcblx0XHRjb25zdCBrZXlzID0gbmV3IFNldCgpXG5cdFx0Zm9yIChjb25zdCBwYWlyIG9mIHRoaXMucGFpcnMpIHtcblx0XHRcdGNvbnN0IHsga2V5LCB2YWx1ZSB9ID0gcGFpclxuXHRcdFx0Y29udGV4dC5jaGVjaygha2V5cy5oYXMoa2V5KSwgcGFpci5sb2MsICgpID0+IGBEdXBsaWNhdGUga2V5ICR7a2V5fWApXG5cdFx0XHRrZXlzLmFkZChrZXkpXG5cdFx0XHR2YWx1ZS52ZXJpZnkoKVxuXHRcdH1cblx0fSxcblxuXHRRdW90ZSgpIHtcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5wYXJ0cylcblx0XHRcdGlmICh0eXBlb2YgXyAhPT0gJ3N0cmluZycpXG5cdFx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHRRdW90ZVRlbXBsYXRlKCkge1xuXHRcdHRoaXMudGFnLnZlcmlmeSgpXG5cdFx0dGhpcy5xdW90ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdFNwZWNpYWxEbygpIHsgfSxcblxuXHRTcGVjaWFsVmFsKCkgeyB9LFxuXG5cdFNwbGF0KCkgeyB0aGlzLnNwbGF0dGVkLnZlcmlmeSgpIH0sXG5cblx0U3dpdGNoRG8oKSB7IHZlcmlmeVN3aXRjaCh0aGlzKSB9LFxuXHRTd2l0Y2hEb1BhcnQ6IHZlcmlmeVN3aXRjaFBhcnQsXG5cdFN3aXRjaFZhbCgpIHsgd2l0aElJRkUoKCkgPT4gdmVyaWZ5U3dpdGNoKHRoaXMpKSB9LFxuXHRTd2l0Y2hWYWxQYXJ0OiB2ZXJpZnlTd2l0Y2hQYXJ0LFxuXG5cdFRocm93KCkge1xuXHRcdHZlcmlmeU9wRWFjaCh0aGlzLm9wVGhyb3duKVxuXHR9LFxuXG5cdFVzZSgpIHtcblx0XHQvLyBTaW5jZSBVc2VzIGFyZSBhbHdheXMgaW4gdGhlIG91dGVybW9zdCBzY29wZSwgZG9uJ3QgaGF2ZSB0byB3b3JyeSBhYm91dCBzaGFkb3dpbmcuXG5cdFx0Ly8gU28gd2UgbXV0YXRlIGBsb2NhbHNgIGRpcmVjdGx5LlxuXHRcdGNvbnN0IGFkZFVzZUxvY2FsID0gXyA9PiB7XG5cdFx0XHRjb25zdCBwcmV2ID0gbG9jYWxzLmdldChfLm5hbWUpXG5cdFx0XHRjb250ZXh0LmNoZWNrKHByZXYgPT09IHVuZGVmaW5lZCwgXy5sb2MsICgpID0+XG5cdFx0XHRcdGAke2NvZGUoXy5uYW1lKX0gYWxyZWFkeSBpbXBvcnRlZCBhdCAke3ByZXYubG9jfWApXG5cdFx0XHR2ZXJpZnlMb2NhbERlY2xhcmUoXylcblx0XHRcdHNldExvY2FsKF8pXG5cdFx0fVxuXHRcdHRoaXMudXNlZC5mb3JFYWNoKGFkZFVzZUxvY2FsKVxuXHRcdG9wRWFjaCh0aGlzLm9wVXNlRGVmYXVsdCwgYWRkVXNlTG9jYWwpXG5cdH0sXG5cblx0V2l0aCgpIHtcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdFx0d2l0aElJRkUoKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuZGVjbGFyZSBpbnN0YW5jZW9mIExvY2FsRGVjbGFyZUZvY3VzKVxuXHRcdFx0XHRva1RvTm90VXNlLmFkZCh0aGlzLmRlY2xhcmUpXG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5kZWNsYXJlLCAoKSA9PiB7IHRoaXMuYmxvY2sudmVyaWZ5KCkgfSlcblx0XHR9KVxuXHR9LFxuXG5cdFlpZWxkKCkge1xuXHRcdGNvbnRleHQuY2hlY2soaXNJbkdlbmVyYXRvciwgdGhpcy5sb2MsICdDYW5ub3QgeWllbGQgb3V0c2lkZSBvZiBnZW5lcmF0b3IgY29udGV4dCcpXG5cdFx0dmVyaWZ5T3BFYWNoKHRoaXMub3BZaWVsZGVkKVxuXHR9LFxuXG5cdFlpZWxkVG8oKSB7XG5cdFx0Y29udGV4dC5jaGVjayhpc0luR2VuZXJhdG9yLCB0aGlzLmxvYywgJ0Nhbm5vdCB5aWVsZCBvdXRzaWRlIG9mIGdlbmVyYXRvciBjb250ZXh0Jylcblx0XHR0aGlzLnlpZWxkZWRUby52ZXJpZnkoKVxuXHR9XG59KVxuXG5mdW5jdGlvbiB2ZXJpZnlCYWdFbnRyeSgpIHtcblx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0dGhpcy52YWx1ZS52ZXJpZnkoKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlCbG9ja0JhZ09yTWFwKCkge1xuXHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5idWlsdCwgKCkgPT4gdmVyaWZ5TGluZXModGhpcy5saW5lcykpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeUNhc2VQYXJ0KCkge1xuXHRpZiAodGhpcy50ZXN0IGluc3RhbmNlb2YgUGF0dGVybikge1xuXHRcdHRoaXMudGVzdC50eXBlLnZlcmlmeSgpXG5cdFx0dGhpcy50ZXN0LnBhdHRlcm5lZC52ZXJpZnkoKVxuXHRcdHZlcmlmeUFuZFBsdXNMb2NhbHModGhpcy50ZXN0LmxvY2FscywgKCkgPT4gdGhpcy5yZXN1bHQudmVyaWZ5KCkpXG5cdH0gZWxzZSB7XG5cdFx0dGhpcy50ZXN0LnZlcmlmeSgpXG5cdFx0dGhpcy5yZXN1bHQudmVyaWZ5KClcblx0fVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlTd2l0Y2hQYXJ0KCkge1xuXHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdHRoaXMucmVzdWx0LnZlcmlmeSgpXG59XG5cbmZ1bmN0aW9uIHZlcmlmeUV4Y2VwdCgpIHtcblx0dGhpcy5fdHJ5LnZlcmlmeSgpXG5cdHZlcmlmeU9wRWFjaCh0aGlzLl9jYXRjaClcblx0dmVyaWZ5T3BFYWNoKHRoaXMuX2ZpbmFsbHkpXG59XG5cbi8vIEhlbHBlcnMgc3BlY2lmaWMgdG8gY2VydGFpbiBNc0FzdCB0eXBlczpcbmNvbnN0XG5cdHZlcmlmeUZvciA9IGZvckxvb3AgPT4ge1xuXHRcdGNvbnN0IHZlcmlmeUJsb2NrID0gKCkgPT4gd2l0aEluTG9vcChmb3JMb29wLCAoKSA9PiBmb3JMb29wLmJsb2NrLnZlcmlmeSgpKVxuXHRcdGlmRWxzZShmb3JMb29wLm9wSXRlcmF0ZWUsXG5cdFx0XHQoeyBlbGVtZW50LCBiYWcgfSkgPT4ge1xuXHRcdFx0XHRiYWcudmVyaWZ5KClcblx0XHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKGVsZW1lbnQsIHZlcmlmeUJsb2NrKVxuXHRcdFx0fSxcblx0XHRcdHZlcmlmeUJsb2NrKVxuXHR9LFxuXG5cdHZlcmlmeUluTG9vcCA9IGxvb3BVc2VyID0+XG5cdFx0Y29udGV4dC5jaGVjayhvcExvb3AgIT09IG51bGwsIGxvb3BVc2VyLmxvYywgJ05vdCBpbiBhIGxvb3AuJyksXG5cblxuXHR2ZXJpZnlDYXNlID0gXyA9PiB7XG5cdFx0Y29uc3QgZG9JdCA9ICgpID0+IHtcblx0XHRcdGZvciAoY29uc3QgcGFydCBvZiBfLnBhcnRzKVxuXHRcdFx0XHRwYXJ0LnZlcmlmeSgpXG5cdFx0XHR2ZXJpZnlPcEVhY2goXy5vcEVsc2UpXG5cdFx0fVxuXHRcdGlmRWxzZShfLm9wQ2FzZWQsXG5cdFx0XHRfID0+IHtcblx0XHRcdFx0Xy52ZXJpZnkoKVxuXHRcdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwoXy5hc3NpZ25lZSwgZG9JdClcblx0XHRcdH0sXG5cdFx0XHRkb0l0KVxuXHR9LFxuXG5cdHZlcmlmeVN3aXRjaCA9IF8gPT4ge1xuXHRcdF8uc3dpdGNoZWQudmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IHBhcnQgb2YgXy5wYXJ0cylcblx0XHRcdHBhcnQudmVyaWZ5KClcblx0XHR2ZXJpZnlPcEVhY2goXy5vcEVsc2UpXG5cdH1cblxuLy8gR2VuZXJhbCB1dGlsaXRpZXM6XG5jb25zdFxuXHRnZXRMb2NhbERlY2xhcmUgPSAobmFtZSwgYWNjZXNzTG9jKSA9PiB7XG5cdFx0Y29uc3QgZGVjbGFyZSA9IGxvY2Fscy5nZXQobmFtZSlcblx0XHRjb250ZXh0LmNoZWNrKGRlY2xhcmUgIT09IHVuZGVmaW5lZCwgYWNjZXNzTG9jLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBzaG93TG9jYWxzID0gY29kZShpdGVyYXRvclRvQXJyYXkobG9jYWxzLmtleXMoKSkuam9pbignICcpKVxuXHRcdFx0cmV0dXJuIGBObyBzdWNoIGxvY2FsICR7Y29kZShuYW1lKX0uXFxuTG9jYWxzIGFyZTpcXG4ke3Nob3dMb2NhbHN9LmBcblx0XHR9KVxuXHRcdHJldHVybiBkZWNsYXJlXG5cdH0sXG5cblx0bGluZU5ld0xvY2FscyA9IGxpbmUgPT5cblx0XHRsaW5lIGluc3RhbmNlb2YgQXNzaWduU2luZ2xlID9cblx0XHRcdFsgbGluZS5hc3NpZ25lZSBdIDpcblx0XHRcdGxpbmUgaW5zdGFuY2VvZiBBc3NpZ25EZXN0cnVjdHVyZSA/XG5cdFx0XHRsaW5lLmFzc2lnbmVlcyA6XG5cdFx0XHRsaW5lIGluc3RhbmNlb2YgT2JqRW50cnkgP1xuXHRcdFx0bGluZU5ld0xvY2FscyhsaW5lLmFzc2lnbikgOlxuXHRcdFx0WyBdLFxuXG5cdHZlcmlmeUxpbmVzID0gbGluZXMgPT4ge1xuXHRcdC8qXG5cdFx0V2UgbmVlZCB0byBiZXQgYWxsIGJsb2NrIGxvY2FscyB1cC1mcm9udCBiZWNhdXNlXG5cdFx0RnVuY3Rpb25zIHdpdGhpbiBsaW5lcyBjYW4gYWNjZXNzIGxvY2FscyBmcm9tIGxhdGVyIGxpbmVzLlxuXHRcdE5PVEU6IFdlIHB1c2ggdGhlc2Ugb250byBwZW5kaW5nQmxvY2tMb2NhbHMgaW4gcmV2ZXJzZVxuXHRcdHNvIHRoYXQgd2hlbiB3ZSBpdGVyYXRlIHRocm91Z2ggbGluZXMgZm9yd2FyZHMsIHdlIGNhbiBwb3AgZnJvbSBwZW5kaW5nQmxvY2tMb2NhbHNcblx0XHR0byByZW1vdmUgcGVuZGluZyBsb2NhbHMgYXMgdGhleSBiZWNvbWUgcmVhbCBsb2NhbHMuXG5cdFx0SXQgZG9lc24ndCByZWFsbHkgbWF0dGVyIHdoYXQgb3JkZXIgd2UgYWRkIGxvY2FscyBpbiBzaW5jZSBpdCdzIG5vdCBhbGxvd2VkXG5cdFx0dG8gaGF2ZSB0d28gbG9jYWxzIG9mIHRoZSBzYW1lIG5hbWUgaW4gdGhlIHNhbWUgYmxvY2suXG5cdFx0Ki9cblx0XHRjb25zdCBuZXdMb2NhbHMgPSBbIF1cblxuXHRcdGNvbnN0IGdldExpbmVMb2NhbHMgPSBsaW5lID0+IHtcblx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgRGVidWcpXG5cdFx0XHRcdHdpdGhJbkRlYnVnKCgpID0+IGVhY2hSZXZlcnNlKGxpbmUubGluZXMsIGdldExpbmVMb2NhbHMpKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRlYWNoUmV2ZXJzZShsaW5lTmV3TG9jYWxzKGxpbmUpLCBfID0+IHtcblx0XHRcdFx0XHQvLyBSZWdpc3RlciB0aGUgbG9jYWwgbm93LiBDYW4ndCB3YWl0IHVudGlsIHRoZSBhc3NpZ24gaXMgdmVyaWZpZWQuXG5cdFx0XHRcdFx0cmVnaXN0ZXJMb2NhbChfKVxuXHRcdFx0XHRcdG5ld0xvY2Fscy5wdXNoKF8pXG5cdFx0XHRcdH0pXG5cdFx0fVxuXHRcdGVhY2hSZXZlcnNlKGxpbmVzLCBnZXRMaW5lTG9jYWxzKVxuXHRcdHBlbmRpbmdCbG9ja0xvY2Fscy5wdXNoKC4uLm5ld0xvY2FscylcblxuXHRcdC8qXG5cdFx0S2VlcHMgdHJhY2sgb2YgbG9jYWxzIHdoaWNoIGhhdmUgYWxyZWFkeSBiZWVuIGFkZGVkIGluIHRoaXMgYmxvY2suXG5cdFx0TWFzb24gYWxsb3dzIHNoYWRvd2luZywgYnV0IG5vdCB3aXRoaW4gdGhlIHNhbWUgYmxvY2suXG5cdFx0U28sIHRoaXMgaXMgYWxsb3dlZDpcblx0XHRcdGEgPSAxXG5cdFx0XHRiID1cblx0XHRcdFx0YSA9IDJcblx0XHRcdFx0Li4uXG5cdFx0QnV0IG5vdDpcblx0XHRcdGEgPSAxXG5cdFx0XHRhID0gMlxuXHRcdCovXG5cdFx0Y29uc3QgdGhpc0Jsb2NrTG9jYWxOYW1lcyA9IG5ldyBTZXQoKVxuXG5cdFx0Ly8gQWxsIHNoYWRvd2VkIGxvY2FscyBmb3IgdGhpcyBibG9jay5cblx0XHRjb25zdCBzaGFkb3dlZCA9IFsgXVxuXG5cdFx0Y29uc3QgdmVyaWZ5TGluZSA9IGxpbmUgPT4ge1xuXHRcdFx0aWYgKGxpbmUgaW5zdGFuY2VvZiBEZWJ1Zylcblx0XHRcdFx0Ly8gVE9ETzogRG8gYW55dGhpbmcgaW4gdGhpcyBzaXR1YXRpb24/XG5cdFx0XHRcdC8vIGNvbnRleHQuY2hlY2soIWluRGVidWcsIGxpbmUubG9jLCAnUmVkdW5kYW50IGBkZWJ1Z2AuJylcblx0XHRcdFx0d2l0aEluRGVidWcoKCkgPT4gbGluZS5saW5lcy5mb3JFYWNoKHZlcmlmeUxpbmUpKVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHZlcmlmeUlzU3RhdGVtZW50KGxpbmUpXG5cdFx0XHRcdGZvciAoY29uc3QgbmV3TG9jYWwgb2YgbGluZU5ld0xvY2FscyhsaW5lKSkge1xuXHRcdFx0XHRcdGNvbnN0IG5hbWUgPSBuZXdMb2NhbC5uYW1lXG5cdFx0XHRcdFx0Y29uc3Qgb2xkTG9jYWwgPSBsb2NhbHMuZ2V0KG5hbWUpXG5cdFx0XHRcdFx0aWYgKG9sZExvY2FsICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdGNvbnRleHQuY2hlY2soIXRoaXNCbG9ja0xvY2FsTmFtZXMuaGFzKG5hbWUpLCBuZXdMb2NhbC5sb2MsXG5cdFx0XHRcdFx0XHRcdCgpID0+IGBBIGxvY2FsICR7Y29kZShuYW1lKX0gaXMgYWxyZWFkeSBpbiB0aGlzIGJsb2NrLmApXG5cdFx0XHRcdFx0XHRzaGFkb3dlZC5wdXNoKG9sZExvY2FsKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzQmxvY2tMb2NhbE5hbWVzLmFkZChuYW1lKVxuXHRcdFx0XHRcdHNldExvY2FsKG5ld0xvY2FsKVxuXG5cdFx0XHRcdFx0Ly8gTm93IHRoYXQgaXQncyBhZGRlZCBhcyBhIGxvY2FsLCBpdCdzIG5vIGxvbmdlciBwZW5kaW5nLlxuXHRcdFx0XHRcdC8vIFdlIGFkZGVkIHBlbmRpbmdCbG9ja0xvY2FscyBpbiB0aGUgcmlnaHQgb3JkZXIgdGhhdCB3ZSBjYW4ganVzdCBwb3AgdGhlbSBvZmYuXG5cdFx0XHRcdFx0Y29uc3QgcG9wcGVkID0gcGVuZGluZ0Jsb2NrTG9jYWxzLnBvcCgpXG5cdFx0XHRcdFx0YXNzZXJ0KHBvcHBlZCA9PT0gbmV3TG9jYWwpXG5cdFx0XHRcdH1cblx0XHRcdFx0bGluZS52ZXJpZnkoKVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGxpbmVzLmZvckVhY2godmVyaWZ5TGluZSlcblxuXHRcdG5ld0xvY2Fscy5mb3JFYWNoKGRlbGV0ZUxvY2FsKVxuXHRcdHNoYWRvd2VkLmZvckVhY2goc2V0TG9jYWwpXG5cblx0XHRyZXR1cm4gbmV3TG9jYWxzXG5cdH0sXG5cblx0dmVyaWZ5SXNTdGF0ZW1lbnQgPSBsaW5lID0+IHtcblx0XHRjb25zdCBpc1N0YXRlbWVudCA9XG5cdFx0XHRsaW5lIGluc3RhbmNlb2YgRG8gfHxcblx0XHRcdC8vIFNvbWUgdmFsdWVzIGFyZSBhbHNvIGFjY2VwdGFibGUuXG5cdFx0XHRsaW5lIGluc3RhbmNlb2YgQ2FsbCB8fFxuXHRcdFx0bGluZSBpbnN0YW5jZW9mIFlpZWxkIHx8XG5cdFx0XHRsaW5lIGluc3RhbmNlb2YgWWllbGRUb1xuXHRcdGNvbnRleHQuY2hlY2soaXNTdGF0ZW1lbnQsIGxpbmUubG9jLCAnRXhwcmVzc2lvbiBpbiBzdGF0ZW1lbnQgcG9zaXRpb24uJylcblx0fVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
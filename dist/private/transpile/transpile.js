if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'esast/dist/ast', 'esast/dist/util', '../manglePath', '../MsAst', '../util', './ast-constants', './ms-call', './util'], function (exports, _esastDistAst, _esastDistUtil, _manglePath, _MsAst, _util, _astConstants, _msCall, _util2) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _manglePath2 = _interopRequireDefault(_manglePath);

	let context, verifyResults, isInGenerator, isInConstructor;
	let nextDestructuredId;

	exports.default = (_context, moduleExpression, _verifyResults) => {
		context = _context;
		verifyResults = _verifyResults;
		isInGenerator = false;
		isInConstructor = false;
		nextDestructuredId = 0;
		const res = t0(moduleExpression);
		// Release for garbage collection.
		context = verifyResults = undefined;
		return res;
	};

	const t0 = expr => (0, _esastDistUtil.loc)(expr.transpile(), expr.loc);
	exports.t0 = t0;
	const t1 = (expr, arg) => (0, _esastDistUtil.loc)(expr.transpile(arg), expr.loc),
	      t3 = (expr, arg, arg2, arg3) => (0, _esastDistUtil.loc)(expr.transpile(arg, arg2, arg3), expr.loc),
	      tLines = exprs => {
		const out = [];
		for (const expr of exprs) {
			const ast = expr.transpile();
			if (ast instanceof Array)
				// Debug may produce multiple statements.
				for (const _ of ast) out.push((0, _esastDistUtil.toStatement)(_));else out.push((0, _esastDistUtil.loc)((0, _esastDistUtil.toStatement)(ast), expr.loc));
		}
		return out;
	};

	(0, _util.implementMany)(_MsAst, 'transpile', {
		Assert() {
			const failCond = () => {
				const cond = t0(this.condition);
				return this.negate ? cond : new _esastDistAst.UnaryExpression('!', cond);
			};

			return (0, _util.ifElse)(this.opThrown, _ => new _esastDistAst.IfStatement(failCond(), doThrow(_)), () => {
				if (this.condition instanceof _MsAst.Call) {
					const call = this.condition;
					const called = call.called;
					const args = call.args.map(t0);
					if (called instanceof _MsAst.Member) {
						const ass = this.negate ? _msCall.msAssertNotMember : _msCall.msAssertMember;
						return ass(t0(called.object), new _esastDistAst.Literal(called.name), ...args);
					} else {
						const ass = this.negate ? _msCall.msAssertNot : _msCall.msAssert;
						return ass(t0(called), ...args);
					}
				} else return new _esastDistAst.IfStatement(failCond(), _astConstants.ThrowAssertFail);
			});
		},

		AssignSingle(valWrap) {
			const val = valWrap === undefined ? t0(this.value) : valWrap(t0(this.value));
			const declare = makeDeclarator(this.assignee, val, false, verifyResults.isExportAssign(this));
			return new _esastDistAst.VariableDeclaration(this.assignee.isMutable() ? 'let' : 'const', [declare]);
		},
		// TODO:ES6 Just use native destructuring assign
		AssignDestructure() {
			return new _esastDistAst.VariableDeclaration(this.kind() === _MsAst.LD_Mutable ? 'let' : 'const', makeDestructureDeclarators(this.assignees, this.kind() === _MsAst.LD_Lazy, t0(this.value), false, verifyResults.isExportAssign(this)));
		},

		BagEntry() {
			return (0, _msCall.msAdd)(_astConstants.IdBuilt, t0(this.value));
		},

		BagEntryMany() {
			return (0, _msCall.msAddMany)(_astConstants.IdBuilt, t0(this.value));
		},

		BagSimple() {
			return new _esastDistAst.ArrayExpression(this.parts.map(t0));
		},

		BlockDo(lead, opDeclareRes, opOut) {
			// TODO:ES6 Optional arguments
			if (lead === undefined) lead = null;
			if (opDeclareRes === undefined) opDeclareRes = null;
			if (opOut === undefined) opOut = null;
			(0, _util.assert)(opDeclareRes === null);
			return new _esastDistAst.BlockStatement((0, _util.cat)(lead, tLines(this.lines), opOut));
		},

		BlockValThrow(lead, opDeclareRes, opOut) {
			// TODO:ES6 Optional arguments
			if (lead === undefined) lead = null;
			if (opDeclareRes === undefined) opDeclareRes = null;
			if (opOut === undefined) opOut = null;
			context.warnIf(opDeclareRes !== null || opOut !== null, this.loc, 'Out condition ignored because of oh-no!');
			return new _esastDistAst.BlockStatement((0, _util.cat)(lead, tLines(this.lines), t0(this.throw)));
		},

		BlockWithReturn(lead, opDeclareRes, opOut) {
			return transpileBlock(t0(this.returned), tLines(this.lines), lead, opDeclareRes, opOut);
		},

		BlockBag(lead, opDeclareRes, opOut) {
			return transpileBlock(_astConstants.IdBuilt, (0, _util.cat)(_astConstants.DeclareBuiltBag, tLines(this.lines)), lead, opDeclareRes, opOut);
		},

		BlockObj(lead, opDeclareRes, opOut) {
			const lines = (0, _util.cat)(_astConstants.DeclareBuiltObj, tLines(this.lines));
			const res = (0, _util.ifElse)(this.opObjed, objed => (0, _util.ifElse)(this.opName, name => (0, _msCall.msSet)(t0(objed), _astConstants.IdBuilt, new _esastDistAst.Literal(name)), () => (0, _msCall.msSet)(t0(objed), _astConstants.IdBuilt)), () => (0, _util.ifElse)(this.opName, _ => (0, _msCall.msSetName)(_astConstants.IdBuilt, new _esastDistAst.Literal(_)), () => _astConstants.IdBuilt));
			return transpileBlock(res, lines, lead, opDeclareRes, opOut);
		},

		BlockMap(lead, opDeclareRes, opOut) {
			return transpileBlock(_astConstants.IdBuilt, (0, _util.cat)(_astConstants.DeclareBuiltMap, tLines(this.lines)), lead, opDeclareRes, opOut);
		},

		BlockWrap() {
			return blockWrap(t0(this.block));
		},

		Break() {
			return new _esastDistAst.BreakStatement();
		},

		BreakWithVal() {
			return new _esastDistAst.ReturnStatement(t0(this.value));
		},

		Call() {
			return new _esastDistAst.CallExpression(t0(this.called), this.args.map(t0));
		},

		CaseDo() {
			const body = caseBody(this.parts, this.opElse);
			return (0, _util.ifElse)(this.opCased, _ => new _esastDistAst.BlockStatement([t0(_), body]), () => body);
		},
		CaseVal() {
			const body = caseBody(this.parts, this.opElse);
			const block = (0, _util.ifElse)(this.opCased, _ => [t0(_), body], () => [body]);
			return blockWrap(new _esastDistAst.BlockStatement(block));
		},
		CaseDoPart: casePart,
		CaseValPart: casePart,

		Class() {
			const methods = (0, _util.cat)(this.statics.map(_ => t1(_, true)), (0, _util.opMap)(this.opConstructor, t0), this.methods.map(_ => t1(_, false)));
			const opName = (0, _util.opMap)(verifyResults.opName(this), _esastDistUtil.idCached);
			const classExpr = new _esastDistAst.ClassExpression(opName, (0, _util.opMap)(this.opSuperClass, t0), new _esastDistAst.ClassBody(methods));

			return (0, _util.ifElse)(this.opDo, _ => t1(_, classExpr), () => classExpr);
		},

		ClassDo(classExpr) {
			const lead = new _esastDistAst.VariableDeclaration('const', [new _esastDistAst.VariableDeclarator(t0(this.declareFocus), classExpr)]);
			const ret = new _esastDistAst.ReturnStatement(t0(this.declareFocus));
			const block = t3(this.block, lead, null, ret);
			return blockWrap(block);
		},

		ConditionalDo() {
			const test = t0(this.test);
			return new _esastDistAst.IfStatement(this.isUnless ? new _esastDistAst.UnaryExpression('!', test) : test, t0(this.result));
		},

		ConditionalVal() {
			const test = t0(this.test);
			const result = (0, _msCall.msSome)(blockWrap(t0(this.result)));
			return this.isUnless ? new _esastDistAst.ConditionalExpression(test, _msCall.MsNone, result) : new _esastDistAst.ConditionalExpression(test, result, _msCall.MsNone);
		},

		Constructor() {
			isInConstructor = true;

			// If there is a `super!`, `this` will not be defined until then, so must wait until then.
			// Otherwise, do it at the beginning.
			const body = verifyResults.constructorToSuper.has(this) ? t0(this.fun) : t1(this.fun, constructorSetMembers(this));

			const res = new _esastDistAst.MethodDefinition(_astConstants.IdConstructor, body, 'constructor', false, false);
			isInConstructor = false;
			return res;
		},

		Catch() {
			return new _esastDistAst.CatchClause(t0(this.caught), t0(this.block));
		},

		Debug() {
			return context.opts.includeChecks() ? tLines(this.lines) : [];
		},

		ExceptDo() {
			return transpileExcept(this);
		},
		ExceptVal() {
			return blockWrap(new _esastDistAst.BlockStatement([transpileExcept(this)]));
		},

		ForDo() {
			return forLoop(this.opIteratee, this.block);
		},

		ForBag() {
			return blockWrap(new _esastDistAst.BlockStatement([_astConstants.DeclareBuiltBag, forLoop(this.opIteratee, this.block), _astConstants.ReturnBuilt]));
		},

		ForVal() {
			return blockWrap(new _esastDistAst.BlockStatement([forLoop(this.opIteratee, this.block)]));
		},

		Fun(leadStatements) {
			// TODO:ES6 Optional args
			if (leadStatements === undefined) leadStatements = null;

			const oldInGenerator = isInGenerator;
			isInGenerator = this.isGenerator;

			// TODO:ES6 use `...`f
			const nArgs = new _esastDistAst.Literal(this.args.length);
			const opDeclareRest = (0, _util.opMap)(this.opRestArg, rest => (0, _util2.declare)(rest, new _esastDistAst.CallExpression(_astConstants.ArraySliceCall, [_astConstants.IdArguments, nArgs])));
			const argChecks = (0, _util.opIf)(context.opts.includeChecks(), () => (0, _util.flatOpMap)(this.args, _util2.opTypeCheckForLocalDeclare));

			const _in = (0, _util.opMap)(this.opIn, t0);

			const opDeclareThis = (0, _util.opIf)(!isInConstructor && this.opDeclareThis != null, () => _astConstants.DeclareLexicalThis);

			const lead = (0, _util.cat)(leadStatements, opDeclareThis, opDeclareRest, argChecks, _in);

			const _out = (0, _util.opMap)(this.opOut, t0);
			const body = t3(this.block, lead, this.opDeclareRes, _out);
			const args = this.args.map(t0);
			isInGenerator = oldInGenerator;
			const id = (0, _util.opMap)(verifyResults.opName(this), _esastDistUtil.idCached);

			const canUseArrowFunction = id === null && this.opDeclareThis === null && opDeclareRest === null && !this.isGenerator;
			return canUseArrowFunction ? new _esastDistAst.ArrowFunctionExpression(args, body) : new _esastDistAst.FunctionExpression(id, args, body, this.isGenerator);
		},

		Ignore() {
			return [];
		},

		Lazy() {
			return (0, _msCall.lazyWrap)(t0(this.value));
		},

		MethodImpl(isStatic) {
			const value = t0(this.fun);
			(0, _util.assert)(value.id == null);
			// Since the Fun should have opDeclareThis, it will never be an ArrowFunctionExpression.
			(0, _util.assert)(value instanceof _esastDistAst.FunctionExpression);

			var _methodKeyComputed = methodKeyComputed(this.symbol);

			const key = _methodKeyComputed.key;
			const computed = _methodKeyComputed.computed;

			return new _esastDistAst.MethodDefinition(key, value, 'method', isStatic, computed);
		},
		MethodGetter(isStatic) {
			const value = new _esastDistAst.FunctionExpression(null, [], t1(this.block, _astConstants.DeclareLexicalThis));

			var _methodKeyComputed2 = methodKeyComputed(this.symbol);

			const key = _methodKeyComputed2.key;
			const computed = _methodKeyComputed2.computed;

			return new _esastDistAst.MethodDefinition(key, value, 'get', isStatic, computed);
		},
		MethodSetter(isStatic) {
			const value = new _esastDistAst.FunctionExpression(null, [_astConstants.IdFocus], t1(this.block, _astConstants.DeclareLexicalThis));

			var _methodKeyComputed3 = methodKeyComputed(this.symbol);

			const key = _methodKeyComputed3.key;
			const computed = _methodKeyComputed3.computed;

			return new _esastDistAst.MethodDefinition(key, value, 'set', isStatic, computed);
		},

		NumberLiteral() {
			// Negative numbers are not part of ES spec.
			// http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.3
			const value = Number(this.value);
			const lit = new _esastDistAst.Literal(Math.abs(value));
			return (0, _util.isPositive)(value) ? lit : new _esastDistAst.UnaryExpression('-', lit);
		},

		LocalAccess() {
			if (this.name === 'this') return isInConstructor ? new _esastDistAst.ThisExpression() : _astConstants.IdLexicalThis;else {
				const ld = verifyResults.localDeclareForAccess(this);
				// If ld missing, this is a builtin, and builtins are never lazy
				return ld === undefined ? (0, _esastDistUtil.idCached)(this.name) : (0, _util2.accessLocalDeclare)(ld);
			}
		},

		LocalDeclare() {
			return new _esastDistAst.Identifier((0, _util2.idForDeclareCached)(this).name);
		},

		LocalMutate() {
			return new _esastDistAst.AssignmentExpression('=', (0, _esastDistUtil.idCached)(this.name), t0(this.value));
		},

		Logic() {
			(0, _util.assert)(this.kind === _MsAst.L_And || this.kind === _MsAst.L_Or);
			const op = this.kind === _MsAst.L_And ? '&&' : '||';
			return (0, _util.tail)(this.args).reduce((a, b) => new _esastDistAst.LogicalExpression(op, a, t0(b)), t0(this.args[0]));
		},

		MapEntry() {
			return (0, _msCall.msAssoc)(_astConstants.IdBuilt, t0(this.key), t0(this.val));
		},

		Member() {
			return (0, _esastDistUtil.member)(t0(this.object), this.name);
		},

		MemberSet() {
			switch (this.kind) {
				case _MsAst.MS_Mutate:
					return new _esastDistAst.AssignmentExpression('=', (0, _esastDistUtil.member)(t0(this.object), this.name), t0(this.value));
				case _MsAst.MS_New:
					return (0, _msCall.msNewProperty)(t0(this.object), new _esastDistAst.Literal(this.name), t0(this.value));
				case _MsAst.MS_NewMutable:
					return (0, _msCall.msNewMutableProperty)(t0(this.object), new _esastDistAst.Literal(this.name), t0(this.value));
				default:
					throw new Error();
			}
		},

		Module() {
			const body = (0, _util.cat)(tLines(this.lines), (0, _util.opMap)(this.opDefaultExport, _ => new _esastDistAst.AssignmentExpression('=', _astConstants.ExportsDefault, t0(_))));

			const otherUses = this.uses.concat(this.debugUses);

			verifyResults.builtinPathToNames.forEach((used, path) => {
				if (path !== 'global') {
					const usedDeclares = [];
					let opUseDefault = null;
					let defaultName = (0, _util.last)(path.split('/'));
					for (const name of used) {
						const declare = _MsAst.LocalDeclare.plain(this.loc, name);
						if (name === defaultName) opUseDefault = declare;else usedDeclares.push(declare);
					}
					otherUses.push(new _MsAst.Use(this.loc, path, usedDeclares, opUseDefault));
				}
			});

			const amd = amdWrapModule(this.doUses, otherUses, body);

			return new _esastDistAst.Program((0, _util.cat)((0, _util.opIf)(context.opts.includeUseStrict(), () => _astConstants.UseStrict), (0, _util.opIf)(context.opts.includeAmdefine(), () => _astConstants.AmdefineHeader), (0, _esastDistUtil.toStatement)(amd)));
		},

		New() {
			const anySplat = this.args.some(_ => _ instanceof _MsAst.Splat);
			context.check(!anySplat, this.loc, 'TODO: Splat params for new');
			return new _esastDistAst.NewExpression(t0(this.type), this.args.map(t0));
		},

		Not() {
			return new _esastDistAst.UnaryExpression('!', t0(this.arg));
		},

		ObjEntryAssign() {
			return this.assign instanceof _MsAst.AssignSingle && !this.assign.assignee.isLazy() ? t1(this.assign, val => new _esastDistAst.AssignmentExpression('=', (0, _esastDistUtil.member)(_astConstants.IdBuilt, this.assign.assignee.name), val)) : (0, _util.cat)(t0(this.assign), this.assign.allAssignees().map(_ => (0, _msCall.msSetLazy)(_astConstants.IdBuilt, new _esastDistAst.Literal(_.name), (0, _util2.idForDeclareCached)(_))));
		},

		ObjEntryComputed() {
			return new _esastDistAst.AssignmentExpression('=', new _esastDistAst.MemberExpression(_astConstants.IdBuilt, t0(this.key)), t0(this.value));
		},

		ObjSimple() {
			return new _esastDistAst.ObjectExpression(this.pairs.map(pair => new _esastDistAst.Property('init', (0, _esastDistUtil.propertyIdOrLiteralCached)(pair.key), t0(pair.value))));
		},

		Quote() {
			if (this.parts.length === 0) return _astConstants.LitEmptyString;else {
				const quasis = [],
				      expressions = [];

				// TemplateLiteral must start with a TemplateElement
				if (typeof this.parts[0] !== 'string') quasis.push(_esastDistAst.TemplateElement.Empty);

				for (let part of this.parts) if (typeof part === 'string') quasis.push(_esastDistAst.TemplateElement.forRawString(part));else {
					// "{1}{1}" needs an empty quasi in the middle (and on the ends)
					if (quasis.length === expressions.length) quasis.push(_esastDistAst.TemplateElement.Empty);
					expressions.push(t0(part));
				}

				// TemplateLiteral must end with a TemplateElement, so one more quasi than expression.
				if (quasis.length === expressions.length) quasis.push(_esastDistAst.TemplateElement.Empty);

				return new _esastDistAst.TemplateLiteral(quasis, expressions);
			}
		},

		QuoteTemplate() {
			return new _esastDistAst.TaggedTemplateExpression(t0(this.tag), t0(this.quote));
		},

		SpecialDo() {
			switch (this.kind) {
				case _MsAst.SD_Debugger:
					return new _esastDistAst.DebuggerStatement();
				default:
					throw new Error(this.kind);
			}
		},

		SpecialVal() {
			// Make new objects because we will assign `loc` to them.
			switch (this.kind) {
				case _MsAst.SV_Contains:
					return (0, _esastDistUtil.member)(_msCall.IdMs, 'contains');
				case _MsAst.SV_False:
					return new _esastDistAst.Literal(false);
				case _MsAst.SV_Name:
					return new _esastDistAst.Literal(verifyResults.name(this));
				case _MsAst.SV_Null:
					return new _esastDistAst.Literal(null);
				case _MsAst.SV_Sub:
					return (0, _esastDistUtil.member)(_msCall.IdMs, 'sub');
				case _MsAst.SV_True:
					return new _esastDistAst.Literal(true);
				case _MsAst.SV_Undefined:
					return new _esastDistAst.UnaryExpression('void', _astConstants.LitZero);
				default:
					throw new Error(this.kind);
			}
		},

		Splat() {
			return new _esastDistAst.SpreadElement(t0(this.splatted));
		},

		SuperCall: superCall,
		SuperCallDo: superCall,
		SuperMember() {
			return (0, _esastDistUtil.member)(_astConstants.IdSuper, this.name);
		},

		SwitchDo() {
			return transpileSwitch(this);
		},
		SwitchVal() {
			return blockWrap(new _esastDistAst.BlockStatement([transpileSwitch(this)]));
		},
		SwitchDoPart: switchPart,
		SwitchValPart: switchPart,

		Throw() {
			return (0, _util.ifElse)(this.opThrown, _ => doThrow(_), () => new _esastDistAst.ThrowStatement(new _esastDistAst.NewExpression(_astConstants.GlobalError, [_astConstants.LitStrThrow])));
		},

		With() {
			const idDeclare = (0, _util2.idForDeclareCached)(this.declare);
			const block = t3(this.block, null, null, new _esastDistAst.ReturnStatement(idDeclare));
			const fun = isInGenerator ? new _esastDistAst.FunctionExpression(null, [idDeclare], block, true) : new _esastDistAst.ArrowFunctionExpression([idDeclare], block);
			const call = new _esastDistAst.CallExpression(fun, [t0(this.value)]);
			return isInGenerator ? new _esastDistAst.YieldExpression(call, true) : call;
		},

		Yield() {
			return new _esastDistAst.YieldExpression((0, _util.opMap)(this.opYielded, t0), false);
		},

		YieldTo() {
			return new _esastDistAst.YieldExpression(t0(this.yieldedTo), true);
		}
	});

	function casePart(alternate) {
		if (this.test instanceof _MsAst.Pattern) {
			var _test = this.test;
			const type = _test.type;
			const patterned = _test.patterned;
			const locals = _test.locals;

			const decl = new _esastDistAst.VariableDeclaration('const', [new _esastDistAst.VariableDeclarator(_astConstants.IdExtract, (0, _msCall.msExtract)(t0(type), t0(patterned)))]);
			const test = new _esastDistAst.BinaryExpression('!==', _astConstants.IdExtract, _astConstants.LitNull);
			const extract = new _esastDistAst.VariableDeclaration('const', locals.map((_, idx) => new _esastDistAst.VariableDeclarator((0, _util2.idForDeclareCached)(_), new _esastDistAst.MemberExpression(_astConstants.IdExtract, new _esastDistAst.Literal(idx)))));
			const res = t1(this.result, extract);
			return new _esastDistAst.BlockStatement([decl, new _esastDistAst.IfStatement(test, res, alternate)]);
		} else
			// alternate written to by `caseBody`.
			return new _esastDistAst.IfStatement(t0(this.test), t0(this.result), alternate);
	}

	function superCall() {
		const args = this.args.map(t0);
		const method = verifyResults.superCallToMethod.get(this);

		if (method instanceof _MsAst.Constructor) {
			const call = new _esastDistAst.CallExpression(_astConstants.IdSuper, args);
			const memberSets = constructorSetMembers(method);
			return (0, _util.cat)(call, memberSets);
		} else {
			const m = typeof method.symbol === 'string' ? (0, _esastDistUtil.member)(_astConstants.IdSuper, method.symbol) : new _esastDistAst.MemberExpression(_astConstants.IdSuper, t0(method.symbol));
			return new _esastDistAst.CallExpression(m, args);
		}
	}

	function switchPart() {
		const opOut = (0, _util.opIf)(this instanceof _MsAst.SwitchDoPart, () => new _esastDistAst.BreakStatement());
		/*
  We could just pass block.body for the switch lines, but instead
  enclose the body of the switch case in curly braces to ensure a new scope.
  That way this code works:
  	switch (0) {
  		case 0: {
  			const a = 0
  			return a
  		}
  		default: {
  			// Without curly braces this would conflict with the other `a`.
  			const a = 1
  			a
  		}
  	}
  */
		const block = t3(this.result, null, null, opOut);
		// If switch has multiple values, build up a statement like: `case 1: case 2: { doBlock() }`
		const x = [];
		for (let i = 0; i < this.values.length - 1; i = i + 1)
		// These cases fallthrough to the one at the end.
		x.push(new _esastDistAst.SwitchCase(t0(this.values[i]), []));
		x.push(new _esastDistAst.SwitchCase(t0(this.values[this.values.length - 1]), [block]));
		return x;
	}

	// Functions specific to certain expressions.
	const
	// Wraps a block (with `return` statements in it) in an IIFE.
	blockWrap = block => {
		const invoke = new _esastDistAst.CallExpression((0, _esastDistUtil.functionExpressionThunk)(block, isInGenerator), []);
		return isInGenerator ? new _esastDistAst.YieldExpression(invoke, true) : invoke;
	},
	      caseBody = (parts, opElse) => {
		let acc = (0, _util.ifElse)(opElse, t0, () => _astConstants.ThrowNoCaseMatch);
		for (let i = parts.length - 1; i >= 0; i = i - 1) acc = t1(parts[i], acc);
		return acc;
	},
	      constructorSetMembers = constructor => constructor.memberArgs.map(_ => (0, _msCall.msNewProperty)(new _esastDistAst.ThisExpression(), new _esastDistAst.Literal(_.name), (0, _util2.idForDeclareCached)(_))),
	      forLoop = (opIteratee, block) => (0, _util.ifElse)(opIteratee, _ref => {
		let element = _ref.element;
		let bag = _ref.bag;

		const declare = new _esastDistAst.VariableDeclaration('let', [new _esastDistAst.VariableDeclarator(t0(element))]);
		return new _esastDistAst.ForOfStatement(declare, t0(bag), t0(block));
	}, () => (0, _util2.forStatementInfinite)(t0(block))),
	      doThrow = thrown => new _esastDistAst.ThrowStatement(thrown instanceof _MsAst.Quote ? new _esastDistAst.NewExpression(_astConstants.GlobalError, [t0(thrown)]) : t0(thrown)),
	      methodKeyComputed = symbol => {
		if (typeof symbol === 'string') return { key: (0, _esastDistUtil.propertyIdOrLiteralCached)(symbol), computed: false };else {
			const key = symbol instanceof _MsAst.Quote ? t0(symbol) : (0, _msCall.msSymbol)(t0(symbol));
			return { key, computed: true };
		}
	},
	      transpileBlock = (returned, lines, lead, opDeclareRes, opOut) => {
		// TODO:ES6 Optional arguments
		if (lead === undefined) lead = null;
		if (opDeclareRes === undefined) opDeclareRes = null;
		if (opOut === undefined) opOut = null;
		const fin = (0, _util.ifElse)(opDeclareRes, rd => {
			const ret = maybeWrapInCheckContains(returned, rd.opType, rd.name);
			return (0, _util.ifElse)(opOut, _ => (0, _util.cat)((0, _util2.declare)(rd, ret), _, _astConstants.ReturnRes), () => new _esastDistAst.ReturnStatement(ret));
		}, () => (0, _util.cat)(opOut, new _esastDistAst.ReturnStatement(returned)));
		return new _esastDistAst.BlockStatement((0, _util.cat)(lead, lines, fin));
	},
	      transpileExcept = except => new _esastDistAst.TryStatement(t0(except._try), (0, _util.opMap)(except._catch, t0), (0, _util.opMap)(except._finally, t0)),
	      transpileSwitch = _ => {
		const parts = (0, _util.flatMap)(_.parts, t0);
		parts.push((0, _util.ifElse)(_.opElse, _ => new _esastDistAst.SwitchCase(undefined, t0(_).body), () => _astConstants.SwitchCaseNoMatch));
		return new _esastDistAst.SwitchStatement(t0(_.switched), parts);
	};

	const IdBoot = new _esastDistAst.Identifier('_boot');

	// Module helpers
	const amdWrapModule = (doUses, otherUses, body) => {
		const useBoot = context.opts.useBoot();

		const allUses = doUses.concat(otherUses);
		const allUsePaths = allUses.map(_ => (0, _manglePath2.default)(_.path));

		const arrUsePaths = new _esastDistAst.ArrayExpression((0, _util.cat)((0, _util.opIf)(useBoot, () => new _esastDistAst.Literal(context.opts.bootPath())), _astConstants.LitStrExports, allUsePaths.map(_ => new _esastDistAst.Literal(_))));

		const useToIdentifier = new Map();
		const useIdentifiers = [];
		for (let i = 0; i < allUses.length; i = i + 1) {
			const _ = allUses[i];
			const id = (0, _esastDistUtil.idCached)(`${ pathBaseName(_.path) }_${ i }`);
			useIdentifiers.push(id);
			useToIdentifier.set(_, id);
		}

		const useArgs = (0, _util.cat)((0, _util.opIf)(useBoot, () => IdBoot), _astConstants.IdExports, useIdentifiers);

		const doBoot = (0, _util.opIf)(useBoot, () => new _esastDistAst.ExpressionStatement((0, _msCall.msGetModule)(IdBoot)));

		const useDos = doUses.map(use => (0, _esastDistUtil.loc)(new _esastDistAst.ExpressionStatement((0, _msCall.msGetModule)(useToIdentifier.get(use))), use.loc));

		// Extracts used values from the modules.
		const opDeclareUsedLocals = (0, _util.opIf)(!(0, _util.isEmpty)(otherUses), () => new _esastDistAst.VariableDeclaration('const', (0, _util.flatMap)(otherUses, use => useDeclarators(use, useToIdentifier.get(use)))));

		const fullBody = new _esastDistAst.BlockStatement((0, _util.cat)(doBoot, useDos, opDeclareUsedLocals, body, _astConstants.ReturnExports));

		const lazyBody = context.opts.lazyModule() ? new _esastDistAst.BlockStatement([new _esastDistAst.ExpressionStatement(new _esastDistAst.AssignmentExpression('=', _astConstants.ExportsGet, (0, _msCall.msLazy)((0, _esastDistUtil.functionExpressionThunk)(fullBody))))]) : fullBody;

		return new _esastDistAst.CallExpression(_astConstants.IdDefine, [arrUsePaths, new _esastDistAst.ArrowFunctionExpression(useArgs, lazyBody)]);
	},
	      pathBaseName = path => path.substr(path.lastIndexOf('/') + 1),
	      useDeclarators = (use, moduleIdentifier) => {
		// TODO: Could be neater about this
		const isLazy = ((0, _util.isEmpty)(use.used) ? use.opUseDefault : use.used[0]).isLazy();
		const value = (isLazy ? _msCall.msLazyGetModule : _msCall.msGetModule)(moduleIdentifier);

		const usedDefault = (0, _util.opMap)(use.opUseDefault, def => {
			const defexp = (0, _msCall.msGetDefaultExport)(moduleIdentifier);
			const val = isLazy ? (0, _msCall.lazyWrap)(defexp) : defexp;
			return (0, _esastDistUtil.loc)(new _esastDistAst.VariableDeclarator((0, _util2.idForDeclareCached)(def), val), def.loc);
		});

		const usedDestruct = (0, _util.isEmpty)(use.used) ? null : makeDestructureDeclarators(use.used, isLazy, value, true, false);

		return (0, _util.cat)(usedDefault, usedDestruct);
	};

	// General utils. Not in util.js because these close over context.
	const makeDestructureDeclarators = (assignees, isLazy, value, isModule, isExport) => {
		const destructuredName = `_$${ nextDestructuredId }`;
		nextDestructuredId = nextDestructuredId + 1;
		const idDestructured = new _esastDistAst.Identifier(destructuredName);
		const declarators = assignees.map(assignee => {
			// TODO: Don't compile it if it's never accessed
			const get = getMember(idDestructured, assignee.name, isLazy, isModule);
			return makeDeclarator(assignee, get, isLazy, isExport);
		});
		// Getting lazy module is done by ms.lazyGetModule.
		const val = isLazy && !isModule ? (0, _msCall.lazyWrap)(value) : value;
		return (0, _util.cat)(new _esastDistAst.VariableDeclarator(idDestructured, val), declarators);
	},
	      makeDeclarator = (assignee, value, valueIsAlreadyLazy, isExport) => {
		const loc = assignee.loc;
		const name = assignee.name;
		const opType = assignee.opType;

		const isLazy = assignee.isLazy();
		// TODO: assert(assignee.opType === null)
		// or TODO: Allow type check on lazy value?
		value = isLazy ? value : maybeWrapInCheckContains(value, opType, name);
		if (isExport) {
			// TODO:ES6
			context.check(!isLazy, loc, 'Lazy export not supported.');
			return new _esastDistAst.VariableDeclarator((0, _util2.idForDeclareCached)(assignee), new _esastDistAst.AssignmentExpression('=', (0, _esastDistUtil.member)(_astConstants.IdExports, name), value));
		} else {
			const val = isLazy && !valueIsAlreadyLazy ? (0, _msCall.lazyWrap)(value) : value;
			(0, _util.assert)(isLazy || !valueIsAlreadyLazy);
			return new _esastDistAst.VariableDeclarator((0, _util2.idForDeclareCached)(assignee), val);
		}
	},
	      maybeWrapInCheckContains = (ast, opType, name) => context.opts.includeChecks() && opType !== null ? (0, _msCall.msCheckContains)(t0(opType), ast, new _esastDistAst.Literal(name)) : ast,
	      getMember = (astObject, gotName, isLazy, isModule) => isLazy ? (0, _msCall.msLazyGet)(astObject, new _esastDistAst.Literal(gotName)) : isModule && context.opts.includeChecks() ? (0, _msCall.msGet)(astObject, new _esastDistAst.Literal(gotName)) : (0, _esastDistUtil.member)(astObject, gotName);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zcGlsZS5qcyIsInByaXZhdGUvdHJhbnNwaWxlL3RyYW5zcGlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7QUM2QkEsS0FBSSxPQUFPLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxlQUFlLENBQUE7QUFDMUQsS0FBSSxrQkFBa0IsQ0FBQTs7bUJBRVAsQ0FBQyxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxLQUFLO0FBQzlELFNBQU8sR0FBRyxRQUFRLENBQUE7QUFDbEIsZUFBYSxHQUFHLGNBQWMsQ0FBQTtBQUM5QixlQUFhLEdBQUcsS0FBSyxDQUFBO0FBQ3JCLGlCQUFlLEdBQUcsS0FBSyxDQUFBO0FBQ3ZCLG9CQUFrQixHQUFHLENBQUMsQ0FBQTtBQUN0QixRQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTs7QUFFaEMsU0FBTyxHQUFHLGFBQWEsR0FBRyxTQUFTLENBQUE7QUFDbkMsU0FBTyxHQUFHLENBQUE7RUFDVjs7QUFFTSxPQUNOLEVBQUUsR0FBRyxJQUFJLElBQUksbUJBckM4QixHQUFHLEVBcUM3QixJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBOztBQUM3QyxPQUNDLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLEtBQUssbUJBdkN1QixHQUFHLEVBdUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7T0FDdEQsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxLQUFLLG1CQXhDVyxHQUFHLEVBd0NWLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDO09BQzlFLE1BQU0sR0FBRyxLQUFLLElBQUk7QUFDakIsUUFBTSxHQUFHLEdBQUcsRUFB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QUFPLENBQUMsQ0FBQyxHQUMxQyxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FDeEMsWUFwdUJ1RCxLQUFLLEVBb3VCdEQsU0FBUyxFQUFFLGtCQXh2QjJCLE9BQU8sQ0F3dkJ0QixPQUFPLENBQUMsQ0FBQyxHQUN0QyxtQkFwdkIrQyxNQUFNLEVBb3ZCOUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFBIiwiZmlsZSI6InByaXZhdGUvdHJhbnNwaWxlL3RyYW5zcGlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHsgQXJyYXlFeHByZXNzaW9uLCBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbiwgQXNzaWdubWVudEV4cHJlc3Npb24sIEJpbmFyeUV4cHJlc3Npb24sXG5cdEJsb2NrU3RhdGVtZW50LCBCcmVha1N0YXRlbWVudCwgQ2FsbEV4cHJlc3Npb24sIENhdGNoQ2xhdXNlLCBDbGFzc0JvZHksIENsYXNzRXhwcmVzc2lvbixcblx0Q29uZGl0aW9uYWxFeHByZXNzaW9uLCBEZWJ1Z2dlclN0YXRlbWVudCwgRXhwcmVzc2lvblN0YXRlbWVudCwgRm9yT2ZTdGF0ZW1lbnQsXG5cdEZ1bmN0aW9uRXhwcmVzc2lvbiwgSWRlbnRpZmllciwgSWZTdGF0ZW1lbnQsIExpdGVyYWwsIExvZ2ljYWxFeHByZXNzaW9uLCBNZW1iZXJFeHByZXNzaW9uLFxuXHRNZXRob2REZWZpbml0aW9uLCBOZXdFeHByZXNzaW9uLCBPYmplY3RFeHByZXNzaW9uLCBQcm9ncmFtLCBQcm9wZXJ0eSwgUmV0dXJuU3RhdGVtZW50LFxuXHRTcHJlYWRFbGVtZW50LCBTd2l0Y2hDYXNlLCBTd2l0Y2hTdGF0ZW1lbnQsIFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbiwgVGVtcGxhdGVFbGVtZW50LFxuXHRUZW1wbGF0ZUxpdGVyYWwsIFRoaXNFeHByZXNzaW9uLCBUaHJvd1N0YXRlbWVudCwgVHJ5U3RhdGVtZW50LCBWYXJpYWJsZURlY2xhcmF0aW9uLFxuXHRVbmFyeUV4cHJlc3Npb24sIFZhcmlhYmxlRGVjbGFyYXRvciwgWWllbGRFeHByZXNzaW9uIH0gZnJvbSAnZXNhc3QvZGlzdC9hc3QnXG5pbXBvcnQgeyBmdW5jdGlvbkV4cHJlc3Npb25UaHVuaywgaWRDYWNoZWQsIGxvYywgbWVtYmVyLCBwcm9wZXJ0eUlkT3JMaXRlcmFsQ2FjaGVkLCB0b1N0YXRlbWVudFxuXHR9IGZyb20gJ2VzYXN0L2Rpc3QvdXRpbCdcbmltcG9ydCBtYW5nbGVQYXRoIGZyb20gJy4uL21hbmdsZVBhdGgnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHsgQXNzaWduU2luZ2xlLCBDYWxsLCBDb25zdHJ1Y3RvciwgTF9BbmQsIExfT3IsIExEX0xhenksIExEX011dGFibGUsIE1lbWJlciwgTVNfTXV0YXRlLFxuXHRNU19OZXcsIE1TX05ld011dGFibGUsIExvY2FsRGVjbGFyZSwgUGF0dGVybiwgU3BsYXQsIFNEX0RlYnVnZ2VyLCBTVl9Db250YWlucywgU1ZfRmFsc2UsXG5cdFNWX05hbWUsIFNWX051bGwsIFNWX1N1YiwgU1ZfVHJ1ZSwgU1ZfVW5kZWZpbmVkLCBTd2l0Y2hEb1BhcnQsIFF1b3RlLCBVc2UgfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7IGFzc2VydCwgY2F0LCBmbGF0TWFwLCBmbGF0T3BNYXAsIGlmRWxzZSwgaXNFbXB0eSwgaW1wbGVtZW50TWFueSwgaXNQb3NpdGl2ZSwgbGFzdCwgb3BJZixcblx0b3BNYXAsIHRhaWwgfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHsgQW1kZWZpbmVIZWFkZXIsIEFycmF5U2xpY2VDYWxsLCBEZWNsYXJlQnVpbHRCYWcsIERlY2xhcmVCdWlsdE1hcCwgRGVjbGFyZUJ1aWx0T2JqLFxuXHREZWNsYXJlTGV4aWNhbFRoaXMsIEV4cG9ydHNEZWZhdWx0LCBFeHBvcnRzR2V0LCBJZEFyZ3VtZW50cywgSWRCdWlsdCwgSWRDb25zdHJ1Y3RvciwgSWREZWZpbmUsXG5cdElkRXhwb3J0cywgSWRFeHRyYWN0LCBJZEZvY3VzLCBJZExleGljYWxUaGlzLCBJZFN1cGVyLCBHbG9iYWxFcnJvciwgTGl0RW1wdHlTdHJpbmcsIExpdE51bGwsXG5cdExpdFN0ckV4cG9ydHMsIExpdFN0clRocm93LCBMaXRaZXJvLCBSZXR1cm5CdWlsdCwgUmV0dXJuRXhwb3J0cywgUmV0dXJuUmVzLCBTd2l0Y2hDYXNlTm9NYXRjaCxcblx0VGhyb3dBc3NlcnRGYWlsLCBUaHJvd05vQ2FzZU1hdGNoLCBVc2VTdHJpY3QgfSBmcm9tICcuL2FzdC1jb25zdGFudHMnXG5pbXBvcnQgeyBJZE1zLCBsYXp5V3JhcCwgbXNBZGQsIG1zQWRkTWFueSwgbXNBc3NlcnQsIG1zQXNzZXJ0TWVtYmVyLCBtc0Fzc2VydE5vdCxcblx0bXNBc3NlcnROb3RNZW1iZXIsIG1zQXNzb2MsIG1zQ2hlY2tDb250YWlucywgbXNFeHRyYWN0LCBtc0dldCwgbXNHZXREZWZhdWx0RXhwb3J0LCBtc0dldE1vZHVsZSxcblx0bXNMYXp5LCBtc0xhenlHZXQsIG1zTGF6eUdldE1vZHVsZSwgbXNOZXdNdXRhYmxlUHJvcGVydHksIG1zTmV3UHJvcGVydHksIG1zU2V0LCBtc1NldE5hbWUsXG5cdG1zU2V0TGF6eSwgbXNTb21lLCBtc1N5bWJvbCwgTXNOb25lIH0gZnJvbSAnLi9tcy1jYWxsJ1xuaW1wb3J0IHsgYWNjZXNzTG9jYWxEZWNsYXJlLCBkZWNsYXJlLCBmb3JTdGF0ZW1lbnRJbmZpbml0ZSwgaWRGb3JEZWNsYXJlQ2FjaGVkLFxuXHRvcFR5cGVDaGVja0ZvckxvY2FsRGVjbGFyZSB9IGZyb20gJy4vdXRpbCdcblxubGV0IGNvbnRleHQsIHZlcmlmeVJlc3VsdHMsIGlzSW5HZW5lcmF0b3IsIGlzSW5Db25zdHJ1Y3RvclxubGV0IG5leHREZXN0cnVjdHVyZWRJZFxuXG5leHBvcnQgZGVmYXVsdCAoX2NvbnRleHQsIG1vZHVsZUV4cHJlc3Npb24sIF92ZXJpZnlSZXN1bHRzKSA9PiB7XG5cdGNvbnRleHQgPSBfY29udGV4dFxuXHR2ZXJpZnlSZXN1bHRzID0gX3ZlcmlmeVJlc3VsdHNcblx0aXNJbkdlbmVyYXRvciA9IGZhbHNlXG5cdGlzSW5Db25zdHJ1Y3RvciA9IGZhbHNlXG5cdG5leHREZXN0cnVjdHVyZWRJZCA9IDBcblx0Y29uc3QgcmVzID0gdDAobW9kdWxlRXhwcmVzc2lvbilcblx0Ly8gUmVsZWFzZSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuXHRjb250ZXh0ID0gdmVyaWZ5UmVzdWx0cyA9IHVuZGVmaW5lZFxuXHRyZXR1cm4gcmVzXG59XG5cbmV4cG9ydCBjb25zdFxuXHR0MCA9IGV4cHIgPT4gbG9jKGV4cHIudHJhbnNwaWxlKCksIGV4cHIubG9jKVxuY29uc3Rcblx0dDEgPSAoZXhwciwgYXJnKSA9PiBsb2MoZXhwci50cmFuc3BpbGUoYXJnKSwgZXhwci5sb2MpLFxuXHR0MyA9IChleHByLCBhcmcsIGFyZzIsIGFyZzMpID0+IGxvYyhleHByLnRyYW5zcGlsZShhcmcsIGFyZzIsIGFyZzMpLCBleHByLmxvYyksXG5cdHRMaW5lcyA9IGV4cHJzID0+IHtcblx0XHRjb25zdCBvdXQgPSBbIF1cblx0XHRmb3IgKGNvbnN0IGV4cHIgb2YgZXhwcnMpIHtcblx0XHRcdGNvbnN0IGFzdCA9IGV4cHIudHJhbnNwaWxlKClcblx0XHRcdGlmIChhc3QgaW5zdGFuY2VvZiBBcnJheSlcblx0XHRcdFx0Ly8gRGVidWcgbWF5IHByb2R1Y2UgbXVsdGlwbGUgc3RhdGVtZW50cy5cblx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIGFzdClcblx0XHRcdFx0XHRvdXQucHVzaCh0b1N0YXRlbWVudChfKSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0b3V0LnB1c2gobG9jKHRvU3RhdGVtZW50KGFzdCksIGV4cHIubG9jKSlcblx0XHR9XG5cdFx0cmV0dXJuIG91dFxuXHR9XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ3RyYW5zcGlsZScsIHtcblx0QXNzZXJ0KCkge1xuXHRcdGNvbnN0IGZhaWxDb25kID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgY29uZCA9IHQwKHRoaXMuY29uZGl0aW9uKVxuXHRcdFx0cmV0dXJuIHRoaXMubmVnYXRlID8gY29uZCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCBjb25kKVxuXHRcdH1cblxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcFRocm93bixcblx0XHRcdF8gPT4gbmV3IElmU3RhdGVtZW50KGZhaWxDb25kKCksIGRvVGhyb3coXykpLFxuXHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5jb25kaXRpb24gaW5zdGFuY2VvZiBDYWxsKSB7XG5cdFx0XHRcdFx0Y29uc3QgY2FsbCA9IHRoaXMuY29uZGl0aW9uXG5cdFx0XHRcdFx0Y29uc3QgY2FsbGVkID0gY2FsbC5jYWxsZWRcblx0XHRcdFx0XHRjb25zdCBhcmdzID0gY2FsbC5hcmdzLm1hcCh0MClcblx0XHRcdFx0XHRpZiAoY2FsbGVkIGluc3RhbmNlb2YgTWVtYmVyKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBhc3MgPSB0aGlzLm5lZ2F0ZSA/IG1zQXNzZXJ0Tm90TWVtYmVyIDogbXNBc3NlcnRNZW1iZXJcblx0XHRcdFx0XHRcdHJldHVybiBhc3ModDAoY2FsbGVkLm9iamVjdCksIG5ldyBMaXRlcmFsKGNhbGxlZC5uYW1lKSwgLi4uYXJncylcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc3QgYXNzID0gdGhpcy5uZWdhdGUgPyBtc0Fzc2VydE5vdCA6IG1zQXNzZXJ0XG5cdFx0XHRcdFx0XHRyZXR1cm4gYXNzKHQwKGNhbGxlZCksIC4uLmFyZ3MpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KGZhaWxDb25kKCksIFRocm93QXNzZXJ0RmFpbClcblx0XHRcdH0pXG5cdH0sXG5cblx0QXNzaWduU2luZ2xlKHZhbFdyYXApIHtcblx0XHRjb25zdCB2YWwgPSB2YWxXcmFwID09PSB1bmRlZmluZWQgPyB0MCh0aGlzLnZhbHVlKSA6IHZhbFdyYXAodDAodGhpcy52YWx1ZSkpXG5cdFx0Y29uc3QgZGVjbGFyZSA9XG5cdFx0XHRtYWtlRGVjbGFyYXRvcih0aGlzLmFzc2lnbmVlLCB2YWwsIGZhbHNlLCB2ZXJpZnlSZXN1bHRzLmlzRXhwb3J0QXNzaWduKHRoaXMpKVxuXHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbih0aGlzLmFzc2lnbmVlLmlzTXV0YWJsZSgpID8gJ2xldCcgOiAnY29uc3QnLCBbIGRlY2xhcmUgXSlcblx0fSxcblx0Ly8gVE9ETzpFUzYgSnVzdCB1c2UgbmF0aXZlIGRlc3RydWN0dXJpbmcgYXNzaWduXG5cdEFzc2lnbkRlc3RydWN0dXJlKCkge1xuXHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbih0aGlzLmtpbmQoKSA9PT0gTERfTXV0YWJsZSA/ICdsZXQnIDogJ2NvbnN0Jyxcblx0XHRcdG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzKFxuXHRcdFx0XHR0aGlzLmFzc2lnbmVlcyxcblx0XHRcdFx0dGhpcy5raW5kKCkgPT09IExEX0xhenksXG5cdFx0XHRcdHQwKHRoaXMudmFsdWUpLFxuXHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0dmVyaWZ5UmVzdWx0cy5pc0V4cG9ydEFzc2lnbih0aGlzKSkpXG5cdH0sXG5cblx0QmFnRW50cnkoKSB7IHJldHVybiBtc0FkZChJZEJ1aWx0LCB0MCh0aGlzLnZhbHVlKSkgfSxcblxuXHRCYWdFbnRyeU1hbnkoKSB7IHJldHVybiBtc0FkZE1hbnkoSWRCdWlsdCwgdDAodGhpcy52YWx1ZSkpIH0sXG5cblx0QmFnU2ltcGxlKCkgeyByZXR1cm4gbmV3IEFycmF5RXhwcmVzc2lvbih0aGlzLnBhcnRzLm1hcCh0MCkpIH0sXG5cblx0QmxvY2tEbyhsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KSB7XG5cdFx0Ly8gVE9ETzpFUzYgT3B0aW9uYWwgYXJndW1lbnRzXG5cdFx0aWYgKGxlYWQgPT09IHVuZGVmaW5lZCkgbGVhZCA9IG51bGxcblx0XHRpZiAob3BEZWNsYXJlUmVzID09PSB1bmRlZmluZWQpIG9wRGVjbGFyZVJlcyA9IG51bGxcblx0XHRpZiAob3BPdXQgPT09IHVuZGVmaW5lZCkgb3BPdXQgPSBudWxsXG5cdFx0YXNzZXJ0KG9wRGVjbGFyZVJlcyA9PT0gbnVsbClcblx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChsZWFkLCB0TGluZXModGhpcy5saW5lcyksIG9wT3V0KSlcblx0fSxcblxuXHRCbG9ja1ZhbFRocm93KGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpIHtcblx0XHQvLyBUT0RPOkVTNiBPcHRpb25hbCBhcmd1bWVudHNcblx0XHRpZiAobGVhZCA9PT0gdW5kZWZpbmVkKSBsZWFkID0gbnVsbFxuXHRcdGlmIChvcERlY2xhcmVSZXMgPT09IHVuZGVmaW5lZCkgb3BEZWNsYXJlUmVzID0gbnVsbFxuXHRcdGlmIChvcE91dCA9PT0gdW5kZWZpbmVkKSBvcE91dCA9IG51bGxcblx0XHRjb250ZXh0Lndhcm5JZihvcERlY2xhcmVSZXMgIT09IG51bGwgfHwgb3BPdXQgIT09IG51bGwsIHRoaXMubG9jLFxuXHRcdFx0J091dCBjb25kaXRpb24gaWdub3JlZCBiZWNhdXNlIG9mIG9oLW5vIScpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgdExpbmVzKHRoaXMubGluZXMpLCB0MCh0aGlzLnRocm93KSkpXG5cdH0sXG5cblx0QmxvY2tXaXRoUmV0dXJuKGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2sodDAodGhpcy5yZXR1cm5lZCksIHRMaW5lcyh0aGlzLmxpbmVzKSwgbGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dClcblx0fSxcblxuXHRCbG9ja0JhZyhsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKFxuXHRcdFx0SWRCdWlsdCxcblx0XHRcdGNhdChEZWNsYXJlQnVpbHRCYWcsIHRMaW5lcyh0aGlzLmxpbmVzKSksXG5cdFx0XHRsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KVxuXHR9LFxuXG5cdEJsb2NrT2JqKGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpIHtcblx0XHRjb25zdCBsaW5lcyA9IGNhdChEZWNsYXJlQnVpbHRPYmosIHRMaW5lcyh0aGlzLmxpbmVzKSlcblx0XHRjb25zdCByZXMgPSBpZkVsc2UodGhpcy5vcE9iamVkLFxuXHRcdFx0b2JqZWQgPT4gaWZFbHNlKHRoaXMub3BOYW1lLFxuXHRcdFx0XHRuYW1lID0+IG1zU2V0KHQwKG9iamVkKSwgSWRCdWlsdCwgbmV3IExpdGVyYWwobmFtZSkpLFxuXHRcdFx0XHQoKSA9PiBtc1NldCh0MChvYmplZCksIElkQnVpbHQpKSxcblx0XHRcdCgpID0+IGlmRWxzZSh0aGlzLm9wTmFtZSxcblx0XHRcdFx0XyA9PiBtc1NldE5hbWUoSWRCdWlsdCwgbmV3IExpdGVyYWwoXykpLFxuXHRcdFx0XHQoKSA9PiBJZEJ1aWx0KSlcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2socmVzLCBsaW5lcywgbGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dClcblx0fSxcblxuXHRCbG9ja01hcChsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKFxuXHRcdFx0SWRCdWlsdCxcblx0XHRcdGNhdChEZWNsYXJlQnVpbHRNYXAsIHRMaW5lcyh0aGlzLmxpbmVzKSksXG5cdFx0XHRsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KVxuXHR9LFxuXG5cdEJsb2NrV3JhcCgpIHsgcmV0dXJuIGJsb2NrV3JhcCh0MCh0aGlzLmJsb2NrKSkgfSxcblxuXHRCcmVhaygpIHsgcmV0dXJuIG5ldyBCcmVha1N0YXRlbWVudCgpIH0sXG5cblx0QnJlYWtXaXRoVmFsKCkgeyByZXR1cm4gbmV3IFJldHVyblN0YXRlbWVudCh0MCh0aGlzLnZhbHVlKSkgfSxcblxuXHRDYWxsKCkge1xuXHRcdHJldHVybiBuZXcgQ2FsbEV4cHJlc3Npb24odDAodGhpcy5jYWxsZWQpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHRDYXNlRG8oKSB7XG5cdFx0Y29uc3QgYm9keSA9IGNhc2VCb2R5KHRoaXMucGFydHMsIHRoaXMub3BFbHNlKVxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcENhc2VkLCBfID0+IG5ldyBCbG9ja1N0YXRlbWVudChbIHQwKF8pLCBib2R5IF0pLCAoKSA9PiBib2R5KVxuXHR9LFxuXHRDYXNlVmFsKCkge1xuXHRcdGNvbnN0IGJvZHkgPSBjYXNlQm9keSh0aGlzLnBhcnRzLCB0aGlzLm9wRWxzZSlcblx0XHRjb25zdCBibG9jayA9IGlmRWxzZSh0aGlzLm9wQ2FzZWQsIF8gPT4gWyB0MChfKSwgYm9keSBdLCAoKSA9PiBbIGJvZHkgXSlcblx0XHRyZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChibG9jaykpXG5cdH0sXG5cdENhc2VEb1BhcnQ6IGNhc2VQYXJ0LFxuXHRDYXNlVmFsUGFydDogY2FzZVBhcnQsXG5cblx0Q2xhc3MoKSB7XG5cdFx0Y29uc3QgbWV0aG9kcyA9IGNhdChcblx0XHRcdHRoaXMuc3RhdGljcy5tYXAoXyA9PiB0MShfLCB0cnVlKSksXG5cdFx0XHRvcE1hcCh0aGlzLm9wQ29uc3RydWN0b3IsIHQwKSxcblx0XHRcdHRoaXMubWV0aG9kcy5tYXAoXyA9PiB0MShfLCBmYWxzZSkpKVxuXHRcdGNvbnN0IG9wTmFtZSA9IG9wTWFwKHZlcmlmeVJlc3VsdHMub3BOYW1lKHRoaXMpLCBpZENhY2hlZClcblx0XHRjb25zdCBjbGFzc0V4cHIgPSBuZXcgQ2xhc3NFeHByZXNzaW9uKFxuXHRcdFx0b3BOYW1lLFxuXHRcdFx0b3BNYXAodGhpcy5vcFN1cGVyQ2xhc3MsIHQwKSwgbmV3IENsYXNzQm9keShtZXRob2RzKSlcblxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcERvLCBfID0+IHQxKF8sIGNsYXNzRXhwciksICgpID0+IGNsYXNzRXhwcilcblx0fSxcblxuXHRDbGFzc0RvKGNsYXNzRXhwcikge1xuXHRcdGNvbnN0IGxlYWQgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBbXG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKHQwKHRoaXMuZGVjbGFyZUZvY3VzKSwgY2xhc3NFeHByKSBdKVxuXHRcdGNvbnN0IHJldCA9IG5ldyBSZXR1cm5TdGF0ZW1lbnQodDAodGhpcy5kZWNsYXJlRm9jdXMpKVxuXHRcdGNvbnN0IGJsb2NrID0gdDModGhpcy5ibG9jaywgbGVhZCwgbnVsbCwgcmV0KVxuXHRcdHJldHVybiBibG9ja1dyYXAoYmxvY2spXG5cdH0sXG5cblx0Q29uZGl0aW9uYWxEbygpIHtcblx0XHRjb25zdCB0ZXN0ID0gdDAodGhpcy50ZXN0KVxuXHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQoXG5cdFx0XHR0aGlzLmlzVW5sZXNzID8gbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIHRlc3QpIDogdGVzdCxcblx0XHRcdHQwKHRoaXMucmVzdWx0KSlcblx0fSxcblxuXHRDb25kaXRpb25hbFZhbCgpIHtcblx0XHRjb25zdCB0ZXN0ID0gdDAodGhpcy50ZXN0KVxuXHRcdGNvbnN0IHJlc3VsdCA9IG1zU29tZShibG9ja1dyYXAodDAodGhpcy5yZXN1bHQpKSlcblx0XHRyZXR1cm4gdGhpcy5pc1VubGVzcyA/XG5cdFx0XHRuZXcgQ29uZGl0aW9uYWxFeHByZXNzaW9uKHRlc3QsIE1zTm9uZSwgcmVzdWx0KSA6XG5cdFx0XHRuZXcgQ29uZGl0aW9uYWxFeHByZXNzaW9uKHRlc3QsIHJlc3VsdCwgTXNOb25lKVxuXHR9LFxuXG5cdENvbnN0cnVjdG9yKCkge1xuXHRcdGlzSW5Db25zdHJ1Y3RvciA9IHRydWVcblxuXHRcdC8vIElmIHRoZXJlIGlzIGEgYHN1cGVyIWAsIGB0aGlzYCB3aWxsIG5vdCBiZSBkZWZpbmVkIHVudGlsIHRoZW4sIHNvIG11c3Qgd2FpdCB1bnRpbCB0aGVuLlxuXHRcdC8vIE90aGVyd2lzZSwgZG8gaXQgYXQgdGhlIGJlZ2lubmluZy5cblx0XHRjb25zdCBib2R5ID0gdmVyaWZ5UmVzdWx0cy5jb25zdHJ1Y3RvclRvU3VwZXIuaGFzKHRoaXMpID9cblx0XHRcdHQwKHRoaXMuZnVuKSA6XG5cdFx0XHR0MSh0aGlzLmZ1biwgY29uc3RydWN0b3JTZXRNZW1iZXJzKHRoaXMpKVxuXG5cdFx0Y29uc3QgcmVzID0gbmV3IE1ldGhvZERlZmluaXRpb24oSWRDb25zdHJ1Y3RvciwgYm9keSwgJ2NvbnN0cnVjdG9yJywgZmFsc2UsIGZhbHNlKVxuXHRcdGlzSW5Db25zdHJ1Y3RvciA9IGZhbHNlXG5cdFx0cmV0dXJuIHJlc1xuXHR9LFxuXG5cdENhdGNoKCkge1xuXHRcdHJldHVybiBuZXcgQ2F0Y2hDbGF1c2UodDAodGhpcy5jYXVnaHQpLCB0MCh0aGlzLmJsb2NrKSlcblx0fSxcblxuXHREZWJ1ZygpIHsgcmV0dXJuIGNvbnRleHQub3B0cy5pbmNsdWRlQ2hlY2tzKCkgPyB0TGluZXModGhpcy5saW5lcykgOiBbIF0gfSxcblxuXHRFeGNlcHREbygpIHsgcmV0dXJuIHRyYW5zcGlsZUV4Y2VwdCh0aGlzKSB9LFxuXHRFeGNlcHRWYWwoKSB7IHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFsgdHJhbnNwaWxlRXhjZXB0KHRoaXMpIF0pKSB9LFxuXG5cdEZvckRvKCkgeyByZXR1cm4gZm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spIH0sXG5cblx0Rm9yQmFnKCkge1xuXHRcdHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFtcblx0XHRcdERlY2xhcmVCdWlsdEJhZyxcblx0XHRcdGZvckxvb3AodGhpcy5vcEl0ZXJhdGVlLCB0aGlzLmJsb2NrKSxcblx0XHRcdFJldHVybkJ1aWx0XG5cdFx0XSkpXG5cdH0sXG5cblx0Rm9yVmFsKCkge1xuXHRcdHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFsgZm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spIF0pKVxuXHR9LFxuXG5cdEZ1bihsZWFkU3RhdGVtZW50cykge1xuXHRcdC8vIFRPRE86RVM2IE9wdGlvbmFsIGFyZ3Ncblx0XHRpZiAobGVhZFN0YXRlbWVudHMgPT09IHVuZGVmaW5lZClcblx0XHRcdGxlYWRTdGF0ZW1lbnRzID0gbnVsbFxuXG5cdFx0Y29uc3Qgb2xkSW5HZW5lcmF0b3IgPSBpc0luR2VuZXJhdG9yXG5cdFx0aXNJbkdlbmVyYXRvciA9IHRoaXMuaXNHZW5lcmF0b3JcblxuXHRcdC8vIFRPRE86RVM2IHVzZSBgLi4uYGZcblx0XHRjb25zdCBuQXJncyA9IG5ldyBMaXRlcmFsKHRoaXMuYXJncy5sZW5ndGgpXG5cdFx0Y29uc3Qgb3BEZWNsYXJlUmVzdCA9IG9wTWFwKHRoaXMub3BSZXN0QXJnLCByZXN0ID0+XG5cdFx0XHRkZWNsYXJlKHJlc3QsIG5ldyBDYWxsRXhwcmVzc2lvbihBcnJheVNsaWNlQ2FsbCwgW0lkQXJndW1lbnRzLCBuQXJnc10pKSlcblx0XHRjb25zdCBhcmdDaGVja3MgPSBvcElmKGNvbnRleHQub3B0cy5pbmNsdWRlQ2hlY2tzKCksICgpID0+XG5cdFx0XHRmbGF0T3BNYXAodGhpcy5hcmdzLCBvcFR5cGVDaGVja0ZvckxvY2FsRGVjbGFyZSkpXG5cblx0XHRjb25zdCBfaW4gPSBvcE1hcCh0aGlzLm9wSW4sIHQwKVxuXG5cdFx0Y29uc3Qgb3BEZWNsYXJlVGhpcyA9XG5cdFx0XHRvcElmKCFpc0luQ29uc3RydWN0b3IgJiYgdGhpcy5vcERlY2xhcmVUaGlzICE9IG51bGwsICgpID0+IERlY2xhcmVMZXhpY2FsVGhpcylcblxuXHRcdGNvbnN0IGxlYWQgPSBjYXQobGVhZFN0YXRlbWVudHMsIG9wRGVjbGFyZVRoaXMsIG9wRGVjbGFyZVJlc3QsIGFyZ0NoZWNrcywgX2luKVxuXG5cdFx0Y29uc3QgX291dCA9IG9wTWFwKHRoaXMub3BPdXQsIHQwKVxuXHRcdGNvbnN0IGJvZHkgPSB0Myh0aGlzLmJsb2NrLCBsZWFkLCB0aGlzLm9wRGVjbGFyZVJlcywgX291dClcblx0XHRjb25zdCBhcmdzID0gdGhpcy5hcmdzLm1hcCh0MClcblx0XHRpc0luR2VuZXJhdG9yID0gb2xkSW5HZW5lcmF0b3Jcblx0XHRjb25zdCBpZCA9IG9wTWFwKHZlcmlmeVJlc3VsdHMub3BOYW1lKHRoaXMpLCBpZENhY2hlZClcblxuXHRcdGNvbnN0IGNhblVzZUFycm93RnVuY3Rpb24gPVxuXHRcdFx0aWQgPT09IG51bGwgJiZcblx0XHRcdHRoaXMub3BEZWNsYXJlVGhpcyA9PT0gbnVsbCAmJlxuXHRcdFx0b3BEZWNsYXJlUmVzdCA9PT0gbnVsbCAmJlxuXHRcdFx0IXRoaXMuaXNHZW5lcmF0b3Jcblx0XHRyZXR1cm4gY2FuVXNlQXJyb3dGdW5jdGlvbiA/XG5cdFx0XHRuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oYXJncywgYm9keSkgOlxuXHRcdFx0bmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihpZCwgYXJncywgYm9keSwgdGhpcy5pc0dlbmVyYXRvcilcblx0fSxcblxuXHRJZ25vcmUoKSB7IHJldHVybiBbIF0gfSxcblxuXHRMYXp5KCkgeyByZXR1cm4gbGF6eVdyYXAodDAodGhpcy52YWx1ZSkpIH0sXG5cblx0TWV0aG9kSW1wbChpc1N0YXRpYykge1xuXHRcdGNvbnN0IHZhbHVlID0gdDAodGhpcy5mdW4pXG5cdFx0YXNzZXJ0KHZhbHVlLmlkID09IG51bGwpXG5cdFx0Ly8gU2luY2UgdGhlIEZ1biBzaG91bGQgaGF2ZSBvcERlY2xhcmVUaGlzLCBpdCB3aWxsIG5ldmVyIGJlIGFuIEFycm93RnVuY3Rpb25FeHByZXNzaW9uLlxuXHRcdGFzc2VydCh2YWx1ZSBpbnN0YW5jZW9mIEZ1bmN0aW9uRXhwcmVzc2lvbilcblxuXHRcdGNvbnN0IHsga2V5LCBjb21wdXRlZCB9ID0gbWV0aG9kS2V5Q29tcHV0ZWQodGhpcy5zeW1ib2wpXG5cdFx0cmV0dXJuIG5ldyBNZXRob2REZWZpbml0aW9uKGtleSwgdmFsdWUsICdtZXRob2QnLCBpc1N0YXRpYywgY29tcHV0ZWQpXG5cdH0sXG5cdE1ldGhvZEdldHRlcihpc1N0YXRpYykge1xuXHRcdGNvbnN0IHZhbHVlID0gbmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihudWxsLCBbIF0sIHQxKHRoaXMuYmxvY2ssIERlY2xhcmVMZXhpY2FsVGhpcykpXG5cdFx0Y29uc3QgeyBrZXksIGNvbXB1dGVkIH0gPSBtZXRob2RLZXlDb21wdXRlZCh0aGlzLnN5bWJvbClcblx0XHRyZXR1cm4gbmV3IE1ldGhvZERlZmluaXRpb24oa2V5LCB2YWx1ZSwgJ2dldCcsIGlzU3RhdGljLCBjb21wdXRlZClcblx0fSxcblx0TWV0aG9kU2V0dGVyKGlzU3RhdGljKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFsgSWRGb2N1cyBdLCB0MSh0aGlzLmJsb2NrLCBEZWNsYXJlTGV4aWNhbFRoaXMpKVxuXHRcdGNvbnN0IHsga2V5LCBjb21wdXRlZCB9ID0gbWV0aG9kS2V5Q29tcHV0ZWQodGhpcy5zeW1ib2wpXG5cdFx0cmV0dXJuIG5ldyBNZXRob2REZWZpbml0aW9uKGtleSwgdmFsdWUsICdzZXQnLCBpc1N0YXRpYywgY29tcHV0ZWQpXG5cdH0sXG5cblx0TnVtYmVyTGl0ZXJhbCgpIHtcblx0XHQvLyBOZWdhdGl2ZSBudW1iZXJzIGFyZSBub3QgcGFydCBvZiBFUyBzcGVjLlxuXHRcdC8vIGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi81LjEvI3NlYy03LjguM1xuXHRcdGNvbnN0IHZhbHVlID0gTnVtYmVyKHRoaXMudmFsdWUpXG5cdFx0Y29uc3QgbGl0ID0gbmV3IExpdGVyYWwoTWF0aC5hYnModmFsdWUpKVxuXHRcdHJldHVybiBpc1Bvc2l0aXZlKHZhbHVlKSA/IGxpdCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJy0nLCBsaXQpXG5cdH0sXG5cblx0TG9jYWxBY2Nlc3MoKSB7XG5cdFx0aWYgKHRoaXMubmFtZSA9PT0gJ3RoaXMnKVxuXHRcdFx0cmV0dXJuIGlzSW5Db25zdHJ1Y3RvciA/IG5ldyBUaGlzRXhwcmVzc2lvbigpIDogSWRMZXhpY2FsVGhpc1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgbGQgPSB2ZXJpZnlSZXN1bHRzLmxvY2FsRGVjbGFyZUZvckFjY2Vzcyh0aGlzKVxuXHRcdFx0Ly8gSWYgbGQgbWlzc2luZywgdGhpcyBpcyBhIGJ1aWx0aW4sIGFuZCBidWlsdGlucyBhcmUgbmV2ZXIgbGF6eVxuXHRcdFx0cmV0dXJuIGxkID09PSB1bmRlZmluZWQgPyBpZENhY2hlZCh0aGlzLm5hbWUpIDogYWNjZXNzTG9jYWxEZWNsYXJlKGxkKVxuXHRcdH1cblx0fSxcblxuXHRMb2NhbERlY2xhcmUoKSB7IHJldHVybiBuZXcgSWRlbnRpZmllcihpZEZvckRlY2xhcmVDYWNoZWQodGhpcykubmFtZSkgfSxcblxuXHRMb2NhbE11dGF0ZSgpIHtcblx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgaWRDYWNoZWQodGhpcy5uYW1lKSwgdDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0TG9naWMoKSB7XG5cdFx0YXNzZXJ0KHRoaXMua2luZCA9PT0gTF9BbmQgfHwgdGhpcy5raW5kID09PSBMX09yKVxuXHRcdGNvbnN0IG9wID0gdGhpcy5raW5kID09PSBMX0FuZCA/ICcmJicgOiAnfHwnXG5cdFx0cmV0dXJuIHRhaWwodGhpcy5hcmdzKS5yZWR1Y2UoKGEsIGIpID0+XG5cdFx0XHRuZXcgTG9naWNhbEV4cHJlc3Npb24ob3AsIGEsIHQwKGIpKSwgdDAodGhpcy5hcmdzWzBdKSlcblx0fSxcblxuXHRNYXBFbnRyeSgpIHsgcmV0dXJuIG1zQXNzb2MoSWRCdWlsdCwgdDAodGhpcy5rZXkpLCB0MCh0aGlzLnZhbCkpIH0sXG5cblx0TWVtYmVyKCkgeyByZXR1cm4gbWVtYmVyKHQwKHRoaXMub2JqZWN0KSwgdGhpcy5uYW1lKSB9LFxuXG5cdE1lbWJlclNldCgpIHtcblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBNU19NdXRhdGU6XG5cdFx0XHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLFxuXHRcdFx0XHRcdG1lbWJlcih0MCh0aGlzLm9iamVjdCksIHRoaXMubmFtZSksXG5cdFx0XHRcdFx0dDAodGhpcy52YWx1ZSkpXG5cdFx0XHRjYXNlIE1TX05ldzpcblx0XHRcdFx0cmV0dXJuIG1zTmV3UHJvcGVydHkodDAodGhpcy5vYmplY3QpLCBuZXcgTGl0ZXJhbCh0aGlzLm5hbWUpLCB0MCh0aGlzLnZhbHVlKSlcblx0XHRcdGNhc2UgTVNfTmV3TXV0YWJsZTpcblx0XHRcdFx0cmV0dXJuIG1zTmV3TXV0YWJsZVByb3BlcnR5KHQwKHRoaXMub2JqZWN0KSwgbmV3IExpdGVyYWwodGhpcy5uYW1lKSwgdDAodGhpcy52YWx1ZSkpXG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdH1cblx0fSxcblxuXHRNb2R1bGUoKSB7XG5cdFx0Y29uc3QgYm9keSA9IGNhdChcblx0XHRcdHRMaW5lcyh0aGlzLmxpbmVzKSxcblx0XHRcdG9wTWFwKHRoaXMub3BEZWZhdWx0RXhwb3J0LCBfID0+IG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIEV4cG9ydHNEZWZhdWx0LCB0MChfKSkpKVxuXG5cdFx0Y29uc3Qgb3RoZXJVc2VzID0gdGhpcy51c2VzLmNvbmNhdCh0aGlzLmRlYnVnVXNlcylcblxuXHRcdHZlcmlmeVJlc3VsdHMuYnVpbHRpblBhdGhUb05hbWVzLmZvckVhY2goKHVzZWQsIHBhdGgpID0+IHtcblx0XHRcdGlmIChwYXRoICE9PSAnZ2xvYmFsJykge1xuXHRcdFx0XHRjb25zdCB1c2VkRGVjbGFyZXMgPSBbIF1cblx0XHRcdFx0bGV0IG9wVXNlRGVmYXVsdCA9IG51bGxcblx0XHRcdFx0bGV0IGRlZmF1bHROYW1lID0gbGFzdChwYXRoLnNwbGl0KCcvJykpXG5cdFx0XHRcdGZvciAoY29uc3QgbmFtZSBvZiB1c2VkKSB7XG5cdFx0XHRcdFx0Y29uc3QgZGVjbGFyZSA9IExvY2FsRGVjbGFyZS5wbGFpbih0aGlzLmxvYywgbmFtZSlcblx0XHRcdFx0XHRpZiAobmFtZSA9PT0gZGVmYXVsdE5hbWUpXG5cdFx0XHRcdFx0XHRvcFVzZURlZmF1bHQgPSBkZWNsYXJlXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0dXNlZERlY2xhcmVzLnB1c2goZGVjbGFyZSlcblx0XHRcdFx0fVxuXHRcdFx0XHRvdGhlclVzZXMucHVzaChuZXcgVXNlKHRoaXMubG9jLCBwYXRoLCB1c2VkRGVjbGFyZXMsIG9wVXNlRGVmYXVsdCkpXG5cdFx0XHR9XG5cdFx0fSlcblxuXHRcdGNvbnN0IGFtZCA9IGFtZFdyYXBNb2R1bGUodGhpcy5kb1VzZXMsIG90aGVyVXNlcywgYm9keSlcblxuXHRcdHJldHVybiBuZXcgUHJvZ3JhbShjYXQoXG5cdFx0XHRvcElmKGNvbnRleHQub3B0cy5pbmNsdWRlVXNlU3RyaWN0KCksICgpID0+IFVzZVN0cmljdCksXG5cdFx0XHRvcElmKGNvbnRleHQub3B0cy5pbmNsdWRlQW1kZWZpbmUoKSwgKCkgPT4gQW1kZWZpbmVIZWFkZXIpLFxuXHRcdFx0dG9TdGF0ZW1lbnQoYW1kKSkpXG5cdH0sXG5cblx0TmV3KCkge1xuXHRcdGNvbnN0IGFueVNwbGF0ID0gdGhpcy5hcmdzLnNvbWUoXyA9PiBfIGluc3RhbmNlb2YgU3BsYXQpXG5cdFx0Y29udGV4dC5jaGVjayghYW55U3BsYXQsIHRoaXMubG9jLCAnVE9ETzogU3BsYXQgcGFyYW1zIGZvciBuZXcnKVxuXHRcdHJldHVybiBuZXcgTmV3RXhwcmVzc2lvbih0MCh0aGlzLnR5cGUpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHROb3QoKSB7IHJldHVybiBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgdDAodGhpcy5hcmcpKSB9LFxuXG5cdE9iakVudHJ5QXNzaWduKCkge1xuXHRcdHJldHVybiB0aGlzLmFzc2lnbiBpbnN0YW5jZW9mIEFzc2lnblNpbmdsZSAmJiAhdGhpcy5hc3NpZ24uYXNzaWduZWUuaXNMYXp5KCkgP1xuXHRcdFx0dDEodGhpcy5hc3NpZ24sIHZhbCA9PlxuXHRcdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRCdWlsdCwgdGhpcy5hc3NpZ24uYXNzaWduZWUubmFtZSksIHZhbCkpIDpcblx0XHRcdGNhdChcblx0XHRcdFx0dDAodGhpcy5hc3NpZ24pLFxuXHRcdFx0XHR0aGlzLmFzc2lnbi5hbGxBc3NpZ25lZXMoKS5tYXAoXyA9PlxuXHRcdFx0XHRcdG1zU2V0TGF6eShJZEJ1aWx0LCBuZXcgTGl0ZXJhbChfLm5hbWUpLCBpZEZvckRlY2xhcmVDYWNoZWQoXykpKSlcblx0fSxcblxuXHRPYmpFbnRyeUNvbXB1dGVkKCkge1xuXHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLFxuXHRcdFx0bmV3IE1lbWJlckV4cHJlc3Npb24oSWRCdWlsdCwgdDAodGhpcy5rZXkpKSxcblx0XHRcdHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdE9ialNpbXBsZSgpIHtcblx0XHRyZXR1cm4gbmV3IE9iamVjdEV4cHJlc3Npb24odGhpcy5wYWlycy5tYXAocGFpciA9PlxuXHRcdFx0bmV3IFByb3BlcnR5KCdpbml0JywgcHJvcGVydHlJZE9yTGl0ZXJhbENhY2hlZChwYWlyLmtleSksIHQwKHBhaXIudmFsdWUpKSkpXG5cdH0sXG5cblx0UXVvdGUoKSB7XG5cdFx0aWYgKHRoaXMucGFydHMubGVuZ3RoID09PSAwKVxuXHRcdFx0cmV0dXJuIExpdEVtcHR5U3RyaW5nXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBxdWFzaXMgPSBbIF0sIGV4cHJlc3Npb25zID0gWyBdXG5cblx0XHRcdC8vIFRlbXBsYXRlTGl0ZXJhbCBtdXN0IHN0YXJ0IHdpdGggYSBUZW1wbGF0ZUVsZW1lbnRcblx0XHRcdGlmICh0eXBlb2YgdGhpcy5wYXJ0c1swXSAhPT0gJ3N0cmluZycpXG5cdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5FbXB0eSlcblxuXHRcdFx0Zm9yIChsZXQgcGFydCBvZiB0aGlzLnBhcnRzKVxuXHRcdFx0XHRpZiAodHlwZW9mIHBhcnQgPT09ICdzdHJpbmcnKVxuXHRcdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5mb3JSYXdTdHJpbmcocGFydCkpXG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdC8vIFwiezF9ezF9XCIgbmVlZHMgYW4gZW1wdHkgcXVhc2kgaW4gdGhlIG1pZGRsZSAoYW5kIG9uIHRoZSBlbmRzKVxuXHRcdFx0XHRcdGlmIChxdWFzaXMubGVuZ3RoID09PSBleHByZXNzaW9ucy5sZW5ndGgpXG5cdFx0XHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuRW1wdHkpXG5cdFx0XHRcdFx0ZXhwcmVzc2lvbnMucHVzaCh0MChwYXJ0KSlcblx0XHRcdFx0fVxuXG5cdFx0XHQvLyBUZW1wbGF0ZUxpdGVyYWwgbXVzdCBlbmQgd2l0aCBhIFRlbXBsYXRlRWxlbWVudCwgc28gb25lIG1vcmUgcXVhc2kgdGhhbiBleHByZXNzaW9uLlxuXHRcdFx0aWYgKHF1YXNpcy5sZW5ndGggPT09IGV4cHJlc3Npb25zLmxlbmd0aClcblx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LkVtcHR5KVxuXG5cdFx0XHRyZXR1cm4gbmV3IFRlbXBsYXRlTGl0ZXJhbChxdWFzaXMsIGV4cHJlc3Npb25zKVxuXHRcdH1cblx0fSxcblxuXHRRdW90ZVRlbXBsYXRlKCkge1xuXHRcdHJldHVybiBuZXcgVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uKHQwKHRoaXMudGFnKSwgdDAodGhpcy5xdW90ZSkpXG5cdH0sXG5cblx0U3BlY2lhbERvKCkge1xuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIFNEX0RlYnVnZ2VyOiByZXR1cm4gbmV3IERlYnVnZ2VyU3RhdGVtZW50KClcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcih0aGlzLmtpbmQpXG5cdFx0fVxuXHR9LFxuXG5cdFNwZWNpYWxWYWwoKSB7XG5cdFx0Ly8gTWFrZSBuZXcgb2JqZWN0cyBiZWNhdXNlIHdlIHdpbGwgYXNzaWduIGBsb2NgIHRvIHRoZW0uXG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU1ZfQ29udGFpbnM6IHJldHVybiBtZW1iZXIoSWRNcywgJ2NvbnRhaW5zJylcblx0XHRcdGNhc2UgU1ZfRmFsc2U6IHJldHVybiBuZXcgTGl0ZXJhbChmYWxzZSlcblx0XHRcdGNhc2UgU1ZfTmFtZTogcmV0dXJuIG5ldyBMaXRlcmFsKHZlcmlmeVJlc3VsdHMubmFtZSh0aGlzKSlcblx0XHRcdGNhc2UgU1ZfTnVsbDogcmV0dXJuIG5ldyBMaXRlcmFsKG51bGwpXG5cdFx0XHRjYXNlIFNWX1N1YjogcmV0dXJuIG1lbWJlcihJZE1zLCAnc3ViJylcblx0XHRcdGNhc2UgU1ZfVHJ1ZTogcmV0dXJuIG5ldyBMaXRlcmFsKHRydWUpXG5cdFx0XHRjYXNlIFNWX1VuZGVmaW5lZDogcmV0dXJuIG5ldyBVbmFyeUV4cHJlc3Npb24oJ3ZvaWQnLCBMaXRaZXJvKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHR9XG5cdH0sXG5cblx0U3BsYXQoKSB7XG5cdFx0cmV0dXJuIG5ldyBTcHJlYWRFbGVtZW50KHQwKHRoaXMuc3BsYXR0ZWQpKVxuXHR9LFxuXG5cdFN1cGVyQ2FsbDogc3VwZXJDYWxsLFxuXHRTdXBlckNhbGxEbzogc3VwZXJDYWxsLFxuXHRTdXBlck1lbWJlcigpIHtcblx0XHRyZXR1cm4gbWVtYmVyKElkU3VwZXIsIHRoaXMubmFtZSlcblx0fSxcblxuXHRTd2l0Y2hEbygpIHsgcmV0dXJuIHRyYW5zcGlsZVN3aXRjaCh0aGlzKSB9LFxuXHRTd2l0Y2hWYWwoKSB7IHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFsgdHJhbnNwaWxlU3dpdGNoKHRoaXMpIF0pKSB9LFxuXHRTd2l0Y2hEb1BhcnQ6IHN3aXRjaFBhcnQsXG5cdFN3aXRjaFZhbFBhcnQ6IHN3aXRjaFBhcnQsXG5cblx0VGhyb3coKSB7XG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wVGhyb3duLFxuXHRcdFx0XyA9PiBkb1Rocm93KF8pLFxuXHRcdFx0KCkgPT4gbmV3IFRocm93U3RhdGVtZW50KG5ldyBOZXdFeHByZXNzaW9uKEdsb2JhbEVycm9yLCBbIExpdFN0clRocm93IF0pKSlcblx0fSxcblxuXHRXaXRoKCkge1xuXHRcdGNvbnN0IGlkRGVjbGFyZSA9IGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzLmRlY2xhcmUpXG5cdFx0Y29uc3QgYmxvY2sgPSB0Myh0aGlzLmJsb2NrLCBudWxsLCBudWxsLCBuZXcgUmV0dXJuU3RhdGVtZW50KGlkRGVjbGFyZSkpXG5cdFx0Y29uc3QgZnVuID0gaXNJbkdlbmVyYXRvciA/XG5cdFx0XHRuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFsgaWREZWNsYXJlIF0sIGJsb2NrLCB0cnVlKSA6XG5cdFx0XHRuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oWyBpZERlY2xhcmUgXSwgYmxvY2spXG5cdFx0Y29uc3QgY2FsbCA9IG5ldyBDYWxsRXhwcmVzc2lvbihmdW4sIFsgdDAodGhpcy52YWx1ZSkgXSlcblx0XHRyZXR1cm4gaXNJbkdlbmVyYXRvciA/IG5ldyBZaWVsZEV4cHJlc3Npb24oY2FsbCwgdHJ1ZSkgOiBjYWxsXG5cdH0sXG5cblx0WWllbGQoKSB7IHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKG9wTWFwKHRoaXMub3BZaWVsZGVkLCB0MCksIGZhbHNlKSB9LFxuXG5cdFlpZWxkVG8oKSB7IHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKHQwKHRoaXMueWllbGRlZFRvKSwgdHJ1ZSkgfVxufSlcblxuZnVuY3Rpb24gY2FzZVBhcnQoYWx0ZXJuYXRlKSB7XG5cdGlmICh0aGlzLnRlc3QgaW5zdGFuY2VvZiBQYXR0ZXJuKSB7XG5cdFx0Y29uc3QgeyB0eXBlLCBwYXR0ZXJuZWQsIGxvY2FscyB9ID0gdGhpcy50ZXN0XG5cdFx0Y29uc3QgZGVjbCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRFeHRyYWN0LCBtc0V4dHJhY3QodDAodHlwZSksIHQwKHBhdHRlcm5lZCkpKSBdKVxuXHRcdGNvbnN0IHRlc3QgPSBuZXcgQmluYXJ5RXhwcmVzc2lvbignIT09JywgSWRFeHRyYWN0LCBMaXROdWxsKVxuXHRcdGNvbnN0IGV4dHJhY3QgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBsb2NhbHMubWFwKChfLCBpZHgpID0+XG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKFxuXHRcdFx0XHRpZEZvckRlY2xhcmVDYWNoZWQoXyksXG5cdFx0XHRcdG5ldyBNZW1iZXJFeHByZXNzaW9uKElkRXh0cmFjdCwgbmV3IExpdGVyYWwoaWR4KSkpKSlcblx0XHRjb25zdCByZXMgPSB0MSh0aGlzLnJlc3VsdCwgZXh0cmFjdClcblx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KFsgZGVjbCwgbmV3IElmU3RhdGVtZW50KHRlc3QsIHJlcywgYWx0ZXJuYXRlKSBdKVxuXHR9IGVsc2Vcblx0XHQvLyBhbHRlcm5hdGUgd3JpdHRlbiB0byBieSBgY2FzZUJvZHlgLlxuXHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQodDAodGhpcy50ZXN0KSwgdDAodGhpcy5yZXN1bHQpLCBhbHRlcm5hdGUpXG59XG5cbmZ1bmN0aW9uIHN1cGVyQ2FsbCgpIHtcblx0Y29uc3QgYXJncyA9IHRoaXMuYXJncy5tYXAodDApXG5cdGNvbnN0IG1ldGhvZCA9IHZlcmlmeVJlc3VsdHMuc3VwZXJDYWxsVG9NZXRob2QuZ2V0KHRoaXMpXG5cblx0aWYgKG1ldGhvZCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB7XG5cdFx0Y29uc3QgY2FsbCA9IG5ldyBDYWxsRXhwcmVzc2lvbihJZFN1cGVyLCBhcmdzKVxuXHRcdGNvbnN0IG1lbWJlclNldHMgPSBjb25zdHJ1Y3RvclNldE1lbWJlcnMobWV0aG9kKVxuXHRcdHJldHVybiBjYXQoY2FsbCwgbWVtYmVyU2V0cylcblx0fSBlbHNlIHtcblx0XHRjb25zdCBtID0gdHlwZW9mIG1ldGhvZC5zeW1ib2wgPT09ICdzdHJpbmcnID9cblx0XHRcdG1lbWJlcihJZFN1cGVyLCBtZXRob2Quc3ltYm9sKSA6XG5cdFx0XHRuZXcgTWVtYmVyRXhwcmVzc2lvbihJZFN1cGVyLCB0MChtZXRob2Quc3ltYm9sKSlcblx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKG0sIGFyZ3MpXG5cdH1cbn1cblxuZnVuY3Rpb24gc3dpdGNoUGFydCgpIHtcblx0Y29uc3Qgb3BPdXQgPSBvcElmKHRoaXMgaW5zdGFuY2VvZiBTd2l0Y2hEb1BhcnQsICgpID0+IG5ldyBCcmVha1N0YXRlbWVudClcblx0Lypcblx0V2UgY291bGQganVzdCBwYXNzIGJsb2NrLmJvZHkgZm9yIHRoZSBzd2l0Y2ggbGluZXMsIGJ1dCBpbnN0ZWFkXG5cdGVuY2xvc2UgdGhlIGJvZHkgb2YgdGhlIHN3aXRjaCBjYXNlIGluIGN1cmx5IGJyYWNlcyB0byBlbnN1cmUgYSBuZXcgc2NvcGUuXG5cdFRoYXQgd2F5IHRoaXMgY29kZSB3b3Jrczpcblx0XHRzd2l0Y2ggKDApIHtcblx0XHRcdGNhc2UgMDoge1xuXHRcdFx0XHRjb25zdCBhID0gMFxuXHRcdFx0XHRyZXR1cm4gYVxuXHRcdFx0fVxuXHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHQvLyBXaXRob3V0IGN1cmx5IGJyYWNlcyB0aGlzIHdvdWxkIGNvbmZsaWN0IHdpdGggdGhlIG90aGVyIGBhYC5cblx0XHRcdFx0Y29uc3QgYSA9IDFcblx0XHRcdFx0YVxuXHRcdFx0fVxuXHRcdH1cblx0Ki9cblx0Y29uc3QgYmxvY2sgPSB0Myh0aGlzLnJlc3VsdCwgbnVsbCwgbnVsbCwgb3BPdXQpXG5cdC8vIElmIHN3aXRjaCBoYXMgbXVsdGlwbGUgdmFsdWVzLCBidWlsZCB1cCBhIHN0YXRlbWVudCBsaWtlOiBgY2FzZSAxOiBjYXNlIDI6IHsgZG9CbG9jaygpIH1gXG5cdGNvbnN0IHggPSBbIF1cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnZhbHVlcy5sZW5ndGggLSAxOyBpID0gaSArIDEpXG5cdFx0Ly8gVGhlc2UgY2FzZXMgZmFsbHRocm91Z2ggdG8gdGhlIG9uZSBhdCB0aGUgZW5kLlxuXHRcdHgucHVzaChuZXcgU3dpdGNoQ2FzZSh0MCh0aGlzLnZhbHVlc1tpXSksIFsgXSkpXG5cdHgucHVzaChuZXcgU3dpdGNoQ2FzZSh0MCh0aGlzLnZhbHVlc1t0aGlzLnZhbHVlcy5sZW5ndGggLSAxXSksIFsgYmxvY2sgXSkpXG5cdHJldHVybiB4XG59XG5cbi8vIEZ1bmN0aW9ucyBzcGVjaWZpYyB0byBjZXJ0YWluIGV4cHJlc3Npb25zLlxuY29uc3Rcblx0Ly8gV3JhcHMgYSBibG9jayAod2l0aCBgcmV0dXJuYCBzdGF0ZW1lbnRzIGluIGl0KSBpbiBhbiBJSUZFLlxuXHRibG9ja1dyYXAgPSBibG9jayA9PiB7XG5cdFx0Y29uc3QgaW52b2tlID0gbmV3IENhbGxFeHByZXNzaW9uKGZ1bmN0aW9uRXhwcmVzc2lvblRodW5rKGJsb2NrLCBpc0luR2VuZXJhdG9yKSwgWyBdKVxuXHRcdHJldHVybiBpc0luR2VuZXJhdG9yID8gbmV3IFlpZWxkRXhwcmVzc2lvbihpbnZva2UsIHRydWUpIDogaW52b2tlXG5cdH0sXG5cblx0Y2FzZUJvZHkgPSAocGFydHMsIG9wRWxzZSkgPT4ge1xuXHRcdGxldCBhY2MgPSBpZkVsc2Uob3BFbHNlLCB0MCwgKCkgPT4gVGhyb3dOb0Nhc2VNYXRjaClcblx0XHRmb3IgKGxldCBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpID0gaSAtIDEpXG5cdFx0XHRhY2MgPSB0MShwYXJ0c1tpXSwgYWNjKVxuXHRcdHJldHVybiBhY2Ncblx0fSxcblxuXHRjb25zdHJ1Y3RvclNldE1lbWJlcnMgPSBjb25zdHJ1Y3RvciA9PlxuXHRcdGNvbnN0cnVjdG9yLm1lbWJlckFyZ3MubWFwKF8gPT5cblx0XHRcdG1zTmV3UHJvcGVydHkobmV3IFRoaXNFeHByZXNzaW9uKCksIG5ldyBMaXRlcmFsKF8ubmFtZSksIGlkRm9yRGVjbGFyZUNhY2hlZChfKSkpLFxuXG5cdGZvckxvb3AgPSAob3BJdGVyYXRlZSwgYmxvY2spID0+XG5cdFx0aWZFbHNlKG9wSXRlcmF0ZWUsXG5cdFx0XHQoeyBlbGVtZW50LCBiYWcgfSkgPT4ge1xuXHRcdFx0XHRjb25zdCBkZWNsYXJlID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2xldCcsXG5cdFx0XHRcdFx0WyBuZXcgVmFyaWFibGVEZWNsYXJhdG9yKHQwKGVsZW1lbnQpKSBdKVxuXHRcdFx0XHRyZXR1cm4gbmV3IEZvck9mU3RhdGVtZW50KGRlY2xhcmUsIHQwKGJhZyksIHQwKGJsb2NrKSlcblx0XHRcdH0sXG5cdFx0XHQoKSA9PiBmb3JTdGF0ZW1lbnRJbmZpbml0ZSh0MChibG9jaykpKSxcblxuXHRkb1Rocm93ID0gdGhyb3duID0+XG5cdFx0bmV3IFRocm93U3RhdGVtZW50KHRocm93biBpbnN0YW5jZW9mIFF1b3RlID9cblx0XHRcdG5ldyBOZXdFeHByZXNzaW9uKEdsb2JhbEVycm9yLCBbIHQwKHRocm93bikgXSkgOlxuXHRcdFx0dDAodGhyb3duKSksXG5cblx0bWV0aG9kS2V5Q29tcHV0ZWQgPSBzeW1ib2wgPT4ge1xuXHRcdGlmICh0eXBlb2Ygc3ltYm9sID09PSAnc3RyaW5nJylcblx0XHRcdHJldHVybiB7IGtleTogcHJvcGVydHlJZE9yTGl0ZXJhbENhY2hlZChzeW1ib2wpLCBjb21wdXRlZDogZmFsc2UgfVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3Qga2V5ID0gc3ltYm9sIGluc3RhbmNlb2YgUXVvdGUgPyB0MChzeW1ib2wpIDogbXNTeW1ib2wodDAoc3ltYm9sKSlcblx0XHRcdHJldHVybiB7IGtleSwgY29tcHV0ZWQ6IHRydWUgfVxuXHRcdH1cblx0fSxcblxuXHR0cmFuc3BpbGVCbG9jayA9IChyZXR1cm5lZCwgbGluZXMsIGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpID0+IHtcblx0XHQvLyBUT0RPOkVTNiBPcHRpb25hbCBhcmd1bWVudHNcblx0XHRpZiAobGVhZCA9PT0gdW5kZWZpbmVkKSBsZWFkID0gbnVsbFxuXHRcdGlmIChvcERlY2xhcmVSZXMgPT09IHVuZGVmaW5lZCkgb3BEZWNsYXJlUmVzID0gbnVsbFxuXHRcdGlmIChvcE91dCA9PT0gdW5kZWZpbmVkKSBvcE91dCA9IG51bGxcblx0XHRjb25zdCBmaW4gPSBpZkVsc2Uob3BEZWNsYXJlUmVzLFxuXHRcdFx0cmQgPT4ge1xuXHRcdFx0XHRjb25zdCByZXQgPSBtYXliZVdyYXBJbkNoZWNrQ29udGFpbnMocmV0dXJuZWQsIHJkLm9wVHlwZSwgcmQubmFtZSlcblx0XHRcdFx0cmV0dXJuIGlmRWxzZShvcE91dCxcblx0XHRcdFx0XHRfID0+IGNhdChkZWNsYXJlKHJkLCByZXQpLCBfLCBSZXR1cm5SZXMpLFxuXHRcdFx0XHRcdCgpID0+IG5ldyBSZXR1cm5TdGF0ZW1lbnQocmV0KSlcblx0XHRcdH0sXG5cdFx0XHQoKSA9PiBjYXQob3BPdXQsIG5ldyBSZXR1cm5TdGF0ZW1lbnQocmV0dXJuZWQpKSlcblx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChsZWFkLCBsaW5lcywgZmluKSlcblx0fSxcblxuXHR0cmFuc3BpbGVFeGNlcHQgPSBleGNlcHQgPT5cblx0XHRuZXcgVHJ5U3RhdGVtZW50KFxuXHRcdFx0dDAoZXhjZXB0Ll90cnkpLFxuXHRcdFx0b3BNYXAoZXhjZXB0Ll9jYXRjaCwgdDApLFxuXHRcdFx0b3BNYXAoZXhjZXB0Ll9maW5hbGx5LCB0MCkpLFxuXG5cdHRyYW5zcGlsZVN3aXRjaCA9IF8gPT4ge1xuXHRcdGNvbnN0IHBhcnRzID0gZmxhdE1hcChfLnBhcnRzLCB0MClcblx0XHRwYXJ0cy5wdXNoKGlmRWxzZShfLm9wRWxzZSxcblx0XHRcdF8gPT4gbmV3IFN3aXRjaENhc2UodW5kZWZpbmVkLCB0MChfKS5ib2R5KSxcblx0XHRcdCgpID0+IFN3aXRjaENhc2VOb01hdGNoKSlcblx0XHRyZXR1cm4gbmV3IFN3aXRjaFN0YXRlbWVudCh0MChfLnN3aXRjaGVkKSwgcGFydHMpXG5cdH1cblxuY29uc3QgSWRCb290ID0gbmV3IElkZW50aWZpZXIoJ19ib290JylcblxuLy8gTW9kdWxlIGhlbHBlcnNcbmNvbnN0XG5cdGFtZFdyYXBNb2R1bGUgPSAoZG9Vc2VzLCBvdGhlclVzZXMsIGJvZHkpID0+IHtcblx0XHRjb25zdCB1c2VCb290ID0gY29udGV4dC5vcHRzLnVzZUJvb3QoKVxuXG5cdFx0Y29uc3QgYWxsVXNlcyA9IGRvVXNlcy5jb25jYXQob3RoZXJVc2VzKVxuXHRcdGNvbnN0IGFsbFVzZVBhdGhzID0gYWxsVXNlcy5tYXAoXyA9PiBtYW5nbGVQYXRoKF8ucGF0aCkpXG5cblx0XHRjb25zdCBhcnJVc2VQYXRocyA9IG5ldyBBcnJheUV4cHJlc3Npb24oY2F0KFxuXHRcdFx0b3BJZih1c2VCb290LCAoKSA9PiBuZXcgTGl0ZXJhbChjb250ZXh0Lm9wdHMuYm9vdFBhdGgoKSkpLFxuXHRcdFx0TGl0U3RyRXhwb3J0cyxcblx0XHRcdGFsbFVzZVBhdGhzLm1hcChfID0+IG5ldyBMaXRlcmFsKF8pKSkpXG5cblx0XHRjb25zdCB1c2VUb0lkZW50aWZpZXIgPSBuZXcgTWFwKClcblx0XHRjb25zdCB1c2VJZGVudGlmaWVycyA9IFsgXVxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYWxsVXNlcy5sZW5ndGg7IGkgPSBpICsgMSkge1xuXHRcdFx0Y29uc3QgXyA9IGFsbFVzZXNbaV1cblx0XHRcdGNvbnN0IGlkID0gaWRDYWNoZWQoYCR7cGF0aEJhc2VOYW1lKF8ucGF0aCl9XyR7aX1gKVxuXHRcdFx0dXNlSWRlbnRpZmllcnMucHVzaChpZClcblx0XHRcdHVzZVRvSWRlbnRpZmllci5zZXQoXywgaWQpXG5cdFx0fVxuXG5cdFx0Y29uc3QgdXNlQXJncyA9IGNhdChvcElmKHVzZUJvb3QsICgpID0+IElkQm9vdCksIElkRXhwb3J0cywgdXNlSWRlbnRpZmllcnMpXG5cblx0XHRjb25zdCBkb0Jvb3QgPSBvcElmKHVzZUJvb3QsICgpID0+IG5ldyBFeHByZXNzaW9uU3RhdGVtZW50KG1zR2V0TW9kdWxlKElkQm9vdCkpKVxuXG5cdFx0Y29uc3QgdXNlRG9zID0gZG9Vc2VzLm1hcCh1c2UgPT5cblx0XHRcdGxvYyhuZXcgRXhwcmVzc2lvblN0YXRlbWVudChtc0dldE1vZHVsZSh1c2VUb0lkZW50aWZpZXIuZ2V0KHVzZSkpKSwgdXNlLmxvYykpXG5cblx0XHQvLyBFeHRyYWN0cyB1c2VkIHZhbHVlcyBmcm9tIHRoZSBtb2R1bGVzLlxuXHRcdGNvbnN0IG9wRGVjbGFyZVVzZWRMb2NhbHMgPSBvcElmKCFpc0VtcHR5KG90aGVyVXNlcyksXG5cdFx0XHQoKSA9PiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLFxuXHRcdFx0XHRmbGF0TWFwKG90aGVyVXNlcywgdXNlID0+IHVzZURlY2xhcmF0b3JzKHVzZSwgdXNlVG9JZGVudGlmaWVyLmdldCh1c2UpKSkpKVxuXG5cdFx0Y29uc3QgZnVsbEJvZHkgPSBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KFxuXHRcdFx0ZG9Cb290LCB1c2VEb3MsIG9wRGVjbGFyZVVzZWRMb2NhbHMsIGJvZHksIFJldHVybkV4cG9ydHMpKVxuXG5cdFx0Y29uc3QgbGF6eUJvZHkgPVxuXHRcdFx0Y29udGV4dC5vcHRzLmxhenlNb2R1bGUoKSA/XG5cdFx0XHRcdG5ldyBCbG9ja1N0YXRlbWVudChbIG5ldyBFeHByZXNzaW9uU3RhdGVtZW50KFxuXHRcdFx0XHRcdG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIEV4cG9ydHNHZXQsXG5cdFx0XHRcdFx0XHRtc0xhenkoZnVuY3Rpb25FeHByZXNzaW9uVGh1bmsoZnVsbEJvZHkpKSkpIF0pIDpcblx0XHRcdFx0ZnVsbEJvZHlcblxuXHRcdHJldHVybiBuZXcgQ2FsbEV4cHJlc3Npb24oSWREZWZpbmUsXG5cdFx0XHRbIGFyclVzZVBhdGhzLCBuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24odXNlQXJncywgbGF6eUJvZHkpIF0pXG5cdH0sXG5cblx0cGF0aEJhc2VOYW1lID0gcGF0aCA9PlxuXHRcdHBhdGguc3Vic3RyKHBhdGgubGFzdEluZGV4T2YoJy8nKSArIDEpLFxuXG5cdHVzZURlY2xhcmF0b3JzID0gKHVzZSwgbW9kdWxlSWRlbnRpZmllcikgPT4ge1xuXHRcdC8vIFRPRE86IENvdWxkIGJlIG5lYXRlciBhYm91dCB0aGlzXG5cdFx0Y29uc3QgaXNMYXp5ID0gKGlzRW1wdHkodXNlLnVzZWQpID8gdXNlLm9wVXNlRGVmYXVsdCA6IHVzZS51c2VkWzBdKS5pc0xhenkoKVxuXHRcdGNvbnN0IHZhbHVlID0gKGlzTGF6eSA/IG1zTGF6eUdldE1vZHVsZSA6IG1zR2V0TW9kdWxlKShtb2R1bGVJZGVudGlmaWVyKVxuXG5cdFx0Y29uc3QgdXNlZERlZmF1bHQgPSBvcE1hcCh1c2Uub3BVc2VEZWZhdWx0LCBkZWYgPT4ge1xuXHRcdFx0Y29uc3QgZGVmZXhwID0gbXNHZXREZWZhdWx0RXhwb3J0KG1vZHVsZUlkZW50aWZpZXIpXG5cdFx0XHRjb25zdCB2YWwgPSBpc0xhenkgPyBsYXp5V3JhcChkZWZleHApIDogZGVmZXhwXG5cdFx0XHRyZXR1cm4gbG9jKG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoaWRGb3JEZWNsYXJlQ2FjaGVkKGRlZiksIHZhbCksIGRlZi5sb2MpXG5cdFx0fSlcblxuXHRcdGNvbnN0IHVzZWREZXN0cnVjdCA9IGlzRW1wdHkodXNlLnVzZWQpID8gbnVsbCA6XG5cdFx0XHRtYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycyh1c2UudXNlZCwgaXNMYXp5LCB2YWx1ZSwgdHJ1ZSwgZmFsc2UpXG5cblx0XHRyZXR1cm4gY2F0KHVzZWREZWZhdWx0LCB1c2VkRGVzdHJ1Y3QpXG5cdH1cblxuLy8gR2VuZXJhbCB1dGlscy4gTm90IGluIHV0aWwuanMgYmVjYXVzZSB0aGVzZSBjbG9zZSBvdmVyIGNvbnRleHQuXG5jb25zdFxuXHRtYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycyA9IChhc3NpZ25lZXMsIGlzTGF6eSwgdmFsdWUsIGlzTW9kdWxlLCBpc0V4cG9ydCkgPT4ge1xuXHRcdGNvbnN0IGRlc3RydWN0dXJlZE5hbWUgPSBgXyQke25leHREZXN0cnVjdHVyZWRJZH1gXG5cdFx0bmV4dERlc3RydWN0dXJlZElkID0gbmV4dERlc3RydWN0dXJlZElkICsgMVxuXHRcdGNvbnN0IGlkRGVzdHJ1Y3R1cmVkID0gbmV3IElkZW50aWZpZXIoZGVzdHJ1Y3R1cmVkTmFtZSlcblx0XHRjb25zdCBkZWNsYXJhdG9ycyA9IGFzc2lnbmVlcy5tYXAoYXNzaWduZWUgPT4ge1xuXHRcdFx0Ly8gVE9ETzogRG9uJ3QgY29tcGlsZSBpdCBpZiBpdCdzIG5ldmVyIGFjY2Vzc2VkXG5cdFx0XHRjb25zdCBnZXQgPSBnZXRNZW1iZXIoaWREZXN0cnVjdHVyZWQsIGFzc2lnbmVlLm5hbWUsIGlzTGF6eSwgaXNNb2R1bGUpXG5cdFx0XHRyZXR1cm4gbWFrZURlY2xhcmF0b3IoYXNzaWduZWUsIGdldCwgaXNMYXp5LCBpc0V4cG9ydClcblx0XHR9KVxuXHRcdC8vIEdldHRpbmcgbGF6eSBtb2R1bGUgaXMgZG9uZSBieSBtcy5sYXp5R2V0TW9kdWxlLlxuXHRcdGNvbnN0IHZhbCA9IGlzTGF6eSAmJiAhaXNNb2R1bGUgPyBsYXp5V3JhcCh2YWx1ZSkgOiB2YWx1ZVxuXHRcdHJldHVybiBjYXQobmV3IFZhcmlhYmxlRGVjbGFyYXRvcihpZERlc3RydWN0dXJlZCwgdmFsKSwgZGVjbGFyYXRvcnMpXG5cdH0sXG5cblx0bWFrZURlY2xhcmF0b3IgPSAoYXNzaWduZWUsIHZhbHVlLCB2YWx1ZUlzQWxyZWFkeUxhenksIGlzRXhwb3J0KSA9PiB7XG5cdFx0Y29uc3QgeyBsb2MsIG5hbWUsIG9wVHlwZSB9ID0gYXNzaWduZWVcblx0XHRjb25zdCBpc0xhenkgPSBhc3NpZ25lZS5pc0xhenkoKVxuXHRcdC8vIFRPRE86IGFzc2VydChhc3NpZ25lZS5vcFR5cGUgPT09IG51bGwpXG5cdFx0Ly8gb3IgVE9ETzogQWxsb3cgdHlwZSBjaGVjayBvbiBsYXp5IHZhbHVlP1xuXHRcdHZhbHVlID0gaXNMYXp5ID8gdmFsdWUgOiBtYXliZVdyYXBJbkNoZWNrQ29udGFpbnModmFsdWUsIG9wVHlwZSwgbmFtZSlcblx0XHRpZiAoaXNFeHBvcnQpIHtcblx0XHRcdC8vIFRPRE86RVM2XG5cdFx0XHRjb250ZXh0LmNoZWNrKCFpc0xhenksIGxvYywgJ0xhenkgZXhwb3J0IG5vdCBzdXBwb3J0ZWQuJylcblx0XHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdG9yKFxuXHRcdFx0XHRpZEZvckRlY2xhcmVDYWNoZWQoYXNzaWduZWUpLFxuXHRcdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRFeHBvcnRzLCBuYW1lKSwgdmFsdWUpKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCB2YWwgPSBpc0xhenkgJiYgIXZhbHVlSXNBbHJlYWR5TGF6eSA/IGxhenlXcmFwKHZhbHVlKSA6IHZhbHVlXG5cdFx0XHRhc3NlcnQoaXNMYXp5IHx8ICF2YWx1ZUlzQWxyZWFkeUxhenkpXG5cdFx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRvcihpZEZvckRlY2xhcmVDYWNoZWQoYXNzaWduZWUpLCB2YWwpXG5cdFx0fVxuXHR9LFxuXG5cdG1heWJlV3JhcEluQ2hlY2tDb250YWlucyA9IChhc3QsIG9wVHlwZSwgbmFtZSkgPT5cblx0XHRjb250ZXh0Lm9wdHMuaW5jbHVkZUNoZWNrcygpICYmIG9wVHlwZSAhPT0gbnVsbCA/XG5cdFx0XHRtc0NoZWNrQ29udGFpbnModDAob3BUeXBlKSwgYXN0LCBuZXcgTGl0ZXJhbChuYW1lKSkgOlxuXHRcdFx0YXN0LFxuXG5cdGdldE1lbWJlciA9IChhc3RPYmplY3QsIGdvdE5hbWUsIGlzTGF6eSwgaXNNb2R1bGUpID0+XG5cdFx0aXNMYXp5ID9cblx0XHRtc0xhenlHZXQoYXN0T2JqZWN0LCBuZXcgTGl0ZXJhbChnb3ROYW1lKSkgOlxuXHRcdGlzTW9kdWxlICYmIGNvbnRleHQub3B0cy5pbmNsdWRlQ2hlY2tzKCkgP1xuXHRcdG1zR2V0KGFzdE9iamVjdCwgbmV3IExpdGVyYWwoZ290TmFtZSkpIDpcblx0XHRtZW1iZXIoYXN0T2JqZWN0LCBnb3ROYW1lKVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
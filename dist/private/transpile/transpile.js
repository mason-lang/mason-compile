if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'esast/dist/ast', 'esast/dist/util', '../manglePath', '../MsAst', '../util', './ast-constants', './ms-call', './util'], function (exports, _esastDistAst, _esastDistUtil, _manglePath, _MsAst, _util, _astConstants, _msCall, _util2) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

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
						return ass.apply(undefined, [t0(called.object), new _esastDistAst.Literal(called.name)].concat(_toConsumableArray(args)));
					} else {
						const ass = this.negate ? _msCall.msAssertNot : _msCall.msAssert;
						return ass.apply(undefined, [t0(called)].concat(_toConsumableArray(args)));
					}
				} else return new _esastDistAst.IfStatement(failCond(), _astConstants.ThrowAssertFail);
			});
		},

		AssignSingle(valWrap) {
			const val = valWrap === undefined ? t0(this.value) : valWrap(t0(this.value));
			const declare = makeDeclarator(this.assignee, val, false);
			return new _esastDistAst.VariableDeclaration(this.assignee.isMutable() ? 'let' : 'const', [declare]);
		},
		// TODO:ES6 Just use native destructuring assign
		AssignDestructure() {
			return new _esastDistAst.VariableDeclaration(this.kind() === _MsAst.LD_Mutable ? 'let' : 'const', makeDestructureDeclarators(this.assignees, this.kind() === _MsAst.LD_Lazy, t0(this.value), false));
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

		Cond() {
			return new _esastDistAst.ConditionalExpression(t0(this.test), t0(this.ifTrue), t0(this.ifFalse));
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
			const body = tLines(this.lines);
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

		ModuleExportNamed() {
			return t1(this.assign, val => new _esastDistAst.AssignmentExpression('=', (0, _esastDistUtil.member)(_astConstants.IdExports, this.assign.assignee.name), val));
		},

		ModuleExportDefault() {
			return t1(this.assign, val => new _esastDistAst.AssignmentExpression('=', _astConstants.ExportsDefault, val));
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
	const makeDestructureDeclarators = (assignees, isLazy, value, isModule) => {
		const destructuredName = `_$${ nextDestructuredId }`;
		nextDestructuredId = nextDestructuredId + 1;
		const idDestructured = new _esastDistAst.Identifier(destructuredName);
		const declarators = assignees.map(assignee => {
			// TODO: Don't compile it if it's never accessed
			const get = getMember(idDestructured, assignee.name, isLazy, isModule);
			return makeDeclarator(assignee, get, isLazy);
		});
		// Getting lazy module is done by ms.lazyGetModule.
		const val = isLazy && !isModule ? (0, _msCall.lazyWrap)(value) : value;
		return (0, _util.cat)(new _esastDistAst.VariableDeclarator(idDestructured, val), declarators);
	},
	      makeDeclarator = (assignee, value, valueIsAlreadyLazy) => {
		const name = assignee.name;
		const opType = assignee.opType;

		const isLazy = assignee.isLazy();
		// TODO: assert(assignee.opType === null)
		// or TODO: Allow type check on lazy value?
		value = isLazy ? value : maybeWrapInCheckContains(value, opType, name);
		const val = isLazy && !valueIsAlreadyLazy ? (0, _msCall.lazyWrap)(value) : value;
		(0, _util.assert)(isLazy || !valueIsAlreadyLazy);
		return new _esastDistAst.VariableDeclarator((0, _util2.idForDeclareCached)(assignee), val);
	},
	      maybeWrapInCheckContains = (ast, opType, name) => context.opts.includeChecks() && opType !== null ? (0, _msCall.msCheckContains)(t0(opType), ast, new _esastDistAst.Literal(name)) : ast,
	      getMember = (astObject, gotName, isLazy, isModule) => isLazy ? (0, _msCall.msLazyGet)(astObject, new _esastDistAst.Literal(gotName)) : isModule && context.opts.includeChecks() ? (0, _msCall.msGet)(astObject, new _esastDistAst.Literal(gotName)) : (0, _esastDistUtil.member)(astObject, gotName);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zcGlsZS5qcyIsInByaXZhdGUvdHJhbnNwaWxlL3RyYW5zcGlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztBQzZCQSxLQUFJLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLGVBQWUsQ0FBQTtBQUMxRCxLQUFJLGtCQUFrQixDQUFBOzttQkFFUCxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLEtBQUs7QUFDOUQsU0FBTyxHQUFHLFFBQVEsQ0FBQTtBQUNsQixlQUFhLEdBQUcsY0FBYyxDQUFBO0FBQzlCLGVBQWEsR0FBRyxLQUFLLENBQUE7QUFDckIsaUJBQWUsR0FBRyxLQUFLLENBQUE7QUFDdkIsb0JBQWtCLEdBQUcsQ0FBQyxDQUFBO0FBQ3RCLFFBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBOztBQUVoQyxTQUFPLEdBQUcsYUFBYSxHQUFHLFNBQVMsQ0FBQTtBQUNuQyxTQUFPLEdBQUcsQ0FBQTtFQUNWOztBQUVNLE9BQ04sRUFBRSxHQUFHLElBQUksSUFBSSxtQkFyQzZCLEdBQUcsRUFxQzVCLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7O0FBQzdDLE9BQ0MsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsS0FBSyxtQkF2Q3NCLEdBQUcsRUF1Q3JCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQztPQUN0RCxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEtBQUssbUJBeENVLEdBQUcsRUF3Q1QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7T0FDOUUsTUFBTSxHQUFHLEtBQUssSUFBSTtBQUNqQixRQUFNLEdBQUcsR0FBRyxF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QWEsRUFBRSxHQUN4QyxZQXJ1QnVELEtBQUssRUFxdUJ0RCxTQUFTLEVBQUUsa0JBenZCMkIsT0FBTyxDQXl2QnRCLE9BQU8sQ0FBQyxDQUFDLEdBQ3RDLG1CQXJ2QjhDLE1BQU0sRUFxdkI3QyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUEiLCJmaWxlIjoicHJpdmF0ZS90cmFuc3BpbGUvdHJhbnNwaWxlLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge0FycmF5RXhwcmVzc2lvbiwgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24sIEFzc2lnbm1lbnRFeHByZXNzaW9uLCBCaW5hcnlFeHByZXNzaW9uLFxuXHRCbG9ja1N0YXRlbWVudCwgQnJlYWtTdGF0ZW1lbnQsIENhbGxFeHByZXNzaW9uLCBDYXRjaENsYXVzZSwgQ2xhc3NCb2R5LCBDbGFzc0V4cHJlc3Npb24sXG5cdENvbmRpdGlvbmFsRXhwcmVzc2lvbiwgRGVidWdnZXJTdGF0ZW1lbnQsIEV4cHJlc3Npb25TdGF0ZW1lbnQsIEZvck9mU3RhdGVtZW50LFxuXHRGdW5jdGlvbkV4cHJlc3Npb24sIElkZW50aWZpZXIsIElmU3RhdGVtZW50LCBMaXRlcmFsLCBMb2dpY2FsRXhwcmVzc2lvbiwgTWVtYmVyRXhwcmVzc2lvbixcblx0TWV0aG9kRGVmaW5pdGlvbiwgTmV3RXhwcmVzc2lvbiwgT2JqZWN0RXhwcmVzc2lvbiwgUHJvZ3JhbSwgUHJvcGVydHksIFJldHVyblN0YXRlbWVudCxcblx0U3ByZWFkRWxlbWVudCwgU3dpdGNoQ2FzZSwgU3dpdGNoU3RhdGVtZW50LCBUYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb24sIFRlbXBsYXRlRWxlbWVudCxcblx0VGVtcGxhdGVMaXRlcmFsLCBUaGlzRXhwcmVzc2lvbiwgVGhyb3dTdGF0ZW1lbnQsIFRyeVN0YXRlbWVudCwgVmFyaWFibGVEZWNsYXJhdGlvbixcblx0VW5hcnlFeHByZXNzaW9uLCBWYXJpYWJsZURlY2xhcmF0b3IsIFlpZWxkRXhwcmVzc2lvbn0gZnJvbSAnZXNhc3QvZGlzdC9hc3QnXG5pbXBvcnQge2Z1bmN0aW9uRXhwcmVzc2lvblRodW5rLCBpZENhY2hlZCwgbG9jLCBtZW1iZXIsIHByb3BlcnR5SWRPckxpdGVyYWxDYWNoZWQsIHRvU3RhdGVtZW50XG5cdH0gZnJvbSAnZXNhc3QvZGlzdC91dGlsJ1xuaW1wb3J0IG1hbmdsZVBhdGggZnJvbSAnLi4vbWFuZ2xlUGF0aCdcbmltcG9ydCAqIGFzIE1zQXN0VHlwZXMgZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0Fzc2lnblNpbmdsZSwgQ2FsbCwgQ29uc3RydWN0b3IsIExfQW5kLCBMX09yLCBMRF9MYXp5LCBMRF9NdXRhYmxlLCBNZW1iZXIsIE1TX011dGF0ZSxcblx0TVNfTmV3LCBNU19OZXdNdXRhYmxlLCBMb2NhbERlY2xhcmUsIFBhdHRlcm4sIFNwbGF0LCBTRF9EZWJ1Z2dlciwgU1ZfQ29udGFpbnMsIFNWX0ZhbHNlLFxuXHRTVl9OYW1lLCBTVl9OdWxsLCBTVl9TdWIsIFNWX1RydWUsIFNWX1VuZGVmaW5lZCwgU3dpdGNoRG9QYXJ0LCBRdW90ZSwgVXNlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7YXNzZXJ0LCBjYXQsIGZsYXRNYXAsIGZsYXRPcE1hcCwgaWZFbHNlLCBpc0VtcHR5LCBpbXBsZW1lbnRNYW55LCBpc1Bvc2l0aXZlLCBsYXN0LCBvcElmLFxuXHRvcE1hcCwgdGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7QW1kZWZpbmVIZWFkZXIsIEFycmF5U2xpY2VDYWxsLCBEZWNsYXJlQnVpbHRCYWcsIERlY2xhcmVCdWlsdE1hcCwgRGVjbGFyZUJ1aWx0T2JqLFxuXHREZWNsYXJlTGV4aWNhbFRoaXMsIEV4cG9ydHNEZWZhdWx0LCBFeHBvcnRzR2V0LCBJZEFyZ3VtZW50cywgSWRCdWlsdCwgSWRDb25zdHJ1Y3RvciwgSWREZWZpbmUsXG5cdElkRXhwb3J0cywgSWRFeHRyYWN0LCBJZEZvY3VzLCBJZExleGljYWxUaGlzLCBJZFN1cGVyLCBHbG9iYWxFcnJvciwgTGl0RW1wdHlTdHJpbmcsIExpdE51bGwsXG5cdExpdFN0ckV4cG9ydHMsIExpdFN0clRocm93LCBMaXRaZXJvLCBSZXR1cm5CdWlsdCwgUmV0dXJuRXhwb3J0cywgUmV0dXJuUmVzLCBTd2l0Y2hDYXNlTm9NYXRjaCxcblx0VGhyb3dBc3NlcnRGYWlsLCBUaHJvd05vQ2FzZU1hdGNoLCBVc2VTdHJpY3R9IGZyb20gJy4vYXN0LWNvbnN0YW50cydcbmltcG9ydCB7SWRNcywgbGF6eVdyYXAsIG1zQWRkLCBtc0FkZE1hbnksIG1zQXNzZXJ0LCBtc0Fzc2VydE1lbWJlciwgbXNBc3NlcnROb3QsXG5cdG1zQXNzZXJ0Tm90TWVtYmVyLCBtc0Fzc29jLCBtc0NoZWNrQ29udGFpbnMsIG1zRXh0cmFjdCwgbXNHZXQsIG1zR2V0RGVmYXVsdEV4cG9ydCwgbXNHZXRNb2R1bGUsXG5cdG1zTGF6eSwgbXNMYXp5R2V0LCBtc0xhenlHZXRNb2R1bGUsIG1zTmV3TXV0YWJsZVByb3BlcnR5LCBtc05ld1Byb3BlcnR5LCBtc1NldCwgbXNTZXROYW1lLFxuXHRtc1NldExhenksIG1zU29tZSwgbXNTeW1ib2wsIE1zTm9uZX0gZnJvbSAnLi9tcy1jYWxsJ1xuaW1wb3J0IHthY2Nlc3NMb2NhbERlY2xhcmUsIGRlY2xhcmUsIGZvclN0YXRlbWVudEluZmluaXRlLCBpZEZvckRlY2xhcmVDYWNoZWQsXG5cdG9wVHlwZUNoZWNrRm9yTG9jYWxEZWNsYXJlfSBmcm9tICcuL3V0aWwnXG5cbmxldCBjb250ZXh0LCB2ZXJpZnlSZXN1bHRzLCBpc0luR2VuZXJhdG9yLCBpc0luQ29uc3RydWN0b3JcbmxldCBuZXh0RGVzdHJ1Y3R1cmVkSWRcblxuZXhwb3J0IGRlZmF1bHQgKF9jb250ZXh0LCBtb2R1bGVFeHByZXNzaW9uLCBfdmVyaWZ5UmVzdWx0cykgPT4ge1xuXHRjb250ZXh0ID0gX2NvbnRleHRcblx0dmVyaWZ5UmVzdWx0cyA9IF92ZXJpZnlSZXN1bHRzXG5cdGlzSW5HZW5lcmF0b3IgPSBmYWxzZVxuXHRpc0luQ29uc3RydWN0b3IgPSBmYWxzZVxuXHRuZXh0RGVzdHJ1Y3R1cmVkSWQgPSAwXG5cdGNvbnN0IHJlcyA9IHQwKG1vZHVsZUV4cHJlc3Npb24pXG5cdC8vIFJlbGVhc2UgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cblx0Y29udGV4dCA9IHZlcmlmeVJlc3VsdHMgPSB1bmRlZmluZWRcblx0cmV0dXJuIHJlc1xufVxuXG5leHBvcnQgY29uc3Rcblx0dDAgPSBleHByID0+IGxvYyhleHByLnRyYW5zcGlsZSgpLCBleHByLmxvYylcbmNvbnN0XG5cdHQxID0gKGV4cHIsIGFyZykgPT4gbG9jKGV4cHIudHJhbnNwaWxlKGFyZyksIGV4cHIubG9jKSxcblx0dDMgPSAoZXhwciwgYXJnLCBhcmcyLCBhcmczKSA9PiBsb2MoZXhwci50cmFuc3BpbGUoYXJnLCBhcmcyLCBhcmczKSwgZXhwci5sb2MpLFxuXHR0TGluZXMgPSBleHBycyA9PiB7XG5cdFx0Y29uc3Qgb3V0ID0gW11cblx0XHRmb3IgKGNvbnN0IGV4cHIgb2YgZXhwcnMpIHtcblx0XHRcdGNvbnN0IGFzdCA9IGV4cHIudHJhbnNwaWxlKClcblx0XHRcdGlmIChhc3QgaW5zdGFuY2VvZiBBcnJheSlcblx0XHRcdFx0Ly8gRGVidWcgbWF5IHByb2R1Y2UgbXVsdGlwbGUgc3RhdGVtZW50cy5cblx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIGFzdClcblx0XHRcdFx0XHRvdXQucHVzaCh0b1N0YXRlbWVudChfKSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0b3V0LnB1c2gobG9jKHRvU3RhdGVtZW50KGFzdCksIGV4cHIubG9jKSlcblx0XHR9XG5cdFx0cmV0dXJuIG91dFxuXHR9XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ3RyYW5zcGlsZScsIHtcblx0QXNzZXJ0KCkge1xuXHRcdGNvbnN0IGZhaWxDb25kID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgY29uZCA9IHQwKHRoaXMuY29uZGl0aW9uKVxuXHRcdFx0cmV0dXJuIHRoaXMubmVnYXRlID8gY29uZCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCBjb25kKVxuXHRcdH1cblxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcFRocm93bixcblx0XHRcdF8gPT4gbmV3IElmU3RhdGVtZW50KGZhaWxDb25kKCksIGRvVGhyb3coXykpLFxuXHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5jb25kaXRpb24gaW5zdGFuY2VvZiBDYWxsKSB7XG5cdFx0XHRcdFx0Y29uc3QgY2FsbCA9IHRoaXMuY29uZGl0aW9uXG5cdFx0XHRcdFx0Y29uc3QgY2FsbGVkID0gY2FsbC5jYWxsZWRcblx0XHRcdFx0XHRjb25zdCBhcmdzID0gY2FsbC5hcmdzLm1hcCh0MClcblx0XHRcdFx0XHRpZiAoY2FsbGVkIGluc3RhbmNlb2YgTWVtYmVyKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBhc3MgPSB0aGlzLm5lZ2F0ZSA/IG1zQXNzZXJ0Tm90TWVtYmVyIDogbXNBc3NlcnRNZW1iZXJcblx0XHRcdFx0XHRcdHJldHVybiBhc3ModDAoY2FsbGVkLm9iamVjdCksIG5ldyBMaXRlcmFsKGNhbGxlZC5uYW1lKSwgLi4uYXJncylcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc3QgYXNzID0gdGhpcy5uZWdhdGUgPyBtc0Fzc2VydE5vdCA6IG1zQXNzZXJ0XG5cdFx0XHRcdFx0XHRyZXR1cm4gYXNzKHQwKGNhbGxlZCksIC4uLmFyZ3MpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KGZhaWxDb25kKCksIFRocm93QXNzZXJ0RmFpbClcblx0XHRcdH0pXG5cdH0sXG5cblx0QXNzaWduU2luZ2xlKHZhbFdyYXApIHtcblx0XHRjb25zdCB2YWwgPSB2YWxXcmFwID09PSB1bmRlZmluZWQgPyB0MCh0aGlzLnZhbHVlKSA6IHZhbFdyYXAodDAodGhpcy52YWx1ZSkpXG5cdFx0Y29uc3QgZGVjbGFyZSA9IG1ha2VEZWNsYXJhdG9yKHRoaXMuYXNzaWduZWUsIHZhbCwgZmFsc2UpXG5cdFx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKHRoaXMuYXNzaWduZWUuaXNNdXRhYmxlKCkgPyAnbGV0JyA6ICdjb25zdCcsIFtkZWNsYXJlXSlcblx0fSxcblx0Ly8gVE9ETzpFUzYgSnVzdCB1c2UgbmF0aXZlIGRlc3RydWN0dXJpbmcgYXNzaWduXG5cdEFzc2lnbkRlc3RydWN0dXJlKCkge1xuXHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbihcblx0XHRcdHRoaXMua2luZCgpID09PSBMRF9NdXRhYmxlID8gJ2xldCcgOiAnY29uc3QnLFxuXHRcdFx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMoXG5cdFx0XHRcdHRoaXMuYXNzaWduZWVzLFxuXHRcdFx0XHR0aGlzLmtpbmQoKSA9PT0gTERfTGF6eSxcblx0XHRcdFx0dDAodGhpcy52YWx1ZSksXG5cdFx0XHRcdGZhbHNlKSlcblx0fSxcblxuXHRCYWdFbnRyeSgpIHsgcmV0dXJuIG1zQWRkKElkQnVpbHQsIHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdEJhZ0VudHJ5TWFueSgpIHsgcmV0dXJuIG1zQWRkTWFueShJZEJ1aWx0LCB0MCh0aGlzLnZhbHVlKSkgfSxcblxuXHRCYWdTaW1wbGUoKSB7IHJldHVybiBuZXcgQXJyYXlFeHByZXNzaW9uKHRoaXMucGFydHMubWFwKHQwKSkgfSxcblxuXHRCbG9ja0RvKGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpIHtcblx0XHQvLyBUT0RPOkVTNiBPcHRpb25hbCBhcmd1bWVudHNcblx0XHRpZiAobGVhZCA9PT0gdW5kZWZpbmVkKSBsZWFkID0gbnVsbFxuXHRcdGlmIChvcERlY2xhcmVSZXMgPT09IHVuZGVmaW5lZCkgb3BEZWNsYXJlUmVzID0gbnVsbFxuXHRcdGlmIChvcE91dCA9PT0gdW5kZWZpbmVkKSBvcE91dCA9IG51bGxcblx0XHRhc3NlcnQob3BEZWNsYXJlUmVzID09PSBudWxsKVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHRMaW5lcyh0aGlzLmxpbmVzKSwgb3BPdXQpKVxuXHR9LFxuXG5cdEJsb2NrVmFsVGhyb3cobGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkge1xuXHRcdC8vIFRPRE86RVM2IE9wdGlvbmFsIGFyZ3VtZW50c1xuXHRcdGlmIChsZWFkID09PSB1bmRlZmluZWQpIGxlYWQgPSBudWxsXG5cdFx0aWYgKG9wRGVjbGFyZVJlcyA9PT0gdW5kZWZpbmVkKSBvcERlY2xhcmVSZXMgPSBudWxsXG5cdFx0aWYgKG9wT3V0ID09PSB1bmRlZmluZWQpIG9wT3V0ID0gbnVsbFxuXHRcdGNvbnRleHQud2FybklmKG9wRGVjbGFyZVJlcyAhPT0gbnVsbCB8fCBvcE91dCAhPT0gbnVsbCwgdGhpcy5sb2MsXG5cdFx0XHQnT3V0IGNvbmRpdGlvbiBpZ25vcmVkIGJlY2F1c2Ugb2Ygb2gtbm8hJylcblx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChsZWFkLCB0TGluZXModGhpcy5saW5lcyksIHQwKHRoaXMudGhyb3cpKSlcblx0fSxcblxuXHRCbG9ja1dpdGhSZXR1cm4obGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayh0MCh0aGlzLnJldHVybmVkKSwgdExpbmVzKHRoaXMubGluZXMpLCBsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KVxuXHR9LFxuXG5cdEJsb2NrQmFnKGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2soXG5cdFx0XHRJZEJ1aWx0LFxuXHRcdFx0Y2F0KERlY2xhcmVCdWlsdEJhZywgdExpbmVzKHRoaXMubGluZXMpKSxcblx0XHRcdGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpXG5cdH0sXG5cblx0QmxvY2tPYmoobGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkge1xuXHRcdGNvbnN0IGxpbmVzID0gY2F0KERlY2xhcmVCdWlsdE9iaiwgdExpbmVzKHRoaXMubGluZXMpKVxuXHRcdGNvbnN0IHJlcyA9IGlmRWxzZSh0aGlzLm9wT2JqZWQsXG5cdFx0XHRvYmplZCA9PiBpZkVsc2UodGhpcy5vcE5hbWUsXG5cdFx0XHRcdG5hbWUgPT4gbXNTZXQodDAob2JqZWQpLCBJZEJ1aWx0LCBuZXcgTGl0ZXJhbChuYW1lKSksXG5cdFx0XHRcdCgpID0+IG1zU2V0KHQwKG9iamVkKSwgSWRCdWlsdCkpLFxuXHRcdFx0KCkgPT4gaWZFbHNlKHRoaXMub3BOYW1lLFxuXHRcdFx0XHRfID0+IG1zU2V0TmFtZShJZEJ1aWx0LCBuZXcgTGl0ZXJhbChfKSksXG5cdFx0XHRcdCgpID0+IElkQnVpbHQpKVxuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayhyZXMsIGxpbmVzLCBsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KVxuXHR9LFxuXG5cdEJsb2NrTWFwKGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2soXG5cdFx0XHRJZEJ1aWx0LFxuXHRcdFx0Y2F0KERlY2xhcmVCdWlsdE1hcCwgdExpbmVzKHRoaXMubGluZXMpKSxcblx0XHRcdGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpXG5cdH0sXG5cblx0QmxvY2tXcmFwKCkgeyByZXR1cm4gYmxvY2tXcmFwKHQwKHRoaXMuYmxvY2spKSB9LFxuXG5cdEJyZWFrKCkgeyByZXR1cm4gbmV3IEJyZWFrU3RhdGVtZW50KCkgfSxcblxuXHRCcmVha1dpdGhWYWwoKSB7IHJldHVybiBuZXcgUmV0dXJuU3RhdGVtZW50KHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdENhbGwoKSB7XG5cdFx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbih0MCh0aGlzLmNhbGxlZCksIHRoaXMuYXJncy5tYXAodDApKVxuXHR9LFxuXG5cdENhc2VEbygpIHtcblx0XHRjb25zdCBib2R5ID0gY2FzZUJvZHkodGhpcy5wYXJ0cywgdGhpcy5vcEVsc2UpXG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wQ2FzZWQsIF8gPT4gbmV3IEJsb2NrU3RhdGVtZW50KFt0MChfKSwgYm9keV0pLCAoKSA9PiBib2R5KVxuXHR9LFxuXHRDYXNlVmFsKCkge1xuXHRcdGNvbnN0IGJvZHkgPSBjYXNlQm9keSh0aGlzLnBhcnRzLCB0aGlzLm9wRWxzZSlcblx0XHRjb25zdCBibG9jayA9IGlmRWxzZSh0aGlzLm9wQ2FzZWQsIF8gPT4gW3QwKF8pLCBib2R5XSwgKCkgPT4gW2JvZHldKVxuXHRcdHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KGJsb2NrKSlcblx0fSxcblx0Q2FzZURvUGFydDogY2FzZVBhcnQsXG5cdENhc2VWYWxQYXJ0OiBjYXNlUGFydCxcblxuXHRDbGFzcygpIHtcblx0XHRjb25zdCBtZXRob2RzID0gY2F0KFxuXHRcdFx0dGhpcy5zdGF0aWNzLm1hcChfID0+IHQxKF8sIHRydWUpKSxcblx0XHRcdG9wTWFwKHRoaXMub3BDb25zdHJ1Y3RvciwgdDApLFxuXHRcdFx0dGhpcy5tZXRob2RzLm1hcChfID0+IHQxKF8sIGZhbHNlKSkpXG5cdFx0Y29uc3Qgb3BOYW1lID0gb3BNYXAodmVyaWZ5UmVzdWx0cy5vcE5hbWUodGhpcyksIGlkQ2FjaGVkKVxuXHRcdGNvbnN0IGNsYXNzRXhwciA9IG5ldyBDbGFzc0V4cHJlc3Npb24oXG5cdFx0XHRvcE5hbWUsXG5cdFx0XHRvcE1hcCh0aGlzLm9wU3VwZXJDbGFzcywgdDApLCBuZXcgQ2xhc3NCb2R5KG1ldGhvZHMpKVxuXG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wRG8sIF8gPT4gdDEoXywgY2xhc3NFeHByKSwgKCkgPT4gY2xhc3NFeHByKVxuXHR9LFxuXG5cdENsYXNzRG8oY2xhc3NFeHByKSB7XG5cdFx0Y29uc3QgbGVhZCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IodDAodGhpcy5kZWNsYXJlRm9jdXMpLCBjbGFzc0V4cHIpXSlcblx0XHRjb25zdCByZXQgPSBuZXcgUmV0dXJuU3RhdGVtZW50KHQwKHRoaXMuZGVjbGFyZUZvY3VzKSlcblx0XHRjb25zdCBibG9jayA9IHQzKHRoaXMuYmxvY2ssIGxlYWQsIG51bGwsIHJldClcblx0XHRyZXR1cm4gYmxvY2tXcmFwKGJsb2NrKVxuXHR9LFxuXG5cdENvbmQoKSB7XG5cdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odDAodGhpcy50ZXN0KSwgdDAodGhpcy5pZlRydWUpLCB0MCh0aGlzLmlmRmFsc2UpKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsRG8oKSB7XG5cdFx0Y29uc3QgdGVzdCA9IHQwKHRoaXMudGVzdClcblx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KFxuXHRcdFx0dGhpcy5pc1VubGVzcyA/IG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCB0ZXN0KSA6IHRlc3QsXG5cdFx0XHR0MCh0aGlzLnJlc3VsdCkpXG5cdH0sXG5cblx0Q29uZGl0aW9uYWxWYWwoKSB7XG5cdFx0Y29uc3QgdGVzdCA9IHQwKHRoaXMudGVzdClcblx0XHRjb25zdCByZXN1bHQgPSBtc1NvbWUoYmxvY2tXcmFwKHQwKHRoaXMucmVzdWx0KSkpXG5cdFx0cmV0dXJuIHRoaXMuaXNVbmxlc3MgP1xuXHRcdFx0bmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXN0LCBNc05vbmUsIHJlc3VsdCkgOlxuXHRcdFx0bmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXN0LCByZXN1bHQsIE1zTm9uZSlcblx0fSxcblxuXHRDb25zdHJ1Y3RvcigpIHtcblx0XHRpc0luQ29uc3RydWN0b3IgPSB0cnVlXG5cblx0XHQvLyBJZiB0aGVyZSBpcyBhIGBzdXBlciFgLCBgdGhpc2Agd2lsbCBub3QgYmUgZGVmaW5lZCB1bnRpbCB0aGVuLCBzbyBtdXN0IHdhaXQgdW50aWwgdGhlbi5cblx0XHQvLyBPdGhlcndpc2UsIGRvIGl0IGF0IHRoZSBiZWdpbm5pbmcuXG5cdFx0Y29uc3QgYm9keSA9IHZlcmlmeVJlc3VsdHMuY29uc3RydWN0b3JUb1N1cGVyLmhhcyh0aGlzKSA/XG5cdFx0XHR0MCh0aGlzLmZ1bikgOlxuXHRcdFx0dDEodGhpcy5mdW4sIGNvbnN0cnVjdG9yU2V0TWVtYmVycyh0aGlzKSlcblxuXHRcdGNvbnN0IHJlcyA9IG5ldyBNZXRob2REZWZpbml0aW9uKElkQ29uc3RydWN0b3IsIGJvZHksICdjb25zdHJ1Y3RvcicsIGZhbHNlLCBmYWxzZSlcblx0XHRpc0luQ29uc3RydWN0b3IgPSBmYWxzZVxuXHRcdHJldHVybiByZXNcblx0fSxcblxuXHRDYXRjaCgpIHtcblx0XHRyZXR1cm4gbmV3IENhdGNoQ2xhdXNlKHQwKHRoaXMuY2F1Z2h0KSwgdDAodGhpcy5ibG9jaykpXG5cdH0sXG5cblx0RGVidWcoKSB7IHJldHVybiBjb250ZXh0Lm9wdHMuaW5jbHVkZUNoZWNrcygpID8gdExpbmVzKHRoaXMubGluZXMpIDogW10gfSxcblxuXHRFeGNlcHREbygpIHsgcmV0dXJuIHRyYW5zcGlsZUV4Y2VwdCh0aGlzKSB9LFxuXHRFeGNlcHRWYWwoKSB7IHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFt0cmFuc3BpbGVFeGNlcHQodGhpcyldKSkgfSxcblxuXHRGb3JEbygpIHsgcmV0dXJuIGZvckxvb3AodGhpcy5vcEl0ZXJhdGVlLCB0aGlzLmJsb2NrKSB9LFxuXG5cdEZvckJhZygpIHtcblx0XHRyZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChbXG5cdFx0XHREZWNsYXJlQnVpbHRCYWcsXG5cdFx0XHRmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jayksXG5cdFx0XHRSZXR1cm5CdWlsdFxuXHRcdF0pKVxuXHR9LFxuXG5cdEZvclZhbCgpIHtcblx0XHRyZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChbZm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spXSkpXG5cdH0sXG5cblx0RnVuKGxlYWRTdGF0ZW1lbnRzKSB7XG5cdFx0Ly8gVE9ETzpFUzYgT3B0aW9uYWwgYXJnc1xuXHRcdGlmIChsZWFkU3RhdGVtZW50cyA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0bGVhZFN0YXRlbWVudHMgPSBudWxsXG5cblx0XHRjb25zdCBvbGRJbkdlbmVyYXRvciA9IGlzSW5HZW5lcmF0b3Jcblx0XHRpc0luR2VuZXJhdG9yID0gdGhpcy5pc0dlbmVyYXRvclxuXG5cdFx0Ly8gVE9ETzpFUzYgdXNlIGAuLi5gZlxuXHRcdGNvbnN0IG5BcmdzID0gbmV3IExpdGVyYWwodGhpcy5hcmdzLmxlbmd0aClcblx0XHRjb25zdCBvcERlY2xhcmVSZXN0ID0gb3BNYXAodGhpcy5vcFJlc3RBcmcsIHJlc3QgPT5cblx0XHRcdGRlY2xhcmUocmVzdCwgbmV3IENhbGxFeHByZXNzaW9uKEFycmF5U2xpY2VDYWxsLCBbSWRBcmd1bWVudHMsIG5BcmdzXSkpKVxuXHRcdGNvbnN0IGFyZ0NoZWNrcyA9IG9wSWYoY29udGV4dC5vcHRzLmluY2x1ZGVDaGVja3MoKSwgKCkgPT5cblx0XHRcdGZsYXRPcE1hcCh0aGlzLmFyZ3MsIG9wVHlwZUNoZWNrRm9yTG9jYWxEZWNsYXJlKSlcblxuXHRcdGNvbnN0IF9pbiA9IG9wTWFwKHRoaXMub3BJbiwgdDApXG5cblx0XHRjb25zdCBvcERlY2xhcmVUaGlzID1cblx0XHRcdG9wSWYoIWlzSW5Db25zdHJ1Y3RvciAmJiB0aGlzLm9wRGVjbGFyZVRoaXMgIT0gbnVsbCwgKCkgPT4gRGVjbGFyZUxleGljYWxUaGlzKVxuXG5cdFx0Y29uc3QgbGVhZCA9IGNhdChsZWFkU3RhdGVtZW50cywgb3BEZWNsYXJlVGhpcywgb3BEZWNsYXJlUmVzdCwgYXJnQ2hlY2tzLCBfaW4pXG5cblx0XHRjb25zdCBfb3V0ID0gb3BNYXAodGhpcy5vcE91dCwgdDApXG5cdFx0Y29uc3QgYm9keSA9IHQzKHRoaXMuYmxvY2ssIGxlYWQsIHRoaXMub3BEZWNsYXJlUmVzLCBfb3V0KVxuXHRcdGNvbnN0IGFyZ3MgPSB0aGlzLmFyZ3MubWFwKHQwKVxuXHRcdGlzSW5HZW5lcmF0b3IgPSBvbGRJbkdlbmVyYXRvclxuXHRcdGNvbnN0IGlkID0gb3BNYXAodmVyaWZ5UmVzdWx0cy5vcE5hbWUodGhpcyksIGlkQ2FjaGVkKVxuXG5cdFx0Y29uc3QgY2FuVXNlQXJyb3dGdW5jdGlvbiA9XG5cdFx0XHRpZCA9PT0gbnVsbCAmJlxuXHRcdFx0dGhpcy5vcERlY2xhcmVUaGlzID09PSBudWxsICYmXG5cdFx0XHRvcERlY2xhcmVSZXN0ID09PSBudWxsICYmXG5cdFx0XHQhdGhpcy5pc0dlbmVyYXRvclxuXHRcdHJldHVybiBjYW5Vc2VBcnJvd0Z1bmN0aW9uID9cblx0XHRcdG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihhcmdzLCBib2R5KSA6XG5cdFx0XHRuZXcgRnVuY3Rpb25FeHByZXNzaW9uKGlkLCBhcmdzLCBib2R5LCB0aGlzLmlzR2VuZXJhdG9yKVxuXHR9LFxuXG5cdElnbm9yZSgpIHsgcmV0dXJuIFtdIH0sXG5cblx0TGF6eSgpIHsgcmV0dXJuIGxhenlXcmFwKHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdE1ldGhvZEltcGwoaXNTdGF0aWMpIHtcblx0XHRjb25zdCB2YWx1ZSA9IHQwKHRoaXMuZnVuKVxuXHRcdGFzc2VydCh2YWx1ZS5pZCA9PSBudWxsKVxuXHRcdC8vIFNpbmNlIHRoZSBGdW4gc2hvdWxkIGhhdmUgb3BEZWNsYXJlVGhpcywgaXQgd2lsbCBuZXZlciBiZSBhbiBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbi5cblx0XHRhc3NlcnQodmFsdWUgaW5zdGFuY2VvZiBGdW5jdGlvbkV4cHJlc3Npb24pXG5cblx0XHRjb25zdCB7a2V5LCBjb21wdXRlZH0gPSBtZXRob2RLZXlDb21wdXRlZCh0aGlzLnN5bWJvbClcblx0XHRyZXR1cm4gbmV3IE1ldGhvZERlZmluaXRpb24oa2V5LCB2YWx1ZSwgJ21ldGhvZCcsIGlzU3RhdGljLCBjb21wdXRlZClcblx0fSxcblx0TWV0aG9kR2V0dGVyKGlzU3RhdGljKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFtdLCB0MSh0aGlzLmJsb2NrLCBEZWNsYXJlTGV4aWNhbFRoaXMpKVxuXHRcdGNvbnN0IHtrZXksIGNvbXB1dGVkfSA9IG1ldGhvZEtleUNvbXB1dGVkKHRoaXMuc3ltYm9sKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kRGVmaW5pdGlvbihrZXksIHZhbHVlLCAnZ2V0JywgaXNTdGF0aWMsIGNvbXB1dGVkKVxuXHR9LFxuXHRNZXRob2RTZXR0ZXIoaXNTdGF0aWMpIHtcblx0XHRjb25zdCB2YWx1ZSA9IG5ldyBGdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgW0lkRm9jdXNdLCB0MSh0aGlzLmJsb2NrLCBEZWNsYXJlTGV4aWNhbFRoaXMpKVxuXHRcdGNvbnN0IHtrZXksIGNvbXB1dGVkfSA9IG1ldGhvZEtleUNvbXB1dGVkKHRoaXMuc3ltYm9sKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kRGVmaW5pdGlvbihrZXksIHZhbHVlLCAnc2V0JywgaXNTdGF0aWMsIGNvbXB1dGVkKVxuXHR9LFxuXG5cdE51bWJlckxpdGVyYWwoKSB7XG5cdFx0Ly8gTmVnYXRpdmUgbnVtYmVycyBhcmUgbm90IHBhcnQgb2YgRVMgc3BlYy5cblx0XHQvLyBodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNS4xLyNzZWMtNy44LjNcblx0XHRjb25zdCB2YWx1ZSA9IE51bWJlcih0aGlzLnZhbHVlKVxuXHRcdGNvbnN0IGxpdCA9IG5ldyBMaXRlcmFsKE1hdGguYWJzKHZhbHVlKSlcblx0XHRyZXR1cm4gaXNQb3NpdGl2ZSh2YWx1ZSkgPyBsaXQgOiBuZXcgVW5hcnlFeHByZXNzaW9uKCctJywgbGl0KVxuXHR9LFxuXG5cdExvY2FsQWNjZXNzKCkge1xuXHRcdGlmICh0aGlzLm5hbWUgPT09ICd0aGlzJylcblx0XHRcdHJldHVybiBpc0luQ29uc3RydWN0b3IgPyBuZXcgVGhpc0V4cHJlc3Npb24oKSA6IElkTGV4aWNhbFRoaXNcblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IGxkID0gdmVyaWZ5UmVzdWx0cy5sb2NhbERlY2xhcmVGb3JBY2Nlc3ModGhpcylcblx0XHRcdC8vIElmIGxkIG1pc3NpbmcsIHRoaXMgaXMgYSBidWlsdGluLCBhbmQgYnVpbHRpbnMgYXJlIG5ldmVyIGxhenlcblx0XHRcdHJldHVybiBsZCA9PT0gdW5kZWZpbmVkID8gaWRDYWNoZWQodGhpcy5uYW1lKSA6IGFjY2Vzc0xvY2FsRGVjbGFyZShsZClcblx0XHR9XG5cdH0sXG5cblx0TG9jYWxEZWNsYXJlKCkgeyByZXR1cm4gbmV3IElkZW50aWZpZXIoaWRGb3JEZWNsYXJlQ2FjaGVkKHRoaXMpLm5hbWUpIH0sXG5cblx0TG9jYWxNdXRhdGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIGlkQ2FjaGVkKHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdExvZ2ljKCkge1xuXHRcdGFzc2VydCh0aGlzLmtpbmQgPT09IExfQW5kIHx8IHRoaXMua2luZCA9PT0gTF9Pcilcblx0XHRjb25zdCBvcCA9IHRoaXMua2luZCA9PT0gTF9BbmQgPyAnJiYnIDogJ3x8J1xuXHRcdHJldHVybiB0YWlsKHRoaXMuYXJncykucmVkdWNlKChhLCBiKSA9PlxuXHRcdFx0bmV3IExvZ2ljYWxFeHByZXNzaW9uKG9wLCBhLCB0MChiKSksIHQwKHRoaXMuYXJnc1swXSkpXG5cdH0sXG5cblx0TWFwRW50cnkoKSB7IHJldHVybiBtc0Fzc29jKElkQnVpbHQsIHQwKHRoaXMua2V5KSwgdDAodGhpcy52YWwpKSB9LFxuXG5cdE1lbWJlcigpIHsgcmV0dXJuIG1lbWJlcih0MCh0aGlzLm9iamVjdCksIHRoaXMubmFtZSkgfSxcblxuXHRNZW1iZXJTZXQoKSB7XG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgTVNfTXV0YXRlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9Jyxcblx0XHRcdFx0XHRtZW1iZXIodDAodGhpcy5vYmplY3QpLCB0aGlzLm5hbWUpLFxuXHRcdFx0XHRcdHQwKHRoaXMudmFsdWUpKVxuXHRcdFx0Y2FzZSBNU19OZXc6XG5cdFx0XHRcdHJldHVybiBtc05ld1Byb3BlcnR5KHQwKHRoaXMub2JqZWN0KSwgbmV3IExpdGVyYWwodGhpcy5uYW1lKSwgdDAodGhpcy52YWx1ZSkpXG5cdFx0XHRjYXNlIE1TX05ld011dGFibGU6XG5cdFx0XHRcdHJldHVybiBtc05ld011dGFibGVQcm9wZXJ0eSh0MCh0aGlzLm9iamVjdCksIG5ldyBMaXRlcmFsKHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKClcblx0XHR9XG5cdH0sXG5cblx0TW9kdWxlKCkge1xuXHRcdGNvbnN0IGJvZHkgPSB0TGluZXModGhpcy5saW5lcylcblx0XHRjb25zdCBvdGhlclVzZXMgPSB0aGlzLnVzZXMuY29uY2F0KHRoaXMuZGVidWdVc2VzKVxuXG5cdFx0dmVyaWZ5UmVzdWx0cy5idWlsdGluUGF0aFRvTmFtZXMuZm9yRWFjaCgodXNlZCwgcGF0aCkgPT4ge1xuXHRcdFx0aWYgKHBhdGggIT09ICdnbG9iYWwnKSB7XG5cdFx0XHRcdGNvbnN0IHVzZWREZWNsYXJlcyA9IFtdXG5cdFx0XHRcdGxldCBvcFVzZURlZmF1bHQgPSBudWxsXG5cdFx0XHRcdGxldCBkZWZhdWx0TmFtZSA9IGxhc3QocGF0aC5zcGxpdCgnLycpKVxuXHRcdFx0XHRmb3IgKGNvbnN0IG5hbWUgb2YgdXNlZCkge1xuXHRcdFx0XHRcdGNvbnN0IGRlY2xhcmUgPSBMb2NhbERlY2xhcmUucGxhaW4odGhpcy5sb2MsIG5hbWUpXG5cdFx0XHRcdFx0aWYgKG5hbWUgPT09IGRlZmF1bHROYW1lKVxuXHRcdFx0XHRcdFx0b3BVc2VEZWZhdWx0ID0gZGVjbGFyZVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHVzZWREZWNsYXJlcy5wdXNoKGRlY2xhcmUpXG5cdFx0XHRcdH1cblx0XHRcdFx0b3RoZXJVc2VzLnB1c2gobmV3IFVzZSh0aGlzLmxvYywgcGF0aCwgdXNlZERlY2xhcmVzLCBvcFVzZURlZmF1bHQpKVxuXHRcdFx0fVxuXHRcdH0pXG5cblx0XHRjb25zdCBhbWQgPSBhbWRXcmFwTW9kdWxlKHRoaXMuZG9Vc2VzLCBvdGhlclVzZXMsIGJvZHkpXG5cblx0XHRyZXR1cm4gbmV3IFByb2dyYW0oY2F0KFxuXHRcdFx0b3BJZihjb250ZXh0Lm9wdHMuaW5jbHVkZVVzZVN0cmljdCgpLCAoKSA9PiBVc2VTdHJpY3QpLFxuXHRcdFx0b3BJZihjb250ZXh0Lm9wdHMuaW5jbHVkZUFtZGVmaW5lKCksICgpID0+IEFtZGVmaW5lSGVhZGVyKSxcblx0XHRcdHRvU3RhdGVtZW50KGFtZCkpKVxuXHR9LFxuXG5cdE1vZHVsZUV4cG9ydE5hbWVkKCkge1xuXHRcdHJldHVybiB0MSh0aGlzLmFzc2lnbiwgdmFsID0+XG5cdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRFeHBvcnRzLCB0aGlzLmFzc2lnbi5hc3NpZ25lZS5uYW1lKSwgdmFsKSlcblx0fSxcblxuXHRNb2R1bGVFeHBvcnREZWZhdWx0KCkge1xuXHRcdHJldHVybiB0MSh0aGlzLmFzc2lnbiwgdmFsID0+IG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIEV4cG9ydHNEZWZhdWx0LCB2YWwpKVxuXHR9LFxuXG5cdE5ldygpIHtcblx0XHRjb25zdCBhbnlTcGxhdCA9IHRoaXMuYXJncy5zb21lKF8gPT4gXyBpbnN0YW5jZW9mIFNwbGF0KVxuXHRcdGNvbnRleHQuY2hlY2soIWFueVNwbGF0LCB0aGlzLmxvYywgJ1RPRE86IFNwbGF0IHBhcmFtcyBmb3IgbmV3Jylcblx0XHRyZXR1cm4gbmV3IE5ld0V4cHJlc3Npb24odDAodGhpcy50eXBlKSwgdGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0Tm90KCkgeyByZXR1cm4gbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIHQwKHRoaXMuYXJnKSkgfSxcblxuXHRPYmpFbnRyeUFzc2lnbigpIHtcblx0XHRyZXR1cm4gdGhpcy5hc3NpZ24gaW5zdGFuY2VvZiBBc3NpZ25TaW5nbGUgJiYgIXRoaXMuYXNzaWduLmFzc2lnbmVlLmlzTGF6eSgpID9cblx0XHRcdHQxKHRoaXMuYXNzaWduLCB2YWwgPT5cblx0XHRcdFx0bmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyKElkQnVpbHQsIHRoaXMuYXNzaWduLmFzc2lnbmVlLm5hbWUpLCB2YWwpKSA6XG5cdFx0XHRjYXQoXG5cdFx0XHRcdHQwKHRoaXMuYXNzaWduKSxcblx0XHRcdFx0dGhpcy5hc3NpZ24uYWxsQXNzaWduZWVzKCkubWFwKF8gPT5cblx0XHRcdFx0XHRtc1NldExhenkoSWRCdWlsdCwgbmV3IExpdGVyYWwoXy5uYW1lKSwgaWRGb3JEZWNsYXJlQ2FjaGVkKF8pKSkpXG5cdH0sXG5cblx0T2JqRW50cnlDb21wdXRlZCgpIHtcblx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9Jyxcblx0XHRcdG5ldyBNZW1iZXJFeHByZXNzaW9uKElkQnVpbHQsIHQwKHRoaXMua2V5KSksXG5cdFx0XHR0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRPYmpTaW1wbGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBPYmplY3RFeHByZXNzaW9uKHRoaXMucGFpcnMubWFwKHBhaXIgPT5cblx0XHRcdG5ldyBQcm9wZXJ0eSgnaW5pdCcsIHByb3BlcnR5SWRPckxpdGVyYWxDYWNoZWQocGFpci5rZXkpLCB0MChwYWlyLnZhbHVlKSkpKVxuXHR9LFxuXG5cdFF1b3RlKCkge1xuXHRcdGlmICh0aGlzLnBhcnRzLmxlbmd0aCA9PT0gMClcblx0XHRcdHJldHVybiBMaXRFbXB0eVN0cmluZ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgcXVhc2lzID0gW10sIGV4cHJlc3Npb25zID0gW11cblxuXHRcdFx0Ly8gVGVtcGxhdGVMaXRlcmFsIG11c3Qgc3RhcnQgd2l0aCBhIFRlbXBsYXRlRWxlbWVudFxuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLnBhcnRzWzBdICE9PSAnc3RyaW5nJylcblx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LkVtcHR5KVxuXG5cdFx0XHRmb3IgKGxldCBwYXJ0IG9mIHRoaXMucGFydHMpXG5cdFx0XHRcdGlmICh0eXBlb2YgcGFydCA9PT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmZvclJhd1N0cmluZyhwYXJ0KSlcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Ly8gXCJ7MX17MX1cIiBuZWVkcyBhbiBlbXB0eSBxdWFzaSBpbiB0aGUgbWlkZGxlIChhbmQgb24gdGhlIGVuZHMpXG5cdFx0XHRcdFx0aWYgKHF1YXNpcy5sZW5ndGggPT09IGV4cHJlc3Npb25zLmxlbmd0aClcblx0XHRcdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5FbXB0eSlcblx0XHRcdFx0XHRleHByZXNzaW9ucy5wdXNoKHQwKHBhcnQpKVxuXHRcdFx0XHR9XG5cblx0XHRcdC8vIFRlbXBsYXRlTGl0ZXJhbCBtdXN0IGVuZCB3aXRoIGEgVGVtcGxhdGVFbGVtZW50LCBzbyBvbmUgbW9yZSBxdWFzaSB0aGFuIGV4cHJlc3Npb24uXG5cdFx0XHRpZiAocXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoKVxuXHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuRW1wdHkpXG5cblx0XHRcdHJldHVybiBuZXcgVGVtcGxhdGVMaXRlcmFsKHF1YXNpcywgZXhwcmVzc2lvbnMpXG5cdFx0fVxuXHR9LFxuXG5cdFF1b3RlVGVtcGxhdGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBUYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb24odDAodGhpcy50YWcpLCB0MCh0aGlzLnF1b3RlKSlcblx0fSxcblxuXHRTcGVjaWFsRG8oKSB7XG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU0RfRGVidWdnZXI6IHJldHVybiBuZXcgRGVidWdnZXJTdGF0ZW1lbnQoKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHR9XG5cdH0sXG5cblx0U3BlY2lhbFZhbCgpIHtcblx0XHQvLyBNYWtlIG5ldyBvYmplY3RzIGJlY2F1c2Ugd2Ugd2lsbCBhc3NpZ24gYGxvY2AgdG8gdGhlbS5cblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTVl9Db250YWluczogcmV0dXJuIG1lbWJlcihJZE1zLCAnY29udGFpbnMnKVxuXHRcdFx0Y2FzZSBTVl9GYWxzZTogcmV0dXJuIG5ldyBMaXRlcmFsKGZhbHNlKVxuXHRcdFx0Y2FzZSBTVl9OYW1lOiByZXR1cm4gbmV3IExpdGVyYWwodmVyaWZ5UmVzdWx0cy5uYW1lKHRoaXMpKVxuXHRcdFx0Y2FzZSBTVl9OdWxsOiByZXR1cm4gbmV3IExpdGVyYWwobnVsbClcblx0XHRcdGNhc2UgU1ZfU3ViOiByZXR1cm4gbWVtYmVyKElkTXMsICdzdWInKVxuXHRcdFx0Y2FzZSBTVl9UcnVlOiByZXR1cm4gbmV3IExpdGVyYWwodHJ1ZSlcblx0XHRcdGNhc2UgU1ZfVW5kZWZpbmVkOiByZXR1cm4gbmV3IFVuYXJ5RXhwcmVzc2lvbigndm9pZCcsIExpdFplcm8pXG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IodGhpcy5raW5kKVxuXHRcdH1cblx0fSxcblxuXHRTcGxhdCgpIHtcblx0XHRyZXR1cm4gbmV3IFNwcmVhZEVsZW1lbnQodDAodGhpcy5zcGxhdHRlZCkpXG5cdH0sXG5cblx0U3VwZXJDYWxsOiBzdXBlckNhbGwsXG5cdFN1cGVyQ2FsbERvOiBzdXBlckNhbGwsXG5cdFN1cGVyTWVtYmVyKCkge1xuXHRcdHJldHVybiBtZW1iZXIoSWRTdXBlciwgdGhpcy5uYW1lKVxuXHR9LFxuXG5cdFN3aXRjaERvKCkgeyByZXR1cm4gdHJhbnNwaWxlU3dpdGNoKHRoaXMpIH0sXG5cdFN3aXRjaFZhbCgpIHsgcmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW3RyYW5zcGlsZVN3aXRjaCh0aGlzKV0pKSB9LFxuXHRTd2l0Y2hEb1BhcnQ6IHN3aXRjaFBhcnQsXG5cdFN3aXRjaFZhbFBhcnQ6IHN3aXRjaFBhcnQsXG5cblx0VGhyb3coKSB7XG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wVGhyb3duLFxuXHRcdFx0XyA9PiBkb1Rocm93KF8pLFxuXHRcdFx0KCkgPT4gbmV3IFRocm93U3RhdGVtZW50KG5ldyBOZXdFeHByZXNzaW9uKEdsb2JhbEVycm9yLCBbTGl0U3RyVGhyb3ddKSkpXG5cdH0sXG5cblx0V2l0aCgpIHtcblx0XHRjb25zdCBpZERlY2xhcmUgPSBpZEZvckRlY2xhcmVDYWNoZWQodGhpcy5kZWNsYXJlKVxuXHRcdGNvbnN0IGJsb2NrID0gdDModGhpcy5ibG9jaywgbnVsbCwgbnVsbCwgbmV3IFJldHVyblN0YXRlbWVudChpZERlY2xhcmUpKVxuXHRcdGNvbnN0IGZ1biA9IGlzSW5HZW5lcmF0b3IgP1xuXHRcdFx0bmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihudWxsLCBbaWREZWNsYXJlXSwgYmxvY2ssIHRydWUpIDpcblx0XHRcdG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihbaWREZWNsYXJlXSwgYmxvY2spXG5cdFx0Y29uc3QgY2FsbCA9IG5ldyBDYWxsRXhwcmVzc2lvbihmdW4sIFt0MCh0aGlzLnZhbHVlKV0pXG5cdFx0cmV0dXJuIGlzSW5HZW5lcmF0b3IgPyBuZXcgWWllbGRFeHByZXNzaW9uKGNhbGwsIHRydWUpIDogY2FsbFxuXHR9LFxuXG5cdFlpZWxkKCkgeyByZXR1cm4gbmV3IFlpZWxkRXhwcmVzc2lvbihvcE1hcCh0aGlzLm9wWWllbGRlZCwgdDApLCBmYWxzZSkgfSxcblxuXHRZaWVsZFRvKCkgeyByZXR1cm4gbmV3IFlpZWxkRXhwcmVzc2lvbih0MCh0aGlzLnlpZWxkZWRUbyksIHRydWUpIH1cbn0pXG5cbmZ1bmN0aW9uIGNhc2VQYXJ0KGFsdGVybmF0ZSkge1xuXHRpZiAodGhpcy50ZXN0IGluc3RhbmNlb2YgUGF0dGVybikge1xuXHRcdGNvbnN0IHt0eXBlLCBwYXR0ZXJuZWQsIGxvY2Fsc30gPSB0aGlzLnRlc3Rcblx0XHRjb25zdCBkZWNsID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgW1xuXHRcdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZEV4dHJhY3QsIG1zRXh0cmFjdCh0MCh0eXBlKSwgdDAocGF0dGVybmVkKSkpXSlcblx0XHRjb25zdCB0ZXN0ID0gbmV3IEJpbmFyeUV4cHJlc3Npb24oJyE9PScsIElkRXh0cmFjdCwgTGl0TnVsbClcblx0XHRjb25zdCBleHRyYWN0ID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgbG9jYWxzLm1hcCgoXywgaWR4KSA9PlxuXHRcdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRvcihcblx0XHRcdFx0aWRGb3JEZWNsYXJlQ2FjaGVkKF8pLFxuXHRcdFx0XHRuZXcgTWVtYmVyRXhwcmVzc2lvbihJZEV4dHJhY3QsIG5ldyBMaXRlcmFsKGlkeCkpKSkpXG5cdFx0Y29uc3QgcmVzID0gdDEodGhpcy5yZXN1bHQsIGV4dHJhY3QpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChbZGVjbCwgbmV3IElmU3RhdGVtZW50KHRlc3QsIHJlcywgYWx0ZXJuYXRlKV0pXG5cdH0gZWxzZVxuXHRcdC8vIGFsdGVybmF0ZSB3cml0dGVuIHRvIGJ5IGBjYXNlQm9keWAuXG5cdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudCh0MCh0aGlzLnRlc3QpLCB0MCh0aGlzLnJlc3VsdCksIGFsdGVybmF0ZSlcbn1cblxuZnVuY3Rpb24gc3VwZXJDYWxsKCkge1xuXHRjb25zdCBhcmdzID0gdGhpcy5hcmdzLm1hcCh0MClcblx0Y29uc3QgbWV0aG9kID0gdmVyaWZ5UmVzdWx0cy5zdXBlckNhbGxUb01ldGhvZC5nZXQodGhpcylcblxuXHRpZiAobWV0aG9kIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpIHtcblx0XHRjb25zdCBjYWxsID0gbmV3IENhbGxFeHByZXNzaW9uKElkU3VwZXIsIGFyZ3MpXG5cdFx0Y29uc3QgbWVtYmVyU2V0cyA9IGNvbnN0cnVjdG9yU2V0TWVtYmVycyhtZXRob2QpXG5cdFx0cmV0dXJuIGNhdChjYWxsLCBtZW1iZXJTZXRzKVxuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IG0gPSB0eXBlb2YgbWV0aG9kLnN5bWJvbCA9PT0gJ3N0cmluZycgP1xuXHRcdFx0bWVtYmVyKElkU3VwZXIsIG1ldGhvZC5zeW1ib2wpIDpcblx0XHRcdG5ldyBNZW1iZXJFeHByZXNzaW9uKElkU3VwZXIsIHQwKG1ldGhvZC5zeW1ib2wpKVxuXHRcdHJldHVybiBuZXcgQ2FsbEV4cHJlc3Npb24obSwgYXJncylcblx0fVxufVxuXG5mdW5jdGlvbiBzd2l0Y2hQYXJ0KCkge1xuXHRjb25zdCBvcE91dCA9IG9wSWYodGhpcyBpbnN0YW5jZW9mIFN3aXRjaERvUGFydCwgKCkgPT4gbmV3IEJyZWFrU3RhdGVtZW50KVxuXHQvKlxuXHRXZSBjb3VsZCBqdXN0IHBhc3MgYmxvY2suYm9keSBmb3IgdGhlIHN3aXRjaCBsaW5lcywgYnV0IGluc3RlYWRcblx0ZW5jbG9zZSB0aGUgYm9keSBvZiB0aGUgc3dpdGNoIGNhc2UgaW4gY3VybHkgYnJhY2VzIHRvIGVuc3VyZSBhIG5ldyBzY29wZS5cblx0VGhhdCB3YXkgdGhpcyBjb2RlIHdvcmtzOlxuXHRcdHN3aXRjaCAoMCkge1xuXHRcdFx0Y2FzZSAwOiB7XG5cdFx0XHRcdGNvbnN0IGEgPSAwXG5cdFx0XHRcdHJldHVybiBhXG5cdFx0XHR9XG5cdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdC8vIFdpdGhvdXQgY3VybHkgYnJhY2VzIHRoaXMgd291bGQgY29uZmxpY3Qgd2l0aCB0aGUgb3RoZXIgYGFgLlxuXHRcdFx0XHRjb25zdCBhID0gMVxuXHRcdFx0XHRhXG5cdFx0XHR9XG5cdFx0fVxuXHQqL1xuXHRjb25zdCBibG9jayA9IHQzKHRoaXMucmVzdWx0LCBudWxsLCBudWxsLCBvcE91dClcblx0Ly8gSWYgc3dpdGNoIGhhcyBtdWx0aXBsZSB2YWx1ZXMsIGJ1aWxkIHVwIGEgc3RhdGVtZW50IGxpa2U6IGBjYXNlIDE6IGNhc2UgMjogeyBkb0Jsb2NrKCkgfWBcblx0Y29uc3QgeCA9IFtdXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy52YWx1ZXMubGVuZ3RoIC0gMTsgaSA9IGkgKyAxKVxuXHRcdC8vIFRoZXNlIGNhc2VzIGZhbGx0aHJvdWdoIHRvIHRoZSBvbmUgYXQgdGhlIGVuZC5cblx0XHR4LnB1c2gobmV3IFN3aXRjaENhc2UodDAodGhpcy52YWx1ZXNbaV0pLCBbXSkpXG5cdHgucHVzaChuZXcgU3dpdGNoQ2FzZSh0MCh0aGlzLnZhbHVlc1t0aGlzLnZhbHVlcy5sZW5ndGggLSAxXSksIFtibG9ja10pKVxuXHRyZXR1cm4geFxufVxuXG4vLyBGdW5jdGlvbnMgc3BlY2lmaWMgdG8gY2VydGFpbiBleHByZXNzaW9ucy5cbmNvbnN0XG5cdC8vIFdyYXBzIGEgYmxvY2sgKHdpdGggYHJldHVybmAgc3RhdGVtZW50cyBpbiBpdCkgaW4gYW4gSUlGRS5cblx0YmxvY2tXcmFwID0gYmxvY2sgPT4ge1xuXHRcdGNvbnN0IGludm9rZSA9IG5ldyBDYWxsRXhwcmVzc2lvbihmdW5jdGlvbkV4cHJlc3Npb25UaHVuayhibG9jaywgaXNJbkdlbmVyYXRvciksIFtdKVxuXHRcdHJldHVybiBpc0luR2VuZXJhdG9yID8gbmV3IFlpZWxkRXhwcmVzc2lvbihpbnZva2UsIHRydWUpIDogaW52b2tlXG5cdH0sXG5cblx0Y2FzZUJvZHkgPSAocGFydHMsIG9wRWxzZSkgPT4ge1xuXHRcdGxldCBhY2MgPSBpZkVsc2Uob3BFbHNlLCB0MCwgKCkgPT4gVGhyb3dOb0Nhc2VNYXRjaClcblx0XHRmb3IgKGxldCBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpID0gaSAtIDEpXG5cdFx0XHRhY2MgPSB0MShwYXJ0c1tpXSwgYWNjKVxuXHRcdHJldHVybiBhY2Ncblx0fSxcblxuXHRjb25zdHJ1Y3RvclNldE1lbWJlcnMgPSBjb25zdHJ1Y3RvciA9PlxuXHRcdGNvbnN0cnVjdG9yLm1lbWJlckFyZ3MubWFwKF8gPT5cblx0XHRcdG1zTmV3UHJvcGVydHkobmV3IFRoaXNFeHByZXNzaW9uKCksIG5ldyBMaXRlcmFsKF8ubmFtZSksIGlkRm9yRGVjbGFyZUNhY2hlZChfKSkpLFxuXG5cdGZvckxvb3AgPSAob3BJdGVyYXRlZSwgYmxvY2spID0+XG5cdFx0aWZFbHNlKG9wSXRlcmF0ZWUsXG5cdFx0XHQoe2VsZW1lbnQsIGJhZ30pID0+IHtcblx0XHRcdFx0Y29uc3QgZGVjbGFyZSA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdsZXQnLFxuXHRcdFx0XHRcdFtuZXcgVmFyaWFibGVEZWNsYXJhdG9yKHQwKGVsZW1lbnQpKV0pXG5cdFx0XHRcdHJldHVybiBuZXcgRm9yT2ZTdGF0ZW1lbnQoZGVjbGFyZSwgdDAoYmFnKSwgdDAoYmxvY2spKVxuXHRcdFx0fSxcblx0XHRcdCgpID0+IGZvclN0YXRlbWVudEluZmluaXRlKHQwKGJsb2NrKSkpLFxuXG5cdGRvVGhyb3cgPSB0aHJvd24gPT5cblx0XHRuZXcgVGhyb3dTdGF0ZW1lbnQodGhyb3duIGluc3RhbmNlb2YgUXVvdGUgP1xuXHRcdFx0bmV3IE5ld0V4cHJlc3Npb24oR2xvYmFsRXJyb3IsIFt0MCh0aHJvd24pXSkgOlxuXHRcdFx0dDAodGhyb3duKSksXG5cblx0bWV0aG9kS2V5Q29tcHV0ZWQgPSBzeW1ib2wgPT4ge1xuXHRcdGlmICh0eXBlb2Ygc3ltYm9sID09PSAnc3RyaW5nJylcblx0XHRcdHJldHVybiB7a2V5OiBwcm9wZXJ0eUlkT3JMaXRlcmFsQ2FjaGVkKHN5bWJvbCksIGNvbXB1dGVkOiBmYWxzZX1cblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IGtleSA9IHN5bWJvbCBpbnN0YW5jZW9mIFF1b3RlID8gdDAoc3ltYm9sKSA6IG1zU3ltYm9sKHQwKHN5bWJvbCkpXG5cdFx0XHRyZXR1cm4ge2tleSwgY29tcHV0ZWQ6IHRydWV9XG5cdFx0fVxuXHR9LFxuXG5cdHRyYW5zcGlsZUJsb2NrID0gKHJldHVybmVkLCBsaW5lcywgbGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkgPT4ge1xuXHRcdC8vIFRPRE86RVM2IE9wdGlvbmFsIGFyZ3VtZW50c1xuXHRcdGlmIChsZWFkID09PSB1bmRlZmluZWQpIGxlYWQgPSBudWxsXG5cdFx0aWYgKG9wRGVjbGFyZVJlcyA9PT0gdW5kZWZpbmVkKSBvcERlY2xhcmVSZXMgPSBudWxsXG5cdFx0aWYgKG9wT3V0ID09PSB1bmRlZmluZWQpIG9wT3V0ID0gbnVsbFxuXHRcdGNvbnN0IGZpbiA9IGlmRWxzZShvcERlY2xhcmVSZXMsXG5cdFx0XHRyZCA9PiB7XG5cdFx0XHRcdGNvbnN0IHJldCA9IG1heWJlV3JhcEluQ2hlY2tDb250YWlucyhyZXR1cm5lZCwgcmQub3BUeXBlLCByZC5uYW1lKVxuXHRcdFx0XHRyZXR1cm4gaWZFbHNlKG9wT3V0LFxuXHRcdFx0XHRcdF8gPT4gY2F0KGRlY2xhcmUocmQsIHJldCksIF8sIFJldHVyblJlcyksXG5cdFx0XHRcdFx0KCkgPT4gbmV3IFJldHVyblN0YXRlbWVudChyZXQpKVxuXHRcdFx0fSxcblx0XHRcdCgpID0+IGNhdChvcE91dCwgbmV3IFJldHVyblN0YXRlbWVudChyZXR1cm5lZCkpKVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIGxpbmVzLCBmaW4pKVxuXHR9LFxuXG5cdHRyYW5zcGlsZUV4Y2VwdCA9IGV4Y2VwdCA9PlxuXHRcdG5ldyBUcnlTdGF0ZW1lbnQoXG5cdFx0XHR0MChleGNlcHQuX3RyeSksXG5cdFx0XHRvcE1hcChleGNlcHQuX2NhdGNoLCB0MCksXG5cdFx0XHRvcE1hcChleGNlcHQuX2ZpbmFsbHksIHQwKSksXG5cblx0dHJhbnNwaWxlU3dpdGNoID0gXyA9PiB7XG5cdFx0Y29uc3QgcGFydHMgPSBmbGF0TWFwKF8ucGFydHMsIHQwKVxuXHRcdHBhcnRzLnB1c2goaWZFbHNlKF8ub3BFbHNlLFxuXHRcdFx0XyA9PiBuZXcgU3dpdGNoQ2FzZSh1bmRlZmluZWQsIHQwKF8pLmJvZHkpLFxuXHRcdFx0KCkgPT4gU3dpdGNoQ2FzZU5vTWF0Y2gpKVxuXHRcdHJldHVybiBuZXcgU3dpdGNoU3RhdGVtZW50KHQwKF8uc3dpdGNoZWQpLCBwYXJ0cylcblx0fVxuXG5jb25zdCBJZEJvb3QgPSBuZXcgSWRlbnRpZmllcignX2Jvb3QnKVxuXG4vLyBNb2R1bGUgaGVscGVyc1xuY29uc3Rcblx0YW1kV3JhcE1vZHVsZSA9IChkb1VzZXMsIG90aGVyVXNlcywgYm9keSkgPT4ge1xuXHRcdGNvbnN0IHVzZUJvb3QgPSBjb250ZXh0Lm9wdHMudXNlQm9vdCgpXG5cblx0XHRjb25zdCBhbGxVc2VzID0gZG9Vc2VzLmNvbmNhdChvdGhlclVzZXMpXG5cdFx0Y29uc3QgYWxsVXNlUGF0aHMgPSBhbGxVc2VzLm1hcChfID0+IG1hbmdsZVBhdGgoXy5wYXRoKSlcblxuXHRcdGNvbnN0IGFyclVzZVBhdGhzID0gbmV3IEFycmF5RXhwcmVzc2lvbihjYXQoXG5cdFx0XHRvcElmKHVzZUJvb3QsICgpID0+IG5ldyBMaXRlcmFsKGNvbnRleHQub3B0cy5ib290UGF0aCgpKSksXG5cdFx0XHRMaXRTdHJFeHBvcnRzLFxuXHRcdFx0YWxsVXNlUGF0aHMubWFwKF8gPT4gbmV3IExpdGVyYWwoXykpKSlcblxuXHRcdGNvbnN0IHVzZVRvSWRlbnRpZmllciA9IG5ldyBNYXAoKVxuXHRcdGNvbnN0IHVzZUlkZW50aWZpZXJzID0gW11cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFsbFVzZXMubGVuZ3RoOyBpID0gaSArIDEpIHtcblx0XHRcdGNvbnN0IF8gPSBhbGxVc2VzW2ldXG5cdFx0XHRjb25zdCBpZCA9IGlkQ2FjaGVkKGAke3BhdGhCYXNlTmFtZShfLnBhdGgpfV8ke2l9YClcblx0XHRcdHVzZUlkZW50aWZpZXJzLnB1c2goaWQpXG5cdFx0XHR1c2VUb0lkZW50aWZpZXIuc2V0KF8sIGlkKVxuXHRcdH1cblxuXHRcdGNvbnN0IHVzZUFyZ3MgPSBjYXQob3BJZih1c2VCb290LCAoKSA9PiBJZEJvb3QpLCBJZEV4cG9ydHMsIHVzZUlkZW50aWZpZXJzKVxuXG5cdFx0Y29uc3QgZG9Cb290ID0gb3BJZih1c2VCb290LCAoKSA9PiBuZXcgRXhwcmVzc2lvblN0YXRlbWVudChtc0dldE1vZHVsZShJZEJvb3QpKSlcblxuXHRcdGNvbnN0IHVzZURvcyA9IGRvVXNlcy5tYXAodXNlID0+XG5cdFx0XHRsb2MobmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQobXNHZXRNb2R1bGUodXNlVG9JZGVudGlmaWVyLmdldCh1c2UpKSksIHVzZS5sb2MpKVxuXG5cdFx0Ly8gRXh0cmFjdHMgdXNlZCB2YWx1ZXMgZnJvbSB0aGUgbW9kdWxlcy5cblx0XHRjb25zdCBvcERlY2xhcmVVc2VkTG9jYWxzID0gb3BJZighaXNFbXB0eShvdGhlclVzZXMpLFxuXHRcdFx0KCkgPT4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0Jyxcblx0XHRcdFx0ZmxhdE1hcChvdGhlclVzZXMsIHVzZSA9PiB1c2VEZWNsYXJhdG9ycyh1c2UsIHVzZVRvSWRlbnRpZmllci5nZXQodXNlKSkpKSlcblxuXHRcdGNvbnN0IGZ1bGxCb2R5ID0gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChcblx0XHRcdGRvQm9vdCwgdXNlRG9zLCBvcERlY2xhcmVVc2VkTG9jYWxzLCBib2R5LCBSZXR1cm5FeHBvcnRzKSlcblxuXHRcdGNvbnN0IGxhenlCb2R5ID1cblx0XHRcdGNvbnRleHQub3B0cy5sYXp5TW9kdWxlKCkgP1xuXHRcdFx0XHRuZXcgQmxvY2tTdGF0ZW1lbnQoW25ldyBFeHByZXNzaW9uU3RhdGVtZW50KFxuXHRcdFx0XHRcdG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIEV4cG9ydHNHZXQsXG5cdFx0XHRcdFx0XHRtc0xhenkoZnVuY3Rpb25FeHByZXNzaW9uVGh1bmsoZnVsbEJvZHkpKSkpXSkgOlxuXHRcdFx0XHRmdWxsQm9keVxuXG5cdFx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbihJZERlZmluZSxcblx0XHRcdFthcnJVc2VQYXRocywgbmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKHVzZUFyZ3MsIGxhenlCb2R5KV0pXG5cdH0sXG5cblx0cGF0aEJhc2VOYW1lID0gcGF0aCA9PlxuXHRcdHBhdGguc3Vic3RyKHBhdGgubGFzdEluZGV4T2YoJy8nKSArIDEpLFxuXG5cdHVzZURlY2xhcmF0b3JzID0gKHVzZSwgbW9kdWxlSWRlbnRpZmllcikgPT4ge1xuXHRcdC8vIFRPRE86IENvdWxkIGJlIG5lYXRlciBhYm91dCB0aGlzXG5cdFx0Y29uc3QgaXNMYXp5ID0gKGlzRW1wdHkodXNlLnVzZWQpID8gdXNlLm9wVXNlRGVmYXVsdCA6IHVzZS51c2VkWzBdKS5pc0xhenkoKVxuXHRcdGNvbnN0IHZhbHVlID0gKGlzTGF6eSA/IG1zTGF6eUdldE1vZHVsZSA6IG1zR2V0TW9kdWxlKShtb2R1bGVJZGVudGlmaWVyKVxuXG5cdFx0Y29uc3QgdXNlZERlZmF1bHQgPSBvcE1hcCh1c2Uub3BVc2VEZWZhdWx0LCBkZWYgPT4ge1xuXHRcdFx0Y29uc3QgZGVmZXhwID0gbXNHZXREZWZhdWx0RXhwb3J0KG1vZHVsZUlkZW50aWZpZXIpXG5cdFx0XHRjb25zdCB2YWwgPSBpc0xhenkgPyBsYXp5V3JhcChkZWZleHApIDogZGVmZXhwXG5cdFx0XHRyZXR1cm4gbG9jKG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoaWRGb3JEZWNsYXJlQ2FjaGVkKGRlZiksIHZhbCksIGRlZi5sb2MpXG5cdFx0fSlcblxuXHRcdGNvbnN0IHVzZWREZXN0cnVjdCA9IGlzRW1wdHkodXNlLnVzZWQpID8gbnVsbCA6XG5cdFx0XHRtYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycyh1c2UudXNlZCwgaXNMYXp5LCB2YWx1ZSwgdHJ1ZSwgZmFsc2UpXG5cblx0XHRyZXR1cm4gY2F0KHVzZWREZWZhdWx0LCB1c2VkRGVzdHJ1Y3QpXG5cdH1cblxuLy8gR2VuZXJhbCB1dGlscy4gTm90IGluIHV0aWwuanMgYmVjYXVzZSB0aGVzZSBjbG9zZSBvdmVyIGNvbnRleHQuXG5jb25zdFxuXHRtYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycyA9IChhc3NpZ25lZXMsIGlzTGF6eSwgdmFsdWUsIGlzTW9kdWxlKSA9PiB7XG5cdFx0Y29uc3QgZGVzdHJ1Y3R1cmVkTmFtZSA9IGBfJCR7bmV4dERlc3RydWN0dXJlZElkfWBcblx0XHRuZXh0RGVzdHJ1Y3R1cmVkSWQgPSBuZXh0RGVzdHJ1Y3R1cmVkSWQgKyAxXG5cdFx0Y29uc3QgaWREZXN0cnVjdHVyZWQgPSBuZXcgSWRlbnRpZmllcihkZXN0cnVjdHVyZWROYW1lKVxuXHRcdGNvbnN0IGRlY2xhcmF0b3JzID0gYXNzaWduZWVzLm1hcChhc3NpZ25lZSA9PiB7XG5cdFx0XHQvLyBUT0RPOiBEb24ndCBjb21waWxlIGl0IGlmIGl0J3MgbmV2ZXIgYWNjZXNzZWRcblx0XHRcdGNvbnN0IGdldCA9IGdldE1lbWJlcihpZERlc3RydWN0dXJlZCwgYXNzaWduZWUubmFtZSwgaXNMYXp5LCBpc01vZHVsZSlcblx0XHRcdHJldHVybiBtYWtlRGVjbGFyYXRvcihhc3NpZ25lZSwgZ2V0LCBpc0xhenkpXG5cdFx0fSlcblx0XHQvLyBHZXR0aW5nIGxhenkgbW9kdWxlIGlzIGRvbmUgYnkgbXMubGF6eUdldE1vZHVsZS5cblx0XHRjb25zdCB2YWwgPSBpc0xhenkgJiYgIWlzTW9kdWxlID8gbGF6eVdyYXAodmFsdWUpIDogdmFsdWVcblx0XHRyZXR1cm4gY2F0KG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoaWREZXN0cnVjdHVyZWQsIHZhbCksIGRlY2xhcmF0b3JzKVxuXHR9LFxuXG5cdG1ha2VEZWNsYXJhdG9yID0gKGFzc2lnbmVlLCB2YWx1ZSwgdmFsdWVJc0FscmVhZHlMYXp5KSA9PiB7XG5cdFx0Y29uc3Qge25hbWUsIG9wVHlwZX0gPSBhc3NpZ25lZVxuXHRcdGNvbnN0IGlzTGF6eSA9IGFzc2lnbmVlLmlzTGF6eSgpXG5cdFx0Ly8gVE9ETzogYXNzZXJ0KGFzc2lnbmVlLm9wVHlwZSA9PT0gbnVsbClcblx0XHQvLyBvciBUT0RPOiBBbGxvdyB0eXBlIGNoZWNrIG9uIGxhenkgdmFsdWU/XG5cdFx0dmFsdWUgPSBpc0xhenkgPyB2YWx1ZSA6IG1heWJlV3JhcEluQ2hlY2tDb250YWlucyh2YWx1ZSwgb3BUeXBlLCBuYW1lKVxuXHRcdGNvbnN0IHZhbCA9IGlzTGF6eSAmJiAhdmFsdWVJc0FscmVhZHlMYXp5ID8gbGF6eVdyYXAodmFsdWUpIDogdmFsdWVcblx0XHRhc3NlcnQoaXNMYXp5IHx8ICF2YWx1ZUlzQWxyZWFkeUxhenkpXG5cdFx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoaWRGb3JEZWNsYXJlQ2FjaGVkKGFzc2lnbmVlKSwgdmFsKVxuXHR9LFxuXG5cdG1heWJlV3JhcEluQ2hlY2tDb250YWlucyA9IChhc3QsIG9wVHlwZSwgbmFtZSkgPT5cblx0XHRjb250ZXh0Lm9wdHMuaW5jbHVkZUNoZWNrcygpICYmIG9wVHlwZSAhPT0gbnVsbCA/XG5cdFx0XHRtc0NoZWNrQ29udGFpbnModDAob3BUeXBlKSwgYXN0LCBuZXcgTGl0ZXJhbChuYW1lKSkgOlxuXHRcdFx0YXN0LFxuXG5cdGdldE1lbWJlciA9IChhc3RPYmplY3QsIGdvdE5hbWUsIGlzTGF6eSwgaXNNb2R1bGUpID0+XG5cdFx0aXNMYXp5ID9cblx0XHRtc0xhenlHZXQoYXN0T2JqZWN0LCBuZXcgTGl0ZXJhbChnb3ROYW1lKSkgOlxuXHRcdGlzTW9kdWxlICYmIGNvbnRleHQub3B0cy5pbmNsdWRlQ2hlY2tzKCkgP1xuXHRcdG1zR2V0KGFzdE9iamVjdCwgbmV3IExpdGVyYWwoZ290TmFtZSkpIDpcblx0XHRtZW1iZXIoYXN0T2JqZWN0LCBnb3ROYW1lKVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

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
				// Ignore produces 0 statements and Region produces many.
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
			return transpileBlock(_astConstants.IdBuilt, (0, _util.cat)(_astConstants.DeclareBuiltObj, tLines(this.lines)), lead, opDeclareRes, opOut);
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
			return memberStringOrVal(t0(this.object), this.name);
		},

		MemberSet() {
			const val = maybeWrapInCheckContains(t0(this.value), this.opType, this.name);
			switch (this.kind) {
				case _MsAst.SET_Init:
					return (0, _msCall.msNewProperty)(t0(this.object), new _esastDistAst.Literal(this.name), val);
				case _MsAst.SET_InitMutable:
					return (0, _msCall.msNewMutableProperty)(t0(this.object), new _esastDistAst.Literal(this.name), val);
				case _MsAst.SET_Mutate:
					return new _esastDistAst.AssignmentExpression('=', (0, _esastDistUtil.member)(t0(this.object), this.name), val);
				default:
					throw new Error();
			}
		},

		Module() {
			const body = tLines(this.lines);

			verifyResults.builtinPathToNames.forEach((imported, path) => {
				if (path !== 'global') {
					const importedDeclares = [];
					let opImportDefault = null;
					let defaultName = (0, _util.last)(path.split('/'));
					for (const name of imported) {
						const declare = _MsAst.LocalDeclare.plain(this.loc, name);
						if (name === defaultName) opImportDefault = declare;else importedDeclares.push(declare);
					}
					this.imports.push(new _MsAst.Import(this.loc, path, importedDeclares, opImportDefault));
				}
			});

			const amd = amdWrapModule(this.doImports, this.imports, body);

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

		SetSub() {
			const kind = () => {
				switch (this.kind) {
					case _MsAst.SET_Init:
						return 'init';
					case _MsAst.SET_InitMutable:
						return 'init-mutable';
					case _MsAst.SET_Mutate:
						return 'mutate';
					default:
						throw new Error();
				}
			}();
			return (0, _msCall.msSetSub)(t0(this.object), this.subbeds.length === 1 ? t0(this.subbeds[0]) : this.subbeds.map(t0), maybeWrapInCheckContains(t0(this.value), this.opType, 'value'), new _esastDistAst.Literal(kind));
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
				case _MsAst.SV_SetSub:
					return (0, _esastDistUtil.member)(_msCall.IdMs, 'setSub');
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
			return memberStringOrVal(_astConstants.IdSuper, this.name);
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
	      memberStringOrVal = (object, memberName) => typeof memberName === 'string' ? (0, _esastDistUtil.member)(object, memberName) : new _esastDistAst.MemberExpression(object, t0(memberName)),
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
	const amdWrapModule = (doImports, imports, body) => {
		const shouldImportBoot = context.opts.importBoot();

		const allImports = doImports.concat(imports);
		const allImportPaths = allImports.map(_ => (0, _manglePath2.default)(_.path));

		const arrImportPaths = new _esastDistAst.ArrayExpression((0, _util.cat)((0, _util.opIf)(shouldImportBoot, () => new _esastDistAst.Literal(context.opts.bootPath())), _astConstants.LitStrExports, allImportPaths.map(_ => new _esastDistAst.Literal(_))));

		const importToIdentifier = new Map();
		const importIdentifiers = [];
		for (let i = 0; i < allImports.length; i = i + 1) {
			const _ = allImports[i];
			const id = (0, _esastDistUtil.idCached)(`${ pathBaseName(_.path) }_${ i }`);
			importIdentifiers.push(id);
			importToIdentifier.set(_, id);
		}

		const importArgs = (0, _util.cat)((0, _util.opIf)(shouldImportBoot, () => IdBoot), _astConstants.IdExports, importIdentifiers);

		const doBoot = (0, _util.opIf)(shouldImportBoot, () => new _esastDistAst.ExpressionStatement((0, _msCall.msGetModule)(IdBoot)));

		const importDos = doImports.map(_ => (0, _esastDistUtil.loc)(new _esastDistAst.ExpressionStatement((0, _msCall.msGetModule)(importToIdentifier.get(_))), _.loc));

		// Extracts imported values from the modules.
		const opDeclareImportedLocals = (0, _util.opIf)(!(0, _util.isEmpty)(imports), () => new _esastDistAst.VariableDeclaration('const', (0, _util.flatMap)(imports, _ => importDeclarators(_, importToIdentifier.get(_)))));

		const fullBody = new _esastDistAst.BlockStatement((0, _util.cat)(doBoot, importDos, opDeclareImportedLocals, body, _astConstants.ReturnExports));

		const lazyBody = context.opts.lazyModule() ? new _esastDistAst.BlockStatement([new _esastDistAst.ExpressionStatement(new _esastDistAst.AssignmentExpression('=', _astConstants.ExportsGet, (0, _msCall.msLazy)((0, _esastDistUtil.functionExpressionThunk)(fullBody))))]) : fullBody;

		return new _esastDistAst.CallExpression(_astConstants.IdDefine, [arrImportPaths, new _esastDistAst.ArrowFunctionExpression(importArgs, lazyBody)]);
	},
	      pathBaseName = path => path.substr(path.lastIndexOf('/') + 1),
	      importDeclarators = (_ref2, moduleIdentifier) => {
		let imported = _ref2.imported;
		let opImportDefault = _ref2.opImportDefault;

		// TODO: Could be neater about this
		const isLazy = ((0, _util.isEmpty)(imported) ? opImportDefault : imported[0]).isLazy();
		const value = (isLazy ? _msCall.msLazyGetModule : _msCall.msGetModule)(moduleIdentifier);

		const importedDefault = (0, _util.opMap)(opImportDefault, def => {
			const defexp = (0, _msCall.msGetDefaultExport)(moduleIdentifier);
			const val = isLazy ? (0, _msCall.lazyWrap)(defexp) : defexp;
			return (0, _esastDistUtil.loc)(new _esastDistAst.VariableDeclarator((0, _util2.idForDeclareCached)(def), val), def.loc);
		});

		const importedDestruct = (0, _util.isEmpty)(imported) ? null : makeDestructureDeclarators(imported, isLazy, value, true, false);

		return (0, _util.cat)(importedDefault, importedDestruct);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zcGlsZS5qcyIsInByaXZhdGUvdHJhbnNwaWxlL3RyYW5zcGlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztBQzhCQSxLQUFJLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLGVBQWUsQ0FBQTtBQUMxRCxLQUFJLGtCQUFrQixDQUFBOzttQkFFUCxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLEtBQUs7QUFDOUQsU0FBTyxHQUFHLFFBQVEsQ0FBQTtBQUNsQixlQUFhLEdBQUcsY0FBYyxDQUFBO0FBQzlCLGVBQWEsR0FBRyxLQUFLLENBQUE7QUFDckIsaUJBQWUsR0FBRyxLQUFLLENBQUE7QUFDdkIsb0JBQWtCLEdBQUcsQ0FBQyxDQUFBO0FBQ3RCLFFBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBOztBQUVoQyxTQUFPLEdBQUcsYUFBYSxHQUFHLFNBQVMsQ0FBQTtBQUNuQyxTQUFPLEdBQUcsQ0FBQTtFQUNWOztBQUVNLE9BQ04sRUFBRSxHQUFHLElBQUksSUFBSSxtQkF0QzZCLEdBQUcsRUFzQzVCLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7O0FBQzdDLE9BQ0MsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsS0FBSyxtQkF4Q3NCLEdBQUcsRUF3Q3JCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQztPQUN0RCxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEtBQUssbUJBekNVLEdBQUcsRUF5Q1QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7T0FDOUUsTUFBTSxHQUFHLEtBQUssSUFBSTtBQUNqQixRQUFNLEdBQUcsR0FBRyxFQUFFLENBQUE7QUFDZCxPQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtBQUN6QixTQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7QUFDNUIsT0FBSSxHQUFHLFlBQVksS0FBSzs7QUFFdkIsU0FBSyxNQUFNLENBQUMsSUFBSSxHQUFHLEVBQ2xCLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBakRxRSxXQUFXLEVBaURwRSxDQUFDLENBQUMsQ0FBQyxDQUFBLEtBRXpCLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBbkQ4QixHQUFHLEVBbUQ3QixtQkFuRGtFLFdBQVcsRUFtRGpFLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0dBQzFDO0FBQ0QsU0FBTyxHQUFHLENBQUE7RUFDVixDQUFBOztBQUVGLFdBaEQwRCxhQUFhLFVBZ0Q3QyxXQUFXLEVBQUU7QUFDdEMsUUFBTSxHQUFHO0FBQ1IsU0FBTSxRQUFRLEdBQUcsTUFBTTtBQUN0QixVQUFNLElBQUksR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQy9CLFdBQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsa0JBN0Q5QixlQUFlLENBNkRtQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDMUQsQ0FBQTs7QUFFRCxVQUFPLFVBdkRnQyxNQUFNLEVBdUQvQixJQUFJLENBQUMsUUFBUSxFQUMxQixDQUFDLElBQUksa0JBckV5QixXQUFXLENBcUVwQixRQUFRLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDNUMsTUFBTTtBQUNMLFFBQUksSUFBSSxDQUFDLFNBQVMsbUJBOURBLElBQUksQUE4RFksRUFBRTtBQUNuQyxXQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFBO0FBQzNCLFdBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUE7QUFDMUIsV0FBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDOUIsU0FBSSxNQUFNLG1CQWxFNEQsTUFBTSxBQWtFaEQsRUFBRTtBQUM3QixZQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxXQXZENUIsaUJBQWlCLFdBRGtDLGNBQWMsQUF3REEsQ0FBQTtBQUM1RCxhQUFPLEdBQUcsbUJBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxrQkE3RVUsT0FBTyxDQTZFTCxNQUFNLENBQUMsSUFBSSxDQUFDLDRCQUFLLElBQUksR0FBQyxDQUFBO01BQ2hFLE1BQU07QUFDTixZQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxXQTNEdUMsV0FBVyxXQUFyQyxRQUFRLEFBMkRJLENBQUE7QUFDaEQsYUFBTyxHQUFHLG1CQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsNEJBQUssSUFBSSxHQUFDLENBQUE7TUFDL0I7S0FDRCxNQUNBLE9BQU8sa0JBbkZxQixXQUFXLENBbUZoQixRQUFRLEVBQUUsZ0JBaEVyQyxlQUFlLENBZ0V3QyxDQUFBO0lBQ3BELENBQUMsQ0FBQTtHQUNIOztBQUVELGNBQVksQ0FBQyxPQUFPLEVBQUU7QUFDckIsU0FBTSxHQUFHLEdBQUcsT0FBTyxLQUFLLFNBQVMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFDNUUsU0FBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFBO0FBQ3pELFVBQU8sa0JBdkZ1RCxtQkFBbUIsQ0F1RmxELElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLEdBQUcsS0FBSyxHQUFHLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7R0FDdEY7O0FBRUQsbUJBQWlCLEdBQUc7QUFDbkIsVUFBTyxrQkEzRnVELG1CQUFtQixDQTRGaEYsSUFBSSxDQUFDLElBQUksRUFBRSxZQXRGaUQsVUFBVSxBQXNGNUMsR0FBRyxLQUFLLEdBQUcsT0FBTyxFQUM1QywwQkFBMEIsQ0FDekIsSUFBSSxDQUFDLFNBQVMsRUFDZCxJQUFJLENBQUMsSUFBSSxFQUFFLFlBekZ1QyxPQUFPLEFBeUZsQyxFQUN2QixFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUNkLEtBQUssQ0FBQyxDQUFDLENBQUE7R0FDVDs7QUFFRCxVQUFRLEdBQUc7QUFBRSxVQUFPLFlBbkZHLEtBQUssZ0JBSmlDLE9BQU8sRUF1RmpDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtHQUFFOztBQUVwRCxjQUFZLEdBQUc7QUFBRSxVQUFPLFlBckZNLFNBQVMsZ0JBSnNCLE9BQU8sRUF5RnpCLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtHQUFFOztBQUU1RCxXQUFTLEdBQUc7QUFBRSxVQUFPLGtCQTlHZCxlQUFlLENBOEdtQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0dBQUU7O0FBRTlELFNBQU8sQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRTs7QUFFbEMsT0FBSSxJQUFJLEtBQUssU0FBUyxFQUFFLElBQUksR0FBRyxJQUFJLENBQUE7QUFDbkMsT0FBSSxZQUFZLEtBQUssU0FBUyxFQUFFLFlBQVksR0FBRyxJQUFJLENBQUE7QUFDbkQsT0FBSSxLQUFLLEtBQUssU0FBUyxFQUFFLEtBQUssR0FBRyxJQUFJLENBQUE7QUFDckMsYUFyR00sTUFBTSxFQXFHTCxZQUFZLEtBQUssSUFBSSxDQUFDLENBQUE7QUFDN0IsVUFBTyxrQkFySFIsY0FBYyxDQXFIYSxVQXRHWixHQUFHLEVBc0dhLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUE7R0FDL0Q7O0FBRUQsZUFBYSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFOztBQUV4QyxPQUFJLElBQUksS0FBSyxTQUFTLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNuQyxPQUFJLFlBQVksS0FBSyxTQUFTLEVBQUUsWUFBWSxHQUFHLElBQUksQ0FBQTtBQUNuRCxPQUFJLEtBQUssS0FBSyxTQUFTLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQTtBQUNyQyxVQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxFQUMvRCx5Q0FBeUMsQ0FBQyxDQUFBO0FBQzNDLFVBQU8sa0JBL0hSLGNBQWMsQ0ErSGEsVUFoSFosR0FBRyxFQWdIYSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUN4RTs7QUFFRCxpQkFBZSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFO0FBQzFDLFVBQU8sY0FBYyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFBO0dBQ3ZGOztBQUVELFVBQVEsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRTtBQUNuQyxVQUFPLGNBQWMsZUFySHVDLE9BQU8sRUF1SGxFLFVBMUhhLEdBQUcsZ0JBRXFCLGVBQWUsRUF3SC9CLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFDeEMsSUFBSSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQTtHQUMzQjs7QUFFRCxVQUFRLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUU7QUFDbkMsVUFBTyxjQUFjLGVBNUh1QyxPQUFPLEVBOEhsRSxVQWpJYSxHQUFHLGdCQUV1RCxlQUFlLEVBK0hqRSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQ3hDLElBQUksRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUE7R0FDM0I7O0FBRUQsVUFBUSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFO0FBQ25DLFVBQU8sY0FBYyxlQW5JdUMsT0FBTyxFQXFJbEUsVUF4SWEsR0FBRyxnQkFFc0MsZUFBZSxFQXNJaEQsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUN4QyxJQUFJLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFBO0dBQzNCOztBQUVELFdBQVMsR0FBRztBQUFFLFVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtHQUFFOztBQUVoRCxPQUFLLEdBQUc7QUFBRSxVQUFPLGtCQTdKRCxjQUFjLEVBNkpPLENBQUE7R0FBRTs7QUFFdkMsY0FBWSxHQUFHO0FBQUUsVUFBTyxrQkE1SjhDLGVBQWUsQ0E0SnpDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtHQUFFOztBQUU3RCxNQUFJLEdBQUc7QUFDTixVQUFPLGtCQWxLd0IsY0FBYyxDQWtLbkIsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0dBQzdEOztBQUVELFFBQU0sR0FBRztBQUNSLFNBQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUM5QyxVQUFPLFVBeEpnQyxNQUFNLEVBd0ovQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxrQkF2S2xDLGNBQWMsQ0F1S3VDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsTUFBTSxJQUFJLENBQUMsQ0FBQTtHQUMvRTtBQUNELFNBQU8sR0FBRztBQUNULFNBQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUM5QyxTQUFNLEtBQUssR0FBRyxVQTVKeUIsTUFBTSxFQTRKeEIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7QUFDcEUsVUFBTyxTQUFTLENBQUMsa0JBNUtsQixjQUFjLENBNEt1QixLQUFLLENBQUMsQ0FBQyxDQUFBO0dBQzNDO0FBQ0QsWUFBVSxFQUFFLFFBQVE7QUFDcEIsYUFBVyxFQUFFLFFBQVE7O0FBRXJCLE9BQUssR0FBRztBQUNQLFNBQU0sT0FBTyxHQUFHLFVBbktGLEdBQUcsRUFvS2hCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQ2xDLFVBcEtGLEtBQUssRUFvS0csSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsRUFDN0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3JDLFNBQU0sTUFBTSxHQUFHLFVBdEtoQixLQUFLLEVBc0tpQixhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkEvS2hCLFFBQVEsQ0ErS21CLENBQUE7QUFDMUQsU0FBTSxTQUFTLEdBQUcsa0JBdkxxRCxlQUFlLENBd0xyRixNQUFNLEVBQ04sVUF6S0YsS0FBSyxFQXlLRyxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxFQUFFLGtCQXpMNkIsU0FBUyxDQXlMeEIsT0FBTyxDQUFDLENBQUMsQ0FBQTs7QUFFdEQsVUFBTyxVQTVLZ0MsTUFBTSxFQTRLL0IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsRUFBRSxNQUFNLFNBQVMsQ0FBQyxDQUFBO0dBQ2hFOztBQUVELFNBQU8sQ0FBQyxTQUFTLEVBQUU7QUFDbEIsU0FBTSxJQUFJLEdBQUcsa0JBMUxpRCxtQkFBbUIsQ0EwTDVDLE9BQU8sRUFBRSxDQUM3QyxrQkExTGUsa0JBQWtCLENBMExWLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzNELFNBQU0sR0FBRyxHQUFHLGtCQTlMeUQsZUFBZSxDQThMcEQsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFBO0FBQ3RELFNBQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDN0MsVUFBTyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUE7R0FDdkI7O0FBRUQsTUFBSSxHQUFHO0FBQ04sVUFBTyxrQkF0TVIscUJBQXFCLENBc01hLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7R0FDbEY7O0FBRUQsZUFBYSxHQUFHO0FBQ2YsU0FBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUMxQixVQUFPLGtCQTFNd0IsV0FBVyxDQTJNekMsSUFBSSxDQUFDLFFBQVEsR0FBRyxrQkF2TWxCLGVBQWUsQ0F1TXVCLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxJQUFJLEVBQ3JELEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtHQUNqQjs7QUFFRCxnQkFBYyxHQUFHO0FBQ2hCLFNBQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDMUIsU0FBTSxNQUFNLEdBQUcsWUExTGhCLE1BQU0sRUEwTGlCLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqRCxVQUFPLElBQUksQ0FBQyxRQUFRLEdBQ25CLGtCQXBORixxQkFBcUIsQ0FvTk8sSUFBSSxVQTVMZCxNQUFNLEVBNExrQixNQUFNLENBQUMsR0FDL0Msa0JBck5GLHFCQUFxQixDQXFOTyxJQUFJLEVBQUUsTUFBTSxVQTdMdEIsTUFBTSxDQTZMeUIsQ0FBQTtHQUNoRDs7QUFFRCxhQUFXLEdBQUc7QUFDYixrQkFBZSxHQUFHLElBQUksQ0FBQTs7OztBQUl0QixTQUFNLElBQUksR0FBRyxhQUFhLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUN0RCxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUNaLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7O0FBRTFDLFNBQU0sR0FBRyxHQUFHLGtCQS9OYixnQkFBZ0IsZUFlc0QsYUFBYSxFQWdObEMsSUFBSSxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUE7QUFDbEYsa0JBQWUsR0FBRyxLQUFLLENBQUE7QUFDdkIsVUFBTyxHQUFHLENBQUE7R0FDVjs7QUFFRCxPQUFLLEdBQUc7QUFDUCxVQUFPLGtCQXhPd0MsV0FBVyxDQXdPbkMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7R0FDdkQ7O0FBRUQsVUFBUSxHQUFHO0FBQUUsVUFBTyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUE7R0FBRTtBQUMzQyxXQUFTLEdBQUc7QUFBRSxVQUFPLFNBQVMsQ0FBQyxrQkE1Ty9CLGNBQWMsQ0E0T29DLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUU7O0FBRTdFLE9BQUssR0FBRztBQUFFLFVBQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0dBQUU7O0FBRXZELFFBQU0sR0FBRztBQUNSLFVBQU8sU0FBUyxDQUFDLGtCQWpQbEIsY0FBYyxDQWlQdUIsZUFoT0UsZUFBZSxFQWtPcEQsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkEvTkQsV0FBVyxDQWlPOUMsQ0FBQyxDQUFDLENBQUE7R0FDSDs7QUFFRCxRQUFNLEdBQUc7QUFDUixVQUFPLFNBQVMsQ0FBQyxrQkF6UGxCLGNBQWMsQ0F5UHVCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQzVFOztBQUVELEtBQUcsQ0FBQyxjQUFjLEVBQUU7O0FBRW5CLE9BQUksY0FBYyxLQUFLLFNBQVMsRUFDL0IsY0FBYyxHQUFHLElBQUksQ0FBQTs7QUFFdEIsU0FBTSxjQUFjLEdBQUcsYUFBYSxDQUFBO0FBQ3BDLGdCQUFhLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQTs7O0FBR2hDLFNBQU0sS0FBSyxHQUFHLGtCQW5ROEIsT0FBTyxDQW1RekIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUMzQyxTQUFNLGFBQWEsR0FBRyxVQXRQdkIsS0FBSyxFQXNQd0IsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLElBQy9DLFdBN095QixPQUFPLEVBNk94QixJQUFJLEVBQUUsa0JBdlFnQixjQUFjLGVBaUJ2QixjQUFjLEVBc1BjLGVBclBILFdBQVcsRUFxUE0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDekUsU0FBTSxTQUFTLEdBQUcsVUF6UHVFLElBQUksRUF5UHRFLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsTUFDcEQsVUExUDJCLFNBQVMsRUEwUDFCLElBQUksQ0FBQyxJQUFJLFNBOU9yQiwwQkFBMEIsQ0E4T3dCLENBQUMsQ0FBQTs7QUFFbEQsU0FBTSxHQUFHLEdBQUcsVUEzUGIsS0FBSyxFQTJQYyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFBOztBQUVoQyxTQUFNLGFBQWEsR0FDbEIsVUEvUHdGLElBQUksRUErUHZGLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxFQUFFLG9CQTVQdkQsa0JBQWtCLEFBNFA2RCxDQUFDLENBQUE7O0FBRS9FLFNBQU0sSUFBSSxHQUFHLFVBalFDLEdBQUcsRUFpUUEsY0FBYyxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFBOztBQUU5RSxTQUFNLElBQUksR0FBRyxVQWxRZCxLQUFLLEVBa1FlLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDbEMsU0FBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDMUQsU0FBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDOUIsZ0JBQWEsR0FBRyxjQUFjLENBQUE7QUFDOUIsU0FBTSxFQUFFLEdBQUcsVUF0UVosS0FBSyxFQXNRYSxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkEvUVosUUFBUSxDQStRZSxDQUFBOztBQUV0RCxTQUFNLG1CQUFtQixHQUN4QixFQUFFLEtBQUssSUFBSSxJQUNYLElBQUksQ0FBQyxhQUFhLEtBQUssSUFBSSxJQUMzQixhQUFhLEtBQUssSUFBSSxJQUN0QixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUE7QUFDbEIsVUFBTyxtQkFBbUIsR0FDekIsa0JBL1JzQix1QkFBdUIsQ0ErUmpCLElBQUksRUFBRSxJQUFJLENBQUMsR0FDdkMsa0JBN1JGLGtCQUFrQixDQTZSTyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7R0FDekQ7O0FBRUQsUUFBTSxHQUFHO0FBQUUsVUFBTyxFQUFFLENBQUE7R0FBRTs7QUFFdEIsTUFBSSxHQUFHO0FBQUUsVUFBTyxZQTlRSCxRQUFRLEVBOFFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtHQUFFOztBQUUxQyxZQUFVLENBQUMsUUFBUSxFQUFFO0FBQ3BCLFNBQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDMUIsYUF6Uk0sTUFBTSxFQXlSTCxLQUFLLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxDQUFBOztBQUV4QixhQTNSTSxNQUFNLEVBMlJMLEtBQUssMEJBeFNiLGtCQUFrQixBQXdTeUIsQ0FBQyxDQUFBOzs0QkFFbkIsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7U0FBL0MsR0FBRyxzQkFBSCxHQUFHO1NBQUUsUUFBUSxzQkFBUixRQUFROztBQUNwQixVQUFPLGtCQTFTUixnQkFBZ0IsQ0EwU2EsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0dBQ3JFO0FBQ0QsY0FBWSxDQUFDLFFBQVEsRUFBRTtBQUN0QixTQUFNLEtBQUssR0FBRyxrQkE5U2Ysa0JBQWtCLENBOFNvQixJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxnQkE5UjdELGtCQUFrQixDQThSZ0UsQ0FBQyxDQUFBOzs2QkFDMUQsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7U0FBL0MsR0FBRyx1QkFBSCxHQUFHO1NBQUUsUUFBUSx1QkFBUixRQUFROztBQUNwQixVQUFPLGtCQS9TUixnQkFBZ0IsQ0ErU2EsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0dBQ2xFO0FBQ0QsY0FBWSxDQUFDLFFBQVEsRUFBRTtBQUN0QixTQUFNLEtBQUssR0FBRyxrQkFuVGYsa0JBQWtCLENBbVRvQixJQUFJLEVBQUUsZUFsU3RCLE9BQU8sQ0FrU3dCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLGdCQW5TcEUsa0JBQWtCLENBbVN1RSxDQUFDLENBQUE7OzZCQUNqRSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDOztTQUEvQyxHQUFHLHVCQUFILEdBQUc7U0FBRSxRQUFRLHVCQUFSLFFBQVE7O0FBQ3BCLFVBQU8sa0JBcFRSLGdCQUFnQixDQW9UYSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUE7R0FDbEU7O0FBRUQsZUFBYSxHQUFHOzs7QUFHZixTQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ2hDLFNBQU0sR0FBRyxHQUFHLGtCQTVUZ0MsT0FBTyxDQTRUM0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQ3hDLFVBQU8sVUFoVGdFLFVBQVUsRUFnVC9ELEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxrQkF6VGxDLGVBQWUsQ0F5VHVDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtHQUM5RDs7QUFFRCxhQUFXLEdBQUc7QUFDYixPQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUN2QixPQUFPLGVBQWUsR0FBRyxrQkEvVFYsY0FBYyxFQStUZ0IsaUJBalRoQixhQUFhLEFBaVRtQixDQUFBLEtBQ3pEO0FBQ0osVUFBTSxFQUFFLEdBQUcsYUFBYSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFBOztBQUVwRCxXQUFPLEVBQUUsS0FBSyxTQUFTLEdBQUcsbUJBalVJLFFBQVEsRUFpVUgsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLFdBOVMzQyxrQkFBa0IsRUE4UzRDLEVBQUUsQ0FBQyxDQUFBO0lBQ3RFO0dBQ0Q7O0FBRUQsY0FBWSxHQUFHO0FBQUUsVUFBTyxrQkExVUosVUFBVSxDQTBVUyxXQWxUbUIsa0JBQWtCLEVBa1RsQixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtHQUFFOztBQUV2RSxhQUFXLEdBQUc7QUFDYixVQUFPLGtCQWhWeUMsb0JBQW9CLENBZ1ZwQyxHQUFHLEVBQUUsbUJBeFVOLFFBQVEsRUF3VU8sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtHQUN6RTs7QUFFRCxPQUFLLEdBQUc7QUFDUCxhQXBVTSxNQUFNLEVBb1VMLElBQUksQ0FBQyxJQUFJLFlBeFV1QixLQUFLLEFBd1VsQixJQUFJLElBQUksQ0FBQyxJQUFJLFlBeFVPLElBQUksQUF3VUYsQ0FBQyxDQUFBO0FBQ2pELFNBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLFlBelVtQixLQUFLLEFBeVVkLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUM1QyxVQUFPLFVBclVELElBQUksRUFxVUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQ2xDLGtCQXBWb0QsaUJBQWlCLENBb1YvQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUN2RDs7QUFFRCxVQUFRLEdBQUc7QUFBRSxVQUFPLFlBbFVELE9BQU8sZ0JBTG1DLE9BQU8sRUF1VS9CLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0dBQUU7O0FBRWxFLFFBQU0sR0FBRztBQUNSLFVBQU8saUJBQWlCLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7R0FDcEQ7O0FBRUQsV0FBUyxHQUFHO0FBQ1gsU0FBTSxHQUFHLEdBQUcsd0JBQXdCLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUM1RSxXQUFRLElBQUksQ0FBQyxJQUFJO0FBQ2hCLGdCQXRWMkIsUUFBUTtBQXVWbEMsWUFBTyxZQTNVZ0QsYUFBYSxFQTJVL0MsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxrQkFqV0ksT0FBTyxDQWlXQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFBQSxBQUNuRSxnQkF4VnFDLGVBQWU7QUF5Vm5ELFlBQU8sWUE3VTBCLG9CQUFvQixFQTZVekIsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxrQkFuV0gsT0FBTyxDQW1XUSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFBQSxBQUMxRSxnQkExVnNELFVBQVU7QUEyVi9ELFlBQU8sa0JBeFd1QyxvQkFBb0IsQ0F3V2xDLEdBQUcsRUFBRSxtQkFoV08sTUFBTSxFQWdXTixFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUFBLEFBQzlFO0FBQVMsV0FBTSxJQUFJLEtBQUssRUFBRSxDQUFBO0FBQUEsSUFDMUI7R0FDRDs7QUFFRCxRQUFNLEdBQUc7QUFDUixTQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBOztBQUUvQixnQkFBYSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLEtBQUs7QUFDNUQsUUFBSSxJQUFJLEtBQUssUUFBUSxFQUFFO0FBQ3RCLFdBQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFBO0FBQzNCLFNBQUksZUFBZSxHQUFHLElBQUksQ0FBQTtBQUMxQixTQUFJLFdBQVcsR0FBRyxVQXBXK0QsSUFBSSxFQW9XOUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0FBQ3ZDLFVBQUssTUFBTSxJQUFJLElBQUksUUFBUSxFQUFFO0FBQzVCLFlBQU0sT0FBTyxHQUFHLE9BMVc4RCxZQUFZLENBMFc3RCxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUNsRCxVQUFJLElBQUksS0FBSyxXQUFXLEVBQ3ZCLGVBQWUsR0FBRyxPQUFPLENBQUEsS0FFekIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO01BQy9CO0FBQ0QsU0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0E5VzRELE1BQU0sQ0E4V3ZELElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUE7S0FDaEY7SUFDRCxDQUFDLENBQUE7O0FBRUYsU0FBTSxHQUFHLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQTs7QUFFN0QsVUFBTyxrQkE5WDJDLE9BQU8sQ0E4WHRDLFVBbFhMLEdBQUcsRUFtWGhCLFVBblh3RixJQUFJLEVBbVh2RixPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsb0JBN1dMLFNBQVMsQUE2V1csQ0FBQyxFQUN0RCxVQXBYd0YsSUFBSSxFQW9YdkYsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBRSxvQkFsWGhDLGNBQWMsQUFrWHNDLENBQUMsRUFDMUQsbUJBN1hnRixXQUFXLEVBNlgvRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FDbkI7O0FBRUQsbUJBQWlCLEdBQUc7QUFDbkIsVUFBTyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQ3pCLGtCQTFZK0Msb0JBQW9CLENBMFkxQyxHQUFHLEVBQUUsbUJBbFllLE1BQU0sZ0JBWXJELFNBQVMsRUFzWHlDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUE7R0FDbEY7O0FBRUQscUJBQW1CLEdBQUc7QUFDckIsVUFBTyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksa0JBOVlrQixvQkFBb0IsQ0E4WWIsR0FBRyxnQkEzWHZDLGNBQWMsRUEyWDJDLEdBQUcsQ0FBQyxDQUFDLENBQUE7R0FDakY7O0FBRUQsS0FBRyxHQUFHO0FBQ0wsU0FBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBclk5QixLQUFLLEFBcVkwQyxDQUFDLENBQUE7QUFDeEQsVUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLDRCQUE0QixDQUFDLENBQUE7QUFDaEUsVUFBTyxrQkFoWlUsYUFBYSxDQWdaTCxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7R0FDMUQ7O0FBRUQsS0FBRyxHQUFHO0FBQUUsVUFBTyxrQkFoWmYsZUFBZSxDQWdab0IsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtHQUFFOztBQUV2RCxnQkFBYyxHQUFHO0FBQ2hCLFVBQU8sSUFBSSxDQUFDLE1BQU0sbUJBOVlaLFlBQVksQUE4WXdCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FDM0UsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUNsQixrQkE1WjhDLG9CQUFvQixDQTRaekMsR0FBRyxFQUFFLG1CQXBaYyxNQUFNLGdCQVdRLE9BQU8sRUF5WW5CLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQ2hGLFVBN1lhLEdBQUcsRUE4WWYsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQy9CLFlBdllxRSxTQUFTLGdCQU5yQixPQUFPLEVBNlk3QyxrQkE3WnNCLE9BQU8sQ0E2WmpCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxXQXJZYyxrQkFBa0IsRUFxWWIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FDbkU7O0FBRUQsa0JBQWdCLEdBQUc7QUFDbEIsVUFBTyxrQkFwYXlDLG9CQUFvQixDQW9hcEMsR0FBRyxFQUNsQyxrQkFsYXVFLGdCQUFnQixlQWdCNUIsT0FBTyxFQWtacEMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUMzQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7R0FDaEI7O0FBRUQsV0FBUyxHQUFHO0FBQ1gsVUFBTyxrQkF0YXlCLGdCQUFnQixDQXNhcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUM5QyxrQkF2YTBELFFBQVEsQ0F1YXJELE1BQU0sRUFBRSxtQkFuYWdDLHlCQUF5QixFQW1hL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FDNUU7O0FBRUQsT0FBSyxHQUFHO0FBQ1AsT0FBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQzFCLHFCQTVaa0UsY0FBYyxDQTRaM0QsS0FDakI7QUFDSixVQUFNLE1BQU0sR0FBRyxFQUFFO1VBQUUsV0FBVyxHQUFHLEVBQUUsQ0FBQTs7O0FBR25DLFFBQUksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFDcEMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQWpidUQsZUFBZSxDQWlidEQsS0FBSyxDQUFDLENBQUE7O0FBRW5DLFNBQUssSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssRUFDMUIsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FyYnNELGVBQWUsQ0FxYnJELFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBLEtBQzNDOztBQUVKLFNBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxXQUFXLENBQUMsTUFBTSxFQUN2QyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBemJxRCxlQUFlLENBeWJwRCxLQUFLLENBQUMsQ0FBQTtBQUNuQyxnQkFBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtLQUMxQjs7O0FBR0YsUUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFdBQVcsQ0FBQyxNQUFNLEVBQ3ZDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0EvYnVELGVBQWUsQ0ErYnRELEtBQUssQ0FBQyxDQUFBOztBQUVuQyxXQUFPLGtCQWhjVCxlQUFlLENBZ2NjLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQTtJQUMvQztHQUNEOztBQUVELGVBQWEsR0FBRztBQUNmLFVBQU8sa0JBdGNvQyx3QkFBd0IsQ0FzYy9CLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0dBQ2pFOztBQUVELFFBQU0sR0FBRztBQUNSLFNBQU0sSUFBSSxHQUFHLEFBQUMsTUFBTTtBQUNuQixZQUFRLElBQUksQ0FBQyxJQUFJO0FBQ2hCLGlCQXBjMEIsUUFBUTtBQXFjakMsYUFBTyxNQUFNLENBQUE7QUFBQSxBQUNkLGlCQXRjb0MsZUFBZTtBQXVjbEQsYUFBTyxjQUFjLENBQUE7QUFBQSxBQUN0QixpQkF4Y3FELFVBQVU7QUF5YzlELGFBQU8sUUFBUSxDQUFBO0FBQUEsQUFDaEI7QUFDQyxZQUFNLElBQUksS0FBSyxFQUFFLENBQUE7QUFBQSxLQUNsQjtJQUNELEVBQUcsQ0FBQTtBQUNKLFVBQU8sWUFsYzRFLFFBQVEsRUFtYzFGLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQ3RFLHdCQUF3QixDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsRUFDOUQsa0JBNWQyQyxPQUFPLENBNGR0QyxJQUFJLENBQUMsQ0FBQyxDQUFBO0dBQ25COztBQUVELFdBQVMsR0FBRztBQUNYLFdBQVEsSUFBSSxDQUFDLElBQUk7QUFDaEIsZ0JBdmRjLFdBQVc7QUF1ZFAsWUFBTyxrQkFsZUosaUJBQWlCLEVBa2VVLENBQUE7QUFBQSxBQUNoRDtBQUFTLFdBQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQUEsSUFDbkM7R0FDRDs7QUFFRCxZQUFVLEdBQUc7O0FBRVosV0FBUSxJQUFJLENBQUMsSUFBSTtBQUNoQixnQkEvZGtFLFdBQVc7QUErZDNELFlBQU8sbUJBcGVvQixNQUFNLFVBZTlDLElBQUksRUFxZDZCLFVBQVUsQ0FBQyxDQUFBO0FBQUEsQUFDakQsZ0JBaGUrRSxRQUFRO0FBZ2V4RSxZQUFPLGtCQTFlcUIsT0FBTyxDQTBlaEIsS0FBSyxDQUFDLENBQUE7QUFBQSxBQUN4QyxnQkFoZUYsT0FBTztBQWdlUyxZQUFPLGtCQTNlc0IsT0FBTyxDQTJlakIsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0FBQUEsQUFDMUQsZ0JBamVPLE9BQU87QUFpZUEsWUFBTyxrQkE1ZXNCLE9BQU8sQ0E0ZWpCLElBQUksQ0FBQyxDQUFBO0FBQUEsQUFDdEMsZ0JBbGVnQixTQUFTO0FBa2VULFlBQU8sbUJBeGVzQixNQUFNLFVBZTlDLElBQUksRUF5ZDJCLFFBQVEsQ0FBQyxDQUFBO0FBQUEsQUFDN0MsZ0JBbmUyQixNQUFNO0FBbWVwQixZQUFPLG1CQXpleUIsTUFBTSxVQWU5QyxJQUFJLEVBMGR3QixLQUFLLENBQUMsQ0FBQTtBQUFBLEFBQ3ZDLGdCQXBlbUMsT0FBTztBQW9lNUIsWUFBTyxrQkEvZXNCLE9BQU8sQ0ErZWpCLElBQUksQ0FBQyxDQUFBO0FBQUEsQUFDdEMsZ0JBcmU0QyxZQUFZO0FBcWVyQyxZQUFPLGtCQTVlNUIsZUFBZSxDQTRlaUMsTUFBTSxnQkE5ZDFCLE9BQU8sQ0E4ZDZCLENBQUE7QUFBQSxBQUM5RDtBQUFTLFdBQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQUEsSUFDbkM7R0FDRDs7QUFFRCxPQUFLLEdBQUc7QUFDUCxVQUFPLGtCQXBmUixhQUFhLENBb2ZhLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQTtHQUMzQzs7QUFFRCxXQUFTLEVBQUUsU0FBUztBQUNwQixhQUFXLEVBQUUsU0FBUztBQUN0QixhQUFXLEdBQUc7QUFDYixVQUFPLGlCQUFpQixlQTNlcUIsT0FBTyxFQTJlbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQzVDOztBQUVELFVBQVEsR0FBRztBQUFFLFVBQU8sZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQUU7QUFDM0MsV0FBUyxHQUFHO0FBQUUsVUFBTyxTQUFTLENBQUMsa0JBbGdCL0IsY0FBYyxDQWtnQm9DLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUU7QUFDN0UsY0FBWSxFQUFFLFVBQVU7QUFDeEIsZUFBYSxFQUFFLFVBQVU7O0FBRXpCLE9BQUssR0FBRztBQUNQLFVBQU8sVUF4ZmdDLE1BQU0sRUF3Zi9CLElBQUksQ0FBQyxRQUFRLEVBQzFCLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQ2YsTUFBTSxrQkFwZ0J5QixjQUFjLENBb2dCcEIsa0JBdGdCVCxhQUFhLGVBZ0J3QixXQUFXLEVBc2ZSLGVBcmYzQyxXQUFXLENBcWY2QyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQ3pFOztBQUVELE1BQUksR0FBRztBQUNOLFNBQU0sU0FBUyxHQUFHLFdBbmZ1QyxrQkFBa0IsRUFtZnRDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNsRCxTQUFNLEtBQUssR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLGtCQTNnQjRCLGVBQWUsQ0EyZ0J2QixTQUFTLENBQUMsQ0FBQyxDQUFBO0FBQ3hFLFNBQU0sR0FBRyxHQUFHLGFBQWEsR0FDeEIsa0JBOWdCRixrQkFBa0IsQ0E4Z0JPLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FDdEQsa0JBbGhCc0IsdUJBQXVCLENBa2hCakIsQ0FBQyxTQUFTLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQTtBQUNoRCxTQUFNLElBQUksR0FBRyxrQkFsaEJrQixjQUFjLENBa2hCYixHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN0RCxVQUFPLGFBQWEsR0FBRyxrQkE3Z0JhLGVBQWUsQ0E2Z0JSLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUE7R0FDN0Q7O0FBRUQsT0FBSyxHQUFHO0FBQUUsVUFBTyxrQkFoaEJvQixlQUFlLENBZ2hCZixVQXRnQnJDLEtBQUssRUFzZ0JzQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO0dBQUU7O0FBRXhFLFNBQU8sR0FBRztBQUFFLFVBQU8sa0JBbGhCa0IsZUFBZSxDQWtoQmIsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtHQUFFO0VBQ2xFLENBQUMsQ0FBQTs7QUFFRixVQUFTLFFBQVEsQ0FBQyxTQUFTLEVBQUU7QUFDNUIsTUFBSSxJQUFJLENBQUMsSUFBSSxtQkFoaEJiLE9BQU8sQUFnaEJ5QixFQUFFO2VBQ0MsSUFBSSxDQUFDLElBQUk7U0FBcEMsSUFBSSxTQUFKLElBQUk7U0FBRSxTQUFTLFNBQVQsU0FBUztTQUFFLE1BQU0sU0FBTixNQUFNOztBQUM5QixTQUFNLElBQUksR0FBRyxrQkF6aEJpRCxtQkFBbUIsQ0F5aEI1QyxPQUFPLEVBQUUsQ0FDN0Msa0JBemhCZSxrQkFBa0IsZUFheEIsU0FBUyxFQTRnQmdCLFlBeGdCUyxTQUFTLEVBd2dCUixFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDeEUsU0FBTSxJQUFJLEdBQUcsa0JBamlCeUQsZ0JBQWdCLENBaWlCcEQsS0FBSyxnQkE3Z0I3QixTQUFTLGdCQUFnRSxPQUFPLENBNmdCOUIsQ0FBQTtBQUM1RCxTQUFNLE9BQU8sR0FBRyxrQkE1aEI4QyxtQkFBbUIsQ0E0aEJ6QyxPQUFPLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEtBQ2xFLGtCQTVoQmUsa0JBQWtCLENBNmhCaEMsV0F6Z0J1RCxrQkFBa0IsRUF5Z0J0RCxDQUFDLENBQUMsRUFDckIsa0JBbGlCc0UsZ0JBQWdCLGVBaUI5RSxTQUFTLEVBaWhCZSxrQkFsaUJVLE9BQU8sQ0FraUJMLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDdEQsU0FBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUE7QUFDcEMsVUFBTyxrQkF0aUJSLGNBQWMsQ0FzaUJhLENBQUMsSUFBSSxFQUFFLGtCQXBpQkYsV0FBVyxDQW9pQk8sSUFBSSxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FDeEU7O0FBRUEsVUFBTyxrQkF2aUJ3QixXQUFXLENBdWlCbkIsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFBO0VBQ2xFOztBQUVELFVBQVMsU0FBUyxHQUFHO0FBQ3BCLFFBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQzlCLFFBQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7O0FBRXhELE1BQUksTUFBTSxtQkFyaUJpQixXQUFXLEFBcWlCTCxFQUFFO0FBQ2xDLFNBQU0sSUFBSSxHQUFHLGtCQWpqQmtCLGNBQWMsZUFtQkEsT0FBTyxFQThoQlgsSUFBSSxDQUFDLENBQUE7QUFDOUMsU0FBTSxVQUFVLEdBQUcscUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDaEQsVUFBTyxVQXBpQk8sR0FBRyxFQW9pQk4sSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFBO0dBQzVCLE1BQU07QUFDTixTQUFNLENBQUMsR0FBRyxPQUFPLE1BQU0sQ0FBQyxNQUFNLEtBQUssUUFBUSxHQUMxQyxtQkEvaUI2QyxNQUFNLGdCQVlQLE9BQU8sRUFtaUJuQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQzlCLGtCQXJqQnVFLGdCQUFnQixlQWlCM0MsT0FBTyxFQW9pQnJCLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtBQUNqRCxVQUFPLGtCQXhqQndCLGNBQWMsQ0F3akJuQixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7R0FDbEM7RUFDRDs7QUFFRCxVQUFTLFVBQVUsR0FBRztBQUNyQixRQUFNLEtBQUssR0FBRyxVQTlpQjRFLElBQUksRUE4aUIzRSxJQUFJLG1CQWhqQnFDLFlBQVksQUFnakJ6QixFQUFFLE1BQU0sa0JBN2pCdkMsY0FBYyxFQTZqQjJDLENBQUMsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQjFFLFFBQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUE7O0FBRWhELFFBQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUNaLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDOztBQUVwRCxHQUFDLENBQUMsSUFBSSxDQUFDLGtCQS9rQk8sVUFBVSxDQStrQkYsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQy9DLEdBQUMsQ0FBQyxJQUFJLENBQUMsa0JBaGxCUSxVQUFVLENBZ2xCSCxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3hFLFNBQU8sQ0FBQyxDQUFBO0VBQ1I7OztBQUdEOztBQUVDLFVBQVMsR0FBRyxLQUFLLElBQUk7QUFDcEIsUUFBTSxNQUFNLEdBQUcsa0JBNWxCZ0IsY0FBYyxDQTRsQlgsbUJBcmxCNUIsdUJBQXVCLEVBcWxCNkIsS0FBSyxFQUFFLGFBQWEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQ3BGLFNBQU8sYUFBYSxHQUFHLGtCQXZsQmEsZUFBZSxDQXVsQlIsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQTtFQUNqRTtPQUVELFFBQVEsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFNLEtBQUs7QUFDN0IsTUFBSSxHQUFHLEdBQUcsVUFsbEI2QixNQUFNLEVBa2xCNUIsTUFBTSxFQUFFLEVBQUUsRUFBRSxvQkE1a0JiLGdCQUFnQixBQTRrQm1CLENBQUMsQ0FBQTtBQUNwRCxPQUFLLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQy9DLEdBQUcsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQ3hCLFNBQU8sR0FBRyxDQUFBO0VBQ1Y7T0FFRCxxQkFBcUIsR0FBRyxXQUFXLElBQ2xDLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFDM0IsWUFqbEJ3RCxhQUFhLEVBaWxCdkQsa0JBcG1CQyxjQUFjLEVBb21CSyxFQUFFLGtCQXZtQk8sT0FBTyxDQXVtQkYsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLFdBL2tCRCxrQkFBa0IsRUEra0JFLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FFbEYsT0FBTyxHQUFHLENBQUMsVUFBVSxFQUFFLEtBQUssS0FDM0IsVUE3bEJ1QyxNQUFNLEVBNmxCdEMsVUFBVSxFQUNoQixBQUFDLElBQWMsSUFBSztNQUFsQixPQUFPLEdBQVIsSUFBYyxDQUFiLE9BQU87TUFBRSxHQUFHLEdBQWIsSUFBYyxDQUFKLEdBQUc7O0FBQ2IsUUFBTSxPQUFPLEdBQUcsa0JBem1CNEMsbUJBQW1CLENBeW1CdkMsS0FBSyxFQUM1QyxDQUFDLGtCQXptQlksa0JBQWtCLENBeW1CUCxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDdkMsU0FBTyxrQkEvbUJxRCxjQUFjLENBK21CaEQsT0FBTyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtFQUN0RCxFQUNELE1BQU0sV0F4bEI0QixvQkFBb0IsRUF3bEIzQixFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztPQUV4QyxPQUFPLEdBQUcsTUFBTSxJQUNmLGtCQWhuQmdDLGNBQWMsQ0FnbkIzQixNQUFNLG1CQXhtQmdELEtBQUssQUF3bUJwQyxHQUN6QyxrQkFubkJnQixhQUFhLGVBZ0J3QixXQUFXLEVBbW1CakMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUM1QyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7T0FFYixpQkFBaUIsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFVLEtBQ3RDLE9BQU8sVUFBVSxLQUFLLFFBQVEsR0FDN0IsbUJBcG5CNkMsTUFBTSxFQW9uQjVDLE1BQU0sRUFBRSxVQUFVLENBQUMsR0FDMUIsa0JBMW5CdUUsZ0JBQWdCLENBMG5CbEUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQztPQUU5QyxpQkFBaUIsR0FBRyxNQUFNLElBQUk7QUFDN0IsTUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQzdCLE9BQU8sRUFBQyxHQUFHLEVBQUUsbUJBem5Cd0MseUJBQXlCLEVBeW5CdkMsTUFBTSxDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBQyxDQUFBLEtBQzVEO0FBQ0osU0FBTSxHQUFHLEdBQUcsTUFBTSxtQkFybkJzRCxLQUFLLEFBcW5CMUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsWUF6bUI3QyxRQUFRLEVBeW1COEMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUFDdkUsVUFBTyxFQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUE7R0FDNUI7RUFDRDtPQUVELGNBQWMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxLQUFLLEtBQUs7O0FBRWhFLE1BQUksSUFBSSxLQUFLLFNBQVMsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ25DLE1BQUksWUFBWSxLQUFLLFNBQVMsRUFBRSxZQUFZLEdBQUcsSUFBSSxDQUFBO0FBQ25ELE1BQUksS0FBSyxLQUFLLFNBQVMsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFBO0FBQ3JDLFFBQU0sR0FBRyxHQUFHLFVBN25CMkIsTUFBTSxFQTZuQjFCLFlBQVksRUFDOUIsRUFBRSxJQUFJO0FBQ0wsU0FBTSxHQUFHLEdBQUcsd0JBQXdCLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2xFLFVBQU8sVUFob0I4QixNQUFNLEVBZ29CN0IsS0FBSyxFQUNsQixDQUFDLElBQUksVUFqb0JNLEdBQUcsRUFpb0JMLFdBdG5CYyxPQUFPLEVBc25CYixFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxnQkE1bkJpQyxTQUFTLENBNG5COUIsRUFDeEMsTUFBTSxrQkE5b0I0RCxlQUFlLENBOG9CdkQsR0FBRyxDQUFDLENBQUMsQ0FBQTtHQUNoQyxFQUNELE1BQU0sVUFwb0JPLEdBQUcsRUFvb0JOLEtBQUssRUFBRSxrQkFocEJtRCxlQUFlLENBZ3BCOUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2pELFNBQU8sa0JBcHBCUixjQUFjLENBb3BCYSxVQXJvQlosR0FBRyxFQXFvQmEsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFBO0VBQ2hEO09BRUQsZUFBZSxHQUFHLE1BQU0sSUFDdkIsa0JBbnBCZ0QsWUFBWSxDQW9wQjNELEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQ2YsVUExb0JGLEtBQUssRUEwb0JHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQ3hCLFVBM29CRixLQUFLLEVBMm9CRyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO09BRTdCLGVBQWUsR0FBRyxDQUFDLElBQUk7QUFDdEIsUUFBTSxLQUFLLEdBQUcsVUEvb0JLLE9BQU8sRUErb0JKLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDbEMsT0FBSyxDQUFDLElBQUksQ0FBQyxVQWhwQjRCLE1BQU0sRUFncEIzQixDQUFDLENBQUMsTUFBTSxFQUN6QixDQUFDLElBQUksa0JBNXBCUSxVQUFVLENBNHBCSCxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUMxQyxvQkE3b0IwRSxpQkFBaUIsQUE2b0JwRSxDQUFDLENBQUMsQ0FBQTtBQUMxQixTQUFPLGtCQTlwQm1CLGVBQWUsQ0E4cEJkLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUE7RUFDakQsQ0FBQTs7QUFFRixPQUFNLE1BQU0sR0FBRyxrQkFucUJNLFVBQVUsQ0FtcUJELE9BQU8sQ0FBQyxDQUFBOzs7QUFHdEMsT0FDQyxhQUFhLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLElBQUksS0FBSztBQUM3QyxRQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7O0FBRWxELFFBQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDNUMsUUFBTSxjQUFjLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksMEJBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7O0FBRTlELFFBQU0sY0FBYyxHQUFHLGtCQWhyQmpCLGVBQWUsQ0FnckJzQixVQWhxQjdCLEdBQUcsRUFpcUJoQixVQWpxQndGLElBQUksRUFpcUJ2RixnQkFBZ0IsRUFBRSxNQUFNLGtCQTlxQmMsT0FBTyxDQThxQlQsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLGdCQTVwQnBFLGFBQWEsRUE4cEJYLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLGtCQWhyQm1CLE9BQU8sQ0FnckJkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBOztBQUUxQyxRQUFNLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDcEMsUUFBTSxpQkFBaUIsR0FBRyxFQUFFLENBQUE7QUFDNUIsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDakQsU0FBTSxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3ZCLFNBQU0sRUFBRSxHQUFHLG1CQWpyQm1CLFFBQVEsRUFpckJsQixDQUFDLEdBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLEdBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ25ELG9CQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUMxQixxQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0dBQzdCOztBQUVELFFBQU0sVUFBVSxHQUFHLFVBOXFCTCxHQUFHLEVBOHFCTSxVQTlxQmtFLElBQUksRUE4cUJqRSxnQkFBZ0IsRUFBRSxNQUFNLE1BQU0sQ0FBQyxnQkExcUI1RCxTQUFTLEVBMHFCZ0UsaUJBQWlCLENBQUMsQ0FBQTs7QUFFMUYsUUFBTSxNQUFNLEdBQUcsVUFockIwRSxJQUFJLEVBZ3JCekUsZ0JBQWdCLEVBQUUsTUFBTSxrQkE5ckJILG1CQUFtQixDQThyQlEsWUF4cUJjLFdBQVcsRUF3cUJiLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTs7QUFFekYsUUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQ2hDLG1CQTNyQndDLEdBQUcsRUEyckJ2QyxrQkFqc0JvQyxtQkFBbUIsQ0Fpc0IvQixZQTNxQnFELFdBQVcsRUEycUJwRCxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBOzs7QUFHN0UsUUFBTSx1QkFBdUIsR0FBRyxVQXRyQnlELElBQUksRUFzckJ4RCxDQUFDLFVBdHJCUyxPQUFPLEVBc3JCUixPQUFPLENBQUMsRUFDckQsTUFBTSxrQkFqc0J1RCxtQkFBbUIsQ0Fpc0JsRCxPQUFPLEVBQ3BDLFVBeHJCaUIsT0FBTyxFQXdyQmhCLE9BQU8sRUFBRSxDQUFDLElBQUksaUJBQWlCLENBQUMsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBOztBQUUxRSxRQUFNLFFBQVEsR0FBRyxrQkF6c0JsQixjQUFjLENBeXNCdUIsVUExckJ0QixHQUFHLEVBMnJCaEIsTUFBTSxFQUFFLFNBQVMsRUFBRSx1QkFBdUIsRUFBRSxJQUFJLGdCQXRyQkEsYUFBYSxDQXNyQkcsQ0FBQyxDQUFBOztBQUVsRSxRQUFNLFFBQVEsR0FDYixPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUN4QixrQkE5c0JILGNBQWMsQ0E4c0JRLENBQUMsa0JBN3NCbUIsbUJBQW1CLENBOHNCekQsa0JBaHRCNkMsb0JBQW9CLENBZ3RCeEMsR0FBRyxnQkE3ckJJLFVBQVUsRUE4ckJ6QyxZQXhyQkwsTUFBTSxFQXdyQk0sbUJBenNCTCx1QkFBdUIsRUF5c0JNLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FDL0MsUUFBUSxDQUFBOztBQUVWLFNBQU8sa0JBbnRCd0IsY0FBYyxlQWtCdUMsUUFBUSxFQWtzQjNGLENBQUMsY0FBYyxFQUFFLGtCQXJ0QkssdUJBQXVCLENBcXRCQSxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO0VBQ3JFO09BRUQsWUFBWSxHQUFHLElBQUksSUFDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUV2QyxpQkFBaUIsR0FBRyxDQUFDLEtBQTJCLEVBQUUsZ0JBQWdCLEtBQUs7TUFBakQsUUFBUSxHQUFULEtBQTJCLENBQTFCLFFBQVE7TUFBRSxlQUFlLEdBQTFCLEtBQTJCLENBQWhCLGVBQWU7OztBQUU5QyxRQUFNLE1BQU0sR0FBRyxDQUFDLFVBN3NCK0IsT0FBTyxFQTZzQjlCLFFBQVEsQ0FBQyxHQUFHLGVBQWUsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBRSxNQUFNLEVBQUUsQ0FBQTtBQUMzRSxRQUFNLEtBQUssR0FBRyxDQUFDLE1BQU0sV0Fyc0JILGVBQWUsV0FEaUQsV0FBVyxDQXNzQnhDLENBQUUsZ0JBQWdCLENBQUMsQ0FBQTs7QUFFeEUsUUFBTSxlQUFlLEdBQUcsVUEvc0J6QixLQUFLLEVBK3NCMEIsZUFBZSxFQUFFLEdBQUcsSUFBSTtBQUNyRCxTQUFNLE1BQU0sR0FBRyxZQXpzQjhDLGtCQUFrQixFQXlzQjdDLGdCQUFnQixDQUFDLENBQUE7QUFDbkQsU0FBTSxHQUFHLEdBQUcsTUFBTSxHQUFHLFlBM3NCVixRQUFRLEVBMnNCVyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUE7QUFDOUMsVUFBTyxtQkEzdEJpQyxHQUFHLEVBMnRCaEMsa0JBNXRCSSxrQkFBa0IsQ0E0dEJDLFdBeHNCc0Isa0JBQWtCLEVBd3NCckIsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0dBQ3pFLENBQUMsQ0FBQTs7QUFFRixRQUFNLGdCQUFnQixHQUFHLFVBdHRCc0IsT0FBTyxFQXN0QnJCLFFBQVEsQ0FBQyxHQUFHLElBQUksR0FDaEQsMEJBQTBCLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFBOztBQUVqRSxTQUFPLFVBenRCTyxHQUFHLEVBeXRCTixlQUFlLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTtFQUM3QyxDQUFBOzs7QUFHRixPQUNDLDBCQUEwQixHQUFHLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxLQUFLO0FBQ3BFLFFBQU0sZ0JBQWdCLEdBQUcsQ0FBQyxFQUFFLEdBQUUsa0JBQWtCLEVBQUMsQ0FBQyxDQUFBO0FBQ2xELG9CQUFrQixHQUFHLGtCQUFrQixHQUFHLENBQUMsQ0FBQTtBQUMzQyxRQUFNLGNBQWMsR0FBRyxrQkE5dUJKLFVBQVUsQ0E4dUJTLGdCQUFnQixDQUFDLENBQUE7QUFDdkQsUUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUk7O0FBRTdDLFNBQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7QUFDdEUsVUFBTyxjQUFjLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQTtHQUM1QyxDQUFDLENBQUE7O0FBRUYsUUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxHQUFHLFlBanVCdEIsUUFBUSxFQWl1QnVCLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQTtBQUN6RCxTQUFPLFVBenVCTyxHQUFHLEVBeXVCTixrQkFsdkJLLGtCQUFrQixDQWt2QkEsY0FBYyxFQUFFLEdBQUcsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0VBQ3BFO09BRUQsY0FBYyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxrQkFBa0IsS0FBSztRQUNsRCxJQUFJLEdBQVksUUFBUSxDQUF4QixJQUFJO1FBQUUsTUFBTSxHQUFJLFFBQVEsQ0FBbEIsTUFBTTs7QUFDbkIsUUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFBOzs7QUFHaEMsT0FBSyxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsd0JBQXdCLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUN0RSxRQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxZQTN1QmhDLFFBQVEsRUEydUJpQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUE7QUFDbkUsWUFudkJNLE1BQU0sRUFtdkJMLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUE7QUFDckMsU0FBTyxrQkE3dkJTLGtCQUFrQixDQTZ2QkosV0F6dUIyQixrQkFBa0IsRUF5dUIxQixRQUFRLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtFQUNoRTtPQUVELHdCQUF3QixHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEtBQzNDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksTUFBTSxLQUFLLElBQUksR0FDL0MsWUFqdkIwQixlQUFlLEVBaXZCekIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRSxrQkF0d0JVLE9BQU8sQ0Fzd0JMLElBQUksQ0FBQyxDQUFDLEdBQ25ELEdBQUc7T0FFTCxTQUFTLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEtBQ2hELE1BQU0sR0FDTixZQXJ2Qk8sU0FBUyxFQXF2Qk4sU0FBUyxFQUFFLGtCQTN3QnVCLE9BQU8sQ0Eyd0JsQixPQUFPLENBQUMsQ0FBQyxHQUMxQyxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FDeEMsWUF4dkJ1RCxLQUFLLEVBd3ZCdEQsU0FBUyxFQUFFLGtCQTd3QjJCLE9BQU8sQ0E2d0J0QixPQUFPLENBQUMsQ0FBQyxHQUN0QyxtQkF6d0I4QyxNQUFNLEVBeXdCN0MsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFBIiwiZmlsZSI6InByaXZhdGUvdHJhbnNwaWxlL3RyYW5zcGlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHtBcnJheUV4cHJlc3Npb24sIEFycm93RnVuY3Rpb25FeHByZXNzaW9uLCBBc3NpZ25tZW50RXhwcmVzc2lvbiwgQmluYXJ5RXhwcmVzc2lvbixcblx0QmxvY2tTdGF0ZW1lbnQsIEJyZWFrU3RhdGVtZW50LCBDYWxsRXhwcmVzc2lvbiwgQ2F0Y2hDbGF1c2UsIENsYXNzQm9keSwgQ2xhc3NFeHByZXNzaW9uLFxuXHRDb25kaXRpb25hbEV4cHJlc3Npb24sIERlYnVnZ2VyU3RhdGVtZW50LCBFeHByZXNzaW9uU3RhdGVtZW50LCBGb3JPZlN0YXRlbWVudCxcblx0RnVuY3Rpb25FeHByZXNzaW9uLCBJZGVudGlmaWVyLCBJZlN0YXRlbWVudCwgTGl0ZXJhbCwgTG9naWNhbEV4cHJlc3Npb24sIE1lbWJlckV4cHJlc3Npb24sXG5cdE1ldGhvZERlZmluaXRpb24sIE5ld0V4cHJlc3Npb24sIE9iamVjdEV4cHJlc3Npb24sIFByb2dyYW0sIFByb3BlcnR5LCBSZXR1cm5TdGF0ZW1lbnQsXG5cdFNwcmVhZEVsZW1lbnQsIFN3aXRjaENhc2UsIFN3aXRjaFN0YXRlbWVudCwgVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uLCBUZW1wbGF0ZUVsZW1lbnQsXG5cdFRlbXBsYXRlTGl0ZXJhbCwgVGhpc0V4cHJlc3Npb24sIFRocm93U3RhdGVtZW50LCBUcnlTdGF0ZW1lbnQsIFZhcmlhYmxlRGVjbGFyYXRpb24sXG5cdFVuYXJ5RXhwcmVzc2lvbiwgVmFyaWFibGVEZWNsYXJhdG9yLCBZaWVsZEV4cHJlc3Npb259IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IHtmdW5jdGlvbkV4cHJlc3Npb25UaHVuaywgaWRDYWNoZWQsIGxvYywgbWVtYmVyLCBwcm9wZXJ0eUlkT3JMaXRlcmFsQ2FjaGVkLCB0b1N0YXRlbWVudFxuXHR9IGZyb20gJ2VzYXN0L2Rpc3QvdXRpbCdcbmltcG9ydCBtYW5nbGVQYXRoIGZyb20gJy4uL21hbmdsZVBhdGgnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtBc3NpZ25TaW5nbGUsIENhbGwsIENvbnN0cnVjdG9yLCBMX0FuZCwgTF9PciwgTERfTGF6eSwgTERfTXV0YWJsZSwgTWVtYmVyLCBMb2NhbERlY2xhcmUsXG5cdFBhdHRlcm4sIFNwbGF0LCBTRF9EZWJ1Z2dlciwgU0VUX0luaXQsIFNFVF9Jbml0TXV0YWJsZSwgU0VUX011dGF0ZSwgU1ZfQ29udGFpbnMsIFNWX0ZhbHNlLFxuXHRTVl9OYW1lLCBTVl9OdWxsLCBTVl9TZXRTdWIsIFNWX1N1YiwgU1ZfVHJ1ZSwgU1ZfVW5kZWZpbmVkLCBTd2l0Y2hEb1BhcnQsIFF1b3RlLCBJbXBvcnRcblx0fSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7YXNzZXJ0LCBjYXQsIGZsYXRNYXAsIGZsYXRPcE1hcCwgaWZFbHNlLCBpc0VtcHR5LCBpbXBsZW1lbnRNYW55LCBpc1Bvc2l0aXZlLCBsYXN0LCBvcElmLFxuXHRvcE1hcCwgdGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7QW1kZWZpbmVIZWFkZXIsIEFycmF5U2xpY2VDYWxsLCBEZWNsYXJlQnVpbHRCYWcsIERlY2xhcmVCdWlsdE1hcCwgRGVjbGFyZUJ1aWx0T2JqLFxuXHREZWNsYXJlTGV4aWNhbFRoaXMsIEV4cG9ydHNEZWZhdWx0LCBFeHBvcnRzR2V0LCBJZEFyZ3VtZW50cywgSWRCdWlsdCwgSWRDb25zdHJ1Y3RvciwgSWREZWZpbmUsXG5cdElkRXhwb3J0cywgSWRFeHRyYWN0LCBJZEZvY3VzLCBJZExleGljYWxUaGlzLCBJZFN1cGVyLCBHbG9iYWxFcnJvciwgTGl0RW1wdHlTdHJpbmcsIExpdE51bGwsXG5cdExpdFN0ckV4cG9ydHMsIExpdFN0clRocm93LCBMaXRaZXJvLCBSZXR1cm5CdWlsdCwgUmV0dXJuRXhwb3J0cywgUmV0dXJuUmVzLCBTd2l0Y2hDYXNlTm9NYXRjaCxcblx0VGhyb3dBc3NlcnRGYWlsLCBUaHJvd05vQ2FzZU1hdGNoLCBVc2VTdHJpY3R9IGZyb20gJy4vYXN0LWNvbnN0YW50cydcbmltcG9ydCB7SWRNcywgbGF6eVdyYXAsIG1zQWRkLCBtc0FkZE1hbnksIG1zQXNzZXJ0LCBtc0Fzc2VydE1lbWJlciwgbXNBc3NlcnROb3QsXG5cdG1zQXNzZXJ0Tm90TWVtYmVyLCBtc0Fzc29jLCBtc0NoZWNrQ29udGFpbnMsIG1zRXh0cmFjdCwgbXNHZXQsIG1zR2V0RGVmYXVsdEV4cG9ydCwgbXNHZXRNb2R1bGUsXG5cdG1zTGF6eSwgbXNMYXp5R2V0LCBtc0xhenlHZXRNb2R1bGUsIG1zTmV3TXV0YWJsZVByb3BlcnR5LCBtc05ld1Byb3BlcnR5LCBtc1NldExhenksIG1zU2V0U3ViLFxuXHRtc1NvbWUsIG1zU3ltYm9sLCBNc05vbmV9IGZyb20gJy4vbXMtY2FsbCdcbmltcG9ydCB7YWNjZXNzTG9jYWxEZWNsYXJlLCBkZWNsYXJlLCBmb3JTdGF0ZW1lbnRJbmZpbml0ZSwgaWRGb3JEZWNsYXJlQ2FjaGVkLFxuXHRvcFR5cGVDaGVja0ZvckxvY2FsRGVjbGFyZX0gZnJvbSAnLi91dGlsJ1xuXG5sZXQgY29udGV4dCwgdmVyaWZ5UmVzdWx0cywgaXNJbkdlbmVyYXRvciwgaXNJbkNvbnN0cnVjdG9yXG5sZXQgbmV4dERlc3RydWN0dXJlZElkXG5cbmV4cG9ydCBkZWZhdWx0IChfY29udGV4dCwgbW9kdWxlRXhwcmVzc2lvbiwgX3ZlcmlmeVJlc3VsdHMpID0+IHtcblx0Y29udGV4dCA9IF9jb250ZXh0XG5cdHZlcmlmeVJlc3VsdHMgPSBfdmVyaWZ5UmVzdWx0c1xuXHRpc0luR2VuZXJhdG9yID0gZmFsc2Vcblx0aXNJbkNvbnN0cnVjdG9yID0gZmFsc2Vcblx0bmV4dERlc3RydWN0dXJlZElkID0gMFxuXHRjb25zdCByZXMgPSB0MChtb2R1bGVFeHByZXNzaW9uKVxuXHQvLyBSZWxlYXNlIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXG5cdGNvbnRleHQgPSB2ZXJpZnlSZXN1bHRzID0gdW5kZWZpbmVkXG5cdHJldHVybiByZXNcbn1cblxuZXhwb3J0IGNvbnN0XG5cdHQwID0gZXhwciA9PiBsb2MoZXhwci50cmFuc3BpbGUoKSwgZXhwci5sb2MpXG5jb25zdFxuXHR0MSA9IChleHByLCBhcmcpID0+IGxvYyhleHByLnRyYW5zcGlsZShhcmcpLCBleHByLmxvYyksXG5cdHQzID0gKGV4cHIsIGFyZywgYXJnMiwgYXJnMykgPT4gbG9jKGV4cHIudHJhbnNwaWxlKGFyZywgYXJnMiwgYXJnMyksIGV4cHIubG9jKSxcblx0dExpbmVzID0gZXhwcnMgPT4ge1xuXHRcdGNvbnN0IG91dCA9IFtdXG5cdFx0Zm9yIChjb25zdCBleHByIG9mIGV4cHJzKSB7XG5cdFx0XHRjb25zdCBhc3QgPSBleHByLnRyYW5zcGlsZSgpXG5cdFx0XHRpZiAoYXN0IGluc3RhbmNlb2YgQXJyYXkpXG5cdFx0XHRcdC8vIElnbm9yZSBwcm9kdWNlcyAwIHN0YXRlbWVudHMgYW5kIFJlZ2lvbiBwcm9kdWNlcyBtYW55LlxuXHRcdFx0XHRmb3IgKGNvbnN0IF8gb2YgYXN0KVxuXHRcdFx0XHRcdG91dC5wdXNoKHRvU3RhdGVtZW50KF8pKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRvdXQucHVzaChsb2ModG9TdGF0ZW1lbnQoYXN0KSwgZXhwci5sb2MpKVxuXHRcdH1cblx0XHRyZXR1cm4gb3V0XG5cdH1cblxuaW1wbGVtZW50TWFueShNc0FzdFR5cGVzLCAndHJhbnNwaWxlJywge1xuXHRBc3NlcnQoKSB7XG5cdFx0Y29uc3QgZmFpbENvbmQgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBjb25kID0gdDAodGhpcy5jb25kaXRpb24pXG5cdFx0XHRyZXR1cm4gdGhpcy5uZWdhdGUgPyBjb25kIDogbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIGNvbmQpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wVGhyb3duLFxuXHRcdFx0XyA9PiBuZXcgSWZTdGF0ZW1lbnQoZmFpbENvbmQoKSwgZG9UaHJvdyhfKSksXG5cdFx0XHQoKSA9PiB7XG5cdFx0XHRcdGlmICh0aGlzLmNvbmRpdGlvbiBpbnN0YW5jZW9mIENhbGwpIHtcblx0XHRcdFx0XHRjb25zdCBjYWxsID0gdGhpcy5jb25kaXRpb25cblx0XHRcdFx0XHRjb25zdCBjYWxsZWQgPSBjYWxsLmNhbGxlZFxuXHRcdFx0XHRcdGNvbnN0IGFyZ3MgPSBjYWxsLmFyZ3MubWFwKHQwKVxuXHRcdFx0XHRcdGlmIChjYWxsZWQgaW5zdGFuY2VvZiBNZW1iZXIpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGFzcyA9IHRoaXMubmVnYXRlID8gbXNBc3NlcnROb3RNZW1iZXIgOiBtc0Fzc2VydE1lbWJlclxuXHRcdFx0XHRcdFx0cmV0dXJuIGFzcyh0MChjYWxsZWQub2JqZWN0KSwgbmV3IExpdGVyYWwoY2FsbGVkLm5hbWUpLCAuLi5hcmdzKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb25zdCBhc3MgPSB0aGlzLm5lZ2F0ZSA/IG1zQXNzZXJ0Tm90IDogbXNBc3NlcnRcblx0XHRcdFx0XHRcdHJldHVybiBhc3ModDAoY2FsbGVkKSwgLi4uYXJncylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQoZmFpbENvbmQoKSwgVGhyb3dBc3NlcnRGYWlsKVxuXHRcdFx0fSlcblx0fSxcblxuXHRBc3NpZ25TaW5nbGUodmFsV3JhcCkge1xuXHRcdGNvbnN0IHZhbCA9IHZhbFdyYXAgPT09IHVuZGVmaW5lZCA/IHQwKHRoaXMudmFsdWUpIDogdmFsV3JhcCh0MCh0aGlzLnZhbHVlKSlcblx0XHRjb25zdCBkZWNsYXJlID0gbWFrZURlY2xhcmF0b3IodGhpcy5hc3NpZ25lZSwgdmFsLCBmYWxzZSlcblx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24odGhpcy5hc3NpZ25lZS5pc011dGFibGUoKSA/ICdsZXQnIDogJ2NvbnN0JywgW2RlY2xhcmVdKVxuXHR9LFxuXHQvLyBUT0RPOkVTNiBKdXN0IHVzZSBuYXRpdmUgZGVzdHJ1Y3R1cmluZyBhc3NpZ25cblx0QXNzaWduRGVzdHJ1Y3R1cmUoKSB7XG5cdFx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKFxuXHRcdFx0dGhpcy5raW5kKCkgPT09IExEX011dGFibGUgPyAnbGV0JyA6ICdjb25zdCcsXG5cdFx0XHRtYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycyhcblx0XHRcdFx0dGhpcy5hc3NpZ25lZXMsXG5cdFx0XHRcdHRoaXMua2luZCgpID09PSBMRF9MYXp5LFxuXHRcdFx0XHR0MCh0aGlzLnZhbHVlKSxcblx0XHRcdFx0ZmFsc2UpKVxuXHR9LFxuXG5cdEJhZ0VudHJ5KCkgeyByZXR1cm4gbXNBZGQoSWRCdWlsdCwgdDAodGhpcy52YWx1ZSkpIH0sXG5cblx0QmFnRW50cnlNYW55KCkgeyByZXR1cm4gbXNBZGRNYW55KElkQnVpbHQsIHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdEJhZ1NpbXBsZSgpIHsgcmV0dXJuIG5ldyBBcnJheUV4cHJlc3Npb24odGhpcy5wYXJ0cy5tYXAodDApKSB9LFxuXG5cdEJsb2NrRG8obGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkge1xuXHRcdC8vIFRPRE86RVM2IE9wdGlvbmFsIGFyZ3VtZW50c1xuXHRcdGlmIChsZWFkID09PSB1bmRlZmluZWQpIGxlYWQgPSBudWxsXG5cdFx0aWYgKG9wRGVjbGFyZVJlcyA9PT0gdW5kZWZpbmVkKSBvcERlY2xhcmVSZXMgPSBudWxsXG5cdFx0aWYgKG9wT3V0ID09PSB1bmRlZmluZWQpIG9wT3V0ID0gbnVsbFxuXHRcdGFzc2VydChvcERlY2xhcmVSZXMgPT09IG51bGwpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgdExpbmVzKHRoaXMubGluZXMpLCBvcE91dCkpXG5cdH0sXG5cblx0QmxvY2tWYWxUaHJvdyhsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KSB7XG5cdFx0Ly8gVE9ETzpFUzYgT3B0aW9uYWwgYXJndW1lbnRzXG5cdFx0aWYgKGxlYWQgPT09IHVuZGVmaW5lZCkgbGVhZCA9IG51bGxcblx0XHRpZiAob3BEZWNsYXJlUmVzID09PSB1bmRlZmluZWQpIG9wRGVjbGFyZVJlcyA9IG51bGxcblx0XHRpZiAob3BPdXQgPT09IHVuZGVmaW5lZCkgb3BPdXQgPSBudWxsXG5cdFx0Y29udGV4dC53YXJuSWYob3BEZWNsYXJlUmVzICE9PSBudWxsIHx8IG9wT3V0ICE9PSBudWxsLCB0aGlzLmxvYyxcblx0XHRcdCdPdXQgY29uZGl0aW9uIGlnbm9yZWQgYmVjYXVzZSBvZiBvaC1ubyEnKVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHRMaW5lcyh0aGlzLmxpbmVzKSwgdDAodGhpcy50aHJvdykpKVxuXHR9LFxuXG5cdEJsb2NrV2l0aFJldHVybihsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKHQwKHRoaXMucmV0dXJuZWQpLCB0TGluZXModGhpcy5saW5lcyksIGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpXG5cdH0sXG5cblx0QmxvY2tCYWcobGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayhcblx0XHRcdElkQnVpbHQsXG5cdFx0XHRjYXQoRGVjbGFyZUJ1aWx0QmFnLCB0TGluZXModGhpcy5saW5lcykpLFxuXHRcdFx0bGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dClcblx0fSxcblxuXHRCbG9ja09iaihsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKFxuXHRcdFx0SWRCdWlsdCxcblx0XHRcdGNhdChEZWNsYXJlQnVpbHRPYmosIHRMaW5lcyh0aGlzLmxpbmVzKSksXG5cdFx0XHRsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KVxuXHR9LFxuXG5cdEJsb2NrTWFwKGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2soXG5cdFx0XHRJZEJ1aWx0LFxuXHRcdFx0Y2F0KERlY2xhcmVCdWlsdE1hcCwgdExpbmVzKHRoaXMubGluZXMpKSxcblx0XHRcdGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpXG5cdH0sXG5cblx0QmxvY2tXcmFwKCkgeyByZXR1cm4gYmxvY2tXcmFwKHQwKHRoaXMuYmxvY2spKSB9LFxuXG5cdEJyZWFrKCkgeyByZXR1cm4gbmV3IEJyZWFrU3RhdGVtZW50KCkgfSxcblxuXHRCcmVha1dpdGhWYWwoKSB7IHJldHVybiBuZXcgUmV0dXJuU3RhdGVtZW50KHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdENhbGwoKSB7XG5cdFx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbih0MCh0aGlzLmNhbGxlZCksIHRoaXMuYXJncy5tYXAodDApKVxuXHR9LFxuXG5cdENhc2VEbygpIHtcblx0XHRjb25zdCBib2R5ID0gY2FzZUJvZHkodGhpcy5wYXJ0cywgdGhpcy5vcEVsc2UpXG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wQ2FzZWQsIF8gPT4gbmV3IEJsb2NrU3RhdGVtZW50KFt0MChfKSwgYm9keV0pLCAoKSA9PiBib2R5KVxuXHR9LFxuXHRDYXNlVmFsKCkge1xuXHRcdGNvbnN0IGJvZHkgPSBjYXNlQm9keSh0aGlzLnBhcnRzLCB0aGlzLm9wRWxzZSlcblx0XHRjb25zdCBibG9jayA9IGlmRWxzZSh0aGlzLm9wQ2FzZWQsIF8gPT4gW3QwKF8pLCBib2R5XSwgKCkgPT4gW2JvZHldKVxuXHRcdHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KGJsb2NrKSlcblx0fSxcblx0Q2FzZURvUGFydDogY2FzZVBhcnQsXG5cdENhc2VWYWxQYXJ0OiBjYXNlUGFydCxcblxuXHRDbGFzcygpIHtcblx0XHRjb25zdCBtZXRob2RzID0gY2F0KFxuXHRcdFx0dGhpcy5zdGF0aWNzLm1hcChfID0+IHQxKF8sIHRydWUpKSxcblx0XHRcdG9wTWFwKHRoaXMub3BDb25zdHJ1Y3RvciwgdDApLFxuXHRcdFx0dGhpcy5tZXRob2RzLm1hcChfID0+IHQxKF8sIGZhbHNlKSkpXG5cdFx0Y29uc3Qgb3BOYW1lID0gb3BNYXAodmVyaWZ5UmVzdWx0cy5vcE5hbWUodGhpcyksIGlkQ2FjaGVkKVxuXHRcdGNvbnN0IGNsYXNzRXhwciA9IG5ldyBDbGFzc0V4cHJlc3Npb24oXG5cdFx0XHRvcE5hbWUsXG5cdFx0XHRvcE1hcCh0aGlzLm9wU3VwZXJDbGFzcywgdDApLCBuZXcgQ2xhc3NCb2R5KG1ldGhvZHMpKVxuXG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wRG8sIF8gPT4gdDEoXywgY2xhc3NFeHByKSwgKCkgPT4gY2xhc3NFeHByKVxuXHR9LFxuXG5cdENsYXNzRG8oY2xhc3NFeHByKSB7XG5cdFx0Y29uc3QgbGVhZCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IodDAodGhpcy5kZWNsYXJlRm9jdXMpLCBjbGFzc0V4cHIpXSlcblx0XHRjb25zdCByZXQgPSBuZXcgUmV0dXJuU3RhdGVtZW50KHQwKHRoaXMuZGVjbGFyZUZvY3VzKSlcblx0XHRjb25zdCBibG9jayA9IHQzKHRoaXMuYmxvY2ssIGxlYWQsIG51bGwsIHJldClcblx0XHRyZXR1cm4gYmxvY2tXcmFwKGJsb2NrKVxuXHR9LFxuXG5cdENvbmQoKSB7XG5cdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odDAodGhpcy50ZXN0KSwgdDAodGhpcy5pZlRydWUpLCB0MCh0aGlzLmlmRmFsc2UpKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsRG8oKSB7XG5cdFx0Y29uc3QgdGVzdCA9IHQwKHRoaXMudGVzdClcblx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KFxuXHRcdFx0dGhpcy5pc1VubGVzcyA/IG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCB0ZXN0KSA6IHRlc3QsXG5cdFx0XHR0MCh0aGlzLnJlc3VsdCkpXG5cdH0sXG5cblx0Q29uZGl0aW9uYWxWYWwoKSB7XG5cdFx0Y29uc3QgdGVzdCA9IHQwKHRoaXMudGVzdClcblx0XHRjb25zdCByZXN1bHQgPSBtc1NvbWUoYmxvY2tXcmFwKHQwKHRoaXMucmVzdWx0KSkpXG5cdFx0cmV0dXJuIHRoaXMuaXNVbmxlc3MgP1xuXHRcdFx0bmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXN0LCBNc05vbmUsIHJlc3VsdCkgOlxuXHRcdFx0bmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXN0LCByZXN1bHQsIE1zTm9uZSlcblx0fSxcblxuXHRDb25zdHJ1Y3RvcigpIHtcblx0XHRpc0luQ29uc3RydWN0b3IgPSB0cnVlXG5cblx0XHQvLyBJZiB0aGVyZSBpcyBhIGBzdXBlciFgLCBgdGhpc2Agd2lsbCBub3QgYmUgZGVmaW5lZCB1bnRpbCB0aGVuLCBzbyBtdXN0IHdhaXQgdW50aWwgdGhlbi5cblx0XHQvLyBPdGhlcndpc2UsIGRvIGl0IGF0IHRoZSBiZWdpbm5pbmcuXG5cdFx0Y29uc3QgYm9keSA9IHZlcmlmeVJlc3VsdHMuY29uc3RydWN0b3JUb1N1cGVyLmhhcyh0aGlzKSA/XG5cdFx0XHR0MCh0aGlzLmZ1bikgOlxuXHRcdFx0dDEodGhpcy5mdW4sIGNvbnN0cnVjdG9yU2V0TWVtYmVycyh0aGlzKSlcblxuXHRcdGNvbnN0IHJlcyA9IG5ldyBNZXRob2REZWZpbml0aW9uKElkQ29uc3RydWN0b3IsIGJvZHksICdjb25zdHJ1Y3RvcicsIGZhbHNlLCBmYWxzZSlcblx0XHRpc0luQ29uc3RydWN0b3IgPSBmYWxzZVxuXHRcdHJldHVybiByZXNcblx0fSxcblxuXHRDYXRjaCgpIHtcblx0XHRyZXR1cm4gbmV3IENhdGNoQ2xhdXNlKHQwKHRoaXMuY2F1Z2h0KSwgdDAodGhpcy5ibG9jaykpXG5cdH0sXG5cblx0RXhjZXB0RG8oKSB7IHJldHVybiB0cmFuc3BpbGVFeGNlcHQodGhpcykgfSxcblx0RXhjZXB0VmFsKCkgeyByZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChbdHJhbnNwaWxlRXhjZXB0KHRoaXMpXSkpIH0sXG5cblx0Rm9yRG8oKSB7IHJldHVybiBmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jaykgfSxcblxuXHRGb3JCYWcoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW1xuXHRcdFx0RGVjbGFyZUJ1aWx0QmFnLFxuXHRcdFx0Zm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spLFxuXHRcdFx0UmV0dXJuQnVpbHRcblx0XHRdKSlcblx0fSxcblxuXHRGb3JWYWwoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW2Zvckxvb3AodGhpcy5vcEl0ZXJhdGVlLCB0aGlzLmJsb2NrKV0pKVxuXHR9LFxuXG5cdEZ1bihsZWFkU3RhdGVtZW50cykge1xuXHRcdC8vIFRPRE86RVM2IE9wdGlvbmFsIGFyZ3Ncblx0XHRpZiAobGVhZFN0YXRlbWVudHMgPT09IHVuZGVmaW5lZClcblx0XHRcdGxlYWRTdGF0ZW1lbnRzID0gbnVsbFxuXG5cdFx0Y29uc3Qgb2xkSW5HZW5lcmF0b3IgPSBpc0luR2VuZXJhdG9yXG5cdFx0aXNJbkdlbmVyYXRvciA9IHRoaXMuaXNHZW5lcmF0b3JcblxuXHRcdC8vIFRPRE86RVM2IHVzZSBgLi4uYGZcblx0XHRjb25zdCBuQXJncyA9IG5ldyBMaXRlcmFsKHRoaXMuYXJncy5sZW5ndGgpXG5cdFx0Y29uc3Qgb3BEZWNsYXJlUmVzdCA9IG9wTWFwKHRoaXMub3BSZXN0QXJnLCByZXN0ID0+XG5cdFx0XHRkZWNsYXJlKHJlc3QsIG5ldyBDYWxsRXhwcmVzc2lvbihBcnJheVNsaWNlQ2FsbCwgW0lkQXJndW1lbnRzLCBuQXJnc10pKSlcblx0XHRjb25zdCBhcmdDaGVja3MgPSBvcElmKGNvbnRleHQub3B0cy5pbmNsdWRlQ2hlY2tzKCksICgpID0+XG5cdFx0XHRmbGF0T3BNYXAodGhpcy5hcmdzLCBvcFR5cGVDaGVja0ZvckxvY2FsRGVjbGFyZSkpXG5cblx0XHRjb25zdCBfaW4gPSBvcE1hcCh0aGlzLm9wSW4sIHQwKVxuXG5cdFx0Y29uc3Qgb3BEZWNsYXJlVGhpcyA9XG5cdFx0XHRvcElmKCFpc0luQ29uc3RydWN0b3IgJiYgdGhpcy5vcERlY2xhcmVUaGlzICE9IG51bGwsICgpID0+IERlY2xhcmVMZXhpY2FsVGhpcylcblxuXHRcdGNvbnN0IGxlYWQgPSBjYXQobGVhZFN0YXRlbWVudHMsIG9wRGVjbGFyZVRoaXMsIG9wRGVjbGFyZVJlc3QsIGFyZ0NoZWNrcywgX2luKVxuXG5cdFx0Y29uc3QgX291dCA9IG9wTWFwKHRoaXMub3BPdXQsIHQwKVxuXHRcdGNvbnN0IGJvZHkgPSB0Myh0aGlzLmJsb2NrLCBsZWFkLCB0aGlzLm9wRGVjbGFyZVJlcywgX291dClcblx0XHRjb25zdCBhcmdzID0gdGhpcy5hcmdzLm1hcCh0MClcblx0XHRpc0luR2VuZXJhdG9yID0gb2xkSW5HZW5lcmF0b3Jcblx0XHRjb25zdCBpZCA9IG9wTWFwKHZlcmlmeVJlc3VsdHMub3BOYW1lKHRoaXMpLCBpZENhY2hlZClcblxuXHRcdGNvbnN0IGNhblVzZUFycm93RnVuY3Rpb24gPVxuXHRcdFx0aWQgPT09IG51bGwgJiZcblx0XHRcdHRoaXMub3BEZWNsYXJlVGhpcyA9PT0gbnVsbCAmJlxuXHRcdFx0b3BEZWNsYXJlUmVzdCA9PT0gbnVsbCAmJlxuXHRcdFx0IXRoaXMuaXNHZW5lcmF0b3Jcblx0XHRyZXR1cm4gY2FuVXNlQXJyb3dGdW5jdGlvbiA/XG5cdFx0XHRuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oYXJncywgYm9keSkgOlxuXHRcdFx0bmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihpZCwgYXJncywgYm9keSwgdGhpcy5pc0dlbmVyYXRvcilcblx0fSxcblxuXHRJZ25vcmUoKSB7IHJldHVybiBbXSB9LFxuXG5cdExhenkoKSB7IHJldHVybiBsYXp5V3JhcCh0MCh0aGlzLnZhbHVlKSkgfSxcblxuXHRNZXRob2RJbXBsKGlzU3RhdGljKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSB0MCh0aGlzLmZ1bilcblx0XHRhc3NlcnQodmFsdWUuaWQgPT0gbnVsbClcblx0XHQvLyBTaW5jZSB0aGUgRnVuIHNob3VsZCBoYXZlIG9wRGVjbGFyZVRoaXMsIGl0IHdpbGwgbmV2ZXIgYmUgYW4gQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24uXG5cdFx0YXNzZXJ0KHZhbHVlIGluc3RhbmNlb2YgRnVuY3Rpb25FeHByZXNzaW9uKVxuXG5cdFx0Y29uc3Qge2tleSwgY29tcHV0ZWR9ID0gbWV0aG9kS2V5Q29tcHV0ZWQodGhpcy5zeW1ib2wpXG5cdFx0cmV0dXJuIG5ldyBNZXRob2REZWZpbml0aW9uKGtleSwgdmFsdWUsICdtZXRob2QnLCBpc1N0YXRpYywgY29tcHV0ZWQpXG5cdH0sXG5cdE1ldGhvZEdldHRlcihpc1N0YXRpYykge1xuXHRcdGNvbnN0IHZhbHVlID0gbmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihudWxsLCBbXSwgdDEodGhpcy5ibG9jaywgRGVjbGFyZUxleGljYWxUaGlzKSlcblx0XHRjb25zdCB7a2V5LCBjb21wdXRlZH0gPSBtZXRob2RLZXlDb21wdXRlZCh0aGlzLnN5bWJvbClcblx0XHRyZXR1cm4gbmV3IE1ldGhvZERlZmluaXRpb24oa2V5LCB2YWx1ZSwgJ2dldCcsIGlzU3RhdGljLCBjb21wdXRlZClcblx0fSxcblx0TWV0aG9kU2V0dGVyKGlzU3RhdGljKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFtJZEZvY3VzXSwgdDEodGhpcy5ibG9jaywgRGVjbGFyZUxleGljYWxUaGlzKSlcblx0XHRjb25zdCB7a2V5LCBjb21wdXRlZH0gPSBtZXRob2RLZXlDb21wdXRlZCh0aGlzLnN5bWJvbClcblx0XHRyZXR1cm4gbmV3IE1ldGhvZERlZmluaXRpb24oa2V5LCB2YWx1ZSwgJ3NldCcsIGlzU3RhdGljLCBjb21wdXRlZClcblx0fSxcblxuXHROdW1iZXJMaXRlcmFsKCkge1xuXHRcdC8vIE5lZ2F0aXZlIG51bWJlcnMgYXJlIG5vdCBwYXJ0IG9mIEVTIHNwZWMuXG5cdFx0Ly8gaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzUuMS8jc2VjLTcuOC4zXG5cdFx0Y29uc3QgdmFsdWUgPSBOdW1iZXIodGhpcy52YWx1ZSlcblx0XHRjb25zdCBsaXQgPSBuZXcgTGl0ZXJhbChNYXRoLmFicyh2YWx1ZSkpXG5cdFx0cmV0dXJuIGlzUG9zaXRpdmUodmFsdWUpID8gbGl0IDogbmV3IFVuYXJ5RXhwcmVzc2lvbignLScsIGxpdClcblx0fSxcblxuXHRMb2NhbEFjY2VzcygpIHtcblx0XHRpZiAodGhpcy5uYW1lID09PSAndGhpcycpXG5cdFx0XHRyZXR1cm4gaXNJbkNvbnN0cnVjdG9yID8gbmV3IFRoaXNFeHByZXNzaW9uKCkgOiBJZExleGljYWxUaGlzXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBsZCA9IHZlcmlmeVJlc3VsdHMubG9jYWxEZWNsYXJlRm9yQWNjZXNzKHRoaXMpXG5cdFx0XHQvLyBJZiBsZCBtaXNzaW5nLCB0aGlzIGlzIGEgYnVpbHRpbiwgYW5kIGJ1aWx0aW5zIGFyZSBuZXZlciBsYXp5XG5cdFx0XHRyZXR1cm4gbGQgPT09IHVuZGVmaW5lZCA/IGlkQ2FjaGVkKHRoaXMubmFtZSkgOiBhY2Nlc3NMb2NhbERlY2xhcmUobGQpXG5cdFx0fVxuXHR9LFxuXG5cdExvY2FsRGVjbGFyZSgpIHsgcmV0dXJuIG5ldyBJZGVudGlmaWVyKGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzKS5uYW1lKSB9LFxuXG5cdExvY2FsTXV0YXRlKCkge1xuXHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBpZENhY2hlZCh0aGlzLm5hbWUpLCB0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRMb2dpYygpIHtcblx0XHRhc3NlcnQodGhpcy5raW5kID09PSBMX0FuZCB8fCB0aGlzLmtpbmQgPT09IExfT3IpXG5cdFx0Y29uc3Qgb3AgPSB0aGlzLmtpbmQgPT09IExfQW5kID8gJyYmJyA6ICd8fCdcblx0XHRyZXR1cm4gdGFpbCh0aGlzLmFyZ3MpLnJlZHVjZSgoYSwgYikgPT5cblx0XHRcdG5ldyBMb2dpY2FsRXhwcmVzc2lvbihvcCwgYSwgdDAoYikpLCB0MCh0aGlzLmFyZ3NbMF0pKVxuXHR9LFxuXG5cdE1hcEVudHJ5KCkgeyByZXR1cm4gbXNBc3NvYyhJZEJ1aWx0LCB0MCh0aGlzLmtleSksIHQwKHRoaXMudmFsKSkgfSxcblxuXHRNZW1iZXIoKSB7XG5cdFx0cmV0dXJuIG1lbWJlclN0cmluZ09yVmFsKHQwKHRoaXMub2JqZWN0KSwgdGhpcy5uYW1lKVxuXHR9LFxuXG5cdE1lbWJlclNldCgpIHtcblx0XHRjb25zdCB2YWwgPSBtYXliZVdyYXBJbkNoZWNrQ29udGFpbnModDAodGhpcy52YWx1ZSksIHRoaXMub3BUeXBlLCB0aGlzLm5hbWUpXG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU0VUX0luaXQ6XG5cdFx0XHRcdHJldHVybiBtc05ld1Byb3BlcnR5KHQwKHRoaXMub2JqZWN0KSwgbmV3IExpdGVyYWwodGhpcy5uYW1lKSwgdmFsKVxuXHRcdFx0Y2FzZSBTRVRfSW5pdE11dGFibGU6XG5cdFx0XHRcdHJldHVybiBtc05ld011dGFibGVQcm9wZXJ0eSh0MCh0aGlzLm9iamVjdCksIG5ldyBMaXRlcmFsKHRoaXMubmFtZSksIHZhbClcblx0XHRcdGNhc2UgU0VUX011dGF0ZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlcih0MCh0aGlzLm9iamVjdCksIHRoaXMubmFtZSksIHZhbClcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcigpXG5cdFx0fVxuXHR9LFxuXG5cdE1vZHVsZSgpIHtcblx0XHRjb25zdCBib2R5ID0gdExpbmVzKHRoaXMubGluZXMpXG5cblx0XHR2ZXJpZnlSZXN1bHRzLmJ1aWx0aW5QYXRoVG9OYW1lcy5mb3JFYWNoKChpbXBvcnRlZCwgcGF0aCkgPT4ge1xuXHRcdFx0aWYgKHBhdGggIT09ICdnbG9iYWwnKSB7XG5cdFx0XHRcdGNvbnN0IGltcG9ydGVkRGVjbGFyZXMgPSBbXVxuXHRcdFx0XHRsZXQgb3BJbXBvcnREZWZhdWx0ID0gbnVsbFxuXHRcdFx0XHRsZXQgZGVmYXVsdE5hbWUgPSBsYXN0KHBhdGguc3BsaXQoJy8nKSlcblx0XHRcdFx0Zm9yIChjb25zdCBuYW1lIG9mIGltcG9ydGVkKSB7XG5cdFx0XHRcdFx0Y29uc3QgZGVjbGFyZSA9IExvY2FsRGVjbGFyZS5wbGFpbih0aGlzLmxvYywgbmFtZSlcblx0XHRcdFx0XHRpZiAobmFtZSA9PT0gZGVmYXVsdE5hbWUpXG5cdFx0XHRcdFx0XHRvcEltcG9ydERlZmF1bHQgPSBkZWNsYXJlXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aW1wb3J0ZWREZWNsYXJlcy5wdXNoKGRlY2xhcmUpXG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5pbXBvcnRzLnB1c2gobmV3IEltcG9ydCh0aGlzLmxvYywgcGF0aCwgaW1wb3J0ZWREZWNsYXJlcywgb3BJbXBvcnREZWZhdWx0KSlcblx0XHRcdH1cblx0XHR9KVxuXG5cdFx0Y29uc3QgYW1kID0gYW1kV3JhcE1vZHVsZSh0aGlzLmRvSW1wb3J0cywgdGhpcy5pbXBvcnRzLCBib2R5KVxuXG5cdFx0cmV0dXJuIG5ldyBQcm9ncmFtKGNhdChcblx0XHRcdG9wSWYoY29udGV4dC5vcHRzLmluY2x1ZGVVc2VTdHJpY3QoKSwgKCkgPT4gVXNlU3RyaWN0KSxcblx0XHRcdG9wSWYoY29udGV4dC5vcHRzLmluY2x1ZGVBbWRlZmluZSgpLCAoKSA9PiBBbWRlZmluZUhlYWRlciksXG5cdFx0XHR0b1N0YXRlbWVudChhbWQpKSlcblx0fSxcblxuXHRNb2R1bGVFeHBvcnROYW1lZCgpIHtcblx0XHRyZXR1cm4gdDEodGhpcy5hc3NpZ24sIHZhbCA9PlxuXHRcdFx0bmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyKElkRXhwb3J0cywgdGhpcy5hc3NpZ24uYXNzaWduZWUubmFtZSksIHZhbCkpXG5cdH0sXG5cblx0TW9kdWxlRXhwb3J0RGVmYXVsdCgpIHtcblx0XHRyZXR1cm4gdDEodGhpcy5hc3NpZ24sIHZhbCA9PiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBFeHBvcnRzRGVmYXVsdCwgdmFsKSlcblx0fSxcblxuXHROZXcoKSB7XG5cdFx0Y29uc3QgYW55U3BsYXQgPSB0aGlzLmFyZ3Muc29tZShfID0+IF8gaW5zdGFuY2VvZiBTcGxhdClcblx0XHRjb250ZXh0LmNoZWNrKCFhbnlTcGxhdCwgdGhpcy5sb2MsICdUT0RPOiBTcGxhdCBwYXJhbXMgZm9yIG5ldycpXG5cdFx0cmV0dXJuIG5ldyBOZXdFeHByZXNzaW9uKHQwKHRoaXMudHlwZSksIHRoaXMuYXJncy5tYXAodDApKVxuXHR9LFxuXG5cdE5vdCgpIHsgcmV0dXJuIG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCB0MCh0aGlzLmFyZykpIH0sXG5cblx0T2JqRW50cnlBc3NpZ24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuYXNzaWduIGluc3RhbmNlb2YgQXNzaWduU2luZ2xlICYmICF0aGlzLmFzc2lnbi5hc3NpZ25lZS5pc0xhenkoKSA/XG5cdFx0XHR0MSh0aGlzLmFzc2lnbiwgdmFsID0+XG5cdFx0XHRcdG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlcihJZEJ1aWx0LCB0aGlzLmFzc2lnbi5hc3NpZ25lZS5uYW1lKSwgdmFsKSkgOlxuXHRcdFx0Y2F0KFxuXHRcdFx0XHR0MCh0aGlzLmFzc2lnbiksXG5cdFx0XHRcdHRoaXMuYXNzaWduLmFsbEFzc2lnbmVlcygpLm1hcChfID0+XG5cdFx0XHRcdFx0bXNTZXRMYXp5KElkQnVpbHQsIG5ldyBMaXRlcmFsKF8ubmFtZSksIGlkRm9yRGVjbGFyZUNhY2hlZChfKSkpKVxuXHR9LFxuXG5cdE9iakVudHJ5Q29tcHV0ZWQoKSB7XG5cdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsXG5cdFx0XHRuZXcgTWVtYmVyRXhwcmVzc2lvbihJZEJ1aWx0LCB0MCh0aGlzLmtleSkpLFxuXHRcdFx0dDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0T2JqU2ltcGxlKCkge1xuXHRcdHJldHVybiBuZXcgT2JqZWN0RXhwcmVzc2lvbih0aGlzLnBhaXJzLm1hcChwYWlyID0+XG5cdFx0XHRuZXcgUHJvcGVydHkoJ2luaXQnLCBwcm9wZXJ0eUlkT3JMaXRlcmFsQ2FjaGVkKHBhaXIua2V5KSwgdDAocGFpci52YWx1ZSkpKSlcblx0fSxcblxuXHRRdW90ZSgpIHtcblx0XHRpZiAodGhpcy5wYXJ0cy5sZW5ndGggPT09IDApXG5cdFx0XHRyZXR1cm4gTGl0RW1wdHlTdHJpbmdcblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IHF1YXNpcyA9IFtdLCBleHByZXNzaW9ucyA9IFtdXG5cblx0XHRcdC8vIFRlbXBsYXRlTGl0ZXJhbCBtdXN0IHN0YXJ0IHdpdGggYSBUZW1wbGF0ZUVsZW1lbnRcblx0XHRcdGlmICh0eXBlb2YgdGhpcy5wYXJ0c1swXSAhPT0gJ3N0cmluZycpXG5cdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5FbXB0eSlcblxuXHRcdFx0Zm9yIChsZXQgcGFydCBvZiB0aGlzLnBhcnRzKVxuXHRcdFx0XHRpZiAodHlwZW9mIHBhcnQgPT09ICdzdHJpbmcnKVxuXHRcdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5mb3JSYXdTdHJpbmcocGFydCkpXG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdC8vIFwiezF9ezF9XCIgbmVlZHMgYW4gZW1wdHkgcXVhc2kgaW4gdGhlIG1pZGRsZSAoYW5kIG9uIHRoZSBlbmRzKVxuXHRcdFx0XHRcdGlmIChxdWFzaXMubGVuZ3RoID09PSBleHByZXNzaW9ucy5sZW5ndGgpXG5cdFx0XHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuRW1wdHkpXG5cdFx0XHRcdFx0ZXhwcmVzc2lvbnMucHVzaCh0MChwYXJ0KSlcblx0XHRcdFx0fVxuXG5cdFx0XHQvLyBUZW1wbGF0ZUxpdGVyYWwgbXVzdCBlbmQgd2l0aCBhIFRlbXBsYXRlRWxlbWVudCwgc28gb25lIG1vcmUgcXVhc2kgdGhhbiBleHByZXNzaW9uLlxuXHRcdFx0aWYgKHF1YXNpcy5sZW5ndGggPT09IGV4cHJlc3Npb25zLmxlbmd0aClcblx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LkVtcHR5KVxuXG5cdFx0XHRyZXR1cm4gbmV3IFRlbXBsYXRlTGl0ZXJhbChxdWFzaXMsIGV4cHJlc3Npb25zKVxuXHRcdH1cblx0fSxcblxuXHRRdW90ZVRlbXBsYXRlKCkge1xuXHRcdHJldHVybiBuZXcgVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uKHQwKHRoaXMudGFnKSwgdDAodGhpcy5xdW90ZSkpXG5cdH0sXG5cblx0U2V0U3ViKCkge1xuXHRcdGNvbnN0IGtpbmQgPSAoKCkgPT4ge1xuXHRcdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBTRVRfSW5pdDpcblx0XHRcdFx0XHRyZXR1cm4gJ2luaXQnXG5cdFx0XHRcdGNhc2UgU0VUX0luaXRNdXRhYmxlOlxuXHRcdFx0XHRcdHJldHVybiAnaW5pdC1tdXRhYmxlJ1xuXHRcdFx0XHRjYXNlIFNFVF9NdXRhdGU6XG5cdFx0XHRcdFx0cmV0dXJuICdtdXRhdGUnXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdH1cblx0XHR9KSgpXG5cdFx0cmV0dXJuIG1zU2V0U3ViKFxuXHRcdFx0dDAodGhpcy5vYmplY3QpLFxuXHRcdFx0dGhpcy5zdWJiZWRzLmxlbmd0aCA9PT0gMSA/IHQwKHRoaXMuc3ViYmVkc1swXSkgOiB0aGlzLnN1YmJlZHMubWFwKHQwKSxcblx0XHRcdG1heWJlV3JhcEluQ2hlY2tDb250YWlucyh0MCh0aGlzLnZhbHVlKSwgdGhpcy5vcFR5cGUsICd2YWx1ZScpLFxuXHRcdFx0bmV3IExpdGVyYWwoa2luZCkpXG5cdH0sXG5cblx0U3BlY2lhbERvKCkge1xuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIFNEX0RlYnVnZ2VyOiByZXR1cm4gbmV3IERlYnVnZ2VyU3RhdGVtZW50KClcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcih0aGlzLmtpbmQpXG5cdFx0fVxuXHR9LFxuXG5cdFNwZWNpYWxWYWwoKSB7XG5cdFx0Ly8gTWFrZSBuZXcgb2JqZWN0cyBiZWNhdXNlIHdlIHdpbGwgYXNzaWduIGBsb2NgIHRvIHRoZW0uXG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU1ZfQ29udGFpbnM6IHJldHVybiBtZW1iZXIoSWRNcywgJ2NvbnRhaW5zJylcblx0XHRcdGNhc2UgU1ZfRmFsc2U6IHJldHVybiBuZXcgTGl0ZXJhbChmYWxzZSlcblx0XHRcdGNhc2UgU1ZfTmFtZTogcmV0dXJuIG5ldyBMaXRlcmFsKHZlcmlmeVJlc3VsdHMubmFtZSh0aGlzKSlcblx0XHRcdGNhc2UgU1ZfTnVsbDogcmV0dXJuIG5ldyBMaXRlcmFsKG51bGwpXG5cdFx0XHRjYXNlIFNWX1NldFN1YjogcmV0dXJuIG1lbWJlcihJZE1zLCAnc2V0U3ViJylcblx0XHRcdGNhc2UgU1ZfU3ViOiByZXR1cm4gbWVtYmVyKElkTXMsICdzdWInKVxuXHRcdFx0Y2FzZSBTVl9UcnVlOiByZXR1cm4gbmV3IExpdGVyYWwodHJ1ZSlcblx0XHRcdGNhc2UgU1ZfVW5kZWZpbmVkOiByZXR1cm4gbmV3IFVuYXJ5RXhwcmVzc2lvbigndm9pZCcsIExpdFplcm8pXG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IodGhpcy5raW5kKVxuXHRcdH1cblx0fSxcblxuXHRTcGxhdCgpIHtcblx0XHRyZXR1cm4gbmV3IFNwcmVhZEVsZW1lbnQodDAodGhpcy5zcGxhdHRlZCkpXG5cdH0sXG5cblx0U3VwZXJDYWxsOiBzdXBlckNhbGwsXG5cdFN1cGVyQ2FsbERvOiBzdXBlckNhbGwsXG5cdFN1cGVyTWVtYmVyKCkge1xuXHRcdHJldHVybiBtZW1iZXJTdHJpbmdPclZhbChJZFN1cGVyLCB0aGlzLm5hbWUpXG5cdH0sXG5cblx0U3dpdGNoRG8oKSB7IHJldHVybiB0cmFuc3BpbGVTd2l0Y2godGhpcykgfSxcblx0U3dpdGNoVmFsKCkgeyByZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChbdHJhbnNwaWxlU3dpdGNoKHRoaXMpXSkpIH0sXG5cdFN3aXRjaERvUGFydDogc3dpdGNoUGFydCxcblx0U3dpdGNoVmFsUGFydDogc3dpdGNoUGFydCxcblxuXHRUaHJvdygpIHtcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BUaHJvd24sXG5cdFx0XHRfID0+IGRvVGhyb3coXyksXG5cdFx0XHQoKSA9PiBuZXcgVGhyb3dTdGF0ZW1lbnQobmV3IE5ld0V4cHJlc3Npb24oR2xvYmFsRXJyb3IsIFtMaXRTdHJUaHJvd10pKSlcblx0fSxcblxuXHRXaXRoKCkge1xuXHRcdGNvbnN0IGlkRGVjbGFyZSA9IGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzLmRlY2xhcmUpXG5cdFx0Y29uc3QgYmxvY2sgPSB0Myh0aGlzLmJsb2NrLCBudWxsLCBudWxsLCBuZXcgUmV0dXJuU3RhdGVtZW50KGlkRGVjbGFyZSkpXG5cdFx0Y29uc3QgZnVuID0gaXNJbkdlbmVyYXRvciA/XG5cdFx0XHRuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFtpZERlY2xhcmVdLCBibG9jaywgdHJ1ZSkgOlxuXHRcdFx0bmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKFtpZERlY2xhcmVdLCBibG9jaylcblx0XHRjb25zdCBjYWxsID0gbmV3IENhbGxFeHByZXNzaW9uKGZ1biwgW3QwKHRoaXMudmFsdWUpXSlcblx0XHRyZXR1cm4gaXNJbkdlbmVyYXRvciA/IG5ldyBZaWVsZEV4cHJlc3Npb24oY2FsbCwgdHJ1ZSkgOiBjYWxsXG5cdH0sXG5cblx0WWllbGQoKSB7IHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKG9wTWFwKHRoaXMub3BZaWVsZGVkLCB0MCksIGZhbHNlKSB9LFxuXG5cdFlpZWxkVG8oKSB7IHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKHQwKHRoaXMueWllbGRlZFRvKSwgdHJ1ZSkgfVxufSlcblxuZnVuY3Rpb24gY2FzZVBhcnQoYWx0ZXJuYXRlKSB7XG5cdGlmICh0aGlzLnRlc3QgaW5zdGFuY2VvZiBQYXR0ZXJuKSB7XG5cdFx0Y29uc3Qge3R5cGUsIHBhdHRlcm5lZCwgbG9jYWxzfSA9IHRoaXMudGVzdFxuXHRcdGNvbnN0IGRlY2wgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBbXG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKElkRXh0cmFjdCwgbXNFeHRyYWN0KHQwKHR5cGUpLCB0MChwYXR0ZXJuZWQpKSldKVxuXHRcdGNvbnN0IHRlc3QgPSBuZXcgQmluYXJ5RXhwcmVzc2lvbignIT09JywgSWRFeHRyYWN0LCBMaXROdWxsKVxuXHRcdGNvbnN0IGV4dHJhY3QgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBsb2NhbHMubWFwKChfLCBpZHgpID0+XG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKFxuXHRcdFx0XHRpZEZvckRlY2xhcmVDYWNoZWQoXyksXG5cdFx0XHRcdG5ldyBNZW1iZXJFeHByZXNzaW9uKElkRXh0cmFjdCwgbmV3IExpdGVyYWwoaWR4KSkpKSlcblx0XHRjb25zdCByZXMgPSB0MSh0aGlzLnJlc3VsdCwgZXh0cmFjdClcblx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KFtkZWNsLCBuZXcgSWZTdGF0ZW1lbnQodGVzdCwgcmVzLCBhbHRlcm5hdGUpXSlcblx0fSBlbHNlXG5cdFx0Ly8gYWx0ZXJuYXRlIHdyaXR0ZW4gdG8gYnkgYGNhc2VCb2R5YC5cblx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KHQwKHRoaXMudGVzdCksIHQwKHRoaXMucmVzdWx0KSwgYWx0ZXJuYXRlKVxufVxuXG5mdW5jdGlvbiBzdXBlckNhbGwoKSB7XG5cdGNvbnN0IGFyZ3MgPSB0aGlzLmFyZ3MubWFwKHQwKVxuXHRjb25zdCBtZXRob2QgPSB2ZXJpZnlSZXN1bHRzLnN1cGVyQ2FsbFRvTWV0aG9kLmdldCh0aGlzKVxuXG5cdGlmIChtZXRob2QgaW5zdGFuY2VvZiBDb25zdHJ1Y3Rvcikge1xuXHRcdGNvbnN0IGNhbGwgPSBuZXcgQ2FsbEV4cHJlc3Npb24oSWRTdXBlciwgYXJncylcblx0XHRjb25zdCBtZW1iZXJTZXRzID0gY29uc3RydWN0b3JTZXRNZW1iZXJzKG1ldGhvZClcblx0XHRyZXR1cm4gY2F0KGNhbGwsIG1lbWJlclNldHMpXG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgbSA9IHR5cGVvZiBtZXRob2Quc3ltYm9sID09PSAnc3RyaW5nJyA/XG5cdFx0XHRtZW1iZXIoSWRTdXBlciwgbWV0aG9kLnN5bWJvbCkgOlxuXHRcdFx0bmV3IE1lbWJlckV4cHJlc3Npb24oSWRTdXBlciwgdDAobWV0aG9kLnN5bWJvbCkpXG5cdFx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbihtLCBhcmdzKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHN3aXRjaFBhcnQoKSB7XG5cdGNvbnN0IG9wT3V0ID0gb3BJZih0aGlzIGluc3RhbmNlb2YgU3dpdGNoRG9QYXJ0LCAoKSA9PiBuZXcgQnJlYWtTdGF0ZW1lbnQpXG5cdC8qXG5cdFdlIGNvdWxkIGp1c3QgcGFzcyBibG9jay5ib2R5IGZvciB0aGUgc3dpdGNoIGxpbmVzLCBidXQgaW5zdGVhZFxuXHRlbmNsb3NlIHRoZSBib2R5IG9mIHRoZSBzd2l0Y2ggY2FzZSBpbiBjdXJseSBicmFjZXMgdG8gZW5zdXJlIGEgbmV3IHNjb3BlLlxuXHRUaGF0IHdheSB0aGlzIGNvZGUgd29ya3M6XG5cdFx0c3dpdGNoICgwKSB7XG5cdFx0XHRjYXNlIDA6IHtcblx0XHRcdFx0Y29uc3QgYSA9IDBcblx0XHRcdFx0cmV0dXJuIGFcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0Ly8gV2l0aG91dCBjdXJseSBicmFjZXMgdGhpcyB3b3VsZCBjb25mbGljdCB3aXRoIHRoZSBvdGhlciBgYWAuXG5cdFx0XHRcdGNvbnN0IGEgPSAxXG5cdFx0XHRcdGFcblx0XHRcdH1cblx0XHR9XG5cdCovXG5cdGNvbnN0IGJsb2NrID0gdDModGhpcy5yZXN1bHQsIG51bGwsIG51bGwsIG9wT3V0KVxuXHQvLyBJZiBzd2l0Y2ggaGFzIG11bHRpcGxlIHZhbHVlcywgYnVpbGQgdXAgYSBzdGF0ZW1lbnQgbGlrZTogYGNhc2UgMTogY2FzZSAyOiB7IGRvQmxvY2soKSB9YFxuXHRjb25zdCB4ID0gW11cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnZhbHVlcy5sZW5ndGggLSAxOyBpID0gaSArIDEpXG5cdFx0Ly8gVGhlc2UgY2FzZXMgZmFsbHRocm91Z2ggdG8gdGhlIG9uZSBhdCB0aGUgZW5kLlxuXHRcdHgucHVzaChuZXcgU3dpdGNoQ2FzZSh0MCh0aGlzLnZhbHVlc1tpXSksIFtdKSlcblx0eC5wdXNoKG5ldyBTd2l0Y2hDYXNlKHQwKHRoaXMudmFsdWVzW3RoaXMudmFsdWVzLmxlbmd0aCAtIDFdKSwgW2Jsb2NrXSkpXG5cdHJldHVybiB4XG59XG5cbi8vIEZ1bmN0aW9ucyBzcGVjaWZpYyB0byBjZXJ0YWluIGV4cHJlc3Npb25zLlxuY29uc3Rcblx0Ly8gV3JhcHMgYSBibG9jayAod2l0aCBgcmV0dXJuYCBzdGF0ZW1lbnRzIGluIGl0KSBpbiBhbiBJSUZFLlxuXHRibG9ja1dyYXAgPSBibG9jayA9PiB7XG5cdFx0Y29uc3QgaW52b2tlID0gbmV3IENhbGxFeHByZXNzaW9uKGZ1bmN0aW9uRXhwcmVzc2lvblRodW5rKGJsb2NrLCBpc0luR2VuZXJhdG9yKSwgW10pXG5cdFx0cmV0dXJuIGlzSW5HZW5lcmF0b3IgPyBuZXcgWWllbGRFeHByZXNzaW9uKGludm9rZSwgdHJ1ZSkgOiBpbnZva2Vcblx0fSxcblxuXHRjYXNlQm9keSA9IChwYXJ0cywgb3BFbHNlKSA9PiB7XG5cdFx0bGV0IGFjYyA9IGlmRWxzZShvcEVsc2UsIHQwLCAoKSA9PiBUaHJvd05vQ2FzZU1hdGNoKVxuXHRcdGZvciAobGV0IGkgPSBwYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGkgPSBpIC0gMSlcblx0XHRcdGFjYyA9IHQxKHBhcnRzW2ldLCBhY2MpXG5cdFx0cmV0dXJuIGFjY1xuXHR9LFxuXG5cdGNvbnN0cnVjdG9yU2V0TWVtYmVycyA9IGNvbnN0cnVjdG9yID0+XG5cdFx0Y29uc3RydWN0b3IubWVtYmVyQXJncy5tYXAoXyA9PlxuXHRcdFx0bXNOZXdQcm9wZXJ0eShuZXcgVGhpc0V4cHJlc3Npb24oKSwgbmV3IExpdGVyYWwoXy5uYW1lKSwgaWRGb3JEZWNsYXJlQ2FjaGVkKF8pKSksXG5cblx0Zm9yTG9vcCA9IChvcEl0ZXJhdGVlLCBibG9jaykgPT5cblx0XHRpZkVsc2Uob3BJdGVyYXRlZSxcblx0XHRcdCh7ZWxlbWVudCwgYmFnfSkgPT4ge1xuXHRcdFx0XHRjb25zdCBkZWNsYXJlID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2xldCcsXG5cdFx0XHRcdFx0W25ldyBWYXJpYWJsZURlY2xhcmF0b3IodDAoZWxlbWVudCkpXSlcblx0XHRcdFx0cmV0dXJuIG5ldyBGb3JPZlN0YXRlbWVudChkZWNsYXJlLCB0MChiYWcpLCB0MChibG9jaykpXG5cdFx0XHR9LFxuXHRcdFx0KCkgPT4gZm9yU3RhdGVtZW50SW5maW5pdGUodDAoYmxvY2spKSksXG5cblx0ZG9UaHJvdyA9IHRocm93biA9PlxuXHRcdG5ldyBUaHJvd1N0YXRlbWVudCh0aHJvd24gaW5zdGFuY2VvZiBRdW90ZSA/XG5cdFx0XHRuZXcgTmV3RXhwcmVzc2lvbihHbG9iYWxFcnJvciwgW3QwKHRocm93bildKSA6XG5cdFx0XHR0MCh0aHJvd24pKSxcblxuXHRtZW1iZXJTdHJpbmdPclZhbCA9IChvYmplY3QsIG1lbWJlck5hbWUpID0+XG5cdFx0dHlwZW9mIG1lbWJlck5hbWUgPT09ICdzdHJpbmcnID9cblx0XHRcdG1lbWJlcihvYmplY3QsIG1lbWJlck5hbWUpIDpcblx0XHRcdG5ldyBNZW1iZXJFeHByZXNzaW9uKG9iamVjdCwgdDAobWVtYmVyTmFtZSkpLFxuXG5cdG1ldGhvZEtleUNvbXB1dGVkID0gc3ltYm9sID0+IHtcblx0XHRpZiAodHlwZW9mIHN5bWJvbCA9PT0gJ3N0cmluZycpXG5cdFx0XHRyZXR1cm4ge2tleTogcHJvcGVydHlJZE9yTGl0ZXJhbENhY2hlZChzeW1ib2wpLCBjb21wdXRlZDogZmFsc2V9XG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBrZXkgPSBzeW1ib2wgaW5zdGFuY2VvZiBRdW90ZSA/IHQwKHN5bWJvbCkgOiBtc1N5bWJvbCh0MChzeW1ib2wpKVxuXHRcdFx0cmV0dXJuIHtrZXksIGNvbXB1dGVkOiB0cnVlfVxuXHRcdH1cblx0fSxcblxuXHR0cmFuc3BpbGVCbG9jayA9IChyZXR1cm5lZCwgbGluZXMsIGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpID0+IHtcblx0XHQvLyBUT0RPOkVTNiBPcHRpb25hbCBhcmd1bWVudHNcblx0XHRpZiAobGVhZCA9PT0gdW5kZWZpbmVkKSBsZWFkID0gbnVsbFxuXHRcdGlmIChvcERlY2xhcmVSZXMgPT09IHVuZGVmaW5lZCkgb3BEZWNsYXJlUmVzID0gbnVsbFxuXHRcdGlmIChvcE91dCA9PT0gdW5kZWZpbmVkKSBvcE91dCA9IG51bGxcblx0XHRjb25zdCBmaW4gPSBpZkVsc2Uob3BEZWNsYXJlUmVzLFxuXHRcdFx0cmQgPT4ge1xuXHRcdFx0XHRjb25zdCByZXQgPSBtYXliZVdyYXBJbkNoZWNrQ29udGFpbnMocmV0dXJuZWQsIHJkLm9wVHlwZSwgcmQubmFtZSlcblx0XHRcdFx0cmV0dXJuIGlmRWxzZShvcE91dCxcblx0XHRcdFx0XHRfID0+IGNhdChkZWNsYXJlKHJkLCByZXQpLCBfLCBSZXR1cm5SZXMpLFxuXHRcdFx0XHRcdCgpID0+IG5ldyBSZXR1cm5TdGF0ZW1lbnQocmV0KSlcblx0XHRcdH0sXG5cdFx0XHQoKSA9PiBjYXQob3BPdXQsIG5ldyBSZXR1cm5TdGF0ZW1lbnQocmV0dXJuZWQpKSlcblx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChsZWFkLCBsaW5lcywgZmluKSlcblx0fSxcblxuXHR0cmFuc3BpbGVFeGNlcHQgPSBleGNlcHQgPT5cblx0XHRuZXcgVHJ5U3RhdGVtZW50KFxuXHRcdFx0dDAoZXhjZXB0Ll90cnkpLFxuXHRcdFx0b3BNYXAoZXhjZXB0Ll9jYXRjaCwgdDApLFxuXHRcdFx0b3BNYXAoZXhjZXB0Ll9maW5hbGx5LCB0MCkpLFxuXG5cdHRyYW5zcGlsZVN3aXRjaCA9IF8gPT4ge1xuXHRcdGNvbnN0IHBhcnRzID0gZmxhdE1hcChfLnBhcnRzLCB0MClcblx0XHRwYXJ0cy5wdXNoKGlmRWxzZShfLm9wRWxzZSxcblx0XHRcdF8gPT4gbmV3IFN3aXRjaENhc2UodW5kZWZpbmVkLCB0MChfKS5ib2R5KSxcblx0XHRcdCgpID0+IFN3aXRjaENhc2VOb01hdGNoKSlcblx0XHRyZXR1cm4gbmV3IFN3aXRjaFN0YXRlbWVudCh0MChfLnN3aXRjaGVkKSwgcGFydHMpXG5cdH1cblxuY29uc3QgSWRCb290ID0gbmV3IElkZW50aWZpZXIoJ19ib290JylcblxuLy8gTW9kdWxlIGhlbHBlcnNcbmNvbnN0XG5cdGFtZFdyYXBNb2R1bGUgPSAoZG9JbXBvcnRzLCBpbXBvcnRzLCBib2R5KSA9PiB7XG5cdFx0Y29uc3Qgc2hvdWxkSW1wb3J0Qm9vdCA9IGNvbnRleHQub3B0cy5pbXBvcnRCb290KClcblxuXHRcdGNvbnN0IGFsbEltcG9ydHMgPSBkb0ltcG9ydHMuY29uY2F0KGltcG9ydHMpXG5cdFx0Y29uc3QgYWxsSW1wb3J0UGF0aHMgPSBhbGxJbXBvcnRzLm1hcChfID0+IG1hbmdsZVBhdGgoXy5wYXRoKSlcblxuXHRcdGNvbnN0IGFyckltcG9ydFBhdGhzID0gbmV3IEFycmF5RXhwcmVzc2lvbihjYXQoXG5cdFx0XHRvcElmKHNob3VsZEltcG9ydEJvb3QsICgpID0+IG5ldyBMaXRlcmFsKGNvbnRleHQub3B0cy5ib290UGF0aCgpKSksXG5cdFx0XHRMaXRTdHJFeHBvcnRzLFxuXHRcdFx0YWxsSW1wb3J0UGF0aHMubWFwKF8gPT4gbmV3IExpdGVyYWwoXykpKSlcblxuXHRcdGNvbnN0IGltcG9ydFRvSWRlbnRpZmllciA9IG5ldyBNYXAoKVxuXHRcdGNvbnN0IGltcG9ydElkZW50aWZpZXJzID0gW11cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFsbEltcG9ydHMubGVuZ3RoOyBpID0gaSArIDEpIHtcblx0XHRcdGNvbnN0IF8gPSBhbGxJbXBvcnRzW2ldXG5cdFx0XHRjb25zdCBpZCA9IGlkQ2FjaGVkKGAke3BhdGhCYXNlTmFtZShfLnBhdGgpfV8ke2l9YClcblx0XHRcdGltcG9ydElkZW50aWZpZXJzLnB1c2goaWQpXG5cdFx0XHRpbXBvcnRUb0lkZW50aWZpZXIuc2V0KF8sIGlkKVxuXHRcdH1cblxuXHRcdGNvbnN0IGltcG9ydEFyZ3MgPSBjYXQob3BJZihzaG91bGRJbXBvcnRCb290LCAoKSA9PiBJZEJvb3QpLCBJZEV4cG9ydHMsIGltcG9ydElkZW50aWZpZXJzKVxuXG5cdFx0Y29uc3QgZG9Cb290ID0gb3BJZihzaG91bGRJbXBvcnRCb290LCAoKSA9PiBuZXcgRXhwcmVzc2lvblN0YXRlbWVudChtc0dldE1vZHVsZShJZEJvb3QpKSlcblxuXHRcdGNvbnN0IGltcG9ydERvcyA9IGRvSW1wb3J0cy5tYXAoXyA9PlxuXHRcdFx0bG9jKG5ldyBFeHByZXNzaW9uU3RhdGVtZW50KG1zR2V0TW9kdWxlKGltcG9ydFRvSWRlbnRpZmllci5nZXQoXykpKSwgXy5sb2MpKVxuXG5cdFx0Ly8gRXh0cmFjdHMgaW1wb3J0ZWQgdmFsdWVzIGZyb20gdGhlIG1vZHVsZXMuXG5cdFx0Y29uc3Qgb3BEZWNsYXJlSW1wb3J0ZWRMb2NhbHMgPSBvcElmKCFpc0VtcHR5KGltcG9ydHMpLFxuXHRcdFx0KCkgPT4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0Jyxcblx0XHRcdFx0ZmxhdE1hcChpbXBvcnRzLCBfID0+IGltcG9ydERlY2xhcmF0b3JzKF8sIGltcG9ydFRvSWRlbnRpZmllci5nZXQoXykpKSkpXG5cblx0XHRjb25zdCBmdWxsQm9keSA9IG5ldyBCbG9ja1N0YXRlbWVudChjYXQoXG5cdFx0XHRkb0Jvb3QsIGltcG9ydERvcywgb3BEZWNsYXJlSW1wb3J0ZWRMb2NhbHMsIGJvZHksIFJldHVybkV4cG9ydHMpKVxuXG5cdFx0Y29uc3QgbGF6eUJvZHkgPVxuXHRcdFx0Y29udGV4dC5vcHRzLmxhenlNb2R1bGUoKSA/XG5cdFx0XHRcdG5ldyBCbG9ja1N0YXRlbWVudChbbmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQoXG5cdFx0XHRcdFx0bmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgRXhwb3J0c0dldCxcblx0XHRcdFx0XHRcdG1zTGF6eShmdW5jdGlvbkV4cHJlc3Npb25UaHVuayhmdWxsQm9keSkpKSldKSA6XG5cdFx0XHRcdGZ1bGxCb2R5XG5cblx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKElkRGVmaW5lLFxuXHRcdFx0W2FyckltcG9ydFBhdGhzLCBuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oaW1wb3J0QXJncywgbGF6eUJvZHkpXSlcblx0fSxcblxuXHRwYXRoQmFzZU5hbWUgPSBwYXRoID0+XG5cdFx0cGF0aC5zdWJzdHIocGF0aC5sYXN0SW5kZXhPZignLycpICsgMSksXG5cblx0aW1wb3J0RGVjbGFyYXRvcnMgPSAoe2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9LCBtb2R1bGVJZGVudGlmaWVyKSA9PiB7XG5cdFx0Ly8gVE9ETzogQ291bGQgYmUgbmVhdGVyIGFib3V0IHRoaXNcblx0XHRjb25zdCBpc0xhenkgPSAoaXNFbXB0eShpbXBvcnRlZCkgPyBvcEltcG9ydERlZmF1bHQgOiBpbXBvcnRlZFswXSkuaXNMYXp5KClcblx0XHRjb25zdCB2YWx1ZSA9IChpc0xhenkgPyBtc0xhenlHZXRNb2R1bGUgOiBtc0dldE1vZHVsZSkobW9kdWxlSWRlbnRpZmllcilcblxuXHRcdGNvbnN0IGltcG9ydGVkRGVmYXVsdCA9IG9wTWFwKG9wSW1wb3J0RGVmYXVsdCwgZGVmID0+IHtcblx0XHRcdGNvbnN0IGRlZmV4cCA9IG1zR2V0RGVmYXVsdEV4cG9ydChtb2R1bGVJZGVudGlmaWVyKVxuXHRcdFx0Y29uc3QgdmFsID0gaXNMYXp5ID8gbGF6eVdyYXAoZGVmZXhwKSA6IGRlZmV4cFxuXHRcdFx0cmV0dXJuIGxvYyhuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRm9yRGVjbGFyZUNhY2hlZChkZWYpLCB2YWwpLCBkZWYubG9jKVxuXHRcdH0pXG5cblx0XHRjb25zdCBpbXBvcnRlZERlc3RydWN0ID0gaXNFbXB0eShpbXBvcnRlZCkgPyBudWxsIDpcblx0XHRcdG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzKGltcG9ydGVkLCBpc0xhenksIHZhbHVlLCB0cnVlLCBmYWxzZSlcblxuXHRcdHJldHVybiBjYXQoaW1wb3J0ZWREZWZhdWx0LCBpbXBvcnRlZERlc3RydWN0KVxuXHR9XG5cbi8vIEdlbmVyYWwgdXRpbHMuIE5vdCBpbiB1dGlsLmpzIGJlY2F1c2UgdGhlc2UgY2xvc2Ugb3ZlciBjb250ZXh0LlxuY29uc3Rcblx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMgPSAoYXNzaWduZWVzLCBpc0xhenksIHZhbHVlLCBpc01vZHVsZSkgPT4ge1xuXHRcdGNvbnN0IGRlc3RydWN0dXJlZE5hbWUgPSBgXyQke25leHREZXN0cnVjdHVyZWRJZH1gXG5cdFx0bmV4dERlc3RydWN0dXJlZElkID0gbmV4dERlc3RydWN0dXJlZElkICsgMVxuXHRcdGNvbnN0IGlkRGVzdHJ1Y3R1cmVkID0gbmV3IElkZW50aWZpZXIoZGVzdHJ1Y3R1cmVkTmFtZSlcblx0XHRjb25zdCBkZWNsYXJhdG9ycyA9IGFzc2lnbmVlcy5tYXAoYXNzaWduZWUgPT4ge1xuXHRcdFx0Ly8gVE9ETzogRG9uJ3QgY29tcGlsZSBpdCBpZiBpdCdzIG5ldmVyIGFjY2Vzc2VkXG5cdFx0XHRjb25zdCBnZXQgPSBnZXRNZW1iZXIoaWREZXN0cnVjdHVyZWQsIGFzc2lnbmVlLm5hbWUsIGlzTGF6eSwgaXNNb2R1bGUpXG5cdFx0XHRyZXR1cm4gbWFrZURlY2xhcmF0b3IoYXNzaWduZWUsIGdldCwgaXNMYXp5KVxuXHRcdH0pXG5cdFx0Ly8gR2V0dGluZyBsYXp5IG1vZHVsZSBpcyBkb25lIGJ5IG1zLmxhenlHZXRNb2R1bGUuXG5cdFx0Y29uc3QgdmFsID0gaXNMYXp5ICYmICFpc01vZHVsZSA/IGxhenlXcmFwKHZhbHVlKSA6IHZhbHVlXG5cdFx0cmV0dXJuIGNhdChuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRGVzdHJ1Y3R1cmVkLCB2YWwpLCBkZWNsYXJhdG9ycylcblx0fSxcblxuXHRtYWtlRGVjbGFyYXRvciA9IChhc3NpZ25lZSwgdmFsdWUsIHZhbHVlSXNBbHJlYWR5TGF6eSkgPT4ge1xuXHRcdGNvbnN0IHtuYW1lLCBvcFR5cGV9ID0gYXNzaWduZWVcblx0XHRjb25zdCBpc0xhenkgPSBhc3NpZ25lZS5pc0xhenkoKVxuXHRcdC8vIFRPRE86IGFzc2VydChhc3NpZ25lZS5vcFR5cGUgPT09IG51bGwpXG5cdFx0Ly8gb3IgVE9ETzogQWxsb3cgdHlwZSBjaGVjayBvbiBsYXp5IHZhbHVlP1xuXHRcdHZhbHVlID0gaXNMYXp5ID8gdmFsdWUgOiBtYXliZVdyYXBJbkNoZWNrQ29udGFpbnModmFsdWUsIG9wVHlwZSwgbmFtZSlcblx0XHRjb25zdCB2YWwgPSBpc0xhenkgJiYgIXZhbHVlSXNBbHJlYWR5TGF6eSA/IGxhenlXcmFwKHZhbHVlKSA6IHZhbHVlXG5cdFx0YXNzZXJ0KGlzTGF6eSB8fCAhdmFsdWVJc0FscmVhZHlMYXp5KVxuXHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRm9yRGVjbGFyZUNhY2hlZChhc3NpZ25lZSksIHZhbClcblx0fSxcblxuXHRtYXliZVdyYXBJbkNoZWNrQ29udGFpbnMgPSAoYXN0LCBvcFR5cGUsIG5hbWUpID0+XG5cdFx0IGNvbnRleHQub3B0cy5pbmNsdWRlQ2hlY2tzKCkgJiYgb3BUeXBlICE9PSBudWxsID9cblx0XHRcdG1zQ2hlY2tDb250YWlucyh0MChvcFR5cGUpLCBhc3QsIG5ldyBMaXRlcmFsKG5hbWUpKSA6XG5cdFx0XHRhc3QsXG5cblx0Z2V0TWVtYmVyID0gKGFzdE9iamVjdCwgZ290TmFtZSwgaXNMYXp5LCBpc01vZHVsZSkgPT5cblx0XHRpc0xhenkgP1xuXHRcdG1zTGF6eUdldChhc3RPYmplY3QsIG5ldyBMaXRlcmFsKGdvdE5hbWUpKSA6XG5cdFx0aXNNb2R1bGUgJiYgY29udGV4dC5vcHRzLmluY2x1ZGVDaGVja3MoKSA/XG5cdFx0bXNHZXQoYXN0T2JqZWN0LCBuZXcgTGl0ZXJhbChnb3ROYW1lKSkgOlxuXHRcdG1lbWJlcihhc3RPYmplY3QsIGdvdE5hbWUpXG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

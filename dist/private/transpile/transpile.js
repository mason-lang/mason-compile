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
			const obj = t0(this.object);
			const name = () => typeof this.name === 'string' ? new _esastDistAst.Literal(this.name) : t0(this.name);
			const val = maybeWrapInCheckContains(t0(this.value), this.opType, this.name);
			switch (this.kind) {
				case _MsAst.SET_Init:
					return (0, _msCall.msNewProperty)(obj, name(), val);
				case _MsAst.SET_InitMutable:
					return (0, _msCall.msNewMutableProperty)(obj, name(), val);
				case _MsAst.SET_Mutate:
					return new _esastDistAst.AssignmentExpression('=', memberStringOrVal(obj, this.name), val);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zcGlsZS5qcyIsInByaXZhdGUvdHJhbnNwaWxlL3RyYW5zcGlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztBQzhCQSxLQUFJLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLGVBQWUsQ0FBQTtBQUMxRCxLQUFJLGtCQUFrQixDQUFBOzttQkFFUCxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLEtBQUs7QUFDOUQsU0FBTyxHQUFHLFFBQVEsQ0FBQTtBQUNsQixlQUFhLEdBQUcsY0FBYyxDQUFBO0FBQzlCLGVBQWEsR0FBRyxLQUFLLENBQUE7QUFDckIsaUJBQWUsR0FBRyxLQUFLLENBQUE7QUFDdkIsb0JBQWtCLEdBQUcsQ0FBQyxDQUFBO0FBQ3RCLFFBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBOztBQUVoQyxTQUFPLEdBQUcsYUFBYSxHQUFHLFNBQVMsQ0FBQTtBQUNuQyxTQUFPLEdBQUcsQ0FBQTtFQUNWOztBQUVNLE9BQ04sRUFBRSxHQUFHLElBQUksSUFBSSxtQkF0QzZCLEdBQUcsRUFzQzVCLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7O0FBQzdDLE9BQ0MsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsS0FBSyxtQkF4Q3NCLEdBQUcsRUF3Q3JCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQztPQUN0RCxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEtBQUssbUJBekNVLEdBQUcsRUF5Q1QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7T0FDOUUsTUFBTSxHQUFHLEtBQUssSUFBSTtBQUNqQixRQUFNLEdBQUcsR0FBRyxF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QUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxLQUMzQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLE1BQU0sS0FBSyxJQUFJLEdBQy9DLFlBcHZCMEIsZUFBZSxFQW92QnpCLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLEVBQUUsa0JBendCVSxPQUFPLENBeXdCTCxJQUFJLENBQUMsQ0FBQyxHQUNuRCxHQUFHO09BRUwsU0FBUyxHQUFHLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxLQUNoRCxNQUFNLEdBQ04sWUF4dkJPLFNBQVMsRUF3dkJOLFNBQVMsRUFBRSxrQkE5d0J1QixPQUFPLENBOHdCbEIsT0FBTyxDQUFDLENBQUMsR0FDMUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEdBQ3hDLFlBM3ZCdUQsS0FBSyxFQTJ2QnRELFNBQVMsRUFBRSxrQkFoeEIyQixPQUFPLENBZ3hCdEIsT0FBTyxDQUFDLENBQUMsR0FDdEMsbUJBNXdCOEMsTUFBTSxFQTR3QjdDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQSIsImZpbGUiOiJwcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7QXJyYXlFeHByZXNzaW9uLCBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbiwgQXNzaWdubWVudEV4cHJlc3Npb24sIEJpbmFyeUV4cHJlc3Npb24sXG5cdEJsb2NrU3RhdGVtZW50LCBCcmVha1N0YXRlbWVudCwgQ2FsbEV4cHJlc3Npb24sIENhdGNoQ2xhdXNlLCBDbGFzc0JvZHksIENsYXNzRXhwcmVzc2lvbixcblx0Q29uZGl0aW9uYWxFeHByZXNzaW9uLCBEZWJ1Z2dlclN0YXRlbWVudCwgRXhwcmVzc2lvblN0YXRlbWVudCwgRm9yT2ZTdGF0ZW1lbnQsXG5cdEZ1bmN0aW9uRXhwcmVzc2lvbiwgSWRlbnRpZmllciwgSWZTdGF0ZW1lbnQsIExpdGVyYWwsIExvZ2ljYWxFeHByZXNzaW9uLCBNZW1iZXJFeHByZXNzaW9uLFxuXHRNZXRob2REZWZpbml0aW9uLCBOZXdFeHByZXNzaW9uLCBPYmplY3RFeHByZXNzaW9uLCBQcm9ncmFtLCBQcm9wZXJ0eSwgUmV0dXJuU3RhdGVtZW50LFxuXHRTcHJlYWRFbGVtZW50LCBTd2l0Y2hDYXNlLCBTd2l0Y2hTdGF0ZW1lbnQsIFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbiwgVGVtcGxhdGVFbGVtZW50LFxuXHRUZW1wbGF0ZUxpdGVyYWwsIFRoaXNFeHByZXNzaW9uLCBUaHJvd1N0YXRlbWVudCwgVHJ5U3RhdGVtZW50LCBWYXJpYWJsZURlY2xhcmF0aW9uLFxuXHRVbmFyeUV4cHJlc3Npb24sIFZhcmlhYmxlRGVjbGFyYXRvciwgWWllbGRFeHByZXNzaW9ufSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7ZnVuY3Rpb25FeHByZXNzaW9uVGh1bmssIGlkQ2FjaGVkLCBsb2MsIG1lbWJlciwgcHJvcGVydHlJZE9yTGl0ZXJhbENhY2hlZCwgdG9TdGF0ZW1lbnRcblx0fSBmcm9tICdlc2FzdC9kaXN0L3V0aWwnXG5pbXBvcnQgbWFuZ2xlUGF0aCBmcm9tICcuLi9tYW5nbGVQYXRoJ1xuaW1wb3J0ICogYXMgTXNBc3RUeXBlcyBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7QXNzaWduU2luZ2xlLCBDYWxsLCBDb25zdHJ1Y3RvciwgTF9BbmQsIExfT3IsIExEX0xhenksIExEX011dGFibGUsIE1lbWJlciwgTG9jYWxEZWNsYXJlLFxuXHRQYXR0ZXJuLCBTcGxhdCwgU0RfRGVidWdnZXIsIFNFVF9Jbml0LCBTRVRfSW5pdE11dGFibGUsIFNFVF9NdXRhdGUsIFNWX0NvbnRhaW5zLCBTVl9GYWxzZSxcblx0U1ZfTmFtZSwgU1ZfTnVsbCwgU1ZfU2V0U3ViLCBTVl9TdWIsIFNWX1RydWUsIFNWX1VuZGVmaW5lZCwgU3dpdGNoRG9QYXJ0LCBRdW90ZSwgSW1wb3J0XG5cdH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2Fzc2VydCwgY2F0LCBmbGF0TWFwLCBmbGF0T3BNYXAsIGlmRWxzZSwgaXNFbXB0eSwgaW1wbGVtZW50TWFueSwgaXNQb3NpdGl2ZSwgbGFzdCwgb3BJZixcblx0b3BNYXAsIHRhaWx9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0FtZGVmaW5lSGVhZGVyLCBBcnJheVNsaWNlQ2FsbCwgRGVjbGFyZUJ1aWx0QmFnLCBEZWNsYXJlQnVpbHRNYXAsIERlY2xhcmVCdWlsdE9iaixcblx0RGVjbGFyZUxleGljYWxUaGlzLCBFeHBvcnRzRGVmYXVsdCwgRXhwb3J0c0dldCwgSWRBcmd1bWVudHMsIElkQnVpbHQsIElkQ29uc3RydWN0b3IsIElkRGVmaW5lLFxuXHRJZEV4cG9ydHMsIElkRXh0cmFjdCwgSWRGb2N1cywgSWRMZXhpY2FsVGhpcywgSWRTdXBlciwgR2xvYmFsRXJyb3IsIExpdEVtcHR5U3RyaW5nLCBMaXROdWxsLFxuXHRMaXRTdHJFeHBvcnRzLCBMaXRTdHJUaHJvdywgTGl0WmVybywgUmV0dXJuQnVpbHQsIFJldHVybkV4cG9ydHMsIFJldHVyblJlcywgU3dpdGNoQ2FzZU5vTWF0Y2gsXG5cdFRocm93QXNzZXJ0RmFpbCwgVGhyb3dOb0Nhc2VNYXRjaCwgVXNlU3RyaWN0fSBmcm9tICcuL2FzdC1jb25zdGFudHMnXG5pbXBvcnQge0lkTXMsIGxhenlXcmFwLCBtc0FkZCwgbXNBZGRNYW55LCBtc0Fzc2VydCwgbXNBc3NlcnRNZW1iZXIsIG1zQXNzZXJ0Tm90LFxuXHRtc0Fzc2VydE5vdE1lbWJlciwgbXNBc3NvYywgbXNDaGVja0NvbnRhaW5zLCBtc0V4dHJhY3QsIG1zR2V0LCBtc0dldERlZmF1bHRFeHBvcnQsIG1zR2V0TW9kdWxlLFxuXHRtc0xhenksIG1zTGF6eUdldCwgbXNMYXp5R2V0TW9kdWxlLCBtc05ld011dGFibGVQcm9wZXJ0eSwgbXNOZXdQcm9wZXJ0eSwgbXNTZXRMYXp5LCBtc1NldFN1Yixcblx0bXNTb21lLCBtc1N5bWJvbCwgTXNOb25lfSBmcm9tICcuL21zLWNhbGwnXG5pbXBvcnQge2FjY2Vzc0xvY2FsRGVjbGFyZSwgZGVjbGFyZSwgZm9yU3RhdGVtZW50SW5maW5pdGUsIGlkRm9yRGVjbGFyZUNhY2hlZCxcblx0b3BUeXBlQ2hlY2tGb3JMb2NhbERlY2xhcmV9IGZyb20gJy4vdXRpbCdcblxubGV0IGNvbnRleHQsIHZlcmlmeVJlc3VsdHMsIGlzSW5HZW5lcmF0b3IsIGlzSW5Db25zdHJ1Y3RvclxubGV0IG5leHREZXN0cnVjdHVyZWRJZFxuXG5leHBvcnQgZGVmYXVsdCAoX2NvbnRleHQsIG1vZHVsZUV4cHJlc3Npb24sIF92ZXJpZnlSZXN1bHRzKSA9PiB7XG5cdGNvbnRleHQgPSBfY29udGV4dFxuXHR2ZXJpZnlSZXN1bHRzID0gX3ZlcmlmeVJlc3VsdHNcblx0aXNJbkdlbmVyYXRvciA9IGZhbHNlXG5cdGlzSW5Db25zdHJ1Y3RvciA9IGZhbHNlXG5cdG5leHREZXN0cnVjdHVyZWRJZCA9IDBcblx0Y29uc3QgcmVzID0gdDAobW9kdWxlRXhwcmVzc2lvbilcblx0Ly8gUmVsZWFzZSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuXHRjb250ZXh0ID0gdmVyaWZ5UmVzdWx0cyA9IHVuZGVmaW5lZFxuXHRyZXR1cm4gcmVzXG59XG5cbmV4cG9ydCBjb25zdFxuXHR0MCA9IGV4cHIgPT4gbG9jKGV4cHIudHJhbnNwaWxlKCksIGV4cHIubG9jKVxuY29uc3Rcblx0dDEgPSAoZXhwciwgYXJnKSA9PiBsb2MoZXhwci50cmFuc3BpbGUoYXJnKSwgZXhwci5sb2MpLFxuXHR0MyA9IChleHByLCBhcmcsIGFyZzIsIGFyZzMpID0+IGxvYyhleHByLnRyYW5zcGlsZShhcmcsIGFyZzIsIGFyZzMpLCBleHByLmxvYyksXG5cdHRMaW5lcyA9IGV4cHJzID0+IHtcblx0XHRjb25zdCBvdXQgPSBbXVxuXHRcdGZvciAoY29uc3QgZXhwciBvZiBleHBycykge1xuXHRcdFx0Y29uc3QgYXN0ID0gZXhwci50cmFuc3BpbGUoKVxuXHRcdFx0aWYgKGFzdCBpbnN0YW5jZW9mIEFycmF5KVxuXHRcdFx0XHQvLyBJZ25vcmUgcHJvZHVjZXMgMCBzdGF0ZW1lbnRzIGFuZCBSZWdpb24gcHJvZHVjZXMgbWFueS5cblx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIGFzdClcblx0XHRcdFx0XHRvdXQucHVzaCh0b1N0YXRlbWVudChfKSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0b3V0LnB1c2gobG9jKHRvU3RhdGVtZW50KGFzdCksIGV4cHIubG9jKSlcblx0XHR9XG5cdFx0cmV0dXJuIG91dFxuXHR9XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ3RyYW5zcGlsZScsIHtcblx0QXNzZXJ0KCkge1xuXHRcdGNvbnN0IGZhaWxDb25kID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgY29uZCA9IHQwKHRoaXMuY29uZGl0aW9uKVxuXHRcdFx0cmV0dXJuIHRoaXMubmVnYXRlID8gY29uZCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCBjb25kKVxuXHRcdH1cblxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcFRocm93bixcblx0XHRcdF8gPT4gbmV3IElmU3RhdGVtZW50KGZhaWxDb25kKCksIGRvVGhyb3coXykpLFxuXHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5jb25kaXRpb24gaW5zdGFuY2VvZiBDYWxsKSB7XG5cdFx0XHRcdFx0Y29uc3QgY2FsbCA9IHRoaXMuY29uZGl0aW9uXG5cdFx0XHRcdFx0Y29uc3QgY2FsbGVkID0gY2FsbC5jYWxsZWRcblx0XHRcdFx0XHRjb25zdCBhcmdzID0gY2FsbC5hcmdzLm1hcCh0MClcblx0XHRcdFx0XHRpZiAoY2FsbGVkIGluc3RhbmNlb2YgTWVtYmVyKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBhc3MgPSB0aGlzLm5lZ2F0ZSA/IG1zQXNzZXJ0Tm90TWVtYmVyIDogbXNBc3NlcnRNZW1iZXJcblx0XHRcdFx0XHRcdHJldHVybiBhc3ModDAoY2FsbGVkLm9iamVjdCksIG5ldyBMaXRlcmFsKGNhbGxlZC5uYW1lKSwgLi4uYXJncylcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc3QgYXNzID0gdGhpcy5uZWdhdGUgPyBtc0Fzc2VydE5vdCA6IG1zQXNzZXJ0XG5cdFx0XHRcdFx0XHRyZXR1cm4gYXNzKHQwKGNhbGxlZCksIC4uLmFyZ3MpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KGZhaWxDb25kKCksIFRocm93QXNzZXJ0RmFpbClcblx0XHRcdH0pXG5cdH0sXG5cblx0QXNzaWduU2luZ2xlKHZhbFdyYXApIHtcblx0XHRjb25zdCB2YWwgPSB2YWxXcmFwID09PSB1bmRlZmluZWQgPyB0MCh0aGlzLnZhbHVlKSA6IHZhbFdyYXAodDAodGhpcy52YWx1ZSkpXG5cdFx0Y29uc3QgZGVjbGFyZSA9IG1ha2VEZWNsYXJhdG9yKHRoaXMuYXNzaWduZWUsIHZhbCwgZmFsc2UpXG5cdFx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKHRoaXMuYXNzaWduZWUuaXNNdXRhYmxlKCkgPyAnbGV0JyA6ICdjb25zdCcsIFtkZWNsYXJlXSlcblx0fSxcblx0Ly8gVE9ETzpFUzYgSnVzdCB1c2UgbmF0aXZlIGRlc3RydWN0dXJpbmcgYXNzaWduXG5cdEFzc2lnbkRlc3RydWN0dXJlKCkge1xuXHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbihcblx0XHRcdHRoaXMua2luZCgpID09PSBMRF9NdXRhYmxlID8gJ2xldCcgOiAnY29uc3QnLFxuXHRcdFx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMoXG5cdFx0XHRcdHRoaXMuYXNzaWduZWVzLFxuXHRcdFx0XHR0aGlzLmtpbmQoKSA9PT0gTERfTGF6eSxcblx0XHRcdFx0dDAodGhpcy52YWx1ZSksXG5cdFx0XHRcdGZhbHNlKSlcblx0fSxcblxuXHRCYWdFbnRyeSgpIHsgcmV0dXJuIG1zQWRkKElkQnVpbHQsIHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdEJhZ0VudHJ5TWFueSgpIHsgcmV0dXJuIG1zQWRkTWFueShJZEJ1aWx0LCB0MCh0aGlzLnZhbHVlKSkgfSxcblxuXHRCYWdTaW1wbGUoKSB7IHJldHVybiBuZXcgQXJyYXlFeHByZXNzaW9uKHRoaXMucGFydHMubWFwKHQwKSkgfSxcblxuXHRCbG9ja0RvKGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpIHtcblx0XHQvLyBUT0RPOkVTNiBPcHRpb25hbCBhcmd1bWVudHNcblx0XHRpZiAobGVhZCA9PT0gdW5kZWZpbmVkKSBsZWFkID0gbnVsbFxuXHRcdGlmIChvcERlY2xhcmVSZXMgPT09IHVuZGVmaW5lZCkgb3BEZWNsYXJlUmVzID0gbnVsbFxuXHRcdGlmIChvcE91dCA9PT0gdW5kZWZpbmVkKSBvcE91dCA9IG51bGxcblx0XHRhc3NlcnQob3BEZWNsYXJlUmVzID09PSBudWxsKVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHRMaW5lcyh0aGlzLmxpbmVzKSwgb3BPdXQpKVxuXHR9LFxuXG5cdEJsb2NrVmFsVGhyb3cobGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkge1xuXHRcdC8vIFRPRE86RVM2IE9wdGlvbmFsIGFyZ3VtZW50c1xuXHRcdGlmIChsZWFkID09PSB1bmRlZmluZWQpIGxlYWQgPSBudWxsXG5cdFx0aWYgKG9wRGVjbGFyZVJlcyA9PT0gdW5kZWZpbmVkKSBvcERlY2xhcmVSZXMgPSBudWxsXG5cdFx0aWYgKG9wT3V0ID09PSB1bmRlZmluZWQpIG9wT3V0ID0gbnVsbFxuXHRcdGNvbnRleHQud2FybklmKG9wRGVjbGFyZVJlcyAhPT0gbnVsbCB8fCBvcE91dCAhPT0gbnVsbCwgdGhpcy5sb2MsXG5cdFx0XHQnT3V0IGNvbmRpdGlvbiBpZ25vcmVkIGJlY2F1c2Ugb2Ygb2gtbm8hJylcblx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChsZWFkLCB0TGluZXModGhpcy5saW5lcyksIHQwKHRoaXMudGhyb3cpKSlcblx0fSxcblxuXHRCbG9ja1dpdGhSZXR1cm4obGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayh0MCh0aGlzLnJldHVybmVkKSwgdExpbmVzKHRoaXMubGluZXMpLCBsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KVxuXHR9LFxuXG5cdEJsb2NrQmFnKGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2soXG5cdFx0XHRJZEJ1aWx0LFxuXHRcdFx0Y2F0KERlY2xhcmVCdWlsdEJhZywgdExpbmVzKHRoaXMubGluZXMpKSxcblx0XHRcdGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpXG5cdH0sXG5cblx0QmxvY2tPYmoobGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayhcblx0XHRcdElkQnVpbHQsXG5cdFx0XHRjYXQoRGVjbGFyZUJ1aWx0T2JqLCB0TGluZXModGhpcy5saW5lcykpLFxuXHRcdFx0bGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dClcblx0fSxcblxuXHRCbG9ja01hcChsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKFxuXHRcdFx0SWRCdWlsdCxcblx0XHRcdGNhdChEZWNsYXJlQnVpbHRNYXAsIHRMaW5lcyh0aGlzLmxpbmVzKSksXG5cdFx0XHRsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KVxuXHR9LFxuXG5cdEJsb2NrV3JhcCgpIHsgcmV0dXJuIGJsb2NrV3JhcCh0MCh0aGlzLmJsb2NrKSkgfSxcblxuXHRCcmVhaygpIHsgcmV0dXJuIG5ldyBCcmVha1N0YXRlbWVudCgpIH0sXG5cblx0QnJlYWtXaXRoVmFsKCkgeyByZXR1cm4gbmV3IFJldHVyblN0YXRlbWVudCh0MCh0aGlzLnZhbHVlKSkgfSxcblxuXHRDYWxsKCkge1xuXHRcdHJldHVybiBuZXcgQ2FsbEV4cHJlc3Npb24odDAodGhpcy5jYWxsZWQpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHRDYXNlRG8oKSB7XG5cdFx0Y29uc3QgYm9keSA9IGNhc2VCb2R5KHRoaXMucGFydHMsIHRoaXMub3BFbHNlKVxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcENhc2VkLCBfID0+IG5ldyBCbG9ja1N0YXRlbWVudChbdDAoXyksIGJvZHldKSwgKCkgPT4gYm9keSlcblx0fSxcblx0Q2FzZVZhbCgpIHtcblx0XHRjb25zdCBib2R5ID0gY2FzZUJvZHkodGhpcy5wYXJ0cywgdGhpcy5vcEVsc2UpXG5cdFx0Y29uc3QgYmxvY2sgPSBpZkVsc2UodGhpcy5vcENhc2VkLCBfID0+IFt0MChfKSwgYm9keV0sICgpID0+IFtib2R5XSlcblx0XHRyZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChibG9jaykpXG5cdH0sXG5cdENhc2VEb1BhcnQ6IGNhc2VQYXJ0LFxuXHRDYXNlVmFsUGFydDogY2FzZVBhcnQsXG5cblx0Q2xhc3MoKSB7XG5cdFx0Y29uc3QgbWV0aG9kcyA9IGNhdChcblx0XHRcdHRoaXMuc3RhdGljcy5tYXAoXyA9PiB0MShfLCB0cnVlKSksXG5cdFx0XHRvcE1hcCh0aGlzLm9wQ29uc3RydWN0b3IsIHQwKSxcblx0XHRcdHRoaXMubWV0aG9kcy5tYXAoXyA9PiB0MShfLCBmYWxzZSkpKVxuXHRcdGNvbnN0IG9wTmFtZSA9IG9wTWFwKHZlcmlmeVJlc3VsdHMub3BOYW1lKHRoaXMpLCBpZENhY2hlZClcblx0XHRjb25zdCBjbGFzc0V4cHIgPSBuZXcgQ2xhc3NFeHByZXNzaW9uKFxuXHRcdFx0b3BOYW1lLFxuXHRcdFx0b3BNYXAodGhpcy5vcFN1cGVyQ2xhc3MsIHQwKSwgbmV3IENsYXNzQm9keShtZXRob2RzKSlcblxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcERvLCBfID0+IHQxKF8sIGNsYXNzRXhwciksICgpID0+IGNsYXNzRXhwcilcblx0fSxcblxuXHRDbGFzc0RvKGNsYXNzRXhwcikge1xuXHRcdGNvbnN0IGxlYWQgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBbXG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKHQwKHRoaXMuZGVjbGFyZUZvY3VzKSwgY2xhc3NFeHByKV0pXG5cdFx0Y29uc3QgcmV0ID0gbmV3IFJldHVyblN0YXRlbWVudCh0MCh0aGlzLmRlY2xhcmVGb2N1cykpXG5cdFx0Y29uc3QgYmxvY2sgPSB0Myh0aGlzLmJsb2NrLCBsZWFkLCBudWxsLCByZXQpXG5cdFx0cmV0dXJuIGJsb2NrV3JhcChibG9jaylcblx0fSxcblxuXHRDb25kKCkge1xuXHRcdHJldHVybiBuZXcgQ29uZGl0aW9uYWxFeHByZXNzaW9uKHQwKHRoaXMudGVzdCksIHQwKHRoaXMuaWZUcnVlKSwgdDAodGhpcy5pZkZhbHNlKSlcblx0fSxcblxuXHRDb25kaXRpb25hbERvKCkge1xuXHRcdGNvbnN0IHRlc3QgPSB0MCh0aGlzLnRlc3QpXG5cdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudChcblx0XHRcdHRoaXMuaXNVbmxlc3MgPyBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgdGVzdCkgOiB0ZXN0LFxuXHRcdFx0dDAodGhpcy5yZXN1bHQpKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsVmFsKCkge1xuXHRcdGNvbnN0IHRlc3QgPSB0MCh0aGlzLnRlc3QpXG5cdFx0Y29uc3QgcmVzdWx0ID0gbXNTb21lKGJsb2NrV3JhcCh0MCh0aGlzLnJlc3VsdCkpKVxuXHRcdHJldHVybiB0aGlzLmlzVW5sZXNzID9cblx0XHRcdG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odGVzdCwgTXNOb25lLCByZXN1bHQpIDpcblx0XHRcdG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odGVzdCwgcmVzdWx0LCBNc05vbmUpXG5cdH0sXG5cblx0Q29uc3RydWN0b3IoKSB7XG5cdFx0aXNJbkNvbnN0cnVjdG9yID0gdHJ1ZVxuXG5cdFx0Ly8gSWYgdGhlcmUgaXMgYSBgc3VwZXIhYCwgYHRoaXNgIHdpbGwgbm90IGJlIGRlZmluZWQgdW50aWwgdGhlbiwgc28gbXVzdCB3YWl0IHVudGlsIHRoZW4uXG5cdFx0Ly8gT3RoZXJ3aXNlLCBkbyBpdCBhdCB0aGUgYmVnaW5uaW5nLlxuXHRcdGNvbnN0IGJvZHkgPSB2ZXJpZnlSZXN1bHRzLmNvbnN0cnVjdG9yVG9TdXBlci5oYXModGhpcykgP1xuXHRcdFx0dDAodGhpcy5mdW4pIDpcblx0XHRcdHQxKHRoaXMuZnVuLCBjb25zdHJ1Y3RvclNldE1lbWJlcnModGhpcykpXG5cblx0XHRjb25zdCByZXMgPSBuZXcgTWV0aG9kRGVmaW5pdGlvbihJZENvbnN0cnVjdG9yLCBib2R5LCAnY29uc3RydWN0b3InLCBmYWxzZSwgZmFsc2UpXG5cdFx0aXNJbkNvbnN0cnVjdG9yID0gZmFsc2Vcblx0XHRyZXR1cm4gcmVzXG5cdH0sXG5cblx0Q2F0Y2goKSB7XG5cdFx0cmV0dXJuIG5ldyBDYXRjaENsYXVzZSh0MCh0aGlzLmNhdWdodCksIHQwKHRoaXMuYmxvY2spKVxuXHR9LFxuXG5cdEV4Y2VwdERvKCkgeyByZXR1cm4gdHJhbnNwaWxlRXhjZXB0KHRoaXMpIH0sXG5cdEV4Y2VwdFZhbCgpIHsgcmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW3RyYW5zcGlsZUV4Y2VwdCh0aGlzKV0pKSB9LFxuXG5cdEZvckRvKCkgeyByZXR1cm4gZm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spIH0sXG5cblx0Rm9yQmFnKCkge1xuXHRcdHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFtcblx0XHRcdERlY2xhcmVCdWlsdEJhZyxcblx0XHRcdGZvckxvb3AodGhpcy5vcEl0ZXJhdGVlLCB0aGlzLmJsb2NrKSxcblx0XHRcdFJldHVybkJ1aWx0XG5cdFx0XSkpXG5cdH0sXG5cblx0Rm9yVmFsKCkge1xuXHRcdHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFtmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jayldKSlcblx0fSxcblxuXHRGdW4obGVhZFN0YXRlbWVudHMpIHtcblx0XHQvLyBUT0RPOkVTNiBPcHRpb25hbCBhcmdzXG5cdFx0aWYgKGxlYWRTdGF0ZW1lbnRzID09PSB1bmRlZmluZWQpXG5cdFx0XHRsZWFkU3RhdGVtZW50cyA9IG51bGxcblxuXHRcdGNvbnN0IG9sZEluR2VuZXJhdG9yID0gaXNJbkdlbmVyYXRvclxuXHRcdGlzSW5HZW5lcmF0b3IgPSB0aGlzLmlzR2VuZXJhdG9yXG5cblx0XHQvLyBUT0RPOkVTNiB1c2UgYC4uLmBmXG5cdFx0Y29uc3QgbkFyZ3MgPSBuZXcgTGl0ZXJhbCh0aGlzLmFyZ3MubGVuZ3RoKVxuXHRcdGNvbnN0IG9wRGVjbGFyZVJlc3QgPSBvcE1hcCh0aGlzLm9wUmVzdEFyZywgcmVzdCA9PlxuXHRcdFx0ZGVjbGFyZShyZXN0LCBuZXcgQ2FsbEV4cHJlc3Npb24oQXJyYXlTbGljZUNhbGwsIFtJZEFyZ3VtZW50cywgbkFyZ3NdKSkpXG5cdFx0Y29uc3QgYXJnQ2hlY2tzID0gb3BJZihjb250ZXh0Lm9wdHMuaW5jbHVkZUNoZWNrcygpLCAoKSA9PlxuXHRcdFx0ZmxhdE9wTWFwKHRoaXMuYXJncywgb3BUeXBlQ2hlY2tGb3JMb2NhbERlY2xhcmUpKVxuXG5cdFx0Y29uc3QgX2luID0gb3BNYXAodGhpcy5vcEluLCB0MClcblxuXHRcdGNvbnN0IG9wRGVjbGFyZVRoaXMgPVxuXHRcdFx0b3BJZighaXNJbkNvbnN0cnVjdG9yICYmIHRoaXMub3BEZWNsYXJlVGhpcyAhPSBudWxsLCAoKSA9PiBEZWNsYXJlTGV4aWNhbFRoaXMpXG5cblx0XHRjb25zdCBsZWFkID0gY2F0KGxlYWRTdGF0ZW1lbnRzLCBvcERlY2xhcmVUaGlzLCBvcERlY2xhcmVSZXN0LCBhcmdDaGVja3MsIF9pbilcblxuXHRcdGNvbnN0IF9vdXQgPSBvcE1hcCh0aGlzLm9wT3V0LCB0MClcblx0XHRjb25zdCBib2R5ID0gdDModGhpcy5ibG9jaywgbGVhZCwgdGhpcy5vcERlY2xhcmVSZXMsIF9vdXQpXG5cdFx0Y29uc3QgYXJncyA9IHRoaXMuYXJncy5tYXAodDApXG5cdFx0aXNJbkdlbmVyYXRvciA9IG9sZEluR2VuZXJhdG9yXG5cdFx0Y29uc3QgaWQgPSBvcE1hcCh2ZXJpZnlSZXN1bHRzLm9wTmFtZSh0aGlzKSwgaWRDYWNoZWQpXG5cblx0XHRjb25zdCBjYW5Vc2VBcnJvd0Z1bmN0aW9uID1cblx0XHRcdGlkID09PSBudWxsICYmXG5cdFx0XHR0aGlzLm9wRGVjbGFyZVRoaXMgPT09IG51bGwgJiZcblx0XHRcdG9wRGVjbGFyZVJlc3QgPT09IG51bGwgJiZcblx0XHRcdCF0aGlzLmlzR2VuZXJhdG9yXG5cdFx0cmV0dXJuIGNhblVzZUFycm93RnVuY3Rpb24gP1xuXHRcdFx0bmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKGFyZ3MsIGJvZHkpIDpcblx0XHRcdG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIGFyZ3MsIGJvZHksIHRoaXMuaXNHZW5lcmF0b3IpXG5cdH0sXG5cblx0SWdub3JlKCkgeyByZXR1cm4gW10gfSxcblxuXHRMYXp5KCkgeyByZXR1cm4gbGF6eVdyYXAodDAodGhpcy52YWx1ZSkpIH0sXG5cblx0TWV0aG9kSW1wbChpc1N0YXRpYykge1xuXHRcdGNvbnN0IHZhbHVlID0gdDAodGhpcy5mdW4pXG5cdFx0YXNzZXJ0KHZhbHVlLmlkID09IG51bGwpXG5cdFx0Ly8gU2luY2UgdGhlIEZ1biBzaG91bGQgaGF2ZSBvcERlY2xhcmVUaGlzLCBpdCB3aWxsIG5ldmVyIGJlIGFuIEFycm93RnVuY3Rpb25FeHByZXNzaW9uLlxuXHRcdGFzc2VydCh2YWx1ZSBpbnN0YW5jZW9mIEZ1bmN0aW9uRXhwcmVzc2lvbilcblxuXHRcdGNvbnN0IHtrZXksIGNvbXB1dGVkfSA9IG1ldGhvZEtleUNvbXB1dGVkKHRoaXMuc3ltYm9sKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kRGVmaW5pdGlvbihrZXksIHZhbHVlLCAnbWV0aG9kJywgaXNTdGF0aWMsIGNvbXB1dGVkKVxuXHR9LFxuXHRNZXRob2RHZXR0ZXIoaXNTdGF0aWMpIHtcblx0XHRjb25zdCB2YWx1ZSA9IG5ldyBGdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgW10sIHQxKHRoaXMuYmxvY2ssIERlY2xhcmVMZXhpY2FsVGhpcykpXG5cdFx0Y29uc3Qge2tleSwgY29tcHV0ZWR9ID0gbWV0aG9kS2V5Q29tcHV0ZWQodGhpcy5zeW1ib2wpXG5cdFx0cmV0dXJuIG5ldyBNZXRob2REZWZpbml0aW9uKGtleSwgdmFsdWUsICdnZXQnLCBpc1N0YXRpYywgY29tcHV0ZWQpXG5cdH0sXG5cdE1ldGhvZFNldHRlcihpc1N0YXRpYykge1xuXHRcdGNvbnN0IHZhbHVlID0gbmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihudWxsLCBbSWRGb2N1c10sIHQxKHRoaXMuYmxvY2ssIERlY2xhcmVMZXhpY2FsVGhpcykpXG5cdFx0Y29uc3Qge2tleSwgY29tcHV0ZWR9ID0gbWV0aG9kS2V5Q29tcHV0ZWQodGhpcy5zeW1ib2wpXG5cdFx0cmV0dXJuIG5ldyBNZXRob2REZWZpbml0aW9uKGtleSwgdmFsdWUsICdzZXQnLCBpc1N0YXRpYywgY29tcHV0ZWQpXG5cdH0sXG5cblx0TnVtYmVyTGl0ZXJhbCgpIHtcblx0XHQvLyBOZWdhdGl2ZSBudW1iZXJzIGFyZSBub3QgcGFydCBvZiBFUyBzcGVjLlxuXHRcdC8vIGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi81LjEvI3NlYy03LjguM1xuXHRcdGNvbnN0IHZhbHVlID0gTnVtYmVyKHRoaXMudmFsdWUpXG5cdFx0Y29uc3QgbGl0ID0gbmV3IExpdGVyYWwoTWF0aC5hYnModmFsdWUpKVxuXHRcdHJldHVybiBpc1Bvc2l0aXZlKHZhbHVlKSA/IGxpdCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJy0nLCBsaXQpXG5cdH0sXG5cblx0TG9jYWxBY2Nlc3MoKSB7XG5cdFx0aWYgKHRoaXMubmFtZSA9PT0gJ3RoaXMnKVxuXHRcdFx0cmV0dXJuIGlzSW5Db25zdHJ1Y3RvciA/IG5ldyBUaGlzRXhwcmVzc2lvbigpIDogSWRMZXhpY2FsVGhpc1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgbGQgPSB2ZXJpZnlSZXN1bHRzLmxvY2FsRGVjbGFyZUZvckFjY2Vzcyh0aGlzKVxuXHRcdFx0Ly8gSWYgbGQgbWlzc2luZywgdGhpcyBpcyBhIGJ1aWx0aW4sIGFuZCBidWlsdGlucyBhcmUgbmV2ZXIgbGF6eVxuXHRcdFx0cmV0dXJuIGxkID09PSB1bmRlZmluZWQgPyBpZENhY2hlZCh0aGlzLm5hbWUpIDogYWNjZXNzTG9jYWxEZWNsYXJlKGxkKVxuXHRcdH1cblx0fSxcblxuXHRMb2NhbERlY2xhcmUoKSB7IHJldHVybiBuZXcgSWRlbnRpZmllcihpZEZvckRlY2xhcmVDYWNoZWQodGhpcykubmFtZSkgfSxcblxuXHRMb2NhbE11dGF0ZSgpIHtcblx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgaWRDYWNoZWQodGhpcy5uYW1lKSwgdDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0TG9naWMoKSB7XG5cdFx0YXNzZXJ0KHRoaXMua2luZCA9PT0gTF9BbmQgfHwgdGhpcy5raW5kID09PSBMX09yKVxuXHRcdGNvbnN0IG9wID0gdGhpcy5raW5kID09PSBMX0FuZCA/ICcmJicgOiAnfHwnXG5cdFx0cmV0dXJuIHRhaWwodGhpcy5hcmdzKS5yZWR1Y2UoKGEsIGIpID0+XG5cdFx0XHRuZXcgTG9naWNhbEV4cHJlc3Npb24ob3AsIGEsIHQwKGIpKSwgdDAodGhpcy5hcmdzWzBdKSlcblx0fSxcblxuXHRNYXBFbnRyeSgpIHsgcmV0dXJuIG1zQXNzb2MoSWRCdWlsdCwgdDAodGhpcy5rZXkpLCB0MCh0aGlzLnZhbCkpIH0sXG5cblx0TWVtYmVyKCkge1xuXHRcdHJldHVybiBtZW1iZXJTdHJpbmdPclZhbCh0MCh0aGlzLm9iamVjdCksIHRoaXMubmFtZSlcblx0fSxcblxuXHRNZW1iZXJTZXQoKSB7XG5cdFx0Y29uc3Qgb2JqID0gdDAodGhpcy5vYmplY3QpXG5cdFx0Y29uc3QgbmFtZSA9ICgpID0+XG5cdFx0XHR0eXBlb2YgdGhpcy5uYW1lID09PSAnc3RyaW5nJyA/IG5ldyBMaXRlcmFsKHRoaXMubmFtZSkgOiB0MCh0aGlzLm5hbWUpXG5cdFx0Y29uc3QgdmFsID0gbWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHQwKHRoaXMudmFsdWUpLCB0aGlzLm9wVHlwZSwgdGhpcy5uYW1lKVxuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIFNFVF9Jbml0OlxuXHRcdFx0XHRyZXR1cm4gbXNOZXdQcm9wZXJ0eShvYmosIG5hbWUoKSwgdmFsKVxuXHRcdFx0Y2FzZSBTRVRfSW5pdE11dGFibGU6XG5cdFx0XHRcdHJldHVybiBtc05ld011dGFibGVQcm9wZXJ0eShvYmosIG5hbWUoKSwgdmFsKVxuXHRcdFx0Y2FzZSBTRVRfTXV0YXRlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyU3RyaW5nT3JWYWwob2JqLCB0aGlzLm5hbWUpLCB2YWwpXG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdH1cblx0fSxcblxuXHRNb2R1bGUoKSB7XG5cdFx0Y29uc3QgYm9keSA9IHRMaW5lcyh0aGlzLmxpbmVzKVxuXG5cdFx0dmVyaWZ5UmVzdWx0cy5idWlsdGluUGF0aFRvTmFtZXMuZm9yRWFjaCgoaW1wb3J0ZWQsIHBhdGgpID0+IHtcblx0XHRcdGlmIChwYXRoICE9PSAnZ2xvYmFsJykge1xuXHRcdFx0XHRjb25zdCBpbXBvcnRlZERlY2xhcmVzID0gW11cblx0XHRcdFx0bGV0IG9wSW1wb3J0RGVmYXVsdCA9IG51bGxcblx0XHRcdFx0bGV0IGRlZmF1bHROYW1lID0gbGFzdChwYXRoLnNwbGl0KCcvJykpXG5cdFx0XHRcdGZvciAoY29uc3QgbmFtZSBvZiBpbXBvcnRlZCkge1xuXHRcdFx0XHRcdGNvbnN0IGRlY2xhcmUgPSBMb2NhbERlY2xhcmUucGxhaW4odGhpcy5sb2MsIG5hbWUpXG5cdFx0XHRcdFx0aWYgKG5hbWUgPT09IGRlZmF1bHROYW1lKVxuXHRcdFx0XHRcdFx0b3BJbXBvcnREZWZhdWx0ID0gZGVjbGFyZVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGltcG9ydGVkRGVjbGFyZXMucHVzaChkZWNsYXJlKVxuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuaW1wb3J0cy5wdXNoKG5ldyBJbXBvcnQodGhpcy5sb2MsIHBhdGgsIGltcG9ydGVkRGVjbGFyZXMsIG9wSW1wb3J0RGVmYXVsdCkpXG5cdFx0XHR9XG5cdFx0fSlcblxuXHRcdGNvbnN0IGFtZCA9IGFtZFdyYXBNb2R1bGUodGhpcy5kb0ltcG9ydHMsIHRoaXMuaW1wb3J0cywgYm9keSlcblxuXHRcdHJldHVybiBuZXcgUHJvZ3JhbShjYXQoXG5cdFx0XHRvcElmKGNvbnRleHQub3B0cy5pbmNsdWRlVXNlU3RyaWN0KCksICgpID0+IFVzZVN0cmljdCksXG5cdFx0XHRvcElmKGNvbnRleHQub3B0cy5pbmNsdWRlQW1kZWZpbmUoKSwgKCkgPT4gQW1kZWZpbmVIZWFkZXIpLFxuXHRcdFx0dG9TdGF0ZW1lbnQoYW1kKSkpXG5cdH0sXG5cblx0TW9kdWxlRXhwb3J0TmFtZWQoKSB7XG5cdFx0cmV0dXJuIHQxKHRoaXMuYXNzaWduLCB2YWwgPT5cblx0XHRcdG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlcihJZEV4cG9ydHMsIHRoaXMuYXNzaWduLmFzc2lnbmVlLm5hbWUpLCB2YWwpKVxuXHR9LFxuXG5cdE1vZHVsZUV4cG9ydERlZmF1bHQoKSB7XG5cdFx0cmV0dXJuIHQxKHRoaXMuYXNzaWduLCB2YWwgPT4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgRXhwb3J0c0RlZmF1bHQsIHZhbCkpXG5cdH0sXG5cblx0TmV3KCkge1xuXHRcdGNvbnN0IGFueVNwbGF0ID0gdGhpcy5hcmdzLnNvbWUoXyA9PiBfIGluc3RhbmNlb2YgU3BsYXQpXG5cdFx0Y29udGV4dC5jaGVjayghYW55U3BsYXQsIHRoaXMubG9jLCAnVE9ETzogU3BsYXQgcGFyYW1zIGZvciBuZXcnKVxuXHRcdHJldHVybiBuZXcgTmV3RXhwcmVzc2lvbih0MCh0aGlzLnR5cGUpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHROb3QoKSB7IHJldHVybiBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgdDAodGhpcy5hcmcpKSB9LFxuXG5cdE9iakVudHJ5QXNzaWduKCkge1xuXHRcdHJldHVybiB0aGlzLmFzc2lnbiBpbnN0YW5jZW9mIEFzc2lnblNpbmdsZSAmJiAhdGhpcy5hc3NpZ24uYXNzaWduZWUuaXNMYXp5KCkgP1xuXHRcdFx0dDEodGhpcy5hc3NpZ24sIHZhbCA9PlxuXHRcdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRCdWlsdCwgdGhpcy5hc3NpZ24uYXNzaWduZWUubmFtZSksIHZhbCkpIDpcblx0XHRcdGNhdChcblx0XHRcdFx0dDAodGhpcy5hc3NpZ24pLFxuXHRcdFx0XHR0aGlzLmFzc2lnbi5hbGxBc3NpZ25lZXMoKS5tYXAoXyA9PlxuXHRcdFx0XHRcdG1zU2V0TGF6eShJZEJ1aWx0LCBuZXcgTGl0ZXJhbChfLm5hbWUpLCBpZEZvckRlY2xhcmVDYWNoZWQoXykpKSlcblx0fSxcblxuXHRPYmpFbnRyeUNvbXB1dGVkKCkge1xuXHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLFxuXHRcdFx0bmV3IE1lbWJlckV4cHJlc3Npb24oSWRCdWlsdCwgdDAodGhpcy5rZXkpKSxcblx0XHRcdHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdE9ialNpbXBsZSgpIHtcblx0XHRyZXR1cm4gbmV3IE9iamVjdEV4cHJlc3Npb24odGhpcy5wYWlycy5tYXAocGFpciA9PlxuXHRcdFx0bmV3IFByb3BlcnR5KCdpbml0JywgcHJvcGVydHlJZE9yTGl0ZXJhbENhY2hlZChwYWlyLmtleSksIHQwKHBhaXIudmFsdWUpKSkpXG5cdH0sXG5cblx0UXVvdGUoKSB7XG5cdFx0aWYgKHRoaXMucGFydHMubGVuZ3RoID09PSAwKVxuXHRcdFx0cmV0dXJuIExpdEVtcHR5U3RyaW5nXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBxdWFzaXMgPSBbXSwgZXhwcmVzc2lvbnMgPSBbXVxuXG5cdFx0XHQvLyBUZW1wbGF0ZUxpdGVyYWwgbXVzdCBzdGFydCB3aXRoIGEgVGVtcGxhdGVFbGVtZW50XG5cdFx0XHRpZiAodHlwZW9mIHRoaXMucGFydHNbMF0gIT09ICdzdHJpbmcnKVxuXHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuRW1wdHkpXG5cblx0XHRcdGZvciAobGV0IHBhcnQgb2YgdGhpcy5wYXJ0cylcblx0XHRcdFx0aWYgKHR5cGVvZiBwYXJ0ID09PSAnc3RyaW5nJylcblx0XHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZm9yUmF3U3RyaW5nKHBhcnQpKVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHQvLyBcInsxfXsxfVwiIG5lZWRzIGFuIGVtcHR5IHF1YXNpIGluIHRoZSBtaWRkbGUgKGFuZCBvbiB0aGUgZW5kcylcblx0XHRcdFx0XHRpZiAocXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoKVxuXHRcdFx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LkVtcHR5KVxuXHRcdFx0XHRcdGV4cHJlc3Npb25zLnB1c2godDAocGFydCkpXG5cdFx0XHRcdH1cblxuXHRcdFx0Ly8gVGVtcGxhdGVMaXRlcmFsIG11c3QgZW5kIHdpdGggYSBUZW1wbGF0ZUVsZW1lbnQsIHNvIG9uZSBtb3JlIHF1YXNpIHRoYW4gZXhwcmVzc2lvbi5cblx0XHRcdGlmIChxdWFzaXMubGVuZ3RoID09PSBleHByZXNzaW9ucy5sZW5ndGgpXG5cdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5FbXB0eSlcblxuXHRcdFx0cmV0dXJuIG5ldyBUZW1wbGF0ZUxpdGVyYWwocXVhc2lzLCBleHByZXNzaW9ucylcblx0XHR9XG5cdH0sXG5cblx0UXVvdGVUZW1wbGF0ZSgpIHtcblx0XHRyZXR1cm4gbmV3IFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbih0MCh0aGlzLnRhZyksIHQwKHRoaXMucXVvdGUpKVxuXHR9LFxuXG5cdFNldFN1YigpIHtcblx0XHRjb25zdCBraW5kID0gKCgpID0+IHtcblx0XHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRcdGNhc2UgU0VUX0luaXQ6XG5cdFx0XHRcdFx0cmV0dXJuICdpbml0J1xuXHRcdFx0XHRjYXNlIFNFVF9Jbml0TXV0YWJsZTpcblx0XHRcdFx0XHRyZXR1cm4gJ2luaXQtbXV0YWJsZSdcblx0XHRcdFx0Y2FzZSBTRVRfTXV0YXRlOlxuXHRcdFx0XHRcdHJldHVybiAnbXV0YXRlJ1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHR9XG5cdFx0fSkoKVxuXHRcdHJldHVybiBtc1NldFN1Yihcblx0XHRcdHQwKHRoaXMub2JqZWN0KSxcblx0XHRcdHRoaXMuc3ViYmVkcy5sZW5ndGggPT09IDEgPyB0MCh0aGlzLnN1YmJlZHNbMF0pIDogdGhpcy5zdWJiZWRzLm1hcCh0MCksXG5cdFx0XHRtYXliZVdyYXBJbkNoZWNrQ29udGFpbnModDAodGhpcy52YWx1ZSksIHRoaXMub3BUeXBlLCAndmFsdWUnKSxcblx0XHRcdG5ldyBMaXRlcmFsKGtpbmQpKVxuXHR9LFxuXG5cdFNwZWNpYWxEbygpIHtcblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTRF9EZWJ1Z2dlcjogcmV0dXJuIG5ldyBEZWJ1Z2dlclN0YXRlbWVudCgpXG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IodGhpcy5raW5kKVxuXHRcdH1cblx0fSxcblxuXHRTcGVjaWFsVmFsKCkge1xuXHRcdC8vIE1ha2UgbmV3IG9iamVjdHMgYmVjYXVzZSB3ZSB3aWxsIGFzc2lnbiBgbG9jYCB0byB0aGVtLlxuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIFNWX0NvbnRhaW5zOiByZXR1cm4gbWVtYmVyKElkTXMsICdjb250YWlucycpXG5cdFx0XHRjYXNlIFNWX0ZhbHNlOiByZXR1cm4gbmV3IExpdGVyYWwoZmFsc2UpXG5cdFx0XHRjYXNlIFNWX05hbWU6IHJldHVybiBuZXcgTGl0ZXJhbCh2ZXJpZnlSZXN1bHRzLm5hbWUodGhpcykpXG5cdFx0XHRjYXNlIFNWX051bGw6IHJldHVybiBuZXcgTGl0ZXJhbChudWxsKVxuXHRcdFx0Y2FzZSBTVl9TZXRTdWI6IHJldHVybiBtZW1iZXIoSWRNcywgJ3NldFN1YicpXG5cdFx0XHRjYXNlIFNWX1N1YjogcmV0dXJuIG1lbWJlcihJZE1zLCAnc3ViJylcblx0XHRcdGNhc2UgU1ZfVHJ1ZTogcmV0dXJuIG5ldyBMaXRlcmFsKHRydWUpXG5cdFx0XHRjYXNlIFNWX1VuZGVmaW5lZDogcmV0dXJuIG5ldyBVbmFyeUV4cHJlc3Npb24oJ3ZvaWQnLCBMaXRaZXJvKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHR9XG5cdH0sXG5cblx0U3BsYXQoKSB7XG5cdFx0cmV0dXJuIG5ldyBTcHJlYWRFbGVtZW50KHQwKHRoaXMuc3BsYXR0ZWQpKVxuXHR9LFxuXG5cdFN1cGVyQ2FsbDogc3VwZXJDYWxsLFxuXHRTdXBlckNhbGxEbzogc3VwZXJDYWxsLFxuXHRTdXBlck1lbWJlcigpIHtcblx0XHRyZXR1cm4gbWVtYmVyU3RyaW5nT3JWYWwoSWRTdXBlciwgdGhpcy5uYW1lKVxuXHR9LFxuXG5cdFN3aXRjaERvKCkgeyByZXR1cm4gdHJhbnNwaWxlU3dpdGNoKHRoaXMpIH0sXG5cdFN3aXRjaFZhbCgpIHsgcmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW3RyYW5zcGlsZVN3aXRjaCh0aGlzKV0pKSB9LFxuXHRTd2l0Y2hEb1BhcnQ6IHN3aXRjaFBhcnQsXG5cdFN3aXRjaFZhbFBhcnQ6IHN3aXRjaFBhcnQsXG5cblx0VGhyb3coKSB7XG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wVGhyb3duLFxuXHRcdFx0XyA9PiBkb1Rocm93KF8pLFxuXHRcdFx0KCkgPT4gbmV3IFRocm93U3RhdGVtZW50KG5ldyBOZXdFeHByZXNzaW9uKEdsb2JhbEVycm9yLCBbTGl0U3RyVGhyb3ddKSkpXG5cdH0sXG5cblx0V2l0aCgpIHtcblx0XHRjb25zdCBpZERlY2xhcmUgPSBpZEZvckRlY2xhcmVDYWNoZWQodGhpcy5kZWNsYXJlKVxuXHRcdGNvbnN0IGJsb2NrID0gdDModGhpcy5ibG9jaywgbnVsbCwgbnVsbCwgbmV3IFJldHVyblN0YXRlbWVudChpZERlY2xhcmUpKVxuXHRcdGNvbnN0IGZ1biA9IGlzSW5HZW5lcmF0b3IgP1xuXHRcdFx0bmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihudWxsLCBbaWREZWNsYXJlXSwgYmxvY2ssIHRydWUpIDpcblx0XHRcdG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihbaWREZWNsYXJlXSwgYmxvY2spXG5cdFx0Y29uc3QgY2FsbCA9IG5ldyBDYWxsRXhwcmVzc2lvbihmdW4sIFt0MCh0aGlzLnZhbHVlKV0pXG5cdFx0cmV0dXJuIGlzSW5HZW5lcmF0b3IgPyBuZXcgWWllbGRFeHByZXNzaW9uKGNhbGwsIHRydWUpIDogY2FsbFxuXHR9LFxuXG5cdFlpZWxkKCkgeyByZXR1cm4gbmV3IFlpZWxkRXhwcmVzc2lvbihvcE1hcCh0aGlzLm9wWWllbGRlZCwgdDApLCBmYWxzZSkgfSxcblxuXHRZaWVsZFRvKCkgeyByZXR1cm4gbmV3IFlpZWxkRXhwcmVzc2lvbih0MCh0aGlzLnlpZWxkZWRUbyksIHRydWUpIH1cbn0pXG5cbmZ1bmN0aW9uIGNhc2VQYXJ0KGFsdGVybmF0ZSkge1xuXHRpZiAodGhpcy50ZXN0IGluc3RhbmNlb2YgUGF0dGVybikge1xuXHRcdGNvbnN0IHt0eXBlLCBwYXR0ZXJuZWQsIGxvY2Fsc30gPSB0aGlzLnRlc3Rcblx0XHRjb25zdCBkZWNsID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgW1xuXHRcdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZEV4dHJhY3QsIG1zRXh0cmFjdCh0MCh0eXBlKSwgdDAocGF0dGVybmVkKSkpXSlcblx0XHRjb25zdCB0ZXN0ID0gbmV3IEJpbmFyeUV4cHJlc3Npb24oJyE9PScsIElkRXh0cmFjdCwgTGl0TnVsbClcblx0XHRjb25zdCBleHRyYWN0ID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgbG9jYWxzLm1hcCgoXywgaWR4KSA9PlxuXHRcdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRvcihcblx0XHRcdFx0aWRGb3JEZWNsYXJlQ2FjaGVkKF8pLFxuXHRcdFx0XHRuZXcgTWVtYmVyRXhwcmVzc2lvbihJZEV4dHJhY3QsIG5ldyBMaXRlcmFsKGlkeCkpKSkpXG5cdFx0Y29uc3QgcmVzID0gdDEodGhpcy5yZXN1bHQsIGV4dHJhY3QpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChbZGVjbCwgbmV3IElmU3RhdGVtZW50KHRlc3QsIHJlcywgYWx0ZXJuYXRlKV0pXG5cdH0gZWxzZVxuXHRcdC8vIGFsdGVybmF0ZSB3cml0dGVuIHRvIGJ5IGBjYXNlQm9keWAuXG5cdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudCh0MCh0aGlzLnRlc3QpLCB0MCh0aGlzLnJlc3VsdCksIGFsdGVybmF0ZSlcbn1cblxuZnVuY3Rpb24gc3VwZXJDYWxsKCkge1xuXHRjb25zdCBhcmdzID0gdGhpcy5hcmdzLm1hcCh0MClcblx0Y29uc3QgbWV0aG9kID0gdmVyaWZ5UmVzdWx0cy5zdXBlckNhbGxUb01ldGhvZC5nZXQodGhpcylcblxuXHRpZiAobWV0aG9kIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpIHtcblx0XHRjb25zdCBjYWxsID0gbmV3IENhbGxFeHByZXNzaW9uKElkU3VwZXIsIGFyZ3MpXG5cdFx0Y29uc3QgbWVtYmVyU2V0cyA9IGNvbnN0cnVjdG9yU2V0TWVtYmVycyhtZXRob2QpXG5cdFx0cmV0dXJuIGNhdChjYWxsLCBtZW1iZXJTZXRzKVxuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IG0gPSB0eXBlb2YgbWV0aG9kLnN5bWJvbCA9PT0gJ3N0cmluZycgP1xuXHRcdFx0bWVtYmVyKElkU3VwZXIsIG1ldGhvZC5zeW1ib2wpIDpcblx0XHRcdG5ldyBNZW1iZXJFeHByZXNzaW9uKElkU3VwZXIsIHQwKG1ldGhvZC5zeW1ib2wpKVxuXHRcdHJldHVybiBuZXcgQ2FsbEV4cHJlc3Npb24obSwgYXJncylcblx0fVxufVxuXG5mdW5jdGlvbiBzd2l0Y2hQYXJ0KCkge1xuXHRjb25zdCBvcE91dCA9IG9wSWYodGhpcyBpbnN0YW5jZW9mIFN3aXRjaERvUGFydCwgKCkgPT4gbmV3IEJyZWFrU3RhdGVtZW50KVxuXHQvKlxuXHRXZSBjb3VsZCBqdXN0IHBhc3MgYmxvY2suYm9keSBmb3IgdGhlIHN3aXRjaCBsaW5lcywgYnV0IGluc3RlYWRcblx0ZW5jbG9zZSB0aGUgYm9keSBvZiB0aGUgc3dpdGNoIGNhc2UgaW4gY3VybHkgYnJhY2VzIHRvIGVuc3VyZSBhIG5ldyBzY29wZS5cblx0VGhhdCB3YXkgdGhpcyBjb2RlIHdvcmtzOlxuXHRcdHN3aXRjaCAoMCkge1xuXHRcdFx0Y2FzZSAwOiB7XG5cdFx0XHRcdGNvbnN0IGEgPSAwXG5cdFx0XHRcdHJldHVybiBhXG5cdFx0XHR9XG5cdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdC8vIFdpdGhvdXQgY3VybHkgYnJhY2VzIHRoaXMgd291bGQgY29uZmxpY3Qgd2l0aCB0aGUgb3RoZXIgYGFgLlxuXHRcdFx0XHRjb25zdCBhID0gMVxuXHRcdFx0XHRhXG5cdFx0XHR9XG5cdFx0fVxuXHQqL1xuXHRjb25zdCBibG9jayA9IHQzKHRoaXMucmVzdWx0LCBudWxsLCBudWxsLCBvcE91dClcblx0Ly8gSWYgc3dpdGNoIGhhcyBtdWx0aXBsZSB2YWx1ZXMsIGJ1aWxkIHVwIGEgc3RhdGVtZW50IGxpa2U6IGBjYXNlIDE6IGNhc2UgMjogeyBkb0Jsb2NrKCkgfWBcblx0Y29uc3QgeCA9IFtdXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy52YWx1ZXMubGVuZ3RoIC0gMTsgaSA9IGkgKyAxKVxuXHRcdC8vIFRoZXNlIGNhc2VzIGZhbGx0aHJvdWdoIHRvIHRoZSBvbmUgYXQgdGhlIGVuZC5cblx0XHR4LnB1c2gobmV3IFN3aXRjaENhc2UodDAodGhpcy52YWx1ZXNbaV0pLCBbXSkpXG5cdHgucHVzaChuZXcgU3dpdGNoQ2FzZSh0MCh0aGlzLnZhbHVlc1t0aGlzLnZhbHVlcy5sZW5ndGggLSAxXSksIFtibG9ja10pKVxuXHRyZXR1cm4geFxufVxuXG4vLyBGdW5jdGlvbnMgc3BlY2lmaWMgdG8gY2VydGFpbiBleHByZXNzaW9ucy5cbmNvbnN0XG5cdC8vIFdyYXBzIGEgYmxvY2sgKHdpdGggYHJldHVybmAgc3RhdGVtZW50cyBpbiBpdCkgaW4gYW4gSUlGRS5cblx0YmxvY2tXcmFwID0gYmxvY2sgPT4ge1xuXHRcdGNvbnN0IGludm9rZSA9IG5ldyBDYWxsRXhwcmVzc2lvbihmdW5jdGlvbkV4cHJlc3Npb25UaHVuayhibG9jaywgaXNJbkdlbmVyYXRvciksIFtdKVxuXHRcdHJldHVybiBpc0luR2VuZXJhdG9yID8gbmV3IFlpZWxkRXhwcmVzc2lvbihpbnZva2UsIHRydWUpIDogaW52b2tlXG5cdH0sXG5cblx0Y2FzZUJvZHkgPSAocGFydHMsIG9wRWxzZSkgPT4ge1xuXHRcdGxldCBhY2MgPSBpZkVsc2Uob3BFbHNlLCB0MCwgKCkgPT4gVGhyb3dOb0Nhc2VNYXRjaClcblx0XHRmb3IgKGxldCBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpID0gaSAtIDEpXG5cdFx0XHRhY2MgPSB0MShwYXJ0c1tpXSwgYWNjKVxuXHRcdHJldHVybiBhY2Ncblx0fSxcblxuXHRjb25zdHJ1Y3RvclNldE1lbWJlcnMgPSBjb25zdHJ1Y3RvciA9PlxuXHRcdGNvbnN0cnVjdG9yLm1lbWJlckFyZ3MubWFwKF8gPT5cblx0XHRcdG1zTmV3UHJvcGVydHkobmV3IFRoaXNFeHByZXNzaW9uKCksIG5ldyBMaXRlcmFsKF8ubmFtZSksIGlkRm9yRGVjbGFyZUNhY2hlZChfKSkpLFxuXG5cdGZvckxvb3AgPSAob3BJdGVyYXRlZSwgYmxvY2spID0+XG5cdFx0aWZFbHNlKG9wSXRlcmF0ZWUsXG5cdFx0XHQoe2VsZW1lbnQsIGJhZ30pID0+IHtcblx0XHRcdFx0Y29uc3QgZGVjbGFyZSA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdsZXQnLFxuXHRcdFx0XHRcdFtuZXcgVmFyaWFibGVEZWNsYXJhdG9yKHQwKGVsZW1lbnQpKV0pXG5cdFx0XHRcdHJldHVybiBuZXcgRm9yT2ZTdGF0ZW1lbnQoZGVjbGFyZSwgdDAoYmFnKSwgdDAoYmxvY2spKVxuXHRcdFx0fSxcblx0XHRcdCgpID0+IGZvclN0YXRlbWVudEluZmluaXRlKHQwKGJsb2NrKSkpLFxuXG5cdGRvVGhyb3cgPSB0aHJvd24gPT5cblx0XHRuZXcgVGhyb3dTdGF0ZW1lbnQodGhyb3duIGluc3RhbmNlb2YgUXVvdGUgP1xuXHRcdFx0bmV3IE5ld0V4cHJlc3Npb24oR2xvYmFsRXJyb3IsIFt0MCh0aHJvd24pXSkgOlxuXHRcdFx0dDAodGhyb3duKSksXG5cblx0bWVtYmVyU3RyaW5nT3JWYWwgPSAob2JqZWN0LCBtZW1iZXJOYW1lKSA9PlxuXHRcdHR5cGVvZiBtZW1iZXJOYW1lID09PSAnc3RyaW5nJyA/XG5cdFx0XHRtZW1iZXIob2JqZWN0LCBtZW1iZXJOYW1lKSA6XG5cdFx0XHRuZXcgTWVtYmVyRXhwcmVzc2lvbihvYmplY3QsIHQwKG1lbWJlck5hbWUpKSxcblxuXHRtZXRob2RLZXlDb21wdXRlZCA9IHN5bWJvbCA9PiB7XG5cdFx0aWYgKHR5cGVvZiBzeW1ib2wgPT09ICdzdHJpbmcnKVxuXHRcdFx0cmV0dXJuIHtrZXk6IHByb3BlcnR5SWRPckxpdGVyYWxDYWNoZWQoc3ltYm9sKSwgY29tcHV0ZWQ6IGZhbHNlfVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3Qga2V5ID0gc3ltYm9sIGluc3RhbmNlb2YgUXVvdGUgPyB0MChzeW1ib2wpIDogbXNTeW1ib2wodDAoc3ltYm9sKSlcblx0XHRcdHJldHVybiB7a2V5LCBjb21wdXRlZDogdHJ1ZX1cblx0XHR9XG5cdH0sXG5cblx0dHJhbnNwaWxlQmxvY2sgPSAocmV0dXJuZWQsIGxpbmVzLCBsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KSA9PiB7XG5cdFx0Ly8gVE9ETzpFUzYgT3B0aW9uYWwgYXJndW1lbnRzXG5cdFx0aWYgKGxlYWQgPT09IHVuZGVmaW5lZCkgbGVhZCA9IG51bGxcblx0XHRpZiAob3BEZWNsYXJlUmVzID09PSB1bmRlZmluZWQpIG9wRGVjbGFyZVJlcyA9IG51bGxcblx0XHRpZiAob3BPdXQgPT09IHVuZGVmaW5lZCkgb3BPdXQgPSBudWxsXG5cdFx0Y29uc3QgZmluID0gaWZFbHNlKG9wRGVjbGFyZVJlcyxcblx0XHRcdHJkID0+IHtcblx0XHRcdFx0Y29uc3QgcmV0ID0gbWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHJldHVybmVkLCByZC5vcFR5cGUsIHJkLm5hbWUpXG5cdFx0XHRcdHJldHVybiBpZkVsc2Uob3BPdXQsXG5cdFx0XHRcdFx0XyA9PiBjYXQoZGVjbGFyZShyZCwgcmV0KSwgXywgUmV0dXJuUmVzKSxcblx0XHRcdFx0XHQoKSA9PiBuZXcgUmV0dXJuU3RhdGVtZW50KHJldCkpXG5cdFx0XHR9LFxuXHRcdFx0KCkgPT4gY2F0KG9wT3V0LCBuZXcgUmV0dXJuU3RhdGVtZW50KHJldHVybmVkKSkpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgbGluZXMsIGZpbikpXG5cdH0sXG5cblx0dHJhbnNwaWxlRXhjZXB0ID0gZXhjZXB0ID0+XG5cdFx0bmV3IFRyeVN0YXRlbWVudChcblx0XHRcdHQwKGV4Y2VwdC5fdHJ5KSxcblx0XHRcdG9wTWFwKGV4Y2VwdC5fY2F0Y2gsIHQwKSxcblx0XHRcdG9wTWFwKGV4Y2VwdC5fZmluYWxseSwgdDApKSxcblxuXHR0cmFuc3BpbGVTd2l0Y2ggPSBfID0+IHtcblx0XHRjb25zdCBwYXJ0cyA9IGZsYXRNYXAoXy5wYXJ0cywgdDApXG5cdFx0cGFydHMucHVzaChpZkVsc2UoXy5vcEVsc2UsXG5cdFx0XHRfID0+IG5ldyBTd2l0Y2hDYXNlKHVuZGVmaW5lZCwgdDAoXykuYm9keSksXG5cdFx0XHQoKSA9PiBTd2l0Y2hDYXNlTm9NYXRjaCkpXG5cdFx0cmV0dXJuIG5ldyBTd2l0Y2hTdGF0ZW1lbnQodDAoXy5zd2l0Y2hlZCksIHBhcnRzKVxuXHR9XG5cbmNvbnN0IElkQm9vdCA9IG5ldyBJZGVudGlmaWVyKCdfYm9vdCcpXG5cbi8vIE1vZHVsZSBoZWxwZXJzXG5jb25zdFxuXHRhbWRXcmFwTW9kdWxlID0gKGRvSW1wb3J0cywgaW1wb3J0cywgYm9keSkgPT4ge1xuXHRcdGNvbnN0IHNob3VsZEltcG9ydEJvb3QgPSBjb250ZXh0Lm9wdHMuaW1wb3J0Qm9vdCgpXG5cblx0XHRjb25zdCBhbGxJbXBvcnRzID0gZG9JbXBvcnRzLmNvbmNhdChpbXBvcnRzKVxuXHRcdGNvbnN0IGFsbEltcG9ydFBhdGhzID0gYWxsSW1wb3J0cy5tYXAoXyA9PiBtYW5nbGVQYXRoKF8ucGF0aCkpXG5cblx0XHRjb25zdCBhcnJJbXBvcnRQYXRocyA9IG5ldyBBcnJheUV4cHJlc3Npb24oY2F0KFxuXHRcdFx0b3BJZihzaG91bGRJbXBvcnRCb290LCAoKSA9PiBuZXcgTGl0ZXJhbChjb250ZXh0Lm9wdHMuYm9vdFBhdGgoKSkpLFxuXHRcdFx0TGl0U3RyRXhwb3J0cyxcblx0XHRcdGFsbEltcG9ydFBhdGhzLm1hcChfID0+IG5ldyBMaXRlcmFsKF8pKSkpXG5cblx0XHRjb25zdCBpbXBvcnRUb0lkZW50aWZpZXIgPSBuZXcgTWFwKClcblx0XHRjb25zdCBpbXBvcnRJZGVudGlmaWVycyA9IFtdXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhbGxJbXBvcnRzLmxlbmd0aDsgaSA9IGkgKyAxKSB7XG5cdFx0XHRjb25zdCBfID0gYWxsSW1wb3J0c1tpXVxuXHRcdFx0Y29uc3QgaWQgPSBpZENhY2hlZChgJHtwYXRoQmFzZU5hbWUoXy5wYXRoKX1fJHtpfWApXG5cdFx0XHRpbXBvcnRJZGVudGlmaWVycy5wdXNoKGlkKVxuXHRcdFx0aW1wb3J0VG9JZGVudGlmaWVyLnNldChfLCBpZClcblx0XHR9XG5cblx0XHRjb25zdCBpbXBvcnRBcmdzID0gY2F0KG9wSWYoc2hvdWxkSW1wb3J0Qm9vdCwgKCkgPT4gSWRCb290KSwgSWRFeHBvcnRzLCBpbXBvcnRJZGVudGlmaWVycylcblxuXHRcdGNvbnN0IGRvQm9vdCA9IG9wSWYoc2hvdWxkSW1wb3J0Qm9vdCwgKCkgPT4gbmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQobXNHZXRNb2R1bGUoSWRCb290KSkpXG5cblx0XHRjb25zdCBpbXBvcnREb3MgPSBkb0ltcG9ydHMubWFwKF8gPT5cblx0XHRcdGxvYyhuZXcgRXhwcmVzc2lvblN0YXRlbWVudChtc0dldE1vZHVsZShpbXBvcnRUb0lkZW50aWZpZXIuZ2V0KF8pKSksIF8ubG9jKSlcblxuXHRcdC8vIEV4dHJhY3RzIGltcG9ydGVkIHZhbHVlcyBmcm9tIHRoZSBtb2R1bGVzLlxuXHRcdGNvbnN0IG9wRGVjbGFyZUltcG9ydGVkTG9jYWxzID0gb3BJZighaXNFbXB0eShpbXBvcnRzKSxcblx0XHRcdCgpID0+IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsXG5cdFx0XHRcdGZsYXRNYXAoaW1wb3J0cywgXyA9PiBpbXBvcnREZWNsYXJhdG9ycyhfLCBpbXBvcnRUb0lkZW50aWZpZXIuZ2V0KF8pKSkpKVxuXG5cdFx0Y29uc3QgZnVsbEJvZHkgPSBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KFxuXHRcdFx0ZG9Cb290LCBpbXBvcnREb3MsIG9wRGVjbGFyZUltcG9ydGVkTG9jYWxzLCBib2R5LCBSZXR1cm5FeHBvcnRzKSlcblxuXHRcdGNvbnN0IGxhenlCb2R5ID1cblx0XHRcdGNvbnRleHQub3B0cy5sYXp5TW9kdWxlKCkgP1xuXHRcdFx0XHRuZXcgQmxvY2tTdGF0ZW1lbnQoW25ldyBFeHByZXNzaW9uU3RhdGVtZW50KFxuXHRcdFx0XHRcdG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIEV4cG9ydHNHZXQsXG5cdFx0XHRcdFx0XHRtc0xhenkoZnVuY3Rpb25FeHByZXNzaW9uVGh1bmsoZnVsbEJvZHkpKSkpXSkgOlxuXHRcdFx0XHRmdWxsQm9keVxuXG5cdFx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbihJZERlZmluZSxcblx0XHRcdFthcnJJbXBvcnRQYXRocywgbmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKGltcG9ydEFyZ3MsIGxhenlCb2R5KV0pXG5cdH0sXG5cblx0cGF0aEJhc2VOYW1lID0gcGF0aCA9PlxuXHRcdHBhdGguc3Vic3RyKHBhdGgubGFzdEluZGV4T2YoJy8nKSArIDEpLFxuXG5cdGltcG9ydERlY2xhcmF0b3JzID0gKHtpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0fSwgbW9kdWxlSWRlbnRpZmllcikgPT4ge1xuXHRcdC8vIFRPRE86IENvdWxkIGJlIG5lYXRlciBhYm91dCB0aGlzXG5cdFx0Y29uc3QgaXNMYXp5ID0gKGlzRW1wdHkoaW1wb3J0ZWQpID8gb3BJbXBvcnREZWZhdWx0IDogaW1wb3J0ZWRbMF0pLmlzTGF6eSgpXG5cdFx0Y29uc3QgdmFsdWUgPSAoaXNMYXp5ID8gbXNMYXp5R2V0TW9kdWxlIDogbXNHZXRNb2R1bGUpKG1vZHVsZUlkZW50aWZpZXIpXG5cblx0XHRjb25zdCBpbXBvcnRlZERlZmF1bHQgPSBvcE1hcChvcEltcG9ydERlZmF1bHQsIGRlZiA9PiB7XG5cdFx0XHRjb25zdCBkZWZleHAgPSBtc0dldERlZmF1bHRFeHBvcnQobW9kdWxlSWRlbnRpZmllcilcblx0XHRcdGNvbnN0IHZhbCA9IGlzTGF6eSA/IGxhenlXcmFwKGRlZmV4cCkgOiBkZWZleHBcblx0XHRcdHJldHVybiBsb2MobmV3IFZhcmlhYmxlRGVjbGFyYXRvcihpZEZvckRlY2xhcmVDYWNoZWQoZGVmKSwgdmFsKSwgZGVmLmxvYylcblx0XHR9KVxuXG5cdFx0Y29uc3QgaW1wb3J0ZWREZXN0cnVjdCA9IGlzRW1wdHkoaW1wb3J0ZWQpID8gbnVsbCA6XG5cdFx0XHRtYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycyhpbXBvcnRlZCwgaXNMYXp5LCB2YWx1ZSwgdHJ1ZSwgZmFsc2UpXG5cblx0XHRyZXR1cm4gY2F0KGltcG9ydGVkRGVmYXVsdCwgaW1wb3J0ZWREZXN0cnVjdClcblx0fVxuXG4vLyBHZW5lcmFsIHV0aWxzLiBOb3QgaW4gdXRpbC5qcyBiZWNhdXNlIHRoZXNlIGNsb3NlIG92ZXIgY29udGV4dC5cbmNvbnN0XG5cdG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzID0gKGFzc2lnbmVlcywgaXNMYXp5LCB2YWx1ZSwgaXNNb2R1bGUpID0+IHtcblx0XHRjb25zdCBkZXN0cnVjdHVyZWROYW1lID0gYF8kJHtuZXh0RGVzdHJ1Y3R1cmVkSWR9YFxuXHRcdG5leHREZXN0cnVjdHVyZWRJZCA9IG5leHREZXN0cnVjdHVyZWRJZCArIDFcblx0XHRjb25zdCBpZERlc3RydWN0dXJlZCA9IG5ldyBJZGVudGlmaWVyKGRlc3RydWN0dXJlZE5hbWUpXG5cdFx0Y29uc3QgZGVjbGFyYXRvcnMgPSBhc3NpZ25lZXMubWFwKGFzc2lnbmVlID0+IHtcblx0XHRcdC8vIFRPRE86IERvbid0IGNvbXBpbGUgaXQgaWYgaXQncyBuZXZlciBhY2Nlc3NlZFxuXHRcdFx0Y29uc3QgZ2V0ID0gZ2V0TWVtYmVyKGlkRGVzdHJ1Y3R1cmVkLCBhc3NpZ25lZS5uYW1lLCBpc0xhenksIGlzTW9kdWxlKVxuXHRcdFx0cmV0dXJuIG1ha2VEZWNsYXJhdG9yKGFzc2lnbmVlLCBnZXQsIGlzTGF6eSlcblx0XHR9KVxuXHRcdC8vIEdldHRpbmcgbGF6eSBtb2R1bGUgaXMgZG9uZSBieSBtcy5sYXp5R2V0TW9kdWxlLlxuXHRcdGNvbnN0IHZhbCA9IGlzTGF6eSAmJiAhaXNNb2R1bGUgPyBsYXp5V3JhcCh2YWx1ZSkgOiB2YWx1ZVxuXHRcdHJldHVybiBjYXQobmV3IFZhcmlhYmxlRGVjbGFyYXRvcihpZERlc3RydWN0dXJlZCwgdmFsKSwgZGVjbGFyYXRvcnMpXG5cdH0sXG5cblx0bWFrZURlY2xhcmF0b3IgPSAoYXNzaWduZWUsIHZhbHVlLCB2YWx1ZUlzQWxyZWFkeUxhenkpID0+IHtcblx0XHRjb25zdCB7bmFtZSwgb3BUeXBlfSA9IGFzc2lnbmVlXG5cdFx0Y29uc3QgaXNMYXp5ID0gYXNzaWduZWUuaXNMYXp5KClcblx0XHQvLyBUT0RPOiBhc3NlcnQoYXNzaWduZWUub3BUeXBlID09PSBudWxsKVxuXHRcdC8vIG9yIFRPRE86IEFsbG93IHR5cGUgY2hlY2sgb24gbGF6eSB2YWx1ZT9cblx0XHR2YWx1ZSA9IGlzTGF6eSA/IHZhbHVlIDogbWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHZhbHVlLCBvcFR5cGUsIG5hbWUpXG5cdFx0Y29uc3QgdmFsID0gaXNMYXp5ICYmICF2YWx1ZUlzQWxyZWFkeUxhenkgPyBsYXp5V3JhcCh2YWx1ZSkgOiB2YWx1ZVxuXHRcdGFzc2VydChpc0xhenkgfHwgIXZhbHVlSXNBbHJlYWR5TGF6eSlcblx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRvcihpZEZvckRlY2xhcmVDYWNoZWQoYXNzaWduZWUpLCB2YWwpXG5cdH0sXG5cblx0bWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zID0gKGFzdCwgb3BUeXBlLCBuYW1lKSA9PlxuXHRcdCBjb250ZXh0Lm9wdHMuaW5jbHVkZUNoZWNrcygpICYmIG9wVHlwZSAhPT0gbnVsbCA/XG5cdFx0XHRtc0NoZWNrQ29udGFpbnModDAob3BUeXBlKSwgYXN0LCBuZXcgTGl0ZXJhbChuYW1lKSkgOlxuXHRcdFx0YXN0LFxuXG5cdGdldE1lbWJlciA9IChhc3RPYmplY3QsIGdvdE5hbWUsIGlzTGF6eSwgaXNNb2R1bGUpID0+XG5cdFx0aXNMYXp5ID9cblx0XHRtc0xhenlHZXQoYXN0T2JqZWN0LCBuZXcgTGl0ZXJhbChnb3ROYW1lKSkgOlxuXHRcdGlzTW9kdWxlICYmIGNvbnRleHQub3B0cy5pbmNsdWRlQ2hlY2tzKCkgP1xuXHRcdG1zR2V0KGFzdE9iamVjdCwgbmV3IExpdGVyYWwoZ290TmFtZSkpIDpcblx0XHRtZW1iZXIoYXN0T2JqZWN0LCBnb3ROYW1lKVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

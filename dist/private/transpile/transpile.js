if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'esast/dist/ast', 'esast/dist/util', '../manglePath', '../context', '../MsAst', '../util', './ast-constants', './ms-call', './util'], function (exports, _esastDistAst, _esastDistUtil, _manglePath, _context, _MsAst, _util, _astConstants, _msCall, _util2) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

	var _manglePath2 = _interopRequireDefault(_manglePath);

	let verifyResults, isInGenerator, isInConstructor;
	let nextDestructuredId;

	exports.default = (moduleExpression, _verifyResults) => {
		verifyResults = _verifyResults;
		isInGenerator = false;
		isInConstructor = false;
		nextDestructuredId = 0;
		const res = t0(moduleExpression);
		// Release for garbage collection.
		verifyResults = null;
		return res;
	};

	const t0 = expr => (0, _esastDistUtil.loc)(expr.transpile(), expr.loc);
	exports.t0 = t0;
	const t1 = (expr, arg) => (0, _esastDistUtil.loc)(expr.transpile(arg), expr.loc),
	      t2 = (expr, arg, arg2) => (0, _esastDistUtil.loc)(expr.transpile(arg, arg2)),
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

		BlockDo(lead, opDeclareRes, follow) {
			// TODO:ES6 Optional arguments
			if (lead === undefined) lead = null;
			if (opDeclareRes === undefined) opDeclareRes = null;
			if (follow === undefined) follow = null;
			(0, _util.assert)(opDeclareRes === null);
			return new _esastDistAst.BlockStatement((0, _util.cat)(lead, tLines(this.lines), follow));
		},

		BlockValThrow(lead, opDeclareRes, follow) {
			// TODO:ES6 Optional arguments
			if (lead === undefined) lead = null;
			if (opDeclareRes === undefined) opDeclareRes = null;
			if (follow === undefined) follow = null;
			(0, _context.warnIf)(opDeclareRes !== null || follow !== null, this.loc, 'Return type ignored because the block always throws.');
			return new _esastDistAst.BlockStatement((0, _util.cat)(lead, tLines(this.lines), t0(this.throw)));
		},

		BlockWithReturn(lead, opDeclareRes, follow) {
			return transpileBlock(t0(this.returned), tLines(this.lines), lead, opDeclareRes, follow);
		},

		BlockBag(lead, opDeclareRes, follow) {
			return transpileBlock(_astConstants.IdBuilt, (0, _util.cat)(_astConstants.DeclareBuiltBag, tLines(this.lines)), lead, opDeclareRes, follow);
		},

		BlockObj(lead, opDeclareRes, follow) {
			return transpileBlock(_astConstants.IdBuilt, (0, _util.cat)(_astConstants.DeclareBuiltObj, tLines(this.lines)), lead, opDeclareRes, follow);
		},

		BlockMap(lead, opDeclareRes, follow) {
			return transpileBlock(_astConstants.IdBuilt, (0, _util.cat)(_astConstants.DeclareBuiltMap, tLines(this.lines)), lead, opDeclareRes, follow);
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
			const argChecks = (0, _util.opIf)(_context.options.includeChecks(), () => (0, _util.flatOpMap)(this.args, _util2.opTypeCheckForLocalDeclare));

			const opDeclareThis = (0, _util.opIf)(!isInConstructor && this.opDeclareThis != null, () => _astConstants.DeclareLexicalThis);

			const lead = (0, _util.cat)(leadStatements, opDeclareThis, opDeclareRest, argChecks);

			const body = t2(this.block, lead, this.opDeclareRes);
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

			return new _esastDistAst.Program((0, _util.cat)((0, _util.opIf)(_context.options.includeUseStrict(), () => _astConstants.UseStrict), (0, _util.opIf)(_context.options.includeAmdefine(), () => _astConstants.AmdefineHeader), (0, _esastDistUtil.toStatement)(amd)));
		},

		ModuleExportNamed() {
			return t1(this.assign, val => new _esastDistAst.AssignmentExpression('=', (0, _esastDistUtil.member)(_astConstants.IdExports, this.assign.assignee.name), val));
		},

		ModuleExportDefault() {
			return t1(this.assign, val => new _esastDistAst.AssignmentExpression('=', _astConstants.ExportsDefault, val));
		},

		New() {
			const anySplat = this.args.some(_ => _ instanceof _MsAst.Splat);
			(0, _context.check)(!anySplat, this.loc, 'TODO: Splat params for new');
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
		const follow = (0, _util.opIf)(this instanceof _MsAst.SwitchDoPart, () => new _esastDistAst.BreakStatement());
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
		const block = t3(this.result, null, null, follow);
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
	      transpileBlock = (returned, lines, lead, opDeclareRes, follow) => {
		// TODO:ES6 Optional arguments
		if (lead === undefined) lead = null;
		if (opDeclareRes === undefined) opDeclareRes = null;
		if (follow === undefined) follow = null;
		const fin = (0, _util.ifElse)(opDeclareRes, rd => {
			const ret = maybeWrapInCheckContains(returned, rd.opType, rd.name);
			return (0, _util.ifElse)(follow, _ => (0, _util.cat)((0, _util2.declare)(rd, ret), _, _astConstants.ReturnRes), () => new _esastDistAst.ReturnStatement(ret));
		}, () => (0, _util.cat)(follow, new _esastDistAst.ReturnStatement(returned)));
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
		const shouldImportBoot = _context.options.importBoot();

		const allImports = doImports.concat(imports);
		const allImportPaths = allImports.map(_ => (0, _manglePath2.default)(_.path));

		const arrImportPaths = new _esastDistAst.ArrayExpression((0, _util.cat)((0, _util.opIf)(shouldImportBoot, () => new _esastDistAst.Literal(_context.options.bootPath())), _astConstants.LitStrExports, allImportPaths.map(_ => new _esastDistAst.Literal(_))));

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

		const lazyBody = _context.options.lazyModule() ? new _esastDistAst.BlockStatement([new _esastDistAst.ExpressionStatement(new _esastDistAst.AssignmentExpression('=', _astConstants.ExportsGet, (0, _msCall.msLazy)((0, _esastDistUtil.functionExpressionThunk)(fullBody))))]) : fullBody;

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
	      maybeWrapInCheckContains = (ast, opType, name) => _context.options.includeChecks() && opType !== null ? (0, _msCall.msCheckContains)(t0(opType), ast, new _esastDistAst.Literal(name)) : ast,
	      getMember = (astObject, gotName, isLazy, isModule) => isLazy ? (0, _msCall.msLazyGet)(astObject, new _esastDistAst.Literal(gotName)) : isModule && _context.options.includeChecks() ? (0, _msCall.msGet)(astObject, new _esastDistAst.Literal(gotName)) : (0, _esastDistUtil.member)(astObject, gotName);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zcGlsZS5qcyIsInByaXZhdGUvdHJhbnNwaWxlL3RyYW5zcGlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztBQytCQSxLQUFJLGFBQWEsRUFBRSxhQUFhLEVBQUUsZUFBZSxDQUFBO0FBQ2pELEtBQUksa0JBQWtCLENBQUE7O21CQUVQLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxLQUFLO0FBQ3BELGVBQWEsR0FBRyxjQUFjLENBQUE7QUFDOUIsZUFBYSxHQUFHLEtBQUssQ0FBQTtBQUNyQixpQkFBZSxHQUFHLEtBQUssQ0FBQTtBQUN2QixvQkFBa0IsR0FBRyxDQUFDLENBQUE7QUFDdEIsUUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUE7O0FBRWhDLGVBQWEsR0FBRyxJQUFJLENBQUE7QUFDcEIsU0FBTyxHQUFHLENBQUE7RUFDVjs7QUFFTSxPQUNOLEVBQUUsR0FBRyxJQUFJLElBQUksbUJBdEM2QixHQUFHLEVBc0M1QixJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBOztBQUM3QyxPQUNDLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLEtBQUssbUJBeENzQixHQUFHLEVBd0NyQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7T0FDdEQsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEtBQUssbUJBekNnQixHQUFHLEVBeUNmLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO09BQ3hELEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksS0FBSyxtQkExQ1UsR0FBRyxFQTBDVCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFD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QUFNLENBQUMsRUFBRSxHQUFHLEVBQUUsa0JBdndCVSxPQUFPLENBdXdCTCxJQUFJLENBQUMsQ0FBQyxHQUNuRCxHQUFHO09BRUwsU0FBUyxHQUFHLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxLQUNoRCxNQUFNLEdBQ04sWUFydkJPLFNBQVMsRUFxdkJOLFNBQVMsRUFBRSxrQkE1d0J1QixPQUFPLENBNHdCbEIsT0FBTyxDQUFDLENBQUMsR0FDMUMsUUFBUSxJQUFJLFNBcndCQyxPQUFPLENBcXdCQSxhQUFhLEVBQUUsR0FDbkMsWUF4dkJ1RCxLQUFLLEVBd3ZCdEQsU0FBUyxFQUFFLGtCQTl3QjJCLE9BQU8sQ0E4d0J0QixPQUFPLENBQUMsQ0FBQyxHQUN0QyxtQkExd0I4QyxNQUFNLEVBMHdCN0MsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFBIiwiZmlsZSI6InByaXZhdGUvdHJhbnNwaWxlL3RyYW5zcGlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHtBcnJheUV4cHJlc3Npb24sIEFycm93RnVuY3Rpb25FeHByZXNzaW9uLCBBc3NpZ25tZW50RXhwcmVzc2lvbiwgQmluYXJ5RXhwcmVzc2lvbixcblx0QmxvY2tTdGF0ZW1lbnQsIEJyZWFrU3RhdGVtZW50LCBDYWxsRXhwcmVzc2lvbiwgQ2F0Y2hDbGF1c2UsIENsYXNzQm9keSwgQ2xhc3NFeHByZXNzaW9uLFxuXHRDb25kaXRpb25hbEV4cHJlc3Npb24sIERlYnVnZ2VyU3RhdGVtZW50LCBFeHByZXNzaW9uU3RhdGVtZW50LCBGb3JPZlN0YXRlbWVudCxcblx0RnVuY3Rpb25FeHByZXNzaW9uLCBJZGVudGlmaWVyLCBJZlN0YXRlbWVudCwgTGl0ZXJhbCwgTG9naWNhbEV4cHJlc3Npb24sIE1lbWJlckV4cHJlc3Npb24sXG5cdE1ldGhvZERlZmluaXRpb24sIE5ld0V4cHJlc3Npb24sIE9iamVjdEV4cHJlc3Npb24sIFByb2dyYW0sIFByb3BlcnR5LCBSZXR1cm5TdGF0ZW1lbnQsXG5cdFNwcmVhZEVsZW1lbnQsIFN3aXRjaENhc2UsIFN3aXRjaFN0YXRlbWVudCwgVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uLCBUZW1wbGF0ZUVsZW1lbnQsXG5cdFRlbXBsYXRlTGl0ZXJhbCwgVGhpc0V4cHJlc3Npb24sIFRocm93U3RhdGVtZW50LCBUcnlTdGF0ZW1lbnQsIFZhcmlhYmxlRGVjbGFyYXRpb24sXG5cdFVuYXJ5RXhwcmVzc2lvbiwgVmFyaWFibGVEZWNsYXJhdG9yLCBZaWVsZEV4cHJlc3Npb259IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IHtmdW5jdGlvbkV4cHJlc3Npb25UaHVuaywgaWRDYWNoZWQsIGxvYywgbWVtYmVyLCBwcm9wZXJ0eUlkT3JMaXRlcmFsQ2FjaGVkLCB0b1N0YXRlbWVudFxuXHR9IGZyb20gJ2VzYXN0L2Rpc3QvdXRpbCdcbmltcG9ydCBtYW5nbGVQYXRoIGZyb20gJy4uL21hbmdsZVBhdGgnXG5pbXBvcnQge2NoZWNrLCBvcHRpb25zLCB3YXJuSWZ9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtBc3NpZ25TaW5nbGUsIENhbGwsIENvbnN0cnVjdG9yLCBMX0FuZCwgTF9PciwgTERfTGF6eSwgTERfTXV0YWJsZSwgTWVtYmVyLCBMb2NhbERlY2xhcmUsXG5cdFBhdHRlcm4sIFNwbGF0LCBTRF9EZWJ1Z2dlciwgU0VUX0luaXQsIFNFVF9Jbml0TXV0YWJsZSwgU0VUX011dGF0ZSwgU1ZfQ29udGFpbnMsIFNWX0ZhbHNlLFxuXHRTVl9OYW1lLCBTVl9OdWxsLCBTVl9TZXRTdWIsIFNWX1N1YiwgU1ZfVHJ1ZSwgU1ZfVW5kZWZpbmVkLCBTd2l0Y2hEb1BhcnQsIFF1b3RlLCBJbXBvcnRcblx0fSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7YXNzZXJ0LCBjYXQsIGZsYXRNYXAsIGZsYXRPcE1hcCwgaWZFbHNlLCBpc0VtcHR5LCBpbXBsZW1lbnRNYW55LCBpc1Bvc2l0aXZlLCBsYXN0LCBvcElmLFxuXHRvcE1hcCwgdGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7QW1kZWZpbmVIZWFkZXIsIEFycmF5U2xpY2VDYWxsLCBEZWNsYXJlQnVpbHRCYWcsIERlY2xhcmVCdWlsdE1hcCwgRGVjbGFyZUJ1aWx0T2JqLFxuXHREZWNsYXJlTGV4aWNhbFRoaXMsIEV4cG9ydHNEZWZhdWx0LCBFeHBvcnRzR2V0LCBJZEFyZ3VtZW50cywgSWRCdWlsdCwgSWRDb25zdHJ1Y3RvciwgSWREZWZpbmUsXG5cdElkRXhwb3J0cywgSWRFeHRyYWN0LCBJZEZvY3VzLCBJZExleGljYWxUaGlzLCBJZFN1cGVyLCBHbG9iYWxFcnJvciwgTGl0RW1wdHlTdHJpbmcsIExpdE51bGwsXG5cdExpdFN0ckV4cG9ydHMsIExpdFN0clRocm93LCBMaXRaZXJvLCBSZXR1cm5CdWlsdCwgUmV0dXJuRXhwb3J0cywgUmV0dXJuUmVzLCBTd2l0Y2hDYXNlTm9NYXRjaCxcblx0VGhyb3dBc3NlcnRGYWlsLCBUaHJvd05vQ2FzZU1hdGNoLCBVc2VTdHJpY3R9IGZyb20gJy4vYXN0LWNvbnN0YW50cydcbmltcG9ydCB7SWRNcywgbGF6eVdyYXAsIG1zQWRkLCBtc0FkZE1hbnksIG1zQXNzZXJ0LCBtc0Fzc2VydE1lbWJlciwgbXNBc3NlcnROb3QsXG5cdG1zQXNzZXJ0Tm90TWVtYmVyLCBtc0Fzc29jLCBtc0NoZWNrQ29udGFpbnMsIG1zRXh0cmFjdCwgbXNHZXQsIG1zR2V0RGVmYXVsdEV4cG9ydCwgbXNHZXRNb2R1bGUsXG5cdG1zTGF6eSwgbXNMYXp5R2V0LCBtc0xhenlHZXRNb2R1bGUsIG1zTmV3TXV0YWJsZVByb3BlcnR5LCBtc05ld1Byb3BlcnR5LCBtc1NldExhenksIG1zU2V0U3ViLFxuXHRtc1NvbWUsIG1zU3ltYm9sLCBNc05vbmV9IGZyb20gJy4vbXMtY2FsbCdcbmltcG9ydCB7YWNjZXNzTG9jYWxEZWNsYXJlLCBkZWNsYXJlLCBmb3JTdGF0ZW1lbnRJbmZpbml0ZSwgaWRGb3JEZWNsYXJlQ2FjaGVkLFxuXHRvcFR5cGVDaGVja0ZvckxvY2FsRGVjbGFyZX0gZnJvbSAnLi91dGlsJ1xuXG5sZXQgdmVyaWZ5UmVzdWx0cywgaXNJbkdlbmVyYXRvciwgaXNJbkNvbnN0cnVjdG9yXG5sZXQgbmV4dERlc3RydWN0dXJlZElkXG5cbmV4cG9ydCBkZWZhdWx0IChtb2R1bGVFeHByZXNzaW9uLCBfdmVyaWZ5UmVzdWx0cykgPT4ge1xuXHR2ZXJpZnlSZXN1bHRzID0gX3ZlcmlmeVJlc3VsdHNcblx0aXNJbkdlbmVyYXRvciA9IGZhbHNlXG5cdGlzSW5Db25zdHJ1Y3RvciA9IGZhbHNlXG5cdG5leHREZXN0cnVjdHVyZWRJZCA9IDBcblx0Y29uc3QgcmVzID0gdDAobW9kdWxlRXhwcmVzc2lvbilcblx0Ly8gUmVsZWFzZSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuXHR2ZXJpZnlSZXN1bHRzID0gbnVsbFxuXHRyZXR1cm4gcmVzXG59XG5cbmV4cG9ydCBjb25zdFxuXHR0MCA9IGV4cHIgPT4gbG9jKGV4cHIudHJhbnNwaWxlKCksIGV4cHIubG9jKVxuY29uc3Rcblx0dDEgPSAoZXhwciwgYXJnKSA9PiBsb2MoZXhwci50cmFuc3BpbGUoYXJnKSwgZXhwci5sb2MpLFxuXHR0MiA9IChleHByLCBhcmcsIGFyZzIpID0+IGxvYyhleHByLnRyYW5zcGlsZShhcmcsIGFyZzIpKSxcblx0dDMgPSAoZXhwciwgYXJnLCBhcmcyLCBhcmczKSA9PiBsb2MoZXhwci50cmFuc3BpbGUoYXJnLCBhcmcyLCBhcmczKSwgZXhwci5sb2MpLFxuXHR0TGluZXMgPSBleHBycyA9PiB7XG5cdFx0Y29uc3Qgb3V0ID0gW11cblx0XHRmb3IgKGNvbnN0IGV4cHIgb2YgZXhwcnMpIHtcblx0XHRcdGNvbnN0IGFzdCA9IGV4cHIudHJhbnNwaWxlKClcblx0XHRcdGlmIChhc3QgaW5zdGFuY2VvZiBBcnJheSlcblx0XHRcdFx0Ly8gSWdub3JlIHByb2R1Y2VzIDAgc3RhdGVtZW50cyBhbmQgUmVnaW9uIHByb2R1Y2VzIG1hbnkuXG5cdFx0XHRcdGZvciAoY29uc3QgXyBvZiBhc3QpXG5cdFx0XHRcdFx0b3V0LnB1c2godG9TdGF0ZW1lbnQoXykpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdG91dC5wdXNoKGxvYyh0b1N0YXRlbWVudChhc3QpLCBleHByLmxvYykpXG5cdFx0fVxuXHRcdHJldHVybiBvdXRcblx0fVxuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICd0cmFuc3BpbGUnLCB7XG5cdEFzc2VydCgpIHtcblx0XHRjb25zdCBmYWlsQ29uZCA9ICgpID0+IHtcblx0XHRcdGNvbnN0IGNvbmQgPSB0MCh0aGlzLmNvbmRpdGlvbilcblx0XHRcdHJldHVybiB0aGlzLm5lZ2F0ZSA/IGNvbmQgOiBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgY29uZClcblx0XHR9XG5cblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BUaHJvd24sXG5cdFx0XHRfID0+IG5ldyBJZlN0YXRlbWVudChmYWlsQ29uZCgpLCBkb1Rocm93KF8pKSxcblx0XHRcdCgpID0+IHtcblx0XHRcdFx0aWYgKHRoaXMuY29uZGl0aW9uIGluc3RhbmNlb2YgQ2FsbCkge1xuXHRcdFx0XHRcdGNvbnN0IGNhbGwgPSB0aGlzLmNvbmRpdGlvblxuXHRcdFx0XHRcdGNvbnN0IGNhbGxlZCA9IGNhbGwuY2FsbGVkXG5cdFx0XHRcdFx0Y29uc3QgYXJncyA9IGNhbGwuYXJncy5tYXAodDApXG5cdFx0XHRcdFx0aWYgKGNhbGxlZCBpbnN0YW5jZW9mIE1lbWJlcikge1xuXHRcdFx0XHRcdFx0Y29uc3QgYXNzID0gdGhpcy5uZWdhdGUgPyBtc0Fzc2VydE5vdE1lbWJlciA6IG1zQXNzZXJ0TWVtYmVyXG5cdFx0XHRcdFx0XHRyZXR1cm4gYXNzKHQwKGNhbGxlZC5vYmplY3QpLCBuZXcgTGl0ZXJhbChjYWxsZWQubmFtZSksIC4uLmFyZ3MpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnN0IGFzcyA9IHRoaXMubmVnYXRlID8gbXNBc3NlcnROb3QgOiBtc0Fzc2VydFxuXHRcdFx0XHRcdFx0cmV0dXJuIGFzcyh0MChjYWxsZWQpLCAuLi5hcmdzKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudChmYWlsQ29uZCgpLCBUaHJvd0Fzc2VydEZhaWwpXG5cdFx0XHR9KVxuXHR9LFxuXG5cdEFzc2lnblNpbmdsZSh2YWxXcmFwKSB7XG5cdFx0Y29uc3QgdmFsID0gdmFsV3JhcCA9PT0gdW5kZWZpbmVkID8gdDAodGhpcy52YWx1ZSkgOiB2YWxXcmFwKHQwKHRoaXMudmFsdWUpKVxuXHRcdGNvbnN0IGRlY2xhcmUgPSBtYWtlRGVjbGFyYXRvcih0aGlzLmFzc2lnbmVlLCB2YWwsIGZhbHNlKVxuXHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbih0aGlzLmFzc2lnbmVlLmlzTXV0YWJsZSgpID8gJ2xldCcgOiAnY29uc3QnLCBbZGVjbGFyZV0pXG5cdH0sXG5cdC8vIFRPRE86RVM2IEp1c3QgdXNlIG5hdGl2ZSBkZXN0cnVjdHVyaW5nIGFzc2lnblxuXHRBc3NpZ25EZXN0cnVjdHVyZSgpIHtcblx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oXG5cdFx0XHR0aGlzLmtpbmQoKSA9PT0gTERfTXV0YWJsZSA/ICdsZXQnIDogJ2NvbnN0Jyxcblx0XHRcdG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzKFxuXHRcdFx0XHR0aGlzLmFzc2lnbmVlcyxcblx0XHRcdFx0dGhpcy5raW5kKCkgPT09IExEX0xhenksXG5cdFx0XHRcdHQwKHRoaXMudmFsdWUpLFxuXHRcdFx0XHRmYWxzZSkpXG5cdH0sXG5cblx0QmFnRW50cnkoKSB7IHJldHVybiBtc0FkZChJZEJ1aWx0LCB0MCh0aGlzLnZhbHVlKSkgfSxcblxuXHRCYWdFbnRyeU1hbnkoKSB7IHJldHVybiBtc0FkZE1hbnkoSWRCdWlsdCwgdDAodGhpcy52YWx1ZSkpIH0sXG5cblx0QmFnU2ltcGxlKCkgeyByZXR1cm4gbmV3IEFycmF5RXhwcmVzc2lvbih0aGlzLnBhcnRzLm1hcCh0MCkpIH0sXG5cblx0QmxvY2tEbyhsZWFkLCBvcERlY2xhcmVSZXMsIGZvbGxvdykge1xuXHRcdC8vIFRPRE86RVM2IE9wdGlvbmFsIGFyZ3VtZW50c1xuXHRcdGlmIChsZWFkID09PSB1bmRlZmluZWQpIGxlYWQgPSBudWxsXG5cdFx0aWYgKG9wRGVjbGFyZVJlcyA9PT0gdW5kZWZpbmVkKSBvcERlY2xhcmVSZXMgPSBudWxsXG5cdFx0aWYgKGZvbGxvdyA9PT0gdW5kZWZpbmVkKSBmb2xsb3cgPSBudWxsXG5cdFx0YXNzZXJ0KG9wRGVjbGFyZVJlcyA9PT0gbnVsbClcblx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChsZWFkLCB0TGluZXModGhpcy5saW5lcyksIGZvbGxvdykpXG5cdH0sXG5cblx0QmxvY2tWYWxUaHJvdyhsZWFkLCBvcERlY2xhcmVSZXMsIGZvbGxvdykge1xuXHRcdC8vIFRPRE86RVM2IE9wdGlvbmFsIGFyZ3VtZW50c1xuXHRcdGlmIChsZWFkID09PSB1bmRlZmluZWQpIGxlYWQgPSBudWxsXG5cdFx0aWYgKG9wRGVjbGFyZVJlcyA9PT0gdW5kZWZpbmVkKSBvcERlY2xhcmVSZXMgPSBudWxsXG5cdFx0aWYgKGZvbGxvdyA9PT0gdW5kZWZpbmVkKSBmb2xsb3cgPSBudWxsXG5cdFx0d2FybklmKG9wRGVjbGFyZVJlcyAhPT0gbnVsbCB8fCBmb2xsb3cgIT09IG51bGwsIHRoaXMubG9jLFxuXHRcdFx0J1JldHVybiB0eXBlIGlnbm9yZWQgYmVjYXVzZSB0aGUgYmxvY2sgYWx3YXlzIHRocm93cy4nKVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHRMaW5lcyh0aGlzLmxpbmVzKSwgdDAodGhpcy50aHJvdykpKVxuXHR9LFxuXG5cdEJsb2NrV2l0aFJldHVybihsZWFkLCBvcERlY2xhcmVSZXMsIGZvbGxvdykge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayh0MCh0aGlzLnJldHVybmVkKSwgdExpbmVzKHRoaXMubGluZXMpLCBsZWFkLCBvcERlY2xhcmVSZXMsIGZvbGxvdylcblx0fSxcblxuXHRCbG9ja0JhZyhsZWFkLCBvcERlY2xhcmVSZXMsIGZvbGxvdykge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayhcblx0XHRcdElkQnVpbHQsXG5cdFx0XHRjYXQoRGVjbGFyZUJ1aWx0QmFnLCB0TGluZXModGhpcy5saW5lcykpLFxuXHRcdFx0bGVhZCwgb3BEZWNsYXJlUmVzLCBmb2xsb3cpXG5cdH0sXG5cblx0QmxvY2tPYmoobGVhZCwgb3BEZWNsYXJlUmVzLCBmb2xsb3cpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2soXG5cdFx0XHRJZEJ1aWx0LFxuXHRcdFx0Y2F0KERlY2xhcmVCdWlsdE9iaiwgdExpbmVzKHRoaXMubGluZXMpKSxcblx0XHRcdGxlYWQsIG9wRGVjbGFyZVJlcywgZm9sbG93KVxuXHR9LFxuXG5cdEJsb2NrTWFwKGxlYWQsIG9wRGVjbGFyZVJlcywgZm9sbG93KSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKFxuXHRcdFx0SWRCdWlsdCxcblx0XHRcdGNhdChEZWNsYXJlQnVpbHRNYXAsIHRMaW5lcyh0aGlzLmxpbmVzKSksXG5cdFx0XHRsZWFkLCBvcERlY2xhcmVSZXMsIGZvbGxvdylcblx0fSxcblxuXHRCbG9ja1dyYXAoKSB7IHJldHVybiBibG9ja1dyYXAodDAodGhpcy5ibG9jaykpIH0sXG5cblx0QnJlYWsoKSB7IHJldHVybiBuZXcgQnJlYWtTdGF0ZW1lbnQoKSB9LFxuXG5cdEJyZWFrV2l0aFZhbCgpIHsgcmV0dXJuIG5ldyBSZXR1cm5TdGF0ZW1lbnQodDAodGhpcy52YWx1ZSkpIH0sXG5cblx0Q2FsbCgpIHtcblx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKHQwKHRoaXMuY2FsbGVkKSwgdGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0Q2FzZURvKCkge1xuXHRcdGNvbnN0IGJvZHkgPSBjYXNlQm9keSh0aGlzLnBhcnRzLCB0aGlzLm9wRWxzZSlcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BDYXNlZCwgXyA9PiBuZXcgQmxvY2tTdGF0ZW1lbnQoW3QwKF8pLCBib2R5XSksICgpID0+IGJvZHkpXG5cdH0sXG5cdENhc2VWYWwoKSB7XG5cdFx0Y29uc3QgYm9keSA9IGNhc2VCb2R5KHRoaXMucGFydHMsIHRoaXMub3BFbHNlKVxuXHRcdGNvbnN0IGJsb2NrID0gaWZFbHNlKHRoaXMub3BDYXNlZCwgXyA9PiBbdDAoXyksIGJvZHldLCAoKSA9PiBbYm9keV0pXG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoYmxvY2spKVxuXHR9LFxuXHRDYXNlRG9QYXJ0OiBjYXNlUGFydCxcblx0Q2FzZVZhbFBhcnQ6IGNhc2VQYXJ0LFxuXG5cdENsYXNzKCkge1xuXHRcdGNvbnN0IG1ldGhvZHMgPSBjYXQoXG5cdFx0XHR0aGlzLnN0YXRpY3MubWFwKF8gPT4gdDEoXywgdHJ1ZSkpLFxuXHRcdFx0b3BNYXAodGhpcy5vcENvbnN0cnVjdG9yLCB0MCksXG5cdFx0XHR0aGlzLm1ldGhvZHMubWFwKF8gPT4gdDEoXywgZmFsc2UpKSlcblx0XHRjb25zdCBvcE5hbWUgPSBvcE1hcCh2ZXJpZnlSZXN1bHRzLm9wTmFtZSh0aGlzKSwgaWRDYWNoZWQpXG5cdFx0Y29uc3QgY2xhc3NFeHByID0gbmV3IENsYXNzRXhwcmVzc2lvbihcblx0XHRcdG9wTmFtZSxcblx0XHRcdG9wTWFwKHRoaXMub3BTdXBlckNsYXNzLCB0MCksIG5ldyBDbGFzc0JvZHkobWV0aG9kcykpXG5cblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BEbywgXyA9PiB0MShfLCBjbGFzc0V4cHIpLCAoKSA9PiBjbGFzc0V4cHIpXG5cdH0sXG5cblx0Q2xhc3NEbyhjbGFzc0V4cHIpIHtcblx0XHRjb25zdCBsZWFkID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgW1xuXHRcdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRvcih0MCh0aGlzLmRlY2xhcmVGb2N1cyksIGNsYXNzRXhwcildKVxuXHRcdGNvbnN0IHJldCA9IG5ldyBSZXR1cm5TdGF0ZW1lbnQodDAodGhpcy5kZWNsYXJlRm9jdXMpKVxuXHRcdGNvbnN0IGJsb2NrID0gdDModGhpcy5ibG9jaywgbGVhZCwgbnVsbCwgcmV0KVxuXHRcdHJldHVybiBibG9ja1dyYXAoYmxvY2spXG5cdH0sXG5cblx0Q29uZCgpIHtcblx0XHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0MCh0aGlzLnRlc3QpLCB0MCh0aGlzLmlmVHJ1ZSksIHQwKHRoaXMuaWZGYWxzZSkpXG5cdH0sXG5cblx0Q29uZGl0aW9uYWxEbygpIHtcblx0XHRjb25zdCB0ZXN0ID0gdDAodGhpcy50ZXN0KVxuXHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQoXG5cdFx0XHR0aGlzLmlzVW5sZXNzID8gbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIHRlc3QpIDogdGVzdCxcblx0XHRcdHQwKHRoaXMucmVzdWx0KSlcblx0fSxcblxuXHRDb25kaXRpb25hbFZhbCgpIHtcblx0XHRjb25zdCB0ZXN0ID0gdDAodGhpcy50ZXN0KVxuXHRcdGNvbnN0IHJlc3VsdCA9IG1zU29tZShibG9ja1dyYXAodDAodGhpcy5yZXN1bHQpKSlcblx0XHRyZXR1cm4gdGhpcy5pc1VubGVzcyA/XG5cdFx0XHRuZXcgQ29uZGl0aW9uYWxFeHByZXNzaW9uKHRlc3QsIE1zTm9uZSwgcmVzdWx0KSA6XG5cdFx0XHRuZXcgQ29uZGl0aW9uYWxFeHByZXNzaW9uKHRlc3QsIHJlc3VsdCwgTXNOb25lKVxuXHR9LFxuXG5cdENvbnN0cnVjdG9yKCkge1xuXHRcdGlzSW5Db25zdHJ1Y3RvciA9IHRydWVcblxuXHRcdC8vIElmIHRoZXJlIGlzIGEgYHN1cGVyIWAsIGB0aGlzYCB3aWxsIG5vdCBiZSBkZWZpbmVkIHVudGlsIHRoZW4sIHNvIG11c3Qgd2FpdCB1bnRpbCB0aGVuLlxuXHRcdC8vIE90aGVyd2lzZSwgZG8gaXQgYXQgdGhlIGJlZ2lubmluZy5cblx0XHRjb25zdCBib2R5ID0gdmVyaWZ5UmVzdWx0cy5jb25zdHJ1Y3RvclRvU3VwZXIuaGFzKHRoaXMpID9cblx0XHRcdHQwKHRoaXMuZnVuKSA6XG5cdFx0XHR0MSh0aGlzLmZ1biwgY29uc3RydWN0b3JTZXRNZW1iZXJzKHRoaXMpKVxuXG5cdFx0Y29uc3QgcmVzID0gbmV3IE1ldGhvZERlZmluaXRpb24oSWRDb25zdHJ1Y3RvciwgYm9keSwgJ2NvbnN0cnVjdG9yJywgZmFsc2UsIGZhbHNlKVxuXHRcdGlzSW5Db25zdHJ1Y3RvciA9IGZhbHNlXG5cdFx0cmV0dXJuIHJlc1xuXHR9LFxuXG5cdENhdGNoKCkge1xuXHRcdHJldHVybiBuZXcgQ2F0Y2hDbGF1c2UodDAodGhpcy5jYXVnaHQpLCB0MCh0aGlzLmJsb2NrKSlcblx0fSxcblxuXHRFeGNlcHREbygpIHsgcmV0dXJuIHRyYW5zcGlsZUV4Y2VwdCh0aGlzKSB9LFxuXHRFeGNlcHRWYWwoKSB7IHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFt0cmFuc3BpbGVFeGNlcHQodGhpcyldKSkgfSxcblxuXHRGb3JEbygpIHsgcmV0dXJuIGZvckxvb3AodGhpcy5vcEl0ZXJhdGVlLCB0aGlzLmJsb2NrKSB9LFxuXG5cdEZvckJhZygpIHtcblx0XHRyZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChbXG5cdFx0XHREZWNsYXJlQnVpbHRCYWcsXG5cdFx0XHRmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jayksXG5cdFx0XHRSZXR1cm5CdWlsdFxuXHRcdF0pKVxuXHR9LFxuXG5cdEZvclZhbCgpIHtcblx0XHRyZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChbZm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spXSkpXG5cdH0sXG5cblx0RnVuKGxlYWRTdGF0ZW1lbnRzKSB7XG5cdFx0Ly8gVE9ETzpFUzYgT3B0aW9uYWwgYXJnc1xuXHRcdGlmIChsZWFkU3RhdGVtZW50cyA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0bGVhZFN0YXRlbWVudHMgPSBudWxsXG5cblx0XHRjb25zdCBvbGRJbkdlbmVyYXRvciA9IGlzSW5HZW5lcmF0b3Jcblx0XHRpc0luR2VuZXJhdG9yID0gdGhpcy5pc0dlbmVyYXRvclxuXG5cdFx0Ly8gVE9ETzpFUzYgdXNlIGAuLi5gZlxuXHRcdGNvbnN0IG5BcmdzID0gbmV3IExpdGVyYWwodGhpcy5hcmdzLmxlbmd0aClcblx0XHRjb25zdCBvcERlY2xhcmVSZXN0ID0gb3BNYXAodGhpcy5vcFJlc3RBcmcsIHJlc3QgPT5cblx0XHRcdGRlY2xhcmUocmVzdCwgbmV3IENhbGxFeHByZXNzaW9uKEFycmF5U2xpY2VDYWxsLCBbSWRBcmd1bWVudHMsIG5BcmdzXSkpKVxuXHRcdGNvbnN0IGFyZ0NoZWNrcyA9IG9wSWYob3B0aW9ucy5pbmNsdWRlQ2hlY2tzKCksICgpID0+XG5cdFx0XHRmbGF0T3BNYXAodGhpcy5hcmdzLCBvcFR5cGVDaGVja0ZvckxvY2FsRGVjbGFyZSkpXG5cblx0XHRjb25zdCBvcERlY2xhcmVUaGlzID1cblx0XHRcdG9wSWYoIWlzSW5Db25zdHJ1Y3RvciAmJiB0aGlzLm9wRGVjbGFyZVRoaXMgIT0gbnVsbCwgKCkgPT4gRGVjbGFyZUxleGljYWxUaGlzKVxuXG5cdFx0Y29uc3QgbGVhZCA9IGNhdChsZWFkU3RhdGVtZW50cywgb3BEZWNsYXJlVGhpcywgb3BEZWNsYXJlUmVzdCwgYXJnQ2hlY2tzKVxuXG5cdFx0Y29uc3QgYm9keSA9IHQyKHRoaXMuYmxvY2ssIGxlYWQsIHRoaXMub3BEZWNsYXJlUmVzKVxuXHRcdGNvbnN0IGFyZ3MgPSB0aGlzLmFyZ3MubWFwKHQwKVxuXHRcdGlzSW5HZW5lcmF0b3IgPSBvbGRJbkdlbmVyYXRvclxuXHRcdGNvbnN0IGlkID0gb3BNYXAodmVyaWZ5UmVzdWx0cy5vcE5hbWUodGhpcyksIGlkQ2FjaGVkKVxuXG5cdFx0Y29uc3QgY2FuVXNlQXJyb3dGdW5jdGlvbiA9XG5cdFx0XHRpZCA9PT0gbnVsbCAmJlxuXHRcdFx0dGhpcy5vcERlY2xhcmVUaGlzID09PSBudWxsICYmXG5cdFx0XHRvcERlY2xhcmVSZXN0ID09PSBudWxsICYmXG5cdFx0XHQhdGhpcy5pc0dlbmVyYXRvclxuXHRcdHJldHVybiBjYW5Vc2VBcnJvd0Z1bmN0aW9uID9cblx0XHRcdG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihhcmdzLCBib2R5KSA6XG5cdFx0XHRuZXcgRnVuY3Rpb25FeHByZXNzaW9uKGlkLCBhcmdzLCBib2R5LCB0aGlzLmlzR2VuZXJhdG9yKVxuXHR9LFxuXG5cdElnbm9yZSgpIHsgcmV0dXJuIFtdIH0sXG5cblx0TGF6eSgpIHsgcmV0dXJuIGxhenlXcmFwKHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdE1ldGhvZEltcGwoaXNTdGF0aWMpIHtcblx0XHRjb25zdCB2YWx1ZSA9IHQwKHRoaXMuZnVuKVxuXHRcdGFzc2VydCh2YWx1ZS5pZCA9PSBudWxsKVxuXHRcdC8vIFNpbmNlIHRoZSBGdW4gc2hvdWxkIGhhdmUgb3BEZWNsYXJlVGhpcywgaXQgd2lsbCBuZXZlciBiZSBhbiBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbi5cblx0XHRhc3NlcnQodmFsdWUgaW5zdGFuY2VvZiBGdW5jdGlvbkV4cHJlc3Npb24pXG5cblx0XHRjb25zdCB7a2V5LCBjb21wdXRlZH0gPSBtZXRob2RLZXlDb21wdXRlZCh0aGlzLnN5bWJvbClcblx0XHRyZXR1cm4gbmV3IE1ldGhvZERlZmluaXRpb24oa2V5LCB2YWx1ZSwgJ21ldGhvZCcsIGlzU3RhdGljLCBjb21wdXRlZClcblx0fSxcblx0TWV0aG9kR2V0dGVyKGlzU3RhdGljKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFtdLCB0MSh0aGlzLmJsb2NrLCBEZWNsYXJlTGV4aWNhbFRoaXMpKVxuXHRcdGNvbnN0IHtrZXksIGNvbXB1dGVkfSA9IG1ldGhvZEtleUNvbXB1dGVkKHRoaXMuc3ltYm9sKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kRGVmaW5pdGlvbihrZXksIHZhbHVlLCAnZ2V0JywgaXNTdGF0aWMsIGNvbXB1dGVkKVxuXHR9LFxuXHRNZXRob2RTZXR0ZXIoaXNTdGF0aWMpIHtcblx0XHRjb25zdCB2YWx1ZSA9IG5ldyBGdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgW0lkRm9jdXNdLCB0MSh0aGlzLmJsb2NrLCBEZWNsYXJlTGV4aWNhbFRoaXMpKVxuXHRcdGNvbnN0IHtrZXksIGNvbXB1dGVkfSA9IG1ldGhvZEtleUNvbXB1dGVkKHRoaXMuc3ltYm9sKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kRGVmaW5pdGlvbihrZXksIHZhbHVlLCAnc2V0JywgaXNTdGF0aWMsIGNvbXB1dGVkKVxuXHR9LFxuXG5cdE51bWJlckxpdGVyYWwoKSB7XG5cdFx0Ly8gTmVnYXRpdmUgbnVtYmVycyBhcmUgbm90IHBhcnQgb2YgRVMgc3BlYy5cblx0XHQvLyBodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNS4xLyNzZWMtNy44LjNcblx0XHRjb25zdCB2YWx1ZSA9IE51bWJlcih0aGlzLnZhbHVlKVxuXHRcdGNvbnN0IGxpdCA9IG5ldyBMaXRlcmFsKE1hdGguYWJzKHZhbHVlKSlcblx0XHRyZXR1cm4gaXNQb3NpdGl2ZSh2YWx1ZSkgPyBsaXQgOiBuZXcgVW5hcnlFeHByZXNzaW9uKCctJywgbGl0KVxuXHR9LFxuXG5cdExvY2FsQWNjZXNzKCkge1xuXHRcdGlmICh0aGlzLm5hbWUgPT09ICd0aGlzJylcblx0XHRcdHJldHVybiBpc0luQ29uc3RydWN0b3IgPyBuZXcgVGhpc0V4cHJlc3Npb24oKSA6IElkTGV4aWNhbFRoaXNcblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IGxkID0gdmVyaWZ5UmVzdWx0cy5sb2NhbERlY2xhcmVGb3JBY2Nlc3ModGhpcylcblx0XHRcdC8vIElmIGxkIG1pc3NpbmcsIHRoaXMgaXMgYSBidWlsdGluLCBhbmQgYnVpbHRpbnMgYXJlIG5ldmVyIGxhenlcblx0XHRcdHJldHVybiBsZCA9PT0gdW5kZWZpbmVkID8gaWRDYWNoZWQodGhpcy5uYW1lKSA6IGFjY2Vzc0xvY2FsRGVjbGFyZShsZClcblx0XHR9XG5cdH0sXG5cblx0TG9jYWxEZWNsYXJlKCkgeyByZXR1cm4gbmV3IElkZW50aWZpZXIoaWRGb3JEZWNsYXJlQ2FjaGVkKHRoaXMpLm5hbWUpIH0sXG5cblx0TG9jYWxNdXRhdGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIGlkQ2FjaGVkKHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdExvZ2ljKCkge1xuXHRcdGFzc2VydCh0aGlzLmtpbmQgPT09IExfQW5kIHx8IHRoaXMua2luZCA9PT0gTF9Pcilcblx0XHRjb25zdCBvcCA9IHRoaXMua2luZCA9PT0gTF9BbmQgPyAnJiYnIDogJ3x8J1xuXHRcdHJldHVybiB0YWlsKHRoaXMuYXJncykucmVkdWNlKChhLCBiKSA9PlxuXHRcdFx0bmV3IExvZ2ljYWxFeHByZXNzaW9uKG9wLCBhLCB0MChiKSksIHQwKHRoaXMuYXJnc1swXSkpXG5cdH0sXG5cblx0TWFwRW50cnkoKSB7IHJldHVybiBtc0Fzc29jKElkQnVpbHQsIHQwKHRoaXMua2V5KSwgdDAodGhpcy52YWwpKSB9LFxuXG5cdE1lbWJlcigpIHtcblx0XHRyZXR1cm4gbWVtYmVyU3RyaW5nT3JWYWwodDAodGhpcy5vYmplY3QpLCB0aGlzLm5hbWUpXG5cdH0sXG5cblx0TWVtYmVyU2V0KCkge1xuXHRcdGNvbnN0IG9iaiA9IHQwKHRoaXMub2JqZWN0KVxuXHRcdGNvbnN0IG5hbWUgPSAoKSA9PlxuXHRcdFx0dHlwZW9mIHRoaXMubmFtZSA9PT0gJ3N0cmluZycgPyBuZXcgTGl0ZXJhbCh0aGlzLm5hbWUpIDogdDAodGhpcy5uYW1lKVxuXHRcdGNvbnN0IHZhbCA9IG1heWJlV3JhcEluQ2hlY2tDb250YWlucyh0MCh0aGlzLnZhbHVlKSwgdGhpcy5vcFR5cGUsIHRoaXMubmFtZSlcblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTRVRfSW5pdDpcblx0XHRcdFx0cmV0dXJuIG1zTmV3UHJvcGVydHkob2JqLCBuYW1lKCksIHZhbClcblx0XHRcdGNhc2UgU0VUX0luaXRNdXRhYmxlOlxuXHRcdFx0XHRyZXR1cm4gbXNOZXdNdXRhYmxlUHJvcGVydHkob2JqLCBuYW1lKCksIHZhbClcblx0XHRcdGNhc2UgU0VUX011dGF0ZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlclN0cmluZ09yVmFsKG9iaiwgdGhpcy5uYW1lKSwgdmFsKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKClcblx0XHR9XG5cdH0sXG5cblx0TW9kdWxlKCkge1xuXHRcdGNvbnN0IGJvZHkgPSB0TGluZXModGhpcy5saW5lcylcblxuXHRcdHZlcmlmeVJlc3VsdHMuYnVpbHRpblBhdGhUb05hbWVzLmZvckVhY2goKGltcG9ydGVkLCBwYXRoKSA9PiB7XG5cdFx0XHRpZiAocGF0aCAhPT0gJ2dsb2JhbCcpIHtcblx0XHRcdFx0Y29uc3QgaW1wb3J0ZWREZWNsYXJlcyA9IFtdXG5cdFx0XHRcdGxldCBvcEltcG9ydERlZmF1bHQgPSBudWxsXG5cdFx0XHRcdGxldCBkZWZhdWx0TmFtZSA9IGxhc3QocGF0aC5zcGxpdCgnLycpKVxuXHRcdFx0XHRmb3IgKGNvbnN0IG5hbWUgb2YgaW1wb3J0ZWQpIHtcblx0XHRcdFx0XHRjb25zdCBkZWNsYXJlID0gTG9jYWxEZWNsYXJlLnBsYWluKHRoaXMubG9jLCBuYW1lKVxuXHRcdFx0XHRcdGlmIChuYW1lID09PSBkZWZhdWx0TmFtZSlcblx0XHRcdFx0XHRcdG9wSW1wb3J0RGVmYXVsdCA9IGRlY2xhcmVcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRpbXBvcnRlZERlY2xhcmVzLnB1c2goZGVjbGFyZSlcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLmltcG9ydHMucHVzaChuZXcgSW1wb3J0KHRoaXMubG9jLCBwYXRoLCBpbXBvcnRlZERlY2xhcmVzLCBvcEltcG9ydERlZmF1bHQpKVxuXHRcdFx0fVxuXHRcdH0pXG5cblx0XHRjb25zdCBhbWQgPSBhbWRXcmFwTW9kdWxlKHRoaXMuZG9JbXBvcnRzLCB0aGlzLmltcG9ydHMsIGJvZHkpXG5cblx0XHRyZXR1cm4gbmV3IFByb2dyYW0oY2F0KFxuXHRcdFx0b3BJZihvcHRpb25zLmluY2x1ZGVVc2VTdHJpY3QoKSwgKCkgPT4gVXNlU3RyaWN0KSxcblx0XHRcdG9wSWYob3B0aW9ucy5pbmNsdWRlQW1kZWZpbmUoKSwgKCkgPT4gQW1kZWZpbmVIZWFkZXIpLFxuXHRcdFx0dG9TdGF0ZW1lbnQoYW1kKSkpXG5cdH0sXG5cblx0TW9kdWxlRXhwb3J0TmFtZWQoKSB7XG5cdFx0cmV0dXJuIHQxKHRoaXMuYXNzaWduLCB2YWwgPT5cblx0XHRcdG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlcihJZEV4cG9ydHMsIHRoaXMuYXNzaWduLmFzc2lnbmVlLm5hbWUpLCB2YWwpKVxuXHR9LFxuXG5cdE1vZHVsZUV4cG9ydERlZmF1bHQoKSB7XG5cdFx0cmV0dXJuIHQxKHRoaXMuYXNzaWduLCB2YWwgPT4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgRXhwb3J0c0RlZmF1bHQsIHZhbCkpXG5cdH0sXG5cblx0TmV3KCkge1xuXHRcdGNvbnN0IGFueVNwbGF0ID0gdGhpcy5hcmdzLnNvbWUoXyA9PiBfIGluc3RhbmNlb2YgU3BsYXQpXG5cdFx0Y2hlY2soIWFueVNwbGF0LCB0aGlzLmxvYywgJ1RPRE86IFNwbGF0IHBhcmFtcyBmb3IgbmV3Jylcblx0XHRyZXR1cm4gbmV3IE5ld0V4cHJlc3Npb24odDAodGhpcy50eXBlKSwgdGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0Tm90KCkgeyByZXR1cm4gbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIHQwKHRoaXMuYXJnKSkgfSxcblxuXHRPYmpFbnRyeUFzc2lnbigpIHtcblx0XHRyZXR1cm4gdGhpcy5hc3NpZ24gaW5zdGFuY2VvZiBBc3NpZ25TaW5nbGUgJiYgIXRoaXMuYXNzaWduLmFzc2lnbmVlLmlzTGF6eSgpID9cblx0XHRcdHQxKHRoaXMuYXNzaWduLCB2YWwgPT5cblx0XHRcdFx0bmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyKElkQnVpbHQsIHRoaXMuYXNzaWduLmFzc2lnbmVlLm5hbWUpLCB2YWwpKSA6XG5cdFx0XHRjYXQoXG5cdFx0XHRcdHQwKHRoaXMuYXNzaWduKSxcblx0XHRcdFx0dGhpcy5hc3NpZ24uYWxsQXNzaWduZWVzKCkubWFwKF8gPT5cblx0XHRcdFx0XHRtc1NldExhenkoSWRCdWlsdCwgbmV3IExpdGVyYWwoXy5uYW1lKSwgaWRGb3JEZWNsYXJlQ2FjaGVkKF8pKSkpXG5cdH0sXG5cblx0T2JqRW50cnlDb21wdXRlZCgpIHtcblx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9Jyxcblx0XHRcdG5ldyBNZW1iZXJFeHByZXNzaW9uKElkQnVpbHQsIHQwKHRoaXMua2V5KSksXG5cdFx0XHR0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRPYmpTaW1wbGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBPYmplY3RFeHByZXNzaW9uKHRoaXMucGFpcnMubWFwKHBhaXIgPT5cblx0XHRcdG5ldyBQcm9wZXJ0eSgnaW5pdCcsIHByb3BlcnR5SWRPckxpdGVyYWxDYWNoZWQocGFpci5rZXkpLCB0MChwYWlyLnZhbHVlKSkpKVxuXHR9LFxuXG5cdFF1b3RlKCkge1xuXHRcdGlmICh0aGlzLnBhcnRzLmxlbmd0aCA9PT0gMClcblx0XHRcdHJldHVybiBMaXRFbXB0eVN0cmluZ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgcXVhc2lzID0gW10sIGV4cHJlc3Npb25zID0gW11cblxuXHRcdFx0Ly8gVGVtcGxhdGVMaXRlcmFsIG11c3Qgc3RhcnQgd2l0aCBhIFRlbXBsYXRlRWxlbWVudFxuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLnBhcnRzWzBdICE9PSAnc3RyaW5nJylcblx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LkVtcHR5KVxuXG5cdFx0XHRmb3IgKGxldCBwYXJ0IG9mIHRoaXMucGFydHMpXG5cdFx0XHRcdGlmICh0eXBlb2YgcGFydCA9PT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmZvclJhd1N0cmluZyhwYXJ0KSlcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Ly8gXCJ7MX17MX1cIiBuZWVkcyBhbiBlbXB0eSBxdWFzaSBpbiB0aGUgbWlkZGxlIChhbmQgb24gdGhlIGVuZHMpXG5cdFx0XHRcdFx0aWYgKHF1YXNpcy5sZW5ndGggPT09IGV4cHJlc3Npb25zLmxlbmd0aClcblx0XHRcdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5FbXB0eSlcblx0XHRcdFx0XHRleHByZXNzaW9ucy5wdXNoKHQwKHBhcnQpKVxuXHRcdFx0XHR9XG5cblx0XHRcdC8vIFRlbXBsYXRlTGl0ZXJhbCBtdXN0IGVuZCB3aXRoIGEgVGVtcGxhdGVFbGVtZW50LCBzbyBvbmUgbW9yZSBxdWFzaSB0aGFuIGV4cHJlc3Npb24uXG5cdFx0XHRpZiAocXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoKVxuXHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuRW1wdHkpXG5cblx0XHRcdHJldHVybiBuZXcgVGVtcGxhdGVMaXRlcmFsKHF1YXNpcywgZXhwcmVzc2lvbnMpXG5cdFx0fVxuXHR9LFxuXG5cdFF1b3RlVGVtcGxhdGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBUYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb24odDAodGhpcy50YWcpLCB0MCh0aGlzLnF1b3RlKSlcblx0fSxcblxuXHRTZXRTdWIoKSB7XG5cdFx0Y29uc3Qga2luZCA9ICgoKSA9PiB7XG5cdFx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0XHRjYXNlIFNFVF9Jbml0OlxuXHRcdFx0XHRcdHJldHVybiAnaW5pdCdcblx0XHRcdFx0Y2FzZSBTRVRfSW5pdE11dGFibGU6XG5cdFx0XHRcdFx0cmV0dXJuICdpbml0LW11dGFibGUnXG5cdFx0XHRcdGNhc2UgU0VUX011dGF0ZTpcblx0XHRcdFx0XHRyZXR1cm4gJ211dGF0ZSdcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0fVxuXHRcdH0pKClcblx0XHRyZXR1cm4gbXNTZXRTdWIoXG5cdFx0XHR0MCh0aGlzLm9iamVjdCksXG5cdFx0XHR0aGlzLnN1YmJlZHMubGVuZ3RoID09PSAxID8gdDAodGhpcy5zdWJiZWRzWzBdKSA6IHRoaXMuc3ViYmVkcy5tYXAodDApLFxuXHRcdFx0bWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHQwKHRoaXMudmFsdWUpLCB0aGlzLm9wVHlwZSwgJ3ZhbHVlJyksXG5cdFx0XHRuZXcgTGl0ZXJhbChraW5kKSlcblx0fSxcblxuXHRTcGVjaWFsRG8oKSB7XG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU0RfRGVidWdnZXI6IHJldHVybiBuZXcgRGVidWdnZXJTdGF0ZW1lbnQoKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHR9XG5cdH0sXG5cblx0U3BlY2lhbFZhbCgpIHtcblx0XHQvLyBNYWtlIG5ldyBvYmplY3RzIGJlY2F1c2Ugd2Ugd2lsbCBhc3NpZ24gYGxvY2AgdG8gdGhlbS5cblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTVl9Db250YWluczogcmV0dXJuIG1lbWJlcihJZE1zLCAnY29udGFpbnMnKVxuXHRcdFx0Y2FzZSBTVl9GYWxzZTogcmV0dXJuIG5ldyBMaXRlcmFsKGZhbHNlKVxuXHRcdFx0Y2FzZSBTVl9OYW1lOiByZXR1cm4gbmV3IExpdGVyYWwodmVyaWZ5UmVzdWx0cy5uYW1lKHRoaXMpKVxuXHRcdFx0Y2FzZSBTVl9OdWxsOiByZXR1cm4gbmV3IExpdGVyYWwobnVsbClcblx0XHRcdGNhc2UgU1ZfU2V0U3ViOiByZXR1cm4gbWVtYmVyKElkTXMsICdzZXRTdWInKVxuXHRcdFx0Y2FzZSBTVl9TdWI6IHJldHVybiBtZW1iZXIoSWRNcywgJ3N1YicpXG5cdFx0XHRjYXNlIFNWX1RydWU6IHJldHVybiBuZXcgTGl0ZXJhbCh0cnVlKVxuXHRcdFx0Y2FzZSBTVl9VbmRlZmluZWQ6IHJldHVybiBuZXcgVW5hcnlFeHByZXNzaW9uKCd2b2lkJywgTGl0WmVybylcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcih0aGlzLmtpbmQpXG5cdFx0fVxuXHR9LFxuXG5cdFNwbGF0KCkge1xuXHRcdHJldHVybiBuZXcgU3ByZWFkRWxlbWVudCh0MCh0aGlzLnNwbGF0dGVkKSlcblx0fSxcblxuXHRTdXBlckNhbGw6IHN1cGVyQ2FsbCxcblx0U3VwZXJDYWxsRG86IHN1cGVyQ2FsbCxcblx0U3VwZXJNZW1iZXIoKSB7XG5cdFx0cmV0dXJuIG1lbWJlclN0cmluZ09yVmFsKElkU3VwZXIsIHRoaXMubmFtZSlcblx0fSxcblxuXHRTd2l0Y2hEbygpIHsgcmV0dXJuIHRyYW5zcGlsZVN3aXRjaCh0aGlzKSB9LFxuXHRTd2l0Y2hWYWwoKSB7IHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFt0cmFuc3BpbGVTd2l0Y2godGhpcyldKSkgfSxcblx0U3dpdGNoRG9QYXJ0OiBzd2l0Y2hQYXJ0LFxuXHRTd2l0Y2hWYWxQYXJ0OiBzd2l0Y2hQYXJ0LFxuXG5cdFRocm93KCkge1xuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcFRocm93bixcblx0XHRcdF8gPT4gZG9UaHJvdyhfKSxcblx0XHRcdCgpID0+IG5ldyBUaHJvd1N0YXRlbWVudChuZXcgTmV3RXhwcmVzc2lvbihHbG9iYWxFcnJvciwgW0xpdFN0clRocm93XSkpKVxuXHR9LFxuXG5cdFdpdGgoKSB7XG5cdFx0Y29uc3QgaWREZWNsYXJlID0gaWRGb3JEZWNsYXJlQ2FjaGVkKHRoaXMuZGVjbGFyZSlcblx0XHRjb25zdCBibG9jayA9IHQzKHRoaXMuYmxvY2ssIG51bGwsIG51bGwsIG5ldyBSZXR1cm5TdGF0ZW1lbnQoaWREZWNsYXJlKSlcblx0XHRjb25zdCBmdW4gPSBpc0luR2VuZXJhdG9yID9cblx0XHRcdG5ldyBGdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgW2lkRGVjbGFyZV0sIGJsb2NrLCB0cnVlKSA6XG5cdFx0XHRuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oW2lkRGVjbGFyZV0sIGJsb2NrKVxuXHRcdGNvbnN0IGNhbGwgPSBuZXcgQ2FsbEV4cHJlc3Npb24oZnVuLCBbdDAodGhpcy52YWx1ZSldKVxuXHRcdHJldHVybiBpc0luR2VuZXJhdG9yID8gbmV3IFlpZWxkRXhwcmVzc2lvbihjYWxsLCB0cnVlKSA6IGNhbGxcblx0fSxcblxuXHRZaWVsZCgpIHsgcmV0dXJuIG5ldyBZaWVsZEV4cHJlc3Npb24ob3BNYXAodGhpcy5vcFlpZWxkZWQsIHQwKSwgZmFsc2UpIH0sXG5cblx0WWllbGRUbygpIHsgcmV0dXJuIG5ldyBZaWVsZEV4cHJlc3Npb24odDAodGhpcy55aWVsZGVkVG8pLCB0cnVlKSB9XG59KVxuXG5mdW5jdGlvbiBjYXNlUGFydChhbHRlcm5hdGUpIHtcblx0aWYgKHRoaXMudGVzdCBpbnN0YW5jZW9mIFBhdHRlcm4pIHtcblx0XHRjb25zdCB7dHlwZSwgcGF0dGVybmVkLCBsb2NhbHN9ID0gdGhpcy50ZXN0XG5cdFx0Y29uc3QgZGVjbCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRFeHRyYWN0LCBtc0V4dHJhY3QodDAodHlwZSksIHQwKHBhdHRlcm5lZCkpKV0pXG5cdFx0Y29uc3QgdGVzdCA9IG5ldyBCaW5hcnlFeHByZXNzaW9uKCchPT0nLCBJZEV4dHJhY3QsIExpdE51bGwpXG5cdFx0Y29uc3QgZXh0cmFjdCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIGxvY2Fscy5tYXAoKF8sIGlkeCkgPT5cblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoXG5cdFx0XHRcdGlkRm9yRGVjbGFyZUNhY2hlZChfKSxcblx0XHRcdFx0bmV3IE1lbWJlckV4cHJlc3Npb24oSWRFeHRyYWN0LCBuZXcgTGl0ZXJhbChpZHgpKSkpKVxuXHRcdGNvbnN0IHJlcyA9IHQxKHRoaXMucmVzdWx0LCBleHRyYWN0KVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoW2RlY2wsIG5ldyBJZlN0YXRlbWVudCh0ZXN0LCByZXMsIGFsdGVybmF0ZSldKVxuXHR9IGVsc2Vcblx0XHQvLyBhbHRlcm5hdGUgd3JpdHRlbiB0byBieSBgY2FzZUJvZHlgLlxuXHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQodDAodGhpcy50ZXN0KSwgdDAodGhpcy5yZXN1bHQpLCBhbHRlcm5hdGUpXG59XG5cbmZ1bmN0aW9uIHN1cGVyQ2FsbCgpIHtcblx0Y29uc3QgYXJncyA9IHRoaXMuYXJncy5tYXAodDApXG5cdGNvbnN0IG1ldGhvZCA9IHZlcmlmeVJlc3VsdHMuc3VwZXJDYWxsVG9NZXRob2QuZ2V0KHRoaXMpXG5cblx0aWYgKG1ldGhvZCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB7XG5cdFx0Y29uc3QgY2FsbCA9IG5ldyBDYWxsRXhwcmVzc2lvbihJZFN1cGVyLCBhcmdzKVxuXHRcdGNvbnN0IG1lbWJlclNldHMgPSBjb25zdHJ1Y3RvclNldE1lbWJlcnMobWV0aG9kKVxuXHRcdHJldHVybiBjYXQoY2FsbCwgbWVtYmVyU2V0cylcblx0fSBlbHNlIHtcblx0XHRjb25zdCBtID0gdHlwZW9mIG1ldGhvZC5zeW1ib2wgPT09ICdzdHJpbmcnID9cblx0XHRcdG1lbWJlcihJZFN1cGVyLCBtZXRob2Quc3ltYm9sKSA6XG5cdFx0XHRuZXcgTWVtYmVyRXhwcmVzc2lvbihJZFN1cGVyLCB0MChtZXRob2Quc3ltYm9sKSlcblx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKG0sIGFyZ3MpXG5cdH1cbn1cblxuZnVuY3Rpb24gc3dpdGNoUGFydCgpIHtcblx0Y29uc3QgZm9sbG93ID0gb3BJZih0aGlzIGluc3RhbmNlb2YgU3dpdGNoRG9QYXJ0LCAoKSA9PiBuZXcgQnJlYWtTdGF0ZW1lbnQpXG5cdC8qXG5cdFdlIGNvdWxkIGp1c3QgcGFzcyBibG9jay5ib2R5IGZvciB0aGUgc3dpdGNoIGxpbmVzLCBidXQgaW5zdGVhZFxuXHRlbmNsb3NlIHRoZSBib2R5IG9mIHRoZSBzd2l0Y2ggY2FzZSBpbiBjdXJseSBicmFjZXMgdG8gZW5zdXJlIGEgbmV3IHNjb3BlLlxuXHRUaGF0IHdheSB0aGlzIGNvZGUgd29ya3M6XG5cdFx0c3dpdGNoICgwKSB7XG5cdFx0XHRjYXNlIDA6IHtcblx0XHRcdFx0Y29uc3QgYSA9IDBcblx0XHRcdFx0cmV0dXJuIGFcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0Ly8gV2l0aG91dCBjdXJseSBicmFjZXMgdGhpcyB3b3VsZCBjb25mbGljdCB3aXRoIHRoZSBvdGhlciBgYWAuXG5cdFx0XHRcdGNvbnN0IGEgPSAxXG5cdFx0XHRcdGFcblx0XHRcdH1cblx0XHR9XG5cdCovXG5cdGNvbnN0IGJsb2NrID0gdDModGhpcy5yZXN1bHQsIG51bGwsIG51bGwsIGZvbGxvdylcblx0Ly8gSWYgc3dpdGNoIGhhcyBtdWx0aXBsZSB2YWx1ZXMsIGJ1aWxkIHVwIGEgc3RhdGVtZW50IGxpa2U6IGBjYXNlIDE6IGNhc2UgMjogeyBkb0Jsb2NrKCkgfWBcblx0Y29uc3QgeCA9IFtdXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy52YWx1ZXMubGVuZ3RoIC0gMTsgaSA9IGkgKyAxKVxuXHRcdC8vIFRoZXNlIGNhc2VzIGZhbGx0aHJvdWdoIHRvIHRoZSBvbmUgYXQgdGhlIGVuZC5cblx0XHR4LnB1c2gobmV3IFN3aXRjaENhc2UodDAodGhpcy52YWx1ZXNbaV0pLCBbXSkpXG5cdHgucHVzaChuZXcgU3dpdGNoQ2FzZSh0MCh0aGlzLnZhbHVlc1t0aGlzLnZhbHVlcy5sZW5ndGggLSAxXSksIFtibG9ja10pKVxuXHRyZXR1cm4geFxufVxuXG4vLyBGdW5jdGlvbnMgc3BlY2lmaWMgdG8gY2VydGFpbiBleHByZXNzaW9ucy5cbmNvbnN0XG5cdC8vIFdyYXBzIGEgYmxvY2sgKHdpdGggYHJldHVybmAgc3RhdGVtZW50cyBpbiBpdCkgaW4gYW4gSUlGRS5cblx0YmxvY2tXcmFwID0gYmxvY2sgPT4ge1xuXHRcdGNvbnN0IGludm9rZSA9IG5ldyBDYWxsRXhwcmVzc2lvbihmdW5jdGlvbkV4cHJlc3Npb25UaHVuayhibG9jaywgaXNJbkdlbmVyYXRvciksIFtdKVxuXHRcdHJldHVybiBpc0luR2VuZXJhdG9yID8gbmV3IFlpZWxkRXhwcmVzc2lvbihpbnZva2UsIHRydWUpIDogaW52b2tlXG5cdH0sXG5cblx0Y2FzZUJvZHkgPSAocGFydHMsIG9wRWxzZSkgPT4ge1xuXHRcdGxldCBhY2MgPSBpZkVsc2Uob3BFbHNlLCB0MCwgKCkgPT4gVGhyb3dOb0Nhc2VNYXRjaClcblx0XHRmb3IgKGxldCBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpID0gaSAtIDEpXG5cdFx0XHRhY2MgPSB0MShwYXJ0c1tpXSwgYWNjKVxuXHRcdHJldHVybiBhY2Ncblx0fSxcblxuXHRjb25zdHJ1Y3RvclNldE1lbWJlcnMgPSBjb25zdHJ1Y3RvciA9PlxuXHRcdGNvbnN0cnVjdG9yLm1lbWJlckFyZ3MubWFwKF8gPT5cblx0XHRcdG1zTmV3UHJvcGVydHkobmV3IFRoaXNFeHByZXNzaW9uKCksIG5ldyBMaXRlcmFsKF8ubmFtZSksIGlkRm9yRGVjbGFyZUNhY2hlZChfKSkpLFxuXG5cdGZvckxvb3AgPSAob3BJdGVyYXRlZSwgYmxvY2spID0+XG5cdFx0aWZFbHNlKG9wSXRlcmF0ZWUsXG5cdFx0XHQoe2VsZW1lbnQsIGJhZ30pID0+IHtcblx0XHRcdFx0Y29uc3QgZGVjbGFyZSA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdsZXQnLFxuXHRcdFx0XHRcdFtuZXcgVmFyaWFibGVEZWNsYXJhdG9yKHQwKGVsZW1lbnQpKV0pXG5cdFx0XHRcdHJldHVybiBuZXcgRm9yT2ZTdGF0ZW1lbnQoZGVjbGFyZSwgdDAoYmFnKSwgdDAoYmxvY2spKVxuXHRcdFx0fSxcblx0XHRcdCgpID0+IGZvclN0YXRlbWVudEluZmluaXRlKHQwKGJsb2NrKSkpLFxuXG5cdGRvVGhyb3cgPSB0aHJvd24gPT5cblx0XHRuZXcgVGhyb3dTdGF0ZW1lbnQodGhyb3duIGluc3RhbmNlb2YgUXVvdGUgP1xuXHRcdFx0bmV3IE5ld0V4cHJlc3Npb24oR2xvYmFsRXJyb3IsIFt0MCh0aHJvd24pXSkgOlxuXHRcdFx0dDAodGhyb3duKSksXG5cblx0bWVtYmVyU3RyaW5nT3JWYWwgPSAob2JqZWN0LCBtZW1iZXJOYW1lKSA9PlxuXHRcdHR5cGVvZiBtZW1iZXJOYW1lID09PSAnc3RyaW5nJyA/XG5cdFx0XHRtZW1iZXIob2JqZWN0LCBtZW1iZXJOYW1lKSA6XG5cdFx0XHRuZXcgTWVtYmVyRXhwcmVzc2lvbihvYmplY3QsIHQwKG1lbWJlck5hbWUpKSxcblxuXHRtZXRob2RLZXlDb21wdXRlZCA9IHN5bWJvbCA9PiB7XG5cdFx0aWYgKHR5cGVvZiBzeW1ib2wgPT09ICdzdHJpbmcnKVxuXHRcdFx0cmV0dXJuIHtrZXk6IHByb3BlcnR5SWRPckxpdGVyYWxDYWNoZWQoc3ltYm9sKSwgY29tcHV0ZWQ6IGZhbHNlfVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3Qga2V5ID0gc3ltYm9sIGluc3RhbmNlb2YgUXVvdGUgPyB0MChzeW1ib2wpIDogbXNTeW1ib2wodDAoc3ltYm9sKSlcblx0XHRcdHJldHVybiB7a2V5LCBjb21wdXRlZDogdHJ1ZX1cblx0XHR9XG5cdH0sXG5cblx0dHJhbnNwaWxlQmxvY2sgPSAocmV0dXJuZWQsIGxpbmVzLCBsZWFkLCBvcERlY2xhcmVSZXMsIGZvbGxvdykgPT4ge1xuXHRcdC8vIFRPRE86RVM2IE9wdGlvbmFsIGFyZ3VtZW50c1xuXHRcdGlmIChsZWFkID09PSB1bmRlZmluZWQpIGxlYWQgPSBudWxsXG5cdFx0aWYgKG9wRGVjbGFyZVJlcyA9PT0gdW5kZWZpbmVkKSBvcERlY2xhcmVSZXMgPSBudWxsXG5cdFx0aWYgKGZvbGxvdyA9PT0gdW5kZWZpbmVkKSBmb2xsb3cgPSBudWxsXG5cdFx0Y29uc3QgZmluID0gaWZFbHNlKG9wRGVjbGFyZVJlcyxcblx0XHRcdHJkID0+IHtcblx0XHRcdFx0Y29uc3QgcmV0ID0gbWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHJldHVybmVkLCByZC5vcFR5cGUsIHJkLm5hbWUpXG5cdFx0XHRcdHJldHVybiBpZkVsc2UoZm9sbG93LFxuXHRcdFx0XHRcdF8gPT4gY2F0KGRlY2xhcmUocmQsIHJldCksIF8sIFJldHVyblJlcyksXG5cdFx0XHRcdFx0KCkgPT4gbmV3IFJldHVyblN0YXRlbWVudChyZXQpKVxuXHRcdFx0fSxcblx0XHRcdCgpID0+IGNhdChmb2xsb3csIG5ldyBSZXR1cm5TdGF0ZW1lbnQocmV0dXJuZWQpKSlcblx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChsZWFkLCBsaW5lcywgZmluKSlcblx0fSxcblxuXHR0cmFuc3BpbGVFeGNlcHQgPSBleGNlcHQgPT5cblx0XHRuZXcgVHJ5U3RhdGVtZW50KFxuXHRcdFx0dDAoZXhjZXB0Ll90cnkpLFxuXHRcdFx0b3BNYXAoZXhjZXB0Ll9jYXRjaCwgdDApLFxuXHRcdFx0b3BNYXAoZXhjZXB0Ll9maW5hbGx5LCB0MCkpLFxuXG5cdHRyYW5zcGlsZVN3aXRjaCA9IF8gPT4ge1xuXHRcdGNvbnN0IHBhcnRzID0gZmxhdE1hcChfLnBhcnRzLCB0MClcblx0XHRwYXJ0cy5wdXNoKGlmRWxzZShfLm9wRWxzZSxcblx0XHRcdF8gPT4gbmV3IFN3aXRjaENhc2UodW5kZWZpbmVkLCB0MChfKS5ib2R5KSxcblx0XHRcdCgpID0+IFN3aXRjaENhc2VOb01hdGNoKSlcblx0XHRyZXR1cm4gbmV3IFN3aXRjaFN0YXRlbWVudCh0MChfLnN3aXRjaGVkKSwgcGFydHMpXG5cdH1cblxuY29uc3QgSWRCb290ID0gbmV3IElkZW50aWZpZXIoJ19ib290JylcblxuLy8gTW9kdWxlIGhlbHBlcnNcbmNvbnN0XG5cdGFtZFdyYXBNb2R1bGUgPSAoZG9JbXBvcnRzLCBpbXBvcnRzLCBib2R5KSA9PiB7XG5cdFx0Y29uc3Qgc2hvdWxkSW1wb3J0Qm9vdCA9IG9wdGlvbnMuaW1wb3J0Qm9vdCgpXG5cblx0XHRjb25zdCBhbGxJbXBvcnRzID0gZG9JbXBvcnRzLmNvbmNhdChpbXBvcnRzKVxuXHRcdGNvbnN0IGFsbEltcG9ydFBhdGhzID0gYWxsSW1wb3J0cy5tYXAoXyA9PiBtYW5nbGVQYXRoKF8ucGF0aCkpXG5cblx0XHRjb25zdCBhcnJJbXBvcnRQYXRocyA9IG5ldyBBcnJheUV4cHJlc3Npb24oY2F0KFxuXHRcdFx0b3BJZihzaG91bGRJbXBvcnRCb290LCAoKSA9PiBuZXcgTGl0ZXJhbChvcHRpb25zLmJvb3RQYXRoKCkpKSxcblx0XHRcdExpdFN0ckV4cG9ydHMsXG5cdFx0XHRhbGxJbXBvcnRQYXRocy5tYXAoXyA9PiBuZXcgTGl0ZXJhbChfKSkpKVxuXG5cdFx0Y29uc3QgaW1wb3J0VG9JZGVudGlmaWVyID0gbmV3IE1hcCgpXG5cdFx0Y29uc3QgaW1wb3J0SWRlbnRpZmllcnMgPSBbXVxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYWxsSW1wb3J0cy5sZW5ndGg7IGkgPSBpICsgMSkge1xuXHRcdFx0Y29uc3QgXyA9IGFsbEltcG9ydHNbaV1cblx0XHRcdGNvbnN0IGlkID0gaWRDYWNoZWQoYCR7cGF0aEJhc2VOYW1lKF8ucGF0aCl9XyR7aX1gKVxuXHRcdFx0aW1wb3J0SWRlbnRpZmllcnMucHVzaChpZClcblx0XHRcdGltcG9ydFRvSWRlbnRpZmllci5zZXQoXywgaWQpXG5cdFx0fVxuXG5cdFx0Y29uc3QgaW1wb3J0QXJncyA9IGNhdChvcElmKHNob3VsZEltcG9ydEJvb3QsICgpID0+IElkQm9vdCksIElkRXhwb3J0cywgaW1wb3J0SWRlbnRpZmllcnMpXG5cblx0XHRjb25zdCBkb0Jvb3QgPSBvcElmKHNob3VsZEltcG9ydEJvb3QsICgpID0+IG5ldyBFeHByZXNzaW9uU3RhdGVtZW50KG1zR2V0TW9kdWxlKElkQm9vdCkpKVxuXG5cdFx0Y29uc3QgaW1wb3J0RG9zID0gZG9JbXBvcnRzLm1hcChfID0+XG5cdFx0XHRsb2MobmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQobXNHZXRNb2R1bGUoaW1wb3J0VG9JZGVudGlmaWVyLmdldChfKSkpLCBfLmxvYykpXG5cblx0XHQvLyBFeHRyYWN0cyBpbXBvcnRlZCB2YWx1ZXMgZnJvbSB0aGUgbW9kdWxlcy5cblx0XHRjb25zdCBvcERlY2xhcmVJbXBvcnRlZExvY2FscyA9IG9wSWYoIWlzRW1wdHkoaW1wb3J0cyksXG5cdFx0XHQoKSA9PiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLFxuXHRcdFx0XHRmbGF0TWFwKGltcG9ydHMsIF8gPT4gaW1wb3J0RGVjbGFyYXRvcnMoXywgaW1wb3J0VG9JZGVudGlmaWVyLmdldChfKSkpKSlcblxuXHRcdGNvbnN0IGZ1bGxCb2R5ID0gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChcblx0XHRcdGRvQm9vdCwgaW1wb3J0RG9zLCBvcERlY2xhcmVJbXBvcnRlZExvY2FscywgYm9keSwgUmV0dXJuRXhwb3J0cykpXG5cblx0XHRjb25zdCBsYXp5Qm9keSA9XG5cdFx0XHRvcHRpb25zLmxhenlNb2R1bGUoKSA/XG5cdFx0XHRcdG5ldyBCbG9ja1N0YXRlbWVudChbbmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQoXG5cdFx0XHRcdFx0bmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgRXhwb3J0c0dldCxcblx0XHRcdFx0XHRcdG1zTGF6eShmdW5jdGlvbkV4cHJlc3Npb25UaHVuayhmdWxsQm9keSkpKSldKSA6XG5cdFx0XHRcdGZ1bGxCb2R5XG5cblx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKElkRGVmaW5lLFxuXHRcdFx0W2FyckltcG9ydFBhdGhzLCBuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oaW1wb3J0QXJncywgbGF6eUJvZHkpXSlcblx0fSxcblxuXHRwYXRoQmFzZU5hbWUgPSBwYXRoID0+XG5cdFx0cGF0aC5zdWJzdHIocGF0aC5sYXN0SW5kZXhPZignLycpICsgMSksXG5cblx0aW1wb3J0RGVjbGFyYXRvcnMgPSAoe2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9LCBtb2R1bGVJZGVudGlmaWVyKSA9PiB7XG5cdFx0Ly8gVE9ETzogQ291bGQgYmUgbmVhdGVyIGFib3V0IHRoaXNcblx0XHRjb25zdCBpc0xhenkgPSAoaXNFbXB0eShpbXBvcnRlZCkgPyBvcEltcG9ydERlZmF1bHQgOiBpbXBvcnRlZFswXSkuaXNMYXp5KClcblx0XHRjb25zdCB2YWx1ZSA9IChpc0xhenkgPyBtc0xhenlHZXRNb2R1bGUgOiBtc0dldE1vZHVsZSkobW9kdWxlSWRlbnRpZmllcilcblxuXHRcdGNvbnN0IGltcG9ydGVkRGVmYXVsdCA9IG9wTWFwKG9wSW1wb3J0RGVmYXVsdCwgZGVmID0+IHtcblx0XHRcdGNvbnN0IGRlZmV4cCA9IG1zR2V0RGVmYXVsdEV4cG9ydChtb2R1bGVJZGVudGlmaWVyKVxuXHRcdFx0Y29uc3QgdmFsID0gaXNMYXp5ID8gbGF6eVdyYXAoZGVmZXhwKSA6IGRlZmV4cFxuXHRcdFx0cmV0dXJuIGxvYyhuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRm9yRGVjbGFyZUNhY2hlZChkZWYpLCB2YWwpLCBkZWYubG9jKVxuXHRcdH0pXG5cblx0XHRjb25zdCBpbXBvcnRlZERlc3RydWN0ID0gaXNFbXB0eShpbXBvcnRlZCkgPyBudWxsIDpcblx0XHRcdG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzKGltcG9ydGVkLCBpc0xhenksIHZhbHVlLCB0cnVlLCBmYWxzZSlcblxuXHRcdHJldHVybiBjYXQoaW1wb3J0ZWREZWZhdWx0LCBpbXBvcnRlZERlc3RydWN0KVxuXHR9XG5cbi8vIEdlbmVyYWwgdXRpbHMuIE5vdCBpbiB1dGlsLmpzIGJlY2F1c2UgdGhlc2UgY2xvc2Ugb3ZlciBjb250ZXh0LlxuY29uc3Rcblx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMgPSAoYXNzaWduZWVzLCBpc0xhenksIHZhbHVlLCBpc01vZHVsZSkgPT4ge1xuXHRcdGNvbnN0IGRlc3RydWN0dXJlZE5hbWUgPSBgXyQke25leHREZXN0cnVjdHVyZWRJZH1gXG5cdFx0bmV4dERlc3RydWN0dXJlZElkID0gbmV4dERlc3RydWN0dXJlZElkICsgMVxuXHRcdGNvbnN0IGlkRGVzdHJ1Y3R1cmVkID0gbmV3IElkZW50aWZpZXIoZGVzdHJ1Y3R1cmVkTmFtZSlcblx0XHRjb25zdCBkZWNsYXJhdG9ycyA9IGFzc2lnbmVlcy5tYXAoYXNzaWduZWUgPT4ge1xuXHRcdFx0Ly8gVE9ETzogRG9uJ3QgY29tcGlsZSBpdCBpZiBpdCdzIG5ldmVyIGFjY2Vzc2VkXG5cdFx0XHRjb25zdCBnZXQgPSBnZXRNZW1iZXIoaWREZXN0cnVjdHVyZWQsIGFzc2lnbmVlLm5hbWUsIGlzTGF6eSwgaXNNb2R1bGUpXG5cdFx0XHRyZXR1cm4gbWFrZURlY2xhcmF0b3IoYXNzaWduZWUsIGdldCwgaXNMYXp5KVxuXHRcdH0pXG5cdFx0Ly8gR2V0dGluZyBsYXp5IG1vZHVsZSBpcyBkb25lIGJ5IG1zLmxhenlHZXRNb2R1bGUuXG5cdFx0Y29uc3QgdmFsID0gaXNMYXp5ICYmICFpc01vZHVsZSA/IGxhenlXcmFwKHZhbHVlKSA6IHZhbHVlXG5cdFx0cmV0dXJuIGNhdChuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRGVzdHJ1Y3R1cmVkLCB2YWwpLCBkZWNsYXJhdG9ycylcblx0fSxcblxuXHRtYWtlRGVjbGFyYXRvciA9IChhc3NpZ25lZSwgdmFsdWUsIHZhbHVlSXNBbHJlYWR5TGF6eSkgPT4ge1xuXHRcdGNvbnN0IHtuYW1lLCBvcFR5cGV9ID0gYXNzaWduZWVcblx0XHRjb25zdCBpc0xhenkgPSBhc3NpZ25lZS5pc0xhenkoKVxuXHRcdC8vIFRPRE86IGFzc2VydChhc3NpZ25lZS5vcFR5cGUgPT09IG51bGwpXG5cdFx0Ly8gb3IgVE9ETzogQWxsb3cgdHlwZSBjaGVjayBvbiBsYXp5IHZhbHVlP1xuXHRcdHZhbHVlID0gaXNMYXp5ID8gdmFsdWUgOiBtYXliZVdyYXBJbkNoZWNrQ29udGFpbnModmFsdWUsIG9wVHlwZSwgbmFtZSlcblx0XHRjb25zdCB2YWwgPSBpc0xhenkgJiYgIXZhbHVlSXNBbHJlYWR5TGF6eSA/IGxhenlXcmFwKHZhbHVlKSA6IHZhbHVlXG5cdFx0YXNzZXJ0KGlzTGF6eSB8fCAhdmFsdWVJc0FscmVhZHlMYXp5KVxuXHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRm9yRGVjbGFyZUNhY2hlZChhc3NpZ25lZSksIHZhbClcblx0fSxcblxuXHRtYXliZVdyYXBJbkNoZWNrQ29udGFpbnMgPSAoYXN0LCBvcFR5cGUsIG5hbWUpID0+XG5cdFx0b3B0aW9ucy5pbmNsdWRlQ2hlY2tzKCkgJiYgb3BUeXBlICE9PSBudWxsID9cblx0XHRcdG1zQ2hlY2tDb250YWlucyh0MChvcFR5cGUpLCBhc3QsIG5ldyBMaXRlcmFsKG5hbWUpKSA6XG5cdFx0XHRhc3QsXG5cblx0Z2V0TWVtYmVyID0gKGFzdE9iamVjdCwgZ290TmFtZSwgaXNMYXp5LCBpc01vZHVsZSkgPT5cblx0XHRpc0xhenkgP1xuXHRcdG1zTGF6eUdldChhc3RPYmplY3QsIG5ldyBMaXRlcmFsKGdvdE5hbWUpKSA6XG5cdFx0aXNNb2R1bGUgJiYgb3B0aW9ucy5pbmNsdWRlQ2hlY2tzKCkgP1xuXHRcdG1zR2V0KGFzdE9iamVjdCwgbmV3IExpdGVyYWwoZ290TmFtZSkpIDpcblx0XHRtZW1iZXIoYXN0T2JqZWN0LCBnb3ROYW1lKVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

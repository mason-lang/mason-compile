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

		ObjEntryPlain() {
			return new _esastDistAst.AssignmentExpression('=', (0, _esastDistUtil.member)(_astConstants.IdBuilt, this.name), t0(this.value));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zcGlsZS5qcyIsInByaXZhdGUvdHJhbnNwaWxlL3RyYW5zcGlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztBQytCQSxLQUFJLGFBQWEsRUFBRSxhQUFhLEVBQUUsZUFBZSxDQUFBO0FBQ2pELEtBQUksa0JBQWtCLENBQUE7O21CQUVQLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxLQUFLO0FBQ3BELGVBQWEsR0FBRyxjQUFjLENBQUE7QUFDOUIsZUFBYSxHQUFHLEtBQUssQ0FBQTtBQUNyQixpQkFBZSxHQUFHLEtBQUssQ0FBQTtBQUN2QixvQkFBa0IsR0FBRyxDQUFDLENBQUE7QUFDdEIsUUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUE7O0FBRWhDLGVBQWEsR0FBRyxJQUFJLENBQUE7QUFDcEIsU0FBTyxHQUFHLENBQUE7RUFDVjs7QUFFTSxPQUNOLEVBQUUsR0FBRyxJQUFJLElBQUksbUJBdEM2QixHQUFHLEVBc0M1QixJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBOztBQUM3QyxPQUNDLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLEtBQUssbUJBeENzQixHQUFHLEVBd0NyQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7T0FDdEQsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEtBQUssbUJBekNnQixHQUFHLEVBeUNmLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO09BQ3hELEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksS0FBSyxtQkExQ1UsR0FBRyxFQTBDVCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFD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RyxDQUFDLENBQUE7RUFDaEU7T0FFRCx3QkFBd0IsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxLQUM1QyxTQWx3QmEsT0FBTyxDQWt3QlosYUFBYSxFQUFFLElBQUksTUFBTSxLQUFLLElBQUksR0FDekMsWUFydkIwQixlQUFlLEVBcXZCekIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRSxrQkEzd0JVLE9BQU8sQ0Eyd0JMLElBQUksQ0FBQyxDQUFDLEdBQ25ELEdBQUc7T0FFTCxTQUFTLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEtBQ2hELE1BQU0sR0FDTixZQXp2Qk8sU0FBUyxFQXl2Qk4sU0FBUyxFQUFFLGtCQWh4QnVCLE9BQU8sQ0FneEJsQixPQUFPLENBQUMsQ0FBQyxHQUMxQyxRQUFRLElBQUksU0F6d0JDLE9BQU8sQ0F5d0JBLGFBQWEsRUFBRSxHQUNuQyxZQTV2QnVELEtBQUssRUE0dkJ0RCxTQUFTLEVBQUUsa0JBbHhCMkIsT0FBTyxDQWt4QnRCLE9BQU8sQ0FBQyxDQUFDLEdBQ3RDLG1CQTl3QjhDLE1BQU0sRUE4d0I3QyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUEiLCJmaWxlIjoicHJpdmF0ZS90cmFuc3BpbGUvdHJhbnNwaWxlLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge0FycmF5RXhwcmVzc2lvbiwgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24sIEFzc2lnbm1lbnRFeHByZXNzaW9uLCBCaW5hcnlFeHByZXNzaW9uLFxuXHRCbG9ja1N0YXRlbWVudCwgQnJlYWtTdGF0ZW1lbnQsIENhbGxFeHByZXNzaW9uLCBDYXRjaENsYXVzZSwgQ2xhc3NCb2R5LCBDbGFzc0V4cHJlc3Npb24sXG5cdENvbmRpdGlvbmFsRXhwcmVzc2lvbiwgRGVidWdnZXJTdGF0ZW1lbnQsIEV4cHJlc3Npb25TdGF0ZW1lbnQsIEZvck9mU3RhdGVtZW50LFxuXHRGdW5jdGlvbkV4cHJlc3Npb24sIElkZW50aWZpZXIsIElmU3RhdGVtZW50LCBMaXRlcmFsLCBMb2dpY2FsRXhwcmVzc2lvbiwgTWVtYmVyRXhwcmVzc2lvbixcblx0TWV0aG9kRGVmaW5pdGlvbiwgTmV3RXhwcmVzc2lvbiwgT2JqZWN0RXhwcmVzc2lvbiwgUHJvZ3JhbSwgUHJvcGVydHksIFJldHVyblN0YXRlbWVudCxcblx0U3ByZWFkRWxlbWVudCwgU3dpdGNoQ2FzZSwgU3dpdGNoU3RhdGVtZW50LCBUYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb24sIFRlbXBsYXRlRWxlbWVudCxcblx0VGVtcGxhdGVMaXRlcmFsLCBUaGlzRXhwcmVzc2lvbiwgVGhyb3dTdGF0ZW1lbnQsIFRyeVN0YXRlbWVudCwgVmFyaWFibGVEZWNsYXJhdGlvbixcblx0VW5hcnlFeHByZXNzaW9uLCBWYXJpYWJsZURlY2xhcmF0b3IsIFlpZWxkRXhwcmVzc2lvbn0gZnJvbSAnZXNhc3QvZGlzdC9hc3QnXG5pbXBvcnQge2Z1bmN0aW9uRXhwcmVzc2lvblRodW5rLCBpZENhY2hlZCwgbG9jLCBtZW1iZXIsIHByb3BlcnR5SWRPckxpdGVyYWxDYWNoZWQsIHRvU3RhdGVtZW50XG5cdH0gZnJvbSAnZXNhc3QvZGlzdC91dGlsJ1xuaW1wb3J0IG1hbmdsZVBhdGggZnJvbSAnLi4vbWFuZ2xlUGF0aCdcbmltcG9ydCB7Y2hlY2ssIG9wdGlvbnMsIHdhcm5JZn0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCAqIGFzIE1zQXN0VHlwZXMgZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0Fzc2lnblNpbmdsZSwgQ2FsbCwgQ29uc3RydWN0b3IsIExfQW5kLCBMX09yLCBMRF9MYXp5LCBMRF9NdXRhYmxlLCBNZW1iZXIsIExvY2FsRGVjbGFyZSxcblx0UGF0dGVybiwgU3BsYXQsIFNEX0RlYnVnZ2VyLCBTRVRfSW5pdCwgU0VUX0luaXRNdXRhYmxlLCBTRVRfTXV0YXRlLCBTVl9Db250YWlucywgU1ZfRmFsc2UsXG5cdFNWX05hbWUsIFNWX051bGwsIFNWX1NldFN1YiwgU1ZfU3ViLCBTVl9UcnVlLCBTVl9VbmRlZmluZWQsIFN3aXRjaERvUGFydCwgUXVvdGUsIEltcG9ydFxuXHR9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHthc3NlcnQsIGNhdCwgZmxhdE1hcCwgZmxhdE9wTWFwLCBpZkVsc2UsIGlzRW1wdHksIGltcGxlbWVudE1hbnksIGlzUG9zaXRpdmUsIGxhc3QsIG9wSWYsXG5cdG9wTWFwLCB0YWlsfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtBbWRlZmluZUhlYWRlciwgQXJyYXlTbGljZUNhbGwsIERlY2xhcmVCdWlsdEJhZywgRGVjbGFyZUJ1aWx0TWFwLCBEZWNsYXJlQnVpbHRPYmosXG5cdERlY2xhcmVMZXhpY2FsVGhpcywgRXhwb3J0c0RlZmF1bHQsIEV4cG9ydHNHZXQsIElkQXJndW1lbnRzLCBJZEJ1aWx0LCBJZENvbnN0cnVjdG9yLCBJZERlZmluZSxcblx0SWRFeHBvcnRzLCBJZEV4dHJhY3QsIElkRm9jdXMsIElkTGV4aWNhbFRoaXMsIElkU3VwZXIsIEdsb2JhbEVycm9yLCBMaXRFbXB0eVN0cmluZywgTGl0TnVsbCxcblx0TGl0U3RyRXhwb3J0cywgTGl0U3RyVGhyb3csIExpdFplcm8sIFJldHVybkJ1aWx0LCBSZXR1cm5FeHBvcnRzLCBSZXR1cm5SZXMsIFN3aXRjaENhc2VOb01hdGNoLFxuXHRUaHJvd0Fzc2VydEZhaWwsIFRocm93Tm9DYXNlTWF0Y2gsIFVzZVN0cmljdH0gZnJvbSAnLi9hc3QtY29uc3RhbnRzJ1xuaW1wb3J0IHtJZE1zLCBsYXp5V3JhcCwgbXNBZGQsIG1zQWRkTWFueSwgbXNBc3NlcnQsIG1zQXNzZXJ0TWVtYmVyLCBtc0Fzc2VydE5vdCxcblx0bXNBc3NlcnROb3RNZW1iZXIsIG1zQXNzb2MsIG1zQ2hlY2tDb250YWlucywgbXNFeHRyYWN0LCBtc0dldCwgbXNHZXREZWZhdWx0RXhwb3J0LCBtc0dldE1vZHVsZSxcblx0bXNMYXp5LCBtc0xhenlHZXQsIG1zTGF6eUdldE1vZHVsZSwgbXNOZXdNdXRhYmxlUHJvcGVydHksIG1zTmV3UHJvcGVydHksIG1zU2V0TGF6eSwgbXNTZXRTdWIsXG5cdG1zU29tZSwgbXNTeW1ib2wsIE1zTm9uZX0gZnJvbSAnLi9tcy1jYWxsJ1xuaW1wb3J0IHthY2Nlc3NMb2NhbERlY2xhcmUsIGRlY2xhcmUsIGZvclN0YXRlbWVudEluZmluaXRlLCBpZEZvckRlY2xhcmVDYWNoZWQsXG5cdG9wVHlwZUNoZWNrRm9yTG9jYWxEZWNsYXJlfSBmcm9tICcuL3V0aWwnXG5cbmxldCB2ZXJpZnlSZXN1bHRzLCBpc0luR2VuZXJhdG9yLCBpc0luQ29uc3RydWN0b3JcbmxldCBuZXh0RGVzdHJ1Y3R1cmVkSWRcblxuZXhwb3J0IGRlZmF1bHQgKG1vZHVsZUV4cHJlc3Npb24sIF92ZXJpZnlSZXN1bHRzKSA9PiB7XG5cdHZlcmlmeVJlc3VsdHMgPSBfdmVyaWZ5UmVzdWx0c1xuXHRpc0luR2VuZXJhdG9yID0gZmFsc2Vcblx0aXNJbkNvbnN0cnVjdG9yID0gZmFsc2Vcblx0bmV4dERlc3RydWN0dXJlZElkID0gMFxuXHRjb25zdCByZXMgPSB0MChtb2R1bGVFeHByZXNzaW9uKVxuXHQvLyBSZWxlYXNlIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXG5cdHZlcmlmeVJlc3VsdHMgPSBudWxsXG5cdHJldHVybiByZXNcbn1cblxuZXhwb3J0IGNvbnN0XG5cdHQwID0gZXhwciA9PiBsb2MoZXhwci50cmFuc3BpbGUoKSwgZXhwci5sb2MpXG5jb25zdFxuXHR0MSA9IChleHByLCBhcmcpID0+IGxvYyhleHByLnRyYW5zcGlsZShhcmcpLCBleHByLmxvYyksXG5cdHQyID0gKGV4cHIsIGFyZywgYXJnMikgPT4gbG9jKGV4cHIudHJhbnNwaWxlKGFyZywgYXJnMikpLFxuXHR0MyA9IChleHByLCBhcmcsIGFyZzIsIGFyZzMpID0+IGxvYyhleHByLnRyYW5zcGlsZShhcmcsIGFyZzIsIGFyZzMpLCBleHByLmxvYyksXG5cdHRMaW5lcyA9IGV4cHJzID0+IHtcblx0XHRjb25zdCBvdXQgPSBbXVxuXHRcdGZvciAoY29uc3QgZXhwciBvZiBleHBycykge1xuXHRcdFx0Y29uc3QgYXN0ID0gZXhwci50cmFuc3BpbGUoKVxuXHRcdFx0aWYgKGFzdCBpbnN0YW5jZW9mIEFycmF5KVxuXHRcdFx0XHQvLyBJZ25vcmUgcHJvZHVjZXMgMCBzdGF0ZW1lbnRzIGFuZCBSZWdpb24gcHJvZHVjZXMgbWFueS5cblx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIGFzdClcblx0XHRcdFx0XHRvdXQucHVzaCh0b1N0YXRlbWVudChfKSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0b3V0LnB1c2gobG9jKHRvU3RhdGVtZW50KGFzdCksIGV4cHIubG9jKSlcblx0XHR9XG5cdFx0cmV0dXJuIG91dFxuXHR9XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ3RyYW5zcGlsZScsIHtcblx0QXNzZXJ0KCkge1xuXHRcdGNvbnN0IGZhaWxDb25kID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgY29uZCA9IHQwKHRoaXMuY29uZGl0aW9uKVxuXHRcdFx0cmV0dXJuIHRoaXMubmVnYXRlID8gY29uZCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCBjb25kKVxuXHRcdH1cblxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcFRocm93bixcblx0XHRcdF8gPT4gbmV3IElmU3RhdGVtZW50KGZhaWxDb25kKCksIGRvVGhyb3coXykpLFxuXHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5jb25kaXRpb24gaW5zdGFuY2VvZiBDYWxsKSB7XG5cdFx0XHRcdFx0Y29uc3QgY2FsbCA9IHRoaXMuY29uZGl0aW9uXG5cdFx0XHRcdFx0Y29uc3QgY2FsbGVkID0gY2FsbC5jYWxsZWRcblx0XHRcdFx0XHRjb25zdCBhcmdzID0gY2FsbC5hcmdzLm1hcCh0MClcblx0XHRcdFx0XHRpZiAoY2FsbGVkIGluc3RhbmNlb2YgTWVtYmVyKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBhc3MgPSB0aGlzLm5lZ2F0ZSA/IG1zQXNzZXJ0Tm90TWVtYmVyIDogbXNBc3NlcnRNZW1iZXJcblx0XHRcdFx0XHRcdHJldHVybiBhc3ModDAoY2FsbGVkLm9iamVjdCksIG5ldyBMaXRlcmFsKGNhbGxlZC5uYW1lKSwgLi4uYXJncylcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc3QgYXNzID0gdGhpcy5uZWdhdGUgPyBtc0Fzc2VydE5vdCA6IG1zQXNzZXJ0XG5cdFx0XHRcdFx0XHRyZXR1cm4gYXNzKHQwKGNhbGxlZCksIC4uLmFyZ3MpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KGZhaWxDb25kKCksIFRocm93QXNzZXJ0RmFpbClcblx0XHRcdH0pXG5cdH0sXG5cblx0QXNzaWduU2luZ2xlKHZhbFdyYXApIHtcblx0XHRjb25zdCB2YWwgPSB2YWxXcmFwID09PSB1bmRlZmluZWQgPyB0MCh0aGlzLnZhbHVlKSA6IHZhbFdyYXAodDAodGhpcy52YWx1ZSkpXG5cdFx0Y29uc3QgZGVjbGFyZSA9IG1ha2VEZWNsYXJhdG9yKHRoaXMuYXNzaWduZWUsIHZhbCwgZmFsc2UpXG5cdFx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKHRoaXMuYXNzaWduZWUuaXNNdXRhYmxlKCkgPyAnbGV0JyA6ICdjb25zdCcsIFtkZWNsYXJlXSlcblx0fSxcblx0Ly8gVE9ETzpFUzYgSnVzdCB1c2UgbmF0aXZlIGRlc3RydWN0dXJpbmcgYXNzaWduXG5cdEFzc2lnbkRlc3RydWN0dXJlKCkge1xuXHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbihcblx0XHRcdHRoaXMua2luZCgpID09PSBMRF9NdXRhYmxlID8gJ2xldCcgOiAnY29uc3QnLFxuXHRcdFx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMoXG5cdFx0XHRcdHRoaXMuYXNzaWduZWVzLFxuXHRcdFx0XHR0aGlzLmtpbmQoKSA9PT0gTERfTGF6eSxcblx0XHRcdFx0dDAodGhpcy52YWx1ZSksXG5cdFx0XHRcdGZhbHNlKSlcblx0fSxcblxuXHRCYWdFbnRyeSgpIHsgcmV0dXJuIG1zQWRkKElkQnVpbHQsIHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdEJhZ0VudHJ5TWFueSgpIHsgcmV0dXJuIG1zQWRkTWFueShJZEJ1aWx0LCB0MCh0aGlzLnZhbHVlKSkgfSxcblxuXHRCYWdTaW1wbGUoKSB7IHJldHVybiBuZXcgQXJyYXlFeHByZXNzaW9uKHRoaXMucGFydHMubWFwKHQwKSkgfSxcblxuXHRCbG9ja0RvKGxlYWQsIG9wRGVjbGFyZVJlcywgZm9sbG93KSB7XG5cdFx0Ly8gVE9ETzpFUzYgT3B0aW9uYWwgYXJndW1lbnRzXG5cdFx0aWYgKGxlYWQgPT09IHVuZGVmaW5lZCkgbGVhZCA9IG51bGxcblx0XHRpZiAob3BEZWNsYXJlUmVzID09PSB1bmRlZmluZWQpIG9wRGVjbGFyZVJlcyA9IG51bGxcblx0XHRpZiAoZm9sbG93ID09PSB1bmRlZmluZWQpIGZvbGxvdyA9IG51bGxcblx0XHRhc3NlcnQob3BEZWNsYXJlUmVzID09PSBudWxsKVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHRMaW5lcyh0aGlzLmxpbmVzKSwgZm9sbG93KSlcblx0fSxcblxuXHRCbG9ja1ZhbFRocm93KGxlYWQsIG9wRGVjbGFyZVJlcywgZm9sbG93KSB7XG5cdFx0Ly8gVE9ETzpFUzYgT3B0aW9uYWwgYXJndW1lbnRzXG5cdFx0aWYgKGxlYWQgPT09IHVuZGVmaW5lZCkgbGVhZCA9IG51bGxcblx0XHRpZiAob3BEZWNsYXJlUmVzID09PSB1bmRlZmluZWQpIG9wRGVjbGFyZVJlcyA9IG51bGxcblx0XHRpZiAoZm9sbG93ID09PSB1bmRlZmluZWQpIGZvbGxvdyA9IG51bGxcblx0XHR3YXJuSWYob3BEZWNsYXJlUmVzICE9PSBudWxsIHx8IGZvbGxvdyAhPT0gbnVsbCwgdGhpcy5sb2MsXG5cdFx0XHQnUmV0dXJuIHR5cGUgaWdub3JlZCBiZWNhdXNlIHRoZSBibG9jayBhbHdheXMgdGhyb3dzLicpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgdExpbmVzKHRoaXMubGluZXMpLCB0MCh0aGlzLnRocm93KSkpXG5cdH0sXG5cblx0QmxvY2tXaXRoUmV0dXJuKGxlYWQsIG9wRGVjbGFyZVJlcywgZm9sbG93KSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKHQwKHRoaXMucmV0dXJuZWQpLCB0TGluZXModGhpcy5saW5lcyksIGxlYWQsIG9wRGVjbGFyZVJlcywgZm9sbG93KVxuXHR9LFxuXG5cdEJsb2NrQmFnKGxlYWQsIG9wRGVjbGFyZVJlcywgZm9sbG93KSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKFxuXHRcdFx0SWRCdWlsdCxcblx0XHRcdGNhdChEZWNsYXJlQnVpbHRCYWcsIHRMaW5lcyh0aGlzLmxpbmVzKSksXG5cdFx0XHRsZWFkLCBvcERlY2xhcmVSZXMsIGZvbGxvdylcblx0fSxcblxuXHRCbG9ja09iaihsZWFkLCBvcERlY2xhcmVSZXMsIGZvbGxvdykge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayhcblx0XHRcdElkQnVpbHQsXG5cdFx0XHRjYXQoRGVjbGFyZUJ1aWx0T2JqLCB0TGluZXModGhpcy5saW5lcykpLFxuXHRcdFx0bGVhZCwgb3BEZWNsYXJlUmVzLCBmb2xsb3cpXG5cdH0sXG5cblx0QmxvY2tNYXAobGVhZCwgb3BEZWNsYXJlUmVzLCBmb2xsb3cpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2soXG5cdFx0XHRJZEJ1aWx0LFxuXHRcdFx0Y2F0KERlY2xhcmVCdWlsdE1hcCwgdExpbmVzKHRoaXMubGluZXMpKSxcblx0XHRcdGxlYWQsIG9wRGVjbGFyZVJlcywgZm9sbG93KVxuXHR9LFxuXG5cdEJsb2NrV3JhcCgpIHsgcmV0dXJuIGJsb2NrV3JhcCh0MCh0aGlzLmJsb2NrKSkgfSxcblxuXHRCcmVhaygpIHsgcmV0dXJuIG5ldyBCcmVha1N0YXRlbWVudCgpIH0sXG5cblx0QnJlYWtXaXRoVmFsKCkgeyByZXR1cm4gbmV3IFJldHVyblN0YXRlbWVudCh0MCh0aGlzLnZhbHVlKSkgfSxcblxuXHRDYWxsKCkge1xuXHRcdHJldHVybiBuZXcgQ2FsbEV4cHJlc3Npb24odDAodGhpcy5jYWxsZWQpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHRDYXNlRG8oKSB7XG5cdFx0Y29uc3QgYm9keSA9IGNhc2VCb2R5KHRoaXMucGFydHMsIHRoaXMub3BFbHNlKVxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcENhc2VkLCBfID0+IG5ldyBCbG9ja1N0YXRlbWVudChbdDAoXyksIGJvZHldKSwgKCkgPT4gYm9keSlcblx0fSxcblx0Q2FzZVZhbCgpIHtcblx0XHRjb25zdCBib2R5ID0gY2FzZUJvZHkodGhpcy5wYXJ0cywgdGhpcy5vcEVsc2UpXG5cdFx0Y29uc3QgYmxvY2sgPSBpZkVsc2UodGhpcy5vcENhc2VkLCBfID0+IFt0MChfKSwgYm9keV0sICgpID0+IFtib2R5XSlcblx0XHRyZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChibG9jaykpXG5cdH0sXG5cdENhc2VEb1BhcnQ6IGNhc2VQYXJ0LFxuXHRDYXNlVmFsUGFydDogY2FzZVBhcnQsXG5cblx0Q2xhc3MoKSB7XG5cdFx0Y29uc3QgbWV0aG9kcyA9IGNhdChcblx0XHRcdHRoaXMuc3RhdGljcy5tYXAoXyA9PiB0MShfLCB0cnVlKSksXG5cdFx0XHRvcE1hcCh0aGlzLm9wQ29uc3RydWN0b3IsIHQwKSxcblx0XHRcdHRoaXMubWV0aG9kcy5tYXAoXyA9PiB0MShfLCBmYWxzZSkpKVxuXHRcdGNvbnN0IG9wTmFtZSA9IG9wTWFwKHZlcmlmeVJlc3VsdHMub3BOYW1lKHRoaXMpLCBpZENhY2hlZClcblx0XHRjb25zdCBjbGFzc0V4cHIgPSBuZXcgQ2xhc3NFeHByZXNzaW9uKFxuXHRcdFx0b3BOYW1lLFxuXHRcdFx0b3BNYXAodGhpcy5vcFN1cGVyQ2xhc3MsIHQwKSwgbmV3IENsYXNzQm9keShtZXRob2RzKSlcblxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcERvLCBfID0+IHQxKF8sIGNsYXNzRXhwciksICgpID0+IGNsYXNzRXhwcilcblx0fSxcblxuXHRDbGFzc0RvKGNsYXNzRXhwcikge1xuXHRcdGNvbnN0IGxlYWQgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBbXG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKHQwKHRoaXMuZGVjbGFyZUZvY3VzKSwgY2xhc3NFeHByKV0pXG5cdFx0Y29uc3QgcmV0ID0gbmV3IFJldHVyblN0YXRlbWVudCh0MCh0aGlzLmRlY2xhcmVGb2N1cykpXG5cdFx0Y29uc3QgYmxvY2sgPSB0Myh0aGlzLmJsb2NrLCBsZWFkLCBudWxsLCByZXQpXG5cdFx0cmV0dXJuIGJsb2NrV3JhcChibG9jaylcblx0fSxcblxuXHRDb25kKCkge1xuXHRcdHJldHVybiBuZXcgQ29uZGl0aW9uYWxFeHByZXNzaW9uKHQwKHRoaXMudGVzdCksIHQwKHRoaXMuaWZUcnVlKSwgdDAodGhpcy5pZkZhbHNlKSlcblx0fSxcblxuXHRDb25kaXRpb25hbERvKCkge1xuXHRcdGNvbnN0IHRlc3QgPSB0MCh0aGlzLnRlc3QpXG5cdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudChcblx0XHRcdHRoaXMuaXNVbmxlc3MgPyBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgdGVzdCkgOiB0ZXN0LFxuXHRcdFx0dDAodGhpcy5yZXN1bHQpKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsVmFsKCkge1xuXHRcdGNvbnN0IHRlc3QgPSB0MCh0aGlzLnRlc3QpXG5cdFx0Y29uc3QgcmVzdWx0ID0gbXNTb21lKGJsb2NrV3JhcCh0MCh0aGlzLnJlc3VsdCkpKVxuXHRcdHJldHVybiB0aGlzLmlzVW5sZXNzID9cblx0XHRcdG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odGVzdCwgTXNOb25lLCByZXN1bHQpIDpcblx0XHRcdG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odGVzdCwgcmVzdWx0LCBNc05vbmUpXG5cdH0sXG5cblx0Q29uc3RydWN0b3IoKSB7XG5cdFx0aXNJbkNvbnN0cnVjdG9yID0gdHJ1ZVxuXG5cdFx0Ly8gSWYgdGhlcmUgaXMgYSBgc3VwZXIhYCwgYHRoaXNgIHdpbGwgbm90IGJlIGRlZmluZWQgdW50aWwgdGhlbiwgc28gbXVzdCB3YWl0IHVudGlsIHRoZW4uXG5cdFx0Ly8gT3RoZXJ3aXNlLCBkbyBpdCBhdCB0aGUgYmVnaW5uaW5nLlxuXHRcdGNvbnN0IGJvZHkgPSB2ZXJpZnlSZXN1bHRzLmNvbnN0cnVjdG9yVG9TdXBlci5oYXModGhpcykgP1xuXHRcdFx0dDAodGhpcy5mdW4pIDpcblx0XHRcdHQxKHRoaXMuZnVuLCBjb25zdHJ1Y3RvclNldE1lbWJlcnModGhpcykpXG5cblx0XHRjb25zdCByZXMgPSBuZXcgTWV0aG9kRGVmaW5pdGlvbihJZENvbnN0cnVjdG9yLCBib2R5LCAnY29uc3RydWN0b3InLCBmYWxzZSwgZmFsc2UpXG5cdFx0aXNJbkNvbnN0cnVjdG9yID0gZmFsc2Vcblx0XHRyZXR1cm4gcmVzXG5cdH0sXG5cblx0Q2F0Y2goKSB7XG5cdFx0cmV0dXJuIG5ldyBDYXRjaENsYXVzZSh0MCh0aGlzLmNhdWdodCksIHQwKHRoaXMuYmxvY2spKVxuXHR9LFxuXG5cdEV4Y2VwdERvKCkgeyByZXR1cm4gdHJhbnNwaWxlRXhjZXB0KHRoaXMpIH0sXG5cdEV4Y2VwdFZhbCgpIHsgcmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW3RyYW5zcGlsZUV4Y2VwdCh0aGlzKV0pKSB9LFxuXG5cdEZvckRvKCkgeyByZXR1cm4gZm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spIH0sXG5cblx0Rm9yQmFnKCkge1xuXHRcdHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFtcblx0XHRcdERlY2xhcmVCdWlsdEJhZyxcblx0XHRcdGZvckxvb3AodGhpcy5vcEl0ZXJhdGVlLCB0aGlzLmJsb2NrKSxcblx0XHRcdFJldHVybkJ1aWx0XG5cdFx0XSkpXG5cdH0sXG5cblx0Rm9yVmFsKCkge1xuXHRcdHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFtmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jayldKSlcblx0fSxcblxuXHRGdW4obGVhZFN0YXRlbWVudHMpIHtcblx0XHQvLyBUT0RPOkVTNiBPcHRpb25hbCBhcmdzXG5cdFx0aWYgKGxlYWRTdGF0ZW1lbnRzID09PSB1bmRlZmluZWQpXG5cdFx0XHRsZWFkU3RhdGVtZW50cyA9IG51bGxcblxuXHRcdGNvbnN0IG9sZEluR2VuZXJhdG9yID0gaXNJbkdlbmVyYXRvclxuXHRcdGlzSW5HZW5lcmF0b3IgPSB0aGlzLmlzR2VuZXJhdG9yXG5cblx0XHQvLyBUT0RPOkVTNiB1c2UgYC4uLmBmXG5cdFx0Y29uc3QgbkFyZ3MgPSBuZXcgTGl0ZXJhbCh0aGlzLmFyZ3MubGVuZ3RoKVxuXHRcdGNvbnN0IG9wRGVjbGFyZVJlc3QgPSBvcE1hcCh0aGlzLm9wUmVzdEFyZywgcmVzdCA9PlxuXHRcdFx0ZGVjbGFyZShyZXN0LCBuZXcgQ2FsbEV4cHJlc3Npb24oQXJyYXlTbGljZUNhbGwsIFtJZEFyZ3VtZW50cywgbkFyZ3NdKSkpXG5cdFx0Y29uc3QgYXJnQ2hlY2tzID0gb3BJZihvcHRpb25zLmluY2x1ZGVDaGVja3MoKSwgKCkgPT5cblx0XHRcdGZsYXRPcE1hcCh0aGlzLmFyZ3MsIG9wVHlwZUNoZWNrRm9yTG9jYWxEZWNsYXJlKSlcblxuXHRcdGNvbnN0IG9wRGVjbGFyZVRoaXMgPVxuXHRcdFx0b3BJZighaXNJbkNvbnN0cnVjdG9yICYmIHRoaXMub3BEZWNsYXJlVGhpcyAhPSBudWxsLCAoKSA9PiBEZWNsYXJlTGV4aWNhbFRoaXMpXG5cblx0XHRjb25zdCBsZWFkID0gY2F0KGxlYWRTdGF0ZW1lbnRzLCBvcERlY2xhcmVUaGlzLCBvcERlY2xhcmVSZXN0LCBhcmdDaGVja3MpXG5cblx0XHRjb25zdCBib2R5ID0gdDIodGhpcy5ibG9jaywgbGVhZCwgdGhpcy5vcERlY2xhcmVSZXMpXG5cdFx0Y29uc3QgYXJncyA9IHRoaXMuYXJncy5tYXAodDApXG5cdFx0aXNJbkdlbmVyYXRvciA9IG9sZEluR2VuZXJhdG9yXG5cdFx0Y29uc3QgaWQgPSBvcE1hcCh2ZXJpZnlSZXN1bHRzLm9wTmFtZSh0aGlzKSwgaWRDYWNoZWQpXG5cblx0XHRjb25zdCBjYW5Vc2VBcnJvd0Z1bmN0aW9uID1cblx0XHRcdGlkID09PSBudWxsICYmXG5cdFx0XHR0aGlzLm9wRGVjbGFyZVRoaXMgPT09IG51bGwgJiZcblx0XHRcdG9wRGVjbGFyZVJlc3QgPT09IG51bGwgJiZcblx0XHRcdCF0aGlzLmlzR2VuZXJhdG9yXG5cdFx0cmV0dXJuIGNhblVzZUFycm93RnVuY3Rpb24gP1xuXHRcdFx0bmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKGFyZ3MsIGJvZHkpIDpcblx0XHRcdG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIGFyZ3MsIGJvZHksIHRoaXMuaXNHZW5lcmF0b3IpXG5cdH0sXG5cblx0SWdub3JlKCkgeyByZXR1cm4gW10gfSxcblxuXHRMYXp5KCkgeyByZXR1cm4gbGF6eVdyYXAodDAodGhpcy52YWx1ZSkpIH0sXG5cblx0TWV0aG9kSW1wbChpc1N0YXRpYykge1xuXHRcdGNvbnN0IHZhbHVlID0gdDAodGhpcy5mdW4pXG5cdFx0YXNzZXJ0KHZhbHVlLmlkID09IG51bGwpXG5cdFx0Ly8gU2luY2UgdGhlIEZ1biBzaG91bGQgaGF2ZSBvcERlY2xhcmVUaGlzLCBpdCB3aWxsIG5ldmVyIGJlIGFuIEFycm93RnVuY3Rpb25FeHByZXNzaW9uLlxuXHRcdGFzc2VydCh2YWx1ZSBpbnN0YW5jZW9mIEZ1bmN0aW9uRXhwcmVzc2lvbilcblxuXHRcdGNvbnN0IHtrZXksIGNvbXB1dGVkfSA9IG1ldGhvZEtleUNvbXB1dGVkKHRoaXMuc3ltYm9sKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kRGVmaW5pdGlvbihrZXksIHZhbHVlLCAnbWV0aG9kJywgaXNTdGF0aWMsIGNvbXB1dGVkKVxuXHR9LFxuXHRNZXRob2RHZXR0ZXIoaXNTdGF0aWMpIHtcblx0XHRjb25zdCB2YWx1ZSA9IG5ldyBGdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgW10sIHQxKHRoaXMuYmxvY2ssIERlY2xhcmVMZXhpY2FsVGhpcykpXG5cdFx0Y29uc3Qge2tleSwgY29tcHV0ZWR9ID0gbWV0aG9kS2V5Q29tcHV0ZWQodGhpcy5zeW1ib2wpXG5cdFx0cmV0dXJuIG5ldyBNZXRob2REZWZpbml0aW9uKGtleSwgdmFsdWUsICdnZXQnLCBpc1N0YXRpYywgY29tcHV0ZWQpXG5cdH0sXG5cdE1ldGhvZFNldHRlcihpc1N0YXRpYykge1xuXHRcdGNvbnN0IHZhbHVlID0gbmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihudWxsLCBbSWRGb2N1c10sIHQxKHRoaXMuYmxvY2ssIERlY2xhcmVMZXhpY2FsVGhpcykpXG5cdFx0Y29uc3Qge2tleSwgY29tcHV0ZWR9ID0gbWV0aG9kS2V5Q29tcHV0ZWQodGhpcy5zeW1ib2wpXG5cdFx0cmV0dXJuIG5ldyBNZXRob2REZWZpbml0aW9uKGtleSwgdmFsdWUsICdzZXQnLCBpc1N0YXRpYywgY29tcHV0ZWQpXG5cdH0sXG5cblx0TnVtYmVyTGl0ZXJhbCgpIHtcblx0XHQvLyBOZWdhdGl2ZSBudW1iZXJzIGFyZSBub3QgcGFydCBvZiBFUyBzcGVjLlxuXHRcdC8vIGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi81LjEvI3NlYy03LjguM1xuXHRcdGNvbnN0IHZhbHVlID0gTnVtYmVyKHRoaXMudmFsdWUpXG5cdFx0Y29uc3QgbGl0ID0gbmV3IExpdGVyYWwoTWF0aC5hYnModmFsdWUpKVxuXHRcdHJldHVybiBpc1Bvc2l0aXZlKHZhbHVlKSA/IGxpdCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJy0nLCBsaXQpXG5cdH0sXG5cblx0TG9jYWxBY2Nlc3MoKSB7XG5cdFx0aWYgKHRoaXMubmFtZSA9PT0gJ3RoaXMnKVxuXHRcdFx0cmV0dXJuIGlzSW5Db25zdHJ1Y3RvciA/IG5ldyBUaGlzRXhwcmVzc2lvbigpIDogSWRMZXhpY2FsVGhpc1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgbGQgPSB2ZXJpZnlSZXN1bHRzLmxvY2FsRGVjbGFyZUZvckFjY2Vzcyh0aGlzKVxuXHRcdFx0Ly8gSWYgbGQgbWlzc2luZywgdGhpcyBpcyBhIGJ1aWx0aW4sIGFuZCBidWlsdGlucyBhcmUgbmV2ZXIgbGF6eVxuXHRcdFx0cmV0dXJuIGxkID09PSB1bmRlZmluZWQgPyBpZENhY2hlZCh0aGlzLm5hbWUpIDogYWNjZXNzTG9jYWxEZWNsYXJlKGxkKVxuXHRcdH1cblx0fSxcblxuXHRMb2NhbERlY2xhcmUoKSB7IHJldHVybiBuZXcgSWRlbnRpZmllcihpZEZvckRlY2xhcmVDYWNoZWQodGhpcykubmFtZSkgfSxcblxuXHRMb2NhbE11dGF0ZSgpIHtcblx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgaWRDYWNoZWQodGhpcy5uYW1lKSwgdDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0TG9naWMoKSB7XG5cdFx0YXNzZXJ0KHRoaXMua2luZCA9PT0gTF9BbmQgfHwgdGhpcy5raW5kID09PSBMX09yKVxuXHRcdGNvbnN0IG9wID0gdGhpcy5raW5kID09PSBMX0FuZCA/ICcmJicgOiAnfHwnXG5cdFx0cmV0dXJuIHRhaWwodGhpcy5hcmdzKS5yZWR1Y2UoKGEsIGIpID0+XG5cdFx0XHRuZXcgTG9naWNhbEV4cHJlc3Npb24ob3AsIGEsIHQwKGIpKSwgdDAodGhpcy5hcmdzWzBdKSlcblx0fSxcblxuXHRNYXBFbnRyeSgpIHsgcmV0dXJuIG1zQXNzb2MoSWRCdWlsdCwgdDAodGhpcy5rZXkpLCB0MCh0aGlzLnZhbCkpIH0sXG5cblx0TWVtYmVyKCkge1xuXHRcdHJldHVybiBtZW1iZXJTdHJpbmdPclZhbCh0MCh0aGlzLm9iamVjdCksIHRoaXMubmFtZSlcblx0fSxcblxuXHRNZW1iZXJTZXQoKSB7XG5cdFx0Y29uc3Qgb2JqID0gdDAodGhpcy5vYmplY3QpXG5cdFx0Y29uc3QgbmFtZSA9ICgpID0+XG5cdFx0XHR0eXBlb2YgdGhpcy5uYW1lID09PSAnc3RyaW5nJyA/IG5ldyBMaXRlcmFsKHRoaXMubmFtZSkgOiB0MCh0aGlzLm5hbWUpXG5cdFx0Y29uc3QgdmFsID0gbWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHQwKHRoaXMudmFsdWUpLCB0aGlzLm9wVHlwZSwgdGhpcy5uYW1lKVxuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIFNFVF9Jbml0OlxuXHRcdFx0XHRyZXR1cm4gbXNOZXdQcm9wZXJ0eShvYmosIG5hbWUoKSwgdmFsKVxuXHRcdFx0Y2FzZSBTRVRfSW5pdE11dGFibGU6XG5cdFx0XHRcdHJldHVybiBtc05ld011dGFibGVQcm9wZXJ0eShvYmosIG5hbWUoKSwgdmFsKVxuXHRcdFx0Y2FzZSBTRVRfTXV0YXRlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyU3RyaW5nT3JWYWwob2JqLCB0aGlzLm5hbWUpLCB2YWwpXG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdH1cblx0fSxcblxuXHRNb2R1bGUoKSB7XG5cdFx0Y29uc3QgYm9keSA9IHRMaW5lcyh0aGlzLmxpbmVzKVxuXG5cdFx0dmVyaWZ5UmVzdWx0cy5idWlsdGluUGF0aFRvTmFtZXMuZm9yRWFjaCgoaW1wb3J0ZWQsIHBhdGgpID0+IHtcblx0XHRcdGlmIChwYXRoICE9PSAnZ2xvYmFsJykge1xuXHRcdFx0XHRjb25zdCBpbXBvcnRlZERlY2xhcmVzID0gW11cblx0XHRcdFx0bGV0IG9wSW1wb3J0RGVmYXVsdCA9IG51bGxcblx0XHRcdFx0bGV0IGRlZmF1bHROYW1lID0gbGFzdChwYXRoLnNwbGl0KCcvJykpXG5cdFx0XHRcdGZvciAoY29uc3QgbmFtZSBvZiBpbXBvcnRlZCkge1xuXHRcdFx0XHRcdGNvbnN0IGRlY2xhcmUgPSBMb2NhbERlY2xhcmUucGxhaW4odGhpcy5sb2MsIG5hbWUpXG5cdFx0XHRcdFx0aWYgKG5hbWUgPT09IGRlZmF1bHROYW1lKVxuXHRcdFx0XHRcdFx0b3BJbXBvcnREZWZhdWx0ID0gZGVjbGFyZVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGltcG9ydGVkRGVjbGFyZXMucHVzaChkZWNsYXJlKVxuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuaW1wb3J0cy5wdXNoKG5ldyBJbXBvcnQodGhpcy5sb2MsIHBhdGgsIGltcG9ydGVkRGVjbGFyZXMsIG9wSW1wb3J0RGVmYXVsdCkpXG5cdFx0XHR9XG5cdFx0fSlcblxuXHRcdGNvbnN0IGFtZCA9IGFtZFdyYXBNb2R1bGUodGhpcy5kb0ltcG9ydHMsIHRoaXMuaW1wb3J0cywgYm9keSlcblxuXHRcdHJldHVybiBuZXcgUHJvZ3JhbShjYXQoXG5cdFx0XHRvcElmKG9wdGlvbnMuaW5jbHVkZVVzZVN0cmljdCgpLCAoKSA9PiBVc2VTdHJpY3QpLFxuXHRcdFx0b3BJZihvcHRpb25zLmluY2x1ZGVBbWRlZmluZSgpLCAoKSA9PiBBbWRlZmluZUhlYWRlciksXG5cdFx0XHR0b1N0YXRlbWVudChhbWQpKSlcblx0fSxcblxuXHRNb2R1bGVFeHBvcnROYW1lZCgpIHtcblx0XHRyZXR1cm4gdDEodGhpcy5hc3NpZ24sIHZhbCA9PlxuXHRcdFx0bmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyKElkRXhwb3J0cywgdGhpcy5hc3NpZ24uYXNzaWduZWUubmFtZSksIHZhbCkpXG5cdH0sXG5cblx0TW9kdWxlRXhwb3J0RGVmYXVsdCgpIHtcblx0XHRyZXR1cm4gdDEodGhpcy5hc3NpZ24sIHZhbCA9PiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBFeHBvcnRzRGVmYXVsdCwgdmFsKSlcblx0fSxcblxuXHROZXcoKSB7XG5cdFx0Y29uc3QgYW55U3BsYXQgPSB0aGlzLmFyZ3Muc29tZShfID0+IF8gaW5zdGFuY2VvZiBTcGxhdClcblx0XHRjaGVjayghYW55U3BsYXQsIHRoaXMubG9jLCAnVE9ETzogU3BsYXQgcGFyYW1zIGZvciBuZXcnKVxuXHRcdHJldHVybiBuZXcgTmV3RXhwcmVzc2lvbih0MCh0aGlzLnR5cGUpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHROb3QoKSB7IHJldHVybiBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgdDAodGhpcy5hcmcpKSB9LFxuXG5cdE9iakVudHJ5QXNzaWduKCkge1xuXHRcdHJldHVybiB0aGlzLmFzc2lnbiBpbnN0YW5jZW9mIEFzc2lnblNpbmdsZSAmJiAhdGhpcy5hc3NpZ24uYXNzaWduZWUuaXNMYXp5KCkgP1xuXHRcdFx0dDEodGhpcy5hc3NpZ24sIHZhbCA9PlxuXHRcdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRCdWlsdCwgdGhpcy5hc3NpZ24uYXNzaWduZWUubmFtZSksIHZhbCkpIDpcblx0XHRcdGNhdChcblx0XHRcdFx0dDAodGhpcy5hc3NpZ24pLFxuXHRcdFx0XHR0aGlzLmFzc2lnbi5hbGxBc3NpZ25lZXMoKS5tYXAoXyA9PlxuXHRcdFx0XHRcdG1zU2V0TGF6eShJZEJ1aWx0LCBuZXcgTGl0ZXJhbChfLm5hbWUpLCBpZEZvckRlY2xhcmVDYWNoZWQoXykpKSlcblx0fSxcblxuXHRPYmpFbnRyeUNvbXB1dGVkKCkge1xuXHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLFxuXHRcdFx0bmV3IE1lbWJlckV4cHJlc3Npb24oSWRCdWlsdCwgdDAodGhpcy5rZXkpKSxcblx0XHRcdHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdE9iakVudHJ5UGxhaW4oKSB7XG5cdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlcihJZEJ1aWx0LCB0aGlzLm5hbWUpLCB0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRPYmpTaW1wbGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBPYmplY3RFeHByZXNzaW9uKHRoaXMucGFpcnMubWFwKHBhaXIgPT5cblx0XHRcdG5ldyBQcm9wZXJ0eSgnaW5pdCcsIHByb3BlcnR5SWRPckxpdGVyYWxDYWNoZWQocGFpci5rZXkpLCB0MChwYWlyLnZhbHVlKSkpKVxuXHR9LFxuXG5cdFF1b3RlKCkge1xuXHRcdGlmICh0aGlzLnBhcnRzLmxlbmd0aCA9PT0gMClcblx0XHRcdHJldHVybiBMaXRFbXB0eVN0cmluZ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgcXVhc2lzID0gW10sIGV4cHJlc3Npb25zID0gW11cblxuXHRcdFx0Ly8gVGVtcGxhdGVMaXRlcmFsIG11c3Qgc3RhcnQgd2l0aCBhIFRlbXBsYXRlRWxlbWVudFxuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLnBhcnRzWzBdICE9PSAnc3RyaW5nJylcblx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LkVtcHR5KVxuXG5cdFx0XHRmb3IgKGxldCBwYXJ0IG9mIHRoaXMucGFydHMpXG5cdFx0XHRcdGlmICh0eXBlb2YgcGFydCA9PT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmZvclJhd1N0cmluZyhwYXJ0KSlcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Ly8gXCJ7MX17MX1cIiBuZWVkcyBhbiBlbXB0eSBxdWFzaSBpbiB0aGUgbWlkZGxlIChhbmQgb24gdGhlIGVuZHMpXG5cdFx0XHRcdFx0aWYgKHF1YXNpcy5sZW5ndGggPT09IGV4cHJlc3Npb25zLmxlbmd0aClcblx0XHRcdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5FbXB0eSlcblx0XHRcdFx0XHRleHByZXNzaW9ucy5wdXNoKHQwKHBhcnQpKVxuXHRcdFx0XHR9XG5cblx0XHRcdC8vIFRlbXBsYXRlTGl0ZXJhbCBtdXN0IGVuZCB3aXRoIGEgVGVtcGxhdGVFbGVtZW50LCBzbyBvbmUgbW9yZSBxdWFzaSB0aGFuIGV4cHJlc3Npb24uXG5cdFx0XHRpZiAocXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoKVxuXHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuRW1wdHkpXG5cblx0XHRcdHJldHVybiBuZXcgVGVtcGxhdGVMaXRlcmFsKHF1YXNpcywgZXhwcmVzc2lvbnMpXG5cdFx0fVxuXHR9LFxuXG5cdFF1b3RlVGVtcGxhdGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBUYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb24odDAodGhpcy50YWcpLCB0MCh0aGlzLnF1b3RlKSlcblx0fSxcblxuXHRTZXRTdWIoKSB7XG5cdFx0Y29uc3Qga2luZCA9ICgoKSA9PiB7XG5cdFx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0XHRjYXNlIFNFVF9Jbml0OlxuXHRcdFx0XHRcdHJldHVybiAnaW5pdCdcblx0XHRcdFx0Y2FzZSBTRVRfSW5pdE11dGFibGU6XG5cdFx0XHRcdFx0cmV0dXJuICdpbml0LW11dGFibGUnXG5cdFx0XHRcdGNhc2UgU0VUX011dGF0ZTpcblx0XHRcdFx0XHRyZXR1cm4gJ211dGF0ZSdcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0fVxuXHRcdH0pKClcblx0XHRyZXR1cm4gbXNTZXRTdWIoXG5cdFx0XHR0MCh0aGlzLm9iamVjdCksXG5cdFx0XHR0aGlzLnN1YmJlZHMubGVuZ3RoID09PSAxID8gdDAodGhpcy5zdWJiZWRzWzBdKSA6IHRoaXMuc3ViYmVkcy5tYXAodDApLFxuXHRcdFx0bWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHQwKHRoaXMudmFsdWUpLCB0aGlzLm9wVHlwZSwgJ3ZhbHVlJyksXG5cdFx0XHRuZXcgTGl0ZXJhbChraW5kKSlcblx0fSxcblxuXHRTcGVjaWFsRG8oKSB7XG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU0RfRGVidWdnZXI6IHJldHVybiBuZXcgRGVidWdnZXJTdGF0ZW1lbnQoKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHR9XG5cdH0sXG5cblx0U3BlY2lhbFZhbCgpIHtcblx0XHQvLyBNYWtlIG5ldyBvYmplY3RzIGJlY2F1c2Ugd2Ugd2lsbCBhc3NpZ24gYGxvY2AgdG8gdGhlbS5cblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTVl9Db250YWluczogcmV0dXJuIG1lbWJlcihJZE1zLCAnY29udGFpbnMnKVxuXHRcdFx0Y2FzZSBTVl9GYWxzZTogcmV0dXJuIG5ldyBMaXRlcmFsKGZhbHNlKVxuXHRcdFx0Y2FzZSBTVl9OYW1lOiByZXR1cm4gbmV3IExpdGVyYWwodmVyaWZ5UmVzdWx0cy5uYW1lKHRoaXMpKVxuXHRcdFx0Y2FzZSBTVl9OdWxsOiByZXR1cm4gbmV3IExpdGVyYWwobnVsbClcblx0XHRcdGNhc2UgU1ZfU2V0U3ViOiByZXR1cm4gbWVtYmVyKElkTXMsICdzZXRTdWInKVxuXHRcdFx0Y2FzZSBTVl9TdWI6IHJldHVybiBtZW1iZXIoSWRNcywgJ3N1YicpXG5cdFx0XHRjYXNlIFNWX1RydWU6IHJldHVybiBuZXcgTGl0ZXJhbCh0cnVlKVxuXHRcdFx0Y2FzZSBTVl9VbmRlZmluZWQ6IHJldHVybiBuZXcgVW5hcnlFeHByZXNzaW9uKCd2b2lkJywgTGl0WmVybylcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcih0aGlzLmtpbmQpXG5cdFx0fVxuXHR9LFxuXG5cdFNwbGF0KCkge1xuXHRcdHJldHVybiBuZXcgU3ByZWFkRWxlbWVudCh0MCh0aGlzLnNwbGF0dGVkKSlcblx0fSxcblxuXHRTdXBlckNhbGw6IHN1cGVyQ2FsbCxcblx0U3VwZXJDYWxsRG86IHN1cGVyQ2FsbCxcblx0U3VwZXJNZW1iZXIoKSB7XG5cdFx0cmV0dXJuIG1lbWJlclN0cmluZ09yVmFsKElkU3VwZXIsIHRoaXMubmFtZSlcblx0fSxcblxuXHRTd2l0Y2hEbygpIHsgcmV0dXJuIHRyYW5zcGlsZVN3aXRjaCh0aGlzKSB9LFxuXHRTd2l0Y2hWYWwoKSB7IHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFt0cmFuc3BpbGVTd2l0Y2godGhpcyldKSkgfSxcblx0U3dpdGNoRG9QYXJ0OiBzd2l0Y2hQYXJ0LFxuXHRTd2l0Y2hWYWxQYXJ0OiBzd2l0Y2hQYXJ0LFxuXG5cdFRocm93KCkge1xuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcFRocm93bixcblx0XHRcdF8gPT4gZG9UaHJvdyhfKSxcblx0XHRcdCgpID0+IG5ldyBUaHJvd1N0YXRlbWVudChuZXcgTmV3RXhwcmVzc2lvbihHbG9iYWxFcnJvciwgW0xpdFN0clRocm93XSkpKVxuXHR9LFxuXG5cdFdpdGgoKSB7XG5cdFx0Y29uc3QgaWREZWNsYXJlID0gaWRGb3JEZWNsYXJlQ2FjaGVkKHRoaXMuZGVjbGFyZSlcblx0XHRjb25zdCBibG9jayA9IHQzKHRoaXMuYmxvY2ssIG51bGwsIG51bGwsIG5ldyBSZXR1cm5TdGF0ZW1lbnQoaWREZWNsYXJlKSlcblx0XHRjb25zdCBmdW4gPSBpc0luR2VuZXJhdG9yID9cblx0XHRcdG5ldyBGdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgW2lkRGVjbGFyZV0sIGJsb2NrLCB0cnVlKSA6XG5cdFx0XHRuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oW2lkRGVjbGFyZV0sIGJsb2NrKVxuXHRcdGNvbnN0IGNhbGwgPSBuZXcgQ2FsbEV4cHJlc3Npb24oZnVuLCBbdDAodGhpcy52YWx1ZSldKVxuXHRcdHJldHVybiBpc0luR2VuZXJhdG9yID8gbmV3IFlpZWxkRXhwcmVzc2lvbihjYWxsLCB0cnVlKSA6IGNhbGxcblx0fSxcblxuXHRZaWVsZCgpIHsgcmV0dXJuIG5ldyBZaWVsZEV4cHJlc3Npb24ob3BNYXAodGhpcy5vcFlpZWxkZWQsIHQwKSwgZmFsc2UpIH0sXG5cblx0WWllbGRUbygpIHsgcmV0dXJuIG5ldyBZaWVsZEV4cHJlc3Npb24odDAodGhpcy55aWVsZGVkVG8pLCB0cnVlKSB9XG59KVxuXG5mdW5jdGlvbiBjYXNlUGFydChhbHRlcm5hdGUpIHtcblx0aWYgKHRoaXMudGVzdCBpbnN0YW5jZW9mIFBhdHRlcm4pIHtcblx0XHRjb25zdCB7dHlwZSwgcGF0dGVybmVkLCBsb2NhbHN9ID0gdGhpcy50ZXN0XG5cdFx0Y29uc3QgZGVjbCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRFeHRyYWN0LCBtc0V4dHJhY3QodDAodHlwZSksIHQwKHBhdHRlcm5lZCkpKV0pXG5cdFx0Y29uc3QgdGVzdCA9IG5ldyBCaW5hcnlFeHByZXNzaW9uKCchPT0nLCBJZEV4dHJhY3QsIExpdE51bGwpXG5cdFx0Y29uc3QgZXh0cmFjdCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIGxvY2Fscy5tYXAoKF8sIGlkeCkgPT5cblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoXG5cdFx0XHRcdGlkRm9yRGVjbGFyZUNhY2hlZChfKSxcblx0XHRcdFx0bmV3IE1lbWJlckV4cHJlc3Npb24oSWRFeHRyYWN0LCBuZXcgTGl0ZXJhbChpZHgpKSkpKVxuXHRcdGNvbnN0IHJlcyA9IHQxKHRoaXMucmVzdWx0LCBleHRyYWN0KVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoW2RlY2wsIG5ldyBJZlN0YXRlbWVudCh0ZXN0LCByZXMsIGFsdGVybmF0ZSldKVxuXHR9IGVsc2Vcblx0XHQvLyBhbHRlcm5hdGUgd3JpdHRlbiB0byBieSBgY2FzZUJvZHlgLlxuXHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQodDAodGhpcy50ZXN0KSwgdDAodGhpcy5yZXN1bHQpLCBhbHRlcm5hdGUpXG59XG5cbmZ1bmN0aW9uIHN1cGVyQ2FsbCgpIHtcblx0Y29uc3QgYXJncyA9IHRoaXMuYXJncy5tYXAodDApXG5cdGNvbnN0IG1ldGhvZCA9IHZlcmlmeVJlc3VsdHMuc3VwZXJDYWxsVG9NZXRob2QuZ2V0KHRoaXMpXG5cblx0aWYgKG1ldGhvZCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB7XG5cdFx0Y29uc3QgY2FsbCA9IG5ldyBDYWxsRXhwcmVzc2lvbihJZFN1cGVyLCBhcmdzKVxuXHRcdGNvbnN0IG1lbWJlclNldHMgPSBjb25zdHJ1Y3RvclNldE1lbWJlcnMobWV0aG9kKVxuXHRcdHJldHVybiBjYXQoY2FsbCwgbWVtYmVyU2V0cylcblx0fSBlbHNlIHtcblx0XHRjb25zdCBtID0gdHlwZW9mIG1ldGhvZC5zeW1ib2wgPT09ICdzdHJpbmcnID9cblx0XHRcdG1lbWJlcihJZFN1cGVyLCBtZXRob2Quc3ltYm9sKSA6XG5cdFx0XHRuZXcgTWVtYmVyRXhwcmVzc2lvbihJZFN1cGVyLCB0MChtZXRob2Quc3ltYm9sKSlcblx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKG0sIGFyZ3MpXG5cdH1cbn1cblxuZnVuY3Rpb24gc3dpdGNoUGFydCgpIHtcblx0Y29uc3QgZm9sbG93ID0gb3BJZih0aGlzIGluc3RhbmNlb2YgU3dpdGNoRG9QYXJ0LCAoKSA9PiBuZXcgQnJlYWtTdGF0ZW1lbnQpXG5cdC8qXG5cdFdlIGNvdWxkIGp1c3QgcGFzcyBibG9jay5ib2R5IGZvciB0aGUgc3dpdGNoIGxpbmVzLCBidXQgaW5zdGVhZFxuXHRlbmNsb3NlIHRoZSBib2R5IG9mIHRoZSBzd2l0Y2ggY2FzZSBpbiBjdXJseSBicmFjZXMgdG8gZW5zdXJlIGEgbmV3IHNjb3BlLlxuXHRUaGF0IHdheSB0aGlzIGNvZGUgd29ya3M6XG5cdFx0c3dpdGNoICgwKSB7XG5cdFx0XHRjYXNlIDA6IHtcblx0XHRcdFx0Y29uc3QgYSA9IDBcblx0XHRcdFx0cmV0dXJuIGFcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0Ly8gV2l0aG91dCBjdXJseSBicmFjZXMgdGhpcyB3b3VsZCBjb25mbGljdCB3aXRoIHRoZSBvdGhlciBgYWAuXG5cdFx0XHRcdGNvbnN0IGEgPSAxXG5cdFx0XHRcdGFcblx0XHRcdH1cblx0XHR9XG5cdCovXG5cdGNvbnN0IGJsb2NrID0gdDModGhpcy5yZXN1bHQsIG51bGwsIG51bGwsIGZvbGxvdylcblx0Ly8gSWYgc3dpdGNoIGhhcyBtdWx0aXBsZSB2YWx1ZXMsIGJ1aWxkIHVwIGEgc3RhdGVtZW50IGxpa2U6IGBjYXNlIDE6IGNhc2UgMjogeyBkb0Jsb2NrKCkgfWBcblx0Y29uc3QgeCA9IFtdXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy52YWx1ZXMubGVuZ3RoIC0gMTsgaSA9IGkgKyAxKVxuXHRcdC8vIFRoZXNlIGNhc2VzIGZhbGx0aHJvdWdoIHRvIHRoZSBvbmUgYXQgdGhlIGVuZC5cblx0XHR4LnB1c2gobmV3IFN3aXRjaENhc2UodDAodGhpcy52YWx1ZXNbaV0pLCBbXSkpXG5cdHgucHVzaChuZXcgU3dpdGNoQ2FzZSh0MCh0aGlzLnZhbHVlc1t0aGlzLnZhbHVlcy5sZW5ndGggLSAxXSksIFtibG9ja10pKVxuXHRyZXR1cm4geFxufVxuXG4vLyBGdW5jdGlvbnMgc3BlY2lmaWMgdG8gY2VydGFpbiBleHByZXNzaW9ucy5cbmNvbnN0XG5cdC8vIFdyYXBzIGEgYmxvY2sgKHdpdGggYHJldHVybmAgc3RhdGVtZW50cyBpbiBpdCkgaW4gYW4gSUlGRS5cblx0YmxvY2tXcmFwID0gYmxvY2sgPT4ge1xuXHRcdGNvbnN0IGludm9rZSA9IG5ldyBDYWxsRXhwcmVzc2lvbihmdW5jdGlvbkV4cHJlc3Npb25UaHVuayhibG9jaywgaXNJbkdlbmVyYXRvciksIFtdKVxuXHRcdHJldHVybiBpc0luR2VuZXJhdG9yID8gbmV3IFlpZWxkRXhwcmVzc2lvbihpbnZva2UsIHRydWUpIDogaW52b2tlXG5cdH0sXG5cblx0Y2FzZUJvZHkgPSAocGFydHMsIG9wRWxzZSkgPT4ge1xuXHRcdGxldCBhY2MgPSBpZkVsc2Uob3BFbHNlLCB0MCwgKCkgPT4gVGhyb3dOb0Nhc2VNYXRjaClcblx0XHRmb3IgKGxldCBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpID0gaSAtIDEpXG5cdFx0XHRhY2MgPSB0MShwYXJ0c1tpXSwgYWNjKVxuXHRcdHJldHVybiBhY2Ncblx0fSxcblxuXHRjb25zdHJ1Y3RvclNldE1lbWJlcnMgPSBjb25zdHJ1Y3RvciA9PlxuXHRcdGNvbnN0cnVjdG9yLm1lbWJlckFyZ3MubWFwKF8gPT5cblx0XHRcdG1zTmV3UHJvcGVydHkobmV3IFRoaXNFeHByZXNzaW9uKCksIG5ldyBMaXRlcmFsKF8ubmFtZSksIGlkRm9yRGVjbGFyZUNhY2hlZChfKSkpLFxuXG5cdGZvckxvb3AgPSAob3BJdGVyYXRlZSwgYmxvY2spID0+XG5cdFx0aWZFbHNlKG9wSXRlcmF0ZWUsXG5cdFx0XHQoe2VsZW1lbnQsIGJhZ30pID0+IHtcblx0XHRcdFx0Y29uc3QgZGVjbGFyZSA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdsZXQnLFxuXHRcdFx0XHRcdFtuZXcgVmFyaWFibGVEZWNsYXJhdG9yKHQwKGVsZW1lbnQpKV0pXG5cdFx0XHRcdHJldHVybiBuZXcgRm9yT2ZTdGF0ZW1lbnQoZGVjbGFyZSwgdDAoYmFnKSwgdDAoYmxvY2spKVxuXHRcdFx0fSxcblx0XHRcdCgpID0+IGZvclN0YXRlbWVudEluZmluaXRlKHQwKGJsb2NrKSkpLFxuXG5cdGRvVGhyb3cgPSB0aHJvd24gPT5cblx0XHRuZXcgVGhyb3dTdGF0ZW1lbnQodGhyb3duIGluc3RhbmNlb2YgUXVvdGUgP1xuXHRcdFx0bmV3IE5ld0V4cHJlc3Npb24oR2xvYmFsRXJyb3IsIFt0MCh0aHJvd24pXSkgOlxuXHRcdFx0dDAodGhyb3duKSksXG5cblx0bWVtYmVyU3RyaW5nT3JWYWwgPSAob2JqZWN0LCBtZW1iZXJOYW1lKSA9PlxuXHRcdHR5cGVvZiBtZW1iZXJOYW1lID09PSAnc3RyaW5nJyA/XG5cdFx0XHRtZW1iZXIob2JqZWN0LCBtZW1iZXJOYW1lKSA6XG5cdFx0XHRuZXcgTWVtYmVyRXhwcmVzc2lvbihvYmplY3QsIHQwKG1lbWJlck5hbWUpKSxcblxuXHRtZXRob2RLZXlDb21wdXRlZCA9IHN5bWJvbCA9PiB7XG5cdFx0aWYgKHR5cGVvZiBzeW1ib2wgPT09ICdzdHJpbmcnKVxuXHRcdFx0cmV0dXJuIHtrZXk6IHByb3BlcnR5SWRPckxpdGVyYWxDYWNoZWQoc3ltYm9sKSwgY29tcHV0ZWQ6IGZhbHNlfVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3Qga2V5ID0gc3ltYm9sIGluc3RhbmNlb2YgUXVvdGUgPyB0MChzeW1ib2wpIDogbXNTeW1ib2wodDAoc3ltYm9sKSlcblx0XHRcdHJldHVybiB7a2V5LCBjb21wdXRlZDogdHJ1ZX1cblx0XHR9XG5cdH0sXG5cblx0dHJhbnNwaWxlQmxvY2sgPSAocmV0dXJuZWQsIGxpbmVzLCBsZWFkLCBvcERlY2xhcmVSZXMsIGZvbGxvdykgPT4ge1xuXHRcdC8vIFRPRE86RVM2IE9wdGlvbmFsIGFyZ3VtZW50c1xuXHRcdGlmIChsZWFkID09PSB1bmRlZmluZWQpIGxlYWQgPSBudWxsXG5cdFx0aWYgKG9wRGVjbGFyZVJlcyA9PT0gdW5kZWZpbmVkKSBvcERlY2xhcmVSZXMgPSBudWxsXG5cdFx0aWYgKGZvbGxvdyA9PT0gdW5kZWZpbmVkKSBmb2xsb3cgPSBudWxsXG5cdFx0Y29uc3QgZmluID0gaWZFbHNlKG9wRGVjbGFyZVJlcyxcblx0XHRcdHJkID0+IHtcblx0XHRcdFx0Y29uc3QgcmV0ID0gbWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHJldHVybmVkLCByZC5vcFR5cGUsIHJkLm5hbWUpXG5cdFx0XHRcdHJldHVybiBpZkVsc2UoZm9sbG93LFxuXHRcdFx0XHRcdF8gPT4gY2F0KGRlY2xhcmUocmQsIHJldCksIF8sIFJldHVyblJlcyksXG5cdFx0XHRcdFx0KCkgPT4gbmV3IFJldHVyblN0YXRlbWVudChyZXQpKVxuXHRcdFx0fSxcblx0XHRcdCgpID0+IGNhdChmb2xsb3csIG5ldyBSZXR1cm5TdGF0ZW1lbnQocmV0dXJuZWQpKSlcblx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChsZWFkLCBsaW5lcywgZmluKSlcblx0fSxcblxuXHR0cmFuc3BpbGVFeGNlcHQgPSBleGNlcHQgPT5cblx0XHRuZXcgVHJ5U3RhdGVtZW50KFxuXHRcdFx0dDAoZXhjZXB0Ll90cnkpLFxuXHRcdFx0b3BNYXAoZXhjZXB0Ll9jYXRjaCwgdDApLFxuXHRcdFx0b3BNYXAoZXhjZXB0Ll9maW5hbGx5LCB0MCkpLFxuXG5cdHRyYW5zcGlsZVN3aXRjaCA9IF8gPT4ge1xuXHRcdGNvbnN0IHBhcnRzID0gZmxhdE1hcChfLnBhcnRzLCB0MClcblx0XHRwYXJ0cy5wdXNoKGlmRWxzZShfLm9wRWxzZSxcblx0XHRcdF8gPT4gbmV3IFN3aXRjaENhc2UodW5kZWZpbmVkLCB0MChfKS5ib2R5KSxcblx0XHRcdCgpID0+IFN3aXRjaENhc2VOb01hdGNoKSlcblx0XHRyZXR1cm4gbmV3IFN3aXRjaFN0YXRlbWVudCh0MChfLnN3aXRjaGVkKSwgcGFydHMpXG5cdH1cblxuY29uc3QgSWRCb290ID0gbmV3IElkZW50aWZpZXIoJ19ib290JylcblxuLy8gTW9kdWxlIGhlbHBlcnNcbmNvbnN0XG5cdGFtZFdyYXBNb2R1bGUgPSAoZG9JbXBvcnRzLCBpbXBvcnRzLCBib2R5KSA9PiB7XG5cdFx0Y29uc3Qgc2hvdWxkSW1wb3J0Qm9vdCA9IG9wdGlvbnMuaW1wb3J0Qm9vdCgpXG5cblx0XHRjb25zdCBhbGxJbXBvcnRzID0gZG9JbXBvcnRzLmNvbmNhdChpbXBvcnRzKVxuXHRcdGNvbnN0IGFsbEltcG9ydFBhdGhzID0gYWxsSW1wb3J0cy5tYXAoXyA9PiBtYW5nbGVQYXRoKF8ucGF0aCkpXG5cblx0XHRjb25zdCBhcnJJbXBvcnRQYXRocyA9IG5ldyBBcnJheUV4cHJlc3Npb24oY2F0KFxuXHRcdFx0b3BJZihzaG91bGRJbXBvcnRCb290LCAoKSA9PiBuZXcgTGl0ZXJhbChvcHRpb25zLmJvb3RQYXRoKCkpKSxcblx0XHRcdExpdFN0ckV4cG9ydHMsXG5cdFx0XHRhbGxJbXBvcnRQYXRocy5tYXAoXyA9PiBuZXcgTGl0ZXJhbChfKSkpKVxuXG5cdFx0Y29uc3QgaW1wb3J0VG9JZGVudGlmaWVyID0gbmV3IE1hcCgpXG5cdFx0Y29uc3QgaW1wb3J0SWRlbnRpZmllcnMgPSBbXVxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYWxsSW1wb3J0cy5sZW5ndGg7IGkgPSBpICsgMSkge1xuXHRcdFx0Y29uc3QgXyA9IGFsbEltcG9ydHNbaV1cblx0XHRcdGNvbnN0IGlkID0gaWRDYWNoZWQoYCR7cGF0aEJhc2VOYW1lKF8ucGF0aCl9XyR7aX1gKVxuXHRcdFx0aW1wb3J0SWRlbnRpZmllcnMucHVzaChpZClcblx0XHRcdGltcG9ydFRvSWRlbnRpZmllci5zZXQoXywgaWQpXG5cdFx0fVxuXG5cdFx0Y29uc3QgaW1wb3J0QXJncyA9IGNhdChvcElmKHNob3VsZEltcG9ydEJvb3QsICgpID0+IElkQm9vdCksIElkRXhwb3J0cywgaW1wb3J0SWRlbnRpZmllcnMpXG5cblx0XHRjb25zdCBkb0Jvb3QgPSBvcElmKHNob3VsZEltcG9ydEJvb3QsICgpID0+IG5ldyBFeHByZXNzaW9uU3RhdGVtZW50KG1zR2V0TW9kdWxlKElkQm9vdCkpKVxuXG5cdFx0Y29uc3QgaW1wb3J0RG9zID0gZG9JbXBvcnRzLm1hcChfID0+XG5cdFx0XHRsb2MobmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQobXNHZXRNb2R1bGUoaW1wb3J0VG9JZGVudGlmaWVyLmdldChfKSkpLCBfLmxvYykpXG5cblx0XHQvLyBFeHRyYWN0cyBpbXBvcnRlZCB2YWx1ZXMgZnJvbSB0aGUgbW9kdWxlcy5cblx0XHRjb25zdCBvcERlY2xhcmVJbXBvcnRlZExvY2FscyA9IG9wSWYoIWlzRW1wdHkoaW1wb3J0cyksXG5cdFx0XHQoKSA9PiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLFxuXHRcdFx0XHRmbGF0TWFwKGltcG9ydHMsIF8gPT4gaW1wb3J0RGVjbGFyYXRvcnMoXywgaW1wb3J0VG9JZGVudGlmaWVyLmdldChfKSkpKSlcblxuXHRcdGNvbnN0IGZ1bGxCb2R5ID0gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChcblx0XHRcdGRvQm9vdCwgaW1wb3J0RG9zLCBvcERlY2xhcmVJbXBvcnRlZExvY2FscywgYm9keSwgUmV0dXJuRXhwb3J0cykpXG5cblx0XHRjb25zdCBsYXp5Qm9keSA9XG5cdFx0XHRvcHRpb25zLmxhenlNb2R1bGUoKSA/XG5cdFx0XHRcdG5ldyBCbG9ja1N0YXRlbWVudChbbmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQoXG5cdFx0XHRcdFx0bmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgRXhwb3J0c0dldCxcblx0XHRcdFx0XHRcdG1zTGF6eShmdW5jdGlvbkV4cHJlc3Npb25UaHVuayhmdWxsQm9keSkpKSldKSA6XG5cdFx0XHRcdGZ1bGxCb2R5XG5cblx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKElkRGVmaW5lLFxuXHRcdFx0W2FyckltcG9ydFBhdGhzLCBuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oaW1wb3J0QXJncywgbGF6eUJvZHkpXSlcblx0fSxcblxuXHRwYXRoQmFzZU5hbWUgPSBwYXRoID0+XG5cdFx0cGF0aC5zdWJzdHIocGF0aC5sYXN0SW5kZXhPZignLycpICsgMSksXG5cblx0aW1wb3J0RGVjbGFyYXRvcnMgPSAoe2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9LCBtb2R1bGVJZGVudGlmaWVyKSA9PiB7XG5cdFx0Ly8gVE9ETzogQ291bGQgYmUgbmVhdGVyIGFib3V0IHRoaXNcblx0XHRjb25zdCBpc0xhenkgPSAoaXNFbXB0eShpbXBvcnRlZCkgPyBvcEltcG9ydERlZmF1bHQgOiBpbXBvcnRlZFswXSkuaXNMYXp5KClcblx0XHRjb25zdCB2YWx1ZSA9IChpc0xhenkgPyBtc0xhenlHZXRNb2R1bGUgOiBtc0dldE1vZHVsZSkobW9kdWxlSWRlbnRpZmllcilcblxuXHRcdGNvbnN0IGltcG9ydGVkRGVmYXVsdCA9IG9wTWFwKG9wSW1wb3J0RGVmYXVsdCwgZGVmID0+IHtcblx0XHRcdGNvbnN0IGRlZmV4cCA9IG1zR2V0RGVmYXVsdEV4cG9ydChtb2R1bGVJZGVudGlmaWVyKVxuXHRcdFx0Y29uc3QgdmFsID0gaXNMYXp5ID8gbGF6eVdyYXAoZGVmZXhwKSA6IGRlZmV4cFxuXHRcdFx0cmV0dXJuIGxvYyhuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRm9yRGVjbGFyZUNhY2hlZChkZWYpLCB2YWwpLCBkZWYubG9jKVxuXHRcdH0pXG5cblx0XHRjb25zdCBpbXBvcnRlZERlc3RydWN0ID0gaXNFbXB0eShpbXBvcnRlZCkgPyBudWxsIDpcblx0XHRcdG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzKGltcG9ydGVkLCBpc0xhenksIHZhbHVlLCB0cnVlLCBmYWxzZSlcblxuXHRcdHJldHVybiBjYXQoaW1wb3J0ZWREZWZhdWx0LCBpbXBvcnRlZERlc3RydWN0KVxuXHR9XG5cbi8vIEdlbmVyYWwgdXRpbHMuIE5vdCBpbiB1dGlsLmpzIGJlY2F1c2UgdGhlc2UgY2xvc2Ugb3ZlciBjb250ZXh0LlxuY29uc3Rcblx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMgPSAoYXNzaWduZWVzLCBpc0xhenksIHZhbHVlLCBpc01vZHVsZSkgPT4ge1xuXHRcdGNvbnN0IGRlc3RydWN0dXJlZE5hbWUgPSBgXyQke25leHREZXN0cnVjdHVyZWRJZH1gXG5cdFx0bmV4dERlc3RydWN0dXJlZElkID0gbmV4dERlc3RydWN0dXJlZElkICsgMVxuXHRcdGNvbnN0IGlkRGVzdHJ1Y3R1cmVkID0gbmV3IElkZW50aWZpZXIoZGVzdHJ1Y3R1cmVkTmFtZSlcblx0XHRjb25zdCBkZWNsYXJhdG9ycyA9IGFzc2lnbmVlcy5tYXAoYXNzaWduZWUgPT4ge1xuXHRcdFx0Ly8gVE9ETzogRG9uJ3QgY29tcGlsZSBpdCBpZiBpdCdzIG5ldmVyIGFjY2Vzc2VkXG5cdFx0XHRjb25zdCBnZXQgPSBnZXRNZW1iZXIoaWREZXN0cnVjdHVyZWQsIGFzc2lnbmVlLm5hbWUsIGlzTGF6eSwgaXNNb2R1bGUpXG5cdFx0XHRyZXR1cm4gbWFrZURlY2xhcmF0b3IoYXNzaWduZWUsIGdldCwgaXNMYXp5KVxuXHRcdH0pXG5cdFx0Ly8gR2V0dGluZyBsYXp5IG1vZHVsZSBpcyBkb25lIGJ5IG1zLmxhenlHZXRNb2R1bGUuXG5cdFx0Y29uc3QgdmFsID0gaXNMYXp5ICYmICFpc01vZHVsZSA/IGxhenlXcmFwKHZhbHVlKSA6IHZhbHVlXG5cdFx0cmV0dXJuIGNhdChuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRGVzdHJ1Y3R1cmVkLCB2YWwpLCBkZWNsYXJhdG9ycylcblx0fSxcblxuXHRtYWtlRGVjbGFyYXRvciA9IChhc3NpZ25lZSwgdmFsdWUsIHZhbHVlSXNBbHJlYWR5TGF6eSkgPT4ge1xuXHRcdGNvbnN0IHtuYW1lLCBvcFR5cGV9ID0gYXNzaWduZWVcblx0XHRjb25zdCBpc0xhenkgPSBhc3NpZ25lZS5pc0xhenkoKVxuXHRcdC8vIFRPRE86IGFzc2VydChhc3NpZ25lZS5vcFR5cGUgPT09IG51bGwpXG5cdFx0Ly8gb3IgVE9ETzogQWxsb3cgdHlwZSBjaGVjayBvbiBsYXp5IHZhbHVlP1xuXHRcdHZhbHVlID0gaXNMYXp5ID8gdmFsdWUgOiBtYXliZVdyYXBJbkNoZWNrQ29udGFpbnModmFsdWUsIG9wVHlwZSwgbmFtZSlcblx0XHRjb25zdCB2YWwgPSBpc0xhenkgJiYgIXZhbHVlSXNBbHJlYWR5TGF6eSA/IGxhenlXcmFwKHZhbHVlKSA6IHZhbHVlXG5cdFx0YXNzZXJ0KGlzTGF6eSB8fCAhdmFsdWVJc0FscmVhZHlMYXp5KVxuXHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRm9yRGVjbGFyZUNhY2hlZChhc3NpZ25lZSksIHZhbClcblx0fSxcblxuXHRtYXliZVdyYXBJbkNoZWNrQ29udGFpbnMgPSAoYXN0LCBvcFR5cGUsIG5hbWUpID0+XG5cdFx0b3B0aW9ucy5pbmNsdWRlQ2hlY2tzKCkgJiYgb3BUeXBlICE9PSBudWxsID9cblx0XHRcdG1zQ2hlY2tDb250YWlucyh0MChvcFR5cGUpLCBhc3QsIG5ldyBMaXRlcmFsKG5hbWUpKSA6XG5cdFx0XHRhc3QsXG5cblx0Z2V0TWVtYmVyID0gKGFzdE9iamVjdCwgZ290TmFtZSwgaXNMYXp5LCBpc01vZHVsZSkgPT5cblx0XHRpc0xhenkgP1xuXHRcdG1zTGF6eUdldChhc3RPYmplY3QsIG5ldyBMaXRlcmFsKGdvdE5hbWUpKSA6XG5cdFx0aXNNb2R1bGUgJiYgb3B0aW9ucy5pbmNsdWRlQ2hlY2tzKCkgP1xuXHRcdG1zR2V0KGFzdE9iamVjdCwgbmV3IExpdGVyYWwoZ290TmFtZSkpIDpcblx0XHRtZW1iZXIoYXN0T2JqZWN0LCBnb3ROYW1lKVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

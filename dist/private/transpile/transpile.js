if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'esast/dist/ast', 'esast/dist/util', '../manglePath', '../context', '../MsAst', '../util', './ast-constants', './ms-call', './util'], function (exports, _esastDistAst, _esastDistUtil, _manglePath, _context, _MsAst, _util, _astConstants, _msCall, _util2) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports.default = transpile;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

	var _manglePath2 = _interopRequireDefault(_manglePath);

	let verifyResults, isInGenerator, isInConstructor;
	let nextDestructuredId;

	/** Transform a {@link MsAst} into an esast. **/

	function transpile(moduleExpression, _verifyResults) {
		verifyResults = _verifyResults;
		isInGenerator = false;
		isInConstructor = false;
		nextDestructuredId = 0;
		const res = t0(moduleExpression);
		// Release for garbage collection.
		verifyResults = null;
		return res;
	}

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
			return new _esastDistAst.VariableDeclaration(this.kind() === _MsAst.LocalDeclares.Mutable ? 'let' : 'const', makeDestructureDeclarators(this.assignees, this.kind() === _MsAst.LocalDeclares.Lazy, t0(this.value), false));
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
			if (opDeclareRes !== null || follow !== null) (0, _context.warn)(this.loc, 'Return type ignored because the block always throws.');
			return new _esastDistAst.BlockStatement((0, _util.cat)(lead, tLines(this.lines), t0(this.throw)));
		},

		BlockValReturn(lead, opDeclareRes, follow) {
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
			const opName = (0, _util.opMap)(verifyResults.opName(this), _esastDistUtil.identifier);
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

			const res = _esastDistAst.MethodDefinition.constructor(body);
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
			const id = (0, _util.opMap)(verifyResults.opName(this), _esastDistUtil.identifier);

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
			const isPositive = value >= 0 && 1 / value !== -Infinity;
			return isPositive ? lit : new _esastDistAst.UnaryExpression('-', lit);
		},

		LocalAccess() {
			if (this.name === 'this') return isInConstructor ? new _esastDistAst.ThisExpression() : _astConstants.IdLexicalThis;else {
				const ld = verifyResults.localDeclareForAccess(this);
				// If ld missing, this is a builtin, and builtins are never lazy
				return ld === undefined ? (0, _esastDistUtil.identifier)(this.name) : (0, _util2.accessLocalDeclare)(ld);
			}
		},

		LocalDeclare() {
			return new _esastDistAst.Identifier((0, _util2.idForDeclareCached)(this).name);
		},

		LocalMutate() {
			return new _esastDistAst.AssignmentExpression('=', (0, _esastDistUtil.identifier)(this.name), t0(this.value));
		},

		Logic() {
			const op = this.kind === _MsAst.Logics.And ? '&&' : '||';
			return (0, _util.tail)(this.args).reduce((a, b) => new _esastDistAst.LogicalExpression(op, a, t0(b)), t0(this.args[0]));
		},

		MapEntry() {
			return (0, _msCall.msSetSub)(_astConstants.IdBuilt, t0(this.key), t0(this.val));
		},

		Member() {
			return memberStringOrVal(t0(this.object), this.name);
		},

		MemberSet() {
			const obj = t0(this.object);
			const name = () => typeof this.name === 'string' ? new _esastDistAst.Literal(this.name) : t0(this.name);
			const val = maybeWrapInCheckContains(t0(this.value), this.opType, this.name);
			switch (this.kind) {
				case _MsAst.Setters.Init:
					return (0, _msCall.msNewProperty)(obj, name(), val);
				case _MsAst.Setters.InitMutable:
					return (0, _msCall.msNewMutableProperty)(obj, name(), val);
				case _MsAst.Setters.Mutate:
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

		ObjEntryPlain() {
			return new _esastDistAst.AssignmentExpression('=', memberStringOrVal(_astConstants.IdBuilt, this.name), t0(this.value));
		},

		ObjSimple() {
			return new _esastDistAst.ObjectExpression(this.pairs.map(pair => new _esastDistAst.Property('init', (0, _esastDistUtil.propertyIdOrLiteral)(pair.key), t0(pair.value))));
		},

		Quote() {
			if (this.parts.length === 0) return _astConstants.LitEmptyString;else {
				const quasis = [],
				      expressions = [];

				// TemplateLiteral must start with a TemplateElement
				if (typeof this.parts[0] !== 'string') quasis.push(_esastDistAst.TemplateElement.empty);

				for (let part of this.parts) if (typeof part === 'string') quasis.push(_esastDistAst.TemplateElement.forRawString(part));else {
					// "{1}{1}" needs an empty quasi in the middle (and on the ends)
					if (quasis.length === expressions.length) quasis.push(_esastDistAst.TemplateElement.empty);
					expressions.push(t0(part));
				}

				// TemplateLiteral must end with a TemplateElement, so one more quasi than expression.
				if (quasis.length === expressions.length) quasis.push(_esastDistAst.TemplateElement.empty);

				return new _esastDistAst.TemplateLiteral(quasis, expressions);
			}
		},

		QuoteTemplate() {
			return new _esastDistAst.TaggedTemplateExpression(t0(this.tag), t0(this.quote));
		},

		SetSub() {
			const getKind = () => {
				switch (this.kind) {
					case _MsAst.Setters.Init:
						return 'init';
					case _MsAst.Setters.InitMutable:
						return 'init-mutable';
					case _MsAst.Setters.Mutate:
						return 'mutate';
					default:
						throw new Error();
				}
			};
			const kind = getKind();
			return (0, _msCall.msSetSub)(t0(this.object), this.subbeds.length === 1 ? t0(this.subbeds[0]) : this.subbeds.map(t0), maybeWrapInCheckContains(t0(this.value), this.opType, 'value'), new _esastDistAst.Literal(kind));
		},

		SpecialDo() {
			switch (this.kind) {
				case _MsAst.SpecialDos.Debugger:
					return new _esastDistAst.DebuggerStatement();
				default:
					throw new Error(this.kind);
			}
		},

		SpecialVal() {
			// Make new objects because we will assign `loc` to them.
			switch (this.kind) {
				case _MsAst.SpecialVals.Contains:
					return (0, _esastDistUtil.member)(_msCall.IdMs, 'contains');
				case _MsAst.SpecialVals.False:
					return new _esastDistAst.Literal(false);
				case _MsAst.SpecialVals.Name:
					return new _esastDistAst.Literal(verifyResults.name(this));
				case _MsAst.SpecialVals.Null:
					return new _esastDistAst.Literal(null);
				case _MsAst.SpecialVals.SetSub:
					return (0, _esastDistUtil.member)(_msCall.IdMs, 'setSub');
				case _MsAst.SpecialVals.Sub:
					return (0, _esastDistUtil.member)(_msCall.IdMs, 'sub');
				case _MsAst.SpecialVals.True:
					return new _esastDistAst.Literal(true);
				case _MsAst.SpecialVals.Undefined:
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
		} else return new _esastDistAst.CallExpression(memberStringOrVal(_astConstants.IdSuper, method.symbol), args);
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
		if (typeof symbol === 'string') return { key: (0, _esastDistUtil.propertyIdOrLiteral)(symbol), computed: false };else {
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
	      transpileExcept = except => new _esastDistAst.TryStatement(t0(except.try), (0, _util.opMap)(except.catch, t0), (0, _util.opMap)(except.finally, t0)),
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
			const id = (0, _esastDistUtil.identifier)(`${ pathBaseName(_.path) }_${ i }`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zcGlsZS5qcyIsInByaXZhdGUvdHJhbnNwaWxlL3RyYW5zcGlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O21CQ2lDd0IsU0FBUzs7Ozs7Ozs7QUFKakMsS0FBSSxhQUFhLEVBQUUsYUFBYSxFQUFFLGVBQWUsQ0FBQTtBQUNqRCxLQUFJLGtCQUFrQixDQUFBOzs7O0FBR1AsVUFBUyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFO0FBQ25FLGVBQWEsR0FBRyxjQUFjLENBQUE7QUFDOUIsZUFBYSxHQUFHLEtBQUssQ0FBQTtBQUNyQixpQkFBZSxHQUFHLEtBQUssQ0FBQTtBQUN2QixvQkFBa0IsR0FBRyxDQUFDLENBQUE7QUFDdEIsUUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUE7O0FBRWhDLGVBQWEsR0FBRyxJQUFJLENBQUE7QUFDcEIsU0FBTyxHQUFHLENBQUE7RUFDVjs7QUFFTSxPQUNOLEVBQUUsR0FBRyxJQUFJLElBQUksbUJBckMrQixHQUFHLEVBcUM5QixJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBOztBQUM3QyxPQUNDLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLEtBQUssbUJBdkN3QixHQUFHLEVBdUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7T0FDdEQsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEtBQUssbUJBeENrQixHQUFHLEVBd0NqQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztPQUN4RCxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEtBQUssbUJBekNZLEdBQUcsRUF5Q1gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFF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dkJpQixlQUFlLEVBc3ZCaEIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRSxrQkExd0JVLE9BQU8sQ0Ewd0JMLElBQUksQ0FBQyxDQUFDLEdBQ25ELEdBQUc7T0FFTCxTQUFTLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEtBQ2hELE1BQU0sR0FDTixZQTF2QkQsU0FBUyxFQTB2QkUsU0FBUyxFQUFFLGtCQS93QnVCLE9BQU8sQ0Erd0JsQixPQUFPLENBQUMsQ0FBQyxHQUMxQyxRQUFRLElBQUksU0F4d0JDLE9BQU8sQ0F3d0JBLGFBQWEsRUFBRSxHQUNuQyxZQTd2QjhDLEtBQUssRUE2dkI3QyxTQUFTLEVBQUUsa0JBanhCMkIsT0FBTyxDQWl4QnRCLE9BQU8sQ0FBQyxDQUFDLEdBQ3RDLG1CQTd3QmdELE1BQU0sRUE2d0IvQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUEiLCJmaWxlIjoicHJpdmF0ZS90cmFuc3BpbGUvdHJhbnNwaWxlLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge0FycmF5RXhwcmVzc2lvbiwgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24sIEFzc2lnbm1lbnRFeHByZXNzaW9uLCBCaW5hcnlFeHByZXNzaW9uLFxuXHRCbG9ja1N0YXRlbWVudCwgQnJlYWtTdGF0ZW1lbnQsIENhbGxFeHByZXNzaW9uLCBDYXRjaENsYXVzZSwgQ2xhc3NCb2R5LCBDbGFzc0V4cHJlc3Npb24sXG5cdENvbmRpdGlvbmFsRXhwcmVzc2lvbiwgRGVidWdnZXJTdGF0ZW1lbnQsIEV4cHJlc3Npb25TdGF0ZW1lbnQsIEZvck9mU3RhdGVtZW50LFxuXHRGdW5jdGlvbkV4cHJlc3Npb24sIElkZW50aWZpZXIsIElmU3RhdGVtZW50LCBMaXRlcmFsLCBMb2dpY2FsRXhwcmVzc2lvbiwgTWVtYmVyRXhwcmVzc2lvbixcblx0TWV0aG9kRGVmaW5pdGlvbiwgTmV3RXhwcmVzc2lvbiwgT2JqZWN0RXhwcmVzc2lvbiwgUHJvZ3JhbSwgUHJvcGVydHksIFJldHVyblN0YXRlbWVudCxcblx0U3ByZWFkRWxlbWVudCwgU3dpdGNoQ2FzZSwgU3dpdGNoU3RhdGVtZW50LCBUYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb24sIFRlbXBsYXRlRWxlbWVudCxcblx0VGVtcGxhdGVMaXRlcmFsLCBUaGlzRXhwcmVzc2lvbiwgVGhyb3dTdGF0ZW1lbnQsIFRyeVN0YXRlbWVudCwgVmFyaWFibGVEZWNsYXJhdGlvbixcblx0VW5hcnlFeHByZXNzaW9uLCBWYXJpYWJsZURlY2xhcmF0b3IsIFlpZWxkRXhwcmVzc2lvbn0gZnJvbSAnZXNhc3QvZGlzdC9hc3QnXG5pbXBvcnQge2Z1bmN0aW9uRXhwcmVzc2lvblRodW5rLCBpZGVudGlmaWVyLCBsb2MsIG1lbWJlciwgcHJvcGVydHlJZE9yTGl0ZXJhbCwgdG9TdGF0ZW1lbnRcblx0fSBmcm9tICdlc2FzdC9kaXN0L3V0aWwnXG5pbXBvcnQgbWFuZ2xlUGF0aCBmcm9tICcuLi9tYW5nbGVQYXRoJ1xuaW1wb3J0IHtjaGVjaywgb3B0aW9ucywgd2Fybn0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCAqIGFzIE1zQXN0VHlwZXMgZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0Fzc2lnblNpbmdsZSwgQ2FsbCwgQ29uc3RydWN0b3IsIExvZ2ljcywgTWVtYmVyLCBMb2NhbERlY2xhcmUsIExvY2FsRGVjbGFyZXMsIFBhdHRlcm4sXG5cdFNwbGF0LCBTZXR0ZXJzLCBTcGVjaWFsRG9zLCBTcGVjaWFsVmFscywgU3dpdGNoRG9QYXJ0LCBRdW90ZSwgSW1wb3J0fSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7YXNzZXJ0LCBjYXQsIGZsYXRNYXAsIGZsYXRPcE1hcCwgaWZFbHNlLCBpc0VtcHR5LCBpbXBsZW1lbnRNYW55LCBsYXN0LCBvcElmLCBvcE1hcCwgdGFpbFxuXHR9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0FtZGVmaW5lSGVhZGVyLCBBcnJheVNsaWNlQ2FsbCwgRGVjbGFyZUJ1aWx0QmFnLCBEZWNsYXJlQnVpbHRNYXAsIERlY2xhcmVCdWlsdE9iaixcblx0RGVjbGFyZUxleGljYWxUaGlzLCBFeHBvcnRzRGVmYXVsdCwgRXhwb3J0c0dldCwgSWRBcmd1bWVudHMsIElkQnVpbHQsIElkRGVmaW5lLCBJZEV4cG9ydHMsXG5cdElkRXh0cmFjdCwgSWRGb2N1cywgSWRMZXhpY2FsVGhpcywgSWRTdXBlciwgR2xvYmFsRXJyb3IsIExpdEVtcHR5U3RyaW5nLCBMaXROdWxsLFxuXHRMaXRTdHJFeHBvcnRzLCBMaXRTdHJUaHJvdywgTGl0WmVybywgUmV0dXJuQnVpbHQsIFJldHVybkV4cG9ydHMsIFJldHVyblJlcywgU3dpdGNoQ2FzZU5vTWF0Y2gsXG5cdFRocm93QXNzZXJ0RmFpbCwgVGhyb3dOb0Nhc2VNYXRjaCwgVXNlU3RyaWN0fSBmcm9tICcuL2FzdC1jb25zdGFudHMnXG5pbXBvcnQge0lkTXMsIGxhenlXcmFwLCBtc0FkZCwgbXNBZGRNYW55LCBtc0Fzc2VydCwgbXNBc3NlcnRNZW1iZXIsIG1zQXNzZXJ0Tm90LFxuXHRtc0Fzc2VydE5vdE1lbWJlciwgbXNDaGVja0NvbnRhaW5zLCBtc0V4dHJhY3QsIG1zR2V0LCBtc0dldERlZmF1bHRFeHBvcnQsIG1zR2V0TW9kdWxlLCBtc0xhenksXG5cdG1zTGF6eUdldCwgbXNMYXp5R2V0TW9kdWxlLCBtc05ld011dGFibGVQcm9wZXJ0eSwgbXNOZXdQcm9wZXJ0eSwgbXNTZXRMYXp5LCBtc1NldFN1YiwgbXNTb21lLFxuXHRtc1N5bWJvbCwgTXNOb25lfSBmcm9tICcuL21zLWNhbGwnXG5pbXBvcnQge2FjY2Vzc0xvY2FsRGVjbGFyZSwgZGVjbGFyZSwgZm9yU3RhdGVtZW50SW5maW5pdGUsIGlkRm9yRGVjbGFyZUNhY2hlZCxcblx0b3BUeXBlQ2hlY2tGb3JMb2NhbERlY2xhcmV9IGZyb20gJy4vdXRpbCdcblxubGV0IHZlcmlmeVJlc3VsdHMsIGlzSW5HZW5lcmF0b3IsIGlzSW5Db25zdHJ1Y3RvclxubGV0IG5leHREZXN0cnVjdHVyZWRJZFxuXG4vKiogVHJhbnNmb3JtIGEge0BsaW5rIE1zQXN0fSBpbnRvIGFuIGVzYXN0LiAqKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRyYW5zcGlsZShtb2R1bGVFeHByZXNzaW9uLCBfdmVyaWZ5UmVzdWx0cykge1xuXHR2ZXJpZnlSZXN1bHRzID0gX3ZlcmlmeVJlc3VsdHNcblx0aXNJbkdlbmVyYXRvciA9IGZhbHNlXG5cdGlzSW5Db25zdHJ1Y3RvciA9IGZhbHNlXG5cdG5leHREZXN0cnVjdHVyZWRJZCA9IDBcblx0Y29uc3QgcmVzID0gdDAobW9kdWxlRXhwcmVzc2lvbilcblx0Ly8gUmVsZWFzZSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuXHR2ZXJpZnlSZXN1bHRzID0gbnVsbFxuXHRyZXR1cm4gcmVzXG59XG5cbmV4cG9ydCBjb25zdFxuXHR0MCA9IGV4cHIgPT4gbG9jKGV4cHIudHJhbnNwaWxlKCksIGV4cHIubG9jKVxuY29uc3Rcblx0dDEgPSAoZXhwciwgYXJnKSA9PiBsb2MoZXhwci50cmFuc3BpbGUoYXJnKSwgZXhwci5sb2MpLFxuXHR0MiA9IChleHByLCBhcmcsIGFyZzIpID0+IGxvYyhleHByLnRyYW5zcGlsZShhcmcsIGFyZzIpKSxcblx0dDMgPSAoZXhwciwgYXJnLCBhcmcyLCBhcmczKSA9PiBsb2MoZXhwci50cmFuc3BpbGUoYXJnLCBhcmcyLCBhcmczKSwgZXhwci5sb2MpLFxuXHR0TGluZXMgPSBleHBycyA9PiB7XG5cdFx0Y29uc3Qgb3V0ID0gW11cblx0XHRmb3IgKGNvbnN0IGV4cHIgb2YgZXhwcnMpIHtcblx0XHRcdGNvbnN0IGFzdCA9IGV4cHIudHJhbnNwaWxlKClcblx0XHRcdGlmIChhc3QgaW5zdGFuY2VvZiBBcnJheSlcblx0XHRcdFx0Ly8gSWdub3JlIHByb2R1Y2VzIDAgc3RhdGVtZW50cyBhbmQgUmVnaW9uIHByb2R1Y2VzIG1hbnkuXG5cdFx0XHRcdGZvciAoY29uc3QgXyBvZiBhc3QpXG5cdFx0XHRcdFx0b3V0LnB1c2godG9TdGF0ZW1lbnQoXykpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdG91dC5wdXNoKGxvYyh0b1N0YXRlbWVudChhc3QpLCBleHByLmxvYykpXG5cdFx0fVxuXHRcdHJldHVybiBvdXRcblx0fVxuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICd0cmFuc3BpbGUnLCB7XG5cdEFzc2VydCgpIHtcblx0XHRjb25zdCBmYWlsQ29uZCA9ICgpID0+IHtcblx0XHRcdGNvbnN0IGNvbmQgPSB0MCh0aGlzLmNvbmRpdGlvbilcblx0XHRcdHJldHVybiB0aGlzLm5lZ2F0ZSA/IGNvbmQgOiBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgY29uZClcblx0XHR9XG5cblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BUaHJvd24sXG5cdFx0XHRfID0+IG5ldyBJZlN0YXRlbWVudChmYWlsQ29uZCgpLCBkb1Rocm93KF8pKSxcblx0XHRcdCgpID0+IHtcblx0XHRcdFx0aWYgKHRoaXMuY29uZGl0aW9uIGluc3RhbmNlb2YgQ2FsbCkge1xuXHRcdFx0XHRcdGNvbnN0IGNhbGwgPSB0aGlzLmNvbmRpdGlvblxuXHRcdFx0XHRcdGNvbnN0IGNhbGxlZCA9IGNhbGwuY2FsbGVkXG5cdFx0XHRcdFx0Y29uc3QgYXJncyA9IGNhbGwuYXJncy5tYXAodDApXG5cdFx0XHRcdFx0aWYgKGNhbGxlZCBpbnN0YW5jZW9mIE1lbWJlcikge1xuXHRcdFx0XHRcdFx0Y29uc3QgYXNzID0gdGhpcy5uZWdhdGUgPyBtc0Fzc2VydE5vdE1lbWJlciA6IG1zQXNzZXJ0TWVtYmVyXG5cdFx0XHRcdFx0XHRyZXR1cm4gYXNzKHQwKGNhbGxlZC5vYmplY3QpLCBuZXcgTGl0ZXJhbChjYWxsZWQubmFtZSksIC4uLmFyZ3MpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnN0IGFzcyA9IHRoaXMubmVnYXRlID8gbXNBc3NlcnROb3QgOiBtc0Fzc2VydFxuXHRcdFx0XHRcdFx0cmV0dXJuIGFzcyh0MChjYWxsZWQpLCAuLi5hcmdzKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudChmYWlsQ29uZCgpLCBUaHJvd0Fzc2VydEZhaWwpXG5cdFx0XHR9KVxuXHR9LFxuXG5cdEFzc2lnblNpbmdsZSh2YWxXcmFwKSB7XG5cdFx0Y29uc3QgdmFsID0gdmFsV3JhcCA9PT0gdW5kZWZpbmVkID8gdDAodGhpcy52YWx1ZSkgOiB2YWxXcmFwKHQwKHRoaXMudmFsdWUpKVxuXHRcdGNvbnN0IGRlY2xhcmUgPSBtYWtlRGVjbGFyYXRvcih0aGlzLmFzc2lnbmVlLCB2YWwsIGZhbHNlKVxuXHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbih0aGlzLmFzc2lnbmVlLmlzTXV0YWJsZSgpID8gJ2xldCcgOiAnY29uc3QnLCBbZGVjbGFyZV0pXG5cdH0sXG5cdC8vIFRPRE86RVM2IEp1c3QgdXNlIG5hdGl2ZSBkZXN0cnVjdHVyaW5nIGFzc2lnblxuXHRBc3NpZ25EZXN0cnVjdHVyZSgpIHtcblx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oXG5cdFx0XHR0aGlzLmtpbmQoKSA9PT0gTG9jYWxEZWNsYXJlcy5NdXRhYmxlID8gJ2xldCcgOiAnY29uc3QnLFxuXHRcdFx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMoXG5cdFx0XHRcdHRoaXMuYXNzaWduZWVzLFxuXHRcdFx0XHR0aGlzLmtpbmQoKSA9PT0gTG9jYWxEZWNsYXJlcy5MYXp5LFxuXHRcdFx0XHR0MCh0aGlzLnZhbHVlKSxcblx0XHRcdFx0ZmFsc2UpKVxuXHR9LFxuXG5cdEJhZ0VudHJ5KCkgeyByZXR1cm4gbXNBZGQoSWRCdWlsdCwgdDAodGhpcy52YWx1ZSkpIH0sXG5cblx0QmFnRW50cnlNYW55KCkgeyByZXR1cm4gbXNBZGRNYW55KElkQnVpbHQsIHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdEJhZ1NpbXBsZSgpIHsgcmV0dXJuIG5ldyBBcnJheUV4cHJlc3Npb24odGhpcy5wYXJ0cy5tYXAodDApKSB9LFxuXG5cdEJsb2NrRG8obGVhZCwgb3BEZWNsYXJlUmVzLCBmb2xsb3cpIHtcblx0XHQvLyBUT0RPOkVTNiBPcHRpb25hbCBhcmd1bWVudHNcblx0XHRpZiAobGVhZCA9PT0gdW5kZWZpbmVkKSBsZWFkID0gbnVsbFxuXHRcdGlmIChvcERlY2xhcmVSZXMgPT09IHVuZGVmaW5lZCkgb3BEZWNsYXJlUmVzID0gbnVsbFxuXHRcdGlmIChmb2xsb3cgPT09IHVuZGVmaW5lZCkgZm9sbG93ID0gbnVsbFxuXHRcdGFzc2VydChvcERlY2xhcmVSZXMgPT09IG51bGwpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgdExpbmVzKHRoaXMubGluZXMpLCBmb2xsb3cpKVxuXHR9LFxuXG5cdEJsb2NrVmFsVGhyb3cobGVhZCwgb3BEZWNsYXJlUmVzLCBmb2xsb3cpIHtcblx0XHQvLyBUT0RPOkVTNiBPcHRpb25hbCBhcmd1bWVudHNcblx0XHRpZiAobGVhZCA9PT0gdW5kZWZpbmVkKSBsZWFkID0gbnVsbFxuXHRcdGlmIChvcERlY2xhcmVSZXMgPT09IHVuZGVmaW5lZCkgb3BEZWNsYXJlUmVzID0gbnVsbFxuXHRcdGlmIChmb2xsb3cgPT09IHVuZGVmaW5lZCkgZm9sbG93ID0gbnVsbFxuXHRcdGlmIChvcERlY2xhcmVSZXMgIT09IG51bGwgfHwgZm9sbG93ICE9PSBudWxsKVxuXHRcdFx0d2Fybih0aGlzLmxvYywgJ1JldHVybiB0eXBlIGlnbm9yZWQgYmVjYXVzZSB0aGUgYmxvY2sgYWx3YXlzIHRocm93cy4nKVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHRMaW5lcyh0aGlzLmxpbmVzKSwgdDAodGhpcy50aHJvdykpKVxuXHR9LFxuXG5cdEJsb2NrVmFsUmV0dXJuKGxlYWQsIG9wRGVjbGFyZVJlcywgZm9sbG93KSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKHQwKHRoaXMucmV0dXJuZWQpLCB0TGluZXModGhpcy5saW5lcyksIGxlYWQsIG9wRGVjbGFyZVJlcywgZm9sbG93KVxuXHR9LFxuXG5cdEJsb2NrQmFnKGxlYWQsIG9wRGVjbGFyZVJlcywgZm9sbG93KSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKFxuXHRcdFx0SWRCdWlsdCxcblx0XHRcdGNhdChEZWNsYXJlQnVpbHRCYWcsIHRMaW5lcyh0aGlzLmxpbmVzKSksXG5cdFx0XHRsZWFkLCBvcERlY2xhcmVSZXMsIGZvbGxvdylcblx0fSxcblxuXHRCbG9ja09iaihsZWFkLCBvcERlY2xhcmVSZXMsIGZvbGxvdykge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayhcblx0XHRcdElkQnVpbHQsXG5cdFx0XHRjYXQoRGVjbGFyZUJ1aWx0T2JqLCB0TGluZXModGhpcy5saW5lcykpLFxuXHRcdFx0bGVhZCwgb3BEZWNsYXJlUmVzLCBmb2xsb3cpXG5cdH0sXG5cblx0QmxvY2tNYXAobGVhZCwgb3BEZWNsYXJlUmVzLCBmb2xsb3cpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2soXG5cdFx0XHRJZEJ1aWx0LFxuXHRcdFx0Y2F0KERlY2xhcmVCdWlsdE1hcCwgdExpbmVzKHRoaXMubGluZXMpKSxcblx0XHRcdGxlYWQsIG9wRGVjbGFyZVJlcywgZm9sbG93KVxuXHR9LFxuXG5cdEJsb2NrV3JhcCgpIHsgcmV0dXJuIGJsb2NrV3JhcCh0MCh0aGlzLmJsb2NrKSkgfSxcblxuXHRCcmVhaygpIHsgcmV0dXJuIG5ldyBCcmVha1N0YXRlbWVudCgpIH0sXG5cblx0QnJlYWtXaXRoVmFsKCkgeyByZXR1cm4gbmV3IFJldHVyblN0YXRlbWVudCh0MCh0aGlzLnZhbHVlKSkgfSxcblxuXHRDYWxsKCkge1xuXHRcdHJldHVybiBuZXcgQ2FsbEV4cHJlc3Npb24odDAodGhpcy5jYWxsZWQpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHRDYXNlRG8oKSB7XG5cdFx0Y29uc3QgYm9keSA9IGNhc2VCb2R5KHRoaXMucGFydHMsIHRoaXMub3BFbHNlKVxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcENhc2VkLCBfID0+IG5ldyBCbG9ja1N0YXRlbWVudChbdDAoXyksIGJvZHldKSwgKCkgPT4gYm9keSlcblx0fSxcblx0Q2FzZVZhbCgpIHtcblx0XHRjb25zdCBib2R5ID0gY2FzZUJvZHkodGhpcy5wYXJ0cywgdGhpcy5vcEVsc2UpXG5cdFx0Y29uc3QgYmxvY2sgPSBpZkVsc2UodGhpcy5vcENhc2VkLCBfID0+IFt0MChfKSwgYm9keV0sICgpID0+IFtib2R5XSlcblx0XHRyZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChibG9jaykpXG5cdH0sXG5cdENhc2VEb1BhcnQ6IGNhc2VQYXJ0LFxuXHRDYXNlVmFsUGFydDogY2FzZVBhcnQsXG5cblx0Q2xhc3MoKSB7XG5cdFx0Y29uc3QgbWV0aG9kcyA9IGNhdChcblx0XHRcdHRoaXMuc3RhdGljcy5tYXAoXyA9PiB0MShfLCB0cnVlKSksXG5cdFx0XHRvcE1hcCh0aGlzLm9wQ29uc3RydWN0b3IsIHQwKSxcblx0XHRcdHRoaXMubWV0aG9kcy5tYXAoXyA9PiB0MShfLCBmYWxzZSkpKVxuXHRcdGNvbnN0IG9wTmFtZSA9IG9wTWFwKHZlcmlmeVJlc3VsdHMub3BOYW1lKHRoaXMpLCBpZGVudGlmaWVyKVxuXHRcdGNvbnN0IGNsYXNzRXhwciA9IG5ldyBDbGFzc0V4cHJlc3Npb24oXG5cdFx0XHRvcE5hbWUsXG5cdFx0XHRvcE1hcCh0aGlzLm9wU3VwZXJDbGFzcywgdDApLCBuZXcgQ2xhc3NCb2R5KG1ldGhvZHMpKVxuXG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wRG8sIF8gPT4gdDEoXywgY2xhc3NFeHByKSwgKCkgPT4gY2xhc3NFeHByKVxuXHR9LFxuXG5cdENsYXNzRG8oY2xhc3NFeHByKSB7XG5cdFx0Y29uc3QgbGVhZCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IodDAodGhpcy5kZWNsYXJlRm9jdXMpLCBjbGFzc0V4cHIpXSlcblx0XHRjb25zdCByZXQgPSBuZXcgUmV0dXJuU3RhdGVtZW50KHQwKHRoaXMuZGVjbGFyZUZvY3VzKSlcblx0XHRjb25zdCBibG9jayA9IHQzKHRoaXMuYmxvY2ssIGxlYWQsIG51bGwsIHJldClcblx0XHRyZXR1cm4gYmxvY2tXcmFwKGJsb2NrKVxuXHR9LFxuXG5cdENvbmQoKSB7XG5cdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odDAodGhpcy50ZXN0KSwgdDAodGhpcy5pZlRydWUpLCB0MCh0aGlzLmlmRmFsc2UpKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsRG8oKSB7XG5cdFx0Y29uc3QgdGVzdCA9IHQwKHRoaXMudGVzdClcblx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KFxuXHRcdFx0dGhpcy5pc1VubGVzcyA/IG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCB0ZXN0KSA6IHRlc3QsXG5cdFx0XHR0MCh0aGlzLnJlc3VsdCkpXG5cdH0sXG5cblx0Q29uZGl0aW9uYWxWYWwoKSB7XG5cdFx0Y29uc3QgdGVzdCA9IHQwKHRoaXMudGVzdClcblx0XHRjb25zdCByZXN1bHQgPSBtc1NvbWUoYmxvY2tXcmFwKHQwKHRoaXMucmVzdWx0KSkpXG5cdFx0cmV0dXJuIHRoaXMuaXNVbmxlc3MgP1xuXHRcdFx0bmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXN0LCBNc05vbmUsIHJlc3VsdCkgOlxuXHRcdFx0bmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXN0LCByZXN1bHQsIE1zTm9uZSlcblx0fSxcblxuXHRDb25zdHJ1Y3RvcigpIHtcblx0XHRpc0luQ29uc3RydWN0b3IgPSB0cnVlXG5cblx0XHQvLyBJZiB0aGVyZSBpcyBhIGBzdXBlciFgLCBgdGhpc2Agd2lsbCBub3QgYmUgZGVmaW5lZCB1bnRpbCB0aGVuLCBzbyBtdXN0IHdhaXQgdW50aWwgdGhlbi5cblx0XHQvLyBPdGhlcndpc2UsIGRvIGl0IGF0IHRoZSBiZWdpbm5pbmcuXG5cdFx0Y29uc3QgYm9keSA9IHZlcmlmeVJlc3VsdHMuY29uc3RydWN0b3JUb1N1cGVyLmhhcyh0aGlzKSA/XG5cdFx0XHR0MCh0aGlzLmZ1bikgOlxuXHRcdFx0dDEodGhpcy5mdW4sIGNvbnN0cnVjdG9yU2V0TWVtYmVycyh0aGlzKSlcblxuXHRcdGNvbnN0IHJlcyA9IE1ldGhvZERlZmluaXRpb24uY29uc3RydWN0b3IoYm9keSlcblx0XHRpc0luQ29uc3RydWN0b3IgPSBmYWxzZVxuXHRcdHJldHVybiByZXNcblx0fSxcblxuXHRDYXRjaCgpIHtcblx0XHRyZXR1cm4gbmV3IENhdGNoQ2xhdXNlKHQwKHRoaXMuY2F1Z2h0KSwgdDAodGhpcy5ibG9jaykpXG5cdH0sXG5cblx0RXhjZXB0RG8oKSB7IHJldHVybiB0cmFuc3BpbGVFeGNlcHQodGhpcykgfSxcblx0RXhjZXB0VmFsKCkgeyByZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChbdHJhbnNwaWxlRXhjZXB0KHRoaXMpXSkpIH0sXG5cblx0Rm9yRG8oKSB7IHJldHVybiBmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jaykgfSxcblxuXHRGb3JCYWcoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW1xuXHRcdFx0RGVjbGFyZUJ1aWx0QmFnLFxuXHRcdFx0Zm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spLFxuXHRcdFx0UmV0dXJuQnVpbHRcblx0XHRdKSlcblx0fSxcblxuXHRGb3JWYWwoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW2Zvckxvb3AodGhpcy5vcEl0ZXJhdGVlLCB0aGlzLmJsb2NrKV0pKVxuXHR9LFxuXG5cdEZ1bihsZWFkU3RhdGVtZW50cykge1xuXHRcdC8vIFRPRE86RVM2IE9wdGlvbmFsIGFyZ3Ncblx0XHRpZiAobGVhZFN0YXRlbWVudHMgPT09IHVuZGVmaW5lZClcblx0XHRcdGxlYWRTdGF0ZW1lbnRzID0gbnVsbFxuXG5cdFx0Y29uc3Qgb2xkSW5HZW5lcmF0b3IgPSBpc0luR2VuZXJhdG9yXG5cdFx0aXNJbkdlbmVyYXRvciA9IHRoaXMuaXNHZW5lcmF0b3JcblxuXHRcdC8vIFRPRE86RVM2IHVzZSBgLi4uYGZcblx0XHRjb25zdCBuQXJncyA9IG5ldyBMaXRlcmFsKHRoaXMuYXJncy5sZW5ndGgpXG5cdFx0Y29uc3Qgb3BEZWNsYXJlUmVzdCA9IG9wTWFwKHRoaXMub3BSZXN0QXJnLCByZXN0ID0+XG5cdFx0XHRkZWNsYXJlKHJlc3QsIG5ldyBDYWxsRXhwcmVzc2lvbihBcnJheVNsaWNlQ2FsbCwgW0lkQXJndW1lbnRzLCBuQXJnc10pKSlcblx0XHRjb25zdCBhcmdDaGVja3MgPSBvcElmKG9wdGlvbnMuaW5jbHVkZUNoZWNrcygpLCAoKSA9PlxuXHRcdFx0ZmxhdE9wTWFwKHRoaXMuYXJncywgb3BUeXBlQ2hlY2tGb3JMb2NhbERlY2xhcmUpKVxuXG5cdFx0Y29uc3Qgb3BEZWNsYXJlVGhpcyA9XG5cdFx0XHRvcElmKCFpc0luQ29uc3RydWN0b3IgJiYgdGhpcy5vcERlY2xhcmVUaGlzICE9IG51bGwsICgpID0+IERlY2xhcmVMZXhpY2FsVGhpcylcblxuXHRcdGNvbnN0IGxlYWQgPSBjYXQobGVhZFN0YXRlbWVudHMsIG9wRGVjbGFyZVRoaXMsIG9wRGVjbGFyZVJlc3QsIGFyZ0NoZWNrcylcblxuXHRcdGNvbnN0IGJvZHkgPSB0Mih0aGlzLmJsb2NrLCBsZWFkLCB0aGlzLm9wRGVjbGFyZVJlcylcblx0XHRjb25zdCBhcmdzID0gdGhpcy5hcmdzLm1hcCh0MClcblx0XHRpc0luR2VuZXJhdG9yID0gb2xkSW5HZW5lcmF0b3Jcblx0XHRjb25zdCBpZCA9IG9wTWFwKHZlcmlmeVJlc3VsdHMub3BOYW1lKHRoaXMpLCBpZGVudGlmaWVyKVxuXG5cdFx0Y29uc3QgY2FuVXNlQXJyb3dGdW5jdGlvbiA9XG5cdFx0XHRpZCA9PT0gbnVsbCAmJlxuXHRcdFx0dGhpcy5vcERlY2xhcmVUaGlzID09PSBudWxsICYmXG5cdFx0XHRvcERlY2xhcmVSZXN0ID09PSBudWxsICYmXG5cdFx0XHQhdGhpcy5pc0dlbmVyYXRvclxuXHRcdHJldHVybiBjYW5Vc2VBcnJvd0Z1bmN0aW9uID9cblx0XHRcdG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihhcmdzLCBib2R5KSA6XG5cdFx0XHRuZXcgRnVuY3Rpb25FeHByZXNzaW9uKGlkLCBhcmdzLCBib2R5LCB0aGlzLmlzR2VuZXJhdG9yKVxuXHR9LFxuXG5cdElnbm9yZSgpIHsgcmV0dXJuIFtdIH0sXG5cblx0TGF6eSgpIHsgcmV0dXJuIGxhenlXcmFwKHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdE1ldGhvZEltcGwoaXNTdGF0aWMpIHtcblx0XHRjb25zdCB2YWx1ZSA9IHQwKHRoaXMuZnVuKVxuXHRcdGFzc2VydCh2YWx1ZS5pZCA9PSBudWxsKVxuXHRcdC8vIFNpbmNlIHRoZSBGdW4gc2hvdWxkIGhhdmUgb3BEZWNsYXJlVGhpcywgaXQgd2lsbCBuZXZlciBiZSBhbiBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbi5cblx0XHRhc3NlcnQodmFsdWUgaW5zdGFuY2VvZiBGdW5jdGlvbkV4cHJlc3Npb24pXG5cblx0XHRjb25zdCB7a2V5LCBjb21wdXRlZH0gPSBtZXRob2RLZXlDb21wdXRlZCh0aGlzLnN5bWJvbClcblx0XHRyZXR1cm4gbmV3IE1ldGhvZERlZmluaXRpb24oa2V5LCB2YWx1ZSwgJ21ldGhvZCcsIGlzU3RhdGljLCBjb21wdXRlZClcblx0fSxcblx0TWV0aG9kR2V0dGVyKGlzU3RhdGljKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFtdLCB0MSh0aGlzLmJsb2NrLCBEZWNsYXJlTGV4aWNhbFRoaXMpKVxuXHRcdGNvbnN0IHtrZXksIGNvbXB1dGVkfSA9IG1ldGhvZEtleUNvbXB1dGVkKHRoaXMuc3ltYm9sKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kRGVmaW5pdGlvbihrZXksIHZhbHVlLCAnZ2V0JywgaXNTdGF0aWMsIGNvbXB1dGVkKVxuXHR9LFxuXHRNZXRob2RTZXR0ZXIoaXNTdGF0aWMpIHtcblx0XHRjb25zdCB2YWx1ZSA9IG5ldyBGdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgW0lkRm9jdXNdLCB0MSh0aGlzLmJsb2NrLCBEZWNsYXJlTGV4aWNhbFRoaXMpKVxuXHRcdGNvbnN0IHtrZXksIGNvbXB1dGVkfSA9IG1ldGhvZEtleUNvbXB1dGVkKHRoaXMuc3ltYm9sKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kRGVmaW5pdGlvbihrZXksIHZhbHVlLCAnc2V0JywgaXNTdGF0aWMsIGNvbXB1dGVkKVxuXHR9LFxuXG5cdE51bWJlckxpdGVyYWwoKSB7XG5cdFx0Ly8gTmVnYXRpdmUgbnVtYmVycyBhcmUgbm90IHBhcnQgb2YgRVMgc3BlYy5cblx0XHQvLyBodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNS4xLyNzZWMtNy44LjNcblx0XHRjb25zdCB2YWx1ZSA9IE51bWJlcih0aGlzLnZhbHVlKVxuXHRcdGNvbnN0IGxpdCA9IG5ldyBMaXRlcmFsKE1hdGguYWJzKHZhbHVlKSlcblx0XHRjb25zdCBpc1Bvc2l0aXZlID0gdmFsdWUgPj0gMCAmJiAxIC8gdmFsdWUgIT09IC1JbmZpbml0eVxuXHRcdHJldHVybiBpc1Bvc2l0aXZlID8gbGl0IDogbmV3IFVuYXJ5RXhwcmVzc2lvbignLScsIGxpdClcblx0fSxcblxuXHRMb2NhbEFjY2VzcygpIHtcblx0XHRpZiAodGhpcy5uYW1lID09PSAndGhpcycpXG5cdFx0XHRyZXR1cm4gaXNJbkNvbnN0cnVjdG9yID8gbmV3IFRoaXNFeHByZXNzaW9uKCkgOiBJZExleGljYWxUaGlzXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBsZCA9IHZlcmlmeVJlc3VsdHMubG9jYWxEZWNsYXJlRm9yQWNjZXNzKHRoaXMpXG5cdFx0XHQvLyBJZiBsZCBtaXNzaW5nLCB0aGlzIGlzIGEgYnVpbHRpbiwgYW5kIGJ1aWx0aW5zIGFyZSBuZXZlciBsYXp5XG5cdFx0XHRyZXR1cm4gbGQgPT09IHVuZGVmaW5lZCA/IGlkZW50aWZpZXIodGhpcy5uYW1lKSA6IGFjY2Vzc0xvY2FsRGVjbGFyZShsZClcblx0XHR9XG5cdH0sXG5cblx0TG9jYWxEZWNsYXJlKCkgeyByZXR1cm4gbmV3IElkZW50aWZpZXIoaWRGb3JEZWNsYXJlQ2FjaGVkKHRoaXMpLm5hbWUpIH0sXG5cblx0TG9jYWxNdXRhdGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIGlkZW50aWZpZXIodGhpcy5uYW1lKSwgdDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0TG9naWMoKSB7XG5cdFx0Y29uc3Qgb3AgPSB0aGlzLmtpbmQgPT09IExvZ2ljcy5BbmQgPyAnJiYnIDogJ3x8J1xuXHRcdHJldHVybiB0YWlsKHRoaXMuYXJncykucmVkdWNlKChhLCBiKSA9PlxuXHRcdFx0bmV3IExvZ2ljYWxFeHByZXNzaW9uKG9wLCBhLCB0MChiKSksIHQwKHRoaXMuYXJnc1swXSkpXG5cdH0sXG5cblx0TWFwRW50cnkoKSB7IHJldHVybiBtc1NldFN1YihJZEJ1aWx0LCB0MCh0aGlzLmtleSksIHQwKHRoaXMudmFsKSkgfSxcblxuXHRNZW1iZXIoKSB7XG5cdFx0cmV0dXJuIG1lbWJlclN0cmluZ09yVmFsKHQwKHRoaXMub2JqZWN0KSwgdGhpcy5uYW1lKVxuXHR9LFxuXG5cdE1lbWJlclNldCgpIHtcblx0XHRjb25zdCBvYmogPSB0MCh0aGlzLm9iamVjdClcblx0XHRjb25zdCBuYW1lID0gKCkgPT5cblx0XHRcdHR5cGVvZiB0aGlzLm5hbWUgPT09ICdzdHJpbmcnID8gbmV3IExpdGVyYWwodGhpcy5uYW1lKSA6IHQwKHRoaXMubmFtZSlcblx0XHRjb25zdCB2YWwgPSBtYXliZVdyYXBJbkNoZWNrQ29udGFpbnModDAodGhpcy52YWx1ZSksIHRoaXMub3BUeXBlLCB0aGlzLm5hbWUpXG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU2V0dGVycy5Jbml0OlxuXHRcdFx0XHRyZXR1cm4gbXNOZXdQcm9wZXJ0eShvYmosIG5hbWUoKSwgdmFsKVxuXHRcdFx0Y2FzZSBTZXR0ZXJzLkluaXRNdXRhYmxlOlxuXHRcdFx0XHRyZXR1cm4gbXNOZXdNdXRhYmxlUHJvcGVydHkob2JqLCBuYW1lKCksIHZhbClcblx0XHRcdGNhc2UgU2V0dGVycy5NdXRhdGU6XG5cdFx0XHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXJTdHJpbmdPclZhbChvYmosIHRoaXMubmFtZSksIHZhbClcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcigpXG5cdFx0fVxuXHR9LFxuXG5cdE1vZHVsZSgpIHtcblx0XHRjb25zdCBib2R5ID0gdExpbmVzKHRoaXMubGluZXMpXG5cblx0XHR2ZXJpZnlSZXN1bHRzLmJ1aWx0aW5QYXRoVG9OYW1lcy5mb3JFYWNoKChpbXBvcnRlZCwgcGF0aCkgPT4ge1xuXHRcdFx0aWYgKHBhdGggIT09ICdnbG9iYWwnKSB7XG5cdFx0XHRcdGNvbnN0IGltcG9ydGVkRGVjbGFyZXMgPSBbXVxuXHRcdFx0XHRsZXQgb3BJbXBvcnREZWZhdWx0ID0gbnVsbFxuXHRcdFx0XHRsZXQgZGVmYXVsdE5hbWUgPSBsYXN0KHBhdGguc3BsaXQoJy8nKSlcblx0XHRcdFx0Zm9yIChjb25zdCBuYW1lIG9mIGltcG9ydGVkKSB7XG5cdFx0XHRcdFx0Y29uc3QgZGVjbGFyZSA9IExvY2FsRGVjbGFyZS5wbGFpbih0aGlzLmxvYywgbmFtZSlcblx0XHRcdFx0XHRpZiAobmFtZSA9PT0gZGVmYXVsdE5hbWUpXG5cdFx0XHRcdFx0XHRvcEltcG9ydERlZmF1bHQgPSBkZWNsYXJlXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aW1wb3J0ZWREZWNsYXJlcy5wdXNoKGRlY2xhcmUpXG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5pbXBvcnRzLnB1c2gobmV3IEltcG9ydCh0aGlzLmxvYywgcGF0aCwgaW1wb3J0ZWREZWNsYXJlcywgb3BJbXBvcnREZWZhdWx0KSlcblx0XHRcdH1cblx0XHR9KVxuXG5cdFx0Y29uc3QgYW1kID0gYW1kV3JhcE1vZHVsZSh0aGlzLmRvSW1wb3J0cywgdGhpcy5pbXBvcnRzLCBib2R5KVxuXG5cdFx0cmV0dXJuIG5ldyBQcm9ncmFtKGNhdChcblx0XHRcdG9wSWYob3B0aW9ucy5pbmNsdWRlVXNlU3RyaWN0KCksICgpID0+IFVzZVN0cmljdCksXG5cdFx0XHRvcElmKG9wdGlvbnMuaW5jbHVkZUFtZGVmaW5lKCksICgpID0+IEFtZGVmaW5lSGVhZGVyKSxcblx0XHRcdHRvU3RhdGVtZW50KGFtZCkpKVxuXHR9LFxuXG5cdE1vZHVsZUV4cG9ydE5hbWVkKCkge1xuXHRcdHJldHVybiB0MSh0aGlzLmFzc2lnbiwgdmFsID0+XG5cdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRFeHBvcnRzLCB0aGlzLmFzc2lnbi5hc3NpZ25lZS5uYW1lKSwgdmFsKSlcblx0fSxcblxuXHRNb2R1bGVFeHBvcnREZWZhdWx0KCkge1xuXHRcdHJldHVybiB0MSh0aGlzLmFzc2lnbiwgdmFsID0+IG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIEV4cG9ydHNEZWZhdWx0LCB2YWwpKVxuXHR9LFxuXG5cdE5ldygpIHtcblx0XHRjb25zdCBhbnlTcGxhdCA9IHRoaXMuYXJncy5zb21lKF8gPT4gXyBpbnN0YW5jZW9mIFNwbGF0KVxuXHRcdGNoZWNrKCFhbnlTcGxhdCwgdGhpcy5sb2MsICdUT0RPOiBTcGxhdCBwYXJhbXMgZm9yIG5ldycpXG5cdFx0cmV0dXJuIG5ldyBOZXdFeHByZXNzaW9uKHQwKHRoaXMudHlwZSksIHRoaXMuYXJncy5tYXAodDApKVxuXHR9LFxuXG5cdE5vdCgpIHsgcmV0dXJuIG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCB0MCh0aGlzLmFyZykpIH0sXG5cblx0T2JqRW50cnlBc3NpZ24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuYXNzaWduIGluc3RhbmNlb2YgQXNzaWduU2luZ2xlICYmICF0aGlzLmFzc2lnbi5hc3NpZ25lZS5pc0xhenkoKSA/XG5cdFx0XHR0MSh0aGlzLmFzc2lnbiwgdmFsID0+XG5cdFx0XHRcdG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlcihJZEJ1aWx0LCB0aGlzLmFzc2lnbi5hc3NpZ25lZS5uYW1lKSwgdmFsKSkgOlxuXHRcdFx0Y2F0KFxuXHRcdFx0XHR0MCh0aGlzLmFzc2lnbiksXG5cdFx0XHRcdHRoaXMuYXNzaWduLmFsbEFzc2lnbmVlcygpLm1hcChfID0+XG5cdFx0XHRcdFx0bXNTZXRMYXp5KElkQnVpbHQsIG5ldyBMaXRlcmFsKF8ubmFtZSksIGlkRm9yRGVjbGFyZUNhY2hlZChfKSkpKVxuXHR9LFxuXG5cdE9iakVudHJ5UGxhaW4oKSB7XG5cdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlclN0cmluZ09yVmFsKElkQnVpbHQsIHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdE9ialNpbXBsZSgpIHtcblx0XHRyZXR1cm4gbmV3IE9iamVjdEV4cHJlc3Npb24odGhpcy5wYWlycy5tYXAocGFpciA9PlxuXHRcdFx0bmV3IFByb3BlcnR5KCdpbml0JywgcHJvcGVydHlJZE9yTGl0ZXJhbChwYWlyLmtleSksIHQwKHBhaXIudmFsdWUpKSkpXG5cdH0sXG5cblx0UXVvdGUoKSB7XG5cdFx0aWYgKHRoaXMucGFydHMubGVuZ3RoID09PSAwKVxuXHRcdFx0cmV0dXJuIExpdEVtcHR5U3RyaW5nXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBxdWFzaXMgPSBbXSwgZXhwcmVzc2lvbnMgPSBbXVxuXG5cdFx0XHQvLyBUZW1wbGF0ZUxpdGVyYWwgbXVzdCBzdGFydCB3aXRoIGEgVGVtcGxhdGVFbGVtZW50XG5cdFx0XHRpZiAodHlwZW9mIHRoaXMucGFydHNbMF0gIT09ICdzdHJpbmcnKVxuXHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZW1wdHkpXG5cblx0XHRcdGZvciAobGV0IHBhcnQgb2YgdGhpcy5wYXJ0cylcblx0XHRcdFx0aWYgKHR5cGVvZiBwYXJ0ID09PSAnc3RyaW5nJylcblx0XHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZm9yUmF3U3RyaW5nKHBhcnQpKVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHQvLyBcInsxfXsxfVwiIG5lZWRzIGFuIGVtcHR5IHF1YXNpIGluIHRoZSBtaWRkbGUgKGFuZCBvbiB0aGUgZW5kcylcblx0XHRcdFx0XHRpZiAocXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoKVxuXHRcdFx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmVtcHR5KVxuXHRcdFx0XHRcdGV4cHJlc3Npb25zLnB1c2godDAocGFydCkpXG5cdFx0XHRcdH1cblxuXHRcdFx0Ly8gVGVtcGxhdGVMaXRlcmFsIG11c3QgZW5kIHdpdGggYSBUZW1wbGF0ZUVsZW1lbnQsIHNvIG9uZSBtb3JlIHF1YXNpIHRoYW4gZXhwcmVzc2lvbi5cblx0XHRcdGlmIChxdWFzaXMubGVuZ3RoID09PSBleHByZXNzaW9ucy5sZW5ndGgpXG5cdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5lbXB0eSlcblxuXHRcdFx0cmV0dXJuIG5ldyBUZW1wbGF0ZUxpdGVyYWwocXVhc2lzLCBleHByZXNzaW9ucylcblx0XHR9XG5cdH0sXG5cblx0UXVvdGVUZW1wbGF0ZSgpIHtcblx0XHRyZXR1cm4gbmV3IFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbih0MCh0aGlzLnRhZyksIHQwKHRoaXMucXVvdGUpKVxuXHR9LFxuXG5cdFNldFN1YigpIHtcblx0XHRjb25zdCBnZXRLaW5kID0gKCkgPT4ge1xuXHRcdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBTZXR0ZXJzLkluaXQ6XG5cdFx0XHRcdFx0cmV0dXJuICdpbml0J1xuXHRcdFx0XHRjYXNlIFNldHRlcnMuSW5pdE11dGFibGU6XG5cdFx0XHRcdFx0cmV0dXJuICdpbml0LW11dGFibGUnXG5cdFx0XHRcdGNhc2UgU2V0dGVycy5NdXRhdGU6XG5cdFx0XHRcdFx0cmV0dXJuICdtdXRhdGUnXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdH1cblx0XHR9XG5cdFx0Y29uc3Qga2luZCA9IGdldEtpbmQoKVxuXHRcdHJldHVybiBtc1NldFN1Yihcblx0XHRcdHQwKHRoaXMub2JqZWN0KSxcblx0XHRcdHRoaXMuc3ViYmVkcy5sZW5ndGggPT09IDEgPyB0MCh0aGlzLnN1YmJlZHNbMF0pIDogdGhpcy5zdWJiZWRzLm1hcCh0MCksXG5cdFx0XHRtYXliZVdyYXBJbkNoZWNrQ29udGFpbnModDAodGhpcy52YWx1ZSksIHRoaXMub3BUeXBlLCAndmFsdWUnKSxcblx0XHRcdG5ldyBMaXRlcmFsKGtpbmQpKVxuXHR9LFxuXG5cdFNwZWNpYWxEbygpIHtcblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTcGVjaWFsRG9zLkRlYnVnZ2VyOiByZXR1cm4gbmV3IERlYnVnZ2VyU3RhdGVtZW50KClcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcih0aGlzLmtpbmQpXG5cdFx0fVxuXHR9LFxuXG5cdFNwZWNpYWxWYWwoKSB7XG5cdFx0Ly8gTWFrZSBuZXcgb2JqZWN0cyBiZWNhdXNlIHdlIHdpbGwgYXNzaWduIGBsb2NgIHRvIHRoZW0uXG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuQ29udGFpbnM6XG5cdFx0XHRcdHJldHVybiBtZW1iZXIoSWRNcywgJ2NvbnRhaW5zJylcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuRmFsc2U6XG5cdFx0XHRcdHJldHVybiBuZXcgTGl0ZXJhbChmYWxzZSlcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuTmFtZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKHZlcmlmeVJlc3VsdHMubmFtZSh0aGlzKSlcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuTnVsbDpcblx0XHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKG51bGwpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLlNldFN1Yjpcblx0XHRcdFx0cmV0dXJuIG1lbWJlcihJZE1zLCAnc2V0U3ViJylcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuU3ViOlxuXHRcdFx0XHRyZXR1cm4gbWVtYmVyKElkTXMsICdzdWInKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5UcnVlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IExpdGVyYWwodHJ1ZSlcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuVW5kZWZpbmVkOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFVuYXJ5RXhwcmVzc2lvbigndm9pZCcsIExpdFplcm8pXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IodGhpcy5raW5kKVxuXHRcdH1cblx0fSxcblxuXHRTcGxhdCgpIHtcblx0XHRyZXR1cm4gbmV3IFNwcmVhZEVsZW1lbnQodDAodGhpcy5zcGxhdHRlZCkpXG5cdH0sXG5cblx0U3VwZXJDYWxsOiBzdXBlckNhbGwsXG5cdFN1cGVyQ2FsbERvOiBzdXBlckNhbGwsXG5cdFN1cGVyTWVtYmVyKCkge1xuXHRcdHJldHVybiBtZW1iZXJTdHJpbmdPclZhbChJZFN1cGVyLCB0aGlzLm5hbWUpXG5cdH0sXG5cblx0U3dpdGNoRG8oKSB7IHJldHVybiB0cmFuc3BpbGVTd2l0Y2godGhpcykgfSxcblx0U3dpdGNoVmFsKCkgeyByZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChbdHJhbnNwaWxlU3dpdGNoKHRoaXMpXSkpIH0sXG5cdFN3aXRjaERvUGFydDogc3dpdGNoUGFydCxcblx0U3dpdGNoVmFsUGFydDogc3dpdGNoUGFydCxcblxuXHRUaHJvdygpIHtcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BUaHJvd24sXG5cdFx0XHRfID0+IGRvVGhyb3coXyksXG5cdFx0XHQoKSA9PiBuZXcgVGhyb3dTdGF0ZW1lbnQobmV3IE5ld0V4cHJlc3Npb24oR2xvYmFsRXJyb3IsIFtMaXRTdHJUaHJvd10pKSlcblx0fSxcblxuXHRXaXRoKCkge1xuXHRcdGNvbnN0IGlkRGVjbGFyZSA9IGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzLmRlY2xhcmUpXG5cdFx0Y29uc3QgYmxvY2sgPSB0Myh0aGlzLmJsb2NrLCBudWxsLCBudWxsLCBuZXcgUmV0dXJuU3RhdGVtZW50KGlkRGVjbGFyZSkpXG5cdFx0Y29uc3QgZnVuID0gaXNJbkdlbmVyYXRvciA/XG5cdFx0XHRuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFtpZERlY2xhcmVdLCBibG9jaywgdHJ1ZSkgOlxuXHRcdFx0bmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKFtpZERlY2xhcmVdLCBibG9jaylcblx0XHRjb25zdCBjYWxsID0gbmV3IENhbGxFeHByZXNzaW9uKGZ1biwgW3QwKHRoaXMudmFsdWUpXSlcblx0XHRyZXR1cm4gaXNJbkdlbmVyYXRvciA/IG5ldyBZaWVsZEV4cHJlc3Npb24oY2FsbCwgdHJ1ZSkgOiBjYWxsXG5cdH0sXG5cblx0WWllbGQoKSB7IHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKG9wTWFwKHRoaXMub3BZaWVsZGVkLCB0MCksIGZhbHNlKSB9LFxuXG5cdFlpZWxkVG8oKSB7IHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKHQwKHRoaXMueWllbGRlZFRvKSwgdHJ1ZSkgfVxufSlcblxuZnVuY3Rpb24gY2FzZVBhcnQoYWx0ZXJuYXRlKSB7XG5cdGlmICh0aGlzLnRlc3QgaW5zdGFuY2VvZiBQYXR0ZXJuKSB7XG5cdFx0Y29uc3Qge3R5cGUsIHBhdHRlcm5lZCwgbG9jYWxzfSA9IHRoaXMudGVzdFxuXHRcdGNvbnN0IGRlY2wgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBbXG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKElkRXh0cmFjdCwgbXNFeHRyYWN0KHQwKHR5cGUpLCB0MChwYXR0ZXJuZWQpKSldKVxuXHRcdGNvbnN0IHRlc3QgPSBuZXcgQmluYXJ5RXhwcmVzc2lvbignIT09JywgSWRFeHRyYWN0LCBMaXROdWxsKVxuXHRcdGNvbnN0IGV4dHJhY3QgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBsb2NhbHMubWFwKChfLCBpZHgpID0+XG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKFxuXHRcdFx0XHRpZEZvckRlY2xhcmVDYWNoZWQoXyksXG5cdFx0XHRcdG5ldyBNZW1iZXJFeHByZXNzaW9uKElkRXh0cmFjdCwgbmV3IExpdGVyYWwoaWR4KSkpKSlcblx0XHRjb25zdCByZXMgPSB0MSh0aGlzLnJlc3VsdCwgZXh0cmFjdClcblx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KFtkZWNsLCBuZXcgSWZTdGF0ZW1lbnQodGVzdCwgcmVzLCBhbHRlcm5hdGUpXSlcblx0fSBlbHNlXG5cdFx0Ly8gYWx0ZXJuYXRlIHdyaXR0ZW4gdG8gYnkgYGNhc2VCb2R5YC5cblx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KHQwKHRoaXMudGVzdCksIHQwKHRoaXMucmVzdWx0KSwgYWx0ZXJuYXRlKVxufVxuXG5mdW5jdGlvbiBzdXBlckNhbGwoKSB7XG5cdGNvbnN0IGFyZ3MgPSB0aGlzLmFyZ3MubWFwKHQwKVxuXHRjb25zdCBtZXRob2QgPSB2ZXJpZnlSZXN1bHRzLnN1cGVyQ2FsbFRvTWV0aG9kLmdldCh0aGlzKVxuXG5cdGlmIChtZXRob2QgaW5zdGFuY2VvZiBDb25zdHJ1Y3Rvcikge1xuXHRcdGNvbnN0IGNhbGwgPSBuZXcgQ2FsbEV4cHJlc3Npb24oSWRTdXBlciwgYXJncylcblx0XHRjb25zdCBtZW1iZXJTZXRzID0gY29uc3RydWN0b3JTZXRNZW1iZXJzKG1ldGhvZClcblx0XHRyZXR1cm4gY2F0KGNhbGwsIG1lbWJlclNldHMpXG5cdH0gZWxzZVxuXHRcdHJldHVybiBuZXcgQ2FsbEV4cHJlc3Npb24obWVtYmVyU3RyaW5nT3JWYWwoSWRTdXBlciwgbWV0aG9kLnN5bWJvbCksIGFyZ3MpXG59XG5cbmZ1bmN0aW9uIHN3aXRjaFBhcnQoKSB7XG5cdGNvbnN0IGZvbGxvdyA9IG9wSWYodGhpcyBpbnN0YW5jZW9mIFN3aXRjaERvUGFydCwgKCkgPT4gbmV3IEJyZWFrU3RhdGVtZW50KVxuXHQvKlxuXHRXZSBjb3VsZCBqdXN0IHBhc3MgYmxvY2suYm9keSBmb3IgdGhlIHN3aXRjaCBsaW5lcywgYnV0IGluc3RlYWRcblx0ZW5jbG9zZSB0aGUgYm9keSBvZiB0aGUgc3dpdGNoIGNhc2UgaW4gY3VybHkgYnJhY2VzIHRvIGVuc3VyZSBhIG5ldyBzY29wZS5cblx0VGhhdCB3YXkgdGhpcyBjb2RlIHdvcmtzOlxuXHRcdHN3aXRjaCAoMCkge1xuXHRcdFx0Y2FzZSAwOiB7XG5cdFx0XHRcdGNvbnN0IGEgPSAwXG5cdFx0XHRcdHJldHVybiBhXG5cdFx0XHR9XG5cdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdC8vIFdpdGhvdXQgY3VybHkgYnJhY2VzIHRoaXMgd291bGQgY29uZmxpY3Qgd2l0aCB0aGUgb3RoZXIgYGFgLlxuXHRcdFx0XHRjb25zdCBhID0gMVxuXHRcdFx0XHRhXG5cdFx0XHR9XG5cdFx0fVxuXHQqL1xuXHRjb25zdCBibG9jayA9IHQzKHRoaXMucmVzdWx0LCBudWxsLCBudWxsLCBmb2xsb3cpXG5cdC8vIElmIHN3aXRjaCBoYXMgbXVsdGlwbGUgdmFsdWVzLCBidWlsZCB1cCBhIHN0YXRlbWVudCBsaWtlOiBgY2FzZSAxOiBjYXNlIDI6IHsgZG9CbG9jaygpIH1gXG5cdGNvbnN0IHggPSBbXVxuXHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudmFsdWVzLmxlbmd0aCAtIDE7IGkgPSBpICsgMSlcblx0XHQvLyBUaGVzZSBjYXNlcyBmYWxsdGhyb3VnaCB0byB0aGUgb25lIGF0IHRoZSBlbmQuXG5cdFx0eC5wdXNoKG5ldyBTd2l0Y2hDYXNlKHQwKHRoaXMudmFsdWVzW2ldKSwgW10pKVxuXHR4LnB1c2gobmV3IFN3aXRjaENhc2UodDAodGhpcy52YWx1ZXNbdGhpcy52YWx1ZXMubGVuZ3RoIC0gMV0pLCBbYmxvY2tdKSlcblx0cmV0dXJuIHhcbn1cblxuLy8gRnVuY3Rpb25zIHNwZWNpZmljIHRvIGNlcnRhaW4gZXhwcmVzc2lvbnMuXG5jb25zdFxuXHQvLyBXcmFwcyBhIGJsb2NrICh3aXRoIGByZXR1cm5gIHN0YXRlbWVudHMgaW4gaXQpIGluIGFuIElJRkUuXG5cdGJsb2NrV3JhcCA9IGJsb2NrID0+IHtcblx0XHRjb25zdCBpbnZva2UgPSBuZXcgQ2FsbEV4cHJlc3Npb24oZnVuY3Rpb25FeHByZXNzaW9uVGh1bmsoYmxvY2ssIGlzSW5HZW5lcmF0b3IpLCBbXSlcblx0XHRyZXR1cm4gaXNJbkdlbmVyYXRvciA/IG5ldyBZaWVsZEV4cHJlc3Npb24oaW52b2tlLCB0cnVlKSA6IGludm9rZVxuXHR9LFxuXG5cdGNhc2VCb2R5ID0gKHBhcnRzLCBvcEVsc2UpID0+IHtcblx0XHRsZXQgYWNjID0gaWZFbHNlKG9wRWxzZSwgdDAsICgpID0+IFRocm93Tm9DYXNlTWF0Y2gpXG5cdFx0Zm9yIChsZXQgaSA9IHBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaSA9IGkgLSAxKVxuXHRcdFx0YWNjID0gdDEocGFydHNbaV0sIGFjYylcblx0XHRyZXR1cm4gYWNjXG5cdH0sXG5cblx0Y29uc3RydWN0b3JTZXRNZW1iZXJzID0gY29uc3RydWN0b3IgPT5cblx0XHRjb25zdHJ1Y3Rvci5tZW1iZXJBcmdzLm1hcChfID0+XG5cdFx0XHRtc05ld1Byb3BlcnR5KG5ldyBUaGlzRXhwcmVzc2lvbigpLCBuZXcgTGl0ZXJhbChfLm5hbWUpLCBpZEZvckRlY2xhcmVDYWNoZWQoXykpKSxcblxuXHRmb3JMb29wID0gKG9wSXRlcmF0ZWUsIGJsb2NrKSA9PlxuXHRcdGlmRWxzZShvcEl0ZXJhdGVlLFxuXHRcdFx0KHtlbGVtZW50LCBiYWd9KSA9PiB7XG5cdFx0XHRcdGNvbnN0IGRlY2xhcmUgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignbGV0Jyxcblx0XHRcdFx0XHRbbmV3IFZhcmlhYmxlRGVjbGFyYXRvcih0MChlbGVtZW50KSldKVxuXHRcdFx0XHRyZXR1cm4gbmV3IEZvck9mU3RhdGVtZW50KGRlY2xhcmUsIHQwKGJhZyksIHQwKGJsb2NrKSlcblx0XHRcdH0sXG5cdFx0XHQoKSA9PiBmb3JTdGF0ZW1lbnRJbmZpbml0ZSh0MChibG9jaykpKSxcblxuXHRkb1Rocm93ID0gdGhyb3duID0+XG5cdFx0bmV3IFRocm93U3RhdGVtZW50KHRocm93biBpbnN0YW5jZW9mIFF1b3RlID9cblx0XHRcdG5ldyBOZXdFeHByZXNzaW9uKEdsb2JhbEVycm9yLCBbdDAodGhyb3duKV0pIDpcblx0XHRcdHQwKHRocm93bikpLFxuXG5cdG1lbWJlclN0cmluZ09yVmFsID0gKG9iamVjdCwgbWVtYmVyTmFtZSkgPT5cblx0XHR0eXBlb2YgbWVtYmVyTmFtZSA9PT0gJ3N0cmluZycgP1xuXHRcdFx0bWVtYmVyKG9iamVjdCwgbWVtYmVyTmFtZSkgOlxuXHRcdFx0bmV3IE1lbWJlckV4cHJlc3Npb24ob2JqZWN0LCB0MChtZW1iZXJOYW1lKSksXG5cblx0bWV0aG9kS2V5Q29tcHV0ZWQgPSBzeW1ib2wgPT4ge1xuXHRcdGlmICh0eXBlb2Ygc3ltYm9sID09PSAnc3RyaW5nJylcblx0XHRcdHJldHVybiB7a2V5OiBwcm9wZXJ0eUlkT3JMaXRlcmFsKHN5bWJvbCksIGNvbXB1dGVkOiBmYWxzZX1cblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IGtleSA9IHN5bWJvbCBpbnN0YW5jZW9mIFF1b3RlID8gdDAoc3ltYm9sKSA6IG1zU3ltYm9sKHQwKHN5bWJvbCkpXG5cdFx0XHRyZXR1cm4ge2tleSwgY29tcHV0ZWQ6IHRydWV9XG5cdFx0fVxuXHR9LFxuXG5cdHRyYW5zcGlsZUJsb2NrID0gKHJldHVybmVkLCBsaW5lcywgbGVhZCwgb3BEZWNsYXJlUmVzLCBmb2xsb3cpID0+IHtcblx0XHQvLyBUT0RPOkVTNiBPcHRpb25hbCBhcmd1bWVudHNcblx0XHRpZiAobGVhZCA9PT0gdW5kZWZpbmVkKSBsZWFkID0gbnVsbFxuXHRcdGlmIChvcERlY2xhcmVSZXMgPT09IHVuZGVmaW5lZCkgb3BEZWNsYXJlUmVzID0gbnVsbFxuXHRcdGlmIChmb2xsb3cgPT09IHVuZGVmaW5lZCkgZm9sbG93ID0gbnVsbFxuXHRcdGNvbnN0IGZpbiA9IGlmRWxzZShvcERlY2xhcmVSZXMsXG5cdFx0XHRyZCA9PiB7XG5cdFx0XHRcdGNvbnN0IHJldCA9IG1heWJlV3JhcEluQ2hlY2tDb250YWlucyhyZXR1cm5lZCwgcmQub3BUeXBlLCByZC5uYW1lKVxuXHRcdFx0XHRyZXR1cm4gaWZFbHNlKGZvbGxvdyxcblx0XHRcdFx0XHRfID0+IGNhdChkZWNsYXJlKHJkLCByZXQpLCBfLCBSZXR1cm5SZXMpLFxuXHRcdFx0XHRcdCgpID0+IG5ldyBSZXR1cm5TdGF0ZW1lbnQocmV0KSlcblx0XHRcdH0sXG5cdFx0XHQoKSA9PiBjYXQoZm9sbG93LCBuZXcgUmV0dXJuU3RhdGVtZW50KHJldHVybmVkKSkpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgbGluZXMsIGZpbikpXG5cdH0sXG5cblx0dHJhbnNwaWxlRXhjZXB0ID0gZXhjZXB0ID0+XG5cdFx0bmV3IFRyeVN0YXRlbWVudChcblx0XHRcdHQwKGV4Y2VwdC50cnkpLFxuXHRcdFx0b3BNYXAoZXhjZXB0LmNhdGNoLCB0MCksXG5cdFx0XHRvcE1hcChleGNlcHQuZmluYWxseSwgdDApKSxcblxuXHR0cmFuc3BpbGVTd2l0Y2ggPSBfID0+IHtcblx0XHRjb25zdCBwYXJ0cyA9IGZsYXRNYXAoXy5wYXJ0cywgdDApXG5cdFx0cGFydHMucHVzaChpZkVsc2UoXy5vcEVsc2UsXG5cdFx0XHRfID0+IG5ldyBTd2l0Y2hDYXNlKHVuZGVmaW5lZCwgdDAoXykuYm9keSksXG5cdFx0XHQoKSA9PiBTd2l0Y2hDYXNlTm9NYXRjaCkpXG5cdFx0cmV0dXJuIG5ldyBTd2l0Y2hTdGF0ZW1lbnQodDAoXy5zd2l0Y2hlZCksIHBhcnRzKVxuXHR9XG5cbmNvbnN0IElkQm9vdCA9IG5ldyBJZGVudGlmaWVyKCdfYm9vdCcpXG5cbi8vIE1vZHVsZSBoZWxwZXJzXG5jb25zdFxuXHRhbWRXcmFwTW9kdWxlID0gKGRvSW1wb3J0cywgaW1wb3J0cywgYm9keSkgPT4ge1xuXHRcdGNvbnN0IHNob3VsZEltcG9ydEJvb3QgPSBvcHRpb25zLmltcG9ydEJvb3QoKVxuXG5cdFx0Y29uc3QgYWxsSW1wb3J0cyA9IGRvSW1wb3J0cy5jb25jYXQoaW1wb3J0cylcblx0XHRjb25zdCBhbGxJbXBvcnRQYXRocyA9IGFsbEltcG9ydHMubWFwKF8gPT4gbWFuZ2xlUGF0aChfLnBhdGgpKVxuXG5cdFx0Y29uc3QgYXJySW1wb3J0UGF0aHMgPSBuZXcgQXJyYXlFeHByZXNzaW9uKGNhdChcblx0XHRcdG9wSWYoc2hvdWxkSW1wb3J0Qm9vdCwgKCkgPT4gbmV3IExpdGVyYWwob3B0aW9ucy5ib290UGF0aCgpKSksXG5cdFx0XHRMaXRTdHJFeHBvcnRzLFxuXHRcdFx0YWxsSW1wb3J0UGF0aHMubWFwKF8gPT4gbmV3IExpdGVyYWwoXykpKSlcblxuXHRcdGNvbnN0IGltcG9ydFRvSWRlbnRpZmllciA9IG5ldyBNYXAoKVxuXHRcdGNvbnN0IGltcG9ydElkZW50aWZpZXJzID0gW11cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFsbEltcG9ydHMubGVuZ3RoOyBpID0gaSArIDEpIHtcblx0XHRcdGNvbnN0IF8gPSBhbGxJbXBvcnRzW2ldXG5cdFx0XHRjb25zdCBpZCA9IGlkZW50aWZpZXIoYCR7cGF0aEJhc2VOYW1lKF8ucGF0aCl9XyR7aX1gKVxuXHRcdFx0aW1wb3J0SWRlbnRpZmllcnMucHVzaChpZClcblx0XHRcdGltcG9ydFRvSWRlbnRpZmllci5zZXQoXywgaWQpXG5cdFx0fVxuXG5cdFx0Y29uc3QgaW1wb3J0QXJncyA9IGNhdChvcElmKHNob3VsZEltcG9ydEJvb3QsICgpID0+IElkQm9vdCksIElkRXhwb3J0cywgaW1wb3J0SWRlbnRpZmllcnMpXG5cblx0XHRjb25zdCBkb0Jvb3QgPSBvcElmKHNob3VsZEltcG9ydEJvb3QsICgpID0+IG5ldyBFeHByZXNzaW9uU3RhdGVtZW50KG1zR2V0TW9kdWxlKElkQm9vdCkpKVxuXG5cdFx0Y29uc3QgaW1wb3J0RG9zID0gZG9JbXBvcnRzLm1hcChfID0+XG5cdFx0XHRsb2MobmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQobXNHZXRNb2R1bGUoaW1wb3J0VG9JZGVudGlmaWVyLmdldChfKSkpLCBfLmxvYykpXG5cblx0XHQvLyBFeHRyYWN0cyBpbXBvcnRlZCB2YWx1ZXMgZnJvbSB0aGUgbW9kdWxlcy5cblx0XHRjb25zdCBvcERlY2xhcmVJbXBvcnRlZExvY2FscyA9IG9wSWYoIWlzRW1wdHkoaW1wb3J0cyksXG5cdFx0XHQoKSA9PiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLFxuXHRcdFx0XHRmbGF0TWFwKGltcG9ydHMsIF8gPT4gaW1wb3J0RGVjbGFyYXRvcnMoXywgaW1wb3J0VG9JZGVudGlmaWVyLmdldChfKSkpKSlcblxuXHRcdGNvbnN0IGZ1bGxCb2R5ID0gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChcblx0XHRcdGRvQm9vdCwgaW1wb3J0RG9zLCBvcERlY2xhcmVJbXBvcnRlZExvY2FscywgYm9keSwgUmV0dXJuRXhwb3J0cykpXG5cblx0XHRjb25zdCBsYXp5Qm9keSA9XG5cdFx0XHRvcHRpb25zLmxhenlNb2R1bGUoKSA/XG5cdFx0XHRcdG5ldyBCbG9ja1N0YXRlbWVudChbbmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQoXG5cdFx0XHRcdFx0bmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgRXhwb3J0c0dldCxcblx0XHRcdFx0XHRcdG1zTGF6eShmdW5jdGlvbkV4cHJlc3Npb25UaHVuayhmdWxsQm9keSkpKSldKSA6XG5cdFx0XHRcdGZ1bGxCb2R5XG5cblx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKElkRGVmaW5lLFxuXHRcdFx0W2FyckltcG9ydFBhdGhzLCBuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oaW1wb3J0QXJncywgbGF6eUJvZHkpXSlcblx0fSxcblxuXHRwYXRoQmFzZU5hbWUgPSBwYXRoID0+XG5cdFx0cGF0aC5zdWJzdHIocGF0aC5sYXN0SW5kZXhPZignLycpICsgMSksXG5cblx0aW1wb3J0RGVjbGFyYXRvcnMgPSAoe2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9LCBtb2R1bGVJZGVudGlmaWVyKSA9PiB7XG5cdFx0Ly8gVE9ETzogQ291bGQgYmUgbmVhdGVyIGFib3V0IHRoaXNcblx0XHRjb25zdCBpc0xhenkgPSAoaXNFbXB0eShpbXBvcnRlZCkgPyBvcEltcG9ydERlZmF1bHQgOiBpbXBvcnRlZFswXSkuaXNMYXp5KClcblx0XHRjb25zdCB2YWx1ZSA9IChpc0xhenkgPyBtc0xhenlHZXRNb2R1bGUgOiBtc0dldE1vZHVsZSkobW9kdWxlSWRlbnRpZmllcilcblxuXHRcdGNvbnN0IGltcG9ydGVkRGVmYXVsdCA9IG9wTWFwKG9wSW1wb3J0RGVmYXVsdCwgZGVmID0+IHtcblx0XHRcdGNvbnN0IGRlZmV4cCA9IG1zR2V0RGVmYXVsdEV4cG9ydChtb2R1bGVJZGVudGlmaWVyKVxuXHRcdFx0Y29uc3QgdmFsID0gaXNMYXp5ID8gbGF6eVdyYXAoZGVmZXhwKSA6IGRlZmV4cFxuXHRcdFx0cmV0dXJuIGxvYyhuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRm9yRGVjbGFyZUNhY2hlZChkZWYpLCB2YWwpLCBkZWYubG9jKVxuXHRcdH0pXG5cblx0XHRjb25zdCBpbXBvcnRlZERlc3RydWN0ID0gaXNFbXB0eShpbXBvcnRlZCkgPyBudWxsIDpcblx0XHRcdG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzKGltcG9ydGVkLCBpc0xhenksIHZhbHVlLCB0cnVlLCBmYWxzZSlcblxuXHRcdHJldHVybiBjYXQoaW1wb3J0ZWREZWZhdWx0LCBpbXBvcnRlZERlc3RydWN0KVxuXHR9XG5cbi8vIEdlbmVyYWwgdXRpbHMuIE5vdCBpbiB1dGlsLmpzIGJlY2F1c2UgdGhlc2UgY2xvc2Ugb3ZlciBjb250ZXh0LlxuY29uc3Rcblx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMgPSAoYXNzaWduZWVzLCBpc0xhenksIHZhbHVlLCBpc01vZHVsZSkgPT4ge1xuXHRcdGNvbnN0IGRlc3RydWN0dXJlZE5hbWUgPSBgXyQke25leHREZXN0cnVjdHVyZWRJZH1gXG5cdFx0bmV4dERlc3RydWN0dXJlZElkID0gbmV4dERlc3RydWN0dXJlZElkICsgMVxuXHRcdGNvbnN0IGlkRGVzdHJ1Y3R1cmVkID0gbmV3IElkZW50aWZpZXIoZGVzdHJ1Y3R1cmVkTmFtZSlcblx0XHRjb25zdCBkZWNsYXJhdG9ycyA9IGFzc2lnbmVlcy5tYXAoYXNzaWduZWUgPT4ge1xuXHRcdFx0Ly8gVE9ETzogRG9uJ3QgY29tcGlsZSBpdCBpZiBpdCdzIG5ldmVyIGFjY2Vzc2VkXG5cdFx0XHRjb25zdCBnZXQgPSBnZXRNZW1iZXIoaWREZXN0cnVjdHVyZWQsIGFzc2lnbmVlLm5hbWUsIGlzTGF6eSwgaXNNb2R1bGUpXG5cdFx0XHRyZXR1cm4gbWFrZURlY2xhcmF0b3IoYXNzaWduZWUsIGdldCwgaXNMYXp5KVxuXHRcdH0pXG5cdFx0Ly8gR2V0dGluZyBsYXp5IG1vZHVsZSBpcyBkb25lIGJ5IG1zLmxhenlHZXRNb2R1bGUuXG5cdFx0Y29uc3QgdmFsID0gaXNMYXp5ICYmICFpc01vZHVsZSA/IGxhenlXcmFwKHZhbHVlKSA6IHZhbHVlXG5cdFx0cmV0dXJuIGNhdChuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRGVzdHJ1Y3R1cmVkLCB2YWwpLCBkZWNsYXJhdG9ycylcblx0fSxcblxuXHRtYWtlRGVjbGFyYXRvciA9IChhc3NpZ25lZSwgdmFsdWUsIHZhbHVlSXNBbHJlYWR5TGF6eSkgPT4ge1xuXHRcdGNvbnN0IHtuYW1lLCBvcFR5cGV9ID0gYXNzaWduZWVcblx0XHRjb25zdCBpc0xhenkgPSBhc3NpZ25lZS5pc0xhenkoKVxuXHRcdC8vIFRPRE86IGFzc2VydChhc3NpZ25lZS5vcFR5cGUgPT09IG51bGwpXG5cdFx0Ly8gb3IgVE9ETzogQWxsb3cgdHlwZSBjaGVjayBvbiBsYXp5IHZhbHVlP1xuXHRcdHZhbHVlID0gaXNMYXp5ID8gdmFsdWUgOiBtYXliZVdyYXBJbkNoZWNrQ29udGFpbnModmFsdWUsIG9wVHlwZSwgbmFtZSlcblx0XHRjb25zdCB2YWwgPSBpc0xhenkgJiYgIXZhbHVlSXNBbHJlYWR5TGF6eSA/IGxhenlXcmFwKHZhbHVlKSA6IHZhbHVlXG5cdFx0YXNzZXJ0KGlzTGF6eSB8fCAhdmFsdWVJc0FscmVhZHlMYXp5KVxuXHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRm9yRGVjbGFyZUNhY2hlZChhc3NpZ25lZSksIHZhbClcblx0fSxcblxuXHRtYXliZVdyYXBJbkNoZWNrQ29udGFpbnMgPSAoYXN0LCBvcFR5cGUsIG5hbWUpID0+XG5cdFx0b3B0aW9ucy5pbmNsdWRlQ2hlY2tzKCkgJiYgb3BUeXBlICE9PSBudWxsID9cblx0XHRcdG1zQ2hlY2tDb250YWlucyh0MChvcFR5cGUpLCBhc3QsIG5ldyBMaXRlcmFsKG5hbWUpKSA6XG5cdFx0XHRhc3QsXG5cblx0Z2V0TWVtYmVyID0gKGFzdE9iamVjdCwgZ290TmFtZSwgaXNMYXp5LCBpc01vZHVsZSkgPT5cblx0XHRpc0xhenkgP1xuXHRcdG1zTGF6eUdldChhc3RPYmplY3QsIG5ldyBMaXRlcmFsKGdvdE5hbWUpKSA6XG5cdFx0aXNNb2R1bGUgJiYgb3B0aW9ucy5pbmNsdWRlQ2hlY2tzKCkgP1xuXHRcdG1zR2V0KGFzdE9iamVjdCwgbmV3IExpdGVyYWwoZ290TmFtZSkpIDpcblx0XHRtZW1iZXIoYXN0T2JqZWN0LCBnb3ROYW1lKVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

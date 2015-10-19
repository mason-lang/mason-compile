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

		ObjEntryComputed() {
			return new _esastDistAst.AssignmentExpression('=', new _esastDistAst.MemberExpression(_astConstants.IdBuilt, t0(this.key)), t0(this.value));
		},

		ObjEntryPlain() {
			return new _esastDistAst.AssignmentExpression('=', (0, _esastDistUtil.member)(_astConstants.IdBuilt, this.name), t0(this.value));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zcGlsZS5qcyIsInByaXZhdGUvdHJhbnNwaWxlL3RyYW5zcGlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O21CQ2lDd0IsU0FBUzs7Ozs7Ozs7QUFKakMsS0FBSSxhQUFhLEVBQUUsYUFBYSxFQUFFLGVBQWUsQ0FBQTtBQUNqRCxLQUFJLGtCQUFrQixDQUFBOzs7O0FBR1AsVUFBUyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFO0FBQ25FLGVBQWEsR0FBRyxjQUFjLENBQUE7QUFDOUIsZUFBYSxHQUFHLEtBQUssQ0FBQTtBQUNyQixpQkFBZSxHQUFHLEtBQUssQ0FBQTtBQUN2QixvQkFBa0IsR0FBRyxDQUFDLENBQUE7QUFDdEIsUUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUE7O0FBRWhDLGVBQWEsR0FBRyxJQUFJLENBQUE7QUFDcEIsU0FBTyxHQUFHLENBQUE7RUFDVjs7QUFFTSxPQUNOLEVBQUUsR0FBRyxJQUFJLElBQUksbUJBckMrQixHQUFHLEVBcUM5QixJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBOztBQUM3QyxPQUNDLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLEtBQUssbUJBdkN3QixHQUFHLEVBdUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7T0FDdEQsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEtBQUssbUJBeENrQixHQUFHLEVBd0NqQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztPQUN4RCxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEtBQUssbUJBekNZLEdBQUcsRUF5Q1gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFF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Q3RFLFFBQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixHQUFHLFlBMXZCaEMsUUFBUSxFQTB2QmlDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQTtBQUNuRSxZQWx3Qk0sTUFBTSxFQWt3QkwsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtBQUNyQyxTQUFPLGtCQTN3QlMsa0JBQWtCLENBMndCSixXQXh2QjJCLGtCQUFrQixFQXd2QjFCLFFBQVEsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0VBQ2hFO09BRUQsd0JBQXdCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksS0FDNUMsU0Ezd0JhLE9BQU8sQ0Eyd0JaLGFBQWEsRUFBRSxJQUFJLE1BQU0sS0FBSyxJQUFJLEdBQ3pDLFlBaHdCMEIsZUFBZSxFQWd3QnpCLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLEVBQUUsa0JBcHhCVSxPQUFPLENBb3hCTCxJQUFJLENBQUMsQ0FBQyxHQUNuRCxHQUFHO09BRUwsU0FBUyxHQUFHLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxLQUNoRCxNQUFNLEdBQ04sWUFwd0JPLFNBQVMsRUFvd0JOLFNBQVMsRUFBRSxrQkF6eEJ1QixPQUFPLENBeXhCbEIsT0FBTyxDQUFDLENBQUMsR0FDMUMsUUFBUSxJQUFJLFNBbHhCQyxPQUFPLENBa3hCQSxhQUFhLEVBQUUsR0FDbkMsWUF2d0J1RCxLQUFLLEVBdXdCdEQsU0FBUyxFQUFFLGtCQTN4QjJCLE9BQU8sQ0EyeEJ0QixPQUFPLENBQUMsQ0FBQyxHQUN0QyxtQkF2eEJnRCxNQUFNLEVBdXhCL0MsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFBIiwiZmlsZSI6InByaXZhdGUvdHJhbnNwaWxlL3RyYW5zcGlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHtBcnJheUV4cHJlc3Npb24sIEFycm93RnVuY3Rpb25FeHByZXNzaW9uLCBBc3NpZ25tZW50RXhwcmVzc2lvbiwgQmluYXJ5RXhwcmVzc2lvbixcblx0QmxvY2tTdGF0ZW1lbnQsIEJyZWFrU3RhdGVtZW50LCBDYWxsRXhwcmVzc2lvbiwgQ2F0Y2hDbGF1c2UsIENsYXNzQm9keSwgQ2xhc3NFeHByZXNzaW9uLFxuXHRDb25kaXRpb25hbEV4cHJlc3Npb24sIERlYnVnZ2VyU3RhdGVtZW50LCBFeHByZXNzaW9uU3RhdGVtZW50LCBGb3JPZlN0YXRlbWVudCxcblx0RnVuY3Rpb25FeHByZXNzaW9uLCBJZGVudGlmaWVyLCBJZlN0YXRlbWVudCwgTGl0ZXJhbCwgTG9naWNhbEV4cHJlc3Npb24sIE1lbWJlckV4cHJlc3Npb24sXG5cdE1ldGhvZERlZmluaXRpb24sIE5ld0V4cHJlc3Npb24sIE9iamVjdEV4cHJlc3Npb24sIFByb2dyYW0sIFByb3BlcnR5LCBSZXR1cm5TdGF0ZW1lbnQsXG5cdFNwcmVhZEVsZW1lbnQsIFN3aXRjaENhc2UsIFN3aXRjaFN0YXRlbWVudCwgVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uLCBUZW1wbGF0ZUVsZW1lbnQsXG5cdFRlbXBsYXRlTGl0ZXJhbCwgVGhpc0V4cHJlc3Npb24sIFRocm93U3RhdGVtZW50LCBUcnlTdGF0ZW1lbnQsIFZhcmlhYmxlRGVjbGFyYXRpb24sXG5cdFVuYXJ5RXhwcmVzc2lvbiwgVmFyaWFibGVEZWNsYXJhdG9yLCBZaWVsZEV4cHJlc3Npb259IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IHtmdW5jdGlvbkV4cHJlc3Npb25UaHVuaywgaWRlbnRpZmllciwgbG9jLCBtZW1iZXIsIHByb3BlcnR5SWRPckxpdGVyYWwsIHRvU3RhdGVtZW50XG5cdH0gZnJvbSAnZXNhc3QvZGlzdC91dGlsJ1xuaW1wb3J0IG1hbmdsZVBhdGggZnJvbSAnLi4vbWFuZ2xlUGF0aCdcbmltcG9ydCB7Y2hlY2ssIG9wdGlvbnMsIHdhcm59IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtBc3NpZ25TaW5nbGUsIENhbGwsIENvbnN0cnVjdG9yLCBMb2dpY3MsIE1lbWJlciwgTG9jYWxEZWNsYXJlLCBMb2NhbERlY2xhcmVzLCBQYXR0ZXJuLFxuXHRTcGxhdCwgU2V0dGVycywgU3BlY2lhbERvcywgU3BlY2lhbFZhbHMsIFN3aXRjaERvUGFydCwgUXVvdGUsIEltcG9ydH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2Fzc2VydCwgY2F0LCBmbGF0TWFwLCBmbGF0T3BNYXAsIGlmRWxzZSwgaXNFbXB0eSwgaW1wbGVtZW50TWFueSwgbGFzdCwgb3BJZiwgb3BNYXAsIHRhaWxcblx0fSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtBbWRlZmluZUhlYWRlciwgQXJyYXlTbGljZUNhbGwsIERlY2xhcmVCdWlsdEJhZywgRGVjbGFyZUJ1aWx0TWFwLCBEZWNsYXJlQnVpbHRPYmosXG5cdERlY2xhcmVMZXhpY2FsVGhpcywgRXhwb3J0c0RlZmF1bHQsIEV4cG9ydHNHZXQsIElkQXJndW1lbnRzLCBJZEJ1aWx0LCBJZERlZmluZSwgSWRFeHBvcnRzLFxuXHRJZEV4dHJhY3QsIElkRm9jdXMsIElkTGV4aWNhbFRoaXMsIElkU3VwZXIsIEdsb2JhbEVycm9yLCBMaXRFbXB0eVN0cmluZywgTGl0TnVsbCxcblx0TGl0U3RyRXhwb3J0cywgTGl0U3RyVGhyb3csIExpdFplcm8sIFJldHVybkJ1aWx0LCBSZXR1cm5FeHBvcnRzLCBSZXR1cm5SZXMsIFN3aXRjaENhc2VOb01hdGNoLFxuXHRUaHJvd0Fzc2VydEZhaWwsIFRocm93Tm9DYXNlTWF0Y2gsIFVzZVN0cmljdH0gZnJvbSAnLi9hc3QtY29uc3RhbnRzJ1xuaW1wb3J0IHtJZE1zLCBsYXp5V3JhcCwgbXNBZGQsIG1zQWRkTWFueSwgbXNBc3NlcnQsIG1zQXNzZXJ0TWVtYmVyLCBtc0Fzc2VydE5vdCxcblx0bXNBc3NlcnROb3RNZW1iZXIsIG1zQXNzb2MsIG1zQ2hlY2tDb250YWlucywgbXNFeHRyYWN0LCBtc0dldCwgbXNHZXREZWZhdWx0RXhwb3J0LCBtc0dldE1vZHVsZSxcblx0bXNMYXp5LCBtc0xhenlHZXQsIG1zTGF6eUdldE1vZHVsZSwgbXNOZXdNdXRhYmxlUHJvcGVydHksIG1zTmV3UHJvcGVydHksIG1zU2V0TGF6eSwgbXNTZXRTdWIsXG5cdG1zU29tZSwgbXNTeW1ib2wsIE1zTm9uZX0gZnJvbSAnLi9tcy1jYWxsJ1xuaW1wb3J0IHthY2Nlc3NMb2NhbERlY2xhcmUsIGRlY2xhcmUsIGZvclN0YXRlbWVudEluZmluaXRlLCBpZEZvckRlY2xhcmVDYWNoZWQsXG5cdG9wVHlwZUNoZWNrRm9yTG9jYWxEZWNsYXJlfSBmcm9tICcuL3V0aWwnXG5cbmxldCB2ZXJpZnlSZXN1bHRzLCBpc0luR2VuZXJhdG9yLCBpc0luQ29uc3RydWN0b3JcbmxldCBuZXh0RGVzdHJ1Y3R1cmVkSWRcblxuLyoqIFRyYW5zZm9ybSBhIHtAbGluayBNc0FzdH0gaW50byBhbiBlc2FzdC4gKiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFuc3BpbGUobW9kdWxlRXhwcmVzc2lvbiwgX3ZlcmlmeVJlc3VsdHMpIHtcblx0dmVyaWZ5UmVzdWx0cyA9IF92ZXJpZnlSZXN1bHRzXG5cdGlzSW5HZW5lcmF0b3IgPSBmYWxzZVxuXHRpc0luQ29uc3RydWN0b3IgPSBmYWxzZVxuXHRuZXh0RGVzdHJ1Y3R1cmVkSWQgPSAwXG5cdGNvbnN0IHJlcyA9IHQwKG1vZHVsZUV4cHJlc3Npb24pXG5cdC8vIFJlbGVhc2UgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cblx0dmVyaWZ5UmVzdWx0cyA9IG51bGxcblx0cmV0dXJuIHJlc1xufVxuXG5leHBvcnQgY29uc3Rcblx0dDAgPSBleHByID0+IGxvYyhleHByLnRyYW5zcGlsZSgpLCBleHByLmxvYylcbmNvbnN0XG5cdHQxID0gKGV4cHIsIGFyZykgPT4gbG9jKGV4cHIudHJhbnNwaWxlKGFyZyksIGV4cHIubG9jKSxcblx0dDIgPSAoZXhwciwgYXJnLCBhcmcyKSA9PiBsb2MoZXhwci50cmFuc3BpbGUoYXJnLCBhcmcyKSksXG5cdHQzID0gKGV4cHIsIGFyZywgYXJnMiwgYXJnMykgPT4gbG9jKGV4cHIudHJhbnNwaWxlKGFyZywgYXJnMiwgYXJnMyksIGV4cHIubG9jKSxcblx0dExpbmVzID0gZXhwcnMgPT4ge1xuXHRcdGNvbnN0IG91dCA9IFtdXG5cdFx0Zm9yIChjb25zdCBleHByIG9mIGV4cHJzKSB7XG5cdFx0XHRjb25zdCBhc3QgPSBleHByLnRyYW5zcGlsZSgpXG5cdFx0XHRpZiAoYXN0IGluc3RhbmNlb2YgQXJyYXkpXG5cdFx0XHRcdC8vIElnbm9yZSBwcm9kdWNlcyAwIHN0YXRlbWVudHMgYW5kIFJlZ2lvbiBwcm9kdWNlcyBtYW55LlxuXHRcdFx0XHRmb3IgKGNvbnN0IF8gb2YgYXN0KVxuXHRcdFx0XHRcdG91dC5wdXNoKHRvU3RhdGVtZW50KF8pKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRvdXQucHVzaChsb2ModG9TdGF0ZW1lbnQoYXN0KSwgZXhwci5sb2MpKVxuXHRcdH1cblx0XHRyZXR1cm4gb3V0XG5cdH1cblxuaW1wbGVtZW50TWFueShNc0FzdFR5cGVzLCAndHJhbnNwaWxlJywge1xuXHRBc3NlcnQoKSB7XG5cdFx0Y29uc3QgZmFpbENvbmQgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBjb25kID0gdDAodGhpcy5jb25kaXRpb24pXG5cdFx0XHRyZXR1cm4gdGhpcy5uZWdhdGUgPyBjb25kIDogbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIGNvbmQpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wVGhyb3duLFxuXHRcdFx0XyA9PiBuZXcgSWZTdGF0ZW1lbnQoZmFpbENvbmQoKSwgZG9UaHJvdyhfKSksXG5cdFx0XHQoKSA9PiB7XG5cdFx0XHRcdGlmICh0aGlzLmNvbmRpdGlvbiBpbnN0YW5jZW9mIENhbGwpIHtcblx0XHRcdFx0XHRjb25zdCBjYWxsID0gdGhpcy5jb25kaXRpb25cblx0XHRcdFx0XHRjb25zdCBjYWxsZWQgPSBjYWxsLmNhbGxlZFxuXHRcdFx0XHRcdGNvbnN0IGFyZ3MgPSBjYWxsLmFyZ3MubWFwKHQwKVxuXHRcdFx0XHRcdGlmIChjYWxsZWQgaW5zdGFuY2VvZiBNZW1iZXIpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGFzcyA9IHRoaXMubmVnYXRlID8gbXNBc3NlcnROb3RNZW1iZXIgOiBtc0Fzc2VydE1lbWJlclxuXHRcdFx0XHRcdFx0cmV0dXJuIGFzcyh0MChjYWxsZWQub2JqZWN0KSwgbmV3IExpdGVyYWwoY2FsbGVkLm5hbWUpLCAuLi5hcmdzKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb25zdCBhc3MgPSB0aGlzLm5lZ2F0ZSA/IG1zQXNzZXJ0Tm90IDogbXNBc3NlcnRcblx0XHRcdFx0XHRcdHJldHVybiBhc3ModDAoY2FsbGVkKSwgLi4uYXJncylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQoZmFpbENvbmQoKSwgVGhyb3dBc3NlcnRGYWlsKVxuXHRcdFx0fSlcblx0fSxcblxuXHRBc3NpZ25TaW5nbGUodmFsV3JhcCkge1xuXHRcdGNvbnN0IHZhbCA9IHZhbFdyYXAgPT09IHVuZGVmaW5lZCA/IHQwKHRoaXMudmFsdWUpIDogdmFsV3JhcCh0MCh0aGlzLnZhbHVlKSlcblx0XHRjb25zdCBkZWNsYXJlID0gbWFrZURlY2xhcmF0b3IodGhpcy5hc3NpZ25lZSwgdmFsLCBmYWxzZSlcblx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24odGhpcy5hc3NpZ25lZS5pc011dGFibGUoKSA/ICdsZXQnIDogJ2NvbnN0JywgW2RlY2xhcmVdKVxuXHR9LFxuXHQvLyBUT0RPOkVTNiBKdXN0IHVzZSBuYXRpdmUgZGVzdHJ1Y3R1cmluZyBhc3NpZ25cblx0QXNzaWduRGVzdHJ1Y3R1cmUoKSB7XG5cdFx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKFxuXHRcdFx0dGhpcy5raW5kKCkgPT09IExvY2FsRGVjbGFyZXMuTXV0YWJsZSA/ICdsZXQnIDogJ2NvbnN0Jyxcblx0XHRcdG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzKFxuXHRcdFx0XHR0aGlzLmFzc2lnbmVlcyxcblx0XHRcdFx0dGhpcy5raW5kKCkgPT09IExvY2FsRGVjbGFyZXMuTGF6eSxcblx0XHRcdFx0dDAodGhpcy52YWx1ZSksXG5cdFx0XHRcdGZhbHNlKSlcblx0fSxcblxuXHRCYWdFbnRyeSgpIHsgcmV0dXJuIG1zQWRkKElkQnVpbHQsIHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdEJhZ0VudHJ5TWFueSgpIHsgcmV0dXJuIG1zQWRkTWFueShJZEJ1aWx0LCB0MCh0aGlzLnZhbHVlKSkgfSxcblxuXHRCYWdTaW1wbGUoKSB7IHJldHVybiBuZXcgQXJyYXlFeHByZXNzaW9uKHRoaXMucGFydHMubWFwKHQwKSkgfSxcblxuXHRCbG9ja0RvKGxlYWQsIG9wRGVjbGFyZVJlcywgZm9sbG93KSB7XG5cdFx0Ly8gVE9ETzpFUzYgT3B0aW9uYWwgYXJndW1lbnRzXG5cdFx0aWYgKGxlYWQgPT09IHVuZGVmaW5lZCkgbGVhZCA9IG51bGxcblx0XHRpZiAob3BEZWNsYXJlUmVzID09PSB1bmRlZmluZWQpIG9wRGVjbGFyZVJlcyA9IG51bGxcblx0XHRpZiAoZm9sbG93ID09PSB1bmRlZmluZWQpIGZvbGxvdyA9IG51bGxcblx0XHRhc3NlcnQob3BEZWNsYXJlUmVzID09PSBudWxsKVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHRMaW5lcyh0aGlzLmxpbmVzKSwgZm9sbG93KSlcblx0fSxcblxuXHRCbG9ja1ZhbFRocm93KGxlYWQsIG9wRGVjbGFyZVJlcywgZm9sbG93KSB7XG5cdFx0Ly8gVE9ETzpFUzYgT3B0aW9uYWwgYXJndW1lbnRzXG5cdFx0aWYgKGxlYWQgPT09IHVuZGVmaW5lZCkgbGVhZCA9IG51bGxcblx0XHRpZiAob3BEZWNsYXJlUmVzID09PSB1bmRlZmluZWQpIG9wRGVjbGFyZVJlcyA9IG51bGxcblx0XHRpZiAoZm9sbG93ID09PSB1bmRlZmluZWQpIGZvbGxvdyA9IG51bGxcblx0XHRpZiAob3BEZWNsYXJlUmVzICE9PSBudWxsIHx8IGZvbGxvdyAhPT0gbnVsbClcblx0XHRcdHdhcm4odGhpcy5sb2MsICdSZXR1cm4gdHlwZSBpZ25vcmVkIGJlY2F1c2UgdGhlIGJsb2NrIGFsd2F5cyB0aHJvd3MuJylcblx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChsZWFkLCB0TGluZXModGhpcy5saW5lcyksIHQwKHRoaXMudGhyb3cpKSlcblx0fSxcblxuXHRCbG9ja1ZhbFJldHVybihsZWFkLCBvcERlY2xhcmVSZXMsIGZvbGxvdykge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayh0MCh0aGlzLnJldHVybmVkKSwgdExpbmVzKHRoaXMubGluZXMpLCBsZWFkLCBvcERlY2xhcmVSZXMsIGZvbGxvdylcblx0fSxcblxuXHRCbG9ja0JhZyhsZWFkLCBvcERlY2xhcmVSZXMsIGZvbGxvdykge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayhcblx0XHRcdElkQnVpbHQsXG5cdFx0XHRjYXQoRGVjbGFyZUJ1aWx0QmFnLCB0TGluZXModGhpcy5saW5lcykpLFxuXHRcdFx0bGVhZCwgb3BEZWNsYXJlUmVzLCBmb2xsb3cpXG5cdH0sXG5cblx0QmxvY2tPYmoobGVhZCwgb3BEZWNsYXJlUmVzLCBmb2xsb3cpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2soXG5cdFx0XHRJZEJ1aWx0LFxuXHRcdFx0Y2F0KERlY2xhcmVCdWlsdE9iaiwgdExpbmVzKHRoaXMubGluZXMpKSxcblx0XHRcdGxlYWQsIG9wRGVjbGFyZVJlcywgZm9sbG93KVxuXHR9LFxuXG5cdEJsb2NrTWFwKGxlYWQsIG9wRGVjbGFyZVJlcywgZm9sbG93KSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKFxuXHRcdFx0SWRCdWlsdCxcblx0XHRcdGNhdChEZWNsYXJlQnVpbHRNYXAsIHRMaW5lcyh0aGlzLmxpbmVzKSksXG5cdFx0XHRsZWFkLCBvcERlY2xhcmVSZXMsIGZvbGxvdylcblx0fSxcblxuXHRCbG9ja1dyYXAoKSB7IHJldHVybiBibG9ja1dyYXAodDAodGhpcy5ibG9jaykpIH0sXG5cblx0QnJlYWsoKSB7IHJldHVybiBuZXcgQnJlYWtTdGF0ZW1lbnQoKSB9LFxuXG5cdEJyZWFrV2l0aFZhbCgpIHsgcmV0dXJuIG5ldyBSZXR1cm5TdGF0ZW1lbnQodDAodGhpcy52YWx1ZSkpIH0sXG5cblx0Q2FsbCgpIHtcblx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKHQwKHRoaXMuY2FsbGVkKSwgdGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0Q2FzZURvKCkge1xuXHRcdGNvbnN0IGJvZHkgPSBjYXNlQm9keSh0aGlzLnBhcnRzLCB0aGlzLm9wRWxzZSlcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BDYXNlZCwgXyA9PiBuZXcgQmxvY2tTdGF0ZW1lbnQoW3QwKF8pLCBib2R5XSksICgpID0+IGJvZHkpXG5cdH0sXG5cdENhc2VWYWwoKSB7XG5cdFx0Y29uc3QgYm9keSA9IGNhc2VCb2R5KHRoaXMucGFydHMsIHRoaXMub3BFbHNlKVxuXHRcdGNvbnN0IGJsb2NrID0gaWZFbHNlKHRoaXMub3BDYXNlZCwgXyA9PiBbdDAoXyksIGJvZHldLCAoKSA9PiBbYm9keV0pXG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoYmxvY2spKVxuXHR9LFxuXHRDYXNlRG9QYXJ0OiBjYXNlUGFydCxcblx0Q2FzZVZhbFBhcnQ6IGNhc2VQYXJ0LFxuXG5cdENsYXNzKCkge1xuXHRcdGNvbnN0IG1ldGhvZHMgPSBjYXQoXG5cdFx0XHR0aGlzLnN0YXRpY3MubWFwKF8gPT4gdDEoXywgdHJ1ZSkpLFxuXHRcdFx0b3BNYXAodGhpcy5vcENvbnN0cnVjdG9yLCB0MCksXG5cdFx0XHR0aGlzLm1ldGhvZHMubWFwKF8gPT4gdDEoXywgZmFsc2UpKSlcblx0XHRjb25zdCBvcE5hbWUgPSBvcE1hcCh2ZXJpZnlSZXN1bHRzLm9wTmFtZSh0aGlzKSwgaWRlbnRpZmllcilcblx0XHRjb25zdCBjbGFzc0V4cHIgPSBuZXcgQ2xhc3NFeHByZXNzaW9uKFxuXHRcdFx0b3BOYW1lLFxuXHRcdFx0b3BNYXAodGhpcy5vcFN1cGVyQ2xhc3MsIHQwKSwgbmV3IENsYXNzQm9keShtZXRob2RzKSlcblxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcERvLCBfID0+IHQxKF8sIGNsYXNzRXhwciksICgpID0+IGNsYXNzRXhwcilcblx0fSxcblxuXHRDbGFzc0RvKGNsYXNzRXhwcikge1xuXHRcdGNvbnN0IGxlYWQgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBbXG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKHQwKHRoaXMuZGVjbGFyZUZvY3VzKSwgY2xhc3NFeHByKV0pXG5cdFx0Y29uc3QgcmV0ID0gbmV3IFJldHVyblN0YXRlbWVudCh0MCh0aGlzLmRlY2xhcmVGb2N1cykpXG5cdFx0Y29uc3QgYmxvY2sgPSB0Myh0aGlzLmJsb2NrLCBsZWFkLCBudWxsLCByZXQpXG5cdFx0cmV0dXJuIGJsb2NrV3JhcChibG9jaylcblx0fSxcblxuXHRDb25kKCkge1xuXHRcdHJldHVybiBuZXcgQ29uZGl0aW9uYWxFeHByZXNzaW9uKHQwKHRoaXMudGVzdCksIHQwKHRoaXMuaWZUcnVlKSwgdDAodGhpcy5pZkZhbHNlKSlcblx0fSxcblxuXHRDb25kaXRpb25hbERvKCkge1xuXHRcdGNvbnN0IHRlc3QgPSB0MCh0aGlzLnRlc3QpXG5cdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudChcblx0XHRcdHRoaXMuaXNVbmxlc3MgPyBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgdGVzdCkgOiB0ZXN0LFxuXHRcdFx0dDAodGhpcy5yZXN1bHQpKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsVmFsKCkge1xuXHRcdGNvbnN0IHRlc3QgPSB0MCh0aGlzLnRlc3QpXG5cdFx0Y29uc3QgcmVzdWx0ID0gbXNTb21lKGJsb2NrV3JhcCh0MCh0aGlzLnJlc3VsdCkpKVxuXHRcdHJldHVybiB0aGlzLmlzVW5sZXNzID9cblx0XHRcdG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odGVzdCwgTXNOb25lLCByZXN1bHQpIDpcblx0XHRcdG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odGVzdCwgcmVzdWx0LCBNc05vbmUpXG5cdH0sXG5cblx0Q29uc3RydWN0b3IoKSB7XG5cdFx0aXNJbkNvbnN0cnVjdG9yID0gdHJ1ZVxuXG5cdFx0Ly8gSWYgdGhlcmUgaXMgYSBgc3VwZXIhYCwgYHRoaXNgIHdpbGwgbm90IGJlIGRlZmluZWQgdW50aWwgdGhlbiwgc28gbXVzdCB3YWl0IHVudGlsIHRoZW4uXG5cdFx0Ly8gT3RoZXJ3aXNlLCBkbyBpdCBhdCB0aGUgYmVnaW5uaW5nLlxuXHRcdGNvbnN0IGJvZHkgPSB2ZXJpZnlSZXN1bHRzLmNvbnN0cnVjdG9yVG9TdXBlci5oYXModGhpcykgP1xuXHRcdFx0dDAodGhpcy5mdW4pIDpcblx0XHRcdHQxKHRoaXMuZnVuLCBjb25zdHJ1Y3RvclNldE1lbWJlcnModGhpcykpXG5cblx0XHRjb25zdCByZXMgPSBNZXRob2REZWZpbml0aW9uLmNvbnN0cnVjdG9yKGJvZHkpXG5cdFx0aXNJbkNvbnN0cnVjdG9yID0gZmFsc2Vcblx0XHRyZXR1cm4gcmVzXG5cdH0sXG5cblx0Q2F0Y2goKSB7XG5cdFx0cmV0dXJuIG5ldyBDYXRjaENsYXVzZSh0MCh0aGlzLmNhdWdodCksIHQwKHRoaXMuYmxvY2spKVxuXHR9LFxuXG5cdEV4Y2VwdERvKCkgeyByZXR1cm4gdHJhbnNwaWxlRXhjZXB0KHRoaXMpIH0sXG5cdEV4Y2VwdFZhbCgpIHsgcmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW3RyYW5zcGlsZUV4Y2VwdCh0aGlzKV0pKSB9LFxuXG5cdEZvckRvKCkgeyByZXR1cm4gZm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spIH0sXG5cblx0Rm9yQmFnKCkge1xuXHRcdHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFtcblx0XHRcdERlY2xhcmVCdWlsdEJhZyxcblx0XHRcdGZvckxvb3AodGhpcy5vcEl0ZXJhdGVlLCB0aGlzLmJsb2NrKSxcblx0XHRcdFJldHVybkJ1aWx0XG5cdFx0XSkpXG5cdH0sXG5cblx0Rm9yVmFsKCkge1xuXHRcdHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFtmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jayldKSlcblx0fSxcblxuXHRGdW4obGVhZFN0YXRlbWVudHMpIHtcblx0XHQvLyBUT0RPOkVTNiBPcHRpb25hbCBhcmdzXG5cdFx0aWYgKGxlYWRTdGF0ZW1lbnRzID09PSB1bmRlZmluZWQpXG5cdFx0XHRsZWFkU3RhdGVtZW50cyA9IG51bGxcblxuXHRcdGNvbnN0IG9sZEluR2VuZXJhdG9yID0gaXNJbkdlbmVyYXRvclxuXHRcdGlzSW5HZW5lcmF0b3IgPSB0aGlzLmlzR2VuZXJhdG9yXG5cblx0XHQvLyBUT0RPOkVTNiB1c2UgYC4uLmBmXG5cdFx0Y29uc3QgbkFyZ3MgPSBuZXcgTGl0ZXJhbCh0aGlzLmFyZ3MubGVuZ3RoKVxuXHRcdGNvbnN0IG9wRGVjbGFyZVJlc3QgPSBvcE1hcCh0aGlzLm9wUmVzdEFyZywgcmVzdCA9PlxuXHRcdFx0ZGVjbGFyZShyZXN0LCBuZXcgQ2FsbEV4cHJlc3Npb24oQXJyYXlTbGljZUNhbGwsIFtJZEFyZ3VtZW50cywgbkFyZ3NdKSkpXG5cdFx0Y29uc3QgYXJnQ2hlY2tzID0gb3BJZihvcHRpb25zLmluY2x1ZGVDaGVja3MoKSwgKCkgPT5cblx0XHRcdGZsYXRPcE1hcCh0aGlzLmFyZ3MsIG9wVHlwZUNoZWNrRm9yTG9jYWxEZWNsYXJlKSlcblxuXHRcdGNvbnN0IG9wRGVjbGFyZVRoaXMgPVxuXHRcdFx0b3BJZighaXNJbkNvbnN0cnVjdG9yICYmIHRoaXMub3BEZWNsYXJlVGhpcyAhPSBudWxsLCAoKSA9PiBEZWNsYXJlTGV4aWNhbFRoaXMpXG5cblx0XHRjb25zdCBsZWFkID0gY2F0KGxlYWRTdGF0ZW1lbnRzLCBvcERlY2xhcmVUaGlzLCBvcERlY2xhcmVSZXN0LCBhcmdDaGVja3MpXG5cblx0XHRjb25zdCBib2R5ID0gdDIodGhpcy5ibG9jaywgbGVhZCwgdGhpcy5vcERlY2xhcmVSZXMpXG5cdFx0Y29uc3QgYXJncyA9IHRoaXMuYXJncy5tYXAodDApXG5cdFx0aXNJbkdlbmVyYXRvciA9IG9sZEluR2VuZXJhdG9yXG5cdFx0Y29uc3QgaWQgPSBvcE1hcCh2ZXJpZnlSZXN1bHRzLm9wTmFtZSh0aGlzKSwgaWRlbnRpZmllcilcblxuXHRcdGNvbnN0IGNhblVzZUFycm93RnVuY3Rpb24gPVxuXHRcdFx0aWQgPT09IG51bGwgJiZcblx0XHRcdHRoaXMub3BEZWNsYXJlVGhpcyA9PT0gbnVsbCAmJlxuXHRcdFx0b3BEZWNsYXJlUmVzdCA9PT0gbnVsbCAmJlxuXHRcdFx0IXRoaXMuaXNHZW5lcmF0b3Jcblx0XHRyZXR1cm4gY2FuVXNlQXJyb3dGdW5jdGlvbiA/XG5cdFx0XHRuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oYXJncywgYm9keSkgOlxuXHRcdFx0bmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihpZCwgYXJncywgYm9keSwgdGhpcy5pc0dlbmVyYXRvcilcblx0fSxcblxuXHRJZ25vcmUoKSB7IHJldHVybiBbXSB9LFxuXG5cdExhenkoKSB7IHJldHVybiBsYXp5V3JhcCh0MCh0aGlzLnZhbHVlKSkgfSxcblxuXHRNZXRob2RJbXBsKGlzU3RhdGljKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSB0MCh0aGlzLmZ1bilcblx0XHRhc3NlcnQodmFsdWUuaWQgPT0gbnVsbClcblx0XHQvLyBTaW5jZSB0aGUgRnVuIHNob3VsZCBoYXZlIG9wRGVjbGFyZVRoaXMsIGl0IHdpbGwgbmV2ZXIgYmUgYW4gQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24uXG5cdFx0YXNzZXJ0KHZhbHVlIGluc3RhbmNlb2YgRnVuY3Rpb25FeHByZXNzaW9uKVxuXG5cdFx0Y29uc3Qge2tleSwgY29tcHV0ZWR9ID0gbWV0aG9kS2V5Q29tcHV0ZWQodGhpcy5zeW1ib2wpXG5cdFx0cmV0dXJuIG5ldyBNZXRob2REZWZpbml0aW9uKGtleSwgdmFsdWUsICdtZXRob2QnLCBpc1N0YXRpYywgY29tcHV0ZWQpXG5cdH0sXG5cdE1ldGhvZEdldHRlcihpc1N0YXRpYykge1xuXHRcdGNvbnN0IHZhbHVlID0gbmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihudWxsLCBbXSwgdDEodGhpcy5ibG9jaywgRGVjbGFyZUxleGljYWxUaGlzKSlcblx0XHRjb25zdCB7a2V5LCBjb21wdXRlZH0gPSBtZXRob2RLZXlDb21wdXRlZCh0aGlzLnN5bWJvbClcblx0XHRyZXR1cm4gbmV3IE1ldGhvZERlZmluaXRpb24oa2V5LCB2YWx1ZSwgJ2dldCcsIGlzU3RhdGljLCBjb21wdXRlZClcblx0fSxcblx0TWV0aG9kU2V0dGVyKGlzU3RhdGljKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFtJZEZvY3VzXSwgdDEodGhpcy5ibG9jaywgRGVjbGFyZUxleGljYWxUaGlzKSlcblx0XHRjb25zdCB7a2V5LCBjb21wdXRlZH0gPSBtZXRob2RLZXlDb21wdXRlZCh0aGlzLnN5bWJvbClcblx0XHRyZXR1cm4gbmV3IE1ldGhvZERlZmluaXRpb24oa2V5LCB2YWx1ZSwgJ3NldCcsIGlzU3RhdGljLCBjb21wdXRlZClcblx0fSxcblxuXHROdW1iZXJMaXRlcmFsKCkge1xuXHRcdC8vIE5lZ2F0aXZlIG51bWJlcnMgYXJlIG5vdCBwYXJ0IG9mIEVTIHNwZWMuXG5cdFx0Ly8gaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzUuMS8jc2VjLTcuOC4zXG5cdFx0Y29uc3QgdmFsdWUgPSBOdW1iZXIodGhpcy52YWx1ZSlcblx0XHRjb25zdCBsaXQgPSBuZXcgTGl0ZXJhbChNYXRoLmFicyh2YWx1ZSkpXG5cdFx0Y29uc3QgaXNQb3NpdGl2ZSA9IHZhbHVlID49IDAgJiYgMSAvIHZhbHVlICE9PSAtSW5maW5pdHlcblx0XHRyZXR1cm4gaXNQb3NpdGl2ZSA/IGxpdCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJy0nLCBsaXQpXG5cdH0sXG5cblx0TG9jYWxBY2Nlc3MoKSB7XG5cdFx0aWYgKHRoaXMubmFtZSA9PT0gJ3RoaXMnKVxuXHRcdFx0cmV0dXJuIGlzSW5Db25zdHJ1Y3RvciA/IG5ldyBUaGlzRXhwcmVzc2lvbigpIDogSWRMZXhpY2FsVGhpc1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgbGQgPSB2ZXJpZnlSZXN1bHRzLmxvY2FsRGVjbGFyZUZvckFjY2Vzcyh0aGlzKVxuXHRcdFx0Ly8gSWYgbGQgbWlzc2luZywgdGhpcyBpcyBhIGJ1aWx0aW4sIGFuZCBidWlsdGlucyBhcmUgbmV2ZXIgbGF6eVxuXHRcdFx0cmV0dXJuIGxkID09PSB1bmRlZmluZWQgPyBpZGVudGlmaWVyKHRoaXMubmFtZSkgOiBhY2Nlc3NMb2NhbERlY2xhcmUobGQpXG5cdFx0fVxuXHR9LFxuXG5cdExvY2FsRGVjbGFyZSgpIHsgcmV0dXJuIG5ldyBJZGVudGlmaWVyKGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzKS5uYW1lKSB9LFxuXG5cdExvY2FsTXV0YXRlKCkge1xuXHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBpZGVudGlmaWVyKHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdExvZ2ljKCkge1xuXHRcdGNvbnN0IG9wID0gdGhpcy5raW5kID09PSBMb2dpY3MuQW5kID8gJyYmJyA6ICd8fCdcblx0XHRyZXR1cm4gdGFpbCh0aGlzLmFyZ3MpLnJlZHVjZSgoYSwgYikgPT5cblx0XHRcdG5ldyBMb2dpY2FsRXhwcmVzc2lvbihvcCwgYSwgdDAoYikpLCB0MCh0aGlzLmFyZ3NbMF0pKVxuXHR9LFxuXG5cdE1hcEVudHJ5KCkgeyByZXR1cm4gbXNBc3NvYyhJZEJ1aWx0LCB0MCh0aGlzLmtleSksIHQwKHRoaXMudmFsKSkgfSxcblxuXHRNZW1iZXIoKSB7XG5cdFx0cmV0dXJuIG1lbWJlclN0cmluZ09yVmFsKHQwKHRoaXMub2JqZWN0KSwgdGhpcy5uYW1lKVxuXHR9LFxuXG5cdE1lbWJlclNldCgpIHtcblx0XHRjb25zdCBvYmogPSB0MCh0aGlzLm9iamVjdClcblx0XHRjb25zdCBuYW1lID0gKCkgPT5cblx0XHRcdHR5cGVvZiB0aGlzLm5hbWUgPT09ICdzdHJpbmcnID8gbmV3IExpdGVyYWwodGhpcy5uYW1lKSA6IHQwKHRoaXMubmFtZSlcblx0XHRjb25zdCB2YWwgPSBtYXliZVdyYXBJbkNoZWNrQ29udGFpbnModDAodGhpcy52YWx1ZSksIHRoaXMub3BUeXBlLCB0aGlzLm5hbWUpXG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU2V0dGVycy5Jbml0OlxuXHRcdFx0XHRyZXR1cm4gbXNOZXdQcm9wZXJ0eShvYmosIG5hbWUoKSwgdmFsKVxuXHRcdFx0Y2FzZSBTZXR0ZXJzLkluaXRNdXRhYmxlOlxuXHRcdFx0XHRyZXR1cm4gbXNOZXdNdXRhYmxlUHJvcGVydHkob2JqLCBuYW1lKCksIHZhbClcblx0XHRcdGNhc2UgU2V0dGVycy5NdXRhdGU6XG5cdFx0XHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXJTdHJpbmdPclZhbChvYmosIHRoaXMubmFtZSksIHZhbClcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcigpXG5cdFx0fVxuXHR9LFxuXG5cdE1vZHVsZSgpIHtcblx0XHRjb25zdCBib2R5ID0gdExpbmVzKHRoaXMubGluZXMpXG5cblx0XHR2ZXJpZnlSZXN1bHRzLmJ1aWx0aW5QYXRoVG9OYW1lcy5mb3JFYWNoKChpbXBvcnRlZCwgcGF0aCkgPT4ge1xuXHRcdFx0aWYgKHBhdGggIT09ICdnbG9iYWwnKSB7XG5cdFx0XHRcdGNvbnN0IGltcG9ydGVkRGVjbGFyZXMgPSBbXVxuXHRcdFx0XHRsZXQgb3BJbXBvcnREZWZhdWx0ID0gbnVsbFxuXHRcdFx0XHRsZXQgZGVmYXVsdE5hbWUgPSBsYXN0KHBhdGguc3BsaXQoJy8nKSlcblx0XHRcdFx0Zm9yIChjb25zdCBuYW1lIG9mIGltcG9ydGVkKSB7XG5cdFx0XHRcdFx0Y29uc3QgZGVjbGFyZSA9IExvY2FsRGVjbGFyZS5wbGFpbih0aGlzLmxvYywgbmFtZSlcblx0XHRcdFx0XHRpZiAobmFtZSA9PT0gZGVmYXVsdE5hbWUpXG5cdFx0XHRcdFx0XHRvcEltcG9ydERlZmF1bHQgPSBkZWNsYXJlXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aW1wb3J0ZWREZWNsYXJlcy5wdXNoKGRlY2xhcmUpXG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5pbXBvcnRzLnB1c2gobmV3IEltcG9ydCh0aGlzLmxvYywgcGF0aCwgaW1wb3J0ZWREZWNsYXJlcywgb3BJbXBvcnREZWZhdWx0KSlcblx0XHRcdH1cblx0XHR9KVxuXG5cdFx0Y29uc3QgYW1kID0gYW1kV3JhcE1vZHVsZSh0aGlzLmRvSW1wb3J0cywgdGhpcy5pbXBvcnRzLCBib2R5KVxuXG5cdFx0cmV0dXJuIG5ldyBQcm9ncmFtKGNhdChcblx0XHRcdG9wSWYob3B0aW9ucy5pbmNsdWRlVXNlU3RyaWN0KCksICgpID0+IFVzZVN0cmljdCksXG5cdFx0XHRvcElmKG9wdGlvbnMuaW5jbHVkZUFtZGVmaW5lKCksICgpID0+IEFtZGVmaW5lSGVhZGVyKSxcblx0XHRcdHRvU3RhdGVtZW50KGFtZCkpKVxuXHR9LFxuXG5cdE1vZHVsZUV4cG9ydE5hbWVkKCkge1xuXHRcdHJldHVybiB0MSh0aGlzLmFzc2lnbiwgdmFsID0+XG5cdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRFeHBvcnRzLCB0aGlzLmFzc2lnbi5hc3NpZ25lZS5uYW1lKSwgdmFsKSlcblx0fSxcblxuXHRNb2R1bGVFeHBvcnREZWZhdWx0KCkge1xuXHRcdHJldHVybiB0MSh0aGlzLmFzc2lnbiwgdmFsID0+IG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIEV4cG9ydHNEZWZhdWx0LCB2YWwpKVxuXHR9LFxuXG5cdE5ldygpIHtcblx0XHRjb25zdCBhbnlTcGxhdCA9IHRoaXMuYXJncy5zb21lKF8gPT4gXyBpbnN0YW5jZW9mIFNwbGF0KVxuXHRcdGNoZWNrKCFhbnlTcGxhdCwgdGhpcy5sb2MsICdUT0RPOiBTcGxhdCBwYXJhbXMgZm9yIG5ldycpXG5cdFx0cmV0dXJuIG5ldyBOZXdFeHByZXNzaW9uKHQwKHRoaXMudHlwZSksIHRoaXMuYXJncy5tYXAodDApKVxuXHR9LFxuXG5cdE5vdCgpIHsgcmV0dXJuIG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCB0MCh0aGlzLmFyZykpIH0sXG5cblx0T2JqRW50cnlBc3NpZ24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuYXNzaWduIGluc3RhbmNlb2YgQXNzaWduU2luZ2xlICYmICF0aGlzLmFzc2lnbi5hc3NpZ25lZS5pc0xhenkoKSA/XG5cdFx0XHR0MSh0aGlzLmFzc2lnbiwgdmFsID0+XG5cdFx0XHRcdG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlcihJZEJ1aWx0LCB0aGlzLmFzc2lnbi5hc3NpZ25lZS5uYW1lKSwgdmFsKSkgOlxuXHRcdFx0Y2F0KFxuXHRcdFx0XHR0MCh0aGlzLmFzc2lnbiksXG5cdFx0XHRcdHRoaXMuYXNzaWduLmFsbEFzc2lnbmVlcygpLm1hcChfID0+XG5cdFx0XHRcdFx0bXNTZXRMYXp5KElkQnVpbHQsIG5ldyBMaXRlcmFsKF8ubmFtZSksIGlkRm9yRGVjbGFyZUNhY2hlZChfKSkpKVxuXHR9LFxuXG5cdE9iakVudHJ5Q29tcHV0ZWQoKSB7XG5cdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsXG5cdFx0XHRuZXcgTWVtYmVyRXhwcmVzc2lvbihJZEJ1aWx0LCB0MCh0aGlzLmtleSkpLFxuXHRcdFx0dDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0T2JqRW50cnlQbGFpbigpIHtcblx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyKElkQnVpbHQsIHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdE9ialNpbXBsZSgpIHtcblx0XHRyZXR1cm4gbmV3IE9iamVjdEV4cHJlc3Npb24odGhpcy5wYWlycy5tYXAocGFpciA9PlxuXHRcdFx0bmV3IFByb3BlcnR5KCdpbml0JywgcHJvcGVydHlJZE9yTGl0ZXJhbChwYWlyLmtleSksIHQwKHBhaXIudmFsdWUpKSkpXG5cdH0sXG5cblx0UXVvdGUoKSB7XG5cdFx0aWYgKHRoaXMucGFydHMubGVuZ3RoID09PSAwKVxuXHRcdFx0cmV0dXJuIExpdEVtcHR5U3RyaW5nXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBxdWFzaXMgPSBbXSwgZXhwcmVzc2lvbnMgPSBbXVxuXG5cdFx0XHQvLyBUZW1wbGF0ZUxpdGVyYWwgbXVzdCBzdGFydCB3aXRoIGEgVGVtcGxhdGVFbGVtZW50XG5cdFx0XHRpZiAodHlwZW9mIHRoaXMucGFydHNbMF0gIT09ICdzdHJpbmcnKVxuXHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZW1wdHkpXG5cblx0XHRcdGZvciAobGV0IHBhcnQgb2YgdGhpcy5wYXJ0cylcblx0XHRcdFx0aWYgKHR5cGVvZiBwYXJ0ID09PSAnc3RyaW5nJylcblx0XHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZm9yUmF3U3RyaW5nKHBhcnQpKVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHQvLyBcInsxfXsxfVwiIG5lZWRzIGFuIGVtcHR5IHF1YXNpIGluIHRoZSBtaWRkbGUgKGFuZCBvbiB0aGUgZW5kcylcblx0XHRcdFx0XHRpZiAocXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoKVxuXHRcdFx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmVtcHR5KVxuXHRcdFx0XHRcdGV4cHJlc3Npb25zLnB1c2godDAocGFydCkpXG5cdFx0XHRcdH1cblxuXHRcdFx0Ly8gVGVtcGxhdGVMaXRlcmFsIG11c3QgZW5kIHdpdGggYSBUZW1wbGF0ZUVsZW1lbnQsIHNvIG9uZSBtb3JlIHF1YXNpIHRoYW4gZXhwcmVzc2lvbi5cblx0XHRcdGlmIChxdWFzaXMubGVuZ3RoID09PSBleHByZXNzaW9ucy5sZW5ndGgpXG5cdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5lbXB0eSlcblxuXHRcdFx0cmV0dXJuIG5ldyBUZW1wbGF0ZUxpdGVyYWwocXVhc2lzLCBleHByZXNzaW9ucylcblx0XHR9XG5cdH0sXG5cblx0UXVvdGVUZW1wbGF0ZSgpIHtcblx0XHRyZXR1cm4gbmV3IFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbih0MCh0aGlzLnRhZyksIHQwKHRoaXMucXVvdGUpKVxuXHR9LFxuXG5cdFNldFN1YigpIHtcblx0XHRjb25zdCBnZXRLaW5kID0gKCkgPT4ge1xuXHRcdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBTZXR0ZXJzLkluaXQ6XG5cdFx0XHRcdFx0cmV0dXJuICdpbml0J1xuXHRcdFx0XHRjYXNlIFNldHRlcnMuSW5pdE11dGFibGU6XG5cdFx0XHRcdFx0cmV0dXJuICdpbml0LW11dGFibGUnXG5cdFx0XHRcdGNhc2UgU2V0dGVycy5NdXRhdGU6XG5cdFx0XHRcdFx0cmV0dXJuICdtdXRhdGUnXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdH1cblx0XHR9XG5cdFx0Y29uc3Qga2luZCA9IGdldEtpbmQoKVxuXHRcdHJldHVybiBtc1NldFN1Yihcblx0XHRcdHQwKHRoaXMub2JqZWN0KSxcblx0XHRcdHRoaXMuc3ViYmVkcy5sZW5ndGggPT09IDEgPyB0MCh0aGlzLnN1YmJlZHNbMF0pIDogdGhpcy5zdWJiZWRzLm1hcCh0MCksXG5cdFx0XHRtYXliZVdyYXBJbkNoZWNrQ29udGFpbnModDAodGhpcy52YWx1ZSksIHRoaXMub3BUeXBlLCAndmFsdWUnKSxcblx0XHRcdG5ldyBMaXRlcmFsKGtpbmQpKVxuXHR9LFxuXG5cdFNwZWNpYWxEbygpIHtcblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTcGVjaWFsRG9zLkRlYnVnZ2VyOiByZXR1cm4gbmV3IERlYnVnZ2VyU3RhdGVtZW50KClcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcih0aGlzLmtpbmQpXG5cdFx0fVxuXHR9LFxuXG5cdFNwZWNpYWxWYWwoKSB7XG5cdFx0Ly8gTWFrZSBuZXcgb2JqZWN0cyBiZWNhdXNlIHdlIHdpbGwgYXNzaWduIGBsb2NgIHRvIHRoZW0uXG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuQ29udGFpbnM6XG5cdFx0XHRcdHJldHVybiBtZW1iZXIoSWRNcywgJ2NvbnRhaW5zJylcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuRmFsc2U6XG5cdFx0XHRcdHJldHVybiBuZXcgTGl0ZXJhbChmYWxzZSlcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuTmFtZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKHZlcmlmeVJlc3VsdHMubmFtZSh0aGlzKSlcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuTnVsbDpcblx0XHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKG51bGwpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLlNldFN1Yjpcblx0XHRcdFx0cmV0dXJuIG1lbWJlcihJZE1zLCAnc2V0U3ViJylcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuU3ViOlxuXHRcdFx0XHRyZXR1cm4gbWVtYmVyKElkTXMsICdzdWInKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5UcnVlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IExpdGVyYWwodHJ1ZSlcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuVW5kZWZpbmVkOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFVuYXJ5RXhwcmVzc2lvbigndm9pZCcsIExpdFplcm8pXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IodGhpcy5raW5kKVxuXHRcdH1cblx0fSxcblxuXHRTcGxhdCgpIHtcblx0XHRyZXR1cm4gbmV3IFNwcmVhZEVsZW1lbnQodDAodGhpcy5zcGxhdHRlZCkpXG5cdH0sXG5cblx0U3VwZXJDYWxsOiBzdXBlckNhbGwsXG5cdFN1cGVyQ2FsbERvOiBzdXBlckNhbGwsXG5cdFN1cGVyTWVtYmVyKCkge1xuXHRcdHJldHVybiBtZW1iZXJTdHJpbmdPclZhbChJZFN1cGVyLCB0aGlzLm5hbWUpXG5cdH0sXG5cblx0U3dpdGNoRG8oKSB7IHJldHVybiB0cmFuc3BpbGVTd2l0Y2godGhpcykgfSxcblx0U3dpdGNoVmFsKCkgeyByZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChbdHJhbnNwaWxlU3dpdGNoKHRoaXMpXSkpIH0sXG5cdFN3aXRjaERvUGFydDogc3dpdGNoUGFydCxcblx0U3dpdGNoVmFsUGFydDogc3dpdGNoUGFydCxcblxuXHRUaHJvdygpIHtcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BUaHJvd24sXG5cdFx0XHRfID0+IGRvVGhyb3coXyksXG5cdFx0XHQoKSA9PiBuZXcgVGhyb3dTdGF0ZW1lbnQobmV3IE5ld0V4cHJlc3Npb24oR2xvYmFsRXJyb3IsIFtMaXRTdHJUaHJvd10pKSlcblx0fSxcblxuXHRXaXRoKCkge1xuXHRcdGNvbnN0IGlkRGVjbGFyZSA9IGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzLmRlY2xhcmUpXG5cdFx0Y29uc3QgYmxvY2sgPSB0Myh0aGlzLmJsb2NrLCBudWxsLCBudWxsLCBuZXcgUmV0dXJuU3RhdGVtZW50KGlkRGVjbGFyZSkpXG5cdFx0Y29uc3QgZnVuID0gaXNJbkdlbmVyYXRvciA/XG5cdFx0XHRuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFtpZERlY2xhcmVdLCBibG9jaywgdHJ1ZSkgOlxuXHRcdFx0bmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKFtpZERlY2xhcmVdLCBibG9jaylcblx0XHRjb25zdCBjYWxsID0gbmV3IENhbGxFeHByZXNzaW9uKGZ1biwgW3QwKHRoaXMudmFsdWUpXSlcblx0XHRyZXR1cm4gaXNJbkdlbmVyYXRvciA/IG5ldyBZaWVsZEV4cHJlc3Npb24oY2FsbCwgdHJ1ZSkgOiBjYWxsXG5cdH0sXG5cblx0WWllbGQoKSB7IHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKG9wTWFwKHRoaXMub3BZaWVsZGVkLCB0MCksIGZhbHNlKSB9LFxuXG5cdFlpZWxkVG8oKSB7IHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKHQwKHRoaXMueWllbGRlZFRvKSwgdHJ1ZSkgfVxufSlcblxuZnVuY3Rpb24gY2FzZVBhcnQoYWx0ZXJuYXRlKSB7XG5cdGlmICh0aGlzLnRlc3QgaW5zdGFuY2VvZiBQYXR0ZXJuKSB7XG5cdFx0Y29uc3Qge3R5cGUsIHBhdHRlcm5lZCwgbG9jYWxzfSA9IHRoaXMudGVzdFxuXHRcdGNvbnN0IGRlY2wgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBbXG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKElkRXh0cmFjdCwgbXNFeHRyYWN0KHQwKHR5cGUpLCB0MChwYXR0ZXJuZWQpKSldKVxuXHRcdGNvbnN0IHRlc3QgPSBuZXcgQmluYXJ5RXhwcmVzc2lvbignIT09JywgSWRFeHRyYWN0LCBMaXROdWxsKVxuXHRcdGNvbnN0IGV4dHJhY3QgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBsb2NhbHMubWFwKChfLCBpZHgpID0+XG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKFxuXHRcdFx0XHRpZEZvckRlY2xhcmVDYWNoZWQoXyksXG5cdFx0XHRcdG5ldyBNZW1iZXJFeHByZXNzaW9uKElkRXh0cmFjdCwgbmV3IExpdGVyYWwoaWR4KSkpKSlcblx0XHRjb25zdCByZXMgPSB0MSh0aGlzLnJlc3VsdCwgZXh0cmFjdClcblx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KFtkZWNsLCBuZXcgSWZTdGF0ZW1lbnQodGVzdCwgcmVzLCBhbHRlcm5hdGUpXSlcblx0fSBlbHNlXG5cdFx0Ly8gYWx0ZXJuYXRlIHdyaXR0ZW4gdG8gYnkgYGNhc2VCb2R5YC5cblx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KHQwKHRoaXMudGVzdCksIHQwKHRoaXMucmVzdWx0KSwgYWx0ZXJuYXRlKVxufVxuXG5mdW5jdGlvbiBzdXBlckNhbGwoKSB7XG5cdGNvbnN0IGFyZ3MgPSB0aGlzLmFyZ3MubWFwKHQwKVxuXHRjb25zdCBtZXRob2QgPSB2ZXJpZnlSZXN1bHRzLnN1cGVyQ2FsbFRvTWV0aG9kLmdldCh0aGlzKVxuXG5cdGlmIChtZXRob2QgaW5zdGFuY2VvZiBDb25zdHJ1Y3Rvcikge1xuXHRcdGNvbnN0IGNhbGwgPSBuZXcgQ2FsbEV4cHJlc3Npb24oSWRTdXBlciwgYXJncylcblx0XHRjb25zdCBtZW1iZXJTZXRzID0gY29uc3RydWN0b3JTZXRNZW1iZXJzKG1ldGhvZClcblx0XHRyZXR1cm4gY2F0KGNhbGwsIG1lbWJlclNldHMpXG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgbSA9IHR5cGVvZiBtZXRob2Quc3ltYm9sID09PSAnc3RyaW5nJyA/XG5cdFx0XHRtZW1iZXIoSWRTdXBlciwgbWV0aG9kLnN5bWJvbCkgOlxuXHRcdFx0bmV3IE1lbWJlckV4cHJlc3Npb24oSWRTdXBlciwgdDAobWV0aG9kLnN5bWJvbCkpXG5cdFx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbihtLCBhcmdzKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHN3aXRjaFBhcnQoKSB7XG5cdGNvbnN0IGZvbGxvdyA9IG9wSWYodGhpcyBpbnN0YW5jZW9mIFN3aXRjaERvUGFydCwgKCkgPT4gbmV3IEJyZWFrU3RhdGVtZW50KVxuXHQvKlxuXHRXZSBjb3VsZCBqdXN0IHBhc3MgYmxvY2suYm9keSBmb3IgdGhlIHN3aXRjaCBsaW5lcywgYnV0IGluc3RlYWRcblx0ZW5jbG9zZSB0aGUgYm9keSBvZiB0aGUgc3dpdGNoIGNhc2UgaW4gY3VybHkgYnJhY2VzIHRvIGVuc3VyZSBhIG5ldyBzY29wZS5cblx0VGhhdCB3YXkgdGhpcyBjb2RlIHdvcmtzOlxuXHRcdHN3aXRjaCAoMCkge1xuXHRcdFx0Y2FzZSAwOiB7XG5cdFx0XHRcdGNvbnN0IGEgPSAwXG5cdFx0XHRcdHJldHVybiBhXG5cdFx0XHR9XG5cdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdC8vIFdpdGhvdXQgY3VybHkgYnJhY2VzIHRoaXMgd291bGQgY29uZmxpY3Qgd2l0aCB0aGUgb3RoZXIgYGFgLlxuXHRcdFx0XHRjb25zdCBhID0gMVxuXHRcdFx0XHRhXG5cdFx0XHR9XG5cdFx0fVxuXHQqL1xuXHRjb25zdCBibG9jayA9IHQzKHRoaXMucmVzdWx0LCBudWxsLCBudWxsLCBmb2xsb3cpXG5cdC8vIElmIHN3aXRjaCBoYXMgbXVsdGlwbGUgdmFsdWVzLCBidWlsZCB1cCBhIHN0YXRlbWVudCBsaWtlOiBgY2FzZSAxOiBjYXNlIDI6IHsgZG9CbG9jaygpIH1gXG5cdGNvbnN0IHggPSBbXVxuXHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudmFsdWVzLmxlbmd0aCAtIDE7IGkgPSBpICsgMSlcblx0XHQvLyBUaGVzZSBjYXNlcyBmYWxsdGhyb3VnaCB0byB0aGUgb25lIGF0IHRoZSBlbmQuXG5cdFx0eC5wdXNoKG5ldyBTd2l0Y2hDYXNlKHQwKHRoaXMudmFsdWVzW2ldKSwgW10pKVxuXHR4LnB1c2gobmV3IFN3aXRjaENhc2UodDAodGhpcy52YWx1ZXNbdGhpcy52YWx1ZXMubGVuZ3RoIC0gMV0pLCBbYmxvY2tdKSlcblx0cmV0dXJuIHhcbn1cblxuLy8gRnVuY3Rpb25zIHNwZWNpZmljIHRvIGNlcnRhaW4gZXhwcmVzc2lvbnMuXG5jb25zdFxuXHQvLyBXcmFwcyBhIGJsb2NrICh3aXRoIGByZXR1cm5gIHN0YXRlbWVudHMgaW4gaXQpIGluIGFuIElJRkUuXG5cdGJsb2NrV3JhcCA9IGJsb2NrID0+IHtcblx0XHRjb25zdCBpbnZva2UgPSBuZXcgQ2FsbEV4cHJlc3Npb24oZnVuY3Rpb25FeHByZXNzaW9uVGh1bmsoYmxvY2ssIGlzSW5HZW5lcmF0b3IpLCBbXSlcblx0XHRyZXR1cm4gaXNJbkdlbmVyYXRvciA/IG5ldyBZaWVsZEV4cHJlc3Npb24oaW52b2tlLCB0cnVlKSA6IGludm9rZVxuXHR9LFxuXG5cdGNhc2VCb2R5ID0gKHBhcnRzLCBvcEVsc2UpID0+IHtcblx0XHRsZXQgYWNjID0gaWZFbHNlKG9wRWxzZSwgdDAsICgpID0+IFRocm93Tm9DYXNlTWF0Y2gpXG5cdFx0Zm9yIChsZXQgaSA9IHBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaSA9IGkgLSAxKVxuXHRcdFx0YWNjID0gdDEocGFydHNbaV0sIGFjYylcblx0XHRyZXR1cm4gYWNjXG5cdH0sXG5cblx0Y29uc3RydWN0b3JTZXRNZW1iZXJzID0gY29uc3RydWN0b3IgPT5cblx0XHRjb25zdHJ1Y3Rvci5tZW1iZXJBcmdzLm1hcChfID0+XG5cdFx0XHRtc05ld1Byb3BlcnR5KG5ldyBUaGlzRXhwcmVzc2lvbigpLCBuZXcgTGl0ZXJhbChfLm5hbWUpLCBpZEZvckRlY2xhcmVDYWNoZWQoXykpKSxcblxuXHRmb3JMb29wID0gKG9wSXRlcmF0ZWUsIGJsb2NrKSA9PlxuXHRcdGlmRWxzZShvcEl0ZXJhdGVlLFxuXHRcdFx0KHtlbGVtZW50LCBiYWd9KSA9PiB7XG5cdFx0XHRcdGNvbnN0IGRlY2xhcmUgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignbGV0Jyxcblx0XHRcdFx0XHRbbmV3IFZhcmlhYmxlRGVjbGFyYXRvcih0MChlbGVtZW50KSldKVxuXHRcdFx0XHRyZXR1cm4gbmV3IEZvck9mU3RhdGVtZW50KGRlY2xhcmUsIHQwKGJhZyksIHQwKGJsb2NrKSlcblx0XHRcdH0sXG5cdFx0XHQoKSA9PiBmb3JTdGF0ZW1lbnRJbmZpbml0ZSh0MChibG9jaykpKSxcblxuXHRkb1Rocm93ID0gdGhyb3duID0+XG5cdFx0bmV3IFRocm93U3RhdGVtZW50KHRocm93biBpbnN0YW5jZW9mIFF1b3RlID9cblx0XHRcdG5ldyBOZXdFeHByZXNzaW9uKEdsb2JhbEVycm9yLCBbdDAodGhyb3duKV0pIDpcblx0XHRcdHQwKHRocm93bikpLFxuXG5cdG1lbWJlclN0cmluZ09yVmFsID0gKG9iamVjdCwgbWVtYmVyTmFtZSkgPT5cblx0XHR0eXBlb2YgbWVtYmVyTmFtZSA9PT0gJ3N0cmluZycgP1xuXHRcdFx0bWVtYmVyKG9iamVjdCwgbWVtYmVyTmFtZSkgOlxuXHRcdFx0bmV3IE1lbWJlckV4cHJlc3Npb24ob2JqZWN0LCB0MChtZW1iZXJOYW1lKSksXG5cblx0bWV0aG9kS2V5Q29tcHV0ZWQgPSBzeW1ib2wgPT4ge1xuXHRcdGlmICh0eXBlb2Ygc3ltYm9sID09PSAnc3RyaW5nJylcblx0XHRcdHJldHVybiB7a2V5OiBwcm9wZXJ0eUlkT3JMaXRlcmFsKHN5bWJvbCksIGNvbXB1dGVkOiBmYWxzZX1cblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IGtleSA9IHN5bWJvbCBpbnN0YW5jZW9mIFF1b3RlID8gdDAoc3ltYm9sKSA6IG1zU3ltYm9sKHQwKHN5bWJvbCkpXG5cdFx0XHRyZXR1cm4ge2tleSwgY29tcHV0ZWQ6IHRydWV9XG5cdFx0fVxuXHR9LFxuXG5cdHRyYW5zcGlsZUJsb2NrID0gKHJldHVybmVkLCBsaW5lcywgbGVhZCwgb3BEZWNsYXJlUmVzLCBmb2xsb3cpID0+IHtcblx0XHQvLyBUT0RPOkVTNiBPcHRpb25hbCBhcmd1bWVudHNcblx0XHRpZiAobGVhZCA9PT0gdW5kZWZpbmVkKSBsZWFkID0gbnVsbFxuXHRcdGlmIChvcERlY2xhcmVSZXMgPT09IHVuZGVmaW5lZCkgb3BEZWNsYXJlUmVzID0gbnVsbFxuXHRcdGlmIChmb2xsb3cgPT09IHVuZGVmaW5lZCkgZm9sbG93ID0gbnVsbFxuXHRcdGNvbnN0IGZpbiA9IGlmRWxzZShvcERlY2xhcmVSZXMsXG5cdFx0XHRyZCA9PiB7XG5cdFx0XHRcdGNvbnN0IHJldCA9IG1heWJlV3JhcEluQ2hlY2tDb250YWlucyhyZXR1cm5lZCwgcmQub3BUeXBlLCByZC5uYW1lKVxuXHRcdFx0XHRyZXR1cm4gaWZFbHNlKGZvbGxvdyxcblx0XHRcdFx0XHRfID0+IGNhdChkZWNsYXJlKHJkLCByZXQpLCBfLCBSZXR1cm5SZXMpLFxuXHRcdFx0XHRcdCgpID0+IG5ldyBSZXR1cm5TdGF0ZW1lbnQocmV0KSlcblx0XHRcdH0sXG5cdFx0XHQoKSA9PiBjYXQoZm9sbG93LCBuZXcgUmV0dXJuU3RhdGVtZW50KHJldHVybmVkKSkpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgbGluZXMsIGZpbikpXG5cdH0sXG5cblx0dHJhbnNwaWxlRXhjZXB0ID0gZXhjZXB0ID0+XG5cdFx0bmV3IFRyeVN0YXRlbWVudChcblx0XHRcdHQwKGV4Y2VwdC50cnkpLFxuXHRcdFx0b3BNYXAoZXhjZXB0LmNhdGNoLCB0MCksXG5cdFx0XHRvcE1hcChleGNlcHQuZmluYWxseSwgdDApKSxcblxuXHR0cmFuc3BpbGVTd2l0Y2ggPSBfID0+IHtcblx0XHRjb25zdCBwYXJ0cyA9IGZsYXRNYXAoXy5wYXJ0cywgdDApXG5cdFx0cGFydHMucHVzaChpZkVsc2UoXy5vcEVsc2UsXG5cdFx0XHRfID0+IG5ldyBTd2l0Y2hDYXNlKHVuZGVmaW5lZCwgdDAoXykuYm9keSksXG5cdFx0XHQoKSA9PiBTd2l0Y2hDYXNlTm9NYXRjaCkpXG5cdFx0cmV0dXJuIG5ldyBTd2l0Y2hTdGF0ZW1lbnQodDAoXy5zd2l0Y2hlZCksIHBhcnRzKVxuXHR9XG5cbmNvbnN0IElkQm9vdCA9IG5ldyBJZGVudGlmaWVyKCdfYm9vdCcpXG5cbi8vIE1vZHVsZSBoZWxwZXJzXG5jb25zdFxuXHRhbWRXcmFwTW9kdWxlID0gKGRvSW1wb3J0cywgaW1wb3J0cywgYm9keSkgPT4ge1xuXHRcdGNvbnN0IHNob3VsZEltcG9ydEJvb3QgPSBvcHRpb25zLmltcG9ydEJvb3QoKVxuXG5cdFx0Y29uc3QgYWxsSW1wb3J0cyA9IGRvSW1wb3J0cy5jb25jYXQoaW1wb3J0cylcblx0XHRjb25zdCBhbGxJbXBvcnRQYXRocyA9IGFsbEltcG9ydHMubWFwKF8gPT4gbWFuZ2xlUGF0aChfLnBhdGgpKVxuXG5cdFx0Y29uc3QgYXJySW1wb3J0UGF0aHMgPSBuZXcgQXJyYXlFeHByZXNzaW9uKGNhdChcblx0XHRcdG9wSWYoc2hvdWxkSW1wb3J0Qm9vdCwgKCkgPT4gbmV3IExpdGVyYWwob3B0aW9ucy5ib290UGF0aCgpKSksXG5cdFx0XHRMaXRTdHJFeHBvcnRzLFxuXHRcdFx0YWxsSW1wb3J0UGF0aHMubWFwKF8gPT4gbmV3IExpdGVyYWwoXykpKSlcblxuXHRcdGNvbnN0IGltcG9ydFRvSWRlbnRpZmllciA9IG5ldyBNYXAoKVxuXHRcdGNvbnN0IGltcG9ydElkZW50aWZpZXJzID0gW11cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFsbEltcG9ydHMubGVuZ3RoOyBpID0gaSArIDEpIHtcblx0XHRcdGNvbnN0IF8gPSBhbGxJbXBvcnRzW2ldXG5cdFx0XHRjb25zdCBpZCA9IGlkZW50aWZpZXIoYCR7cGF0aEJhc2VOYW1lKF8ucGF0aCl9XyR7aX1gKVxuXHRcdFx0aW1wb3J0SWRlbnRpZmllcnMucHVzaChpZClcblx0XHRcdGltcG9ydFRvSWRlbnRpZmllci5zZXQoXywgaWQpXG5cdFx0fVxuXG5cdFx0Y29uc3QgaW1wb3J0QXJncyA9IGNhdChvcElmKHNob3VsZEltcG9ydEJvb3QsICgpID0+IElkQm9vdCksIElkRXhwb3J0cywgaW1wb3J0SWRlbnRpZmllcnMpXG5cblx0XHRjb25zdCBkb0Jvb3QgPSBvcElmKHNob3VsZEltcG9ydEJvb3QsICgpID0+IG5ldyBFeHByZXNzaW9uU3RhdGVtZW50KG1zR2V0TW9kdWxlKElkQm9vdCkpKVxuXG5cdFx0Y29uc3QgaW1wb3J0RG9zID0gZG9JbXBvcnRzLm1hcChfID0+XG5cdFx0XHRsb2MobmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQobXNHZXRNb2R1bGUoaW1wb3J0VG9JZGVudGlmaWVyLmdldChfKSkpLCBfLmxvYykpXG5cblx0XHQvLyBFeHRyYWN0cyBpbXBvcnRlZCB2YWx1ZXMgZnJvbSB0aGUgbW9kdWxlcy5cblx0XHRjb25zdCBvcERlY2xhcmVJbXBvcnRlZExvY2FscyA9IG9wSWYoIWlzRW1wdHkoaW1wb3J0cyksXG5cdFx0XHQoKSA9PiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLFxuXHRcdFx0XHRmbGF0TWFwKGltcG9ydHMsIF8gPT4gaW1wb3J0RGVjbGFyYXRvcnMoXywgaW1wb3J0VG9JZGVudGlmaWVyLmdldChfKSkpKSlcblxuXHRcdGNvbnN0IGZ1bGxCb2R5ID0gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChcblx0XHRcdGRvQm9vdCwgaW1wb3J0RG9zLCBvcERlY2xhcmVJbXBvcnRlZExvY2FscywgYm9keSwgUmV0dXJuRXhwb3J0cykpXG5cblx0XHRjb25zdCBsYXp5Qm9keSA9XG5cdFx0XHRvcHRpb25zLmxhenlNb2R1bGUoKSA/XG5cdFx0XHRcdG5ldyBCbG9ja1N0YXRlbWVudChbbmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQoXG5cdFx0XHRcdFx0bmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgRXhwb3J0c0dldCxcblx0XHRcdFx0XHRcdG1zTGF6eShmdW5jdGlvbkV4cHJlc3Npb25UaHVuayhmdWxsQm9keSkpKSldKSA6XG5cdFx0XHRcdGZ1bGxCb2R5XG5cblx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKElkRGVmaW5lLFxuXHRcdFx0W2FyckltcG9ydFBhdGhzLCBuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oaW1wb3J0QXJncywgbGF6eUJvZHkpXSlcblx0fSxcblxuXHRwYXRoQmFzZU5hbWUgPSBwYXRoID0+XG5cdFx0cGF0aC5zdWJzdHIocGF0aC5sYXN0SW5kZXhPZignLycpICsgMSksXG5cblx0aW1wb3J0RGVjbGFyYXRvcnMgPSAoe2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9LCBtb2R1bGVJZGVudGlmaWVyKSA9PiB7XG5cdFx0Ly8gVE9ETzogQ291bGQgYmUgbmVhdGVyIGFib3V0IHRoaXNcblx0XHRjb25zdCBpc0xhenkgPSAoaXNFbXB0eShpbXBvcnRlZCkgPyBvcEltcG9ydERlZmF1bHQgOiBpbXBvcnRlZFswXSkuaXNMYXp5KClcblx0XHRjb25zdCB2YWx1ZSA9IChpc0xhenkgPyBtc0xhenlHZXRNb2R1bGUgOiBtc0dldE1vZHVsZSkobW9kdWxlSWRlbnRpZmllcilcblxuXHRcdGNvbnN0IGltcG9ydGVkRGVmYXVsdCA9IG9wTWFwKG9wSW1wb3J0RGVmYXVsdCwgZGVmID0+IHtcblx0XHRcdGNvbnN0IGRlZmV4cCA9IG1zR2V0RGVmYXVsdEV4cG9ydChtb2R1bGVJZGVudGlmaWVyKVxuXHRcdFx0Y29uc3QgdmFsID0gaXNMYXp5ID8gbGF6eVdyYXAoZGVmZXhwKSA6IGRlZmV4cFxuXHRcdFx0cmV0dXJuIGxvYyhuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRm9yRGVjbGFyZUNhY2hlZChkZWYpLCB2YWwpLCBkZWYubG9jKVxuXHRcdH0pXG5cblx0XHRjb25zdCBpbXBvcnRlZERlc3RydWN0ID0gaXNFbXB0eShpbXBvcnRlZCkgPyBudWxsIDpcblx0XHRcdG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzKGltcG9ydGVkLCBpc0xhenksIHZhbHVlLCB0cnVlLCBmYWxzZSlcblxuXHRcdHJldHVybiBjYXQoaW1wb3J0ZWREZWZhdWx0LCBpbXBvcnRlZERlc3RydWN0KVxuXHR9XG5cbi8vIEdlbmVyYWwgdXRpbHMuIE5vdCBpbiB1dGlsLmpzIGJlY2F1c2UgdGhlc2UgY2xvc2Ugb3ZlciBjb250ZXh0LlxuY29uc3Rcblx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMgPSAoYXNzaWduZWVzLCBpc0xhenksIHZhbHVlLCBpc01vZHVsZSkgPT4ge1xuXHRcdGNvbnN0IGRlc3RydWN0dXJlZE5hbWUgPSBgXyQke25leHREZXN0cnVjdHVyZWRJZH1gXG5cdFx0bmV4dERlc3RydWN0dXJlZElkID0gbmV4dERlc3RydWN0dXJlZElkICsgMVxuXHRcdGNvbnN0IGlkRGVzdHJ1Y3R1cmVkID0gbmV3IElkZW50aWZpZXIoZGVzdHJ1Y3R1cmVkTmFtZSlcblx0XHRjb25zdCBkZWNsYXJhdG9ycyA9IGFzc2lnbmVlcy5tYXAoYXNzaWduZWUgPT4ge1xuXHRcdFx0Ly8gVE9ETzogRG9uJ3QgY29tcGlsZSBpdCBpZiBpdCdzIG5ldmVyIGFjY2Vzc2VkXG5cdFx0XHRjb25zdCBnZXQgPSBnZXRNZW1iZXIoaWREZXN0cnVjdHVyZWQsIGFzc2lnbmVlLm5hbWUsIGlzTGF6eSwgaXNNb2R1bGUpXG5cdFx0XHRyZXR1cm4gbWFrZURlY2xhcmF0b3IoYXNzaWduZWUsIGdldCwgaXNMYXp5KVxuXHRcdH0pXG5cdFx0Ly8gR2V0dGluZyBsYXp5IG1vZHVsZSBpcyBkb25lIGJ5IG1zLmxhenlHZXRNb2R1bGUuXG5cdFx0Y29uc3QgdmFsID0gaXNMYXp5ICYmICFpc01vZHVsZSA/IGxhenlXcmFwKHZhbHVlKSA6IHZhbHVlXG5cdFx0cmV0dXJuIGNhdChuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRGVzdHJ1Y3R1cmVkLCB2YWwpLCBkZWNsYXJhdG9ycylcblx0fSxcblxuXHRtYWtlRGVjbGFyYXRvciA9IChhc3NpZ25lZSwgdmFsdWUsIHZhbHVlSXNBbHJlYWR5TGF6eSkgPT4ge1xuXHRcdGNvbnN0IHtuYW1lLCBvcFR5cGV9ID0gYXNzaWduZWVcblx0XHRjb25zdCBpc0xhenkgPSBhc3NpZ25lZS5pc0xhenkoKVxuXHRcdC8vIFRPRE86IGFzc2VydChhc3NpZ25lZS5vcFR5cGUgPT09IG51bGwpXG5cdFx0Ly8gb3IgVE9ETzogQWxsb3cgdHlwZSBjaGVjayBvbiBsYXp5IHZhbHVlP1xuXHRcdHZhbHVlID0gaXNMYXp5ID8gdmFsdWUgOiBtYXliZVdyYXBJbkNoZWNrQ29udGFpbnModmFsdWUsIG9wVHlwZSwgbmFtZSlcblx0XHRjb25zdCB2YWwgPSBpc0xhenkgJiYgIXZhbHVlSXNBbHJlYWR5TGF6eSA/IGxhenlXcmFwKHZhbHVlKSA6IHZhbHVlXG5cdFx0YXNzZXJ0KGlzTGF6eSB8fCAhdmFsdWVJc0FscmVhZHlMYXp5KVxuXHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRm9yRGVjbGFyZUNhY2hlZChhc3NpZ25lZSksIHZhbClcblx0fSxcblxuXHRtYXliZVdyYXBJbkNoZWNrQ29udGFpbnMgPSAoYXN0LCBvcFR5cGUsIG5hbWUpID0+XG5cdFx0b3B0aW9ucy5pbmNsdWRlQ2hlY2tzKCkgJiYgb3BUeXBlICE9PSBudWxsID9cblx0XHRcdG1zQ2hlY2tDb250YWlucyh0MChvcFR5cGUpLCBhc3QsIG5ldyBMaXRlcmFsKG5hbWUpKSA6XG5cdFx0XHRhc3QsXG5cblx0Z2V0TWVtYmVyID0gKGFzdE9iamVjdCwgZ290TmFtZSwgaXNMYXp5LCBpc01vZHVsZSkgPT5cblx0XHRpc0xhenkgP1xuXHRcdG1zTGF6eUdldChhc3RPYmplY3QsIG5ldyBMaXRlcmFsKGdvdE5hbWUpKSA6XG5cdFx0aXNNb2R1bGUgJiYgb3B0aW9ucy5pbmNsdWRlQ2hlY2tzKCkgP1xuXHRcdG1zR2V0KGFzdE9iamVjdCwgbmV3IExpdGVyYWwoZ290TmFtZSkpIDpcblx0XHRtZW1iZXIoYXN0T2JqZWN0LCBnb3ROYW1lKVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

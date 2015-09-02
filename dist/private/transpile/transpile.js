if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'esast/dist/ast', 'esast/dist/util', '../manglePath', '../MsAst', '../util', './ast-constants', './ms-call', './util'], function (exports, _esastDistAst, _esastDistUtil, _manglePath, _MsAst, _util, _astConstants, _msCall, _util2) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _manglePath2 = _interopRequireDefault(_manglePath);

	let context, verifyResults, isInGenerator, isInConstructor;

	exports.default = (_context, moduleExpression, _verifyResults) => {
		context = _context;
		verifyResults = _verifyResults;
		isInGenerator = false;
		isInConstructor = false;
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
			const methods = (0, _util.cat)(this.statics.map(_ => t1(_, true)), (0, _util.opMap)(this.opConstructor, constructorDefinition), this.methods.map(_ => t1(_, false)));
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

		Fun() {
			const oldInGenerator = isInGenerator;
			isInGenerator = this.isGenerator;

			// TODO:ES6 use `...`f
			const nArgs = new _esastDistAst.Literal(this.args.length);
			const opDeclareRest = (0, _util.opMap)(this.opRestArg, rest => (0, _util2.declare)(rest, new _esastDistAst.CallExpression(_astConstants.ArraySliceCall, [_astConstants.IdArguments, nArgs])));
			const argChecks = (0, _util.opIf)(context.opts.includeChecks(), () => (0, _util.flatOpMap)(this.args, _util2.opTypeCheckForLocalDeclare));

			const _in = (0, _util.opMap)(this.opIn, t0);

			const opDeclareThis = (0, _util.opIf)(!isInConstructor, () => (0, _util.opMap)(this.opDeclareThis, () => new _esastDistAst.VariableDeclaration('const', [new _esastDistAst.VariableDeclarator(_astConstants.IdLexicalThis, new _esastDistAst.ThisExpression())])));

			const lead = (0, _util.cat)(opDeclareThis, opDeclareRest, argChecks, _in);

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

			let kind;
			switch (this.kind) {
				case _MsAst.MI_Plain:
					kind = 'method';
					break;
				case _MsAst.MI_Get:
					kind = 'get';
					break;
				case _MsAst.MI_Set:
					kind = 'set';
					break;
				default:
					throw new Error();
			}

			let key, computed;
			if (typeof this.symbol === 'string') {
				key = (0, _esastDistUtil.propertyIdOrLiteralCached)(this.symbol);
				computed = false;
			} else {
				key = (0, _msCall.msSymbol)(t0(this.symbol));
				computed = true;
			}
			return new _esastDistAst.MethodDefinition(key, value, kind, isStatic, computed);
		},

		NumberLiteral() {
			// Negative numbers are not part of ES spec.
			// http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.3
			const value = Number(this.value);
			const lit = new _esastDistAst.Literal(Math.abs(value));
			return (0, _util.isPositive)(value) ? lit : new _esastDistAst.UnaryExpression('-', lit);
		},

		GlobalAccess() {
			return new _esastDistAst.Identifier(this.name);
		},

		LocalAccess() {
			return this.name === 'this' ? isInConstructor ? new _esastDistAst.ThisExpression() : _astConstants.IdLexicalThis : (0, _util2.accessLocalDeclare)(verifyResults.localDeclareForAccess(this));
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
			return new _esastDistAst.Program((0, _util.cat)((0, _util.opIf)(context.opts.includeUseStrict(), () => _astConstants.UseStrict), (0, _util.opIf)(context.opts.includeAmdefine(), () => _astConstants.AmdefineHeader), (0, _esastDistUtil.toStatement)(amdWrapModule(this.doUses, this.uses.concat(this.debugUses), body))));
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
				case _MsAst.SV_Super:
					return new _esastDistAst.Identifier('super');
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
	      forLoop = (opIteratee, block) => (0, _util.ifElse)(opIteratee, _ref => {
		let element = _ref.element;
		let bag = _ref.bag;

		const declare = new _esastDistAst.VariableDeclaration('let', [new _esastDistAst.VariableDeclarator(t0(element))]);
		return new _esastDistAst.ForOfStatement(declare, t0(bag), t0(block));
	}, () => (0, _util2.forStatementInfinite)(t0(block))),
	      constructorDefinition = fun => {
		isInConstructor = true;
		const res = new _esastDistAst.MethodDefinition(new _esastDistAst.Identifier('constructor'), t0(fun), 'constructor', false, false);
		isInConstructor = false;
		return res;
	},
	      doThrow = thrown => new _esastDistAst.ThrowStatement(thrown instanceof _MsAst.Quote ? new _esastDistAst.NewExpression(_astConstants.GlobalError, [t0(thrown)]) : t0(thrown)),
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

		const useIdentifiers = allUses.map((_, i) => (0, _esastDistUtil.idCached)(`${ pathBaseName(_.path) }_${ i }`));

		const useArgs = (0, _util.cat)((0, _util.opIf)(useBoot, () => IdBoot), _astConstants.IdExports, useIdentifiers);

		const doBoot = (0, _util.opIf)(useBoot, () => new _esastDistAst.ExpressionStatement((0, _msCall.msGetModule)(IdBoot)));

		const useDos = doUses.map((use, i) => (0, _esastDistUtil.loc)(new _esastDistAst.ExpressionStatement((0, _msCall.msGetModule)(useIdentifiers[i])), use.loc));

		const opUseDeclare = (0, _util.opIf)(!(0, _util.isEmpty)(otherUses), () => new _esastDistAst.VariableDeclaration('const', (0, _util.flatMap)(otherUses, (use, i) => useDeclarators(use, useIdentifiers[i + doUses.length]))));

		const fullBody = new _esastDistAst.BlockStatement((0, _util.cat)(doBoot, useDos, opUseDeclare, body, _astConstants.ReturnExports));

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
		const destructuredName = `_$${ assignees[0].loc.start.line }`;
		const idDestructured = new _esastDistAst.Identifier(destructuredName);
		const declarators = assignees.map(assignee => {
			// TODO: Don't compile it if it's never accessed
			const get = getMember(idDestructured, assignee.name, isLazy, isModule);
			return makeDeclarator(assignee, get, isLazy, isExport);
		});
		// Getting lazy module is done by ms.lazyGetModule.
		const val = isLazy && !isModule ? (0, _msCall.lazyWrap)(value) : value;
		return (0, _util.unshift)(new _esastDistAst.VariableDeclarator(idDestructured, val), declarators);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zcGlsZS5qcyIsInByaXZhdGUvdHJhbnNwaWxlL3RyYW5zcGlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7QUM2QkEsS0FBSSxPQUFPLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxlQUFlLENBQUE7O21CQUUzQyxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLEtBQUs7QUFDOUQsU0FBTyxHQUFHLFFBQVEsQ0FBQTtBQUNsQixlQUFhLEdBQUcsY0FBYyxDQUFBO0FBQzlCLGVBQWEsR0FBRyxLQUFLLENBQUE7QUFDckIsaUJBQWUsR0FBRyxLQUFLLENBQUE7QUFDdkIsUUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUE7O0FBRWhDLFNBQU8sR0FBRyxhQUFhLEdBQUcsU0FBUyxDQUFBO0FBQ25DLFNBQU8sR0FBRyxDQUFBO0VBQ1Y7O0FBRU0sT0FDTixFQUFFLEdBQUcsSUFBSSxJQUFJLG1CQW5DOEIsR0FBRyxFQW1DN0IsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFDN0MsT0FDQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxLQUFLLG1CQXJDdUIsR0FBRyxFQXFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDO09BQ3RELEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksS0FBSyxtQkF0Q1csR0FBRyxFQXNDVixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQztPQUM5RSxNQUFNLEdBQUcsS0FBSyxJQUFJO0FBQ2pCLFFBQU0sR0FBRyxHQUFHLEVBQUcsQ0FBQTtBQUNmLE9BQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO0FBQ3pCLFNB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QVMsR0FBRyxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsS0FDaEQsTUFBTSxHQUNOLFlBNXBCTyxTQUFTLEVBNHBCTixTQUFTLEVBQUUsa0JBanJCdUIsT0FBTyxDQWlyQmxCLE9BQU8sQ0FBQyxDQUFDLEdBQzFDLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUN4QyxZQS9wQnVELEtBQUssRUErcEJ0RCxTQUFTLEVBQUUsa0JBbnJCMkIsT0FBTyxDQW1yQnRCLE9BQU8sQ0FBQyxDQUFDLEdBQ3RDLG1CQS9xQitDLE1BQU0sRUErcUI5QyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUEiLCJmaWxlIjoicHJpdmF0ZS90cmFuc3BpbGUvdHJhbnNwaWxlLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQgeyBBcnJheUV4cHJlc3Npb24sIEFycm93RnVuY3Rpb25FeHByZXNzaW9uLCBBc3NpZ25tZW50RXhwcmVzc2lvbiwgQmluYXJ5RXhwcmVzc2lvbixcblx0QmxvY2tTdGF0ZW1lbnQsIEJyZWFrU3RhdGVtZW50LCBDYWxsRXhwcmVzc2lvbiwgQ2F0Y2hDbGF1c2UsIENsYXNzQm9keSwgQ2xhc3NFeHByZXNzaW9uLFxuXHRDb25kaXRpb25hbEV4cHJlc3Npb24sIERlYnVnZ2VyU3RhdGVtZW50LCBFeHByZXNzaW9uU3RhdGVtZW50LCBGb3JPZlN0YXRlbWVudCxcblx0RnVuY3Rpb25FeHByZXNzaW9uLCBJZGVudGlmaWVyLCBJZlN0YXRlbWVudCwgTGl0ZXJhbCwgTG9naWNhbEV4cHJlc3Npb24sIE1lbWJlckV4cHJlc3Npb24sXG5cdE1ldGhvZERlZmluaXRpb24sIE5ld0V4cHJlc3Npb24sIE9iamVjdEV4cHJlc3Npb24sIFByb2dyYW0sIFByb3BlcnR5LCBSZXR1cm5TdGF0ZW1lbnQsXG5cdFNwcmVhZEVsZW1lbnQsIFN3aXRjaENhc2UsIFN3aXRjaFN0YXRlbWVudCwgVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uLCBUZW1wbGF0ZUVsZW1lbnQsXG5cdFRlbXBsYXRlTGl0ZXJhbCwgVGhpc0V4cHJlc3Npb24sIFRocm93U3RhdGVtZW50LCBUcnlTdGF0ZW1lbnQsIFZhcmlhYmxlRGVjbGFyYXRpb24sXG5cdFVuYXJ5RXhwcmVzc2lvbiwgVmFyaWFibGVEZWNsYXJhdG9yLCBZaWVsZEV4cHJlc3Npb24gfSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7IGZ1bmN0aW9uRXhwcmVzc2lvblRodW5rLCBpZENhY2hlZCwgbG9jLCBtZW1iZXIsIHByb3BlcnR5SWRPckxpdGVyYWxDYWNoZWQsIHRvU3RhdGVtZW50XG5cdH0gZnJvbSAnZXNhc3QvZGlzdC91dGlsJ1xuaW1wb3J0IG1hbmdsZVBhdGggZnJvbSAnLi4vbWFuZ2xlUGF0aCdcbmltcG9ydCAqIGFzIE1zQXN0VHlwZXMgZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQgeyBBc3NpZ25TaW5nbGUsIENhbGwsIExfQW5kLCBMX09yLCBMRF9MYXp5LCBMRF9NdXRhYmxlLCBNZW1iZXIsIE1JX0dldCwgTUlfUGxhaW4sIE1JX1NldCxcblx0TVNfTXV0YXRlLCBNU19OZXcsIE1TX05ld011dGFibGUsIFBhdHRlcm4sIFNwbGF0LCBTRF9EZWJ1Z2dlciwgU1ZfQ29udGFpbnMsIFNWX0ZhbHNlLCBTVl9OYW1lLFxuXHRTVl9OdWxsLCBTVl9TdWIsIFNWX1N1cGVyLCBTVl9UcnVlLCBTVl9VbmRlZmluZWQsIFN3aXRjaERvUGFydCwgUXVvdGUgfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7IGFzc2VydCwgY2F0LCBmbGF0TWFwLCBmbGF0T3BNYXAsIGlmRWxzZSwgaXNFbXB0eSxcblx0aW1wbGVtZW50TWFueSwgaXNQb3NpdGl2ZSwgb3BJZiwgb3BNYXAsIHRhaWwsIHVuc2hpZnQgfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHsgQW1kZWZpbmVIZWFkZXIsIEFycmF5U2xpY2VDYWxsLCBEZWNsYXJlQnVpbHRCYWcsIERlY2xhcmVCdWlsdE1hcCwgRGVjbGFyZUJ1aWx0T2JqLFxuXHRFeHBvcnRzRGVmYXVsdCwgRXhwb3J0c0dldCwgSWRBcmd1bWVudHMsIElkQnVpbHQsIElkRGVmaW5lLCBJZEV4cG9ydHMsIElkRXh0cmFjdCxcblx0SWRMZXhpY2FsVGhpcywgR2xvYmFsRXJyb3IsIExpdEVtcHR5U3RyaW5nLCBMaXROdWxsLCBMaXRTdHJFeHBvcnRzLCBMaXRTdHJUaHJvdywgTGl0WmVybyxcblx0UmV0dXJuQnVpbHQsIFJldHVybkV4cG9ydHMsIFJldHVyblJlcywgU3dpdGNoQ2FzZU5vTWF0Y2gsIFRocm93QXNzZXJ0RmFpbCwgVGhyb3dOb0Nhc2VNYXRjaCxcblx0VXNlU3RyaWN0IH0gZnJvbSAnLi9hc3QtY29uc3RhbnRzJ1xuaW1wb3J0IHsgSWRNcywgbGF6eVdyYXAsIG1zQWRkLCBtc0FkZE1hbnksIG1zQXNzZXJ0LCBtc0Fzc2VydE1lbWJlciwgbXNBc3NlcnROb3QsXG5cdG1zQXNzZXJ0Tm90TWVtYmVyLCBtc0Fzc29jLCBtc0NoZWNrQ29udGFpbnMsIG1zRXh0cmFjdCwgbXNHZXQsIG1zR2V0RGVmYXVsdEV4cG9ydCwgbXNHZXRNb2R1bGUsXG5cdG1zTGF6eSwgbXNMYXp5R2V0LCBtc0xhenlHZXRNb2R1bGUsIG1zTmV3TXV0YWJsZVByb3BlcnR5LCBtc05ld1Byb3BlcnR5LCBtc1NldCwgbXNTZXROYW1lLFxuXHRtc1NldExhenksIG1zU29tZSwgbXNTeW1ib2wsIE1zTm9uZSB9IGZyb20gJy4vbXMtY2FsbCdcbmltcG9ydCB7IGFjY2Vzc0xvY2FsRGVjbGFyZSwgZGVjbGFyZSwgZm9yU3RhdGVtZW50SW5maW5pdGUsIGlkRm9yRGVjbGFyZUNhY2hlZCxcblx0b3BUeXBlQ2hlY2tGb3JMb2NhbERlY2xhcmUgfSBmcm9tICcuL3V0aWwnXG5cbmxldCBjb250ZXh0LCB2ZXJpZnlSZXN1bHRzLCBpc0luR2VuZXJhdG9yLCBpc0luQ29uc3RydWN0b3JcblxuZXhwb3J0IGRlZmF1bHQgKF9jb250ZXh0LCBtb2R1bGVFeHByZXNzaW9uLCBfdmVyaWZ5UmVzdWx0cykgPT4ge1xuXHRjb250ZXh0ID0gX2NvbnRleHRcblx0dmVyaWZ5UmVzdWx0cyA9IF92ZXJpZnlSZXN1bHRzXG5cdGlzSW5HZW5lcmF0b3IgPSBmYWxzZVxuXHRpc0luQ29uc3RydWN0b3IgPSBmYWxzZVxuXHRjb25zdCByZXMgPSB0MChtb2R1bGVFeHByZXNzaW9uKVxuXHQvLyBSZWxlYXNlIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXG5cdGNvbnRleHQgPSB2ZXJpZnlSZXN1bHRzID0gdW5kZWZpbmVkXG5cdHJldHVybiByZXNcbn1cblxuZXhwb3J0IGNvbnN0XG5cdHQwID0gZXhwciA9PiBsb2MoZXhwci50cmFuc3BpbGUoKSwgZXhwci5sb2MpXG5jb25zdFxuXHR0MSA9IChleHByLCBhcmcpID0+IGxvYyhleHByLnRyYW5zcGlsZShhcmcpLCBleHByLmxvYyksXG5cdHQzID0gKGV4cHIsIGFyZywgYXJnMiwgYXJnMykgPT4gbG9jKGV4cHIudHJhbnNwaWxlKGFyZywgYXJnMiwgYXJnMyksIGV4cHIubG9jKSxcblx0dExpbmVzID0gZXhwcnMgPT4ge1xuXHRcdGNvbnN0IG91dCA9IFsgXVxuXHRcdGZvciAoY29uc3QgZXhwciBvZiBleHBycykge1xuXHRcdFx0Y29uc3QgYXN0ID0gZXhwci50cmFuc3BpbGUoKVxuXHRcdFx0aWYgKGFzdCBpbnN0YW5jZW9mIEFycmF5KVxuXHRcdFx0XHQvLyBEZWJ1ZyBtYXkgcHJvZHVjZSBtdWx0aXBsZSBzdGF0ZW1lbnRzLlxuXHRcdFx0XHRmb3IgKGNvbnN0IF8gb2YgYXN0KVxuXHRcdFx0XHRcdG91dC5wdXNoKHRvU3RhdGVtZW50KF8pKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRvdXQucHVzaChsb2ModG9TdGF0ZW1lbnQoYXN0KSwgZXhwci5sb2MpKVxuXHRcdH1cblx0XHRyZXR1cm4gb3V0XG5cdH1cblxuaW1wbGVtZW50TWFueShNc0FzdFR5cGVzLCAndHJhbnNwaWxlJywge1xuXHRBc3NlcnQoKSB7XG5cdFx0Y29uc3QgZmFpbENvbmQgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBjb25kID0gdDAodGhpcy5jb25kaXRpb24pXG5cdFx0XHRyZXR1cm4gdGhpcy5uZWdhdGUgPyBjb25kIDogbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIGNvbmQpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wVGhyb3duLFxuXHRcdFx0XyA9PiBuZXcgSWZTdGF0ZW1lbnQoZmFpbENvbmQoKSwgZG9UaHJvdyhfKSksXG5cdFx0XHQoKSA9PiB7XG5cdFx0XHRcdGlmICh0aGlzLmNvbmRpdGlvbiBpbnN0YW5jZW9mIENhbGwpIHtcblx0XHRcdFx0XHRjb25zdCBjYWxsID0gdGhpcy5jb25kaXRpb25cblx0XHRcdFx0XHRjb25zdCBjYWxsZWQgPSBjYWxsLmNhbGxlZFxuXHRcdFx0XHRcdGNvbnN0IGFyZ3MgPSBjYWxsLmFyZ3MubWFwKHQwKVxuXHRcdFx0XHRcdGlmIChjYWxsZWQgaW5zdGFuY2VvZiBNZW1iZXIpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGFzcyA9IHRoaXMubmVnYXRlID8gbXNBc3NlcnROb3RNZW1iZXIgOiBtc0Fzc2VydE1lbWJlclxuXHRcdFx0XHRcdFx0cmV0dXJuIGFzcyh0MChjYWxsZWQub2JqZWN0KSwgbmV3IExpdGVyYWwoY2FsbGVkLm5hbWUpLCAuLi5hcmdzKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb25zdCBhc3MgPSB0aGlzLm5lZ2F0ZSA/IG1zQXNzZXJ0Tm90IDogbXNBc3NlcnRcblx0XHRcdFx0XHRcdHJldHVybiBhc3ModDAoY2FsbGVkKSwgLi4uYXJncylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQoZmFpbENvbmQoKSwgVGhyb3dBc3NlcnRGYWlsKVxuXHRcdFx0fSlcblx0fSxcblxuXHRBc3NpZ25TaW5nbGUodmFsV3JhcCkge1xuXHRcdGNvbnN0IHZhbCA9IHZhbFdyYXAgPT09IHVuZGVmaW5lZCA/IHQwKHRoaXMudmFsdWUpIDogdmFsV3JhcCh0MCh0aGlzLnZhbHVlKSlcblx0XHRjb25zdCBkZWNsYXJlID1cblx0XHRcdG1ha2VEZWNsYXJhdG9yKHRoaXMuYXNzaWduZWUsIHZhbCwgZmFsc2UsIHZlcmlmeVJlc3VsdHMuaXNFeHBvcnRBc3NpZ24odGhpcykpXG5cdFx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKHRoaXMuYXNzaWduZWUuaXNNdXRhYmxlKCkgPyAnbGV0JyA6ICdjb25zdCcsIFsgZGVjbGFyZSBdKVxuXHR9LFxuXHQvLyBUT0RPOkVTNiBKdXN0IHVzZSBuYXRpdmUgZGVzdHJ1Y3R1cmluZyBhc3NpZ25cblx0QXNzaWduRGVzdHJ1Y3R1cmUoKSB7XG5cdFx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKHRoaXMua2luZCgpID09PSBMRF9NdXRhYmxlID8gJ2xldCcgOiAnY29uc3QnLFxuXHRcdFx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMoXG5cdFx0XHRcdHRoaXMuYXNzaWduZWVzLFxuXHRcdFx0XHR0aGlzLmtpbmQoKSA9PT0gTERfTGF6eSxcblx0XHRcdFx0dDAodGhpcy52YWx1ZSksXG5cdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHR2ZXJpZnlSZXN1bHRzLmlzRXhwb3J0QXNzaWduKHRoaXMpKSlcblx0fSxcblxuXHRCYWdFbnRyeSgpIHsgcmV0dXJuIG1zQWRkKElkQnVpbHQsIHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdEJhZ0VudHJ5TWFueSgpIHsgcmV0dXJuIG1zQWRkTWFueShJZEJ1aWx0LCB0MCh0aGlzLnZhbHVlKSkgfSxcblxuXHRCYWdTaW1wbGUoKSB7IHJldHVybiBuZXcgQXJyYXlFeHByZXNzaW9uKHRoaXMucGFydHMubWFwKHQwKSkgfSxcblxuXHRCbG9ja0RvKGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpIHtcblx0XHQvLyBUT0RPOkVTNiBPcHRpb25hbCBhcmd1bWVudHNcblx0XHRpZiAobGVhZCA9PT0gdW5kZWZpbmVkKSBsZWFkID0gbnVsbFxuXHRcdGlmIChvcERlY2xhcmVSZXMgPT09IHVuZGVmaW5lZCkgb3BEZWNsYXJlUmVzID0gbnVsbFxuXHRcdGlmIChvcE91dCA9PT0gdW5kZWZpbmVkKSBvcE91dCA9IG51bGxcblx0XHRhc3NlcnQob3BEZWNsYXJlUmVzID09PSBudWxsKVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHRMaW5lcyh0aGlzLmxpbmVzKSwgb3BPdXQpKVxuXHR9LFxuXG5cdEJsb2NrVmFsVGhyb3cobGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkge1xuXHRcdC8vIFRPRE86RVM2IE9wdGlvbmFsIGFyZ3VtZW50c1xuXHRcdGlmIChsZWFkID09PSB1bmRlZmluZWQpIGxlYWQgPSBudWxsXG5cdFx0aWYgKG9wRGVjbGFyZVJlcyA9PT0gdW5kZWZpbmVkKSBvcERlY2xhcmVSZXMgPSBudWxsXG5cdFx0aWYgKG9wT3V0ID09PSB1bmRlZmluZWQpIG9wT3V0ID0gbnVsbFxuXHRcdGNvbnRleHQud2FybklmKG9wRGVjbGFyZVJlcyAhPT0gbnVsbCB8fCBvcE91dCAhPT0gbnVsbCwgdGhpcy5sb2MsXG5cdFx0XHQnT3V0IGNvbmRpdGlvbiBpZ25vcmVkIGJlY2F1c2Ugb2Ygb2gtbm8hJylcblx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChsZWFkLCB0TGluZXModGhpcy5saW5lcyksIHQwKHRoaXMudGhyb3cpKSlcblx0fSxcblxuXHRCbG9ja1dpdGhSZXR1cm4obGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayh0MCh0aGlzLnJldHVybmVkKSwgdExpbmVzKHRoaXMubGluZXMpLCBsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KVxuXHR9LFxuXG5cdEJsb2NrQmFnKGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2soXG5cdFx0XHRJZEJ1aWx0LFxuXHRcdFx0Y2F0KERlY2xhcmVCdWlsdEJhZywgdExpbmVzKHRoaXMubGluZXMpKSxcblx0XHRcdGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpXG5cdH0sXG5cblx0QmxvY2tPYmoobGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkge1xuXHRcdGNvbnN0IGxpbmVzID0gY2F0KERlY2xhcmVCdWlsdE9iaiwgdExpbmVzKHRoaXMubGluZXMpKVxuXHRcdGNvbnN0IHJlcyA9IGlmRWxzZSh0aGlzLm9wT2JqZWQsXG5cdFx0XHRvYmplZCA9PiBpZkVsc2UodGhpcy5vcE5hbWUsXG5cdFx0XHRcdG5hbWUgPT4gbXNTZXQodDAob2JqZWQpLCBJZEJ1aWx0LCBuZXcgTGl0ZXJhbChuYW1lKSksXG5cdFx0XHRcdCgpID0+IG1zU2V0KHQwKG9iamVkKSwgSWRCdWlsdCkpLFxuXHRcdFx0KCkgPT4gaWZFbHNlKHRoaXMub3BOYW1lLFxuXHRcdFx0XHRfID0+IG1zU2V0TmFtZShJZEJ1aWx0LCBuZXcgTGl0ZXJhbChfKSksXG5cdFx0XHRcdCgpID0+IElkQnVpbHQpKVxuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayhyZXMsIGxpbmVzLCBsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KVxuXHR9LFxuXG5cdEJsb2NrTWFwKGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2soXG5cdFx0XHRJZEJ1aWx0LFxuXHRcdFx0Y2F0KERlY2xhcmVCdWlsdE1hcCwgdExpbmVzKHRoaXMubGluZXMpKSxcblx0XHRcdGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpXG5cdH0sXG5cblx0QmxvY2tXcmFwKCkgeyByZXR1cm4gYmxvY2tXcmFwKHQwKHRoaXMuYmxvY2spKSB9LFxuXG5cdEJyZWFrKCkgeyByZXR1cm4gbmV3IEJyZWFrU3RhdGVtZW50KCkgfSxcblxuXHRCcmVha1dpdGhWYWwoKSB7IHJldHVybiBuZXcgUmV0dXJuU3RhdGVtZW50KHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdENhbGwoKSB7XG5cdFx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbih0MCh0aGlzLmNhbGxlZCksIHRoaXMuYXJncy5tYXAodDApKVxuXHR9LFxuXG5cdENhc2VEbygpIHtcblx0XHRjb25zdCBib2R5ID0gY2FzZUJvZHkodGhpcy5wYXJ0cywgdGhpcy5vcEVsc2UpXG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wQ2FzZWQsIF8gPT4gbmV3IEJsb2NrU3RhdGVtZW50KFsgdDAoXyksIGJvZHkgXSksICgpID0+IGJvZHkpXG5cdH0sXG5cdENhc2VWYWwoKSB7XG5cdFx0Y29uc3QgYm9keSA9IGNhc2VCb2R5KHRoaXMucGFydHMsIHRoaXMub3BFbHNlKVxuXHRcdGNvbnN0IGJsb2NrID0gaWZFbHNlKHRoaXMub3BDYXNlZCwgXyA9PiBbIHQwKF8pLCBib2R5IF0sICgpID0+IFsgYm9keSBdKVxuXHRcdHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KGJsb2NrKSlcblx0fSxcblx0Q2FzZURvUGFydDogY2FzZVBhcnQsXG5cdENhc2VWYWxQYXJ0OiBjYXNlUGFydCxcblxuXHRDbGFzcygpIHtcblx0XHRjb25zdCBtZXRob2RzID0gY2F0KFxuXHRcdFx0dGhpcy5zdGF0aWNzLm1hcChfID0+IHQxKF8sIHRydWUpKSxcblx0XHRcdG9wTWFwKHRoaXMub3BDb25zdHJ1Y3RvciwgY29uc3RydWN0b3JEZWZpbml0aW9uKSxcblx0XHRcdHRoaXMubWV0aG9kcy5tYXAoXyA9PiB0MShfLCBmYWxzZSkpKVxuXHRcdGNvbnN0IG9wTmFtZSA9IG9wTWFwKHZlcmlmeVJlc3VsdHMub3BOYW1lKHRoaXMpLCBpZENhY2hlZClcblx0XHRjb25zdCBjbGFzc0V4cHIgPSBuZXcgQ2xhc3NFeHByZXNzaW9uKFxuXHRcdFx0b3BOYW1lLFxuXHRcdFx0b3BNYXAodGhpcy5vcFN1cGVyQ2xhc3MsIHQwKSwgbmV3IENsYXNzQm9keShtZXRob2RzKSlcblxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcERvLCBfID0+IHQxKF8sIGNsYXNzRXhwciksICgpID0+IGNsYXNzRXhwcilcblx0fSxcblxuXHRDbGFzc0RvKGNsYXNzRXhwcikge1xuXHRcdGNvbnN0IGxlYWQgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBbXG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKHQwKHRoaXMuZGVjbGFyZUZvY3VzKSwgY2xhc3NFeHByKSBdKVxuXHRcdGNvbnN0IHJldCA9IG5ldyBSZXR1cm5TdGF0ZW1lbnQodDAodGhpcy5kZWNsYXJlRm9jdXMpKVxuXHRcdGNvbnN0IGJsb2NrID0gdDModGhpcy5ibG9jaywgbGVhZCwgbnVsbCwgcmV0KVxuXHRcdHJldHVybiBibG9ja1dyYXAoYmxvY2spXG5cdH0sXG5cblx0Q29uZGl0aW9uYWxEbygpIHtcblx0XHRjb25zdCB0ZXN0ID0gdDAodGhpcy50ZXN0KVxuXHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQoXG5cdFx0XHR0aGlzLmlzVW5sZXNzID8gbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIHRlc3QpIDogdGVzdCxcblx0XHRcdHQwKHRoaXMucmVzdWx0KSlcblx0fSxcblxuXHRDb25kaXRpb25hbFZhbCgpIHtcblx0XHRjb25zdCB0ZXN0ID0gdDAodGhpcy50ZXN0KVxuXHRcdGNvbnN0IHJlc3VsdCA9IG1zU29tZShibG9ja1dyYXAodDAodGhpcy5yZXN1bHQpKSlcblx0XHRyZXR1cm4gdGhpcy5pc1VubGVzcyA/XG5cdFx0XHRuZXcgQ29uZGl0aW9uYWxFeHByZXNzaW9uKHRlc3QsIE1zTm9uZSwgcmVzdWx0KSA6XG5cdFx0XHRuZXcgQ29uZGl0aW9uYWxFeHByZXNzaW9uKHRlc3QsIHJlc3VsdCwgTXNOb25lKVxuXHR9LFxuXG5cdENhdGNoKCkge1xuXHRcdHJldHVybiBuZXcgQ2F0Y2hDbGF1c2UodDAodGhpcy5jYXVnaHQpLCB0MCh0aGlzLmJsb2NrKSlcblx0fSxcblxuXHREZWJ1ZygpIHsgcmV0dXJuIGNvbnRleHQub3B0cy5pbmNsdWRlQ2hlY2tzKCkgPyB0TGluZXModGhpcy5saW5lcykgOiBbIF0gfSxcblxuXHRFeGNlcHREbygpIHsgcmV0dXJuIHRyYW5zcGlsZUV4Y2VwdCh0aGlzKSB9LFxuXHRFeGNlcHRWYWwoKSB7IHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFsgdHJhbnNwaWxlRXhjZXB0KHRoaXMpIF0pKSB9LFxuXG5cdEZvckRvKCkgeyByZXR1cm4gZm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spIH0sXG5cblx0Rm9yQmFnKCkge1xuXHRcdHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFtcblx0XHRcdERlY2xhcmVCdWlsdEJhZyxcblx0XHRcdGZvckxvb3AodGhpcy5vcEl0ZXJhdGVlLCB0aGlzLmJsb2NrKSxcblx0XHRcdFJldHVybkJ1aWx0XG5cdFx0XSkpXG5cdH0sXG5cblx0Rm9yVmFsKCkge1xuXHRcdHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFsgZm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spIF0pKVxuXHR9LFxuXG5cdEZ1bigpIHtcblx0XHRjb25zdCBvbGRJbkdlbmVyYXRvciA9IGlzSW5HZW5lcmF0b3Jcblx0XHRpc0luR2VuZXJhdG9yID0gdGhpcy5pc0dlbmVyYXRvclxuXG5cdFx0Ly8gVE9ETzpFUzYgdXNlIGAuLi5gZlxuXHRcdGNvbnN0IG5BcmdzID0gbmV3IExpdGVyYWwodGhpcy5hcmdzLmxlbmd0aClcblx0XHRjb25zdCBvcERlY2xhcmVSZXN0ID0gb3BNYXAodGhpcy5vcFJlc3RBcmcsIHJlc3QgPT5cblx0XHRcdGRlY2xhcmUocmVzdCwgbmV3IENhbGxFeHByZXNzaW9uKEFycmF5U2xpY2VDYWxsLCBbSWRBcmd1bWVudHMsIG5BcmdzXSkpKVxuXHRcdGNvbnN0IGFyZ0NoZWNrcyA9IG9wSWYoY29udGV4dC5vcHRzLmluY2x1ZGVDaGVja3MoKSwgKCkgPT5cblx0XHRcdGZsYXRPcE1hcCh0aGlzLmFyZ3MsIG9wVHlwZUNoZWNrRm9yTG9jYWxEZWNsYXJlKSlcblxuXHRcdGNvbnN0IF9pbiA9IG9wTWFwKHRoaXMub3BJbiwgdDApXG5cblx0XHRjb25zdCBvcERlY2xhcmVUaGlzID0gb3BJZighaXNJbkNvbnN0cnVjdG9yLCAoKSA9PiBvcE1hcCh0aGlzLm9wRGVjbGFyZVRoaXMsICgpID0+XG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLFxuXHRcdFx0XHRbIG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRMZXhpY2FsVGhpcywgbmV3IFRoaXNFeHByZXNzaW9uKCkpIF0pKSlcblxuXHRcdGNvbnN0IGxlYWQgPSBjYXQob3BEZWNsYXJlVGhpcywgb3BEZWNsYXJlUmVzdCwgYXJnQ2hlY2tzLCBfaW4pXG5cblx0XHRjb25zdCBfb3V0ID0gb3BNYXAodGhpcy5vcE91dCwgdDApXG5cdFx0Y29uc3QgYm9keSA9IHQzKHRoaXMuYmxvY2ssIGxlYWQsIHRoaXMub3BEZWNsYXJlUmVzLCBfb3V0KVxuXHRcdGNvbnN0IGFyZ3MgPSB0aGlzLmFyZ3MubWFwKHQwKVxuXHRcdGlzSW5HZW5lcmF0b3IgPSBvbGRJbkdlbmVyYXRvclxuXHRcdGNvbnN0IGlkID0gb3BNYXAodmVyaWZ5UmVzdWx0cy5vcE5hbWUodGhpcyksIGlkQ2FjaGVkKVxuXG5cdFx0Y29uc3QgY2FuVXNlQXJyb3dGdW5jdGlvbiA9XG5cdFx0XHRpZCA9PT0gbnVsbCAmJlxuXHRcdFx0dGhpcy5vcERlY2xhcmVUaGlzID09PSBudWxsICYmXG5cdFx0XHRvcERlY2xhcmVSZXN0ID09PSBudWxsICYmXG5cdFx0XHQhdGhpcy5pc0dlbmVyYXRvclxuXHRcdHJldHVybiBjYW5Vc2VBcnJvd0Z1bmN0aW9uID9cblx0XHRcdG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihhcmdzLCBib2R5KSA6XG5cdFx0XHRuZXcgRnVuY3Rpb25FeHByZXNzaW9uKGlkLCBhcmdzLCBib2R5LCB0aGlzLmlzR2VuZXJhdG9yKVxuXHR9LFxuXG5cdElnbm9yZSgpIHsgcmV0dXJuIFsgXSB9LFxuXG5cdExhenkoKSB7IHJldHVybiBsYXp5V3JhcCh0MCh0aGlzLnZhbHVlKSkgfSxcblxuXHRNZXRob2RJbXBsKGlzU3RhdGljKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSB0MCh0aGlzLmZ1bilcblx0XHRhc3NlcnQodmFsdWUuaWQgPT0gbnVsbClcblxuXHRcdGxldCBraW5kXG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgTUlfUGxhaW46XG5cdFx0XHRcdGtpbmQgPSAnbWV0aG9kJ1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBNSV9HZXQ6XG5cdFx0XHRcdGtpbmQgPSAnZ2V0J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBNSV9TZXQ6XG5cdFx0XHRcdGtpbmQgPSAnc2V0J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKClcblx0XHR9XG5cblx0XHRsZXQga2V5LCBjb21wdXRlZFxuXHRcdGlmICh0eXBlb2YgdGhpcy5zeW1ib2wgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRrZXkgPSBwcm9wZXJ0eUlkT3JMaXRlcmFsQ2FjaGVkKHRoaXMuc3ltYm9sKVxuXHRcdFx0Y29tcHV0ZWQgPSBmYWxzZVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRrZXkgPSBtc1N5bWJvbCh0MCh0aGlzLnN5bWJvbCkpXG5cdFx0XHRjb21wdXRlZCA9IHRydWVcblx0XHR9XG5cdFx0cmV0dXJuIG5ldyBNZXRob2REZWZpbml0aW9uKGtleSwgdmFsdWUsIGtpbmQsIGlzU3RhdGljLCBjb21wdXRlZClcblx0fSxcblxuXHROdW1iZXJMaXRlcmFsKCkge1xuXHRcdC8vIE5lZ2F0aXZlIG51bWJlcnMgYXJlIG5vdCBwYXJ0IG9mIEVTIHNwZWMuXG5cdFx0Ly8gaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzUuMS8jc2VjLTcuOC4zXG5cdFx0Y29uc3QgdmFsdWUgPSBOdW1iZXIodGhpcy52YWx1ZSlcblx0XHRjb25zdCBsaXQgPSBuZXcgTGl0ZXJhbChNYXRoLmFicyh2YWx1ZSkpXG5cdFx0cmV0dXJuIGlzUG9zaXRpdmUodmFsdWUpID8gbGl0IDogbmV3IFVuYXJ5RXhwcmVzc2lvbignLScsIGxpdClcblx0fSxcblxuXHRHbG9iYWxBY2Nlc3MoKSB7IHJldHVybiBuZXcgSWRlbnRpZmllcih0aGlzLm5hbWUpIH0sXG5cblx0TG9jYWxBY2Nlc3MoKSB7XG5cdFx0cmV0dXJuIHRoaXMubmFtZSA9PT0gJ3RoaXMnID9cblx0XHRcdChpc0luQ29uc3RydWN0b3IgPyBuZXcgVGhpc0V4cHJlc3Npb24oKSA6IElkTGV4aWNhbFRoaXMpIDpcblx0XHRcdGFjY2Vzc0xvY2FsRGVjbGFyZSh2ZXJpZnlSZXN1bHRzLmxvY2FsRGVjbGFyZUZvckFjY2Vzcyh0aGlzKSlcblx0fSxcblxuXHRMb2NhbERlY2xhcmUoKSB7IHJldHVybiBuZXcgSWRlbnRpZmllcihpZEZvckRlY2xhcmVDYWNoZWQodGhpcykubmFtZSkgfSxcblxuXHRMb2NhbE11dGF0ZSgpIHtcblx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgaWRDYWNoZWQodGhpcy5uYW1lKSwgdDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0TG9naWMoKSB7XG5cdFx0YXNzZXJ0KHRoaXMua2luZCA9PT0gTF9BbmQgfHwgdGhpcy5raW5kID09PSBMX09yKVxuXHRcdGNvbnN0IG9wID0gdGhpcy5raW5kID09PSBMX0FuZCA/ICcmJicgOiAnfHwnXG5cdFx0cmV0dXJuIHRhaWwodGhpcy5hcmdzKS5yZWR1Y2UoKGEsIGIpID0+XG5cdFx0XHRuZXcgTG9naWNhbEV4cHJlc3Npb24ob3AsIGEsIHQwKGIpKSwgdDAodGhpcy5hcmdzWzBdKSlcblx0fSxcblxuXHRNYXBFbnRyeSgpIHsgcmV0dXJuIG1zQXNzb2MoSWRCdWlsdCwgdDAodGhpcy5rZXkpLCB0MCh0aGlzLnZhbCkpIH0sXG5cblx0TWVtYmVyKCkgeyByZXR1cm4gbWVtYmVyKHQwKHRoaXMub2JqZWN0KSwgdGhpcy5uYW1lKSB9LFxuXG5cdE1lbWJlclNldCgpIHtcblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBNU19NdXRhdGU6XG5cdFx0XHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLFxuXHRcdFx0XHRcdG1lbWJlcih0MCh0aGlzLm9iamVjdCksIHRoaXMubmFtZSksXG5cdFx0XHRcdFx0dDAodGhpcy52YWx1ZSkpXG5cdFx0XHRjYXNlIE1TX05ldzpcblx0XHRcdFx0cmV0dXJuIG1zTmV3UHJvcGVydHkodDAodGhpcy5vYmplY3QpLCBuZXcgTGl0ZXJhbCh0aGlzLm5hbWUpLCB0MCh0aGlzLnZhbHVlKSlcblx0XHRcdGNhc2UgTVNfTmV3TXV0YWJsZTpcblx0XHRcdFx0cmV0dXJuIG1zTmV3TXV0YWJsZVByb3BlcnR5KHQwKHRoaXMub2JqZWN0KSwgbmV3IExpdGVyYWwodGhpcy5uYW1lKSwgdDAodGhpcy52YWx1ZSkpXG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdH1cblx0fSxcblxuXHRNb2R1bGUoKSB7XG5cdFx0Y29uc3QgYm9keSA9IGNhdChcblx0XHRcdHRMaW5lcyh0aGlzLmxpbmVzKSxcblx0XHRcdG9wTWFwKHRoaXMub3BEZWZhdWx0RXhwb3J0LCBfID0+IG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIEV4cG9ydHNEZWZhdWx0LCB0MChfKSkpKVxuXHRcdHJldHVybiBuZXcgUHJvZ3JhbShjYXQoXG5cdFx0XHRvcElmKGNvbnRleHQub3B0cy5pbmNsdWRlVXNlU3RyaWN0KCksICgpID0+IFVzZVN0cmljdCksXG5cdFx0XHRvcElmKGNvbnRleHQub3B0cy5pbmNsdWRlQW1kZWZpbmUoKSwgKCkgPT4gQW1kZWZpbmVIZWFkZXIpLFxuXHRcdFx0dG9TdGF0ZW1lbnQoYW1kV3JhcE1vZHVsZSh0aGlzLmRvVXNlcywgdGhpcy51c2VzLmNvbmNhdCh0aGlzLmRlYnVnVXNlcyksIGJvZHkpKSkpXG5cdH0sXG5cblx0TmV3KCkge1xuXHRcdGNvbnN0IGFueVNwbGF0ID0gdGhpcy5hcmdzLnNvbWUoXyA9PiBfIGluc3RhbmNlb2YgU3BsYXQpXG5cdFx0Y29udGV4dC5jaGVjayghYW55U3BsYXQsIHRoaXMubG9jLCAnVE9ETzogU3BsYXQgcGFyYW1zIGZvciBuZXcnKVxuXHRcdHJldHVybiBuZXcgTmV3RXhwcmVzc2lvbih0MCh0aGlzLnR5cGUpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHROb3QoKSB7IHJldHVybiBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgdDAodGhpcy5hcmcpKSB9LFxuXG5cdE9iakVudHJ5QXNzaWduKCkge1xuXHRcdHJldHVybiAodGhpcy5hc3NpZ24gaW5zdGFuY2VvZiBBc3NpZ25TaW5nbGUgJiYgIXRoaXMuYXNzaWduLmFzc2lnbmVlLmlzTGF6eSgpKSA/XG5cdFx0XHR0MSh0aGlzLmFzc2lnbiwgdmFsID0+XG5cdFx0XHRcdG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlcihJZEJ1aWx0LCB0aGlzLmFzc2lnbi5hc3NpZ25lZS5uYW1lKSwgdmFsKSkgOlxuXHRcdFx0Y2F0KFxuXHRcdFx0XHR0MCh0aGlzLmFzc2lnbiksXG5cdFx0XHRcdHRoaXMuYXNzaWduLmFsbEFzc2lnbmVlcygpLm1hcChfID0+XG5cdFx0XHRcdFx0bXNTZXRMYXp5KElkQnVpbHQsIG5ldyBMaXRlcmFsKF8ubmFtZSksIGlkRm9yRGVjbGFyZUNhY2hlZChfKSkpKVxuXHR9LFxuXG5cdE9iakVudHJ5Q29tcHV0ZWQoKSB7XG5cdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsXG5cdFx0XHRuZXcgTWVtYmVyRXhwcmVzc2lvbihJZEJ1aWx0LCB0MCh0aGlzLmtleSkpLFxuXHRcdFx0dDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0T2JqU2ltcGxlKCkge1xuXHRcdHJldHVybiBuZXcgT2JqZWN0RXhwcmVzc2lvbih0aGlzLnBhaXJzLm1hcChwYWlyID0+XG5cdFx0XHRuZXcgUHJvcGVydHkoJ2luaXQnLCBwcm9wZXJ0eUlkT3JMaXRlcmFsQ2FjaGVkKHBhaXIua2V5KSwgdDAocGFpci52YWx1ZSkpKSlcblx0fSxcblxuXHRRdW90ZSgpIHtcblx0XHRpZiAodGhpcy5wYXJ0cy5sZW5ndGggPT09IDApXG5cdFx0XHRyZXR1cm4gTGl0RW1wdHlTdHJpbmdcblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IHF1YXNpcyA9IFsgXSwgZXhwcmVzc2lvbnMgPSBbIF1cblxuXHRcdFx0Ly8gVGVtcGxhdGVMaXRlcmFsIG11c3Qgc3RhcnQgd2l0aCBhIFRlbXBsYXRlRWxlbWVudFxuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLnBhcnRzWzBdICE9PSAnc3RyaW5nJylcblx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LkVtcHR5KVxuXG5cdFx0XHRmb3IgKGxldCBwYXJ0IG9mIHRoaXMucGFydHMpXG5cdFx0XHRcdGlmICh0eXBlb2YgcGFydCA9PT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmZvclJhd1N0cmluZyhwYXJ0KSlcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Ly8gXCJ7MX17MX1cIiBuZWVkcyBhbiBlbXB0eSBxdWFzaSBpbiB0aGUgbWlkZGxlIChhbmQgb24gdGhlIGVuZHMpXG5cdFx0XHRcdFx0aWYgKHF1YXNpcy5sZW5ndGggPT09IGV4cHJlc3Npb25zLmxlbmd0aClcblx0XHRcdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5FbXB0eSlcblx0XHRcdFx0XHRleHByZXNzaW9ucy5wdXNoKHQwKHBhcnQpKVxuXHRcdFx0XHR9XG5cblx0XHRcdC8vIFRlbXBsYXRlTGl0ZXJhbCBtdXN0IGVuZCB3aXRoIGEgVGVtcGxhdGVFbGVtZW50LCBzbyBvbmUgbW9yZSBxdWFzaSB0aGFuIGV4cHJlc3Npb24uXG5cdFx0XHRpZiAocXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoKVxuXHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuRW1wdHkpXG5cblx0XHRcdHJldHVybiBuZXcgVGVtcGxhdGVMaXRlcmFsKHF1YXNpcywgZXhwcmVzc2lvbnMpXG5cdFx0fVxuXHR9LFxuXG5cdFF1b3RlVGVtcGxhdGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBUYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb24odDAodGhpcy50YWcpLCB0MCh0aGlzLnF1b3RlKSlcblx0fSxcblxuXHRTcGVjaWFsRG8oKSB7XG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU0RfRGVidWdnZXI6IHJldHVybiBuZXcgRGVidWdnZXJTdGF0ZW1lbnQoKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHR9XG5cdH0sXG5cblx0U3BlY2lhbFZhbCgpIHtcblx0XHQvLyBNYWtlIG5ldyBvYmplY3RzIGJlY2F1c2Ugd2Ugd2lsbCBhc3NpZ24gYGxvY2AgdG8gdGhlbS5cblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTVl9Db250YWluczogcmV0dXJuIG1lbWJlcihJZE1zLCAnY29udGFpbnMnKVxuXHRcdFx0Y2FzZSBTVl9GYWxzZTogcmV0dXJuIG5ldyBMaXRlcmFsKGZhbHNlKVxuXHRcdFx0Y2FzZSBTVl9OYW1lOiByZXR1cm4gbmV3IExpdGVyYWwodmVyaWZ5UmVzdWx0cy5uYW1lKHRoaXMpKVxuXHRcdFx0Y2FzZSBTVl9OdWxsOiByZXR1cm4gbmV3IExpdGVyYWwobnVsbClcblx0XHRcdGNhc2UgU1ZfU3ViOiByZXR1cm4gbWVtYmVyKElkTXMsICdzdWInKVxuXHRcdFx0Y2FzZSBTVl9TdXBlcjogcmV0dXJuIG5ldyBJZGVudGlmaWVyKCdzdXBlcicpXG5cdFx0XHRjYXNlIFNWX1RydWU6IHJldHVybiBuZXcgTGl0ZXJhbCh0cnVlKVxuXHRcdFx0Y2FzZSBTVl9VbmRlZmluZWQ6IHJldHVybiBuZXcgVW5hcnlFeHByZXNzaW9uKCd2b2lkJywgTGl0WmVybylcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcih0aGlzLmtpbmQpXG5cdFx0fVxuXHR9LFxuXG5cdFNwbGF0KCkge1xuXHRcdHJldHVybiBuZXcgU3ByZWFkRWxlbWVudCh0MCh0aGlzLnNwbGF0dGVkKSlcblx0fSxcblxuXHRTd2l0Y2hEbygpIHsgcmV0dXJuIHRyYW5zcGlsZVN3aXRjaCh0aGlzKSB9LFxuXHRTd2l0Y2hWYWwoKSB7IHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFsgdHJhbnNwaWxlU3dpdGNoKHRoaXMpIF0pKSB9LFxuXHRTd2l0Y2hEb1BhcnQ6IHN3aXRjaFBhcnQsXG5cdFN3aXRjaFZhbFBhcnQ6IHN3aXRjaFBhcnQsXG5cblx0VGhyb3coKSB7XG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wVGhyb3duLFxuXHRcdFx0XyA9PiBkb1Rocm93KF8pLFxuXHRcdFx0KCkgPT4gbmV3IFRocm93U3RhdGVtZW50KG5ldyBOZXdFeHByZXNzaW9uKEdsb2JhbEVycm9yLCBbIExpdFN0clRocm93IF0pKSlcblx0fSxcblxuXHRXaXRoKCkge1xuXHRcdGNvbnN0IGlkRGVjbGFyZSA9IGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzLmRlY2xhcmUpXG5cdFx0Y29uc3QgYmxvY2sgPSB0Myh0aGlzLmJsb2NrLCBudWxsLCBudWxsLCBuZXcgUmV0dXJuU3RhdGVtZW50KGlkRGVjbGFyZSkpXG5cdFx0Y29uc3QgZnVuID0gaXNJbkdlbmVyYXRvciA/XG5cdFx0XHRuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFsgaWREZWNsYXJlIF0sIGJsb2NrLCB0cnVlKSA6XG5cdFx0XHRuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oWyBpZERlY2xhcmUgXSwgYmxvY2spXG5cdFx0Y29uc3QgY2FsbCA9IG5ldyBDYWxsRXhwcmVzc2lvbihmdW4sIFsgdDAodGhpcy52YWx1ZSkgXSlcblx0XHRyZXR1cm4gaXNJbkdlbmVyYXRvciA/IG5ldyBZaWVsZEV4cHJlc3Npb24oY2FsbCwgdHJ1ZSkgOiBjYWxsXG5cdH0sXG5cblx0WWllbGQoKSB7IHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKG9wTWFwKHRoaXMub3BZaWVsZGVkLCB0MCksIGZhbHNlKSB9LFxuXG5cdFlpZWxkVG8oKSB7IHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKHQwKHRoaXMueWllbGRlZFRvKSwgdHJ1ZSkgfVxufSlcblxuZnVuY3Rpb24gY2FzZVBhcnQoYWx0ZXJuYXRlKSB7XG5cdGlmICh0aGlzLnRlc3QgaW5zdGFuY2VvZiBQYXR0ZXJuKSB7XG5cdFx0Y29uc3QgeyB0eXBlLCBwYXR0ZXJuZWQsIGxvY2FscyB9ID0gdGhpcy50ZXN0XG5cdFx0Y29uc3QgZGVjbCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRFeHRyYWN0LCBtc0V4dHJhY3QodDAodHlwZSksIHQwKHBhdHRlcm5lZCkpKSBdKVxuXHRcdGNvbnN0IHRlc3QgPSBuZXcgQmluYXJ5RXhwcmVzc2lvbignIT09JywgSWRFeHRyYWN0LCBMaXROdWxsKVxuXHRcdGNvbnN0IGV4dHJhY3QgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBsb2NhbHMubWFwKChfLCBpZHgpID0+XG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKFxuXHRcdFx0XHRpZEZvckRlY2xhcmVDYWNoZWQoXyksXG5cdFx0XHRcdG5ldyBNZW1iZXJFeHByZXNzaW9uKElkRXh0cmFjdCwgbmV3IExpdGVyYWwoaWR4KSkpKSlcblx0XHRjb25zdCByZXMgPSB0MSh0aGlzLnJlc3VsdCwgZXh0cmFjdClcblx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KFsgZGVjbCwgbmV3IElmU3RhdGVtZW50KHRlc3QsIHJlcywgYWx0ZXJuYXRlKSBdKVxuXHR9IGVsc2Vcblx0XHQvLyBhbHRlcm5hdGUgd3JpdHRlbiB0byBieSBgY2FzZUJvZHlgLlxuXHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQodDAodGhpcy50ZXN0KSwgdDAodGhpcy5yZXN1bHQpLCBhbHRlcm5hdGUpXG59XG5cbmZ1bmN0aW9uIHN3aXRjaFBhcnQoKSB7XG5cdGNvbnN0IG9wT3V0ID0gb3BJZih0aGlzIGluc3RhbmNlb2YgU3dpdGNoRG9QYXJ0LCAoKSA9PiBuZXcgQnJlYWtTdGF0ZW1lbnQpXG5cdC8qXG5cdFdlIGNvdWxkIGp1c3QgcGFzcyBibG9jay5ib2R5IGZvciB0aGUgc3dpdGNoIGxpbmVzLCBidXQgaW5zdGVhZFxuXHRlbmNsb3NlIHRoZSBib2R5IG9mIHRoZSBzd2l0Y2ggY2FzZSBpbiBjdXJseSBicmFjZXMgdG8gZW5zdXJlIGEgbmV3IHNjb3BlLlxuXHRUaGF0IHdheSB0aGlzIGNvZGUgd29ya3M6XG5cdFx0c3dpdGNoICgwKSB7XG5cdFx0XHRjYXNlIDA6IHtcblx0XHRcdFx0Y29uc3QgYSA9IDBcblx0XHRcdFx0cmV0dXJuIGFcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0Ly8gV2l0aG91dCBjdXJseSBicmFjZXMgdGhpcyB3b3VsZCBjb25mbGljdCB3aXRoIHRoZSBvdGhlciBgYWAuXG5cdFx0XHRcdGNvbnN0IGEgPSAxXG5cdFx0XHRcdGFcblx0XHRcdH1cblx0XHR9XG5cdCovXG5cdGNvbnN0IGJsb2NrID0gdDModGhpcy5yZXN1bHQsIG51bGwsIG51bGwsIG9wT3V0KVxuXHQvLyBJZiBzd2l0Y2ggaGFzIG11bHRpcGxlIHZhbHVlcywgYnVpbGQgdXAgYSBzdGF0ZW1lbnQgbGlrZTogYGNhc2UgMTogY2FzZSAyOiB7IGRvQmxvY2soKSB9YFxuXHRjb25zdCB4ID0gWyBdXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy52YWx1ZXMubGVuZ3RoIC0gMTsgaSA9IGkgKyAxKVxuXHRcdC8vIFRoZXNlIGNhc2VzIGZhbGx0aHJvdWdoIHRvIHRoZSBvbmUgYXQgdGhlIGVuZC5cblx0XHR4LnB1c2gobmV3IFN3aXRjaENhc2UodDAodGhpcy52YWx1ZXNbaV0pLCBbIF0pKVxuXHR4LnB1c2gobmV3IFN3aXRjaENhc2UodDAodGhpcy52YWx1ZXNbdGhpcy52YWx1ZXMubGVuZ3RoIC0gMV0pLCBbIGJsb2NrIF0pKVxuXHRyZXR1cm4geFxufVxuXG4vLyBGdW5jdGlvbnMgc3BlY2lmaWMgdG8gY2VydGFpbiBleHByZXNzaW9ucy5cbmNvbnN0XG5cdC8vIFdyYXBzIGEgYmxvY2sgKHdpdGggYHJldHVybmAgc3RhdGVtZW50cyBpbiBpdCkgaW4gYW4gSUlGRS5cblx0YmxvY2tXcmFwID0gYmxvY2sgPT4ge1xuXHRcdGNvbnN0IGludm9rZSA9IG5ldyBDYWxsRXhwcmVzc2lvbihmdW5jdGlvbkV4cHJlc3Npb25UaHVuayhibG9jaywgaXNJbkdlbmVyYXRvciksIFsgXSlcblx0XHRyZXR1cm4gaXNJbkdlbmVyYXRvciA/IG5ldyBZaWVsZEV4cHJlc3Npb24oaW52b2tlLCB0cnVlKSA6IGludm9rZVxuXHR9LFxuXG5cdGNhc2VCb2R5ID0gKHBhcnRzLCBvcEVsc2UpID0+IHtcblx0XHRsZXQgYWNjID0gaWZFbHNlKG9wRWxzZSwgdDAsICgpID0+IFRocm93Tm9DYXNlTWF0Y2gpXG5cdFx0Zm9yIChsZXQgaSA9IHBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaSA9IGkgLSAxKVxuXHRcdFx0YWNjID0gdDEocGFydHNbaV0sIGFjYylcblx0XHRyZXR1cm4gYWNjXG5cdH0sXG5cblx0Zm9yTG9vcCA9IChvcEl0ZXJhdGVlLCBibG9jaykgPT5cblx0XHRpZkVsc2Uob3BJdGVyYXRlZSxcblx0XHRcdCh7IGVsZW1lbnQsIGJhZyB9KSA9PiB7XG5cdFx0XHRcdGNvbnN0IGRlY2xhcmUgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignbGV0Jyxcblx0XHRcdFx0XHRbIG5ldyBWYXJpYWJsZURlY2xhcmF0b3IodDAoZWxlbWVudCkpIF0pXG5cdFx0XHRcdHJldHVybiBuZXcgRm9yT2ZTdGF0ZW1lbnQoZGVjbGFyZSwgdDAoYmFnKSwgdDAoYmxvY2spKVxuXHRcdFx0fSxcblx0XHRcdCgpID0+IGZvclN0YXRlbWVudEluZmluaXRlKHQwKGJsb2NrKSkpLFxuXG5cdGNvbnN0cnVjdG9yRGVmaW5pdGlvbiA9IGZ1biA9PiB7XG5cdFx0aXNJbkNvbnN0cnVjdG9yID0gdHJ1ZVxuXHRcdGNvbnN0IHJlcyA9IG5ldyBNZXRob2REZWZpbml0aW9uKFxuXHRcdFx0bmV3IElkZW50aWZpZXIoJ2NvbnN0cnVjdG9yJyksIHQwKGZ1biksICdjb25zdHJ1Y3RvcicsIGZhbHNlLCBmYWxzZSlcblx0XHRpc0luQ29uc3RydWN0b3IgPSBmYWxzZVxuXHRcdHJldHVybiByZXNcblx0fSxcblxuXHRkb1Rocm93ID0gdGhyb3duID0+XG5cdFx0bmV3IFRocm93U3RhdGVtZW50KHRocm93biBpbnN0YW5jZW9mIFF1b3RlID9cblx0XHRcdG5ldyBOZXdFeHByZXNzaW9uKEdsb2JhbEVycm9yLCBbIHQwKHRocm93bikgXSkgOlxuXHRcdFx0dDAodGhyb3duKSksXG5cblx0dHJhbnNwaWxlQmxvY2sgPSAocmV0dXJuZWQsIGxpbmVzLCBsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KSA9PiB7XG5cdFx0Ly8gVE9ETzpFUzYgT3B0aW9uYWwgYXJndW1lbnRzXG5cdFx0aWYgKGxlYWQgPT09IHVuZGVmaW5lZCkgbGVhZCA9IG51bGxcblx0XHRpZiAob3BEZWNsYXJlUmVzID09PSB1bmRlZmluZWQpIG9wRGVjbGFyZVJlcyA9IG51bGxcblx0XHRpZiAob3BPdXQgPT09IHVuZGVmaW5lZCkgb3BPdXQgPSBudWxsXG5cdFx0Y29uc3QgZmluID0gaWZFbHNlKG9wRGVjbGFyZVJlcyxcblx0XHRcdHJkID0+IHtcblx0XHRcdFx0Y29uc3QgcmV0ID0gbWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHJldHVybmVkLCByZC5vcFR5cGUsIHJkLm5hbWUpXG5cdFx0XHRcdHJldHVybiBpZkVsc2Uob3BPdXQsXG5cdFx0XHRcdFx0XyA9PiBjYXQoZGVjbGFyZShyZCwgcmV0KSwgXywgUmV0dXJuUmVzKSxcblx0XHRcdFx0XHQoKSA9PiBuZXcgUmV0dXJuU3RhdGVtZW50KHJldCkpXG5cdFx0XHR9LFxuXHRcdFx0KCkgPT4gY2F0KG9wT3V0LCBuZXcgUmV0dXJuU3RhdGVtZW50KHJldHVybmVkKSkpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgbGluZXMsIGZpbikpXG5cdH0sXG5cblx0dHJhbnNwaWxlRXhjZXB0ID0gZXhjZXB0ID0+XG5cdFx0bmV3IFRyeVN0YXRlbWVudChcblx0XHRcdHQwKGV4Y2VwdC5fdHJ5KSxcblx0XHRcdG9wTWFwKGV4Y2VwdC5fY2F0Y2gsIHQwKSxcblx0XHRcdG9wTWFwKGV4Y2VwdC5fZmluYWxseSwgdDApKSxcblxuXHR0cmFuc3BpbGVTd2l0Y2ggPSBfID0+IHtcblx0XHRjb25zdCBwYXJ0cyA9IGZsYXRNYXAoXy5wYXJ0cywgdDApXG5cdFx0cGFydHMucHVzaChpZkVsc2UoXy5vcEVsc2UsXG5cdFx0XHRfID0+IG5ldyBTd2l0Y2hDYXNlKHVuZGVmaW5lZCwgdDAoXykuYm9keSksXG5cdFx0XHQoKSA9PiBTd2l0Y2hDYXNlTm9NYXRjaCkpXG5cdFx0cmV0dXJuIG5ldyBTd2l0Y2hTdGF0ZW1lbnQodDAoXy5zd2l0Y2hlZCksIHBhcnRzKVxuXHR9XG5cbmNvbnN0IElkQm9vdCA9IG5ldyBJZGVudGlmaWVyKCdfYm9vdCcpXG5cbi8vIE1vZHVsZSBoZWxwZXJzXG5jb25zdFxuXHRhbWRXcmFwTW9kdWxlID0gKGRvVXNlcywgb3RoZXJVc2VzLCBib2R5KSA9PiB7XG5cdFx0Y29uc3QgdXNlQm9vdCA9IGNvbnRleHQub3B0cy51c2VCb290KClcblxuXHRcdGNvbnN0IGFsbFVzZXMgPSBkb1VzZXMuY29uY2F0KG90aGVyVXNlcylcblx0XHRjb25zdCBhbGxVc2VQYXRocyA9IGFsbFVzZXMubWFwKF8gPT4gbWFuZ2xlUGF0aChfLnBhdGgpKVxuXG5cdFx0Y29uc3QgYXJyVXNlUGF0aHMgPSBuZXcgQXJyYXlFeHByZXNzaW9uKGNhdChcblx0XHRcdG9wSWYodXNlQm9vdCwgKCkgPT4gbmV3IExpdGVyYWwoY29udGV4dC5vcHRzLmJvb3RQYXRoKCkpKSxcblx0XHRcdExpdFN0ckV4cG9ydHMsXG5cdFx0XHRhbGxVc2VQYXRocy5tYXAoXyA9PiBuZXcgTGl0ZXJhbChfKSkpKVxuXG5cdFx0Y29uc3QgdXNlSWRlbnRpZmllcnMgPSBhbGxVc2VzLm1hcCgoXywgaSkgPT4gaWRDYWNoZWQoYCR7cGF0aEJhc2VOYW1lKF8ucGF0aCl9XyR7aX1gKSlcblxuXHRcdGNvbnN0IHVzZUFyZ3MgPSBjYXQob3BJZih1c2VCb290LCAoKSA9PiBJZEJvb3QpLCBJZEV4cG9ydHMsIHVzZUlkZW50aWZpZXJzKVxuXG5cdFx0Y29uc3QgZG9Cb290ID0gb3BJZih1c2VCb290LCAoKSA9PiBuZXcgRXhwcmVzc2lvblN0YXRlbWVudChtc0dldE1vZHVsZShJZEJvb3QpKSlcblxuXHRcdGNvbnN0IHVzZURvcyA9IGRvVXNlcy5tYXAoKHVzZSwgaSkgPT5cblx0XHRcdGxvYyhuZXcgRXhwcmVzc2lvblN0YXRlbWVudChtc0dldE1vZHVsZSh1c2VJZGVudGlmaWVyc1tpXSkpLCB1c2UubG9jKSlcblxuXHRcdGNvbnN0IG9wVXNlRGVjbGFyZSA9IG9wSWYoIWlzRW1wdHkob3RoZXJVc2VzKSxcblx0XHRcdCgpID0+IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIGZsYXRNYXAob3RoZXJVc2VzLCAodXNlLCBpKSA9PlxuXHRcdFx0XHR1c2VEZWNsYXJhdG9ycyh1c2UsIHVzZUlkZW50aWZpZXJzW2kgKyBkb1VzZXMubGVuZ3RoXSkpKSlcblxuXHRcdGNvbnN0IGZ1bGxCb2R5ID0gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChkb0Jvb3QsIHVzZURvcywgb3BVc2VEZWNsYXJlLCBib2R5LCBSZXR1cm5FeHBvcnRzKSlcblxuXHRcdGNvbnN0IGxhenlCb2R5ID1cblx0XHRcdGNvbnRleHQub3B0cy5sYXp5TW9kdWxlKCkgP1xuXHRcdFx0XHRuZXcgQmxvY2tTdGF0ZW1lbnQoWyBuZXcgRXhwcmVzc2lvblN0YXRlbWVudChcblx0XHRcdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBFeHBvcnRzR2V0LFxuXHRcdFx0XHRcdFx0bXNMYXp5KGZ1bmN0aW9uRXhwcmVzc2lvblRodW5rKGZ1bGxCb2R5KSkpKSBdKSA6XG5cdFx0XHRcdGZ1bGxCb2R5XG5cblx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKElkRGVmaW5lLFxuXHRcdFx0WyBhcnJVc2VQYXRocywgbmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKHVzZUFyZ3MsIGxhenlCb2R5KSBdKVxuXHR9LFxuXG5cdHBhdGhCYXNlTmFtZSA9IHBhdGggPT5cblx0XHRwYXRoLnN1YnN0cihwYXRoLmxhc3RJbmRleE9mKCcvJykgKyAxKSxcblxuXHR1c2VEZWNsYXJhdG9ycyA9ICh1c2UsIG1vZHVsZUlkZW50aWZpZXIpID0+IHtcblx0XHQvLyBUT0RPOiBDb3VsZCBiZSBuZWF0ZXIgYWJvdXQgdGhpc1xuXHRcdGNvbnN0IGlzTGF6eSA9IChpc0VtcHR5KHVzZS51c2VkKSA/IHVzZS5vcFVzZURlZmF1bHQgOiB1c2UudXNlZFswXSkuaXNMYXp5KClcblx0XHRjb25zdCB2YWx1ZSA9IChpc0xhenkgPyBtc0xhenlHZXRNb2R1bGUgOiBtc0dldE1vZHVsZSkobW9kdWxlSWRlbnRpZmllcilcblxuXHRcdGNvbnN0IHVzZWREZWZhdWx0ID0gb3BNYXAodXNlLm9wVXNlRGVmYXVsdCwgZGVmID0+IHtcblx0XHRcdGNvbnN0IGRlZmV4cCA9IG1zR2V0RGVmYXVsdEV4cG9ydChtb2R1bGVJZGVudGlmaWVyKVxuXHRcdFx0Y29uc3QgdmFsID0gaXNMYXp5ID8gbGF6eVdyYXAoZGVmZXhwKSA6IGRlZmV4cFxuXHRcdFx0cmV0dXJuIGxvYyhuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRm9yRGVjbGFyZUNhY2hlZChkZWYpLCB2YWwpLCBkZWYubG9jKVxuXHRcdH0pXG5cblx0XHRjb25zdCB1c2VkRGVzdHJ1Y3QgPSBpc0VtcHR5KHVzZS51c2VkKSA/IG51bGwgOlxuXHRcdFx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnModXNlLnVzZWQsIGlzTGF6eSwgdmFsdWUsIHRydWUsIGZhbHNlKVxuXG5cdFx0cmV0dXJuIGNhdCh1c2VkRGVmYXVsdCwgdXNlZERlc3RydWN0KVxuXHR9XG5cbi8vIEdlbmVyYWwgdXRpbHMuIE5vdCBpbiB1dGlsLmpzIGJlY2F1c2UgdGhlc2UgY2xvc2Ugb3ZlciBjb250ZXh0LlxuY29uc3Rcblx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMgPSAoYXNzaWduZWVzLCBpc0xhenksIHZhbHVlLCBpc01vZHVsZSwgaXNFeHBvcnQpID0+IHtcblx0XHRjb25zdCBkZXN0cnVjdHVyZWROYW1lID0gYF8kJHthc3NpZ25lZXNbMF0ubG9jLnN0YXJ0LmxpbmV9YFxuXHRcdGNvbnN0IGlkRGVzdHJ1Y3R1cmVkID0gbmV3IElkZW50aWZpZXIoZGVzdHJ1Y3R1cmVkTmFtZSlcblx0XHRjb25zdCBkZWNsYXJhdG9ycyA9IGFzc2lnbmVlcy5tYXAoYXNzaWduZWUgPT4ge1xuXHRcdFx0Ly8gVE9ETzogRG9uJ3QgY29tcGlsZSBpdCBpZiBpdCdzIG5ldmVyIGFjY2Vzc2VkXG5cdFx0XHRjb25zdCBnZXQgPSBnZXRNZW1iZXIoaWREZXN0cnVjdHVyZWQsIGFzc2lnbmVlLm5hbWUsIGlzTGF6eSwgaXNNb2R1bGUpXG5cdFx0XHRyZXR1cm4gbWFrZURlY2xhcmF0b3IoYXNzaWduZWUsIGdldCwgaXNMYXp5LCBpc0V4cG9ydClcblx0XHR9KVxuXHRcdC8vIEdldHRpbmcgbGF6eSBtb2R1bGUgaXMgZG9uZSBieSBtcy5sYXp5R2V0TW9kdWxlLlxuXHRcdGNvbnN0IHZhbCA9IChpc0xhenkgJiYgIWlzTW9kdWxlKSA/IGxhenlXcmFwKHZhbHVlKSA6IHZhbHVlXG5cdFx0cmV0dXJuIHVuc2hpZnQobmV3IFZhcmlhYmxlRGVjbGFyYXRvcihpZERlc3RydWN0dXJlZCwgdmFsKSwgZGVjbGFyYXRvcnMpXG5cdH0sXG5cblx0bWFrZURlY2xhcmF0b3IgPSAoYXNzaWduZWUsIHZhbHVlLCB2YWx1ZUlzQWxyZWFkeUxhenksIGlzRXhwb3J0KSA9PiB7XG5cdFx0Y29uc3QgeyBsb2MsIG5hbWUsIG9wVHlwZSB9ID0gYXNzaWduZWVcblx0XHRjb25zdCBpc0xhenkgPSBhc3NpZ25lZS5pc0xhenkoKVxuXHRcdC8vIFRPRE86IGFzc2VydChhc3NpZ25lZS5vcFR5cGUgPT09IG51bGwpXG5cdFx0Ly8gb3IgVE9ETzogQWxsb3cgdHlwZSBjaGVjayBvbiBsYXp5IHZhbHVlP1xuXHRcdHZhbHVlID0gaXNMYXp5ID8gdmFsdWUgOiBtYXliZVdyYXBJbkNoZWNrQ29udGFpbnModmFsdWUsIG9wVHlwZSwgbmFtZSlcblx0XHRpZiAoaXNFeHBvcnQpIHtcblx0XHRcdC8vIFRPRE86RVM2XG5cdFx0XHRjb250ZXh0LmNoZWNrKCFpc0xhenksIGxvYywgJ0xhenkgZXhwb3J0IG5vdCBzdXBwb3J0ZWQuJylcblx0XHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdG9yKFxuXHRcdFx0XHRpZEZvckRlY2xhcmVDYWNoZWQoYXNzaWduZWUpLFxuXHRcdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRFeHBvcnRzLCBuYW1lKSwgdmFsdWUpKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCB2YWwgPSBpc0xhenkgJiYgIXZhbHVlSXNBbHJlYWR5TGF6eSA/IGxhenlXcmFwKHZhbHVlKSA6IHZhbHVlXG5cdFx0XHRhc3NlcnQoaXNMYXp5IHx8ICF2YWx1ZUlzQWxyZWFkeUxhenkpXG5cdFx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRvcihpZEZvckRlY2xhcmVDYWNoZWQoYXNzaWduZWUpLCB2YWwpXG5cdFx0fVxuXHR9LFxuXG5cdG1heWJlV3JhcEluQ2hlY2tDb250YWlucyA9IChhc3QsIG9wVHlwZSwgbmFtZSkgPT5cblx0XHQoY29udGV4dC5vcHRzLmluY2x1ZGVDaGVja3MoKSAmJiBvcFR5cGUgIT09IG51bGwpID9cblx0XHRcdG1zQ2hlY2tDb250YWlucyh0MChvcFR5cGUpLCBhc3QsIG5ldyBMaXRlcmFsKG5hbWUpKSA6XG5cdFx0XHRhc3QsXG5cblx0Z2V0TWVtYmVyID0gKGFzdE9iamVjdCwgZ290TmFtZSwgaXNMYXp5LCBpc01vZHVsZSkgPT5cblx0XHRpc0xhenkgP1xuXHRcdG1zTGF6eUdldChhc3RPYmplY3QsIG5ldyBMaXRlcmFsKGdvdE5hbWUpKSA6XG5cdFx0aXNNb2R1bGUgJiYgY29udGV4dC5vcHRzLmluY2x1ZGVDaGVja3MoKSA/XG5cdFx0bXNHZXQoYXN0T2JqZWN0LCBuZXcgTGl0ZXJhbChnb3ROYW1lKSkgOlxuXHRcdG1lbWJlcihhc3RPYmplY3QsIGdvdE5hbWUpXG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==
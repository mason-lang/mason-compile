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

			return (0, _util.ifElse)(this.opThrown, thrown => new _esastDistAst.IfStatement(failCond(), new _esastDistAst.ThrowStatement((0, _msCall.msError)(t0(thrown)))), () => {
				if (this.condition instanceof _MsAst.Call) {
					const call = this.condition;
					const ass = this.negate ? _msCall.msAssertNot : _msCall.msAssert;
					return ass(t0(call.called), ...call.args.map(t0));
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
			const methods = (0, _util.cat)(this.statics.map(methodDefinition(true)), (0, _util.opMap)(this.opConstructor, constructorDefinition), this.methods.map(methodDefinition(false)));
			const opName = (0, _util.opMap)(this.opName, _esastDistUtil.idCached);
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
			const id = (0, _util.opMap)(this.opName, _esastDistUtil.idCached);

			const canUseArrowFunction = id === null && this.opDeclareThis === null && opDeclareRest === null && !this.isGenerator;
			return canUseArrowFunction ? new _esastDistAst.ArrowFunctionExpression(args, body) : new _esastDistAst.FunctionExpression(id, args, body, this.isGenerator);
		},

		Lazy() {
			return (0, _msCall.lazyWrap)(t0(this.value));
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

		ObjEntry() {
			return this.assign instanceof _MsAst.AssignSingle && !this.assign.assignee.isLazy() ? t1(this.assign, val => new _esastDistAst.AssignmentExpression('=', (0, _esastDistUtil.member)(_astConstants.IdBuilt, this.assign.assignee.name), val)) : (0, _util.cat)(t0(this.assign), this.assign.allAssignees().map(_ => (0, _msCall.msSetLazy)(_astConstants.IdBuilt, new _esastDistAst.Literal(_.name), (0, _util2.idForDeclareCached)(_))));
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

				for (let part of this.parts) if (typeof part === 'string') quasis.push(_esastDistAst.TemplateElement.forString(part));else {
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
				case _MsAst.SV_Null:
					return new _esastDistAst.Literal(null);
				case _MsAst.SV_Sub:
					return (0, _esastDistUtil.member)(_msCall.IdMs, 'sub');
				case _MsAst.SV_Super:
					return new _esastDistAst.Identifier('super');
				case _MsAst.SV_ThisModuleDirectory:
					return new _esastDistAst.Identifier('__dirname');
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
			return (0, _util.ifElse)(this.opThrown, _ => new _esastDistAst.ThrowStatement((0, _msCall.msError)(t0(_))), () => new _esastDistAst.ThrowStatement((0, _msCall.msError)(_astConstants.LitStrThrow)));
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
		const block = t3(this.result, null, null, opOut);
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
		return new _esastDistAst.SwitchCase(t0(this.value), [block]);
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
	      methodDefinition = isStatic => method => {
		if (method instanceof _MsAst.Fun) {
			(0, _util.assert)(method.opName !== null);
			const key = (0, _esastDistUtil.propertyIdOrLiteralCached)(method.opName);
			const value = t0(method);
			value.id = null;
			const computed = false;
			return new _esastDistAst.MethodDefinition(key, value, 'method', isStatic, computed);
		} else {
			(0, _util.assert)(method instanceof _MsAst.MethodImpl);
			const fun = method.fun;
			(0, _util.assert)(fun.opName === null);
			const key = (0, _msCall.msSymbol)(t0(method.symbol));
			const value = t0(fun);
			// This is handled by `key`.
			value.id = null;
			// TODO: get/set!
			const computed = true;
			return new _esastDistAst.MethodDefinition(key, value, 'method', isStatic, computed);
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
		const parts = _.parts.map(t0);

		parts.push((0, _util.ifElse)(_.opElse, _ => new _esastDistAst.SwitchCase(undefined, t0(_).body), () => _astConstants.SwitchCaseNoMatch));

		return new _esastDistAst.SwitchStatement(t0(_.switched), parts);
	};

	// Module helpers
	const amdWrapModule = (doUses, otherUses, body) => {
		const allUses = doUses.concat(otherUses);
		const usePaths = new _esastDistAst.ArrayExpression((0, _util.cat)(_astConstants.LitStrExports, allUses.map(_ => new _esastDistAst.Literal((0, _manglePath2.default)(_.path)))));
		const useIdentifiers = allUses.map((_, i) => (0, _esastDistUtil.idCached)(`${ pathBaseName(_.path) }_${ i }`));
		const useArgs = (0, _util.cat)(_astConstants.IdExports, useIdentifiers);
		const useDos = doUses.map((use, i) => (0, _esastDistUtil.loc)(new _esastDistAst.ExpressionStatement((0, _msCall.msGetModule)(useIdentifiers[i])), use.loc));
		const opUseDeclare = (0, _util.opIf)(!(0, _util.isEmpty)(otherUses), () => new _esastDistAst.VariableDeclaration('const', (0, _util.flatMap)(otherUses, (use, i) => useDeclarators(use, useIdentifiers[i + doUses.length]))));
		const fullBody = new _esastDistAst.BlockStatement((0, _util.cat)(useDos, opUseDeclare, body, _astConstants.ReturnExports));
		const lazyBody = context.opts.lazyModule() ? new _esastDistAst.BlockStatement([new _esastDistAst.ExpressionStatement(new _esastDistAst.AssignmentExpression('=', _astConstants.ExportsGet, (0, _msCall.msLazy)((0, _esastDistUtil.functionExpressionThunk)(fullBody))))]) : fullBody;
		return new _esastDistAst.CallExpression(_astConstants.IdDefine, [usePaths, new _esastDistAst.ArrowFunctionExpression(useArgs, lazyBody)]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zcGlsZS5qcyIsInByaXZhdGUvdHJhbnNwaWxlL3RyYW5zcGlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7QUM2QkEsS0FBSSxPQUFPLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxlQUFlLENBQUE7O21CQUUzQyxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLEtBQUs7QUFDOUQsU0FBTyxHQUFHLFFBQVEsQ0FBQTtBQUNsQixlQUFhLEdBQUcsY0FBYyxDQUFBO0FBQzlCLGVBQWEsR0FBRyxLQUFLLENBQUE7QUFDckIsaUJBQWUsR0FBRyxLQUFLLENBQUE7QUFDdkIsUUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUE7O0FBRWhDLFNBQU8sR0FBRyxhQUFhLEdBQUcsU0FBUyxDQUFBO0FBQ25DLFNBQU8sR0FBRyxDQUFBO0VBQ1Y7O0FBRU0sT0FDTixFQUFFLEdBQUcsSUFBSSxJQUFJLG1CQW5DOEIsR0FBRyxFQW1DN0IsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFDN0MsT0FDQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxLQUFLLG1CQXJDdUIsR0FBRyxFQXFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDO09BQ3RELEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksS0FBSyxtQkF0Q1csR0FBRyxFQXNDVixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQztPQUM5RSxNQUFNLEdBQUcsS0FBSyxJQUFJO0FBQ2pCLFFBQU0sR0FBRyxHQUFHLEVBQUcsQ0FBQTtBQUNmLE9BQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO0FBQ3pCLFNBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUM1QixPQUFJLEdBQUcsWUFBWSxLQUFLOztBQUV2QixTQUFLLE1BQU0sQ0FBQyxJQUFJLEdBQUcsRUFDbEIsR0FBRyxDQUFDLElBQUksQ0FBQyxtQkE5Q3NFLFdBQVcsRUE4Q3JFLENBQUMsQ0FBQyxDQUFDLENBQUEsS0FFekIsR0FBRyxDQUFDLElBQUksQ0FBQyxtQkFoRCtCLEdBQUcsRUFnRDlCLG1CQWhEbUUsV0FBVyxFQWdEbEUsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7R0FDMUM7QUFDRCxTQUFPLEdBQUcsQ0FBQTtFQUNWLENBQUE7O0FBRUYsV0E3Q0MsYUFBYSxVQTZDWSxXQUFXLEVBQUU7QUFDdEMsUUFBTSxHQUFHO0FBQ1IsU0FBTSxRQUFRLEdBQUcsTUFBTTtBQUN0QixVQUFNLElBQUksR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQy9CLFdBQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsa0JBMUQ5QixlQUFlLENBMERtQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDMUQsQ0FBQTs7QUFFRCxVQUFPLFVBckRpQyxNQUFNLEVBcURoQyxJQUFJLENBQUMsUUFBUSxFQUMxQixNQUFNLElBQUksa0JBbEVvQixXQUFXLENBa0VmLFFBQVEsRUFBRSxFQUFDLGtCQS9ETixjQUFjLENBK0RZLFlBOUMxQyxPQUFPLEVBOEMyQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQzlFLE1BQU07QUFDTCxRQUFJLElBQUksQ0FBQyxTQUFTLG1CQTNEQyxJQUFJLEFBMkRXLEVBQUU7QUFDbkMsV0FBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQTtBQUMzQixXQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxXQW5EeUIsV0FBVyxXQUFyQixRQUFRLEFBbURFLENBQUE7QUFDaEQsWUFBTyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7S0FDakQsTUFDQSxPQUFPLGtCQXpFcUIsV0FBVyxDQXlFaEIsUUFBUSxFQUFFLGdCQXhEcUIsZUFBZSxDQXdEbEIsQ0FBQTtJQUNwRCxDQUFDLENBQUE7R0FDSDs7QUFFRCxjQUFZLENBQUMsT0FBTyxFQUFFO0FBQ3JCLFNBQU0sR0FBRyxHQUFHLE9BQU8sS0FBSyxTQUFTLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQzVFLFNBQU0sT0FBTyxHQUNaLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsYUFBYSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0FBQzlFLFVBQU8sa0JBOUV1RCxtQkFBbUIsQ0E4RWxELElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLEdBQUcsS0FBSyxHQUFHLE9BQU8sRUFBRSxDQUFFLE9BQU8sQ0FBRSxDQUFDLENBQUE7R0FDeEY7O0FBRUQsbUJBQWlCLEdBQUc7QUFDbkIsVUFBTyxrQkFsRnVELG1CQUFtQixDQWtGbEQsSUFBSSxDQUFDLElBQUksRUFBRSxZQTVFWSxVQUFVLEFBNEVQLEdBQUcsS0FBSyxHQUFHLE9BQU8sRUFDMUUsMEJBQTBCLENBQ3pCLElBQUksQ0FBQyxTQUFTLEVBQ2QsSUFBSSxDQUFDLElBQUksRUFBRSxZQS9FZ0MsT0FBTyxBQStFM0IsRUFDdkIsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFDZCxLQUFLLEVBQ0wsYUFBYSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FDdEM7O0FBRUQsVUFBUSxHQUFHO0FBQUUsVUFBTyxZQTNFSSxLQUFLLGdCQUpZLE9BQU8sRUErRWIsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0dBQUU7O0FBRXBELGNBQVksR0FBRztBQUFFLFVBQU8sWUE3RU8sU0FBUyxnQkFKQyxPQUFPLEVBaUZMLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtHQUFFOztBQUU1RCxXQUFTLEdBQUc7QUFBRSxVQUFPLGtCQXJHYixlQUFlLENBcUdrQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0dBQUU7O0FBRTlELFNBQU8sQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRTs7QUFFbEMsT0FBSSxJQUFJLEtBQUssU0FBUyxFQUFFLElBQUksR0FBRyxJQUFJLENBQUE7QUFDbkMsT0FBSSxZQUFZLEtBQUssU0FBUyxFQUFFLFlBQVksR0FBRyxJQUFJLENBQUE7QUFDbkQsT0FBSSxLQUFLLEtBQUssU0FBUyxFQUFFLEtBQUssR0FBRyxJQUFJLENBQUE7QUFDckMsYUE3Rk8sTUFBTSxFQTZGTixZQUFZLEtBQUssSUFBSSxDQUFDLENBQUE7QUFDN0IsVUFBTyxrQkE1R1IsY0FBYyxDQTRHYSxVQTlGWCxHQUFHLEVBOEZZLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUE7R0FDL0Q7O0FBRUQsZUFBYSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFOztBQUV4QyxPQUFJLElBQUksS0FBSyxTQUFTLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNuQyxPQUFJLFlBQVksS0FBSyxTQUFTLEVBQUUsWUFBWSxHQUFHLElBQUksQ0FBQTtBQUNuRCxPQUFJLEtBQUssS0FBSyxTQUFTLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQTtBQUNyQyxVQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxFQUMvRCx5Q0FBeUMsQ0FBQyxDQUFBO0FBQzNDLFVBQU8sa0JBdEhSLGNBQWMsQ0FzSGEsVUF4R1gsR0FBRyxFQXdHWSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUN4RTs7QUFFRCxpQkFBZSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFO0FBQzFDLFVBQU8sY0FBYyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFBO0dBQ3ZGOztBQUVELFVBQVEsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRTtBQUNuQyxVQUFPLGNBQWMsZUE3R21CLE9BQU8sRUErRzlDLFVBbEhjLEdBQUcsZ0JBRXFCLGVBQWUsRUFnSGhDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFDeEMsSUFBSSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQTtHQUMzQjs7QUFFRCxVQUFRLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUU7QUFDbkMsU0FBTSxLQUFLLEdBQUcsVUF2SEMsR0FBRyxnQkFFdUQsZUFBZSxFQXFIckQsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQ3RELFNBQU0sR0FBRyxHQUFHLFVBeEg0QixNQUFNLEVBd0gzQixJQUFJLENBQUMsT0FBTyxFQUM5QixLQUFLLElBQUksVUF6SDhCLE1BQU0sRUF5SDdCLElBQUksQ0FBQyxNQUFNLEVBQzFCLElBQUksSUFBSSxZQWpIMkMsS0FBSyxFQWlIMUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxnQkF2SGUsT0FBTyxFQXVIWCxrQkF0SVEsT0FBTyxDQXNJSCxJQUFJLENBQUMsQ0FBQyxFQUNwRCxNQUFNLFlBbEg2QyxLQUFLLEVBa0g1QyxFQUFFLENBQUMsS0FBSyxDQUFDLGdCQXhIaUIsT0FBTyxDQXdIZCxDQUFDLEVBQ2pDLE1BQU0sVUE1SGlDLE1BQU0sRUE0SGhDLElBQUksQ0FBQyxNQUFNLEVBQ3ZCLENBQUMsSUFBSSxZQXBIcUQsU0FBUyxnQkFON0IsT0FBTyxFQTBIckIsa0JBeklrQixPQUFPLENBeUliLENBQUMsQ0FBQyxDQUFDLEVBQ3ZDLG9CQTNIc0MsT0FBTyxBQTJIaEMsQ0FBQyxDQUFDLENBQUE7QUFDakIsVUFBTyxjQUFjLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFBO0dBQzVEOztBQUVELFVBQVEsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRTtBQUNuQyxVQUFPLGNBQWMsZUFoSW1CLE9BQU8sRUFrSTlDLFVBckljLEdBQUcsZ0JBRXNDLGVBQWUsRUFtSWpELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFDeEMsSUFBSSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQTtHQUMzQjs7QUFFRCxXQUFTLEdBQUc7QUFBRSxVQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7R0FBRTs7QUFFaEQsT0FBSyxHQUFHO0FBQUUsVUFBTyxrQkF6SkQsY0FBYyxFQXlKTyxDQUFBO0dBQUU7O0FBRXZDLGNBQVksR0FBRztBQUFFLFVBQU8sa0JBeEo4QyxlQUFlLENBd0p6QyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7R0FBRTs7QUFFN0QsTUFBSSxHQUFHO0FBQ04sVUFBTyxrQkE5SndCLGNBQWMsQ0E4Sm5CLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtHQUM3RDs7QUFFRCxRQUFNLEdBQUc7QUFDUixTQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDOUMsVUFBTyxVQXJKaUMsTUFBTSxFQXFKaEMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksa0JBbktsQyxjQUFjLENBbUt1QyxDQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUUsQ0FBQyxFQUFFLE1BQU0sSUFBSSxDQUFDLENBQUE7R0FDakY7QUFDRCxTQUFPLEdBQUc7QUFDVCxTQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDOUMsU0FBTSxLQUFLLEdBQUcsVUF6SjBCLE1BQU0sRUF5SnpCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBRSxFQUFFLE1BQU0sQ0FBRSxJQUFJLENBQUUsQ0FBQyxDQUFBO0FBQ3hFLFVBQU8sU0FBUyxDQUFDLGtCQXhLbEIsY0FBYyxDQXdLdUIsS0FBSyxDQUFDLENBQUMsQ0FBQTtHQUMzQztBQUNELFlBQVUsRUFBRSxRQUFRO0FBQ3BCLGFBQVcsRUFBRSxRQUFROztBQUVyQixPQUFLLEdBQUc7QUFDUCxTQUFNLE9BQU8sR0FBRyxVQWhLRCxHQUFHLEVBaUtqQixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUN4QyxVQWpLK0IsS0FBSyxFQWlLOUIsSUFBSSxDQUFDLGFBQWEsRUFBRSxxQkFBcUIsQ0FBQyxFQUNoRCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDM0MsU0FBTSxNQUFNLEdBQUcsVUFuS2lCLEtBQUssRUFtS2hCLElBQUksQ0FBQyxNQUFNLGlCQTNLQSxRQUFRLENBMktHLENBQUE7QUFDM0MsU0FBTSxTQUFTLEdBQUcsa0JBbkxxRCxlQUFlLENBb0xyRixNQUFNLEVBQ04sVUF0SytCLEtBQUssRUFzSzlCLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLEVBQUUsa0JBckw2QixTQUFTLENBcUx4QixPQUFPLENBQUMsQ0FBQyxDQUFBOztBQUV0RCxVQUFPLFVBektpQyxNQUFNLEVBeUtoQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxFQUFFLE1BQU0sU0FBUyxDQUFDLENBQUE7R0FDaEU7O0FBRUQsU0FBTyxDQUFDLFNBQVMsRUFBRTtBQUNsQixTQUFNLElBQUksR0FBRyxrQkF0TGlELG1CQUFtQixDQXNMNUMsT0FBTyxFQUFFLENBQzdDLGtCQXRMZSxrQkFBa0IsQ0FzTFYsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBRSxDQUFDLENBQUE7QUFDNUQsU0FBTSxHQUFHLEdBQUcsa0JBMUx5RCxlQUFlLENBMExwRCxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUE7QUFDdEQsU0FBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUM3QyxVQUFPLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtHQUN2Qjs7QUFFRCxlQUFhLEdBQUc7QUFDZixTQUFNLElBQUksR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzFCLFVBQU8sa0JBbE13QixXQUFXLENBbU16QyxJQUFJLENBQUMsUUFBUSxHQUFHLGtCQS9MbEIsZUFBZSxDQStMdUIsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLElBQUksRUFDckQsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO0dBQ2pCOztBQUVELGdCQUFjLEdBQUc7QUFDaEIsU0FBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUMxQixTQUFNLE1BQU0sR0FBRyxZQXBMbUUsTUFBTSxFQW9MbEUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2pELFVBQU8sSUFBSSxDQUFDLFFBQVEsR0FDbkIsa0JBNU1GLHFCQUFxQixDQTRNTyxJQUFJLFVBckx0QixNQUFNLEVBcUwwQixNQUFNLENBQUMsR0FDL0Msa0JBN01GLHFCQUFxQixDQTZNTyxJQUFJLEVBQUUsTUFBTSxVQXRMOUIsTUFBTSxDQXNMaUMsQ0FBQTtHQUNoRDs7QUFFRCxPQUFLLEdBQUc7QUFDUCxVQUFPLGtCQWxOd0MsV0FBVyxDQWtObkMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7R0FDdkQ7O0FBRUQsT0FBSyxHQUFHO0FBQUUsVUFBTyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRyxDQUFBO0dBQUU7O0FBRTFFLFVBQVEsR0FBRztBQUFFLFVBQU8sZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQUU7QUFDM0MsV0FBUyxHQUFHO0FBQUUsVUFBTyxTQUFTLENBQUMsa0JBeE4vQixjQUFjLENBd05vQyxDQUFFLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBRSxDQUFDLENBQUMsQ0FBQTtHQUFFOztBQUUvRSxPQUFLLEdBQUc7QUFBRSxVQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtHQUFFOztBQUV2RCxRQUFNLEdBQUc7QUFDUixVQUFPLFNBQVMsQ0FBQyxrQkE3TmxCLGNBQWMsQ0E2TnVCLGVBN01HLGVBQWUsRUErTXJELE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBNU10QyxXQUFXLENBOE1ULENBQUMsQ0FBQyxDQUFBO0dBQ0g7O0FBRUQsUUFBTSxHQUFHO0FBQ1IsVUFBTyxTQUFTLENBQUMsa0JBck9sQixjQUFjLENBcU91QixDQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBRSxDQUFDLENBQUMsQ0FBQTtHQUM5RTs7QUFFRCxLQUFHLEdBQUc7QUFDTCxTQUFNLGNBQWMsR0FBRyxhQUFhLENBQUE7QUFDcEMsZ0JBQWEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFBOzs7QUFHaEMsU0FBTSxLQUFLLEdBQUcsa0JBM084QixPQUFPLENBMk96QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzNDLFNBQU0sYUFBYSxHQUFHLFVBL05VLEtBQUssRUErTlQsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLElBQy9DLFdBdE4wQixPQUFPLEVBc056QixJQUFJLEVBQUUsa0JBL09nQixjQUFjLGVBZ0J0QixjQUFjLEVBK05hLGVBOU52QixXQUFXLEVBOE4wQixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN6RSxTQUFNLFNBQVMsR0FBRyxVQWpPUSxJQUFJLEVBaU9QLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsTUFDcEQsVUFuTzRCLFNBQVMsRUFtTzNCLElBQUksQ0FBQyxJQUFJLFNBdk5yQiwwQkFBMEIsQ0F1TndCLENBQUMsQ0FBQTs7QUFFbEQsU0FBTSxHQUFHLEdBQUcsVUFwT29CLEtBQUssRUFvT25CLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUE7O0FBRWhDLFNBQU0sYUFBYSxHQUFHLFVBdE9JLElBQUksRUFzT0gsQ0FBQyxlQUFlLEVBQUUsTUFBTSxVQXRPbkIsS0FBSyxFQXNPb0IsSUFBSSxDQUFDLGFBQWEsRUFBRSxNQUM1RSxrQkFqUDZELG1CQUFtQixDQWlQeEQsT0FBTyxFQUM5QixDQUFFLGtCQWpQWSxrQkFBa0IsZUFZeEIsYUFBYSxFQXFPbUIsa0JBbFAxQixjQUFjLEVBa1BnQyxDQUFDLENBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTs7QUFFcEUsU0FBTSxJQUFJLEdBQUcsVUEzT0UsR0FBRyxFQTJPRCxhQUFhLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQTs7QUFFOUQsU0FBTSxJQUFJLEdBQUcsVUE1T21CLEtBQUssRUE0T2xCLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDbEMsU0FBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDMUQsU0FBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDOUIsZ0JBQWEsR0FBRyxjQUFjLENBQUE7QUFDOUIsU0FBTSxFQUFFLEdBQUcsVUFoUHFCLEtBQUssRUFnUHBCLElBQUksQ0FBQyxNQUFNLGlCQXhQSSxRQUFRLENBd1BELENBQUE7O0FBRXZDLFNBQU0sbUJBQW1CLEdBQ3hCLEVBQUUsS0FBSyxJQUFJLElBQ1gsSUFBSSxDQUFDLGFBQWEsS0FBSyxJQUFJLElBQzNCLGFBQWEsS0FBSyxJQUFJLElBQ3RCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQTtBQUNsQixVQUFPLG1CQUFtQixHQUN6QixrQkF4UXVCLHVCQUF1QixDQXdRbEIsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUN2QyxrQkF0UUYsa0JBQWtCLENBc1FPLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtHQUN6RDs7QUFFRCxNQUFJLEdBQUc7QUFBRSxVQUFPLFlBdFBGLFFBQVEsRUFzUEcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0dBQUU7O0FBRTFDLGVBQWEsR0FBRzs7O0FBR2YsU0FBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUNoQyxTQUFNLEdBQUcsR0FBRyxrQkEvUWdDLE9BQU8sQ0ErUTNCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtBQUN4QyxVQUFPLFVBblFPLFVBQVUsRUFtUU4sS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLGtCQTVRbEMsZUFBZSxDQTRRdUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0dBQzlEOztBQUVELGNBQVksR0FBRztBQUFFLFVBQU8sa0JBblJKLFVBQVUsQ0FtUlMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQUU7O0FBRW5ELGFBQVcsR0FBRztBQUNiLFVBQU8sSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLEdBQ3pCLGVBQWUsR0FBRyxrQkFwUkosY0FBYyxFQW9SVSxpQkF2UTlCLGFBQWEsQUF1UWlDLEdBQ3ZELFdBalFNLGtCQUFrQixFQWlRTCxhQUFhLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtHQUM5RDs7QUFFRCxjQUFZLEdBQUc7QUFBRSxVQUFPLGtCQTNSSixVQUFVLENBMlJTLFdBcFFvQixrQkFBa0IsRUFvUW5CLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQUU7O0FBRXZFLGFBQVcsR0FBRztBQUNiLFVBQU8sa0JBalMwQyxvQkFBb0IsQ0FpU3JDLEdBQUcsRUFBRSxtQkF6UkwsUUFBUSxFQXlSTSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0dBQ3pFOztBQUVELE9BQUssR0FBRztBQUNQLGFBdFJPLE1BQU0sRUFzUk4sSUFBSSxDQUFDLElBQUksWUF6UmdCLEtBQUssQUF5UlgsSUFBSSxJQUFJLENBQUMsSUFBSSxZQXpSQSxJQUFJLEFBeVJLLENBQUMsQ0FBQTtBQUNqRCxTQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxZQTFSWSxLQUFLLEFBMFJQLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUM1QyxVQUFPLFVBdlJnQyxJQUFJLEVBdVIvQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FDbEMsa0JBclNvRCxpQkFBaUIsQ0FxUy9DLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQ3ZEOztBQUVELFVBQVEsR0FBRztBQUFFLFVBQU8sWUFyUjZDLE9BQU8sZ0JBSi9CLE9BQU8sRUF5UlgsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7R0FBRTs7QUFFbEUsUUFBTSxHQUFHO0FBQUUsVUFBTyxtQkFyUzhCLE1BQU0sRUFxUzdCLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQUU7O0FBRXRELFdBQVMsR0FBRztBQUNYLFdBQVEsSUFBSSxDQUFDLElBQUk7QUFDaEIsZ0JBclM2RSxTQUFTO0FBc1NyRixZQUFPLGtCQWxUd0Msb0JBQW9CLENBa1RuQyxHQUFHLEVBQ2xDLG1CQTNTNEMsTUFBTSxFQTJTM0MsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQ2xDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtBQUFBLEFBQ2pCLGdCQXpTd0YsTUFBTTtBQTBTN0YsWUFBTyxZQTlSNkIsYUFBYSxFQThSNUIsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxrQkFuVEksT0FBTyxDQW1UQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQUEsQUFDOUUsZ0JBMVNGLGFBQWE7QUEyU1YsWUFBTyxZQWhTTyxvQkFBb0IsRUFnU04sRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxrQkFyVEgsT0FBTyxDQXFUUSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQUEsQUFDckY7QUFBUyxXQUFNLElBQUksS0FBSyxFQUFFLENBQUE7QUFBQSxJQUMxQjtHQUNEOztBQUVELFFBQU0sR0FBRztBQUNSLFNBQU0sSUFBSSxHQUFHLFVBL1NFLEdBQUcsRUFnVGpCLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQ2xCLFVBaFQrQixLQUFLLEVBZ1Q5QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsSUFBSSxrQkFoVWUsb0JBQW9CLENBZ1VWLEdBQUcsZ0JBOVMvRCxjQUFjLEVBOFNtRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDeEYsVUFBTyxrQkE3VDJDLE9BQU8sQ0E2VHRDLFVBbFRKLEdBQUcsRUFtVGpCLFVBbFR5QixJQUFJLEVBa1R4QixPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsb0JBN1N4QyxTQUFTLEFBNlM4QyxDQUFDLEVBQ3RELFVBblR5QixJQUFJLEVBbVR4QixPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFLG9CQWxUL0IsY0FBYyxBQWtUcUMsQ0FBQyxFQUMxRCxtQkE1VGlGLFdBQVcsRUE0VGhGLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUNsRjs7QUFFRCxLQUFHLEdBQUc7QUFDTCxTQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxtQkEzVGYsS0FBSyxBQTJUMkIsQ0FBQyxDQUFBO0FBQ3hELFVBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSw0QkFBNEIsQ0FBQyxDQUFBO0FBQ2hFLFVBQU8sa0JBdFVVLGFBQWEsQ0FzVUwsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0dBQzFEOztBQUVELEtBQUcsR0FBRztBQUFFLFVBQU8sa0JBdFVmLGVBQWUsQ0FzVW9CLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7R0FBRTs7QUFFdkQsVUFBUSxHQUFHO0FBQ1YsVUFBTyxBQUFDLElBQUksQ0FBQyxNQUFNLG1CQXBVWixZQUFZLEFBb1V3QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEdBQzVFLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFDbEIsa0JBbFYrQyxvQkFBb0IsQ0FrVjFDLEdBQUcsRUFBRSxtQkExVWUsTUFBTSxnQkFVYixPQUFPLEVBZ1VDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQ2hGLFVBcFVjLEdBQUcsRUFxVWhCLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUMvQixZQTlUb0UsU0FBUyxnQkFOeEMsT0FBTyxFQW9VekIsa0JBblZzQixPQUFPLENBbVZqQixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsV0E1VGUsa0JBQWtCLEVBNFRkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQ25FOztBQUVELFdBQVMsR0FBRztBQUNYLFVBQU8sa0JBdFZ5QixnQkFBZ0IsQ0FzVnBCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksSUFDOUMsa0JBdlYwRCxRQUFRLENBdVZyRCxNQUFNLEVBQUUsbUJBblZpQyx5QkFBeUIsRUFtVmhDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQzVFOztBQUVELE9BQUssR0FBRztBQUNQLE9BQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUMxQixxQkE3VXdCLGNBQWMsQ0E2VWpCLEtBQ2pCO0FBQ0osVUFBTSxNQUFNLEdBQUcsRUFBRztVQUFFLFdBQVcsR0FBRyxFQUFHLENBQUE7OztBQUdyQyxRQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLEVBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FqV3VELGVBQWUsQ0FpV3RELEtBQUssQ0FBQyxDQUFBOztBQUVuQyxTQUFLLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQzFCLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDLGNBcldzRCxlQUFlLENBcVdyRCxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQSxLQUN4Qzs7QUFFSixTQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssV0FBVyxDQUFDLE1BQU0sRUFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQXpXcUQsZUFBZSxDQXlXcEQsS0FBSyxDQUFDLENBQUE7QUFDbkMsZ0JBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7S0FDMUI7OztBQUdGLFFBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxXQUFXLENBQUMsTUFBTSxFQUN2QyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBL1d1RCxlQUFlLENBK1d0RCxLQUFLLENBQUMsQ0FBQTs7QUFFbkMsV0FBTyxrQkFoWFQsZUFBZSxDQWdYYyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUE7SUFDL0M7R0FDRDs7QUFFRCxlQUFhLEdBQUc7QUFDZixVQUFPLGtCQXRYb0Msd0JBQXdCLENBc1gvQixFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtHQUNqRTs7QUFFRCxXQUFTLEdBQUc7QUFDWCxXQUFRLElBQUksQ0FBQyxJQUFJO0FBQ2hCLGdCQW5YNkIsV0FBVztBQW1YdEIsWUFBTyxrQkE5WEosaUJBQWlCLEVBOFhVLENBQUE7QUFBQSxBQUNoRDtBQUFTLFdBQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQUEsSUFDbkM7R0FDRDs7QUFFRCxZQUFVLEdBQUc7O0FBRVosV0FBUSxJQUFJLENBQUMsSUFBSTtBQUNoQixnQkEzWDBDLFdBQVc7QUEyWG5DLFlBQU8sbUJBaFlxQixNQUFNLFVBYzlDLElBQUksRUFrWDRCLFVBQVUsQ0FBQyxDQUFBO0FBQUEsQUFDakQsZ0JBNVh1RCxRQUFRO0FBNFhoRCxZQUFPLGtCQXRZcUIsT0FBTyxDQXNZaEIsS0FBSyxDQUFDLENBQUE7QUFBQSxBQUN4QyxnQkE3WGlFLE9BQU87QUE2WDFELFlBQU8sa0JBdllzQixPQUFPLENBdVlqQixJQUFJLENBQUMsQ0FBQTtBQUFBLEFBQ3RDLGdCQTlYMEUsTUFBTTtBQThYbkUsWUFBTyxtQkFuWTBCLE1BQU0sVUFjOUMsSUFBSSxFQXFYdUIsS0FBSyxDQUFDLENBQUE7QUFBQSxBQUN2QyxnQkEvWGtGLFFBQVE7QUErWDNFLFlBQU8sa0JBellKLFVBQVUsQ0F5WVMsT0FBTyxDQUFDLENBQUE7QUFBQSxBQUM3QyxnQkEvWEYsc0JBQXNCO0FBK1hTLFlBQU8sa0JBMVlsQixVQUFVLENBMFl1QixXQUFXLENBQUMsQ0FBQTtBQUFBLEFBQy9ELGdCQWhZc0IsT0FBTztBQWdZZixZQUFPLGtCQTNZc0IsT0FBTyxDQTJZakIsSUFBSSxDQUFDLENBQUE7QUFBQSxBQUN0QyxnQkFqWStCLFlBQVk7QUFpWXhCLFlBQU8sa0JBeFk1QixlQUFlLENBd1lpQyxNQUFNLGdCQTVYeUIsT0FBTyxDQTRYdEIsQ0FBQTtBQUFBLEFBQzlEO0FBQVMsV0FBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFBQSxJQUNuQztHQUNEOztBQUVELE9BQUssR0FBRztBQUNQLFVBQU8sa0JBaFpSLGFBQWEsQ0FnWmEsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBO0dBQzNDOztBQUVELFVBQVEsR0FBRztBQUFFLFVBQU8sZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQUU7QUFDM0MsV0FBUyxHQUFHO0FBQUUsVUFBTyxTQUFTLENBQUMsa0JBeFovQixjQUFjLENBd1pvQyxDQUFFLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBRSxDQUFDLENBQUMsQ0FBQTtHQUFFO0FBQy9FLGNBQVksRUFBRSxVQUFVO0FBQ3hCLGVBQWEsRUFBRSxVQUFVOztBQUV6QixPQUFLLEdBQUc7QUFDUCxVQUFPLFVBL1lpQyxNQUFNLEVBK1loQyxJQUFJLENBQUMsUUFBUSxFQUMxQixDQUFDLElBQUksa0JBelowQixjQUFjLENBeVpyQixZQXhZVCxPQUFPLEVBd1lVLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3ZDLE1BQU0sa0JBMVp5QixjQUFjLENBMFpwQixZQXpZVixPQUFPLGdCQUowQyxXQUFXLENBNlk5QixDQUFDLENBQUMsQ0FBQTtHQUNoRDs7QUFFRCxNQUFJLEdBQUc7QUFDTixTQUFNLFNBQVMsR0FBRyxXQTFZd0Msa0JBQWtCLEVBMFl2QyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDbEQsU0FBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxrQkFqYTRCLGVBQWUsQ0FpYXZCLFNBQVMsQ0FBQyxDQUFDLENBQUE7QUFDeEUsU0FBTSxHQUFHLEdBQUcsYUFBYSxHQUN4QixrQkFwYUYsa0JBQWtCLENBb2FPLElBQUksRUFBRSxDQUFFLFNBQVMsQ0FBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FDeEQsa0JBeGF1Qix1QkFBdUIsQ0F3YWxCLENBQUUsU0FBUyxDQUFFLEVBQUUsS0FBSyxDQUFDLENBQUE7QUFDbEQsU0FBTSxJQUFJLEdBQUcsa0JBeGFrQixjQUFjLENBd2FiLEdBQUcsRUFBRSxDQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQyxDQUFBO0FBQ3hELFVBQU8sYUFBYSxHQUFHLGtCQW5hYSxlQUFlLENBbWFSLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUE7R0FDN0Q7O0FBRUQsT0FBSyxHQUFHO0FBQUUsVUFBTyxrQkF0YW9CLGVBQWUsQ0FzYWYsVUE3WkosS0FBSyxFQTZaSyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO0dBQUU7O0FBRXhFLFNBQU8sR0FBRztBQUFFLFVBQU8sa0JBeGFrQixlQUFlLENBd2FiLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7R0FBRTtFQUNsRSxDQUFDLENBQUE7O0FBRUYsVUFBUyxRQUFRLENBQUMsU0FBUyxFQUFFO0FBQzVCLE1BQUksSUFBSSxDQUFDLElBQUksbUJBdGFFLE9BQU8sQUFzYVUsRUFBRTtlQUNHLElBQUksQ0FBQyxJQUFJO1NBQXJDLElBQUksU0FBSixJQUFJO1NBQUUsU0FBUyxTQUFULFNBQVM7U0FBRSxNQUFNLFNBQU4sTUFBTTs7QUFDL0IsU0FBTSxJQUFJLEdBQUcsa0JBL2FpRCxtQkFBbUIsQ0ErYTVDLE9BQU8sRUFBRSxDQUM3QyxrQkEvYWUsa0JBQWtCLGVBWW5DLFNBQVMsRUFtYTJCLFlBL1pWLFNBQVMsRUErWlcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUUsQ0FBQyxDQUFBO0FBQ3pFLFNBQU0sSUFBSSxHQUFHLGtCQXZiMEQsZ0JBQWdCLENBdWJyRCxLQUFLLGdCQXBheEMsU0FBUyxnQkFBaUMsT0FBTyxDQW9hWSxDQUFBO0FBQzVELFNBQU0sT0FBTyxHQUFHLGtCQWxiOEMsbUJBQW1CLENBa2J6QyxPQUFPLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEtBQ2xFLGtCQWxiZSxrQkFBa0IsQ0FtYmhDLFdBaGF3RCxrQkFBa0IsRUFnYXZELENBQUMsQ0FBQyxFQUNyQixrQkF4YnNFLGdCQUFnQixlQWdCekYsU0FBUyxFQXdhMEIsa0JBeGJVLE9BQU8sQ0F3YkwsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN0RCxTQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUNwQyxVQUFPLGtCQTViUixjQUFjLENBNGJhLENBQUUsSUFBSSxFQUFFLGtCQTFiSCxXQUFXLENBMGJRLElBQUksRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUUsQ0FBQyxDQUFBO0dBQzFFOztBQUVBLFVBQU8sa0JBN2J3QixXQUFXLENBNmJuQixFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUE7RUFDbEU7O0FBRUQsVUFBUyxVQUFVLEdBQUc7QUFDckIsUUFBTSxLQUFLLEdBQUcsVUFwYmEsSUFBSSxFQW9iWixJQUFJLG1CQXRid0IsWUFBWSxBQXNiWixFQUFFLE1BQU0sa0JBbmN2QyxjQUFjLEVBbWMyQyxDQUFDLENBQUE7QUFDMUUsUUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQmhELFNBQU8sa0JBamRRLFVBQVUsQ0FpZEgsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFFLEtBQUssQ0FBRSxDQUFDLENBQUE7RUFDaEQ7OztBQUdEOztBQUVDLFVBQVMsR0FBRyxLQUFLLElBQUk7QUFDcEIsUUFBTSxNQUFNLEdBQUcsa0JBNWRnQixjQUFjLENBNGRYLG1CQXJkM0IsdUJBQXVCLEVBcWQ0QixLQUFLLEVBQUUsYUFBYSxDQUFDLEVBQUUsRUFBRyxDQUFDLENBQUE7QUFDckYsU0FBTyxhQUFhLEdBQUcsa0JBdmRhLGVBQWUsQ0F1ZFIsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQTtFQUNqRTtPQUVELFFBQVEsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFNLEtBQUs7QUFDN0IsTUFBSSxHQUFHLEdBQUcsVUFuZDhCLE1BQU0sRUFtZDdCLE1BQU0sRUFBRSxFQUFFLEVBQUUsb0JBOWM2QyxnQkFBZ0IsQUE4Y3ZDLENBQUMsQ0FBQTtBQUNwRCxPQUFLLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQy9DLEdBQUcsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQ3hCLFNBQU8sR0FBRyxDQUFBO0VBQ1Y7T0FFRCxPQUFPLEdBQUcsQ0FBQyxVQUFVLEVBQUUsS0FBSyxLQUMzQixVQTFkd0MsTUFBTSxFQTBkdkMsVUFBVSxFQUNoQixBQUFDLElBQWdCLElBQUs7TUFBbkIsT0FBTyxHQUFULElBQWdCLENBQWQsT0FBTztNQUFFLEdBQUcsR0FBZCxJQUFnQixDQUFMLEdBQUc7O0FBQ2QsUUFBTSxPQUFPLEdBQUcsa0JBcmU0QyxtQkFBbUIsQ0FxZXZDLEtBQUssRUFDNUMsQ0FBRSxrQkFyZVcsa0JBQWtCLENBcWVOLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFFLENBQUMsQ0FBQTtBQUN6QyxTQUFPLGtCQTNlcUQsY0FBYyxDQTJlaEQsT0FBTyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtFQUN0RCxFQUNELE1BQU0sV0FyZDZCLG9CQUFvQixFQXFkNUIsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7T0FFeEMscUJBQXFCLEdBQUcsR0FBRyxJQUFJO0FBQzlCLGlCQUFlLEdBQUcsSUFBSSxDQUFBO0FBQ3RCLFFBQU0sR0FBRyxHQUFHLGtCQS9lYixnQkFBZ0IsQ0FnZmQsa0JBamZrQixVQUFVLENBaWZiLGFBQWEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFBO0FBQ3JFLGlCQUFlLEdBQUcsS0FBSyxDQUFBO0FBQ3ZCLFNBQU8sR0FBRyxDQUFBO0VBQ1Y7T0FDRCxnQkFBZ0IsR0FBRyxRQUFRLElBQUksTUFBTSxJQUFJO0FBQ3hDLE1BQUksTUFBTSxtQkE3ZWlCLEdBQUcsQUE2ZUwsRUFBRTtBQUMxQixhQTNlTSxNQUFNLEVBMmVMLE1BQU0sQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLENBQUE7QUFDOUIsU0FBTSxHQUFHLEdBQUcsbUJBbmYwQyx5QkFBeUIsRUFtZnpDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNwRCxTQUFNLEtBQUssR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDeEIsUUFBSyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUE7QUFDZixTQUFNLFFBQVEsR0FBRyxLQUFLLENBQUE7QUFDdEIsVUFBTyxrQkEzZlQsZ0JBQWdCLENBMmZjLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQTtHQUNyRSxNQUFNO0FBQ04sYUFsZk0sTUFBTSxFQWtmTCxNQUFNLG1CQXJmb0QsVUFBVSxBQXFmeEMsQ0FBQyxDQUFBO0FBQ3BDLFNBQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUE7QUFDdEIsYUFwZk0sTUFBTSxFQW9mTCxHQUFHLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxDQUFBO0FBQzNCLFNBQU0sR0FBRyxHQUFHLFlBM2VkLFFBQVEsRUEyZWUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO0FBQ3ZDLFNBQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFckIsUUFBSyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUE7O0FBRWYsU0FBTSxRQUFRLEdBQUcsSUFBSSxDQUFBO0FBQ3JCLFVBQU8sa0JBdGdCVCxnQkFBZ0IsQ0FzZ0JjLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQTtHQUNyRTtFQUNEO09BRUQsY0FBYyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLEtBQUssS0FBSzs7QUFFaEUsTUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFLElBQUksR0FBRyxJQUFJLENBQUE7QUFDbkMsTUFBSSxZQUFZLEtBQUssU0FBUyxFQUFFLFlBQVksR0FBRyxJQUFJLENBQUE7QUFDbkQsTUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFLEtBQUssR0FBRyxJQUFJLENBQUE7QUFDckMsUUFBTSxHQUFHLEdBQUcsVUFwZ0I0QixNQUFNLEVBb2dCM0IsWUFBWSxFQUM5QixFQUFFLElBQUk7QUFDTCxTQUFNLEdBQUcsR0FBRyx3QkFBd0IsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDbEUsVUFBTyxVQXZnQitCLE1BQU0sRUF1Z0I5QixLQUFLLEVBQ2xCLENBQUMsSUFBSSxVQXhnQk8sR0FBRyxFQXdnQk4sV0E3ZmUsT0FBTyxFQTZmZCxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxnQkFuZ0JKLFNBQVMsQ0FtZ0JPLEVBQ3hDLE1BQU0sa0JBcGhCNEQsZUFBZSxDQW9oQnZELEdBQUcsQ0FBQyxDQUFDLENBQUE7R0FDaEMsRUFDRCxNQUFNLFVBM2dCUSxHQUFHLEVBMmdCUCxLQUFLLEVBQUUsa0JBdGhCbUQsZUFBZSxDQXNoQjlDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqRCxTQUFPLGtCQTFoQlIsY0FBYyxDQTBoQmEsVUE1Z0JYLEdBQUcsRUE0Z0JZLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQTtFQUNoRDtPQUVELGVBQWUsR0FBRyxNQUFNLElBQ3ZCLGtCQXpoQmdELFlBQVksQ0EwaEIzRCxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUNmLFVBamhCK0IsS0FBSyxFQWloQjlCLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQ3hCLFVBbGhCK0IsS0FBSyxFQWtoQjlCLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7T0FFN0IsZUFBZSxHQUFHLENBQUMsSUFBSTtBQUN0QixRQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQTs7QUFFN0IsT0FBSyxDQUFDLElBQUksQ0FBQyxVQXhoQjZCLE1BQU0sRUF3aEI1QixDQUFDLENBQUMsTUFBTSxFQUN6QixDQUFDLElBQUksa0JBbmlCUSxVQUFVLENBbWlCSCxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUMxQyxvQkFyaEJxQyxpQkFBaUIsQUFxaEIvQixDQUFDLENBQUMsQ0FBQTs7QUFFMUIsU0FBTyxrQkF0aUJtQixlQUFlLENBc2lCZCxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO0VBQ2pELENBQUE7OztBQUdGLE9BQ0MsYUFBYSxHQUFHLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLEtBQUs7QUFDNUMsUUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUN4QyxRQUFNLFFBQVEsR0FBRyxrQkFsakJWLGVBQWUsQ0FrakJlLFVBbmlCdEIsR0FBRyxnQkFJZ0MsYUFBYSxFQWlpQjlELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLGtCQWpqQjBCLE9BQU8sQ0FpakJyQiwwQkFBVyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNwRCxRQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxtQkE3aUJiLFFBQVEsRUE2aUJjLENBQUMsR0FBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUMsR0FBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN0RixRQUFNLE9BQU8sR0FBRyxVQXZpQkQsR0FBRyxnQkFHeUMsU0FBUyxFQW9pQnJDLGNBQWMsQ0FBQyxDQUFBO0FBQzlDLFFBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUNoQyxtQkFoakJ5QyxHQUFHLEVBZ2pCeEMsa0JBdGpCb0MsbUJBQW1CLENBc2pCL0IsWUFqaUJrQyxXQUFXLEVBaWlCakMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtBQUN2RSxRQUFNLFlBQVksR0FBRyxVQXppQkssSUFBSSxFQXlpQkosQ0FBQyxVQTFpQnFCLE9BQU8sRUEwaUJwQixTQUFTLENBQUMsRUFDNUMsTUFBTSxrQkFwakJ1RCxtQkFBbUIsQ0FvakJsRCxPQUFPLEVBQUUsVUEzaUJwQixPQUFPLEVBMmlCcUIsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsS0FDaEUsY0FBYyxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzNELFFBQU0sUUFBUSxHQUFHLGtCQTNqQmxCLGNBQWMsQ0EyakJ1QixVQTdpQnJCLEdBQUcsRUE2aUJzQixNQUFNLEVBQUUsWUFBWSxFQUFFLElBQUksZ0JBeGlCdEQsYUFBYSxDQXdpQnlELENBQUMsQ0FBQTtBQUNuRixRQUFNLFFBQVEsR0FDYixPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUN4QixrQkE5akJILGNBQWMsQ0E4akJRLENBQUUsa0JBN2pCa0IsbUJBQW1CLENBOGpCekQsa0JBaGtCOEMsb0JBQW9CLENBZ2tCekMsR0FBRyxnQkE5aUJoQixVQUFVLEVBK2lCckIsWUExaUJ3RSxNQUFNLEVBMGlCdkUsbUJBempCSix1QkFBdUIsRUF5akJLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFFLENBQUMsR0FDaEQsUUFBUSxDQUFBO0FBQ1YsU0FBTyxrQkFsa0J3QixjQUFjLGVBaUJJLFFBQVEsRUFrakJ4RCxDQUFFLFFBQVEsRUFBRSxrQkFwa0JXLHVCQUF1QixDQW9rQk4sT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFFLENBQUMsQ0FBQTtFQUM5RDtPQUVELFlBQVksR0FBRyxJQUFJLElBQ2xCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7T0FFdkMsY0FBYyxHQUFHLENBQUMsR0FBRyxFQUFFLGdCQUFnQixLQUFLOztBQUUzQyxRQUFNLE1BQU0sR0FBRyxDQUFDLFVBN2pCZ0MsT0FBTyxFQTZqQi9CLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBRSxNQUFNLEVBQUUsQ0FBQTtBQUM1RSxRQUFNLEtBQUssR0FBRyxDQUFDLE1BQU0sV0FyakJ0QixlQUFlLFdBRGlELFdBQVcsQ0FzakJyQixDQUFFLGdCQUFnQixDQUFDLENBQUE7O0FBRXhFLFFBQU0sV0FBVyxHQUFHLFVBL2pCWSxLQUFLLEVBK2pCWCxHQUFHLENBQUMsWUFBWSxFQUFFLEdBQUcsSUFBSTtBQUNsRCxTQUFNLE1BQU0sR0FBRyxZQXpqQjJCLGtCQUFrQixFQXlqQjFCLGdCQUFnQixDQUFDLENBQUE7QUFDbkQsU0FBTSxHQUFHLEdBQUcsTUFBTSxHQUFHLFlBM2pCVCxRQUFRLEVBMmpCVSxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUE7QUFDOUMsVUFBTyxtQkExa0JrQyxHQUFHLEVBMGtCakMsa0JBM2tCSSxrQkFBa0IsQ0Eya0JDLFdBeGpCdUIsa0JBQWtCLEVBd2pCdEIsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0dBQ3pFLENBQUMsQ0FBQTs7QUFFRixRQUFNLFlBQVksR0FBRyxVQXRrQjJCLE9BQU8sRUFza0IxQixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUM1QywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFBOztBQUVqRSxTQUFPLFVBemtCUSxHQUFHLEVBeWtCUCxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUE7RUFDckMsQ0FBQTs7O0FBR0YsT0FDQywwQkFBMEIsR0FBRyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLEtBQUs7QUFDOUUsUUFBTSxnQkFBZ0IsR0FBRyxDQUFDLEVBQUUsR0FBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFBO0FBQzNELFFBQU0sY0FBYyxHQUFHLGtCQTVsQkosVUFBVSxDQTRsQlMsZ0JBQWdCLENBQUMsQ0FBQTtBQUN2RCxRQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSTs7QUFFN0MsU0FBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLGNBQWMsRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQTtBQUN0RSxVQUFPLGNBQWMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQTtHQUN0RCxDQUFDLENBQUE7O0FBRUYsUUFBTSxHQUFHLEdBQUcsQUFBQyxNQUFNLElBQUksQ0FBQyxRQUFRLEdBQUksWUFobEJ2QixRQUFRLEVBZ2xCd0IsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFBO0FBQzNELFNBQU8sVUF2bEJzQyxPQUFPLEVBdWxCckMsa0JBaG1CQyxrQkFBa0IsQ0FnbUJJLGNBQWMsRUFBRSxHQUFHLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQTtFQUN4RTtPQUVELGNBQWMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsUUFBUSxLQUFLO1FBQzNELEdBQUcsR0FBbUIsUUFBUSxDQUE5QixHQUFHO1FBQUUsSUFBSSxHQUFhLFFBQVEsQ0FBekIsSUFBSTtRQUFFLE1BQU0sR0FBSyxRQUFRLENBQW5CLE1BQU07O0FBQ3pCLFFBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQTs7O0FBR2hDLE9BQUssR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLHdCQUF3QixDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDdEUsTUFBSSxRQUFRLEVBQUU7O0FBRWIsVUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsNEJBQTRCLENBQUMsQ0FBQTtBQUN6RCxVQUFPLGtCQTVtQlEsa0JBQWtCLENBNm1CaEMsV0ExbEJ3RCxrQkFBa0IsRUEwbEJ2RCxRQUFRLENBQUMsRUFDNUIsa0JBcm5CK0Msb0JBQW9CLENBcW5CMUMsR0FBRyxFQUFFLG1CQTdtQmUsTUFBTSxnQkFVTSxTQUFTLEVBbW1CbEIsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQTtHQUMvRCxNQUFNO0FBQ04sU0FBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsWUFqbUJoQyxRQUFRLEVBaW1CaUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFBO0FBQ25FLGFBem1CTSxNQUFNLEVBeW1CTCxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO0FBQ3JDLFVBQU8sa0JBbG5CUSxrQkFBa0IsQ0FrbkJILFdBL2xCMkIsa0JBQWtCLEVBK2xCMUIsUUFBUSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7R0FDaEU7RUFDRDtPQUVELHdCQUF3QixHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEtBQzVDLEFBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxNQUFNLEtBQUssSUFBSSxHQUMvQyxZQXhtQkYsZUFBZSxFQXdtQkcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRSxrQkE1bkJVLE9BQU8sQ0E0bkJMLElBQUksQ0FBQyxDQUFDLEdBQ25ELEdBQUc7T0FFTCxTQUFTLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEtBQ2hELE1BQU0sR0FDTixZQTdtQm9GLFNBQVMsRUE2bUJuRixTQUFTLEVBQUUsa0JBam9CdUIsT0FBTyxDQWlvQmxCLE9BQU8sQ0FBQyxDQUFDLEdBQzFDLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUN4QyxZQS9tQm9DLEtBQUssRUErbUJuQyxTQUFTLEVBQUUsa0JBbm9CMkIsT0FBTyxDQW1vQnRCLE9BQU8sQ0FBQyxDQUFDLEdBQ3RDLG1CQS9uQitDLE1BQU0sRUErbkI5QyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUEiLCJmaWxlIjoicHJpdmF0ZS90cmFuc3BpbGUvdHJhbnNwaWxlLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQgeyBBcnJheUV4cHJlc3Npb24sIEFycm93RnVuY3Rpb25FeHByZXNzaW9uLCBBc3NpZ25tZW50RXhwcmVzc2lvbiwgQmluYXJ5RXhwcmVzc2lvbixcblx0QmxvY2tTdGF0ZW1lbnQsIEJyZWFrU3RhdGVtZW50LCBDYWxsRXhwcmVzc2lvbiwgQ2F0Y2hDbGF1c2UsIENsYXNzQm9keSwgQ2xhc3NFeHByZXNzaW9uLFxuXHRDb25kaXRpb25hbEV4cHJlc3Npb24sIERlYnVnZ2VyU3RhdGVtZW50LCBFeHByZXNzaW9uU3RhdGVtZW50LCBGb3JPZlN0YXRlbWVudCxcblx0RnVuY3Rpb25FeHByZXNzaW9uLCBJZGVudGlmaWVyLCBJZlN0YXRlbWVudCwgTGl0ZXJhbCwgTG9naWNhbEV4cHJlc3Npb24sIE1lbWJlckV4cHJlc3Npb24sXG5cdE1ldGhvZERlZmluaXRpb24sIE5ld0V4cHJlc3Npb24sIE9iamVjdEV4cHJlc3Npb24sIFByb2dyYW0sIFByb3BlcnR5LCBSZXR1cm5TdGF0ZW1lbnQsXG5cdFNwcmVhZEVsZW1lbnQsIFN3aXRjaENhc2UsIFN3aXRjaFN0YXRlbWVudCwgVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uLCBUZW1wbGF0ZUVsZW1lbnQsXG5cdFRlbXBsYXRlTGl0ZXJhbCwgVGhpc0V4cHJlc3Npb24sIFRocm93U3RhdGVtZW50LCBUcnlTdGF0ZW1lbnQsIFZhcmlhYmxlRGVjbGFyYXRpb24sXG5cdFVuYXJ5RXhwcmVzc2lvbiwgVmFyaWFibGVEZWNsYXJhdG9yLCBZaWVsZEV4cHJlc3Npb24gfSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7IGZ1bmN0aW9uRXhwcmVzc2lvblRodW5rLCBpZENhY2hlZCwgbG9jLCBtZW1iZXIsIHByb3BlcnR5SWRPckxpdGVyYWxDYWNoZWQsIHRvU3RhdGVtZW50XG5cdH0gZnJvbSAnZXNhc3QvZGlzdC91dGlsJ1xuaW1wb3J0IG1hbmdsZVBhdGggZnJvbSAnLi4vbWFuZ2xlUGF0aCdcbmltcG9ydCAqIGFzIE1zQXN0VHlwZXMgZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQgeyBBc3NpZ25TaW5nbGUsIENhbGwsIEZ1biwgTF9BbmQsIExfT3IsIExEX0xhenksIExEX011dGFibGUsIE1ldGhvZEltcGwsIE1TX011dGF0ZSwgTVNfTmV3LFxuXHRNU19OZXdNdXRhYmxlLCBQYXR0ZXJuLCBTcGxhdCwgU0RfRGVidWdnZXIsIFNWX0NvbnRhaW5zLCBTVl9GYWxzZSwgU1ZfTnVsbCwgU1ZfU3ViLCBTVl9TdXBlcixcblx0U1ZfVGhpc01vZHVsZURpcmVjdG9yeSwgU1ZfVHJ1ZSwgU1ZfVW5kZWZpbmVkLCBTd2l0Y2hEb1BhcnQgfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7IGFzc2VydCwgY2F0LCBmbGF0TWFwLCBmbGF0T3BNYXAsIGlmRWxzZSwgaXNFbXB0eSxcblx0aW1wbGVtZW50TWFueSwgaXNQb3NpdGl2ZSwgb3BJZiwgb3BNYXAsIHRhaWwsIHVuc2hpZnQgfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHsgQW1kZWZpbmVIZWFkZXIsIEFycmF5U2xpY2VDYWxsLCBEZWNsYXJlQnVpbHRCYWcsIERlY2xhcmVCdWlsdE1hcCwgRGVjbGFyZUJ1aWx0T2JqLFxuXHRFeHBvcnRzRGVmYXVsdCwgRXhwb3J0c0dldCwgSWRBcmd1bWVudHMsIElkQnVpbHQsIElkRGVmaW5lLCBJZEV4cG9ydHMsXG5cdElkRXh0cmFjdCwgSWRMZXhpY2FsVGhpcywgTGl0RW1wdHlTdHJpbmcsIExpdE51bGwsIExpdFN0ckV4cG9ydHMsIExpdFN0clRocm93LCBMaXRaZXJvLFxuXHRSZXR1cm5CdWlsdCwgUmV0dXJuRXhwb3J0cywgUmV0dXJuUmVzLCBTd2l0Y2hDYXNlTm9NYXRjaCwgVGhyb3dBc3NlcnRGYWlsLCBUaHJvd05vQ2FzZU1hdGNoLFxuXHRVc2VTdHJpY3QgfSBmcm9tICcuL2FzdC1jb25zdGFudHMnXG5pbXBvcnQgeyBJZE1zLCBsYXp5V3JhcCwgbXNBZGQsIG1zQWRkTWFueSwgbXNBc3NlcnQsIG1zQXNzZXJ0Tm90LCBtc0Fzc29jLFxuXHRtc0NoZWNrQ29udGFpbnMsIG1zRXJyb3IsIG1zRXh0cmFjdCwgbXNHZXQsIG1zR2V0RGVmYXVsdEV4cG9ydCwgbXNHZXRNb2R1bGUsIG1zTGF6eSwgbXNMYXp5R2V0LFxuXHRtc0xhenlHZXRNb2R1bGUsIG1zTmV3TXV0YWJsZVByb3BlcnR5LCBtc05ld1Byb3BlcnR5LCBtc1NldCwgbXNTZXROYW1lLCBtc1NldExhenksXHRtc1NvbWUsXG5cdG1zU3ltYm9sLCBNc05vbmUgfSBmcm9tICcuL21zLWNhbGwnXG5pbXBvcnQgeyBhY2Nlc3NMb2NhbERlY2xhcmUsIGRlY2xhcmUsIGZvclN0YXRlbWVudEluZmluaXRlLCBpZEZvckRlY2xhcmVDYWNoZWQsXG5cdG9wVHlwZUNoZWNrRm9yTG9jYWxEZWNsYXJlIH0gZnJvbSAnLi91dGlsJ1xuXG5sZXQgY29udGV4dCwgdmVyaWZ5UmVzdWx0cywgaXNJbkdlbmVyYXRvciwgaXNJbkNvbnN0cnVjdG9yXG5cbmV4cG9ydCBkZWZhdWx0IChfY29udGV4dCwgbW9kdWxlRXhwcmVzc2lvbiwgX3ZlcmlmeVJlc3VsdHMpID0+IHtcblx0Y29udGV4dCA9IF9jb250ZXh0XG5cdHZlcmlmeVJlc3VsdHMgPSBfdmVyaWZ5UmVzdWx0c1xuXHRpc0luR2VuZXJhdG9yID0gZmFsc2Vcblx0aXNJbkNvbnN0cnVjdG9yID0gZmFsc2Vcblx0Y29uc3QgcmVzID0gdDAobW9kdWxlRXhwcmVzc2lvbilcblx0Ly8gUmVsZWFzZSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuXHRjb250ZXh0ID0gdmVyaWZ5UmVzdWx0cyA9IHVuZGVmaW5lZFxuXHRyZXR1cm4gcmVzXG59XG5cbmV4cG9ydCBjb25zdFxuXHR0MCA9IGV4cHIgPT4gbG9jKGV4cHIudHJhbnNwaWxlKCksIGV4cHIubG9jKVxuY29uc3Rcblx0dDEgPSAoZXhwciwgYXJnKSA9PiBsb2MoZXhwci50cmFuc3BpbGUoYXJnKSwgZXhwci5sb2MpLFxuXHR0MyA9IChleHByLCBhcmcsIGFyZzIsIGFyZzMpID0+IGxvYyhleHByLnRyYW5zcGlsZShhcmcsIGFyZzIsIGFyZzMpLCBleHByLmxvYyksXG5cdHRMaW5lcyA9IGV4cHJzID0+IHtcblx0XHRjb25zdCBvdXQgPSBbIF1cblx0XHRmb3IgKGNvbnN0IGV4cHIgb2YgZXhwcnMpIHtcblx0XHRcdGNvbnN0IGFzdCA9IGV4cHIudHJhbnNwaWxlKClcblx0XHRcdGlmIChhc3QgaW5zdGFuY2VvZiBBcnJheSlcblx0XHRcdFx0Ly8gRGVidWcgbWF5IHByb2R1Y2UgbXVsdGlwbGUgc3RhdGVtZW50cy5cblx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIGFzdClcblx0XHRcdFx0XHRvdXQucHVzaCh0b1N0YXRlbWVudChfKSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0b3V0LnB1c2gobG9jKHRvU3RhdGVtZW50KGFzdCksIGV4cHIubG9jKSlcblx0XHR9XG5cdFx0cmV0dXJuIG91dFxuXHR9XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ3RyYW5zcGlsZScsIHtcblx0QXNzZXJ0KCkge1xuXHRcdGNvbnN0IGZhaWxDb25kID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgY29uZCA9IHQwKHRoaXMuY29uZGl0aW9uKVxuXHRcdFx0cmV0dXJuIHRoaXMubmVnYXRlID8gY29uZCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCBjb25kKVxuXHRcdH1cblxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcFRocm93bixcblx0XHRcdHRocm93biA9PiBuZXcgSWZTdGF0ZW1lbnQoZmFpbENvbmQoKSxuZXcgIFRocm93U3RhdGVtZW50KG1zRXJyb3IodDAodGhyb3duKSkpKSxcblx0XHRcdCgpID0+IHtcblx0XHRcdFx0aWYgKHRoaXMuY29uZGl0aW9uIGluc3RhbmNlb2YgQ2FsbCkge1xuXHRcdFx0XHRcdGNvbnN0IGNhbGwgPSB0aGlzLmNvbmRpdGlvblxuXHRcdFx0XHRcdGNvbnN0IGFzcyA9IHRoaXMubmVnYXRlID8gbXNBc3NlcnROb3QgOiBtc0Fzc2VydFxuXHRcdFx0XHRcdHJldHVybiBhc3ModDAoY2FsbC5jYWxsZWQpLCAuLi5jYWxsLmFyZ3MubWFwKHQwKSlcblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudChmYWlsQ29uZCgpLCBUaHJvd0Fzc2VydEZhaWwpXG5cdFx0XHR9KVxuXHR9LFxuXG5cdEFzc2lnblNpbmdsZSh2YWxXcmFwKSB7XG5cdFx0Y29uc3QgdmFsID0gdmFsV3JhcCA9PT0gdW5kZWZpbmVkID8gdDAodGhpcy52YWx1ZSkgOiB2YWxXcmFwKHQwKHRoaXMudmFsdWUpKVxuXHRcdGNvbnN0IGRlY2xhcmUgPVxuXHRcdFx0bWFrZURlY2xhcmF0b3IodGhpcy5hc3NpZ25lZSwgdmFsLCBmYWxzZSwgdmVyaWZ5UmVzdWx0cy5pc0V4cG9ydEFzc2lnbih0aGlzKSlcblx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24odGhpcy5hc3NpZ25lZS5pc011dGFibGUoKSA/ICdsZXQnIDogJ2NvbnN0JywgWyBkZWNsYXJlIF0pXG5cdH0sXG5cdC8vIFRPRE86RVM2IEp1c3QgdXNlIG5hdGl2ZSBkZXN0cnVjdHVyaW5nIGFzc2lnblxuXHRBc3NpZ25EZXN0cnVjdHVyZSgpIHtcblx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24odGhpcy5raW5kKCkgPT09IExEX011dGFibGUgPyAnbGV0JyA6ICdjb25zdCcsXG5cdFx0XHRtYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycyhcblx0XHRcdFx0dGhpcy5hc3NpZ25lZXMsXG5cdFx0XHRcdHRoaXMua2luZCgpID09PSBMRF9MYXp5LFxuXHRcdFx0XHR0MCh0aGlzLnZhbHVlKSxcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdHZlcmlmeVJlc3VsdHMuaXNFeHBvcnRBc3NpZ24odGhpcykpKVxuXHR9LFxuXG5cdEJhZ0VudHJ5KCkgeyByZXR1cm4gbXNBZGQoSWRCdWlsdCwgdDAodGhpcy52YWx1ZSkpIH0sXG5cblx0QmFnRW50cnlNYW55KCkgeyByZXR1cm4gbXNBZGRNYW55KElkQnVpbHQsIHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdEJhZ1NpbXBsZSgpIHsgcmV0dXJuIG5ldyBBcnJheUV4cHJlc3Npb24odGhpcy5wYXJ0cy5tYXAodDApKSB9LFxuXG5cdEJsb2NrRG8obGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkge1xuXHRcdC8vIFRPRE86RVM2IE9wdGlvbmFsIGFyZ3VtZW50c1xuXHRcdGlmIChsZWFkID09PSB1bmRlZmluZWQpIGxlYWQgPSBudWxsXG5cdFx0aWYgKG9wRGVjbGFyZVJlcyA9PT0gdW5kZWZpbmVkKSBvcERlY2xhcmVSZXMgPSBudWxsXG5cdFx0aWYgKG9wT3V0ID09PSB1bmRlZmluZWQpIG9wT3V0ID0gbnVsbFxuXHRcdGFzc2VydChvcERlY2xhcmVSZXMgPT09IG51bGwpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgdExpbmVzKHRoaXMubGluZXMpLCBvcE91dCkpXG5cdH0sXG5cblx0QmxvY2tWYWxUaHJvdyhsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KSB7XG5cdFx0Ly8gVE9ETzpFUzYgT3B0aW9uYWwgYXJndW1lbnRzXG5cdFx0aWYgKGxlYWQgPT09IHVuZGVmaW5lZCkgbGVhZCA9IG51bGxcblx0XHRpZiAob3BEZWNsYXJlUmVzID09PSB1bmRlZmluZWQpIG9wRGVjbGFyZVJlcyA9IG51bGxcblx0XHRpZiAob3BPdXQgPT09IHVuZGVmaW5lZCkgb3BPdXQgPSBudWxsXG5cdFx0Y29udGV4dC53YXJuSWYob3BEZWNsYXJlUmVzICE9PSBudWxsIHx8IG9wT3V0ICE9PSBudWxsLCB0aGlzLmxvYyxcblx0XHRcdCdPdXQgY29uZGl0aW9uIGlnbm9yZWQgYmVjYXVzZSBvZiBvaC1ubyEnKVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHRMaW5lcyh0aGlzLmxpbmVzKSwgdDAodGhpcy50aHJvdykpKVxuXHR9LFxuXG5cdEJsb2NrV2l0aFJldHVybihsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKHQwKHRoaXMucmV0dXJuZWQpLCB0TGluZXModGhpcy5saW5lcyksIGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpXG5cdH0sXG5cblx0QmxvY2tCYWcobGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayhcblx0XHRcdElkQnVpbHQsXG5cdFx0XHRjYXQoRGVjbGFyZUJ1aWx0QmFnLCB0TGluZXModGhpcy5saW5lcykpLFxuXHRcdFx0bGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dClcblx0fSxcblxuXHRCbG9ja09iaihsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KSB7XG5cdFx0Y29uc3QgbGluZXMgPSBjYXQoRGVjbGFyZUJ1aWx0T2JqLCB0TGluZXModGhpcy5saW5lcykpXG5cdFx0Y29uc3QgcmVzID0gaWZFbHNlKHRoaXMub3BPYmplZCxcblx0XHRcdG9iamVkID0+IGlmRWxzZSh0aGlzLm9wTmFtZSxcblx0XHRcdFx0bmFtZSA9PiBtc1NldCh0MChvYmplZCksIElkQnVpbHQsIG5ldyBMaXRlcmFsKG5hbWUpKSxcblx0XHRcdFx0KCkgPT4gbXNTZXQodDAob2JqZWQpLCBJZEJ1aWx0KSksXG5cdFx0XHQoKSA9PiBpZkVsc2UodGhpcy5vcE5hbWUsXG5cdFx0XHRcdF8gPT4gbXNTZXROYW1lKElkQnVpbHQsIG5ldyBMaXRlcmFsKF8pKSxcblx0XHRcdFx0KCkgPT4gSWRCdWlsdCkpXG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKHJlcywgbGluZXMsIGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpXG5cdH0sXG5cblx0QmxvY2tNYXAobGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayhcblx0XHRcdElkQnVpbHQsXG5cdFx0XHRjYXQoRGVjbGFyZUJ1aWx0TWFwLCB0TGluZXModGhpcy5saW5lcykpLFxuXHRcdFx0bGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dClcblx0fSxcblxuXHRCbG9ja1dyYXAoKSB7IHJldHVybiBibG9ja1dyYXAodDAodGhpcy5ibG9jaykpIH0sXG5cblx0QnJlYWsoKSB7IHJldHVybiBuZXcgQnJlYWtTdGF0ZW1lbnQoKSB9LFxuXG5cdEJyZWFrV2l0aFZhbCgpIHsgcmV0dXJuIG5ldyBSZXR1cm5TdGF0ZW1lbnQodDAodGhpcy52YWx1ZSkpIH0sXG5cblx0Q2FsbCgpIHtcblx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKHQwKHRoaXMuY2FsbGVkKSwgdGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0Q2FzZURvKCkge1xuXHRcdGNvbnN0IGJvZHkgPSBjYXNlQm9keSh0aGlzLnBhcnRzLCB0aGlzLm9wRWxzZSlcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BDYXNlZCwgXyA9PiBuZXcgQmxvY2tTdGF0ZW1lbnQoWyB0MChfKSwgYm9keSBdKSwgKCkgPT4gYm9keSlcblx0fSxcblx0Q2FzZVZhbCgpIHtcblx0XHRjb25zdCBib2R5ID0gY2FzZUJvZHkodGhpcy5wYXJ0cywgdGhpcy5vcEVsc2UpXG5cdFx0Y29uc3QgYmxvY2sgPSBpZkVsc2UodGhpcy5vcENhc2VkLCBfID0+IFsgdDAoXyksIGJvZHkgXSwgKCkgPT4gWyBib2R5IF0pXG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoYmxvY2spKVxuXHR9LFxuXHRDYXNlRG9QYXJ0OiBjYXNlUGFydCxcblx0Q2FzZVZhbFBhcnQ6IGNhc2VQYXJ0LFxuXG5cdENsYXNzKCkge1xuXHRcdGNvbnN0IG1ldGhvZHMgPSBjYXQoXG5cdFx0XHR0aGlzLnN0YXRpY3MubWFwKG1ldGhvZERlZmluaXRpb24odHJ1ZSkpLFxuXHRcdFx0b3BNYXAodGhpcy5vcENvbnN0cnVjdG9yLCBjb25zdHJ1Y3RvckRlZmluaXRpb24pLFxuXHRcdFx0dGhpcy5tZXRob2RzLm1hcChtZXRob2REZWZpbml0aW9uKGZhbHNlKSkpXG5cdFx0Y29uc3Qgb3BOYW1lID0gb3BNYXAodGhpcy5vcE5hbWUsIGlkQ2FjaGVkKVxuXHRcdGNvbnN0IGNsYXNzRXhwciA9IG5ldyBDbGFzc0V4cHJlc3Npb24oXG5cdFx0XHRvcE5hbWUsXG5cdFx0XHRvcE1hcCh0aGlzLm9wU3VwZXJDbGFzcywgdDApLCBuZXcgQ2xhc3NCb2R5KG1ldGhvZHMpKVxuXG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wRG8sIF8gPT4gdDEoXywgY2xhc3NFeHByKSwgKCkgPT4gY2xhc3NFeHByKVxuXHR9LFxuXG5cdENsYXNzRG8oY2xhc3NFeHByKSB7XG5cdFx0Y29uc3QgbGVhZCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IodDAodGhpcy5kZWNsYXJlRm9jdXMpLCBjbGFzc0V4cHIpIF0pXG5cdFx0Y29uc3QgcmV0ID0gbmV3IFJldHVyblN0YXRlbWVudCh0MCh0aGlzLmRlY2xhcmVGb2N1cykpXG5cdFx0Y29uc3QgYmxvY2sgPSB0Myh0aGlzLmJsb2NrLCBsZWFkLCBudWxsLCByZXQpXG5cdFx0cmV0dXJuIGJsb2NrV3JhcChibG9jaylcblx0fSxcblxuXHRDb25kaXRpb25hbERvKCkge1xuXHRcdGNvbnN0IHRlc3QgPSB0MCh0aGlzLnRlc3QpXG5cdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudChcblx0XHRcdHRoaXMuaXNVbmxlc3MgPyBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgdGVzdCkgOiB0ZXN0LFxuXHRcdFx0dDAodGhpcy5yZXN1bHQpKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsVmFsKCkge1xuXHRcdGNvbnN0IHRlc3QgPSB0MCh0aGlzLnRlc3QpXG5cdFx0Y29uc3QgcmVzdWx0ID0gbXNTb21lKGJsb2NrV3JhcCh0MCh0aGlzLnJlc3VsdCkpKVxuXHRcdHJldHVybiB0aGlzLmlzVW5sZXNzID9cblx0XHRcdG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odGVzdCwgTXNOb25lLCByZXN1bHQpIDpcblx0XHRcdG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odGVzdCwgcmVzdWx0LCBNc05vbmUpXG5cdH0sXG5cblx0Q2F0Y2goKSB7XG5cdFx0cmV0dXJuIG5ldyBDYXRjaENsYXVzZSh0MCh0aGlzLmNhdWdodCksIHQwKHRoaXMuYmxvY2spKVxuXHR9LFxuXG5cdERlYnVnKCkgeyByZXR1cm4gY29udGV4dC5vcHRzLmluY2x1ZGVDaGVja3MoKSA/IHRMaW5lcyh0aGlzLmxpbmVzKSA6IFsgXSB9LFxuXG5cdEV4Y2VwdERvKCkgeyByZXR1cm4gdHJhbnNwaWxlRXhjZXB0KHRoaXMpIH0sXG5cdEV4Y2VwdFZhbCgpIHsgcmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoWyB0cmFuc3BpbGVFeGNlcHQodGhpcykgXSkpIH0sXG5cblx0Rm9yRG8oKSB7IHJldHVybiBmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jaykgfSxcblxuXHRGb3JCYWcoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW1xuXHRcdFx0RGVjbGFyZUJ1aWx0QmFnLFxuXHRcdFx0Zm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spLFxuXHRcdFx0UmV0dXJuQnVpbHRcblx0XHRdKSlcblx0fSxcblxuXHRGb3JWYWwoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoWyBmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jaykgXSkpXG5cdH0sXG5cblx0RnVuKCkge1xuXHRcdGNvbnN0IG9sZEluR2VuZXJhdG9yID0gaXNJbkdlbmVyYXRvclxuXHRcdGlzSW5HZW5lcmF0b3IgPSB0aGlzLmlzR2VuZXJhdG9yXG5cblx0XHQvLyBUT0RPOkVTNiB1c2UgYC4uLmBmXG5cdFx0Y29uc3QgbkFyZ3MgPSBuZXcgTGl0ZXJhbCh0aGlzLmFyZ3MubGVuZ3RoKVxuXHRcdGNvbnN0IG9wRGVjbGFyZVJlc3QgPSBvcE1hcCh0aGlzLm9wUmVzdEFyZywgcmVzdCA9PlxuXHRcdFx0ZGVjbGFyZShyZXN0LCBuZXcgQ2FsbEV4cHJlc3Npb24oQXJyYXlTbGljZUNhbGwsIFtJZEFyZ3VtZW50cywgbkFyZ3NdKSkpXG5cdFx0Y29uc3QgYXJnQ2hlY2tzID0gb3BJZihjb250ZXh0Lm9wdHMuaW5jbHVkZUNoZWNrcygpLCAoKSA9PlxuXHRcdFx0ZmxhdE9wTWFwKHRoaXMuYXJncywgb3BUeXBlQ2hlY2tGb3JMb2NhbERlY2xhcmUpKVxuXG5cdFx0Y29uc3QgX2luID0gb3BNYXAodGhpcy5vcEluLCB0MClcblxuXHRcdGNvbnN0IG9wRGVjbGFyZVRoaXMgPSBvcElmKCFpc0luQ29uc3RydWN0b3IsICgpID0+IG9wTWFwKHRoaXMub3BEZWNsYXJlVGhpcywgKCkgPT5cblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsXG5cdFx0XHRcdFsgbmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZExleGljYWxUaGlzLCBuZXcgVGhpc0V4cHJlc3Npb24oKSkgXSkpKVxuXG5cdFx0Y29uc3QgbGVhZCA9IGNhdChvcERlY2xhcmVUaGlzLCBvcERlY2xhcmVSZXN0LCBhcmdDaGVja3MsIF9pbilcblxuXHRcdGNvbnN0IF9vdXQgPSBvcE1hcCh0aGlzLm9wT3V0LCB0MClcblx0XHRjb25zdCBib2R5ID0gdDModGhpcy5ibG9jaywgbGVhZCwgdGhpcy5vcERlY2xhcmVSZXMsIF9vdXQpXG5cdFx0Y29uc3QgYXJncyA9IHRoaXMuYXJncy5tYXAodDApXG5cdFx0aXNJbkdlbmVyYXRvciA9IG9sZEluR2VuZXJhdG9yXG5cdFx0Y29uc3QgaWQgPSBvcE1hcCh0aGlzLm9wTmFtZSwgaWRDYWNoZWQpXG5cblx0XHRjb25zdCBjYW5Vc2VBcnJvd0Z1bmN0aW9uID1cblx0XHRcdGlkID09PSBudWxsICYmXG5cdFx0XHR0aGlzLm9wRGVjbGFyZVRoaXMgPT09IG51bGwgJiZcblx0XHRcdG9wRGVjbGFyZVJlc3QgPT09IG51bGwgJiZcblx0XHRcdCF0aGlzLmlzR2VuZXJhdG9yXG5cdFx0cmV0dXJuIGNhblVzZUFycm93RnVuY3Rpb24gP1xuXHRcdFx0bmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKGFyZ3MsIGJvZHkpIDpcblx0XHRcdG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIGFyZ3MsIGJvZHksIHRoaXMuaXNHZW5lcmF0b3IpXG5cdH0sXG5cblx0TGF6eSgpIHsgcmV0dXJuIGxhenlXcmFwKHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdE51bWJlckxpdGVyYWwoKSB7XG5cdFx0Ly8gTmVnYXRpdmUgbnVtYmVycyBhcmUgbm90IHBhcnQgb2YgRVMgc3BlYy5cblx0XHQvLyBodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNS4xLyNzZWMtNy44LjNcblx0XHRjb25zdCB2YWx1ZSA9IE51bWJlcih0aGlzLnZhbHVlKVxuXHRcdGNvbnN0IGxpdCA9IG5ldyBMaXRlcmFsKE1hdGguYWJzKHZhbHVlKSlcblx0XHRyZXR1cm4gaXNQb3NpdGl2ZSh2YWx1ZSkgPyBsaXQgOiBuZXcgVW5hcnlFeHByZXNzaW9uKCctJywgbGl0KVxuXHR9LFxuXG5cdEdsb2JhbEFjY2VzcygpIHsgcmV0dXJuIG5ldyBJZGVudGlmaWVyKHRoaXMubmFtZSkgfSxcblxuXHRMb2NhbEFjY2VzcygpIHtcblx0XHRyZXR1cm4gdGhpcy5uYW1lID09PSAndGhpcycgP1xuXHRcdFx0KGlzSW5Db25zdHJ1Y3RvciA/IG5ldyBUaGlzRXhwcmVzc2lvbigpIDogSWRMZXhpY2FsVGhpcykgOlxuXHRcdFx0YWNjZXNzTG9jYWxEZWNsYXJlKHZlcmlmeVJlc3VsdHMubG9jYWxEZWNsYXJlRm9yQWNjZXNzKHRoaXMpKVxuXHR9LFxuXG5cdExvY2FsRGVjbGFyZSgpIHsgcmV0dXJuIG5ldyBJZGVudGlmaWVyKGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzKS5uYW1lKSB9LFxuXG5cdExvY2FsTXV0YXRlKCkge1xuXHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBpZENhY2hlZCh0aGlzLm5hbWUpLCB0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRMb2dpYygpIHtcblx0XHRhc3NlcnQodGhpcy5raW5kID09PSBMX0FuZCB8fCB0aGlzLmtpbmQgPT09IExfT3IpXG5cdFx0Y29uc3Qgb3AgPSB0aGlzLmtpbmQgPT09IExfQW5kID8gJyYmJyA6ICd8fCdcblx0XHRyZXR1cm4gdGFpbCh0aGlzLmFyZ3MpLnJlZHVjZSgoYSwgYikgPT5cblx0XHRcdG5ldyBMb2dpY2FsRXhwcmVzc2lvbihvcCwgYSwgdDAoYikpLCB0MCh0aGlzLmFyZ3NbMF0pKVxuXHR9LFxuXG5cdE1hcEVudHJ5KCkgeyByZXR1cm4gbXNBc3NvYyhJZEJ1aWx0LCB0MCh0aGlzLmtleSksIHQwKHRoaXMudmFsKSkgfSxcblxuXHRNZW1iZXIoKSB7IHJldHVybiBtZW1iZXIodDAodGhpcy5vYmplY3QpLCB0aGlzLm5hbWUpIH0sXG5cblx0TWVtYmVyU2V0KCkge1xuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIE1TX011dGF0ZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsXG5cdFx0XHRcdFx0bWVtYmVyKHQwKHRoaXMub2JqZWN0KSwgdGhpcy5uYW1lKSxcblx0XHRcdFx0XHR0MCh0aGlzLnZhbHVlKSlcblx0XHRcdGNhc2UgTVNfTmV3OlxuXHRcdFx0XHRyZXR1cm4gbXNOZXdQcm9wZXJ0eSh0MCh0aGlzLm9iamVjdCksIG5ldyBMaXRlcmFsKHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHRcdFx0Y2FzZSBNU19OZXdNdXRhYmxlOlxuXHRcdFx0XHRyZXR1cm4gbXNOZXdNdXRhYmxlUHJvcGVydHkodDAodGhpcy5vYmplY3QpLCBuZXcgTGl0ZXJhbCh0aGlzLm5hbWUpLCB0MCh0aGlzLnZhbHVlKSlcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcigpXG5cdFx0fVxuXHR9LFxuXG5cdE1vZHVsZSgpIHtcblx0XHRjb25zdCBib2R5ID0gY2F0KFxuXHRcdFx0dExpbmVzKHRoaXMubGluZXMpLFxuXHRcdFx0b3BNYXAodGhpcy5vcERlZmF1bHRFeHBvcnQsIF8gPT4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgRXhwb3J0c0RlZmF1bHQsIHQwKF8pKSkpXG5cdFx0cmV0dXJuIG5ldyBQcm9ncmFtKGNhdChcblx0XHRcdG9wSWYoY29udGV4dC5vcHRzLmluY2x1ZGVVc2VTdHJpY3QoKSwgKCkgPT4gVXNlU3RyaWN0KSxcblx0XHRcdG9wSWYoY29udGV4dC5vcHRzLmluY2x1ZGVBbWRlZmluZSgpLCAoKSA9PiBBbWRlZmluZUhlYWRlciksXG5cdFx0XHR0b1N0YXRlbWVudChhbWRXcmFwTW9kdWxlKHRoaXMuZG9Vc2VzLCB0aGlzLnVzZXMuY29uY2F0KHRoaXMuZGVidWdVc2VzKSwgYm9keSkpKSlcblx0fSxcblxuXHROZXcoKSB7XG5cdFx0Y29uc3QgYW55U3BsYXQgPSB0aGlzLmFyZ3Muc29tZShfID0+IF8gaW5zdGFuY2VvZiBTcGxhdClcblx0XHRjb250ZXh0LmNoZWNrKCFhbnlTcGxhdCwgdGhpcy5sb2MsICdUT0RPOiBTcGxhdCBwYXJhbXMgZm9yIG5ldycpXG5cdFx0cmV0dXJuIG5ldyBOZXdFeHByZXNzaW9uKHQwKHRoaXMudHlwZSksIHRoaXMuYXJncy5tYXAodDApKVxuXHR9LFxuXG5cdE5vdCgpIHsgcmV0dXJuIG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCB0MCh0aGlzLmFyZykpIH0sXG5cblx0T2JqRW50cnkoKSB7XG5cdFx0cmV0dXJuICh0aGlzLmFzc2lnbiBpbnN0YW5jZW9mIEFzc2lnblNpbmdsZSAmJiAhdGhpcy5hc3NpZ24uYXNzaWduZWUuaXNMYXp5KCkpID9cblx0XHRcdHQxKHRoaXMuYXNzaWduLCB2YWwgPT5cblx0XHRcdFx0bmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyKElkQnVpbHQsIHRoaXMuYXNzaWduLmFzc2lnbmVlLm5hbWUpLCB2YWwpKSA6XG5cdFx0XHRjYXQoXG5cdFx0XHRcdHQwKHRoaXMuYXNzaWduKSxcblx0XHRcdFx0dGhpcy5hc3NpZ24uYWxsQXNzaWduZWVzKCkubWFwKF8gPT5cblx0XHRcdFx0XHRtc1NldExhenkoSWRCdWlsdCwgbmV3IExpdGVyYWwoXy5uYW1lKSwgaWRGb3JEZWNsYXJlQ2FjaGVkKF8pKSkpXG5cdH0sXG5cblx0T2JqU2ltcGxlKCkge1xuXHRcdHJldHVybiBuZXcgT2JqZWN0RXhwcmVzc2lvbih0aGlzLnBhaXJzLm1hcChwYWlyID0+XG5cdFx0XHRuZXcgUHJvcGVydHkoJ2luaXQnLCBwcm9wZXJ0eUlkT3JMaXRlcmFsQ2FjaGVkKHBhaXIua2V5KSwgdDAocGFpci52YWx1ZSkpKSlcblx0fSxcblxuXHRRdW90ZSgpIHtcblx0XHRpZiAodGhpcy5wYXJ0cy5sZW5ndGggPT09IDApXG5cdFx0XHRyZXR1cm4gTGl0RW1wdHlTdHJpbmdcblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IHF1YXNpcyA9IFsgXSwgZXhwcmVzc2lvbnMgPSBbIF1cblxuXHRcdFx0Ly8gVGVtcGxhdGVMaXRlcmFsIG11c3Qgc3RhcnQgd2l0aCBhIFRlbXBsYXRlRWxlbWVudFxuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLnBhcnRzWzBdICE9PSAnc3RyaW5nJylcblx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LkVtcHR5KVxuXG5cdFx0XHRmb3IgKGxldCBwYXJ0IG9mIHRoaXMucGFydHMpXG5cdFx0XHRcdGlmICh0eXBlb2YgcGFydCA9PT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmZvclN0cmluZyhwYXJ0KSlcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Ly8gXCJ7MX17MX1cIiBuZWVkcyBhbiBlbXB0eSBxdWFzaSBpbiB0aGUgbWlkZGxlIChhbmQgb24gdGhlIGVuZHMpXG5cdFx0XHRcdFx0aWYgKHF1YXNpcy5sZW5ndGggPT09IGV4cHJlc3Npb25zLmxlbmd0aClcblx0XHRcdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5FbXB0eSlcblx0XHRcdFx0XHRleHByZXNzaW9ucy5wdXNoKHQwKHBhcnQpKVxuXHRcdFx0XHR9XG5cblx0XHRcdC8vIFRlbXBsYXRlTGl0ZXJhbCBtdXN0IGVuZCB3aXRoIGEgVGVtcGxhdGVFbGVtZW50LCBzbyBvbmUgbW9yZSBxdWFzaSB0aGFuIGV4cHJlc3Npb24uXG5cdFx0XHRpZiAocXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoKVxuXHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuRW1wdHkpXG5cblx0XHRcdHJldHVybiBuZXcgVGVtcGxhdGVMaXRlcmFsKHF1YXNpcywgZXhwcmVzc2lvbnMpXG5cdFx0fVxuXHR9LFxuXG5cdFF1b3RlVGVtcGxhdGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBUYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb24odDAodGhpcy50YWcpLCB0MCh0aGlzLnF1b3RlKSlcblx0fSxcblxuXHRTcGVjaWFsRG8oKSB7XG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU0RfRGVidWdnZXI6IHJldHVybiBuZXcgRGVidWdnZXJTdGF0ZW1lbnQoKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHR9XG5cdH0sXG5cblx0U3BlY2lhbFZhbCgpIHtcblx0XHQvLyBNYWtlIG5ldyBvYmplY3RzIGJlY2F1c2Ugd2Ugd2lsbCBhc3NpZ24gYGxvY2AgdG8gdGhlbS5cblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTVl9Db250YWluczogcmV0dXJuIG1lbWJlcihJZE1zLCAnY29udGFpbnMnKVxuXHRcdFx0Y2FzZSBTVl9GYWxzZTogcmV0dXJuIG5ldyBMaXRlcmFsKGZhbHNlKVxuXHRcdFx0Y2FzZSBTVl9OdWxsOiByZXR1cm4gbmV3IExpdGVyYWwobnVsbClcblx0XHRcdGNhc2UgU1ZfU3ViOiByZXR1cm4gbWVtYmVyKElkTXMsICdzdWInKVxuXHRcdFx0Y2FzZSBTVl9TdXBlcjogcmV0dXJuIG5ldyBJZGVudGlmaWVyKCdzdXBlcicpXG5cdFx0XHRjYXNlIFNWX1RoaXNNb2R1bGVEaXJlY3Rvcnk6IHJldHVybiBuZXcgSWRlbnRpZmllcignX19kaXJuYW1lJylcblx0XHRcdGNhc2UgU1ZfVHJ1ZTogcmV0dXJuIG5ldyBMaXRlcmFsKHRydWUpXG5cdFx0XHRjYXNlIFNWX1VuZGVmaW5lZDogcmV0dXJuIG5ldyBVbmFyeUV4cHJlc3Npb24oJ3ZvaWQnLCBMaXRaZXJvKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHR9XG5cdH0sXG5cblx0U3BsYXQoKSB7XG5cdFx0cmV0dXJuIG5ldyBTcHJlYWRFbGVtZW50KHQwKHRoaXMuc3BsYXR0ZWQpKVxuXHR9LFxuXG5cdFN3aXRjaERvKCkgeyByZXR1cm4gdHJhbnNwaWxlU3dpdGNoKHRoaXMpIH0sXG5cdFN3aXRjaFZhbCgpIHsgcmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoWyB0cmFuc3BpbGVTd2l0Y2godGhpcykgXSkpIH0sXG5cdFN3aXRjaERvUGFydDogc3dpdGNoUGFydCxcblx0U3dpdGNoVmFsUGFydDogc3dpdGNoUGFydCxcblxuXHRUaHJvdygpIHtcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BUaHJvd24sXG5cdFx0XHRfID0+IG5ldyBUaHJvd1N0YXRlbWVudChtc0Vycm9yKHQwKF8pKSksXG5cdFx0XHQoKSA9PiBuZXcgVGhyb3dTdGF0ZW1lbnQobXNFcnJvcihMaXRTdHJUaHJvdykpKVxuXHR9LFxuXG5cdFdpdGgoKSB7XG5cdFx0Y29uc3QgaWREZWNsYXJlID0gaWRGb3JEZWNsYXJlQ2FjaGVkKHRoaXMuZGVjbGFyZSlcblx0XHRjb25zdCBibG9jayA9IHQzKHRoaXMuYmxvY2ssIG51bGwsIG51bGwsIG5ldyBSZXR1cm5TdGF0ZW1lbnQoaWREZWNsYXJlKSlcblx0XHRjb25zdCBmdW4gPSBpc0luR2VuZXJhdG9yID9cblx0XHRcdG5ldyBGdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgWyBpZERlY2xhcmUgXSwgYmxvY2ssIHRydWUpIDpcblx0XHRcdG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihbIGlkRGVjbGFyZSBdLCBibG9jaylcblx0XHRjb25zdCBjYWxsID0gbmV3IENhbGxFeHByZXNzaW9uKGZ1biwgWyB0MCh0aGlzLnZhbHVlKSBdKVxuXHRcdHJldHVybiBpc0luR2VuZXJhdG9yID8gbmV3IFlpZWxkRXhwcmVzc2lvbihjYWxsLCB0cnVlKSA6IGNhbGxcblx0fSxcblxuXHRZaWVsZCgpIHsgcmV0dXJuIG5ldyBZaWVsZEV4cHJlc3Npb24ob3BNYXAodGhpcy5vcFlpZWxkZWQsIHQwKSwgZmFsc2UpIH0sXG5cblx0WWllbGRUbygpIHsgcmV0dXJuIG5ldyBZaWVsZEV4cHJlc3Npb24odDAodGhpcy55aWVsZGVkVG8pLCB0cnVlKSB9XG59KVxuXG5mdW5jdGlvbiBjYXNlUGFydChhbHRlcm5hdGUpIHtcblx0aWYgKHRoaXMudGVzdCBpbnN0YW5jZW9mIFBhdHRlcm4pIHtcblx0XHRjb25zdCB7IHR5cGUsIHBhdHRlcm5lZCwgbG9jYWxzIH0gPSB0aGlzLnRlc3Rcblx0XHRjb25zdCBkZWNsID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgW1xuXHRcdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZEV4dHJhY3QsIG1zRXh0cmFjdCh0MCh0eXBlKSwgdDAocGF0dGVybmVkKSkpIF0pXG5cdFx0Y29uc3QgdGVzdCA9IG5ldyBCaW5hcnlFeHByZXNzaW9uKCchPT0nLCBJZEV4dHJhY3QsIExpdE51bGwpXG5cdFx0Y29uc3QgZXh0cmFjdCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIGxvY2Fscy5tYXAoKF8sIGlkeCkgPT5cblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoXG5cdFx0XHRcdGlkRm9yRGVjbGFyZUNhY2hlZChfKSxcblx0XHRcdFx0bmV3IE1lbWJlckV4cHJlc3Npb24oSWRFeHRyYWN0LCBuZXcgTGl0ZXJhbChpZHgpKSkpKVxuXHRcdGNvbnN0IHJlcyA9IHQxKHRoaXMucmVzdWx0LCBleHRyYWN0KVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoWyBkZWNsLCBuZXcgSWZTdGF0ZW1lbnQodGVzdCwgcmVzLCBhbHRlcm5hdGUpIF0pXG5cdH0gZWxzZVxuXHRcdC8vIGFsdGVybmF0ZSB3cml0dGVuIHRvIGJ5IGBjYXNlQm9keWAuXG5cdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudCh0MCh0aGlzLnRlc3QpLCB0MCh0aGlzLnJlc3VsdCksIGFsdGVybmF0ZSlcbn1cblxuZnVuY3Rpb24gc3dpdGNoUGFydCgpIHtcblx0Y29uc3Qgb3BPdXQgPSBvcElmKHRoaXMgaW5zdGFuY2VvZiBTd2l0Y2hEb1BhcnQsICgpID0+IG5ldyBCcmVha1N0YXRlbWVudClcblx0Y29uc3QgYmxvY2sgPSB0Myh0aGlzLnJlc3VsdCwgbnVsbCwgbnVsbCwgb3BPdXQpXG5cdC8qXG5cdFdlIGNvdWxkIGp1c3QgcGFzcyBibG9jay5ib2R5IGZvciB0aGUgc3dpdGNoIGxpbmVzLCBidXQgaW5zdGVhZFxuXHRlbmNsb3NlIHRoZSBib2R5IG9mIHRoZSBzd2l0Y2ggY2FzZSBpbiBjdXJseSBicmFjZXMgdG8gZW5zdXJlIGEgbmV3IHNjb3BlLlxuXHRUaGF0IHdheSB0aGlzIGNvZGUgd29ya3M6XG5cdFx0c3dpdGNoICgwKSB7XG5cdFx0XHRjYXNlIDA6IHtcblx0XHRcdFx0Y29uc3QgYSA9IDBcblx0XHRcdFx0cmV0dXJuIGFcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0Ly8gV2l0aG91dCBjdXJseSBicmFjZXMgdGhpcyB3b3VsZCBjb25mbGljdCB3aXRoIHRoZSBvdGhlciBgYWAuXG5cdFx0XHRcdGNvbnN0IGEgPSAxXG5cdFx0XHRcdGFcblx0XHRcdH1cblx0XHR9XG5cdCovXG5cdHJldHVybiBuZXcgU3dpdGNoQ2FzZSh0MCh0aGlzLnZhbHVlKSwgWyBibG9jayBdKVxufVxuXG4vLyBGdW5jdGlvbnMgc3BlY2lmaWMgdG8gY2VydGFpbiBleHByZXNzaW9ucy5cbmNvbnN0XG5cdC8vIFdyYXBzIGEgYmxvY2sgKHdpdGggYHJldHVybmAgc3RhdGVtZW50cyBpbiBpdCkgaW4gYW4gSUlGRS5cblx0YmxvY2tXcmFwID0gYmxvY2sgPT4ge1xuXHRcdGNvbnN0IGludm9rZSA9IG5ldyBDYWxsRXhwcmVzc2lvbihmdW5jdGlvbkV4cHJlc3Npb25UaHVuayhibG9jaywgaXNJbkdlbmVyYXRvciksIFsgXSlcblx0XHRyZXR1cm4gaXNJbkdlbmVyYXRvciA/IG5ldyBZaWVsZEV4cHJlc3Npb24oaW52b2tlLCB0cnVlKSA6IGludm9rZVxuXHR9LFxuXG5cdGNhc2VCb2R5ID0gKHBhcnRzLCBvcEVsc2UpID0+IHtcblx0XHRsZXQgYWNjID0gaWZFbHNlKG9wRWxzZSwgdDAsICgpID0+IFRocm93Tm9DYXNlTWF0Y2gpXG5cdFx0Zm9yIChsZXQgaSA9IHBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaSA9IGkgLSAxKVxuXHRcdFx0YWNjID0gdDEocGFydHNbaV0sIGFjYylcblx0XHRyZXR1cm4gYWNjXG5cdH0sXG5cblx0Zm9yTG9vcCA9IChvcEl0ZXJhdGVlLCBibG9jaykgPT5cblx0XHRpZkVsc2Uob3BJdGVyYXRlZSxcblx0XHRcdCh7IGVsZW1lbnQsIGJhZyB9KSA9PiB7XG5cdFx0XHRcdGNvbnN0IGRlY2xhcmUgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignbGV0Jyxcblx0XHRcdFx0XHRbIG5ldyBWYXJpYWJsZURlY2xhcmF0b3IodDAoZWxlbWVudCkpIF0pXG5cdFx0XHRcdHJldHVybiBuZXcgRm9yT2ZTdGF0ZW1lbnQoZGVjbGFyZSwgdDAoYmFnKSwgdDAoYmxvY2spKVxuXHRcdFx0fSxcblx0XHRcdCgpID0+IGZvclN0YXRlbWVudEluZmluaXRlKHQwKGJsb2NrKSkpLFxuXG5cdGNvbnN0cnVjdG9yRGVmaW5pdGlvbiA9IGZ1biA9PiB7XG5cdFx0aXNJbkNvbnN0cnVjdG9yID0gdHJ1ZVxuXHRcdGNvbnN0IHJlcyA9IG5ldyBNZXRob2REZWZpbml0aW9uKFxuXHRcdFx0bmV3IElkZW50aWZpZXIoJ2NvbnN0cnVjdG9yJyksIHQwKGZ1biksICdjb25zdHJ1Y3RvcicsIGZhbHNlLCBmYWxzZSlcblx0XHRpc0luQ29uc3RydWN0b3IgPSBmYWxzZVxuXHRcdHJldHVybiByZXNcblx0fSxcblx0bWV0aG9kRGVmaW5pdGlvbiA9IGlzU3RhdGljID0+IG1ldGhvZCA9PiB7XG5cdFx0aWYgKG1ldGhvZCBpbnN0YW5jZW9mIEZ1bikge1xuXHRcdFx0YXNzZXJ0KG1ldGhvZC5vcE5hbWUgIT09IG51bGwpXG5cdFx0XHRjb25zdCBrZXkgPSBwcm9wZXJ0eUlkT3JMaXRlcmFsQ2FjaGVkKG1ldGhvZC5vcE5hbWUpXG5cdFx0XHRjb25zdCB2YWx1ZSA9IHQwKG1ldGhvZClcblx0XHRcdHZhbHVlLmlkID0gbnVsbFxuXHRcdFx0Y29uc3QgY29tcHV0ZWQgPSBmYWxzZVxuXHRcdFx0cmV0dXJuIG5ldyBNZXRob2REZWZpbml0aW9uKGtleSwgdmFsdWUsICdtZXRob2QnLCBpc1N0YXRpYywgY29tcHV0ZWQpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGFzc2VydChtZXRob2QgaW5zdGFuY2VvZiBNZXRob2RJbXBsKVxuXHRcdFx0Y29uc3QgZnVuID0gbWV0aG9kLmZ1blxuXHRcdFx0YXNzZXJ0KGZ1bi5vcE5hbWUgPT09IG51bGwpXG5cdFx0XHRjb25zdCBrZXkgPSBtc1N5bWJvbCh0MChtZXRob2Quc3ltYm9sKSlcblx0XHRcdGNvbnN0IHZhbHVlID0gdDAoZnVuKVxuXHRcdFx0Ly8gVGhpcyBpcyBoYW5kbGVkIGJ5IGBrZXlgLlxuXHRcdFx0dmFsdWUuaWQgPSBudWxsXG5cdFx0XHQvLyBUT0RPOiBnZXQvc2V0IVxuXHRcdFx0Y29uc3QgY29tcHV0ZWQgPSB0cnVlXG5cdFx0XHRyZXR1cm4gbmV3IE1ldGhvZERlZmluaXRpb24oa2V5LCB2YWx1ZSwgJ21ldGhvZCcsIGlzU3RhdGljLCBjb21wdXRlZClcblx0XHR9XG5cdH0sXG5cblx0dHJhbnNwaWxlQmxvY2sgPSAocmV0dXJuZWQsIGxpbmVzLCBsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KSA9PiB7XG5cdFx0Ly8gVE9ETzpFUzYgT3B0aW9uYWwgYXJndW1lbnRzXG5cdFx0aWYgKGxlYWQgPT09IHVuZGVmaW5lZCkgbGVhZCA9IG51bGxcblx0XHRpZiAob3BEZWNsYXJlUmVzID09PSB1bmRlZmluZWQpIG9wRGVjbGFyZVJlcyA9IG51bGxcblx0XHRpZiAob3BPdXQgPT09IHVuZGVmaW5lZCkgb3BPdXQgPSBudWxsXG5cdFx0Y29uc3QgZmluID0gaWZFbHNlKG9wRGVjbGFyZVJlcyxcblx0XHRcdHJkID0+IHtcblx0XHRcdFx0Y29uc3QgcmV0ID0gbWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHJldHVybmVkLCByZC5vcFR5cGUsIHJkLm5hbWUpXG5cdFx0XHRcdHJldHVybiBpZkVsc2Uob3BPdXQsXG5cdFx0XHRcdFx0XyA9PiBjYXQoZGVjbGFyZShyZCwgcmV0KSwgXywgUmV0dXJuUmVzKSxcblx0XHRcdFx0XHQoKSA9PiBuZXcgUmV0dXJuU3RhdGVtZW50KHJldCkpXG5cdFx0XHR9LFxuXHRcdFx0KCkgPT4gY2F0KG9wT3V0LCBuZXcgUmV0dXJuU3RhdGVtZW50KHJldHVybmVkKSkpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgbGluZXMsIGZpbikpXG5cdH0sXG5cblx0dHJhbnNwaWxlRXhjZXB0ID0gZXhjZXB0ID0+XG5cdFx0bmV3IFRyeVN0YXRlbWVudChcblx0XHRcdHQwKGV4Y2VwdC5fdHJ5KSxcblx0XHRcdG9wTWFwKGV4Y2VwdC5fY2F0Y2gsIHQwKSxcblx0XHRcdG9wTWFwKGV4Y2VwdC5fZmluYWxseSwgdDApKSxcblxuXHR0cmFuc3BpbGVTd2l0Y2ggPSBfID0+IHtcblx0XHRjb25zdCBwYXJ0cyA9IF8ucGFydHMubWFwKHQwKVxuXG5cdFx0cGFydHMucHVzaChpZkVsc2UoXy5vcEVsc2UsXG5cdFx0XHRfID0+IG5ldyBTd2l0Y2hDYXNlKHVuZGVmaW5lZCwgdDAoXykuYm9keSksXG5cdFx0XHQoKSA9PiBTd2l0Y2hDYXNlTm9NYXRjaCkpXG5cblx0XHRyZXR1cm4gbmV3IFN3aXRjaFN0YXRlbWVudCh0MChfLnN3aXRjaGVkKSwgcGFydHMpXG5cdH1cblxuLy8gTW9kdWxlIGhlbHBlcnNcbmNvbnN0XG5cdGFtZFdyYXBNb2R1bGUgPSAoZG9Vc2VzLCBvdGhlclVzZXMsIGJvZHkpID0+IHtcblx0XHRjb25zdCBhbGxVc2VzID0gZG9Vc2VzLmNvbmNhdChvdGhlclVzZXMpXG5cdFx0Y29uc3QgdXNlUGF0aHMgPSBuZXcgQXJyYXlFeHByZXNzaW9uKGNhdChcblx0XHRcdExpdFN0ckV4cG9ydHMsXG5cdFx0XHRhbGxVc2VzLm1hcChfID0+IG5ldyBMaXRlcmFsKG1hbmdsZVBhdGgoXy5wYXRoKSkpKSlcblx0XHRjb25zdCB1c2VJZGVudGlmaWVycyA9IGFsbFVzZXMubWFwKChfLCBpKSA9PiBpZENhY2hlZChgJHtwYXRoQmFzZU5hbWUoXy5wYXRoKX1fJHtpfWApKVxuXHRcdGNvbnN0IHVzZUFyZ3MgPSBjYXQoSWRFeHBvcnRzLCB1c2VJZGVudGlmaWVycylcblx0XHRjb25zdCB1c2VEb3MgPSBkb1VzZXMubWFwKCh1c2UsIGkpID0+XG5cdFx0XHRsb2MobmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQobXNHZXRNb2R1bGUodXNlSWRlbnRpZmllcnNbaV0pKSwgdXNlLmxvYykpXG5cdFx0Y29uc3Qgb3BVc2VEZWNsYXJlID0gb3BJZighaXNFbXB0eShvdGhlclVzZXMpLFxuXHRcdFx0KCkgPT4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgZmxhdE1hcChvdGhlclVzZXMsICh1c2UsIGkpID0+XG5cdFx0XHRcdHVzZURlY2xhcmF0b3JzKHVzZSwgdXNlSWRlbnRpZmllcnNbaSArIGRvVXNlcy5sZW5ndGhdKSkpKVxuXHRcdGNvbnN0IGZ1bGxCb2R5ID0gbmV3IEJsb2NrU3RhdGVtZW50KGNhdCh1c2VEb3MsIG9wVXNlRGVjbGFyZSwgYm9keSwgUmV0dXJuRXhwb3J0cykpXG5cdFx0Y29uc3QgbGF6eUJvZHkgPVxuXHRcdFx0Y29udGV4dC5vcHRzLmxhenlNb2R1bGUoKSA/XG5cdFx0XHRcdG5ldyBCbG9ja1N0YXRlbWVudChbIG5ldyBFeHByZXNzaW9uU3RhdGVtZW50KFxuXHRcdFx0XHRcdG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIEV4cG9ydHNHZXQsXG5cdFx0XHRcdFx0XHRtc0xhenkoZnVuY3Rpb25FeHByZXNzaW9uVGh1bmsoZnVsbEJvZHkpKSkpIF0pIDpcblx0XHRcdFx0ZnVsbEJvZHlcblx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKElkRGVmaW5lLFxuXHRcdFx0WyB1c2VQYXRocywgbmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKHVzZUFyZ3MsIGxhenlCb2R5KSBdKVxuXHR9LFxuXG5cdHBhdGhCYXNlTmFtZSA9IHBhdGggPT5cblx0XHRwYXRoLnN1YnN0cihwYXRoLmxhc3RJbmRleE9mKCcvJykgKyAxKSxcblxuXHR1c2VEZWNsYXJhdG9ycyA9ICh1c2UsIG1vZHVsZUlkZW50aWZpZXIpID0+IHtcblx0XHQvLyBUT0RPOiBDb3VsZCBiZSBuZWF0ZXIgYWJvdXQgdGhpc1xuXHRcdGNvbnN0IGlzTGF6eSA9IChpc0VtcHR5KHVzZS51c2VkKSA/IHVzZS5vcFVzZURlZmF1bHQgOiB1c2UudXNlZFswXSkuaXNMYXp5KClcblx0XHRjb25zdCB2YWx1ZSA9IChpc0xhenkgPyBtc0xhenlHZXRNb2R1bGUgOiBtc0dldE1vZHVsZSkobW9kdWxlSWRlbnRpZmllcilcblxuXHRcdGNvbnN0IHVzZWREZWZhdWx0ID0gb3BNYXAodXNlLm9wVXNlRGVmYXVsdCwgZGVmID0+IHtcblx0XHRcdGNvbnN0IGRlZmV4cCA9IG1zR2V0RGVmYXVsdEV4cG9ydChtb2R1bGVJZGVudGlmaWVyKVxuXHRcdFx0Y29uc3QgdmFsID0gaXNMYXp5ID8gbGF6eVdyYXAoZGVmZXhwKSA6IGRlZmV4cFxuXHRcdFx0cmV0dXJuIGxvYyhuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRm9yRGVjbGFyZUNhY2hlZChkZWYpLCB2YWwpLCBkZWYubG9jKVxuXHRcdH0pXG5cblx0XHRjb25zdCB1c2VkRGVzdHJ1Y3QgPSBpc0VtcHR5KHVzZS51c2VkKSA/IG51bGwgOlxuXHRcdFx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnModXNlLnVzZWQsIGlzTGF6eSwgdmFsdWUsIHRydWUsIGZhbHNlKVxuXG5cdFx0cmV0dXJuIGNhdCh1c2VkRGVmYXVsdCwgdXNlZERlc3RydWN0KVxuXHR9XG5cbi8vIEdlbmVyYWwgdXRpbHMuIE5vdCBpbiB1dGlsLmpzIGJlY2F1c2UgdGhlc2UgY2xvc2Ugb3ZlciBjb250ZXh0LlxuY29uc3Rcblx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMgPSAoYXNzaWduZWVzLCBpc0xhenksIHZhbHVlLCBpc01vZHVsZSwgaXNFeHBvcnQpID0+IHtcblx0XHRjb25zdCBkZXN0cnVjdHVyZWROYW1lID0gYF8kJHthc3NpZ25lZXNbMF0ubG9jLnN0YXJ0LmxpbmV9YFxuXHRcdGNvbnN0IGlkRGVzdHJ1Y3R1cmVkID0gbmV3IElkZW50aWZpZXIoZGVzdHJ1Y3R1cmVkTmFtZSlcblx0XHRjb25zdCBkZWNsYXJhdG9ycyA9IGFzc2lnbmVlcy5tYXAoYXNzaWduZWUgPT4ge1xuXHRcdFx0Ly8gVE9ETzogRG9uJ3QgY29tcGlsZSBpdCBpZiBpdCdzIG5ldmVyIGFjY2Vzc2VkXG5cdFx0XHRjb25zdCBnZXQgPSBnZXRNZW1iZXIoaWREZXN0cnVjdHVyZWQsIGFzc2lnbmVlLm5hbWUsIGlzTGF6eSwgaXNNb2R1bGUpXG5cdFx0XHRyZXR1cm4gbWFrZURlY2xhcmF0b3IoYXNzaWduZWUsIGdldCwgaXNMYXp5LCBpc0V4cG9ydClcblx0XHR9KVxuXHRcdC8vIEdldHRpbmcgbGF6eSBtb2R1bGUgaXMgZG9uZSBieSBtcy5sYXp5R2V0TW9kdWxlLlxuXHRcdGNvbnN0IHZhbCA9IChpc0xhenkgJiYgIWlzTW9kdWxlKSA/IGxhenlXcmFwKHZhbHVlKSA6IHZhbHVlXG5cdFx0cmV0dXJuIHVuc2hpZnQobmV3IFZhcmlhYmxlRGVjbGFyYXRvcihpZERlc3RydWN0dXJlZCwgdmFsKSwgZGVjbGFyYXRvcnMpXG5cdH0sXG5cblx0bWFrZURlY2xhcmF0b3IgPSAoYXNzaWduZWUsIHZhbHVlLCB2YWx1ZUlzQWxyZWFkeUxhenksIGlzRXhwb3J0KSA9PiB7XG5cdFx0Y29uc3QgeyBsb2MsIG5hbWUsIG9wVHlwZSB9ID0gYXNzaWduZWVcblx0XHRjb25zdCBpc0xhenkgPSBhc3NpZ25lZS5pc0xhenkoKVxuXHRcdC8vIFRPRE86IGFzc2VydChhc3NpZ25lZS5vcFR5cGUgPT09IG51bGwpXG5cdFx0Ly8gb3IgVE9ETzogQWxsb3cgdHlwZSBjaGVjayBvbiBsYXp5IHZhbHVlP1xuXHRcdHZhbHVlID0gaXNMYXp5ID8gdmFsdWUgOiBtYXliZVdyYXBJbkNoZWNrQ29udGFpbnModmFsdWUsIG9wVHlwZSwgbmFtZSlcblx0XHRpZiAoaXNFeHBvcnQpIHtcblx0XHRcdC8vIFRPRE86RVM2XG5cdFx0XHRjb250ZXh0LmNoZWNrKCFpc0xhenksIGxvYywgJ0xhenkgZXhwb3J0IG5vdCBzdXBwb3J0ZWQuJylcblx0XHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdG9yKFxuXHRcdFx0XHRpZEZvckRlY2xhcmVDYWNoZWQoYXNzaWduZWUpLFxuXHRcdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRFeHBvcnRzLCBuYW1lKSwgdmFsdWUpKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCB2YWwgPSBpc0xhenkgJiYgIXZhbHVlSXNBbHJlYWR5TGF6eSA/IGxhenlXcmFwKHZhbHVlKSA6IHZhbHVlXG5cdFx0XHRhc3NlcnQoaXNMYXp5IHx8ICF2YWx1ZUlzQWxyZWFkeUxhenkpXG5cdFx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRvcihpZEZvckRlY2xhcmVDYWNoZWQoYXNzaWduZWUpLCB2YWwpXG5cdFx0fVxuXHR9LFxuXG5cdG1heWJlV3JhcEluQ2hlY2tDb250YWlucyA9IChhc3QsIG9wVHlwZSwgbmFtZSkgPT5cblx0XHQoY29udGV4dC5vcHRzLmluY2x1ZGVDaGVja3MoKSAmJiBvcFR5cGUgIT09IG51bGwpID9cblx0XHRcdG1zQ2hlY2tDb250YWlucyh0MChvcFR5cGUpLCBhc3QsIG5ldyBMaXRlcmFsKG5hbWUpKSA6XG5cdFx0XHRhc3QsXG5cblx0Z2V0TWVtYmVyID0gKGFzdE9iamVjdCwgZ290TmFtZSwgaXNMYXp5LCBpc01vZHVsZSkgPT5cblx0XHRpc0xhenkgP1xuXHRcdG1zTGF6eUdldChhc3RPYmplY3QsIG5ldyBMaXRlcmFsKGdvdE5hbWUpKSA6XG5cdFx0aXNNb2R1bGUgJiYgY29udGV4dC5vcHRzLmluY2x1ZGVDaGVja3MoKSA/XG5cdFx0bXNHZXQoYXN0T2JqZWN0LCBuZXcgTGl0ZXJhbChnb3ROYW1lKSkgOlxuXHRcdG1lbWJlcihhc3RPYmplY3QsIGdvdE5hbWUpXG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==
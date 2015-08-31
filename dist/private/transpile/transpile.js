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
			const methods = (0, _util.cat)(this.statics.map(_ => t1(_, true)), (0, _util.opMap)(this.opConstructor, constructorDefinition), this.methods.map(_ => t1(_, false)));
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

		Ignore() {
			return [];
		},

		Lazy() {
			return (0, _msCall.lazyWrap)(t0(this.value));
		},

		MethodImpl(isStatic) {
			(0, _util.assert)(this.fun.opName === null);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zcGlsZS5qcyIsInByaXZhdGUvdHJhbnNwaWxlL3RyYW5zcGlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7QUM2QkEsS0FBSSxPQUFPLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxlQUFlLENBQUE7O21CQUUzQyxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLEtBQUs7QUFDOUQsU0FBTyxHQUFHLFFBQVEsQ0FBQTtBQUNsQixlQUFhLEdBQUcsY0FBYyxDQUFBO0FBQzlCLGVBQWEsR0FBRyxLQUFLLENBQUE7QUFDckIsaUJBQWUsR0FBRyxLQUFLLENBQUE7QUFDdkIsUUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUE7O0FBRWhDLFNBQU8sR0FBRyxhQUFhLEdBQUcsU0FBUyxDQUFBO0FBQ25DLFNBQU8sR0FBRyxDQUFBO0VBQ1Y7O0FBRU0sT0FDTixFQUFFLEdBQUcsSUFBSSxJQUFJLG1CQW5DOEIsR0FBRyxFQW1DN0IsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFDN0MsT0FDQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxLQUFLLG1CQXJDdUIsR0FBRyxFQXFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDO09BQ3RELEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksS0FBSyxtQkF0Q1csR0FBRyxFQXNDVixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQztPQUM5RSxNQUFNLEdBQUcsS0FBSyxJQUFJO0FBQ2pCLFFBQU0sR0FBRyxHQUFHLEVBQUcsQ0FBQTtBQUNmLE9BQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO0FBQ3pCLFNB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LGFBQWEsRUFBRSxHQUN4QyxZQTluQm9DLEtBQUssRUE4bkJuQyxTQUFTLEVBQUUsa0JBbHBCMkIsT0FBTyxDQWtwQnRCLE9BQU8sQ0FBQyxDQUFDLEdBQ3RDLG1CQTlvQitDLE1BQU0sRUE4b0I5QyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUEiLCJmaWxlIjoicHJpdmF0ZS90cmFuc3BpbGUvdHJhbnNwaWxlLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQgeyBBcnJheUV4cHJlc3Npb24sIEFycm93RnVuY3Rpb25FeHByZXNzaW9uLCBBc3NpZ25tZW50RXhwcmVzc2lvbiwgQmluYXJ5RXhwcmVzc2lvbixcblx0QmxvY2tTdGF0ZW1lbnQsIEJyZWFrU3RhdGVtZW50LCBDYWxsRXhwcmVzc2lvbiwgQ2F0Y2hDbGF1c2UsIENsYXNzQm9keSwgQ2xhc3NFeHByZXNzaW9uLFxuXHRDb25kaXRpb25hbEV4cHJlc3Npb24sIERlYnVnZ2VyU3RhdGVtZW50LCBFeHByZXNzaW9uU3RhdGVtZW50LCBGb3JPZlN0YXRlbWVudCxcblx0RnVuY3Rpb25FeHByZXNzaW9uLCBJZGVudGlmaWVyLCBJZlN0YXRlbWVudCwgTGl0ZXJhbCwgTG9naWNhbEV4cHJlc3Npb24sIE1lbWJlckV4cHJlc3Npb24sXG5cdE1ldGhvZERlZmluaXRpb24sIE5ld0V4cHJlc3Npb24sIE9iamVjdEV4cHJlc3Npb24sIFByb2dyYW0sIFByb3BlcnR5LCBSZXR1cm5TdGF0ZW1lbnQsXG5cdFNwcmVhZEVsZW1lbnQsIFN3aXRjaENhc2UsIFN3aXRjaFN0YXRlbWVudCwgVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uLCBUZW1wbGF0ZUVsZW1lbnQsXG5cdFRlbXBsYXRlTGl0ZXJhbCwgVGhpc0V4cHJlc3Npb24sIFRocm93U3RhdGVtZW50LCBUcnlTdGF0ZW1lbnQsIFZhcmlhYmxlRGVjbGFyYXRpb24sXG5cdFVuYXJ5RXhwcmVzc2lvbiwgVmFyaWFibGVEZWNsYXJhdG9yLCBZaWVsZEV4cHJlc3Npb24gfSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7IGZ1bmN0aW9uRXhwcmVzc2lvblRodW5rLCBpZENhY2hlZCwgbG9jLCBtZW1iZXIsIHByb3BlcnR5SWRPckxpdGVyYWxDYWNoZWQsIHRvU3RhdGVtZW50XG5cdH0gZnJvbSAnZXNhc3QvZGlzdC91dGlsJ1xuaW1wb3J0IG1hbmdsZVBhdGggZnJvbSAnLi4vbWFuZ2xlUGF0aCdcbmltcG9ydCAqIGFzIE1zQXN0VHlwZXMgZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQgeyBBc3NpZ25TaW5nbGUsIENhbGwsIExfQW5kLCBMX09yLCBMRF9MYXp5LCBMRF9NdXRhYmxlLCBNSV9HZXQsIE1JX1BsYWluLCBNSV9TZXQsIE1TX011dGF0ZSxcblx0TVNfTmV3LCBNU19OZXdNdXRhYmxlLCBQYXR0ZXJuLCBTcGxhdCwgU0RfRGVidWdnZXIsIFNWX0NvbnRhaW5zLCBTVl9GYWxzZSwgU1ZfTnVsbCwgU1ZfU3ViLFxuXHRTVl9TdXBlciwgU1ZfVGhpc01vZHVsZURpcmVjdG9yeSwgU1ZfVHJ1ZSwgU1ZfVW5kZWZpbmVkLCBTd2l0Y2hEb1BhcnQgfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7IGFzc2VydCwgY2F0LCBmbGF0TWFwLCBmbGF0T3BNYXAsIGlmRWxzZSwgaXNFbXB0eSxcblx0aW1wbGVtZW50TWFueSwgaXNQb3NpdGl2ZSwgb3BJZiwgb3BNYXAsIHRhaWwsIHVuc2hpZnQgfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHsgQW1kZWZpbmVIZWFkZXIsIEFycmF5U2xpY2VDYWxsLCBEZWNsYXJlQnVpbHRCYWcsIERlY2xhcmVCdWlsdE1hcCwgRGVjbGFyZUJ1aWx0T2JqLFxuXHRFeHBvcnRzRGVmYXVsdCwgRXhwb3J0c0dldCwgSWRBcmd1bWVudHMsIElkQnVpbHQsIElkRGVmaW5lLCBJZEV4cG9ydHMsXG5cdElkRXh0cmFjdCwgSWRMZXhpY2FsVGhpcywgTGl0RW1wdHlTdHJpbmcsIExpdE51bGwsIExpdFN0ckV4cG9ydHMsIExpdFN0clRocm93LCBMaXRaZXJvLFxuXHRSZXR1cm5CdWlsdCwgUmV0dXJuRXhwb3J0cywgUmV0dXJuUmVzLCBTd2l0Y2hDYXNlTm9NYXRjaCwgVGhyb3dBc3NlcnRGYWlsLCBUaHJvd05vQ2FzZU1hdGNoLFxuXHRVc2VTdHJpY3QgfSBmcm9tICcuL2FzdC1jb25zdGFudHMnXG5pbXBvcnQgeyBJZE1zLCBsYXp5V3JhcCwgbXNBZGQsIG1zQWRkTWFueSwgbXNBc3NlcnQsIG1zQXNzZXJ0Tm90LCBtc0Fzc29jLFxuXHRtc0NoZWNrQ29udGFpbnMsIG1zRXJyb3IsIG1zRXh0cmFjdCwgbXNHZXQsIG1zR2V0RGVmYXVsdEV4cG9ydCwgbXNHZXRNb2R1bGUsIG1zTGF6eSwgbXNMYXp5R2V0LFxuXHRtc0xhenlHZXRNb2R1bGUsIG1zTmV3TXV0YWJsZVByb3BlcnR5LCBtc05ld1Byb3BlcnR5LCBtc1NldCwgbXNTZXROYW1lLCBtc1NldExhenksXHRtc1NvbWUsXG5cdG1zU3ltYm9sLCBNc05vbmUgfSBmcm9tICcuL21zLWNhbGwnXG5pbXBvcnQgeyBhY2Nlc3NMb2NhbERlY2xhcmUsIGRlY2xhcmUsIGZvclN0YXRlbWVudEluZmluaXRlLCBpZEZvckRlY2xhcmVDYWNoZWQsXG5cdG9wVHlwZUNoZWNrRm9yTG9jYWxEZWNsYXJlIH0gZnJvbSAnLi91dGlsJ1xuXG5sZXQgY29udGV4dCwgdmVyaWZ5UmVzdWx0cywgaXNJbkdlbmVyYXRvciwgaXNJbkNvbnN0cnVjdG9yXG5cbmV4cG9ydCBkZWZhdWx0IChfY29udGV4dCwgbW9kdWxlRXhwcmVzc2lvbiwgX3ZlcmlmeVJlc3VsdHMpID0+IHtcblx0Y29udGV4dCA9IF9jb250ZXh0XG5cdHZlcmlmeVJlc3VsdHMgPSBfdmVyaWZ5UmVzdWx0c1xuXHRpc0luR2VuZXJhdG9yID0gZmFsc2Vcblx0aXNJbkNvbnN0cnVjdG9yID0gZmFsc2Vcblx0Y29uc3QgcmVzID0gdDAobW9kdWxlRXhwcmVzc2lvbilcblx0Ly8gUmVsZWFzZSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuXHRjb250ZXh0ID0gdmVyaWZ5UmVzdWx0cyA9IHVuZGVmaW5lZFxuXHRyZXR1cm4gcmVzXG59XG5cbmV4cG9ydCBjb25zdFxuXHR0MCA9IGV4cHIgPT4gbG9jKGV4cHIudHJhbnNwaWxlKCksIGV4cHIubG9jKVxuY29uc3Rcblx0dDEgPSAoZXhwciwgYXJnKSA9PiBsb2MoZXhwci50cmFuc3BpbGUoYXJnKSwgZXhwci5sb2MpLFxuXHR0MyA9IChleHByLCBhcmcsIGFyZzIsIGFyZzMpID0+IGxvYyhleHByLnRyYW5zcGlsZShhcmcsIGFyZzIsIGFyZzMpLCBleHByLmxvYyksXG5cdHRMaW5lcyA9IGV4cHJzID0+IHtcblx0XHRjb25zdCBvdXQgPSBbIF1cblx0XHRmb3IgKGNvbnN0IGV4cHIgb2YgZXhwcnMpIHtcblx0XHRcdGNvbnN0IGFzdCA9IGV4cHIudHJhbnNwaWxlKClcblx0XHRcdGlmIChhc3QgaW5zdGFuY2VvZiBBcnJheSlcblx0XHRcdFx0Ly8gRGVidWcgbWF5IHByb2R1Y2UgbXVsdGlwbGUgc3RhdGVtZW50cy5cblx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIGFzdClcblx0XHRcdFx0XHRvdXQucHVzaCh0b1N0YXRlbWVudChfKSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0b3V0LnB1c2gobG9jKHRvU3RhdGVtZW50KGFzdCksIGV4cHIubG9jKSlcblx0XHR9XG5cdFx0cmV0dXJuIG91dFxuXHR9XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ3RyYW5zcGlsZScsIHtcblx0QXNzZXJ0KCkge1xuXHRcdGNvbnN0IGZhaWxDb25kID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgY29uZCA9IHQwKHRoaXMuY29uZGl0aW9uKVxuXHRcdFx0cmV0dXJuIHRoaXMubmVnYXRlID8gY29uZCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCBjb25kKVxuXHRcdH1cblxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcFRocm93bixcblx0XHRcdHRocm93biA9PiBuZXcgSWZTdGF0ZW1lbnQoZmFpbENvbmQoKSxuZXcgIFRocm93U3RhdGVtZW50KG1zRXJyb3IodDAodGhyb3duKSkpKSxcblx0XHRcdCgpID0+IHtcblx0XHRcdFx0aWYgKHRoaXMuY29uZGl0aW9uIGluc3RhbmNlb2YgQ2FsbCkge1xuXHRcdFx0XHRcdGNvbnN0IGNhbGwgPSB0aGlzLmNvbmRpdGlvblxuXHRcdFx0XHRcdGNvbnN0IGFzcyA9IHRoaXMubmVnYXRlID8gbXNBc3NlcnROb3QgOiBtc0Fzc2VydFxuXHRcdFx0XHRcdHJldHVybiBhc3ModDAoY2FsbC5jYWxsZWQpLCAuLi5jYWxsLmFyZ3MubWFwKHQwKSlcblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudChmYWlsQ29uZCgpLCBUaHJvd0Fzc2VydEZhaWwpXG5cdFx0XHR9KVxuXHR9LFxuXG5cdEFzc2lnblNpbmdsZSh2YWxXcmFwKSB7XG5cdFx0Y29uc3QgdmFsID0gdmFsV3JhcCA9PT0gdW5kZWZpbmVkID8gdDAodGhpcy52YWx1ZSkgOiB2YWxXcmFwKHQwKHRoaXMudmFsdWUpKVxuXHRcdGNvbnN0IGRlY2xhcmUgPVxuXHRcdFx0bWFrZURlY2xhcmF0b3IodGhpcy5hc3NpZ25lZSwgdmFsLCBmYWxzZSwgdmVyaWZ5UmVzdWx0cy5pc0V4cG9ydEFzc2lnbih0aGlzKSlcblx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24odGhpcy5hc3NpZ25lZS5pc011dGFibGUoKSA/ICdsZXQnIDogJ2NvbnN0JywgWyBkZWNsYXJlIF0pXG5cdH0sXG5cdC8vIFRPRE86RVM2IEp1c3QgdXNlIG5hdGl2ZSBkZXN0cnVjdHVyaW5nIGFzc2lnblxuXHRBc3NpZ25EZXN0cnVjdHVyZSgpIHtcblx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24odGhpcy5raW5kKCkgPT09IExEX011dGFibGUgPyAnbGV0JyA6ICdjb25zdCcsXG5cdFx0XHRtYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycyhcblx0XHRcdFx0dGhpcy5hc3NpZ25lZXMsXG5cdFx0XHRcdHRoaXMua2luZCgpID09PSBMRF9MYXp5LFxuXHRcdFx0XHR0MCh0aGlzLnZhbHVlKSxcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdHZlcmlmeVJlc3VsdHMuaXNFeHBvcnRBc3NpZ24odGhpcykpKVxuXHR9LFxuXG5cdEJhZ0VudHJ5KCkgeyByZXR1cm4gbXNBZGQoSWRCdWlsdCwgdDAodGhpcy52YWx1ZSkpIH0sXG5cblx0QmFnRW50cnlNYW55KCkgeyByZXR1cm4gbXNBZGRNYW55KElkQnVpbHQsIHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdEJhZ1NpbXBsZSgpIHsgcmV0dXJuIG5ldyBBcnJheUV4cHJlc3Npb24odGhpcy5wYXJ0cy5tYXAodDApKSB9LFxuXG5cdEJsb2NrRG8obGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkge1xuXHRcdC8vIFRPRE86RVM2IE9wdGlvbmFsIGFyZ3VtZW50c1xuXHRcdGlmIChsZWFkID09PSB1bmRlZmluZWQpIGxlYWQgPSBudWxsXG5cdFx0aWYgKG9wRGVjbGFyZVJlcyA9PT0gdW5kZWZpbmVkKSBvcERlY2xhcmVSZXMgPSBudWxsXG5cdFx0aWYgKG9wT3V0ID09PSB1bmRlZmluZWQpIG9wT3V0ID0gbnVsbFxuXHRcdGFzc2VydChvcERlY2xhcmVSZXMgPT09IG51bGwpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgdExpbmVzKHRoaXMubGluZXMpLCBvcE91dCkpXG5cdH0sXG5cblx0QmxvY2tWYWxUaHJvdyhsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KSB7XG5cdFx0Ly8gVE9ETzpFUzYgT3B0aW9uYWwgYXJndW1lbnRzXG5cdFx0aWYgKGxlYWQgPT09IHVuZGVmaW5lZCkgbGVhZCA9IG51bGxcblx0XHRpZiAob3BEZWNsYXJlUmVzID09PSB1bmRlZmluZWQpIG9wRGVjbGFyZVJlcyA9IG51bGxcblx0XHRpZiAob3BPdXQgPT09IHVuZGVmaW5lZCkgb3BPdXQgPSBudWxsXG5cdFx0Y29udGV4dC53YXJuSWYob3BEZWNsYXJlUmVzICE9PSBudWxsIHx8IG9wT3V0ICE9PSBudWxsLCB0aGlzLmxvYyxcblx0XHRcdCdPdXQgY29uZGl0aW9uIGlnbm9yZWQgYmVjYXVzZSBvZiBvaC1ubyEnKVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHRMaW5lcyh0aGlzLmxpbmVzKSwgdDAodGhpcy50aHJvdykpKVxuXHR9LFxuXG5cdEJsb2NrV2l0aFJldHVybihsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKHQwKHRoaXMucmV0dXJuZWQpLCB0TGluZXModGhpcy5saW5lcyksIGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpXG5cdH0sXG5cblx0QmxvY2tCYWcobGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayhcblx0XHRcdElkQnVpbHQsXG5cdFx0XHRjYXQoRGVjbGFyZUJ1aWx0QmFnLCB0TGluZXModGhpcy5saW5lcykpLFxuXHRcdFx0bGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dClcblx0fSxcblxuXHRCbG9ja09iaihsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KSB7XG5cdFx0Y29uc3QgbGluZXMgPSBjYXQoRGVjbGFyZUJ1aWx0T2JqLCB0TGluZXModGhpcy5saW5lcykpXG5cdFx0Y29uc3QgcmVzID0gaWZFbHNlKHRoaXMub3BPYmplZCxcblx0XHRcdG9iamVkID0+IGlmRWxzZSh0aGlzLm9wTmFtZSxcblx0XHRcdFx0bmFtZSA9PiBtc1NldCh0MChvYmplZCksIElkQnVpbHQsIG5ldyBMaXRlcmFsKG5hbWUpKSxcblx0XHRcdFx0KCkgPT4gbXNTZXQodDAob2JqZWQpLCBJZEJ1aWx0KSksXG5cdFx0XHQoKSA9PiBpZkVsc2UodGhpcy5vcE5hbWUsXG5cdFx0XHRcdF8gPT4gbXNTZXROYW1lKElkQnVpbHQsIG5ldyBMaXRlcmFsKF8pKSxcblx0XHRcdFx0KCkgPT4gSWRCdWlsdCkpXG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKHJlcywgbGluZXMsIGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpXG5cdH0sXG5cblx0QmxvY2tNYXAobGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayhcblx0XHRcdElkQnVpbHQsXG5cdFx0XHRjYXQoRGVjbGFyZUJ1aWx0TWFwLCB0TGluZXModGhpcy5saW5lcykpLFxuXHRcdFx0bGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dClcblx0fSxcblxuXHRCbG9ja1dyYXAoKSB7IHJldHVybiBibG9ja1dyYXAodDAodGhpcy5ibG9jaykpIH0sXG5cblx0QnJlYWsoKSB7IHJldHVybiBuZXcgQnJlYWtTdGF0ZW1lbnQoKSB9LFxuXG5cdEJyZWFrV2l0aFZhbCgpIHsgcmV0dXJuIG5ldyBSZXR1cm5TdGF0ZW1lbnQodDAodGhpcy52YWx1ZSkpIH0sXG5cblx0Q2FsbCgpIHtcblx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKHQwKHRoaXMuY2FsbGVkKSwgdGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0Q2FzZURvKCkge1xuXHRcdGNvbnN0IGJvZHkgPSBjYXNlQm9keSh0aGlzLnBhcnRzLCB0aGlzLm9wRWxzZSlcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BDYXNlZCwgXyA9PiBuZXcgQmxvY2tTdGF0ZW1lbnQoWyB0MChfKSwgYm9keSBdKSwgKCkgPT4gYm9keSlcblx0fSxcblx0Q2FzZVZhbCgpIHtcblx0XHRjb25zdCBib2R5ID0gY2FzZUJvZHkodGhpcy5wYXJ0cywgdGhpcy5vcEVsc2UpXG5cdFx0Y29uc3QgYmxvY2sgPSBpZkVsc2UodGhpcy5vcENhc2VkLCBfID0+IFsgdDAoXyksIGJvZHkgXSwgKCkgPT4gWyBib2R5IF0pXG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoYmxvY2spKVxuXHR9LFxuXHRDYXNlRG9QYXJ0OiBjYXNlUGFydCxcblx0Q2FzZVZhbFBhcnQ6IGNhc2VQYXJ0LFxuXG5cdENsYXNzKCkge1xuXHRcdGNvbnN0IG1ldGhvZHMgPSBjYXQoXG5cdFx0XHR0aGlzLnN0YXRpY3MubWFwKF8gPT4gdDEoXywgdHJ1ZSkpLFxuXHRcdFx0b3BNYXAodGhpcy5vcENvbnN0cnVjdG9yLCBjb25zdHJ1Y3RvckRlZmluaXRpb24pLFxuXHRcdFx0dGhpcy5tZXRob2RzLm1hcChfID0+IHQxKF8sIGZhbHNlKSkpXG5cdFx0Y29uc3Qgb3BOYW1lID0gb3BNYXAodGhpcy5vcE5hbWUsIGlkQ2FjaGVkKVxuXHRcdGNvbnN0IGNsYXNzRXhwciA9IG5ldyBDbGFzc0V4cHJlc3Npb24oXG5cdFx0XHRvcE5hbWUsXG5cdFx0XHRvcE1hcCh0aGlzLm9wU3VwZXJDbGFzcywgdDApLCBuZXcgQ2xhc3NCb2R5KG1ldGhvZHMpKVxuXG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wRG8sIF8gPT4gdDEoXywgY2xhc3NFeHByKSwgKCkgPT4gY2xhc3NFeHByKVxuXHR9LFxuXG5cdENsYXNzRG8oY2xhc3NFeHByKSB7XG5cdFx0Y29uc3QgbGVhZCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IodDAodGhpcy5kZWNsYXJlRm9jdXMpLCBjbGFzc0V4cHIpIF0pXG5cdFx0Y29uc3QgcmV0ID0gbmV3IFJldHVyblN0YXRlbWVudCh0MCh0aGlzLmRlY2xhcmVGb2N1cykpXG5cdFx0Y29uc3QgYmxvY2sgPSB0Myh0aGlzLmJsb2NrLCBsZWFkLCBudWxsLCByZXQpXG5cdFx0cmV0dXJuIGJsb2NrV3JhcChibG9jaylcblx0fSxcblxuXHRDb25kaXRpb25hbERvKCkge1xuXHRcdGNvbnN0IHRlc3QgPSB0MCh0aGlzLnRlc3QpXG5cdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudChcblx0XHRcdHRoaXMuaXNVbmxlc3MgPyBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgdGVzdCkgOiB0ZXN0LFxuXHRcdFx0dDAodGhpcy5yZXN1bHQpKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsVmFsKCkge1xuXHRcdGNvbnN0IHRlc3QgPSB0MCh0aGlzLnRlc3QpXG5cdFx0Y29uc3QgcmVzdWx0ID0gbXNTb21lKGJsb2NrV3JhcCh0MCh0aGlzLnJlc3VsdCkpKVxuXHRcdHJldHVybiB0aGlzLmlzVW5sZXNzID9cblx0XHRcdG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odGVzdCwgTXNOb25lLCByZXN1bHQpIDpcblx0XHRcdG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odGVzdCwgcmVzdWx0LCBNc05vbmUpXG5cdH0sXG5cblx0Q2F0Y2goKSB7XG5cdFx0cmV0dXJuIG5ldyBDYXRjaENsYXVzZSh0MCh0aGlzLmNhdWdodCksIHQwKHRoaXMuYmxvY2spKVxuXHR9LFxuXG5cdERlYnVnKCkgeyByZXR1cm4gY29udGV4dC5vcHRzLmluY2x1ZGVDaGVja3MoKSA/IHRMaW5lcyh0aGlzLmxpbmVzKSA6IFsgXSB9LFxuXG5cdEV4Y2VwdERvKCkgeyByZXR1cm4gdHJhbnNwaWxlRXhjZXB0KHRoaXMpIH0sXG5cdEV4Y2VwdFZhbCgpIHsgcmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoWyB0cmFuc3BpbGVFeGNlcHQodGhpcykgXSkpIH0sXG5cblx0Rm9yRG8oKSB7IHJldHVybiBmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jaykgfSxcblxuXHRGb3JCYWcoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW1xuXHRcdFx0RGVjbGFyZUJ1aWx0QmFnLFxuXHRcdFx0Zm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spLFxuXHRcdFx0UmV0dXJuQnVpbHRcblx0XHRdKSlcblx0fSxcblxuXHRGb3JWYWwoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoWyBmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jaykgXSkpXG5cdH0sXG5cblx0RnVuKCkge1xuXHRcdGNvbnN0IG9sZEluR2VuZXJhdG9yID0gaXNJbkdlbmVyYXRvclxuXHRcdGlzSW5HZW5lcmF0b3IgPSB0aGlzLmlzR2VuZXJhdG9yXG5cblx0XHQvLyBUT0RPOkVTNiB1c2UgYC4uLmBmXG5cdFx0Y29uc3QgbkFyZ3MgPSBuZXcgTGl0ZXJhbCh0aGlzLmFyZ3MubGVuZ3RoKVxuXHRcdGNvbnN0IG9wRGVjbGFyZVJlc3QgPSBvcE1hcCh0aGlzLm9wUmVzdEFyZywgcmVzdCA9PlxuXHRcdFx0ZGVjbGFyZShyZXN0LCBuZXcgQ2FsbEV4cHJlc3Npb24oQXJyYXlTbGljZUNhbGwsIFtJZEFyZ3VtZW50cywgbkFyZ3NdKSkpXG5cdFx0Y29uc3QgYXJnQ2hlY2tzID0gb3BJZihjb250ZXh0Lm9wdHMuaW5jbHVkZUNoZWNrcygpLCAoKSA9PlxuXHRcdFx0ZmxhdE9wTWFwKHRoaXMuYXJncywgb3BUeXBlQ2hlY2tGb3JMb2NhbERlY2xhcmUpKVxuXG5cdFx0Y29uc3QgX2luID0gb3BNYXAodGhpcy5vcEluLCB0MClcblxuXHRcdGNvbnN0IG9wRGVjbGFyZVRoaXMgPSBvcElmKCFpc0luQ29uc3RydWN0b3IsICgpID0+IG9wTWFwKHRoaXMub3BEZWNsYXJlVGhpcywgKCkgPT5cblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsXG5cdFx0XHRcdFsgbmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZExleGljYWxUaGlzLCBuZXcgVGhpc0V4cHJlc3Npb24oKSkgXSkpKVxuXG5cdFx0Y29uc3QgbGVhZCA9IGNhdChvcERlY2xhcmVUaGlzLCBvcERlY2xhcmVSZXN0LCBhcmdDaGVja3MsIF9pbilcblxuXHRcdGNvbnN0IF9vdXQgPSBvcE1hcCh0aGlzLm9wT3V0LCB0MClcblx0XHRjb25zdCBib2R5ID0gdDModGhpcy5ibG9jaywgbGVhZCwgdGhpcy5vcERlY2xhcmVSZXMsIF9vdXQpXG5cdFx0Y29uc3QgYXJncyA9IHRoaXMuYXJncy5tYXAodDApXG5cdFx0aXNJbkdlbmVyYXRvciA9IG9sZEluR2VuZXJhdG9yXG5cdFx0Y29uc3QgaWQgPSBvcE1hcCh0aGlzLm9wTmFtZSwgaWRDYWNoZWQpXG5cblx0XHRjb25zdCBjYW5Vc2VBcnJvd0Z1bmN0aW9uID1cblx0XHRcdGlkID09PSBudWxsICYmXG5cdFx0XHR0aGlzLm9wRGVjbGFyZVRoaXMgPT09IG51bGwgJiZcblx0XHRcdG9wRGVjbGFyZVJlc3QgPT09IG51bGwgJiZcblx0XHRcdCF0aGlzLmlzR2VuZXJhdG9yXG5cdFx0cmV0dXJuIGNhblVzZUFycm93RnVuY3Rpb24gP1xuXHRcdFx0bmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKGFyZ3MsIGJvZHkpIDpcblx0XHRcdG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIGFyZ3MsIGJvZHksIHRoaXMuaXNHZW5lcmF0b3IpXG5cdH0sXG5cblx0SWdub3JlKCkgeyByZXR1cm4gWyBdIH0sXG5cblx0TGF6eSgpIHsgcmV0dXJuIGxhenlXcmFwKHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdE1ldGhvZEltcGwoaXNTdGF0aWMpIHtcblx0XHRhc3NlcnQodGhpcy5mdW4ub3BOYW1lID09PSBudWxsKVxuXHRcdGNvbnN0IHZhbHVlID0gdDAodGhpcy5mdW4pXG5cdFx0YXNzZXJ0KHZhbHVlLmlkID09IG51bGwpXG5cblx0XHRsZXQga2luZFxuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIE1JX1BsYWluOlxuXHRcdFx0XHRraW5kID0gJ21ldGhvZCdcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgTUlfR2V0OlxuXHRcdFx0XHRraW5kID0gJ2dldCdcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgTUlfU2V0OlxuXHRcdFx0XHRraW5kID0gJ3NldCdcblx0XHRcdFx0YnJlYWtcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcigpXG5cdFx0fVxuXG5cdFx0bGV0IGtleSwgY29tcHV0ZWRcblx0XHRpZiAodHlwZW9mIHRoaXMuc3ltYm9sID09PSAnc3RyaW5nJykge1xuXHRcdFx0a2V5ID0gcHJvcGVydHlJZE9yTGl0ZXJhbENhY2hlZCh0aGlzLnN5bWJvbClcblx0XHRcdGNvbXB1dGVkID0gZmFsc2Vcblx0XHR9IGVsc2Uge1xuXHRcdFx0a2V5ID0gbXNTeW1ib2wodDAodGhpcy5zeW1ib2wpKVxuXHRcdFx0Y29tcHV0ZWQgPSB0cnVlXG5cdFx0fVxuXHRcdHJldHVybiBuZXcgTWV0aG9kRGVmaW5pdGlvbihrZXksIHZhbHVlLCBraW5kLCBpc1N0YXRpYywgY29tcHV0ZWQpXG5cdH0sXG5cblx0TnVtYmVyTGl0ZXJhbCgpIHtcblx0XHQvLyBOZWdhdGl2ZSBudW1iZXJzIGFyZSBub3QgcGFydCBvZiBFUyBzcGVjLlxuXHRcdC8vIGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi81LjEvI3NlYy03LjguM1xuXHRcdGNvbnN0IHZhbHVlID0gTnVtYmVyKHRoaXMudmFsdWUpXG5cdFx0Y29uc3QgbGl0ID0gbmV3IExpdGVyYWwoTWF0aC5hYnModmFsdWUpKVxuXHRcdHJldHVybiBpc1Bvc2l0aXZlKHZhbHVlKSA/IGxpdCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJy0nLCBsaXQpXG5cdH0sXG5cblx0R2xvYmFsQWNjZXNzKCkgeyByZXR1cm4gbmV3IElkZW50aWZpZXIodGhpcy5uYW1lKSB9LFxuXG5cdExvY2FsQWNjZXNzKCkge1xuXHRcdHJldHVybiB0aGlzLm5hbWUgPT09ICd0aGlzJyA/XG5cdFx0XHQoaXNJbkNvbnN0cnVjdG9yID8gbmV3IFRoaXNFeHByZXNzaW9uKCkgOiBJZExleGljYWxUaGlzKSA6XG5cdFx0XHRhY2Nlc3NMb2NhbERlY2xhcmUodmVyaWZ5UmVzdWx0cy5sb2NhbERlY2xhcmVGb3JBY2Nlc3ModGhpcykpXG5cdH0sXG5cblx0TG9jYWxEZWNsYXJlKCkgeyByZXR1cm4gbmV3IElkZW50aWZpZXIoaWRGb3JEZWNsYXJlQ2FjaGVkKHRoaXMpLm5hbWUpIH0sXG5cblx0TG9jYWxNdXRhdGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIGlkQ2FjaGVkKHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdExvZ2ljKCkge1xuXHRcdGFzc2VydCh0aGlzLmtpbmQgPT09IExfQW5kIHx8IHRoaXMua2luZCA9PT0gTF9Pcilcblx0XHRjb25zdCBvcCA9IHRoaXMua2luZCA9PT0gTF9BbmQgPyAnJiYnIDogJ3x8J1xuXHRcdHJldHVybiB0YWlsKHRoaXMuYXJncykucmVkdWNlKChhLCBiKSA9PlxuXHRcdFx0bmV3IExvZ2ljYWxFeHByZXNzaW9uKG9wLCBhLCB0MChiKSksIHQwKHRoaXMuYXJnc1swXSkpXG5cdH0sXG5cblx0TWFwRW50cnkoKSB7IHJldHVybiBtc0Fzc29jKElkQnVpbHQsIHQwKHRoaXMua2V5KSwgdDAodGhpcy52YWwpKSB9LFxuXG5cdE1lbWJlcigpIHsgcmV0dXJuIG1lbWJlcih0MCh0aGlzLm9iamVjdCksIHRoaXMubmFtZSkgfSxcblxuXHRNZW1iZXJTZXQoKSB7XG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgTVNfTXV0YXRlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9Jyxcblx0XHRcdFx0XHRtZW1iZXIodDAodGhpcy5vYmplY3QpLCB0aGlzLm5hbWUpLFxuXHRcdFx0XHRcdHQwKHRoaXMudmFsdWUpKVxuXHRcdFx0Y2FzZSBNU19OZXc6XG5cdFx0XHRcdHJldHVybiBtc05ld1Byb3BlcnR5KHQwKHRoaXMub2JqZWN0KSwgbmV3IExpdGVyYWwodGhpcy5uYW1lKSwgdDAodGhpcy52YWx1ZSkpXG5cdFx0XHRjYXNlIE1TX05ld011dGFibGU6XG5cdFx0XHRcdHJldHVybiBtc05ld011dGFibGVQcm9wZXJ0eSh0MCh0aGlzLm9iamVjdCksIG5ldyBMaXRlcmFsKHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKClcblx0XHR9XG5cdH0sXG5cblx0TW9kdWxlKCkge1xuXHRcdGNvbnN0IGJvZHkgPSBjYXQoXG5cdFx0XHR0TGluZXModGhpcy5saW5lcyksXG5cdFx0XHRvcE1hcCh0aGlzLm9wRGVmYXVsdEV4cG9ydCwgXyA9PiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBFeHBvcnRzRGVmYXVsdCwgdDAoXykpKSlcblx0XHRyZXR1cm4gbmV3IFByb2dyYW0oY2F0KFxuXHRcdFx0b3BJZihjb250ZXh0Lm9wdHMuaW5jbHVkZVVzZVN0cmljdCgpLCAoKSA9PiBVc2VTdHJpY3QpLFxuXHRcdFx0b3BJZihjb250ZXh0Lm9wdHMuaW5jbHVkZUFtZGVmaW5lKCksICgpID0+IEFtZGVmaW5lSGVhZGVyKSxcblx0XHRcdHRvU3RhdGVtZW50KGFtZFdyYXBNb2R1bGUodGhpcy5kb1VzZXMsIHRoaXMudXNlcy5jb25jYXQodGhpcy5kZWJ1Z1VzZXMpLCBib2R5KSkpKVxuXHR9LFxuXG5cdE5ldygpIHtcblx0XHRjb25zdCBhbnlTcGxhdCA9IHRoaXMuYXJncy5zb21lKF8gPT4gXyBpbnN0YW5jZW9mIFNwbGF0KVxuXHRcdGNvbnRleHQuY2hlY2soIWFueVNwbGF0LCB0aGlzLmxvYywgJ1RPRE86IFNwbGF0IHBhcmFtcyBmb3IgbmV3Jylcblx0XHRyZXR1cm4gbmV3IE5ld0V4cHJlc3Npb24odDAodGhpcy50eXBlKSwgdGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0Tm90KCkgeyByZXR1cm4gbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIHQwKHRoaXMuYXJnKSkgfSxcblxuXHRPYmpFbnRyeSgpIHtcblx0XHRyZXR1cm4gKHRoaXMuYXNzaWduIGluc3RhbmNlb2YgQXNzaWduU2luZ2xlICYmICF0aGlzLmFzc2lnbi5hc3NpZ25lZS5pc0xhenkoKSkgP1xuXHRcdFx0dDEodGhpcy5hc3NpZ24sIHZhbCA9PlxuXHRcdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRCdWlsdCwgdGhpcy5hc3NpZ24uYXNzaWduZWUubmFtZSksIHZhbCkpIDpcblx0XHRcdGNhdChcblx0XHRcdFx0dDAodGhpcy5hc3NpZ24pLFxuXHRcdFx0XHR0aGlzLmFzc2lnbi5hbGxBc3NpZ25lZXMoKS5tYXAoXyA9PlxuXHRcdFx0XHRcdG1zU2V0TGF6eShJZEJ1aWx0LCBuZXcgTGl0ZXJhbChfLm5hbWUpLCBpZEZvckRlY2xhcmVDYWNoZWQoXykpKSlcblx0fSxcblxuXHRPYmpTaW1wbGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBPYmplY3RFeHByZXNzaW9uKHRoaXMucGFpcnMubWFwKHBhaXIgPT5cblx0XHRcdG5ldyBQcm9wZXJ0eSgnaW5pdCcsIHByb3BlcnR5SWRPckxpdGVyYWxDYWNoZWQocGFpci5rZXkpLCB0MChwYWlyLnZhbHVlKSkpKVxuXHR9LFxuXG5cdFF1b3RlKCkge1xuXHRcdGlmICh0aGlzLnBhcnRzLmxlbmd0aCA9PT0gMClcblx0XHRcdHJldHVybiBMaXRFbXB0eVN0cmluZ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgcXVhc2lzID0gWyBdLCBleHByZXNzaW9ucyA9IFsgXVxuXG5cdFx0XHQvLyBUZW1wbGF0ZUxpdGVyYWwgbXVzdCBzdGFydCB3aXRoIGEgVGVtcGxhdGVFbGVtZW50XG5cdFx0XHRpZiAodHlwZW9mIHRoaXMucGFydHNbMF0gIT09ICdzdHJpbmcnKVxuXHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuRW1wdHkpXG5cblx0XHRcdGZvciAobGV0IHBhcnQgb2YgdGhpcy5wYXJ0cylcblx0XHRcdFx0aWYgKHR5cGVvZiBwYXJ0ID09PSAnc3RyaW5nJylcblx0XHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZm9yU3RyaW5nKHBhcnQpKVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHQvLyBcInsxfXsxfVwiIG5lZWRzIGFuIGVtcHR5IHF1YXNpIGluIHRoZSBtaWRkbGUgKGFuZCBvbiB0aGUgZW5kcylcblx0XHRcdFx0XHRpZiAocXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoKVxuXHRcdFx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LkVtcHR5KVxuXHRcdFx0XHRcdGV4cHJlc3Npb25zLnB1c2godDAocGFydCkpXG5cdFx0XHRcdH1cblxuXHRcdFx0Ly8gVGVtcGxhdGVMaXRlcmFsIG11c3QgZW5kIHdpdGggYSBUZW1wbGF0ZUVsZW1lbnQsIHNvIG9uZSBtb3JlIHF1YXNpIHRoYW4gZXhwcmVzc2lvbi5cblx0XHRcdGlmIChxdWFzaXMubGVuZ3RoID09PSBleHByZXNzaW9ucy5sZW5ndGgpXG5cdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5FbXB0eSlcblxuXHRcdFx0cmV0dXJuIG5ldyBUZW1wbGF0ZUxpdGVyYWwocXVhc2lzLCBleHByZXNzaW9ucylcblx0XHR9XG5cdH0sXG5cblx0UXVvdGVUZW1wbGF0ZSgpIHtcblx0XHRyZXR1cm4gbmV3IFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbih0MCh0aGlzLnRhZyksIHQwKHRoaXMucXVvdGUpKVxuXHR9LFxuXG5cdFNwZWNpYWxEbygpIHtcblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTRF9EZWJ1Z2dlcjogcmV0dXJuIG5ldyBEZWJ1Z2dlclN0YXRlbWVudCgpXG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IodGhpcy5raW5kKVxuXHRcdH1cblx0fSxcblxuXHRTcGVjaWFsVmFsKCkge1xuXHRcdC8vIE1ha2UgbmV3IG9iamVjdHMgYmVjYXVzZSB3ZSB3aWxsIGFzc2lnbiBgbG9jYCB0byB0aGVtLlxuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIFNWX0NvbnRhaW5zOiByZXR1cm4gbWVtYmVyKElkTXMsICdjb250YWlucycpXG5cdFx0XHRjYXNlIFNWX0ZhbHNlOiByZXR1cm4gbmV3IExpdGVyYWwoZmFsc2UpXG5cdFx0XHRjYXNlIFNWX051bGw6IHJldHVybiBuZXcgTGl0ZXJhbChudWxsKVxuXHRcdFx0Y2FzZSBTVl9TdWI6IHJldHVybiBtZW1iZXIoSWRNcywgJ3N1YicpXG5cdFx0XHRjYXNlIFNWX1N1cGVyOiByZXR1cm4gbmV3IElkZW50aWZpZXIoJ3N1cGVyJylcblx0XHRcdGNhc2UgU1ZfVGhpc01vZHVsZURpcmVjdG9yeTogcmV0dXJuIG5ldyBJZGVudGlmaWVyKCdfX2Rpcm5hbWUnKVxuXHRcdFx0Y2FzZSBTVl9UcnVlOiByZXR1cm4gbmV3IExpdGVyYWwodHJ1ZSlcblx0XHRcdGNhc2UgU1ZfVW5kZWZpbmVkOiByZXR1cm4gbmV3IFVuYXJ5RXhwcmVzc2lvbigndm9pZCcsIExpdFplcm8pXG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IodGhpcy5raW5kKVxuXHRcdH1cblx0fSxcblxuXHRTcGxhdCgpIHtcblx0XHRyZXR1cm4gbmV3IFNwcmVhZEVsZW1lbnQodDAodGhpcy5zcGxhdHRlZCkpXG5cdH0sXG5cblx0U3dpdGNoRG8oKSB7IHJldHVybiB0cmFuc3BpbGVTd2l0Y2godGhpcykgfSxcblx0U3dpdGNoVmFsKCkgeyByZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChbIHRyYW5zcGlsZVN3aXRjaCh0aGlzKSBdKSkgfSxcblx0U3dpdGNoRG9QYXJ0OiBzd2l0Y2hQYXJ0LFxuXHRTd2l0Y2hWYWxQYXJ0OiBzd2l0Y2hQYXJ0LFxuXG5cdFRocm93KCkge1xuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcFRocm93bixcblx0XHRcdF8gPT4gbmV3IFRocm93U3RhdGVtZW50KG1zRXJyb3IodDAoXykpKSxcblx0XHRcdCgpID0+IG5ldyBUaHJvd1N0YXRlbWVudChtc0Vycm9yKExpdFN0clRocm93KSkpXG5cdH0sXG5cblx0V2l0aCgpIHtcblx0XHRjb25zdCBpZERlY2xhcmUgPSBpZEZvckRlY2xhcmVDYWNoZWQodGhpcy5kZWNsYXJlKVxuXHRcdGNvbnN0IGJsb2NrID0gdDModGhpcy5ibG9jaywgbnVsbCwgbnVsbCwgbmV3IFJldHVyblN0YXRlbWVudChpZERlY2xhcmUpKVxuXHRcdGNvbnN0IGZ1biA9IGlzSW5HZW5lcmF0b3IgP1xuXHRcdFx0bmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihudWxsLCBbIGlkRGVjbGFyZSBdLCBibG9jaywgdHJ1ZSkgOlxuXHRcdFx0bmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKFsgaWREZWNsYXJlIF0sIGJsb2NrKVxuXHRcdGNvbnN0IGNhbGwgPSBuZXcgQ2FsbEV4cHJlc3Npb24oZnVuLCBbIHQwKHRoaXMudmFsdWUpIF0pXG5cdFx0cmV0dXJuIGlzSW5HZW5lcmF0b3IgPyBuZXcgWWllbGRFeHByZXNzaW9uKGNhbGwsIHRydWUpIDogY2FsbFxuXHR9LFxuXG5cdFlpZWxkKCkgeyByZXR1cm4gbmV3IFlpZWxkRXhwcmVzc2lvbihvcE1hcCh0aGlzLm9wWWllbGRlZCwgdDApLCBmYWxzZSkgfSxcblxuXHRZaWVsZFRvKCkgeyByZXR1cm4gbmV3IFlpZWxkRXhwcmVzc2lvbih0MCh0aGlzLnlpZWxkZWRUbyksIHRydWUpIH1cbn0pXG5cbmZ1bmN0aW9uIGNhc2VQYXJ0KGFsdGVybmF0ZSkge1xuXHRpZiAodGhpcy50ZXN0IGluc3RhbmNlb2YgUGF0dGVybikge1xuXHRcdGNvbnN0IHsgdHlwZSwgcGF0dGVybmVkLCBsb2NhbHMgfSA9IHRoaXMudGVzdFxuXHRcdGNvbnN0IGRlY2wgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBbXG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKElkRXh0cmFjdCwgbXNFeHRyYWN0KHQwKHR5cGUpLCB0MChwYXR0ZXJuZWQpKSkgXSlcblx0XHRjb25zdCB0ZXN0ID0gbmV3IEJpbmFyeUV4cHJlc3Npb24oJyE9PScsIElkRXh0cmFjdCwgTGl0TnVsbClcblx0XHRjb25zdCBleHRyYWN0ID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgbG9jYWxzLm1hcCgoXywgaWR4KSA9PlxuXHRcdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRvcihcblx0XHRcdFx0aWRGb3JEZWNsYXJlQ2FjaGVkKF8pLFxuXHRcdFx0XHRuZXcgTWVtYmVyRXhwcmVzc2lvbihJZEV4dHJhY3QsIG5ldyBMaXRlcmFsKGlkeCkpKSkpXG5cdFx0Y29uc3QgcmVzID0gdDEodGhpcy5yZXN1bHQsIGV4dHJhY3QpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChbIGRlY2wsIG5ldyBJZlN0YXRlbWVudCh0ZXN0LCByZXMsIGFsdGVybmF0ZSkgXSlcblx0fSBlbHNlXG5cdFx0Ly8gYWx0ZXJuYXRlIHdyaXR0ZW4gdG8gYnkgYGNhc2VCb2R5YC5cblx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KHQwKHRoaXMudGVzdCksIHQwKHRoaXMucmVzdWx0KSwgYWx0ZXJuYXRlKVxufVxuXG5mdW5jdGlvbiBzd2l0Y2hQYXJ0KCkge1xuXHRjb25zdCBvcE91dCA9IG9wSWYodGhpcyBpbnN0YW5jZW9mIFN3aXRjaERvUGFydCwgKCkgPT4gbmV3IEJyZWFrU3RhdGVtZW50KVxuXHQvKlxuXHRXZSBjb3VsZCBqdXN0IHBhc3MgYmxvY2suYm9keSBmb3IgdGhlIHN3aXRjaCBsaW5lcywgYnV0IGluc3RlYWRcblx0ZW5jbG9zZSB0aGUgYm9keSBvZiB0aGUgc3dpdGNoIGNhc2UgaW4gY3VybHkgYnJhY2VzIHRvIGVuc3VyZSBhIG5ldyBzY29wZS5cblx0VGhhdCB3YXkgdGhpcyBjb2RlIHdvcmtzOlxuXHRcdHN3aXRjaCAoMCkge1xuXHRcdFx0Y2FzZSAwOiB7XG5cdFx0XHRcdGNvbnN0IGEgPSAwXG5cdFx0XHRcdHJldHVybiBhXG5cdFx0XHR9XG5cdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdC8vIFdpdGhvdXQgY3VybHkgYnJhY2VzIHRoaXMgd291bGQgY29uZmxpY3Qgd2l0aCB0aGUgb3RoZXIgYGFgLlxuXHRcdFx0XHRjb25zdCBhID0gMVxuXHRcdFx0XHRhXG5cdFx0XHR9XG5cdFx0fVxuXHQqL1xuXHRjb25zdCBibG9jayA9IHQzKHRoaXMucmVzdWx0LCBudWxsLCBudWxsLCBvcE91dClcblx0Ly8gSWYgc3dpdGNoIGhhcyBtdWx0aXBsZSB2YWx1ZXMsIGJ1aWxkIHVwIGEgc3RhdGVtZW50IGxpa2U6IGBjYXNlIDE6IGNhc2UgMjogeyBkb0Jsb2NrKCkgfWBcblx0Y29uc3QgeCA9IFsgXVxuXHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudmFsdWVzLmxlbmd0aCAtIDE7IGkgPSBpICsgMSlcblx0XHQvLyBUaGVzZSBjYXNlcyBmYWxsdGhyb3VnaCB0byB0aGUgb25lIGF0IHRoZSBlbmQuXG5cdFx0eC5wdXNoKG5ldyBTd2l0Y2hDYXNlKHQwKHRoaXMudmFsdWVzW2ldKSwgWyBdKSlcblx0eC5wdXNoKG5ldyBTd2l0Y2hDYXNlKHQwKHRoaXMudmFsdWVzW3RoaXMudmFsdWVzLmxlbmd0aCAtIDFdKSwgWyBibG9jayBdKSlcblx0cmV0dXJuIHhcbn1cblxuLy8gRnVuY3Rpb25zIHNwZWNpZmljIHRvIGNlcnRhaW4gZXhwcmVzc2lvbnMuXG5jb25zdFxuXHQvLyBXcmFwcyBhIGJsb2NrICh3aXRoIGByZXR1cm5gIHN0YXRlbWVudHMgaW4gaXQpIGluIGFuIElJRkUuXG5cdGJsb2NrV3JhcCA9IGJsb2NrID0+IHtcblx0XHRjb25zdCBpbnZva2UgPSBuZXcgQ2FsbEV4cHJlc3Npb24oZnVuY3Rpb25FeHByZXNzaW9uVGh1bmsoYmxvY2ssIGlzSW5HZW5lcmF0b3IpLCBbIF0pXG5cdFx0cmV0dXJuIGlzSW5HZW5lcmF0b3IgPyBuZXcgWWllbGRFeHByZXNzaW9uKGludm9rZSwgdHJ1ZSkgOiBpbnZva2Vcblx0fSxcblxuXHRjYXNlQm9keSA9IChwYXJ0cywgb3BFbHNlKSA9PiB7XG5cdFx0bGV0IGFjYyA9IGlmRWxzZShvcEVsc2UsIHQwLCAoKSA9PiBUaHJvd05vQ2FzZU1hdGNoKVxuXHRcdGZvciAobGV0IGkgPSBwYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGkgPSBpIC0gMSlcblx0XHRcdGFjYyA9IHQxKHBhcnRzW2ldLCBhY2MpXG5cdFx0cmV0dXJuIGFjY1xuXHR9LFxuXG5cdGZvckxvb3AgPSAob3BJdGVyYXRlZSwgYmxvY2spID0+XG5cdFx0aWZFbHNlKG9wSXRlcmF0ZWUsXG5cdFx0XHQoeyBlbGVtZW50LCBiYWcgfSkgPT4ge1xuXHRcdFx0XHRjb25zdCBkZWNsYXJlID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2xldCcsXG5cdFx0XHRcdFx0WyBuZXcgVmFyaWFibGVEZWNsYXJhdG9yKHQwKGVsZW1lbnQpKSBdKVxuXHRcdFx0XHRyZXR1cm4gbmV3IEZvck9mU3RhdGVtZW50KGRlY2xhcmUsIHQwKGJhZyksIHQwKGJsb2NrKSlcblx0XHRcdH0sXG5cdFx0XHQoKSA9PiBmb3JTdGF0ZW1lbnRJbmZpbml0ZSh0MChibG9jaykpKSxcblxuXHRjb25zdHJ1Y3RvckRlZmluaXRpb24gPSBmdW4gPT4ge1xuXHRcdGlzSW5Db25zdHJ1Y3RvciA9IHRydWVcblx0XHRjb25zdCByZXMgPSBuZXcgTWV0aG9kRGVmaW5pdGlvbihcblx0XHRcdG5ldyBJZGVudGlmaWVyKCdjb25zdHJ1Y3RvcicpLCB0MChmdW4pLCAnY29uc3RydWN0b3InLCBmYWxzZSwgZmFsc2UpXG5cdFx0aXNJbkNvbnN0cnVjdG9yID0gZmFsc2Vcblx0XHRyZXR1cm4gcmVzXG5cdH0sXG5cblx0dHJhbnNwaWxlQmxvY2sgPSAocmV0dXJuZWQsIGxpbmVzLCBsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KSA9PiB7XG5cdFx0Ly8gVE9ETzpFUzYgT3B0aW9uYWwgYXJndW1lbnRzXG5cdFx0aWYgKGxlYWQgPT09IHVuZGVmaW5lZCkgbGVhZCA9IG51bGxcblx0XHRpZiAob3BEZWNsYXJlUmVzID09PSB1bmRlZmluZWQpIG9wRGVjbGFyZVJlcyA9IG51bGxcblx0XHRpZiAob3BPdXQgPT09IHVuZGVmaW5lZCkgb3BPdXQgPSBudWxsXG5cdFx0Y29uc3QgZmluID0gaWZFbHNlKG9wRGVjbGFyZVJlcyxcblx0XHRcdHJkID0+IHtcblx0XHRcdFx0Y29uc3QgcmV0ID0gbWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHJldHVybmVkLCByZC5vcFR5cGUsIHJkLm5hbWUpXG5cdFx0XHRcdHJldHVybiBpZkVsc2Uob3BPdXQsXG5cdFx0XHRcdFx0XyA9PiBjYXQoZGVjbGFyZShyZCwgcmV0KSwgXywgUmV0dXJuUmVzKSxcblx0XHRcdFx0XHQoKSA9PiBuZXcgUmV0dXJuU3RhdGVtZW50KHJldCkpXG5cdFx0XHR9LFxuXHRcdFx0KCkgPT4gY2F0KG9wT3V0LCBuZXcgUmV0dXJuU3RhdGVtZW50KHJldHVybmVkKSkpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgbGluZXMsIGZpbikpXG5cdH0sXG5cblx0dHJhbnNwaWxlRXhjZXB0ID0gZXhjZXB0ID0+XG5cdFx0bmV3IFRyeVN0YXRlbWVudChcblx0XHRcdHQwKGV4Y2VwdC5fdHJ5KSxcblx0XHRcdG9wTWFwKGV4Y2VwdC5fY2F0Y2gsIHQwKSxcblx0XHRcdG9wTWFwKGV4Y2VwdC5fZmluYWxseSwgdDApKSxcblxuXHR0cmFuc3BpbGVTd2l0Y2ggPSBfID0+IHtcblx0XHRjb25zdCBwYXJ0cyA9IGZsYXRNYXAoXy5wYXJ0cywgdDApXG5cdFx0cGFydHMucHVzaChpZkVsc2UoXy5vcEVsc2UsXG5cdFx0XHRfID0+IG5ldyBTd2l0Y2hDYXNlKHVuZGVmaW5lZCwgdDAoXykuYm9keSksXG5cdFx0XHQoKSA9PiBTd2l0Y2hDYXNlTm9NYXRjaCkpXG5cdFx0cmV0dXJuIG5ldyBTd2l0Y2hTdGF0ZW1lbnQodDAoXy5zd2l0Y2hlZCksIHBhcnRzKVxuXHR9XG5cbi8vIE1vZHVsZSBoZWxwZXJzXG5jb25zdFxuXHRhbWRXcmFwTW9kdWxlID0gKGRvVXNlcywgb3RoZXJVc2VzLCBib2R5KSA9PiB7XG5cdFx0Y29uc3QgYWxsVXNlcyA9IGRvVXNlcy5jb25jYXQob3RoZXJVc2VzKVxuXHRcdGNvbnN0IHVzZVBhdGhzID0gbmV3IEFycmF5RXhwcmVzc2lvbihjYXQoXG5cdFx0XHRMaXRTdHJFeHBvcnRzLFxuXHRcdFx0YWxsVXNlcy5tYXAoXyA9PiBuZXcgTGl0ZXJhbChtYW5nbGVQYXRoKF8ucGF0aCkpKSkpXG5cdFx0Y29uc3QgdXNlSWRlbnRpZmllcnMgPSBhbGxVc2VzLm1hcCgoXywgaSkgPT4gaWRDYWNoZWQoYCR7cGF0aEJhc2VOYW1lKF8ucGF0aCl9XyR7aX1gKSlcblx0XHRjb25zdCB1c2VBcmdzID0gY2F0KElkRXhwb3J0cywgdXNlSWRlbnRpZmllcnMpXG5cdFx0Y29uc3QgdXNlRG9zID0gZG9Vc2VzLm1hcCgodXNlLCBpKSA9PlxuXHRcdFx0bG9jKG5ldyBFeHByZXNzaW9uU3RhdGVtZW50KG1zR2V0TW9kdWxlKHVzZUlkZW50aWZpZXJzW2ldKSksIHVzZS5sb2MpKVxuXHRcdGNvbnN0IG9wVXNlRGVjbGFyZSA9IG9wSWYoIWlzRW1wdHkob3RoZXJVc2VzKSxcblx0XHRcdCgpID0+IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIGZsYXRNYXAob3RoZXJVc2VzLCAodXNlLCBpKSA9PlxuXHRcdFx0XHR1c2VEZWNsYXJhdG9ycyh1c2UsIHVzZUlkZW50aWZpZXJzW2kgKyBkb1VzZXMubGVuZ3RoXSkpKSlcblx0XHRjb25zdCBmdWxsQm9keSA9IG5ldyBCbG9ja1N0YXRlbWVudChjYXQodXNlRG9zLCBvcFVzZURlY2xhcmUsIGJvZHksIFJldHVybkV4cG9ydHMpKVxuXHRcdGNvbnN0IGxhenlCb2R5ID1cblx0XHRcdGNvbnRleHQub3B0cy5sYXp5TW9kdWxlKCkgP1xuXHRcdFx0XHRuZXcgQmxvY2tTdGF0ZW1lbnQoWyBuZXcgRXhwcmVzc2lvblN0YXRlbWVudChcblx0XHRcdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBFeHBvcnRzR2V0LFxuXHRcdFx0XHRcdFx0bXNMYXp5KGZ1bmN0aW9uRXhwcmVzc2lvblRodW5rKGZ1bGxCb2R5KSkpKSBdKSA6XG5cdFx0XHRcdGZ1bGxCb2R5XG5cdFx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbihJZERlZmluZSxcblx0XHRcdFsgdXNlUGF0aHMsIG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbih1c2VBcmdzLCBsYXp5Qm9keSkgXSlcblx0fSxcblxuXHRwYXRoQmFzZU5hbWUgPSBwYXRoID0+XG5cdFx0cGF0aC5zdWJzdHIocGF0aC5sYXN0SW5kZXhPZignLycpICsgMSksXG5cblx0dXNlRGVjbGFyYXRvcnMgPSAodXNlLCBtb2R1bGVJZGVudGlmaWVyKSA9PiB7XG5cdFx0Ly8gVE9ETzogQ291bGQgYmUgbmVhdGVyIGFib3V0IHRoaXNcblx0XHRjb25zdCBpc0xhenkgPSAoaXNFbXB0eSh1c2UudXNlZCkgPyB1c2Uub3BVc2VEZWZhdWx0IDogdXNlLnVzZWRbMF0pLmlzTGF6eSgpXG5cdFx0Y29uc3QgdmFsdWUgPSAoaXNMYXp5ID8gbXNMYXp5R2V0TW9kdWxlIDogbXNHZXRNb2R1bGUpKG1vZHVsZUlkZW50aWZpZXIpXG5cblx0XHRjb25zdCB1c2VkRGVmYXVsdCA9IG9wTWFwKHVzZS5vcFVzZURlZmF1bHQsIGRlZiA9PiB7XG5cdFx0XHRjb25zdCBkZWZleHAgPSBtc0dldERlZmF1bHRFeHBvcnQobW9kdWxlSWRlbnRpZmllcilcblx0XHRcdGNvbnN0IHZhbCA9IGlzTGF6eSA/IGxhenlXcmFwKGRlZmV4cCkgOiBkZWZleHBcblx0XHRcdHJldHVybiBsb2MobmV3IFZhcmlhYmxlRGVjbGFyYXRvcihpZEZvckRlY2xhcmVDYWNoZWQoZGVmKSwgdmFsKSwgZGVmLmxvYylcblx0XHR9KVxuXG5cdFx0Y29uc3QgdXNlZERlc3RydWN0ID0gaXNFbXB0eSh1c2UudXNlZCkgPyBudWxsIDpcblx0XHRcdG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzKHVzZS51c2VkLCBpc0xhenksIHZhbHVlLCB0cnVlLCBmYWxzZSlcblxuXHRcdHJldHVybiBjYXQodXNlZERlZmF1bHQsIHVzZWREZXN0cnVjdClcblx0fVxuXG4vLyBHZW5lcmFsIHV0aWxzLiBOb3QgaW4gdXRpbC5qcyBiZWNhdXNlIHRoZXNlIGNsb3NlIG92ZXIgY29udGV4dC5cbmNvbnN0XG5cdG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzID0gKGFzc2lnbmVlcywgaXNMYXp5LCB2YWx1ZSwgaXNNb2R1bGUsIGlzRXhwb3J0KSA9PiB7XG5cdFx0Y29uc3QgZGVzdHJ1Y3R1cmVkTmFtZSA9IGBfJCR7YXNzaWduZWVzWzBdLmxvYy5zdGFydC5saW5lfWBcblx0XHRjb25zdCBpZERlc3RydWN0dXJlZCA9IG5ldyBJZGVudGlmaWVyKGRlc3RydWN0dXJlZE5hbWUpXG5cdFx0Y29uc3QgZGVjbGFyYXRvcnMgPSBhc3NpZ25lZXMubWFwKGFzc2lnbmVlID0+IHtcblx0XHRcdC8vIFRPRE86IERvbid0IGNvbXBpbGUgaXQgaWYgaXQncyBuZXZlciBhY2Nlc3NlZFxuXHRcdFx0Y29uc3QgZ2V0ID0gZ2V0TWVtYmVyKGlkRGVzdHJ1Y3R1cmVkLCBhc3NpZ25lZS5uYW1lLCBpc0xhenksIGlzTW9kdWxlKVxuXHRcdFx0cmV0dXJuIG1ha2VEZWNsYXJhdG9yKGFzc2lnbmVlLCBnZXQsIGlzTGF6eSwgaXNFeHBvcnQpXG5cdFx0fSlcblx0XHQvLyBHZXR0aW5nIGxhenkgbW9kdWxlIGlzIGRvbmUgYnkgbXMubGF6eUdldE1vZHVsZS5cblx0XHRjb25zdCB2YWwgPSAoaXNMYXp5ICYmICFpc01vZHVsZSkgPyBsYXp5V3JhcCh2YWx1ZSkgOiB2YWx1ZVxuXHRcdHJldHVybiB1bnNoaWZ0KG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoaWREZXN0cnVjdHVyZWQsIHZhbCksIGRlY2xhcmF0b3JzKVxuXHR9LFxuXG5cdG1ha2VEZWNsYXJhdG9yID0gKGFzc2lnbmVlLCB2YWx1ZSwgdmFsdWVJc0FscmVhZHlMYXp5LCBpc0V4cG9ydCkgPT4ge1xuXHRcdGNvbnN0IHsgbG9jLCBuYW1lLCBvcFR5cGUgfSA9IGFzc2lnbmVlXG5cdFx0Y29uc3QgaXNMYXp5ID0gYXNzaWduZWUuaXNMYXp5KClcblx0XHQvLyBUT0RPOiBhc3NlcnQoYXNzaWduZWUub3BUeXBlID09PSBudWxsKVxuXHRcdC8vIG9yIFRPRE86IEFsbG93IHR5cGUgY2hlY2sgb24gbGF6eSB2YWx1ZT9cblx0XHR2YWx1ZSA9IGlzTGF6eSA/IHZhbHVlIDogbWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHZhbHVlLCBvcFR5cGUsIG5hbWUpXG5cdFx0aWYgKGlzRXhwb3J0KSB7XG5cdFx0XHQvLyBUT0RPOkVTNlxuXHRcdFx0Y29udGV4dC5jaGVjayghaXNMYXp5LCBsb2MsICdMYXp5IGV4cG9ydCBub3Qgc3VwcG9ydGVkLicpXG5cdFx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRvcihcblx0XHRcdFx0aWRGb3JEZWNsYXJlQ2FjaGVkKGFzc2lnbmVlKSxcblx0XHRcdFx0bmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyKElkRXhwb3J0cywgbmFtZSksIHZhbHVlKSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgdmFsID0gaXNMYXp5ICYmICF2YWx1ZUlzQWxyZWFkeUxhenkgPyBsYXp5V3JhcCh2YWx1ZSkgOiB2YWx1ZVxuXHRcdFx0YXNzZXJ0KGlzTGF6eSB8fCAhdmFsdWVJc0FscmVhZHlMYXp5KVxuXHRcdFx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoaWRGb3JEZWNsYXJlQ2FjaGVkKGFzc2lnbmVlKSwgdmFsKVxuXHRcdH1cblx0fSxcblxuXHRtYXliZVdyYXBJbkNoZWNrQ29udGFpbnMgPSAoYXN0LCBvcFR5cGUsIG5hbWUpID0+XG5cdFx0KGNvbnRleHQub3B0cy5pbmNsdWRlQ2hlY2tzKCkgJiYgb3BUeXBlICE9PSBudWxsKSA/XG5cdFx0XHRtc0NoZWNrQ29udGFpbnModDAob3BUeXBlKSwgYXN0LCBuZXcgTGl0ZXJhbChuYW1lKSkgOlxuXHRcdFx0YXN0LFxuXG5cdGdldE1lbWJlciA9IChhc3RPYmplY3QsIGdvdE5hbWUsIGlzTGF6eSwgaXNNb2R1bGUpID0+XG5cdFx0aXNMYXp5ID9cblx0XHRtc0xhenlHZXQoYXN0T2JqZWN0LCBuZXcgTGl0ZXJhbChnb3ROYW1lKSkgOlxuXHRcdGlzTW9kdWxlICYmIGNvbnRleHQub3B0cy5pbmNsdWRlQ2hlY2tzKCkgP1xuXHRcdG1zR2V0KGFzdE9iamVjdCwgbmV3IExpdGVyYWwoZ290TmFtZSkpIDpcblx0XHRtZW1iZXIoYXN0T2JqZWN0LCBnb3ROYW1lKVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
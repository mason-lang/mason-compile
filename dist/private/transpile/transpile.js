if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'esast/dist/ast', 'esast/dist/util', 'esast/dist/specialize', '../manglePath', '../MsAst', '../util', './ast-constants', './ms-call', './util'], function (exports, _esastDistAst, _esastDistUtil, _esastDistSpecialize, _manglePath, _MsAst, _util, _astConstants, _msCall, _util2) {
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
				return this.negate ? cond : (0, _esastDistAst.UnaryExpression)('!', cond);
			};

			return (0, _util.ifElse)(this.opThrown, thrown => (0, _esastDistAst.IfStatement)(failCond(), (0, _esastDistAst.ThrowStatement)((0, _msCall.msError)(t0(thrown)))), () => {
				if (this.condition instanceof _MsAst.Call) {
					const call = this.condition;
					const ass = this.negate ? _msCall.msAssertNot : _msCall.msAssert;
					return ass(t0(call.called), ...call.args.map(t0));
				} else return (0, _esastDistAst.IfStatement)(failCond(), _astConstants.ThrowAssertFail);
			});
		},

		AssignSingle(valWrap) {
			const val = valWrap === undefined ? t0(this.value) : valWrap(t0(this.value));
			const declare = makeDeclarator(this.assignee, val, false, verifyResults.isExportAssign(this));
			return (0, _esastDistAst.VariableDeclaration)(this.assignee.isMutable() ? 'let' : 'const', [declare]);
		},
		// TODO:ES6 Just use native destructuring assign
		AssignDestructure() {
			return (0, _esastDistAst.VariableDeclaration)(this.kind() === _MsAst.LD_Mutable ? 'let' : 'const', makeDestructureDeclarators(this.assignees, this.kind() === _MsAst.LD_Lazy, t0(this.value), false, verifyResults.isExportAssign(this)));
		},

		BagEntry() {
			return (0, _msCall.msAdd)(_astConstants.IdBuilt, t0(this.value));
		},

		BagEntryMany() {
			return (0, _msCall.msAddMany)(_astConstants.IdBuilt, t0(this.value));
		},

		BagSimple() {
			return (0, _esastDistAst.ArrayExpression)(this.parts.map(t0));
		},

		BlockDo(lead, opDeclareRes, opOut) {
			// TODO:ES6 Optional arguments
			if (lead === undefined) lead = null;
			if (opDeclareRes === undefined) opDeclareRes = null;
			if (opOut === undefined) opOut = null;
			(0, _util.assert)(opDeclareRes === null);
			return (0, _esastDistAst.BlockStatement)((0, _util.cat)(lead, tLines(this.lines), opOut));
		},

		BlockValThrow(lead, opDeclareRes, opOut) {
			// TODO:ES6 Optional arguments
			if (lead === undefined) lead = null;
			if (opDeclareRes === undefined) opDeclareRes = null;
			if (opOut === undefined) opOut = null;
			context.warnIf(opDeclareRes !== null || opOut !== null, this.loc, 'Out condition ignored because of oh-no!');
			return (0, _esastDistAst.BlockStatement)((0, _util.cat)(lead, tLines(this.lines), t0(this.throw)));
		},

		BlockWithReturn(lead, opDeclareRes, opOut) {
			return transpileBlock(t0(this.returned), tLines(this.lines), lead, opDeclareRes, opOut);
		},

		BlockBag(lead, opDeclareRes, opOut) {
			return transpileBlock(_astConstants.IdBuilt, (0, _util.cat)(_astConstants.DeclareBuiltBag, tLines(this.lines)), lead, opDeclareRes, opOut);
		},

		BlockObj(lead, opDeclareRes, opOut) {
			const lines = (0, _util.cat)(_astConstants.DeclareBuiltObj, tLines(this.lines));
			const res = (0, _util.ifElse)(this.opObjed, objed => (0, _util.ifElse)(this.opName, name => (0, _msCall.msSet)(t0(objed), _astConstants.IdBuilt, (0, _esastDistAst.Literal)(name)), () => (0, _msCall.msSet)(t0(objed), _astConstants.IdBuilt)), () => (0, _util.ifElse)(this.opName, _ => (0, _msCall.msSetName)(_astConstants.IdBuilt, (0, _esastDistAst.Literal)(_)), () => _astConstants.IdBuilt));
			return transpileBlock(res, lines, lead, opDeclareRes, opOut);
		},

		BlockMap(lead, opDeclareRes, opOut) {
			return transpileBlock(_astConstants.IdBuilt, (0, _util.cat)(_astConstants.DeclareBuiltMap, tLines(this.lines)), lead, opDeclareRes, opOut);
		},

		BlockWrap() {
			return blockWrap(t0(this.block));
		},

		Break() {
			return (0, _esastDistAst.BreakStatement)();
		},

		BreakWithVal() {
			return (0, _esastDistAst.ReturnStatement)(t0(this.value));
		},

		Call() {
			return (0, _esastDistAst.CallExpression)(t0(this.called), this.args.map(t0));
		},

		CaseDo() {
			const body = caseBody(this.parts, this.opElse);
			return (0, _util.ifElse)(this.opCased, _ => (0, _esastDistAst.BlockStatement)([t0(_), body]), () => body);
		},
		CaseVal() {
			const body = caseBody(this.parts, this.opElse);
			const block = (0, _util.ifElse)(this.opCased, _ => [t0(_), body], () => [body]);
			return blockWrap((0, _esastDistAst.BlockStatement)(block));
		},
		CaseDoPart: casePart,
		CaseValPart: casePart,

		Class() {
			const methods = (0, _util.cat)(this.statics.map(methodDefinition(true)), (0, _util.opMap)(this.opConstructor, constructorDefinition), this.methods.map(methodDefinition(false)));
			const opName = (0, _util.opMap)(this.opName, _esastDistUtil.idCached);
			const classExpr = (0, _esastDistAst.ClassExpression)(opName, (0, _util.opMap)(this.opSuperClass, t0), (0, _esastDistAst.ClassBody)(methods));

			return (0, _util.ifElse)(this.opDo, _ => t1(_, classExpr), () => classExpr);
		},

		ClassDo(classExpr) {
			const lead = (0, _esastDistAst.VariableDeclaration)('const', [(0, _esastDistAst.VariableDeclarator)(t0(this.declareFocus), classExpr)]);
			const ret = (0, _esastDistAst.ReturnStatement)(t0(this.declareFocus));
			const block = t3(this.block, lead, null, ret);
			return blockWrap(block);
		},

		ConditionalDo() {
			const test = t0(this.test);
			return (0, _esastDistAst.IfStatement)(this.isUnless ? (0, _esastDistAst.UnaryExpression)('!', test) : test, t0(this.result));
		},

		ConditionalVal() {
			const test = t0(this.test);
			const result = (0, _msCall.msSome)(blockWrap(t0(this.result)));
			return this.isUnless ? (0, _esastDistAst.ConditionalExpression)(test, _msCall.MsNone, result) : (0, _esastDistAst.ConditionalExpression)(test, result, _msCall.MsNone);
		},

		Catch() {
			return (0, _esastDistAst.CatchClause)(t0(this.caught), t0(this.block));
		},

		Continue() {
			return (0, _esastDistAst.ContinueStatement)();
		},

		Debug() {
			return context.opts.includeChecks() ? tLines(this.lines) : [];
		},

		ExceptDo() {
			return transpileExcept(this);
		},
		ExceptVal() {
			return blockWrap((0, _esastDistAst.BlockStatement)([transpileExcept(this)]));
		},

		ForDo() {
			return forLoop(this.opIteratee, this.block);
		},

		ForBag() {
			return blockWrap((0, _esastDistAst.BlockStatement)([_astConstants.DeclareBuiltBag, forLoop(this.opIteratee, this.block), _astConstants.ReturnBuilt]));
		},

		ForVal() {
			return blockWrap((0, _esastDistAst.BlockStatement)([forLoop(this.opIteratee, this.block)]));
		},

		Fun() {
			const oldInGenerator = isInGenerator;
			isInGenerator = this.isGenerator;

			// TODO:ES6 use `...`f
			const nArgs = (0, _esastDistAst.Literal)(this.args.length);
			const opDeclareRest = (0, _util.opMap)(this.opRestArg, rest => (0, _util2.declare)(rest, (0, _esastDistAst.CallExpression)(_astConstants.ArraySliceCall, [_astConstants.IdArguments, nArgs])));
			const argChecks = (0, _util.opIf)(context.opts.includeChecks(), () => (0, _util.flatOpMap)(this.args, _util2.opTypeCheckForLocalDeclare));

			const _in = (0, _util.opMap)(this.opIn, t0);

			const opDeclareThis = (0, _util.opIf)(!isInConstructor, () => (0, _util.opMap)(this.opDeclareThis, () => (0, _esastDistAst.VariableDeclaration)('const', [(0, _esastDistAst.VariableDeclarator)(_astConstants.IdLexicalThis, (0, _esastDistAst.ThisExpression)())])));

			const lead = (0, _util.cat)(opDeclareThis, opDeclareRest, argChecks, _in);

			const _out = (0, _util.opMap)(this.opOut, t0);
			const body = t3(this.block, lead, this.opDeclareRes, _out);
			const args = this.args.map(t0);
			isInGenerator = oldInGenerator;
			const id = (0, _util.opMap)(this.opName, _esastDistUtil.idCached);

			const canUseArrowFunction = id === null && this.opDeclareThis === null && opDeclareRest === null && !this.isGenerator;
			return canUseArrowFunction ? (0, _esastDistAst.ArrowFunctionExpression)(args, body) : (0, _esastDistAst.FunctionExpression)(id, args, body, this.isGenerator);
		},

		Lazy() {
			return (0, _msCall.lazyWrap)(t0(this.value));
		},

		NumberLiteral() {
			// Negative numbers are not part of ES spec.
			// http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.3
			const lit = (0, _esastDistAst.Literal)(Math.abs(this.value));
			return (0, _util.isPositive)(this.value) ? lit : (0, _esastDistAst.UnaryExpression)('-', lit);
		},

		GlobalAccess() {
			return (0, _esastDistAst.Identifier)(this.name);
		},

		LocalAccess() {
			return this.name === 'this' ? isInConstructor ? (0, _esastDistAst.ThisExpression)() : _astConstants.IdLexicalThis : (0, _util2.accessLocalDeclare)(verifyResults.localDeclareForAccess(this));
		},

		LocalDeclare() {
			return (0, _esastDistAst.Identifier)((0, _util2.idForDeclareCached)(this).name);
		},

		LocalMutate() {
			return (0, _esastDistSpecialize.assignmentExpressionPlain)((0, _esastDistUtil.idCached)(this.name), t0(this.value));
		},

		Logic() {
			(0, _util.assert)(this.kind === _MsAst.L_And || this.kind === _MsAst.L_Or);
			const op = this.kind === _MsAst.L_And ? '&&' : '||';
			return (0, _util.tail)(this.args).reduce((a, b) => (0, _esastDistAst.LogicalExpression)(op, a, t0(b)), t0(this.args[0]));
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
					return (0, _esastDistSpecialize.assignmentExpressionPlain)((0, _esastDistUtil.member)(t0(this.object), this.name), t0(this.value));
				case _MsAst.MS_New:
					return (0, _msCall.msNewProperty)(t0(this.object), (0, _esastDistAst.Literal)(this.name), t0(this.value));
				case _MsAst.MS_NewMutable:
					return (0, _msCall.msNewMutableProperty)(t0(this.object), (0, _esastDistAst.Literal)(this.name), t0(this.value));
				default:
					throw new Error();
			}
		},

		Module() {
			const body = (0, _util.cat)(tLines(this.lines), (0, _util.opMap)(this.opDefaultExport, _ => (0, _esastDistSpecialize.assignmentExpressionPlain)(_astConstants.ExportsDefault, t0(_))));
			return (0, _esastDistAst.Program)((0, _util.cat)((0, _util.opIf)(context.opts.includeUseStrict(), () => _astConstants.UseStrict), (0, _util.opIf)(context.opts.includeAmdefine(), () => _astConstants.AmdefineHeader), (0, _esastDistUtil.toStatement)(amdWrapModule(this.doUses, this.uses.concat(this.debugUses), body))));
		},

		New() {
			const anySplat = this.args.some(_ => _ instanceof _MsAst.Splat);
			context.check(!anySplat, this.loc, 'TODO: Splat params for new');
			return (0, _esastDistAst.NewExpression)(t0(this.type), this.args.map(t0));
		},

		Not() {
			return (0, _esastDistAst.UnaryExpression)('!', t0(this.arg));
		},

		ObjEntry() {
			return this.assign instanceof _MsAst.AssignSingle && !this.assign.assignee.isLazy() ? t1(this.assign, val => (0, _esastDistSpecialize.assignmentExpressionPlain)((0, _esastDistUtil.member)(_astConstants.IdBuilt, this.assign.assignee.name), val)) : (0, _util.cat)(t0(this.assign), this.assign.allAssignees().map(_ => (0, _msCall.msSetLazy)(_astConstants.IdBuilt, (0, _esastDistAst.Literal)(_.name), (0, _util2.idForDeclareCached)(_))));
		},

		ObjSimple() {
			return (0, _esastDistAst.ObjectExpression)(this.pairs.map(pair => (0, _esastDistSpecialize.property)('init', (0, _esastDistUtil.propertyIdOrLiteralCached)(pair.key), t0(pair.value))));
		},

		Quote() {
			if (this.parts.length === 0) return _astConstants.LitEmptyString;else {
				const quasis = [],
				      expressions = [];

				// TemplateLiteral must start with a TemplateElement
				if (typeof this.parts[0] !== 'string') quasis.push(_astConstants.EmptyTemplateElement);

				for (let part of this.parts) if (typeof part === 'string') quasis.push((0, _util2.templateElementForString)(part));else {
					// "{1}{1}" needs an empty quasi in the middle (and on the ends)
					if (quasis.length === expressions.length) quasis.push(_astConstants.EmptyTemplateElement);
					expressions.push(t0(part));
				}

				// TemplateLiteral must end with a TemplateElement, so one more quasi than expression.
				if (quasis.length === expressions.length) quasis.push(_astConstants.EmptyTemplateElement);

				return (0, _esastDistAst.TemplateLiteral)(quasis, expressions);
			}
		},

		QuoteTemplate() {
			return (0, _esastDistAst.TaggedTemplateExpression)(t0(this.tag), t0(this.quote));
		},

		SpecialDo() {
			switch (this.kind) {
				case _MsAst.SD_Debugger:
					return (0, _esastDistAst.DebuggerStatement)();
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
					return (0, _esastDistAst.Literal)(false);
				case _MsAst.SV_Null:
					return (0, _esastDistAst.Literal)(null);
				case _MsAst.SV_Sub:
					return (0, _esastDistUtil.member)(_msCall.IdMs, 'sub');
				case _MsAst.SV_Super:
					return (0, _esastDistAst.Identifier)('super');
				case _MsAst.SV_ThisModuleDirectory:
					return (0, _esastDistAst.Identifier)('__dirname');
				case _MsAst.SV_True:
					return (0, _esastDistAst.Literal)(true);
				case _MsAst.SV_Undefined:
					return (0, _esastDistAst.UnaryExpression)('void', _astConstants.LitZero);
				default:
					throw new Error(this.kind);
			}
		},

		Splat() {
			return (0, _esastDistAst.SpreadElement)(t0(this.splatted));
		},

		SwitchDo() {
			return transpileSwitch(this);
		},
		SwitchVal() {
			return blockWrap((0, _esastDistAst.BlockStatement)([transpileSwitch(this)]));
		},
		SwitchDoPart: switchPart,
		SwitchValPart: switchPart,

		Throw() {
			return (0, _util.ifElse)(this.opThrown, _ => (0, _esastDistAst.ThrowStatement)((0, _msCall.msError)(t0(_))), () => (0, _esastDistAst.ThrowStatement)((0, _msCall.msError)(_astConstants.LitStrThrow)));
		},

		With() {
			const idDeclare = (0, _util2.idForDeclareCached)(this.declare);
			const block = t3(this.block, null, null, (0, _esastDistAst.ReturnStatement)(idDeclare));
			const fun = isInGenerator ? (0, _esastDistAst.FunctionExpression)(null, [idDeclare], block, true) : (0, _esastDistAst.ArrowFunctionExpression)([idDeclare], block);
			const call = (0, _esastDistAst.CallExpression)(fun, [t0(this.value)]);
			return isInGenerator ? (0, _esastDistSpecialize.yieldExpressionDelegate)(call) : call;
		},

		Yield() {
			return (0, _esastDistSpecialize.yieldExpressionNoDelegate)((0, _util.opMap)(this.opYielded, t0));
		},

		YieldTo() {
			return (0, _esastDistSpecialize.yieldExpressionDelegate)(t0(this.yieldedTo));
		}
	});

	function casePart(alternate) {
		if (this.test instanceof _MsAst.Pattern) {
			var _test = this.test;
			const type = _test.type;
			const patterned = _test.patterned;
			const locals = _test.locals;

			const decl = (0, _esastDistAst.VariableDeclaration)('const', [(0, _esastDistAst.VariableDeclarator)(_astConstants.IdExtract, (0, _msCall.msExtract)(t0(type), t0(patterned)))]);
			const test = (0, _esastDistAst.BinaryExpression)('!==', _astConstants.IdExtract, _astConstants.LitNull);
			const extract = (0, _esastDistAst.VariableDeclaration)('const', locals.map((_, idx) => (0, _esastDistAst.VariableDeclarator)((0, _util2.idForDeclareCached)(_), (0, _esastDistSpecialize.memberExpression)(_astConstants.IdExtract, (0, _esastDistAst.Literal)(idx)))));
			const res = t1(this.result, extract);
			return (0, _esastDistAst.BlockStatement)([decl, (0, _esastDistAst.IfStatement)(test, res, alternate)]);
		} else
			// alternate written to by `caseBody`.
			return (0, _esastDistAst.IfStatement)(t0(this.test), t0(this.result), alternate);
	}

	function switchPart() {
		const opOut = (0, _util.opIf)(this instanceof _MsAst.SwitchDoPart, _esastDistAst.BreakStatement);
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
		return (0, _esastDistAst.SwitchCase)(t0(this.value), [block]);
	}

	// Functions specific to certain expressions.
	const
	// Wraps a block (with `return` statements in it) in an IIFE.
	blockWrap = block => {
		const invoke = (0, _esastDistSpecialize.callExpressionThunk)((0, _esastDistSpecialize.functionExpressionThunk)(block, isInGenerator));
		return isInGenerator ? (0, _esastDistSpecialize.yieldExpressionDelegate)(invoke) : invoke;
	},
	      caseBody = (parts, opElse) => {
		let acc = (0, _util.ifElse)(opElse, t0, () => _astConstants.ThrowNoCaseMatch);
		for (let i = parts.length - 1; i >= 0; i = i - 1) acc = t1(parts[i], acc);
		return acc;
	},
	      forLoop = (opIteratee, block) => (0, _util.ifElse)(opIteratee, _ref => {
		let element = _ref.element;
		let bag = _ref.bag;

		const declare = (0, _esastDistAst.VariableDeclaration)('let', [(0, _esastDistAst.VariableDeclarator)(t0(element))]);
		return (0, _esastDistAst.ForOfStatement)(declare, t0(bag), t0(block));
	}, () => (0, _util2.forStatementInfinite)(t0(block))),
	      constructorDefinition = fun => {
		isInConstructor = true;
		const res = (0, _esastDistAst.MethodDefinition)((0, _esastDistAst.Identifier)('constructor'), t0(fun), 'constructor', false, false);
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
			return (0, _esastDistAst.MethodDefinition)(key, value, 'method', isStatic, computed);
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
			return (0, _esastDistAst.MethodDefinition)(key, value, 'method', isStatic, computed);
		}
	},
	      transpileBlock = (returned, lines, lead, opDeclareRes, opOut) => {
		// TODO:ES6 Optional arguments
		if (lead === undefined) lead = null;
		if (opDeclareRes === undefined) opDeclareRes = null;
		if (opOut === undefined) opOut = null;
		const fin = (0, _util.ifElse)(opDeclareRes, rd => {
			const ret = maybeWrapInCheckContains(returned, rd.opType, rd.name);
			return (0, _util.ifElse)(opOut, _ => (0, _util.cat)((0, _util2.declare)(rd, ret), _, _astConstants.ReturnRes), () => (0, _esastDistAst.ReturnStatement)(ret));
		}, () => (0, _util.cat)(opOut, (0, _esastDistAst.ReturnStatement)(returned)));
		return (0, _esastDistAst.BlockStatement)((0, _util.cat)(lead, lines, fin));
	},
	      transpileExcept = except => (0, _esastDistAst.TryStatement)(t0(except._try), (0, _util.opMap)(except._catch, t0), (0, _util.opMap)(except._finally, t0)),
	      transpileSwitch = _ => {
		const parts = _.parts.map(t0);

		parts.push((0, _util.ifElse)(_.opElse, _ => (0, _esastDistAst.SwitchCase)(undefined, t0(_).body), () => _astConstants.SwitchCaseNoMatch));

		return (0, _esastDistAst.SwitchStatement)(t0(_.switched), parts);
	};

	// Module helpers
	const amdWrapModule = (doUses, otherUses, body) => {
		const allUses = doUses.concat(otherUses);
		const usePaths = (0, _esastDistAst.ArrayExpression)((0, _util.cat)(_astConstants.LitStrExports, allUses.map(_ => (0, _esastDistAst.Literal)((0, _manglePath2.default)(_.path)))));
		const useIdentifiers = allUses.map((_, i) => (0, _esastDistUtil.idCached)(`${ pathBaseName(_.path) }_${ i }`));
		const useArgs = (0, _util.cat)(_astConstants.IdExports, useIdentifiers);
		const useDos = doUses.map((use, i) => (0, _esastDistUtil.loc)((0, _esastDistAst.ExpressionStatement)((0, _msCall.msGetModule)(useIdentifiers[i])), use.loc));
		const opUseDeclare = (0, _util.opIf)(!(0, _util.isEmpty)(otherUses), () => (0, _esastDistAst.VariableDeclaration)('const', (0, _util.flatMap)(otherUses, (use, i) => useDeclarators(use, useIdentifiers[i + doUses.length]))));
		const fullBody = (0, _esastDistAst.BlockStatement)((0, _util.cat)(useDos, opUseDeclare, body, _astConstants.ReturnExports));
		const lazyBody = context.opts.lazyModule() ? (0, _esastDistAst.BlockStatement)([(0, _esastDistAst.ExpressionStatement)((0, _esastDistSpecialize.assignmentExpressionPlain)(_astConstants.ExportsGet, (0, _msCall.msLazy)((0, _esastDistSpecialize.functionExpressionThunk)(fullBody))))]) : fullBody;
		return (0, _esastDistAst.CallExpression)(_astConstants.IdDefine, [usePaths, (0, _esastDistAst.ArrowFunctionExpression)(useArgs, lazyBody)]);
	},
	      pathBaseName = path => path.substr(path.lastIndexOf('/') + 1),
	      useDeclarators = (use, moduleIdentifier) => {
		// TODO: Could be neater about this
		const isLazy = ((0, _util.isEmpty)(use.used) ? use.opUseDefault : use.used[0]).isLazy();
		const value = (isLazy ? _msCall.msLazyGetModule : _msCall.msGetModule)(moduleIdentifier);

		const usedDefault = (0, _util.opMap)(use.opUseDefault, def => {
			const defexp = (0, _msCall.msGetDefaultExport)(moduleIdentifier);
			const val = isLazy ? (0, _msCall.lazyWrap)(defexp) : defexp;
			return (0, _esastDistUtil.loc)((0, _esastDistAst.VariableDeclarator)((0, _util2.idForDeclareCached)(def), val), def.loc);
		});

		const usedDestruct = (0, _util.isEmpty)(use.used) ? null : makeDestructureDeclarators(use.used, isLazy, value, true, false);

		return (0, _util.cat)(usedDefault, usedDestruct);
	};

	// General utils. Not in util.js because these close over context.
	const makeDestructureDeclarators = (assignees, isLazy, value, isModule, isExport) => {
		const destructuredName = `_$${ assignees[0].loc.start.line }`;
		const idDestructured = (0, _esastDistAst.Identifier)(destructuredName);
		const declarators = assignees.map(assignee => {
			// TODO: Don't compile it if it's never accessed
			const get = getMember(idDestructured, assignee.name, isLazy, isModule);
			return makeDeclarator(assignee, get, isLazy, isExport);
		});
		// Getting lazy module is done by ms.lazyGetModule.
		const val = isLazy && !isModule ? (0, _msCall.lazyWrap)(value) : value;
		return (0, _util.unshift)((0, _esastDistAst.VariableDeclarator)(idDestructured, val), declarators);
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
			return (0, _esastDistAst.VariableDeclarator)((0, _util2.idForDeclareCached)(assignee), (0, _esastDistSpecialize.assignmentExpressionPlain)((0, _esastDistUtil.member)(_astConstants.IdExports, name), value));
		} else {
			const val = isLazy && !valueIsAlreadyLazy ? (0, _msCall.lazyWrap)(value) : value;
			(0, _util.assert)(isLazy || !valueIsAlreadyLazy);
			return (0, _esastDistAst.VariableDeclarator)((0, _util2.idForDeclareCached)(assignee), val);
		}
	},
	      maybeWrapInCheckContains = (ast, opType, name) => context.opts.includeChecks() && opType !== null ? (0, _msCall.msCheckContains)(t0(opType), ast, (0, _esastDistAst.Literal)(name)) : ast,
	      getMember = (astObject, gotName, isLazy, isModule) => isLazy ? (0, _msCall.msLazyGet)(astObject, (0, _esastDistAst.Literal)(gotName)) : isModule && context.opts.includeChecks() ? (0, _msCall.msGet)(astObject, (0, _esastDistAst.Literal)(gotName)) : (0, _esastDistUtil.member)(astObject, gotName);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaXZhdGUvdHJhbnNwaWxlL3RyYW5zcGlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQTZCQSxLQUFJLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLGVBQWUsQ0FBQTs7bUJBRTNDLENBQUMsUUFBUSxFQUFFLGdCQUFnQixFQUFFLGNBQWMsS0FBSztBQUM5RCxTQUFPLEdBQUcsUUFBUSxDQUFBO0FBQ2xCLGVBQWEsR0FBRyxjQUFjLENBQUE7QUFDOUIsZUFBYSxHQUFHLEtBQUssQ0FBQTtBQUNyQixpQkFBZSxHQUFHLEtBQUssQ0FBQTtBQUN2QixRQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTs7QUFFaEMsU0FBTyxHQUFHLGFBQWEsR0FBRyxTQUFTLENBQUE7QUFDbkMsU0FBTyxHQUFHLENBQUE7RUFDVjs7QUFFTSxPQUNOLEVBQUUsR0FBRyxJQUFJLElBQUksbUJBcENLLEdBQUcsRUFvQ0osSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFDN0MsT0FDQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxLQUFLLG1CQXRDRixHQUFHLEVBc0NHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQztPQUN0RCxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEtBQUssbUJBdkNkLEdBQUcsRUF1Q2UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7T0FDOUUsTUFBTSxHQUFHLEtBQUssSUFBSTtBQUNqQixRQUFNLEdBQUcsR0FBRyxFQUFHLENBQUE7QUFDZixPQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtBQUN6QixTQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMs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SUFBSSxHQUMvQyxZQS9sQkYsZUFBZSxFQStsQkcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRSxrQkFubkJWLE9BQU8sRUFtbkJXLElBQUksQ0FBQyxDQUFDLEdBQy9DLEdBQUc7T0FFTCxTQUFTLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEtBQ2hELE1BQU0sR0FDTixZQXBtQm9GLFNBQVMsRUFvbUJuRixTQUFTLEVBQUUsa0JBeG5CRyxPQUFPLEVBd25CRixPQUFPLENBQUMsQ0FBQyxHQUN0QyxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FDeEMsWUF0bUJvQyxLQUFLLEVBc21CbkMsU0FBUyxFQUFFLGtCQTFuQk8sT0FBTyxFQTBuQk4sT0FBTyxDQUFDLENBQUMsR0FDbEMsbUJBdm5Cc0IsTUFBTSxFQXVuQnJCLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQSIsImZpbGUiOiJwcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcnJheUV4cHJlc3Npb24sIEFycm93RnVuY3Rpb25FeHByZXNzaW9uLCBCaW5hcnlFeHByZXNzaW9uLCBCbG9ja1N0YXRlbWVudCwgQnJlYWtTdGF0ZW1lbnQsXG5cdENhbGxFeHByZXNzaW9uLCBDYXRjaENsYXVzZSwgQ2xhc3NCb2R5LCBDbGFzc0V4cHJlc3Npb24sIENvbmRpdGlvbmFsRXhwcmVzc2lvbixcblx0Q29udGludWVTdGF0ZW1lbnQsIERlYnVnZ2VyU3RhdGVtZW50LCBFeHByZXNzaW9uU3RhdGVtZW50LCBGb3JPZlN0YXRlbWVudCwgRnVuY3Rpb25FeHByZXNzaW9uLFxuXHRJZGVudGlmaWVyLCBJZlN0YXRlbWVudCwgTGl0ZXJhbCwgTG9naWNhbEV4cHJlc3Npb24sIE1ldGhvZERlZmluaXRpb24sIE5ld0V4cHJlc3Npb24sXG5cdE9iamVjdEV4cHJlc3Npb24sIFByb2dyYW0sIFJldHVyblN0YXRlbWVudCwgU3ByZWFkRWxlbWVudCwgU3dpdGNoQ2FzZSwgU3dpdGNoU3RhdGVtZW50LFxuXHRUYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb24sIFRlbXBsYXRlTGl0ZXJhbCwgVGhpc0V4cHJlc3Npb24sIFRocm93U3RhdGVtZW50LCBUcnlTdGF0ZW1lbnQsXG5cdFZhcmlhYmxlRGVjbGFyYXRpb24sIFVuYXJ5RXhwcmVzc2lvbiwgVmFyaWFibGVEZWNsYXJhdG9yIH0gZnJvbSAnZXNhc3QvZGlzdC9hc3QnXG5pbXBvcnQgeyBpZENhY2hlZCwgbG9jLCBtZW1iZXIsIHByb3BlcnR5SWRPckxpdGVyYWxDYWNoZWQsIHRvU3RhdGVtZW50IH0gZnJvbSAnZXNhc3QvZGlzdC91dGlsJ1xuaW1wb3J0IHsgYXNzaWdubWVudEV4cHJlc3Npb25QbGFpbiwgY2FsbEV4cHJlc3Npb25UaHVuaywgZnVuY3Rpb25FeHByZXNzaW9uVGh1bmssIG1lbWJlckV4cHJlc3Npb24sXG5cdHByb3BlcnR5LCB5aWVsZEV4cHJlc3Npb25EZWxlZ2F0ZSwgeWllbGRFeHByZXNzaW9uTm9EZWxlZ2F0ZSB9IGZyb20gJ2VzYXN0L2Rpc3Qvc3BlY2lhbGl6ZSdcbmltcG9ydCBtYW5nbGVQYXRoIGZyb20gJy4uL21hbmdsZVBhdGgnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHsgQXNzaWduU2luZ2xlLCBDYWxsLCBGdW4sIExfQW5kLCBMX09yLCBMRF9MYXp5LCBMRF9NdXRhYmxlLCBNZXRob2RJbXBsLCBNU19NdXRhdGUsIE1TX05ldyxcblx0TVNfTmV3TXV0YWJsZSwgUGF0dGVybiwgU3BsYXQsIFNEX0RlYnVnZ2VyLCBTVl9Db250YWlucywgU1ZfRmFsc2UsIFNWX051bGwsIFNWX1N1YiwgU1ZfU3VwZXIsXG5cdFNWX1RoaXNNb2R1bGVEaXJlY3RvcnksIFNWX1RydWUsIFNWX1VuZGVmaW5lZCwgU3dpdGNoRG9QYXJ0IH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQgeyBhc3NlcnQsIGNhdCwgZmxhdE1hcCwgZmxhdE9wTWFwLCBpZkVsc2UsIGlzRW1wdHksXG5cdGltcGxlbWVudE1hbnksIGlzUG9zaXRpdmUsIG9wSWYsIG9wTWFwLCB0YWlsLCB1bnNoaWZ0IH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7IEFtZGVmaW5lSGVhZGVyLCBBcnJheVNsaWNlQ2FsbCwgRGVjbGFyZUJ1aWx0QmFnLCBEZWNsYXJlQnVpbHRNYXAsIERlY2xhcmVCdWlsdE9iaixcblx0RW1wdHlUZW1wbGF0ZUVsZW1lbnQsIEV4cG9ydHNEZWZhdWx0LCBFeHBvcnRzR2V0LCBJZEFyZ3VtZW50cywgSWRCdWlsdCwgSWREZWZpbmUsIElkRXhwb3J0cyxcblx0SWRFeHRyYWN0LCBJZExleGljYWxUaGlzLCBMaXRFbXB0eVN0cmluZywgTGl0TnVsbCwgTGl0U3RyRXhwb3J0cywgTGl0U3RyVGhyb3csIExpdFplcm8sXG5cdFJldHVybkJ1aWx0LCBSZXR1cm5FeHBvcnRzLCBSZXR1cm5SZXMsIFN3aXRjaENhc2VOb01hdGNoLCBUaHJvd0Fzc2VydEZhaWwsIFRocm93Tm9DYXNlTWF0Y2gsXG5cdFVzZVN0cmljdCB9IGZyb20gJy4vYXN0LWNvbnN0YW50cydcbmltcG9ydCB7IElkTXMsIGxhenlXcmFwLCBtc0FkZCwgbXNBZGRNYW55LCBtc0Fzc2VydCwgbXNBc3NlcnROb3QsIG1zQXNzb2MsXG5cdG1zQ2hlY2tDb250YWlucywgbXNFcnJvciwgbXNFeHRyYWN0LCBtc0dldCwgbXNHZXREZWZhdWx0RXhwb3J0LCBtc0dldE1vZHVsZSwgbXNMYXp5LCBtc0xhenlHZXQsXG5cdG1zTGF6eUdldE1vZHVsZSwgbXNOZXdNdXRhYmxlUHJvcGVydHksIG1zTmV3UHJvcGVydHksIG1zU2V0LCBtc1NldE5hbWUsIG1zU2V0TGF6eSxcdG1zU29tZSxcblx0bXNTeW1ib2wsIE1zTm9uZSB9IGZyb20gJy4vbXMtY2FsbCdcbmltcG9ydCB7IGFjY2Vzc0xvY2FsRGVjbGFyZSwgZGVjbGFyZSwgZm9yU3RhdGVtZW50SW5maW5pdGUsIGlkRm9yRGVjbGFyZUNhY2hlZCxcblx0b3BUeXBlQ2hlY2tGb3JMb2NhbERlY2xhcmUsIHRlbXBsYXRlRWxlbWVudEZvclN0cmluZyB9IGZyb20gJy4vdXRpbCdcblxubGV0IGNvbnRleHQsIHZlcmlmeVJlc3VsdHMsIGlzSW5HZW5lcmF0b3IsIGlzSW5Db25zdHJ1Y3RvclxuXG5leHBvcnQgZGVmYXVsdCAoX2NvbnRleHQsIG1vZHVsZUV4cHJlc3Npb24sIF92ZXJpZnlSZXN1bHRzKSA9PiB7XG5cdGNvbnRleHQgPSBfY29udGV4dFxuXHR2ZXJpZnlSZXN1bHRzID0gX3ZlcmlmeVJlc3VsdHNcblx0aXNJbkdlbmVyYXRvciA9IGZhbHNlXG5cdGlzSW5Db25zdHJ1Y3RvciA9IGZhbHNlXG5cdGNvbnN0IHJlcyA9IHQwKG1vZHVsZUV4cHJlc3Npb24pXG5cdC8vIFJlbGVhc2UgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cblx0Y29udGV4dCA9IHZlcmlmeVJlc3VsdHMgPSB1bmRlZmluZWRcblx0cmV0dXJuIHJlc1xufVxuXG5leHBvcnQgY29uc3Rcblx0dDAgPSBleHByID0+IGxvYyhleHByLnRyYW5zcGlsZSgpLCBleHByLmxvYylcbmNvbnN0XG5cdHQxID0gKGV4cHIsIGFyZykgPT4gbG9jKGV4cHIudHJhbnNwaWxlKGFyZyksIGV4cHIubG9jKSxcblx0dDMgPSAoZXhwciwgYXJnLCBhcmcyLCBhcmczKSA9PiBsb2MoZXhwci50cmFuc3BpbGUoYXJnLCBhcmcyLCBhcmczKSwgZXhwci5sb2MpLFxuXHR0TGluZXMgPSBleHBycyA9PiB7XG5cdFx0Y29uc3Qgb3V0ID0gWyBdXG5cdFx0Zm9yIChjb25zdCBleHByIG9mIGV4cHJzKSB7XG5cdFx0XHRjb25zdCBhc3QgPSBleHByLnRyYW5zcGlsZSgpXG5cdFx0XHRpZiAoYXN0IGluc3RhbmNlb2YgQXJyYXkpXG5cdFx0XHRcdC8vIERlYnVnIG1heSBwcm9kdWNlIG11bHRpcGxlIHN0YXRlbWVudHMuXG5cdFx0XHRcdGZvciAoY29uc3QgXyBvZiBhc3QpXG5cdFx0XHRcdFx0b3V0LnB1c2godG9TdGF0ZW1lbnQoXykpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdG91dC5wdXNoKGxvYyh0b1N0YXRlbWVudChhc3QpLCBleHByLmxvYykpXG5cdFx0fVxuXHRcdHJldHVybiBvdXRcblx0fVxuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICd0cmFuc3BpbGUnLCB7XG5cdEFzc2VydCgpIHtcblx0XHRjb25zdCBmYWlsQ29uZCA9ICgpID0+IHtcblx0XHRcdGNvbnN0IGNvbmQgPSB0MCh0aGlzLmNvbmRpdGlvbilcblx0XHRcdHJldHVybiB0aGlzLm5lZ2F0ZSA/IGNvbmQgOiBVbmFyeUV4cHJlc3Npb24oJyEnLCBjb25kKVxuXHRcdH1cblxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcFRocm93bixcblx0XHRcdHRocm93biA9PiBJZlN0YXRlbWVudChmYWlsQ29uZCgpLCBUaHJvd1N0YXRlbWVudChtc0Vycm9yKHQwKHRocm93bikpKSksXG5cdFx0XHQoKSA9PiB7XG5cdFx0XHRcdGlmICh0aGlzLmNvbmRpdGlvbiBpbnN0YW5jZW9mIENhbGwpIHtcblx0XHRcdFx0XHRjb25zdCBjYWxsID0gdGhpcy5jb25kaXRpb25cblx0XHRcdFx0XHRjb25zdCBhc3MgPSB0aGlzLm5lZ2F0ZSA/IG1zQXNzZXJ0Tm90IDogbXNBc3NlcnRcblx0XHRcdFx0XHRyZXR1cm4gYXNzKHQwKGNhbGwuY2FsbGVkKSwgLi4uY2FsbC5hcmdzLm1hcCh0MCkpXG5cdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdHJldHVybiBJZlN0YXRlbWVudChmYWlsQ29uZCgpLCBUaHJvd0Fzc2VydEZhaWwpXG5cdFx0XHR9KVxuXHR9LFxuXG5cdEFzc2lnblNpbmdsZSh2YWxXcmFwKSB7XG5cdFx0Y29uc3QgdmFsID0gdmFsV3JhcCA9PT0gdW5kZWZpbmVkID8gdDAodGhpcy52YWx1ZSkgOiB2YWxXcmFwKHQwKHRoaXMudmFsdWUpKVxuXHRcdGNvbnN0IGRlY2xhcmUgPVxuXHRcdFx0bWFrZURlY2xhcmF0b3IodGhpcy5hc3NpZ25lZSwgdmFsLCBmYWxzZSwgdmVyaWZ5UmVzdWx0cy5pc0V4cG9ydEFzc2lnbih0aGlzKSlcblx0XHRyZXR1cm4gVmFyaWFibGVEZWNsYXJhdGlvbih0aGlzLmFzc2lnbmVlLmlzTXV0YWJsZSgpID8gJ2xldCcgOiAnY29uc3QnLCBbIGRlY2xhcmUgXSlcblx0fSxcblx0Ly8gVE9ETzpFUzYgSnVzdCB1c2UgbmF0aXZlIGRlc3RydWN0dXJpbmcgYXNzaWduXG5cdEFzc2lnbkRlc3RydWN0dXJlKCkge1xuXHRcdHJldHVybiBWYXJpYWJsZURlY2xhcmF0aW9uKHRoaXMua2luZCgpID09PSBMRF9NdXRhYmxlID8gJ2xldCcgOiAnY29uc3QnLFxuXHRcdFx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMoXG5cdFx0XHRcdHRoaXMuYXNzaWduZWVzLFxuXHRcdFx0XHR0aGlzLmtpbmQoKSA9PT0gTERfTGF6eSxcblx0XHRcdFx0dDAodGhpcy52YWx1ZSksXG5cdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHR2ZXJpZnlSZXN1bHRzLmlzRXhwb3J0QXNzaWduKHRoaXMpKSlcblx0fSxcblxuXHRCYWdFbnRyeSgpIHsgcmV0dXJuIG1zQWRkKElkQnVpbHQsIHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdEJhZ0VudHJ5TWFueSgpIHsgcmV0dXJuIG1zQWRkTWFueShJZEJ1aWx0LCB0MCh0aGlzLnZhbHVlKSkgfSxcblxuXHRCYWdTaW1wbGUoKSB7IHJldHVybiBBcnJheUV4cHJlc3Npb24odGhpcy5wYXJ0cy5tYXAodDApKSB9LFxuXG5cdEJsb2NrRG8obGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkge1xuXHRcdC8vIFRPRE86RVM2IE9wdGlvbmFsIGFyZ3VtZW50c1xuXHRcdGlmIChsZWFkID09PSB1bmRlZmluZWQpIGxlYWQgPSBudWxsXG5cdFx0aWYgKG9wRGVjbGFyZVJlcyA9PT0gdW5kZWZpbmVkKSBvcERlY2xhcmVSZXMgPSBudWxsXG5cdFx0aWYgKG9wT3V0ID09PSB1bmRlZmluZWQpIG9wT3V0ID0gbnVsbFxuXHRcdGFzc2VydChvcERlY2xhcmVSZXMgPT09IG51bGwpXG5cdFx0cmV0dXJuIEJsb2NrU3RhdGVtZW50KGNhdChsZWFkLCB0TGluZXModGhpcy5saW5lcyksIG9wT3V0KSlcblx0fSxcblxuXHRCbG9ja1ZhbFRocm93KGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpIHtcblx0XHQvLyBUT0RPOkVTNiBPcHRpb25hbCBhcmd1bWVudHNcblx0XHRpZiAobGVhZCA9PT0gdW5kZWZpbmVkKSBsZWFkID0gbnVsbFxuXHRcdGlmIChvcERlY2xhcmVSZXMgPT09IHVuZGVmaW5lZCkgb3BEZWNsYXJlUmVzID0gbnVsbFxuXHRcdGlmIChvcE91dCA9PT0gdW5kZWZpbmVkKSBvcE91dCA9IG51bGxcblx0XHRjb250ZXh0Lndhcm5JZihvcERlY2xhcmVSZXMgIT09IG51bGwgfHwgb3BPdXQgIT09IG51bGwsIHRoaXMubG9jLFxuXHRcdFx0J091dCBjb25kaXRpb24gaWdub3JlZCBiZWNhdXNlIG9mIG9oLW5vIScpXG5cdFx0cmV0dXJuIEJsb2NrU3RhdGVtZW50KGNhdChsZWFkLCB0TGluZXModGhpcy5saW5lcyksIHQwKHRoaXMudGhyb3cpKSlcblx0fSxcblxuXHRCbG9ja1dpdGhSZXR1cm4obGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayh0MCh0aGlzLnJldHVybmVkKSwgdExpbmVzKHRoaXMubGluZXMpLCBsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KVxuXHR9LFxuXG5cdEJsb2NrQmFnKGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2soXG5cdFx0XHRJZEJ1aWx0LFxuXHRcdFx0Y2F0KERlY2xhcmVCdWlsdEJhZywgdExpbmVzKHRoaXMubGluZXMpKSxcblx0XHRcdGxlYWQsIG9wRGVjbGFyZVJlcywgb3BPdXQpXG5cdH0sXG5cblx0QmxvY2tPYmoobGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dCkge1xuXHRcdGNvbnN0IGxpbmVzID0gY2F0KERlY2xhcmVCdWlsdE9iaiwgdExpbmVzKHRoaXMubGluZXMpKVxuXHRcdGNvbnN0IHJlcyA9IGlmRWxzZSh0aGlzLm9wT2JqZWQsXG5cdFx0XHRvYmplZCA9PiBpZkVsc2UodGhpcy5vcE5hbWUsXG5cdFx0XHRcdG5hbWUgPT4gbXNTZXQodDAob2JqZWQpLCBJZEJ1aWx0LCBMaXRlcmFsKG5hbWUpKSxcblx0XHRcdFx0KCkgPT4gbXNTZXQodDAob2JqZWQpLCBJZEJ1aWx0KSksXG5cdFx0XHQoKSA9PiBpZkVsc2UodGhpcy5vcE5hbWUsXG5cdFx0XHRcdF8gPT4gbXNTZXROYW1lKElkQnVpbHQsIExpdGVyYWwoXykpLFxuXHRcdFx0XHQoKSA9PiBJZEJ1aWx0KSlcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2socmVzLCBsaW5lcywgbGVhZCwgb3BEZWNsYXJlUmVzLCBvcE91dClcblx0fSxcblxuXHRCbG9ja01hcChsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKFxuXHRcdFx0SWRCdWlsdCxcblx0XHRcdGNhdChEZWNsYXJlQnVpbHRNYXAsIHRMaW5lcyh0aGlzLmxpbmVzKSksXG5cdFx0XHRsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KVxuXHR9LFxuXG5cdEJsb2NrV3JhcCgpIHsgcmV0dXJuIGJsb2NrV3JhcCh0MCh0aGlzLmJsb2NrKSkgfSxcblxuXHRCcmVhaygpIHsgcmV0dXJuIEJyZWFrU3RhdGVtZW50KCkgfSxcblxuXHRCcmVha1dpdGhWYWwoKSB7IHJldHVybiBSZXR1cm5TdGF0ZW1lbnQodDAodGhpcy52YWx1ZSkpIH0sXG5cblx0Q2FsbCgpIHtcblx0XHRyZXR1cm4gQ2FsbEV4cHJlc3Npb24odDAodGhpcy5jYWxsZWQpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHRDYXNlRG8oKSB7XG5cdFx0Y29uc3QgYm9keSA9IGNhc2VCb2R5KHRoaXMucGFydHMsIHRoaXMub3BFbHNlKVxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcENhc2VkLCBfID0+IEJsb2NrU3RhdGVtZW50KFsgdDAoXyksIGJvZHkgXSksICgpID0+IGJvZHkpXG5cdH0sXG5cdENhc2VWYWwoKSB7XG5cdFx0Y29uc3QgYm9keSA9IGNhc2VCb2R5KHRoaXMucGFydHMsIHRoaXMub3BFbHNlKVxuXHRcdGNvbnN0IGJsb2NrID0gaWZFbHNlKHRoaXMub3BDYXNlZCwgXyA9PiBbIHQwKF8pLCBib2R5IF0sICgpID0+IFsgYm9keSBdKVxuXHRcdHJldHVybiBibG9ja1dyYXAoQmxvY2tTdGF0ZW1lbnQoYmxvY2spKVxuXHR9LFxuXHRDYXNlRG9QYXJ0OiBjYXNlUGFydCxcblx0Q2FzZVZhbFBhcnQ6IGNhc2VQYXJ0LFxuXG5cdENsYXNzKCkge1xuXHRcdGNvbnN0IG1ldGhvZHMgPSBjYXQoXG5cdFx0XHR0aGlzLnN0YXRpY3MubWFwKG1ldGhvZERlZmluaXRpb24odHJ1ZSkpLFxuXHRcdFx0b3BNYXAodGhpcy5vcENvbnN0cnVjdG9yLCBjb25zdHJ1Y3RvckRlZmluaXRpb24pLFxuXHRcdFx0dGhpcy5tZXRob2RzLm1hcChtZXRob2REZWZpbml0aW9uKGZhbHNlKSkpXG5cdFx0Y29uc3Qgb3BOYW1lID0gb3BNYXAodGhpcy5vcE5hbWUsIGlkQ2FjaGVkKVxuXHRcdGNvbnN0IGNsYXNzRXhwciA9IENsYXNzRXhwcmVzc2lvbihvcE5hbWUsIG9wTWFwKHRoaXMub3BTdXBlckNsYXNzLCB0MCksIENsYXNzQm9keShtZXRob2RzKSlcblxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcERvLCBfID0+IHQxKF8sIGNsYXNzRXhwciksICgpID0+IGNsYXNzRXhwcilcblx0fSxcblxuXHRDbGFzc0RvKGNsYXNzRXhwcikge1xuXHRcdGNvbnN0IGxlYWQgPSBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRcdFZhcmlhYmxlRGVjbGFyYXRvcih0MCh0aGlzLmRlY2xhcmVGb2N1cyksIGNsYXNzRXhwcikgXSlcblx0XHRjb25zdCByZXQgPSBSZXR1cm5TdGF0ZW1lbnQodDAodGhpcy5kZWNsYXJlRm9jdXMpKVxuXHRcdGNvbnN0IGJsb2NrID0gdDModGhpcy5ibG9jaywgbGVhZCwgbnVsbCwgcmV0KVxuXHRcdHJldHVybiBibG9ja1dyYXAoYmxvY2spXG5cdH0sXG5cblx0Q29uZGl0aW9uYWxEbygpIHtcblx0XHRjb25zdCB0ZXN0ID0gdDAodGhpcy50ZXN0KVxuXHRcdHJldHVybiBJZlN0YXRlbWVudChcblx0XHRcdHRoaXMuaXNVbmxlc3MgPyBVbmFyeUV4cHJlc3Npb24oJyEnLCB0ZXN0KSA6IHRlc3QsXG5cdFx0XHR0MCh0aGlzLnJlc3VsdCkpXG5cdH0sXG5cblx0Q29uZGl0aW9uYWxWYWwoKSB7XG5cdFx0Y29uc3QgdGVzdCA9IHQwKHRoaXMudGVzdClcblx0XHRjb25zdCByZXN1bHQgPSBtc1NvbWUoYmxvY2tXcmFwKHQwKHRoaXMucmVzdWx0KSkpXG5cdFx0cmV0dXJuIHRoaXMuaXNVbmxlc3MgP1xuXHRcdFx0Q29uZGl0aW9uYWxFeHByZXNzaW9uKHRlc3QsIE1zTm9uZSwgcmVzdWx0KSA6XG5cdFx0XHRDb25kaXRpb25hbEV4cHJlc3Npb24odGVzdCwgcmVzdWx0LCBNc05vbmUpXG5cdH0sXG5cblx0Q2F0Y2goKSB7XG5cdFx0cmV0dXJuIENhdGNoQ2xhdXNlKHQwKHRoaXMuY2F1Z2h0KSwgdDAodGhpcy5ibG9jaykpXG5cdH0sXG5cblx0Q29udGludWUoKSB7IHJldHVybiBDb250aW51ZVN0YXRlbWVudCgpIH0sXG5cblx0RGVidWcoKSB7IHJldHVybiBjb250ZXh0Lm9wdHMuaW5jbHVkZUNoZWNrcygpID8gdExpbmVzKHRoaXMubGluZXMpIDogWyBdIH0sXG5cblx0RXhjZXB0RG8oKSB7IHJldHVybiB0cmFuc3BpbGVFeGNlcHQodGhpcykgfSxcblx0RXhjZXB0VmFsKCkgeyByZXR1cm4gYmxvY2tXcmFwKEJsb2NrU3RhdGVtZW50KFsgdHJhbnNwaWxlRXhjZXB0KHRoaXMpIF0pKSB9LFxuXG5cdEZvckRvKCkgeyByZXR1cm4gZm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spIH0sXG5cblx0Rm9yQmFnKCkge1xuXHRcdHJldHVybiBibG9ja1dyYXAoQmxvY2tTdGF0ZW1lbnQoW1xuXHRcdFx0RGVjbGFyZUJ1aWx0QmFnLFxuXHRcdFx0Zm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spLFxuXHRcdFx0UmV0dXJuQnVpbHRcblx0XHRdKSlcblx0fSxcblxuXHRGb3JWYWwoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcChCbG9ja1N0YXRlbWVudChbIGZvckxvb3AodGhpcy5vcEl0ZXJhdGVlLCB0aGlzLmJsb2NrKSBdKSlcblx0fSxcblxuXHRGdW4oKSB7XG5cdFx0Y29uc3Qgb2xkSW5HZW5lcmF0b3IgPSBpc0luR2VuZXJhdG9yXG5cdFx0aXNJbkdlbmVyYXRvciA9IHRoaXMuaXNHZW5lcmF0b3JcblxuXHRcdC8vIFRPRE86RVM2IHVzZSBgLi4uYGZcblx0XHRjb25zdCBuQXJncyA9IExpdGVyYWwodGhpcy5hcmdzLmxlbmd0aClcblx0XHRjb25zdCBvcERlY2xhcmVSZXN0ID0gb3BNYXAodGhpcy5vcFJlc3RBcmcsIHJlc3QgPT5cblx0XHRcdGRlY2xhcmUocmVzdCwgQ2FsbEV4cHJlc3Npb24oQXJyYXlTbGljZUNhbGwsIFtJZEFyZ3VtZW50cywgbkFyZ3NdKSkpXG5cdFx0Y29uc3QgYXJnQ2hlY2tzID0gb3BJZihjb250ZXh0Lm9wdHMuaW5jbHVkZUNoZWNrcygpLCAoKSA9PlxuXHRcdFx0ZmxhdE9wTWFwKHRoaXMuYXJncywgb3BUeXBlQ2hlY2tGb3JMb2NhbERlY2xhcmUpKVxuXG5cdFx0Y29uc3QgX2luID0gb3BNYXAodGhpcy5vcEluLCB0MClcblxuXHRcdGNvbnN0IG9wRGVjbGFyZVRoaXMgPSBvcElmKCFpc0luQ29uc3RydWN0b3IsICgpID0+IG9wTWFwKHRoaXMub3BEZWNsYXJlVGhpcywgKCkgPT5cblx0XHRcdFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgWyBWYXJpYWJsZURlY2xhcmF0b3IoSWRMZXhpY2FsVGhpcywgVGhpc0V4cHJlc3Npb24oKSkgXSkpKVxuXG5cdFx0Y29uc3QgbGVhZCA9IGNhdChvcERlY2xhcmVUaGlzLCBvcERlY2xhcmVSZXN0LCBhcmdDaGVja3MsIF9pbilcblxuXHRcdGNvbnN0IF9vdXQgPSBvcE1hcCh0aGlzLm9wT3V0LCB0MClcblx0XHRjb25zdCBib2R5ID0gdDModGhpcy5ibG9jaywgbGVhZCwgdGhpcy5vcERlY2xhcmVSZXMsIF9vdXQpXG5cdFx0Y29uc3QgYXJncyA9IHRoaXMuYXJncy5tYXAodDApXG5cdFx0aXNJbkdlbmVyYXRvciA9IG9sZEluR2VuZXJhdG9yXG5cdFx0Y29uc3QgaWQgPSBvcE1hcCh0aGlzLm9wTmFtZSwgaWRDYWNoZWQpXG5cblx0XHRjb25zdCBjYW5Vc2VBcnJvd0Z1bmN0aW9uID1cblx0XHRcdGlkID09PSBudWxsICYmXG5cdFx0XHR0aGlzLm9wRGVjbGFyZVRoaXMgPT09IG51bGwgJiZcblx0XHRcdG9wRGVjbGFyZVJlc3QgPT09IG51bGwgJiZcblx0XHRcdCF0aGlzLmlzR2VuZXJhdG9yXG5cdFx0cmV0dXJuIGNhblVzZUFycm93RnVuY3Rpb24gP1xuXHRcdFx0QXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oYXJncywgYm9keSkgOlxuXHRcdFx0RnVuY3Rpb25FeHByZXNzaW9uKGlkLCBhcmdzLCBib2R5LCB0aGlzLmlzR2VuZXJhdG9yKVxuXHR9LFxuXG5cdExhenkoKSB7IHJldHVybiBsYXp5V3JhcCh0MCh0aGlzLnZhbHVlKSkgfSxcblxuXHROdW1iZXJMaXRlcmFsKCkge1xuXHRcdC8vIE5lZ2F0aXZlIG51bWJlcnMgYXJlIG5vdCBwYXJ0IG9mIEVTIHNwZWMuXG5cdFx0Ly8gaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzUuMS8jc2VjLTcuOC4zXG5cdFx0Y29uc3QgbGl0ID0gTGl0ZXJhbChNYXRoLmFicyh0aGlzLnZhbHVlKSlcblx0XHRyZXR1cm4gaXNQb3NpdGl2ZSh0aGlzLnZhbHVlKSA/IGxpdCA6IFVuYXJ5RXhwcmVzc2lvbignLScsIGxpdClcblx0fSxcblxuXHRHbG9iYWxBY2Nlc3MoKSB7IHJldHVybiBJZGVudGlmaWVyKHRoaXMubmFtZSkgfSxcblxuXHRMb2NhbEFjY2VzcygpIHtcblx0XHRyZXR1cm4gdGhpcy5uYW1lID09PSAndGhpcycgP1xuXHRcdFx0KGlzSW5Db25zdHJ1Y3RvciA/IFRoaXNFeHByZXNzaW9uKCkgOiBJZExleGljYWxUaGlzKSA6XG5cdFx0XHRhY2Nlc3NMb2NhbERlY2xhcmUodmVyaWZ5UmVzdWx0cy5sb2NhbERlY2xhcmVGb3JBY2Nlc3ModGhpcykpXG5cdH0sXG5cblx0TG9jYWxEZWNsYXJlKCkgeyByZXR1cm4gSWRlbnRpZmllcihpZEZvckRlY2xhcmVDYWNoZWQodGhpcykubmFtZSkgfSxcblxuXHRMb2NhbE11dGF0ZSgpIHtcblx0XHRyZXR1cm4gYXNzaWdubWVudEV4cHJlc3Npb25QbGFpbihpZENhY2hlZCh0aGlzLm5hbWUpLCB0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRMb2dpYygpIHtcblx0XHRhc3NlcnQodGhpcy5raW5kID09PSBMX0FuZCB8fCB0aGlzLmtpbmQgPT09IExfT3IpXG5cdFx0Y29uc3Qgb3AgPSB0aGlzLmtpbmQgPT09IExfQW5kID8gJyYmJyA6ICd8fCdcblx0XHRyZXR1cm4gdGFpbCh0aGlzLmFyZ3MpLnJlZHVjZSgoYSwgYikgPT4gTG9naWNhbEV4cHJlc3Npb24ob3AsIGEsIHQwKGIpKSwgdDAodGhpcy5hcmdzWzBdKSlcblx0fSxcblxuXHRNYXBFbnRyeSgpIHsgcmV0dXJuIG1zQXNzb2MoSWRCdWlsdCwgdDAodGhpcy5rZXkpLCB0MCh0aGlzLnZhbCkpIH0sXG5cblx0TWVtYmVyKCkgeyByZXR1cm4gbWVtYmVyKHQwKHRoaXMub2JqZWN0KSwgdGhpcy5uYW1lKSB9LFxuXG5cdE1lbWJlclNldCgpIHtcblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBNU19NdXRhdGU6XG5cdFx0XHRcdHJldHVybiBhc3NpZ25tZW50RXhwcmVzc2lvblBsYWluKG1lbWJlcih0MCh0aGlzLm9iamVjdCksIHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHRcdFx0Y2FzZSBNU19OZXc6XG5cdFx0XHRcdHJldHVybiBtc05ld1Byb3BlcnR5KHQwKHRoaXMub2JqZWN0KSwgTGl0ZXJhbCh0aGlzLm5hbWUpLCB0MCh0aGlzLnZhbHVlKSlcblx0XHRcdGNhc2UgTVNfTmV3TXV0YWJsZTpcblx0XHRcdFx0cmV0dXJuIG1zTmV3TXV0YWJsZVByb3BlcnR5KHQwKHRoaXMub2JqZWN0KSwgTGl0ZXJhbCh0aGlzLm5hbWUpLCB0MCh0aGlzLnZhbHVlKSlcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcigpXG5cdFx0fVxuXHR9LFxuXG5cdE1vZHVsZSgpIHtcblx0XHRjb25zdCBib2R5ID0gY2F0KFxuXHRcdFx0dExpbmVzKHRoaXMubGluZXMpLFxuXHRcdFx0b3BNYXAodGhpcy5vcERlZmF1bHRFeHBvcnQsIF8gPT4gYXNzaWdubWVudEV4cHJlc3Npb25QbGFpbihFeHBvcnRzRGVmYXVsdCwgdDAoXykpKSlcblx0XHRyZXR1cm4gUHJvZ3JhbShjYXQoXG5cdFx0XHRvcElmKGNvbnRleHQub3B0cy5pbmNsdWRlVXNlU3RyaWN0KCksICgpID0+IFVzZVN0cmljdCksXG5cdFx0XHRvcElmKGNvbnRleHQub3B0cy5pbmNsdWRlQW1kZWZpbmUoKSwgKCkgPT4gQW1kZWZpbmVIZWFkZXIpLFxuXHRcdFx0dG9TdGF0ZW1lbnQoYW1kV3JhcE1vZHVsZSh0aGlzLmRvVXNlcywgdGhpcy51c2VzLmNvbmNhdCh0aGlzLmRlYnVnVXNlcyksIGJvZHkpKSkpXG5cdH0sXG5cblx0TmV3KCkge1xuXHRcdGNvbnN0IGFueVNwbGF0ID0gdGhpcy5hcmdzLnNvbWUoXyA9PiBfIGluc3RhbmNlb2YgU3BsYXQpXG5cdFx0Y29udGV4dC5jaGVjayghYW55U3BsYXQsIHRoaXMubG9jLCAnVE9ETzogU3BsYXQgcGFyYW1zIGZvciBuZXcnKVxuXHRcdHJldHVybiBOZXdFeHByZXNzaW9uKHQwKHRoaXMudHlwZSksIHRoaXMuYXJncy5tYXAodDApKVxuXHR9LFxuXG5cdE5vdCgpIHsgcmV0dXJuIFVuYXJ5RXhwcmVzc2lvbignIScsIHQwKHRoaXMuYXJnKSkgfSxcblxuXHRPYmpFbnRyeSgpIHtcblx0XHRyZXR1cm4gKHRoaXMuYXNzaWduIGluc3RhbmNlb2YgQXNzaWduU2luZ2xlICYmICF0aGlzLmFzc2lnbi5hc3NpZ25lZS5pc0xhenkoKSkgP1xuXHRcdFx0dDEodGhpcy5hc3NpZ24sIHZhbCA9PlxuXHRcdFx0XHRhc3NpZ25tZW50RXhwcmVzc2lvblBsYWluKG1lbWJlcihJZEJ1aWx0LCB0aGlzLmFzc2lnbi5hc3NpZ25lZS5uYW1lKSwgdmFsKSkgOlxuXHRcdFx0Y2F0KFxuXHRcdFx0XHR0MCh0aGlzLmFzc2lnbiksXG5cdFx0XHRcdHRoaXMuYXNzaWduLmFsbEFzc2lnbmVlcygpLm1hcChfID0+XG5cdFx0XHRcdFx0bXNTZXRMYXp5KElkQnVpbHQsIExpdGVyYWwoXy5uYW1lKSwgaWRGb3JEZWNsYXJlQ2FjaGVkKF8pKSkpXG5cdH0sXG5cblx0T2JqU2ltcGxlKCkge1xuXHRcdHJldHVybiBPYmplY3RFeHByZXNzaW9uKHRoaXMucGFpcnMubWFwKHBhaXIgPT5cblx0XHRcdHByb3BlcnR5KCdpbml0JywgcHJvcGVydHlJZE9yTGl0ZXJhbENhY2hlZChwYWlyLmtleSksIHQwKHBhaXIudmFsdWUpKSkpXG5cdH0sXG5cblx0UXVvdGUoKSB7XG5cdFx0aWYgKHRoaXMucGFydHMubGVuZ3RoID09PSAwKVxuXHRcdFx0cmV0dXJuIExpdEVtcHR5U3RyaW5nXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBxdWFzaXMgPSBbIF0sIGV4cHJlc3Npb25zID0gWyBdXG5cblx0XHRcdC8vIFRlbXBsYXRlTGl0ZXJhbCBtdXN0IHN0YXJ0IHdpdGggYSBUZW1wbGF0ZUVsZW1lbnRcblx0XHRcdGlmICh0eXBlb2YgdGhpcy5wYXJ0c1swXSAhPT0gJ3N0cmluZycpXG5cdFx0XHRcdHF1YXNpcy5wdXNoKEVtcHR5VGVtcGxhdGVFbGVtZW50KVxuXG5cdFx0XHRmb3IgKGxldCBwYXJ0IG9mIHRoaXMucGFydHMpXG5cdFx0XHRcdGlmICh0eXBlb2YgcGFydCA9PT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0cXVhc2lzLnB1c2godGVtcGxhdGVFbGVtZW50Rm9yU3RyaW5nKHBhcnQpKVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHQvLyBcInsxfXsxfVwiIG5lZWRzIGFuIGVtcHR5IHF1YXNpIGluIHRoZSBtaWRkbGUgKGFuZCBvbiB0aGUgZW5kcylcblx0XHRcdFx0XHRpZiAocXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoKVxuXHRcdFx0XHRcdFx0cXVhc2lzLnB1c2goRW1wdHlUZW1wbGF0ZUVsZW1lbnQpXG5cdFx0XHRcdFx0ZXhwcmVzc2lvbnMucHVzaCh0MChwYXJ0KSlcblx0XHRcdFx0fVxuXG5cdFx0XHQvLyBUZW1wbGF0ZUxpdGVyYWwgbXVzdCBlbmQgd2l0aCBhIFRlbXBsYXRlRWxlbWVudCwgc28gb25lIG1vcmUgcXVhc2kgdGhhbiBleHByZXNzaW9uLlxuXHRcdFx0aWYgKHF1YXNpcy5sZW5ndGggPT09IGV4cHJlc3Npb25zLmxlbmd0aClcblx0XHRcdFx0cXVhc2lzLnB1c2goRW1wdHlUZW1wbGF0ZUVsZW1lbnQpXG5cblx0XHRcdHJldHVybiBUZW1wbGF0ZUxpdGVyYWwocXVhc2lzLCBleHByZXNzaW9ucylcblx0XHR9XG5cdH0sXG5cblx0UXVvdGVUZW1wbGF0ZSgpIHtcblx0XHRyZXR1cm4gVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uKHQwKHRoaXMudGFnKSwgdDAodGhpcy5xdW90ZSkpXG5cdH0sXG5cblx0U3BlY2lhbERvKCkge1xuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIFNEX0RlYnVnZ2VyOiByZXR1cm4gRGVidWdnZXJTdGF0ZW1lbnQoKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHR9XG5cdH0sXG5cblx0U3BlY2lhbFZhbCgpIHtcblx0XHQvLyBNYWtlIG5ldyBvYmplY3RzIGJlY2F1c2Ugd2Ugd2lsbCBhc3NpZ24gYGxvY2AgdG8gdGhlbS5cblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTVl9Db250YWluczogcmV0dXJuIG1lbWJlcihJZE1zLCAnY29udGFpbnMnKVxuXHRcdFx0Y2FzZSBTVl9GYWxzZTogcmV0dXJuIExpdGVyYWwoZmFsc2UpXG5cdFx0XHRjYXNlIFNWX051bGw6IHJldHVybiBMaXRlcmFsKG51bGwpXG5cdFx0XHRjYXNlIFNWX1N1YjogcmV0dXJuIG1lbWJlcihJZE1zLCAnc3ViJylcblx0XHRcdGNhc2UgU1ZfU3VwZXI6IHJldHVybiBJZGVudGlmaWVyKCdzdXBlcicpXG5cdFx0XHRjYXNlIFNWX1RoaXNNb2R1bGVEaXJlY3Rvcnk6IHJldHVybiBJZGVudGlmaWVyKCdfX2Rpcm5hbWUnKVxuXHRcdFx0Y2FzZSBTVl9UcnVlOiByZXR1cm4gTGl0ZXJhbCh0cnVlKVxuXHRcdFx0Y2FzZSBTVl9VbmRlZmluZWQ6IHJldHVybiBVbmFyeUV4cHJlc3Npb24oJ3ZvaWQnLCBMaXRaZXJvKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHR9XG5cdH0sXG5cblx0U3BsYXQoKSB7XG5cdFx0cmV0dXJuIFNwcmVhZEVsZW1lbnQodDAodGhpcy5zcGxhdHRlZCkpXG5cdH0sXG5cblx0U3dpdGNoRG8oKSB7IHJldHVybiB0cmFuc3BpbGVTd2l0Y2godGhpcykgfSxcblx0U3dpdGNoVmFsKCkgeyByZXR1cm4gYmxvY2tXcmFwKEJsb2NrU3RhdGVtZW50KFsgdHJhbnNwaWxlU3dpdGNoKHRoaXMpIF0pKSB9LFxuXHRTd2l0Y2hEb1BhcnQ6IHN3aXRjaFBhcnQsXG5cdFN3aXRjaFZhbFBhcnQ6IHN3aXRjaFBhcnQsXG5cblx0VGhyb3coKSB7XG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wVGhyb3duLFxuXHRcdFx0XyA9PiBUaHJvd1N0YXRlbWVudChtc0Vycm9yKHQwKF8pKSksXG5cdFx0XHQoKSA9PiBUaHJvd1N0YXRlbWVudChtc0Vycm9yKExpdFN0clRocm93KSkpXG5cdH0sXG5cblx0V2l0aCgpIHtcblx0XHRjb25zdCBpZERlY2xhcmUgPSBpZEZvckRlY2xhcmVDYWNoZWQodGhpcy5kZWNsYXJlKVxuXHRcdGNvbnN0IGJsb2NrID0gdDModGhpcy5ibG9jaywgbnVsbCwgbnVsbCwgUmV0dXJuU3RhdGVtZW50KGlkRGVjbGFyZSkpXG5cdFx0Y29uc3QgZnVuID0gaXNJbkdlbmVyYXRvciA/XG5cdFx0XHRGdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgWyBpZERlY2xhcmUgXSwgYmxvY2ssIHRydWUpIDpcblx0XHRcdEFycm93RnVuY3Rpb25FeHByZXNzaW9uKFsgaWREZWNsYXJlIF0sIGJsb2NrKVxuXHRcdGNvbnN0IGNhbGwgPSBDYWxsRXhwcmVzc2lvbihmdW4sIFsgdDAodGhpcy52YWx1ZSkgXSlcblx0XHRyZXR1cm4gaXNJbkdlbmVyYXRvciA/IHlpZWxkRXhwcmVzc2lvbkRlbGVnYXRlKGNhbGwpIDogY2FsbFxuXHR9LFxuXG5cdFlpZWxkKCkgeyByZXR1cm4geWllbGRFeHByZXNzaW9uTm9EZWxlZ2F0ZShvcE1hcCh0aGlzLm9wWWllbGRlZCwgdDApKSB9LFxuXG5cdFlpZWxkVG8oKSB7IHJldHVybiB5aWVsZEV4cHJlc3Npb25EZWxlZ2F0ZSh0MCh0aGlzLnlpZWxkZWRUbykpIH1cbn0pXG5cbmZ1bmN0aW9uIGNhc2VQYXJ0KGFsdGVybmF0ZSkge1xuXHRpZiAodGhpcy50ZXN0IGluc3RhbmNlb2YgUGF0dGVybikge1xuXHRcdGNvbnN0IHsgdHlwZSwgcGF0dGVybmVkLCBsb2NhbHMgfSA9IHRoaXMudGVzdFxuXHRcdGNvbnN0IGRlY2wgPSBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRcdFZhcmlhYmxlRGVjbGFyYXRvcihJZEV4dHJhY3QsIG1zRXh0cmFjdCh0MCh0eXBlKSwgdDAocGF0dGVybmVkKSkpIF0pXG5cdFx0Y29uc3QgdGVzdCA9IEJpbmFyeUV4cHJlc3Npb24oJyE9PScsIElkRXh0cmFjdCwgTGl0TnVsbClcblx0XHRjb25zdCBleHRyYWN0ID0gVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBsb2NhbHMubWFwKChfLCBpZHgpID0+XG5cdFx0XHRWYXJpYWJsZURlY2xhcmF0b3IoaWRGb3JEZWNsYXJlQ2FjaGVkKF8pLCBtZW1iZXJFeHByZXNzaW9uKElkRXh0cmFjdCwgTGl0ZXJhbChpZHgpKSkpKVxuXHRcdGNvbnN0IHJlcyA9IHQxKHRoaXMucmVzdWx0LCBleHRyYWN0KVxuXHRcdHJldHVybiBCbG9ja1N0YXRlbWVudChbIGRlY2wsIElmU3RhdGVtZW50KHRlc3QsIHJlcywgYWx0ZXJuYXRlKSBdKVxuXHR9IGVsc2Vcblx0XHQvLyBhbHRlcm5hdGUgd3JpdHRlbiB0byBieSBgY2FzZUJvZHlgLlxuXHRcdHJldHVybiBJZlN0YXRlbWVudCh0MCh0aGlzLnRlc3QpLCB0MCh0aGlzLnJlc3VsdCksIGFsdGVybmF0ZSlcbn1cblxuZnVuY3Rpb24gc3dpdGNoUGFydCgpIHtcblx0Y29uc3Qgb3BPdXQgPSBvcElmKHRoaXMgaW5zdGFuY2VvZiBTd2l0Y2hEb1BhcnQsIEJyZWFrU3RhdGVtZW50KVxuXHRjb25zdCBibG9jayA9IHQzKHRoaXMucmVzdWx0LCBudWxsLCBudWxsLCBvcE91dClcblx0Lypcblx0V2UgY291bGQganVzdCBwYXNzIGJsb2NrLmJvZHkgZm9yIHRoZSBzd2l0Y2ggbGluZXMsIGJ1dCBpbnN0ZWFkXG5cdGVuY2xvc2UgdGhlIGJvZHkgb2YgdGhlIHN3aXRjaCBjYXNlIGluIGN1cmx5IGJyYWNlcyB0byBlbnN1cmUgYSBuZXcgc2NvcGUuXG5cdFRoYXQgd2F5IHRoaXMgY29kZSB3b3Jrczpcblx0XHRzd2l0Y2ggKDApIHtcblx0XHRcdGNhc2UgMDoge1xuXHRcdFx0XHRjb25zdCBhID0gMFxuXHRcdFx0XHRyZXR1cm4gYVxuXHRcdFx0fVxuXHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHQvLyBXaXRob3V0IGN1cmx5IGJyYWNlcyB0aGlzIHdvdWxkIGNvbmZsaWN0IHdpdGggdGhlIG90aGVyIGBhYC5cblx0XHRcdFx0Y29uc3QgYSA9IDFcblx0XHRcdFx0YVxuXHRcdFx0fVxuXHRcdH1cblx0Ki9cblx0cmV0dXJuIFN3aXRjaENhc2UodDAodGhpcy52YWx1ZSksIFsgYmxvY2sgXSlcbn1cblxuLy8gRnVuY3Rpb25zIHNwZWNpZmljIHRvIGNlcnRhaW4gZXhwcmVzc2lvbnMuXG5jb25zdFxuXHQvLyBXcmFwcyBhIGJsb2NrICh3aXRoIGByZXR1cm5gIHN0YXRlbWVudHMgaW4gaXQpIGluIGFuIElJRkUuXG5cdGJsb2NrV3JhcCA9IGJsb2NrID0+IHtcblx0XHRjb25zdCBpbnZva2UgPSBjYWxsRXhwcmVzc2lvblRodW5rKGZ1bmN0aW9uRXhwcmVzc2lvblRodW5rKGJsb2NrLCBpc0luR2VuZXJhdG9yKSlcblx0XHRyZXR1cm4gaXNJbkdlbmVyYXRvciA/IHlpZWxkRXhwcmVzc2lvbkRlbGVnYXRlKGludm9rZSkgOiBpbnZva2Vcblx0fSxcblxuXHRjYXNlQm9keSA9IChwYXJ0cywgb3BFbHNlKSA9PiB7XG5cdFx0bGV0IGFjYyA9IGlmRWxzZShvcEVsc2UsIHQwLCAoKSA9PiBUaHJvd05vQ2FzZU1hdGNoKVxuXHRcdGZvciAobGV0IGkgPSBwYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGkgPSBpIC0gMSlcblx0XHRcdGFjYyA9IHQxKHBhcnRzW2ldLCBhY2MpXG5cdFx0cmV0dXJuIGFjY1xuXHR9LFxuXG5cdGZvckxvb3AgPSAob3BJdGVyYXRlZSwgYmxvY2spID0+XG5cdFx0aWZFbHNlKG9wSXRlcmF0ZWUsXG5cdFx0XHQoeyBlbGVtZW50LCBiYWcgfSkgPT4ge1xuXHRcdFx0XHRjb25zdCBkZWNsYXJlID0gVmFyaWFibGVEZWNsYXJhdGlvbignbGV0JywgWyBWYXJpYWJsZURlY2xhcmF0b3IodDAoZWxlbWVudCkpIF0pXG5cdFx0XHRcdHJldHVybiBGb3JPZlN0YXRlbWVudChkZWNsYXJlLCB0MChiYWcpLCB0MChibG9jaykpXG5cdFx0XHR9LFxuXHRcdFx0KCkgPT4gZm9yU3RhdGVtZW50SW5maW5pdGUodDAoYmxvY2spKSksXG5cblx0Y29uc3RydWN0b3JEZWZpbml0aW9uID0gZnVuID0+IHtcblx0XHRpc0luQ29uc3RydWN0b3IgPSB0cnVlXG5cdFx0Y29uc3QgcmVzID1cblx0XHRcdE1ldGhvZERlZmluaXRpb24oSWRlbnRpZmllcignY29uc3RydWN0b3InKSwgdDAoZnVuKSwgJ2NvbnN0cnVjdG9yJywgZmFsc2UsIGZhbHNlKVxuXHRcdGlzSW5Db25zdHJ1Y3RvciA9IGZhbHNlXG5cdFx0cmV0dXJuIHJlc1xuXHR9LFxuXHRtZXRob2REZWZpbml0aW9uID0gaXNTdGF0aWMgPT4gbWV0aG9kID0+IHtcblx0XHRpZiAobWV0aG9kIGluc3RhbmNlb2YgRnVuKSB7XG5cdFx0XHRhc3NlcnQobWV0aG9kLm9wTmFtZSAhPT0gbnVsbClcblx0XHRcdGNvbnN0IGtleSA9IHByb3BlcnR5SWRPckxpdGVyYWxDYWNoZWQobWV0aG9kLm9wTmFtZSlcblx0XHRcdGNvbnN0IHZhbHVlID0gdDAobWV0aG9kKVxuXHRcdFx0dmFsdWUuaWQgPSBudWxsXG5cdFx0XHRjb25zdCBjb21wdXRlZCA9IGZhbHNlXG5cdFx0XHRyZXR1cm4gTWV0aG9kRGVmaW5pdGlvbihrZXksIHZhbHVlLCAnbWV0aG9kJywgaXNTdGF0aWMsIGNvbXB1dGVkKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRhc3NlcnQobWV0aG9kIGluc3RhbmNlb2YgTWV0aG9kSW1wbClcblx0XHRcdGNvbnN0IGZ1biA9IG1ldGhvZC5mdW5cblx0XHRcdGFzc2VydChmdW4ub3BOYW1lID09PSBudWxsKVxuXHRcdFx0Y29uc3Qga2V5ID0gbXNTeW1ib2wodDAobWV0aG9kLnN5bWJvbCkpXG5cdFx0XHRjb25zdCB2YWx1ZSA9IHQwKGZ1bilcblx0XHRcdC8vIFRoaXMgaXMgaGFuZGxlZCBieSBga2V5YC5cblx0XHRcdHZhbHVlLmlkID0gbnVsbFxuXHRcdFx0Ly8gVE9ETzogZ2V0L3NldCFcblx0XHRcdGNvbnN0IGNvbXB1dGVkID0gdHJ1ZVxuXHRcdFx0cmV0dXJuIE1ldGhvZERlZmluaXRpb24oa2V5LCB2YWx1ZSwgJ21ldGhvZCcsIGlzU3RhdGljLCBjb21wdXRlZClcblx0XHR9XG5cdH0sXG5cblx0dHJhbnNwaWxlQmxvY2sgPSAocmV0dXJuZWQsIGxpbmVzLCBsZWFkLCBvcERlY2xhcmVSZXMsIG9wT3V0KSA9PiB7XG5cdFx0Ly8gVE9ETzpFUzYgT3B0aW9uYWwgYXJndW1lbnRzXG5cdFx0aWYgKGxlYWQgPT09IHVuZGVmaW5lZCkgbGVhZCA9IG51bGxcblx0XHRpZiAob3BEZWNsYXJlUmVzID09PSB1bmRlZmluZWQpIG9wRGVjbGFyZVJlcyA9IG51bGxcblx0XHRpZiAob3BPdXQgPT09IHVuZGVmaW5lZCkgb3BPdXQgPSBudWxsXG5cdFx0Y29uc3QgZmluID0gaWZFbHNlKG9wRGVjbGFyZVJlcyxcblx0XHRcdHJkID0+IHtcblx0XHRcdFx0Y29uc3QgcmV0ID0gbWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHJldHVybmVkLCByZC5vcFR5cGUsIHJkLm5hbWUpXG5cdFx0XHRcdHJldHVybiBpZkVsc2Uob3BPdXQsXG5cdFx0XHRcdFx0XyA9PiBjYXQoZGVjbGFyZShyZCwgcmV0KSwgXywgUmV0dXJuUmVzKSxcblx0XHRcdFx0XHQoKSA9PiBSZXR1cm5TdGF0ZW1lbnQocmV0KSlcblx0XHRcdH0sXG5cdFx0XHQoKSA9PiBjYXQob3BPdXQsIFJldHVyblN0YXRlbWVudChyZXR1cm5lZCkpKVxuXHRcdHJldHVybiBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgbGluZXMsIGZpbikpXG5cdH0sXG5cblx0dHJhbnNwaWxlRXhjZXB0ID0gZXhjZXB0ID0+XG5cdFx0VHJ5U3RhdGVtZW50KFxuXHRcdFx0dDAoZXhjZXB0Ll90cnkpLFxuXHRcdFx0b3BNYXAoZXhjZXB0Ll9jYXRjaCwgdDApLFxuXHRcdFx0b3BNYXAoZXhjZXB0Ll9maW5hbGx5LCB0MCkpLFxuXG5cdHRyYW5zcGlsZVN3aXRjaCA9IF8gPT4ge1xuXHRcdGNvbnN0IHBhcnRzID0gXy5wYXJ0cy5tYXAodDApXG5cblx0XHRwYXJ0cy5wdXNoKGlmRWxzZShfLm9wRWxzZSxcblx0XHRcdF8gPT4gU3dpdGNoQ2FzZSh1bmRlZmluZWQsIHQwKF8pLmJvZHkpLFxuXHRcdFx0KCkgPT4gU3dpdGNoQ2FzZU5vTWF0Y2gpKVxuXG5cdFx0cmV0dXJuIFN3aXRjaFN0YXRlbWVudCh0MChfLnN3aXRjaGVkKSwgcGFydHMpXG5cdH1cblxuLy8gTW9kdWxlIGhlbHBlcnNcbmNvbnN0XG5cdGFtZFdyYXBNb2R1bGUgPSAoZG9Vc2VzLCBvdGhlclVzZXMsIGJvZHkpID0+IHtcblx0XHRjb25zdCBhbGxVc2VzID0gZG9Vc2VzLmNvbmNhdChvdGhlclVzZXMpXG5cdFx0Y29uc3QgdXNlUGF0aHMgPSBBcnJheUV4cHJlc3Npb24oY2F0KFxuXHRcdFx0TGl0U3RyRXhwb3J0cyxcblx0XHRcdGFsbFVzZXMubWFwKF8gPT4gTGl0ZXJhbChtYW5nbGVQYXRoKF8ucGF0aCkpKSkpXG5cdFx0Y29uc3QgdXNlSWRlbnRpZmllcnMgPSBhbGxVc2VzLm1hcCgoXywgaSkgPT4gaWRDYWNoZWQoYCR7cGF0aEJhc2VOYW1lKF8ucGF0aCl9XyR7aX1gKSlcblx0XHRjb25zdCB1c2VBcmdzID0gY2F0KElkRXhwb3J0cywgdXNlSWRlbnRpZmllcnMpXG5cdFx0Y29uc3QgdXNlRG9zID0gZG9Vc2VzLm1hcCgodXNlLCBpKSA9PlxuXHRcdFx0bG9jKEV4cHJlc3Npb25TdGF0ZW1lbnQobXNHZXRNb2R1bGUodXNlSWRlbnRpZmllcnNbaV0pKSwgdXNlLmxvYykpXG5cdFx0Y29uc3Qgb3BVc2VEZWNsYXJlID0gb3BJZighaXNFbXB0eShvdGhlclVzZXMpLFxuXHRcdFx0KCkgPT4gVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBmbGF0TWFwKG90aGVyVXNlcywgKHVzZSwgaSkgPT5cblx0XHRcdFx0dXNlRGVjbGFyYXRvcnModXNlLCB1c2VJZGVudGlmaWVyc1tpICsgZG9Vc2VzLmxlbmd0aF0pKSkpXG5cdFx0Y29uc3QgZnVsbEJvZHkgPSBCbG9ja1N0YXRlbWVudChjYXQodXNlRG9zLCBvcFVzZURlY2xhcmUsIGJvZHksIFJldHVybkV4cG9ydHMpKVxuXHRcdGNvbnN0IGxhenlCb2R5ID1cblx0XHRcdGNvbnRleHQub3B0cy5sYXp5TW9kdWxlKCkgP1xuXHRcdFx0XHRCbG9ja1N0YXRlbWVudChbIEV4cHJlc3Npb25TdGF0ZW1lbnQoXG5cdFx0XHRcdFx0YXNzaWdubWVudEV4cHJlc3Npb25QbGFpbihFeHBvcnRzR2V0LFxuXHRcdFx0XHRcdFx0bXNMYXp5KGZ1bmN0aW9uRXhwcmVzc2lvblRodW5rKGZ1bGxCb2R5KSkpKSBdKSA6XG5cdFx0XHRcdGZ1bGxCb2R5XG5cdFx0cmV0dXJuIENhbGxFeHByZXNzaW9uKElkRGVmaW5lLCBbIHVzZVBhdGhzLCBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbih1c2VBcmdzLCBsYXp5Qm9keSkgXSlcblx0fSxcblxuXHRwYXRoQmFzZU5hbWUgPSBwYXRoID0+XG5cdFx0cGF0aC5zdWJzdHIocGF0aC5sYXN0SW5kZXhPZignLycpICsgMSksXG5cblx0dXNlRGVjbGFyYXRvcnMgPSAodXNlLCBtb2R1bGVJZGVudGlmaWVyKSA9PiB7XG5cdFx0Ly8gVE9ETzogQ291bGQgYmUgbmVhdGVyIGFib3V0IHRoaXNcblx0XHRjb25zdCBpc0xhenkgPSAoaXNFbXB0eSh1c2UudXNlZCkgPyB1c2Uub3BVc2VEZWZhdWx0IDogdXNlLnVzZWRbMF0pLmlzTGF6eSgpXG5cdFx0Y29uc3QgdmFsdWUgPSAoaXNMYXp5ID8gbXNMYXp5R2V0TW9kdWxlIDogbXNHZXRNb2R1bGUpKG1vZHVsZUlkZW50aWZpZXIpXG5cblx0XHRjb25zdCB1c2VkRGVmYXVsdCA9IG9wTWFwKHVzZS5vcFVzZURlZmF1bHQsIGRlZiA9PiB7XG5cdFx0XHRjb25zdCBkZWZleHAgPSBtc0dldERlZmF1bHRFeHBvcnQobW9kdWxlSWRlbnRpZmllcilcblx0XHRcdGNvbnN0IHZhbCA9IGlzTGF6eSA/IGxhenlXcmFwKGRlZmV4cCkgOiBkZWZleHBcblx0XHRcdHJldHVybiBsb2MoVmFyaWFibGVEZWNsYXJhdG9yKGlkRm9yRGVjbGFyZUNhY2hlZChkZWYpLCB2YWwpLCBkZWYubG9jKVxuXHRcdH0pXG5cblx0XHRjb25zdCB1c2VkRGVzdHJ1Y3QgPSBpc0VtcHR5KHVzZS51c2VkKSA/IG51bGwgOlxuXHRcdFx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnModXNlLnVzZWQsIGlzTGF6eSwgdmFsdWUsIHRydWUsIGZhbHNlKVxuXG5cdFx0cmV0dXJuIGNhdCh1c2VkRGVmYXVsdCwgdXNlZERlc3RydWN0KVxuXHR9XG5cbi8vIEdlbmVyYWwgdXRpbHMuIE5vdCBpbiB1dGlsLmpzIGJlY2F1c2UgdGhlc2UgY2xvc2Ugb3ZlciBjb250ZXh0LlxuY29uc3Rcblx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMgPSAoYXNzaWduZWVzLCBpc0xhenksIHZhbHVlLCBpc01vZHVsZSwgaXNFeHBvcnQpID0+IHtcblx0XHRjb25zdCBkZXN0cnVjdHVyZWROYW1lID0gYF8kJHthc3NpZ25lZXNbMF0ubG9jLnN0YXJ0LmxpbmV9YFxuXHRcdGNvbnN0IGlkRGVzdHJ1Y3R1cmVkID0gSWRlbnRpZmllcihkZXN0cnVjdHVyZWROYW1lKVxuXHRcdGNvbnN0IGRlY2xhcmF0b3JzID0gYXNzaWduZWVzLm1hcChhc3NpZ25lZSA9PiB7XG5cdFx0XHQvLyBUT0RPOiBEb24ndCBjb21waWxlIGl0IGlmIGl0J3MgbmV2ZXIgYWNjZXNzZWRcblx0XHRcdGNvbnN0IGdldCA9IGdldE1lbWJlcihpZERlc3RydWN0dXJlZCwgYXNzaWduZWUubmFtZSwgaXNMYXp5LCBpc01vZHVsZSlcblx0XHRcdHJldHVybiBtYWtlRGVjbGFyYXRvcihhc3NpZ25lZSwgZ2V0LCBpc0xhenksIGlzRXhwb3J0KVxuXHRcdH0pXG5cdFx0Ly8gR2V0dGluZyBsYXp5IG1vZHVsZSBpcyBkb25lIGJ5IG1zLmxhenlHZXRNb2R1bGUuXG5cdFx0Y29uc3QgdmFsID0gKGlzTGF6eSAmJiAhaXNNb2R1bGUpID8gbGF6eVdyYXAodmFsdWUpIDogdmFsdWVcblx0XHRyZXR1cm4gdW5zaGlmdChWYXJpYWJsZURlY2xhcmF0b3IoaWREZXN0cnVjdHVyZWQsIHZhbCksIGRlY2xhcmF0b3JzKVxuXHR9LFxuXG5cdG1ha2VEZWNsYXJhdG9yID0gKGFzc2lnbmVlLCB2YWx1ZSwgdmFsdWVJc0FscmVhZHlMYXp5LCBpc0V4cG9ydCkgPT4ge1xuXHRcdGNvbnN0IHsgbG9jLCBuYW1lLCBvcFR5cGUgfSA9IGFzc2lnbmVlXG5cdFx0Y29uc3QgaXNMYXp5ID0gYXNzaWduZWUuaXNMYXp5KClcblx0XHQvLyBUT0RPOiBhc3NlcnQoYXNzaWduZWUub3BUeXBlID09PSBudWxsKVxuXHRcdC8vIG9yIFRPRE86IEFsbG93IHR5cGUgY2hlY2sgb24gbGF6eSB2YWx1ZT9cblx0XHR2YWx1ZSA9IGlzTGF6eSA/IHZhbHVlIDogbWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHZhbHVlLCBvcFR5cGUsIG5hbWUpXG5cdFx0aWYgKGlzRXhwb3J0KSB7XG5cdFx0XHQvLyBUT0RPOkVTNlxuXHRcdFx0Y29udGV4dC5jaGVjayghaXNMYXp5LCBsb2MsICdMYXp5IGV4cG9ydCBub3Qgc3VwcG9ydGVkLicpXG5cdFx0XHRyZXR1cm4gVmFyaWFibGVEZWNsYXJhdG9yKFxuXHRcdFx0XHRpZEZvckRlY2xhcmVDYWNoZWQoYXNzaWduZWUpLFxuXHRcdFx0XHRhc3NpZ25tZW50RXhwcmVzc2lvblBsYWluKG1lbWJlcihJZEV4cG9ydHMsIG5hbWUpLCB2YWx1ZSkpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHZhbCA9IGlzTGF6eSAmJiAhdmFsdWVJc0FscmVhZHlMYXp5ID8gbGF6eVdyYXAodmFsdWUpIDogdmFsdWVcblx0XHRcdGFzc2VydChpc0xhenkgfHwgIXZhbHVlSXNBbHJlYWR5TGF6eSlcblx0XHRcdHJldHVybiBWYXJpYWJsZURlY2xhcmF0b3IoaWRGb3JEZWNsYXJlQ2FjaGVkKGFzc2lnbmVlKSwgdmFsKVxuXHRcdH1cblx0fSxcblxuXHRtYXliZVdyYXBJbkNoZWNrQ29udGFpbnMgPSAoYXN0LCBvcFR5cGUsIG5hbWUpID0+XG5cdFx0KGNvbnRleHQub3B0cy5pbmNsdWRlQ2hlY2tzKCkgJiYgb3BUeXBlICE9PSBudWxsKSA/XG5cdFx0XHRtc0NoZWNrQ29udGFpbnModDAob3BUeXBlKSwgYXN0LCBMaXRlcmFsKG5hbWUpKSA6XG5cdFx0XHRhc3QsXG5cblx0Z2V0TWVtYmVyID0gKGFzdE9iamVjdCwgZ290TmFtZSwgaXNMYXp5LCBpc01vZHVsZSkgPT5cblx0XHRpc0xhenkgP1xuXHRcdG1zTGF6eUdldChhc3RPYmplY3QsIExpdGVyYWwoZ290TmFtZSkpIDpcblx0XHRpc01vZHVsZSAmJiBjb250ZXh0Lm9wdHMuaW5jbHVkZUNoZWNrcygpID9cblx0XHRtc0dldChhc3RPYmplY3QsIExpdGVyYWwoZ290TmFtZSkpIDpcblx0XHRtZW1iZXIoYXN0T2JqZWN0LCBnb3ROYW1lKVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
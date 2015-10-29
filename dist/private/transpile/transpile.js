(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/util', '../context', '../MsAst', '../util', './ast-constants', './ms-call', './transpileModule', './util'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports, require('esast/dist/ast'), require('esast/dist/util'), require('../context'), require('../MsAst'), require('../util'), require('./ast-constants'), require('./ms-call'), require('./transpileModule'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.context, global.MsAstTypes, global.util, global.astConstants, global.msCall, global.transpileModule, global.util);
		global.transpile = mod.exports;
	}
})(this, function (exports, _esastDistAst, _esastDistUtil, _context, _MsAst, _util, _astConstants, _msCall, _transpileModule, _util2) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports.default = transpile;
	exports.makeDestructureDeclarators = makeDestructureDeclarators;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

	var _transpileModule2 = _interopRequireDefault(_transpileModule);

	let verifyResults;
	exports.verifyResults = verifyResults;
	// isInGenerator means we are in an async or generator function.
	let isInGenerator, isInConstructor;
	let nextDestructuredId;

	/** Transform a {@link MsAst} into an esast. **/

	function transpile(moduleExpression, _verifyResults) {
		exports.verifyResults = verifyResults = _verifyResults;
		isInGenerator = false;
		isInConstructor = false;
		nextDestructuredId = 0;
		const res = (0, _util2.t0)(moduleExpression);
		// Release for garbage collection.
		exports.verifyResults = verifyResults = null;
		return res;
	}

	(0, _util.implementMany)(_MsAst, 'transpile', {
		Assert() {
			const failCond = () => {
				const cond = (0, _util2.t0)(this.condition);
				return this.negate ? cond : new _esastDistAst.UnaryExpression('!', cond);
			};

			return (0, _util.ifElse)(this.opThrown, _ => new _esastDistAst.IfStatement(failCond(), (0, _util2.doThrow)(_)), () => {
				if (this.condition instanceof _MsAst.Call) {
					const call = this.condition;
					const called = call.called;
					const args = call.args.map(_util2.t0);
					if (called instanceof _MsAst.Member) {
						const ass = this.negate ? _msCall.msAssertNotMember : _msCall.msAssertMember;
						return ass.apply(undefined, [(0, _util2.t0)(called.object), new _esastDistAst.Literal(called.name)].concat(_toConsumableArray(args)));
					} else {
						const ass = this.negate ? _msCall.msAssertNot : _msCall.msAssert;
						return ass.apply(undefined, [(0, _util2.t0)(called)].concat(_toConsumableArray(args)));
					}
				} else return new _esastDistAst.IfStatement(failCond(), _astConstants.ThrowAssertFail);
			});
		},

		AssignSingle(valWrap) {
			const val = valWrap === undefined ? (0, _util2.t0)(this.value) : valWrap((0, _util2.t0)(this.value));
			const declare = (0, _util2.makeDeclarator)(this.assignee, val, false);
			return new _esastDistAst.VariableDeclaration(this.assignee.isMutable() ? 'let' : 'const', [declare]);
		},
		// TODO:ES6 Just use native destructuring assign
		AssignDestructure() {
			return new _esastDistAst.VariableDeclaration(this.kind() === _MsAst.LocalDeclares.Mutable ? 'let' : 'const', makeDestructureDeclarators(this.assignees, this.kind() === _MsAst.LocalDeclares.Lazy, (0, _util2.t0)(this.value), false));
		},

		BagEntry() {
			return (0, _msCall.msAdd)(_astConstants.IdBuilt, (0, _util2.t0)(this.value));
		},

		BagEntryMany() {
			return (0, _msCall.msAddMany)(_astConstants.IdBuilt, (0, _util2.t0)(this.value));
		},

		BagSimple() {
			return new _esastDistAst.ArrayExpression(this.parts.map(_util2.t0));
		},

		BlockDo() {
			let lead = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
			let opReturnType = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			let follow = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

			(0, _util.assert)(opReturnType === null);
			return new _esastDistAst.BlockStatement((0, _util.cat)(lead, (0, _util2.tLines)(this.lines), follow));
		},

		BlockValThrow(lead, _opReturnType) {
			if (lead === undefined) lead = null;

			return new _esastDistAst.BlockStatement((0, _util.cat)(lead, (0, _util2.tLines)(this.lines), (0, _util2.t0)(this.throw)));
		},

		BlockValReturn() {
			let lead = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
			let opReturnType = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

			return transpileBlock((0, _util2.t0)(this.returned), (0, _util2.tLines)(this.lines), lead, opReturnType);
		},

		BlockBag() {
			let lead = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
			let opReturnType = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

			return transpileBlock(_astConstants.IdBuilt, (0, _util.cat)(_astConstants.DeclareBuiltBag, (0, _util2.tLines)(this.lines)), lead, opReturnType);
		},

		BlockObj() {
			let lead = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
			let opReturnType = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

			return transpileBlock(_astConstants.IdBuilt, (0, _util.cat)(_astConstants.DeclareBuiltObj, (0, _util2.tLines)(this.lines)), lead, opReturnType);
		},

		BlockMap() {
			let lead = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
			let opReturnType = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

			return transpileBlock(_astConstants.IdBuilt, (0, _util.cat)(_astConstants.DeclareBuiltMap, (0, _util2.tLines)(this.lines)), lead, opReturnType);
		},

		BlockWrap() {
			return blockWrap((0, _util2.t0)(this.block));
		},

		Break() {
			return new _esastDistAst.BreakStatement();
		},

		BreakWithVal() {
			return new _esastDistAst.ReturnStatement((0, _util2.t0)(this.value));
		},

		Call() {
			return new _esastDistAst.CallExpression((0, _util2.t0)(this.called), this.args.map(_util2.t0));
		},

		CaseDo() {
			const body = caseBody(this.parts, this.opElse);
			return (0, _util.ifElse)(this.opCased, _ => new _esastDistAst.BlockStatement([(0, _util2.t0)(_), body]), () => body);
		},
		CaseVal() {
			const body = caseBody(this.parts, this.opElse);
			const block = (0, _util.ifElse)(this.opCased, _ => [(0, _util2.t0)(_), body], () => [body]);
			return blockWrap(new _esastDistAst.BlockStatement(block));
		},
		CaseDoPart: casePart,
		CaseValPart: casePart,

		Class() {
			const methods = (0, _util.cat)(this.statics.map(_ => (0, _util2.t1)(_, true)), (0, _util.opMap)(this.opConstructor, _util2.t0), this.methods.map(_ => (0, _util2.t1)(_, false)));
			const opName = (0, _util.opMap)(verifyResults.opName(this), _esastDistUtil.identifier);
			const classExpr = new _esastDistAst.ClassExpression(opName, (0, _util.opMap)(this.opSuperClass, _util2.t0), new _esastDistAst.ClassBody(methods));

			return (0, _util.ifElse)(this.opDo, _ => (0, _util2.t1)(_, classExpr), () => classExpr);
		},

		ClassDo(classExpr) {
			const lead = new _esastDistAst.VariableDeclaration('const', [new _esastDistAst.VariableDeclarator((0, _util2.t0)(this.declareFocus), classExpr)]);
			const ret = new _esastDistAst.ReturnStatement((0, _util2.t0)(this.declareFocus));
			const block = (0, _util2.t3)(this.block, lead, null, ret);
			return blockWrap(block);
		},

		Cond() {
			return new _esastDistAst.ConditionalExpression((0, _util2.t0)(this.test), (0, _util2.t0)(this.ifTrue), (0, _util2.t0)(this.ifFalse));
		},

		ConditionalDo() {
			const test = (0, _util2.t0)(this.test);
			return new _esastDistAst.IfStatement(this.isUnless ? new _esastDistAst.UnaryExpression('!', test) : test, (0, _util2.t0)(this.result));
		},

		ConditionalVal() {
			const test = (0, _util2.t0)(this.test);
			const result = (0, _msCall.msSome)(blockWrap((0, _util2.t0)(this.result)));
			return this.isUnless ? new _esastDistAst.ConditionalExpression(test, _msCall.MsNone, result) : new _esastDistAst.ConditionalExpression(test, result, _msCall.MsNone);
		},

		Constructor() {
			isInConstructor = true;

			// If there is a `super!`, `this` will not be defined until then, so must wait until then.
			// Otherwise, do it at the beginning.
			const body = verifyResults.constructorToSuper.has(this) ? (0, _util2.t0)(this.fun) : (0, _util2.t1)(this.fun, constructorSetMembers(this));

			const res = _esastDistAst.MethodDefinition.constructor(body);
			isInConstructor = false;
			return res;
		},

		Catch() {
			return new _esastDistAst.CatchClause((0, _util2.t0)(this.caught), (0, _util2.t0)(this.block));
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

		// leadStatements comes from constructor members
		Fun() {
			let leadStatements = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

			const isGeneratorFun = this.kind !== _MsAst.Funs.Plain;
			const oldInGenerator = isInGenerator;
			isInGenerator = isGeneratorFun;

			// TODO:ES6 use `...`f
			const nArgs = new _esastDistAst.Literal(this.args.length);
			const opDeclareRest = (0, _util.opMap)(this.opRestArg, rest => (0, _util2.declare)(rest, new _esastDistAst.CallExpression(_astConstants.ArraySliceCall, [_astConstants.IdArguments, nArgs])));
			const argChecks = (0, _util.opIf)(_context.options.includeChecks(), () => (0, _util.flatOpMap)(this.args, _util2.opTypeCheckForLocalDeclare));

			const opDeclareThis = (0, _util.opIf)(!isInConstructor && this.opDeclareThis != null, () => _astConstants.DeclareLexicalThis);

			const lead = (0, _util.cat)(leadStatements, opDeclareThis, opDeclareRest, argChecks);

			const body = () => (0, _util2.t2)(this.block, lead, this.opReturnType);
			const args = this.args.map(_util2.t0);
			const id = (0, _util.opMap)(verifyResults.opName(this), _esastDistUtil.identifier);

			try {
				switch (this.kind) {
					case _MsAst.Funs.Plain:
						// TODO:ES6 Should be able to use rest args in arrow function
						if (id === null && this.opDeclareThis === null && opDeclareRest === null) return new _esastDistAst.ArrowFunctionExpression(args, body());else return new _esastDistAst.FunctionExpression(id, args, body());
					case _MsAst.Funs.Async:
						{
							const plainBody = (0, _util2.t2)(this.block, null, this.opReturnType);
							const genFunc = new _esastDistAst.FunctionExpression(id, [], plainBody, true);
							const ret = new _esastDistAst.ReturnStatement((0, _msCall.msAsync)(genFunc));
							return new _esastDistAst.FunctionExpression(id, args, new _esastDistAst.BlockStatement((0, _util.cat)(lead, ret)));
						}
					case _MsAst.Funs.Generator:
						return new _esastDistAst.FunctionExpression(id, args, body(), true);
					default:
						throw new Error(this.kind);
				}
			} finally {
				isInGenerator = oldInGenerator;
			}
		},

		Ignore() {
			return [];
		},

		Lazy() {
			return (0, _msCall.lazyWrap)((0, _util2.t0)(this.value));
		},

		MethodImpl(isStatic) {
			const value = (0, _util2.t0)(this.fun);
			(0, _util.assert)(value.id == null);
			// Since the Fun should have opDeclareThis, it will never be an ArrowFunctionExpression.
			(0, _util.assert)(value instanceof _esastDistAst.FunctionExpression);

			var _methodKeyComputed = methodKeyComputed(this.symbol);

			const key = _methodKeyComputed.key;
			const computed = _methodKeyComputed.computed;

			return new _esastDistAst.MethodDefinition(key, value, 'method', isStatic, computed);
		},
		MethodGetter(isStatic) {
			const value = new _esastDistAst.FunctionExpression(null, [], (0, _util2.t1)(this.block, _astConstants.DeclareLexicalThis));

			var _methodKeyComputed2 = methodKeyComputed(this.symbol);

			const key = _methodKeyComputed2.key;
			const computed = _methodKeyComputed2.computed;

			return new _esastDistAst.MethodDefinition(key, value, 'get', isStatic, computed);
		},
		MethodSetter(isStatic) {
			const value = new _esastDistAst.FunctionExpression(null, [_astConstants.IdFocus], (0, _util2.t1)(this.block, _astConstants.DeclareLexicalThis));

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
			return new _esastDistAst.AssignmentExpression('=', (0, _esastDistUtil.identifier)(this.name), (0, _util2.t0)(this.value));
		},

		Logic() {
			const op = this.kind === _MsAst.Logics.And ? '&&' : '||';
			return (0, _util.tail)(this.args).reduce((a, b) => new _esastDistAst.LogicalExpression(op, a, (0, _util2.t0)(b)), (0, _util2.t0)(this.args[0]));
		},

		MapEntry() {
			return (0, _msCall.msSetSub)(_astConstants.IdBuilt, (0, _util2.t0)(this.key), (0, _util2.t0)(this.val));
		},

		Member() {
			return (0, _util2.memberStringOrVal)((0, _util2.t0)(this.object), this.name);
		},

		MemberFun() {
			const name = typeof this.name === 'string' ? new _esastDistAst.Literal(this.name) : (0, _util2.t0)(this.name);
			return (0, _util.ifElse)(this.opObject, _ => (0, _msCall.msMethodBound)((0, _util2.t0)(_), name), () => (0, _msCall.msMethodUnbound)(name));
		},

		MemberSet() {
			const obj = (0, _util2.t0)(this.object);
			const name = () => typeof this.name === 'string' ? new _esastDistAst.Literal(this.name) : (0, _util2.t0)(this.name);
			const val = (0, _util2.maybeWrapInCheckContains)((0, _util2.t0)(this.value), this.opType, this.name);
			switch (this.kind) {
				case _MsAst.Setters.Init:
					return (0, _msCall.msNewProperty)(obj, name(), val);
				case _MsAst.Setters.InitMutable:
					return (0, _msCall.msNewMutableProperty)(obj, name(), val);
				case _MsAst.Setters.Mutate:
					return new _esastDistAst.AssignmentExpression('=', (0, _util2.memberStringOrVal)(obj, this.name), val);
				default:
					throw new Error();
			}
		},

		Module: _transpileModule2.default,

		ModuleExportNamed() {
			return (0, _util2.t1)(this.assign, val => new _esastDistAst.AssignmentExpression('=', (0, _esastDistUtil.member)(_astConstants.IdExports, this.assign.assignee.name), val));
		},

		ModuleExportDefault() {
			return (0, _util2.t1)(this.assign, val => new _esastDistAst.AssignmentExpression('=', _astConstants.ExportsDefault, val));
		},

		New() {
			const anySplat = this.args.some(_ => _ instanceof _MsAst.Splat);
			(0, _context.check)(!anySplat, this.loc, 'TODO: Splat params for new');
			return new _esastDistAst.NewExpression((0, _util2.t0)(this.type), this.args.map(_util2.t0));
		},

		Not() {
			return new _esastDistAst.UnaryExpression('!', (0, _util2.t0)(this.arg));
		},

		ObjEntryAssign() {
			return this.assign instanceof _MsAst.AssignSingle && !this.assign.assignee.isLazy() ? (0, _util2.t1)(this.assign, val => new _esastDistAst.AssignmentExpression('=', (0, _esastDistUtil.member)(_astConstants.IdBuilt, this.assign.assignee.name), val)) : (0, _util.cat)((0, _util2.t0)(this.assign), this.assign.allAssignees().map(_ => (0, _msCall.msSetLazy)(_astConstants.IdBuilt, new _esastDistAst.Literal(_.name), (0, _util2.idForDeclareCached)(_))));
		},

		ObjEntryPlain() {
			return new _esastDistAst.AssignmentExpression('=', (0, _util2.memberStringOrVal)(_astConstants.IdBuilt, this.name), (0, _util2.t0)(this.value));
		},

		ObjSimple() {
			return new _esastDistAst.ObjectExpression(this.pairs.map(pair => new _esastDistAst.Property('init', (0, _esastDistUtil.propertyIdOrLiteral)(pair.key), (0, _util2.t0)(pair.value))));
		},

		QuotePlain() {
			if (this.parts.length === 0) return _astConstants.LitEmptyString;else {
				const quasis = [],
				      expressions = [];

				// TemplateLiteral must start with a TemplateElement
				if (typeof this.parts[0] !== 'string') quasis.push(_esastDistAst.TemplateElement.empty);

				for (let part of this.parts) if (typeof part === 'string') quasis.push(_esastDistAst.TemplateElement.forRawString(part));else {
					// "{1}{1}" needs an empty quasi in the middle (and on the ends)
					if (quasis.length === expressions.length) quasis.push(_esastDistAst.TemplateElement.empty);
					expressions.push((0, _util2.t0)(part));
				}

				// TemplateLiteral must end with a TemplateElement, so one more quasi than expression.
				if (quasis.length === expressions.length) quasis.push(_esastDistAst.TemplateElement.empty);

				return new _esastDistAst.TemplateLiteral(quasis, expressions);
			}
		},

		QuoteSimple() {
			return new _esastDistAst.Literal(this.name);
		},

		QuoteTaggedTemplate() {
			return new _esastDistAst.TaggedTemplateExpression((0, _util2.t0)(this.tag), (0, _util2.t0)(this.quote));
		},

		Range() {
			const end = (0, _util.ifElse)(this.end, _util2.t0, () => _astConstants.GlobalInfinity);
			return (0, _msCall.msRange)((0, _util2.t0)(this.start), end, new _esastDistAst.Literal(this.isExclusive));
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
			return (0, _msCall.msSetSub)((0, _util2.t0)(this.object), this.subbeds.length === 1 ? (0, _util2.t0)(this.subbeds[0]) : this.subbeds.map(_util2.t0), (0, _util2.maybeWrapInCheckContains)((0, _util2.t0)(this.value), this.opType, 'value'), new _esastDistAst.Literal(kind));
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
				case _MsAst.SpecialVals.DelSub:
					return (0, _esastDistUtil.member)(_msCall.IdMs, 'delSub');
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
			return new _esastDistAst.SpreadElement((0, _util2.t0)(this.splatted));
		},

		SuperCall: superCall,
		SuperCallDo: superCall,
		SuperMember() {
			return (0, _util2.memberStringOrVal)(_astConstants.IdSuper, this.name);
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
			return (0, _util.ifElse)(this.opThrown, _ => (0, _util2.doThrow)(_), () => new _esastDistAst.ThrowStatement(new _esastDistAst.NewExpression(_astConstants.GlobalError, [_astConstants.LitStrThrow])));
		},

		With() {
			const idDeclare = (0, _util2.idForDeclareCached)(this.declare);
			const block = (0, _util2.t3)(this.block, null, null, new _esastDistAst.ReturnStatement(idDeclare));
			const fun = isInGenerator ? new _esastDistAst.FunctionExpression(null, [idDeclare], block, true) : new _esastDistAst.ArrowFunctionExpression([idDeclare], block);
			const call = new _esastDistAst.CallExpression(fun, [(0, _util2.t0)(this.value)]);
			return isInGenerator ? new _esastDistAst.YieldExpression(call, true) : call;
		},

		Yield() {
			return new _esastDistAst.YieldExpression((0, _util.opMap)(this.opYielded, _util2.t0), false);
		},

		YieldTo() {
			return new _esastDistAst.YieldExpression((0, _util2.t0)(this.yieldedTo), true);
		}
	});

	// Shared implementations

	function casePart(alternate) {
		if (this.test instanceof _MsAst.Pattern) {
			var _test = this.test;
			const type = _test.type;
			const patterned = _test.patterned;
			const locals = _test.locals;

			const decl = new _esastDistAst.VariableDeclaration('const', [new _esastDistAst.VariableDeclarator(_astConstants.IdExtract, (0, _msCall.msExtract)((0, _util2.t0)(type), (0, _util2.t0)(patterned)))]);
			const test = new _esastDistAst.BinaryExpression('!==', _astConstants.IdExtract, _astConstants.LitNull);
			const extract = new _esastDistAst.VariableDeclaration('const', locals.map((_, idx) => new _esastDistAst.VariableDeclarator((0, _util2.idForDeclareCached)(_), new _esastDistAst.MemberExpression(_astConstants.IdExtract, new _esastDistAst.Literal(idx)))));
			const res = (0, _util2.t1)(this.result, extract);
			return new _esastDistAst.BlockStatement([decl, new _esastDistAst.IfStatement(test, res, alternate)]);
		} else
			// alternate written to by `caseBody`.
			return new _esastDistAst.IfStatement((0, _util2.t0)(this.test), (0, _util2.t0)(this.result), alternate);
	}

	function superCall() {
		const args = this.args.map(_util2.t0);
		const method = verifyResults.superCallToMethod.get(this);

		if (method instanceof _MsAst.Constructor) {
			const call = new _esastDistAst.CallExpression(_astConstants.IdSuper, args);
			const memberSets = constructorSetMembers(method);
			return (0, _util.cat)(call, memberSets);
		} else return new _esastDistAst.CallExpression((0, _util2.memberStringOrVal)(_astConstants.IdSuper, method.symbol), args);
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
		const block = (0, _util2.t3)(this.result, null, null, follow);
		// If switch has multiple values, build up a statement like: `case 1: case 2: { doBlock() }`
		const x = [];
		for (let i = 0; i < this.values.length - 1; i = i + 1)
		// These cases fallthrough to the one at the end.
		x.push(new _esastDistAst.SwitchCase((0, _util2.t0)(this.values[i]), []));
		x.push(new _esastDistAst.SwitchCase((0, _util2.t0)(this.values[this.values.length - 1]), [block]));
		return x;
	}

	// Functions specific to certain expressions

	// Wraps a block (with `return` statements in it) in an IIFE.
	function blockWrap(block) {
		const invoke = new _esastDistAst.CallExpression((0, _esastDistUtil.functionExpressionThunk)(block, isInGenerator), []);
		return isInGenerator ? new _esastDistAst.YieldExpression(invoke, true) : invoke;
	}

	function caseBody(parts, opElse) {
		let acc = (0, _util.ifElse)(opElse, _util2.t0, () => _astConstants.ThrowNoCaseMatch);
		for (let i = parts.length - 1; i >= 0; i = i - 1) acc = (0, _util2.t1)(parts[i], acc);
		return acc;
	}

	function constructorSetMembers(constructor) {
		return constructor.memberArgs.map(_ => (0, _msCall.msNewProperty)(new _esastDistAst.ThisExpression(), new _esastDistAst.Literal(_.name), (0, _util2.idForDeclareCached)(_)));
	}

	function forLoop(opIteratee, block) {
		return (0, _util.ifElse)(opIteratee, _ref => {
			let element = _ref.element;
			let bag = _ref.bag;

			const declare = new _esastDistAst.VariableDeclaration('let', [new _esastDistAst.VariableDeclarator((0, _util2.t0)(element))]);
			return new _esastDistAst.ForOfStatement(declare, (0, _util2.t0)(bag), (0, _util2.t0)(block));
		}, () => new _esastDistAst.ForStatement(null, null, null, (0, _util2.t0)(block)));
	}

	function methodKeyComputed(symbol) {
		if (typeof symbol === 'string') return { key: (0, _esastDistUtil.propertyIdOrLiteral)(symbol), computed: false };else {
			const key = symbol instanceof _MsAst.QuoteAbstract ? (0, _util2.t0)(symbol) : (0, _msCall.msSymbol)((0, _util2.t0)(symbol));
			return { key, computed: true };
		}
	}

	function transpileBlock(returned, lines, lead, opReturnType) {
		const fin = new _esastDistAst.ReturnStatement((0, _util2.maybeWrapInCheckContains)(returned, opReturnType, 'returned value'));
		return new _esastDistAst.BlockStatement((0, _util.cat)(lead, lines, fin));
	}

	function transpileExcept(except) {
		return new _esastDistAst.TryStatement((0, _util2.t0)(except.try), (0, _util.opMap)(except.catch, _util2.t0), (0, _util.opMap)(except.finally, _util2.t0));
	}

	function transpileSwitch(_) {
		const parts = (0, _util.flatMap)(_.parts, _util2.t0);
		parts.push((0, _util.ifElse)(_.opElse, _ => new _esastDistAst.SwitchCase(undefined, (0, _util2.t0)(_).body), () => _astConstants.SwitchCaseNoMatch));
		return new _esastDistAst.SwitchStatement((0, _util2.t0)(_.switched), parts);
	}

	function makeDestructureDeclarators(assignees, isLazy, value, isModule) {
		const destructuredName = `_$${ nextDestructuredId }`;
		nextDestructuredId = nextDestructuredId + 1;
		const idDestructured = new _esastDistAst.Identifier(destructuredName);
		const declarators = assignees.map(assignee => {
			// TODO: Don't compile it if it's never accessed
			const get = (0, _util2.getMember)(idDestructured, assignee.name, isLazy, isModule);
			return (0, _util2.makeDeclarator)(assignee, get, isLazy);
		});
		// Getting lazy module is done by ms.lazyGetModule.
		const val = isLazy && !isModule ? (0, _msCall.lazyWrap)(value) : value;
		return (0, _util.cat)(new _esastDistAst.VariableDeclarator(idDestructured, val), declarators);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQWdDd0IsU0FBUzs7Ozs7Ozs7O0FBTjFCLEtBQUksYUFBYSxDQUFBOzs7QUFFeEIsS0FBSSxhQUFhLEVBQUUsZUFBZSxDQUFBO0FBQ2xDLEtBQUksa0JBQWtCLENBQUE7Ozs7QUFHUCxVQUFTLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLEVBQUU7QUFDbkUsVUFQVSxhQUFhLEdBT3ZCLGFBQWEsR0FBRyxjQUFjLENBQUE7QUFDOUIsZUFBYSxHQUFHLEtBQUssQ0FBQTtBQUNyQixpQkFBZSxHQUFHLEtBQUssQ0FBQTtBQUN2QixvQkFBa0IsR0FBRyxDQUFDLENBQUE7QUFDdEIsUUFBTSxHQUFHLEdBQUcsV0FkNkQsRUFBRSxFQWM1RCxnQkFBZ0IsQ0FBQyxDQUFBOztBQUVoQyxVQWJVLGFBQWEsR0FhdkIsYUFBYSxHQUFHLElBQUksQ0FBQTtBQUNwQixTQUFPLEdBQUcsQ0FBQTtFQUNWOztBQUVELFdBOUJpRCxhQUFhLFVBOEJwQyxXQUFXLEVBQUU7QUFDdEMsUUFBTSxHQUFHO0FBQ1IsU0FBTSxRQUFRLEdBQUcsTUFBTTtBQUN0QixVQUFNLElBQUksR0FBRyxXQXZCMEQsRUFBRSxFQXVCekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQy9CLFdBQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsa0JBekNxQixlQUFlLENBeUNoQixHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDMUQsQ0FBQTs7QUFFRCxVQUFPLFVBckNnQyxNQUFNLEVBcUMvQixJQUFJLENBQUMsUUFBUSxFQUMxQixDQUFDLElBQUksa0JBaERLLFdBQVcsQ0FnREEsUUFBUSxFQUFFLEVBQUUsV0E3QkMsT0FBTyxFQTZCQSxDQUFDLENBQUMsQ0FBQyxFQUM1QyxNQUFNO0FBQ0wsUUFBSSxJQUFJLENBQUMsU0FB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RyxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsR0FBRyxZQWxvQnJCLFFBQVEsRUFrb0JzQixLQUFLLENBQUMsR0FBRyxLQUFLLENBQUE7QUFDekQsU0FBTyxVQXhvQlEsR0FBRyxFQXdvQlAsa0JBL29CeUQsa0JBQWtCLENBK29CcEQsY0FBYyxFQUFFLEdBQUcsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0VBQ3BFIiwiZmlsZSI6InRyYW5zcGlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXJyYXlFeHByZXNzaW9uLCBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbiwgQXNzaWdubWVudEV4cHJlc3Npb24sIEJpbmFyeUV4cHJlc3Npb24sXG5cdEJsb2NrU3RhdGVtZW50LCBCcmVha1N0YXRlbWVudCwgQ2FsbEV4cHJlc3Npb24sIENhdGNoQ2xhdXNlLCBDbGFzc0JvZHksIENsYXNzRXhwcmVzc2lvbixcblx0Q29uZGl0aW9uYWxFeHByZXNzaW9uLCBEZWJ1Z2dlclN0YXRlbWVudCwgRm9yT2ZTdGF0ZW1lbnQsIEZvclN0YXRlbWVudCwgRnVuY3Rpb25FeHByZXNzaW9uLFxuXHRJZGVudGlmaWVyLCBJZlN0YXRlbWVudCwgTGl0ZXJhbCwgTG9naWNhbEV4cHJlc3Npb24sIE1lbWJlckV4cHJlc3Npb24sIE1ldGhvZERlZmluaXRpb24sXG5cdE5ld0V4cHJlc3Npb24sIE9iamVjdEV4cHJlc3Npb24sIFByb3BlcnR5LCBSZXR1cm5TdGF0ZW1lbnQsIFNwcmVhZEVsZW1lbnQsIFN3aXRjaENhc2UsXG5cdFN3aXRjaFN0YXRlbWVudCwgVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uLCBUZW1wbGF0ZUVsZW1lbnQsIFRlbXBsYXRlTGl0ZXJhbCwgVGhpc0V4cHJlc3Npb24sXG5cdFRocm93U3RhdGVtZW50LCBUcnlTdGF0ZW1lbnQsIFZhcmlhYmxlRGVjbGFyYXRpb24sIFVuYXJ5RXhwcmVzc2lvbiwgVmFyaWFibGVEZWNsYXJhdG9yLFxuXHRZaWVsZEV4cHJlc3Npb259IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IHtmdW5jdGlvbkV4cHJlc3Npb25UaHVuaywgaWRlbnRpZmllciwgbWVtYmVyLCBwcm9wZXJ0eUlkT3JMaXRlcmFsfSBmcm9tICdlc2FzdC9kaXN0L3V0aWwnXG5pbXBvcnQge2NoZWNrLCBvcHRpb25zfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0ICogYXMgTXNBc3RUeXBlcyBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7QXNzaWduU2luZ2xlLCBDYWxsLCBDb25zdHJ1Y3RvciwgRnVucywgTG9naWNzLCBNZW1iZXIsIExvY2FsRGVjbGFyZXMsIFBhdHRlcm4sIFNwbGF0LFxuXHRTZXR0ZXJzLCBTcGVjaWFsRG9zLCBTcGVjaWFsVmFscywgU3dpdGNoRG9QYXJ0LCBRdW90ZUFic3RyYWN0fSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7YXNzZXJ0LCBjYXQsIGZsYXRNYXAsIGZsYXRPcE1hcCwgaWZFbHNlLCBpbXBsZW1lbnRNYW55LCBvcElmLCBvcE1hcCwgdGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7QXJyYXlTbGljZUNhbGwsIERlY2xhcmVCdWlsdEJhZywgRGVjbGFyZUJ1aWx0TWFwLCBEZWNsYXJlQnVpbHRPYmosIERlY2xhcmVMZXhpY2FsVGhpcyxcblx0RXhwb3J0c0RlZmF1bHQsIElkQXJndW1lbnRzLCBJZEJ1aWx0LCBJZEV4cG9ydHMsIElkRXh0cmFjdCwgSWRGb2N1cywgSWRMZXhpY2FsVGhpcywgSWRTdXBlcixcblx0R2xvYmFsRXJyb3IsIEdsb2JhbEluZmluaXR5LCBMaXRFbXB0eVN0cmluZywgTGl0TnVsbCwgTGl0U3RyVGhyb3csIExpdFplcm8sIFJldHVybkJ1aWx0LFxuXHRTd2l0Y2hDYXNlTm9NYXRjaCwgVGhyb3dBc3NlcnRGYWlsLCBUaHJvd05vQ2FzZU1hdGNofSBmcm9tICcuL2FzdC1jb25zdGFudHMnXG5pbXBvcnQge0lkTXMsIGxhenlXcmFwLCBtc0FkZCwgbXNBZGRNYW55LCBtc0Fzc2VydCwgbXNBc3NlcnRNZW1iZXIsIG1zQXNzZXJ0Tm90LCBtc0Fzc2VydE5vdE1lbWJlcixcblx0bXNBc3luYywgbXNFeHRyYWN0LCBtc01ldGhvZEJvdW5kLCBtc01ldGhvZFVuYm91bmQsIG1zTmV3TXV0YWJsZVByb3BlcnR5LCBtc05ld1Byb3BlcnR5LFxuXHRtc1JhbmdlLCBtc1NldExhenksIG1zU2V0U3ViLCBtc1NvbWUsIG1zU3ltYm9sLCBNc05vbmV9IGZyb20gJy4vbXMtY2FsbCdcbmltcG9ydCB0cmFuc3BpbGVNb2R1bGUgZnJvbSAnLi90cmFuc3BpbGVNb2R1bGUnXG5pbXBvcnQge2FjY2Vzc0xvY2FsRGVjbGFyZSwgZGVjbGFyZSwgZG9UaHJvdywgZ2V0TWVtYmVyLCBpZEZvckRlY2xhcmVDYWNoZWQsIG1ha2VEZWNsYXJhdG9yLFxuXHRtYXliZVdyYXBJbkNoZWNrQ29udGFpbnMsIG1lbWJlclN0cmluZ09yVmFsLCBvcFR5cGVDaGVja0ZvckxvY2FsRGVjbGFyZSwgdDAsIHQxLCB0MiwgdDMsIHRMaW5lc1xuXHR9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGxldCB2ZXJpZnlSZXN1bHRzXG4vLyBpc0luR2VuZXJhdG9yIG1lYW5zIHdlIGFyZSBpbiBhbiBhc3luYyBvciBnZW5lcmF0b3IgZnVuY3Rpb24uXG5sZXQgaXNJbkdlbmVyYXRvciwgaXNJbkNvbnN0cnVjdG9yXG5sZXQgbmV4dERlc3RydWN0dXJlZElkXG5cbi8qKiBUcmFuc2Zvcm0gYSB7QGxpbmsgTXNBc3R9IGludG8gYW4gZXNhc3QuICoqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhbnNwaWxlKG1vZHVsZUV4cHJlc3Npb24sIF92ZXJpZnlSZXN1bHRzKSB7XG5cdHZlcmlmeVJlc3VsdHMgPSBfdmVyaWZ5UmVzdWx0c1xuXHRpc0luR2VuZXJhdG9yID0gZmFsc2Vcblx0aXNJbkNvbnN0cnVjdG9yID0gZmFsc2Vcblx0bmV4dERlc3RydWN0dXJlZElkID0gMFxuXHRjb25zdCByZXMgPSB0MChtb2R1bGVFeHByZXNzaW9uKVxuXHQvLyBSZWxlYXNlIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXG5cdHZlcmlmeVJlc3VsdHMgPSBudWxsXG5cdHJldHVybiByZXNcbn1cblxuaW1wbGVtZW50TWFueShNc0FzdFR5cGVzLCAndHJhbnNwaWxlJywge1xuXHRBc3NlcnQoKSB7XG5cdFx0Y29uc3QgZmFpbENvbmQgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBjb25kID0gdDAodGhpcy5jb25kaXRpb24pXG5cdFx0XHRyZXR1cm4gdGhpcy5uZWdhdGUgPyBjb25kIDogbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIGNvbmQpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wVGhyb3duLFxuXHRcdFx0XyA9PiBuZXcgSWZTdGF0ZW1lbnQoZmFpbENvbmQoKSwgZG9UaHJvdyhfKSksXG5cdFx0XHQoKSA9PiB7XG5cdFx0XHRcdGlmICh0aGlzLmNvbmRpdGlvbiBpbnN0YW5jZW9mIENhbGwpIHtcblx0XHRcdFx0XHRjb25zdCBjYWxsID0gdGhpcy5jb25kaXRpb25cblx0XHRcdFx0XHRjb25zdCBjYWxsZWQgPSBjYWxsLmNhbGxlZFxuXHRcdFx0XHRcdGNvbnN0IGFyZ3MgPSBjYWxsLmFyZ3MubWFwKHQwKVxuXHRcdFx0XHRcdGlmIChjYWxsZWQgaW5zdGFuY2VvZiBNZW1iZXIpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGFzcyA9IHRoaXMubmVnYXRlID8gbXNBc3NlcnROb3RNZW1iZXIgOiBtc0Fzc2VydE1lbWJlclxuXHRcdFx0XHRcdFx0cmV0dXJuIGFzcyh0MChjYWxsZWQub2JqZWN0KSwgbmV3IExpdGVyYWwoY2FsbGVkLm5hbWUpLCAuLi5hcmdzKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb25zdCBhc3MgPSB0aGlzLm5lZ2F0ZSA/IG1zQXNzZXJ0Tm90IDogbXNBc3NlcnRcblx0XHRcdFx0XHRcdHJldHVybiBhc3ModDAoY2FsbGVkKSwgLi4uYXJncylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQoZmFpbENvbmQoKSwgVGhyb3dBc3NlcnRGYWlsKVxuXHRcdFx0fSlcblx0fSxcblxuXHRBc3NpZ25TaW5nbGUodmFsV3JhcCkge1xuXHRcdGNvbnN0IHZhbCA9IHZhbFdyYXAgPT09IHVuZGVmaW5lZCA/IHQwKHRoaXMudmFsdWUpIDogdmFsV3JhcCh0MCh0aGlzLnZhbHVlKSlcblx0XHRjb25zdCBkZWNsYXJlID0gbWFrZURlY2xhcmF0b3IodGhpcy5hc3NpZ25lZSwgdmFsLCBmYWxzZSlcblx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24odGhpcy5hc3NpZ25lZS5pc011dGFibGUoKSA/ICdsZXQnIDogJ2NvbnN0JywgW2RlY2xhcmVdKVxuXHR9LFxuXHQvLyBUT0RPOkVTNiBKdXN0IHVzZSBuYXRpdmUgZGVzdHJ1Y3R1cmluZyBhc3NpZ25cblx0QXNzaWduRGVzdHJ1Y3R1cmUoKSB7XG5cdFx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKFxuXHRcdFx0dGhpcy5raW5kKCkgPT09IExvY2FsRGVjbGFyZXMuTXV0YWJsZSA/ICdsZXQnIDogJ2NvbnN0Jyxcblx0XHRcdG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzKFxuXHRcdFx0XHR0aGlzLmFzc2lnbmVlcyxcblx0XHRcdFx0dGhpcy5raW5kKCkgPT09IExvY2FsRGVjbGFyZXMuTGF6eSxcblx0XHRcdFx0dDAodGhpcy52YWx1ZSksXG5cdFx0XHRcdGZhbHNlKSlcblx0fSxcblxuXHRCYWdFbnRyeSgpIHsgcmV0dXJuIG1zQWRkKElkQnVpbHQsIHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdEJhZ0VudHJ5TWFueSgpIHsgcmV0dXJuIG1zQWRkTWFueShJZEJ1aWx0LCB0MCh0aGlzLnZhbHVlKSkgfSxcblxuXHRCYWdTaW1wbGUoKSB7IHJldHVybiBuZXcgQXJyYXlFeHByZXNzaW9uKHRoaXMucGFydHMubWFwKHQwKSkgfSxcblxuXHRCbG9ja0RvKGxlYWQ9bnVsbCwgb3BSZXR1cm5UeXBlPW51bGwsIGZvbGxvdz1udWxsKSB7XG5cdFx0YXNzZXJ0KG9wUmV0dXJuVHlwZSA9PT0gbnVsbClcblx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChsZWFkLCB0TGluZXModGhpcy5saW5lcyksIGZvbGxvdykpXG5cdH0sXG5cblx0QmxvY2tWYWxUaHJvdyhsZWFkPW51bGwsIF9vcFJldHVyblR5cGUpIHtcblx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChsZWFkLCB0TGluZXModGhpcy5saW5lcyksIHQwKHRoaXMudGhyb3cpKSlcblx0fSxcblxuXHRCbG9ja1ZhbFJldHVybihsZWFkPW51bGwsIG9wUmV0dXJuVHlwZT1udWxsKSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKHQwKHRoaXMucmV0dXJuZWQpLCB0TGluZXModGhpcy5saW5lcyksIGxlYWQsIG9wUmV0dXJuVHlwZSlcblx0fSxcblxuXHRCbG9ja0JhZyhsZWFkPW51bGwsIG9wUmV0dXJuVHlwZT1udWxsKSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKFxuXHRcdFx0SWRCdWlsdCxcblx0XHRcdGNhdChEZWNsYXJlQnVpbHRCYWcsIHRMaW5lcyh0aGlzLmxpbmVzKSksXG5cdFx0XHRsZWFkLCBvcFJldHVyblR5cGUpXG5cdH0sXG5cblx0QmxvY2tPYmoobGVhZD1udWxsLCBvcFJldHVyblR5cGU9bnVsbCkge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayhcblx0XHRcdElkQnVpbHQsXG5cdFx0XHRjYXQoRGVjbGFyZUJ1aWx0T2JqLCB0TGluZXModGhpcy5saW5lcykpLFxuXHRcdFx0bGVhZCwgb3BSZXR1cm5UeXBlKVxuXHR9LFxuXG5cdEJsb2NrTWFwKGxlYWQ9bnVsbCwgb3BSZXR1cm5UeXBlPW51bGwpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2soXG5cdFx0XHRJZEJ1aWx0LFxuXHRcdFx0Y2F0KERlY2xhcmVCdWlsdE1hcCwgdExpbmVzKHRoaXMubGluZXMpKSxcblx0XHRcdGxlYWQsIG9wUmV0dXJuVHlwZSlcblx0fSxcblxuXHRCbG9ja1dyYXAoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcCh0MCh0aGlzLmJsb2NrKSlcblx0fSxcblxuXHRCcmVhaygpIHtcblx0XHRyZXR1cm4gbmV3IEJyZWFrU3RhdGVtZW50KClcblx0fSxcblxuXHRCcmVha1dpdGhWYWwoKSB7XG5cdFx0cmV0dXJuIG5ldyBSZXR1cm5TdGF0ZW1lbnQodDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0Q2FsbCgpIHtcblx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKHQwKHRoaXMuY2FsbGVkKSwgdGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0Q2FzZURvKCkge1xuXHRcdGNvbnN0IGJvZHkgPSBjYXNlQm9keSh0aGlzLnBhcnRzLCB0aGlzLm9wRWxzZSlcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BDYXNlZCwgXyA9PiBuZXcgQmxvY2tTdGF0ZW1lbnQoW3QwKF8pLCBib2R5XSksICgpID0+IGJvZHkpXG5cdH0sXG5cdENhc2VWYWwoKSB7XG5cdFx0Y29uc3QgYm9keSA9IGNhc2VCb2R5KHRoaXMucGFydHMsIHRoaXMub3BFbHNlKVxuXHRcdGNvbnN0IGJsb2NrID0gaWZFbHNlKHRoaXMub3BDYXNlZCwgXyA9PiBbdDAoXyksIGJvZHldLCAoKSA9PiBbYm9keV0pXG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoYmxvY2spKVxuXHR9LFxuXHRDYXNlRG9QYXJ0OiBjYXNlUGFydCxcblx0Q2FzZVZhbFBhcnQ6IGNhc2VQYXJ0LFxuXG5cdENsYXNzKCkge1xuXHRcdGNvbnN0IG1ldGhvZHMgPSBjYXQoXG5cdFx0XHR0aGlzLnN0YXRpY3MubWFwKF8gPT4gdDEoXywgdHJ1ZSkpLFxuXHRcdFx0b3BNYXAodGhpcy5vcENvbnN0cnVjdG9yLCB0MCksXG5cdFx0XHR0aGlzLm1ldGhvZHMubWFwKF8gPT4gdDEoXywgZmFsc2UpKSlcblx0XHRjb25zdCBvcE5hbWUgPSBvcE1hcCh2ZXJpZnlSZXN1bHRzLm9wTmFtZSh0aGlzKSwgaWRlbnRpZmllcilcblx0XHRjb25zdCBjbGFzc0V4cHIgPSBuZXcgQ2xhc3NFeHByZXNzaW9uKFxuXHRcdFx0b3BOYW1lLFxuXHRcdFx0b3BNYXAodGhpcy5vcFN1cGVyQ2xhc3MsIHQwKSwgbmV3IENsYXNzQm9keShtZXRob2RzKSlcblxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcERvLCBfID0+IHQxKF8sIGNsYXNzRXhwciksICgpID0+IGNsYXNzRXhwcilcblx0fSxcblxuXHRDbGFzc0RvKGNsYXNzRXhwcikge1xuXHRcdGNvbnN0IGxlYWQgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBbXG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKHQwKHRoaXMuZGVjbGFyZUZvY3VzKSwgY2xhc3NFeHByKV0pXG5cdFx0Y29uc3QgcmV0ID0gbmV3IFJldHVyblN0YXRlbWVudCh0MCh0aGlzLmRlY2xhcmVGb2N1cykpXG5cdFx0Y29uc3QgYmxvY2sgPSB0Myh0aGlzLmJsb2NrLCBsZWFkLCBudWxsLCByZXQpXG5cdFx0cmV0dXJuIGJsb2NrV3JhcChibG9jaylcblx0fSxcblxuXHRDb25kKCkge1xuXHRcdHJldHVybiBuZXcgQ29uZGl0aW9uYWxFeHByZXNzaW9uKHQwKHRoaXMudGVzdCksIHQwKHRoaXMuaWZUcnVlKSwgdDAodGhpcy5pZkZhbHNlKSlcblx0fSxcblxuXHRDb25kaXRpb25hbERvKCkge1xuXHRcdGNvbnN0IHRlc3QgPSB0MCh0aGlzLnRlc3QpXG5cdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudChcblx0XHRcdHRoaXMuaXNVbmxlc3MgPyBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgdGVzdCkgOiB0ZXN0LFxuXHRcdFx0dDAodGhpcy5yZXN1bHQpKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsVmFsKCkge1xuXHRcdGNvbnN0IHRlc3QgPSB0MCh0aGlzLnRlc3QpXG5cdFx0Y29uc3QgcmVzdWx0ID0gbXNTb21lKGJsb2NrV3JhcCh0MCh0aGlzLnJlc3VsdCkpKVxuXHRcdHJldHVybiB0aGlzLmlzVW5sZXNzID9cblx0XHRcdG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odGVzdCwgTXNOb25lLCByZXN1bHQpIDpcblx0XHRcdG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odGVzdCwgcmVzdWx0LCBNc05vbmUpXG5cdH0sXG5cblx0Q29uc3RydWN0b3IoKSB7XG5cdFx0aXNJbkNvbnN0cnVjdG9yID0gdHJ1ZVxuXG5cdFx0Ly8gSWYgdGhlcmUgaXMgYSBgc3VwZXIhYCwgYHRoaXNgIHdpbGwgbm90IGJlIGRlZmluZWQgdW50aWwgdGhlbiwgc28gbXVzdCB3YWl0IHVudGlsIHRoZW4uXG5cdFx0Ly8gT3RoZXJ3aXNlLCBkbyBpdCBhdCB0aGUgYmVnaW5uaW5nLlxuXHRcdGNvbnN0IGJvZHkgPSB2ZXJpZnlSZXN1bHRzLmNvbnN0cnVjdG9yVG9TdXBlci5oYXModGhpcykgP1xuXHRcdFx0dDAodGhpcy5mdW4pIDpcblx0XHRcdHQxKHRoaXMuZnVuLCBjb25zdHJ1Y3RvclNldE1lbWJlcnModGhpcykpXG5cblx0XHRjb25zdCByZXMgPSBNZXRob2REZWZpbml0aW9uLmNvbnN0cnVjdG9yKGJvZHkpXG5cdFx0aXNJbkNvbnN0cnVjdG9yID0gZmFsc2Vcblx0XHRyZXR1cm4gcmVzXG5cdH0sXG5cblx0Q2F0Y2goKSB7XG5cdFx0cmV0dXJuIG5ldyBDYXRjaENsYXVzZSh0MCh0aGlzLmNhdWdodCksIHQwKHRoaXMuYmxvY2spKVxuXHR9LFxuXG5cdEV4Y2VwdERvKCkgeyByZXR1cm4gdHJhbnNwaWxlRXhjZXB0KHRoaXMpIH0sXG5cdEV4Y2VwdFZhbCgpIHsgcmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW3RyYW5zcGlsZUV4Y2VwdCh0aGlzKV0pKSB9LFxuXG5cdEZvckRvKCkgeyByZXR1cm4gZm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spIH0sXG5cblx0Rm9yQmFnKCkge1xuXHRcdHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFtcblx0XHRcdERlY2xhcmVCdWlsdEJhZyxcblx0XHRcdGZvckxvb3AodGhpcy5vcEl0ZXJhdGVlLCB0aGlzLmJsb2NrKSxcblx0XHRcdFJldHVybkJ1aWx0XG5cdFx0XSkpXG5cdH0sXG5cblx0Rm9yVmFsKCkge1xuXHRcdHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFtmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jayldKSlcblx0fSxcblxuXHQvLyBsZWFkU3RhdGVtZW50cyBjb21lcyBmcm9tIGNvbnN0cnVjdG9yIG1lbWJlcnNcblx0RnVuKGxlYWRTdGF0ZW1lbnRzPW51bGwpIHtcblx0XHRjb25zdCBpc0dlbmVyYXRvckZ1biA9IHRoaXMua2luZCAhPT0gRnVucy5QbGFpblxuXHRcdGNvbnN0IG9sZEluR2VuZXJhdG9yID0gaXNJbkdlbmVyYXRvclxuXHRcdGlzSW5HZW5lcmF0b3IgPSBpc0dlbmVyYXRvckZ1blxuXG5cdFx0Ly8gVE9ETzpFUzYgdXNlIGAuLi5gZlxuXHRcdGNvbnN0IG5BcmdzID0gbmV3IExpdGVyYWwodGhpcy5hcmdzLmxlbmd0aClcblx0XHRjb25zdCBvcERlY2xhcmVSZXN0ID0gb3BNYXAodGhpcy5vcFJlc3RBcmcsIHJlc3QgPT5cblx0XHRcdGRlY2xhcmUocmVzdCwgbmV3IENhbGxFeHByZXNzaW9uKEFycmF5U2xpY2VDYWxsLCBbSWRBcmd1bWVudHMsIG5BcmdzXSkpKVxuXHRcdGNvbnN0IGFyZ0NoZWNrcyA9IG9wSWYob3B0aW9ucy5pbmNsdWRlQ2hlY2tzKCksICgpID0+XG5cdFx0XHRmbGF0T3BNYXAodGhpcy5hcmdzLCBvcFR5cGVDaGVja0ZvckxvY2FsRGVjbGFyZSkpXG5cblx0XHRjb25zdCBvcERlY2xhcmVUaGlzID1cblx0XHRcdG9wSWYoIWlzSW5Db25zdHJ1Y3RvciAmJiB0aGlzLm9wRGVjbGFyZVRoaXMgIT0gbnVsbCwgKCkgPT4gRGVjbGFyZUxleGljYWxUaGlzKVxuXG5cdFx0Y29uc3QgbGVhZCA9IGNhdChsZWFkU3RhdGVtZW50cywgb3BEZWNsYXJlVGhpcywgb3BEZWNsYXJlUmVzdCwgYXJnQ2hlY2tzKVxuXG5cdFx0Y29uc3QgYm9keSA9KCkgPT4gdDIodGhpcy5ibG9jaywgbGVhZCwgdGhpcy5vcFJldHVyblR5cGUpXG5cdFx0Y29uc3QgYXJncyA9IHRoaXMuYXJncy5tYXAodDApXG5cdFx0Y29uc3QgaWQgPSBvcE1hcCh2ZXJpZnlSZXN1bHRzLm9wTmFtZSh0aGlzKSwgaWRlbnRpZmllcilcblxuXHRcdHRyeSB7XG5cdFx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0XHRjYXNlIEZ1bnMuUGxhaW46XG5cdFx0XHRcdFx0Ly8gVE9ETzpFUzYgU2hvdWxkIGJlIGFibGUgdG8gdXNlIHJlc3QgYXJncyBpbiBhcnJvdyBmdW5jdGlvblxuXHRcdFx0XHRcdGlmIChpZCA9PT0gbnVsbCAmJiB0aGlzLm9wRGVjbGFyZVRoaXMgPT09IG51bGwgJiYgb3BEZWNsYXJlUmVzdCA9PT0gbnVsbClcblx0XHRcdFx0XHRcdHJldHVybiBuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oYXJncywgYm9keSgpKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHJldHVybiBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKGlkLCBhcmdzLCBib2R5KCkpXG5cdFx0XHRcdGNhc2UgRnVucy5Bc3luYzoge1xuXHRcdFx0XHRcdGNvbnN0IHBsYWluQm9keSA9IHQyKHRoaXMuYmxvY2ssIG51bGwsIHRoaXMub3BSZXR1cm5UeXBlKVxuXHRcdFx0XHRcdGNvbnN0IGdlbkZ1bmMgPSBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKGlkLCBbXSwgcGxhaW5Cb2R5LCB0cnVlKVxuXHRcdFx0XHRcdGNvbnN0IHJldCA9IG5ldyBSZXR1cm5TdGF0ZW1lbnQobXNBc3luYyhnZW5GdW5jKSlcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihpZCwgYXJncywgbmV3IEJsb2NrU3RhdGVtZW50KGNhdChsZWFkLCByZXQpKSlcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlIEZ1bnMuR2VuZXJhdG9yOlxuXHRcdFx0XHRcdHJldHVybiBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKGlkLCBhcmdzLCBib2R5KCksIHRydWUpXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHRcdH1cblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0aXNJbkdlbmVyYXRvciA9IG9sZEluR2VuZXJhdG9yXG5cdFx0fVxuXHR9LFxuXG5cdElnbm9yZSgpIHtcblx0XHRyZXR1cm4gW11cblx0fSxcblxuXHRMYXp5KCkge1xuXHRcdHJldHVybiBsYXp5V3JhcCh0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRNZXRob2RJbXBsKGlzU3RhdGljKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSB0MCh0aGlzLmZ1bilcblx0XHRhc3NlcnQodmFsdWUuaWQgPT0gbnVsbClcblx0XHQvLyBTaW5jZSB0aGUgRnVuIHNob3VsZCBoYXZlIG9wRGVjbGFyZVRoaXMsIGl0IHdpbGwgbmV2ZXIgYmUgYW4gQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24uXG5cdFx0YXNzZXJ0KHZhbHVlIGluc3RhbmNlb2YgRnVuY3Rpb25FeHByZXNzaW9uKVxuXG5cdFx0Y29uc3Qge2tleSwgY29tcHV0ZWR9ID0gbWV0aG9kS2V5Q29tcHV0ZWQodGhpcy5zeW1ib2wpXG5cdFx0cmV0dXJuIG5ldyBNZXRob2REZWZpbml0aW9uKGtleSwgdmFsdWUsICdtZXRob2QnLCBpc1N0YXRpYywgY29tcHV0ZWQpXG5cdH0sXG5cdE1ldGhvZEdldHRlcihpc1N0YXRpYykge1xuXHRcdGNvbnN0IHZhbHVlID0gbmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihudWxsLCBbXSwgdDEodGhpcy5ibG9jaywgRGVjbGFyZUxleGljYWxUaGlzKSlcblx0XHRjb25zdCB7a2V5LCBjb21wdXRlZH0gPSBtZXRob2RLZXlDb21wdXRlZCh0aGlzLnN5bWJvbClcblx0XHRyZXR1cm4gbmV3IE1ldGhvZERlZmluaXRpb24oa2V5LCB2YWx1ZSwgJ2dldCcsIGlzU3RhdGljLCBjb21wdXRlZClcblx0fSxcblx0TWV0aG9kU2V0dGVyKGlzU3RhdGljKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFtJZEZvY3VzXSwgdDEodGhpcy5ibG9jaywgRGVjbGFyZUxleGljYWxUaGlzKSlcblx0XHRjb25zdCB7a2V5LCBjb21wdXRlZH0gPSBtZXRob2RLZXlDb21wdXRlZCh0aGlzLnN5bWJvbClcblx0XHRyZXR1cm4gbmV3IE1ldGhvZERlZmluaXRpb24oa2V5LCB2YWx1ZSwgJ3NldCcsIGlzU3RhdGljLCBjb21wdXRlZClcblx0fSxcblxuXHROdW1iZXJMaXRlcmFsKCkge1xuXHRcdC8vIE5lZ2F0aXZlIG51bWJlcnMgYXJlIG5vdCBwYXJ0IG9mIEVTIHNwZWMuXG5cdFx0Ly8gaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzUuMS8jc2VjLTcuOC4zXG5cdFx0Y29uc3QgdmFsdWUgPSBOdW1iZXIodGhpcy52YWx1ZSlcblx0XHRjb25zdCBsaXQgPSBuZXcgTGl0ZXJhbChNYXRoLmFicyh2YWx1ZSkpXG5cdFx0Y29uc3QgaXNQb3NpdGl2ZSA9IHZhbHVlID49IDAgJiYgMSAvIHZhbHVlICE9PSAtSW5maW5pdHlcblx0XHRyZXR1cm4gaXNQb3NpdGl2ZSA/IGxpdCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJy0nLCBsaXQpXG5cdH0sXG5cblx0TG9jYWxBY2Nlc3MoKSB7XG5cdFx0aWYgKHRoaXMubmFtZSA9PT0gJ3RoaXMnKVxuXHRcdFx0cmV0dXJuIGlzSW5Db25zdHJ1Y3RvciA/IG5ldyBUaGlzRXhwcmVzc2lvbigpIDogSWRMZXhpY2FsVGhpc1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgbGQgPSB2ZXJpZnlSZXN1bHRzLmxvY2FsRGVjbGFyZUZvckFjY2Vzcyh0aGlzKVxuXHRcdFx0Ly8gSWYgbGQgbWlzc2luZywgdGhpcyBpcyBhIGJ1aWx0aW4sIGFuZCBidWlsdGlucyBhcmUgbmV2ZXIgbGF6eVxuXHRcdFx0cmV0dXJuIGxkID09PSB1bmRlZmluZWQgPyBpZGVudGlmaWVyKHRoaXMubmFtZSkgOiBhY2Nlc3NMb2NhbERlY2xhcmUobGQpXG5cdFx0fVxuXHR9LFxuXG5cdExvY2FsRGVjbGFyZSgpIHsgcmV0dXJuIG5ldyBJZGVudGlmaWVyKGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzKS5uYW1lKSB9LFxuXG5cdExvY2FsTXV0YXRlKCkge1xuXHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBpZGVudGlmaWVyKHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdExvZ2ljKCkge1xuXHRcdGNvbnN0IG9wID0gdGhpcy5raW5kID09PSBMb2dpY3MuQW5kID8gJyYmJyA6ICd8fCdcblx0XHRyZXR1cm4gdGFpbCh0aGlzLmFyZ3MpLnJlZHVjZSgoYSwgYikgPT5cblx0XHRcdG5ldyBMb2dpY2FsRXhwcmVzc2lvbihvcCwgYSwgdDAoYikpLCB0MCh0aGlzLmFyZ3NbMF0pKVxuXHR9LFxuXG5cdE1hcEVudHJ5KCkgeyByZXR1cm4gbXNTZXRTdWIoSWRCdWlsdCwgdDAodGhpcy5rZXkpLCB0MCh0aGlzLnZhbCkpIH0sXG5cblx0TWVtYmVyKCkge1xuXHRcdHJldHVybiBtZW1iZXJTdHJpbmdPclZhbCh0MCh0aGlzLm9iamVjdCksIHRoaXMubmFtZSlcblx0fSxcblxuXHRNZW1iZXJGdW4oKSB7XG5cdFx0Y29uc3QgbmFtZSA9IHR5cGVvZiB0aGlzLm5hbWUgPT09ICdzdHJpbmcnID8gbmV3IExpdGVyYWwodGhpcy5uYW1lKSA6IHQwKHRoaXMubmFtZSlcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BPYmplY3QsXG5cdFx0XHRfID0+IG1zTWV0aG9kQm91bmQodDAoXyksIG5hbWUpLFxuXHRcdFx0KCkgPT4gbXNNZXRob2RVbmJvdW5kKG5hbWUpKVxuXHR9LFxuXG5cdE1lbWJlclNldCgpIHtcblx0XHRjb25zdCBvYmogPSB0MCh0aGlzLm9iamVjdClcblx0XHRjb25zdCBuYW1lID0gKCkgPT5cblx0XHRcdHR5cGVvZiB0aGlzLm5hbWUgPT09ICdzdHJpbmcnID8gbmV3IExpdGVyYWwodGhpcy5uYW1lKSA6IHQwKHRoaXMubmFtZSlcblx0XHRjb25zdCB2YWwgPSBtYXliZVdyYXBJbkNoZWNrQ29udGFpbnModDAodGhpcy52YWx1ZSksIHRoaXMub3BUeXBlLCB0aGlzLm5hbWUpXG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU2V0dGVycy5Jbml0OlxuXHRcdFx0XHRyZXR1cm4gbXNOZXdQcm9wZXJ0eShvYmosIG5hbWUoKSwgdmFsKVxuXHRcdFx0Y2FzZSBTZXR0ZXJzLkluaXRNdXRhYmxlOlxuXHRcdFx0XHRyZXR1cm4gbXNOZXdNdXRhYmxlUHJvcGVydHkob2JqLCBuYW1lKCksIHZhbClcblx0XHRcdGNhc2UgU2V0dGVycy5NdXRhdGU6XG5cdFx0XHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXJTdHJpbmdPclZhbChvYmosIHRoaXMubmFtZSksIHZhbClcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcigpXG5cdFx0fVxuXHR9LFxuXG5cdE1vZHVsZTogdHJhbnNwaWxlTW9kdWxlLFxuXG5cdE1vZHVsZUV4cG9ydE5hbWVkKCkge1xuXHRcdHJldHVybiB0MSh0aGlzLmFzc2lnbiwgdmFsID0+XG5cdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRFeHBvcnRzLCB0aGlzLmFzc2lnbi5hc3NpZ25lZS5uYW1lKSwgdmFsKSlcblx0fSxcblxuXHRNb2R1bGVFeHBvcnREZWZhdWx0KCkge1xuXHRcdHJldHVybiB0MSh0aGlzLmFzc2lnbiwgdmFsID0+IG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIEV4cG9ydHNEZWZhdWx0LCB2YWwpKVxuXHR9LFxuXG5cdE5ldygpIHtcblx0XHRjb25zdCBhbnlTcGxhdCA9IHRoaXMuYXJncy5zb21lKF8gPT4gXyBpbnN0YW5jZW9mIFNwbGF0KVxuXHRcdGNoZWNrKCFhbnlTcGxhdCwgdGhpcy5sb2MsICdUT0RPOiBTcGxhdCBwYXJhbXMgZm9yIG5ldycpXG5cdFx0cmV0dXJuIG5ldyBOZXdFeHByZXNzaW9uKHQwKHRoaXMudHlwZSksIHRoaXMuYXJncy5tYXAodDApKVxuXHR9LFxuXG5cdE5vdCgpIHsgcmV0dXJuIG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCB0MCh0aGlzLmFyZykpIH0sXG5cblx0T2JqRW50cnlBc3NpZ24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuYXNzaWduIGluc3RhbmNlb2YgQXNzaWduU2luZ2xlICYmICF0aGlzLmFzc2lnbi5hc3NpZ25lZS5pc0xhenkoKSA/XG5cdFx0XHR0MSh0aGlzLmFzc2lnbiwgdmFsID0+XG5cdFx0XHRcdG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlcihJZEJ1aWx0LCB0aGlzLmFzc2lnbi5hc3NpZ25lZS5uYW1lKSwgdmFsKSkgOlxuXHRcdFx0Y2F0KFxuXHRcdFx0XHR0MCh0aGlzLmFzc2lnbiksXG5cdFx0XHRcdHRoaXMuYXNzaWduLmFsbEFzc2lnbmVlcygpLm1hcChfID0+XG5cdFx0XHRcdFx0bXNTZXRMYXp5KElkQnVpbHQsIG5ldyBMaXRlcmFsKF8ubmFtZSksIGlkRm9yRGVjbGFyZUNhY2hlZChfKSkpKVxuXHR9LFxuXG5cdE9iakVudHJ5UGxhaW4oKSB7XG5cdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlclN0cmluZ09yVmFsKElkQnVpbHQsIHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdE9ialNpbXBsZSgpIHtcblx0XHRyZXR1cm4gbmV3IE9iamVjdEV4cHJlc3Npb24odGhpcy5wYWlycy5tYXAocGFpciA9PlxuXHRcdFx0bmV3IFByb3BlcnR5KCdpbml0JywgcHJvcGVydHlJZE9yTGl0ZXJhbChwYWlyLmtleSksIHQwKHBhaXIudmFsdWUpKSkpXG5cdH0sXG5cblx0UXVvdGVQbGFpbigpIHtcblx0XHRpZiAodGhpcy5wYXJ0cy5sZW5ndGggPT09IDApXG5cdFx0XHRyZXR1cm4gTGl0RW1wdHlTdHJpbmdcblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IHF1YXNpcyA9IFtdLCBleHByZXNzaW9ucyA9IFtdXG5cblx0XHRcdC8vIFRlbXBsYXRlTGl0ZXJhbCBtdXN0IHN0YXJ0IHdpdGggYSBUZW1wbGF0ZUVsZW1lbnRcblx0XHRcdGlmICh0eXBlb2YgdGhpcy5wYXJ0c1swXSAhPT0gJ3N0cmluZycpXG5cdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5lbXB0eSlcblxuXHRcdFx0Zm9yIChsZXQgcGFydCBvZiB0aGlzLnBhcnRzKVxuXHRcdFx0XHRpZiAodHlwZW9mIHBhcnQgPT09ICdzdHJpbmcnKVxuXHRcdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5mb3JSYXdTdHJpbmcocGFydCkpXG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdC8vIFwiezF9ezF9XCIgbmVlZHMgYW4gZW1wdHkgcXVhc2kgaW4gdGhlIG1pZGRsZSAoYW5kIG9uIHRoZSBlbmRzKVxuXHRcdFx0XHRcdGlmIChxdWFzaXMubGVuZ3RoID09PSBleHByZXNzaW9ucy5sZW5ndGgpXG5cdFx0XHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZW1wdHkpXG5cdFx0XHRcdFx0ZXhwcmVzc2lvbnMucHVzaCh0MChwYXJ0KSlcblx0XHRcdFx0fVxuXG5cdFx0XHQvLyBUZW1wbGF0ZUxpdGVyYWwgbXVzdCBlbmQgd2l0aCBhIFRlbXBsYXRlRWxlbWVudCwgc28gb25lIG1vcmUgcXVhc2kgdGhhbiBleHByZXNzaW9uLlxuXHRcdFx0aWYgKHF1YXNpcy5sZW5ndGggPT09IGV4cHJlc3Npb25zLmxlbmd0aClcblx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmVtcHR5KVxuXG5cdFx0XHRyZXR1cm4gbmV3IFRlbXBsYXRlTGl0ZXJhbChxdWFzaXMsIGV4cHJlc3Npb25zKVxuXHRcdH1cblx0fSxcblxuXHRRdW90ZVNpbXBsZSgpIHtcblx0XHRyZXR1cm4gbmV3IExpdGVyYWwodGhpcy5uYW1lKVxuXHR9LFxuXG5cdFF1b3RlVGFnZ2VkVGVtcGxhdGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBUYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb24odDAodGhpcy50YWcpLCB0MCh0aGlzLnF1b3RlKSlcblx0fSxcblxuXHRSYW5nZSgpIHtcblx0XHRjb25zdCBlbmQgPSBpZkVsc2UodGhpcy5lbmQsIHQwLCAoKSA9PiBHbG9iYWxJbmZpbml0eSlcblx0XHRyZXR1cm4gbXNSYW5nZSh0MCh0aGlzLnN0YXJ0KSwgZW5kLCBuZXcgTGl0ZXJhbCh0aGlzLmlzRXhjbHVzaXZlKSlcblx0fSxcblxuXHRTZXRTdWIoKSB7XG5cdFx0Y29uc3QgZ2V0S2luZCA9ICgpID0+IHtcblx0XHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRcdGNhc2UgU2V0dGVycy5Jbml0OlxuXHRcdFx0XHRcdHJldHVybiAnaW5pdCdcblx0XHRcdFx0Y2FzZSBTZXR0ZXJzLkluaXRNdXRhYmxlOlxuXHRcdFx0XHRcdHJldHVybiAnaW5pdC1tdXRhYmxlJ1xuXHRcdFx0XHRjYXNlIFNldHRlcnMuTXV0YXRlOlxuXHRcdFx0XHRcdHJldHVybiAnbXV0YXRlJ1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNvbnN0IGtpbmQgPSBnZXRLaW5kKClcblx0XHRyZXR1cm4gbXNTZXRTdWIoXG5cdFx0XHR0MCh0aGlzLm9iamVjdCksXG5cdFx0XHR0aGlzLnN1YmJlZHMubGVuZ3RoID09PSAxID8gdDAodGhpcy5zdWJiZWRzWzBdKSA6IHRoaXMuc3ViYmVkcy5tYXAodDApLFxuXHRcdFx0bWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHQwKHRoaXMudmFsdWUpLCB0aGlzLm9wVHlwZSwgJ3ZhbHVlJyksXG5cdFx0XHRuZXcgTGl0ZXJhbChraW5kKSlcblx0fSxcblxuXHRTcGVjaWFsRG8oKSB7XG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU3BlY2lhbERvcy5EZWJ1Z2dlcjogcmV0dXJuIG5ldyBEZWJ1Z2dlclN0YXRlbWVudCgpXG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IodGhpcy5raW5kKVxuXHRcdH1cblx0fSxcblxuXHRTcGVjaWFsVmFsKCkge1xuXHRcdC8vIE1ha2UgbmV3IG9iamVjdHMgYmVjYXVzZSB3ZSB3aWxsIGFzc2lnbiBgbG9jYCB0byB0aGVtLlxuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLkNvbnRhaW5zOlxuXHRcdFx0XHRyZXR1cm4gbWVtYmVyKElkTXMsICdjb250YWlucycpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLkRlbFN1Yjpcblx0XHRcdFx0cmV0dXJuIG1lbWJlcihJZE1zLCAnZGVsU3ViJylcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuRmFsc2U6XG5cdFx0XHRcdHJldHVybiBuZXcgTGl0ZXJhbChmYWxzZSlcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuTmFtZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKHZlcmlmeVJlc3VsdHMubmFtZSh0aGlzKSlcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuTnVsbDpcblx0XHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKG51bGwpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLlNldFN1Yjpcblx0XHRcdFx0cmV0dXJuIG1lbWJlcihJZE1zLCAnc2V0U3ViJylcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuU3ViOlxuXHRcdFx0XHRyZXR1cm4gbWVtYmVyKElkTXMsICdzdWInKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5UcnVlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IExpdGVyYWwodHJ1ZSlcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuVW5kZWZpbmVkOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFVuYXJ5RXhwcmVzc2lvbigndm9pZCcsIExpdFplcm8pXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IodGhpcy5raW5kKVxuXHRcdH1cblx0fSxcblxuXHRTcGxhdCgpIHtcblx0XHRyZXR1cm4gbmV3IFNwcmVhZEVsZW1lbnQodDAodGhpcy5zcGxhdHRlZCkpXG5cdH0sXG5cblx0U3VwZXJDYWxsOiBzdXBlckNhbGwsXG5cdFN1cGVyQ2FsbERvOiBzdXBlckNhbGwsXG5cdFN1cGVyTWVtYmVyKCkge1xuXHRcdHJldHVybiBtZW1iZXJTdHJpbmdPclZhbChJZFN1cGVyLCB0aGlzLm5hbWUpXG5cdH0sXG5cblx0U3dpdGNoRG8oKSB7IHJldHVybiB0cmFuc3BpbGVTd2l0Y2godGhpcykgfSxcblx0U3dpdGNoVmFsKCkgeyByZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChbdHJhbnNwaWxlU3dpdGNoKHRoaXMpXSkpIH0sXG5cdFN3aXRjaERvUGFydDogc3dpdGNoUGFydCxcblx0U3dpdGNoVmFsUGFydDogc3dpdGNoUGFydCxcblxuXHRUaHJvdygpIHtcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BUaHJvd24sXG5cdFx0XHRfID0+IGRvVGhyb3coXyksXG5cdFx0XHQoKSA9PiBuZXcgVGhyb3dTdGF0ZW1lbnQobmV3IE5ld0V4cHJlc3Npb24oR2xvYmFsRXJyb3IsIFtMaXRTdHJUaHJvd10pKSlcblx0fSxcblxuXHRXaXRoKCkge1xuXHRcdGNvbnN0IGlkRGVjbGFyZSA9IGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzLmRlY2xhcmUpXG5cdFx0Y29uc3QgYmxvY2sgPSB0Myh0aGlzLmJsb2NrLCBudWxsLCBudWxsLCBuZXcgUmV0dXJuU3RhdGVtZW50KGlkRGVjbGFyZSkpXG5cdFx0Y29uc3QgZnVuID0gaXNJbkdlbmVyYXRvciA/XG5cdFx0XHRuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFtpZERlY2xhcmVdLCBibG9jaywgdHJ1ZSkgOlxuXHRcdFx0bmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKFtpZERlY2xhcmVdLCBibG9jaylcblx0XHRjb25zdCBjYWxsID0gbmV3IENhbGxFeHByZXNzaW9uKGZ1biwgW3QwKHRoaXMudmFsdWUpXSlcblx0XHRyZXR1cm4gaXNJbkdlbmVyYXRvciA/IG5ldyBZaWVsZEV4cHJlc3Npb24oY2FsbCwgdHJ1ZSkgOiBjYWxsXG5cdH0sXG5cblx0WWllbGQoKSB7IHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKG9wTWFwKHRoaXMub3BZaWVsZGVkLCB0MCksIGZhbHNlKSB9LFxuXG5cdFlpZWxkVG8oKSB7IHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKHQwKHRoaXMueWllbGRlZFRvKSwgdHJ1ZSkgfVxufSlcblxuLy8gU2hhcmVkIGltcGxlbWVudGF0aW9uc1xuXG5mdW5jdGlvbiBjYXNlUGFydChhbHRlcm5hdGUpIHtcblx0aWYgKHRoaXMudGVzdCBpbnN0YW5jZW9mIFBhdHRlcm4pIHtcblx0XHRjb25zdCB7dHlwZSwgcGF0dGVybmVkLCBsb2NhbHN9ID0gdGhpcy50ZXN0XG5cdFx0Y29uc3QgZGVjbCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRFeHRyYWN0LCBtc0V4dHJhY3QodDAodHlwZSksIHQwKHBhdHRlcm5lZCkpKV0pXG5cdFx0Y29uc3QgdGVzdCA9IG5ldyBCaW5hcnlFeHByZXNzaW9uKCchPT0nLCBJZEV4dHJhY3QsIExpdE51bGwpXG5cdFx0Y29uc3QgZXh0cmFjdCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIGxvY2Fscy5tYXAoKF8sIGlkeCkgPT5cblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoXG5cdFx0XHRcdGlkRm9yRGVjbGFyZUNhY2hlZChfKSxcblx0XHRcdFx0bmV3IE1lbWJlckV4cHJlc3Npb24oSWRFeHRyYWN0LCBuZXcgTGl0ZXJhbChpZHgpKSkpKVxuXHRcdGNvbnN0IHJlcyA9IHQxKHRoaXMucmVzdWx0LCBleHRyYWN0KVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoW2RlY2wsIG5ldyBJZlN0YXRlbWVudCh0ZXN0LCByZXMsIGFsdGVybmF0ZSldKVxuXHR9IGVsc2Vcblx0XHQvLyBhbHRlcm5hdGUgd3JpdHRlbiB0byBieSBgY2FzZUJvZHlgLlxuXHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQodDAodGhpcy50ZXN0KSwgdDAodGhpcy5yZXN1bHQpLCBhbHRlcm5hdGUpXG59XG5cbmZ1bmN0aW9uIHN1cGVyQ2FsbCgpIHtcblx0Y29uc3QgYXJncyA9IHRoaXMuYXJncy5tYXAodDApXG5cdGNvbnN0IG1ldGhvZCA9IHZlcmlmeVJlc3VsdHMuc3VwZXJDYWxsVG9NZXRob2QuZ2V0KHRoaXMpXG5cblx0aWYgKG1ldGhvZCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB7XG5cdFx0Y29uc3QgY2FsbCA9IG5ldyBDYWxsRXhwcmVzc2lvbihJZFN1cGVyLCBhcmdzKVxuXHRcdGNvbnN0IG1lbWJlclNldHMgPSBjb25zdHJ1Y3RvclNldE1lbWJlcnMobWV0aG9kKVxuXHRcdHJldHVybiBjYXQoY2FsbCwgbWVtYmVyU2V0cylcblx0fSBlbHNlXG5cdFx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbihtZW1iZXJTdHJpbmdPclZhbChJZFN1cGVyLCBtZXRob2Quc3ltYm9sKSwgYXJncylcbn1cblxuZnVuY3Rpb24gc3dpdGNoUGFydCgpIHtcblx0Y29uc3QgZm9sbG93ID0gb3BJZih0aGlzIGluc3RhbmNlb2YgU3dpdGNoRG9QYXJ0LCAoKSA9PiBuZXcgQnJlYWtTdGF0ZW1lbnQpXG5cdC8qXG5cdFdlIGNvdWxkIGp1c3QgcGFzcyBibG9jay5ib2R5IGZvciB0aGUgc3dpdGNoIGxpbmVzLCBidXQgaW5zdGVhZFxuXHRlbmNsb3NlIHRoZSBib2R5IG9mIHRoZSBzd2l0Y2ggY2FzZSBpbiBjdXJseSBicmFjZXMgdG8gZW5zdXJlIGEgbmV3IHNjb3BlLlxuXHRUaGF0IHdheSB0aGlzIGNvZGUgd29ya3M6XG5cdFx0c3dpdGNoICgwKSB7XG5cdFx0XHRjYXNlIDA6IHtcblx0XHRcdFx0Y29uc3QgYSA9IDBcblx0XHRcdFx0cmV0dXJuIGFcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0Ly8gV2l0aG91dCBjdXJseSBicmFjZXMgdGhpcyB3b3VsZCBjb25mbGljdCB3aXRoIHRoZSBvdGhlciBgYWAuXG5cdFx0XHRcdGNvbnN0IGEgPSAxXG5cdFx0XHRcdGFcblx0XHRcdH1cblx0XHR9XG5cdCovXG5cdGNvbnN0IGJsb2NrID0gdDModGhpcy5yZXN1bHQsIG51bGwsIG51bGwsIGZvbGxvdylcblx0Ly8gSWYgc3dpdGNoIGhhcyBtdWx0aXBsZSB2YWx1ZXMsIGJ1aWxkIHVwIGEgc3RhdGVtZW50IGxpa2U6IGBjYXNlIDE6IGNhc2UgMjogeyBkb0Jsb2NrKCkgfWBcblx0Y29uc3QgeCA9IFtdXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy52YWx1ZXMubGVuZ3RoIC0gMTsgaSA9IGkgKyAxKVxuXHRcdC8vIFRoZXNlIGNhc2VzIGZhbGx0aHJvdWdoIHRvIHRoZSBvbmUgYXQgdGhlIGVuZC5cblx0XHR4LnB1c2gobmV3IFN3aXRjaENhc2UodDAodGhpcy52YWx1ZXNbaV0pLCBbXSkpXG5cdHgucHVzaChuZXcgU3dpdGNoQ2FzZSh0MCh0aGlzLnZhbHVlc1t0aGlzLnZhbHVlcy5sZW5ndGggLSAxXSksIFtibG9ja10pKVxuXHRyZXR1cm4geFxufVxuXG4vLyBGdW5jdGlvbnMgc3BlY2lmaWMgdG8gY2VydGFpbiBleHByZXNzaW9uc1xuXG4vLyBXcmFwcyBhIGJsb2NrICh3aXRoIGByZXR1cm5gIHN0YXRlbWVudHMgaW4gaXQpIGluIGFuIElJRkUuXG5mdW5jdGlvbiBibG9ja1dyYXAoYmxvY2spIHtcblx0Y29uc3QgaW52b2tlID0gbmV3IENhbGxFeHByZXNzaW9uKGZ1bmN0aW9uRXhwcmVzc2lvblRodW5rKGJsb2NrLCBpc0luR2VuZXJhdG9yKSwgW10pXG5cdHJldHVybiBpc0luR2VuZXJhdG9yID8gbmV3IFlpZWxkRXhwcmVzc2lvbihpbnZva2UsIHRydWUpIDogaW52b2tlXG59XG5cbmZ1bmN0aW9uIGNhc2VCb2R5KHBhcnRzLCBvcEVsc2UpIHtcblx0bGV0IGFjYyA9IGlmRWxzZShvcEVsc2UsIHQwLCAoKSA9PiBUaHJvd05vQ2FzZU1hdGNoKVxuXHRmb3IgKGxldCBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpID0gaSAtIDEpXG5cdFx0YWNjID0gdDEocGFydHNbaV0sIGFjYylcblx0cmV0dXJuIGFjY1xufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RvclNldE1lbWJlcnMoY29uc3RydWN0b3IpIHtcblx0cmV0dXJuIGNvbnN0cnVjdG9yLm1lbWJlckFyZ3MubWFwKF8gPT5cblx0XHRtc05ld1Byb3BlcnR5KG5ldyBUaGlzRXhwcmVzc2lvbigpLCBuZXcgTGl0ZXJhbChfLm5hbWUpLCBpZEZvckRlY2xhcmVDYWNoZWQoXykpKVxufVxuXG5mdW5jdGlvbiBmb3JMb29wKG9wSXRlcmF0ZWUsIGJsb2NrKSB7XG5cdHJldHVybiBpZkVsc2Uob3BJdGVyYXRlZSxcblx0XHQoe2VsZW1lbnQsIGJhZ30pID0+IHtcblx0XHRcdGNvbnN0IGRlY2xhcmUgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignbGV0Jyxcblx0XHRcdFx0W25ldyBWYXJpYWJsZURlY2xhcmF0b3IodDAoZWxlbWVudCkpXSlcblx0XHRcdHJldHVybiBuZXcgRm9yT2ZTdGF0ZW1lbnQoZGVjbGFyZSwgdDAoYmFnKSwgdDAoYmxvY2spKVxuXHRcdH0sXG5cdFx0KCkgPT4gbmV3IEZvclN0YXRlbWVudChudWxsLCBudWxsLCBudWxsLCB0MChibG9jaykpKVxufVxuXG5mdW5jdGlvbiBtZXRob2RLZXlDb21wdXRlZChzeW1ib2wpIHtcblx0aWYgKHR5cGVvZiBzeW1ib2wgPT09ICdzdHJpbmcnKVxuXHRcdHJldHVybiB7a2V5OiBwcm9wZXJ0eUlkT3JMaXRlcmFsKHN5bWJvbCksIGNvbXB1dGVkOiBmYWxzZX1cblx0ZWxzZSB7XG5cdFx0Y29uc3Qga2V5ID0gc3ltYm9sIGluc3RhbmNlb2YgUXVvdGVBYnN0cmFjdCA/IHQwKHN5bWJvbCkgOiBtc1N5bWJvbCh0MChzeW1ib2wpKVxuXHRcdHJldHVybiB7a2V5LCBjb21wdXRlZDogdHJ1ZX1cblx0fVxufVxuXG5mdW5jdGlvbiB0cmFuc3BpbGVCbG9jayhyZXR1cm5lZCwgbGluZXMsIGxlYWQsIG9wUmV0dXJuVHlwZSkge1xuXHRjb25zdCBmaW4gPSBuZXcgUmV0dXJuU3RhdGVtZW50KFxuXHRcdG1heWJlV3JhcEluQ2hlY2tDb250YWlucyhyZXR1cm5lZCwgb3BSZXR1cm5UeXBlLCAncmV0dXJuZWQgdmFsdWUnKSlcblx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgbGluZXMsIGZpbikpXG59XG5cbmZ1bmN0aW9uIHRyYW5zcGlsZUV4Y2VwdChleGNlcHQpIHtcblx0cmV0dXJuIG5ldyBUcnlTdGF0ZW1lbnQoXG5cdFx0dDAoZXhjZXB0LnRyeSksXG5cdFx0b3BNYXAoZXhjZXB0LmNhdGNoLCB0MCksXG5cdFx0b3BNYXAoZXhjZXB0LmZpbmFsbHksIHQwKSlcbn1cblxuZnVuY3Rpb24gdHJhbnNwaWxlU3dpdGNoKF8pIHtcblx0Y29uc3QgcGFydHMgPSBmbGF0TWFwKF8ucGFydHMsIHQwKVxuXHRwYXJ0cy5wdXNoKGlmRWxzZShfLm9wRWxzZSxcblx0XHRfID0+IG5ldyBTd2l0Y2hDYXNlKHVuZGVmaW5lZCwgdDAoXykuYm9keSksXG5cdFx0KCkgPT4gU3dpdGNoQ2FzZU5vTWF0Y2gpKVxuXHRyZXR1cm4gbmV3IFN3aXRjaFN0YXRlbWVudCh0MChfLnN3aXRjaGVkKSwgcGFydHMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycyhhc3NpZ25lZXMsIGlzTGF6eSwgdmFsdWUsIGlzTW9kdWxlKSB7XG5cdGNvbnN0IGRlc3RydWN0dXJlZE5hbWUgPSBgXyQke25leHREZXN0cnVjdHVyZWRJZH1gXG5cdG5leHREZXN0cnVjdHVyZWRJZCA9IG5leHREZXN0cnVjdHVyZWRJZCArIDFcblx0Y29uc3QgaWREZXN0cnVjdHVyZWQgPSBuZXcgSWRlbnRpZmllcihkZXN0cnVjdHVyZWROYW1lKVxuXHRjb25zdCBkZWNsYXJhdG9ycyA9IGFzc2lnbmVlcy5tYXAoYXNzaWduZWUgPT4ge1xuXHRcdC8vIFRPRE86IERvbid0IGNvbXBpbGUgaXQgaWYgaXQncyBuZXZlciBhY2Nlc3NlZFxuXHRcdGNvbnN0IGdldCA9IGdldE1lbWJlcihpZERlc3RydWN0dXJlZCwgYXNzaWduZWUubmFtZSwgaXNMYXp5LCBpc01vZHVsZSlcblx0XHRyZXR1cm4gbWFrZURlY2xhcmF0b3IoYXNzaWduZWUsIGdldCwgaXNMYXp5KVxuXHR9KVxuXHQvLyBHZXR0aW5nIGxhenkgbW9kdWxlIGlzIGRvbmUgYnkgbXMubGF6eUdldE1vZHVsZS5cblx0Y29uc3QgdmFsID0gaXNMYXp5ICYmICFpc01vZHVsZSA/IGxhenlXcmFwKHZhbHVlKSA6IHZhbHVlXG5cdHJldHVybiBjYXQobmV3IFZhcmlhYmxlRGVjbGFyYXRvcihpZERlc3RydWN0dXJlZCwgdmFsKSwgZGVjbGFyYXRvcnMpXG59XG4iXX0=
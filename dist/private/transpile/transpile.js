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

			const body = (0, _util2.t2)(this.block, lead, this.opReturnType);
			const args = this.args.map(_util2.t0);
			isInGenerator = oldInGenerator;
			const id = (0, _util.opMap)(verifyResults.opName(this), _esastDistUtil.identifier);

			switch (this.kind) {
				case _MsAst.Funs.Plain:
					// TODO:ES6 Should be able to use rest args in arrow function
					if (id === null && this.opDeclareThis === null && opDeclareRest === null) return new _esastDistAst.ArrowFunctionExpression(args, body);else return new _esastDistAst.FunctionExpression(id, args, body);
				case _MsAst.Funs.Async:
					{
						const newBody = new _esastDistAst.BlockStatement([new _esastDistAst.ReturnStatement((0, _msCall.msAsync)(new _esastDistAst.FunctionExpression(id, [], body, true)))]);
						return new _esastDistAst.FunctionExpression(id, args, newBody);
					}
				case _MsAst.Funs.Generator:
					return new _esastDistAst.FunctionExpression(id, args, body, true);
				default:
					throw new Error(this.kind);
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

		ThisFun() {
			// this.{name}.bind(this)
			const fun = (0, _esastDistUtil.member)(_astConstants.IdLexicalThis, this.name);
			return new _esastDistAst.CallExpression((0, _esastDistUtil.member)(fun, 'bind'), [_astConstants.IdLexicalThis]);
		},

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQWdDd0IsU0FBUzs7Ozs7Ozs7O0FBTjFCLEtBQUksYUFBYSxDQUFBOzs7QUFFeEIsS0FBSSxhQUFhLEVBQUUsZUFBZSxDQUFBO0FBQ2xDLEtBQUksa0JBQWtCLENBQUE7Ozs7QUFHUCxVQUFTLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLEVBQUU7QUFDbkUsVUFQVSxhQUFhLEdBT3ZCLGFBQWEsR0FBRyxjQUFjLENBQUE7QUFDOUIsZUFBYSxHQUFHLEtBQUssQ0FBQTtBQUNyQixpQkFBZSxHQUFHLEtBQUssQ0FBQTtBQUN2QixvQkFBa0IsR0FBRyxDQUFDLENBQUE7QUFDdEIsUUFBTSxHQUFHLEdBQUcsV0FkNkQsRUFBRSxFQWM1RCxnQkFBZ0IsQ0FBQyxDQUFBOztBQUVoQyxVQWJVLGFBQWEsR0FhdkIsYUFBYSxHQUFHLElBQUksQ0FBQTtBQUNwQixTQUFPLEdBQUcsQ0FBQTtFQUNWOztBQUVELFdBOUJpRCxhQUFhLFVBOEJwQyxXQUFXLEVBQUU7QUFDdEMsUUFBTSxHQUFHO0FBQ1IsU0FBTSxRQUFRLEdBQUcsTUFBTTtBQUN0QixVQUFNLElBQUksR0FBRyxXQXZCMEQsRUFBRSxFQXVCekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQy9CLFdBQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsa0JBekNxQixlQUFlLENBeUNoQixHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDMUQsQ0FBQTs7QUFFRCxVQUFPLFVBckNnQyxNQUFNLEVBcUMvQixJQUFJLENBQUMsUUFBUSxFQUMxQixDQUFDLElBQUksa0JBaERLLFdBQVcsQ0FnREEsUUFBUSxFQUFFLEVBQUUsV0E3QkMsT0FBTyxFQTZCQSxDQUFDLENBQUMsQ0FBQyxFQUM1QyxNQUFNO0FBQ0wsUUFBSSxJQUFJLENBQUMsU0FB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QyxDQUFBO0FBQzFCLFNBQU8sa0JBNW5CUCxlQUFlLENBNG5CWSxXQTFtQjhDLEVBQUUsRUEwbUI3QyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUE7RUFDakQ7O0FBRU0sVUFBUywwQkFBMEIsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUU7QUFDOUUsUUFBTSxnQkFBZ0IsR0FBRyxDQUFDLEVBQUUsR0FBRSxrQkFBa0IsRUFBQyxDQUFDLENBQUE7QUFDbEQsb0JBQWtCLEdBQUcsa0JBQWtCLEdBQUcsQ0FBQyxDQUFBO0FBQzNDLFFBQU0sY0FBYyxHQUFHLGtCQXBvQnZCLFVBQVUsQ0Fvb0I0QixnQkFBZ0IsQ0FBQyxDQUFBO0FBQ3ZELFFBQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJOztBQUU3QyxTQUFNLEdBQUcsR0FBRyxXQXBuQmdDLFNBQVMsRUFvbkIvQixjQUFjLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7QUFDdEUsVUFBTyxXQXJuQm9FLGNBQWMsRUFxbkJuRSxRQUFRLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0dBQzVDLENBQUMsQ0FBQTs7QUFFRixRQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLEdBQUcsWUE1bkJyQixRQUFRLEVBNG5Cc0IsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFBO0FBQ3pELFNBQU8sVUFsb0JRLEdBQUcsRUFrb0JQLGtCQXpvQnlELGtCQUFrQixDQXlvQnBELGNBQWMsRUFBRSxHQUFHLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQTtFQUNwRSIsImZpbGUiOiJ0cmFuc3BpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FycmF5RXhwcmVzc2lvbiwgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24sIEFzc2lnbm1lbnRFeHByZXNzaW9uLCBCaW5hcnlFeHByZXNzaW9uLFxuXHRCbG9ja1N0YXRlbWVudCwgQnJlYWtTdGF0ZW1lbnQsIENhbGxFeHByZXNzaW9uLCBDYXRjaENsYXVzZSwgQ2xhc3NCb2R5LCBDbGFzc0V4cHJlc3Npb24sXG5cdENvbmRpdGlvbmFsRXhwcmVzc2lvbiwgRGVidWdnZXJTdGF0ZW1lbnQsIEZvck9mU3RhdGVtZW50LCBGb3JTdGF0ZW1lbnQsIEZ1bmN0aW9uRXhwcmVzc2lvbixcblx0SWRlbnRpZmllciwgSWZTdGF0ZW1lbnQsIExpdGVyYWwsIExvZ2ljYWxFeHByZXNzaW9uLCBNZW1iZXJFeHByZXNzaW9uLCBNZXRob2REZWZpbml0aW9uLFxuXHROZXdFeHByZXNzaW9uLCBPYmplY3RFeHByZXNzaW9uLCBQcm9wZXJ0eSwgUmV0dXJuU3RhdGVtZW50LCBTcHJlYWRFbGVtZW50LCBTd2l0Y2hDYXNlLFxuXHRTd2l0Y2hTdGF0ZW1lbnQsIFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbiwgVGVtcGxhdGVFbGVtZW50LCBUZW1wbGF0ZUxpdGVyYWwsIFRoaXNFeHByZXNzaW9uLFxuXHRUaHJvd1N0YXRlbWVudCwgVHJ5U3RhdGVtZW50LCBWYXJpYWJsZURlY2xhcmF0aW9uLCBVbmFyeUV4cHJlc3Npb24sIFZhcmlhYmxlRGVjbGFyYXRvcixcblx0WWllbGRFeHByZXNzaW9ufSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7ZnVuY3Rpb25FeHByZXNzaW9uVGh1bmssIGlkZW50aWZpZXIsIG1lbWJlciwgcHJvcGVydHlJZE9yTGl0ZXJhbH0gZnJvbSAnZXNhc3QvZGlzdC91dGlsJ1xuaW1wb3J0IHtjaGVjaywgb3B0aW9uc30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCAqIGFzIE1zQXN0VHlwZXMgZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0Fzc2lnblNpbmdsZSwgQ2FsbCwgQ29uc3RydWN0b3IsIEZ1bnMsIExvZ2ljcywgTWVtYmVyLCBMb2NhbERlY2xhcmVzLCBQYXR0ZXJuLCBTcGxhdCxcblx0U2V0dGVycywgU3BlY2lhbERvcywgU3BlY2lhbFZhbHMsIFN3aXRjaERvUGFydCwgUXVvdGVBYnN0cmFjdH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2Fzc2VydCwgY2F0LCBmbGF0TWFwLCBmbGF0T3BNYXAsIGlmRWxzZSwgaW1wbGVtZW50TWFueSwgb3BJZiwgb3BNYXAsIHRhaWx9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0FycmF5U2xpY2VDYWxsLCBEZWNsYXJlQnVpbHRCYWcsIERlY2xhcmVCdWlsdE1hcCwgRGVjbGFyZUJ1aWx0T2JqLCBEZWNsYXJlTGV4aWNhbFRoaXMsXG5cdEV4cG9ydHNEZWZhdWx0LCBJZEFyZ3VtZW50cywgSWRCdWlsdCwgSWRFeHBvcnRzLCBJZEV4dHJhY3QsIElkRm9jdXMsIElkTGV4aWNhbFRoaXMsIElkU3VwZXIsXG5cdEdsb2JhbEVycm9yLCBHbG9iYWxJbmZpbml0eSwgTGl0RW1wdHlTdHJpbmcsIExpdE51bGwsIExpdFN0clRocm93LCBMaXRaZXJvLCBSZXR1cm5CdWlsdCxcblx0U3dpdGNoQ2FzZU5vTWF0Y2gsIFRocm93QXNzZXJ0RmFpbCwgVGhyb3dOb0Nhc2VNYXRjaH0gZnJvbSAnLi9hc3QtY29uc3RhbnRzJ1xuaW1wb3J0IHtJZE1zLCBsYXp5V3JhcCwgbXNBZGQsIG1zQWRkTWFueSwgbXNBc3NlcnQsIG1zQXNzZXJ0TWVtYmVyLCBtc0Fzc2VydE5vdCwgbXNBc3NlcnROb3RNZW1iZXIsXG5cdG1zQXN5bmMsIG1zRXh0cmFjdCwgbXNOZXdNdXRhYmxlUHJvcGVydHksIG1zTmV3UHJvcGVydHksIG1zUmFuZ2UsIG1zU2V0TGF6eSwgbXNTZXRTdWIsIG1zU29tZSxcblx0bXNTeW1ib2wsIE1zTm9uZX0gZnJvbSAnLi9tcy1jYWxsJ1xuaW1wb3J0IHRyYW5zcGlsZU1vZHVsZSBmcm9tICcuL3RyYW5zcGlsZU1vZHVsZSdcbmltcG9ydCB7YWNjZXNzTG9jYWxEZWNsYXJlLCBkZWNsYXJlLCBkb1Rocm93LCBnZXRNZW1iZXIsIGlkRm9yRGVjbGFyZUNhY2hlZCwgbWFrZURlY2xhcmF0b3IsXG5cdG1heWJlV3JhcEluQ2hlY2tDb250YWlucywgbWVtYmVyU3RyaW5nT3JWYWwsIG9wVHlwZUNoZWNrRm9yTG9jYWxEZWNsYXJlLCB0MCwgdDEsIHQyLCB0MywgdExpbmVzXG5cdH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgbGV0IHZlcmlmeVJlc3VsdHNcbi8vIGlzSW5HZW5lcmF0b3IgbWVhbnMgd2UgYXJlIGluIGFuIGFzeW5jIG9yIGdlbmVyYXRvciBmdW5jdGlvbi5cbmxldCBpc0luR2VuZXJhdG9yLCBpc0luQ29uc3RydWN0b3JcbmxldCBuZXh0RGVzdHJ1Y3R1cmVkSWRcblxuLyoqIFRyYW5zZm9ybSBhIHtAbGluayBNc0FzdH0gaW50byBhbiBlc2FzdC4gKiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFuc3BpbGUobW9kdWxlRXhwcmVzc2lvbiwgX3ZlcmlmeVJlc3VsdHMpIHtcblx0dmVyaWZ5UmVzdWx0cyA9IF92ZXJpZnlSZXN1bHRzXG5cdGlzSW5HZW5lcmF0b3IgPSBmYWxzZVxuXHRpc0luQ29uc3RydWN0b3IgPSBmYWxzZVxuXHRuZXh0RGVzdHJ1Y3R1cmVkSWQgPSAwXG5cdGNvbnN0IHJlcyA9IHQwKG1vZHVsZUV4cHJlc3Npb24pXG5cdC8vIFJlbGVhc2UgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cblx0dmVyaWZ5UmVzdWx0cyA9IG51bGxcblx0cmV0dXJuIHJlc1xufVxuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICd0cmFuc3BpbGUnLCB7XG5cdEFzc2VydCgpIHtcblx0XHRjb25zdCBmYWlsQ29uZCA9ICgpID0+IHtcblx0XHRcdGNvbnN0IGNvbmQgPSB0MCh0aGlzLmNvbmRpdGlvbilcblx0XHRcdHJldHVybiB0aGlzLm5lZ2F0ZSA/IGNvbmQgOiBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgY29uZClcblx0XHR9XG5cblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BUaHJvd24sXG5cdFx0XHRfID0+IG5ldyBJZlN0YXRlbWVudChmYWlsQ29uZCgpLCBkb1Rocm93KF8pKSxcblx0XHRcdCgpID0+IHtcblx0XHRcdFx0aWYgKHRoaXMuY29uZGl0aW9uIGluc3RhbmNlb2YgQ2FsbCkge1xuXHRcdFx0XHRcdGNvbnN0IGNhbGwgPSB0aGlzLmNvbmRpdGlvblxuXHRcdFx0XHRcdGNvbnN0IGNhbGxlZCA9IGNhbGwuY2FsbGVkXG5cdFx0XHRcdFx0Y29uc3QgYXJncyA9IGNhbGwuYXJncy5tYXAodDApXG5cdFx0XHRcdFx0aWYgKGNhbGxlZCBpbnN0YW5jZW9mIE1lbWJlcikge1xuXHRcdFx0XHRcdFx0Y29uc3QgYXNzID0gdGhpcy5uZWdhdGUgPyBtc0Fzc2VydE5vdE1lbWJlciA6IG1zQXNzZXJ0TWVtYmVyXG5cdFx0XHRcdFx0XHRyZXR1cm4gYXNzKHQwKGNhbGxlZC5vYmplY3QpLCBuZXcgTGl0ZXJhbChjYWxsZWQubmFtZSksIC4uLmFyZ3MpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnN0IGFzcyA9IHRoaXMubmVnYXRlID8gbXNBc3NlcnROb3QgOiBtc0Fzc2VydFxuXHRcdFx0XHRcdFx0cmV0dXJuIGFzcyh0MChjYWxsZWQpLCAuLi5hcmdzKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudChmYWlsQ29uZCgpLCBUaHJvd0Fzc2VydEZhaWwpXG5cdFx0XHR9KVxuXHR9LFxuXG5cdEFzc2lnblNpbmdsZSh2YWxXcmFwKSB7XG5cdFx0Y29uc3QgdmFsID0gdmFsV3JhcCA9PT0gdW5kZWZpbmVkID8gdDAodGhpcy52YWx1ZSkgOiB2YWxXcmFwKHQwKHRoaXMudmFsdWUpKVxuXHRcdGNvbnN0IGRlY2xhcmUgPSBtYWtlRGVjbGFyYXRvcih0aGlzLmFzc2lnbmVlLCB2YWwsIGZhbHNlKVxuXHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbih0aGlzLmFzc2lnbmVlLmlzTXV0YWJsZSgpID8gJ2xldCcgOiAnY29uc3QnLCBbZGVjbGFyZV0pXG5cdH0sXG5cdC8vIFRPRE86RVM2IEp1c3QgdXNlIG5hdGl2ZSBkZXN0cnVjdHVyaW5nIGFzc2lnblxuXHRBc3NpZ25EZXN0cnVjdHVyZSgpIHtcblx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oXG5cdFx0XHR0aGlzLmtpbmQoKSA9PT0gTG9jYWxEZWNsYXJlcy5NdXRhYmxlID8gJ2xldCcgOiAnY29uc3QnLFxuXHRcdFx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMoXG5cdFx0XHRcdHRoaXMuYXNzaWduZWVzLFxuXHRcdFx0XHR0aGlzLmtpbmQoKSA9PT0gTG9jYWxEZWNsYXJlcy5MYXp5LFxuXHRcdFx0XHR0MCh0aGlzLnZhbHVlKSxcblx0XHRcdFx0ZmFsc2UpKVxuXHR9LFxuXG5cdEJhZ0VudHJ5KCkgeyByZXR1cm4gbXNBZGQoSWRCdWlsdCwgdDAodGhpcy52YWx1ZSkpIH0sXG5cblx0QmFnRW50cnlNYW55KCkgeyByZXR1cm4gbXNBZGRNYW55KElkQnVpbHQsIHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdEJhZ1NpbXBsZSgpIHsgcmV0dXJuIG5ldyBBcnJheUV4cHJlc3Npb24odGhpcy5wYXJ0cy5tYXAodDApKSB9LFxuXG5cdEJsb2NrRG8obGVhZD1udWxsLCBvcFJldHVyblR5cGU9bnVsbCwgZm9sbG93PW51bGwpIHtcblx0XHRhc3NlcnQob3BSZXR1cm5UeXBlID09PSBudWxsKVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHRMaW5lcyh0aGlzLmxpbmVzKSwgZm9sbG93KSlcblx0fSxcblxuXHRCbG9ja1ZhbFRocm93KGxlYWQ9bnVsbCwgX29wUmV0dXJuVHlwZSkge1xuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHRMaW5lcyh0aGlzLmxpbmVzKSwgdDAodGhpcy50aHJvdykpKVxuXHR9LFxuXG5cdEJsb2NrVmFsUmV0dXJuKGxlYWQ9bnVsbCwgb3BSZXR1cm5UeXBlPW51bGwpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2sodDAodGhpcy5yZXR1cm5lZCksIHRMaW5lcyh0aGlzLmxpbmVzKSwgbGVhZCwgb3BSZXR1cm5UeXBlKVxuXHR9LFxuXG5cdEJsb2NrQmFnKGxlYWQ9bnVsbCwgb3BSZXR1cm5UeXBlPW51bGwpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2soXG5cdFx0XHRJZEJ1aWx0LFxuXHRcdFx0Y2F0KERlY2xhcmVCdWlsdEJhZywgdExpbmVzKHRoaXMubGluZXMpKSxcblx0XHRcdGxlYWQsIG9wUmV0dXJuVHlwZSlcblx0fSxcblxuXHRCbG9ja09iaihsZWFkPW51bGwsIG9wUmV0dXJuVHlwZT1udWxsKSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKFxuXHRcdFx0SWRCdWlsdCxcblx0XHRcdGNhdChEZWNsYXJlQnVpbHRPYmosIHRMaW5lcyh0aGlzLmxpbmVzKSksXG5cdFx0XHRsZWFkLCBvcFJldHVyblR5cGUpXG5cdH0sXG5cblx0QmxvY2tNYXAobGVhZD1udWxsLCBvcFJldHVyblR5cGU9bnVsbCkge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayhcblx0XHRcdElkQnVpbHQsXG5cdFx0XHRjYXQoRGVjbGFyZUJ1aWx0TWFwLCB0TGluZXModGhpcy5saW5lcykpLFxuXHRcdFx0bGVhZCwgb3BSZXR1cm5UeXBlKVxuXHR9LFxuXG5cdEJsb2NrV3JhcCgpIHtcblx0XHRyZXR1cm4gYmxvY2tXcmFwKHQwKHRoaXMuYmxvY2spKVxuXHR9LFxuXG5cdEJyZWFrKCkge1xuXHRcdHJldHVybiBuZXcgQnJlYWtTdGF0ZW1lbnQoKVxuXHR9LFxuXG5cdEJyZWFrV2l0aFZhbCgpIHtcblx0XHRyZXR1cm4gbmV3IFJldHVyblN0YXRlbWVudCh0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRDYWxsKCkge1xuXHRcdHJldHVybiBuZXcgQ2FsbEV4cHJlc3Npb24odDAodGhpcy5jYWxsZWQpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHRDYXNlRG8oKSB7XG5cdFx0Y29uc3QgYm9keSA9IGNhc2VCb2R5KHRoaXMucGFydHMsIHRoaXMub3BFbHNlKVxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcENhc2VkLCBfID0+IG5ldyBCbG9ja1N0YXRlbWVudChbdDAoXyksIGJvZHldKSwgKCkgPT4gYm9keSlcblx0fSxcblx0Q2FzZVZhbCgpIHtcblx0XHRjb25zdCBib2R5ID0gY2FzZUJvZHkodGhpcy5wYXJ0cywgdGhpcy5vcEVsc2UpXG5cdFx0Y29uc3QgYmxvY2sgPSBpZkVsc2UodGhpcy5vcENhc2VkLCBfID0+IFt0MChfKSwgYm9keV0sICgpID0+IFtib2R5XSlcblx0XHRyZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChibG9jaykpXG5cdH0sXG5cdENhc2VEb1BhcnQ6IGNhc2VQYXJ0LFxuXHRDYXNlVmFsUGFydDogY2FzZVBhcnQsXG5cblx0Q2xhc3MoKSB7XG5cdFx0Y29uc3QgbWV0aG9kcyA9IGNhdChcblx0XHRcdHRoaXMuc3RhdGljcy5tYXAoXyA9PiB0MShfLCB0cnVlKSksXG5cdFx0XHRvcE1hcCh0aGlzLm9wQ29uc3RydWN0b3IsIHQwKSxcblx0XHRcdHRoaXMubWV0aG9kcy5tYXAoXyA9PiB0MShfLCBmYWxzZSkpKVxuXHRcdGNvbnN0IG9wTmFtZSA9IG9wTWFwKHZlcmlmeVJlc3VsdHMub3BOYW1lKHRoaXMpLCBpZGVudGlmaWVyKVxuXHRcdGNvbnN0IGNsYXNzRXhwciA9IG5ldyBDbGFzc0V4cHJlc3Npb24oXG5cdFx0XHRvcE5hbWUsXG5cdFx0XHRvcE1hcCh0aGlzLm9wU3VwZXJDbGFzcywgdDApLCBuZXcgQ2xhc3NCb2R5KG1ldGhvZHMpKVxuXG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wRG8sIF8gPT4gdDEoXywgY2xhc3NFeHByKSwgKCkgPT4gY2xhc3NFeHByKVxuXHR9LFxuXG5cdENsYXNzRG8oY2xhc3NFeHByKSB7XG5cdFx0Y29uc3QgbGVhZCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IodDAodGhpcy5kZWNsYXJlRm9jdXMpLCBjbGFzc0V4cHIpXSlcblx0XHRjb25zdCByZXQgPSBuZXcgUmV0dXJuU3RhdGVtZW50KHQwKHRoaXMuZGVjbGFyZUZvY3VzKSlcblx0XHRjb25zdCBibG9jayA9IHQzKHRoaXMuYmxvY2ssIGxlYWQsIG51bGwsIHJldClcblx0XHRyZXR1cm4gYmxvY2tXcmFwKGJsb2NrKVxuXHR9LFxuXG5cdENvbmQoKSB7XG5cdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odDAodGhpcy50ZXN0KSwgdDAodGhpcy5pZlRydWUpLCB0MCh0aGlzLmlmRmFsc2UpKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsRG8oKSB7XG5cdFx0Y29uc3QgdGVzdCA9IHQwKHRoaXMudGVzdClcblx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KFxuXHRcdFx0dGhpcy5pc1VubGVzcyA/IG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCB0ZXN0KSA6IHRlc3QsXG5cdFx0XHR0MCh0aGlzLnJlc3VsdCkpXG5cdH0sXG5cblx0Q29uZGl0aW9uYWxWYWwoKSB7XG5cdFx0Y29uc3QgdGVzdCA9IHQwKHRoaXMudGVzdClcblx0XHRjb25zdCByZXN1bHQgPSBtc1NvbWUoYmxvY2tXcmFwKHQwKHRoaXMucmVzdWx0KSkpXG5cdFx0cmV0dXJuIHRoaXMuaXNVbmxlc3MgP1xuXHRcdFx0bmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXN0LCBNc05vbmUsIHJlc3VsdCkgOlxuXHRcdFx0bmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXN0LCByZXN1bHQsIE1zTm9uZSlcblx0fSxcblxuXHRDb25zdHJ1Y3RvcigpIHtcblx0XHRpc0luQ29uc3RydWN0b3IgPSB0cnVlXG5cblx0XHQvLyBJZiB0aGVyZSBpcyBhIGBzdXBlciFgLCBgdGhpc2Agd2lsbCBub3QgYmUgZGVmaW5lZCB1bnRpbCB0aGVuLCBzbyBtdXN0IHdhaXQgdW50aWwgdGhlbi5cblx0XHQvLyBPdGhlcndpc2UsIGRvIGl0IGF0IHRoZSBiZWdpbm5pbmcuXG5cdFx0Y29uc3QgYm9keSA9IHZlcmlmeVJlc3VsdHMuY29uc3RydWN0b3JUb1N1cGVyLmhhcyh0aGlzKSA/XG5cdFx0XHR0MCh0aGlzLmZ1bikgOlxuXHRcdFx0dDEodGhpcy5mdW4sIGNvbnN0cnVjdG9yU2V0TWVtYmVycyh0aGlzKSlcblxuXHRcdGNvbnN0IHJlcyA9IE1ldGhvZERlZmluaXRpb24uY29uc3RydWN0b3IoYm9keSlcblx0XHRpc0luQ29uc3RydWN0b3IgPSBmYWxzZVxuXHRcdHJldHVybiByZXNcblx0fSxcblxuXHRDYXRjaCgpIHtcblx0XHRyZXR1cm4gbmV3IENhdGNoQ2xhdXNlKHQwKHRoaXMuY2F1Z2h0KSwgdDAodGhpcy5ibG9jaykpXG5cdH0sXG5cblx0RXhjZXB0RG8oKSB7IHJldHVybiB0cmFuc3BpbGVFeGNlcHQodGhpcykgfSxcblx0RXhjZXB0VmFsKCkgeyByZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChbdHJhbnNwaWxlRXhjZXB0KHRoaXMpXSkpIH0sXG5cblx0Rm9yRG8oKSB7IHJldHVybiBmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jaykgfSxcblxuXHRGb3JCYWcoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW1xuXHRcdFx0RGVjbGFyZUJ1aWx0QmFnLFxuXHRcdFx0Zm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spLFxuXHRcdFx0UmV0dXJuQnVpbHRcblx0XHRdKSlcblx0fSxcblxuXHRGb3JWYWwoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW2Zvckxvb3AodGhpcy5vcEl0ZXJhdGVlLCB0aGlzLmJsb2NrKV0pKVxuXHR9LFxuXG5cdEZ1bihsZWFkU3RhdGVtZW50cz1udWxsKSB7XG5cdFx0Y29uc3QgaXNHZW5lcmF0b3JGdW4gPSB0aGlzLmtpbmQgIT09IEZ1bnMuUGxhaW5cblx0XHRjb25zdCBvbGRJbkdlbmVyYXRvciA9IGlzSW5HZW5lcmF0b3Jcblx0XHRpc0luR2VuZXJhdG9yID0gaXNHZW5lcmF0b3JGdW5cblxuXHRcdC8vIFRPRE86RVM2IHVzZSBgLi4uYGZcblx0XHRjb25zdCBuQXJncyA9IG5ldyBMaXRlcmFsKHRoaXMuYXJncy5sZW5ndGgpXG5cdFx0Y29uc3Qgb3BEZWNsYXJlUmVzdCA9IG9wTWFwKHRoaXMub3BSZXN0QXJnLCByZXN0ID0+XG5cdFx0XHRkZWNsYXJlKHJlc3QsIG5ldyBDYWxsRXhwcmVzc2lvbihBcnJheVNsaWNlQ2FsbCwgW0lkQXJndW1lbnRzLCBuQXJnc10pKSlcblx0XHRjb25zdCBhcmdDaGVja3MgPSBvcElmKG9wdGlvbnMuaW5jbHVkZUNoZWNrcygpLCAoKSA9PlxuXHRcdFx0ZmxhdE9wTWFwKHRoaXMuYXJncywgb3BUeXBlQ2hlY2tGb3JMb2NhbERlY2xhcmUpKVxuXG5cdFx0Y29uc3Qgb3BEZWNsYXJlVGhpcyA9XG5cdFx0XHRvcElmKCFpc0luQ29uc3RydWN0b3IgJiYgdGhpcy5vcERlY2xhcmVUaGlzICE9IG51bGwsICgpID0+IERlY2xhcmVMZXhpY2FsVGhpcylcblxuXHRcdGNvbnN0IGxlYWQgPSBjYXQobGVhZFN0YXRlbWVudHMsIG9wRGVjbGFyZVRoaXMsIG9wRGVjbGFyZVJlc3QsIGFyZ0NoZWNrcylcblxuXHRcdGNvbnN0IGJvZHkgPSB0Mih0aGlzLmJsb2NrLCBsZWFkLCB0aGlzLm9wUmV0dXJuVHlwZSlcblx0XHRjb25zdCBhcmdzID0gdGhpcy5hcmdzLm1hcCh0MClcblx0XHRpc0luR2VuZXJhdG9yID0gb2xkSW5HZW5lcmF0b3Jcblx0XHRjb25zdCBpZCA9IG9wTWFwKHZlcmlmeVJlc3VsdHMub3BOYW1lKHRoaXMpLCBpZGVudGlmaWVyKVxuXG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgRnVucy5QbGFpbjpcblx0XHRcdFx0Ly8gVE9ETzpFUzYgU2hvdWxkIGJlIGFibGUgdG8gdXNlIHJlc3QgYXJncyBpbiBhcnJvdyBmdW5jdGlvblxuXHRcdFx0XHRpZiAoaWQgPT09IG51bGwgJiYgdGhpcy5vcERlY2xhcmVUaGlzID09PSBudWxsICYmIG9wRGVjbGFyZVJlc3QgPT09IG51bGwpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihhcmdzLCBib2R5KVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIGFyZ3MsIGJvZHkpXG5cdFx0XHRjYXNlIEZ1bnMuQXN5bmM6IHtcblx0XHRcdFx0Y29uc3QgbmV3Qm9keSA9IG5ldyBCbG9ja1N0YXRlbWVudChbXG5cdFx0XHRcdFx0bmV3IFJldHVyblN0YXRlbWVudChtc0FzeW5jKG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIFtdLCBib2R5LCB0cnVlKSkpXG5cdFx0XHRcdF0pXG5cdFx0XHRcdHJldHVybiBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKGlkLCBhcmdzLCBuZXdCb2R5KVxuXHRcdFx0fVxuXHRcdFx0Y2FzZSBGdW5zLkdlbmVyYXRvcjpcblx0XHRcdFx0cmV0dXJuIG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIGFyZ3MsIGJvZHksIHRydWUpXG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IodGhpcy5raW5kKVxuXHRcdH1cblx0fSxcblxuXHRJZ25vcmUoKSB7XG5cdFx0cmV0dXJuIFtdXG5cdH0sXG5cblx0TGF6eSgpIHtcblx0XHRyZXR1cm4gbGF6eVdyYXAodDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0TWV0aG9kSW1wbChpc1N0YXRpYykge1xuXHRcdGNvbnN0IHZhbHVlID0gdDAodGhpcy5mdW4pXG5cdFx0YXNzZXJ0KHZhbHVlLmlkID09IG51bGwpXG5cdFx0Ly8gU2luY2UgdGhlIEZ1biBzaG91bGQgaGF2ZSBvcERlY2xhcmVUaGlzLCBpdCB3aWxsIG5ldmVyIGJlIGFuIEFycm93RnVuY3Rpb25FeHByZXNzaW9uLlxuXHRcdGFzc2VydCh2YWx1ZSBpbnN0YW5jZW9mIEZ1bmN0aW9uRXhwcmVzc2lvbilcblxuXHRcdGNvbnN0IHtrZXksIGNvbXB1dGVkfSA9IG1ldGhvZEtleUNvbXB1dGVkKHRoaXMuc3ltYm9sKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kRGVmaW5pdGlvbihrZXksIHZhbHVlLCAnbWV0aG9kJywgaXNTdGF0aWMsIGNvbXB1dGVkKVxuXHR9LFxuXHRNZXRob2RHZXR0ZXIoaXNTdGF0aWMpIHtcblx0XHRjb25zdCB2YWx1ZSA9IG5ldyBGdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgW10sIHQxKHRoaXMuYmxvY2ssIERlY2xhcmVMZXhpY2FsVGhpcykpXG5cdFx0Y29uc3Qge2tleSwgY29tcHV0ZWR9ID0gbWV0aG9kS2V5Q29tcHV0ZWQodGhpcy5zeW1ib2wpXG5cdFx0cmV0dXJuIG5ldyBNZXRob2REZWZpbml0aW9uKGtleSwgdmFsdWUsICdnZXQnLCBpc1N0YXRpYywgY29tcHV0ZWQpXG5cdH0sXG5cdE1ldGhvZFNldHRlcihpc1N0YXRpYykge1xuXHRcdGNvbnN0IHZhbHVlID0gbmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihudWxsLCBbSWRGb2N1c10sIHQxKHRoaXMuYmxvY2ssIERlY2xhcmVMZXhpY2FsVGhpcykpXG5cdFx0Y29uc3Qge2tleSwgY29tcHV0ZWR9ID0gbWV0aG9kS2V5Q29tcHV0ZWQodGhpcy5zeW1ib2wpXG5cdFx0cmV0dXJuIG5ldyBNZXRob2REZWZpbml0aW9uKGtleSwgdmFsdWUsICdzZXQnLCBpc1N0YXRpYywgY29tcHV0ZWQpXG5cdH0sXG5cblx0TnVtYmVyTGl0ZXJhbCgpIHtcblx0XHQvLyBOZWdhdGl2ZSBudW1iZXJzIGFyZSBub3QgcGFydCBvZiBFUyBzcGVjLlxuXHRcdC8vIGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi81LjEvI3NlYy03LjguM1xuXHRcdGNvbnN0IHZhbHVlID0gTnVtYmVyKHRoaXMudmFsdWUpXG5cdFx0Y29uc3QgbGl0ID0gbmV3IExpdGVyYWwoTWF0aC5hYnModmFsdWUpKVxuXHRcdGNvbnN0IGlzUG9zaXRpdmUgPSB2YWx1ZSA+PSAwICYmIDEgLyB2YWx1ZSAhPT0gLUluZmluaXR5XG5cdFx0cmV0dXJuIGlzUG9zaXRpdmUgPyBsaXQgOiBuZXcgVW5hcnlFeHByZXNzaW9uKCctJywgbGl0KVxuXHR9LFxuXG5cdExvY2FsQWNjZXNzKCkge1xuXHRcdGlmICh0aGlzLm5hbWUgPT09ICd0aGlzJylcblx0XHRcdHJldHVybiBpc0luQ29uc3RydWN0b3IgPyBuZXcgVGhpc0V4cHJlc3Npb24oKSA6IElkTGV4aWNhbFRoaXNcblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IGxkID0gdmVyaWZ5UmVzdWx0cy5sb2NhbERlY2xhcmVGb3JBY2Nlc3ModGhpcylcblx0XHRcdC8vIElmIGxkIG1pc3NpbmcsIHRoaXMgaXMgYSBidWlsdGluLCBhbmQgYnVpbHRpbnMgYXJlIG5ldmVyIGxhenlcblx0XHRcdHJldHVybiBsZCA9PT0gdW5kZWZpbmVkID8gaWRlbnRpZmllcih0aGlzLm5hbWUpIDogYWNjZXNzTG9jYWxEZWNsYXJlKGxkKVxuXHRcdH1cblx0fSxcblxuXHRMb2NhbERlY2xhcmUoKSB7IHJldHVybiBuZXcgSWRlbnRpZmllcihpZEZvckRlY2xhcmVDYWNoZWQodGhpcykubmFtZSkgfSxcblxuXHRMb2NhbE11dGF0ZSgpIHtcblx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgaWRlbnRpZmllcih0aGlzLm5hbWUpLCB0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRMb2dpYygpIHtcblx0XHRjb25zdCBvcCA9IHRoaXMua2luZCA9PT0gTG9naWNzLkFuZCA/ICcmJicgOiAnfHwnXG5cdFx0cmV0dXJuIHRhaWwodGhpcy5hcmdzKS5yZWR1Y2UoKGEsIGIpID0+XG5cdFx0XHRuZXcgTG9naWNhbEV4cHJlc3Npb24ob3AsIGEsIHQwKGIpKSwgdDAodGhpcy5hcmdzWzBdKSlcblx0fSxcblxuXHRNYXBFbnRyeSgpIHsgcmV0dXJuIG1zU2V0U3ViKElkQnVpbHQsIHQwKHRoaXMua2V5KSwgdDAodGhpcy52YWwpKSB9LFxuXG5cdE1lbWJlcigpIHtcblx0XHRyZXR1cm4gbWVtYmVyU3RyaW5nT3JWYWwodDAodGhpcy5vYmplY3QpLCB0aGlzLm5hbWUpXG5cdH0sXG5cblx0TWVtYmVyU2V0KCkge1xuXHRcdGNvbnN0IG9iaiA9IHQwKHRoaXMub2JqZWN0KVxuXHRcdGNvbnN0IG5hbWUgPSAoKSA9PlxuXHRcdFx0dHlwZW9mIHRoaXMubmFtZSA9PT0gJ3N0cmluZycgPyBuZXcgTGl0ZXJhbCh0aGlzLm5hbWUpIDogdDAodGhpcy5uYW1lKVxuXHRcdGNvbnN0IHZhbCA9IG1heWJlV3JhcEluQ2hlY2tDb250YWlucyh0MCh0aGlzLnZhbHVlKSwgdGhpcy5vcFR5cGUsIHRoaXMubmFtZSlcblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTZXR0ZXJzLkluaXQ6XG5cdFx0XHRcdHJldHVybiBtc05ld1Byb3BlcnR5KG9iaiwgbmFtZSgpLCB2YWwpXG5cdFx0XHRjYXNlIFNldHRlcnMuSW5pdE11dGFibGU6XG5cdFx0XHRcdHJldHVybiBtc05ld011dGFibGVQcm9wZXJ0eShvYmosIG5hbWUoKSwgdmFsKVxuXHRcdFx0Y2FzZSBTZXR0ZXJzLk11dGF0ZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlclN0cmluZ09yVmFsKG9iaiwgdGhpcy5uYW1lKSwgdmFsKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKClcblx0XHR9XG5cdH0sXG5cblx0TW9kdWxlOiB0cmFuc3BpbGVNb2R1bGUsXG5cblx0TW9kdWxlRXhwb3J0TmFtZWQoKSB7XG5cdFx0cmV0dXJuIHQxKHRoaXMuYXNzaWduLCB2YWwgPT5cblx0XHRcdG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlcihJZEV4cG9ydHMsIHRoaXMuYXNzaWduLmFzc2lnbmVlLm5hbWUpLCB2YWwpKVxuXHR9LFxuXG5cdE1vZHVsZUV4cG9ydERlZmF1bHQoKSB7XG5cdFx0cmV0dXJuIHQxKHRoaXMuYXNzaWduLCB2YWwgPT4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgRXhwb3J0c0RlZmF1bHQsIHZhbCkpXG5cdH0sXG5cblx0TmV3KCkge1xuXHRcdGNvbnN0IGFueVNwbGF0ID0gdGhpcy5hcmdzLnNvbWUoXyA9PiBfIGluc3RhbmNlb2YgU3BsYXQpXG5cdFx0Y2hlY2soIWFueVNwbGF0LCB0aGlzLmxvYywgJ1RPRE86IFNwbGF0IHBhcmFtcyBmb3IgbmV3Jylcblx0XHRyZXR1cm4gbmV3IE5ld0V4cHJlc3Npb24odDAodGhpcy50eXBlKSwgdGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0Tm90KCkgeyByZXR1cm4gbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIHQwKHRoaXMuYXJnKSkgfSxcblxuXHRPYmpFbnRyeUFzc2lnbigpIHtcblx0XHRyZXR1cm4gdGhpcy5hc3NpZ24gaW5zdGFuY2VvZiBBc3NpZ25TaW5nbGUgJiYgIXRoaXMuYXNzaWduLmFzc2lnbmVlLmlzTGF6eSgpID9cblx0XHRcdHQxKHRoaXMuYXNzaWduLCB2YWwgPT5cblx0XHRcdFx0bmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyKElkQnVpbHQsIHRoaXMuYXNzaWduLmFzc2lnbmVlLm5hbWUpLCB2YWwpKSA6XG5cdFx0XHRjYXQoXG5cdFx0XHRcdHQwKHRoaXMuYXNzaWduKSxcblx0XHRcdFx0dGhpcy5hc3NpZ24uYWxsQXNzaWduZWVzKCkubWFwKF8gPT5cblx0XHRcdFx0XHRtc1NldExhenkoSWRCdWlsdCwgbmV3IExpdGVyYWwoXy5uYW1lKSwgaWRGb3JEZWNsYXJlQ2FjaGVkKF8pKSkpXG5cdH0sXG5cblx0T2JqRW50cnlQbGFpbigpIHtcblx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyU3RyaW5nT3JWYWwoSWRCdWlsdCwgdGhpcy5uYW1lKSwgdDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0T2JqU2ltcGxlKCkge1xuXHRcdHJldHVybiBuZXcgT2JqZWN0RXhwcmVzc2lvbih0aGlzLnBhaXJzLm1hcChwYWlyID0+XG5cdFx0XHRuZXcgUHJvcGVydHkoJ2luaXQnLCBwcm9wZXJ0eUlkT3JMaXRlcmFsKHBhaXIua2V5KSwgdDAocGFpci52YWx1ZSkpKSlcblx0fSxcblxuXHRRdW90ZVBsYWluKCkge1xuXHRcdGlmICh0aGlzLnBhcnRzLmxlbmd0aCA9PT0gMClcblx0XHRcdHJldHVybiBMaXRFbXB0eVN0cmluZ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgcXVhc2lzID0gW10sIGV4cHJlc3Npb25zID0gW11cblxuXHRcdFx0Ly8gVGVtcGxhdGVMaXRlcmFsIG11c3Qgc3RhcnQgd2l0aCBhIFRlbXBsYXRlRWxlbWVudFxuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLnBhcnRzWzBdICE9PSAnc3RyaW5nJylcblx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmVtcHR5KVxuXG5cdFx0XHRmb3IgKGxldCBwYXJ0IG9mIHRoaXMucGFydHMpXG5cdFx0XHRcdGlmICh0eXBlb2YgcGFydCA9PT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmZvclJhd1N0cmluZyhwYXJ0KSlcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Ly8gXCJ7MX17MX1cIiBuZWVkcyBhbiBlbXB0eSBxdWFzaSBpbiB0aGUgbWlkZGxlIChhbmQgb24gdGhlIGVuZHMpXG5cdFx0XHRcdFx0aWYgKHF1YXNpcy5sZW5ndGggPT09IGV4cHJlc3Npb25zLmxlbmd0aClcblx0XHRcdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5lbXB0eSlcblx0XHRcdFx0XHRleHByZXNzaW9ucy5wdXNoKHQwKHBhcnQpKVxuXHRcdFx0XHR9XG5cblx0XHRcdC8vIFRlbXBsYXRlTGl0ZXJhbCBtdXN0IGVuZCB3aXRoIGEgVGVtcGxhdGVFbGVtZW50LCBzbyBvbmUgbW9yZSBxdWFzaSB0aGFuIGV4cHJlc3Npb24uXG5cdFx0XHRpZiAocXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoKVxuXHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZW1wdHkpXG5cblx0XHRcdHJldHVybiBuZXcgVGVtcGxhdGVMaXRlcmFsKHF1YXNpcywgZXhwcmVzc2lvbnMpXG5cdFx0fVxuXHR9LFxuXG5cdFF1b3RlU2ltcGxlKCkge1xuXHRcdHJldHVybiBuZXcgTGl0ZXJhbCh0aGlzLm5hbWUpXG5cdH0sXG5cblx0UXVvdGVUYWdnZWRUZW1wbGF0ZSgpIHtcblx0XHRyZXR1cm4gbmV3IFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbih0MCh0aGlzLnRhZyksIHQwKHRoaXMucXVvdGUpKVxuXHR9LFxuXG5cdFJhbmdlKCkge1xuXHRcdGNvbnN0IGVuZCA9IGlmRWxzZSh0aGlzLmVuZCwgdDAsICgpID0+IEdsb2JhbEluZmluaXR5KVxuXHRcdHJldHVybiBtc1JhbmdlKHQwKHRoaXMuc3RhcnQpLCBlbmQsIG5ldyBMaXRlcmFsKHRoaXMuaXNFeGNsdXNpdmUpKVxuXHR9LFxuXG5cdFNldFN1YigpIHtcblx0XHRjb25zdCBnZXRLaW5kID0gKCkgPT4ge1xuXHRcdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBTZXR0ZXJzLkluaXQ6XG5cdFx0XHRcdFx0cmV0dXJuICdpbml0J1xuXHRcdFx0XHRjYXNlIFNldHRlcnMuSW5pdE11dGFibGU6XG5cdFx0XHRcdFx0cmV0dXJuICdpbml0LW11dGFibGUnXG5cdFx0XHRcdGNhc2UgU2V0dGVycy5NdXRhdGU6XG5cdFx0XHRcdFx0cmV0dXJuICdtdXRhdGUnXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdH1cblx0XHR9XG5cdFx0Y29uc3Qga2luZCA9IGdldEtpbmQoKVxuXHRcdHJldHVybiBtc1NldFN1Yihcblx0XHRcdHQwKHRoaXMub2JqZWN0KSxcblx0XHRcdHRoaXMuc3ViYmVkcy5sZW5ndGggPT09IDEgPyB0MCh0aGlzLnN1YmJlZHNbMF0pIDogdGhpcy5zdWJiZWRzLm1hcCh0MCksXG5cdFx0XHRtYXliZVdyYXBJbkNoZWNrQ29udGFpbnModDAodGhpcy52YWx1ZSksIHRoaXMub3BUeXBlLCAndmFsdWUnKSxcblx0XHRcdG5ldyBMaXRlcmFsKGtpbmQpKVxuXHR9LFxuXG5cdFNwZWNpYWxEbygpIHtcblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTcGVjaWFsRG9zLkRlYnVnZ2VyOiByZXR1cm4gbmV3IERlYnVnZ2VyU3RhdGVtZW50KClcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcih0aGlzLmtpbmQpXG5cdFx0fVxuXHR9LFxuXG5cdFNwZWNpYWxWYWwoKSB7XG5cdFx0Ly8gTWFrZSBuZXcgb2JqZWN0cyBiZWNhdXNlIHdlIHdpbGwgYXNzaWduIGBsb2NgIHRvIHRoZW0uXG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuQ29udGFpbnM6XG5cdFx0XHRcdHJldHVybiBtZW1iZXIoSWRNcywgJ2NvbnRhaW5zJylcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuRGVsU3ViOlxuXHRcdFx0XHRyZXR1cm4gbWVtYmVyKElkTXMsICdkZWxTdWInKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5GYWxzZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKGZhbHNlKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5OYW1lOlxuXHRcdFx0XHRyZXR1cm4gbmV3IExpdGVyYWwodmVyaWZ5UmVzdWx0cy5uYW1lKHRoaXMpKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5OdWxsOlxuXHRcdFx0XHRyZXR1cm4gbmV3IExpdGVyYWwobnVsbClcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuU2V0U3ViOlxuXHRcdFx0XHRyZXR1cm4gbWVtYmVyKElkTXMsICdzZXRTdWInKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5TdWI6XG5cdFx0XHRcdHJldHVybiBtZW1iZXIoSWRNcywgJ3N1YicpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLlRydWU6XG5cdFx0XHRcdHJldHVybiBuZXcgTGl0ZXJhbCh0cnVlKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5VbmRlZmluZWQ6XG5cdFx0XHRcdHJldHVybiBuZXcgVW5hcnlFeHByZXNzaW9uKCd2b2lkJywgTGl0WmVybylcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcih0aGlzLmtpbmQpXG5cdFx0fVxuXHR9LFxuXG5cdFNwbGF0KCkge1xuXHRcdHJldHVybiBuZXcgU3ByZWFkRWxlbWVudCh0MCh0aGlzLnNwbGF0dGVkKSlcblx0fSxcblxuXHRTdXBlckNhbGw6IHN1cGVyQ2FsbCxcblx0U3VwZXJDYWxsRG86IHN1cGVyQ2FsbCxcblx0U3VwZXJNZW1iZXIoKSB7XG5cdFx0cmV0dXJuIG1lbWJlclN0cmluZ09yVmFsKElkU3VwZXIsIHRoaXMubmFtZSlcblx0fSxcblxuXHRTd2l0Y2hEbygpIHsgcmV0dXJuIHRyYW5zcGlsZVN3aXRjaCh0aGlzKSB9LFxuXHRTd2l0Y2hWYWwoKSB7IHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFt0cmFuc3BpbGVTd2l0Y2godGhpcyldKSkgfSxcblx0U3dpdGNoRG9QYXJ0OiBzd2l0Y2hQYXJ0LFxuXHRTd2l0Y2hWYWxQYXJ0OiBzd2l0Y2hQYXJ0LFxuXG5cdFRoaXNGdW4oKSB7XG5cdFx0Ly8gdGhpcy57bmFtZX0uYmluZCh0aGlzKVxuXHRcdGNvbnN0IGZ1biA9IG1lbWJlcihJZExleGljYWxUaGlzLCB0aGlzLm5hbWUpXG5cdFx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbihtZW1iZXIoZnVuLCAnYmluZCcpLCBbSWRMZXhpY2FsVGhpc10pXG5cdH0sXG5cblx0VGhyb3coKSB7XG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wVGhyb3duLFxuXHRcdFx0XyA9PiBkb1Rocm93KF8pLFxuXHRcdFx0KCkgPT4gbmV3IFRocm93U3RhdGVtZW50KG5ldyBOZXdFeHByZXNzaW9uKEdsb2JhbEVycm9yLCBbTGl0U3RyVGhyb3ddKSkpXG5cdH0sXG5cblx0V2l0aCgpIHtcblx0XHRjb25zdCBpZERlY2xhcmUgPSBpZEZvckRlY2xhcmVDYWNoZWQodGhpcy5kZWNsYXJlKVxuXHRcdGNvbnN0IGJsb2NrID0gdDModGhpcy5ibG9jaywgbnVsbCwgbnVsbCwgbmV3IFJldHVyblN0YXRlbWVudChpZERlY2xhcmUpKVxuXHRcdGNvbnN0IGZ1biA9IGlzSW5HZW5lcmF0b3IgP1xuXHRcdFx0bmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihudWxsLCBbaWREZWNsYXJlXSwgYmxvY2ssIHRydWUpIDpcblx0XHRcdG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihbaWREZWNsYXJlXSwgYmxvY2spXG5cdFx0Y29uc3QgY2FsbCA9IG5ldyBDYWxsRXhwcmVzc2lvbihmdW4sIFt0MCh0aGlzLnZhbHVlKV0pXG5cdFx0cmV0dXJuIGlzSW5HZW5lcmF0b3IgPyBuZXcgWWllbGRFeHByZXNzaW9uKGNhbGwsIHRydWUpIDogY2FsbFxuXHR9LFxuXG5cdFlpZWxkKCkgeyByZXR1cm4gbmV3IFlpZWxkRXhwcmVzc2lvbihvcE1hcCh0aGlzLm9wWWllbGRlZCwgdDApLCBmYWxzZSkgfSxcblxuXHRZaWVsZFRvKCkgeyByZXR1cm4gbmV3IFlpZWxkRXhwcmVzc2lvbih0MCh0aGlzLnlpZWxkZWRUbyksIHRydWUpIH1cbn0pXG5cbi8vIFNoYXJlZCBpbXBsZW1lbnRhdGlvbnNcblxuZnVuY3Rpb24gY2FzZVBhcnQoYWx0ZXJuYXRlKSB7XG5cdGlmICh0aGlzLnRlc3QgaW5zdGFuY2VvZiBQYXR0ZXJuKSB7XG5cdFx0Y29uc3Qge3R5cGUsIHBhdHRlcm5lZCwgbG9jYWxzfSA9IHRoaXMudGVzdFxuXHRcdGNvbnN0IGRlY2wgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBbXG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKElkRXh0cmFjdCwgbXNFeHRyYWN0KHQwKHR5cGUpLCB0MChwYXR0ZXJuZWQpKSldKVxuXHRcdGNvbnN0IHRlc3QgPSBuZXcgQmluYXJ5RXhwcmVzc2lvbignIT09JywgSWRFeHRyYWN0LCBMaXROdWxsKVxuXHRcdGNvbnN0IGV4dHJhY3QgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBsb2NhbHMubWFwKChfLCBpZHgpID0+XG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKFxuXHRcdFx0XHRpZEZvckRlY2xhcmVDYWNoZWQoXyksXG5cdFx0XHRcdG5ldyBNZW1iZXJFeHByZXNzaW9uKElkRXh0cmFjdCwgbmV3IExpdGVyYWwoaWR4KSkpKSlcblx0XHRjb25zdCByZXMgPSB0MSh0aGlzLnJlc3VsdCwgZXh0cmFjdClcblx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KFtkZWNsLCBuZXcgSWZTdGF0ZW1lbnQodGVzdCwgcmVzLCBhbHRlcm5hdGUpXSlcblx0fSBlbHNlXG5cdFx0Ly8gYWx0ZXJuYXRlIHdyaXR0ZW4gdG8gYnkgYGNhc2VCb2R5YC5cblx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KHQwKHRoaXMudGVzdCksIHQwKHRoaXMucmVzdWx0KSwgYWx0ZXJuYXRlKVxufVxuXG5mdW5jdGlvbiBzdXBlckNhbGwoKSB7XG5cdGNvbnN0IGFyZ3MgPSB0aGlzLmFyZ3MubWFwKHQwKVxuXHRjb25zdCBtZXRob2QgPSB2ZXJpZnlSZXN1bHRzLnN1cGVyQ2FsbFRvTWV0aG9kLmdldCh0aGlzKVxuXG5cdGlmIChtZXRob2QgaW5zdGFuY2VvZiBDb25zdHJ1Y3Rvcikge1xuXHRcdGNvbnN0IGNhbGwgPSBuZXcgQ2FsbEV4cHJlc3Npb24oSWRTdXBlciwgYXJncylcblx0XHRjb25zdCBtZW1iZXJTZXRzID0gY29uc3RydWN0b3JTZXRNZW1iZXJzKG1ldGhvZClcblx0XHRyZXR1cm4gY2F0KGNhbGwsIG1lbWJlclNldHMpXG5cdH0gZWxzZVxuXHRcdHJldHVybiBuZXcgQ2FsbEV4cHJlc3Npb24obWVtYmVyU3RyaW5nT3JWYWwoSWRTdXBlciwgbWV0aG9kLnN5bWJvbCksIGFyZ3MpXG59XG5cbmZ1bmN0aW9uIHN3aXRjaFBhcnQoKSB7XG5cdGNvbnN0IGZvbGxvdyA9IG9wSWYodGhpcyBpbnN0YW5jZW9mIFN3aXRjaERvUGFydCwgKCkgPT4gbmV3IEJyZWFrU3RhdGVtZW50KVxuXHQvKlxuXHRXZSBjb3VsZCBqdXN0IHBhc3MgYmxvY2suYm9keSBmb3IgdGhlIHN3aXRjaCBsaW5lcywgYnV0IGluc3RlYWRcblx0ZW5jbG9zZSB0aGUgYm9keSBvZiB0aGUgc3dpdGNoIGNhc2UgaW4gY3VybHkgYnJhY2VzIHRvIGVuc3VyZSBhIG5ldyBzY29wZS5cblx0VGhhdCB3YXkgdGhpcyBjb2RlIHdvcmtzOlxuXHRcdHN3aXRjaCAoMCkge1xuXHRcdFx0Y2FzZSAwOiB7XG5cdFx0XHRcdGNvbnN0IGEgPSAwXG5cdFx0XHRcdHJldHVybiBhXG5cdFx0XHR9XG5cdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdC8vIFdpdGhvdXQgY3VybHkgYnJhY2VzIHRoaXMgd291bGQgY29uZmxpY3Qgd2l0aCB0aGUgb3RoZXIgYGFgLlxuXHRcdFx0XHRjb25zdCBhID0gMVxuXHRcdFx0XHRhXG5cdFx0XHR9XG5cdFx0fVxuXHQqL1xuXHRjb25zdCBibG9jayA9IHQzKHRoaXMucmVzdWx0LCBudWxsLCBudWxsLCBmb2xsb3cpXG5cdC8vIElmIHN3aXRjaCBoYXMgbXVsdGlwbGUgdmFsdWVzLCBidWlsZCB1cCBhIHN0YXRlbWVudCBsaWtlOiBgY2FzZSAxOiBjYXNlIDI6IHsgZG9CbG9jaygpIH1gXG5cdGNvbnN0IHggPSBbXVxuXHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudmFsdWVzLmxlbmd0aCAtIDE7IGkgPSBpICsgMSlcblx0XHQvLyBUaGVzZSBjYXNlcyBmYWxsdGhyb3VnaCB0byB0aGUgb25lIGF0IHRoZSBlbmQuXG5cdFx0eC5wdXNoKG5ldyBTd2l0Y2hDYXNlKHQwKHRoaXMudmFsdWVzW2ldKSwgW10pKVxuXHR4LnB1c2gobmV3IFN3aXRjaENhc2UodDAodGhpcy52YWx1ZXNbdGhpcy52YWx1ZXMubGVuZ3RoIC0gMV0pLCBbYmxvY2tdKSlcblx0cmV0dXJuIHhcbn1cblxuLy8gRnVuY3Rpb25zIHNwZWNpZmljIHRvIGNlcnRhaW4gZXhwcmVzc2lvbnNcblxuLy8gV3JhcHMgYSBibG9jayAod2l0aCBgcmV0dXJuYCBzdGF0ZW1lbnRzIGluIGl0KSBpbiBhbiBJSUZFLlxuZnVuY3Rpb24gYmxvY2tXcmFwKGJsb2NrKSB7XG5cdGNvbnN0IGludm9rZSA9IG5ldyBDYWxsRXhwcmVzc2lvbihmdW5jdGlvbkV4cHJlc3Npb25UaHVuayhibG9jaywgaXNJbkdlbmVyYXRvciksIFtdKVxuXHRyZXR1cm4gaXNJbkdlbmVyYXRvciA/IG5ldyBZaWVsZEV4cHJlc3Npb24oaW52b2tlLCB0cnVlKSA6IGludm9rZVxufVxuXG5mdW5jdGlvbiBjYXNlQm9keShwYXJ0cywgb3BFbHNlKSB7XG5cdGxldCBhY2MgPSBpZkVsc2Uob3BFbHNlLCB0MCwgKCkgPT4gVGhyb3dOb0Nhc2VNYXRjaClcblx0Zm9yIChsZXQgaSA9IHBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaSA9IGkgLSAxKVxuXHRcdGFjYyA9IHQxKHBhcnRzW2ldLCBhY2MpXG5cdHJldHVybiBhY2Ncbn1cblxuZnVuY3Rpb24gY29uc3RydWN0b3JTZXRNZW1iZXJzKGNvbnN0cnVjdG9yKSB7XG5cdHJldHVybiBjb25zdHJ1Y3Rvci5tZW1iZXJBcmdzLm1hcChfID0+XG5cdFx0bXNOZXdQcm9wZXJ0eShuZXcgVGhpc0V4cHJlc3Npb24oKSwgbmV3IExpdGVyYWwoXy5uYW1lKSwgaWRGb3JEZWNsYXJlQ2FjaGVkKF8pKSlcbn1cblxuZnVuY3Rpb24gZm9yTG9vcChvcEl0ZXJhdGVlLCBibG9jaykge1xuXHRyZXR1cm4gaWZFbHNlKG9wSXRlcmF0ZWUsXG5cdFx0KHtlbGVtZW50LCBiYWd9KSA9PiB7XG5cdFx0XHRjb25zdCBkZWNsYXJlID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2xldCcsXG5cdFx0XHRcdFtuZXcgVmFyaWFibGVEZWNsYXJhdG9yKHQwKGVsZW1lbnQpKV0pXG5cdFx0XHRyZXR1cm4gbmV3IEZvck9mU3RhdGVtZW50KGRlY2xhcmUsIHQwKGJhZyksIHQwKGJsb2NrKSlcblx0XHR9LFxuXHRcdCgpID0+IG5ldyBGb3JTdGF0ZW1lbnQobnVsbCwgbnVsbCwgbnVsbCwgdDAoYmxvY2spKSlcbn1cblxuZnVuY3Rpb24gbWV0aG9kS2V5Q29tcHV0ZWQoc3ltYm9sKSB7XG5cdGlmICh0eXBlb2Ygc3ltYm9sID09PSAnc3RyaW5nJylcblx0XHRyZXR1cm4ge2tleTogcHJvcGVydHlJZE9yTGl0ZXJhbChzeW1ib2wpLCBjb21wdXRlZDogZmFsc2V9XG5cdGVsc2Uge1xuXHRcdGNvbnN0IGtleSA9IHN5bWJvbCBpbnN0YW5jZW9mIFF1b3RlQWJzdHJhY3QgPyB0MChzeW1ib2wpIDogbXNTeW1ib2wodDAoc3ltYm9sKSlcblx0XHRyZXR1cm4ge2tleSwgY29tcHV0ZWQ6IHRydWV9XG5cdH1cbn1cblxuZnVuY3Rpb24gdHJhbnNwaWxlQmxvY2socmV0dXJuZWQsIGxpbmVzLCBsZWFkLCBvcFJldHVyblR5cGUpIHtcblx0Y29uc3QgZmluID0gbmV3IFJldHVyblN0YXRlbWVudChcblx0XHRtYXliZVdyYXBJbkNoZWNrQ29udGFpbnMocmV0dXJuZWQsIG9wUmV0dXJuVHlwZSwgJ3JldHVybmVkIHZhbHVlJykpXG5cdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIGxpbmVzLCBmaW4pKVxufVxuXG5mdW5jdGlvbiB0cmFuc3BpbGVFeGNlcHQoZXhjZXB0KSB7XG5cdHJldHVybiBuZXcgVHJ5U3RhdGVtZW50KFxuXHRcdHQwKGV4Y2VwdC50cnkpLFxuXHRcdG9wTWFwKGV4Y2VwdC5jYXRjaCwgdDApLFxuXHRcdG9wTWFwKGV4Y2VwdC5maW5hbGx5LCB0MCkpXG59XG5cbmZ1bmN0aW9uIHRyYW5zcGlsZVN3aXRjaChfKSB7XG5cdGNvbnN0IHBhcnRzID0gZmxhdE1hcChfLnBhcnRzLCB0MClcblx0cGFydHMucHVzaChpZkVsc2UoXy5vcEVsc2UsXG5cdFx0XyA9PiBuZXcgU3dpdGNoQ2FzZSh1bmRlZmluZWQsIHQwKF8pLmJvZHkpLFxuXHRcdCgpID0+IFN3aXRjaENhc2VOb01hdGNoKSlcblx0cmV0dXJuIG5ldyBTd2l0Y2hTdGF0ZW1lbnQodDAoXy5zd2l0Y2hlZCksIHBhcnRzKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMoYXNzaWduZWVzLCBpc0xhenksIHZhbHVlLCBpc01vZHVsZSkge1xuXHRjb25zdCBkZXN0cnVjdHVyZWROYW1lID0gYF8kJHtuZXh0RGVzdHJ1Y3R1cmVkSWR9YFxuXHRuZXh0RGVzdHJ1Y3R1cmVkSWQgPSBuZXh0RGVzdHJ1Y3R1cmVkSWQgKyAxXG5cdGNvbnN0IGlkRGVzdHJ1Y3R1cmVkID0gbmV3IElkZW50aWZpZXIoZGVzdHJ1Y3R1cmVkTmFtZSlcblx0Y29uc3QgZGVjbGFyYXRvcnMgPSBhc3NpZ25lZXMubWFwKGFzc2lnbmVlID0+IHtcblx0XHQvLyBUT0RPOiBEb24ndCBjb21waWxlIGl0IGlmIGl0J3MgbmV2ZXIgYWNjZXNzZWRcblx0XHRjb25zdCBnZXQgPSBnZXRNZW1iZXIoaWREZXN0cnVjdHVyZWQsIGFzc2lnbmVlLm5hbWUsIGlzTGF6eSwgaXNNb2R1bGUpXG5cdFx0cmV0dXJuIG1ha2VEZWNsYXJhdG9yKGFzc2lnbmVlLCBnZXQsIGlzTGF6eSlcblx0fSlcblx0Ly8gR2V0dGluZyBsYXp5IG1vZHVsZSBpcyBkb25lIGJ5IG1zLmxhenlHZXRNb2R1bGUuXG5cdGNvbnN0IHZhbCA9IGlzTGF6eSAmJiAhaXNNb2R1bGUgPyBsYXp5V3JhcCh2YWx1ZSkgOiB2YWx1ZVxuXHRyZXR1cm4gY2F0KG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoaWREZXN0cnVjdHVyZWQsIHZhbCksIGRlY2xhcmF0b3JzKVxufVxuIl19
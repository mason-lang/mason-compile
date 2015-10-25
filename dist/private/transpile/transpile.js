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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQWdDd0IsU0FBUzs7Ozs7Ozs7O0FBTjFCLEtBQUksYUFBYSxDQUFBOzs7QUFFeEIsS0FBSSxhQUFhLEVBQUUsZUFBZSxDQUFBO0FBQ2xDLEtBQUksa0JBQWtCLENBQUE7Ozs7QUFHUCxVQUFTLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLEVBQUU7QUFDbkUsVUFQVSxhQUFhLEdBT3ZCLGFBQWEsR0FBRyxjQUFjLENBQUE7QUFDOUIsZUFBYSxHQUFHLEtBQUssQ0FBQTtBQUNyQixpQkFBZSxHQUFHLEtBQUssQ0FBQTtBQUN2QixvQkFBa0IsR0FBRyxDQUFDLENBQUE7QUFDdEIsUUFBTSxHQUFHLEdBQUcsV0FkNkQsRUFBRSxFQWM1RCxnQkFBZ0IsQ0FBQyxDQUFBOztBQUVoQyxVQWJVLGFBQWEsR0FhdkIsYUFBYSxHQUFHLElBQUksQ0FBQTtBQUNwQixTQUFPLEdBQUcsQ0FBQTtFQUNWOztBQUVELFdBOUJpRCxhQUFhLFVBOEJwQyxXQUFXLEVBQUU7QUFDdEMsUUFBTSxHQUFHO0FBQ1IsU0FBTSxRQUFRLEdBQUcsTUFBTTtBQUN0QixVQUFNLElBQUksR0FBRyxXQXZCMEQsRUFBRSxFQXVCekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQy9CLFdBQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsa0JBekNxQixlQUFlLENBeUNoQixHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDMUQsQ0FBQTs7QUFFRCxVQUFPLFVBckNnQyxNQUFNLEVBcUMvQixJQUFJLENBQUMsUUFBUSxFQUMxQixDQUFDLElBQUksa0JBaERLLFdBQVcsQ0FnREEsUUFBUSxFQUFFLEVBQUUsV0E3QkMsT0FBTyxFQTZCQSxDQUFDLENBQUMsQ0FBQyxFQUM1QyxNQUFNO0FBQ0wsUUFBSSxJQUFJLENBQUMsU0FB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LFFBQU0sY0FBYyxHQUFHLGtCQS9uQnZCLFVBQVUsQ0ErbkI0QixnQkFBZ0IsQ0FBQyxDQUFBO0FBQ3ZELFFBQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJOztBQUU3QyxTQUFNLEdBQUcsR0FBRyxXQS9tQmdDLFNBQVMsRUErbUIvQixjQUFjLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7QUFDdEUsVUFBTyxXQWhuQm9FLGNBQWMsRUFnbkJuRSxRQUFRLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0dBQzVDLENBQUMsQ0FBQTs7QUFFRixRQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLEdBQUcsWUF2bkJyQixRQUFRLEVBdW5Cc0IsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFBO0FBQ3pELFNBQU8sVUE3bkJRLEdBQUcsRUE2bkJQLGtCQXBvQnlELGtCQUFrQixDQW9vQnBELGNBQWMsRUFBRSxHQUFHLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQTtFQUNwRSIsImZpbGUiOiJ0cmFuc3BpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FycmF5RXhwcmVzc2lvbiwgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24sIEFzc2lnbm1lbnRFeHByZXNzaW9uLCBCaW5hcnlFeHByZXNzaW9uLFxuXHRCbG9ja1N0YXRlbWVudCwgQnJlYWtTdGF0ZW1lbnQsIENhbGxFeHByZXNzaW9uLCBDYXRjaENsYXVzZSwgQ2xhc3NCb2R5LCBDbGFzc0V4cHJlc3Npb24sXG5cdENvbmRpdGlvbmFsRXhwcmVzc2lvbiwgRGVidWdnZXJTdGF0ZW1lbnQsIEZvck9mU3RhdGVtZW50LCBGb3JTdGF0ZW1lbnQsIEZ1bmN0aW9uRXhwcmVzc2lvbixcblx0SWRlbnRpZmllciwgSWZTdGF0ZW1lbnQsIExpdGVyYWwsIExvZ2ljYWxFeHByZXNzaW9uLCBNZW1iZXJFeHByZXNzaW9uLCBNZXRob2REZWZpbml0aW9uLFxuXHROZXdFeHByZXNzaW9uLCBPYmplY3RFeHByZXNzaW9uLCBQcm9wZXJ0eSwgUmV0dXJuU3RhdGVtZW50LCBTcHJlYWRFbGVtZW50LCBTd2l0Y2hDYXNlLFxuXHRTd2l0Y2hTdGF0ZW1lbnQsIFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbiwgVGVtcGxhdGVFbGVtZW50LCBUZW1wbGF0ZUxpdGVyYWwsIFRoaXNFeHByZXNzaW9uLFxuXHRUaHJvd1N0YXRlbWVudCwgVHJ5U3RhdGVtZW50LCBWYXJpYWJsZURlY2xhcmF0aW9uLCBVbmFyeUV4cHJlc3Npb24sIFZhcmlhYmxlRGVjbGFyYXRvcixcblx0WWllbGRFeHByZXNzaW9ufSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7ZnVuY3Rpb25FeHByZXNzaW9uVGh1bmssIGlkZW50aWZpZXIsIG1lbWJlciwgcHJvcGVydHlJZE9yTGl0ZXJhbH0gZnJvbSAnZXNhc3QvZGlzdC91dGlsJ1xuaW1wb3J0IHtjaGVjaywgb3B0aW9uc30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCAqIGFzIE1zQXN0VHlwZXMgZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0Fzc2lnblNpbmdsZSwgQ2FsbCwgQ29uc3RydWN0b3IsIEZ1bnMsIExvZ2ljcywgTWVtYmVyLCBMb2NhbERlY2xhcmVzLCBQYXR0ZXJuLCBTcGxhdCxcblx0U2V0dGVycywgU3BlY2lhbERvcywgU3BlY2lhbFZhbHMsIFN3aXRjaERvUGFydCwgUXVvdGVBYnN0cmFjdH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2Fzc2VydCwgY2F0LCBmbGF0TWFwLCBmbGF0T3BNYXAsIGlmRWxzZSwgaW1wbGVtZW50TWFueSwgb3BJZiwgb3BNYXAsIHRhaWx9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0FycmF5U2xpY2VDYWxsLCBEZWNsYXJlQnVpbHRCYWcsIERlY2xhcmVCdWlsdE1hcCwgRGVjbGFyZUJ1aWx0T2JqLCBEZWNsYXJlTGV4aWNhbFRoaXMsXG5cdEV4cG9ydHNEZWZhdWx0LCBJZEFyZ3VtZW50cywgSWRCdWlsdCwgSWRFeHBvcnRzLCBJZEV4dHJhY3QsIElkRm9jdXMsIElkTGV4aWNhbFRoaXMsIElkU3VwZXIsXG5cdEdsb2JhbEVycm9yLCBMaXRFbXB0eVN0cmluZywgTGl0TnVsbCwgTGl0U3RyVGhyb3csIExpdFplcm8sIFJldHVybkJ1aWx0LCBTd2l0Y2hDYXNlTm9NYXRjaCxcblx0VGhyb3dBc3NlcnRGYWlsLCBUaHJvd05vQ2FzZU1hdGNofSBmcm9tICcuL2FzdC1jb25zdGFudHMnXG5pbXBvcnQge0lkTXMsIGxhenlXcmFwLCBtc0FkZCwgbXNBZGRNYW55LCBtc0Fzc2VydCwgbXNBc3NlcnRNZW1iZXIsIG1zQXNzZXJ0Tm90LCBtc0Fzc2VydE5vdE1lbWJlcixcblx0bXNBc3luYywgbXNFeHRyYWN0LCBtc05ld011dGFibGVQcm9wZXJ0eSwgbXNOZXdQcm9wZXJ0eSwgbXNTZXRMYXp5LCBtc1NldFN1YiwgbXNTb21lLCBtc1N5bWJvbCxcblx0TXNOb25lfSBmcm9tICcuL21zLWNhbGwnXG5pbXBvcnQgdHJhbnNwaWxlTW9kdWxlIGZyb20gJy4vdHJhbnNwaWxlTW9kdWxlJ1xuaW1wb3J0IHthY2Nlc3NMb2NhbERlY2xhcmUsIGRlY2xhcmUsIGRvVGhyb3csIGdldE1lbWJlciwgaWRGb3JEZWNsYXJlQ2FjaGVkLCBtYWtlRGVjbGFyYXRvcixcblx0bWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zLCBtZW1iZXJTdHJpbmdPclZhbCwgb3BUeXBlQ2hlY2tGb3JMb2NhbERlY2xhcmUsIHQwLCB0MSwgdDIsIHQzLCB0TGluZXNcblx0fSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBsZXQgdmVyaWZ5UmVzdWx0c1xuLy8gaXNJbkdlbmVyYXRvciBtZWFucyB3ZSBhcmUgaW4gYW4gYXN5bmMgb3IgZ2VuZXJhdG9yIGZ1bmN0aW9uLlxubGV0IGlzSW5HZW5lcmF0b3IsIGlzSW5Db25zdHJ1Y3RvclxubGV0IG5leHREZXN0cnVjdHVyZWRJZFxuXG4vKiogVHJhbnNmb3JtIGEge0BsaW5rIE1zQXN0fSBpbnRvIGFuIGVzYXN0LiAqKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRyYW5zcGlsZShtb2R1bGVFeHByZXNzaW9uLCBfdmVyaWZ5UmVzdWx0cykge1xuXHR2ZXJpZnlSZXN1bHRzID0gX3ZlcmlmeVJlc3VsdHNcblx0aXNJbkdlbmVyYXRvciA9IGZhbHNlXG5cdGlzSW5Db25zdHJ1Y3RvciA9IGZhbHNlXG5cdG5leHREZXN0cnVjdHVyZWRJZCA9IDBcblx0Y29uc3QgcmVzID0gdDAobW9kdWxlRXhwcmVzc2lvbilcblx0Ly8gUmVsZWFzZSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuXHR2ZXJpZnlSZXN1bHRzID0gbnVsbFxuXHRyZXR1cm4gcmVzXG59XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ3RyYW5zcGlsZScsIHtcblx0QXNzZXJ0KCkge1xuXHRcdGNvbnN0IGZhaWxDb25kID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgY29uZCA9IHQwKHRoaXMuY29uZGl0aW9uKVxuXHRcdFx0cmV0dXJuIHRoaXMubmVnYXRlID8gY29uZCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCBjb25kKVxuXHRcdH1cblxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcFRocm93bixcblx0XHRcdF8gPT4gbmV3IElmU3RhdGVtZW50KGZhaWxDb25kKCksIGRvVGhyb3coXykpLFxuXHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5jb25kaXRpb24gaW5zdGFuY2VvZiBDYWxsKSB7XG5cdFx0XHRcdFx0Y29uc3QgY2FsbCA9IHRoaXMuY29uZGl0aW9uXG5cdFx0XHRcdFx0Y29uc3QgY2FsbGVkID0gY2FsbC5jYWxsZWRcblx0XHRcdFx0XHRjb25zdCBhcmdzID0gY2FsbC5hcmdzLm1hcCh0MClcblx0XHRcdFx0XHRpZiAoY2FsbGVkIGluc3RhbmNlb2YgTWVtYmVyKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBhc3MgPSB0aGlzLm5lZ2F0ZSA/IG1zQXNzZXJ0Tm90TWVtYmVyIDogbXNBc3NlcnRNZW1iZXJcblx0XHRcdFx0XHRcdHJldHVybiBhc3ModDAoY2FsbGVkLm9iamVjdCksIG5ldyBMaXRlcmFsKGNhbGxlZC5uYW1lKSwgLi4uYXJncylcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc3QgYXNzID0gdGhpcy5uZWdhdGUgPyBtc0Fzc2VydE5vdCA6IG1zQXNzZXJ0XG5cdFx0XHRcdFx0XHRyZXR1cm4gYXNzKHQwKGNhbGxlZCksIC4uLmFyZ3MpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KGZhaWxDb25kKCksIFRocm93QXNzZXJ0RmFpbClcblx0XHRcdH0pXG5cdH0sXG5cblx0QXNzaWduU2luZ2xlKHZhbFdyYXApIHtcblx0XHRjb25zdCB2YWwgPSB2YWxXcmFwID09PSB1bmRlZmluZWQgPyB0MCh0aGlzLnZhbHVlKSA6IHZhbFdyYXAodDAodGhpcy52YWx1ZSkpXG5cdFx0Y29uc3QgZGVjbGFyZSA9IG1ha2VEZWNsYXJhdG9yKHRoaXMuYXNzaWduZWUsIHZhbCwgZmFsc2UpXG5cdFx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKHRoaXMuYXNzaWduZWUuaXNNdXRhYmxlKCkgPyAnbGV0JyA6ICdjb25zdCcsIFtkZWNsYXJlXSlcblx0fSxcblx0Ly8gVE9ETzpFUzYgSnVzdCB1c2UgbmF0aXZlIGRlc3RydWN0dXJpbmcgYXNzaWduXG5cdEFzc2lnbkRlc3RydWN0dXJlKCkge1xuXHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbihcblx0XHRcdHRoaXMua2luZCgpID09PSBMb2NhbERlY2xhcmVzLk11dGFibGUgPyAnbGV0JyA6ICdjb25zdCcsXG5cdFx0XHRtYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycyhcblx0XHRcdFx0dGhpcy5hc3NpZ25lZXMsXG5cdFx0XHRcdHRoaXMua2luZCgpID09PSBMb2NhbERlY2xhcmVzLkxhenksXG5cdFx0XHRcdHQwKHRoaXMudmFsdWUpLFxuXHRcdFx0XHRmYWxzZSkpXG5cdH0sXG5cblx0QmFnRW50cnkoKSB7IHJldHVybiBtc0FkZChJZEJ1aWx0LCB0MCh0aGlzLnZhbHVlKSkgfSxcblxuXHRCYWdFbnRyeU1hbnkoKSB7IHJldHVybiBtc0FkZE1hbnkoSWRCdWlsdCwgdDAodGhpcy52YWx1ZSkpIH0sXG5cblx0QmFnU2ltcGxlKCkgeyByZXR1cm4gbmV3IEFycmF5RXhwcmVzc2lvbih0aGlzLnBhcnRzLm1hcCh0MCkpIH0sXG5cblx0QmxvY2tEbyhsZWFkPW51bGwsIG9wUmV0dXJuVHlwZT1udWxsLCBmb2xsb3c9bnVsbCkge1xuXHRcdGFzc2VydChvcFJldHVyblR5cGUgPT09IG51bGwpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgdExpbmVzKHRoaXMubGluZXMpLCBmb2xsb3cpKVxuXHR9LFxuXG5cdEJsb2NrVmFsVGhyb3cobGVhZD1udWxsLCBfb3BSZXR1cm5UeXBlKSB7XG5cdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgdExpbmVzKHRoaXMubGluZXMpLCB0MCh0aGlzLnRocm93KSkpXG5cdH0sXG5cblx0QmxvY2tWYWxSZXR1cm4obGVhZD1udWxsLCBvcFJldHVyblR5cGU9bnVsbCkge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayh0MCh0aGlzLnJldHVybmVkKSwgdExpbmVzKHRoaXMubGluZXMpLCBsZWFkLCBvcFJldHVyblR5cGUpXG5cdH0sXG5cblx0QmxvY2tCYWcobGVhZD1udWxsLCBvcFJldHVyblR5cGU9bnVsbCkge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayhcblx0XHRcdElkQnVpbHQsXG5cdFx0XHRjYXQoRGVjbGFyZUJ1aWx0QmFnLCB0TGluZXModGhpcy5saW5lcykpLFxuXHRcdFx0bGVhZCwgb3BSZXR1cm5UeXBlKVxuXHR9LFxuXG5cdEJsb2NrT2JqKGxlYWQ9bnVsbCwgb3BSZXR1cm5UeXBlPW51bGwpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2soXG5cdFx0XHRJZEJ1aWx0LFxuXHRcdFx0Y2F0KERlY2xhcmVCdWlsdE9iaiwgdExpbmVzKHRoaXMubGluZXMpKSxcblx0XHRcdGxlYWQsIG9wUmV0dXJuVHlwZSlcblx0fSxcblxuXHRCbG9ja01hcChsZWFkPW51bGwsIG9wUmV0dXJuVHlwZT1udWxsKSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKFxuXHRcdFx0SWRCdWlsdCxcblx0XHRcdGNhdChEZWNsYXJlQnVpbHRNYXAsIHRMaW5lcyh0aGlzLmxpbmVzKSksXG5cdFx0XHRsZWFkLCBvcFJldHVyblR5cGUpXG5cdH0sXG5cblx0QmxvY2tXcmFwKCkge1xuXHRcdHJldHVybiBibG9ja1dyYXAodDAodGhpcy5ibG9jaykpXG5cdH0sXG5cblx0QnJlYWsoKSB7XG5cdFx0cmV0dXJuIG5ldyBCcmVha1N0YXRlbWVudCgpXG5cdH0sXG5cblx0QnJlYWtXaXRoVmFsKCkge1xuXHRcdHJldHVybiBuZXcgUmV0dXJuU3RhdGVtZW50KHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdENhbGwoKSB7XG5cdFx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbih0MCh0aGlzLmNhbGxlZCksIHRoaXMuYXJncy5tYXAodDApKVxuXHR9LFxuXG5cdENhc2VEbygpIHtcblx0XHRjb25zdCBib2R5ID0gY2FzZUJvZHkodGhpcy5wYXJ0cywgdGhpcy5vcEVsc2UpXG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wQ2FzZWQsIF8gPT4gbmV3IEJsb2NrU3RhdGVtZW50KFt0MChfKSwgYm9keV0pLCAoKSA9PiBib2R5KVxuXHR9LFxuXHRDYXNlVmFsKCkge1xuXHRcdGNvbnN0IGJvZHkgPSBjYXNlQm9keSh0aGlzLnBhcnRzLCB0aGlzLm9wRWxzZSlcblx0XHRjb25zdCBibG9jayA9IGlmRWxzZSh0aGlzLm9wQ2FzZWQsIF8gPT4gW3QwKF8pLCBib2R5XSwgKCkgPT4gW2JvZHldKVxuXHRcdHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KGJsb2NrKSlcblx0fSxcblx0Q2FzZURvUGFydDogY2FzZVBhcnQsXG5cdENhc2VWYWxQYXJ0OiBjYXNlUGFydCxcblxuXHRDbGFzcygpIHtcblx0XHRjb25zdCBtZXRob2RzID0gY2F0KFxuXHRcdFx0dGhpcy5zdGF0aWNzLm1hcChfID0+IHQxKF8sIHRydWUpKSxcblx0XHRcdG9wTWFwKHRoaXMub3BDb25zdHJ1Y3RvciwgdDApLFxuXHRcdFx0dGhpcy5tZXRob2RzLm1hcChfID0+IHQxKF8sIGZhbHNlKSkpXG5cdFx0Y29uc3Qgb3BOYW1lID0gb3BNYXAodmVyaWZ5UmVzdWx0cy5vcE5hbWUodGhpcyksIGlkZW50aWZpZXIpXG5cdFx0Y29uc3QgY2xhc3NFeHByID0gbmV3IENsYXNzRXhwcmVzc2lvbihcblx0XHRcdG9wTmFtZSxcblx0XHRcdG9wTWFwKHRoaXMub3BTdXBlckNsYXNzLCB0MCksIG5ldyBDbGFzc0JvZHkobWV0aG9kcykpXG5cblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BEbywgXyA9PiB0MShfLCBjbGFzc0V4cHIpLCAoKSA9PiBjbGFzc0V4cHIpXG5cdH0sXG5cblx0Q2xhc3NEbyhjbGFzc0V4cHIpIHtcblx0XHRjb25zdCBsZWFkID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgW1xuXHRcdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRvcih0MCh0aGlzLmRlY2xhcmVGb2N1cyksIGNsYXNzRXhwcildKVxuXHRcdGNvbnN0IHJldCA9IG5ldyBSZXR1cm5TdGF0ZW1lbnQodDAodGhpcy5kZWNsYXJlRm9jdXMpKVxuXHRcdGNvbnN0IGJsb2NrID0gdDModGhpcy5ibG9jaywgbGVhZCwgbnVsbCwgcmV0KVxuXHRcdHJldHVybiBibG9ja1dyYXAoYmxvY2spXG5cdH0sXG5cblx0Q29uZCgpIHtcblx0XHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0MCh0aGlzLnRlc3QpLCB0MCh0aGlzLmlmVHJ1ZSksIHQwKHRoaXMuaWZGYWxzZSkpXG5cdH0sXG5cblx0Q29uZGl0aW9uYWxEbygpIHtcblx0XHRjb25zdCB0ZXN0ID0gdDAodGhpcy50ZXN0KVxuXHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQoXG5cdFx0XHR0aGlzLmlzVW5sZXNzID8gbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIHRlc3QpIDogdGVzdCxcblx0XHRcdHQwKHRoaXMucmVzdWx0KSlcblx0fSxcblxuXHRDb25kaXRpb25hbFZhbCgpIHtcblx0XHRjb25zdCB0ZXN0ID0gdDAodGhpcy50ZXN0KVxuXHRcdGNvbnN0IHJlc3VsdCA9IG1zU29tZShibG9ja1dyYXAodDAodGhpcy5yZXN1bHQpKSlcblx0XHRyZXR1cm4gdGhpcy5pc1VubGVzcyA/XG5cdFx0XHRuZXcgQ29uZGl0aW9uYWxFeHByZXNzaW9uKHRlc3QsIE1zTm9uZSwgcmVzdWx0KSA6XG5cdFx0XHRuZXcgQ29uZGl0aW9uYWxFeHByZXNzaW9uKHRlc3QsIHJlc3VsdCwgTXNOb25lKVxuXHR9LFxuXG5cdENvbnN0cnVjdG9yKCkge1xuXHRcdGlzSW5Db25zdHJ1Y3RvciA9IHRydWVcblxuXHRcdC8vIElmIHRoZXJlIGlzIGEgYHN1cGVyIWAsIGB0aGlzYCB3aWxsIG5vdCBiZSBkZWZpbmVkIHVudGlsIHRoZW4sIHNvIG11c3Qgd2FpdCB1bnRpbCB0aGVuLlxuXHRcdC8vIE90aGVyd2lzZSwgZG8gaXQgYXQgdGhlIGJlZ2lubmluZy5cblx0XHRjb25zdCBib2R5ID0gdmVyaWZ5UmVzdWx0cy5jb25zdHJ1Y3RvclRvU3VwZXIuaGFzKHRoaXMpID9cblx0XHRcdHQwKHRoaXMuZnVuKSA6XG5cdFx0XHR0MSh0aGlzLmZ1biwgY29uc3RydWN0b3JTZXRNZW1iZXJzKHRoaXMpKVxuXG5cdFx0Y29uc3QgcmVzID0gTWV0aG9kRGVmaW5pdGlvbi5jb25zdHJ1Y3Rvcihib2R5KVxuXHRcdGlzSW5Db25zdHJ1Y3RvciA9IGZhbHNlXG5cdFx0cmV0dXJuIHJlc1xuXHR9LFxuXG5cdENhdGNoKCkge1xuXHRcdHJldHVybiBuZXcgQ2F0Y2hDbGF1c2UodDAodGhpcy5jYXVnaHQpLCB0MCh0aGlzLmJsb2NrKSlcblx0fSxcblxuXHRFeGNlcHREbygpIHsgcmV0dXJuIHRyYW5zcGlsZUV4Y2VwdCh0aGlzKSB9LFxuXHRFeGNlcHRWYWwoKSB7IHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFt0cmFuc3BpbGVFeGNlcHQodGhpcyldKSkgfSxcblxuXHRGb3JEbygpIHsgcmV0dXJuIGZvckxvb3AodGhpcy5vcEl0ZXJhdGVlLCB0aGlzLmJsb2NrKSB9LFxuXG5cdEZvckJhZygpIHtcblx0XHRyZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChbXG5cdFx0XHREZWNsYXJlQnVpbHRCYWcsXG5cdFx0XHRmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jayksXG5cdFx0XHRSZXR1cm5CdWlsdFxuXHRcdF0pKVxuXHR9LFxuXG5cdEZvclZhbCgpIHtcblx0XHRyZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChbZm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spXSkpXG5cdH0sXG5cblx0RnVuKGxlYWRTdGF0ZW1lbnRzPW51bGwpIHtcblx0XHRjb25zdCBpc0dlbmVyYXRvckZ1biA9IHRoaXMua2luZCAhPT0gRnVucy5QbGFpblxuXHRcdGNvbnN0IG9sZEluR2VuZXJhdG9yID0gaXNJbkdlbmVyYXRvclxuXHRcdGlzSW5HZW5lcmF0b3IgPSBpc0dlbmVyYXRvckZ1blxuXG5cdFx0Ly8gVE9ETzpFUzYgdXNlIGAuLi5gZlxuXHRcdGNvbnN0IG5BcmdzID0gbmV3IExpdGVyYWwodGhpcy5hcmdzLmxlbmd0aClcblx0XHRjb25zdCBvcERlY2xhcmVSZXN0ID0gb3BNYXAodGhpcy5vcFJlc3RBcmcsIHJlc3QgPT5cblx0XHRcdGRlY2xhcmUocmVzdCwgbmV3IENhbGxFeHByZXNzaW9uKEFycmF5U2xpY2VDYWxsLCBbSWRBcmd1bWVudHMsIG5BcmdzXSkpKVxuXHRcdGNvbnN0IGFyZ0NoZWNrcyA9IG9wSWYob3B0aW9ucy5pbmNsdWRlQ2hlY2tzKCksICgpID0+XG5cdFx0XHRmbGF0T3BNYXAodGhpcy5hcmdzLCBvcFR5cGVDaGVja0ZvckxvY2FsRGVjbGFyZSkpXG5cblx0XHRjb25zdCBvcERlY2xhcmVUaGlzID1cblx0XHRcdG9wSWYoIWlzSW5Db25zdHJ1Y3RvciAmJiB0aGlzLm9wRGVjbGFyZVRoaXMgIT0gbnVsbCwgKCkgPT4gRGVjbGFyZUxleGljYWxUaGlzKVxuXG5cdFx0Y29uc3QgbGVhZCA9IGNhdChsZWFkU3RhdGVtZW50cywgb3BEZWNsYXJlVGhpcywgb3BEZWNsYXJlUmVzdCwgYXJnQ2hlY2tzKVxuXG5cdFx0Y29uc3QgYm9keSA9IHQyKHRoaXMuYmxvY2ssIGxlYWQsIHRoaXMub3BSZXR1cm5UeXBlKVxuXHRcdGNvbnN0IGFyZ3MgPSB0aGlzLmFyZ3MubWFwKHQwKVxuXHRcdGlzSW5HZW5lcmF0b3IgPSBvbGRJbkdlbmVyYXRvclxuXHRcdGNvbnN0IGlkID0gb3BNYXAodmVyaWZ5UmVzdWx0cy5vcE5hbWUodGhpcyksIGlkZW50aWZpZXIpXG5cblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBGdW5zLlBsYWluOlxuXHRcdFx0XHQvLyBUT0RPOkVTNiBTaG91bGQgYmUgYWJsZSB0byB1c2UgcmVzdCBhcmdzIGluIGFycm93IGZ1bmN0aW9uXG5cdFx0XHRcdGlmIChpZCA9PT0gbnVsbCAmJiB0aGlzLm9wRGVjbGFyZVRoaXMgPT09IG51bGwgJiYgb3BEZWNsYXJlUmVzdCA9PT0gbnVsbClcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKGFyZ3MsIGJvZHkpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihpZCwgYXJncywgYm9keSlcblx0XHRcdGNhc2UgRnVucy5Bc3luYzoge1xuXHRcdFx0XHRjb25zdCBuZXdCb2R5ID0gbmV3IEJsb2NrU3RhdGVtZW50KFtcblx0XHRcdFx0XHRuZXcgUmV0dXJuU3RhdGVtZW50KG1zQXN5bmMobmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihpZCwgW10sIGJvZHksIHRydWUpKSlcblx0XHRcdFx0XSlcblx0XHRcdFx0cmV0dXJuIG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIGFyZ3MsIG5ld0JvZHkpXG5cdFx0XHR9XG5cdFx0XHRjYXNlIEZ1bnMuR2VuZXJhdG9yOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihpZCwgYXJncywgYm9keSwgdHJ1ZSlcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcih0aGlzLmtpbmQpXG5cdFx0fVxuXHR9LFxuXG5cdElnbm9yZSgpIHtcblx0XHRyZXR1cm4gW11cblx0fSxcblxuXHRMYXp5KCkge1xuXHRcdHJldHVybiBsYXp5V3JhcCh0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRNZXRob2RJbXBsKGlzU3RhdGljKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSB0MCh0aGlzLmZ1bilcblx0XHRhc3NlcnQodmFsdWUuaWQgPT0gbnVsbClcblx0XHQvLyBTaW5jZSB0aGUgRnVuIHNob3VsZCBoYXZlIG9wRGVjbGFyZVRoaXMsIGl0IHdpbGwgbmV2ZXIgYmUgYW4gQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24uXG5cdFx0YXNzZXJ0KHZhbHVlIGluc3RhbmNlb2YgRnVuY3Rpb25FeHByZXNzaW9uKVxuXG5cdFx0Y29uc3Qge2tleSwgY29tcHV0ZWR9ID0gbWV0aG9kS2V5Q29tcHV0ZWQodGhpcy5zeW1ib2wpXG5cdFx0cmV0dXJuIG5ldyBNZXRob2REZWZpbml0aW9uKGtleSwgdmFsdWUsICdtZXRob2QnLCBpc1N0YXRpYywgY29tcHV0ZWQpXG5cdH0sXG5cdE1ldGhvZEdldHRlcihpc1N0YXRpYykge1xuXHRcdGNvbnN0IHZhbHVlID0gbmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihudWxsLCBbXSwgdDEodGhpcy5ibG9jaywgRGVjbGFyZUxleGljYWxUaGlzKSlcblx0XHRjb25zdCB7a2V5LCBjb21wdXRlZH0gPSBtZXRob2RLZXlDb21wdXRlZCh0aGlzLnN5bWJvbClcblx0XHRyZXR1cm4gbmV3IE1ldGhvZERlZmluaXRpb24oa2V5LCB2YWx1ZSwgJ2dldCcsIGlzU3RhdGljLCBjb21wdXRlZClcblx0fSxcblx0TWV0aG9kU2V0dGVyKGlzU3RhdGljKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFtJZEZvY3VzXSwgdDEodGhpcy5ibG9jaywgRGVjbGFyZUxleGljYWxUaGlzKSlcblx0XHRjb25zdCB7a2V5LCBjb21wdXRlZH0gPSBtZXRob2RLZXlDb21wdXRlZCh0aGlzLnN5bWJvbClcblx0XHRyZXR1cm4gbmV3IE1ldGhvZERlZmluaXRpb24oa2V5LCB2YWx1ZSwgJ3NldCcsIGlzU3RhdGljLCBjb21wdXRlZClcblx0fSxcblxuXHROdW1iZXJMaXRlcmFsKCkge1xuXHRcdC8vIE5lZ2F0aXZlIG51bWJlcnMgYXJlIG5vdCBwYXJ0IG9mIEVTIHNwZWMuXG5cdFx0Ly8gaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzUuMS8jc2VjLTcuOC4zXG5cdFx0Y29uc3QgdmFsdWUgPSBOdW1iZXIodGhpcy52YWx1ZSlcblx0XHRjb25zdCBsaXQgPSBuZXcgTGl0ZXJhbChNYXRoLmFicyh2YWx1ZSkpXG5cdFx0Y29uc3QgaXNQb3NpdGl2ZSA9IHZhbHVlID49IDAgJiYgMSAvIHZhbHVlICE9PSAtSW5maW5pdHlcblx0XHRyZXR1cm4gaXNQb3NpdGl2ZSA/IGxpdCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJy0nLCBsaXQpXG5cdH0sXG5cblx0TG9jYWxBY2Nlc3MoKSB7XG5cdFx0aWYgKHRoaXMubmFtZSA9PT0gJ3RoaXMnKVxuXHRcdFx0cmV0dXJuIGlzSW5Db25zdHJ1Y3RvciA/IG5ldyBUaGlzRXhwcmVzc2lvbigpIDogSWRMZXhpY2FsVGhpc1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgbGQgPSB2ZXJpZnlSZXN1bHRzLmxvY2FsRGVjbGFyZUZvckFjY2Vzcyh0aGlzKVxuXHRcdFx0Ly8gSWYgbGQgbWlzc2luZywgdGhpcyBpcyBhIGJ1aWx0aW4sIGFuZCBidWlsdGlucyBhcmUgbmV2ZXIgbGF6eVxuXHRcdFx0cmV0dXJuIGxkID09PSB1bmRlZmluZWQgPyBpZGVudGlmaWVyKHRoaXMubmFtZSkgOiBhY2Nlc3NMb2NhbERlY2xhcmUobGQpXG5cdFx0fVxuXHR9LFxuXG5cdExvY2FsRGVjbGFyZSgpIHsgcmV0dXJuIG5ldyBJZGVudGlmaWVyKGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzKS5uYW1lKSB9LFxuXG5cdExvY2FsTXV0YXRlKCkge1xuXHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBpZGVudGlmaWVyKHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdExvZ2ljKCkge1xuXHRcdGNvbnN0IG9wID0gdGhpcy5raW5kID09PSBMb2dpY3MuQW5kID8gJyYmJyA6ICd8fCdcblx0XHRyZXR1cm4gdGFpbCh0aGlzLmFyZ3MpLnJlZHVjZSgoYSwgYikgPT5cblx0XHRcdG5ldyBMb2dpY2FsRXhwcmVzc2lvbihvcCwgYSwgdDAoYikpLCB0MCh0aGlzLmFyZ3NbMF0pKVxuXHR9LFxuXG5cdE1hcEVudHJ5KCkgeyByZXR1cm4gbXNTZXRTdWIoSWRCdWlsdCwgdDAodGhpcy5rZXkpLCB0MCh0aGlzLnZhbCkpIH0sXG5cblx0TWVtYmVyKCkge1xuXHRcdHJldHVybiBtZW1iZXJTdHJpbmdPclZhbCh0MCh0aGlzLm9iamVjdCksIHRoaXMubmFtZSlcblx0fSxcblxuXHRNZW1iZXJTZXQoKSB7XG5cdFx0Y29uc3Qgb2JqID0gdDAodGhpcy5vYmplY3QpXG5cdFx0Y29uc3QgbmFtZSA9ICgpID0+XG5cdFx0XHR0eXBlb2YgdGhpcy5uYW1lID09PSAnc3RyaW5nJyA/IG5ldyBMaXRlcmFsKHRoaXMubmFtZSkgOiB0MCh0aGlzLm5hbWUpXG5cdFx0Y29uc3QgdmFsID0gbWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHQwKHRoaXMudmFsdWUpLCB0aGlzLm9wVHlwZSwgdGhpcy5uYW1lKVxuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIFNldHRlcnMuSW5pdDpcblx0XHRcdFx0cmV0dXJuIG1zTmV3UHJvcGVydHkob2JqLCBuYW1lKCksIHZhbClcblx0XHRcdGNhc2UgU2V0dGVycy5Jbml0TXV0YWJsZTpcblx0XHRcdFx0cmV0dXJuIG1zTmV3TXV0YWJsZVByb3BlcnR5KG9iaiwgbmFtZSgpLCB2YWwpXG5cdFx0XHRjYXNlIFNldHRlcnMuTXV0YXRlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyU3RyaW5nT3JWYWwob2JqLCB0aGlzLm5hbWUpLCB2YWwpXG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdH1cblx0fSxcblxuXHRNb2R1bGU6IHRyYW5zcGlsZU1vZHVsZSxcblxuXHRNb2R1bGVFeHBvcnROYW1lZCgpIHtcblx0XHRyZXR1cm4gdDEodGhpcy5hc3NpZ24sIHZhbCA9PlxuXHRcdFx0bmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyKElkRXhwb3J0cywgdGhpcy5hc3NpZ24uYXNzaWduZWUubmFtZSksIHZhbCkpXG5cdH0sXG5cblx0TW9kdWxlRXhwb3J0RGVmYXVsdCgpIHtcblx0XHRyZXR1cm4gdDEodGhpcy5hc3NpZ24sIHZhbCA9PiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBFeHBvcnRzRGVmYXVsdCwgdmFsKSlcblx0fSxcblxuXHROZXcoKSB7XG5cdFx0Y29uc3QgYW55U3BsYXQgPSB0aGlzLmFyZ3Muc29tZShfID0+IF8gaW5zdGFuY2VvZiBTcGxhdClcblx0XHRjaGVjayghYW55U3BsYXQsIHRoaXMubG9jLCAnVE9ETzogU3BsYXQgcGFyYW1zIGZvciBuZXcnKVxuXHRcdHJldHVybiBuZXcgTmV3RXhwcmVzc2lvbih0MCh0aGlzLnR5cGUpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHROb3QoKSB7IHJldHVybiBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgdDAodGhpcy5hcmcpKSB9LFxuXG5cdE9iakVudHJ5QXNzaWduKCkge1xuXHRcdHJldHVybiB0aGlzLmFzc2lnbiBpbnN0YW5jZW9mIEFzc2lnblNpbmdsZSAmJiAhdGhpcy5hc3NpZ24uYXNzaWduZWUuaXNMYXp5KCkgP1xuXHRcdFx0dDEodGhpcy5hc3NpZ24sIHZhbCA9PlxuXHRcdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRCdWlsdCwgdGhpcy5hc3NpZ24uYXNzaWduZWUubmFtZSksIHZhbCkpIDpcblx0XHRcdGNhdChcblx0XHRcdFx0dDAodGhpcy5hc3NpZ24pLFxuXHRcdFx0XHR0aGlzLmFzc2lnbi5hbGxBc3NpZ25lZXMoKS5tYXAoXyA9PlxuXHRcdFx0XHRcdG1zU2V0TGF6eShJZEJ1aWx0LCBuZXcgTGl0ZXJhbChfLm5hbWUpLCBpZEZvckRlY2xhcmVDYWNoZWQoXykpKSlcblx0fSxcblxuXHRPYmpFbnRyeVBsYWluKCkge1xuXHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXJTdHJpbmdPclZhbChJZEJ1aWx0LCB0aGlzLm5hbWUpLCB0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRPYmpTaW1wbGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBPYmplY3RFeHByZXNzaW9uKHRoaXMucGFpcnMubWFwKHBhaXIgPT5cblx0XHRcdG5ldyBQcm9wZXJ0eSgnaW5pdCcsIHByb3BlcnR5SWRPckxpdGVyYWwocGFpci5rZXkpLCB0MChwYWlyLnZhbHVlKSkpKVxuXHR9LFxuXG5cdFF1b3RlUGxhaW4oKSB7XG5cdFx0aWYgKHRoaXMucGFydHMubGVuZ3RoID09PSAwKVxuXHRcdFx0cmV0dXJuIExpdEVtcHR5U3RyaW5nXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBxdWFzaXMgPSBbXSwgZXhwcmVzc2lvbnMgPSBbXVxuXG5cdFx0XHQvLyBUZW1wbGF0ZUxpdGVyYWwgbXVzdCBzdGFydCB3aXRoIGEgVGVtcGxhdGVFbGVtZW50XG5cdFx0XHRpZiAodHlwZW9mIHRoaXMucGFydHNbMF0gIT09ICdzdHJpbmcnKVxuXHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZW1wdHkpXG5cblx0XHRcdGZvciAobGV0IHBhcnQgb2YgdGhpcy5wYXJ0cylcblx0XHRcdFx0aWYgKHR5cGVvZiBwYXJ0ID09PSAnc3RyaW5nJylcblx0XHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZm9yUmF3U3RyaW5nKHBhcnQpKVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHQvLyBcInsxfXsxfVwiIG5lZWRzIGFuIGVtcHR5IHF1YXNpIGluIHRoZSBtaWRkbGUgKGFuZCBvbiB0aGUgZW5kcylcblx0XHRcdFx0XHRpZiAocXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoKVxuXHRcdFx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmVtcHR5KVxuXHRcdFx0XHRcdGV4cHJlc3Npb25zLnB1c2godDAocGFydCkpXG5cdFx0XHRcdH1cblxuXHRcdFx0Ly8gVGVtcGxhdGVMaXRlcmFsIG11c3QgZW5kIHdpdGggYSBUZW1wbGF0ZUVsZW1lbnQsIHNvIG9uZSBtb3JlIHF1YXNpIHRoYW4gZXhwcmVzc2lvbi5cblx0XHRcdGlmIChxdWFzaXMubGVuZ3RoID09PSBleHByZXNzaW9ucy5sZW5ndGgpXG5cdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5lbXB0eSlcblxuXHRcdFx0cmV0dXJuIG5ldyBUZW1wbGF0ZUxpdGVyYWwocXVhc2lzLCBleHByZXNzaW9ucylcblx0XHR9XG5cdH0sXG5cblx0UXVvdGVTaW1wbGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBMaXRlcmFsKHRoaXMubmFtZSlcblx0fSxcblxuXHRRdW90ZVRhZ2dlZFRlbXBsYXRlKCkge1xuXHRcdHJldHVybiBuZXcgVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uKHQwKHRoaXMudGFnKSwgdDAodGhpcy5xdW90ZSkpXG5cdH0sXG5cblx0U2V0U3ViKCkge1xuXHRcdGNvbnN0IGdldEtpbmQgPSAoKSA9PiB7XG5cdFx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0XHRjYXNlIFNldHRlcnMuSW5pdDpcblx0XHRcdFx0XHRyZXR1cm4gJ2luaXQnXG5cdFx0XHRcdGNhc2UgU2V0dGVycy5Jbml0TXV0YWJsZTpcblx0XHRcdFx0XHRyZXR1cm4gJ2luaXQtbXV0YWJsZSdcblx0XHRcdFx0Y2FzZSBTZXR0ZXJzLk11dGF0ZTpcblx0XHRcdFx0XHRyZXR1cm4gJ211dGF0ZSdcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRjb25zdCBraW5kID0gZ2V0S2luZCgpXG5cdFx0cmV0dXJuIG1zU2V0U3ViKFxuXHRcdFx0dDAodGhpcy5vYmplY3QpLFxuXHRcdFx0dGhpcy5zdWJiZWRzLmxlbmd0aCA9PT0gMSA/IHQwKHRoaXMuc3ViYmVkc1swXSkgOiB0aGlzLnN1YmJlZHMubWFwKHQwKSxcblx0XHRcdG1heWJlV3JhcEluQ2hlY2tDb250YWlucyh0MCh0aGlzLnZhbHVlKSwgdGhpcy5vcFR5cGUsICd2YWx1ZScpLFxuXHRcdFx0bmV3IExpdGVyYWwoa2luZCkpXG5cdH0sXG5cblx0U3BlY2lhbERvKCkge1xuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIFNwZWNpYWxEb3MuRGVidWdnZXI6IHJldHVybiBuZXcgRGVidWdnZXJTdGF0ZW1lbnQoKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHR9XG5cdH0sXG5cblx0U3BlY2lhbFZhbCgpIHtcblx0XHQvLyBNYWtlIG5ldyBvYmplY3RzIGJlY2F1c2Ugd2Ugd2lsbCBhc3NpZ24gYGxvY2AgdG8gdGhlbS5cblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5Db250YWluczpcblx0XHRcdFx0cmV0dXJuIG1lbWJlcihJZE1zLCAnY29udGFpbnMnKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5EZWxTdWI6XG5cdFx0XHRcdHJldHVybiBtZW1iZXIoSWRNcywgJ2RlbFN1YicpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLkZhbHNlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IExpdGVyYWwoZmFsc2UpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLk5hbWU6XG5cdFx0XHRcdHJldHVybiBuZXcgTGl0ZXJhbCh2ZXJpZnlSZXN1bHRzLm5hbWUodGhpcykpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLk51bGw6XG5cdFx0XHRcdHJldHVybiBuZXcgTGl0ZXJhbChudWxsKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5TZXRTdWI6XG5cdFx0XHRcdHJldHVybiBtZW1iZXIoSWRNcywgJ3NldFN1YicpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLlN1Yjpcblx0XHRcdFx0cmV0dXJuIG1lbWJlcihJZE1zLCAnc3ViJylcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuVHJ1ZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKHRydWUpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLlVuZGVmaW5lZDpcblx0XHRcdFx0cmV0dXJuIG5ldyBVbmFyeUV4cHJlc3Npb24oJ3ZvaWQnLCBMaXRaZXJvKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHR9XG5cdH0sXG5cblx0U3BsYXQoKSB7XG5cdFx0cmV0dXJuIG5ldyBTcHJlYWRFbGVtZW50KHQwKHRoaXMuc3BsYXR0ZWQpKVxuXHR9LFxuXG5cdFN1cGVyQ2FsbDogc3VwZXJDYWxsLFxuXHRTdXBlckNhbGxEbzogc3VwZXJDYWxsLFxuXHRTdXBlck1lbWJlcigpIHtcblx0XHRyZXR1cm4gbWVtYmVyU3RyaW5nT3JWYWwoSWRTdXBlciwgdGhpcy5uYW1lKVxuXHR9LFxuXG5cdFN3aXRjaERvKCkgeyByZXR1cm4gdHJhbnNwaWxlU3dpdGNoKHRoaXMpIH0sXG5cdFN3aXRjaFZhbCgpIHsgcmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW3RyYW5zcGlsZVN3aXRjaCh0aGlzKV0pKSB9LFxuXHRTd2l0Y2hEb1BhcnQ6IHN3aXRjaFBhcnQsXG5cdFN3aXRjaFZhbFBhcnQ6IHN3aXRjaFBhcnQsXG5cblx0VGhpc0Z1bigpIHtcblx0XHQvLyB0aGlzLntuYW1lfS5iaW5kKHRoaXMpXG5cdFx0Y29uc3QgZnVuID0gbWVtYmVyKElkTGV4aWNhbFRoaXMsIHRoaXMubmFtZSlcblx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKG1lbWJlcihmdW4sICdiaW5kJyksIFtJZExleGljYWxUaGlzXSlcblx0fSxcblxuXHRUaHJvdygpIHtcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BUaHJvd24sXG5cdFx0XHRfID0+IGRvVGhyb3coXyksXG5cdFx0XHQoKSA9PiBuZXcgVGhyb3dTdGF0ZW1lbnQobmV3IE5ld0V4cHJlc3Npb24oR2xvYmFsRXJyb3IsIFtMaXRTdHJUaHJvd10pKSlcblx0fSxcblxuXHRXaXRoKCkge1xuXHRcdGNvbnN0IGlkRGVjbGFyZSA9IGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzLmRlY2xhcmUpXG5cdFx0Y29uc3QgYmxvY2sgPSB0Myh0aGlzLmJsb2NrLCBudWxsLCBudWxsLCBuZXcgUmV0dXJuU3RhdGVtZW50KGlkRGVjbGFyZSkpXG5cdFx0Y29uc3QgZnVuID0gaXNJbkdlbmVyYXRvciA/XG5cdFx0XHRuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFtpZERlY2xhcmVdLCBibG9jaywgdHJ1ZSkgOlxuXHRcdFx0bmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKFtpZERlY2xhcmVdLCBibG9jaylcblx0XHRjb25zdCBjYWxsID0gbmV3IENhbGxFeHByZXNzaW9uKGZ1biwgW3QwKHRoaXMudmFsdWUpXSlcblx0XHRyZXR1cm4gaXNJbkdlbmVyYXRvciA/IG5ldyBZaWVsZEV4cHJlc3Npb24oY2FsbCwgdHJ1ZSkgOiBjYWxsXG5cdH0sXG5cblx0WWllbGQoKSB7IHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKG9wTWFwKHRoaXMub3BZaWVsZGVkLCB0MCksIGZhbHNlKSB9LFxuXG5cdFlpZWxkVG8oKSB7IHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKHQwKHRoaXMueWllbGRlZFRvKSwgdHJ1ZSkgfVxufSlcblxuLy8gU2hhcmVkIGltcGxlbWVudGF0aW9uc1xuXG5mdW5jdGlvbiBjYXNlUGFydChhbHRlcm5hdGUpIHtcblx0aWYgKHRoaXMudGVzdCBpbnN0YW5jZW9mIFBhdHRlcm4pIHtcblx0XHRjb25zdCB7dHlwZSwgcGF0dGVybmVkLCBsb2NhbHN9ID0gdGhpcy50ZXN0XG5cdFx0Y29uc3QgZGVjbCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRFeHRyYWN0LCBtc0V4dHJhY3QodDAodHlwZSksIHQwKHBhdHRlcm5lZCkpKV0pXG5cdFx0Y29uc3QgdGVzdCA9IG5ldyBCaW5hcnlFeHByZXNzaW9uKCchPT0nLCBJZEV4dHJhY3QsIExpdE51bGwpXG5cdFx0Y29uc3QgZXh0cmFjdCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIGxvY2Fscy5tYXAoKF8sIGlkeCkgPT5cblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoXG5cdFx0XHRcdGlkRm9yRGVjbGFyZUNhY2hlZChfKSxcblx0XHRcdFx0bmV3IE1lbWJlckV4cHJlc3Npb24oSWRFeHRyYWN0LCBuZXcgTGl0ZXJhbChpZHgpKSkpKVxuXHRcdGNvbnN0IHJlcyA9IHQxKHRoaXMucmVzdWx0LCBleHRyYWN0KVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoW2RlY2wsIG5ldyBJZlN0YXRlbWVudCh0ZXN0LCByZXMsIGFsdGVybmF0ZSldKVxuXHR9IGVsc2Vcblx0XHQvLyBhbHRlcm5hdGUgd3JpdHRlbiB0byBieSBgY2FzZUJvZHlgLlxuXHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQodDAodGhpcy50ZXN0KSwgdDAodGhpcy5yZXN1bHQpLCBhbHRlcm5hdGUpXG59XG5cbmZ1bmN0aW9uIHN1cGVyQ2FsbCgpIHtcblx0Y29uc3QgYXJncyA9IHRoaXMuYXJncy5tYXAodDApXG5cdGNvbnN0IG1ldGhvZCA9IHZlcmlmeVJlc3VsdHMuc3VwZXJDYWxsVG9NZXRob2QuZ2V0KHRoaXMpXG5cblx0aWYgKG1ldGhvZCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB7XG5cdFx0Y29uc3QgY2FsbCA9IG5ldyBDYWxsRXhwcmVzc2lvbihJZFN1cGVyLCBhcmdzKVxuXHRcdGNvbnN0IG1lbWJlclNldHMgPSBjb25zdHJ1Y3RvclNldE1lbWJlcnMobWV0aG9kKVxuXHRcdHJldHVybiBjYXQoY2FsbCwgbWVtYmVyU2V0cylcblx0fSBlbHNlXG5cdFx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbihtZW1iZXJTdHJpbmdPclZhbChJZFN1cGVyLCBtZXRob2Quc3ltYm9sKSwgYXJncylcbn1cblxuZnVuY3Rpb24gc3dpdGNoUGFydCgpIHtcblx0Y29uc3QgZm9sbG93ID0gb3BJZih0aGlzIGluc3RhbmNlb2YgU3dpdGNoRG9QYXJ0LCAoKSA9PiBuZXcgQnJlYWtTdGF0ZW1lbnQpXG5cdC8qXG5cdFdlIGNvdWxkIGp1c3QgcGFzcyBibG9jay5ib2R5IGZvciB0aGUgc3dpdGNoIGxpbmVzLCBidXQgaW5zdGVhZFxuXHRlbmNsb3NlIHRoZSBib2R5IG9mIHRoZSBzd2l0Y2ggY2FzZSBpbiBjdXJseSBicmFjZXMgdG8gZW5zdXJlIGEgbmV3IHNjb3BlLlxuXHRUaGF0IHdheSB0aGlzIGNvZGUgd29ya3M6XG5cdFx0c3dpdGNoICgwKSB7XG5cdFx0XHRjYXNlIDA6IHtcblx0XHRcdFx0Y29uc3QgYSA9IDBcblx0XHRcdFx0cmV0dXJuIGFcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0Ly8gV2l0aG91dCBjdXJseSBicmFjZXMgdGhpcyB3b3VsZCBjb25mbGljdCB3aXRoIHRoZSBvdGhlciBgYWAuXG5cdFx0XHRcdGNvbnN0IGEgPSAxXG5cdFx0XHRcdGFcblx0XHRcdH1cblx0XHR9XG5cdCovXG5cdGNvbnN0IGJsb2NrID0gdDModGhpcy5yZXN1bHQsIG51bGwsIG51bGwsIGZvbGxvdylcblx0Ly8gSWYgc3dpdGNoIGhhcyBtdWx0aXBsZSB2YWx1ZXMsIGJ1aWxkIHVwIGEgc3RhdGVtZW50IGxpa2U6IGBjYXNlIDE6IGNhc2UgMjogeyBkb0Jsb2NrKCkgfWBcblx0Y29uc3QgeCA9IFtdXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy52YWx1ZXMubGVuZ3RoIC0gMTsgaSA9IGkgKyAxKVxuXHRcdC8vIFRoZXNlIGNhc2VzIGZhbGx0aHJvdWdoIHRvIHRoZSBvbmUgYXQgdGhlIGVuZC5cblx0XHR4LnB1c2gobmV3IFN3aXRjaENhc2UodDAodGhpcy52YWx1ZXNbaV0pLCBbXSkpXG5cdHgucHVzaChuZXcgU3dpdGNoQ2FzZSh0MCh0aGlzLnZhbHVlc1t0aGlzLnZhbHVlcy5sZW5ndGggLSAxXSksIFtibG9ja10pKVxuXHRyZXR1cm4geFxufVxuXG4vLyBGdW5jdGlvbnMgc3BlY2lmaWMgdG8gY2VydGFpbiBleHByZXNzaW9uc1xuXG4vLyBXcmFwcyBhIGJsb2NrICh3aXRoIGByZXR1cm5gIHN0YXRlbWVudHMgaW4gaXQpIGluIGFuIElJRkUuXG5mdW5jdGlvbiBibG9ja1dyYXAoYmxvY2spIHtcblx0Y29uc3QgaW52b2tlID0gbmV3IENhbGxFeHByZXNzaW9uKGZ1bmN0aW9uRXhwcmVzc2lvblRodW5rKGJsb2NrLCBpc0luR2VuZXJhdG9yKSwgW10pXG5cdHJldHVybiBpc0luR2VuZXJhdG9yID8gbmV3IFlpZWxkRXhwcmVzc2lvbihpbnZva2UsIHRydWUpIDogaW52b2tlXG59XG5cbmZ1bmN0aW9uIGNhc2VCb2R5KHBhcnRzLCBvcEVsc2UpIHtcblx0bGV0IGFjYyA9IGlmRWxzZShvcEVsc2UsIHQwLCAoKSA9PiBUaHJvd05vQ2FzZU1hdGNoKVxuXHRmb3IgKGxldCBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpID0gaSAtIDEpXG5cdFx0YWNjID0gdDEocGFydHNbaV0sIGFjYylcblx0cmV0dXJuIGFjY1xufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RvclNldE1lbWJlcnMoY29uc3RydWN0b3IpIHtcblx0cmV0dXJuIGNvbnN0cnVjdG9yLm1lbWJlckFyZ3MubWFwKF8gPT5cblx0XHRtc05ld1Byb3BlcnR5KG5ldyBUaGlzRXhwcmVzc2lvbigpLCBuZXcgTGl0ZXJhbChfLm5hbWUpLCBpZEZvckRlY2xhcmVDYWNoZWQoXykpKVxufVxuXG5mdW5jdGlvbiBmb3JMb29wKG9wSXRlcmF0ZWUsIGJsb2NrKSB7XG5cdHJldHVybiBpZkVsc2Uob3BJdGVyYXRlZSxcblx0XHQoe2VsZW1lbnQsIGJhZ30pID0+IHtcblx0XHRcdGNvbnN0IGRlY2xhcmUgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignbGV0Jyxcblx0XHRcdFx0W25ldyBWYXJpYWJsZURlY2xhcmF0b3IodDAoZWxlbWVudCkpXSlcblx0XHRcdHJldHVybiBuZXcgRm9yT2ZTdGF0ZW1lbnQoZGVjbGFyZSwgdDAoYmFnKSwgdDAoYmxvY2spKVxuXHRcdH0sXG5cdFx0KCkgPT4gbmV3IEZvclN0YXRlbWVudChudWxsLCBudWxsLCBudWxsLCB0MChibG9jaykpKVxufVxuXG5mdW5jdGlvbiBtZXRob2RLZXlDb21wdXRlZChzeW1ib2wpIHtcblx0aWYgKHR5cGVvZiBzeW1ib2wgPT09ICdzdHJpbmcnKVxuXHRcdHJldHVybiB7a2V5OiBwcm9wZXJ0eUlkT3JMaXRlcmFsKHN5bWJvbCksIGNvbXB1dGVkOiBmYWxzZX1cblx0ZWxzZSB7XG5cdFx0Y29uc3Qga2V5ID0gc3ltYm9sIGluc3RhbmNlb2YgUXVvdGVBYnN0cmFjdCA/IHQwKHN5bWJvbCkgOiBtc1N5bWJvbCh0MChzeW1ib2wpKVxuXHRcdHJldHVybiB7a2V5LCBjb21wdXRlZDogdHJ1ZX1cblx0fVxufVxuXG5mdW5jdGlvbiB0cmFuc3BpbGVCbG9jayhyZXR1cm5lZCwgbGluZXMsIGxlYWQsIG9wUmV0dXJuVHlwZSkge1xuXHRjb25zdCBmaW4gPSBuZXcgUmV0dXJuU3RhdGVtZW50KFxuXHRcdG1heWJlV3JhcEluQ2hlY2tDb250YWlucyhyZXR1cm5lZCwgb3BSZXR1cm5UeXBlLCAncmV0dXJuZWQgdmFsdWUnKSlcblx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgbGluZXMsIGZpbikpXG59XG5cbmZ1bmN0aW9uIHRyYW5zcGlsZUV4Y2VwdChleGNlcHQpIHtcblx0cmV0dXJuIG5ldyBUcnlTdGF0ZW1lbnQoXG5cdFx0dDAoZXhjZXB0LnRyeSksXG5cdFx0b3BNYXAoZXhjZXB0LmNhdGNoLCB0MCksXG5cdFx0b3BNYXAoZXhjZXB0LmZpbmFsbHksIHQwKSlcbn1cblxuZnVuY3Rpb24gdHJhbnNwaWxlU3dpdGNoKF8pIHtcblx0Y29uc3QgcGFydHMgPSBmbGF0TWFwKF8ucGFydHMsIHQwKVxuXHRwYXJ0cy5wdXNoKGlmRWxzZShfLm9wRWxzZSxcblx0XHRfID0+IG5ldyBTd2l0Y2hDYXNlKHVuZGVmaW5lZCwgdDAoXykuYm9keSksXG5cdFx0KCkgPT4gU3dpdGNoQ2FzZU5vTWF0Y2gpKVxuXHRyZXR1cm4gbmV3IFN3aXRjaFN0YXRlbWVudCh0MChfLnN3aXRjaGVkKSwgcGFydHMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycyhhc3NpZ25lZXMsIGlzTGF6eSwgdmFsdWUsIGlzTW9kdWxlKSB7XG5cdGNvbnN0IGRlc3RydWN0dXJlZE5hbWUgPSBgXyQke25leHREZXN0cnVjdHVyZWRJZH1gXG5cdG5leHREZXN0cnVjdHVyZWRJZCA9IG5leHREZXN0cnVjdHVyZWRJZCArIDFcblx0Y29uc3QgaWREZXN0cnVjdHVyZWQgPSBuZXcgSWRlbnRpZmllcihkZXN0cnVjdHVyZWROYW1lKVxuXHRjb25zdCBkZWNsYXJhdG9ycyA9IGFzc2lnbmVlcy5tYXAoYXNzaWduZWUgPT4ge1xuXHRcdC8vIFRPRE86IERvbid0IGNvbXBpbGUgaXQgaWYgaXQncyBuZXZlciBhY2Nlc3NlZFxuXHRcdGNvbnN0IGdldCA9IGdldE1lbWJlcihpZERlc3RydWN0dXJlZCwgYXNzaWduZWUubmFtZSwgaXNMYXp5LCBpc01vZHVsZSlcblx0XHRyZXR1cm4gbWFrZURlY2xhcmF0b3IoYXNzaWduZWUsIGdldCwgaXNMYXp5KVxuXHR9KVxuXHQvLyBHZXR0aW5nIGxhenkgbW9kdWxlIGlzIGRvbmUgYnkgbXMubGF6eUdldE1vZHVsZS5cblx0Y29uc3QgdmFsID0gaXNMYXp5ICYmICFpc01vZHVsZSA/IGxhenlXcmFwKHZhbHVlKSA6IHZhbHVlXG5cdHJldHVybiBjYXQobmV3IFZhcmlhYmxlRGVjbGFyYXRvcihpZERlc3RydWN0dXJlZCwgdmFsKSwgZGVjbGFyYXRvcnMpXG59XG4iXX0=
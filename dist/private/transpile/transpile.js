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

		GetterFun() {
			// _ => _.foo
			return new _esastDistAst.ArrowFunctionExpression([_astConstants.IdFocus], (0, _util2.memberStringOrVal)(_astConstants.IdFocus, this.name));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQWdDd0IsU0FBUzs7Ozs7Ozs7O0FBTjFCLEtBQUksYUFBYSxDQUFBOzs7QUFFeEIsS0FBSSxhQUFhLEVBQUUsZUFBZSxDQUFBO0FBQ2xDLEtBQUksa0JBQWtCLENBQUE7Ozs7QUFHUCxVQUFTLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLEVBQUU7QUFDbkUsVUFQVSxhQUFhLEdBT3ZCLGFBQWEsR0FBRyxjQUFjLENBQUE7QUFDOUIsZUFBYSxHQUFHLEtBQUssQ0FBQTtBQUNyQixpQkFBZSxHQUFHLEtBQUssQ0FBQTtBQUN2QixvQkFBa0IsR0FBRyxDQUFDLENBQUE7QUFDdEIsUUFBTSxHQUFHLEdBQUcsV0FkNkQsRUFBRSxFQWM1RCxnQkFBZ0IsQ0FBQyxDQUFBOztBQUVoQyxVQWJVLGFBQWEsR0FhdkIsYUFBYSxHQUFHLElBQUksQ0FBQTtBQUNwQixTQUFPLEdBQUcsQ0FBQTtFQUNWOztBQUVELFdBOUJpRCxhQUFhLFVBOEJwQyxXQUFXLEVBQUU7QUFDdEMsUUFBTSxHQUFHO0FBQ1IsU0FBTSxRQUFRLEdBQUcsTUFBTTtBQUN0QixVQUFNLElBQUksR0FBRyxXQXZCMEQsRUFBRSxFQXVCekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQy9CLFdBQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsa0JBekNxQixlQUFlLENBeUNoQixHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDMUQsQ0FBQTs7QUFFRCxVQUFPLFVBckNnQyxNQUFNLEVBcUMvQixJQUFJLENBQUMsUUFBUSxFQUMxQixDQUFDLElBQUksa0JBaERLLFdBQVcsQ0FnREEsUUFBUSxFQUFFLEVBQUUsV0E3QkMsT0FBTyxFQTZCQSxDQUFDLENBQUMsQ0FBQyxFQUM1QyxNQUFNO0FBQ0wsUUFBSSxJQUFJLENBQUMsU0FB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LFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0FBQ3RFLFVBQU8sV0Fob0JvRSxjQUFjLEVBZ29CbkUsUUFBUSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQTtHQUM1QyxDQUFDLENBQUE7O0FBRUYsUUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxHQUFHLFlBdm9CckIsUUFBUSxFQXVvQnNCLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQTtBQUN6RCxTQUFPLFVBN29CUSxHQUFHLEVBNm9CUCxrQkFwcEJ5RCxrQkFBa0IsQ0FvcEJwRCxjQUFjLEVBQUUsR0FBRyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUE7RUFDcEUiLCJmaWxlIjoidHJhbnNwaWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcnJheUV4cHJlc3Npb24sIEFycm93RnVuY3Rpb25FeHByZXNzaW9uLCBBc3NpZ25tZW50RXhwcmVzc2lvbiwgQmluYXJ5RXhwcmVzc2lvbixcblx0QmxvY2tTdGF0ZW1lbnQsIEJyZWFrU3RhdGVtZW50LCBDYWxsRXhwcmVzc2lvbiwgQ2F0Y2hDbGF1c2UsIENsYXNzQm9keSwgQ2xhc3NFeHByZXNzaW9uLFxuXHRDb25kaXRpb25hbEV4cHJlc3Npb24sIERlYnVnZ2VyU3RhdGVtZW50LCBGb3JPZlN0YXRlbWVudCwgRm9yU3RhdGVtZW50LCBGdW5jdGlvbkV4cHJlc3Npb24sXG5cdElkZW50aWZpZXIsIElmU3RhdGVtZW50LCBMaXRlcmFsLCBMb2dpY2FsRXhwcmVzc2lvbiwgTWVtYmVyRXhwcmVzc2lvbiwgTWV0aG9kRGVmaW5pdGlvbixcblx0TmV3RXhwcmVzc2lvbiwgT2JqZWN0RXhwcmVzc2lvbiwgUHJvcGVydHksIFJldHVyblN0YXRlbWVudCwgU3ByZWFkRWxlbWVudCwgU3dpdGNoQ2FzZSxcblx0U3dpdGNoU3RhdGVtZW50LCBUYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb24sIFRlbXBsYXRlRWxlbWVudCwgVGVtcGxhdGVMaXRlcmFsLCBUaGlzRXhwcmVzc2lvbixcblx0VGhyb3dTdGF0ZW1lbnQsIFRyeVN0YXRlbWVudCwgVmFyaWFibGVEZWNsYXJhdGlvbiwgVW5hcnlFeHByZXNzaW9uLCBWYXJpYWJsZURlY2xhcmF0b3IsXG5cdFlpZWxkRXhwcmVzc2lvbn0gZnJvbSAnZXNhc3QvZGlzdC9hc3QnXG5pbXBvcnQge2Z1bmN0aW9uRXhwcmVzc2lvblRodW5rLCBpZGVudGlmaWVyLCBtZW1iZXIsIHByb3BlcnR5SWRPckxpdGVyYWx9IGZyb20gJ2VzYXN0L2Rpc3QvdXRpbCdcbmltcG9ydCB7Y2hlY2ssIG9wdGlvbnN9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtBc3NpZ25TaW5nbGUsIENhbGwsIENvbnN0cnVjdG9yLCBGdW5zLCBMb2dpY3MsIE1lbWJlciwgTG9jYWxEZWNsYXJlcywgUGF0dGVybiwgU3BsYXQsXG5cdFNldHRlcnMsIFNwZWNpYWxEb3MsIFNwZWNpYWxWYWxzLCBTd2l0Y2hEb1BhcnQsIFF1b3RlQWJzdHJhY3R9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHthc3NlcnQsIGNhdCwgZmxhdE1hcCwgZmxhdE9wTWFwLCBpZkVsc2UsIGltcGxlbWVudE1hbnksIG9wSWYsIG9wTWFwLCB0YWlsfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtBcnJheVNsaWNlQ2FsbCwgRGVjbGFyZUJ1aWx0QmFnLCBEZWNsYXJlQnVpbHRNYXAsIERlY2xhcmVCdWlsdE9iaiwgRGVjbGFyZUxleGljYWxUaGlzLFxuXHRFeHBvcnRzRGVmYXVsdCwgSWRBcmd1bWVudHMsIElkQnVpbHQsIElkRXhwb3J0cywgSWRFeHRyYWN0LCBJZEZvY3VzLCBJZExleGljYWxUaGlzLCBJZFN1cGVyLFxuXHRHbG9iYWxFcnJvciwgR2xvYmFsSW5maW5pdHksIExpdEVtcHR5U3RyaW5nLCBMaXROdWxsLCBMaXRTdHJUaHJvdywgTGl0WmVybywgUmV0dXJuQnVpbHQsXG5cdFN3aXRjaENhc2VOb01hdGNoLCBUaHJvd0Fzc2VydEZhaWwsIFRocm93Tm9DYXNlTWF0Y2h9IGZyb20gJy4vYXN0LWNvbnN0YW50cydcbmltcG9ydCB7SWRNcywgbGF6eVdyYXAsIG1zQWRkLCBtc0FkZE1hbnksIG1zQXNzZXJ0LCBtc0Fzc2VydE1lbWJlciwgbXNBc3NlcnROb3QsIG1zQXNzZXJ0Tm90TWVtYmVyLFxuXHRtc0FzeW5jLCBtc0V4dHJhY3QsIG1zTWV0aG9kQm91bmQsIG1zTWV0aG9kVW5ib3VuZCwgbXNOZXdNdXRhYmxlUHJvcGVydHksIG1zTmV3UHJvcGVydHksXG5cdG1zUmFuZ2UsIG1zU2V0TGF6eSwgbXNTZXRTdWIsIG1zU29tZSwgbXNTeW1ib2wsIE1zTm9uZX0gZnJvbSAnLi9tcy1jYWxsJ1xuaW1wb3J0IHRyYW5zcGlsZU1vZHVsZSBmcm9tICcuL3RyYW5zcGlsZU1vZHVsZSdcbmltcG9ydCB7YWNjZXNzTG9jYWxEZWNsYXJlLCBkZWNsYXJlLCBkb1Rocm93LCBnZXRNZW1iZXIsIGlkRm9yRGVjbGFyZUNhY2hlZCwgbWFrZURlY2xhcmF0b3IsXG5cdG1heWJlV3JhcEluQ2hlY2tDb250YWlucywgbWVtYmVyU3RyaW5nT3JWYWwsIG9wVHlwZUNoZWNrRm9yTG9jYWxEZWNsYXJlLCB0MCwgdDEsIHQyLCB0MywgdExpbmVzXG5cdH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgbGV0IHZlcmlmeVJlc3VsdHNcbi8vIGlzSW5HZW5lcmF0b3IgbWVhbnMgd2UgYXJlIGluIGFuIGFzeW5jIG9yIGdlbmVyYXRvciBmdW5jdGlvbi5cbmxldCBpc0luR2VuZXJhdG9yLCBpc0luQ29uc3RydWN0b3JcbmxldCBuZXh0RGVzdHJ1Y3R1cmVkSWRcblxuLyoqIFRyYW5zZm9ybSBhIHtAbGluayBNc0FzdH0gaW50byBhbiBlc2FzdC4gKiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFuc3BpbGUobW9kdWxlRXhwcmVzc2lvbiwgX3ZlcmlmeVJlc3VsdHMpIHtcblx0dmVyaWZ5UmVzdWx0cyA9IF92ZXJpZnlSZXN1bHRzXG5cdGlzSW5HZW5lcmF0b3IgPSBmYWxzZVxuXHRpc0luQ29uc3RydWN0b3IgPSBmYWxzZVxuXHRuZXh0RGVzdHJ1Y3R1cmVkSWQgPSAwXG5cdGNvbnN0IHJlcyA9IHQwKG1vZHVsZUV4cHJlc3Npb24pXG5cdC8vIFJlbGVhc2UgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cblx0dmVyaWZ5UmVzdWx0cyA9IG51bGxcblx0cmV0dXJuIHJlc1xufVxuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICd0cmFuc3BpbGUnLCB7XG5cdEFzc2VydCgpIHtcblx0XHRjb25zdCBmYWlsQ29uZCA9ICgpID0+IHtcblx0XHRcdGNvbnN0IGNvbmQgPSB0MCh0aGlzLmNvbmRpdGlvbilcblx0XHRcdHJldHVybiB0aGlzLm5lZ2F0ZSA/IGNvbmQgOiBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgY29uZClcblx0XHR9XG5cblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BUaHJvd24sXG5cdFx0XHRfID0+IG5ldyBJZlN0YXRlbWVudChmYWlsQ29uZCgpLCBkb1Rocm93KF8pKSxcblx0XHRcdCgpID0+IHtcblx0XHRcdFx0aWYgKHRoaXMuY29uZGl0aW9uIGluc3RhbmNlb2YgQ2FsbCkge1xuXHRcdFx0XHRcdGNvbnN0IGNhbGwgPSB0aGlzLmNvbmRpdGlvblxuXHRcdFx0XHRcdGNvbnN0IGNhbGxlZCA9IGNhbGwuY2FsbGVkXG5cdFx0XHRcdFx0Y29uc3QgYXJncyA9IGNhbGwuYXJncy5tYXAodDApXG5cdFx0XHRcdFx0aWYgKGNhbGxlZCBpbnN0YW5jZW9mIE1lbWJlcikge1xuXHRcdFx0XHRcdFx0Y29uc3QgYXNzID0gdGhpcy5uZWdhdGUgPyBtc0Fzc2VydE5vdE1lbWJlciA6IG1zQXNzZXJ0TWVtYmVyXG5cdFx0XHRcdFx0XHRyZXR1cm4gYXNzKHQwKGNhbGxlZC5vYmplY3QpLCBuZXcgTGl0ZXJhbChjYWxsZWQubmFtZSksIC4uLmFyZ3MpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnN0IGFzcyA9IHRoaXMubmVnYXRlID8gbXNBc3NlcnROb3QgOiBtc0Fzc2VydFxuXHRcdFx0XHRcdFx0cmV0dXJuIGFzcyh0MChjYWxsZWQpLCAuLi5hcmdzKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudChmYWlsQ29uZCgpLCBUaHJvd0Fzc2VydEZhaWwpXG5cdFx0XHR9KVxuXHR9LFxuXG5cdEFzc2lnblNpbmdsZSh2YWxXcmFwKSB7XG5cdFx0Y29uc3QgdmFsID0gdmFsV3JhcCA9PT0gdW5kZWZpbmVkID8gdDAodGhpcy52YWx1ZSkgOiB2YWxXcmFwKHQwKHRoaXMudmFsdWUpKVxuXHRcdGNvbnN0IGRlY2xhcmUgPSBtYWtlRGVjbGFyYXRvcih0aGlzLmFzc2lnbmVlLCB2YWwsIGZhbHNlKVxuXHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbih0aGlzLmFzc2lnbmVlLmlzTXV0YWJsZSgpID8gJ2xldCcgOiAnY29uc3QnLCBbZGVjbGFyZV0pXG5cdH0sXG5cdC8vIFRPRE86RVM2IEp1c3QgdXNlIG5hdGl2ZSBkZXN0cnVjdHVyaW5nIGFzc2lnblxuXHRBc3NpZ25EZXN0cnVjdHVyZSgpIHtcblx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oXG5cdFx0XHR0aGlzLmtpbmQoKSA9PT0gTG9jYWxEZWNsYXJlcy5NdXRhYmxlID8gJ2xldCcgOiAnY29uc3QnLFxuXHRcdFx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMoXG5cdFx0XHRcdHRoaXMuYXNzaWduZWVzLFxuXHRcdFx0XHR0aGlzLmtpbmQoKSA9PT0gTG9jYWxEZWNsYXJlcy5MYXp5LFxuXHRcdFx0XHR0MCh0aGlzLnZhbHVlKSxcblx0XHRcdFx0ZmFsc2UpKVxuXHR9LFxuXG5cdEJhZ0VudHJ5KCkgeyByZXR1cm4gbXNBZGQoSWRCdWlsdCwgdDAodGhpcy52YWx1ZSkpIH0sXG5cblx0QmFnRW50cnlNYW55KCkgeyByZXR1cm4gbXNBZGRNYW55KElkQnVpbHQsIHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdEJhZ1NpbXBsZSgpIHsgcmV0dXJuIG5ldyBBcnJheUV4cHJlc3Npb24odGhpcy5wYXJ0cy5tYXAodDApKSB9LFxuXG5cdEJsb2NrRG8obGVhZD1udWxsLCBvcFJldHVyblR5cGU9bnVsbCwgZm9sbG93PW51bGwpIHtcblx0XHRhc3NlcnQob3BSZXR1cm5UeXBlID09PSBudWxsKVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHRMaW5lcyh0aGlzLmxpbmVzKSwgZm9sbG93KSlcblx0fSxcblxuXHRCbG9ja1ZhbFRocm93KGxlYWQ9bnVsbCwgX29wUmV0dXJuVHlwZSkge1xuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHRMaW5lcyh0aGlzLmxpbmVzKSwgdDAodGhpcy50aHJvdykpKVxuXHR9LFxuXG5cdEJsb2NrVmFsUmV0dXJuKGxlYWQ9bnVsbCwgb3BSZXR1cm5UeXBlPW51bGwpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2sodDAodGhpcy5yZXR1cm5lZCksIHRMaW5lcyh0aGlzLmxpbmVzKSwgbGVhZCwgb3BSZXR1cm5UeXBlKVxuXHR9LFxuXG5cdEJsb2NrQmFnKGxlYWQ9bnVsbCwgb3BSZXR1cm5UeXBlPW51bGwpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2soXG5cdFx0XHRJZEJ1aWx0LFxuXHRcdFx0Y2F0KERlY2xhcmVCdWlsdEJhZywgdExpbmVzKHRoaXMubGluZXMpKSxcblx0XHRcdGxlYWQsIG9wUmV0dXJuVHlwZSlcblx0fSxcblxuXHRCbG9ja09iaihsZWFkPW51bGwsIG9wUmV0dXJuVHlwZT1udWxsKSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKFxuXHRcdFx0SWRCdWlsdCxcblx0XHRcdGNhdChEZWNsYXJlQnVpbHRPYmosIHRMaW5lcyh0aGlzLmxpbmVzKSksXG5cdFx0XHRsZWFkLCBvcFJldHVyblR5cGUpXG5cdH0sXG5cblx0QmxvY2tNYXAobGVhZD1udWxsLCBvcFJldHVyblR5cGU9bnVsbCkge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayhcblx0XHRcdElkQnVpbHQsXG5cdFx0XHRjYXQoRGVjbGFyZUJ1aWx0TWFwLCB0TGluZXModGhpcy5saW5lcykpLFxuXHRcdFx0bGVhZCwgb3BSZXR1cm5UeXBlKVxuXHR9LFxuXG5cdEJsb2NrV3JhcCgpIHtcblx0XHRyZXR1cm4gYmxvY2tXcmFwKHQwKHRoaXMuYmxvY2spKVxuXHR9LFxuXG5cdEJyZWFrKCkge1xuXHRcdHJldHVybiBuZXcgQnJlYWtTdGF0ZW1lbnQoKVxuXHR9LFxuXG5cdEJyZWFrV2l0aFZhbCgpIHtcblx0XHRyZXR1cm4gbmV3IFJldHVyblN0YXRlbWVudCh0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRDYWxsKCkge1xuXHRcdHJldHVybiBuZXcgQ2FsbEV4cHJlc3Npb24odDAodGhpcy5jYWxsZWQpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHRDYXNlRG8oKSB7XG5cdFx0Y29uc3QgYm9keSA9IGNhc2VCb2R5KHRoaXMucGFydHMsIHRoaXMub3BFbHNlKVxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcENhc2VkLCBfID0+IG5ldyBCbG9ja1N0YXRlbWVudChbdDAoXyksIGJvZHldKSwgKCkgPT4gYm9keSlcblx0fSxcblx0Q2FzZVZhbCgpIHtcblx0XHRjb25zdCBib2R5ID0gY2FzZUJvZHkodGhpcy5wYXJ0cywgdGhpcy5vcEVsc2UpXG5cdFx0Y29uc3QgYmxvY2sgPSBpZkVsc2UodGhpcy5vcENhc2VkLCBfID0+IFt0MChfKSwgYm9keV0sICgpID0+IFtib2R5XSlcblx0XHRyZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChibG9jaykpXG5cdH0sXG5cdENhc2VEb1BhcnQ6IGNhc2VQYXJ0LFxuXHRDYXNlVmFsUGFydDogY2FzZVBhcnQsXG5cblx0Q2xhc3MoKSB7XG5cdFx0Y29uc3QgbWV0aG9kcyA9IGNhdChcblx0XHRcdHRoaXMuc3RhdGljcy5tYXAoXyA9PiB0MShfLCB0cnVlKSksXG5cdFx0XHRvcE1hcCh0aGlzLm9wQ29uc3RydWN0b3IsIHQwKSxcblx0XHRcdHRoaXMubWV0aG9kcy5tYXAoXyA9PiB0MShfLCBmYWxzZSkpKVxuXHRcdGNvbnN0IG9wTmFtZSA9IG9wTWFwKHZlcmlmeVJlc3VsdHMub3BOYW1lKHRoaXMpLCBpZGVudGlmaWVyKVxuXHRcdGNvbnN0IGNsYXNzRXhwciA9IG5ldyBDbGFzc0V4cHJlc3Npb24oXG5cdFx0XHRvcE5hbWUsXG5cdFx0XHRvcE1hcCh0aGlzLm9wU3VwZXJDbGFzcywgdDApLCBuZXcgQ2xhc3NCb2R5KG1ldGhvZHMpKVxuXG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wRG8sIF8gPT4gdDEoXywgY2xhc3NFeHByKSwgKCkgPT4gY2xhc3NFeHByKVxuXHR9LFxuXG5cdENsYXNzRG8oY2xhc3NFeHByKSB7XG5cdFx0Y29uc3QgbGVhZCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IodDAodGhpcy5kZWNsYXJlRm9jdXMpLCBjbGFzc0V4cHIpXSlcblx0XHRjb25zdCByZXQgPSBuZXcgUmV0dXJuU3RhdGVtZW50KHQwKHRoaXMuZGVjbGFyZUZvY3VzKSlcblx0XHRjb25zdCBibG9jayA9IHQzKHRoaXMuYmxvY2ssIGxlYWQsIG51bGwsIHJldClcblx0XHRyZXR1cm4gYmxvY2tXcmFwKGJsb2NrKVxuXHR9LFxuXG5cdENvbmQoKSB7XG5cdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odDAodGhpcy50ZXN0KSwgdDAodGhpcy5pZlRydWUpLCB0MCh0aGlzLmlmRmFsc2UpKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsRG8oKSB7XG5cdFx0Y29uc3QgdGVzdCA9IHQwKHRoaXMudGVzdClcblx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KFxuXHRcdFx0dGhpcy5pc1VubGVzcyA/IG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCB0ZXN0KSA6IHRlc3QsXG5cdFx0XHR0MCh0aGlzLnJlc3VsdCkpXG5cdH0sXG5cblx0Q29uZGl0aW9uYWxWYWwoKSB7XG5cdFx0Y29uc3QgdGVzdCA9IHQwKHRoaXMudGVzdClcblx0XHRjb25zdCByZXN1bHQgPSBtc1NvbWUoYmxvY2tXcmFwKHQwKHRoaXMucmVzdWx0KSkpXG5cdFx0cmV0dXJuIHRoaXMuaXNVbmxlc3MgP1xuXHRcdFx0bmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXN0LCBNc05vbmUsIHJlc3VsdCkgOlxuXHRcdFx0bmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXN0LCByZXN1bHQsIE1zTm9uZSlcblx0fSxcblxuXHRDb25zdHJ1Y3RvcigpIHtcblx0XHRpc0luQ29uc3RydWN0b3IgPSB0cnVlXG5cblx0XHQvLyBJZiB0aGVyZSBpcyBhIGBzdXBlciFgLCBgdGhpc2Agd2lsbCBub3QgYmUgZGVmaW5lZCB1bnRpbCB0aGVuLCBzbyBtdXN0IHdhaXQgdW50aWwgdGhlbi5cblx0XHQvLyBPdGhlcndpc2UsIGRvIGl0IGF0IHRoZSBiZWdpbm5pbmcuXG5cdFx0Y29uc3QgYm9keSA9IHZlcmlmeVJlc3VsdHMuY29uc3RydWN0b3JUb1N1cGVyLmhhcyh0aGlzKSA/XG5cdFx0XHR0MCh0aGlzLmZ1bikgOlxuXHRcdFx0dDEodGhpcy5mdW4sIGNvbnN0cnVjdG9yU2V0TWVtYmVycyh0aGlzKSlcblxuXHRcdGNvbnN0IHJlcyA9IE1ldGhvZERlZmluaXRpb24uY29uc3RydWN0b3IoYm9keSlcblx0XHRpc0luQ29uc3RydWN0b3IgPSBmYWxzZVxuXHRcdHJldHVybiByZXNcblx0fSxcblxuXHRDYXRjaCgpIHtcblx0XHRyZXR1cm4gbmV3IENhdGNoQ2xhdXNlKHQwKHRoaXMuY2F1Z2h0KSwgdDAodGhpcy5ibG9jaykpXG5cdH0sXG5cblx0RXhjZXB0RG8oKSB7IHJldHVybiB0cmFuc3BpbGVFeGNlcHQodGhpcykgfSxcblx0RXhjZXB0VmFsKCkgeyByZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChbdHJhbnNwaWxlRXhjZXB0KHRoaXMpXSkpIH0sXG5cblx0Rm9yRG8oKSB7IHJldHVybiBmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jaykgfSxcblxuXHRGb3JCYWcoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW1xuXHRcdFx0RGVjbGFyZUJ1aWx0QmFnLFxuXHRcdFx0Zm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spLFxuXHRcdFx0UmV0dXJuQnVpbHRcblx0XHRdKSlcblx0fSxcblxuXHRGb3JWYWwoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW2Zvckxvb3AodGhpcy5vcEl0ZXJhdGVlLCB0aGlzLmJsb2NrKV0pKVxuXHR9LFxuXG5cdC8vIGxlYWRTdGF0ZW1lbnRzIGNvbWVzIGZyb20gY29uc3RydWN0b3IgbWVtYmVyc1xuXHRGdW4obGVhZFN0YXRlbWVudHM9bnVsbCkge1xuXHRcdGNvbnN0IGlzR2VuZXJhdG9yRnVuID0gdGhpcy5raW5kICE9PSBGdW5zLlBsYWluXG5cdFx0Y29uc3Qgb2xkSW5HZW5lcmF0b3IgPSBpc0luR2VuZXJhdG9yXG5cdFx0aXNJbkdlbmVyYXRvciA9IGlzR2VuZXJhdG9yRnVuXG5cblx0XHQvLyBUT0RPOkVTNiB1c2UgYC4uLmBmXG5cdFx0Y29uc3QgbkFyZ3MgPSBuZXcgTGl0ZXJhbCh0aGlzLmFyZ3MubGVuZ3RoKVxuXHRcdGNvbnN0IG9wRGVjbGFyZVJlc3QgPSBvcE1hcCh0aGlzLm9wUmVzdEFyZywgcmVzdCA9PlxuXHRcdFx0ZGVjbGFyZShyZXN0LCBuZXcgQ2FsbEV4cHJlc3Npb24oQXJyYXlTbGljZUNhbGwsIFtJZEFyZ3VtZW50cywgbkFyZ3NdKSkpXG5cdFx0Y29uc3QgYXJnQ2hlY2tzID0gb3BJZihvcHRpb25zLmluY2x1ZGVDaGVja3MoKSwgKCkgPT5cblx0XHRcdGZsYXRPcE1hcCh0aGlzLmFyZ3MsIG9wVHlwZUNoZWNrRm9yTG9jYWxEZWNsYXJlKSlcblxuXHRcdGNvbnN0IG9wRGVjbGFyZVRoaXMgPVxuXHRcdFx0b3BJZighaXNJbkNvbnN0cnVjdG9yICYmIHRoaXMub3BEZWNsYXJlVGhpcyAhPSBudWxsLCAoKSA9PiBEZWNsYXJlTGV4aWNhbFRoaXMpXG5cblx0XHRjb25zdCBsZWFkID0gY2F0KGxlYWRTdGF0ZW1lbnRzLCBvcERlY2xhcmVUaGlzLCBvcERlY2xhcmVSZXN0LCBhcmdDaGVja3MpXG5cblx0XHRjb25zdCBib2R5ID0oKSA9PiB0Mih0aGlzLmJsb2NrLCBsZWFkLCB0aGlzLm9wUmV0dXJuVHlwZSlcblx0XHRjb25zdCBhcmdzID0gdGhpcy5hcmdzLm1hcCh0MClcblx0XHRjb25zdCBpZCA9IG9wTWFwKHZlcmlmeVJlc3VsdHMub3BOYW1lKHRoaXMpLCBpZGVudGlmaWVyKVxuXG5cdFx0dHJ5IHtcblx0XHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRcdGNhc2UgRnVucy5QbGFpbjpcblx0XHRcdFx0XHQvLyBUT0RPOkVTNiBTaG91bGQgYmUgYWJsZSB0byB1c2UgcmVzdCBhcmdzIGluIGFycm93IGZ1bmN0aW9uXG5cdFx0XHRcdFx0aWYgKGlkID09PSBudWxsICYmIHRoaXMub3BEZWNsYXJlVGhpcyA9PT0gbnVsbCAmJiBvcERlY2xhcmVSZXN0ID09PSBudWxsKVxuXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihhcmdzLCBib2R5KCkpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIGFyZ3MsIGJvZHkoKSlcblx0XHRcdFx0Y2FzZSBGdW5zLkFzeW5jOiB7XG5cdFx0XHRcdFx0Y29uc3QgcGxhaW5Cb2R5ID0gdDIodGhpcy5ibG9jaywgbnVsbCwgdGhpcy5vcFJldHVyblR5cGUpXG5cdFx0XHRcdFx0Y29uc3QgZ2VuRnVuYyA9IG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIFtdLCBwbGFpbkJvZHksIHRydWUpXG5cdFx0XHRcdFx0Y29uc3QgcmV0ID0gbmV3IFJldHVyblN0YXRlbWVudChtc0FzeW5jKGdlbkZ1bmMpKVxuXHRcdFx0XHRcdHJldHVybiBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKGlkLCBhcmdzLCBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHJldCkpKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgRnVucy5HZW5lcmF0b3I6XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIGFyZ3MsIGJvZHkoKSwgdHJ1ZSlcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IodGhpcy5raW5kKVxuXHRcdFx0fVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRpc0luR2VuZXJhdG9yID0gb2xkSW5HZW5lcmF0b3Jcblx0XHR9XG5cdH0sXG5cblx0SWdub3JlKCkge1xuXHRcdHJldHVybiBbXVxuXHR9LFxuXG5cdExhenkoKSB7XG5cdFx0cmV0dXJuIGxhenlXcmFwKHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdE1ldGhvZEltcGwoaXNTdGF0aWMpIHtcblx0XHRjb25zdCB2YWx1ZSA9IHQwKHRoaXMuZnVuKVxuXHRcdGFzc2VydCh2YWx1ZS5pZCA9PSBudWxsKVxuXHRcdC8vIFNpbmNlIHRoZSBGdW4gc2hvdWxkIGhhdmUgb3BEZWNsYXJlVGhpcywgaXQgd2lsbCBuZXZlciBiZSBhbiBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbi5cblx0XHRhc3NlcnQodmFsdWUgaW5zdGFuY2VvZiBGdW5jdGlvbkV4cHJlc3Npb24pXG5cblx0XHRjb25zdCB7a2V5LCBjb21wdXRlZH0gPSBtZXRob2RLZXlDb21wdXRlZCh0aGlzLnN5bWJvbClcblx0XHRyZXR1cm4gbmV3IE1ldGhvZERlZmluaXRpb24oa2V5LCB2YWx1ZSwgJ21ldGhvZCcsIGlzU3RhdGljLCBjb21wdXRlZClcblx0fSxcblx0TWV0aG9kR2V0dGVyKGlzU3RhdGljKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFtdLCB0MSh0aGlzLmJsb2NrLCBEZWNsYXJlTGV4aWNhbFRoaXMpKVxuXHRcdGNvbnN0IHtrZXksIGNvbXB1dGVkfSA9IG1ldGhvZEtleUNvbXB1dGVkKHRoaXMuc3ltYm9sKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kRGVmaW5pdGlvbihrZXksIHZhbHVlLCAnZ2V0JywgaXNTdGF0aWMsIGNvbXB1dGVkKVxuXHR9LFxuXHRNZXRob2RTZXR0ZXIoaXNTdGF0aWMpIHtcblx0XHRjb25zdCB2YWx1ZSA9IG5ldyBGdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgW0lkRm9jdXNdLCB0MSh0aGlzLmJsb2NrLCBEZWNsYXJlTGV4aWNhbFRoaXMpKVxuXHRcdGNvbnN0IHtrZXksIGNvbXB1dGVkfSA9IG1ldGhvZEtleUNvbXB1dGVkKHRoaXMuc3ltYm9sKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kRGVmaW5pdGlvbihrZXksIHZhbHVlLCAnc2V0JywgaXNTdGF0aWMsIGNvbXB1dGVkKVxuXHR9LFxuXG5cdE51bWJlckxpdGVyYWwoKSB7XG5cdFx0Ly8gTmVnYXRpdmUgbnVtYmVycyBhcmUgbm90IHBhcnQgb2YgRVMgc3BlYy5cblx0XHQvLyBodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNS4xLyNzZWMtNy44LjNcblx0XHRjb25zdCB2YWx1ZSA9IE51bWJlcih0aGlzLnZhbHVlKVxuXHRcdGNvbnN0IGxpdCA9IG5ldyBMaXRlcmFsKE1hdGguYWJzKHZhbHVlKSlcblx0XHRjb25zdCBpc1Bvc2l0aXZlID0gdmFsdWUgPj0gMCAmJiAxIC8gdmFsdWUgIT09IC1JbmZpbml0eVxuXHRcdHJldHVybiBpc1Bvc2l0aXZlID8gbGl0IDogbmV3IFVuYXJ5RXhwcmVzc2lvbignLScsIGxpdClcblx0fSxcblxuXHRMb2NhbEFjY2VzcygpIHtcblx0XHRpZiAodGhpcy5uYW1lID09PSAndGhpcycpXG5cdFx0XHRyZXR1cm4gaXNJbkNvbnN0cnVjdG9yID8gbmV3IFRoaXNFeHByZXNzaW9uKCkgOiBJZExleGljYWxUaGlzXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBsZCA9IHZlcmlmeVJlc3VsdHMubG9jYWxEZWNsYXJlRm9yQWNjZXNzKHRoaXMpXG5cdFx0XHQvLyBJZiBsZCBtaXNzaW5nLCB0aGlzIGlzIGEgYnVpbHRpbiwgYW5kIGJ1aWx0aW5zIGFyZSBuZXZlciBsYXp5XG5cdFx0XHRyZXR1cm4gbGQgPT09IHVuZGVmaW5lZCA/IGlkZW50aWZpZXIodGhpcy5uYW1lKSA6IGFjY2Vzc0xvY2FsRGVjbGFyZShsZClcblx0XHR9XG5cdH0sXG5cblx0TG9jYWxEZWNsYXJlKCkgeyByZXR1cm4gbmV3IElkZW50aWZpZXIoaWRGb3JEZWNsYXJlQ2FjaGVkKHRoaXMpLm5hbWUpIH0sXG5cblx0TG9jYWxNdXRhdGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIGlkZW50aWZpZXIodGhpcy5uYW1lKSwgdDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0TG9naWMoKSB7XG5cdFx0Y29uc3Qgb3AgPSB0aGlzLmtpbmQgPT09IExvZ2ljcy5BbmQgPyAnJiYnIDogJ3x8J1xuXHRcdHJldHVybiB0YWlsKHRoaXMuYXJncykucmVkdWNlKChhLCBiKSA9PlxuXHRcdFx0bmV3IExvZ2ljYWxFeHByZXNzaW9uKG9wLCBhLCB0MChiKSksIHQwKHRoaXMuYXJnc1swXSkpXG5cdH0sXG5cblx0TWFwRW50cnkoKSB7IHJldHVybiBtc1NldFN1YihJZEJ1aWx0LCB0MCh0aGlzLmtleSksIHQwKHRoaXMudmFsKSkgfSxcblxuXHRNZW1iZXIoKSB7XG5cdFx0cmV0dXJuIG1lbWJlclN0cmluZ09yVmFsKHQwKHRoaXMub2JqZWN0KSwgdGhpcy5uYW1lKVxuXHR9LFxuXG5cdE1lbWJlckZ1bigpIHtcblx0XHRjb25zdCBuYW1lID0gdHlwZW9mIHRoaXMubmFtZSA9PT0gJ3N0cmluZycgPyBuZXcgTGl0ZXJhbCh0aGlzLm5hbWUpIDogdDAodGhpcy5uYW1lKVxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcE9iamVjdCxcblx0XHRcdF8gPT4gbXNNZXRob2RCb3VuZCh0MChfKSwgbmFtZSksXG5cdFx0XHQoKSA9PiBtc01ldGhvZFVuYm91bmQobmFtZSkpXG5cdH0sXG5cblx0TWVtYmVyU2V0KCkge1xuXHRcdGNvbnN0IG9iaiA9IHQwKHRoaXMub2JqZWN0KVxuXHRcdGNvbnN0IG5hbWUgPSAoKSA9PlxuXHRcdFx0dHlwZW9mIHRoaXMubmFtZSA9PT0gJ3N0cmluZycgPyBuZXcgTGl0ZXJhbCh0aGlzLm5hbWUpIDogdDAodGhpcy5uYW1lKVxuXHRcdGNvbnN0IHZhbCA9IG1heWJlV3JhcEluQ2hlY2tDb250YWlucyh0MCh0aGlzLnZhbHVlKSwgdGhpcy5vcFR5cGUsIHRoaXMubmFtZSlcblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTZXR0ZXJzLkluaXQ6XG5cdFx0XHRcdHJldHVybiBtc05ld1Byb3BlcnR5KG9iaiwgbmFtZSgpLCB2YWwpXG5cdFx0XHRjYXNlIFNldHRlcnMuSW5pdE11dGFibGU6XG5cdFx0XHRcdHJldHVybiBtc05ld011dGFibGVQcm9wZXJ0eShvYmosIG5hbWUoKSwgdmFsKVxuXHRcdFx0Y2FzZSBTZXR0ZXJzLk11dGF0ZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlclN0cmluZ09yVmFsKG9iaiwgdGhpcy5uYW1lKSwgdmFsKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKClcblx0XHR9XG5cdH0sXG5cblx0TW9kdWxlOiB0cmFuc3BpbGVNb2R1bGUsXG5cblx0TW9kdWxlRXhwb3J0TmFtZWQoKSB7XG5cdFx0cmV0dXJuIHQxKHRoaXMuYXNzaWduLCB2YWwgPT5cblx0XHRcdG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlcihJZEV4cG9ydHMsIHRoaXMuYXNzaWduLmFzc2lnbmVlLm5hbWUpLCB2YWwpKVxuXHR9LFxuXG5cdE1vZHVsZUV4cG9ydERlZmF1bHQoKSB7XG5cdFx0cmV0dXJuIHQxKHRoaXMuYXNzaWduLCB2YWwgPT4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgRXhwb3J0c0RlZmF1bHQsIHZhbCkpXG5cdH0sXG5cblx0TmV3KCkge1xuXHRcdGNvbnN0IGFueVNwbGF0ID0gdGhpcy5hcmdzLnNvbWUoXyA9PiBfIGluc3RhbmNlb2YgU3BsYXQpXG5cdFx0Y2hlY2soIWFueVNwbGF0LCB0aGlzLmxvYywgJ1RPRE86IFNwbGF0IHBhcmFtcyBmb3IgbmV3Jylcblx0XHRyZXR1cm4gbmV3IE5ld0V4cHJlc3Npb24odDAodGhpcy50eXBlKSwgdGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0Tm90KCkgeyByZXR1cm4gbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIHQwKHRoaXMuYXJnKSkgfSxcblxuXHRPYmpFbnRyeUFzc2lnbigpIHtcblx0XHRyZXR1cm4gdGhpcy5hc3NpZ24gaW5zdGFuY2VvZiBBc3NpZ25TaW5nbGUgJiYgIXRoaXMuYXNzaWduLmFzc2lnbmVlLmlzTGF6eSgpID9cblx0XHRcdHQxKHRoaXMuYXNzaWduLCB2YWwgPT5cblx0XHRcdFx0bmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyKElkQnVpbHQsIHRoaXMuYXNzaWduLmFzc2lnbmVlLm5hbWUpLCB2YWwpKSA6XG5cdFx0XHRjYXQoXG5cdFx0XHRcdHQwKHRoaXMuYXNzaWduKSxcblx0XHRcdFx0dGhpcy5hc3NpZ24uYWxsQXNzaWduZWVzKCkubWFwKF8gPT5cblx0XHRcdFx0XHRtc1NldExhenkoSWRCdWlsdCwgbmV3IExpdGVyYWwoXy5uYW1lKSwgaWRGb3JEZWNsYXJlQ2FjaGVkKF8pKSkpXG5cdH0sXG5cblx0T2JqRW50cnlQbGFpbigpIHtcblx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyU3RyaW5nT3JWYWwoSWRCdWlsdCwgdGhpcy5uYW1lKSwgdDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0T2JqU2ltcGxlKCkge1xuXHRcdHJldHVybiBuZXcgT2JqZWN0RXhwcmVzc2lvbih0aGlzLnBhaXJzLm1hcChwYWlyID0+XG5cdFx0XHRuZXcgUHJvcGVydHkoJ2luaXQnLCBwcm9wZXJ0eUlkT3JMaXRlcmFsKHBhaXIua2V5KSwgdDAocGFpci52YWx1ZSkpKSlcblx0fSxcblxuXHRHZXR0ZXJGdW4oKSB7XG5cdFx0Ly8gXyA9PiBfLmZvb1xuXHRcdHJldHVybiBuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oW0lkRm9jdXNdLCBtZW1iZXJTdHJpbmdPclZhbChJZEZvY3VzLCB0aGlzLm5hbWUpKVxuXHR9LFxuXG5cdFF1b3RlUGxhaW4oKSB7XG5cdFx0aWYgKHRoaXMucGFydHMubGVuZ3RoID09PSAwKVxuXHRcdFx0cmV0dXJuIExpdEVtcHR5U3RyaW5nXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBxdWFzaXMgPSBbXSwgZXhwcmVzc2lvbnMgPSBbXVxuXG5cdFx0XHQvLyBUZW1wbGF0ZUxpdGVyYWwgbXVzdCBzdGFydCB3aXRoIGEgVGVtcGxhdGVFbGVtZW50XG5cdFx0XHRpZiAodHlwZW9mIHRoaXMucGFydHNbMF0gIT09ICdzdHJpbmcnKVxuXHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZW1wdHkpXG5cblx0XHRcdGZvciAobGV0IHBhcnQgb2YgdGhpcy5wYXJ0cylcblx0XHRcdFx0aWYgKHR5cGVvZiBwYXJ0ID09PSAnc3RyaW5nJylcblx0XHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZm9yUmF3U3RyaW5nKHBhcnQpKVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHQvLyBcInsxfXsxfVwiIG5lZWRzIGFuIGVtcHR5IHF1YXNpIGluIHRoZSBtaWRkbGUgKGFuZCBvbiB0aGUgZW5kcylcblx0XHRcdFx0XHRpZiAocXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoKVxuXHRcdFx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmVtcHR5KVxuXHRcdFx0XHRcdGV4cHJlc3Npb25zLnB1c2godDAocGFydCkpXG5cdFx0XHRcdH1cblxuXHRcdFx0Ly8gVGVtcGxhdGVMaXRlcmFsIG11c3QgZW5kIHdpdGggYSBUZW1wbGF0ZUVsZW1lbnQsIHNvIG9uZSBtb3JlIHF1YXNpIHRoYW4gZXhwcmVzc2lvbi5cblx0XHRcdGlmIChxdWFzaXMubGVuZ3RoID09PSBleHByZXNzaW9ucy5sZW5ndGgpXG5cdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5lbXB0eSlcblxuXHRcdFx0cmV0dXJuIG5ldyBUZW1wbGF0ZUxpdGVyYWwocXVhc2lzLCBleHByZXNzaW9ucylcblx0XHR9XG5cdH0sXG5cblx0UXVvdGVTaW1wbGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBMaXRlcmFsKHRoaXMubmFtZSlcblx0fSxcblxuXHRRdW90ZVRhZ2dlZFRlbXBsYXRlKCkge1xuXHRcdHJldHVybiBuZXcgVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uKHQwKHRoaXMudGFnKSwgdDAodGhpcy5xdW90ZSkpXG5cdH0sXG5cblx0UmFuZ2UoKSB7XG5cdFx0Y29uc3QgZW5kID0gaWZFbHNlKHRoaXMuZW5kLCB0MCwgKCkgPT4gR2xvYmFsSW5maW5pdHkpXG5cdFx0cmV0dXJuIG1zUmFuZ2UodDAodGhpcy5zdGFydCksIGVuZCwgbmV3IExpdGVyYWwodGhpcy5pc0V4Y2x1c2l2ZSkpXG5cdH0sXG5cblx0U2V0U3ViKCkge1xuXHRcdGNvbnN0IGdldEtpbmQgPSAoKSA9PiB7XG5cdFx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0XHRjYXNlIFNldHRlcnMuSW5pdDpcblx0XHRcdFx0XHRyZXR1cm4gJ2luaXQnXG5cdFx0XHRcdGNhc2UgU2V0dGVycy5Jbml0TXV0YWJsZTpcblx0XHRcdFx0XHRyZXR1cm4gJ2luaXQtbXV0YWJsZSdcblx0XHRcdFx0Y2FzZSBTZXR0ZXJzLk11dGF0ZTpcblx0XHRcdFx0XHRyZXR1cm4gJ211dGF0ZSdcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRjb25zdCBraW5kID0gZ2V0S2luZCgpXG5cdFx0cmV0dXJuIG1zU2V0U3ViKFxuXHRcdFx0dDAodGhpcy5vYmplY3QpLFxuXHRcdFx0dGhpcy5zdWJiZWRzLmxlbmd0aCA9PT0gMSA/IHQwKHRoaXMuc3ViYmVkc1swXSkgOiB0aGlzLnN1YmJlZHMubWFwKHQwKSxcblx0XHRcdG1heWJlV3JhcEluQ2hlY2tDb250YWlucyh0MCh0aGlzLnZhbHVlKSwgdGhpcy5vcFR5cGUsICd2YWx1ZScpLFxuXHRcdFx0bmV3IExpdGVyYWwoa2luZCkpXG5cdH0sXG5cblx0U3BlY2lhbERvKCkge1xuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIFNwZWNpYWxEb3MuRGVidWdnZXI6IHJldHVybiBuZXcgRGVidWdnZXJTdGF0ZW1lbnQoKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHR9XG5cdH0sXG5cblx0U3BlY2lhbFZhbCgpIHtcblx0XHQvLyBNYWtlIG5ldyBvYmplY3RzIGJlY2F1c2Ugd2Ugd2lsbCBhc3NpZ24gYGxvY2AgdG8gdGhlbS5cblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5Db250YWluczpcblx0XHRcdFx0cmV0dXJuIG1lbWJlcihJZE1zLCAnY29udGFpbnMnKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5EZWxTdWI6XG5cdFx0XHRcdHJldHVybiBtZW1iZXIoSWRNcywgJ2RlbFN1YicpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLkZhbHNlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IExpdGVyYWwoZmFsc2UpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLk5hbWU6XG5cdFx0XHRcdHJldHVybiBuZXcgTGl0ZXJhbCh2ZXJpZnlSZXN1bHRzLm5hbWUodGhpcykpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLk51bGw6XG5cdFx0XHRcdHJldHVybiBuZXcgTGl0ZXJhbChudWxsKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5TZXRTdWI6XG5cdFx0XHRcdHJldHVybiBtZW1iZXIoSWRNcywgJ3NldFN1YicpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLlN1Yjpcblx0XHRcdFx0cmV0dXJuIG1lbWJlcihJZE1zLCAnc3ViJylcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuVHJ1ZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKHRydWUpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLlVuZGVmaW5lZDpcblx0XHRcdFx0cmV0dXJuIG5ldyBVbmFyeUV4cHJlc3Npb24oJ3ZvaWQnLCBMaXRaZXJvKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHR9XG5cdH0sXG5cblx0U3BsYXQoKSB7XG5cdFx0cmV0dXJuIG5ldyBTcHJlYWRFbGVtZW50KHQwKHRoaXMuc3BsYXR0ZWQpKVxuXHR9LFxuXG5cdFN1cGVyQ2FsbDogc3VwZXJDYWxsLFxuXHRTdXBlckNhbGxEbzogc3VwZXJDYWxsLFxuXHRTdXBlck1lbWJlcigpIHtcblx0XHRyZXR1cm4gbWVtYmVyU3RyaW5nT3JWYWwoSWRTdXBlciwgdGhpcy5uYW1lKVxuXHR9LFxuXG5cdFN3aXRjaERvKCkgeyByZXR1cm4gdHJhbnNwaWxlU3dpdGNoKHRoaXMpIH0sXG5cdFN3aXRjaFZhbCgpIHsgcmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW3RyYW5zcGlsZVN3aXRjaCh0aGlzKV0pKSB9LFxuXHRTd2l0Y2hEb1BhcnQ6IHN3aXRjaFBhcnQsXG5cdFN3aXRjaFZhbFBhcnQ6IHN3aXRjaFBhcnQsXG5cblx0VGhyb3coKSB7XG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wVGhyb3duLFxuXHRcdFx0XyA9PiBkb1Rocm93KF8pLFxuXHRcdFx0KCkgPT4gbmV3IFRocm93U3RhdGVtZW50KG5ldyBOZXdFeHByZXNzaW9uKEdsb2JhbEVycm9yLCBbTGl0U3RyVGhyb3ddKSkpXG5cdH0sXG5cblx0V2l0aCgpIHtcblx0XHRjb25zdCBpZERlY2xhcmUgPSBpZEZvckRlY2xhcmVDYWNoZWQodGhpcy5kZWNsYXJlKVxuXHRcdGNvbnN0IGJsb2NrID0gdDModGhpcy5ibG9jaywgbnVsbCwgbnVsbCwgbmV3IFJldHVyblN0YXRlbWVudChpZERlY2xhcmUpKVxuXHRcdGNvbnN0IGZ1biA9IGlzSW5HZW5lcmF0b3IgP1xuXHRcdFx0bmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihudWxsLCBbaWREZWNsYXJlXSwgYmxvY2ssIHRydWUpIDpcblx0XHRcdG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihbaWREZWNsYXJlXSwgYmxvY2spXG5cdFx0Y29uc3QgY2FsbCA9IG5ldyBDYWxsRXhwcmVzc2lvbihmdW4sIFt0MCh0aGlzLnZhbHVlKV0pXG5cdFx0cmV0dXJuIGlzSW5HZW5lcmF0b3IgPyBuZXcgWWllbGRFeHByZXNzaW9uKGNhbGwsIHRydWUpIDogY2FsbFxuXHR9LFxuXG5cdFlpZWxkKCkgeyByZXR1cm4gbmV3IFlpZWxkRXhwcmVzc2lvbihvcE1hcCh0aGlzLm9wWWllbGRlZCwgdDApLCBmYWxzZSkgfSxcblxuXHRZaWVsZFRvKCkgeyByZXR1cm4gbmV3IFlpZWxkRXhwcmVzc2lvbih0MCh0aGlzLnlpZWxkZWRUbyksIHRydWUpIH1cbn0pXG5cbi8vIFNoYXJlZCBpbXBsZW1lbnRhdGlvbnNcblxuZnVuY3Rpb24gY2FzZVBhcnQoYWx0ZXJuYXRlKSB7XG5cdGlmICh0aGlzLnRlc3QgaW5zdGFuY2VvZiBQYXR0ZXJuKSB7XG5cdFx0Y29uc3Qge3R5cGUsIHBhdHRlcm5lZCwgbG9jYWxzfSA9IHRoaXMudGVzdFxuXHRcdGNvbnN0IGRlY2wgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBbXG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKElkRXh0cmFjdCwgbXNFeHRyYWN0KHQwKHR5cGUpLCB0MChwYXR0ZXJuZWQpKSldKVxuXHRcdGNvbnN0IHRlc3QgPSBuZXcgQmluYXJ5RXhwcmVzc2lvbignIT09JywgSWRFeHRyYWN0LCBMaXROdWxsKVxuXHRcdGNvbnN0IGV4dHJhY3QgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBsb2NhbHMubWFwKChfLCBpZHgpID0+XG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKFxuXHRcdFx0XHRpZEZvckRlY2xhcmVDYWNoZWQoXyksXG5cdFx0XHRcdG5ldyBNZW1iZXJFeHByZXNzaW9uKElkRXh0cmFjdCwgbmV3IExpdGVyYWwoaWR4KSkpKSlcblx0XHRjb25zdCByZXMgPSB0MSh0aGlzLnJlc3VsdCwgZXh0cmFjdClcblx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KFtkZWNsLCBuZXcgSWZTdGF0ZW1lbnQodGVzdCwgcmVzLCBhbHRlcm5hdGUpXSlcblx0fSBlbHNlXG5cdFx0Ly8gYWx0ZXJuYXRlIHdyaXR0ZW4gdG8gYnkgYGNhc2VCb2R5YC5cblx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KHQwKHRoaXMudGVzdCksIHQwKHRoaXMucmVzdWx0KSwgYWx0ZXJuYXRlKVxufVxuXG5mdW5jdGlvbiBzdXBlckNhbGwoKSB7XG5cdGNvbnN0IGFyZ3MgPSB0aGlzLmFyZ3MubWFwKHQwKVxuXHRjb25zdCBtZXRob2QgPSB2ZXJpZnlSZXN1bHRzLnN1cGVyQ2FsbFRvTWV0aG9kLmdldCh0aGlzKVxuXG5cdGlmIChtZXRob2QgaW5zdGFuY2VvZiBDb25zdHJ1Y3Rvcikge1xuXHRcdGNvbnN0IGNhbGwgPSBuZXcgQ2FsbEV4cHJlc3Npb24oSWRTdXBlciwgYXJncylcblx0XHRjb25zdCBtZW1iZXJTZXRzID0gY29uc3RydWN0b3JTZXRNZW1iZXJzKG1ldGhvZClcblx0XHRyZXR1cm4gY2F0KGNhbGwsIG1lbWJlclNldHMpXG5cdH0gZWxzZVxuXHRcdHJldHVybiBuZXcgQ2FsbEV4cHJlc3Npb24obWVtYmVyU3RyaW5nT3JWYWwoSWRTdXBlciwgbWV0aG9kLnN5bWJvbCksIGFyZ3MpXG59XG5cbmZ1bmN0aW9uIHN3aXRjaFBhcnQoKSB7XG5cdGNvbnN0IGZvbGxvdyA9IG9wSWYodGhpcyBpbnN0YW5jZW9mIFN3aXRjaERvUGFydCwgKCkgPT4gbmV3IEJyZWFrU3RhdGVtZW50KVxuXHQvKlxuXHRXZSBjb3VsZCBqdXN0IHBhc3MgYmxvY2suYm9keSBmb3IgdGhlIHN3aXRjaCBsaW5lcywgYnV0IGluc3RlYWRcblx0ZW5jbG9zZSB0aGUgYm9keSBvZiB0aGUgc3dpdGNoIGNhc2UgaW4gY3VybHkgYnJhY2VzIHRvIGVuc3VyZSBhIG5ldyBzY29wZS5cblx0VGhhdCB3YXkgdGhpcyBjb2RlIHdvcmtzOlxuXHRcdHN3aXRjaCAoMCkge1xuXHRcdFx0Y2FzZSAwOiB7XG5cdFx0XHRcdGNvbnN0IGEgPSAwXG5cdFx0XHRcdHJldHVybiBhXG5cdFx0XHR9XG5cdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdC8vIFdpdGhvdXQgY3VybHkgYnJhY2VzIHRoaXMgd291bGQgY29uZmxpY3Qgd2l0aCB0aGUgb3RoZXIgYGFgLlxuXHRcdFx0XHRjb25zdCBhID0gMVxuXHRcdFx0XHRhXG5cdFx0XHR9XG5cdFx0fVxuXHQqL1xuXHRjb25zdCBibG9jayA9IHQzKHRoaXMucmVzdWx0LCBudWxsLCBudWxsLCBmb2xsb3cpXG5cdC8vIElmIHN3aXRjaCBoYXMgbXVsdGlwbGUgdmFsdWVzLCBidWlsZCB1cCBhIHN0YXRlbWVudCBsaWtlOiBgY2FzZSAxOiBjYXNlIDI6IHsgZG9CbG9jaygpIH1gXG5cdGNvbnN0IHggPSBbXVxuXHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudmFsdWVzLmxlbmd0aCAtIDE7IGkgPSBpICsgMSlcblx0XHQvLyBUaGVzZSBjYXNlcyBmYWxsdGhyb3VnaCB0byB0aGUgb25lIGF0IHRoZSBlbmQuXG5cdFx0eC5wdXNoKG5ldyBTd2l0Y2hDYXNlKHQwKHRoaXMudmFsdWVzW2ldKSwgW10pKVxuXHR4LnB1c2gobmV3IFN3aXRjaENhc2UodDAodGhpcy52YWx1ZXNbdGhpcy52YWx1ZXMubGVuZ3RoIC0gMV0pLCBbYmxvY2tdKSlcblx0cmV0dXJuIHhcbn1cblxuLy8gRnVuY3Rpb25zIHNwZWNpZmljIHRvIGNlcnRhaW4gZXhwcmVzc2lvbnNcblxuLy8gV3JhcHMgYSBibG9jayAod2l0aCBgcmV0dXJuYCBzdGF0ZW1lbnRzIGluIGl0KSBpbiBhbiBJSUZFLlxuZnVuY3Rpb24gYmxvY2tXcmFwKGJsb2NrKSB7XG5cdGNvbnN0IGludm9rZSA9IG5ldyBDYWxsRXhwcmVzc2lvbihmdW5jdGlvbkV4cHJlc3Npb25UaHVuayhibG9jaywgaXNJbkdlbmVyYXRvciksIFtdKVxuXHRyZXR1cm4gaXNJbkdlbmVyYXRvciA/IG5ldyBZaWVsZEV4cHJlc3Npb24oaW52b2tlLCB0cnVlKSA6IGludm9rZVxufVxuXG5mdW5jdGlvbiBjYXNlQm9keShwYXJ0cywgb3BFbHNlKSB7XG5cdGxldCBhY2MgPSBpZkVsc2Uob3BFbHNlLCB0MCwgKCkgPT4gVGhyb3dOb0Nhc2VNYXRjaClcblx0Zm9yIChsZXQgaSA9IHBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaSA9IGkgLSAxKVxuXHRcdGFjYyA9IHQxKHBhcnRzW2ldLCBhY2MpXG5cdHJldHVybiBhY2Ncbn1cblxuZnVuY3Rpb24gY29uc3RydWN0b3JTZXRNZW1iZXJzKGNvbnN0cnVjdG9yKSB7XG5cdHJldHVybiBjb25zdHJ1Y3Rvci5tZW1iZXJBcmdzLm1hcChfID0+XG5cdFx0bXNOZXdQcm9wZXJ0eShuZXcgVGhpc0V4cHJlc3Npb24oKSwgbmV3IExpdGVyYWwoXy5uYW1lKSwgaWRGb3JEZWNsYXJlQ2FjaGVkKF8pKSlcbn1cblxuZnVuY3Rpb24gZm9yTG9vcChvcEl0ZXJhdGVlLCBibG9jaykge1xuXHRyZXR1cm4gaWZFbHNlKG9wSXRlcmF0ZWUsXG5cdFx0KHtlbGVtZW50LCBiYWd9KSA9PiB7XG5cdFx0XHRjb25zdCBkZWNsYXJlID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2xldCcsXG5cdFx0XHRcdFtuZXcgVmFyaWFibGVEZWNsYXJhdG9yKHQwKGVsZW1lbnQpKV0pXG5cdFx0XHRyZXR1cm4gbmV3IEZvck9mU3RhdGVtZW50KGRlY2xhcmUsIHQwKGJhZyksIHQwKGJsb2NrKSlcblx0XHR9LFxuXHRcdCgpID0+IG5ldyBGb3JTdGF0ZW1lbnQobnVsbCwgbnVsbCwgbnVsbCwgdDAoYmxvY2spKSlcbn1cblxuZnVuY3Rpb24gbWV0aG9kS2V5Q29tcHV0ZWQoc3ltYm9sKSB7XG5cdGlmICh0eXBlb2Ygc3ltYm9sID09PSAnc3RyaW5nJylcblx0XHRyZXR1cm4ge2tleTogcHJvcGVydHlJZE9yTGl0ZXJhbChzeW1ib2wpLCBjb21wdXRlZDogZmFsc2V9XG5cdGVsc2Uge1xuXHRcdGNvbnN0IGtleSA9IHN5bWJvbCBpbnN0YW5jZW9mIFF1b3RlQWJzdHJhY3QgPyB0MChzeW1ib2wpIDogbXNTeW1ib2wodDAoc3ltYm9sKSlcblx0XHRyZXR1cm4ge2tleSwgY29tcHV0ZWQ6IHRydWV9XG5cdH1cbn1cblxuZnVuY3Rpb24gdHJhbnNwaWxlQmxvY2socmV0dXJuZWQsIGxpbmVzLCBsZWFkLCBvcFJldHVyblR5cGUpIHtcblx0Y29uc3QgZmluID0gbmV3IFJldHVyblN0YXRlbWVudChcblx0XHRtYXliZVdyYXBJbkNoZWNrQ29udGFpbnMocmV0dXJuZWQsIG9wUmV0dXJuVHlwZSwgJ3JldHVybmVkIHZhbHVlJykpXG5cdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIGxpbmVzLCBmaW4pKVxufVxuXG5mdW5jdGlvbiB0cmFuc3BpbGVFeGNlcHQoZXhjZXB0KSB7XG5cdHJldHVybiBuZXcgVHJ5U3RhdGVtZW50KFxuXHRcdHQwKGV4Y2VwdC50cnkpLFxuXHRcdG9wTWFwKGV4Y2VwdC5jYXRjaCwgdDApLFxuXHRcdG9wTWFwKGV4Y2VwdC5maW5hbGx5LCB0MCkpXG59XG5cbmZ1bmN0aW9uIHRyYW5zcGlsZVN3aXRjaChfKSB7XG5cdGNvbnN0IHBhcnRzID0gZmxhdE1hcChfLnBhcnRzLCB0MClcblx0cGFydHMucHVzaChpZkVsc2UoXy5vcEVsc2UsXG5cdFx0XyA9PiBuZXcgU3dpdGNoQ2FzZSh1bmRlZmluZWQsIHQwKF8pLmJvZHkpLFxuXHRcdCgpID0+IFN3aXRjaENhc2VOb01hdGNoKSlcblx0cmV0dXJuIG5ldyBTd2l0Y2hTdGF0ZW1lbnQodDAoXy5zd2l0Y2hlZCksIHBhcnRzKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMoYXNzaWduZWVzLCBpc0xhenksIHZhbHVlLCBpc01vZHVsZSkge1xuXHRjb25zdCBkZXN0cnVjdHVyZWROYW1lID0gYF8kJHtuZXh0RGVzdHJ1Y3R1cmVkSWR9YFxuXHRuZXh0RGVzdHJ1Y3R1cmVkSWQgPSBuZXh0RGVzdHJ1Y3R1cmVkSWQgKyAxXG5cdGNvbnN0IGlkRGVzdHJ1Y3R1cmVkID0gbmV3IElkZW50aWZpZXIoZGVzdHJ1Y3R1cmVkTmFtZSlcblx0Y29uc3QgZGVjbGFyYXRvcnMgPSBhc3NpZ25lZXMubWFwKGFzc2lnbmVlID0+IHtcblx0XHQvLyBUT0RPOiBEb24ndCBjb21waWxlIGl0IGlmIGl0J3MgbmV2ZXIgYWNjZXNzZWRcblx0XHRjb25zdCBnZXQgPSBnZXRNZW1iZXIoaWREZXN0cnVjdHVyZWQsIGFzc2lnbmVlLm5hbWUsIGlzTGF6eSwgaXNNb2R1bGUpXG5cdFx0cmV0dXJuIG1ha2VEZWNsYXJhdG9yKGFzc2lnbmVlLCBnZXQsIGlzTGF6eSlcblx0fSlcblx0Ly8gR2V0dGluZyBsYXp5IG1vZHVsZSBpcyBkb25lIGJ5IG1zLmxhenlHZXRNb2R1bGUuXG5cdGNvbnN0IHZhbCA9IGlzTGF6eSAmJiAhaXNNb2R1bGUgPyBsYXp5V3JhcCh2YWx1ZSkgOiB2YWx1ZVxuXHRyZXR1cm4gY2F0KG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoaWREZXN0cnVjdHVyZWQsIHZhbCksIGRlY2xhcmF0b3JzKVxufVxuIl19
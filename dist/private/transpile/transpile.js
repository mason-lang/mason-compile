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

			const oldInGenerator = isInGenerator;
			isInGenerator = this.isGenerator;

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

			const canUseArrowFunction = id === null && this.opDeclareThis === null && opDeclareRest === null && !this.isGenerator;
			return canUseArrowFunction ? new _esastDistAst.ArrowFunctionExpression(args, body) : new _esastDistAst.FunctionExpression(id, args, body, this.isGenerator);
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

		Quote() {
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

		QuoteTemplate() {
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
			const key = symbol instanceof _MsAst.Quote ? (0, _util2.t0)(symbol) : (0, _msCall.msSymbol)((0, _util2.t0)(symbol));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQStCd0IsU0FBUzs7Ozs7Ozs7O0FBTDFCLEtBQUksYUFBYSxDQUFBOztBQUN4QixLQUFJLGFBQWEsRUFBRSxlQUFlLENBQUE7QUFDbEMsS0FBSSxrQkFBa0IsQ0FBQTs7OztBQUdQLFVBQVMsU0FBUyxDQUFDLGdCQUFnQixFQUFFLGNBQWMsRUFBRTtBQUNuRSxVQU5VLGFBQWEsR0FNdkIsYUFBYSxHQUFHLGNBQWMsQ0FBQTtBQUM5QixlQUFhLEdBQUcsS0FBSyxDQUFBO0FBQ3JCLGlCQUFlLEdBQUcsS0FBSyxDQUFBO0FBQ3ZCLG9CQUFrQixHQUFHLENBQUMsQ0FBQTtBQUN0QixRQUFNLEdBQUcsR0FBRyxXQWI2RCxFQUFFLEVBYTVELGdCQUFnQixDQUFDLENBQUE7O0FBRWhDLFVBWlUsYUFBYSxHQVl2QixhQUFhLEdBQUcsSUFBSSxDQUFBO0FBQ3BCLFNBQU8sR0FBRyxDQUFBO0VBQ1Y7O0FBRUQsV0E3QmlELGFBQWEsVUE2QnBDLFdBQVcsRUFBRTtBQUN0QyxRQUFNLEdBQUc7QUFDUixTQUFNLFFBQVEsR0FBRyxNQUFNO0FBQ3RCLFVBQU0sSUFBSSxHQUFHLFdBdEIwRCxFQUFFLEVBc0J6RCxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDL0IsV0FBTyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxrQkF4Q3FCLGVBQWUsQ0F3Q2hCLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUMxRCxDQUFBOztBQUVELFVBQU8sVUFwQ2dDLE1BQU0sRUFvQy9CLElBQUksQ0FBQyxRQUFRLEVBQzFCLENBQUMsSUFBSSxrQkEvQ0ssV0FBVyxDQStDQSxRQUFRLEVBQUUsRUFBRSxXQTVCQyxPQUFPLEVBNEJBLENBQUMsQ0FBQyxDQUFDLEVBQzVDLE1BQU07QUFDTCxRQUFJLElBQUksQ0FBQyxTQUFT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QUFrQixFQUFDLENBQUMsQ0FBQTtBQUNsRCxvQkFBa0IsR0FBRyxrQkFBa0IsR0FBRyxDQUFDLENBQUE7QUFDM0MsUUFBTSxjQUFjLEdBQUcsa0JBMW1CdkIsVUFBVSxDQTBtQjRCLGdCQUFnQixDQUFDLENBQUE7QUFDdkQsUUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUk7O0FBRTdDLFNBQU0sR0FBRyxHQUFHLFdBMWxCZ0MsU0FBUyxFQTBsQi9CLGNBQWMsRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQTtBQUN0RSxVQUFPLFdBM2xCb0UsY0FBYyxFQTJsQm5FLFFBQVEsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUE7R0FDNUMsQ0FBQyxDQUFBOztBQUVGLFFBQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsR0FBRyxZQWxtQnJCLFFBQVEsRUFrbUJzQixLQUFLLENBQUMsR0FBRyxLQUFLLENBQUE7QUFDekQsU0FBTyxVQXhtQlEsR0FBRyxFQXdtQlAsa0JBL21CeUQsa0JBQWtCLENBK21CcEQsY0FBYyxFQUFFLEdBQUcsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0VBQ3BFIiwiZmlsZSI6InRyYW5zcGlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXJyYXlFeHByZXNzaW9uLCBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbiwgQXNzaWdubWVudEV4cHJlc3Npb24sIEJpbmFyeUV4cHJlc3Npb24sXG5cdEJsb2NrU3RhdGVtZW50LCBCcmVha1N0YXRlbWVudCwgQ2FsbEV4cHJlc3Npb24sIENhdGNoQ2xhdXNlLCBDbGFzc0JvZHksIENsYXNzRXhwcmVzc2lvbixcblx0Q29uZGl0aW9uYWxFeHByZXNzaW9uLCBEZWJ1Z2dlclN0YXRlbWVudCwgRm9yT2ZTdGF0ZW1lbnQsIEZvclN0YXRlbWVudCwgRnVuY3Rpb25FeHByZXNzaW9uLFxuXHRJZGVudGlmaWVyLCBJZlN0YXRlbWVudCwgTGl0ZXJhbCwgTG9naWNhbEV4cHJlc3Npb24sIE1lbWJlckV4cHJlc3Npb24sIE1ldGhvZERlZmluaXRpb24sXG5cdE5ld0V4cHJlc3Npb24sIE9iamVjdEV4cHJlc3Npb24sIFByb3BlcnR5LCBSZXR1cm5TdGF0ZW1lbnQsIFNwcmVhZEVsZW1lbnQsIFN3aXRjaENhc2UsXG5cdFN3aXRjaFN0YXRlbWVudCwgVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uLCBUZW1wbGF0ZUVsZW1lbnQsIFRlbXBsYXRlTGl0ZXJhbCwgVGhpc0V4cHJlc3Npb24sXG5cdFRocm93U3RhdGVtZW50LCBUcnlTdGF0ZW1lbnQsIFZhcmlhYmxlRGVjbGFyYXRpb24sIFVuYXJ5RXhwcmVzc2lvbiwgVmFyaWFibGVEZWNsYXJhdG9yLFxuXHRZaWVsZEV4cHJlc3Npb259IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IHtmdW5jdGlvbkV4cHJlc3Npb25UaHVuaywgaWRlbnRpZmllciwgbWVtYmVyLCBwcm9wZXJ0eUlkT3JMaXRlcmFsfSBmcm9tICdlc2FzdC9kaXN0L3V0aWwnXG5pbXBvcnQge2NoZWNrLCBvcHRpb25zfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0ICogYXMgTXNBc3RUeXBlcyBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7QXNzaWduU2luZ2xlLCBDYWxsLCBDb25zdHJ1Y3RvciwgTG9naWNzLCBNZW1iZXIsIExvY2FsRGVjbGFyZXMsIFBhdHRlcm4sIFNwbGF0LCBTZXR0ZXJzLFxuXHRTcGVjaWFsRG9zLCBTcGVjaWFsVmFscywgU3dpdGNoRG9QYXJ0LCBRdW90ZX0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2Fzc2VydCwgY2F0LCBmbGF0TWFwLCBmbGF0T3BNYXAsIGlmRWxzZSwgaW1wbGVtZW50TWFueSwgb3BJZiwgb3BNYXAsIHRhaWx9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0FycmF5U2xpY2VDYWxsLCBEZWNsYXJlQnVpbHRCYWcsIERlY2xhcmVCdWlsdE1hcCwgRGVjbGFyZUJ1aWx0T2JqLCBEZWNsYXJlTGV4aWNhbFRoaXMsXG5cdEV4cG9ydHNEZWZhdWx0LCBJZEFyZ3VtZW50cywgSWRCdWlsdCwgSWRFeHBvcnRzLCBJZEV4dHJhY3QsIElkRm9jdXMsIElkTGV4aWNhbFRoaXMsIElkU3VwZXIsXG5cdEdsb2JhbEVycm9yLCBMaXRFbXB0eVN0cmluZywgTGl0TnVsbCwgTGl0U3RyVGhyb3csIExpdFplcm8sIFJldHVybkJ1aWx0LCBTd2l0Y2hDYXNlTm9NYXRjaCxcblx0VGhyb3dBc3NlcnRGYWlsLCBUaHJvd05vQ2FzZU1hdGNofSBmcm9tICcuL2FzdC1jb25zdGFudHMnXG5pbXBvcnQge0lkTXMsIGxhenlXcmFwLCBtc0FkZCwgbXNBZGRNYW55LCBtc0Fzc2VydCwgbXNBc3NlcnRNZW1iZXIsIG1zQXNzZXJ0Tm90LCBtc0Fzc2VydE5vdE1lbWJlcixcblx0bXNFeHRyYWN0LCBtc05ld011dGFibGVQcm9wZXJ0eSwgbXNOZXdQcm9wZXJ0eSwgbXNTZXRMYXp5LCBtc1NldFN1YiwgbXNTb21lLCBtc1N5bWJvbCwgTXNOb25lXG5cdH0gZnJvbSAnLi9tcy1jYWxsJ1xuaW1wb3J0IHRyYW5zcGlsZU1vZHVsZSBmcm9tICcuL3RyYW5zcGlsZU1vZHVsZSdcbmltcG9ydCB7YWNjZXNzTG9jYWxEZWNsYXJlLCBkZWNsYXJlLCBkb1Rocm93LCBnZXRNZW1iZXIsIGlkRm9yRGVjbGFyZUNhY2hlZCwgbWFrZURlY2xhcmF0b3IsXG5cdG1heWJlV3JhcEluQ2hlY2tDb250YWlucywgbWVtYmVyU3RyaW5nT3JWYWwsIG9wVHlwZUNoZWNrRm9yTG9jYWxEZWNsYXJlLCB0MCwgdDEsIHQyLCB0MywgdExpbmVzXG5cdH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgbGV0IHZlcmlmeVJlc3VsdHNcbmxldCBpc0luR2VuZXJhdG9yLCBpc0luQ29uc3RydWN0b3JcbmxldCBuZXh0RGVzdHJ1Y3R1cmVkSWRcblxuLyoqIFRyYW5zZm9ybSBhIHtAbGluayBNc0FzdH0gaW50byBhbiBlc2FzdC4gKiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFuc3BpbGUobW9kdWxlRXhwcmVzc2lvbiwgX3ZlcmlmeVJlc3VsdHMpIHtcblx0dmVyaWZ5UmVzdWx0cyA9IF92ZXJpZnlSZXN1bHRzXG5cdGlzSW5HZW5lcmF0b3IgPSBmYWxzZVxuXHRpc0luQ29uc3RydWN0b3IgPSBmYWxzZVxuXHRuZXh0RGVzdHJ1Y3R1cmVkSWQgPSAwXG5cdGNvbnN0IHJlcyA9IHQwKG1vZHVsZUV4cHJlc3Npb24pXG5cdC8vIFJlbGVhc2UgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cblx0dmVyaWZ5UmVzdWx0cyA9IG51bGxcblx0cmV0dXJuIHJlc1xufVxuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICd0cmFuc3BpbGUnLCB7XG5cdEFzc2VydCgpIHtcblx0XHRjb25zdCBmYWlsQ29uZCA9ICgpID0+IHtcblx0XHRcdGNvbnN0IGNvbmQgPSB0MCh0aGlzLmNvbmRpdGlvbilcblx0XHRcdHJldHVybiB0aGlzLm5lZ2F0ZSA/IGNvbmQgOiBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgY29uZClcblx0XHR9XG5cblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BUaHJvd24sXG5cdFx0XHRfID0+IG5ldyBJZlN0YXRlbWVudChmYWlsQ29uZCgpLCBkb1Rocm93KF8pKSxcblx0XHRcdCgpID0+IHtcblx0XHRcdFx0aWYgKHRoaXMuY29uZGl0aW9uIGluc3RhbmNlb2YgQ2FsbCkge1xuXHRcdFx0XHRcdGNvbnN0IGNhbGwgPSB0aGlzLmNvbmRpdGlvblxuXHRcdFx0XHRcdGNvbnN0IGNhbGxlZCA9IGNhbGwuY2FsbGVkXG5cdFx0XHRcdFx0Y29uc3QgYXJncyA9IGNhbGwuYXJncy5tYXAodDApXG5cdFx0XHRcdFx0aWYgKGNhbGxlZCBpbnN0YW5jZW9mIE1lbWJlcikge1xuXHRcdFx0XHRcdFx0Y29uc3QgYXNzID0gdGhpcy5uZWdhdGUgPyBtc0Fzc2VydE5vdE1lbWJlciA6IG1zQXNzZXJ0TWVtYmVyXG5cdFx0XHRcdFx0XHRyZXR1cm4gYXNzKHQwKGNhbGxlZC5vYmplY3QpLCBuZXcgTGl0ZXJhbChjYWxsZWQubmFtZSksIC4uLmFyZ3MpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnN0IGFzcyA9IHRoaXMubmVnYXRlID8gbXNBc3NlcnROb3QgOiBtc0Fzc2VydFxuXHRcdFx0XHRcdFx0cmV0dXJuIGFzcyh0MChjYWxsZWQpLCAuLi5hcmdzKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudChmYWlsQ29uZCgpLCBUaHJvd0Fzc2VydEZhaWwpXG5cdFx0XHR9KVxuXHR9LFxuXG5cdEFzc2lnblNpbmdsZSh2YWxXcmFwKSB7XG5cdFx0Y29uc3QgdmFsID0gdmFsV3JhcCA9PT0gdW5kZWZpbmVkID8gdDAodGhpcy52YWx1ZSkgOiB2YWxXcmFwKHQwKHRoaXMudmFsdWUpKVxuXHRcdGNvbnN0IGRlY2xhcmUgPSBtYWtlRGVjbGFyYXRvcih0aGlzLmFzc2lnbmVlLCB2YWwsIGZhbHNlKVxuXHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbih0aGlzLmFzc2lnbmVlLmlzTXV0YWJsZSgpID8gJ2xldCcgOiAnY29uc3QnLCBbZGVjbGFyZV0pXG5cdH0sXG5cdC8vIFRPRE86RVM2IEp1c3QgdXNlIG5hdGl2ZSBkZXN0cnVjdHVyaW5nIGFzc2lnblxuXHRBc3NpZ25EZXN0cnVjdHVyZSgpIHtcblx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oXG5cdFx0XHR0aGlzLmtpbmQoKSA9PT0gTG9jYWxEZWNsYXJlcy5NdXRhYmxlID8gJ2xldCcgOiAnY29uc3QnLFxuXHRcdFx0bWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMoXG5cdFx0XHRcdHRoaXMuYXNzaWduZWVzLFxuXHRcdFx0XHR0aGlzLmtpbmQoKSA9PT0gTG9jYWxEZWNsYXJlcy5MYXp5LFxuXHRcdFx0XHR0MCh0aGlzLnZhbHVlKSxcblx0XHRcdFx0ZmFsc2UpKVxuXHR9LFxuXG5cdEJhZ0VudHJ5KCkgeyByZXR1cm4gbXNBZGQoSWRCdWlsdCwgdDAodGhpcy52YWx1ZSkpIH0sXG5cblx0QmFnRW50cnlNYW55KCkgeyByZXR1cm4gbXNBZGRNYW55KElkQnVpbHQsIHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdEJhZ1NpbXBsZSgpIHsgcmV0dXJuIG5ldyBBcnJheUV4cHJlc3Npb24odGhpcy5wYXJ0cy5tYXAodDApKSB9LFxuXG5cdEJsb2NrRG8obGVhZD1udWxsLCBvcFJldHVyblR5cGU9bnVsbCwgZm9sbG93PW51bGwpIHtcblx0XHRhc3NlcnQob3BSZXR1cm5UeXBlID09PSBudWxsKVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHRMaW5lcyh0aGlzLmxpbmVzKSwgZm9sbG93KSlcblx0fSxcblxuXHRCbG9ja1ZhbFRocm93KGxlYWQ9bnVsbCwgX29wUmV0dXJuVHlwZSkge1xuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHRMaW5lcyh0aGlzLmxpbmVzKSwgdDAodGhpcy50aHJvdykpKVxuXHR9LFxuXG5cdEJsb2NrVmFsUmV0dXJuKGxlYWQ9bnVsbCwgb3BSZXR1cm5UeXBlPW51bGwpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2sodDAodGhpcy5yZXR1cm5lZCksIHRMaW5lcyh0aGlzLmxpbmVzKSwgbGVhZCwgb3BSZXR1cm5UeXBlKVxuXHR9LFxuXG5cdEJsb2NrQmFnKGxlYWQ9bnVsbCwgb3BSZXR1cm5UeXBlPW51bGwpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2soXG5cdFx0XHRJZEJ1aWx0LFxuXHRcdFx0Y2F0KERlY2xhcmVCdWlsdEJhZywgdExpbmVzKHRoaXMubGluZXMpKSxcblx0XHRcdGxlYWQsIG9wUmV0dXJuVHlwZSlcblx0fSxcblxuXHRCbG9ja09iaihsZWFkPW51bGwsIG9wUmV0dXJuVHlwZT1udWxsKSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKFxuXHRcdFx0SWRCdWlsdCxcblx0XHRcdGNhdChEZWNsYXJlQnVpbHRPYmosIHRMaW5lcyh0aGlzLmxpbmVzKSksXG5cdFx0XHRsZWFkLCBvcFJldHVyblR5cGUpXG5cdH0sXG5cblx0QmxvY2tNYXAobGVhZD1udWxsLCBvcFJldHVyblR5cGU9bnVsbCkge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayhcblx0XHRcdElkQnVpbHQsXG5cdFx0XHRjYXQoRGVjbGFyZUJ1aWx0TWFwLCB0TGluZXModGhpcy5saW5lcykpLFxuXHRcdFx0bGVhZCwgb3BSZXR1cm5UeXBlKVxuXHR9LFxuXG5cdEJsb2NrV3JhcCgpIHtcblx0XHRyZXR1cm4gYmxvY2tXcmFwKHQwKHRoaXMuYmxvY2spKVxuXHR9LFxuXG5cdEJyZWFrKCkge1xuXHRcdHJldHVybiBuZXcgQnJlYWtTdGF0ZW1lbnQoKVxuXHR9LFxuXG5cdEJyZWFrV2l0aFZhbCgpIHtcblx0XHRyZXR1cm4gbmV3IFJldHVyblN0YXRlbWVudCh0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRDYWxsKCkge1xuXHRcdHJldHVybiBuZXcgQ2FsbEV4cHJlc3Npb24odDAodGhpcy5jYWxsZWQpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHRDYXNlRG8oKSB7XG5cdFx0Y29uc3QgYm9keSA9IGNhc2VCb2R5KHRoaXMucGFydHMsIHRoaXMub3BFbHNlKVxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcENhc2VkLCBfID0+IG5ldyBCbG9ja1N0YXRlbWVudChbdDAoXyksIGJvZHldKSwgKCkgPT4gYm9keSlcblx0fSxcblx0Q2FzZVZhbCgpIHtcblx0XHRjb25zdCBib2R5ID0gY2FzZUJvZHkodGhpcy5wYXJ0cywgdGhpcy5vcEVsc2UpXG5cdFx0Y29uc3QgYmxvY2sgPSBpZkVsc2UodGhpcy5vcENhc2VkLCBfID0+IFt0MChfKSwgYm9keV0sICgpID0+IFtib2R5XSlcblx0XHRyZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChibG9jaykpXG5cdH0sXG5cdENhc2VEb1BhcnQ6IGNhc2VQYXJ0LFxuXHRDYXNlVmFsUGFydDogY2FzZVBhcnQsXG5cblx0Q2xhc3MoKSB7XG5cdFx0Y29uc3QgbWV0aG9kcyA9IGNhdChcblx0XHRcdHRoaXMuc3RhdGljcy5tYXAoXyA9PiB0MShfLCB0cnVlKSksXG5cdFx0XHRvcE1hcCh0aGlzLm9wQ29uc3RydWN0b3IsIHQwKSxcblx0XHRcdHRoaXMubWV0aG9kcy5tYXAoXyA9PiB0MShfLCBmYWxzZSkpKVxuXHRcdGNvbnN0IG9wTmFtZSA9IG9wTWFwKHZlcmlmeVJlc3VsdHMub3BOYW1lKHRoaXMpLCBpZGVudGlmaWVyKVxuXHRcdGNvbnN0IGNsYXNzRXhwciA9IG5ldyBDbGFzc0V4cHJlc3Npb24oXG5cdFx0XHRvcE5hbWUsXG5cdFx0XHRvcE1hcCh0aGlzLm9wU3VwZXJDbGFzcywgdDApLCBuZXcgQ2xhc3NCb2R5KG1ldGhvZHMpKVxuXG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wRG8sIF8gPT4gdDEoXywgY2xhc3NFeHByKSwgKCkgPT4gY2xhc3NFeHByKVxuXHR9LFxuXG5cdENsYXNzRG8oY2xhc3NFeHByKSB7XG5cdFx0Y29uc3QgbGVhZCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IodDAodGhpcy5kZWNsYXJlRm9jdXMpLCBjbGFzc0V4cHIpXSlcblx0XHRjb25zdCByZXQgPSBuZXcgUmV0dXJuU3RhdGVtZW50KHQwKHRoaXMuZGVjbGFyZUZvY3VzKSlcblx0XHRjb25zdCBibG9jayA9IHQzKHRoaXMuYmxvY2ssIGxlYWQsIG51bGwsIHJldClcblx0XHRyZXR1cm4gYmxvY2tXcmFwKGJsb2NrKVxuXHR9LFxuXG5cdENvbmQoKSB7XG5cdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odDAodGhpcy50ZXN0KSwgdDAodGhpcy5pZlRydWUpLCB0MCh0aGlzLmlmRmFsc2UpKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsRG8oKSB7XG5cdFx0Y29uc3QgdGVzdCA9IHQwKHRoaXMudGVzdClcblx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KFxuXHRcdFx0dGhpcy5pc1VubGVzcyA/IG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCB0ZXN0KSA6IHRlc3QsXG5cdFx0XHR0MCh0aGlzLnJlc3VsdCkpXG5cdH0sXG5cblx0Q29uZGl0aW9uYWxWYWwoKSB7XG5cdFx0Y29uc3QgdGVzdCA9IHQwKHRoaXMudGVzdClcblx0XHRjb25zdCByZXN1bHQgPSBtc1NvbWUoYmxvY2tXcmFwKHQwKHRoaXMucmVzdWx0KSkpXG5cdFx0cmV0dXJuIHRoaXMuaXNVbmxlc3MgP1xuXHRcdFx0bmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXN0LCBNc05vbmUsIHJlc3VsdCkgOlxuXHRcdFx0bmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXN0LCByZXN1bHQsIE1zTm9uZSlcblx0fSxcblxuXHRDb25zdHJ1Y3RvcigpIHtcblx0XHRpc0luQ29uc3RydWN0b3IgPSB0cnVlXG5cblx0XHQvLyBJZiB0aGVyZSBpcyBhIGBzdXBlciFgLCBgdGhpc2Agd2lsbCBub3QgYmUgZGVmaW5lZCB1bnRpbCB0aGVuLCBzbyBtdXN0IHdhaXQgdW50aWwgdGhlbi5cblx0XHQvLyBPdGhlcndpc2UsIGRvIGl0IGF0IHRoZSBiZWdpbm5pbmcuXG5cdFx0Y29uc3QgYm9keSA9IHZlcmlmeVJlc3VsdHMuY29uc3RydWN0b3JUb1N1cGVyLmhhcyh0aGlzKSA/XG5cdFx0XHR0MCh0aGlzLmZ1bikgOlxuXHRcdFx0dDEodGhpcy5mdW4sIGNvbnN0cnVjdG9yU2V0TWVtYmVycyh0aGlzKSlcblxuXHRcdGNvbnN0IHJlcyA9IE1ldGhvZERlZmluaXRpb24uY29uc3RydWN0b3IoYm9keSlcblx0XHRpc0luQ29uc3RydWN0b3IgPSBmYWxzZVxuXHRcdHJldHVybiByZXNcblx0fSxcblxuXHRDYXRjaCgpIHtcblx0XHRyZXR1cm4gbmV3IENhdGNoQ2xhdXNlKHQwKHRoaXMuY2F1Z2h0KSwgdDAodGhpcy5ibG9jaykpXG5cdH0sXG5cblx0RXhjZXB0RG8oKSB7IHJldHVybiB0cmFuc3BpbGVFeGNlcHQodGhpcykgfSxcblx0RXhjZXB0VmFsKCkgeyByZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChbdHJhbnNwaWxlRXhjZXB0KHRoaXMpXSkpIH0sXG5cblx0Rm9yRG8oKSB7IHJldHVybiBmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jaykgfSxcblxuXHRGb3JCYWcoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW1xuXHRcdFx0RGVjbGFyZUJ1aWx0QmFnLFxuXHRcdFx0Zm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spLFxuXHRcdFx0UmV0dXJuQnVpbHRcblx0XHRdKSlcblx0fSxcblxuXHRGb3JWYWwoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW2Zvckxvb3AodGhpcy5vcEl0ZXJhdGVlLCB0aGlzLmJsb2NrKV0pKVxuXHR9LFxuXG5cdEZ1bihsZWFkU3RhdGVtZW50cz1udWxsKSB7XG5cdFx0Y29uc3Qgb2xkSW5HZW5lcmF0b3IgPSBpc0luR2VuZXJhdG9yXG5cdFx0aXNJbkdlbmVyYXRvciA9IHRoaXMuaXNHZW5lcmF0b3JcblxuXHRcdC8vIFRPRE86RVM2IHVzZSBgLi4uYGZcblx0XHRjb25zdCBuQXJncyA9IG5ldyBMaXRlcmFsKHRoaXMuYXJncy5sZW5ndGgpXG5cdFx0Y29uc3Qgb3BEZWNsYXJlUmVzdCA9IG9wTWFwKHRoaXMub3BSZXN0QXJnLCByZXN0ID0+XG5cdFx0XHRkZWNsYXJlKHJlc3QsIG5ldyBDYWxsRXhwcmVzc2lvbihBcnJheVNsaWNlQ2FsbCwgW0lkQXJndW1lbnRzLCBuQXJnc10pKSlcblx0XHRjb25zdCBhcmdDaGVja3MgPSBvcElmKG9wdGlvbnMuaW5jbHVkZUNoZWNrcygpLCAoKSA9PlxuXHRcdFx0ZmxhdE9wTWFwKHRoaXMuYXJncywgb3BUeXBlQ2hlY2tGb3JMb2NhbERlY2xhcmUpKVxuXG5cdFx0Y29uc3Qgb3BEZWNsYXJlVGhpcyA9XG5cdFx0XHRvcElmKCFpc0luQ29uc3RydWN0b3IgJiYgdGhpcy5vcERlY2xhcmVUaGlzICE9IG51bGwsICgpID0+IERlY2xhcmVMZXhpY2FsVGhpcylcblxuXHRcdGNvbnN0IGxlYWQgPSBjYXQobGVhZFN0YXRlbWVudHMsIG9wRGVjbGFyZVRoaXMsIG9wRGVjbGFyZVJlc3QsIGFyZ0NoZWNrcylcblxuXHRcdGNvbnN0IGJvZHkgPSB0Mih0aGlzLmJsb2NrLCBsZWFkLCB0aGlzLm9wUmV0dXJuVHlwZSlcblx0XHRjb25zdCBhcmdzID0gdGhpcy5hcmdzLm1hcCh0MClcblx0XHRpc0luR2VuZXJhdG9yID0gb2xkSW5HZW5lcmF0b3Jcblx0XHRjb25zdCBpZCA9IG9wTWFwKHZlcmlmeVJlc3VsdHMub3BOYW1lKHRoaXMpLCBpZGVudGlmaWVyKVxuXG5cdFx0Y29uc3QgY2FuVXNlQXJyb3dGdW5jdGlvbiA9XG5cdFx0XHRpZCA9PT0gbnVsbCAmJlxuXHRcdFx0dGhpcy5vcERlY2xhcmVUaGlzID09PSBudWxsICYmXG5cdFx0XHRvcERlY2xhcmVSZXN0ID09PSBudWxsICYmXG5cdFx0XHQhdGhpcy5pc0dlbmVyYXRvclxuXHRcdHJldHVybiBjYW5Vc2VBcnJvd0Z1bmN0aW9uID9cblx0XHRcdG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihhcmdzLCBib2R5KSA6XG5cdFx0XHRuZXcgRnVuY3Rpb25FeHByZXNzaW9uKGlkLCBhcmdzLCBib2R5LCB0aGlzLmlzR2VuZXJhdG9yKVxuXHR9LFxuXG5cdElnbm9yZSgpIHtcblx0XHRyZXR1cm4gW11cblx0fSxcblxuXHRMYXp5KCkge1xuXHRcdHJldHVybiBsYXp5V3JhcCh0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRNZXRob2RJbXBsKGlzU3RhdGljKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSB0MCh0aGlzLmZ1bilcblx0XHRhc3NlcnQodmFsdWUuaWQgPT0gbnVsbClcblx0XHQvLyBTaW5jZSB0aGUgRnVuIHNob3VsZCBoYXZlIG9wRGVjbGFyZVRoaXMsIGl0IHdpbGwgbmV2ZXIgYmUgYW4gQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24uXG5cdFx0YXNzZXJ0KHZhbHVlIGluc3RhbmNlb2YgRnVuY3Rpb25FeHByZXNzaW9uKVxuXG5cdFx0Y29uc3Qge2tleSwgY29tcHV0ZWR9ID0gbWV0aG9kS2V5Q29tcHV0ZWQodGhpcy5zeW1ib2wpXG5cdFx0cmV0dXJuIG5ldyBNZXRob2REZWZpbml0aW9uKGtleSwgdmFsdWUsICdtZXRob2QnLCBpc1N0YXRpYywgY29tcHV0ZWQpXG5cdH0sXG5cdE1ldGhvZEdldHRlcihpc1N0YXRpYykge1xuXHRcdGNvbnN0IHZhbHVlID0gbmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihudWxsLCBbXSwgdDEodGhpcy5ibG9jaywgRGVjbGFyZUxleGljYWxUaGlzKSlcblx0XHRjb25zdCB7a2V5LCBjb21wdXRlZH0gPSBtZXRob2RLZXlDb21wdXRlZCh0aGlzLnN5bWJvbClcblx0XHRyZXR1cm4gbmV3IE1ldGhvZERlZmluaXRpb24oa2V5LCB2YWx1ZSwgJ2dldCcsIGlzU3RhdGljLCBjb21wdXRlZClcblx0fSxcblx0TWV0aG9kU2V0dGVyKGlzU3RhdGljKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFtJZEZvY3VzXSwgdDEodGhpcy5ibG9jaywgRGVjbGFyZUxleGljYWxUaGlzKSlcblx0XHRjb25zdCB7a2V5LCBjb21wdXRlZH0gPSBtZXRob2RLZXlDb21wdXRlZCh0aGlzLnN5bWJvbClcblx0XHRyZXR1cm4gbmV3IE1ldGhvZERlZmluaXRpb24oa2V5LCB2YWx1ZSwgJ3NldCcsIGlzU3RhdGljLCBjb21wdXRlZClcblx0fSxcblxuXHROdW1iZXJMaXRlcmFsKCkge1xuXHRcdC8vIE5lZ2F0aXZlIG51bWJlcnMgYXJlIG5vdCBwYXJ0IG9mIEVTIHNwZWMuXG5cdFx0Ly8gaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzUuMS8jc2VjLTcuOC4zXG5cdFx0Y29uc3QgdmFsdWUgPSBOdW1iZXIodGhpcy52YWx1ZSlcblx0XHRjb25zdCBsaXQgPSBuZXcgTGl0ZXJhbChNYXRoLmFicyh2YWx1ZSkpXG5cdFx0Y29uc3QgaXNQb3NpdGl2ZSA9IHZhbHVlID49IDAgJiYgMSAvIHZhbHVlICE9PSAtSW5maW5pdHlcblx0XHRyZXR1cm4gaXNQb3NpdGl2ZSA/IGxpdCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJy0nLCBsaXQpXG5cdH0sXG5cblx0TG9jYWxBY2Nlc3MoKSB7XG5cdFx0aWYgKHRoaXMubmFtZSA9PT0gJ3RoaXMnKVxuXHRcdFx0cmV0dXJuIGlzSW5Db25zdHJ1Y3RvciA/IG5ldyBUaGlzRXhwcmVzc2lvbigpIDogSWRMZXhpY2FsVGhpc1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgbGQgPSB2ZXJpZnlSZXN1bHRzLmxvY2FsRGVjbGFyZUZvckFjY2Vzcyh0aGlzKVxuXHRcdFx0Ly8gSWYgbGQgbWlzc2luZywgdGhpcyBpcyBhIGJ1aWx0aW4sIGFuZCBidWlsdGlucyBhcmUgbmV2ZXIgbGF6eVxuXHRcdFx0cmV0dXJuIGxkID09PSB1bmRlZmluZWQgPyBpZGVudGlmaWVyKHRoaXMubmFtZSkgOiBhY2Nlc3NMb2NhbERlY2xhcmUobGQpXG5cdFx0fVxuXHR9LFxuXG5cdExvY2FsRGVjbGFyZSgpIHsgcmV0dXJuIG5ldyBJZGVudGlmaWVyKGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzKS5uYW1lKSB9LFxuXG5cdExvY2FsTXV0YXRlKCkge1xuXHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBpZGVudGlmaWVyKHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdExvZ2ljKCkge1xuXHRcdGNvbnN0IG9wID0gdGhpcy5raW5kID09PSBMb2dpY3MuQW5kID8gJyYmJyA6ICd8fCdcblx0XHRyZXR1cm4gdGFpbCh0aGlzLmFyZ3MpLnJlZHVjZSgoYSwgYikgPT5cblx0XHRcdG5ldyBMb2dpY2FsRXhwcmVzc2lvbihvcCwgYSwgdDAoYikpLCB0MCh0aGlzLmFyZ3NbMF0pKVxuXHR9LFxuXG5cdE1hcEVudHJ5KCkgeyByZXR1cm4gbXNTZXRTdWIoSWRCdWlsdCwgdDAodGhpcy5rZXkpLCB0MCh0aGlzLnZhbCkpIH0sXG5cblx0TWVtYmVyKCkge1xuXHRcdHJldHVybiBtZW1iZXJTdHJpbmdPclZhbCh0MCh0aGlzLm9iamVjdCksIHRoaXMubmFtZSlcblx0fSxcblxuXHRNZW1iZXJTZXQoKSB7XG5cdFx0Y29uc3Qgb2JqID0gdDAodGhpcy5vYmplY3QpXG5cdFx0Y29uc3QgbmFtZSA9ICgpID0+XG5cdFx0XHR0eXBlb2YgdGhpcy5uYW1lID09PSAnc3RyaW5nJyA/IG5ldyBMaXRlcmFsKHRoaXMubmFtZSkgOiB0MCh0aGlzLm5hbWUpXG5cdFx0Y29uc3QgdmFsID0gbWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHQwKHRoaXMudmFsdWUpLCB0aGlzLm9wVHlwZSwgdGhpcy5uYW1lKVxuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIFNldHRlcnMuSW5pdDpcblx0XHRcdFx0cmV0dXJuIG1zTmV3UHJvcGVydHkob2JqLCBuYW1lKCksIHZhbClcblx0XHRcdGNhc2UgU2V0dGVycy5Jbml0TXV0YWJsZTpcblx0XHRcdFx0cmV0dXJuIG1zTmV3TXV0YWJsZVByb3BlcnR5KG9iaiwgbmFtZSgpLCB2YWwpXG5cdFx0XHRjYXNlIFNldHRlcnMuTXV0YXRlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyU3RyaW5nT3JWYWwob2JqLCB0aGlzLm5hbWUpLCB2YWwpXG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdH1cblx0fSxcblxuXHRNb2R1bGU6IHRyYW5zcGlsZU1vZHVsZSxcblxuXHRNb2R1bGVFeHBvcnROYW1lZCgpIHtcblx0XHRyZXR1cm4gdDEodGhpcy5hc3NpZ24sIHZhbCA9PlxuXHRcdFx0bmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyKElkRXhwb3J0cywgdGhpcy5hc3NpZ24uYXNzaWduZWUubmFtZSksIHZhbCkpXG5cdH0sXG5cblx0TW9kdWxlRXhwb3J0RGVmYXVsdCgpIHtcblx0XHRyZXR1cm4gdDEodGhpcy5hc3NpZ24sIHZhbCA9PiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBFeHBvcnRzRGVmYXVsdCwgdmFsKSlcblx0fSxcblxuXHROZXcoKSB7XG5cdFx0Y29uc3QgYW55U3BsYXQgPSB0aGlzLmFyZ3Muc29tZShfID0+IF8gaW5zdGFuY2VvZiBTcGxhdClcblx0XHRjaGVjayghYW55U3BsYXQsIHRoaXMubG9jLCAnVE9ETzogU3BsYXQgcGFyYW1zIGZvciBuZXcnKVxuXHRcdHJldHVybiBuZXcgTmV3RXhwcmVzc2lvbih0MCh0aGlzLnR5cGUpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHROb3QoKSB7IHJldHVybiBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgdDAodGhpcy5hcmcpKSB9LFxuXG5cdE9iakVudHJ5QXNzaWduKCkge1xuXHRcdHJldHVybiB0aGlzLmFzc2lnbiBpbnN0YW5jZW9mIEFzc2lnblNpbmdsZSAmJiAhdGhpcy5hc3NpZ24uYXNzaWduZWUuaXNMYXp5KCkgP1xuXHRcdFx0dDEodGhpcy5hc3NpZ24sIHZhbCA9PlxuXHRcdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRCdWlsdCwgdGhpcy5hc3NpZ24uYXNzaWduZWUubmFtZSksIHZhbCkpIDpcblx0XHRcdGNhdChcblx0XHRcdFx0dDAodGhpcy5hc3NpZ24pLFxuXHRcdFx0XHR0aGlzLmFzc2lnbi5hbGxBc3NpZ25lZXMoKS5tYXAoXyA9PlxuXHRcdFx0XHRcdG1zU2V0TGF6eShJZEJ1aWx0LCBuZXcgTGl0ZXJhbChfLm5hbWUpLCBpZEZvckRlY2xhcmVDYWNoZWQoXykpKSlcblx0fSxcblxuXHRPYmpFbnRyeVBsYWluKCkge1xuXHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXJTdHJpbmdPclZhbChJZEJ1aWx0LCB0aGlzLm5hbWUpLCB0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRPYmpTaW1wbGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBPYmplY3RFeHByZXNzaW9uKHRoaXMucGFpcnMubWFwKHBhaXIgPT5cblx0XHRcdG5ldyBQcm9wZXJ0eSgnaW5pdCcsIHByb3BlcnR5SWRPckxpdGVyYWwocGFpci5rZXkpLCB0MChwYWlyLnZhbHVlKSkpKVxuXHR9LFxuXG5cdFF1b3RlKCkge1xuXHRcdGlmICh0aGlzLnBhcnRzLmxlbmd0aCA9PT0gMClcblx0XHRcdHJldHVybiBMaXRFbXB0eVN0cmluZ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgcXVhc2lzID0gW10sIGV4cHJlc3Npb25zID0gW11cblxuXHRcdFx0Ly8gVGVtcGxhdGVMaXRlcmFsIG11c3Qgc3RhcnQgd2l0aCBhIFRlbXBsYXRlRWxlbWVudFxuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLnBhcnRzWzBdICE9PSAnc3RyaW5nJylcblx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmVtcHR5KVxuXG5cdFx0XHRmb3IgKGxldCBwYXJ0IG9mIHRoaXMucGFydHMpXG5cdFx0XHRcdGlmICh0eXBlb2YgcGFydCA9PT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmZvclJhd1N0cmluZyhwYXJ0KSlcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Ly8gXCJ7MX17MX1cIiBuZWVkcyBhbiBlbXB0eSBxdWFzaSBpbiB0aGUgbWlkZGxlIChhbmQgb24gdGhlIGVuZHMpXG5cdFx0XHRcdFx0aWYgKHF1YXNpcy5sZW5ndGggPT09IGV4cHJlc3Npb25zLmxlbmd0aClcblx0XHRcdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5lbXB0eSlcblx0XHRcdFx0XHRleHByZXNzaW9ucy5wdXNoKHQwKHBhcnQpKVxuXHRcdFx0XHR9XG5cblx0XHRcdC8vIFRlbXBsYXRlTGl0ZXJhbCBtdXN0IGVuZCB3aXRoIGEgVGVtcGxhdGVFbGVtZW50LCBzbyBvbmUgbW9yZSBxdWFzaSB0aGFuIGV4cHJlc3Npb24uXG5cdFx0XHRpZiAocXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoKVxuXHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZW1wdHkpXG5cblx0XHRcdHJldHVybiBuZXcgVGVtcGxhdGVMaXRlcmFsKHF1YXNpcywgZXhwcmVzc2lvbnMpXG5cdFx0fVxuXHR9LFxuXG5cdFF1b3RlVGVtcGxhdGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBUYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb24odDAodGhpcy50YWcpLCB0MCh0aGlzLnF1b3RlKSlcblx0fSxcblxuXHRTZXRTdWIoKSB7XG5cdFx0Y29uc3QgZ2V0S2luZCA9ICgpID0+IHtcblx0XHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRcdGNhc2UgU2V0dGVycy5Jbml0OlxuXHRcdFx0XHRcdHJldHVybiAnaW5pdCdcblx0XHRcdFx0Y2FzZSBTZXR0ZXJzLkluaXRNdXRhYmxlOlxuXHRcdFx0XHRcdHJldHVybiAnaW5pdC1tdXRhYmxlJ1xuXHRcdFx0XHRjYXNlIFNldHRlcnMuTXV0YXRlOlxuXHRcdFx0XHRcdHJldHVybiAnbXV0YXRlJ1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNvbnN0IGtpbmQgPSBnZXRLaW5kKClcblx0XHRyZXR1cm4gbXNTZXRTdWIoXG5cdFx0XHR0MCh0aGlzLm9iamVjdCksXG5cdFx0XHR0aGlzLnN1YmJlZHMubGVuZ3RoID09PSAxID8gdDAodGhpcy5zdWJiZWRzWzBdKSA6IHRoaXMuc3ViYmVkcy5tYXAodDApLFxuXHRcdFx0bWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHQwKHRoaXMudmFsdWUpLCB0aGlzLm9wVHlwZSwgJ3ZhbHVlJyksXG5cdFx0XHRuZXcgTGl0ZXJhbChraW5kKSlcblx0fSxcblxuXHRTcGVjaWFsRG8oKSB7XG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU3BlY2lhbERvcy5EZWJ1Z2dlcjogcmV0dXJuIG5ldyBEZWJ1Z2dlclN0YXRlbWVudCgpXG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IodGhpcy5raW5kKVxuXHRcdH1cblx0fSxcblxuXHRTcGVjaWFsVmFsKCkge1xuXHRcdC8vIE1ha2UgbmV3IG9iamVjdHMgYmVjYXVzZSB3ZSB3aWxsIGFzc2lnbiBgbG9jYCB0byB0aGVtLlxuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLkNvbnRhaW5zOlxuXHRcdFx0XHRyZXR1cm4gbWVtYmVyKElkTXMsICdjb250YWlucycpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLkRlbFN1Yjpcblx0XHRcdFx0cmV0dXJuIG1lbWJlcihJZE1zLCAnZGVsU3ViJylcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuRmFsc2U6XG5cdFx0XHRcdHJldHVybiBuZXcgTGl0ZXJhbChmYWxzZSlcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuTmFtZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKHZlcmlmeVJlc3VsdHMubmFtZSh0aGlzKSlcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuTnVsbDpcblx0XHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKG51bGwpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLlNldFN1Yjpcblx0XHRcdFx0cmV0dXJuIG1lbWJlcihJZE1zLCAnc2V0U3ViJylcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuU3ViOlxuXHRcdFx0XHRyZXR1cm4gbWVtYmVyKElkTXMsICdzdWInKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5UcnVlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IExpdGVyYWwodHJ1ZSlcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuVW5kZWZpbmVkOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFVuYXJ5RXhwcmVzc2lvbigndm9pZCcsIExpdFplcm8pXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IodGhpcy5raW5kKVxuXHRcdH1cblx0fSxcblxuXHRTcGxhdCgpIHtcblx0XHRyZXR1cm4gbmV3IFNwcmVhZEVsZW1lbnQodDAodGhpcy5zcGxhdHRlZCkpXG5cdH0sXG5cblx0U3VwZXJDYWxsOiBzdXBlckNhbGwsXG5cdFN1cGVyQ2FsbERvOiBzdXBlckNhbGwsXG5cdFN1cGVyTWVtYmVyKCkge1xuXHRcdHJldHVybiBtZW1iZXJTdHJpbmdPclZhbChJZFN1cGVyLCB0aGlzLm5hbWUpXG5cdH0sXG5cblx0U3dpdGNoRG8oKSB7IHJldHVybiB0cmFuc3BpbGVTd2l0Y2godGhpcykgfSxcblx0U3dpdGNoVmFsKCkgeyByZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChbdHJhbnNwaWxlU3dpdGNoKHRoaXMpXSkpIH0sXG5cdFN3aXRjaERvUGFydDogc3dpdGNoUGFydCxcblx0U3dpdGNoVmFsUGFydDogc3dpdGNoUGFydCxcblxuXHRUaHJvdygpIHtcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BUaHJvd24sXG5cdFx0XHRfID0+IGRvVGhyb3coXyksXG5cdFx0XHQoKSA9PiBuZXcgVGhyb3dTdGF0ZW1lbnQobmV3IE5ld0V4cHJlc3Npb24oR2xvYmFsRXJyb3IsIFtMaXRTdHJUaHJvd10pKSlcblx0fSxcblxuXHRXaXRoKCkge1xuXHRcdGNvbnN0IGlkRGVjbGFyZSA9IGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzLmRlY2xhcmUpXG5cdFx0Y29uc3QgYmxvY2sgPSB0Myh0aGlzLmJsb2NrLCBudWxsLCBudWxsLCBuZXcgUmV0dXJuU3RhdGVtZW50KGlkRGVjbGFyZSkpXG5cdFx0Y29uc3QgZnVuID0gaXNJbkdlbmVyYXRvciA/XG5cdFx0XHRuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFtpZERlY2xhcmVdLCBibG9jaywgdHJ1ZSkgOlxuXHRcdFx0bmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKFtpZERlY2xhcmVdLCBibG9jaylcblx0XHRjb25zdCBjYWxsID0gbmV3IENhbGxFeHByZXNzaW9uKGZ1biwgW3QwKHRoaXMudmFsdWUpXSlcblx0XHRyZXR1cm4gaXNJbkdlbmVyYXRvciA/IG5ldyBZaWVsZEV4cHJlc3Npb24oY2FsbCwgdHJ1ZSkgOiBjYWxsXG5cdH0sXG5cblx0WWllbGQoKSB7IHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKG9wTWFwKHRoaXMub3BZaWVsZGVkLCB0MCksIGZhbHNlKSB9LFxuXG5cdFlpZWxkVG8oKSB7IHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKHQwKHRoaXMueWllbGRlZFRvKSwgdHJ1ZSkgfVxufSlcblxuLy8gU2hhcmVkIGltcGxlbWVudGF0aW9uc1xuXG5mdW5jdGlvbiBjYXNlUGFydChhbHRlcm5hdGUpIHtcblx0aWYgKHRoaXMudGVzdCBpbnN0YW5jZW9mIFBhdHRlcm4pIHtcblx0XHRjb25zdCB7dHlwZSwgcGF0dGVybmVkLCBsb2NhbHN9ID0gdGhpcy50ZXN0XG5cdFx0Y29uc3QgZGVjbCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRFeHRyYWN0LCBtc0V4dHJhY3QodDAodHlwZSksIHQwKHBhdHRlcm5lZCkpKV0pXG5cdFx0Y29uc3QgdGVzdCA9IG5ldyBCaW5hcnlFeHByZXNzaW9uKCchPT0nLCBJZEV4dHJhY3QsIExpdE51bGwpXG5cdFx0Y29uc3QgZXh0cmFjdCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIGxvY2Fscy5tYXAoKF8sIGlkeCkgPT5cblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoXG5cdFx0XHRcdGlkRm9yRGVjbGFyZUNhY2hlZChfKSxcblx0XHRcdFx0bmV3IE1lbWJlckV4cHJlc3Npb24oSWRFeHRyYWN0LCBuZXcgTGl0ZXJhbChpZHgpKSkpKVxuXHRcdGNvbnN0IHJlcyA9IHQxKHRoaXMucmVzdWx0LCBleHRyYWN0KVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoW2RlY2wsIG5ldyBJZlN0YXRlbWVudCh0ZXN0LCByZXMsIGFsdGVybmF0ZSldKVxuXHR9IGVsc2Vcblx0XHQvLyBhbHRlcm5hdGUgd3JpdHRlbiB0byBieSBgY2FzZUJvZHlgLlxuXHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQodDAodGhpcy50ZXN0KSwgdDAodGhpcy5yZXN1bHQpLCBhbHRlcm5hdGUpXG59XG5cbmZ1bmN0aW9uIHN1cGVyQ2FsbCgpIHtcblx0Y29uc3QgYXJncyA9IHRoaXMuYXJncy5tYXAodDApXG5cdGNvbnN0IG1ldGhvZCA9IHZlcmlmeVJlc3VsdHMuc3VwZXJDYWxsVG9NZXRob2QuZ2V0KHRoaXMpXG5cblx0aWYgKG1ldGhvZCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB7XG5cdFx0Y29uc3QgY2FsbCA9IG5ldyBDYWxsRXhwcmVzc2lvbihJZFN1cGVyLCBhcmdzKVxuXHRcdGNvbnN0IG1lbWJlclNldHMgPSBjb25zdHJ1Y3RvclNldE1lbWJlcnMobWV0aG9kKVxuXHRcdHJldHVybiBjYXQoY2FsbCwgbWVtYmVyU2V0cylcblx0fSBlbHNlXG5cdFx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbihtZW1iZXJTdHJpbmdPclZhbChJZFN1cGVyLCBtZXRob2Quc3ltYm9sKSwgYXJncylcbn1cblxuZnVuY3Rpb24gc3dpdGNoUGFydCgpIHtcblx0Y29uc3QgZm9sbG93ID0gb3BJZih0aGlzIGluc3RhbmNlb2YgU3dpdGNoRG9QYXJ0LCAoKSA9PiBuZXcgQnJlYWtTdGF0ZW1lbnQpXG5cdC8qXG5cdFdlIGNvdWxkIGp1c3QgcGFzcyBibG9jay5ib2R5IGZvciB0aGUgc3dpdGNoIGxpbmVzLCBidXQgaW5zdGVhZFxuXHRlbmNsb3NlIHRoZSBib2R5IG9mIHRoZSBzd2l0Y2ggY2FzZSBpbiBjdXJseSBicmFjZXMgdG8gZW5zdXJlIGEgbmV3IHNjb3BlLlxuXHRUaGF0IHdheSB0aGlzIGNvZGUgd29ya3M6XG5cdFx0c3dpdGNoICgwKSB7XG5cdFx0XHRjYXNlIDA6IHtcblx0XHRcdFx0Y29uc3QgYSA9IDBcblx0XHRcdFx0cmV0dXJuIGFcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0Ly8gV2l0aG91dCBjdXJseSBicmFjZXMgdGhpcyB3b3VsZCBjb25mbGljdCB3aXRoIHRoZSBvdGhlciBgYWAuXG5cdFx0XHRcdGNvbnN0IGEgPSAxXG5cdFx0XHRcdGFcblx0XHRcdH1cblx0XHR9XG5cdCovXG5cdGNvbnN0IGJsb2NrID0gdDModGhpcy5yZXN1bHQsIG51bGwsIG51bGwsIGZvbGxvdylcblx0Ly8gSWYgc3dpdGNoIGhhcyBtdWx0aXBsZSB2YWx1ZXMsIGJ1aWxkIHVwIGEgc3RhdGVtZW50IGxpa2U6IGBjYXNlIDE6IGNhc2UgMjogeyBkb0Jsb2NrKCkgfWBcblx0Y29uc3QgeCA9IFtdXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy52YWx1ZXMubGVuZ3RoIC0gMTsgaSA9IGkgKyAxKVxuXHRcdC8vIFRoZXNlIGNhc2VzIGZhbGx0aHJvdWdoIHRvIHRoZSBvbmUgYXQgdGhlIGVuZC5cblx0XHR4LnB1c2gobmV3IFN3aXRjaENhc2UodDAodGhpcy52YWx1ZXNbaV0pLCBbXSkpXG5cdHgucHVzaChuZXcgU3dpdGNoQ2FzZSh0MCh0aGlzLnZhbHVlc1t0aGlzLnZhbHVlcy5sZW5ndGggLSAxXSksIFtibG9ja10pKVxuXHRyZXR1cm4geFxufVxuXG4vLyBGdW5jdGlvbnMgc3BlY2lmaWMgdG8gY2VydGFpbiBleHByZXNzaW9uc1xuXG4vLyBXcmFwcyBhIGJsb2NrICh3aXRoIGByZXR1cm5gIHN0YXRlbWVudHMgaW4gaXQpIGluIGFuIElJRkUuXG5mdW5jdGlvbiBibG9ja1dyYXAoYmxvY2spIHtcblx0Y29uc3QgaW52b2tlID0gbmV3IENhbGxFeHByZXNzaW9uKGZ1bmN0aW9uRXhwcmVzc2lvblRodW5rKGJsb2NrLCBpc0luR2VuZXJhdG9yKSwgW10pXG5cdHJldHVybiBpc0luR2VuZXJhdG9yID8gbmV3IFlpZWxkRXhwcmVzc2lvbihpbnZva2UsIHRydWUpIDogaW52b2tlXG59XG5cbmZ1bmN0aW9uIGNhc2VCb2R5KHBhcnRzLCBvcEVsc2UpIHtcblx0bGV0IGFjYyA9IGlmRWxzZShvcEVsc2UsIHQwLCAoKSA9PiBUaHJvd05vQ2FzZU1hdGNoKVxuXHRmb3IgKGxldCBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpID0gaSAtIDEpXG5cdFx0YWNjID0gdDEocGFydHNbaV0sIGFjYylcblx0cmV0dXJuIGFjY1xufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RvclNldE1lbWJlcnMoY29uc3RydWN0b3IpIHtcblx0cmV0dXJuIGNvbnN0cnVjdG9yLm1lbWJlckFyZ3MubWFwKF8gPT5cblx0XHRtc05ld1Byb3BlcnR5KG5ldyBUaGlzRXhwcmVzc2lvbigpLCBuZXcgTGl0ZXJhbChfLm5hbWUpLCBpZEZvckRlY2xhcmVDYWNoZWQoXykpKVxufVxuXG5mdW5jdGlvbiBmb3JMb29wKG9wSXRlcmF0ZWUsIGJsb2NrKSB7XG5cdHJldHVybiBpZkVsc2Uob3BJdGVyYXRlZSxcblx0XHQoe2VsZW1lbnQsIGJhZ30pID0+IHtcblx0XHRcdGNvbnN0IGRlY2xhcmUgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignbGV0Jyxcblx0XHRcdFx0W25ldyBWYXJpYWJsZURlY2xhcmF0b3IodDAoZWxlbWVudCkpXSlcblx0XHRcdHJldHVybiBuZXcgRm9yT2ZTdGF0ZW1lbnQoZGVjbGFyZSwgdDAoYmFnKSwgdDAoYmxvY2spKVxuXHRcdH0sXG5cdFx0KCkgPT4gbmV3IEZvclN0YXRlbWVudChudWxsLCBudWxsLCBudWxsLCB0MChibG9jaykpKVxufVxuXG5mdW5jdGlvbiBtZXRob2RLZXlDb21wdXRlZChzeW1ib2wpIHtcblx0aWYgKHR5cGVvZiBzeW1ib2wgPT09ICdzdHJpbmcnKVxuXHRcdHJldHVybiB7a2V5OiBwcm9wZXJ0eUlkT3JMaXRlcmFsKHN5bWJvbCksIGNvbXB1dGVkOiBmYWxzZX1cblx0ZWxzZSB7XG5cdFx0Y29uc3Qga2V5ID0gc3ltYm9sIGluc3RhbmNlb2YgUXVvdGUgPyB0MChzeW1ib2wpIDogbXNTeW1ib2wodDAoc3ltYm9sKSlcblx0XHRyZXR1cm4ge2tleSwgY29tcHV0ZWQ6IHRydWV9XG5cdH1cbn1cblxuZnVuY3Rpb24gdHJhbnNwaWxlQmxvY2socmV0dXJuZWQsIGxpbmVzLCBsZWFkLCBvcFJldHVyblR5cGUpIHtcblx0Y29uc3QgZmluID0gbmV3IFJldHVyblN0YXRlbWVudChcblx0XHRtYXliZVdyYXBJbkNoZWNrQ29udGFpbnMocmV0dXJuZWQsIG9wUmV0dXJuVHlwZSwgJ3JldHVybmVkIHZhbHVlJykpXG5cdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIGxpbmVzLCBmaW4pKVxufVxuXG5mdW5jdGlvbiB0cmFuc3BpbGVFeGNlcHQoZXhjZXB0KSB7XG5cdHJldHVybiBuZXcgVHJ5U3RhdGVtZW50KFxuXHRcdHQwKGV4Y2VwdC50cnkpLFxuXHRcdG9wTWFwKGV4Y2VwdC5jYXRjaCwgdDApLFxuXHRcdG9wTWFwKGV4Y2VwdC5maW5hbGx5LCB0MCkpXG59XG5cbmZ1bmN0aW9uIHRyYW5zcGlsZVN3aXRjaChfKSB7XG5cdGNvbnN0IHBhcnRzID0gZmxhdE1hcChfLnBhcnRzLCB0MClcblx0cGFydHMucHVzaChpZkVsc2UoXy5vcEVsc2UsXG5cdFx0XyA9PiBuZXcgU3dpdGNoQ2FzZSh1bmRlZmluZWQsIHQwKF8pLmJvZHkpLFxuXHRcdCgpID0+IFN3aXRjaENhc2VOb01hdGNoKSlcblx0cmV0dXJuIG5ldyBTd2l0Y2hTdGF0ZW1lbnQodDAoXy5zd2l0Y2hlZCksIHBhcnRzKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMoYXNzaWduZWVzLCBpc0xhenksIHZhbHVlLCBpc01vZHVsZSkge1xuXHRjb25zdCBkZXN0cnVjdHVyZWROYW1lID0gYF8kJHtuZXh0RGVzdHJ1Y3R1cmVkSWR9YFxuXHRuZXh0RGVzdHJ1Y3R1cmVkSWQgPSBuZXh0RGVzdHJ1Y3R1cmVkSWQgKyAxXG5cdGNvbnN0IGlkRGVzdHJ1Y3R1cmVkID0gbmV3IElkZW50aWZpZXIoZGVzdHJ1Y3R1cmVkTmFtZSlcblx0Y29uc3QgZGVjbGFyYXRvcnMgPSBhc3NpZ25lZXMubWFwKGFzc2lnbmVlID0+IHtcblx0XHQvLyBUT0RPOiBEb24ndCBjb21waWxlIGl0IGlmIGl0J3MgbmV2ZXIgYWNjZXNzZWRcblx0XHRjb25zdCBnZXQgPSBnZXRNZW1iZXIoaWREZXN0cnVjdHVyZWQsIGFzc2lnbmVlLm5hbWUsIGlzTGF6eSwgaXNNb2R1bGUpXG5cdFx0cmV0dXJuIG1ha2VEZWNsYXJhdG9yKGFzc2lnbmVlLCBnZXQsIGlzTGF6eSlcblx0fSlcblx0Ly8gR2V0dGluZyBsYXp5IG1vZHVsZSBpcyBkb25lIGJ5IG1zLmxhenlHZXRNb2R1bGUuXG5cdGNvbnN0IHZhbCA9IGlzTGF6eSAmJiAhaXNNb2R1bGUgPyBsYXp5V3JhcCh2YWx1ZSkgOiB2YWx1ZVxuXHRyZXR1cm4gY2F0KG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoaWREZXN0cnVjdHVyZWQsIHZhbCksIGRlY2xhcmF0b3JzKVxufVxuIl19
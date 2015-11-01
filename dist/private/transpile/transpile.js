'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/util', '../context', '../MsAst', '../util', './ast-constants', './transpileModule', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('esast/dist/util'), require('../context'), require('../MsAst'), require('../util'), require('./ast-constants'), require('./transpileModule'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.context, global.MsAst, global.util, global.astConstants, global.transpileModule, global.util);
		global.transpile = mod.exports;
	}
})(this, function (exports, _ast, _util, _context, _MsAst, _util2, _astConstants, _transpileModule, _util3) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.verifyResults = undefined;
	exports.default = transpile;
	exports.makeDestructureDeclarators = makeDestructureDeclarators;

	var MsAstTypes = _interopRequireWildcard(_MsAst);

	var _transpileModule2 = _interopRequireDefault(_transpileModule);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	let verifyResults = exports.verifyResults = undefined;
	let isInGenerator, isInConstructor;
	let nextDestructuredId;

	function transpile(moduleExpression, _verifyResults) {
		exports.verifyResults = verifyResults = _verifyResults;
		isInGenerator = false;
		isInConstructor = false;
		nextDestructuredId = 0;
		const res = (0, _util3.t0)(moduleExpression);
		exports.verifyResults = verifyResults = null;
		return res;
	}

	(0, _util2.implementMany)(MsAstTypes, 'transpile', {
		Assert() {
			const failCond = () => {
				const cond = (0, _util3.t0)(this.condition);
				return this.negate ? cond : new _ast.UnaryExpression('!', cond);
			};

			return (0, _util2.ifElse)(this.opThrown, _ => new _ast.IfStatement(failCond(), (0, _util3.doThrow)(_)), () => {
				if (this.condition instanceof _MsAst.Call) {
					const call = this.condition;
					const called = call.called;
					const args = call.args.map(_util3.t0);

					if (called instanceof _MsAst.Member) {
						const ass = this.negate ? 'assertNotMember' : 'assertMember';
						return (0, _util3.msCall)(ass, (0, _util3.t0)(called.object), new _ast.Literal(called.name), ...args);
					} else {
						const ass = this.negate ? 'assertNot' : 'assert';
						return (0, _util3.msCall)(ass, (0, _util3.t0)(called), ...args);
					}
				} else return new _ast.IfStatement(failCond(), _astConstants.ThrowAssertFail);
			});
		},

		AssignSingle(valWrap) {
			const val = valWrap === undefined ? (0, _util3.t0)(this.value) : valWrap((0, _util3.t0)(this.value));
			const declare = (0, _util3.makeDeclarator)(this.assignee, val, false);
			return new _ast.VariableDeclaration(this.assignee.isMutable() ? 'let' : 'const', [declare]);
		},

		AssignDestructure() {
			return new _ast.VariableDeclaration(this.kind() === _MsAst.LocalDeclares.Mutable ? 'let' : 'const', makeDestructureDeclarators(this.assignees, this.kind() === _MsAst.LocalDeclares.Lazy, (0, _util3.t0)(this.value), false));
		},

		BagEntry() {
			return (0, _util3.msCall)('add', _astConstants.IdBuilt, (0, _util3.t0)(this.value));
		},

		BagEntryMany() {
			return (0, _util3.msCall)('addMany', _astConstants.IdBuilt, (0, _util3.t0)(this.value));
		},

		BagSimple() {
			return new _ast.ArrayExpression(this.parts.map(_util3.t0));
		},

		BlockDo() {
			let lead = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
			let opReturnType = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			let follow = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
			(0, _util2.assert)(opReturnType === null);
			return new _ast.BlockStatement((0, _util2.cat)(lead, (0, _util3.tLines)(this.lines), follow));
		},

		BlockValThrow() {
			let lead = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
			let _opReturnType = arguments[1];
			return new _ast.BlockStatement((0, _util2.cat)(lead, (0, _util3.tLines)(this.lines), (0, _util3.t0)(this.throw)));
		},

		BlockValReturn() {
			let lead = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
			let opReturnType = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			return transpileBlock((0, _util3.t0)(this.returned), (0, _util3.tLines)(this.lines), lead, opReturnType);
		},

		BlockBag() {
			let lead = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
			let opReturnType = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			return transpileBlock(_astConstants.IdBuilt, (0, _util2.cat)(_astConstants.DeclareBuiltBag, (0, _util3.tLines)(this.lines)), lead, opReturnType);
		},

		BlockObj() {
			let lead = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
			let opReturnType = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			return transpileBlock(_astConstants.IdBuilt, (0, _util2.cat)(_astConstants.DeclareBuiltObj, (0, _util3.tLines)(this.lines)), lead, opReturnType);
		},

		BlockMap() {
			let lead = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
			let opReturnType = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			return transpileBlock(_astConstants.IdBuilt, (0, _util2.cat)(_astConstants.DeclareBuiltMap, (0, _util3.tLines)(this.lines)), lead, opReturnType);
		},

		BlockWrap() {
			return blockWrap((0, _util3.t0)(this.block));
		},

		Break() {
			return new _ast.BreakStatement();
		},

		BreakWithVal() {
			return new _ast.ReturnStatement((0, _util3.t0)(this.value));
		},

		Call() {
			return new _ast.CallExpression((0, _util3.t0)(this.called), this.args.map(_util3.t0));
		},

		CaseDo() {
			const body = caseBody(this.parts, this.opElse);
			return (0, _util2.ifElse)(this.opCased, _ => new _ast.BlockStatement([(0, _util3.t0)(_), body]), () => body);
		},

		CaseVal() {
			const body = caseBody(this.parts, this.opElse);
			const block = (0, _util2.ifElse)(this.opCased, _ => [(0, _util3.t0)(_), body], () => [body]);
			return blockWrap(new _ast.BlockStatement(block));
		},

		CaseDoPart: casePart,
		CaseValPart: casePart,

		Class() {
			const methods = (0, _util2.cat)(this.statics.map(_ => (0, _util3.t1)(_, true)), (0, _util2.opMap)(this.opConstructor, _util3.t0), this.methods.map(_ => (0, _util3.t1)(_, false)));
			const opName = (0, _util2.opMap)(verifyResults.opName(this), _util.identifier);
			const classExpr = new _ast.ClassExpression(opName, (0, _util2.opMap)(this.opSuperClass, _util3.t0), new _ast.ClassBody(methods));
			return (0, _util2.ifElse)(this.opDo, _ => (0, _util3.t1)(_, classExpr), () => classExpr);
		},

		ClassDo(classExpr) {
			const lead = new _ast.VariableDeclaration('const', [new _ast.VariableDeclarator((0, _util3.t0)(this.declareFocus), classExpr)]);
			const ret = new _ast.ReturnStatement((0, _util3.t0)(this.declareFocus));
			const block = (0, _util3.t3)(this.block, lead, null, ret);
			return blockWrap(block);
		},

		Cond() {
			return new _ast.ConditionalExpression((0, _util3.t0)(this.test), (0, _util3.t0)(this.ifTrue), (0, _util3.t0)(this.ifFalse));
		},

		ConditionalDo() {
			const test = (0, _util3.t0)(this.test);
			return new _ast.IfStatement(this.isUnless ? new _ast.UnaryExpression('!', test) : test, (0, _util3.t0)(this.result));
		},

		ConditionalVal() {
			const test = (0, _util3.t0)(this.test);
			const result = (0, _util3.msCall)('some', blockWrap((0, _util3.t0)(this.result)));
			return this.isUnless ? new _ast.ConditionalExpression(test, (0, _util3.msMember)('None'), result) : new _ast.ConditionalExpression(test, result, (0, _util3.msMember)('None'));
		},

		Constructor() {
			isInConstructor = true;
			const body = verifyResults.constructorToSuper.has(this) ? (0, _util3.t0)(this.fun) : (0, _util3.t1)(this.fun, constructorSetMembers(this));

			const res = _ast.MethodDefinition.constructor(body);

			isInConstructor = false;
			return res;
		},

		Catch() {
			return new _ast.CatchClause((0, _util3.t0)(this.caught), (0, _util3.t0)(this.block));
		},

		ExceptDo() {
			return transpileExcept(this);
		},

		ExceptVal() {
			return blockWrap(new _ast.BlockStatement([transpileExcept(this)]));
		},

		ForDo() {
			return forLoop(this.opIteratee, this.block);
		},

		ForBag() {
			return blockWrap(new _ast.BlockStatement([_astConstants.DeclareBuiltBag, forLoop(this.opIteratee, this.block), _astConstants.ReturnBuilt]));
		},

		ForVal() {
			return blockWrap(new _ast.BlockStatement([forLoop(this.opIteratee, this.block)]));
		},

		Fun() {
			let leadStatements = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
			const isGeneratorFun = this.kind !== _MsAst.Funs.Plain;
			const oldInGenerator = isInGenerator;
			isInGenerator = isGeneratorFun;
			const nArgs = new _ast.Literal(this.args.length);
			const opDeclareRest = (0, _util2.opMap)(this.opRestArg, rest => (0, _util3.declare)(rest, new _ast.CallExpression(_astConstants.ArraySliceCall, [_astConstants.IdArguments, nArgs])));
			const argChecks = (0, _util2.opIf)(_context.options.includeChecks(), () => (0, _util2.flatOpMap)(this.args, _util3.opTypeCheckForLocalDeclare));
			const opDeclareThis = (0, _util2.opIf)(!isInConstructor && this.opDeclareThis != null, () => _astConstants.DeclareLexicalThis);
			const lead = (0, _util2.cat)(leadStatements, opDeclareThis, opDeclareRest, argChecks);

			const body = () => (0, _util3.t2)(this.block, lead, this.opReturnType);

			const args = this.args.map(_util3.t0);
			const id = (0, _util2.opMap)(verifyResults.opName(this), _util.identifier);

			try {
				switch (this.kind) {
					case _MsAst.Funs.Plain:
						if (id === null && this.opDeclareThis === null && opDeclareRest === null) return new _ast.ArrowFunctionExpression(args, body());else return new _ast.FunctionExpression(id, args, body());

					case _MsAst.Funs.Async:
						{
							const plainBody = (0, _util3.t2)(this.block, null, this.opReturnType);
							const genFunc = new _ast.FunctionExpression(id, [], plainBody, true);
							const ret = new _ast.ReturnStatement((0, _util3.msCall)('async', genFunc));
							return new _ast.FunctionExpression(id, args, new _ast.BlockStatement((0, _util2.cat)(lead, ret)));
						}

					case _MsAst.Funs.Generator:
						return new _ast.FunctionExpression(id, args, body(), true);

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
			return (0, _util3.lazyWrap)((0, _util3.t0)(this.value));
		},

		MethodImpl(isStatic) {
			const value = (0, _util3.t0)(this.fun);
			(0, _util2.assert)(value.id == null);
			(0, _util2.assert)(value instanceof _ast.FunctionExpression);

			var _methodKeyComputed = methodKeyComputed(this.symbol);

			const key = _methodKeyComputed.key;
			const computed = _methodKeyComputed.computed;
			return new _ast.MethodDefinition(key, value, 'method', isStatic, computed);
		},

		MethodGetter(isStatic) {
			const value = new _ast.FunctionExpression(null, [], (0, _util3.t1)(this.block, _astConstants.DeclareLexicalThis));

			var _methodKeyComputed2 = methodKeyComputed(this.symbol);

			const key = _methodKeyComputed2.key;
			const computed = _methodKeyComputed2.computed;
			return new _ast.MethodDefinition(key, value, 'get', isStatic, computed);
		},

		MethodSetter(isStatic) {
			const value = new _ast.FunctionExpression(null, [_astConstants.IdFocus], (0, _util3.t1)(this.block, _astConstants.DeclareLexicalThis));

			var _methodKeyComputed3 = methodKeyComputed(this.symbol);

			const key = _methodKeyComputed3.key;
			const computed = _methodKeyComputed3.computed;
			return new _ast.MethodDefinition(key, value, 'set', isStatic, computed);
		},

		NumberLiteral() {
			const value = Number(this.value);
			const lit = new _ast.Literal(Math.abs(value));
			const isPositive = value >= 0 && 1 / value !== -Infinity;
			return isPositive ? lit : new _ast.UnaryExpression('-', lit);
		},

		LocalAccess() {
			if (this.name === 'this') return isInConstructor ? new _ast.ThisExpression() : _astConstants.IdLexicalThis;else {
				const ld = verifyResults.localDeclareForAccess(this);
				return ld === undefined ? (0, _util.identifier)(this.name) : (0, _util3.accessLocalDeclare)(ld);
			}
		},

		LocalDeclare() {
			return new _ast.Identifier((0, _util3.idForDeclareCached)(this).name);
		},

		LocalMutate() {
			return new _ast.AssignmentExpression('=', (0, _util.identifier)(this.name), (0, _util3.t0)(this.value));
		},

		Logic() {
			const op = this.kind === _MsAst.Logics.And ? '&&' : '||';
			return (0, _util2.tail)(this.args).reduce((a, b) => new _ast.LogicalExpression(op, a, (0, _util3.t0)(b)), (0, _util3.t0)(this.args[0]));
		},

		MapEntry() {
			return (0, _util3.msCall)('setSub', _astConstants.IdBuilt, (0, _util3.t0)(this.key), (0, _util3.t0)(this.val));
		},

		Member() {
			return (0, _util3.memberStringOrVal)((0, _util3.t0)(this.object), this.name);
		},

		MemberFun() {
			const name = typeof this.name === 'string' ? new _ast.Literal(this.name) : (0, _util3.t0)(this.name);
			return (0, _util2.ifElse)(this.opObject, _ => (0, _util3.msCall)('methodBound', (0, _util3.t0)(_), name), () => (0, _util3.msCall)('methodUnbound', name));
		},

		MemberSet() {
			const obj = (0, _util3.t0)(this.object);

			const name = () => typeof this.name === 'string' ? new _ast.Literal(this.name) : (0, _util3.t0)(this.name);

			const val = (0, _util3.maybeWrapInCheckContains)((0, _util3.t0)(this.value), this.opType, this.name);

			switch (this.kind) {
				case _MsAst.Setters.Init:
					return (0, _util3.msCall)('newProperty', obj, name(), val);

				case _MsAst.Setters.InitMutable:
					return (0, _util3.msCall)('newMutableProperty', obj, name(), val);

				case _MsAst.Setters.Mutate:
					return new _ast.AssignmentExpression('=', (0, _util3.memberStringOrVal)(obj, this.name), val);

				default:
					throw new Error();
			}
		},

		Module: _transpileModule2.default,

		ModuleExportNamed() {
			return (0, _util3.t1)(this.assign, val => new _ast.AssignmentExpression('=', (0, _util.member)(_astConstants.IdExports, this.assign.assignee.name), val));
		},

		ModuleExportDefault() {
			return (0, _util3.t1)(this.assign, val => new _ast.AssignmentExpression('=', _astConstants.ExportsDefault, val));
		},

		New() {
			return new _ast.NewExpression((0, _util3.t0)(this.type), this.args.map(_util3.t0));
		},

		Not() {
			return new _ast.UnaryExpression('!', (0, _util3.t0)(this.arg));
		},

		ObjEntryAssign() {
			return this.assign instanceof _MsAst.AssignSingle && !this.assign.assignee.isLazy() ? (0, _util3.t1)(this.assign, val => new _ast.AssignmentExpression('=', (0, _util.member)(_astConstants.IdBuilt, this.assign.assignee.name), val)) : (0, _util2.cat)((0, _util3.t0)(this.assign), this.assign.allAssignees().map(_ => (0, _util3.msCall)('setLazy', _astConstants.IdBuilt, new _ast.Literal(_.name), (0, _util3.idForDeclareCached)(_))));
		},

		ObjEntryPlain() {
			return new _ast.AssignmentExpression('=', (0, _util3.memberStringOrVal)(_astConstants.IdBuilt, this.name), (0, _util3.t0)(this.value));
		},

		ObjSimple() {
			return new _ast.ObjectExpression(this.pairs.map(pair => new _ast.Property('init', (0, _util.propertyIdOrLiteral)(pair.key), (0, _util3.t0)(pair.value))));
		},

		GetterFun() {
			return new _ast.ArrowFunctionExpression([_astConstants.IdFocus], (0, _util3.memberStringOrVal)(_astConstants.IdFocus, this.name));
		},

		QuotePlain() {
			if (this.parts.length === 0) return _astConstants.LitEmptyString;else {
				const quasis = [],
				      expressions = [];
				if (typeof this.parts[0] !== 'string') quasis.push(_ast.TemplateElement.empty);

				for (let part of this.parts) if (typeof part === 'string') quasis.push(_ast.TemplateElement.forRawString(part));else {
					if (quasis.length === expressions.length) quasis.push(_ast.TemplateElement.empty);
					expressions.push((0, _util3.t0)(part));
				}

				if (quasis.length === expressions.length) quasis.push(_ast.TemplateElement.empty);
				return new _ast.TemplateLiteral(quasis, expressions);
			}
		},

		QuoteSimple() {
			return new _ast.Literal(this.name);
		},

		QuoteTaggedTemplate() {
			return new _ast.TaggedTemplateExpression((0, _util3.t0)(this.tag), (0, _util3.t0)(this.quote));
		},

		Range() {
			const end = (0, _util2.ifElse)(this.end, _util3.t0, () => _astConstants.GlobalInfinity);
			return (0, _util3.msCall)('range', (0, _util3.t0)(this.start), end, new _ast.Literal(this.isExclusive));
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
			return (0, _util3.msCall)('setSub', (0, _util3.t0)(this.object), this.subbeds.length === 1 ? (0, _util3.t0)(this.subbeds[0]) : this.subbeds.map(_util3.t0), (0, _util3.maybeWrapInCheckContains)((0, _util3.t0)(this.value), this.opType, 'value'), new _ast.Literal(kind));
		},

		SpecialDo() {
			switch (this.kind) {
				case _MsAst.SpecialDos.Debugger:
					return new _ast.DebuggerStatement();

				default:
					throw new Error(this.kind);
			}
		},

		SpecialVal() {
			switch (this.kind) {
				case _MsAst.SpecialVals.Contains:
					return (0, _util3.msMember)('contains');

				case _MsAst.SpecialVals.DelSub:
					return (0, _util3.msMember)('delSub');

				case _MsAst.SpecialVals.False:
					return new _ast.Literal(false);

				case _MsAst.SpecialVals.Name:
					return new _ast.Literal(verifyResults.name(this));

				case _MsAst.SpecialVals.Null:
					return new _ast.Literal(null);

				case _MsAst.SpecialVals.SetSub:
					return (0, _util3.msMember)('setSub');

				case _MsAst.SpecialVals.Sub:
					return (0, _util3.msMember)('sub');

				case _MsAst.SpecialVals.True:
					return new _ast.Literal(true);

				case _MsAst.SpecialVals.Undefined:
					return new _ast.UnaryExpression('void', _astConstants.LitZero);

				default:
					throw new Error(this.kind);
			}
		},

		Spread() {
			return new _ast.SpreadElement((0, _util3.t0)(this.spreaded));
		},

		SuperCall: superCall,
		SuperCallDo: superCall,

		SuperMember() {
			return (0, _util3.memberStringOrVal)(_astConstants.IdSuper, this.name);
		},

		SwitchDo() {
			return transpileSwitch(this);
		},

		SwitchVal() {
			return blockWrap(new _ast.BlockStatement([transpileSwitch(this)]));
		},

		SwitchDoPart: switchPart,
		SwitchValPart: switchPart,

		Throw() {
			return (0, _util2.ifElse)(this.opThrown, _ => (0, _util3.doThrow)(_), () => new _ast.ThrowStatement(new _ast.NewExpression(_astConstants.GlobalError, [_astConstants.LitStrThrow])));
		},

		With() {
			const idDeclare = (0, _util3.idForDeclareCached)(this.declare);
			const block = (0, _util3.t3)(this.block, null, null, new _ast.ReturnStatement(idDeclare));
			const fun = isInGenerator ? new _ast.FunctionExpression(null, [idDeclare], block, true) : new _ast.ArrowFunctionExpression([idDeclare], block);
			const call = new _ast.CallExpression(fun, [(0, _util3.t0)(this.value)]);
			return isInGenerator ? new _ast.YieldExpression(call, true) : call;
		},

		Yield() {
			return new _ast.YieldExpression((0, _util2.opMap)(this.opYielded, _util3.t0), false);
		},

		YieldTo() {
			return new _ast.YieldExpression((0, _util3.t0)(this.yieldedTo), true);
		}

	});

	function casePart(alternate) {
		if (this.test instanceof _MsAst.Pattern) {
			var _test = this.test;
			const type = _test.type;
			const patterned = _test.patterned;
			const locals = _test.locals;
			const decl = new _ast.VariableDeclaration('const', [new _ast.VariableDeclarator(_astConstants.IdExtract, (0, _util3.msCall)('extract', (0, _util3.t0)(type), (0, _util3.t0)(patterned)))]);
			const test = new _ast.BinaryExpression('!==', _astConstants.IdExtract, _astConstants.LitNull);
			const extract = new _ast.VariableDeclaration('const', locals.map((_, idx) => new _ast.VariableDeclarator((0, _util3.idForDeclareCached)(_), new _ast.MemberExpression(_astConstants.IdExtract, new _ast.Literal(idx)))));
			const res = (0, _util3.t1)(this.result, extract);
			return new _ast.BlockStatement([decl, new _ast.IfStatement(test, res, alternate)]);
		} else return new _ast.IfStatement((0, _util3.t0)(this.test), (0, _util3.t0)(this.result), alternate);
	}

	function superCall() {
		const args = this.args.map(_util3.t0);
		const method = verifyResults.superCallToMethod.get(this);

		if (method instanceof _MsAst.Constructor) {
			const call = new _ast.CallExpression(_astConstants.IdSuper, args);
			const memberSets = constructorSetMembers(method);
			return (0, _util2.cat)(call, memberSets);
		} else return new _ast.CallExpression((0, _util3.memberStringOrVal)(_astConstants.IdSuper, method.symbol), args);
	}

	function switchPart() {
		const follow = (0, _util2.opIf)(this instanceof _MsAst.SwitchDoPart, () => new _ast.BreakStatement());
		const block = (0, _util3.t3)(this.result, null, null, follow);
		const x = [];

		for (let i = 0; i < this.values.length - 1; i = i + 1) x.push(new _ast.SwitchCase((0, _util3.t0)(this.values[i]), []));

		x.push(new _ast.SwitchCase((0, _util3.t0)(this.values[this.values.length - 1]), [block]));
		return x;
	}

	function blockWrap(block) {
		const invoke = new _ast.CallExpression((0, _util.functionExpressionThunk)(block, isInGenerator), []);
		return isInGenerator ? new _ast.YieldExpression(invoke, true) : invoke;
	}

	function caseBody(parts, opElse) {
		let acc = (0, _util2.ifElse)(opElse, _util3.t0, () => _astConstants.ThrowNoCaseMatch);

		for (let i = parts.length - 1; i >= 0; i = i - 1) acc = (0, _util3.t1)(parts[i], acc);

		return acc;
	}

	function constructorSetMembers(constructor) {
		return constructor.memberArgs.map(_ => (0, _util3.msCall)('newProperty', new _ast.ThisExpression(), new _ast.Literal(_.name), (0, _util3.idForDeclareCached)(_)));
	}

	function forLoop(opIteratee, block) {
		return (0, _util2.ifElse)(opIteratee, _ref => {
			let element = _ref.element;
			let bag = _ref.bag;
			const declare = new _ast.VariableDeclaration('let', [new _ast.VariableDeclarator((0, _util3.t0)(element))]);
			return new _ast.ForOfStatement(declare, (0, _util3.t0)(bag), (0, _util3.t0)(block));
		}, () => new _ast.ForStatement(null, null, null, (0, _util3.t0)(block)));
	}

	function methodKeyComputed(symbol) {
		if (typeof symbol === 'string') return {
			key: (0, _util.propertyIdOrLiteral)(symbol),
			computed: false
		};else {
			const key = symbol instanceof _MsAst.QuoteAbstract ? (0, _util3.t0)(symbol) : (0, _util3.msCall)('symbol', (0, _util3.t0)(symbol));
			return {
				key,
				computed: true
			};
		}
	}

	function transpileBlock(returned, lines, lead, opReturnType) {
		const fin = new _ast.ReturnStatement((0, _util3.maybeWrapInCheckContains)(returned, opReturnType, 'returned value'));
		return new _ast.BlockStatement((0, _util2.cat)(lead, lines, fin));
	}

	function transpileExcept(except) {
		return new _ast.TryStatement((0, _util3.t0)(except.try), (0, _util2.opMap)(except.catch, _util3.t0), (0, _util2.opMap)(except.finally, _util3.t0));
	}

	function transpileSwitch(_) {
		const parts = (0, _util2.flatMap)(_.parts, _util3.t0);
		parts.push((0, _util2.ifElse)(_.opElse, _ => new _ast.SwitchCase(undefined, (0, _util3.t0)(_).body), () => _astConstants.SwitchCaseNoMatch));
		return new _ast.SwitchStatement((0, _util3.t0)(_.switched), parts);
	}

	function makeDestructureDeclarators(assignees, isLazy, value, isModule) {
		const destructuredName = `_$${ nextDestructuredId }`;
		nextDestructuredId = nextDestructuredId + 1;
		const idDestructured = new _ast.Identifier(destructuredName);
		const declarators = assignees.map(assignee => {
			const get = (0, _util3.getMember)(idDestructured, assignee.name, isLazy, isModule);
			return (0, _util3.makeDeclarator)(assignee, get, isLazy);
		});
		const val = isLazy && !isModule ? (0, _util3.lazyWrap)(value) : value;
		return (0, _util2.cat)(new _ast.VariableDeclarator(idDestructured, val), declarators);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkE2QndCLFNBQVM7U0E4bUJqQiwwQkFBMEIsR0FBMUIsMEJBQTBCOzs7Ozs7Ozs7O0tBcG5CL0IsYUFBYSxXQUFiLGFBQWE7Ozs7VUFNQSxTQUFTO1VBTnRCLGFBQWEsR0FPdkIsYUFBYSxHQUFHLGNBQWM7Ozs7O1VBUHBCLGFBQWEsR0FhdkIsYUFBYSxHQUFHLElBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQW9EWixJQUFJLHlEQUFDLElBQUk7T0FBRSxZQUFZLHlEQUFDLElBQUk7T0FBRSxNQUFNLHlEQUFDLElBQUk7Ozs7OztPQUtuQyxJQUFJLHlEQUFDLElBQUk7T0FBRSxhQUFhOzs7OztPQUl2QixJQUFJLHlEQUFDLElBQUk7T0FBRSxZQUFZLHlEQUFDLElBQUk7Ozs7O09BSWxDLElBQUkseURBQUMsSUFBSTtPQUFFLFlBQVkseURBQUMsSUFBSTs7Ozs7T0FPNUIsSUFBSSx5REFBQyxJQUFJO09BQUUsWUFBWSx5REFBQyxJQUFJOzs7OztPQU81QixJQUFJLHlEQUFDLElBQUk7T0FBRSxZQUFZLHlEQUFDLElBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BK0dqQyxjQUFjLHlEQUFDLElBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUF5YVIsMEJBQTBCIiwiZmlsZSI6InRyYW5zcGlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXJyYXlFeHByZXNzaW9uLCBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbiwgQXNzaWdubWVudEV4cHJlc3Npb24sIEJpbmFyeUV4cHJlc3Npb24sXG5cdEJsb2NrU3RhdGVtZW50LCBCcmVha1N0YXRlbWVudCwgQ2FsbEV4cHJlc3Npb24sIENhdGNoQ2xhdXNlLCBDbGFzc0JvZHksIENsYXNzRXhwcmVzc2lvbixcblx0Q29uZGl0aW9uYWxFeHByZXNzaW9uLCBEZWJ1Z2dlclN0YXRlbWVudCwgRm9yT2ZTdGF0ZW1lbnQsIEZvclN0YXRlbWVudCwgRnVuY3Rpb25FeHByZXNzaW9uLFxuXHRJZGVudGlmaWVyLCBJZlN0YXRlbWVudCwgTGl0ZXJhbCwgTG9naWNhbEV4cHJlc3Npb24sIE1lbWJlckV4cHJlc3Npb24sIE1ldGhvZERlZmluaXRpb24sXG5cdE5ld0V4cHJlc3Npb24sIE9iamVjdEV4cHJlc3Npb24sIFByb3BlcnR5LCBSZXR1cm5TdGF0ZW1lbnQsIFNwcmVhZEVsZW1lbnQsIFN3aXRjaENhc2UsXG5cdFN3aXRjaFN0YXRlbWVudCwgVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uLCBUZW1wbGF0ZUVsZW1lbnQsIFRlbXBsYXRlTGl0ZXJhbCwgVGhpc0V4cHJlc3Npb24sXG5cdFRocm93U3RhdGVtZW50LCBUcnlTdGF0ZW1lbnQsIFZhcmlhYmxlRGVjbGFyYXRpb24sIFVuYXJ5RXhwcmVzc2lvbiwgVmFyaWFibGVEZWNsYXJhdG9yLFxuXHRZaWVsZEV4cHJlc3Npb259IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IHtmdW5jdGlvbkV4cHJlc3Npb25UaHVuaywgaWRlbnRpZmllciwgbWVtYmVyLCBwcm9wZXJ0eUlkT3JMaXRlcmFsfSBmcm9tICdlc2FzdC9kaXN0L3V0aWwnXG5pbXBvcnQge29wdGlvbnN9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtBc3NpZ25TaW5nbGUsIENhbGwsIENvbnN0cnVjdG9yLCBGdW5zLCBMb2dpY3MsIE1lbWJlciwgTG9jYWxEZWNsYXJlcywgUGF0dGVybiwgU2V0dGVycyxcblx0U3BlY2lhbERvcywgU3BlY2lhbFZhbHMsIFN3aXRjaERvUGFydCwgUXVvdGVBYnN0cmFjdH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2Fzc2VydCwgY2F0LCBmbGF0TWFwLCBmbGF0T3BNYXAsIGlmRWxzZSwgaW1wbGVtZW50TWFueSwgb3BJZiwgb3BNYXAsIHRhaWx9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0FycmF5U2xpY2VDYWxsLCBEZWNsYXJlQnVpbHRCYWcsIERlY2xhcmVCdWlsdE1hcCwgRGVjbGFyZUJ1aWx0T2JqLCBEZWNsYXJlTGV4aWNhbFRoaXMsXG5cdEV4cG9ydHNEZWZhdWx0LCBJZEFyZ3VtZW50cywgSWRCdWlsdCwgSWRFeHBvcnRzLCBJZEV4dHJhY3QsIElkRm9jdXMsIElkTGV4aWNhbFRoaXMsIElkU3VwZXIsXG5cdEdsb2JhbEVycm9yLCBHbG9iYWxJbmZpbml0eSwgTGl0RW1wdHlTdHJpbmcsIExpdE51bGwsIExpdFN0clRocm93LCBMaXRaZXJvLCBSZXR1cm5CdWlsdCxcblx0U3dpdGNoQ2FzZU5vTWF0Y2gsIFRocm93QXNzZXJ0RmFpbCwgVGhyb3dOb0Nhc2VNYXRjaH0gZnJvbSAnLi9hc3QtY29uc3RhbnRzJ1xuaW1wb3J0IHRyYW5zcGlsZU1vZHVsZSBmcm9tICcuL3RyYW5zcGlsZU1vZHVsZSdcbmltcG9ydCB7YWNjZXNzTG9jYWxEZWNsYXJlLCBkZWNsYXJlLCBkb1Rocm93LCBnZXRNZW1iZXIsIGlkRm9yRGVjbGFyZUNhY2hlZCwgbGF6eVdyYXAsXG5cdG1ha2VEZWNsYXJhdG9yLCBtYXliZVdyYXBJbkNoZWNrQ29udGFpbnMsIG1lbWJlclN0cmluZ09yVmFsLCBtc0NhbGwsIG1zTWVtYmVyLCBvcFR5cGVDaGVja0ZvckxvY2FsRGVjbGFyZSwgdDAsXG5cdHQxLCB0MiwgdDMsIHRMaW5lc30gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgbGV0IHZlcmlmeVJlc3VsdHNcbi8vIGlzSW5HZW5lcmF0b3IgbWVhbnMgd2UgYXJlIGluIGFuIGFzeW5jIG9yIGdlbmVyYXRvciBmdW5jdGlvbi5cbmxldCBpc0luR2VuZXJhdG9yLCBpc0luQ29uc3RydWN0b3JcbmxldCBuZXh0RGVzdHJ1Y3R1cmVkSWRcblxuLyoqIFRyYW5zZm9ybSBhIHtAbGluayBNc0FzdH0gaW50byBhbiBlc2FzdC4gKiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFuc3BpbGUobW9kdWxlRXhwcmVzc2lvbiwgX3ZlcmlmeVJlc3VsdHMpIHtcblx0dmVyaWZ5UmVzdWx0cyA9IF92ZXJpZnlSZXN1bHRzXG5cdGlzSW5HZW5lcmF0b3IgPSBmYWxzZVxuXHRpc0luQ29uc3RydWN0b3IgPSBmYWxzZVxuXHRuZXh0RGVzdHJ1Y3R1cmVkSWQgPSAwXG5cdGNvbnN0IHJlcyA9IHQwKG1vZHVsZUV4cHJlc3Npb24pXG5cdC8vIFJlbGVhc2UgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cblx0dmVyaWZ5UmVzdWx0cyA9IG51bGxcblx0cmV0dXJuIHJlc1xufVxuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICd0cmFuc3BpbGUnLCB7XG5cdEFzc2VydCgpIHtcblx0XHRjb25zdCBmYWlsQ29uZCA9ICgpID0+IHtcblx0XHRcdGNvbnN0IGNvbmQgPSB0MCh0aGlzLmNvbmRpdGlvbilcblx0XHRcdHJldHVybiB0aGlzLm5lZ2F0ZSA/IGNvbmQgOiBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgY29uZClcblx0XHR9XG5cblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BUaHJvd24sXG5cdFx0XHRfID0+IG5ldyBJZlN0YXRlbWVudChmYWlsQ29uZCgpLCBkb1Rocm93KF8pKSxcblx0XHRcdCgpID0+IHtcblx0XHRcdFx0aWYgKHRoaXMuY29uZGl0aW9uIGluc3RhbmNlb2YgQ2FsbCkge1xuXHRcdFx0XHRcdGNvbnN0IGNhbGwgPSB0aGlzLmNvbmRpdGlvblxuXHRcdFx0XHRcdGNvbnN0IGNhbGxlZCA9IGNhbGwuY2FsbGVkXG5cdFx0XHRcdFx0Y29uc3QgYXJncyA9IGNhbGwuYXJncy5tYXAodDApXG5cdFx0XHRcdFx0aWYgKGNhbGxlZCBpbnN0YW5jZW9mIE1lbWJlcikge1xuXHRcdFx0XHRcdFx0Y29uc3QgYXNzID0gdGhpcy5uZWdhdGUgPyAnYXNzZXJ0Tm90TWVtYmVyJyA6ICdhc3NlcnRNZW1iZXInXG5cdFx0XHRcdFx0XHRyZXR1cm4gbXNDYWxsKGFzcywgdDAoY2FsbGVkLm9iamVjdCksIG5ldyBMaXRlcmFsKGNhbGxlZC5uYW1lKSwgLi4uYXJncylcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc3QgYXNzID0gdGhpcy5uZWdhdGUgPyAnYXNzZXJ0Tm90JyA6ICdhc3NlcnQnXG5cdFx0XHRcdFx0XHRyZXR1cm4gbXNDYWxsKGFzcywgdDAoY2FsbGVkKSwgLi4uYXJncylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQoZmFpbENvbmQoKSwgVGhyb3dBc3NlcnRGYWlsKVxuXHRcdFx0fSlcblx0fSxcblxuXHRBc3NpZ25TaW5nbGUodmFsV3JhcCkge1xuXHRcdGNvbnN0IHZhbCA9IHZhbFdyYXAgPT09IHVuZGVmaW5lZCA/IHQwKHRoaXMudmFsdWUpIDogdmFsV3JhcCh0MCh0aGlzLnZhbHVlKSlcblx0XHRjb25zdCBkZWNsYXJlID0gbWFrZURlY2xhcmF0b3IodGhpcy5hc3NpZ25lZSwgdmFsLCBmYWxzZSlcblx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24odGhpcy5hc3NpZ25lZS5pc011dGFibGUoKSA/ICdsZXQnIDogJ2NvbnN0JywgW2RlY2xhcmVdKVxuXHR9LFxuXHQvLyBUT0RPOkVTNiBKdXN0IHVzZSBuYXRpdmUgZGVzdHJ1Y3R1cmluZyBhc3NpZ25cblx0QXNzaWduRGVzdHJ1Y3R1cmUoKSB7XG5cdFx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKFxuXHRcdFx0dGhpcy5raW5kKCkgPT09IExvY2FsRGVjbGFyZXMuTXV0YWJsZSA/ICdsZXQnIDogJ2NvbnN0Jyxcblx0XHRcdG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzKFxuXHRcdFx0XHR0aGlzLmFzc2lnbmVlcyxcblx0XHRcdFx0dGhpcy5raW5kKCkgPT09IExvY2FsRGVjbGFyZXMuTGF6eSxcblx0XHRcdFx0dDAodGhpcy52YWx1ZSksXG5cdFx0XHRcdGZhbHNlKSlcblx0fSxcblxuXHRCYWdFbnRyeSgpIHsgcmV0dXJuIG1zQ2FsbCgnYWRkJywgSWRCdWlsdCwgdDAodGhpcy52YWx1ZSkpIH0sXG5cblx0QmFnRW50cnlNYW55KCkgeyByZXR1cm4gbXNDYWxsKCdhZGRNYW55JywgSWRCdWlsdCwgdDAodGhpcy52YWx1ZSkpIH0sXG5cblx0QmFnU2ltcGxlKCkgeyByZXR1cm4gbmV3IEFycmF5RXhwcmVzc2lvbih0aGlzLnBhcnRzLm1hcCh0MCkpIH0sXG5cblx0QmxvY2tEbyhsZWFkPW51bGwsIG9wUmV0dXJuVHlwZT1udWxsLCBmb2xsb3c9bnVsbCkge1xuXHRcdGFzc2VydChvcFJldHVyblR5cGUgPT09IG51bGwpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgdExpbmVzKHRoaXMubGluZXMpLCBmb2xsb3cpKVxuXHR9LFxuXG5cdEJsb2NrVmFsVGhyb3cobGVhZD1udWxsLCBfb3BSZXR1cm5UeXBlKSB7XG5cdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgdExpbmVzKHRoaXMubGluZXMpLCB0MCh0aGlzLnRocm93KSkpXG5cdH0sXG5cblx0QmxvY2tWYWxSZXR1cm4obGVhZD1udWxsLCBvcFJldHVyblR5cGU9bnVsbCkge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayh0MCh0aGlzLnJldHVybmVkKSwgdExpbmVzKHRoaXMubGluZXMpLCBsZWFkLCBvcFJldHVyblR5cGUpXG5cdH0sXG5cblx0QmxvY2tCYWcobGVhZD1udWxsLCBvcFJldHVyblR5cGU9bnVsbCkge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayhcblx0XHRcdElkQnVpbHQsXG5cdFx0XHRjYXQoRGVjbGFyZUJ1aWx0QmFnLCB0TGluZXModGhpcy5saW5lcykpLFxuXHRcdFx0bGVhZCwgb3BSZXR1cm5UeXBlKVxuXHR9LFxuXG5cdEJsb2NrT2JqKGxlYWQ9bnVsbCwgb3BSZXR1cm5UeXBlPW51bGwpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2soXG5cdFx0XHRJZEJ1aWx0LFxuXHRcdFx0Y2F0KERlY2xhcmVCdWlsdE9iaiwgdExpbmVzKHRoaXMubGluZXMpKSxcblx0XHRcdGxlYWQsIG9wUmV0dXJuVHlwZSlcblx0fSxcblxuXHRCbG9ja01hcChsZWFkPW51bGwsIG9wUmV0dXJuVHlwZT1udWxsKSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKFxuXHRcdFx0SWRCdWlsdCxcblx0XHRcdGNhdChEZWNsYXJlQnVpbHRNYXAsIHRMaW5lcyh0aGlzLmxpbmVzKSksXG5cdFx0XHRsZWFkLCBvcFJldHVyblR5cGUpXG5cdH0sXG5cblx0QmxvY2tXcmFwKCkge1xuXHRcdHJldHVybiBibG9ja1dyYXAodDAodGhpcy5ibG9jaykpXG5cdH0sXG5cblx0QnJlYWsoKSB7XG5cdFx0cmV0dXJuIG5ldyBCcmVha1N0YXRlbWVudCgpXG5cdH0sXG5cblx0QnJlYWtXaXRoVmFsKCkge1xuXHRcdHJldHVybiBuZXcgUmV0dXJuU3RhdGVtZW50KHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdENhbGwoKSB7XG5cdFx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbih0MCh0aGlzLmNhbGxlZCksIHRoaXMuYXJncy5tYXAodDApKVxuXHR9LFxuXG5cdENhc2VEbygpIHtcblx0XHRjb25zdCBib2R5ID0gY2FzZUJvZHkodGhpcy5wYXJ0cywgdGhpcy5vcEVsc2UpXG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wQ2FzZWQsIF8gPT4gbmV3IEJsb2NrU3RhdGVtZW50KFt0MChfKSwgYm9keV0pLCAoKSA9PiBib2R5KVxuXHR9LFxuXHRDYXNlVmFsKCkge1xuXHRcdGNvbnN0IGJvZHkgPSBjYXNlQm9keSh0aGlzLnBhcnRzLCB0aGlzLm9wRWxzZSlcblx0XHRjb25zdCBibG9jayA9IGlmRWxzZSh0aGlzLm9wQ2FzZWQsIF8gPT4gW3QwKF8pLCBib2R5XSwgKCkgPT4gW2JvZHldKVxuXHRcdHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KGJsb2NrKSlcblx0fSxcblx0Q2FzZURvUGFydDogY2FzZVBhcnQsXG5cdENhc2VWYWxQYXJ0OiBjYXNlUGFydCxcblxuXHRDbGFzcygpIHtcblx0XHRjb25zdCBtZXRob2RzID0gY2F0KFxuXHRcdFx0dGhpcy5zdGF0aWNzLm1hcChfID0+IHQxKF8sIHRydWUpKSxcblx0XHRcdG9wTWFwKHRoaXMub3BDb25zdHJ1Y3RvciwgdDApLFxuXHRcdFx0dGhpcy5tZXRob2RzLm1hcChfID0+IHQxKF8sIGZhbHNlKSkpXG5cdFx0Y29uc3Qgb3BOYW1lID0gb3BNYXAodmVyaWZ5UmVzdWx0cy5vcE5hbWUodGhpcyksIGlkZW50aWZpZXIpXG5cdFx0Y29uc3QgY2xhc3NFeHByID0gbmV3IENsYXNzRXhwcmVzc2lvbihcblx0XHRcdG9wTmFtZSxcblx0XHRcdG9wTWFwKHRoaXMub3BTdXBlckNsYXNzLCB0MCksIG5ldyBDbGFzc0JvZHkobWV0aG9kcykpXG5cblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BEbywgXyA9PiB0MShfLCBjbGFzc0V4cHIpLCAoKSA9PiBjbGFzc0V4cHIpXG5cdH0sXG5cblx0Q2xhc3NEbyhjbGFzc0V4cHIpIHtcblx0XHRjb25zdCBsZWFkID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgW1xuXHRcdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRvcih0MCh0aGlzLmRlY2xhcmVGb2N1cyksIGNsYXNzRXhwcildKVxuXHRcdGNvbnN0IHJldCA9IG5ldyBSZXR1cm5TdGF0ZW1lbnQodDAodGhpcy5kZWNsYXJlRm9jdXMpKVxuXHRcdGNvbnN0IGJsb2NrID0gdDModGhpcy5ibG9jaywgbGVhZCwgbnVsbCwgcmV0KVxuXHRcdHJldHVybiBibG9ja1dyYXAoYmxvY2spXG5cdH0sXG5cblx0Q29uZCgpIHtcblx0XHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0MCh0aGlzLnRlc3QpLCB0MCh0aGlzLmlmVHJ1ZSksIHQwKHRoaXMuaWZGYWxzZSkpXG5cdH0sXG5cblx0Q29uZGl0aW9uYWxEbygpIHtcblx0XHRjb25zdCB0ZXN0ID0gdDAodGhpcy50ZXN0KVxuXHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQoXG5cdFx0XHR0aGlzLmlzVW5sZXNzID8gbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIHRlc3QpIDogdGVzdCxcblx0XHRcdHQwKHRoaXMucmVzdWx0KSlcblx0fSxcblxuXHRDb25kaXRpb25hbFZhbCgpIHtcblx0XHRjb25zdCB0ZXN0ID0gdDAodGhpcy50ZXN0KVxuXHRcdGNvbnN0IHJlc3VsdCA9IG1zQ2FsbCgnc29tZScsIGJsb2NrV3JhcCh0MCh0aGlzLnJlc3VsdCkpKVxuXHRcdHJldHVybiB0aGlzLmlzVW5sZXNzID9cblx0XHRcdG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odGVzdCwgbXNNZW1iZXIoJ05vbmUnKSwgcmVzdWx0KSA6XG5cdFx0XHRuZXcgQ29uZGl0aW9uYWxFeHByZXNzaW9uKHRlc3QsIHJlc3VsdCwgbXNNZW1iZXIoJ05vbmUnKSlcblx0fSxcblxuXHRDb25zdHJ1Y3RvcigpIHtcblx0XHRpc0luQ29uc3RydWN0b3IgPSB0cnVlXG5cblx0XHQvLyBJZiB0aGVyZSBpcyBhIGBzdXBlciFgLCBgdGhpc2Agd2lsbCBub3QgYmUgZGVmaW5lZCB1bnRpbCB0aGVuLCBzbyBtdXN0IHdhaXQgdW50aWwgdGhlbi5cblx0XHQvLyBPdGhlcndpc2UsIGRvIGl0IGF0IHRoZSBiZWdpbm5pbmcuXG5cdFx0Y29uc3QgYm9keSA9IHZlcmlmeVJlc3VsdHMuY29uc3RydWN0b3JUb1N1cGVyLmhhcyh0aGlzKSA/XG5cdFx0XHR0MCh0aGlzLmZ1bikgOlxuXHRcdFx0dDEodGhpcy5mdW4sIGNvbnN0cnVjdG9yU2V0TWVtYmVycyh0aGlzKSlcblxuXHRcdGNvbnN0IHJlcyA9IE1ldGhvZERlZmluaXRpb24uY29uc3RydWN0b3IoYm9keSlcblx0XHRpc0luQ29uc3RydWN0b3IgPSBmYWxzZVxuXHRcdHJldHVybiByZXNcblx0fSxcblxuXHRDYXRjaCgpIHtcblx0XHRyZXR1cm4gbmV3IENhdGNoQ2xhdXNlKHQwKHRoaXMuY2F1Z2h0KSwgdDAodGhpcy5ibG9jaykpXG5cdH0sXG5cblx0RXhjZXB0RG8oKSB7IHJldHVybiB0cmFuc3BpbGVFeGNlcHQodGhpcykgfSxcblx0RXhjZXB0VmFsKCkgeyByZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChbdHJhbnNwaWxlRXhjZXB0KHRoaXMpXSkpIH0sXG5cblx0Rm9yRG8oKSB7IHJldHVybiBmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jaykgfSxcblxuXHRGb3JCYWcoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW1xuXHRcdFx0RGVjbGFyZUJ1aWx0QmFnLFxuXHRcdFx0Zm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spLFxuXHRcdFx0UmV0dXJuQnVpbHRcblx0XHRdKSlcblx0fSxcblxuXHRGb3JWYWwoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW2Zvckxvb3AodGhpcy5vcEl0ZXJhdGVlLCB0aGlzLmJsb2NrKV0pKVxuXHR9LFxuXG5cdC8vIGxlYWRTdGF0ZW1lbnRzIGNvbWVzIGZyb20gY29uc3RydWN0b3IgbWVtYmVyc1xuXHRGdW4obGVhZFN0YXRlbWVudHM9bnVsbCkge1xuXHRcdGNvbnN0IGlzR2VuZXJhdG9yRnVuID0gdGhpcy5raW5kICE9PSBGdW5zLlBsYWluXG5cdFx0Y29uc3Qgb2xkSW5HZW5lcmF0b3IgPSBpc0luR2VuZXJhdG9yXG5cdFx0aXNJbkdlbmVyYXRvciA9IGlzR2VuZXJhdG9yRnVuXG5cblx0XHQvLyBUT0RPOkVTNiB1c2UgYC4uLmBmXG5cdFx0Y29uc3QgbkFyZ3MgPSBuZXcgTGl0ZXJhbCh0aGlzLmFyZ3MubGVuZ3RoKVxuXHRcdGNvbnN0IG9wRGVjbGFyZVJlc3QgPSBvcE1hcCh0aGlzLm9wUmVzdEFyZywgcmVzdCA9PlxuXHRcdFx0ZGVjbGFyZShyZXN0LCBuZXcgQ2FsbEV4cHJlc3Npb24oQXJyYXlTbGljZUNhbGwsIFtJZEFyZ3VtZW50cywgbkFyZ3NdKSkpXG5cdFx0Y29uc3QgYXJnQ2hlY2tzID0gb3BJZihvcHRpb25zLmluY2x1ZGVDaGVja3MoKSwgKCkgPT5cblx0XHRcdGZsYXRPcE1hcCh0aGlzLmFyZ3MsIG9wVHlwZUNoZWNrRm9yTG9jYWxEZWNsYXJlKSlcblxuXHRcdGNvbnN0IG9wRGVjbGFyZVRoaXMgPVxuXHRcdFx0b3BJZighaXNJbkNvbnN0cnVjdG9yICYmIHRoaXMub3BEZWNsYXJlVGhpcyAhPSBudWxsLCAoKSA9PiBEZWNsYXJlTGV4aWNhbFRoaXMpXG5cblx0XHRjb25zdCBsZWFkID0gY2F0KGxlYWRTdGF0ZW1lbnRzLCBvcERlY2xhcmVUaGlzLCBvcERlY2xhcmVSZXN0LCBhcmdDaGVja3MpXG5cblx0XHRjb25zdCBib2R5ID0oKSA9PiB0Mih0aGlzLmJsb2NrLCBsZWFkLCB0aGlzLm9wUmV0dXJuVHlwZSlcblx0XHRjb25zdCBhcmdzID0gdGhpcy5hcmdzLm1hcCh0MClcblx0XHRjb25zdCBpZCA9IG9wTWFwKHZlcmlmeVJlc3VsdHMub3BOYW1lKHRoaXMpLCBpZGVudGlmaWVyKVxuXG5cdFx0dHJ5IHtcblx0XHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRcdGNhc2UgRnVucy5QbGFpbjpcblx0XHRcdFx0XHQvLyBUT0RPOkVTNiBTaG91bGQgYmUgYWJsZSB0byB1c2UgcmVzdCBhcmdzIGluIGFycm93IGZ1bmN0aW9uXG5cdFx0XHRcdFx0aWYgKGlkID09PSBudWxsICYmIHRoaXMub3BEZWNsYXJlVGhpcyA9PT0gbnVsbCAmJiBvcERlY2xhcmVSZXN0ID09PSBudWxsKVxuXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihhcmdzLCBib2R5KCkpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIGFyZ3MsIGJvZHkoKSlcblx0XHRcdFx0Y2FzZSBGdW5zLkFzeW5jOiB7XG5cdFx0XHRcdFx0Y29uc3QgcGxhaW5Cb2R5ID0gdDIodGhpcy5ibG9jaywgbnVsbCwgdGhpcy5vcFJldHVyblR5cGUpXG5cdFx0XHRcdFx0Y29uc3QgZ2VuRnVuYyA9IG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIFtdLCBwbGFpbkJvZHksIHRydWUpXG5cdFx0XHRcdFx0Y29uc3QgcmV0ID0gbmV3IFJldHVyblN0YXRlbWVudChtc0NhbGwoJ2FzeW5jJywgZ2VuRnVuYykpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIGFyZ3MsIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgcmV0KSkpXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBGdW5zLkdlbmVyYXRvcjpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihpZCwgYXJncywgYm9keSgpLCB0cnVlKVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcih0aGlzLmtpbmQpXG5cdFx0XHR9XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdGlzSW5HZW5lcmF0b3IgPSBvbGRJbkdlbmVyYXRvclxuXHRcdH1cblx0fSxcblxuXHRJZ25vcmUoKSB7XG5cdFx0cmV0dXJuIFtdXG5cdH0sXG5cblx0TGF6eSgpIHtcblx0XHRyZXR1cm4gbGF6eVdyYXAodDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0TWV0aG9kSW1wbChpc1N0YXRpYykge1xuXHRcdGNvbnN0IHZhbHVlID0gdDAodGhpcy5mdW4pXG5cdFx0YXNzZXJ0KHZhbHVlLmlkID09IG51bGwpXG5cdFx0Ly8gU2luY2UgdGhlIEZ1biBzaG91bGQgaGF2ZSBvcERlY2xhcmVUaGlzLCBpdCB3aWxsIG5ldmVyIGJlIGFuIEFycm93RnVuY3Rpb25FeHByZXNzaW9uLlxuXHRcdGFzc2VydCh2YWx1ZSBpbnN0YW5jZW9mIEZ1bmN0aW9uRXhwcmVzc2lvbilcblxuXHRcdGNvbnN0IHtrZXksIGNvbXB1dGVkfSA9IG1ldGhvZEtleUNvbXB1dGVkKHRoaXMuc3ltYm9sKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kRGVmaW5pdGlvbihrZXksIHZhbHVlLCAnbWV0aG9kJywgaXNTdGF0aWMsIGNvbXB1dGVkKVxuXHR9LFxuXHRNZXRob2RHZXR0ZXIoaXNTdGF0aWMpIHtcblx0XHRjb25zdCB2YWx1ZSA9IG5ldyBGdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgW10sIHQxKHRoaXMuYmxvY2ssIERlY2xhcmVMZXhpY2FsVGhpcykpXG5cdFx0Y29uc3Qge2tleSwgY29tcHV0ZWR9ID0gbWV0aG9kS2V5Q29tcHV0ZWQodGhpcy5zeW1ib2wpXG5cdFx0cmV0dXJuIG5ldyBNZXRob2REZWZpbml0aW9uKGtleSwgdmFsdWUsICdnZXQnLCBpc1N0YXRpYywgY29tcHV0ZWQpXG5cdH0sXG5cdE1ldGhvZFNldHRlcihpc1N0YXRpYykge1xuXHRcdGNvbnN0IHZhbHVlID0gbmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihudWxsLCBbSWRGb2N1c10sIHQxKHRoaXMuYmxvY2ssIERlY2xhcmVMZXhpY2FsVGhpcykpXG5cdFx0Y29uc3Qge2tleSwgY29tcHV0ZWR9ID0gbWV0aG9kS2V5Q29tcHV0ZWQodGhpcy5zeW1ib2wpXG5cdFx0cmV0dXJuIG5ldyBNZXRob2REZWZpbml0aW9uKGtleSwgdmFsdWUsICdzZXQnLCBpc1N0YXRpYywgY29tcHV0ZWQpXG5cdH0sXG5cblx0TnVtYmVyTGl0ZXJhbCgpIHtcblx0XHQvLyBOZWdhdGl2ZSBudW1iZXJzIGFyZSBub3QgcGFydCBvZiBFUyBzcGVjLlxuXHRcdC8vIGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi81LjEvI3NlYy03LjguM1xuXHRcdGNvbnN0IHZhbHVlID0gTnVtYmVyKHRoaXMudmFsdWUpXG5cdFx0Y29uc3QgbGl0ID0gbmV3IExpdGVyYWwoTWF0aC5hYnModmFsdWUpKVxuXHRcdGNvbnN0IGlzUG9zaXRpdmUgPSB2YWx1ZSA+PSAwICYmIDEgLyB2YWx1ZSAhPT0gLUluZmluaXR5XG5cdFx0cmV0dXJuIGlzUG9zaXRpdmUgPyBsaXQgOiBuZXcgVW5hcnlFeHByZXNzaW9uKCctJywgbGl0KVxuXHR9LFxuXG5cdExvY2FsQWNjZXNzKCkge1xuXHRcdGlmICh0aGlzLm5hbWUgPT09ICd0aGlzJylcblx0XHRcdHJldHVybiBpc0luQ29uc3RydWN0b3IgPyBuZXcgVGhpc0V4cHJlc3Npb24oKSA6IElkTGV4aWNhbFRoaXNcblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IGxkID0gdmVyaWZ5UmVzdWx0cy5sb2NhbERlY2xhcmVGb3JBY2Nlc3ModGhpcylcblx0XHRcdC8vIElmIGxkIG1pc3NpbmcsIHRoaXMgaXMgYSBidWlsdGluLCBhbmQgYnVpbHRpbnMgYXJlIG5ldmVyIGxhenlcblx0XHRcdHJldHVybiBsZCA9PT0gdW5kZWZpbmVkID8gaWRlbnRpZmllcih0aGlzLm5hbWUpIDogYWNjZXNzTG9jYWxEZWNsYXJlKGxkKVxuXHRcdH1cblx0fSxcblxuXHRMb2NhbERlY2xhcmUoKSB7IHJldHVybiBuZXcgSWRlbnRpZmllcihpZEZvckRlY2xhcmVDYWNoZWQodGhpcykubmFtZSkgfSxcblxuXHRMb2NhbE11dGF0ZSgpIHtcblx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgaWRlbnRpZmllcih0aGlzLm5hbWUpLCB0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRMb2dpYygpIHtcblx0XHRjb25zdCBvcCA9IHRoaXMua2luZCA9PT0gTG9naWNzLkFuZCA/ICcmJicgOiAnfHwnXG5cdFx0cmV0dXJuIHRhaWwodGhpcy5hcmdzKS5yZWR1Y2UoKGEsIGIpID0+XG5cdFx0XHRuZXcgTG9naWNhbEV4cHJlc3Npb24ob3AsIGEsIHQwKGIpKSwgdDAodGhpcy5hcmdzWzBdKSlcblx0fSxcblxuXHRNYXBFbnRyeSgpIHsgcmV0dXJuIG1zQ2FsbCgnc2V0U3ViJywgSWRCdWlsdCwgdDAodGhpcy5rZXkpLCB0MCh0aGlzLnZhbCkpIH0sXG5cblx0TWVtYmVyKCkge1xuXHRcdHJldHVybiBtZW1iZXJTdHJpbmdPclZhbCh0MCh0aGlzLm9iamVjdCksIHRoaXMubmFtZSlcblx0fSxcblxuXHRNZW1iZXJGdW4oKSB7XG5cdFx0Y29uc3QgbmFtZSA9IHR5cGVvZiB0aGlzLm5hbWUgPT09ICdzdHJpbmcnID8gbmV3IExpdGVyYWwodGhpcy5uYW1lKSA6IHQwKHRoaXMubmFtZSlcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BPYmplY3QsXG5cdFx0XHRfID0+IG1zQ2FsbCgnbWV0aG9kQm91bmQnLCB0MChfKSwgbmFtZSksXG5cdFx0XHQoKSA9PiBtc0NhbGwoJ21ldGhvZFVuYm91bmQnLCBuYW1lKSlcblx0fSxcblxuXHRNZW1iZXJTZXQoKSB7XG5cdFx0Y29uc3Qgb2JqID0gdDAodGhpcy5vYmplY3QpXG5cdFx0Y29uc3QgbmFtZSA9ICgpID0+XG5cdFx0XHR0eXBlb2YgdGhpcy5uYW1lID09PSAnc3RyaW5nJyA/IG5ldyBMaXRlcmFsKHRoaXMubmFtZSkgOiB0MCh0aGlzLm5hbWUpXG5cdFx0Y29uc3QgdmFsID0gbWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHQwKHRoaXMudmFsdWUpLCB0aGlzLm9wVHlwZSwgdGhpcy5uYW1lKVxuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIFNldHRlcnMuSW5pdDpcblx0XHRcdFx0cmV0dXJuIG1zQ2FsbCgnbmV3UHJvcGVydHknLCBvYmosIG5hbWUoKSwgdmFsKVxuXHRcdFx0Y2FzZSBTZXR0ZXJzLkluaXRNdXRhYmxlOlxuXHRcdFx0XHRyZXR1cm4gbXNDYWxsKCduZXdNdXRhYmxlUHJvcGVydHknLCBvYmosIG5hbWUoKSwgdmFsKVxuXHRcdFx0Y2FzZSBTZXR0ZXJzLk11dGF0ZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlclN0cmluZ09yVmFsKG9iaiwgdGhpcy5uYW1lKSwgdmFsKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKClcblx0XHR9XG5cdH0sXG5cblx0TW9kdWxlOiB0cmFuc3BpbGVNb2R1bGUsXG5cblx0TW9kdWxlRXhwb3J0TmFtZWQoKSB7XG5cdFx0cmV0dXJuIHQxKHRoaXMuYXNzaWduLCB2YWwgPT5cblx0XHRcdG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlcihJZEV4cG9ydHMsIHRoaXMuYXNzaWduLmFzc2lnbmVlLm5hbWUpLCB2YWwpKVxuXHR9LFxuXG5cdE1vZHVsZUV4cG9ydERlZmF1bHQoKSB7XG5cdFx0cmV0dXJuIHQxKHRoaXMuYXNzaWduLCB2YWwgPT4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgRXhwb3J0c0RlZmF1bHQsIHZhbCkpXG5cdH0sXG5cblx0TmV3KCkge1xuXHRcdHJldHVybiBuZXcgTmV3RXhwcmVzc2lvbih0MCh0aGlzLnR5cGUpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHROb3QoKSB7IHJldHVybiBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgdDAodGhpcy5hcmcpKSB9LFxuXG5cdE9iakVudHJ5QXNzaWduKCkge1xuXHRcdHJldHVybiB0aGlzLmFzc2lnbiBpbnN0YW5jZW9mIEFzc2lnblNpbmdsZSAmJiAhdGhpcy5hc3NpZ24uYXNzaWduZWUuaXNMYXp5KCkgP1xuXHRcdFx0dDEodGhpcy5hc3NpZ24sIHZhbCA9PlxuXHRcdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRCdWlsdCwgdGhpcy5hc3NpZ24uYXNzaWduZWUubmFtZSksIHZhbCkpIDpcblx0XHRcdGNhdChcblx0XHRcdFx0dDAodGhpcy5hc3NpZ24pLFxuXHRcdFx0XHR0aGlzLmFzc2lnbi5hbGxBc3NpZ25lZXMoKS5tYXAoXyA9PlxuXHRcdFx0XHRcdG1zQ2FsbCgnc2V0TGF6eScsIElkQnVpbHQsIG5ldyBMaXRlcmFsKF8ubmFtZSksIGlkRm9yRGVjbGFyZUNhY2hlZChfKSkpKVxuXHR9LFxuXG5cdE9iakVudHJ5UGxhaW4oKSB7XG5cdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlclN0cmluZ09yVmFsKElkQnVpbHQsIHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdE9ialNpbXBsZSgpIHtcblx0XHRyZXR1cm4gbmV3IE9iamVjdEV4cHJlc3Npb24odGhpcy5wYWlycy5tYXAocGFpciA9PlxuXHRcdFx0bmV3IFByb3BlcnR5KCdpbml0JywgcHJvcGVydHlJZE9yTGl0ZXJhbChwYWlyLmtleSksIHQwKHBhaXIudmFsdWUpKSkpXG5cdH0sXG5cblx0R2V0dGVyRnVuKCkge1xuXHRcdC8vIF8gPT4gXy5mb29cblx0XHRyZXR1cm4gbmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKFtJZEZvY3VzXSwgbWVtYmVyU3RyaW5nT3JWYWwoSWRGb2N1cywgdGhpcy5uYW1lKSlcblx0fSxcblxuXHRRdW90ZVBsYWluKCkge1xuXHRcdGlmICh0aGlzLnBhcnRzLmxlbmd0aCA9PT0gMClcblx0XHRcdHJldHVybiBMaXRFbXB0eVN0cmluZ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgcXVhc2lzID0gW10sIGV4cHJlc3Npb25zID0gW11cblxuXHRcdFx0Ly8gVGVtcGxhdGVMaXRlcmFsIG11c3Qgc3RhcnQgd2l0aCBhIFRlbXBsYXRlRWxlbWVudFxuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLnBhcnRzWzBdICE9PSAnc3RyaW5nJylcblx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmVtcHR5KVxuXG5cdFx0XHRmb3IgKGxldCBwYXJ0IG9mIHRoaXMucGFydHMpXG5cdFx0XHRcdGlmICh0eXBlb2YgcGFydCA9PT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmZvclJhd1N0cmluZyhwYXJ0KSlcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Ly8gXCJ7MX17MX1cIiBuZWVkcyBhbiBlbXB0eSBxdWFzaSBpbiB0aGUgbWlkZGxlIChhbmQgb24gdGhlIGVuZHMpXG5cdFx0XHRcdFx0aWYgKHF1YXNpcy5sZW5ndGggPT09IGV4cHJlc3Npb25zLmxlbmd0aClcblx0XHRcdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5lbXB0eSlcblx0XHRcdFx0XHRleHByZXNzaW9ucy5wdXNoKHQwKHBhcnQpKVxuXHRcdFx0XHR9XG5cblx0XHRcdC8vIFRlbXBsYXRlTGl0ZXJhbCBtdXN0IGVuZCB3aXRoIGEgVGVtcGxhdGVFbGVtZW50LCBzbyBvbmUgbW9yZSBxdWFzaSB0aGFuIGV4cHJlc3Npb24uXG5cdFx0XHRpZiAocXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoKVxuXHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZW1wdHkpXG5cblx0XHRcdHJldHVybiBuZXcgVGVtcGxhdGVMaXRlcmFsKHF1YXNpcywgZXhwcmVzc2lvbnMpXG5cdFx0fVxuXHR9LFxuXG5cdFF1b3RlU2ltcGxlKCkge1xuXHRcdHJldHVybiBuZXcgTGl0ZXJhbCh0aGlzLm5hbWUpXG5cdH0sXG5cblx0UXVvdGVUYWdnZWRUZW1wbGF0ZSgpIHtcblx0XHRyZXR1cm4gbmV3IFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbih0MCh0aGlzLnRhZyksIHQwKHRoaXMucXVvdGUpKVxuXHR9LFxuXG5cdFJhbmdlKCkge1xuXHRcdGNvbnN0IGVuZCA9IGlmRWxzZSh0aGlzLmVuZCwgdDAsICgpID0+IEdsb2JhbEluZmluaXR5KVxuXHRcdHJldHVybiBtc0NhbGwoJ3JhbmdlJywgdDAodGhpcy5zdGFydCksIGVuZCwgbmV3IExpdGVyYWwodGhpcy5pc0V4Y2x1c2l2ZSkpXG5cdH0sXG5cblx0U2V0U3ViKCkge1xuXHRcdGNvbnN0IGdldEtpbmQgPSAoKSA9PiB7XG5cdFx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0XHRjYXNlIFNldHRlcnMuSW5pdDpcblx0XHRcdFx0XHRyZXR1cm4gJ2luaXQnXG5cdFx0XHRcdGNhc2UgU2V0dGVycy5Jbml0TXV0YWJsZTpcblx0XHRcdFx0XHRyZXR1cm4gJ2luaXQtbXV0YWJsZSdcblx0XHRcdFx0Y2FzZSBTZXR0ZXJzLk11dGF0ZTpcblx0XHRcdFx0XHRyZXR1cm4gJ211dGF0ZSdcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRjb25zdCBraW5kID0gZ2V0S2luZCgpXG5cdFx0cmV0dXJuIG1zQ2FsbChcblx0XHRcdCdzZXRTdWInLFxuXHRcdFx0dDAodGhpcy5vYmplY3QpLFxuXHRcdFx0dGhpcy5zdWJiZWRzLmxlbmd0aCA9PT0gMSA/IHQwKHRoaXMuc3ViYmVkc1swXSkgOiB0aGlzLnN1YmJlZHMubWFwKHQwKSxcblx0XHRcdG1heWJlV3JhcEluQ2hlY2tDb250YWlucyh0MCh0aGlzLnZhbHVlKSwgdGhpcy5vcFR5cGUsICd2YWx1ZScpLFxuXHRcdFx0bmV3IExpdGVyYWwoa2luZCkpXG5cdH0sXG5cblx0U3BlY2lhbERvKCkge1xuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIFNwZWNpYWxEb3MuRGVidWdnZXI6IHJldHVybiBuZXcgRGVidWdnZXJTdGF0ZW1lbnQoKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHR9XG5cdH0sXG5cblx0U3BlY2lhbFZhbCgpIHtcblx0XHQvLyBNYWtlIG5ldyBvYmplY3RzIGJlY2F1c2Ugd2Ugd2lsbCBhc3NpZ24gYGxvY2AgdG8gdGhlbS5cblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5Db250YWluczpcblx0XHRcdFx0cmV0dXJuIG1zTWVtYmVyKCdjb250YWlucycpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLkRlbFN1Yjpcblx0XHRcdFx0cmV0dXJuIG1zTWVtYmVyKCdkZWxTdWInKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5GYWxzZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKGZhbHNlKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5OYW1lOlxuXHRcdFx0XHRyZXR1cm4gbmV3IExpdGVyYWwodmVyaWZ5UmVzdWx0cy5uYW1lKHRoaXMpKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5OdWxsOlxuXHRcdFx0XHRyZXR1cm4gbmV3IExpdGVyYWwobnVsbClcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuU2V0U3ViOlxuXHRcdFx0XHRyZXR1cm4gbXNNZW1iZXIoJ3NldFN1YicpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLlN1Yjpcblx0XHRcdFx0cmV0dXJuIG1zTWVtYmVyKCdzdWInKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5UcnVlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IExpdGVyYWwodHJ1ZSlcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuVW5kZWZpbmVkOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFVuYXJ5RXhwcmVzc2lvbigndm9pZCcsIExpdFplcm8pXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IodGhpcy5raW5kKVxuXHRcdH1cblx0fSxcblxuXHRTcHJlYWQoKSB7XG5cdFx0cmV0dXJuIG5ldyBTcHJlYWRFbGVtZW50KHQwKHRoaXMuc3ByZWFkZWQpKVxuXHR9LFxuXG5cdFN1cGVyQ2FsbDogc3VwZXJDYWxsLFxuXHRTdXBlckNhbGxEbzogc3VwZXJDYWxsLFxuXHRTdXBlck1lbWJlcigpIHtcblx0XHRyZXR1cm4gbWVtYmVyU3RyaW5nT3JWYWwoSWRTdXBlciwgdGhpcy5uYW1lKVxuXHR9LFxuXG5cdFN3aXRjaERvKCkgeyByZXR1cm4gdHJhbnNwaWxlU3dpdGNoKHRoaXMpIH0sXG5cdFN3aXRjaFZhbCgpIHsgcmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW3RyYW5zcGlsZVN3aXRjaCh0aGlzKV0pKSB9LFxuXHRTd2l0Y2hEb1BhcnQ6IHN3aXRjaFBhcnQsXG5cdFN3aXRjaFZhbFBhcnQ6IHN3aXRjaFBhcnQsXG5cblx0VGhyb3coKSB7XG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wVGhyb3duLFxuXHRcdFx0XyA9PiBkb1Rocm93KF8pLFxuXHRcdFx0KCkgPT4gbmV3IFRocm93U3RhdGVtZW50KG5ldyBOZXdFeHByZXNzaW9uKEdsb2JhbEVycm9yLCBbTGl0U3RyVGhyb3ddKSkpXG5cdH0sXG5cblx0V2l0aCgpIHtcblx0XHRjb25zdCBpZERlY2xhcmUgPSBpZEZvckRlY2xhcmVDYWNoZWQodGhpcy5kZWNsYXJlKVxuXHRcdGNvbnN0IGJsb2NrID0gdDModGhpcy5ibG9jaywgbnVsbCwgbnVsbCwgbmV3IFJldHVyblN0YXRlbWVudChpZERlY2xhcmUpKVxuXHRcdGNvbnN0IGZ1biA9IGlzSW5HZW5lcmF0b3IgP1xuXHRcdFx0bmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihudWxsLCBbaWREZWNsYXJlXSwgYmxvY2ssIHRydWUpIDpcblx0XHRcdG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihbaWREZWNsYXJlXSwgYmxvY2spXG5cdFx0Y29uc3QgY2FsbCA9IG5ldyBDYWxsRXhwcmVzc2lvbihmdW4sIFt0MCh0aGlzLnZhbHVlKV0pXG5cdFx0cmV0dXJuIGlzSW5HZW5lcmF0b3IgPyBuZXcgWWllbGRFeHByZXNzaW9uKGNhbGwsIHRydWUpIDogY2FsbFxuXHR9LFxuXG5cdFlpZWxkKCkgeyByZXR1cm4gbmV3IFlpZWxkRXhwcmVzc2lvbihvcE1hcCh0aGlzLm9wWWllbGRlZCwgdDApLCBmYWxzZSkgfSxcblxuXHRZaWVsZFRvKCkgeyByZXR1cm4gbmV3IFlpZWxkRXhwcmVzc2lvbih0MCh0aGlzLnlpZWxkZWRUbyksIHRydWUpIH1cbn0pXG5cbi8vIFNoYXJlZCBpbXBsZW1lbnRhdGlvbnNcblxuZnVuY3Rpb24gY2FzZVBhcnQoYWx0ZXJuYXRlKSB7XG5cdGlmICh0aGlzLnRlc3QgaW5zdGFuY2VvZiBQYXR0ZXJuKSB7XG5cdFx0Y29uc3Qge3R5cGUsIHBhdHRlcm5lZCwgbG9jYWxzfSA9IHRoaXMudGVzdFxuXHRcdGNvbnN0IGRlY2wgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBbXG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKElkRXh0cmFjdCwgbXNDYWxsKCdleHRyYWN0JywgdDAodHlwZSksIHQwKHBhdHRlcm5lZCkpKV0pXG5cdFx0Y29uc3QgdGVzdCA9IG5ldyBCaW5hcnlFeHByZXNzaW9uKCchPT0nLCBJZEV4dHJhY3QsIExpdE51bGwpXG5cdFx0Y29uc3QgZXh0cmFjdCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIGxvY2Fscy5tYXAoKF8sIGlkeCkgPT5cblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoXG5cdFx0XHRcdGlkRm9yRGVjbGFyZUNhY2hlZChfKSxcblx0XHRcdFx0bmV3IE1lbWJlckV4cHJlc3Npb24oSWRFeHRyYWN0LCBuZXcgTGl0ZXJhbChpZHgpKSkpKVxuXHRcdGNvbnN0IHJlcyA9IHQxKHRoaXMucmVzdWx0LCBleHRyYWN0KVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoW2RlY2wsIG5ldyBJZlN0YXRlbWVudCh0ZXN0LCByZXMsIGFsdGVybmF0ZSldKVxuXHR9IGVsc2Vcblx0XHQvLyBhbHRlcm5hdGUgd3JpdHRlbiB0byBieSBgY2FzZUJvZHlgLlxuXHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQodDAodGhpcy50ZXN0KSwgdDAodGhpcy5yZXN1bHQpLCBhbHRlcm5hdGUpXG59XG5cbmZ1bmN0aW9uIHN1cGVyQ2FsbCgpIHtcblx0Y29uc3QgYXJncyA9IHRoaXMuYXJncy5tYXAodDApXG5cdGNvbnN0IG1ldGhvZCA9IHZlcmlmeVJlc3VsdHMuc3VwZXJDYWxsVG9NZXRob2QuZ2V0KHRoaXMpXG5cblx0aWYgKG1ldGhvZCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB7XG5cdFx0Y29uc3QgY2FsbCA9IG5ldyBDYWxsRXhwcmVzc2lvbihJZFN1cGVyLCBhcmdzKVxuXHRcdGNvbnN0IG1lbWJlclNldHMgPSBjb25zdHJ1Y3RvclNldE1lbWJlcnMobWV0aG9kKVxuXHRcdHJldHVybiBjYXQoY2FsbCwgbWVtYmVyU2V0cylcblx0fSBlbHNlXG5cdFx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbihtZW1iZXJTdHJpbmdPclZhbChJZFN1cGVyLCBtZXRob2Quc3ltYm9sKSwgYXJncylcbn1cblxuZnVuY3Rpb24gc3dpdGNoUGFydCgpIHtcblx0Y29uc3QgZm9sbG93ID0gb3BJZih0aGlzIGluc3RhbmNlb2YgU3dpdGNoRG9QYXJ0LCAoKSA9PiBuZXcgQnJlYWtTdGF0ZW1lbnQpXG5cdC8qXG5cdFdlIGNvdWxkIGp1c3QgcGFzcyBibG9jay5ib2R5IGZvciB0aGUgc3dpdGNoIGxpbmVzLCBidXQgaW5zdGVhZFxuXHRlbmNsb3NlIHRoZSBib2R5IG9mIHRoZSBzd2l0Y2ggY2FzZSBpbiBjdXJseSBicmFjZXMgdG8gZW5zdXJlIGEgbmV3IHNjb3BlLlxuXHRUaGF0IHdheSB0aGlzIGNvZGUgd29ya3M6XG5cdFx0c3dpdGNoICgwKSB7XG5cdFx0XHRjYXNlIDA6IHtcblx0XHRcdFx0Y29uc3QgYSA9IDBcblx0XHRcdFx0cmV0dXJuIGFcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0Ly8gV2l0aG91dCBjdXJseSBicmFjZXMgdGhpcyB3b3VsZCBjb25mbGljdCB3aXRoIHRoZSBvdGhlciBgYWAuXG5cdFx0XHRcdGNvbnN0IGEgPSAxXG5cdFx0XHRcdGFcblx0XHRcdH1cblx0XHR9XG5cdCovXG5cdGNvbnN0IGJsb2NrID0gdDModGhpcy5yZXN1bHQsIG51bGwsIG51bGwsIGZvbGxvdylcblx0Ly8gSWYgc3dpdGNoIGhhcyBtdWx0aXBsZSB2YWx1ZXMsIGJ1aWxkIHVwIGEgc3RhdGVtZW50IGxpa2U6IGBjYXNlIDE6IGNhc2UgMjogeyBkb0Jsb2NrKCkgfWBcblx0Y29uc3QgeCA9IFtdXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy52YWx1ZXMubGVuZ3RoIC0gMTsgaSA9IGkgKyAxKVxuXHRcdC8vIFRoZXNlIGNhc2VzIGZhbGx0aHJvdWdoIHRvIHRoZSBvbmUgYXQgdGhlIGVuZC5cblx0XHR4LnB1c2gobmV3IFN3aXRjaENhc2UodDAodGhpcy52YWx1ZXNbaV0pLCBbXSkpXG5cdHgucHVzaChuZXcgU3dpdGNoQ2FzZSh0MCh0aGlzLnZhbHVlc1t0aGlzLnZhbHVlcy5sZW5ndGggLSAxXSksIFtibG9ja10pKVxuXHRyZXR1cm4geFxufVxuXG4vLyBGdW5jdGlvbnMgc3BlY2lmaWMgdG8gY2VydGFpbiBleHByZXNzaW9uc1xuXG4vLyBXcmFwcyBhIGJsb2NrICh3aXRoIGByZXR1cm5gIHN0YXRlbWVudHMgaW4gaXQpIGluIGFuIElJRkUuXG5mdW5jdGlvbiBibG9ja1dyYXAoYmxvY2spIHtcblx0Y29uc3QgaW52b2tlID0gbmV3IENhbGxFeHByZXNzaW9uKGZ1bmN0aW9uRXhwcmVzc2lvblRodW5rKGJsb2NrLCBpc0luR2VuZXJhdG9yKSwgW10pXG5cdHJldHVybiBpc0luR2VuZXJhdG9yID8gbmV3IFlpZWxkRXhwcmVzc2lvbihpbnZva2UsIHRydWUpIDogaW52b2tlXG59XG5cbmZ1bmN0aW9uIGNhc2VCb2R5KHBhcnRzLCBvcEVsc2UpIHtcblx0bGV0IGFjYyA9IGlmRWxzZShvcEVsc2UsIHQwLCAoKSA9PiBUaHJvd05vQ2FzZU1hdGNoKVxuXHRmb3IgKGxldCBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpID0gaSAtIDEpXG5cdFx0YWNjID0gdDEocGFydHNbaV0sIGFjYylcblx0cmV0dXJuIGFjY1xufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RvclNldE1lbWJlcnMoY29uc3RydWN0b3IpIHtcblx0cmV0dXJuIGNvbnN0cnVjdG9yLm1lbWJlckFyZ3MubWFwKF8gPT5cblx0XHRtc0NhbGwoJ25ld1Byb3BlcnR5JywgbmV3IFRoaXNFeHByZXNzaW9uKCksIG5ldyBMaXRlcmFsKF8ubmFtZSksIGlkRm9yRGVjbGFyZUNhY2hlZChfKSkpXG59XG5cbmZ1bmN0aW9uIGZvckxvb3Aob3BJdGVyYXRlZSwgYmxvY2spIHtcblx0cmV0dXJuIGlmRWxzZShvcEl0ZXJhdGVlLFxuXHRcdCh7ZWxlbWVudCwgYmFnfSkgPT4ge1xuXHRcdFx0Y29uc3QgZGVjbGFyZSA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdsZXQnLFxuXHRcdFx0XHRbbmV3IFZhcmlhYmxlRGVjbGFyYXRvcih0MChlbGVtZW50KSldKVxuXHRcdFx0cmV0dXJuIG5ldyBGb3JPZlN0YXRlbWVudChkZWNsYXJlLCB0MChiYWcpLCB0MChibG9jaykpXG5cdFx0fSxcblx0XHQoKSA9PiBuZXcgRm9yU3RhdGVtZW50KG51bGwsIG51bGwsIG51bGwsIHQwKGJsb2NrKSkpXG59XG5cbmZ1bmN0aW9uIG1ldGhvZEtleUNvbXB1dGVkKHN5bWJvbCkge1xuXHRpZiAodHlwZW9mIHN5bWJvbCA9PT0gJ3N0cmluZycpXG5cdFx0cmV0dXJuIHtrZXk6IHByb3BlcnR5SWRPckxpdGVyYWwoc3ltYm9sKSwgY29tcHV0ZWQ6IGZhbHNlfVxuXHRlbHNlIHtcblx0XHRjb25zdCBrZXkgPSBzeW1ib2wgaW5zdGFuY2VvZiBRdW90ZUFic3RyYWN0ID8gdDAoc3ltYm9sKSA6IG1zQ2FsbCgnc3ltYm9sJywgdDAoc3ltYm9sKSlcblx0XHRyZXR1cm4ge2tleSwgY29tcHV0ZWQ6IHRydWV9XG5cdH1cbn1cblxuZnVuY3Rpb24gdHJhbnNwaWxlQmxvY2socmV0dXJuZWQsIGxpbmVzLCBsZWFkLCBvcFJldHVyblR5cGUpIHtcblx0Y29uc3QgZmluID0gbmV3IFJldHVyblN0YXRlbWVudChcblx0XHRtYXliZVdyYXBJbkNoZWNrQ29udGFpbnMocmV0dXJuZWQsIG9wUmV0dXJuVHlwZSwgJ3JldHVybmVkIHZhbHVlJykpXG5cdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIGxpbmVzLCBmaW4pKVxufVxuXG5mdW5jdGlvbiB0cmFuc3BpbGVFeGNlcHQoZXhjZXB0KSB7XG5cdHJldHVybiBuZXcgVHJ5U3RhdGVtZW50KFxuXHRcdHQwKGV4Y2VwdC50cnkpLFxuXHRcdG9wTWFwKGV4Y2VwdC5jYXRjaCwgdDApLFxuXHRcdG9wTWFwKGV4Y2VwdC5maW5hbGx5LCB0MCkpXG59XG5cbmZ1bmN0aW9uIHRyYW5zcGlsZVN3aXRjaChfKSB7XG5cdGNvbnN0IHBhcnRzID0gZmxhdE1hcChfLnBhcnRzLCB0MClcblx0cGFydHMucHVzaChpZkVsc2UoXy5vcEVsc2UsXG5cdFx0XyA9PiBuZXcgU3dpdGNoQ2FzZSh1bmRlZmluZWQsIHQwKF8pLmJvZHkpLFxuXHRcdCgpID0+IFN3aXRjaENhc2VOb01hdGNoKSlcblx0cmV0dXJuIG5ldyBTd2l0Y2hTdGF0ZW1lbnQodDAoXy5zd2l0Y2hlZCksIHBhcnRzKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMoYXNzaWduZWVzLCBpc0xhenksIHZhbHVlLCBpc01vZHVsZSkge1xuXHRjb25zdCBkZXN0cnVjdHVyZWROYW1lID0gYF8kJHtuZXh0RGVzdHJ1Y3R1cmVkSWR9YFxuXHRuZXh0RGVzdHJ1Y3R1cmVkSWQgPSBuZXh0RGVzdHJ1Y3R1cmVkSWQgKyAxXG5cdGNvbnN0IGlkRGVzdHJ1Y3R1cmVkID0gbmV3IElkZW50aWZpZXIoZGVzdHJ1Y3R1cmVkTmFtZSlcblx0Y29uc3QgZGVjbGFyYXRvcnMgPSBhc3NpZ25lZXMubWFwKGFzc2lnbmVlID0+IHtcblx0XHQvLyBUT0RPOiBEb24ndCBjb21waWxlIGl0IGlmIGl0J3MgbmV2ZXIgYWNjZXNzZWRcblx0XHRjb25zdCBnZXQgPSBnZXRNZW1iZXIoaWREZXN0cnVjdHVyZWQsIGFzc2lnbmVlLm5hbWUsIGlzTGF6eSwgaXNNb2R1bGUpXG5cdFx0cmV0dXJuIG1ha2VEZWNsYXJhdG9yKGFzc2lnbmVlLCBnZXQsIGlzTGF6eSlcblx0fSlcblx0Ly8gR2V0dGluZyBsYXp5IG1vZHVsZSBpcyBkb25lIGJ5IG1zLmxhenlHZXRNb2R1bGUuXG5cdGNvbnN0IHZhbCA9IGlzTGF6eSAmJiAhaXNNb2R1bGUgPyBsYXp5V3JhcCh2YWx1ZSkgOiB2YWx1ZVxuXHRyZXR1cm4gY2F0KG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoaWREZXN0cnVjdHVyZWQsIHZhbCksIGRlY2xhcmF0b3JzKVxufVxuIl19
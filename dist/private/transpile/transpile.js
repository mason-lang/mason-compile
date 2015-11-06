'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/util', '../context', '../MsAst', '../util', './ast-constants', './context', './transpileMethod', './transpileModule', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('esast/dist/util'), require('../context'), require('../MsAst'), require('../util'), require('./ast-constants'), require('./context'), require('./transpileMethod'), require('./transpileModule'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.context, global.MsAst, global.util, global.astConstants, global.context, global.transpileMethod, global.transpileModule, global.util);
		global.transpile = mod.exports;
	}
})(this, function (exports, _ast, _util, _context, _MsAst, _util2, _astConstants, _context2, _transpileMethod, _transpileModule, _util3) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = transpile;

	var MsAstTypes = _interopRequireWildcard(_MsAst);

	var _transpileModule2 = _interopRequireDefault(_transpileModule);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	function transpile(moduleExpression, verifyResults) {
		(0, _context2.setup)(verifyResults);
		const res = (0, _util3.t0)(moduleExpression);
		(0, _context2.tearDown)();
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
						return (0, _util3.msCall)(ass, (0, _util3.t0)(called.object), (0, _util3.transpileName)(called.name), ...args);
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
			return new _ast.VariableDeclaration(this.kind() === _MsAst.LocalDeclares.Mutable ? 'let' : 'const', (0, _util3.makeDestructureDeclarators)(this.assignees, this.kind() === _MsAst.LocalDeclares.Lazy, (0, _util3.t0)(this.value), false));
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
			return (0, _util3.blockWrap)((0, _util3.t0)(this.block));
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

		Case() {
			const body = caseBody(this.parts, this.opElse);

			if (this.isVal) {
				const block = (0, _util2.ifElse)(this.opCased, _ => [(0, _util3.t0)(_), body], () => [body]);
				return (0, _util3.blockWrap)(new _ast.BlockStatement(block));
			} else return (0, _util2.ifElse)(this.opCased, _ => new _ast.BlockStatement([(0, _util3.t0)(_), body]), () => body);
		},

		CasePart(alternate) {
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
		},

		Class() {
			const methods = (0, _util2.cat)(this.statics.map(_ => (0, _transpileMethod.transpileMethodToDefinition)(_, true)), (0, _util2.opMap)(this.opConstructor, _util3.t0), this.methods.map(_ => (0, _transpileMethod.transpileMethodToDefinition)(_, false)));
			const opName = (0, _util2.opMap)(_context2.verifyResults.opName(this), _util.identifier);
			const classExpr = new _ast.ClassExpression(opName, (0, _util2.opMap)(this.opSuperClass, _util3.t0), new _ast.ClassBody(methods));
			if (this.opDo === null && (0, _util2.isEmpty)(this.kinds)) return classExpr;else {
				const lead = (0, _util2.cat)(new _ast.VariableDeclaration('const', [new _ast.VariableDeclarator(_astConstants.IdFocus, classExpr)]), this.kinds.map(_ => (0, _util3.msCall)('kindDo', _astConstants.IdFocus, (0, _util3.t0)(_))));
				const block = (0, _util2.ifElse)(this.opDo, _ => (0, _util3.t3)(_.block, lead, null, _astConstants.ReturnFocus), () => new _ast.BlockStatement((0, _util2.cat)(lead, _astConstants.ReturnFocus)));
				return (0, _util3.blockWrap)(block);
			}
		},

		Cond() {
			return new _ast.ConditionalExpression((0, _util3.t0)(this.test), (0, _util3.t0)(this.ifTrue), (0, _util3.t0)(this.ifFalse));
		},

		Conditional() {
			const test = (0, _util3.t0)(this.test);
			const res = (0, _util3.t0)(this.result);

			if (this.isVal) {
				const result = (0, _util3.msCall)('some', (0, _util3.blockWrap)(res));
				const none = (0, _util3.msMember)('None');

				var _ref = this.isUnless ? [none, result] : [result, none];

				var _ref2 = _slicedToArray(_ref, 2);

				const then = _ref2[0];
				const _else = _ref2[1];
				return new _ast.ConditionalExpression(test, then, _else);
			} else return new _ast.IfStatement(this.isUnless ? new _ast.UnaryExpression('!', test) : test, res);
		},

		Constructor() {
			return (0, _context2.withInConstructor)(() => {
				const body = _context2.verifyResults.constructorToSuper.has(this) ? (0, _util3.t0)(this.fun) : (0, _util3.t1)(this.fun, constructorSetMembers(this));
				return _ast.MethodDefinition.constructor(body);
			});
		},

		Catch() {
			return new _ast.CatchClause((0, _util3.t0)(this.caught), (0, _util3.t0)(this.block));
		},

		Except() {
			return (0, _util3.blockWrapIfVal)(this.isVal, new _ast.TryStatement((0, _util3.t0)(this.try), (0, _util2.opMap)(this.catch, _util3.t0), (0, _util2.opMap)(this.finally, _util3.t0)));
		},

		For() {
			return (0, _util3.blockWrapIfVal)(this.isVal, forLoop(this.opIteratee, this.block));
		},

		ForBag() {
			return (0, _util3.blockWrap)(new _ast.BlockStatement([_astConstants.DeclareBuiltBag, forLoop(this.opIteratee, this.block), _astConstants.ReturnBuilt]));
		},

		Fun() {
			let leadStatements = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
			const isGeneratorFun = this.kind !== _MsAst.Funs.Plain;
			return (0, _context2.withInGenerator)(isGeneratorFun, () => {
				const nArgs = new _ast.Literal(this.args.length);
				const opDeclareRest = (0, _util2.opMap)(this.opRestArg, rest => (0, _util3.declare)(rest, new _ast.CallExpression(_astConstants.ArraySliceCall, [_astConstants.IdArguments, nArgs])));
				const argChecks = (0, _util2.opIf)(_context.options.includeChecks(), () => (0, _util2.flatOpMap)(this.args, _util3.opTypeCheckForLocalDeclare));
				const opDeclareThis = (0, _util2.opIf)(!_context2.isInConstructor && this.opDeclareThis != null, () => _astConstants.DeclareLexicalThis);
				const lead = (0, _util2.cat)(leadStatements, opDeclareThis, opDeclareRest, argChecks);

				const body = () => (0, _util3.t2)(this.block, lead, this.opReturnType);

				const args = this.args.map(_util3.t0);
				const id = (0, _util2.opMap)(_context2.verifyResults.opName(this), _util.identifier);

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
			});
		},

		Ignore() {
			return [];
		},

		Kind() {
			const name = new _ast.Literal(_context2.verifyResults.name(this));
			const supers = new _ast.ArrayExpression(this.superKinds.map(_util3.t0));

			const methods = _ => new _ast.ObjectExpression(_.map(_transpileMethod.transpileMethodToProperty));

			const kind = (0, _util3.msCall)('kind', name, supers, methods(this.statics), methods(this.methods));
			if (this.opDo === null) return kind;else {
				const lead = new _ast.VariableDeclaration('const', [new _ast.VariableDeclarator(_astConstants.IdFocus, kind)]);
				return (0, _util3.blockWrap)((0, _util3.t3)(this.opDo.block, lead, null, _astConstants.ReturnFocus));
			}
		},

		Lazy() {
			return (0, _util3.lazyWrap)((0, _util3.t0)(this.value));
		},

		NumberLiteral() {
			const value = Number(this.value);
			const lit = new _ast.Literal(Math.abs(value));
			const isPositive = value >= 0 && 1 / value !== -Infinity;
			return isPositive ? lit : new _ast.UnaryExpression('-', lit);
		},

		LocalAccess() {
			if (this.name === 'this') return _context2.isInConstructor ? new _ast.ThisExpression() : _astConstants.IdLexicalThis;else {
				const ld = _context2.verifyResults.localDeclareForAccess(this);

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
			const name = (0, _util3.transpileName)(this.name);
			return (0, _util2.ifElse)(this.opObject, _ => (0, _util3.msCall)('methodBound', (0, _util3.t0)(_), name), () => (0, _util3.msCall)('methodUnbound', name));
		},

		MemberSet() {
			const obj = (0, _util3.t0)(this.object);
			const val = (0, _util3.maybeWrapInCheckContains)((0, _util3.t0)(this.value), this.opType, this.name);

			switch (this.kind) {
				case _MsAst.Setters.Init:
					return (0, _util3.msCall)('newProperty', obj, (0, _util3.transpileName)(this.name), val);

				case _MsAst.Setters.InitMutable:
					return (0, _util3.msCall)('newMutableProperty', obj, (0, _util3.transpileName)(this.name), val);

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
					return new _ast.Literal(_context2.verifyResults.name(this));

				case _MsAst.SpecialVals.Null:
					return new _ast.Literal(null);

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

		SuperCall() {
			const args = this.args.map(_util3.t0);

			const method = _context2.verifyResults.superCallToMethod.get(this);

			if (method instanceof _MsAst.Constructor) {
				const call = new _ast.CallExpression(_astConstants.IdSuper, args);
				const memberSets = constructorSetMembers(method);
				return (0, _util2.cat)(call, memberSets);
			} else return new _ast.CallExpression((0, _util3.memberStringOrVal)(_astConstants.IdSuper, method.symbol), args);
		},

		SuperMember() {
			return (0, _util3.memberStringOrVal)(_astConstants.IdSuper, this.name);
		},

		Switch() {
			const parts = (0, _util2.flatMap)(this.parts, _util3.t0);
			parts.push((0, _util2.ifElse)(this.opElse, _ => new _ast.SwitchCase(undefined, (0, _util3.t0)(_).body), () => _astConstants.SwitchCaseNoMatch));
			return (0, _util3.blockWrapIfVal)(this.isVal, new _ast.SwitchStatement((0, _util3.t0)(this.switched), parts));
		},

		SwitchPart() {
			const follow = (0, _util2.opIf)(!this.isVal, () => new _ast.BreakStatement());
			const block = (0, _util3.t3)(this.result, null, null, follow);
			const x = [];

			for (let i = 0; i < this.values.length - 1; i = i + 1) x.push(new _ast.SwitchCase((0, _util3.t0)(this.values[i]), []));

			x.push(new _ast.SwitchCase((0, _util3.t0)(this.values[this.values.length - 1]), [block]));
			return x;
		},

		Throw() {
			return (0, _util2.ifElse)(this.opThrown, _ => (0, _util3.doThrow)(_), () => new _ast.ThrowStatement(new _ast.NewExpression(_astConstants.GlobalError, [_astConstants.LitStrThrow])));
		},

		With() {
			const idDeclare = (0, _util3.idForDeclareCached)(this.declare);
			const block = (0, _util3.t3)(this.block, null, null, new _ast.ReturnStatement(idDeclare));
			const fun = _context2.isInGenerator ? new _ast.FunctionExpression(null, [idDeclare], block, true) : new _ast.ArrowFunctionExpression([idDeclare], block);
			const call = new _ast.CallExpression(fun, [(0, _util3.t0)(this.value)]);
			return _context2.isInGenerator ? new _ast.YieldExpression(call, true) : call;
		},

		Yield() {
			return new _ast.YieldExpression((0, _util2.opMap)(this.opYielded, _util3.t0), false);
		},

		YieldTo() {
			return new _ast.YieldExpression((0, _util3.t0)(this.yieldedTo), true);
		}

	});

	function caseBody(parts, opElse) {
		let acc = (0, _util2.ifElse)(opElse, _util3.t0, () => _astConstants.ThrowNoCaseMatch);

		for (let i = parts.length - 1; i >= 0; i = i - 1) acc = (0, _util3.t1)(parts[i], acc);

		return acc;
	}

	function constructorSetMembers(constructor) {
		return constructor.memberArgs.map(_ => (0, _util3.msCall)('newProperty', new _ast.ThisExpression(), new _ast.Literal(_.name), (0, _util3.idForDeclareCached)(_)));
	}

	function forLoop(opIteratee, block) {
		return (0, _util2.ifElse)(opIteratee, _ref3 => {
			let element = _ref3.element;
			let bag = _ref3.bag;
			const declare = new _ast.VariableDeclaration('let', [new _ast.VariableDeclarator((0, _util3.t0)(element))]);
			return new _ast.ForOfStatement(declare, (0, _util3.t0)(bag), (0, _util3.t0)(block));
		}, () => new _ast.ForStatement(null, null, null, (0, _util3.t0)(block)));
	}

	function transpileBlock(returned, lines, lead, opReturnType) {
		const fin = new _ast.ReturnStatement((0, _util3.maybeWrapInCheckContains)(returned, opReturnType, 'returned value'));
		return new _ast.BlockStatement((0, _util2.cat)(lead, lines, fin));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQTZCd0IsU0FBUzs7Ozs7Ozs7Ozs7O1VBQVQsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BdUR4QixJQUFJLHlEQUFDLElBQUk7T0FBRSxZQUFZLHlEQUFDLElBQUk7T0FBRSxNQUFNLHlEQUFDLElBQUk7Ozs7OztPQUtuQyxJQUFJLHlEQUFDLElBQUk7T0FBRSxhQUFhOzs7OztPQUl2QixJQUFJLHlEQUFDLElBQUk7T0FBRSxZQUFZLHlEQUFDLElBQUk7Ozs7O09BSWxDLElBQUkseURBQUMsSUFBSTtPQUFFLFlBQVkseURBQUMsSUFBSTs7Ozs7T0FPNUIsSUFBSSx5REFBQyxJQUFJO09BQUUsWUFBWSx5REFBQyxJQUFJOzs7OztPQU81QixJQUFJLHlEQUFDLElBQUk7T0FBRSxZQUFZLHlEQUFDLElBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0E2SGpDLGNBQWMseURBQUMsSUFBSSIsImZpbGUiOiJ0cmFuc3BpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FycmF5RXhwcmVzc2lvbiwgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24sIEFzc2lnbm1lbnRFeHByZXNzaW9uLCBCaW5hcnlFeHByZXNzaW9uLFxuXHRCbG9ja1N0YXRlbWVudCwgQnJlYWtTdGF0ZW1lbnQsIENhbGxFeHByZXNzaW9uLCBDYXRjaENsYXVzZSwgQ2xhc3NCb2R5LCBDbGFzc0V4cHJlc3Npb24sXG5cdENvbmRpdGlvbmFsRXhwcmVzc2lvbiwgRGVidWdnZXJTdGF0ZW1lbnQsIEZvck9mU3RhdGVtZW50LCBGb3JTdGF0ZW1lbnQsIEZ1bmN0aW9uRXhwcmVzc2lvbixcblx0SWRlbnRpZmllciwgSWZTdGF0ZW1lbnQsIExpdGVyYWwsIExvZ2ljYWxFeHByZXNzaW9uLCBNZW1iZXJFeHByZXNzaW9uLCBNZXRob2REZWZpbml0aW9uLFxuXHROZXdFeHByZXNzaW9uLCBPYmplY3RFeHByZXNzaW9uLCBQcm9wZXJ0eSwgUmV0dXJuU3RhdGVtZW50LCBTcHJlYWRFbGVtZW50LCBTd2l0Y2hDYXNlLFxuXHRTd2l0Y2hTdGF0ZW1lbnQsIFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbiwgVGVtcGxhdGVFbGVtZW50LCBUZW1wbGF0ZUxpdGVyYWwsIFRoaXNFeHByZXNzaW9uLFxuXHRUaHJvd1N0YXRlbWVudCwgVHJ5U3RhdGVtZW50LCBWYXJpYWJsZURlY2xhcmF0aW9uLCBVbmFyeUV4cHJlc3Npb24sIFZhcmlhYmxlRGVjbGFyYXRvcixcblx0WWllbGRFeHByZXNzaW9ufSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7aWRlbnRpZmllciwgbWVtYmVyLCBwcm9wZXJ0eUlkT3JMaXRlcmFsfSBmcm9tICdlc2FzdC9kaXN0L3V0aWwnXG5pbXBvcnQge29wdGlvbnN9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtBc3NpZ25TaW5nbGUsIENhbGwsIENvbnN0cnVjdG9yLCBGdW5zLCBMb2dpY3MsIE1lbWJlciwgTG9jYWxEZWNsYXJlcywgUGF0dGVybiwgU2V0dGVycyxcblx0U3BlY2lhbERvcywgU3BlY2lhbFZhbHN9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHthc3NlcnQsIGNhdCwgZmxhdE1hcCwgZmxhdE9wTWFwLCBpZkVsc2UsIGltcGxlbWVudE1hbnksIGlzRW1wdHksIG9wSWYsIG9wTWFwLCB0YWlsXG5cdH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7QXJyYXlTbGljZUNhbGwsIERlY2xhcmVCdWlsdEJhZywgRGVjbGFyZUJ1aWx0TWFwLCBEZWNsYXJlQnVpbHRPYmosIERlY2xhcmVMZXhpY2FsVGhpcyxcblx0RXhwb3J0c0RlZmF1bHQsIElkQXJndW1lbnRzLCBJZEJ1aWx0LCBJZEV4cG9ydHMsIElkRXh0cmFjdCwgSWRGb2N1cywgSWRMZXhpY2FsVGhpcywgSWRTdXBlcixcblx0R2xvYmFsRXJyb3IsIEdsb2JhbEluZmluaXR5LCBMaXRFbXB0eVN0cmluZywgTGl0TnVsbCwgTGl0U3RyVGhyb3csIExpdFplcm8sIFJldHVybkJ1aWx0LFxuXHRSZXR1cm5Gb2N1cywgU3dpdGNoQ2FzZU5vTWF0Y2gsIFRocm93QXNzZXJ0RmFpbCwgVGhyb3dOb0Nhc2VNYXRjaH0gZnJvbSAnLi9hc3QtY29uc3RhbnRzJ1xuaW1wb3J0IHtpc0luQ29uc3RydWN0b3IsIGlzSW5HZW5lcmF0b3IsIHNldHVwLCB0ZWFyRG93biwgdmVyaWZ5UmVzdWx0cywgd2l0aEluQ29uc3RydWN0b3IsXG5cdHdpdGhJbkdlbmVyYXRvcn0gZnJvbSAnLi9jb250ZXh0J1xuaW1wb3J0IHt0cmFuc3BpbGVNZXRob2RUb0RlZmluaXRpb24sIHRyYW5zcGlsZU1ldGhvZFRvUHJvcGVydHl9IGZyb20gJy4vdHJhbnNwaWxlTWV0aG9kJ1xuaW1wb3J0IHRyYW5zcGlsZU1vZHVsZSBmcm9tICcuL3RyYW5zcGlsZU1vZHVsZSdcbmltcG9ydCB7YWNjZXNzTG9jYWxEZWNsYXJlLCBibG9ja1dyYXAsIGJsb2NrV3JhcElmVmFsLCBkZWNsYXJlLCBkb1Rocm93LCBpZEZvckRlY2xhcmVDYWNoZWQsXG5cdGxhenlXcmFwLCBtYWtlRGVjbGFyYXRvciwgbWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMsIG1heWJlV3JhcEluQ2hlY2tDb250YWlucyxcblx0bWVtYmVyU3RyaW5nT3JWYWwsIG1zQ2FsbCwgbXNNZW1iZXIsIG9wVHlwZUNoZWNrRm9yTG9jYWxEZWNsYXJlLCB0MCwgdDEsIHQyLCB0MywgdExpbmVzLFxuXHR0cmFuc3BpbGVOYW1lfSBmcm9tICcuL3V0aWwnXG5cbi8qKiBUcmFuc2Zvcm0gYSB7QGxpbmsgTXNBc3R9IGludG8gYW4gZXNhc3QuICoqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhbnNwaWxlKG1vZHVsZUV4cHJlc3Npb24sIHZlcmlmeVJlc3VsdHMpIHtcblx0c2V0dXAodmVyaWZ5UmVzdWx0cylcblx0Y29uc3QgcmVzID0gdDAobW9kdWxlRXhwcmVzc2lvbilcblx0dGVhckRvd24oKVxuXHRyZXR1cm4gcmVzXG59XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ3RyYW5zcGlsZScsIHtcblx0QXNzZXJ0KCkge1xuXHRcdGNvbnN0IGZhaWxDb25kID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgY29uZCA9IHQwKHRoaXMuY29uZGl0aW9uKVxuXHRcdFx0cmV0dXJuIHRoaXMubmVnYXRlID8gY29uZCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCBjb25kKVxuXHRcdH1cblxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcFRocm93bixcblx0XHRcdF8gPT4gbmV3IElmU3RhdGVtZW50KGZhaWxDb25kKCksIGRvVGhyb3coXykpLFxuXHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5jb25kaXRpb24gaW5zdGFuY2VvZiBDYWxsKSB7XG5cdFx0XHRcdFx0Y29uc3QgY2FsbCA9IHRoaXMuY29uZGl0aW9uXG5cdFx0XHRcdFx0Y29uc3QgY2FsbGVkID0gY2FsbC5jYWxsZWRcblx0XHRcdFx0XHRjb25zdCBhcmdzID0gY2FsbC5hcmdzLm1hcCh0MClcblx0XHRcdFx0XHRpZiAoY2FsbGVkIGluc3RhbmNlb2YgTWVtYmVyKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBhc3MgPSB0aGlzLm5lZ2F0ZSA/ICdhc3NlcnROb3RNZW1iZXInIDogJ2Fzc2VydE1lbWJlcidcblx0XHRcdFx0XHRcdHJldHVybiBtc0NhbGwoYXNzLCB0MChjYWxsZWQub2JqZWN0KSwgdHJhbnNwaWxlTmFtZShjYWxsZWQubmFtZSksIC4uLmFyZ3MpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnN0IGFzcyA9IHRoaXMubmVnYXRlID8gJ2Fzc2VydE5vdCcgOiAnYXNzZXJ0J1xuXHRcdFx0XHRcdFx0cmV0dXJuIG1zQ2FsbChhc3MsIHQwKGNhbGxlZCksIC4uLmFyZ3MpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KGZhaWxDb25kKCksIFRocm93QXNzZXJ0RmFpbClcblx0XHRcdH0pXG5cdH0sXG5cblx0QXNzaWduU2luZ2xlKHZhbFdyYXApIHtcblx0XHRjb25zdCB2YWwgPSB2YWxXcmFwID09PSB1bmRlZmluZWQgPyB0MCh0aGlzLnZhbHVlKSA6IHZhbFdyYXAodDAodGhpcy52YWx1ZSkpXG5cdFx0Y29uc3QgZGVjbGFyZSA9IG1ha2VEZWNsYXJhdG9yKHRoaXMuYXNzaWduZWUsIHZhbCwgZmFsc2UpXG5cdFx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKHRoaXMuYXNzaWduZWUuaXNNdXRhYmxlKCkgPyAnbGV0JyA6ICdjb25zdCcsIFtkZWNsYXJlXSlcblx0fSxcblx0Ly8gVE9ETzpFUzYgSnVzdCB1c2UgbmF0aXZlIGRlc3RydWN0dXJpbmcgYXNzaWduXG5cdEFzc2lnbkRlc3RydWN0dXJlKCkge1xuXHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbihcblx0XHRcdHRoaXMua2luZCgpID09PSBMb2NhbERlY2xhcmVzLk11dGFibGUgPyAnbGV0JyA6ICdjb25zdCcsXG5cdFx0XHRtYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycyhcblx0XHRcdFx0dGhpcy5hc3NpZ25lZXMsXG5cdFx0XHRcdHRoaXMua2luZCgpID09PSBMb2NhbERlY2xhcmVzLkxhenksXG5cdFx0XHRcdHQwKHRoaXMudmFsdWUpLFxuXHRcdFx0XHRmYWxzZSkpXG5cdH0sXG5cblx0QmFnRW50cnkoKSB7IHJldHVybiBtc0NhbGwoJ2FkZCcsIElkQnVpbHQsIHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdEJhZ0VudHJ5TWFueSgpIHsgcmV0dXJuIG1zQ2FsbCgnYWRkTWFueScsIElkQnVpbHQsIHQwKHRoaXMudmFsdWUpKSB9LFxuXG5cdEJhZ1NpbXBsZSgpIHsgcmV0dXJuIG5ldyBBcnJheUV4cHJlc3Npb24odGhpcy5wYXJ0cy5tYXAodDApKSB9LFxuXG5cdEJsb2NrRG8obGVhZD1udWxsLCBvcFJldHVyblR5cGU9bnVsbCwgZm9sbG93PW51bGwpIHtcblx0XHRhc3NlcnQob3BSZXR1cm5UeXBlID09PSBudWxsKVxuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHRMaW5lcyh0aGlzLmxpbmVzKSwgZm9sbG93KSlcblx0fSxcblxuXHRCbG9ja1ZhbFRocm93KGxlYWQ9bnVsbCwgX29wUmV0dXJuVHlwZSkge1xuXHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHRMaW5lcyh0aGlzLmxpbmVzKSwgdDAodGhpcy50aHJvdykpKVxuXHR9LFxuXG5cdEJsb2NrVmFsUmV0dXJuKGxlYWQ9bnVsbCwgb3BSZXR1cm5UeXBlPW51bGwpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2sodDAodGhpcy5yZXR1cm5lZCksIHRMaW5lcyh0aGlzLmxpbmVzKSwgbGVhZCwgb3BSZXR1cm5UeXBlKVxuXHR9LFxuXG5cdEJsb2NrQmFnKGxlYWQ9bnVsbCwgb3BSZXR1cm5UeXBlPW51bGwpIHtcblx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2soXG5cdFx0XHRJZEJ1aWx0LFxuXHRcdFx0Y2F0KERlY2xhcmVCdWlsdEJhZywgdExpbmVzKHRoaXMubGluZXMpKSxcblx0XHRcdGxlYWQsIG9wUmV0dXJuVHlwZSlcblx0fSxcblxuXHRCbG9ja09iaihsZWFkPW51bGwsIG9wUmV0dXJuVHlwZT1udWxsKSB7XG5cdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrKFxuXHRcdFx0SWRCdWlsdCxcblx0XHRcdGNhdChEZWNsYXJlQnVpbHRPYmosIHRMaW5lcyh0aGlzLmxpbmVzKSksXG5cdFx0XHRsZWFkLCBvcFJldHVyblR5cGUpXG5cdH0sXG5cblx0QmxvY2tNYXAobGVhZD1udWxsLCBvcFJldHVyblR5cGU9bnVsbCkge1xuXHRcdHJldHVybiB0cmFuc3BpbGVCbG9jayhcblx0XHRcdElkQnVpbHQsXG5cdFx0XHRjYXQoRGVjbGFyZUJ1aWx0TWFwLCB0TGluZXModGhpcy5saW5lcykpLFxuXHRcdFx0bGVhZCwgb3BSZXR1cm5UeXBlKVxuXHR9LFxuXG5cdEJsb2NrV3JhcCgpIHtcblx0XHRyZXR1cm4gYmxvY2tXcmFwKHQwKHRoaXMuYmxvY2spKVxuXHR9LFxuXG5cdEJyZWFrKCkge1xuXHRcdHJldHVybiBuZXcgQnJlYWtTdGF0ZW1lbnQoKVxuXHR9LFxuXG5cdEJyZWFrV2l0aFZhbCgpIHtcblx0XHRyZXR1cm4gbmV3IFJldHVyblN0YXRlbWVudCh0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRDYWxsKCkge1xuXHRcdHJldHVybiBuZXcgQ2FsbEV4cHJlc3Npb24odDAodGhpcy5jYWxsZWQpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHRDYXNlKCkge1xuXHRcdGNvbnN0IGJvZHkgPSBjYXNlQm9keSh0aGlzLnBhcnRzLCB0aGlzLm9wRWxzZSlcblx0XHRpZiAodGhpcy5pc1ZhbCkge1xuXHRcdFx0Y29uc3QgYmxvY2sgPSBpZkVsc2UodGhpcy5vcENhc2VkLCBfID0+IFt0MChfKSwgYm9keV0sICgpID0+IFtib2R5XSlcblx0XHRcdHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KGJsb2NrKSlcblx0XHR9IGVsc2Vcblx0XHRcdHJldHVybiBpZkVsc2UodGhpcy5vcENhc2VkLCBfID0+IG5ldyBCbG9ja1N0YXRlbWVudChbdDAoXyksIGJvZHldKSwgKCkgPT4gYm9keSlcblx0fSxcblxuXHRDYXNlUGFydChhbHRlcm5hdGUpIHtcblx0XHRpZiAodGhpcy50ZXN0IGluc3RhbmNlb2YgUGF0dGVybikge1xuXHRcdFx0Y29uc3Qge3R5cGUsIHBhdHRlcm5lZCwgbG9jYWxzfSA9IHRoaXMudGVzdFxuXHRcdFx0Y29uc3QgZGVjbCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRcdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZEV4dHJhY3QsIG1zQ2FsbCgnZXh0cmFjdCcsIHQwKHR5cGUpLCB0MChwYXR0ZXJuZWQpKSldKVxuXHRcdFx0Y29uc3QgdGVzdCA9IG5ldyBCaW5hcnlFeHByZXNzaW9uKCchPT0nLCBJZEV4dHJhY3QsIExpdE51bGwpXG5cdFx0XHRjb25zdCBleHRyYWN0ID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgbG9jYWxzLm1hcCgoXywgaWR4KSA9PlxuXHRcdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKFxuXHRcdFx0XHRcdGlkRm9yRGVjbGFyZUNhY2hlZChfKSxcblx0XHRcdFx0XHRuZXcgTWVtYmVyRXhwcmVzc2lvbihJZEV4dHJhY3QsIG5ldyBMaXRlcmFsKGlkeCkpKSkpXG5cdFx0XHRjb25zdCByZXMgPSB0MSh0aGlzLnJlc3VsdCwgZXh0cmFjdClcblx0XHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoW2RlY2wsIG5ldyBJZlN0YXRlbWVudCh0ZXN0LCByZXMsIGFsdGVybmF0ZSldKVxuXHRcdH0gZWxzZVxuXHRcdFx0Ly8gYWx0ZXJuYXRlIHdyaXR0ZW4gdG8gYnkgYGNhc2VCb2R5YC5cblx0XHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQodDAodGhpcy50ZXN0KSwgdDAodGhpcy5yZXN1bHQpLCBhbHRlcm5hdGUpXG5cdH0sXG5cblx0Q2xhc3MoKSB7XG5cdFx0Y29uc3QgbWV0aG9kcyA9IGNhdChcblx0XHRcdHRoaXMuc3RhdGljcy5tYXAoXyA9PiB0cmFuc3BpbGVNZXRob2RUb0RlZmluaXRpb24oXywgdHJ1ZSkpLFxuXHRcdFx0b3BNYXAodGhpcy5vcENvbnN0cnVjdG9yLCB0MCksXG5cdFx0XHR0aGlzLm1ldGhvZHMubWFwKF8gPT4gdHJhbnNwaWxlTWV0aG9kVG9EZWZpbml0aW9uKF8sIGZhbHNlKSkpXG5cdFx0Y29uc3Qgb3BOYW1lID0gb3BNYXAodmVyaWZ5UmVzdWx0cy5vcE5hbWUodGhpcyksIGlkZW50aWZpZXIpXG5cdFx0Y29uc3QgY2xhc3NFeHByID0gbmV3IENsYXNzRXhwcmVzc2lvbihvcE5hbWUsXG5cdFx0XHRvcE1hcCh0aGlzLm9wU3VwZXJDbGFzcywgdDApLCBuZXcgQ2xhc3NCb2R5KG1ldGhvZHMpKVxuXG5cdFx0aWYgKHRoaXMub3BEbyA9PT0gbnVsbCAmJiBpc0VtcHR5KHRoaXMua2luZHMpKVxuXHRcdFx0cmV0dXJuIGNsYXNzRXhwclxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgbGVhZCA9IGNhdChcblx0XHRcdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgW1xuXHRcdFx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRGb2N1cywgY2xhc3NFeHByKV0pLFxuXHRcdFx0XHR0aGlzLmtpbmRzLm1hcChfID0+IG1zQ2FsbCgna2luZERvJywgSWRGb2N1cywgdDAoXykpKSlcblx0XHRcdGNvbnN0IGJsb2NrID0gaWZFbHNlKHRoaXMub3BEbyxcblx0XHRcdFx0XyA9PiB0MyhfLmJsb2NrLCBsZWFkLCBudWxsLCBSZXR1cm5Gb2N1cyksXG5cdFx0XHRcdCgpID0+IG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgUmV0dXJuRm9jdXMpKSlcblx0XHRcdHJldHVybiBibG9ja1dyYXAoYmxvY2spXG5cdFx0fVxuXHR9LFxuXG5cdENvbmQoKSB7XG5cdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odDAodGhpcy50ZXN0KSwgdDAodGhpcy5pZlRydWUpLCB0MCh0aGlzLmlmRmFsc2UpKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsKCkge1xuXHRcdGNvbnN0IHRlc3QgPSB0MCh0aGlzLnRlc3QpXG5cdFx0Y29uc3QgcmVzID0gdDAodGhpcy5yZXN1bHQpXG5cdFx0aWYgKHRoaXMuaXNWYWwpIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IG1zQ2FsbCgnc29tZScsIGJsb2NrV3JhcChyZXMpKVxuXHRcdFx0Y29uc3Qgbm9uZSA9IG1zTWVtYmVyKCdOb25lJylcblx0XHRcdGNvbnN0IFt0aGVuLCBfZWxzZV0gPSB0aGlzLmlzVW5sZXNzID8gW25vbmUsIHJlc3VsdF0gOiBbcmVzdWx0LCBub25lXVxuXHRcdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odGVzdCwgdGhlbiwgX2Vsc2UpXG5cdFx0fSBlbHNlXG5cdFx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KHRoaXMuaXNVbmxlc3MgPyBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgdGVzdCkgOiB0ZXN0LCByZXMpXG5cdH0sXG5cblx0Q29uc3RydWN0b3IoKSB7XG5cdFx0cmV0dXJuIHdpdGhJbkNvbnN0cnVjdG9yKCgpID0+IHtcblx0XHRcdC8vIElmIHRoZXJlIGlzIGEgYHN1cGVyIWAsIGB0aGlzYCB3aWxsIG5vdCBiZSBkZWZpbmVkIHVudGlsIHRoZW4sXG5cdFx0XHQvLyBzbyBtdXN0IHdhaXQgdW50aWwgdGhlbi5cblx0XHRcdC8vIE90aGVyd2lzZSwgZG8gaXQgYXQgdGhlIGJlZ2lubmluZy5cblx0XHRcdGNvbnN0IGJvZHkgPSB2ZXJpZnlSZXN1bHRzLmNvbnN0cnVjdG9yVG9TdXBlci5oYXModGhpcykgP1xuXHRcdFx0XHR0MCh0aGlzLmZ1bikgOlxuXHRcdFx0XHR0MSh0aGlzLmZ1biwgY29uc3RydWN0b3JTZXRNZW1iZXJzKHRoaXMpKVxuXG5cdFx0XHRyZXR1cm4gTWV0aG9kRGVmaW5pdGlvbi5jb25zdHJ1Y3Rvcihib2R5KVxuXHRcdH0pXG5cdH0sXG5cblx0Q2F0Y2goKSB7XG5cdFx0cmV0dXJuIG5ldyBDYXRjaENsYXVzZSh0MCh0aGlzLmNhdWdodCksIHQwKHRoaXMuYmxvY2spKVxuXHR9LFxuXG5cdEV4Y2VwdCgpIHtcblx0XHRyZXR1cm4gYmxvY2tXcmFwSWZWYWwodGhpcy5pc1ZhbCwgbmV3IFRyeVN0YXRlbWVudChcblx0XHRcdHQwKHRoaXMudHJ5KSxcblx0XHRcdG9wTWFwKHRoaXMuY2F0Y2gsIHQwKSxcblx0XHRcdG9wTWFwKHRoaXMuZmluYWxseSwgdDApKSlcblx0fSxcblxuXHRGb3IoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcElmVmFsKHRoaXMuaXNWYWwsIGZvckxvb3AodGhpcy5vcEl0ZXJhdGVlLCB0aGlzLmJsb2NrKSlcblx0fSxcblxuXHRGb3JCYWcoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW1xuXHRcdFx0RGVjbGFyZUJ1aWx0QmFnLFxuXHRcdFx0Zm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spLFxuXHRcdFx0UmV0dXJuQnVpbHRcblx0XHRdKSlcblx0fSxcblxuXHQvLyBsZWFkU3RhdGVtZW50cyBjb21lcyBmcm9tIGNvbnN0cnVjdG9yIG1lbWJlcnNcblx0RnVuKGxlYWRTdGF0ZW1lbnRzPW51bGwpIHtcblx0XHRjb25zdCBpc0dlbmVyYXRvckZ1biA9IHRoaXMua2luZCAhPT0gRnVucy5QbGFpblxuXHRcdHJldHVybiB3aXRoSW5HZW5lcmF0b3IoaXNHZW5lcmF0b3JGdW4sICgpID0+IHtcblx0XHRcdC8vIFRPRE86RVM2IHVzZSBgLi4uYGZcblx0XHRcdGNvbnN0IG5BcmdzID0gbmV3IExpdGVyYWwodGhpcy5hcmdzLmxlbmd0aClcblx0XHRcdGNvbnN0IG9wRGVjbGFyZVJlc3QgPSBvcE1hcCh0aGlzLm9wUmVzdEFyZywgcmVzdCA9PlxuXHRcdFx0XHRkZWNsYXJlKHJlc3QsIG5ldyBDYWxsRXhwcmVzc2lvbihBcnJheVNsaWNlQ2FsbCwgW0lkQXJndW1lbnRzLCBuQXJnc10pKSlcblx0XHRcdGNvbnN0IGFyZ0NoZWNrcyA9IG9wSWYob3B0aW9ucy5pbmNsdWRlQ2hlY2tzKCksICgpID0+XG5cdFx0XHRcdGZsYXRPcE1hcCh0aGlzLmFyZ3MsIG9wVHlwZUNoZWNrRm9yTG9jYWxEZWNsYXJlKSlcblxuXHRcdFx0Y29uc3Qgb3BEZWNsYXJlVGhpcyA9XG5cdFx0XHRcdG9wSWYoIWlzSW5Db25zdHJ1Y3RvciAmJiB0aGlzLm9wRGVjbGFyZVRoaXMgIT0gbnVsbCwgKCkgPT4gRGVjbGFyZUxleGljYWxUaGlzKVxuXG5cdFx0XHRjb25zdCBsZWFkID0gY2F0KGxlYWRTdGF0ZW1lbnRzLCBvcERlY2xhcmVUaGlzLCBvcERlY2xhcmVSZXN0LCBhcmdDaGVja3MpXG5cblx0XHRcdGNvbnN0IGJvZHkgPSgpID0+IHQyKHRoaXMuYmxvY2ssIGxlYWQsIHRoaXMub3BSZXR1cm5UeXBlKVxuXHRcdFx0Y29uc3QgYXJncyA9IHRoaXMuYXJncy5tYXAodDApXG5cdFx0XHRjb25zdCBpZCA9IG9wTWFwKHZlcmlmeVJlc3VsdHMub3BOYW1lKHRoaXMpLCBpZGVudGlmaWVyKVxuXG5cdFx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0XHRjYXNlIEZ1bnMuUGxhaW46XG5cdFx0XHRcdFx0Ly8gVE9ETzpFUzYgU2hvdWxkIGJlIGFibGUgdG8gdXNlIHJlc3QgYXJncyBpbiBhcnJvdyBmdW5jdGlvblxuXHRcdFx0XHRcdGlmIChpZCA9PT0gbnVsbCAmJiB0aGlzLm9wRGVjbGFyZVRoaXMgPT09IG51bGwgJiYgb3BEZWNsYXJlUmVzdCA9PT0gbnVsbClcblx0XHRcdFx0XHRcdHJldHVybiBuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oYXJncywgYm9keSgpKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHJldHVybiBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKGlkLCBhcmdzLCBib2R5KCkpXG5cdFx0XHRcdGNhc2UgRnVucy5Bc3luYzoge1xuXHRcdFx0XHRcdGNvbnN0IHBsYWluQm9keSA9IHQyKHRoaXMuYmxvY2ssIG51bGwsIHRoaXMub3BSZXR1cm5UeXBlKVxuXHRcdFx0XHRcdGNvbnN0IGdlbkZ1bmMgPSBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKGlkLCBbXSwgcGxhaW5Cb2R5LCB0cnVlKVxuXHRcdFx0XHRcdGNvbnN0IHJldCA9IG5ldyBSZXR1cm5TdGF0ZW1lbnQobXNDYWxsKCdhc3luYycsIGdlbkZ1bmMpKVxuXHRcdFx0XHRcdHJldHVybiBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKGlkLCBhcmdzLCBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHJldCkpKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgRnVucy5HZW5lcmF0b3I6XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIGFyZ3MsIGJvZHkoKSwgdHJ1ZSlcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IodGhpcy5raW5kKVxuXHRcdFx0fVxuXHRcdH0pXG5cdH0sXG5cblx0SWdub3JlKCkge1xuXHRcdHJldHVybiBbXVxuXHR9LFxuXG5cdEtpbmQoKSB7XG5cdFx0Y29uc3QgbmFtZSA9IG5ldyBMaXRlcmFsKHZlcmlmeVJlc3VsdHMubmFtZSh0aGlzKSlcblx0XHRjb25zdCBzdXBlcnMgPSBuZXcgQXJyYXlFeHByZXNzaW9uKHRoaXMuc3VwZXJLaW5kcy5tYXAodDApKVxuXHRcdGNvbnN0IG1ldGhvZHMgPSBfID0+XG5cdFx0XHRuZXcgT2JqZWN0RXhwcmVzc2lvbihfLm1hcCh0cmFuc3BpbGVNZXRob2RUb1Byb3BlcnR5KSlcblx0XHRjb25zdCBraW5kID0gbXNDYWxsKCdraW5kJywgbmFtZSwgc3VwZXJzLCBtZXRob2RzKHRoaXMuc3RhdGljcyksIG1ldGhvZHModGhpcy5tZXRob2RzKSlcblxuXHRcdGlmICh0aGlzLm9wRG8gPT09IG51bGwpXG5cdFx0XHRyZXR1cm4ga2luZFxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgbGVhZCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsXG5cdFx0XHRcdFtuZXcgVmFyaWFibGVEZWNsYXJhdG9yKElkRm9jdXMsIGtpbmQpXSlcblx0XHRcdHJldHVybiBibG9ja1dyYXAodDModGhpcy5vcERvLmJsb2NrLCBsZWFkLCBudWxsLCBSZXR1cm5Gb2N1cykpXG5cdFx0fVxuXHR9LFxuXG5cdExhenkoKSB7XG5cdFx0cmV0dXJuIGxhenlXcmFwKHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdE51bWJlckxpdGVyYWwoKSB7XG5cdFx0Ly8gTmVnYXRpdmUgbnVtYmVycyBhcmUgbm90IHBhcnQgb2YgRVMgc3BlYy5cblx0XHQvLyBodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNS4xLyNzZWMtNy44LjNcblx0XHRjb25zdCB2YWx1ZSA9IE51bWJlcih0aGlzLnZhbHVlKVxuXHRcdGNvbnN0IGxpdCA9IG5ldyBMaXRlcmFsKE1hdGguYWJzKHZhbHVlKSlcblx0XHRjb25zdCBpc1Bvc2l0aXZlID0gdmFsdWUgPj0gMCAmJiAxIC8gdmFsdWUgIT09IC1JbmZpbml0eVxuXHRcdHJldHVybiBpc1Bvc2l0aXZlID8gbGl0IDogbmV3IFVuYXJ5RXhwcmVzc2lvbignLScsIGxpdClcblx0fSxcblxuXHRMb2NhbEFjY2VzcygpIHtcblx0XHRpZiAodGhpcy5uYW1lID09PSAndGhpcycpXG5cdFx0XHRyZXR1cm4gaXNJbkNvbnN0cnVjdG9yID8gbmV3IFRoaXNFeHByZXNzaW9uKCkgOiBJZExleGljYWxUaGlzXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBsZCA9IHZlcmlmeVJlc3VsdHMubG9jYWxEZWNsYXJlRm9yQWNjZXNzKHRoaXMpXG5cdFx0XHQvLyBJZiBsZCBtaXNzaW5nLCB0aGlzIGlzIGEgYnVpbHRpbiwgYW5kIGJ1aWx0aW5zIGFyZSBuZXZlciBsYXp5XG5cdFx0XHRyZXR1cm4gbGQgPT09IHVuZGVmaW5lZCA/IGlkZW50aWZpZXIodGhpcy5uYW1lKSA6IGFjY2Vzc0xvY2FsRGVjbGFyZShsZClcblx0XHR9XG5cdH0sXG5cblx0TG9jYWxEZWNsYXJlKCkgeyByZXR1cm4gbmV3IElkZW50aWZpZXIoaWRGb3JEZWNsYXJlQ2FjaGVkKHRoaXMpLm5hbWUpIH0sXG5cblx0TG9jYWxNdXRhdGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIGlkZW50aWZpZXIodGhpcy5uYW1lKSwgdDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0TG9naWMoKSB7XG5cdFx0Y29uc3Qgb3AgPSB0aGlzLmtpbmQgPT09IExvZ2ljcy5BbmQgPyAnJiYnIDogJ3x8J1xuXHRcdHJldHVybiB0YWlsKHRoaXMuYXJncykucmVkdWNlKChhLCBiKSA9PlxuXHRcdFx0bmV3IExvZ2ljYWxFeHByZXNzaW9uKG9wLCBhLCB0MChiKSksIHQwKHRoaXMuYXJnc1swXSkpXG5cdH0sXG5cblx0TWFwRW50cnkoKSB7IHJldHVybiBtc0NhbGwoJ3NldFN1YicsIElkQnVpbHQsIHQwKHRoaXMua2V5KSwgdDAodGhpcy52YWwpKSB9LFxuXG5cdE1lbWJlcigpIHtcblx0XHRyZXR1cm4gbWVtYmVyU3RyaW5nT3JWYWwodDAodGhpcy5vYmplY3QpLCB0aGlzLm5hbWUpXG5cdH0sXG5cblx0TWVtYmVyRnVuKCkge1xuXHRcdGNvbnN0IG5hbWUgPSB0cmFuc3BpbGVOYW1lKHRoaXMubmFtZSlcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BPYmplY3QsXG5cdFx0XHRfID0+IG1zQ2FsbCgnbWV0aG9kQm91bmQnLCB0MChfKSwgbmFtZSksXG5cdFx0XHQoKSA9PiBtc0NhbGwoJ21ldGhvZFVuYm91bmQnLCBuYW1lKSlcblx0fSxcblxuXHRNZW1iZXJTZXQoKSB7XG5cdFx0Y29uc3Qgb2JqID0gdDAodGhpcy5vYmplY3QpXG5cdFx0Y29uc3QgdmFsID0gbWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHQwKHRoaXMudmFsdWUpLCB0aGlzLm9wVHlwZSwgdGhpcy5uYW1lKVxuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIFNldHRlcnMuSW5pdDpcblx0XHRcdFx0cmV0dXJuIG1zQ2FsbCgnbmV3UHJvcGVydHknLCBvYmosIHRyYW5zcGlsZU5hbWUodGhpcy5uYW1lKSwgdmFsKVxuXHRcdFx0Y2FzZSBTZXR0ZXJzLkluaXRNdXRhYmxlOlxuXHRcdFx0XHRyZXR1cm4gbXNDYWxsKCduZXdNdXRhYmxlUHJvcGVydHknLCBvYmosIHRyYW5zcGlsZU5hbWUodGhpcy5uYW1lKSwgdmFsKVxuXHRcdFx0Y2FzZSBTZXR0ZXJzLk11dGF0ZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlclN0cmluZ09yVmFsKG9iaiwgdGhpcy5uYW1lKSwgdmFsKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKClcblx0XHR9XG5cdH0sXG5cblx0TW9kdWxlOiB0cmFuc3BpbGVNb2R1bGUsXG5cblx0TW9kdWxlRXhwb3J0TmFtZWQoKSB7XG5cdFx0cmV0dXJuIHQxKHRoaXMuYXNzaWduLCB2YWwgPT5cblx0XHRcdG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlcihJZEV4cG9ydHMsIHRoaXMuYXNzaWduLmFzc2lnbmVlLm5hbWUpLCB2YWwpKVxuXHR9LFxuXG5cdE1vZHVsZUV4cG9ydERlZmF1bHQoKSB7XG5cdFx0cmV0dXJuIHQxKHRoaXMuYXNzaWduLCB2YWwgPT4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgRXhwb3J0c0RlZmF1bHQsIHZhbCkpXG5cdH0sXG5cblx0TmV3KCkge1xuXHRcdHJldHVybiBuZXcgTmV3RXhwcmVzc2lvbih0MCh0aGlzLnR5cGUpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHROb3QoKSB7IHJldHVybiBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgdDAodGhpcy5hcmcpKSB9LFxuXG5cdE9iakVudHJ5QXNzaWduKCkge1xuXHRcdHJldHVybiB0aGlzLmFzc2lnbiBpbnN0YW5jZW9mIEFzc2lnblNpbmdsZSAmJiAhdGhpcy5hc3NpZ24uYXNzaWduZWUuaXNMYXp5KCkgP1xuXHRcdFx0dDEodGhpcy5hc3NpZ24sIHZhbCA9PlxuXHRcdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRCdWlsdCwgdGhpcy5hc3NpZ24uYXNzaWduZWUubmFtZSksIHZhbCkpIDpcblx0XHRcdGNhdChcblx0XHRcdFx0dDAodGhpcy5hc3NpZ24pLFxuXHRcdFx0XHR0aGlzLmFzc2lnbi5hbGxBc3NpZ25lZXMoKS5tYXAoXyA9PlxuXHRcdFx0XHRcdG1zQ2FsbCgnc2V0TGF6eScsIElkQnVpbHQsIG5ldyBMaXRlcmFsKF8ubmFtZSksIGlkRm9yRGVjbGFyZUNhY2hlZChfKSkpKVxuXHR9LFxuXG5cdE9iakVudHJ5UGxhaW4oKSB7XG5cdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlclN0cmluZ09yVmFsKElkQnVpbHQsIHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdE9ialNpbXBsZSgpIHtcblx0XHRyZXR1cm4gbmV3IE9iamVjdEV4cHJlc3Npb24odGhpcy5wYWlycy5tYXAocGFpciA9PlxuXHRcdFx0bmV3IFByb3BlcnR5KCdpbml0JywgcHJvcGVydHlJZE9yTGl0ZXJhbChwYWlyLmtleSksIHQwKHBhaXIudmFsdWUpKSkpXG5cdH0sXG5cblx0R2V0dGVyRnVuKCkge1xuXHRcdC8vIF8gPT4gXy5mb29cblx0XHRyZXR1cm4gbmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKFtJZEZvY3VzXSwgbWVtYmVyU3RyaW5nT3JWYWwoSWRGb2N1cywgdGhpcy5uYW1lKSlcblx0fSxcblxuXHRRdW90ZVBsYWluKCkge1xuXHRcdGlmICh0aGlzLnBhcnRzLmxlbmd0aCA9PT0gMClcblx0XHRcdHJldHVybiBMaXRFbXB0eVN0cmluZ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgcXVhc2lzID0gW10sIGV4cHJlc3Npb25zID0gW11cblxuXHRcdFx0Ly8gVGVtcGxhdGVMaXRlcmFsIG11c3Qgc3RhcnQgd2l0aCBhIFRlbXBsYXRlRWxlbWVudFxuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLnBhcnRzWzBdICE9PSAnc3RyaW5nJylcblx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmVtcHR5KVxuXG5cdFx0XHRmb3IgKGxldCBwYXJ0IG9mIHRoaXMucGFydHMpXG5cdFx0XHRcdGlmICh0eXBlb2YgcGFydCA9PT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmZvclJhd1N0cmluZyhwYXJ0KSlcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Ly8gXCJ7MX17MX1cIiBuZWVkcyBhbiBlbXB0eSBxdWFzaSBpbiB0aGUgbWlkZGxlIChhbmQgb24gdGhlIGVuZHMpXG5cdFx0XHRcdFx0aWYgKHF1YXNpcy5sZW5ndGggPT09IGV4cHJlc3Npb25zLmxlbmd0aClcblx0XHRcdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5lbXB0eSlcblx0XHRcdFx0XHRleHByZXNzaW9ucy5wdXNoKHQwKHBhcnQpKVxuXHRcdFx0XHR9XG5cblx0XHRcdC8vIFRlbXBsYXRlTGl0ZXJhbCBtdXN0IGVuZCB3aXRoIGEgVGVtcGxhdGVFbGVtZW50LCBzbyBvbmUgbW9yZSBxdWFzaSB0aGFuIGV4cHJlc3Npb24uXG5cdFx0XHRpZiAocXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoKVxuXHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZW1wdHkpXG5cblx0XHRcdHJldHVybiBuZXcgVGVtcGxhdGVMaXRlcmFsKHF1YXNpcywgZXhwcmVzc2lvbnMpXG5cdFx0fVxuXHR9LFxuXG5cdFF1b3RlU2ltcGxlKCkge1xuXHRcdHJldHVybiBuZXcgTGl0ZXJhbCh0aGlzLm5hbWUpXG5cdH0sXG5cblx0UXVvdGVUYWdnZWRUZW1wbGF0ZSgpIHtcblx0XHRyZXR1cm4gbmV3IFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbih0MCh0aGlzLnRhZyksIHQwKHRoaXMucXVvdGUpKVxuXHR9LFxuXG5cdFJhbmdlKCkge1xuXHRcdGNvbnN0IGVuZCA9IGlmRWxzZSh0aGlzLmVuZCwgdDAsICgpID0+IEdsb2JhbEluZmluaXR5KVxuXHRcdHJldHVybiBtc0NhbGwoJ3JhbmdlJywgdDAodGhpcy5zdGFydCksIGVuZCwgbmV3IExpdGVyYWwodGhpcy5pc0V4Y2x1c2l2ZSkpXG5cdH0sXG5cblx0U2V0U3ViKCkge1xuXHRcdGNvbnN0IGdldEtpbmQgPSAoKSA9PiB7XG5cdFx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0XHRjYXNlIFNldHRlcnMuSW5pdDpcblx0XHRcdFx0XHRyZXR1cm4gJ2luaXQnXG5cdFx0XHRcdGNhc2UgU2V0dGVycy5Jbml0TXV0YWJsZTpcblx0XHRcdFx0XHRyZXR1cm4gJ2luaXQtbXV0YWJsZSdcblx0XHRcdFx0Y2FzZSBTZXR0ZXJzLk11dGF0ZTpcblx0XHRcdFx0XHRyZXR1cm4gJ211dGF0ZSdcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRjb25zdCBraW5kID0gZ2V0S2luZCgpXG5cdFx0cmV0dXJuIG1zQ2FsbChcblx0XHRcdCdzZXRTdWInLFxuXHRcdFx0dDAodGhpcy5vYmplY3QpLFxuXHRcdFx0dGhpcy5zdWJiZWRzLmxlbmd0aCA9PT0gMSA/IHQwKHRoaXMuc3ViYmVkc1swXSkgOiB0aGlzLnN1YmJlZHMubWFwKHQwKSxcblx0XHRcdG1heWJlV3JhcEluQ2hlY2tDb250YWlucyh0MCh0aGlzLnZhbHVlKSwgdGhpcy5vcFR5cGUsICd2YWx1ZScpLFxuXHRcdFx0bmV3IExpdGVyYWwoa2luZCkpXG5cdH0sXG5cblx0U3BlY2lhbERvKCkge1xuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIFNwZWNpYWxEb3MuRGVidWdnZXI6IHJldHVybiBuZXcgRGVidWdnZXJTdGF0ZW1lbnQoKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHR9XG5cdH0sXG5cblx0U3BlY2lhbFZhbCgpIHtcblx0XHQvLyBNYWtlIG5ldyBvYmplY3RzIGJlY2F1c2Ugd2Ugd2lsbCBhc3NpZ24gYGxvY2AgdG8gdGhlbS5cblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5Db250YWluczpcblx0XHRcdFx0cmV0dXJuIG1zTWVtYmVyKCdjb250YWlucycpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLkRlbFN1Yjpcblx0XHRcdFx0cmV0dXJuIG1zTWVtYmVyKCdkZWxTdWInKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5GYWxzZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKGZhbHNlKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5OYW1lOlxuXHRcdFx0XHRyZXR1cm4gbmV3IExpdGVyYWwodmVyaWZ5UmVzdWx0cy5uYW1lKHRoaXMpKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5OdWxsOlxuXHRcdFx0XHRyZXR1cm4gbmV3IExpdGVyYWwobnVsbClcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuU3ViOlxuXHRcdFx0XHRyZXR1cm4gbXNNZW1iZXIoJ3N1YicpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLlRydWU6XG5cdFx0XHRcdHJldHVybiBuZXcgTGl0ZXJhbCh0cnVlKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5VbmRlZmluZWQ6XG5cdFx0XHRcdHJldHVybiBuZXcgVW5hcnlFeHByZXNzaW9uKCd2b2lkJywgTGl0WmVybylcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcih0aGlzLmtpbmQpXG5cdFx0fVxuXHR9LFxuXG5cdFNwcmVhZCgpIHtcblx0XHRyZXR1cm4gbmV3IFNwcmVhZEVsZW1lbnQodDAodGhpcy5zcHJlYWRlZCkpXG5cdH0sXG5cblx0U3VwZXJDYWxsKCkge1xuXHRcdGNvbnN0IGFyZ3MgPSB0aGlzLmFyZ3MubWFwKHQwKVxuXHRcdGNvbnN0IG1ldGhvZCA9IHZlcmlmeVJlc3VsdHMuc3VwZXJDYWxsVG9NZXRob2QuZ2V0KHRoaXMpXG5cblx0XHRpZiAobWV0aG9kIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpIHtcblx0XHRcdGNvbnN0IGNhbGwgPSBuZXcgQ2FsbEV4cHJlc3Npb24oSWRTdXBlciwgYXJncylcblx0XHRcdGNvbnN0IG1lbWJlclNldHMgPSBjb25zdHJ1Y3RvclNldE1lbWJlcnMobWV0aG9kKVxuXHRcdFx0cmV0dXJuIGNhdChjYWxsLCBtZW1iZXJTZXRzKVxuXHRcdH0gZWxzZVxuXHRcdFx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbihtZW1iZXJTdHJpbmdPclZhbChJZFN1cGVyLCBtZXRob2Quc3ltYm9sKSwgYXJncylcblx0fSxcblxuXHRTdXBlck1lbWJlcigpIHtcblx0XHRyZXR1cm4gbWVtYmVyU3RyaW5nT3JWYWwoSWRTdXBlciwgdGhpcy5uYW1lKVxuXHR9LFxuXG5cdFN3aXRjaCgpIHtcblx0XHRjb25zdCBwYXJ0cyA9IGZsYXRNYXAodGhpcy5wYXJ0cywgdDApXG5cdFx0cGFydHMucHVzaChpZkVsc2UodGhpcy5vcEVsc2UsXG5cdFx0XHRfID0+IG5ldyBTd2l0Y2hDYXNlKHVuZGVmaW5lZCwgdDAoXykuYm9keSksXG5cdFx0XHQoKSA9PiBTd2l0Y2hDYXNlTm9NYXRjaCkpXG5cdFx0cmV0dXJuIGJsb2NrV3JhcElmVmFsKHRoaXMuaXNWYWwsIG5ldyBTd2l0Y2hTdGF0ZW1lbnQodDAodGhpcy5zd2l0Y2hlZCksIHBhcnRzKSlcblx0fSxcblxuXHRTd2l0Y2hQYXJ0KCkge1xuXHRcdGNvbnN0IGZvbGxvdyA9IG9wSWYoIXRoaXMuaXNWYWwsICgpID0+IG5ldyBCcmVha1N0YXRlbWVudClcblx0XHQvKlxuXHRcdFdlIGNvdWxkIGp1c3QgcGFzcyBibG9jay5ib2R5IGZvciB0aGUgc3dpdGNoIGxpbmVzLCBidXQgaW5zdGVhZFxuXHRcdGVuY2xvc2UgdGhlIGJvZHkgb2YgdGhlIHN3aXRjaCBjYXNlIGluIGN1cmx5IGJyYWNlcyB0byBlbnN1cmUgYSBuZXcgc2NvcGUuXG5cdFx0VGhhdCB3YXkgdGhpcyBjb2RlIHdvcmtzOlxuXHRcdFx0c3dpdGNoICgwKSB7XG5cdFx0XHRcdGNhc2UgMDoge1xuXHRcdFx0XHRcdGNvbnN0IGEgPSAwXG5cdFx0XHRcdFx0cmV0dXJuIGFcblx0XHRcdFx0fVxuXHRcdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdFx0Ly8gV2l0aG91dCBjdXJseSBicmFjZXMgdGhpcyB3b3VsZCBjb25mbGljdCB3aXRoIHRoZSBvdGhlciBgYWAuXG5cdFx0XHRcdFx0Y29uc3QgYSA9IDFcblx0XHRcdFx0XHRhXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHQqL1xuXHRcdGNvbnN0IGJsb2NrID0gdDModGhpcy5yZXN1bHQsIG51bGwsIG51bGwsIGZvbGxvdylcblx0XHQvLyBJZiBzd2l0Y2ggaGFzIG11bHRpcGxlIHZhbHVlcywgYnVpbGQgdXAgYSBzdGF0ZW1lbnQgbGlrZTogYGNhc2UgMTogY2FzZSAyOiB7IGRvQmxvY2soKSB9YFxuXHRcdGNvbnN0IHggPSBbXVxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy52YWx1ZXMubGVuZ3RoIC0gMTsgaSA9IGkgKyAxKVxuXHRcdFx0Ly8gVGhlc2UgY2FzZXMgZmFsbHRocm91Z2ggdG8gdGhlIG9uZSBhdCB0aGUgZW5kLlxuXHRcdFx0eC5wdXNoKG5ldyBTd2l0Y2hDYXNlKHQwKHRoaXMudmFsdWVzW2ldKSwgW10pKVxuXHRcdHgucHVzaChuZXcgU3dpdGNoQ2FzZSh0MCh0aGlzLnZhbHVlc1t0aGlzLnZhbHVlcy5sZW5ndGggLSAxXSksIFtibG9ja10pKVxuXHRcdHJldHVybiB4XG5cdH0sXG5cblx0VGhyb3coKSB7XG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wVGhyb3duLFxuXHRcdFx0XyA9PiBkb1Rocm93KF8pLFxuXHRcdFx0KCkgPT4gbmV3IFRocm93U3RhdGVtZW50KG5ldyBOZXdFeHByZXNzaW9uKEdsb2JhbEVycm9yLCBbTGl0U3RyVGhyb3ddKSkpXG5cdH0sXG5cblx0V2l0aCgpIHtcblx0XHRjb25zdCBpZERlY2xhcmUgPSBpZEZvckRlY2xhcmVDYWNoZWQodGhpcy5kZWNsYXJlKVxuXHRcdGNvbnN0IGJsb2NrID0gdDModGhpcy5ibG9jaywgbnVsbCwgbnVsbCwgbmV3IFJldHVyblN0YXRlbWVudChpZERlY2xhcmUpKVxuXHRcdGNvbnN0IGZ1biA9IGlzSW5HZW5lcmF0b3IgP1xuXHRcdFx0bmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihudWxsLCBbaWREZWNsYXJlXSwgYmxvY2ssIHRydWUpIDpcblx0XHRcdG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihbaWREZWNsYXJlXSwgYmxvY2spXG5cdFx0Y29uc3QgY2FsbCA9IG5ldyBDYWxsRXhwcmVzc2lvbihmdW4sIFt0MCh0aGlzLnZhbHVlKV0pXG5cdFx0cmV0dXJuIGlzSW5HZW5lcmF0b3IgPyBuZXcgWWllbGRFeHByZXNzaW9uKGNhbGwsIHRydWUpIDogY2FsbFxuXHR9LFxuXG5cdFlpZWxkKCkgeyByZXR1cm4gbmV3IFlpZWxkRXhwcmVzc2lvbihvcE1hcCh0aGlzLm9wWWllbGRlZCwgdDApLCBmYWxzZSkgfSxcblxuXHRZaWVsZFRvKCkgeyByZXR1cm4gbmV3IFlpZWxkRXhwcmVzc2lvbih0MCh0aGlzLnlpZWxkZWRUbyksIHRydWUpIH1cbn0pXG5cbi8vIEZ1bmN0aW9ucyBzcGVjaWZpYyB0byBjZXJ0YWluIGV4cHJlc3Npb25zXG5cbmZ1bmN0aW9uIGNhc2VCb2R5KHBhcnRzLCBvcEVsc2UpIHtcblx0bGV0IGFjYyA9IGlmRWxzZShvcEVsc2UsIHQwLCAoKSA9PiBUaHJvd05vQ2FzZU1hdGNoKVxuXHRmb3IgKGxldCBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpID0gaSAtIDEpXG5cdFx0YWNjID0gdDEocGFydHNbaV0sIGFjYylcblx0cmV0dXJuIGFjY1xufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RvclNldE1lbWJlcnMoY29uc3RydWN0b3IpIHtcblx0cmV0dXJuIGNvbnN0cnVjdG9yLm1lbWJlckFyZ3MubWFwKF8gPT5cblx0XHRtc0NhbGwoJ25ld1Byb3BlcnR5JywgbmV3IFRoaXNFeHByZXNzaW9uKCksIG5ldyBMaXRlcmFsKF8ubmFtZSksIGlkRm9yRGVjbGFyZUNhY2hlZChfKSkpXG59XG5cbmZ1bmN0aW9uIGZvckxvb3Aob3BJdGVyYXRlZSwgYmxvY2spIHtcblx0cmV0dXJuIGlmRWxzZShvcEl0ZXJhdGVlLFxuXHRcdCh7ZWxlbWVudCwgYmFnfSkgPT4ge1xuXHRcdFx0Y29uc3QgZGVjbGFyZSA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdsZXQnLFxuXHRcdFx0XHRbbmV3IFZhcmlhYmxlRGVjbGFyYXRvcih0MChlbGVtZW50KSldKVxuXHRcdFx0cmV0dXJuIG5ldyBGb3JPZlN0YXRlbWVudChkZWNsYXJlLCB0MChiYWcpLCB0MChibG9jaykpXG5cdFx0fSxcblx0XHQoKSA9PiBuZXcgRm9yU3RhdGVtZW50KG51bGwsIG51bGwsIG51bGwsIHQwKGJsb2NrKSkpXG59XG5cbmZ1bmN0aW9uIHRyYW5zcGlsZUJsb2NrKHJldHVybmVkLCBsaW5lcywgbGVhZCwgb3BSZXR1cm5UeXBlKSB7XG5cdGNvbnN0IGZpbiA9IG5ldyBSZXR1cm5TdGF0ZW1lbnQoXG5cdFx0bWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKHJldHVybmVkLCBvcFJldHVyblR5cGUsICdyZXR1cm5lZCB2YWx1ZScpKVxuXHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChsZWFkLCBsaW5lcywgZmluKSlcbn1cbiJdfQ==
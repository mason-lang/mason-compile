'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/util', '../context', '../MsAst', '../util', '../VerifyResults', './ast-constants', './context', './transpileMethod', './transpileModule', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('esast/dist/util'), require('../context'), require('../MsAst'), require('../util'), require('../VerifyResults'), require('./ast-constants'), require('./context'), require('./transpileMethod'), require('./transpileModule'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.context, global.MsAst, global.util, global.VerifyResults, global.astConstants, global.context, global.transpileMethod, global.transpileModule, global.util);
		global.transpile = mod.exports;
	}
})(this, function (exports, _ast, _util, _context, _MsAst, _util2, _VerifyResults, _astConstants, _context2, _transpileMethod, _transpileModule, _util3) {
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
			return (0, _util3.msCall)(this.isMany ? 'addMany' : 'add', _astConstants.IdBuilt, (0, _util3.t0)(this.value));
		},

		BagSimple() {
			return new _ast.ArrayExpression(this.parts.map(_util3.t0));
		},

		Block() {
			let lead = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
			let opReturnType = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			let follow = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

			const kind = _context2.verifyResults.blockKind(this);

			switch (kind) {
				case _VerifyResults.Blocks.Do:
					(0, _util2.assert)(opReturnType === null);
					return new _ast.BlockStatement((0, _util2.cat)(lead, (0, _util3.tLines)(this.lines), follow));

				case _VerifyResults.Blocks.Throw:
					return new _ast.BlockStatement((0, _util2.cat)(lead, (0, _util3.tLines)((0, _util2.rtail)(this.lines)), (0, _util3.t0)((0, _util2.last)(this.lines))));

				case _VerifyResults.Blocks.Return:
					return transpileBlockReturn((0, _util3.t0)((0, _util2.last)(this.lines)), (0, _util3.tLines)((0, _util2.rtail)(this.lines)), lead, opReturnType);

				case _VerifyResults.Blocks.Bag:
				case _VerifyResults.Blocks.Map:
				case _VerifyResults.Blocks.Obj:
					{
						const declare = kind === _VerifyResults.Blocks.Bag ? _astConstants.DeclareBuiltBag : kind === _VerifyResults.Blocks.Map ? _astConstants.DeclareBuiltMap : _astConstants.DeclareBuiltObj;
						const body = (0, _util2.cat)(declare, (0, _util3.tLines)(this.lines));
						return transpileBlockReturn(_astConstants.IdBuilt, body, lead, opReturnType);
					}

				default:
					throw new Error(kind);
			}
		},

		BlockWrap() {
			return (0, _util3.blockWrap)((0, _util3.t0)(this.block));
		},

		Break() {
			return (0, _util2.ifElse)(this.opValue, _ => new _ast.ReturnStatement((0, _util3.t0)(_)), () => new _ast.BreakStatement());
		},

		Call() {
			return new _ast.CallExpression((0, _util3.t0)(this.called), this.args.map(_util3.t0));
		},

		Case() {
			const body = caseBody(this.parts, this.opElse);
			if (_context2.verifyResults.isStatement(this)) return (0, _util2.ifElse)(this.opCased, _ => new _ast.BlockStatement([(0, _util3.t0)(_), body]), () => body);else {
				const block = (0, _util2.ifElse)(this.opCased, _ => [(0, _util3.t0)(_), body], () => [body]);
				return (0, _util3.blockWrap)(new _ast.BlockStatement(block));
			}
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
			if (_context2.verifyResults.isStatement(this)) return new _ast.IfStatement(this.isUnless ? new _ast.UnaryExpression('!', test) : test, res);else {
				const result = (0, _util3.msCall)('some', (0, _util3.blockWrap)(res));
				const none = (0, _util3.msMember)('None');

				var _ref = this.isUnless ? [none, result] : [result, none];

				var _ref2 = _slicedToArray(_ref, 2);

				const then = _ref2[0];
				const _else = _ref2[1];
				return new _ast.ConditionalExpression(test, then, _else);
			}
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
			return (0, _util3.blockWrapIfVal)(this, new _ast.TryStatement((0, _util3.t0)(this.try), (0, _util2.opMap)(this.opCatch, _util3.t0), (0, _util2.opMap)(this.opFinally, _util3.t0)));
		},

		For() {
			return (0, _util3.blockWrapIfVal)(this, forLoop(this.opIteratee, this.block));
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

		Method() {
			const name = new _ast.Literal(_context2.verifyResults.name(this));
			let args;
			if (this.fun.opRestArg !== null) args = new _ast.UnaryExpression('void', new _ast.Literal(0));else args = new _ast.ArrayExpression(this.fun.args.map(arg => {
				const name = new _ast.Literal(arg.name);
				const opType = (0, _util2.opMap)(arg.opType, _util3.t0);
				return (0, _util2.ifElse)(opType, _ => new _ast.ArrayExpression([name, _]), () => name);
			}));
			const impl = this.fun instanceof _MsAst.Fun ? [(0, _util3.t0)(this.fun)] : [];
			return (0, _util3.msCall)('method', name, args, ...impl);
		},

		Module: _transpileModule2.default,

		New() {
			return new _ast.NewExpression((0, _util3.t0)(this.type), this.args.map(_util3.t0));
		},

		Not() {
			return new _ast.UnaryExpression('!', (0, _util3.t0)(this.arg));
		},

		ObjEntryAssign() {
			if (this.assign instanceof _MsAst.AssignSingle && !this.assign.assignee.isLazy()) {
				const name = this.assign.assignee.name;
				return (0, _util3.t1)(this.assign, val => _context2.verifyResults.isObjEntryExport(this) ? (0, _transpileModule.exportNamedOrDefault)(val, name) : new _ast.AssignmentExpression('=', (0, _util.member)(_astConstants.IdBuilt, name), val));
			} else {
				const assigns = this.assign.allAssignees().map(_ => (0, _util3.msCall)('setLazy', _astConstants.IdBuilt, new _ast.Literal(_.name), (0, _util3.idForDeclareCached)(_)));
				return (0, _util2.cat)((0, _util3.t0)(this.assign), assigns);
			}
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
			return (0, _util3.blockWrapIfVal)(this, new _ast.SwitchStatement((0, _util3.t0)(this.switched), parts));
		},

		SwitchPart() {
			const follow = (0, _util2.opIf)(_context2.verifyResults.isStatement(this), () => new _ast.BreakStatement());
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
			const val = (0, _util3.t0)(this.value);
			const lead = new _ast.VariableDeclaration('const', [new _ast.VariableDeclarator(idDeclare, val)]);
			return _context2.verifyResults.isStatement(this) ? (0, _util3.t1)(this.block, lead) : (0, _util3.blockWrap)((0, _util3.t3)(this.block, lead, null, new _ast.ReturnStatement(idDeclare)));
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

	function transpileBlockReturn(returned, lines, lead, opReturnType) {
		const ret = new _ast.ReturnStatement((0, _util3.maybeWrapInCheckContains)(returned, opReturnType, 'returned value'));
		return new _ast.BlockStatement((0, _util2.cat)(lead, lines, ret));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQThCd0IsU0FBUzs7Ozs7Ozs7Ozs7O1VBQVQsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0F5RDFCLElBQUkseURBQUMsSUFBSTtPQUFFLFlBQVkseURBQUMsSUFBSTtPQUFFLE1BQU0seURBQUMsSUFBSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0E0STNDLGNBQWMseURBQUMsSUFBSSIsImZpbGUiOiJ0cmFuc3BpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FycmF5RXhwcmVzc2lvbiwgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24sIEFzc2lnbm1lbnRFeHByZXNzaW9uLCBCaW5hcnlFeHByZXNzaW9uLFxuXHRCbG9ja1N0YXRlbWVudCwgQnJlYWtTdGF0ZW1lbnQsIENhbGxFeHByZXNzaW9uLCBDYXRjaENsYXVzZSwgQ2xhc3NCb2R5LCBDbGFzc0V4cHJlc3Npb24sXG5cdENvbmRpdGlvbmFsRXhwcmVzc2lvbiwgRGVidWdnZXJTdGF0ZW1lbnQsIEZvck9mU3RhdGVtZW50LCBGb3JTdGF0ZW1lbnQsIEZ1bmN0aW9uRXhwcmVzc2lvbixcblx0SWRlbnRpZmllciwgSWZTdGF0ZW1lbnQsIExpdGVyYWwsIExvZ2ljYWxFeHByZXNzaW9uLCBNZW1iZXJFeHByZXNzaW9uLCBNZXRob2REZWZpbml0aW9uLFxuXHROZXdFeHByZXNzaW9uLCBPYmplY3RFeHByZXNzaW9uLCBQcm9wZXJ0eSwgUmV0dXJuU3RhdGVtZW50LCBTcHJlYWRFbGVtZW50LCBTd2l0Y2hDYXNlLFxuXHRTd2l0Y2hTdGF0ZW1lbnQsIFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbiwgVGVtcGxhdGVFbGVtZW50LCBUZW1wbGF0ZUxpdGVyYWwsIFRoaXNFeHByZXNzaW9uLFxuXHRUaHJvd1N0YXRlbWVudCwgVHJ5U3RhdGVtZW50LCBWYXJpYWJsZURlY2xhcmF0aW9uLCBVbmFyeUV4cHJlc3Npb24sIFZhcmlhYmxlRGVjbGFyYXRvcixcblx0WWllbGRFeHByZXNzaW9ufSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7aWRlbnRpZmllciwgbWVtYmVyLCBwcm9wZXJ0eUlkT3JMaXRlcmFsfSBmcm9tICdlc2FzdC9kaXN0L3V0aWwnXG5pbXBvcnQge29wdGlvbnN9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtBc3NpZ25TaW5nbGUsIENhbGwsIENvbnN0cnVjdG9yLCBGdW4sIEZ1bnMsIExvZ2ljcywgTWVtYmVyLCBMb2NhbERlY2xhcmVzLCBQYXR0ZXJuLCBTZXR0ZXJzLFxuXHRTcGVjaWFsRG9zLCBTcGVjaWFsVmFsc30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2Fzc2VydCwgY2F0LCBmbGF0TWFwLCBmbGF0T3BNYXAsIGlmRWxzZSwgaW1wbGVtZW50TWFueSwgaXNFbXB0eSwgbGFzdCwgb3BJZiwgb3BNYXAsIHJ0YWlsLFxuXHR0YWlsfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtCbG9ja3N9IGZyb20gJy4uL1ZlcmlmeVJlc3VsdHMnXG5pbXBvcnQge0FycmF5U2xpY2VDYWxsLCBEZWNsYXJlQnVpbHRCYWcsIERlY2xhcmVCdWlsdE1hcCwgRGVjbGFyZUJ1aWx0T2JqLCBEZWNsYXJlTGV4aWNhbFRoaXMsXG5cdElkQXJndW1lbnRzLCBJZEJ1aWx0LCBJZEV4dHJhY3QsIElkRm9jdXMsIElkTGV4aWNhbFRoaXMsIElkU3VwZXIsIEdsb2JhbEVycm9yLCBHbG9iYWxJbmZpbml0eSxcblx0TGl0RW1wdHlTdHJpbmcsIExpdE51bGwsIExpdFN0clRocm93LCBMaXRaZXJvLCBSZXR1cm5CdWlsdCwgUmV0dXJuRm9jdXMsIFN3aXRjaENhc2VOb01hdGNoLFxuXHRUaHJvd0Fzc2VydEZhaWwsIFRocm93Tm9DYXNlTWF0Y2h9IGZyb20gJy4vYXN0LWNvbnN0YW50cydcbmltcG9ydCB7aXNJbkNvbnN0cnVjdG9yLCBzZXR1cCwgdGVhckRvd24sIHZlcmlmeVJlc3VsdHMsIHdpdGhJbkNvbnN0cnVjdG9yLCB3aXRoSW5HZW5lcmF0b3Jcblx0fSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge3RyYW5zcGlsZU1ldGhvZFRvRGVmaW5pdGlvbiwgdHJhbnNwaWxlTWV0aG9kVG9Qcm9wZXJ0eX0gZnJvbSAnLi90cmFuc3BpbGVNZXRob2QnXG5pbXBvcnQgdHJhbnNwaWxlTW9kdWxlLCB7ZXhwb3J0TmFtZWRPckRlZmF1bHR9IGZyb20gJy4vdHJhbnNwaWxlTW9kdWxlJ1xuaW1wb3J0IHthY2Nlc3NMb2NhbERlY2xhcmUsIGJsb2NrV3JhcCwgYmxvY2tXcmFwSWZWYWwsIGRlY2xhcmUsIGRvVGhyb3csIGlkRm9yRGVjbGFyZUNhY2hlZCxcblx0bGF6eVdyYXAsIG1ha2VEZWNsYXJhdG9yLCBtYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycywgbWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zLFxuXHRtZW1iZXJTdHJpbmdPclZhbCwgbXNDYWxsLCBtc01lbWJlciwgb3BUeXBlQ2hlY2tGb3JMb2NhbERlY2xhcmUsIHQwLCB0MSwgdDIsIHQzLCB0TGluZXMsXG5cdHRyYW5zcGlsZU5hbWV9IGZyb20gJy4vdXRpbCdcblxuLyoqIFRyYW5zZm9ybSBhIHtAbGluayBNc0FzdH0gaW50byBhbiBlc2FzdC4gKiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFuc3BpbGUobW9kdWxlRXhwcmVzc2lvbiwgdmVyaWZ5UmVzdWx0cykge1xuXHRzZXR1cCh2ZXJpZnlSZXN1bHRzKVxuXHRjb25zdCByZXMgPSB0MChtb2R1bGVFeHByZXNzaW9uKVxuXHR0ZWFyRG93bigpXG5cdHJldHVybiByZXNcbn1cblxuaW1wbGVtZW50TWFueShNc0FzdFR5cGVzLCAndHJhbnNwaWxlJywge1xuXHRBc3NlcnQoKSB7XG5cdFx0Y29uc3QgZmFpbENvbmQgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBjb25kID0gdDAodGhpcy5jb25kaXRpb24pXG5cdFx0XHRyZXR1cm4gdGhpcy5uZWdhdGUgPyBjb25kIDogbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIGNvbmQpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wVGhyb3duLFxuXHRcdFx0XyA9PiBuZXcgSWZTdGF0ZW1lbnQoZmFpbENvbmQoKSwgZG9UaHJvdyhfKSksXG5cdFx0XHQoKSA9PiB7XG5cdFx0XHRcdGlmICh0aGlzLmNvbmRpdGlvbiBpbnN0YW5jZW9mIENhbGwpIHtcblx0XHRcdFx0XHRjb25zdCBjYWxsID0gdGhpcy5jb25kaXRpb25cblx0XHRcdFx0XHRjb25zdCBjYWxsZWQgPSBjYWxsLmNhbGxlZFxuXHRcdFx0XHRcdGNvbnN0IGFyZ3MgPSBjYWxsLmFyZ3MubWFwKHQwKVxuXHRcdFx0XHRcdGlmIChjYWxsZWQgaW5zdGFuY2VvZiBNZW1iZXIpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGFzcyA9IHRoaXMubmVnYXRlID8gJ2Fzc2VydE5vdE1lbWJlcicgOiAnYXNzZXJ0TWVtYmVyJ1xuXHRcdFx0XHRcdFx0cmV0dXJuIG1zQ2FsbChhc3MsIHQwKGNhbGxlZC5vYmplY3QpLCB0cmFuc3BpbGVOYW1lKGNhbGxlZC5uYW1lKSwgLi4uYXJncylcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc3QgYXNzID0gdGhpcy5uZWdhdGUgPyAnYXNzZXJ0Tm90JyA6ICdhc3NlcnQnXG5cdFx0XHRcdFx0XHRyZXR1cm4gbXNDYWxsKGFzcywgdDAoY2FsbGVkKSwgLi4uYXJncylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQoZmFpbENvbmQoKSwgVGhyb3dBc3NlcnRGYWlsKVxuXHRcdFx0fSlcblx0fSxcblxuXHRBc3NpZ25TaW5nbGUodmFsV3JhcCkge1xuXHRcdGNvbnN0IHZhbCA9IHZhbFdyYXAgPT09IHVuZGVmaW5lZCA/IHQwKHRoaXMudmFsdWUpIDogdmFsV3JhcCh0MCh0aGlzLnZhbHVlKSlcblx0XHRjb25zdCBkZWNsYXJlID0gbWFrZURlY2xhcmF0b3IodGhpcy5hc3NpZ25lZSwgdmFsLCBmYWxzZSlcblx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24odGhpcy5hc3NpZ25lZS5pc011dGFibGUoKSA/ICdsZXQnIDogJ2NvbnN0JywgW2RlY2xhcmVdKVxuXHR9LFxuXHQvLyBUT0RPOkVTNiBKdXN0IHVzZSBuYXRpdmUgZGVzdHJ1Y3R1cmluZyBhc3NpZ25cblx0QXNzaWduRGVzdHJ1Y3R1cmUoKSB7XG5cdFx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKFxuXHRcdFx0dGhpcy5raW5kKCkgPT09IExvY2FsRGVjbGFyZXMuTXV0YWJsZSA/ICdsZXQnIDogJ2NvbnN0Jyxcblx0XHRcdG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzKFxuXHRcdFx0XHR0aGlzLmFzc2lnbmVlcyxcblx0XHRcdFx0dGhpcy5raW5kKCkgPT09IExvY2FsRGVjbGFyZXMuTGF6eSxcblx0XHRcdFx0dDAodGhpcy52YWx1ZSksXG5cdFx0XHRcdGZhbHNlKSlcblx0fSxcblxuXHRCYWdFbnRyeSgpIHtcblx0XHRyZXR1cm4gbXNDYWxsKHRoaXMuaXNNYW55ID8gJ2FkZE1hbnknIDogJ2FkZCcsIElkQnVpbHQsIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdEJhZ1NpbXBsZSgpIHtcblx0XHRyZXR1cm4gbmV3IEFycmF5RXhwcmVzc2lvbih0aGlzLnBhcnRzLm1hcCh0MCkpXG5cdH0sXG5cblx0QmxvY2sobGVhZD1udWxsLCBvcFJldHVyblR5cGU9bnVsbCwgZm9sbG93PW51bGwpIHtcblx0XHRjb25zdCBraW5kID0gdmVyaWZ5UmVzdWx0cy5ibG9ja0tpbmQodGhpcylcblx0XHRzd2l0Y2ggKGtpbmQpIHtcblx0XHRcdGNhc2UgQmxvY2tzLkRvOlxuXHRcdFx0XHRhc3NlcnQob3BSZXR1cm5UeXBlID09PSBudWxsKVxuXHRcdFx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChsZWFkLCB0TGluZXModGhpcy5saW5lcyksIGZvbGxvdykpXG5cdFx0XHRjYXNlIEJsb2Nrcy5UaHJvdzpcblx0XHRcdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChcblx0XHRcdFx0XHRjYXQobGVhZCwgdExpbmVzKHJ0YWlsKHRoaXMubGluZXMpKSwgdDAobGFzdCh0aGlzLmxpbmVzKSkpKVxuXHRcdFx0Y2FzZSBCbG9ja3MuUmV0dXJuOlxuXHRcdFx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2tSZXR1cm4oXG5cdFx0XHRcdFx0dDAobGFzdCh0aGlzLmxpbmVzKSksIHRMaW5lcyhydGFpbCh0aGlzLmxpbmVzKSksIGxlYWQsIG9wUmV0dXJuVHlwZSlcblx0XHRcdGNhc2UgQmxvY2tzLkJhZzogY2FzZSBCbG9ja3MuTWFwOiBjYXNlIEJsb2Nrcy5PYmo6IHtcblx0XHRcdFx0Y29uc3QgZGVjbGFyZSA9IGtpbmQgPT09IEJsb2Nrcy5CYWcgP1xuXHRcdFx0XHRcdERlY2xhcmVCdWlsdEJhZyA6XG5cdFx0XHRcdFx0a2luZCA9PT0gQmxvY2tzLk1hcCA/IERlY2xhcmVCdWlsdE1hcCA6IERlY2xhcmVCdWlsdE9ialxuXHRcdFx0XHRjb25zdCBib2R5ID0gY2F0KGRlY2xhcmUsIHRMaW5lcyh0aGlzLmxpbmVzKSlcblx0XHRcdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrUmV0dXJuKElkQnVpbHQsIGJvZHksIGxlYWQsIG9wUmV0dXJuVHlwZSlcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihraW5kKVxuXHRcdH1cblx0fSxcblxuXHRCbG9ja1dyYXAoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcCh0MCh0aGlzLmJsb2NrKSlcblx0fSxcblxuXHRCcmVhaygpIHtcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BWYWx1ZSxcblx0XHRcdF8gPT4gbmV3IFJldHVyblN0YXRlbWVudCh0MChfKSksXG5cdFx0XHQoKSA9PiBuZXcgQnJlYWtTdGF0ZW1lbnQoKSlcblx0fSxcblxuXHRDYWxsKCkge1xuXHRcdHJldHVybiBuZXcgQ2FsbEV4cHJlc3Npb24odDAodGhpcy5jYWxsZWQpLCB0aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHRDYXNlKCkge1xuXHRcdGNvbnN0IGJvZHkgPSBjYXNlQm9keSh0aGlzLnBhcnRzLCB0aGlzLm9wRWxzZSlcblx0XHRpZiAodmVyaWZ5UmVzdWx0cy5pc1N0YXRlbWVudCh0aGlzKSlcblx0XHRcdHJldHVybiBpZkVsc2UodGhpcy5vcENhc2VkLCBfID0+IG5ldyBCbG9ja1N0YXRlbWVudChbdDAoXyksIGJvZHldKSwgKCkgPT4gYm9keSlcblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IGJsb2NrID0gaWZFbHNlKHRoaXMub3BDYXNlZCwgXyA9PiBbdDAoXyksIGJvZHldLCAoKSA9PiBbYm9keV0pXG5cdFx0XHRyZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChibG9jaykpXG5cdFx0fVxuXHR9LFxuXG5cdENhc2VQYXJ0KGFsdGVybmF0ZSkge1xuXHRcdGlmICh0aGlzLnRlc3QgaW5zdGFuY2VvZiBQYXR0ZXJuKSB7XG5cdFx0XHRjb25zdCB7dHlwZSwgcGF0dGVybmVkLCBsb2NhbHN9ID0gdGhpcy50ZXN0XG5cdFx0XHRjb25zdCBkZWNsID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgW1xuXHRcdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKElkRXh0cmFjdCwgbXNDYWxsKCdleHRyYWN0JywgdDAodHlwZSksIHQwKHBhdHRlcm5lZCkpKV0pXG5cdFx0XHRjb25zdCB0ZXN0ID0gbmV3IEJpbmFyeUV4cHJlc3Npb24oJyE9PScsIElkRXh0cmFjdCwgTGl0TnVsbClcblx0XHRcdGNvbnN0IGV4dHJhY3QgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBsb2NhbHMubWFwKChfLCBpZHgpID0+XG5cdFx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoXG5cdFx0XHRcdFx0aWRGb3JEZWNsYXJlQ2FjaGVkKF8pLFxuXHRcdFx0XHRcdG5ldyBNZW1iZXJFeHByZXNzaW9uKElkRXh0cmFjdCwgbmV3IExpdGVyYWwoaWR4KSkpKSlcblx0XHRcdGNvbnN0IHJlcyA9IHQxKHRoaXMucmVzdWx0LCBleHRyYWN0KVxuXHRcdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChbZGVjbCwgbmV3IElmU3RhdGVtZW50KHRlc3QsIHJlcywgYWx0ZXJuYXRlKV0pXG5cdFx0fSBlbHNlXG5cdFx0XHQvLyBhbHRlcm5hdGUgd3JpdHRlbiB0byBieSBgY2FzZUJvZHlgLlxuXHRcdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudCh0MCh0aGlzLnRlc3QpLCB0MCh0aGlzLnJlc3VsdCksIGFsdGVybmF0ZSlcblx0fSxcblxuXHRDbGFzcygpIHtcblx0XHRjb25zdCBtZXRob2RzID0gY2F0KFxuXHRcdFx0dGhpcy5zdGF0aWNzLm1hcChfID0+IHRyYW5zcGlsZU1ldGhvZFRvRGVmaW5pdGlvbihfLCB0cnVlKSksXG5cdFx0XHRvcE1hcCh0aGlzLm9wQ29uc3RydWN0b3IsIHQwKSxcblx0XHRcdHRoaXMubWV0aG9kcy5tYXAoXyA9PiB0cmFuc3BpbGVNZXRob2RUb0RlZmluaXRpb24oXywgZmFsc2UpKSlcblx0XHRjb25zdCBvcE5hbWUgPSBvcE1hcCh2ZXJpZnlSZXN1bHRzLm9wTmFtZSh0aGlzKSwgaWRlbnRpZmllcilcblx0XHRjb25zdCBjbGFzc0V4cHIgPSBuZXcgQ2xhc3NFeHByZXNzaW9uKG9wTmFtZSxcblx0XHRcdG9wTWFwKHRoaXMub3BTdXBlckNsYXNzLCB0MCksIG5ldyBDbGFzc0JvZHkobWV0aG9kcykpXG5cblx0XHRpZiAodGhpcy5vcERvID09PSBudWxsICYmIGlzRW1wdHkodGhpcy5raW5kcykpXG5cdFx0XHRyZXR1cm4gY2xhc3NFeHByXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBsZWFkID0gY2F0KFxuXHRcdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBbXG5cdFx0XHRcdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZEZvY3VzLCBjbGFzc0V4cHIpXSksXG5cdFx0XHRcdHRoaXMua2luZHMubWFwKF8gPT4gbXNDYWxsKCdraW5kRG8nLCBJZEZvY3VzLCB0MChfKSkpKVxuXHRcdFx0Y29uc3QgYmxvY2sgPSBpZkVsc2UodGhpcy5vcERvLFxuXHRcdFx0XHRfID0+IHQzKF8uYmxvY2ssIGxlYWQsIG51bGwsIFJldHVybkZvY3VzKSxcblx0XHRcdFx0KCkgPT4gbmV3IEJsb2NrU3RhdGVtZW50KGNhdChsZWFkLCBSZXR1cm5Gb2N1cykpKVxuXHRcdFx0cmV0dXJuIGJsb2NrV3JhcChibG9jaylcblx0XHR9XG5cdH0sXG5cblx0Q29uZCgpIHtcblx0XHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0MCh0aGlzLnRlc3QpLCB0MCh0aGlzLmlmVHJ1ZSksIHQwKHRoaXMuaWZGYWxzZSkpXG5cdH0sXG5cblx0Q29uZGl0aW9uYWwoKSB7XG5cdFx0Y29uc3QgdGVzdCA9IHQwKHRoaXMudGVzdClcblx0XHRjb25zdCByZXMgPSB0MCh0aGlzLnJlc3VsdClcblx0XHRpZiAodmVyaWZ5UmVzdWx0cy5pc1N0YXRlbWVudCh0aGlzKSlcblx0XHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQodGhpcy5pc1VubGVzcyA/IG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCB0ZXN0KSA6IHRlc3QsIHJlcylcblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IG1zQ2FsbCgnc29tZScsIGJsb2NrV3JhcChyZXMpKVxuXHRcdFx0Y29uc3Qgbm9uZSA9IG1zTWVtYmVyKCdOb25lJylcblx0XHRcdGNvbnN0IFt0aGVuLCBfZWxzZV0gPSB0aGlzLmlzVW5sZXNzID8gW25vbmUsIHJlc3VsdF0gOiBbcmVzdWx0LCBub25lXVxuXHRcdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odGVzdCwgdGhlbiwgX2Vsc2UpXG5cdFx0fVxuXHR9LFxuXG5cdENvbnN0cnVjdG9yKCkge1xuXHRcdHJldHVybiB3aXRoSW5Db25zdHJ1Y3RvcigoKSA9PiB7XG5cdFx0XHQvLyBJZiB0aGVyZSBpcyBhIGBzdXBlciFgLCBgdGhpc2Agd2lsbCBub3QgYmUgZGVmaW5lZCB1bnRpbCB0aGVuLFxuXHRcdFx0Ly8gc28gbXVzdCB3YWl0IHVudGlsIHRoZW4uXG5cdFx0XHQvLyBPdGhlcndpc2UsIGRvIGl0IGF0IHRoZSBiZWdpbm5pbmcuXG5cdFx0XHRjb25zdCBib2R5ID0gdmVyaWZ5UmVzdWx0cy5jb25zdHJ1Y3RvclRvU3VwZXIuaGFzKHRoaXMpID9cblx0XHRcdFx0dDAodGhpcy5mdW4pIDpcblx0XHRcdFx0dDEodGhpcy5mdW4sIGNvbnN0cnVjdG9yU2V0TWVtYmVycyh0aGlzKSlcblxuXHRcdFx0cmV0dXJuIE1ldGhvZERlZmluaXRpb24uY29uc3RydWN0b3IoYm9keSlcblx0XHR9KVxuXHR9LFxuXG5cdENhdGNoKCkge1xuXHRcdHJldHVybiBuZXcgQ2F0Y2hDbGF1c2UodDAodGhpcy5jYXVnaHQpLCB0MCh0aGlzLmJsb2NrKSlcblx0fSxcblxuXHRFeGNlcHQoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcElmVmFsKHRoaXMsXG5cdFx0XHRuZXcgVHJ5U3RhdGVtZW50KHQwKHRoaXMudHJ5KSwgb3BNYXAodGhpcy5vcENhdGNoLCB0MCksIG9wTWFwKHRoaXMub3BGaW5hbGx5LCB0MCkpKVxuXHR9LFxuXG5cdEZvcigpIHtcblx0XHRyZXR1cm4gYmxvY2tXcmFwSWZWYWwodGhpcywgZm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spKVxuXHR9LFxuXG5cdEZvckJhZygpIHtcblx0XHRyZXR1cm4gYmxvY2tXcmFwKG5ldyBCbG9ja1N0YXRlbWVudChbXG5cdFx0XHREZWNsYXJlQnVpbHRCYWcsXG5cdFx0XHRmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jayksXG5cdFx0XHRSZXR1cm5CdWlsdFxuXHRcdF0pKVxuXHR9LFxuXG5cdC8vIGxlYWRTdGF0ZW1lbnRzIGNvbWVzIGZyb20gY29uc3RydWN0b3IgbWVtYmVyc1xuXHRGdW4obGVhZFN0YXRlbWVudHM9bnVsbCkge1xuXHRcdGNvbnN0IGlzR2VuZXJhdG9yRnVuID0gdGhpcy5raW5kICE9PSBGdW5zLlBsYWluXG5cdFx0cmV0dXJuIHdpdGhJbkdlbmVyYXRvcihpc0dlbmVyYXRvckZ1biwgKCkgPT4ge1xuXHRcdFx0Ly8gVE9ETzpFUzYgdXNlIGAuLi5gZlxuXHRcdFx0Y29uc3QgbkFyZ3MgPSBuZXcgTGl0ZXJhbCh0aGlzLmFyZ3MubGVuZ3RoKVxuXHRcdFx0Y29uc3Qgb3BEZWNsYXJlUmVzdCA9IG9wTWFwKHRoaXMub3BSZXN0QXJnLCByZXN0ID0+XG5cdFx0XHRcdGRlY2xhcmUocmVzdCwgbmV3IENhbGxFeHByZXNzaW9uKEFycmF5U2xpY2VDYWxsLCBbSWRBcmd1bWVudHMsIG5BcmdzXSkpKVxuXHRcdFx0Y29uc3QgYXJnQ2hlY2tzID0gb3BJZihvcHRpb25zLmluY2x1ZGVDaGVja3MoKSwgKCkgPT5cblx0XHRcdFx0ZmxhdE9wTWFwKHRoaXMuYXJncywgb3BUeXBlQ2hlY2tGb3JMb2NhbERlY2xhcmUpKVxuXG5cdFx0XHRjb25zdCBvcERlY2xhcmVUaGlzID1cblx0XHRcdFx0b3BJZighaXNJbkNvbnN0cnVjdG9yICYmIHRoaXMub3BEZWNsYXJlVGhpcyAhPSBudWxsLCAoKSA9PiBEZWNsYXJlTGV4aWNhbFRoaXMpXG5cblx0XHRcdGNvbnN0IGxlYWQgPSBjYXQobGVhZFN0YXRlbWVudHMsIG9wRGVjbGFyZVRoaXMsIG9wRGVjbGFyZVJlc3QsIGFyZ0NoZWNrcylcblxuXHRcdFx0Y29uc3QgYm9keSA9KCkgPT4gdDIodGhpcy5ibG9jaywgbGVhZCwgdGhpcy5vcFJldHVyblR5cGUpXG5cdFx0XHRjb25zdCBhcmdzID0gdGhpcy5hcmdzLm1hcCh0MClcblx0XHRcdGNvbnN0IGlkID0gb3BNYXAodmVyaWZ5UmVzdWx0cy5vcE5hbWUodGhpcyksIGlkZW50aWZpZXIpXG5cblx0XHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRcdGNhc2UgRnVucy5QbGFpbjpcblx0XHRcdFx0XHQvLyBUT0RPOkVTNiBTaG91bGQgYmUgYWJsZSB0byB1c2UgcmVzdCBhcmdzIGluIGFycm93IGZ1bmN0aW9uXG5cdFx0XHRcdFx0aWYgKGlkID09PSBudWxsICYmIHRoaXMub3BEZWNsYXJlVGhpcyA9PT0gbnVsbCAmJiBvcERlY2xhcmVSZXN0ID09PSBudWxsKVxuXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihhcmdzLCBib2R5KCkpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIGFyZ3MsIGJvZHkoKSlcblx0XHRcdFx0Y2FzZSBGdW5zLkFzeW5jOiB7XG5cdFx0XHRcdFx0Y29uc3QgcGxhaW5Cb2R5ID0gdDIodGhpcy5ibG9jaywgbnVsbCwgdGhpcy5vcFJldHVyblR5cGUpXG5cdFx0XHRcdFx0Y29uc3QgZ2VuRnVuYyA9IG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIFtdLCBwbGFpbkJvZHksIHRydWUpXG5cdFx0XHRcdFx0Y29uc3QgcmV0ID0gbmV3IFJldHVyblN0YXRlbWVudChtc0NhbGwoJ2FzeW5jJywgZ2VuRnVuYykpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIGFyZ3MsIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgcmV0KSkpXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBGdW5zLkdlbmVyYXRvcjpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihpZCwgYXJncywgYm9keSgpLCB0cnVlKVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcih0aGlzLmtpbmQpXG5cdFx0XHR9XG5cdFx0fSlcblx0fSxcblxuXHRJZ25vcmUoKSB7XG5cdFx0cmV0dXJuIFtdXG5cdH0sXG5cblx0S2luZCgpIHtcblx0XHRjb25zdCBuYW1lID0gbmV3IExpdGVyYWwodmVyaWZ5UmVzdWx0cy5uYW1lKHRoaXMpKVxuXHRcdGNvbnN0IHN1cGVycyA9IG5ldyBBcnJheUV4cHJlc3Npb24odGhpcy5zdXBlcktpbmRzLm1hcCh0MCkpXG5cdFx0Y29uc3QgbWV0aG9kcyA9IF8gPT5cblx0XHRcdG5ldyBPYmplY3RFeHByZXNzaW9uKF8ubWFwKHRyYW5zcGlsZU1ldGhvZFRvUHJvcGVydHkpKVxuXHRcdGNvbnN0IGtpbmQgPSBtc0NhbGwoJ2tpbmQnLCBuYW1lLCBzdXBlcnMsIG1ldGhvZHModGhpcy5zdGF0aWNzKSwgbWV0aG9kcyh0aGlzLm1ldGhvZHMpKVxuXG5cdFx0aWYgKHRoaXMub3BEbyA9PT0gbnVsbClcblx0XHRcdHJldHVybiBraW5kXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBsZWFkID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0Jyxcblx0XHRcdFx0W25ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRGb2N1cywga2luZCldKVxuXHRcdFx0cmV0dXJuIGJsb2NrV3JhcCh0Myh0aGlzLm9wRG8uYmxvY2ssIGxlYWQsIG51bGwsIFJldHVybkZvY3VzKSlcblx0XHR9XG5cdH0sXG5cblx0TGF6eSgpIHtcblx0XHRyZXR1cm4gbGF6eVdyYXAodDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0TnVtYmVyTGl0ZXJhbCgpIHtcblx0XHQvLyBOZWdhdGl2ZSBudW1iZXJzIGFyZSBub3QgcGFydCBvZiBFUyBzcGVjLlxuXHRcdC8vIGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi81LjEvI3NlYy03LjguM1xuXHRcdGNvbnN0IHZhbHVlID0gTnVtYmVyKHRoaXMudmFsdWUpXG5cdFx0Y29uc3QgbGl0ID0gbmV3IExpdGVyYWwoTWF0aC5hYnModmFsdWUpKVxuXHRcdGNvbnN0IGlzUG9zaXRpdmUgPSB2YWx1ZSA+PSAwICYmIDEgLyB2YWx1ZSAhPT0gLUluZmluaXR5XG5cdFx0cmV0dXJuIGlzUG9zaXRpdmUgPyBsaXQgOiBuZXcgVW5hcnlFeHByZXNzaW9uKCctJywgbGl0KVxuXHR9LFxuXG5cdExvY2FsQWNjZXNzKCkge1xuXHRcdGlmICh0aGlzLm5hbWUgPT09ICd0aGlzJylcblx0XHRcdHJldHVybiBpc0luQ29uc3RydWN0b3IgPyBuZXcgVGhpc0V4cHJlc3Npb24oKSA6IElkTGV4aWNhbFRoaXNcblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IGxkID0gdmVyaWZ5UmVzdWx0cy5sb2NhbERlY2xhcmVGb3JBY2Nlc3ModGhpcylcblx0XHRcdC8vIElmIGxkIG1pc3NpbmcsIHRoaXMgaXMgYSBidWlsdGluLCBhbmQgYnVpbHRpbnMgYXJlIG5ldmVyIGxhenlcblx0XHRcdHJldHVybiBsZCA9PT0gdW5kZWZpbmVkID8gaWRlbnRpZmllcih0aGlzLm5hbWUpIDogYWNjZXNzTG9jYWxEZWNsYXJlKGxkKVxuXHRcdH1cblx0fSxcblxuXHRMb2NhbERlY2xhcmUoKSB7IHJldHVybiBuZXcgSWRlbnRpZmllcihpZEZvckRlY2xhcmVDYWNoZWQodGhpcykubmFtZSkgfSxcblxuXHRMb2NhbE11dGF0ZSgpIHtcblx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgaWRlbnRpZmllcih0aGlzLm5hbWUpLCB0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRMb2dpYygpIHtcblx0XHRjb25zdCBvcCA9IHRoaXMua2luZCA9PT0gTG9naWNzLkFuZCA/ICcmJicgOiAnfHwnXG5cdFx0cmV0dXJuIHRhaWwodGhpcy5hcmdzKS5yZWR1Y2UoKGEsIGIpID0+XG5cdFx0XHRuZXcgTG9naWNhbEV4cHJlc3Npb24ob3AsIGEsIHQwKGIpKSwgdDAodGhpcy5hcmdzWzBdKSlcblx0fSxcblxuXHRNYXBFbnRyeSgpIHsgcmV0dXJuIG1zQ2FsbCgnc2V0U3ViJywgSWRCdWlsdCwgdDAodGhpcy5rZXkpLCB0MCh0aGlzLnZhbCkpIH0sXG5cblx0TWVtYmVyKCkge1xuXHRcdHJldHVybiBtZW1iZXJTdHJpbmdPclZhbCh0MCh0aGlzLm9iamVjdCksIHRoaXMubmFtZSlcblx0fSxcblxuXHRNZW1iZXJGdW4oKSB7XG5cdFx0Y29uc3QgbmFtZSA9IHRyYW5zcGlsZU5hbWUodGhpcy5uYW1lKVxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcE9iamVjdCxcblx0XHRcdF8gPT4gbXNDYWxsKCdtZXRob2RCb3VuZCcsIHQwKF8pLCBuYW1lKSxcblx0XHRcdCgpID0+IG1zQ2FsbCgnbWV0aG9kVW5ib3VuZCcsIG5hbWUpKVxuXHR9LFxuXG5cdE1lbWJlclNldCgpIHtcblx0XHRjb25zdCBvYmogPSB0MCh0aGlzLm9iamVjdClcblx0XHRjb25zdCB2YWwgPSBtYXliZVdyYXBJbkNoZWNrQ29udGFpbnModDAodGhpcy52YWx1ZSksIHRoaXMub3BUeXBlLCB0aGlzLm5hbWUpXG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU2V0dGVycy5Jbml0OlxuXHRcdFx0XHRyZXR1cm4gbXNDYWxsKCduZXdQcm9wZXJ0eScsIG9iaiwgdHJhbnNwaWxlTmFtZSh0aGlzLm5hbWUpLCB2YWwpXG5cdFx0XHRjYXNlIFNldHRlcnMuSW5pdE11dGFibGU6XG5cdFx0XHRcdHJldHVybiBtc0NhbGwoJ25ld011dGFibGVQcm9wZXJ0eScsIG9iaiwgdHJhbnNwaWxlTmFtZSh0aGlzLm5hbWUpLCB2YWwpXG5cdFx0XHRjYXNlIFNldHRlcnMuTXV0YXRlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyU3RyaW5nT3JWYWwob2JqLCB0aGlzLm5hbWUpLCB2YWwpXG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdH1cblx0fSxcblxuXHRNZXRob2QoKSB7XG5cdFx0Y29uc3QgbmFtZSA9IG5ldyBMaXRlcmFsKHZlcmlmeVJlc3VsdHMubmFtZSh0aGlzKSlcblxuXHRcdGxldCBhcmdzXG5cdFx0aWYgKHRoaXMuZnVuLm9wUmVzdEFyZyAhPT0gbnVsbClcblx0XHRcdC8vIFRPRE86IGRvIHNvbWV0aGluZyBiZXR0ZXIgZm9yIHJlc3QgYXJnXG5cdFx0XHRhcmdzID0gbmV3IFVuYXJ5RXhwcmVzc2lvbigndm9pZCcsIG5ldyBMaXRlcmFsKDApKVxuXHRcdGVsc2Vcblx0XHRcdGFyZ3MgPSBuZXcgQXJyYXlFeHByZXNzaW9uKHRoaXMuZnVuLmFyZ3MubWFwKGFyZyA9PiB7XG5cdFx0XHRcdGNvbnN0IG5hbWUgPSBuZXcgTGl0ZXJhbChhcmcubmFtZSlcblx0XHRcdFx0Y29uc3Qgb3BUeXBlID0gb3BNYXAoYXJnLm9wVHlwZSwgdDApXG5cdFx0XHRcdHJldHVybiBpZkVsc2Uob3BUeXBlLFxuXHRcdFx0XHRcdF8gPT4gbmV3IEFycmF5RXhwcmVzc2lvbihbbmFtZSwgX10pLFxuXHRcdFx0XHRcdCgpID0+IG5hbWUpXG5cdFx0XHR9KSlcblxuXHRcdGNvbnN0IGltcGwgPSB0aGlzLmZ1biBpbnN0YW5jZW9mIEZ1biA/IFt0MCh0aGlzLmZ1bildIDogW11cblx0XHRyZXR1cm4gbXNDYWxsKCdtZXRob2QnLCBuYW1lLCBhcmdzLCAuLi5pbXBsKVxuXHR9LFxuXG5cdE1vZHVsZTogdHJhbnNwaWxlTW9kdWxlLFxuXG5cdE5ldygpIHtcblx0XHRyZXR1cm4gbmV3IE5ld0V4cHJlc3Npb24odDAodGhpcy50eXBlKSwgdGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0Tm90KCkgeyByZXR1cm4gbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIHQwKHRoaXMuYXJnKSkgfSxcblxuXHRPYmpFbnRyeUFzc2lnbigpIHtcblx0XHRpZiAodGhpcy5hc3NpZ24gaW5zdGFuY2VvZiBBc3NpZ25TaW5nbGUgJiYgIXRoaXMuYXNzaWduLmFzc2lnbmVlLmlzTGF6eSgpKSB7XG5cdFx0XHRjb25zdCBuYW1lID0gdGhpcy5hc3NpZ24uYXNzaWduZWUubmFtZVxuXHRcdFx0cmV0dXJuIHQxKHRoaXMuYXNzaWduLCB2YWwgPT5cblx0XHRcdFx0dmVyaWZ5UmVzdWx0cy5pc09iakVudHJ5RXhwb3J0KHRoaXMpID9cblx0XHRcdFx0XHRleHBvcnROYW1lZE9yRGVmYXVsdCh2YWwsIG5hbWUpIDpcblx0XHRcdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRCdWlsdCwgbmFtZSksIHZhbCkpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IGFzc2lnbnMgPSB0aGlzLmFzc2lnbi5hbGxBc3NpZ25lZXMoKS5tYXAoXyA9PlxuXHRcdFx0XHRtc0NhbGwoJ3NldExhenknLCBJZEJ1aWx0LCBuZXcgTGl0ZXJhbChfLm5hbWUpLCBpZEZvckRlY2xhcmVDYWNoZWQoXykpKVxuXHRcdFx0cmV0dXJuIGNhdCh0MCh0aGlzLmFzc2lnbiksIGFzc2lnbnMpXG5cdFx0fVxuXHR9LFxuXG5cdE9iakVudHJ5UGxhaW4oKSB7XG5cdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlclN0cmluZ09yVmFsKElkQnVpbHQsIHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdE9ialNpbXBsZSgpIHtcblx0XHRyZXR1cm4gbmV3IE9iamVjdEV4cHJlc3Npb24odGhpcy5wYWlycy5tYXAocGFpciA9PlxuXHRcdFx0bmV3IFByb3BlcnR5KCdpbml0JywgcHJvcGVydHlJZE9yTGl0ZXJhbChwYWlyLmtleSksIHQwKHBhaXIudmFsdWUpKSkpXG5cdH0sXG5cblx0R2V0dGVyRnVuKCkge1xuXHRcdC8vIF8gPT4gXy5mb29cblx0XHRyZXR1cm4gbmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKFtJZEZvY3VzXSwgbWVtYmVyU3RyaW5nT3JWYWwoSWRGb2N1cywgdGhpcy5uYW1lKSlcblx0fSxcblxuXHRRdW90ZVBsYWluKCkge1xuXHRcdGlmICh0aGlzLnBhcnRzLmxlbmd0aCA9PT0gMClcblx0XHRcdHJldHVybiBMaXRFbXB0eVN0cmluZ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgcXVhc2lzID0gW10sIGV4cHJlc3Npb25zID0gW11cblxuXHRcdFx0Ly8gVGVtcGxhdGVMaXRlcmFsIG11c3Qgc3RhcnQgd2l0aCBhIFRlbXBsYXRlRWxlbWVudFxuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLnBhcnRzWzBdICE9PSAnc3RyaW5nJylcblx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmVtcHR5KVxuXG5cdFx0XHRmb3IgKGxldCBwYXJ0IG9mIHRoaXMucGFydHMpXG5cdFx0XHRcdGlmICh0eXBlb2YgcGFydCA9PT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmZvclJhd1N0cmluZyhwYXJ0KSlcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Ly8gXCJ7MX17MX1cIiBuZWVkcyBhbiBlbXB0eSBxdWFzaSBpbiB0aGUgbWlkZGxlIChhbmQgb24gdGhlIGVuZHMpXG5cdFx0XHRcdFx0aWYgKHF1YXNpcy5sZW5ndGggPT09IGV4cHJlc3Npb25zLmxlbmd0aClcblx0XHRcdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5lbXB0eSlcblx0XHRcdFx0XHRleHByZXNzaW9ucy5wdXNoKHQwKHBhcnQpKVxuXHRcdFx0XHR9XG5cblx0XHRcdC8vIFRlbXBsYXRlTGl0ZXJhbCBtdXN0IGVuZCB3aXRoIGEgVGVtcGxhdGVFbGVtZW50LCBzbyBvbmUgbW9yZSBxdWFzaSB0aGFuIGV4cHJlc3Npb24uXG5cdFx0XHRpZiAocXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoKVxuXHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZW1wdHkpXG5cblx0XHRcdHJldHVybiBuZXcgVGVtcGxhdGVMaXRlcmFsKHF1YXNpcywgZXhwcmVzc2lvbnMpXG5cdFx0fVxuXHR9LFxuXG5cdFF1b3RlU2ltcGxlKCkge1xuXHRcdHJldHVybiBuZXcgTGl0ZXJhbCh0aGlzLm5hbWUpXG5cdH0sXG5cblx0UXVvdGVUYWdnZWRUZW1wbGF0ZSgpIHtcblx0XHRyZXR1cm4gbmV3IFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbih0MCh0aGlzLnRhZyksIHQwKHRoaXMucXVvdGUpKVxuXHR9LFxuXG5cdFJhbmdlKCkge1xuXHRcdGNvbnN0IGVuZCA9IGlmRWxzZSh0aGlzLmVuZCwgdDAsICgpID0+IEdsb2JhbEluZmluaXR5KVxuXHRcdHJldHVybiBtc0NhbGwoJ3JhbmdlJywgdDAodGhpcy5zdGFydCksIGVuZCwgbmV3IExpdGVyYWwodGhpcy5pc0V4Y2x1c2l2ZSkpXG5cdH0sXG5cblx0U2V0U3ViKCkge1xuXHRcdGNvbnN0IGdldEtpbmQgPSAoKSA9PiB7XG5cdFx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0XHRjYXNlIFNldHRlcnMuSW5pdDpcblx0XHRcdFx0XHRyZXR1cm4gJ2luaXQnXG5cdFx0XHRcdGNhc2UgU2V0dGVycy5Jbml0TXV0YWJsZTpcblx0XHRcdFx0XHRyZXR1cm4gJ2luaXQtbXV0YWJsZSdcblx0XHRcdFx0Y2FzZSBTZXR0ZXJzLk11dGF0ZTpcblx0XHRcdFx0XHRyZXR1cm4gJ211dGF0ZSdcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRjb25zdCBraW5kID0gZ2V0S2luZCgpXG5cdFx0cmV0dXJuIG1zQ2FsbChcblx0XHRcdCdzZXRTdWInLFxuXHRcdFx0dDAodGhpcy5vYmplY3QpLFxuXHRcdFx0dGhpcy5zdWJiZWRzLmxlbmd0aCA9PT0gMSA/IHQwKHRoaXMuc3ViYmVkc1swXSkgOiB0aGlzLnN1YmJlZHMubWFwKHQwKSxcblx0XHRcdG1heWJlV3JhcEluQ2hlY2tDb250YWlucyh0MCh0aGlzLnZhbHVlKSwgdGhpcy5vcFR5cGUsICd2YWx1ZScpLFxuXHRcdFx0bmV3IExpdGVyYWwoa2luZCkpXG5cdH0sXG5cblx0U3BlY2lhbERvKCkge1xuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIFNwZWNpYWxEb3MuRGVidWdnZXI6IHJldHVybiBuZXcgRGVidWdnZXJTdGF0ZW1lbnQoKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHR9XG5cdH0sXG5cblx0U3BlY2lhbFZhbCgpIHtcblx0XHQvLyBNYWtlIG5ldyBvYmplY3RzIGJlY2F1c2Ugd2Ugd2lsbCBhc3NpZ24gYGxvY2AgdG8gdGhlbS5cblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5Db250YWluczpcblx0XHRcdFx0cmV0dXJuIG1zTWVtYmVyKCdjb250YWlucycpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLkRlbFN1Yjpcblx0XHRcdFx0cmV0dXJuIG1zTWVtYmVyKCdkZWxTdWInKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5GYWxzZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKGZhbHNlKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5OYW1lOlxuXHRcdFx0XHRyZXR1cm4gbmV3IExpdGVyYWwodmVyaWZ5UmVzdWx0cy5uYW1lKHRoaXMpKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5OdWxsOlxuXHRcdFx0XHRyZXR1cm4gbmV3IExpdGVyYWwobnVsbClcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuU3ViOlxuXHRcdFx0XHRyZXR1cm4gbXNNZW1iZXIoJ3N1YicpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLlRydWU6XG5cdFx0XHRcdHJldHVybiBuZXcgTGl0ZXJhbCh0cnVlKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5VbmRlZmluZWQ6XG5cdFx0XHRcdHJldHVybiBuZXcgVW5hcnlFeHByZXNzaW9uKCd2b2lkJywgTGl0WmVybylcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcih0aGlzLmtpbmQpXG5cdFx0fVxuXHR9LFxuXG5cdFNwcmVhZCgpIHtcblx0XHRyZXR1cm4gbmV3IFNwcmVhZEVsZW1lbnQodDAodGhpcy5zcHJlYWRlZCkpXG5cdH0sXG5cblx0U3VwZXJDYWxsKCkge1xuXHRcdGNvbnN0IGFyZ3MgPSB0aGlzLmFyZ3MubWFwKHQwKVxuXHRcdGNvbnN0IG1ldGhvZCA9IHZlcmlmeVJlc3VsdHMuc3VwZXJDYWxsVG9NZXRob2QuZ2V0KHRoaXMpXG5cblx0XHRpZiAobWV0aG9kIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpIHtcblx0XHRcdGNvbnN0IGNhbGwgPSBuZXcgQ2FsbEV4cHJlc3Npb24oSWRTdXBlciwgYXJncylcblx0XHRcdGNvbnN0IG1lbWJlclNldHMgPSBjb25zdHJ1Y3RvclNldE1lbWJlcnMobWV0aG9kKVxuXHRcdFx0cmV0dXJuIGNhdChjYWxsLCBtZW1iZXJTZXRzKVxuXHRcdH0gZWxzZVxuXHRcdFx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbihtZW1iZXJTdHJpbmdPclZhbChJZFN1cGVyLCBtZXRob2Quc3ltYm9sKSwgYXJncylcblx0fSxcblxuXHRTdXBlck1lbWJlcigpIHtcblx0XHRyZXR1cm4gbWVtYmVyU3RyaW5nT3JWYWwoSWRTdXBlciwgdGhpcy5uYW1lKVxuXHR9LFxuXG5cdFN3aXRjaCgpIHtcblx0XHRjb25zdCBwYXJ0cyA9IGZsYXRNYXAodGhpcy5wYXJ0cywgdDApXG5cdFx0cGFydHMucHVzaChpZkVsc2UodGhpcy5vcEVsc2UsXG5cdFx0XHRfID0+IG5ldyBTd2l0Y2hDYXNlKHVuZGVmaW5lZCwgdDAoXykuYm9keSksXG5cdFx0XHQoKSA9PiBTd2l0Y2hDYXNlTm9NYXRjaCkpXG5cdFx0cmV0dXJuIGJsb2NrV3JhcElmVmFsKHRoaXMsIG5ldyBTd2l0Y2hTdGF0ZW1lbnQodDAodGhpcy5zd2l0Y2hlZCksIHBhcnRzKSlcblx0fSxcblxuXHRTd2l0Y2hQYXJ0KCkge1xuXHRcdGNvbnN0IGZvbGxvdyA9IG9wSWYodmVyaWZ5UmVzdWx0cy5pc1N0YXRlbWVudCh0aGlzKSwgKCkgPT4gbmV3IEJyZWFrU3RhdGVtZW50KVxuXHRcdC8qXG5cdFx0V2UgY291bGQganVzdCBwYXNzIGJsb2NrLmJvZHkgZm9yIHRoZSBzd2l0Y2ggbGluZXMsIGJ1dCBpbnN0ZWFkXG5cdFx0ZW5jbG9zZSB0aGUgYm9keSBvZiB0aGUgc3dpdGNoIGNhc2UgaW4gY3VybHkgYnJhY2VzIHRvIGVuc3VyZSBhIG5ldyBzY29wZS5cblx0XHRUaGF0IHdheSB0aGlzIGNvZGUgd29ya3M6XG5cdFx0XHRzd2l0Y2ggKDApIHtcblx0XHRcdFx0Y2FzZSAwOiB7XG5cdFx0XHRcdFx0Y29uc3QgYSA9IDBcblx0XHRcdFx0XHRyZXR1cm4gYVxuXHRcdFx0XHR9XG5cdFx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0XHQvLyBXaXRob3V0IGN1cmx5IGJyYWNlcyB0aGlzIHdvdWxkIGNvbmZsaWN0IHdpdGggdGhlIG90aGVyIGBhYC5cblx0XHRcdFx0XHRjb25zdCBhID0gMVxuXHRcdFx0XHRcdGFcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdCovXG5cdFx0Y29uc3QgYmxvY2sgPSB0Myh0aGlzLnJlc3VsdCwgbnVsbCwgbnVsbCwgZm9sbG93KVxuXHRcdC8vIElmIHN3aXRjaCBoYXMgbXVsdGlwbGUgdmFsdWVzLCBidWlsZCB1cCBhIHN0YXRlbWVudCBsaWtlOiBgY2FzZSAxOiBjYXNlIDI6IHsgZG9CbG9jaygpIH1gXG5cdFx0Y29uc3QgeCA9IFtdXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnZhbHVlcy5sZW5ndGggLSAxOyBpID0gaSArIDEpXG5cdFx0XHQvLyBUaGVzZSBjYXNlcyBmYWxsdGhyb3VnaCB0byB0aGUgb25lIGF0IHRoZSBlbmQuXG5cdFx0XHR4LnB1c2gobmV3IFN3aXRjaENhc2UodDAodGhpcy52YWx1ZXNbaV0pLCBbXSkpXG5cdFx0eC5wdXNoKG5ldyBTd2l0Y2hDYXNlKHQwKHRoaXMudmFsdWVzW3RoaXMudmFsdWVzLmxlbmd0aCAtIDFdKSwgW2Jsb2NrXSkpXG5cdFx0cmV0dXJuIHhcblx0fSxcblxuXHRUaHJvdygpIHtcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BUaHJvd24sXG5cdFx0XHRfID0+IGRvVGhyb3coXyksXG5cdFx0XHQoKSA9PiBuZXcgVGhyb3dTdGF0ZW1lbnQobmV3IE5ld0V4cHJlc3Npb24oR2xvYmFsRXJyb3IsIFtMaXRTdHJUaHJvd10pKSlcblx0fSxcblxuXHRXaXRoKCkge1xuXHRcdGNvbnN0IGlkRGVjbGFyZSA9IGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzLmRlY2xhcmUpXG5cdFx0Y29uc3QgdmFsID0gdDAodGhpcy52YWx1ZSlcblx0XHRjb25zdCBsZWFkID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgW25ldyBWYXJpYWJsZURlY2xhcmF0b3IoaWREZWNsYXJlLCB2YWwpXSlcblx0XHRyZXR1cm4gdmVyaWZ5UmVzdWx0cy5pc1N0YXRlbWVudCh0aGlzKSA/XG5cdFx0XHR0MSh0aGlzLmJsb2NrLCBsZWFkKSA6XG5cdFx0XHRibG9ja1dyYXAodDModGhpcy5ibG9jaywgbGVhZCwgbnVsbCwgbmV3IFJldHVyblN0YXRlbWVudChpZERlY2xhcmUpKSlcblx0fSxcblxuXHRZaWVsZCgpIHtcblx0XHRyZXR1cm4gbmV3IFlpZWxkRXhwcmVzc2lvbihvcE1hcCh0aGlzLm9wWWllbGRlZCwgdDApLCBmYWxzZSlcblx0fSxcblxuXHRZaWVsZFRvKCkge1xuXHRcdHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKHQwKHRoaXMueWllbGRlZFRvKSwgdHJ1ZSlcblx0fVxufSlcblxuLy8gRnVuY3Rpb25zIHNwZWNpZmljIHRvIGNlcnRhaW4gZXhwcmVzc2lvbnNcblxuZnVuY3Rpb24gY2FzZUJvZHkocGFydHMsIG9wRWxzZSkge1xuXHRsZXQgYWNjID0gaWZFbHNlKG9wRWxzZSwgdDAsICgpID0+IFRocm93Tm9DYXNlTWF0Y2gpXG5cdGZvciAobGV0IGkgPSBwYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGkgPSBpIC0gMSlcblx0XHRhY2MgPSB0MShwYXJ0c1tpXSwgYWNjKVxuXHRyZXR1cm4gYWNjXG59XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdG9yU2V0TWVtYmVycyhjb25zdHJ1Y3Rvcikge1xuXHRyZXR1cm4gY29uc3RydWN0b3IubWVtYmVyQXJncy5tYXAoXyA9PlxuXHRcdG1zQ2FsbCgnbmV3UHJvcGVydHknLCBuZXcgVGhpc0V4cHJlc3Npb24oKSwgbmV3IExpdGVyYWwoXy5uYW1lKSwgaWRGb3JEZWNsYXJlQ2FjaGVkKF8pKSlcbn1cblxuZnVuY3Rpb24gZm9yTG9vcChvcEl0ZXJhdGVlLCBibG9jaykge1xuXHRyZXR1cm4gaWZFbHNlKG9wSXRlcmF0ZWUsXG5cdFx0KHtlbGVtZW50LCBiYWd9KSA9PiB7XG5cdFx0XHRjb25zdCBkZWNsYXJlID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2xldCcsXG5cdFx0XHRcdFtuZXcgVmFyaWFibGVEZWNsYXJhdG9yKHQwKGVsZW1lbnQpKV0pXG5cdFx0XHRyZXR1cm4gbmV3IEZvck9mU3RhdGVtZW50KGRlY2xhcmUsIHQwKGJhZyksIHQwKGJsb2NrKSlcblx0XHR9LFxuXHRcdCgpID0+IG5ldyBGb3JTdGF0ZW1lbnQobnVsbCwgbnVsbCwgbnVsbCwgdDAoYmxvY2spKSlcbn1cblxuZnVuY3Rpb24gdHJhbnNwaWxlQmxvY2tSZXR1cm4ocmV0dXJuZWQsIGxpbmVzLCBsZWFkLCBvcFJldHVyblR5cGUpIHtcblx0Y29uc3QgcmV0ID0gbmV3IFJldHVyblN0YXRlbWVudChcblx0XHRtYXliZVdyYXBJbkNoZWNrQ29udGFpbnMocmV0dXJuZWQsIG9wUmV0dXJuVHlwZSwgJ3JldHVybmVkIHZhbHVlJykpXG5cdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIGxpbmVzLCByZXQpKVxufVxuIl19
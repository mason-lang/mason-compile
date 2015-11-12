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

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function _interopRequireWildcard(obj) {
		if (obj && obj.__esModule) {
			return obj;
		} else {
			var newObj = {};

			if (obj != null) {
				for (var key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
				}
			}

			newObj.default = obj;
			return newObj;
		}
	}

	var _slicedToArray = (function () {
		function sliceIterator(arr, i) {
			var _arr = [];
			var _n = true;
			var _d = false;
			var _e = undefined;

			try {
				for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
					_arr.push(_s.value);

					if (i && _arr.length === i) break;
				}
			} catch (err) {
				_d = true;
				_e = err;
			} finally {
				try {
					if (!_n && _i["return"]) _i["return"]();
				} finally {
					if (_d) throw _e;
				}
			}

			return _arr;
		}

		return function (arr, i) {
			if (Array.isArray(arr)) {
				return arr;
			} else if (Symbol.iterator in Object(arr)) {
				return sliceIterator(arr, i);
			} else {
				throw new TypeError("Invalid attempt to destructure non-iterable instance");
			}
		};
	})();

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
			if (_context2.verifyResults.isStatement(this)) return new _ast.IfStatement(this.isUnless ? new _ast.UnaryExpression('!', test) : test, (0, _util3.t0)(this.result));else {
				const result = (0, _util3.msCall)('some', (0, _util3.blockWrapIfBlock)(this.result));
				const none = (0, _util3.msMember)('None');

				var _ref = this.isUnless ? [none, result] : [result, none];

				var _ref2 = _slicedToArray(_ref, 2);

				const then = _ref2[0];
				const _else = _ref2[1];
				return new _ast.ConditionalExpression(test, then, _else);
			}
		},

		Constructor() {
			return _ast.MethodDefinition.constructor(_context2.verifyResults.constructorHasSuper(this) ? (0, _util3.t2)(this.fun, _astConstants.LetLexicalThis, true) : (0, _util3.t1)(this.fun, constructorSetMembers(this)));
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
			let dontDeclareThis = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
			const isGeneratorFun = this.kind !== _MsAst.Funs.Plain;
			return (0, _context2.withInGenerator)(isGeneratorFun, () => {
				const nArgs = new _ast.Literal(this.args.length);
				const opDeclareRest = (0, _util2.opMap)(this.opRestArg, rest => (0, _util3.declare)(rest, new _ast.CallExpression(_astConstants.ArraySliceCall, [_astConstants.IdArguments, nArgs])));
				const argChecks = (0, _util2.opIf)(_context.options.includeChecks(), () => (0, _util2.flatOpMap)(this.args, _util3.opTypeCheckForLocalDeclare));
				const opDeclareThis = (0, _util2.opIf)(this.opDeclareThis !== null && !dontDeclareThis, () => _astConstants.DeclareLexicalThis);
				const lead = (0, _util2.cat)(opDeclareRest, opDeclareThis, argChecks, leadStatements);

				const body = () => (0, _util3.t2)(this.block, lead, this.opReturnType);

				const args = this.args.map(_util3.t0);
				const id = (0, _util2.opMap)(_context2.verifyResults.opName(this), _util.identifier);

				switch (this.kind) {
					case _MsAst.Funs.Plain:
						if (id === null && this.opDeclareThis === null && opDeclareRest === null) return new _ast.ArrowFunctionExpression(args, body());else return new _ast.FunctionExpression(id, args, body());

					case _MsAst.Funs.Async:
						{
							const plainBody = (0, _util3.t2)(this.block, null, this.opReturnType);
							const genFunc = new _ast.FunctionExpression(null, [], plainBody, true);
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
			if (this.name === 'this') return _astConstants.IdLexicalThis;else {
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

		SimpleFun() {
			return new _ast.ArrowFunctionExpression([_astConstants.IdFocus], (0, _util3.t0)(this.value));
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
				return (0, _util2.cat)(call, memberSets, _astConstants.SetLexicalThis);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQTZCd0IsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQUFULFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BeUQxQixJQUFJLHlEQUFDLElBQUk7T0FBRSxZQUFZLHlEQUFDLElBQUk7T0FBRSxNQUFNLHlEQUFDLElBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0EwSTNDLGNBQWMseURBQUMsSUFBSTtPQUFFLGVBQWUseURBQUMsS0FBSyIsImZpbGUiOiJ0cmFuc3BpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FycmF5RXhwcmVzc2lvbiwgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24sIEFzc2lnbm1lbnRFeHByZXNzaW9uLCBCaW5hcnlFeHByZXNzaW9uLFxuXHRCbG9ja1N0YXRlbWVudCwgQnJlYWtTdGF0ZW1lbnQsIENhbGxFeHByZXNzaW9uLCBDYXRjaENsYXVzZSwgQ2xhc3NCb2R5LCBDbGFzc0V4cHJlc3Npb24sXG5cdENvbmRpdGlvbmFsRXhwcmVzc2lvbiwgRGVidWdnZXJTdGF0ZW1lbnQsIEZvck9mU3RhdGVtZW50LCBGb3JTdGF0ZW1lbnQsIEZ1bmN0aW9uRXhwcmVzc2lvbixcblx0SWRlbnRpZmllciwgSWZTdGF0ZW1lbnQsIExpdGVyYWwsIExvZ2ljYWxFeHByZXNzaW9uLCBNZW1iZXJFeHByZXNzaW9uLCBNZXRob2REZWZpbml0aW9uLFxuXHROZXdFeHByZXNzaW9uLCBPYmplY3RFeHByZXNzaW9uLCBQcm9wZXJ0eSwgUmV0dXJuU3RhdGVtZW50LCBTcHJlYWRFbGVtZW50LCBTd2l0Y2hDYXNlLFxuXHRTd2l0Y2hTdGF0ZW1lbnQsIFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbiwgVGVtcGxhdGVFbGVtZW50LCBUZW1wbGF0ZUxpdGVyYWwsIFRoaXNFeHByZXNzaW9uLFxuXHRUaHJvd1N0YXRlbWVudCwgVHJ5U3RhdGVtZW50LCBWYXJpYWJsZURlY2xhcmF0aW9uLCBVbmFyeUV4cHJlc3Npb24sIFZhcmlhYmxlRGVjbGFyYXRvcixcblx0WWllbGRFeHByZXNzaW9ufSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7aWRlbnRpZmllciwgbWVtYmVyLCBwcm9wZXJ0eUlkT3JMaXRlcmFsfSBmcm9tICdlc2FzdC9kaXN0L3V0aWwnXG5pbXBvcnQge29wdGlvbnN9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtBc3NpZ25TaW5nbGUsIENhbGwsIENvbnN0cnVjdG9yLCBGdW4sIEZ1bnMsIExvZ2ljcywgTWVtYmVyLCBMb2NhbERlY2xhcmVzLCBQYXR0ZXJuLCBTZXR0ZXJzLFxuXHRTcGVjaWFsRG9zLCBTcGVjaWFsVmFsc30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2Fzc2VydCwgY2F0LCBmbGF0TWFwLCBmbGF0T3BNYXAsIGlmRWxzZSwgaW1wbGVtZW50TWFueSwgaXNFbXB0eSwgbGFzdCwgb3BJZiwgb3BNYXAsIHJ0YWlsLFxuXHR0YWlsfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtCbG9ja3N9IGZyb20gJy4uL1ZlcmlmeVJlc3VsdHMnXG5pbXBvcnQge0FycmF5U2xpY2VDYWxsLCBEZWNsYXJlQnVpbHRCYWcsIERlY2xhcmVCdWlsdE1hcCwgRGVjbGFyZUJ1aWx0T2JqLCBEZWNsYXJlTGV4aWNhbFRoaXMsXG5cdElkQXJndW1lbnRzLCBJZEJ1aWx0LCBJZEV4dHJhY3QsIElkRm9jdXMsIElkTGV4aWNhbFRoaXMsIElkU3VwZXIsIEdsb2JhbEVycm9yLCBHbG9iYWxJbmZpbml0eSxcblx0TGV0TGV4aWNhbFRoaXMsIExpdEVtcHR5U3RyaW5nLCBMaXROdWxsLCBMaXRTdHJUaHJvdywgTGl0WmVybywgUmV0dXJuQnVpbHQsIFJldHVybkZvY3VzLFxuXHRTZXRMZXhpY2FsVGhpcywgU3dpdGNoQ2FzZU5vTWF0Y2gsIFRocm93QXNzZXJ0RmFpbCwgVGhyb3dOb0Nhc2VNYXRjaH0gZnJvbSAnLi9hc3QtY29uc3RhbnRzJ1xuaW1wb3J0IHtzZXR1cCwgdGVhckRvd24sIHZlcmlmeVJlc3VsdHMsIHdpdGhJbkdlbmVyYXRvcn0gZnJvbSAnLi9jb250ZXh0J1xuaW1wb3J0IHt0cmFuc3BpbGVNZXRob2RUb0RlZmluaXRpb24sIHRyYW5zcGlsZU1ldGhvZFRvUHJvcGVydHl9IGZyb20gJy4vdHJhbnNwaWxlTWV0aG9kJ1xuaW1wb3J0IHRyYW5zcGlsZU1vZHVsZSwge2V4cG9ydE5hbWVkT3JEZWZhdWx0fSBmcm9tICcuL3RyYW5zcGlsZU1vZHVsZSdcbmltcG9ydCB7YWNjZXNzTG9jYWxEZWNsYXJlLCBibG9ja1dyYXAsIGJsb2NrV3JhcElmQmxvY2ssIGJsb2NrV3JhcElmVmFsLCBkZWNsYXJlLCBkb1Rocm93LFxuXHRpZEZvckRlY2xhcmVDYWNoZWQsIGxhenlXcmFwLCBtYWtlRGVjbGFyYXRvciwgbWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMsXG5cdG1heWJlV3JhcEluQ2hlY2tDb250YWlucywgbWVtYmVyU3RyaW5nT3JWYWwsIG1zQ2FsbCwgbXNNZW1iZXIsIG9wVHlwZUNoZWNrRm9yTG9jYWxEZWNsYXJlLCB0MCxcblx0dDEsIHQyLCB0MywgdExpbmVzLCB0cmFuc3BpbGVOYW1lfSBmcm9tICcuL3V0aWwnXG5cbi8qKiBUcmFuc2Zvcm0gYSB7QGxpbmsgTXNBc3R9IGludG8gYW4gZXNhc3QuICoqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhbnNwaWxlKG1vZHVsZUV4cHJlc3Npb24sIHZlcmlmeVJlc3VsdHMpIHtcblx0c2V0dXAodmVyaWZ5UmVzdWx0cylcblx0Y29uc3QgcmVzID0gdDAobW9kdWxlRXhwcmVzc2lvbilcblx0dGVhckRvd24oKVxuXHRyZXR1cm4gcmVzXG59XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ3RyYW5zcGlsZScsIHtcblx0QXNzZXJ0KCkge1xuXHRcdGNvbnN0IGZhaWxDb25kID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgY29uZCA9IHQwKHRoaXMuY29uZGl0aW9uKVxuXHRcdFx0cmV0dXJuIHRoaXMubmVnYXRlID8gY29uZCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCBjb25kKVxuXHRcdH1cblxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcFRocm93bixcblx0XHRcdF8gPT4gbmV3IElmU3RhdGVtZW50KGZhaWxDb25kKCksIGRvVGhyb3coXykpLFxuXHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5jb25kaXRpb24gaW5zdGFuY2VvZiBDYWxsKSB7XG5cdFx0XHRcdFx0Y29uc3QgY2FsbCA9IHRoaXMuY29uZGl0aW9uXG5cdFx0XHRcdFx0Y29uc3QgY2FsbGVkID0gY2FsbC5jYWxsZWRcblx0XHRcdFx0XHRjb25zdCBhcmdzID0gY2FsbC5hcmdzLm1hcCh0MClcblx0XHRcdFx0XHRpZiAoY2FsbGVkIGluc3RhbmNlb2YgTWVtYmVyKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBhc3MgPSB0aGlzLm5lZ2F0ZSA/ICdhc3NlcnROb3RNZW1iZXInIDogJ2Fzc2VydE1lbWJlcidcblx0XHRcdFx0XHRcdHJldHVybiBtc0NhbGwoYXNzLCB0MChjYWxsZWQub2JqZWN0KSwgdHJhbnNwaWxlTmFtZShjYWxsZWQubmFtZSksIC4uLmFyZ3MpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnN0IGFzcyA9IHRoaXMubmVnYXRlID8gJ2Fzc2VydE5vdCcgOiAnYXNzZXJ0J1xuXHRcdFx0XHRcdFx0cmV0dXJuIG1zQ2FsbChhc3MsIHQwKGNhbGxlZCksIC4uLmFyZ3MpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KGZhaWxDb25kKCksIFRocm93QXNzZXJ0RmFpbClcblx0XHRcdH0pXG5cdH0sXG5cblx0QXNzaWduU2luZ2xlKHZhbFdyYXApIHtcblx0XHRjb25zdCB2YWwgPSB2YWxXcmFwID09PSB1bmRlZmluZWQgPyB0MCh0aGlzLnZhbHVlKSA6IHZhbFdyYXAodDAodGhpcy52YWx1ZSkpXG5cdFx0Y29uc3QgZGVjbGFyZSA9IG1ha2VEZWNsYXJhdG9yKHRoaXMuYXNzaWduZWUsIHZhbCwgZmFsc2UpXG5cdFx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKHRoaXMuYXNzaWduZWUuaXNNdXRhYmxlKCkgPyAnbGV0JyA6ICdjb25zdCcsIFtkZWNsYXJlXSlcblx0fSxcblx0Ly8gVE9ETzpFUzYgSnVzdCB1c2UgbmF0aXZlIGRlc3RydWN0dXJpbmcgYXNzaWduXG5cdEFzc2lnbkRlc3RydWN0dXJlKCkge1xuXHRcdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbihcblx0XHRcdHRoaXMua2luZCgpID09PSBMb2NhbERlY2xhcmVzLk11dGFibGUgPyAnbGV0JyA6ICdjb25zdCcsXG5cdFx0XHRtYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycyhcblx0XHRcdFx0dGhpcy5hc3NpZ25lZXMsXG5cdFx0XHRcdHRoaXMua2luZCgpID09PSBMb2NhbERlY2xhcmVzLkxhenksXG5cdFx0XHRcdHQwKHRoaXMudmFsdWUpLFxuXHRcdFx0XHRmYWxzZSkpXG5cdH0sXG5cblx0QmFnRW50cnkoKSB7XG5cdFx0cmV0dXJuIG1zQ2FsbCh0aGlzLmlzTWFueSA/ICdhZGRNYW55JyA6ICdhZGQnLCBJZEJ1aWx0LCB0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRCYWdTaW1wbGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBBcnJheUV4cHJlc3Npb24odGhpcy5wYXJ0cy5tYXAodDApKVxuXHR9LFxuXG5cdEJsb2NrKGxlYWQ9bnVsbCwgb3BSZXR1cm5UeXBlPW51bGwsIGZvbGxvdz1udWxsKSB7XG5cdFx0Y29uc3Qga2luZCA9IHZlcmlmeVJlc3VsdHMuYmxvY2tLaW5kKHRoaXMpXG5cdFx0c3dpdGNoIChraW5kKSB7XG5cdFx0XHRjYXNlIEJsb2Nrcy5Ebzpcblx0XHRcdFx0YXNzZXJ0KG9wUmV0dXJuVHlwZSA9PT0gbnVsbClcblx0XHRcdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgdExpbmVzKHRoaXMubGluZXMpLCBmb2xsb3cpKVxuXHRcdFx0Y2FzZSBCbG9ja3MuVGhyb3c6XG5cdFx0XHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoXG5cdFx0XHRcdFx0Y2F0KGxlYWQsIHRMaW5lcyhydGFpbCh0aGlzLmxpbmVzKSksIHQwKGxhc3QodGhpcy5saW5lcykpKSlcblx0XHRcdGNhc2UgQmxvY2tzLlJldHVybjpcblx0XHRcdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrUmV0dXJuKFxuXHRcdFx0XHRcdHQwKGxhc3QodGhpcy5saW5lcykpLCB0TGluZXMocnRhaWwodGhpcy5saW5lcykpLCBsZWFkLCBvcFJldHVyblR5cGUpXG5cdFx0XHRjYXNlIEJsb2Nrcy5CYWc6IGNhc2UgQmxvY2tzLk1hcDogY2FzZSBCbG9ja3MuT2JqOiB7XG5cdFx0XHRcdGNvbnN0IGRlY2xhcmUgPSBraW5kID09PSBCbG9ja3MuQmFnID9cblx0XHRcdFx0XHREZWNsYXJlQnVpbHRCYWcgOlxuXHRcdFx0XHRcdGtpbmQgPT09IEJsb2Nrcy5NYXAgPyBEZWNsYXJlQnVpbHRNYXAgOiBEZWNsYXJlQnVpbHRPYmpcblx0XHRcdFx0Y29uc3QgYm9keSA9IGNhdChkZWNsYXJlLCB0TGluZXModGhpcy5saW5lcykpXG5cdFx0XHRcdHJldHVybiB0cmFuc3BpbGVCbG9ja1JldHVybihJZEJ1aWx0LCBib2R5LCBsZWFkLCBvcFJldHVyblR5cGUpXG5cdFx0XHR9XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3Ioa2luZClcblx0XHR9XG5cdH0sXG5cblx0QmxvY2tXcmFwKCkge1xuXHRcdHJldHVybiBibG9ja1dyYXAodDAodGhpcy5ibG9jaykpXG5cdH0sXG5cblx0QnJlYWsoKSB7XG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wVmFsdWUsXG5cdFx0XHRfID0+IG5ldyBSZXR1cm5TdGF0ZW1lbnQodDAoXykpLFxuXHRcdFx0KCkgPT4gbmV3IEJyZWFrU3RhdGVtZW50KCkpXG5cdH0sXG5cblx0Q2FsbCgpIHtcblx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKHQwKHRoaXMuY2FsbGVkKSwgdGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0Q2FzZSgpIHtcblx0XHRjb25zdCBib2R5ID0gY2FzZUJvZHkodGhpcy5wYXJ0cywgdGhpcy5vcEVsc2UpXG5cdFx0aWYgKHZlcmlmeVJlc3VsdHMuaXNTdGF0ZW1lbnQodGhpcykpXG5cdFx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BDYXNlZCwgXyA9PiBuZXcgQmxvY2tTdGF0ZW1lbnQoW3QwKF8pLCBib2R5XSksICgpID0+IGJvZHkpXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBibG9jayA9IGlmRWxzZSh0aGlzLm9wQ2FzZWQsIF8gPT4gW3QwKF8pLCBib2R5XSwgKCkgPT4gW2JvZHldKVxuXHRcdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoYmxvY2spKVxuXHRcdH1cblx0fSxcblxuXHRDYXNlUGFydChhbHRlcm5hdGUpIHtcblx0XHRpZiAodGhpcy50ZXN0IGluc3RhbmNlb2YgUGF0dGVybikge1xuXHRcdFx0Y29uc3Qge3R5cGUsIHBhdHRlcm5lZCwgbG9jYWxzfSA9IHRoaXMudGVzdFxuXHRcdFx0Y29uc3QgZGVjbCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRcdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZEV4dHJhY3QsIG1zQ2FsbCgnZXh0cmFjdCcsIHQwKHR5cGUpLCB0MChwYXR0ZXJuZWQpKSldKVxuXHRcdFx0Y29uc3QgdGVzdCA9IG5ldyBCaW5hcnlFeHByZXNzaW9uKCchPT0nLCBJZEV4dHJhY3QsIExpdE51bGwpXG5cdFx0XHRjb25zdCBleHRyYWN0ID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgbG9jYWxzLm1hcCgoXywgaWR4KSA9PlxuXHRcdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKFxuXHRcdFx0XHRcdGlkRm9yRGVjbGFyZUNhY2hlZChfKSxcblx0XHRcdFx0XHRuZXcgTWVtYmVyRXhwcmVzc2lvbihJZEV4dHJhY3QsIG5ldyBMaXRlcmFsKGlkeCkpKSkpXG5cdFx0XHRjb25zdCByZXMgPSB0MSh0aGlzLnJlc3VsdCwgZXh0cmFjdClcblx0XHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoW2RlY2wsIG5ldyBJZlN0YXRlbWVudCh0ZXN0LCByZXMsIGFsdGVybmF0ZSldKVxuXHRcdH0gZWxzZVxuXHRcdFx0Ly8gYWx0ZXJuYXRlIHdyaXR0ZW4gdG8gYnkgYGNhc2VCb2R5YC5cblx0XHRcdHJldHVybiBuZXcgSWZTdGF0ZW1lbnQodDAodGhpcy50ZXN0KSwgdDAodGhpcy5yZXN1bHQpLCBhbHRlcm5hdGUpXG5cdH0sXG5cblx0Q2xhc3MoKSB7XG5cdFx0Y29uc3QgbWV0aG9kcyA9IGNhdChcblx0XHRcdHRoaXMuc3RhdGljcy5tYXAoXyA9PiB0cmFuc3BpbGVNZXRob2RUb0RlZmluaXRpb24oXywgdHJ1ZSkpLFxuXHRcdFx0b3BNYXAodGhpcy5vcENvbnN0cnVjdG9yLCB0MCksXG5cdFx0XHR0aGlzLm1ldGhvZHMubWFwKF8gPT4gdHJhbnNwaWxlTWV0aG9kVG9EZWZpbml0aW9uKF8sIGZhbHNlKSkpXG5cdFx0Y29uc3Qgb3BOYW1lID0gb3BNYXAodmVyaWZ5UmVzdWx0cy5vcE5hbWUodGhpcyksIGlkZW50aWZpZXIpXG5cdFx0Y29uc3QgY2xhc3NFeHByID0gbmV3IENsYXNzRXhwcmVzc2lvbihvcE5hbWUsXG5cdFx0XHRvcE1hcCh0aGlzLm9wU3VwZXJDbGFzcywgdDApLCBuZXcgQ2xhc3NCb2R5KG1ldGhvZHMpKVxuXG5cdFx0aWYgKHRoaXMub3BEbyA9PT0gbnVsbCAmJiBpc0VtcHR5KHRoaXMua2luZHMpKVxuXHRcdFx0cmV0dXJuIGNsYXNzRXhwclxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgbGVhZCA9IGNhdChcblx0XHRcdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgW1xuXHRcdFx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRGb2N1cywgY2xhc3NFeHByKV0pLFxuXHRcdFx0XHR0aGlzLmtpbmRzLm1hcChfID0+IG1zQ2FsbCgna2luZERvJywgSWRGb2N1cywgdDAoXykpKSlcblx0XHRcdGNvbnN0IGJsb2NrID0gaWZFbHNlKHRoaXMub3BEbyxcblx0XHRcdFx0XyA9PiB0MyhfLmJsb2NrLCBsZWFkLCBudWxsLCBSZXR1cm5Gb2N1cyksXG5cdFx0XHRcdCgpID0+IG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgUmV0dXJuRm9jdXMpKSlcblx0XHRcdHJldHVybiBibG9ja1dyYXAoYmxvY2spXG5cdFx0fVxuXHR9LFxuXG5cdENvbmQoKSB7XG5cdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odDAodGhpcy50ZXN0KSwgdDAodGhpcy5pZlRydWUpLCB0MCh0aGlzLmlmRmFsc2UpKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsKCkge1xuXHRcdGNvbnN0IHRlc3QgPSB0MCh0aGlzLnRlc3QpXG5cdFx0aWYgKHZlcmlmeVJlc3VsdHMuaXNTdGF0ZW1lbnQodGhpcykpXG5cdFx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KFxuXHRcdFx0XHR0aGlzLmlzVW5sZXNzID8gbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIHRlc3QpIDogdGVzdCwgdDAodGhpcy5yZXN1bHQpKVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gbXNDYWxsKCdzb21lJywgYmxvY2tXcmFwSWZCbG9jayh0aGlzLnJlc3VsdCkpXG5cdFx0XHRjb25zdCBub25lID0gbXNNZW1iZXIoJ05vbmUnKVxuXHRcdFx0Y29uc3QgW3RoZW4sIF9lbHNlXSA9IHRoaXMuaXNVbmxlc3MgPyBbbm9uZSwgcmVzdWx0XSA6IFtyZXN1bHQsIG5vbmVdXG5cdFx0XHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXN0LCB0aGVuLCBfZWxzZSlcblx0XHR9XG5cdH0sXG5cblx0Q29uc3RydWN0b3IoKSB7XG5cdFx0Ly8gSWYgdGhlcmUgaXMgYSBgc3VwZXJgLCBgdGhpc2Agd2lsbCBub3QgYmUgZGVmaW5lZCB1bnRpbCB0aGVuLFxuXHRcdC8vIHNvIG11c3Qgd2FpdCB1bnRpbCB0aGVuLlxuXHRcdC8vIE90aGVyd2lzZSwgZG8gaXQgYXQgdGhlIGJlZ2lubmluZy5cblx0XHRyZXR1cm4gTWV0aG9kRGVmaW5pdGlvbi5jb25zdHJ1Y3Rvcih2ZXJpZnlSZXN1bHRzLmNvbnN0cnVjdG9ySGFzU3VwZXIodGhpcykgP1xuXHRcdFx0dDIodGhpcy5mdW4sIExldExleGljYWxUaGlzLCB0cnVlKSA6XG5cdFx0XHR0MSh0aGlzLmZ1biwgY29uc3RydWN0b3JTZXRNZW1iZXJzKHRoaXMpKSlcblx0fSxcblxuXHRDYXRjaCgpIHtcblx0XHRyZXR1cm4gbmV3IENhdGNoQ2xhdXNlKHQwKHRoaXMuY2F1Z2h0KSwgdDAodGhpcy5ibG9jaykpXG5cdH0sXG5cblx0RXhjZXB0KCkge1xuXHRcdHJldHVybiBibG9ja1dyYXBJZlZhbCh0aGlzLFxuXHRcdFx0bmV3IFRyeVN0YXRlbWVudCh0MCh0aGlzLnRyeSksIG9wTWFwKHRoaXMub3BDYXRjaCwgdDApLCBvcE1hcCh0aGlzLm9wRmluYWxseSwgdDApKSlcblx0fSxcblxuXHRGb3IoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcElmVmFsKHRoaXMsIGZvckxvb3AodGhpcy5vcEl0ZXJhdGVlLCB0aGlzLmJsb2NrKSlcblx0fSxcblxuXHRGb3JCYWcoKSB7XG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW1xuXHRcdFx0RGVjbGFyZUJ1aWx0QmFnLFxuXHRcdFx0Zm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spLFxuXHRcdFx0UmV0dXJuQnVpbHRcblx0XHRdKSlcblx0fSxcblxuXHQvLyBsZWFkU3RhdGVtZW50cyBjb21lcyBmcm9tIGNvbnN0cnVjdG9yIG1lbWJlcnNcblx0Ly8gZG9udERlY2xhcmVUaGlzOiBhcHBsaWVzIGlmIHRoaXMgaXMgdGhlIGZ1biBmb3IgYSBDb25zdHJ1Y3Rvcixcblx0Ly8gd2hpY2ggbWF5IGRlY2xhcmUgYHRoaXNgIGF0IGEgYHN1cGVyYCBjYWxsLlxuXHRGdW4obGVhZFN0YXRlbWVudHM9bnVsbCwgZG9udERlY2xhcmVUaGlzPWZhbHNlKSB7XG5cdFx0Y29uc3QgaXNHZW5lcmF0b3JGdW4gPSB0aGlzLmtpbmQgIT09IEZ1bnMuUGxhaW5cblx0XHRyZXR1cm4gd2l0aEluR2VuZXJhdG9yKGlzR2VuZXJhdG9yRnVuLCAoKSA9PiB7XG5cdFx0XHQvLyBUT0RPOkVTNiB1c2UgYC4uLmBmXG5cdFx0XHRjb25zdCBuQXJncyA9IG5ldyBMaXRlcmFsKHRoaXMuYXJncy5sZW5ndGgpXG5cdFx0XHRjb25zdCBvcERlY2xhcmVSZXN0ID0gb3BNYXAodGhpcy5vcFJlc3RBcmcsIHJlc3QgPT5cblx0XHRcdFx0ZGVjbGFyZShyZXN0LCBuZXcgQ2FsbEV4cHJlc3Npb24oQXJyYXlTbGljZUNhbGwsIFtJZEFyZ3VtZW50cywgbkFyZ3NdKSkpXG5cdFx0XHRjb25zdCBhcmdDaGVja3MgPSBvcElmKG9wdGlvbnMuaW5jbHVkZUNoZWNrcygpLCAoKSA9PlxuXHRcdFx0XHRmbGF0T3BNYXAodGhpcy5hcmdzLCBvcFR5cGVDaGVja0ZvckxvY2FsRGVjbGFyZSkpXG5cblx0XHRcdGNvbnN0IG9wRGVjbGFyZVRoaXMgPSBvcElmKHRoaXMub3BEZWNsYXJlVGhpcyAhPT0gbnVsbCAmJiAhZG9udERlY2xhcmVUaGlzLCAoKSA9PlxuXHRcdFx0XHREZWNsYXJlTGV4aWNhbFRoaXMpXG5cblx0XHRcdGNvbnN0IGxlYWQgPSBjYXQob3BEZWNsYXJlUmVzdCwgb3BEZWNsYXJlVGhpcywgYXJnQ2hlY2tzLCBsZWFkU3RhdGVtZW50cylcblxuXHRcdFx0Y29uc3QgYm9keSA9KCkgPT4gdDIodGhpcy5ibG9jaywgbGVhZCwgdGhpcy5vcFJldHVyblR5cGUpXG5cdFx0XHRjb25zdCBhcmdzID0gdGhpcy5hcmdzLm1hcCh0MClcblx0XHRcdGNvbnN0IGlkID0gb3BNYXAodmVyaWZ5UmVzdWx0cy5vcE5hbWUodGhpcyksIGlkZW50aWZpZXIpXG5cblx0XHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRcdGNhc2UgRnVucy5QbGFpbjpcblx0XHRcdFx0XHQvLyBUT0RPOkVTNiBTaG91bGQgYmUgYWJsZSB0byB1c2UgcmVzdCBhcmdzIGluIGFycm93IGZ1bmN0aW9uXG5cdFx0XHRcdFx0aWYgKGlkID09PSBudWxsICYmIHRoaXMub3BEZWNsYXJlVGhpcyA9PT0gbnVsbCAmJiBvcERlY2xhcmVSZXN0ID09PSBudWxsKVxuXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihhcmdzLCBib2R5KCkpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIGFyZ3MsIGJvZHkoKSlcblx0XHRcdFx0Y2FzZSBGdW5zLkFzeW5jOiB7XG5cdFx0XHRcdFx0Y29uc3QgcGxhaW5Cb2R5ID0gdDIodGhpcy5ibG9jaywgbnVsbCwgdGhpcy5vcFJldHVyblR5cGUpXG5cdFx0XHRcdFx0Y29uc3QgZ2VuRnVuYyA9IG5ldyBGdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgW10sIHBsYWluQm9keSwgdHJ1ZSlcblx0XHRcdFx0XHRjb25zdCByZXQgPSBuZXcgUmV0dXJuU3RhdGVtZW50KG1zQ2FsbCgnYXN5bmMnLCBnZW5GdW5jKSlcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihpZCwgYXJncywgbmV3IEJsb2NrU3RhdGVtZW50KGNhdChsZWFkLCByZXQpKSlcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlIEZ1bnMuR2VuZXJhdG9yOlxuXHRcdFx0XHRcdHJldHVybiBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKGlkLCBhcmdzLCBib2R5KCksIHRydWUpXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHRcdH1cblx0XHR9KVxuXHR9LFxuXG5cdElnbm9yZSgpIHtcblx0XHRyZXR1cm4gW11cblx0fSxcblxuXHRLaW5kKCkge1xuXHRcdGNvbnN0IG5hbWUgPSBuZXcgTGl0ZXJhbCh2ZXJpZnlSZXN1bHRzLm5hbWUodGhpcykpXG5cdFx0Y29uc3Qgc3VwZXJzID0gbmV3IEFycmF5RXhwcmVzc2lvbih0aGlzLnN1cGVyS2luZHMubWFwKHQwKSlcblx0XHRjb25zdCBtZXRob2RzID0gXyA9PlxuXHRcdFx0bmV3IE9iamVjdEV4cHJlc3Npb24oXy5tYXAodHJhbnNwaWxlTWV0aG9kVG9Qcm9wZXJ0eSkpXG5cdFx0Y29uc3Qga2luZCA9IG1zQ2FsbCgna2luZCcsIG5hbWUsIHN1cGVycywgbWV0aG9kcyh0aGlzLnN0YXRpY3MpLCBtZXRob2RzKHRoaXMubWV0aG9kcykpXG5cblx0XHRpZiAodGhpcy5vcERvID09PSBudWxsKVxuXHRcdFx0cmV0dXJuIGtpbmRcblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IGxlYWQgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLFxuXHRcdFx0XHRbbmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZEZvY3VzLCBraW5kKV0pXG5cdFx0XHRyZXR1cm4gYmxvY2tXcmFwKHQzKHRoaXMub3BEby5ibG9jaywgbGVhZCwgbnVsbCwgUmV0dXJuRm9jdXMpKVxuXHRcdH1cblx0fSxcblxuXHRMYXp5KCkge1xuXHRcdHJldHVybiBsYXp5V3JhcCh0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHROdW1iZXJMaXRlcmFsKCkge1xuXHRcdC8vIE5lZ2F0aXZlIG51bWJlcnMgYXJlIG5vdCBwYXJ0IG9mIEVTIHNwZWMuXG5cdFx0Ly8gaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzUuMS8jc2VjLTcuOC4zXG5cdFx0Y29uc3QgdmFsdWUgPSBOdW1iZXIodGhpcy52YWx1ZSlcblx0XHRjb25zdCBsaXQgPSBuZXcgTGl0ZXJhbChNYXRoLmFicyh2YWx1ZSkpXG5cdFx0Y29uc3QgaXNQb3NpdGl2ZSA9IHZhbHVlID49IDAgJiYgMSAvIHZhbHVlICE9PSAtSW5maW5pdHlcblx0XHRyZXR1cm4gaXNQb3NpdGl2ZSA/IGxpdCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJy0nLCBsaXQpXG5cdH0sXG5cblx0TG9jYWxBY2Nlc3MoKSB7XG5cdFx0aWYgKHRoaXMubmFtZSA9PT0gJ3RoaXMnKVxuXHRcdFx0cmV0dXJuIElkTGV4aWNhbFRoaXNcblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IGxkID0gdmVyaWZ5UmVzdWx0cy5sb2NhbERlY2xhcmVGb3JBY2Nlc3ModGhpcylcblx0XHRcdC8vIElmIGxkIG1pc3NpbmcsIHRoaXMgaXMgYSBidWlsdGluLCBhbmQgYnVpbHRpbnMgYXJlIG5ldmVyIGxhenlcblx0XHRcdHJldHVybiBsZCA9PT0gdW5kZWZpbmVkID8gaWRlbnRpZmllcih0aGlzLm5hbWUpIDogYWNjZXNzTG9jYWxEZWNsYXJlKGxkKVxuXHRcdH1cblx0fSxcblxuXHRMb2NhbERlY2xhcmUoKSB7IHJldHVybiBuZXcgSWRlbnRpZmllcihpZEZvckRlY2xhcmVDYWNoZWQodGhpcykubmFtZSkgfSxcblxuXHRMb2NhbE11dGF0ZSgpIHtcblx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgaWRlbnRpZmllcih0aGlzLm5hbWUpLCB0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRMb2dpYygpIHtcblx0XHRjb25zdCBvcCA9IHRoaXMua2luZCA9PT0gTG9naWNzLkFuZCA/ICcmJicgOiAnfHwnXG5cdFx0cmV0dXJuIHRhaWwodGhpcy5hcmdzKS5yZWR1Y2UoKGEsIGIpID0+XG5cdFx0XHRuZXcgTG9naWNhbEV4cHJlc3Npb24ob3AsIGEsIHQwKGIpKSwgdDAodGhpcy5hcmdzWzBdKSlcblx0fSxcblxuXHRNYXBFbnRyeSgpIHsgcmV0dXJuIG1zQ2FsbCgnc2V0U3ViJywgSWRCdWlsdCwgdDAodGhpcy5rZXkpLCB0MCh0aGlzLnZhbCkpIH0sXG5cblx0TWVtYmVyKCkge1xuXHRcdHJldHVybiBtZW1iZXJTdHJpbmdPclZhbCh0MCh0aGlzLm9iamVjdCksIHRoaXMubmFtZSlcblx0fSxcblxuXHRNZW1iZXJGdW4oKSB7XG5cdFx0Y29uc3QgbmFtZSA9IHRyYW5zcGlsZU5hbWUodGhpcy5uYW1lKVxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcE9iamVjdCxcblx0XHRcdF8gPT4gbXNDYWxsKCdtZXRob2RCb3VuZCcsIHQwKF8pLCBuYW1lKSxcblx0XHRcdCgpID0+IG1zQ2FsbCgnbWV0aG9kVW5ib3VuZCcsIG5hbWUpKVxuXHR9LFxuXG5cdE1lbWJlclNldCgpIHtcblx0XHRjb25zdCBvYmogPSB0MCh0aGlzLm9iamVjdClcblx0XHRjb25zdCB2YWwgPSBtYXliZVdyYXBJbkNoZWNrQ29udGFpbnModDAodGhpcy52YWx1ZSksIHRoaXMub3BUeXBlLCB0aGlzLm5hbWUpXG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU2V0dGVycy5Jbml0OlxuXHRcdFx0XHRyZXR1cm4gbXNDYWxsKCduZXdQcm9wZXJ0eScsIG9iaiwgdHJhbnNwaWxlTmFtZSh0aGlzLm5hbWUpLCB2YWwpXG5cdFx0XHRjYXNlIFNldHRlcnMuSW5pdE11dGFibGU6XG5cdFx0XHRcdHJldHVybiBtc0NhbGwoJ25ld011dGFibGVQcm9wZXJ0eScsIG9iaiwgdHJhbnNwaWxlTmFtZSh0aGlzLm5hbWUpLCB2YWwpXG5cdFx0XHRjYXNlIFNldHRlcnMuTXV0YXRlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyU3RyaW5nT3JWYWwob2JqLCB0aGlzLm5hbWUpLCB2YWwpXG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdH1cblx0fSxcblxuXHRNZXRob2QoKSB7XG5cdFx0Y29uc3QgbmFtZSA9IG5ldyBMaXRlcmFsKHZlcmlmeVJlc3VsdHMubmFtZSh0aGlzKSlcblxuXHRcdGxldCBhcmdzXG5cdFx0aWYgKHRoaXMuZnVuLm9wUmVzdEFyZyAhPT0gbnVsbClcblx0XHRcdC8vIFRPRE86IGRvIHNvbWV0aGluZyBiZXR0ZXIgZm9yIHJlc3QgYXJnXG5cdFx0XHRhcmdzID0gbmV3IFVuYXJ5RXhwcmVzc2lvbigndm9pZCcsIG5ldyBMaXRlcmFsKDApKVxuXHRcdGVsc2Vcblx0XHRcdGFyZ3MgPSBuZXcgQXJyYXlFeHByZXNzaW9uKHRoaXMuZnVuLmFyZ3MubWFwKGFyZyA9PiB7XG5cdFx0XHRcdGNvbnN0IG5hbWUgPSBuZXcgTGl0ZXJhbChhcmcubmFtZSlcblx0XHRcdFx0Y29uc3Qgb3BUeXBlID0gb3BNYXAoYXJnLm9wVHlwZSwgdDApXG5cdFx0XHRcdHJldHVybiBpZkVsc2Uob3BUeXBlLFxuXHRcdFx0XHRcdF8gPT4gbmV3IEFycmF5RXhwcmVzc2lvbihbbmFtZSwgX10pLFxuXHRcdFx0XHRcdCgpID0+IG5hbWUpXG5cdFx0XHR9KSlcblxuXHRcdGNvbnN0IGltcGwgPSB0aGlzLmZ1biBpbnN0YW5jZW9mIEZ1biA/IFt0MCh0aGlzLmZ1bildIDogW11cblx0XHRyZXR1cm4gbXNDYWxsKCdtZXRob2QnLCBuYW1lLCBhcmdzLCAuLi5pbXBsKVxuXHR9LFxuXG5cdE1vZHVsZTogdHJhbnNwaWxlTW9kdWxlLFxuXG5cdE5ldygpIHtcblx0XHRyZXR1cm4gbmV3IE5ld0V4cHJlc3Npb24odDAodGhpcy50eXBlKSwgdGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0Tm90KCkgeyByZXR1cm4gbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIHQwKHRoaXMuYXJnKSkgfSxcblxuXHRPYmpFbnRyeUFzc2lnbigpIHtcblx0XHRpZiAodGhpcy5hc3NpZ24gaW5zdGFuY2VvZiBBc3NpZ25TaW5nbGUgJiYgIXRoaXMuYXNzaWduLmFzc2lnbmVlLmlzTGF6eSgpKSB7XG5cdFx0XHRjb25zdCBuYW1lID0gdGhpcy5hc3NpZ24uYXNzaWduZWUubmFtZVxuXHRcdFx0cmV0dXJuIHQxKHRoaXMuYXNzaWduLCB2YWwgPT5cblx0XHRcdFx0dmVyaWZ5UmVzdWx0cy5pc09iakVudHJ5RXhwb3J0KHRoaXMpID9cblx0XHRcdFx0XHRleHBvcnROYW1lZE9yRGVmYXVsdCh2YWwsIG5hbWUpIDpcblx0XHRcdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRCdWlsdCwgbmFtZSksIHZhbCkpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IGFzc2lnbnMgPSB0aGlzLmFzc2lnbi5hbGxBc3NpZ25lZXMoKS5tYXAoXyA9PlxuXHRcdFx0XHRtc0NhbGwoJ3NldExhenknLCBJZEJ1aWx0LCBuZXcgTGl0ZXJhbChfLm5hbWUpLCBpZEZvckRlY2xhcmVDYWNoZWQoXykpKVxuXHRcdFx0cmV0dXJuIGNhdCh0MCh0aGlzLmFzc2lnbiksIGFzc2lnbnMpXG5cdFx0fVxuXHR9LFxuXG5cdE9iakVudHJ5UGxhaW4oKSB7XG5cdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlclN0cmluZ09yVmFsKElkQnVpbHQsIHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdE9ialNpbXBsZSgpIHtcblx0XHRyZXR1cm4gbmV3IE9iamVjdEV4cHJlc3Npb24odGhpcy5wYWlycy5tYXAocGFpciA9PlxuXHRcdFx0bmV3IFByb3BlcnR5KCdpbml0JywgcHJvcGVydHlJZE9yTGl0ZXJhbChwYWlyLmtleSksIHQwKHBhaXIudmFsdWUpKSkpXG5cdH0sXG5cblx0R2V0dGVyRnVuKCkge1xuXHRcdC8vIF8gPT4gXy5mb29cblx0XHRyZXR1cm4gbmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKFtJZEZvY3VzXSwgbWVtYmVyU3RyaW5nT3JWYWwoSWRGb2N1cywgdGhpcy5uYW1lKSlcblx0fSxcblxuXHRRdW90ZVBsYWluKCkge1xuXHRcdGlmICh0aGlzLnBhcnRzLmxlbmd0aCA9PT0gMClcblx0XHRcdHJldHVybiBMaXRFbXB0eVN0cmluZ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgcXVhc2lzID0gW10sIGV4cHJlc3Npb25zID0gW11cblxuXHRcdFx0Ly8gVGVtcGxhdGVMaXRlcmFsIG11c3Qgc3RhcnQgd2l0aCBhIFRlbXBsYXRlRWxlbWVudFxuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLnBhcnRzWzBdICE9PSAnc3RyaW5nJylcblx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmVtcHR5KVxuXG5cdFx0XHRmb3IgKGxldCBwYXJ0IG9mIHRoaXMucGFydHMpXG5cdFx0XHRcdGlmICh0eXBlb2YgcGFydCA9PT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmZvclJhd1N0cmluZyhwYXJ0KSlcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Ly8gXCJ7MX17MX1cIiBuZWVkcyBhbiBlbXB0eSBxdWFzaSBpbiB0aGUgbWlkZGxlIChhbmQgb24gdGhlIGVuZHMpXG5cdFx0XHRcdFx0aWYgKHF1YXNpcy5sZW5ndGggPT09IGV4cHJlc3Npb25zLmxlbmd0aClcblx0XHRcdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5lbXB0eSlcblx0XHRcdFx0XHRleHByZXNzaW9ucy5wdXNoKHQwKHBhcnQpKVxuXHRcdFx0XHR9XG5cblx0XHRcdC8vIFRlbXBsYXRlTGl0ZXJhbCBtdXN0IGVuZCB3aXRoIGEgVGVtcGxhdGVFbGVtZW50LCBzbyBvbmUgbW9yZSBxdWFzaSB0aGFuIGV4cHJlc3Npb24uXG5cdFx0XHRpZiAocXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoKVxuXHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZW1wdHkpXG5cblx0XHRcdHJldHVybiBuZXcgVGVtcGxhdGVMaXRlcmFsKHF1YXNpcywgZXhwcmVzc2lvbnMpXG5cdFx0fVxuXHR9LFxuXG5cdFF1b3RlU2ltcGxlKCkge1xuXHRcdHJldHVybiBuZXcgTGl0ZXJhbCh0aGlzLm5hbWUpXG5cdH0sXG5cblx0UXVvdGVUYWdnZWRUZW1wbGF0ZSgpIHtcblx0XHRyZXR1cm4gbmV3IFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbih0MCh0aGlzLnRhZyksIHQwKHRoaXMucXVvdGUpKVxuXHR9LFxuXG5cdFJhbmdlKCkge1xuXHRcdGNvbnN0IGVuZCA9IGlmRWxzZSh0aGlzLmVuZCwgdDAsICgpID0+IEdsb2JhbEluZmluaXR5KVxuXHRcdHJldHVybiBtc0NhbGwoJ3JhbmdlJywgdDAodGhpcy5zdGFydCksIGVuZCwgbmV3IExpdGVyYWwodGhpcy5pc0V4Y2x1c2l2ZSkpXG5cdH0sXG5cblx0U2V0U3ViKCkge1xuXHRcdGNvbnN0IGdldEtpbmQgPSAoKSA9PiB7XG5cdFx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0XHRjYXNlIFNldHRlcnMuSW5pdDpcblx0XHRcdFx0XHRyZXR1cm4gJ2luaXQnXG5cdFx0XHRcdGNhc2UgU2V0dGVycy5Jbml0TXV0YWJsZTpcblx0XHRcdFx0XHRyZXR1cm4gJ2luaXQtbXV0YWJsZSdcblx0XHRcdFx0Y2FzZSBTZXR0ZXJzLk11dGF0ZTpcblx0XHRcdFx0XHRyZXR1cm4gJ211dGF0ZSdcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRjb25zdCBraW5kID0gZ2V0S2luZCgpXG5cdFx0cmV0dXJuIG1zQ2FsbChcblx0XHRcdCdzZXRTdWInLFxuXHRcdFx0dDAodGhpcy5vYmplY3QpLFxuXHRcdFx0dGhpcy5zdWJiZWRzLmxlbmd0aCA9PT0gMSA/IHQwKHRoaXMuc3ViYmVkc1swXSkgOiB0aGlzLnN1YmJlZHMubWFwKHQwKSxcblx0XHRcdG1heWJlV3JhcEluQ2hlY2tDb250YWlucyh0MCh0aGlzLnZhbHVlKSwgdGhpcy5vcFR5cGUsICd2YWx1ZScpLFxuXHRcdFx0bmV3IExpdGVyYWwoa2luZCkpXG5cdH0sXG5cblx0U2ltcGxlRnVuKCkge1xuXHRcdHJldHVybiBuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oW0lkRm9jdXNdLCB0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRTcGVjaWFsRG8oKSB7XG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU3BlY2lhbERvcy5EZWJ1Z2dlcjogcmV0dXJuIG5ldyBEZWJ1Z2dlclN0YXRlbWVudCgpXG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IodGhpcy5raW5kKVxuXHRcdH1cblx0fSxcblxuXHRTcGVjaWFsVmFsKCkge1xuXHRcdC8vIE1ha2UgbmV3IG9iamVjdHMgYmVjYXVzZSB3ZSB3aWxsIGFzc2lnbiBgbG9jYCB0byB0aGVtLlxuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLkNvbnRhaW5zOlxuXHRcdFx0XHRyZXR1cm4gbXNNZW1iZXIoJ2NvbnRhaW5zJylcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuRGVsU3ViOlxuXHRcdFx0XHRyZXR1cm4gbXNNZW1iZXIoJ2RlbFN1YicpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLkZhbHNlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IExpdGVyYWwoZmFsc2UpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLk5hbWU6XG5cdFx0XHRcdHJldHVybiBuZXcgTGl0ZXJhbCh2ZXJpZnlSZXN1bHRzLm5hbWUodGhpcykpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLk51bGw6XG5cdFx0XHRcdHJldHVybiBuZXcgTGl0ZXJhbChudWxsKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5TdWI6XG5cdFx0XHRcdHJldHVybiBtc01lbWJlcignc3ViJylcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuVHJ1ZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKHRydWUpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLlVuZGVmaW5lZDpcblx0XHRcdFx0cmV0dXJuIG5ldyBVbmFyeUV4cHJlc3Npb24oJ3ZvaWQnLCBMaXRaZXJvKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHR9XG5cdH0sXG5cblx0U3ByZWFkKCkge1xuXHRcdHJldHVybiBuZXcgU3ByZWFkRWxlbWVudCh0MCh0aGlzLnNwcmVhZGVkKSlcblx0fSxcblxuXHRTdXBlckNhbGwoKSB7XG5cdFx0Y29uc3QgYXJncyA9IHRoaXMuYXJncy5tYXAodDApXG5cdFx0Y29uc3QgbWV0aG9kID0gdmVyaWZ5UmVzdWx0cy5zdXBlckNhbGxUb01ldGhvZC5nZXQodGhpcylcblxuXHRcdGlmIChtZXRob2QgaW5zdGFuY2VvZiBDb25zdHJ1Y3Rvcikge1xuXHRcdFx0Ly8gc3VwZXIgbXVzdCBhcHBlYXIgYXMgYSBzdGF0ZW1lbnQsIHNvIE9LIHRvIGRlY2FscmUgYHRoaXNgXG5cdFx0XHRjb25zdCBjYWxsID0gbmV3IENhbGxFeHByZXNzaW9uKElkU3VwZXIsIGFyZ3MpXG5cdFx0XHRjb25zdCBtZW1iZXJTZXRzID0gY29uc3RydWN0b3JTZXRNZW1iZXJzKG1ldGhvZClcblx0XHRcdHJldHVybiBjYXQoY2FsbCwgbWVtYmVyU2V0cywgU2V0TGV4aWNhbFRoaXMpXG5cdFx0fSBlbHNlXG5cdFx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKG1lbWJlclN0cmluZ09yVmFsKElkU3VwZXIsIG1ldGhvZC5zeW1ib2wpLCBhcmdzKVxuXHR9LFxuXG5cdFN1cGVyTWVtYmVyKCkge1xuXHRcdHJldHVybiBtZW1iZXJTdHJpbmdPclZhbChJZFN1cGVyLCB0aGlzLm5hbWUpXG5cdH0sXG5cblx0U3dpdGNoKCkge1xuXHRcdGNvbnN0IHBhcnRzID0gZmxhdE1hcCh0aGlzLnBhcnRzLCB0MClcblx0XHRwYXJ0cy5wdXNoKGlmRWxzZSh0aGlzLm9wRWxzZSxcblx0XHRcdF8gPT4gbmV3IFN3aXRjaENhc2UodW5kZWZpbmVkLCB0MChfKS5ib2R5KSxcblx0XHRcdCgpID0+IFN3aXRjaENhc2VOb01hdGNoKSlcblx0XHRyZXR1cm4gYmxvY2tXcmFwSWZWYWwodGhpcywgbmV3IFN3aXRjaFN0YXRlbWVudCh0MCh0aGlzLnN3aXRjaGVkKSwgcGFydHMpKVxuXHR9LFxuXG5cdFN3aXRjaFBhcnQoKSB7XG5cdFx0Y29uc3QgZm9sbG93ID0gb3BJZih2ZXJpZnlSZXN1bHRzLmlzU3RhdGVtZW50KHRoaXMpLCAoKSA9PiBuZXcgQnJlYWtTdGF0ZW1lbnQpXG5cdFx0Lypcblx0XHRXZSBjb3VsZCBqdXN0IHBhc3MgYmxvY2suYm9keSBmb3IgdGhlIHN3aXRjaCBsaW5lcywgYnV0IGluc3RlYWRcblx0XHRlbmNsb3NlIHRoZSBib2R5IG9mIHRoZSBzd2l0Y2ggY2FzZSBpbiBjdXJseSBicmFjZXMgdG8gZW5zdXJlIGEgbmV3IHNjb3BlLlxuXHRcdFRoYXQgd2F5IHRoaXMgY29kZSB3b3Jrczpcblx0XHRcdHN3aXRjaCAoMCkge1xuXHRcdFx0XHRjYXNlIDA6IHtcblx0XHRcdFx0XHRjb25zdCBhID0gMFxuXHRcdFx0XHRcdHJldHVybiBhXG5cdFx0XHRcdH1cblx0XHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHRcdC8vIFdpdGhvdXQgY3VybHkgYnJhY2VzIHRoaXMgd291bGQgY29uZmxpY3Qgd2l0aCB0aGUgb3RoZXIgYGFgLlxuXHRcdFx0XHRcdGNvbnN0IGEgPSAxXG5cdFx0XHRcdFx0YVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0Ki9cblx0XHRjb25zdCBibG9jayA9IHQzKHRoaXMucmVzdWx0LCBudWxsLCBudWxsLCBmb2xsb3cpXG5cdFx0Ly8gSWYgc3dpdGNoIGhhcyBtdWx0aXBsZSB2YWx1ZXMsIGJ1aWxkIHVwIGEgc3RhdGVtZW50IGxpa2U6IGBjYXNlIDE6IGNhc2UgMjogeyBkb0Jsb2NrKCkgfWBcblx0XHRjb25zdCB4ID0gW11cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudmFsdWVzLmxlbmd0aCAtIDE7IGkgPSBpICsgMSlcblx0XHRcdC8vIFRoZXNlIGNhc2VzIGZhbGx0aHJvdWdoIHRvIHRoZSBvbmUgYXQgdGhlIGVuZC5cblx0XHRcdHgucHVzaChuZXcgU3dpdGNoQ2FzZSh0MCh0aGlzLnZhbHVlc1tpXSksIFtdKSlcblx0XHR4LnB1c2gobmV3IFN3aXRjaENhc2UodDAodGhpcy52YWx1ZXNbdGhpcy52YWx1ZXMubGVuZ3RoIC0gMV0pLCBbYmxvY2tdKSlcblx0XHRyZXR1cm4geFxuXHR9LFxuXG5cdFRocm93KCkge1xuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcFRocm93bixcblx0XHRcdF8gPT4gZG9UaHJvdyhfKSxcblx0XHRcdCgpID0+IG5ldyBUaHJvd1N0YXRlbWVudChuZXcgTmV3RXhwcmVzc2lvbihHbG9iYWxFcnJvciwgW0xpdFN0clRocm93XSkpKVxuXHR9LFxuXG5cdFdpdGgoKSB7XG5cdFx0Y29uc3QgaWREZWNsYXJlID0gaWRGb3JEZWNsYXJlQ2FjaGVkKHRoaXMuZGVjbGFyZSlcblx0XHRjb25zdCB2YWwgPSB0MCh0aGlzLnZhbHVlKVxuXHRcdGNvbnN0IGxlYWQgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBbbmV3IFZhcmlhYmxlRGVjbGFyYXRvcihpZERlY2xhcmUsIHZhbCldKVxuXHRcdHJldHVybiB2ZXJpZnlSZXN1bHRzLmlzU3RhdGVtZW50KHRoaXMpID9cblx0XHRcdHQxKHRoaXMuYmxvY2ssIGxlYWQpIDpcblx0XHRcdGJsb2NrV3JhcCh0Myh0aGlzLmJsb2NrLCBsZWFkLCBudWxsLCBuZXcgUmV0dXJuU3RhdGVtZW50KGlkRGVjbGFyZSkpKVxuXHR9LFxuXG5cdFlpZWxkKCkge1xuXHRcdHJldHVybiBuZXcgWWllbGRFeHByZXNzaW9uKG9wTWFwKHRoaXMub3BZaWVsZGVkLCB0MCksIGZhbHNlKVxuXHR9LFxuXG5cdFlpZWxkVG8oKSB7XG5cdFx0cmV0dXJuIG5ldyBZaWVsZEV4cHJlc3Npb24odDAodGhpcy55aWVsZGVkVG8pLCB0cnVlKVxuXHR9XG59KVxuXG4vLyBGdW5jdGlvbnMgc3BlY2lmaWMgdG8gY2VydGFpbiBleHByZXNzaW9uc1xuXG5mdW5jdGlvbiBjYXNlQm9keShwYXJ0cywgb3BFbHNlKSB7XG5cdGxldCBhY2MgPSBpZkVsc2Uob3BFbHNlLCB0MCwgKCkgPT4gVGhyb3dOb0Nhc2VNYXRjaClcblx0Zm9yIChsZXQgaSA9IHBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaSA9IGkgLSAxKVxuXHRcdGFjYyA9IHQxKHBhcnRzW2ldLCBhY2MpXG5cdHJldHVybiBhY2Ncbn1cblxuZnVuY3Rpb24gY29uc3RydWN0b3JTZXRNZW1iZXJzKGNvbnN0cnVjdG9yKSB7XG5cdHJldHVybiBjb25zdHJ1Y3Rvci5tZW1iZXJBcmdzLm1hcChfID0+XG5cdFx0bXNDYWxsKCduZXdQcm9wZXJ0eScsIG5ldyBUaGlzRXhwcmVzc2lvbigpLCBuZXcgTGl0ZXJhbChfLm5hbWUpLCBpZEZvckRlY2xhcmVDYWNoZWQoXykpKVxufVxuXG5mdW5jdGlvbiBmb3JMb29wKG9wSXRlcmF0ZWUsIGJsb2NrKSB7XG5cdHJldHVybiBpZkVsc2Uob3BJdGVyYXRlZSxcblx0XHQoe2VsZW1lbnQsIGJhZ30pID0+IHtcblx0XHRcdGNvbnN0IGRlY2xhcmUgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignbGV0Jyxcblx0XHRcdFx0W25ldyBWYXJpYWJsZURlY2xhcmF0b3IodDAoZWxlbWVudCkpXSlcblx0XHRcdHJldHVybiBuZXcgRm9yT2ZTdGF0ZW1lbnQoZGVjbGFyZSwgdDAoYmFnKSwgdDAoYmxvY2spKVxuXHRcdH0sXG5cdFx0KCkgPT4gbmV3IEZvclN0YXRlbWVudChudWxsLCBudWxsLCBudWxsLCB0MChibG9jaykpKVxufVxuXG5mdW5jdGlvbiB0cmFuc3BpbGVCbG9ja1JldHVybihyZXR1cm5lZCwgbGluZXMsIGxlYWQsIG9wUmV0dXJuVHlwZSkge1xuXHRjb25zdCByZXQgPSBuZXcgUmV0dXJuU3RhdGVtZW50KFxuXHRcdG1heWJlV3JhcEluQ2hlY2tDb250YWlucyhyZXR1cm5lZCwgb3BSZXR1cm5UeXBlLCAncmV0dXJuZWQgdmFsdWUnKSlcblx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgbGluZXMsIHJldCkpXG59XG4iXX0=
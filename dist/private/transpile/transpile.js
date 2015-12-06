'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/util', '../context', '../MsAst', '../util', '../VerifyResults', './ast-constants', './context', './transpileExcept', './transpileMethod', './transpileModule', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('esast/dist/util'), require('../context'), require('../MsAst'), require('../util'), require('../VerifyResults'), require('./ast-constants'), require('./context'), require('./transpileExcept'), require('./transpileMethod'), require('./transpileModule'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.context, global.MsAst, global.util, global.VerifyResults, global.astConstants, global.context, global.transpileExcept, global.transpileMethod, global.transpileModule, global.util);
		global.transpile = mod.exports;
	}
})(this, function (exports, _ast, _util, _context, _MsAst, _util2, _VerifyResults, _astConstants, _context2, _transpileExcept, _transpileMethod, _transpileModule, _util3) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = transpile;

	var MsAstTypes = _interopRequireWildcard(_MsAst);

	var _transpileExcept2 = _interopRequireDefault(_transpileExcept);

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
			return new _ast.VariableDeclaration('let', [declare]);
		},

		AssignDestructure() {
			return new _ast.VariableDeclaration('let', (0, _util3.makeDestructureDeclarators)(this.assignees, this.kind() === _MsAst.LocalDeclares.Lazy, (0, _util3.t0)(this.value), false));
		},

		Await() {
			return new _ast.YieldExpression((0, _util3.t0)(this.value), false);
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
			return (0, _util2.ifElse)(this.opValue, _ => new _ast.ReturnStatement((0, _util3.t0)(_)), () => new _ast.BreakStatement(_context2.verifyResults.isBreakInSwitch(this) ? _astConstants.IdLoop : null));
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
				const decl = (0, _util3.plainLet)(_astConstants.IdExtract, (0, _util3.msCall)('extract', (0, _util3.t0)(type), (0, _util3.t0)(patterned), new _ast.Literal(locals.length)));
				const test = new _ast.BinaryExpression('!==', _astConstants.IdExtract, _astConstants.LitNull);
				const extract = new _ast.VariableDeclaration('let', locals.map((_, idx) => new _ast.VariableDeclarator((0, _util3.idForDeclareCached)(_), new _ast.MemberExpression(_astConstants.IdExtract, new _ast.Literal(idx)))));
				const res = (0, _util3.t1)(this.result, extract);
				return new _ast.BlockStatement([decl, new _ast.IfStatement(test, res, alternate)]);
			} else return new _ast.IfStatement((0, _util3.t0)(this.test), (0, _util3.t0)(this.result), alternate);
		},

		Class() {
			const methods = (0, _util2.cat)(this.statics.map(_ => (0, _transpileMethod.transpileMethodToDefinition)(_, true)), (0, _util2.opMap)(this.opConstructor, _util3.t0), this.methods.map(_ => (0, _transpileMethod.transpileMethodToDefinition)(_, false)));
			const opName = (0, _util2.opMap)(_context2.verifyResults.opName(this), _util.identifier);
			const classExpr = new _ast.ClassExpression(opName, (0, _util2.opMap)(this.opSuperClass, _util3.t0), new _ast.ClassBody(methods));
			if (this.opDo === null && (0, _util2.isEmpty)(this.kinds)) return classExpr;else {
				const lead = (0, _util2.cat)((0, _util3.plainLet)(_astConstants.IdFocus, classExpr), this.kinds.map(_ => (0, _util3.msCall)('kindDo', _astConstants.IdFocus, (0, _util3.t0)(_))));
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

		Catch: _transpileExcept.transpileCatch,

		Del() {
			return (0, _util3.msCall)('del', (0, _util3.t0)(this.subbed), ...this.args.map(_util3.t0));
		},

		Except: _transpileExcept2.default,

		For() {
			const loop = forLoop(this.opIteratee, this.block);
			return _context2.verifyResults.isStatement(this) ? maybeLabelLoop(this, loop) : (0, _util3.blockWrap)(new _ast.BlockStatement([loop]));
		},

		ForAsync() {
			var _iteratee = this.iteratee;
			const element = _iteratee.element;
			const bag = _iteratee.bag;
			const func = new _ast.FunctionExpression(null, [(0, _util3.t0)(element)], (0, _util3.t0)(this.block), true);
			const call = (0, _util3.msCall)('$for', (0, _util3.t0)(bag), func);
			return _context2.verifyResults.isStatement(this) ? new _ast.YieldExpression(call) : call;
		},

		ForBag() {
			const loop = maybeLabelLoop(this, forLoop(this.opIteratee, this.block));
			return (0, _util3.blockWrap)(new _ast.BlockStatement([_astConstants.DeclareBuiltBag, loop, _astConstants.ReturnBuilt]));
		},

		Fun() {
			let leadStatements = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
			let dontDeclareThis = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
			return (0, _context2.withFunKind)(this.kind, () => {
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
						return id === null && this.opDeclareThis === null && opDeclareRest === null ? new _ast.ArrowFunctionExpression(args, body()) : new _ast.FunctionExpression(id, args, body());

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

		GetterFun() {
			return (0, _util3.focusFun)((0, _util3.memberStringOrVal)(_astConstants.IdFocus, this.name));
		},

		Ignore() {
			return [];
		},

		InstanceOf() {
			return (0, _util3.msCall)('hasInstance', (0, _util3.t0)(this.type), (0, _util3.t0)(this.instance));
		},

		Kind() {
			const name = new _ast.Literal(_context2.verifyResults.name(this));
			const supers = new _ast.ArrayExpression(this.superKinds.map(_util3.t0));

			const methods = _ => new _ast.ObjectExpression(_.map(_transpileMethod.transpileMethodToProperty));

			const kind = (0, _util3.msCall)('kind', name, supers, methods(this.statics), methods(this.methods));
			return (0, _util2.ifElse)(this.opDo, _ => (0, _util3.blockWrap)((0, _util3.t3)(_.block, (0, _util3.plainLet)(_astConstants.IdFocus, kind), null, _astConstants.ReturnFocus)), () => kind);
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
			const val = (0, _util3.maybeWrapInCheckInstance)((0, _util3.t0)(this.value), this.opType, this.name);

			switch (this.kind) {
				case _MsAst.Setters.Init:
					return (0, _util3.msCall)('newProperty', obj, (0, _util3.transpileName)(this.name), val);

				case _MsAst.Setters.Mutate:
					return new _ast.AssignmentExpression('=', (0, _util3.memberStringOrVal)(obj, this.name), val);

				default:
					throw new Error();
			}
		},

		Method() {
			const name = new _ast.Literal(_context2.verifyResults.name(this));
			const args = this.fun.opRestArg === null ? new _ast.ArrayExpression(this.fun.args.map(arg => {
				const name = new _ast.Literal(arg.name);
				const opType = (0, _util2.opMap)(arg.opType, _util3.t0);
				return (0, _util2.ifElse)(opType, _ => new _ast.ArrayExpression([name, _]), () => name);
			})) : new _ast.UnaryExpression('void', new _ast.Literal(0));
			const impl = this.fun instanceof _MsAst.Fun ? [(0, _util3.t0)(this.fun)] : [];
			return (0, _util3.msCall)('method', name, args, ...impl);
		},

		Module: _transpileModule2.default,

		MsRegExp() {
			return this.parts.length === 0 ? new _ast.Literal(new RegExp('', this.flags)) : this.parts.length === 1 && typeof this.parts[0] === 'string' ? new _ast.Literal(new RegExp(this.parts[0].replace('\n', '\\n'), this.flags)) : (0, _util3.msCall)('regexp', new _ast.ArrayExpression(this.parts.map(_util3.transpileName)), new _ast.Literal(this.flags));
		},

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
			const val = (0, _util3.t0)(this.value);
			return _context2.verifyResults.isObjEntryExport(this) ? (0, _transpileModule.exportNamedOrDefault)(val, this.name) : new _ast.AssignmentExpression('=', (0, _util3.memberStringOrVal)(_astConstants.IdBuilt, this.name), val);
		},

		ObjSimple() {
			return new _ast.ObjectExpression(this.pairs.map(pair => new _ast.Property('init', (0, _util.propertyIdOrLiteral)(pair.key), (0, _util3.t0)(pair.value))));
		},

		Pipe() {
			return this.pipes.reduce((expr, pipe) => (0, _util3.callFocusFun)((0, _util3.t0)(pipe), expr), (0, _util3.t0)(this.value));
		},

		QuotePlain() {
			if ((0, _util2.isEmpty)(this.parts)) return _astConstants.LitEmptyString;else {
				const quasis = [],
				      expressions = [];
				if (typeof this.parts[0] !== 'string') quasis.push(_ast.TemplateElement.empty);

				for (const part of this.parts) if (typeof part === 'string') quasis.push(_ast.TemplateElement.forRawString(part));else {
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

					case _MsAst.Setters.Mutate:
						return 'mutate';

					default:
						throw new Error();
				}
			};

			const kind = getKind();
			return (0, _util3.msCall)('setSub', (0, _util3.t0)(this.object), this.subbeds.length === 1 ? (0, _util3.t0)(this.subbeds[0]) : this.subbeds.map(_util3.t0), (0, _util3.maybeWrapInCheckInstance)((0, _util3.t0)(this.value), this.opType, 'value'), new _ast.Literal(kind));
		},

		SimpleFun() {
			return (0, _util3.focusFun)((0, _util3.t0)(this.value));
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
				case _MsAst.SpecialVals.False:
					return new _ast.Literal(false);

				case _MsAst.SpecialVals.Name:
					return new _ast.Literal(_context2.verifyResults.name(this));

				case _MsAst.SpecialVals.Null:
					return new _ast.Literal(null);

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

		Sub() {
			return (0, _util3.msCall)('sub', (0, _util3.t0)(this.subbed), ...this.args.map(_util3.t0));
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
			const lead = (0, _util3.plainLet)(idDeclare, val);
			return _context2.verifyResults.isStatement(this) ? (0, _util3.t1)(this.block, lead) : (0, _util3.blockWrap)((0, _util3.t3)(this.block, lead, null, new _ast.ReturnStatement(idDeclare)));
		},

		Yield() {
			return new _ast.YieldExpression((0, _util2.opMap)(this.opValue, _util3.t0), false);
		},

		YieldTo() {
			return new _ast.YieldExpression((0, _util3.t0)(this.value), true);
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
		const jsBlock = (0, _util3.t0)(block);
		return (0, _util2.ifElse)(opIteratee, _ref3 => {
			let element = _ref3.element;
			let bag = _ref3.bag;
			return new _ast.ForOfStatement(new _ast.VariableDeclaration('let', [new _ast.VariableDeclarator((0, _util3.t0)(element))]), (0, _util3.t0)(bag), jsBlock);
		}, () => new _ast.ForStatement(null, null, null, jsBlock));
	}

	function maybeLabelLoop(ast, loop) {
		return _context2.verifyResults.loopNeedsLabel(ast) ? new _ast.LabeledStatement(_astConstants.IdLoop, loop) : loop;
	}

	function transpileBlockReturn(returned, lines, lead, opReturnType) {
		const ret = new _ast.ReturnStatement((0, _util3.maybeWrapInCheckInstance)(returned, opReturnType, 'returned value'));
		return new _ast.BlockStatement((0, _util2.cat)(lead, lines, ret));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQStCd0IsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBQVQsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BNkQxQixJQUFJLHlEQUFHLElBQUk7T0FBRSxZQUFZLHlEQUFHLElBQUk7T0FBRSxNQUFNLHlEQUFHLElBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQWdKakQsY0FBYyx5REFBRyxJQUFJO09BQUUsZUFBZSx5REFBRyxLQUFLIiwiZmlsZSI6InRyYW5zcGlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXJyYXlFeHByZXNzaW9uLCBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbiwgQXNzaWdubWVudEV4cHJlc3Npb24sIEJpbmFyeUV4cHJlc3Npb24sXG5cdEJsb2NrU3RhdGVtZW50LCBCcmVha1N0YXRlbWVudCwgQ2FsbEV4cHJlc3Npb24sIENsYXNzQm9keSwgQ2xhc3NFeHByZXNzaW9uLFxuXHRDb25kaXRpb25hbEV4cHJlc3Npb24sIERlYnVnZ2VyU3RhdGVtZW50LCBGb3JPZlN0YXRlbWVudCwgRm9yU3RhdGVtZW50LCBGdW5jdGlvbkV4cHJlc3Npb24sXG5cdElkZW50aWZpZXIsIElmU3RhdGVtZW50LCBMYWJlbGVkU3RhdGVtZW50LCBMaXRlcmFsLCBMb2dpY2FsRXhwcmVzc2lvbiwgTWVtYmVyRXhwcmVzc2lvbixcblx0TWV0aG9kRGVmaW5pdGlvbiwgTmV3RXhwcmVzc2lvbiwgT2JqZWN0RXhwcmVzc2lvbiwgUHJvcGVydHksIFJldHVyblN0YXRlbWVudCwgU3ByZWFkRWxlbWVudCxcblx0U3dpdGNoQ2FzZSwgU3dpdGNoU3RhdGVtZW50LCBUYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb24sIFRlbXBsYXRlRWxlbWVudCwgVGVtcGxhdGVMaXRlcmFsLFxuXHRUaGlzRXhwcmVzc2lvbiwgVGhyb3dTdGF0ZW1lbnQsIFZhcmlhYmxlRGVjbGFyYXRpb24sIFVuYXJ5RXhwcmVzc2lvbiwgVmFyaWFibGVEZWNsYXJhdG9yLFxuXHRZaWVsZEV4cHJlc3Npb259IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IHtpZGVudGlmaWVyLCBtZW1iZXIsIHByb3BlcnR5SWRPckxpdGVyYWx9IGZyb20gJ2VzYXN0L2Rpc3QvdXRpbCdcbmltcG9ydCB7b3B0aW9uc30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCAqIGFzIE1zQXN0VHlwZXMgZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0Fzc2lnblNpbmdsZSwgQ2FsbCwgQ29uc3RydWN0b3IsIEZ1biwgRnVucywgTG9naWNzLCBNZW1iZXIsIExvY2FsRGVjbGFyZXMsIFBhdHRlcm4sIFNldHRlcnMsXG5cdFNwZWNpYWxEb3MsIFNwZWNpYWxWYWxzfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7YXNzZXJ0LCBjYXQsIGZsYXRNYXAsIGZsYXRPcE1hcCwgaWZFbHNlLCBpbXBsZW1lbnRNYW55LCBpc0VtcHR5LCBsYXN0LCBvcElmLCBvcE1hcCwgcnRhaWwsXG5cdHRhaWx9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0Jsb2Nrc30gZnJvbSAnLi4vVmVyaWZ5UmVzdWx0cydcbmltcG9ydCB7QXJyYXlTbGljZUNhbGwsIERlY2xhcmVCdWlsdEJhZywgRGVjbGFyZUJ1aWx0TWFwLCBEZWNsYXJlQnVpbHRPYmosIERlY2xhcmVMZXhpY2FsVGhpcyxcblx0SWRBcmd1bWVudHMsIElkQnVpbHQsIElkRXh0cmFjdCwgSWRGb2N1cywgSWRMZXhpY2FsVGhpcywgSWRMb29wLCBJZFN1cGVyLCBHbG9iYWxFcnJvcixcblx0R2xvYmFsSW5maW5pdHksIExldExleGljYWxUaGlzLCBMaXRFbXB0eVN0cmluZywgTGl0TnVsbCwgTGl0U3RyVGhyb3csIExpdFplcm8sIFJldHVybkJ1aWx0LFxuXHRSZXR1cm5Gb2N1cywgU2V0TGV4aWNhbFRoaXMsIFN3aXRjaENhc2VOb01hdGNoLCBUaHJvd0Fzc2VydEZhaWwsIFRocm93Tm9DYXNlTWF0Y2hcblx0fSBmcm9tICcuL2FzdC1jb25zdGFudHMnXG5pbXBvcnQge3NldHVwLCB0ZWFyRG93biwgdmVyaWZ5UmVzdWx0cywgd2l0aEZ1bktpbmR9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB0cmFuc3BpbGVFeGNlcHQsIHt0cmFuc3BpbGVDYXRjaH0gZnJvbSAnLi90cmFuc3BpbGVFeGNlcHQnXG5pbXBvcnQge3RyYW5zcGlsZU1ldGhvZFRvRGVmaW5pdGlvbiwgdHJhbnNwaWxlTWV0aG9kVG9Qcm9wZXJ0eX0gZnJvbSAnLi90cmFuc3BpbGVNZXRob2QnXG5pbXBvcnQgdHJhbnNwaWxlTW9kdWxlLCB7ZXhwb3J0TmFtZWRPckRlZmF1bHR9IGZyb20gJy4vdHJhbnNwaWxlTW9kdWxlJ1xuaW1wb3J0IHthY2Nlc3NMb2NhbERlY2xhcmUsIGJsb2NrV3JhcCwgYmxvY2tXcmFwSWZCbG9jaywgYmxvY2tXcmFwSWZWYWwsIGNhbGxGb2N1c0Z1biwgZGVjbGFyZSxcblx0ZG9UaHJvdywgZm9jdXNGdW4sIGlkRm9yRGVjbGFyZUNhY2hlZCwgbGF6eVdyYXAsIG1ha2VEZWNsYXJhdG9yLCBtYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycyxcblx0bWF5YmVXcmFwSW5DaGVja0luc3RhbmNlLCBtZW1iZXJTdHJpbmdPclZhbCwgbXNDYWxsLCBtc01lbWJlciwgb3BUeXBlQ2hlY2tGb3JMb2NhbERlY2xhcmUsXG5cdHBsYWluTGV0LCB0MCwgdDEsIHQyLCB0MywgdExpbmVzLCB0cmFuc3BpbGVOYW1lfSBmcm9tICcuL3V0aWwnXG5cbi8qKiBUcmFuc2Zvcm0gYSB7QGxpbmsgTXNBc3R9IGludG8gYW4gZXNhc3QuICoqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhbnNwaWxlKG1vZHVsZUV4cHJlc3Npb24sIHZlcmlmeVJlc3VsdHMpIHtcblx0c2V0dXAodmVyaWZ5UmVzdWx0cylcblx0Y29uc3QgcmVzID0gdDAobW9kdWxlRXhwcmVzc2lvbilcblx0dGVhckRvd24oKVxuXHRyZXR1cm4gcmVzXG59XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ3RyYW5zcGlsZScsIHtcblx0QXNzZXJ0KCkge1xuXHRcdGNvbnN0IGZhaWxDb25kID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgY29uZCA9IHQwKHRoaXMuY29uZGl0aW9uKVxuXHRcdFx0cmV0dXJuIHRoaXMubmVnYXRlID8gY29uZCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCBjb25kKVxuXHRcdH1cblxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcFRocm93bixcblx0XHRcdF8gPT4gbmV3IElmU3RhdGVtZW50KGZhaWxDb25kKCksIGRvVGhyb3coXykpLFxuXHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5jb25kaXRpb24gaW5zdGFuY2VvZiBDYWxsKSB7XG5cdFx0XHRcdFx0Y29uc3QgY2FsbCA9IHRoaXMuY29uZGl0aW9uXG5cdFx0XHRcdFx0Y29uc3QgY2FsbGVkID0gY2FsbC5jYWxsZWRcblx0XHRcdFx0XHRjb25zdCBhcmdzID0gY2FsbC5hcmdzLm1hcCh0MClcblx0XHRcdFx0XHRpZiAoY2FsbGVkIGluc3RhbmNlb2YgTWVtYmVyKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBhc3MgPSB0aGlzLm5lZ2F0ZSA/ICdhc3NlcnROb3RNZW1iZXInIDogJ2Fzc2VydE1lbWJlcidcblx0XHRcdFx0XHRcdHJldHVybiBtc0NhbGwoYXNzLCB0MChjYWxsZWQub2JqZWN0KSwgdHJhbnNwaWxlTmFtZShjYWxsZWQubmFtZSksIC4uLmFyZ3MpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnN0IGFzcyA9IHRoaXMubmVnYXRlID8gJ2Fzc2VydE5vdCcgOiAnYXNzZXJ0J1xuXHRcdFx0XHRcdFx0cmV0dXJuIG1zQ2FsbChhc3MsIHQwKGNhbGxlZCksIC4uLmFyZ3MpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KGZhaWxDb25kKCksIFRocm93QXNzZXJ0RmFpbClcblx0XHRcdH0pXG5cdH0sXG5cblx0QXNzaWduU2luZ2xlKHZhbFdyYXApIHtcblx0XHRjb25zdCB2YWwgPSB2YWxXcmFwID09PSB1bmRlZmluZWQgPyB0MCh0aGlzLnZhbHVlKSA6IHZhbFdyYXAodDAodGhpcy52YWx1ZSkpXG5cdFx0Y29uc3QgZGVjbGFyZSA9IG1ha2VEZWNsYXJhdG9yKHRoaXMuYXNzaWduZWUsIHZhbCwgZmFsc2UpXG5cdFx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdsZXQnLCBbZGVjbGFyZV0pXG5cdH0sXG5cdC8vIFRPRE86RVM2IEp1c3QgdXNlIG5hdGl2ZSBkZXN0cnVjdHVyaW5nIGFzc2lnblxuXHRBc3NpZ25EZXN0cnVjdHVyZSgpIHtcblx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oXG5cdFx0XHQnbGV0Jyxcblx0XHRcdG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzKFxuXHRcdFx0XHR0aGlzLmFzc2lnbmVlcyxcblx0XHRcdFx0dGhpcy5raW5kKCkgPT09IExvY2FsRGVjbGFyZXMuTGF6eSxcblx0XHRcdFx0dDAodGhpcy52YWx1ZSksXG5cdFx0XHRcdGZhbHNlKSlcblx0fSxcblxuXHRBd2FpdCgpIHtcblx0XHRyZXR1cm4gbmV3IFlpZWxkRXhwcmVzc2lvbih0MCh0aGlzLnZhbHVlKSwgZmFsc2UpXG5cdH0sXG5cblx0QmFnRW50cnkoKSB7XG5cdFx0cmV0dXJuIG1zQ2FsbCh0aGlzLmlzTWFueSA/ICdhZGRNYW55JyA6ICdhZGQnLCBJZEJ1aWx0LCB0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRCYWdTaW1wbGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBBcnJheUV4cHJlc3Npb24odGhpcy5wYXJ0cy5tYXAodDApKVxuXHR9LFxuXG5cdEJsb2NrKGxlYWQgPSBudWxsLCBvcFJldHVyblR5cGUgPSBudWxsLCBmb2xsb3cgPSBudWxsKSB7XG5cdFx0Y29uc3Qga2luZCA9IHZlcmlmeVJlc3VsdHMuYmxvY2tLaW5kKHRoaXMpXG5cdFx0c3dpdGNoIChraW5kKSB7XG5cdFx0XHRjYXNlIEJsb2Nrcy5Ebzpcblx0XHRcdFx0YXNzZXJ0KG9wUmV0dXJuVHlwZSA9PT0gbnVsbClcblx0XHRcdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgdExpbmVzKHRoaXMubGluZXMpLCBmb2xsb3cpKVxuXHRcdFx0Y2FzZSBCbG9ja3MuVGhyb3c6XG5cdFx0XHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoXG5cdFx0XHRcdFx0Y2F0KGxlYWQsIHRMaW5lcyhydGFpbCh0aGlzLmxpbmVzKSksIHQwKGxhc3QodGhpcy5saW5lcykpKSlcblx0XHRcdGNhc2UgQmxvY2tzLlJldHVybjpcblx0XHRcdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrUmV0dXJuKFxuXHRcdFx0XHRcdHQwKGxhc3QodGhpcy5saW5lcykpLCB0TGluZXMocnRhaWwodGhpcy5saW5lcykpLCBsZWFkLCBvcFJldHVyblR5cGUpXG5cdFx0XHRjYXNlIEJsb2Nrcy5CYWc6IGNhc2UgQmxvY2tzLk1hcDogY2FzZSBCbG9ja3MuT2JqOiB7XG5cdFx0XHRcdGNvbnN0IGRlY2xhcmUgPSBraW5kID09PSBCbG9ja3MuQmFnID9cblx0XHRcdFx0XHREZWNsYXJlQnVpbHRCYWcgOlxuXHRcdFx0XHRcdGtpbmQgPT09IEJsb2Nrcy5NYXAgPyBEZWNsYXJlQnVpbHRNYXAgOiBEZWNsYXJlQnVpbHRPYmpcblx0XHRcdFx0Y29uc3QgYm9keSA9IGNhdChkZWNsYXJlLCB0TGluZXModGhpcy5saW5lcykpXG5cdFx0XHRcdHJldHVybiB0cmFuc3BpbGVCbG9ja1JldHVybihJZEJ1aWx0LCBib2R5LCBsZWFkLCBvcFJldHVyblR5cGUpXG5cdFx0XHR9XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3Ioa2luZClcblx0XHR9XG5cdH0sXG5cblx0QmxvY2tXcmFwKCkge1xuXHRcdHJldHVybiBibG9ja1dyYXAodDAodGhpcy5ibG9jaykpXG5cdH0sXG5cblx0QnJlYWsoKSB7XG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wVmFsdWUsXG5cdFx0XHRfID0+IG5ldyBSZXR1cm5TdGF0ZW1lbnQodDAoXykpLFxuXHRcdFx0KCkgPT4gbmV3IEJyZWFrU3RhdGVtZW50KHZlcmlmeVJlc3VsdHMuaXNCcmVha0luU3dpdGNoKHRoaXMpID8gSWRMb29wIDogbnVsbCkpXG5cdH0sXG5cblx0Q2FsbCgpIHtcblx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKHQwKHRoaXMuY2FsbGVkKSwgdGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0Q2FzZSgpIHtcblx0XHRjb25zdCBib2R5ID0gY2FzZUJvZHkodGhpcy5wYXJ0cywgdGhpcy5vcEVsc2UpXG5cdFx0aWYgKHZlcmlmeVJlc3VsdHMuaXNTdGF0ZW1lbnQodGhpcykpXG5cdFx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BDYXNlZCwgXyA9PiBuZXcgQmxvY2tTdGF0ZW1lbnQoW3QwKF8pLCBib2R5XSksICgpID0+IGJvZHkpXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBibG9jayA9IGlmRWxzZSh0aGlzLm9wQ2FzZWQsIF8gPT4gW3QwKF8pLCBib2R5XSwgKCkgPT4gW2JvZHldKVxuXHRcdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoYmxvY2spKVxuXHRcdH1cblx0fSxcblxuXHRDYXNlUGFydChhbHRlcm5hdGUpIHtcblx0XHRpZiAodGhpcy50ZXN0IGluc3RhbmNlb2YgUGF0dGVybikge1xuXHRcdFx0Y29uc3Qge3R5cGUsIHBhdHRlcm5lZCwgbG9jYWxzfSA9IHRoaXMudGVzdFxuXHRcdFx0Y29uc3QgZGVjbCA9IHBsYWluTGV0KElkRXh0cmFjdCxcblx0XHRcdFx0bXNDYWxsKCdleHRyYWN0JywgdDAodHlwZSksIHQwKHBhdHRlcm5lZCksIG5ldyBMaXRlcmFsKGxvY2Fscy5sZW5ndGgpKSlcblx0XHRcdGNvbnN0IHRlc3QgPSBuZXcgQmluYXJ5RXhwcmVzc2lvbignIT09JywgSWRFeHRyYWN0LCBMaXROdWxsKVxuXHRcdFx0Y29uc3QgZXh0cmFjdCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdsZXQnLCBsb2NhbHMubWFwKChfLCBpZHgpID0+XG5cdFx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoXG5cdFx0XHRcdFx0aWRGb3JEZWNsYXJlQ2FjaGVkKF8pLFxuXHRcdFx0XHRcdG5ldyBNZW1iZXJFeHByZXNzaW9uKElkRXh0cmFjdCwgbmV3IExpdGVyYWwoaWR4KSkpKSlcblx0XHRcdGNvbnN0IHJlcyA9IHQxKHRoaXMucmVzdWx0LCBleHRyYWN0KVxuXHRcdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChbZGVjbCwgbmV3IElmU3RhdGVtZW50KHRlc3QsIHJlcywgYWx0ZXJuYXRlKV0pXG5cdFx0fSBlbHNlXG5cdFx0XHQvLyBhbHRlcm5hdGUgd3JpdHRlbiB0byBieSBgY2FzZUJvZHlgLlxuXHRcdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudCh0MCh0aGlzLnRlc3QpLCB0MCh0aGlzLnJlc3VsdCksIGFsdGVybmF0ZSlcblx0fSxcblxuXHRDbGFzcygpIHtcblx0XHRjb25zdCBtZXRob2RzID0gY2F0KFxuXHRcdFx0dGhpcy5zdGF0aWNzLm1hcChfID0+IHRyYW5zcGlsZU1ldGhvZFRvRGVmaW5pdGlvbihfLCB0cnVlKSksXG5cdFx0XHRvcE1hcCh0aGlzLm9wQ29uc3RydWN0b3IsIHQwKSxcblx0XHRcdHRoaXMubWV0aG9kcy5tYXAoXyA9PiB0cmFuc3BpbGVNZXRob2RUb0RlZmluaXRpb24oXywgZmFsc2UpKSlcblx0XHRjb25zdCBvcE5hbWUgPSBvcE1hcCh2ZXJpZnlSZXN1bHRzLm9wTmFtZSh0aGlzKSwgaWRlbnRpZmllcilcblx0XHRjb25zdCBjbGFzc0V4cHIgPSBuZXcgQ2xhc3NFeHByZXNzaW9uKG9wTmFtZSxcblx0XHRcdG9wTWFwKHRoaXMub3BTdXBlckNsYXNzLCB0MCksIG5ldyBDbGFzc0JvZHkobWV0aG9kcykpXG5cblx0XHRpZiAodGhpcy5vcERvID09PSBudWxsICYmIGlzRW1wdHkodGhpcy5raW5kcykpXG5cdFx0XHRyZXR1cm4gY2xhc3NFeHByXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBsZWFkID0gY2F0KFxuXHRcdFx0XHRwbGFpbkxldChJZEZvY3VzLCBjbGFzc0V4cHIpLFxuXHRcdFx0XHR0aGlzLmtpbmRzLm1hcChfID0+IG1zQ2FsbCgna2luZERvJywgSWRGb2N1cywgdDAoXykpKSlcblx0XHRcdGNvbnN0IGJsb2NrID0gaWZFbHNlKHRoaXMub3BEbyxcblx0XHRcdFx0XyA9PiB0MyhfLmJsb2NrLCBsZWFkLCBudWxsLCBSZXR1cm5Gb2N1cyksXG5cdFx0XHRcdCgpID0+IG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgUmV0dXJuRm9jdXMpKSlcblx0XHRcdHJldHVybiBibG9ja1dyYXAoYmxvY2spXG5cdFx0fVxuXHR9LFxuXG5cdENvbmQoKSB7XG5cdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odDAodGhpcy50ZXN0KSwgdDAodGhpcy5pZlRydWUpLCB0MCh0aGlzLmlmRmFsc2UpKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsKCkge1xuXHRcdGNvbnN0IHRlc3QgPSB0MCh0aGlzLnRlc3QpXG5cdFx0aWYgKHZlcmlmeVJlc3VsdHMuaXNTdGF0ZW1lbnQodGhpcykpXG5cdFx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KFxuXHRcdFx0XHR0aGlzLmlzVW5sZXNzID8gbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIHRlc3QpIDogdGVzdCwgdDAodGhpcy5yZXN1bHQpKVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gbXNDYWxsKCdzb21lJywgYmxvY2tXcmFwSWZCbG9jayh0aGlzLnJlc3VsdCkpXG5cdFx0XHRjb25zdCBub25lID0gbXNNZW1iZXIoJ05vbmUnKVxuXHRcdFx0Y29uc3QgW3RoZW4sIF9lbHNlXSA9IHRoaXMuaXNVbmxlc3MgPyBbbm9uZSwgcmVzdWx0XSA6IFtyZXN1bHQsIG5vbmVdXG5cdFx0XHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXN0LCB0aGVuLCBfZWxzZSlcblx0XHR9XG5cdH0sXG5cblx0Q29uc3RydWN0b3IoKSB7XG5cdFx0Ly8gSWYgdGhlcmUgaXMgYSBgc3VwZXJgLCBgdGhpc2Agd2lsbCBub3QgYmUgZGVmaW5lZCB1bnRpbCB0aGVuLFxuXHRcdC8vIHNvIG11c3Qgd2FpdCB1bnRpbCB0aGVuLlxuXHRcdC8vIE90aGVyd2lzZSwgZG8gaXQgYXQgdGhlIGJlZ2lubmluZy5cblx0XHRyZXR1cm4gTWV0aG9kRGVmaW5pdGlvbi5jb25zdHJ1Y3Rvcih2ZXJpZnlSZXN1bHRzLmNvbnN0cnVjdG9ySGFzU3VwZXIodGhpcykgP1xuXHRcdFx0dDIodGhpcy5mdW4sIExldExleGljYWxUaGlzLCB0cnVlKSA6XG5cdFx0XHR0MSh0aGlzLmZ1biwgY29uc3RydWN0b3JTZXRNZW1iZXJzKHRoaXMpKSlcblx0fSxcblxuXHRDYXRjaDogdHJhbnNwaWxlQ2F0Y2gsXG5cblx0RGVsKCkge1xuXHRcdHJldHVybiBtc0NhbGwoJ2RlbCcsIHQwKHRoaXMuc3ViYmVkKSwgLi4udGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0RXhjZXB0OiB0cmFuc3BpbGVFeGNlcHQsXG5cblx0Rm9yKCkge1xuXHRcdGNvbnN0IGxvb3AgPSBmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jaylcblx0XHRyZXR1cm4gdmVyaWZ5UmVzdWx0cy5pc1N0YXRlbWVudCh0aGlzKSA/XG5cdFx0XHRtYXliZUxhYmVsTG9vcCh0aGlzLCBsb29wKSA6XG5cdFx0XHQvLyB1c2UgYHJldHVybmAgaW5zdGVhZCBvZiBgYnJlYWtgLCBzbyBubyBsYWJlbCBuZWVkZWRcblx0XHRcdGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW2xvb3BdKSlcblx0fSxcblxuXHRGb3JBc3luYygpIHtcblx0XHRjb25zdCB7ZWxlbWVudCwgYmFnfSA9IHRoaXMuaXRlcmF0ZWVcblx0XHRjb25zdCBmdW5jID0gbmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihudWxsLCBbdDAoZWxlbWVudCldLCB0MCh0aGlzLmJsb2NrKSwgdHJ1ZSlcblx0XHRjb25zdCBjYWxsID0gbXNDYWxsKCckZm9yJywgdDAoYmFnKSwgZnVuYylcblx0XHRyZXR1cm4gdmVyaWZ5UmVzdWx0cy5pc1N0YXRlbWVudCh0aGlzKSA/IG5ldyBZaWVsZEV4cHJlc3Npb24oY2FsbCkgOiBjYWxsXG5cdH0sXG5cblx0Rm9yQmFnKCkge1xuXHRcdGNvbnN0IGxvb3AgPSBtYXliZUxhYmVsTG9vcCh0aGlzLCBmb3JMb29wKHRoaXMub3BJdGVyYXRlZSwgdGhpcy5ibG9jaykpXG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoW0RlY2xhcmVCdWlsdEJhZywgbG9vcCwgUmV0dXJuQnVpbHRdKSlcblx0fSxcblxuXHQvLyBsZWFkU3RhdGVtZW50cyBjb21lcyBmcm9tIGNvbnN0cnVjdG9yIG1lbWJlcnNcblx0Ly8gZG9udERlY2xhcmVUaGlzOiBhcHBsaWVzIGlmIHRoaXMgaXMgdGhlIGZ1biBmb3IgYSBDb25zdHJ1Y3Rvcixcblx0Ly8gd2hpY2ggbWF5IGRlY2xhcmUgYHRoaXNgIGF0IGEgYHN1cGVyYCBjYWxsLlxuXHRGdW4obGVhZFN0YXRlbWVudHMgPSBudWxsLCBkb250RGVjbGFyZVRoaXMgPSBmYWxzZSkge1xuXHRcdHJldHVybiB3aXRoRnVuS2luZCh0aGlzLmtpbmQsICgpID0+IHtcblx0XHRcdC8vIFRPRE86RVM2IHVzZSBgLi4uYGZcblx0XHRcdGNvbnN0IG5BcmdzID0gbmV3IExpdGVyYWwodGhpcy5hcmdzLmxlbmd0aClcblx0XHRcdGNvbnN0IG9wRGVjbGFyZVJlc3QgPSBvcE1hcCh0aGlzLm9wUmVzdEFyZywgcmVzdCA9PlxuXHRcdFx0XHRkZWNsYXJlKHJlc3QsIG5ldyBDYWxsRXhwcmVzc2lvbihBcnJheVNsaWNlQ2FsbCwgW0lkQXJndW1lbnRzLCBuQXJnc10pKSlcblx0XHRcdGNvbnN0IGFyZ0NoZWNrcyA9IG9wSWYob3B0aW9ucy5pbmNsdWRlQ2hlY2tzKCksICgpID0+XG5cdFx0XHRcdGZsYXRPcE1hcCh0aGlzLmFyZ3MsIG9wVHlwZUNoZWNrRm9yTG9jYWxEZWNsYXJlKSlcblxuXHRcdFx0Y29uc3Qgb3BEZWNsYXJlVGhpcyA9IG9wSWYodGhpcy5vcERlY2xhcmVUaGlzICE9PSBudWxsICYmICFkb250RGVjbGFyZVRoaXMsICgpID0+XG5cdFx0XHRcdERlY2xhcmVMZXhpY2FsVGhpcylcblxuXHRcdFx0Y29uc3QgbGVhZCA9IGNhdChvcERlY2xhcmVSZXN0LCBvcERlY2xhcmVUaGlzLCBhcmdDaGVja3MsIGxlYWRTdGF0ZW1lbnRzKVxuXG5cdFx0XHRjb25zdCBib2R5ID0gKCkgPT4gdDIodGhpcy5ibG9jaywgbGVhZCwgdGhpcy5vcFJldHVyblR5cGUpXG5cdFx0XHRjb25zdCBhcmdzID0gdGhpcy5hcmdzLm1hcCh0MClcblx0XHRcdGNvbnN0IGlkID0gb3BNYXAodmVyaWZ5UmVzdWx0cy5vcE5hbWUodGhpcyksIGlkZW50aWZpZXIpXG5cblx0XHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRcdGNhc2UgRnVucy5QbGFpbjpcblx0XHRcdFx0XHQvLyBUT0RPOkVTNiBTaG91bGQgYmUgYWJsZSB0byB1c2UgcmVzdCBhcmdzIGluIGFycm93IGZ1bmN0aW9uXG5cdFx0XHRcdFx0cmV0dXJuIGlkID09PSBudWxsICYmIHRoaXMub3BEZWNsYXJlVGhpcyA9PT0gbnVsbCAmJiBvcERlY2xhcmVSZXN0ID09PSBudWxsID9cblx0XHRcdFx0XHRcdG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihhcmdzLCBib2R5KCkpIDpcblx0XHRcdFx0XHRcdG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIGFyZ3MsIGJvZHkoKSlcblx0XHRcdFx0Y2FzZSBGdW5zLkFzeW5jOiB7XG5cdFx0XHRcdFx0Y29uc3QgcGxhaW5Cb2R5ID0gdDIodGhpcy5ibG9jaywgbnVsbCwgdGhpcy5vcFJldHVyblR5cGUpXG5cdFx0XHRcdFx0Y29uc3QgZ2VuRnVuYyA9IG5ldyBGdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgW10sIHBsYWluQm9keSwgdHJ1ZSlcblx0XHRcdFx0XHRjb25zdCByZXQgPSBuZXcgUmV0dXJuU3RhdGVtZW50KG1zQ2FsbCgnYXN5bmMnLCBnZW5GdW5jKSlcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihpZCwgYXJncywgbmV3IEJsb2NrU3RhdGVtZW50KGNhdChsZWFkLCByZXQpKSlcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlIEZ1bnMuR2VuZXJhdG9yOlxuXHRcdFx0XHRcdHJldHVybiBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKGlkLCBhcmdzLCBib2R5KCksIHRydWUpXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHRcdH1cblx0XHR9KVxuXHR9LFxuXG5cdEdldHRlckZ1bigpIHtcblx0XHQvLyBfID0+IF8uZm9vXG5cdFx0cmV0dXJuIGZvY3VzRnVuKG1lbWJlclN0cmluZ09yVmFsKElkRm9jdXMsIHRoaXMubmFtZSkpXG5cdH0sXG5cblx0SWdub3JlKCkge1xuXHRcdHJldHVybiBbXVxuXHR9LFxuXG5cdEluc3RhbmNlT2YoKSB7XG5cdFx0Ly8gVE9ETzpFUzYgbmV3IEJpbmFyeUV4cHJlc3Npb24oJ2luc3RhbmNlb2YnLCB0MCh0aGlzLmluc3RhbmNlKSwgdDAodGhpcy50eXBlKSlcblx0XHRyZXR1cm4gbXNDYWxsKCdoYXNJbnN0YW5jZScsIHQwKHRoaXMudHlwZSksIHQwKHRoaXMuaW5zdGFuY2UpKVxuXHR9LFxuXG5cdEtpbmQoKSB7XG5cdFx0Y29uc3QgbmFtZSA9IG5ldyBMaXRlcmFsKHZlcmlmeVJlc3VsdHMubmFtZSh0aGlzKSlcblx0XHRjb25zdCBzdXBlcnMgPSBuZXcgQXJyYXlFeHByZXNzaW9uKHRoaXMuc3VwZXJLaW5kcy5tYXAodDApKVxuXHRcdGNvbnN0IG1ldGhvZHMgPSBfID0+XG5cdFx0XHRuZXcgT2JqZWN0RXhwcmVzc2lvbihfLm1hcCh0cmFuc3BpbGVNZXRob2RUb1Byb3BlcnR5KSlcblx0XHRjb25zdCBraW5kID0gbXNDYWxsKCdraW5kJywgbmFtZSwgc3VwZXJzLCBtZXRob2RzKHRoaXMuc3RhdGljcyksIG1ldGhvZHModGhpcy5tZXRob2RzKSlcblxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcERvLFxuXHRcdFx0XyA9PiBibG9ja1dyYXAodDMoXy5ibG9jaywgcGxhaW5MZXQoSWRGb2N1cywga2luZCksIG51bGwsIFJldHVybkZvY3VzKSksXG5cdFx0XHQoKSA9PiBraW5kKVxuXHR9LFxuXG5cdExhenkoKSB7XG5cdFx0cmV0dXJuIGxhenlXcmFwKHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdE51bWJlckxpdGVyYWwoKSB7XG5cdFx0Ly8gTmVnYXRpdmUgbnVtYmVycyBhcmUgbm90IHBhcnQgb2YgRVMgc3BlYy5cblx0XHQvLyBodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNS4xLyNzZWMtNy44LjNcblx0XHRjb25zdCB2YWx1ZSA9IE51bWJlcih0aGlzLnZhbHVlKVxuXHRcdGNvbnN0IGxpdCA9IG5ldyBMaXRlcmFsKE1hdGguYWJzKHZhbHVlKSlcblx0XHRjb25zdCBpc1Bvc2l0aXZlID0gdmFsdWUgPj0gMCAmJiAxIC8gdmFsdWUgIT09IC1JbmZpbml0eVxuXHRcdHJldHVybiBpc1Bvc2l0aXZlID8gbGl0IDogbmV3IFVuYXJ5RXhwcmVzc2lvbignLScsIGxpdClcblx0fSxcblxuXHRMb2NhbEFjY2VzcygpIHtcblx0XHRpZiAodGhpcy5uYW1lID09PSAndGhpcycpXG5cdFx0XHRyZXR1cm4gSWRMZXhpY2FsVGhpc1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgbGQgPSB2ZXJpZnlSZXN1bHRzLmxvY2FsRGVjbGFyZUZvckFjY2Vzcyh0aGlzKVxuXHRcdFx0Ly8gSWYgbGQgbWlzc2luZywgdGhpcyBpcyBhIGJ1aWx0aW4sIGFuZCBidWlsdGlucyBhcmUgbmV2ZXIgbGF6eVxuXHRcdFx0cmV0dXJuIGxkID09PSB1bmRlZmluZWQgPyBpZGVudGlmaWVyKHRoaXMubmFtZSkgOiBhY2Nlc3NMb2NhbERlY2xhcmUobGQpXG5cdFx0fVxuXHR9LFxuXG5cdExvY2FsRGVjbGFyZSgpIHtcblx0XHRyZXR1cm4gbmV3IElkZW50aWZpZXIoaWRGb3JEZWNsYXJlQ2FjaGVkKHRoaXMpLm5hbWUpXG5cdH0sXG5cblx0TG9jYWxNdXRhdGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIGlkZW50aWZpZXIodGhpcy5uYW1lKSwgdDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0TG9naWMoKSB7XG5cdFx0Y29uc3Qgb3AgPSB0aGlzLmtpbmQgPT09IExvZ2ljcy5BbmQgPyAnJiYnIDogJ3x8J1xuXHRcdHJldHVybiB0YWlsKHRoaXMuYXJncykucmVkdWNlKFxuXHRcdFx0KGEsIGIpID0+IG5ldyBMb2dpY2FsRXhwcmVzc2lvbihvcCwgYSwgdDAoYikpLFxuXHRcdFx0dDAodGhpcy5hcmdzWzBdKSlcblx0fSxcblxuXHRNYXBFbnRyeSgpIHtcblx0XHRyZXR1cm4gbXNDYWxsKCdzZXRTdWInLCBJZEJ1aWx0LCB0MCh0aGlzLmtleSksIHQwKHRoaXMudmFsKSlcblx0fSxcblxuXHRNZW1iZXIoKSB7XG5cdFx0cmV0dXJuIG1lbWJlclN0cmluZ09yVmFsKHQwKHRoaXMub2JqZWN0KSwgdGhpcy5uYW1lKVxuXHR9LFxuXG5cdE1lbWJlckZ1bigpIHtcblx0XHRjb25zdCBuYW1lID0gdHJhbnNwaWxlTmFtZSh0aGlzLm5hbWUpXG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wT2JqZWN0LFxuXHRcdFx0XyA9PiBtc0NhbGwoJ21ldGhvZEJvdW5kJywgdDAoXyksIG5hbWUpLFxuXHRcdFx0KCkgPT4gbXNDYWxsKCdtZXRob2RVbmJvdW5kJywgbmFtZSkpXG5cdH0sXG5cblx0TWVtYmVyU2V0KCkge1xuXHRcdGNvbnN0IG9iaiA9IHQwKHRoaXMub2JqZWN0KVxuXHRcdGNvbnN0IHZhbCA9IG1heWJlV3JhcEluQ2hlY2tJbnN0YW5jZSh0MCh0aGlzLnZhbHVlKSwgdGhpcy5vcFR5cGUsIHRoaXMubmFtZSlcblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTZXR0ZXJzLkluaXQ6XG5cdFx0XHRcdHJldHVybiBtc0NhbGwoJ25ld1Byb3BlcnR5Jywgb2JqLCB0cmFuc3BpbGVOYW1lKHRoaXMubmFtZSksIHZhbClcblx0XHRcdGNhc2UgU2V0dGVycy5NdXRhdGU6XG5cdFx0XHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXJTdHJpbmdPclZhbChvYmosIHRoaXMubmFtZSksIHZhbClcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0fVxuXHR9LFxuXG5cdE1ldGhvZCgpIHtcblx0XHRjb25zdCBuYW1lID0gbmV3IExpdGVyYWwodmVyaWZ5UmVzdWx0cy5uYW1lKHRoaXMpKVxuXG5cdFx0Y29uc3QgYXJncyA9IHRoaXMuZnVuLm9wUmVzdEFyZyA9PT0gbnVsbCA/XG5cdFx0XHRuZXcgQXJyYXlFeHByZXNzaW9uKHRoaXMuZnVuLmFyZ3MubWFwKGFyZyA9PiB7XG5cdFx0XHRcdGNvbnN0IG5hbWUgPSBuZXcgTGl0ZXJhbChhcmcubmFtZSlcblx0XHRcdFx0Y29uc3Qgb3BUeXBlID0gb3BNYXAoYXJnLm9wVHlwZSwgdDApXG5cdFx0XHRcdHJldHVybiBpZkVsc2Uob3BUeXBlLFxuXHRcdFx0XHRcdF8gPT4gbmV3IEFycmF5RXhwcmVzc2lvbihbbmFtZSwgX10pLFxuXHRcdFx0XHRcdCgpID0+IG5hbWUpXG5cdFx0XHR9KSkgOlxuXHRcdFx0bmV3IFVuYXJ5RXhwcmVzc2lvbigndm9pZCcsIG5ldyBMaXRlcmFsKDApKVxuXHRcdGNvbnN0IGltcGwgPSB0aGlzLmZ1biBpbnN0YW5jZW9mIEZ1biA/IFt0MCh0aGlzLmZ1bildIDogW11cblx0XHRyZXR1cm4gbXNDYWxsKCdtZXRob2QnLCBuYW1lLCBhcmdzLCAuLi5pbXBsKVxuXHR9LFxuXG5cdE1vZHVsZTogdHJhbnNwaWxlTW9kdWxlLFxuXG5cdE1zUmVnRXhwKCkge1xuXHRcdHJldHVybiB0aGlzLnBhcnRzLmxlbmd0aCA9PT0gMCA/XG5cdFx0XHRuZXcgTGl0ZXJhbChuZXcgUmVnRXhwKCcnLCB0aGlzLmZsYWdzKSkgOlxuXHRcdFx0dGhpcy5wYXJ0cy5sZW5ndGggPT09IDEgJiYgdHlwZW9mIHRoaXMucGFydHNbMF0gPT09ICdzdHJpbmcnID9cblx0XHRcdG5ldyBMaXRlcmFsKG5ldyBSZWdFeHAodGhpcy5wYXJ0c1swXS5yZXBsYWNlKCdcXG4nLCAnXFxcXG4nKSwgdGhpcy5mbGFncykpIDpcblx0XHRcdG1zQ2FsbCgncmVnZXhwJyxcblx0XHRcdFx0bmV3IEFycmF5RXhwcmVzc2lvbih0aGlzLnBhcnRzLm1hcCh0cmFuc3BpbGVOYW1lKSksIG5ldyBMaXRlcmFsKHRoaXMuZmxhZ3MpKVxuXHR9LFxuXG5cdE5ldygpIHtcblx0XHRyZXR1cm4gbmV3IE5ld0V4cHJlc3Npb24odDAodGhpcy50eXBlKSwgdGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0Tm90KCkge1xuXHRcdHJldHVybiBuZXcgVW5hcnlFeHByZXNzaW9uKCchJywgdDAodGhpcy5hcmcpKVxuXHR9LFxuXG5cdE9iakVudHJ5QXNzaWduKCkge1xuXHRcdGlmICh0aGlzLmFzc2lnbiBpbnN0YW5jZW9mIEFzc2lnblNpbmdsZSAmJiAhdGhpcy5hc3NpZ24uYXNzaWduZWUuaXNMYXp5KCkpIHtcblx0XHRcdGNvbnN0IG5hbWUgPSB0aGlzLmFzc2lnbi5hc3NpZ25lZS5uYW1lXG5cdFx0XHRyZXR1cm4gdDEodGhpcy5hc3NpZ24sIHZhbCA9PlxuXHRcdFx0XHR2ZXJpZnlSZXN1bHRzLmlzT2JqRW50cnlFeHBvcnQodGhpcykgP1xuXHRcdFx0XHRcdGV4cG9ydE5hbWVkT3JEZWZhdWx0KHZhbCwgbmFtZSkgOlxuXHRcdFx0XHRcdG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlcihJZEJ1aWx0LCBuYW1lKSwgdmFsKSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgYXNzaWducyA9IHRoaXMuYXNzaWduLmFsbEFzc2lnbmVlcygpLm1hcChfID0+XG5cdFx0XHRcdG1zQ2FsbCgnc2V0TGF6eScsIElkQnVpbHQsIG5ldyBMaXRlcmFsKF8ubmFtZSksIGlkRm9yRGVjbGFyZUNhY2hlZChfKSkpXG5cdFx0XHRyZXR1cm4gY2F0KHQwKHRoaXMuYXNzaWduKSwgYXNzaWducylcblx0XHR9XG5cdH0sXG5cblx0T2JqRW50cnlQbGFpbigpIHtcblx0XHRjb25zdCB2YWwgPSB0MCh0aGlzLnZhbHVlKVxuXHRcdHJldHVybiB2ZXJpZnlSZXN1bHRzLmlzT2JqRW50cnlFeHBvcnQodGhpcykgP1xuXHRcdFx0Ly8gV2UndmUgdmVyaWZpZWQgdGhhdCBmb3IgbW9kdWxlIGV4cG9ydCwgdGhpcy5uYW1lIG11c3QgYmUgYSBzdHJpbmcuXG5cdFx0XHRleHBvcnROYW1lZE9yRGVmYXVsdCh2YWwsIHRoaXMubmFtZSkgOlxuXHRcdFx0bmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyU3RyaW5nT3JWYWwoSWRCdWlsdCwgdGhpcy5uYW1lKSwgdmFsKVxuXHR9LFxuXG5cdE9ialNpbXBsZSgpIHtcblx0XHRyZXR1cm4gbmV3IE9iamVjdEV4cHJlc3Npb24odGhpcy5wYWlycy5tYXAocGFpciA9PlxuXHRcdFx0bmV3IFByb3BlcnR5KCdpbml0JywgcHJvcGVydHlJZE9yTGl0ZXJhbChwYWlyLmtleSksIHQwKHBhaXIudmFsdWUpKSkpXG5cdH0sXG5cblx0UGlwZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5waXBlcy5yZWR1Y2UoKGV4cHIsIHBpcGUpID0+IGNhbGxGb2N1c0Z1bih0MChwaXBlKSwgZXhwciksIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdFF1b3RlUGxhaW4oKSB7XG5cdFx0aWYgKGlzRW1wdHkodGhpcy5wYXJ0cykpXG5cdFx0XHRyZXR1cm4gTGl0RW1wdHlTdHJpbmdcblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IHF1YXNpcyA9IFtdLCBleHByZXNzaW9ucyA9IFtdXG5cblx0XHRcdC8vIFRlbXBsYXRlTGl0ZXJhbCBtdXN0IHN0YXJ0IHdpdGggYSBUZW1wbGF0ZUVsZW1lbnRcblx0XHRcdGlmICh0eXBlb2YgdGhpcy5wYXJ0c1swXSAhPT0gJ3N0cmluZycpXG5cdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5lbXB0eSlcblxuXHRcdFx0Zm9yIChjb25zdCBwYXJ0IG9mIHRoaXMucGFydHMpXG5cdFx0XHRcdGlmICh0eXBlb2YgcGFydCA9PT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmZvclJhd1N0cmluZyhwYXJ0KSlcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Ly8gXCJ7MX17MX1cIiBuZWVkcyBhbiBlbXB0eSBxdWFzaSBpbiB0aGUgbWlkZGxlIChhbmQgb24gdGhlIGVuZHMpLlxuXHRcdFx0XHRcdC8vIFRoZXJlIGFyZSBuZXZlciBtb3JlIHRoYW4gMiBzdHJpbmcgcGFydHMgaW4gYSByb3csXG5cdFx0XHRcdFx0Ly8gc28gcXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoIG9yIGlzIGV4YWN0bHkgMSBtb3JlLlxuXHRcdFx0XHRcdGlmIChxdWFzaXMubGVuZ3RoID09PSBleHByZXNzaW9ucy5sZW5ndGgpXG5cdFx0XHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZW1wdHkpXG5cdFx0XHRcdFx0ZXhwcmVzc2lvbnMucHVzaCh0MChwYXJ0KSlcblx0XHRcdFx0fVxuXG5cdFx0XHQvLyBUZW1wbGF0ZUxpdGVyYWwgbXVzdCBlbmQgd2l0aCBhIFRlbXBsYXRlRWxlbWVudCwgc28gb25lIG1vcmUgcXVhc2kgdGhhbiBleHByZXNzaW9uLlxuXHRcdFx0aWYgKHF1YXNpcy5sZW5ndGggPT09IGV4cHJlc3Npb25zLmxlbmd0aClcblx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmVtcHR5KVxuXG5cdFx0XHRyZXR1cm4gbmV3IFRlbXBsYXRlTGl0ZXJhbChxdWFzaXMsIGV4cHJlc3Npb25zKVxuXHRcdH1cblx0fSxcblxuXHRRdW90ZVNpbXBsZSgpIHtcblx0XHRyZXR1cm4gbmV3IExpdGVyYWwodGhpcy5uYW1lKVxuXHR9LFxuXG5cdFF1b3RlVGFnZ2VkVGVtcGxhdGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBUYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb24odDAodGhpcy50YWcpLCB0MCh0aGlzLnF1b3RlKSlcblx0fSxcblxuXHRSYW5nZSgpIHtcblx0XHRjb25zdCBlbmQgPSBpZkVsc2UodGhpcy5lbmQsIHQwLCAoKSA9PiBHbG9iYWxJbmZpbml0eSlcblx0XHRyZXR1cm4gbXNDYWxsKCdyYW5nZScsIHQwKHRoaXMuc3RhcnQpLCBlbmQsIG5ldyBMaXRlcmFsKHRoaXMuaXNFeGNsdXNpdmUpKVxuXHR9LFxuXG5cdFNldFN1YigpIHtcblx0XHRjb25zdCBnZXRLaW5kID0gKCkgPT4ge1xuXHRcdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBTZXR0ZXJzLkluaXQ6XG5cdFx0XHRcdFx0cmV0dXJuICdpbml0J1xuXHRcdFx0XHRjYXNlIFNldHRlcnMuTXV0YXRlOlxuXHRcdFx0XHRcdHJldHVybiAnbXV0YXRlJ1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNvbnN0IGtpbmQgPSBnZXRLaW5kKClcblx0XHRyZXR1cm4gbXNDYWxsKFxuXHRcdFx0J3NldFN1YicsXG5cdFx0XHR0MCh0aGlzLm9iamVjdCksXG5cdFx0XHR0aGlzLnN1YmJlZHMubGVuZ3RoID09PSAxID8gdDAodGhpcy5zdWJiZWRzWzBdKSA6IHRoaXMuc3ViYmVkcy5tYXAodDApLFxuXHRcdFx0bWF5YmVXcmFwSW5DaGVja0luc3RhbmNlKHQwKHRoaXMudmFsdWUpLCB0aGlzLm9wVHlwZSwgJ3ZhbHVlJyksXG5cdFx0XHRuZXcgTGl0ZXJhbChraW5kKSlcblx0fSxcblxuXHRTaW1wbGVGdW4oKSB7XG5cdFx0cmV0dXJuIGZvY3VzRnVuKHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdFNwZWNpYWxEbygpIHtcblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTcGVjaWFsRG9zLkRlYnVnZ2VyOiByZXR1cm4gbmV3IERlYnVnZ2VyU3RhdGVtZW50KClcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcih0aGlzLmtpbmQpXG5cdFx0fVxuXHR9LFxuXG5cdFNwZWNpYWxWYWwoKSB7XG5cdFx0Ly8gTWFrZSBuZXcgb2JqZWN0cyBiZWNhdXNlIHdlIHdpbGwgYXNzaWduIGBsb2NgIHRvIHRoZW0uXG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuRmFsc2U6XG5cdFx0XHRcdHJldHVybiBuZXcgTGl0ZXJhbChmYWxzZSlcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuTmFtZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKHZlcmlmeVJlc3VsdHMubmFtZSh0aGlzKSlcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuTnVsbDpcblx0XHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKG51bGwpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLlRydWU6XG5cdFx0XHRcdHJldHVybiBuZXcgTGl0ZXJhbCh0cnVlKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5VbmRlZmluZWQ6XG5cdFx0XHRcdHJldHVybiBuZXcgVW5hcnlFeHByZXNzaW9uKCd2b2lkJywgTGl0WmVybylcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcih0aGlzLmtpbmQpXG5cdFx0fVxuXHR9LFxuXG5cdFNwcmVhZCgpIHtcblx0XHRyZXR1cm4gbmV3IFNwcmVhZEVsZW1lbnQodDAodGhpcy5zcHJlYWRlZCkpXG5cdH0sXG5cblx0U3ViKCkge1xuXHRcdHJldHVybiBtc0NhbGwoJ3N1YicsIHQwKHRoaXMuc3ViYmVkKSwgLi4udGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0U3VwZXJDYWxsKCkge1xuXHRcdGNvbnN0IGFyZ3MgPSB0aGlzLmFyZ3MubWFwKHQwKVxuXHRcdGNvbnN0IG1ldGhvZCA9IHZlcmlmeVJlc3VsdHMuc3VwZXJDYWxsVG9NZXRob2QuZ2V0KHRoaXMpXG5cblx0XHRpZiAobWV0aG9kIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpIHtcblx0XHRcdC8vIHN1cGVyIG11c3QgYXBwZWFyIGFzIGEgc3RhdGVtZW50LCBzbyBPSyB0byBkZWNhbHJlIGB0aGlzYFxuXHRcdFx0Y29uc3QgY2FsbCA9IG5ldyBDYWxsRXhwcmVzc2lvbihJZFN1cGVyLCBhcmdzKVxuXHRcdFx0Y29uc3QgbWVtYmVyU2V0cyA9IGNvbnN0cnVjdG9yU2V0TWVtYmVycyhtZXRob2QpXG5cdFx0XHRyZXR1cm4gY2F0KGNhbGwsIG1lbWJlclNldHMsIFNldExleGljYWxUaGlzKVxuXHRcdH0gZWxzZVxuXHRcdFx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbihtZW1iZXJTdHJpbmdPclZhbChJZFN1cGVyLCBtZXRob2Quc3ltYm9sKSwgYXJncylcblx0fSxcblxuXHRTdXBlck1lbWJlcigpIHtcblx0XHRyZXR1cm4gbWVtYmVyU3RyaW5nT3JWYWwoSWRTdXBlciwgdGhpcy5uYW1lKVxuXHR9LFxuXG5cdFN3aXRjaCgpIHtcblx0XHRjb25zdCBwYXJ0cyA9IGZsYXRNYXAodGhpcy5wYXJ0cywgdDApXG5cdFx0cGFydHMucHVzaChpZkVsc2UodGhpcy5vcEVsc2UsXG5cdFx0XHRfID0+IG5ldyBTd2l0Y2hDYXNlKHVuZGVmaW5lZCwgdDAoXykuYm9keSksXG5cdFx0XHQoKSA9PiBTd2l0Y2hDYXNlTm9NYXRjaCkpXG5cdFx0cmV0dXJuIGJsb2NrV3JhcElmVmFsKHRoaXMsIG5ldyBTd2l0Y2hTdGF0ZW1lbnQodDAodGhpcy5zd2l0Y2hlZCksIHBhcnRzKSlcblx0fSxcblxuXHRTd2l0Y2hQYXJ0KCkge1xuXHRcdGNvbnN0IGZvbGxvdyA9IG9wSWYodmVyaWZ5UmVzdWx0cy5pc1N0YXRlbWVudCh0aGlzKSwgKCkgPT4gbmV3IEJyZWFrU3RhdGVtZW50KVxuXHRcdC8qXG5cdFx0V2UgY291bGQganVzdCBwYXNzIGJsb2NrLmJvZHkgZm9yIHRoZSBzd2l0Y2ggbGluZXMsIGJ1dCBpbnN0ZWFkXG5cdFx0ZW5jbG9zZSB0aGUgYm9keSBvZiB0aGUgc3dpdGNoIGNhc2UgaW4gY3VybHkgYnJhY2VzIHRvIGVuc3VyZSBhIG5ldyBzY29wZS5cblx0XHRUaGF0IHdheSB0aGlzIGNvZGUgd29ya3M6XG5cdFx0XHRzd2l0Y2ggKDApIHtcblx0XHRcdFx0Y2FzZSAwOiB7XG5cdFx0XHRcdFx0Y29uc3QgYSA9IDBcblx0XHRcdFx0XHRyZXR1cm4gYVxuXHRcdFx0XHR9XG5cdFx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0XHQvLyBXaXRob3V0IGN1cmx5IGJyYWNlcyB0aGlzIHdvdWxkIGNvbmZsaWN0IHdpdGggdGhlIG90aGVyIGBhYC5cblx0XHRcdFx0XHRjb25zdCBhID0gMVxuXHRcdFx0XHRcdGFcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdCovXG5cdFx0Y29uc3QgYmxvY2sgPSB0Myh0aGlzLnJlc3VsdCwgbnVsbCwgbnVsbCwgZm9sbG93KVxuXHRcdC8vIElmIHN3aXRjaCBoYXMgbXVsdGlwbGUgdmFsdWVzLCBidWlsZCB1cCBhIHN0YXRlbWVudCBsaWtlOiBgY2FzZSAxOiBjYXNlIDI6IHsgZG9CbG9jaygpIH1gXG5cdFx0Y29uc3QgeCA9IFtdXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnZhbHVlcy5sZW5ndGggLSAxOyBpID0gaSArIDEpXG5cdFx0XHQvLyBUaGVzZSBjYXNlcyBmYWxsdGhyb3VnaCB0byB0aGUgb25lIGF0IHRoZSBlbmQuXG5cdFx0XHR4LnB1c2gobmV3IFN3aXRjaENhc2UodDAodGhpcy52YWx1ZXNbaV0pLCBbXSkpXG5cdFx0eC5wdXNoKG5ldyBTd2l0Y2hDYXNlKHQwKHRoaXMudmFsdWVzW3RoaXMudmFsdWVzLmxlbmd0aCAtIDFdKSwgW2Jsb2NrXSkpXG5cdFx0cmV0dXJuIHhcblx0fSxcblxuXHRUaHJvdygpIHtcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BUaHJvd24sXG5cdFx0XHRfID0+IGRvVGhyb3coXyksXG5cdFx0XHQoKSA9PiBuZXcgVGhyb3dTdGF0ZW1lbnQobmV3IE5ld0V4cHJlc3Npb24oR2xvYmFsRXJyb3IsIFtMaXRTdHJUaHJvd10pKSlcblx0fSxcblxuXHRXaXRoKCkge1xuXHRcdGNvbnN0IGlkRGVjbGFyZSA9IGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzLmRlY2xhcmUpXG5cdFx0Y29uc3QgdmFsID0gdDAodGhpcy52YWx1ZSlcblx0XHRjb25zdCBsZWFkID0gcGxhaW5MZXQoaWREZWNsYXJlLCB2YWwpXG5cdFx0cmV0dXJuIHZlcmlmeVJlc3VsdHMuaXNTdGF0ZW1lbnQodGhpcykgP1xuXHRcdFx0dDEodGhpcy5ibG9jaywgbGVhZCkgOlxuXHRcdFx0YmxvY2tXcmFwKHQzKHRoaXMuYmxvY2ssIGxlYWQsIG51bGwsIG5ldyBSZXR1cm5TdGF0ZW1lbnQoaWREZWNsYXJlKSkpXG5cdH0sXG5cblx0WWllbGQoKSB7XG5cdFx0cmV0dXJuIG5ldyBZaWVsZEV4cHJlc3Npb24ob3BNYXAodGhpcy5vcFZhbHVlLCB0MCksIGZhbHNlKVxuXHR9LFxuXG5cdFlpZWxkVG8oKSB7XG5cdFx0cmV0dXJuIG5ldyBZaWVsZEV4cHJlc3Npb24odDAodGhpcy52YWx1ZSksIHRydWUpXG5cdH1cbn0pXG5cbi8vIEZ1bmN0aW9ucyBzcGVjaWZpYyB0byBjZXJ0YWluIGV4cHJlc3Npb25zXG5cbmZ1bmN0aW9uIGNhc2VCb2R5KHBhcnRzLCBvcEVsc2UpIHtcblx0bGV0IGFjYyA9IGlmRWxzZShvcEVsc2UsIHQwLCAoKSA9PiBUaHJvd05vQ2FzZU1hdGNoKVxuXHRmb3IgKGxldCBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpID0gaSAtIDEpXG5cdFx0YWNjID0gdDEocGFydHNbaV0sIGFjYylcblx0cmV0dXJuIGFjY1xufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RvclNldE1lbWJlcnMoY29uc3RydWN0b3IpIHtcblx0cmV0dXJuIGNvbnN0cnVjdG9yLm1lbWJlckFyZ3MubWFwKF8gPT5cblx0XHRtc0NhbGwoJ25ld1Byb3BlcnR5JywgbmV3IFRoaXNFeHByZXNzaW9uKCksIG5ldyBMaXRlcmFsKF8ubmFtZSksIGlkRm9yRGVjbGFyZUNhY2hlZChfKSkpXG59XG5cbmZ1bmN0aW9uIGZvckxvb3Aob3BJdGVyYXRlZSwgYmxvY2spIHtcblx0Y29uc3QganNCbG9jayA9IHQwKGJsb2NrKVxuXHRyZXR1cm4gaWZFbHNlKG9wSXRlcmF0ZWUsXG5cdFx0KHtlbGVtZW50LCBiYWd9KSA9PlxuXHRcdFx0bmV3IEZvck9mU3RhdGVtZW50KFxuXHRcdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignbGV0JywgW25ldyBWYXJpYWJsZURlY2xhcmF0b3IodDAoZWxlbWVudCkpXSksXG5cdFx0XHRcdHQwKGJhZyksXG5cdFx0XHRcdGpzQmxvY2spLFxuXHRcdCgpID0+IG5ldyBGb3JTdGF0ZW1lbnQobnVsbCwgbnVsbCwgbnVsbCwganNCbG9jaykpXG59XG5cbmZ1bmN0aW9uIG1heWJlTGFiZWxMb29wKGFzdCwgbG9vcCkge1xuXHRyZXR1cm4gdmVyaWZ5UmVzdWx0cy5sb29wTmVlZHNMYWJlbChhc3QpID8gbmV3IExhYmVsZWRTdGF0ZW1lbnQoSWRMb29wLCBsb29wKSA6IGxvb3Bcbn1cblxuZnVuY3Rpb24gdHJhbnNwaWxlQmxvY2tSZXR1cm4ocmV0dXJuZWQsIGxpbmVzLCBsZWFkLCBvcFJldHVyblR5cGUpIHtcblx0Y29uc3QgcmV0ID0gbmV3IFJldHVyblN0YXRlbWVudChcblx0XHRtYXliZVdyYXBJbkNoZWNrSW5zdGFuY2UocmV0dXJuZWQsIG9wUmV0dXJuVHlwZSwgJ3JldHVybmVkIHZhbHVlJykpXG5cdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIGxpbmVzLCByZXQpKVxufVxuIl19
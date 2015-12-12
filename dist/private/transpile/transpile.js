'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/util', '../context', '../MsAst', '../util', '../VerifyResults', './ast-constants', './context', './transpileClass', './transpileExcept', './transpileMethod', './transpileModule', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('esast/dist/util'), require('../context'), require('../MsAst'), require('../util'), require('../VerifyResults'), require('./ast-constants'), require('./context'), require('./transpileClass'), require('./transpileExcept'), require('./transpileMethod'), require('./transpileModule'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.context, global.MsAst, global.util, global.VerifyResults, global.astConstants, global.context, global.transpileClass, global.transpileExcept, global.transpileMethod, global.transpileModule, global.util);
		global.transpile = mod.exports;
	}
})(this, function (exports, _ast, _util, _context, _MsAst, _util2, _VerifyResults, _astConstants, _context2, _transpileClass, _transpileExcept, _transpileMethod, _transpileModule, _util3) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = transpile;

	var MsAstTypes = _interopRequireWildcard(_MsAst);

	var _transpileClass2 = _interopRequireDefault(_transpileClass);

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

		Catch: _transpileExcept.transpileCatch,
		Class: _transpileClass2.default,

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

		Constructor: _transpileClass.transpileConstructor,

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

		Pass() {
			return (0, _util3.t0)(this.ignored);
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
				const memberSets = (0, _transpileClass.constructorSetMembers)(method);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQThCd0IsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFBVCxTQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0E2RDFCLElBQUkseURBQUcsSUFBSTtPQUFFLFlBQVkseURBQUcsSUFBSTtPQUFFLE1BQU0seURBQUcsSUFBSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BcUhqRCxjQUFjLHlEQUFHLElBQUk7T0FBRSxlQUFlLHlEQUFHLEtBQUsiLCJmaWxlIjoidHJhbnNwaWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcnJheUV4cHJlc3Npb24sIEFycm93RnVuY3Rpb25FeHByZXNzaW9uLCBBc3NpZ25tZW50RXhwcmVzc2lvbiwgQmluYXJ5RXhwcmVzc2lvbixcblx0QmxvY2tTdGF0ZW1lbnQsIEJyZWFrU3RhdGVtZW50LCBDYWxsRXhwcmVzc2lvbiwgQ29uZGl0aW9uYWxFeHByZXNzaW9uLCBEZWJ1Z2dlclN0YXRlbWVudCxcblx0Rm9yT2ZTdGF0ZW1lbnQsIEZvclN0YXRlbWVudCwgRnVuY3Rpb25FeHByZXNzaW9uLCBJZGVudGlmaWVyLCBJZlN0YXRlbWVudCwgTGFiZWxlZFN0YXRlbWVudCxcblx0TGl0ZXJhbCwgTG9naWNhbEV4cHJlc3Npb24sIE1lbWJlckV4cHJlc3Npb24sIE5ld0V4cHJlc3Npb24sIE9iamVjdEV4cHJlc3Npb24sIFByb3BlcnR5LFxuXHRSZXR1cm5TdGF0ZW1lbnQsIFNwcmVhZEVsZW1lbnQsIFN3aXRjaENhc2UsIFN3aXRjaFN0YXRlbWVudCwgVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uLFxuXHRUZW1wbGF0ZUVsZW1lbnQsIFRlbXBsYXRlTGl0ZXJhbCwgVGhyb3dTdGF0ZW1lbnQsIFZhcmlhYmxlRGVjbGFyYXRpb24sIFVuYXJ5RXhwcmVzc2lvbixcblx0VmFyaWFibGVEZWNsYXJhdG9yLCBZaWVsZEV4cHJlc3Npb259IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IHtpZGVudGlmaWVyLCBtZW1iZXIsIHByb3BlcnR5SWRPckxpdGVyYWx9IGZyb20gJ2VzYXN0L2Rpc3QvdXRpbCdcbmltcG9ydCB7b3B0aW9uc30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCAqIGFzIE1zQXN0VHlwZXMgZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0Fzc2lnblNpbmdsZSwgQ2FsbCwgQ29uc3RydWN0b3IsIEZ1biwgRnVucywgTG9naWNzLCBNZW1iZXIsIExvY2FsRGVjbGFyZXMsIFBhdHRlcm4sIFNldHRlcnMsXG5cdFNwZWNpYWxEb3MsIFNwZWNpYWxWYWxzfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7YXNzZXJ0LCBjYXQsIGZsYXRNYXAsIGZsYXRPcE1hcCwgaWZFbHNlLCBpbXBsZW1lbnRNYW55LCBpc0VtcHR5LCBsYXN0LCBvcElmLCBvcE1hcCwgcnRhaWwsXG5cdHRhaWx9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0Jsb2Nrc30gZnJvbSAnLi4vVmVyaWZ5UmVzdWx0cydcbmltcG9ydCB7QXJyYXlTbGljZUNhbGwsIERlY2xhcmVCdWlsdEJhZywgRGVjbGFyZUJ1aWx0TWFwLCBEZWNsYXJlQnVpbHRPYmosIERlY2xhcmVMZXhpY2FsVGhpcyxcblx0SWRBcmd1bWVudHMsIElkQnVpbHQsIElkRXh0cmFjdCwgSWRGb2N1cywgSWRMZXhpY2FsVGhpcywgSWRMb29wLCBJZFN1cGVyLCBHbG9iYWxFcnJvcixcblx0R2xvYmFsSW5maW5pdHksIExpdEVtcHR5U3RyaW5nLCBMaXROdWxsLCBMaXRTdHJUaHJvdywgTGl0WmVybywgUmV0dXJuQnVpbHQsIFJldHVybkZvY3VzLFxuXHRTZXRMZXhpY2FsVGhpcywgU3dpdGNoQ2FzZU5vTWF0Y2gsIFRocm93QXNzZXJ0RmFpbCwgVGhyb3dOb0Nhc2VNYXRjaH0gZnJvbSAnLi9hc3QtY29uc3RhbnRzJ1xuaW1wb3J0IHtzZXR1cCwgdGVhckRvd24sIHZlcmlmeVJlc3VsdHMsIHdpdGhGdW5LaW5kfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQgdHJhbnNwaWxlQ2xhc3MsIHtjb25zdHJ1Y3RvclNldE1lbWJlcnMsIHRyYW5zcGlsZUNvbnN0cnVjdG9yfSBmcm9tICcuL3RyYW5zcGlsZUNsYXNzJ1xuaW1wb3J0IHRyYW5zcGlsZUV4Y2VwdCwge3RyYW5zcGlsZUNhdGNofSBmcm9tICcuL3RyYW5zcGlsZUV4Y2VwdCdcbmltcG9ydCB7dHJhbnNwaWxlTWV0aG9kVG9Qcm9wZXJ0eX0gZnJvbSAnLi90cmFuc3BpbGVNZXRob2QnXG5pbXBvcnQgdHJhbnNwaWxlTW9kdWxlLCB7ZXhwb3J0TmFtZWRPckRlZmF1bHR9IGZyb20gJy4vdHJhbnNwaWxlTW9kdWxlJ1xuaW1wb3J0IHthY2Nlc3NMb2NhbERlY2xhcmUsIGJsb2NrV3JhcCwgYmxvY2tXcmFwSWZCbG9jaywgYmxvY2tXcmFwSWZWYWwsIGNhbGxGb2N1c0Z1biwgZGVjbGFyZSxcblx0ZG9UaHJvdywgZm9jdXNGdW4sIGlkRm9yRGVjbGFyZUNhY2hlZCwgbGF6eVdyYXAsIG1ha2VEZWNsYXJhdG9yLCBtYWtlRGVzdHJ1Y3R1cmVEZWNsYXJhdG9ycyxcblx0bWF5YmVXcmFwSW5DaGVja0luc3RhbmNlLCBtZW1iZXJTdHJpbmdPclZhbCwgbXNDYWxsLCBtc01lbWJlciwgb3BUeXBlQ2hlY2tGb3JMb2NhbERlY2xhcmUsXG5cdHBsYWluTGV0LCB0MCwgdDEsIHQyLCB0MywgdExpbmVzLCB0cmFuc3BpbGVOYW1lfSBmcm9tICcuL3V0aWwnXG5cbi8qKiBUcmFuc2Zvcm0gYSB7QGxpbmsgTXNBc3R9IGludG8gYW4gZXNhc3QuICoqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhbnNwaWxlKG1vZHVsZUV4cHJlc3Npb24sIHZlcmlmeVJlc3VsdHMpIHtcblx0c2V0dXAodmVyaWZ5UmVzdWx0cylcblx0Y29uc3QgcmVzID0gdDAobW9kdWxlRXhwcmVzc2lvbilcblx0dGVhckRvd24oKVxuXHRyZXR1cm4gcmVzXG59XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ3RyYW5zcGlsZScsIHtcblx0QXNzZXJ0KCkge1xuXHRcdGNvbnN0IGZhaWxDb25kID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgY29uZCA9IHQwKHRoaXMuY29uZGl0aW9uKVxuXHRcdFx0cmV0dXJuIHRoaXMubmVnYXRlID8gY29uZCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJyEnLCBjb25kKVxuXHRcdH1cblxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcFRocm93bixcblx0XHRcdF8gPT4gbmV3IElmU3RhdGVtZW50KGZhaWxDb25kKCksIGRvVGhyb3coXykpLFxuXHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5jb25kaXRpb24gaW5zdGFuY2VvZiBDYWxsKSB7XG5cdFx0XHRcdFx0Y29uc3QgY2FsbCA9IHRoaXMuY29uZGl0aW9uXG5cdFx0XHRcdFx0Y29uc3QgY2FsbGVkID0gY2FsbC5jYWxsZWRcblx0XHRcdFx0XHRjb25zdCBhcmdzID0gY2FsbC5hcmdzLm1hcCh0MClcblx0XHRcdFx0XHRpZiAoY2FsbGVkIGluc3RhbmNlb2YgTWVtYmVyKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBhc3MgPSB0aGlzLm5lZ2F0ZSA/ICdhc3NlcnROb3RNZW1iZXInIDogJ2Fzc2VydE1lbWJlcidcblx0XHRcdFx0XHRcdHJldHVybiBtc0NhbGwoYXNzLCB0MChjYWxsZWQub2JqZWN0KSwgdHJhbnNwaWxlTmFtZShjYWxsZWQubmFtZSksIC4uLmFyZ3MpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnN0IGFzcyA9IHRoaXMubmVnYXRlID8gJ2Fzc2VydE5vdCcgOiAnYXNzZXJ0J1xuXHRcdFx0XHRcdFx0cmV0dXJuIG1zQ2FsbChhc3MsIHQwKGNhbGxlZCksIC4uLmFyZ3MpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KGZhaWxDb25kKCksIFRocm93QXNzZXJ0RmFpbClcblx0XHRcdH0pXG5cdH0sXG5cblx0QXNzaWduU2luZ2xlKHZhbFdyYXApIHtcblx0XHRjb25zdCB2YWwgPSB2YWxXcmFwID09PSB1bmRlZmluZWQgPyB0MCh0aGlzLnZhbHVlKSA6IHZhbFdyYXAodDAodGhpcy52YWx1ZSkpXG5cdFx0Y29uc3QgZGVjbGFyZSA9IG1ha2VEZWNsYXJhdG9yKHRoaXMuYXNzaWduZWUsIHZhbCwgZmFsc2UpXG5cdFx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdsZXQnLCBbZGVjbGFyZV0pXG5cdH0sXG5cdC8vIFRPRE86RVM2IEp1c3QgdXNlIG5hdGl2ZSBkZXN0cnVjdHVyaW5nIGFzc2lnblxuXHRBc3NpZ25EZXN0cnVjdHVyZSgpIHtcblx0XHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oXG5cdFx0XHQnbGV0Jyxcblx0XHRcdG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzKFxuXHRcdFx0XHR0aGlzLmFzc2lnbmVlcyxcblx0XHRcdFx0dGhpcy5raW5kKCkgPT09IExvY2FsRGVjbGFyZXMuTGF6eSxcblx0XHRcdFx0dDAodGhpcy52YWx1ZSksXG5cdFx0XHRcdGZhbHNlKSlcblx0fSxcblxuXHRBd2FpdCgpIHtcblx0XHRyZXR1cm4gbmV3IFlpZWxkRXhwcmVzc2lvbih0MCh0aGlzLnZhbHVlKSwgZmFsc2UpXG5cdH0sXG5cblx0QmFnRW50cnkoKSB7XG5cdFx0cmV0dXJuIG1zQ2FsbCh0aGlzLmlzTWFueSA/ICdhZGRNYW55JyA6ICdhZGQnLCBJZEJ1aWx0LCB0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHRCYWdTaW1wbGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBBcnJheUV4cHJlc3Npb24odGhpcy5wYXJ0cy5tYXAodDApKVxuXHR9LFxuXG5cdEJsb2NrKGxlYWQgPSBudWxsLCBvcFJldHVyblR5cGUgPSBudWxsLCBmb2xsb3cgPSBudWxsKSB7XG5cdFx0Y29uc3Qga2luZCA9IHZlcmlmeVJlc3VsdHMuYmxvY2tLaW5kKHRoaXMpXG5cdFx0c3dpdGNoIChraW5kKSB7XG5cdFx0XHRjYXNlIEJsb2Nrcy5Ebzpcblx0XHRcdFx0YXNzZXJ0KG9wUmV0dXJuVHlwZSA9PT0gbnVsbClcblx0XHRcdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgdExpbmVzKHRoaXMubGluZXMpLCBmb2xsb3cpKVxuXHRcdFx0Y2FzZSBCbG9ja3MuVGhyb3c6XG5cdFx0XHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoXG5cdFx0XHRcdFx0Y2F0KGxlYWQsIHRMaW5lcyhydGFpbCh0aGlzLmxpbmVzKSksIHQwKGxhc3QodGhpcy5saW5lcykpKSlcblx0XHRcdGNhc2UgQmxvY2tzLlJldHVybjpcblx0XHRcdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrUmV0dXJuKFxuXHRcdFx0XHRcdHQwKGxhc3QodGhpcy5saW5lcykpLCB0TGluZXMocnRhaWwodGhpcy5saW5lcykpLCBsZWFkLCBvcFJldHVyblR5cGUpXG5cdFx0XHRjYXNlIEJsb2Nrcy5CYWc6IGNhc2UgQmxvY2tzLk1hcDogY2FzZSBCbG9ja3MuT2JqOiB7XG5cdFx0XHRcdGNvbnN0IGRlY2xhcmUgPSBraW5kID09PSBCbG9ja3MuQmFnID9cblx0XHRcdFx0XHREZWNsYXJlQnVpbHRCYWcgOlxuXHRcdFx0XHRcdGtpbmQgPT09IEJsb2Nrcy5NYXAgPyBEZWNsYXJlQnVpbHRNYXAgOiBEZWNsYXJlQnVpbHRPYmpcblx0XHRcdFx0Y29uc3QgYm9keSA9IGNhdChkZWNsYXJlLCB0TGluZXModGhpcy5saW5lcykpXG5cdFx0XHRcdHJldHVybiB0cmFuc3BpbGVCbG9ja1JldHVybihJZEJ1aWx0LCBib2R5LCBsZWFkLCBvcFJldHVyblR5cGUpXG5cdFx0XHR9XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3Ioa2luZClcblx0XHR9XG5cdH0sXG5cblx0QmxvY2tXcmFwKCkge1xuXHRcdHJldHVybiBibG9ja1dyYXAodDAodGhpcy5ibG9jaykpXG5cdH0sXG5cblx0QnJlYWsoKSB7XG5cdFx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wVmFsdWUsXG5cdFx0XHRfID0+IG5ldyBSZXR1cm5TdGF0ZW1lbnQodDAoXykpLFxuXHRcdFx0KCkgPT4gbmV3IEJyZWFrU3RhdGVtZW50KHZlcmlmeVJlc3VsdHMuaXNCcmVha0luU3dpdGNoKHRoaXMpID8gSWRMb29wIDogbnVsbCkpXG5cdH0sXG5cblx0Q2FsbCgpIHtcblx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKHQwKHRoaXMuY2FsbGVkKSwgdGhpcy5hcmdzLm1hcCh0MCkpXG5cdH0sXG5cblx0Q2FzZSgpIHtcblx0XHRjb25zdCBib2R5ID0gY2FzZUJvZHkodGhpcy5wYXJ0cywgdGhpcy5vcEVsc2UpXG5cdFx0aWYgKHZlcmlmeVJlc3VsdHMuaXNTdGF0ZW1lbnQodGhpcykpXG5cdFx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BDYXNlZCwgXyA9PiBuZXcgQmxvY2tTdGF0ZW1lbnQoW3QwKF8pLCBib2R5XSksICgpID0+IGJvZHkpXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBibG9jayA9IGlmRWxzZSh0aGlzLm9wQ2FzZWQsIF8gPT4gW3QwKF8pLCBib2R5XSwgKCkgPT4gW2JvZHldKVxuXHRcdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoYmxvY2spKVxuXHRcdH1cblx0fSxcblxuXHRDYXNlUGFydChhbHRlcm5hdGUpIHtcblx0XHRpZiAodGhpcy50ZXN0IGluc3RhbmNlb2YgUGF0dGVybikge1xuXHRcdFx0Y29uc3Qge3R5cGUsIHBhdHRlcm5lZCwgbG9jYWxzfSA9IHRoaXMudGVzdFxuXHRcdFx0Y29uc3QgZGVjbCA9IHBsYWluTGV0KElkRXh0cmFjdCxcblx0XHRcdFx0bXNDYWxsKCdleHRyYWN0JywgdDAodHlwZSksIHQwKHBhdHRlcm5lZCksIG5ldyBMaXRlcmFsKGxvY2Fscy5sZW5ndGgpKSlcblx0XHRcdGNvbnN0IHRlc3QgPSBuZXcgQmluYXJ5RXhwcmVzc2lvbignIT09JywgSWRFeHRyYWN0LCBMaXROdWxsKVxuXHRcdFx0Y29uc3QgZXh0cmFjdCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdsZXQnLCBsb2NhbHMubWFwKChfLCBpZHgpID0+XG5cdFx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoXG5cdFx0XHRcdFx0aWRGb3JEZWNsYXJlQ2FjaGVkKF8pLFxuXHRcdFx0XHRcdG5ldyBNZW1iZXJFeHByZXNzaW9uKElkRXh0cmFjdCwgbmV3IExpdGVyYWwoaWR4KSkpKSlcblx0XHRcdGNvbnN0IHJlcyA9IHQxKHRoaXMucmVzdWx0LCBleHRyYWN0KVxuXHRcdFx0cmV0dXJuIG5ldyBCbG9ja1N0YXRlbWVudChbZGVjbCwgbmV3IElmU3RhdGVtZW50KHRlc3QsIHJlcywgYWx0ZXJuYXRlKV0pXG5cdFx0fSBlbHNlXG5cdFx0XHQvLyBhbHRlcm5hdGUgd3JpdHRlbiB0byBieSBgY2FzZUJvZHlgLlxuXHRcdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudCh0MCh0aGlzLnRlc3QpLCB0MCh0aGlzLnJlc3VsdCksIGFsdGVybmF0ZSlcblx0fSxcblxuXHRDYXRjaDogdHJhbnNwaWxlQ2F0Y2gsXG5cblx0Q2xhc3M6IHRyYW5zcGlsZUNsYXNzLFxuXG5cdENvbmQoKSB7XG5cdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbEV4cHJlc3Npb24odDAodGhpcy50ZXN0KSwgdDAodGhpcy5pZlRydWUpLCB0MCh0aGlzLmlmRmFsc2UpKVxuXHR9LFxuXG5cdENvbmRpdGlvbmFsKCkge1xuXHRcdGNvbnN0IHRlc3QgPSB0MCh0aGlzLnRlc3QpXG5cdFx0aWYgKHZlcmlmeVJlc3VsdHMuaXNTdGF0ZW1lbnQodGhpcykpXG5cdFx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KFxuXHRcdFx0XHR0aGlzLmlzVW5sZXNzID8gbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIHRlc3QpIDogdGVzdCwgdDAodGhpcy5yZXN1bHQpKVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gbXNDYWxsKCdzb21lJywgYmxvY2tXcmFwSWZCbG9jayh0aGlzLnJlc3VsdCkpXG5cdFx0XHRjb25zdCBub25lID0gbXNNZW1iZXIoJ05vbmUnKVxuXHRcdFx0Y29uc3QgW3RoZW4sIF9lbHNlXSA9IHRoaXMuaXNVbmxlc3MgPyBbbm9uZSwgcmVzdWx0XSA6IFtyZXN1bHQsIG5vbmVdXG5cdFx0XHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsRXhwcmVzc2lvbih0ZXN0LCB0aGVuLCBfZWxzZSlcblx0XHR9XG5cdH0sXG5cblx0Q29uc3RydWN0b3I6IHRyYW5zcGlsZUNvbnN0cnVjdG9yLFxuXG5cdERlbCgpIHtcblx0XHRyZXR1cm4gbXNDYWxsKCdkZWwnLCB0MCh0aGlzLnN1YmJlZCksIC4uLnRoaXMuYXJncy5tYXAodDApKVxuXHR9LFxuXG5cdEV4Y2VwdDogdHJhbnNwaWxlRXhjZXB0LFxuXG5cdEZvcigpIHtcblx0XHRjb25zdCBsb29wID0gZm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spXG5cdFx0cmV0dXJuIHZlcmlmeVJlc3VsdHMuaXNTdGF0ZW1lbnQodGhpcykgP1xuXHRcdFx0bWF5YmVMYWJlbExvb3AodGhpcywgbG9vcCkgOlxuXHRcdFx0Ly8gdXNlIGByZXR1cm5gIGluc3RlYWQgb2YgYGJyZWFrYCwgc28gbm8gbGFiZWwgbmVlZGVkXG5cdFx0XHRibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFtsb29wXSkpXG5cdH0sXG5cblx0Rm9yQXN5bmMoKSB7XG5cdFx0Y29uc3Qge2VsZW1lbnQsIGJhZ30gPSB0aGlzLml0ZXJhdGVlXG5cdFx0Y29uc3QgZnVuYyA9IG5ldyBGdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgW3QwKGVsZW1lbnQpXSwgdDAodGhpcy5ibG9jayksIHRydWUpXG5cdFx0Y29uc3QgY2FsbCA9IG1zQ2FsbCgnJGZvcicsIHQwKGJhZyksIGZ1bmMpXG5cdFx0cmV0dXJuIHZlcmlmeVJlc3VsdHMuaXNTdGF0ZW1lbnQodGhpcykgPyBuZXcgWWllbGRFeHByZXNzaW9uKGNhbGwpIDogY2FsbFxuXHR9LFxuXG5cdEZvckJhZygpIHtcblx0XHRjb25zdCBsb29wID0gbWF5YmVMYWJlbExvb3AodGhpcywgZm9yTG9vcCh0aGlzLm9wSXRlcmF0ZWUsIHRoaXMuYmxvY2spKVxuXHRcdHJldHVybiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFtEZWNsYXJlQnVpbHRCYWcsIGxvb3AsIFJldHVybkJ1aWx0XSkpXG5cdH0sXG5cblx0Ly8gbGVhZFN0YXRlbWVudHMgY29tZXMgZnJvbSBjb25zdHJ1Y3RvciBtZW1iZXJzXG5cdC8vIGRvbnREZWNsYXJlVGhpczogYXBwbGllcyBpZiB0aGlzIGlzIHRoZSBmdW4gZm9yIGEgQ29uc3RydWN0b3IsXG5cdC8vIHdoaWNoIG1heSBkZWNsYXJlIGB0aGlzYCBhdCBhIGBzdXBlcmAgY2FsbC5cblx0RnVuKGxlYWRTdGF0ZW1lbnRzID0gbnVsbCwgZG9udERlY2xhcmVUaGlzID0gZmFsc2UpIHtcblx0XHRyZXR1cm4gd2l0aEZ1bktpbmQodGhpcy5raW5kLCAoKSA9PiB7XG5cdFx0XHQvLyBUT0RPOkVTNiB1c2UgYC4uLmBmXG5cdFx0XHRjb25zdCBuQXJncyA9IG5ldyBMaXRlcmFsKHRoaXMuYXJncy5sZW5ndGgpXG5cdFx0XHRjb25zdCBvcERlY2xhcmVSZXN0ID0gb3BNYXAodGhpcy5vcFJlc3RBcmcsIHJlc3QgPT5cblx0XHRcdFx0ZGVjbGFyZShyZXN0LCBuZXcgQ2FsbEV4cHJlc3Npb24oQXJyYXlTbGljZUNhbGwsIFtJZEFyZ3VtZW50cywgbkFyZ3NdKSkpXG5cdFx0XHRjb25zdCBhcmdDaGVja3MgPSBvcElmKG9wdGlvbnMuaW5jbHVkZUNoZWNrcygpLCAoKSA9PlxuXHRcdFx0XHRmbGF0T3BNYXAodGhpcy5hcmdzLCBvcFR5cGVDaGVja0ZvckxvY2FsRGVjbGFyZSkpXG5cblx0XHRcdGNvbnN0IG9wRGVjbGFyZVRoaXMgPSBvcElmKHRoaXMub3BEZWNsYXJlVGhpcyAhPT0gbnVsbCAmJiAhZG9udERlY2xhcmVUaGlzLCAoKSA9PlxuXHRcdFx0XHREZWNsYXJlTGV4aWNhbFRoaXMpXG5cblx0XHRcdGNvbnN0IGxlYWQgPSBjYXQob3BEZWNsYXJlUmVzdCwgb3BEZWNsYXJlVGhpcywgYXJnQ2hlY2tzLCBsZWFkU3RhdGVtZW50cylcblxuXHRcdFx0Y29uc3QgYm9keSA9ICgpID0+IHQyKHRoaXMuYmxvY2ssIGxlYWQsIHRoaXMub3BSZXR1cm5UeXBlKVxuXHRcdFx0Y29uc3QgYXJncyA9IHRoaXMuYXJncy5tYXAodDApXG5cdFx0XHRjb25zdCBpZCA9IG9wTWFwKHZlcmlmeVJlc3VsdHMub3BOYW1lKHRoaXMpLCBpZGVudGlmaWVyKVxuXG5cdFx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0XHRjYXNlIEZ1bnMuUGxhaW46XG5cdFx0XHRcdFx0Ly8gVE9ETzpFUzYgU2hvdWxkIGJlIGFibGUgdG8gdXNlIHJlc3QgYXJncyBpbiBhcnJvdyBmdW5jdGlvblxuXHRcdFx0XHRcdHJldHVybiBpZCA9PT0gbnVsbCAmJiB0aGlzLm9wRGVjbGFyZVRoaXMgPT09IG51bGwgJiYgb3BEZWNsYXJlUmVzdCA9PT0gbnVsbCA/XG5cdFx0XHRcdFx0XHRuZXcgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24oYXJncywgYm9keSgpKSA6XG5cdFx0XHRcdFx0XHRuZXcgRnVuY3Rpb25FeHByZXNzaW9uKGlkLCBhcmdzLCBib2R5KCkpXG5cdFx0XHRcdGNhc2UgRnVucy5Bc3luYzoge1xuXHRcdFx0XHRcdGNvbnN0IHBsYWluQm9keSA9IHQyKHRoaXMuYmxvY2ssIG51bGwsIHRoaXMub3BSZXR1cm5UeXBlKVxuXHRcdFx0XHRcdGNvbnN0IGdlbkZ1bmMgPSBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFtdLCBwbGFpbkJvZHksIHRydWUpXG5cdFx0XHRcdFx0Y29uc3QgcmV0ID0gbmV3IFJldHVyblN0YXRlbWVudChtc0NhbGwoJ2FzeW5jJywgZ2VuRnVuYykpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBGdW5jdGlvbkV4cHJlc3Npb24oaWQsIGFyZ3MsIG5ldyBCbG9ja1N0YXRlbWVudChjYXQobGVhZCwgcmV0KSkpXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBGdW5zLkdlbmVyYXRvcjpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihpZCwgYXJncywgYm9keSgpLCB0cnVlKVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcih0aGlzLmtpbmQpXG5cdFx0XHR9XG5cdFx0fSlcblx0fSxcblxuXHRHZXR0ZXJGdW4oKSB7XG5cdFx0Ly8gXyA9PiBfLmZvb1xuXHRcdHJldHVybiBmb2N1c0Z1bihtZW1iZXJTdHJpbmdPclZhbChJZEZvY3VzLCB0aGlzLm5hbWUpKVxuXHR9LFxuXG5cdElnbm9yZSgpIHtcblx0XHRyZXR1cm4gW11cblx0fSxcblxuXHRJbnN0YW5jZU9mKCkge1xuXHRcdC8vIFRPRE86RVM2IG5ldyBCaW5hcnlFeHByZXNzaW9uKCdpbnN0YW5jZW9mJywgdDAodGhpcy5pbnN0YW5jZSksIHQwKHRoaXMudHlwZSkpXG5cdFx0cmV0dXJuIG1zQ2FsbCgnaGFzSW5zdGFuY2UnLCB0MCh0aGlzLnR5cGUpLCB0MCh0aGlzLmluc3RhbmNlKSlcblx0fSxcblxuXHRLaW5kKCkge1xuXHRcdGNvbnN0IG5hbWUgPSBuZXcgTGl0ZXJhbCh2ZXJpZnlSZXN1bHRzLm5hbWUodGhpcykpXG5cdFx0Y29uc3Qgc3VwZXJzID0gbmV3IEFycmF5RXhwcmVzc2lvbih0aGlzLnN1cGVyS2luZHMubWFwKHQwKSlcblx0XHRjb25zdCBtZXRob2RzID0gXyA9PlxuXHRcdFx0bmV3IE9iamVjdEV4cHJlc3Npb24oXy5tYXAodHJhbnNwaWxlTWV0aG9kVG9Qcm9wZXJ0eSkpXG5cdFx0Y29uc3Qga2luZCA9IG1zQ2FsbCgna2luZCcsIG5hbWUsIHN1cGVycywgbWV0aG9kcyh0aGlzLnN0YXRpY3MpLCBtZXRob2RzKHRoaXMubWV0aG9kcykpXG5cblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BEbyxcblx0XHRcdF8gPT4gYmxvY2tXcmFwKHQzKF8uYmxvY2ssIHBsYWluTGV0KElkRm9jdXMsIGtpbmQpLCBudWxsLCBSZXR1cm5Gb2N1cykpLFxuXHRcdFx0KCkgPT4ga2luZClcblx0fSxcblxuXHRMYXp5KCkge1xuXHRcdHJldHVybiBsYXp5V3JhcCh0MCh0aGlzLnZhbHVlKSlcblx0fSxcblxuXHROdW1iZXJMaXRlcmFsKCkge1xuXHRcdC8vIE5lZ2F0aXZlIG51bWJlcnMgYXJlIG5vdCBwYXJ0IG9mIEVTIHNwZWMuXG5cdFx0Ly8gaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzUuMS8jc2VjLTcuOC4zXG5cdFx0Y29uc3QgdmFsdWUgPSBOdW1iZXIodGhpcy52YWx1ZSlcblx0XHRjb25zdCBsaXQgPSBuZXcgTGl0ZXJhbChNYXRoLmFicyh2YWx1ZSkpXG5cdFx0Y29uc3QgaXNQb3NpdGl2ZSA9IHZhbHVlID49IDAgJiYgMSAvIHZhbHVlICE9PSAtSW5maW5pdHlcblx0XHRyZXR1cm4gaXNQb3NpdGl2ZSA/IGxpdCA6IG5ldyBVbmFyeUV4cHJlc3Npb24oJy0nLCBsaXQpXG5cdH0sXG5cblx0TG9jYWxBY2Nlc3MoKSB7XG5cdFx0aWYgKHRoaXMubmFtZSA9PT0gJ3RoaXMnKVxuXHRcdFx0cmV0dXJuIElkTGV4aWNhbFRoaXNcblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IGxkID0gdmVyaWZ5UmVzdWx0cy5sb2NhbERlY2xhcmVGb3JBY2Nlc3ModGhpcylcblx0XHRcdC8vIElmIGxkIG1pc3NpbmcsIHRoaXMgaXMgYSBidWlsdGluLCBhbmQgYnVpbHRpbnMgYXJlIG5ldmVyIGxhenlcblx0XHRcdHJldHVybiBsZCA9PT0gdW5kZWZpbmVkID8gaWRlbnRpZmllcih0aGlzLm5hbWUpIDogYWNjZXNzTG9jYWxEZWNsYXJlKGxkKVxuXHRcdH1cblx0fSxcblxuXHRMb2NhbERlY2xhcmUoKSB7XG5cdFx0cmV0dXJuIG5ldyBJZGVudGlmaWVyKGlkRm9yRGVjbGFyZUNhY2hlZCh0aGlzKS5uYW1lKVxuXHR9LFxuXG5cdExvY2FsTXV0YXRlKCkge1xuXHRcdHJldHVybiBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBpZGVudGlmaWVyKHRoaXMubmFtZSksIHQwKHRoaXMudmFsdWUpKVxuXHR9LFxuXG5cdExvZ2ljKCkge1xuXHRcdGNvbnN0IG9wID0gdGhpcy5raW5kID09PSBMb2dpY3MuQW5kID8gJyYmJyA6ICd8fCdcblx0XHRyZXR1cm4gdGFpbCh0aGlzLmFyZ3MpLnJlZHVjZShcblx0XHRcdChhLCBiKSA9PiBuZXcgTG9naWNhbEV4cHJlc3Npb24ob3AsIGEsIHQwKGIpKSxcblx0XHRcdHQwKHRoaXMuYXJnc1swXSkpXG5cdH0sXG5cblx0TWFwRW50cnkoKSB7XG5cdFx0cmV0dXJuIG1zQ2FsbCgnc2V0U3ViJywgSWRCdWlsdCwgdDAodGhpcy5rZXkpLCB0MCh0aGlzLnZhbCkpXG5cdH0sXG5cblx0TWVtYmVyKCkge1xuXHRcdHJldHVybiBtZW1iZXJTdHJpbmdPclZhbCh0MCh0aGlzLm9iamVjdCksIHRoaXMubmFtZSlcblx0fSxcblxuXHRNZW1iZXJGdW4oKSB7XG5cdFx0Y29uc3QgbmFtZSA9IHRyYW5zcGlsZU5hbWUodGhpcy5uYW1lKVxuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcE9iamVjdCxcblx0XHRcdF8gPT4gbXNDYWxsKCdtZXRob2RCb3VuZCcsIHQwKF8pLCBuYW1lKSxcblx0XHRcdCgpID0+IG1zQ2FsbCgnbWV0aG9kVW5ib3VuZCcsIG5hbWUpKVxuXHR9LFxuXG5cdE1lbWJlclNldCgpIHtcblx0XHRjb25zdCBvYmogPSB0MCh0aGlzLm9iamVjdClcblx0XHRjb25zdCB2YWwgPSBtYXliZVdyYXBJbkNoZWNrSW5zdGFuY2UodDAodGhpcy52YWx1ZSksIHRoaXMub3BUeXBlLCB0aGlzLm5hbWUpXG5cdFx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRcdGNhc2UgU2V0dGVycy5Jbml0OlxuXHRcdFx0XHRyZXR1cm4gbXNDYWxsKCduZXdQcm9wZXJ0eScsIG9iaiwgdHJhbnNwaWxlTmFtZSh0aGlzLm5hbWUpLCB2YWwpXG5cdFx0XHRjYXNlIFNldHRlcnMuTXV0YXRlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgbWVtYmVyU3RyaW5nT3JWYWwob2JqLCB0aGlzLm5hbWUpLCB2YWwpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdH1cblx0fSxcblxuXHRNZXRob2QoKSB7XG5cdFx0Y29uc3QgbmFtZSA9IG5ldyBMaXRlcmFsKHZlcmlmeVJlc3VsdHMubmFtZSh0aGlzKSlcblxuXHRcdGNvbnN0IGFyZ3MgPSB0aGlzLmZ1bi5vcFJlc3RBcmcgPT09IG51bGwgP1xuXHRcdFx0bmV3IEFycmF5RXhwcmVzc2lvbih0aGlzLmZ1bi5hcmdzLm1hcChhcmcgPT4ge1xuXHRcdFx0XHRjb25zdCBuYW1lID0gbmV3IExpdGVyYWwoYXJnLm5hbWUpXG5cdFx0XHRcdGNvbnN0IG9wVHlwZSA9IG9wTWFwKGFyZy5vcFR5cGUsIHQwKVxuXHRcdFx0XHRyZXR1cm4gaWZFbHNlKG9wVHlwZSxcblx0XHRcdFx0XHRfID0+IG5ldyBBcnJheUV4cHJlc3Npb24oW25hbWUsIF9dKSxcblx0XHRcdFx0XHQoKSA9PiBuYW1lKVxuXHRcdFx0fSkpIDpcblx0XHRcdG5ldyBVbmFyeUV4cHJlc3Npb24oJ3ZvaWQnLCBuZXcgTGl0ZXJhbCgwKSlcblx0XHRjb25zdCBpbXBsID0gdGhpcy5mdW4gaW5zdGFuY2VvZiBGdW4gPyBbdDAodGhpcy5mdW4pXSA6IFtdXG5cdFx0cmV0dXJuIG1zQ2FsbCgnbWV0aG9kJywgbmFtZSwgYXJncywgLi4uaW1wbClcblx0fSxcblxuXHRNb2R1bGU6IHRyYW5zcGlsZU1vZHVsZSxcblxuXHRNc1JlZ0V4cCgpIHtcblx0XHRyZXR1cm4gdGhpcy5wYXJ0cy5sZW5ndGggPT09IDAgP1xuXHRcdFx0bmV3IExpdGVyYWwobmV3IFJlZ0V4cCgnJywgdGhpcy5mbGFncykpIDpcblx0XHRcdHRoaXMucGFydHMubGVuZ3RoID09PSAxICYmIHR5cGVvZiB0aGlzLnBhcnRzWzBdID09PSAnc3RyaW5nJyA/XG5cdFx0XHRuZXcgTGl0ZXJhbChuZXcgUmVnRXhwKHRoaXMucGFydHNbMF0ucmVwbGFjZSgnXFxuJywgJ1xcXFxuJyksIHRoaXMuZmxhZ3MpKSA6XG5cdFx0XHRtc0NhbGwoJ3JlZ2V4cCcsXG5cdFx0XHRcdG5ldyBBcnJheUV4cHJlc3Npb24odGhpcy5wYXJ0cy5tYXAodHJhbnNwaWxlTmFtZSkpLCBuZXcgTGl0ZXJhbCh0aGlzLmZsYWdzKSlcblx0fSxcblxuXHROZXcoKSB7XG5cdFx0cmV0dXJuIG5ldyBOZXdFeHByZXNzaW9uKHQwKHRoaXMudHlwZSksIHRoaXMuYXJncy5tYXAodDApKVxuXHR9LFxuXG5cdE5vdCgpIHtcblx0XHRyZXR1cm4gbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIHQwKHRoaXMuYXJnKSlcblx0fSxcblxuXHRPYmpFbnRyeUFzc2lnbigpIHtcblx0XHRpZiAodGhpcy5hc3NpZ24gaW5zdGFuY2VvZiBBc3NpZ25TaW5nbGUgJiYgIXRoaXMuYXNzaWduLmFzc2lnbmVlLmlzTGF6eSgpKSB7XG5cdFx0XHRjb25zdCBuYW1lID0gdGhpcy5hc3NpZ24uYXNzaWduZWUubmFtZVxuXHRcdFx0cmV0dXJuIHQxKHRoaXMuYXNzaWduLCB2YWwgPT5cblx0XHRcdFx0dmVyaWZ5UmVzdWx0cy5pc09iakVudHJ5RXhwb3J0KHRoaXMpID9cblx0XHRcdFx0XHRleHBvcnROYW1lZE9yRGVmYXVsdCh2YWwsIG5hbWUpIDpcblx0XHRcdFx0XHRuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBtZW1iZXIoSWRCdWlsdCwgbmFtZSksIHZhbCkpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IGFzc2lnbnMgPSB0aGlzLmFzc2lnbi5hbGxBc3NpZ25lZXMoKS5tYXAoXyA9PlxuXHRcdFx0XHRtc0NhbGwoJ3NldExhenknLCBJZEJ1aWx0LCBuZXcgTGl0ZXJhbChfLm5hbWUpLCBpZEZvckRlY2xhcmVDYWNoZWQoXykpKVxuXHRcdFx0cmV0dXJuIGNhdCh0MCh0aGlzLmFzc2lnbiksIGFzc2lnbnMpXG5cdFx0fVxuXHR9LFxuXG5cdE9iakVudHJ5UGxhaW4oKSB7XG5cdFx0Y29uc3QgdmFsID0gdDAodGhpcy52YWx1ZSlcblx0XHRyZXR1cm4gdmVyaWZ5UmVzdWx0cy5pc09iakVudHJ5RXhwb3J0KHRoaXMpID9cblx0XHRcdC8vIFdlJ3ZlIHZlcmlmaWVkIHRoYXQgZm9yIG1vZHVsZSBleHBvcnQsIHRoaXMubmFtZSBtdXN0IGJlIGEgc3RyaW5nLlxuXHRcdFx0ZXhwb3J0TmFtZWRPckRlZmF1bHQodmFsLCB0aGlzLm5hbWUpIDpcblx0XHRcdG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIG1lbWJlclN0cmluZ09yVmFsKElkQnVpbHQsIHRoaXMubmFtZSksIHZhbClcblx0fSxcblxuXHRPYmpTaW1wbGUoKSB7XG5cdFx0cmV0dXJuIG5ldyBPYmplY3RFeHByZXNzaW9uKHRoaXMucGFpcnMubWFwKHBhaXIgPT5cblx0XHRcdG5ldyBQcm9wZXJ0eSgnaW5pdCcsIHByb3BlcnR5SWRPckxpdGVyYWwocGFpci5rZXkpLCB0MChwYWlyLnZhbHVlKSkpKVxuXHR9LFxuXG5cdFBhc3MoKSB7XG5cdFx0cmV0dXJuIHQwKHRoaXMuaWdub3JlZClcblx0fSxcblxuXHRQaXBlKCkge1xuXHRcdHJldHVybiB0aGlzLnBpcGVzLnJlZHVjZSgoZXhwciwgcGlwZSkgPT4gY2FsbEZvY3VzRnVuKHQwKHBpcGUpLCBleHByKSwgdDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0UXVvdGVQbGFpbigpIHtcblx0XHRpZiAoaXNFbXB0eSh0aGlzLnBhcnRzKSlcblx0XHRcdHJldHVybiBMaXRFbXB0eVN0cmluZ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgcXVhc2lzID0gW10sIGV4cHJlc3Npb25zID0gW11cblxuXHRcdFx0Ly8gVGVtcGxhdGVMaXRlcmFsIG11c3Qgc3RhcnQgd2l0aCBhIFRlbXBsYXRlRWxlbWVudFxuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLnBhcnRzWzBdICE9PSAnc3RyaW5nJylcblx0XHRcdFx0cXVhc2lzLnB1c2goVGVtcGxhdGVFbGVtZW50LmVtcHR5KVxuXG5cdFx0XHRmb3IgKGNvbnN0IHBhcnQgb2YgdGhpcy5wYXJ0cylcblx0XHRcdFx0aWYgKHR5cGVvZiBwYXJ0ID09PSAnc3RyaW5nJylcblx0XHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZm9yUmF3U3RyaW5nKHBhcnQpKVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHQvLyBcInsxfXsxfVwiIG5lZWRzIGFuIGVtcHR5IHF1YXNpIGluIHRoZSBtaWRkbGUgKGFuZCBvbiB0aGUgZW5kcykuXG5cdFx0XHRcdFx0Ly8gVGhlcmUgYXJlIG5ldmVyIG1vcmUgdGhhbiAyIHN0cmluZyBwYXJ0cyBpbiBhIHJvdyxcblx0XHRcdFx0XHQvLyBzbyBxdWFzaXMubGVuZ3RoID09PSBleHByZXNzaW9ucy5sZW5ndGggb3IgaXMgZXhhY3RseSAxIG1vcmUuXG5cdFx0XHRcdFx0aWYgKHF1YXNpcy5sZW5ndGggPT09IGV4cHJlc3Npb25zLmxlbmd0aClcblx0XHRcdFx0XHRcdHF1YXNpcy5wdXNoKFRlbXBsYXRlRWxlbWVudC5lbXB0eSlcblx0XHRcdFx0XHRleHByZXNzaW9ucy5wdXNoKHQwKHBhcnQpKVxuXHRcdFx0XHR9XG5cblx0XHRcdC8vIFRlbXBsYXRlTGl0ZXJhbCBtdXN0IGVuZCB3aXRoIGEgVGVtcGxhdGVFbGVtZW50LCBzbyBvbmUgbW9yZSBxdWFzaSB0aGFuIGV4cHJlc3Npb24uXG5cdFx0XHRpZiAocXVhc2lzLmxlbmd0aCA9PT0gZXhwcmVzc2lvbnMubGVuZ3RoKVxuXHRcdFx0XHRxdWFzaXMucHVzaChUZW1wbGF0ZUVsZW1lbnQuZW1wdHkpXG5cblx0XHRcdHJldHVybiBuZXcgVGVtcGxhdGVMaXRlcmFsKHF1YXNpcywgZXhwcmVzc2lvbnMpXG5cdFx0fVxuXHR9LFxuXG5cdFF1b3RlU2ltcGxlKCkge1xuXHRcdHJldHVybiBuZXcgTGl0ZXJhbCh0aGlzLm5hbWUpXG5cdH0sXG5cblx0UXVvdGVUYWdnZWRUZW1wbGF0ZSgpIHtcblx0XHRyZXR1cm4gbmV3IFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbih0MCh0aGlzLnRhZyksIHQwKHRoaXMucXVvdGUpKVxuXHR9LFxuXG5cdFJhbmdlKCkge1xuXHRcdGNvbnN0IGVuZCA9IGlmRWxzZSh0aGlzLmVuZCwgdDAsICgpID0+IEdsb2JhbEluZmluaXR5KVxuXHRcdHJldHVybiBtc0NhbGwoJ3JhbmdlJywgdDAodGhpcy5zdGFydCksIGVuZCwgbmV3IExpdGVyYWwodGhpcy5pc0V4Y2x1c2l2ZSkpXG5cdH0sXG5cblx0U2V0U3ViKCkge1xuXHRcdGNvbnN0IGdldEtpbmQgPSAoKSA9PiB7XG5cdFx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0XHRjYXNlIFNldHRlcnMuSW5pdDpcblx0XHRcdFx0XHRyZXR1cm4gJ2luaXQnXG5cdFx0XHRcdGNhc2UgU2V0dGVycy5NdXRhdGU6XG5cdFx0XHRcdFx0cmV0dXJuICdtdXRhdGUnXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdH1cblx0XHR9XG5cdFx0Y29uc3Qga2luZCA9IGdldEtpbmQoKVxuXHRcdHJldHVybiBtc0NhbGwoXG5cdFx0XHQnc2V0U3ViJyxcblx0XHRcdHQwKHRoaXMub2JqZWN0KSxcblx0XHRcdHRoaXMuc3ViYmVkcy5sZW5ndGggPT09IDEgPyB0MCh0aGlzLnN1YmJlZHNbMF0pIDogdGhpcy5zdWJiZWRzLm1hcCh0MCksXG5cdFx0XHRtYXliZVdyYXBJbkNoZWNrSW5zdGFuY2UodDAodGhpcy52YWx1ZSksIHRoaXMub3BUeXBlLCAndmFsdWUnKSxcblx0XHRcdG5ldyBMaXRlcmFsKGtpbmQpKVxuXHR9LFxuXG5cdFNpbXBsZUZ1bigpIHtcblx0XHRyZXR1cm4gZm9jdXNGdW4odDAodGhpcy52YWx1ZSkpXG5cdH0sXG5cblx0U3BlY2lhbERvKCkge1xuXHRcdHN3aXRjaCAodGhpcy5raW5kKSB7XG5cdFx0XHRjYXNlIFNwZWNpYWxEb3MuRGVidWdnZXI6IHJldHVybiBuZXcgRGVidWdnZXJTdGF0ZW1lbnQoKVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHR9XG5cdH0sXG5cblx0U3BlY2lhbFZhbCgpIHtcblx0XHQvLyBNYWtlIG5ldyBvYmplY3RzIGJlY2F1c2Ugd2Ugd2lsbCBhc3NpZ24gYGxvY2AgdG8gdGhlbS5cblx0XHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5GYWxzZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKGZhbHNlKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5OYW1lOlxuXHRcdFx0XHRyZXR1cm4gbmV3IExpdGVyYWwodmVyaWZ5UmVzdWx0cy5uYW1lKHRoaXMpKVxuXHRcdFx0Y2FzZSBTcGVjaWFsVmFscy5OdWxsOlxuXHRcdFx0XHRyZXR1cm4gbmV3IExpdGVyYWwobnVsbClcblx0XHRcdGNhc2UgU3BlY2lhbFZhbHMuVHJ1ZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKHRydWUpXG5cdFx0XHRjYXNlIFNwZWNpYWxWYWxzLlVuZGVmaW5lZDpcblx0XHRcdFx0cmV0dXJuIG5ldyBVbmFyeUV4cHJlc3Npb24oJ3ZvaWQnLCBMaXRaZXJvKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKHRoaXMua2luZClcblx0XHR9XG5cdH0sXG5cblx0U3ByZWFkKCkge1xuXHRcdHJldHVybiBuZXcgU3ByZWFkRWxlbWVudCh0MCh0aGlzLnNwcmVhZGVkKSlcblx0fSxcblxuXHRTdWIoKSB7XG5cdFx0cmV0dXJuIG1zQ2FsbCgnc3ViJywgdDAodGhpcy5zdWJiZWQpLCAuLi50aGlzLmFyZ3MubWFwKHQwKSlcblx0fSxcblxuXHRTdXBlckNhbGwoKSB7XG5cdFx0Y29uc3QgYXJncyA9IHRoaXMuYXJncy5tYXAodDApXG5cdFx0Y29uc3QgbWV0aG9kID0gdmVyaWZ5UmVzdWx0cy5zdXBlckNhbGxUb01ldGhvZC5nZXQodGhpcylcblxuXHRcdGlmIChtZXRob2QgaW5zdGFuY2VvZiBDb25zdHJ1Y3Rvcikge1xuXHRcdFx0Ly8gc3VwZXIgbXVzdCBhcHBlYXIgYXMgYSBzdGF0ZW1lbnQsIHNvIE9LIHRvIGRlY2FscmUgYHRoaXNgXG5cdFx0XHRjb25zdCBjYWxsID0gbmV3IENhbGxFeHByZXNzaW9uKElkU3VwZXIsIGFyZ3MpXG5cdFx0XHRjb25zdCBtZW1iZXJTZXRzID0gY29uc3RydWN0b3JTZXRNZW1iZXJzKG1ldGhvZClcblx0XHRcdHJldHVybiBjYXQoY2FsbCwgbWVtYmVyU2V0cywgU2V0TGV4aWNhbFRoaXMpXG5cdFx0fSBlbHNlXG5cdFx0XHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKG1lbWJlclN0cmluZ09yVmFsKElkU3VwZXIsIG1ldGhvZC5zeW1ib2wpLCBhcmdzKVxuXHR9LFxuXG5cdFN1cGVyTWVtYmVyKCkge1xuXHRcdHJldHVybiBtZW1iZXJTdHJpbmdPclZhbChJZFN1cGVyLCB0aGlzLm5hbWUpXG5cdH0sXG5cblx0U3dpdGNoKCkge1xuXHRcdGNvbnN0IHBhcnRzID0gZmxhdE1hcCh0aGlzLnBhcnRzLCB0MClcblx0XHRwYXJ0cy5wdXNoKGlmRWxzZSh0aGlzLm9wRWxzZSxcblx0XHRcdF8gPT4gbmV3IFN3aXRjaENhc2UodW5kZWZpbmVkLCB0MChfKS5ib2R5KSxcblx0XHRcdCgpID0+IFN3aXRjaENhc2VOb01hdGNoKSlcblx0XHRyZXR1cm4gYmxvY2tXcmFwSWZWYWwodGhpcywgbmV3IFN3aXRjaFN0YXRlbWVudCh0MCh0aGlzLnN3aXRjaGVkKSwgcGFydHMpKVxuXHR9LFxuXG5cdFN3aXRjaFBhcnQoKSB7XG5cdFx0Y29uc3QgZm9sbG93ID0gb3BJZih2ZXJpZnlSZXN1bHRzLmlzU3RhdGVtZW50KHRoaXMpLCAoKSA9PiBuZXcgQnJlYWtTdGF0ZW1lbnQpXG5cdFx0Lypcblx0XHRXZSBjb3VsZCBqdXN0IHBhc3MgYmxvY2suYm9keSBmb3IgdGhlIHN3aXRjaCBsaW5lcywgYnV0IGluc3RlYWRcblx0XHRlbmNsb3NlIHRoZSBib2R5IG9mIHRoZSBzd2l0Y2ggY2FzZSBpbiBjdXJseSBicmFjZXMgdG8gZW5zdXJlIGEgbmV3IHNjb3BlLlxuXHRcdFRoYXQgd2F5IHRoaXMgY29kZSB3b3Jrczpcblx0XHRcdHN3aXRjaCAoMCkge1xuXHRcdFx0XHRjYXNlIDA6IHtcblx0XHRcdFx0XHRjb25zdCBhID0gMFxuXHRcdFx0XHRcdHJldHVybiBhXG5cdFx0XHRcdH1cblx0XHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHRcdC8vIFdpdGhvdXQgY3VybHkgYnJhY2VzIHRoaXMgd291bGQgY29uZmxpY3Qgd2l0aCB0aGUgb3RoZXIgYGFgLlxuXHRcdFx0XHRcdGNvbnN0IGEgPSAxXG5cdFx0XHRcdFx0YVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0Ki9cblx0XHRjb25zdCBibG9jayA9IHQzKHRoaXMucmVzdWx0LCBudWxsLCBudWxsLCBmb2xsb3cpXG5cdFx0Ly8gSWYgc3dpdGNoIGhhcyBtdWx0aXBsZSB2YWx1ZXMsIGJ1aWxkIHVwIGEgc3RhdGVtZW50IGxpa2U6IGBjYXNlIDE6IGNhc2UgMjogeyBkb0Jsb2NrKCkgfWBcblx0XHRjb25zdCB4ID0gW11cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudmFsdWVzLmxlbmd0aCAtIDE7IGkgPSBpICsgMSlcblx0XHRcdC8vIFRoZXNlIGNhc2VzIGZhbGx0aHJvdWdoIHRvIHRoZSBvbmUgYXQgdGhlIGVuZC5cblx0XHRcdHgucHVzaChuZXcgU3dpdGNoQ2FzZSh0MCh0aGlzLnZhbHVlc1tpXSksIFtdKSlcblx0XHR4LnB1c2gobmV3IFN3aXRjaENhc2UodDAodGhpcy52YWx1ZXNbdGhpcy52YWx1ZXMubGVuZ3RoIC0gMV0pLCBbYmxvY2tdKSlcblx0XHRyZXR1cm4geFxuXHR9LFxuXG5cdFRocm93KCkge1xuXHRcdHJldHVybiBpZkVsc2UodGhpcy5vcFRocm93bixcblx0XHRcdF8gPT4gZG9UaHJvdyhfKSxcblx0XHRcdCgpID0+IG5ldyBUaHJvd1N0YXRlbWVudChuZXcgTmV3RXhwcmVzc2lvbihHbG9iYWxFcnJvciwgW0xpdFN0clRocm93XSkpKVxuXHR9LFxuXG5cdFdpdGgoKSB7XG5cdFx0Y29uc3QgaWREZWNsYXJlID0gaWRGb3JEZWNsYXJlQ2FjaGVkKHRoaXMuZGVjbGFyZSlcblx0XHRjb25zdCB2YWwgPSB0MCh0aGlzLnZhbHVlKVxuXHRcdGNvbnN0IGxlYWQgPSBwbGFpbkxldChpZERlY2xhcmUsIHZhbClcblx0XHRyZXR1cm4gdmVyaWZ5UmVzdWx0cy5pc1N0YXRlbWVudCh0aGlzKSA/XG5cdFx0XHR0MSh0aGlzLmJsb2NrLCBsZWFkKSA6XG5cdFx0XHRibG9ja1dyYXAodDModGhpcy5ibG9jaywgbGVhZCwgbnVsbCwgbmV3IFJldHVyblN0YXRlbWVudChpZERlY2xhcmUpKSlcblx0fSxcblxuXHRZaWVsZCgpIHtcblx0XHRyZXR1cm4gbmV3IFlpZWxkRXhwcmVzc2lvbihvcE1hcCh0aGlzLm9wVmFsdWUsIHQwKSwgZmFsc2UpXG5cdH0sXG5cblx0WWllbGRUbygpIHtcblx0XHRyZXR1cm4gbmV3IFlpZWxkRXhwcmVzc2lvbih0MCh0aGlzLnZhbHVlKSwgdHJ1ZSlcblx0fVxufSlcblxuLy8gRnVuY3Rpb25zIHNwZWNpZmljIHRvIGNlcnRhaW4gZXhwcmVzc2lvbnNcblxuZnVuY3Rpb24gY2FzZUJvZHkocGFydHMsIG9wRWxzZSkge1xuXHRsZXQgYWNjID0gaWZFbHNlKG9wRWxzZSwgdDAsICgpID0+IFRocm93Tm9DYXNlTWF0Y2gpXG5cdGZvciAobGV0IGkgPSBwYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGkgPSBpIC0gMSlcblx0XHRhY2MgPSB0MShwYXJ0c1tpXSwgYWNjKVxuXHRyZXR1cm4gYWNjXG59XG5cbmZ1bmN0aW9uIGZvckxvb3Aob3BJdGVyYXRlZSwgYmxvY2spIHtcblx0Y29uc3QganNCbG9jayA9IHQwKGJsb2NrKVxuXHRyZXR1cm4gaWZFbHNlKG9wSXRlcmF0ZWUsXG5cdFx0KHtlbGVtZW50LCBiYWd9KSA9PlxuXHRcdFx0bmV3IEZvck9mU3RhdGVtZW50KFxuXHRcdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignbGV0JywgW25ldyBWYXJpYWJsZURlY2xhcmF0b3IodDAoZWxlbWVudCkpXSksXG5cdFx0XHRcdHQwKGJhZyksXG5cdFx0XHRcdGpzQmxvY2spLFxuXHRcdCgpID0+IG5ldyBGb3JTdGF0ZW1lbnQobnVsbCwgbnVsbCwgbnVsbCwganNCbG9jaykpXG59XG5cbmZ1bmN0aW9uIG1heWJlTGFiZWxMb29wKGFzdCwgbG9vcCkge1xuXHRyZXR1cm4gdmVyaWZ5UmVzdWx0cy5sb29wTmVlZHNMYWJlbChhc3QpID8gbmV3IExhYmVsZWRTdGF0ZW1lbnQoSWRMb29wLCBsb29wKSA6IGxvb3Bcbn1cblxuZnVuY3Rpb24gdHJhbnNwaWxlQmxvY2tSZXR1cm4ocmV0dXJuZWQsIGxpbmVzLCBsZWFkLCBvcFJldHVyblR5cGUpIHtcblx0Y29uc3QgcmV0ID0gbmV3IFJldHVyblN0YXRlbWVudChcblx0XHRtYXliZVdyYXBJbkNoZWNrSW5zdGFuY2UocmV0dXJuZWQsIG9wUmV0dXJuVHlwZSwgJ3JldHVybmVkIHZhbHVlJykpXG5cdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIGxpbmVzLCByZXQpKVxufVxuIl19
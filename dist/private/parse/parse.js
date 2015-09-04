if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', 'esast/dist/Loc', '../../CompileError', '../MsAst', '../Token', '../util', './Slice'], function (exports, module, _esastDistLoc, _CompileError, _MsAst, _Token, _util, _Slice) {
	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _Loc = _interopRequireDefault(_esastDistLoc);

	var _Slice2 = _interopRequireDefault(_Slice);

	// Since there are so many parsing functions,
	// it's faster (as of node v0.11.14) to have them all close over this mutable variable once
	// than to close over the parameter (as in lex.js, where that's much faster).
	let context;

	/*
 This converts a Token tree to a MsAst.
 This is a recursive-descent parser, made easier by two facts:
 	* We have already grouped tokens.
 	* Most of the time, an ast's type is determined by the first token.
 
 There are exceptions such as assignment statements (indicated by a `=` somewhere in the middle).
 For those we must iterate through tokens and split.
 (See Slice.opSplitOnceWhere and Slice.opSplitManyWhere.)
 */

	module.exports = (_context, rootToken) => {
		context = _context;
		(0, _util.assert)((0, _Token.isGroup)(_Token.G_Block, rootToken));
		const msAst = parseModule(_Slice2.default.group(rootToken));
		// Release for garbage collections.
		context = undefined;
		return msAst;
	};

	const checkEmpty = (tokens, message) => context.check(tokens.isEmpty(), tokens.loc, message),
	      checkNonEmpty = (tokens, message) => context.check(!tokens.isEmpty(), tokens.loc, message),
	      unexpected = token => context.fail(token.loc, `Unexpected ${ token }`);

	const parseModule = tokens => {
		// Use statements must appear in order.

		var _tryParseUses = tryParseUses(_Token.KW_UseDo, tokens);

		const doUses = _tryParseUses.uses;
		const rest0 = _tryParseUses.rest;

		var _tryParseUses2 = tryParseUses(_Token.KW_Use, rest0);

		const plainUses = _tryParseUses2.uses;
		const opUseGlobal = _tryParseUses2.opUseGlobal;
		const rest1 = _tryParseUses2.rest;

		var _tryParseUses3 = tryParseUses(_Token.KW_UseLazy, rest1);

		const lazyUses = _tryParseUses3.uses;
		const rest2 = _tryParseUses3.rest;

		var _tryParseUses4 = tryParseUses(_Token.KW_UseDebug, rest2);

		const debugUses = _tryParseUses4.uses;
		const rest3 = _tryParseUses4.rest;

		var _parseModuleBlock = parseModuleBlock(rest3);

		const lines = _parseModuleBlock.lines;
		const exports = _parseModuleBlock.exports;
		const opDefaultExport = _parseModuleBlock.opDefaultExport;

		if (context.opts.includeModuleName() && !exports.some(_ => _.name === 'name')) {
			const name = new _MsAst.LocalDeclareName(tokens.loc);
			lines.push(new _MsAst.AssignSingle(tokens.loc, name, _MsAst.Quote.forString(tokens.loc, context.opts.moduleName())));
			exports.push(name);
		}
		const uses = plainUses.concat(lazyUses);
		return new _MsAst.Module(tokens.loc, doUses, uses, opUseGlobal, debugUses, lines, exports, opDefaultExport);
	};

	// parseBlock
	const
	// Tokens on the line before a block, and tokens for the block itself.
	beforeAndBlock = tokens => {
		checkNonEmpty(tokens, 'Expected an indented block.');
		const block = tokens.last();
		context.check((0, _Token.isGroup)(_Token.G_Block, block), block.loc, 'Expected an indented block.');
		return [tokens.rtail(), _Slice2.default.group(block)];
	},
	      blockWrap = tokens => new _MsAst.BlockWrap(tokens.loc, parseBlockVal(tokens)),
	      justBlock = (keyword, tokens) => {
		var _beforeAndBlock = beforeAndBlock(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const block = _beforeAndBlock2[1];

		checkEmpty(before, () => `Did not expect anything between ${ (0, _CompileError.code)((0, _Token.keywordName)(keyword)) } and block.`);
		return block;
	},
	      justBlockDo = (keyword, tokens) => parseBlockDo(justBlock(keyword, tokens)),
	      justBlockVal = (keyword, tokens) => parseBlockVal(justBlock(keyword, tokens)),
	     

	// Gets lines in a region or Debug.
	parseLinesFromBlock = tokens => {
		const h = tokens.head();
		context.check(tokens.size() > 1, h.loc, () => `Expected indented block after ${ h }`);
		const block = tokens.second();
		(0, _util.assert)(tokens.size() === 2 && (0, _Token.isGroup)(_Token.G_Block, block));
		return (0, _util.flatMap)(block.subTokens, line => parseLineOrLines(_Slice2.default.group(line)));
	},
	      parseBlockDo = tokens => {
		const lines = _plainBlockLines(tokens);
		return new _MsAst.BlockDo(tokens.loc, lines);
	},
	      parseBlockVal = tokens => {
		var _parseBlockLines2 = _parseBlockLines(tokens);

		const lines = _parseBlockLines2.lines;
		const kReturn = _parseBlockLines2.kReturn;

		switch (kReturn) {
			case KReturn_Bag:
				return _MsAst.BlockBag.of(tokens.loc, lines);
			case KReturn_Map:
				return _MsAst.BlockMap.of(tokens.loc, lines);
			case KReturn_Obj:
				var _tryTakeLastVal2 = _tryTakeLastVal(lines),
				    _tryTakeLastVal22 = _slicedToArray(_tryTakeLastVal2, 2),
				    doLines = _tryTakeLastVal22[0],
				    opVal = _tryTakeLastVal22[1];

				// opName written to by _tryAddName.
				return _MsAst.BlockObj.of(tokens.loc, doLines, opVal, null);
			default:
				{
					context.check(!(0, _util.isEmpty)(lines), tokens.loc, 'Value block must end in a value.');
					const val = (0, _util.last)(lines);
					if (val instanceof _MsAst.Throw) return new _MsAst.BlockValThrow(tokens.loc, (0, _util.rtail)(lines), val);else {
						context.check(val instanceof _MsAst.Val, val.loc, 'Value block must end in a value.');
						return new _MsAst.BlockWithReturn(tokens.loc, (0, _util.rtail)(lines), val);
					}
				}
		}
	},
	      parseModuleBlock = tokens => {
		var _parseBlockLines3 = _parseBlockLines(tokens);

		const lines = _parseBlockLines3.lines;
		const kReturn = _parseBlockLines3.kReturn;

		const loc = tokens.loc;
		switch (kReturn) {
			case KReturn_Bag:case KReturn_Map:
				{
					const block = (kReturn === KReturn_Bag ? _MsAst.BlockBag : _MsAst.BlockMap).of(loc, lines);
					return { lines: [], exports: [], opDefaultExport: new _MsAst.BlockWrap(loc, block) };
				}
			default:
				{
					const exports = [];
					let opDefaultExport = null;
					const moduleName = context.opts.moduleName();

					// Module exports look like a BlockObj,  but are really different.
					// In ES6, module exports must be completely static.
					// So we keep an array of exports attached directly to the Module ast.
					// If you write:
					//	if! cond
					//		a. b
					// in a module context, it will be an error. (The module creates no `built` local.)
					const getLineExports = line => {
						if (line instanceof _MsAst.ObjEntryAssign) {
							for (const _ of line.assign.allAssignees()) if (_.name === moduleName) {
								context.check(opDefaultExport === null, _.loc, () => `Default export already declared at ${ opDefaultExport.loc }`);
								opDefaultExport = new _MsAst.LocalAccess(_.loc, _.name);
							} else exports.push(_);
							return line.assign;
						} else if (line instanceof _MsAst.Debug) line.lines = line.lines.map(getLineExports);
						return line;
					};

					const moduleLines = lines.map(getLineExports);

					if ((0, _util.isEmpty)(exports) && opDefaultExport === null) {
						var _tryTakeLastVal3 = _tryTakeLastVal(moduleLines);

						var _tryTakeLastVal32 = _slicedToArray(_tryTakeLastVal3, 2);

						const lines = _tryTakeLastVal32[0];
						const opDefaultExport = _tryTakeLastVal32[1];

						return { lines, exports, opDefaultExport };
					} else return { lines: moduleLines, exports, opDefaultExport };
				}
		}
	};

	// parseBlock privates
	const _tryTakeLastVal = lines => !(0, _util.isEmpty)(lines) && (0, _util.last)(lines) instanceof _MsAst.Val ? [(0, _util.rtail)(lines), (0, _util.last)(lines)] : [lines, null],
	      _plainBlockLines = lineTokens => {
		const lines = [];
		const addLine = line => {
			if (line instanceof Array) for (const _ of line) addLine(_);else lines.push(line);
		};
		for (const _ of lineTokens) addLine(parseLine(_Slice2.default.group(_)));
		return lines;
	},
	      KReturn_Plain = 0,
	      KReturn_Obj = 1,
	      KReturn_Bag = 2,
	      KReturn_Map = 3,
	      _parseBlockLines = lineTokens => {
		let isBag = false,
		    isMap = false,
		    isObj = false;
		const checkLine = line => {
			if (line instanceof _MsAst.Debug) for (const _ of line.lines) checkLine(_);else if (line instanceof _MsAst.BagEntry) isBag = true;else if (line instanceof _MsAst.MapEntry) isMap = true;else if (line instanceof _MsAst.ObjEntry) isObj = true;
		};
		const lines = _plainBlockLines(lineTokens);
		for (const _ of lines) checkLine(_);

		context.check(!(isObj && isBag), lines.loc, 'Block has both Bag and Obj lines.');
		context.check(!(isObj && isMap), lines.loc, 'Block has both Obj and Map lines.');
		context.check(!(isBag && isMap), lines.loc, 'Block has both Bag and Map lines.');

		const kReturn = isObj ? KReturn_Obj : isBag ? KReturn_Bag : isMap ? KReturn_Map : KReturn_Plain;
		return { lines, kReturn };
	};

	const parseCase = (isVal, casedFromFun, tokens) => {
		var _beforeAndBlock3 = beforeAndBlock(tokens);

		var _beforeAndBlock32 = _slicedToArray(_beforeAndBlock3, 2);

		const before = _beforeAndBlock32[0];
		const block = _beforeAndBlock32[1];

		let opCased;
		if (casedFromFun) {
			checkEmpty(before, 'Can\'t make focus -- is implicitly provided as first argument.');
			opCased = null;
		} else opCased = (0, _util.opIf)(!before.isEmpty(), () => _MsAst.AssignSingle.focus(before.loc, parseExpr(before)));

		const lastLine = _Slice2.default.group(block.last());

		var _ref = (0, _Token.isKeyword)(_Token.KW_Else, lastLine.head()) ? [block.rtail(), (isVal ? justBlockVal : justBlockDo)(_Token.KW_Else, lastLine.tail())] : [block, null];

		var _ref2 = _slicedToArray(_ref, 2);

		const partLines = _ref2[0];
		const opElse = _ref2[1];

		const parts = partLines.mapSlices(_parseCaseLine(isVal));
		context.check(parts.length > 0, tokens.loc, () => `Must have at least 1 non-${ (0, _CompileError.code)('else') } test.`);

		return new (isVal ? _MsAst.CaseVal : _MsAst.CaseDo)(tokens.loc, opCased, parts, opElse);
	};
	// parseCase privates
	const _parseCaseLine = isVal => line => {
		var _beforeAndBlock4 = beforeAndBlock(line);

		var _beforeAndBlock42 = _slicedToArray(_beforeAndBlock4, 2);

		const before = _beforeAndBlock42[0];
		const block = _beforeAndBlock42[1];

		const test = _parseCaseTest(before);
		const result = (isVal ? parseBlockVal : parseBlockDo)(block);
		return new (isVal ? _MsAst.CaseValPart : _MsAst.CaseDoPart)(line.loc, test, result);
	},
	      _parseCaseTest = tokens => {
		const first = tokens.head();
		// Pattern match starts with type test and is followed by local declares.
		// E.g., `:Some val`
		if ((0, _Token.isGroup)(_Token.G_Space, first) && tokens.size() > 1) {
			const ft = _Slice2.default.group(first);
			if ((0, _Token.isKeyword)(_Token.KW_Type, ft.head())) {
				const type = parseSpaced(ft.tail());
				const locals = parseLocalDeclares(tokens.tail());
				return new _MsAst.Pattern(first.loc, type, locals, _MsAst.LocalAccess.focus(tokens.loc));
			}
		}
		return parseExpr(tokens);
	};

	const parseSwitch = (isVal, tokens) => {
		var _beforeAndBlock5 = beforeAndBlock(tokens);

		var _beforeAndBlock52 = _slicedToArray(_beforeAndBlock5, 2);

		const before = _beforeAndBlock52[0];
		const block = _beforeAndBlock52[1];

		const switched = parseExpr(before);
		const lastLine = _Slice2.default.group(block.last());

		var _ref3 = (0, _Token.isKeyword)(_Token.KW_Else, lastLine.head()) ? [block.rtail(), (isVal ? justBlockVal : justBlockDo)(_Token.KW_Else, lastLine.tail())] : [block, null];

		var _ref32 = _slicedToArray(_ref3, 2);

		const partLines = _ref32[0];
		const opElse = _ref32[1];

		const parts = partLines.mapSlices(_parseSwitchLine(isVal));
		context.check(parts.length > 0, tokens.loc, () => `Must have at least 1 non-${ (0, _CompileError.code)('else') } test.`);

		return new (isVal ? _MsAst.SwitchVal : _MsAst.SwitchDo)(tokens.loc, switched, parts, opElse);
	};
	const _parseSwitchLine = isVal => line => {
		var _beforeAndBlock6 = beforeAndBlock(line);

		var _beforeAndBlock62 = _slicedToArray(_beforeAndBlock6, 2);

		const before = _beforeAndBlock62[0];
		const block = _beforeAndBlock62[1];

		let values;
		if ((0, _Token.isKeyword)(_Token.KW_Or, before.head())) values = before.tail().map(parseSingle);else values = [parseExpr(before)];

		const result = (isVal ? parseBlockVal : parseBlockDo)(block);
		return new (isVal ? _MsAst.SwitchValPart : _MsAst.SwitchDoPart)(line.loc, values, result);
	};

	const parseExpr = tokens => {
		return (0, _util.ifElse)(tokens.opSplitManyWhere(_ => (0, _Token.isKeyword)(_Token.KW_ObjAssign, _)), splits => {
			// Short object form, such as (a. 1, b. 2)
			const first = splits[0].before;
			checkNonEmpty(first, () => `Unexpected ${ splits[0].at }`);
			const tokensCaller = first.rtail();

			const pairs = [];
			for (let i = 0; i < splits.length - 1; i = i + 1) {
				const name = splits[i].before.last();
				context.check(name instanceof _Token.Name, name.loc, () => `Expected a name, not ${ name }`);
				const tokensValue = i === splits.length - 2 ? splits[i + 1].before : splits[i + 1].before.rtail();
				const value = parseExprPlain(tokensValue);
				const loc = new _Loc.default(name.loc.start, tokensValue.loc.end);
				pairs.push(new _MsAst.ObjPair(loc, name.name, value));
			}
			(0, _util.assert)((0, _util.last)(splits).at === undefined);
			const val = new _MsAst.ObjSimple(tokens.loc, pairs);
			if (tokensCaller.isEmpty()) return val;else {
				const parts = parseExprParts(tokensCaller);
				return new _MsAst.Call(tokens.loc, (0, _util.head)(parts), (0, _util.push)((0, _util.tail)(parts), val));
			}
		}, () => parseExprPlain(tokens));
	},
	      parseExprPlain = tokens => {
		const parts = parseExprParts(tokens);
		switch (parts.length) {
			case 0:
				context.fail(tokens.loc, 'Expected an expression, got nothing.');
			case 1:
				return (0, _util.head)(parts);
			default:
				return new _MsAst.Call(tokens.loc, (0, _util.head)(parts), (0, _util.tail)(parts));
		}
	},
	      parseExprParts = tokens => {
		const opSplit = tokens.opSplitOnceWhere(token => {
			if (token instanceof _Token.Keyword) switch (token.kind) {
				case _Token.KW_And:case _Token.KW_CaseVal:case _Token.KW_Class:case _Token.KW_ExceptVal:case _Token.KW_ForBag:
				case _Token.KW_ForVal:case _Token.KW_Fun:case _Token.KW_FunDo:case _Token.KW_FunGen:case _Token.KW_FunGenDo:
				case _Token.KW_FunThis:case _Token.KW_FunThisDo:case _Token.KW_FunThisGen:case _Token.KW_FunThisGenDo:
				case _Token.KW_IfVal:case _Token.KW_New:case _Token.KW_Not:case _Token.KW_Or:case _Token.KW_SwitchVal:
				case _Token.KW_UnlessVal:case _Token.KW_With:case _Token.KW_Yield:case _Token.KW_YieldTo:
					return true;
				default:
					return false;
			}
			return false;
		});
		return (0, _util.ifElse)(opSplit, _ref4 => {
			let before = _ref4.before;
			let at = _ref4.at;
			let after = _ref4.after;

			const getLast = () => {
				switch (at.kind) {
					case _Token.KW_And:case _Token.KW_Or:
						return new _MsAst.Logic(at.loc, at.kind === _Token.KW_And ? _MsAst.L_And : _MsAst.L_Or, parseExprParts(after));
					case _Token.KW_CaseVal:
						return parseCase(true, false, after);
					case _Token.KW_Class:
						return parseClass(after);
					case _Token.KW_ExceptVal:
						return parseExcept(_Token.KW_ExceptVal, after);
					case _Token.KW_ForBag:
						return parseForBag(after);
					case _Token.KW_ForVal:
						return parseForVal(after);
					case _Token.KW_Fun:case _Token.KW_FunDo:case _Token.KW_FunGen:case _Token.KW_FunGenDo:
					case _Token.KW_FunThis:case _Token.KW_FunThisDo:case _Token.KW_FunThisGen:
					case _Token.KW_FunThisGenDo:
						return parseFun(at.kind, after);
					case _Token.KW_IfVal:case _Token.KW_UnlessVal:
						{
							var _beforeAndBlock7 = beforeAndBlock(after);

							var _beforeAndBlock72 = _slicedToArray(_beforeAndBlock7, 2);

							const before = _beforeAndBlock72[0];
							const block = _beforeAndBlock72[1];

							return new _MsAst.ConditionalVal(tokens.loc, parseExprPlain(before), parseBlockVal(block), at.kind === _Token.KW_UnlessVal);
						}
					case _Token.KW_New:
						{
							const parts = parseExprParts(after);
							return new _MsAst.New(at.loc, parts[0], (0, _util.tail)(parts));
						}
					case _Token.KW_Not:
						return new _MsAst.Not(at.loc, parseExprPlain(after));
					case _Token.KW_SwitchVal:
						return parseSwitch(true, after);
					case _Token.KW_With:
						return parseWith(after);
					case _Token.KW_Yield:
						return new _MsAst.Yield(at.loc, (0, _util.opIf)(!after.isEmpty(), () => parseExprPlain(after)));
					case _Token.KW_YieldTo:
						return new _MsAst.YieldTo(at.loc, parseExprPlain(after));
					default:
						throw new Error(at.kind);
				}
			};
			return (0, _util.push)(before.map(parseSingle), getLast());
		}, () => tokens.map(parseSingle));
	};

	const parseFun = (kind, tokens) => {
		let isThis = false,
		    isDo = false,
		    isGen = false;
		switch (kind) {
			case _Token.KW_Fun:
				break;
			case _Token.KW_FunDo:
				isDo = true;
				break;
			case _Token.KW_FunGen:
				isGen = true;
				break;
			case _Token.KW_FunGenDo:
				isGen = true;
				isDo = true;
				break;
			case _Token.KW_FunThis:
				isThis = true;
				break;
			case _Token.KW_FunThisDo:
				isThis = true;
				isDo = true;
				break;
			case _Token.KW_FunThisGen:
				isThis = true;
				isGen = true;
				break;
			case _Token.KW_FunThisGenDo:
				isThis = true;
				isGen = true;
				isDo = true;
				break;
			default:
				throw new Error();
		}
		const opDeclareThis = (0, _util.opIf)(isThis, () => new _MsAst.LocalDeclareThis(tokens.loc));

		var _tryTakeReturnType2 = _tryTakeReturnType(tokens);

		const opReturnType = _tryTakeReturnType2.opReturnType;
		const rest = _tryTakeReturnType2.rest;

		var _funArgsAndBlock2 = _funArgsAndBlock(isDo, rest);

		const args = _funArgsAndBlock2.args;
		const opRestArg = _funArgsAndBlock2.opRestArg;
		const block = _funArgsAndBlock2.block;
		const opIn = _funArgsAndBlock2.opIn;
		const opOut = _funArgsAndBlock2.opOut;

		// Need res declare if there is a return type or out condition.
		const opDeclareRes = (0, _util.ifElse)(opReturnType, _ => new _MsAst.LocalDeclareRes(_.loc, _), () => (0, _util.opMap)(opOut, _ => new _MsAst.LocalDeclareRes(_.loc, null)));
		return new _MsAst.Fun(tokens.loc, opDeclareThis, isGen, args, opRestArg, block, opIn, opDeclareRes, opOut);
	};

	// parseFun privates
	const _tryTakeReturnType = tokens => {
		if (!tokens.isEmpty()) {
			const h = tokens.head();
			if ((0, _Token.isGroup)(_Token.G_Space, h) && (0, _Token.isKeyword)(_Token.KW_Type, (0, _util.head)(h.subTokens))) return {
				opReturnType: parseSpaced(_Slice2.default.group(h).tail()),
				rest: tokens.tail()
			};
		}
		return { opReturnType: null, rest: tokens };
	},
	      _funArgsAndBlock = (isDo, tokens) => {
		checkNonEmpty(tokens, 'Expected an indented block.');
		const h = tokens.head();
		// Might be `|case`
		if (h instanceof _Token.Keyword && (h.kind === _Token.KW_CaseVal || h.kind === _Token.KW_CaseDo)) {
			const eCase = parseCase(h.kind === _Token.KW_CaseVal, true, tokens.tail());
			const args = [new _MsAst.LocalDeclareFocus(h.loc)];
			return h.kind === _Token.KW_CaseVal ? {
				args, opRestArg: null, opIn: null, opOut: null,
				block: new _MsAst.BlockWithReturn(tokens.loc, [], eCase)
			} : {
				args, opRestArg: null, opIn: null, opOut: null,
				block: new _MsAst.BlockDo(tokens.loc, [eCase])
			};
		} else {
			var _beforeAndBlock8 = beforeAndBlock(tokens);

			var _beforeAndBlock82 = _slicedToArray(_beforeAndBlock8, 2);

			const before = _beforeAndBlock82[0];
			const blockLines = _beforeAndBlock82[1];

			var _parseFunLocals2 = _parseFunLocals(before);

			const args = _parseFunLocals2.args;
			const opRestArg = _parseFunLocals2.opRestArg;

			for (const arg of args) if (!arg.isLazy()) arg.kind = _MsAst.LD_Mutable;

			var _tryTakeInOrOut2 = _tryTakeInOrOut(_Token.KW_In, blockLines);

			var _tryTakeInOrOut22 = _slicedToArray(_tryTakeInOrOut2, 2);

			const opIn = _tryTakeInOrOut22[0];
			const rest0 = _tryTakeInOrOut22[1];

			var _tryTakeInOrOut3 = _tryTakeInOrOut(_Token.KW_Out, rest0);

			var _tryTakeInOrOut32 = _slicedToArray(_tryTakeInOrOut3, 2);

			const opOut = _tryTakeInOrOut32[0];
			const rest1 = _tryTakeInOrOut32[1];

			const block = (isDo ? parseBlockDo : parseBlockVal)(rest1);
			return { args, opRestArg, block, opIn, opOut };
		}
	},
	      _parseFunLocals = tokens => {
		if (tokens.isEmpty()) return { args: [], opRestArg: null };else {
			const l = tokens.last();
			if (l instanceof _Token.DotName) {
				context.check(l.nDots === 3, l.loc, 'Splat argument must have exactly 3 dots');
				return {
					args: parseLocalDeclares(tokens.rtail()),
					opRestArg: _MsAst.LocalDeclare.plain(l.loc, l.name)
				};
			} else return { args: parseLocalDeclares(tokens), opRestArg: null };
		}
	},
	      _tryTakeInOrOut = (inOrOut, tokens) => {
		if (!tokens.isEmpty()) {
			const firstLine = tokens.headSlice();
			if ((0, _Token.isKeyword)(inOrOut, firstLine.head())) {
				const inOut = new _MsAst.Debug(firstLine.loc, parseLinesFromBlock(firstLine));
				return [inOut, tokens.tail()];
			}
		}
		return [null, tokens];
	};

	const parseLine = tokens => {
		const head = tokens.head();
		const rest = tokens.tail();

		const noRest = () => checkEmpty(rest, () => `Did not expect anything after ${ head }`);

		// We only deal with mutable expressions here, otherwise we fall back to parseExpr.
		if (head instanceof _Token.Keyword) switch (head.kind) {
			case _Token.KW_Assert:case _Token.KW_AssertNot:
				return parseAssert(head.kind === _Token.KW_AssertNot, rest);
			case _Token.KW_ExceptDo:
				return parseExcept(_Token.KW_ExceptDo, rest);
			case _Token.KW_Break:
				noRest();
				return new _MsAst.Break(tokens.loc);
			case _Token.KW_BreakWithVal:
				return new _MsAst.BreakWithVal(tokens.loc, parseExpr(rest));
			case _Token.KW_CaseDo:
				return parseCase(false, false, rest);
			case _Token.KW_Debug:
				return new _MsAst.Debug(tokens.loc, (0, _Token.isGroup)(_Token.G_Block, tokens.second()) ?
				// `debug`, then indented block
				parseLinesFromBlock() :
				// `debug`, then single line
				parseLineOrLines(rest));
			case _Token.KW_Debugger:
				noRest();
				return new _MsAst.SpecialDo(tokens.loc, _MsAst.SD_Debugger);
			case _Token.KW_Ellipsis:
				return new _MsAst.BagEntryMany(tokens.loc, parseExpr(rest));
			case _Token.KW_ForDo:
				return parseForDo(rest);
			case _Token.KW_Ignore:
				return parseIgnore(rest);
			case _Token.KW_IfDo:case _Token.KW_UnlessDo:
				{
					var _beforeAndBlock9 = beforeAndBlock(rest);

					var _beforeAndBlock92 = _slicedToArray(_beforeAndBlock9, 2);

					const before = _beforeAndBlock92[0];
					const block = _beforeAndBlock92[1];

					return new _MsAst.ConditionalDo(tokens.loc, parseExpr(before), parseBlockDo(block), head.kind === _Token.KW_UnlessDo);
				}
			case _Token.KW_ObjAssign:
				return new _MsAst.BagEntry(tokens.loc, parseExpr(rest));
			case _Token.KW_Pass:
				noRest();
				return [];
			case _Token.KW_Region:
				return parseLinesFromBlock(tokens);
			case _Token.KW_SwitchDo:
				return parseSwitch(false, rest);
			case _Token.KW_Throw:
				return new _MsAst.Throw(tokens.loc, (0, _util.opIf)(!rest.isEmpty(), () => parseExpr(rest)));
			case _Token.KW_Name:
				if ((0, _Token.isKeyword)(_Token.KW_ObjAssign, rest.head())) {
					const r = rest.tail();
					const val = r.isEmpty() ? new _MsAst.SpecialVal(tokens.loc, _MsAst.SV_Name) : parseExpr(r);
					return _MsAst.ObjEntryComputed.name(tokens.loc, val);
				}
			// else fallthrough
			default:
			// fall through
		}

		return (0, _util.ifElse)(tokens.opSplitOnceWhere(_isLineSplitKeyword), _ref5 => {
			let before = _ref5.before;
			let at = _ref5.at;
			let after = _ref5.after;
			return _parseAssignLike(before, at, after, tokens.loc);
		}, () => parseExpr(tokens));
	},
	      parseLineOrLines = tokens => {
		const _ = parseLine(tokens);
		return _ instanceof Array ? _ : [_];
	};

	// parseLine privates
	const _isLineSplitKeyword = token => {
		if (token instanceof _Token.Keyword) switch (token.kind) {
			case _Token.KW_Assign:case _Token.KW_AssignMutable:case _Token.KW_LocalMutate:
			case _Token.KW_MapEntry:case _Token.KW_ObjAssign:case _Token.KW_Yield:case _Token.KW_YieldTo:
				return true;
			default:
				return false;
		} else return false;
	},
	      _parseAssignLike = (before, at, after, loc) => {
		if (at.kind === _Token.KW_MapEntry) return new _MsAst.MapEntry(loc, parseExpr(before), parseExpr(after));

		// TODO: This code is kind of ugly.
		if (before.size() === 1) {
			const token = before.head();
			if (token instanceof _Token.DotName) return _parseMemberSet(_MsAst.LocalAccess.this(token.loc), token.name, at, after, loc);
			if ((0, _Token.isGroup)(_Token.G_Space, token)) {
				const spaced = _Slice2.default.group(token);
				const dot = spaced.last();
				if (dot instanceof _Token.DotName) {
					context.check(dot.nDots === 1, dot.loc, 'Must have only 1 `.`.');
					return _parseMemberSet(parseSpaced(spaced.rtail()), dot.name, at, after, loc);
				}
			}
		}

		return at.kind === _Token.KW_LocalMutate ? _parseLocalMutate(before, after, loc) : _parseAssign(before, at, after, loc);
	},
	      _parseMemberSet = (object, name, at, after, loc) => new _MsAst.MemberSet(loc, object, name, _memberSetKind(at), parseExpr(after)),
	      _memberSetKind = at => {
		switch (at.kind) {
			case _Token.KW_Assign:
				return _MsAst.MS_New;
			case _Token.KW_AssignMutable:
				return _MsAst.MS_NewMutable;
			case _Token.KW_LocalMutate:
				return _MsAst.MS_Mutate;
			default:
				throw new Error();
		}
	},
	      _parseLocalMutate = (localsTokens, valueTokens, loc) => {
		const locals = parseLocalDeclaresJustNames(localsTokens);
		context.check(locals.length === 1, loc, 'TODO: LocalDestructureMutate');
		const name = locals[0].name;
		const value = parseExpr(valueTokens);
		return new _MsAst.LocalMutate(loc, name, value);
	},
	      _parseAssign = (localsTokens, assigner, valueTokens, loc) => {
		const kind = assigner.kind;
		const locals = parseLocalDeclares(localsTokens);
		const opName = (0, _util.opIf)(locals.length === 1, () => locals[0].name);
		const value = _parseAssignValue(kind, opName, valueTokens);

		const isYield = kind === _Token.KW_Yield || kind === _Token.KW_YieldTo;
		if ((0, _util.isEmpty)(locals)) {
			context.check(isYield, localsTokens.loc, 'Assignment to nothing');
			return value;
		} else {
			if (isYield) for (const _ of locals) context.check(!_.isLazy(), _.loc, 'Can not yield to lazy variable.');

			const isObjAssign = kind === _Token.KW_ObjAssign;

			if (kind === _Token.KW_AssignMutable) for (let _ of locals) {
				context.check(!_.isLazy(), _.loc, 'Lazy local can not be mutable.');
				_.kind = _MsAst.LD_Mutable;
			}

			const wrap = _ => isObjAssign ? new _MsAst.ObjEntryAssign(loc, _) : _;

			if (locals.length === 1) {
				const assignee = locals[0];
				const assign = new _MsAst.AssignSingle(loc, assignee, value);
				const isTest = isObjAssign && assignee.name.endsWith('test');
				return isTest ? new _MsAst.Debug(loc, [wrap(assign)]) : wrap(assign);
			} else {
				const kind = locals[0].kind;
				for (const _ of locals) context.check(_.kind === kind, _.loc, 'All locals of destructuring assignment must be of the same kind.');
				return wrap(new _MsAst.AssignDestructure(loc, locals, value, kind));
			}
		}
	},
	      _parseAssignValue = (kind, opName, valueTokens) => {
		const value = valueTokens.isEmpty() && kind === _Token.KW_ObjAssign ? new _MsAst.SpecialVal(valueTokens.loc, _MsAst.SV_Null) : parseExpr(valueTokens);
		switch (kind) {
			case _Token.KW_Yield:
				return new _MsAst.Yield(value.loc, value);
			case _Token.KW_YieldTo:
				return new _MsAst.YieldTo(value.loc, value);
			default:
				return value;
		}
	};

	const parseLocalDeclaresJustNames = tokens => tokens.map(_ => _MsAst.LocalDeclare.plain(_.loc, _parseLocalName(_))),
	      parseLocalDeclares = tokens => tokens.map(parseLocalDeclare),
	      parseLocalDeclare = token => {
		if ((0, _Token.isGroup)(_Token.G_Space, token)) {
			const tokens = _Slice2.default.group(token);

			var _ref6 = (0, _Token.isKeyword)(_Token.KW_Lazy, tokens.head()) ? [tokens.tail(), true] : [tokens, false];

			var _ref62 = _slicedToArray(_ref6, 2);

			const rest = _ref62[0];
			const isLazy = _ref62[1];

			const name = _parseLocalName(rest.head());
			const rest2 = rest.tail();
			const opType = (0, _util.opIf)(!rest2.isEmpty(), () => {
				const colon = rest2.head();
				context.check((0, _Token.isKeyword)(_Token.KW_Type, colon), colon.loc, () => `Expected ${ (0, _CompileError.code)(':') }`);
				const tokensType = rest2.tail();
				checkNonEmpty(tokensType, () => `Expected something after ${ colon }`);
				return parseSpaced(tokensType);
			});
			return new _MsAst.LocalDeclare(token.loc, name, opType, isLazy ? _MsAst.LD_Lazy : _MsAst.LD_Const);
		} else return _MsAst.LocalDeclare.plain(token.loc, _parseLocalName(token));
	};

	// parseLocalDeclare privates
	const _parseLocalName = t => {
		if ((0, _Token.isKeyword)(_Token.KW_Focus, t)) return '_';else {
			context.check(t instanceof _Token.Name, t.loc, () => `Expected a local name, not ${ t }`);
			return t.name;
		}
	};

	const parseSingle = token => {
		const loc = token.loc;

		if (token instanceof _Token.Name) return new _MsAst.LocalAccess(loc, token.name);else if (token instanceof _Token.Group) {
			const slice = _Slice2.default.group(token);
			switch (token.kind) {
				case _Token.G_Space:
					return parseSpaced(slice);
				case _Token.G_Parenthesis:
					return parseExpr(slice);
				case _Token.G_Bracket:
					return new _MsAst.BagSimple(loc, parseExprParts(slice));
				case _Token.G_Block:
					return blockWrap(slice);
				case _Token.G_Quote:
					return parseQuote(slice);
				default:
					throw new Error(token.kind);
			}
		} else if (token instanceof _MsAst.NumberLiteral) return token;else if (token instanceof _Token.Keyword) switch (token.kind) {
			case _Token.KW_Focus:
				return _MsAst.LocalAccess.focus(loc);
			default:
				return (0, _util.ifElse)((0, _Token.opKeywordKindToSpecialValueKind)(token.kind), _ => new _MsAst.SpecialVal(loc, _), () => unexpected(token));

		} else if (token instanceof _Token.DotName) switch (token.nDots) {
			case 1:
				return new _MsAst.Member(token.loc, _MsAst.LocalAccess.this(token.loc), token.name);
			case 3:
				return new _MsAst.Splat(loc, new _MsAst.LocalAccess(loc, token.name));
			default:
				unexpected(token);
		} else unexpected(token);
	};

	const parseSpaced = tokens => {
		const h = tokens.head(),
		      rest = tokens.tail();
		if ((0, _Token.isKeyword)(_Token.KW_Type, h)) return _MsAst.Call.contains(h.loc, parseSpaced(rest), _MsAst.LocalAccess.focus(h.loc));else if ((0, _Token.isKeyword)(_Token.KW_Lazy, h)) return new _MsAst.Lazy(h.loc, parseSpaced(rest));else {
			let acc = parseSingle(h);
			for (let i = rest.start; i < rest.end; i = i + 1) {
				const token = rest.tokens[i];
				const loc = token.loc;
				if (token instanceof _Token.DotName) {
					context.check(token.nDots === 1, token.loc, 'Too many dots!');
					acc = new _MsAst.Member(token.loc, acc, token.name);
					continue;
				}
				if (token instanceof _Token.Keyword) switch (token.kind) {
					case _Token.KW_Focus:
						acc = new _MsAst.Call(token.loc, acc, [_MsAst.LocalAccess.focus(loc)]);
						continue;
					case _Token.KW_Type:
						{
							const type = parseSpaced(tokens._chopStart(i + 1));
							return _MsAst.Call.contains(token.loc, type, acc);
						}
					default:
				}
				if (token instanceof _Token.Group) {
					const slice = _Slice2.default.group(token);
					switch (token.kind) {
						case _Token.G_Bracket:
							acc = _MsAst.Call.sub(loc, (0, _util.unshift)(acc, parseExprParts(slice)));
							continue;
						case _Token.G_Parenthesis:
							checkEmpty(slice, () => `Use ${ (0, _CompileError.code)('(a b)') }, not ${ (0, _CompileError.code)('a(b)') }`);
							acc = new _MsAst.Call(loc, acc, []);
							continue;
						case _Token.G_Quote:
							acc = new _MsAst.QuoteTemplate(loc, acc, parseQuote(slice));
							continue;
						default:
					}
				}
				context.fail(tokens.loc, `Expected member or sub, not ${ token }`);
			}
			return acc;
		}
	};

	const tryParseUses = (useKeywordKind, tokens) => {
		if (!tokens.isEmpty()) {
			const line0 = tokens.headSlice();
			if ((0, _Token.isKeyword)(useKeywordKind, line0.head())) {
				var _parseUses2 = _parseUses(useKeywordKind, line0.tail());

				const uses = _parseUses2.uses;
				const opUseGlobal = _parseUses2.opUseGlobal;

				if (new Set([_Token.KW_UseDo, _Token.KW_UseLazy, _Token.KW_UseDebug]).has(useKeywordKind)) context.check(opUseGlobal === null, line0.loc, 'Can\'t use global here.');
				return { uses, opUseGlobal, rest: tokens.tail() };
			}
		}
		return { uses: [], opUseGlobal: null, rest: tokens };
	};

	// tryParseUse privates
	const _parseUses = (useKeywordKind, tokens) => {
		const lines = justBlock(useKeywordKind, tokens);
		let opUseGlobal = null;

		const uses = [];

		for (const line of lines.slices()) {
			var _parseRequire2 = _parseRequire(line.head());

			const path = _parseRequire2.path;
			const name = _parseRequire2.name;

			if (useKeywordKind === _Token.KW_UseDo) {
				if (line.size() > 1) unexpected(line.second());
				uses.push(new _MsAst.UseDo(line.loc, path));
			} else if (path === 'global') {
				context.check(opUseGlobal === null, line.loc, 'Can\'t use global twice');

				var _parseThingsUsed2 = _parseThingsUsed(name, false, line.tail());

				const used = _parseThingsUsed2.used;
				const opUseDefault = _parseThingsUsed2.opUseDefault;

				opUseGlobal = new _MsAst.UseGlobal(line.loc, used, opUseDefault);
			} else {
				const isLazy = useKeywordKind === _Token.KW_UseLazy || useKeywordKind === _Token.KW_UseDebug;

				var _parseThingsUsed3 = _parseThingsUsed(name, isLazy, line.tail());

				const used = _parseThingsUsed3.used;
				const opUseDefault = _parseThingsUsed3.opUseDefault;

				uses.push(new _MsAst.Use(line.loc, path, used, opUseDefault));
			}
		}

		return { uses, opUseGlobal };
	},
	      _parseThingsUsed = (name, isLazy, tokens) => {
		const useDefault = () => _MsAst.LocalDeclare.untyped(tokens.loc, name, isLazy ? _MsAst.LD_Lazy : _MsAst.LD_Const);
		if (tokens.isEmpty()) return { used: [], opUseDefault: useDefault() };else {
			var _ref7 = (0, _Token.isKeyword)(_Token.KW_Focus, tokens.head()) ? [useDefault(), tokens.tail()] : [null, tokens];

			var _ref72 = _slicedToArray(_ref7, 2);

			const opUseDefault = _ref72[0];
			const rest = _ref72[1];

			const used = parseLocalDeclaresJustNames(rest).map(l => {
				context.check(l.name !== '_', l.pos, () => `${ (0, _CompileError.code)('_') } not allowed as import name.`);
				if (isLazy) l.kind = _MsAst.LD_Lazy;
				return l;
			});
			return { used, opUseDefault };
		}
	},
	      _parseRequire = t => {
		if (t instanceof _Token.Name) return { path: t.name, name: t.name };else if (t instanceof _Token.DotName) return { path: (0, _util.push)(_partsFromDotName(t), t.name).join('/'), name: t.name };else {
			context.check((0, _Token.isGroup)(_Token.G_Space, t), t.loc, 'Not a valid module name.');
			return _parseSpacedRequire(_Slice2.default.group(t));
		}
	},
	      _parseSpacedRequire = tokens => {
		const first = tokens.head();
		let parts;
		if (first instanceof _Token.DotName) parts = _partsFromDotName(first);else {
			context.check(first instanceof _Token.Name, first.loc, 'Not a valid part of module path.');
			parts = [];
		}
		parts.push(first.name);
		for (const token of tokens.tail()) {
			context.check(token instanceof _Token.DotName && token.nDots === 1, token.loc, 'Not a valid part of module path.');
			parts.push(token.name);
		}
		return { path: parts.join('/'), name: tokens.last().name };
	},
	      _partsFromDotName = dotName => dotName.nDots === 1 ? ['.'] : (0, _util.repeat)('..', dotName.nDots - 1);

	const _parseFor = ctr => tokens => {
		var _beforeAndBlock10 = beforeAndBlock(tokens);

		var _beforeAndBlock102 = _slicedToArray(_beforeAndBlock10, 2);

		const before = _beforeAndBlock102[0];
		const block = _beforeAndBlock102[1];

		return new ctr(tokens.loc, _parseOpIteratee(before), parseBlockDo(block));
	},
	      _parseOpIteratee = tokens => (0, _util.opIf)(!tokens.isEmpty(), () => {
		var _ifElse = (0, _util.ifElse)(tokens.opSplitOnceWhere(_ => (0, _Token.isKeyword)(_Token.KW_In, _)), _ref8 => {
			let before = _ref8.before;
			let after = _ref8.after;

			context.check(before.size() === 1, before.loc, 'TODO: pattern in for');
			return [parseLocalDeclaresJustNames(before)[0], parseExpr(after)];
		}, () => [new _MsAst.LocalDeclareFocus(tokens.loc), parseExpr(tokens)]);

		var _ifElse2 = _slicedToArray(_ifElse, 2);

		const element = _ifElse2[0];
		const bag = _ifElse2[1];

		return new _MsAst.Iteratee(tokens.loc, element, bag);
	});
	const parseForDo = _parseFor(_MsAst.ForDo),
	      parseForVal = _parseFor(_MsAst.ForVal),
	     
	// TODO: -> out-type
	parseForBag = tokens => {
		var _beforeAndBlock11 = beforeAndBlock(tokens);

		var _beforeAndBlock112 = _slicedToArray(_beforeAndBlock11, 2);

		const before = _beforeAndBlock112[0];
		const lines = _beforeAndBlock112[1];

		const block = parseBlockDo(lines);
		// TODO: Better way?
		if (block.lines.length === 1 && block.lines[0] instanceof _MsAst.Val) block.lines[0] = new _MsAst.BagEntry(block.lines[0].loc, block.lines[0]);
		return _MsAst.ForBag.of(tokens.loc, _parseOpIteratee(before), block);
	};

	const parseExcept = (kwExcept, tokens) => {
		const isVal = kwExcept === _Token.KW_ExceptVal,
		      justDoValBlock = isVal ? justBlockVal : justBlockDo,
		      parseBlock = isVal ? parseBlockVal : parseBlockDo,
		      Except = isVal ? _MsAst.ExceptVal : _MsAst.ExceptDo,
		      kwTry = isVal ? _Token.KW_TryVal : _Token.KW_TryDo,
		      kwCatch = isVal ? _Token.KW_CatchVal : _Token.KW_CatchDo,
		      nameTry = () => (0, _CompileError.code)((0, _Token.keywordName)(kwTry)),
		      nameCatch = () => (0, _CompileError.code)((0, _Token.keywordName)(kwCatch)),
		      nameFinally = () => (0, _CompileError.code)((0, _Token.keywordName)(_Token.KW_Finally));

		const lines = justBlock(kwExcept, tokens);

		// `try` *must* come first.
		const firstLine = lines.headSlice();
		const tokenTry = firstLine.head();
		context.check((0, _Token.isKeyword)(kwTry, tokenTry), tokenTry.loc, () => `Must start with ${ nameTry() }`);
		const _try = justDoValBlock(kwTry, firstLine.tail());

		const restLines = lines.tail();
		checkNonEmpty(restLines, () => `Must have at least one of ${ nameCatch() } or ${ nameFinally() }`);

		const handleFinally = restLines => {
			const line = restLines.headSlice();
			const tokenFinally = line.head();
			context.check((0, _Token.isKeyword)(_Token.KW_Finally, tokenFinally), tokenFinally.loc, () => `Expected ${ nameFinally() }`);
			context.check(restLines.size() === 1, restLines.loc, () => `Nothing is allowed to come after ${ nameFinally() }.`);
			return justBlockDo(_Token.KW_Finally, line.tail());
		};

		let _catch, _finally;

		const line2 = restLines.headSlice();
		const head2 = line2.head();
		if ((0, _Token.isKeyword)(kwCatch, head2)) {
			var _beforeAndBlock12 = beforeAndBlock(line2.tail());

			var _beforeAndBlock122 = _slicedToArray(_beforeAndBlock12, 2);

			const before2 = _beforeAndBlock122[0];
			const block2 = _beforeAndBlock122[1];

			const caught = _parseOneLocalDeclareOrFocus(before2);
			_catch = new _MsAst.Catch(line2.loc, caught, parseBlock(block2));
			_finally = (0, _util.opIf)(restLines.size() > 1, () => handleFinally(restLines.tail()));
		} else {
			_catch = null;
			_finally = handleFinally(restLines);
		}

		return new Except(tokens.loc, _try, _catch, _finally);
	},
	      _parseOneLocalDeclareOrFocus = tokens => {
		if (tokens.isEmpty()) return new _MsAst.LocalDeclareFocus(tokens.loc);else {
			context.check(tokens.size() === 1, 'Expected only one local declare.');
			return parseLocalDeclares(tokens)[0];
		}
	};

	const parseAssert = (negate, tokens) => {
		checkNonEmpty(tokens, () => `Expected something after ${ (0, _Token.keywordName)(_Token.KW_Assert) }.`);

		var _ifElse3 = (0, _util.ifElse)(tokens.opSplitOnceWhere(_ => (0, _Token.isKeyword)(_Token.KW_Throw, _)), _ref9 => {
			let before = _ref9.before;
			let after = _ref9.after;
			return [before, parseExpr(after)];
		}, () => [tokens, null]);

		var _ifElse32 = _slicedToArray(_ifElse3, 2);

		const condTokens = _ifElse32[0];
		const opThrown = _ifElse32[1];

		const parts = parseExprParts(condTokens);
		const cond = parts.length === 1 ? parts[0] : new _MsAst.Call(condTokens.loc, parts[0], (0, _util.tail)(parts));
		return new _MsAst.Assert(tokens.loc, negate, cond, opThrown);
	};

	const parseClass = tokens => {
		var _beforeAndBlock13 = beforeAndBlock(tokens);

		var _beforeAndBlock132 = _slicedToArray(_beforeAndBlock13, 2);

		const before = _beforeAndBlock132[0];
		const block = _beforeAndBlock132[1];

		const opExtended = (0, _util.opIf)(!before.isEmpty(), () => parseExpr(before));

		let opDo = null,
		    statics = [],
		    opConstructor = null,
		    methods = [];

		let rest = block;
		const line1 = rest.headSlice();
		if ((0, _Token.isKeyword)(_Token.KW_Do, line1.head())) {
			const done = justBlockDo(_Token.KW_Do, line1.tail());
			opDo = new _MsAst.ClassDo(line1.loc, new _MsAst.LocalDeclareFocus(line1.loc, done), done);
			rest = block.tail();
		}
		if (!rest.isEmpty()) {
			const line2 = rest.headSlice();
			if ((0, _Token.isKeyword)(_Token.KW_Static, line2.head())) {
				statics = _parseStatics(line2.tail());
				rest = rest.tail();
			}
			if (!rest.isEmpty()) {
				const line3 = rest.headSlice();
				if ((0, _Token.isKeyword)(_Token.KW_Construct, line3.head())) {
					opConstructor = _parseConstructor(line3.tail());
					rest = rest.tail();
				}
				methods = _parseMethods(rest);
			}
		}

		return new _MsAst.Class(tokens.loc, opExtended, opDo, statics, opConstructor, methods);
	};

	const _parseConstructor = tokens => {
		var _funArgsAndBlock3 = _funArgsAndBlock(true, tokens);

		const args = _funArgsAndBlock3.args;
		const opRestArg = _funArgsAndBlock3.opRestArg;
		const block = _funArgsAndBlock3.block;
		const opIn = _funArgsAndBlock3.opIn;
		const opOut = _funArgsAndBlock3.opOut;

		const isGenerator = false,
		      opDeclareRes = null;
		return new _MsAst.Fun(tokens.loc, new _MsAst.LocalDeclareThis(tokens.loc), isGenerator, args, opRestArg, block, opIn, opDeclareRes, opOut);
	},
	      _parseStatics = tokens => {
		const block = justBlock(_Token.KW_Static, tokens);
		return _parseMethods(block);
	},
	      _parseMethods = tokens => tokens.mapSlices(_parseMethod),
	      _parseMethod = tokens => {
		const head = tokens.head();

		let kind = _MsAst.MI_Plain;
		if ((0, _Token.isKeyword)(_Token.KW_Get, head) || (0, _Token.isKeyword)(_Token.KW_Set, head)) {
			kind = head.kind === _Token.KW_Get ? _MsAst.MI_Get : _MsAst.MI_Set;
			tokens = tokens.tail();
		}

		const baa = tokens.opSplitOnceWhere(_isFunKeyword);
		context.check(baa !== null, tokens.loc, 'Expected a function keyword somewhere.');
		const before = baa.before;
		const at = baa.at;
		const after = baa.after;

		const fun = parseFun(_methodFunKind(at), after);

		let symbol = parseExpr(before);
		// If symbol is just a literal string, store it as a string, which is handled specially.
		if (symbol instanceof _MsAst.Quote && symbol.parts.length === 1 && typeof symbol.parts[0] === 'string') symbol = symbol.parts[0];

		return new _MsAst.MethodImpl(tokens.loc, kind, symbol, fun);
	},
	      _methodFunKind = funKindToken => {
		switch (funKindToken.kind) {
			case _Token.KW_Fun:
				return _Token.KW_FunThis;
			case _Token.KW_FunDo:
				return _Token.KW_FunThisDo;
			case _Token.KW_FunGen:
				return _Token.KW_FunThisGen;
			case _Token.KW_FunGenDo:
				return _Token.KW_FunThisGenDo;
			case _Token.KW_FunThis:case _Token.KW_FunThisDo:case _Token.KW_FunThisGen:case _Token.KW_FunThisGenDo:
				context.fail(funKindToken.loc, 'Function `.` is implicit for methods.');
			default:
				context.fail(funKindToken.loc, `Expected function kind, got ${ funKindToken }`);
		}
	},
	      _isFunKeyword = funKindToken => {
		if (funKindToken instanceof _Token.Keyword) switch (funKindToken.kind) {
			case _Token.KW_Fun:case _Token.KW_FunDo:case _Token.KW_FunGen:case _Token.KW_FunGenDo:
			case _Token.KW_FunThis:case _Token.KW_FunThisDo:case _Token.KW_FunThisGen:
			case _Token.KW_FunThisGenDo:
				return true;
			default:
				return false;
		} else return false;
	};

	const parseQuote = tokens => new _MsAst.Quote(tokens.loc, tokens.map(_ => typeof _ === 'string' ? _ : parseSingle(_)));

	const parseWith = tokens => {
		var _beforeAndBlock14 = beforeAndBlock(tokens);

		var _beforeAndBlock142 = _slicedToArray(_beforeAndBlock14, 2);

		const before = _beforeAndBlock142[0];
		const block = _beforeAndBlock142[1];

		var _ifElse4 = (0, _util.ifElse)(before.opSplitOnceWhere(_ => (0, _Token.isKeyword)(_Token.KW_As, _)), _ref10 => {
			let before = _ref10.before;
			let after = _ref10.after;

			context.check(after.size() === 1, () => `Expected only 1 token after ${ (0, _CompileError.code)('as') }.`);
			return [parseExprPlain(before), parseLocalDeclare(after.head())];
		}, () => [parseExprPlain(before), new _MsAst.LocalDeclareFocus(tokens.loc)]);

		var _ifElse42 = _slicedToArray(_ifElse4, 2);

		const val = _ifElse42[0];
		const declare = _ifElse42[1];

		return new _MsAst.With(tokens.loc, declare, val, parseBlockDo(block));
	};

	const parseIgnore = tokens => {
		const ignored = tokens.map(_ => {
			if ((0, _Token.isKeyword)(_Token.KW_Focus, _)) return '_';else {
				context.check(_ instanceof _Token.Name, _.loc, () => `Expected local name, not ${ _ }.`);
				return _.name;
			}
		});
		return new _MsAst.Ignore(tokens.loc, ignored);
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7QUM4QkEsS0FBSSxPQUFPLENBQUE7Ozs7Ozs7Ozs7Ozs7a0JBWUksQ0FBQyxRQUFRLEVBQUUsU0FBUyxLQUFLO0FBQ3ZDLFNBQU8sR0FBRyxRQUFRLENBQUE7QUFDbEIsWUFyQlEsTUFBTSxFQXFCUCxXQS9Cc0UsT0FBTyxTQUE1RCxPQUFPLEVBK0JQLFNBQVMsQ0FBQyxDQUFDLENBQUE7QUFDbkMsUUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLGdCQUFNLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBOztBQUVqRCxTQUFPLEdBQUcsU0FBUyxDQUFBO0FBQ25CLFNBQU8sS0FBSyxDQUFBO0VBQ1o7O0FBRUQsT0FDQyxVQUFVLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxLQUM1QixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQztPQUNyRCxhQUFhLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxLQUMvQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDO09BQ3RELFVBQVUsR0FBRyxLQUFLLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxHQUFFLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQTs7QUFFckUsT0FBTSxXQUFXLEdBQUcsTUFBTSxJQUFJOzs7c0JBRVMsWUFBWSxRQXZDTyxRQUFRLEVBdUNKLE1BQU0sQ0FBQzs7UUFBdEQsTUFBTSxpQkFBWixJQUFJO1FBQWdCLEtBQUssaUJBQVgsSUFBSTs7dUJBQzRCLFlBQVksUUF4QzlCLE1BQU0sRUF3Q2lDLEtBQUssQ0FBQzs7UUFBbkUs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V0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLG1CQTNuQ0ssSUFBSSxBQTJuQ08sRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyx5QkFBeUIsR0FBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUMvRSxXQUFPLENBQUMsQ0FBQyxJQUFJLENBQUE7SUFDYjtHQUNELENBQUMsQ0FBQTtBQUNGLFNBQU8sV0FocENnQixNQUFNLENBZ3BDWCxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0VBQ3RDLENBQUEiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9wYXJzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IExvYyBmcm9tICdlc2FzdC9kaXN0L0xvYydcbmltcG9ydCB7IGNvZGUgfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQgeyBBc3NlcnQsIEFzc2lnbkRlc3RydWN0dXJlLCBBc3NpZ25TaW5nbGUsIEJhZ0VudHJ5LCBCYWdFbnRyeU1hbnksIEJhZ1NpbXBsZSwgQmxvY2tCYWcsXG5cdEJsb2NrRG8sIEJsb2NrTWFwLCBCbG9ja09iaiwgQmxvY2tWYWxUaHJvdywgQmxvY2tXaXRoUmV0dXJuLCBCbG9ja1dyYXAsIEJyZWFrLCBCcmVha1dpdGhWYWwsXG5cdENhbGwsIENhc2VEbywgQ2FzZURvUGFydCwgQ2FzZVZhbCwgQ2FzZVZhbFBhcnQsIENhdGNoLCBDbGFzcywgQ2xhc3NEbywgQ29uZGl0aW9uYWxEbyxcblx0Q29uZGl0aW9uYWxWYWwsIERlYnVnLCBJZ25vcmUsIEl0ZXJhdGVlLCBOdW1iZXJMaXRlcmFsLCBFeGNlcHREbywgRXhjZXB0VmFsLCBGb3JCYWcsIEZvckRvLFxuXHRGb3JWYWwsIEZ1biwgTF9BbmQsIExfT3IsIExhenksIExEX0NvbnN0LCBMRF9MYXp5LCBMRF9NdXRhYmxlLCBMb2NhbEFjY2VzcywgTG9jYWxEZWNsYXJlLFxuXHRMb2NhbERlY2xhcmVGb2N1cywgTG9jYWxEZWNsYXJlTmFtZSwgTG9jYWxEZWNsYXJlUmVzLCBMb2NhbERlY2xhcmVUaGlzLCBMb2NhbE11dGF0ZSwgTG9naWMsXG5cdE1hcEVudHJ5LCBNZW1iZXIsIE1lbWJlclNldCwgTWV0aG9kSW1wbCwgTUlfR2V0LCBNSV9QbGFpbiwgTUlfU2V0LCBNb2R1bGUsIE1TX011dGF0ZSwgTVNfTmV3LFxuXHRNU19OZXdNdXRhYmxlLCBOZXcsIE5vdCwgT2JqRW50cnksIE9iakVudHJ5QXNzaWduLCBPYmpFbnRyeUNvbXB1dGVkLCBPYmpQYWlyLCBPYmpTaW1wbGUsXG5cdFBhdHRlcm4sIFF1b3RlLCBRdW90ZVRlbXBsYXRlLCBTRF9EZWJ1Z2dlciwgU3BlY2lhbERvLCBTcGVjaWFsVmFsLCBTVl9OYW1lLCBTVl9OdWxsLCBTcGxhdCxcblx0U3dpdGNoRG8sIFN3aXRjaERvUGFydCwgU3dpdGNoVmFsLCBTd2l0Y2hWYWxQYXJ0LCBUaHJvdywgVmFsLCBVc2UsIFVzZURvLCBVc2VHbG9iYWwsIFdpdGgsXG5cdFlpZWxkLCBZaWVsZFRvIH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQgeyBEb3ROYW1lLCBHcm91cCwgR19CbG9jaywgR19CcmFja2V0LCBHX1BhcmVudGhlc2lzLCBHX1NwYWNlLCBHX1F1b3RlLCBpc0dyb3VwLCBpc0tleXdvcmQsXG5cdEtleXdvcmQsIEtXX0FuZCwgS1dfQXMsIEtXX0Fzc2VydCwgS1dfQXNzZXJ0Tm90LCBLV19Bc3NpZ24sIEtXX0Fzc2lnbk11dGFibGUsIEtXX0JyZWFrLFxuXHRLV19CcmVha1dpdGhWYWwsIEtXX0Nhc2VWYWwsIEtXX0Nhc2VEbywgS1dfQ2xhc3MsIEtXX0NhdGNoRG8sIEtXX0NhdGNoVmFsLCBLV19Db25zdHJ1Y3QsXG5cdEtXX0RlYnVnLCBLV19EZWJ1Z2dlciwgS1dfRG8sIEtXX0VsbGlwc2lzLCBLV19FbHNlLCBLV19FeGNlcHREbywgS1dfRXhjZXB0VmFsLCBLV19GaW5hbGx5LFxuXHRLV19Gb3JCYWcsIEtXX0ZvckRvLCBLV19Gb3JWYWwsIEtXX0ZvY3VzLCBLV19GdW4sIEtXX0Z1bkRvLCBLV19GdW5HZW4sIEtXX0Z1bkdlbkRvLCBLV19GdW5UaGlzLFxuXHRLV19GdW5UaGlzRG8sIEtXX0Z1blRoaXNHZW4sIEtXX0Z1blRoaXNHZW5EbywgS1dfR2V0LCBLV19JZkRvLCBLV19JZlZhbCwgS1dfSWdub3JlLCBLV19Jbixcblx0S1dfTGF6eSwgS1dfTG9jYWxNdXRhdGUsIEtXX01hcEVudHJ5LCBLV19OYW1lLCBLV19OZXcsIEtXX05vdCwgS1dfT2JqQXNzaWduLCBLV19PciwgS1dfUGFzcyxcblx0S1dfT3V0LCBLV19SZWdpb24sIEtXX1NldCwgS1dfU3RhdGljLCBLV19Td2l0Y2hEbywgS1dfU3dpdGNoVmFsLCBLV19UaHJvdywgS1dfVHJ5RG8sIEtXX1RyeVZhbCxcblx0S1dfVHlwZSwgS1dfVW5sZXNzRG8sIEtXX1VubGVzc1ZhbCwgS1dfVXNlLCBLV19Vc2VEZWJ1ZywgS1dfVXNlRG8sIEtXX1VzZUxhenksIEtXX1dpdGgsXG5cdEtXX1lpZWxkLCBLV19ZaWVsZFRvLCBOYW1lLCBrZXl3b3JkTmFtZSwgb3BLZXl3b3JkS2luZFRvU3BlY2lhbFZhbHVlS2luZCB9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHsgYXNzZXJ0LCBoZWFkLCBpZkVsc2UsIGZsYXRNYXAsIGlzRW1wdHksIGxhc3QsXG5cdG9wSWYsIG9wTWFwLCBwdXNoLCByZXBlYXQsIHJ0YWlsLCB0YWlsLCB1bnNoaWZ0IH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vLyBTaW5jZSB0aGVyZSBhcmUgc28gbWFueSBwYXJzaW5nIGZ1bmN0aW9ucyxcbi8vIGl0J3MgZmFzdGVyIChhcyBvZiBub2RlIHYwLjExLjE0KSB0byBoYXZlIHRoZW0gYWxsIGNsb3NlIG92ZXIgdGhpcyBtdXRhYmxlIHZhcmlhYmxlIG9uY2Vcbi8vIHRoYW4gdG8gY2xvc2Ugb3ZlciB0aGUgcGFyYW1ldGVyIChhcyBpbiBsZXguanMsIHdoZXJlIHRoYXQncyBtdWNoIGZhc3RlcikuXG5sZXQgY29udGV4dFxuXG4vKlxuVGhpcyBjb252ZXJ0cyBhIFRva2VuIHRyZWUgdG8gYSBNc0FzdC5cblRoaXMgaXMgYSByZWN1cnNpdmUtZGVzY2VudCBwYXJzZXIsIG1hZGUgZWFzaWVyIGJ5IHR3byBmYWN0czpcblx0KiBXZSBoYXZlIGFscmVhZHkgZ3JvdXBlZCB0b2tlbnMuXG5cdCogTW9zdCBvZiB0aGUgdGltZSwgYW4gYXN0J3MgdHlwZSBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBmaXJzdCB0b2tlbi5cblxuVGhlcmUgYXJlIGV4Y2VwdGlvbnMgc3VjaCBhcyBhc3NpZ25tZW50IHN0YXRlbWVudHMgKGluZGljYXRlZCBieSBhIGA9YCBzb21ld2hlcmUgaW4gdGhlIG1pZGRsZSkuXG5Gb3IgdGhvc2Ugd2UgbXVzdCBpdGVyYXRlIHRocm91Z2ggdG9rZW5zIGFuZCBzcGxpdC5cbihTZWUgU2xpY2Uub3BTcGxpdE9uY2VXaGVyZSBhbmQgU2xpY2Uub3BTcGxpdE1hbnlXaGVyZS4pXG4qL1xuZXhwb3J0IGRlZmF1bHQgKF9jb250ZXh0LCByb290VG9rZW4pID0+IHtcblx0Y29udGV4dCA9IF9jb250ZXh0XG5cdGFzc2VydChpc0dyb3VwKEdfQmxvY2ssIHJvb3RUb2tlbikpXG5cdGNvbnN0IG1zQXN0ID0gcGFyc2VNb2R1bGUoU2xpY2UuZ3JvdXAocm9vdFRva2VuKSlcblx0Ly8gUmVsZWFzZSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9ucy5cblx0Y29udGV4dCA9IHVuZGVmaW5lZFxuXHRyZXR1cm4gbXNBc3Rcbn1cblxuY29uc3Rcblx0Y2hlY2tFbXB0eSA9ICh0b2tlbnMsIG1lc3NhZ2UpID0+XG5cdFx0Y29udGV4dC5jaGVjayh0b2tlbnMuaXNFbXB0eSgpLCB0b2tlbnMubG9jLCBtZXNzYWdlKSxcblx0Y2hlY2tOb25FbXB0eSA9ICh0b2tlbnMsIG1lc3NhZ2UpID0+XG5cdFx0Y29udGV4dC5jaGVjayghdG9rZW5zLmlzRW1wdHkoKSwgdG9rZW5zLmxvYywgbWVzc2FnZSksXG5cdHVuZXhwZWN0ZWQgPSB0b2tlbiA9PiBjb250ZXh0LmZhaWwodG9rZW4ubG9jLCBgVW5leHBlY3RlZCAke3Rva2VufWApXG5cbmNvbnN0IHBhcnNlTW9kdWxlID0gdG9rZW5zID0+IHtcblx0Ly8gVXNlIHN0YXRlbWVudHMgbXVzdCBhcHBlYXIgaW4gb3JkZXIuXG5cdGNvbnN0IHsgdXNlczogZG9Vc2VzLCByZXN0OiByZXN0MCB9ID0gdHJ5UGFyc2VVc2VzKEtXX1VzZURvLCB0b2tlbnMpXG5cdGNvbnN0IHsgdXNlczogcGxhaW5Vc2VzLCBvcFVzZUdsb2JhbCwgcmVzdDogcmVzdDEgfSA9IHRyeVBhcnNlVXNlcyhLV19Vc2UsIHJlc3QwKVxuXHRjb25zdCB7IHVzZXM6IGxhenlVc2VzLCByZXN0OiByZXN0MiB9ID0gdHJ5UGFyc2VVc2VzKEtXX1VzZUxhenksIHJlc3QxKVxuXHRjb25zdCB7IHVzZXM6IGRlYnVnVXNlcywgcmVzdDogcmVzdDMgfSA9IHRyeVBhcnNlVXNlcyhLV19Vc2VEZWJ1ZywgcmVzdDIpXG5cblx0Y29uc3QgeyBsaW5lcywgZXhwb3J0cywgb3BEZWZhdWx0RXhwb3J0IH0gPSBwYXJzZU1vZHVsZUJsb2NrKHJlc3QzKVxuXG5cdGlmIChjb250ZXh0Lm9wdHMuaW5jbHVkZU1vZHVsZU5hbWUoKSAmJiAhZXhwb3J0cy5zb21lKF8gPT4gXy5uYW1lID09PSAnbmFtZScpKSB7XG5cdFx0Y29uc3QgbmFtZSA9IG5ldyBMb2NhbERlY2xhcmVOYW1lKHRva2Vucy5sb2MpXG5cdFx0bGluZXMucHVzaChuZXcgQXNzaWduU2luZ2xlKHRva2Vucy5sb2MsIG5hbWUsXG5cdFx0XHRRdW90ZS5mb3JTdHJpbmcodG9rZW5zLmxvYywgY29udGV4dC5vcHRzLm1vZHVsZU5hbWUoKSkpKVxuXHRcdGV4cG9ydHMucHVzaChuYW1lKVxuXHR9XG5cdGNvbnN0IHVzZXMgPSBwbGFpblVzZXMuY29uY2F0KGxhenlVc2VzKVxuXHRyZXR1cm4gbmV3IE1vZHVsZSh0b2tlbnMubG9jLFxuXHRcdGRvVXNlcywgdXNlcywgb3BVc2VHbG9iYWwsIGRlYnVnVXNlcywgbGluZXMsIGV4cG9ydHMsIG9wRGVmYXVsdEV4cG9ydClcbn1cblxuLy8gcGFyc2VCbG9ja1xuY29uc3Rcblx0Ly8gVG9rZW5zIG9uIHRoZSBsaW5lIGJlZm9yZSBhIGJsb2NrLCBhbmQgdG9rZW5zIGZvciB0aGUgYmxvY2sgaXRzZWxmLlxuXHRiZWZvcmVBbmRCbG9jayA9IHRva2VucyA9PiB7XG5cdFx0Y2hlY2tOb25FbXB0eSh0b2tlbnMsICdFeHBlY3RlZCBhbiBpbmRlbnRlZCBibG9jay4nKVxuXHRcdGNvbnN0IGJsb2NrID0gdG9rZW5zLmxhc3QoKVxuXHRcdGNvbnRleHQuY2hlY2soaXNHcm91cChHX0Jsb2NrLCBibG9jayksIGJsb2NrLmxvYywgJ0V4cGVjdGVkIGFuIGluZGVudGVkIGJsb2NrLicpXG5cdFx0cmV0dXJuIFsgdG9rZW5zLnJ0YWlsKCksIFNsaWNlLmdyb3VwKGJsb2NrKSBdXG5cdH0sXG5cblx0YmxvY2tXcmFwID0gdG9rZW5zID0+IG5ldyBCbG9ja1dyYXAodG9rZW5zLmxvYywgcGFyc2VCbG9ja1ZhbCh0b2tlbnMpKSxcblxuXHRqdXN0QmxvY2sgPSAoa2V5d29yZCwgdG9rZW5zKSA9PiB7XG5cdFx0Y29uc3QgWyBiZWZvcmUsIGJsb2NrIF0gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdFx0Y2hlY2tFbXB0eShiZWZvcmUsICgpID0+XG5cdFx0XHRgRGlkIG5vdCBleHBlY3QgYW55dGhpbmcgYmV0d2VlbiAke2NvZGUoa2V5d29yZE5hbWUoa2V5d29yZCkpfSBhbmQgYmxvY2suYClcblx0XHRyZXR1cm4gYmxvY2tcblx0fSxcblx0anVzdEJsb2NrRG8gPSAoa2V5d29yZCwgdG9rZW5zKSA9PlxuXHRcdHBhcnNlQmxvY2tEbyhqdXN0QmxvY2soa2V5d29yZCwgdG9rZW5zKSksXG5cdGp1c3RCbG9ja1ZhbCA9IChrZXl3b3JkLCB0b2tlbnMpID0+XG5cdFx0cGFyc2VCbG9ja1ZhbChqdXN0QmxvY2soa2V5d29yZCwgdG9rZW5zKSksXG5cblx0Ly8gR2V0cyBsaW5lcyBpbiBhIHJlZ2lvbiBvciBEZWJ1Zy5cblx0cGFyc2VMaW5lc0Zyb21CbG9jayA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKClcblx0XHRjb250ZXh0LmNoZWNrKHRva2Vucy5zaXplKCkgPiAxLCBoLmxvYywgKCkgPT4gYEV4cGVjdGVkIGluZGVudGVkIGJsb2NrIGFmdGVyICR7aH1gKVxuXHRcdGNvbnN0IGJsb2NrID0gdG9rZW5zLnNlY29uZCgpXG5cdFx0YXNzZXJ0KHRva2Vucy5zaXplKCkgPT09IDIgJiYgaXNHcm91cChHX0Jsb2NrLCBibG9jaykpXG5cdFx0cmV0dXJuIGZsYXRNYXAoYmxvY2suc3ViVG9rZW5zLCBsaW5lID0+IHBhcnNlTGluZU9yTGluZXMoU2xpY2UuZ3JvdXAobGluZSkpKVxuXHR9LFxuXG5cdHBhcnNlQmxvY2tEbyA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgbGluZXMgPSBfcGxhaW5CbG9ja0xpbmVzKHRva2Vucylcblx0XHRyZXR1cm4gbmV3IEJsb2NrRG8odG9rZW5zLmxvYywgbGluZXMpXG5cdH0sXG5cblx0cGFyc2VCbG9ja1ZhbCA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgeyBsaW5lcywga1JldHVybiB9ID0gX3BhcnNlQmxvY2tMaW5lcyh0b2tlbnMpXG5cdFx0c3dpdGNoIChrUmV0dXJuKSB7XG5cdFx0XHRjYXNlIEtSZXR1cm5fQmFnOlxuXHRcdFx0XHRyZXR1cm4gQmxvY2tCYWcub2YodG9rZW5zLmxvYywgbGluZXMpXG5cdFx0XHRjYXNlIEtSZXR1cm5fTWFwOlxuXHRcdFx0XHRyZXR1cm4gQmxvY2tNYXAub2YodG9rZW5zLmxvYywgbGluZXMpXG5cdFx0XHRjYXNlIEtSZXR1cm5fT2JqOlxuXHRcdFx0XHRjb25zdCBbIGRvTGluZXMsIG9wVmFsIF0gPSBfdHJ5VGFrZUxhc3RWYWwobGluZXMpXG5cdFx0XHRcdC8vIG9wTmFtZSB3cml0dGVuIHRvIGJ5IF90cnlBZGROYW1lLlxuXHRcdFx0XHRyZXR1cm4gQmxvY2tPYmoub2YodG9rZW5zLmxvYywgZG9MaW5lcywgb3BWYWwsIG51bGwpXG5cdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdGNvbnRleHQuY2hlY2soIWlzRW1wdHkobGluZXMpLCB0b2tlbnMubG9jLCAnVmFsdWUgYmxvY2sgbXVzdCBlbmQgaW4gYSB2YWx1ZS4nKVxuXHRcdFx0XHRjb25zdCB2YWwgPSBsYXN0KGxpbmVzKVxuXHRcdFx0XHRpZiAodmFsIGluc3RhbmNlb2YgVGhyb3cpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBCbG9ja1ZhbFRocm93KHRva2Vucy5sb2MsIHJ0YWlsKGxpbmVzKSwgdmFsKVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKHZhbCBpbnN0YW5jZW9mIFZhbCwgdmFsLmxvYywgJ1ZhbHVlIGJsb2NrIG11c3QgZW5kIGluIGEgdmFsdWUuJylcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEJsb2NrV2l0aFJldHVybih0b2tlbnMubG9jLCBydGFpbChsaW5lcyksIHZhbClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRwYXJzZU1vZHVsZUJsb2NrID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCB7IGxpbmVzLCBrUmV0dXJuIH0gPSBfcGFyc2VCbG9ja0xpbmVzKHRva2Vucylcblx0XHRjb25zdCBsb2MgPSB0b2tlbnMubG9jXG5cdFx0c3dpdGNoIChrUmV0dXJuKSB7XG5cdFx0XHRjYXNlIEtSZXR1cm5fQmFnOiBjYXNlIEtSZXR1cm5fTWFwOiB7XG5cdFx0XHRcdGNvbnN0IGJsb2NrID0gKGtSZXR1cm4gPT09IEtSZXR1cm5fQmFnID8gQmxvY2tCYWcgOiBCbG9ja01hcCkub2YobG9jLCBsaW5lcylcblx0XHRcdFx0cmV0dXJuIHsgbGluZXM6IFsgXSwgZXhwb3J0czogWyBdLCBvcERlZmF1bHRFeHBvcnQ6IG5ldyBCbG9ja1dyYXAobG9jLCBibG9jaykgfVxuXHRcdFx0fVxuXHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHRjb25zdCBleHBvcnRzID0gWyBdXG5cdFx0XHRcdGxldCBvcERlZmF1bHRFeHBvcnQgPSBudWxsXG5cdFx0XHRcdGNvbnN0IG1vZHVsZU5hbWUgPSBjb250ZXh0Lm9wdHMubW9kdWxlTmFtZSgpXG5cblx0XHRcdFx0Ly8gTW9kdWxlIGV4cG9ydHMgbG9vayBsaWtlIGEgQmxvY2tPYmosICBidXQgYXJlIHJlYWxseSBkaWZmZXJlbnQuXG5cdFx0XHRcdC8vIEluIEVTNiwgbW9kdWxlIGV4cG9ydHMgbXVzdCBiZSBjb21wbGV0ZWx5IHN0YXRpYy5cblx0XHRcdFx0Ly8gU28gd2Uga2VlcCBhbiBhcnJheSBvZiBleHBvcnRzIGF0dGFjaGVkIGRpcmVjdGx5IHRvIHRoZSBNb2R1bGUgYXN0LlxuXHRcdFx0XHQvLyBJZiB5b3Ugd3JpdGU6XG5cdFx0XHRcdC8vXHRpZiEgY29uZFxuXHRcdFx0XHQvL1x0XHRhLiBiXG5cdFx0XHRcdC8vIGluIGEgbW9kdWxlIGNvbnRleHQsIGl0IHdpbGwgYmUgYW4gZXJyb3IuIChUaGUgbW9kdWxlIGNyZWF0ZXMgbm8gYGJ1aWx0YCBsb2NhbC4pXG5cdFx0XHRcdGNvbnN0IGdldExpbmVFeHBvcnRzID0gbGluZSA9PiB7XG5cdFx0XHRcdFx0aWYgKGxpbmUgaW5zdGFuY2VvZiBPYmpFbnRyeUFzc2lnbikge1xuXHRcdFx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIGxpbmUuYXNzaWduLmFsbEFzc2lnbmVlcygpKVxuXHRcdFx0XHRcdFx0XHRpZiAoXy5uYW1lID09PSBtb2R1bGVOYW1lKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29udGV4dC5jaGVjayhvcERlZmF1bHRFeHBvcnQgPT09IG51bGwsIF8ubG9jLCAoKSA9PlxuXHRcdFx0XHRcdFx0XHRcdFx0YERlZmF1bHQgZXhwb3J0IGFscmVhZHkgZGVjbGFyZWQgYXQgJHtvcERlZmF1bHRFeHBvcnQubG9jfWApXG5cdFx0XHRcdFx0XHRcdFx0b3BEZWZhdWx0RXhwb3J0ID0gbmV3IExvY2FsQWNjZXNzKF8ubG9jLCBfLm5hbWUpXG5cdFx0XHRcdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdFx0XHRcdGV4cG9ydHMucHVzaChfKVxuXHRcdFx0XHRcdFx0cmV0dXJuIGxpbmUuYXNzaWduXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChsaW5lIGluc3RhbmNlb2YgRGVidWcpXG5cdFx0XHRcdFx0XHRsaW5lLmxpbmVzID0gbGluZS5saW5lcy5tYXAoZ2V0TGluZUV4cG9ydHMpXG5cdFx0XHRcdFx0cmV0dXJuIGxpbmVcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IG1vZHVsZUxpbmVzID0gbGluZXMubWFwKGdldExpbmVFeHBvcnRzKVxuXG5cdFx0XHRcdGlmIChpc0VtcHR5KGV4cG9ydHMpICYmIG9wRGVmYXVsdEV4cG9ydCA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdGNvbnN0IFsgbGluZXMsIG9wRGVmYXVsdEV4cG9ydCBdID0gX3RyeVRha2VMYXN0VmFsKG1vZHVsZUxpbmVzKVxuXHRcdFx0XHRcdHJldHVybiB7IGxpbmVzLCBleHBvcnRzLCBvcERlZmF1bHRFeHBvcnQgfVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRyZXR1cm4geyBsaW5lczogbW9kdWxlTGluZXMsIGV4cG9ydHMsIG9wRGVmYXVsdEV4cG9ydCB9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cbi8vIHBhcnNlQmxvY2sgcHJpdmF0ZXNcbmNvbnN0XG5cdF90cnlUYWtlTGFzdFZhbCA9IGxpbmVzID0+XG5cdFx0IWlzRW1wdHkobGluZXMpICYmIGxhc3QobGluZXMpIGluc3RhbmNlb2YgVmFsID9cblx0XHRcdFsgcnRhaWwobGluZXMpLCBsYXN0KGxpbmVzKSBdIDpcblx0XHRcdFsgbGluZXMsIG51bGwgXSxcblxuXHRfcGxhaW5CbG9ja0xpbmVzID0gbGluZVRva2VucyA9PiB7XG5cdFx0Y29uc3QgbGluZXMgPSBbIF1cblx0XHRjb25zdCBhZGRMaW5lID0gbGluZSA9PiB7XG5cdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIEFycmF5KVxuXHRcdFx0XHRmb3IgKGNvbnN0IF8gb2YgbGluZSlcblx0XHRcdFx0XHRhZGRMaW5lKF8pXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGxpbmVzLnB1c2gobGluZSlcblx0XHR9XG5cdFx0Zm9yIChjb25zdCBfIG9mIGxpbmVUb2tlbnMpXG5cdFx0XHRhZGRMaW5lKHBhcnNlTGluZShTbGljZS5ncm91cChfKSkpXG5cdFx0cmV0dXJuIGxpbmVzXG5cdH0sXG5cblx0S1JldHVybl9QbGFpbiA9IDAsXG5cdEtSZXR1cm5fT2JqID0gMSxcblx0S1JldHVybl9CYWcgPSAyLFxuXHRLUmV0dXJuX01hcCA9IDMsXG5cdF9wYXJzZUJsb2NrTGluZXMgPSBsaW5lVG9rZW5zID0+IHtcblx0XHRsZXQgaXNCYWcgPSBmYWxzZSwgaXNNYXAgPSBmYWxzZSwgaXNPYmogPSBmYWxzZVxuXHRcdGNvbnN0IGNoZWNrTGluZSA9IGxpbmUgPT4ge1xuXHRcdFx0aWYgKGxpbmUgaW5zdGFuY2VvZiBEZWJ1Zylcblx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIGxpbmUubGluZXMpXG5cdFx0XHRcdFx0Y2hlY2tMaW5lKF8pXG5cdFx0XHRlbHNlIGlmIChsaW5lIGluc3RhbmNlb2YgQmFnRW50cnkpXG5cdFx0XHRcdGlzQmFnID0gdHJ1ZVxuXHRcdFx0ZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIE1hcEVudHJ5KVxuXHRcdFx0XHRpc01hcCA9IHRydWVcblx0XHRcdGVsc2UgaWYgKGxpbmUgaW5zdGFuY2VvZiBPYmpFbnRyeSlcblx0XHRcdFx0aXNPYmogPSB0cnVlXG5cdFx0fVxuXHRcdGNvbnN0IGxpbmVzID0gX3BsYWluQmxvY2tMaW5lcyhsaW5lVG9rZW5zKVxuXHRcdGZvciAoY29uc3QgXyBvZiBsaW5lcylcblx0XHRcdGNoZWNrTGluZShfKVxuXG5cdFx0Y29udGV4dC5jaGVjayghKGlzT2JqICYmIGlzQmFnKSwgbGluZXMubG9jLCAnQmxvY2sgaGFzIGJvdGggQmFnIGFuZCBPYmogbGluZXMuJylcblx0XHRjb250ZXh0LmNoZWNrKCEoaXNPYmogJiYgaXNNYXApLCBsaW5lcy5sb2MsICdCbG9jayBoYXMgYm90aCBPYmogYW5kIE1hcCBsaW5lcy4nKVxuXHRcdGNvbnRleHQuY2hlY2soIShpc0JhZyAmJiBpc01hcCksIGxpbmVzLmxvYywgJ0Jsb2NrIGhhcyBib3RoIEJhZyBhbmQgTWFwIGxpbmVzLicpXG5cblx0XHRjb25zdCBrUmV0dXJuID1cblx0XHRcdGlzT2JqID8gS1JldHVybl9PYmogOiBpc0JhZyA/IEtSZXR1cm5fQmFnIDogaXNNYXAgPyBLUmV0dXJuX01hcCA6IEtSZXR1cm5fUGxhaW5cblx0XHRyZXR1cm4geyBsaW5lcywga1JldHVybiB9XG5cdH1cblxuY29uc3QgcGFyc2VDYXNlID0gKGlzVmFsLCBjYXNlZEZyb21GdW4sIHRva2VucykgPT4ge1xuXHRjb25zdCBbIGJlZm9yZSwgYmxvY2sgXSA9IGJlZm9yZUFuZEJsb2NrKHRva2VucylcblxuXHRsZXQgb3BDYXNlZFxuXHRpZiAoY2FzZWRGcm9tRnVuKSB7XG5cdFx0Y2hlY2tFbXB0eShiZWZvcmUsICdDYW5cXCd0IG1ha2UgZm9jdXMgLS0gaXMgaW1wbGljaXRseSBwcm92aWRlZCBhcyBmaXJzdCBhcmd1bWVudC4nKVxuXHRcdG9wQ2FzZWQgPSBudWxsXG5cdH0gZWxzZVxuXHRcdG9wQ2FzZWQgPSBvcElmKCFiZWZvcmUuaXNFbXB0eSgpLCAoKSA9PiBBc3NpZ25TaW5nbGUuZm9jdXMoYmVmb3JlLmxvYywgcGFyc2VFeHByKGJlZm9yZSkpKVxuXG5cdGNvbnN0IGxhc3RMaW5lID0gU2xpY2UuZ3JvdXAoYmxvY2subGFzdCgpKVxuXHRjb25zdCBbIHBhcnRMaW5lcywgb3BFbHNlIF0gPSBpc0tleXdvcmQoS1dfRWxzZSwgbGFzdExpbmUuaGVhZCgpKSA/XG5cdFx0WyBibG9jay5ydGFpbCgpLCAoaXNWYWwgPyBqdXN0QmxvY2tWYWwgOiBqdXN0QmxvY2tEbykoS1dfRWxzZSwgbGFzdExpbmUudGFpbCgpKSBdIDpcblx0XHRbIGJsb2NrLCBudWxsIF1cblxuXHRjb25zdCBwYXJ0cyA9IHBhcnRMaW5lcy5tYXBTbGljZXMoX3BhcnNlQ2FzZUxpbmUoaXNWYWwpKVxuXHRjb250ZXh0LmNoZWNrKHBhcnRzLmxlbmd0aCA+IDAsIHRva2Vucy5sb2MsICgpID0+XG5cdFx0YE11c3QgaGF2ZSBhdCBsZWFzdCAxIG5vbi0ke2NvZGUoJ2Vsc2UnKX0gdGVzdC5gKVxuXG5cdHJldHVybiBuZXcgKGlzVmFsID8gQ2FzZVZhbCA6IENhc2VEbykodG9rZW5zLmxvYywgb3BDYXNlZCwgcGFydHMsIG9wRWxzZSlcbn1cbi8vIHBhcnNlQ2FzZSBwcml2YXRlc1xuY29uc3Rcblx0X3BhcnNlQ2FzZUxpbmUgPSBpc1ZhbCA9PiBsaW5lID0+IHtcblx0XHRjb25zdCBbIGJlZm9yZSwgYmxvY2sgXSA9IGJlZm9yZUFuZEJsb2NrKGxpbmUpXG5cdFx0Y29uc3QgdGVzdCA9IF9wYXJzZUNhc2VUZXN0KGJlZm9yZSlcblx0XHRjb25zdCByZXN1bHQgPSAoaXNWYWwgPyBwYXJzZUJsb2NrVmFsIDogcGFyc2VCbG9ja0RvKShibG9jaylcblx0XHRyZXR1cm4gbmV3IChpc1ZhbCA/IENhc2VWYWxQYXJ0IDogQ2FzZURvUGFydCkobGluZS5sb2MsIHRlc3QsIHJlc3VsdClcblx0fSxcblx0X3BhcnNlQ2FzZVRlc3QgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGZpcnN0ID0gdG9rZW5zLmhlYWQoKVxuXHRcdC8vIFBhdHRlcm4gbWF0Y2ggc3RhcnRzIHdpdGggdHlwZSB0ZXN0IGFuZCBpcyBmb2xsb3dlZCBieSBsb2NhbCBkZWNsYXJlcy5cblx0XHQvLyBFLmcuLCBgOlNvbWUgdmFsYFxuXHRcdGlmIChpc0dyb3VwKEdfU3BhY2UsIGZpcnN0KSAmJiB0b2tlbnMuc2l6ZSgpID4gMSkge1xuXHRcdFx0Y29uc3QgZnQgPSBTbGljZS5ncm91cChmaXJzdClcblx0XHRcdGlmIChpc0tleXdvcmQoS1dfVHlwZSwgZnQuaGVhZCgpKSkge1xuXHRcdFx0XHRjb25zdCB0eXBlID0gcGFyc2VTcGFjZWQoZnQudGFpbCgpKVxuXHRcdFx0XHRjb25zdCBsb2NhbHMgPSBwYXJzZUxvY2FsRGVjbGFyZXModG9rZW5zLnRhaWwoKSlcblx0XHRcdFx0cmV0dXJuIG5ldyBQYXR0ZXJuKGZpcnN0LmxvYywgdHlwZSwgbG9jYWxzLCBMb2NhbEFjY2Vzcy5mb2N1cyh0b2tlbnMubG9jKSlcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHBhcnNlRXhwcih0b2tlbnMpXG5cdH1cblxuY29uc3QgcGFyc2VTd2l0Y2ggPSAoaXNWYWwsIHRva2VucykgPT4ge1xuXHRjb25zdCBbIGJlZm9yZSwgYmxvY2sgXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0Y29uc3Qgc3dpdGNoZWQgPSBwYXJzZUV4cHIoYmVmb3JlKVxuXHRjb25zdCBsYXN0TGluZSA9IFNsaWNlLmdyb3VwKGJsb2NrLmxhc3QoKSlcblx0Y29uc3QgWyBwYXJ0TGluZXMsIG9wRWxzZSBdID0gaXNLZXl3b3JkKEtXX0Vsc2UsIGxhc3RMaW5lLmhlYWQoKSkgP1xuXHRcdFsgYmxvY2sucnRhaWwoKSwgKGlzVmFsID8ganVzdEJsb2NrVmFsIDoganVzdEJsb2NrRG8pKEtXX0Vsc2UsIGxhc3RMaW5lLnRhaWwoKSkgXSA6XG5cdFx0WyBibG9jaywgbnVsbCBdXG5cblx0Y29uc3QgcGFydHMgPSBwYXJ0TGluZXMubWFwU2xpY2VzKF9wYXJzZVN3aXRjaExpbmUoaXNWYWwpKVxuXHRjb250ZXh0LmNoZWNrKHBhcnRzLmxlbmd0aCA+IDAsIHRva2Vucy5sb2MsICgpID0+XG5cdFx0YE11c3QgaGF2ZSBhdCBsZWFzdCAxIG5vbi0ke2NvZGUoJ2Vsc2UnKX0gdGVzdC5gKVxuXG5cdHJldHVybiBuZXcgKGlzVmFsID8gU3dpdGNoVmFsIDogU3dpdGNoRG8pKHRva2Vucy5sb2MsIHN3aXRjaGVkLCBwYXJ0cywgb3BFbHNlKVxufVxuY29uc3Rcblx0X3BhcnNlU3dpdGNoTGluZSA9IGlzVmFsID0+IGxpbmUgPT4ge1xuXHRcdGNvbnN0IFsgYmVmb3JlLCBibG9jayBdID0gYmVmb3JlQW5kQmxvY2sobGluZSlcblxuXHRcdGxldCB2YWx1ZXNcblx0XHRpZiAoaXNLZXl3b3JkKEtXX09yLCBiZWZvcmUuaGVhZCgpKSlcblx0XHRcdHZhbHVlcyA9IGJlZm9yZS50YWlsKCkubWFwKHBhcnNlU2luZ2xlKVxuXHRcdGVsc2Vcblx0XHRcdHZhbHVlcyA9IFsgcGFyc2VFeHByKGJlZm9yZSkgXVxuXG5cdFx0Y29uc3QgcmVzdWx0ID0gKGlzVmFsID8gcGFyc2VCbG9ja1ZhbCA6IHBhcnNlQmxvY2tEbykoYmxvY2spXG5cdFx0cmV0dXJuIG5ldyAoaXNWYWwgPyBTd2l0Y2hWYWxQYXJ0IDogU3dpdGNoRG9QYXJ0KShsaW5lLmxvYywgdmFsdWVzLCByZXN1bHQpXG5cdH1cblxuY29uc3Rcblx0cGFyc2VFeHByID0gdG9rZW5zID0+IHtcblx0XHRyZXR1cm4gaWZFbHNlKHRva2Vucy5vcFNwbGl0TWFueVdoZXJlKF8gPT4gaXNLZXl3b3JkKEtXX09iakFzc2lnbiwgXykpLFxuXHRcdFx0c3BsaXRzID0+IHtcblx0XHRcdFx0Ly8gU2hvcnQgb2JqZWN0IGZvcm0sIHN1Y2ggYXMgKGEuIDEsIGIuIDIpXG5cdFx0XHRcdGNvbnN0IGZpcnN0ID0gc3BsaXRzWzBdLmJlZm9yZVxuXHRcdFx0XHRjaGVja05vbkVtcHR5KGZpcnN0LCAoKSA9PiBgVW5leHBlY3RlZCAke3NwbGl0c1swXS5hdH1gKVxuXHRcdFx0XHRjb25zdCB0b2tlbnNDYWxsZXIgPSBmaXJzdC5ydGFpbCgpXG5cblx0XHRcdFx0Y29uc3QgcGFpcnMgPSBbIF1cblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzcGxpdHMubGVuZ3RoIC0gMTsgaSA9IGkgKyAxKSB7XG5cdFx0XHRcdFx0Y29uc3QgbmFtZSA9IHNwbGl0c1tpXS5iZWZvcmUubGFzdCgpXG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayhuYW1lIGluc3RhbmNlb2YgTmFtZSwgbmFtZS5sb2MsICgpID0+XG5cdFx0XHRcdFx0XHRgRXhwZWN0ZWQgYSBuYW1lLCBub3QgJHtuYW1lfWApXG5cdFx0XHRcdFx0Y29uc3QgdG9rZW5zVmFsdWUgPSBpID09PSBzcGxpdHMubGVuZ3RoIC0gMiA/XG5cdFx0XHRcdFx0XHRzcGxpdHNbaSArIDFdLmJlZm9yZSA6XG5cdFx0XHRcdFx0XHRzcGxpdHNbaSArIDFdLmJlZm9yZS5ydGFpbCgpXG5cdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBwYXJzZUV4cHJQbGFpbih0b2tlbnNWYWx1ZSlcblx0XHRcdFx0XHRjb25zdCBsb2MgPSBuZXcgTG9jKG5hbWUubG9jLnN0YXJ0LCB0b2tlbnNWYWx1ZS5sb2MuZW5kKVxuXHRcdFx0XHRcdHBhaXJzLnB1c2gobmV3IE9ialBhaXIobG9jLCBuYW1lLm5hbWUsIHZhbHVlKSlcblx0XHRcdFx0fVxuXHRcdFx0XHRhc3NlcnQobGFzdChzcGxpdHMpLmF0ID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdGNvbnN0IHZhbCA9IG5ldyBPYmpTaW1wbGUodG9rZW5zLmxvYywgcGFpcnMpXG5cdFx0XHRcdGlmICh0b2tlbnNDYWxsZXIuaXNFbXB0eSgpKVxuXHRcdFx0XHRcdHJldHVybiB2YWxcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyh0b2tlbnNDYWxsZXIpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBDYWxsKHRva2Vucy5sb2MsIGhlYWQocGFydHMpLCBwdXNoKHRhaWwocGFydHMpLCB2YWwpKVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0KCkgPT4gcGFyc2VFeHByUGxhaW4odG9rZW5zKVxuXHRcdClcblx0fSxcblxuXHRwYXJzZUV4cHJQbGFpbiA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyh0b2tlbnMpXG5cdFx0c3dpdGNoIChwYXJ0cy5sZW5ndGgpIHtcblx0XHRcdGNhc2UgMDpcblx0XHRcdFx0Y29udGV4dC5mYWlsKHRva2Vucy5sb2MsICdFeHBlY3RlZCBhbiBleHByZXNzaW9uLCBnb3Qgbm90aGluZy4nKVxuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRyZXR1cm4gaGVhZChwYXJ0cylcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBuZXcgQ2FsbCh0b2tlbnMubG9jLCBoZWFkKHBhcnRzKSwgdGFpbChwYXJ0cykpXG5cdFx0fVxuXHR9LFxuXG5cdHBhcnNlRXhwclBhcnRzID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBvcFNwbGl0ID0gdG9rZW5zLm9wU3BsaXRPbmNlV2hlcmUodG9rZW4gPT4ge1xuXHRcdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRcdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRcdFx0Y2FzZSBLV19BbmQ6IGNhc2UgS1dfQ2FzZVZhbDogY2FzZSBLV19DbGFzczogY2FzZSBLV19FeGNlcHRWYWw6IGNhc2UgS1dfRm9yQmFnOlxuXHRcdFx0XHRcdGNhc2UgS1dfRm9yVmFsOiBjYXNlIEtXX0Z1bjogY2FzZSBLV19GdW5EbzogY2FzZSBLV19GdW5HZW46IGNhc2UgS1dfRnVuR2VuRG86XG5cdFx0XHRcdFx0Y2FzZSBLV19GdW5UaGlzOiBjYXNlIEtXX0Z1blRoaXNEbzogY2FzZSBLV19GdW5UaGlzR2VuOiBjYXNlIEtXX0Z1blRoaXNHZW5Ebzpcblx0XHRcdFx0XHRjYXNlIEtXX0lmVmFsOiBjYXNlIEtXX05ldzogY2FzZSBLV19Ob3Q6IGNhc2UgS1dfT3I6IGNhc2UgS1dfU3dpdGNoVmFsOlxuXHRcdFx0XHRcdGNhc2UgS1dfVW5sZXNzVmFsOiBjYXNlIEtXX1dpdGg6IGNhc2UgS1dfWWllbGQ6IGNhc2UgS1dfWWllbGRUbzpcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHR9KVxuXHRcdHJldHVybiBpZkVsc2Uob3BTcGxpdCxcblx0XHRcdCh7IGJlZm9yZSwgYXQsIGFmdGVyIH0pID0+IHtcblx0XHRcdFx0Y29uc3QgZ2V0TGFzdCA9ICgpID0+IHtcblx0XHRcdFx0XHRzd2l0Y2ggKGF0LmtpbmQpIHtcblx0XHRcdFx0XHRcdGNhc2UgS1dfQW5kOiBjYXNlIEtXX09yOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV3IExvZ2ljKGF0LmxvYywgYXQua2luZCA9PT0gS1dfQW5kID8gTF9BbmQgOiBMX09yLFxuXHRcdFx0XHRcdFx0XHRcdHBhcnNlRXhwclBhcnRzKGFmdGVyKSlcblx0XHRcdFx0XHRcdGNhc2UgS1dfQ2FzZVZhbDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlQ2FzZSh0cnVlLCBmYWxzZSwgYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX0NsYXNzOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VDbGFzcyhhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfRXhjZXB0VmFsOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VFeGNlcHQoS1dfRXhjZXB0VmFsLCBhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfRm9yQmFnOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VGb3JCYWcoYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX0ZvclZhbDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlRm9yVmFsKGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19GdW46IGNhc2UgS1dfRnVuRG86IGNhc2UgS1dfRnVuR2VuOiBjYXNlIEtXX0Z1bkdlbkRvOlxuXHRcdFx0XHRcdFx0Y2FzZSBLV19GdW5UaGlzOiBjYXNlIEtXX0Z1blRoaXNEbzogY2FzZSBLV19GdW5UaGlzR2VuOlxuXHRcdFx0XHRcdFx0Y2FzZSBLV19GdW5UaGlzR2VuRG86XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUZ1bihhdC5raW5kLCBhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfSWZWYWw6IGNhc2UgS1dfVW5sZXNzVmFsOiB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IFsgYmVmb3JlLCBibG9jayBdID0gYmVmb3JlQW5kQmxvY2soYWZ0ZXIpXG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgQ29uZGl0aW9uYWxWYWwodG9rZW5zLmxvYyxcblx0XHRcdFx0XHRcdFx0XHRwYXJzZUV4cHJQbGFpbihiZWZvcmUpLFxuXHRcdFx0XHRcdFx0XHRcdHBhcnNlQmxvY2tWYWwoYmxvY2spLFxuXHRcdFx0XHRcdFx0XHRcdGF0LmtpbmQgPT09IEtXX1VubGVzc1ZhbClcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNhc2UgS1dfTmV3OiB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHMoYWZ0ZXIpXG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgTmV3KGF0LmxvYywgcGFydHNbMF0sIHRhaWwocGFydHMpKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19Ob3Q6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgTm90KGF0LmxvYywgcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19Td2l0Y2hWYWw6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZVN3aXRjaCh0cnVlLCBhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfV2l0aDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlV2l0aChhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfWWllbGQ6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgWWllbGQoYXQubG9jLFxuXHRcdFx0XHRcdFx0XHRcdG9wSWYoIWFmdGVyLmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKSlcblx0XHRcdFx0XHRcdGNhc2UgS1dfWWllbGRUbzpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBZaWVsZFRvKGF0LmxvYywgcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKVxuXHRcdFx0XHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKGF0LmtpbmQpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBwdXNoKGJlZm9yZS5tYXAocGFyc2VTaW5nbGUpLCBnZXRMYXN0KCkpXG5cdFx0XHR9LFxuXHRcdFx0KCkgPT4gdG9rZW5zLm1hcChwYXJzZVNpbmdsZSkpXG5cdH1cblxuY29uc3QgcGFyc2VGdW4gPSAoa2luZCwgdG9rZW5zKSA9PiB7XG5cdGxldCBpc1RoaXMgPSBmYWxzZSwgaXNEbyA9IGZhbHNlLCBpc0dlbiA9IGZhbHNlXG5cdHN3aXRjaCAoa2luZCkge1xuXHRcdGNhc2UgS1dfRnVuOlxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1bkRvOlxuXHRcdFx0aXNEbyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5HZW46XG5cdFx0XHRpc0dlbiA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5HZW5Ebzpcblx0XHRcdGlzR2VuID0gdHJ1ZVxuXHRcdFx0aXNEbyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5UaGlzOlxuXHRcdFx0aXNUaGlzID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1blRoaXNEbzpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuVGhpc0dlbjpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGlzR2VuID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1blRoaXNHZW5Ebzpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGlzR2VuID0gdHJ1ZVxuXHRcdFx0aXNEbyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKClcblx0fVxuXHRjb25zdCBvcERlY2xhcmVUaGlzID0gb3BJZihpc1RoaXMsICgpID0+IG5ldyBMb2NhbERlY2xhcmVUaGlzKHRva2Vucy5sb2MpKVxuXG5cdGNvbnN0IHsgb3BSZXR1cm5UeXBlLCByZXN0IH0gPSBfdHJ5VGFrZVJldHVyblR5cGUodG9rZW5zKVxuXHRjb25zdCB7IGFyZ3MsIG9wUmVzdEFyZywgYmxvY2ssIG9wSW4sIG9wT3V0IH0gPSBfZnVuQXJnc0FuZEJsb2NrKGlzRG8sIHJlc3QpXG5cdC8vIE5lZWQgcmVzIGRlY2xhcmUgaWYgdGhlcmUgaXMgYSByZXR1cm4gdHlwZSBvciBvdXQgY29uZGl0aW9uLlxuXHRjb25zdCBvcERlY2xhcmVSZXMgPSBpZkVsc2Uob3BSZXR1cm5UeXBlLFxuXHRcdF8gPT4gbmV3IExvY2FsRGVjbGFyZVJlcyhfLmxvYywgXyksXG5cdFx0KCkgPT4gb3BNYXAob3BPdXQsIF8gPT4gbmV3IExvY2FsRGVjbGFyZVJlcyhfLmxvYywgbnVsbCkpKVxuXHRyZXR1cm4gbmV3IEZ1bih0b2tlbnMubG9jLFxuXHRcdG9wRGVjbGFyZVRoaXMsIGlzR2VuLCBhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBvcEluLCBvcERlY2xhcmVSZXMsIG9wT3V0KVxufVxuXG4vLyBwYXJzZUZ1biBwcml2YXRlc1xuY29uc3Rcblx0X3RyeVRha2VSZXR1cm5UeXBlID0gdG9rZW5zID0+IHtcblx0XHRpZiAoIXRva2Vucy5pc0VtcHR5KCkpIHtcblx0XHRcdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpXG5cdFx0XHRpZiAoaXNHcm91cChHX1NwYWNlLCBoKSAmJiBpc0tleXdvcmQoS1dfVHlwZSwgaGVhZChoLnN1YlRva2VucykpKVxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdG9wUmV0dXJuVHlwZTogcGFyc2VTcGFjZWQoU2xpY2UuZ3JvdXAoaCkudGFpbCgpKSxcblx0XHRcdFx0XHRyZXN0OiB0b2tlbnMudGFpbCgpXG5cdFx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHsgb3BSZXR1cm5UeXBlOiBudWxsLCByZXN0OiB0b2tlbnMgfVxuXHR9LFxuXG5cdF9mdW5BcmdzQW5kQmxvY2sgPSAoaXNEbywgdG9rZW5zKSA9PiB7XG5cdFx0Y2hlY2tOb25FbXB0eSh0b2tlbnMsICdFeHBlY3RlZCBhbiBpbmRlbnRlZCBibG9jay4nKVxuXHRcdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpXG5cdFx0Ly8gTWlnaHQgYmUgYHxjYXNlYFxuXHRcdGlmIChoIGluc3RhbmNlb2YgS2V5d29yZCAmJiAoaC5raW5kID09PSBLV19DYXNlVmFsIHx8IGgua2luZCA9PT0gS1dfQ2FzZURvKSkge1xuXHRcdFx0Y29uc3QgZUNhc2UgPSBwYXJzZUNhc2UoaC5raW5kID09PSBLV19DYXNlVmFsLCB0cnVlLCB0b2tlbnMudGFpbCgpKVxuXHRcdFx0Y29uc3QgYXJncyA9IFsgbmV3IExvY2FsRGVjbGFyZUZvY3VzKGgubG9jKSBdXG5cdFx0XHRyZXR1cm4gaC5raW5kID09PSBLV19DYXNlVmFsID9cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGFyZ3MsIG9wUmVzdEFyZzogbnVsbCwgb3BJbjogbnVsbCwgb3BPdXQ6IG51bGwsXG5cdFx0XHRcdFx0YmxvY2s6IG5ldyBCbG9ja1dpdGhSZXR1cm4odG9rZW5zLmxvYywgWyBdLCBlQ2FzZSlcblx0XHRcdFx0fSA6XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhcmdzLCBvcFJlc3RBcmc6IG51bGwsIG9wSW46IG51bGwsIG9wT3V0OiBudWxsLFxuXHRcdFx0XHRcdGJsb2NrOiBuZXcgQmxvY2tEbyh0b2tlbnMubG9jLCBbIGVDYXNlIF0pXG5cdFx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgWyBiZWZvcmUsIGJsb2NrTGluZXMgXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0XHRcdGNvbnN0IHsgYXJncywgb3BSZXN0QXJnIH0gPSBfcGFyc2VGdW5Mb2NhbHMoYmVmb3JlKVxuXHRcdFx0Zm9yIChjb25zdCBhcmcgb2YgYXJncylcblx0XHRcdFx0aWYgKCFhcmcuaXNMYXp5KCkpXG5cdFx0XHRcdFx0YXJnLmtpbmQgPSBMRF9NdXRhYmxlXG5cdFx0XHRjb25zdCBbIG9wSW4sIHJlc3QwIF0gPSBfdHJ5VGFrZUluT3JPdXQoS1dfSW4sIGJsb2NrTGluZXMpXG5cdFx0XHRjb25zdCBbIG9wT3V0LCByZXN0MSBdID0gX3RyeVRha2VJbk9yT3V0KEtXX091dCwgcmVzdDApXG5cdFx0XHRjb25zdCBibG9jayA9IChpc0RvID8gcGFyc2VCbG9ja0RvIDogcGFyc2VCbG9ja1ZhbCkocmVzdDEpXG5cdFx0XHRyZXR1cm4geyBhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBvcEluLCBvcE91dCB9XG5cdFx0fVxuXHR9LFxuXG5cdF9wYXJzZUZ1bkxvY2FscyA9IHRva2VucyA9PiB7XG5cdFx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0XHRyZXR1cm4geyBhcmdzOiBbXSwgb3BSZXN0QXJnOiBudWxsIH1cblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IGwgPSB0b2tlbnMubGFzdCgpXG5cdFx0XHRpZiAobCBpbnN0YW5jZW9mIERvdE5hbWUpIHtcblx0XHRcdFx0Y29udGV4dC5jaGVjayhsLm5Eb3RzID09PSAzLCBsLmxvYywgJ1NwbGF0IGFyZ3VtZW50IG11c3QgaGF2ZSBleGFjdGx5IDMgZG90cycpXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0YXJnczogcGFyc2VMb2NhbERlY2xhcmVzKHRva2Vucy5ydGFpbCgpKSxcblx0XHRcdFx0XHRvcFJlc3RBcmc6IExvY2FsRGVjbGFyZS5wbGFpbihsLmxvYywgbC5uYW1lKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHJldHVybiB7IGFyZ3M6IHBhcnNlTG9jYWxEZWNsYXJlcyh0b2tlbnMpLCBvcFJlc3RBcmc6IG51bGwgfVxuXHRcdH1cblx0fSxcblxuXHRfdHJ5VGFrZUluT3JPdXQgPSAoaW5Pck91dCwgdG9rZW5zKSA9PiB7XG5cdFx0aWYgKCF0b2tlbnMuaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCBmaXJzdExpbmUgPSB0b2tlbnMuaGVhZFNsaWNlKClcblx0XHRcdGlmIChpc0tleXdvcmQoaW5Pck91dCwgZmlyc3RMaW5lLmhlYWQoKSkpIHtcblx0XHRcdFx0Y29uc3QgaW5PdXQgPSBuZXcgRGVidWcoXG5cdFx0XHRcdFx0Zmlyc3RMaW5lLmxvYyxcblx0XHRcdFx0XHRwYXJzZUxpbmVzRnJvbUJsb2NrKGZpcnN0TGluZSkpXG5cdFx0XHRcdHJldHVybiBbIGluT3V0LCB0b2tlbnMudGFpbCgpIF1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIFsgbnVsbCwgdG9rZW5zIF1cblx0fVxuXG5jb25zdFxuXHRwYXJzZUxpbmUgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGhlYWQgPSB0b2tlbnMuaGVhZCgpXG5cdFx0Y29uc3QgcmVzdCA9IHRva2Vucy50YWlsKClcblxuXHRcdGNvbnN0IG5vUmVzdCA9ICgpID0+XG5cdFx0XHRjaGVja0VtcHR5KHJlc3QsICgpID0+IGBEaWQgbm90IGV4cGVjdCBhbnl0aGluZyBhZnRlciAke2hlYWR9YClcblxuXHRcdC8vIFdlIG9ubHkgZGVhbCB3aXRoIG11dGFibGUgZXhwcmVzc2lvbnMgaGVyZSwgb3RoZXJ3aXNlIHdlIGZhbGwgYmFjayB0byBwYXJzZUV4cHIuXG5cdFx0aWYgKGhlYWQgaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdFx0c3dpdGNoIChoZWFkLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBLV19Bc3NlcnQ6IGNhc2UgS1dfQXNzZXJ0Tm90OlxuXHRcdFx0XHRcdHJldHVybiBwYXJzZUFzc2VydChoZWFkLmtpbmQgPT09IEtXX0Fzc2VydE5vdCwgcmVzdClcblx0XHRcdFx0Y2FzZSBLV19FeGNlcHREbzpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VFeGNlcHQoS1dfRXhjZXB0RG8sIHJlc3QpXG5cdFx0XHRcdGNhc2UgS1dfQnJlYWs6XG5cdFx0XHRcdFx0bm9SZXN0KClcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEJyZWFrKHRva2Vucy5sb2MpXG5cdFx0XHRcdGNhc2UgS1dfQnJlYWtXaXRoVmFsOlxuXHRcdFx0XHRcdHJldHVybiBuZXcgQnJlYWtXaXRoVmFsKHRva2Vucy5sb2MsIHBhcnNlRXhwcihyZXN0KSlcblx0XHRcdFx0Y2FzZSBLV19DYXNlRG86XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlQ2FzZShmYWxzZSwgZmFsc2UsIHJlc3QpXG5cdFx0XHRcdGNhc2UgS1dfRGVidWc6XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBEZWJ1Zyh0b2tlbnMubG9jLFxuXHRcdFx0XHRcdFx0aXNHcm91cChHX0Jsb2NrLCB0b2tlbnMuc2Vjb25kKCkpID9cblx0XHRcdFx0XHRcdC8vIGBkZWJ1Z2AsIHRoZW4gaW5kZW50ZWQgYmxvY2tcblx0XHRcdFx0XHRcdHBhcnNlTGluZXNGcm9tQmxvY2soKSA6XG5cdFx0XHRcdFx0XHQvLyBgZGVidWdgLCB0aGVuIHNpbmdsZSBsaW5lXG5cdFx0XHRcdFx0XHRwYXJzZUxpbmVPckxpbmVzKHJlc3QpKVxuXHRcdFx0XHRjYXNlIEtXX0RlYnVnZ2VyOlxuXHRcdFx0XHRcdG5vUmVzdCgpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBTcGVjaWFsRG8odG9rZW5zLmxvYywgU0RfRGVidWdnZXIpXG5cdFx0XHRcdGNhc2UgS1dfRWxsaXBzaXM6XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBCYWdFbnRyeU1hbnkodG9rZW5zLmxvYywgcGFyc2VFeHByKHJlc3QpKVxuXHRcdFx0XHRjYXNlIEtXX0ZvckRvOlxuXHRcdFx0XHRcdHJldHVybiBwYXJzZUZvckRvKHJlc3QpXG5cdFx0XHRcdGNhc2UgS1dfSWdub3JlOlxuXHRcdFx0XHRcdHJldHVybiBwYXJzZUlnbm9yZShyZXN0KVxuXHRcdFx0XHRjYXNlIEtXX0lmRG86IGNhc2UgS1dfVW5sZXNzRG86IHtcblx0XHRcdFx0XHRjb25zdCBbIGJlZm9yZSwgYmxvY2sgXSA9IGJlZm9yZUFuZEJsb2NrKHJlc3QpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbERvKHRva2Vucy5sb2MsXG5cdFx0XHRcdFx0XHRwYXJzZUV4cHIoYmVmb3JlKSxcblx0XHRcdFx0XHRcdHBhcnNlQmxvY2tEbyhibG9jayksXG5cdFx0XHRcdFx0XHRoZWFkLmtpbmQgPT09IEtXX1VubGVzc0RvKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgS1dfT2JqQXNzaWduOlxuXHRcdFx0XHRcdHJldHVybiBuZXcgQmFnRW50cnkodG9rZW5zLmxvYywgcGFyc2VFeHByKHJlc3QpKVxuXHRcdFx0XHRjYXNlIEtXX1Bhc3M6XG5cdFx0XHRcdFx0bm9SZXN0KClcblx0XHRcdFx0XHRyZXR1cm4gWyBdXG5cdFx0XHRcdGNhc2UgS1dfUmVnaW9uOlxuXHRcdFx0XHRcdHJldHVybiBwYXJzZUxpbmVzRnJvbUJsb2NrKHRva2Vucylcblx0XHRcdFx0Y2FzZSBLV19Td2l0Y2hEbzpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VTd2l0Y2goZmFsc2UsIHJlc3QpXG5cdFx0XHRcdGNhc2UgS1dfVGhyb3c6XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBUaHJvdyh0b2tlbnMubG9jLCBvcElmKCFyZXN0LmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByKHJlc3QpKSlcblx0XHRcdFx0Y2FzZSBLV19OYW1lOlxuXHRcdFx0XHRcdGlmIChpc0tleXdvcmQoS1dfT2JqQXNzaWduLCByZXN0LmhlYWQoKSkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IHIgPSByZXN0LnRhaWwoKVxuXHRcdFx0XHRcdFx0Y29uc3QgdmFsID0gci5pc0VtcHR5KCkgPyBuZXcgU3BlY2lhbFZhbCh0b2tlbnMubG9jLCBTVl9OYW1lKSA6IHBhcnNlRXhwcihyKVxuXHRcdFx0XHRcdFx0cmV0dXJuIE9iakVudHJ5Q29tcHV0ZWQubmFtZSh0b2tlbnMubG9jLCB2YWwpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIGVsc2UgZmFsbHRocm91Z2hcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHQvLyBmYWxsIHRocm91Z2hcblx0XHRcdH1cblxuXHRcdHJldHVybiBpZkVsc2UodG9rZW5zLm9wU3BsaXRPbmNlV2hlcmUoX2lzTGluZVNwbGl0S2V5d29yZCksXG5cdFx0XHQoeyBiZWZvcmUsIGF0LCBhZnRlciB9KSA9PiBfcGFyc2VBc3NpZ25MaWtlKGJlZm9yZSwgYXQsIGFmdGVyLCB0b2tlbnMubG9jKSxcblx0XHRcdCgpID0+IHBhcnNlRXhwcih0b2tlbnMpKVxuXHR9LFxuXG5cdHBhcnNlTGluZU9yTGluZXMgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IF8gPSBwYXJzZUxpbmUodG9rZW5zKVxuXHRcdHJldHVybiBfIGluc3RhbmNlb2YgQXJyYXkgPyBfIDogWyBfIF1cblx0fVxuXG4vLyBwYXJzZUxpbmUgcHJpdmF0ZXNcbmNvbnN0XG5cdF9pc0xpbmVTcGxpdEtleXdvcmQgPSB0b2tlbiA9PiB7XG5cdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRcdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdFx0XHRjYXNlIEtXX0Fzc2lnbjogY2FzZSBLV19Bc3NpZ25NdXRhYmxlOiBjYXNlIEtXX0xvY2FsTXV0YXRlOlxuXHRcdFx0XHRjYXNlIEtXX01hcEVudHJ5OiBjYXNlIEtXX09iakFzc2lnbjogY2FzZSBLV19ZaWVsZDogY2FzZSBLV19ZaWVsZFRvOlxuXHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHR9XG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdH0sXG5cblx0X3BhcnNlQXNzaWduTGlrZSA9IChiZWZvcmUsIGF0LCBhZnRlciwgbG9jKSA9PiB7XG5cdFx0aWYgKGF0LmtpbmQgPT09IEtXX01hcEVudHJ5KVxuXHRcdFx0cmV0dXJuIG5ldyBNYXBFbnRyeShsb2MsIHBhcnNlRXhwcihiZWZvcmUpLCBwYXJzZUV4cHIoYWZ0ZXIpKVxuXG5cdFx0Ly8gVE9ETzogVGhpcyBjb2RlIGlzIGtpbmQgb2YgdWdseS5cblx0XHRpZiAoYmVmb3JlLnNpemUoKSA9PT0gMSkge1xuXHRcdFx0Y29uc3QgdG9rZW4gPSBiZWZvcmUuaGVhZCgpXG5cdFx0XHRpZiAodG9rZW4gaW5zdGFuY2VvZiBEb3ROYW1lKVxuXHRcdFx0XHRyZXR1cm4gX3BhcnNlTWVtYmVyU2V0KFx0TG9jYWxBY2Nlc3MudGhpcyh0b2tlbi5sb2MpLCB0b2tlbi5uYW1lLCBhdCwgYWZ0ZXIsIGxvYylcblx0XHRcdGlmIChpc0dyb3VwKEdfU3BhY2UsIHRva2VuKSkge1xuXHRcdFx0XHRjb25zdCBzcGFjZWQgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRcdFx0Y29uc3QgZG90ID0gc3BhY2VkLmxhc3QoKVxuXHRcdFx0XHRpZiAoZG90IGluc3RhbmNlb2YgRG90TmFtZSkge1xuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soZG90Lm5Eb3RzID09PSAxLCBkb3QubG9jLCAnTXVzdCBoYXZlIG9ubHkgMSBgLmAuJylcblx0XHRcdFx0XHRyZXR1cm4gX3BhcnNlTWVtYmVyU2V0KHBhcnNlU3BhY2VkKHNwYWNlZC5ydGFpbCgpKSwgZG90Lm5hbWUsIGF0LCBhZnRlciwgbG9jKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGF0LmtpbmQgPT09IEtXX0xvY2FsTXV0YXRlID9cblx0XHRcdF9wYXJzZUxvY2FsTXV0YXRlKGJlZm9yZSwgYWZ0ZXIsIGxvYykgOlxuXHRcdFx0X3BhcnNlQXNzaWduKGJlZm9yZSwgYXQsIGFmdGVyLCBsb2MpXG5cdH0sXG5cblx0X3BhcnNlTWVtYmVyU2V0ID0gKG9iamVjdCwgbmFtZSwgYXQsIGFmdGVyLCBsb2MpID0+XG5cdFx0bmV3IE1lbWJlclNldChsb2MsIG9iamVjdCwgbmFtZSwgX21lbWJlclNldEtpbmQoYXQpLCBwYXJzZUV4cHIoYWZ0ZXIpKSxcblx0X21lbWJlclNldEtpbmQgPSBhdCA9PiB7XG5cdFx0c3dpdGNoIChhdC5raW5kKSB7XG5cdFx0XHRjYXNlIEtXX0Fzc2lnbjogcmV0dXJuIE1TX05ld1xuXHRcdFx0Y2FzZSBLV19Bc3NpZ25NdXRhYmxlOiByZXR1cm4gTVNfTmV3TXV0YWJsZVxuXHRcdFx0Y2FzZSBLV19Mb2NhbE11dGF0ZTogcmV0dXJuIE1TX011dGF0ZVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKClcblx0XHR9XG5cdH0sXG5cblx0X3BhcnNlTG9jYWxNdXRhdGUgPSAobG9jYWxzVG9rZW5zLCB2YWx1ZVRva2VucywgbG9jKSA9PiB7XG5cdFx0Y29uc3QgbG9jYWxzID0gcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKGxvY2Fsc1Rva2Vucylcblx0XHRjb250ZXh0LmNoZWNrKGxvY2Fscy5sZW5ndGggPT09IDEsIGxvYywgJ1RPRE86IExvY2FsRGVzdHJ1Y3R1cmVNdXRhdGUnKVxuXHRcdGNvbnN0IG5hbWUgPSBsb2NhbHNbMF0ubmFtZVxuXHRcdGNvbnN0IHZhbHVlID0gcGFyc2VFeHByKHZhbHVlVG9rZW5zKVxuXHRcdHJldHVybiBuZXcgTG9jYWxNdXRhdGUobG9jLCBuYW1lLCB2YWx1ZSlcblx0fSxcblxuXHRfcGFyc2VBc3NpZ24gPSAobG9jYWxzVG9rZW5zLCBhc3NpZ25lciwgdmFsdWVUb2tlbnMsIGxvYykgPT4ge1xuXHRcdGNvbnN0IGtpbmQgPSBhc3NpZ25lci5raW5kXG5cdFx0Y29uc3QgbG9jYWxzID0gcGFyc2VMb2NhbERlY2xhcmVzKGxvY2Fsc1Rva2Vucylcblx0XHRjb25zdCBvcE5hbWUgPSBvcElmKGxvY2Fscy5sZW5ndGggPT09IDEsICgpID0+IGxvY2Fsc1swXS5uYW1lKVxuXHRcdGNvbnN0IHZhbHVlID0gX3BhcnNlQXNzaWduVmFsdWUoa2luZCwgb3BOYW1lLCB2YWx1ZVRva2VucylcblxuXHRcdGNvbnN0IGlzWWllbGQgPSBraW5kID09PSBLV19ZaWVsZCB8fCBraW5kID09PSBLV19ZaWVsZFRvXG5cdFx0aWYgKGlzRW1wdHkobG9jYWxzKSkge1xuXHRcdFx0Y29udGV4dC5jaGVjayhpc1lpZWxkLCBsb2NhbHNUb2tlbnMubG9jLCAnQXNzaWdubWVudCB0byBub3RoaW5nJylcblx0XHRcdHJldHVybiB2YWx1ZVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoaXNZaWVsZClcblx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIGxvY2Fscylcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKCFfLmlzTGF6eSgpLCBfLmxvYywgJ0NhbiBub3QgeWllbGQgdG8gbGF6eSB2YXJpYWJsZS4nKVxuXG5cdFx0XHRjb25zdCBpc09iakFzc2lnbiA9IGtpbmQgPT09IEtXX09iakFzc2lnblxuXG5cdFx0XHRpZiAoa2luZCA9PT0gS1dfQXNzaWduTXV0YWJsZSlcblx0XHRcdFx0Zm9yIChsZXQgXyBvZiBsb2NhbHMpIHtcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKCFfLmlzTGF6eSgpLCBfLmxvYywgJ0xhenkgbG9jYWwgY2FuIG5vdCBiZSBtdXRhYmxlLicpXG5cdFx0XHRcdFx0Xy5raW5kID0gTERfTXV0YWJsZVxuXHRcdFx0XHR9XG5cblx0XHRcdGNvbnN0IHdyYXAgPSBfID0+IGlzT2JqQXNzaWduID8gbmV3IE9iakVudHJ5QXNzaWduKGxvYywgXykgOiBfXG5cblx0XHRcdGlmIChsb2NhbHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdGNvbnN0IGFzc2lnbmVlID0gbG9jYWxzWzBdXG5cdFx0XHRcdGNvbnN0IGFzc2lnbiA9IG5ldyBBc3NpZ25TaW5nbGUobG9jLCBhc3NpZ25lZSwgdmFsdWUpXG5cdFx0XHRcdGNvbnN0IGlzVGVzdCA9IGlzT2JqQXNzaWduICYmIGFzc2lnbmVlLm5hbWUuZW5kc1dpdGgoJ3Rlc3QnKVxuXHRcdFx0XHRyZXR1cm4gaXNUZXN0ID8gbmV3IERlYnVnKGxvYywgWyB3cmFwKGFzc2lnbikgXSkgOiB3cmFwKGFzc2lnbilcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IGtpbmQgPSBsb2NhbHNbMF0ua2luZFxuXHRcdFx0XHRmb3IgKGNvbnN0IF8gb2YgbG9jYWxzKVxuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soXy5raW5kID09PSBraW5kLCBfLmxvYyxcblx0XHRcdFx0XHRcdCdBbGwgbG9jYWxzIG9mIGRlc3RydWN0dXJpbmcgYXNzaWdubWVudCBtdXN0IGJlIG9mIHRoZSBzYW1lIGtpbmQuJylcblx0XHRcdFx0cmV0dXJuIHdyYXAobmV3IEFzc2lnbkRlc3RydWN0dXJlKGxvYywgbG9jYWxzLCB2YWx1ZSwga2luZCkpXG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdF9wYXJzZUFzc2lnblZhbHVlID0gKGtpbmQsIG9wTmFtZSwgdmFsdWVUb2tlbnMpID0+IHtcblx0XHRjb25zdCB2YWx1ZSA9IHZhbHVlVG9rZW5zLmlzRW1wdHkoKSAmJiBraW5kID09PSBLV19PYmpBc3NpZ24gP1xuXHRcdFx0bmV3IFNwZWNpYWxWYWwodmFsdWVUb2tlbnMubG9jLCBTVl9OdWxsKSA6XG5cdFx0XHRwYXJzZUV4cHIodmFsdWVUb2tlbnMpXG5cdFx0c3dpdGNoIChraW5kKSB7XG5cdFx0XHRjYXNlIEtXX1lpZWxkOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFlpZWxkKHZhbHVlLmxvYywgdmFsdWUpXG5cdFx0XHRjYXNlIEtXX1lpZWxkVG86XG5cdFx0XHRcdHJldHVybiBuZXcgWWllbGRUbyh2YWx1ZS5sb2MsIHZhbHVlKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIHZhbHVlXG5cdFx0fVxuXHR9XG5cbmNvbnN0XG5cdHBhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcyA9IHRva2VucyA9PlxuXHRcdHRva2Vucy5tYXAoXyA9PiBMb2NhbERlY2xhcmUucGxhaW4oXy5sb2MsIF9wYXJzZUxvY2FsTmFtZShfKSkpLFxuXG5cdHBhcnNlTG9jYWxEZWNsYXJlcyA9IHRva2VucyA9PiB0b2tlbnMubWFwKHBhcnNlTG9jYWxEZWNsYXJlKSxcblxuXHRwYXJzZUxvY2FsRGVjbGFyZSA9IHRva2VuID0+IHtcblx0XHRpZiAoaXNHcm91cChHX1NwYWNlLCB0b2tlbikpIHtcblx0XHRcdGNvbnN0IHRva2VucyA9IFNsaWNlLmdyb3VwKHRva2VuKVxuXHRcdFx0Y29uc3QgWyByZXN0LCBpc0xhenkgXSA9XG5cdFx0XHRcdGlzS2V5d29yZChLV19MYXp5LCB0b2tlbnMuaGVhZCgpKSA/IFsgdG9rZW5zLnRhaWwoKSwgdHJ1ZSBdIDogWyB0b2tlbnMsIGZhbHNlIF1cblx0XHRcdGNvbnN0IG5hbWUgPSBfcGFyc2VMb2NhbE5hbWUocmVzdC5oZWFkKCkpXG5cdFx0XHRjb25zdCByZXN0MiA9IHJlc3QudGFpbCgpXG5cdFx0XHRjb25zdCBvcFR5cGUgPSBvcElmKCFyZXN0Mi5pc0VtcHR5KCksICgpID0+IHtcblx0XHRcdFx0Y29uc3QgY29sb24gPSByZXN0Mi5oZWFkKClcblx0XHRcdFx0Y29udGV4dC5jaGVjayhpc0tleXdvcmQoS1dfVHlwZSwgY29sb24pLCBjb2xvbi5sb2MsICgpID0+IGBFeHBlY3RlZCAke2NvZGUoJzonKX1gKVxuXHRcdFx0XHRjb25zdCB0b2tlbnNUeXBlID0gcmVzdDIudGFpbCgpXG5cdFx0XHRcdGNoZWNrTm9uRW1wdHkodG9rZW5zVHlwZSwgKCkgPT4gYEV4cGVjdGVkIHNvbWV0aGluZyBhZnRlciAke2NvbG9ufWApXG5cdFx0XHRcdHJldHVybiBwYXJzZVNwYWNlZCh0b2tlbnNUeXBlKVxuXHRcdFx0fSlcblx0XHRcdHJldHVybiBuZXcgTG9jYWxEZWNsYXJlKHRva2VuLmxvYywgbmFtZSwgb3BUeXBlLCBpc0xhenkgPyBMRF9MYXp5IDogTERfQ29uc3QpXG5cdFx0fSBlbHNlXG5cdFx0XHRyZXR1cm4gTG9jYWxEZWNsYXJlLnBsYWluKHRva2VuLmxvYywgX3BhcnNlTG9jYWxOYW1lKHRva2VuKSlcblx0fVxuXG4vLyBwYXJzZUxvY2FsRGVjbGFyZSBwcml2YXRlc1xuY29uc3Rcblx0X3BhcnNlTG9jYWxOYW1lID0gdCA9PiB7XG5cdFx0aWYgKGlzS2V5d29yZChLV19Gb2N1cywgdCkpXG5cdFx0XHRyZXR1cm4gJ18nXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKHQgaW5zdGFuY2VvZiBOYW1lLCB0LmxvYywgKCkgPT4gYEV4cGVjdGVkIGEgbG9jYWwgbmFtZSwgbm90ICR7dH1gKVxuXHRcdFx0cmV0dXJuIHQubmFtZVxuXHRcdH1cblx0fVxuXG5jb25zdCBwYXJzZVNpbmdsZSA9IHRva2VuID0+IHtcblx0Y29uc3QgeyBsb2MgfSA9IHRva2VuXG5cdGlmICh0b2tlbiBpbnN0YW5jZW9mIE5hbWUpXG5cdFx0cmV0dXJuIG5ldyBMb2NhbEFjY2Vzcyhsb2MsIHRva2VuLm5hbWUpXG5cdGVsc2UgaWYgKHRva2VuIGluc3RhbmNlb2YgR3JvdXApIHtcblx0XHRjb25zdCBzbGljZSA9IFNsaWNlLmdyb3VwKHRva2VuKVxuXHRcdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdFx0Y2FzZSBHX1NwYWNlOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VTcGFjZWQoc2xpY2UpXG5cdFx0XHRjYXNlIEdfUGFyZW50aGVzaXM6XG5cdFx0XHRcdHJldHVybiBwYXJzZUV4cHIoc2xpY2UpXG5cdFx0XHRjYXNlIEdfQnJhY2tldDpcblx0XHRcdFx0cmV0dXJuIG5ldyBCYWdTaW1wbGUobG9jLCBwYXJzZUV4cHJQYXJ0cyhzbGljZSkpXG5cdFx0XHRjYXNlIEdfQmxvY2s6XG5cdFx0XHRcdHJldHVybiBibG9ja1dyYXAoc2xpY2UpXG5cdFx0XHRjYXNlIEdfUXVvdGU6XG5cdFx0XHRcdHJldHVybiBwYXJzZVF1b3RlKHNsaWNlKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKHRva2VuLmtpbmQpXG5cdFx0fVxuXHR9IGVsc2UgaWYgKHRva2VuIGluc3RhbmNlb2YgTnVtYmVyTGl0ZXJhbClcblx0XHRyZXR1cm4gdG9rZW5cblx0ZWxzZSBpZiAodG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdFx0Y2FzZSBLV19Gb2N1czpcblx0XHRcdFx0cmV0dXJuIExvY2FsQWNjZXNzLmZvY3VzKGxvYylcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBpZkVsc2Uob3BLZXl3b3JkS2luZFRvU3BlY2lhbFZhbHVlS2luZCh0b2tlbi5raW5kKSxcblx0XHRcdFx0XHRfID0+IG5ldyBTcGVjaWFsVmFsKGxvYywgXyksXG5cdFx0XHRcdFx0KCkgPT4gdW5leHBlY3RlZCh0b2tlbikpXG5cblx0XHR9XG5cdGVsc2UgaWYgKHRva2VuIGluc3RhbmNlb2YgRG90TmFtZSlcblx0XHRzd2l0Y2ggKHRva2VuLm5Eb3RzKSB7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHJldHVybiBuZXcgTWVtYmVyKHRva2VuLmxvYywgTG9jYWxBY2Nlc3MudGhpcyh0b2tlbi5sb2MpLCB0b2tlbi5uYW1lKVxuXHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFNwbGF0KGxvYywgbmV3IExvY2FsQWNjZXNzKGxvYywgdG9rZW4ubmFtZSkpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR1bmV4cGVjdGVkKHRva2VuKVxuXHRcdH1cblx0ZWxzZVxuXHRcdHVuZXhwZWN0ZWQodG9rZW4pXG59XG5cbmNvbnN0IHBhcnNlU3BhY2VkID0gdG9rZW5zID0+IHtcblx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKCksIHJlc3QgPSB0b2tlbnMudGFpbCgpXG5cdGlmIChpc0tleXdvcmQoS1dfVHlwZSwgaCkpXG5cdFx0cmV0dXJuIENhbGwuY29udGFpbnMoaC5sb2MsIHBhcnNlU3BhY2VkKHJlc3QpLCBMb2NhbEFjY2Vzcy5mb2N1cyhoLmxvYykpXG5cdGVsc2UgaWYgKGlzS2V5d29yZChLV19MYXp5LCBoKSlcblx0XHRyZXR1cm4gbmV3IExhenkoaC5sb2MsIHBhcnNlU3BhY2VkKHJlc3QpKVxuXHRlbHNlIHtcblx0XHRsZXQgYWNjID0gcGFyc2VTaW5nbGUoaClcblx0XHRmb3IgKGxldCBpID0gcmVzdC5zdGFydDsgaSA8IHJlc3QuZW5kOyBpID0gaSArIDEpIHtcblx0XHRcdGNvbnN0IHRva2VuID0gcmVzdC50b2tlbnNbaV1cblx0XHRcdGNvbnN0IGxvYyA9IHRva2VuLmxvY1xuXHRcdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgRG90TmFtZSkge1xuXHRcdFx0XHRjb250ZXh0LmNoZWNrKHRva2VuLm5Eb3RzID09PSAxLCB0b2tlbi5sb2MsICdUb28gbWFueSBkb3RzIScpXG5cdFx0XHRcdGFjYyA9IG5ldyBNZW1iZXIodG9rZW4ubG9jLCBhY2MsIHRva2VuLm5hbWUpXG5cdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHR9XG5cdFx0XHRpZiAodG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdFx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdFx0XHRjYXNlIEtXX0ZvY3VzOlxuXHRcdFx0XHRcdFx0YWNjID0gbmV3IENhbGwodG9rZW4ubG9jLCBhY2MsIFsgTG9jYWxBY2Nlc3MuZm9jdXMobG9jKSBdKVxuXHRcdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0XHRjYXNlIEtXX1R5cGU6IHtcblx0XHRcdFx0XHRcdGNvbnN0IHR5cGUgPSBwYXJzZVNwYWNlZCh0b2tlbnMuX2Nob3BTdGFydChpICsgMSkpXG5cdFx0XHRcdFx0XHRyZXR1cm4gQ2FsbC5jb250YWlucyh0b2tlbi5sb2MsIHR5cGUsIGFjYylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0fVxuXHRcdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgR3JvdXApIHtcblx0XHRcdFx0Y29uc3Qgc2xpY2UgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRcdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRcdFx0Y2FzZSBHX0JyYWNrZXQ6XG5cdFx0XHRcdFx0XHRhY2MgPSBDYWxsLnN1Yihsb2MsIHVuc2hpZnQoYWNjLCBwYXJzZUV4cHJQYXJ0cyhzbGljZSkpKVxuXHRcdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0XHRjYXNlIEdfUGFyZW50aGVzaXM6XG5cdFx0XHRcdFx0XHRjaGVja0VtcHR5KHNsaWNlLCAoKSA9PlxuXHRcdFx0XHRcdFx0XHRgVXNlICR7Y29kZSgnKGEgYiknKX0sIG5vdCAke2NvZGUoJ2EoYiknKX1gKVxuXHRcdFx0XHRcdFx0YWNjID0gbmV3IENhbGwobG9jLCBhY2MsIFtdKVxuXHRcdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0XHRjYXNlIEdfUXVvdGU6XG5cdFx0XHRcdFx0XHRhY2MgPSBuZXcgUXVvdGVUZW1wbGF0ZShsb2MsIGFjYywgcGFyc2VRdW90ZShzbGljZSkpXG5cdFx0XHRcdFx0XHRjb250aW51ZVxuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGNvbnRleHQuZmFpbCh0b2tlbnMubG9jLCBgRXhwZWN0ZWQgbWVtYmVyIG9yIHN1Yiwgbm90ICR7dG9rZW59YClcblx0XHR9XG5cdFx0cmV0dXJuIGFjY1xuXHR9XG59XG5cbmNvbnN0IHRyeVBhcnNlVXNlcyA9ICh1c2VLZXl3b3JkS2luZCwgdG9rZW5zKSA9PiB7XG5cdGlmICghdG9rZW5zLmlzRW1wdHkoKSkge1xuXHRcdGNvbnN0IGxpbmUwID0gdG9rZW5zLmhlYWRTbGljZSgpXG5cdFx0aWYgKGlzS2V5d29yZCh1c2VLZXl3b3JkS2luZCwgbGluZTAuaGVhZCgpKSkge1xuXHRcdFx0Y29uc3QgeyB1c2VzLCBvcFVzZUdsb2JhbCB9ID0gX3BhcnNlVXNlcyh1c2VLZXl3b3JkS2luZCwgbGluZTAudGFpbCgpKVxuXHRcdFx0aWYgKG5ldyBTZXQoWyBLV19Vc2VEbywgS1dfVXNlTGF6eSwgS1dfVXNlRGVidWcgXSkuaGFzKHVzZUtleXdvcmRLaW5kKSlcblx0XHRcdFx0Y29udGV4dC5jaGVjayhvcFVzZUdsb2JhbCA9PT0gbnVsbCwgbGluZTAubG9jLCAnQ2FuXFwndCB1c2UgZ2xvYmFsIGhlcmUuJylcblx0XHRcdHJldHVybiB7IHVzZXMsIG9wVXNlR2xvYmFsLCByZXN0OiB0b2tlbnMudGFpbCgpIH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIHsgdXNlczogWyBdLCBvcFVzZUdsb2JhbDogbnVsbCwgcmVzdDogdG9rZW5zIH1cbn1cblxuLy8gdHJ5UGFyc2VVc2UgcHJpdmF0ZXNcbmNvbnN0XG5cdF9wYXJzZVVzZXMgPSAodXNlS2V5d29yZEtpbmQsIHRva2VucykgPT4ge1xuXHRcdGNvbnN0IGxpbmVzID0ganVzdEJsb2NrKHVzZUtleXdvcmRLaW5kLCB0b2tlbnMpXG5cdFx0bGV0IG9wVXNlR2xvYmFsID0gbnVsbFxuXG5cdFx0Y29uc3QgdXNlcyA9IFsgXVxuXG5cdFx0Zm9yIChjb25zdCBsaW5lIG9mIGxpbmVzLnNsaWNlcygpKSB7XG5cdFx0XHRjb25zdCB7IHBhdGgsIG5hbWUgfSA9IF9wYXJzZVJlcXVpcmUobGluZS5oZWFkKCkpXG5cdFx0XHRpZiAodXNlS2V5d29yZEtpbmQgPT09IEtXX1VzZURvKSB7XG5cdFx0XHRcdGlmIChsaW5lLnNpemUoKSA+IDEpXG5cdFx0XHRcdFx0dW5leHBlY3RlZChsaW5lLnNlY29uZCgpKVxuXHRcdFx0XHR1c2VzLnB1c2gobmV3IFVzZURvKGxpbmUubG9jLCBwYXRoKSlcblx0XHRcdH0gZWxzZVxuXHRcdFx0XHRpZiAocGF0aCA9PT0gJ2dsb2JhbCcpIHtcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKG9wVXNlR2xvYmFsID09PSBudWxsLCBsaW5lLmxvYywgJ0NhblxcJ3QgdXNlIGdsb2JhbCB0d2ljZScpXG5cdFx0XHRcdFx0Y29uc3QgeyB1c2VkLCBvcFVzZURlZmF1bHQgfSA9IF9wYXJzZVRoaW5nc1VzZWQobmFtZSwgZmFsc2UsIGxpbmUudGFpbCgpKVxuXHRcdFx0XHRcdG9wVXNlR2xvYmFsID0gbmV3IFVzZUdsb2JhbChsaW5lLmxvYywgdXNlZCwgb3BVc2VEZWZhdWx0KVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IGlzTGF6eSA9IHVzZUtleXdvcmRLaW5kID09PSBLV19Vc2VMYXp5IHx8IHVzZUtleXdvcmRLaW5kID09PSBLV19Vc2VEZWJ1Z1xuXHRcdFx0XHRcdGNvbnN0IHsgdXNlZCwgb3BVc2VEZWZhdWx0IH0gPSBfcGFyc2VUaGluZ3NVc2VkKG5hbWUsIGlzTGF6eSwgbGluZS50YWlsKCkpXG5cdFx0XHRcdFx0dXNlcy5wdXNoKG5ldyBVc2UobGluZS5sb2MsIHBhdGgsIHVzZWQsIG9wVXNlRGVmYXVsdCkpXG5cdFx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4geyB1c2VzLCBvcFVzZUdsb2JhbCB9XG5cdH0sXG5cdF9wYXJzZVRoaW5nc1VzZWQgPSAobmFtZSwgaXNMYXp5LCB0b2tlbnMpID0+IHtcblx0XHRjb25zdCB1c2VEZWZhdWx0ID0gKCkgPT4gTG9jYWxEZWNsYXJlLnVudHlwZWQodG9rZW5zLmxvYywgbmFtZSwgaXNMYXp5ID8gTERfTGF6eSA6IExEX0NvbnN0KVxuXHRcdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdFx0cmV0dXJuIHsgdXNlZDogWyBdLCBvcFVzZURlZmF1bHQ6IHVzZURlZmF1bHQoKSB9XG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBbIG9wVXNlRGVmYXVsdCwgcmVzdCBdID1cblx0XHRcdFx0aXNLZXl3b3JkKEtXX0ZvY3VzLCB0b2tlbnMuaGVhZCgpKSA/XG5cdFx0XHRcdFx0WyB1c2VEZWZhdWx0KCksIHRva2Vucy50YWlsKCkgXSA6XG5cdFx0XHRcdFx0WyBudWxsLCB0b2tlbnMgXVxuXHRcdFx0Y29uc3QgdXNlZCA9IHBhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcyhyZXN0KS5tYXAobCA9PiB7XG5cdFx0XHRcdGNvbnRleHQuY2hlY2sobC5uYW1lICE9PSAnXycsIGwucG9zLFxuXHRcdFx0XHRcdCgpID0+IGAke2NvZGUoJ18nKX0gbm90IGFsbG93ZWQgYXMgaW1wb3J0IG5hbWUuYClcblx0XHRcdFx0aWYgKGlzTGF6eSlcblx0XHRcdFx0XHRsLmtpbmQgPSBMRF9MYXp5XG5cdFx0XHRcdHJldHVybiBsXG5cdFx0XHR9KVxuXHRcdFx0cmV0dXJuIHsgdXNlZCwgb3BVc2VEZWZhdWx0IH1cblx0XHR9XG5cdH0sXG5cdF9wYXJzZVJlcXVpcmUgPSB0ID0+IHtcblx0XHRpZiAodCBpbnN0YW5jZW9mIE5hbWUpXG5cdFx0XHRyZXR1cm4geyBwYXRoOiB0Lm5hbWUsIG5hbWU6IHQubmFtZSB9XG5cdFx0ZWxzZSBpZiAodCBpbnN0YW5jZW9mIERvdE5hbWUpXG5cdFx0XHRyZXR1cm4geyBwYXRoOiBwdXNoKF9wYXJ0c0Zyb21Eb3ROYW1lKHQpLCB0Lm5hbWUpLmpvaW4oJy8nKSwgbmFtZTogdC5uYW1lIH1cblx0XHRlbHNlIHtcblx0XHRcdGNvbnRleHQuY2hlY2soaXNHcm91cChHX1NwYWNlLCB0KSwgdC5sb2MsICdOb3QgYSB2YWxpZCBtb2R1bGUgbmFtZS4nKVxuXHRcdFx0cmV0dXJuIF9wYXJzZVNwYWNlZFJlcXVpcmUoU2xpY2UuZ3JvdXAodCkpXG5cdFx0fVxuXHR9LFxuXHRfcGFyc2VTcGFjZWRSZXF1aXJlID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBmaXJzdCA9IHRva2Vucy5oZWFkKClcblx0XHRsZXQgcGFydHNcblx0XHRpZiAoZmlyc3QgaW5zdGFuY2VvZiBEb3ROYW1lKVxuXHRcdFx0cGFydHMgPSBfcGFydHNGcm9tRG90TmFtZShmaXJzdClcblx0XHRlbHNlIHtcblx0XHRcdGNvbnRleHQuY2hlY2soZmlyc3QgaW5zdGFuY2VvZiBOYW1lLCBmaXJzdC5sb2MsICdOb3QgYSB2YWxpZCBwYXJ0IG9mIG1vZHVsZSBwYXRoLicpXG5cdFx0XHRwYXJ0cyA9IFsgXVxuXHRcdH1cblx0XHRwYXJ0cy5wdXNoKGZpcnN0Lm5hbWUpXG5cdFx0Zm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMudGFpbCgpKSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKHRva2VuIGluc3RhbmNlb2YgRG90TmFtZSAmJiB0b2tlbi5uRG90cyA9PT0gMSwgdG9rZW4ubG9jLFxuXHRcdFx0XHQnTm90IGEgdmFsaWQgcGFydCBvZiBtb2R1bGUgcGF0aC4nKVxuXHRcdFx0cGFydHMucHVzaCh0b2tlbi5uYW1lKVxuXHRcdH1cblx0XHRyZXR1cm4geyBwYXRoOiBwYXJ0cy5qb2luKCcvJyksIG5hbWU6IHRva2Vucy5sYXN0KCkubmFtZSB9XG5cdH0sXG5cdF9wYXJ0c0Zyb21Eb3ROYW1lID0gZG90TmFtZSA9PlxuXHRcdGRvdE5hbWUubkRvdHMgPT09IDEgPyBbICcuJyBdIDogcmVwZWF0KCcuLicsIGRvdE5hbWUubkRvdHMgLSAxKVxuXG5jb25zdFxuXHRfcGFyc2VGb3IgPSBjdHIgPT4gdG9rZW5zID0+IHtcblx0XHRjb25zdCBbIGJlZm9yZSwgYmxvY2sgXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0XHRyZXR1cm4gbmV3IGN0cih0b2tlbnMubG9jLCBfcGFyc2VPcEl0ZXJhdGVlKGJlZm9yZSksIHBhcnNlQmxvY2tEbyhibG9jaykpXG5cdH0sXG5cdF9wYXJzZU9wSXRlcmF0ZWUgPSB0b2tlbnMgPT5cblx0XHRvcElmKCF0b2tlbnMuaXNFbXB0eSgpLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBbIGVsZW1lbnQsIGJhZyBdID1cblx0XHRcdFx0aWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZVdoZXJlKF8gPT4gaXNLZXl3b3JkKEtXX0luLCBfKSksXG5cdFx0XHRcdFx0KHsgYmVmb3JlLCBhZnRlciB9KSA9PiB7XG5cdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKGJlZm9yZS5zaXplKCkgPT09IDEsIGJlZm9yZS5sb2MsICdUT0RPOiBwYXR0ZXJuIGluIGZvcicpXG5cdFx0XHRcdFx0XHRyZXR1cm4gWyBwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMoYmVmb3JlKVswXSwgcGFyc2VFeHByKGFmdGVyKSBdXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQoKSA9PiBbIG5ldyBMb2NhbERlY2xhcmVGb2N1cyh0b2tlbnMubG9jKSwgcGFyc2VFeHByKHRva2VucykgXSlcblx0XHRcdHJldHVybiBuZXcgSXRlcmF0ZWUodG9rZW5zLmxvYywgZWxlbWVudCwgYmFnKVxuXHRcdH0pXG5jb25zdFxuXHRwYXJzZUZvckRvID0gX3BhcnNlRm9yKEZvckRvKSxcblx0cGFyc2VGb3JWYWwgPSBfcGFyc2VGb3IoRm9yVmFsKSxcblx0Ly8gVE9ETzogLT4gb3V0LXR5cGVcblx0cGFyc2VGb3JCYWcgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IFsgYmVmb3JlLCBsaW5lcyBdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRcdGNvbnN0IGJsb2NrID0gcGFyc2VCbG9ja0RvKGxpbmVzKVxuXHRcdC8vIFRPRE86IEJldHRlciB3YXk/XG5cdFx0aWYgKGJsb2NrLmxpbmVzLmxlbmd0aCA9PT0gMSAmJiBibG9jay5saW5lc1swXSBpbnN0YW5jZW9mIFZhbClcblx0XHRcdGJsb2NrLmxpbmVzWzBdID0gbmV3IEJhZ0VudHJ5KGJsb2NrLmxpbmVzWzBdLmxvYywgYmxvY2subGluZXNbMF0pXG5cdFx0cmV0dXJuIEZvckJhZy5vZih0b2tlbnMubG9jLCBfcGFyc2VPcEl0ZXJhdGVlKGJlZm9yZSksIGJsb2NrKVxuXHR9XG5cblxuY29uc3Rcblx0cGFyc2VFeGNlcHQgPSAoa3dFeGNlcHQsIHRva2VucykgPT4ge1xuXHRcdGNvbnN0XG5cdFx0XHRpc1ZhbCA9IGt3RXhjZXB0ID09PSBLV19FeGNlcHRWYWwsXG5cdFx0XHRqdXN0RG9WYWxCbG9jayA9IGlzVmFsID8ganVzdEJsb2NrVmFsIDoganVzdEJsb2NrRG8sXG5cdFx0XHRwYXJzZUJsb2NrID0gaXNWYWwgPyBwYXJzZUJsb2NrVmFsIDogcGFyc2VCbG9ja0RvLFxuXHRcdFx0RXhjZXB0ID0gaXNWYWwgPyBFeGNlcHRWYWwgOiBFeGNlcHREbyxcblx0XHRcdGt3VHJ5ID0gaXNWYWwgPyBLV19UcnlWYWwgOiBLV19UcnlEbyxcblx0XHRcdGt3Q2F0Y2ggPSBpc1ZhbCA/IEtXX0NhdGNoVmFsIDogS1dfQ2F0Y2hEbyxcblx0XHRcdG5hbWVUcnkgPSAoKSA9PiBjb2RlKGtleXdvcmROYW1lKGt3VHJ5KSksXG5cdFx0XHRuYW1lQ2F0Y2ggPSAoKSA9PiBjb2RlKGtleXdvcmROYW1lKGt3Q2F0Y2gpKSxcblx0XHRcdG5hbWVGaW5hbGx5ID0gKCkgPT4gY29kZShrZXl3b3JkTmFtZShLV19GaW5hbGx5KSlcblxuXHRcdGNvbnN0IGxpbmVzID0ganVzdEJsb2NrKGt3RXhjZXB0LCB0b2tlbnMpXG5cblx0XHQvLyBgdHJ5YCAqbXVzdCogY29tZSBmaXJzdC5cblx0XHRjb25zdCBmaXJzdExpbmUgPSBsaW5lcy5oZWFkU2xpY2UoKVxuXHRcdGNvbnN0IHRva2VuVHJ5ID0gZmlyc3RMaW5lLmhlYWQoKVxuXHRcdGNvbnRleHQuY2hlY2soaXNLZXl3b3JkKGt3VHJ5LCB0b2tlblRyeSksIHRva2VuVHJ5LmxvYywgKCkgPT5cblx0XHRcdGBNdXN0IHN0YXJ0IHdpdGggJHtuYW1lVHJ5KCl9YClcblx0XHRjb25zdCBfdHJ5ID0ganVzdERvVmFsQmxvY2soa3dUcnksIGZpcnN0TGluZS50YWlsKCkpXG5cblx0XHRjb25zdCByZXN0TGluZXMgPSBsaW5lcy50YWlsKClcblx0XHRjaGVja05vbkVtcHR5KHJlc3RMaW5lcywgKCkgPT5cblx0XHRcdGBNdXN0IGhhdmUgYXQgbGVhc3Qgb25lIG9mICR7bmFtZUNhdGNoKCl9IG9yICR7bmFtZUZpbmFsbHkoKX1gKVxuXG5cdFx0Y29uc3QgaGFuZGxlRmluYWxseSA9IHJlc3RMaW5lcyA9PiB7XG5cdFx0XHRjb25zdCBsaW5lID0gcmVzdExpbmVzLmhlYWRTbGljZSgpXG5cdFx0XHRjb25zdCB0b2tlbkZpbmFsbHkgPSBsaW5lLmhlYWQoKVxuXHRcdFx0Y29udGV4dC5jaGVjayhpc0tleXdvcmQoS1dfRmluYWxseSwgdG9rZW5GaW5hbGx5KSwgdG9rZW5GaW5hbGx5LmxvYywgKCkgPT5cblx0XHRcdFx0YEV4cGVjdGVkICR7bmFtZUZpbmFsbHkoKX1gKVxuXHRcdFx0Y29udGV4dC5jaGVjayhyZXN0TGluZXMuc2l6ZSgpID09PSAxLCByZXN0TGluZXMubG9jLCAoKSA9PlxuXHRcdFx0XHRgTm90aGluZyBpcyBhbGxvd2VkIHRvIGNvbWUgYWZ0ZXIgJHtuYW1lRmluYWxseSgpfS5gKVxuXHRcdFx0cmV0dXJuIGp1c3RCbG9ja0RvKEtXX0ZpbmFsbHksIGxpbmUudGFpbCgpKVxuXHRcdH1cblxuXHRcdGxldCBfY2F0Y2gsIF9maW5hbGx5XG5cblx0XHRjb25zdCBsaW5lMiA9IHJlc3RMaW5lcy5oZWFkU2xpY2UoKVxuXHRcdGNvbnN0IGhlYWQyID0gbGluZTIuaGVhZCgpXG5cdFx0aWYgKGlzS2V5d29yZChrd0NhdGNoLCBoZWFkMikpIHtcblx0XHRcdGNvbnN0IFsgYmVmb3JlMiwgYmxvY2syIF0gPSBiZWZvcmVBbmRCbG9jayhsaW5lMi50YWlsKCkpXG5cdFx0XHRjb25zdCBjYXVnaHQgPSBfcGFyc2VPbmVMb2NhbERlY2xhcmVPckZvY3VzKGJlZm9yZTIpXG5cdFx0XHRfY2F0Y2ggPSBuZXcgQ2F0Y2gobGluZTIubG9jLCBjYXVnaHQsIHBhcnNlQmxvY2soYmxvY2syKSlcblx0XHRcdF9maW5hbGx5ID0gb3BJZihyZXN0TGluZXMuc2l6ZSgpID4gMSwgKCkgPT4gaGFuZGxlRmluYWxseShyZXN0TGluZXMudGFpbCgpKSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0X2NhdGNoID0gbnVsbFxuXHRcdFx0X2ZpbmFsbHkgPSBoYW5kbGVGaW5hbGx5KHJlc3RMaW5lcylcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3IEV4Y2VwdCh0b2tlbnMubG9jLCBfdHJ5LCBfY2F0Y2gsIF9maW5hbGx5KVxuXHR9LFxuXHRfcGFyc2VPbmVMb2NhbERlY2xhcmVPckZvY3VzID0gdG9rZW5zID0+IHtcblx0XHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRcdHJldHVybiBuZXcgTG9jYWxEZWNsYXJlRm9jdXModG9rZW5zLmxvYylcblx0XHRlbHNlIHtcblx0XHRcdGNvbnRleHQuY2hlY2sodG9rZW5zLnNpemUoKSA9PT0gMSwgJ0V4cGVjdGVkIG9ubHkgb25lIGxvY2FsIGRlY2xhcmUuJylcblx0XHRcdHJldHVybiBwYXJzZUxvY2FsRGVjbGFyZXModG9rZW5zKVswXVxuXHRcdH1cblx0fVxuXG5jb25zdCBwYXJzZUFzc2VydCA9IChuZWdhdGUsIHRva2VucykgPT4ge1xuXHRjaGVja05vbkVtcHR5KHRva2VucywgKCkgPT4gYEV4cGVjdGVkIHNvbWV0aGluZyBhZnRlciAke2tleXdvcmROYW1lKEtXX0Fzc2VydCl9LmApXG5cblx0Y29uc3QgWyBjb25kVG9rZW5zLCBvcFRocm93biBdID1cblx0XHRpZkVsc2UodG9rZW5zLm9wU3BsaXRPbmNlV2hlcmUoXyA9PiBpc0tleXdvcmQoS1dfVGhyb3csIF8pKSxcblx0XHRcdCh7IGJlZm9yZSwgYWZ0ZXIgfSkgPT4gWyBiZWZvcmUsIHBhcnNlRXhwcihhZnRlcikgXSxcblx0XHRcdCgpID0+IFsgdG9rZW5zLCBudWxsIF0pXG5cblx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyhjb25kVG9rZW5zKVxuXHRjb25zdCBjb25kID0gcGFydHMubGVuZ3RoID09PSAxID8gcGFydHNbMF0gOiBuZXcgQ2FsbChjb25kVG9rZW5zLmxvYywgcGFydHNbMF0sIHRhaWwocGFydHMpKVxuXHRyZXR1cm4gbmV3IEFzc2VydCh0b2tlbnMubG9jLCBuZWdhdGUsIGNvbmQsIG9wVGhyb3duKVxufVxuXG5jb25zdCBwYXJzZUNsYXNzID0gdG9rZW5zID0+IHtcblx0Y29uc3QgWyBiZWZvcmUsIGJsb2NrIF0gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdGNvbnN0IG9wRXh0ZW5kZWQgPSBvcElmKCFiZWZvcmUuaXNFbXB0eSgpLCAoKSA9PiBwYXJzZUV4cHIoYmVmb3JlKSlcblxuXHRsZXQgb3BEbyA9IG51bGwsIHN0YXRpY3MgPSBbIF0sIG9wQ29uc3RydWN0b3IgPSBudWxsLCBtZXRob2RzID0gWyBdXG5cblx0bGV0IHJlc3QgPSBibG9ja1xuXHRjb25zdCBsaW5lMSA9IHJlc3QuaGVhZFNsaWNlKClcblx0aWYgKGlzS2V5d29yZChLV19EbywgbGluZTEuaGVhZCgpKSkge1xuXHRcdGNvbnN0IGRvbmUgPSBqdXN0QmxvY2tEbyhLV19EbywgbGluZTEudGFpbCgpKVxuXHRcdG9wRG8gPSBuZXcgQ2xhc3NEbyhsaW5lMS5sb2MsIG5ldyBMb2NhbERlY2xhcmVGb2N1cyhsaW5lMS5sb2MsIGRvbmUpLCBkb25lKVxuXHRcdHJlc3QgPSBibG9jay50YWlsKClcblx0fVxuXHRpZiAoIXJlc3QuaXNFbXB0eSgpKSB7XG5cdFx0Y29uc3QgbGluZTIgPSByZXN0LmhlYWRTbGljZSgpXG5cdFx0aWYgKGlzS2V5d29yZChLV19TdGF0aWMsIGxpbmUyLmhlYWQoKSkpIHtcblx0XHRcdHN0YXRpY3MgPSBfcGFyc2VTdGF0aWNzKGxpbmUyLnRhaWwoKSlcblx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdH1cblx0XHRpZiAoIXJlc3QuaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCBsaW5lMyA9IHJlc3QuaGVhZFNsaWNlKClcblx0XHRcdGlmIChpc0tleXdvcmQoS1dfQ29uc3RydWN0LCBsaW5lMy5oZWFkKCkpKSB7XG5cdFx0XHRcdG9wQ29uc3RydWN0b3IgPSBfcGFyc2VDb25zdHJ1Y3RvcihsaW5lMy50YWlsKCkpXG5cdFx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdFx0fVxuXHRcdFx0bWV0aG9kcyA9IF9wYXJzZU1ldGhvZHMocmVzdClcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gbmV3IENsYXNzKHRva2Vucy5sb2MsIG9wRXh0ZW5kZWQsIG9wRG8sIHN0YXRpY3MsIG9wQ29uc3RydWN0b3IsIG1ldGhvZHMpXG59XG5cbmNvbnN0XG5cdF9wYXJzZUNvbnN0cnVjdG9yID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCB7IGFyZ3MsIG9wUmVzdEFyZywgYmxvY2ssIG9wSW4sIG9wT3V0IH0gPSBfZnVuQXJnc0FuZEJsb2NrKHRydWUsIHRva2Vucylcblx0XHRjb25zdCBpc0dlbmVyYXRvciA9IGZhbHNlLCBvcERlY2xhcmVSZXMgPSBudWxsXG5cdFx0cmV0dXJuIG5ldyBGdW4odG9rZW5zLmxvYyxcblx0XHRcdG5ldyBMb2NhbERlY2xhcmVUaGlzKHRva2Vucy5sb2MpLFxuXHRcdFx0aXNHZW5lcmF0b3IsXG5cdFx0XHRhcmdzLCBvcFJlc3RBcmcsXG5cdFx0XHRibG9jaywgb3BJbiwgb3BEZWNsYXJlUmVzLCBvcE91dClcblx0fSxcblx0X3BhcnNlU3RhdGljcyA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgYmxvY2sgPSBqdXN0QmxvY2soS1dfU3RhdGljLCB0b2tlbnMpXG5cdFx0cmV0dXJuIF9wYXJzZU1ldGhvZHMoYmxvY2spXG5cdH0sXG5cdF9wYXJzZU1ldGhvZHMgPSB0b2tlbnMgPT4gdG9rZW5zLm1hcFNsaWNlcyhfcGFyc2VNZXRob2QpLFxuXHRfcGFyc2VNZXRob2QgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGhlYWQgPSB0b2tlbnMuaGVhZCgpXG5cblx0XHRsZXQga2luZCA9IE1JX1BsYWluXG5cdFx0aWYgKGlzS2V5d29yZChLV19HZXQsIGhlYWQpIHx8IGlzS2V5d29yZChLV19TZXQsIGhlYWQpKSB7XG5cdFx0XHRraW5kID0gaGVhZC5raW5kID09PSBLV19HZXQgPyBNSV9HZXQgOiBNSV9TZXRcblx0XHRcdHRva2VucyA9IHRva2Vucy50YWlsKClcblx0XHR9XG5cblx0XHRjb25zdCBiYWEgPSB0b2tlbnMub3BTcGxpdE9uY2VXaGVyZShfaXNGdW5LZXl3b3JkKVxuXHRcdGNvbnRleHQuY2hlY2soYmFhICE9PSBudWxsLCB0b2tlbnMubG9jLCAnRXhwZWN0ZWQgYSBmdW5jdGlvbiBrZXl3b3JkIHNvbWV3aGVyZS4nKVxuXHRcdGNvbnN0IHsgYmVmb3JlLCBhdCwgYWZ0ZXIgfSA9IGJhYVxuXG5cdFx0Y29uc3QgZnVuID0gcGFyc2VGdW4oX21ldGhvZEZ1bktpbmQoYXQpLCBhZnRlcilcblxuXHRcdGxldCBzeW1ib2wgPSBwYXJzZUV4cHIoYmVmb3JlKVxuXHRcdC8vIElmIHN5bWJvbCBpcyBqdXN0IGEgbGl0ZXJhbCBzdHJpbmcsIHN0b3JlIGl0IGFzIGEgc3RyaW5nLCB3aGljaCBpcyBoYW5kbGVkIHNwZWNpYWxseS5cblx0XHRpZiAoc3ltYm9sIGluc3RhbmNlb2YgUXVvdGUgJiZcblx0XHRcdHN5bWJvbC5wYXJ0cy5sZW5ndGggPT09IDEgJiZcblx0XHRcdHR5cGVvZiBzeW1ib2wucGFydHNbMF0gPT09ICdzdHJpbmcnKVxuXHRcdFx0c3ltYm9sID0gc3ltYm9sLnBhcnRzWzBdXG5cblx0XHRyZXR1cm4gbmV3IE1ldGhvZEltcGwodG9rZW5zLmxvYywga2luZCwgc3ltYm9sLCBmdW4pXG5cdH0sXG5cdF9tZXRob2RGdW5LaW5kID0gZnVuS2luZFRva2VuID0+IHtcblx0XHRzd2l0Y2ggKGZ1bktpbmRUb2tlbi5raW5kKSB7XG5cdFx0XHRjYXNlIEtXX0Z1bjogcmV0dXJuIEtXX0Z1blRoaXNcblx0XHRcdGNhc2UgS1dfRnVuRG86IHJldHVybiBLV19GdW5UaGlzRG9cblx0XHRcdGNhc2UgS1dfRnVuR2VuOiByZXR1cm4gS1dfRnVuVGhpc0dlblxuXHRcdFx0Y2FzZSBLV19GdW5HZW5EbzogcmV0dXJuIEtXX0Z1blRoaXNHZW5Eb1xuXHRcdFx0Y2FzZSBLV19GdW5UaGlzOiBjYXNlIEtXX0Z1blRoaXNEbzogY2FzZSBLV19GdW5UaGlzR2VuOiBjYXNlIEtXX0Z1blRoaXNHZW5Ebzpcblx0XHRcdFx0Y29udGV4dC5mYWlsKGZ1bktpbmRUb2tlbi5sb2MsICdGdW5jdGlvbiBgLmAgaXMgaW1wbGljaXQgZm9yIG1ldGhvZHMuJylcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGNvbnRleHQuZmFpbChmdW5LaW5kVG9rZW4ubG9jLCBgRXhwZWN0ZWQgZnVuY3Rpb24ga2luZCwgZ290ICR7ZnVuS2luZFRva2VufWApXG5cdFx0fVxuXHR9LFxuXHRfaXNGdW5LZXl3b3JkID0gZnVuS2luZFRva2VuID0+IHtcblx0XHRpZiAoZnVuS2luZFRva2VuIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRcdHN3aXRjaCAoZnVuS2luZFRva2VuLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBLV19GdW46IGNhc2UgS1dfRnVuRG86IGNhc2UgS1dfRnVuR2VuOiBjYXNlIEtXX0Z1bkdlbkRvOlxuXHRcdFx0XHRjYXNlIEtXX0Z1blRoaXM6IGNhc2UgS1dfRnVuVGhpc0RvOiBjYXNlIEtXX0Z1blRoaXNHZW46XG5cdFx0XHRcdGNhc2UgS1dfRnVuVGhpc0dlbkRvOlxuXHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHR9XG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdH1cblxuY29uc3QgcGFyc2VRdW90ZSA9IHRva2VucyA9PlxuXHRuZXcgUXVvdGUodG9rZW5zLmxvYywgdG9rZW5zLm1hcChfID0+IHR5cGVvZiBfID09PSAnc3RyaW5nJyA/IF8gOiBwYXJzZVNpbmdsZShfKSkpXG5cbmNvbnN0IHBhcnNlV2l0aCA9IHRva2VucyA9PiB7XG5cdGNvbnN0IFsgYmVmb3JlLCBibG9jayBdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXG5cdGNvbnN0IFsgdmFsLCBkZWNsYXJlIF0gPSBpZkVsc2UoYmVmb3JlLm9wU3BsaXRPbmNlV2hlcmUoXyA9PiBpc0tleXdvcmQoS1dfQXMsIF8pKSxcblx0XHQoeyBiZWZvcmUsIGFmdGVyIH0pID0+IHtcblx0XHRcdGNvbnRleHQuY2hlY2soYWZ0ZXIuc2l6ZSgpID09PSAxLCAoKSA9PiBgRXhwZWN0ZWQgb25seSAxIHRva2VuIGFmdGVyICR7Y29kZSgnYXMnKX0uYClcblx0XHRcdHJldHVybiBbIHBhcnNlRXhwclBsYWluKGJlZm9yZSksIHBhcnNlTG9jYWxEZWNsYXJlKGFmdGVyLmhlYWQoKSkgXVxuXHRcdH0sXG5cdFx0KCkgPT4gWyBwYXJzZUV4cHJQbGFpbihiZWZvcmUpLCBuZXcgTG9jYWxEZWNsYXJlRm9jdXModG9rZW5zLmxvYykgXSlcblxuXHRyZXR1cm4gbmV3IFdpdGgodG9rZW5zLmxvYywgZGVjbGFyZSwgdmFsLCBwYXJzZUJsb2NrRG8oYmxvY2spKVxufVxuXG5jb25zdCBwYXJzZUlnbm9yZSA9IHRva2VucyA9PiB7XG5cdGNvbnN0IGlnbm9yZWQgPSB0b2tlbnMubWFwKF8gPT4ge1xuXHRcdGlmIChpc0tleXdvcmQoS1dfRm9jdXMsIF8pKVxuXHRcdFx0cmV0dXJuICdfJ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29udGV4dC5jaGVjayhfIGluc3RhbmNlb2YgTmFtZSwgXy5sb2MsICgpID0+IGBFeHBlY3RlZCBsb2NhbCBuYW1lLCBub3QgJHtffS5gKVxuXHRcdFx0cmV0dXJuIF8ubmFtZVxuXHRcdH1cblx0fSlcblx0cmV0dXJuIG5ldyBJZ25vcmUodG9rZW5zLmxvYywgaWdub3JlZClcbn1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9
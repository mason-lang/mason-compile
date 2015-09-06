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
		// It parses `x.y = z` and the like.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7QUM4QkEsS0FBSSxPQUFPLENBQUE7Ozs7Ozs7Ozs7Ozs7a0JBWUksQ0FBQyxRQUFRLEVBQUUsU0FBUyxLQUFLO0FBQ3ZDLFNBQU8sR0FBRyxRQUFRLENBQUE7QUFDbEIsWUFyQlEsTUFBTSxFQXFCUCxXQS9Cc0UsT0FBTyxTQUE1RCxPQUFPLEVBK0JQLFNBQVMsQ0FBQyxDQUFDLENBQUE7QUFDbkMsUUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLGdCQUFNLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBOztBQUVqRCxTQUFPLEdBQUcsU0FBUyxDQUFBO0FBQ25CLFNBQU8sS0FBSyxDQUFBO0VBQ1o7O0FBRUQsT0FDQyxVQUFVLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxLQUM1QixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQztPQUNyRCxhQUFhLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxLQUMvQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDO09BQ3RELFVBQVUsR0FBRyxLQUFLLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxHQUFFLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQTs7QUFFckUsT0FBTSxXQUFXLEdBQUcsTUFBTSxJQUFJOzs7c0JBRVMsWUFBWSxRQXZDTyxRQUFRLEVBdUNKLE1BQU0sQ0FBQzs7UUFBdEQsTUFBTSxpQkFBWixJQUFJO1FBQWdCLEtBQUssaUJBQVgsSUFBSTs7dUJBQzRCLFlBQVksUUF4QzlCLE1BQU0sRUF3Q2lDLEtBQUssQ0FBQzs7UUFBbkUs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LFdBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxtQkE1bkNLLElBQUksQUE0bkNPLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMseUJBQXlCLEdBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDL0UsV0FBTyxDQUFDLENBQUMsSUFBSSxDQUFBO0lBQ2I7R0FDRCxDQUFDLENBQUE7QUFDRixTQUFPLFdBanBDZ0IsTUFBTSxDQWlwQ1gsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQTtFQUN0QyxDQUFBIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvcGFyc2UuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCBMb2MgZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQgeyBjb2RlIH0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHsgQXNzZXJ0LCBBc3NpZ25EZXN0cnVjdHVyZSwgQXNzaWduU2luZ2xlLCBCYWdFbnRyeSwgQmFnRW50cnlNYW55LCBCYWdTaW1wbGUsIEJsb2NrQmFnLFxuXHRCbG9ja0RvLCBCbG9ja01hcCwgQmxvY2tPYmosIEJsb2NrVmFsVGhyb3csIEJsb2NrV2l0aFJldHVybiwgQmxvY2tXcmFwLCBCcmVhaywgQnJlYWtXaXRoVmFsLFxuXHRDYWxsLCBDYXNlRG8sIENhc2VEb1BhcnQsIENhc2VWYWwsIENhc2VWYWxQYXJ0LCBDYXRjaCwgQ2xhc3MsIENsYXNzRG8sIENvbmRpdGlvbmFsRG8sXG5cdENvbmRpdGlvbmFsVmFsLCBEZWJ1ZywgSWdub3JlLCBJdGVyYXRlZSwgTnVtYmVyTGl0ZXJhbCwgRXhjZXB0RG8sIEV4Y2VwdFZhbCwgRm9yQmFnLCBGb3JEbyxcblx0Rm9yVmFsLCBGdW4sIExfQW5kLCBMX09yLCBMYXp5LCBMRF9Db25zdCwgTERfTGF6eSwgTERfTXV0YWJsZSwgTG9jYWxBY2Nlc3MsIExvY2FsRGVjbGFyZSxcblx0TG9jYWxEZWNsYXJlRm9jdXMsIExvY2FsRGVjbGFyZU5hbWUsIExvY2FsRGVjbGFyZVJlcywgTG9jYWxEZWNsYXJlVGhpcywgTG9jYWxNdXRhdGUsIExvZ2ljLFxuXHRNYXBFbnRyeSwgTWVtYmVyLCBNZW1iZXJTZXQsIE1ldGhvZEltcGwsIE1JX0dldCwgTUlfUGxhaW4sIE1JX1NldCwgTW9kdWxlLCBNU19NdXRhdGUsIE1TX05ldyxcblx0TVNfTmV3TXV0YWJsZSwgTmV3LCBOb3QsIE9iakVudHJ5LCBPYmpFbnRyeUFzc2lnbiwgT2JqRW50cnlDb21wdXRlZCwgT2JqUGFpciwgT2JqU2ltcGxlLFxuXHRQYXR0ZXJuLCBRdW90ZSwgUXVvdGVUZW1wbGF0ZSwgU0RfRGVidWdnZXIsIFNwZWNpYWxEbywgU3BlY2lhbFZhbCwgU1ZfTmFtZSwgU1ZfTnVsbCwgU3BsYXQsXG5cdFN3aXRjaERvLCBTd2l0Y2hEb1BhcnQsIFN3aXRjaFZhbCwgU3dpdGNoVmFsUGFydCwgVGhyb3csIFZhbCwgVXNlLCBVc2VEbywgVXNlR2xvYmFsLCBXaXRoLFxuXHRZaWVsZCwgWWllbGRUbyB9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHsgRG90TmFtZSwgR3JvdXAsIEdfQmxvY2ssIEdfQnJhY2tldCwgR19QYXJlbnRoZXNpcywgR19TcGFjZSwgR19RdW90ZSwgaXNHcm91cCwgaXNLZXl3b3JkLFxuXHRLZXl3b3JkLCBLV19BbmQsIEtXX0FzLCBLV19Bc3NlcnQsIEtXX0Fzc2VydE5vdCwgS1dfQXNzaWduLCBLV19Bc3NpZ25NdXRhYmxlLCBLV19CcmVhayxcblx0S1dfQnJlYWtXaXRoVmFsLCBLV19DYXNlVmFsLCBLV19DYXNlRG8sIEtXX0NsYXNzLCBLV19DYXRjaERvLCBLV19DYXRjaFZhbCwgS1dfQ29uc3RydWN0LFxuXHRLV19EZWJ1ZywgS1dfRGVidWdnZXIsIEtXX0RvLCBLV19FbGxpcHNpcywgS1dfRWxzZSwgS1dfRXhjZXB0RG8sIEtXX0V4Y2VwdFZhbCwgS1dfRmluYWxseSxcblx0S1dfRm9yQmFnLCBLV19Gb3JEbywgS1dfRm9yVmFsLCBLV19Gb2N1cywgS1dfRnVuLCBLV19GdW5EbywgS1dfRnVuR2VuLCBLV19GdW5HZW5EbywgS1dfRnVuVGhpcyxcblx0S1dfRnVuVGhpc0RvLCBLV19GdW5UaGlzR2VuLCBLV19GdW5UaGlzR2VuRG8sIEtXX0dldCwgS1dfSWZEbywgS1dfSWZWYWwsIEtXX0lnbm9yZSwgS1dfSW4sXG5cdEtXX0xhenksIEtXX0xvY2FsTXV0YXRlLCBLV19NYXBFbnRyeSwgS1dfTmFtZSwgS1dfTmV3LCBLV19Ob3QsIEtXX09iakFzc2lnbiwgS1dfT3IsIEtXX1Bhc3MsXG5cdEtXX091dCwgS1dfUmVnaW9uLCBLV19TZXQsIEtXX1N0YXRpYywgS1dfU3dpdGNoRG8sIEtXX1N3aXRjaFZhbCwgS1dfVGhyb3csIEtXX1RyeURvLCBLV19UcnlWYWwsXG5cdEtXX1R5cGUsIEtXX1VubGVzc0RvLCBLV19Vbmxlc3NWYWwsIEtXX1VzZSwgS1dfVXNlRGVidWcsIEtXX1VzZURvLCBLV19Vc2VMYXp5LCBLV19XaXRoLFxuXHRLV19ZaWVsZCwgS1dfWWllbGRUbywgTmFtZSwga2V5d29yZE5hbWUsIG9wS2V5d29yZEtpbmRUb1NwZWNpYWxWYWx1ZUtpbmQgfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7IGFzc2VydCwgaGVhZCwgaWZFbHNlLCBmbGF0TWFwLCBpc0VtcHR5LCBsYXN0LFxuXHRvcElmLCBvcE1hcCwgcHVzaCwgcmVwZWF0LCBydGFpbCwgdGFpbCwgdW5zaGlmdCB9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLy8gU2luY2UgdGhlcmUgYXJlIHNvIG1hbnkgcGFyc2luZyBmdW5jdGlvbnMsXG4vLyBpdCdzIGZhc3RlciAoYXMgb2Ygbm9kZSB2MC4xMS4xNCkgdG8gaGF2ZSB0aGVtIGFsbCBjbG9zZSBvdmVyIHRoaXMgbXV0YWJsZSB2YXJpYWJsZSBvbmNlXG4vLyB0aGFuIHRvIGNsb3NlIG92ZXIgdGhlIHBhcmFtZXRlciAoYXMgaW4gbGV4LmpzLCB3aGVyZSB0aGF0J3MgbXVjaCBmYXN0ZXIpLlxubGV0IGNvbnRleHRcblxuLypcblRoaXMgY29udmVydHMgYSBUb2tlbiB0cmVlIHRvIGEgTXNBc3QuXG5UaGlzIGlzIGEgcmVjdXJzaXZlLWRlc2NlbnQgcGFyc2VyLCBtYWRlIGVhc2llciBieSB0d28gZmFjdHM6XG5cdCogV2UgaGF2ZSBhbHJlYWR5IGdyb3VwZWQgdG9rZW5zLlxuXHQqIE1vc3Qgb2YgdGhlIHRpbWUsIGFuIGFzdCdzIHR5cGUgaXMgZGV0ZXJtaW5lZCBieSB0aGUgZmlyc3QgdG9rZW4uXG5cblRoZXJlIGFyZSBleGNlcHRpb25zIHN1Y2ggYXMgYXNzaWdubWVudCBzdGF0ZW1lbnRzIChpbmRpY2F0ZWQgYnkgYSBgPWAgc29tZXdoZXJlIGluIHRoZSBtaWRkbGUpLlxuRm9yIHRob3NlIHdlIG11c3QgaXRlcmF0ZSB0aHJvdWdoIHRva2VucyBhbmQgc3BsaXQuXG4oU2VlIFNsaWNlLm9wU3BsaXRPbmNlV2hlcmUgYW5kIFNsaWNlLm9wU3BsaXRNYW55V2hlcmUuKVxuKi9cbmV4cG9ydCBkZWZhdWx0IChfY29udGV4dCwgcm9vdFRva2VuKSA9PiB7XG5cdGNvbnRleHQgPSBfY29udGV4dFxuXHRhc3NlcnQoaXNHcm91cChHX0Jsb2NrLCByb290VG9rZW4pKVxuXHRjb25zdCBtc0FzdCA9IHBhcnNlTW9kdWxlKFNsaWNlLmdyb3VwKHJvb3RUb2tlbikpXG5cdC8vIFJlbGVhc2UgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbnMuXG5cdGNvbnRleHQgPSB1bmRlZmluZWRcblx0cmV0dXJuIG1zQXN0XG59XG5cbmNvbnN0XG5cdGNoZWNrRW1wdHkgPSAodG9rZW5zLCBtZXNzYWdlKSA9PlxuXHRcdGNvbnRleHQuY2hlY2sodG9rZW5zLmlzRW1wdHkoKSwgdG9rZW5zLmxvYywgbWVzc2FnZSksXG5cdGNoZWNrTm9uRW1wdHkgPSAodG9rZW5zLCBtZXNzYWdlKSA9PlxuXHRcdGNvbnRleHQuY2hlY2soIXRva2Vucy5pc0VtcHR5KCksIHRva2Vucy5sb2MsIG1lc3NhZ2UpLFxuXHR1bmV4cGVjdGVkID0gdG9rZW4gPT4gY29udGV4dC5mYWlsKHRva2VuLmxvYywgYFVuZXhwZWN0ZWQgJHt0b2tlbn1gKVxuXG5jb25zdCBwYXJzZU1vZHVsZSA9IHRva2VucyA9PiB7XG5cdC8vIFVzZSBzdGF0ZW1lbnRzIG11c3QgYXBwZWFyIGluIG9yZGVyLlxuXHRjb25zdCB7IHVzZXM6IGRvVXNlcywgcmVzdDogcmVzdDAgfSA9IHRyeVBhcnNlVXNlcyhLV19Vc2VEbywgdG9rZW5zKVxuXHRjb25zdCB7IHVzZXM6IHBsYWluVXNlcywgb3BVc2VHbG9iYWwsIHJlc3Q6IHJlc3QxIH0gPSB0cnlQYXJzZVVzZXMoS1dfVXNlLCByZXN0MClcblx0Y29uc3QgeyB1c2VzOiBsYXp5VXNlcywgcmVzdDogcmVzdDIgfSA9IHRyeVBhcnNlVXNlcyhLV19Vc2VMYXp5LCByZXN0MSlcblx0Y29uc3QgeyB1c2VzOiBkZWJ1Z1VzZXMsIHJlc3Q6IHJlc3QzIH0gPSB0cnlQYXJzZVVzZXMoS1dfVXNlRGVidWcsIHJlc3QyKVxuXG5cdGNvbnN0IHsgbGluZXMsIGV4cG9ydHMsIG9wRGVmYXVsdEV4cG9ydCB9ID0gcGFyc2VNb2R1bGVCbG9jayhyZXN0MylcblxuXHRpZiAoY29udGV4dC5vcHRzLmluY2x1ZGVNb2R1bGVOYW1lKCkgJiYgIWV4cG9ydHMuc29tZShfID0+IF8ubmFtZSA9PT0gJ25hbWUnKSkge1xuXHRcdGNvbnN0IG5hbWUgPSBuZXcgTG9jYWxEZWNsYXJlTmFtZSh0b2tlbnMubG9jKVxuXHRcdGxpbmVzLnB1c2gobmV3IEFzc2lnblNpbmdsZSh0b2tlbnMubG9jLCBuYW1lLFxuXHRcdFx0UXVvdGUuZm9yU3RyaW5nKHRva2Vucy5sb2MsIGNvbnRleHQub3B0cy5tb2R1bGVOYW1lKCkpKSlcblx0XHRleHBvcnRzLnB1c2gobmFtZSlcblx0fVxuXHRjb25zdCB1c2VzID0gcGxhaW5Vc2VzLmNvbmNhdChsYXp5VXNlcylcblx0cmV0dXJuIG5ldyBNb2R1bGUodG9rZW5zLmxvYyxcblx0XHRkb1VzZXMsIHVzZXMsIG9wVXNlR2xvYmFsLCBkZWJ1Z1VzZXMsIGxpbmVzLCBleHBvcnRzLCBvcERlZmF1bHRFeHBvcnQpXG59XG5cbi8vIHBhcnNlQmxvY2tcbmNvbnN0XG5cdC8vIFRva2VucyBvbiB0aGUgbGluZSBiZWZvcmUgYSBibG9jaywgYW5kIHRva2VucyBmb3IgdGhlIGJsb2NrIGl0c2VsZi5cblx0YmVmb3JlQW5kQmxvY2sgPSB0b2tlbnMgPT4ge1xuXHRcdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAnRXhwZWN0ZWQgYW4gaW5kZW50ZWQgYmxvY2suJylcblx0XHRjb25zdCBibG9jayA9IHRva2Vucy5sYXN0KClcblx0XHRjb250ZXh0LmNoZWNrKGlzR3JvdXAoR19CbG9jaywgYmxvY2spLCBibG9jay5sb2MsICdFeHBlY3RlZCBhbiBpbmRlbnRlZCBibG9jay4nKVxuXHRcdHJldHVybiBbIHRva2Vucy5ydGFpbCgpLCBTbGljZS5ncm91cChibG9jaykgXVxuXHR9LFxuXG5cdGJsb2NrV3JhcCA9IHRva2VucyA9PiBuZXcgQmxvY2tXcmFwKHRva2Vucy5sb2MsIHBhcnNlQmxvY2tWYWwodG9rZW5zKSksXG5cblx0anVzdEJsb2NrID0gKGtleXdvcmQsIHRva2VucykgPT4ge1xuXHRcdGNvbnN0IFsgYmVmb3JlLCBibG9jayBdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRcdGNoZWNrRW1wdHkoYmVmb3JlLCAoKSA9PlxuXHRcdFx0YERpZCBub3QgZXhwZWN0IGFueXRoaW5nIGJldHdlZW4gJHtjb2RlKGtleXdvcmROYW1lKGtleXdvcmQpKX0gYW5kIGJsb2NrLmApXG5cdFx0cmV0dXJuIGJsb2NrXG5cdH0sXG5cdGp1c3RCbG9ja0RvID0gKGtleXdvcmQsIHRva2VucykgPT5cblx0XHRwYXJzZUJsb2NrRG8oanVzdEJsb2NrKGtleXdvcmQsIHRva2VucykpLFxuXHRqdXN0QmxvY2tWYWwgPSAoa2V5d29yZCwgdG9rZW5zKSA9PlxuXHRcdHBhcnNlQmxvY2tWYWwoanVzdEJsb2NrKGtleXdvcmQsIHRva2VucykpLFxuXG5cdC8vIEdldHMgbGluZXMgaW4gYSByZWdpb24gb3IgRGVidWcuXG5cdHBhcnNlTGluZXNGcm9tQmxvY2sgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpXG5cdFx0Y29udGV4dC5jaGVjayh0b2tlbnMuc2l6ZSgpID4gMSwgaC5sb2MsICgpID0+IGBFeHBlY3RlZCBpbmRlbnRlZCBibG9jayBhZnRlciAke2h9YClcblx0XHRjb25zdCBibG9jayA9IHRva2Vucy5zZWNvbmQoKVxuXHRcdGFzc2VydCh0b2tlbnMuc2l6ZSgpID09PSAyICYmIGlzR3JvdXAoR19CbG9jaywgYmxvY2spKVxuXHRcdHJldHVybiBmbGF0TWFwKGJsb2NrLnN1YlRva2VucywgbGluZSA9PiBwYXJzZUxpbmVPckxpbmVzKFNsaWNlLmdyb3VwKGxpbmUpKSlcblx0fSxcblxuXHRwYXJzZUJsb2NrRG8gPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGxpbmVzID0gX3BsYWluQmxvY2tMaW5lcyh0b2tlbnMpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja0RvKHRva2Vucy5sb2MsIGxpbmVzKVxuXHR9LFxuXG5cdHBhcnNlQmxvY2tWYWwgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IHsgbGluZXMsIGtSZXR1cm4gfSA9IF9wYXJzZUJsb2NrTGluZXModG9rZW5zKVxuXHRcdHN3aXRjaCAoa1JldHVybikge1xuXHRcdFx0Y2FzZSBLUmV0dXJuX0JhZzpcblx0XHRcdFx0cmV0dXJuIEJsb2NrQmFnLm9mKHRva2Vucy5sb2MsIGxpbmVzKVxuXHRcdFx0Y2FzZSBLUmV0dXJuX01hcDpcblx0XHRcdFx0cmV0dXJuIEJsb2NrTWFwLm9mKHRva2Vucy5sb2MsIGxpbmVzKVxuXHRcdFx0Y2FzZSBLUmV0dXJuX09iajpcblx0XHRcdFx0Y29uc3QgWyBkb0xpbmVzLCBvcFZhbCBdID0gX3RyeVRha2VMYXN0VmFsKGxpbmVzKVxuXHRcdFx0XHQvLyBvcE5hbWUgd3JpdHRlbiB0byBieSBfdHJ5QWRkTmFtZS5cblx0XHRcdFx0cmV0dXJuIEJsb2NrT2JqLm9mKHRva2Vucy5sb2MsIGRvTGluZXMsIG9wVmFsLCBudWxsKVxuXHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHRjb250ZXh0LmNoZWNrKCFpc0VtcHR5KGxpbmVzKSwgdG9rZW5zLmxvYywgJ1ZhbHVlIGJsb2NrIG11c3QgZW5kIGluIGEgdmFsdWUuJylcblx0XHRcdFx0Y29uc3QgdmFsID0gbGFzdChsaW5lcylcblx0XHRcdFx0aWYgKHZhbCBpbnN0YW5jZW9mIFRocm93KVxuXHRcdFx0XHRcdHJldHVybiBuZXcgQmxvY2tWYWxUaHJvdyh0b2tlbnMubG9jLCBydGFpbChsaW5lcyksIHZhbClcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayh2YWwgaW5zdGFuY2VvZiBWYWwsIHZhbC5sb2MsICdWYWx1ZSBibG9jayBtdXN0IGVuZCBpbiBhIHZhbHVlLicpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBCbG9ja1dpdGhSZXR1cm4odG9rZW5zLmxvYywgcnRhaWwobGluZXMpLCB2YWwpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0cGFyc2VNb2R1bGVCbG9jayA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgeyBsaW5lcywga1JldHVybiB9ID0gX3BhcnNlQmxvY2tMaW5lcyh0b2tlbnMpXG5cdFx0Y29uc3QgbG9jID0gdG9rZW5zLmxvY1xuXHRcdHN3aXRjaCAoa1JldHVybikge1xuXHRcdFx0Y2FzZSBLUmV0dXJuX0JhZzogY2FzZSBLUmV0dXJuX01hcDoge1xuXHRcdFx0XHRjb25zdCBibG9jayA9IChrUmV0dXJuID09PSBLUmV0dXJuX0JhZyA/IEJsb2NrQmFnIDogQmxvY2tNYXApLm9mKGxvYywgbGluZXMpXG5cdFx0XHRcdHJldHVybiB7IGxpbmVzOiBbIF0sIGV4cG9ydHM6IFsgXSwgb3BEZWZhdWx0RXhwb3J0OiBuZXcgQmxvY2tXcmFwKGxvYywgYmxvY2spIH1cblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0Y29uc3QgZXhwb3J0cyA9IFsgXVxuXHRcdFx0XHRsZXQgb3BEZWZhdWx0RXhwb3J0ID0gbnVsbFxuXHRcdFx0XHRjb25zdCBtb2R1bGVOYW1lID0gY29udGV4dC5vcHRzLm1vZHVsZU5hbWUoKVxuXG5cdFx0XHRcdC8vIE1vZHVsZSBleHBvcnRzIGxvb2sgbGlrZSBhIEJsb2NrT2JqLCAgYnV0IGFyZSByZWFsbHkgZGlmZmVyZW50LlxuXHRcdFx0XHQvLyBJbiBFUzYsIG1vZHVsZSBleHBvcnRzIG11c3QgYmUgY29tcGxldGVseSBzdGF0aWMuXG5cdFx0XHRcdC8vIFNvIHdlIGtlZXAgYW4gYXJyYXkgb2YgZXhwb3J0cyBhdHRhY2hlZCBkaXJlY3RseSB0byB0aGUgTW9kdWxlIGFzdC5cblx0XHRcdFx0Ly8gSWYgeW91IHdyaXRlOlxuXHRcdFx0XHQvL1x0aWYhIGNvbmRcblx0XHRcdFx0Ly9cdFx0YS4gYlxuXHRcdFx0XHQvLyBpbiBhIG1vZHVsZSBjb250ZXh0LCBpdCB3aWxsIGJlIGFuIGVycm9yLiAoVGhlIG1vZHVsZSBjcmVhdGVzIG5vIGBidWlsdGAgbG9jYWwuKVxuXHRcdFx0XHRjb25zdCBnZXRMaW5lRXhwb3J0cyA9IGxpbmUgPT4ge1xuXHRcdFx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgT2JqRW50cnlBc3NpZ24pIHtcblx0XHRcdFx0XHRcdGZvciAoY29uc3QgXyBvZiBsaW5lLmFzc2lnbi5hbGxBc3NpZ25lZXMoKSlcblx0XHRcdFx0XHRcdFx0aWYgKF8ubmFtZSA9PT0gbW9kdWxlTmFtZSkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnRleHQuY2hlY2sob3BEZWZhdWx0RXhwb3J0ID09PSBudWxsLCBfLmxvYywgKCkgPT5cblx0XHRcdFx0XHRcdFx0XHRcdGBEZWZhdWx0IGV4cG9ydCBhbHJlYWR5IGRlY2xhcmVkIGF0ICR7b3BEZWZhdWx0RXhwb3J0LmxvY31gKVxuXHRcdFx0XHRcdFx0XHRcdG9wRGVmYXVsdEV4cG9ydCA9IG5ldyBMb2NhbEFjY2VzcyhfLmxvYywgXy5uYW1lKVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRcdFx0XHRleHBvcnRzLnB1c2goXylcblx0XHRcdFx0XHRcdHJldHVybiBsaW5lLmFzc2lnblxuXHRcdFx0XHRcdH0gZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIERlYnVnKVxuXHRcdFx0XHRcdFx0bGluZS5saW5lcyA9IGxpbmUubGluZXMubWFwKGdldExpbmVFeHBvcnRzKVxuXHRcdFx0XHRcdHJldHVybiBsaW5lXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBtb2R1bGVMaW5lcyA9IGxpbmVzLm1hcChnZXRMaW5lRXhwb3J0cylcblxuXHRcdFx0XHRpZiAoaXNFbXB0eShleHBvcnRzKSAmJiBvcERlZmF1bHRFeHBvcnQgPT09IG51bGwpIHtcblx0XHRcdFx0XHRjb25zdCBbIGxpbmVzLCBvcERlZmF1bHRFeHBvcnQgXSA9IF90cnlUYWtlTGFzdFZhbChtb2R1bGVMaW5lcylcblx0XHRcdFx0XHRyZXR1cm4geyBsaW5lcywgZXhwb3J0cywgb3BEZWZhdWx0RXhwb3J0IH1cblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0cmV0dXJuIHsgbGluZXM6IG1vZHVsZUxpbmVzLCBleHBvcnRzLCBvcERlZmF1bHRFeHBvcnQgfVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG4vLyBwYXJzZUJsb2NrIHByaXZhdGVzXG5jb25zdFxuXHRfdHJ5VGFrZUxhc3RWYWwgPSBsaW5lcyA9PlxuXHRcdCFpc0VtcHR5KGxpbmVzKSAmJiBsYXN0KGxpbmVzKSBpbnN0YW5jZW9mIFZhbCA/XG5cdFx0XHRbIHJ0YWlsKGxpbmVzKSwgbGFzdChsaW5lcykgXSA6XG5cdFx0XHRbIGxpbmVzLCBudWxsIF0sXG5cblx0X3BsYWluQmxvY2tMaW5lcyA9IGxpbmVUb2tlbnMgPT4ge1xuXHRcdGNvbnN0IGxpbmVzID0gWyBdXG5cdFx0Y29uc3QgYWRkTGluZSA9IGxpbmUgPT4ge1xuXHRcdFx0aWYgKGxpbmUgaW5zdGFuY2VvZiBBcnJheSlcblx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIGxpbmUpXG5cdFx0XHRcdFx0YWRkTGluZShfKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRsaW5lcy5wdXNoKGxpbmUpXG5cdFx0fVxuXHRcdGZvciAoY29uc3QgXyBvZiBsaW5lVG9rZW5zKVxuXHRcdFx0YWRkTGluZShwYXJzZUxpbmUoU2xpY2UuZ3JvdXAoXykpKVxuXHRcdHJldHVybiBsaW5lc1xuXHR9LFxuXG5cdEtSZXR1cm5fUGxhaW4gPSAwLFxuXHRLUmV0dXJuX09iaiA9IDEsXG5cdEtSZXR1cm5fQmFnID0gMixcblx0S1JldHVybl9NYXAgPSAzLFxuXHRfcGFyc2VCbG9ja0xpbmVzID0gbGluZVRva2VucyA9PiB7XG5cdFx0bGV0IGlzQmFnID0gZmFsc2UsIGlzTWFwID0gZmFsc2UsIGlzT2JqID0gZmFsc2Vcblx0XHRjb25zdCBjaGVja0xpbmUgPSBsaW5lID0+IHtcblx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgRGVidWcpXG5cdFx0XHRcdGZvciAoY29uc3QgXyBvZiBsaW5lLmxpbmVzKVxuXHRcdFx0XHRcdGNoZWNrTGluZShfKVxuXHRcdFx0ZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIEJhZ0VudHJ5KVxuXHRcdFx0XHRpc0JhZyA9IHRydWVcblx0XHRcdGVsc2UgaWYgKGxpbmUgaW5zdGFuY2VvZiBNYXBFbnRyeSlcblx0XHRcdFx0aXNNYXAgPSB0cnVlXG5cdFx0XHRlbHNlIGlmIChsaW5lIGluc3RhbmNlb2YgT2JqRW50cnkpXG5cdFx0XHRcdGlzT2JqID0gdHJ1ZVxuXHRcdH1cblx0XHRjb25zdCBsaW5lcyA9IF9wbGFpbkJsb2NrTGluZXMobGluZVRva2Vucylcblx0XHRmb3IgKGNvbnN0IF8gb2YgbGluZXMpXG5cdFx0XHRjaGVja0xpbmUoXylcblxuXHRcdGNvbnRleHQuY2hlY2soIShpc09iaiAmJiBpc0JhZyksIGxpbmVzLmxvYywgJ0Jsb2NrIGhhcyBib3RoIEJhZyBhbmQgT2JqIGxpbmVzLicpXG5cdFx0Y29udGV4dC5jaGVjayghKGlzT2JqICYmIGlzTWFwKSwgbGluZXMubG9jLCAnQmxvY2sgaGFzIGJvdGggT2JqIGFuZCBNYXAgbGluZXMuJylcblx0XHRjb250ZXh0LmNoZWNrKCEoaXNCYWcgJiYgaXNNYXApLCBsaW5lcy5sb2MsICdCbG9jayBoYXMgYm90aCBCYWcgYW5kIE1hcCBsaW5lcy4nKVxuXG5cdFx0Y29uc3Qga1JldHVybiA9XG5cdFx0XHRpc09iaiA/IEtSZXR1cm5fT2JqIDogaXNCYWcgPyBLUmV0dXJuX0JhZyA6IGlzTWFwID8gS1JldHVybl9NYXAgOiBLUmV0dXJuX1BsYWluXG5cdFx0cmV0dXJuIHsgbGluZXMsIGtSZXR1cm4gfVxuXHR9XG5cbmNvbnN0IHBhcnNlQ2FzZSA9IChpc1ZhbCwgY2FzZWRGcm9tRnVuLCB0b2tlbnMpID0+IHtcblx0Y29uc3QgWyBiZWZvcmUsIGJsb2NrIF0gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cblx0bGV0IG9wQ2FzZWRcblx0aWYgKGNhc2VkRnJvbUZ1bikge1xuXHRcdGNoZWNrRW1wdHkoYmVmb3JlLCAnQ2FuXFwndCBtYWtlIGZvY3VzIC0tIGlzIGltcGxpY2l0bHkgcHJvdmlkZWQgYXMgZmlyc3QgYXJndW1lbnQuJylcblx0XHRvcENhc2VkID0gbnVsbFxuXHR9IGVsc2Vcblx0XHRvcENhc2VkID0gb3BJZighYmVmb3JlLmlzRW1wdHkoKSwgKCkgPT4gQXNzaWduU2luZ2xlLmZvY3VzKGJlZm9yZS5sb2MsIHBhcnNlRXhwcihiZWZvcmUpKSlcblxuXHRjb25zdCBsYXN0TGluZSA9IFNsaWNlLmdyb3VwKGJsb2NrLmxhc3QoKSlcblx0Y29uc3QgWyBwYXJ0TGluZXMsIG9wRWxzZSBdID0gaXNLZXl3b3JkKEtXX0Vsc2UsIGxhc3RMaW5lLmhlYWQoKSkgP1xuXHRcdFsgYmxvY2sucnRhaWwoKSwgKGlzVmFsID8ganVzdEJsb2NrVmFsIDoganVzdEJsb2NrRG8pKEtXX0Vsc2UsIGxhc3RMaW5lLnRhaWwoKSkgXSA6XG5cdFx0WyBibG9jaywgbnVsbCBdXG5cblx0Y29uc3QgcGFydHMgPSBwYXJ0TGluZXMubWFwU2xpY2VzKF9wYXJzZUNhc2VMaW5lKGlzVmFsKSlcblx0Y29udGV4dC5jaGVjayhwYXJ0cy5sZW5ndGggPiAwLCB0b2tlbnMubG9jLCAoKSA9PlxuXHRcdGBNdXN0IGhhdmUgYXQgbGVhc3QgMSBub24tJHtjb2RlKCdlbHNlJyl9IHRlc3QuYClcblxuXHRyZXR1cm4gbmV3IChpc1ZhbCA/IENhc2VWYWwgOiBDYXNlRG8pKHRva2Vucy5sb2MsIG9wQ2FzZWQsIHBhcnRzLCBvcEVsc2UpXG59XG4vLyBwYXJzZUNhc2UgcHJpdmF0ZXNcbmNvbnN0XG5cdF9wYXJzZUNhc2VMaW5lID0gaXNWYWwgPT4gbGluZSA9PiB7XG5cdFx0Y29uc3QgWyBiZWZvcmUsIGJsb2NrIF0gPSBiZWZvcmVBbmRCbG9jayhsaW5lKVxuXHRcdGNvbnN0IHRlc3QgPSBfcGFyc2VDYXNlVGVzdChiZWZvcmUpXG5cdFx0Y29uc3QgcmVzdWx0ID0gKGlzVmFsID8gcGFyc2VCbG9ja1ZhbCA6IHBhcnNlQmxvY2tEbykoYmxvY2spXG5cdFx0cmV0dXJuIG5ldyAoaXNWYWwgPyBDYXNlVmFsUGFydCA6IENhc2VEb1BhcnQpKGxpbmUubG9jLCB0ZXN0LCByZXN1bHQpXG5cdH0sXG5cdF9wYXJzZUNhc2VUZXN0ID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBmaXJzdCA9IHRva2Vucy5oZWFkKClcblx0XHQvLyBQYXR0ZXJuIG1hdGNoIHN0YXJ0cyB3aXRoIHR5cGUgdGVzdCBhbmQgaXMgZm9sbG93ZWQgYnkgbG9jYWwgZGVjbGFyZXMuXG5cdFx0Ly8gRS5nLiwgYDpTb21lIHZhbGBcblx0XHRpZiAoaXNHcm91cChHX1NwYWNlLCBmaXJzdCkgJiYgdG9rZW5zLnNpemUoKSA+IDEpIHtcblx0XHRcdGNvbnN0IGZ0ID0gU2xpY2UuZ3JvdXAoZmlyc3QpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtXX1R5cGUsIGZ0LmhlYWQoKSkpIHtcblx0XHRcdFx0Y29uc3QgdHlwZSA9IHBhcnNlU3BhY2VkKGZ0LnRhaWwoKSlcblx0XHRcdFx0Y29uc3QgbG9jYWxzID0gcGFyc2VMb2NhbERlY2xhcmVzKHRva2Vucy50YWlsKCkpXG5cdFx0XHRcdHJldHVybiBuZXcgUGF0dGVybihmaXJzdC5sb2MsIHR5cGUsIGxvY2FscywgTG9jYWxBY2Nlc3MuZm9jdXModG9rZW5zLmxvYykpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBwYXJzZUV4cHIodG9rZW5zKVxuXHR9XG5cbmNvbnN0IHBhcnNlU3dpdGNoID0gKGlzVmFsLCB0b2tlbnMpID0+IHtcblx0Y29uc3QgWyBiZWZvcmUsIGJsb2NrIF0gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdGNvbnN0IHN3aXRjaGVkID0gcGFyc2VFeHByKGJlZm9yZSlcblx0Y29uc3QgbGFzdExpbmUgPSBTbGljZS5ncm91cChibG9jay5sYXN0KCkpXG5cdGNvbnN0IFsgcGFydExpbmVzLCBvcEVsc2UgXSA9IGlzS2V5d29yZChLV19FbHNlLCBsYXN0TGluZS5oZWFkKCkpID9cblx0XHRbIGJsb2NrLnJ0YWlsKCksIChpc1ZhbCA/IGp1c3RCbG9ja1ZhbCA6IGp1c3RCbG9ja0RvKShLV19FbHNlLCBsYXN0TGluZS50YWlsKCkpIF0gOlxuXHRcdFsgYmxvY2ssIG51bGwgXVxuXG5cdGNvbnN0IHBhcnRzID0gcGFydExpbmVzLm1hcFNsaWNlcyhfcGFyc2VTd2l0Y2hMaW5lKGlzVmFsKSlcblx0Y29udGV4dC5jaGVjayhwYXJ0cy5sZW5ndGggPiAwLCB0b2tlbnMubG9jLCAoKSA9PlxuXHRcdGBNdXN0IGhhdmUgYXQgbGVhc3QgMSBub24tJHtjb2RlKCdlbHNlJyl9IHRlc3QuYClcblxuXHRyZXR1cm4gbmV3IChpc1ZhbCA/IFN3aXRjaFZhbCA6IFN3aXRjaERvKSh0b2tlbnMubG9jLCBzd2l0Y2hlZCwgcGFydHMsIG9wRWxzZSlcbn1cbmNvbnN0XG5cdF9wYXJzZVN3aXRjaExpbmUgPSBpc1ZhbCA9PiBsaW5lID0+IHtcblx0XHRjb25zdCBbIGJlZm9yZSwgYmxvY2sgXSA9IGJlZm9yZUFuZEJsb2NrKGxpbmUpXG5cblx0XHRsZXQgdmFsdWVzXG5cdFx0aWYgKGlzS2V5d29yZChLV19PciwgYmVmb3JlLmhlYWQoKSkpXG5cdFx0XHR2YWx1ZXMgPSBiZWZvcmUudGFpbCgpLm1hcChwYXJzZVNpbmdsZSlcblx0XHRlbHNlXG5cdFx0XHR2YWx1ZXMgPSBbIHBhcnNlRXhwcihiZWZvcmUpIF1cblxuXHRcdGNvbnN0IHJlc3VsdCA9IChpc1ZhbCA/IHBhcnNlQmxvY2tWYWwgOiBwYXJzZUJsb2NrRG8pKGJsb2NrKVxuXHRcdHJldHVybiBuZXcgKGlzVmFsID8gU3dpdGNoVmFsUGFydCA6IFN3aXRjaERvUGFydCkobGluZS5sb2MsIHZhbHVlcywgcmVzdWx0KVxuXHR9XG5cbmNvbnN0XG5cdHBhcnNlRXhwciA9IHRva2VucyA9PiB7XG5cdFx0cmV0dXJuIGlmRWxzZSh0b2tlbnMub3BTcGxpdE1hbnlXaGVyZShfID0+IGlzS2V5d29yZChLV19PYmpBc3NpZ24sIF8pKSxcblx0XHRcdHNwbGl0cyA9PiB7XG5cdFx0XHRcdC8vIFNob3J0IG9iamVjdCBmb3JtLCBzdWNoIGFzIChhLiAxLCBiLiAyKVxuXHRcdFx0XHRjb25zdCBmaXJzdCA9IHNwbGl0c1swXS5iZWZvcmVcblx0XHRcdFx0Y2hlY2tOb25FbXB0eShmaXJzdCwgKCkgPT4gYFVuZXhwZWN0ZWQgJHtzcGxpdHNbMF0uYXR9YClcblx0XHRcdFx0Y29uc3QgdG9rZW5zQ2FsbGVyID0gZmlyc3QucnRhaWwoKVxuXG5cdFx0XHRcdGNvbnN0IHBhaXJzID0gWyBdXG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc3BsaXRzLmxlbmd0aCAtIDE7IGkgPSBpICsgMSkge1xuXHRcdFx0XHRcdGNvbnN0IG5hbWUgPSBzcGxpdHNbaV0uYmVmb3JlLmxhc3QoKVxuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2sobmFtZSBpbnN0YW5jZW9mIE5hbWUsIG5hbWUubG9jLCAoKSA9PlxuXHRcdFx0XHRcdFx0YEV4cGVjdGVkIGEgbmFtZSwgbm90ICR7bmFtZX1gKVxuXHRcdFx0XHRcdGNvbnN0IHRva2Vuc1ZhbHVlID0gaSA9PT0gc3BsaXRzLmxlbmd0aCAtIDIgP1xuXHRcdFx0XHRcdFx0c3BsaXRzW2kgKyAxXS5iZWZvcmUgOlxuXHRcdFx0XHRcdFx0c3BsaXRzW2kgKyAxXS5iZWZvcmUucnRhaWwoKVxuXHRcdFx0XHRcdGNvbnN0IHZhbHVlID0gcGFyc2VFeHByUGxhaW4odG9rZW5zVmFsdWUpXG5cdFx0XHRcdFx0Y29uc3QgbG9jID0gbmV3IExvYyhuYW1lLmxvYy5zdGFydCwgdG9rZW5zVmFsdWUubG9jLmVuZClcblx0XHRcdFx0XHRwYWlycy5wdXNoKG5ldyBPYmpQYWlyKGxvYywgbmFtZS5uYW1lLCB2YWx1ZSkpXG5cdFx0XHRcdH1cblx0XHRcdFx0YXNzZXJ0KGxhc3Qoc3BsaXRzKS5hdCA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRjb25zdCB2YWwgPSBuZXcgT2JqU2ltcGxlKHRva2Vucy5sb2MsIHBhaXJzKVxuXHRcdFx0XHRpZiAodG9rZW5zQ2FsbGVyLmlzRW1wdHkoKSlcblx0XHRcdFx0XHRyZXR1cm4gdmFsXG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHModG9rZW5zQ2FsbGVyKVxuXHRcdFx0XHRcdHJldHVybiBuZXcgQ2FsbCh0b2tlbnMubG9jLCBoZWFkKHBhcnRzKSwgcHVzaCh0YWlsKHBhcnRzKSwgdmFsKSlcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdCgpID0+IHBhcnNlRXhwclBsYWluKHRva2Vucylcblx0XHQpXG5cdH0sXG5cblx0cGFyc2VFeHByUGxhaW4gPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHModG9rZW5zKVxuXHRcdHN3aXRjaCAocGFydHMubGVuZ3RoKSB7XG5cdFx0XHRjYXNlIDA6XG5cdFx0XHRcdGNvbnRleHQuZmFpbCh0b2tlbnMubG9jLCAnRXhwZWN0ZWQgYW4gZXhwcmVzc2lvbiwgZ290IG5vdGhpbmcuJylcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0cmV0dXJuIGhlYWQocGFydHMpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gbmV3IENhbGwodG9rZW5zLmxvYywgaGVhZChwYXJ0cyksIHRhaWwocGFydHMpKVxuXHRcdH1cblx0fSxcblxuXHRwYXJzZUV4cHJQYXJ0cyA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3Qgb3BTcGxpdCA9IHRva2Vucy5vcFNwbGl0T25jZVdoZXJlKHRva2VuID0+IHtcblx0XHRcdGlmICh0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0XHRcdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdFx0XHRcdGNhc2UgS1dfQW5kOiBjYXNlIEtXX0Nhc2VWYWw6IGNhc2UgS1dfQ2xhc3M6IGNhc2UgS1dfRXhjZXB0VmFsOiBjYXNlIEtXX0ZvckJhZzpcblx0XHRcdFx0XHRjYXNlIEtXX0ZvclZhbDogY2FzZSBLV19GdW46IGNhc2UgS1dfRnVuRG86IGNhc2UgS1dfRnVuR2VuOiBjYXNlIEtXX0Z1bkdlbkRvOlxuXHRcdFx0XHRcdGNhc2UgS1dfRnVuVGhpczogY2FzZSBLV19GdW5UaGlzRG86IGNhc2UgS1dfRnVuVGhpc0dlbjogY2FzZSBLV19GdW5UaGlzR2VuRG86XG5cdFx0XHRcdFx0Y2FzZSBLV19JZlZhbDogY2FzZSBLV19OZXc6IGNhc2UgS1dfTm90OiBjYXNlIEtXX09yOiBjYXNlIEtXX1N3aXRjaFZhbDpcblx0XHRcdFx0XHRjYXNlIEtXX1VubGVzc1ZhbDogY2FzZSBLV19XaXRoOiBjYXNlIEtXX1lpZWxkOiBjYXNlIEtXX1lpZWxkVG86XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0fSlcblx0XHRyZXR1cm4gaWZFbHNlKG9wU3BsaXQsXG5cdFx0XHQoeyBiZWZvcmUsIGF0LCBhZnRlciB9KSA9PiB7XG5cdFx0XHRcdGNvbnN0IGdldExhc3QgPSAoKSA9PiB7XG5cdFx0XHRcdFx0c3dpdGNoIChhdC5raW5kKSB7XG5cdFx0XHRcdFx0XHRjYXNlIEtXX0FuZDogY2FzZSBLV19Pcjpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBMb2dpYyhhdC5sb2MsIGF0LmtpbmQgPT09IEtXX0FuZCA/IExfQW5kIDogTF9Pcixcblx0XHRcdFx0XHRcdFx0XHRwYXJzZUV4cHJQYXJ0cyhhZnRlcikpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX0Nhc2VWYWw6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUNhc2UodHJ1ZSwgZmFsc2UsIGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19DbGFzczpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlQ2xhc3MoYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX0V4Y2VwdFZhbDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlRXhjZXB0KEtXX0V4Y2VwdFZhbCwgYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX0ZvckJhZzpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlRm9yQmFnKGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19Gb3JWYWw6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUZvclZhbChhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfRnVuOiBjYXNlIEtXX0Z1bkRvOiBjYXNlIEtXX0Z1bkdlbjogY2FzZSBLV19GdW5HZW5Ebzpcblx0XHRcdFx0XHRcdGNhc2UgS1dfRnVuVGhpczogY2FzZSBLV19GdW5UaGlzRG86IGNhc2UgS1dfRnVuVGhpc0dlbjpcblx0XHRcdFx0XHRcdGNhc2UgS1dfRnVuVGhpc0dlbkRvOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VGdW4oYXQua2luZCwgYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX0lmVmFsOiBjYXNlIEtXX1VubGVzc1ZhbDoge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBbIGJlZm9yZSwgYmxvY2sgXSA9IGJlZm9yZUFuZEJsb2NrKGFmdGVyKVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsVmFsKHRva2Vucy5sb2MsXG5cdFx0XHRcdFx0XHRcdFx0cGFyc2VFeHByUGxhaW4oYmVmb3JlKSxcblx0XHRcdFx0XHRcdFx0XHRwYXJzZUJsb2NrVmFsKGJsb2NrKSxcblx0XHRcdFx0XHRcdFx0XHRhdC5raW5kID09PSBLV19Vbmxlc3NWYWwpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjYXNlIEtXX05ldzoge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKGFmdGVyKVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV3IE5ldyhhdC5sb2MsIHBhcnRzWzBdLCB0YWlsKHBhcnRzKSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNhc2UgS1dfTm90OlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV3IE5vdChhdC5sb2MsIHBhcnNlRXhwclBsYWluKGFmdGVyKSlcblx0XHRcdFx0XHRcdGNhc2UgS1dfU3dpdGNoVmFsOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VTd2l0Y2godHJ1ZSwgYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX1dpdGg6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZVdpdGgoYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX1lpZWxkOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV3IFlpZWxkKGF0LmxvYyxcblx0XHRcdFx0XHRcdFx0XHRvcElmKCFhZnRlci5pc0VtcHR5KCksICgpID0+IHBhcnNlRXhwclBsYWluKGFmdGVyKSkpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX1lpZWxkVG86XG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgWWllbGRUbyhhdC5sb2MsIHBhcnNlRXhwclBsYWluKGFmdGVyKSlcblx0XHRcdFx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcihhdC5raW5kKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gcHVzaChiZWZvcmUubWFwKHBhcnNlU2luZ2xlKSwgZ2V0TGFzdCgpKVxuXHRcdFx0fSxcblx0XHRcdCgpID0+IHRva2Vucy5tYXAocGFyc2VTaW5nbGUpKVxuXHR9XG5cbmNvbnN0IHBhcnNlRnVuID0gKGtpbmQsIHRva2VucykgPT4ge1xuXHRsZXQgaXNUaGlzID0gZmFsc2UsIGlzRG8gPSBmYWxzZSwgaXNHZW4gPSBmYWxzZVxuXHRzd2l0Y2ggKGtpbmQpIHtcblx0XHRjYXNlIEtXX0Z1bjpcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5Ebzpcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuR2VuOlxuXHRcdFx0aXNHZW4gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuR2VuRG86XG5cdFx0XHRpc0dlbiA9IHRydWVcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuVGhpczpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5UaGlzRG86XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1blRoaXNHZW46XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRpc0dlbiA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5UaGlzR2VuRG86XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRpc0dlbiA9IHRydWVcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcigpXG5cdH1cblx0Y29uc3Qgb3BEZWNsYXJlVGhpcyA9IG9wSWYoaXNUaGlzLCAoKSA9PiBuZXcgTG9jYWxEZWNsYXJlVGhpcyh0b2tlbnMubG9jKSlcblxuXHRjb25zdCB7IG9wUmV0dXJuVHlwZSwgcmVzdCB9ID0gX3RyeVRha2VSZXR1cm5UeXBlKHRva2Vucylcblx0Y29uc3QgeyBhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBvcEluLCBvcE91dCB9ID0gX2Z1bkFyZ3NBbmRCbG9jayhpc0RvLCByZXN0KVxuXHQvLyBOZWVkIHJlcyBkZWNsYXJlIGlmIHRoZXJlIGlzIGEgcmV0dXJuIHR5cGUgb3Igb3V0IGNvbmRpdGlvbi5cblx0Y29uc3Qgb3BEZWNsYXJlUmVzID0gaWZFbHNlKG9wUmV0dXJuVHlwZSxcblx0XHRfID0+IG5ldyBMb2NhbERlY2xhcmVSZXMoXy5sb2MsIF8pLFxuXHRcdCgpID0+IG9wTWFwKG9wT3V0LCBfID0+IG5ldyBMb2NhbERlY2xhcmVSZXMoXy5sb2MsIG51bGwpKSlcblx0cmV0dXJuIG5ldyBGdW4odG9rZW5zLmxvYyxcblx0XHRvcERlY2xhcmVUaGlzLCBpc0dlbiwgYXJncywgb3BSZXN0QXJnLCBibG9jaywgb3BJbiwgb3BEZWNsYXJlUmVzLCBvcE91dClcbn1cblxuLy8gcGFyc2VGdW4gcHJpdmF0ZXNcbmNvbnN0XG5cdF90cnlUYWtlUmV0dXJuVHlwZSA9IHRva2VucyA9PiB7XG5cdFx0aWYgKCF0b2tlbnMuaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXHRcdFx0aWYgKGlzR3JvdXAoR19TcGFjZSwgaCkgJiYgaXNLZXl3b3JkKEtXX1R5cGUsIGhlYWQoaC5zdWJUb2tlbnMpKSlcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRvcFJldHVyblR5cGU6IHBhcnNlU3BhY2VkKFNsaWNlLmdyb3VwKGgpLnRhaWwoKSksXG5cdFx0XHRcdFx0cmVzdDogdG9rZW5zLnRhaWwoKVxuXHRcdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB7IG9wUmV0dXJuVHlwZTogbnVsbCwgcmVzdDogdG9rZW5zIH1cblx0fSxcblxuXHRfZnVuQXJnc0FuZEJsb2NrID0gKGlzRG8sIHRva2VucykgPT4ge1xuXHRcdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAnRXhwZWN0ZWQgYW4gaW5kZW50ZWQgYmxvY2suJylcblx0XHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXHRcdC8vIE1pZ2h0IGJlIGB8Y2FzZWBcblx0XHRpZiAoaCBpbnN0YW5jZW9mIEtleXdvcmQgJiYgKGgua2luZCA9PT0gS1dfQ2FzZVZhbCB8fCBoLmtpbmQgPT09IEtXX0Nhc2VEbykpIHtcblx0XHRcdGNvbnN0IGVDYXNlID0gcGFyc2VDYXNlKGgua2luZCA9PT0gS1dfQ2FzZVZhbCwgdHJ1ZSwgdG9rZW5zLnRhaWwoKSlcblx0XHRcdGNvbnN0IGFyZ3MgPSBbIG5ldyBMb2NhbERlY2xhcmVGb2N1cyhoLmxvYykgXVxuXHRcdFx0cmV0dXJuIGgua2luZCA9PT0gS1dfQ2FzZVZhbCA/XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhcmdzLCBvcFJlc3RBcmc6IG51bGwsIG9wSW46IG51bGwsIG9wT3V0OiBudWxsLFxuXHRcdFx0XHRcdGJsb2NrOiBuZXcgQmxvY2tXaXRoUmV0dXJuKHRva2Vucy5sb2MsIFsgXSwgZUNhc2UpXG5cdFx0XHRcdH0gOlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YXJncywgb3BSZXN0QXJnOiBudWxsLCBvcEluOiBudWxsLCBvcE91dDogbnVsbCxcblx0XHRcdFx0XHRibG9jazogbmV3IEJsb2NrRG8odG9rZW5zLmxvYywgWyBlQ2FzZSBdKVxuXHRcdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IFsgYmVmb3JlLCBibG9ja0xpbmVzIF0gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdFx0XHRjb25zdCB7IGFyZ3MsIG9wUmVzdEFyZyB9ID0gX3BhcnNlRnVuTG9jYWxzKGJlZm9yZSlcblx0XHRcdGZvciAoY29uc3QgYXJnIG9mIGFyZ3MpXG5cdFx0XHRcdGlmICghYXJnLmlzTGF6eSgpKVxuXHRcdFx0XHRcdGFyZy5raW5kID0gTERfTXV0YWJsZVxuXHRcdFx0Y29uc3QgWyBvcEluLCByZXN0MCBdID0gX3RyeVRha2VJbk9yT3V0KEtXX0luLCBibG9ja0xpbmVzKVxuXHRcdFx0Y29uc3QgWyBvcE91dCwgcmVzdDEgXSA9IF90cnlUYWtlSW5Pck91dChLV19PdXQsIHJlc3QwKVxuXHRcdFx0Y29uc3QgYmxvY2sgPSAoaXNEbyA/IHBhcnNlQmxvY2tEbyA6IHBhcnNlQmxvY2tWYWwpKHJlc3QxKVxuXHRcdFx0cmV0dXJuIHsgYXJncywgb3BSZXN0QXJnLCBibG9jaywgb3BJbiwgb3BPdXQgfVxuXHRcdH1cblx0fSxcblxuXHRfcGFyc2VGdW5Mb2NhbHMgPSB0b2tlbnMgPT4ge1xuXHRcdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdFx0cmV0dXJuIHsgYXJnczogW10sIG9wUmVzdEFyZzogbnVsbCB9XG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBsID0gdG9rZW5zLmxhc3QoKVxuXHRcdFx0aWYgKGwgaW5zdGFuY2VvZiBEb3ROYW1lKSB7XG5cdFx0XHRcdGNvbnRleHQuY2hlY2sobC5uRG90cyA9PT0gMywgbC5sb2MsICdTcGxhdCBhcmd1bWVudCBtdXN0IGhhdmUgZXhhY3RseSAzIGRvdHMnKVxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdGFyZ3M6IHBhcnNlTG9jYWxEZWNsYXJlcyh0b2tlbnMucnRhaWwoKSksXG5cdFx0XHRcdFx0b3BSZXN0QXJnOiBMb2NhbERlY2xhcmUucGxhaW4obC5sb2MsIGwubmFtZSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSByZXR1cm4geyBhcmdzOiBwYXJzZUxvY2FsRGVjbGFyZXModG9rZW5zKSwgb3BSZXN0QXJnOiBudWxsIH1cblx0XHR9XG5cdH0sXG5cblx0X3RyeVRha2VJbk9yT3V0ID0gKGluT3JPdXQsIHRva2VucykgPT4ge1xuXHRcdGlmICghdG9rZW5zLmlzRW1wdHkoKSkge1xuXHRcdFx0Y29uc3QgZmlyc3RMaW5lID0gdG9rZW5zLmhlYWRTbGljZSgpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKGluT3JPdXQsIGZpcnN0TGluZS5oZWFkKCkpKSB7XG5cdFx0XHRcdGNvbnN0IGluT3V0ID0gbmV3IERlYnVnKFxuXHRcdFx0XHRcdGZpcnN0TGluZS5sb2MsXG5cdFx0XHRcdFx0cGFyc2VMaW5lc0Zyb21CbG9jayhmaXJzdExpbmUpKVxuXHRcdFx0XHRyZXR1cm4gWyBpbk91dCwgdG9rZW5zLnRhaWwoKSBdXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBbIG51bGwsIHRva2VucyBdXG5cdH1cblxuY29uc3Rcblx0cGFyc2VMaW5lID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBoZWFkID0gdG9rZW5zLmhlYWQoKVxuXHRcdGNvbnN0IHJlc3QgPSB0b2tlbnMudGFpbCgpXG5cblx0XHRjb25zdCBub1Jlc3QgPSAoKSA9PlxuXHRcdFx0Y2hlY2tFbXB0eShyZXN0LCAoKSA9PiBgRGlkIG5vdCBleHBlY3QgYW55dGhpbmcgYWZ0ZXIgJHtoZWFkfWApXG5cblx0XHQvLyBXZSBvbmx5IGRlYWwgd2l0aCBtdXRhYmxlIGV4cHJlc3Npb25zIGhlcmUsIG90aGVyd2lzZSB3ZSBmYWxsIGJhY2sgdG8gcGFyc2VFeHByLlxuXHRcdGlmIChoZWFkIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRcdHN3aXRjaCAoaGVhZC5raW5kKSB7XG5cdFx0XHRcdGNhc2UgS1dfQXNzZXJ0OiBjYXNlIEtXX0Fzc2VydE5vdDpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VBc3NlcnQoaGVhZC5raW5kID09PSBLV19Bc3NlcnROb3QsIHJlc3QpXG5cdFx0XHRcdGNhc2UgS1dfRXhjZXB0RG86XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlRXhjZXB0KEtXX0V4Y2VwdERvLCByZXN0KVxuXHRcdFx0XHRjYXNlIEtXX0JyZWFrOlxuXHRcdFx0XHRcdG5vUmVzdCgpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBCcmVhayh0b2tlbnMubG9jKVxuXHRcdFx0XHRjYXNlIEtXX0JyZWFrV2l0aFZhbDpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEJyZWFrV2l0aFZhbCh0b2tlbnMubG9jLCBwYXJzZUV4cHIocmVzdCkpXG5cdFx0XHRcdGNhc2UgS1dfQ2FzZURvOlxuXHRcdFx0XHRcdHJldHVybiBwYXJzZUNhc2UoZmFsc2UsIGZhbHNlLCByZXN0KVxuXHRcdFx0XHRjYXNlIEtXX0RlYnVnOlxuXHRcdFx0XHRcdHJldHVybiBuZXcgRGVidWcodG9rZW5zLmxvYyxcblx0XHRcdFx0XHRcdGlzR3JvdXAoR19CbG9jaywgdG9rZW5zLnNlY29uZCgpKSA/XG5cdFx0XHRcdFx0XHQvLyBgZGVidWdgLCB0aGVuIGluZGVudGVkIGJsb2NrXG5cdFx0XHRcdFx0XHRwYXJzZUxpbmVzRnJvbUJsb2NrKCkgOlxuXHRcdFx0XHRcdFx0Ly8gYGRlYnVnYCwgdGhlbiBzaW5nbGUgbGluZVxuXHRcdFx0XHRcdFx0cGFyc2VMaW5lT3JMaW5lcyhyZXN0KSlcblx0XHRcdFx0Y2FzZSBLV19EZWJ1Z2dlcjpcblx0XHRcdFx0XHRub1Jlc3QoKVxuXHRcdFx0XHRcdHJldHVybiBuZXcgU3BlY2lhbERvKHRva2Vucy5sb2MsIFNEX0RlYnVnZ2VyKVxuXHRcdFx0XHRjYXNlIEtXX0VsbGlwc2lzOlxuXHRcdFx0XHRcdHJldHVybiBuZXcgQmFnRW50cnlNYW55KHRva2Vucy5sb2MsIHBhcnNlRXhwcihyZXN0KSlcblx0XHRcdFx0Y2FzZSBLV19Gb3JEbzpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VGb3JEbyhyZXN0KVxuXHRcdFx0XHRjYXNlIEtXX0lnbm9yZTpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VJZ25vcmUocmVzdClcblx0XHRcdFx0Y2FzZSBLV19JZkRvOiBjYXNlIEtXX1VubGVzc0RvOiB7XG5cdFx0XHRcdFx0Y29uc3QgWyBiZWZvcmUsIGJsb2NrIF0gPSBiZWZvcmVBbmRCbG9jayhyZXN0KVxuXHRcdFx0XHRcdHJldHVybiBuZXcgQ29uZGl0aW9uYWxEbyh0b2tlbnMubG9jLFxuXHRcdFx0XHRcdFx0cGFyc2VFeHByKGJlZm9yZSksXG5cdFx0XHRcdFx0XHRwYXJzZUJsb2NrRG8oYmxvY2spLFxuXHRcdFx0XHRcdFx0aGVhZC5raW5kID09PSBLV19Vbmxlc3NEbylcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlIEtXX09iakFzc2lnbjpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEJhZ0VudHJ5KHRva2Vucy5sb2MsIHBhcnNlRXhwcihyZXN0KSlcblx0XHRcdFx0Y2FzZSBLV19QYXNzOlxuXHRcdFx0XHRcdG5vUmVzdCgpXG5cdFx0XHRcdFx0cmV0dXJuIFsgXVxuXHRcdFx0XHRjYXNlIEtXX1JlZ2lvbjpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VMaW5lc0Zyb21CbG9jayh0b2tlbnMpXG5cdFx0XHRcdGNhc2UgS1dfU3dpdGNoRG86XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlU3dpdGNoKGZhbHNlLCByZXN0KVxuXHRcdFx0XHRjYXNlIEtXX1Rocm93OlxuXHRcdFx0XHRcdHJldHVybiBuZXcgVGhyb3codG9rZW5zLmxvYywgb3BJZighcmVzdC5pc0VtcHR5KCksICgpID0+IHBhcnNlRXhwcihyZXN0KSkpXG5cdFx0XHRcdGNhc2UgS1dfTmFtZTpcblx0XHRcdFx0XHRpZiAoaXNLZXl3b3JkKEtXX09iakFzc2lnbiwgcmVzdC5oZWFkKCkpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCByID0gcmVzdC50YWlsKClcblx0XHRcdFx0XHRcdGNvbnN0IHZhbCA9IHIuaXNFbXB0eSgpID8gbmV3IFNwZWNpYWxWYWwodG9rZW5zLmxvYywgU1ZfTmFtZSkgOiBwYXJzZUV4cHIocilcblx0XHRcdFx0XHRcdHJldHVybiBPYmpFbnRyeUNvbXB1dGVkLm5hbWUodG9rZW5zLmxvYywgdmFsKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBlbHNlIGZhbGx0aHJvdWdoXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Ly8gZmFsbCB0aHJvdWdoXG5cdFx0XHR9XG5cblx0XHRyZXR1cm4gaWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZVdoZXJlKF9pc0xpbmVTcGxpdEtleXdvcmQpLFxuXHRcdFx0KHsgYmVmb3JlLCBhdCwgYWZ0ZXIgfSkgPT4gX3BhcnNlQXNzaWduTGlrZShiZWZvcmUsIGF0LCBhZnRlciwgdG9rZW5zLmxvYyksXG5cdFx0XHQoKSA9PiBwYXJzZUV4cHIodG9rZW5zKSlcblx0fSxcblxuXHRwYXJzZUxpbmVPckxpbmVzID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBfID0gcGFyc2VMaW5lKHRva2Vucylcblx0XHRyZXR1cm4gXyBpbnN0YW5jZW9mIEFycmF5ID8gXyA6IFsgXyBdXG5cdH1cblxuLy8gcGFyc2VMaW5lIHByaXZhdGVzXG5jb25zdFxuXHRfaXNMaW5lU3BsaXRLZXl3b3JkID0gdG9rZW4gPT4ge1xuXHRcdGlmICh0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBLV19Bc3NpZ246IGNhc2UgS1dfQXNzaWduTXV0YWJsZTogY2FzZSBLV19Mb2NhbE11dGF0ZTpcblx0XHRcdFx0Y2FzZSBLV19NYXBFbnRyeTogY2FzZSBLV19PYmpBc3NpZ246IGNhc2UgS1dfWWllbGQ6IGNhc2UgS1dfWWllbGRUbzpcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0fVxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBmYWxzZVxuXHR9LFxuXG5cdF9wYXJzZUFzc2lnbkxpa2UgPSAoYmVmb3JlLCBhdCwgYWZ0ZXIsIGxvYykgPT4ge1xuXHRcdGlmIChhdC5raW5kID09PSBLV19NYXBFbnRyeSlcblx0XHRcdHJldHVybiBuZXcgTWFwRW50cnkobG9jLCBwYXJzZUV4cHIoYmVmb3JlKSwgcGFyc2VFeHByKGFmdGVyKSlcblxuXHRcdC8vIFRPRE86IFRoaXMgY29kZSBpcyBraW5kIG9mIHVnbHkuXG5cdFx0Ly8gSXQgcGFyc2VzIGB4LnkgPSB6YCBhbmQgdGhlIGxpa2UuXG5cdFx0aWYgKGJlZm9yZS5zaXplKCkgPT09IDEpIHtcblx0XHRcdGNvbnN0IHRva2VuID0gYmVmb3JlLmhlYWQoKVxuXHRcdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgRG90TmFtZSlcblx0XHRcdFx0cmV0dXJuIF9wYXJzZU1lbWJlclNldChcdExvY2FsQWNjZXNzLnRoaXModG9rZW4ubG9jKSwgdG9rZW4ubmFtZSwgYXQsIGFmdGVyLCBsb2MpXG5cdFx0XHRpZiAoaXNHcm91cChHX1NwYWNlLCB0b2tlbikpIHtcblx0XHRcdFx0Y29uc3Qgc3BhY2VkID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0XHRcdGNvbnN0IGRvdCA9IHNwYWNlZC5sYXN0KClcblx0XHRcdFx0aWYgKGRvdCBpbnN0YW5jZW9mIERvdE5hbWUpIHtcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKGRvdC5uRG90cyA9PT0gMSwgZG90LmxvYywgJ011c3QgaGF2ZSBvbmx5IDEgYC5gLicpXG5cdFx0XHRcdFx0cmV0dXJuIF9wYXJzZU1lbWJlclNldChwYXJzZVNwYWNlZChzcGFjZWQucnRhaWwoKSksIGRvdC5uYW1lLCBhdCwgYWZ0ZXIsIGxvYylcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBhdC5raW5kID09PSBLV19Mb2NhbE11dGF0ZSA/XG5cdFx0XHRfcGFyc2VMb2NhbE11dGF0ZShiZWZvcmUsIGFmdGVyLCBsb2MpIDpcblx0XHRcdF9wYXJzZUFzc2lnbihiZWZvcmUsIGF0LCBhZnRlciwgbG9jKVxuXHR9LFxuXG5cdF9wYXJzZU1lbWJlclNldCA9IChvYmplY3QsIG5hbWUsIGF0LCBhZnRlciwgbG9jKSA9PlxuXHRcdG5ldyBNZW1iZXJTZXQobG9jLCBvYmplY3QsIG5hbWUsIF9tZW1iZXJTZXRLaW5kKGF0KSwgcGFyc2VFeHByKGFmdGVyKSksXG5cdF9tZW1iZXJTZXRLaW5kID0gYXQgPT4ge1xuXHRcdHN3aXRjaCAoYXQua2luZCkge1xuXHRcdFx0Y2FzZSBLV19Bc3NpZ246IHJldHVybiBNU19OZXdcblx0XHRcdGNhc2UgS1dfQXNzaWduTXV0YWJsZTogcmV0dXJuIE1TX05ld011dGFibGVcblx0XHRcdGNhc2UgS1dfTG9jYWxNdXRhdGU6IHJldHVybiBNU19NdXRhdGVcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcigpXG5cdFx0fVxuXHR9LFxuXG5cdF9wYXJzZUxvY2FsTXV0YXRlID0gKGxvY2Fsc1Rva2VucywgdmFsdWVUb2tlbnMsIGxvYykgPT4ge1xuXHRcdGNvbnN0IGxvY2FscyA9IHBhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcyhsb2NhbHNUb2tlbnMpXG5cdFx0Y29udGV4dC5jaGVjayhsb2NhbHMubGVuZ3RoID09PSAxLCBsb2MsICdUT0RPOiBMb2NhbERlc3RydWN0dXJlTXV0YXRlJylcblx0XHRjb25zdCBuYW1lID0gbG9jYWxzWzBdLm5hbWVcblx0XHRjb25zdCB2YWx1ZSA9IHBhcnNlRXhwcih2YWx1ZVRva2Vucylcblx0XHRyZXR1cm4gbmV3IExvY2FsTXV0YXRlKGxvYywgbmFtZSwgdmFsdWUpXG5cdH0sXG5cblx0X3BhcnNlQXNzaWduID0gKGxvY2Fsc1Rva2VucywgYXNzaWduZXIsIHZhbHVlVG9rZW5zLCBsb2MpID0+IHtcblx0XHRjb25zdCBraW5kID0gYXNzaWduZXIua2luZFxuXHRcdGNvbnN0IGxvY2FscyA9IHBhcnNlTG9jYWxEZWNsYXJlcyhsb2NhbHNUb2tlbnMpXG5cdFx0Y29uc3Qgb3BOYW1lID0gb3BJZihsb2NhbHMubGVuZ3RoID09PSAxLCAoKSA9PiBsb2NhbHNbMF0ubmFtZSlcblx0XHRjb25zdCB2YWx1ZSA9IF9wYXJzZUFzc2lnblZhbHVlKGtpbmQsIG9wTmFtZSwgdmFsdWVUb2tlbnMpXG5cblx0XHRjb25zdCBpc1lpZWxkID0ga2luZCA9PT0gS1dfWWllbGQgfHwga2luZCA9PT0gS1dfWWllbGRUb1xuXHRcdGlmIChpc0VtcHR5KGxvY2FscykpIHtcblx0XHRcdGNvbnRleHQuY2hlY2soaXNZaWVsZCwgbG9jYWxzVG9rZW5zLmxvYywgJ0Fzc2lnbm1lbnQgdG8gbm90aGluZycpXG5cdFx0XHRyZXR1cm4gdmFsdWVcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKGlzWWllbGQpXG5cdFx0XHRcdGZvciAoY29uc3QgXyBvZiBsb2NhbHMpXG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayghXy5pc0xhenkoKSwgXy5sb2MsICdDYW4gbm90IHlpZWxkIHRvIGxhenkgdmFyaWFibGUuJylcblxuXHRcdFx0Y29uc3QgaXNPYmpBc3NpZ24gPSBraW5kID09PSBLV19PYmpBc3NpZ25cblxuXHRcdFx0aWYgKGtpbmQgPT09IEtXX0Fzc2lnbk11dGFibGUpXG5cdFx0XHRcdGZvciAobGV0IF8gb2YgbG9jYWxzKSB7XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayghXy5pc0xhenkoKSwgXy5sb2MsICdMYXp5IGxvY2FsIGNhbiBub3QgYmUgbXV0YWJsZS4nKVxuXHRcdFx0XHRcdF8ua2luZCA9IExEX011dGFibGVcblx0XHRcdFx0fVxuXG5cdFx0XHRjb25zdCB3cmFwID0gXyA9PiBpc09iakFzc2lnbiA/IG5ldyBPYmpFbnRyeUFzc2lnbihsb2MsIF8pIDogX1xuXG5cdFx0XHRpZiAobG9jYWxzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRjb25zdCBhc3NpZ25lZSA9IGxvY2Fsc1swXVxuXHRcdFx0XHRjb25zdCBhc3NpZ24gPSBuZXcgQXNzaWduU2luZ2xlKGxvYywgYXNzaWduZWUsIHZhbHVlKVxuXHRcdFx0XHRjb25zdCBpc1Rlc3QgPSBpc09iakFzc2lnbiAmJiBhc3NpZ25lZS5uYW1lLmVuZHNXaXRoKCd0ZXN0Jylcblx0XHRcdFx0cmV0dXJuIGlzVGVzdCA/IG5ldyBEZWJ1Zyhsb2MsIFsgd3JhcChhc3NpZ24pIF0pIDogd3JhcChhc3NpZ24pXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBraW5kID0gbG9jYWxzWzBdLmtpbmRcblx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIGxvY2Fscylcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKF8ua2luZCA9PT0ga2luZCwgXy5sb2MsXG5cdFx0XHRcdFx0XHQnQWxsIGxvY2FscyBvZiBkZXN0cnVjdHVyaW5nIGFzc2lnbm1lbnQgbXVzdCBiZSBvZiB0aGUgc2FtZSBraW5kLicpXG5cdFx0XHRcdHJldHVybiB3cmFwKG5ldyBBc3NpZ25EZXN0cnVjdHVyZShsb2MsIGxvY2FscywgdmFsdWUsIGtpbmQpKVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRfcGFyc2VBc3NpZ25WYWx1ZSA9IChraW5kLCBvcE5hbWUsIHZhbHVlVG9rZW5zKSA9PiB7XG5cdFx0Y29uc3QgdmFsdWUgPSB2YWx1ZVRva2Vucy5pc0VtcHR5KCkgJiYga2luZCA9PT0gS1dfT2JqQXNzaWduID9cblx0XHRcdG5ldyBTcGVjaWFsVmFsKHZhbHVlVG9rZW5zLmxvYywgU1ZfTnVsbCkgOlxuXHRcdFx0cGFyc2VFeHByKHZhbHVlVG9rZW5zKVxuXHRcdHN3aXRjaCAoa2luZCkge1xuXHRcdFx0Y2FzZSBLV19ZaWVsZDpcblx0XHRcdFx0cmV0dXJuIG5ldyBZaWVsZCh2YWx1ZS5sb2MsIHZhbHVlKVxuXHRcdFx0Y2FzZSBLV19ZaWVsZFRvOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFlpZWxkVG8odmFsdWUubG9jLCB2YWx1ZSlcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiB2YWx1ZVxuXHRcdH1cblx0fVxuXG5jb25zdFxuXHRwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMgPSB0b2tlbnMgPT5cblx0XHR0b2tlbnMubWFwKF8gPT4gTG9jYWxEZWNsYXJlLnBsYWluKF8ubG9jLCBfcGFyc2VMb2NhbE5hbWUoXykpKSxcblxuXHRwYXJzZUxvY2FsRGVjbGFyZXMgPSB0b2tlbnMgPT4gdG9rZW5zLm1hcChwYXJzZUxvY2FsRGVjbGFyZSksXG5cblx0cGFyc2VMb2NhbERlY2xhcmUgPSB0b2tlbiA9PiB7XG5cdFx0aWYgKGlzR3JvdXAoR19TcGFjZSwgdG9rZW4pKSB7XG5cdFx0XHRjb25zdCB0b2tlbnMgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRcdGNvbnN0IFsgcmVzdCwgaXNMYXp5IF0gPVxuXHRcdFx0XHRpc0tleXdvcmQoS1dfTGF6eSwgdG9rZW5zLmhlYWQoKSkgPyBbIHRva2Vucy50YWlsKCksIHRydWUgXSA6IFsgdG9rZW5zLCBmYWxzZSBdXG5cdFx0XHRjb25zdCBuYW1lID0gX3BhcnNlTG9jYWxOYW1lKHJlc3QuaGVhZCgpKVxuXHRcdFx0Y29uc3QgcmVzdDIgPSByZXN0LnRhaWwoKVxuXHRcdFx0Y29uc3Qgb3BUeXBlID0gb3BJZighcmVzdDIuaXNFbXB0eSgpLCAoKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGNvbG9uID0gcmVzdDIuaGVhZCgpXG5cdFx0XHRcdGNvbnRleHQuY2hlY2soaXNLZXl3b3JkKEtXX1R5cGUsIGNvbG9uKSwgY29sb24ubG9jLCAoKSA9PiBgRXhwZWN0ZWQgJHtjb2RlKCc6Jyl9YClcblx0XHRcdFx0Y29uc3QgdG9rZW5zVHlwZSA9IHJlc3QyLnRhaWwoKVxuXHRcdFx0XHRjaGVja05vbkVtcHR5KHRva2Vuc1R5cGUsICgpID0+IGBFeHBlY3RlZCBzb21ldGhpbmcgYWZ0ZXIgJHtjb2xvbn1gKVxuXHRcdFx0XHRyZXR1cm4gcGFyc2VTcGFjZWQodG9rZW5zVHlwZSlcblx0XHRcdH0pXG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsRGVjbGFyZSh0b2tlbi5sb2MsIG5hbWUsIG9wVHlwZSwgaXNMYXp5ID8gTERfTGF6eSA6IExEX0NvbnN0KVxuXHRcdH0gZWxzZVxuXHRcdFx0cmV0dXJuIExvY2FsRGVjbGFyZS5wbGFpbih0b2tlbi5sb2MsIF9wYXJzZUxvY2FsTmFtZSh0b2tlbikpXG5cdH1cblxuLy8gcGFyc2VMb2NhbERlY2xhcmUgcHJpdmF0ZXNcbmNvbnN0XG5cdF9wYXJzZUxvY2FsTmFtZSA9IHQgPT4ge1xuXHRcdGlmIChpc0tleXdvcmQoS1dfRm9jdXMsIHQpKVxuXHRcdFx0cmV0dXJuICdfJ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29udGV4dC5jaGVjayh0IGluc3RhbmNlb2YgTmFtZSwgdC5sb2MsICgpID0+IGBFeHBlY3RlZCBhIGxvY2FsIG5hbWUsIG5vdCAke3R9YClcblx0XHRcdHJldHVybiB0Lm5hbWVcblx0XHR9XG5cdH1cblxuY29uc3QgcGFyc2VTaW5nbGUgPSB0b2tlbiA9PiB7XG5cdGNvbnN0IHsgbG9jIH0gPSB0b2tlblxuXHRpZiAodG9rZW4gaW5zdGFuY2VvZiBOYW1lKVxuXHRcdHJldHVybiBuZXcgTG9jYWxBY2Nlc3MobG9jLCB0b2tlbi5uYW1lKVxuXHRlbHNlIGlmICh0b2tlbiBpbnN0YW5jZW9mIEdyb3VwKSB7XG5cdFx0Y29uc3Qgc2xpY2UgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdGNhc2UgR19TcGFjZTpcblx0XHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkKHNsaWNlKVxuXHRcdFx0Y2FzZSBHX1BhcmVudGhlc2lzOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VFeHByKHNsaWNlKVxuXHRcdFx0Y2FzZSBHX0JyYWNrZXQ6XG5cdFx0XHRcdHJldHVybiBuZXcgQmFnU2ltcGxlKGxvYywgcGFyc2VFeHByUGFydHMoc2xpY2UpKVxuXHRcdFx0Y2FzZSBHX0Jsb2NrOlxuXHRcdFx0XHRyZXR1cm4gYmxvY2tXcmFwKHNsaWNlKVxuXHRcdFx0Y2FzZSBHX1F1b3RlOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VRdW90ZShzbGljZSlcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcih0b2tlbi5raW5kKVxuXHRcdH1cblx0fSBlbHNlIGlmICh0b2tlbiBpbnN0YW5jZW9mIE51bWJlckxpdGVyYWwpXG5cdFx0cmV0dXJuIHRva2VuXG5cdGVsc2UgaWYgKHRva2VuIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdGNhc2UgS1dfRm9jdXM6XG5cdFx0XHRcdHJldHVybiBMb2NhbEFjY2Vzcy5mb2N1cyhsb2MpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gaWZFbHNlKG9wS2V5d29yZEtpbmRUb1NwZWNpYWxWYWx1ZUtpbmQodG9rZW4ua2luZCksXG5cdFx0XHRcdFx0XyA9PiBuZXcgU3BlY2lhbFZhbChsb2MsIF8pLFxuXHRcdFx0XHRcdCgpID0+IHVuZXhwZWN0ZWQodG9rZW4pKVxuXG5cdFx0fVxuXHRlbHNlIGlmICh0b2tlbiBpbnN0YW5jZW9mIERvdE5hbWUpXG5cdFx0c3dpdGNoICh0b2tlbi5uRG90cykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRyZXR1cm4gbmV3IE1lbWJlcih0b2tlbi5sb2MsIExvY2FsQWNjZXNzLnRoaXModG9rZW4ubG9jKSwgdG9rZW4ubmFtZSlcblx0XHRcdGNhc2UgMzpcblx0XHRcdFx0cmV0dXJuIG5ldyBTcGxhdChsb2MsIG5ldyBMb2NhbEFjY2Vzcyhsb2MsIHRva2VuLm5hbWUpKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dW5leHBlY3RlZCh0b2tlbilcblx0XHR9XG5cdGVsc2Vcblx0XHR1bmV4cGVjdGVkKHRva2VuKVxufVxuXG5jb25zdCBwYXJzZVNwYWNlZCA9IHRva2VucyA9PiB7XG5cdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpLCByZXN0ID0gdG9rZW5zLnRhaWwoKVxuXHRpZiAoaXNLZXl3b3JkKEtXX1R5cGUsIGgpKVxuXHRcdHJldHVybiBDYWxsLmNvbnRhaW5zKGgubG9jLCBwYXJzZVNwYWNlZChyZXN0KSwgTG9jYWxBY2Nlc3MuZm9jdXMoaC5sb2MpKVxuXHRlbHNlIGlmIChpc0tleXdvcmQoS1dfTGF6eSwgaCkpXG5cdFx0cmV0dXJuIG5ldyBMYXp5KGgubG9jLCBwYXJzZVNwYWNlZChyZXN0KSlcblx0ZWxzZSB7XG5cdFx0bGV0IGFjYyA9IHBhcnNlU2luZ2xlKGgpXG5cdFx0Zm9yIChsZXQgaSA9IHJlc3Quc3RhcnQ7IGkgPCByZXN0LmVuZDsgaSA9IGkgKyAxKSB7XG5cdFx0XHRjb25zdCB0b2tlbiA9IHJlc3QudG9rZW5zW2ldXG5cdFx0XHRjb25zdCBsb2MgPSB0b2tlbi5sb2Ncblx0XHRcdGlmICh0b2tlbiBpbnN0YW5jZW9mIERvdE5hbWUpIHtcblx0XHRcdFx0Y29udGV4dC5jaGVjayh0b2tlbi5uRG90cyA9PT0gMSwgdG9rZW4ubG9jLCAnVG9vIG1hbnkgZG90cyEnKVxuXHRcdFx0XHRhY2MgPSBuZXcgTWVtYmVyKHRva2VuLmxvYywgYWNjLCB0b2tlbi5uYW1lKVxuXHRcdFx0XHRjb250aW51ZVxuXHRcdFx0fVxuXHRcdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRcdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRcdFx0Y2FzZSBLV19Gb2N1czpcblx0XHRcdFx0XHRcdGFjYyA9IG5ldyBDYWxsKHRva2VuLmxvYywgYWNjLCBbIExvY2FsQWNjZXNzLmZvY3VzKGxvYykgXSlcblx0XHRcdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRcdFx0Y2FzZSBLV19UeXBlOiB7XG5cdFx0XHRcdFx0XHRjb25zdCB0eXBlID0gcGFyc2VTcGFjZWQodG9rZW5zLl9jaG9wU3RhcnQoaSArIDEpKVxuXHRcdFx0XHRcdFx0cmV0dXJuIENhbGwuY29udGFpbnModG9rZW4ubG9jLCB0eXBlLCBhY2MpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdH1cblx0XHRcdGlmICh0b2tlbiBpbnN0YW5jZW9mIEdyb3VwKSB7XG5cdFx0XHRcdGNvbnN0IHNsaWNlID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0XHRcdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdFx0XHRcdGNhc2UgR19CcmFja2V0OlxuXHRcdFx0XHRcdFx0YWNjID0gQ2FsbC5zdWIobG9jLCB1bnNoaWZ0KGFjYywgcGFyc2VFeHByUGFydHMoc2xpY2UpKSlcblx0XHRcdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRcdFx0Y2FzZSBHX1BhcmVudGhlc2lzOlxuXHRcdFx0XHRcdFx0Y2hlY2tFbXB0eShzbGljZSwgKCkgPT5cblx0XHRcdFx0XHRcdFx0YFVzZSAke2NvZGUoJyhhIGIpJyl9LCBub3QgJHtjb2RlKCdhKGIpJyl9YClcblx0XHRcdFx0XHRcdGFjYyA9IG5ldyBDYWxsKGxvYywgYWNjLCBbXSlcblx0XHRcdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRcdFx0Y2FzZSBHX1F1b3RlOlxuXHRcdFx0XHRcdFx0YWNjID0gbmV3IFF1b3RlVGVtcGxhdGUobG9jLCBhY2MsIHBhcnNlUXVvdGUoc2xpY2UpKVxuXHRcdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjb250ZXh0LmZhaWwodG9rZW5zLmxvYywgYEV4cGVjdGVkIG1lbWJlciBvciBzdWIsIG5vdCAke3Rva2VufWApXG5cdFx0fVxuXHRcdHJldHVybiBhY2Ncblx0fVxufVxuXG5jb25zdCB0cnlQYXJzZVVzZXMgPSAodXNlS2V5d29yZEtpbmQsIHRva2VucykgPT4ge1xuXHRpZiAoIXRva2Vucy5pc0VtcHR5KCkpIHtcblx0XHRjb25zdCBsaW5lMCA9IHRva2Vucy5oZWFkU2xpY2UoKVxuXHRcdGlmIChpc0tleXdvcmQodXNlS2V5d29yZEtpbmQsIGxpbmUwLmhlYWQoKSkpIHtcblx0XHRcdGNvbnN0IHsgdXNlcywgb3BVc2VHbG9iYWwgfSA9IF9wYXJzZVVzZXModXNlS2V5d29yZEtpbmQsIGxpbmUwLnRhaWwoKSlcblx0XHRcdGlmIChuZXcgU2V0KFsgS1dfVXNlRG8sIEtXX1VzZUxhenksIEtXX1VzZURlYnVnIF0pLmhhcyh1c2VLZXl3b3JkS2luZCkpXG5cdFx0XHRcdGNvbnRleHQuY2hlY2sob3BVc2VHbG9iYWwgPT09IG51bGwsIGxpbmUwLmxvYywgJ0NhblxcJ3QgdXNlIGdsb2JhbCBoZXJlLicpXG5cdFx0XHRyZXR1cm4geyB1c2VzLCBvcFVzZUdsb2JhbCwgcmVzdDogdG9rZW5zLnRhaWwoKSB9XG5cdFx0fVxuXHR9XG5cdHJldHVybiB7IHVzZXM6IFsgXSwgb3BVc2VHbG9iYWw6IG51bGwsIHJlc3Q6IHRva2VucyB9XG59XG5cbi8vIHRyeVBhcnNlVXNlIHByaXZhdGVzXG5jb25zdFxuXHRfcGFyc2VVc2VzID0gKHVzZUtleXdvcmRLaW5kLCB0b2tlbnMpID0+IHtcblx0XHRjb25zdCBsaW5lcyA9IGp1c3RCbG9jayh1c2VLZXl3b3JkS2luZCwgdG9rZW5zKVxuXHRcdGxldCBvcFVzZUdsb2JhbCA9IG51bGxcblxuXHRcdGNvbnN0IHVzZXMgPSBbIF1cblxuXHRcdGZvciAoY29uc3QgbGluZSBvZiBsaW5lcy5zbGljZXMoKSkge1xuXHRcdFx0Y29uc3QgeyBwYXRoLCBuYW1lIH0gPSBfcGFyc2VSZXF1aXJlKGxpbmUuaGVhZCgpKVxuXHRcdFx0aWYgKHVzZUtleXdvcmRLaW5kID09PSBLV19Vc2VEbykge1xuXHRcdFx0XHRpZiAobGluZS5zaXplKCkgPiAxKVxuXHRcdFx0XHRcdHVuZXhwZWN0ZWQobGluZS5zZWNvbmQoKSlcblx0XHRcdFx0dXNlcy5wdXNoKG5ldyBVc2VEbyhsaW5lLmxvYywgcGF0aCkpXG5cdFx0XHR9IGVsc2Vcblx0XHRcdFx0aWYgKHBhdGggPT09ICdnbG9iYWwnKSB7XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayhvcFVzZUdsb2JhbCA9PT0gbnVsbCwgbGluZS5sb2MsICdDYW5cXCd0IHVzZSBnbG9iYWwgdHdpY2UnKVxuXHRcdFx0XHRcdGNvbnN0IHsgdXNlZCwgb3BVc2VEZWZhdWx0IH0gPSBfcGFyc2VUaGluZ3NVc2VkKG5hbWUsIGZhbHNlLCBsaW5lLnRhaWwoKSlcblx0XHRcdFx0XHRvcFVzZUdsb2JhbCA9IG5ldyBVc2VHbG9iYWwobGluZS5sb2MsIHVzZWQsIG9wVXNlRGVmYXVsdClcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBpc0xhenkgPSB1c2VLZXl3b3JkS2luZCA9PT0gS1dfVXNlTGF6eSB8fCB1c2VLZXl3b3JkS2luZCA9PT0gS1dfVXNlRGVidWdcblx0XHRcdFx0XHRjb25zdCB7IHVzZWQsIG9wVXNlRGVmYXVsdCB9ID0gX3BhcnNlVGhpbmdzVXNlZChuYW1lLCBpc0xhenksIGxpbmUudGFpbCgpKVxuXHRcdFx0XHRcdHVzZXMucHVzaChuZXcgVXNlKGxpbmUubG9jLCBwYXRoLCB1c2VkLCBvcFVzZURlZmF1bHQpKVxuXHRcdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHsgdXNlcywgb3BVc2VHbG9iYWwgfVxuXHR9LFxuXHRfcGFyc2VUaGluZ3NVc2VkID0gKG5hbWUsIGlzTGF6eSwgdG9rZW5zKSA9PiB7XG5cdFx0Y29uc3QgdXNlRGVmYXVsdCA9ICgpID0+IExvY2FsRGVjbGFyZS51bnR5cGVkKHRva2Vucy5sb2MsIG5hbWUsIGlzTGF6eSA/IExEX0xhenkgOiBMRF9Db25zdClcblx0XHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRcdHJldHVybiB7IHVzZWQ6IFsgXSwgb3BVc2VEZWZhdWx0OiB1c2VEZWZhdWx0KCkgfVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgWyBvcFVzZURlZmF1bHQsIHJlc3QgXSA9XG5cdFx0XHRcdGlzS2V5d29yZChLV19Gb2N1cywgdG9rZW5zLmhlYWQoKSkgP1xuXHRcdFx0XHRcdFsgdXNlRGVmYXVsdCgpLCB0b2tlbnMudGFpbCgpIF0gOlxuXHRcdFx0XHRcdFsgbnVsbCwgdG9rZW5zIF1cblx0XHRcdGNvbnN0IHVzZWQgPSBwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMocmVzdCkubWFwKGwgPT4ge1xuXHRcdFx0XHRjb250ZXh0LmNoZWNrKGwubmFtZSAhPT0gJ18nLCBsLnBvcyxcblx0XHRcdFx0XHQoKSA9PiBgJHtjb2RlKCdfJyl9IG5vdCBhbGxvd2VkIGFzIGltcG9ydCBuYW1lLmApXG5cdFx0XHRcdGlmIChpc0xhenkpXG5cdFx0XHRcdFx0bC5raW5kID0gTERfTGF6eVxuXHRcdFx0XHRyZXR1cm4gbFxuXHRcdFx0fSlcblx0XHRcdHJldHVybiB7IHVzZWQsIG9wVXNlRGVmYXVsdCB9XG5cdFx0fVxuXHR9LFxuXHRfcGFyc2VSZXF1aXJlID0gdCA9PiB7XG5cdFx0aWYgKHQgaW5zdGFuY2VvZiBOYW1lKVxuXHRcdFx0cmV0dXJuIHsgcGF0aDogdC5uYW1lLCBuYW1lOiB0Lm5hbWUgfVxuXHRcdGVsc2UgaWYgKHQgaW5zdGFuY2VvZiBEb3ROYW1lKVxuXHRcdFx0cmV0dXJuIHsgcGF0aDogcHVzaChfcGFydHNGcm9tRG90TmFtZSh0KSwgdC5uYW1lKS5qb2luKCcvJyksIG5hbWU6IHQubmFtZSB9XG5cdFx0ZWxzZSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKGlzR3JvdXAoR19TcGFjZSwgdCksIHQubG9jLCAnTm90IGEgdmFsaWQgbW9kdWxlIG5hbWUuJylcblx0XHRcdHJldHVybiBfcGFyc2VTcGFjZWRSZXF1aXJlKFNsaWNlLmdyb3VwKHQpKVxuXHRcdH1cblx0fSxcblx0X3BhcnNlU3BhY2VkUmVxdWlyZSA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgZmlyc3QgPSB0b2tlbnMuaGVhZCgpXG5cdFx0bGV0IHBhcnRzXG5cdFx0aWYgKGZpcnN0IGluc3RhbmNlb2YgRG90TmFtZSlcblx0XHRcdHBhcnRzID0gX3BhcnRzRnJvbURvdE5hbWUoZmlyc3QpXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKGZpcnN0IGluc3RhbmNlb2YgTmFtZSwgZmlyc3QubG9jLCAnTm90IGEgdmFsaWQgcGFydCBvZiBtb2R1bGUgcGF0aC4nKVxuXHRcdFx0cGFydHMgPSBbIF1cblx0XHR9XG5cdFx0cGFydHMucHVzaChmaXJzdC5uYW1lKVxuXHRcdGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zLnRhaWwoKSkge1xuXHRcdFx0Y29udGV4dC5jaGVjayh0b2tlbiBpbnN0YW5jZW9mIERvdE5hbWUgJiYgdG9rZW4ubkRvdHMgPT09IDEsIHRva2VuLmxvYyxcblx0XHRcdFx0J05vdCBhIHZhbGlkIHBhcnQgb2YgbW9kdWxlIHBhdGguJylcblx0XHRcdHBhcnRzLnB1c2godG9rZW4ubmFtZSlcblx0XHR9XG5cdFx0cmV0dXJuIHsgcGF0aDogcGFydHMuam9pbignLycpLCBuYW1lOiB0b2tlbnMubGFzdCgpLm5hbWUgfVxuXHR9LFxuXHRfcGFydHNGcm9tRG90TmFtZSA9IGRvdE5hbWUgPT5cblx0XHRkb3ROYW1lLm5Eb3RzID09PSAxID8gWyAnLicgXSA6IHJlcGVhdCgnLi4nLCBkb3ROYW1lLm5Eb3RzIC0gMSlcblxuY29uc3Rcblx0X3BhcnNlRm9yID0gY3RyID0+IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgWyBiZWZvcmUsIGJsb2NrIF0gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdFx0cmV0dXJuIG5ldyBjdHIodG9rZW5zLmxvYywgX3BhcnNlT3BJdGVyYXRlZShiZWZvcmUpLCBwYXJzZUJsb2NrRG8oYmxvY2spKVxuXHR9LFxuXHRfcGFyc2VPcEl0ZXJhdGVlID0gdG9rZW5zID0+XG5cdFx0b3BJZighdG9rZW5zLmlzRW1wdHkoKSwgKCkgPT4ge1xuXHRcdFx0Y29uc3QgWyBlbGVtZW50LCBiYWcgXSA9XG5cdFx0XHRcdGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2VXaGVyZShfID0+IGlzS2V5d29yZChLV19JbiwgXykpLFxuXHRcdFx0XHRcdCh7IGJlZm9yZSwgYWZ0ZXIgfSkgPT4ge1xuXHRcdFx0XHRcdFx0Y29udGV4dC5jaGVjayhiZWZvcmUuc2l6ZSgpID09PSAxLCBiZWZvcmUubG9jLCAnVE9ETzogcGF0dGVybiBpbiBmb3InKVxuXHRcdFx0XHRcdFx0cmV0dXJuIFsgcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKGJlZm9yZSlbMF0sIHBhcnNlRXhwcihhZnRlcikgXVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0KCkgPT4gWyBuZXcgTG9jYWxEZWNsYXJlRm9jdXModG9rZW5zLmxvYyksIHBhcnNlRXhwcih0b2tlbnMpIF0pXG5cdFx0XHRyZXR1cm4gbmV3IEl0ZXJhdGVlKHRva2Vucy5sb2MsIGVsZW1lbnQsIGJhZylcblx0XHR9KVxuY29uc3Rcblx0cGFyc2VGb3JEbyA9IF9wYXJzZUZvcihGb3JEbyksXG5cdHBhcnNlRm9yVmFsID0gX3BhcnNlRm9yKEZvclZhbCksXG5cdC8vIFRPRE86IC0+IG91dC10eXBlXG5cdHBhcnNlRm9yQmFnID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBbIGJlZm9yZSwgbGluZXMgXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0XHRjb25zdCBibG9jayA9IHBhcnNlQmxvY2tEbyhsaW5lcylcblx0XHQvLyBUT0RPOiBCZXR0ZXIgd2F5P1xuXHRcdGlmIChibG9jay5saW5lcy5sZW5ndGggPT09IDEgJiYgYmxvY2subGluZXNbMF0gaW5zdGFuY2VvZiBWYWwpXG5cdFx0XHRibG9jay5saW5lc1swXSA9IG5ldyBCYWdFbnRyeShibG9jay5saW5lc1swXS5sb2MsIGJsb2NrLmxpbmVzWzBdKVxuXHRcdHJldHVybiBGb3JCYWcub2YodG9rZW5zLmxvYywgX3BhcnNlT3BJdGVyYXRlZShiZWZvcmUpLCBibG9jaylcblx0fVxuXG5cbmNvbnN0XG5cdHBhcnNlRXhjZXB0ID0gKGt3RXhjZXB0LCB0b2tlbnMpID0+IHtcblx0XHRjb25zdFxuXHRcdFx0aXNWYWwgPSBrd0V4Y2VwdCA9PT0gS1dfRXhjZXB0VmFsLFxuXHRcdFx0anVzdERvVmFsQmxvY2sgPSBpc1ZhbCA/IGp1c3RCbG9ja1ZhbCA6IGp1c3RCbG9ja0RvLFxuXHRcdFx0cGFyc2VCbG9jayA9IGlzVmFsID8gcGFyc2VCbG9ja1ZhbCA6IHBhcnNlQmxvY2tEbyxcblx0XHRcdEV4Y2VwdCA9IGlzVmFsID8gRXhjZXB0VmFsIDogRXhjZXB0RG8sXG5cdFx0XHRrd1RyeSA9IGlzVmFsID8gS1dfVHJ5VmFsIDogS1dfVHJ5RG8sXG5cdFx0XHRrd0NhdGNoID0gaXNWYWwgPyBLV19DYXRjaFZhbCA6IEtXX0NhdGNoRG8sXG5cdFx0XHRuYW1lVHJ5ID0gKCkgPT4gY29kZShrZXl3b3JkTmFtZShrd1RyeSkpLFxuXHRcdFx0bmFtZUNhdGNoID0gKCkgPT4gY29kZShrZXl3b3JkTmFtZShrd0NhdGNoKSksXG5cdFx0XHRuYW1lRmluYWxseSA9ICgpID0+IGNvZGUoa2V5d29yZE5hbWUoS1dfRmluYWxseSkpXG5cblx0XHRjb25zdCBsaW5lcyA9IGp1c3RCbG9jayhrd0V4Y2VwdCwgdG9rZW5zKVxuXG5cdFx0Ly8gYHRyeWAgKm11c3QqIGNvbWUgZmlyc3QuXG5cdFx0Y29uc3QgZmlyc3RMaW5lID0gbGluZXMuaGVhZFNsaWNlKClcblx0XHRjb25zdCB0b2tlblRyeSA9IGZpcnN0TGluZS5oZWFkKClcblx0XHRjb250ZXh0LmNoZWNrKGlzS2V5d29yZChrd1RyeSwgdG9rZW5UcnkpLCB0b2tlblRyeS5sb2MsICgpID0+XG5cdFx0XHRgTXVzdCBzdGFydCB3aXRoICR7bmFtZVRyeSgpfWApXG5cdFx0Y29uc3QgX3RyeSA9IGp1c3REb1ZhbEJsb2NrKGt3VHJ5LCBmaXJzdExpbmUudGFpbCgpKVxuXG5cdFx0Y29uc3QgcmVzdExpbmVzID0gbGluZXMudGFpbCgpXG5cdFx0Y2hlY2tOb25FbXB0eShyZXN0TGluZXMsICgpID0+XG5cdFx0XHRgTXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBvZiAke25hbWVDYXRjaCgpfSBvciAke25hbWVGaW5hbGx5KCl9YClcblxuXHRcdGNvbnN0IGhhbmRsZUZpbmFsbHkgPSByZXN0TGluZXMgPT4ge1xuXHRcdFx0Y29uc3QgbGluZSA9IHJlc3RMaW5lcy5oZWFkU2xpY2UoKVxuXHRcdFx0Y29uc3QgdG9rZW5GaW5hbGx5ID0gbGluZS5oZWFkKClcblx0XHRcdGNvbnRleHQuY2hlY2soaXNLZXl3b3JkKEtXX0ZpbmFsbHksIHRva2VuRmluYWxseSksIHRva2VuRmluYWxseS5sb2MsICgpID0+XG5cdFx0XHRcdGBFeHBlY3RlZCAke25hbWVGaW5hbGx5KCl9YClcblx0XHRcdGNvbnRleHQuY2hlY2socmVzdExpbmVzLnNpemUoKSA9PT0gMSwgcmVzdExpbmVzLmxvYywgKCkgPT5cblx0XHRcdFx0YE5vdGhpbmcgaXMgYWxsb3dlZCB0byBjb21lIGFmdGVyICR7bmFtZUZpbmFsbHkoKX0uYClcblx0XHRcdHJldHVybiBqdXN0QmxvY2tEbyhLV19GaW5hbGx5LCBsaW5lLnRhaWwoKSlcblx0XHR9XG5cblx0XHRsZXQgX2NhdGNoLCBfZmluYWxseVxuXG5cdFx0Y29uc3QgbGluZTIgPSByZXN0TGluZXMuaGVhZFNsaWNlKClcblx0XHRjb25zdCBoZWFkMiA9IGxpbmUyLmhlYWQoKVxuXHRcdGlmIChpc0tleXdvcmQoa3dDYXRjaCwgaGVhZDIpKSB7XG5cdFx0XHRjb25zdCBbIGJlZm9yZTIsIGJsb2NrMiBdID0gYmVmb3JlQW5kQmxvY2sobGluZTIudGFpbCgpKVxuXHRcdFx0Y29uc3QgY2F1Z2h0ID0gX3BhcnNlT25lTG9jYWxEZWNsYXJlT3JGb2N1cyhiZWZvcmUyKVxuXHRcdFx0X2NhdGNoID0gbmV3IENhdGNoKGxpbmUyLmxvYywgY2F1Z2h0LCBwYXJzZUJsb2NrKGJsb2NrMikpXG5cdFx0XHRfZmluYWxseSA9IG9wSWYocmVzdExpbmVzLnNpemUoKSA+IDEsICgpID0+IGhhbmRsZUZpbmFsbHkocmVzdExpbmVzLnRhaWwoKSkpXG5cdFx0fSBlbHNlIHtcblx0XHRcdF9jYXRjaCA9IG51bGxcblx0XHRcdF9maW5hbGx5ID0gaGFuZGxlRmluYWxseShyZXN0TGluZXMpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBFeGNlcHQodG9rZW5zLmxvYywgX3RyeSwgX2NhdGNoLCBfZmluYWxseSlcblx0fSxcblx0X3BhcnNlT25lTG9jYWxEZWNsYXJlT3JGb2N1cyA9IHRva2VucyA9PiB7XG5cdFx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsRGVjbGFyZUZvY3VzKHRva2Vucy5sb2MpXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKHRva2Vucy5zaXplKCkgPT09IDEsICdFeHBlY3RlZCBvbmx5IG9uZSBsb2NhbCBkZWNsYXJlLicpXG5cdFx0XHRyZXR1cm4gcGFyc2VMb2NhbERlY2xhcmVzKHRva2VucylbMF1cblx0XHR9XG5cdH1cblxuY29uc3QgcGFyc2VBc3NlcnQgPSAobmVnYXRlLCB0b2tlbnMpID0+IHtcblx0Y2hlY2tOb25FbXB0eSh0b2tlbnMsICgpID0+IGBFeHBlY3RlZCBzb21ldGhpbmcgYWZ0ZXIgJHtrZXl3b3JkTmFtZShLV19Bc3NlcnQpfS5gKVxuXG5cdGNvbnN0IFsgY29uZFRva2Vucywgb3BUaHJvd24gXSA9XG5cdFx0aWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZVdoZXJlKF8gPT4gaXNLZXl3b3JkKEtXX1Rocm93LCBfKSksXG5cdFx0XHQoeyBiZWZvcmUsIGFmdGVyIH0pID0+IFsgYmVmb3JlLCBwYXJzZUV4cHIoYWZ0ZXIpIF0sXG5cdFx0XHQoKSA9PiBbIHRva2VucywgbnVsbCBdKVxuXG5cdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHMoY29uZFRva2Vucylcblx0Y29uc3QgY29uZCA9IHBhcnRzLmxlbmd0aCA9PT0gMSA/IHBhcnRzWzBdIDogbmV3IENhbGwoY29uZFRva2Vucy5sb2MsIHBhcnRzWzBdLCB0YWlsKHBhcnRzKSlcblx0cmV0dXJuIG5ldyBBc3NlcnQodG9rZW5zLmxvYywgbmVnYXRlLCBjb25kLCBvcFRocm93bilcbn1cblxuY29uc3QgcGFyc2VDbGFzcyA9IHRva2VucyA9PiB7XG5cdGNvbnN0IFsgYmVmb3JlLCBibG9jayBdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRjb25zdCBvcEV4dGVuZGVkID0gb3BJZighYmVmb3JlLmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByKGJlZm9yZSkpXG5cblx0bGV0IG9wRG8gPSBudWxsLCBzdGF0aWNzID0gWyBdLCBvcENvbnN0cnVjdG9yID0gbnVsbCwgbWV0aG9kcyA9IFsgXVxuXG5cdGxldCByZXN0ID0gYmxvY2tcblx0Y29uc3QgbGluZTEgPSByZXN0LmhlYWRTbGljZSgpXG5cdGlmIChpc0tleXdvcmQoS1dfRG8sIGxpbmUxLmhlYWQoKSkpIHtcblx0XHRjb25zdCBkb25lID0ganVzdEJsb2NrRG8oS1dfRG8sIGxpbmUxLnRhaWwoKSlcblx0XHRvcERvID0gbmV3IENsYXNzRG8obGluZTEubG9jLCBuZXcgTG9jYWxEZWNsYXJlRm9jdXMobGluZTEubG9jLCBkb25lKSwgZG9uZSlcblx0XHRyZXN0ID0gYmxvY2sudGFpbCgpXG5cdH1cblx0aWYgKCFyZXN0LmlzRW1wdHkoKSkge1xuXHRcdGNvbnN0IGxpbmUyID0gcmVzdC5oZWFkU2xpY2UoKVxuXHRcdGlmIChpc0tleXdvcmQoS1dfU3RhdGljLCBsaW5lMi5oZWFkKCkpKSB7XG5cdFx0XHRzdGF0aWNzID0gX3BhcnNlU3RhdGljcyhsaW5lMi50YWlsKCkpXG5cdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHR9XG5cdFx0aWYgKCFyZXN0LmlzRW1wdHkoKSkge1xuXHRcdFx0Y29uc3QgbGluZTMgPSByZXN0LmhlYWRTbGljZSgpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtXX0NvbnN0cnVjdCwgbGluZTMuaGVhZCgpKSkge1xuXHRcdFx0XHRvcENvbnN0cnVjdG9yID0gX3BhcnNlQ29uc3RydWN0b3IobGluZTMudGFpbCgpKVxuXHRcdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHRcdH1cblx0XHRcdG1ldGhvZHMgPSBfcGFyc2VNZXRob2RzKHJlc3QpXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG5ldyBDbGFzcyh0b2tlbnMubG9jLCBvcEV4dGVuZGVkLCBvcERvLCBzdGF0aWNzLCBvcENvbnN0cnVjdG9yLCBtZXRob2RzKVxufVxuXG5jb25zdFxuXHRfcGFyc2VDb25zdHJ1Y3RvciA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgeyBhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBvcEluLCBvcE91dCB9ID0gX2Z1bkFyZ3NBbmRCbG9jayh0cnVlLCB0b2tlbnMpXG5cdFx0Y29uc3QgaXNHZW5lcmF0b3IgPSBmYWxzZSwgb3BEZWNsYXJlUmVzID0gbnVsbFxuXHRcdHJldHVybiBuZXcgRnVuKHRva2Vucy5sb2MsXG5cdFx0XHRuZXcgTG9jYWxEZWNsYXJlVGhpcyh0b2tlbnMubG9jKSxcblx0XHRcdGlzR2VuZXJhdG9yLFxuXHRcdFx0YXJncywgb3BSZXN0QXJnLFxuXHRcdFx0YmxvY2ssIG9wSW4sIG9wRGVjbGFyZVJlcywgb3BPdXQpXG5cdH0sXG5cdF9wYXJzZVN0YXRpY3MgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGJsb2NrID0ganVzdEJsb2NrKEtXX1N0YXRpYywgdG9rZW5zKVxuXHRcdHJldHVybiBfcGFyc2VNZXRob2RzKGJsb2NrKVxuXHR9LFxuXHRfcGFyc2VNZXRob2RzID0gdG9rZW5zID0+IHRva2Vucy5tYXBTbGljZXMoX3BhcnNlTWV0aG9kKSxcblx0X3BhcnNlTWV0aG9kID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBoZWFkID0gdG9rZW5zLmhlYWQoKVxuXG5cdFx0bGV0IGtpbmQgPSBNSV9QbGFpblxuXHRcdGlmIChpc0tleXdvcmQoS1dfR2V0LCBoZWFkKSB8fCBpc0tleXdvcmQoS1dfU2V0LCBoZWFkKSkge1xuXHRcdFx0a2luZCA9IGhlYWQua2luZCA9PT0gS1dfR2V0ID8gTUlfR2V0IDogTUlfU2V0XG5cdFx0XHR0b2tlbnMgPSB0b2tlbnMudGFpbCgpXG5cdFx0fVxuXG5cdFx0Y29uc3QgYmFhID0gdG9rZW5zLm9wU3BsaXRPbmNlV2hlcmUoX2lzRnVuS2V5d29yZClcblx0XHRjb250ZXh0LmNoZWNrKGJhYSAhPT0gbnVsbCwgdG9rZW5zLmxvYywgJ0V4cGVjdGVkIGEgZnVuY3Rpb24ga2V5d29yZCBzb21ld2hlcmUuJylcblx0XHRjb25zdCB7IGJlZm9yZSwgYXQsIGFmdGVyIH0gPSBiYWFcblxuXHRcdGNvbnN0IGZ1biA9IHBhcnNlRnVuKF9tZXRob2RGdW5LaW5kKGF0KSwgYWZ0ZXIpXG5cblx0XHRsZXQgc3ltYm9sID0gcGFyc2VFeHByKGJlZm9yZSlcblx0XHQvLyBJZiBzeW1ib2wgaXMganVzdCBhIGxpdGVyYWwgc3RyaW5nLCBzdG9yZSBpdCBhcyBhIHN0cmluZywgd2hpY2ggaXMgaGFuZGxlZCBzcGVjaWFsbHkuXG5cdFx0aWYgKHN5bWJvbCBpbnN0YW5jZW9mIFF1b3RlICYmXG5cdFx0XHRzeW1ib2wucGFydHMubGVuZ3RoID09PSAxICYmXG5cdFx0XHR0eXBlb2Ygc3ltYm9sLnBhcnRzWzBdID09PSAnc3RyaW5nJylcblx0XHRcdHN5bWJvbCA9IHN5bWJvbC5wYXJ0c1swXVxuXG5cdFx0cmV0dXJuIG5ldyBNZXRob2RJbXBsKHRva2Vucy5sb2MsIGtpbmQsIHN5bWJvbCwgZnVuKVxuXHR9LFxuXHRfbWV0aG9kRnVuS2luZCA9IGZ1bktpbmRUb2tlbiA9PiB7XG5cdFx0c3dpdGNoIChmdW5LaW5kVG9rZW4ua2luZCkge1xuXHRcdFx0Y2FzZSBLV19GdW46IHJldHVybiBLV19GdW5UaGlzXG5cdFx0XHRjYXNlIEtXX0Z1bkRvOiByZXR1cm4gS1dfRnVuVGhpc0RvXG5cdFx0XHRjYXNlIEtXX0Z1bkdlbjogcmV0dXJuIEtXX0Z1blRoaXNHZW5cblx0XHRcdGNhc2UgS1dfRnVuR2VuRG86IHJldHVybiBLV19GdW5UaGlzR2VuRG9cblx0XHRcdGNhc2UgS1dfRnVuVGhpczogY2FzZSBLV19GdW5UaGlzRG86IGNhc2UgS1dfRnVuVGhpc0dlbjogY2FzZSBLV19GdW5UaGlzR2VuRG86XG5cdFx0XHRcdGNvbnRleHQuZmFpbChmdW5LaW5kVG9rZW4ubG9jLCAnRnVuY3Rpb24gYC5gIGlzIGltcGxpY2l0IGZvciBtZXRob2RzLicpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRjb250ZXh0LmZhaWwoZnVuS2luZFRva2VuLmxvYywgYEV4cGVjdGVkIGZ1bmN0aW9uIGtpbmQsIGdvdCAke2Z1bktpbmRUb2tlbn1gKVxuXHRcdH1cblx0fSxcblx0X2lzRnVuS2V5d29yZCA9IGZ1bktpbmRUb2tlbiA9PiB7XG5cdFx0aWYgKGZ1bktpbmRUb2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0XHRzd2l0Y2ggKGZ1bktpbmRUb2tlbi5raW5kKSB7XG5cdFx0XHRcdGNhc2UgS1dfRnVuOiBjYXNlIEtXX0Z1bkRvOiBjYXNlIEtXX0Z1bkdlbjogY2FzZSBLV19GdW5HZW5Ebzpcblx0XHRcdFx0Y2FzZSBLV19GdW5UaGlzOiBjYXNlIEtXX0Z1blRoaXNEbzogY2FzZSBLV19GdW5UaGlzR2VuOlxuXHRcdFx0XHRjYXNlIEtXX0Z1blRoaXNHZW5Ebzpcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0fVxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBmYWxzZVxuXHR9XG5cbmNvbnN0IHBhcnNlUXVvdGUgPSB0b2tlbnMgPT5cblx0bmV3IFF1b3RlKHRva2Vucy5sb2MsIHRva2Vucy5tYXAoXyA9PiB0eXBlb2YgXyA9PT0gJ3N0cmluZycgPyBfIDogcGFyc2VTaW5nbGUoXykpKVxuXG5jb25zdCBwYXJzZVdpdGggPSB0b2tlbnMgPT4ge1xuXHRjb25zdCBbIGJlZm9yZSwgYmxvY2sgXSA9IGJlZm9yZUFuZEJsb2NrKHRva2VucylcblxuXHRjb25zdCBbIHZhbCwgZGVjbGFyZSBdID0gaWZFbHNlKGJlZm9yZS5vcFNwbGl0T25jZVdoZXJlKF8gPT4gaXNLZXl3b3JkKEtXX0FzLCBfKSksXG5cdFx0KHsgYmVmb3JlLCBhZnRlciB9KSA9PiB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKGFmdGVyLnNpemUoKSA9PT0gMSwgKCkgPT4gYEV4cGVjdGVkIG9ubHkgMSB0b2tlbiBhZnRlciAke2NvZGUoJ2FzJyl9LmApXG5cdFx0XHRyZXR1cm4gWyBwYXJzZUV4cHJQbGFpbihiZWZvcmUpLCBwYXJzZUxvY2FsRGVjbGFyZShhZnRlci5oZWFkKCkpIF1cblx0XHR9LFxuXHRcdCgpID0+IFsgcGFyc2VFeHByUGxhaW4oYmVmb3JlKSwgbmV3IExvY2FsRGVjbGFyZUZvY3VzKHRva2Vucy5sb2MpIF0pXG5cblx0cmV0dXJuIG5ldyBXaXRoKHRva2Vucy5sb2MsIGRlY2xhcmUsIHZhbCwgcGFyc2VCbG9ja0RvKGJsb2NrKSlcbn1cblxuY29uc3QgcGFyc2VJZ25vcmUgPSB0b2tlbnMgPT4ge1xuXHRjb25zdCBpZ25vcmVkID0gdG9rZW5zLm1hcChfID0+IHtcblx0XHRpZiAoaXNLZXl3b3JkKEtXX0ZvY3VzLCBfKSlcblx0XHRcdHJldHVybiAnXydcblx0XHRlbHNlIHtcblx0XHRcdGNvbnRleHQuY2hlY2soXyBpbnN0YW5jZW9mIE5hbWUsIF8ubG9jLCAoKSA9PiBgRXhwZWN0ZWQgbG9jYWwgbmFtZSwgbm90ICR7X30uYClcblx0XHRcdHJldHVybiBfLm5hbWVcblx0XHR9XG5cdH0pXG5cdHJldHVybiBuZXcgSWdub3JlKHRva2Vucy5sb2MsIGlnbm9yZWQpXG59XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==
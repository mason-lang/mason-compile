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
		const msAst = parseModule(_Slice2.default.group(rootToken));
		// Release for garbage collections.
		context = undefined;
		return msAst;
	};

	const checkEmpty = (tokens, message) => context.check(tokens.isEmpty(), tokens.loc, message),
	      checkNonEmpty = (tokens, message) => context.check(!tokens.isEmpty(), tokens.loc, message),
	      unexpected = token => context.fail(token.loc, `Unexpected ${ token }`);

	const parseModule = tokens => {
		// Module doc comment must come first.

		var _tryTakeComment = tryTakeComment(tokens);

		var _tryTakeComment2 = _slicedToArray(_tryTakeComment, 2);

		const opComment = _tryTakeComment2[0];
		const rest0 = _tryTakeComment2[1];

		// Use statements must appear in order.

		var _tryParseUses = tryParseUses(_Token.KW_UseDo, rest0);

		const doUses = _tryParseUses.uses;
		const rest1 = _tryParseUses.rest;

		var _tryParseUses2 = tryParseUses(_Token.KW_Use, rest1);

		const plainUses = _tryParseUses2.uses;
		const opUseGlobal = _tryParseUses2.opUseGlobal;
		const rest2 = _tryParseUses2.rest;

		var _tryParseUses3 = tryParseUses(_Token.KW_UseLazy, rest2);

		const lazyUses = _tryParseUses3.uses;
		const rest3 = _tryParseUses3.rest;

		var _tryParseUses4 = tryParseUses(_Token.KW_UseDebug, rest3);

		const debugUses = _tryParseUses4.uses;
		const rest4 = _tryParseUses4.rest;

		const lines = parseModuleBlock(rest4);

		if (context.opts.includeModuleName()) {
			const name = new _MsAst.LocalDeclareName(tokens.loc);
			const assign = new _MsAst.AssignSingle(tokens.loc, name, _MsAst.Quote.forString(tokens.loc, context.opts.moduleName()));
			lines.push(new _MsAst.ModuleExportNamed(tokens.loc, assign));
		}

		const uses = plainUses.concat(lazyUses);
		return new _MsAst.Module(tokens.loc, opComment, doUses, uses, opUseGlobal, debugUses, lines);
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
		context.check(tokens.size() > 1 && tokens.size() === 2 && (0, _Token.isGroup)(_Token.G_Block, tokens.second()), h.loc, () => `Expected indented block after ${ h }, and nothing else.`);
		const block = tokens.second();

		const lines = [];
		for (const line of _Slice2.default.group(block).slices()) lines.push(...parseLineOrLines(line));
		return lines;
	},
	      parseBlockDo = tokens => {
		var _tryTakeComment3 = tryTakeComment(tokens);

		var _tryTakeComment32 = _slicedToArray(_tryTakeComment3, 2);

		const opComment = _tryTakeComment32[0];
		const rest = _tryTakeComment32[1];

		const lines = _plainBlockLines(rest);
		return new _MsAst.BlockDo(tokens.loc, opComment, lines);
	},
	      parseBlockVal = tokens => {
		var _tryTakeComment4 = tryTakeComment(tokens);

		var _tryTakeComment42 = _slicedToArray(_tryTakeComment4, 2);

		const opComment = _tryTakeComment42[0];
		const rest = _tryTakeComment42[1];

		var _parseBlockLines2 = _parseBlockLines(rest);

		const lines = _parseBlockLines2.lines;
		const kReturn = _parseBlockLines2.kReturn;

		switch (kReturn) {
			case KReturn_Bag:
				return _MsAst.BlockBag.of(tokens.loc, opComment, lines);
			case KReturn_Map:
				return _MsAst.BlockMap.of(tokens.loc, opComment, lines);
			case KReturn_Obj:
				var _tryTakeLastVal2 = _tryTakeLastVal(lines),
				    _tryTakeLastVal22 = _slicedToArray(_tryTakeLastVal2, 2),
				    doLines = _tryTakeLastVal22[0],
				    opVal = _tryTakeLastVal22[1];

				// opName written to by _tryAddName.
				return _MsAst.BlockObj.of(tokens.loc, opComment, doLines, opVal, null);
			default:
				{
					context.check(!(0, _util.isEmpty)(lines), tokens.loc, 'Value block must end in a value.');
					const val = (0, _util.last)(lines);
					if (val instanceof _MsAst.Throw) return new _MsAst.BlockValThrow(tokens.loc, opComment, (0, _util.rtail)(lines), val);else {
						context.check(val instanceof _MsAst.Val, val.loc, 'Value block must end in a value.');
						return new _MsAst.BlockWithReturn(tokens.loc, opComment, (0, _util.rtail)(lines), val);
					}
				}
		}
	},
	      parseModuleBlock = tokens => {
		var _parseBlockLines3 = _parseBlockLines(tokens, true);

		const lines = _parseBlockLines3.lines;
		const kReturn = _parseBlockLines3.kReturn;

		const opComment = null;
		const loc = tokens.loc;
		switch (kReturn) {
			case KReturn_Bag:case KReturn_Map:
				{
					const cls = kReturn === KReturn_Bag ? _MsAst.BlockBag : _MsAst.BlockMap;
					const block = cls.of(loc, opComment, lines);
					const val = new _MsAst.BlockWrap(loc, block);
					const assignee = _MsAst.LocalDeclare.plain(loc, context.opts.moduleName());
					const assign = new _MsAst.AssignSingle(loc, assignee, val);
					return [new _MsAst.ModuleExportDefault(loc, assign)];
				}
			case KReturn_Obj:
				{
					const moduleName = context.opts.moduleName();

					// Module exports look like a BlockObj,  but are really different.
					// In ES6, module exports must be completely static.
					// So we keep an array of exports attached directly to the Module ast.
					// If you write:
					//	if! cond
					//		a. b
					// in a module context, it will be an error. (The module creates no `built` local.)
					const convertToExports = line => {
						if (line instanceof _MsAst.ObjEntry) {
							context.check(line instanceof _MsAst.ObjEntryAssign, line.loc, 'Module exports can not be computed.');
							context.check(line.assign instanceof _MsAst.AssignSingle, line.loc, 'Export AssignDestructure not yet supported.');
							return line.assign.assignee.name === moduleName ? new _MsAst.ModuleExportDefault(line.loc, line.assign) : new _MsAst.ModuleExportNamed(line.loc, line.assign);
						} else if (line instanceof _MsAst.Debug) line.lines = line.lines.map(convertToExports);
						return line;
					};

					return lines.map(convertToExports);
				}
			default:
				{
					var _tryTakeLastVal3 = _tryTakeLastVal(lines);

					var _tryTakeLastVal32 = _slicedToArray(_tryTakeLastVal3, 2);

					const moduleLines = _tryTakeLastVal32[0];
					const opDefaultExport = _tryTakeLastVal32[1];

					if (opDefaultExport !== null) {
						const _ = opDefaultExport;
						moduleLines.push(new _MsAst.ModuleExportDefault(_.loc, new _MsAst.AssignSingle(_.loc, _MsAst.LocalDeclare.plain(opDefaultExport.loc, context.opts.moduleName()), _)));
					}
					return moduleLines;
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
		for (const _ of lineTokens.slices()) addLine(parseLine(_));
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
			const val = new _MsAst.ObjSimple(tokens.loc, pairs);
			if (tokensCaller.isEmpty()) return val;else {
				const parts = parseExprParts(tokensCaller);
				return new _MsAst.Call(tokens.loc, (0, _util.head)(parts), (0, _util.cat)((0, _util.tail)(parts), val));
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
				case _Token.KW_And:case _Token.KW_CaseVal:case _Token.KW_Class:case _Token.KW_Cond:case _Token.KW_ExceptVal:
				case _Token.KW_ForBag:case _Token.KW_ForVal:case _Token.KW_Fun:case _Token.KW_FunDo:case _Token.KW_FunGen:
				case _Token.KW_FunGenDo:case _Token.KW_FunThis:case _Token.KW_FunThisDo:case _Token.KW_FunThisGen:
				case _Token.KW_FunThisGenDo:case _Token.KW_IfVal:case _Token.KW_New:case _Token.KW_Not:case _Token.KW_Or:
				case _Token.KW_SuperVal:case _Token.KW_SwitchVal:case _Token.KW_UnlessVal:case _Token.KW_With:
				case _Token.KW_Yield:case _Token.KW_YieldTo:
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
					case _Token.KW_Cond:
						return parseCond(after);
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
					case _Token.KW_SuperVal:
						return new _MsAst.SuperCall(at.loc, parseExprParts(after));
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
			return (0, _util.cat)(before.map(parseSingle), getLast());
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
		const opComment = _funArgsAndBlock2.opComment;

		// Need res declare if there is a return type or out condition.
		const opDeclareRes = (0, _util.ifElse)(opReturnType, _ => new _MsAst.LocalDeclareRes(_.loc, _), () => (0, _util.opMap)(opOut, _ => new _MsAst.LocalDeclareRes(_.loc, null)));
		return new _MsAst.Fun(tokens.loc, opDeclareThis, isGen, args, opRestArg, block, opIn, opDeclareRes, opOut, opComment);
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
	     

	/*
 includeMemberArgs:
 	if true, output will include `memberArgs`.
 	This is a subset of `args` whose names are prefixed with `.`
 	e.g.: `construct! .x .y`
 	This is for constructors only.
 */
	_funArgsAndBlock = (isDo, tokens, includeMemberArgs) => {
		checkNonEmpty(tokens, 'Expected an indented block.');
		const h = tokens.head();
		// Might be `|case`
		if (h instanceof _Token.Keyword && (h.kind === _Token.KW_CaseVal || h.kind === _Token.KW_CaseDo)) {
			const eCase = parseCase(h.kind === _Token.KW_CaseVal, true, tokens.tail());
			const args = [new _MsAst.LocalDeclareFocus(h.loc)];
			return h.kind === _Token.KW_CaseVal ? {
				args, opRestArg: null, memberArgs: [], opIn: null, opOut: null,
				block: new _MsAst.BlockWithReturn(tokens.loc, null, [], eCase)
			} : {
				args, opRestArg: null, memberArgs: [], opIn: null, opOut: null,
				block: new _MsAst.BlockDo(tokens.loc, null, [eCase])
			};
		} else {
			var _beforeAndBlock8 = beforeAndBlock(tokens);

			var _beforeAndBlock82 = _slicedToArray(_beforeAndBlock8, 2);

			const before = _beforeAndBlock82[0];
			const blockLines = _beforeAndBlock82[1];

			var _parseFunLocals2 = _parseFunLocals(before, includeMemberArgs);

			const args = _parseFunLocals2.args;
			const opRestArg = _parseFunLocals2.opRestArg;
			const memberArgs = _parseFunLocals2.memberArgs;

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
			return { args, opRestArg, memberArgs, block, opIn, opOut };
		}
	},
	      _parseFunLocals = (tokens, includeMemberArgs) => {
		if (tokens.isEmpty()) return { args: [], memberArgs: [], opRestArg: null };else {
			let rest, opRestArg;
			const l = tokens.last();
			if (l instanceof _Token.DotName && l.nDots === 3) {
				rest = tokens.rtail();
				opRestArg = _MsAst.LocalDeclare.plain(l.loc, l.name);
			} else {
				rest = tokens;
				opRestArg = null;
			}

			if (includeMemberArgs) {
				var _parseLocalDeclaresAndMemberArgs = parseLocalDeclaresAndMemberArgs(rest);

				const args = _parseLocalDeclaresAndMemberArgs.declares;
				const memberArgs = _parseLocalDeclaresAndMemberArgs.memberArgs;

				return { args, memberArgs, opRestArg };
			} else return { args: parseLocalDeclares(rest), opRestArg };
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
			case _Token.KW_SuperDo:
				return new _MsAst.SuperCallDo(tokens.loc, parseExprParts(rest));
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
	      parseLocalDeclares = (tokens, includeMemberArgs) => includeMemberArgs ? parseLocalDeclaresAndMemberArgs(tokens) : tokens.map(parseLocalDeclare),
	     

	// _orMember: if true, will look for `.x` arguments and return { declare, isMember }.
	parseLocalDeclare = (token, _orMember) => {
		let isMember = false;
		let declare;

		const parseLocalName = token => {
			if (_orMember) {
				isMember = token instanceof _Token.DotName && token.nDots === 1;
				return isMember ? token.name : _parseLocalName(token);
			} else return _parseLocalName(token);
		};

		if ((0, _Token.isGroup)(_Token.G_Space, token)) {
			const tokens = _Slice2.default.group(token);

			var _ref6 = (0, _Token.isKeyword)(_Token.KW_Lazy, tokens.head()) ? [tokens.tail(), true] : [tokens, false];

			var _ref62 = _slicedToArray(_ref6, 2);

			const rest = _ref62[0];
			const isLazy = _ref62[1];

			const name = parseLocalName(rest.head());
			const rest2 = rest.tail();
			const opType = (0, _util.opIf)(!rest2.isEmpty(), () => {
				const colon = rest2.head();
				context.check((0, _Token.isKeyword)(_Token.KW_Type, colon), colon.loc, () => `Expected ${ (0, _CompileError.code)(':') }`);
				const tokensType = rest2.tail();
				checkNonEmpty(tokensType, () => `Expected something after ${ colon }`);
				return parseSpaced(tokensType);
			});
			declare = new _MsAst.LocalDeclare(token.loc, name, opType, isLazy ? _MsAst.LD_Lazy : _MsAst.LD_Const);
		} else declare = _MsAst.LocalDeclare.plain(token.loc, parseLocalName(token));

		if (_orMember) return { declare, isMember };else return declare;
	},
	      parseLocalDeclaresAndMemberArgs = tokens => {
		const declares = [],
		      memberArgs = [];
		for (const token of tokens) {
			var _parseLocalDeclare = parseLocalDeclare(token, true);

			const declare = _parseLocalDeclare.declare;
			const isMember = _parseLocalDeclare.isMember;

			declares.push(declare);
			if (isMember) memberArgs.push(declare);
		}
		return { declares, memberArgs };
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
		if ((0, _Token.isKeyword)(_Token.KW_Type, h)) return _MsAst.Call.contains(h.loc, parseSpaced(rest), _MsAst.LocalAccess.focus(h.loc));else if ((0, _Token.isKeyword)(_Token.KW_Lazy, h)) return new _MsAst.Lazy(h.loc, parseSpaced(rest));else if ((0, _Token.isKeyword)(_Token.KW_SuperVal, h)) {
			// TODO: handle sub here as well
			const h2 = rest.head();
			if (h2 instanceof _Token.DotName) {
				context.check(h2.nDots === 1, token.loc, 'Too many dots!');
				const x = new _MsAst.SuperMember(h2.loc, token.name);
				return _parseSpacedFold(x, rest.tail());
			} else if ((0, _Token.isGroup)(_Token.G_Parenthesis, h2) && _Slice2.default.group(h2).isEmpty()) {
				const x = new _MsAst.SuperCall(h2.loc, []);
				return _parseSpacedFold(x, rest.tail());
			} else context.fail(`Expected ${ (0, _CompileError.code)('.') } or ${ (0, _CompileError.code)('()') } after ${ (0, _CompileError.code)('super') }`);
		} else return _parseSpacedFold(parseSingle(h), rest);
	};
	const _parseSpacedFold = (start, rest) => {
		let acc = start;
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
						const type = parseSpaced(rest._chopStart(i + 1));
						return _MsAst.Call.contains(token.loc, type, acc);
					}
				default:
			}
			if (token instanceof _Token.Group) {
				const slice = _Slice2.default.group(token);
				switch (token.kind) {
					case _Token.G_Bracket:
						acc = _MsAst.Call.sub(loc, (0, _util.cat)(acc, parseExprParts(slice)));
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
		if (t instanceof _Token.Name) return { path: t.name, name: t.name };else if (t instanceof _Token.DotName) return { path: (0, _util.cat)(_partsFromDotName(t), t.name).join('/'), name: t.name };else {
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

		var _tryTakeComment5 = tryTakeComment(block);

		var _tryTakeComment52 = _slicedToArray(_tryTakeComment5, 2);

		let opComment = _tryTakeComment52[0];
		let rest = _tryTakeComment52[1];

		const line1 = rest.headSlice();
		if ((0, _Token.isKeyword)(_Token.KW_Do, line1.head())) {
			const done = justBlockDo(_Token.KW_Do, line1.tail());
			opDo = new _MsAst.ClassDo(line1.loc, new _MsAst.LocalDeclareFocus(line1.loc), done);
			rest = rest.tail();
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

		return new _MsAst.Class(tokens.loc, opExtended, opComment, opDo, statics, opConstructor, methods);
	};

	const _parseConstructor = tokens => {
		var _funArgsAndBlock3 = _funArgsAndBlock(true, tokens, true);

		const args = _funArgsAndBlock3.args;
		const memberArgs = _funArgsAndBlock3.memberArgs;
		const opRestArg = _funArgsAndBlock3.opRestArg;
		const block = _funArgsAndBlock3.block;
		const opIn = _funArgsAndBlock3.opIn;
		const opOut = _funArgsAndBlock3.opOut;

		const isGenerator = false,
		      opDeclareRes = null;
		const fun = new _MsAst.Fun(tokens.loc, new _MsAst.LocalDeclareThis(tokens.loc), isGenerator, args, opRestArg, block, opIn, opDeclareRes, opOut);
		return new _MsAst.Constructor(tokens.loc, fun, memberArgs);
	},
	      _parseStatics = tokens => {
		const block = justBlock(_Token.KW_Static, tokens);
		return _parseMethods(block);
	},
	      _parseMethods = tokens => tokens.mapSlices(_parseMethod),
	      _parseMethod = tokens => {
		const head = tokens.head();

		if ((0, _Token.isKeyword)(_Token.KW_Get, head)) {
			var _beforeAndBlock14 = beforeAndBlock(tokens.tail());

			var _beforeAndBlock142 = _slicedToArray(_beforeAndBlock14, 2);

			const before = _beforeAndBlock142[0];
			const block = _beforeAndBlock142[1];

			return new _MsAst.MethodGetter(tokens.loc, _parseExprOrStrLit(before), parseBlockVal(block));
		} else if ((0, _Token.isKeyword)(_Token.KW_Set, head)) {
			var _beforeAndBlock15 = beforeAndBlock(tokens.tail());

			var _beforeAndBlock152 = _slicedToArray(_beforeAndBlock15, 2);

			const before = _beforeAndBlock152[0];
			const block = _beforeAndBlock152[1];

			return new _MsAst.MethodSetter(tokens.loc, _parseExprOrStrLit(before), parseBlockDo(block));
		} else {
			const baa = tokens.opSplitOnceWhere(_isFunKeyword);
			context.check(baa !== null, tokens.loc, 'Expected a function keyword somewhere.');
			const before = baa.before;
			const at = baa.at;
			const after = baa.after;

			const fun = parseFun(_methodFunKind(at), after);
			return new _MsAst.MethodImpl(tokens.loc, _parseExprOrStrLit(before), fun);
		}
	},
	     
	// If symbol is just a literal string, store it as a string, which is handled specially.
	_parseExprOrStrLit = tokens => {
		const expr = parseExpr(tokens);
		const isStrLit = expr instanceof _MsAst.Quote && expr.parts.length === 1 && typeof expr.parts[0] === 'string';
		return isStrLit ? expr.parts[0] : expr;
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
		var _beforeAndBlock16 = beforeAndBlock(tokens);

		var _beforeAndBlock162 = _slicedToArray(_beforeAndBlock16, 2);

		const before = _beforeAndBlock162[0];
		const block = _beforeAndBlock162[1];

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

	const parseCond = tokens => {
		const parts = parseExprParts(tokens);
		context.check(parts.length === 3, tokens.loc, () => `${ (0, _CompileError.code)('cond') } takes exactly 3 arguments.`);
		return new _MsAst.Cond(tokens.loc, parts[0], parts[1], parts[2]);
	};

	const tryTakeComment = lines => {
		let comments = [];
		let rest = lines;

		while (true) {
			if (rest.isEmpty()) break;

			const hs = rest.headSlice();
			const h = hs.head();
			if (!(h instanceof _Token.DocComment)) break;

			(0, _util.assert)(hs.size() === 1);
			comments.push(h);
			rest = rest.tail();
		}

		return [(0, _util.isEmpty)(comments) ? null : comments.map(_ => _.text).join('\n'), rest];
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7QUMrQkEsS0FBSSxPQUFPLENBQUE7Ozs7Ozs7Ozs7Ozs7a0JBWUksQ0FBQyxRQUFRLEVBQUUsU0FBUyxLQUFLO0FBQ3ZDLFNBQU8sR0FBRyxRQUFRLENBQUE7QUFDbEIsUUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLGdCQUFNLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBOztBQUVqRCxTQUFPLEdBQUcsU0FBUyxDQUFBO0FBQ25CLFNBQU8sS0FBSyxDQUFBO0VBQ1o7O0FBRUQsT0FDQyxVQUFVLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxLQUM1QixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQztPQUNyRCxhQUFhLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxLQUMvQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDO09BQ3RELFVBQVUsR0FBRyxLQUFLLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxHQUFFLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQTs7QUFFckUsT0FBTSxXQUFXLEdBQUcsTUFBTSxJQUFJOzs7d0JBRUEsY0FBYyxDQUFDLE1BQU0sQ0FBQzs7OztRQUEzQyxTQUFTO1FBQUUsS0FBSzs7OztzQkFFYyxZQUFZLFFBdkNyQyxRQUFRLEVBdUN3QyxLQUFLLENBQUM7O1FBQXJELE1BQU0saUJBQVosSUFBSTtRQUFnQixLQUFLLGlCQUFYLElBQUk7O3VCQUM0QixZQUFZLFFBekNlLE1BQU0sRUF5Q1osS0FBSyxDQUFDOztRQUFuRSxTQUFTLGtCQUFmLElBQUk7UUFB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c0NvbnRlbnQiOltudWxsLCJpbXBvcnQgTG9jIGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHsgY29kZSB9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7IEFzc2VydCwgQXNzaWduRGVzdHJ1Y3R1cmUsIEFzc2lnblNpbmdsZSwgQmFnRW50cnksIEJhZ0VudHJ5TWFueSwgQmFnU2ltcGxlLCBCbG9ja0JhZyxcblx0QmxvY2tEbywgQmxvY2tNYXAsIEJsb2NrT2JqLCBCbG9ja1ZhbFRocm93LCBCbG9ja1dpdGhSZXR1cm4sIEJsb2NrV3JhcCwgQnJlYWssIEJyZWFrV2l0aFZhbCxcblx0Q2FsbCwgQ2FzZURvLCBDYXNlRG9QYXJ0LCBDYXNlVmFsLCBDYXNlVmFsUGFydCwgQ2F0Y2gsIENsYXNzLCBDbGFzc0RvLCBDb25kLCBDb25kaXRpb25hbERvLFxuXHRDb25zdHJ1Y3RvciwgQ29uZGl0aW9uYWxWYWwsIERlYnVnLCBJZ25vcmUsIEl0ZXJhdGVlLCBOdW1iZXJMaXRlcmFsLCBFeGNlcHREbywgRXhjZXB0VmFsLFxuXHRGb3JCYWcsIEZvckRvLCBGb3JWYWwsIEZ1biwgTF9BbmQsIExfT3IsIExhenksIExEX0NvbnN0LCBMRF9MYXp5LCBMRF9NdXRhYmxlLCBMb2NhbEFjY2Vzcyxcblx0TG9jYWxEZWNsYXJlLCBMb2NhbERlY2xhcmVGb2N1cywgTG9jYWxEZWNsYXJlTmFtZSwgTG9jYWxEZWNsYXJlUmVzLCBMb2NhbERlY2xhcmVUaGlzLFxuXHRMb2NhbE11dGF0ZSwgTG9naWMsIE1hcEVudHJ5LCBNZW1iZXIsIE1lbWJlclNldCwgTWV0aG9kR2V0dGVyLCBNZXRob2RJbXBsLCBNZXRob2RTZXR0ZXIsXG5cdE1vZHVsZSwgTW9kdWxlRXhwb3J0RGVmYXVsdCwgTW9kdWxlRXhwb3J0TmFtZWQsIE1TX011dGF0ZSwgTVNfTmV3LCBNU19OZXdNdXRhYmxlLCBOZXcsIE5vdCxcblx0T2JqRW50cnksIE9iakVudHJ5QXNzaWduLCBPYmpFbnRyeUNvbXB1dGVkLCBPYmpQYWlyLCBPYmpTaW1wbGUsIFBhdHRlcm4sIFF1b3RlLCBRdW90ZVRlbXBsYXRlLFxuXHRTRF9EZWJ1Z2dlciwgU3BlY2lhbERvLCBTcGVjaWFsVmFsLCBTVl9OYW1lLCBTVl9OdWxsLCBTcGxhdCwgU3VwZXJDYWxsLCBTdXBlckNhbGxEbyxcblx0U3VwZXJNZW1iZXIsIFN3aXRjaERvLCBTd2l0Y2hEb1BhcnQsIFN3aXRjaFZhbCwgU3dpdGNoVmFsUGFydCwgVGhyb3csIFZhbCwgVXNlLCBVc2VEbyxcblx0VXNlR2xvYmFsLCBXaXRoLCBZaWVsZCwgWWllbGRUbyB9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHsgRG9jQ29tbWVudCwgRG90TmFtZSwgR3JvdXAsIEdfQmxvY2ssIEdfQnJhY2tldCwgR19QYXJlbnRoZXNpcywgR19TcGFjZSwgR19RdW90ZSwgaXNHcm91cCxcblx0aXNLZXl3b3JkLCBLZXl3b3JkLCBLV19BbmQsIEtXX0FzLCBLV19Bc3NlcnQsIEtXX0Fzc2VydE5vdCwgS1dfQXNzaWduLCBLV19Bc3NpZ25NdXRhYmxlLFxuXHRLV19CcmVhaywgS1dfQnJlYWtXaXRoVmFsLCBLV19DYXNlVmFsLCBLV19DYXNlRG8sIEtXX0NvbmQsIEtXX0NhdGNoRG8sIEtXX0NhdGNoVmFsLCBLV19DbGFzcyxcblx0S1dfQ29uc3RydWN0LCBLV19EZWJ1ZywgS1dfRGVidWdnZXIsIEtXX0RvLCBLV19FbGxpcHNpcywgS1dfRWxzZSwgS1dfRXhjZXB0RG8sIEtXX0V4Y2VwdFZhbCxcblx0S1dfRmluYWxseSwgS1dfRm9yQmFnLCBLV19Gb3JEbywgS1dfRm9yVmFsLCBLV19Gb2N1cywgS1dfRnVuLCBLV19GdW5EbywgS1dfRnVuR2VuLCBLV19GdW5HZW5Ebyxcblx0S1dfRnVuVGhpcywgS1dfRnVuVGhpc0RvLCBLV19GdW5UaGlzR2VuLCBLV19GdW5UaGlzR2VuRG8sIEtXX0dldCwgS1dfSWZEbywgS1dfSWZWYWwsIEtXX0lnbm9yZSxcblx0S1dfSW4sIEtXX0xhenksIEtXX0xvY2FsTXV0YXRlLCBLV19NYXBFbnRyeSwgS1dfTmFtZSwgS1dfTmV3LCBLV19Ob3QsIEtXX09iakFzc2lnbiwgS1dfT3IsXG5cdEtXX1Bhc3MsIEtXX091dCwgS1dfUmVnaW9uLCBLV19TZXQsIEtXX1N0YXRpYywgS1dfU3VwZXJEbywgS1dfU3VwZXJWYWwsIEtXX1N3aXRjaERvLFxuXHRLV19Td2l0Y2hWYWwsIEtXX1Rocm93LCBLV19UcnlEbywgS1dfVHJ5VmFsLCBLV19UeXBlLCBLV19Vbmxlc3NEbywgS1dfVW5sZXNzVmFsLCBLV19Vc2UsXG5cdEtXX1VzZURlYnVnLCBLV19Vc2VEbywgS1dfVXNlTGF6eSwgS1dfV2l0aCwgS1dfWWllbGQsIEtXX1lpZWxkVG8sIE5hbWUsIGtleXdvcmROYW1lLFxuXHRvcEtleXdvcmRLaW5kVG9TcGVjaWFsVmFsdWVLaW5kIH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQgeyBhc3NlcnQsIGNhdCwgaGVhZCwgaWZFbHNlLCBpc0VtcHR5LCBsYXN0LCBvcElmLCBvcE1hcCwgcmVwZWF0LCBydGFpbCwgdGFpbCB9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLy8gU2luY2UgdGhlcmUgYXJlIHNvIG1hbnkgcGFyc2luZyBmdW5jdGlvbnMsXG4vLyBpdCdzIGZhc3RlciAoYXMgb2Ygbm9kZSB2MC4xMS4xNCkgdG8gaGF2ZSB0aGVtIGFsbCBjbG9zZSBvdmVyIHRoaXMgbXV0YWJsZSB2YXJpYWJsZSBvbmNlXG4vLyB0aGFuIHRvIGNsb3NlIG92ZXIgdGhlIHBhcmFtZXRlciAoYXMgaW4gbGV4LmpzLCB3aGVyZSB0aGF0J3MgbXVjaCBmYXN0ZXIpLlxubGV0IGNvbnRleHRcblxuLypcblRoaXMgY29udmVydHMgYSBUb2tlbiB0cmVlIHRvIGEgTXNBc3QuXG5UaGlzIGlzIGEgcmVjdXJzaXZlLWRlc2NlbnQgcGFyc2VyLCBtYWRlIGVhc2llciBieSB0d28gZmFjdHM6XG5cdCogV2UgaGF2ZSBhbHJlYWR5IGdyb3VwZWQgdG9rZW5zLlxuXHQqIE1vc3Qgb2YgdGhlIHRpbWUsIGFuIGFzdCdzIHR5cGUgaXMgZGV0ZXJtaW5lZCBieSB0aGUgZmlyc3QgdG9rZW4uXG5cblRoZXJlIGFyZSBleGNlcHRpb25zIHN1Y2ggYXMgYXNzaWdubWVudCBzdGF0ZW1lbnRzIChpbmRpY2F0ZWQgYnkgYSBgPWAgc29tZXdoZXJlIGluIHRoZSBtaWRkbGUpLlxuRm9yIHRob3NlIHdlIG11c3QgaXRlcmF0ZSB0aHJvdWdoIHRva2VucyBhbmQgc3BsaXQuXG4oU2VlIFNsaWNlLm9wU3BsaXRPbmNlV2hlcmUgYW5kIFNsaWNlLm9wU3BsaXRNYW55V2hlcmUuKVxuKi9cbmV4cG9ydCBkZWZhdWx0IChfY29udGV4dCwgcm9vdFRva2VuKSA9PiB7XG5cdGNvbnRleHQgPSBfY29udGV4dFxuXHRjb25zdCBtc0FzdCA9IHBhcnNlTW9kdWxlKFNsaWNlLmdyb3VwKHJvb3RUb2tlbikpXG5cdC8vIFJlbGVhc2UgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbnMuXG5cdGNvbnRleHQgPSB1bmRlZmluZWRcblx0cmV0dXJuIG1zQXN0XG59XG5cbmNvbnN0XG5cdGNoZWNrRW1wdHkgPSAodG9rZW5zLCBtZXNzYWdlKSA9PlxuXHRcdGNvbnRleHQuY2hlY2sodG9rZW5zLmlzRW1wdHkoKSwgdG9rZW5zLmxvYywgbWVzc2FnZSksXG5cdGNoZWNrTm9uRW1wdHkgPSAodG9rZW5zLCBtZXNzYWdlKSA9PlxuXHRcdGNvbnRleHQuY2hlY2soIXRva2Vucy5pc0VtcHR5KCksIHRva2Vucy5sb2MsIG1lc3NhZ2UpLFxuXHR1bmV4cGVjdGVkID0gdG9rZW4gPT4gY29udGV4dC5mYWlsKHRva2VuLmxvYywgYFVuZXhwZWN0ZWQgJHt0b2tlbn1gKVxuXG5jb25zdCBwYXJzZU1vZHVsZSA9IHRva2VucyA9PiB7XG5cdC8vIE1vZHVsZSBkb2MgY29tbWVudCBtdXN0IGNvbWUgZmlyc3QuXG5cdGNvbnN0IFsgb3BDb21tZW50LCByZXN0MCBdID0gdHJ5VGFrZUNvbW1lbnQodG9rZW5zKVxuXHQvLyBVc2Ugc3RhdGVtZW50cyBtdXN0IGFwcGVhciBpbiBvcmRlci5cblx0Y29uc3QgeyB1c2VzOiBkb1VzZXMsIHJlc3Q6IHJlc3QxIH0gPSB0cnlQYXJzZVVzZXMoS1dfVXNlRG8sIHJlc3QwKVxuXHRjb25zdCB7IHVzZXM6IHBsYWluVXNlcywgb3BVc2VHbG9iYWwsIHJlc3Q6IHJlc3QyIH0gPSB0cnlQYXJzZVVzZXMoS1dfVXNlLCByZXN0MSlcblx0Y29uc3QgeyB1c2VzOiBsYXp5VXNlcywgcmVzdDogcmVzdDMgfSA9IHRyeVBhcnNlVXNlcyhLV19Vc2VMYXp5LCByZXN0Milcblx0Y29uc3QgeyB1c2VzOiBkZWJ1Z1VzZXMsIHJlc3Q6IHJlc3Q0IH0gPSB0cnlQYXJzZVVzZXMoS1dfVXNlRGVidWcsIHJlc3QzKVxuXG5cdGNvbnN0IGxpbmVzID0gcGFyc2VNb2R1bGVCbG9jayhyZXN0NClcblxuXHRpZiAoY29udGV4dC5vcHRzLmluY2x1ZGVNb2R1bGVOYW1lKCkpIHtcblx0XHRjb25zdCBuYW1lID0gbmV3IExvY2FsRGVjbGFyZU5hbWUodG9rZW5zLmxvYylcblx0XHRjb25zdCBhc3NpZ24gPSBuZXcgQXNzaWduU2luZ2xlKHRva2Vucy5sb2MsIG5hbWUsXG5cdFx0XHRRdW90ZS5mb3JTdHJpbmcodG9rZW5zLmxvYywgY29udGV4dC5vcHRzLm1vZHVsZU5hbWUoKSkpXG5cdFx0bGluZXMucHVzaChuZXcgTW9kdWxlRXhwb3J0TmFtZWQodG9rZW5zLmxvYywgYXNzaWduKSlcblx0fVxuXG5cdGNvbnN0IHVzZXMgPSBwbGFpblVzZXMuY29uY2F0KGxhenlVc2VzKVxuXHRyZXR1cm4gbmV3IE1vZHVsZSh0b2tlbnMubG9jLCBvcENvbW1lbnQsIGRvVXNlcywgdXNlcywgb3BVc2VHbG9iYWwsIGRlYnVnVXNlcywgbGluZXMpXG59XG5cbi8vIHBhcnNlQmxvY2tcbmNvbnN0XG5cdC8vIFRva2VucyBvbiB0aGUgbGluZSBiZWZvcmUgYSBibG9jaywgYW5kIHRva2VucyBmb3IgdGhlIGJsb2NrIGl0c2VsZi5cblx0YmVmb3JlQW5kQmxvY2sgPSB0b2tlbnMgPT4ge1xuXHRcdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAnRXhwZWN0ZWQgYW4gaW5kZW50ZWQgYmxvY2suJylcblx0XHRjb25zdCBibG9jayA9IHRva2Vucy5sYXN0KClcblx0XHRjb250ZXh0LmNoZWNrKGlzR3JvdXAoR19CbG9jaywgYmxvY2spLCBibG9jay5sb2MsICdFeHBlY3RlZCBhbiBpbmRlbnRlZCBibG9jay4nKVxuXHRcdHJldHVybiBbIHRva2Vucy5ydGFpbCgpLCBTbGljZS5ncm91cChibG9jaykgXVxuXHR9LFxuXG5cdGJsb2NrV3JhcCA9IHRva2VucyA9PiBuZXcgQmxvY2tXcmFwKHRva2Vucy5sb2MsIHBhcnNlQmxvY2tWYWwodG9rZW5zKSksXG5cblx0anVzdEJsb2NrID0gKGtleXdvcmQsIHRva2VucykgPT4ge1xuXHRcdGNvbnN0IFsgYmVmb3JlLCBibG9jayBdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRcdGNoZWNrRW1wdHkoYmVmb3JlLCAoKSA9PlxuXHRcdFx0YERpZCBub3QgZXhwZWN0IGFueXRoaW5nIGJldHdlZW4gJHtjb2RlKGtleXdvcmROYW1lKGtleXdvcmQpKX0gYW5kIGJsb2NrLmApXG5cdFx0cmV0dXJuIGJsb2NrXG5cdH0sXG5cdGp1c3RCbG9ja0RvID0gKGtleXdvcmQsIHRva2VucykgPT5cblx0XHRwYXJzZUJsb2NrRG8oanVzdEJsb2NrKGtleXdvcmQsIHRva2VucykpLFxuXHRqdXN0QmxvY2tWYWwgPSAoa2V5d29yZCwgdG9rZW5zKSA9PlxuXHRcdHBhcnNlQmxvY2tWYWwoanVzdEJsb2NrKGtleXdvcmQsIHRva2VucykpLFxuXG5cdC8vIEdldHMgbGluZXMgaW4gYSByZWdpb24gb3IgRGVidWcuXG5cdHBhcnNlTGluZXNGcm9tQmxvY2sgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpXG5cdFx0Y29udGV4dC5jaGVjayh0b2tlbnMuc2l6ZSgpID4gMSAmJiB0b2tlbnMuc2l6ZSgpID09PSAyICYmIGlzR3JvdXAoR19CbG9jaywgdG9rZW5zLnNlY29uZCgpKSxcblx0XHRcdGgubG9jLCAoKSA9PlxuXHRcdFx0YEV4cGVjdGVkIGluZGVudGVkIGJsb2NrIGFmdGVyICR7aH0sIGFuZCBub3RoaW5nIGVsc2UuYClcblx0XHRjb25zdCBibG9jayA9IHRva2Vucy5zZWNvbmQoKVxuXG5cdFx0Y29uc3QgbGluZXMgPSBbIF1cblx0XHRmb3IgKGNvbnN0IGxpbmUgb2YgU2xpY2UuZ3JvdXAoYmxvY2spLnNsaWNlcygpKVxuXHRcdFx0bGluZXMucHVzaCguLi5wYXJzZUxpbmVPckxpbmVzKGxpbmUpKVxuXHRcdHJldHVybiBsaW5lc1xuXHR9LFxuXG5cdHBhcnNlQmxvY2tEbyA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgWyBvcENvbW1lbnQsIHJlc3QgXSA9IHRyeVRha2VDb21tZW50KHRva2Vucylcblx0XHRjb25zdCBsaW5lcyA9IF9wbGFpbkJsb2NrTGluZXMocmVzdClcblx0XHRyZXR1cm4gbmV3IEJsb2NrRG8odG9rZW5zLmxvYywgb3BDb21tZW50LCBsaW5lcylcblx0fSxcblxuXHRwYXJzZUJsb2NrVmFsID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBbIG9wQ29tbWVudCwgcmVzdCBdID0gdHJ5VGFrZUNvbW1lbnQodG9rZW5zKVxuXHRcdGNvbnN0IHsgbGluZXMsIGtSZXR1cm4gfSA9IF9wYXJzZUJsb2NrTGluZXMocmVzdClcblx0XHRzd2l0Y2ggKGtSZXR1cm4pIHtcblx0XHRcdGNhc2UgS1JldHVybl9CYWc6XG5cdFx0XHRcdHJldHVybiBCbG9ja0JhZy5vZih0b2tlbnMubG9jLCBvcENvbW1lbnQsIGxpbmVzKVxuXHRcdFx0Y2FzZSBLUmV0dXJuX01hcDpcblx0XHRcdFx0cmV0dXJuIEJsb2NrTWFwLm9mKHRva2Vucy5sb2MsIG9wQ29tbWVudCwgbGluZXMpXG5cdFx0XHRjYXNlIEtSZXR1cm5fT2JqOlxuXHRcdFx0XHRjb25zdCBbIGRvTGluZXMsIG9wVmFsIF0gPSBfdHJ5VGFrZUxhc3RWYWwobGluZXMpXG5cdFx0XHRcdC8vIG9wTmFtZSB3cml0dGVuIHRvIGJ5IF90cnlBZGROYW1lLlxuXHRcdFx0XHRyZXR1cm4gQmxvY2tPYmoub2YodG9rZW5zLmxvYywgb3BDb21tZW50LCBkb0xpbmVzLCBvcFZhbCwgbnVsbClcblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0Y29udGV4dC5jaGVjayghaXNFbXB0eShsaW5lcyksIHRva2Vucy5sb2MsICdWYWx1ZSBibG9jayBtdXN0IGVuZCBpbiBhIHZhbHVlLicpXG5cdFx0XHRcdGNvbnN0IHZhbCA9IGxhc3QobGluZXMpXG5cdFx0XHRcdGlmICh2YWwgaW5zdGFuY2VvZiBUaHJvdylcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEJsb2NrVmFsVGhyb3codG9rZW5zLmxvYywgb3BDb21tZW50LCBydGFpbChsaW5lcyksIHZhbClcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayh2YWwgaW5zdGFuY2VvZiBWYWwsIHZhbC5sb2MsICdWYWx1ZSBibG9jayBtdXN0IGVuZCBpbiBhIHZhbHVlLicpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBCbG9ja1dpdGhSZXR1cm4odG9rZW5zLmxvYywgb3BDb21tZW50LCBydGFpbChsaW5lcyksIHZhbClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRwYXJzZU1vZHVsZUJsb2NrID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCB7IGxpbmVzLCBrUmV0dXJuIH0gPSBfcGFyc2VCbG9ja0xpbmVzKHRva2VucywgdHJ1ZSlcblx0XHRjb25zdCBvcENvbW1lbnQgPSBudWxsXG5cdFx0Y29uc3QgbG9jID0gdG9rZW5zLmxvY1xuXHRcdHN3aXRjaCAoa1JldHVybikge1xuXHRcdFx0Y2FzZSBLUmV0dXJuX0JhZzogY2FzZSBLUmV0dXJuX01hcDoge1xuXHRcdFx0XHRjb25zdCBjbHMgPSBrUmV0dXJuID09PSBLUmV0dXJuX0JhZyA/IEJsb2NrQmFnIDogQmxvY2tNYXBcblx0XHRcdFx0Y29uc3QgYmxvY2sgPSBjbHMub2YobG9jLCBvcENvbW1lbnQsIGxpbmVzKVxuXHRcdFx0XHRjb25zdCB2YWwgPSBuZXcgQmxvY2tXcmFwKGxvYywgYmxvY2spXG5cdFx0XHRcdGNvbnN0IGFzc2lnbmVlID0gTG9jYWxEZWNsYXJlLnBsYWluKGxvYywgY29udGV4dC5vcHRzLm1vZHVsZU5hbWUoKSlcblx0XHRcdFx0Y29uc3QgYXNzaWduID0gbmV3IEFzc2lnblNpbmdsZShsb2MsIGFzc2lnbmVlLCB2YWwpXG5cdFx0XHRcdHJldHVybiBbIG5ldyBNb2R1bGVFeHBvcnREZWZhdWx0KGxvYywgYXNzaWduKSBdXG5cdFx0XHR9XG5cdFx0XHRjYXNlIEtSZXR1cm5fT2JqOiB7XG5cdFx0XHRcdGNvbnN0IG1vZHVsZU5hbWUgPSBjb250ZXh0Lm9wdHMubW9kdWxlTmFtZSgpXG5cblx0XHRcdFx0Ly8gTW9kdWxlIGV4cG9ydHMgbG9vayBsaWtlIGEgQmxvY2tPYmosICBidXQgYXJlIHJlYWxseSBkaWZmZXJlbnQuXG5cdFx0XHRcdC8vIEluIEVTNiwgbW9kdWxlIGV4cG9ydHMgbXVzdCBiZSBjb21wbGV0ZWx5IHN0YXRpYy5cblx0XHRcdFx0Ly8gU28gd2Uga2VlcCBhbiBhcnJheSBvZiBleHBvcnRzIGF0dGFjaGVkIGRpcmVjdGx5IHRvIHRoZSBNb2R1bGUgYXN0LlxuXHRcdFx0XHQvLyBJZiB5b3Ugd3JpdGU6XG5cdFx0XHRcdC8vXHRpZiEgY29uZFxuXHRcdFx0XHQvL1x0XHRhLiBiXG5cdFx0XHRcdC8vIGluIGEgbW9kdWxlIGNvbnRleHQsIGl0IHdpbGwgYmUgYW4gZXJyb3IuIChUaGUgbW9kdWxlIGNyZWF0ZXMgbm8gYGJ1aWx0YCBsb2NhbC4pXG5cdFx0XHRcdGNvbnN0IGNvbnZlcnRUb0V4cG9ydHMgPSBsaW5lID0+IHtcblx0XHRcdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIE9iakVudHJ5KSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKGxpbmUgaW5zdGFuY2VvZiBPYmpFbnRyeUFzc2lnbiwgbGluZS5sb2MsXG5cdFx0XHRcdFx0XHRcdCdNb2R1bGUgZXhwb3J0cyBjYW4gbm90IGJlIGNvbXB1dGVkLicpXG5cdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKGxpbmUuYXNzaWduIGluc3RhbmNlb2YgQXNzaWduU2luZ2xlLCBsaW5lLmxvYyxcblx0XHRcdFx0XHRcdFx0J0V4cG9ydCBBc3NpZ25EZXN0cnVjdHVyZSBub3QgeWV0IHN1cHBvcnRlZC4nKVxuXHRcdFx0XHRcdFx0cmV0dXJuIGxpbmUuYXNzaWduLmFzc2lnbmVlLm5hbWUgPT09IG1vZHVsZU5hbWUgP1xuXHRcdFx0XHRcdFx0XHRuZXcgTW9kdWxlRXhwb3J0RGVmYXVsdChsaW5lLmxvYywgbGluZS5hc3NpZ24pIDpcblx0XHRcdFx0XHRcdFx0bmV3IE1vZHVsZUV4cG9ydE5hbWVkKGxpbmUubG9jLCBsaW5lLmFzc2lnbilcblx0XHRcdFx0XHR9IGVsc2UgaWYgKGxpbmUgaW5zdGFuY2VvZiBEZWJ1Zylcblx0XHRcdFx0XHRcdGxpbmUubGluZXMgPSBsaW5lLmxpbmVzLm1hcChjb252ZXJ0VG9FeHBvcnRzKVxuXHRcdFx0XHRcdHJldHVybiBsaW5lXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gbGluZXMubWFwKGNvbnZlcnRUb0V4cG9ydHMpXG5cdFx0XHR9XG5cdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdGNvbnN0IFsgbW9kdWxlTGluZXMsIG9wRGVmYXVsdEV4cG9ydCBdID0gX3RyeVRha2VMYXN0VmFsKGxpbmVzKVxuXHRcdFx0XHRpZiAob3BEZWZhdWx0RXhwb3J0ICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0Y29uc3QgXyA9IG9wRGVmYXVsdEV4cG9ydFxuXHRcdFx0XHRcdG1vZHVsZUxpbmVzLnB1c2gobmV3IE1vZHVsZUV4cG9ydERlZmF1bHQoXy5sb2MsXG5cdFx0XHRcdFx0XHRuZXcgQXNzaWduU2luZ2xlKF8ubG9jLFxuXHRcdFx0XHRcdFx0XHRMb2NhbERlY2xhcmUucGxhaW4ob3BEZWZhdWx0RXhwb3J0LmxvYywgY29udGV4dC5vcHRzLm1vZHVsZU5hbWUoKSksXG5cdFx0XHRcdFx0XHRcdF8pKSlcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gbW9kdWxlTGluZXNcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuLy8gcGFyc2VCbG9jayBwcml2YXRlc1xuY29uc3Rcblx0X3RyeVRha2VMYXN0VmFsID0gbGluZXMgPT5cblx0XHQhaXNFbXB0eShsaW5lcykgJiYgbGFzdChsaW5lcykgaW5zdGFuY2VvZiBWYWwgP1xuXHRcdFx0WyBydGFpbChsaW5lcyksIGxhc3QobGluZXMpIF0gOlxuXHRcdFx0WyBsaW5lcywgbnVsbCBdLFxuXG5cdF9wbGFpbkJsb2NrTGluZXMgPSBsaW5lVG9rZW5zID0+IHtcblx0XHRjb25zdCBsaW5lcyA9IFsgXVxuXHRcdGNvbnN0IGFkZExpbmUgPSBsaW5lID0+IHtcblx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgQXJyYXkpXG5cdFx0XHRcdGZvciAoY29uc3QgXyBvZiBsaW5lKVxuXHRcdFx0XHRcdGFkZExpbmUoXylcblx0XHRcdGVsc2Vcblx0XHRcdFx0bGluZXMucHVzaChsaW5lKVxuXHRcdH1cblx0XHRmb3IgKGNvbnN0IF8gb2YgbGluZVRva2Vucy5zbGljZXMoKSlcblx0XHRcdGFkZExpbmUocGFyc2VMaW5lKF8pKVxuXHRcdHJldHVybiBsaW5lc1xuXHR9LFxuXG5cdEtSZXR1cm5fUGxhaW4gPSAwLFxuXHRLUmV0dXJuX09iaiA9IDEsXG5cdEtSZXR1cm5fQmFnID0gMixcblx0S1JldHVybl9NYXAgPSAzLFxuXHRfcGFyc2VCbG9ja0xpbmVzID0gbGluZVRva2VucyA9PiB7XG5cdFx0bGV0IGlzQmFnID0gZmFsc2UsIGlzTWFwID0gZmFsc2UsIGlzT2JqID0gZmFsc2Vcblx0XHRjb25zdCBjaGVja0xpbmUgPSBsaW5lID0+IHtcblx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgRGVidWcpXG5cdFx0XHRcdGZvciAoY29uc3QgXyBvZiBsaW5lLmxpbmVzKVxuXHRcdFx0XHRcdGNoZWNrTGluZShfKVxuXHRcdFx0ZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIEJhZ0VudHJ5KVxuXHRcdFx0XHRpc0JhZyA9IHRydWVcblx0XHRcdGVsc2UgaWYgKGxpbmUgaW5zdGFuY2VvZiBNYXBFbnRyeSlcblx0XHRcdFx0aXNNYXAgPSB0cnVlXG5cdFx0XHRlbHNlIGlmIChsaW5lIGluc3RhbmNlb2YgT2JqRW50cnkpXG5cdFx0XHRcdGlzT2JqID0gdHJ1ZVxuXHRcdH1cblx0XHRjb25zdCBsaW5lcyA9IF9wbGFpbkJsb2NrTGluZXMobGluZVRva2Vucylcblx0XHRmb3IgKGNvbnN0IF8gb2YgbGluZXMpXG5cdFx0XHRjaGVja0xpbmUoXylcblxuXHRcdGNvbnRleHQuY2hlY2soIShpc09iaiAmJiBpc0JhZyksIGxpbmVzLmxvYywgJ0Jsb2NrIGhhcyBib3RoIEJhZyBhbmQgT2JqIGxpbmVzLicpXG5cdFx0Y29udGV4dC5jaGVjayghKGlzT2JqICYmIGlzTWFwKSwgbGluZXMubG9jLCAnQmxvY2sgaGFzIGJvdGggT2JqIGFuZCBNYXAgbGluZXMuJylcblx0XHRjb250ZXh0LmNoZWNrKCEoaXNCYWcgJiYgaXNNYXApLCBsaW5lcy5sb2MsICdCbG9jayBoYXMgYm90aCBCYWcgYW5kIE1hcCBsaW5lcy4nKVxuXG5cdFx0Y29uc3Qga1JldHVybiA9XG5cdFx0XHRpc09iaiA/IEtSZXR1cm5fT2JqIDogaXNCYWcgPyBLUmV0dXJuX0JhZyA6IGlzTWFwID8gS1JldHVybl9NYXAgOiBLUmV0dXJuX1BsYWluXG5cdFx0cmV0dXJuIHsgbGluZXMsIGtSZXR1cm4gfVxuXHR9XG5cbmNvbnN0IHBhcnNlQ2FzZSA9IChpc1ZhbCwgY2FzZWRGcm9tRnVuLCB0b2tlbnMpID0+IHtcblx0Y29uc3QgWyBiZWZvcmUsIGJsb2NrIF0gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cblx0bGV0IG9wQ2FzZWRcblx0aWYgKGNhc2VkRnJvbUZ1bikge1xuXHRcdGNoZWNrRW1wdHkoYmVmb3JlLCAnQ2FuXFwndCBtYWtlIGZvY3VzIC0tIGlzIGltcGxpY2l0bHkgcHJvdmlkZWQgYXMgZmlyc3QgYXJndW1lbnQuJylcblx0XHRvcENhc2VkID0gbnVsbFxuXHR9IGVsc2Vcblx0XHRvcENhc2VkID0gb3BJZighYmVmb3JlLmlzRW1wdHkoKSwgKCkgPT4gQXNzaWduU2luZ2xlLmZvY3VzKGJlZm9yZS5sb2MsIHBhcnNlRXhwcihiZWZvcmUpKSlcblxuXHRjb25zdCBsYXN0TGluZSA9IFNsaWNlLmdyb3VwKGJsb2NrLmxhc3QoKSlcblx0Y29uc3QgWyBwYXJ0TGluZXMsIG9wRWxzZSBdID0gaXNLZXl3b3JkKEtXX0Vsc2UsIGxhc3RMaW5lLmhlYWQoKSkgP1xuXHRcdFsgYmxvY2sucnRhaWwoKSwgKGlzVmFsID8ganVzdEJsb2NrVmFsIDoganVzdEJsb2NrRG8pKEtXX0Vsc2UsIGxhc3RMaW5lLnRhaWwoKSkgXSA6XG5cdFx0WyBibG9jaywgbnVsbCBdXG5cblx0Y29uc3QgcGFydHMgPSBwYXJ0TGluZXMubWFwU2xpY2VzKF9wYXJzZUNhc2VMaW5lKGlzVmFsKSlcblx0Y29udGV4dC5jaGVjayhwYXJ0cy5sZW5ndGggPiAwLCB0b2tlbnMubG9jLCAoKSA9PlxuXHRcdGBNdXN0IGhhdmUgYXQgbGVhc3QgMSBub24tJHtjb2RlKCdlbHNlJyl9IHRlc3QuYClcblxuXHRyZXR1cm4gbmV3IChpc1ZhbCA/IENhc2VWYWwgOiBDYXNlRG8pKHRva2Vucy5sb2MsIG9wQ2FzZWQsIHBhcnRzLCBvcEVsc2UpXG59XG4vLyBwYXJzZUNhc2UgcHJpdmF0ZXNcbmNvbnN0XG5cdF9wYXJzZUNhc2VMaW5lID0gaXNWYWwgPT4gbGluZSA9PiB7XG5cdFx0Y29uc3QgWyBiZWZvcmUsIGJsb2NrIF0gPSBiZWZvcmVBbmRCbG9jayhsaW5lKVxuXHRcdGNvbnN0IHRlc3QgPSBfcGFyc2VDYXNlVGVzdChiZWZvcmUpXG5cdFx0Y29uc3QgcmVzdWx0ID0gKGlzVmFsID8gcGFyc2VCbG9ja1ZhbCA6IHBhcnNlQmxvY2tEbykoYmxvY2spXG5cdFx0cmV0dXJuIG5ldyAoaXNWYWwgPyBDYXNlVmFsUGFydCA6IENhc2VEb1BhcnQpKGxpbmUubG9jLCB0ZXN0LCByZXN1bHQpXG5cdH0sXG5cdF9wYXJzZUNhc2VUZXN0ID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBmaXJzdCA9IHRva2Vucy5oZWFkKClcblx0XHQvLyBQYXR0ZXJuIG1hdGNoIHN0YXJ0cyB3aXRoIHR5cGUgdGVzdCBhbmQgaXMgZm9sbG93ZWQgYnkgbG9jYWwgZGVjbGFyZXMuXG5cdFx0Ly8gRS5nLiwgYDpTb21lIHZhbGBcblx0XHRpZiAoaXNHcm91cChHX1NwYWNlLCBmaXJzdCkgJiYgdG9rZW5zLnNpemUoKSA+IDEpIHtcblx0XHRcdGNvbnN0IGZ0ID0gU2xpY2UuZ3JvdXAoZmlyc3QpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtXX1R5cGUsIGZ0LmhlYWQoKSkpIHtcblx0XHRcdFx0Y29uc3QgdHlwZSA9IHBhcnNlU3BhY2VkKGZ0LnRhaWwoKSlcblx0XHRcdFx0Y29uc3QgbG9jYWxzID0gcGFyc2VMb2NhbERlY2xhcmVzKHRva2Vucy50YWlsKCkpXG5cdFx0XHRcdHJldHVybiBuZXcgUGF0dGVybihmaXJzdC5sb2MsIHR5cGUsIGxvY2FscywgTG9jYWxBY2Nlc3MuZm9jdXModG9rZW5zLmxvYykpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBwYXJzZUV4cHIodG9rZW5zKVxuXHR9XG5cbmNvbnN0IHBhcnNlU3dpdGNoID0gKGlzVmFsLCB0b2tlbnMpID0+IHtcblx0Y29uc3QgWyBiZWZvcmUsIGJsb2NrIF0gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdGNvbnN0IHN3aXRjaGVkID0gcGFyc2VFeHByKGJlZm9yZSlcblx0Y29uc3QgbGFzdExpbmUgPSBTbGljZS5ncm91cChibG9jay5sYXN0KCkpXG5cdGNvbnN0IFsgcGFydExpbmVzLCBvcEVsc2UgXSA9IGlzS2V5d29yZChLV19FbHNlLCBsYXN0TGluZS5oZWFkKCkpID9cblx0XHRbIGJsb2NrLnJ0YWlsKCksIChpc1ZhbCA/IGp1c3RCbG9ja1ZhbCA6IGp1c3RCbG9ja0RvKShLV19FbHNlLCBsYXN0TGluZS50YWlsKCkpIF0gOlxuXHRcdFsgYmxvY2ssIG51bGwgXVxuXG5cdGNvbnN0IHBhcnRzID0gcGFydExpbmVzLm1hcFNsaWNlcyhfcGFyc2VTd2l0Y2hMaW5lKGlzVmFsKSlcblx0Y29udGV4dC5jaGVjayhwYXJ0cy5sZW5ndGggPiAwLCB0b2tlbnMubG9jLCAoKSA9PlxuXHRcdGBNdXN0IGhhdmUgYXQgbGVhc3QgMSBub24tJHtjb2RlKCdlbHNlJyl9IHRlc3QuYClcblxuXHRyZXR1cm4gbmV3IChpc1ZhbCA/IFN3aXRjaFZhbCA6IFN3aXRjaERvKSh0b2tlbnMubG9jLCBzd2l0Y2hlZCwgcGFydHMsIG9wRWxzZSlcbn1cbmNvbnN0XG5cdF9wYXJzZVN3aXRjaExpbmUgPSBpc1ZhbCA9PiBsaW5lID0+IHtcblx0XHRjb25zdCBbIGJlZm9yZSwgYmxvY2sgXSA9IGJlZm9yZUFuZEJsb2NrKGxpbmUpXG5cblx0XHRsZXQgdmFsdWVzXG5cdFx0aWYgKGlzS2V5d29yZChLV19PciwgYmVmb3JlLmhlYWQoKSkpXG5cdFx0XHR2YWx1ZXMgPSBiZWZvcmUudGFpbCgpLm1hcChwYXJzZVNpbmdsZSlcblx0XHRlbHNlXG5cdFx0XHR2YWx1ZXMgPSBbIHBhcnNlRXhwcihiZWZvcmUpIF1cblxuXHRcdGNvbnN0IHJlc3VsdCA9IChpc1ZhbCA/IHBhcnNlQmxvY2tWYWwgOiBwYXJzZUJsb2NrRG8pKGJsb2NrKVxuXHRcdHJldHVybiBuZXcgKGlzVmFsID8gU3dpdGNoVmFsUGFydCA6IFN3aXRjaERvUGFydCkobGluZS5sb2MsIHZhbHVlcywgcmVzdWx0KVxuXHR9XG5cbmNvbnN0XG5cdHBhcnNlRXhwciA9IHRva2VucyA9PiB7XG5cdFx0cmV0dXJuIGlmRWxzZSh0b2tlbnMub3BTcGxpdE1hbnlXaGVyZShfID0+IGlzS2V5d29yZChLV19PYmpBc3NpZ24sIF8pKSxcblx0XHRcdHNwbGl0cyA9PiB7XG5cdFx0XHRcdC8vIFNob3J0IG9iamVjdCBmb3JtLCBzdWNoIGFzIChhLiAxLCBiLiAyKVxuXHRcdFx0XHRjb25zdCBmaXJzdCA9IHNwbGl0c1swXS5iZWZvcmVcblx0XHRcdFx0Y2hlY2tOb25FbXB0eShmaXJzdCwgKCkgPT4gYFVuZXhwZWN0ZWQgJHtzcGxpdHNbMF0uYXR9YClcblx0XHRcdFx0Y29uc3QgdG9rZW5zQ2FsbGVyID0gZmlyc3QucnRhaWwoKVxuXG5cdFx0XHRcdGNvbnN0IHBhaXJzID0gWyBdXG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc3BsaXRzLmxlbmd0aCAtIDE7IGkgPSBpICsgMSkge1xuXHRcdFx0XHRcdGNvbnN0IG5hbWUgPSBzcGxpdHNbaV0uYmVmb3JlLmxhc3QoKVxuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2sobmFtZSBpbnN0YW5jZW9mIE5hbWUsIG5hbWUubG9jLCAoKSA9PlxuXHRcdFx0XHRcdFx0YEV4cGVjdGVkIGEgbmFtZSwgbm90ICR7bmFtZX1gKVxuXHRcdFx0XHRcdGNvbnN0IHRva2Vuc1ZhbHVlID0gaSA9PT0gc3BsaXRzLmxlbmd0aCAtIDIgP1xuXHRcdFx0XHRcdFx0c3BsaXRzW2kgKyAxXS5iZWZvcmUgOlxuXHRcdFx0XHRcdFx0c3BsaXRzW2kgKyAxXS5iZWZvcmUucnRhaWwoKVxuXHRcdFx0XHRcdGNvbnN0IHZhbHVlID0gcGFyc2VFeHByUGxhaW4odG9rZW5zVmFsdWUpXG5cdFx0XHRcdFx0Y29uc3QgbG9jID0gbmV3IExvYyhuYW1lLmxvYy5zdGFydCwgdG9rZW5zVmFsdWUubG9jLmVuZClcblx0XHRcdFx0XHRwYWlycy5wdXNoKG5ldyBPYmpQYWlyKGxvYywgbmFtZS5uYW1lLCB2YWx1ZSkpXG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgdmFsID0gbmV3IE9ialNpbXBsZSh0b2tlbnMubG9jLCBwYWlycylcblx0XHRcdFx0aWYgKHRva2Vuc0NhbGxlci5pc0VtcHR5KCkpXG5cdFx0XHRcdFx0cmV0dXJuIHZhbFxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKHRva2Vuc0NhbGxlcilcblx0XHRcdFx0XHRyZXR1cm4gbmV3IENhbGwodG9rZW5zLmxvYywgaGVhZChwYXJ0cyksIGNhdCh0YWlsKHBhcnRzKSwgdmFsKSlcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdCgpID0+IHBhcnNlRXhwclBsYWluKHRva2Vucylcblx0XHQpXG5cdH0sXG5cblx0cGFyc2VFeHByUGxhaW4gPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHModG9rZW5zKVxuXHRcdHN3aXRjaCAocGFydHMubGVuZ3RoKSB7XG5cdFx0XHRjYXNlIDA6XG5cdFx0XHRcdGNvbnRleHQuZmFpbCh0b2tlbnMubG9jLCAnRXhwZWN0ZWQgYW4gZXhwcmVzc2lvbiwgZ290IG5vdGhpbmcuJylcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0cmV0dXJuIGhlYWQocGFydHMpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gbmV3IENhbGwodG9rZW5zLmxvYywgaGVhZChwYXJ0cyksIHRhaWwocGFydHMpKVxuXHRcdH1cblx0fSxcblxuXHRwYXJzZUV4cHJQYXJ0cyA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3Qgb3BTcGxpdCA9IHRva2Vucy5vcFNwbGl0T25jZVdoZXJlKHRva2VuID0+IHtcblx0XHRcdGlmICh0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0XHRcdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdFx0XHRcdGNhc2UgS1dfQW5kOiBjYXNlIEtXX0Nhc2VWYWw6IGNhc2UgS1dfQ2xhc3M6IGNhc2UgS1dfQ29uZDogY2FzZSBLV19FeGNlcHRWYWw6XG5cdFx0XHRcdFx0Y2FzZSBLV19Gb3JCYWc6IGNhc2UgS1dfRm9yVmFsOiBjYXNlIEtXX0Z1bjogY2FzZSBLV19GdW5EbzogY2FzZSBLV19GdW5HZW46XG5cdFx0XHRcdFx0Y2FzZSBLV19GdW5HZW5EbzogY2FzZSBLV19GdW5UaGlzOiBjYXNlIEtXX0Z1blRoaXNEbzogY2FzZSBLV19GdW5UaGlzR2VuOlxuXHRcdFx0XHRcdGNhc2UgS1dfRnVuVGhpc0dlbkRvOiBjYXNlIEtXX0lmVmFsOiBjYXNlIEtXX05ldzogY2FzZSBLV19Ob3Q6IGNhc2UgS1dfT3I6XG5cdFx0XHRcdFx0Y2FzZSBLV19TdXBlclZhbDogY2FzZSBLV19Td2l0Y2hWYWw6IGNhc2UgS1dfVW5sZXNzVmFsOiBjYXNlIEtXX1dpdGg6XG5cdFx0XHRcdFx0Y2FzZSBLV19ZaWVsZDogY2FzZSBLV19ZaWVsZFRvOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdH0pXG5cdFx0cmV0dXJuIGlmRWxzZShvcFNwbGl0LFxuXHRcdFx0KHsgYmVmb3JlLCBhdCwgYWZ0ZXIgfSkgPT4ge1xuXHRcdFx0XHRjb25zdCBnZXRMYXN0ID0gKCkgPT4ge1xuXHRcdFx0XHRcdHN3aXRjaCAoYXQua2luZCkge1xuXHRcdFx0XHRcdFx0Y2FzZSBLV19BbmQ6IGNhc2UgS1dfT3I6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgTG9naWMoYXQubG9jLCBhdC5raW5kID09PSBLV19BbmQgPyBMX0FuZCA6IExfT3IsXG5cdFx0XHRcdFx0XHRcdFx0cGFyc2VFeHByUGFydHMoYWZ0ZXIpKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19DYXNlVmFsOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VDYXNlKHRydWUsIGZhbHNlLCBhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfQ2xhc3M6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUNsYXNzKGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19Db25kOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VDb25kKGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19FeGNlcHRWYWw6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUV4Y2VwdChLV19FeGNlcHRWYWwsIGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19Gb3JCYWc6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUZvckJhZyhhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfRm9yVmFsOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VGb3JWYWwoYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX0Z1bjogY2FzZSBLV19GdW5EbzogY2FzZSBLV19GdW5HZW46IGNhc2UgS1dfRnVuR2VuRG86XG5cdFx0XHRcdFx0XHRjYXNlIEtXX0Z1blRoaXM6IGNhc2UgS1dfRnVuVGhpc0RvOiBjYXNlIEtXX0Z1blRoaXNHZW46XG5cdFx0XHRcdFx0XHRjYXNlIEtXX0Z1blRoaXNHZW5Ebzpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlRnVuKGF0LmtpbmQsIGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19JZlZhbDogY2FzZSBLV19Vbmxlc3NWYWw6IHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgWyBiZWZvcmUsIGJsb2NrIF0gPSBiZWZvcmVBbmRCbG9jayhhZnRlcilcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbFZhbCh0b2tlbnMubG9jLFxuXHRcdFx0XHRcdFx0XHRcdHBhcnNlRXhwclBsYWluKGJlZm9yZSksXG5cdFx0XHRcdFx0XHRcdFx0cGFyc2VCbG9ja1ZhbChibG9jayksXG5cdFx0XHRcdFx0XHRcdFx0YXQua2luZCA9PT0gS1dfVW5sZXNzVmFsKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19OZXc6IHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyhhZnRlcilcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBOZXcoYXQubG9jLCBwYXJ0c1swXSwgdGFpbChwYXJ0cykpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjYXNlIEtXX05vdDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBOb3QoYXQubG9jLCBwYXJzZUV4cHJQbGFpbihhZnRlcikpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX1N1cGVyVmFsOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV3IFN1cGVyQ2FsbChhdC5sb2MsIHBhcnNlRXhwclBhcnRzKGFmdGVyKSlcblx0XHRcdFx0XHRcdGNhc2UgS1dfU3dpdGNoVmFsOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VTd2l0Y2godHJ1ZSwgYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX1dpdGg6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZVdpdGgoYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX1lpZWxkOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV3IFlpZWxkKGF0LmxvYyxcblx0XHRcdFx0XHRcdFx0XHRvcElmKCFhZnRlci5pc0VtcHR5KCksICgpID0+IHBhcnNlRXhwclBsYWluKGFmdGVyKSkpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX1lpZWxkVG86XG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgWWllbGRUbyhhdC5sb2MsIHBhcnNlRXhwclBsYWluKGFmdGVyKSlcblx0XHRcdFx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcihhdC5raW5kKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gY2F0KGJlZm9yZS5tYXAocGFyc2VTaW5nbGUpLCBnZXRMYXN0KCkpXG5cdFx0XHR9LFxuXHRcdFx0KCkgPT4gdG9rZW5zLm1hcChwYXJzZVNpbmdsZSkpXG5cdH1cblxuY29uc3QgcGFyc2VGdW4gPSAoa2luZCwgdG9rZW5zKSA9PiB7XG5cdGxldCBpc1RoaXMgPSBmYWxzZSwgaXNEbyA9IGZhbHNlLCBpc0dlbiA9IGZhbHNlXG5cdHN3aXRjaCAoa2luZCkge1xuXHRcdGNhc2UgS1dfRnVuOlxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1bkRvOlxuXHRcdFx0aXNEbyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5HZW46XG5cdFx0XHRpc0dlbiA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5HZW5Ebzpcblx0XHRcdGlzR2VuID0gdHJ1ZVxuXHRcdFx0aXNEbyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5UaGlzOlxuXHRcdFx0aXNUaGlzID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1blRoaXNEbzpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuVGhpc0dlbjpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGlzR2VuID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1blRoaXNHZW5Ebzpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGlzR2VuID0gdHJ1ZVxuXHRcdFx0aXNEbyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKClcblx0fVxuXHRjb25zdCBvcERlY2xhcmVUaGlzID0gb3BJZihpc1RoaXMsICgpID0+IG5ldyBMb2NhbERlY2xhcmVUaGlzKHRva2Vucy5sb2MpKVxuXG5cdGNvbnN0IHsgb3BSZXR1cm5UeXBlLCByZXN0IH0gPSBfdHJ5VGFrZVJldHVyblR5cGUodG9rZW5zKVxuXHRjb25zdCB7IGFyZ3MsIG9wUmVzdEFyZywgYmxvY2ssIG9wSW4sIG9wT3V0LCBvcENvbW1lbnQgfSA9IF9mdW5BcmdzQW5kQmxvY2soaXNEbywgcmVzdClcblx0Ly8gTmVlZCByZXMgZGVjbGFyZSBpZiB0aGVyZSBpcyBhIHJldHVybiB0eXBlIG9yIG91dCBjb25kaXRpb24uXG5cdGNvbnN0IG9wRGVjbGFyZVJlcyA9IGlmRWxzZShvcFJldHVyblR5cGUsXG5cdFx0XyA9PiBuZXcgTG9jYWxEZWNsYXJlUmVzKF8ubG9jLCBfKSxcblx0XHQoKSA9PiBvcE1hcChvcE91dCwgXyA9PiBuZXcgTG9jYWxEZWNsYXJlUmVzKF8ubG9jLCBudWxsKSkpXG5cdHJldHVybiBuZXcgRnVuKHRva2Vucy5sb2MsXG5cdFx0b3BEZWNsYXJlVGhpcywgaXNHZW4sIGFyZ3MsIG9wUmVzdEFyZywgYmxvY2ssIG9wSW4sIG9wRGVjbGFyZVJlcywgb3BPdXQsIG9wQ29tbWVudClcbn1cblxuLy8gcGFyc2VGdW4gcHJpdmF0ZXNcbmNvbnN0XG5cdF90cnlUYWtlUmV0dXJuVHlwZSA9IHRva2VucyA9PiB7XG5cdFx0aWYgKCF0b2tlbnMuaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXHRcdFx0aWYgKGlzR3JvdXAoR19TcGFjZSwgaCkgJiYgaXNLZXl3b3JkKEtXX1R5cGUsIGhlYWQoaC5zdWJUb2tlbnMpKSlcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRvcFJldHVyblR5cGU6IHBhcnNlU3BhY2VkKFNsaWNlLmdyb3VwKGgpLnRhaWwoKSksXG5cdFx0XHRcdFx0cmVzdDogdG9rZW5zLnRhaWwoKVxuXHRcdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB7IG9wUmV0dXJuVHlwZTogbnVsbCwgcmVzdDogdG9rZW5zIH1cblx0fSxcblxuXHQvKlxuXHRpbmNsdWRlTWVtYmVyQXJnczpcblx0XHRpZiB0cnVlLCBvdXRwdXQgd2lsbCBpbmNsdWRlIGBtZW1iZXJBcmdzYC5cblx0XHRUaGlzIGlzIGEgc3Vic2V0IG9mIGBhcmdzYCB3aG9zZSBuYW1lcyBhcmUgcHJlZml4ZWQgd2l0aCBgLmBcblx0XHRlLmcuOiBgY29uc3RydWN0ISAueCAueWBcblx0XHRUaGlzIGlzIGZvciBjb25zdHJ1Y3RvcnMgb25seS5cblx0Ki9cblx0X2Z1bkFyZ3NBbmRCbG9jayA9IChpc0RvLCB0b2tlbnMsIGluY2x1ZGVNZW1iZXJBcmdzKSA9PiB7XG5cdFx0Y2hlY2tOb25FbXB0eSh0b2tlbnMsICdFeHBlY3RlZCBhbiBpbmRlbnRlZCBibG9jay4nKVxuXHRcdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpXG5cdFx0Ly8gTWlnaHQgYmUgYHxjYXNlYFxuXHRcdGlmIChoIGluc3RhbmNlb2YgS2V5d29yZCAmJiAoaC5raW5kID09PSBLV19DYXNlVmFsIHx8IGgua2luZCA9PT0gS1dfQ2FzZURvKSkge1xuXHRcdFx0Y29uc3QgZUNhc2UgPSBwYXJzZUNhc2UoaC5raW5kID09PSBLV19DYXNlVmFsLCB0cnVlLCB0b2tlbnMudGFpbCgpKVxuXHRcdFx0Y29uc3QgYXJncyA9IFsgbmV3IExvY2FsRGVjbGFyZUZvY3VzKGgubG9jKSBdXG5cdFx0XHRyZXR1cm4gaC5raW5kID09PSBLV19DYXNlVmFsID9cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGFyZ3MsIG9wUmVzdEFyZzogbnVsbCwgbWVtYmVyQXJnczogWyBdLCBvcEluOiBudWxsLCBvcE91dDogbnVsbCxcblx0XHRcdFx0XHRibG9jazogbmV3IEJsb2NrV2l0aFJldHVybih0b2tlbnMubG9jLCBudWxsLCBbIF0sIGVDYXNlKVxuXHRcdFx0XHR9IDpcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGFyZ3MsIG9wUmVzdEFyZzogbnVsbCwgbWVtYmVyQXJnczogWyBdLCBvcEluOiBudWxsLCBvcE91dDogbnVsbCxcblx0XHRcdFx0XHRibG9jazogbmV3IEJsb2NrRG8odG9rZW5zLmxvYywgbnVsbCwgWyBlQ2FzZSBdKVxuXHRcdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IFsgYmVmb3JlLCBibG9ja0xpbmVzIF0gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdFx0XHRjb25zdCB7IGFyZ3MsIG9wUmVzdEFyZywgbWVtYmVyQXJncyB9ID0gX3BhcnNlRnVuTG9jYWxzKGJlZm9yZSwgaW5jbHVkZU1lbWJlckFyZ3MpXG5cdFx0XHRmb3IgKGNvbnN0IGFyZyBvZiBhcmdzKVxuXHRcdFx0XHRpZiAoIWFyZy5pc0xhenkoKSlcblx0XHRcdFx0XHRhcmcua2luZCA9IExEX011dGFibGVcblx0XHRcdGNvbnN0IFsgb3BJbiwgcmVzdDAgXSA9IF90cnlUYWtlSW5Pck91dChLV19JbiwgYmxvY2tMaW5lcylcblx0XHRcdGNvbnN0IFsgb3BPdXQsIHJlc3QxIF0gPSBfdHJ5VGFrZUluT3JPdXQoS1dfT3V0LCByZXN0MClcblx0XHRcdGNvbnN0IGJsb2NrID0gKGlzRG8gPyBwYXJzZUJsb2NrRG8gOiBwYXJzZUJsb2NrVmFsKShyZXN0MSlcblx0XHRcdHJldHVybiB7IGFyZ3MsIG9wUmVzdEFyZywgbWVtYmVyQXJncywgYmxvY2ssIG9wSW4sIG9wT3V0IH1cblx0XHR9XG5cdH0sXG5cblx0X3BhcnNlRnVuTG9jYWxzID0gKHRva2VucywgaW5jbHVkZU1lbWJlckFyZ3MpID0+IHtcblx0XHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRcdHJldHVybiB7IGFyZ3M6IFtdLCBtZW1iZXJBcmdzOiBbIF0sIG9wUmVzdEFyZzogbnVsbCB9XG5cdFx0ZWxzZSB7XG5cdFx0XHRsZXQgcmVzdCwgb3BSZXN0QXJnXG5cdFx0XHRjb25zdCBsID0gdG9rZW5zLmxhc3QoKVxuXHRcdFx0aWYgKGwgaW5zdGFuY2VvZiBEb3ROYW1lICYmIGwubkRvdHMgPT09IDMpIHtcblx0XHRcdFx0cmVzdCA9IHRva2Vucy5ydGFpbCgpXG5cdFx0XHRcdG9wUmVzdEFyZyA9IExvY2FsRGVjbGFyZS5wbGFpbihsLmxvYywgbC5uYW1lKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzdCA9IHRva2Vuc1xuXHRcdFx0XHRvcFJlc3RBcmcgPSBudWxsXG5cdFx0XHR9XG5cblx0XHRcdGlmIChpbmNsdWRlTWVtYmVyQXJncykge1xuXHRcdFx0XHRjb25zdCB7IGRlY2xhcmVzOiBhcmdzLCBtZW1iZXJBcmdzIH0gPSBwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzKHJlc3QpXG5cdFx0XHRcdHJldHVybiB7IGFyZ3MsIG1lbWJlckFyZ3MsIG9wUmVzdEFyZyB9XG5cdFx0XHR9IGVsc2Vcblx0XHRcdFx0cmV0dXJuIHsgYXJnczogcGFyc2VMb2NhbERlY2xhcmVzKHJlc3QpLCBvcFJlc3RBcmcgfVxuXHRcdH1cblx0fSxcblxuXHRfdHJ5VGFrZUluT3JPdXQgPSAoaW5Pck91dCwgdG9rZW5zKSA9PiB7XG5cdFx0aWYgKCF0b2tlbnMuaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCBmaXJzdExpbmUgPSB0b2tlbnMuaGVhZFNsaWNlKClcblx0XHRcdGlmIChpc0tleXdvcmQoaW5Pck91dCwgZmlyc3RMaW5lLmhlYWQoKSkpIHtcblx0XHRcdFx0Y29uc3QgaW5PdXQgPSBuZXcgRGVidWcoXG5cdFx0XHRcdFx0Zmlyc3RMaW5lLmxvYyxcblx0XHRcdFx0XHRwYXJzZUxpbmVzRnJvbUJsb2NrKGZpcnN0TGluZSkpXG5cdFx0XHRcdHJldHVybiBbIGluT3V0LCB0b2tlbnMudGFpbCgpIF1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIFsgbnVsbCwgdG9rZW5zIF1cblx0fVxuXG5jb25zdFxuXHRwYXJzZUxpbmUgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGhlYWQgPSB0b2tlbnMuaGVhZCgpXG5cdFx0Y29uc3QgcmVzdCA9IHRva2Vucy50YWlsKClcblxuXHRcdGNvbnN0IG5vUmVzdCA9ICgpID0+XG5cdFx0XHRjaGVja0VtcHR5KHJlc3QsICgpID0+IGBEaWQgbm90IGV4cGVjdCBhbnl0aGluZyBhZnRlciAke2hlYWR9YClcblxuXHRcdC8vIFdlIG9ubHkgZGVhbCB3aXRoIG11dGFibGUgZXhwcmVzc2lvbnMgaGVyZSwgb3RoZXJ3aXNlIHdlIGZhbGwgYmFjayB0byBwYXJzZUV4cHIuXG5cdFx0aWYgKGhlYWQgaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdFx0c3dpdGNoIChoZWFkLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBLV19Bc3NlcnQ6IGNhc2UgS1dfQXNzZXJ0Tm90OlxuXHRcdFx0XHRcdHJldHVybiBwYXJzZUFzc2VydChoZWFkLmtpbmQgPT09IEtXX0Fzc2VydE5vdCwgcmVzdClcblx0XHRcdFx0Y2FzZSBLV19FeGNlcHREbzpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VFeGNlcHQoS1dfRXhjZXB0RG8sIHJlc3QpXG5cdFx0XHRcdGNhc2UgS1dfQnJlYWs6XG5cdFx0XHRcdFx0bm9SZXN0KClcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEJyZWFrKHRva2Vucy5sb2MpXG5cdFx0XHRcdGNhc2UgS1dfQnJlYWtXaXRoVmFsOlxuXHRcdFx0XHRcdHJldHVybiBuZXcgQnJlYWtXaXRoVmFsKHRva2Vucy5sb2MsIHBhcnNlRXhwcihyZXN0KSlcblx0XHRcdFx0Y2FzZSBLV19DYXNlRG86XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlQ2FzZShmYWxzZSwgZmFsc2UsIHJlc3QpXG5cdFx0XHRcdGNhc2UgS1dfRGVidWc6XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBEZWJ1Zyh0b2tlbnMubG9jLFxuXHRcdFx0XHRcdFx0aXNHcm91cChHX0Jsb2NrLCB0b2tlbnMuc2Vjb25kKCkpID9cblx0XHRcdFx0XHRcdC8vIGBkZWJ1Z2AsIHRoZW4gaW5kZW50ZWQgYmxvY2tcblx0XHRcdFx0XHRcdHBhcnNlTGluZXNGcm9tQmxvY2soKSA6XG5cdFx0XHRcdFx0XHQvLyBgZGVidWdgLCB0aGVuIHNpbmdsZSBsaW5lXG5cdFx0XHRcdFx0XHRwYXJzZUxpbmVPckxpbmVzKHJlc3QpKVxuXHRcdFx0XHRjYXNlIEtXX0RlYnVnZ2VyOlxuXHRcdFx0XHRcdG5vUmVzdCgpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBTcGVjaWFsRG8odG9rZW5zLmxvYywgU0RfRGVidWdnZXIpXG5cdFx0XHRcdGNhc2UgS1dfRWxsaXBzaXM6XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBCYWdFbnRyeU1hbnkodG9rZW5zLmxvYywgcGFyc2VFeHByKHJlc3QpKVxuXHRcdFx0XHRjYXNlIEtXX0ZvckRvOlxuXHRcdFx0XHRcdHJldHVybiBwYXJzZUZvckRvKHJlc3QpXG5cdFx0XHRcdGNhc2UgS1dfSWdub3JlOlxuXHRcdFx0XHRcdHJldHVybiBwYXJzZUlnbm9yZShyZXN0KVxuXHRcdFx0XHRjYXNlIEtXX0lmRG86IGNhc2UgS1dfVW5sZXNzRG86IHtcblx0XHRcdFx0XHRjb25zdCBbIGJlZm9yZSwgYmxvY2sgXSA9IGJlZm9yZUFuZEJsb2NrKHJlc3QpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbERvKHRva2Vucy5sb2MsXG5cdFx0XHRcdFx0XHRwYXJzZUV4cHIoYmVmb3JlKSxcblx0XHRcdFx0XHRcdHBhcnNlQmxvY2tEbyhibG9jayksXG5cdFx0XHRcdFx0XHRoZWFkLmtpbmQgPT09IEtXX1VubGVzc0RvKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgS1dfT2JqQXNzaWduOlxuXHRcdFx0XHRcdHJldHVybiBuZXcgQmFnRW50cnkodG9rZW5zLmxvYywgcGFyc2VFeHByKHJlc3QpKVxuXHRcdFx0XHRjYXNlIEtXX1Bhc3M6XG5cdFx0XHRcdFx0bm9SZXN0KClcblx0XHRcdFx0XHRyZXR1cm4gWyBdXG5cdFx0XHRcdGNhc2UgS1dfUmVnaW9uOlxuXHRcdFx0XHRcdHJldHVybiBwYXJzZUxpbmVzRnJvbUJsb2NrKHRva2Vucylcblx0XHRcdFx0Y2FzZSBLV19TdXBlckRvOlxuXHRcdFx0XHRcdHJldHVybiBuZXcgU3VwZXJDYWxsRG8odG9rZW5zLmxvYywgcGFyc2VFeHByUGFydHMocmVzdCkpXG5cdFx0XHRcdGNhc2UgS1dfU3dpdGNoRG86XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlU3dpdGNoKGZhbHNlLCByZXN0KVxuXHRcdFx0XHRjYXNlIEtXX1Rocm93OlxuXHRcdFx0XHRcdHJldHVybiBuZXcgVGhyb3codG9rZW5zLmxvYywgb3BJZighcmVzdC5pc0VtcHR5KCksICgpID0+IHBhcnNlRXhwcihyZXN0KSkpXG5cdFx0XHRcdGNhc2UgS1dfTmFtZTpcblx0XHRcdFx0XHRpZiAoaXNLZXl3b3JkKEtXX09iakFzc2lnbiwgcmVzdC5oZWFkKCkpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCByID0gcmVzdC50YWlsKClcblx0XHRcdFx0XHRcdGNvbnN0IHZhbCA9IHIuaXNFbXB0eSgpID8gbmV3IFNwZWNpYWxWYWwodG9rZW5zLmxvYywgU1ZfTmFtZSkgOiBwYXJzZUV4cHIocilcblx0XHRcdFx0XHRcdHJldHVybiBPYmpFbnRyeUNvbXB1dGVkLm5hbWUodG9rZW5zLmxvYywgdmFsKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBlbHNlIGZhbGx0aHJvdWdoXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Ly8gZmFsbCB0aHJvdWdoXG5cdFx0XHR9XG5cblx0XHRyZXR1cm4gaWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZVdoZXJlKF9pc0xpbmVTcGxpdEtleXdvcmQpLFxuXHRcdFx0KHsgYmVmb3JlLCBhdCwgYWZ0ZXIgfSkgPT4gX3BhcnNlQXNzaWduTGlrZShiZWZvcmUsIGF0LCBhZnRlciwgdG9rZW5zLmxvYyksXG5cdFx0XHQoKSA9PiBwYXJzZUV4cHIodG9rZW5zKSlcblx0fSxcblxuXHRwYXJzZUxpbmVPckxpbmVzID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBfID0gcGFyc2VMaW5lKHRva2Vucylcblx0XHRyZXR1cm4gXyBpbnN0YW5jZW9mIEFycmF5ID8gXyA6IFsgXyBdXG5cdH1cblxuLy8gcGFyc2VMaW5lIHByaXZhdGVzXG5jb25zdFxuXHRfaXNMaW5lU3BsaXRLZXl3b3JkID0gdG9rZW4gPT4ge1xuXHRcdGlmICh0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBLV19Bc3NpZ246IGNhc2UgS1dfQXNzaWduTXV0YWJsZTogY2FzZSBLV19Mb2NhbE11dGF0ZTpcblx0XHRcdFx0Y2FzZSBLV19NYXBFbnRyeTogY2FzZSBLV19PYmpBc3NpZ246IGNhc2UgS1dfWWllbGQ6IGNhc2UgS1dfWWllbGRUbzpcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0fVxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBmYWxzZVxuXHR9LFxuXG5cdF9wYXJzZUFzc2lnbkxpa2UgPSAoYmVmb3JlLCBhdCwgYWZ0ZXIsIGxvYykgPT4ge1xuXHRcdGlmIChhdC5raW5kID09PSBLV19NYXBFbnRyeSlcblx0XHRcdHJldHVybiBuZXcgTWFwRW50cnkobG9jLCBwYXJzZUV4cHIoYmVmb3JlKSwgcGFyc2VFeHByKGFmdGVyKSlcblxuXHRcdC8vIFRPRE86IFRoaXMgY29kZSBpcyBraW5kIG9mIHVnbHkuXG5cdFx0Ly8gSXQgcGFyc2VzIGB4LnkgPSB6YCBhbmQgdGhlIGxpa2UuXG5cdFx0aWYgKGJlZm9yZS5zaXplKCkgPT09IDEpIHtcblx0XHRcdGNvbnN0IHRva2VuID0gYmVmb3JlLmhlYWQoKVxuXHRcdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgRG90TmFtZSlcblx0XHRcdFx0cmV0dXJuIF9wYXJzZU1lbWJlclNldChcdExvY2FsQWNjZXNzLnRoaXModG9rZW4ubG9jKSwgdG9rZW4ubmFtZSwgYXQsIGFmdGVyLCBsb2MpXG5cdFx0XHRpZiAoaXNHcm91cChHX1NwYWNlLCB0b2tlbikpIHtcblx0XHRcdFx0Y29uc3Qgc3BhY2VkID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0XHRcdGNvbnN0IGRvdCA9IHNwYWNlZC5sYXN0KClcblx0XHRcdFx0aWYgKGRvdCBpbnN0YW5jZW9mIERvdE5hbWUpIHtcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKGRvdC5uRG90cyA9PT0gMSwgZG90LmxvYywgJ011c3QgaGF2ZSBvbmx5IDEgYC5gLicpXG5cdFx0XHRcdFx0cmV0dXJuIF9wYXJzZU1lbWJlclNldChwYXJzZVNwYWNlZChzcGFjZWQucnRhaWwoKSksIGRvdC5uYW1lLCBhdCwgYWZ0ZXIsIGxvYylcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBhdC5raW5kID09PSBLV19Mb2NhbE11dGF0ZSA/XG5cdFx0XHRfcGFyc2VMb2NhbE11dGF0ZShiZWZvcmUsIGFmdGVyLCBsb2MpIDpcblx0XHRcdF9wYXJzZUFzc2lnbihiZWZvcmUsIGF0LCBhZnRlciwgbG9jKVxuXHR9LFxuXG5cdF9wYXJzZU1lbWJlclNldCA9IChvYmplY3QsIG5hbWUsIGF0LCBhZnRlciwgbG9jKSA9PlxuXHRcdG5ldyBNZW1iZXJTZXQobG9jLCBvYmplY3QsIG5hbWUsIF9tZW1iZXJTZXRLaW5kKGF0KSwgcGFyc2VFeHByKGFmdGVyKSksXG5cdF9tZW1iZXJTZXRLaW5kID0gYXQgPT4ge1xuXHRcdHN3aXRjaCAoYXQua2luZCkge1xuXHRcdFx0Y2FzZSBLV19Bc3NpZ246IHJldHVybiBNU19OZXdcblx0XHRcdGNhc2UgS1dfQXNzaWduTXV0YWJsZTogcmV0dXJuIE1TX05ld011dGFibGVcblx0XHRcdGNhc2UgS1dfTG9jYWxNdXRhdGU6IHJldHVybiBNU19NdXRhdGVcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcigpXG5cdFx0fVxuXHR9LFxuXG5cdF9wYXJzZUxvY2FsTXV0YXRlID0gKGxvY2Fsc1Rva2VucywgdmFsdWVUb2tlbnMsIGxvYykgPT4ge1xuXHRcdGNvbnN0IGxvY2FscyA9IHBhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcyhsb2NhbHNUb2tlbnMpXG5cdFx0Y29udGV4dC5jaGVjayhsb2NhbHMubGVuZ3RoID09PSAxLCBsb2MsICdUT0RPOiBMb2NhbERlc3RydWN0dXJlTXV0YXRlJylcblx0XHRjb25zdCBuYW1lID0gbG9jYWxzWzBdLm5hbWVcblx0XHRjb25zdCB2YWx1ZSA9IHBhcnNlRXhwcih2YWx1ZVRva2Vucylcblx0XHRyZXR1cm4gbmV3IExvY2FsTXV0YXRlKGxvYywgbmFtZSwgdmFsdWUpXG5cdH0sXG5cblx0X3BhcnNlQXNzaWduID0gKGxvY2Fsc1Rva2VucywgYXNzaWduZXIsIHZhbHVlVG9rZW5zLCBsb2MpID0+IHtcblx0XHRjb25zdCBraW5kID0gYXNzaWduZXIua2luZFxuXHRcdGNvbnN0IGxvY2FscyA9IHBhcnNlTG9jYWxEZWNsYXJlcyhsb2NhbHNUb2tlbnMpXG5cdFx0Y29uc3Qgb3BOYW1lID0gb3BJZihsb2NhbHMubGVuZ3RoID09PSAxLCAoKSA9PiBsb2NhbHNbMF0ubmFtZSlcblx0XHRjb25zdCB2YWx1ZSA9IF9wYXJzZUFzc2lnblZhbHVlKGtpbmQsIG9wTmFtZSwgdmFsdWVUb2tlbnMpXG5cblx0XHRjb25zdCBpc1lpZWxkID0ga2luZCA9PT0gS1dfWWllbGQgfHwga2luZCA9PT0gS1dfWWllbGRUb1xuXHRcdGlmIChpc0VtcHR5KGxvY2FscykpIHtcblx0XHRcdGNvbnRleHQuY2hlY2soaXNZaWVsZCwgbG9jYWxzVG9rZW5zLmxvYywgJ0Fzc2lnbm1lbnQgdG8gbm90aGluZycpXG5cdFx0XHRyZXR1cm4gdmFsdWVcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKGlzWWllbGQpXG5cdFx0XHRcdGZvciAoY29uc3QgXyBvZiBsb2NhbHMpXG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayghXy5pc0xhenkoKSwgXy5sb2MsICdDYW4gbm90IHlpZWxkIHRvIGxhenkgdmFyaWFibGUuJylcblxuXHRcdFx0Y29uc3QgaXNPYmpBc3NpZ24gPSBraW5kID09PSBLV19PYmpBc3NpZ25cblxuXHRcdFx0aWYgKGtpbmQgPT09IEtXX0Fzc2lnbk11dGFibGUpXG5cdFx0XHRcdGZvciAobGV0IF8gb2YgbG9jYWxzKSB7XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayghXy5pc0xhenkoKSwgXy5sb2MsICdMYXp5IGxvY2FsIGNhbiBub3QgYmUgbXV0YWJsZS4nKVxuXHRcdFx0XHRcdF8ua2luZCA9IExEX011dGFibGVcblx0XHRcdFx0fVxuXG5cdFx0XHRjb25zdCB3cmFwID0gXyA9PiBpc09iakFzc2lnbiA/IG5ldyBPYmpFbnRyeUFzc2lnbihsb2MsIF8pIDogX1xuXG5cdFx0XHRpZiAobG9jYWxzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRjb25zdCBhc3NpZ25lZSA9IGxvY2Fsc1swXVxuXHRcdFx0XHRjb25zdCBhc3NpZ24gPSBuZXcgQXNzaWduU2luZ2xlKGxvYywgYXNzaWduZWUsIHZhbHVlKVxuXHRcdFx0XHRjb25zdCBpc1Rlc3QgPSBpc09iakFzc2lnbiAmJiBhc3NpZ25lZS5uYW1lLmVuZHNXaXRoKCd0ZXN0Jylcblx0XHRcdFx0cmV0dXJuIGlzVGVzdCA/IG5ldyBEZWJ1Zyhsb2MsIFsgd3JhcChhc3NpZ24pIF0pIDogd3JhcChhc3NpZ24pXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBraW5kID0gbG9jYWxzWzBdLmtpbmRcblx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIGxvY2Fscylcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKF8ua2luZCA9PT0ga2luZCwgXy5sb2MsXG5cdFx0XHRcdFx0XHQnQWxsIGxvY2FscyBvZiBkZXN0cnVjdHVyaW5nIGFzc2lnbm1lbnQgbXVzdCBiZSBvZiB0aGUgc2FtZSBraW5kLicpXG5cdFx0XHRcdHJldHVybiB3cmFwKG5ldyBBc3NpZ25EZXN0cnVjdHVyZShsb2MsIGxvY2FscywgdmFsdWUsIGtpbmQpKVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRfcGFyc2VBc3NpZ25WYWx1ZSA9IChraW5kLCBvcE5hbWUsIHZhbHVlVG9rZW5zKSA9PiB7XG5cdFx0Y29uc3QgdmFsdWUgPSB2YWx1ZVRva2Vucy5pc0VtcHR5KCkgJiYga2luZCA9PT0gS1dfT2JqQXNzaWduID9cblx0XHRcdG5ldyBTcGVjaWFsVmFsKHZhbHVlVG9rZW5zLmxvYywgU1ZfTnVsbCkgOlxuXHRcdFx0cGFyc2VFeHByKHZhbHVlVG9rZW5zKVxuXHRcdHN3aXRjaCAoa2luZCkge1xuXHRcdFx0Y2FzZSBLV19ZaWVsZDpcblx0XHRcdFx0cmV0dXJuIG5ldyBZaWVsZCh2YWx1ZS5sb2MsIHZhbHVlKVxuXHRcdFx0Y2FzZSBLV19ZaWVsZFRvOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFlpZWxkVG8odmFsdWUubG9jLCB2YWx1ZSlcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiB2YWx1ZVxuXHRcdH1cblx0fVxuXG5jb25zdFxuXHRwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMgPSB0b2tlbnMgPT5cblx0XHR0b2tlbnMubWFwKF8gPT4gTG9jYWxEZWNsYXJlLnBsYWluKF8ubG9jLCBfcGFyc2VMb2NhbE5hbWUoXykpKSxcblxuXHRwYXJzZUxvY2FsRGVjbGFyZXMgPSAodG9rZW5zLCBpbmNsdWRlTWVtYmVyQXJncykgPT5cblx0XHRpbmNsdWRlTWVtYmVyQXJncyA/IHBhcnNlTG9jYWxEZWNsYXJlc0FuZE1lbWJlckFyZ3ModG9rZW5zKSA6IHRva2Vucy5tYXAocGFyc2VMb2NhbERlY2xhcmUpLFxuXG5cdC8vIF9vck1lbWJlcjogaWYgdHJ1ZSwgd2lsbCBsb29rIGZvciBgLnhgIGFyZ3VtZW50cyBhbmQgcmV0dXJuIHsgZGVjbGFyZSwgaXNNZW1iZXIgfS5cblx0cGFyc2VMb2NhbERlY2xhcmUgPSAodG9rZW4sIF9vck1lbWJlcikgPT4ge1xuXHRcdGxldCBpc01lbWJlciA9IGZhbHNlXG5cdFx0bGV0IGRlY2xhcmVcblxuXHRcdGNvbnN0IHBhcnNlTG9jYWxOYW1lID0gdG9rZW4gPT4ge1xuXHRcdFx0aWYgKF9vck1lbWJlcikge1xuXHRcdFx0XHRpc01lbWJlciA9IHRva2VuIGluc3RhbmNlb2YgRG90TmFtZSAmJiB0b2tlbi5uRG90cyA9PT0gMVxuXHRcdFx0XHRyZXR1cm4gaXNNZW1iZXIgPyB0b2tlbi5uYW1lIDogX3BhcnNlTG9jYWxOYW1lKHRva2VuKVxuXHRcdFx0fSBlbHNlXG5cdFx0XHRcdHJldHVybiBfcGFyc2VMb2NhbE5hbWUodG9rZW4pXG5cdFx0fVxuXG5cdFx0aWYgKGlzR3JvdXAoR19TcGFjZSwgdG9rZW4pKSB7XG5cdFx0XHRjb25zdCB0b2tlbnMgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRcdGNvbnN0IFsgcmVzdCwgaXNMYXp5IF0gPVxuXHRcdFx0XHRpc0tleXdvcmQoS1dfTGF6eSwgdG9rZW5zLmhlYWQoKSkgPyBbIHRva2Vucy50YWlsKCksIHRydWUgXSA6IFsgdG9rZW5zLCBmYWxzZSBdXG5cblx0XHRcdGNvbnN0IG5hbWUgPSBwYXJzZUxvY2FsTmFtZShyZXN0LmhlYWQoKSlcblx0XHRcdGNvbnN0IHJlc3QyID0gcmVzdC50YWlsKClcblx0XHRcdGNvbnN0IG9wVHlwZSA9IG9wSWYoIXJlc3QyLmlzRW1wdHkoKSwgKCkgPT4ge1xuXHRcdFx0XHRjb25zdCBjb2xvbiA9IHJlc3QyLmhlYWQoKVxuXHRcdFx0XHRjb250ZXh0LmNoZWNrKGlzS2V5d29yZChLV19UeXBlLCBjb2xvbiksIGNvbG9uLmxvYywgKCkgPT4gYEV4cGVjdGVkICR7Y29kZSgnOicpfWApXG5cdFx0XHRcdGNvbnN0IHRva2Vuc1R5cGUgPSByZXN0Mi50YWlsKClcblx0XHRcdFx0Y2hlY2tOb25FbXB0eSh0b2tlbnNUeXBlLCAoKSA9PiBgRXhwZWN0ZWQgc29tZXRoaW5nIGFmdGVyICR7Y29sb259YClcblx0XHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkKHRva2Vuc1R5cGUpXG5cdFx0XHR9KVxuXHRcdFx0ZGVjbGFyZSA9IG5ldyBMb2NhbERlY2xhcmUodG9rZW4ubG9jLCBuYW1lLCBvcFR5cGUsIGlzTGF6eSA/IExEX0xhenkgOiBMRF9Db25zdClcblx0XHR9IGVsc2Vcblx0XHRcdGRlY2xhcmUgPSBMb2NhbERlY2xhcmUucGxhaW4odG9rZW4ubG9jLCBwYXJzZUxvY2FsTmFtZSh0b2tlbikpXG5cblx0XHRpZiAoX29yTWVtYmVyKVxuXHRcdFx0cmV0dXJuIHsgZGVjbGFyZSwgaXNNZW1iZXIgfVxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBkZWNsYXJlXG5cdH0sXG5cblx0cGFyc2VMb2NhbERlY2xhcmVzQW5kTWVtYmVyQXJncyA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgZGVjbGFyZXMgPSBbIF0sIG1lbWJlckFyZ3MgPSBbIF1cblx0XHRmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuXHRcdFx0Y29uc3QgeyBkZWNsYXJlLCBpc01lbWJlciB9ID0gcGFyc2VMb2NhbERlY2xhcmUodG9rZW4sIHRydWUpXG5cdFx0XHRkZWNsYXJlcy5wdXNoKGRlY2xhcmUpXG5cdFx0XHRpZiAoaXNNZW1iZXIpXG5cdFx0XHRcdG1lbWJlckFyZ3MucHVzaChkZWNsYXJlKVxuXHRcdH1cblx0XHRyZXR1cm4geyBkZWNsYXJlcywgbWVtYmVyQXJncyB9XG5cdH1cblxuLy8gcGFyc2VMb2NhbERlY2xhcmUgcHJpdmF0ZXNcbmNvbnN0XG5cdF9wYXJzZUxvY2FsTmFtZSA9IHQgPT4ge1xuXHRcdGlmIChpc0tleXdvcmQoS1dfRm9jdXMsIHQpKVxuXHRcdFx0cmV0dXJuICdfJ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29udGV4dC5jaGVjayh0IGluc3RhbmNlb2YgTmFtZSwgdC5sb2MsICgpID0+IGBFeHBlY3RlZCBhIGxvY2FsIG5hbWUsIG5vdCAke3R9YClcblx0XHRcdHJldHVybiB0Lm5hbWVcblx0XHR9XG5cdH1cblxuY29uc3QgcGFyc2VTaW5nbGUgPSB0b2tlbiA9PiB7XG5cdGNvbnN0IHsgbG9jIH0gPSB0b2tlblxuXHRpZiAodG9rZW4gaW5zdGFuY2VvZiBOYW1lKVxuXHRcdHJldHVybiBuZXcgTG9jYWxBY2Nlc3MobG9jLCB0b2tlbi5uYW1lKVxuXHRlbHNlIGlmICh0b2tlbiBpbnN0YW5jZW9mIEdyb3VwKSB7XG5cdFx0Y29uc3Qgc2xpY2UgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdGNhc2UgR19TcGFjZTpcblx0XHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkKHNsaWNlKVxuXHRcdFx0Y2FzZSBHX1BhcmVudGhlc2lzOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VFeHByKHNsaWNlKVxuXHRcdFx0Y2FzZSBHX0JyYWNrZXQ6XG5cdFx0XHRcdHJldHVybiBuZXcgQmFnU2ltcGxlKGxvYywgcGFyc2VFeHByUGFydHMoc2xpY2UpKVxuXHRcdFx0Y2FzZSBHX0Jsb2NrOlxuXHRcdFx0XHRyZXR1cm4gYmxvY2tXcmFwKHNsaWNlKVxuXHRcdFx0Y2FzZSBHX1F1b3RlOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VRdW90ZShzbGljZSlcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcih0b2tlbi5raW5kKVxuXHRcdH1cblx0fSBlbHNlIGlmICh0b2tlbiBpbnN0YW5jZW9mIE51bWJlckxpdGVyYWwpXG5cdFx0cmV0dXJuIHRva2VuXG5cdGVsc2UgaWYgKHRva2VuIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdGNhc2UgS1dfRm9jdXM6XG5cdFx0XHRcdHJldHVybiBMb2NhbEFjY2Vzcy5mb2N1cyhsb2MpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gaWZFbHNlKG9wS2V5d29yZEtpbmRUb1NwZWNpYWxWYWx1ZUtpbmQodG9rZW4ua2luZCksXG5cdFx0XHRcdFx0XyA9PiBuZXcgU3BlY2lhbFZhbChsb2MsIF8pLFxuXHRcdFx0XHRcdCgpID0+IHVuZXhwZWN0ZWQodG9rZW4pKVxuXG5cdFx0fVxuXHRlbHNlIGlmICh0b2tlbiBpbnN0YW5jZW9mIERvdE5hbWUpXG5cdFx0c3dpdGNoICh0b2tlbi5uRG90cykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRyZXR1cm4gbmV3IE1lbWJlcih0b2tlbi5sb2MsIExvY2FsQWNjZXNzLnRoaXModG9rZW4ubG9jKSwgdG9rZW4ubmFtZSlcblx0XHRcdGNhc2UgMzpcblx0XHRcdFx0cmV0dXJuIG5ldyBTcGxhdChsb2MsIG5ldyBMb2NhbEFjY2Vzcyhsb2MsIHRva2VuLm5hbWUpKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dW5leHBlY3RlZCh0b2tlbilcblx0XHR9XG5cdGVsc2Vcblx0XHR1bmV4cGVjdGVkKHRva2VuKVxufVxuXG5jb25zdCBwYXJzZVNwYWNlZCA9IHRva2VucyA9PiB7XG5cdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpLCByZXN0ID0gdG9rZW5zLnRhaWwoKVxuXHRpZiAoaXNLZXl3b3JkKEtXX1R5cGUsIGgpKVxuXHRcdHJldHVybiBDYWxsLmNvbnRhaW5zKGgubG9jLCBwYXJzZVNwYWNlZChyZXN0KSwgTG9jYWxBY2Nlc3MuZm9jdXMoaC5sb2MpKVxuXHRlbHNlIGlmIChpc0tleXdvcmQoS1dfTGF6eSwgaCkpXG5cdFx0cmV0dXJuIG5ldyBMYXp5KGgubG9jLCBwYXJzZVNwYWNlZChyZXN0KSlcblx0ZWxzZSBpZiAoaXNLZXl3b3JkKEtXX1N1cGVyVmFsLCBoKSkge1xuXHRcdC8vIFRPRE86IGhhbmRsZSBzdWIgaGVyZSBhcyB3ZWxsXG5cdFx0Y29uc3QgaDIgPSByZXN0LmhlYWQoKVxuXHRcdGlmIChoMiBpbnN0YW5jZW9mIERvdE5hbWUpIHtcblx0XHRcdGNvbnRleHQuY2hlY2soaDIubkRvdHMgPT09IDEsIHRva2VuLmxvYywgJ1RvbyBtYW55IGRvdHMhJylcblx0XHRcdGNvbnN0IHggPSBuZXcgU3VwZXJNZW1iZXIoaDIubG9jLCB0b2tlbi5uYW1lKVxuXHRcdFx0cmV0dXJuIF9wYXJzZVNwYWNlZEZvbGQoeCwgcmVzdC50YWlsKCkpXG5cdFx0fSBlbHNlIGlmIChpc0dyb3VwKEdfUGFyZW50aGVzaXMsIGgyKSAmJiBTbGljZS5ncm91cChoMikuaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCB4ID0gbmV3IFN1cGVyQ2FsbChoMi5sb2MsIFtdKVxuXHRcdFx0cmV0dXJuIF9wYXJzZVNwYWNlZEZvbGQoeCwgcmVzdC50YWlsKCkpXG5cdFx0fSBlbHNlXG5cdFx0XHRjb250ZXh0LmZhaWwoYEV4cGVjdGVkICR7Y29kZSgnLicpfSBvciAke2NvZGUoJygpJyl9IGFmdGVyICR7Y29kZSgnc3VwZXInKX1gKVxuXHR9IGVsc2Vcblx0XHRyZXR1cm4gX3BhcnNlU3BhY2VkRm9sZChwYXJzZVNpbmdsZShoKSwgcmVzdClcbn1cbmNvbnN0IF9wYXJzZVNwYWNlZEZvbGQgPSAoc3RhcnQsIHJlc3QpID0+IHtcblx0bGV0IGFjYyA9IHN0YXJ0XG5cdGZvciAobGV0IGkgPSByZXN0LnN0YXJ0OyBpIDwgcmVzdC5lbmQ7IGkgPSBpICsgMSkge1xuXHRcdGNvbnN0IHRva2VuID0gcmVzdC50b2tlbnNbaV1cblx0XHRjb25zdCBsb2MgPSB0b2tlbi5sb2Ncblx0XHRpZiAodG9rZW4gaW5zdGFuY2VvZiBEb3ROYW1lKSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKHRva2VuLm5Eb3RzID09PSAxLCB0b2tlbi5sb2MsICdUb28gbWFueSBkb3RzIScpXG5cdFx0XHRhY2MgPSBuZXcgTWVtYmVyKHRva2VuLmxvYywgYWNjLCB0b2tlbi5uYW1lKVxuXHRcdFx0Y29udGludWVcblx0XHR9XG5cdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRcdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdFx0XHRjYXNlIEtXX0ZvY3VzOlxuXHRcdFx0XHRcdGFjYyA9IG5ldyBDYWxsKHRva2VuLmxvYywgYWNjLCBbIExvY2FsQWNjZXNzLmZvY3VzKGxvYykgXSlcblx0XHRcdFx0XHRjb250aW51ZVxuXHRcdFx0XHRjYXNlIEtXX1R5cGU6IHtcblx0XHRcdFx0XHRjb25zdCB0eXBlID0gcGFyc2VTcGFjZWQocmVzdC5fY2hvcFN0YXJ0KGkgKyAxKSlcblx0XHRcdFx0XHRyZXR1cm4gQ2FsbC5jb250YWlucyh0b2tlbi5sb2MsIHR5cGUsIGFjYylcblx0XHRcdFx0fVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0fVxuXHRcdGlmICh0b2tlbiBpbnN0YW5jZW9mIEdyb3VwKSB7XG5cdFx0XHRjb25zdCBzbGljZSA9IFNsaWNlLmdyb3VwKHRva2VuKVxuXHRcdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRcdGNhc2UgR19CcmFja2V0OlxuXHRcdFx0XHRcdGFjYyA9IENhbGwuc3ViKGxvYywgY2F0KGFjYywgcGFyc2VFeHByUGFydHMoc2xpY2UpKSlcblx0XHRcdFx0XHRjb250aW51ZVxuXHRcdFx0XHRjYXNlIEdfUGFyZW50aGVzaXM6XG5cdFx0XHRcdFx0Y2hlY2tFbXB0eShzbGljZSwgKCkgPT5cblx0XHRcdFx0XHRcdGBVc2UgJHtjb2RlKCcoYSBiKScpfSwgbm90ICR7Y29kZSgnYShiKScpfWApXG5cdFx0XHRcdFx0YWNjID0gbmV3IENhbGwobG9jLCBhY2MsIFtdKVxuXHRcdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRcdGNhc2UgR19RdW90ZTpcblx0XHRcdFx0XHRhY2MgPSBuZXcgUXVvdGVUZW1wbGF0ZShsb2MsIGFjYywgcGFyc2VRdW90ZShzbGljZSkpXG5cdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdH1cblx0XHR9XG5cdFx0Y29udGV4dC5mYWlsKHRva2Vucy5sb2MsIGBFeHBlY3RlZCBtZW1iZXIgb3Igc3ViLCBub3QgJHt0b2tlbn1gKVxuXHR9XG5cdHJldHVybiBhY2Ncbn1cblxuY29uc3QgdHJ5UGFyc2VVc2VzID0gKHVzZUtleXdvcmRLaW5kLCB0b2tlbnMpID0+IHtcblx0aWYgKCF0b2tlbnMuaXNFbXB0eSgpKSB7XG5cdFx0Y29uc3QgbGluZTAgPSB0b2tlbnMuaGVhZFNsaWNlKClcblx0XHRpZiAoaXNLZXl3b3JkKHVzZUtleXdvcmRLaW5kLCBsaW5lMC5oZWFkKCkpKSB7XG5cdFx0XHRjb25zdCB7IHVzZXMsIG9wVXNlR2xvYmFsIH0gPSBfcGFyc2VVc2VzKHVzZUtleXdvcmRLaW5kLCBsaW5lMC50YWlsKCkpXG5cdFx0XHRpZiAobmV3IFNldChbIEtXX1VzZURvLCBLV19Vc2VMYXp5LCBLV19Vc2VEZWJ1ZyBdKS5oYXModXNlS2V5d29yZEtpbmQpKVxuXHRcdFx0XHRjb250ZXh0LmNoZWNrKG9wVXNlR2xvYmFsID09PSBudWxsLCBsaW5lMC5sb2MsICdDYW5cXCd0IHVzZSBnbG9iYWwgaGVyZS4nKVxuXHRcdFx0cmV0dXJuIHsgdXNlcywgb3BVc2VHbG9iYWwsIHJlc3Q6IHRva2Vucy50YWlsKCkgfVxuXHRcdH1cblx0fVxuXHRyZXR1cm4geyB1c2VzOiBbIF0sIG9wVXNlR2xvYmFsOiBudWxsLCByZXN0OiB0b2tlbnMgfVxufVxuXG4vLyB0cnlQYXJzZVVzZSBwcml2YXRlc1xuY29uc3Rcblx0X3BhcnNlVXNlcyA9ICh1c2VLZXl3b3JkS2luZCwgdG9rZW5zKSA9PiB7XG5cdFx0Y29uc3QgbGluZXMgPSBqdXN0QmxvY2sodXNlS2V5d29yZEtpbmQsIHRva2Vucylcblx0XHRsZXQgb3BVc2VHbG9iYWwgPSBudWxsXG5cblx0XHRjb25zdCB1c2VzID0gWyBdXG5cblx0XHRmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMuc2xpY2VzKCkpIHtcblx0XHRcdGNvbnN0IHsgcGF0aCwgbmFtZSB9ID0gX3BhcnNlUmVxdWlyZShsaW5lLmhlYWQoKSlcblx0XHRcdGlmICh1c2VLZXl3b3JkS2luZCA9PT0gS1dfVXNlRG8pIHtcblx0XHRcdFx0aWYgKGxpbmUuc2l6ZSgpID4gMSlcblx0XHRcdFx0XHR1bmV4cGVjdGVkKGxpbmUuc2Vjb25kKCkpXG5cdFx0XHRcdHVzZXMucHVzaChuZXcgVXNlRG8obGluZS5sb2MsIHBhdGgpKVxuXHRcdFx0fSBlbHNlXG5cdFx0XHRcdGlmIChwYXRoID09PSAnZ2xvYmFsJykge1xuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2sob3BVc2VHbG9iYWwgPT09IG51bGwsIGxpbmUubG9jLCAnQ2FuXFwndCB1c2UgZ2xvYmFsIHR3aWNlJylcblx0XHRcdFx0XHRjb25zdCB7IHVzZWQsIG9wVXNlRGVmYXVsdCB9ID0gX3BhcnNlVGhpbmdzVXNlZChuYW1lLCBmYWxzZSwgbGluZS50YWlsKCkpXG5cdFx0XHRcdFx0b3BVc2VHbG9iYWwgPSBuZXcgVXNlR2xvYmFsKGxpbmUubG9jLCB1c2VkLCBvcFVzZURlZmF1bHQpXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3QgaXNMYXp5ID0gdXNlS2V5d29yZEtpbmQgPT09IEtXX1VzZUxhenkgfHwgdXNlS2V5d29yZEtpbmQgPT09IEtXX1VzZURlYnVnXG5cdFx0XHRcdFx0Y29uc3QgeyB1c2VkLCBvcFVzZURlZmF1bHQgfSA9IF9wYXJzZVRoaW5nc1VzZWQobmFtZSwgaXNMYXp5LCBsaW5lLnRhaWwoKSlcblx0XHRcdFx0XHR1c2VzLnB1c2gobmV3IFVzZShsaW5lLmxvYywgcGF0aCwgdXNlZCwgb3BVc2VEZWZhdWx0KSlcblx0XHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7IHVzZXMsIG9wVXNlR2xvYmFsIH1cblx0fSxcblx0X3BhcnNlVGhpbmdzVXNlZCA9IChuYW1lLCBpc0xhenksIHRva2VucykgPT4ge1xuXHRcdGNvbnN0IHVzZURlZmF1bHQgPSAoKSA9PiBMb2NhbERlY2xhcmUudW50eXBlZCh0b2tlbnMubG9jLCBuYW1lLCBpc0xhenkgPyBMRF9MYXp5IDogTERfQ29uc3QpXG5cdFx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0XHRyZXR1cm4geyB1c2VkOiBbIF0sIG9wVXNlRGVmYXVsdDogdXNlRGVmYXVsdCgpIH1cblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IFsgb3BVc2VEZWZhdWx0LCByZXN0IF0gPVxuXHRcdFx0XHRpc0tleXdvcmQoS1dfRm9jdXMsIHRva2Vucy5oZWFkKCkpID9cblx0XHRcdFx0XHRbIHVzZURlZmF1bHQoKSwgdG9rZW5zLnRhaWwoKSBdIDpcblx0XHRcdFx0XHRbIG51bGwsIHRva2VucyBdXG5cdFx0XHRjb25zdCB1c2VkID0gcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKHJlc3QpLm1hcChsID0+IHtcblx0XHRcdFx0Y29udGV4dC5jaGVjayhsLm5hbWUgIT09ICdfJywgbC5wb3MsXG5cdFx0XHRcdFx0KCkgPT4gYCR7Y29kZSgnXycpfSBub3QgYWxsb3dlZCBhcyBpbXBvcnQgbmFtZS5gKVxuXHRcdFx0XHRpZiAoaXNMYXp5KVxuXHRcdFx0XHRcdGwua2luZCA9IExEX0xhenlcblx0XHRcdFx0cmV0dXJuIGxcblx0XHRcdH0pXG5cdFx0XHRyZXR1cm4geyB1c2VkLCBvcFVzZURlZmF1bHQgfVxuXHRcdH1cblx0fSxcblx0X3BhcnNlUmVxdWlyZSA9IHQgPT4ge1xuXHRcdGlmICh0IGluc3RhbmNlb2YgTmFtZSlcblx0XHRcdHJldHVybiB7IHBhdGg6IHQubmFtZSwgbmFtZTogdC5uYW1lIH1cblx0XHRlbHNlIGlmICh0IGluc3RhbmNlb2YgRG90TmFtZSlcblx0XHRcdHJldHVybiB7IHBhdGg6IGNhdChfcGFydHNGcm9tRG90TmFtZSh0KSwgdC5uYW1lKS5qb2luKCcvJyksIG5hbWU6IHQubmFtZSB9XG5cdFx0ZWxzZSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKGlzR3JvdXAoR19TcGFjZSwgdCksIHQubG9jLCAnTm90IGEgdmFsaWQgbW9kdWxlIG5hbWUuJylcblx0XHRcdHJldHVybiBfcGFyc2VTcGFjZWRSZXF1aXJlKFNsaWNlLmdyb3VwKHQpKVxuXHRcdH1cblx0fSxcblx0X3BhcnNlU3BhY2VkUmVxdWlyZSA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgZmlyc3QgPSB0b2tlbnMuaGVhZCgpXG5cdFx0bGV0IHBhcnRzXG5cdFx0aWYgKGZpcnN0IGluc3RhbmNlb2YgRG90TmFtZSlcblx0XHRcdHBhcnRzID0gX3BhcnRzRnJvbURvdE5hbWUoZmlyc3QpXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKGZpcnN0IGluc3RhbmNlb2YgTmFtZSwgZmlyc3QubG9jLCAnTm90IGEgdmFsaWQgcGFydCBvZiBtb2R1bGUgcGF0aC4nKVxuXHRcdFx0cGFydHMgPSBbIF1cblx0XHR9XG5cdFx0cGFydHMucHVzaChmaXJzdC5uYW1lKVxuXHRcdGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zLnRhaWwoKSkge1xuXHRcdFx0Y29udGV4dC5jaGVjayh0b2tlbiBpbnN0YW5jZW9mIERvdE5hbWUgJiYgdG9rZW4ubkRvdHMgPT09IDEsIHRva2VuLmxvYyxcblx0XHRcdFx0J05vdCBhIHZhbGlkIHBhcnQgb2YgbW9kdWxlIHBhdGguJylcblx0XHRcdHBhcnRzLnB1c2godG9rZW4ubmFtZSlcblx0XHR9XG5cdFx0cmV0dXJuIHsgcGF0aDogcGFydHMuam9pbignLycpLCBuYW1lOiB0b2tlbnMubGFzdCgpLm5hbWUgfVxuXHR9LFxuXHRfcGFydHNGcm9tRG90TmFtZSA9IGRvdE5hbWUgPT5cblx0XHRkb3ROYW1lLm5Eb3RzID09PSAxID8gWyAnLicgXSA6IHJlcGVhdCgnLi4nLCBkb3ROYW1lLm5Eb3RzIC0gMSlcblxuY29uc3Rcblx0X3BhcnNlRm9yID0gY3RyID0+IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgWyBiZWZvcmUsIGJsb2NrIF0gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdFx0cmV0dXJuIG5ldyBjdHIodG9rZW5zLmxvYywgX3BhcnNlT3BJdGVyYXRlZShiZWZvcmUpLCBwYXJzZUJsb2NrRG8oYmxvY2spKVxuXHR9LFxuXHRfcGFyc2VPcEl0ZXJhdGVlID0gdG9rZW5zID0+XG5cdFx0b3BJZighdG9rZW5zLmlzRW1wdHkoKSwgKCkgPT4ge1xuXHRcdFx0Y29uc3QgWyBlbGVtZW50LCBiYWcgXSA9XG5cdFx0XHRcdGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2VXaGVyZShfID0+IGlzS2V5d29yZChLV19JbiwgXykpLFxuXHRcdFx0XHRcdCh7IGJlZm9yZSwgYWZ0ZXIgfSkgPT4ge1xuXHRcdFx0XHRcdFx0Y29udGV4dC5jaGVjayhiZWZvcmUuc2l6ZSgpID09PSAxLCBiZWZvcmUubG9jLCAnVE9ETzogcGF0dGVybiBpbiBmb3InKVxuXHRcdFx0XHRcdFx0cmV0dXJuIFsgcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKGJlZm9yZSlbMF0sIHBhcnNlRXhwcihhZnRlcikgXVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0KCkgPT4gWyBuZXcgTG9jYWxEZWNsYXJlRm9jdXModG9rZW5zLmxvYyksIHBhcnNlRXhwcih0b2tlbnMpIF0pXG5cdFx0XHRyZXR1cm4gbmV3IEl0ZXJhdGVlKHRva2Vucy5sb2MsIGVsZW1lbnQsIGJhZylcblx0XHR9KVxuY29uc3Rcblx0cGFyc2VGb3JEbyA9IF9wYXJzZUZvcihGb3JEbyksXG5cdHBhcnNlRm9yVmFsID0gX3BhcnNlRm9yKEZvclZhbCksXG5cdC8vIFRPRE86IC0+IG91dC10eXBlXG5cdHBhcnNlRm9yQmFnID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBbIGJlZm9yZSwgbGluZXMgXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0XHRjb25zdCBibG9jayA9IHBhcnNlQmxvY2tEbyhsaW5lcylcblx0XHQvLyBUT0RPOiBCZXR0ZXIgd2F5P1xuXHRcdGlmIChibG9jay5saW5lcy5sZW5ndGggPT09IDEgJiYgYmxvY2subGluZXNbMF0gaW5zdGFuY2VvZiBWYWwpXG5cdFx0XHRibG9jay5saW5lc1swXSA9IG5ldyBCYWdFbnRyeShibG9jay5saW5lc1swXS5sb2MsIGJsb2NrLmxpbmVzWzBdKVxuXHRcdHJldHVybiBGb3JCYWcub2YodG9rZW5zLmxvYywgX3BhcnNlT3BJdGVyYXRlZShiZWZvcmUpLCBibG9jaylcblx0fVxuXG5cbmNvbnN0XG5cdHBhcnNlRXhjZXB0ID0gKGt3RXhjZXB0LCB0b2tlbnMpID0+IHtcblx0XHRjb25zdFxuXHRcdFx0aXNWYWwgPSBrd0V4Y2VwdCA9PT0gS1dfRXhjZXB0VmFsLFxuXHRcdFx0anVzdERvVmFsQmxvY2sgPSBpc1ZhbCA/IGp1c3RCbG9ja1ZhbCA6IGp1c3RCbG9ja0RvLFxuXHRcdFx0cGFyc2VCbG9jayA9IGlzVmFsID8gcGFyc2VCbG9ja1ZhbCA6IHBhcnNlQmxvY2tEbyxcblx0XHRcdEV4Y2VwdCA9IGlzVmFsID8gRXhjZXB0VmFsIDogRXhjZXB0RG8sXG5cdFx0XHRrd1RyeSA9IGlzVmFsID8gS1dfVHJ5VmFsIDogS1dfVHJ5RG8sXG5cdFx0XHRrd0NhdGNoID0gaXNWYWwgPyBLV19DYXRjaFZhbCA6IEtXX0NhdGNoRG8sXG5cdFx0XHRuYW1lVHJ5ID0gKCkgPT4gY29kZShrZXl3b3JkTmFtZShrd1RyeSkpLFxuXHRcdFx0bmFtZUNhdGNoID0gKCkgPT4gY29kZShrZXl3b3JkTmFtZShrd0NhdGNoKSksXG5cdFx0XHRuYW1lRmluYWxseSA9ICgpID0+IGNvZGUoa2V5d29yZE5hbWUoS1dfRmluYWxseSkpXG5cblx0XHRjb25zdCBsaW5lcyA9IGp1c3RCbG9jayhrd0V4Y2VwdCwgdG9rZW5zKVxuXG5cdFx0Ly8gYHRyeWAgKm11c3QqIGNvbWUgZmlyc3QuXG5cdFx0Y29uc3QgZmlyc3RMaW5lID0gbGluZXMuaGVhZFNsaWNlKClcblx0XHRjb25zdCB0b2tlblRyeSA9IGZpcnN0TGluZS5oZWFkKClcblx0XHRjb250ZXh0LmNoZWNrKGlzS2V5d29yZChrd1RyeSwgdG9rZW5UcnkpLCB0b2tlblRyeS5sb2MsICgpID0+XG5cdFx0XHRgTXVzdCBzdGFydCB3aXRoICR7bmFtZVRyeSgpfWApXG5cdFx0Y29uc3QgX3RyeSA9IGp1c3REb1ZhbEJsb2NrKGt3VHJ5LCBmaXJzdExpbmUudGFpbCgpKVxuXG5cdFx0Y29uc3QgcmVzdExpbmVzID0gbGluZXMudGFpbCgpXG5cdFx0Y2hlY2tOb25FbXB0eShyZXN0TGluZXMsICgpID0+XG5cdFx0XHRgTXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBvZiAke25hbWVDYXRjaCgpfSBvciAke25hbWVGaW5hbGx5KCl9YClcblxuXHRcdGNvbnN0IGhhbmRsZUZpbmFsbHkgPSByZXN0TGluZXMgPT4ge1xuXHRcdFx0Y29uc3QgbGluZSA9IHJlc3RMaW5lcy5oZWFkU2xpY2UoKVxuXHRcdFx0Y29uc3QgdG9rZW5GaW5hbGx5ID0gbGluZS5oZWFkKClcblx0XHRcdGNvbnRleHQuY2hlY2soaXNLZXl3b3JkKEtXX0ZpbmFsbHksIHRva2VuRmluYWxseSksIHRva2VuRmluYWxseS5sb2MsICgpID0+XG5cdFx0XHRcdGBFeHBlY3RlZCAke25hbWVGaW5hbGx5KCl9YClcblx0XHRcdGNvbnRleHQuY2hlY2socmVzdExpbmVzLnNpemUoKSA9PT0gMSwgcmVzdExpbmVzLmxvYywgKCkgPT5cblx0XHRcdFx0YE5vdGhpbmcgaXMgYWxsb3dlZCB0byBjb21lIGFmdGVyICR7bmFtZUZpbmFsbHkoKX0uYClcblx0XHRcdHJldHVybiBqdXN0QmxvY2tEbyhLV19GaW5hbGx5LCBsaW5lLnRhaWwoKSlcblx0XHR9XG5cblx0XHRsZXQgX2NhdGNoLCBfZmluYWxseVxuXG5cdFx0Y29uc3QgbGluZTIgPSByZXN0TGluZXMuaGVhZFNsaWNlKClcblx0XHRjb25zdCBoZWFkMiA9IGxpbmUyLmhlYWQoKVxuXHRcdGlmIChpc0tleXdvcmQoa3dDYXRjaCwgaGVhZDIpKSB7XG5cdFx0XHRjb25zdCBbIGJlZm9yZTIsIGJsb2NrMiBdID0gYmVmb3JlQW5kQmxvY2sobGluZTIudGFpbCgpKVxuXHRcdFx0Y29uc3QgY2F1Z2h0ID0gX3BhcnNlT25lTG9jYWxEZWNsYXJlT3JGb2N1cyhiZWZvcmUyKVxuXHRcdFx0X2NhdGNoID0gbmV3IENhdGNoKGxpbmUyLmxvYywgY2F1Z2h0LCBwYXJzZUJsb2NrKGJsb2NrMikpXG5cdFx0XHRfZmluYWxseSA9IG9wSWYocmVzdExpbmVzLnNpemUoKSA+IDEsICgpID0+IGhhbmRsZUZpbmFsbHkocmVzdExpbmVzLnRhaWwoKSkpXG5cdFx0fSBlbHNlIHtcblx0XHRcdF9jYXRjaCA9IG51bGxcblx0XHRcdF9maW5hbGx5ID0gaGFuZGxlRmluYWxseShyZXN0TGluZXMpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBFeGNlcHQodG9rZW5zLmxvYywgX3RyeSwgX2NhdGNoLCBfZmluYWxseSlcblx0fSxcblx0X3BhcnNlT25lTG9jYWxEZWNsYXJlT3JGb2N1cyA9IHRva2VucyA9PiB7XG5cdFx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsRGVjbGFyZUZvY3VzKHRva2Vucy5sb2MpXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKHRva2Vucy5zaXplKCkgPT09IDEsICdFeHBlY3RlZCBvbmx5IG9uZSBsb2NhbCBkZWNsYXJlLicpXG5cdFx0XHRyZXR1cm4gcGFyc2VMb2NhbERlY2xhcmVzKHRva2VucylbMF1cblx0XHR9XG5cdH1cblxuY29uc3QgcGFyc2VBc3NlcnQgPSAobmVnYXRlLCB0b2tlbnMpID0+IHtcblx0Y2hlY2tOb25FbXB0eSh0b2tlbnMsICgpID0+IGBFeHBlY3RlZCBzb21ldGhpbmcgYWZ0ZXIgJHtrZXl3b3JkTmFtZShLV19Bc3NlcnQpfS5gKVxuXG5cdGNvbnN0IFsgY29uZFRva2Vucywgb3BUaHJvd24gXSA9XG5cdFx0aWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZVdoZXJlKF8gPT4gaXNLZXl3b3JkKEtXX1Rocm93LCBfKSksXG5cdFx0XHQoeyBiZWZvcmUsIGFmdGVyIH0pID0+IFsgYmVmb3JlLCBwYXJzZUV4cHIoYWZ0ZXIpIF0sXG5cdFx0XHQoKSA9PiBbIHRva2VucywgbnVsbCBdKVxuXG5cdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHMoY29uZFRva2Vucylcblx0Y29uc3QgY29uZCA9IHBhcnRzLmxlbmd0aCA9PT0gMSA/IHBhcnRzWzBdIDogbmV3IENhbGwoY29uZFRva2Vucy5sb2MsIHBhcnRzWzBdLCB0YWlsKHBhcnRzKSlcblx0cmV0dXJuIG5ldyBBc3NlcnQodG9rZW5zLmxvYywgbmVnYXRlLCBjb25kLCBvcFRocm93bilcbn1cblxuY29uc3QgcGFyc2VDbGFzcyA9IHRva2VucyA9PiB7XG5cdGNvbnN0IFsgYmVmb3JlLCBibG9jayBdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRjb25zdCBvcEV4dGVuZGVkID0gb3BJZighYmVmb3JlLmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByKGJlZm9yZSkpXG5cblx0bGV0IG9wRG8gPSBudWxsLCBzdGF0aWNzID0gWyBdLCBvcENvbnN0cnVjdG9yID0gbnVsbCwgbWV0aG9kcyA9IFsgXVxuXG5cdGxldCBbIG9wQ29tbWVudCwgcmVzdCBdID0gdHJ5VGFrZUNvbW1lbnQoYmxvY2spXG5cblx0Y29uc3QgbGluZTEgPSByZXN0LmhlYWRTbGljZSgpXG5cdGlmIChpc0tleXdvcmQoS1dfRG8sIGxpbmUxLmhlYWQoKSkpIHtcblx0XHRjb25zdCBkb25lID0ganVzdEJsb2NrRG8oS1dfRG8sIGxpbmUxLnRhaWwoKSlcblx0XHRvcERvID0gbmV3IENsYXNzRG8obGluZTEubG9jLCBuZXcgTG9jYWxEZWNsYXJlRm9jdXMobGluZTEubG9jKSwgZG9uZSlcblx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0fVxuXHRpZiAoIXJlc3QuaXNFbXB0eSgpKSB7XG5cdFx0Y29uc3QgbGluZTIgPSByZXN0LmhlYWRTbGljZSgpXG5cdFx0aWYgKGlzS2V5d29yZChLV19TdGF0aWMsIGxpbmUyLmhlYWQoKSkpIHtcblx0XHRcdHN0YXRpY3MgPSBfcGFyc2VTdGF0aWNzKGxpbmUyLnRhaWwoKSlcblx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdH1cblx0XHRpZiAoIXJlc3QuaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCBsaW5lMyA9IHJlc3QuaGVhZFNsaWNlKClcblx0XHRcdGlmIChpc0tleXdvcmQoS1dfQ29uc3RydWN0LCBsaW5lMy5oZWFkKCkpKSB7XG5cdFx0XHRcdG9wQ29uc3RydWN0b3IgPSBfcGFyc2VDb25zdHJ1Y3RvcihsaW5lMy50YWlsKCkpXG5cdFx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdFx0fVxuXHRcdFx0bWV0aG9kcyA9IF9wYXJzZU1ldGhvZHMocmVzdClcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gbmV3IENsYXNzKHRva2Vucy5sb2MsIG9wRXh0ZW5kZWQsIG9wQ29tbWVudCwgb3BEbywgc3RhdGljcywgb3BDb25zdHJ1Y3RvciwgbWV0aG9kcylcbn1cblxuY29uc3Rcblx0X3BhcnNlQ29uc3RydWN0b3IgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IHsgYXJncywgbWVtYmVyQXJncywgb3BSZXN0QXJnLCBibG9jaywgb3BJbiwgb3BPdXQgfSA9XG5cdFx0XHRfZnVuQXJnc0FuZEJsb2NrKHRydWUsIHRva2VucywgdHJ1ZSlcblx0XHRjb25zdCBpc0dlbmVyYXRvciA9IGZhbHNlLCBvcERlY2xhcmVSZXMgPSBudWxsXG5cdFx0Y29uc3QgZnVuID0gbmV3IEZ1bih0b2tlbnMubG9jLFxuXHRcdFx0bmV3IExvY2FsRGVjbGFyZVRoaXModG9rZW5zLmxvYyksXG5cdFx0XHRpc0dlbmVyYXRvcixcblx0XHRcdGFyZ3MsIG9wUmVzdEFyZyxcblx0XHRcdGJsb2NrLCBvcEluLCBvcERlY2xhcmVSZXMsIG9wT3V0KVxuXHRcdHJldHVybiBuZXcgQ29uc3RydWN0b3IodG9rZW5zLmxvYywgZnVuLCBtZW1iZXJBcmdzKVxuXHR9LFxuXHRfcGFyc2VTdGF0aWNzID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBibG9jayA9IGp1c3RCbG9jayhLV19TdGF0aWMsIHRva2Vucylcblx0XHRyZXR1cm4gX3BhcnNlTWV0aG9kcyhibG9jaylcblx0fSxcblx0X3BhcnNlTWV0aG9kcyA9IHRva2VucyA9PiB0b2tlbnMubWFwU2xpY2VzKF9wYXJzZU1ldGhvZCksXG5cdF9wYXJzZU1ldGhvZCA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgaGVhZCA9IHRva2Vucy5oZWFkKClcblxuXHRcdGlmIChpc0tleXdvcmQoS1dfR2V0LCBoZWFkKSkge1xuXHRcdFx0Y29uc3QgWyBiZWZvcmUsIGJsb2NrIF0gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMudGFpbCgpKVxuXHRcdFx0cmV0dXJuIG5ldyBNZXRob2RHZXR0ZXIodG9rZW5zLmxvYywgX3BhcnNlRXhwck9yU3RyTGl0KGJlZm9yZSksIHBhcnNlQmxvY2tWYWwoYmxvY2spKVxuXHRcdH0gZWxzZSBpZiAoaXNLZXl3b3JkKEtXX1NldCwgaGVhZCkpIHtcblx0XHRcdGNvbnN0IFsgYmVmb3JlLCBibG9jayBdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zLnRhaWwoKSlcblx0XHRcdHJldHVybiBuZXcgTWV0aG9kU2V0dGVyKHRva2Vucy5sb2MsIF9wYXJzZUV4cHJPclN0ckxpdChiZWZvcmUpLCBwYXJzZUJsb2NrRG8oYmxvY2spKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBiYWEgPSB0b2tlbnMub3BTcGxpdE9uY2VXaGVyZShfaXNGdW5LZXl3b3JkKVxuXHRcdFx0Y29udGV4dC5jaGVjayhiYWEgIT09IG51bGwsIHRva2Vucy5sb2MsICdFeHBlY3RlZCBhIGZ1bmN0aW9uIGtleXdvcmQgc29tZXdoZXJlLicpXG5cdFx0XHRjb25zdCB7IGJlZm9yZSwgYXQsIGFmdGVyIH0gPSBiYWFcblx0XHRcdGNvbnN0IGZ1biA9IHBhcnNlRnVuKF9tZXRob2RGdW5LaW5kKGF0KSwgYWZ0ZXIpXG5cdFx0XHRyZXR1cm4gbmV3IE1ldGhvZEltcGwodG9rZW5zLmxvYywgX3BhcnNlRXhwck9yU3RyTGl0KGJlZm9yZSksIGZ1bilcblx0XHR9XG5cdH0sXG5cdC8vIElmIHN5bWJvbCBpcyBqdXN0IGEgbGl0ZXJhbCBzdHJpbmcsIHN0b3JlIGl0IGFzIGEgc3RyaW5nLCB3aGljaCBpcyBoYW5kbGVkIHNwZWNpYWxseS5cblx0X3BhcnNlRXhwck9yU3RyTGl0ID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBleHByID0gcGFyc2VFeHByKHRva2Vucylcblx0XHRjb25zdCBpc1N0ckxpdCA9IGV4cHIgaW5zdGFuY2VvZiBRdW90ZSAmJlxuXHRcdFx0ZXhwci5wYXJ0cy5sZW5ndGggPT09IDEgJiZcblx0XHRcdHR5cGVvZiBleHByLnBhcnRzWzBdID09PSAnc3RyaW5nJ1xuXHRcdHJldHVybiBpc1N0ckxpdCA/IGV4cHIucGFydHNbMF0gOiBleHByXG5cdH0sXG5cdF9tZXRob2RGdW5LaW5kID0gZnVuS2luZFRva2VuID0+IHtcblx0XHRzd2l0Y2ggKGZ1bktpbmRUb2tlbi5raW5kKSB7XG5cdFx0XHRjYXNlIEtXX0Z1bjogcmV0dXJuIEtXX0Z1blRoaXNcblx0XHRcdGNhc2UgS1dfRnVuRG86IHJldHVybiBLV19GdW5UaGlzRG9cblx0XHRcdGNhc2UgS1dfRnVuR2VuOiByZXR1cm4gS1dfRnVuVGhpc0dlblxuXHRcdFx0Y2FzZSBLV19GdW5HZW5EbzogcmV0dXJuIEtXX0Z1blRoaXNHZW5Eb1xuXHRcdFx0Y2FzZSBLV19GdW5UaGlzOiBjYXNlIEtXX0Z1blRoaXNEbzogY2FzZSBLV19GdW5UaGlzR2VuOiBjYXNlIEtXX0Z1blRoaXNHZW5Ebzpcblx0XHRcdFx0Y29udGV4dC5mYWlsKGZ1bktpbmRUb2tlbi5sb2MsICdGdW5jdGlvbiBgLmAgaXMgaW1wbGljaXQgZm9yIG1ldGhvZHMuJylcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGNvbnRleHQuZmFpbChmdW5LaW5kVG9rZW4ubG9jLCBgRXhwZWN0ZWQgZnVuY3Rpb24ga2luZCwgZ290ICR7ZnVuS2luZFRva2VufWApXG5cdFx0fVxuXHR9LFxuXHRfaXNGdW5LZXl3b3JkID0gZnVuS2luZFRva2VuID0+IHtcblx0XHRpZiAoZnVuS2luZFRva2VuIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRcdHN3aXRjaCAoZnVuS2luZFRva2VuLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBLV19GdW46IGNhc2UgS1dfRnVuRG86IGNhc2UgS1dfRnVuR2VuOiBjYXNlIEtXX0Z1bkdlbkRvOlxuXHRcdFx0XHRjYXNlIEtXX0Z1blRoaXM6IGNhc2UgS1dfRnVuVGhpc0RvOiBjYXNlIEtXX0Z1blRoaXNHZW46XG5cdFx0XHRcdGNhc2UgS1dfRnVuVGhpc0dlbkRvOlxuXHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHR9XG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdH1cblxuY29uc3QgcGFyc2VRdW90ZSA9IHRva2VucyA9PlxuXHRuZXcgUXVvdGUodG9rZW5zLmxvYywgdG9rZW5zLm1hcChfID0+IHR5cGVvZiBfID09PSAnc3RyaW5nJyA/IF8gOiBwYXJzZVNpbmdsZShfKSkpXG5cbmNvbnN0IHBhcnNlV2l0aCA9IHRva2VucyA9PiB7XG5cdGNvbnN0IFsgYmVmb3JlLCBibG9jayBdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXG5cdGNvbnN0IFsgdmFsLCBkZWNsYXJlIF0gPSBpZkVsc2UoYmVmb3JlLm9wU3BsaXRPbmNlV2hlcmUoXyA9PiBpc0tleXdvcmQoS1dfQXMsIF8pKSxcblx0XHQoeyBiZWZvcmUsIGFmdGVyIH0pID0+IHtcblx0XHRcdGNvbnRleHQuY2hlY2soYWZ0ZXIuc2l6ZSgpID09PSAxLCAoKSA9PiBgRXhwZWN0ZWQgb25seSAxIHRva2VuIGFmdGVyICR7Y29kZSgnYXMnKX0uYClcblx0XHRcdHJldHVybiBbIHBhcnNlRXhwclBsYWluKGJlZm9yZSksIHBhcnNlTG9jYWxEZWNsYXJlKGFmdGVyLmhlYWQoKSkgXVxuXHRcdH0sXG5cdFx0KCkgPT4gWyBwYXJzZUV4cHJQbGFpbihiZWZvcmUpLCBuZXcgTG9jYWxEZWNsYXJlRm9jdXModG9rZW5zLmxvYykgXSlcblxuXHRyZXR1cm4gbmV3IFdpdGgodG9rZW5zLmxvYywgZGVjbGFyZSwgdmFsLCBwYXJzZUJsb2NrRG8oYmxvY2spKVxufVxuXG5jb25zdCBwYXJzZUlnbm9yZSA9IHRva2VucyA9PiB7XG5cdGNvbnN0IGlnbm9yZWQgPSB0b2tlbnMubWFwKF8gPT4ge1xuXHRcdGlmIChpc0tleXdvcmQoS1dfRm9jdXMsIF8pKVxuXHRcdFx0cmV0dXJuICdfJ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29udGV4dC5jaGVjayhfIGluc3RhbmNlb2YgTmFtZSwgXy5sb2MsICgpID0+IGBFeHBlY3RlZCBsb2NhbCBuYW1lLCBub3QgJHtffS5gKVxuXHRcdFx0cmV0dXJuIF8ubmFtZVxuXHRcdH1cblx0fSlcblx0cmV0dXJuIG5ldyBJZ25vcmUodG9rZW5zLmxvYywgaWdub3JlZClcbn1cblxuY29uc3QgcGFyc2VDb25kID0gdG9rZW5zID0+IHtcblx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyh0b2tlbnMpXG5cdGNvbnRleHQuY2hlY2socGFydHMubGVuZ3RoID09PSAzLCB0b2tlbnMubG9jLCAoKSA9PlxuXHRcdGAke2NvZGUoJ2NvbmQnKX0gdGFrZXMgZXhhY3RseSAzIGFyZ3VtZW50cy5gKVxuXHRyZXR1cm4gbmV3IENvbmQodG9rZW5zLmxvYywgcGFydHNbMF0sIHBhcnRzWzFdLCBwYXJ0c1syXSlcbn1cblxuY29uc3QgdHJ5VGFrZUNvbW1lbnQgPSBsaW5lcyA9PiB7XG5cdGxldCBjb21tZW50cyA9IFsgXVxuXHRsZXQgcmVzdCA9IGxpbmVzXG5cblx0d2hpbGUgKHRydWUpIHtcblx0XHRpZiAocmVzdC5pc0VtcHR5KCkpXG5cdFx0XHRicmVha1xuXG5cdFx0Y29uc3QgaHMgPSByZXN0LmhlYWRTbGljZSgpXG5cdFx0Y29uc3QgaCA9IGhzLmhlYWQoKVxuXHRcdGlmICghKGggaW5zdGFuY2VvZiBEb2NDb21tZW50KSlcblx0XHRcdGJyZWFrXG5cblx0XHRhc3NlcnQoaHMuc2l6ZSgpID09PSAxKVxuXHRcdGNvbW1lbnRzLnB1c2goaClcblx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0fVxuXG5cdHJldHVybiBbIGlzRW1wdHkoY29tbWVudHMpID8gbnVsbCA6IGNvbW1lbnRzLm1hcChfID0+IF8udGV4dCkuam9pbignXFxuJyksIHJlc3QgXVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', 'esast/dist/Loc', '../../CompileError', '../MsAst', '../Token', '../util', './Slice'], function (exports, module, _esastDistLoc, _CompileError, _MsAst, _Token, _util, _Slice) {
	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

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
		for (const line of _Slice2.default.group(block).slices()) lines.push.apply(lines, _toConsumableArray(parseLineOrLines(line)));
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
	     

	// _orMember: if true, will look for `.x` arguments and return {declare, isMember}.
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
				context.check(h2.nDots === 1, h2.loc, 'Too many dots!');
				const x = new _MsAst.SuperMember(h2.loc, h2.name);
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
			context.fail(token.loc, `Expected member or sub, not ${ token }`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7OztBQytCQSxLQUFJLE9BQU8sQ0FBQTs7Ozs7Ozs7Ozs7OztrQkFZSSxDQUFDLFFBQVEsRUFBRSxTQUFTLEtBQUs7QUFDdkMsU0FBTyxHQUFHLFFBQVEsQ0FBQTtBQUNsQixRQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsZ0JBQU0sS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7O0FBRWpELFNBQU8sR0FBRyxTQUFTLENBQUE7QUFDbkIsU0FBTyxLQUFLLENBQUE7RUFDWjs7QUFFRCxPQUNDLFVBQVUsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLEtBQzVCLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDO09BQ3JELGFBQWEsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLEtBQy9CLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUM7T0FDdEQsVUFBVSxHQUFHLEtBQUssSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLEdBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFBOztBQUVyRSxPQUFNLFdBQVcsR0FBRyxNQUFNLElBQUk7Ozt3QkFFRixjQUFjLENBQUMsTUFBTSxDQUFDOzs7O1FBQTFDLFNBQVM7UUFBRSxLQUFLOzs7O3NCQUVhLFlBQVksUUF2Q25DLFFBQVEsRUF1Q3NDLEtBQUssQ0FBQzs7UUFBcEQsTUFBTSxpQkFBWixJQUFJO1FBQWdCLEtBQUssaUJBQVgsSUFBSTs7dUJBQzJCLFlBQVksUUF6Q2lCLE1BQU0sRUF5Q2QsS0FBSyxDQUFDOztRQUFsRSxTQUFTLGtCQUFmLElBQUk7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c0NvbnRlbnQiOltudWxsLCJpbXBvcnQgTG9jIGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge0Fzc2VydCwgQXNzaWduRGVzdHJ1Y3R1cmUsIEFzc2lnblNpbmdsZSwgQmFnRW50cnksIEJhZ0VudHJ5TWFueSwgQmFnU2ltcGxlLCBCbG9ja0JhZyxcblx0QmxvY2tEbywgQmxvY2tNYXAsIEJsb2NrT2JqLCBCbG9ja1ZhbFRocm93LCBCbG9ja1dpdGhSZXR1cm4sIEJsb2NrV3JhcCwgQnJlYWssIEJyZWFrV2l0aFZhbCxcblx0Q2FsbCwgQ2FzZURvLCBDYXNlRG9QYXJ0LCBDYXNlVmFsLCBDYXNlVmFsUGFydCwgQ2F0Y2gsIENsYXNzLCBDbGFzc0RvLCBDb25kLCBDb25kaXRpb25hbERvLFxuXHRDb25zdHJ1Y3RvciwgQ29uZGl0aW9uYWxWYWwsIERlYnVnLCBJZ25vcmUsIEl0ZXJhdGVlLCBOdW1iZXJMaXRlcmFsLCBFeGNlcHREbywgRXhjZXB0VmFsLFxuXHRGb3JCYWcsIEZvckRvLCBGb3JWYWwsIEZ1biwgTF9BbmQsIExfT3IsIExhenksIExEX0NvbnN0LCBMRF9MYXp5LCBMRF9NdXRhYmxlLCBMb2NhbEFjY2Vzcyxcblx0TG9jYWxEZWNsYXJlLCBMb2NhbERlY2xhcmVGb2N1cywgTG9jYWxEZWNsYXJlTmFtZSwgTG9jYWxEZWNsYXJlUmVzLCBMb2NhbERlY2xhcmVUaGlzLFxuXHRMb2NhbE11dGF0ZSwgTG9naWMsIE1hcEVudHJ5LCBNZW1iZXIsIE1lbWJlclNldCwgTWV0aG9kR2V0dGVyLCBNZXRob2RJbXBsLCBNZXRob2RTZXR0ZXIsXG5cdE1vZHVsZSwgTW9kdWxlRXhwb3J0RGVmYXVsdCwgTW9kdWxlRXhwb3J0TmFtZWQsIE1TX011dGF0ZSwgTVNfTmV3LCBNU19OZXdNdXRhYmxlLCBOZXcsIE5vdCxcblx0T2JqRW50cnksIE9iakVudHJ5QXNzaWduLCBPYmpFbnRyeUNvbXB1dGVkLCBPYmpQYWlyLCBPYmpTaW1wbGUsIFBhdHRlcm4sIFF1b3RlLCBRdW90ZVRlbXBsYXRlLFxuXHRTRF9EZWJ1Z2dlciwgU3BlY2lhbERvLCBTcGVjaWFsVmFsLCBTVl9OYW1lLCBTVl9OdWxsLCBTcGxhdCwgU3VwZXJDYWxsLCBTdXBlckNhbGxEbyxcblx0U3VwZXJNZW1iZXIsIFN3aXRjaERvLCBTd2l0Y2hEb1BhcnQsIFN3aXRjaFZhbCwgU3dpdGNoVmFsUGFydCwgVGhyb3csIFZhbCwgVXNlLCBVc2VEbyxcblx0VXNlR2xvYmFsLCBXaXRoLCBZaWVsZCwgWWllbGRUb30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0RvY0NvbW1lbnQsIERvdE5hbWUsIEdyb3VwLCBHX0Jsb2NrLCBHX0JyYWNrZXQsIEdfUGFyZW50aGVzaXMsIEdfU3BhY2UsIEdfUXVvdGUsIGlzR3JvdXAsXG5cdGlzS2V5d29yZCwgS2V5d29yZCwgS1dfQW5kLCBLV19BcywgS1dfQXNzZXJ0LCBLV19Bc3NlcnROb3QsIEtXX0Fzc2lnbiwgS1dfQXNzaWduTXV0YWJsZSxcblx0S1dfQnJlYWssIEtXX0JyZWFrV2l0aFZhbCwgS1dfQ2FzZVZhbCwgS1dfQ2FzZURvLCBLV19Db25kLCBLV19DYXRjaERvLCBLV19DYXRjaFZhbCwgS1dfQ2xhc3MsXG5cdEtXX0NvbnN0cnVjdCwgS1dfRGVidWcsIEtXX0RlYnVnZ2VyLCBLV19EbywgS1dfRWxsaXBzaXMsIEtXX0Vsc2UsIEtXX0V4Y2VwdERvLCBLV19FeGNlcHRWYWwsXG5cdEtXX0ZpbmFsbHksIEtXX0ZvckJhZywgS1dfRm9yRG8sIEtXX0ZvclZhbCwgS1dfRm9jdXMsIEtXX0Z1biwgS1dfRnVuRG8sIEtXX0Z1bkdlbiwgS1dfRnVuR2VuRG8sXG5cdEtXX0Z1blRoaXMsIEtXX0Z1blRoaXNEbywgS1dfRnVuVGhpc0dlbiwgS1dfRnVuVGhpc0dlbkRvLCBLV19HZXQsIEtXX0lmRG8sIEtXX0lmVmFsLCBLV19JZ25vcmUsXG5cdEtXX0luLCBLV19MYXp5LCBLV19Mb2NhbE11dGF0ZSwgS1dfTWFwRW50cnksIEtXX05hbWUsIEtXX05ldywgS1dfTm90LCBLV19PYmpBc3NpZ24sIEtXX09yLFxuXHRLV19QYXNzLCBLV19PdXQsIEtXX1JlZ2lvbiwgS1dfU2V0LCBLV19TdGF0aWMsIEtXX1N1cGVyRG8sIEtXX1N1cGVyVmFsLCBLV19Td2l0Y2hEbyxcblx0S1dfU3dpdGNoVmFsLCBLV19UaHJvdywgS1dfVHJ5RG8sIEtXX1RyeVZhbCwgS1dfVHlwZSwgS1dfVW5sZXNzRG8sIEtXX1VubGVzc1ZhbCwgS1dfVXNlLFxuXHRLV19Vc2VEZWJ1ZywgS1dfVXNlRG8sIEtXX1VzZUxhenksIEtXX1dpdGgsIEtXX1lpZWxkLCBLV19ZaWVsZFRvLCBOYW1lLCBrZXl3b3JkTmFtZSxcblx0b3BLZXl3b3JkS2luZFRvU3BlY2lhbFZhbHVlS2luZH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2Fzc2VydCwgY2F0LCBoZWFkLCBpZkVsc2UsIGlzRW1wdHksIGxhc3QsIG9wSWYsIG9wTWFwLCByZXBlYXQsIHJ0YWlsLCB0YWlsfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8vIFNpbmNlIHRoZXJlIGFyZSBzbyBtYW55IHBhcnNpbmcgZnVuY3Rpb25zLFxuLy8gaXQncyBmYXN0ZXIgKGFzIG9mIG5vZGUgdjAuMTEuMTQpIHRvIGhhdmUgdGhlbSBhbGwgY2xvc2Ugb3ZlciB0aGlzIG11dGFibGUgdmFyaWFibGUgb25jZVxuLy8gdGhhbiB0byBjbG9zZSBvdmVyIHRoZSBwYXJhbWV0ZXIgKGFzIGluIGxleC5qcywgd2hlcmUgdGhhdCdzIG11Y2ggZmFzdGVyKS5cbmxldCBjb250ZXh0XG5cbi8qXG5UaGlzIGNvbnZlcnRzIGEgVG9rZW4gdHJlZSB0byBhIE1zQXN0LlxuVGhpcyBpcyBhIHJlY3Vyc2l2ZS1kZXNjZW50IHBhcnNlciwgbWFkZSBlYXNpZXIgYnkgdHdvIGZhY3RzOlxuXHQqIFdlIGhhdmUgYWxyZWFkeSBncm91cGVkIHRva2Vucy5cblx0KiBNb3N0IG9mIHRoZSB0aW1lLCBhbiBhc3QncyB0eXBlIGlzIGRldGVybWluZWQgYnkgdGhlIGZpcnN0IHRva2VuLlxuXG5UaGVyZSBhcmUgZXhjZXB0aW9ucyBzdWNoIGFzIGFzc2lnbm1lbnQgc3RhdGVtZW50cyAoaW5kaWNhdGVkIGJ5IGEgYD1gIHNvbWV3aGVyZSBpbiB0aGUgbWlkZGxlKS5cbkZvciB0aG9zZSB3ZSBtdXN0IGl0ZXJhdGUgdGhyb3VnaCB0b2tlbnMgYW5kIHNwbGl0LlxuKFNlZSBTbGljZS5vcFNwbGl0T25jZVdoZXJlIGFuZCBTbGljZS5vcFNwbGl0TWFueVdoZXJlLilcbiovXG5leHBvcnQgZGVmYXVsdCAoX2NvbnRleHQsIHJvb3RUb2tlbikgPT4ge1xuXHRjb250ZXh0ID0gX2NvbnRleHRcblx0Y29uc3QgbXNBc3QgPSBwYXJzZU1vZHVsZShTbGljZS5ncm91cChyb290VG9rZW4pKVxuXHQvLyBSZWxlYXNlIGZvciBnYXJiYWdlIGNvbGxlY3Rpb25zLlxuXHRjb250ZXh0ID0gdW5kZWZpbmVkXG5cdHJldHVybiBtc0FzdFxufVxuXG5jb25zdFxuXHRjaGVja0VtcHR5ID0gKHRva2VucywgbWVzc2FnZSkgPT5cblx0XHRjb250ZXh0LmNoZWNrKHRva2Vucy5pc0VtcHR5KCksIHRva2Vucy5sb2MsIG1lc3NhZ2UpLFxuXHRjaGVja05vbkVtcHR5ID0gKHRva2VucywgbWVzc2FnZSkgPT5cblx0XHRjb250ZXh0LmNoZWNrKCF0b2tlbnMuaXNFbXB0eSgpLCB0b2tlbnMubG9jLCBtZXNzYWdlKSxcblx0dW5leHBlY3RlZCA9IHRva2VuID0+IGNvbnRleHQuZmFpbCh0b2tlbi5sb2MsIGBVbmV4cGVjdGVkICR7dG9rZW59YClcblxuY29uc3QgcGFyc2VNb2R1bGUgPSB0b2tlbnMgPT4ge1xuXHQvLyBNb2R1bGUgZG9jIGNvbW1lbnQgbXVzdCBjb21lIGZpcnN0LlxuXHRjb25zdCBbb3BDb21tZW50LCByZXN0MF0gPSB0cnlUYWtlQ29tbWVudCh0b2tlbnMpXG5cdC8vIFVzZSBzdGF0ZW1lbnRzIG11c3QgYXBwZWFyIGluIG9yZGVyLlxuXHRjb25zdCB7dXNlczogZG9Vc2VzLCByZXN0OiByZXN0MX0gPSB0cnlQYXJzZVVzZXMoS1dfVXNlRG8sIHJlc3QwKVxuXHRjb25zdCB7dXNlczogcGxhaW5Vc2VzLCBvcFVzZUdsb2JhbCwgcmVzdDogcmVzdDJ9ID0gdHJ5UGFyc2VVc2VzKEtXX1VzZSwgcmVzdDEpXG5cdGNvbnN0IHt1c2VzOiBsYXp5VXNlcywgcmVzdDogcmVzdDN9ID0gdHJ5UGFyc2VVc2VzKEtXX1VzZUxhenksIHJlc3QyKVxuXHRjb25zdCB7dXNlczogZGVidWdVc2VzLCByZXN0OiByZXN0NH0gPSB0cnlQYXJzZVVzZXMoS1dfVXNlRGVidWcsIHJlc3QzKVxuXG5cdGNvbnN0IGxpbmVzID0gcGFyc2VNb2R1bGVCbG9jayhyZXN0NClcblxuXHRpZiAoY29udGV4dC5vcHRzLmluY2x1ZGVNb2R1bGVOYW1lKCkpIHtcblx0XHRjb25zdCBuYW1lID0gbmV3IExvY2FsRGVjbGFyZU5hbWUodG9rZW5zLmxvYylcblx0XHRjb25zdCBhc3NpZ24gPSBuZXcgQXNzaWduU2luZ2xlKHRva2Vucy5sb2MsIG5hbWUsXG5cdFx0XHRRdW90ZS5mb3JTdHJpbmcodG9rZW5zLmxvYywgY29udGV4dC5vcHRzLm1vZHVsZU5hbWUoKSkpXG5cdFx0bGluZXMucHVzaChuZXcgTW9kdWxlRXhwb3J0TmFtZWQodG9rZW5zLmxvYywgYXNzaWduKSlcblx0fVxuXG5cdGNvbnN0IHVzZXMgPSBwbGFpblVzZXMuY29uY2F0KGxhenlVc2VzKVxuXHRyZXR1cm4gbmV3IE1vZHVsZSh0b2tlbnMubG9jLCBvcENvbW1lbnQsIGRvVXNlcywgdXNlcywgb3BVc2VHbG9iYWwsIGRlYnVnVXNlcywgbGluZXMpXG59XG5cbi8vIHBhcnNlQmxvY2tcbmNvbnN0XG5cdC8vIFRva2VucyBvbiB0aGUgbGluZSBiZWZvcmUgYSBibG9jaywgYW5kIHRva2VucyBmb3IgdGhlIGJsb2NrIGl0c2VsZi5cblx0YmVmb3JlQW5kQmxvY2sgPSB0b2tlbnMgPT4ge1xuXHRcdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAnRXhwZWN0ZWQgYW4gaW5kZW50ZWQgYmxvY2suJylcblx0XHRjb25zdCBibG9jayA9IHRva2Vucy5sYXN0KClcblx0XHRjb250ZXh0LmNoZWNrKGlzR3JvdXAoR19CbG9jaywgYmxvY2spLCBibG9jay5sb2MsICdFeHBlY3RlZCBhbiBpbmRlbnRlZCBibG9jay4nKVxuXHRcdHJldHVybiBbdG9rZW5zLnJ0YWlsKCksIFNsaWNlLmdyb3VwKGJsb2NrKV1cblx0fSxcblxuXHRibG9ja1dyYXAgPSB0b2tlbnMgPT4gbmV3IEJsb2NrV3JhcCh0b2tlbnMubG9jLCBwYXJzZUJsb2NrVmFsKHRva2VucykpLFxuXG5cdGp1c3RCbG9jayA9IChrZXl3b3JkLCB0b2tlbnMpID0+IHtcblx0XHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdFx0Y2hlY2tFbXB0eShiZWZvcmUsICgpID0+XG5cdFx0XHRgRGlkIG5vdCBleHBlY3QgYW55dGhpbmcgYmV0d2VlbiAke2NvZGUoa2V5d29yZE5hbWUoa2V5d29yZCkpfSBhbmQgYmxvY2suYClcblx0XHRyZXR1cm4gYmxvY2tcblx0fSxcblx0anVzdEJsb2NrRG8gPSAoa2V5d29yZCwgdG9rZW5zKSA9PlxuXHRcdHBhcnNlQmxvY2tEbyhqdXN0QmxvY2soa2V5d29yZCwgdG9rZW5zKSksXG5cdGp1c3RCbG9ja1ZhbCA9IChrZXl3b3JkLCB0b2tlbnMpID0+XG5cdFx0cGFyc2VCbG9ja1ZhbChqdXN0QmxvY2soa2V5d29yZCwgdG9rZW5zKSksXG5cblx0Ly8gR2V0cyBsaW5lcyBpbiBhIHJlZ2lvbiBvciBEZWJ1Zy5cblx0cGFyc2VMaW5lc0Zyb21CbG9jayA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKClcblx0XHRjb250ZXh0LmNoZWNrKHRva2Vucy5zaXplKCkgPiAxICYmIHRva2Vucy5zaXplKCkgPT09IDIgJiYgaXNHcm91cChHX0Jsb2NrLCB0b2tlbnMuc2Vjb25kKCkpLFxuXHRcdFx0aC5sb2MsICgpID0+XG5cdFx0XHRgRXhwZWN0ZWQgaW5kZW50ZWQgYmxvY2sgYWZ0ZXIgJHtofSwgYW5kIG5vdGhpbmcgZWxzZS5gKVxuXHRcdGNvbnN0IGJsb2NrID0gdG9rZW5zLnNlY29uZCgpXG5cblx0XHRjb25zdCBsaW5lcyA9IFtdXG5cdFx0Zm9yIChjb25zdCBsaW5lIG9mIFNsaWNlLmdyb3VwKGJsb2NrKS5zbGljZXMoKSlcblx0XHRcdGxpbmVzLnB1c2goLi4ucGFyc2VMaW5lT3JMaW5lcyhsaW5lKSlcblx0XHRyZXR1cm4gbGluZXNcblx0fSxcblxuXHRwYXJzZUJsb2NrRG8gPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IFtvcENvbW1lbnQsIHJlc3RdID0gdHJ5VGFrZUNvbW1lbnQodG9rZW5zKVxuXHRcdGNvbnN0IGxpbmVzID0gX3BsYWluQmxvY2tMaW5lcyhyZXN0KVxuXHRcdHJldHVybiBuZXcgQmxvY2tEbyh0b2tlbnMubG9jLCBvcENvbW1lbnQsIGxpbmVzKVxuXHR9LFxuXG5cdHBhcnNlQmxvY2tWYWwgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IFtvcENvbW1lbnQsIHJlc3RdID0gdHJ5VGFrZUNvbW1lbnQodG9rZW5zKVxuXHRcdGNvbnN0IHtsaW5lcywga1JldHVybn0gPSBfcGFyc2VCbG9ja0xpbmVzKHJlc3QpXG5cdFx0c3dpdGNoIChrUmV0dXJuKSB7XG5cdFx0XHRjYXNlIEtSZXR1cm5fQmFnOlxuXHRcdFx0XHRyZXR1cm4gQmxvY2tCYWcub2YodG9rZW5zLmxvYywgb3BDb21tZW50LCBsaW5lcylcblx0XHRcdGNhc2UgS1JldHVybl9NYXA6XG5cdFx0XHRcdHJldHVybiBCbG9ja01hcC5vZih0b2tlbnMubG9jLCBvcENvbW1lbnQsIGxpbmVzKVxuXHRcdFx0Y2FzZSBLUmV0dXJuX09iajpcblx0XHRcdFx0Y29uc3QgW2RvTGluZXMsIG9wVmFsXSA9IF90cnlUYWtlTGFzdFZhbChsaW5lcylcblx0XHRcdFx0Ly8gb3BOYW1lIHdyaXR0ZW4gdG8gYnkgX3RyeUFkZE5hbWUuXG5cdFx0XHRcdHJldHVybiBCbG9ja09iai5vZih0b2tlbnMubG9jLCBvcENvbW1lbnQsIGRvTGluZXMsIG9wVmFsLCBudWxsKVxuXHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHRjb250ZXh0LmNoZWNrKCFpc0VtcHR5KGxpbmVzKSwgdG9rZW5zLmxvYywgJ1ZhbHVlIGJsb2NrIG11c3QgZW5kIGluIGEgdmFsdWUuJylcblx0XHRcdFx0Y29uc3QgdmFsID0gbGFzdChsaW5lcylcblx0XHRcdFx0aWYgKHZhbCBpbnN0YW5jZW9mIFRocm93KVxuXHRcdFx0XHRcdHJldHVybiBuZXcgQmxvY2tWYWxUaHJvdyh0b2tlbnMubG9jLCBvcENvbW1lbnQsIHJ0YWlsKGxpbmVzKSwgdmFsKVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKHZhbCBpbnN0YW5jZW9mIFZhbCwgdmFsLmxvYywgJ1ZhbHVlIGJsb2NrIG11c3QgZW5kIGluIGEgdmFsdWUuJylcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEJsb2NrV2l0aFJldHVybih0b2tlbnMubG9jLCBvcENvbW1lbnQsIHJ0YWlsKGxpbmVzKSwgdmFsKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdHBhcnNlTW9kdWxlQmxvY2sgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IHtsaW5lcywga1JldHVybn0gPSBfcGFyc2VCbG9ja0xpbmVzKHRva2VucywgdHJ1ZSlcblx0XHRjb25zdCBvcENvbW1lbnQgPSBudWxsXG5cdFx0Y29uc3QgbG9jID0gdG9rZW5zLmxvY1xuXHRcdHN3aXRjaCAoa1JldHVybikge1xuXHRcdFx0Y2FzZSBLUmV0dXJuX0JhZzogY2FzZSBLUmV0dXJuX01hcDoge1xuXHRcdFx0XHRjb25zdCBjbHMgPSBrUmV0dXJuID09PSBLUmV0dXJuX0JhZyA/IEJsb2NrQmFnIDogQmxvY2tNYXBcblx0XHRcdFx0Y29uc3QgYmxvY2sgPSBjbHMub2YobG9jLCBvcENvbW1lbnQsIGxpbmVzKVxuXHRcdFx0XHRjb25zdCB2YWwgPSBuZXcgQmxvY2tXcmFwKGxvYywgYmxvY2spXG5cdFx0XHRcdGNvbnN0IGFzc2lnbmVlID0gTG9jYWxEZWNsYXJlLnBsYWluKGxvYywgY29udGV4dC5vcHRzLm1vZHVsZU5hbWUoKSlcblx0XHRcdFx0Y29uc3QgYXNzaWduID0gbmV3IEFzc2lnblNpbmdsZShsb2MsIGFzc2lnbmVlLCB2YWwpXG5cdFx0XHRcdHJldHVybiBbbmV3IE1vZHVsZUV4cG9ydERlZmF1bHQobG9jLCBhc3NpZ24pXVxuXHRcdFx0fVxuXHRcdFx0Y2FzZSBLUmV0dXJuX09iajoge1xuXHRcdFx0XHRjb25zdCBtb2R1bGVOYW1lID0gY29udGV4dC5vcHRzLm1vZHVsZU5hbWUoKVxuXG5cdFx0XHRcdC8vIE1vZHVsZSBleHBvcnRzIGxvb2sgbGlrZSBhIEJsb2NrT2JqLCAgYnV0IGFyZSByZWFsbHkgZGlmZmVyZW50LlxuXHRcdFx0XHQvLyBJbiBFUzYsIG1vZHVsZSBleHBvcnRzIG11c3QgYmUgY29tcGxldGVseSBzdGF0aWMuXG5cdFx0XHRcdC8vIFNvIHdlIGtlZXAgYW4gYXJyYXkgb2YgZXhwb3J0cyBhdHRhY2hlZCBkaXJlY3RseSB0byB0aGUgTW9kdWxlIGFzdC5cblx0XHRcdFx0Ly8gSWYgeW91IHdyaXRlOlxuXHRcdFx0XHQvL1x0aWYhIGNvbmRcblx0XHRcdFx0Ly9cdFx0YS4gYlxuXHRcdFx0XHQvLyBpbiBhIG1vZHVsZSBjb250ZXh0LCBpdCB3aWxsIGJlIGFuIGVycm9yLiAoVGhlIG1vZHVsZSBjcmVhdGVzIG5vIGBidWlsdGAgbG9jYWwuKVxuXHRcdFx0XHRjb25zdCBjb252ZXJ0VG9FeHBvcnRzID0gbGluZSA9PiB7XG5cdFx0XHRcdFx0aWYgKGxpbmUgaW5zdGFuY2VvZiBPYmpFbnRyeSkge1xuXHRcdFx0XHRcdFx0Y29udGV4dC5jaGVjayhsaW5lIGluc3RhbmNlb2YgT2JqRW50cnlBc3NpZ24sIGxpbmUubG9jLFxuXHRcdFx0XHRcdFx0XHQnTW9kdWxlIGV4cG9ydHMgY2FuIG5vdCBiZSBjb21wdXRlZC4nKVxuXHRcdFx0XHRcdFx0Y29udGV4dC5jaGVjayhsaW5lLmFzc2lnbiBpbnN0YW5jZW9mIEFzc2lnblNpbmdsZSwgbGluZS5sb2MsXG5cdFx0XHRcdFx0XHRcdCdFeHBvcnQgQXNzaWduRGVzdHJ1Y3R1cmUgbm90IHlldCBzdXBwb3J0ZWQuJylcblx0XHRcdFx0XHRcdHJldHVybiBsaW5lLmFzc2lnbi5hc3NpZ25lZS5uYW1lID09PSBtb2R1bGVOYW1lID9cblx0XHRcdFx0XHRcdFx0bmV3IE1vZHVsZUV4cG9ydERlZmF1bHQobGluZS5sb2MsIGxpbmUuYXNzaWduKSA6XG5cdFx0XHRcdFx0XHRcdG5ldyBNb2R1bGVFeHBvcnROYW1lZChsaW5lLmxvYywgbGluZS5hc3NpZ24pXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChsaW5lIGluc3RhbmNlb2YgRGVidWcpXG5cdFx0XHRcdFx0XHRsaW5lLmxpbmVzID0gbGluZS5saW5lcy5tYXAoY29udmVydFRvRXhwb3J0cylcblx0XHRcdFx0XHRyZXR1cm4gbGluZVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGxpbmVzLm1hcChjb252ZXJ0VG9FeHBvcnRzKVxuXHRcdFx0fVxuXHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHRjb25zdCBbbW9kdWxlTGluZXMsIG9wRGVmYXVsdEV4cG9ydF0gPSBfdHJ5VGFrZUxhc3RWYWwobGluZXMpXG5cdFx0XHRcdGlmIChvcERlZmF1bHRFeHBvcnQgIT09IG51bGwpIHtcblx0XHRcdFx0XHRjb25zdCBfID0gb3BEZWZhdWx0RXhwb3J0XG5cdFx0XHRcdFx0bW9kdWxlTGluZXMucHVzaChuZXcgTW9kdWxlRXhwb3J0RGVmYXVsdChfLmxvYyxcblx0XHRcdFx0XHRcdG5ldyBBc3NpZ25TaW5nbGUoXy5sb2MsXG5cdFx0XHRcdFx0XHRcdExvY2FsRGVjbGFyZS5wbGFpbihvcERlZmF1bHRFeHBvcnQubG9jLCBjb250ZXh0Lm9wdHMubW9kdWxlTmFtZSgpKSxcblx0XHRcdFx0XHRcdFx0XykpKVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBtb2R1bGVMaW5lc1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG4vLyBwYXJzZUJsb2NrIHByaXZhdGVzXG5jb25zdFxuXHRfdHJ5VGFrZUxhc3RWYWwgPSBsaW5lcyA9PlxuXHRcdCFpc0VtcHR5KGxpbmVzKSAmJiBsYXN0KGxpbmVzKSBpbnN0YW5jZW9mIFZhbCA/XG5cdFx0XHRbcnRhaWwobGluZXMpLCBsYXN0KGxpbmVzKV0gOlxuXHRcdFx0W2xpbmVzLCBudWxsXSxcblxuXHRfcGxhaW5CbG9ja0xpbmVzID0gbGluZVRva2VucyA9PiB7XG5cdFx0Y29uc3QgbGluZXMgPSBbXVxuXHRcdGNvbnN0IGFkZExpbmUgPSBsaW5lID0+IHtcblx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgQXJyYXkpXG5cdFx0XHRcdGZvciAoY29uc3QgXyBvZiBsaW5lKVxuXHRcdFx0XHRcdGFkZExpbmUoXylcblx0XHRcdGVsc2Vcblx0XHRcdFx0bGluZXMucHVzaChsaW5lKVxuXHRcdH1cblx0XHRmb3IgKGNvbnN0IF8gb2YgbGluZVRva2Vucy5zbGljZXMoKSlcblx0XHRcdGFkZExpbmUocGFyc2VMaW5lKF8pKVxuXHRcdHJldHVybiBsaW5lc1xuXHR9LFxuXG5cdEtSZXR1cm5fUGxhaW4gPSAwLFxuXHRLUmV0dXJuX09iaiA9IDEsXG5cdEtSZXR1cm5fQmFnID0gMixcblx0S1JldHVybl9NYXAgPSAzLFxuXHRfcGFyc2VCbG9ja0xpbmVzID0gbGluZVRva2VucyA9PiB7XG5cdFx0bGV0IGlzQmFnID0gZmFsc2UsIGlzTWFwID0gZmFsc2UsIGlzT2JqID0gZmFsc2Vcblx0XHRjb25zdCBjaGVja0xpbmUgPSBsaW5lID0+IHtcblx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgRGVidWcpXG5cdFx0XHRcdGZvciAoY29uc3QgXyBvZiBsaW5lLmxpbmVzKVxuXHRcdFx0XHRcdGNoZWNrTGluZShfKVxuXHRcdFx0ZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIEJhZ0VudHJ5KVxuXHRcdFx0XHRpc0JhZyA9IHRydWVcblx0XHRcdGVsc2UgaWYgKGxpbmUgaW5zdGFuY2VvZiBNYXBFbnRyeSlcblx0XHRcdFx0aXNNYXAgPSB0cnVlXG5cdFx0XHRlbHNlIGlmIChsaW5lIGluc3RhbmNlb2YgT2JqRW50cnkpXG5cdFx0XHRcdGlzT2JqID0gdHJ1ZVxuXHRcdH1cblx0XHRjb25zdCBsaW5lcyA9IF9wbGFpbkJsb2NrTGluZXMobGluZVRva2Vucylcblx0XHRmb3IgKGNvbnN0IF8gb2YgbGluZXMpXG5cdFx0XHRjaGVja0xpbmUoXylcblxuXHRcdGNvbnRleHQuY2hlY2soIShpc09iaiAmJiBpc0JhZyksIGxpbmVzLmxvYywgJ0Jsb2NrIGhhcyBib3RoIEJhZyBhbmQgT2JqIGxpbmVzLicpXG5cdFx0Y29udGV4dC5jaGVjayghKGlzT2JqICYmIGlzTWFwKSwgbGluZXMubG9jLCAnQmxvY2sgaGFzIGJvdGggT2JqIGFuZCBNYXAgbGluZXMuJylcblx0XHRjb250ZXh0LmNoZWNrKCEoaXNCYWcgJiYgaXNNYXApLCBsaW5lcy5sb2MsICdCbG9jayBoYXMgYm90aCBCYWcgYW5kIE1hcCBsaW5lcy4nKVxuXG5cdFx0Y29uc3Qga1JldHVybiA9XG5cdFx0XHRpc09iaiA/IEtSZXR1cm5fT2JqIDogaXNCYWcgPyBLUmV0dXJuX0JhZyA6IGlzTWFwID8gS1JldHVybl9NYXAgOiBLUmV0dXJuX1BsYWluXG5cdFx0cmV0dXJuIHtsaW5lcywga1JldHVybn1cblx0fVxuXG5jb25zdCBwYXJzZUNhc2UgPSAoaXNWYWwsIGNhc2VkRnJvbUZ1biwgdG9rZW5zKSA9PiB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2VucylcblxuXHRsZXQgb3BDYXNlZFxuXHRpZiAoY2FzZWRGcm9tRnVuKSB7XG5cdFx0Y2hlY2tFbXB0eShiZWZvcmUsICdDYW5cXCd0IG1ha2UgZm9jdXMgLS0gaXMgaW1wbGljaXRseSBwcm92aWRlZCBhcyBmaXJzdCBhcmd1bWVudC4nKVxuXHRcdG9wQ2FzZWQgPSBudWxsXG5cdH0gZWxzZVxuXHRcdG9wQ2FzZWQgPSBvcElmKCFiZWZvcmUuaXNFbXB0eSgpLCAoKSA9PiBBc3NpZ25TaW5nbGUuZm9jdXMoYmVmb3JlLmxvYywgcGFyc2VFeHByKGJlZm9yZSkpKVxuXG5cdGNvbnN0IGxhc3RMaW5lID0gU2xpY2UuZ3JvdXAoYmxvY2subGFzdCgpKVxuXHRjb25zdCBbcGFydExpbmVzLCBvcEVsc2VdID0gaXNLZXl3b3JkKEtXX0Vsc2UsIGxhc3RMaW5lLmhlYWQoKSkgP1xuXHRcdFtibG9jay5ydGFpbCgpLCAoaXNWYWwgPyBqdXN0QmxvY2tWYWwgOiBqdXN0QmxvY2tEbykoS1dfRWxzZSwgbGFzdExpbmUudGFpbCgpKV0gOlxuXHRcdFtibG9jaywgbnVsbF1cblxuXHRjb25zdCBwYXJ0cyA9IHBhcnRMaW5lcy5tYXBTbGljZXMoX3BhcnNlQ2FzZUxpbmUoaXNWYWwpKVxuXHRjb250ZXh0LmNoZWNrKHBhcnRzLmxlbmd0aCA+IDAsIHRva2Vucy5sb2MsICgpID0+XG5cdFx0YE11c3QgaGF2ZSBhdCBsZWFzdCAxIG5vbi0ke2NvZGUoJ2Vsc2UnKX0gdGVzdC5gKVxuXG5cdHJldHVybiBuZXcgKGlzVmFsID8gQ2FzZVZhbCA6IENhc2VEbykodG9rZW5zLmxvYywgb3BDYXNlZCwgcGFydHMsIG9wRWxzZSlcbn1cbi8vIHBhcnNlQ2FzZSBwcml2YXRlc1xuY29uc3Rcblx0X3BhcnNlQ2FzZUxpbmUgPSBpc1ZhbCA9PiBsaW5lID0+IHtcblx0XHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayhsaW5lKVxuXHRcdGNvbnN0IHRlc3QgPSBfcGFyc2VDYXNlVGVzdChiZWZvcmUpXG5cdFx0Y29uc3QgcmVzdWx0ID0gKGlzVmFsID8gcGFyc2VCbG9ja1ZhbCA6IHBhcnNlQmxvY2tEbykoYmxvY2spXG5cdFx0cmV0dXJuIG5ldyAoaXNWYWwgPyBDYXNlVmFsUGFydCA6IENhc2VEb1BhcnQpKGxpbmUubG9jLCB0ZXN0LCByZXN1bHQpXG5cdH0sXG5cdF9wYXJzZUNhc2VUZXN0ID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBmaXJzdCA9IHRva2Vucy5oZWFkKClcblx0XHQvLyBQYXR0ZXJuIG1hdGNoIHN0YXJ0cyB3aXRoIHR5cGUgdGVzdCBhbmQgaXMgZm9sbG93ZWQgYnkgbG9jYWwgZGVjbGFyZXMuXG5cdFx0Ly8gRS5nLiwgYDpTb21lIHZhbGBcblx0XHRpZiAoaXNHcm91cChHX1NwYWNlLCBmaXJzdCkgJiYgdG9rZW5zLnNpemUoKSA+IDEpIHtcblx0XHRcdGNvbnN0IGZ0ID0gU2xpY2UuZ3JvdXAoZmlyc3QpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtXX1R5cGUsIGZ0LmhlYWQoKSkpIHtcblx0XHRcdFx0Y29uc3QgdHlwZSA9IHBhcnNlU3BhY2VkKGZ0LnRhaWwoKSlcblx0XHRcdFx0Y29uc3QgbG9jYWxzID0gcGFyc2VMb2NhbERlY2xhcmVzKHRva2Vucy50YWlsKCkpXG5cdFx0XHRcdHJldHVybiBuZXcgUGF0dGVybihmaXJzdC5sb2MsIHR5cGUsIGxvY2FscywgTG9jYWxBY2Nlc3MuZm9jdXModG9rZW5zLmxvYykpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBwYXJzZUV4cHIodG9rZW5zKVxuXHR9XG5cbmNvbnN0IHBhcnNlU3dpdGNoID0gKGlzVmFsLCB0b2tlbnMpID0+IHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRjb25zdCBzd2l0Y2hlZCA9IHBhcnNlRXhwcihiZWZvcmUpXG5cdGNvbnN0IGxhc3RMaW5lID0gU2xpY2UuZ3JvdXAoYmxvY2subGFzdCgpKVxuXHRjb25zdCBbcGFydExpbmVzLCBvcEVsc2VdID0gaXNLZXl3b3JkKEtXX0Vsc2UsIGxhc3RMaW5lLmhlYWQoKSkgP1xuXHRcdFtibG9jay5ydGFpbCgpLCAoaXNWYWwgPyBqdXN0QmxvY2tWYWwgOiBqdXN0QmxvY2tEbykoS1dfRWxzZSwgbGFzdExpbmUudGFpbCgpKV0gOlxuXHRcdFtibG9jaywgbnVsbF1cblxuXHRjb25zdCBwYXJ0cyA9IHBhcnRMaW5lcy5tYXBTbGljZXMoX3BhcnNlU3dpdGNoTGluZShpc1ZhbCkpXG5cdGNvbnRleHQuY2hlY2socGFydHMubGVuZ3RoID4gMCwgdG9rZW5zLmxvYywgKCkgPT5cblx0XHRgTXVzdCBoYXZlIGF0IGxlYXN0IDEgbm9uLSR7Y29kZSgnZWxzZScpfSB0ZXN0LmApXG5cblx0cmV0dXJuIG5ldyAoaXNWYWwgPyBTd2l0Y2hWYWwgOiBTd2l0Y2hEbykodG9rZW5zLmxvYywgc3dpdGNoZWQsIHBhcnRzLCBvcEVsc2UpXG59XG5jb25zdFxuXHRfcGFyc2VTd2l0Y2hMaW5lID0gaXNWYWwgPT4gbGluZSA9PiB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sobGluZSlcblxuXHRcdGxldCB2YWx1ZXNcblx0XHRpZiAoaXNLZXl3b3JkKEtXX09yLCBiZWZvcmUuaGVhZCgpKSlcblx0XHRcdHZhbHVlcyA9IGJlZm9yZS50YWlsKCkubWFwKHBhcnNlU2luZ2xlKVxuXHRcdGVsc2Vcblx0XHRcdHZhbHVlcyA9IFtwYXJzZUV4cHIoYmVmb3JlKV1cblxuXHRcdGNvbnN0IHJlc3VsdCA9IChpc1ZhbCA/IHBhcnNlQmxvY2tWYWwgOiBwYXJzZUJsb2NrRG8pKGJsb2NrKVxuXHRcdHJldHVybiBuZXcgKGlzVmFsID8gU3dpdGNoVmFsUGFydCA6IFN3aXRjaERvUGFydCkobGluZS5sb2MsIHZhbHVlcywgcmVzdWx0KVxuXHR9XG5cbmNvbnN0XG5cdHBhcnNlRXhwciA9IHRva2VucyA9PiB7XG5cdFx0cmV0dXJuIGlmRWxzZSh0b2tlbnMub3BTcGxpdE1hbnlXaGVyZShfID0+IGlzS2V5d29yZChLV19PYmpBc3NpZ24sIF8pKSxcblx0XHRcdHNwbGl0cyA9PiB7XG5cdFx0XHRcdC8vIFNob3J0IG9iamVjdCBmb3JtLCBzdWNoIGFzIChhLiAxLCBiLiAyKVxuXHRcdFx0XHRjb25zdCBmaXJzdCA9IHNwbGl0c1swXS5iZWZvcmVcblx0XHRcdFx0Y2hlY2tOb25FbXB0eShmaXJzdCwgKCkgPT4gYFVuZXhwZWN0ZWQgJHtzcGxpdHNbMF0uYXR9YClcblx0XHRcdFx0Y29uc3QgdG9rZW5zQ2FsbGVyID0gZmlyc3QucnRhaWwoKVxuXG5cdFx0XHRcdGNvbnN0IHBhaXJzID0gW11cblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzcGxpdHMubGVuZ3RoIC0gMTsgaSA9IGkgKyAxKSB7XG5cdFx0XHRcdFx0Y29uc3QgbmFtZSA9IHNwbGl0c1tpXS5iZWZvcmUubGFzdCgpXG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayhuYW1lIGluc3RhbmNlb2YgTmFtZSwgbmFtZS5sb2MsICgpID0+XG5cdFx0XHRcdFx0XHRgRXhwZWN0ZWQgYSBuYW1lLCBub3QgJHtuYW1lfWApXG5cdFx0XHRcdFx0Y29uc3QgdG9rZW5zVmFsdWUgPSBpID09PSBzcGxpdHMubGVuZ3RoIC0gMiA/XG5cdFx0XHRcdFx0XHRzcGxpdHNbaSArIDFdLmJlZm9yZSA6XG5cdFx0XHRcdFx0XHRzcGxpdHNbaSArIDFdLmJlZm9yZS5ydGFpbCgpXG5cdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBwYXJzZUV4cHJQbGFpbih0b2tlbnNWYWx1ZSlcblx0XHRcdFx0XHRjb25zdCBsb2MgPSBuZXcgTG9jKG5hbWUubG9jLnN0YXJ0LCB0b2tlbnNWYWx1ZS5sb2MuZW5kKVxuXHRcdFx0XHRcdHBhaXJzLnB1c2gobmV3IE9ialBhaXIobG9jLCBuYW1lLm5hbWUsIHZhbHVlKSlcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCB2YWwgPSBuZXcgT2JqU2ltcGxlKHRva2Vucy5sb2MsIHBhaXJzKVxuXHRcdFx0XHRpZiAodG9rZW5zQ2FsbGVyLmlzRW1wdHkoKSlcblx0XHRcdFx0XHRyZXR1cm4gdmFsXG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHModG9rZW5zQ2FsbGVyKVxuXHRcdFx0XHRcdHJldHVybiBuZXcgQ2FsbCh0b2tlbnMubG9jLCBoZWFkKHBhcnRzKSwgY2F0KHRhaWwocGFydHMpLCB2YWwpKVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0KCkgPT4gcGFyc2VFeHByUGxhaW4odG9rZW5zKVxuXHRcdClcblx0fSxcblxuXHRwYXJzZUV4cHJQbGFpbiA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyh0b2tlbnMpXG5cdFx0c3dpdGNoIChwYXJ0cy5sZW5ndGgpIHtcblx0XHRcdGNhc2UgMDpcblx0XHRcdFx0Y29udGV4dC5mYWlsKHRva2Vucy5sb2MsICdFeHBlY3RlZCBhbiBleHByZXNzaW9uLCBnb3Qgbm90aGluZy4nKVxuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRyZXR1cm4gaGVhZChwYXJ0cylcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBuZXcgQ2FsbCh0b2tlbnMubG9jLCBoZWFkKHBhcnRzKSwgdGFpbChwYXJ0cykpXG5cdFx0fVxuXHR9LFxuXG5cdHBhcnNlRXhwclBhcnRzID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBvcFNwbGl0ID0gdG9rZW5zLm9wU3BsaXRPbmNlV2hlcmUodG9rZW4gPT4ge1xuXHRcdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRcdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRcdFx0Y2FzZSBLV19BbmQ6IGNhc2UgS1dfQ2FzZVZhbDogY2FzZSBLV19DbGFzczogY2FzZSBLV19Db25kOiBjYXNlIEtXX0V4Y2VwdFZhbDpcblx0XHRcdFx0XHRjYXNlIEtXX0ZvckJhZzogY2FzZSBLV19Gb3JWYWw6IGNhc2UgS1dfRnVuOiBjYXNlIEtXX0Z1bkRvOiBjYXNlIEtXX0Z1bkdlbjpcblx0XHRcdFx0XHRjYXNlIEtXX0Z1bkdlbkRvOiBjYXNlIEtXX0Z1blRoaXM6IGNhc2UgS1dfRnVuVGhpc0RvOiBjYXNlIEtXX0Z1blRoaXNHZW46XG5cdFx0XHRcdFx0Y2FzZSBLV19GdW5UaGlzR2VuRG86IGNhc2UgS1dfSWZWYWw6IGNhc2UgS1dfTmV3OiBjYXNlIEtXX05vdDogY2FzZSBLV19Pcjpcblx0XHRcdFx0XHRjYXNlIEtXX1N1cGVyVmFsOiBjYXNlIEtXX1N3aXRjaFZhbDogY2FzZSBLV19Vbmxlc3NWYWw6IGNhc2UgS1dfV2l0aDpcblx0XHRcdFx0XHRjYXNlIEtXX1lpZWxkOiBjYXNlIEtXX1lpZWxkVG86XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0fSlcblx0XHRyZXR1cm4gaWZFbHNlKG9wU3BsaXQsXG5cdFx0XHQoe2JlZm9yZSwgYXQsIGFmdGVyfSkgPT4ge1xuXHRcdFx0XHRjb25zdCBnZXRMYXN0ID0gKCkgPT4ge1xuXHRcdFx0XHRcdHN3aXRjaCAoYXQua2luZCkge1xuXHRcdFx0XHRcdFx0Y2FzZSBLV19BbmQ6IGNhc2UgS1dfT3I6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgTG9naWMoYXQubG9jLCBhdC5raW5kID09PSBLV19BbmQgPyBMX0FuZCA6IExfT3IsXG5cdFx0XHRcdFx0XHRcdFx0cGFyc2VFeHByUGFydHMoYWZ0ZXIpKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19DYXNlVmFsOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VDYXNlKHRydWUsIGZhbHNlLCBhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfQ2xhc3M6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUNsYXNzKGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19Db25kOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VDb25kKGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19FeGNlcHRWYWw6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUV4Y2VwdChLV19FeGNlcHRWYWwsIGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19Gb3JCYWc6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUZvckJhZyhhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfRm9yVmFsOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VGb3JWYWwoYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX0Z1bjogY2FzZSBLV19GdW5EbzogY2FzZSBLV19GdW5HZW46IGNhc2UgS1dfRnVuR2VuRG86XG5cdFx0XHRcdFx0XHRjYXNlIEtXX0Z1blRoaXM6IGNhc2UgS1dfRnVuVGhpc0RvOiBjYXNlIEtXX0Z1blRoaXNHZW46XG5cdFx0XHRcdFx0XHRjYXNlIEtXX0Z1blRoaXNHZW5Ebzpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlRnVuKGF0LmtpbmQsIGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19JZlZhbDogY2FzZSBLV19Vbmxlc3NWYWw6IHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2soYWZ0ZXIpXG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgQ29uZGl0aW9uYWxWYWwodG9rZW5zLmxvYyxcblx0XHRcdFx0XHRcdFx0XHRwYXJzZUV4cHJQbGFpbihiZWZvcmUpLFxuXHRcdFx0XHRcdFx0XHRcdHBhcnNlQmxvY2tWYWwoYmxvY2spLFxuXHRcdFx0XHRcdFx0XHRcdGF0LmtpbmQgPT09IEtXX1VubGVzc1ZhbClcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNhc2UgS1dfTmV3OiB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHMoYWZ0ZXIpXG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgTmV3KGF0LmxvYywgcGFydHNbMF0sIHRhaWwocGFydHMpKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19Ob3Q6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgTm90KGF0LmxvYywgcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19TdXBlclZhbDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBTdXBlckNhbGwoYXQubG9jLCBwYXJzZUV4cHJQYXJ0cyhhZnRlcikpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX1N3aXRjaFZhbDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlU3dpdGNoKHRydWUsIGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19XaXRoOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VXaXRoKGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19ZaWVsZDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBZaWVsZChhdC5sb2MsXG5cdFx0XHRcdFx0XHRcdFx0b3BJZighYWZ0ZXIuaXNFbXB0eSgpLCAoKSA9PiBwYXJzZUV4cHJQbGFpbihhZnRlcikpKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19ZaWVsZFRvOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV3IFlpZWxkVG8oYXQubG9jLCBwYXJzZUV4cHJQbGFpbihhZnRlcikpXG5cdFx0XHRcdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoYXQua2luZClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGNhdChiZWZvcmUubWFwKHBhcnNlU2luZ2xlKSwgZ2V0TGFzdCgpKVxuXHRcdFx0fSxcblx0XHRcdCgpID0+IHRva2Vucy5tYXAocGFyc2VTaW5nbGUpKVxuXHR9XG5cbmNvbnN0IHBhcnNlRnVuID0gKGtpbmQsIHRva2VucykgPT4ge1xuXHRsZXQgaXNUaGlzID0gZmFsc2UsIGlzRG8gPSBmYWxzZSwgaXNHZW4gPSBmYWxzZVxuXHRzd2l0Y2ggKGtpbmQpIHtcblx0XHRjYXNlIEtXX0Z1bjpcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5Ebzpcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuR2VuOlxuXHRcdFx0aXNHZW4gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuR2VuRG86XG5cdFx0XHRpc0dlbiA9IHRydWVcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuVGhpczpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5UaGlzRG86XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1blRoaXNHZW46XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRpc0dlbiA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5UaGlzR2VuRG86XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRpc0dlbiA9IHRydWVcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcigpXG5cdH1cblx0Y29uc3Qgb3BEZWNsYXJlVGhpcyA9IG9wSWYoaXNUaGlzLCAoKSA9PiBuZXcgTG9jYWxEZWNsYXJlVGhpcyh0b2tlbnMubG9jKSlcblxuXHRjb25zdCB7b3BSZXR1cm5UeXBlLCByZXN0fSA9IF90cnlUYWtlUmV0dXJuVHlwZSh0b2tlbnMpXG5cdGNvbnN0IHthcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBvcEluLCBvcE91dCwgb3BDb21tZW50fSA9IF9mdW5BcmdzQW5kQmxvY2soaXNEbywgcmVzdClcblx0Ly8gTmVlZCByZXMgZGVjbGFyZSBpZiB0aGVyZSBpcyBhIHJldHVybiB0eXBlIG9yIG91dCBjb25kaXRpb24uXG5cdGNvbnN0IG9wRGVjbGFyZVJlcyA9IGlmRWxzZShvcFJldHVyblR5cGUsXG5cdFx0XyA9PiBuZXcgTG9jYWxEZWNsYXJlUmVzKF8ubG9jLCBfKSxcblx0XHQoKSA9PiBvcE1hcChvcE91dCwgXyA9PiBuZXcgTG9jYWxEZWNsYXJlUmVzKF8ubG9jLCBudWxsKSkpXG5cdHJldHVybiBuZXcgRnVuKHRva2Vucy5sb2MsXG5cdFx0b3BEZWNsYXJlVGhpcywgaXNHZW4sIGFyZ3MsIG9wUmVzdEFyZywgYmxvY2ssIG9wSW4sIG9wRGVjbGFyZVJlcywgb3BPdXQsIG9wQ29tbWVudClcbn1cblxuLy8gcGFyc2VGdW4gcHJpdmF0ZXNcbmNvbnN0XG5cdF90cnlUYWtlUmV0dXJuVHlwZSA9IHRva2VucyA9PiB7XG5cdFx0aWYgKCF0b2tlbnMuaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXHRcdFx0aWYgKGlzR3JvdXAoR19TcGFjZSwgaCkgJiYgaXNLZXl3b3JkKEtXX1R5cGUsIGhlYWQoaC5zdWJUb2tlbnMpKSlcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRvcFJldHVyblR5cGU6IHBhcnNlU3BhY2VkKFNsaWNlLmdyb3VwKGgpLnRhaWwoKSksXG5cdFx0XHRcdFx0cmVzdDogdG9rZW5zLnRhaWwoKVxuXHRcdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB7b3BSZXR1cm5UeXBlOiBudWxsLCByZXN0OiB0b2tlbnN9XG5cdH0sXG5cblx0Lypcblx0aW5jbHVkZU1lbWJlckFyZ3M6XG5cdFx0aWYgdHJ1ZSwgb3V0cHV0IHdpbGwgaW5jbHVkZSBgbWVtYmVyQXJnc2AuXG5cdFx0VGhpcyBpcyBhIHN1YnNldCBvZiBgYXJnc2Agd2hvc2UgbmFtZXMgYXJlIHByZWZpeGVkIHdpdGggYC5gXG5cdFx0ZS5nLjogYGNvbnN0cnVjdCEgLnggLnlgXG5cdFx0VGhpcyBpcyBmb3IgY29uc3RydWN0b3JzIG9ubHkuXG5cdCovXG5cdF9mdW5BcmdzQW5kQmxvY2sgPSAoaXNEbywgdG9rZW5zLCBpbmNsdWRlTWVtYmVyQXJncykgPT4ge1xuXHRcdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAnRXhwZWN0ZWQgYW4gaW5kZW50ZWQgYmxvY2suJylcblx0XHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXHRcdC8vIE1pZ2h0IGJlIGB8Y2FzZWBcblx0XHRpZiAoaCBpbnN0YW5jZW9mIEtleXdvcmQgJiYgKGgua2luZCA9PT0gS1dfQ2FzZVZhbCB8fCBoLmtpbmQgPT09IEtXX0Nhc2VEbykpIHtcblx0XHRcdGNvbnN0IGVDYXNlID0gcGFyc2VDYXNlKGgua2luZCA9PT0gS1dfQ2FzZVZhbCwgdHJ1ZSwgdG9rZW5zLnRhaWwoKSlcblx0XHRcdGNvbnN0IGFyZ3MgPSBbbmV3IExvY2FsRGVjbGFyZUZvY3VzKGgubG9jKV1cblx0XHRcdHJldHVybiBoLmtpbmQgPT09IEtXX0Nhc2VWYWwgP1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YXJncywgb3BSZXN0QXJnOiBudWxsLCBtZW1iZXJBcmdzOiBbXSwgb3BJbjogbnVsbCwgb3BPdXQ6IG51bGwsXG5cdFx0XHRcdFx0YmxvY2s6IG5ldyBCbG9ja1dpdGhSZXR1cm4odG9rZW5zLmxvYywgbnVsbCwgW10sIGVDYXNlKVxuXHRcdFx0XHR9IDpcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGFyZ3MsIG9wUmVzdEFyZzogbnVsbCwgbWVtYmVyQXJnczogW10sIG9wSW46IG51bGwsIG9wT3V0OiBudWxsLFxuXHRcdFx0XHRcdGJsb2NrOiBuZXcgQmxvY2tEbyh0b2tlbnMubG9jLCBudWxsLCBbZUNhc2VdKVxuXHRcdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrTGluZXNdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRcdFx0Y29uc3Qge2FyZ3MsIG9wUmVzdEFyZywgbWVtYmVyQXJnc30gPSBfcGFyc2VGdW5Mb2NhbHMoYmVmb3JlLCBpbmNsdWRlTWVtYmVyQXJncylcblx0XHRcdGZvciAoY29uc3QgYXJnIG9mIGFyZ3MpXG5cdFx0XHRcdGlmICghYXJnLmlzTGF6eSgpKVxuXHRcdFx0XHRcdGFyZy5raW5kID0gTERfTXV0YWJsZVxuXHRcdFx0Y29uc3QgW29wSW4sIHJlc3QwXSA9IF90cnlUYWtlSW5Pck91dChLV19JbiwgYmxvY2tMaW5lcylcblx0XHRcdGNvbnN0IFtvcE91dCwgcmVzdDFdID0gX3RyeVRha2VJbk9yT3V0KEtXX091dCwgcmVzdDApXG5cdFx0XHRjb25zdCBibG9jayA9IChpc0RvID8gcGFyc2VCbG9ja0RvIDogcGFyc2VCbG9ja1ZhbCkocmVzdDEpXG5cdFx0XHRyZXR1cm4ge2FyZ3MsIG9wUmVzdEFyZywgbWVtYmVyQXJncywgYmxvY2ssIG9wSW4sIG9wT3V0fVxuXHRcdH1cblx0fSxcblxuXHRfcGFyc2VGdW5Mb2NhbHMgPSAodG9rZW5zLCBpbmNsdWRlTWVtYmVyQXJncykgPT4ge1xuXHRcdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdFx0cmV0dXJuIHthcmdzOiBbXSwgbWVtYmVyQXJnczogW10sIG9wUmVzdEFyZzogbnVsbH1cblx0XHRlbHNlIHtcblx0XHRcdGxldCByZXN0LCBvcFJlc3RBcmdcblx0XHRcdGNvbnN0IGwgPSB0b2tlbnMubGFzdCgpXG5cdFx0XHRpZiAobCBpbnN0YW5jZW9mIERvdE5hbWUgJiYgbC5uRG90cyA9PT0gMykge1xuXHRcdFx0XHRyZXN0ID0gdG9rZW5zLnJ0YWlsKClcblx0XHRcdFx0b3BSZXN0QXJnID0gTG9jYWxEZWNsYXJlLnBsYWluKGwubG9jLCBsLm5hbWUpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXN0ID0gdG9rZW5zXG5cdFx0XHRcdG9wUmVzdEFyZyA9IG51bGxcblx0XHRcdH1cblxuXHRcdFx0aWYgKGluY2x1ZGVNZW1iZXJBcmdzKSB7XG5cdFx0XHRcdGNvbnN0IHtkZWNsYXJlczogYXJncywgbWVtYmVyQXJnc30gPSBwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzKHJlc3QpXG5cdFx0XHRcdHJldHVybiB7YXJncywgbWVtYmVyQXJncywgb3BSZXN0QXJnfVxuXHRcdFx0fSBlbHNlXG5cdFx0XHRcdHJldHVybiB7YXJnczogcGFyc2VMb2NhbERlY2xhcmVzKHJlc3QpLCBvcFJlc3RBcmd9XG5cdFx0fVxuXHR9LFxuXG5cdF90cnlUYWtlSW5Pck91dCA9IChpbk9yT3V0LCB0b2tlbnMpID0+IHtcblx0XHRpZiAoIXRva2Vucy5pc0VtcHR5KCkpIHtcblx0XHRcdGNvbnN0IGZpcnN0TGluZSA9IHRva2Vucy5oZWFkU2xpY2UoKVxuXHRcdFx0aWYgKGlzS2V5d29yZChpbk9yT3V0LCBmaXJzdExpbmUuaGVhZCgpKSkge1xuXHRcdFx0XHRjb25zdCBpbk91dCA9IG5ldyBEZWJ1Zyhcblx0XHRcdFx0XHRmaXJzdExpbmUubG9jLFxuXHRcdFx0XHRcdHBhcnNlTGluZXNGcm9tQmxvY2soZmlyc3RMaW5lKSlcblx0XHRcdFx0cmV0dXJuIFtpbk91dCwgdG9rZW5zLnRhaWwoKV1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIFtudWxsLCB0b2tlbnNdXG5cdH1cblxuY29uc3Rcblx0cGFyc2VMaW5lID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBoZWFkID0gdG9rZW5zLmhlYWQoKVxuXHRcdGNvbnN0IHJlc3QgPSB0b2tlbnMudGFpbCgpXG5cblx0XHRjb25zdCBub1Jlc3QgPSAoKSA9PlxuXHRcdFx0Y2hlY2tFbXB0eShyZXN0LCAoKSA9PiBgRGlkIG5vdCBleHBlY3QgYW55dGhpbmcgYWZ0ZXIgJHtoZWFkfWApXG5cblx0XHQvLyBXZSBvbmx5IGRlYWwgd2l0aCBtdXRhYmxlIGV4cHJlc3Npb25zIGhlcmUsIG90aGVyd2lzZSB3ZSBmYWxsIGJhY2sgdG8gcGFyc2VFeHByLlxuXHRcdGlmIChoZWFkIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRcdHN3aXRjaCAoaGVhZC5raW5kKSB7XG5cdFx0XHRcdGNhc2UgS1dfQXNzZXJ0OiBjYXNlIEtXX0Fzc2VydE5vdDpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VBc3NlcnQoaGVhZC5raW5kID09PSBLV19Bc3NlcnROb3QsIHJlc3QpXG5cdFx0XHRcdGNhc2UgS1dfRXhjZXB0RG86XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlRXhjZXB0KEtXX0V4Y2VwdERvLCByZXN0KVxuXHRcdFx0XHRjYXNlIEtXX0JyZWFrOlxuXHRcdFx0XHRcdG5vUmVzdCgpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBCcmVhayh0b2tlbnMubG9jKVxuXHRcdFx0XHRjYXNlIEtXX0JyZWFrV2l0aFZhbDpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEJyZWFrV2l0aFZhbCh0b2tlbnMubG9jLCBwYXJzZUV4cHIocmVzdCkpXG5cdFx0XHRcdGNhc2UgS1dfQ2FzZURvOlxuXHRcdFx0XHRcdHJldHVybiBwYXJzZUNhc2UoZmFsc2UsIGZhbHNlLCByZXN0KVxuXHRcdFx0XHRjYXNlIEtXX0RlYnVnOlxuXHRcdFx0XHRcdHJldHVybiBuZXcgRGVidWcodG9rZW5zLmxvYyxcblx0XHRcdFx0XHRcdGlzR3JvdXAoR19CbG9jaywgdG9rZW5zLnNlY29uZCgpKSA/XG5cdFx0XHRcdFx0XHQvLyBgZGVidWdgLCB0aGVuIGluZGVudGVkIGJsb2NrXG5cdFx0XHRcdFx0XHRwYXJzZUxpbmVzRnJvbUJsb2NrKCkgOlxuXHRcdFx0XHRcdFx0Ly8gYGRlYnVnYCwgdGhlbiBzaW5nbGUgbGluZVxuXHRcdFx0XHRcdFx0cGFyc2VMaW5lT3JMaW5lcyhyZXN0KSlcblx0XHRcdFx0Y2FzZSBLV19EZWJ1Z2dlcjpcblx0XHRcdFx0XHRub1Jlc3QoKVxuXHRcdFx0XHRcdHJldHVybiBuZXcgU3BlY2lhbERvKHRva2Vucy5sb2MsIFNEX0RlYnVnZ2VyKVxuXHRcdFx0XHRjYXNlIEtXX0VsbGlwc2lzOlxuXHRcdFx0XHRcdHJldHVybiBuZXcgQmFnRW50cnlNYW55KHRva2Vucy5sb2MsIHBhcnNlRXhwcihyZXN0KSlcblx0XHRcdFx0Y2FzZSBLV19Gb3JEbzpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VGb3JEbyhyZXN0KVxuXHRcdFx0XHRjYXNlIEtXX0lnbm9yZTpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VJZ25vcmUocmVzdClcblx0XHRcdFx0Y2FzZSBLV19JZkRvOiBjYXNlIEtXX1VubGVzc0RvOiB7XG5cdFx0XHRcdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2socmVzdClcblx0XHRcdFx0XHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsRG8odG9rZW5zLmxvYyxcblx0XHRcdFx0XHRcdHBhcnNlRXhwcihiZWZvcmUpLFxuXHRcdFx0XHRcdFx0cGFyc2VCbG9ja0RvKGJsb2NrKSxcblx0XHRcdFx0XHRcdGhlYWQua2luZCA9PT0gS1dfVW5sZXNzRG8pXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBLV19PYmpBc3NpZ246XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBCYWdFbnRyeSh0b2tlbnMubG9jLCBwYXJzZUV4cHIocmVzdCkpXG5cdFx0XHRcdGNhc2UgS1dfUGFzczpcblx0XHRcdFx0XHRub1Jlc3QoKVxuXHRcdFx0XHRcdHJldHVybiBbXVxuXHRcdFx0XHRjYXNlIEtXX1JlZ2lvbjpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VMaW5lc0Zyb21CbG9jayh0b2tlbnMpXG5cdFx0XHRcdGNhc2UgS1dfU3VwZXJEbzpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IFN1cGVyQ2FsbERvKHRva2Vucy5sb2MsIHBhcnNlRXhwclBhcnRzKHJlc3QpKVxuXHRcdFx0XHRjYXNlIEtXX1N3aXRjaERvOlxuXHRcdFx0XHRcdHJldHVybiBwYXJzZVN3aXRjaChmYWxzZSwgcmVzdClcblx0XHRcdFx0Y2FzZSBLV19UaHJvdzpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IFRocm93KHRva2Vucy5sb2MsIG9wSWYoIXJlc3QuaXNFbXB0eSgpLCAoKSA9PiBwYXJzZUV4cHIocmVzdCkpKVxuXHRcdFx0XHRjYXNlIEtXX05hbWU6XG5cdFx0XHRcdFx0aWYgKGlzS2V5d29yZChLV19PYmpBc3NpZ24sIHJlc3QuaGVhZCgpKSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgciA9IHJlc3QudGFpbCgpXG5cdFx0XHRcdFx0XHRjb25zdCB2YWwgPSByLmlzRW1wdHkoKSA/IG5ldyBTcGVjaWFsVmFsKHRva2Vucy5sb2MsIFNWX05hbWUpIDogcGFyc2VFeHByKHIpXG5cdFx0XHRcdFx0XHRyZXR1cm4gT2JqRW50cnlDb21wdXRlZC5uYW1lKHRva2Vucy5sb2MsIHZhbClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gZWxzZSBmYWxsdGhyb3VnaFxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdC8vIGZhbGwgdGhyb3VnaFxuXHRcdFx0fVxuXG5cdFx0cmV0dXJuIGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2VXaGVyZShfaXNMaW5lU3BsaXRLZXl3b3JkKSxcblx0XHRcdCh7YmVmb3JlLCBhdCwgYWZ0ZXJ9KSA9PiBfcGFyc2VBc3NpZ25MaWtlKGJlZm9yZSwgYXQsIGFmdGVyLCB0b2tlbnMubG9jKSxcblx0XHRcdCgpID0+IHBhcnNlRXhwcih0b2tlbnMpKVxuXHR9LFxuXG5cdHBhcnNlTGluZU9yTGluZXMgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IF8gPSBwYXJzZUxpbmUodG9rZW5zKVxuXHRcdHJldHVybiBfIGluc3RhbmNlb2YgQXJyYXkgPyBfIDogW19dXG5cdH1cblxuLy8gcGFyc2VMaW5lIHByaXZhdGVzXG5jb25zdFxuXHRfaXNMaW5lU3BsaXRLZXl3b3JkID0gdG9rZW4gPT4ge1xuXHRcdGlmICh0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBLV19Bc3NpZ246IGNhc2UgS1dfQXNzaWduTXV0YWJsZTogY2FzZSBLV19Mb2NhbE11dGF0ZTpcblx0XHRcdFx0Y2FzZSBLV19NYXBFbnRyeTogY2FzZSBLV19PYmpBc3NpZ246IGNhc2UgS1dfWWllbGQ6IGNhc2UgS1dfWWllbGRUbzpcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0fVxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBmYWxzZVxuXHR9LFxuXG5cdF9wYXJzZUFzc2lnbkxpa2UgPSAoYmVmb3JlLCBhdCwgYWZ0ZXIsIGxvYykgPT4ge1xuXHRcdGlmIChhdC5raW5kID09PSBLV19NYXBFbnRyeSlcblx0XHRcdHJldHVybiBuZXcgTWFwRW50cnkobG9jLCBwYXJzZUV4cHIoYmVmb3JlKSwgcGFyc2VFeHByKGFmdGVyKSlcblxuXHRcdC8vIFRPRE86IFRoaXMgY29kZSBpcyBraW5kIG9mIHVnbHkuXG5cdFx0Ly8gSXQgcGFyc2VzIGB4LnkgPSB6YCBhbmQgdGhlIGxpa2UuXG5cdFx0aWYgKGJlZm9yZS5zaXplKCkgPT09IDEpIHtcblx0XHRcdGNvbnN0IHRva2VuID0gYmVmb3JlLmhlYWQoKVxuXHRcdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgRG90TmFtZSlcblx0XHRcdFx0cmV0dXJuIF9wYXJzZU1lbWJlclNldChcdExvY2FsQWNjZXNzLnRoaXModG9rZW4ubG9jKSwgdG9rZW4ubmFtZSwgYXQsIGFmdGVyLCBsb2MpXG5cdFx0XHRpZiAoaXNHcm91cChHX1NwYWNlLCB0b2tlbikpIHtcblx0XHRcdFx0Y29uc3Qgc3BhY2VkID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0XHRcdGNvbnN0IGRvdCA9IHNwYWNlZC5sYXN0KClcblx0XHRcdFx0aWYgKGRvdCBpbnN0YW5jZW9mIERvdE5hbWUpIHtcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKGRvdC5uRG90cyA9PT0gMSwgZG90LmxvYywgJ011c3QgaGF2ZSBvbmx5IDEgYC5gLicpXG5cdFx0XHRcdFx0cmV0dXJuIF9wYXJzZU1lbWJlclNldChwYXJzZVNwYWNlZChzcGFjZWQucnRhaWwoKSksIGRvdC5uYW1lLCBhdCwgYWZ0ZXIsIGxvYylcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBhdC5raW5kID09PSBLV19Mb2NhbE11dGF0ZSA/XG5cdFx0XHRfcGFyc2VMb2NhbE11dGF0ZShiZWZvcmUsIGFmdGVyLCBsb2MpIDpcblx0XHRcdF9wYXJzZUFzc2lnbihiZWZvcmUsIGF0LCBhZnRlciwgbG9jKVxuXHR9LFxuXG5cdF9wYXJzZU1lbWJlclNldCA9IChvYmplY3QsIG5hbWUsIGF0LCBhZnRlciwgbG9jKSA9PlxuXHRcdG5ldyBNZW1iZXJTZXQobG9jLCBvYmplY3QsIG5hbWUsIF9tZW1iZXJTZXRLaW5kKGF0KSwgcGFyc2VFeHByKGFmdGVyKSksXG5cdF9tZW1iZXJTZXRLaW5kID0gYXQgPT4ge1xuXHRcdHN3aXRjaCAoYXQua2luZCkge1xuXHRcdFx0Y2FzZSBLV19Bc3NpZ246IHJldHVybiBNU19OZXdcblx0XHRcdGNhc2UgS1dfQXNzaWduTXV0YWJsZTogcmV0dXJuIE1TX05ld011dGFibGVcblx0XHRcdGNhc2UgS1dfTG9jYWxNdXRhdGU6IHJldHVybiBNU19NdXRhdGVcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcigpXG5cdFx0fVxuXHR9LFxuXG5cdF9wYXJzZUxvY2FsTXV0YXRlID0gKGxvY2Fsc1Rva2VucywgdmFsdWVUb2tlbnMsIGxvYykgPT4ge1xuXHRcdGNvbnN0IGxvY2FscyA9IHBhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcyhsb2NhbHNUb2tlbnMpXG5cdFx0Y29udGV4dC5jaGVjayhsb2NhbHMubGVuZ3RoID09PSAxLCBsb2MsICdUT0RPOiBMb2NhbERlc3RydWN0dXJlTXV0YXRlJylcblx0XHRjb25zdCBuYW1lID0gbG9jYWxzWzBdLm5hbWVcblx0XHRjb25zdCB2YWx1ZSA9IHBhcnNlRXhwcih2YWx1ZVRva2Vucylcblx0XHRyZXR1cm4gbmV3IExvY2FsTXV0YXRlKGxvYywgbmFtZSwgdmFsdWUpXG5cdH0sXG5cblx0X3BhcnNlQXNzaWduID0gKGxvY2Fsc1Rva2VucywgYXNzaWduZXIsIHZhbHVlVG9rZW5zLCBsb2MpID0+IHtcblx0XHRjb25zdCBraW5kID0gYXNzaWduZXIua2luZFxuXHRcdGNvbnN0IGxvY2FscyA9IHBhcnNlTG9jYWxEZWNsYXJlcyhsb2NhbHNUb2tlbnMpXG5cdFx0Y29uc3Qgb3BOYW1lID0gb3BJZihsb2NhbHMubGVuZ3RoID09PSAxLCAoKSA9PiBsb2NhbHNbMF0ubmFtZSlcblx0XHRjb25zdCB2YWx1ZSA9IF9wYXJzZUFzc2lnblZhbHVlKGtpbmQsIG9wTmFtZSwgdmFsdWVUb2tlbnMpXG5cblx0XHRjb25zdCBpc1lpZWxkID0ga2luZCA9PT0gS1dfWWllbGQgfHwga2luZCA9PT0gS1dfWWllbGRUb1xuXHRcdGlmIChpc0VtcHR5KGxvY2FscykpIHtcblx0XHRcdGNvbnRleHQuY2hlY2soaXNZaWVsZCwgbG9jYWxzVG9rZW5zLmxvYywgJ0Fzc2lnbm1lbnQgdG8gbm90aGluZycpXG5cdFx0XHRyZXR1cm4gdmFsdWVcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKGlzWWllbGQpXG5cdFx0XHRcdGZvciAoY29uc3QgXyBvZiBsb2NhbHMpXG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayghXy5pc0xhenkoKSwgXy5sb2MsICdDYW4gbm90IHlpZWxkIHRvIGxhenkgdmFyaWFibGUuJylcblxuXHRcdFx0Y29uc3QgaXNPYmpBc3NpZ24gPSBraW5kID09PSBLV19PYmpBc3NpZ25cblxuXHRcdFx0aWYgKGtpbmQgPT09IEtXX0Fzc2lnbk11dGFibGUpXG5cdFx0XHRcdGZvciAobGV0IF8gb2YgbG9jYWxzKSB7XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayghXy5pc0xhenkoKSwgXy5sb2MsICdMYXp5IGxvY2FsIGNhbiBub3QgYmUgbXV0YWJsZS4nKVxuXHRcdFx0XHRcdF8ua2luZCA9IExEX011dGFibGVcblx0XHRcdFx0fVxuXG5cdFx0XHRjb25zdCB3cmFwID0gXyA9PiBpc09iakFzc2lnbiA/IG5ldyBPYmpFbnRyeUFzc2lnbihsb2MsIF8pIDogX1xuXG5cdFx0XHRpZiAobG9jYWxzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRjb25zdCBhc3NpZ25lZSA9IGxvY2Fsc1swXVxuXHRcdFx0XHRjb25zdCBhc3NpZ24gPSBuZXcgQXNzaWduU2luZ2xlKGxvYywgYXNzaWduZWUsIHZhbHVlKVxuXHRcdFx0XHRjb25zdCBpc1Rlc3QgPSBpc09iakFzc2lnbiAmJiBhc3NpZ25lZS5uYW1lLmVuZHNXaXRoKCd0ZXN0Jylcblx0XHRcdFx0cmV0dXJuIGlzVGVzdCA/IG5ldyBEZWJ1Zyhsb2MsIFt3cmFwKGFzc2lnbildKSA6IHdyYXAoYXNzaWduKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qga2luZCA9IGxvY2Fsc1swXS5raW5kXG5cdFx0XHRcdGZvciAoY29uc3QgXyBvZiBsb2NhbHMpXG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayhfLmtpbmQgPT09IGtpbmQsIF8ubG9jLFxuXHRcdFx0XHRcdFx0J0FsbCBsb2NhbHMgb2YgZGVzdHJ1Y3R1cmluZyBhc3NpZ25tZW50IG11c3QgYmUgb2YgdGhlIHNhbWUga2luZC4nKVxuXHRcdFx0XHRyZXR1cm4gd3JhcChuZXcgQXNzaWduRGVzdHJ1Y3R1cmUobG9jLCBsb2NhbHMsIHZhbHVlLCBraW5kKSlcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0X3BhcnNlQXNzaWduVmFsdWUgPSAoa2luZCwgb3BOYW1lLCB2YWx1ZVRva2VucykgPT4ge1xuXHRcdGNvbnN0IHZhbHVlID0gdmFsdWVUb2tlbnMuaXNFbXB0eSgpICYmIGtpbmQgPT09IEtXX09iakFzc2lnbiA/XG5cdFx0XHRuZXcgU3BlY2lhbFZhbCh2YWx1ZVRva2Vucy5sb2MsIFNWX051bGwpIDpcblx0XHRcdHBhcnNlRXhwcih2YWx1ZVRva2Vucylcblx0XHRzd2l0Y2ggKGtpbmQpIHtcblx0XHRcdGNhc2UgS1dfWWllbGQ6XG5cdFx0XHRcdHJldHVybiBuZXcgWWllbGQodmFsdWUubG9jLCB2YWx1ZSlcblx0XHRcdGNhc2UgS1dfWWllbGRUbzpcblx0XHRcdFx0cmV0dXJuIG5ldyBZaWVsZFRvKHZhbHVlLmxvYywgdmFsdWUpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gdmFsdWVcblx0XHR9XG5cdH1cblxuY29uc3Rcblx0cGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzID0gdG9rZW5zID0+XG5cdFx0dG9rZW5zLm1hcChfID0+IExvY2FsRGVjbGFyZS5wbGFpbihfLmxvYywgX3BhcnNlTG9jYWxOYW1lKF8pKSksXG5cblx0cGFyc2VMb2NhbERlY2xhcmVzID0gKHRva2VucywgaW5jbHVkZU1lbWJlckFyZ3MpID0+XG5cdFx0aW5jbHVkZU1lbWJlckFyZ3MgPyBwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzKHRva2VucykgOiB0b2tlbnMubWFwKHBhcnNlTG9jYWxEZWNsYXJlKSxcblxuXHQvLyBfb3JNZW1iZXI6IGlmIHRydWUsIHdpbGwgbG9vayBmb3IgYC54YCBhcmd1bWVudHMgYW5kIHJldHVybiB7ZGVjbGFyZSwgaXNNZW1iZXJ9LlxuXHRwYXJzZUxvY2FsRGVjbGFyZSA9ICh0b2tlbiwgX29yTWVtYmVyKSA9PiB7XG5cdFx0bGV0IGlzTWVtYmVyID0gZmFsc2Vcblx0XHRsZXQgZGVjbGFyZVxuXG5cdFx0Y29uc3QgcGFyc2VMb2NhbE5hbWUgPSB0b2tlbiA9PiB7XG5cdFx0XHRpZiAoX29yTWVtYmVyKSB7XG5cdFx0XHRcdGlzTWVtYmVyID0gdG9rZW4gaW5zdGFuY2VvZiBEb3ROYW1lICYmIHRva2VuLm5Eb3RzID09PSAxXG5cdFx0XHRcdHJldHVybiBpc01lbWJlciA/IHRva2VuLm5hbWUgOiBfcGFyc2VMb2NhbE5hbWUodG9rZW4pXG5cdFx0XHR9IGVsc2Vcblx0XHRcdFx0cmV0dXJuIF9wYXJzZUxvY2FsTmFtZSh0b2tlbilcblx0XHR9XG5cblx0XHRpZiAoaXNHcm91cChHX1NwYWNlLCB0b2tlbikpIHtcblx0XHRcdGNvbnN0IHRva2VucyA9IFNsaWNlLmdyb3VwKHRva2VuKVxuXHRcdFx0Y29uc3QgW3Jlc3QsIGlzTGF6eV0gPVxuXHRcdFx0XHRpc0tleXdvcmQoS1dfTGF6eSwgdG9rZW5zLmhlYWQoKSkgPyBbdG9rZW5zLnRhaWwoKSwgdHJ1ZV0gOiBbdG9rZW5zLCBmYWxzZV1cblxuXHRcdFx0Y29uc3QgbmFtZSA9IHBhcnNlTG9jYWxOYW1lKHJlc3QuaGVhZCgpKVxuXHRcdFx0Y29uc3QgcmVzdDIgPSByZXN0LnRhaWwoKVxuXHRcdFx0Y29uc3Qgb3BUeXBlID0gb3BJZighcmVzdDIuaXNFbXB0eSgpLCAoKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGNvbG9uID0gcmVzdDIuaGVhZCgpXG5cdFx0XHRcdGNvbnRleHQuY2hlY2soaXNLZXl3b3JkKEtXX1R5cGUsIGNvbG9uKSwgY29sb24ubG9jLCAoKSA9PiBgRXhwZWN0ZWQgJHtjb2RlKCc6Jyl9YClcblx0XHRcdFx0Y29uc3QgdG9rZW5zVHlwZSA9IHJlc3QyLnRhaWwoKVxuXHRcdFx0XHRjaGVja05vbkVtcHR5KHRva2Vuc1R5cGUsICgpID0+IGBFeHBlY3RlZCBzb21ldGhpbmcgYWZ0ZXIgJHtjb2xvbn1gKVxuXHRcdFx0XHRyZXR1cm4gcGFyc2VTcGFjZWQodG9rZW5zVHlwZSlcblx0XHRcdH0pXG5cdFx0XHRkZWNsYXJlID0gbmV3IExvY2FsRGVjbGFyZSh0b2tlbi5sb2MsIG5hbWUsIG9wVHlwZSwgaXNMYXp5ID8gTERfTGF6eSA6IExEX0NvbnN0KVxuXHRcdH0gZWxzZVxuXHRcdFx0ZGVjbGFyZSA9IExvY2FsRGVjbGFyZS5wbGFpbih0b2tlbi5sb2MsIHBhcnNlTG9jYWxOYW1lKHRva2VuKSlcblxuXHRcdGlmIChfb3JNZW1iZXIpXG5cdFx0XHRyZXR1cm4ge2RlY2xhcmUsIGlzTWVtYmVyfVxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBkZWNsYXJlXG5cdH0sXG5cblx0cGFyc2VMb2NhbERlY2xhcmVzQW5kTWVtYmVyQXJncyA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgZGVjbGFyZXMgPSBbXSwgbWVtYmVyQXJncyA9IFtdXG5cdFx0Zm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcblx0XHRcdGNvbnN0IHtkZWNsYXJlLCBpc01lbWJlcn0gPSBwYXJzZUxvY2FsRGVjbGFyZSh0b2tlbiwgdHJ1ZSlcblx0XHRcdGRlY2xhcmVzLnB1c2goZGVjbGFyZSlcblx0XHRcdGlmIChpc01lbWJlcilcblx0XHRcdFx0bWVtYmVyQXJncy5wdXNoKGRlY2xhcmUpXG5cdFx0fVxuXHRcdHJldHVybiB7ZGVjbGFyZXMsIG1lbWJlckFyZ3N9XG5cdH1cblxuLy8gcGFyc2VMb2NhbERlY2xhcmUgcHJpdmF0ZXNcbmNvbnN0XG5cdF9wYXJzZUxvY2FsTmFtZSA9IHQgPT4ge1xuXHRcdGlmIChpc0tleXdvcmQoS1dfRm9jdXMsIHQpKVxuXHRcdFx0cmV0dXJuICdfJ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29udGV4dC5jaGVjayh0IGluc3RhbmNlb2YgTmFtZSwgdC5sb2MsICgpID0+IGBFeHBlY3RlZCBhIGxvY2FsIG5hbWUsIG5vdCAke3R9YClcblx0XHRcdHJldHVybiB0Lm5hbWVcblx0XHR9XG5cdH1cblxuY29uc3QgcGFyc2VTaW5nbGUgPSB0b2tlbiA9PiB7XG5cdGNvbnN0IHtsb2N9ID0gdG9rZW5cblx0aWYgKHRva2VuIGluc3RhbmNlb2YgTmFtZSlcblx0XHRyZXR1cm4gbmV3IExvY2FsQWNjZXNzKGxvYywgdG9rZW4ubmFtZSlcblx0ZWxzZSBpZiAodG9rZW4gaW5zdGFuY2VvZiBHcm91cCkge1xuXHRcdGNvbnN0IHNsaWNlID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRjYXNlIEdfU3BhY2U6XG5cdFx0XHRcdHJldHVybiBwYXJzZVNwYWNlZChzbGljZSlcblx0XHRcdGNhc2UgR19QYXJlbnRoZXNpczpcblx0XHRcdFx0cmV0dXJuIHBhcnNlRXhwcihzbGljZSlcblx0XHRcdGNhc2UgR19CcmFja2V0OlxuXHRcdFx0XHRyZXR1cm4gbmV3IEJhZ1NpbXBsZShsb2MsIHBhcnNlRXhwclBhcnRzKHNsaWNlKSlcblx0XHRcdGNhc2UgR19CbG9jazpcblx0XHRcdFx0cmV0dXJuIGJsb2NrV3JhcChzbGljZSlcblx0XHRcdGNhc2UgR19RdW90ZTpcblx0XHRcdFx0cmV0dXJuIHBhcnNlUXVvdGUoc2xpY2UpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IodG9rZW4ua2luZClcblx0XHR9XG5cdH0gZWxzZSBpZiAodG9rZW4gaW5zdGFuY2VvZiBOdW1iZXJMaXRlcmFsKVxuXHRcdHJldHVybiB0b2tlblxuXHRlbHNlIGlmICh0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRjYXNlIEtXX0ZvY3VzOlxuXHRcdFx0XHRyZXR1cm4gTG9jYWxBY2Nlc3MuZm9jdXMobG9jKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIGlmRWxzZShvcEtleXdvcmRLaW5kVG9TcGVjaWFsVmFsdWVLaW5kKHRva2VuLmtpbmQpLFxuXHRcdFx0XHRcdF8gPT4gbmV3IFNwZWNpYWxWYWwobG9jLCBfKSxcblx0XHRcdFx0XHQoKSA9PiB1bmV4cGVjdGVkKHRva2VuKSlcblxuXHRcdH1cblx0ZWxzZSBpZiAodG9rZW4gaW5zdGFuY2VvZiBEb3ROYW1lKVxuXHRcdHN3aXRjaCAodG9rZW4ubkRvdHMpIHtcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0cmV0dXJuIG5ldyBNZW1iZXIodG9rZW4ubG9jLCBMb2NhbEFjY2Vzcy50aGlzKHRva2VuLmxvYyksIHRva2VuLm5hbWUpXG5cdFx0XHRjYXNlIDM6XG5cdFx0XHRcdHJldHVybiBuZXcgU3BsYXQobG9jLCBuZXcgTG9jYWxBY2Nlc3MobG9jLCB0b2tlbi5uYW1lKSlcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHVuZXhwZWN0ZWQodG9rZW4pXG5cdFx0fVxuXHRlbHNlXG5cdFx0dW5leHBlY3RlZCh0b2tlbilcbn1cblxuY29uc3QgcGFyc2VTcGFjZWQgPSB0b2tlbnMgPT4ge1xuXHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKSwgcmVzdCA9IHRva2Vucy50YWlsKClcblx0aWYgKGlzS2V5d29yZChLV19UeXBlLCBoKSlcblx0XHRyZXR1cm4gQ2FsbC5jb250YWlucyhoLmxvYywgcGFyc2VTcGFjZWQocmVzdCksIExvY2FsQWNjZXNzLmZvY3VzKGgubG9jKSlcblx0ZWxzZSBpZiAoaXNLZXl3b3JkKEtXX0xhenksIGgpKVxuXHRcdHJldHVybiBuZXcgTGF6eShoLmxvYywgcGFyc2VTcGFjZWQocmVzdCkpXG5cdGVsc2UgaWYgKGlzS2V5d29yZChLV19TdXBlclZhbCwgaCkpIHtcblx0XHQvLyBUT0RPOiBoYW5kbGUgc3ViIGhlcmUgYXMgd2VsbFxuXHRcdGNvbnN0IGgyID0gcmVzdC5oZWFkKClcblx0XHRpZiAoaDIgaW5zdGFuY2VvZiBEb3ROYW1lKSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKGgyLm5Eb3RzID09PSAxLCBoMi5sb2MsICdUb28gbWFueSBkb3RzIScpXG5cdFx0XHRjb25zdCB4ID0gbmV3IFN1cGVyTWVtYmVyKGgyLmxvYywgaDIubmFtZSlcblx0XHRcdHJldHVybiBfcGFyc2VTcGFjZWRGb2xkKHgsIHJlc3QudGFpbCgpKVxuXHRcdH0gZWxzZSBpZiAoaXNHcm91cChHX1BhcmVudGhlc2lzLCBoMikgJiYgU2xpY2UuZ3JvdXAoaDIpLmlzRW1wdHkoKSkge1xuXHRcdFx0Y29uc3QgeCA9IG5ldyBTdXBlckNhbGwoaDIubG9jLCBbXSlcblx0XHRcdHJldHVybiBfcGFyc2VTcGFjZWRGb2xkKHgsIHJlc3QudGFpbCgpKVxuXHRcdH0gZWxzZVxuXHRcdFx0Y29udGV4dC5mYWlsKGBFeHBlY3RlZCAke2NvZGUoJy4nKX0gb3IgJHtjb2RlKCcoKScpfSBhZnRlciAke2NvZGUoJ3N1cGVyJyl9YClcblx0fSBlbHNlXG5cdFx0cmV0dXJuIF9wYXJzZVNwYWNlZEZvbGQocGFyc2VTaW5nbGUoaCksIHJlc3QpXG59XG5jb25zdCBfcGFyc2VTcGFjZWRGb2xkID0gKHN0YXJ0LCByZXN0KSA9PiB7XG5cdGxldCBhY2MgPSBzdGFydFxuXHRmb3IgKGxldCBpID0gcmVzdC5zdGFydDsgaSA8IHJlc3QuZW5kOyBpID0gaSArIDEpIHtcblx0XHRjb25zdCB0b2tlbiA9IHJlc3QudG9rZW5zW2ldXG5cdFx0Y29uc3QgbG9jID0gdG9rZW4ubG9jXG5cdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgRG90TmFtZSkge1xuXHRcdFx0Y29udGV4dC5jaGVjayh0b2tlbi5uRG90cyA9PT0gMSwgdG9rZW4ubG9jLCAnVG9vIG1hbnkgZG90cyEnKVxuXHRcdFx0YWNjID0gbmV3IE1lbWJlcih0b2tlbi5sb2MsIGFjYywgdG9rZW4ubmFtZSlcblx0XHRcdGNvbnRpbnVlXG5cdFx0fVxuXHRcdGlmICh0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBLV19Gb2N1czpcblx0XHRcdFx0XHRhY2MgPSBuZXcgQ2FsbCh0b2tlbi5sb2MsIGFjYywgW0xvY2FsQWNjZXNzLmZvY3VzKGxvYyldKVxuXHRcdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRcdGNhc2UgS1dfVHlwZToge1xuXHRcdFx0XHRcdGNvbnN0IHR5cGUgPSBwYXJzZVNwYWNlZChyZXN0Ll9jaG9wU3RhcnQoaSArIDEpKVxuXHRcdFx0XHRcdHJldHVybiBDYWxsLmNvbnRhaW5zKHRva2VuLmxvYywgdHlwZSwgYWNjKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHR9XG5cdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgR3JvdXApIHtcblx0XHRcdGNvbnN0IHNsaWNlID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBHX0JyYWNrZXQ6XG5cdFx0XHRcdFx0YWNjID0gQ2FsbC5zdWIobG9jLCBjYXQoYWNjLCBwYXJzZUV4cHJQYXJ0cyhzbGljZSkpKVxuXHRcdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRcdGNhc2UgR19QYXJlbnRoZXNpczpcblx0XHRcdFx0XHRjaGVja0VtcHR5KHNsaWNlLCAoKSA9PlxuXHRcdFx0XHRcdFx0YFVzZSAke2NvZGUoJyhhIGIpJyl9LCBub3QgJHtjb2RlKCdhKGIpJyl9YClcblx0XHRcdFx0XHRhY2MgPSBuZXcgQ2FsbChsb2MsIGFjYywgW10pXG5cdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0Y2FzZSBHX1F1b3RlOlxuXHRcdFx0XHRcdGFjYyA9IG5ldyBRdW90ZVRlbXBsYXRlKGxvYywgYWNjLCBwYXJzZVF1b3RlKHNsaWNlKSlcblx0XHRcdFx0XHRjb250aW51ZVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0fVxuXHRcdH1cblx0XHRjb250ZXh0LmZhaWwodG9rZW4ubG9jLCBgRXhwZWN0ZWQgbWVtYmVyIG9yIHN1Yiwgbm90ICR7dG9rZW59YClcblx0fVxuXHRyZXR1cm4gYWNjXG59XG5cbmNvbnN0IHRyeVBhcnNlVXNlcyA9ICh1c2VLZXl3b3JkS2luZCwgdG9rZW5zKSA9PiB7XG5cdGlmICghdG9rZW5zLmlzRW1wdHkoKSkge1xuXHRcdGNvbnN0IGxpbmUwID0gdG9rZW5zLmhlYWRTbGljZSgpXG5cdFx0aWYgKGlzS2V5d29yZCh1c2VLZXl3b3JkS2luZCwgbGluZTAuaGVhZCgpKSkge1xuXHRcdFx0Y29uc3Qge3VzZXMsIG9wVXNlR2xvYmFsfSA9IF9wYXJzZVVzZXModXNlS2V5d29yZEtpbmQsIGxpbmUwLnRhaWwoKSlcblx0XHRcdGlmIChuZXcgU2V0KFtLV19Vc2VEbywgS1dfVXNlTGF6eSwgS1dfVXNlRGVidWddKS5oYXModXNlS2V5d29yZEtpbmQpKVxuXHRcdFx0XHRjb250ZXh0LmNoZWNrKG9wVXNlR2xvYmFsID09PSBudWxsLCBsaW5lMC5sb2MsICdDYW5cXCd0IHVzZSBnbG9iYWwgaGVyZS4nKVxuXHRcdFx0cmV0dXJuIHt1c2VzLCBvcFVzZUdsb2JhbCwgcmVzdDogdG9rZW5zLnRhaWwoKX1cblx0XHR9XG5cdH1cblx0cmV0dXJuIHt1c2VzOiBbXSwgb3BVc2VHbG9iYWw6IG51bGwsIHJlc3Q6IHRva2Vuc31cbn1cblxuLy8gdHJ5UGFyc2VVc2UgcHJpdmF0ZXNcbmNvbnN0XG5cdF9wYXJzZVVzZXMgPSAodXNlS2V5d29yZEtpbmQsIHRva2VucykgPT4ge1xuXHRcdGNvbnN0IGxpbmVzID0ganVzdEJsb2NrKHVzZUtleXdvcmRLaW5kLCB0b2tlbnMpXG5cdFx0bGV0IG9wVXNlR2xvYmFsID0gbnVsbFxuXG5cdFx0Y29uc3QgdXNlcyA9IFtdXG5cblx0XHRmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMuc2xpY2VzKCkpIHtcblx0XHRcdGNvbnN0IHtwYXRoLCBuYW1lfSA9IF9wYXJzZVJlcXVpcmUobGluZS5oZWFkKCkpXG5cdFx0XHRpZiAodXNlS2V5d29yZEtpbmQgPT09IEtXX1VzZURvKSB7XG5cdFx0XHRcdGlmIChsaW5lLnNpemUoKSA+IDEpXG5cdFx0XHRcdFx0dW5leHBlY3RlZChsaW5lLnNlY29uZCgpKVxuXHRcdFx0XHR1c2VzLnB1c2gobmV3IFVzZURvKGxpbmUubG9jLCBwYXRoKSlcblx0XHRcdH0gZWxzZVxuXHRcdFx0XHRpZiAocGF0aCA9PT0gJ2dsb2JhbCcpIHtcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKG9wVXNlR2xvYmFsID09PSBudWxsLCBsaW5lLmxvYywgJ0NhblxcJ3QgdXNlIGdsb2JhbCB0d2ljZScpXG5cdFx0XHRcdFx0Y29uc3Qge3VzZWQsIG9wVXNlRGVmYXVsdH0gPSBfcGFyc2VUaGluZ3NVc2VkKG5hbWUsIGZhbHNlLCBsaW5lLnRhaWwoKSlcblx0XHRcdFx0XHRvcFVzZUdsb2JhbCA9IG5ldyBVc2VHbG9iYWwobGluZS5sb2MsIHVzZWQsIG9wVXNlRGVmYXVsdClcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBpc0xhenkgPSB1c2VLZXl3b3JkS2luZCA9PT0gS1dfVXNlTGF6eSB8fCB1c2VLZXl3b3JkS2luZCA9PT0gS1dfVXNlRGVidWdcblx0XHRcdFx0XHRjb25zdCB7dXNlZCwgb3BVc2VEZWZhdWx0fSA9IF9wYXJzZVRoaW5nc1VzZWQobmFtZSwgaXNMYXp5LCBsaW5lLnRhaWwoKSlcblx0XHRcdFx0XHR1c2VzLnB1c2gobmV3IFVzZShsaW5lLmxvYywgcGF0aCwgdXNlZCwgb3BVc2VEZWZhdWx0KSlcblx0XHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7dXNlcywgb3BVc2VHbG9iYWx9XG5cdH0sXG5cdF9wYXJzZVRoaW5nc1VzZWQgPSAobmFtZSwgaXNMYXp5LCB0b2tlbnMpID0+IHtcblx0XHRjb25zdCB1c2VEZWZhdWx0ID0gKCkgPT4gTG9jYWxEZWNsYXJlLnVudHlwZWQodG9rZW5zLmxvYywgbmFtZSwgaXNMYXp5ID8gTERfTGF6eSA6IExEX0NvbnN0KVxuXHRcdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdFx0cmV0dXJuIHt1c2VkOiBbXSwgb3BVc2VEZWZhdWx0OiB1c2VEZWZhdWx0KCl9XG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBbb3BVc2VEZWZhdWx0LCByZXN0XSA9XG5cdFx0XHRcdGlzS2V5d29yZChLV19Gb2N1cywgdG9rZW5zLmhlYWQoKSkgPyBbdXNlRGVmYXVsdCgpLCB0b2tlbnMudGFpbCgpXSA6IFtudWxsLCB0b2tlbnNdXG5cdFx0XHRjb25zdCB1c2VkID0gcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKHJlc3QpLm1hcChsID0+IHtcblx0XHRcdFx0Y29udGV4dC5jaGVjayhsLm5hbWUgIT09ICdfJywgbC5wb3MsXG5cdFx0XHRcdFx0KCkgPT4gYCR7Y29kZSgnXycpfSBub3QgYWxsb3dlZCBhcyBpbXBvcnQgbmFtZS5gKVxuXHRcdFx0XHRpZiAoaXNMYXp5KVxuXHRcdFx0XHRcdGwua2luZCA9IExEX0xhenlcblx0XHRcdFx0cmV0dXJuIGxcblx0XHRcdH0pXG5cdFx0XHRyZXR1cm4ge3VzZWQsIG9wVXNlRGVmYXVsdH1cblx0XHR9XG5cdH0sXG5cdF9wYXJzZVJlcXVpcmUgPSB0ID0+IHtcblx0XHRpZiAodCBpbnN0YW5jZW9mIE5hbWUpXG5cdFx0XHRyZXR1cm4ge3BhdGg6IHQubmFtZSwgbmFtZTogdC5uYW1lfVxuXHRcdGVsc2UgaWYgKHQgaW5zdGFuY2VvZiBEb3ROYW1lKVxuXHRcdFx0cmV0dXJuIHtwYXRoOiBjYXQoX3BhcnRzRnJvbURvdE5hbWUodCksIHQubmFtZSkuam9pbignLycpLCBuYW1lOiB0Lm5hbWV9XG5cdFx0ZWxzZSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKGlzR3JvdXAoR19TcGFjZSwgdCksIHQubG9jLCAnTm90IGEgdmFsaWQgbW9kdWxlIG5hbWUuJylcblx0XHRcdHJldHVybiBfcGFyc2VTcGFjZWRSZXF1aXJlKFNsaWNlLmdyb3VwKHQpKVxuXHRcdH1cblx0fSxcblx0X3BhcnNlU3BhY2VkUmVxdWlyZSA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgZmlyc3QgPSB0b2tlbnMuaGVhZCgpXG5cdFx0bGV0IHBhcnRzXG5cdFx0aWYgKGZpcnN0IGluc3RhbmNlb2YgRG90TmFtZSlcblx0XHRcdHBhcnRzID0gX3BhcnRzRnJvbURvdE5hbWUoZmlyc3QpXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKGZpcnN0IGluc3RhbmNlb2YgTmFtZSwgZmlyc3QubG9jLCAnTm90IGEgdmFsaWQgcGFydCBvZiBtb2R1bGUgcGF0aC4nKVxuXHRcdFx0cGFydHMgPSBbXVxuXHRcdH1cblx0XHRwYXJ0cy5wdXNoKGZpcnN0Lm5hbWUpXG5cdFx0Zm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMudGFpbCgpKSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKHRva2VuIGluc3RhbmNlb2YgRG90TmFtZSAmJiB0b2tlbi5uRG90cyA9PT0gMSwgdG9rZW4ubG9jLFxuXHRcdFx0XHQnTm90IGEgdmFsaWQgcGFydCBvZiBtb2R1bGUgcGF0aC4nKVxuXHRcdFx0cGFydHMucHVzaCh0b2tlbi5uYW1lKVxuXHRcdH1cblx0XHRyZXR1cm4ge3BhdGg6IHBhcnRzLmpvaW4oJy8nKSwgbmFtZTogdG9rZW5zLmxhc3QoKS5uYW1lfVxuXHR9LFxuXHRfcGFydHNGcm9tRG90TmFtZSA9IGRvdE5hbWUgPT5cblx0XHRkb3ROYW1lLm5Eb3RzID09PSAxID8gWycuJ10gOiByZXBlYXQoJy4uJywgZG90TmFtZS5uRG90cyAtIDEpXG5cbmNvbnN0XG5cdF9wYXJzZUZvciA9IGN0ciA9PiB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0XHRyZXR1cm4gbmV3IGN0cih0b2tlbnMubG9jLCBfcGFyc2VPcEl0ZXJhdGVlKGJlZm9yZSksIHBhcnNlQmxvY2tEbyhibG9jaykpXG5cdH0sXG5cdF9wYXJzZU9wSXRlcmF0ZWUgPSB0b2tlbnMgPT5cblx0XHRvcElmKCF0b2tlbnMuaXNFbXB0eSgpLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBbZWxlbWVudCwgYmFnXSA9XG5cdFx0XHRcdGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2VXaGVyZShfID0+IGlzS2V5d29yZChLV19JbiwgXykpLFxuXHRcdFx0XHRcdCh7YmVmb3JlLCBhZnRlcn0pID0+IHtcblx0XHRcdFx0XHRcdGNvbnRleHQuY2hlY2soYmVmb3JlLnNpemUoKSA9PT0gMSwgYmVmb3JlLmxvYywgJ1RPRE86IHBhdHRlcm4gaW4gZm9yJylcblx0XHRcdFx0XHRcdHJldHVybiBbcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKGJlZm9yZSlbMF0sIHBhcnNlRXhwcihhZnRlcildXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQoKSA9PiBbbmV3IExvY2FsRGVjbGFyZUZvY3VzKHRva2Vucy5sb2MpLCBwYXJzZUV4cHIodG9rZW5zKV0pXG5cdFx0XHRyZXR1cm4gbmV3IEl0ZXJhdGVlKHRva2Vucy5sb2MsIGVsZW1lbnQsIGJhZylcblx0XHR9KVxuY29uc3Rcblx0cGFyc2VGb3JEbyA9IF9wYXJzZUZvcihGb3JEbyksXG5cdHBhcnNlRm9yVmFsID0gX3BhcnNlRm9yKEZvclZhbCksXG5cdC8vIFRPRE86IC0+IG91dC10eXBlXG5cdHBhcnNlRm9yQmFnID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBbYmVmb3JlLCBsaW5lc10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdFx0Y29uc3QgYmxvY2sgPSBwYXJzZUJsb2NrRG8obGluZXMpXG5cdFx0Ly8gVE9ETzogQmV0dGVyIHdheT9cblx0XHRpZiAoYmxvY2subGluZXMubGVuZ3RoID09PSAxICYmIGJsb2NrLmxpbmVzWzBdIGluc3RhbmNlb2YgVmFsKVxuXHRcdFx0YmxvY2subGluZXNbMF0gPSBuZXcgQmFnRW50cnkoYmxvY2subGluZXNbMF0ubG9jLCBibG9jay5saW5lc1swXSlcblx0XHRyZXR1cm4gRm9yQmFnLm9mKHRva2Vucy5sb2MsIF9wYXJzZU9wSXRlcmF0ZWUoYmVmb3JlKSwgYmxvY2spXG5cdH1cblxuXG5jb25zdFxuXHRwYXJzZUV4Y2VwdCA9IChrd0V4Y2VwdCwgdG9rZW5zKSA9PiB7XG5cdFx0Y29uc3Rcblx0XHRcdGlzVmFsID0ga3dFeGNlcHQgPT09IEtXX0V4Y2VwdFZhbCxcblx0XHRcdGp1c3REb1ZhbEJsb2NrID0gaXNWYWwgPyBqdXN0QmxvY2tWYWwgOiBqdXN0QmxvY2tEbyxcblx0XHRcdHBhcnNlQmxvY2sgPSBpc1ZhbCA/IHBhcnNlQmxvY2tWYWwgOiBwYXJzZUJsb2NrRG8sXG5cdFx0XHRFeGNlcHQgPSBpc1ZhbCA/IEV4Y2VwdFZhbCA6IEV4Y2VwdERvLFxuXHRcdFx0a3dUcnkgPSBpc1ZhbCA/IEtXX1RyeVZhbCA6IEtXX1RyeURvLFxuXHRcdFx0a3dDYXRjaCA9IGlzVmFsID8gS1dfQ2F0Y2hWYWwgOiBLV19DYXRjaERvLFxuXHRcdFx0bmFtZVRyeSA9ICgpID0+IGNvZGUoa2V5d29yZE5hbWUoa3dUcnkpKSxcblx0XHRcdG5hbWVDYXRjaCA9ICgpID0+IGNvZGUoa2V5d29yZE5hbWUoa3dDYXRjaCkpLFxuXHRcdFx0bmFtZUZpbmFsbHkgPSAoKSA9PiBjb2RlKGtleXdvcmROYW1lKEtXX0ZpbmFsbHkpKVxuXG5cdFx0Y29uc3QgbGluZXMgPSBqdXN0QmxvY2soa3dFeGNlcHQsIHRva2VucylcblxuXHRcdC8vIGB0cnlgICptdXN0KiBjb21lIGZpcnN0LlxuXHRcdGNvbnN0IGZpcnN0TGluZSA9IGxpbmVzLmhlYWRTbGljZSgpXG5cdFx0Y29uc3QgdG9rZW5UcnkgPSBmaXJzdExpbmUuaGVhZCgpXG5cdFx0Y29udGV4dC5jaGVjayhpc0tleXdvcmQoa3dUcnksIHRva2VuVHJ5KSwgdG9rZW5UcnkubG9jLCAoKSA9PlxuXHRcdFx0YE11c3Qgc3RhcnQgd2l0aCAke25hbWVUcnkoKX1gKVxuXHRcdGNvbnN0IF90cnkgPSBqdXN0RG9WYWxCbG9jayhrd1RyeSwgZmlyc3RMaW5lLnRhaWwoKSlcblxuXHRcdGNvbnN0IHJlc3RMaW5lcyA9IGxpbmVzLnRhaWwoKVxuXHRcdGNoZWNrTm9uRW1wdHkocmVzdExpbmVzLCAoKSA9PlxuXHRcdFx0YE11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgb2YgJHtuYW1lQ2F0Y2goKX0gb3IgJHtuYW1lRmluYWxseSgpfWApXG5cblx0XHRjb25zdCBoYW5kbGVGaW5hbGx5ID0gcmVzdExpbmVzID0+IHtcblx0XHRcdGNvbnN0IGxpbmUgPSByZXN0TGluZXMuaGVhZFNsaWNlKClcblx0XHRcdGNvbnN0IHRva2VuRmluYWxseSA9IGxpbmUuaGVhZCgpXG5cdFx0XHRjb250ZXh0LmNoZWNrKGlzS2V5d29yZChLV19GaW5hbGx5LCB0b2tlbkZpbmFsbHkpLCB0b2tlbkZpbmFsbHkubG9jLCAoKSA9PlxuXHRcdFx0XHRgRXhwZWN0ZWQgJHtuYW1lRmluYWxseSgpfWApXG5cdFx0XHRjb250ZXh0LmNoZWNrKHJlc3RMaW5lcy5zaXplKCkgPT09IDEsIHJlc3RMaW5lcy5sb2MsICgpID0+XG5cdFx0XHRcdGBOb3RoaW5nIGlzIGFsbG93ZWQgdG8gY29tZSBhZnRlciAke25hbWVGaW5hbGx5KCl9LmApXG5cdFx0XHRyZXR1cm4ganVzdEJsb2NrRG8oS1dfRmluYWxseSwgbGluZS50YWlsKCkpXG5cdFx0fVxuXG5cdFx0bGV0IF9jYXRjaCwgX2ZpbmFsbHlcblxuXHRcdGNvbnN0IGxpbmUyID0gcmVzdExpbmVzLmhlYWRTbGljZSgpXG5cdFx0Y29uc3QgaGVhZDIgPSBsaW5lMi5oZWFkKClcblx0XHRpZiAoaXNLZXl3b3JkKGt3Q2F0Y2gsIGhlYWQyKSkge1xuXHRcdFx0Y29uc3QgW2JlZm9yZTIsIGJsb2NrMl0gPSBiZWZvcmVBbmRCbG9jayhsaW5lMi50YWlsKCkpXG5cdFx0XHRjb25zdCBjYXVnaHQgPSBfcGFyc2VPbmVMb2NhbERlY2xhcmVPckZvY3VzKGJlZm9yZTIpXG5cdFx0XHRfY2F0Y2ggPSBuZXcgQ2F0Y2gobGluZTIubG9jLCBjYXVnaHQsIHBhcnNlQmxvY2soYmxvY2syKSlcblx0XHRcdF9maW5hbGx5ID0gb3BJZihyZXN0TGluZXMuc2l6ZSgpID4gMSwgKCkgPT4gaGFuZGxlRmluYWxseShyZXN0TGluZXMudGFpbCgpKSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0X2NhdGNoID0gbnVsbFxuXHRcdFx0X2ZpbmFsbHkgPSBoYW5kbGVGaW5hbGx5KHJlc3RMaW5lcylcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3IEV4Y2VwdCh0b2tlbnMubG9jLCBfdHJ5LCBfY2F0Y2gsIF9maW5hbGx5KVxuXHR9LFxuXHRfcGFyc2VPbmVMb2NhbERlY2xhcmVPckZvY3VzID0gdG9rZW5zID0+IHtcblx0XHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRcdHJldHVybiBuZXcgTG9jYWxEZWNsYXJlRm9jdXModG9rZW5zLmxvYylcblx0XHRlbHNlIHtcblx0XHRcdGNvbnRleHQuY2hlY2sodG9rZW5zLnNpemUoKSA9PT0gMSwgJ0V4cGVjdGVkIG9ubHkgb25lIGxvY2FsIGRlY2xhcmUuJylcblx0XHRcdHJldHVybiBwYXJzZUxvY2FsRGVjbGFyZXModG9rZW5zKVswXVxuXHRcdH1cblx0fVxuXG5jb25zdCBwYXJzZUFzc2VydCA9IChuZWdhdGUsIHRva2VucykgPT4ge1xuXHRjaGVja05vbkVtcHR5KHRva2VucywgKCkgPT4gYEV4cGVjdGVkIHNvbWV0aGluZyBhZnRlciAke2tleXdvcmROYW1lKEtXX0Fzc2VydCl9LmApXG5cblx0Y29uc3QgW2NvbmRUb2tlbnMsIG9wVGhyb3duXSA9XG5cdFx0aWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZVdoZXJlKF8gPT4gaXNLZXl3b3JkKEtXX1Rocm93LCBfKSksXG5cdFx0XHQoe2JlZm9yZSwgYWZ0ZXJ9KSA9PiBbYmVmb3JlLCBwYXJzZUV4cHIoYWZ0ZXIpXSxcblx0XHRcdCgpID0+IFt0b2tlbnMsIG51bGxdKVxuXG5cdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHMoY29uZFRva2Vucylcblx0Y29uc3QgY29uZCA9IHBhcnRzLmxlbmd0aCA9PT0gMSA/IHBhcnRzWzBdIDogbmV3IENhbGwoY29uZFRva2Vucy5sb2MsIHBhcnRzWzBdLCB0YWlsKHBhcnRzKSlcblx0cmV0dXJuIG5ldyBBc3NlcnQodG9rZW5zLmxvYywgbmVnYXRlLCBjb25kLCBvcFRocm93bilcbn1cblxuY29uc3QgcGFyc2VDbGFzcyA9IHRva2VucyA9PiB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0Y29uc3Qgb3BFeHRlbmRlZCA9IG9wSWYoIWJlZm9yZS5pc0VtcHR5KCksICgpID0+IHBhcnNlRXhwcihiZWZvcmUpKVxuXG5cdGxldCBvcERvID0gbnVsbCwgc3RhdGljcyA9IFtdLCBvcENvbnN0cnVjdG9yID0gbnVsbCwgbWV0aG9kcyA9IFtdXG5cblx0bGV0IFtvcENvbW1lbnQsIHJlc3RdID0gdHJ5VGFrZUNvbW1lbnQoYmxvY2spXG5cblx0Y29uc3QgbGluZTEgPSByZXN0LmhlYWRTbGljZSgpXG5cdGlmIChpc0tleXdvcmQoS1dfRG8sIGxpbmUxLmhlYWQoKSkpIHtcblx0XHRjb25zdCBkb25lID0ganVzdEJsb2NrRG8oS1dfRG8sIGxpbmUxLnRhaWwoKSlcblx0XHRvcERvID0gbmV3IENsYXNzRG8obGluZTEubG9jLCBuZXcgTG9jYWxEZWNsYXJlRm9jdXMobGluZTEubG9jKSwgZG9uZSlcblx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0fVxuXHRpZiAoIXJlc3QuaXNFbXB0eSgpKSB7XG5cdFx0Y29uc3QgbGluZTIgPSByZXN0LmhlYWRTbGljZSgpXG5cdFx0aWYgKGlzS2V5d29yZChLV19TdGF0aWMsIGxpbmUyLmhlYWQoKSkpIHtcblx0XHRcdHN0YXRpY3MgPSBfcGFyc2VTdGF0aWNzKGxpbmUyLnRhaWwoKSlcblx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdH1cblx0XHRpZiAoIXJlc3QuaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCBsaW5lMyA9IHJlc3QuaGVhZFNsaWNlKClcblx0XHRcdGlmIChpc0tleXdvcmQoS1dfQ29uc3RydWN0LCBsaW5lMy5oZWFkKCkpKSB7XG5cdFx0XHRcdG9wQ29uc3RydWN0b3IgPSBfcGFyc2VDb25zdHJ1Y3RvcihsaW5lMy50YWlsKCkpXG5cdFx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdFx0fVxuXHRcdFx0bWV0aG9kcyA9IF9wYXJzZU1ldGhvZHMocmVzdClcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gbmV3IENsYXNzKHRva2Vucy5sb2MsIG9wRXh0ZW5kZWQsIG9wQ29tbWVudCwgb3BEbywgc3RhdGljcywgb3BDb25zdHJ1Y3RvciwgbWV0aG9kcylcbn1cblxuY29uc3Rcblx0X3BhcnNlQ29uc3RydWN0b3IgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IHthcmdzLCBtZW1iZXJBcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBvcEluLCBvcE91dH0gPVxuXHRcdFx0X2Z1bkFyZ3NBbmRCbG9jayh0cnVlLCB0b2tlbnMsIHRydWUpXG5cdFx0Y29uc3QgaXNHZW5lcmF0b3IgPSBmYWxzZSwgb3BEZWNsYXJlUmVzID0gbnVsbFxuXHRcdGNvbnN0IGZ1biA9IG5ldyBGdW4odG9rZW5zLmxvYyxcblx0XHRcdG5ldyBMb2NhbERlY2xhcmVUaGlzKHRva2Vucy5sb2MpLFxuXHRcdFx0aXNHZW5lcmF0b3IsXG5cdFx0XHRhcmdzLCBvcFJlc3RBcmcsXG5cdFx0XHRibG9jaywgb3BJbiwgb3BEZWNsYXJlUmVzLCBvcE91dClcblx0XHRyZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRva2Vucy5sb2MsIGZ1biwgbWVtYmVyQXJncylcblx0fSxcblx0X3BhcnNlU3RhdGljcyA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgYmxvY2sgPSBqdXN0QmxvY2soS1dfU3RhdGljLCB0b2tlbnMpXG5cdFx0cmV0dXJuIF9wYXJzZU1ldGhvZHMoYmxvY2spXG5cdH0sXG5cdF9wYXJzZU1ldGhvZHMgPSB0b2tlbnMgPT4gdG9rZW5zLm1hcFNsaWNlcyhfcGFyc2VNZXRob2QpLFxuXHRfcGFyc2VNZXRob2QgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGhlYWQgPSB0b2tlbnMuaGVhZCgpXG5cblx0XHRpZiAoaXNLZXl3b3JkKEtXX0dldCwgaGVhZCkpIHtcblx0XHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucy50YWlsKCkpXG5cdFx0XHRyZXR1cm4gbmV3IE1ldGhvZEdldHRlcih0b2tlbnMubG9jLCBfcGFyc2VFeHByT3JTdHJMaXQoYmVmb3JlKSwgcGFyc2VCbG9ja1ZhbChibG9jaykpXG5cdFx0fSBlbHNlIGlmIChpc0tleXdvcmQoS1dfU2V0LCBoZWFkKSkge1xuXHRcdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zLnRhaWwoKSlcblx0XHRcdHJldHVybiBuZXcgTWV0aG9kU2V0dGVyKHRva2Vucy5sb2MsIF9wYXJzZUV4cHJPclN0ckxpdChiZWZvcmUpLCBwYXJzZUJsb2NrRG8oYmxvY2spKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBiYWEgPSB0b2tlbnMub3BTcGxpdE9uY2VXaGVyZShfaXNGdW5LZXl3b3JkKVxuXHRcdFx0Y29udGV4dC5jaGVjayhiYWEgIT09IG51bGwsIHRva2Vucy5sb2MsICdFeHBlY3RlZCBhIGZ1bmN0aW9uIGtleXdvcmQgc29tZXdoZXJlLicpXG5cdFx0XHRjb25zdCB7YmVmb3JlLCBhdCwgYWZ0ZXJ9ID0gYmFhXG5cdFx0XHRjb25zdCBmdW4gPSBwYXJzZUZ1bihfbWV0aG9kRnVuS2luZChhdCksIGFmdGVyKVxuXHRcdFx0cmV0dXJuIG5ldyBNZXRob2RJbXBsKHRva2Vucy5sb2MsIF9wYXJzZUV4cHJPclN0ckxpdChiZWZvcmUpLCBmdW4pXG5cdFx0fVxuXHR9LFxuXHQvLyBJZiBzeW1ib2wgaXMganVzdCBhIGxpdGVyYWwgc3RyaW5nLCBzdG9yZSBpdCBhcyBhIHN0cmluZywgd2hpY2ggaXMgaGFuZGxlZCBzcGVjaWFsbHkuXG5cdF9wYXJzZUV4cHJPclN0ckxpdCA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgZXhwciA9IHBhcnNlRXhwcih0b2tlbnMpXG5cdFx0Y29uc3QgaXNTdHJMaXQgPSBleHByIGluc3RhbmNlb2YgUXVvdGUgJiZcblx0XHRcdGV4cHIucGFydHMubGVuZ3RoID09PSAxICYmXG5cdFx0XHR0eXBlb2YgZXhwci5wYXJ0c1swXSA9PT0gJ3N0cmluZydcblx0XHRyZXR1cm4gaXNTdHJMaXQgPyBleHByLnBhcnRzWzBdIDogZXhwclxuXHR9LFxuXHRfbWV0aG9kRnVuS2luZCA9IGZ1bktpbmRUb2tlbiA9PiB7XG5cdFx0c3dpdGNoIChmdW5LaW5kVG9rZW4ua2luZCkge1xuXHRcdFx0Y2FzZSBLV19GdW46IHJldHVybiBLV19GdW5UaGlzXG5cdFx0XHRjYXNlIEtXX0Z1bkRvOiByZXR1cm4gS1dfRnVuVGhpc0RvXG5cdFx0XHRjYXNlIEtXX0Z1bkdlbjogcmV0dXJuIEtXX0Z1blRoaXNHZW5cblx0XHRcdGNhc2UgS1dfRnVuR2VuRG86IHJldHVybiBLV19GdW5UaGlzR2VuRG9cblx0XHRcdGNhc2UgS1dfRnVuVGhpczogY2FzZSBLV19GdW5UaGlzRG86IGNhc2UgS1dfRnVuVGhpc0dlbjogY2FzZSBLV19GdW5UaGlzR2VuRG86XG5cdFx0XHRcdGNvbnRleHQuZmFpbChmdW5LaW5kVG9rZW4ubG9jLCAnRnVuY3Rpb24gYC5gIGlzIGltcGxpY2l0IGZvciBtZXRob2RzLicpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRjb250ZXh0LmZhaWwoZnVuS2luZFRva2VuLmxvYywgYEV4cGVjdGVkIGZ1bmN0aW9uIGtpbmQsIGdvdCAke2Z1bktpbmRUb2tlbn1gKVxuXHRcdH1cblx0fSxcblx0X2lzRnVuS2V5d29yZCA9IGZ1bktpbmRUb2tlbiA9PiB7XG5cdFx0aWYgKGZ1bktpbmRUb2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0XHRzd2l0Y2ggKGZ1bktpbmRUb2tlbi5raW5kKSB7XG5cdFx0XHRcdGNhc2UgS1dfRnVuOiBjYXNlIEtXX0Z1bkRvOiBjYXNlIEtXX0Z1bkdlbjogY2FzZSBLV19GdW5HZW5Ebzpcblx0XHRcdFx0Y2FzZSBLV19GdW5UaGlzOiBjYXNlIEtXX0Z1blRoaXNEbzogY2FzZSBLV19GdW5UaGlzR2VuOlxuXHRcdFx0XHRjYXNlIEtXX0Z1blRoaXNHZW5Ebzpcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0fVxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBmYWxzZVxuXHR9XG5cbmNvbnN0IHBhcnNlUXVvdGUgPSB0b2tlbnMgPT5cblx0bmV3IFF1b3RlKHRva2Vucy5sb2MsIHRva2Vucy5tYXAoXyA9PiB0eXBlb2YgXyA9PT0gJ3N0cmluZycgPyBfIDogcGFyc2VTaW5nbGUoXykpKVxuXG5jb25zdCBwYXJzZVdpdGggPSB0b2tlbnMgPT4ge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cblx0Y29uc3QgW3ZhbCwgZGVjbGFyZV0gPSBpZkVsc2UoYmVmb3JlLm9wU3BsaXRPbmNlV2hlcmUoXyA9PiBpc0tleXdvcmQoS1dfQXMsIF8pKSxcblx0XHQoe2JlZm9yZSwgYWZ0ZXJ9KSA9PiB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKGFmdGVyLnNpemUoKSA9PT0gMSwgKCkgPT4gYEV4cGVjdGVkIG9ubHkgMSB0b2tlbiBhZnRlciAke2NvZGUoJ2FzJyl9LmApXG5cdFx0XHRyZXR1cm4gW3BhcnNlRXhwclBsYWluKGJlZm9yZSksIHBhcnNlTG9jYWxEZWNsYXJlKGFmdGVyLmhlYWQoKSldXG5cdFx0fSxcblx0XHQoKSA9PiBbcGFyc2VFeHByUGxhaW4oYmVmb3JlKSwgbmV3IExvY2FsRGVjbGFyZUZvY3VzKHRva2Vucy5sb2MpXSlcblxuXHRyZXR1cm4gbmV3IFdpdGgodG9rZW5zLmxvYywgZGVjbGFyZSwgdmFsLCBwYXJzZUJsb2NrRG8oYmxvY2spKVxufVxuXG5jb25zdCBwYXJzZUlnbm9yZSA9IHRva2VucyA9PiB7XG5cdGNvbnN0IGlnbm9yZWQgPSB0b2tlbnMubWFwKF8gPT4ge1xuXHRcdGlmIChpc0tleXdvcmQoS1dfRm9jdXMsIF8pKVxuXHRcdFx0cmV0dXJuICdfJ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29udGV4dC5jaGVjayhfIGluc3RhbmNlb2YgTmFtZSwgXy5sb2MsICgpID0+IGBFeHBlY3RlZCBsb2NhbCBuYW1lLCBub3QgJHtffS5gKVxuXHRcdFx0cmV0dXJuIF8ubmFtZVxuXHRcdH1cblx0fSlcblx0cmV0dXJuIG5ldyBJZ25vcmUodG9rZW5zLmxvYywgaWdub3JlZClcbn1cblxuY29uc3QgcGFyc2VDb25kID0gdG9rZW5zID0+IHtcblx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyh0b2tlbnMpXG5cdGNvbnRleHQuY2hlY2socGFydHMubGVuZ3RoID09PSAzLCB0b2tlbnMubG9jLCAoKSA9PlxuXHRcdGAke2NvZGUoJ2NvbmQnKX0gdGFrZXMgZXhhY3RseSAzIGFyZ3VtZW50cy5gKVxuXHRyZXR1cm4gbmV3IENvbmQodG9rZW5zLmxvYywgcGFydHNbMF0sIHBhcnRzWzFdLCBwYXJ0c1syXSlcbn1cblxuY29uc3QgdHJ5VGFrZUNvbW1lbnQgPSBsaW5lcyA9PiB7XG5cdGxldCBjb21tZW50cyA9IFtdXG5cdGxldCByZXN0ID0gbGluZXNcblxuXHR3aGlsZSAodHJ1ZSkge1xuXHRcdGlmIChyZXN0LmlzRW1wdHkoKSlcblx0XHRcdGJyZWFrXG5cblx0XHRjb25zdCBocyA9IHJlc3QuaGVhZFNsaWNlKClcblx0XHRjb25zdCBoID0gaHMuaGVhZCgpXG5cdFx0aWYgKCEoaCBpbnN0YW5jZW9mIERvY0NvbW1lbnQpKVxuXHRcdFx0YnJlYWtcblxuXHRcdGFzc2VydChocy5zaXplKCkgPT09IDEpXG5cdFx0Y29tbWVudHMucHVzaChoKVxuXHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHR9XG5cblx0cmV0dXJuIFtpc0VtcHR5KGNvbW1lbnRzKSA/IG51bGwgOiBjb21tZW50cy5tYXAoXyA9PiBfLnRleHQpLmpvaW4oJ1xcbicpLCByZXN0XVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

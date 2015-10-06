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

		// Import statements must appear in order.

		var _tryParseImports = tryParseImports(_Token.KW_ImportDo, rest0);

		const doImports = _tryParseImports.imports;
		const rest1 = _tryParseImports.rest;

		var _tryParseImports2 = tryParseImports(_Token.KW_Import, rest1);

		const plainImports = _tryParseImports2.imports;
		const opImportGlobal = _tryParseImports2.opImportGlobal;
		const rest2 = _tryParseImports2.rest;

		var _tryParseImports3 = tryParseImports(_Token.KW_ImportLazy, rest2);

		const lazyImports = _tryParseImports3.imports;
		const rest3 = _tryParseImports3.rest;

		var _tryParseImports4 = tryParseImports(_Token.KW_ImportDebug, rest3);

		const debugImports = _tryParseImports4.imports;
		const rest4 = _tryParseImports4.rest;

		const lines = parseModuleBlock(rest4);

		if (context.opts.includeModuleName()) {
			const name = new _MsAst.LocalDeclareName(tokens.loc);
			const assign = new _MsAst.AssignSingle(tokens.loc, name, _MsAst.Quote.forString(tokens.loc, context.opts.moduleName()));
			lines.push(new _MsAst.ModuleExportNamed(tokens.loc, assign));
		}

		const imports = plainImports.concat(lazyImports);
		return new _MsAst.Module(tokens.loc, opComment, doImports, imports, opImportGlobal, debugImports, lines);
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

	const tryParseImports = (importKeywordKind, tokens) => {
		if (!tokens.isEmpty()) {
			const line0 = tokens.headSlice();
			if ((0, _Token.isKeyword)(importKeywordKind, line0.head())) {
				var _parseImports2 = _parseImports(importKeywordKind, line0.tail());

				const imports = _parseImports2.imports;
				const opImportGlobal = _parseImports2.opImportGlobal;

				if (new Set([_Token.KW_ImportDo, _Token.KW_ImportLazy, _Token.KW_ImportDebug]).has(importKeywordKind)) context.check(opImportGlobal === null, line0.loc, 'Can\'t use global here.');
				return { imports, opImportGlobal, rest: tokens.tail() };
			}
		}
		return { imports: [], opImportGlobal: null, rest: tokens };
	};

	// tryParseImports privates
	const _parseImports = (importKeywordKind, tokens) => {
		const lines = justBlock(importKeywordKind, tokens);
		let opImportGlobal = null;

		const imports = [];

		for (const line of lines.slices()) {
			var _parseRequire2 = _parseRequire(line.head());

			const path = _parseRequire2.path;
			const name = _parseRequire2.name;

			if (importKeywordKind === _Token.KW_ImportDo) {
				if (line.size() > 1) unexpected(line.second());
				imports.push(new _MsAst.ImportDo(line.loc, path));
			} else if (path === 'global') {
				context.check(opImportGlobal === null, line.loc, 'Can\'t use global twice');

				var _parseThingsImported2 = _parseThingsImported(name, false, line.tail());

				const imported = _parseThingsImported2.imported;
				const opImportDefault = _parseThingsImported2.opImportDefault;

				opImportGlobal = new _MsAst.ImportGlobal(line.loc, imported, opImportDefault);
			} else {
				const isLazy = importKeywordKind === _Token.KW_ImportLazy || importKeywordKind === _Token.KW_ImportDebug;

				var _parseThingsImported3 = _parseThingsImported(name, isLazy, line.tail());

				const imported = _parseThingsImported3.imported;
				const opImportDefault = _parseThingsImported3.opImportDefault;

				imports.push(new _MsAst.Import(line.loc, path, imported, opImportDefault));
			}
		}

		return { imports, opImportGlobal };
	},
	      _parseThingsImported = (name, isLazy, tokens) => {
		const importDefault = () => _MsAst.LocalDeclare.untyped(tokens.loc, name, isLazy ? _MsAst.LD_Lazy : _MsAst.LD_Const);
		if (tokens.isEmpty()) return { imported: [], opImportDefault: importDefault() };else {
			var _ref7 = (0, _Token.isKeyword)(_Token.KW_Focus, tokens.head()) ? [importDefault(), tokens.tail()] : [null, tokens];

			var _ref72 = _slicedToArray(_ref7, 2);

			const opImportDefault = _ref72[0];
			const rest = _ref72[1];

			const imported = parseLocalDeclaresJustNames(rest).map(l => {
				context.check(l.name !== '_', l.pos, () => `${ (0, _CompileError.code)('_') } not allowed as import name.`);
				if (isLazy) l.kind = _MsAst.LD_Lazy;
				return l;
			});
			return { imported, opImportDefault };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7OztBQytCQSxLQUFJLE9BQU8sQ0FBQTs7Ozs7Ozs7Ozs7OztrQkFZSSxDQUFDLFFBQVEsRUFBRSxTQUFTLEtBQUs7QUFDdkMsU0FBTyxHQUFHLFFBQVEsQ0FBQTtBQUNsQixRQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsZ0JBQU0sS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7O0FBRWpELFNBQU8sR0FBRyxTQUFTLENBQUE7QUFDbkIsU0FBTyxLQUFLLENBQUE7RUFDWjs7QUFFRCxPQUNDLFVBQVUsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLEtBQzVCLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDO09BQ3JELGFBQWEsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLEtBQy9CLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUM7T0FDdEQsVUFBVSxHQUFHLEtBQUssSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLEdBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFBOztBQUVyRSxPQUFNLFdBQVcsR0FBRyxNQUFNLElBQUk7Ozt3QkFFRixjQUFjLENBQUMsTUFBTSxDQUFDOzs7O1FBQTFDLFNBQVM7UUFBRSxLQUFLOzs7O3lCQUVtQixlQUFlLFFBdkN6QyxXQUFXLEVBdUM0QyxLQUFLLENBQUM7O1FBQTdELFNBQVMsb0JBQWxCLE9BQU87UUFBbUIsS0FBSyxvQkFBWCxJQUFJOzswQkFDOEIsZUFBZSxRQXpDSyxTQUFTLEVBeUNGLEtBQUssQ0FBQzs7UUFBOUUsWUFBWSxxQkFBckIsT0FBTztRQUFnQixjQUFjLHFCQUFkLGNBQWM7UUFBUSxLQUFLLHFCQUFYLElBQUk7OzBCQUNOLGVBQWUsUUF6QzlCLGFBQWEsRUF5Q2lDLEtBQUssQ0FBQzs7UUFBakUsV0FBVyxxQkFBcEIsT0FBTztRQUFxQixLQUFLLHFCQUFYLElBQUk7OzBCQUNZLGVBQWUsUUExQzVELGNBQWMsRUEwQytELEtBQUssQ0FBQzs7UUFBbkUsWUFBWSxxQkFBckIsT0FBTztRQUFzQixLQUFLLHFCQUFYLElBQUk7O0FBRWxDLFFBQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFBOztBQUVyQyxNQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsRUFBRTtBQUNyQyxTQUFNLElBQUksR0FBRyxXQS9EcUQsZ0JBQWdCLENBK0RoRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDN0MsU0FBTSxNQUFNLEdBQUcsV0FyRWtCLFlBQVksQ0FxRWIsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQy9DLE9BN0QyQixLQUFLLENBNkQxQixTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUN4RCxRQUFLLENBQUMsSUFBSSxDQUFDLFdBaEV5RCxpQkFBaUIsQ0FnRXBELE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQTtHQUNyRDs7QUFFRCxRQUFNLE9BQU8sR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ2hELFNBQU8sV0FwRWlDLE1BQU0sQ0FxRTdDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQTtFQUNoRixDQUFBOzs7QUFHRDs7QUFFQyxlQUFjLEdBQUcsTUFBTSxJQUFJO0FBQzFCLGVBQWEsQ0FBQyxNQUFNLEVBQUUsNkJBQTZCLENBQUMsQ0FBQTtBQUNwRCxRQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDM0IsU0FBTyxDQUFDLEtBQUssQ0FBQyxXQXpFeUUsT0FBTyxTQUE1RCxPQUFPLEVBeUVWLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsNkJBQTZCLENBQUMsQ0FBQTtBQUNoRixTQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLGdCQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0VBQzNDO09BRUQsU0FBUyxHQUFHLE1BQU0sSUFBSSxXQXhGdUMsU0FBUyxDQXdGbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7T0FFdEUsU0FBUyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sS0FBSzt3QkFDUixjQUFjLENBQUMsTUFBTSxDQUFDOzs7O1FBQXZDLE1BQU07UUFBRSxLQUFLOztBQUNwQixZQUFVLENBQUMsTUFBTSxFQUFFLE1BQ2xCLENBQUMsZ0NBQWdDLEdBQUUsa0JBL0Y5QixJQUFJLEVBK0YrQixXQXpFdUMsV0FBVyxFQXlFdEMsT0FBTyxDQUFDLENBQUMsRUFBQyxXQUFXLENBQUMsQ0FBQyxDQUFBO0FBQzVFLFNBQU8sS0FBSyxDQUFBO0VBQ1o7T0FDRCxXQUFXLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxLQUM3QixZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztPQUN6QyxZQUFZLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxLQUM5QixhQUFhLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQzs7OztBQUcxQyxvQkFBbUIsR0FBRyxNQUFNLElBQUk7QUFDL0IsUUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ3ZCLFNBQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLFdBN0Y2QixPQUFPLFNBQTVELE9BQU8sRUE2RmtDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUMxRixDQUFDLENBQUMsR0FBRyxFQUFFLE1BQ1AsQ0FBQyw4QkFBOEIsR0FBRSxDQUFDLEVBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFBO0FBQ3pELFFBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQTs7QUFFN0IsUUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFBO0FBQ2hCLE9BQUssTUFBTSxJQUFJLElBQUksZ0JBQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUM3QyxLQUFLLENBQUMsSUFBSSxNQUFBLENBQVYsS0FBSyxxQkFBUyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFBO0FBQ3RDLFNBQU8sS0FBSyxDQUFBO0VBQ1o7T0FFRCxZQUFZLEdBQUcsTUFBTSxJQUFJO3lCQUNFLGNBQWMsQ0FBQyxNQUFNLENBQUM7Ozs7UUFBekMsU0FBUztRQUFFLElBQUk7O0FBQ3RCLFFBQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3BDLFNBQU8sV0F0SFIsT0FBTyxDQXNIYSxNQUFNLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQTtFQUNoRDtPQUVELGFBQWEsR0FBRyxNQUFNLElBQUk7eUJBQ0MsY0FBYyxDQUFDLE1BQU0sQ0FBQzs7OztRQUF6QyxTQUFTO1FBQUUsSUFBSTs7MEJBQ0csZ0JBQWdCLENBQUMsSUFBSSxDQUFDOztRQUF4QyxLQUFLLHFCQUFMLEtBQUs7UUFBRSxPQUFPLHFCQUFQLE9BQU87O0FBQ3JCLFVBQVEsT0FBTztBQUNkLFFBQUssV0FBVztBQUNmLFdBQU8sT0EvSHlFLFFBQVEsQ0ErSHhFLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQTtBQUFBLEFBQ2pELFFBQUssV0FBVztBQUNmLFdBQU8sT0FoSUQsUUFBUSxDQWdJRSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUE7QUFBQSxBQUNqRCxRQUFLLFdBQVc7MkJBQ1UsZUFBZSxDQUFDLEtBQUssQ0FBQzs7UUFBeEMsT0FBTztRQUFFLEtBQUs7OztBQUVyQixXQUFPLE9BcElTLFFBQVEsQ0FvSVIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFBQSxBQUNoRTtBQUFTO0FBQ1IsWUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLFVBaEhnQixPQUFPLEVBZ0hmLEtBQUssQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsa0NBQWtDLENBQUMsQ0FBQTtBQUM5RSxXQUFNLEdBQUcsR0FBRyxVQWpINEIsSUFBSSxFQWlIM0IsS0FBSyxDQUFDLENBQUE7QUFDdkIsU0FBSSxHQUFHLG1CQTlISyxLQUFLLEFBOEhPLEVBQ3ZCLE9BQU8sV0F6SWtCLGFBQWEsQ0F5SWIsTUFBTSxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsVUFuSGtCLEtBQUssRUFtSGpCLEtBQUssQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBLEtBQzlEO0FBQ0osYUFBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLG1CQWpJQyxHQUFHLEFBaUlXLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFBO0FBQzlFLGFBQU8sV0E1SWlDLGVBQWUsQ0E0STVCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLFVBdEhnQixLQUFLLEVBc0hmLEtBQUssQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO01BQ3BFO0tBQ0Q7QUFBQSxHQUNEO0VBQ0Q7T0FFRCxnQkFBZ0IsR0FBRyxNQUFNLElBQUk7MEJBQ0gsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQzs7UUFBaEQsS0FBSyxxQkFBTCxLQUFLO1FBQUUsT0FBTyxxQkFBUCxPQUFPOztBQUNyQixRQUFNLFNBQVMsR0FBRyxJQUFJLENBQUE7QUFDdEIsUUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQTtBQUN0QixVQUFRLE9BQU87QUFDZCxRQUFLLFdBQVcsQ0FBQyxBQUFDLEtBQUssV0FBVztBQUFFO0FBQ25DLFdBQU0sR0FBRyxHQUFHLE9BQU8sS0FBSyxXQUFXLFVBeko2QyxRQUFRLFVBQ2xGLFFBQVEsQUF3SjJDLENBQUE7QUFDekQsV0FBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFBO0FBQzNDLFdBQU0sR0FBRyxHQUFHLFdBMUo4QyxTQUFTLENBMEp6QyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUE7QUFDckMsV0FBTSxRQUFRLEdBQUcsT0F2SmMsWUFBWSxDQXVKYixLQUFLLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQTtBQUNuRSxXQUFNLE1BQU0sR0FBRyxXQTdKZ0IsWUFBWSxDQTZKWCxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQ25ELFlBQU8sQ0FBQyxXQXZKcUMsbUJBQW1CLENBdUpoQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQTtLQUM3QztBQUFBLEFBQ0QsUUFBSyxXQUFXO0FBQUU7QUFDakIsV0FBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTs7Ozs7Ozs7O0FBUzVDLFdBQU0sZ0JBQWdCLEdBQUcsSUFBSSxJQUFJO0FBQ2hDLFVBQUksSUFBSSxtQkFuS2dDLFFBQVEsQUFtS3BCLEVBQUU7QUFDN0IsY0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLG1CQXBLK0IsY0FBYyxBQW9LbkIsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUNyRCxxQ0FBcUMsQ0FBQyxDQUFBO0FBQ3ZDLGNBQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sbUJBOUtJLFlBQVksQUE4S1EsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUMxRCw2Q0FBNkMsQ0FBQyxDQUFBO0FBQy9DLGNBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLFVBQVUsR0FDOUMsV0ExSzBDLG1CQUFtQixDQTBLckMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQzlDLFdBM0srRCxpQkFBaUIsQ0EySzFELElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO09BQzdDLE1BQU0sSUFBSSxJQUFJLG1CQWhMVSxLQUFLLEFBZ0xFLEVBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtBQUM5QyxhQUFPLElBQUksQ0FBQTtNQUNYLENBQUE7O0FBRUQsWUFBTyxLQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUE7S0FDbEM7QUFBQSxBQUNEO0FBQVM7NEJBQytCLGVBQWUsQ0FBQyxLQUFLLENBQUM7Ozs7V0FBdEQsV0FBVztXQUFFLGVBQWU7O0FBQ25DLFNBQUksZUFBZSxLQUFLLElBQUksRUFBRTtBQUM3QixZQUFNLENBQUMsR0FBRyxlQUFlLENBQUE7QUFDekIsaUJBQVcsQ0FBQyxJQUFJLENBQUMsV0F2TDJCLG1CQUFtQixDQXVMdEIsQ0FBQyxDQUFDLEdBQUcsRUFDN0MsV0EvTDZCLFlBQVksQ0ErTHhCLENBQUMsQ0FBQyxHQUFHLEVBQ3JCLE9BM0w0QixZQUFZLENBMkwzQixLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQ2xFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtNQUNOO0FBQ0QsWUFBTyxXQUFXLENBQUE7S0FDbEI7QUFBQSxHQUNEO0VBQ0QsQ0FBQTs7O0FBR0YsT0FDQyxlQUFlLEdBQUcsS0FBSyxJQUN0QixDQUFDLFVBcExnQyxPQUFPLEVBb0wvQixLQUFLLENBQUMsSUFBSSxVQXBMdUIsSUFBSSxFQW9MdEIsS0FBSyxDQUFDLG1CQWhNVCxHQUFHLEFBZ01xQixHQUM1QyxDQUFDLFVBckxtRSxLQUFLLEVBcUxsRSxLQUFLLENBQUMsRUFBRSxVQXJMMEIsSUFBSSxFQXFMekIsS0FBSyxDQUFDLENBQUMsR0FDM0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO09BRWYsZ0JBQWdCLEdBQUcsVUFBVSxJQUFJO0FBQ2hDLFFBQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQTtBQUNoQixRQUFNLE9BQU8sR0FBRyxJQUFJLElBQUk7QUFDdkIsT0FBSSxJQUFJLFlBQVksS0FBSyxFQUN4QixLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFDbkIsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBLEtBRVgsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtHQUNqQixDQUFBO0FBQ0QsT0FBSyxNQUFNLENBQUMsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQ2xDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN0QixTQUFPLEtBQUssQ0FBQTtFQUNaO09BRUQsYUFBYSxHQUFHLENBQUM7T0FDakIsV0FBVyxHQUFHLENBQUM7T0FDZixXQUFXLEdBQUcsQ0FBQztPQUNmLFdBQVcsR0FBRyxDQUFDO09BQ2YsZ0JBQWdCLEdBQUcsVUFBVSxJQUFJO0FBQ2hDLE1BQUksS0FBSyxHQUFHLEtBQUs7TUFBRSxLQUFLLEdBQUcsS0FBSztNQUFFLEtBQUssR0FBRyxLQUFLLENBQUE7QUFDL0MsUUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJO0FBQ3pCLE9BQUksSUFBSSxtQkFqT21CLEtBQUssQUFpT1AsRUFDeEIsS0FBSyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUN6QixTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUEsS0FDVCxJQUFJLElBQUksbUJBdk9pQyxRQUFRLEFBdU9yQixFQUNoQyxLQUFLLEdBQUcsSUFBSSxDQUFBLEtBQ1IsSUFBSSxJQUFJLG1CQW5Pd0MsUUFBUSxBQW1PNUIsRUFDaEMsS0FBSyxHQUFHLElBQUksQ0FBQSxLQUNSLElBQUksSUFBSSxtQkFuTzZCLFFBQVEsQUFtT2pCLEVBQ2hDLEtBQUssR0FBRyxJQUFJLENBQUE7R0FDYixDQUFBO0FBQ0QsUUFBTSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDMUMsT0FBSyxNQUFNLENBQUMsSUFBSSxLQUFLLEVBQ3BCLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQTs7QUFFYixTQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxJQUFJLEtBQUssQ0FBQSxBQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFBO0FBQ2hGLFNBQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLElBQUksS0FBSyxDQUFBLEFBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLG1DQUFtQyxDQUFDLENBQUE7QUFDaEYsU0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssSUFBSSxLQUFLLENBQUEsQUFBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsbUNBQW1DLENBQUMsQ0FBQTs7QUFFaEYsUUFBTSxPQUFPLEdBQ1osS0FBSyxHQUFHLFdBQVcsR0FBRyxLQUFLLEdBQUcsV0FBVyxHQUFHLEtBQUssR0FBRyxXQUFXLEdBQUcsYUFBYSxDQUFBO0FBQ2hGLFNBQU8sRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFDLENBQUE7RUFDdkIsQ0FBQTs7QUFFRixPQUFNLFNBQVMsR0FBRyxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsTUFBTSxLQUFLO3lCQUMxQixjQUFjLENBQUMsTUFBTSxDQUFDOzs7O1FBQXZDLE1BQU07UUFBRSxLQUFLOztBQUVwQixNQUFJLE9BQU8sQ0FBQTtBQUNYLE1BQUksWUFBWSxFQUFFO0FBQ2pCLGFBQVUsQ0FBQyxNQUFNLEVBQUUsZ0VBQWdFLENBQUMsQ0FBQTtBQUNwRixVQUFPLEdBQUcsSUFBSSxDQUFBO0dBQ2QsTUFDQSxPQUFPLEdBQUcsVUE1T3NDLElBQUksRUE0T3JDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sT0FuUVAsWUFBWSxDQW1RUSxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBOztBQUUzRixRQUFNLFFBQVEsR0FBRyxnQkFBTSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7O2FBQ2QsV0F6UDVCLFNBQVMsU0FFZ0QsT0FBTyxFQXVQakIsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQzlELENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxHQUFHLFlBQVksR0FBRyxXQUFXLENBQUEsUUF4UEssT0FBTyxFQXdQRCxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUMvRSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7Ozs7UUFGUCxTQUFTO1FBQUUsTUFBTTs7QUFJeEIsUUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtBQUN4RCxTQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFDM0MsQ0FBQyx5QkFBeUIsR0FBRSxrQkE3UXRCLElBQUksRUE2UXVCLE1BQU0sQ0FBQyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7O0FBRWxELFNBQU8sS0FBSyxLQUFLLFVBNVFTLE9BQU8sVUFBM0IsTUFBTSxDQTRRd0IsQ0FBRSxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUE7RUFDekUsQ0FBQTs7QUFFRCxPQUNDLGNBQWMsR0FBRyxLQUFLLElBQUksSUFBSSxJQUFJO3lCQUNULGNBQWMsQ0FBQyxJQUFJLENBQUM7Ozs7UUFBckMsTUFBTTtRQUFFLEtBQUs7O0FBQ3BCLFFBQU0sSUFBSSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNuQyxRQUFNLE1BQU0sR0FBRyxDQUFDLEtBQUssR0FBRyxhQUFhLEdBQUcsWUFBWSxDQUFBLENBQUUsS0FBSyxDQUFDLENBQUE7QUFDNUQsU0FBTyxLQUFLLEtBQUssVUFwUmlCLFdBQVcsVUFBaEMsVUFBVSxDQW9ScUIsQ0FBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQTtFQUNyRTtPQUNELGNBQWMsR0FBRyxNQUFNLElBQUk7QUFDMUIsUUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBOzs7QUFHM0IsTUFBSSxXQWhSbUYsT0FBTyxTQUF6QixPQUFPLEVBZ1J2RCxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFO0FBQ2pELFNBQU0sRUFBRSxHQUFHLGdCQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUM3QixPQUFJLFdBalJOLFNBQVMsU0FPb0MsT0FBTyxFQTBRM0IsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUU7QUFDbEMsVUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQ25DLFVBQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQ2hELFdBQU8sV0F4UlUsT0FBTyxDQXdSTCxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0E1UjFCLFdBQVcsQ0E0UjJCLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUMxRTtHQUNEO0FBQ0QsU0FBTyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUE7RUFDeEIsQ0FBQTs7QUFFRixPQUFNLFdBQVcsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFNLEtBQUs7eUJBQ2QsY0FBYyxDQUFDLE1BQU0sQ0FBQzs7OztRQUF2QyxNQUFNO1FBQUUsS0FBSzs7QUFDcEIsUUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2xDLFFBQU0sUUFBUSxHQUFHLGdCQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTs7Y0FDZCxXQTlSNUIsU0FBUyxTQUVnRCxPQUFPLEVBNFJqQixRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsR0FDOUQsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEdBQUcsWUFBWSxHQUFHLFdBQVcsQ0FBQSxRQTdSSyxPQUFPLEVBNlJELFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQy9FLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQzs7OztRQUZQLFNBQVM7UUFBRSxNQUFNOztBQUl4QixRQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFDMUQsU0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQzNDLENBQUMseUJBQXlCLEdBQUUsa0JBbFR0QixJQUFJLEVBa1R1QixNQUFNLENBQUMsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFBOztBQUVsRCxTQUFPLEtBQUssS0FBSyxVQXpTNEQsU0FBUyxVQUFqQyxRQUFRLENBeVNyQixDQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTtFQUM5RSxDQUFBO0FBQ0QsT0FDQyxnQkFBZ0IsR0FBRyxLQUFLLElBQUksSUFBSSxJQUFJO3lCQUNYLGNBQWMsQ0FBQyxJQUFJLENBQUM7Ozs7UUFBckMsTUFBTTtRQUFFLEtBQUs7O0FBRXBCLE1BQUksTUFBTSxDQUFBO0FBQ1YsTUFBSSxXQTdTTCxTQUFTLFNBSzJFLEtBQUssRUF3U25FLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUNsQyxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQSxLQUV2QyxNQUFNLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTs7QUFFN0IsUUFBTSxNQUFNLEdBQUcsQ0FBQyxLQUFLLEdBQUcsYUFBYSxHQUFHLFlBQVksQ0FBQSxDQUFFLEtBQUssQ0FBQyxDQUFBO0FBQzVELFNBQU8sS0FBSyxLQUFLLFVBclRsQixhQUFhLFVBRGtELFlBQVksQ0FzVDFCLENBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUE7RUFDM0UsQ0FBQTs7QUFFRixPQUNDLFNBQVMsR0FBRyxNQUFNLElBQUk7QUFDckIsU0FBTyxVQTlTa0IsTUFBTSxFQThTakIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsSUFBSSxXQXhUNUMsU0FBUyxTQUs2RCxZQUFZLEVBbVRkLENBQUMsQ0FBQyxDQUFDLEVBQ3JFLE1BQU0sSUFBSTs7QUFFVCxTQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFBO0FBQzlCLGdCQUFhLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxXQUFXLEdBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsQ0FBQTtBQUN4RCxTQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUE7O0FBRWxDLFNBQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQTtBQUNoQixRQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDakQsVUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUNwQyxXQUFPLENBQUMsS0FBSyxDQUFDLElBQUksbUJBMVRxRCxJQUFJLEFBMFR6QyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFDN0MsQ0FBQyxxQkFBcUIsR0FBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUE7QUFDaEMsVUFBTSxXQUFXLEdBQUcsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUMxQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FDcEIsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDN0IsVUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ3pDLFVBQU0sR0FBRyxHQUFHLGlCQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDeEQsU0FBSyxDQUFDLElBQUksQ0FBQyxXQTdVZixPQUFPLENBNlVvQixHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBQzlDO0FBQ0QsU0FBTSxHQUFHLEdBQUcsV0EvVU4sU0FBUyxDQStVVyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFBO0FBQzVDLE9BQUksWUFBWSxDQUFDLE9BQU8sRUFBRSxFQUN6QixPQUFPLEdBQUcsQ0FBQSxLQUNOO0FBQ0osVUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQzFDLFdBQU8sV0EzVlgsSUFBSSxDQTJWZ0IsTUFBTSxDQUFDLEdBQUcsRUFBRSxVQXRVWixJQUFJLEVBc1VhLEtBQUssQ0FBQyxFQUFFLFVBdFU5QixHQUFHLEVBc1UrQixVQXRVNEIsSUFBSSxFQXNVM0IsS0FBSyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUMvRDtHQUNELEVBQ0QsTUFBTSxjQUFjLENBQUMsTUFBTSxDQUFDLENBQzVCLENBQUE7RUFDRDtPQUVELGNBQWMsR0FBRyxNQUFNLElBQUk7QUFDMUIsUUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ3BDLFVBQVEsS0FBSyxDQUFDLE1BQU07QUFDbkIsUUFBSyxDQUFDO0FBQ0wsV0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLHNDQUFzQyxDQUFDLENBQUE7QUFBQSxBQUNqRSxRQUFLLENBQUM7QUFDTCxXQUFPLFVBblZVLElBQUksRUFtVlQsS0FBSyxDQUFDLENBQUE7QUFBQSxBQUNuQjtBQUNDLFdBQU8sV0ExV1YsSUFBSSxDQTBXZSxNQUFNLENBQUMsR0FBRyxFQUFFLFVBclZYLElBQUksRUFxVlksS0FBSyxDQUFDLEVBQUUsVUFyVmlDLElBQUksRUFxVmhDLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFBQSxHQUN0RDtFQUNEO09BRUQsY0FBYyxHQUFHLE1BQU0sSUFBSTtBQUMxQixRQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxJQUFJO0FBQ2hELE9BQUksS0FBSyxtQkFyV0EsT0FBTyxBQXFXWSxFQUMzQixRQUFRLEtBQUssQ0FBQyxJQUFJO0FBQ2pCLGdCQXZXZ0IsTUFBTSxDQXVXVixBQUFDLFlBdFdVLFVBQVUsQ0FzV0osQUFBQyxZQXRXa0QsUUFBUSxDQXNXNUMsQUFBQyxZQXRXQyxPQUFPLENBc1dLLEFBQUMsWUFyV2dCLFlBQVksQ0FxV1Y7QUFDN0UsZ0JBcldRLFNBQVMsQ0FxV0YsQUFBQyxZQXJXYSxTQUFTLENBcVdQLEFBQUMsWUFyV2tCLE1BQU0sQ0FxV1osQUFBQyxZQXJXYSxRQUFRLENBcVdQLEFBQUMsWUFyV1EsU0FBUyxDQXFXRjtBQUMzRSxnQkF0VytFLFdBQVcsQ0FzV3pFLEFBQUMsWUFyV3RCLFVBQVUsQ0FxVzRCLEFBQUMsWUFyVzNCLFlBQVksQ0FxV2lDLEFBQUMsWUFyV2hDLGFBQWEsQ0FxV3NDO0FBQ3pFLGdCQXRXcUMsZUFBZSxDQXNXL0IsQUFBQyxZQXRXaUQsUUFBUSxDQXNXM0MsQUFBQyxZQXJXYSxNQUFNLENBcVdQLEFBQUMsWUFyV1EsTUFBTSxDQXFXRixBQUFDLFlBcldpQixLQUFLLENBcVdYO0FBQzFFLGdCQXJXdUQsV0FBVyxDQXFXakQsQUFBQyxZQXBXdEIsWUFBWSxDQW9XNEIsQUFBQyxZQXBXMEIsWUFBWSxDQW9XcEIsQUFBQyxZQW5XaEIsT0FBTyxDQW1Xc0I7QUFDckUsZ0JBcFdpRCxRQUFRLENBb1czQyxBQUFDLFlBcFc0QyxVQUFVO0FBcVdwRSxZQUFPLElBQUksQ0FBQTtBQUFBLEFBQ1o7QUFDQyxZQUFPLEtBQUssQ0FBQTtBQUFBLElBQ2I7QUFDRixVQUFPLEtBQUssQ0FBQTtHQUNaLENBQUMsQ0FBQTtBQUNGLFNBQU8sVUF6V2tCLE1BQU0sRUF5V2pCLE9BQU8sRUFDcEIsQUFBQyxLQUFtQixJQUFLO09BQXZCLE1BQU0sR0FBUCxLQUFtQixDQUFsQixNQUFNO09BQUUsRUFBRSxHQUFYLEtBQW1CLENBQVYsRUFBRTtPQUFFLEtBQUssR0FBbEIsS0FBbUIsQ0FBTixLQUFLOztBQUNsQixTQUFNLE9BQU8sR0FBRyxNQUFNO0FBQ3JCLFlBQVEsRUFBRSxDQUFDLElBQUk7QUFDZCxpQkF2WGUsTUFBTSxDQXVYVCxBQUFDLFlBbFhrRSxLQUFLO0FBbVhuRixhQUFPLFdBL1htQyxLQUFLLENBK1g5QixFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLFlBeFhsQixNQUFNLEFBd1h1QixVQWpZZSxLQUFLLFVBQUUsSUFBSSxBQWlZWCxFQUN6RCxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtBQUFBLEFBQ3hCLGlCQXpYc0IsVUFBVTtBQTBYL0IsYUFBTyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQTtBQUFBLEFBQ3JDLGlCQTNYK0UsUUFBUTtBQTRYdEYsYUFBTyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUE7QUFBQSxBQUN6QixpQkE3WDZDLE9BQU87QUE4WG5ELGFBQU8sU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQUEsQUFDeEIsaUJBOVgwRSxZQUFZO0FBK1hyRixhQUFPLFdBQVcsUUEvWHVELFlBQVksRUErWHBELEtBQUssQ0FBQyxDQUFBO0FBQUEsQUFDeEMsaUJBL1hPLFNBQVM7QUFnWWYsYUFBTyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUE7QUFBQSxBQUMxQixpQkFqWTRCLFNBQVM7QUFrWXBDLGFBQU8sV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQUEsQUFDMUIsaUJBbllpRCxNQUFNLENBbVkzQyxBQUFDLFlBblk0QyxRQUFRLENBbVl0QyxBQUFDLFlBbll1QyxTQUFTLENBbVlqQyxBQUFDLFlBbllrQyxXQUFXLENBbVk1QjtBQUM3RCxpQkFuWUwsVUFBVSxDQW1ZVyxBQUFDLFlBbllWLFlBQVksQ0FtWWdCLEFBQUMsWUFuWWYsYUFBYSxDQW1ZcUI7QUFDdkQsaUJBcFlvQyxlQUFlO0FBcVlsRCxhQUFPLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFBO0FBQUEsQUFDaEMsaUJBdFlzRSxRQUFRLENBc1loRSxBQUFDLFlBblkrQyxZQUFZO0FBbVl4Qzs4QkFDVCxjQUFjLENBQUMsS0FBSyxDQUFDOzs7O2FBQXRDLE1BQU07YUFBRSxLQUFLOztBQUNwQixjQUFPLFdBdFpBLGNBQWMsQ0FzWkssTUFBTSxDQUFDLEdBQUcsRUFDbkMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUN0QixhQUFhLENBQUMsS0FBSyxDQUFDLEVBQ3BCLEVBQUUsQ0FBQyxJQUFJLFlBeFlxRCxZQUFZLEFBd1loRCxDQUFDLENBQUE7T0FDMUI7QUFBQSxBQUNELGlCQTVZaUQsTUFBTTtBQTRZMUM7QUFDWixhQUFNLEtBQUssR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDbkMsY0FBTyxXQXhacUIsR0FBRyxDQXdaaEIsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUF6WXNDLElBQUksRUF5WXJDLEtBQUssQ0FBQyxDQUFDLENBQUE7T0FDN0M7QUFBQSxBQUNELGlCQWhaeUQsTUFBTTtBQWlaOUQsYUFBTyxXQTNaMEIsR0FBRyxDQTJackIsRUFBRSxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtBQUFBLEFBQzlDLGlCQWpac0QsV0FBVztBQWtaaEUsYUFBTyxXQTNaRyxTQUFTLENBMlpFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFBQSxBQUNwRCxpQkFsWkwsWUFBWTtBQW1aTixhQUFPLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUE7QUFBQSxBQUNoQyxpQkFuWnVDLE9BQU87QUFvWjdDLGFBQU8sU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQUEsQUFDeEIsaUJBclpnRCxRQUFRO0FBc1p2RCxhQUFPLFdBaGFvQixLQUFLLENBZ2FmLEVBQUUsQ0FBQyxHQUFHLEVBQ3RCLFVBclowQyxJQUFJLEVBcVp6QyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFBQSxBQUN0RCxpQkF4WjBELFVBQVU7QUF5Wm5FLGFBQU8sV0FuYTJCLE9BQU8sQ0FtYXRCLEVBQUUsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFBQSxBQUNsRDtBQUFTLFlBQU0sSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQUEsS0FDakM7SUFDRCxDQUFBO0FBQ0QsVUFBTyxVQTNaSyxHQUFHLEVBMlpKLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtHQUM5QyxFQUNELE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFBO0VBQy9CLENBQUE7O0FBRUYsT0FBTSxRQUFRLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxLQUFLO0FBQ2xDLE1BQUksTUFBTSxHQUFHLEtBQUs7TUFBRSxJQUFJLEdBQUcsS0FBSztNQUFFLEtBQUssR0FBRyxLQUFLLENBQUE7QUFDL0MsVUFBUSxJQUFJO0FBQ1gsZUExYXFELE1BQU07QUEyYTFELFVBQUs7QUFBQSxBQUNOLGVBNWE2RCxRQUFRO0FBNmFwRSxRQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ1gsVUFBSztBQUFBLEFBQ04sZUEvYXVFLFNBQVM7QUFnYi9FLFNBQUssR0FBRyxJQUFJLENBQUE7QUFDWixVQUFLO0FBQUEsQUFDTixlQWxia0YsV0FBVztBQW1iNUYsU0FBSyxHQUFHLElBQUksQ0FBQTtBQUNaLFFBQUksR0FBRyxJQUFJLENBQUE7QUFDWCxVQUFLO0FBQUEsQUFDTixlQXJiRCxVQUFVO0FBc2JSLFVBQU0sR0FBRyxJQUFJLENBQUE7QUFDYixVQUFLO0FBQUEsQUFDTixlQXhiVyxZQUFZO0FBeWJ0QixVQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2IsUUFBSSxHQUFHLElBQUksQ0FBQTtBQUNYLFVBQUs7QUFBQSxBQUNOLGVBNWJ5QixhQUFhO0FBNmJyQyxVQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2IsU0FBSyxHQUFHLElBQUksQ0FBQTtBQUNaLFVBQUs7QUFBQSxBQUNOLGVBaGN3QyxlQUFlO0FBaWN0RCxVQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2IsU0FBSyxHQUFHLElBQUksQ0FBQTtBQUNaLFFBQUksR0FBRyxJQUFJLENBQUE7QUFDWCxVQUFLO0FBQUEsQUFDTjtBQUFTLFVBQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQTtBQUFBLEdBQzFCO0FBQ0QsUUFBTSxhQUFhLEdBQUcsVUFqYzJCLElBQUksRUFpYzFCLE1BQU0sRUFBRSxNQUFNLFdBbGR4QixnQkFBZ0IsQ0FrZDZCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBOzs0QkFFN0Msa0JBQWtCLENBQUMsTUFBTSxDQUFDOztRQUFoRCxZQUFZLHVCQUFaLFlBQVk7UUFBRSxJQUFJLHVCQUFKLElBQUk7OzBCQUNnQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDOztRQUE5RSxJQUFJLHFCQUFKLElBQUk7UUFBRSxTQUFTLHFCQUFULFNBQVM7UUFBRSxLQUFLLHFCQUFMLEtBQUs7UUFBRSxJQUFJLHFCQUFKLElBQUk7UUFBRSxLQUFLLHFCQUFMLEtBQUs7UUFBRSxTQUFTLHFCQUFULFNBQVM7OztBQUVyRCxRQUFNLFlBQVksR0FBRyxVQXRjSyxNQUFNLEVBc2NKLFlBQVksRUFDdkMsQ0FBQyxJQUFJLFdBeGROLGVBQWUsQ0F3ZFcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFDbEMsTUFBTSxVQXhjZ0QsS0FBSyxFQXdjL0MsS0FBSyxFQUFFLENBQUMsSUFBSSxXQXpkekIsZUFBZSxDQXlkOEIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDM0QsU0FBTyxXQTVkb0QsR0FBRyxDQTRkL0MsTUFBTSxDQUFDLEdBQUcsRUFDeEIsYUFBYSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQTtFQUNwRixDQUFBOzs7QUFHRCxPQUNDLGtCQUFrQixHQUFHLE1BQU0sSUFBSTtBQUM5QixNQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFO0FBQ3RCLFNBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUN2QixPQUFJLFdBN2RrRixPQUFPLFNBQXpCLE9BQU8sRUE2ZHRELENBQUMsQ0FBQyxJQUFJLFdBNWQ3QixTQUFTLFNBT29DLE9BQU8sRUFxZEosVUFsZDVCLElBQUksRUFrZDZCLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUMvRCxPQUFPO0FBQ04sZ0JBQVksRUFBRSxXQUFXLENBQUMsZ0JBQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2hELFFBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFO0lBQ25CLENBQUE7R0FDRjtBQUNELFNBQU8sRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUMsQ0FBQTtFQUN6Qzs7Ozs7Ozs7OztBQVNELGlCQUFnQixHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxpQkFBaUIsS0FBSztBQUN2RCxlQUFhLENBQUMsTUFBTSxFQUFFLDZCQUE2QixDQUFDLENBQUE7QUFDcEQsUUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBOztBQUV2QixNQUFJLENBQUMsbUJBaGZLLE9BQU8sQUFnZk8sS0FBSyxDQUFDLENBQUMsSUFBSSxZQS9lVCxVQUFVLEFBK2VjLElBQUksQ0FBQyxDQUFDLElBQUksWUEvZXRCLFNBQVMsQUErZTJCLENBQUEsQUFBQyxFQUFFO0FBQzVFLFNBQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxZQWhmTCxVQUFVLEFBZ2ZVLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQ25FLFNBQU0sSUFBSSxHQUFHLENBQUMsV0ExZmdDLGlCQUFpQixDQTBmM0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7QUFDM0MsVUFBTyxDQUFDLENBQUMsSUFBSSxZQWxmWSxVQUFVLEFBa2ZQLEdBQzNCO0FBQ0MsUUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJO0FBQzlELFNBQUssRUFBRSxXQWxnQmlDLGVBQWUsQ0FrZ0I1QixNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDO0lBQ3ZELEdBQ0Q7QUFDQyxRQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUk7QUFDOUQsU0FBSyxFQUFFLFdBdGdCWCxPQUFPLENBc2dCZ0IsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM3QyxDQUFBO0dBQ0YsTUFBTTswQkFDdUIsY0FBYyxDQUFDLE1BQU0sQ0FBQzs7OztTQUE1QyxNQUFNO1NBQUUsVUFBVTs7MEJBQ2EsZUFBZSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQzs7U0FBekUsSUFBSSxvQkFBSixJQUFJO1NBQUUsU0FBUyxvQkFBVCxTQUFTO1NBQUUsVUFBVSxvQkFBVixVQUFVOztBQUNsQyxRQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFDaEIsR0FBRyxDQUFDLElBQUksVUF6Z0JILFVBQVUsQUF5Z0JNLENBQUE7OzBCQUNELGVBQWUsUUE3ZnZDLEtBQUssRUE2ZjBDLFVBQVUsQ0FBQzs7OztTQUFqRCxJQUFJO1NBQUUsS0FBSzs7MEJBQ0ssZUFBZSxRQTdmL0IsTUFBTSxFQTZma0MsS0FBSyxDQUFDOzs7O1NBQTlDLEtBQUs7U0FBRSxLQUFLOztBQUNuQixTQUFNLEtBQUssR0FBRyxDQUFDLElBQUksR0FBRyxZQUFZLEdBQUcsYUFBYSxDQUFBLENBQUUsS0FBSyxDQUFDLENBQUE7QUFDMUQsVUFBTyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUE7R0FDeEQ7RUFDRDtPQUVELGVBQWUsR0FBRyxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsS0FBSztBQUNoRCxNQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFDbkIsT0FBTyxFQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFDLENBQUEsS0FDOUM7QUFDSixPQUFJLElBQUksRUFBRSxTQUFTLENBQUE7QUFDbkIsU0FBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ3ZCLE9BQUksQ0FBQyxtQkFoaEJZLE9BQU8sQUFnaEJBLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7QUFDMUMsUUFBSSxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNyQixhQUFTLEdBQUcsT0F6aEJtQixZQUFZLENBeWhCbEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdDLE1BQU07QUFDTixRQUFJLEdBQUcsTUFBTSxDQUFBO0FBQ2IsYUFBUyxHQUFHLElBQUksQ0FBQTtJQUNoQjs7QUFFRCxPQUFJLGlCQUFpQixFQUFFOzJDQUNlLCtCQUErQixDQUFDLElBQUksQ0FBQzs7VUFBekQsSUFBSSxvQ0FBZCxRQUFRO1VBQVEsVUFBVSxvQ0FBVixVQUFVOztBQUNqQyxXQUFPLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUMsQ0FBQTtJQUNwQyxNQUNBLE9BQU8sRUFBQyxJQUFJLEVBQUUsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFDLENBQUE7R0FDbkQ7RUFDRDtPQUVELGVBQWUsR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFNLEtBQUs7QUFDdEMsTUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRTtBQUN0QixTQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUE7QUFDcEMsT0FBSSxXQWxpQk4sU0FBUyxFQWtpQk8sT0FBTyxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFO0FBQ3pDLFVBQU0sS0FBSyxHQUFHLFdBN2lCWSxLQUFLLENBOGlCOUIsU0FBUyxDQUFDLEdBQUcsRUFDYixtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO0FBQ2hDLFdBQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7SUFDN0I7R0FDRDtBQUNELFNBQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7RUFDckIsQ0FBQTs7QUFFRixPQUNDLFNBQVMsR0FBRyxNQUFNLElBQUk7QUFDckIsUUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQzFCLFFBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQTs7QUFFMUIsUUFBTSxNQUFNLEdBQUcsTUFDZCxVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyw4QkFBOEIsR0FBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUE7OztBQUdoRSxNQUFJLElBQUksbUJBcmpCRSxPQUFPLEFBcWpCVSxFQUMxQixRQUFRLElBQUksQ0FBQyxJQUFJO0FBQ2hCLGVBdmpCZ0MsU0FBUyxDQXVqQjFCLEFBQUMsWUF2akIyQixZQUFZO0FBd2pCdEQsV0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksWUF4akJjLFlBQVksQUF3akJULEVBQUUsSUFBSSxDQUFDLENBQUE7QUFBQSxBQUNyRCxlQXZqQitELFdBQVc7QUF3akJ6RSxXQUFPLFdBQVcsUUF4akI0QyxXQUFXLEVBd2pCekMsSUFBSSxDQUFDLENBQUE7QUFBQSxBQUN0QyxlQTFqQkgsUUFBUTtBQTJqQkosVUFBTSxFQUFFLENBQUE7QUFDUixXQUFPLFdBemtCNkQsS0FBSyxDQXlrQnhELE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUFBLEFBQzdCLGVBN2pCTyxlQUFlO0FBOGpCckIsV0FBTyxXQTNrQm9FLFlBQVksQ0Eya0IvRCxNQUFNLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0FBQUEsQUFDckQsZUEvakJvQyxTQUFTO0FBZ2tCNUMsV0FBTyxTQUFTLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUFBLEFBQ3JDLGVBaGtCVyxRQUFRO0FBaWtCbEIsV0FBTyxXQTdrQmtCLEtBQUssQ0E2a0JiLE1BQU0sQ0FBQyxHQUFHLEVBQzFCLFdBcmtCbUYsT0FBTyxTQUE1RCxPQUFPLEVBcWtCcEIsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDOztBQUVqQyx1QkFBbUIsRUFBRTs7QUFFckIsb0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUFBLEFBQ3pCLGVBdmtCcUIsV0FBVztBQXdrQi9CLFVBQU0sRUFBRSxDQUFBO0FBQ1IsV0FBTyxXQS9rQnFELFNBQVMsQ0Era0JoRCxNQUFNLENBQUMsR0FBRyxTQS9rQmdCLFdBQVcsQ0Era0JiLENBQUE7QUFBQSxBQUM5QyxlQTFrQnlDLFdBQVc7QUEya0JuRCxXQUFPLFdBMWxCK0MsWUFBWSxDQTBsQjFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7QUFBQSxBQUNyRCxlQTNrQm9CLFFBQVE7QUE0a0IzQixXQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUFBLEFBQ3hCLGVBNWtCa0YsU0FBUztBQTZrQjFGLFdBQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQUEsQUFDekIsZUE5a0IrRCxPQUFPLENBOGtCekQsQUFBQyxZQTNrQnFDLFdBQVc7QUEya0I5Qjs0QkFDUCxjQUFjLENBQUMsSUFBSSxDQUFDOzs7O1dBQXJDLE1BQU07V0FBRSxLQUFLOztBQUNwQixZQUFPLFdBL2xCa0UsYUFBYSxDQStsQjdELE1BQU0sQ0FBQyxHQUFHLEVBQ2xDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFDakIsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUNuQixJQUFJLENBQUMsSUFBSSxZQWhsQndDLFdBQVcsQUFnbEJuQyxDQUFDLENBQUE7S0FDM0I7QUFBQSxBQUNELGVBcGxCbUUsWUFBWTtBQXFsQjlFLFdBQU8sV0F2bUJxQyxRQUFRLENBdW1CaEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUFBLEFBQ2pELGVBcmxCSCxPQUFPO0FBc2xCSCxVQUFNLEVBQUUsQ0FBQTtBQUNSLFdBQU8sRUFBRSxDQUFBO0FBQUEsQUFDVixlQXhsQmMsU0FBUztBQXlsQnRCLFdBQU8sbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUE7QUFBQSxBQUNuQyxlQTFsQjRDLFVBQVU7QUEybEJyRCxXQUFPLFdBcG1CZ0IsV0FBVyxDQW9tQlgsTUFBTSxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUFBLEFBQ3pELGVBNWxCcUUsV0FBVztBQTZsQi9FLFdBQU8sV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUFBLEFBQ2hDLGVBN2xCVyxRQUFRO0FBOGxCbEIsV0FBTyxXQXZtQkksS0FBSyxDQXVtQkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxVQTNsQmdCLElBQUksRUEybEJmLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUFBLEFBQzNFLGVBam1CMEMsT0FBTztBQWttQmhELFFBQUksV0F2bUJSLFNBQVMsU0FLNkQsWUFBWSxFQWttQmxELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFO0FBQ3pDLFdBQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUNyQixXQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEdBQUcsV0E3bUI0QyxVQUFVLENBNm1CdkMsTUFBTSxDQUFDLEdBQUcsU0E3bUIrQixPQUFPLENBNm1CNUIsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDNUUsWUFBTyxPQS9tQjBELGdCQUFnQixDQSttQnpELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0tBQzdDO0FBQUE7QUFFRixXQUFROztHQUVSOztBQUVGLFNBQU8sVUF2bUJrQixNQUFNLEVBdW1CakIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLEVBQ3pELEFBQUMsS0FBbUI7T0FBbEIsTUFBTSxHQUFQLEtBQW1CLENBQWxCLE1BQU07T0FBRSxFQUFFLEdBQVgsS0FBbUIsQ0FBVixFQUFFO09BQUUsS0FBSyxHQUFsQixLQUFtQixDQUFOLEtBQUs7VUFBTSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDO0dBQUEsRUFDeEUsTUFBTSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtFQUN6QjtPQUVELGdCQUFnQixHQUFHLE1BQU0sSUFBSTtBQUM1QixRQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDM0IsU0FBTyxDQUFDLFlBQVksS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0VBQ25DLENBQUE7OztBQUdGLE9BQ0MsbUJBQW1CLEdBQUcsS0FBSyxJQUFJO0FBQzlCLE1BQUksS0FBSyxtQkE5bkJDLE9BQU8sQUE4bkJXLEVBQzNCLFFBQVEsS0FBSyxDQUFDLElBQUk7QUFDakIsZUFob0J5RCxTQUFTLENBZ29CbkQsQUFBQyxZQWhvQm9ELGdCQUFnQixDQWdvQjlDLEFBQUMsWUEzbkIxQixjQUFjLENBMm5CZ0M7QUFDM0QsZUE1bkI2QixXQUFXLENBNG5CdkIsQUFBQyxZQTVuQmlELFlBQVksQ0E0bkIzQyxBQUFDLFlBem5CYSxRQUFRLENBeW5CUCxBQUFDLFlBem5CUSxVQUFVO0FBMG5CckUsV0FBTyxJQUFJLENBQUE7QUFBQSxBQUNaO0FBQ0MsV0FBTyxLQUFLLENBQUE7QUFBQSxHQUNiLE1BRUQsT0FBTyxLQUFLLENBQUE7RUFDYjtPQUVELGdCQUFnQixHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxLQUFLO0FBQzlDLE1BQUksRUFBRSxDQUFDLElBQUksWUF0b0JvQixXQUFXLEFBc29CZixFQUMxQixPQUFPLFdBbnBCOEMsUUFBUSxDQW1wQnpDLEdBQUcsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7Ozs7QUFJOUQsTUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFO0FBQ3hCLFNBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUMzQixPQUFJLEtBQUssbUJBbnBCUSxPQUFPLEFBbXBCSSxFQUMzQixPQUFPLGVBQWUsQ0FBRSxPQTNwQk4sV0FBVyxDQTJwQk8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDakYsT0FBSSxXQXJwQmtGLE9BQU8sU0FBekIsT0FBTyxFQXFwQnRELEtBQUssQ0FBQyxFQUFFO0FBQzVCLFVBQU0sTUFBTSxHQUFHLGdCQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUNqQyxVQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDekIsUUFBSSxHQUFHLG1CQXhwQlMsT0FBTyxBQXdwQkcsRUFBRTtBQUMzQixZQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsdUJBQXVCLENBQUMsQ0FBQTtBQUNoRSxZQUFPLGVBQWUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0tBQzdFO0lBQ0Q7R0FDRDs7QUFFRCxTQUFPLEVBQUUsQ0FBQyxJQUFJLFlBenBCQyxjQUFjLEFBeXBCSSxHQUNoQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUNyQyxZQUFZLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUE7RUFDckM7T0FFRCxlQUFlLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxLQUM5QyxXQTNxQndFLFNBQVMsQ0EycUJuRSxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ3ZFLGNBQWMsR0FBRyxFQUFFLElBQUk7QUFDdEIsVUFBUSxFQUFFLENBQUMsSUFBSTtBQUNkLGVBdnFCMEQsU0FBUztBQXVxQm5ELGtCQTVxQlAsTUFBTSxDQTRxQmM7QUFBQSxBQUM3QixlQXhxQnFFLGdCQUFnQjtBQXdxQjlELGtCQTdxQk4sYUFBYSxDQTZxQmE7QUFBQSxBQUMzQyxlQXBxQmMsY0FBYztBQW9xQlAsa0JBOXFCdkIsU0FBUyxDQThxQjhCO0FBQUEsQUFDckM7QUFBUyxVQUFNLElBQUksS0FBSyxFQUFFLENBQUE7QUFBQSxHQUMxQjtFQUNEO09BRUQsaUJBQWlCLEdBQUcsQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLEdBQUcsS0FBSztBQUN2RCxRQUFNLE1BQU0sR0FBRywyQkFBMkIsQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUN4RCxTQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSw4QkFBOEIsQ0FBQyxDQUFBO0FBQ3ZFLFFBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUE7QUFDM0IsUUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ3BDLFNBQU8sV0ExckIyQixXQUFXLENBMHJCdEIsR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQTtFQUN4QztPQUVELFlBQVksR0FBRyxDQUFDLFlBQVksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEdBQUcsS0FBSztBQUM1RCxRQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFBO0FBQzFCLFFBQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQy9DLFFBQU0sTUFBTSxHQUFHLFVBL3FCaUMsSUFBSSxFQStxQmhDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLE1BQU0sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzlELFFBQU0sS0FBSyxHQUFHLGlCQUFpQixDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUE7O0FBRTFELFFBQU0sT0FBTyxHQUFHLElBQUksWUFwckJnQyxRQUFRLEFBb3JCM0IsSUFBSSxJQUFJLFlBcHJCcUIsVUFBVSxBQW9yQmhCLENBQUE7QUFDeEQsTUFBSSxVQW5yQjZCLE9BQU8sRUFtckI1QixNQUFNLENBQUMsRUFBRTtBQUNwQixVQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsR0FBRyxFQUFFLHVCQUF1QixDQUFDLENBQUE7QUFDakUsVUFBTyxLQUFLLENBQUE7R0FDWixNQUFNO0FBQ04sT0FBSSxPQUFPLEVBQ1YsS0FBSyxNQUFNLENBQUMsSUFBSSxNQUFNLEVBQ3JCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxpQ0FBaUMsQ0FBQyxDQUFBOztBQUV0RSxTQUFNLFdBQVcsR0FBRyxJQUFJLFlBaHNCNEMsWUFBWSxBQWdzQnZDLENBQUE7O0FBRXpDLE9BQUksSUFBSSxZQXZzQjZELGdCQUFnQixBQXVzQnhELEVBQzVCLEtBQUssSUFBSSxDQUFDLElBQUksTUFBTSxFQUFFO0FBQ3JCLFdBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ25FLEtBQUMsQ0FBQyxJQUFJLFVBbHRCRCxVQUFVLEFBa3RCSSxDQUFBO0lBQ25COztBQUVGLFNBQU0sSUFBSSxHQUFHLENBQUMsSUFBSSxXQUFXLEdBQUcsV0FsdEJvQixjQUFjLENBa3RCZixHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBOztBQUU5RCxPQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3hCLFVBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUMxQixVQUFNLE1BQU0sR0FBRyxXQTl0QmdCLFlBQVksQ0E4dEJYLEdBQUcsRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUE7QUFDckQsVUFBTSxNQUFNLEdBQUcsV0FBVyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzVELFdBQU8sTUFBTSxHQUFHLFdBN3RCVSxLQUFLLENBNnRCTCxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUM3RCxNQUFNO0FBQ04sVUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQTtBQUMzQixTQUFLLE1BQU0sQ0FBQyxJQUFJLE1BQU0sRUFDckIsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxFQUNuQyxrRUFBa0UsQ0FBQyxDQUFBO0FBQ3JFLFdBQU8sSUFBSSxDQUFDLFdBdHVCQSxpQkFBaUIsQ0FzdUJLLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7SUFDNUQ7R0FDRDtFQUNEO09BRUQsaUJBQWlCLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFdBQVcsS0FBSztBQUNsRCxRQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksSUFBSSxZQTF0QjBCLFlBQVksQUEwdEJyQixHQUMzRCxXQXB1QnlFLFVBQVUsQ0FvdUJwRSxXQUFXLENBQUMsR0FBRyxTQW51QmhDLE9BQU8sQ0FtdUJtQyxHQUN4QyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDdkIsVUFBUSxJQUFJO0FBQ1gsZUEzdEJtRCxRQUFRO0FBNHRCMUQsV0FBTyxXQXR1QnVCLEtBQUssQ0FzdUJsQixLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFBO0FBQUEsQUFDbkMsZUE3dEI2RCxVQUFVO0FBOHRCdEUsV0FBTyxXQXh1QjhCLE9BQU8sQ0F3dUJ6QixLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFBO0FBQUEsQUFDckM7QUFDQyxXQUFPLEtBQUssQ0FBQTtBQUFBLEdBQ2I7RUFDRCxDQUFBOztBQUVGLE9BQ0MsMkJBQTJCLEdBQUcsTUFBTSxJQUNuQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxPQXR2QmlCLFlBQVksQ0FzdkJoQixLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUUvRCxrQkFBa0IsR0FBRyxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsS0FDOUMsaUJBQWlCLEdBQUcsK0JBQStCLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQzs7OztBQUc1RixrQkFBaUIsR0FBRyxDQUFDLEtBQUssRUFBRSxTQUFTLEtBQUs7QUFDekMsTUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFBO0FBQ3BCLE1BQUksT0FBTyxDQUFBOztBQUVYLFFBQU0sY0FBYyxHQUFHLEtBQUssSUFBSTtBQUMvQixPQUFJLFNBQVMsRUFBRTtBQUNkLFlBQVEsR0FBRyxLQUFLLG1CQTN2QkEsT0FBTyxBQTJ2QlksSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQTtBQUN4RCxXQUFPLFFBQVEsR0FBRyxLQUFLLENBQUMsSUFBSSxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNyRCxNQUNBLE9BQU8sZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFBO0dBQzlCLENBQUE7O0FBRUQsTUFBSSxXQWp3Qm1GLE9BQU8sU0FBekIsT0FBTyxFQWl3QnZELEtBQUssQ0FBQyxFQUFFO0FBQzVCLFNBQU0sTUFBTSxHQUFHLGdCQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTs7ZUFFaEMsV0Fud0JILFNBQVMsU0FLRixPQUFPLEVBOHZCUSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7Ozs7U0FEckUsSUFBSTtTQUFFLE1BQU07O0FBR25CLFNBQU0sSUFBSSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUN4QyxTQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDekIsU0FBTSxNQUFNLEdBQUcsVUE3dkJnQyxJQUFJLEVBNnZCL0IsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTTtBQUMzQyxVQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDMUIsV0FBTyxDQUFDLEtBQUssQ0FBQyxXQXp3QmpCLFNBQVMsU0FPb0MsT0FBTyxFQWt3QmhCLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLFNBQVMsR0FBRSxrQkF2eEJsRSxJQUFJLEVBdXhCbUUsR0FBRyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7QUFDbEYsVUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFBO0FBQy9CLGlCQUFhLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyx5QkFBeUIsR0FBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUE7QUFDcEUsV0FBTyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDOUIsQ0FBQyxDQUFBO0FBQ0YsVUFBTyxHQUFHLFdBdHhCc0IsWUFBWSxDQXN4QmpCLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBdHhCNUQsT0FBTyxVQUQ0RSxRQUFRLEFBdXhCVixDQUFDLENBQUE7R0FDaEYsTUFDQSxPQUFPLEdBQUcsT0F4eEJzQixZQUFZLENBd3hCckIsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7O0FBRS9ELE1BQUksU0FBUyxFQUNaLE9BQU8sRUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFDLENBQUEsS0FFMUIsT0FBTyxPQUFPLENBQUE7RUFDZjtPQUVELCtCQUErQixHQUFHLE1BQU0sSUFBSTtBQUMzQyxRQUFNLFFBQVEsR0FBRyxFQUFFO1FBQUUsVUFBVSxHQUFHLEVBQUUsQ0FBQTtBQUNwQyxPQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTs0QkFDQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDOztTQUFuRCxPQUFPLHNCQUFQLE9BQU87U0FBRSxRQUFRLHNCQUFSLFFBQVE7O0FBQ3hCLFdBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDdEIsT0FBSSxRQUFRLEVBQ1gsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtHQUN6QjtBQUNELFNBQU8sRUFBQyxRQUFRLEVBQUUsVUFBVSxFQUFDLENBQUE7RUFDN0IsQ0FBQTs7O0FBR0YsT0FDQyxlQUFlLEdBQUcsQ0FBQyxJQUFJO0FBQ3RCLE1BQUksV0F0eUJMLFNBQVMsU0FHbUMsUUFBUSxFQW15QjNCLENBQUMsQ0FBQyxFQUN6QixPQUFPLEdBQUcsQ0FBQSxLQUNOO0FBQ0osVUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLG1CQWp5QjBELElBQUksQUFpeUI5QyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLDJCQUEyQixHQUFFLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtBQUNoRixVQUFPLENBQUMsQ0FBQyxJQUFJLENBQUE7R0FDYjtFQUNELENBQUE7O0FBRUYsT0FBTSxXQUFXLEdBQUcsS0FBSyxJQUFJO1FBQ3JCLEdBQUcsR0FBSSxLQUFLLENBQVosR0FBRzs7QUFDVixNQUFJLEtBQUssbUJBeHlCa0UsSUFBSSxBQXd5QnRELEVBQ3hCLE9BQU8sV0F6ekJhLFdBQVcsQ0F5ekJSLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUEsS0FDbkMsSUFBSSxLQUFLLG1CQW56QmMsS0FBSyxBQW16QkYsRUFBRTtBQUNoQyxTQUFNLEtBQUssR0FBRyxnQkFBTSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDaEMsV0FBUSxLQUFLLENBQUMsSUFBSTtBQUNqQixnQkF0ekJvRSxPQUFPO0FBdXpCMUUsWUFBTyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUE7QUFBQSxBQUMxQixnQkF4ekJxRCxhQUFhO0FBeXpCakUsWUFBTyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUE7QUFBQSxBQUN4QixnQkExekIwQyxTQUFTO0FBMnpCbEQsWUFBTyxXQXYwQjhELFNBQVMsQ0F1MEJ6RCxHQUFHLEVBQUUsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFBQSxBQUNqRCxnQkE1ekJpQyxPQUFPO0FBNnpCdkMsWUFBTyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUE7QUFBQSxBQUN4QixnQkE5ekI2RSxPQUFPO0FBK3pCbkYsWUFBTyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUE7QUFBQSxBQUN6QjtBQUNDLFdBQU0sSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQUEsSUFDNUI7R0FDRCxNQUFNLElBQUksS0FBSyxtQkEzMEJoQixhQUFhLEFBMjBCNEIsRUFDeEMsT0FBTyxLQUFLLENBQUEsS0FDUixJQUFJLEtBQUssbUJBcDBCSCxPQUFPLEFBbzBCZSxFQUNoQyxRQUFRLEtBQUssQ0FBQyxJQUFJO0FBQ2pCLGVBbjBCMEMsUUFBUTtBQW8wQmpELFdBQU8sT0EvMEJXLFdBQVcsQ0ErMEJWLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUFBLEFBQzlCO0FBQ0MsV0FBTyxVQS96QmdCLE1BQU0sRUErekJmLFdBaDBCakIsK0JBQStCLEVBZzBCa0IsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUN4RCxDQUFDLElBQUksV0E5MEJrRSxVQUFVLENBODBCN0QsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUMzQixNQUFNLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBOztBQUFBLEdBRTFCLE1BQ0csSUFBSSxLQUFLLG1CQS8wQkssT0FBTyxBQSswQk8sRUFDaEMsUUFBUSxLQUFLLENBQUMsS0FBSztBQUNsQixRQUFLLENBQUM7QUFDTCxXQUFPLFdBeDFCdUQsTUFBTSxDQXcxQmxELEtBQUssQ0FBQyxHQUFHLEVBQUUsT0F6MUJYLFdBQVcsQ0F5MUJZLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQUEsQUFDdEUsUUFBSyxDQUFDO0FBQ0wsV0FBTyxXQXQxQkQsS0FBSyxDQXMxQk0sR0FBRyxFQUFFLFdBMzFCSixXQUFXLENBMjFCUyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7QUFBQSxBQUN4RDtBQUNDLGNBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUFBLEdBQ2xCLE1BRUQsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFBO0VBQ2xCLENBQUE7O0FBRUQsT0FBTSxXQUFXLEdBQUcsTUFBTSxJQUFJO0FBQzdCLFFBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUU7UUFBRSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQzdDLE1BQUksV0E3MUJKLFNBQVMsU0FPb0MsT0FBTyxFQXMxQjdCLENBQUMsQ0FBQyxFQUN4QixPQUFPLE9BejJCUixJQUFJLENBeTJCUyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsT0F0MkIzQixXQUFXLENBczJCNEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBLEtBQ3BFLElBQUksV0EvMUJULFNBQVMsU0FLRixPQUFPLEVBMDFCYyxDQUFDLENBQUMsRUFDN0IsT0FBTyxXQXoyQnFFLElBQUksQ0F5MkJoRSxDQUFDLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBLEtBQ3JDLElBQUksV0FqMkJULFNBQVMsU0FNa0QsV0FBVyxFQTIxQnRDLENBQUMsQ0FBQyxFQUFFOztBQUVuQyxTQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDdEIsT0FBSSxFQUFFLG1CQXIyQlksT0FBTyxBQXEyQkEsRUFBRTtBQUMxQixXQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTtBQUN2RCxVQUFNLENBQUMsR0FBRyxXQXoyQjRCLFdBQVcsQ0F5MkJ2QixFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUMxQyxXQUFPLGdCQUFnQixDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtJQUN2QyxNQUFNLElBQUksV0F6MkI0RSxPQUFPLFNBQXhDLGFBQWEsRUF5MkJqQyxFQUFFLENBQUMsSUFBSSxnQkFBTSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDbkUsVUFBTSxDQUFDLEdBQUcsV0E1MkJJLFNBQVMsQ0E0MkJDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDbkMsV0FBTyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7SUFDdkMsTUFDQSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxHQUFFLGtCQTEzQnBCLElBQUksRUEwM0JxQixHQUFHLENBQUMsRUFBQyxJQUFJLEdBQUUsa0JBMTNCcEMsSUFBSSxFQTAzQnFDLElBQUksQ0FBQyxFQUFDLE9BQU8sR0FBRSxrQkExM0J4RCxJQUFJLEVBMDNCeUQsT0FBTyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7R0FDOUUsTUFDQSxPQUFPLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtFQUM5QyxDQUFBO0FBQ0QsT0FBTSxnQkFBZ0IsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLEtBQUs7QUFDekMsTUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFBO0FBQ2YsT0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ2pELFNBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDNUIsU0FBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQTtBQUNyQixPQUFJLEtBQUssbUJBdDNCUyxPQUFPLEFBczNCRyxFQUFFO0FBQzdCLFdBQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFBO0FBQzdELE9BQUcsR0FBRyxXQTkzQnlELE1BQU0sQ0E4M0JwRCxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDNUMsYUFBUTtJQUNSO0FBQ0QsT0FBSSxLQUFLLG1CQTEzQkMsT0FBTyxBQTAzQlcsRUFDM0IsUUFBUSxLQUFLLENBQUMsSUFBSTtBQUNqQixnQkF6M0J5QyxRQUFRO0FBMDNCaEQsUUFBRyxHQUFHLFdBeDRCVixJQUFJLENBdzRCZSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BcjRCZixXQUFXLENBcTRCZ0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN4RCxjQUFRO0FBQUEsQUFDVCxnQkF4M0IwQyxPQUFPO0FBdzNCbkM7QUFDYixZQUFNLElBQUksR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNoRCxhQUFPLE9BNTRCWCxJQUFJLENBNDRCWSxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUE7TUFDMUM7QUFBQSxBQUNELFlBQVE7SUFDUjtBQUNGLE9BQUksS0FBSyxtQkF0NEJrQixLQUFLLEFBczRCTixFQUFFO0FBQzNCLFVBQU0sS0FBSyxHQUFHLGdCQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUNoQyxZQUFRLEtBQUssQ0FBQyxJQUFJO0FBQ2pCLGlCQXo0QnlDLFNBQVM7QUEwNEJqRCxTQUFHLEdBQUcsT0FwNUJWLElBQUksQ0FvNUJXLEdBQUcsQ0FBQyxHQUFHLEVBQUUsVUEvM0JULEdBQUcsRUErM0JVLEdBQUcsRUFBRSxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3BELGVBQVE7QUFBQSxBQUNULGlCQTU0Qm9ELGFBQWE7QUE2NEJoRSxnQkFBVSxDQUFDLEtBQUssRUFBRSxNQUNqQixDQUFDLElBQUksR0FBRSxrQkEzNUJMLElBQUksRUEyNUJNLE9BQU8sQ0FBQyxFQUFDLE1BQU0sR0FBRSxrQkEzNUIzQixJQUFJLEVBMjVCNEIsTUFBTSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7QUFDN0MsU0FBRyxHQUFHLFdBejVCVixJQUFJLENBeTVCZSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQzVCLGVBQVE7QUFBQSxBQUNULGlCQWo1QjRFLE9BQU87QUFrNUJsRixTQUFHLEdBQUcsV0FyNUIwQixhQUFhLENBcTVCckIsR0FBRyxFQUFFLEdBQUcsRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtBQUNwRCxlQUFRO0FBQUEsQUFDVCxhQUFRO0tBQ1I7SUFDRDtBQUNELFVBQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLDRCQUE0QixHQUFFLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUMvRDtBQUNELFNBQU8sR0FBRyxDQUFBO0VBQ1YsQ0FBQTs7QUFFRCxPQUFNLGVBQWUsR0FBRyxDQUFDLGlCQUFpQixFQUFFLE1BQU0sS0FBSztBQUN0RCxNQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFO0FBQ3RCLFNBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUNoQyxPQUFJLFdBOTVCTCxTQUFTLEVBODVCTSxpQkFBaUIsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRTt5QkFDYixhQUFhLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDOztVQUF6RSxPQUFPLGtCQUFQLE9BQU87VUFBRSxjQUFjLGtCQUFkLGNBQWM7O0FBQzlCLFFBQUksSUFBSSxHQUFHLENBQUMsUUF4NUJFLFdBQVcsU0FBRSxhQUFhLFNBQTFDLGNBQWMsQ0F3NUI0QyxDQUFDLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLEVBQy9FLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxLQUFLLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLHlCQUF5QixDQUFDLENBQUE7QUFDN0UsV0FBTyxFQUFDLE9BQU8sRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBQyxDQUFBO0lBQ3JEO0dBQ0Q7QUFDRCxTQUFPLEVBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUMsQ0FBQTtFQUN4RCxDQUFBOzs7QUFHRCxPQUNDLGFBQWEsR0FBRyxDQUFDLGlCQUFpQixFQUFFLE1BQU0sS0FBSztBQUM5QyxRQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFDbEQsTUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFBOztBQUV6QixRQUFNLE9BQU8sR0FBRyxFQUFFLENBQUE7O0FBRWxCLE9BQUssTUFBTSxJQUFJLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFO3dCQUNiLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7O1NBQXhDLElBQUksa0JBQUosSUFBSTtTQUFFLElBQUksa0JBQUosSUFBSTs7QUFDakIsT0FBSSxpQkFBaUIsWUExNkJQLFdBQVcsQUEwNkJZLEVBQUU7QUFDdEMsUUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUNsQixVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7QUFDMUIsV0FBTyxDQUFDLElBQUksQ0FBQyxXQS83Qm9DLFFBQVEsQ0ErN0IvQixJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7SUFDMUMsTUFDQSxJQUFJLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDdEIsV0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLEtBQUssSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUseUJBQXlCLENBQUMsQ0FBQTs7Z0NBRTFFLG9CQUFvQixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDOztVQUR4QyxRQUFRLHlCQUFSLFFBQVE7VUFBRSxlQUFlLHlCQUFmLGVBQWU7O0FBRWhDLGtCQUFjLEdBQUcsV0FyOEJ5QyxZQUFZLENBcThCcEMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsZUFBZSxDQUFDLENBQUE7SUFDdEUsTUFBTTtBQUNOLFVBQU0sTUFBTSxHQUNYLGlCQUFpQixZQXQ3Qk8sYUFBYSxBQXM3QkYsSUFBSSxpQkFBaUIsWUF0N0I3RCxjQUFjLEFBczdCa0UsQ0FBQTs7Z0NBRTNFLG9CQUFvQixDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDOztVQUR6QyxRQUFRLHlCQUFSLFFBQVE7VUFBRSxlQUFlLHlCQUFmLGVBQWU7O0FBRWhDLFdBQU8sQ0FBQyxJQUFJLENBQUMsV0EzOEIyQixNQUFNLENBMjhCdEIsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUE7SUFDbkU7R0FDRjs7QUFFRCxTQUFPLEVBQUMsT0FBTyxFQUFFLGNBQWMsRUFBQyxDQUFBO0VBQ2hDO09BQ0Qsb0JBQW9CLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sS0FBSztBQUNoRCxRQUFNLGFBQWEsR0FBRyxNQUNyQixPQWo5QmdDLFlBQVksQ0FpOUIvQixPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxVQWo5Qi9DLE9BQU8sVUFENEUsUUFBUSxBQWs5QnZCLENBQUMsQ0FBQTtBQUNwRSxNQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFDbkIsT0FBTyxFQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxFQUFDLENBQUEsS0FDbkQ7ZUFDNEIsV0E3OEJsQyxTQUFTLFNBR21DLFFBQVEsRUEwOEJFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUNqRSxDQUFDLGFBQWEsRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUNoQyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUM7Ozs7U0FGUixlQUFlO1NBQUUsSUFBSTs7QUFHNUIsU0FBTSxRQUFRLEdBQUcsMkJBQTJCLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSTtBQUMzRCxXQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQ2xDLE1BQU0sQ0FBQyxHQUFFLGtCQWgrQk4sSUFBSSxFQWcrQk8sR0FBRyxDQUFDLEVBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFBO0FBQ2xELFFBQUksTUFBTSxFQUNULENBQUMsQ0FBQyxJQUFJLFVBNTlCVixPQUFPLEFBNDlCYSxDQUFBO0FBQ2pCLFdBQU8sQ0FBQyxDQUFBO0lBQ1IsQ0FBQyxDQUFBO0FBQ0YsVUFBTyxFQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUMsQ0FBQTtHQUNsQztFQUNEO09BQ0QsYUFBYSxHQUFHLENBQUMsSUFBSTtBQUNwQixNQUFJLENBQUMsbUJBbjlCcUUsSUFBSSxBQW05QnpELEVBQ3BCLE9BQU8sRUFBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBQyxDQUFBLEtBQy9CLElBQUksQ0FBQyxtQkE5OUJRLE9BQU8sQUE4OUJJLEVBQzVCLE9BQU8sRUFBQyxJQUFJLEVBQUUsVUFwOUJELEdBQUcsRUFvOUJFLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUMsQ0FBQSxLQUNwRTtBQUNKLFVBQU8sQ0FBQyxLQUFLLENBQUMsV0FqK0J3RSxPQUFPLFNBQXpCLE9BQU8sRUFpK0I1QyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLDBCQUEwQixDQUFDLENBQUE7QUFDckUsVUFBTyxtQkFBbUIsQ0FBQyxnQkFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUMxQztFQUNEO09BQ0QsbUJBQW1CLEdBQUcsTUFBTSxJQUFJO0FBQy9CLFFBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUMzQixNQUFJLEtBQUssQ0FBQTtBQUNULE1BQUksS0FBSyxtQkF4K0JTLE9BQU8sQUF3K0JHLEVBQzNCLEtBQUssR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQSxLQUM1QjtBQUNKLFVBQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxtQkFsK0JzRCxJQUFJLEFBaytCMUMsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLGtDQUFrQyxDQUFDLENBQUE7QUFDbkYsUUFBSyxHQUFHLEVBQUUsQ0FBQTtHQUNWO0FBQ0QsT0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDdEIsT0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUU7QUFDbEMsVUFBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLG1CQWgvQkYsT0FBTyxBQWcvQmMsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUNyRSxrQ0FBa0MsQ0FBQyxDQUFBO0FBQ3BDLFFBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQ3RCO0FBQ0QsU0FBTyxFQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFDLENBQUE7RUFDeEQ7T0FDRCxpQkFBaUIsR0FBRyxPQUFPLElBQzFCLE9BQU8sQ0FBQyxLQUFLLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsVUE1K0IrQixNQUFNLEVBNCtCOUIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUE7O0FBRS9ELE9BQ0MsU0FBUyxHQUFHLEdBQUcsSUFBSSxNQUFNLElBQUk7MEJBQ0osY0FBYyxDQUFDLE1BQU0sQ0FBQzs7OztRQUF2QyxNQUFNO1FBQUUsS0FBSzs7QUFDcEIsU0FBTyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0VBQ3pFO09BQ0QsZ0JBQWdCLEdBQUcsTUFBTSxJQUN4QixVQXAvQmdELElBQUksRUFvL0IvQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNO2dCQUU1QixVQXQvQnVCLE1BQU0sRUFzL0J0QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLFdBaGdDdkMsU0FBUyxTQUtULEtBQUssRUEyL0JtRCxDQUFDLENBQUMsQ0FBQyxFQUN2RCxBQUFDLEtBQWUsSUFBSztPQUFuQixNQUFNLEdBQVAsS0FBZSxDQUFkLE1BQU07T0FBRSxLQUFLLEdBQWQsS0FBZSxDQUFOLEtBQUs7O0FBQ2QsVUFBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsc0JBQXNCLENBQUMsQ0FBQTtBQUN0RSxVQUFPLENBQUMsMkJBQTJCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7R0FDakUsRUFDRCxNQUFNLENBQUMsV0E3Z0NxQyxpQkFBaUIsQ0E2Z0NoQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Ozs7UUFOeEQsT0FBTztRQUFFLEdBQUc7O0FBT25CLFNBQU8sV0FoaENtRSxRQUFRLENBZ2hDOUQsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUE7RUFDN0MsQ0FBQyxDQUFBO0FBQ0osT0FDQyxVQUFVLEdBQUcsU0FBUyxRQWxoQ3NCLEtBQUssQ0FraENwQjtPQUM3QixXQUFXLEdBQUcsU0FBUyxRQW5oQzRCLE1BQU0sQ0FtaEMxQjs7O0FBRS9CLFlBQVcsR0FBRyxNQUFNLElBQUk7MEJBQ0MsY0FBYyxDQUFDLE1BQU0sQ0FBQzs7OztRQUF2QyxNQUFNO1FBQUUsS0FBSzs7QUFDcEIsUUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFBOztBQUVqQyxNQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxtQkFsaEN6QixHQUFHLEFBa2hDcUMsRUFDNUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxXQTloQzZCLFFBQVEsQ0E4aEN4QixLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDbEUsU0FBTyxPQTNoQzRCLE1BQU0sQ0EyaEMzQixFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQTtFQUM3RCxDQUFBOztBQUdGLE9BQ0MsV0FBVyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sS0FBSztBQUNuQyxRQUNDLEtBQUssR0FBRyxRQUFRLFlBdmhDNkQsWUFBWSxBQXVoQ3hEO1FBQ2pDLGNBQWMsR0FBRyxLQUFLLEdBQUcsWUFBWSxHQUFHLFdBQVc7UUFDbkQsVUFBVSxHQUFHLEtBQUssR0FBRyxhQUFhLEdBQUcsWUFBWTtRQUNqRCxNQUFNLEdBQUcsS0FBSyxVQXJpQ1MsU0FBUyxVQUFuQixRQUFRLEFBcWlDZ0I7UUFDckMsS0FBSyxHQUFHLEtBQUssVUF0aENtQixTQUFTLFVBQW5CLFFBQVEsQUFzaENNO1FBQ3BDLE9BQU8sR0FBRyxLQUFLLFVBN2hDc0QsV0FBVyxVQUF2QixVQUFVLEFBNmhDekI7UUFDMUMsT0FBTyxHQUFHLE1BQU0sa0JBN2lDWCxJQUFJLEVBNmlDWSxXQXZoQzBELFdBQVcsRUF1aEN6RCxLQUFLLENBQUMsQ0FBQztRQUN4QyxTQUFTLEdBQUcsTUFBTSxrQkE5aUNiLElBQUksRUE4aUNjLFdBeGhDd0QsV0FBVyxFQXdoQ3ZELE9BQU8sQ0FBQyxDQUFDO1FBQzVDLFdBQVcsR0FBRyxNQUFNLGtCQS9pQ2YsSUFBSSxFQStpQ2dCLFdBemhDc0QsV0FBVyxTQUw1RixVQUFVLENBOGhDd0MsQ0FBQyxDQUFBOztBQUVsRCxRQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFBOzs7QUFHekMsUUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFBO0FBQ25DLFFBQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUNqQyxTQUFPLENBQUMsS0FBSyxDQUFDLFdBeGlDZixTQUFTLEVBd2lDZ0IsS0FBSyxFQUFFLFFBQVEsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsTUFDdkQsQ0FBQyxnQkFBZ0IsR0FBRSxPQUFPLEVBQUUsRUFBQyxDQUFDLENBQUMsQ0FBQTtBQUNoQyxRQUFNLElBQUksR0FBRyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBOztBQUVwRCxRQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDOUIsZUFBYSxDQUFDLFNBQVMsRUFBRSxNQUN4QixDQUFDLDBCQUEwQixHQUFFLFNBQVMsRUFBRSxFQUFDLElBQUksR0FBRSxXQUFXLEVBQUUsRUFBQyxDQUFDLENBQUMsQ0FBQTs7QUFFaEUsUUFBTSxhQUFhLEdBQUcsU0FBUyxJQUFJO0FBQ2xDLFNBQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUNsQyxTQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDaEMsVUFBTyxDQUFDLEtBQUssQ0FBQyxXQW5qQ2hCLFNBQVMsU0FHVCxVQUFVLEVBZ2pDNEIsWUFBWSxDQUFDLEVBQUUsWUFBWSxDQUFDLEdBQUcsRUFBRSxNQUNwRSxDQUFDLFNBQVMsR0FBRSxXQUFXLEVBQUUsRUFBQyxDQUFDLENBQUMsQ0FBQTtBQUM3QixVQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLEdBQUcsRUFBRSxNQUNwRCxDQUFDLGlDQUFpQyxHQUFFLFdBQVcsRUFBRSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDdEQsVUFBTyxXQUFXLFFBcGpDcEIsVUFBVSxFQW9qQ3VCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0dBQzNDLENBQUE7O0FBRUQsTUFBSSxNQUFNLEVBQUUsUUFBUSxDQUFBOztBQUVwQixRQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUE7QUFDbkMsUUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFBO0FBQzFCLE1BQUksV0E5akNMLFNBQVMsRUE4akNNLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBRTsyQkFDSixjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDOzs7O1NBQS9DLE9BQU87U0FBRSxNQUFNOztBQUN0QixTQUFNLE1BQU0sR0FBRyw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNwRCxTQUFNLEdBQUcsV0E1a0NxQyxLQUFLLENBNGtDaEMsS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUFDekQsV0FBUSxHQUFHLFVBeGpDb0MsSUFBSSxFQXdqQ25DLFNBQVMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsTUFBTSxhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQTtHQUM1RSxNQUFNO0FBQ04sU0FBTSxHQUFHLElBQUksQ0FBQTtBQUNiLFdBQVEsR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUE7R0FDbkM7O0FBRUQsU0FBTyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7RUFDckQ7T0FDRCw0QkFBNEIsR0FBRyxNQUFNLElBQUk7QUFDeEMsTUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQ25CLE9BQU8sV0FwbEN1QyxpQkFBaUIsQ0FvbENsQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUEsS0FDcEM7QUFDSixVQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsa0NBQWtDLENBQUMsQ0FBQTtBQUN0RSxVQUFPLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQ3BDO0VBQ0QsQ0FBQTs7QUFFRixPQUFNLFdBQVcsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLEtBQUs7QUFDdkMsZUFBYSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMseUJBQXlCLEdBQUUsV0E1a0N5QixXQUFXLFNBUnpELFNBQVMsQ0FvbENrQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7O2lCQUdqRixVQTdrQ3lCLE1BQU0sRUE2a0N4QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLFdBdmxDckMsU0FBUyxTQU9LLFFBQVEsRUFnbENtQyxDQUFDLENBQUMsQ0FBQyxFQUMxRCxBQUFDLEtBQWU7T0FBZCxNQUFNLEdBQVAsS0FBZSxDQUFkLE1BQU07T0FBRSxLQUFLLEdBQWQsS0FBZSxDQUFOLEtBQUs7VUFBTSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7R0FBQSxFQUMvQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDOzs7O1FBSGhCLFVBQVU7UUFBRSxRQUFROztBQUszQixRQUFNLEtBQUssR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDeEMsUUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBdm1DN0MsSUFBSSxDQXVtQ2tELFVBQVUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBbGxDSCxJQUFJLEVBa2xDSSxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQzVGLFNBQU8sV0ExbUNBLE1BQU0sQ0EwbUNLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTtFQUNyRCxDQUFBOztBQUVELE9BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSTswQkFDSixjQUFjLENBQUMsTUFBTSxDQUFDOzs7O1FBQXZDLE1BQU07UUFBRSxLQUFLOztBQUNwQixRQUFNLFVBQVUsR0FBRyxVQXhsQzhCLElBQUksRUF3bEM3QixDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBOztBQUVuRSxNQUFJLElBQUksR0FBRyxJQUFJO01BQUUsT0FBTyxHQUFHLEVBQUU7TUFBRSxhQUFhLEdBQUcsSUFBSTtNQUFFLE9BQU8sR0FBRyxFQUFFLENBQUE7O3lCQUV6QyxjQUFjLENBQUMsS0FBSyxDQUFDOzs7O01BQXhDLFNBQVM7TUFBRSxJQUFJOztBQUVwQixRQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7QUFDOUIsTUFBSSxXQXptQ0osU0FBUyxTQUU0QixLQUFLLEVBdW1DckIsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUU7QUFDbkMsU0FBTSxJQUFJLEdBQUcsV0FBVyxRQXhtQ1ksS0FBSyxFQXdtQ1QsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7QUFDN0MsT0FBSSxHQUFHLFdBdG5Dc0QsT0FBTyxDQXNuQ2pELEtBQUssQ0FBQyxHQUFHLEVBQUUsV0FubkNpQixpQkFBaUIsQ0FtbkNaLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUNyRSxPQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO0dBQ2xCO0FBQ0QsTUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtBQUNwQixTQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7QUFDOUIsT0FBSSxXQWhuQ0wsU0FBUyxTQU0yQixTQUFTLEVBMG1DbkIsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUU7QUFDdkMsV0FBTyxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUNyQyxRQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO0lBQ2xCO0FBQ0QsT0FBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtBQUNwQixVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7QUFDOUIsUUFBSSxXQXRuQ04sU0FBUyxTQUVULFlBQVksRUFvbkNrQixLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRTtBQUMxQyxrQkFBYSxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQy9DLFNBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7S0FDbEI7QUFDRCxXQUFPLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdCO0dBQ0Q7O0FBRUQsU0FBTyxXQXpvQ2dELEtBQUssQ0F5b0MzQyxNQUFNLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUE7RUFDMUYsQ0FBQTs7QUFFRCxPQUNDLGlCQUFpQixHQUFHLE1BQU0sSUFBSTswQkFFNUIsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUM7O1FBRDlCLElBQUkscUJBQUosSUFBSTtRQUFFLFVBQVUscUJBQVYsVUFBVTtRQUFFLFNBQVMscUJBQVQsU0FBUztRQUFFLEtBQUsscUJBQUwsS0FBSztRQUFFLElBQUkscUJBQUosSUFBSTtRQUFFLEtBQUsscUJBQUwsS0FBSzs7QUFFdEQsUUFBTSxXQUFXLEdBQUcsS0FBSztRQUFFLFlBQVksR0FBRyxJQUFJLENBQUE7QUFDOUMsUUFBTSxHQUFHLEdBQUcsV0Evb0M4QyxHQUFHLENBK29DekMsTUFBTSxDQUFDLEdBQUcsRUFDN0IsV0E5b0NlLGdCQUFnQixDQThvQ1YsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUNoQyxXQUFXLEVBQ1gsSUFBSSxFQUFFLFNBQVMsRUFDZixLQUFLLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQTtBQUNsQyxTQUFPLFdBcnBDUixXQUFXLENBcXBDYSxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQTtFQUNuRDtPQUNELGFBQWEsR0FBRyxNQUFNLElBQUk7QUFDekIsUUFBTSxLQUFLLEdBQUcsU0FBUyxRQXhvQ1ksU0FBUyxFQXdvQ1QsTUFBTSxDQUFDLENBQUE7QUFDMUMsU0FBTyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7RUFDM0I7T0FDRCxhQUFhLEdBQUcsTUFBTSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDO09BQ3hELFlBQVksR0FBRyxNQUFNLElBQUk7QUFDeEIsUUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBOztBQUUxQixNQUFJLFdBcnBDTCxTQUFTLFNBSWlELE1BQU0sRUFpcEN6QyxJQUFJLENBQUMsRUFBRTsyQkFDSixjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDOzs7O1NBQTlDLE1BQU07U0FBRSxLQUFLOztBQUNwQixVQUFPLFdBN3BDVCxZQUFZLENBNnBDYyxNQUFNLENBQUMsR0FBRyxFQUFFLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxFQUFFLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0dBQ3JGLE1BQU0sSUFBSSxXQXhwQ1osU0FBUyxTQU1tQixNQUFNLEVBa3BDSixJQUFJLENBQUMsRUFBRTsyQkFDWCxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDOzs7O1NBQTlDLE1BQU07U0FBRSxLQUFLOztBQUNwQixVQUFPLFdBaHFDaUIsWUFBWSxDQWdxQ1osTUFBTSxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtHQUNwRixNQUFNO0FBQ04sU0FBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ2xELFVBQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLElBQUksRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLHdDQUF3QyxDQUFDLENBQUE7U0FDMUUsTUFBTSxHQUFlLEdBQUcsQ0FBeEIsTUFBTTtTQUFFLEVBQUUsR0FBVyxHQUFHLENBQWhCLEVBQUU7U0FBRSxLQUFLLEdBQUksR0FBRyxDQUFaLEtBQUs7O0FBQ3hCLFNBQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUE7QUFDL0MsVUFBTyxXQXRxQ0ssVUFBVSxDQXNxQ0EsTUFBTSxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtHQUNsRTtFQUNEOzs7QUFFRCxtQkFBa0IsR0FBRyxNQUFNLElBQUk7QUFDOUIsUUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzlCLFFBQU0sUUFBUSxHQUFHLElBQUksbUJBMXFDTyxLQUFLLEFBMHFDSyxJQUNyQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQ3ZCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUE7QUFDbEMsU0FBTyxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7RUFDdEM7T0FDRCxjQUFjLEdBQUcsWUFBWSxJQUFJO0FBQ2hDLFVBQVEsWUFBWSxDQUFDLElBQUk7QUFDeEIsZUExcUNvRCxNQUFNO0FBMHFDN0Msa0JBenFDZixVQUFVLENBeXFDc0I7QUFBQSxBQUM5QixlQTNxQzRELFFBQVE7QUEycUNyRCxrQkExcUNMLFlBQVksQ0EwcUNZO0FBQUEsQUFDbEMsZUE1cUNzRSxTQUFTO0FBNHFDL0Qsa0JBM3FDUSxhQUFhLENBMnFDRDtBQUFBLEFBQ3BDLGVBN3FDaUYsV0FBVztBQTZxQzFFLGtCQTVxQ3FCLGVBQWUsQ0E0cUNkO0FBQUEsQUFDeEMsZUE3cUNGLFVBQVUsQ0E2cUNRLEFBQUMsWUE3cUNQLFlBQVksQ0E2cUNhLEFBQUMsWUE3cUNaLGFBQWEsQ0E2cUNrQixBQUFDLFlBN3FDakIsZUFBZTtBQThxQ3JELFdBQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSx1Q0FBdUMsQ0FBQyxDQUFBO0FBQUEsQUFDeEU7QUFDQyxXQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQyw0QkFBNEIsR0FBRSxZQUFZLEVBQUMsQ0FBQyxDQUFDLENBQUE7QUFBQSxHQUM5RTtFQUNEO09BQ0QsYUFBYSxHQUFHLFlBQVksSUFBSTtBQUMvQixNQUFJLFlBQVksbUJBeHJDTixPQUFPLEFBd3JDa0IsRUFDbEMsUUFBUSxZQUFZLENBQUMsSUFBSTtBQUN4QixlQXZyQ21ELE1BQU0sQ0F1ckM3QyxBQUFDLFlBdnJDOEMsUUFBUSxDQXVyQ3hDLEFBQUMsWUF2ckN5QyxTQUFTLENBdXJDbkMsQUFBQyxZQXZyQ29DLFdBQVcsQ0F1ckM5QjtBQUM3RCxlQXZyQ0gsVUFBVSxDQXVyQ1MsQUFBQyxZQXZyQ1IsWUFBWSxDQXVyQ2MsQUFBQyxZQXZyQ2IsYUFBYSxDQXVyQ21CO0FBQ3ZELGVBeHJDc0MsZUFBZTtBQXlyQ3BELFdBQU8sSUFBSSxDQUFBO0FBQUEsQUFDWjtBQUNDLFdBQU8sS0FBSyxDQUFBO0FBQUEsR0FDYixNQUVELE9BQU8sS0FBSyxDQUFBO0VBQ2IsQ0FBQTs7QUFFRixPQUFNLFVBQVUsR0FBRyxNQUFNLElBQ3hCLFdBMXNDNkIsS0FBSyxDQTBzQ3hCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxHQUFHLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBOztBQUVuRixPQUFNLFNBQVMsR0FBRyxNQUFNLElBQUk7MEJBQ0gsY0FBYyxDQUFDLE1BQU0sQ0FBQzs7OztRQUF2QyxNQUFNO1FBQUUsS0FBSzs7aUJBRUcsVUFqc0NHLE1BQU0sRUFpc0NGLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksV0Ezc0MzRCxTQUFTLFNBQW1CLEtBQUssRUEyc0MyQyxDQUFDLENBQUMsQ0FBQyxFQUM5RSxBQUFDLE1BQWUsSUFBSztPQUFuQixNQUFNLEdBQVAsTUFBZSxDQUFkLE1BQU07T0FBRSxLQUFLLEdBQWQsTUFBZSxDQUFOLEtBQUs7O0FBQ2QsVUFBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLE1BQU0sQ0FBQyw0QkFBNEIsR0FBRSxrQkEzdENsRSxJQUFJLEVBMnRDbUUsSUFBSSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNyRixVQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUE7R0FDaEUsRUFDRCxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFdBeHRDZ0IsaUJBQWlCLENBd3RDWCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7OztRQUw1RCxHQUFHO1FBQUUsT0FBTzs7QUFPbkIsU0FBTyxXQXB0Q29CLElBQUksQ0FvdENmLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtFQUM5RCxDQUFBOztBQUVELE9BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSTtBQUM3QixRQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSTtBQUMvQixPQUFJLFdBdnRDTCxTQUFTLFNBR21DLFFBQVEsRUFvdEMzQixDQUFDLENBQUMsRUFDekIsT0FBTyxHQUFHLENBQUEsS0FDTjtBQUNKLFdBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxtQkFsdEMwRCxJQUFJLEFBa3RDOUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyx5QkFBeUIsR0FBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUMvRSxXQUFPLENBQUMsQ0FBQyxJQUFJLENBQUE7SUFDYjtHQUNELENBQUMsQ0FBQTtBQUNGLFNBQU8sV0F4dUM2QixNQUFNLENBd3VDeEIsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQTtFQUN0QyxDQUFBOztBQUVELE9BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSTtBQUMzQixRQUFNLEtBQUssR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDcEMsU0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQzdDLENBQUMsR0FBRSxrQkFsdkNHLElBQUksRUFrdkNGLE1BQU0sQ0FBQyxFQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQTtBQUM5QyxTQUFPLFdBaHZDZ0UsSUFBSSxDQWd2QzNELE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtFQUN6RCxDQUFBOztBQUVELE9BQU0sY0FBYyxHQUFHLEtBQUssSUFBSTtBQUMvQixNQUFJLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDakIsTUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFBOztBQUVoQixTQUFPLElBQUksRUFBRTtBQUNaLE9BQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUNqQixNQUFLOztBQUVOLFNBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUMzQixTQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDbkIsT0FBSSxFQUFFLENBQUMsbUJBbnZDRCxVQUFVLENBbXZDYSxBQUFDLEVBQzdCLE1BQUs7O0FBRU4sYUEzdUNNLE1BQU0sRUEydUNMLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQTtBQUN2QixXQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2hCLE9BQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7R0FDbEI7O0FBRUQsU0FBTyxDQUFDLFVBaHZDMEIsT0FBTyxFQWd2Q3pCLFFBQVEsQ0FBQyxHQUFHLElBQUksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO0VBQzlFLENBQUEiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9wYXJzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IExvYyBmcm9tICdlc2FzdC9kaXN0L0xvYydcbmltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtBc3NlcnQsIEFzc2lnbkRlc3RydWN0dXJlLCBBc3NpZ25TaW5nbGUsIEJhZ0VudHJ5LCBCYWdFbnRyeU1hbnksIEJhZ1NpbXBsZSwgQmxvY2tCYWcsXG5cdEJsb2NrRG8sIEJsb2NrTWFwLCBCbG9ja09iaiwgQmxvY2tWYWxUaHJvdywgQmxvY2tXaXRoUmV0dXJuLCBCbG9ja1dyYXAsIEJyZWFrLCBCcmVha1dpdGhWYWwsXG5cdENhbGwsIENhc2VEbywgQ2FzZURvUGFydCwgQ2FzZVZhbCwgQ2FzZVZhbFBhcnQsIENhdGNoLCBDbGFzcywgQ2xhc3NEbywgQ29uZCwgQ29uZGl0aW9uYWxEbyxcblx0Q29uc3RydWN0b3IsIENvbmRpdGlvbmFsVmFsLCBEZWJ1ZywgSWdub3JlLCBJbXBvcnQsIEltcG9ydERvLCBJbXBvcnRHbG9iYWwsIEl0ZXJhdGVlLFxuXHROdW1iZXJMaXRlcmFsLCBFeGNlcHREbywgRXhjZXB0VmFsLCBGb3JCYWcsIEZvckRvLCBGb3JWYWwsIEZ1biwgTF9BbmQsIExfT3IsIExhenksIExEX0NvbnN0LFxuXHRMRF9MYXp5LCBMRF9NdXRhYmxlLCBMb2NhbEFjY2VzcywgTG9jYWxEZWNsYXJlLCBMb2NhbERlY2xhcmVGb2N1cywgTG9jYWxEZWNsYXJlTmFtZSxcblx0TG9jYWxEZWNsYXJlUmVzLCBMb2NhbERlY2xhcmVUaGlzLCBMb2NhbE11dGF0ZSwgTG9naWMsIE1hcEVudHJ5LCBNZW1iZXIsIE1lbWJlclNldCxcblx0TWV0aG9kR2V0dGVyLCBNZXRob2RJbXBsLCBNZXRob2RTZXR0ZXIsIE1vZHVsZSwgTW9kdWxlRXhwb3J0RGVmYXVsdCwgTW9kdWxlRXhwb3J0TmFtZWQsXG5cdE1TX011dGF0ZSwgTVNfTmV3LCBNU19OZXdNdXRhYmxlLCBOZXcsIE5vdCwgT2JqRW50cnksIE9iakVudHJ5QXNzaWduLCBPYmpFbnRyeUNvbXB1dGVkLFxuXHRPYmpQYWlyLCBPYmpTaW1wbGUsIFBhdHRlcm4sIFF1b3RlLCBRdW90ZVRlbXBsYXRlLCBTRF9EZWJ1Z2dlciwgU3BlY2lhbERvLCBTcGVjaWFsVmFsLCBTVl9OYW1lLFxuXHRTVl9OdWxsLCBTcGxhdCwgU3VwZXJDYWxsLCBTdXBlckNhbGxEbywgU3VwZXJNZW1iZXIsIFN3aXRjaERvLCBTd2l0Y2hEb1BhcnQsIFN3aXRjaFZhbCxcblx0U3dpdGNoVmFsUGFydCwgVGhyb3csIFZhbCwgV2l0aCwgWWllbGQsIFlpZWxkVG99IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtEb2NDb21tZW50LCBEb3ROYW1lLCBHcm91cCwgR19CbG9jaywgR19CcmFja2V0LCBHX1BhcmVudGhlc2lzLCBHX1NwYWNlLCBHX1F1b3RlLCBpc0dyb3VwLFxuXHRpc0tleXdvcmQsIEtleXdvcmQsIEtXX0FuZCwgS1dfQXMsIEtXX0Fzc2VydCwgS1dfQXNzZXJ0Tm90LCBLV19Bc3NpZ24sIEtXX0Fzc2lnbk11dGFibGUsXG5cdEtXX0JyZWFrLCBLV19CcmVha1dpdGhWYWwsIEtXX0Nhc2VWYWwsIEtXX0Nhc2VEbywgS1dfQ29uZCwgS1dfQ2F0Y2hEbywgS1dfQ2F0Y2hWYWwsIEtXX0NsYXNzLFxuXHRLV19Db25zdHJ1Y3QsIEtXX0RlYnVnLCBLV19EZWJ1Z2dlciwgS1dfRG8sIEtXX0VsbGlwc2lzLCBLV19FbHNlLCBLV19FeGNlcHREbywgS1dfRXhjZXB0VmFsLFxuXHRLV19GaW5hbGx5LCBLV19Gb3JCYWcsIEtXX0ZvckRvLCBLV19Gb3JWYWwsIEtXX0ZvY3VzLCBLV19GdW4sIEtXX0Z1bkRvLCBLV19GdW5HZW4sIEtXX0Z1bkdlbkRvLFxuXHRLV19GdW5UaGlzLCBLV19GdW5UaGlzRG8sIEtXX0Z1blRoaXNHZW4sIEtXX0Z1blRoaXNHZW5EbywgS1dfR2V0LCBLV19JZkRvLCBLV19JZlZhbCwgS1dfSWdub3JlLFxuXHRLV19JbiwgS1dfTGF6eSwgS1dfTG9jYWxNdXRhdGUsIEtXX01hcEVudHJ5LCBLV19OYW1lLCBLV19OZXcsIEtXX05vdCwgS1dfT2JqQXNzaWduLCBLV19Pcixcblx0S1dfUGFzcywgS1dfT3V0LCBLV19SZWdpb24sIEtXX1NldCwgS1dfU3RhdGljLCBLV19TdXBlckRvLCBLV19TdXBlclZhbCwgS1dfU3dpdGNoRG8sXG5cdEtXX1N3aXRjaFZhbCwgS1dfVGhyb3csIEtXX1RyeURvLCBLV19UcnlWYWwsIEtXX1R5cGUsIEtXX1VubGVzc0RvLCBLV19Vbmxlc3NWYWwsIEtXX0ltcG9ydCxcblx0S1dfSW1wb3J0RGVidWcsIEtXX0ltcG9ydERvLCBLV19JbXBvcnRMYXp5LCBLV19XaXRoLCBLV19ZaWVsZCwgS1dfWWllbGRUbywgTmFtZSwga2V5d29yZE5hbWUsXG5cdG9wS2V5d29yZEtpbmRUb1NwZWNpYWxWYWx1ZUtpbmR9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHthc3NlcnQsIGNhdCwgaGVhZCwgaWZFbHNlLCBpc0VtcHR5LCBsYXN0LCBvcElmLCBvcE1hcCwgcmVwZWF0LCBydGFpbCwgdGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vLyBTaW5jZSB0aGVyZSBhcmUgc28gbWFueSBwYXJzaW5nIGZ1bmN0aW9ucyxcbi8vIGl0J3MgZmFzdGVyIChhcyBvZiBub2RlIHYwLjExLjE0KSB0byBoYXZlIHRoZW0gYWxsIGNsb3NlIG92ZXIgdGhpcyBtdXRhYmxlIHZhcmlhYmxlIG9uY2Vcbi8vIHRoYW4gdG8gY2xvc2Ugb3ZlciB0aGUgcGFyYW1ldGVyIChhcyBpbiBsZXguanMsIHdoZXJlIHRoYXQncyBtdWNoIGZhc3RlcikuXG5sZXQgY29udGV4dFxuXG4vKlxuVGhpcyBjb252ZXJ0cyBhIFRva2VuIHRyZWUgdG8gYSBNc0FzdC5cblRoaXMgaXMgYSByZWN1cnNpdmUtZGVzY2VudCBwYXJzZXIsIG1hZGUgZWFzaWVyIGJ5IHR3byBmYWN0czpcblx0KiBXZSBoYXZlIGFscmVhZHkgZ3JvdXBlZCB0b2tlbnMuXG5cdCogTW9zdCBvZiB0aGUgdGltZSwgYW4gYXN0J3MgdHlwZSBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBmaXJzdCB0b2tlbi5cblxuVGhlcmUgYXJlIGV4Y2VwdGlvbnMgc3VjaCBhcyBhc3NpZ25tZW50IHN0YXRlbWVudHMgKGluZGljYXRlZCBieSBhIGA9YCBzb21ld2hlcmUgaW4gdGhlIG1pZGRsZSkuXG5Gb3IgdGhvc2Ugd2UgbXVzdCBpdGVyYXRlIHRocm91Z2ggdG9rZW5zIGFuZCBzcGxpdC5cbihTZWUgU2xpY2Uub3BTcGxpdE9uY2VXaGVyZSBhbmQgU2xpY2Uub3BTcGxpdE1hbnlXaGVyZS4pXG4qL1xuZXhwb3J0IGRlZmF1bHQgKF9jb250ZXh0LCByb290VG9rZW4pID0+IHtcblx0Y29udGV4dCA9IF9jb250ZXh0XG5cdGNvbnN0IG1zQXN0ID0gcGFyc2VNb2R1bGUoU2xpY2UuZ3JvdXAocm9vdFRva2VuKSlcblx0Ly8gUmVsZWFzZSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9ucy5cblx0Y29udGV4dCA9IHVuZGVmaW5lZFxuXHRyZXR1cm4gbXNBc3Rcbn1cblxuY29uc3Rcblx0Y2hlY2tFbXB0eSA9ICh0b2tlbnMsIG1lc3NhZ2UpID0+XG5cdFx0Y29udGV4dC5jaGVjayh0b2tlbnMuaXNFbXB0eSgpLCB0b2tlbnMubG9jLCBtZXNzYWdlKSxcblx0Y2hlY2tOb25FbXB0eSA9ICh0b2tlbnMsIG1lc3NhZ2UpID0+XG5cdFx0Y29udGV4dC5jaGVjayghdG9rZW5zLmlzRW1wdHkoKSwgdG9rZW5zLmxvYywgbWVzc2FnZSksXG5cdHVuZXhwZWN0ZWQgPSB0b2tlbiA9PiBjb250ZXh0LmZhaWwodG9rZW4ubG9jLCBgVW5leHBlY3RlZCAke3Rva2VufWApXG5cbmNvbnN0IHBhcnNlTW9kdWxlID0gdG9rZW5zID0+IHtcblx0Ly8gTW9kdWxlIGRvYyBjb21tZW50IG11c3QgY29tZSBmaXJzdC5cblx0Y29uc3QgW29wQ29tbWVudCwgcmVzdDBdID0gdHJ5VGFrZUNvbW1lbnQodG9rZW5zKVxuXHQvLyBJbXBvcnQgc3RhdGVtZW50cyBtdXN0IGFwcGVhciBpbiBvcmRlci5cblx0Y29uc3Qge2ltcG9ydHM6IGRvSW1wb3J0cywgcmVzdDogcmVzdDF9ID0gdHJ5UGFyc2VJbXBvcnRzKEtXX0ltcG9ydERvLCByZXN0MClcblx0Y29uc3Qge2ltcG9ydHM6IHBsYWluSW1wb3J0cywgb3BJbXBvcnRHbG9iYWwsIHJlc3Q6IHJlc3QyfSA9IHRyeVBhcnNlSW1wb3J0cyhLV19JbXBvcnQsIHJlc3QxKVxuXHRjb25zdCB7aW1wb3J0czogbGF6eUltcG9ydHMsIHJlc3Q6IHJlc3QzfSA9IHRyeVBhcnNlSW1wb3J0cyhLV19JbXBvcnRMYXp5LCByZXN0Milcblx0Y29uc3Qge2ltcG9ydHM6IGRlYnVnSW1wb3J0cywgcmVzdDogcmVzdDR9ID0gdHJ5UGFyc2VJbXBvcnRzKEtXX0ltcG9ydERlYnVnLCByZXN0MylcblxuXHRjb25zdCBsaW5lcyA9IHBhcnNlTW9kdWxlQmxvY2socmVzdDQpXG5cblx0aWYgKGNvbnRleHQub3B0cy5pbmNsdWRlTW9kdWxlTmFtZSgpKSB7XG5cdFx0Y29uc3QgbmFtZSA9IG5ldyBMb2NhbERlY2xhcmVOYW1lKHRva2Vucy5sb2MpXG5cdFx0Y29uc3QgYXNzaWduID0gbmV3IEFzc2lnblNpbmdsZSh0b2tlbnMubG9jLCBuYW1lLFxuXHRcdFx0UXVvdGUuZm9yU3RyaW5nKHRva2Vucy5sb2MsIGNvbnRleHQub3B0cy5tb2R1bGVOYW1lKCkpKVxuXHRcdGxpbmVzLnB1c2gobmV3IE1vZHVsZUV4cG9ydE5hbWVkKHRva2Vucy5sb2MsIGFzc2lnbikpXG5cdH1cblxuXHRjb25zdCBpbXBvcnRzID0gcGxhaW5JbXBvcnRzLmNvbmNhdChsYXp5SW1wb3J0cylcblx0cmV0dXJuIG5ldyBNb2R1bGUoXG5cdFx0dG9rZW5zLmxvYywgb3BDb21tZW50LCBkb0ltcG9ydHMsIGltcG9ydHMsIG9wSW1wb3J0R2xvYmFsLCBkZWJ1Z0ltcG9ydHMsIGxpbmVzKVxufVxuXG4vLyBwYXJzZUJsb2NrXG5jb25zdFxuXHQvLyBUb2tlbnMgb24gdGhlIGxpbmUgYmVmb3JlIGEgYmxvY2ssIGFuZCB0b2tlbnMgZm9yIHRoZSBibG9jayBpdHNlbGYuXG5cdGJlZm9yZUFuZEJsb2NrID0gdG9rZW5zID0+IHtcblx0XHRjaGVja05vbkVtcHR5KHRva2VucywgJ0V4cGVjdGVkIGFuIGluZGVudGVkIGJsb2NrLicpXG5cdFx0Y29uc3QgYmxvY2sgPSB0b2tlbnMubGFzdCgpXG5cdFx0Y29udGV4dC5jaGVjayhpc0dyb3VwKEdfQmxvY2ssIGJsb2NrKSwgYmxvY2subG9jLCAnRXhwZWN0ZWQgYW4gaW5kZW50ZWQgYmxvY2suJylcblx0XHRyZXR1cm4gW3Rva2Vucy5ydGFpbCgpLCBTbGljZS5ncm91cChibG9jayldXG5cdH0sXG5cblx0YmxvY2tXcmFwID0gdG9rZW5zID0+IG5ldyBCbG9ja1dyYXAodG9rZW5zLmxvYywgcGFyc2VCbG9ja1ZhbCh0b2tlbnMpKSxcblxuXHRqdXN0QmxvY2sgPSAoa2V5d29yZCwgdG9rZW5zKSA9PiB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRcdGNoZWNrRW1wdHkoYmVmb3JlLCAoKSA9PlxuXHRcdFx0YERpZCBub3QgZXhwZWN0IGFueXRoaW5nIGJldHdlZW4gJHtjb2RlKGtleXdvcmROYW1lKGtleXdvcmQpKX0gYW5kIGJsb2NrLmApXG5cdFx0cmV0dXJuIGJsb2NrXG5cdH0sXG5cdGp1c3RCbG9ja0RvID0gKGtleXdvcmQsIHRva2VucykgPT5cblx0XHRwYXJzZUJsb2NrRG8oanVzdEJsb2NrKGtleXdvcmQsIHRva2VucykpLFxuXHRqdXN0QmxvY2tWYWwgPSAoa2V5d29yZCwgdG9rZW5zKSA9PlxuXHRcdHBhcnNlQmxvY2tWYWwoanVzdEJsb2NrKGtleXdvcmQsIHRva2VucykpLFxuXG5cdC8vIEdldHMgbGluZXMgaW4gYSByZWdpb24gb3IgRGVidWcuXG5cdHBhcnNlTGluZXNGcm9tQmxvY2sgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpXG5cdFx0Y29udGV4dC5jaGVjayh0b2tlbnMuc2l6ZSgpID4gMSAmJiB0b2tlbnMuc2l6ZSgpID09PSAyICYmIGlzR3JvdXAoR19CbG9jaywgdG9rZW5zLnNlY29uZCgpKSxcblx0XHRcdGgubG9jLCAoKSA9PlxuXHRcdFx0YEV4cGVjdGVkIGluZGVudGVkIGJsb2NrIGFmdGVyICR7aH0sIGFuZCBub3RoaW5nIGVsc2UuYClcblx0XHRjb25zdCBibG9jayA9IHRva2Vucy5zZWNvbmQoKVxuXG5cdFx0Y29uc3QgbGluZXMgPSBbXVxuXHRcdGZvciAoY29uc3QgbGluZSBvZiBTbGljZS5ncm91cChibG9jaykuc2xpY2VzKCkpXG5cdFx0XHRsaW5lcy5wdXNoKC4uLnBhcnNlTGluZU9yTGluZXMobGluZSkpXG5cdFx0cmV0dXJuIGxpbmVzXG5cdH0sXG5cblx0cGFyc2VCbG9ja0RvID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBbb3BDb21tZW50LCByZXN0XSA9IHRyeVRha2VDb21tZW50KHRva2Vucylcblx0XHRjb25zdCBsaW5lcyA9IF9wbGFpbkJsb2NrTGluZXMocmVzdClcblx0XHRyZXR1cm4gbmV3IEJsb2NrRG8odG9rZW5zLmxvYywgb3BDb21tZW50LCBsaW5lcylcblx0fSxcblxuXHRwYXJzZUJsb2NrVmFsID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBbb3BDb21tZW50LCByZXN0XSA9IHRyeVRha2VDb21tZW50KHRva2Vucylcblx0XHRjb25zdCB7bGluZXMsIGtSZXR1cm59ID0gX3BhcnNlQmxvY2tMaW5lcyhyZXN0KVxuXHRcdHN3aXRjaCAoa1JldHVybikge1xuXHRcdFx0Y2FzZSBLUmV0dXJuX0JhZzpcblx0XHRcdFx0cmV0dXJuIEJsb2NrQmFnLm9mKHRva2Vucy5sb2MsIG9wQ29tbWVudCwgbGluZXMpXG5cdFx0XHRjYXNlIEtSZXR1cm5fTWFwOlxuXHRcdFx0XHRyZXR1cm4gQmxvY2tNYXAub2YodG9rZW5zLmxvYywgb3BDb21tZW50LCBsaW5lcylcblx0XHRcdGNhc2UgS1JldHVybl9PYmo6XG5cdFx0XHRcdGNvbnN0IFtkb0xpbmVzLCBvcFZhbF0gPSBfdHJ5VGFrZUxhc3RWYWwobGluZXMpXG5cdFx0XHRcdC8vIG9wTmFtZSB3cml0dGVuIHRvIGJ5IF90cnlBZGROYW1lLlxuXHRcdFx0XHRyZXR1cm4gQmxvY2tPYmoub2YodG9rZW5zLmxvYywgb3BDb21tZW50LCBkb0xpbmVzLCBvcFZhbCwgbnVsbClcblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0Y29udGV4dC5jaGVjayghaXNFbXB0eShsaW5lcyksIHRva2Vucy5sb2MsICdWYWx1ZSBibG9jayBtdXN0IGVuZCBpbiBhIHZhbHVlLicpXG5cdFx0XHRcdGNvbnN0IHZhbCA9IGxhc3QobGluZXMpXG5cdFx0XHRcdGlmICh2YWwgaW5zdGFuY2VvZiBUaHJvdylcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEJsb2NrVmFsVGhyb3codG9rZW5zLmxvYywgb3BDb21tZW50LCBydGFpbChsaW5lcyksIHZhbClcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayh2YWwgaW5zdGFuY2VvZiBWYWwsIHZhbC5sb2MsICdWYWx1ZSBibG9jayBtdXN0IGVuZCBpbiBhIHZhbHVlLicpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBCbG9ja1dpdGhSZXR1cm4odG9rZW5zLmxvYywgb3BDb21tZW50LCBydGFpbChsaW5lcyksIHZhbClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRwYXJzZU1vZHVsZUJsb2NrID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCB7bGluZXMsIGtSZXR1cm59ID0gX3BhcnNlQmxvY2tMaW5lcyh0b2tlbnMsIHRydWUpXG5cdFx0Y29uc3Qgb3BDb21tZW50ID0gbnVsbFxuXHRcdGNvbnN0IGxvYyA9IHRva2Vucy5sb2Ncblx0XHRzd2l0Y2ggKGtSZXR1cm4pIHtcblx0XHRcdGNhc2UgS1JldHVybl9CYWc6IGNhc2UgS1JldHVybl9NYXA6IHtcblx0XHRcdFx0Y29uc3QgY2xzID0ga1JldHVybiA9PT0gS1JldHVybl9CYWcgPyBCbG9ja0JhZyA6IEJsb2NrTWFwXG5cdFx0XHRcdGNvbnN0IGJsb2NrID0gY2xzLm9mKGxvYywgb3BDb21tZW50LCBsaW5lcylcblx0XHRcdFx0Y29uc3QgdmFsID0gbmV3IEJsb2NrV3JhcChsb2MsIGJsb2NrKVxuXHRcdFx0XHRjb25zdCBhc3NpZ25lZSA9IExvY2FsRGVjbGFyZS5wbGFpbihsb2MsIGNvbnRleHQub3B0cy5tb2R1bGVOYW1lKCkpXG5cdFx0XHRcdGNvbnN0IGFzc2lnbiA9IG5ldyBBc3NpZ25TaW5nbGUobG9jLCBhc3NpZ25lZSwgdmFsKVxuXHRcdFx0XHRyZXR1cm4gW25ldyBNb2R1bGVFeHBvcnREZWZhdWx0KGxvYywgYXNzaWduKV1cblx0XHRcdH1cblx0XHRcdGNhc2UgS1JldHVybl9PYmo6IHtcblx0XHRcdFx0Y29uc3QgbW9kdWxlTmFtZSA9IGNvbnRleHQub3B0cy5tb2R1bGVOYW1lKClcblxuXHRcdFx0XHQvLyBNb2R1bGUgZXhwb3J0cyBsb29rIGxpa2UgYSBCbG9ja09iaiwgIGJ1dCBhcmUgcmVhbGx5IGRpZmZlcmVudC5cblx0XHRcdFx0Ly8gSW4gRVM2LCBtb2R1bGUgZXhwb3J0cyBtdXN0IGJlIGNvbXBsZXRlbHkgc3RhdGljLlxuXHRcdFx0XHQvLyBTbyB3ZSBrZWVwIGFuIGFycmF5IG9mIGV4cG9ydHMgYXR0YWNoZWQgZGlyZWN0bHkgdG8gdGhlIE1vZHVsZSBhc3QuXG5cdFx0XHRcdC8vIElmIHlvdSB3cml0ZTpcblx0XHRcdFx0Ly9cdGlmISBjb25kXG5cdFx0XHRcdC8vXHRcdGEuIGJcblx0XHRcdFx0Ly8gaW4gYSBtb2R1bGUgY29udGV4dCwgaXQgd2lsbCBiZSBhbiBlcnJvci4gKFRoZSBtb2R1bGUgY3JlYXRlcyBubyBgYnVpbHRgIGxvY2FsLilcblx0XHRcdFx0Y29uc3QgY29udmVydFRvRXhwb3J0cyA9IGxpbmUgPT4ge1xuXHRcdFx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgT2JqRW50cnkpIHtcblx0XHRcdFx0XHRcdGNvbnRleHQuY2hlY2sobGluZSBpbnN0YW5jZW9mIE9iakVudHJ5QXNzaWduLCBsaW5lLmxvYyxcblx0XHRcdFx0XHRcdFx0J01vZHVsZSBleHBvcnRzIGNhbiBub3QgYmUgY29tcHV0ZWQuJylcblx0XHRcdFx0XHRcdGNvbnRleHQuY2hlY2sobGluZS5hc3NpZ24gaW5zdGFuY2VvZiBBc3NpZ25TaW5nbGUsIGxpbmUubG9jLFxuXHRcdFx0XHRcdFx0XHQnRXhwb3J0IEFzc2lnbkRlc3RydWN0dXJlIG5vdCB5ZXQgc3VwcG9ydGVkLicpXG5cdFx0XHRcdFx0XHRyZXR1cm4gbGluZS5hc3NpZ24uYXNzaWduZWUubmFtZSA9PT0gbW9kdWxlTmFtZSA/XG5cdFx0XHRcdFx0XHRcdG5ldyBNb2R1bGVFeHBvcnREZWZhdWx0KGxpbmUubG9jLCBsaW5lLmFzc2lnbikgOlxuXHRcdFx0XHRcdFx0XHRuZXcgTW9kdWxlRXhwb3J0TmFtZWQobGluZS5sb2MsIGxpbmUuYXNzaWduKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIERlYnVnKVxuXHRcdFx0XHRcdFx0bGluZS5saW5lcyA9IGxpbmUubGluZXMubWFwKGNvbnZlcnRUb0V4cG9ydHMpXG5cdFx0XHRcdFx0cmV0dXJuIGxpbmVcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBsaW5lcy5tYXAoY29udmVydFRvRXhwb3J0cylcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0Y29uc3QgW21vZHVsZUxpbmVzLCBvcERlZmF1bHRFeHBvcnRdID0gX3RyeVRha2VMYXN0VmFsKGxpbmVzKVxuXHRcdFx0XHRpZiAob3BEZWZhdWx0RXhwb3J0ICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0Y29uc3QgXyA9IG9wRGVmYXVsdEV4cG9ydFxuXHRcdFx0XHRcdG1vZHVsZUxpbmVzLnB1c2gobmV3IE1vZHVsZUV4cG9ydERlZmF1bHQoXy5sb2MsXG5cdFx0XHRcdFx0XHRuZXcgQXNzaWduU2luZ2xlKF8ubG9jLFxuXHRcdFx0XHRcdFx0XHRMb2NhbERlY2xhcmUucGxhaW4ob3BEZWZhdWx0RXhwb3J0LmxvYywgY29udGV4dC5vcHRzLm1vZHVsZU5hbWUoKSksXG5cdFx0XHRcdFx0XHRcdF8pKSlcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gbW9kdWxlTGluZXNcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuLy8gcGFyc2VCbG9jayBwcml2YXRlc1xuY29uc3Rcblx0X3RyeVRha2VMYXN0VmFsID0gbGluZXMgPT5cblx0XHQhaXNFbXB0eShsaW5lcykgJiYgbGFzdChsaW5lcykgaW5zdGFuY2VvZiBWYWwgP1xuXHRcdFx0W3J0YWlsKGxpbmVzKSwgbGFzdChsaW5lcyldIDpcblx0XHRcdFtsaW5lcywgbnVsbF0sXG5cblx0X3BsYWluQmxvY2tMaW5lcyA9IGxpbmVUb2tlbnMgPT4ge1xuXHRcdGNvbnN0IGxpbmVzID0gW11cblx0XHRjb25zdCBhZGRMaW5lID0gbGluZSA9PiB7XG5cdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIEFycmF5KVxuXHRcdFx0XHRmb3IgKGNvbnN0IF8gb2YgbGluZSlcblx0XHRcdFx0XHRhZGRMaW5lKF8pXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGxpbmVzLnB1c2gobGluZSlcblx0XHR9XG5cdFx0Zm9yIChjb25zdCBfIG9mIGxpbmVUb2tlbnMuc2xpY2VzKCkpXG5cdFx0XHRhZGRMaW5lKHBhcnNlTGluZShfKSlcblx0XHRyZXR1cm4gbGluZXNcblx0fSxcblxuXHRLUmV0dXJuX1BsYWluID0gMCxcblx0S1JldHVybl9PYmogPSAxLFxuXHRLUmV0dXJuX0JhZyA9IDIsXG5cdEtSZXR1cm5fTWFwID0gMyxcblx0X3BhcnNlQmxvY2tMaW5lcyA9IGxpbmVUb2tlbnMgPT4ge1xuXHRcdGxldCBpc0JhZyA9IGZhbHNlLCBpc01hcCA9IGZhbHNlLCBpc09iaiA9IGZhbHNlXG5cdFx0Y29uc3QgY2hlY2tMaW5lID0gbGluZSA9PiB7XG5cdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIERlYnVnKVxuXHRcdFx0XHRmb3IgKGNvbnN0IF8gb2YgbGluZS5saW5lcylcblx0XHRcdFx0XHRjaGVja0xpbmUoXylcblx0XHRcdGVsc2UgaWYgKGxpbmUgaW5zdGFuY2VvZiBCYWdFbnRyeSlcblx0XHRcdFx0aXNCYWcgPSB0cnVlXG5cdFx0XHRlbHNlIGlmIChsaW5lIGluc3RhbmNlb2YgTWFwRW50cnkpXG5cdFx0XHRcdGlzTWFwID0gdHJ1ZVxuXHRcdFx0ZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIE9iakVudHJ5KVxuXHRcdFx0XHRpc09iaiA9IHRydWVcblx0XHR9XG5cdFx0Y29uc3QgbGluZXMgPSBfcGxhaW5CbG9ja0xpbmVzKGxpbmVUb2tlbnMpXG5cdFx0Zm9yIChjb25zdCBfIG9mIGxpbmVzKVxuXHRcdFx0Y2hlY2tMaW5lKF8pXG5cblx0XHRjb250ZXh0LmNoZWNrKCEoaXNPYmogJiYgaXNCYWcpLCBsaW5lcy5sb2MsICdCbG9jayBoYXMgYm90aCBCYWcgYW5kIE9iaiBsaW5lcy4nKVxuXHRcdGNvbnRleHQuY2hlY2soIShpc09iaiAmJiBpc01hcCksIGxpbmVzLmxvYywgJ0Jsb2NrIGhhcyBib3RoIE9iaiBhbmQgTWFwIGxpbmVzLicpXG5cdFx0Y29udGV4dC5jaGVjayghKGlzQmFnICYmIGlzTWFwKSwgbGluZXMubG9jLCAnQmxvY2sgaGFzIGJvdGggQmFnIGFuZCBNYXAgbGluZXMuJylcblxuXHRcdGNvbnN0IGtSZXR1cm4gPVxuXHRcdFx0aXNPYmogPyBLUmV0dXJuX09iaiA6IGlzQmFnID8gS1JldHVybl9CYWcgOiBpc01hcCA/IEtSZXR1cm5fTWFwIDogS1JldHVybl9QbGFpblxuXHRcdHJldHVybiB7bGluZXMsIGtSZXR1cm59XG5cdH1cblxuY29uc3QgcGFyc2VDYXNlID0gKGlzVmFsLCBjYXNlZEZyb21GdW4sIHRva2VucykgPT4ge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cblx0bGV0IG9wQ2FzZWRcblx0aWYgKGNhc2VkRnJvbUZ1bikge1xuXHRcdGNoZWNrRW1wdHkoYmVmb3JlLCAnQ2FuXFwndCBtYWtlIGZvY3VzIC0tIGlzIGltcGxpY2l0bHkgcHJvdmlkZWQgYXMgZmlyc3QgYXJndW1lbnQuJylcblx0XHRvcENhc2VkID0gbnVsbFxuXHR9IGVsc2Vcblx0XHRvcENhc2VkID0gb3BJZighYmVmb3JlLmlzRW1wdHkoKSwgKCkgPT4gQXNzaWduU2luZ2xlLmZvY3VzKGJlZm9yZS5sb2MsIHBhcnNlRXhwcihiZWZvcmUpKSlcblxuXHRjb25zdCBsYXN0TGluZSA9IFNsaWNlLmdyb3VwKGJsb2NrLmxhc3QoKSlcblx0Y29uc3QgW3BhcnRMaW5lcywgb3BFbHNlXSA9IGlzS2V5d29yZChLV19FbHNlLCBsYXN0TGluZS5oZWFkKCkpID9cblx0XHRbYmxvY2sucnRhaWwoKSwgKGlzVmFsID8ganVzdEJsb2NrVmFsIDoganVzdEJsb2NrRG8pKEtXX0Vsc2UsIGxhc3RMaW5lLnRhaWwoKSldIDpcblx0XHRbYmxvY2ssIG51bGxdXG5cblx0Y29uc3QgcGFydHMgPSBwYXJ0TGluZXMubWFwU2xpY2VzKF9wYXJzZUNhc2VMaW5lKGlzVmFsKSlcblx0Y29udGV4dC5jaGVjayhwYXJ0cy5sZW5ndGggPiAwLCB0b2tlbnMubG9jLCAoKSA9PlxuXHRcdGBNdXN0IGhhdmUgYXQgbGVhc3QgMSBub24tJHtjb2RlKCdlbHNlJyl9IHRlc3QuYClcblxuXHRyZXR1cm4gbmV3IChpc1ZhbCA/IENhc2VWYWwgOiBDYXNlRG8pKHRva2Vucy5sb2MsIG9wQ2FzZWQsIHBhcnRzLCBvcEVsc2UpXG59XG4vLyBwYXJzZUNhc2UgcHJpdmF0ZXNcbmNvbnN0XG5cdF9wYXJzZUNhc2VMaW5lID0gaXNWYWwgPT4gbGluZSA9PiB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sobGluZSlcblx0XHRjb25zdCB0ZXN0ID0gX3BhcnNlQ2FzZVRlc3QoYmVmb3JlKVxuXHRcdGNvbnN0IHJlc3VsdCA9IChpc1ZhbCA/IHBhcnNlQmxvY2tWYWwgOiBwYXJzZUJsb2NrRG8pKGJsb2NrKVxuXHRcdHJldHVybiBuZXcgKGlzVmFsID8gQ2FzZVZhbFBhcnQgOiBDYXNlRG9QYXJ0KShsaW5lLmxvYywgdGVzdCwgcmVzdWx0KVxuXHR9LFxuXHRfcGFyc2VDYXNlVGVzdCA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgZmlyc3QgPSB0b2tlbnMuaGVhZCgpXG5cdFx0Ly8gUGF0dGVybiBtYXRjaCBzdGFydHMgd2l0aCB0eXBlIHRlc3QgYW5kIGlzIGZvbGxvd2VkIGJ5IGxvY2FsIGRlY2xhcmVzLlxuXHRcdC8vIEUuZy4sIGA6U29tZSB2YWxgXG5cdFx0aWYgKGlzR3JvdXAoR19TcGFjZSwgZmlyc3QpICYmIHRva2Vucy5zaXplKCkgPiAxKSB7XG5cdFx0XHRjb25zdCBmdCA9IFNsaWNlLmdyb3VwKGZpcnN0KVxuXHRcdFx0aWYgKGlzS2V5d29yZChLV19UeXBlLCBmdC5oZWFkKCkpKSB7XG5cdFx0XHRcdGNvbnN0IHR5cGUgPSBwYXJzZVNwYWNlZChmdC50YWlsKCkpXG5cdFx0XHRcdGNvbnN0IGxvY2FscyA9IHBhcnNlTG9jYWxEZWNsYXJlcyh0b2tlbnMudGFpbCgpKVxuXHRcdFx0XHRyZXR1cm4gbmV3IFBhdHRlcm4oZmlyc3QubG9jLCB0eXBlLCBsb2NhbHMsIExvY2FsQWNjZXNzLmZvY3VzKHRva2Vucy5sb2MpKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcGFyc2VFeHByKHRva2Vucylcblx0fVxuXG5jb25zdCBwYXJzZVN3aXRjaCA9IChpc1ZhbCwgdG9rZW5zKSA9PiB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0Y29uc3Qgc3dpdGNoZWQgPSBwYXJzZUV4cHIoYmVmb3JlKVxuXHRjb25zdCBsYXN0TGluZSA9IFNsaWNlLmdyb3VwKGJsb2NrLmxhc3QoKSlcblx0Y29uc3QgW3BhcnRMaW5lcywgb3BFbHNlXSA9IGlzS2V5d29yZChLV19FbHNlLCBsYXN0TGluZS5oZWFkKCkpID9cblx0XHRbYmxvY2sucnRhaWwoKSwgKGlzVmFsID8ganVzdEJsb2NrVmFsIDoganVzdEJsb2NrRG8pKEtXX0Vsc2UsIGxhc3RMaW5lLnRhaWwoKSldIDpcblx0XHRbYmxvY2ssIG51bGxdXG5cblx0Y29uc3QgcGFydHMgPSBwYXJ0TGluZXMubWFwU2xpY2VzKF9wYXJzZVN3aXRjaExpbmUoaXNWYWwpKVxuXHRjb250ZXh0LmNoZWNrKHBhcnRzLmxlbmd0aCA+IDAsIHRva2Vucy5sb2MsICgpID0+XG5cdFx0YE11c3QgaGF2ZSBhdCBsZWFzdCAxIG5vbi0ke2NvZGUoJ2Vsc2UnKX0gdGVzdC5gKVxuXG5cdHJldHVybiBuZXcgKGlzVmFsID8gU3dpdGNoVmFsIDogU3dpdGNoRG8pKHRva2Vucy5sb2MsIHN3aXRjaGVkLCBwYXJ0cywgb3BFbHNlKVxufVxuY29uc3Rcblx0X3BhcnNlU3dpdGNoTGluZSA9IGlzVmFsID0+IGxpbmUgPT4ge1xuXHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKGxpbmUpXG5cblx0XHRsZXQgdmFsdWVzXG5cdFx0aWYgKGlzS2V5d29yZChLV19PciwgYmVmb3JlLmhlYWQoKSkpXG5cdFx0XHR2YWx1ZXMgPSBiZWZvcmUudGFpbCgpLm1hcChwYXJzZVNpbmdsZSlcblx0XHRlbHNlXG5cdFx0XHR2YWx1ZXMgPSBbcGFyc2VFeHByKGJlZm9yZSldXG5cblx0XHRjb25zdCByZXN1bHQgPSAoaXNWYWwgPyBwYXJzZUJsb2NrVmFsIDogcGFyc2VCbG9ja0RvKShibG9jaylcblx0XHRyZXR1cm4gbmV3IChpc1ZhbCA/IFN3aXRjaFZhbFBhcnQgOiBTd2l0Y2hEb1BhcnQpKGxpbmUubG9jLCB2YWx1ZXMsIHJlc3VsdClcblx0fVxuXG5jb25zdFxuXHRwYXJzZUV4cHIgPSB0b2tlbnMgPT4ge1xuXHRcdHJldHVybiBpZkVsc2UodG9rZW5zLm9wU3BsaXRNYW55V2hlcmUoXyA9PiBpc0tleXdvcmQoS1dfT2JqQXNzaWduLCBfKSksXG5cdFx0XHRzcGxpdHMgPT4ge1xuXHRcdFx0XHQvLyBTaG9ydCBvYmplY3QgZm9ybSwgc3VjaCBhcyAoYS4gMSwgYi4gMilcblx0XHRcdFx0Y29uc3QgZmlyc3QgPSBzcGxpdHNbMF0uYmVmb3JlXG5cdFx0XHRcdGNoZWNrTm9uRW1wdHkoZmlyc3QsICgpID0+IGBVbmV4cGVjdGVkICR7c3BsaXRzWzBdLmF0fWApXG5cdFx0XHRcdGNvbnN0IHRva2Vuc0NhbGxlciA9IGZpcnN0LnJ0YWlsKClcblxuXHRcdFx0XHRjb25zdCBwYWlycyA9IFtdXG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc3BsaXRzLmxlbmd0aCAtIDE7IGkgPSBpICsgMSkge1xuXHRcdFx0XHRcdGNvbnN0IG5hbWUgPSBzcGxpdHNbaV0uYmVmb3JlLmxhc3QoKVxuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2sobmFtZSBpbnN0YW5jZW9mIE5hbWUsIG5hbWUubG9jLCAoKSA9PlxuXHRcdFx0XHRcdFx0YEV4cGVjdGVkIGEgbmFtZSwgbm90ICR7bmFtZX1gKVxuXHRcdFx0XHRcdGNvbnN0IHRva2Vuc1ZhbHVlID0gaSA9PT0gc3BsaXRzLmxlbmd0aCAtIDIgP1xuXHRcdFx0XHRcdFx0c3BsaXRzW2kgKyAxXS5iZWZvcmUgOlxuXHRcdFx0XHRcdFx0c3BsaXRzW2kgKyAxXS5iZWZvcmUucnRhaWwoKVxuXHRcdFx0XHRcdGNvbnN0IHZhbHVlID0gcGFyc2VFeHByUGxhaW4odG9rZW5zVmFsdWUpXG5cdFx0XHRcdFx0Y29uc3QgbG9jID0gbmV3IExvYyhuYW1lLmxvYy5zdGFydCwgdG9rZW5zVmFsdWUubG9jLmVuZClcblx0XHRcdFx0XHRwYWlycy5wdXNoKG5ldyBPYmpQYWlyKGxvYywgbmFtZS5uYW1lLCB2YWx1ZSkpXG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgdmFsID0gbmV3IE9ialNpbXBsZSh0b2tlbnMubG9jLCBwYWlycylcblx0XHRcdFx0aWYgKHRva2Vuc0NhbGxlci5pc0VtcHR5KCkpXG5cdFx0XHRcdFx0cmV0dXJuIHZhbFxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKHRva2Vuc0NhbGxlcilcblx0XHRcdFx0XHRyZXR1cm4gbmV3IENhbGwodG9rZW5zLmxvYywgaGVhZChwYXJ0cyksIGNhdCh0YWlsKHBhcnRzKSwgdmFsKSlcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdCgpID0+IHBhcnNlRXhwclBsYWluKHRva2Vucylcblx0XHQpXG5cdH0sXG5cblx0cGFyc2VFeHByUGxhaW4gPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHModG9rZW5zKVxuXHRcdHN3aXRjaCAocGFydHMubGVuZ3RoKSB7XG5cdFx0XHRjYXNlIDA6XG5cdFx0XHRcdGNvbnRleHQuZmFpbCh0b2tlbnMubG9jLCAnRXhwZWN0ZWQgYW4gZXhwcmVzc2lvbiwgZ290IG5vdGhpbmcuJylcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0cmV0dXJuIGhlYWQocGFydHMpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gbmV3IENhbGwodG9rZW5zLmxvYywgaGVhZChwYXJ0cyksIHRhaWwocGFydHMpKVxuXHRcdH1cblx0fSxcblxuXHRwYXJzZUV4cHJQYXJ0cyA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3Qgb3BTcGxpdCA9IHRva2Vucy5vcFNwbGl0T25jZVdoZXJlKHRva2VuID0+IHtcblx0XHRcdGlmICh0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0XHRcdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdFx0XHRcdGNhc2UgS1dfQW5kOiBjYXNlIEtXX0Nhc2VWYWw6IGNhc2UgS1dfQ2xhc3M6IGNhc2UgS1dfQ29uZDogY2FzZSBLV19FeGNlcHRWYWw6XG5cdFx0XHRcdFx0Y2FzZSBLV19Gb3JCYWc6IGNhc2UgS1dfRm9yVmFsOiBjYXNlIEtXX0Z1bjogY2FzZSBLV19GdW5EbzogY2FzZSBLV19GdW5HZW46XG5cdFx0XHRcdFx0Y2FzZSBLV19GdW5HZW5EbzogY2FzZSBLV19GdW5UaGlzOiBjYXNlIEtXX0Z1blRoaXNEbzogY2FzZSBLV19GdW5UaGlzR2VuOlxuXHRcdFx0XHRcdGNhc2UgS1dfRnVuVGhpc0dlbkRvOiBjYXNlIEtXX0lmVmFsOiBjYXNlIEtXX05ldzogY2FzZSBLV19Ob3Q6IGNhc2UgS1dfT3I6XG5cdFx0XHRcdFx0Y2FzZSBLV19TdXBlclZhbDogY2FzZSBLV19Td2l0Y2hWYWw6IGNhc2UgS1dfVW5sZXNzVmFsOiBjYXNlIEtXX1dpdGg6XG5cdFx0XHRcdFx0Y2FzZSBLV19ZaWVsZDogY2FzZSBLV19ZaWVsZFRvOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdH0pXG5cdFx0cmV0dXJuIGlmRWxzZShvcFNwbGl0LFxuXHRcdFx0KHtiZWZvcmUsIGF0LCBhZnRlcn0pID0+IHtcblx0XHRcdFx0Y29uc3QgZ2V0TGFzdCA9ICgpID0+IHtcblx0XHRcdFx0XHRzd2l0Y2ggKGF0LmtpbmQpIHtcblx0XHRcdFx0XHRcdGNhc2UgS1dfQW5kOiBjYXNlIEtXX09yOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV3IExvZ2ljKGF0LmxvYywgYXQua2luZCA9PT0gS1dfQW5kID8gTF9BbmQgOiBMX09yLFxuXHRcdFx0XHRcdFx0XHRcdHBhcnNlRXhwclBhcnRzKGFmdGVyKSlcblx0XHRcdFx0XHRcdGNhc2UgS1dfQ2FzZVZhbDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlQ2FzZSh0cnVlLCBmYWxzZSwgYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX0NsYXNzOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VDbGFzcyhhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfQ29uZDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlQ29uZChhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfRXhjZXB0VmFsOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VFeGNlcHQoS1dfRXhjZXB0VmFsLCBhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfRm9yQmFnOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VGb3JCYWcoYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX0ZvclZhbDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlRm9yVmFsKGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19GdW46IGNhc2UgS1dfRnVuRG86IGNhc2UgS1dfRnVuR2VuOiBjYXNlIEtXX0Z1bkdlbkRvOlxuXHRcdFx0XHRcdFx0Y2FzZSBLV19GdW5UaGlzOiBjYXNlIEtXX0Z1blRoaXNEbzogY2FzZSBLV19GdW5UaGlzR2VuOlxuXHRcdFx0XHRcdFx0Y2FzZSBLV19GdW5UaGlzR2VuRG86XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUZ1bihhdC5raW5kLCBhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfSWZWYWw6IGNhc2UgS1dfVW5sZXNzVmFsOiB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKGFmdGVyKVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsVmFsKHRva2Vucy5sb2MsXG5cdFx0XHRcdFx0XHRcdFx0cGFyc2VFeHByUGxhaW4oYmVmb3JlKSxcblx0XHRcdFx0XHRcdFx0XHRwYXJzZUJsb2NrVmFsKGJsb2NrKSxcblx0XHRcdFx0XHRcdFx0XHRhdC5raW5kID09PSBLV19Vbmxlc3NWYWwpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjYXNlIEtXX05ldzoge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKGFmdGVyKVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV3IE5ldyhhdC5sb2MsIHBhcnRzWzBdLCB0YWlsKHBhcnRzKSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNhc2UgS1dfTm90OlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV3IE5vdChhdC5sb2MsIHBhcnNlRXhwclBsYWluKGFmdGVyKSlcblx0XHRcdFx0XHRcdGNhc2UgS1dfU3VwZXJWYWw6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgU3VwZXJDYWxsKGF0LmxvYywgcGFyc2VFeHByUGFydHMoYWZ0ZXIpKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19Td2l0Y2hWYWw6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZVN3aXRjaCh0cnVlLCBhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfV2l0aDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlV2l0aChhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfWWllbGQ6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgWWllbGQoYXQubG9jLFxuXHRcdFx0XHRcdFx0XHRcdG9wSWYoIWFmdGVyLmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKSlcblx0XHRcdFx0XHRcdGNhc2UgS1dfWWllbGRUbzpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBZaWVsZFRvKGF0LmxvYywgcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKVxuXHRcdFx0XHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKGF0LmtpbmQpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBjYXQoYmVmb3JlLm1hcChwYXJzZVNpbmdsZSksIGdldExhc3QoKSlcblx0XHRcdH0sXG5cdFx0XHQoKSA9PiB0b2tlbnMubWFwKHBhcnNlU2luZ2xlKSlcblx0fVxuXG5jb25zdCBwYXJzZUZ1biA9IChraW5kLCB0b2tlbnMpID0+IHtcblx0bGV0IGlzVGhpcyA9IGZhbHNlLCBpc0RvID0gZmFsc2UsIGlzR2VuID0gZmFsc2Vcblx0c3dpdGNoIChraW5kKSB7XG5cdFx0Y2FzZSBLV19GdW46XG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuRG86XG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1bkdlbjpcblx0XHRcdGlzR2VuID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1bkdlbkRvOlxuXHRcdFx0aXNHZW4gPSB0cnVlXG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1blRoaXM6XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuVGhpc0RvOlxuXHRcdFx0aXNUaGlzID0gdHJ1ZVxuXHRcdFx0aXNEbyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5UaGlzR2VuOlxuXHRcdFx0aXNUaGlzID0gdHJ1ZVxuXHRcdFx0aXNHZW4gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuVGhpc0dlbkRvOlxuXHRcdFx0aXNUaGlzID0gdHJ1ZVxuXHRcdFx0aXNHZW4gPSB0cnVlXG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoKVxuXHR9XG5cdGNvbnN0IG9wRGVjbGFyZVRoaXMgPSBvcElmKGlzVGhpcywgKCkgPT4gbmV3IExvY2FsRGVjbGFyZVRoaXModG9rZW5zLmxvYykpXG5cblx0Y29uc3Qge29wUmV0dXJuVHlwZSwgcmVzdH0gPSBfdHJ5VGFrZVJldHVyblR5cGUodG9rZW5zKVxuXHRjb25zdCB7YXJncywgb3BSZXN0QXJnLCBibG9jaywgb3BJbiwgb3BPdXQsIG9wQ29tbWVudH0gPSBfZnVuQXJnc0FuZEJsb2NrKGlzRG8sIHJlc3QpXG5cdC8vIE5lZWQgcmVzIGRlY2xhcmUgaWYgdGhlcmUgaXMgYSByZXR1cm4gdHlwZSBvciBvdXQgY29uZGl0aW9uLlxuXHRjb25zdCBvcERlY2xhcmVSZXMgPSBpZkVsc2Uob3BSZXR1cm5UeXBlLFxuXHRcdF8gPT4gbmV3IExvY2FsRGVjbGFyZVJlcyhfLmxvYywgXyksXG5cdFx0KCkgPT4gb3BNYXAob3BPdXQsIF8gPT4gbmV3IExvY2FsRGVjbGFyZVJlcyhfLmxvYywgbnVsbCkpKVxuXHRyZXR1cm4gbmV3IEZ1bih0b2tlbnMubG9jLFxuXHRcdG9wRGVjbGFyZVRoaXMsIGlzR2VuLCBhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBvcEluLCBvcERlY2xhcmVSZXMsIG9wT3V0LCBvcENvbW1lbnQpXG59XG5cbi8vIHBhcnNlRnVuIHByaXZhdGVzXG5jb25zdFxuXHRfdHJ5VGFrZVJldHVyblR5cGUgPSB0b2tlbnMgPT4ge1xuXHRcdGlmICghdG9rZW5zLmlzRW1wdHkoKSkge1xuXHRcdFx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKClcblx0XHRcdGlmIChpc0dyb3VwKEdfU3BhY2UsIGgpICYmIGlzS2V5d29yZChLV19UeXBlLCBoZWFkKGguc3ViVG9rZW5zKSkpXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0b3BSZXR1cm5UeXBlOiBwYXJzZVNwYWNlZChTbGljZS5ncm91cChoKS50YWlsKCkpLFxuXHRcdFx0XHRcdHJlc3Q6IHRva2Vucy50YWlsKClcblx0XHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4ge29wUmV0dXJuVHlwZTogbnVsbCwgcmVzdDogdG9rZW5zfVxuXHR9LFxuXG5cdC8qXG5cdGluY2x1ZGVNZW1iZXJBcmdzOlxuXHRcdGlmIHRydWUsIG91dHB1dCB3aWxsIGluY2x1ZGUgYG1lbWJlckFyZ3NgLlxuXHRcdFRoaXMgaXMgYSBzdWJzZXQgb2YgYGFyZ3NgIHdob3NlIG5hbWVzIGFyZSBwcmVmaXhlZCB3aXRoIGAuYFxuXHRcdGUuZy46IGBjb25zdHJ1Y3QhIC54IC55YFxuXHRcdFRoaXMgaXMgZm9yIGNvbnN0cnVjdG9ycyBvbmx5LlxuXHQqL1xuXHRfZnVuQXJnc0FuZEJsb2NrID0gKGlzRG8sIHRva2VucywgaW5jbHVkZU1lbWJlckFyZ3MpID0+IHtcblx0XHRjaGVja05vbkVtcHR5KHRva2VucywgJ0V4cGVjdGVkIGFuIGluZGVudGVkIGJsb2NrLicpXG5cdFx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKClcblx0XHQvLyBNaWdodCBiZSBgfGNhc2VgXG5cdFx0aWYgKGggaW5zdGFuY2VvZiBLZXl3b3JkICYmIChoLmtpbmQgPT09IEtXX0Nhc2VWYWwgfHwgaC5raW5kID09PSBLV19DYXNlRG8pKSB7XG5cdFx0XHRjb25zdCBlQ2FzZSA9IHBhcnNlQ2FzZShoLmtpbmQgPT09IEtXX0Nhc2VWYWwsIHRydWUsIHRva2Vucy50YWlsKCkpXG5cdFx0XHRjb25zdCBhcmdzID0gW25ldyBMb2NhbERlY2xhcmVGb2N1cyhoLmxvYyldXG5cdFx0XHRyZXR1cm4gaC5raW5kID09PSBLV19DYXNlVmFsID9cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGFyZ3MsIG9wUmVzdEFyZzogbnVsbCwgbWVtYmVyQXJnczogW10sIG9wSW46IG51bGwsIG9wT3V0OiBudWxsLFxuXHRcdFx0XHRcdGJsb2NrOiBuZXcgQmxvY2tXaXRoUmV0dXJuKHRva2Vucy5sb2MsIG51bGwsIFtdLCBlQ2FzZSlcblx0XHRcdFx0fSA6XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhcmdzLCBvcFJlc3RBcmc6IG51bGwsIG1lbWJlckFyZ3M6IFtdLCBvcEluOiBudWxsLCBvcE91dDogbnVsbCxcblx0XHRcdFx0XHRibG9jazogbmV3IEJsb2NrRG8odG9rZW5zLmxvYywgbnVsbCwgW2VDYXNlXSlcblx0XHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBbYmVmb3JlLCBibG9ja0xpbmVzXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0XHRcdGNvbnN0IHthcmdzLCBvcFJlc3RBcmcsIG1lbWJlckFyZ3N9ID0gX3BhcnNlRnVuTG9jYWxzKGJlZm9yZSwgaW5jbHVkZU1lbWJlckFyZ3MpXG5cdFx0XHRmb3IgKGNvbnN0IGFyZyBvZiBhcmdzKVxuXHRcdFx0XHRpZiAoIWFyZy5pc0xhenkoKSlcblx0XHRcdFx0XHRhcmcua2luZCA9IExEX011dGFibGVcblx0XHRcdGNvbnN0IFtvcEluLCByZXN0MF0gPSBfdHJ5VGFrZUluT3JPdXQoS1dfSW4sIGJsb2NrTGluZXMpXG5cdFx0XHRjb25zdCBbb3BPdXQsIHJlc3QxXSA9IF90cnlUYWtlSW5Pck91dChLV19PdXQsIHJlc3QwKVxuXHRcdFx0Y29uc3QgYmxvY2sgPSAoaXNEbyA/IHBhcnNlQmxvY2tEbyA6IHBhcnNlQmxvY2tWYWwpKHJlc3QxKVxuXHRcdFx0cmV0dXJuIHthcmdzLCBvcFJlc3RBcmcsIG1lbWJlckFyZ3MsIGJsb2NrLCBvcEluLCBvcE91dH1cblx0XHR9XG5cdH0sXG5cblx0X3BhcnNlRnVuTG9jYWxzID0gKHRva2VucywgaW5jbHVkZU1lbWJlckFyZ3MpID0+IHtcblx0XHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRcdHJldHVybiB7YXJnczogW10sIG1lbWJlckFyZ3M6IFtdLCBvcFJlc3RBcmc6IG51bGx9XG5cdFx0ZWxzZSB7XG5cdFx0XHRsZXQgcmVzdCwgb3BSZXN0QXJnXG5cdFx0XHRjb25zdCBsID0gdG9rZW5zLmxhc3QoKVxuXHRcdFx0aWYgKGwgaW5zdGFuY2VvZiBEb3ROYW1lICYmIGwubkRvdHMgPT09IDMpIHtcblx0XHRcdFx0cmVzdCA9IHRva2Vucy5ydGFpbCgpXG5cdFx0XHRcdG9wUmVzdEFyZyA9IExvY2FsRGVjbGFyZS5wbGFpbihsLmxvYywgbC5uYW1lKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzdCA9IHRva2Vuc1xuXHRcdFx0XHRvcFJlc3RBcmcgPSBudWxsXG5cdFx0XHR9XG5cblx0XHRcdGlmIChpbmNsdWRlTWVtYmVyQXJncykge1xuXHRcdFx0XHRjb25zdCB7ZGVjbGFyZXM6IGFyZ3MsIG1lbWJlckFyZ3N9ID0gcGFyc2VMb2NhbERlY2xhcmVzQW5kTWVtYmVyQXJncyhyZXN0KVxuXHRcdFx0XHRyZXR1cm4ge2FyZ3MsIG1lbWJlckFyZ3MsIG9wUmVzdEFyZ31cblx0XHRcdH0gZWxzZVxuXHRcdFx0XHRyZXR1cm4ge2FyZ3M6IHBhcnNlTG9jYWxEZWNsYXJlcyhyZXN0KSwgb3BSZXN0QXJnfVxuXHRcdH1cblx0fSxcblxuXHRfdHJ5VGFrZUluT3JPdXQgPSAoaW5Pck91dCwgdG9rZW5zKSA9PiB7XG5cdFx0aWYgKCF0b2tlbnMuaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCBmaXJzdExpbmUgPSB0b2tlbnMuaGVhZFNsaWNlKClcblx0XHRcdGlmIChpc0tleXdvcmQoaW5Pck91dCwgZmlyc3RMaW5lLmhlYWQoKSkpIHtcblx0XHRcdFx0Y29uc3QgaW5PdXQgPSBuZXcgRGVidWcoXG5cdFx0XHRcdFx0Zmlyc3RMaW5lLmxvYyxcblx0XHRcdFx0XHRwYXJzZUxpbmVzRnJvbUJsb2NrKGZpcnN0TGluZSkpXG5cdFx0XHRcdHJldHVybiBbaW5PdXQsIHRva2Vucy50YWlsKCldXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBbbnVsbCwgdG9rZW5zXVxuXHR9XG5cbmNvbnN0XG5cdHBhcnNlTGluZSA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgaGVhZCA9IHRva2Vucy5oZWFkKClcblx0XHRjb25zdCByZXN0ID0gdG9rZW5zLnRhaWwoKVxuXG5cdFx0Y29uc3Qgbm9SZXN0ID0gKCkgPT5cblx0XHRcdGNoZWNrRW1wdHkocmVzdCwgKCkgPT4gYERpZCBub3QgZXhwZWN0IGFueXRoaW5nIGFmdGVyICR7aGVhZH1gKVxuXG5cdFx0Ly8gV2Ugb25seSBkZWFsIHdpdGggbXV0YWJsZSBleHByZXNzaW9ucyBoZXJlLCBvdGhlcndpc2Ugd2UgZmFsbCBiYWNrIHRvIHBhcnNlRXhwci5cblx0XHRpZiAoaGVhZCBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0XHRzd2l0Y2ggKGhlYWQua2luZCkge1xuXHRcdFx0XHRjYXNlIEtXX0Fzc2VydDogY2FzZSBLV19Bc3NlcnROb3Q6XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlQXNzZXJ0KGhlYWQua2luZCA9PT0gS1dfQXNzZXJ0Tm90LCByZXN0KVxuXHRcdFx0XHRjYXNlIEtXX0V4Y2VwdERvOlxuXHRcdFx0XHRcdHJldHVybiBwYXJzZUV4Y2VwdChLV19FeGNlcHREbywgcmVzdClcblx0XHRcdFx0Y2FzZSBLV19CcmVhazpcblx0XHRcdFx0XHRub1Jlc3QoKVxuXHRcdFx0XHRcdHJldHVybiBuZXcgQnJlYWsodG9rZW5zLmxvYylcblx0XHRcdFx0Y2FzZSBLV19CcmVha1dpdGhWYWw6XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBCcmVha1dpdGhWYWwodG9rZW5zLmxvYywgcGFyc2VFeHByKHJlc3QpKVxuXHRcdFx0XHRjYXNlIEtXX0Nhc2VEbzpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VDYXNlKGZhbHNlLCBmYWxzZSwgcmVzdClcblx0XHRcdFx0Y2FzZSBLV19EZWJ1Zzpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IERlYnVnKHRva2Vucy5sb2MsXG5cdFx0XHRcdFx0XHRpc0dyb3VwKEdfQmxvY2ssIHRva2Vucy5zZWNvbmQoKSkgP1xuXHRcdFx0XHRcdFx0Ly8gYGRlYnVnYCwgdGhlbiBpbmRlbnRlZCBibG9ja1xuXHRcdFx0XHRcdFx0cGFyc2VMaW5lc0Zyb21CbG9jaygpIDpcblx0XHRcdFx0XHRcdC8vIGBkZWJ1Z2AsIHRoZW4gc2luZ2xlIGxpbmVcblx0XHRcdFx0XHRcdHBhcnNlTGluZU9yTGluZXMocmVzdCkpXG5cdFx0XHRcdGNhc2UgS1dfRGVidWdnZXI6XG5cdFx0XHRcdFx0bm9SZXN0KClcblx0XHRcdFx0XHRyZXR1cm4gbmV3IFNwZWNpYWxEbyh0b2tlbnMubG9jLCBTRF9EZWJ1Z2dlcilcblx0XHRcdFx0Y2FzZSBLV19FbGxpcHNpczpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEJhZ0VudHJ5TWFueSh0b2tlbnMubG9jLCBwYXJzZUV4cHIocmVzdCkpXG5cdFx0XHRcdGNhc2UgS1dfRm9yRG86XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlRm9yRG8ocmVzdClcblx0XHRcdFx0Y2FzZSBLV19JZ25vcmU6XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlSWdub3JlKHJlc3QpXG5cdFx0XHRcdGNhc2UgS1dfSWZEbzogY2FzZSBLV19Vbmxlc3NEbzoge1xuXHRcdFx0XHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHJlc3QpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbERvKHRva2Vucy5sb2MsXG5cdFx0XHRcdFx0XHRwYXJzZUV4cHIoYmVmb3JlKSxcblx0XHRcdFx0XHRcdHBhcnNlQmxvY2tEbyhibG9jayksXG5cdFx0XHRcdFx0XHRoZWFkLmtpbmQgPT09IEtXX1VubGVzc0RvKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgS1dfT2JqQXNzaWduOlxuXHRcdFx0XHRcdHJldHVybiBuZXcgQmFnRW50cnkodG9rZW5zLmxvYywgcGFyc2VFeHByKHJlc3QpKVxuXHRcdFx0XHRjYXNlIEtXX1Bhc3M6XG5cdFx0XHRcdFx0bm9SZXN0KClcblx0XHRcdFx0XHRyZXR1cm4gW11cblx0XHRcdFx0Y2FzZSBLV19SZWdpb246XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlTGluZXNGcm9tQmxvY2sodG9rZW5zKVxuXHRcdFx0XHRjYXNlIEtXX1N1cGVyRG86XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBTdXBlckNhbGxEbyh0b2tlbnMubG9jLCBwYXJzZUV4cHJQYXJ0cyhyZXN0KSlcblx0XHRcdFx0Y2FzZSBLV19Td2l0Y2hEbzpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VTd2l0Y2goZmFsc2UsIHJlc3QpXG5cdFx0XHRcdGNhc2UgS1dfVGhyb3c6XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBUaHJvdyh0b2tlbnMubG9jLCBvcElmKCFyZXN0LmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByKHJlc3QpKSlcblx0XHRcdFx0Y2FzZSBLV19OYW1lOlxuXHRcdFx0XHRcdGlmIChpc0tleXdvcmQoS1dfT2JqQXNzaWduLCByZXN0LmhlYWQoKSkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IHIgPSByZXN0LnRhaWwoKVxuXHRcdFx0XHRcdFx0Y29uc3QgdmFsID0gci5pc0VtcHR5KCkgPyBuZXcgU3BlY2lhbFZhbCh0b2tlbnMubG9jLCBTVl9OYW1lKSA6IHBhcnNlRXhwcihyKVxuXHRcdFx0XHRcdFx0cmV0dXJuIE9iakVudHJ5Q29tcHV0ZWQubmFtZSh0b2tlbnMubG9jLCB2YWwpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIGVsc2UgZmFsbHRocm91Z2hcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHQvLyBmYWxsIHRocm91Z2hcblx0XHRcdH1cblxuXHRcdHJldHVybiBpZkVsc2UodG9rZW5zLm9wU3BsaXRPbmNlV2hlcmUoX2lzTGluZVNwbGl0S2V5d29yZCksXG5cdFx0XHQoe2JlZm9yZSwgYXQsIGFmdGVyfSkgPT4gX3BhcnNlQXNzaWduTGlrZShiZWZvcmUsIGF0LCBhZnRlciwgdG9rZW5zLmxvYyksXG5cdFx0XHQoKSA9PiBwYXJzZUV4cHIodG9rZW5zKSlcblx0fSxcblxuXHRwYXJzZUxpbmVPckxpbmVzID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBfID0gcGFyc2VMaW5lKHRva2Vucylcblx0XHRyZXR1cm4gXyBpbnN0YW5jZW9mIEFycmF5ID8gXyA6IFtfXVxuXHR9XG5cbi8vIHBhcnNlTGluZSBwcml2YXRlc1xuY29uc3Rcblx0X2lzTGluZVNwbGl0S2V5d29yZCA9IHRva2VuID0+IHtcblx0XHRpZiAodG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRcdGNhc2UgS1dfQXNzaWduOiBjYXNlIEtXX0Fzc2lnbk11dGFibGU6IGNhc2UgS1dfTG9jYWxNdXRhdGU6XG5cdFx0XHRcdGNhc2UgS1dfTWFwRW50cnk6IGNhc2UgS1dfT2JqQXNzaWduOiBjYXNlIEtXX1lpZWxkOiBjYXNlIEtXX1lpZWxkVG86XG5cdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdH1cblx0XHRlbHNlXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0fSxcblxuXHRfcGFyc2VBc3NpZ25MaWtlID0gKGJlZm9yZSwgYXQsIGFmdGVyLCBsb2MpID0+IHtcblx0XHRpZiAoYXQua2luZCA9PT0gS1dfTWFwRW50cnkpXG5cdFx0XHRyZXR1cm4gbmV3IE1hcEVudHJ5KGxvYywgcGFyc2VFeHByKGJlZm9yZSksIHBhcnNlRXhwcihhZnRlcikpXG5cblx0XHQvLyBUT0RPOiBUaGlzIGNvZGUgaXMga2luZCBvZiB1Z2x5LlxuXHRcdC8vIEl0IHBhcnNlcyBgeC55ID0gemAgYW5kIHRoZSBsaWtlLlxuXHRcdGlmIChiZWZvcmUuc2l6ZSgpID09PSAxKSB7XG5cdFx0XHRjb25zdCB0b2tlbiA9IGJlZm9yZS5oZWFkKClcblx0XHRcdGlmICh0b2tlbiBpbnN0YW5jZW9mIERvdE5hbWUpXG5cdFx0XHRcdHJldHVybiBfcGFyc2VNZW1iZXJTZXQoXHRMb2NhbEFjY2Vzcy50aGlzKHRva2VuLmxvYyksIHRva2VuLm5hbWUsIGF0LCBhZnRlciwgbG9jKVxuXHRcdFx0aWYgKGlzR3JvdXAoR19TcGFjZSwgdG9rZW4pKSB7XG5cdFx0XHRcdGNvbnN0IHNwYWNlZCA9IFNsaWNlLmdyb3VwKHRva2VuKVxuXHRcdFx0XHRjb25zdCBkb3QgPSBzcGFjZWQubGFzdCgpXG5cdFx0XHRcdGlmIChkb3QgaW5zdGFuY2VvZiBEb3ROYW1lKSB7XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayhkb3QubkRvdHMgPT09IDEsIGRvdC5sb2MsICdNdXN0IGhhdmUgb25seSAxIGAuYC4nKVxuXHRcdFx0XHRcdHJldHVybiBfcGFyc2VNZW1iZXJTZXQocGFyc2VTcGFjZWQoc3BhY2VkLnJ0YWlsKCkpLCBkb3QubmFtZSwgYXQsIGFmdGVyLCBsb2MpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gYXQua2luZCA9PT0gS1dfTG9jYWxNdXRhdGUgP1xuXHRcdFx0X3BhcnNlTG9jYWxNdXRhdGUoYmVmb3JlLCBhZnRlciwgbG9jKSA6XG5cdFx0XHRfcGFyc2VBc3NpZ24oYmVmb3JlLCBhdCwgYWZ0ZXIsIGxvYylcblx0fSxcblxuXHRfcGFyc2VNZW1iZXJTZXQgPSAob2JqZWN0LCBuYW1lLCBhdCwgYWZ0ZXIsIGxvYykgPT5cblx0XHRuZXcgTWVtYmVyU2V0KGxvYywgb2JqZWN0LCBuYW1lLCBfbWVtYmVyU2V0S2luZChhdCksIHBhcnNlRXhwcihhZnRlcikpLFxuXHRfbWVtYmVyU2V0S2luZCA9IGF0ID0+IHtcblx0XHRzd2l0Y2ggKGF0LmtpbmQpIHtcblx0XHRcdGNhc2UgS1dfQXNzaWduOiByZXR1cm4gTVNfTmV3XG5cdFx0XHRjYXNlIEtXX0Fzc2lnbk11dGFibGU6IHJldHVybiBNU19OZXdNdXRhYmxlXG5cdFx0XHRjYXNlIEtXX0xvY2FsTXV0YXRlOiByZXR1cm4gTVNfTXV0YXRlXG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdH1cblx0fSxcblxuXHRfcGFyc2VMb2NhbE11dGF0ZSA9IChsb2NhbHNUb2tlbnMsIHZhbHVlVG9rZW5zLCBsb2MpID0+IHtcblx0XHRjb25zdCBsb2NhbHMgPSBwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMobG9jYWxzVG9rZW5zKVxuXHRcdGNvbnRleHQuY2hlY2sobG9jYWxzLmxlbmd0aCA9PT0gMSwgbG9jLCAnVE9ETzogTG9jYWxEZXN0cnVjdHVyZU11dGF0ZScpXG5cdFx0Y29uc3QgbmFtZSA9IGxvY2Fsc1swXS5uYW1lXG5cdFx0Y29uc3QgdmFsdWUgPSBwYXJzZUV4cHIodmFsdWVUb2tlbnMpXG5cdFx0cmV0dXJuIG5ldyBMb2NhbE11dGF0ZShsb2MsIG5hbWUsIHZhbHVlKVxuXHR9LFxuXG5cdF9wYXJzZUFzc2lnbiA9IChsb2NhbHNUb2tlbnMsIGFzc2lnbmVyLCB2YWx1ZVRva2VucywgbG9jKSA9PiB7XG5cdFx0Y29uc3Qga2luZCA9IGFzc2lnbmVyLmtpbmRcblx0XHRjb25zdCBsb2NhbHMgPSBwYXJzZUxvY2FsRGVjbGFyZXMobG9jYWxzVG9rZW5zKVxuXHRcdGNvbnN0IG9wTmFtZSA9IG9wSWYobG9jYWxzLmxlbmd0aCA9PT0gMSwgKCkgPT4gbG9jYWxzWzBdLm5hbWUpXG5cdFx0Y29uc3QgdmFsdWUgPSBfcGFyc2VBc3NpZ25WYWx1ZShraW5kLCBvcE5hbWUsIHZhbHVlVG9rZW5zKVxuXG5cdFx0Y29uc3QgaXNZaWVsZCA9IGtpbmQgPT09IEtXX1lpZWxkIHx8IGtpbmQgPT09IEtXX1lpZWxkVG9cblx0XHRpZiAoaXNFbXB0eShsb2NhbHMpKSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKGlzWWllbGQsIGxvY2Fsc1Rva2Vucy5sb2MsICdBc3NpZ25tZW50IHRvIG5vdGhpbmcnKVxuXHRcdFx0cmV0dXJuIHZhbHVlXG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmIChpc1lpZWxkKVxuXHRcdFx0XHRmb3IgKGNvbnN0IF8gb2YgbG9jYWxzKVxuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soIV8uaXNMYXp5KCksIF8ubG9jLCAnQ2FuIG5vdCB5aWVsZCB0byBsYXp5IHZhcmlhYmxlLicpXG5cblx0XHRcdGNvbnN0IGlzT2JqQXNzaWduID0ga2luZCA9PT0gS1dfT2JqQXNzaWduXG5cblx0XHRcdGlmIChraW5kID09PSBLV19Bc3NpZ25NdXRhYmxlKVxuXHRcdFx0XHRmb3IgKGxldCBfIG9mIGxvY2Fscykge1xuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soIV8uaXNMYXp5KCksIF8ubG9jLCAnTGF6eSBsb2NhbCBjYW4gbm90IGJlIG11dGFibGUuJylcblx0XHRcdFx0XHRfLmtpbmQgPSBMRF9NdXRhYmxlXG5cdFx0XHRcdH1cblxuXHRcdFx0Y29uc3Qgd3JhcCA9IF8gPT4gaXNPYmpBc3NpZ24gPyBuZXcgT2JqRW50cnlBc3NpZ24obG9jLCBfKSA6IF9cblxuXHRcdFx0aWYgKGxvY2Fscy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0Y29uc3QgYXNzaWduZWUgPSBsb2NhbHNbMF1cblx0XHRcdFx0Y29uc3QgYXNzaWduID0gbmV3IEFzc2lnblNpbmdsZShsb2MsIGFzc2lnbmVlLCB2YWx1ZSlcblx0XHRcdFx0Y29uc3QgaXNUZXN0ID0gaXNPYmpBc3NpZ24gJiYgYXNzaWduZWUubmFtZS5lbmRzV2l0aCgndGVzdCcpXG5cdFx0XHRcdHJldHVybiBpc1Rlc3QgPyBuZXcgRGVidWcobG9jLCBbd3JhcChhc3NpZ24pXSkgOiB3cmFwKGFzc2lnbilcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IGtpbmQgPSBsb2NhbHNbMF0ua2luZFxuXHRcdFx0XHRmb3IgKGNvbnN0IF8gb2YgbG9jYWxzKVxuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soXy5raW5kID09PSBraW5kLCBfLmxvYyxcblx0XHRcdFx0XHRcdCdBbGwgbG9jYWxzIG9mIGRlc3RydWN0dXJpbmcgYXNzaWdubWVudCBtdXN0IGJlIG9mIHRoZSBzYW1lIGtpbmQuJylcblx0XHRcdFx0cmV0dXJuIHdyYXAobmV3IEFzc2lnbkRlc3RydWN0dXJlKGxvYywgbG9jYWxzLCB2YWx1ZSwga2luZCkpXG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdF9wYXJzZUFzc2lnblZhbHVlID0gKGtpbmQsIG9wTmFtZSwgdmFsdWVUb2tlbnMpID0+IHtcblx0XHRjb25zdCB2YWx1ZSA9IHZhbHVlVG9rZW5zLmlzRW1wdHkoKSAmJiBraW5kID09PSBLV19PYmpBc3NpZ24gP1xuXHRcdFx0bmV3IFNwZWNpYWxWYWwodmFsdWVUb2tlbnMubG9jLCBTVl9OdWxsKSA6XG5cdFx0XHRwYXJzZUV4cHIodmFsdWVUb2tlbnMpXG5cdFx0c3dpdGNoIChraW5kKSB7XG5cdFx0XHRjYXNlIEtXX1lpZWxkOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFlpZWxkKHZhbHVlLmxvYywgdmFsdWUpXG5cdFx0XHRjYXNlIEtXX1lpZWxkVG86XG5cdFx0XHRcdHJldHVybiBuZXcgWWllbGRUbyh2YWx1ZS5sb2MsIHZhbHVlKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIHZhbHVlXG5cdFx0fVxuXHR9XG5cbmNvbnN0XG5cdHBhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcyA9IHRva2VucyA9PlxuXHRcdHRva2Vucy5tYXAoXyA9PiBMb2NhbERlY2xhcmUucGxhaW4oXy5sb2MsIF9wYXJzZUxvY2FsTmFtZShfKSkpLFxuXG5cdHBhcnNlTG9jYWxEZWNsYXJlcyA9ICh0b2tlbnMsIGluY2x1ZGVNZW1iZXJBcmdzKSA9PlxuXHRcdGluY2x1ZGVNZW1iZXJBcmdzID8gcGFyc2VMb2NhbERlY2xhcmVzQW5kTWVtYmVyQXJncyh0b2tlbnMpIDogdG9rZW5zLm1hcChwYXJzZUxvY2FsRGVjbGFyZSksXG5cblx0Ly8gX29yTWVtYmVyOiBpZiB0cnVlLCB3aWxsIGxvb2sgZm9yIGAueGAgYXJndW1lbnRzIGFuZCByZXR1cm4ge2RlY2xhcmUsIGlzTWVtYmVyfS5cblx0cGFyc2VMb2NhbERlY2xhcmUgPSAodG9rZW4sIF9vck1lbWJlcikgPT4ge1xuXHRcdGxldCBpc01lbWJlciA9IGZhbHNlXG5cdFx0bGV0IGRlY2xhcmVcblxuXHRcdGNvbnN0IHBhcnNlTG9jYWxOYW1lID0gdG9rZW4gPT4ge1xuXHRcdFx0aWYgKF9vck1lbWJlcikge1xuXHRcdFx0XHRpc01lbWJlciA9IHRva2VuIGluc3RhbmNlb2YgRG90TmFtZSAmJiB0b2tlbi5uRG90cyA9PT0gMVxuXHRcdFx0XHRyZXR1cm4gaXNNZW1iZXIgPyB0b2tlbi5uYW1lIDogX3BhcnNlTG9jYWxOYW1lKHRva2VuKVxuXHRcdFx0fSBlbHNlXG5cdFx0XHRcdHJldHVybiBfcGFyc2VMb2NhbE5hbWUodG9rZW4pXG5cdFx0fVxuXG5cdFx0aWYgKGlzR3JvdXAoR19TcGFjZSwgdG9rZW4pKSB7XG5cdFx0XHRjb25zdCB0b2tlbnMgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRcdGNvbnN0IFtyZXN0LCBpc0xhenldID1cblx0XHRcdFx0aXNLZXl3b3JkKEtXX0xhenksIHRva2Vucy5oZWFkKCkpID8gW3Rva2Vucy50YWlsKCksIHRydWVdIDogW3Rva2VucywgZmFsc2VdXG5cblx0XHRcdGNvbnN0IG5hbWUgPSBwYXJzZUxvY2FsTmFtZShyZXN0LmhlYWQoKSlcblx0XHRcdGNvbnN0IHJlc3QyID0gcmVzdC50YWlsKClcblx0XHRcdGNvbnN0IG9wVHlwZSA9IG9wSWYoIXJlc3QyLmlzRW1wdHkoKSwgKCkgPT4ge1xuXHRcdFx0XHRjb25zdCBjb2xvbiA9IHJlc3QyLmhlYWQoKVxuXHRcdFx0XHRjb250ZXh0LmNoZWNrKGlzS2V5d29yZChLV19UeXBlLCBjb2xvbiksIGNvbG9uLmxvYywgKCkgPT4gYEV4cGVjdGVkICR7Y29kZSgnOicpfWApXG5cdFx0XHRcdGNvbnN0IHRva2Vuc1R5cGUgPSByZXN0Mi50YWlsKClcblx0XHRcdFx0Y2hlY2tOb25FbXB0eSh0b2tlbnNUeXBlLCAoKSA9PiBgRXhwZWN0ZWQgc29tZXRoaW5nIGFmdGVyICR7Y29sb259YClcblx0XHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkKHRva2Vuc1R5cGUpXG5cdFx0XHR9KVxuXHRcdFx0ZGVjbGFyZSA9IG5ldyBMb2NhbERlY2xhcmUodG9rZW4ubG9jLCBuYW1lLCBvcFR5cGUsIGlzTGF6eSA/IExEX0xhenkgOiBMRF9Db25zdClcblx0XHR9IGVsc2Vcblx0XHRcdGRlY2xhcmUgPSBMb2NhbERlY2xhcmUucGxhaW4odG9rZW4ubG9jLCBwYXJzZUxvY2FsTmFtZSh0b2tlbikpXG5cblx0XHRpZiAoX29yTWVtYmVyKVxuXHRcdFx0cmV0dXJuIHtkZWNsYXJlLCBpc01lbWJlcn1cblx0XHRlbHNlXG5cdFx0XHRyZXR1cm4gZGVjbGFyZVxuXHR9LFxuXG5cdHBhcnNlTG9jYWxEZWNsYXJlc0FuZE1lbWJlckFyZ3MgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGRlY2xhcmVzID0gW10sIG1lbWJlckFyZ3MgPSBbXVxuXHRcdGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG5cdFx0XHRjb25zdCB7ZGVjbGFyZSwgaXNNZW1iZXJ9ID0gcGFyc2VMb2NhbERlY2xhcmUodG9rZW4sIHRydWUpXG5cdFx0XHRkZWNsYXJlcy5wdXNoKGRlY2xhcmUpXG5cdFx0XHRpZiAoaXNNZW1iZXIpXG5cdFx0XHRcdG1lbWJlckFyZ3MucHVzaChkZWNsYXJlKVxuXHRcdH1cblx0XHRyZXR1cm4ge2RlY2xhcmVzLCBtZW1iZXJBcmdzfVxuXHR9XG5cbi8vIHBhcnNlTG9jYWxEZWNsYXJlIHByaXZhdGVzXG5jb25zdFxuXHRfcGFyc2VMb2NhbE5hbWUgPSB0ID0+IHtcblx0XHRpZiAoaXNLZXl3b3JkKEtXX0ZvY3VzLCB0KSlcblx0XHRcdHJldHVybiAnXydcblx0XHRlbHNlIHtcblx0XHRcdGNvbnRleHQuY2hlY2sodCBpbnN0YW5jZW9mIE5hbWUsIHQubG9jLCAoKSA9PiBgRXhwZWN0ZWQgYSBsb2NhbCBuYW1lLCBub3QgJHt0fWApXG5cdFx0XHRyZXR1cm4gdC5uYW1lXG5cdFx0fVxuXHR9XG5cbmNvbnN0IHBhcnNlU2luZ2xlID0gdG9rZW4gPT4ge1xuXHRjb25zdCB7bG9jfSA9IHRva2VuXG5cdGlmICh0b2tlbiBpbnN0YW5jZW9mIE5hbWUpXG5cdFx0cmV0dXJuIG5ldyBMb2NhbEFjY2Vzcyhsb2MsIHRva2VuLm5hbWUpXG5cdGVsc2UgaWYgKHRva2VuIGluc3RhbmNlb2YgR3JvdXApIHtcblx0XHRjb25zdCBzbGljZSA9IFNsaWNlLmdyb3VwKHRva2VuKVxuXHRcdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdFx0Y2FzZSBHX1NwYWNlOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VTcGFjZWQoc2xpY2UpXG5cdFx0XHRjYXNlIEdfUGFyZW50aGVzaXM6XG5cdFx0XHRcdHJldHVybiBwYXJzZUV4cHIoc2xpY2UpXG5cdFx0XHRjYXNlIEdfQnJhY2tldDpcblx0XHRcdFx0cmV0dXJuIG5ldyBCYWdTaW1wbGUobG9jLCBwYXJzZUV4cHJQYXJ0cyhzbGljZSkpXG5cdFx0XHRjYXNlIEdfQmxvY2s6XG5cdFx0XHRcdHJldHVybiBibG9ja1dyYXAoc2xpY2UpXG5cdFx0XHRjYXNlIEdfUXVvdGU6XG5cdFx0XHRcdHJldHVybiBwYXJzZVF1b3RlKHNsaWNlKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKHRva2VuLmtpbmQpXG5cdFx0fVxuXHR9IGVsc2UgaWYgKHRva2VuIGluc3RhbmNlb2YgTnVtYmVyTGl0ZXJhbClcblx0XHRyZXR1cm4gdG9rZW5cblx0ZWxzZSBpZiAodG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdFx0Y2FzZSBLV19Gb2N1czpcblx0XHRcdFx0cmV0dXJuIExvY2FsQWNjZXNzLmZvY3VzKGxvYylcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBpZkVsc2Uob3BLZXl3b3JkS2luZFRvU3BlY2lhbFZhbHVlS2luZCh0b2tlbi5raW5kKSxcblx0XHRcdFx0XHRfID0+IG5ldyBTcGVjaWFsVmFsKGxvYywgXyksXG5cdFx0XHRcdFx0KCkgPT4gdW5leHBlY3RlZCh0b2tlbikpXG5cblx0XHR9XG5cdGVsc2UgaWYgKHRva2VuIGluc3RhbmNlb2YgRG90TmFtZSlcblx0XHRzd2l0Y2ggKHRva2VuLm5Eb3RzKSB7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHJldHVybiBuZXcgTWVtYmVyKHRva2VuLmxvYywgTG9jYWxBY2Nlc3MudGhpcyh0b2tlbi5sb2MpLCB0b2tlbi5uYW1lKVxuXHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFNwbGF0KGxvYywgbmV3IExvY2FsQWNjZXNzKGxvYywgdG9rZW4ubmFtZSkpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR1bmV4cGVjdGVkKHRva2VuKVxuXHRcdH1cblx0ZWxzZVxuXHRcdHVuZXhwZWN0ZWQodG9rZW4pXG59XG5cbmNvbnN0IHBhcnNlU3BhY2VkID0gdG9rZW5zID0+IHtcblx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKCksIHJlc3QgPSB0b2tlbnMudGFpbCgpXG5cdGlmIChpc0tleXdvcmQoS1dfVHlwZSwgaCkpXG5cdFx0cmV0dXJuIENhbGwuY29udGFpbnMoaC5sb2MsIHBhcnNlU3BhY2VkKHJlc3QpLCBMb2NhbEFjY2Vzcy5mb2N1cyhoLmxvYykpXG5cdGVsc2UgaWYgKGlzS2V5d29yZChLV19MYXp5LCBoKSlcblx0XHRyZXR1cm4gbmV3IExhenkoaC5sb2MsIHBhcnNlU3BhY2VkKHJlc3QpKVxuXHRlbHNlIGlmIChpc0tleXdvcmQoS1dfU3VwZXJWYWwsIGgpKSB7XG5cdFx0Ly8gVE9ETzogaGFuZGxlIHN1YiBoZXJlIGFzIHdlbGxcblx0XHRjb25zdCBoMiA9IHJlc3QuaGVhZCgpXG5cdFx0aWYgKGgyIGluc3RhbmNlb2YgRG90TmFtZSkge1xuXHRcdFx0Y29udGV4dC5jaGVjayhoMi5uRG90cyA9PT0gMSwgaDIubG9jLCAnVG9vIG1hbnkgZG90cyEnKVxuXHRcdFx0Y29uc3QgeCA9IG5ldyBTdXBlck1lbWJlcihoMi5sb2MsIGgyLm5hbWUpXG5cdFx0XHRyZXR1cm4gX3BhcnNlU3BhY2VkRm9sZCh4LCByZXN0LnRhaWwoKSlcblx0XHR9IGVsc2UgaWYgKGlzR3JvdXAoR19QYXJlbnRoZXNpcywgaDIpICYmIFNsaWNlLmdyb3VwKGgyKS5pc0VtcHR5KCkpIHtcblx0XHRcdGNvbnN0IHggPSBuZXcgU3VwZXJDYWxsKGgyLmxvYywgW10pXG5cdFx0XHRyZXR1cm4gX3BhcnNlU3BhY2VkRm9sZCh4LCByZXN0LnRhaWwoKSlcblx0XHR9IGVsc2Vcblx0XHRcdGNvbnRleHQuZmFpbChgRXhwZWN0ZWQgJHtjb2RlKCcuJyl9IG9yICR7Y29kZSgnKCknKX0gYWZ0ZXIgJHtjb2RlKCdzdXBlcicpfWApXG5cdH0gZWxzZVxuXHRcdHJldHVybiBfcGFyc2VTcGFjZWRGb2xkKHBhcnNlU2luZ2xlKGgpLCByZXN0KVxufVxuY29uc3QgX3BhcnNlU3BhY2VkRm9sZCA9IChzdGFydCwgcmVzdCkgPT4ge1xuXHRsZXQgYWNjID0gc3RhcnRcblx0Zm9yIChsZXQgaSA9IHJlc3Quc3RhcnQ7IGkgPCByZXN0LmVuZDsgaSA9IGkgKyAxKSB7XG5cdFx0Y29uc3QgdG9rZW4gPSByZXN0LnRva2Vuc1tpXVxuXHRcdGNvbnN0IGxvYyA9IHRva2VuLmxvY1xuXHRcdGlmICh0b2tlbiBpbnN0YW5jZW9mIERvdE5hbWUpIHtcblx0XHRcdGNvbnRleHQuY2hlY2sodG9rZW4ubkRvdHMgPT09IDEsIHRva2VuLmxvYywgJ1RvbyBtYW55IGRvdHMhJylcblx0XHRcdGFjYyA9IG5ldyBNZW1iZXIodG9rZW4ubG9jLCBhY2MsIHRva2VuLm5hbWUpXG5cdFx0XHRjb250aW51ZVxuXHRcdH1cblx0XHRpZiAodG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRcdGNhc2UgS1dfRm9jdXM6XG5cdFx0XHRcdFx0YWNjID0gbmV3IENhbGwodG9rZW4ubG9jLCBhY2MsIFtMb2NhbEFjY2Vzcy5mb2N1cyhsb2MpXSlcblx0XHRcdFx0XHRjb250aW51ZVxuXHRcdFx0XHRjYXNlIEtXX1R5cGU6IHtcblx0XHRcdFx0XHRjb25zdCB0eXBlID0gcGFyc2VTcGFjZWQocmVzdC5fY2hvcFN0YXJ0KGkgKyAxKSlcblx0XHRcdFx0XHRyZXR1cm4gQ2FsbC5jb250YWlucyh0b2tlbi5sb2MsIHR5cGUsIGFjYylcblx0XHRcdFx0fVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0fVxuXHRcdGlmICh0b2tlbiBpbnN0YW5jZW9mIEdyb3VwKSB7XG5cdFx0XHRjb25zdCBzbGljZSA9IFNsaWNlLmdyb3VwKHRva2VuKVxuXHRcdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRcdGNhc2UgR19CcmFja2V0OlxuXHRcdFx0XHRcdGFjYyA9IENhbGwuc3ViKGxvYywgY2F0KGFjYywgcGFyc2VFeHByUGFydHMoc2xpY2UpKSlcblx0XHRcdFx0XHRjb250aW51ZVxuXHRcdFx0XHRjYXNlIEdfUGFyZW50aGVzaXM6XG5cdFx0XHRcdFx0Y2hlY2tFbXB0eShzbGljZSwgKCkgPT5cblx0XHRcdFx0XHRcdGBVc2UgJHtjb2RlKCcoYSBiKScpfSwgbm90ICR7Y29kZSgnYShiKScpfWApXG5cdFx0XHRcdFx0YWNjID0gbmV3IENhbGwobG9jLCBhY2MsIFtdKVxuXHRcdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRcdGNhc2UgR19RdW90ZTpcblx0XHRcdFx0XHRhY2MgPSBuZXcgUXVvdGVUZW1wbGF0ZShsb2MsIGFjYywgcGFyc2VRdW90ZShzbGljZSkpXG5cdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdH1cblx0XHR9XG5cdFx0Y29udGV4dC5mYWlsKHRva2VuLmxvYywgYEV4cGVjdGVkIG1lbWJlciBvciBzdWIsIG5vdCAke3Rva2VufWApXG5cdH1cblx0cmV0dXJuIGFjY1xufVxuXG5jb25zdCB0cnlQYXJzZUltcG9ydHMgPSAoaW1wb3J0S2V5d29yZEtpbmQsIHRva2VucykgPT4ge1xuXHRpZiAoIXRva2Vucy5pc0VtcHR5KCkpIHtcblx0XHRjb25zdCBsaW5lMCA9IHRva2Vucy5oZWFkU2xpY2UoKVxuXHRcdGlmIChpc0tleXdvcmQoaW1wb3J0S2V5d29yZEtpbmQsIGxpbmUwLmhlYWQoKSkpIHtcblx0XHRcdGNvbnN0IHtpbXBvcnRzLCBvcEltcG9ydEdsb2JhbH0gPSBfcGFyc2VJbXBvcnRzKGltcG9ydEtleXdvcmRLaW5kLCBsaW5lMC50YWlsKCkpXG5cdFx0XHRpZiAobmV3IFNldChbS1dfSW1wb3J0RG8sIEtXX0ltcG9ydExhenksIEtXX0ltcG9ydERlYnVnXSkuaGFzKGltcG9ydEtleXdvcmRLaW5kKSlcblx0XHRcdFx0Y29udGV4dC5jaGVjayhvcEltcG9ydEdsb2JhbCA9PT0gbnVsbCwgbGluZTAubG9jLCAnQ2FuXFwndCB1c2UgZ2xvYmFsIGhlcmUuJylcblx0XHRcdHJldHVybiB7aW1wb3J0cywgb3BJbXBvcnRHbG9iYWwsIHJlc3Q6IHRva2Vucy50YWlsKCl9XG5cdFx0fVxuXHR9XG5cdHJldHVybiB7aW1wb3J0czogW10sIG9wSW1wb3J0R2xvYmFsOiBudWxsLCByZXN0OiB0b2tlbnN9XG59XG5cbi8vIHRyeVBhcnNlSW1wb3J0cyBwcml2YXRlc1xuY29uc3Rcblx0X3BhcnNlSW1wb3J0cyA9IChpbXBvcnRLZXl3b3JkS2luZCwgdG9rZW5zKSA9PiB7XG5cdFx0Y29uc3QgbGluZXMgPSBqdXN0QmxvY2soaW1wb3J0S2V5d29yZEtpbmQsIHRva2Vucylcblx0XHRsZXQgb3BJbXBvcnRHbG9iYWwgPSBudWxsXG5cblx0XHRjb25zdCBpbXBvcnRzID0gW11cblxuXHRcdGZvciAoY29uc3QgbGluZSBvZiBsaW5lcy5zbGljZXMoKSkge1xuXHRcdFx0Y29uc3Qge3BhdGgsIG5hbWV9ID0gX3BhcnNlUmVxdWlyZShsaW5lLmhlYWQoKSlcblx0XHRcdGlmIChpbXBvcnRLZXl3b3JkS2luZCA9PT0gS1dfSW1wb3J0RG8pIHtcblx0XHRcdFx0aWYgKGxpbmUuc2l6ZSgpID4gMSlcblx0XHRcdFx0XHR1bmV4cGVjdGVkKGxpbmUuc2Vjb25kKCkpXG5cdFx0XHRcdGltcG9ydHMucHVzaChuZXcgSW1wb3J0RG8obGluZS5sb2MsIHBhdGgpKVxuXHRcdFx0fSBlbHNlXG5cdFx0XHRcdGlmIChwYXRoID09PSAnZ2xvYmFsJykge1xuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2sob3BJbXBvcnRHbG9iYWwgPT09IG51bGwsIGxpbmUubG9jLCAnQ2FuXFwndCB1c2UgZ2xvYmFsIHR3aWNlJylcblx0XHRcdFx0XHRjb25zdCB7aW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdH0gPVxuXHRcdFx0XHRcdFx0X3BhcnNlVGhpbmdzSW1wb3J0ZWQobmFtZSwgZmFsc2UsIGxpbmUudGFpbCgpKVxuXHRcdFx0XHRcdG9wSW1wb3J0R2xvYmFsID0gbmV3IEltcG9ydEdsb2JhbChsaW5lLmxvYywgaW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdClcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBpc0xhenkgPVxuXHRcdFx0XHRcdFx0aW1wb3J0S2V5d29yZEtpbmQgPT09IEtXX0ltcG9ydExhenkgfHwgaW1wb3J0S2V5d29yZEtpbmQgPT09IEtXX0ltcG9ydERlYnVnXG5cdFx0XHRcdFx0Y29uc3Qge2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9ID1cblx0XHRcdFx0XHRcdF9wYXJzZVRoaW5nc0ltcG9ydGVkKG5hbWUsIGlzTGF6eSwgbGluZS50YWlsKCkpXG5cdFx0XHRcdFx0aW1wb3J0cy5wdXNoKG5ldyBJbXBvcnQobGluZS5sb2MsIHBhdGgsIGltcG9ydGVkLCBvcEltcG9ydERlZmF1bHQpKVxuXHRcdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtpbXBvcnRzLCBvcEltcG9ydEdsb2JhbH1cblx0fSxcblx0X3BhcnNlVGhpbmdzSW1wb3J0ZWQgPSAobmFtZSwgaXNMYXp5LCB0b2tlbnMpID0+IHtcblx0XHRjb25zdCBpbXBvcnREZWZhdWx0ID0gKCkgPT5cblx0XHRcdExvY2FsRGVjbGFyZS51bnR5cGVkKHRva2Vucy5sb2MsIG5hbWUsIGlzTGF6eSA/IExEX0xhenkgOiBMRF9Db25zdClcblx0XHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRcdHJldHVybiB7aW1wb3J0ZWQ6IFtdLCBvcEltcG9ydERlZmF1bHQ6IGltcG9ydERlZmF1bHQoKX1cblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IFtvcEltcG9ydERlZmF1bHQsIHJlc3RdID0gaXNLZXl3b3JkKEtXX0ZvY3VzLCB0b2tlbnMuaGVhZCgpKSA/XG5cdFx0XHRcdFtpbXBvcnREZWZhdWx0KCksIHRva2Vucy50YWlsKCldIDpcblx0XHRcdFx0W251bGwsIHRva2Vuc11cblx0XHRcdGNvbnN0IGltcG9ydGVkID0gcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKHJlc3QpLm1hcChsID0+IHtcblx0XHRcdFx0Y29udGV4dC5jaGVjayhsLm5hbWUgIT09ICdfJywgbC5wb3MsXG5cdFx0XHRcdFx0KCkgPT4gYCR7Y29kZSgnXycpfSBub3QgYWxsb3dlZCBhcyBpbXBvcnQgbmFtZS5gKVxuXHRcdFx0XHRpZiAoaXNMYXp5KVxuXHRcdFx0XHRcdGwua2luZCA9IExEX0xhenlcblx0XHRcdFx0cmV0dXJuIGxcblx0XHRcdH0pXG5cdFx0XHRyZXR1cm4ge2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9XG5cdFx0fVxuXHR9LFxuXHRfcGFyc2VSZXF1aXJlID0gdCA9PiB7XG5cdFx0aWYgKHQgaW5zdGFuY2VvZiBOYW1lKVxuXHRcdFx0cmV0dXJuIHtwYXRoOiB0Lm5hbWUsIG5hbWU6IHQubmFtZX1cblx0XHRlbHNlIGlmICh0IGluc3RhbmNlb2YgRG90TmFtZSlcblx0XHRcdHJldHVybiB7cGF0aDogY2F0KF9wYXJ0c0Zyb21Eb3ROYW1lKHQpLCB0Lm5hbWUpLmpvaW4oJy8nKSwgbmFtZTogdC5uYW1lfVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29udGV4dC5jaGVjayhpc0dyb3VwKEdfU3BhY2UsIHQpLCB0LmxvYywgJ05vdCBhIHZhbGlkIG1vZHVsZSBuYW1lLicpXG5cdFx0XHRyZXR1cm4gX3BhcnNlU3BhY2VkUmVxdWlyZShTbGljZS5ncm91cCh0KSlcblx0XHR9XG5cdH0sXG5cdF9wYXJzZVNwYWNlZFJlcXVpcmUgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGZpcnN0ID0gdG9rZW5zLmhlYWQoKVxuXHRcdGxldCBwYXJ0c1xuXHRcdGlmIChmaXJzdCBpbnN0YW5jZW9mIERvdE5hbWUpXG5cdFx0XHRwYXJ0cyA9IF9wYXJ0c0Zyb21Eb3ROYW1lKGZpcnN0KVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29udGV4dC5jaGVjayhmaXJzdCBpbnN0YW5jZW9mIE5hbWUsIGZpcnN0LmxvYywgJ05vdCBhIHZhbGlkIHBhcnQgb2YgbW9kdWxlIHBhdGguJylcblx0XHRcdHBhcnRzID0gW11cblx0XHR9XG5cdFx0cGFydHMucHVzaChmaXJzdC5uYW1lKVxuXHRcdGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zLnRhaWwoKSkge1xuXHRcdFx0Y29udGV4dC5jaGVjayh0b2tlbiBpbnN0YW5jZW9mIERvdE5hbWUgJiYgdG9rZW4ubkRvdHMgPT09IDEsIHRva2VuLmxvYyxcblx0XHRcdFx0J05vdCBhIHZhbGlkIHBhcnQgb2YgbW9kdWxlIHBhdGguJylcblx0XHRcdHBhcnRzLnB1c2godG9rZW4ubmFtZSlcblx0XHR9XG5cdFx0cmV0dXJuIHtwYXRoOiBwYXJ0cy5qb2luKCcvJyksIG5hbWU6IHRva2Vucy5sYXN0KCkubmFtZX1cblx0fSxcblx0X3BhcnRzRnJvbURvdE5hbWUgPSBkb3ROYW1lID0+XG5cdFx0ZG90TmFtZS5uRG90cyA9PT0gMSA/IFsnLiddIDogcmVwZWF0KCcuLicsIGRvdE5hbWUubkRvdHMgLSAxKVxuXG5jb25zdFxuXHRfcGFyc2VGb3IgPSBjdHIgPT4gdG9rZW5zID0+IHtcblx0XHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdFx0cmV0dXJuIG5ldyBjdHIodG9rZW5zLmxvYywgX3BhcnNlT3BJdGVyYXRlZShiZWZvcmUpLCBwYXJzZUJsb2NrRG8oYmxvY2spKVxuXHR9LFxuXHRfcGFyc2VPcEl0ZXJhdGVlID0gdG9rZW5zID0+XG5cdFx0b3BJZighdG9rZW5zLmlzRW1wdHkoKSwgKCkgPT4ge1xuXHRcdFx0Y29uc3QgW2VsZW1lbnQsIGJhZ10gPVxuXHRcdFx0XHRpZkVsc2UodG9rZW5zLm9wU3BsaXRPbmNlV2hlcmUoXyA9PiBpc0tleXdvcmQoS1dfSW4sIF8pKSxcblx0XHRcdFx0XHQoe2JlZm9yZSwgYWZ0ZXJ9KSA9PiB7XG5cdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKGJlZm9yZS5zaXplKCkgPT09IDEsIGJlZm9yZS5sb2MsICdUT0RPOiBwYXR0ZXJuIGluIGZvcicpXG5cdFx0XHRcdFx0XHRyZXR1cm4gW3BhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcyhiZWZvcmUpWzBdLCBwYXJzZUV4cHIoYWZ0ZXIpXVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0KCkgPT4gW25ldyBMb2NhbERlY2xhcmVGb2N1cyh0b2tlbnMubG9jKSwgcGFyc2VFeHByKHRva2VucyldKVxuXHRcdFx0cmV0dXJuIG5ldyBJdGVyYXRlZSh0b2tlbnMubG9jLCBlbGVtZW50LCBiYWcpXG5cdFx0fSlcbmNvbnN0XG5cdHBhcnNlRm9yRG8gPSBfcGFyc2VGb3IoRm9yRG8pLFxuXHRwYXJzZUZvclZhbCA9IF9wYXJzZUZvcihGb3JWYWwpLFxuXHQvLyBUT0RPOiAtPiBvdXQtdHlwZVxuXHRwYXJzZUZvckJhZyA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgbGluZXNdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRcdGNvbnN0IGJsb2NrID0gcGFyc2VCbG9ja0RvKGxpbmVzKVxuXHRcdC8vIFRPRE86IEJldHRlciB3YXk/XG5cdFx0aWYgKGJsb2NrLmxpbmVzLmxlbmd0aCA9PT0gMSAmJiBibG9jay5saW5lc1swXSBpbnN0YW5jZW9mIFZhbClcblx0XHRcdGJsb2NrLmxpbmVzWzBdID0gbmV3IEJhZ0VudHJ5KGJsb2NrLmxpbmVzWzBdLmxvYywgYmxvY2subGluZXNbMF0pXG5cdFx0cmV0dXJuIEZvckJhZy5vZih0b2tlbnMubG9jLCBfcGFyc2VPcEl0ZXJhdGVlKGJlZm9yZSksIGJsb2NrKVxuXHR9XG5cblxuY29uc3Rcblx0cGFyc2VFeGNlcHQgPSAoa3dFeGNlcHQsIHRva2VucykgPT4ge1xuXHRcdGNvbnN0XG5cdFx0XHRpc1ZhbCA9IGt3RXhjZXB0ID09PSBLV19FeGNlcHRWYWwsXG5cdFx0XHRqdXN0RG9WYWxCbG9jayA9IGlzVmFsID8ganVzdEJsb2NrVmFsIDoganVzdEJsb2NrRG8sXG5cdFx0XHRwYXJzZUJsb2NrID0gaXNWYWwgPyBwYXJzZUJsb2NrVmFsIDogcGFyc2VCbG9ja0RvLFxuXHRcdFx0RXhjZXB0ID0gaXNWYWwgPyBFeGNlcHRWYWwgOiBFeGNlcHREbyxcblx0XHRcdGt3VHJ5ID0gaXNWYWwgPyBLV19UcnlWYWwgOiBLV19UcnlEbyxcblx0XHRcdGt3Q2F0Y2ggPSBpc1ZhbCA/IEtXX0NhdGNoVmFsIDogS1dfQ2F0Y2hEbyxcblx0XHRcdG5hbWVUcnkgPSAoKSA9PiBjb2RlKGtleXdvcmROYW1lKGt3VHJ5KSksXG5cdFx0XHRuYW1lQ2F0Y2ggPSAoKSA9PiBjb2RlKGtleXdvcmROYW1lKGt3Q2F0Y2gpKSxcblx0XHRcdG5hbWVGaW5hbGx5ID0gKCkgPT4gY29kZShrZXl3b3JkTmFtZShLV19GaW5hbGx5KSlcblxuXHRcdGNvbnN0IGxpbmVzID0ganVzdEJsb2NrKGt3RXhjZXB0LCB0b2tlbnMpXG5cblx0XHQvLyBgdHJ5YCAqbXVzdCogY29tZSBmaXJzdC5cblx0XHRjb25zdCBmaXJzdExpbmUgPSBsaW5lcy5oZWFkU2xpY2UoKVxuXHRcdGNvbnN0IHRva2VuVHJ5ID0gZmlyc3RMaW5lLmhlYWQoKVxuXHRcdGNvbnRleHQuY2hlY2soaXNLZXl3b3JkKGt3VHJ5LCB0b2tlblRyeSksIHRva2VuVHJ5LmxvYywgKCkgPT5cblx0XHRcdGBNdXN0IHN0YXJ0IHdpdGggJHtuYW1lVHJ5KCl9YClcblx0XHRjb25zdCBfdHJ5ID0ganVzdERvVmFsQmxvY2soa3dUcnksIGZpcnN0TGluZS50YWlsKCkpXG5cblx0XHRjb25zdCByZXN0TGluZXMgPSBsaW5lcy50YWlsKClcblx0XHRjaGVja05vbkVtcHR5KHJlc3RMaW5lcywgKCkgPT5cblx0XHRcdGBNdXN0IGhhdmUgYXQgbGVhc3Qgb25lIG9mICR7bmFtZUNhdGNoKCl9IG9yICR7bmFtZUZpbmFsbHkoKX1gKVxuXG5cdFx0Y29uc3QgaGFuZGxlRmluYWxseSA9IHJlc3RMaW5lcyA9PiB7XG5cdFx0XHRjb25zdCBsaW5lID0gcmVzdExpbmVzLmhlYWRTbGljZSgpXG5cdFx0XHRjb25zdCB0b2tlbkZpbmFsbHkgPSBsaW5lLmhlYWQoKVxuXHRcdFx0Y29udGV4dC5jaGVjayhpc0tleXdvcmQoS1dfRmluYWxseSwgdG9rZW5GaW5hbGx5KSwgdG9rZW5GaW5hbGx5LmxvYywgKCkgPT5cblx0XHRcdFx0YEV4cGVjdGVkICR7bmFtZUZpbmFsbHkoKX1gKVxuXHRcdFx0Y29udGV4dC5jaGVjayhyZXN0TGluZXMuc2l6ZSgpID09PSAxLCByZXN0TGluZXMubG9jLCAoKSA9PlxuXHRcdFx0XHRgTm90aGluZyBpcyBhbGxvd2VkIHRvIGNvbWUgYWZ0ZXIgJHtuYW1lRmluYWxseSgpfS5gKVxuXHRcdFx0cmV0dXJuIGp1c3RCbG9ja0RvKEtXX0ZpbmFsbHksIGxpbmUudGFpbCgpKVxuXHRcdH1cblxuXHRcdGxldCBfY2F0Y2gsIF9maW5hbGx5XG5cblx0XHRjb25zdCBsaW5lMiA9IHJlc3RMaW5lcy5oZWFkU2xpY2UoKVxuXHRcdGNvbnN0IGhlYWQyID0gbGluZTIuaGVhZCgpXG5cdFx0aWYgKGlzS2V5d29yZChrd0NhdGNoLCBoZWFkMikpIHtcblx0XHRcdGNvbnN0IFtiZWZvcmUyLCBibG9jazJdID0gYmVmb3JlQW5kQmxvY2sobGluZTIudGFpbCgpKVxuXHRcdFx0Y29uc3QgY2F1Z2h0ID0gX3BhcnNlT25lTG9jYWxEZWNsYXJlT3JGb2N1cyhiZWZvcmUyKVxuXHRcdFx0X2NhdGNoID0gbmV3IENhdGNoKGxpbmUyLmxvYywgY2F1Z2h0LCBwYXJzZUJsb2NrKGJsb2NrMikpXG5cdFx0XHRfZmluYWxseSA9IG9wSWYocmVzdExpbmVzLnNpemUoKSA+IDEsICgpID0+IGhhbmRsZUZpbmFsbHkocmVzdExpbmVzLnRhaWwoKSkpXG5cdFx0fSBlbHNlIHtcblx0XHRcdF9jYXRjaCA9IG51bGxcblx0XHRcdF9maW5hbGx5ID0gaGFuZGxlRmluYWxseShyZXN0TGluZXMpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBFeGNlcHQodG9rZW5zLmxvYywgX3RyeSwgX2NhdGNoLCBfZmluYWxseSlcblx0fSxcblx0X3BhcnNlT25lTG9jYWxEZWNsYXJlT3JGb2N1cyA9IHRva2VucyA9PiB7XG5cdFx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsRGVjbGFyZUZvY3VzKHRva2Vucy5sb2MpXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKHRva2Vucy5zaXplKCkgPT09IDEsICdFeHBlY3RlZCBvbmx5IG9uZSBsb2NhbCBkZWNsYXJlLicpXG5cdFx0XHRyZXR1cm4gcGFyc2VMb2NhbERlY2xhcmVzKHRva2VucylbMF1cblx0XHR9XG5cdH1cblxuY29uc3QgcGFyc2VBc3NlcnQgPSAobmVnYXRlLCB0b2tlbnMpID0+IHtcblx0Y2hlY2tOb25FbXB0eSh0b2tlbnMsICgpID0+IGBFeHBlY3RlZCBzb21ldGhpbmcgYWZ0ZXIgJHtrZXl3b3JkTmFtZShLV19Bc3NlcnQpfS5gKVxuXG5cdGNvbnN0IFtjb25kVG9rZW5zLCBvcFRocm93bl0gPVxuXHRcdGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2VXaGVyZShfID0+IGlzS2V5d29yZChLV19UaHJvdywgXykpLFxuXHRcdFx0KHtiZWZvcmUsIGFmdGVyfSkgPT4gW2JlZm9yZSwgcGFyc2VFeHByKGFmdGVyKV0sXG5cdFx0XHQoKSA9PiBbdG9rZW5zLCBudWxsXSlcblxuXHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKGNvbmRUb2tlbnMpXG5cdGNvbnN0IGNvbmQgPSBwYXJ0cy5sZW5ndGggPT09IDEgPyBwYXJ0c1swXSA6IG5ldyBDYWxsKGNvbmRUb2tlbnMubG9jLCBwYXJ0c1swXSwgdGFpbChwYXJ0cykpXG5cdHJldHVybiBuZXcgQXNzZXJ0KHRva2Vucy5sb2MsIG5lZ2F0ZSwgY29uZCwgb3BUaHJvd24pXG59XG5cbmNvbnN0IHBhcnNlQ2xhc3MgPSB0b2tlbnMgPT4ge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdGNvbnN0IG9wRXh0ZW5kZWQgPSBvcElmKCFiZWZvcmUuaXNFbXB0eSgpLCAoKSA9PiBwYXJzZUV4cHIoYmVmb3JlKSlcblxuXHRsZXQgb3BEbyA9IG51bGwsIHN0YXRpY3MgPSBbXSwgb3BDb25zdHJ1Y3RvciA9IG51bGwsIG1ldGhvZHMgPSBbXVxuXG5cdGxldCBbb3BDb21tZW50LCByZXN0XSA9IHRyeVRha2VDb21tZW50KGJsb2NrKVxuXG5cdGNvbnN0IGxpbmUxID0gcmVzdC5oZWFkU2xpY2UoKVxuXHRpZiAoaXNLZXl3b3JkKEtXX0RvLCBsaW5lMS5oZWFkKCkpKSB7XG5cdFx0Y29uc3QgZG9uZSA9IGp1c3RCbG9ja0RvKEtXX0RvLCBsaW5lMS50YWlsKCkpXG5cdFx0b3BEbyA9IG5ldyBDbGFzc0RvKGxpbmUxLmxvYywgbmV3IExvY2FsRGVjbGFyZUZvY3VzKGxpbmUxLmxvYyksIGRvbmUpXG5cdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdH1cblx0aWYgKCFyZXN0LmlzRW1wdHkoKSkge1xuXHRcdGNvbnN0IGxpbmUyID0gcmVzdC5oZWFkU2xpY2UoKVxuXHRcdGlmIChpc0tleXdvcmQoS1dfU3RhdGljLCBsaW5lMi5oZWFkKCkpKSB7XG5cdFx0XHRzdGF0aWNzID0gX3BhcnNlU3RhdGljcyhsaW5lMi50YWlsKCkpXG5cdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHR9XG5cdFx0aWYgKCFyZXN0LmlzRW1wdHkoKSkge1xuXHRcdFx0Y29uc3QgbGluZTMgPSByZXN0LmhlYWRTbGljZSgpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtXX0NvbnN0cnVjdCwgbGluZTMuaGVhZCgpKSkge1xuXHRcdFx0XHRvcENvbnN0cnVjdG9yID0gX3BhcnNlQ29uc3RydWN0b3IobGluZTMudGFpbCgpKVxuXHRcdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHRcdH1cblx0XHRcdG1ldGhvZHMgPSBfcGFyc2VNZXRob2RzKHJlc3QpXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG5ldyBDbGFzcyh0b2tlbnMubG9jLCBvcEV4dGVuZGVkLCBvcENvbW1lbnQsIG9wRG8sIHN0YXRpY3MsIG9wQ29uc3RydWN0b3IsIG1ldGhvZHMpXG59XG5cbmNvbnN0XG5cdF9wYXJzZUNvbnN0cnVjdG9yID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCB7YXJncywgbWVtYmVyQXJncywgb3BSZXN0QXJnLCBibG9jaywgb3BJbiwgb3BPdXR9ID1cblx0XHRcdF9mdW5BcmdzQW5kQmxvY2sodHJ1ZSwgdG9rZW5zLCB0cnVlKVxuXHRcdGNvbnN0IGlzR2VuZXJhdG9yID0gZmFsc2UsIG9wRGVjbGFyZVJlcyA9IG51bGxcblx0XHRjb25zdCBmdW4gPSBuZXcgRnVuKHRva2Vucy5sb2MsXG5cdFx0XHRuZXcgTG9jYWxEZWNsYXJlVGhpcyh0b2tlbnMubG9jKSxcblx0XHRcdGlzR2VuZXJhdG9yLFxuXHRcdFx0YXJncywgb3BSZXN0QXJnLFxuXHRcdFx0YmxvY2ssIG9wSW4sIG9wRGVjbGFyZVJlcywgb3BPdXQpXG5cdFx0cmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0b2tlbnMubG9jLCBmdW4sIG1lbWJlckFyZ3MpXG5cdH0sXG5cdF9wYXJzZVN0YXRpY3MgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGJsb2NrID0ganVzdEJsb2NrKEtXX1N0YXRpYywgdG9rZW5zKVxuXHRcdHJldHVybiBfcGFyc2VNZXRob2RzKGJsb2NrKVxuXHR9LFxuXHRfcGFyc2VNZXRob2RzID0gdG9rZW5zID0+IHRva2Vucy5tYXBTbGljZXMoX3BhcnNlTWV0aG9kKSxcblx0X3BhcnNlTWV0aG9kID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBoZWFkID0gdG9rZW5zLmhlYWQoKVxuXG5cdFx0aWYgKGlzS2V5d29yZChLV19HZXQsIGhlYWQpKSB7XG5cdFx0XHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMudGFpbCgpKVxuXHRcdFx0cmV0dXJuIG5ldyBNZXRob2RHZXR0ZXIodG9rZW5zLmxvYywgX3BhcnNlRXhwck9yU3RyTGl0KGJlZm9yZSksIHBhcnNlQmxvY2tWYWwoYmxvY2spKVxuXHRcdH0gZWxzZSBpZiAoaXNLZXl3b3JkKEtXX1NldCwgaGVhZCkpIHtcblx0XHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucy50YWlsKCkpXG5cdFx0XHRyZXR1cm4gbmV3IE1ldGhvZFNldHRlcih0b2tlbnMubG9jLCBfcGFyc2VFeHByT3JTdHJMaXQoYmVmb3JlKSwgcGFyc2VCbG9ja0RvKGJsb2NrKSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgYmFhID0gdG9rZW5zLm9wU3BsaXRPbmNlV2hlcmUoX2lzRnVuS2V5d29yZClcblx0XHRcdGNvbnRleHQuY2hlY2soYmFhICE9PSBudWxsLCB0b2tlbnMubG9jLCAnRXhwZWN0ZWQgYSBmdW5jdGlvbiBrZXl3b3JkIHNvbWV3aGVyZS4nKVxuXHRcdFx0Y29uc3Qge2JlZm9yZSwgYXQsIGFmdGVyfSA9IGJhYVxuXHRcdFx0Y29uc3QgZnVuID0gcGFyc2VGdW4oX21ldGhvZEZ1bktpbmQoYXQpLCBhZnRlcilcblx0XHRcdHJldHVybiBuZXcgTWV0aG9kSW1wbCh0b2tlbnMubG9jLCBfcGFyc2VFeHByT3JTdHJMaXQoYmVmb3JlKSwgZnVuKVxuXHRcdH1cblx0fSxcblx0Ly8gSWYgc3ltYm9sIGlzIGp1c3QgYSBsaXRlcmFsIHN0cmluZywgc3RvcmUgaXQgYXMgYSBzdHJpbmcsIHdoaWNoIGlzIGhhbmRsZWQgc3BlY2lhbGx5LlxuXHRfcGFyc2VFeHByT3JTdHJMaXQgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGV4cHIgPSBwYXJzZUV4cHIodG9rZW5zKVxuXHRcdGNvbnN0IGlzU3RyTGl0ID0gZXhwciBpbnN0YW5jZW9mIFF1b3RlICYmXG5cdFx0XHRleHByLnBhcnRzLmxlbmd0aCA9PT0gMSAmJlxuXHRcdFx0dHlwZW9mIGV4cHIucGFydHNbMF0gPT09ICdzdHJpbmcnXG5cdFx0cmV0dXJuIGlzU3RyTGl0ID8gZXhwci5wYXJ0c1swXSA6IGV4cHJcblx0fSxcblx0X21ldGhvZEZ1bktpbmQgPSBmdW5LaW5kVG9rZW4gPT4ge1xuXHRcdHN3aXRjaCAoZnVuS2luZFRva2VuLmtpbmQpIHtcblx0XHRcdGNhc2UgS1dfRnVuOiByZXR1cm4gS1dfRnVuVGhpc1xuXHRcdFx0Y2FzZSBLV19GdW5EbzogcmV0dXJuIEtXX0Z1blRoaXNEb1xuXHRcdFx0Y2FzZSBLV19GdW5HZW46IHJldHVybiBLV19GdW5UaGlzR2VuXG5cdFx0XHRjYXNlIEtXX0Z1bkdlbkRvOiByZXR1cm4gS1dfRnVuVGhpc0dlbkRvXG5cdFx0XHRjYXNlIEtXX0Z1blRoaXM6IGNhc2UgS1dfRnVuVGhpc0RvOiBjYXNlIEtXX0Z1blRoaXNHZW46IGNhc2UgS1dfRnVuVGhpc0dlbkRvOlxuXHRcdFx0XHRjb250ZXh0LmZhaWwoZnVuS2luZFRva2VuLmxvYywgJ0Z1bmN0aW9uIGAuYCBpcyBpbXBsaWNpdCBmb3IgbWV0aG9kcy4nKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Y29udGV4dC5mYWlsKGZ1bktpbmRUb2tlbi5sb2MsIGBFeHBlY3RlZCBmdW5jdGlvbiBraW5kLCBnb3QgJHtmdW5LaW5kVG9rZW59YClcblx0XHR9XG5cdH0sXG5cdF9pc0Z1bktleXdvcmQgPSBmdW5LaW5kVG9rZW4gPT4ge1xuXHRcdGlmIChmdW5LaW5kVG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdFx0c3dpdGNoIChmdW5LaW5kVG9rZW4ua2luZCkge1xuXHRcdFx0XHRjYXNlIEtXX0Z1bjogY2FzZSBLV19GdW5EbzogY2FzZSBLV19GdW5HZW46IGNhc2UgS1dfRnVuR2VuRG86XG5cdFx0XHRcdGNhc2UgS1dfRnVuVGhpczogY2FzZSBLV19GdW5UaGlzRG86IGNhc2UgS1dfRnVuVGhpc0dlbjpcblx0XHRcdFx0Y2FzZSBLV19GdW5UaGlzR2VuRG86XG5cdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdH1cblx0XHRlbHNlXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXG5jb25zdCBwYXJzZVF1b3RlID0gdG9rZW5zID0+XG5cdG5ldyBRdW90ZSh0b2tlbnMubG9jLCB0b2tlbnMubWFwKF8gPT4gdHlwZW9mIF8gPT09ICdzdHJpbmcnID8gXyA6IHBhcnNlU2luZ2xlKF8pKSlcblxuY29uc3QgcGFyc2VXaXRoID0gdG9rZW5zID0+IHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXG5cdGNvbnN0IFt2YWwsIGRlY2xhcmVdID0gaWZFbHNlKGJlZm9yZS5vcFNwbGl0T25jZVdoZXJlKF8gPT4gaXNLZXl3b3JkKEtXX0FzLCBfKSksXG5cdFx0KHtiZWZvcmUsIGFmdGVyfSkgPT4ge1xuXHRcdFx0Y29udGV4dC5jaGVjayhhZnRlci5zaXplKCkgPT09IDEsICgpID0+IGBFeHBlY3RlZCBvbmx5IDEgdG9rZW4gYWZ0ZXIgJHtjb2RlKCdhcycpfS5gKVxuXHRcdFx0cmV0dXJuIFtwYXJzZUV4cHJQbGFpbihiZWZvcmUpLCBwYXJzZUxvY2FsRGVjbGFyZShhZnRlci5oZWFkKCkpXVxuXHRcdH0sXG5cdFx0KCkgPT4gW3BhcnNlRXhwclBsYWluKGJlZm9yZSksIG5ldyBMb2NhbERlY2xhcmVGb2N1cyh0b2tlbnMubG9jKV0pXG5cblx0cmV0dXJuIG5ldyBXaXRoKHRva2Vucy5sb2MsIGRlY2xhcmUsIHZhbCwgcGFyc2VCbG9ja0RvKGJsb2NrKSlcbn1cblxuY29uc3QgcGFyc2VJZ25vcmUgPSB0b2tlbnMgPT4ge1xuXHRjb25zdCBpZ25vcmVkID0gdG9rZW5zLm1hcChfID0+IHtcblx0XHRpZiAoaXNLZXl3b3JkKEtXX0ZvY3VzLCBfKSlcblx0XHRcdHJldHVybiAnXydcblx0XHRlbHNlIHtcblx0XHRcdGNvbnRleHQuY2hlY2soXyBpbnN0YW5jZW9mIE5hbWUsIF8ubG9jLCAoKSA9PiBgRXhwZWN0ZWQgbG9jYWwgbmFtZSwgbm90ICR7X30uYClcblx0XHRcdHJldHVybiBfLm5hbWVcblx0XHR9XG5cdH0pXG5cdHJldHVybiBuZXcgSWdub3JlKHRva2Vucy5sb2MsIGlnbm9yZWQpXG59XG5cbmNvbnN0IHBhcnNlQ29uZCA9IHRva2VucyA9PiB7XG5cdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHModG9rZW5zKVxuXHRjb250ZXh0LmNoZWNrKHBhcnRzLmxlbmd0aCA9PT0gMywgdG9rZW5zLmxvYywgKCkgPT5cblx0XHRgJHtjb2RlKCdjb25kJyl9IHRha2VzIGV4YWN0bHkgMyBhcmd1bWVudHMuYClcblx0cmV0dXJuIG5ldyBDb25kKHRva2Vucy5sb2MsIHBhcnRzWzBdLCBwYXJ0c1sxXSwgcGFydHNbMl0pXG59XG5cbmNvbnN0IHRyeVRha2VDb21tZW50ID0gbGluZXMgPT4ge1xuXHRsZXQgY29tbWVudHMgPSBbXVxuXHRsZXQgcmVzdCA9IGxpbmVzXG5cblx0d2hpbGUgKHRydWUpIHtcblx0XHRpZiAocmVzdC5pc0VtcHR5KCkpXG5cdFx0XHRicmVha1xuXG5cdFx0Y29uc3QgaHMgPSByZXN0LmhlYWRTbGljZSgpXG5cdFx0Y29uc3QgaCA9IGhzLmhlYWQoKVxuXHRcdGlmICghKGggaW5zdGFuY2VvZiBEb2NDb21tZW50KSlcblx0XHRcdGJyZWFrXG5cblx0XHRhc3NlcnQoaHMuc2l6ZSgpID09PSAxKVxuXHRcdGNvbW1lbnRzLnB1c2goaClcblx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0fVxuXG5cdHJldHVybiBbaXNFbXB0eShjb21tZW50cykgPyBudWxsIDogY29tbWVudHMubWFwKF8gPT4gXy50ZXh0KS5qb2luKCdcXG4nKSwgcmVzdF1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

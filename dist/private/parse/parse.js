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
				return new _MsAst.BlockBag(tokens.loc, opComment, lines);
			case KReturn_Map:
				return new _MsAst.BlockMap(tokens.loc, opComment, lines);
			case KReturn_Obj:
				var _tryTakeLastVal2 = _tryTakeLastVal(lines),
				    _tryTakeLastVal22 = _slicedToArray(_tryTakeLastVal2, 2),
				    doLines = _tryTakeLastVal22[0],
				    opVal = _tryTakeLastVal22[1];

				// opName written to by _tryAddName.
				return new _MsAst.BlockObj(tokens.loc, opComment, doLines, opVal, null);
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
					const block = new cls(loc, opComment, lines);
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
			checkEmpty(before, 'Can\'t make focus — is implicitly provided as first argument.');
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

	const parseSwitch = (isVal, switchedFromFun, tokens) => {
		var _beforeAndBlock5 = beforeAndBlock(tokens);

		var _beforeAndBlock52 = _slicedToArray(_beforeAndBlock5, 2);

		const before = _beforeAndBlock52[0];
		const block = _beforeAndBlock52[1];

		let switched;
		if (switchedFromFun) {
			checkEmpty(before, 'Value to switch on is `_`, the function\'s implicit argument.');
			switched = _MsAst.LocalAccess.focus(tokens.loc);
		} else switched = parseExpr(before);

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
						return parseSwitch(true, false, after);
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

		// Might be `|case` (or `|case!`, `|switch`, `|switch!`)
		if ((0, _Token.isAnyKeyword)(_funFocusKeywords, h)) {
			const isVal = h.kind === _Token.KW_CaseVal || h.kind === _Token.KW_SwitchVal;
			const isCase = h.kind === _Token.KW_CaseVal || h.kind === _Token.KW_CaseDo;
			const expr = (isCase ? parseCase : parseSwitch)(isVal, true, tokens.tail());

			const args = [new _MsAst.LocalDeclareFocus(h.loc)];
			return isVal ? {
				args, opRestArg: null, memberArgs: [], opIn: null, opOut: null,
				block: new _MsAst.BlockWithReturn(tokens.loc, null, [], expr)
			} : {
				args, opRestArg: null, memberArgs: [], opIn: null, opOut: null,
				block: new _MsAst.BlockDo(tokens.loc, null, [expr])
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
	      _funFocusKeywords = new Set([_Token.KW_CaseVal, _Token.KW_CaseDo, _Token.KW_SwitchVal, _Token.KW_SwitchDo]),
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
				return parseSwitch(false, false, rest);
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

				if (importKeywordKind !== _Token.KW_Import) context.check(opImportGlobal === null, line0.loc, 'Can\'t use global here.');
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
		return new _MsAst.ForBag(tokens.loc, _parseOpIteratee(before), block);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7OztBQytCQSxLQUFJLE9BQU8sQ0FBQTs7Ozs7Ozs7Ozs7OztrQkFZSSxDQUFDLFFBQVEsRUFBRSxTQUFTLEtBQUs7QUFDdkMsU0FBTyxHQUFHLFFBQVEsQ0FBQTtBQUNsQixRQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsZ0JBQU0sS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7O0FBRWpELFNBQU8sR0FBRyxTQUFTLENBQUE7QUFDbkIsU0FBTyxLQUFLLENBQUE7RUFDWjs7QUFFRCxPQUNDLFVBQVUsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLEtBQzVCLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDO09BQ3JELGFBQWEsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLEtBQy9CLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUM7T0FDdEQsVUFBVSxHQUFHLEtBQUssSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLEdBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFBOztBQUVyRSxPQUFNLFdBQVcsR0FBRyxNQUFNLElBQUk7Ozt3QkFFRixjQUFjLENBQUMsTUFBTSxDQUFDOzs7O1FBQTFDLFNBQVM7UUFBRSxLQUFLOzs7O3lCQUVtQixlQUFlLFFBdkNoQixXQUFXLEVBdUNtQixLQUFLLENBQUM7O1FBQTdELFNBQVMsb0JBQWxCLE9BQU87UUFBbUIsS0FBSyxvQkFBWCxJQUFJOzswQkFDOEIsZUFBZSxRQXhDOUQsU0FBUyxFQXdDaUUsS0FBSyxDQUFDOztRQUE5RSxZQUFZLHFCQUFyQixP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QixXQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2hCLE9BQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7R0FDbEI7O0FBRUQsU0FBTyxDQUFDLFVBNXZDMEIsT0FBTyxFQTR2Q3pCLFFBQVEsQ0FBQyxHQUFHLElBQUksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO0VBQzlFLENBQUEiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9wYXJzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IExvYyBmcm9tICdlc2FzdC9kaXN0L0xvYydcbmltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtBc3NlcnQsIEFzc2lnbkRlc3RydWN0dXJlLCBBc3NpZ25TaW5nbGUsIEJhZ0VudHJ5LCBCYWdFbnRyeU1hbnksIEJhZ1NpbXBsZSwgQmxvY2tCYWcsXG5cdEJsb2NrRG8sIEJsb2NrTWFwLCBCbG9ja09iaiwgQmxvY2tWYWxUaHJvdywgQmxvY2tXaXRoUmV0dXJuLCBCbG9ja1dyYXAsIEJyZWFrLCBCcmVha1dpdGhWYWwsXG5cdENhbGwsIENhc2VEbywgQ2FzZURvUGFydCwgQ2FzZVZhbCwgQ2FzZVZhbFBhcnQsIENhdGNoLCBDbGFzcywgQ2xhc3NEbywgQ29uZCwgQ29uZGl0aW9uYWxEbyxcblx0Q29uc3RydWN0b3IsIENvbmRpdGlvbmFsVmFsLCBEZWJ1ZywgSWdub3JlLCBJbXBvcnQsIEltcG9ydERvLCBJbXBvcnRHbG9iYWwsIEl0ZXJhdGVlLFxuXHROdW1iZXJMaXRlcmFsLCBFeGNlcHREbywgRXhjZXB0VmFsLCBGb3JCYWcsIEZvckRvLCBGb3JWYWwsIEZ1biwgTF9BbmQsIExfT3IsIExhenksIExEX0NvbnN0LFxuXHRMRF9MYXp5LCBMRF9NdXRhYmxlLCBMb2NhbEFjY2VzcywgTG9jYWxEZWNsYXJlLCBMb2NhbERlY2xhcmVGb2N1cywgTG9jYWxEZWNsYXJlTmFtZSxcblx0TG9jYWxEZWNsYXJlUmVzLCBMb2NhbERlY2xhcmVUaGlzLCBMb2NhbE11dGF0ZSwgTG9naWMsIE1hcEVudHJ5LCBNZW1iZXIsIE1lbWJlclNldCxcblx0TWV0aG9kR2V0dGVyLCBNZXRob2RJbXBsLCBNZXRob2RTZXR0ZXIsIE1vZHVsZSwgTW9kdWxlRXhwb3J0RGVmYXVsdCwgTW9kdWxlRXhwb3J0TmFtZWQsXG5cdE1TX011dGF0ZSwgTVNfTmV3LCBNU19OZXdNdXRhYmxlLCBOZXcsIE5vdCwgT2JqRW50cnksIE9iakVudHJ5QXNzaWduLCBPYmpFbnRyeUNvbXB1dGVkLFxuXHRPYmpQYWlyLCBPYmpTaW1wbGUsIFBhdHRlcm4sIFF1b3RlLCBRdW90ZVRlbXBsYXRlLCBTRF9EZWJ1Z2dlciwgU3BlY2lhbERvLCBTcGVjaWFsVmFsLCBTVl9OYW1lLFxuXHRTVl9OdWxsLCBTcGxhdCwgU3VwZXJDYWxsLCBTdXBlckNhbGxEbywgU3VwZXJNZW1iZXIsIFN3aXRjaERvLCBTd2l0Y2hEb1BhcnQsIFN3aXRjaFZhbCxcblx0U3dpdGNoVmFsUGFydCwgVGhyb3csIFZhbCwgV2l0aCwgWWllbGQsIFlpZWxkVG99IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtEb2NDb21tZW50LCBEb3ROYW1lLCBHcm91cCwgR19CbG9jaywgR19CcmFja2V0LCBHX1BhcmVudGhlc2lzLCBHX1NwYWNlLCBHX1F1b3RlLCBpc0dyb3VwLFxuXHRpc0FueUtleXdvcmQsIGlzS2V5d29yZCwgS2V5d29yZCwgS1dfQW5kLCBLV19BcywgS1dfQXNzZXJ0LCBLV19Bc3NlcnROb3QsIEtXX0Fzc2lnbixcblx0S1dfQXNzaWduTXV0YWJsZSwgS1dfQnJlYWssIEtXX0JyZWFrV2l0aFZhbCwgS1dfQ2FzZVZhbCwgS1dfQ2FzZURvLCBLV19Db25kLCBLV19DYXRjaERvLFxuXHRLV19DYXRjaFZhbCwgS1dfQ2xhc3MsIEtXX0NvbnN0cnVjdCwgS1dfRGVidWcsIEtXX0RlYnVnZ2VyLCBLV19EbywgS1dfRWxsaXBzaXMsIEtXX0Vsc2UsXG5cdEtXX0V4Y2VwdERvLCBLV19FeGNlcHRWYWwsIEtXX0ZpbmFsbHksIEtXX0ZvckJhZywgS1dfRm9yRG8sIEtXX0ZvclZhbCwgS1dfRm9jdXMsIEtXX0Z1bixcblx0S1dfRnVuRG8sIEtXX0Z1bkdlbiwgS1dfRnVuR2VuRG8sIEtXX0Z1blRoaXMsIEtXX0Z1blRoaXNEbywgS1dfRnVuVGhpc0dlbiwgS1dfRnVuVGhpc0dlbkRvLFxuXHRLV19HZXQsIEtXX0lmRG8sIEtXX0lmVmFsLCBLV19JZ25vcmUsIEtXX0luLCBLV19MYXp5LCBLV19Mb2NhbE11dGF0ZSwgS1dfTWFwRW50cnksIEtXX05hbWUsXG5cdEtXX05ldywgS1dfTm90LCBLV19PYmpBc3NpZ24sIEtXX09yLCBLV19QYXNzLCBLV19PdXQsIEtXX1JlZ2lvbiwgS1dfU2V0LCBLV19TdGF0aWMsIEtXX1N1cGVyRG8sXG5cdEtXX1N1cGVyVmFsLCBLV19Td2l0Y2hEbywgS1dfU3dpdGNoVmFsLCBLV19UaHJvdywgS1dfVHJ5RG8sIEtXX1RyeVZhbCwgS1dfVHlwZSwgS1dfVW5sZXNzRG8sXG5cdEtXX1VubGVzc1ZhbCwgS1dfSW1wb3J0LCBLV19JbXBvcnREZWJ1ZywgS1dfSW1wb3J0RG8sIEtXX0ltcG9ydExhenksIEtXX1dpdGgsIEtXX1lpZWxkLFxuXHRLV19ZaWVsZFRvLCBOYW1lLCBrZXl3b3JkTmFtZSwgb3BLZXl3b3JkS2luZFRvU3BlY2lhbFZhbHVlS2luZH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2Fzc2VydCwgY2F0LCBoZWFkLCBpZkVsc2UsIGlzRW1wdHksIGxhc3QsIG9wSWYsIG9wTWFwLCByZXBlYXQsIHJ0YWlsLCB0YWlsfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8vIFNpbmNlIHRoZXJlIGFyZSBzbyBtYW55IHBhcnNpbmcgZnVuY3Rpb25zLFxuLy8gaXQncyBmYXN0ZXIgKGFzIG9mIG5vZGUgdjAuMTEuMTQpIHRvIGhhdmUgdGhlbSBhbGwgY2xvc2Ugb3ZlciB0aGlzIG11dGFibGUgdmFyaWFibGUgb25jZVxuLy8gdGhhbiB0byBjbG9zZSBvdmVyIHRoZSBwYXJhbWV0ZXIgKGFzIGluIGxleC5qcywgd2hlcmUgdGhhdCdzIG11Y2ggZmFzdGVyKS5cbmxldCBjb250ZXh0XG5cbi8qXG5UaGlzIGNvbnZlcnRzIGEgVG9rZW4gdHJlZSB0byBhIE1zQXN0LlxuVGhpcyBpcyBhIHJlY3Vyc2l2ZS1kZXNjZW50IHBhcnNlciwgbWFkZSBlYXNpZXIgYnkgdHdvIGZhY3RzOlxuXHQqIFdlIGhhdmUgYWxyZWFkeSBncm91cGVkIHRva2Vucy5cblx0KiBNb3N0IG9mIHRoZSB0aW1lLCBhbiBhc3QncyB0eXBlIGlzIGRldGVybWluZWQgYnkgdGhlIGZpcnN0IHRva2VuLlxuXG5UaGVyZSBhcmUgZXhjZXB0aW9ucyBzdWNoIGFzIGFzc2lnbm1lbnQgc3RhdGVtZW50cyAoaW5kaWNhdGVkIGJ5IGEgYD1gIHNvbWV3aGVyZSBpbiB0aGUgbWlkZGxlKS5cbkZvciB0aG9zZSB3ZSBtdXN0IGl0ZXJhdGUgdGhyb3VnaCB0b2tlbnMgYW5kIHNwbGl0LlxuKFNlZSBTbGljZS5vcFNwbGl0T25jZVdoZXJlIGFuZCBTbGljZS5vcFNwbGl0TWFueVdoZXJlLilcbiovXG5leHBvcnQgZGVmYXVsdCAoX2NvbnRleHQsIHJvb3RUb2tlbikgPT4ge1xuXHRjb250ZXh0ID0gX2NvbnRleHRcblx0Y29uc3QgbXNBc3QgPSBwYXJzZU1vZHVsZShTbGljZS5ncm91cChyb290VG9rZW4pKVxuXHQvLyBSZWxlYXNlIGZvciBnYXJiYWdlIGNvbGxlY3Rpb25zLlxuXHRjb250ZXh0ID0gdW5kZWZpbmVkXG5cdHJldHVybiBtc0FzdFxufVxuXG5jb25zdFxuXHRjaGVja0VtcHR5ID0gKHRva2VucywgbWVzc2FnZSkgPT5cblx0XHRjb250ZXh0LmNoZWNrKHRva2Vucy5pc0VtcHR5KCksIHRva2Vucy5sb2MsIG1lc3NhZ2UpLFxuXHRjaGVja05vbkVtcHR5ID0gKHRva2VucywgbWVzc2FnZSkgPT5cblx0XHRjb250ZXh0LmNoZWNrKCF0b2tlbnMuaXNFbXB0eSgpLCB0b2tlbnMubG9jLCBtZXNzYWdlKSxcblx0dW5leHBlY3RlZCA9IHRva2VuID0+IGNvbnRleHQuZmFpbCh0b2tlbi5sb2MsIGBVbmV4cGVjdGVkICR7dG9rZW59YClcblxuY29uc3QgcGFyc2VNb2R1bGUgPSB0b2tlbnMgPT4ge1xuXHQvLyBNb2R1bGUgZG9jIGNvbW1lbnQgbXVzdCBjb21lIGZpcnN0LlxuXHRjb25zdCBbb3BDb21tZW50LCByZXN0MF0gPSB0cnlUYWtlQ29tbWVudCh0b2tlbnMpXG5cdC8vIEltcG9ydCBzdGF0ZW1lbnRzIG11c3QgYXBwZWFyIGluIG9yZGVyLlxuXHRjb25zdCB7aW1wb3J0czogZG9JbXBvcnRzLCByZXN0OiByZXN0MX0gPSB0cnlQYXJzZUltcG9ydHMoS1dfSW1wb3J0RG8sIHJlc3QwKVxuXHRjb25zdCB7aW1wb3J0czogcGxhaW5JbXBvcnRzLCBvcEltcG9ydEdsb2JhbCwgcmVzdDogcmVzdDJ9ID0gdHJ5UGFyc2VJbXBvcnRzKEtXX0ltcG9ydCwgcmVzdDEpXG5cdGNvbnN0IHtpbXBvcnRzOiBsYXp5SW1wb3J0cywgcmVzdDogcmVzdDN9ID0gdHJ5UGFyc2VJbXBvcnRzKEtXX0ltcG9ydExhenksIHJlc3QyKVxuXHRjb25zdCB7aW1wb3J0czogZGVidWdJbXBvcnRzLCByZXN0OiByZXN0NH0gPSB0cnlQYXJzZUltcG9ydHMoS1dfSW1wb3J0RGVidWcsIHJlc3QzKVxuXG5cdGNvbnN0IGxpbmVzID0gcGFyc2VNb2R1bGVCbG9jayhyZXN0NClcblxuXHRpZiAoY29udGV4dC5vcHRzLmluY2x1ZGVNb2R1bGVOYW1lKCkpIHtcblx0XHRjb25zdCBuYW1lID0gbmV3IExvY2FsRGVjbGFyZU5hbWUodG9rZW5zLmxvYylcblx0XHRjb25zdCBhc3NpZ24gPSBuZXcgQXNzaWduU2luZ2xlKHRva2Vucy5sb2MsIG5hbWUsXG5cdFx0XHRRdW90ZS5mb3JTdHJpbmcodG9rZW5zLmxvYywgY29udGV4dC5vcHRzLm1vZHVsZU5hbWUoKSkpXG5cdFx0bGluZXMucHVzaChuZXcgTW9kdWxlRXhwb3J0TmFtZWQodG9rZW5zLmxvYywgYXNzaWduKSlcblx0fVxuXG5cdGNvbnN0IGltcG9ydHMgPSBwbGFpbkltcG9ydHMuY29uY2F0KGxhenlJbXBvcnRzKVxuXHRyZXR1cm4gbmV3IE1vZHVsZShcblx0XHR0b2tlbnMubG9jLCBvcENvbW1lbnQsIGRvSW1wb3J0cywgaW1wb3J0cywgb3BJbXBvcnRHbG9iYWwsIGRlYnVnSW1wb3J0cywgbGluZXMpXG59XG5cbi8vIHBhcnNlQmxvY2tcbmNvbnN0XG5cdC8vIFRva2VucyBvbiB0aGUgbGluZSBiZWZvcmUgYSBibG9jaywgYW5kIHRva2VucyBmb3IgdGhlIGJsb2NrIGl0c2VsZi5cblx0YmVmb3JlQW5kQmxvY2sgPSB0b2tlbnMgPT4ge1xuXHRcdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAnRXhwZWN0ZWQgYW4gaW5kZW50ZWQgYmxvY2suJylcblx0XHRjb25zdCBibG9jayA9IHRva2Vucy5sYXN0KClcblx0XHRjb250ZXh0LmNoZWNrKGlzR3JvdXAoR19CbG9jaywgYmxvY2spLCBibG9jay5sb2MsICdFeHBlY3RlZCBhbiBpbmRlbnRlZCBibG9jay4nKVxuXHRcdHJldHVybiBbdG9rZW5zLnJ0YWlsKCksIFNsaWNlLmdyb3VwKGJsb2NrKV1cblx0fSxcblxuXHRibG9ja1dyYXAgPSB0b2tlbnMgPT4gbmV3IEJsb2NrV3JhcCh0b2tlbnMubG9jLCBwYXJzZUJsb2NrVmFsKHRva2VucykpLFxuXG5cdGp1c3RCbG9jayA9IChrZXl3b3JkLCB0b2tlbnMpID0+IHtcblx0XHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdFx0Y2hlY2tFbXB0eShiZWZvcmUsICgpID0+XG5cdFx0XHRgRGlkIG5vdCBleHBlY3QgYW55dGhpbmcgYmV0d2VlbiAke2NvZGUoa2V5d29yZE5hbWUoa2V5d29yZCkpfSBhbmQgYmxvY2suYClcblx0XHRyZXR1cm4gYmxvY2tcblx0fSxcblx0anVzdEJsb2NrRG8gPSAoa2V5d29yZCwgdG9rZW5zKSA9PlxuXHRcdHBhcnNlQmxvY2tEbyhqdXN0QmxvY2soa2V5d29yZCwgdG9rZW5zKSksXG5cdGp1c3RCbG9ja1ZhbCA9IChrZXl3b3JkLCB0b2tlbnMpID0+XG5cdFx0cGFyc2VCbG9ja1ZhbChqdXN0QmxvY2soa2V5d29yZCwgdG9rZW5zKSksXG5cblx0Ly8gR2V0cyBsaW5lcyBpbiBhIHJlZ2lvbiBvciBEZWJ1Zy5cblx0cGFyc2VMaW5lc0Zyb21CbG9jayA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKClcblx0XHRjb250ZXh0LmNoZWNrKHRva2Vucy5zaXplKCkgPiAxICYmIHRva2Vucy5zaXplKCkgPT09IDIgJiYgaXNHcm91cChHX0Jsb2NrLCB0b2tlbnMuc2Vjb25kKCkpLFxuXHRcdFx0aC5sb2MsICgpID0+XG5cdFx0XHRgRXhwZWN0ZWQgaW5kZW50ZWQgYmxvY2sgYWZ0ZXIgJHtofSwgYW5kIG5vdGhpbmcgZWxzZS5gKVxuXHRcdGNvbnN0IGJsb2NrID0gdG9rZW5zLnNlY29uZCgpXG5cblx0XHRjb25zdCBsaW5lcyA9IFtdXG5cdFx0Zm9yIChjb25zdCBsaW5lIG9mIFNsaWNlLmdyb3VwKGJsb2NrKS5zbGljZXMoKSlcblx0XHRcdGxpbmVzLnB1c2goLi4ucGFyc2VMaW5lT3JMaW5lcyhsaW5lKSlcblx0XHRyZXR1cm4gbGluZXNcblx0fSxcblxuXHRwYXJzZUJsb2NrRG8gPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IFtvcENvbW1lbnQsIHJlc3RdID0gdHJ5VGFrZUNvbW1lbnQodG9rZW5zKVxuXHRcdGNvbnN0IGxpbmVzID0gX3BsYWluQmxvY2tMaW5lcyhyZXN0KVxuXHRcdHJldHVybiBuZXcgQmxvY2tEbyh0b2tlbnMubG9jLCBvcENvbW1lbnQsIGxpbmVzKVxuXHR9LFxuXG5cdHBhcnNlQmxvY2tWYWwgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IFtvcENvbW1lbnQsIHJlc3RdID0gdHJ5VGFrZUNvbW1lbnQodG9rZW5zKVxuXHRcdGNvbnN0IHtsaW5lcywga1JldHVybn0gPSBfcGFyc2VCbG9ja0xpbmVzKHJlc3QpXG5cdFx0c3dpdGNoIChrUmV0dXJuKSB7XG5cdFx0XHRjYXNlIEtSZXR1cm5fQmFnOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEJsb2NrQmFnKHRva2Vucy5sb2MsIG9wQ29tbWVudCwgbGluZXMpXG5cdFx0XHRjYXNlIEtSZXR1cm5fTWFwOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEJsb2NrTWFwKHRva2Vucy5sb2MsIG9wQ29tbWVudCwgbGluZXMpXG5cdFx0XHRjYXNlIEtSZXR1cm5fT2JqOlxuXHRcdFx0XHRjb25zdCBbZG9MaW5lcywgb3BWYWxdID0gX3RyeVRha2VMYXN0VmFsKGxpbmVzKVxuXHRcdFx0XHQvLyBvcE5hbWUgd3JpdHRlbiB0byBieSBfdHJ5QWRkTmFtZS5cblx0XHRcdFx0cmV0dXJuIG5ldyBCbG9ja09iaih0b2tlbnMubG9jLCBvcENvbW1lbnQsIGRvTGluZXMsIG9wVmFsLCBudWxsKVxuXHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHRjb250ZXh0LmNoZWNrKCFpc0VtcHR5KGxpbmVzKSwgdG9rZW5zLmxvYywgJ1ZhbHVlIGJsb2NrIG11c3QgZW5kIGluIGEgdmFsdWUuJylcblx0XHRcdFx0Y29uc3QgdmFsID0gbGFzdChsaW5lcylcblx0XHRcdFx0aWYgKHZhbCBpbnN0YW5jZW9mIFRocm93KVxuXHRcdFx0XHRcdHJldHVybiBuZXcgQmxvY2tWYWxUaHJvdyh0b2tlbnMubG9jLCBvcENvbW1lbnQsIHJ0YWlsKGxpbmVzKSwgdmFsKVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKHZhbCBpbnN0YW5jZW9mIFZhbCwgdmFsLmxvYywgJ1ZhbHVlIGJsb2NrIG11c3QgZW5kIGluIGEgdmFsdWUuJylcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEJsb2NrV2l0aFJldHVybih0b2tlbnMubG9jLCBvcENvbW1lbnQsIHJ0YWlsKGxpbmVzKSwgdmFsKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdHBhcnNlTW9kdWxlQmxvY2sgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IHtsaW5lcywga1JldHVybn0gPSBfcGFyc2VCbG9ja0xpbmVzKHRva2VucywgdHJ1ZSlcblx0XHRjb25zdCBvcENvbW1lbnQgPSBudWxsXG5cdFx0Y29uc3QgbG9jID0gdG9rZW5zLmxvY1xuXHRcdHN3aXRjaCAoa1JldHVybikge1xuXHRcdFx0Y2FzZSBLUmV0dXJuX0JhZzogY2FzZSBLUmV0dXJuX01hcDoge1xuXHRcdFx0XHRjb25zdCBjbHMgPSBrUmV0dXJuID09PSBLUmV0dXJuX0JhZyA/IEJsb2NrQmFnIDogQmxvY2tNYXBcblx0XHRcdFx0Y29uc3QgYmxvY2sgPSBuZXcgY2xzKGxvYywgb3BDb21tZW50LCBsaW5lcylcblx0XHRcdFx0Y29uc3QgdmFsID0gbmV3IEJsb2NrV3JhcChsb2MsIGJsb2NrKVxuXHRcdFx0XHRjb25zdCBhc3NpZ25lZSA9IExvY2FsRGVjbGFyZS5wbGFpbihsb2MsIGNvbnRleHQub3B0cy5tb2R1bGVOYW1lKCkpXG5cdFx0XHRcdGNvbnN0IGFzc2lnbiA9IG5ldyBBc3NpZ25TaW5nbGUobG9jLCBhc3NpZ25lZSwgdmFsKVxuXHRcdFx0XHRyZXR1cm4gW25ldyBNb2R1bGVFeHBvcnREZWZhdWx0KGxvYywgYXNzaWduKV1cblx0XHRcdH1cblx0XHRcdGNhc2UgS1JldHVybl9PYmo6IHtcblx0XHRcdFx0Y29uc3QgbW9kdWxlTmFtZSA9IGNvbnRleHQub3B0cy5tb2R1bGVOYW1lKClcblxuXHRcdFx0XHQvLyBNb2R1bGUgZXhwb3J0cyBsb29rIGxpa2UgYSBCbG9ja09iaiwgIGJ1dCBhcmUgcmVhbGx5IGRpZmZlcmVudC5cblx0XHRcdFx0Ly8gSW4gRVM2LCBtb2R1bGUgZXhwb3J0cyBtdXN0IGJlIGNvbXBsZXRlbHkgc3RhdGljLlxuXHRcdFx0XHQvLyBTbyB3ZSBrZWVwIGFuIGFycmF5IG9mIGV4cG9ydHMgYXR0YWNoZWQgZGlyZWN0bHkgdG8gdGhlIE1vZHVsZSBhc3QuXG5cdFx0XHRcdC8vIElmIHlvdSB3cml0ZTpcblx0XHRcdFx0Ly9cdGlmISBjb25kXG5cdFx0XHRcdC8vXHRcdGEuIGJcblx0XHRcdFx0Ly8gaW4gYSBtb2R1bGUgY29udGV4dCwgaXQgd2lsbCBiZSBhbiBlcnJvci4gKFRoZSBtb2R1bGUgY3JlYXRlcyBubyBgYnVpbHRgIGxvY2FsLilcblx0XHRcdFx0Y29uc3QgY29udmVydFRvRXhwb3J0cyA9IGxpbmUgPT4ge1xuXHRcdFx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgT2JqRW50cnkpIHtcblx0XHRcdFx0XHRcdGNvbnRleHQuY2hlY2sobGluZSBpbnN0YW5jZW9mIE9iakVudHJ5QXNzaWduLCBsaW5lLmxvYyxcblx0XHRcdFx0XHRcdFx0J01vZHVsZSBleHBvcnRzIGNhbiBub3QgYmUgY29tcHV0ZWQuJylcblx0XHRcdFx0XHRcdGNvbnRleHQuY2hlY2sobGluZS5hc3NpZ24gaW5zdGFuY2VvZiBBc3NpZ25TaW5nbGUsIGxpbmUubG9jLFxuXHRcdFx0XHRcdFx0XHQnRXhwb3J0IEFzc2lnbkRlc3RydWN0dXJlIG5vdCB5ZXQgc3VwcG9ydGVkLicpXG5cdFx0XHRcdFx0XHRyZXR1cm4gbGluZS5hc3NpZ24uYXNzaWduZWUubmFtZSA9PT0gbW9kdWxlTmFtZSA/XG5cdFx0XHRcdFx0XHRcdG5ldyBNb2R1bGVFeHBvcnREZWZhdWx0KGxpbmUubG9jLCBsaW5lLmFzc2lnbikgOlxuXHRcdFx0XHRcdFx0XHRuZXcgTW9kdWxlRXhwb3J0TmFtZWQobGluZS5sb2MsIGxpbmUuYXNzaWduKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIERlYnVnKVxuXHRcdFx0XHRcdFx0bGluZS5saW5lcyA9IGxpbmUubGluZXMubWFwKGNvbnZlcnRUb0V4cG9ydHMpXG5cdFx0XHRcdFx0cmV0dXJuIGxpbmVcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBsaW5lcy5tYXAoY29udmVydFRvRXhwb3J0cylcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0Y29uc3QgW21vZHVsZUxpbmVzLCBvcERlZmF1bHRFeHBvcnRdID0gX3RyeVRha2VMYXN0VmFsKGxpbmVzKVxuXHRcdFx0XHRpZiAob3BEZWZhdWx0RXhwb3J0ICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0Y29uc3QgXyA9IG9wRGVmYXVsdEV4cG9ydFxuXHRcdFx0XHRcdG1vZHVsZUxpbmVzLnB1c2gobmV3IE1vZHVsZUV4cG9ydERlZmF1bHQoXy5sb2MsXG5cdFx0XHRcdFx0XHRuZXcgQXNzaWduU2luZ2xlKF8ubG9jLFxuXHRcdFx0XHRcdFx0XHRMb2NhbERlY2xhcmUucGxhaW4ob3BEZWZhdWx0RXhwb3J0LmxvYywgY29udGV4dC5vcHRzLm1vZHVsZU5hbWUoKSksXG5cdFx0XHRcdFx0XHRcdF8pKSlcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gbW9kdWxlTGluZXNcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuLy8gcGFyc2VCbG9jayBwcml2YXRlc1xuY29uc3Rcblx0X3RyeVRha2VMYXN0VmFsID0gbGluZXMgPT5cblx0XHQhaXNFbXB0eShsaW5lcykgJiYgbGFzdChsaW5lcykgaW5zdGFuY2VvZiBWYWwgP1xuXHRcdFx0W3J0YWlsKGxpbmVzKSwgbGFzdChsaW5lcyldIDpcblx0XHRcdFtsaW5lcywgbnVsbF0sXG5cblx0X3BsYWluQmxvY2tMaW5lcyA9IGxpbmVUb2tlbnMgPT4ge1xuXHRcdGNvbnN0IGxpbmVzID0gW11cblx0XHRjb25zdCBhZGRMaW5lID0gbGluZSA9PiB7XG5cdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIEFycmF5KVxuXHRcdFx0XHRmb3IgKGNvbnN0IF8gb2YgbGluZSlcblx0XHRcdFx0XHRhZGRMaW5lKF8pXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGxpbmVzLnB1c2gobGluZSlcblx0XHR9XG5cdFx0Zm9yIChjb25zdCBfIG9mIGxpbmVUb2tlbnMuc2xpY2VzKCkpXG5cdFx0XHRhZGRMaW5lKHBhcnNlTGluZShfKSlcblx0XHRyZXR1cm4gbGluZXNcblx0fSxcblxuXHRLUmV0dXJuX1BsYWluID0gMCxcblx0S1JldHVybl9PYmogPSAxLFxuXHRLUmV0dXJuX0JhZyA9IDIsXG5cdEtSZXR1cm5fTWFwID0gMyxcblx0X3BhcnNlQmxvY2tMaW5lcyA9IGxpbmVUb2tlbnMgPT4ge1xuXHRcdGxldCBpc0JhZyA9IGZhbHNlLCBpc01hcCA9IGZhbHNlLCBpc09iaiA9IGZhbHNlXG5cdFx0Y29uc3QgY2hlY2tMaW5lID0gbGluZSA9PiB7XG5cdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIERlYnVnKVxuXHRcdFx0XHRmb3IgKGNvbnN0IF8gb2YgbGluZS5saW5lcylcblx0XHRcdFx0XHRjaGVja0xpbmUoXylcblx0XHRcdGVsc2UgaWYgKGxpbmUgaW5zdGFuY2VvZiBCYWdFbnRyeSlcblx0XHRcdFx0aXNCYWcgPSB0cnVlXG5cdFx0XHRlbHNlIGlmIChsaW5lIGluc3RhbmNlb2YgTWFwRW50cnkpXG5cdFx0XHRcdGlzTWFwID0gdHJ1ZVxuXHRcdFx0ZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIE9iakVudHJ5KVxuXHRcdFx0XHRpc09iaiA9IHRydWVcblx0XHR9XG5cdFx0Y29uc3QgbGluZXMgPSBfcGxhaW5CbG9ja0xpbmVzKGxpbmVUb2tlbnMpXG5cdFx0Zm9yIChjb25zdCBfIG9mIGxpbmVzKVxuXHRcdFx0Y2hlY2tMaW5lKF8pXG5cblx0XHRjb250ZXh0LmNoZWNrKCEoaXNPYmogJiYgaXNCYWcpLCBsaW5lcy5sb2MsICdCbG9jayBoYXMgYm90aCBCYWcgYW5kIE9iaiBsaW5lcy4nKVxuXHRcdGNvbnRleHQuY2hlY2soIShpc09iaiAmJiBpc01hcCksIGxpbmVzLmxvYywgJ0Jsb2NrIGhhcyBib3RoIE9iaiBhbmQgTWFwIGxpbmVzLicpXG5cdFx0Y29udGV4dC5jaGVjayghKGlzQmFnICYmIGlzTWFwKSwgbGluZXMubG9jLCAnQmxvY2sgaGFzIGJvdGggQmFnIGFuZCBNYXAgbGluZXMuJylcblxuXHRcdGNvbnN0IGtSZXR1cm4gPVxuXHRcdFx0aXNPYmogPyBLUmV0dXJuX09iaiA6IGlzQmFnID8gS1JldHVybl9CYWcgOiBpc01hcCA/IEtSZXR1cm5fTWFwIDogS1JldHVybl9QbGFpblxuXHRcdHJldHVybiB7bGluZXMsIGtSZXR1cm59XG5cdH1cblxuY29uc3QgcGFyc2VDYXNlID0gKGlzVmFsLCBjYXNlZEZyb21GdW4sIHRva2VucykgPT4ge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cblx0bGV0IG9wQ2FzZWRcblx0aWYgKGNhc2VkRnJvbUZ1bikge1xuXHRcdGNoZWNrRW1wdHkoYmVmb3JlLCAnQ2FuXFwndCBtYWtlIGZvY3VzIOKAlCBpcyBpbXBsaWNpdGx5IHByb3ZpZGVkIGFzIGZpcnN0IGFyZ3VtZW50LicpXG5cdFx0b3BDYXNlZCA9IG51bGxcblx0fSBlbHNlXG5cdFx0b3BDYXNlZCA9IG9wSWYoIWJlZm9yZS5pc0VtcHR5KCksICgpID0+IEFzc2lnblNpbmdsZS5mb2N1cyhiZWZvcmUubG9jLCBwYXJzZUV4cHIoYmVmb3JlKSkpXG5cblx0Y29uc3QgbGFzdExpbmUgPSBTbGljZS5ncm91cChibG9jay5sYXN0KCkpXG5cdGNvbnN0IFtwYXJ0TGluZXMsIG9wRWxzZV0gPSBpc0tleXdvcmQoS1dfRWxzZSwgbGFzdExpbmUuaGVhZCgpKSA/XG5cdFx0W2Jsb2NrLnJ0YWlsKCksIChpc1ZhbCA/IGp1c3RCbG9ja1ZhbCA6IGp1c3RCbG9ja0RvKShLV19FbHNlLCBsYXN0TGluZS50YWlsKCkpXSA6XG5cdFx0W2Jsb2NrLCBudWxsXVxuXG5cdGNvbnN0IHBhcnRzID0gcGFydExpbmVzLm1hcFNsaWNlcyhfcGFyc2VDYXNlTGluZShpc1ZhbCkpXG5cdGNvbnRleHQuY2hlY2socGFydHMubGVuZ3RoID4gMCwgdG9rZW5zLmxvYywgKCkgPT5cblx0XHRgTXVzdCBoYXZlIGF0IGxlYXN0IDEgbm9uLSR7Y29kZSgnZWxzZScpfSB0ZXN0LmApXG5cblx0cmV0dXJuIG5ldyAoaXNWYWwgPyBDYXNlVmFsIDogQ2FzZURvKSh0b2tlbnMubG9jLCBvcENhc2VkLCBwYXJ0cywgb3BFbHNlKVxufVxuLy8gcGFyc2VDYXNlIHByaXZhdGVzXG5jb25zdFxuXHRfcGFyc2VDYXNlTGluZSA9IGlzVmFsID0+IGxpbmUgPT4ge1xuXHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKGxpbmUpXG5cdFx0Y29uc3QgdGVzdCA9IF9wYXJzZUNhc2VUZXN0KGJlZm9yZSlcblx0XHRjb25zdCByZXN1bHQgPSAoaXNWYWwgPyBwYXJzZUJsb2NrVmFsIDogcGFyc2VCbG9ja0RvKShibG9jaylcblx0XHRyZXR1cm4gbmV3IChpc1ZhbCA/IENhc2VWYWxQYXJ0IDogQ2FzZURvUGFydCkobGluZS5sb2MsIHRlc3QsIHJlc3VsdClcblx0fSxcblx0X3BhcnNlQ2FzZVRlc3QgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGZpcnN0ID0gdG9rZW5zLmhlYWQoKVxuXHRcdC8vIFBhdHRlcm4gbWF0Y2ggc3RhcnRzIHdpdGggdHlwZSB0ZXN0IGFuZCBpcyBmb2xsb3dlZCBieSBsb2NhbCBkZWNsYXJlcy5cblx0XHQvLyBFLmcuLCBgOlNvbWUgdmFsYFxuXHRcdGlmIChpc0dyb3VwKEdfU3BhY2UsIGZpcnN0KSAmJiB0b2tlbnMuc2l6ZSgpID4gMSkge1xuXHRcdFx0Y29uc3QgZnQgPSBTbGljZS5ncm91cChmaXJzdClcblx0XHRcdGlmIChpc0tleXdvcmQoS1dfVHlwZSwgZnQuaGVhZCgpKSkge1xuXHRcdFx0XHRjb25zdCB0eXBlID0gcGFyc2VTcGFjZWQoZnQudGFpbCgpKVxuXHRcdFx0XHRjb25zdCBsb2NhbHMgPSBwYXJzZUxvY2FsRGVjbGFyZXModG9rZW5zLnRhaWwoKSlcblx0XHRcdFx0cmV0dXJuIG5ldyBQYXR0ZXJuKGZpcnN0LmxvYywgdHlwZSwgbG9jYWxzLCBMb2NhbEFjY2Vzcy5mb2N1cyh0b2tlbnMubG9jKSlcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHBhcnNlRXhwcih0b2tlbnMpXG5cdH1cblxuY29uc3QgcGFyc2VTd2l0Y2ggPSAoaXNWYWwsIHN3aXRjaGVkRnJvbUZ1biwgdG9rZW5zKSA9PiB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2VucylcblxuXHRsZXQgc3dpdGNoZWRcblx0aWYgKHN3aXRjaGVkRnJvbUZ1bikge1xuXHRcdGNoZWNrRW1wdHkoYmVmb3JlLCAnVmFsdWUgdG8gc3dpdGNoIG9uIGlzIGBfYCwgdGhlIGZ1bmN0aW9uXFwncyBpbXBsaWNpdCBhcmd1bWVudC4nKVxuXHRcdHN3aXRjaGVkID0gTG9jYWxBY2Nlc3MuZm9jdXModG9rZW5zLmxvYylcblx0fSBlbHNlXG5cdFx0c3dpdGNoZWQgPSBwYXJzZUV4cHIoYmVmb3JlKVxuXG5cdGNvbnN0IGxhc3RMaW5lID0gU2xpY2UuZ3JvdXAoYmxvY2subGFzdCgpKVxuXHRjb25zdCBbcGFydExpbmVzLCBvcEVsc2VdID0gaXNLZXl3b3JkKEtXX0Vsc2UsIGxhc3RMaW5lLmhlYWQoKSkgP1xuXHRcdFtibG9jay5ydGFpbCgpLCAoaXNWYWwgPyBqdXN0QmxvY2tWYWwgOiBqdXN0QmxvY2tEbykoS1dfRWxzZSwgbGFzdExpbmUudGFpbCgpKV0gOlxuXHRcdFtibG9jaywgbnVsbF1cblxuXHRjb25zdCBwYXJ0cyA9IHBhcnRMaW5lcy5tYXBTbGljZXMoX3BhcnNlU3dpdGNoTGluZShpc1ZhbCkpXG5cdGNvbnRleHQuY2hlY2socGFydHMubGVuZ3RoID4gMCwgdG9rZW5zLmxvYywgKCkgPT5cblx0XHRgTXVzdCBoYXZlIGF0IGxlYXN0IDEgbm9uLSR7Y29kZSgnZWxzZScpfSB0ZXN0LmApXG5cblx0cmV0dXJuIG5ldyAoaXNWYWwgPyBTd2l0Y2hWYWwgOiBTd2l0Y2hEbykodG9rZW5zLmxvYywgc3dpdGNoZWQsIHBhcnRzLCBvcEVsc2UpXG59XG5jb25zdFxuXHRfcGFyc2VTd2l0Y2hMaW5lID0gaXNWYWwgPT4gbGluZSA9PiB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sobGluZSlcblxuXHRcdGxldCB2YWx1ZXNcblx0XHRpZiAoaXNLZXl3b3JkKEtXX09yLCBiZWZvcmUuaGVhZCgpKSlcblx0XHRcdHZhbHVlcyA9IGJlZm9yZS50YWlsKCkubWFwKHBhcnNlU2luZ2xlKVxuXHRcdGVsc2Vcblx0XHRcdHZhbHVlcyA9IFtwYXJzZUV4cHIoYmVmb3JlKV1cblxuXHRcdGNvbnN0IHJlc3VsdCA9IChpc1ZhbCA/IHBhcnNlQmxvY2tWYWwgOiBwYXJzZUJsb2NrRG8pKGJsb2NrKVxuXHRcdHJldHVybiBuZXcgKGlzVmFsID8gU3dpdGNoVmFsUGFydCA6IFN3aXRjaERvUGFydCkobGluZS5sb2MsIHZhbHVlcywgcmVzdWx0KVxuXHR9XG5cbmNvbnN0XG5cdHBhcnNlRXhwciA9IHRva2VucyA9PiB7XG5cdFx0cmV0dXJuIGlmRWxzZSh0b2tlbnMub3BTcGxpdE1hbnlXaGVyZShfID0+IGlzS2V5d29yZChLV19PYmpBc3NpZ24sIF8pKSxcblx0XHRcdHNwbGl0cyA9PiB7XG5cdFx0XHRcdC8vIFNob3J0IG9iamVjdCBmb3JtLCBzdWNoIGFzIChhLiAxLCBiLiAyKVxuXHRcdFx0XHRjb25zdCBmaXJzdCA9IHNwbGl0c1swXS5iZWZvcmVcblx0XHRcdFx0Y2hlY2tOb25FbXB0eShmaXJzdCwgKCkgPT4gYFVuZXhwZWN0ZWQgJHtzcGxpdHNbMF0uYXR9YClcblx0XHRcdFx0Y29uc3QgdG9rZW5zQ2FsbGVyID0gZmlyc3QucnRhaWwoKVxuXG5cdFx0XHRcdGNvbnN0IHBhaXJzID0gW11cblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzcGxpdHMubGVuZ3RoIC0gMTsgaSA9IGkgKyAxKSB7XG5cdFx0XHRcdFx0Y29uc3QgbmFtZSA9IHNwbGl0c1tpXS5iZWZvcmUubGFzdCgpXG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayhuYW1lIGluc3RhbmNlb2YgTmFtZSwgbmFtZS5sb2MsICgpID0+XG5cdFx0XHRcdFx0XHRgRXhwZWN0ZWQgYSBuYW1lLCBub3QgJHtuYW1lfWApXG5cdFx0XHRcdFx0Y29uc3QgdG9rZW5zVmFsdWUgPSBpID09PSBzcGxpdHMubGVuZ3RoIC0gMiA/XG5cdFx0XHRcdFx0XHRzcGxpdHNbaSArIDFdLmJlZm9yZSA6XG5cdFx0XHRcdFx0XHRzcGxpdHNbaSArIDFdLmJlZm9yZS5ydGFpbCgpXG5cdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBwYXJzZUV4cHJQbGFpbih0b2tlbnNWYWx1ZSlcblx0XHRcdFx0XHRjb25zdCBsb2MgPSBuZXcgTG9jKG5hbWUubG9jLnN0YXJ0LCB0b2tlbnNWYWx1ZS5sb2MuZW5kKVxuXHRcdFx0XHRcdHBhaXJzLnB1c2gobmV3IE9ialBhaXIobG9jLCBuYW1lLm5hbWUsIHZhbHVlKSlcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCB2YWwgPSBuZXcgT2JqU2ltcGxlKHRva2Vucy5sb2MsIHBhaXJzKVxuXHRcdFx0XHRpZiAodG9rZW5zQ2FsbGVyLmlzRW1wdHkoKSlcblx0XHRcdFx0XHRyZXR1cm4gdmFsXG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHModG9rZW5zQ2FsbGVyKVxuXHRcdFx0XHRcdHJldHVybiBuZXcgQ2FsbCh0b2tlbnMubG9jLCBoZWFkKHBhcnRzKSwgY2F0KHRhaWwocGFydHMpLCB2YWwpKVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0KCkgPT4gcGFyc2VFeHByUGxhaW4odG9rZW5zKVxuXHRcdClcblx0fSxcblxuXHRwYXJzZUV4cHJQbGFpbiA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyh0b2tlbnMpXG5cdFx0c3dpdGNoIChwYXJ0cy5sZW5ndGgpIHtcblx0XHRcdGNhc2UgMDpcblx0XHRcdFx0Y29udGV4dC5mYWlsKHRva2Vucy5sb2MsICdFeHBlY3RlZCBhbiBleHByZXNzaW9uLCBnb3Qgbm90aGluZy4nKVxuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRyZXR1cm4gaGVhZChwYXJ0cylcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBuZXcgQ2FsbCh0b2tlbnMubG9jLCBoZWFkKHBhcnRzKSwgdGFpbChwYXJ0cykpXG5cdFx0fVxuXHR9LFxuXG5cdHBhcnNlRXhwclBhcnRzID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBvcFNwbGl0ID0gdG9rZW5zLm9wU3BsaXRPbmNlV2hlcmUodG9rZW4gPT4ge1xuXHRcdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRcdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRcdFx0Y2FzZSBLV19BbmQ6IGNhc2UgS1dfQ2FzZVZhbDogY2FzZSBLV19DbGFzczogY2FzZSBLV19Db25kOiBjYXNlIEtXX0V4Y2VwdFZhbDpcblx0XHRcdFx0XHRjYXNlIEtXX0ZvckJhZzogY2FzZSBLV19Gb3JWYWw6IGNhc2UgS1dfRnVuOiBjYXNlIEtXX0Z1bkRvOiBjYXNlIEtXX0Z1bkdlbjpcblx0XHRcdFx0XHRjYXNlIEtXX0Z1bkdlbkRvOiBjYXNlIEtXX0Z1blRoaXM6IGNhc2UgS1dfRnVuVGhpc0RvOiBjYXNlIEtXX0Z1blRoaXNHZW46XG5cdFx0XHRcdFx0Y2FzZSBLV19GdW5UaGlzR2VuRG86IGNhc2UgS1dfSWZWYWw6IGNhc2UgS1dfTmV3OiBjYXNlIEtXX05vdDogY2FzZSBLV19Pcjpcblx0XHRcdFx0XHRjYXNlIEtXX1N1cGVyVmFsOiBjYXNlIEtXX1N3aXRjaFZhbDogY2FzZSBLV19Vbmxlc3NWYWw6IGNhc2UgS1dfV2l0aDpcblx0XHRcdFx0XHRjYXNlIEtXX1lpZWxkOiBjYXNlIEtXX1lpZWxkVG86XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0fSlcblx0XHRyZXR1cm4gaWZFbHNlKG9wU3BsaXQsXG5cdFx0XHQoe2JlZm9yZSwgYXQsIGFmdGVyfSkgPT4ge1xuXHRcdFx0XHRjb25zdCBnZXRMYXN0ID0gKCkgPT4ge1xuXHRcdFx0XHRcdHN3aXRjaCAoYXQua2luZCkge1xuXHRcdFx0XHRcdFx0Y2FzZSBLV19BbmQ6IGNhc2UgS1dfT3I6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgTG9naWMoYXQubG9jLCBhdC5raW5kID09PSBLV19BbmQgPyBMX0FuZCA6IExfT3IsXG5cdFx0XHRcdFx0XHRcdFx0cGFyc2VFeHByUGFydHMoYWZ0ZXIpKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19DYXNlVmFsOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VDYXNlKHRydWUsIGZhbHNlLCBhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfQ2xhc3M6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUNsYXNzKGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19Db25kOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VDb25kKGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19FeGNlcHRWYWw6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUV4Y2VwdChLV19FeGNlcHRWYWwsIGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19Gb3JCYWc6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUZvckJhZyhhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfRm9yVmFsOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VGb3JWYWwoYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX0Z1bjogY2FzZSBLV19GdW5EbzogY2FzZSBLV19GdW5HZW46IGNhc2UgS1dfRnVuR2VuRG86XG5cdFx0XHRcdFx0XHRjYXNlIEtXX0Z1blRoaXM6IGNhc2UgS1dfRnVuVGhpc0RvOiBjYXNlIEtXX0Z1blRoaXNHZW46XG5cdFx0XHRcdFx0XHRjYXNlIEtXX0Z1blRoaXNHZW5Ebzpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlRnVuKGF0LmtpbmQsIGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19JZlZhbDogY2FzZSBLV19Vbmxlc3NWYWw6IHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2soYWZ0ZXIpXG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgQ29uZGl0aW9uYWxWYWwodG9rZW5zLmxvYyxcblx0XHRcdFx0XHRcdFx0XHRwYXJzZUV4cHJQbGFpbihiZWZvcmUpLFxuXHRcdFx0XHRcdFx0XHRcdHBhcnNlQmxvY2tWYWwoYmxvY2spLFxuXHRcdFx0XHRcdFx0XHRcdGF0LmtpbmQgPT09IEtXX1VubGVzc1ZhbClcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNhc2UgS1dfTmV3OiB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHMoYWZ0ZXIpXG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgTmV3KGF0LmxvYywgcGFydHNbMF0sIHRhaWwocGFydHMpKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19Ob3Q6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgTm90KGF0LmxvYywgcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19TdXBlclZhbDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBTdXBlckNhbGwoYXQubG9jLCBwYXJzZUV4cHJQYXJ0cyhhZnRlcikpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX1N3aXRjaFZhbDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlU3dpdGNoKHRydWUsIGZhbHNlLCBhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfV2l0aDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlV2l0aChhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfWWllbGQ6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgWWllbGQoYXQubG9jLFxuXHRcdFx0XHRcdFx0XHRcdG9wSWYoIWFmdGVyLmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKSlcblx0XHRcdFx0XHRcdGNhc2UgS1dfWWllbGRUbzpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBZaWVsZFRvKGF0LmxvYywgcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKVxuXHRcdFx0XHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKGF0LmtpbmQpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBjYXQoYmVmb3JlLm1hcChwYXJzZVNpbmdsZSksIGdldExhc3QoKSlcblx0XHRcdH0sXG5cdFx0XHQoKSA9PiB0b2tlbnMubWFwKHBhcnNlU2luZ2xlKSlcblx0fVxuXG5jb25zdCBwYXJzZUZ1biA9IChraW5kLCB0b2tlbnMpID0+IHtcblx0bGV0IGlzVGhpcyA9IGZhbHNlLCBpc0RvID0gZmFsc2UsIGlzR2VuID0gZmFsc2Vcblx0c3dpdGNoIChraW5kKSB7XG5cdFx0Y2FzZSBLV19GdW46XG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuRG86XG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1bkdlbjpcblx0XHRcdGlzR2VuID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1bkdlbkRvOlxuXHRcdFx0aXNHZW4gPSB0cnVlXG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1blRoaXM6XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuVGhpc0RvOlxuXHRcdFx0aXNUaGlzID0gdHJ1ZVxuXHRcdFx0aXNEbyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5UaGlzR2VuOlxuXHRcdFx0aXNUaGlzID0gdHJ1ZVxuXHRcdFx0aXNHZW4gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuVGhpc0dlbkRvOlxuXHRcdFx0aXNUaGlzID0gdHJ1ZVxuXHRcdFx0aXNHZW4gPSB0cnVlXG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoKVxuXHR9XG5cdGNvbnN0IG9wRGVjbGFyZVRoaXMgPSBvcElmKGlzVGhpcywgKCkgPT4gbmV3IExvY2FsRGVjbGFyZVRoaXModG9rZW5zLmxvYykpXG5cblx0Y29uc3Qge29wUmV0dXJuVHlwZSwgcmVzdH0gPSBfdHJ5VGFrZVJldHVyblR5cGUodG9rZW5zKVxuXHRjb25zdCB7YXJncywgb3BSZXN0QXJnLCBibG9jaywgb3BJbiwgb3BPdXQsIG9wQ29tbWVudH0gPSBfZnVuQXJnc0FuZEJsb2NrKGlzRG8sIHJlc3QpXG5cdC8vIE5lZWQgcmVzIGRlY2xhcmUgaWYgdGhlcmUgaXMgYSByZXR1cm4gdHlwZSBvciBvdXQgY29uZGl0aW9uLlxuXHRjb25zdCBvcERlY2xhcmVSZXMgPSBpZkVsc2Uob3BSZXR1cm5UeXBlLFxuXHRcdF8gPT4gbmV3IExvY2FsRGVjbGFyZVJlcyhfLmxvYywgXyksXG5cdFx0KCkgPT4gb3BNYXAob3BPdXQsIF8gPT4gbmV3IExvY2FsRGVjbGFyZVJlcyhfLmxvYywgbnVsbCkpKVxuXHRyZXR1cm4gbmV3IEZ1bih0b2tlbnMubG9jLFxuXHRcdG9wRGVjbGFyZVRoaXMsIGlzR2VuLCBhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBvcEluLCBvcERlY2xhcmVSZXMsIG9wT3V0LCBvcENvbW1lbnQpXG59XG5cbi8vIHBhcnNlRnVuIHByaXZhdGVzXG5jb25zdFxuXHRfdHJ5VGFrZVJldHVyblR5cGUgPSB0b2tlbnMgPT4ge1xuXHRcdGlmICghdG9rZW5zLmlzRW1wdHkoKSkge1xuXHRcdFx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKClcblx0XHRcdGlmIChpc0dyb3VwKEdfU3BhY2UsIGgpICYmIGlzS2V5d29yZChLV19UeXBlLCBoZWFkKGguc3ViVG9rZW5zKSkpXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0b3BSZXR1cm5UeXBlOiBwYXJzZVNwYWNlZChTbGljZS5ncm91cChoKS50YWlsKCkpLFxuXHRcdFx0XHRcdHJlc3Q6IHRva2Vucy50YWlsKClcblx0XHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4ge29wUmV0dXJuVHlwZTogbnVsbCwgcmVzdDogdG9rZW5zfVxuXHR9LFxuXG5cdC8qXG5cdGluY2x1ZGVNZW1iZXJBcmdzOlxuXHRcdGlmIHRydWUsIG91dHB1dCB3aWxsIGluY2x1ZGUgYG1lbWJlckFyZ3NgLlxuXHRcdFRoaXMgaXMgYSBzdWJzZXQgb2YgYGFyZ3NgIHdob3NlIG5hbWVzIGFyZSBwcmVmaXhlZCB3aXRoIGAuYFxuXHRcdGUuZy46IGBjb25zdHJ1Y3QhIC54IC55YFxuXHRcdFRoaXMgaXMgZm9yIGNvbnN0cnVjdG9ycyBvbmx5LlxuXHQqL1xuXHRfZnVuQXJnc0FuZEJsb2NrID0gKGlzRG8sIHRva2VucywgaW5jbHVkZU1lbWJlckFyZ3MpID0+IHtcblx0XHRjaGVja05vbkVtcHR5KHRva2VucywgJ0V4cGVjdGVkIGFuIGluZGVudGVkIGJsb2NrLicpXG5cdFx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKClcblxuXHRcdC8vIE1pZ2h0IGJlIGB8Y2FzZWAgKG9yIGB8Y2FzZSFgLCBgfHN3aXRjaGAsIGB8c3dpdGNoIWApXG5cdFx0aWYgKGlzQW55S2V5d29yZChfZnVuRm9jdXNLZXl3b3JkcywgaCkpIHtcblx0XHRcdGNvbnN0IGlzVmFsID0gaC5raW5kID09PSBLV19DYXNlVmFsIHx8IGgua2luZCA9PT0gS1dfU3dpdGNoVmFsXG5cdFx0XHRjb25zdCBpc0Nhc2UgPSBoLmtpbmQgPT09IEtXX0Nhc2VWYWwgfHwgaC5raW5kID09PSBLV19DYXNlRG9cblx0XHRcdGNvbnN0IGV4cHIgPSAoaXNDYXNlID8gcGFyc2VDYXNlIDogcGFyc2VTd2l0Y2gpKGlzVmFsLCB0cnVlLCB0b2tlbnMudGFpbCgpKVxuXG5cdFx0XHRjb25zdCBhcmdzID0gW25ldyBMb2NhbERlY2xhcmVGb2N1cyhoLmxvYyldXG5cdFx0XHRyZXR1cm4gaXNWYWwgP1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YXJncywgb3BSZXN0QXJnOiBudWxsLCBtZW1iZXJBcmdzOiBbXSwgb3BJbjogbnVsbCwgb3BPdXQ6IG51bGwsXG5cdFx0XHRcdFx0YmxvY2s6IG5ldyBCbG9ja1dpdGhSZXR1cm4odG9rZW5zLmxvYywgbnVsbCwgW10sIGV4cHIpXG5cdFx0XHRcdH0gOlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YXJncywgb3BSZXN0QXJnOiBudWxsLCBtZW1iZXJBcmdzOiBbXSwgb3BJbjogbnVsbCwgb3BPdXQ6IG51bGwsXG5cdFx0XHRcdFx0YmxvY2s6IG5ldyBCbG9ja0RvKHRva2Vucy5sb2MsIG51bGwsIFtleHByXSlcblx0XHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBbYmVmb3JlLCBibG9ja0xpbmVzXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0XHRcdGNvbnN0IHthcmdzLCBvcFJlc3RBcmcsIG1lbWJlckFyZ3N9ID0gX3BhcnNlRnVuTG9jYWxzKGJlZm9yZSwgaW5jbHVkZU1lbWJlckFyZ3MpXG5cdFx0XHRmb3IgKGNvbnN0IGFyZyBvZiBhcmdzKVxuXHRcdFx0XHRpZiAoIWFyZy5pc0xhenkoKSlcblx0XHRcdFx0XHRhcmcua2luZCA9IExEX011dGFibGVcblx0XHRcdGNvbnN0IFtvcEluLCByZXN0MF0gPSBfdHJ5VGFrZUluT3JPdXQoS1dfSW4sIGJsb2NrTGluZXMpXG5cdFx0XHRjb25zdCBbb3BPdXQsIHJlc3QxXSA9IF90cnlUYWtlSW5Pck91dChLV19PdXQsIHJlc3QwKVxuXHRcdFx0Y29uc3QgYmxvY2sgPSAoaXNEbyA/IHBhcnNlQmxvY2tEbyA6IHBhcnNlQmxvY2tWYWwpKHJlc3QxKVxuXHRcdFx0cmV0dXJuIHthcmdzLCBvcFJlc3RBcmcsIG1lbWJlckFyZ3MsIGJsb2NrLCBvcEluLCBvcE91dH1cblx0XHR9XG5cdH0sXG5cdF9mdW5Gb2N1c0tleXdvcmRzID0gbmV3IFNldChbS1dfQ2FzZVZhbCwgS1dfQ2FzZURvLCBLV19Td2l0Y2hWYWwsIEtXX1N3aXRjaERvXSksXG5cblx0X3BhcnNlRnVuTG9jYWxzID0gKHRva2VucywgaW5jbHVkZU1lbWJlckFyZ3MpID0+IHtcblx0XHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRcdHJldHVybiB7YXJnczogW10sIG1lbWJlckFyZ3M6IFtdLCBvcFJlc3RBcmc6IG51bGx9XG5cdFx0ZWxzZSB7XG5cdFx0XHRsZXQgcmVzdCwgb3BSZXN0QXJnXG5cdFx0XHRjb25zdCBsID0gdG9rZW5zLmxhc3QoKVxuXHRcdFx0aWYgKGwgaW5zdGFuY2VvZiBEb3ROYW1lICYmIGwubkRvdHMgPT09IDMpIHtcblx0XHRcdFx0cmVzdCA9IHRva2Vucy5ydGFpbCgpXG5cdFx0XHRcdG9wUmVzdEFyZyA9IExvY2FsRGVjbGFyZS5wbGFpbihsLmxvYywgbC5uYW1lKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzdCA9IHRva2Vuc1xuXHRcdFx0XHRvcFJlc3RBcmcgPSBudWxsXG5cdFx0XHR9XG5cblx0XHRcdGlmIChpbmNsdWRlTWVtYmVyQXJncykge1xuXHRcdFx0XHRjb25zdCB7ZGVjbGFyZXM6IGFyZ3MsIG1lbWJlckFyZ3N9ID0gcGFyc2VMb2NhbERlY2xhcmVzQW5kTWVtYmVyQXJncyhyZXN0KVxuXHRcdFx0XHRyZXR1cm4ge2FyZ3MsIG1lbWJlckFyZ3MsIG9wUmVzdEFyZ31cblx0XHRcdH0gZWxzZVxuXHRcdFx0XHRyZXR1cm4ge2FyZ3M6IHBhcnNlTG9jYWxEZWNsYXJlcyhyZXN0KSwgb3BSZXN0QXJnfVxuXHRcdH1cblx0fSxcblxuXHRfdHJ5VGFrZUluT3JPdXQgPSAoaW5Pck91dCwgdG9rZW5zKSA9PiB7XG5cdFx0aWYgKCF0b2tlbnMuaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCBmaXJzdExpbmUgPSB0b2tlbnMuaGVhZFNsaWNlKClcblx0XHRcdGlmIChpc0tleXdvcmQoaW5Pck91dCwgZmlyc3RMaW5lLmhlYWQoKSkpIHtcblx0XHRcdFx0Y29uc3QgaW5PdXQgPSBuZXcgRGVidWcoXG5cdFx0XHRcdFx0Zmlyc3RMaW5lLmxvYyxcblx0XHRcdFx0XHRwYXJzZUxpbmVzRnJvbUJsb2NrKGZpcnN0TGluZSkpXG5cdFx0XHRcdHJldHVybiBbaW5PdXQsIHRva2Vucy50YWlsKCldXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBbbnVsbCwgdG9rZW5zXVxuXHR9XG5cbmNvbnN0XG5cdHBhcnNlTGluZSA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgaGVhZCA9IHRva2Vucy5oZWFkKClcblx0XHRjb25zdCByZXN0ID0gdG9rZW5zLnRhaWwoKVxuXG5cdFx0Y29uc3Qgbm9SZXN0ID0gKCkgPT5cblx0XHRcdGNoZWNrRW1wdHkocmVzdCwgKCkgPT4gYERpZCBub3QgZXhwZWN0IGFueXRoaW5nIGFmdGVyICR7aGVhZH1gKVxuXG5cdFx0Ly8gV2Ugb25seSBkZWFsIHdpdGggbXV0YWJsZSBleHByZXNzaW9ucyBoZXJlLCBvdGhlcndpc2Ugd2UgZmFsbCBiYWNrIHRvIHBhcnNlRXhwci5cblx0XHRpZiAoaGVhZCBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0XHRzd2l0Y2ggKGhlYWQua2luZCkge1xuXHRcdFx0XHRjYXNlIEtXX0Fzc2VydDogY2FzZSBLV19Bc3NlcnROb3Q6XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlQXNzZXJ0KGhlYWQua2luZCA9PT0gS1dfQXNzZXJ0Tm90LCByZXN0KVxuXHRcdFx0XHRjYXNlIEtXX0V4Y2VwdERvOlxuXHRcdFx0XHRcdHJldHVybiBwYXJzZUV4Y2VwdChLV19FeGNlcHREbywgcmVzdClcblx0XHRcdFx0Y2FzZSBLV19CcmVhazpcblx0XHRcdFx0XHRub1Jlc3QoKVxuXHRcdFx0XHRcdHJldHVybiBuZXcgQnJlYWsodG9rZW5zLmxvYylcblx0XHRcdFx0Y2FzZSBLV19CcmVha1dpdGhWYWw6XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBCcmVha1dpdGhWYWwodG9rZW5zLmxvYywgcGFyc2VFeHByKHJlc3QpKVxuXHRcdFx0XHRjYXNlIEtXX0Nhc2VEbzpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VDYXNlKGZhbHNlLCBmYWxzZSwgcmVzdClcblx0XHRcdFx0Y2FzZSBLV19EZWJ1Zzpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IERlYnVnKHRva2Vucy5sb2MsXG5cdFx0XHRcdFx0XHRpc0dyb3VwKEdfQmxvY2ssIHRva2Vucy5zZWNvbmQoKSkgP1xuXHRcdFx0XHRcdFx0Ly8gYGRlYnVnYCwgdGhlbiBpbmRlbnRlZCBibG9ja1xuXHRcdFx0XHRcdFx0cGFyc2VMaW5lc0Zyb21CbG9jaygpIDpcblx0XHRcdFx0XHRcdC8vIGBkZWJ1Z2AsIHRoZW4gc2luZ2xlIGxpbmVcblx0XHRcdFx0XHRcdHBhcnNlTGluZU9yTGluZXMocmVzdCkpXG5cdFx0XHRcdGNhc2UgS1dfRGVidWdnZXI6XG5cdFx0XHRcdFx0bm9SZXN0KClcblx0XHRcdFx0XHRyZXR1cm4gbmV3IFNwZWNpYWxEbyh0b2tlbnMubG9jLCBTRF9EZWJ1Z2dlcilcblx0XHRcdFx0Y2FzZSBLV19FbGxpcHNpczpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEJhZ0VudHJ5TWFueSh0b2tlbnMubG9jLCBwYXJzZUV4cHIocmVzdCkpXG5cdFx0XHRcdGNhc2UgS1dfRm9yRG86XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlRm9yRG8ocmVzdClcblx0XHRcdFx0Y2FzZSBLV19JZ25vcmU6XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlSWdub3JlKHJlc3QpXG5cdFx0XHRcdGNhc2UgS1dfSWZEbzogY2FzZSBLV19Vbmxlc3NEbzoge1xuXHRcdFx0XHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHJlc3QpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbERvKHRva2Vucy5sb2MsXG5cdFx0XHRcdFx0XHRwYXJzZUV4cHIoYmVmb3JlKSxcblx0XHRcdFx0XHRcdHBhcnNlQmxvY2tEbyhibG9jayksXG5cdFx0XHRcdFx0XHRoZWFkLmtpbmQgPT09IEtXX1VubGVzc0RvKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgS1dfT2JqQXNzaWduOlxuXHRcdFx0XHRcdHJldHVybiBuZXcgQmFnRW50cnkodG9rZW5zLmxvYywgcGFyc2VFeHByKHJlc3QpKVxuXHRcdFx0XHRjYXNlIEtXX1Bhc3M6XG5cdFx0XHRcdFx0bm9SZXN0KClcblx0XHRcdFx0XHRyZXR1cm4gW11cblx0XHRcdFx0Y2FzZSBLV19SZWdpb246XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlTGluZXNGcm9tQmxvY2sodG9rZW5zKVxuXHRcdFx0XHRjYXNlIEtXX1N1cGVyRG86XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBTdXBlckNhbGxEbyh0b2tlbnMubG9jLCBwYXJzZUV4cHJQYXJ0cyhyZXN0KSlcblx0XHRcdFx0Y2FzZSBLV19Td2l0Y2hEbzpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VTd2l0Y2goZmFsc2UsIGZhbHNlLCByZXN0KVxuXHRcdFx0XHRjYXNlIEtXX1Rocm93OlxuXHRcdFx0XHRcdHJldHVybiBuZXcgVGhyb3codG9rZW5zLmxvYywgb3BJZighcmVzdC5pc0VtcHR5KCksICgpID0+IHBhcnNlRXhwcihyZXN0KSkpXG5cdFx0XHRcdGNhc2UgS1dfTmFtZTpcblx0XHRcdFx0XHRpZiAoaXNLZXl3b3JkKEtXX09iakFzc2lnbiwgcmVzdC5oZWFkKCkpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCByID0gcmVzdC50YWlsKClcblx0XHRcdFx0XHRcdGNvbnN0IHZhbCA9IHIuaXNFbXB0eSgpID8gbmV3IFNwZWNpYWxWYWwodG9rZW5zLmxvYywgU1ZfTmFtZSkgOiBwYXJzZUV4cHIocilcblx0XHRcdFx0XHRcdHJldHVybiBPYmpFbnRyeUNvbXB1dGVkLm5hbWUodG9rZW5zLmxvYywgdmFsKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBlbHNlIGZhbGx0aHJvdWdoXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Ly8gZmFsbCB0aHJvdWdoXG5cdFx0XHR9XG5cblx0XHRyZXR1cm4gaWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZVdoZXJlKF9pc0xpbmVTcGxpdEtleXdvcmQpLFxuXHRcdFx0KHtiZWZvcmUsIGF0LCBhZnRlcn0pID0+IF9wYXJzZUFzc2lnbkxpa2UoYmVmb3JlLCBhdCwgYWZ0ZXIsIHRva2Vucy5sb2MpLFxuXHRcdFx0KCkgPT4gcGFyc2VFeHByKHRva2VucykpXG5cdH0sXG5cblx0cGFyc2VMaW5lT3JMaW5lcyA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgXyA9IHBhcnNlTGluZSh0b2tlbnMpXG5cdFx0cmV0dXJuIF8gaW5zdGFuY2VvZiBBcnJheSA/IF8gOiBbX11cblx0fVxuXG4vLyBwYXJzZUxpbmUgcHJpdmF0ZXNcbmNvbnN0XG5cdF9pc0xpbmVTcGxpdEtleXdvcmQgPSB0b2tlbiA9PiB7XG5cdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRcdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdFx0XHRjYXNlIEtXX0Fzc2lnbjogY2FzZSBLV19Bc3NpZ25NdXRhYmxlOiBjYXNlIEtXX0xvY2FsTXV0YXRlOlxuXHRcdFx0XHRjYXNlIEtXX01hcEVudHJ5OiBjYXNlIEtXX09iakFzc2lnbjogY2FzZSBLV19ZaWVsZDogY2FzZSBLV19ZaWVsZFRvOlxuXHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHR9XG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdH0sXG5cblx0X3BhcnNlQXNzaWduTGlrZSA9IChiZWZvcmUsIGF0LCBhZnRlciwgbG9jKSA9PiB7XG5cdFx0aWYgKGF0LmtpbmQgPT09IEtXX01hcEVudHJ5KVxuXHRcdFx0cmV0dXJuIG5ldyBNYXBFbnRyeShsb2MsIHBhcnNlRXhwcihiZWZvcmUpLCBwYXJzZUV4cHIoYWZ0ZXIpKVxuXG5cdFx0Ly8gVE9ETzogVGhpcyBjb2RlIGlzIGtpbmQgb2YgdWdseS5cblx0XHQvLyBJdCBwYXJzZXMgYHgueSA9IHpgIGFuZCB0aGUgbGlrZS5cblx0XHRpZiAoYmVmb3JlLnNpemUoKSA9PT0gMSkge1xuXHRcdFx0Y29uc3QgdG9rZW4gPSBiZWZvcmUuaGVhZCgpXG5cdFx0XHRpZiAodG9rZW4gaW5zdGFuY2VvZiBEb3ROYW1lKVxuXHRcdFx0XHRyZXR1cm4gX3BhcnNlTWVtYmVyU2V0KFx0TG9jYWxBY2Nlc3MudGhpcyh0b2tlbi5sb2MpLCB0b2tlbi5uYW1lLCBhdCwgYWZ0ZXIsIGxvYylcblx0XHRcdGlmIChpc0dyb3VwKEdfU3BhY2UsIHRva2VuKSkge1xuXHRcdFx0XHRjb25zdCBzcGFjZWQgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRcdFx0Y29uc3QgZG90ID0gc3BhY2VkLmxhc3QoKVxuXHRcdFx0XHRpZiAoZG90IGluc3RhbmNlb2YgRG90TmFtZSkge1xuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soZG90Lm5Eb3RzID09PSAxLCBkb3QubG9jLCAnTXVzdCBoYXZlIG9ubHkgMSBgLmAuJylcblx0XHRcdFx0XHRyZXR1cm4gX3BhcnNlTWVtYmVyU2V0KHBhcnNlU3BhY2VkKHNwYWNlZC5ydGFpbCgpKSwgZG90Lm5hbWUsIGF0LCBhZnRlciwgbG9jKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGF0LmtpbmQgPT09IEtXX0xvY2FsTXV0YXRlID9cblx0XHRcdF9wYXJzZUxvY2FsTXV0YXRlKGJlZm9yZSwgYWZ0ZXIsIGxvYykgOlxuXHRcdFx0X3BhcnNlQXNzaWduKGJlZm9yZSwgYXQsIGFmdGVyLCBsb2MpXG5cdH0sXG5cblx0X3BhcnNlTWVtYmVyU2V0ID0gKG9iamVjdCwgbmFtZSwgYXQsIGFmdGVyLCBsb2MpID0+XG5cdFx0bmV3IE1lbWJlclNldChsb2MsIG9iamVjdCwgbmFtZSwgX21lbWJlclNldEtpbmQoYXQpLCBwYXJzZUV4cHIoYWZ0ZXIpKSxcblx0X21lbWJlclNldEtpbmQgPSBhdCA9PiB7XG5cdFx0c3dpdGNoIChhdC5raW5kKSB7XG5cdFx0XHRjYXNlIEtXX0Fzc2lnbjogcmV0dXJuIE1TX05ld1xuXHRcdFx0Y2FzZSBLV19Bc3NpZ25NdXRhYmxlOiByZXR1cm4gTVNfTmV3TXV0YWJsZVxuXHRcdFx0Y2FzZSBLV19Mb2NhbE11dGF0ZTogcmV0dXJuIE1TX011dGF0ZVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKClcblx0XHR9XG5cdH0sXG5cblx0X3BhcnNlTG9jYWxNdXRhdGUgPSAobG9jYWxzVG9rZW5zLCB2YWx1ZVRva2VucywgbG9jKSA9PiB7XG5cdFx0Y29uc3QgbG9jYWxzID0gcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKGxvY2Fsc1Rva2Vucylcblx0XHRjb250ZXh0LmNoZWNrKGxvY2Fscy5sZW5ndGggPT09IDEsIGxvYywgJ1RPRE86IExvY2FsRGVzdHJ1Y3R1cmVNdXRhdGUnKVxuXHRcdGNvbnN0IG5hbWUgPSBsb2NhbHNbMF0ubmFtZVxuXHRcdGNvbnN0IHZhbHVlID0gcGFyc2VFeHByKHZhbHVlVG9rZW5zKVxuXHRcdHJldHVybiBuZXcgTG9jYWxNdXRhdGUobG9jLCBuYW1lLCB2YWx1ZSlcblx0fSxcblxuXHRfcGFyc2VBc3NpZ24gPSAobG9jYWxzVG9rZW5zLCBhc3NpZ25lciwgdmFsdWVUb2tlbnMsIGxvYykgPT4ge1xuXHRcdGNvbnN0IGtpbmQgPSBhc3NpZ25lci5raW5kXG5cdFx0Y29uc3QgbG9jYWxzID0gcGFyc2VMb2NhbERlY2xhcmVzKGxvY2Fsc1Rva2Vucylcblx0XHRjb25zdCBvcE5hbWUgPSBvcElmKGxvY2Fscy5sZW5ndGggPT09IDEsICgpID0+IGxvY2Fsc1swXS5uYW1lKVxuXHRcdGNvbnN0IHZhbHVlID0gX3BhcnNlQXNzaWduVmFsdWUoa2luZCwgb3BOYW1lLCB2YWx1ZVRva2VucylcblxuXHRcdGNvbnN0IGlzWWllbGQgPSBraW5kID09PSBLV19ZaWVsZCB8fCBraW5kID09PSBLV19ZaWVsZFRvXG5cdFx0aWYgKGlzRW1wdHkobG9jYWxzKSkge1xuXHRcdFx0Y29udGV4dC5jaGVjayhpc1lpZWxkLCBsb2NhbHNUb2tlbnMubG9jLCAnQXNzaWdubWVudCB0byBub3RoaW5nJylcblx0XHRcdHJldHVybiB2YWx1ZVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoaXNZaWVsZClcblx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIGxvY2Fscylcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKCFfLmlzTGF6eSgpLCBfLmxvYywgJ0NhbiBub3QgeWllbGQgdG8gbGF6eSB2YXJpYWJsZS4nKVxuXG5cdFx0XHRjb25zdCBpc09iakFzc2lnbiA9IGtpbmQgPT09IEtXX09iakFzc2lnblxuXG5cdFx0XHRpZiAoa2luZCA9PT0gS1dfQXNzaWduTXV0YWJsZSlcblx0XHRcdFx0Zm9yIChsZXQgXyBvZiBsb2NhbHMpIHtcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKCFfLmlzTGF6eSgpLCBfLmxvYywgJ0xhenkgbG9jYWwgY2FuIG5vdCBiZSBtdXRhYmxlLicpXG5cdFx0XHRcdFx0Xy5raW5kID0gTERfTXV0YWJsZVxuXHRcdFx0XHR9XG5cblx0XHRcdGNvbnN0IHdyYXAgPSBfID0+IGlzT2JqQXNzaWduID8gbmV3IE9iakVudHJ5QXNzaWduKGxvYywgXykgOiBfXG5cblx0XHRcdGlmIChsb2NhbHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdGNvbnN0IGFzc2lnbmVlID0gbG9jYWxzWzBdXG5cdFx0XHRcdGNvbnN0IGFzc2lnbiA9IG5ldyBBc3NpZ25TaW5nbGUobG9jLCBhc3NpZ25lZSwgdmFsdWUpXG5cdFx0XHRcdGNvbnN0IGlzVGVzdCA9IGlzT2JqQXNzaWduICYmIGFzc2lnbmVlLm5hbWUuZW5kc1dpdGgoJ3Rlc3QnKVxuXHRcdFx0XHRyZXR1cm4gaXNUZXN0ID8gbmV3IERlYnVnKGxvYywgW3dyYXAoYXNzaWduKV0pIDogd3JhcChhc3NpZ24pXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBraW5kID0gbG9jYWxzWzBdLmtpbmRcblx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIGxvY2Fscylcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKF8ua2luZCA9PT0ga2luZCwgXy5sb2MsXG5cdFx0XHRcdFx0XHQnQWxsIGxvY2FscyBvZiBkZXN0cnVjdHVyaW5nIGFzc2lnbm1lbnQgbXVzdCBiZSBvZiB0aGUgc2FtZSBraW5kLicpXG5cdFx0XHRcdHJldHVybiB3cmFwKG5ldyBBc3NpZ25EZXN0cnVjdHVyZShsb2MsIGxvY2FscywgdmFsdWUsIGtpbmQpKVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRfcGFyc2VBc3NpZ25WYWx1ZSA9IChraW5kLCBvcE5hbWUsIHZhbHVlVG9rZW5zKSA9PiB7XG5cdFx0Y29uc3QgdmFsdWUgPSB2YWx1ZVRva2Vucy5pc0VtcHR5KCkgJiYga2luZCA9PT0gS1dfT2JqQXNzaWduID9cblx0XHRcdG5ldyBTcGVjaWFsVmFsKHZhbHVlVG9rZW5zLmxvYywgU1ZfTnVsbCkgOlxuXHRcdFx0cGFyc2VFeHByKHZhbHVlVG9rZW5zKVxuXHRcdHN3aXRjaCAoa2luZCkge1xuXHRcdFx0Y2FzZSBLV19ZaWVsZDpcblx0XHRcdFx0cmV0dXJuIG5ldyBZaWVsZCh2YWx1ZS5sb2MsIHZhbHVlKVxuXHRcdFx0Y2FzZSBLV19ZaWVsZFRvOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFlpZWxkVG8odmFsdWUubG9jLCB2YWx1ZSlcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiB2YWx1ZVxuXHRcdH1cblx0fVxuXG5jb25zdFxuXHRwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMgPSB0b2tlbnMgPT5cblx0XHR0b2tlbnMubWFwKF8gPT4gTG9jYWxEZWNsYXJlLnBsYWluKF8ubG9jLCBfcGFyc2VMb2NhbE5hbWUoXykpKSxcblxuXHRwYXJzZUxvY2FsRGVjbGFyZXMgPSAodG9rZW5zLCBpbmNsdWRlTWVtYmVyQXJncykgPT5cblx0XHRpbmNsdWRlTWVtYmVyQXJncyA/IHBhcnNlTG9jYWxEZWNsYXJlc0FuZE1lbWJlckFyZ3ModG9rZW5zKSA6IHRva2Vucy5tYXAocGFyc2VMb2NhbERlY2xhcmUpLFxuXG5cdC8vIF9vck1lbWJlcjogaWYgdHJ1ZSwgd2lsbCBsb29rIGZvciBgLnhgIGFyZ3VtZW50cyBhbmQgcmV0dXJuIHtkZWNsYXJlLCBpc01lbWJlcn0uXG5cdHBhcnNlTG9jYWxEZWNsYXJlID0gKHRva2VuLCBfb3JNZW1iZXIpID0+IHtcblx0XHRsZXQgaXNNZW1iZXIgPSBmYWxzZVxuXHRcdGxldCBkZWNsYXJlXG5cblx0XHRjb25zdCBwYXJzZUxvY2FsTmFtZSA9IHRva2VuID0+IHtcblx0XHRcdGlmIChfb3JNZW1iZXIpIHtcblx0XHRcdFx0aXNNZW1iZXIgPSB0b2tlbiBpbnN0YW5jZW9mIERvdE5hbWUgJiYgdG9rZW4ubkRvdHMgPT09IDFcblx0XHRcdFx0cmV0dXJuIGlzTWVtYmVyID8gdG9rZW4ubmFtZSA6IF9wYXJzZUxvY2FsTmFtZSh0b2tlbilcblx0XHRcdH0gZWxzZVxuXHRcdFx0XHRyZXR1cm4gX3BhcnNlTG9jYWxOYW1lKHRva2VuKVxuXHRcdH1cblxuXHRcdGlmIChpc0dyb3VwKEdfU3BhY2UsIHRva2VuKSkge1xuXHRcdFx0Y29uc3QgdG9rZW5zID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0XHRjb25zdCBbcmVzdCwgaXNMYXp5XSA9XG5cdFx0XHRcdGlzS2V5d29yZChLV19MYXp5LCB0b2tlbnMuaGVhZCgpKSA/IFt0b2tlbnMudGFpbCgpLCB0cnVlXSA6IFt0b2tlbnMsIGZhbHNlXVxuXG5cdFx0XHRjb25zdCBuYW1lID0gcGFyc2VMb2NhbE5hbWUocmVzdC5oZWFkKCkpXG5cdFx0XHRjb25zdCByZXN0MiA9IHJlc3QudGFpbCgpXG5cdFx0XHRjb25zdCBvcFR5cGUgPSBvcElmKCFyZXN0Mi5pc0VtcHR5KCksICgpID0+IHtcblx0XHRcdFx0Y29uc3QgY29sb24gPSByZXN0Mi5oZWFkKClcblx0XHRcdFx0Y29udGV4dC5jaGVjayhpc0tleXdvcmQoS1dfVHlwZSwgY29sb24pLCBjb2xvbi5sb2MsICgpID0+IGBFeHBlY3RlZCAke2NvZGUoJzonKX1gKVxuXHRcdFx0XHRjb25zdCB0b2tlbnNUeXBlID0gcmVzdDIudGFpbCgpXG5cdFx0XHRcdGNoZWNrTm9uRW1wdHkodG9rZW5zVHlwZSwgKCkgPT4gYEV4cGVjdGVkIHNvbWV0aGluZyBhZnRlciAke2NvbG9ufWApXG5cdFx0XHRcdHJldHVybiBwYXJzZVNwYWNlZCh0b2tlbnNUeXBlKVxuXHRcdFx0fSlcblx0XHRcdGRlY2xhcmUgPSBuZXcgTG9jYWxEZWNsYXJlKHRva2VuLmxvYywgbmFtZSwgb3BUeXBlLCBpc0xhenkgPyBMRF9MYXp5IDogTERfQ29uc3QpXG5cdFx0fSBlbHNlXG5cdFx0XHRkZWNsYXJlID0gTG9jYWxEZWNsYXJlLnBsYWluKHRva2VuLmxvYywgcGFyc2VMb2NhbE5hbWUodG9rZW4pKVxuXG5cdFx0aWYgKF9vck1lbWJlcilcblx0XHRcdHJldHVybiB7ZGVjbGFyZSwgaXNNZW1iZXJ9XG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIGRlY2xhcmVcblx0fSxcblxuXHRwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBkZWNsYXJlcyA9IFtdLCBtZW1iZXJBcmdzID0gW11cblx0XHRmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuXHRcdFx0Y29uc3Qge2RlY2xhcmUsIGlzTWVtYmVyfSA9IHBhcnNlTG9jYWxEZWNsYXJlKHRva2VuLCB0cnVlKVxuXHRcdFx0ZGVjbGFyZXMucHVzaChkZWNsYXJlKVxuXHRcdFx0aWYgKGlzTWVtYmVyKVxuXHRcdFx0XHRtZW1iZXJBcmdzLnB1c2goZGVjbGFyZSlcblx0XHR9XG5cdFx0cmV0dXJuIHtkZWNsYXJlcywgbWVtYmVyQXJnc31cblx0fVxuXG4vLyBwYXJzZUxvY2FsRGVjbGFyZSBwcml2YXRlc1xuY29uc3Rcblx0X3BhcnNlTG9jYWxOYW1lID0gdCA9PiB7XG5cdFx0aWYgKGlzS2V5d29yZChLV19Gb2N1cywgdCkpXG5cdFx0XHRyZXR1cm4gJ18nXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKHQgaW5zdGFuY2VvZiBOYW1lLCB0LmxvYywgKCkgPT4gYEV4cGVjdGVkIGEgbG9jYWwgbmFtZSwgbm90ICR7dH1gKVxuXHRcdFx0cmV0dXJuIHQubmFtZVxuXHRcdH1cblx0fVxuXG5jb25zdCBwYXJzZVNpbmdsZSA9IHRva2VuID0+IHtcblx0Y29uc3Qge2xvY30gPSB0b2tlblxuXHRpZiAodG9rZW4gaW5zdGFuY2VvZiBOYW1lKVxuXHRcdHJldHVybiBuZXcgTG9jYWxBY2Nlc3MobG9jLCB0b2tlbi5uYW1lKVxuXHRlbHNlIGlmICh0b2tlbiBpbnN0YW5jZW9mIEdyb3VwKSB7XG5cdFx0Y29uc3Qgc2xpY2UgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdGNhc2UgR19TcGFjZTpcblx0XHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkKHNsaWNlKVxuXHRcdFx0Y2FzZSBHX1BhcmVudGhlc2lzOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VFeHByKHNsaWNlKVxuXHRcdFx0Y2FzZSBHX0JyYWNrZXQ6XG5cdFx0XHRcdHJldHVybiBuZXcgQmFnU2ltcGxlKGxvYywgcGFyc2VFeHByUGFydHMoc2xpY2UpKVxuXHRcdFx0Y2FzZSBHX0Jsb2NrOlxuXHRcdFx0XHRyZXR1cm4gYmxvY2tXcmFwKHNsaWNlKVxuXHRcdFx0Y2FzZSBHX1F1b3RlOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VRdW90ZShzbGljZSlcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcih0b2tlbi5raW5kKVxuXHRcdH1cblx0fSBlbHNlIGlmICh0b2tlbiBpbnN0YW5jZW9mIE51bWJlckxpdGVyYWwpXG5cdFx0cmV0dXJuIHRva2VuXG5cdGVsc2UgaWYgKHRva2VuIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdGNhc2UgS1dfRm9jdXM6XG5cdFx0XHRcdHJldHVybiBMb2NhbEFjY2Vzcy5mb2N1cyhsb2MpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gaWZFbHNlKG9wS2V5d29yZEtpbmRUb1NwZWNpYWxWYWx1ZUtpbmQodG9rZW4ua2luZCksXG5cdFx0XHRcdFx0XyA9PiBuZXcgU3BlY2lhbFZhbChsb2MsIF8pLFxuXHRcdFx0XHRcdCgpID0+IHVuZXhwZWN0ZWQodG9rZW4pKVxuXG5cdFx0fVxuXHRlbHNlIGlmICh0b2tlbiBpbnN0YW5jZW9mIERvdE5hbWUpXG5cdFx0c3dpdGNoICh0b2tlbi5uRG90cykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRyZXR1cm4gbmV3IE1lbWJlcih0b2tlbi5sb2MsIExvY2FsQWNjZXNzLnRoaXModG9rZW4ubG9jKSwgdG9rZW4ubmFtZSlcblx0XHRcdGNhc2UgMzpcblx0XHRcdFx0cmV0dXJuIG5ldyBTcGxhdChsb2MsIG5ldyBMb2NhbEFjY2Vzcyhsb2MsIHRva2VuLm5hbWUpKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dW5leHBlY3RlZCh0b2tlbilcblx0XHR9XG5cdGVsc2Vcblx0XHR1bmV4cGVjdGVkKHRva2VuKVxufVxuXG5jb25zdCBwYXJzZVNwYWNlZCA9IHRva2VucyA9PiB7XG5cdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpLCByZXN0ID0gdG9rZW5zLnRhaWwoKVxuXHRpZiAoaXNLZXl3b3JkKEtXX1R5cGUsIGgpKVxuXHRcdHJldHVybiBDYWxsLmNvbnRhaW5zKGgubG9jLCBwYXJzZVNwYWNlZChyZXN0KSwgTG9jYWxBY2Nlc3MuZm9jdXMoaC5sb2MpKVxuXHRlbHNlIGlmIChpc0tleXdvcmQoS1dfTGF6eSwgaCkpXG5cdFx0cmV0dXJuIG5ldyBMYXp5KGgubG9jLCBwYXJzZVNwYWNlZChyZXN0KSlcblx0ZWxzZSBpZiAoaXNLZXl3b3JkKEtXX1N1cGVyVmFsLCBoKSkge1xuXHRcdC8vIFRPRE86IGhhbmRsZSBzdWIgaGVyZSBhcyB3ZWxsXG5cdFx0Y29uc3QgaDIgPSByZXN0LmhlYWQoKVxuXHRcdGlmIChoMiBpbnN0YW5jZW9mIERvdE5hbWUpIHtcblx0XHRcdGNvbnRleHQuY2hlY2soaDIubkRvdHMgPT09IDEsIGgyLmxvYywgJ1RvbyBtYW55IGRvdHMhJylcblx0XHRcdGNvbnN0IHggPSBuZXcgU3VwZXJNZW1iZXIoaDIubG9jLCBoMi5uYW1lKVxuXHRcdFx0cmV0dXJuIF9wYXJzZVNwYWNlZEZvbGQoeCwgcmVzdC50YWlsKCkpXG5cdFx0fSBlbHNlIGlmIChpc0dyb3VwKEdfUGFyZW50aGVzaXMsIGgyKSAmJiBTbGljZS5ncm91cChoMikuaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCB4ID0gbmV3IFN1cGVyQ2FsbChoMi5sb2MsIFtdKVxuXHRcdFx0cmV0dXJuIF9wYXJzZVNwYWNlZEZvbGQoeCwgcmVzdC50YWlsKCkpXG5cdFx0fSBlbHNlXG5cdFx0XHRjb250ZXh0LmZhaWwoYEV4cGVjdGVkICR7Y29kZSgnLicpfSBvciAke2NvZGUoJygpJyl9IGFmdGVyICR7Y29kZSgnc3VwZXInKX1gKVxuXHR9IGVsc2Vcblx0XHRyZXR1cm4gX3BhcnNlU3BhY2VkRm9sZChwYXJzZVNpbmdsZShoKSwgcmVzdClcbn1cbmNvbnN0IF9wYXJzZVNwYWNlZEZvbGQgPSAoc3RhcnQsIHJlc3QpID0+IHtcblx0bGV0IGFjYyA9IHN0YXJ0XG5cdGZvciAobGV0IGkgPSByZXN0LnN0YXJ0OyBpIDwgcmVzdC5lbmQ7IGkgPSBpICsgMSkge1xuXHRcdGNvbnN0IHRva2VuID0gcmVzdC50b2tlbnNbaV1cblx0XHRjb25zdCBsb2MgPSB0b2tlbi5sb2Ncblx0XHRpZiAodG9rZW4gaW5zdGFuY2VvZiBEb3ROYW1lKSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKHRva2VuLm5Eb3RzID09PSAxLCB0b2tlbi5sb2MsICdUb28gbWFueSBkb3RzIScpXG5cdFx0XHRhY2MgPSBuZXcgTWVtYmVyKHRva2VuLmxvYywgYWNjLCB0b2tlbi5uYW1lKVxuXHRcdFx0Y29udGludWVcblx0XHR9XG5cdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRcdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdFx0XHRjYXNlIEtXX0ZvY3VzOlxuXHRcdFx0XHRcdGFjYyA9IG5ldyBDYWxsKHRva2VuLmxvYywgYWNjLCBbTG9jYWxBY2Nlc3MuZm9jdXMobG9jKV0pXG5cdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0Y2FzZSBLV19UeXBlOiB7XG5cdFx0XHRcdFx0Y29uc3QgdHlwZSA9IHBhcnNlU3BhY2VkKHJlc3QuX2Nob3BTdGFydChpICsgMSkpXG5cdFx0XHRcdFx0cmV0dXJuIENhbGwuY29udGFpbnModG9rZW4ubG9jLCB0eXBlLCBhY2MpXG5cdFx0XHRcdH1cblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdH1cblx0XHRpZiAodG9rZW4gaW5zdGFuY2VvZiBHcm91cCkge1xuXHRcdFx0Y29uc3Qgc2xpY2UgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRcdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdFx0XHRjYXNlIEdfQnJhY2tldDpcblx0XHRcdFx0XHRhY2MgPSBDYWxsLnN1Yihsb2MsIGNhdChhY2MsIHBhcnNlRXhwclBhcnRzKHNsaWNlKSkpXG5cdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0Y2FzZSBHX1BhcmVudGhlc2lzOlxuXHRcdFx0XHRcdGNoZWNrRW1wdHkoc2xpY2UsICgpID0+XG5cdFx0XHRcdFx0XHRgVXNlICR7Y29kZSgnKGEgYiknKX0sIG5vdCAke2NvZGUoJ2EoYiknKX1gKVxuXHRcdFx0XHRcdGFjYyA9IG5ldyBDYWxsKGxvYywgYWNjLCBbXSlcblx0XHRcdFx0XHRjb250aW51ZVxuXHRcdFx0XHRjYXNlIEdfUXVvdGU6XG5cdFx0XHRcdFx0YWNjID0gbmV3IFF1b3RlVGVtcGxhdGUobG9jLCBhY2MsIHBhcnNlUXVvdGUoc2xpY2UpKVxuXHRcdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNvbnRleHQuZmFpbCh0b2tlbi5sb2MsIGBFeHBlY3RlZCBtZW1iZXIgb3Igc3ViLCBub3QgJHt0b2tlbn1gKVxuXHR9XG5cdHJldHVybiBhY2Ncbn1cblxuY29uc3QgdHJ5UGFyc2VJbXBvcnRzID0gKGltcG9ydEtleXdvcmRLaW5kLCB0b2tlbnMpID0+IHtcblx0aWYgKCF0b2tlbnMuaXNFbXB0eSgpKSB7XG5cdFx0Y29uc3QgbGluZTAgPSB0b2tlbnMuaGVhZFNsaWNlKClcblx0XHRpZiAoaXNLZXl3b3JkKGltcG9ydEtleXdvcmRLaW5kLCBsaW5lMC5oZWFkKCkpKSB7XG5cdFx0XHRjb25zdCB7aW1wb3J0cywgb3BJbXBvcnRHbG9iYWx9ID0gX3BhcnNlSW1wb3J0cyhpbXBvcnRLZXl3b3JkS2luZCwgbGluZTAudGFpbCgpKVxuXHRcdFx0aWYgKGltcG9ydEtleXdvcmRLaW5kICE9PSBLV19JbXBvcnQpXG5cdFx0XHRcdGNvbnRleHQuY2hlY2sob3BJbXBvcnRHbG9iYWwgPT09IG51bGwsIGxpbmUwLmxvYywgJ0NhblxcJ3QgdXNlIGdsb2JhbCBoZXJlLicpXG5cdFx0XHRyZXR1cm4ge2ltcG9ydHMsIG9wSW1wb3J0R2xvYmFsLCByZXN0OiB0b2tlbnMudGFpbCgpfVxuXHRcdH1cblx0fVxuXHRyZXR1cm4ge2ltcG9ydHM6IFtdLCBvcEltcG9ydEdsb2JhbDogbnVsbCwgcmVzdDogdG9rZW5zfVxufVxuXG4vLyB0cnlQYXJzZUltcG9ydHMgcHJpdmF0ZXNcbmNvbnN0XG5cdF9wYXJzZUltcG9ydHMgPSAoaW1wb3J0S2V5d29yZEtpbmQsIHRva2VucykgPT4ge1xuXHRcdGNvbnN0IGxpbmVzID0ganVzdEJsb2NrKGltcG9ydEtleXdvcmRLaW5kLCB0b2tlbnMpXG5cdFx0bGV0IG9wSW1wb3J0R2xvYmFsID0gbnVsbFxuXG5cdFx0Y29uc3QgaW1wb3J0cyA9IFtdXG5cblx0XHRmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMuc2xpY2VzKCkpIHtcblx0XHRcdGNvbnN0IHtwYXRoLCBuYW1lfSA9IF9wYXJzZVJlcXVpcmUobGluZS5oZWFkKCkpXG5cdFx0XHRpZiAoaW1wb3J0S2V5d29yZEtpbmQgPT09IEtXX0ltcG9ydERvKSB7XG5cdFx0XHRcdGlmIChsaW5lLnNpemUoKSA+IDEpXG5cdFx0XHRcdFx0dW5leHBlY3RlZChsaW5lLnNlY29uZCgpKVxuXHRcdFx0XHRpbXBvcnRzLnB1c2gobmV3IEltcG9ydERvKGxpbmUubG9jLCBwYXRoKSlcblx0XHRcdH0gZWxzZVxuXHRcdFx0XHRpZiAocGF0aCA9PT0gJ2dsb2JhbCcpIHtcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKG9wSW1wb3J0R2xvYmFsID09PSBudWxsLCBsaW5lLmxvYywgJ0NhblxcJ3QgdXNlIGdsb2JhbCB0d2ljZScpXG5cdFx0XHRcdFx0Y29uc3Qge2ltcG9ydGVkLCBvcEltcG9ydERlZmF1bHR9ID1cblx0XHRcdFx0XHRcdF9wYXJzZVRoaW5nc0ltcG9ydGVkKG5hbWUsIGZhbHNlLCBsaW5lLnRhaWwoKSlcblx0XHRcdFx0XHRvcEltcG9ydEdsb2JhbCA9IG5ldyBJbXBvcnRHbG9iYWwobGluZS5sb2MsIGltcG9ydGVkLCBvcEltcG9ydERlZmF1bHQpXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3QgaXNMYXp5ID1cblx0XHRcdFx0XHRcdGltcG9ydEtleXdvcmRLaW5kID09PSBLV19JbXBvcnRMYXp5IHx8IGltcG9ydEtleXdvcmRLaW5kID09PSBLV19JbXBvcnREZWJ1Z1xuXHRcdFx0XHRcdGNvbnN0IHtpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0fSA9XG5cdFx0XHRcdFx0XHRfcGFyc2VUaGluZ3NJbXBvcnRlZChuYW1lLCBpc0xhenksIGxpbmUudGFpbCgpKVxuXHRcdFx0XHRcdGltcG9ydHMucHVzaChuZXcgSW1wb3J0KGxpbmUubG9jLCBwYXRoLCBpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0KSlcblx0XHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7aW1wb3J0cywgb3BJbXBvcnRHbG9iYWx9XG5cdH0sXG5cdF9wYXJzZVRoaW5nc0ltcG9ydGVkID0gKG5hbWUsIGlzTGF6eSwgdG9rZW5zKSA9PiB7XG5cdFx0Y29uc3QgaW1wb3J0RGVmYXVsdCA9ICgpID0+XG5cdFx0XHRMb2NhbERlY2xhcmUudW50eXBlZCh0b2tlbnMubG9jLCBuYW1lLCBpc0xhenkgPyBMRF9MYXp5IDogTERfQ29uc3QpXG5cdFx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0XHRyZXR1cm4ge2ltcG9ydGVkOiBbXSwgb3BJbXBvcnREZWZhdWx0OiBpbXBvcnREZWZhdWx0KCl9XG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBbb3BJbXBvcnREZWZhdWx0LCByZXN0XSA9IGlzS2V5d29yZChLV19Gb2N1cywgdG9rZW5zLmhlYWQoKSkgP1xuXHRcdFx0XHRbaW1wb3J0RGVmYXVsdCgpLCB0b2tlbnMudGFpbCgpXSA6XG5cdFx0XHRcdFtudWxsLCB0b2tlbnNdXG5cdFx0XHRjb25zdCBpbXBvcnRlZCA9IHBhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcyhyZXN0KS5tYXAobCA9PiB7XG5cdFx0XHRcdGNvbnRleHQuY2hlY2sobC5uYW1lICE9PSAnXycsIGwucG9zLFxuXHRcdFx0XHRcdCgpID0+IGAke2NvZGUoJ18nKX0gbm90IGFsbG93ZWQgYXMgaW1wb3J0IG5hbWUuYClcblx0XHRcdFx0aWYgKGlzTGF6eSlcblx0XHRcdFx0XHRsLmtpbmQgPSBMRF9MYXp5XG5cdFx0XHRcdHJldHVybiBsXG5cdFx0XHR9KVxuXHRcdFx0cmV0dXJuIHtpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0fVxuXHRcdH1cblx0fSxcblx0X3BhcnNlUmVxdWlyZSA9IHQgPT4ge1xuXHRcdGlmICh0IGluc3RhbmNlb2YgTmFtZSlcblx0XHRcdHJldHVybiB7cGF0aDogdC5uYW1lLCBuYW1lOiB0Lm5hbWV9XG5cdFx0ZWxzZSBpZiAodCBpbnN0YW5jZW9mIERvdE5hbWUpXG5cdFx0XHRyZXR1cm4ge3BhdGg6IGNhdChfcGFydHNGcm9tRG90TmFtZSh0KSwgdC5uYW1lKS5qb2luKCcvJyksIG5hbWU6IHQubmFtZX1cblx0XHRlbHNlIHtcblx0XHRcdGNvbnRleHQuY2hlY2soaXNHcm91cChHX1NwYWNlLCB0KSwgdC5sb2MsICdOb3QgYSB2YWxpZCBtb2R1bGUgbmFtZS4nKVxuXHRcdFx0cmV0dXJuIF9wYXJzZVNwYWNlZFJlcXVpcmUoU2xpY2UuZ3JvdXAodCkpXG5cdFx0fVxuXHR9LFxuXHRfcGFyc2VTcGFjZWRSZXF1aXJlID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBmaXJzdCA9IHRva2Vucy5oZWFkKClcblx0XHRsZXQgcGFydHNcblx0XHRpZiAoZmlyc3QgaW5zdGFuY2VvZiBEb3ROYW1lKVxuXHRcdFx0cGFydHMgPSBfcGFydHNGcm9tRG90TmFtZShmaXJzdClcblx0XHRlbHNlIHtcblx0XHRcdGNvbnRleHQuY2hlY2soZmlyc3QgaW5zdGFuY2VvZiBOYW1lLCBmaXJzdC5sb2MsICdOb3QgYSB2YWxpZCBwYXJ0IG9mIG1vZHVsZSBwYXRoLicpXG5cdFx0XHRwYXJ0cyA9IFtdXG5cdFx0fVxuXHRcdHBhcnRzLnB1c2goZmlyc3QubmFtZSlcblx0XHRmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucy50YWlsKCkpIHtcblx0XHRcdGNvbnRleHQuY2hlY2sodG9rZW4gaW5zdGFuY2VvZiBEb3ROYW1lICYmIHRva2VuLm5Eb3RzID09PSAxLCB0b2tlbi5sb2MsXG5cdFx0XHRcdCdOb3QgYSB2YWxpZCBwYXJ0IG9mIG1vZHVsZSBwYXRoLicpXG5cdFx0XHRwYXJ0cy5wdXNoKHRva2VuLm5hbWUpXG5cdFx0fVxuXHRcdHJldHVybiB7cGF0aDogcGFydHMuam9pbignLycpLCBuYW1lOiB0b2tlbnMubGFzdCgpLm5hbWV9XG5cdH0sXG5cdF9wYXJ0c0Zyb21Eb3ROYW1lID0gZG90TmFtZSA9PlxuXHRcdGRvdE5hbWUubkRvdHMgPT09IDEgPyBbJy4nXSA6IHJlcGVhdCgnLi4nLCBkb3ROYW1lLm5Eb3RzIC0gMSlcblxuY29uc3Rcblx0X3BhcnNlRm9yID0gY3RyID0+IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRcdHJldHVybiBuZXcgY3RyKHRva2Vucy5sb2MsIF9wYXJzZU9wSXRlcmF0ZWUoYmVmb3JlKSwgcGFyc2VCbG9ja0RvKGJsb2NrKSlcblx0fSxcblx0X3BhcnNlT3BJdGVyYXRlZSA9IHRva2VucyA9PlxuXHRcdG9wSWYoIXRva2Vucy5pc0VtcHR5KCksICgpID0+IHtcblx0XHRcdGNvbnN0IFtlbGVtZW50LCBiYWddID1cblx0XHRcdFx0aWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZVdoZXJlKF8gPT4gaXNLZXl3b3JkKEtXX0luLCBfKSksXG5cdFx0XHRcdFx0KHtiZWZvcmUsIGFmdGVyfSkgPT4ge1xuXHRcdFx0XHRcdFx0Y29udGV4dC5jaGVjayhiZWZvcmUuc2l6ZSgpID09PSAxLCBiZWZvcmUubG9jLCAnVE9ETzogcGF0dGVybiBpbiBmb3InKVxuXHRcdFx0XHRcdFx0cmV0dXJuIFtwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMoYmVmb3JlKVswXSwgcGFyc2VFeHByKGFmdGVyKV1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdCgpID0+IFtuZXcgTG9jYWxEZWNsYXJlRm9jdXModG9rZW5zLmxvYyksIHBhcnNlRXhwcih0b2tlbnMpXSlcblx0XHRcdHJldHVybiBuZXcgSXRlcmF0ZWUodG9rZW5zLmxvYywgZWxlbWVudCwgYmFnKVxuXHRcdH0pXG5jb25zdFxuXHRwYXJzZUZvckRvID0gX3BhcnNlRm9yKEZvckRvKSxcblx0cGFyc2VGb3JWYWwgPSBfcGFyc2VGb3IoRm9yVmFsKSxcblx0Ly8gVE9ETzogLT4gb3V0LXR5cGVcblx0cGFyc2VGb3JCYWcgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IFtiZWZvcmUsIGxpbmVzXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0XHRjb25zdCBibG9jayA9IHBhcnNlQmxvY2tEbyhsaW5lcylcblx0XHQvLyBUT0RPOiBCZXR0ZXIgd2F5P1xuXHRcdGlmIChibG9jay5saW5lcy5sZW5ndGggPT09IDEgJiYgYmxvY2subGluZXNbMF0gaW5zdGFuY2VvZiBWYWwpXG5cdFx0XHRibG9jay5saW5lc1swXSA9IG5ldyBCYWdFbnRyeShibG9jay5saW5lc1swXS5sb2MsIGJsb2NrLmxpbmVzWzBdKVxuXHRcdHJldHVybiBuZXcgRm9yQmFnKHRva2Vucy5sb2MsIF9wYXJzZU9wSXRlcmF0ZWUoYmVmb3JlKSwgYmxvY2spXG5cdH1cblxuXG5jb25zdFxuXHRwYXJzZUV4Y2VwdCA9IChrd0V4Y2VwdCwgdG9rZW5zKSA9PiB7XG5cdFx0Y29uc3Rcblx0XHRcdGlzVmFsID0ga3dFeGNlcHQgPT09IEtXX0V4Y2VwdFZhbCxcblx0XHRcdGp1c3REb1ZhbEJsb2NrID0gaXNWYWwgPyBqdXN0QmxvY2tWYWwgOiBqdXN0QmxvY2tEbyxcblx0XHRcdHBhcnNlQmxvY2sgPSBpc1ZhbCA/IHBhcnNlQmxvY2tWYWwgOiBwYXJzZUJsb2NrRG8sXG5cdFx0XHRFeGNlcHQgPSBpc1ZhbCA/IEV4Y2VwdFZhbCA6IEV4Y2VwdERvLFxuXHRcdFx0a3dUcnkgPSBpc1ZhbCA/IEtXX1RyeVZhbCA6IEtXX1RyeURvLFxuXHRcdFx0a3dDYXRjaCA9IGlzVmFsID8gS1dfQ2F0Y2hWYWwgOiBLV19DYXRjaERvLFxuXHRcdFx0bmFtZVRyeSA9ICgpID0+IGNvZGUoa2V5d29yZE5hbWUoa3dUcnkpKSxcblx0XHRcdG5hbWVDYXRjaCA9ICgpID0+IGNvZGUoa2V5d29yZE5hbWUoa3dDYXRjaCkpLFxuXHRcdFx0bmFtZUZpbmFsbHkgPSAoKSA9PiBjb2RlKGtleXdvcmROYW1lKEtXX0ZpbmFsbHkpKVxuXG5cdFx0Y29uc3QgbGluZXMgPSBqdXN0QmxvY2soa3dFeGNlcHQsIHRva2VucylcblxuXHRcdC8vIGB0cnlgICptdXN0KiBjb21lIGZpcnN0LlxuXHRcdGNvbnN0IGZpcnN0TGluZSA9IGxpbmVzLmhlYWRTbGljZSgpXG5cdFx0Y29uc3QgdG9rZW5UcnkgPSBmaXJzdExpbmUuaGVhZCgpXG5cdFx0Y29udGV4dC5jaGVjayhpc0tleXdvcmQoa3dUcnksIHRva2VuVHJ5KSwgdG9rZW5UcnkubG9jLCAoKSA9PlxuXHRcdFx0YE11c3Qgc3RhcnQgd2l0aCAke25hbWVUcnkoKX1gKVxuXHRcdGNvbnN0IF90cnkgPSBqdXN0RG9WYWxCbG9jayhrd1RyeSwgZmlyc3RMaW5lLnRhaWwoKSlcblxuXHRcdGNvbnN0IHJlc3RMaW5lcyA9IGxpbmVzLnRhaWwoKVxuXHRcdGNoZWNrTm9uRW1wdHkocmVzdExpbmVzLCAoKSA9PlxuXHRcdFx0YE11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgb2YgJHtuYW1lQ2F0Y2goKX0gb3IgJHtuYW1lRmluYWxseSgpfWApXG5cblx0XHRjb25zdCBoYW5kbGVGaW5hbGx5ID0gcmVzdExpbmVzID0+IHtcblx0XHRcdGNvbnN0IGxpbmUgPSByZXN0TGluZXMuaGVhZFNsaWNlKClcblx0XHRcdGNvbnN0IHRva2VuRmluYWxseSA9IGxpbmUuaGVhZCgpXG5cdFx0XHRjb250ZXh0LmNoZWNrKGlzS2V5d29yZChLV19GaW5hbGx5LCB0b2tlbkZpbmFsbHkpLCB0b2tlbkZpbmFsbHkubG9jLCAoKSA9PlxuXHRcdFx0XHRgRXhwZWN0ZWQgJHtuYW1lRmluYWxseSgpfWApXG5cdFx0XHRjb250ZXh0LmNoZWNrKHJlc3RMaW5lcy5zaXplKCkgPT09IDEsIHJlc3RMaW5lcy5sb2MsICgpID0+XG5cdFx0XHRcdGBOb3RoaW5nIGlzIGFsbG93ZWQgdG8gY29tZSBhZnRlciAke25hbWVGaW5hbGx5KCl9LmApXG5cdFx0XHRyZXR1cm4ganVzdEJsb2NrRG8oS1dfRmluYWxseSwgbGluZS50YWlsKCkpXG5cdFx0fVxuXG5cdFx0bGV0IF9jYXRjaCwgX2ZpbmFsbHlcblxuXHRcdGNvbnN0IGxpbmUyID0gcmVzdExpbmVzLmhlYWRTbGljZSgpXG5cdFx0Y29uc3QgaGVhZDIgPSBsaW5lMi5oZWFkKClcblx0XHRpZiAoaXNLZXl3b3JkKGt3Q2F0Y2gsIGhlYWQyKSkge1xuXHRcdFx0Y29uc3QgW2JlZm9yZTIsIGJsb2NrMl0gPSBiZWZvcmVBbmRCbG9jayhsaW5lMi50YWlsKCkpXG5cdFx0XHRjb25zdCBjYXVnaHQgPSBfcGFyc2VPbmVMb2NhbERlY2xhcmVPckZvY3VzKGJlZm9yZTIpXG5cdFx0XHRfY2F0Y2ggPSBuZXcgQ2F0Y2gobGluZTIubG9jLCBjYXVnaHQsIHBhcnNlQmxvY2soYmxvY2syKSlcblx0XHRcdF9maW5hbGx5ID0gb3BJZihyZXN0TGluZXMuc2l6ZSgpID4gMSwgKCkgPT4gaGFuZGxlRmluYWxseShyZXN0TGluZXMudGFpbCgpKSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0X2NhdGNoID0gbnVsbFxuXHRcdFx0X2ZpbmFsbHkgPSBoYW5kbGVGaW5hbGx5KHJlc3RMaW5lcylcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3IEV4Y2VwdCh0b2tlbnMubG9jLCBfdHJ5LCBfY2F0Y2gsIF9maW5hbGx5KVxuXHR9LFxuXHRfcGFyc2VPbmVMb2NhbERlY2xhcmVPckZvY3VzID0gdG9rZW5zID0+IHtcblx0XHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRcdHJldHVybiBuZXcgTG9jYWxEZWNsYXJlRm9jdXModG9rZW5zLmxvYylcblx0XHRlbHNlIHtcblx0XHRcdGNvbnRleHQuY2hlY2sodG9rZW5zLnNpemUoKSA9PT0gMSwgJ0V4cGVjdGVkIG9ubHkgb25lIGxvY2FsIGRlY2xhcmUuJylcblx0XHRcdHJldHVybiBwYXJzZUxvY2FsRGVjbGFyZXModG9rZW5zKVswXVxuXHRcdH1cblx0fVxuXG5jb25zdCBwYXJzZUFzc2VydCA9IChuZWdhdGUsIHRva2VucykgPT4ge1xuXHRjaGVja05vbkVtcHR5KHRva2VucywgKCkgPT4gYEV4cGVjdGVkIHNvbWV0aGluZyBhZnRlciAke2tleXdvcmROYW1lKEtXX0Fzc2VydCl9LmApXG5cblx0Y29uc3QgW2NvbmRUb2tlbnMsIG9wVGhyb3duXSA9XG5cdFx0aWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZVdoZXJlKF8gPT4gaXNLZXl3b3JkKEtXX1Rocm93LCBfKSksXG5cdFx0XHQoe2JlZm9yZSwgYWZ0ZXJ9KSA9PiBbYmVmb3JlLCBwYXJzZUV4cHIoYWZ0ZXIpXSxcblx0XHRcdCgpID0+IFt0b2tlbnMsIG51bGxdKVxuXG5cdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHMoY29uZFRva2Vucylcblx0Y29uc3QgY29uZCA9IHBhcnRzLmxlbmd0aCA9PT0gMSA/IHBhcnRzWzBdIDogbmV3IENhbGwoY29uZFRva2Vucy5sb2MsIHBhcnRzWzBdLCB0YWlsKHBhcnRzKSlcblx0cmV0dXJuIG5ldyBBc3NlcnQodG9rZW5zLmxvYywgbmVnYXRlLCBjb25kLCBvcFRocm93bilcbn1cblxuY29uc3QgcGFyc2VDbGFzcyA9IHRva2VucyA9PiB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0Y29uc3Qgb3BFeHRlbmRlZCA9IG9wSWYoIWJlZm9yZS5pc0VtcHR5KCksICgpID0+IHBhcnNlRXhwcihiZWZvcmUpKVxuXG5cdGxldCBvcERvID0gbnVsbCwgc3RhdGljcyA9IFtdLCBvcENvbnN0cnVjdG9yID0gbnVsbCwgbWV0aG9kcyA9IFtdXG5cblx0bGV0IFtvcENvbW1lbnQsIHJlc3RdID0gdHJ5VGFrZUNvbW1lbnQoYmxvY2spXG5cblx0Y29uc3QgbGluZTEgPSByZXN0LmhlYWRTbGljZSgpXG5cdGlmIChpc0tleXdvcmQoS1dfRG8sIGxpbmUxLmhlYWQoKSkpIHtcblx0XHRjb25zdCBkb25lID0ganVzdEJsb2NrRG8oS1dfRG8sIGxpbmUxLnRhaWwoKSlcblx0XHRvcERvID0gbmV3IENsYXNzRG8obGluZTEubG9jLCBuZXcgTG9jYWxEZWNsYXJlRm9jdXMobGluZTEubG9jKSwgZG9uZSlcblx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0fVxuXHRpZiAoIXJlc3QuaXNFbXB0eSgpKSB7XG5cdFx0Y29uc3QgbGluZTIgPSByZXN0LmhlYWRTbGljZSgpXG5cdFx0aWYgKGlzS2V5d29yZChLV19TdGF0aWMsIGxpbmUyLmhlYWQoKSkpIHtcblx0XHRcdHN0YXRpY3MgPSBfcGFyc2VTdGF0aWNzKGxpbmUyLnRhaWwoKSlcblx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdH1cblx0XHRpZiAoIXJlc3QuaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCBsaW5lMyA9IHJlc3QuaGVhZFNsaWNlKClcblx0XHRcdGlmIChpc0tleXdvcmQoS1dfQ29uc3RydWN0LCBsaW5lMy5oZWFkKCkpKSB7XG5cdFx0XHRcdG9wQ29uc3RydWN0b3IgPSBfcGFyc2VDb25zdHJ1Y3RvcihsaW5lMy50YWlsKCkpXG5cdFx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdFx0fVxuXHRcdFx0bWV0aG9kcyA9IF9wYXJzZU1ldGhvZHMocmVzdClcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gbmV3IENsYXNzKHRva2Vucy5sb2MsIG9wRXh0ZW5kZWQsIG9wQ29tbWVudCwgb3BEbywgc3RhdGljcywgb3BDb25zdHJ1Y3RvciwgbWV0aG9kcylcbn1cblxuY29uc3Rcblx0X3BhcnNlQ29uc3RydWN0b3IgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IHthcmdzLCBtZW1iZXJBcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBvcEluLCBvcE91dH0gPVxuXHRcdFx0X2Z1bkFyZ3NBbmRCbG9jayh0cnVlLCB0b2tlbnMsIHRydWUpXG5cdFx0Y29uc3QgaXNHZW5lcmF0b3IgPSBmYWxzZSwgb3BEZWNsYXJlUmVzID0gbnVsbFxuXHRcdGNvbnN0IGZ1biA9IG5ldyBGdW4odG9rZW5zLmxvYyxcblx0XHRcdG5ldyBMb2NhbERlY2xhcmVUaGlzKHRva2Vucy5sb2MpLFxuXHRcdFx0aXNHZW5lcmF0b3IsXG5cdFx0XHRhcmdzLCBvcFJlc3RBcmcsXG5cdFx0XHRibG9jaywgb3BJbiwgb3BEZWNsYXJlUmVzLCBvcE91dClcblx0XHRyZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRva2Vucy5sb2MsIGZ1biwgbWVtYmVyQXJncylcblx0fSxcblx0X3BhcnNlU3RhdGljcyA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgYmxvY2sgPSBqdXN0QmxvY2soS1dfU3RhdGljLCB0b2tlbnMpXG5cdFx0cmV0dXJuIF9wYXJzZU1ldGhvZHMoYmxvY2spXG5cdH0sXG5cdF9wYXJzZU1ldGhvZHMgPSB0b2tlbnMgPT4gdG9rZW5zLm1hcFNsaWNlcyhfcGFyc2VNZXRob2QpLFxuXHRfcGFyc2VNZXRob2QgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGhlYWQgPSB0b2tlbnMuaGVhZCgpXG5cblx0XHRpZiAoaXNLZXl3b3JkKEtXX0dldCwgaGVhZCkpIHtcblx0XHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucy50YWlsKCkpXG5cdFx0XHRyZXR1cm4gbmV3IE1ldGhvZEdldHRlcih0b2tlbnMubG9jLCBfcGFyc2VFeHByT3JTdHJMaXQoYmVmb3JlKSwgcGFyc2VCbG9ja1ZhbChibG9jaykpXG5cdFx0fSBlbHNlIGlmIChpc0tleXdvcmQoS1dfU2V0LCBoZWFkKSkge1xuXHRcdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zLnRhaWwoKSlcblx0XHRcdHJldHVybiBuZXcgTWV0aG9kU2V0dGVyKHRva2Vucy5sb2MsIF9wYXJzZUV4cHJPclN0ckxpdChiZWZvcmUpLCBwYXJzZUJsb2NrRG8oYmxvY2spKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBiYWEgPSB0b2tlbnMub3BTcGxpdE9uY2VXaGVyZShfaXNGdW5LZXl3b3JkKVxuXHRcdFx0Y29udGV4dC5jaGVjayhiYWEgIT09IG51bGwsIHRva2Vucy5sb2MsICdFeHBlY3RlZCBhIGZ1bmN0aW9uIGtleXdvcmQgc29tZXdoZXJlLicpXG5cdFx0XHRjb25zdCB7YmVmb3JlLCBhdCwgYWZ0ZXJ9ID0gYmFhXG5cdFx0XHRjb25zdCBmdW4gPSBwYXJzZUZ1bihfbWV0aG9kRnVuS2luZChhdCksIGFmdGVyKVxuXHRcdFx0cmV0dXJuIG5ldyBNZXRob2RJbXBsKHRva2Vucy5sb2MsIF9wYXJzZUV4cHJPclN0ckxpdChiZWZvcmUpLCBmdW4pXG5cdFx0fVxuXHR9LFxuXHQvLyBJZiBzeW1ib2wgaXMganVzdCBhIGxpdGVyYWwgc3RyaW5nLCBzdG9yZSBpdCBhcyBhIHN0cmluZywgd2hpY2ggaXMgaGFuZGxlZCBzcGVjaWFsbHkuXG5cdF9wYXJzZUV4cHJPclN0ckxpdCA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgZXhwciA9IHBhcnNlRXhwcih0b2tlbnMpXG5cdFx0Y29uc3QgaXNTdHJMaXQgPSBleHByIGluc3RhbmNlb2YgUXVvdGUgJiZcblx0XHRcdGV4cHIucGFydHMubGVuZ3RoID09PSAxICYmXG5cdFx0XHR0eXBlb2YgZXhwci5wYXJ0c1swXSA9PT0gJ3N0cmluZydcblx0XHRyZXR1cm4gaXNTdHJMaXQgPyBleHByLnBhcnRzWzBdIDogZXhwclxuXHR9LFxuXHRfbWV0aG9kRnVuS2luZCA9IGZ1bktpbmRUb2tlbiA9PiB7XG5cdFx0c3dpdGNoIChmdW5LaW5kVG9rZW4ua2luZCkge1xuXHRcdFx0Y2FzZSBLV19GdW46IHJldHVybiBLV19GdW5UaGlzXG5cdFx0XHRjYXNlIEtXX0Z1bkRvOiByZXR1cm4gS1dfRnVuVGhpc0RvXG5cdFx0XHRjYXNlIEtXX0Z1bkdlbjogcmV0dXJuIEtXX0Z1blRoaXNHZW5cblx0XHRcdGNhc2UgS1dfRnVuR2VuRG86IHJldHVybiBLV19GdW5UaGlzR2VuRG9cblx0XHRcdGNhc2UgS1dfRnVuVGhpczogY2FzZSBLV19GdW5UaGlzRG86IGNhc2UgS1dfRnVuVGhpc0dlbjogY2FzZSBLV19GdW5UaGlzR2VuRG86XG5cdFx0XHRcdGNvbnRleHQuZmFpbChmdW5LaW5kVG9rZW4ubG9jLCAnRnVuY3Rpb24gYC5gIGlzIGltcGxpY2l0IGZvciBtZXRob2RzLicpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRjb250ZXh0LmZhaWwoZnVuS2luZFRva2VuLmxvYywgYEV4cGVjdGVkIGZ1bmN0aW9uIGtpbmQsIGdvdCAke2Z1bktpbmRUb2tlbn1gKVxuXHRcdH1cblx0fSxcblx0X2lzRnVuS2V5d29yZCA9IGZ1bktpbmRUb2tlbiA9PiB7XG5cdFx0aWYgKGZ1bktpbmRUb2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0XHRzd2l0Y2ggKGZ1bktpbmRUb2tlbi5raW5kKSB7XG5cdFx0XHRcdGNhc2UgS1dfRnVuOiBjYXNlIEtXX0Z1bkRvOiBjYXNlIEtXX0Z1bkdlbjogY2FzZSBLV19GdW5HZW5Ebzpcblx0XHRcdFx0Y2FzZSBLV19GdW5UaGlzOiBjYXNlIEtXX0Z1blRoaXNEbzogY2FzZSBLV19GdW5UaGlzR2VuOlxuXHRcdFx0XHRjYXNlIEtXX0Z1blRoaXNHZW5Ebzpcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0fVxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBmYWxzZVxuXHR9XG5cbmNvbnN0IHBhcnNlUXVvdGUgPSB0b2tlbnMgPT5cblx0bmV3IFF1b3RlKHRva2Vucy5sb2MsIHRva2Vucy5tYXAoXyA9PiB0eXBlb2YgXyA9PT0gJ3N0cmluZycgPyBfIDogcGFyc2VTaW5nbGUoXykpKVxuXG5jb25zdCBwYXJzZVdpdGggPSB0b2tlbnMgPT4ge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cblx0Y29uc3QgW3ZhbCwgZGVjbGFyZV0gPSBpZkVsc2UoYmVmb3JlLm9wU3BsaXRPbmNlV2hlcmUoXyA9PiBpc0tleXdvcmQoS1dfQXMsIF8pKSxcblx0XHQoe2JlZm9yZSwgYWZ0ZXJ9KSA9PiB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKGFmdGVyLnNpemUoKSA9PT0gMSwgKCkgPT4gYEV4cGVjdGVkIG9ubHkgMSB0b2tlbiBhZnRlciAke2NvZGUoJ2FzJyl9LmApXG5cdFx0XHRyZXR1cm4gW3BhcnNlRXhwclBsYWluKGJlZm9yZSksIHBhcnNlTG9jYWxEZWNsYXJlKGFmdGVyLmhlYWQoKSldXG5cdFx0fSxcblx0XHQoKSA9PiBbcGFyc2VFeHByUGxhaW4oYmVmb3JlKSwgbmV3IExvY2FsRGVjbGFyZUZvY3VzKHRva2Vucy5sb2MpXSlcblxuXHRyZXR1cm4gbmV3IFdpdGgodG9rZW5zLmxvYywgZGVjbGFyZSwgdmFsLCBwYXJzZUJsb2NrRG8oYmxvY2spKVxufVxuXG5jb25zdCBwYXJzZUlnbm9yZSA9IHRva2VucyA9PiB7XG5cdGNvbnN0IGlnbm9yZWQgPSB0b2tlbnMubWFwKF8gPT4ge1xuXHRcdGlmIChpc0tleXdvcmQoS1dfRm9jdXMsIF8pKVxuXHRcdFx0cmV0dXJuICdfJ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29udGV4dC5jaGVjayhfIGluc3RhbmNlb2YgTmFtZSwgXy5sb2MsICgpID0+IGBFeHBlY3RlZCBsb2NhbCBuYW1lLCBub3QgJHtffS5gKVxuXHRcdFx0cmV0dXJuIF8ubmFtZVxuXHRcdH1cblx0fSlcblx0cmV0dXJuIG5ldyBJZ25vcmUodG9rZW5zLmxvYywgaWdub3JlZClcbn1cblxuY29uc3QgcGFyc2VDb25kID0gdG9rZW5zID0+IHtcblx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyh0b2tlbnMpXG5cdGNvbnRleHQuY2hlY2socGFydHMubGVuZ3RoID09PSAzLCB0b2tlbnMubG9jLCAoKSA9PlxuXHRcdGAke2NvZGUoJ2NvbmQnKX0gdGFrZXMgZXhhY3RseSAzIGFyZ3VtZW50cy5gKVxuXHRyZXR1cm4gbmV3IENvbmQodG9rZW5zLmxvYywgcGFydHNbMF0sIHBhcnRzWzFdLCBwYXJ0c1syXSlcbn1cblxuY29uc3QgdHJ5VGFrZUNvbW1lbnQgPSBsaW5lcyA9PiB7XG5cdGxldCBjb21tZW50cyA9IFtdXG5cdGxldCByZXN0ID0gbGluZXNcblxuXHR3aGlsZSAodHJ1ZSkge1xuXHRcdGlmIChyZXN0LmlzRW1wdHkoKSlcblx0XHRcdGJyZWFrXG5cblx0XHRjb25zdCBocyA9IHJlc3QuaGVhZFNsaWNlKClcblx0XHRjb25zdCBoID0gaHMuaGVhZCgpXG5cdFx0aWYgKCEoaCBpbnN0YW5jZW9mIERvY0NvbW1lbnQpKVxuXHRcdFx0YnJlYWtcblxuXHRcdGFzc2VydChocy5zaXplKCkgPT09IDEpXG5cdFx0Y29tbWVudHMucHVzaChoKVxuXHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHR9XG5cblx0cmV0dXJuIFtpc0VtcHR5KGNvbW1lbnRzKSA/IG51bGwgOiBjb21tZW50cy5tYXAoXyA9PiBfLnRleHQpLmpvaW4oJ1xcbicpLCByZXN0XVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

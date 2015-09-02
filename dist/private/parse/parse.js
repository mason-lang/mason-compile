if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', 'esast/dist/Loc', '../../CompileError', '../language', '../MsAst', '../Token', '../util', './Slice'], function (exports, module, _esastDistLoc, _CompileError, _language, _MsAst, _Token, _util, _Slice) {
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

		var _tryParseUses2 = _slicedToArray(_tryParseUses, 2);

		const doUses = _tryParseUses2[0];
		const rest0 = _tryParseUses2[1];

		var _tryParseUses3 = tryParseUses(_Token.KW_Use, rest0);

		var _tryParseUses32 = _slicedToArray(_tryParseUses3, 2);

		const plainUses = _tryParseUses32[0];
		const rest1 = _tryParseUses32[1];

		var _tryParseUses4 = tryParseUses(_Token.KW_UseLazy, rest1);

		var _tryParseUses42 = _slicedToArray(_tryParseUses4, 2);

		const lazyUses = _tryParseUses42[0];
		const rest2 = _tryParseUses42[1];

		var _tryParseUses5 = tryParseUses(_Token.KW_UseDebug, rest2);

		var _tryParseUses52 = _slicedToArray(_tryParseUses5, 2);

		const debugUses = _tryParseUses52[0];
		const rest3 = _tryParseUses52[1];

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
		return new _MsAst.Module(tokens.loc, doUses, uses, debugUses, lines, exports, opDefaultExport);
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
		lineTokens.each(_ => addLine(parseLine(_Slice2.default.group(_))));
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

			const last = () => {
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
			}();
			return (0, _util.push)(before.map(parseSingle), last);
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
			context.check(!_language.JsGlobals.has(t.name), t.loc, () => `Can not shadow global ${ (0, _CompileError.code)(t.name) }`);
			return t.name;
		}
	};

	const parseSingle = token => {
		const loc = token.loc;

		return token instanceof _Token.Name ? _access(token.name, loc) : token instanceof _Token.Group ? () => {
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
		}() : token instanceof _MsAst.NumberLiteral ? token : token instanceof _Token.Keyword ? () => {
			switch (token.kind) {
				case _Token.KW_Focus:
					return _MsAst.LocalAccess.focus(loc);
				default:
					return (0, _util.ifElse)((0, _Token.opKeywordKindToSpecialValueKind)(token.kind), _ => new _MsAst.SpecialVal(loc, _), () => unexpected(token));

			}
		}() : token instanceof _Token.DotName ? token.nDots === 1 ? new _MsAst.Member(token.loc, _MsAst.LocalAccess.this(token.loc), token.name) : token.nDots === 3 ? new _MsAst.Splat(loc, new _MsAst.LocalAccess(loc, token.name)) : unexpected(token) : unexpected(token);
	};

	// parseSingle privates
	const _access = (name, loc) => _language.JsGlobals.has(name) ? new _MsAst.GlobalAccess(loc, name) : new _MsAst.LocalAccess(loc, name);

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

	const tryParseUses = (k, tokens) => {
		if (!tokens.isEmpty()) {
			const line0 = tokens.headSlice();
			if ((0, _Token.isKeyword)(k, line0.head())) return [_parseUses(k, line0.tail()), tokens.tail()];
		}
		return [[], tokens];
	};

	// tryParseUse privates
	const _parseUses = (useKeywordKind, tokens) => {
		var _beforeAndBlock10 = beforeAndBlock(tokens);

		var _beforeAndBlock102 = _slicedToArray(_beforeAndBlock10, 2);

		const before = _beforeAndBlock102[0];
		const lines = _beforeAndBlock102[1];

		checkEmpty(before, () => `Did not expect anything after ${ (0, _CompileError.code)(useKeywordKind) } other than a block`);
		return lines.mapSlices(line => {
			var _parseRequire2 = _parseRequire(line.head());

			const path = _parseRequire2.path;
			const name = _parseRequire2.name;

			if (useKeywordKind === _Token.KW_UseDo) {
				if (line.size() > 1) unexpected(line.second());
				return new _MsAst.UseDo(line.loc, path);
			} else {
				const isLazy = useKeywordKind === _Token.KW_UseLazy || useKeywordKind === _Token.KW_UseDebug;

				var _parseThingsUsed2 = _parseThingsUsed(name, isLazy, line.tail());

				const used = _parseThingsUsed2.used;
				const opUseDefault = _parseThingsUsed2.opUseDefault;

				return new _MsAst.Use(line.loc, path, used, opUseDefault);
			}
		});
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
			return _parseLocalRequire(_Slice2.default.group(t));
		}
	},
	      _parseLocalRequire = tokens => {
		const first = tokens.head();
		let parts;
		if (first instanceof _Token.DotName) parts = _partsFromDotName(first);else {
			context.check(first instanceof _Token.Name, first.loc, 'Not a valid part of module path.');
			parts = [];
		}
		parts.push(first.name);
		tokens.tail().each(token => {
			context.check(token instanceof _Token.DotName && token.nDots === 1, token.loc, 'Not a valid part of module path.');
			parts.push(token.name);
		});
		return { path: parts.join('/'), name: tokens.last().name };
	},
	      _partsFromDotName = dotName => dotName.nDots === 1 ? ['.'] : (0, _util.repeat)('..', dotName.nDots - 1);

	const _parseFor = ctr => tokens => {
		var _beforeAndBlock11 = beforeAndBlock(tokens);

		var _beforeAndBlock112 = _slicedToArray(_beforeAndBlock11, 2);

		const before = _beforeAndBlock112[0];
		const block = _beforeAndBlock112[1];

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
		var _beforeAndBlock12 = beforeAndBlock(tokens);

		var _beforeAndBlock122 = _slicedToArray(_beforeAndBlock12, 2);

		const before = _beforeAndBlock122[0];
		const lines = _beforeAndBlock122[1];

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
			var _beforeAndBlock13 = beforeAndBlock(line2.tail());

			var _beforeAndBlock132 = _slicedToArray(_beforeAndBlock13, 2);

			const before2 = _beforeAndBlock132[0];
			const block2 = _beforeAndBlock132[1];

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
		var _beforeAndBlock14 = beforeAndBlock(tokens);

		var _beforeAndBlock142 = _slicedToArray(_beforeAndBlock14, 2);

		const before = _beforeAndBlock142[0];
		const block = _beforeAndBlock142[1];

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
		var _beforeAndBlock15 = beforeAndBlock(tokens);

		var _beforeAndBlock152 = _slicedToArray(_beforeAndBlock15, 2);

		const before = _beforeAndBlock152[0];
		const block = _beforeAndBlock152[1];

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7QUMrQkEsS0FBSSxPQUFPLENBQUE7Ozs7Ozs7Ozs7Ozs7a0JBWUksQ0FBQyxRQUFRLEVBQUUsU0FBUyxLQUFLO0FBQ3ZDLFNBQU8sR0FBRyxRQUFRLENBQUE7QUFDbEIsWUFyQlEsTUFBTSxFQXFCUCxXQS9Cc0UsT0FBTyxTQUE1RCxPQUFPLEVBK0JQLFNBQVMsQ0FBQyxDQUFDLENBQUE7QUFDbkMsUUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLGdCQUFNLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBOztBQUVqRCxTQUFPLEdBQUcsU0FBUyxDQUFBO0FBQ25CLFNBQU8sS0FBSyxDQUFBO0VBQ1o7O0FBRUQsT0FDQyxVQUFVLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxLQUM1QixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQztPQUNyRCxhQUFhLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxLQUMvQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDO09BQ3RELFVBQVUsR0FBRyxLQUFLLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxHQUFFLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQTs7QUFFckUsT0FBTSxXQUFXLEdBQUcsTUFBTSxJQUFJOzs7c0JBRUgsWUFBWSxRQXZDbUIsUUFBUSxFQXVDaEIsTUFBTSxDQUFDOzs7O1FBQWhELE1BQU07UUFBRSxLQUFLOzt1QkFDUSxZQUFZLFFBeENMLE1BQU0sRUF3Q1EsS0FBSyxDQUFDOzs7O1FBQWhELFNBQVM7UUFBRSxLQUFLOzt1QkFD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LFVBQU8sQ0FBRSxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUUsaUJBQWlCLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUUsQ0FBQTtHQUNsRSxFQUNELE1BQU0sQ0FBRSxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUUsV0F4bkNuQixpQkFBaUIsQ0F3bkN3QixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQzs7OztRQUw3RCxHQUFHO1FBQUUsT0FBTzs7QUFPcEIsU0FBTyxXQXRuQ21GLElBQUksQ0FzbkM5RSxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7RUFDOUQsQ0FBQTs7QUFFRCxPQUFNLFdBQVcsR0FBRyxNQUFNLElBQUk7QUFDN0IsUUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUk7QUFDL0IsT0FBSSxXQXpuQ2lGLFNBQVMsU0FJL0QsUUFBUSxFQXFuQ2YsQ0FBQyxDQUFDLEVBQ3pCLE9BQU8sR0FBRyxDQUFBLEtBQ047QUFDSixXQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsbUJBbm5DSyxJQUFJLEFBbW5DTyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLHlCQUF5QixHQUFFLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQy9FLFdBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQTtJQUNiO0dBQ0QsQ0FBQyxDQUFBO0FBQ0YsU0FBTyxXQXhvQ2dCLE1BQU0sQ0F3b0NYLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUE7RUFDdEMsQ0FBQSIsImZpbGUiOiJwcml2YXRlL3BhcnNlL3BhcnNlLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQgTG9jIGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHsgY29kZSB9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7IEpzR2xvYmFscyB9IGZyb20gJy4uL2xhbmd1YWdlJ1xuaW1wb3J0IHsgQXNzZXJ0LCBBc3NpZ25EZXN0cnVjdHVyZSwgQXNzaWduU2luZ2xlLCBCYWdFbnRyeSwgQmFnRW50cnlNYW55LCBCYWdTaW1wbGUsIEJsb2NrQmFnLFxuXHRCbG9ja0RvLCBCbG9ja01hcCwgQmxvY2tPYmosIEJsb2NrVmFsVGhyb3csIEJsb2NrV2l0aFJldHVybiwgQmxvY2tXcmFwLCBCcmVhaywgQnJlYWtXaXRoVmFsLFxuXHRDYWxsLCBDYXNlRG8sIENhc2VEb1BhcnQsIENhc2VWYWwsIENhc2VWYWxQYXJ0LCBDYXRjaCwgQ2xhc3MsIENsYXNzRG8sIENvbmRpdGlvbmFsRG8sXG5cdENvbmRpdGlvbmFsVmFsLCBEZWJ1ZywgSWdub3JlLCBJdGVyYXRlZSwgTnVtYmVyTGl0ZXJhbCwgRXhjZXB0RG8sIEV4Y2VwdFZhbCwgRm9yQmFnLCBGb3JEbyxcblx0Rm9yVmFsLCBGdW4sIEdsb2JhbEFjY2VzcywgTF9BbmQsIExfT3IsIExhenksIExEX0NvbnN0LCBMRF9MYXp5LCBMRF9NdXRhYmxlLCBMb2NhbEFjY2Vzcyxcblx0TG9jYWxEZWNsYXJlLCBMb2NhbERlY2xhcmVGb2N1cywgTG9jYWxEZWNsYXJlTmFtZSwgTG9jYWxEZWNsYXJlUmVzLCBMb2NhbERlY2xhcmVUaGlzLFxuXHRMb2NhbE11dGF0ZSwgTG9naWMsIE1hcEVudHJ5LCBNZW1iZXIsIE1lbWJlclNldCwgTWV0aG9kSW1wbCwgTUlfR2V0LCBNSV9QbGFpbiwgTUlfU2V0LCBNb2R1bGUsXG5cdE1TX011dGF0ZSwgTVNfTmV3LCBNU19OZXdNdXRhYmxlLCBOZXcsIE5vdCwgT2JqRW50cnksIE9iakVudHJ5QXNzaWduLCBPYmpFbnRyeUNvbXB1dGVkLFxuXHRPYmpQYWlyLCBPYmpTaW1wbGUsIFBhdHRlcm4sIFF1b3RlLCBRdW90ZVRlbXBsYXRlLCBTRF9EZWJ1Z2dlciwgU3BlY2lhbERvLCBTcGVjaWFsVmFsLCBTVl9OYW1lLFxuXHRTVl9OdWxsLCBTcGxhdCwgU3dpdGNoRG8sIFN3aXRjaERvUGFydCwgU3dpdGNoVmFsLCBTd2l0Y2hWYWxQYXJ0LCBUaHJvdywgVmFsLCBVc2UsIFVzZURvLCBXaXRoLFxuXHRZaWVsZCwgWWllbGRUbyB9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHsgRG90TmFtZSwgR3JvdXAsIEdfQmxvY2ssIEdfQnJhY2tldCwgR19QYXJlbnRoZXNpcywgR19TcGFjZSwgR19RdW90ZSwgaXNHcm91cCwgaXNLZXl3b3JkLFxuXHRLZXl3b3JkLCBLV19BbmQsIEtXX0FzLCBLV19Bc3NlcnQsIEtXX0Fzc2VydE5vdCwgS1dfQXNzaWduLCBLV19Bc3NpZ25NdXRhYmxlLCBLV19CcmVhayxcblx0S1dfQnJlYWtXaXRoVmFsLCBLV19DYXNlVmFsLCBLV19DYXNlRG8sIEtXX0NsYXNzLCBLV19DYXRjaERvLCBLV19DYXRjaFZhbCwgS1dfQ29uc3RydWN0LFxuXHRLV19EZWJ1ZywgS1dfRGVidWdnZXIsIEtXX0RvLCBLV19FbGxpcHNpcywgS1dfRWxzZSwgS1dfRXhjZXB0RG8sIEtXX0V4Y2VwdFZhbCwgS1dfRmluYWxseSxcblx0S1dfRm9yQmFnLCBLV19Gb3JEbywgS1dfRm9yVmFsLCBLV19Gb2N1cywgS1dfRnVuLCBLV19GdW5EbywgS1dfRnVuR2VuLCBLV19GdW5HZW5EbywgS1dfRnVuVGhpcyxcblx0S1dfRnVuVGhpc0RvLCBLV19GdW5UaGlzR2VuLCBLV19GdW5UaGlzR2VuRG8sIEtXX0dldCwgS1dfSWZEbywgS1dfSWZWYWwsIEtXX0lnbm9yZSwgS1dfSW4sXG5cdEtXX0xhenksIEtXX0xvY2FsTXV0YXRlLCBLV19NYXBFbnRyeSwgS1dfTmFtZSwgS1dfTmV3LCBLV19Ob3QsIEtXX09iakFzc2lnbiwgS1dfT3IsIEtXX1Bhc3MsXG5cdEtXX091dCwgS1dfUmVnaW9uLCBLV19TZXQsIEtXX1N0YXRpYywgS1dfU3dpdGNoRG8sIEtXX1N3aXRjaFZhbCwgS1dfVGhyb3csIEtXX1RyeURvLCBLV19UcnlWYWwsXG5cdEtXX1R5cGUsIEtXX1VubGVzc0RvLCBLV19Vbmxlc3NWYWwsIEtXX1VzZSwgS1dfVXNlRGVidWcsIEtXX1VzZURvLCBLV19Vc2VMYXp5LCBLV19XaXRoLFxuXHRLV19ZaWVsZCwgS1dfWWllbGRUbywgTmFtZSwga2V5d29yZE5hbWUsIG9wS2V5d29yZEtpbmRUb1NwZWNpYWxWYWx1ZUtpbmQgfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7IGFzc2VydCwgaGVhZCwgaWZFbHNlLCBmbGF0TWFwLCBpc0VtcHR5LCBsYXN0LFxuXHRvcElmLCBvcE1hcCwgcHVzaCwgcmVwZWF0LCBydGFpbCwgdGFpbCwgdW5zaGlmdCB9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLy8gU2luY2UgdGhlcmUgYXJlIHNvIG1hbnkgcGFyc2luZyBmdW5jdGlvbnMsXG4vLyBpdCdzIGZhc3RlciAoYXMgb2Ygbm9kZSB2MC4xMS4xNCkgdG8gaGF2ZSB0aGVtIGFsbCBjbG9zZSBvdmVyIHRoaXMgbXV0YWJsZSB2YXJpYWJsZSBvbmNlXG4vLyB0aGFuIHRvIGNsb3NlIG92ZXIgdGhlIHBhcmFtZXRlciAoYXMgaW4gbGV4LmpzLCB3aGVyZSB0aGF0J3MgbXVjaCBmYXN0ZXIpLlxubGV0IGNvbnRleHRcblxuLypcblRoaXMgY29udmVydHMgYSBUb2tlbiB0cmVlIHRvIGEgTXNBc3QuXG5UaGlzIGlzIGEgcmVjdXJzaXZlLWRlc2NlbnQgcGFyc2VyLCBtYWRlIGVhc2llciBieSB0d28gZmFjdHM6XG5cdCogV2UgaGF2ZSBhbHJlYWR5IGdyb3VwZWQgdG9rZW5zLlxuXHQqIE1vc3Qgb2YgdGhlIHRpbWUsIGFuIGFzdCdzIHR5cGUgaXMgZGV0ZXJtaW5lZCBieSB0aGUgZmlyc3QgdG9rZW4uXG5cblRoZXJlIGFyZSBleGNlcHRpb25zIHN1Y2ggYXMgYXNzaWdubWVudCBzdGF0ZW1lbnRzIChpbmRpY2F0ZWQgYnkgYSBgPWAgc29tZXdoZXJlIGluIHRoZSBtaWRkbGUpLlxuRm9yIHRob3NlIHdlIG11c3QgaXRlcmF0ZSB0aHJvdWdoIHRva2VucyBhbmQgc3BsaXQuXG4oU2VlIFNsaWNlLm9wU3BsaXRPbmNlV2hlcmUgYW5kIFNsaWNlLm9wU3BsaXRNYW55V2hlcmUuKVxuKi9cbmV4cG9ydCBkZWZhdWx0IChfY29udGV4dCwgcm9vdFRva2VuKSA9PiB7XG5cdGNvbnRleHQgPSBfY29udGV4dFxuXHRhc3NlcnQoaXNHcm91cChHX0Jsb2NrLCByb290VG9rZW4pKVxuXHRjb25zdCBtc0FzdCA9IHBhcnNlTW9kdWxlKFNsaWNlLmdyb3VwKHJvb3RUb2tlbikpXG5cdC8vIFJlbGVhc2UgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbnMuXG5cdGNvbnRleHQgPSB1bmRlZmluZWRcblx0cmV0dXJuIG1zQXN0XG59XG5cbmNvbnN0XG5cdGNoZWNrRW1wdHkgPSAodG9rZW5zLCBtZXNzYWdlKSA9PlxuXHRcdGNvbnRleHQuY2hlY2sodG9rZW5zLmlzRW1wdHkoKSwgdG9rZW5zLmxvYywgbWVzc2FnZSksXG5cdGNoZWNrTm9uRW1wdHkgPSAodG9rZW5zLCBtZXNzYWdlKSA9PlxuXHRcdGNvbnRleHQuY2hlY2soIXRva2Vucy5pc0VtcHR5KCksIHRva2Vucy5sb2MsIG1lc3NhZ2UpLFxuXHR1bmV4cGVjdGVkID0gdG9rZW4gPT4gY29udGV4dC5mYWlsKHRva2VuLmxvYywgYFVuZXhwZWN0ZWQgJHt0b2tlbn1gKVxuXG5jb25zdCBwYXJzZU1vZHVsZSA9IHRva2VucyA9PiB7XG5cdC8vIFVzZSBzdGF0ZW1lbnRzIG11c3QgYXBwZWFyIGluIG9yZGVyLlxuXHRjb25zdCBbIGRvVXNlcywgcmVzdDAgXSA9IHRyeVBhcnNlVXNlcyhLV19Vc2VEbywgdG9rZW5zKVxuXHRjb25zdCBbIHBsYWluVXNlcywgcmVzdDEgXSA9IHRyeVBhcnNlVXNlcyhLV19Vc2UsIHJlc3QwKVxuXHRjb25zdCBbIGxhenlVc2VzLCByZXN0MiBdID0gdHJ5UGFyc2VVc2VzKEtXX1VzZUxhenksIHJlc3QxKVxuXHRjb25zdCBbIGRlYnVnVXNlcywgcmVzdDMgXSA9IHRyeVBhcnNlVXNlcyhLV19Vc2VEZWJ1ZywgcmVzdDIpXG5cdGNvbnN0IHsgbGluZXMsIGV4cG9ydHMsIG9wRGVmYXVsdEV4cG9ydCB9ID0gcGFyc2VNb2R1bGVCbG9jayhyZXN0MylcblxuXHRpZiAoY29udGV4dC5vcHRzLmluY2x1ZGVNb2R1bGVOYW1lKCkgJiYgIWV4cG9ydHMuc29tZShfID0+IF8ubmFtZSA9PT0gJ25hbWUnKSkge1xuXHRcdGNvbnN0IG5hbWUgPSBuZXcgTG9jYWxEZWNsYXJlTmFtZSh0b2tlbnMubG9jKVxuXHRcdGxpbmVzLnB1c2gobmV3IEFzc2lnblNpbmdsZSh0b2tlbnMubG9jLCBuYW1lLFxuXHRcdFx0UXVvdGUuZm9yU3RyaW5nKHRva2Vucy5sb2MsIGNvbnRleHQub3B0cy5tb2R1bGVOYW1lKCkpKSlcblx0XHRleHBvcnRzLnB1c2gobmFtZSlcblx0fVxuXHRjb25zdCB1c2VzID0gcGxhaW5Vc2VzLmNvbmNhdChsYXp5VXNlcylcblx0cmV0dXJuIG5ldyBNb2R1bGUodG9rZW5zLmxvYywgZG9Vc2VzLCB1c2VzLCBkZWJ1Z1VzZXMsIGxpbmVzLCBleHBvcnRzLCBvcERlZmF1bHRFeHBvcnQpXG59XG5cbi8vIHBhcnNlQmxvY2tcbmNvbnN0XG5cdC8vIFRva2VucyBvbiB0aGUgbGluZSBiZWZvcmUgYSBibG9jaywgYW5kIHRva2VucyBmb3IgdGhlIGJsb2NrIGl0c2VsZi5cblx0YmVmb3JlQW5kQmxvY2sgPSB0b2tlbnMgPT4ge1xuXHRcdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAnRXhwZWN0ZWQgYW4gaW5kZW50ZWQgYmxvY2suJylcblx0XHRjb25zdCBibG9jayA9IHRva2Vucy5sYXN0KClcblx0XHRjb250ZXh0LmNoZWNrKGlzR3JvdXAoR19CbG9jaywgYmxvY2spLCBibG9jay5sb2MsICdFeHBlY3RlZCBhbiBpbmRlbnRlZCBibG9jay4nKVxuXHRcdHJldHVybiBbIHRva2Vucy5ydGFpbCgpLCBTbGljZS5ncm91cChibG9jaykgXVxuXHR9LFxuXG5cdGJsb2NrV3JhcCA9IHRva2VucyA9PiBuZXcgQmxvY2tXcmFwKHRva2Vucy5sb2MsIHBhcnNlQmxvY2tWYWwodG9rZW5zKSksXG5cblx0anVzdEJsb2NrID0gKGtleXdvcmQsIHRva2VucykgPT4ge1xuXHRcdGNvbnN0IFsgYmVmb3JlLCBibG9jayBdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRcdGNoZWNrRW1wdHkoYmVmb3JlLCAoKSA9PlxuXHRcdFx0YERpZCBub3QgZXhwZWN0IGFueXRoaW5nIGJldHdlZW4gJHtjb2RlKGtleXdvcmROYW1lKGtleXdvcmQpKX0gYW5kIGJsb2NrLmApXG5cdFx0cmV0dXJuIGJsb2NrXG5cdH0sXG5cdGp1c3RCbG9ja0RvID0gKGtleXdvcmQsIHRva2VucykgPT5cblx0XHRwYXJzZUJsb2NrRG8oanVzdEJsb2NrKGtleXdvcmQsIHRva2VucykpLFxuXHRqdXN0QmxvY2tWYWwgPSAoa2V5d29yZCwgdG9rZW5zKSA9PlxuXHRcdHBhcnNlQmxvY2tWYWwoanVzdEJsb2NrKGtleXdvcmQsIHRva2VucykpLFxuXG5cdC8vIEdldHMgbGluZXMgaW4gYSByZWdpb24gb3IgRGVidWcuXG5cdHBhcnNlTGluZXNGcm9tQmxvY2sgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpXG5cdFx0Y29udGV4dC5jaGVjayh0b2tlbnMuc2l6ZSgpID4gMSwgaC5sb2MsICgpID0+IGBFeHBlY3RlZCBpbmRlbnRlZCBibG9jayBhZnRlciAke2h9YClcblx0XHRjb25zdCBibG9jayA9IHRva2Vucy5zZWNvbmQoKVxuXHRcdGFzc2VydCh0b2tlbnMuc2l6ZSgpID09PSAyICYmIGlzR3JvdXAoR19CbG9jaywgYmxvY2spKVxuXHRcdHJldHVybiBmbGF0TWFwKGJsb2NrLnN1YlRva2VucywgbGluZSA9PiBwYXJzZUxpbmVPckxpbmVzKFNsaWNlLmdyb3VwKGxpbmUpKSlcblx0fSxcblxuXHRwYXJzZUJsb2NrRG8gPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGxpbmVzID0gX3BsYWluQmxvY2tMaW5lcyh0b2tlbnMpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja0RvKHRva2Vucy5sb2MsIGxpbmVzKVxuXHR9LFxuXG5cdHBhcnNlQmxvY2tWYWwgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IHsgbGluZXMsIGtSZXR1cm4gfSA9IF9wYXJzZUJsb2NrTGluZXModG9rZW5zKVxuXHRcdHN3aXRjaCAoa1JldHVybikge1xuXHRcdFx0Y2FzZSBLUmV0dXJuX0JhZzpcblx0XHRcdFx0cmV0dXJuIEJsb2NrQmFnLm9mKHRva2Vucy5sb2MsIGxpbmVzKVxuXHRcdFx0Y2FzZSBLUmV0dXJuX01hcDpcblx0XHRcdFx0cmV0dXJuIEJsb2NrTWFwLm9mKHRva2Vucy5sb2MsIGxpbmVzKVxuXHRcdFx0Y2FzZSBLUmV0dXJuX09iajpcblx0XHRcdFx0Y29uc3QgWyBkb0xpbmVzLCBvcFZhbCBdID0gX3RyeVRha2VMYXN0VmFsKGxpbmVzKVxuXHRcdFx0XHQvLyBvcE5hbWUgd3JpdHRlbiB0byBieSBfdHJ5QWRkTmFtZS5cblx0XHRcdFx0cmV0dXJuIEJsb2NrT2JqLm9mKHRva2Vucy5sb2MsIGRvTGluZXMsIG9wVmFsLCBudWxsKVxuXHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHRjb250ZXh0LmNoZWNrKCFpc0VtcHR5KGxpbmVzKSwgdG9rZW5zLmxvYywgJ1ZhbHVlIGJsb2NrIG11c3QgZW5kIGluIGEgdmFsdWUuJylcblx0XHRcdFx0Y29uc3QgdmFsID0gbGFzdChsaW5lcylcblx0XHRcdFx0aWYgKHZhbCBpbnN0YW5jZW9mIFRocm93KVxuXHRcdFx0XHRcdHJldHVybiBuZXcgQmxvY2tWYWxUaHJvdyh0b2tlbnMubG9jLCBydGFpbChsaW5lcyksIHZhbClcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayh2YWwgaW5zdGFuY2VvZiBWYWwsIHZhbC5sb2MsICdWYWx1ZSBibG9jayBtdXN0IGVuZCBpbiBhIHZhbHVlLicpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBCbG9ja1dpdGhSZXR1cm4odG9rZW5zLmxvYywgcnRhaWwobGluZXMpLCB2YWwpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0cGFyc2VNb2R1bGVCbG9jayA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgeyBsaW5lcywga1JldHVybiB9ID0gX3BhcnNlQmxvY2tMaW5lcyh0b2tlbnMpXG5cdFx0Y29uc3QgbG9jID0gdG9rZW5zLmxvY1xuXHRcdHN3aXRjaCAoa1JldHVybikge1xuXHRcdFx0Y2FzZSBLUmV0dXJuX0JhZzogY2FzZSBLUmV0dXJuX01hcDoge1xuXHRcdFx0XHRjb25zdCBibG9jayA9IChrUmV0dXJuID09PSBLUmV0dXJuX0JhZyA/IEJsb2NrQmFnIDogQmxvY2tNYXApLm9mKGxvYywgbGluZXMpXG5cdFx0XHRcdHJldHVybiB7IGxpbmVzOiBbIF0sIGV4cG9ydHM6IFsgXSwgb3BEZWZhdWx0RXhwb3J0OiBuZXcgQmxvY2tXcmFwKGxvYywgYmxvY2spIH1cblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0Y29uc3QgZXhwb3J0cyA9IFsgXVxuXHRcdFx0XHRsZXQgb3BEZWZhdWx0RXhwb3J0ID0gbnVsbFxuXHRcdFx0XHRjb25zdCBtb2R1bGVOYW1lID0gY29udGV4dC5vcHRzLm1vZHVsZU5hbWUoKVxuXG5cdFx0XHRcdC8vIE1vZHVsZSBleHBvcnRzIGxvb2sgbGlrZSBhIEJsb2NrT2JqLCAgYnV0IGFyZSByZWFsbHkgZGlmZmVyZW50LlxuXHRcdFx0XHQvLyBJbiBFUzYsIG1vZHVsZSBleHBvcnRzIG11c3QgYmUgY29tcGxldGVseSBzdGF0aWMuXG5cdFx0XHRcdC8vIFNvIHdlIGtlZXAgYW4gYXJyYXkgb2YgZXhwb3J0cyBhdHRhY2hlZCBkaXJlY3RseSB0byB0aGUgTW9kdWxlIGFzdC5cblx0XHRcdFx0Ly8gSWYgeW91IHdyaXRlOlxuXHRcdFx0XHQvL1x0aWYhIGNvbmRcblx0XHRcdFx0Ly9cdFx0YS4gYlxuXHRcdFx0XHQvLyBpbiBhIG1vZHVsZSBjb250ZXh0LCBpdCB3aWxsIGJlIGFuIGVycm9yLiAoVGhlIG1vZHVsZSBjcmVhdGVzIG5vIGBidWlsdGAgbG9jYWwuKVxuXHRcdFx0XHRjb25zdCBnZXRMaW5lRXhwb3J0cyA9IGxpbmUgPT4ge1xuXHRcdFx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgT2JqRW50cnlBc3NpZ24pIHtcblx0XHRcdFx0XHRcdGZvciAoY29uc3QgXyBvZiBsaW5lLmFzc2lnbi5hbGxBc3NpZ25lZXMoKSlcblx0XHRcdFx0XHRcdFx0aWYgKF8ubmFtZSA9PT0gbW9kdWxlTmFtZSkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnRleHQuY2hlY2sob3BEZWZhdWx0RXhwb3J0ID09PSBudWxsLCBfLmxvYywgKCkgPT5cblx0XHRcdFx0XHRcdFx0XHRcdGBEZWZhdWx0IGV4cG9ydCBhbHJlYWR5IGRlY2xhcmVkIGF0ICR7b3BEZWZhdWx0RXhwb3J0LmxvY31gKVxuXHRcdFx0XHRcdFx0XHRcdG9wRGVmYXVsdEV4cG9ydCA9IG5ldyBMb2NhbEFjY2VzcyhfLmxvYywgXy5uYW1lKVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRcdFx0XHRleHBvcnRzLnB1c2goXylcblx0XHRcdFx0XHRcdHJldHVybiBsaW5lLmFzc2lnblxuXHRcdFx0XHRcdH0gZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIERlYnVnKVxuXHRcdFx0XHRcdFx0bGluZS5saW5lcyA9IGxpbmUubGluZXMubWFwKGdldExpbmVFeHBvcnRzKVxuXHRcdFx0XHRcdHJldHVybiBsaW5lXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBtb2R1bGVMaW5lcyA9IGxpbmVzLm1hcChnZXRMaW5lRXhwb3J0cylcblxuXHRcdFx0XHRpZiAoaXNFbXB0eShleHBvcnRzKSAmJiBvcERlZmF1bHRFeHBvcnQgPT09IG51bGwpIHtcblx0XHRcdFx0XHRjb25zdCBbIGxpbmVzLCBvcERlZmF1bHRFeHBvcnQgXSA9IF90cnlUYWtlTGFzdFZhbChtb2R1bGVMaW5lcylcblx0XHRcdFx0XHRyZXR1cm4geyBsaW5lcywgZXhwb3J0cywgb3BEZWZhdWx0RXhwb3J0IH1cblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0cmV0dXJuIHsgbGluZXM6IG1vZHVsZUxpbmVzLCBleHBvcnRzLCBvcERlZmF1bHRFeHBvcnQgfVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG4vLyBwYXJzZUJsb2NrIHByaXZhdGVzXG5jb25zdFxuXHRfdHJ5VGFrZUxhc3RWYWwgPSBsaW5lcyA9PlxuXHRcdCghaXNFbXB0eShsaW5lcykgJiYgbGFzdChsaW5lcykgaW5zdGFuY2VvZiBWYWwpID9cblx0XHRcdFsgcnRhaWwobGluZXMpLCBsYXN0KGxpbmVzKSBdIDpcblx0XHRcdFsgbGluZXMsIG51bGwgXSxcblxuXHRfcGxhaW5CbG9ja0xpbmVzID0gbGluZVRva2VucyA9PiB7XG5cdFx0Y29uc3QgbGluZXMgPSBbIF1cblx0XHRjb25zdCBhZGRMaW5lID0gbGluZSA9PiB7XG5cdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIEFycmF5KVxuXHRcdFx0XHRmb3IgKGNvbnN0IF8gb2YgbGluZSlcblx0XHRcdFx0XHRhZGRMaW5lKF8pXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGxpbmVzLnB1c2gobGluZSlcblx0XHR9XG5cdFx0bGluZVRva2Vucy5lYWNoKF8gPT4gYWRkTGluZShwYXJzZUxpbmUoU2xpY2UuZ3JvdXAoXykpKSlcblx0XHRyZXR1cm4gbGluZXNcblx0fSxcblxuXHRLUmV0dXJuX1BsYWluID0gMCxcblx0S1JldHVybl9PYmogPSAxLFxuXHRLUmV0dXJuX0JhZyA9IDIsXG5cdEtSZXR1cm5fTWFwID0gMyxcblx0X3BhcnNlQmxvY2tMaW5lcyA9IGxpbmVUb2tlbnMgPT4ge1xuXHRcdGxldCBpc0JhZyA9IGZhbHNlLCBpc01hcCA9IGZhbHNlLCBpc09iaiA9IGZhbHNlXG5cdFx0Y29uc3QgY2hlY2tMaW5lID0gbGluZSA9PiB7XG5cdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIERlYnVnKVxuXHRcdFx0XHRmb3IgKGNvbnN0IF8gb2YgbGluZS5saW5lcylcblx0XHRcdFx0XHRjaGVja0xpbmUoXylcblx0XHRcdGVsc2UgaWYgKGxpbmUgaW5zdGFuY2VvZiBCYWdFbnRyeSlcblx0XHRcdFx0aXNCYWcgPSB0cnVlXG5cdFx0XHRlbHNlIGlmIChsaW5lIGluc3RhbmNlb2YgTWFwRW50cnkpXG5cdFx0XHRcdGlzTWFwID0gdHJ1ZVxuXHRcdFx0ZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIE9iakVudHJ5KVxuXHRcdFx0XHRpc09iaiA9IHRydWVcblx0XHR9XG5cdFx0Y29uc3QgbGluZXMgPSBfcGxhaW5CbG9ja0xpbmVzKGxpbmVUb2tlbnMpXG5cdFx0Zm9yIChjb25zdCBfIG9mIGxpbmVzKVxuXHRcdFx0Y2hlY2tMaW5lKF8pXG5cblx0XHRjb250ZXh0LmNoZWNrKCEoaXNPYmogJiYgaXNCYWcpLCBsaW5lcy5sb2MsICdCbG9jayBoYXMgYm90aCBCYWcgYW5kIE9iaiBsaW5lcy4nKVxuXHRcdGNvbnRleHQuY2hlY2soIShpc09iaiAmJiBpc01hcCksIGxpbmVzLmxvYywgJ0Jsb2NrIGhhcyBib3RoIE9iaiBhbmQgTWFwIGxpbmVzLicpXG5cdFx0Y29udGV4dC5jaGVjayghKGlzQmFnICYmIGlzTWFwKSwgbGluZXMubG9jLCAnQmxvY2sgaGFzIGJvdGggQmFnIGFuZCBNYXAgbGluZXMuJylcblxuXHRcdGNvbnN0IGtSZXR1cm4gPVxuXHRcdFx0aXNPYmogPyBLUmV0dXJuX09iaiA6IGlzQmFnID8gS1JldHVybl9CYWcgOiBpc01hcCA/IEtSZXR1cm5fTWFwIDogS1JldHVybl9QbGFpblxuXHRcdHJldHVybiB7IGxpbmVzLCBrUmV0dXJuIH1cblx0fVxuXG5jb25zdCBwYXJzZUNhc2UgPSAoaXNWYWwsIGNhc2VkRnJvbUZ1biwgdG9rZW5zKSA9PiB7XG5cdGNvbnN0IFsgYmVmb3JlLCBibG9jayBdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXG5cdGxldCBvcENhc2VkXG5cdGlmIChjYXNlZEZyb21GdW4pIHtcblx0XHRjaGVja0VtcHR5KGJlZm9yZSwgJ0NhblxcJ3QgbWFrZSBmb2N1cyAtLSBpcyBpbXBsaWNpdGx5IHByb3ZpZGVkIGFzIGZpcnN0IGFyZ3VtZW50LicpXG5cdFx0b3BDYXNlZCA9IG51bGxcblx0fSBlbHNlXG5cdFx0b3BDYXNlZCA9IG9wSWYoIWJlZm9yZS5pc0VtcHR5KCksICgpID0+IEFzc2lnblNpbmdsZS5mb2N1cyhiZWZvcmUubG9jLCBwYXJzZUV4cHIoYmVmb3JlKSkpXG5cblx0Y29uc3QgbGFzdExpbmUgPSBTbGljZS5ncm91cChibG9jay5sYXN0KCkpXG5cdGNvbnN0IFsgcGFydExpbmVzLCBvcEVsc2UgXSA9IGlzS2V5d29yZChLV19FbHNlLCBsYXN0TGluZS5oZWFkKCkpID9cblx0XHRbIGJsb2NrLnJ0YWlsKCksIChpc1ZhbCA/IGp1c3RCbG9ja1ZhbCA6IGp1c3RCbG9ja0RvKShLV19FbHNlLCBsYXN0TGluZS50YWlsKCkpIF0gOlxuXHRcdFsgYmxvY2ssIG51bGwgXVxuXG5cdGNvbnN0IHBhcnRzID0gcGFydExpbmVzLm1hcFNsaWNlcyhfcGFyc2VDYXNlTGluZShpc1ZhbCkpXG5cdGNvbnRleHQuY2hlY2socGFydHMubGVuZ3RoID4gMCwgdG9rZW5zLmxvYywgKCkgPT5cblx0XHRgTXVzdCBoYXZlIGF0IGxlYXN0IDEgbm9uLSR7Y29kZSgnZWxzZScpfSB0ZXN0LmApXG5cblx0cmV0dXJuIG5ldyAoaXNWYWwgPyBDYXNlVmFsIDogQ2FzZURvKSh0b2tlbnMubG9jLCBvcENhc2VkLCBwYXJ0cywgb3BFbHNlKVxufVxuLy8gcGFyc2VDYXNlIHByaXZhdGVzXG5jb25zdFxuXHRfcGFyc2VDYXNlTGluZSA9IGlzVmFsID0+IGxpbmUgPT4ge1xuXHRcdGNvbnN0IFsgYmVmb3JlLCBibG9jayBdID0gYmVmb3JlQW5kQmxvY2sobGluZSlcblx0XHRjb25zdCB0ZXN0ID0gX3BhcnNlQ2FzZVRlc3QoYmVmb3JlKVxuXHRcdGNvbnN0IHJlc3VsdCA9IChpc1ZhbCA/IHBhcnNlQmxvY2tWYWwgOiBwYXJzZUJsb2NrRG8pKGJsb2NrKVxuXHRcdHJldHVybiBuZXcgKGlzVmFsID8gQ2FzZVZhbFBhcnQgOiBDYXNlRG9QYXJ0KShsaW5lLmxvYywgdGVzdCwgcmVzdWx0KVxuXHR9LFxuXHRfcGFyc2VDYXNlVGVzdCA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgZmlyc3QgPSB0b2tlbnMuaGVhZCgpXG5cdFx0Ly8gUGF0dGVybiBtYXRjaCBzdGFydHMgd2l0aCB0eXBlIHRlc3QgYW5kIGlzIGZvbGxvd2VkIGJ5IGxvY2FsIGRlY2xhcmVzLlxuXHRcdC8vIEUuZy4sIGA6U29tZSB2YWxgXG5cdFx0aWYgKGlzR3JvdXAoR19TcGFjZSwgZmlyc3QpICYmIHRva2Vucy5zaXplKCkgPiAxKSB7XG5cdFx0XHRjb25zdCBmdCA9IFNsaWNlLmdyb3VwKGZpcnN0KVxuXHRcdFx0aWYgKGlzS2V5d29yZChLV19UeXBlLCBmdC5oZWFkKCkpKSB7XG5cdFx0XHRcdGNvbnN0IHR5cGUgPSBwYXJzZVNwYWNlZChmdC50YWlsKCkpXG5cdFx0XHRcdGNvbnN0IGxvY2FscyA9IHBhcnNlTG9jYWxEZWNsYXJlcyh0b2tlbnMudGFpbCgpKVxuXHRcdFx0XHRyZXR1cm4gbmV3IFBhdHRlcm4oZmlyc3QubG9jLCB0eXBlLCBsb2NhbHMsIExvY2FsQWNjZXNzLmZvY3VzKHRva2Vucy5sb2MpKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcGFyc2VFeHByKHRva2Vucylcblx0fVxuXG5jb25zdCBwYXJzZVN3aXRjaCA9IChpc1ZhbCwgdG9rZW5zKSA9PiB7XG5cdGNvbnN0IFsgYmVmb3JlLCBibG9jayBdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRjb25zdCBzd2l0Y2hlZCA9IHBhcnNlRXhwcihiZWZvcmUpXG5cdGNvbnN0IGxhc3RMaW5lID0gU2xpY2UuZ3JvdXAoYmxvY2subGFzdCgpKVxuXHRjb25zdCBbIHBhcnRMaW5lcywgb3BFbHNlIF0gPSBpc0tleXdvcmQoS1dfRWxzZSwgbGFzdExpbmUuaGVhZCgpKSA/XG5cdFx0WyBibG9jay5ydGFpbCgpLCAoaXNWYWwgPyBqdXN0QmxvY2tWYWwgOiBqdXN0QmxvY2tEbykoS1dfRWxzZSwgbGFzdExpbmUudGFpbCgpKSBdIDpcblx0XHRbIGJsb2NrLCBudWxsIF1cblxuXHRjb25zdCBwYXJ0cyA9IHBhcnRMaW5lcy5tYXBTbGljZXMoX3BhcnNlU3dpdGNoTGluZShpc1ZhbCkpXG5cdGNvbnRleHQuY2hlY2socGFydHMubGVuZ3RoID4gMCwgdG9rZW5zLmxvYywgKCkgPT5cblx0XHRgTXVzdCBoYXZlIGF0IGxlYXN0IDEgbm9uLSR7Y29kZSgnZWxzZScpfSB0ZXN0LmApXG5cblx0cmV0dXJuIG5ldyAoaXNWYWwgPyBTd2l0Y2hWYWwgOiBTd2l0Y2hEbykodG9rZW5zLmxvYywgc3dpdGNoZWQsIHBhcnRzLCBvcEVsc2UpXG59XG5jb25zdFxuXHRfcGFyc2VTd2l0Y2hMaW5lID0gaXNWYWwgPT4gbGluZSA9PiB7XG5cdFx0Y29uc3QgWyBiZWZvcmUsIGJsb2NrIF0gPSBiZWZvcmVBbmRCbG9jayhsaW5lKVxuXG5cdFx0bGV0IHZhbHVlc1xuXHRcdGlmIChpc0tleXdvcmQoS1dfT3IsIGJlZm9yZS5oZWFkKCkpKVxuXHRcdFx0dmFsdWVzID0gYmVmb3JlLnRhaWwoKS5tYXAocGFyc2VTaW5nbGUpXG5cdFx0ZWxzZVxuXHRcdFx0dmFsdWVzID0gWyBwYXJzZUV4cHIoYmVmb3JlKSBdXG5cblx0XHRjb25zdCByZXN1bHQgPSAoaXNWYWwgPyBwYXJzZUJsb2NrVmFsIDogcGFyc2VCbG9ja0RvKShibG9jaylcblx0XHRyZXR1cm4gbmV3IChpc1ZhbCA/IFN3aXRjaFZhbFBhcnQgOiBTd2l0Y2hEb1BhcnQpKGxpbmUubG9jLCB2YWx1ZXMsIHJlc3VsdClcblx0fVxuXG5jb25zdFxuXHRwYXJzZUV4cHIgPSB0b2tlbnMgPT4ge1xuXHRcdHJldHVybiBpZkVsc2UodG9rZW5zLm9wU3BsaXRNYW55V2hlcmUoXyA9PiBpc0tleXdvcmQoS1dfT2JqQXNzaWduLCBfKSksXG5cdFx0XHRzcGxpdHMgPT4ge1xuXHRcdFx0XHQvLyBTaG9ydCBvYmplY3QgZm9ybSwgc3VjaCBhcyAoYS4gMSwgYi4gMilcblx0XHRcdFx0Y29uc3QgZmlyc3QgPSBzcGxpdHNbMF0uYmVmb3JlXG5cdFx0XHRcdGNoZWNrTm9uRW1wdHkoZmlyc3QsICgpID0+IGBVbmV4cGVjdGVkICR7c3BsaXRzWzBdLmF0fWApXG5cdFx0XHRcdGNvbnN0IHRva2Vuc0NhbGxlciA9IGZpcnN0LnJ0YWlsKClcblxuXHRcdFx0XHRjb25zdCBwYWlycyA9IFsgXVxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHNwbGl0cy5sZW5ndGggLSAxOyBpID0gaSArIDEpIHtcblx0XHRcdFx0XHRjb25zdCBuYW1lID0gc3BsaXRzW2ldLmJlZm9yZS5sYXN0KClcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKG5hbWUgaW5zdGFuY2VvZiBOYW1lLCBuYW1lLmxvYywgKCkgPT5cblx0XHRcdFx0XHRcdGBFeHBlY3RlZCBhIG5hbWUsIG5vdCAke25hbWV9YClcblx0XHRcdFx0XHRjb25zdCB0b2tlbnNWYWx1ZSA9IGkgPT09IHNwbGl0cy5sZW5ndGggLSAyID9cblx0XHRcdFx0XHRcdHNwbGl0c1tpICsgMV0uYmVmb3JlIDpcblx0XHRcdFx0XHRcdHNwbGl0c1tpICsgMV0uYmVmb3JlLnJ0YWlsKClcblx0XHRcdFx0XHRjb25zdCB2YWx1ZSA9IHBhcnNlRXhwclBsYWluKHRva2Vuc1ZhbHVlKVxuXHRcdFx0XHRcdGNvbnN0IGxvYyA9IG5ldyBMb2MobmFtZS5sb2Muc3RhcnQsIHRva2Vuc1ZhbHVlLmxvYy5lbmQpXG5cdFx0XHRcdFx0cGFpcnMucHVzaChuZXcgT2JqUGFpcihsb2MsIG5hbWUubmFtZSwgdmFsdWUpKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGFzc2VydChsYXN0KHNwbGl0cykuYXQgPT09IHVuZGVmaW5lZClcblx0XHRcdFx0Y29uc3QgdmFsID0gbmV3IE9ialNpbXBsZSh0b2tlbnMubG9jLCBwYWlycylcblx0XHRcdFx0aWYgKHRva2Vuc0NhbGxlci5pc0VtcHR5KCkpXG5cdFx0XHRcdFx0cmV0dXJuIHZhbFxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKHRva2Vuc0NhbGxlcilcblx0XHRcdFx0XHRyZXR1cm4gbmV3IENhbGwodG9rZW5zLmxvYywgaGVhZChwYXJ0cyksIHB1c2godGFpbChwYXJ0cyksIHZhbCkpXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHQoKSA9PiBwYXJzZUV4cHJQbGFpbih0b2tlbnMpXG5cdFx0KVxuXHR9LFxuXG5cdHBhcnNlRXhwclBsYWluID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKHRva2Vucylcblx0XHRzd2l0Y2ggKHBhcnRzLmxlbmd0aCkge1xuXHRcdFx0Y2FzZSAwOlxuXHRcdFx0XHRjb250ZXh0LmZhaWwodG9rZW5zLmxvYywgJ0V4cGVjdGVkIGFuIGV4cHJlc3Npb24sIGdvdCBub3RoaW5nLicpXG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHJldHVybiBoZWFkKHBhcnRzKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIG5ldyBDYWxsKHRva2Vucy5sb2MsIGhlYWQocGFydHMpLCB0YWlsKHBhcnRzKSlcblx0XHR9XG5cdH0sXG5cblx0cGFyc2VFeHByUGFydHMgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IG9wU3BsaXQgPSB0b2tlbnMub3BTcGxpdE9uY2VXaGVyZSh0b2tlbiA9PiB7XG5cdFx0XHRpZiAodG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdFx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdFx0XHRjYXNlIEtXX0FuZDogY2FzZSBLV19DYXNlVmFsOiBjYXNlIEtXX0NsYXNzOiBjYXNlIEtXX0V4Y2VwdFZhbDogY2FzZSBLV19Gb3JCYWc6XG5cdFx0XHRcdFx0Y2FzZSBLV19Gb3JWYWw6IGNhc2UgS1dfRnVuOiBjYXNlIEtXX0Z1bkRvOiBjYXNlIEtXX0Z1bkdlbjogY2FzZSBLV19GdW5HZW5Ebzpcblx0XHRcdFx0XHRjYXNlIEtXX0Z1blRoaXM6IGNhc2UgS1dfRnVuVGhpc0RvOiBjYXNlIEtXX0Z1blRoaXNHZW46IGNhc2UgS1dfRnVuVGhpc0dlbkRvOlxuXHRcdFx0XHRcdGNhc2UgS1dfSWZWYWw6IGNhc2UgS1dfTmV3OiBjYXNlIEtXX05vdDogY2FzZSBLV19PcjogY2FzZSBLV19Td2l0Y2hWYWw6XG5cdFx0XHRcdFx0Y2FzZSBLV19Vbmxlc3NWYWw6IGNhc2UgS1dfV2l0aDogY2FzZSBLV19ZaWVsZDogY2FzZSBLV19ZaWVsZFRvOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdH0pXG5cdFx0cmV0dXJuIGlmRWxzZShvcFNwbGl0LFxuXHRcdFx0KHsgYmVmb3JlLCBhdCwgYWZ0ZXIgfSkgPT4ge1xuXHRcdFx0XHRjb25zdCBsYXN0ID0gKCgpID0+IHtcblx0XHRcdFx0XHRzd2l0Y2ggKGF0LmtpbmQpIHtcblx0XHRcdFx0XHRcdGNhc2UgS1dfQW5kOiBjYXNlIEtXX09yOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV3IExvZ2ljKGF0LmxvYywgYXQua2luZCA9PT0gS1dfQW5kID8gTF9BbmQgOiBMX09yLFxuXHRcdFx0XHRcdFx0XHRcdHBhcnNlRXhwclBhcnRzKGFmdGVyKSlcblx0XHRcdFx0XHRcdGNhc2UgS1dfQ2FzZVZhbDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlQ2FzZSh0cnVlLCBmYWxzZSwgYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX0NsYXNzOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VDbGFzcyhhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfRXhjZXB0VmFsOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VFeGNlcHQoS1dfRXhjZXB0VmFsLCBhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfRm9yQmFnOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VGb3JCYWcoYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX0ZvclZhbDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlRm9yVmFsKGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19GdW46IGNhc2UgS1dfRnVuRG86IGNhc2UgS1dfRnVuR2VuOiBjYXNlIEtXX0Z1bkdlbkRvOlxuXHRcdFx0XHRcdFx0Y2FzZSBLV19GdW5UaGlzOiBjYXNlIEtXX0Z1blRoaXNEbzogY2FzZSBLV19GdW5UaGlzR2VuOlxuXHRcdFx0XHRcdFx0Y2FzZSBLV19GdW5UaGlzR2VuRG86XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUZ1bihhdC5raW5kLCBhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfSWZWYWw6IGNhc2UgS1dfVW5sZXNzVmFsOiB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IFsgYmVmb3JlLCBibG9jayBdID0gYmVmb3JlQW5kQmxvY2soYWZ0ZXIpXG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgQ29uZGl0aW9uYWxWYWwodG9rZW5zLmxvYyxcblx0XHRcdFx0XHRcdFx0XHRwYXJzZUV4cHJQbGFpbihiZWZvcmUpLFxuXHRcdFx0XHRcdFx0XHRcdHBhcnNlQmxvY2tWYWwoYmxvY2spLFxuXHRcdFx0XHRcdFx0XHRcdGF0LmtpbmQgPT09IEtXX1VubGVzc1ZhbClcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNhc2UgS1dfTmV3OiB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHMoYWZ0ZXIpXG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgTmV3KGF0LmxvYywgcGFydHNbMF0sIHRhaWwocGFydHMpKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19Ob3Q6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgTm90KGF0LmxvYywgcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19Td2l0Y2hWYWw6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZVN3aXRjaCh0cnVlLCBhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfV2l0aDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlV2l0aChhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfWWllbGQ6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgWWllbGQoYXQubG9jLFxuXHRcdFx0XHRcdFx0XHRcdG9wSWYoIWFmdGVyLmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKSlcblx0XHRcdFx0XHRcdGNhc2UgS1dfWWllbGRUbzpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBZaWVsZFRvKGF0LmxvYywgcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKVxuXHRcdFx0XHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKGF0LmtpbmQpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KSgpXG5cdFx0XHRcdHJldHVybiBwdXNoKGJlZm9yZS5tYXAocGFyc2VTaW5nbGUpLCBsYXN0KVxuXHRcdFx0fSxcblx0XHRcdCgpID0+IHRva2Vucy5tYXAocGFyc2VTaW5nbGUpKVxuXHR9XG5cbmNvbnN0IHBhcnNlRnVuID0gKGtpbmQsIHRva2VucykgPT4ge1xuXHRsZXQgaXNUaGlzID0gZmFsc2UsIGlzRG8gPSBmYWxzZSwgaXNHZW4gPSBmYWxzZVxuXHRzd2l0Y2ggKGtpbmQpIHtcblx0XHRjYXNlIEtXX0Z1bjpcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5Ebzpcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuR2VuOlxuXHRcdFx0aXNHZW4gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuR2VuRG86XG5cdFx0XHRpc0dlbiA9IHRydWVcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuVGhpczpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5UaGlzRG86XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1blRoaXNHZW46XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRpc0dlbiA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5UaGlzR2VuRG86XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRpc0dlbiA9IHRydWVcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcigpXG5cdH1cblx0Y29uc3Qgb3BEZWNsYXJlVGhpcyA9IG9wSWYoaXNUaGlzLCAoKSA9PiBuZXcgTG9jYWxEZWNsYXJlVGhpcyh0b2tlbnMubG9jKSlcblxuXHRjb25zdCB7IG9wUmV0dXJuVHlwZSwgcmVzdCB9ID0gX3RyeVRha2VSZXR1cm5UeXBlKHRva2Vucylcblx0Y29uc3QgeyBhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBvcEluLCBvcE91dCB9ID0gX2Z1bkFyZ3NBbmRCbG9jayhpc0RvLCByZXN0KVxuXHQvLyBOZWVkIHJlcyBkZWNsYXJlIGlmIHRoZXJlIGlzIGEgcmV0dXJuIHR5cGUgb3Igb3V0IGNvbmRpdGlvbi5cblx0Y29uc3Qgb3BEZWNsYXJlUmVzID0gaWZFbHNlKG9wUmV0dXJuVHlwZSxcblx0XHRfID0+IG5ldyBMb2NhbERlY2xhcmVSZXMoXy5sb2MsIF8pLFxuXHRcdCgpID0+IG9wTWFwKG9wT3V0LCBfID0+IG5ldyBMb2NhbERlY2xhcmVSZXMoXy5sb2MsIG51bGwpKSlcblx0cmV0dXJuIG5ldyBGdW4odG9rZW5zLmxvYyxcblx0XHRvcERlY2xhcmVUaGlzLCBpc0dlbiwgYXJncywgb3BSZXN0QXJnLCBibG9jaywgb3BJbiwgb3BEZWNsYXJlUmVzLCBvcE91dClcbn1cblxuLy8gcGFyc2VGdW4gcHJpdmF0ZXNcbmNvbnN0XG5cdF90cnlUYWtlUmV0dXJuVHlwZSA9IHRva2VucyA9PiB7XG5cdFx0aWYgKCF0b2tlbnMuaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXHRcdFx0aWYgKGlzR3JvdXAoR19TcGFjZSwgaCkgJiYgaXNLZXl3b3JkKEtXX1R5cGUsIGhlYWQoaC5zdWJUb2tlbnMpKSlcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRvcFJldHVyblR5cGU6IHBhcnNlU3BhY2VkKFNsaWNlLmdyb3VwKGgpLnRhaWwoKSksXG5cdFx0XHRcdFx0cmVzdDogdG9rZW5zLnRhaWwoKVxuXHRcdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB7IG9wUmV0dXJuVHlwZTogbnVsbCwgcmVzdDogdG9rZW5zIH1cblx0fSxcblxuXHRfZnVuQXJnc0FuZEJsb2NrID0gKGlzRG8sIHRva2VucykgPT4ge1xuXHRcdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAnRXhwZWN0ZWQgYW4gaW5kZW50ZWQgYmxvY2suJylcblx0XHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXHRcdC8vIE1pZ2h0IGJlIGB8Y2FzZWBcblx0XHRpZiAoaCBpbnN0YW5jZW9mIEtleXdvcmQgJiYgKGgua2luZCA9PT0gS1dfQ2FzZVZhbCB8fCBoLmtpbmQgPT09IEtXX0Nhc2VEbykpIHtcblx0XHRcdGNvbnN0IGVDYXNlID0gcGFyc2VDYXNlKGgua2luZCA9PT0gS1dfQ2FzZVZhbCwgdHJ1ZSwgdG9rZW5zLnRhaWwoKSlcblx0XHRcdGNvbnN0IGFyZ3MgPSBbIG5ldyBMb2NhbERlY2xhcmVGb2N1cyhoLmxvYykgXVxuXHRcdFx0cmV0dXJuIGgua2luZCA9PT0gS1dfQ2FzZVZhbCA/XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhcmdzLCBvcFJlc3RBcmc6IG51bGwsIG9wSW46IG51bGwsIG9wT3V0OiBudWxsLFxuXHRcdFx0XHRcdGJsb2NrOiBuZXcgQmxvY2tXaXRoUmV0dXJuKHRva2Vucy5sb2MsIFsgXSwgZUNhc2UpXG5cdFx0XHRcdH0gOlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YXJncywgb3BSZXN0QXJnOiBudWxsLCBvcEluOiBudWxsLCBvcE91dDogbnVsbCxcblx0XHRcdFx0XHRibG9jazogbmV3IEJsb2NrRG8odG9rZW5zLmxvYywgWyBlQ2FzZSBdKVxuXHRcdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IFsgYmVmb3JlLCBibG9ja0xpbmVzIF0gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdFx0XHRjb25zdCB7IGFyZ3MsIG9wUmVzdEFyZyB9ID0gX3BhcnNlRnVuTG9jYWxzKGJlZm9yZSlcblx0XHRcdGZvciAoY29uc3QgYXJnIG9mIGFyZ3MpXG5cdFx0XHRcdGlmICghYXJnLmlzTGF6eSgpKVxuXHRcdFx0XHRcdGFyZy5raW5kID0gTERfTXV0YWJsZVxuXHRcdFx0Y29uc3QgWyBvcEluLCByZXN0MCBdID0gX3RyeVRha2VJbk9yT3V0KEtXX0luLCBibG9ja0xpbmVzKVxuXHRcdFx0Y29uc3QgWyBvcE91dCwgcmVzdDEgXSA9IF90cnlUYWtlSW5Pck91dChLV19PdXQsIHJlc3QwKVxuXHRcdFx0Y29uc3QgYmxvY2sgPSAoaXNEbyA/IHBhcnNlQmxvY2tEbyA6IHBhcnNlQmxvY2tWYWwpKHJlc3QxKVxuXHRcdFx0cmV0dXJuIHsgYXJncywgb3BSZXN0QXJnLCBibG9jaywgb3BJbiwgb3BPdXQgfVxuXHRcdH1cblx0fSxcblxuXHRfcGFyc2VGdW5Mb2NhbHMgPSB0b2tlbnMgPT4ge1xuXHRcdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdFx0cmV0dXJuIHsgYXJnczogW10sIG9wUmVzdEFyZzogbnVsbCB9XG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBsID0gdG9rZW5zLmxhc3QoKVxuXHRcdFx0aWYgKGwgaW5zdGFuY2VvZiBEb3ROYW1lKSB7XG5cdFx0XHRcdGNvbnRleHQuY2hlY2sobC5uRG90cyA9PT0gMywgbC5sb2MsICdTcGxhdCBhcmd1bWVudCBtdXN0IGhhdmUgZXhhY3RseSAzIGRvdHMnKVxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdGFyZ3M6IHBhcnNlTG9jYWxEZWNsYXJlcyh0b2tlbnMucnRhaWwoKSksXG5cdFx0XHRcdFx0b3BSZXN0QXJnOiBMb2NhbERlY2xhcmUucGxhaW4obC5sb2MsIGwubmFtZSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSByZXR1cm4geyBhcmdzOiBwYXJzZUxvY2FsRGVjbGFyZXModG9rZW5zKSwgb3BSZXN0QXJnOiBudWxsIH1cblx0XHR9XG5cdH0sXG5cblx0X3RyeVRha2VJbk9yT3V0ID0gKGluT3JPdXQsIHRva2VucykgPT4ge1xuXHRcdGlmICghdG9rZW5zLmlzRW1wdHkoKSkge1xuXHRcdFx0Y29uc3QgZmlyc3RMaW5lID0gdG9rZW5zLmhlYWRTbGljZSgpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKGluT3JPdXQsIGZpcnN0TGluZS5oZWFkKCkpKSB7XG5cdFx0XHRcdGNvbnN0IGluT3V0ID0gbmV3IERlYnVnKFxuXHRcdFx0XHRcdGZpcnN0TGluZS5sb2MsXG5cdFx0XHRcdFx0cGFyc2VMaW5lc0Zyb21CbG9jayhmaXJzdExpbmUpKVxuXHRcdFx0XHRyZXR1cm4gWyBpbk91dCwgdG9rZW5zLnRhaWwoKSBdXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBbIG51bGwsIHRva2VucyBdXG5cdH1cblxuY29uc3Rcblx0cGFyc2VMaW5lID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBoZWFkID0gdG9rZW5zLmhlYWQoKVxuXHRcdGNvbnN0IHJlc3QgPSB0b2tlbnMudGFpbCgpXG5cblx0XHRjb25zdCBub1Jlc3QgPSAoKSA9PlxuXHRcdFx0Y2hlY2tFbXB0eShyZXN0LCAoKSA9PiBgRGlkIG5vdCBleHBlY3QgYW55dGhpbmcgYWZ0ZXIgJHtoZWFkfWApXG5cblx0XHQvLyBXZSBvbmx5IGRlYWwgd2l0aCBtdXRhYmxlIGV4cHJlc3Npb25zIGhlcmUsIG90aGVyd2lzZSB3ZSBmYWxsIGJhY2sgdG8gcGFyc2VFeHByLlxuXHRcdGlmIChoZWFkIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRcdHN3aXRjaCAoaGVhZC5raW5kKSB7XG5cdFx0XHRcdGNhc2UgS1dfQXNzZXJ0OiBjYXNlIEtXX0Fzc2VydE5vdDpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VBc3NlcnQoaGVhZC5raW5kID09PSBLV19Bc3NlcnROb3QsIHJlc3QpXG5cdFx0XHRcdGNhc2UgS1dfRXhjZXB0RG86XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlRXhjZXB0KEtXX0V4Y2VwdERvLCByZXN0KVxuXHRcdFx0XHRjYXNlIEtXX0JyZWFrOlxuXHRcdFx0XHRcdG5vUmVzdCgpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBCcmVhayh0b2tlbnMubG9jKVxuXHRcdFx0XHRjYXNlIEtXX0JyZWFrV2l0aFZhbDpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEJyZWFrV2l0aFZhbCh0b2tlbnMubG9jLCBwYXJzZUV4cHIocmVzdCkpXG5cdFx0XHRcdGNhc2UgS1dfQ2FzZURvOlxuXHRcdFx0XHRcdHJldHVybiBwYXJzZUNhc2UoZmFsc2UsIGZhbHNlLCByZXN0KVxuXHRcdFx0XHRjYXNlIEtXX0RlYnVnOlxuXHRcdFx0XHRcdHJldHVybiBuZXcgRGVidWcodG9rZW5zLmxvYyxcblx0XHRcdFx0XHRcdGlzR3JvdXAoR19CbG9jaywgdG9rZW5zLnNlY29uZCgpKSA/XG5cdFx0XHRcdFx0XHQvLyBgZGVidWdgLCB0aGVuIGluZGVudGVkIGJsb2NrXG5cdFx0XHRcdFx0XHRwYXJzZUxpbmVzRnJvbUJsb2NrKCkgOlxuXHRcdFx0XHRcdFx0Ly8gYGRlYnVnYCwgdGhlbiBzaW5nbGUgbGluZVxuXHRcdFx0XHRcdFx0cGFyc2VMaW5lT3JMaW5lcyhyZXN0KSlcblx0XHRcdFx0Y2FzZSBLV19EZWJ1Z2dlcjpcblx0XHRcdFx0XHRub1Jlc3QoKVxuXHRcdFx0XHRcdHJldHVybiBuZXcgU3BlY2lhbERvKHRva2Vucy5sb2MsIFNEX0RlYnVnZ2VyKVxuXHRcdFx0XHRjYXNlIEtXX0VsbGlwc2lzOlxuXHRcdFx0XHRcdHJldHVybiBuZXcgQmFnRW50cnlNYW55KHRva2Vucy5sb2MsIHBhcnNlRXhwcihyZXN0KSlcblx0XHRcdFx0Y2FzZSBLV19Gb3JEbzpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VGb3JEbyhyZXN0KVxuXHRcdFx0XHRjYXNlIEtXX0lnbm9yZTpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VJZ25vcmUocmVzdClcblx0XHRcdFx0Y2FzZSBLV19JZkRvOiBjYXNlIEtXX1VubGVzc0RvOiB7XG5cdFx0XHRcdFx0Y29uc3QgWyBiZWZvcmUsIGJsb2NrIF0gPSBiZWZvcmVBbmRCbG9jayhyZXN0KVxuXHRcdFx0XHRcdHJldHVybiBuZXcgQ29uZGl0aW9uYWxEbyh0b2tlbnMubG9jLFxuXHRcdFx0XHRcdFx0cGFyc2VFeHByKGJlZm9yZSksXG5cdFx0XHRcdFx0XHRwYXJzZUJsb2NrRG8oYmxvY2spLFxuXHRcdFx0XHRcdFx0aGVhZC5raW5kID09PSBLV19Vbmxlc3NEbylcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlIEtXX09iakFzc2lnbjpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEJhZ0VudHJ5KHRva2Vucy5sb2MsIHBhcnNlRXhwcihyZXN0KSlcblx0XHRcdFx0Y2FzZSBLV19QYXNzOlxuXHRcdFx0XHRcdG5vUmVzdCgpXG5cdFx0XHRcdFx0cmV0dXJuIFsgXVxuXHRcdFx0XHRjYXNlIEtXX1JlZ2lvbjpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VMaW5lc0Zyb21CbG9jayh0b2tlbnMpXG5cdFx0XHRcdGNhc2UgS1dfU3dpdGNoRG86XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlU3dpdGNoKGZhbHNlLCByZXN0KVxuXHRcdFx0XHRjYXNlIEtXX1Rocm93OlxuXHRcdFx0XHRcdHJldHVybiBuZXcgVGhyb3codG9rZW5zLmxvYywgb3BJZighcmVzdC5pc0VtcHR5KCksICgpID0+IHBhcnNlRXhwcihyZXN0KSkpXG5cdFx0XHRcdGNhc2UgS1dfTmFtZTpcblx0XHRcdFx0XHRpZiAoaXNLZXl3b3JkKEtXX09iakFzc2lnbiwgcmVzdC5oZWFkKCkpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCByID0gcmVzdC50YWlsKClcblx0XHRcdFx0XHRcdGNvbnN0IHZhbCA9IHIuaXNFbXB0eSgpID8gbmV3IFNwZWNpYWxWYWwodG9rZW5zLmxvYywgU1ZfTmFtZSkgOiBwYXJzZUV4cHIocilcblx0XHRcdFx0XHRcdHJldHVybiBPYmpFbnRyeUNvbXB1dGVkLm5hbWUodG9rZW5zLmxvYywgdmFsKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBlbHNlIGZhbGx0aHJvdWdoXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Ly8gZmFsbCB0aHJvdWdoXG5cdFx0XHR9XG5cblx0XHRyZXR1cm4gaWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZVdoZXJlKF9pc0xpbmVTcGxpdEtleXdvcmQpLFxuXHRcdFx0KHsgYmVmb3JlLCBhdCwgYWZ0ZXIgfSkgPT4gX3BhcnNlQXNzaWduTGlrZShiZWZvcmUsIGF0LCBhZnRlciwgdG9rZW5zLmxvYyksXG5cdFx0XHQoKSA9PiBwYXJzZUV4cHIodG9rZW5zKSlcblx0fSxcblxuXHRwYXJzZUxpbmVPckxpbmVzID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBfID0gcGFyc2VMaW5lKHRva2Vucylcblx0XHRyZXR1cm4gXyBpbnN0YW5jZW9mIEFycmF5ID8gXyA6IFsgXyBdXG5cdH1cblxuLy8gcGFyc2VMaW5lIHByaXZhdGVzXG5jb25zdFxuXHRfaXNMaW5lU3BsaXRLZXl3b3JkID0gdG9rZW4gPT4ge1xuXHRcdGlmICh0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBLV19Bc3NpZ246IGNhc2UgS1dfQXNzaWduTXV0YWJsZTogY2FzZSBLV19Mb2NhbE11dGF0ZTpcblx0XHRcdFx0Y2FzZSBLV19NYXBFbnRyeTogY2FzZSBLV19PYmpBc3NpZ246IGNhc2UgS1dfWWllbGQ6IGNhc2UgS1dfWWllbGRUbzpcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0fVxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBmYWxzZVxuXHR9LFxuXG5cdF9wYXJzZUFzc2lnbkxpa2UgPSAoYmVmb3JlLCBhdCwgYWZ0ZXIsIGxvYykgPT4ge1xuXHRcdGlmIChhdC5raW5kID09PSBLV19NYXBFbnRyeSlcblx0XHRcdHJldHVybiBuZXcgTWFwRW50cnkobG9jLCBwYXJzZUV4cHIoYmVmb3JlKSwgcGFyc2VFeHByKGFmdGVyKSlcblxuXHRcdC8vIFRPRE86IFRoaXMgY29kZSBpcyBraW5kIG9mIHVnbHkuXG5cdFx0aWYgKGJlZm9yZS5zaXplKCkgPT09IDEpIHtcblx0XHRcdGNvbnN0IHRva2VuID0gYmVmb3JlLmhlYWQoKVxuXHRcdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgRG90TmFtZSlcblx0XHRcdFx0cmV0dXJuIF9wYXJzZU1lbWJlclNldChcdExvY2FsQWNjZXNzLnRoaXModG9rZW4ubG9jKSwgdG9rZW4ubmFtZSwgYXQsIGFmdGVyLCBsb2MpXG5cdFx0XHRpZiAoaXNHcm91cChHX1NwYWNlLCB0b2tlbikpIHtcblx0XHRcdFx0Y29uc3Qgc3BhY2VkID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0XHRcdGNvbnN0IGRvdCA9IHNwYWNlZC5sYXN0KClcblx0XHRcdFx0aWYgKGRvdCBpbnN0YW5jZW9mIERvdE5hbWUpIHtcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKGRvdC5uRG90cyA9PT0gMSwgZG90LmxvYywgJ011c3QgaGF2ZSBvbmx5IDEgYC5gLicpXG5cdFx0XHRcdFx0cmV0dXJuIF9wYXJzZU1lbWJlclNldChwYXJzZVNwYWNlZChzcGFjZWQucnRhaWwoKSksIGRvdC5uYW1lLCBhdCwgYWZ0ZXIsIGxvYylcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBhdC5raW5kID09PSBLV19Mb2NhbE11dGF0ZSA/XG5cdFx0XHRfcGFyc2VMb2NhbE11dGF0ZShiZWZvcmUsIGFmdGVyLCBsb2MpIDpcblx0XHRcdF9wYXJzZUFzc2lnbihiZWZvcmUsIGF0LCBhZnRlciwgbG9jKVxuXHR9LFxuXG5cdF9wYXJzZU1lbWJlclNldCA9IChvYmplY3QsIG5hbWUsIGF0LCBhZnRlciwgbG9jKSA9PlxuXHRcdG5ldyBNZW1iZXJTZXQobG9jLCBvYmplY3QsIG5hbWUsIF9tZW1iZXJTZXRLaW5kKGF0KSwgcGFyc2VFeHByKGFmdGVyKSksXG5cdF9tZW1iZXJTZXRLaW5kID0gYXQgPT4ge1xuXHRcdHN3aXRjaCAoYXQua2luZCkge1xuXHRcdFx0Y2FzZSBLV19Bc3NpZ246IHJldHVybiBNU19OZXdcblx0XHRcdGNhc2UgS1dfQXNzaWduTXV0YWJsZTogcmV0dXJuIE1TX05ld011dGFibGVcblx0XHRcdGNhc2UgS1dfTG9jYWxNdXRhdGU6IHJldHVybiBNU19NdXRhdGVcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcigpXG5cdFx0fVxuXHR9LFxuXG5cdF9wYXJzZUxvY2FsTXV0YXRlID0gKGxvY2Fsc1Rva2VucywgdmFsdWVUb2tlbnMsIGxvYykgPT4ge1xuXHRcdGNvbnN0IGxvY2FscyA9IHBhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcyhsb2NhbHNUb2tlbnMpXG5cdFx0Y29udGV4dC5jaGVjayhsb2NhbHMubGVuZ3RoID09PSAxLCBsb2MsICdUT0RPOiBMb2NhbERlc3RydWN0dXJlTXV0YXRlJylcblx0XHRjb25zdCBuYW1lID0gbG9jYWxzWzBdLm5hbWVcblx0XHRjb25zdCB2YWx1ZSA9IHBhcnNlRXhwcih2YWx1ZVRva2Vucylcblx0XHRyZXR1cm4gbmV3IExvY2FsTXV0YXRlKGxvYywgbmFtZSwgdmFsdWUpXG5cdH0sXG5cblx0X3BhcnNlQXNzaWduID0gKGxvY2Fsc1Rva2VucywgYXNzaWduZXIsIHZhbHVlVG9rZW5zLCBsb2MpID0+IHtcblx0XHRjb25zdCBraW5kID0gYXNzaWduZXIua2luZFxuXHRcdGNvbnN0IGxvY2FscyA9IHBhcnNlTG9jYWxEZWNsYXJlcyhsb2NhbHNUb2tlbnMpXG5cdFx0Y29uc3Qgb3BOYW1lID0gb3BJZihsb2NhbHMubGVuZ3RoID09PSAxLCAoKSA9PiBsb2NhbHNbMF0ubmFtZSlcblx0XHRjb25zdCB2YWx1ZSA9IF9wYXJzZUFzc2lnblZhbHVlKGtpbmQsIG9wTmFtZSwgdmFsdWVUb2tlbnMpXG5cblx0XHRjb25zdCBpc1lpZWxkID0ga2luZCA9PT0gS1dfWWllbGQgfHwga2luZCA9PT0gS1dfWWllbGRUb1xuXHRcdGlmIChpc0VtcHR5KGxvY2FscykpIHtcblx0XHRcdGNvbnRleHQuY2hlY2soaXNZaWVsZCwgbG9jYWxzVG9rZW5zLmxvYywgJ0Fzc2lnbm1lbnQgdG8gbm90aGluZycpXG5cdFx0XHRyZXR1cm4gdmFsdWVcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKGlzWWllbGQpXG5cdFx0XHRcdGZvciAoY29uc3QgXyBvZiBsb2NhbHMpXG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayghXy5pc0xhenkoKSwgXy5sb2MsICdDYW4gbm90IHlpZWxkIHRvIGxhenkgdmFyaWFibGUuJylcblxuXHRcdFx0Y29uc3QgaXNPYmpBc3NpZ24gPSBraW5kID09PSBLV19PYmpBc3NpZ25cblxuXHRcdFx0aWYgKGtpbmQgPT09IEtXX0Fzc2lnbk11dGFibGUpXG5cdFx0XHRcdGZvciAobGV0IF8gb2YgbG9jYWxzKSB7XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayghXy5pc0xhenkoKSwgXy5sb2MsICdMYXp5IGxvY2FsIGNhbiBub3QgYmUgbXV0YWJsZS4nKVxuXHRcdFx0XHRcdF8ua2luZCA9IExEX011dGFibGVcblx0XHRcdFx0fVxuXG5cdFx0XHRjb25zdCB3cmFwID0gXyA9PiBpc09iakFzc2lnbiA/IG5ldyBPYmpFbnRyeUFzc2lnbihsb2MsIF8pIDogX1xuXG5cdFx0XHRpZiAobG9jYWxzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRjb25zdCBhc3NpZ25lZSA9IGxvY2Fsc1swXVxuXHRcdFx0XHRjb25zdCBhc3NpZ24gPSBuZXcgQXNzaWduU2luZ2xlKGxvYywgYXNzaWduZWUsIHZhbHVlKVxuXHRcdFx0XHRjb25zdCBpc1Rlc3QgPSBpc09iakFzc2lnbiAmJiBhc3NpZ25lZS5uYW1lLmVuZHNXaXRoKCd0ZXN0Jylcblx0XHRcdFx0cmV0dXJuIGlzVGVzdCA/IG5ldyBEZWJ1Zyhsb2MsIFsgd3JhcChhc3NpZ24pIF0pIDogd3JhcChhc3NpZ24pXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBraW5kID0gbG9jYWxzWzBdLmtpbmRcblx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIGxvY2Fscylcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKF8ua2luZCA9PT0ga2luZCwgXy5sb2MsXG5cdFx0XHRcdFx0XHQnQWxsIGxvY2FscyBvZiBkZXN0cnVjdHVyaW5nIGFzc2lnbm1lbnQgbXVzdCBiZSBvZiB0aGUgc2FtZSBraW5kLicpXG5cdFx0XHRcdHJldHVybiB3cmFwKG5ldyBBc3NpZ25EZXN0cnVjdHVyZShsb2MsIGxvY2FscywgdmFsdWUsIGtpbmQpKVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRfcGFyc2VBc3NpZ25WYWx1ZSA9IChraW5kLCBvcE5hbWUsIHZhbHVlVG9rZW5zKSA9PiB7XG5cdFx0Y29uc3QgdmFsdWUgPSB2YWx1ZVRva2Vucy5pc0VtcHR5KCkgJiYga2luZCA9PT0gS1dfT2JqQXNzaWduID9cblx0XHRcdG5ldyBTcGVjaWFsVmFsKHZhbHVlVG9rZW5zLmxvYywgU1ZfTnVsbCkgOlxuXHRcdFx0cGFyc2VFeHByKHZhbHVlVG9rZW5zKVxuXHRcdHN3aXRjaCAoa2luZCkge1xuXHRcdFx0Y2FzZSBLV19ZaWVsZDpcblx0XHRcdFx0cmV0dXJuIG5ldyBZaWVsZCh2YWx1ZS5sb2MsIHZhbHVlKVxuXHRcdFx0Y2FzZSBLV19ZaWVsZFRvOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFlpZWxkVG8odmFsdWUubG9jLCB2YWx1ZSlcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiB2YWx1ZVxuXHRcdH1cblx0fVxuXG5jb25zdFxuXHRwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMgPSB0b2tlbnMgPT5cblx0XHR0b2tlbnMubWFwKF8gPT4gTG9jYWxEZWNsYXJlLnBsYWluKF8ubG9jLCBfcGFyc2VMb2NhbE5hbWUoXykpKSxcblxuXHRwYXJzZUxvY2FsRGVjbGFyZXMgPSB0b2tlbnMgPT4gdG9rZW5zLm1hcChwYXJzZUxvY2FsRGVjbGFyZSksXG5cblx0cGFyc2VMb2NhbERlY2xhcmUgPSB0b2tlbiA9PiB7XG5cdFx0aWYgKGlzR3JvdXAoR19TcGFjZSwgdG9rZW4pKSB7XG5cdFx0XHRjb25zdCB0b2tlbnMgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRcdGNvbnN0IFsgcmVzdCwgaXNMYXp5IF0gPVxuXHRcdFx0XHRpc0tleXdvcmQoS1dfTGF6eSwgdG9rZW5zLmhlYWQoKSkgPyBbIHRva2Vucy50YWlsKCksIHRydWUgXSA6IFsgdG9rZW5zLCBmYWxzZSBdXG5cdFx0XHRjb25zdCBuYW1lID0gX3BhcnNlTG9jYWxOYW1lKHJlc3QuaGVhZCgpKVxuXHRcdFx0Y29uc3QgcmVzdDIgPSByZXN0LnRhaWwoKVxuXHRcdFx0Y29uc3Qgb3BUeXBlID0gb3BJZighcmVzdDIuaXNFbXB0eSgpLCAoKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGNvbG9uID0gcmVzdDIuaGVhZCgpXG5cdFx0XHRcdGNvbnRleHQuY2hlY2soaXNLZXl3b3JkKEtXX1R5cGUsIGNvbG9uKSwgY29sb24ubG9jLCAoKSA9PiBgRXhwZWN0ZWQgJHtjb2RlKCc6Jyl9YClcblx0XHRcdFx0Y29uc3QgdG9rZW5zVHlwZSA9IHJlc3QyLnRhaWwoKVxuXHRcdFx0XHRjaGVja05vbkVtcHR5KHRva2Vuc1R5cGUsICgpID0+IGBFeHBlY3RlZCBzb21ldGhpbmcgYWZ0ZXIgJHtjb2xvbn1gKVxuXHRcdFx0XHRyZXR1cm4gcGFyc2VTcGFjZWQodG9rZW5zVHlwZSlcblx0XHRcdH0pXG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsRGVjbGFyZSh0b2tlbi5sb2MsIG5hbWUsIG9wVHlwZSwgaXNMYXp5ID8gTERfTGF6eSA6IExEX0NvbnN0KVxuXHRcdH0gZWxzZVxuXHRcdFx0cmV0dXJuIExvY2FsRGVjbGFyZS5wbGFpbih0b2tlbi5sb2MsIF9wYXJzZUxvY2FsTmFtZSh0b2tlbikpXG5cdH1cblxuLy8gcGFyc2VMb2NhbERlY2xhcmUgcHJpdmF0ZXNcbmNvbnN0XG5cdF9wYXJzZUxvY2FsTmFtZSA9IHQgPT4ge1xuXHRcdGlmIChpc0tleXdvcmQoS1dfRm9jdXMsIHQpKVxuXHRcdFx0cmV0dXJuICdfJ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29udGV4dC5jaGVjayh0IGluc3RhbmNlb2YgTmFtZSwgdC5sb2MsICgpID0+IGBFeHBlY3RlZCBhIGxvY2FsIG5hbWUsIG5vdCAke3R9YClcblx0XHRcdGNvbnRleHQuY2hlY2soIUpzR2xvYmFscy5oYXModC5uYW1lKSwgdC5sb2MsICgpID0+XG5cdFx0XHRcdGBDYW4gbm90IHNoYWRvdyBnbG9iYWwgJHtjb2RlKHQubmFtZSl9YClcblx0XHRcdHJldHVybiB0Lm5hbWVcblx0XHR9XG5cdH1cblxuY29uc3QgcGFyc2VTaW5nbGUgPSB0b2tlbiA9PiB7XG5cdGNvbnN0IHsgbG9jIH0gPSB0b2tlblxuXHRyZXR1cm4gdG9rZW4gaW5zdGFuY2VvZiBOYW1lID9cblx0X2FjY2Vzcyh0b2tlbi5uYW1lLCBsb2MpIDpcblx0dG9rZW4gaW5zdGFuY2VvZiBHcm91cCA/ICgoKSA9PiB7XG5cdFx0Y29uc3Qgc2xpY2UgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdGNhc2UgR19TcGFjZTpcblx0XHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkKHNsaWNlKVxuXHRcdFx0Y2FzZSBHX1BhcmVudGhlc2lzOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VFeHByKHNsaWNlKVxuXHRcdFx0Y2FzZSBHX0JyYWNrZXQ6XG5cdFx0XHRcdHJldHVybiBuZXcgQmFnU2ltcGxlKGxvYywgcGFyc2VFeHByUGFydHMoc2xpY2UpKVxuXHRcdFx0Y2FzZSBHX0Jsb2NrOlxuXHRcdFx0XHRyZXR1cm4gYmxvY2tXcmFwKHNsaWNlKVxuXHRcdFx0Y2FzZSBHX1F1b3RlOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VRdW90ZShzbGljZSlcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcih0b2tlbi5raW5kKVxuXHRcdH1cblx0fSkoKSA6XG5cdHRva2VuIGluc3RhbmNlb2YgTnVtYmVyTGl0ZXJhbCA/XG5cdHRva2VuIDpcblx0dG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkID8gKCgpID0+IHtcblx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdGNhc2UgS1dfRm9jdXM6XG5cdFx0XHRcdHJldHVybiBMb2NhbEFjY2Vzcy5mb2N1cyhsb2MpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gaWZFbHNlKG9wS2V5d29yZEtpbmRUb1NwZWNpYWxWYWx1ZUtpbmQodG9rZW4ua2luZCksXG5cdFx0XHRcdFx0XyA9PiBuZXcgU3BlY2lhbFZhbChsb2MsIF8pLFxuXHRcdFx0XHRcdCgpID0+IHVuZXhwZWN0ZWQodG9rZW4pKVxuXG5cdFx0fVxuXHR9KSgpIDpcblx0dG9rZW4gaW5zdGFuY2VvZiBEb3ROYW1lID9cblx0XHR0b2tlbi5uRG90cyA9PT0gMSA/IG5ldyBNZW1iZXIodG9rZW4ubG9jLCBMb2NhbEFjY2Vzcy50aGlzKHRva2VuLmxvYyksIHRva2VuLm5hbWUpIDpcblx0XHR0b2tlbi5uRG90cyA9PT0gMyA/IG5ldyBTcGxhdChsb2MsIG5ldyBMb2NhbEFjY2Vzcyhsb2MsIHRva2VuLm5hbWUpKSA6XG5cdFx0dW5leHBlY3RlZCh0b2tlbikgOlxuXHR1bmV4cGVjdGVkKHRva2VuKVxufVxuXG4vLyBwYXJzZVNpbmdsZSBwcml2YXRlc1xuY29uc3QgX2FjY2VzcyA9IChuYW1lLCBsb2MpID0+XG5cdEpzR2xvYmFscy5oYXMobmFtZSkgPyBuZXcgR2xvYmFsQWNjZXNzKGxvYywgbmFtZSkgOiBuZXcgTG9jYWxBY2Nlc3MobG9jLCBuYW1lKVxuXG5jb25zdCBwYXJzZVNwYWNlZCA9IHRva2VucyA9PiB7XG5cdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpLCByZXN0ID0gdG9rZW5zLnRhaWwoKVxuXHRpZiAoaXNLZXl3b3JkKEtXX1R5cGUsIGgpKVxuXHRcdHJldHVybiBDYWxsLmNvbnRhaW5zKGgubG9jLCBwYXJzZVNwYWNlZChyZXN0KSwgTG9jYWxBY2Nlc3MuZm9jdXMoaC5sb2MpKVxuXHRlbHNlIGlmIChpc0tleXdvcmQoS1dfTGF6eSwgaCkpXG5cdFx0cmV0dXJuIG5ldyBMYXp5KGgubG9jLCBwYXJzZVNwYWNlZChyZXN0KSlcblx0ZWxzZSB7XG5cdFx0bGV0IGFjYyA9IHBhcnNlU2luZ2xlKGgpXG5cdFx0Zm9yIChsZXQgaSA9IHJlc3Quc3RhcnQ7IGkgPCByZXN0LmVuZDsgaSA9IGkgKyAxKSB7XG5cdFx0XHRjb25zdCB0b2tlbiA9IHJlc3QudG9rZW5zW2ldXG5cdFx0XHRjb25zdCBsb2MgPSB0b2tlbi5sb2Ncblx0XHRcdGlmICh0b2tlbiBpbnN0YW5jZW9mIERvdE5hbWUpIHtcblx0XHRcdFx0Y29udGV4dC5jaGVjayh0b2tlbi5uRG90cyA9PT0gMSwgdG9rZW4ubG9jLCAnVG9vIG1hbnkgZG90cyEnKVxuXHRcdFx0XHRhY2MgPSBuZXcgTWVtYmVyKHRva2VuLmxvYywgYWNjLCB0b2tlbi5uYW1lKVxuXHRcdFx0XHRjb250aW51ZVxuXHRcdFx0fVxuXHRcdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRcdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRcdFx0Y2FzZSBLV19Gb2N1czpcblx0XHRcdFx0XHRcdGFjYyA9IG5ldyBDYWxsKHRva2VuLmxvYywgYWNjLCBbIExvY2FsQWNjZXNzLmZvY3VzKGxvYykgXSlcblx0XHRcdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRcdFx0Y2FzZSBLV19UeXBlOiB7XG5cdFx0XHRcdFx0XHRjb25zdCB0eXBlID0gcGFyc2VTcGFjZWQodG9rZW5zLl9jaG9wU3RhcnQoaSArIDEpKVxuXHRcdFx0XHRcdFx0cmV0dXJuIENhbGwuY29udGFpbnModG9rZW4ubG9jLCB0eXBlLCBhY2MpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdH1cblx0XHRcdGlmICh0b2tlbiBpbnN0YW5jZW9mIEdyb3VwKSB7XG5cdFx0XHRcdGNvbnN0IHNsaWNlID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0XHRcdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdFx0XHRcdGNhc2UgR19CcmFja2V0OlxuXHRcdFx0XHRcdFx0YWNjID0gQ2FsbC5zdWIobG9jLCB1bnNoaWZ0KGFjYywgcGFyc2VFeHByUGFydHMoc2xpY2UpKSlcblx0XHRcdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRcdFx0Y2FzZSBHX1BhcmVudGhlc2lzOlxuXHRcdFx0XHRcdFx0Y2hlY2tFbXB0eShzbGljZSwgKCkgPT5cblx0XHRcdFx0XHRcdFx0YFVzZSAke2NvZGUoJyhhIGIpJyl9LCBub3QgJHtjb2RlKCdhKGIpJyl9YClcblx0XHRcdFx0XHRcdGFjYyA9IG5ldyBDYWxsKGxvYywgYWNjLCBbXSlcblx0XHRcdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRcdFx0Y2FzZSBHX1F1b3RlOlxuXHRcdFx0XHRcdFx0YWNjID0gbmV3IFF1b3RlVGVtcGxhdGUobG9jLCBhY2MsIHBhcnNlUXVvdGUoc2xpY2UpKVxuXHRcdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjb250ZXh0LmZhaWwodG9rZW5zLmxvYywgYEV4cGVjdGVkIG1lbWJlciBvciBzdWIsIG5vdCAke3Rva2VufWApXG5cdFx0fVxuXHRcdHJldHVybiBhY2Ncblx0fVxufVxuXG5jb25zdCB0cnlQYXJzZVVzZXMgPSAoaywgdG9rZW5zKSA9PiB7XG5cdGlmICghdG9rZW5zLmlzRW1wdHkoKSkge1xuXHRcdGNvbnN0IGxpbmUwID0gdG9rZW5zLmhlYWRTbGljZSgpXG5cdFx0aWYgKGlzS2V5d29yZChrLCBsaW5lMC5oZWFkKCkpKVxuXHRcdFx0cmV0dXJuIFsgX3BhcnNlVXNlcyhrLCBsaW5lMC50YWlsKCkpLCB0b2tlbnMudGFpbCgpIF1cblx0fVxuXHRyZXR1cm4gWyBbIF0sIHRva2VucyBdXG59XG5cbi8vIHRyeVBhcnNlVXNlIHByaXZhdGVzXG5jb25zdFxuXHRfcGFyc2VVc2VzID0gKHVzZUtleXdvcmRLaW5kLCB0b2tlbnMpID0+IHtcblx0XHRjb25zdCBbIGJlZm9yZSwgbGluZXMgXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0XHRjaGVja0VtcHR5KGJlZm9yZSwgKCkgPT5cblx0XHRcdGBEaWQgbm90IGV4cGVjdCBhbnl0aGluZyBhZnRlciAke2NvZGUodXNlS2V5d29yZEtpbmQpfSBvdGhlciB0aGFuIGEgYmxvY2tgKVxuXHRcdHJldHVybiBsaW5lcy5tYXBTbGljZXMobGluZSA9PiB7XG5cdFx0XHRjb25zdCB7IHBhdGgsIG5hbWUgfSA9IF9wYXJzZVJlcXVpcmUobGluZS5oZWFkKCkpXG5cdFx0XHRpZiAodXNlS2V5d29yZEtpbmQgPT09IEtXX1VzZURvKSB7XG5cdFx0XHRcdGlmIChsaW5lLnNpemUoKSA+IDEpXG5cdFx0XHRcdFx0dW5leHBlY3RlZChsaW5lLnNlY29uZCgpKVxuXHRcdFx0XHRyZXR1cm4gbmV3IFVzZURvKGxpbmUubG9jLCBwYXRoKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgaXNMYXp5ID0gdXNlS2V5d29yZEtpbmQgPT09IEtXX1VzZUxhenkgfHxcblx0XHRcdFx0XHR1c2VLZXl3b3JkS2luZCA9PT0gS1dfVXNlRGVidWdcblx0XHRcdFx0Y29uc3QgeyB1c2VkLCBvcFVzZURlZmF1bHQgfSA9XG5cdFx0XHRcdFx0X3BhcnNlVGhpbmdzVXNlZChuYW1lLCBpc0xhenksIGxpbmUudGFpbCgpKVxuXHRcdFx0XHRyZXR1cm4gbmV3IFVzZShsaW5lLmxvYywgcGF0aCwgdXNlZCwgb3BVc2VEZWZhdWx0KVxuXHRcdFx0fVxuXHRcdH0pXG5cdH0sXG5cblx0X3BhcnNlVGhpbmdzVXNlZCA9IChuYW1lLCBpc0xhenksIHRva2VucykgPT4ge1xuXHRcdGNvbnN0IHVzZURlZmF1bHQgPSAoKSA9PiBMb2NhbERlY2xhcmUudW50eXBlZCh0b2tlbnMubG9jLCBuYW1lLCBpc0xhenkgPyBMRF9MYXp5IDogTERfQ29uc3QpXG5cdFx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0XHRyZXR1cm4geyB1c2VkOiBbIF0sIG9wVXNlRGVmYXVsdDogdXNlRGVmYXVsdCgpIH1cblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IFsgb3BVc2VEZWZhdWx0LCByZXN0IF0gPVxuXHRcdFx0XHRpc0tleXdvcmQoS1dfRm9jdXMsIHRva2Vucy5oZWFkKCkpID9cblx0XHRcdFx0XHRbIHVzZURlZmF1bHQoKSwgdG9rZW5zLnRhaWwoKSBdIDpcblx0XHRcdFx0XHRbIG51bGwsIHRva2VucyBdXG5cdFx0XHRjb25zdCB1c2VkID0gcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKHJlc3QpLm1hcChsID0+IHtcblx0XHRcdFx0Y29udGV4dC5jaGVjayhsLm5hbWUgIT09ICdfJywgbC5wb3MsXG5cdFx0XHRcdFx0KCkgPT4gYCR7Y29kZSgnXycpfSBub3QgYWxsb3dlZCBhcyBpbXBvcnQgbmFtZS5gKVxuXHRcdFx0XHRpZiAoaXNMYXp5KVxuXHRcdFx0XHRcdGwua2luZCA9IExEX0xhenlcblx0XHRcdFx0cmV0dXJuIGxcblx0XHRcdH0pXG5cdFx0XHRyZXR1cm4geyB1c2VkLCBvcFVzZURlZmF1bHQgfVxuXHRcdH1cblx0fSxcblxuXHRfcGFyc2VSZXF1aXJlID0gdCA9PiB7XG5cdFx0aWYgKHQgaW5zdGFuY2VvZiBOYW1lKVxuXHRcdFx0cmV0dXJuIHsgcGF0aDogdC5uYW1lLCBuYW1lOiB0Lm5hbWUgfVxuXHRcdGVsc2UgaWYgKHQgaW5zdGFuY2VvZiBEb3ROYW1lKVxuXHRcdFx0cmV0dXJuIHsgcGF0aDogcHVzaChfcGFydHNGcm9tRG90TmFtZSh0KSwgdC5uYW1lKS5qb2luKCcvJyksIG5hbWU6IHQubmFtZSB9XG5cdFx0ZWxzZSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKGlzR3JvdXAoR19TcGFjZSwgdCksIHQubG9jLCAnTm90IGEgdmFsaWQgbW9kdWxlIG5hbWUuJylcblx0XHRcdHJldHVybiBfcGFyc2VMb2NhbFJlcXVpcmUoU2xpY2UuZ3JvdXAodCkpXG5cdFx0fVxuXHR9LFxuXG5cdF9wYXJzZUxvY2FsUmVxdWlyZSA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgZmlyc3QgPSB0b2tlbnMuaGVhZCgpXG5cdFx0bGV0IHBhcnRzXG5cdFx0aWYgKGZpcnN0IGluc3RhbmNlb2YgRG90TmFtZSlcblx0XHRcdHBhcnRzID0gX3BhcnRzRnJvbURvdE5hbWUoZmlyc3QpXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKGZpcnN0IGluc3RhbmNlb2YgTmFtZSwgZmlyc3QubG9jLCAnTm90IGEgdmFsaWQgcGFydCBvZiBtb2R1bGUgcGF0aC4nKVxuXHRcdFx0cGFydHMgPSBbIF1cblx0XHR9XG5cdFx0cGFydHMucHVzaChmaXJzdC5uYW1lKVxuXHRcdHRva2Vucy50YWlsKCkuZWFjaCh0b2tlbiA9PiB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKHRva2VuIGluc3RhbmNlb2YgRG90TmFtZSAmJiB0b2tlbi5uRG90cyA9PT0gMSwgdG9rZW4ubG9jLFxuXHRcdFx0XHQnTm90IGEgdmFsaWQgcGFydCBvZiBtb2R1bGUgcGF0aC4nKVxuXHRcdFx0cGFydHMucHVzaCh0b2tlbi5uYW1lKVxuXHRcdH0pXG5cdFx0cmV0dXJuIHsgcGF0aDogcGFydHMuam9pbignLycpLCBuYW1lOiB0b2tlbnMubGFzdCgpLm5hbWUgfVxuXHR9LFxuXG5cdF9wYXJ0c0Zyb21Eb3ROYW1lID0gZG90TmFtZSA9PlxuXHRcdGRvdE5hbWUubkRvdHMgPT09IDEgPyBbICcuJyBdIDogcmVwZWF0KCcuLicsIGRvdE5hbWUubkRvdHMgLSAxKVxuXG5jb25zdFxuXHRfcGFyc2VGb3IgPSBjdHIgPT4gdG9rZW5zID0+IHtcblx0XHRjb25zdCBbIGJlZm9yZSwgYmxvY2sgXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0XHRyZXR1cm4gbmV3IGN0cih0b2tlbnMubG9jLCBfcGFyc2VPcEl0ZXJhdGVlKGJlZm9yZSksIHBhcnNlQmxvY2tEbyhibG9jaykpXG5cdH0sXG5cdF9wYXJzZU9wSXRlcmF0ZWUgPSB0b2tlbnMgPT5cblx0XHRvcElmKCF0b2tlbnMuaXNFbXB0eSgpLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBbIGVsZW1lbnQsIGJhZyBdID1cblx0XHRcdFx0aWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZVdoZXJlKF8gPT4gaXNLZXl3b3JkKEtXX0luLCBfKSksXG5cdFx0XHRcdFx0KHsgYmVmb3JlLCBhZnRlciB9KSA9PiB7XG5cdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKGJlZm9yZS5zaXplKCkgPT09IDEsIGJlZm9yZS5sb2MsICdUT0RPOiBwYXR0ZXJuIGluIGZvcicpXG5cdFx0XHRcdFx0XHRyZXR1cm4gWyBwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMoYmVmb3JlKVswXSwgcGFyc2VFeHByKGFmdGVyKSBdXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQoKSA9PiBbIG5ldyBMb2NhbERlY2xhcmVGb2N1cyh0b2tlbnMubG9jKSwgcGFyc2VFeHByKHRva2VucykgXSlcblx0XHRcdHJldHVybiBuZXcgSXRlcmF0ZWUodG9rZW5zLmxvYywgZWxlbWVudCwgYmFnKVxuXHRcdH0pXG5jb25zdFxuXHRwYXJzZUZvckRvID0gX3BhcnNlRm9yKEZvckRvKSxcblx0cGFyc2VGb3JWYWwgPSBfcGFyc2VGb3IoRm9yVmFsKSxcblx0Ly8gVE9ETzogLT4gb3V0LXR5cGVcblx0cGFyc2VGb3JCYWcgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IFsgYmVmb3JlLCBsaW5lcyBdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRcdGNvbnN0IGJsb2NrID0gcGFyc2VCbG9ja0RvKGxpbmVzKVxuXHRcdC8vIFRPRE86IEJldHRlciB3YXk/XG5cdFx0aWYgKGJsb2NrLmxpbmVzLmxlbmd0aCA9PT0gMSAmJiBibG9jay5saW5lc1swXSBpbnN0YW5jZW9mIFZhbClcblx0XHRcdGJsb2NrLmxpbmVzWzBdID0gbmV3IEJhZ0VudHJ5KGJsb2NrLmxpbmVzWzBdLmxvYywgYmxvY2subGluZXNbMF0pXG5cdFx0cmV0dXJuIEZvckJhZy5vZih0b2tlbnMubG9jLCBfcGFyc2VPcEl0ZXJhdGVlKGJlZm9yZSksIGJsb2NrKVxuXHR9XG5cblxuY29uc3Rcblx0cGFyc2VFeGNlcHQgPSAoa3dFeGNlcHQsIHRva2VucykgPT4ge1xuXHRcdGNvbnN0XG5cdFx0XHRpc1ZhbCA9IGt3RXhjZXB0ID09PSBLV19FeGNlcHRWYWwsXG5cdFx0XHRqdXN0RG9WYWxCbG9jayA9IGlzVmFsID8ganVzdEJsb2NrVmFsIDoganVzdEJsb2NrRG8sXG5cdFx0XHRwYXJzZUJsb2NrID0gaXNWYWwgPyBwYXJzZUJsb2NrVmFsIDogcGFyc2VCbG9ja0RvLFxuXHRcdFx0RXhjZXB0ID0gaXNWYWwgPyBFeGNlcHRWYWwgOiBFeGNlcHREbyxcblx0XHRcdGt3VHJ5ID0gaXNWYWwgPyBLV19UcnlWYWwgOiBLV19UcnlEbyxcblx0XHRcdGt3Q2F0Y2ggPSBpc1ZhbCA/IEtXX0NhdGNoVmFsIDogS1dfQ2F0Y2hEbyxcblx0XHRcdG5hbWVUcnkgPSAoKSA9PiBjb2RlKGtleXdvcmROYW1lKGt3VHJ5KSksXG5cdFx0XHRuYW1lQ2F0Y2ggPSAoKSA9PiBjb2RlKGtleXdvcmROYW1lKGt3Q2F0Y2gpKSxcblx0XHRcdG5hbWVGaW5hbGx5ID0gKCkgPT4gY29kZShrZXl3b3JkTmFtZShLV19GaW5hbGx5KSlcblxuXHRcdGNvbnN0IGxpbmVzID0ganVzdEJsb2NrKGt3RXhjZXB0LCB0b2tlbnMpXG5cblx0XHQvLyBgdHJ5YCAqbXVzdCogY29tZSBmaXJzdC5cblx0XHRjb25zdCBmaXJzdExpbmUgPSBsaW5lcy5oZWFkU2xpY2UoKVxuXHRcdGNvbnN0IHRva2VuVHJ5ID0gZmlyc3RMaW5lLmhlYWQoKVxuXHRcdGNvbnRleHQuY2hlY2soaXNLZXl3b3JkKGt3VHJ5LCB0b2tlblRyeSksIHRva2VuVHJ5LmxvYywgKCkgPT5cblx0XHRcdGBNdXN0IHN0YXJ0IHdpdGggJHtuYW1lVHJ5KCl9YClcblx0XHRjb25zdCBfdHJ5ID0ganVzdERvVmFsQmxvY2soa3dUcnksIGZpcnN0TGluZS50YWlsKCkpXG5cblx0XHRjb25zdCByZXN0TGluZXMgPSBsaW5lcy50YWlsKClcblx0XHRjaGVja05vbkVtcHR5KHJlc3RMaW5lcywgKCkgPT5cblx0XHRcdGBNdXN0IGhhdmUgYXQgbGVhc3Qgb25lIG9mICR7bmFtZUNhdGNoKCl9IG9yICR7bmFtZUZpbmFsbHkoKX1gKVxuXG5cdFx0Y29uc3QgaGFuZGxlRmluYWxseSA9IHJlc3RMaW5lcyA9PiB7XG5cdFx0XHRjb25zdCBsaW5lID0gcmVzdExpbmVzLmhlYWRTbGljZSgpXG5cdFx0XHRjb25zdCB0b2tlbkZpbmFsbHkgPSBsaW5lLmhlYWQoKVxuXHRcdFx0Y29udGV4dC5jaGVjayhpc0tleXdvcmQoS1dfRmluYWxseSwgdG9rZW5GaW5hbGx5KSwgdG9rZW5GaW5hbGx5LmxvYywgKCkgPT5cblx0XHRcdFx0YEV4cGVjdGVkICR7bmFtZUZpbmFsbHkoKX1gKVxuXHRcdFx0Y29udGV4dC5jaGVjayhyZXN0TGluZXMuc2l6ZSgpID09PSAxLCByZXN0TGluZXMubG9jLCAoKSA9PlxuXHRcdFx0XHRgTm90aGluZyBpcyBhbGxvd2VkIHRvIGNvbWUgYWZ0ZXIgJHtuYW1lRmluYWxseSgpfS5gKVxuXHRcdFx0cmV0dXJuIGp1c3RCbG9ja0RvKEtXX0ZpbmFsbHksIGxpbmUudGFpbCgpKVxuXHRcdH1cblxuXHRcdGxldCBfY2F0Y2gsIF9maW5hbGx5XG5cblx0XHRjb25zdCBsaW5lMiA9IHJlc3RMaW5lcy5oZWFkU2xpY2UoKVxuXHRcdGNvbnN0IGhlYWQyID0gbGluZTIuaGVhZCgpXG5cdFx0aWYgKGlzS2V5d29yZChrd0NhdGNoLCBoZWFkMikpIHtcblx0XHRcdGNvbnN0IFsgYmVmb3JlMiwgYmxvY2syIF0gPSBiZWZvcmVBbmRCbG9jayhsaW5lMi50YWlsKCkpXG5cdFx0XHRjb25zdCBjYXVnaHQgPSBfcGFyc2VPbmVMb2NhbERlY2xhcmVPckZvY3VzKGJlZm9yZTIpXG5cdFx0XHRfY2F0Y2ggPSBuZXcgQ2F0Y2gobGluZTIubG9jLCBjYXVnaHQsIHBhcnNlQmxvY2soYmxvY2syKSlcblx0XHRcdF9maW5hbGx5ID0gb3BJZihyZXN0TGluZXMuc2l6ZSgpID4gMSwgKCkgPT4gaGFuZGxlRmluYWxseShyZXN0TGluZXMudGFpbCgpKSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0X2NhdGNoID0gbnVsbFxuXHRcdFx0X2ZpbmFsbHkgPSBoYW5kbGVGaW5hbGx5KHJlc3RMaW5lcylcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3IEV4Y2VwdCh0b2tlbnMubG9jLCBfdHJ5LCBfY2F0Y2gsIF9maW5hbGx5KVxuXHR9LFxuXHRfcGFyc2VPbmVMb2NhbERlY2xhcmVPckZvY3VzID0gdG9rZW5zID0+IHtcblx0XHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRcdHJldHVybiBuZXcgTG9jYWxEZWNsYXJlRm9jdXModG9rZW5zLmxvYylcblx0XHRlbHNlIHtcblx0XHRcdGNvbnRleHQuY2hlY2sodG9rZW5zLnNpemUoKSA9PT0gMSwgJ0V4cGVjdGVkIG9ubHkgb25lIGxvY2FsIGRlY2xhcmUuJylcblx0XHRcdHJldHVybiBwYXJzZUxvY2FsRGVjbGFyZXModG9rZW5zKVswXVxuXHRcdH1cblx0fVxuXG5jb25zdCBwYXJzZUFzc2VydCA9IChuZWdhdGUsIHRva2VucykgPT4ge1xuXHRjaGVja05vbkVtcHR5KHRva2VucywgKCkgPT4gYEV4cGVjdGVkIHNvbWV0aGluZyBhZnRlciAke2tleXdvcmROYW1lKEtXX0Fzc2VydCl9LmApXG5cblx0Y29uc3QgWyBjb25kVG9rZW5zLCBvcFRocm93biBdID1cblx0XHRpZkVsc2UodG9rZW5zLm9wU3BsaXRPbmNlV2hlcmUoXyA9PiBpc0tleXdvcmQoS1dfVGhyb3csIF8pKSxcblx0XHRcdCh7IGJlZm9yZSwgYWZ0ZXIgfSkgPT4gWyBiZWZvcmUsIHBhcnNlRXhwcihhZnRlcikgXSxcblx0XHRcdCgpID0+IFsgdG9rZW5zLCBudWxsIF0pXG5cblx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyhjb25kVG9rZW5zKVxuXHRjb25zdCBjb25kID0gcGFydHMubGVuZ3RoID09PSAxID8gcGFydHNbMF0gOiBuZXcgQ2FsbChjb25kVG9rZW5zLmxvYywgcGFydHNbMF0sIHRhaWwocGFydHMpKVxuXHRyZXR1cm4gbmV3IEFzc2VydCh0b2tlbnMubG9jLCBuZWdhdGUsIGNvbmQsIG9wVGhyb3duKVxufVxuXG5jb25zdCBwYXJzZUNsYXNzID0gdG9rZW5zID0+IHtcblx0Y29uc3QgWyBiZWZvcmUsIGJsb2NrIF0gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdGNvbnN0IG9wRXh0ZW5kZWQgPSBvcElmKCFiZWZvcmUuaXNFbXB0eSgpLCAoKSA9PiBwYXJzZUV4cHIoYmVmb3JlKSlcblxuXHRsZXQgb3BEbyA9IG51bGwsIHN0YXRpY3MgPSBbIF0sIG9wQ29uc3RydWN0b3IgPSBudWxsLCBtZXRob2RzID0gWyBdXG5cblx0bGV0IHJlc3QgPSBibG9ja1xuXHRjb25zdCBsaW5lMSA9IHJlc3QuaGVhZFNsaWNlKClcblx0aWYgKGlzS2V5d29yZChLV19EbywgbGluZTEuaGVhZCgpKSkge1xuXHRcdGNvbnN0IGRvbmUgPSBqdXN0QmxvY2tEbyhLV19EbywgbGluZTEudGFpbCgpKVxuXHRcdG9wRG8gPSBuZXcgQ2xhc3NEbyhsaW5lMS5sb2MsIG5ldyBMb2NhbERlY2xhcmVGb2N1cyhsaW5lMS5sb2MsIGRvbmUpLCBkb25lKVxuXHRcdHJlc3QgPSBibG9jay50YWlsKClcblx0fVxuXHRpZiAoIXJlc3QuaXNFbXB0eSgpKSB7XG5cdFx0Y29uc3QgbGluZTIgPSByZXN0LmhlYWRTbGljZSgpXG5cdFx0aWYgKGlzS2V5d29yZChLV19TdGF0aWMsIGxpbmUyLmhlYWQoKSkpIHtcblx0XHRcdHN0YXRpY3MgPSBfcGFyc2VTdGF0aWNzKGxpbmUyLnRhaWwoKSlcblx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdH1cblx0XHRpZiAoIXJlc3QuaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCBsaW5lMyA9IHJlc3QuaGVhZFNsaWNlKClcblx0XHRcdGlmIChpc0tleXdvcmQoS1dfQ29uc3RydWN0LCBsaW5lMy5oZWFkKCkpKSB7XG5cdFx0XHRcdG9wQ29uc3RydWN0b3IgPSBfcGFyc2VDb25zdHJ1Y3RvcihsaW5lMy50YWlsKCkpXG5cdFx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdFx0fVxuXHRcdFx0bWV0aG9kcyA9IF9wYXJzZU1ldGhvZHMocmVzdClcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gbmV3IENsYXNzKHRva2Vucy5sb2MsIG9wRXh0ZW5kZWQsIG9wRG8sIHN0YXRpY3MsIG9wQ29uc3RydWN0b3IsIG1ldGhvZHMpXG59XG5cbmNvbnN0XG5cdF9wYXJzZUNvbnN0cnVjdG9yID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCB7IGFyZ3MsIG9wUmVzdEFyZywgYmxvY2ssIG9wSW4sIG9wT3V0IH0gPSBfZnVuQXJnc0FuZEJsb2NrKHRydWUsIHRva2Vucylcblx0XHRjb25zdCBpc0dlbmVyYXRvciA9IGZhbHNlLCBvcERlY2xhcmVSZXMgPSBudWxsXG5cdFx0cmV0dXJuIG5ldyBGdW4odG9rZW5zLmxvYyxcblx0XHRcdG5ldyBMb2NhbERlY2xhcmVUaGlzKHRva2Vucy5sb2MpLFxuXHRcdFx0aXNHZW5lcmF0b3IsXG5cdFx0XHRhcmdzLCBvcFJlc3RBcmcsXG5cdFx0XHRibG9jaywgb3BJbiwgb3BEZWNsYXJlUmVzLCBvcE91dClcblx0fSxcblx0X3BhcnNlU3RhdGljcyA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgYmxvY2sgPSBqdXN0QmxvY2soS1dfU3RhdGljLCB0b2tlbnMpXG5cdFx0cmV0dXJuIF9wYXJzZU1ldGhvZHMoYmxvY2spXG5cdH0sXG5cdF9wYXJzZU1ldGhvZHMgPSB0b2tlbnMgPT4gdG9rZW5zLm1hcFNsaWNlcyhfcGFyc2VNZXRob2QpLFxuXHRfcGFyc2VNZXRob2QgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGhlYWQgPSB0b2tlbnMuaGVhZCgpXG5cblx0XHRsZXQga2luZCA9IE1JX1BsYWluXG5cdFx0aWYgKGlzS2V5d29yZChLV19HZXQsIGhlYWQpIHx8IGlzS2V5d29yZChLV19TZXQsIGhlYWQpKSB7XG5cdFx0XHRraW5kID0gaGVhZC5raW5kID09PSBLV19HZXQgPyBNSV9HZXQgOiBNSV9TZXRcblx0XHRcdHRva2VucyA9IHRva2Vucy50YWlsKClcblx0XHR9XG5cblx0XHRjb25zdCBiYWEgPSB0b2tlbnMub3BTcGxpdE9uY2VXaGVyZShfaXNGdW5LZXl3b3JkKVxuXHRcdGNvbnRleHQuY2hlY2soYmFhICE9PSBudWxsLCB0b2tlbnMubG9jLCAnRXhwZWN0ZWQgYSBmdW5jdGlvbiBrZXl3b3JkIHNvbWV3aGVyZS4nKVxuXHRcdGNvbnN0IHsgYmVmb3JlLCBhdCwgYWZ0ZXIgfSA9IGJhYVxuXG5cdFx0Y29uc3QgZnVuID0gcGFyc2VGdW4oX21ldGhvZEZ1bktpbmQoYXQpLCBhZnRlcilcblxuXHRcdGxldCBzeW1ib2wgPSBwYXJzZUV4cHIoYmVmb3JlKVxuXHRcdC8vIElmIHN5bWJvbCBpcyBqdXN0IGEgbGl0ZXJhbCBzdHJpbmcsIHN0b3JlIGl0IGFzIGEgc3RyaW5nLCB3aGljaCBpcyBoYW5kbGVkIHNwZWNpYWxseS5cblx0XHRpZiAoc3ltYm9sIGluc3RhbmNlb2YgUXVvdGUgJiZcblx0XHRcdHN5bWJvbC5wYXJ0cy5sZW5ndGggPT09IDEgJiZcblx0XHRcdHR5cGVvZiBzeW1ib2wucGFydHNbMF0gPT09ICdzdHJpbmcnKVxuXHRcdFx0c3ltYm9sID0gc3ltYm9sLnBhcnRzWzBdXG5cblx0XHRyZXR1cm4gbmV3IE1ldGhvZEltcGwodG9rZW5zLmxvYywga2luZCwgc3ltYm9sLCBmdW4pXG5cdH0sXG5cdF9tZXRob2RGdW5LaW5kID0gZnVuS2luZFRva2VuID0+IHtcblx0XHRzd2l0Y2ggKGZ1bktpbmRUb2tlbi5raW5kKSB7XG5cdFx0XHRjYXNlIEtXX0Z1bjogcmV0dXJuIEtXX0Z1blRoaXNcblx0XHRcdGNhc2UgS1dfRnVuRG86IHJldHVybiBLV19GdW5UaGlzRG9cblx0XHRcdGNhc2UgS1dfRnVuR2VuOiByZXR1cm4gS1dfRnVuVGhpc0dlblxuXHRcdFx0Y2FzZSBLV19GdW5HZW5EbzogcmV0dXJuIEtXX0Z1blRoaXNHZW5Eb1xuXHRcdFx0Y2FzZSBLV19GdW5UaGlzOiBjYXNlIEtXX0Z1blRoaXNEbzogY2FzZSBLV19GdW5UaGlzR2VuOiBjYXNlIEtXX0Z1blRoaXNHZW5Ebzpcblx0XHRcdFx0Y29udGV4dC5mYWlsKGZ1bktpbmRUb2tlbi5sb2MsICdGdW5jdGlvbiBgLmAgaXMgaW1wbGljaXQgZm9yIG1ldGhvZHMuJylcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGNvbnRleHQuZmFpbChmdW5LaW5kVG9rZW4ubG9jLCBgRXhwZWN0ZWQgZnVuY3Rpb24ga2luZCwgZ290ICR7ZnVuS2luZFRva2VufWApXG5cdFx0fVxuXHR9LFxuXHRfaXNGdW5LZXl3b3JkID0gZnVuS2luZFRva2VuID0+IHtcblx0XHRpZiAoZnVuS2luZFRva2VuIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRcdHN3aXRjaCAoZnVuS2luZFRva2VuLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBLV19GdW46IGNhc2UgS1dfRnVuRG86IGNhc2UgS1dfRnVuR2VuOiBjYXNlIEtXX0Z1bkdlbkRvOlxuXHRcdFx0XHRjYXNlIEtXX0Z1blRoaXM6IGNhc2UgS1dfRnVuVGhpc0RvOiBjYXNlIEtXX0Z1blRoaXNHZW46XG5cdFx0XHRcdGNhc2UgS1dfRnVuVGhpc0dlbkRvOlxuXHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHR9XG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdH1cblxuY29uc3QgcGFyc2VRdW90ZSA9IHRva2VucyA9PlxuXHRuZXcgUXVvdGUodG9rZW5zLmxvYywgdG9rZW5zLm1hcChfID0+ICh0eXBlb2YgXyA9PT0gJ3N0cmluZycpID8gXyA6IHBhcnNlU2luZ2xlKF8pKSlcblxuY29uc3QgcGFyc2VXaXRoID0gdG9rZW5zID0+IHtcblx0Y29uc3QgWyBiZWZvcmUsIGJsb2NrIF0gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cblx0Y29uc3QgWyB2YWwsIGRlY2xhcmUgXSA9IGlmRWxzZShiZWZvcmUub3BTcGxpdE9uY2VXaGVyZShfID0+IGlzS2V5d29yZChLV19BcywgXykpLFxuXHRcdCh7IGJlZm9yZSwgYWZ0ZXIgfSkgPT4ge1xuXHRcdFx0Y29udGV4dC5jaGVjayhhZnRlci5zaXplKCkgPT09IDEsICgpID0+IGBFeHBlY3RlZCBvbmx5IDEgdG9rZW4gYWZ0ZXIgJHtjb2RlKCdhcycpfS5gKVxuXHRcdFx0cmV0dXJuIFsgcGFyc2VFeHByUGxhaW4oYmVmb3JlKSwgcGFyc2VMb2NhbERlY2xhcmUoYWZ0ZXIuaGVhZCgpKSBdXG5cdFx0fSxcblx0XHQoKSA9PiBbIHBhcnNlRXhwclBsYWluKGJlZm9yZSksIG5ldyBMb2NhbERlY2xhcmVGb2N1cyh0b2tlbnMubG9jKSBdKVxuXG5cdHJldHVybiBuZXcgV2l0aCh0b2tlbnMubG9jLCBkZWNsYXJlLCB2YWwsIHBhcnNlQmxvY2tEbyhibG9jaykpXG59XG5cbmNvbnN0IHBhcnNlSWdub3JlID0gdG9rZW5zID0+IHtcblx0Y29uc3QgaWdub3JlZCA9IHRva2Vucy5tYXAoXyA9PiB7XG5cdFx0aWYgKGlzS2V5d29yZChLV19Gb2N1cywgXykpXG5cdFx0XHRyZXR1cm4gJ18nXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKF8gaW5zdGFuY2VvZiBOYW1lLCBfLmxvYywgKCkgPT4gYEV4cGVjdGVkIGxvY2FsIG5hbWUsIG5vdCAke199LmApXG5cdFx0XHRyZXR1cm4gXy5uYW1lXG5cdFx0fVxuXHR9KVxuXHRyZXR1cm4gbmV3IElnbm9yZSh0b2tlbnMubG9jLCBpZ25vcmVkKVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
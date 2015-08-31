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
						if (line instanceof _MsAst.ObjEntry) {
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
		if (at.kind === _Token.KW_MapEntry) return _parseMapEntry(before, after, loc);

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

			const wrap = _ => isObjAssign ? new _MsAst.ObjEntry(loc, _) : _;

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
		if (opName !== null) _tryAddName(value, opName);
		switch (kind) {
			case _Token.KW_Yield:
				return new _MsAst.Yield(value.loc, value);
			case _Token.KW_YieldTo:
				return new _MsAst.YieldTo(value.loc, value);
			default:
				return value;
		}
	},
	     

	// We give it a name if:
	// It's a function
	// It's an Obj block
	// It's an Obj block at the end of a call (as in `name = Obj-Type ...`)
	_tryAddName = (_, name) => {
		if (_ instanceof _MsAst.Fun || _ instanceof _MsAst.Class) _.opName = name;else if ((_ instanceof _MsAst.Call || _ instanceof _MsAst.New) && !(0, _util.isEmpty)(_.args)) _tryAddObjName((0, _util.last)(_.args), name);else _tryAddObjName(_, name);
	},
	      _tryAddObjName = (_, name) => {
		if (_ instanceof _MsAst.BlockWrap && _.block instanceof _MsAst.BlockObj) if (_.block.opObjed !== null && _.block.opObjed instanceof _MsAst.Fun) _.block.opObjed.opName = name;else if (!_nameObjAssignSomewhere(_.block.lines)) _.block.opName = name;
	},
	      _nameObjAssignSomewhere = lines => lines.some(line => line instanceof _MsAst.ObjEntry && line.assign.allAssignees().some(_ => _.name === 'name')),
	      _parseMapEntry = (before, after, loc) => new _MsAst.MapEntry(loc, parseExpr(before), parseExpr(after));

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
		}() : token instanceof _MsAst.NumberLiteral ? token : token instanceof _Token.Keyword ? token.kind === _Token.KW_Focus ? _MsAst.LocalAccess.focus(loc) : (0, _util.ifElse)((0, _Token.opKeywordKindToSpecialValueKind)(token.kind), _ => new _MsAst.SpecialVal(loc, _), () => unexpected(token)) : token instanceof _Token.DotName ? token.nDots === 1 ? new _MsAst.Member(token.loc, _MsAst.LocalAccess.this(token.loc), token.name) : token.nDots === 3 ? new _MsAst.Splat(loc, new _MsAst.LocalAccess(loc, token.name)) : unexpected(token) : unexpected(token);
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
		(0, _util.assert)(fun.opName === null);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7QUM4QkEsS0FBSSxPQUFPLENBQUE7Ozs7Ozs7Ozs7Ozs7a0JBWUksQ0FBQyxRQUFRLEVBQUUsU0FBUyxLQUFLO0FBQ3ZDLFNBQU8sR0FBRyxRQUFRLENBQUE7QUFDbEIsWUFyQlEsTUFBTSxFQXFCUCxXQS9Cc0UsT0FBTyxTQUE1RCxPQUFPLEVBK0JQLFNBQVMsQ0FBQyxDQUFDLENBQUE7QUFDbkMsUUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLGdCQUFNLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBOztBQUVqRCxTQUFPLEdBQUcsU0FBUyxDQUFBO0FBQ25CLFNBQU8sS0FBSyxDQUFBO0VBQ1o7O0FBRUQsT0FDQyxVQUFVLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxLQUM1QixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQztPQUNyRCxhQUFhLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxLQUMvQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDO09BQ3RELFVBQVUsR0FBRyxLQUFLLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxHQUFFLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQTs7QUFFckUsT0FBTSxXQUFXLEdBQUcsTUFBTSxJQUFJOzs7c0JBRUgsWUFBWSxRQXZDbUIsUUFBUSxFQXVDaEIsTUFBTSxDQUFDOzs7O1FBQWhELE1BQU07UUFBRSxLQUFLOzt1QkFDUSxZQUFZLFFBeENMLE1BQU0sRUF3Q1EsS0FBSyxDQUFDOzs7O1FBQWhELFNBQVM7UUFBRSxLQUFLOzt1QkFD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QTBvQ3dCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBRSxDQUFDOzs7O1FBTDdELEdBQUc7UUFBRSxPQUFPOztBQU9wQixTQUFPLFdBeG9DMkMsSUFBSSxDQXdvQ3RDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtFQUM5RCxDQUFBOztBQUVELE9BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSTtBQUM3QixRQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSTtBQUMvQixPQUFJLFdBNW9DaUYsU0FBUyxTQUkvRCxRQUFRLEVBd29DZixDQUFDLENBQUMsRUFDekIsT0FBTyxHQUFHLENBQUEsS0FDTjtBQUNKLFdBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxtQkF0b0NLLElBQUksQUFzb0NPLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMseUJBQXlCLEdBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDL0UsV0FBTyxDQUFDLENBQUMsSUFBSSxDQUFBO0lBQ2I7R0FDRCxDQUFDLENBQUE7QUFDRixTQUFPLFdBMXBDZ0IsTUFBTSxDQTBwQ1gsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQTtFQUN0QyxDQUFBIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvcGFyc2UuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCBMb2MgZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQgeyBjb2RlIH0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHsgSnNHbG9iYWxzIH0gZnJvbSAnLi4vbGFuZ3VhZ2UnXG5pbXBvcnQgeyBBc3NlcnQsIEFzc2lnbkRlc3RydWN0dXJlLCBBc3NpZ25TaW5nbGUsIEJhZ0VudHJ5LCBCYWdFbnRyeU1hbnksIEJhZ1NpbXBsZSwgQmxvY2tCYWcsXG5cdEJsb2NrRG8sIEJsb2NrTWFwLCBCbG9ja09iaiwgQmxvY2tWYWxUaHJvdywgQmxvY2tXaXRoUmV0dXJuLCBCbG9ja1dyYXAsIEJyZWFrLCBCcmVha1dpdGhWYWwsXG5cdENhbGwsIENhc2VEbywgQ2FzZURvUGFydCwgQ2FzZVZhbCwgQ2FzZVZhbFBhcnQsIENhdGNoLCBDbGFzcywgQ2xhc3NEbywgQ29uZGl0aW9uYWxEbyxcblx0Q29uZGl0aW9uYWxWYWwsIERlYnVnLCBJZ25vcmUsIEl0ZXJhdGVlLCBOdW1iZXJMaXRlcmFsLCBFeGNlcHREbywgRXhjZXB0VmFsLCBGb3JCYWcsIEZvckRvLFxuXHRGb3JWYWwsIEZ1biwgR2xvYmFsQWNjZXNzLCBMX0FuZCwgTF9PciwgTGF6eSwgTERfQ29uc3QsIExEX0xhenksIExEX011dGFibGUsIExvY2FsQWNjZXNzLFxuXHRMb2NhbERlY2xhcmUsIExvY2FsRGVjbGFyZUZvY3VzLCBMb2NhbERlY2xhcmVOYW1lLCBMb2NhbERlY2xhcmVSZXMsIExvY2FsRGVjbGFyZVRoaXMsXG5cdExvY2FsTXV0YXRlLCBMb2dpYywgTWFwRW50cnksIE1lbWJlciwgTWVtYmVyU2V0LCBNZXRob2RJbXBsLCBNSV9HZXQsIE1JX1BsYWluLCBNSV9TZXQsIE1vZHVsZSxcblx0TVNfTXV0YXRlLCBNU19OZXcsIE1TX05ld011dGFibGUsIE5ldywgTm90LCBPYmpFbnRyeSwgT2JqUGFpciwgT2JqU2ltcGxlLCBQYXR0ZXJuLCBRdW90ZSxcblx0UXVvdGVUZW1wbGF0ZSwgU0RfRGVidWdnZXIsIFNwZWNpYWxEbywgU3BlY2lhbFZhbCwgU1ZfTnVsbCwgU3BsYXQsIFN3aXRjaERvLCBTd2l0Y2hEb1BhcnQsXG5cdFN3aXRjaFZhbCwgU3dpdGNoVmFsUGFydCwgVGhyb3csIFZhbCwgVXNlLCBVc2VEbywgV2l0aCwgWWllbGQsIFlpZWxkVG8gfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7IERvdE5hbWUsIEdyb3VwLCBHX0Jsb2NrLCBHX0JyYWNrZXQsIEdfUGFyZW50aGVzaXMsIEdfU3BhY2UsIEdfUXVvdGUsIGlzR3JvdXAsIGlzS2V5d29yZCxcblx0S2V5d29yZCwgS1dfQW5kLCBLV19BcywgS1dfQXNzZXJ0LCBLV19Bc3NlcnROb3QsIEtXX0Fzc2lnbiwgS1dfQXNzaWduTXV0YWJsZSwgS1dfQnJlYWssXG5cdEtXX0JyZWFrV2l0aFZhbCwgS1dfQ2FzZVZhbCwgS1dfQ2FzZURvLCBLV19DbGFzcywgS1dfQ2F0Y2hEbywgS1dfQ2F0Y2hWYWwsIEtXX0NvbnN0cnVjdCxcblx0S1dfRGVidWcsIEtXX0RlYnVnZ2VyLCBLV19EbywgS1dfRWxsaXBzaXMsIEtXX0Vsc2UsIEtXX0V4Y2VwdERvLCBLV19FeGNlcHRWYWwsIEtXX0ZpbmFsbHksXG5cdEtXX0ZvckJhZywgS1dfRm9yRG8sIEtXX0ZvclZhbCwgS1dfRm9jdXMsIEtXX0Z1biwgS1dfRnVuRG8sIEtXX0Z1bkdlbiwgS1dfRnVuR2VuRG8sIEtXX0Z1blRoaXMsXG5cdEtXX0Z1blRoaXNEbywgS1dfRnVuVGhpc0dlbiwgS1dfRnVuVGhpc0dlbkRvLCBLV19HZXQsIEtXX0lmRG8sIEtXX0lmVmFsLCBLV19JZ25vcmUsIEtXX0luLFxuXHRLV19MYXp5LCBLV19Mb2NhbE11dGF0ZSwgS1dfTWFwRW50cnksIEtXX05ldywgS1dfTm90LCBLV19PYmpBc3NpZ24sIEtXX09yLCBLV19QYXNzLCBLV19PdXQsXG5cdEtXX1JlZ2lvbiwgS1dfU2V0LCBLV19TdGF0aWMsIEtXX1N3aXRjaERvLCBLV19Td2l0Y2hWYWwsIEtXX1Rocm93LCBLV19UcnlEbywgS1dfVHJ5VmFsLFxuXHRLV19UeXBlLCBLV19Vbmxlc3NEbywgS1dfVW5sZXNzVmFsLCBLV19Vc2UsIEtXX1VzZURlYnVnLCBLV19Vc2VEbywgS1dfVXNlTGF6eSwgS1dfV2l0aCxcblx0S1dfWWllbGQsIEtXX1lpZWxkVG8sIE5hbWUsIGtleXdvcmROYW1lLCBvcEtleXdvcmRLaW5kVG9TcGVjaWFsVmFsdWVLaW5kIH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQgeyBhc3NlcnQsIGhlYWQsIGlmRWxzZSwgZmxhdE1hcCwgaXNFbXB0eSwgbGFzdCxcblx0b3BJZiwgb3BNYXAsIHB1c2gsIHJlcGVhdCwgcnRhaWwsIHRhaWwsIHVuc2hpZnQgfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8vIFNpbmNlIHRoZXJlIGFyZSBzbyBtYW55IHBhcnNpbmcgZnVuY3Rpb25zLFxuLy8gaXQncyBmYXN0ZXIgKGFzIG9mIG5vZGUgdjAuMTEuMTQpIHRvIGhhdmUgdGhlbSBhbGwgY2xvc2Ugb3ZlciB0aGlzIG11dGFibGUgdmFyaWFibGUgb25jZVxuLy8gdGhhbiB0byBjbG9zZSBvdmVyIHRoZSBwYXJhbWV0ZXIgKGFzIGluIGxleC5qcywgd2hlcmUgdGhhdCdzIG11Y2ggZmFzdGVyKS5cbmxldCBjb250ZXh0XG5cbi8qXG5UaGlzIGNvbnZlcnRzIGEgVG9rZW4gdHJlZSB0byBhIE1zQXN0LlxuVGhpcyBpcyBhIHJlY3Vyc2l2ZS1kZXNjZW50IHBhcnNlciwgbWFkZSBlYXNpZXIgYnkgdHdvIGZhY3RzOlxuXHQqIFdlIGhhdmUgYWxyZWFkeSBncm91cGVkIHRva2Vucy5cblx0KiBNb3N0IG9mIHRoZSB0aW1lLCBhbiBhc3QncyB0eXBlIGlzIGRldGVybWluZWQgYnkgdGhlIGZpcnN0IHRva2VuLlxuXG5UaGVyZSBhcmUgZXhjZXB0aW9ucyBzdWNoIGFzIGFzc2lnbm1lbnQgc3RhdGVtZW50cyAoaW5kaWNhdGVkIGJ5IGEgYD1gIHNvbWV3aGVyZSBpbiB0aGUgbWlkZGxlKS5cbkZvciB0aG9zZSB3ZSBtdXN0IGl0ZXJhdGUgdGhyb3VnaCB0b2tlbnMgYW5kIHNwbGl0LlxuKFNlZSBTbGljZS5vcFNwbGl0T25jZVdoZXJlIGFuZCBTbGljZS5vcFNwbGl0TWFueVdoZXJlLilcbiovXG5leHBvcnQgZGVmYXVsdCAoX2NvbnRleHQsIHJvb3RUb2tlbikgPT4ge1xuXHRjb250ZXh0ID0gX2NvbnRleHRcblx0YXNzZXJ0KGlzR3JvdXAoR19CbG9jaywgcm9vdFRva2VuKSlcblx0Y29uc3QgbXNBc3QgPSBwYXJzZU1vZHVsZShTbGljZS5ncm91cChyb290VG9rZW4pKVxuXHQvLyBSZWxlYXNlIGZvciBnYXJiYWdlIGNvbGxlY3Rpb25zLlxuXHRjb250ZXh0ID0gdW5kZWZpbmVkXG5cdHJldHVybiBtc0FzdFxufVxuXG5jb25zdFxuXHRjaGVja0VtcHR5ID0gKHRva2VucywgbWVzc2FnZSkgPT5cblx0XHRjb250ZXh0LmNoZWNrKHRva2Vucy5pc0VtcHR5KCksIHRva2Vucy5sb2MsIG1lc3NhZ2UpLFxuXHRjaGVja05vbkVtcHR5ID0gKHRva2VucywgbWVzc2FnZSkgPT5cblx0XHRjb250ZXh0LmNoZWNrKCF0b2tlbnMuaXNFbXB0eSgpLCB0b2tlbnMubG9jLCBtZXNzYWdlKSxcblx0dW5leHBlY3RlZCA9IHRva2VuID0+IGNvbnRleHQuZmFpbCh0b2tlbi5sb2MsIGBVbmV4cGVjdGVkICR7dG9rZW59YClcblxuY29uc3QgcGFyc2VNb2R1bGUgPSB0b2tlbnMgPT4ge1xuXHQvLyBVc2Ugc3RhdGVtZW50cyBtdXN0IGFwcGVhciBpbiBvcmRlci5cblx0Y29uc3QgWyBkb1VzZXMsIHJlc3QwIF0gPSB0cnlQYXJzZVVzZXMoS1dfVXNlRG8sIHRva2Vucylcblx0Y29uc3QgWyBwbGFpblVzZXMsIHJlc3QxIF0gPSB0cnlQYXJzZVVzZXMoS1dfVXNlLCByZXN0MClcblx0Y29uc3QgWyBsYXp5VXNlcywgcmVzdDIgXSA9IHRyeVBhcnNlVXNlcyhLV19Vc2VMYXp5LCByZXN0MSlcblx0Y29uc3QgWyBkZWJ1Z1VzZXMsIHJlc3QzIF0gPSB0cnlQYXJzZVVzZXMoS1dfVXNlRGVidWcsIHJlc3QyKVxuXHRjb25zdCB7IGxpbmVzLCBleHBvcnRzLCBvcERlZmF1bHRFeHBvcnQgfSA9IHBhcnNlTW9kdWxlQmxvY2socmVzdDMpXG5cblx0aWYgKGNvbnRleHQub3B0cy5pbmNsdWRlTW9kdWxlTmFtZSgpICYmICFleHBvcnRzLnNvbWUoXyA9PiBfLm5hbWUgPT09ICduYW1lJykpIHtcblx0XHRjb25zdCBuYW1lID0gbmV3IExvY2FsRGVjbGFyZU5hbWUodG9rZW5zLmxvYylcblx0XHRsaW5lcy5wdXNoKG5ldyBBc3NpZ25TaW5nbGUodG9rZW5zLmxvYywgbmFtZSxcblx0XHRcdFF1b3RlLmZvclN0cmluZyh0b2tlbnMubG9jLCBjb250ZXh0Lm9wdHMubW9kdWxlTmFtZSgpKSkpXG5cdFx0ZXhwb3J0cy5wdXNoKG5hbWUpXG5cdH1cblx0Y29uc3QgdXNlcyA9IHBsYWluVXNlcy5jb25jYXQobGF6eVVzZXMpXG5cdHJldHVybiBuZXcgTW9kdWxlKHRva2Vucy5sb2MsIGRvVXNlcywgdXNlcywgZGVidWdVc2VzLCBsaW5lcywgZXhwb3J0cywgb3BEZWZhdWx0RXhwb3J0KVxufVxuXG4vLyBwYXJzZUJsb2NrXG5jb25zdFxuXHQvLyBUb2tlbnMgb24gdGhlIGxpbmUgYmVmb3JlIGEgYmxvY2ssIGFuZCB0b2tlbnMgZm9yIHRoZSBibG9jayBpdHNlbGYuXG5cdGJlZm9yZUFuZEJsb2NrID0gdG9rZW5zID0+IHtcblx0XHRjaGVja05vbkVtcHR5KHRva2VucywgJ0V4cGVjdGVkIGFuIGluZGVudGVkIGJsb2NrLicpXG5cdFx0Y29uc3QgYmxvY2sgPSB0b2tlbnMubGFzdCgpXG5cdFx0Y29udGV4dC5jaGVjayhpc0dyb3VwKEdfQmxvY2ssIGJsb2NrKSwgYmxvY2subG9jLCAnRXhwZWN0ZWQgYW4gaW5kZW50ZWQgYmxvY2suJylcblx0XHRyZXR1cm4gWyB0b2tlbnMucnRhaWwoKSwgU2xpY2UuZ3JvdXAoYmxvY2spIF1cblx0fSxcblxuXHRibG9ja1dyYXAgPSB0b2tlbnMgPT4gbmV3IEJsb2NrV3JhcCh0b2tlbnMubG9jLCBwYXJzZUJsb2NrVmFsKHRva2VucykpLFxuXG5cdGp1c3RCbG9jayA9IChrZXl3b3JkLCB0b2tlbnMpID0+IHtcblx0XHRjb25zdCBbIGJlZm9yZSwgYmxvY2sgXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0XHRjaGVja0VtcHR5KGJlZm9yZSwgKCkgPT5cblx0XHRcdGBEaWQgbm90IGV4cGVjdCBhbnl0aGluZyBiZXR3ZWVuICR7Y29kZShrZXl3b3JkTmFtZShrZXl3b3JkKSl9IGFuZCBibG9jay5gKVxuXHRcdHJldHVybiBibG9ja1xuXHR9LFxuXHRqdXN0QmxvY2tEbyA9IChrZXl3b3JkLCB0b2tlbnMpID0+XG5cdFx0cGFyc2VCbG9ja0RvKGp1c3RCbG9jayhrZXl3b3JkLCB0b2tlbnMpKSxcblx0anVzdEJsb2NrVmFsID0gKGtleXdvcmQsIHRva2VucykgPT5cblx0XHRwYXJzZUJsb2NrVmFsKGp1c3RCbG9jayhrZXl3b3JkLCB0b2tlbnMpKSxcblxuXHQvLyBHZXRzIGxpbmVzIGluIGEgcmVnaW9uIG9yIERlYnVnLlxuXHRwYXJzZUxpbmVzRnJvbUJsb2NrID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXHRcdGNvbnRleHQuY2hlY2sodG9rZW5zLnNpemUoKSA+IDEsIGgubG9jLCAoKSA9PiBgRXhwZWN0ZWQgaW5kZW50ZWQgYmxvY2sgYWZ0ZXIgJHtofWApXG5cdFx0Y29uc3QgYmxvY2sgPSB0b2tlbnMuc2Vjb25kKClcblx0XHRhc3NlcnQodG9rZW5zLnNpemUoKSA9PT0gMiAmJiBpc0dyb3VwKEdfQmxvY2ssIGJsb2NrKSlcblx0XHRyZXR1cm4gZmxhdE1hcChibG9jay5zdWJUb2tlbnMsIGxpbmUgPT4gcGFyc2VMaW5lT3JMaW5lcyhTbGljZS5ncm91cChsaW5lKSkpXG5cdH0sXG5cblx0cGFyc2VCbG9ja0RvID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBsaW5lcyA9IF9wbGFpbkJsb2NrTGluZXModG9rZW5zKVxuXHRcdHJldHVybiBuZXcgQmxvY2tEbyh0b2tlbnMubG9jLCBsaW5lcylcblx0fSxcblxuXHRwYXJzZUJsb2NrVmFsID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCB7IGxpbmVzLCBrUmV0dXJuIH0gPSBfcGFyc2VCbG9ja0xpbmVzKHRva2Vucylcblx0XHRzd2l0Y2ggKGtSZXR1cm4pIHtcblx0XHRcdGNhc2UgS1JldHVybl9CYWc6XG5cdFx0XHRcdHJldHVybiBCbG9ja0JhZy5vZih0b2tlbnMubG9jLCBsaW5lcylcblx0XHRcdGNhc2UgS1JldHVybl9NYXA6XG5cdFx0XHRcdHJldHVybiBCbG9ja01hcC5vZih0b2tlbnMubG9jLCBsaW5lcylcblx0XHRcdGNhc2UgS1JldHVybl9PYmo6XG5cdFx0XHRcdGNvbnN0IFsgZG9MaW5lcywgb3BWYWwgXSA9IF90cnlUYWtlTGFzdFZhbChsaW5lcylcblx0XHRcdFx0Ly8gb3BOYW1lIHdyaXR0ZW4gdG8gYnkgX3RyeUFkZE5hbWUuXG5cdFx0XHRcdHJldHVybiBCbG9ja09iai5vZih0b2tlbnMubG9jLCBkb0xpbmVzLCBvcFZhbCwgbnVsbClcblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0Y29udGV4dC5jaGVjayghaXNFbXB0eShsaW5lcyksIHRva2Vucy5sb2MsICdWYWx1ZSBibG9jayBtdXN0IGVuZCBpbiBhIHZhbHVlLicpXG5cdFx0XHRcdGNvbnN0IHZhbCA9IGxhc3QobGluZXMpXG5cdFx0XHRcdGlmICh2YWwgaW5zdGFuY2VvZiBUaHJvdylcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEJsb2NrVmFsVGhyb3codG9rZW5zLmxvYywgcnRhaWwobGluZXMpLCB2YWwpXG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2sodmFsIGluc3RhbmNlb2YgVmFsLCB2YWwubG9jLCAnVmFsdWUgYmxvY2sgbXVzdCBlbmQgaW4gYSB2YWx1ZS4nKVxuXHRcdFx0XHRcdHJldHVybiBuZXcgQmxvY2tXaXRoUmV0dXJuKHRva2Vucy5sb2MsIHJ0YWlsKGxpbmVzKSwgdmFsKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdHBhcnNlTW9kdWxlQmxvY2sgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IHsgbGluZXMsIGtSZXR1cm4gfSA9IF9wYXJzZUJsb2NrTGluZXModG9rZW5zKVxuXHRcdGNvbnN0IGxvYyA9IHRva2Vucy5sb2Ncblx0XHRzd2l0Y2ggKGtSZXR1cm4pIHtcblx0XHRcdGNhc2UgS1JldHVybl9CYWc6IGNhc2UgS1JldHVybl9NYXA6IHtcblx0XHRcdFx0Y29uc3QgYmxvY2sgPSAoa1JldHVybiA9PT0gS1JldHVybl9CYWcgPyBCbG9ja0JhZyA6IEJsb2NrTWFwKS5vZihsb2MsIGxpbmVzKVxuXHRcdFx0XHRyZXR1cm4geyBsaW5lczogWyBdLCBleHBvcnRzOiBbIF0sIG9wRGVmYXVsdEV4cG9ydDogbmV3IEJsb2NrV3JhcChsb2MsIGJsb2NrKSB9XG5cdFx0XHR9XG5cdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdGNvbnN0IGV4cG9ydHMgPSBbIF1cblx0XHRcdFx0bGV0IG9wRGVmYXVsdEV4cG9ydCA9IG51bGxcblx0XHRcdFx0Y29uc3QgbW9kdWxlTmFtZSA9IGNvbnRleHQub3B0cy5tb2R1bGVOYW1lKClcblxuXHRcdFx0XHQvLyBNb2R1bGUgZXhwb3J0cyBsb29rIGxpa2UgYSBCbG9ja09iaiwgIGJ1dCBhcmUgcmVhbGx5IGRpZmZlcmVudC5cblx0XHRcdFx0Ly8gSW4gRVM2LCBtb2R1bGUgZXhwb3J0cyBtdXN0IGJlIGNvbXBsZXRlbHkgc3RhdGljLlxuXHRcdFx0XHQvLyBTbyB3ZSBrZWVwIGFuIGFycmF5IG9mIGV4cG9ydHMgYXR0YWNoZWQgZGlyZWN0bHkgdG8gdGhlIE1vZHVsZSBhc3QuXG5cdFx0XHRcdC8vIElmIHlvdSB3cml0ZTpcblx0XHRcdFx0Ly9cdGlmISBjb25kXG5cdFx0XHRcdC8vXHRcdGEuIGJcblx0XHRcdFx0Ly8gaW4gYSBtb2R1bGUgY29udGV4dCwgaXQgd2lsbCBiZSBhbiBlcnJvci4gKFRoZSBtb2R1bGUgY3JlYXRlcyBubyBgYnVpbHRgIGxvY2FsLilcblx0XHRcdFx0Y29uc3QgZ2V0TGluZUV4cG9ydHMgPSBsaW5lID0+IHtcblx0XHRcdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIE9iakVudHJ5KSB7XG5cdFx0XHRcdFx0XHRmb3IgKGNvbnN0IF8gb2YgbGluZS5hc3NpZ24uYWxsQXNzaWduZWVzKCkpXG5cdFx0XHRcdFx0XHRcdGlmIChfLm5hbWUgPT09IG1vZHVsZU5hbWUpIHtcblx0XHRcdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKG9wRGVmYXVsdEV4cG9ydCA9PT0gbnVsbCwgXy5sb2MsICgpID0+XG5cdFx0XHRcdFx0XHRcdFx0XHRgRGVmYXVsdCBleHBvcnQgYWxyZWFkeSBkZWNsYXJlZCBhdCAke29wRGVmYXVsdEV4cG9ydC5sb2N9YClcblx0XHRcdFx0XHRcdFx0XHRvcERlZmF1bHRFeHBvcnQgPSBuZXcgTG9jYWxBY2Nlc3MoXy5sb2MsIF8ubmFtZSlcblx0XHRcdFx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0XHRcdFx0ZXhwb3J0cy5wdXNoKF8pXG5cdFx0XHRcdFx0XHRyZXR1cm4gbGluZS5hc3NpZ25cblx0XHRcdFx0XHR9IGVsc2UgaWYgKGxpbmUgaW5zdGFuY2VvZiBEZWJ1Zylcblx0XHRcdFx0XHRcdGxpbmUubGluZXMgPSBsaW5lLmxpbmVzLm1hcChnZXRMaW5lRXhwb3J0cylcblx0XHRcdFx0XHRyZXR1cm4gbGluZVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgbW9kdWxlTGluZXMgPSBsaW5lcy5tYXAoZ2V0TGluZUV4cG9ydHMpXG5cblx0XHRcdFx0aWYgKGlzRW1wdHkoZXhwb3J0cykgJiYgb3BEZWZhdWx0RXhwb3J0ID09PSBudWxsKSB7XG5cdFx0XHRcdFx0Y29uc3QgWyBsaW5lcywgb3BEZWZhdWx0RXhwb3J0IF0gPSBfdHJ5VGFrZUxhc3RWYWwobW9kdWxlTGluZXMpXG5cdFx0XHRcdFx0cmV0dXJuIHsgbGluZXMsIGV4cG9ydHMsIG9wRGVmYXVsdEV4cG9ydCB9XG5cdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdHJldHVybiB7IGxpbmVzOiBtb2R1bGVMaW5lcywgZXhwb3J0cywgb3BEZWZhdWx0RXhwb3J0IH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuLy8gcGFyc2VCbG9jayBwcml2YXRlc1xuY29uc3Rcblx0X3RyeVRha2VMYXN0VmFsID0gbGluZXMgPT5cblx0XHQoIWlzRW1wdHkobGluZXMpICYmIGxhc3QobGluZXMpIGluc3RhbmNlb2YgVmFsKSA/XG5cdFx0XHRbIHJ0YWlsKGxpbmVzKSwgbGFzdChsaW5lcykgXSA6XG5cdFx0XHRbIGxpbmVzLCBudWxsIF0sXG5cblx0X3BsYWluQmxvY2tMaW5lcyA9IGxpbmVUb2tlbnMgPT4ge1xuXHRcdGNvbnN0IGxpbmVzID0gWyBdXG5cdFx0Y29uc3QgYWRkTGluZSA9IGxpbmUgPT4ge1xuXHRcdFx0aWYgKGxpbmUgaW5zdGFuY2VvZiBBcnJheSlcblx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIGxpbmUpXG5cdFx0XHRcdFx0YWRkTGluZShfKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRsaW5lcy5wdXNoKGxpbmUpXG5cdFx0fVxuXHRcdGxpbmVUb2tlbnMuZWFjaChfID0+IGFkZExpbmUocGFyc2VMaW5lKFNsaWNlLmdyb3VwKF8pKSkpXG5cdFx0cmV0dXJuIGxpbmVzXG5cdH0sXG5cblx0S1JldHVybl9QbGFpbiA9IDAsXG5cdEtSZXR1cm5fT2JqID0gMSxcblx0S1JldHVybl9CYWcgPSAyLFxuXHRLUmV0dXJuX01hcCA9IDMsXG5cdF9wYXJzZUJsb2NrTGluZXMgPSBsaW5lVG9rZW5zID0+IHtcblx0XHRsZXQgaXNCYWcgPSBmYWxzZSwgaXNNYXAgPSBmYWxzZSwgaXNPYmogPSBmYWxzZVxuXHRcdGNvbnN0IGNoZWNrTGluZSA9IGxpbmUgPT4ge1xuXHRcdFx0aWYgKGxpbmUgaW5zdGFuY2VvZiBEZWJ1Zylcblx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIGxpbmUubGluZXMpXG5cdFx0XHRcdFx0Y2hlY2tMaW5lKF8pXG5cdFx0XHRlbHNlIGlmIChsaW5lIGluc3RhbmNlb2YgQmFnRW50cnkpXG5cdFx0XHRcdGlzQmFnID0gdHJ1ZVxuXHRcdFx0ZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIE1hcEVudHJ5KVxuXHRcdFx0XHRpc01hcCA9IHRydWVcblx0XHRcdGVsc2UgaWYgKGxpbmUgaW5zdGFuY2VvZiBPYmpFbnRyeSlcblx0XHRcdFx0aXNPYmogPSB0cnVlXG5cdFx0fVxuXHRcdGNvbnN0IGxpbmVzID0gX3BsYWluQmxvY2tMaW5lcyhsaW5lVG9rZW5zKVxuXHRcdGZvciAoY29uc3QgXyBvZiBsaW5lcylcblx0XHRcdGNoZWNrTGluZShfKVxuXG5cdFx0Y29udGV4dC5jaGVjayghKGlzT2JqICYmIGlzQmFnKSwgbGluZXMubG9jLCAnQmxvY2sgaGFzIGJvdGggQmFnIGFuZCBPYmogbGluZXMuJylcblx0XHRjb250ZXh0LmNoZWNrKCEoaXNPYmogJiYgaXNNYXApLCBsaW5lcy5sb2MsICdCbG9jayBoYXMgYm90aCBPYmogYW5kIE1hcCBsaW5lcy4nKVxuXHRcdGNvbnRleHQuY2hlY2soIShpc0JhZyAmJiBpc01hcCksIGxpbmVzLmxvYywgJ0Jsb2NrIGhhcyBib3RoIEJhZyBhbmQgTWFwIGxpbmVzLicpXG5cblx0XHRjb25zdCBrUmV0dXJuID1cblx0XHRcdGlzT2JqID8gS1JldHVybl9PYmogOiBpc0JhZyA/IEtSZXR1cm5fQmFnIDogaXNNYXAgPyBLUmV0dXJuX01hcCA6IEtSZXR1cm5fUGxhaW5cblx0XHRyZXR1cm4geyBsaW5lcywga1JldHVybiB9XG5cdH1cblxuY29uc3QgcGFyc2VDYXNlID0gKGlzVmFsLCBjYXNlZEZyb21GdW4sIHRva2VucykgPT4ge1xuXHRjb25zdCBbIGJlZm9yZSwgYmxvY2sgXSA9IGJlZm9yZUFuZEJsb2NrKHRva2VucylcblxuXHRsZXQgb3BDYXNlZFxuXHRpZiAoY2FzZWRGcm9tRnVuKSB7XG5cdFx0Y2hlY2tFbXB0eShiZWZvcmUsICdDYW5cXCd0IG1ha2UgZm9jdXMgLS0gaXMgaW1wbGljaXRseSBwcm92aWRlZCBhcyBmaXJzdCBhcmd1bWVudC4nKVxuXHRcdG9wQ2FzZWQgPSBudWxsXG5cdH0gZWxzZVxuXHRcdG9wQ2FzZWQgPSBvcElmKCFiZWZvcmUuaXNFbXB0eSgpLCAoKSA9PiBBc3NpZ25TaW5nbGUuZm9jdXMoYmVmb3JlLmxvYywgcGFyc2VFeHByKGJlZm9yZSkpKVxuXG5cdGNvbnN0IGxhc3RMaW5lID0gU2xpY2UuZ3JvdXAoYmxvY2subGFzdCgpKVxuXHRjb25zdCBbIHBhcnRMaW5lcywgb3BFbHNlIF0gPSBpc0tleXdvcmQoS1dfRWxzZSwgbGFzdExpbmUuaGVhZCgpKSA/XG5cdFx0WyBibG9jay5ydGFpbCgpLCAoaXNWYWwgPyBqdXN0QmxvY2tWYWwgOiBqdXN0QmxvY2tEbykoS1dfRWxzZSwgbGFzdExpbmUudGFpbCgpKSBdIDpcblx0XHRbIGJsb2NrLCBudWxsIF1cblxuXHRjb25zdCBwYXJ0cyA9IHBhcnRMaW5lcy5tYXBTbGljZXMoX3BhcnNlQ2FzZUxpbmUoaXNWYWwpKVxuXHRjb250ZXh0LmNoZWNrKHBhcnRzLmxlbmd0aCA+IDAsIHRva2Vucy5sb2MsICgpID0+XG5cdFx0YE11c3QgaGF2ZSBhdCBsZWFzdCAxIG5vbi0ke2NvZGUoJ2Vsc2UnKX0gdGVzdC5gKVxuXG5cdHJldHVybiBuZXcgKGlzVmFsID8gQ2FzZVZhbCA6IENhc2VEbykodG9rZW5zLmxvYywgb3BDYXNlZCwgcGFydHMsIG9wRWxzZSlcbn1cbi8vIHBhcnNlQ2FzZSBwcml2YXRlc1xuY29uc3Rcblx0X3BhcnNlQ2FzZUxpbmUgPSBpc1ZhbCA9PiBsaW5lID0+IHtcblx0XHRjb25zdCBbIGJlZm9yZSwgYmxvY2sgXSA9IGJlZm9yZUFuZEJsb2NrKGxpbmUpXG5cdFx0Y29uc3QgdGVzdCA9IF9wYXJzZUNhc2VUZXN0KGJlZm9yZSlcblx0XHRjb25zdCByZXN1bHQgPSAoaXNWYWwgPyBwYXJzZUJsb2NrVmFsIDogcGFyc2VCbG9ja0RvKShibG9jaylcblx0XHRyZXR1cm4gbmV3IChpc1ZhbCA/IENhc2VWYWxQYXJ0IDogQ2FzZURvUGFydCkobGluZS5sb2MsIHRlc3QsIHJlc3VsdClcblx0fSxcblx0X3BhcnNlQ2FzZVRlc3QgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGZpcnN0ID0gdG9rZW5zLmhlYWQoKVxuXHRcdC8vIFBhdHRlcm4gbWF0Y2ggc3RhcnRzIHdpdGggdHlwZSB0ZXN0IGFuZCBpcyBmb2xsb3dlZCBieSBsb2NhbCBkZWNsYXJlcy5cblx0XHQvLyBFLmcuLCBgOlNvbWUgdmFsYFxuXHRcdGlmIChpc0dyb3VwKEdfU3BhY2UsIGZpcnN0KSAmJiB0b2tlbnMuc2l6ZSgpID4gMSkge1xuXHRcdFx0Y29uc3QgZnQgPSBTbGljZS5ncm91cChmaXJzdClcblx0XHRcdGlmIChpc0tleXdvcmQoS1dfVHlwZSwgZnQuaGVhZCgpKSkge1xuXHRcdFx0XHRjb25zdCB0eXBlID0gcGFyc2VTcGFjZWQoZnQudGFpbCgpKVxuXHRcdFx0XHRjb25zdCBsb2NhbHMgPSBwYXJzZUxvY2FsRGVjbGFyZXModG9rZW5zLnRhaWwoKSlcblx0XHRcdFx0cmV0dXJuIG5ldyBQYXR0ZXJuKGZpcnN0LmxvYywgdHlwZSwgbG9jYWxzLCBMb2NhbEFjY2Vzcy5mb2N1cyh0b2tlbnMubG9jKSlcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHBhcnNlRXhwcih0b2tlbnMpXG5cdH1cblxuY29uc3QgcGFyc2VTd2l0Y2ggPSAoaXNWYWwsIHRva2VucykgPT4ge1xuXHRjb25zdCBbIGJlZm9yZSwgYmxvY2sgXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0Y29uc3Qgc3dpdGNoZWQgPSBwYXJzZUV4cHIoYmVmb3JlKVxuXHRjb25zdCBsYXN0TGluZSA9IFNsaWNlLmdyb3VwKGJsb2NrLmxhc3QoKSlcblx0Y29uc3QgWyBwYXJ0TGluZXMsIG9wRWxzZSBdID0gaXNLZXl3b3JkKEtXX0Vsc2UsIGxhc3RMaW5lLmhlYWQoKSkgP1xuXHRcdFsgYmxvY2sucnRhaWwoKSwgKGlzVmFsID8ganVzdEJsb2NrVmFsIDoganVzdEJsb2NrRG8pKEtXX0Vsc2UsIGxhc3RMaW5lLnRhaWwoKSkgXSA6XG5cdFx0WyBibG9jaywgbnVsbCBdXG5cblx0Y29uc3QgcGFydHMgPSBwYXJ0TGluZXMubWFwU2xpY2VzKF9wYXJzZVN3aXRjaExpbmUoaXNWYWwpKVxuXHRjb250ZXh0LmNoZWNrKHBhcnRzLmxlbmd0aCA+IDAsIHRva2Vucy5sb2MsICgpID0+XG5cdFx0YE11c3QgaGF2ZSBhdCBsZWFzdCAxIG5vbi0ke2NvZGUoJ2Vsc2UnKX0gdGVzdC5gKVxuXG5cdHJldHVybiBuZXcgKGlzVmFsID8gU3dpdGNoVmFsIDogU3dpdGNoRG8pKHRva2Vucy5sb2MsIHN3aXRjaGVkLCBwYXJ0cywgb3BFbHNlKVxufVxuY29uc3Rcblx0X3BhcnNlU3dpdGNoTGluZSA9IGlzVmFsID0+IGxpbmUgPT4ge1xuXHRcdGNvbnN0IFsgYmVmb3JlLCBibG9jayBdID0gYmVmb3JlQW5kQmxvY2sobGluZSlcblxuXHRcdGxldCB2YWx1ZXNcblx0XHRpZiAoaXNLZXl3b3JkKEtXX09yLCBiZWZvcmUuaGVhZCgpKSlcblx0XHRcdHZhbHVlcyA9IGJlZm9yZS50YWlsKCkubWFwKHBhcnNlU2luZ2xlKVxuXHRcdGVsc2Vcblx0XHRcdHZhbHVlcyA9IFsgcGFyc2VFeHByKGJlZm9yZSkgXVxuXG5cdFx0Y29uc3QgcmVzdWx0ID0gKGlzVmFsID8gcGFyc2VCbG9ja1ZhbCA6IHBhcnNlQmxvY2tEbykoYmxvY2spXG5cdFx0cmV0dXJuIG5ldyAoaXNWYWwgPyBTd2l0Y2hWYWxQYXJ0IDogU3dpdGNoRG9QYXJ0KShsaW5lLmxvYywgdmFsdWVzLCByZXN1bHQpXG5cdH1cblxuY29uc3Rcblx0cGFyc2VFeHByID0gdG9rZW5zID0+IHtcblx0XHRyZXR1cm4gaWZFbHNlKHRva2Vucy5vcFNwbGl0TWFueVdoZXJlKF8gPT4gaXNLZXl3b3JkKEtXX09iakFzc2lnbiwgXykpLFxuXHRcdFx0c3BsaXRzID0+IHtcblx0XHRcdFx0Ly8gU2hvcnQgb2JqZWN0IGZvcm0sIHN1Y2ggYXMgKGEuIDEsIGIuIDIpXG5cdFx0XHRcdGNvbnN0IGZpcnN0ID0gc3BsaXRzWzBdLmJlZm9yZVxuXHRcdFx0XHRjaGVja05vbkVtcHR5KGZpcnN0LCAoKSA9PiBgVW5leHBlY3RlZCAke3NwbGl0c1swXS5hdH1gKVxuXHRcdFx0XHRjb25zdCB0b2tlbnNDYWxsZXIgPSBmaXJzdC5ydGFpbCgpXG5cblx0XHRcdFx0Y29uc3QgcGFpcnMgPSBbIF1cblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzcGxpdHMubGVuZ3RoIC0gMTsgaSA9IGkgKyAxKSB7XG5cdFx0XHRcdFx0Y29uc3QgbmFtZSA9IHNwbGl0c1tpXS5iZWZvcmUubGFzdCgpXG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayhuYW1lIGluc3RhbmNlb2YgTmFtZSwgbmFtZS5sb2MsICgpID0+XG5cdFx0XHRcdFx0XHRgRXhwZWN0ZWQgYSBuYW1lLCBub3QgJHtuYW1lfWApXG5cdFx0XHRcdFx0Y29uc3QgdG9rZW5zVmFsdWUgPSBpID09PSBzcGxpdHMubGVuZ3RoIC0gMiA/XG5cdFx0XHRcdFx0XHRzcGxpdHNbaSArIDFdLmJlZm9yZSA6XG5cdFx0XHRcdFx0XHRzcGxpdHNbaSArIDFdLmJlZm9yZS5ydGFpbCgpXG5cdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBwYXJzZUV4cHJQbGFpbih0b2tlbnNWYWx1ZSlcblx0XHRcdFx0XHRjb25zdCBsb2MgPSBuZXcgTG9jKG5hbWUubG9jLnN0YXJ0LCB0b2tlbnNWYWx1ZS5sb2MuZW5kKVxuXHRcdFx0XHRcdHBhaXJzLnB1c2gobmV3IE9ialBhaXIobG9jLCBuYW1lLm5hbWUsIHZhbHVlKSlcblx0XHRcdFx0fVxuXHRcdFx0XHRhc3NlcnQobGFzdChzcGxpdHMpLmF0ID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdGNvbnN0IHZhbCA9IG5ldyBPYmpTaW1wbGUodG9rZW5zLmxvYywgcGFpcnMpXG5cdFx0XHRcdGlmICh0b2tlbnNDYWxsZXIuaXNFbXB0eSgpKVxuXHRcdFx0XHRcdHJldHVybiB2YWxcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyh0b2tlbnNDYWxsZXIpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBDYWxsKHRva2Vucy5sb2MsIGhlYWQocGFydHMpLCBwdXNoKHRhaWwocGFydHMpLCB2YWwpKVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0KCkgPT4gcGFyc2VFeHByUGxhaW4odG9rZW5zKVxuXHRcdClcblx0fSxcblxuXHRwYXJzZUV4cHJQbGFpbiA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyh0b2tlbnMpXG5cdFx0c3dpdGNoIChwYXJ0cy5sZW5ndGgpIHtcblx0XHRcdGNhc2UgMDpcblx0XHRcdFx0Y29udGV4dC5mYWlsKHRva2Vucy5sb2MsICdFeHBlY3RlZCBhbiBleHByZXNzaW9uLCBnb3Qgbm90aGluZy4nKVxuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRyZXR1cm4gaGVhZChwYXJ0cylcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBuZXcgQ2FsbCh0b2tlbnMubG9jLCBoZWFkKHBhcnRzKSwgdGFpbChwYXJ0cykpXG5cdFx0fVxuXHR9LFxuXG5cdHBhcnNlRXhwclBhcnRzID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBvcFNwbGl0ID0gdG9rZW5zLm9wU3BsaXRPbmNlV2hlcmUodG9rZW4gPT4ge1xuXHRcdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRcdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRcdFx0Y2FzZSBLV19BbmQ6IGNhc2UgS1dfQ2FzZVZhbDogY2FzZSBLV19DbGFzczogY2FzZSBLV19FeGNlcHRWYWw6IGNhc2UgS1dfRm9yQmFnOlxuXHRcdFx0XHRcdGNhc2UgS1dfRm9yVmFsOiBjYXNlIEtXX0Z1bjogY2FzZSBLV19GdW5EbzogY2FzZSBLV19GdW5HZW46IGNhc2UgS1dfRnVuR2VuRG86XG5cdFx0XHRcdFx0Y2FzZSBLV19GdW5UaGlzOiBjYXNlIEtXX0Z1blRoaXNEbzogY2FzZSBLV19GdW5UaGlzR2VuOiBjYXNlIEtXX0Z1blRoaXNHZW5Ebzpcblx0XHRcdFx0XHRjYXNlIEtXX0lmVmFsOiBjYXNlIEtXX05ldzogY2FzZSBLV19Ob3Q6IGNhc2UgS1dfT3I6IGNhc2UgS1dfU3dpdGNoVmFsOlxuXHRcdFx0XHRcdGNhc2UgS1dfVW5sZXNzVmFsOiBjYXNlIEtXX1dpdGg6IGNhc2UgS1dfWWllbGQ6IGNhc2UgS1dfWWllbGRUbzpcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHR9KVxuXHRcdHJldHVybiBpZkVsc2Uob3BTcGxpdCxcblx0XHRcdCh7IGJlZm9yZSwgYXQsIGFmdGVyIH0pID0+IHtcblx0XHRcdFx0Y29uc3QgbGFzdCA9ICgoKSA9PiB7XG5cdFx0XHRcdFx0c3dpdGNoIChhdC5raW5kKSB7XG5cdFx0XHRcdFx0XHRjYXNlIEtXX0FuZDogY2FzZSBLV19Pcjpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBMb2dpYyhhdC5sb2MsIGF0LmtpbmQgPT09IEtXX0FuZCA/IExfQW5kIDogTF9Pcixcblx0XHRcdFx0XHRcdFx0XHRwYXJzZUV4cHJQYXJ0cyhhZnRlcikpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX0Nhc2VWYWw6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUNhc2UodHJ1ZSwgZmFsc2UsIGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19DbGFzczpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlQ2xhc3MoYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX0V4Y2VwdFZhbDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlRXhjZXB0KEtXX0V4Y2VwdFZhbCwgYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX0ZvckJhZzpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlRm9yQmFnKGFmdGVyKVxuXHRcdFx0XHRcdFx0Y2FzZSBLV19Gb3JWYWw6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUZvclZhbChhZnRlcilcblx0XHRcdFx0XHRcdGNhc2UgS1dfRnVuOiBjYXNlIEtXX0Z1bkRvOiBjYXNlIEtXX0Z1bkdlbjogY2FzZSBLV19GdW5HZW5Ebzpcblx0XHRcdFx0XHRcdGNhc2UgS1dfRnVuVGhpczogY2FzZSBLV19GdW5UaGlzRG86IGNhc2UgS1dfRnVuVGhpc0dlbjpcblx0XHRcdFx0XHRcdGNhc2UgS1dfRnVuVGhpc0dlbkRvOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VGdW4oYXQua2luZCwgYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX0lmVmFsOiBjYXNlIEtXX1VubGVzc1ZhbDoge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBbIGJlZm9yZSwgYmxvY2sgXSA9IGJlZm9yZUFuZEJsb2NrKGFmdGVyKVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsVmFsKHRva2Vucy5sb2MsXG5cdFx0XHRcdFx0XHRcdFx0cGFyc2VFeHByUGxhaW4oYmVmb3JlKSxcblx0XHRcdFx0XHRcdFx0XHRwYXJzZUJsb2NrVmFsKGJsb2NrKSxcblx0XHRcdFx0XHRcdFx0XHRhdC5raW5kID09PSBLV19Vbmxlc3NWYWwpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjYXNlIEtXX05ldzoge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKGFmdGVyKVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV3IE5ldyhhdC5sb2MsIHBhcnRzWzBdLCB0YWlsKHBhcnRzKSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNhc2UgS1dfTm90OlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV3IE5vdChhdC5sb2MsIHBhcnNlRXhwclBsYWluKGFmdGVyKSlcblx0XHRcdFx0XHRcdGNhc2UgS1dfU3dpdGNoVmFsOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VTd2l0Y2godHJ1ZSwgYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX1dpdGg6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXJzZVdpdGgoYWZ0ZXIpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX1lpZWxkOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV3IFlpZWxkKGF0LmxvYyxcblx0XHRcdFx0XHRcdFx0XHRvcElmKCFhZnRlci5pc0VtcHR5KCksICgpID0+IHBhcnNlRXhwclBsYWluKGFmdGVyKSkpXG5cdFx0XHRcdFx0XHRjYXNlIEtXX1lpZWxkVG86XG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXcgWWllbGRUbyhhdC5sb2MsIHBhcnNlRXhwclBsYWluKGFmdGVyKSlcblx0XHRcdFx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcihhdC5raW5kKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkoKVxuXHRcdFx0XHRyZXR1cm4gcHVzaChiZWZvcmUubWFwKHBhcnNlU2luZ2xlKSwgbGFzdClcblx0XHRcdH0sXG5cdFx0XHQoKSA9PiB0b2tlbnMubWFwKHBhcnNlU2luZ2xlKSlcblx0fVxuXG5jb25zdCBwYXJzZUZ1biA9IChraW5kLCB0b2tlbnMpID0+IHtcblx0bGV0IGlzVGhpcyA9IGZhbHNlLCBpc0RvID0gZmFsc2UsIGlzR2VuID0gZmFsc2Vcblx0c3dpdGNoIChraW5kKSB7XG5cdFx0Y2FzZSBLV19GdW46XG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuRG86XG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1bkdlbjpcblx0XHRcdGlzR2VuID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1bkdlbkRvOlxuXHRcdFx0aXNHZW4gPSB0cnVlXG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1blRoaXM6XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuVGhpc0RvOlxuXHRcdFx0aXNUaGlzID0gdHJ1ZVxuXHRcdFx0aXNEbyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5UaGlzR2VuOlxuXHRcdFx0aXNUaGlzID0gdHJ1ZVxuXHRcdFx0aXNHZW4gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuVGhpc0dlbkRvOlxuXHRcdFx0aXNUaGlzID0gdHJ1ZVxuXHRcdFx0aXNHZW4gPSB0cnVlXG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoKVxuXHR9XG5cdGNvbnN0IG9wRGVjbGFyZVRoaXMgPSBvcElmKGlzVGhpcywgKCkgPT4gbmV3IExvY2FsRGVjbGFyZVRoaXModG9rZW5zLmxvYykpXG5cblx0Y29uc3QgeyBvcFJldHVyblR5cGUsIHJlc3QgfSA9IF90cnlUYWtlUmV0dXJuVHlwZSh0b2tlbnMpXG5cdGNvbnN0IHsgYXJncywgb3BSZXN0QXJnLCBibG9jaywgb3BJbiwgb3BPdXQgfSA9IF9mdW5BcmdzQW5kQmxvY2soaXNEbywgcmVzdClcblx0Ly8gTmVlZCByZXMgZGVjbGFyZSBpZiB0aGVyZSBpcyBhIHJldHVybiB0eXBlIG9yIG91dCBjb25kaXRpb24uXG5cdGNvbnN0IG9wRGVjbGFyZVJlcyA9IGlmRWxzZShvcFJldHVyblR5cGUsXG5cdFx0XyA9PiBuZXcgTG9jYWxEZWNsYXJlUmVzKF8ubG9jLCBfKSxcblx0XHQoKSA9PiBvcE1hcChvcE91dCwgXyA9PiBuZXcgTG9jYWxEZWNsYXJlUmVzKF8ubG9jLCBudWxsKSkpXG5cdHJldHVybiBuZXcgRnVuKHRva2Vucy5sb2MsXG5cdFx0b3BEZWNsYXJlVGhpcywgaXNHZW4sIGFyZ3MsIG9wUmVzdEFyZywgYmxvY2ssIG9wSW4sIG9wRGVjbGFyZVJlcywgb3BPdXQpXG59XG5cbi8vIHBhcnNlRnVuIHByaXZhdGVzXG5jb25zdFxuXHRfdHJ5VGFrZVJldHVyblR5cGUgPSB0b2tlbnMgPT4ge1xuXHRcdGlmICghdG9rZW5zLmlzRW1wdHkoKSkge1xuXHRcdFx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKClcblx0XHRcdGlmIChpc0dyb3VwKEdfU3BhY2UsIGgpICYmIGlzS2V5d29yZChLV19UeXBlLCBoZWFkKGguc3ViVG9rZW5zKSkpXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0b3BSZXR1cm5UeXBlOiBwYXJzZVNwYWNlZChTbGljZS5ncm91cChoKS50YWlsKCkpLFxuXHRcdFx0XHRcdHJlc3Q6IHRva2Vucy50YWlsKClcblx0XHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4geyBvcFJldHVyblR5cGU6IG51bGwsIHJlc3Q6IHRva2VucyB9XG5cdH0sXG5cblx0X2Z1bkFyZ3NBbmRCbG9jayA9IChpc0RvLCB0b2tlbnMpID0+IHtcblx0XHRjaGVja05vbkVtcHR5KHRva2VucywgJ0V4cGVjdGVkIGFuIGluZGVudGVkIGJsb2NrLicpXG5cdFx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKClcblx0XHQvLyBNaWdodCBiZSBgfGNhc2VgXG5cdFx0aWYgKGggaW5zdGFuY2VvZiBLZXl3b3JkICYmIChoLmtpbmQgPT09IEtXX0Nhc2VWYWwgfHwgaC5raW5kID09PSBLV19DYXNlRG8pKSB7XG5cdFx0XHRjb25zdCBlQ2FzZSA9IHBhcnNlQ2FzZShoLmtpbmQgPT09IEtXX0Nhc2VWYWwsIHRydWUsIHRva2Vucy50YWlsKCkpXG5cdFx0XHRjb25zdCBhcmdzID0gWyBuZXcgTG9jYWxEZWNsYXJlRm9jdXMoaC5sb2MpIF1cblx0XHRcdHJldHVybiBoLmtpbmQgPT09IEtXX0Nhc2VWYWwgP1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YXJncywgb3BSZXN0QXJnOiBudWxsLCBvcEluOiBudWxsLCBvcE91dDogbnVsbCxcblx0XHRcdFx0XHRibG9jazogbmV3IEJsb2NrV2l0aFJldHVybih0b2tlbnMubG9jLCBbIF0sIGVDYXNlKVxuXHRcdFx0XHR9IDpcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGFyZ3MsIG9wUmVzdEFyZzogbnVsbCwgb3BJbjogbnVsbCwgb3BPdXQ6IG51bGwsXG5cdFx0XHRcdFx0YmxvY2s6IG5ldyBCbG9ja0RvKHRva2Vucy5sb2MsIFsgZUNhc2UgXSlcblx0XHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBbIGJlZm9yZSwgYmxvY2tMaW5lcyBdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRcdFx0Y29uc3QgeyBhcmdzLCBvcFJlc3RBcmcgfSA9IF9wYXJzZUZ1bkxvY2FscyhiZWZvcmUpXG5cdFx0XHRmb3IgKGNvbnN0IGFyZyBvZiBhcmdzKVxuXHRcdFx0XHRpZiAoIWFyZy5pc0xhenkoKSlcblx0XHRcdFx0XHRhcmcua2luZCA9IExEX011dGFibGVcblx0XHRcdGNvbnN0IFsgb3BJbiwgcmVzdDAgXSA9IF90cnlUYWtlSW5Pck91dChLV19JbiwgYmxvY2tMaW5lcylcblx0XHRcdGNvbnN0IFsgb3BPdXQsIHJlc3QxIF0gPSBfdHJ5VGFrZUluT3JPdXQoS1dfT3V0LCByZXN0MClcblx0XHRcdGNvbnN0IGJsb2NrID0gKGlzRG8gPyBwYXJzZUJsb2NrRG8gOiBwYXJzZUJsb2NrVmFsKShyZXN0MSlcblx0XHRcdHJldHVybiB7IGFyZ3MsIG9wUmVzdEFyZywgYmxvY2ssIG9wSW4sIG9wT3V0IH1cblx0XHR9XG5cdH0sXG5cblx0X3BhcnNlRnVuTG9jYWxzID0gdG9rZW5zID0+IHtcblx0XHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRcdHJldHVybiB7IGFyZ3M6IFtdLCBvcFJlc3RBcmc6IG51bGwgfVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgbCA9IHRva2Vucy5sYXN0KClcblx0XHRcdGlmIChsIGluc3RhbmNlb2YgRG90TmFtZSkge1xuXHRcdFx0XHRjb250ZXh0LmNoZWNrKGwubkRvdHMgPT09IDMsIGwubG9jLCAnU3BsYXQgYXJndW1lbnQgbXVzdCBoYXZlIGV4YWN0bHkgMyBkb3RzJylcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRhcmdzOiBwYXJzZUxvY2FsRGVjbGFyZXModG9rZW5zLnJ0YWlsKCkpLFxuXHRcdFx0XHRcdG9wUmVzdEFyZzogTG9jYWxEZWNsYXJlLnBsYWluKGwubG9jLCBsLm5hbWUpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgcmV0dXJuIHsgYXJnczogcGFyc2VMb2NhbERlY2xhcmVzKHRva2VucyksIG9wUmVzdEFyZzogbnVsbCB9XG5cdFx0fVxuXHR9LFxuXG5cdF90cnlUYWtlSW5Pck91dCA9IChpbk9yT3V0LCB0b2tlbnMpID0+IHtcblx0XHRpZiAoIXRva2Vucy5pc0VtcHR5KCkpIHtcblx0XHRcdGNvbnN0IGZpcnN0TGluZSA9IHRva2Vucy5oZWFkU2xpY2UoKVxuXHRcdFx0aWYgKGlzS2V5d29yZChpbk9yT3V0LCBmaXJzdExpbmUuaGVhZCgpKSkge1xuXHRcdFx0XHRjb25zdCBpbk91dCA9IG5ldyBEZWJ1Zyhcblx0XHRcdFx0XHRmaXJzdExpbmUubG9jLFxuXHRcdFx0XHRcdHBhcnNlTGluZXNGcm9tQmxvY2soZmlyc3RMaW5lKSlcblx0XHRcdFx0cmV0dXJuIFsgaW5PdXQsIHRva2Vucy50YWlsKCkgXVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gWyBudWxsLCB0b2tlbnMgXVxuXHR9XG5cbmNvbnN0XG5cdHBhcnNlTGluZSA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgaGVhZCA9IHRva2Vucy5oZWFkKClcblx0XHRjb25zdCByZXN0ID0gdG9rZW5zLnRhaWwoKVxuXG5cdFx0Y29uc3Qgbm9SZXN0ID0gKCkgPT5cblx0XHRcdGNoZWNrRW1wdHkocmVzdCwgKCkgPT4gYERpZCBub3QgZXhwZWN0IGFueXRoaW5nIGFmdGVyICR7aGVhZH1gKVxuXG5cdFx0Ly8gV2Ugb25seSBkZWFsIHdpdGggbXV0YWJsZSBleHByZXNzaW9ucyBoZXJlLCBvdGhlcndpc2Ugd2UgZmFsbCBiYWNrIHRvIHBhcnNlRXhwci5cblx0XHRpZiAoaGVhZCBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0XHRzd2l0Y2ggKGhlYWQua2luZCkge1xuXHRcdFx0XHRjYXNlIEtXX0Fzc2VydDogY2FzZSBLV19Bc3NlcnROb3Q6XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlQXNzZXJ0KGhlYWQua2luZCA9PT0gS1dfQXNzZXJ0Tm90LCByZXN0KVxuXHRcdFx0XHRjYXNlIEtXX0V4Y2VwdERvOlxuXHRcdFx0XHRcdHJldHVybiBwYXJzZUV4Y2VwdChLV19FeGNlcHREbywgcmVzdClcblx0XHRcdFx0Y2FzZSBLV19CcmVhazpcblx0XHRcdFx0XHRub1Jlc3QoKVxuXHRcdFx0XHRcdHJldHVybiBuZXcgQnJlYWsodG9rZW5zLmxvYylcblx0XHRcdFx0Y2FzZSBLV19CcmVha1dpdGhWYWw6XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBCcmVha1dpdGhWYWwodG9rZW5zLmxvYywgcGFyc2VFeHByKHJlc3QpKVxuXHRcdFx0XHRjYXNlIEtXX0Nhc2VEbzpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VDYXNlKGZhbHNlLCBmYWxzZSwgcmVzdClcblx0XHRcdFx0Y2FzZSBLV19EZWJ1Zzpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IERlYnVnKHRva2Vucy5sb2MsXG5cdFx0XHRcdFx0XHRpc0dyb3VwKEdfQmxvY2ssIHRva2Vucy5zZWNvbmQoKSkgP1xuXHRcdFx0XHRcdFx0Ly8gYGRlYnVnYCwgdGhlbiBpbmRlbnRlZCBibG9ja1xuXHRcdFx0XHRcdFx0cGFyc2VMaW5lc0Zyb21CbG9jaygpIDpcblx0XHRcdFx0XHRcdC8vIGBkZWJ1Z2AsIHRoZW4gc2luZ2xlIGxpbmVcblx0XHRcdFx0XHRcdHBhcnNlTGluZU9yTGluZXMocmVzdCkpXG5cdFx0XHRcdGNhc2UgS1dfRGVidWdnZXI6XG5cdFx0XHRcdFx0bm9SZXN0KClcblx0XHRcdFx0XHRyZXR1cm4gbmV3IFNwZWNpYWxEbyh0b2tlbnMubG9jLCBTRF9EZWJ1Z2dlcilcblx0XHRcdFx0Y2FzZSBLV19FbGxpcHNpczpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEJhZ0VudHJ5TWFueSh0b2tlbnMubG9jLCBwYXJzZUV4cHIocmVzdCkpXG5cdFx0XHRcdGNhc2UgS1dfRm9yRG86XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlRm9yRG8ocmVzdClcblx0XHRcdFx0Y2FzZSBLV19JZ25vcmU6XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlSWdub3JlKHJlc3QpXG5cdFx0XHRcdGNhc2UgS1dfSWZEbzogY2FzZSBLV19Vbmxlc3NEbzoge1xuXHRcdFx0XHRcdGNvbnN0IFsgYmVmb3JlLCBibG9jayBdID0gYmVmb3JlQW5kQmxvY2socmVzdClcblx0XHRcdFx0XHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsRG8odG9rZW5zLmxvYyxcblx0XHRcdFx0XHRcdHBhcnNlRXhwcihiZWZvcmUpLFxuXHRcdFx0XHRcdFx0cGFyc2VCbG9ja0RvKGJsb2NrKSxcblx0XHRcdFx0XHRcdGhlYWQua2luZCA9PT0gS1dfVW5sZXNzRG8pXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBLV19PYmpBc3NpZ246XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBCYWdFbnRyeSh0b2tlbnMubG9jLCBwYXJzZUV4cHIocmVzdCkpXG5cdFx0XHRcdGNhc2UgS1dfUGFzczpcblx0XHRcdFx0XHRub1Jlc3QoKVxuXHRcdFx0XHRcdHJldHVybiBbIF1cblx0XHRcdFx0Y2FzZSBLV19SZWdpb246XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlTGluZXNGcm9tQmxvY2sodG9rZW5zKVxuXHRcdFx0XHRjYXNlIEtXX1N3aXRjaERvOlxuXHRcdFx0XHRcdHJldHVybiBwYXJzZVN3aXRjaChmYWxzZSwgcmVzdClcblx0XHRcdFx0Y2FzZSBLV19UaHJvdzpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IFRocm93KHRva2Vucy5sb2MsIG9wSWYoIXJlc3QuaXNFbXB0eSgpLCAoKSA9PiBwYXJzZUV4cHIocmVzdCkpKVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdC8vIGZhbGwgdGhyb3VnaFxuXHRcdFx0fVxuXG5cdFx0cmV0dXJuIGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2VXaGVyZShfaXNMaW5lU3BsaXRLZXl3b3JkKSxcblx0XHRcdCh7IGJlZm9yZSwgYXQsIGFmdGVyIH0pID0+IF9wYXJzZUFzc2lnbkxpa2UoYmVmb3JlLCBhdCwgYWZ0ZXIsIHRva2Vucy5sb2MpLFxuXHRcdFx0KCkgPT4gcGFyc2VFeHByKHRva2VucykpXG5cdH0sXG5cblx0cGFyc2VMaW5lT3JMaW5lcyA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgXyA9IHBhcnNlTGluZSh0b2tlbnMpXG5cdFx0cmV0dXJuIF8gaW5zdGFuY2VvZiBBcnJheSA/IF8gOiBbIF8gXVxuXHR9XG5cbi8vIHBhcnNlTGluZSBwcml2YXRlc1xuY29uc3Rcblx0X2lzTGluZVNwbGl0S2V5d29yZCA9IHRva2VuID0+IHtcblx0XHRpZiAodG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRcdGNhc2UgS1dfQXNzaWduOiBjYXNlIEtXX0Fzc2lnbk11dGFibGU6IGNhc2UgS1dfTG9jYWxNdXRhdGU6XG5cdFx0XHRcdGNhc2UgS1dfTWFwRW50cnk6IGNhc2UgS1dfT2JqQXNzaWduOiBjYXNlIEtXX1lpZWxkOiBjYXNlIEtXX1lpZWxkVG86XG5cdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdH1cblx0XHRlbHNlXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0fSxcblxuXHRfcGFyc2VBc3NpZ25MaWtlID0gKGJlZm9yZSwgYXQsIGFmdGVyLCBsb2MpID0+IHtcblx0XHRpZiAoYXQua2luZCA9PT0gS1dfTWFwRW50cnkpXG5cdFx0XHRyZXR1cm4gX3BhcnNlTWFwRW50cnkoYmVmb3JlLCBhZnRlciwgbG9jKVxuXG5cdFx0Ly8gVE9ETzogVGhpcyBjb2RlIGlzIGtpbmQgb2YgdWdseS5cblx0XHRpZiAoYmVmb3JlLnNpemUoKSA9PT0gMSkge1xuXHRcdFx0Y29uc3QgdG9rZW4gPSBiZWZvcmUuaGVhZCgpXG5cdFx0XHRpZiAodG9rZW4gaW5zdGFuY2VvZiBEb3ROYW1lKVxuXHRcdFx0XHRyZXR1cm4gX3BhcnNlTWVtYmVyU2V0KFx0TG9jYWxBY2Nlc3MudGhpcyh0b2tlbi5sb2MpLCB0b2tlbi5uYW1lLCBhdCwgYWZ0ZXIsIGxvYylcblx0XHRcdGlmIChpc0dyb3VwKEdfU3BhY2UsIHRva2VuKSkge1xuXHRcdFx0XHRjb25zdCBzcGFjZWQgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRcdFx0Y29uc3QgZG90ID0gc3BhY2VkLmxhc3QoKVxuXHRcdFx0XHRpZiAoZG90IGluc3RhbmNlb2YgRG90TmFtZSkge1xuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soZG90Lm5Eb3RzID09PSAxLCBkb3QubG9jLCAnTXVzdCBoYXZlIG9ubHkgMSBgLmAuJylcblx0XHRcdFx0XHRyZXR1cm4gX3BhcnNlTWVtYmVyU2V0KHBhcnNlU3BhY2VkKHNwYWNlZC5ydGFpbCgpKSwgZG90Lm5hbWUsIGF0LCBhZnRlciwgbG9jKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGF0LmtpbmQgPT09IEtXX0xvY2FsTXV0YXRlID9cblx0XHRcdF9wYXJzZUxvY2FsTXV0YXRlKGJlZm9yZSwgYWZ0ZXIsIGxvYykgOlxuXHRcdFx0X3BhcnNlQXNzaWduKGJlZm9yZSwgYXQsIGFmdGVyLCBsb2MpXG5cdH0sXG5cblx0X3BhcnNlTWVtYmVyU2V0ID0gKG9iamVjdCwgbmFtZSwgYXQsIGFmdGVyLCBsb2MpID0+XG5cdFx0bmV3IE1lbWJlclNldChsb2MsIG9iamVjdCwgbmFtZSwgX21lbWJlclNldEtpbmQoYXQpLCBwYXJzZUV4cHIoYWZ0ZXIpKSxcblx0X21lbWJlclNldEtpbmQgPSBhdCA9PiB7XG5cdFx0c3dpdGNoIChhdC5raW5kKSB7XG5cdFx0XHRjYXNlIEtXX0Fzc2lnbjogcmV0dXJuIE1TX05ld1xuXHRcdFx0Y2FzZSBLV19Bc3NpZ25NdXRhYmxlOiByZXR1cm4gTVNfTmV3TXV0YWJsZVxuXHRcdFx0Y2FzZSBLV19Mb2NhbE11dGF0ZTogcmV0dXJuIE1TX011dGF0ZVxuXHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKClcblx0XHR9XG5cdH0sXG5cblx0X3BhcnNlTG9jYWxNdXRhdGUgPSAobG9jYWxzVG9rZW5zLCB2YWx1ZVRva2VucywgbG9jKSA9PiB7XG5cdFx0Y29uc3QgbG9jYWxzID0gcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKGxvY2Fsc1Rva2Vucylcblx0XHRjb250ZXh0LmNoZWNrKGxvY2Fscy5sZW5ndGggPT09IDEsIGxvYywgJ1RPRE86IExvY2FsRGVzdHJ1Y3R1cmVNdXRhdGUnKVxuXHRcdGNvbnN0IG5hbWUgPSBsb2NhbHNbMF0ubmFtZVxuXHRcdGNvbnN0IHZhbHVlID0gcGFyc2VFeHByKHZhbHVlVG9rZW5zKVxuXHRcdHJldHVybiBuZXcgTG9jYWxNdXRhdGUobG9jLCBuYW1lLCB2YWx1ZSlcblx0fSxcblxuXHRfcGFyc2VBc3NpZ24gPSAobG9jYWxzVG9rZW5zLCBhc3NpZ25lciwgdmFsdWVUb2tlbnMsIGxvYykgPT4ge1xuXHRcdGNvbnN0IGtpbmQgPSBhc3NpZ25lci5raW5kXG5cdFx0Y29uc3QgbG9jYWxzID0gcGFyc2VMb2NhbERlY2xhcmVzKGxvY2Fsc1Rva2Vucylcblx0XHRjb25zdCBvcE5hbWUgPSBvcElmKGxvY2Fscy5sZW5ndGggPT09IDEsICgpID0+IGxvY2Fsc1swXS5uYW1lKVxuXHRcdGNvbnN0IHZhbHVlID0gX3BhcnNlQXNzaWduVmFsdWUoa2luZCwgb3BOYW1lLCB2YWx1ZVRva2VucylcblxuXHRcdGNvbnN0IGlzWWllbGQgPSBraW5kID09PSBLV19ZaWVsZCB8fCBraW5kID09PSBLV19ZaWVsZFRvXG5cdFx0aWYgKGlzRW1wdHkobG9jYWxzKSkge1xuXHRcdFx0Y29udGV4dC5jaGVjayhpc1lpZWxkLCBsb2NhbHNUb2tlbnMubG9jLCAnQXNzaWdubWVudCB0byBub3RoaW5nJylcblx0XHRcdHJldHVybiB2YWx1ZVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoaXNZaWVsZClcblx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIGxvY2Fscylcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKCFfLmlzTGF6eSgpLCBfLmxvYywgJ0NhbiBub3QgeWllbGQgdG8gbGF6eSB2YXJpYWJsZS4nKVxuXG5cdFx0XHRjb25zdCBpc09iakFzc2lnbiA9IGtpbmQgPT09IEtXX09iakFzc2lnblxuXG5cdFx0XHRpZiAoa2luZCA9PT0gS1dfQXNzaWduTXV0YWJsZSlcblx0XHRcdFx0Zm9yIChsZXQgXyBvZiBsb2NhbHMpIHtcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKCFfLmlzTGF6eSgpLCBfLmxvYywgJ0xhenkgbG9jYWwgY2FuIG5vdCBiZSBtdXRhYmxlLicpXG5cdFx0XHRcdFx0Xy5raW5kID0gTERfTXV0YWJsZVxuXHRcdFx0XHR9XG5cblx0XHRcdGNvbnN0IHdyYXAgPSBfID0+IGlzT2JqQXNzaWduID8gbmV3IE9iakVudHJ5KGxvYywgXykgOiBfXG5cblx0XHRcdGlmIChsb2NhbHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdGNvbnN0IGFzc2lnbmVlID0gbG9jYWxzWzBdXG5cdFx0XHRcdGNvbnN0IGFzc2lnbiA9IG5ldyBBc3NpZ25TaW5nbGUobG9jLCBhc3NpZ25lZSwgdmFsdWUpXG5cdFx0XHRcdGNvbnN0IGlzVGVzdCA9IGlzT2JqQXNzaWduICYmIGFzc2lnbmVlLm5hbWUuZW5kc1dpdGgoJ3Rlc3QnKVxuXHRcdFx0XHRyZXR1cm4gaXNUZXN0ID8gbmV3IERlYnVnKGxvYywgWyB3cmFwKGFzc2lnbikgXSkgOiB3cmFwKGFzc2lnbilcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IGtpbmQgPSBsb2NhbHNbMF0ua2luZFxuXHRcdFx0XHRmb3IgKGNvbnN0IF8gb2YgbG9jYWxzKVxuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soXy5raW5kID09PSBraW5kLCBfLmxvYyxcblx0XHRcdFx0XHRcdCdBbGwgbG9jYWxzIG9mIGRlc3RydWN0dXJpbmcgYXNzaWdubWVudCBtdXN0IGJlIG9mIHRoZSBzYW1lIGtpbmQuJylcblx0XHRcdFx0cmV0dXJuIHdyYXAobmV3IEFzc2lnbkRlc3RydWN0dXJlKGxvYywgbG9jYWxzLCB2YWx1ZSwga2luZCkpXG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdF9wYXJzZUFzc2lnblZhbHVlID0gKGtpbmQsIG9wTmFtZSwgdmFsdWVUb2tlbnMpID0+IHtcblx0XHRjb25zdCB2YWx1ZSA9IHZhbHVlVG9rZW5zLmlzRW1wdHkoKSAmJiBraW5kID09PSBLV19PYmpBc3NpZ24gP1xuXHRcdFx0bmV3IFNwZWNpYWxWYWwodmFsdWVUb2tlbnMubG9jLCBTVl9OdWxsKSA6XG5cdFx0XHRwYXJzZUV4cHIodmFsdWVUb2tlbnMpXG5cdFx0aWYgKG9wTmFtZSAhPT0gbnVsbClcblx0XHRcdF90cnlBZGROYW1lKHZhbHVlLCBvcE5hbWUpXG5cdFx0c3dpdGNoIChraW5kKSB7XG5cdFx0XHRjYXNlIEtXX1lpZWxkOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFlpZWxkKHZhbHVlLmxvYywgdmFsdWUpXG5cdFx0XHRjYXNlIEtXX1lpZWxkVG86XG5cdFx0XHRcdHJldHVybiBuZXcgWWllbGRUbyh2YWx1ZS5sb2MsIHZhbHVlKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIHZhbHVlXG5cdFx0fVxuXHR9LFxuXG5cdC8vIFdlIGdpdmUgaXQgYSBuYW1lIGlmOlxuXHQvLyBJdCdzIGEgZnVuY3Rpb25cblx0Ly8gSXQncyBhbiBPYmogYmxvY2tcblx0Ly8gSXQncyBhbiBPYmogYmxvY2sgYXQgdGhlIGVuZCBvZiBhIGNhbGwgKGFzIGluIGBuYW1lID0gT2JqLVR5cGUgLi4uYClcblx0X3RyeUFkZE5hbWUgPSAoXywgbmFtZSkgPT4ge1xuXHRcdGlmIChfIGluc3RhbmNlb2YgRnVuIHx8IF8gaW5zdGFuY2VvZiBDbGFzcylcblx0XHRcdF8ub3BOYW1lID0gbmFtZVxuXHRcdGVsc2UgaWYgKChfIGluc3RhbmNlb2YgQ2FsbCB8fCBfIGluc3RhbmNlb2YgTmV3KSAmJiAhaXNFbXB0eShfLmFyZ3MpKVxuXHRcdFx0X3RyeUFkZE9iak5hbWUobGFzdChfLmFyZ3MpLCBuYW1lKVxuXHRcdGVsc2Vcblx0XHRcdF90cnlBZGRPYmpOYW1lKF8sIG5hbWUpXG5cdH0sXG5cblx0X3RyeUFkZE9iak5hbWUgPSAoXywgbmFtZSkgPT4ge1xuXHRcdGlmIChfIGluc3RhbmNlb2YgQmxvY2tXcmFwICYmIF8uYmxvY2sgaW5zdGFuY2VvZiBCbG9ja09iailcblx0XHRcdGlmIChfLmJsb2NrLm9wT2JqZWQgIT09IG51bGwgJiYgXy5ibG9jay5vcE9iamVkIGluc3RhbmNlb2YgRnVuKVxuXHRcdFx0XHRfLmJsb2NrLm9wT2JqZWQub3BOYW1lID0gbmFtZVxuXHRcdFx0ZWxzZSBpZiAoIV9uYW1lT2JqQXNzaWduU29tZXdoZXJlKF8uYmxvY2subGluZXMpKVxuXHRcdFx0XHRfLmJsb2NrLm9wTmFtZSA9IG5hbWVcblx0fSxcblx0X25hbWVPYmpBc3NpZ25Tb21ld2hlcmUgPSBsaW5lcyA9PlxuXHRcdGxpbmVzLnNvbWUobGluZSA9PlxuXHRcdFx0bGluZSBpbnN0YW5jZW9mIE9iakVudHJ5ICYmIGxpbmUuYXNzaWduLmFsbEFzc2lnbmVlcygpLnNvbWUoXyA9PlxuXHRcdFx0XHRfLm5hbWUgPT09ICduYW1lJykpLFxuXG5cdF9wYXJzZU1hcEVudHJ5ID0gKGJlZm9yZSwgYWZ0ZXIsIGxvYykgPT5cblx0XHRuZXcgTWFwRW50cnkobG9jLCBwYXJzZUV4cHIoYmVmb3JlKSwgcGFyc2VFeHByKGFmdGVyKSlcblxuY29uc3Rcblx0cGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzID0gdG9rZW5zID0+XG5cdFx0dG9rZW5zLm1hcChfID0+IExvY2FsRGVjbGFyZS5wbGFpbihfLmxvYywgX3BhcnNlTG9jYWxOYW1lKF8pKSksXG5cblx0cGFyc2VMb2NhbERlY2xhcmVzID0gdG9rZW5zID0+IHRva2Vucy5tYXAocGFyc2VMb2NhbERlY2xhcmUpLFxuXG5cdHBhcnNlTG9jYWxEZWNsYXJlID0gdG9rZW4gPT4ge1xuXHRcdGlmIChpc0dyb3VwKEdfU3BhY2UsIHRva2VuKSkge1xuXHRcdFx0Y29uc3QgdG9rZW5zID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0XHRjb25zdCBbIHJlc3QsIGlzTGF6eSBdID1cblx0XHRcdFx0aXNLZXl3b3JkKEtXX0xhenksIHRva2Vucy5oZWFkKCkpID8gWyB0b2tlbnMudGFpbCgpLCB0cnVlIF0gOiBbIHRva2VucywgZmFsc2UgXVxuXHRcdFx0Y29uc3QgbmFtZSA9IF9wYXJzZUxvY2FsTmFtZShyZXN0LmhlYWQoKSlcblx0XHRcdGNvbnN0IHJlc3QyID0gcmVzdC50YWlsKClcblx0XHRcdGNvbnN0IG9wVHlwZSA9IG9wSWYoIXJlc3QyLmlzRW1wdHkoKSwgKCkgPT4ge1xuXHRcdFx0XHRjb25zdCBjb2xvbiA9IHJlc3QyLmhlYWQoKVxuXHRcdFx0XHRjb250ZXh0LmNoZWNrKGlzS2V5d29yZChLV19UeXBlLCBjb2xvbiksIGNvbG9uLmxvYywgKCkgPT4gYEV4cGVjdGVkICR7Y29kZSgnOicpfWApXG5cdFx0XHRcdGNvbnN0IHRva2Vuc1R5cGUgPSByZXN0Mi50YWlsKClcblx0XHRcdFx0Y2hlY2tOb25FbXB0eSh0b2tlbnNUeXBlLCAoKSA9PiBgRXhwZWN0ZWQgc29tZXRoaW5nIGFmdGVyICR7Y29sb259YClcblx0XHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkKHRva2Vuc1R5cGUpXG5cdFx0XHR9KVxuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbERlY2xhcmUodG9rZW4ubG9jLCBuYW1lLCBvcFR5cGUsIGlzTGF6eSA/IExEX0xhenkgOiBMRF9Db25zdClcblx0XHR9IGVsc2Vcblx0XHRcdHJldHVybiBMb2NhbERlY2xhcmUucGxhaW4odG9rZW4ubG9jLCBfcGFyc2VMb2NhbE5hbWUodG9rZW4pKVxuXHR9XG5cbi8vIHBhcnNlTG9jYWxEZWNsYXJlIHByaXZhdGVzXG5jb25zdFxuXHRfcGFyc2VMb2NhbE5hbWUgPSB0ID0+IHtcblx0XHRpZiAoaXNLZXl3b3JkKEtXX0ZvY3VzLCB0KSlcblx0XHRcdHJldHVybiAnXydcblx0XHRlbHNlIHtcblx0XHRcdGNvbnRleHQuY2hlY2sodCBpbnN0YW5jZW9mIE5hbWUsIHQubG9jLCAoKSA9PiBgRXhwZWN0ZWQgYSBsb2NhbCBuYW1lLCBub3QgJHt0fWApXG5cdFx0XHRjb250ZXh0LmNoZWNrKCFKc0dsb2JhbHMuaGFzKHQubmFtZSksIHQubG9jLCAoKSA9PlxuXHRcdFx0XHRgQ2FuIG5vdCBzaGFkb3cgZ2xvYmFsICR7Y29kZSh0Lm5hbWUpfWApXG5cdFx0XHRyZXR1cm4gdC5uYW1lXG5cdFx0fVxuXHR9XG5cbmNvbnN0IHBhcnNlU2luZ2xlID0gdG9rZW4gPT4ge1xuXHRjb25zdCB7IGxvYyB9ID0gdG9rZW5cblx0cmV0dXJuIHRva2VuIGluc3RhbmNlb2YgTmFtZSA/XG5cdF9hY2Nlc3ModG9rZW4ubmFtZSwgbG9jKSA6XG5cdHRva2VuIGluc3RhbmNlb2YgR3JvdXAgPyAoKCkgPT4ge1xuXHRcdGNvbnN0IHNsaWNlID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRjYXNlIEdfU3BhY2U6XG5cdFx0XHRcdHJldHVybiBwYXJzZVNwYWNlZChzbGljZSlcblx0XHRcdGNhc2UgR19QYXJlbnRoZXNpczpcblx0XHRcdFx0cmV0dXJuIHBhcnNlRXhwcihzbGljZSlcblx0XHRcdGNhc2UgR19CcmFja2V0OlxuXHRcdFx0XHRyZXR1cm4gbmV3IEJhZ1NpbXBsZShsb2MsIHBhcnNlRXhwclBhcnRzKHNsaWNlKSlcblx0XHRcdGNhc2UgR19CbG9jazpcblx0XHRcdFx0cmV0dXJuIGJsb2NrV3JhcChzbGljZSlcblx0XHRcdGNhc2UgR19RdW90ZTpcblx0XHRcdFx0cmV0dXJuIHBhcnNlUXVvdGUoc2xpY2UpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IodG9rZW4ua2luZClcblx0XHR9XG5cdH0pKCkgOlxuXHR0b2tlbiBpbnN0YW5jZW9mIE51bWJlckxpdGVyYWwgP1xuXHR0b2tlbiA6XG5cdHRva2VuIGluc3RhbmNlb2YgS2V5d29yZCA/XG5cdFx0dG9rZW4ua2luZCA9PT0gS1dfRm9jdXMgP1xuXHRcdFx0TG9jYWxBY2Nlc3MuZm9jdXMobG9jKSA6XG5cdFx0XHRpZkVsc2Uob3BLZXl3b3JkS2luZFRvU3BlY2lhbFZhbHVlS2luZCh0b2tlbi5raW5kKSxcblx0XHRcdFx0XyA9PiBuZXcgU3BlY2lhbFZhbChsb2MsIF8pLFxuXHRcdFx0XHQoKSA9PiB1bmV4cGVjdGVkKHRva2VuKSkgOlxuXHR0b2tlbiBpbnN0YW5jZW9mIERvdE5hbWUgP1xuXHRcdHRva2VuLm5Eb3RzID09PSAxID8gbmV3IE1lbWJlcih0b2tlbi5sb2MsIExvY2FsQWNjZXNzLnRoaXModG9rZW4ubG9jKSwgdG9rZW4ubmFtZSkgOlxuXHRcdHRva2VuLm5Eb3RzID09PSAzID8gbmV3IFNwbGF0KGxvYywgbmV3IExvY2FsQWNjZXNzKGxvYywgdG9rZW4ubmFtZSkpIDpcblx0XHR1bmV4cGVjdGVkKHRva2VuKSA6XG5cdHVuZXhwZWN0ZWQodG9rZW4pXG59XG5cbi8vIHBhcnNlU2luZ2xlIHByaXZhdGVzXG5jb25zdCBfYWNjZXNzID0gKG5hbWUsIGxvYykgPT5cblx0SnNHbG9iYWxzLmhhcyhuYW1lKSA/IG5ldyBHbG9iYWxBY2Nlc3MobG9jLCBuYW1lKSA6IG5ldyBMb2NhbEFjY2Vzcyhsb2MsIG5hbWUpXG5cbmNvbnN0IHBhcnNlU3BhY2VkID0gdG9rZW5zID0+IHtcblx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKCksIHJlc3QgPSB0b2tlbnMudGFpbCgpXG5cdGlmIChpc0tleXdvcmQoS1dfVHlwZSwgaCkpXG5cdFx0cmV0dXJuIENhbGwuY29udGFpbnMoaC5sb2MsIHBhcnNlU3BhY2VkKHJlc3QpLCBMb2NhbEFjY2Vzcy5mb2N1cyhoLmxvYykpXG5cdGVsc2UgaWYgKGlzS2V5d29yZChLV19MYXp5LCBoKSlcblx0XHRyZXR1cm4gbmV3IExhenkoaC5sb2MsIHBhcnNlU3BhY2VkKHJlc3QpKVxuXHRlbHNlIHtcblx0XHRsZXQgYWNjID0gcGFyc2VTaW5nbGUoaClcblx0XHRmb3IgKGxldCBpID0gcmVzdC5zdGFydDsgaSA8IHJlc3QuZW5kOyBpID0gaSArIDEpIHtcblx0XHRcdGNvbnN0IHRva2VuID0gcmVzdC50b2tlbnNbaV1cblx0XHRcdGNvbnN0IGxvYyA9IHRva2VuLmxvY1xuXHRcdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgRG90TmFtZSkge1xuXHRcdFx0XHRjb250ZXh0LmNoZWNrKHRva2VuLm5Eb3RzID09PSAxLCB0b2tlbi5sb2MsICdUb28gbWFueSBkb3RzIScpXG5cdFx0XHRcdGFjYyA9IG5ldyBNZW1iZXIodG9rZW4ubG9jLCBhY2MsIHRva2VuLm5hbWUpXG5cdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHR9XG5cdFx0XHRpZiAodG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdFx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdFx0XHRjYXNlIEtXX0ZvY3VzOlxuXHRcdFx0XHRcdFx0YWNjID0gbmV3IENhbGwodG9rZW4ubG9jLCBhY2MsIFsgTG9jYWxBY2Nlc3MuZm9jdXMobG9jKSBdKVxuXHRcdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0XHRjYXNlIEtXX1R5cGU6IHtcblx0XHRcdFx0XHRcdGNvbnN0IHR5cGUgPSBwYXJzZVNwYWNlZCh0b2tlbnMuX2Nob3BTdGFydChpICsgMSkpXG5cdFx0XHRcdFx0XHRyZXR1cm4gQ2FsbC5jb250YWlucyh0b2tlbi5sb2MsIHR5cGUsIGFjYylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0fVxuXHRcdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgR3JvdXApIHtcblx0XHRcdFx0Y29uc3Qgc2xpY2UgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRcdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRcdFx0Y2FzZSBHX0JyYWNrZXQ6XG5cdFx0XHRcdFx0XHRhY2MgPSBDYWxsLnN1Yihsb2MsIHVuc2hpZnQoYWNjLCBwYXJzZUV4cHJQYXJ0cyhzbGljZSkpKVxuXHRcdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0XHRjYXNlIEdfUGFyZW50aGVzaXM6XG5cdFx0XHRcdFx0XHRjaGVja0VtcHR5KHNsaWNlLCAoKSA9PlxuXHRcdFx0XHRcdFx0XHRgVXNlICR7Y29kZSgnKGEgYiknKX0sIG5vdCAke2NvZGUoJ2EoYiknKX1gKVxuXHRcdFx0XHRcdFx0YWNjID0gbmV3IENhbGwobG9jLCBhY2MsIFtdKVxuXHRcdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0XHRjYXNlIEdfUXVvdGU6XG5cdFx0XHRcdFx0XHRhY2MgPSBuZXcgUXVvdGVUZW1wbGF0ZShsb2MsIGFjYywgcGFyc2VRdW90ZShzbGljZSkpXG5cdFx0XHRcdFx0XHRjb250aW51ZVxuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGNvbnRleHQuZmFpbCh0b2tlbnMubG9jLCBgRXhwZWN0ZWQgbWVtYmVyIG9yIHN1Yiwgbm90ICR7dG9rZW59YClcblx0XHR9XG5cdFx0cmV0dXJuIGFjY1xuXHR9XG59XG5cbmNvbnN0IHRyeVBhcnNlVXNlcyA9IChrLCB0b2tlbnMpID0+IHtcblx0aWYgKCF0b2tlbnMuaXNFbXB0eSgpKSB7XG5cdFx0Y29uc3QgbGluZTAgPSB0b2tlbnMuaGVhZFNsaWNlKClcblx0XHRpZiAoaXNLZXl3b3JkKGssIGxpbmUwLmhlYWQoKSkpXG5cdFx0XHRyZXR1cm4gWyBfcGFyc2VVc2VzKGssIGxpbmUwLnRhaWwoKSksIHRva2Vucy50YWlsKCkgXVxuXHR9XG5cdHJldHVybiBbIFsgXSwgdG9rZW5zIF1cbn1cblxuLy8gdHJ5UGFyc2VVc2UgcHJpdmF0ZXNcbmNvbnN0XG5cdF9wYXJzZVVzZXMgPSAodXNlS2V5d29yZEtpbmQsIHRva2VucykgPT4ge1xuXHRcdGNvbnN0IFsgYmVmb3JlLCBsaW5lcyBdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRcdGNoZWNrRW1wdHkoYmVmb3JlLCAoKSA9PlxuXHRcdFx0YERpZCBub3QgZXhwZWN0IGFueXRoaW5nIGFmdGVyICR7Y29kZSh1c2VLZXl3b3JkS2luZCl9IG90aGVyIHRoYW4gYSBibG9ja2ApXG5cdFx0cmV0dXJuIGxpbmVzLm1hcFNsaWNlcyhsaW5lID0+IHtcblx0XHRcdGNvbnN0IHsgcGF0aCwgbmFtZSB9ID0gX3BhcnNlUmVxdWlyZShsaW5lLmhlYWQoKSlcblx0XHRcdGlmICh1c2VLZXl3b3JkS2luZCA9PT0gS1dfVXNlRG8pIHtcblx0XHRcdFx0aWYgKGxpbmUuc2l6ZSgpID4gMSlcblx0XHRcdFx0XHR1bmV4cGVjdGVkKGxpbmUuc2Vjb25kKCkpXG5cdFx0XHRcdHJldHVybiBuZXcgVXNlRG8obGluZS5sb2MsIHBhdGgpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBpc0xhenkgPSB1c2VLZXl3b3JkS2luZCA9PT0gS1dfVXNlTGF6eSB8fFxuXHRcdFx0XHRcdHVzZUtleXdvcmRLaW5kID09PSBLV19Vc2VEZWJ1Z1xuXHRcdFx0XHRjb25zdCB7IHVzZWQsIG9wVXNlRGVmYXVsdCB9ID1cblx0XHRcdFx0XHRfcGFyc2VUaGluZ3NVc2VkKG5hbWUsIGlzTGF6eSwgbGluZS50YWlsKCkpXG5cdFx0XHRcdHJldHVybiBuZXcgVXNlKGxpbmUubG9jLCBwYXRoLCB1c2VkLCBvcFVzZURlZmF1bHQpXG5cdFx0XHR9XG5cdFx0fSlcblx0fSxcblxuXHRfcGFyc2VUaGluZ3NVc2VkID0gKG5hbWUsIGlzTGF6eSwgdG9rZW5zKSA9PiB7XG5cdFx0Y29uc3QgdXNlRGVmYXVsdCA9ICgpID0+IExvY2FsRGVjbGFyZS51bnR5cGVkKHRva2Vucy5sb2MsIG5hbWUsIGlzTGF6eSA/IExEX0xhenkgOiBMRF9Db25zdClcblx0XHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRcdHJldHVybiB7IHVzZWQ6IFsgXSwgb3BVc2VEZWZhdWx0OiB1c2VEZWZhdWx0KCkgfVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgWyBvcFVzZURlZmF1bHQsIHJlc3QgXSA9XG5cdFx0XHRcdGlzS2V5d29yZChLV19Gb2N1cywgdG9rZW5zLmhlYWQoKSkgP1xuXHRcdFx0XHRcdFsgdXNlRGVmYXVsdCgpLCB0b2tlbnMudGFpbCgpIF0gOlxuXHRcdFx0XHRcdFsgbnVsbCwgdG9rZW5zIF1cblx0XHRcdGNvbnN0IHVzZWQgPSBwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMocmVzdCkubWFwKGwgPT4ge1xuXHRcdFx0XHRjb250ZXh0LmNoZWNrKGwubmFtZSAhPT0gJ18nLCBsLnBvcyxcblx0XHRcdFx0XHQoKSA9PiBgJHtjb2RlKCdfJyl9IG5vdCBhbGxvd2VkIGFzIGltcG9ydCBuYW1lLmApXG5cdFx0XHRcdGlmIChpc0xhenkpXG5cdFx0XHRcdFx0bC5raW5kID0gTERfTGF6eVxuXHRcdFx0XHRyZXR1cm4gbFxuXHRcdFx0fSlcblx0XHRcdHJldHVybiB7IHVzZWQsIG9wVXNlRGVmYXVsdCB9XG5cdFx0fVxuXHR9LFxuXG5cdF9wYXJzZVJlcXVpcmUgPSB0ID0+IHtcblx0XHRpZiAodCBpbnN0YW5jZW9mIE5hbWUpXG5cdFx0XHRyZXR1cm4geyBwYXRoOiB0Lm5hbWUsIG5hbWU6IHQubmFtZSB9XG5cdFx0ZWxzZSBpZiAodCBpbnN0YW5jZW9mIERvdE5hbWUpXG5cdFx0XHRyZXR1cm4geyBwYXRoOiBwdXNoKF9wYXJ0c0Zyb21Eb3ROYW1lKHQpLCB0Lm5hbWUpLmpvaW4oJy8nKSwgbmFtZTogdC5uYW1lIH1cblx0XHRlbHNlIHtcblx0XHRcdGNvbnRleHQuY2hlY2soaXNHcm91cChHX1NwYWNlLCB0KSwgdC5sb2MsICdOb3QgYSB2YWxpZCBtb2R1bGUgbmFtZS4nKVxuXHRcdFx0cmV0dXJuIF9wYXJzZUxvY2FsUmVxdWlyZShTbGljZS5ncm91cCh0KSlcblx0XHR9XG5cdH0sXG5cblx0X3BhcnNlTG9jYWxSZXF1aXJlID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBmaXJzdCA9IHRva2Vucy5oZWFkKClcblx0XHRsZXQgcGFydHNcblx0XHRpZiAoZmlyc3QgaW5zdGFuY2VvZiBEb3ROYW1lKVxuXHRcdFx0cGFydHMgPSBfcGFydHNGcm9tRG90TmFtZShmaXJzdClcblx0XHRlbHNlIHtcblx0XHRcdGNvbnRleHQuY2hlY2soZmlyc3QgaW5zdGFuY2VvZiBOYW1lLCBmaXJzdC5sb2MsICdOb3QgYSB2YWxpZCBwYXJ0IG9mIG1vZHVsZSBwYXRoLicpXG5cdFx0XHRwYXJ0cyA9IFsgXVxuXHRcdH1cblx0XHRwYXJ0cy5wdXNoKGZpcnN0Lm5hbWUpXG5cdFx0dG9rZW5zLnRhaWwoKS5lYWNoKHRva2VuID0+IHtcblx0XHRcdGNvbnRleHQuY2hlY2sodG9rZW4gaW5zdGFuY2VvZiBEb3ROYW1lICYmIHRva2VuLm5Eb3RzID09PSAxLCB0b2tlbi5sb2MsXG5cdFx0XHRcdCdOb3QgYSB2YWxpZCBwYXJ0IG9mIG1vZHVsZSBwYXRoLicpXG5cdFx0XHRwYXJ0cy5wdXNoKHRva2VuLm5hbWUpXG5cdFx0fSlcblx0XHRyZXR1cm4geyBwYXRoOiBwYXJ0cy5qb2luKCcvJyksIG5hbWU6IHRva2Vucy5sYXN0KCkubmFtZSB9XG5cdH0sXG5cblx0X3BhcnRzRnJvbURvdE5hbWUgPSBkb3ROYW1lID0+XG5cdFx0ZG90TmFtZS5uRG90cyA9PT0gMSA/IFsgJy4nIF0gOiByZXBlYXQoJy4uJywgZG90TmFtZS5uRG90cyAtIDEpXG5cbmNvbnN0XG5cdF9wYXJzZUZvciA9IGN0ciA9PiB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IFsgYmVmb3JlLCBibG9jayBdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRcdHJldHVybiBuZXcgY3RyKHRva2Vucy5sb2MsIF9wYXJzZU9wSXRlcmF0ZWUoYmVmb3JlKSwgcGFyc2VCbG9ja0RvKGJsb2NrKSlcblx0fSxcblx0X3BhcnNlT3BJdGVyYXRlZSA9IHRva2VucyA9PlxuXHRcdG9wSWYoIXRva2Vucy5pc0VtcHR5KCksICgpID0+IHtcblx0XHRcdGNvbnN0IFsgZWxlbWVudCwgYmFnIF0gPVxuXHRcdFx0XHRpZkVsc2UodG9rZW5zLm9wU3BsaXRPbmNlV2hlcmUoXyA9PiBpc0tleXdvcmQoS1dfSW4sIF8pKSxcblx0XHRcdFx0XHQoeyBiZWZvcmUsIGFmdGVyIH0pID0+IHtcblx0XHRcdFx0XHRcdGNvbnRleHQuY2hlY2soYmVmb3JlLnNpemUoKSA9PT0gMSwgYmVmb3JlLmxvYywgJ1RPRE86IHBhdHRlcm4gaW4gZm9yJylcblx0XHRcdFx0XHRcdHJldHVybiBbIHBhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcyhiZWZvcmUpWzBdLCBwYXJzZUV4cHIoYWZ0ZXIpIF1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdCgpID0+IFsgbmV3IExvY2FsRGVjbGFyZUZvY3VzKHRva2Vucy5sb2MpLCBwYXJzZUV4cHIodG9rZW5zKSBdKVxuXHRcdFx0cmV0dXJuIG5ldyBJdGVyYXRlZSh0b2tlbnMubG9jLCBlbGVtZW50LCBiYWcpXG5cdFx0fSlcbmNvbnN0XG5cdHBhcnNlRm9yRG8gPSBfcGFyc2VGb3IoRm9yRG8pLFxuXHRwYXJzZUZvclZhbCA9IF9wYXJzZUZvcihGb3JWYWwpLFxuXHQvLyBUT0RPOiAtPiBvdXQtdHlwZVxuXHRwYXJzZUZvckJhZyA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgWyBiZWZvcmUsIGxpbmVzIF0gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdFx0Y29uc3QgYmxvY2sgPSBwYXJzZUJsb2NrRG8obGluZXMpXG5cdFx0Ly8gVE9ETzogQmV0dGVyIHdheT9cblx0XHRpZiAoYmxvY2subGluZXMubGVuZ3RoID09PSAxICYmIGJsb2NrLmxpbmVzWzBdIGluc3RhbmNlb2YgVmFsKVxuXHRcdFx0YmxvY2subGluZXNbMF0gPSBuZXcgQmFnRW50cnkoYmxvY2subGluZXNbMF0ubG9jLCBibG9jay5saW5lc1swXSlcblx0XHRyZXR1cm4gRm9yQmFnLm9mKHRva2Vucy5sb2MsIF9wYXJzZU9wSXRlcmF0ZWUoYmVmb3JlKSwgYmxvY2spXG5cdH1cblxuXG5jb25zdFxuXHRwYXJzZUV4Y2VwdCA9IChrd0V4Y2VwdCwgdG9rZW5zKSA9PiB7XG5cdFx0Y29uc3Rcblx0XHRcdGlzVmFsID0ga3dFeGNlcHQgPT09IEtXX0V4Y2VwdFZhbCxcblx0XHRcdGp1c3REb1ZhbEJsb2NrID0gaXNWYWwgPyBqdXN0QmxvY2tWYWwgOiBqdXN0QmxvY2tEbyxcblx0XHRcdHBhcnNlQmxvY2sgPSBpc1ZhbCA/IHBhcnNlQmxvY2tWYWwgOiBwYXJzZUJsb2NrRG8sXG5cdFx0XHRFeGNlcHQgPSBpc1ZhbCA/IEV4Y2VwdFZhbCA6IEV4Y2VwdERvLFxuXHRcdFx0a3dUcnkgPSBpc1ZhbCA/IEtXX1RyeVZhbCA6IEtXX1RyeURvLFxuXHRcdFx0a3dDYXRjaCA9IGlzVmFsID8gS1dfQ2F0Y2hWYWwgOiBLV19DYXRjaERvLFxuXHRcdFx0bmFtZVRyeSA9ICgpID0+IGNvZGUoa2V5d29yZE5hbWUoa3dUcnkpKSxcblx0XHRcdG5hbWVDYXRjaCA9ICgpID0+IGNvZGUoa2V5d29yZE5hbWUoa3dDYXRjaCkpLFxuXHRcdFx0bmFtZUZpbmFsbHkgPSAoKSA9PiBjb2RlKGtleXdvcmROYW1lKEtXX0ZpbmFsbHkpKVxuXG5cdFx0Y29uc3QgbGluZXMgPSBqdXN0QmxvY2soa3dFeGNlcHQsIHRva2VucylcblxuXHRcdC8vIGB0cnlgICptdXN0KiBjb21lIGZpcnN0LlxuXHRcdGNvbnN0IGZpcnN0TGluZSA9IGxpbmVzLmhlYWRTbGljZSgpXG5cdFx0Y29uc3QgdG9rZW5UcnkgPSBmaXJzdExpbmUuaGVhZCgpXG5cdFx0Y29udGV4dC5jaGVjayhpc0tleXdvcmQoa3dUcnksIHRva2VuVHJ5KSwgdG9rZW5UcnkubG9jLCAoKSA9PlxuXHRcdFx0YE11c3Qgc3RhcnQgd2l0aCAke25hbWVUcnkoKX1gKVxuXHRcdGNvbnN0IF90cnkgPSBqdXN0RG9WYWxCbG9jayhrd1RyeSwgZmlyc3RMaW5lLnRhaWwoKSlcblxuXHRcdGNvbnN0IHJlc3RMaW5lcyA9IGxpbmVzLnRhaWwoKVxuXHRcdGNoZWNrTm9uRW1wdHkocmVzdExpbmVzLCAoKSA9PlxuXHRcdFx0YE11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgb2YgJHtuYW1lQ2F0Y2goKX0gb3IgJHtuYW1lRmluYWxseSgpfWApXG5cblx0XHRjb25zdCBoYW5kbGVGaW5hbGx5ID0gcmVzdExpbmVzID0+IHtcblx0XHRcdGNvbnN0IGxpbmUgPSByZXN0TGluZXMuaGVhZFNsaWNlKClcblx0XHRcdGNvbnN0IHRva2VuRmluYWxseSA9IGxpbmUuaGVhZCgpXG5cdFx0XHRjb250ZXh0LmNoZWNrKGlzS2V5d29yZChLV19GaW5hbGx5LCB0b2tlbkZpbmFsbHkpLCB0b2tlbkZpbmFsbHkubG9jLCAoKSA9PlxuXHRcdFx0XHRgRXhwZWN0ZWQgJHtuYW1lRmluYWxseSgpfWApXG5cdFx0XHRjb250ZXh0LmNoZWNrKHJlc3RMaW5lcy5zaXplKCkgPT09IDEsIHJlc3RMaW5lcy5sb2MsICgpID0+XG5cdFx0XHRcdGBOb3RoaW5nIGlzIGFsbG93ZWQgdG8gY29tZSBhZnRlciAke25hbWVGaW5hbGx5KCl9LmApXG5cdFx0XHRyZXR1cm4ganVzdEJsb2NrRG8oS1dfRmluYWxseSwgbGluZS50YWlsKCkpXG5cdFx0fVxuXG5cdFx0bGV0IF9jYXRjaCwgX2ZpbmFsbHlcblxuXHRcdGNvbnN0IGxpbmUyID0gcmVzdExpbmVzLmhlYWRTbGljZSgpXG5cdFx0Y29uc3QgaGVhZDIgPSBsaW5lMi5oZWFkKClcblx0XHRpZiAoaXNLZXl3b3JkKGt3Q2F0Y2gsIGhlYWQyKSkge1xuXHRcdFx0Y29uc3QgWyBiZWZvcmUyLCBibG9jazIgXSA9IGJlZm9yZUFuZEJsb2NrKGxpbmUyLnRhaWwoKSlcblx0XHRcdGNvbnN0IGNhdWdodCA9IF9wYXJzZU9uZUxvY2FsRGVjbGFyZU9yRm9jdXMoYmVmb3JlMilcblx0XHRcdF9jYXRjaCA9IG5ldyBDYXRjaChsaW5lMi5sb2MsIGNhdWdodCwgcGFyc2VCbG9jayhibG9jazIpKVxuXHRcdFx0X2ZpbmFsbHkgPSBvcElmKHJlc3RMaW5lcy5zaXplKCkgPiAxLCAoKSA9PiBoYW5kbGVGaW5hbGx5KHJlc3RMaW5lcy50YWlsKCkpKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRfY2F0Y2ggPSBudWxsXG5cdFx0XHRfZmluYWxseSA9IGhhbmRsZUZpbmFsbHkocmVzdExpbmVzKVxuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgRXhjZXB0KHRva2Vucy5sb2MsIF90cnksIF9jYXRjaCwgX2ZpbmFsbHkpXG5cdH0sXG5cdF9wYXJzZU9uZUxvY2FsRGVjbGFyZU9yRm9jdXMgPSB0b2tlbnMgPT4ge1xuXHRcdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbERlY2xhcmVGb2N1cyh0b2tlbnMubG9jKVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29udGV4dC5jaGVjayh0b2tlbnMuc2l6ZSgpID09PSAxLCAnRXhwZWN0ZWQgb25seSBvbmUgbG9jYWwgZGVjbGFyZS4nKVxuXHRcdFx0cmV0dXJuIHBhcnNlTG9jYWxEZWNsYXJlcyh0b2tlbnMpWzBdXG5cdFx0fVxuXHR9XG5cbmNvbnN0IHBhcnNlQXNzZXJ0ID0gKG5lZ2F0ZSwgdG9rZW5zKSA9PiB7XG5cdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAoKSA9PiBgRXhwZWN0ZWQgc29tZXRoaW5nIGFmdGVyICR7a2V5d29yZE5hbWUoS1dfQXNzZXJ0KX0uYClcblxuXHRjb25zdCBbIGNvbmRUb2tlbnMsIG9wVGhyb3duIF0gPVxuXHRcdGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2VXaGVyZShfID0+IGlzS2V5d29yZChLV19UaHJvdywgXykpLFxuXHRcdFx0KHsgYmVmb3JlLCBhZnRlciB9KSA9PiBbIGJlZm9yZSwgcGFyc2VFeHByKGFmdGVyKSBdLFxuXHRcdFx0KCkgPT4gWyB0b2tlbnMsIG51bGwgXSlcblxuXHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKGNvbmRUb2tlbnMpXG5cdGNvbnN0IGNvbmQgPSBwYXJ0cy5sZW5ndGggPT09IDEgPyBwYXJ0c1swXSA6IG5ldyBDYWxsKGNvbmRUb2tlbnMubG9jLCBwYXJ0c1swXSwgdGFpbChwYXJ0cykpXG5cdHJldHVybiBuZXcgQXNzZXJ0KHRva2Vucy5sb2MsIG5lZ2F0ZSwgY29uZCwgb3BUaHJvd24pXG59XG5cbmNvbnN0IHBhcnNlQ2xhc3MgPSB0b2tlbnMgPT4ge1xuXHRjb25zdCBbIGJlZm9yZSwgYmxvY2sgXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0Y29uc3Qgb3BFeHRlbmRlZCA9IG9wSWYoIWJlZm9yZS5pc0VtcHR5KCksICgpID0+IHBhcnNlRXhwcihiZWZvcmUpKVxuXG5cdGxldCBvcERvID0gbnVsbCwgc3RhdGljcyA9IFsgXSwgb3BDb25zdHJ1Y3RvciA9IG51bGwsIG1ldGhvZHMgPSBbIF1cblxuXHRsZXQgcmVzdCA9IGJsb2NrXG5cdGNvbnN0IGxpbmUxID0gcmVzdC5oZWFkU2xpY2UoKVxuXHRpZiAoaXNLZXl3b3JkKEtXX0RvLCBsaW5lMS5oZWFkKCkpKSB7XG5cdFx0Y29uc3QgZG9uZSA9IGp1c3RCbG9ja0RvKEtXX0RvLCBsaW5lMS50YWlsKCkpXG5cdFx0b3BEbyA9IG5ldyBDbGFzc0RvKGxpbmUxLmxvYywgbmV3IExvY2FsRGVjbGFyZUZvY3VzKGxpbmUxLmxvYywgZG9uZSksIGRvbmUpXG5cdFx0cmVzdCA9IGJsb2NrLnRhaWwoKVxuXHR9XG5cdGlmICghcmVzdC5pc0VtcHR5KCkpIHtcblx0XHRjb25zdCBsaW5lMiA9IHJlc3QuaGVhZFNsaWNlKClcblx0XHRpZiAoaXNLZXl3b3JkKEtXX1N0YXRpYywgbGluZTIuaGVhZCgpKSkge1xuXHRcdFx0c3RhdGljcyA9IF9wYXJzZVN0YXRpY3MobGluZTIudGFpbCgpKVxuXHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdFx0fVxuXHRcdGlmICghcmVzdC5pc0VtcHR5KCkpIHtcblx0XHRcdGNvbnN0IGxpbmUzID0gcmVzdC5oZWFkU2xpY2UoKVxuXHRcdFx0aWYgKGlzS2V5d29yZChLV19Db25zdHJ1Y3QsIGxpbmUzLmhlYWQoKSkpIHtcblx0XHRcdFx0b3BDb25zdHJ1Y3RvciA9IF9wYXJzZUNvbnN0cnVjdG9yKGxpbmUzLnRhaWwoKSlcblx0XHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdFx0XHR9XG5cdFx0XHRtZXRob2RzID0gX3BhcnNlTWV0aG9kcyhyZXN0KVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBuZXcgQ2xhc3ModG9rZW5zLmxvYywgb3BFeHRlbmRlZCwgb3BEbywgc3RhdGljcywgb3BDb25zdHJ1Y3RvciwgbWV0aG9kcylcbn1cblxuY29uc3Rcblx0X3BhcnNlQ29uc3RydWN0b3IgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IHsgYXJncywgb3BSZXN0QXJnLCBibG9jaywgb3BJbiwgb3BPdXQgfSA9IF9mdW5BcmdzQW5kQmxvY2sodHJ1ZSwgdG9rZW5zKVxuXHRcdGNvbnN0IGlzR2VuZXJhdG9yID0gZmFsc2UsIG9wRGVjbGFyZVJlcyA9IG51bGxcblx0XHRyZXR1cm4gbmV3IEZ1bih0b2tlbnMubG9jLFxuXHRcdFx0bmV3IExvY2FsRGVjbGFyZVRoaXModG9rZW5zLmxvYyksXG5cdFx0XHRpc0dlbmVyYXRvcixcblx0XHRcdGFyZ3MsIG9wUmVzdEFyZyxcblx0XHRcdGJsb2NrLCBvcEluLCBvcERlY2xhcmVSZXMsIG9wT3V0KVxuXHR9LFxuXHRfcGFyc2VTdGF0aWNzID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBibG9jayA9IGp1c3RCbG9jayhLV19TdGF0aWMsIHRva2Vucylcblx0XHRyZXR1cm4gX3BhcnNlTWV0aG9kcyhibG9jaylcblx0fSxcblx0X3BhcnNlTWV0aG9kcyA9IHRva2VucyA9PiB0b2tlbnMubWFwU2xpY2VzKF9wYXJzZU1ldGhvZCksXG5cdF9wYXJzZU1ldGhvZCA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgaGVhZCA9IHRva2Vucy5oZWFkKClcblxuXHRcdGxldCBraW5kID0gTUlfUGxhaW5cblx0XHRpZiAoaXNLZXl3b3JkKEtXX0dldCwgaGVhZCkgfHwgaXNLZXl3b3JkKEtXX1NldCwgaGVhZCkpIHtcblx0XHRcdGtpbmQgPSBoZWFkLmtpbmQgPT09IEtXX0dldCA/IE1JX0dldCA6IE1JX1NldFxuXHRcdFx0dG9rZW5zID0gdG9rZW5zLnRhaWwoKVxuXHRcdH1cblxuXHRcdGNvbnN0IGJhYSA9IHRva2Vucy5vcFNwbGl0T25jZVdoZXJlKF9pc0Z1bktleXdvcmQpXG5cdFx0Y29udGV4dC5jaGVjayhiYWEgIT09IG51bGwsIHRva2Vucy5sb2MsICdFeHBlY3RlZCBhIGZ1bmN0aW9uIGtleXdvcmQgc29tZXdoZXJlLicpXG5cdFx0Y29uc3QgeyBiZWZvcmUsIGF0LCBhZnRlciB9ID0gYmFhXG5cblx0XHRjb25zdCBmdW4gPSBwYXJzZUZ1bihfbWV0aG9kRnVuS2luZChhdCksIGFmdGVyKVxuXHRcdGFzc2VydChmdW4ub3BOYW1lID09PSBudWxsKVxuXG5cdFx0bGV0IHN5bWJvbCA9IHBhcnNlRXhwcihiZWZvcmUpXG5cdFx0Ly8gSWYgc3ltYm9sIGlzIGp1c3QgYSBsaXRlcmFsIHN0cmluZywgc3RvcmUgaXQgYXMgYSBzdHJpbmcsIHdoaWNoIGlzIGhhbmRsZWQgc3BlY2lhbGx5LlxuXHRcdGlmIChzeW1ib2wgaW5zdGFuY2VvZiBRdW90ZSAmJlxuXHRcdFx0c3ltYm9sLnBhcnRzLmxlbmd0aCA9PT0gMSAmJlxuXHRcdFx0dHlwZW9mIHN5bWJvbC5wYXJ0c1swXSA9PT0gJ3N0cmluZycpXG5cdFx0XHRzeW1ib2wgPSBzeW1ib2wucGFydHNbMF1cblxuXHRcdHJldHVybiBuZXcgTWV0aG9kSW1wbCh0b2tlbnMubG9jLCBraW5kLCBzeW1ib2wsIGZ1bilcblx0fSxcblx0X21ldGhvZEZ1bktpbmQgPSBmdW5LaW5kVG9rZW4gPT4ge1xuXHRcdHN3aXRjaCAoZnVuS2luZFRva2VuLmtpbmQpIHtcblx0XHRcdGNhc2UgS1dfRnVuOiByZXR1cm4gS1dfRnVuVGhpc1xuXHRcdFx0Y2FzZSBLV19GdW5EbzogcmV0dXJuIEtXX0Z1blRoaXNEb1xuXHRcdFx0Y2FzZSBLV19GdW5HZW46IHJldHVybiBLV19GdW5UaGlzR2VuXG5cdFx0XHRjYXNlIEtXX0Z1bkdlbkRvOiByZXR1cm4gS1dfRnVuVGhpc0dlbkRvXG5cdFx0XHRjYXNlIEtXX0Z1blRoaXM6IGNhc2UgS1dfRnVuVGhpc0RvOiBjYXNlIEtXX0Z1blRoaXNHZW46IGNhc2UgS1dfRnVuVGhpc0dlbkRvOlxuXHRcdFx0XHRjb250ZXh0LmZhaWwoZnVuS2luZFRva2VuLmxvYywgJ0Z1bmN0aW9uIGAuYCBpcyBpbXBsaWNpdCBmb3IgbWV0aG9kcy4nKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Y29udGV4dC5mYWlsKGZ1bktpbmRUb2tlbi5sb2MsIGBFeHBlY3RlZCBmdW5jdGlvbiBraW5kLCBnb3QgJHtmdW5LaW5kVG9rZW59YClcblx0XHR9XG5cdH0sXG5cdF9pc0Z1bktleXdvcmQgPSBmdW5LaW5kVG9rZW4gPT4ge1xuXHRcdGlmIChmdW5LaW5kVG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdFx0c3dpdGNoIChmdW5LaW5kVG9rZW4ua2luZCkge1xuXHRcdFx0XHRjYXNlIEtXX0Z1bjogY2FzZSBLV19GdW5EbzogY2FzZSBLV19GdW5HZW46IGNhc2UgS1dfRnVuR2VuRG86XG5cdFx0XHRcdGNhc2UgS1dfRnVuVGhpczogY2FzZSBLV19GdW5UaGlzRG86IGNhc2UgS1dfRnVuVGhpc0dlbjpcblx0XHRcdFx0Y2FzZSBLV19GdW5UaGlzR2VuRG86XG5cdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdH1cblx0XHRlbHNlXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXG5jb25zdCBwYXJzZVF1b3RlID0gdG9rZW5zID0+XG5cdG5ldyBRdW90ZSh0b2tlbnMubG9jLCB0b2tlbnMubWFwKF8gPT4gKHR5cGVvZiBfID09PSAnc3RyaW5nJykgPyBfIDogcGFyc2VTaW5nbGUoXykpKVxuXG5jb25zdCBwYXJzZVdpdGggPSB0b2tlbnMgPT4ge1xuXHRjb25zdCBbIGJlZm9yZSwgYmxvY2sgXSA9IGJlZm9yZUFuZEJsb2NrKHRva2VucylcblxuXHRjb25zdCBbIHZhbCwgZGVjbGFyZSBdID0gaWZFbHNlKGJlZm9yZS5vcFNwbGl0T25jZVdoZXJlKF8gPT4gaXNLZXl3b3JkKEtXX0FzLCBfKSksXG5cdFx0KHsgYmVmb3JlLCBhZnRlciB9KSA9PiB7XG5cdFx0XHRjb250ZXh0LmNoZWNrKGFmdGVyLnNpemUoKSA9PT0gMSwgKCkgPT4gYEV4cGVjdGVkIG9ubHkgMSB0b2tlbiBhZnRlciAke2NvZGUoJ2FzJyl9LmApXG5cdFx0XHRyZXR1cm4gWyBwYXJzZUV4cHJQbGFpbihiZWZvcmUpLCBwYXJzZUxvY2FsRGVjbGFyZShhZnRlci5oZWFkKCkpIF1cblx0XHR9LFxuXHRcdCgpID0+IFsgcGFyc2VFeHByUGxhaW4oYmVmb3JlKSwgbmV3IExvY2FsRGVjbGFyZUZvY3VzKHRva2Vucy5sb2MpIF0pXG5cblx0cmV0dXJuIG5ldyBXaXRoKHRva2Vucy5sb2MsIGRlY2xhcmUsIHZhbCwgcGFyc2VCbG9ja0RvKGJsb2NrKSlcbn1cblxuY29uc3QgcGFyc2VJZ25vcmUgPSB0b2tlbnMgPT4ge1xuXHRjb25zdCBpZ25vcmVkID0gdG9rZW5zLm1hcChfID0+IHtcblx0XHRpZiAoaXNLZXl3b3JkKEtXX0ZvY3VzLCBfKSlcblx0XHRcdHJldHVybiAnXydcblx0XHRlbHNlIHtcblx0XHRcdGNvbnRleHQuY2hlY2soXyBpbnN0YW5jZW9mIE5hbWUsIF8ubG9jLCAoKSA9PiBgRXhwZWN0ZWQgbG9jYWwgbmFtZSwgbm90ICR7X30uYClcblx0XHRcdHJldHVybiBfLm5hbWVcblx0XHR9XG5cdH0pXG5cdHJldHVybiBuZXcgSWdub3JlKHRva2Vucy5sb2MsIGlnbm9yZWQpXG59XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==
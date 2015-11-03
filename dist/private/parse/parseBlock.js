'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', '../util', './checks', './parse*', './parseLine', './tryTakeComment', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parse*'), require('./parseLine'), require('./tryTakeComment'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.util, global.checks, global.parse, global.parseLine, global.tryTakeComment, global.Slice);
		global.parseBlock = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _util, _checks, _parse, _parseLine, _tryTakeComment5, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.beforeAndBlock = beforeAndBlock;
	exports.beforeAndOpBlock = beforeAndOpBlock;
	exports.parseBlockWrap = parseBlockWrap;
	exports.justBlock = justBlock;
	exports.parseJustBlockDoOrVal = parseJustBlockDoOrVal;
	exports.parseJustBlockDo = parseJustBlockDo;
	exports.parseLinesFromBlock = parseLinesFromBlock;
	exports.parseBlockDoOrVal = parseBlockDoOrVal;
	exports.parseBlockDo = parseBlockDo;
	exports.parseBlockVal = parseBlockVal;
	exports.parseModuleBlock = parseModuleBlock;

	var _parseLine2 = _interopRequireDefault(_parseLine);

	var _tryTakeComment6 = _interopRequireDefault(_tryTakeComment5);

	var _Slice2 = _interopRequireDefault(_Slice);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	function beforeAndBlock(tokens) {
		var _beforeAndOpBlock = beforeAndOpBlock(tokens);

		var _beforeAndOpBlock2 = _slicedToArray(_beforeAndOpBlock, 2);

		const before = _beforeAndOpBlock2[0];
		const opBlock = _beforeAndOpBlock2[1];
		(0, _context.check)(opBlock !== null, opBlock.loc, 'Expected an indented block at the end.');
		return [before, opBlock];
	}

	function beforeAndOpBlock(tokens) {
		if (tokens.isEmpty()) return [tokens, null];else {
			const block = tokens.last();
			return (0, _Token.isGroup)(_Token.Groups.Block, block) ? [tokens.rtail(), _Slice2.default.group(block)] : [tokens, null];
		}
	}

	function parseBlockWrap(tokens) {
		return new _MsAst.BlockWrap(tokens.loc, parseBlockVal(tokens));
	}

	function justBlock(keywordKind, tokens) {
		var _beforeAndBlock = beforeAndBlock(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const block = _beforeAndBlock2[1];
		(0, _checks.checkEmpty)(before, () => `Did not expect anything between ${ (0, _Token.showKeyword)(keywordKind) } and block.`);
		return block;
	}

	function parseJustBlockDoOrVal(isVal, keyword, tokens) {
		return (isVal ? parseJustBlockVal : parseJustBlockDo)(keyword, tokens);
	}

	function parseJustBlockDo(keyword, tokens) {
		return parseBlockDo(justBlock(keyword, tokens));
	}

	function parseJustBlockVal(keyword, tokens) {
		return parseBlockVal(justBlock(keyword, tokens));
	}

	function parseLinesFromBlock(tokens) {
		const h = tokens.head();
		(0, _context.check)(tokens.size() > 1 && tokens.size() === 2 && (0, _Token.isGroup)(_Token.Groups.Block, tokens.second()), h.loc, () => `Expected indented block after ${ h }, and nothing else.`);
		const block = tokens.second();
		const lines = [];

		for (const line of _Slice2.default.group(block).slices()) lines.push(...(0, _parseLine.parseLineOrLines)(line));

		return lines;
	}

	function parseBlockDoOrVal(isVal, tokens) {
		return (isVal ? parseBlockVal : parseBlockDo)(tokens);
	}

	function parseBlockDo(tokens) {
		var _tryTakeComment = (0, _tryTakeComment6.default)(tokens);

		var _tryTakeComment2 = _slicedToArray(_tryTakeComment, 2);

		const opComment = _tryTakeComment2[0];
		const rest = _tryTakeComment2[1];
		const lines = plainBlockLines(rest);
		return new _MsAst.BlockDo(tokens.loc, opComment, lines);
	}

	function parseBlockVal(tokens) {
		var _tryTakeComment3 = (0, _tryTakeComment6.default)(tokens);

		var _tryTakeComment4 = _slicedToArray(_tryTakeComment3, 2);

		const opComment = _tryTakeComment4[0];
		const rest = _tryTakeComment4[1];
		(0, _checks.checkNonEmpty)(rest, 'Value block needs at least one line.');

		var _parseBlockKind = parseBlockKind(rest);

		const kind = _parseBlockKind.kind;
		const lines = _parseBlockKind.lines;
		const lastLine = _parseBlockKind.lastLine;

		if (kind === Blocks.Plain) {
			const ctr = lastLine instanceof _MsAst.Throw ? _MsAst.BlockValThrow : _MsAst.BlockValReturn;
			return new ctr(tokens.loc, opComment, lines, lastLine);
		} else return new (blockConstructor(kind))(tokens.loc, opComment, lines);
	}

	function parseModuleBlock(tokens) {
		if (tokens.isEmpty()) return [];
		const loc = tokens.loc;

		const name = _context.options.moduleName();

		var _parseBlockKind2 = parseBlockKind(tokens, true);

		const kind = _parseBlockKind2.kind;
		const lines = _parseBlockKind2.lines;
		const lastLine = _parseBlockKind2.lastLine;

		switch (kind) {
			case Blocks.Bag:
			case Blocks.Map:
				{
					const val = new _MsAst.BlockWrap(loc, new (blockConstructor(kind))(loc, null, lines));
					return [_MsAst.ModuleExportDefault.forVal(loc, name, val)];
				}

			case Blocks.Obj:
				return lines.map(line => {
					if (line instanceof _MsAst.ObjEntry) {
						(0, _context.check)(line instanceof _MsAst.ObjEntryAssign, line.loc, 'Module exports can not be computed.');
						(0, _context.check)(line.assign instanceof _MsAst.AssignSingle, line.loc, 'Export AssignDestructure not yet supported.');
						return line.assign.assignee.name === name ? new _MsAst.ModuleExportDefault(line.loc, line.assign) : new _MsAst.ModuleExportNamed(line.loc, line.assign);
					} else return line;
				});

			case Blocks.Plain:
				if (lastLine instanceof _MsAst.Val) lines.push(_MsAst.ModuleExportDefault.forVal(loc, name, lastLine));else lines.push(lastLine);
				return lines;

			default:
				throw new Error(kind);
		}
	}

	function plainBlockLines(lineTokens) {
		const lines = [];

		for (const _ of lineTokens.slices()) addLine(lines, (0, _parseLine2.default)(_));

		return lines;
	}

	function addLine(lines, line) {
		if (line instanceof Array) for (const _ of line) addLine(lines, _);else lines.push(line);
	}

	const Blocks = {
		Bag: 0,
		Map: 1,
		Obj: 2,
		Plain: 3
	};

	function blockConstructor(kind) {
		switch (kind) {
			case Blocks.Bag:
				return _MsAst.BlockBag;

			case Blocks.Map:
				return _MsAst.BlockMap;

			case Blocks.Obj:
				return _MsAst.BlockObj;

			default:
				throw new Error(kind);
		}
	}

	function parseBlockKind(tokens, allowLastStatement) {
		const lines = plainBlockLines(tokens.rtail());

		const last = _Slice2.default.group(tokens.last());

		let isBag = false,
		    isMap = false,
		    isObj = false;

		const checkLine = line => {
			if (line instanceof _MsAst.BagEntry || line instanceof _MsAst.BagEntryMany) isBag = true;else if (line instanceof _MsAst.MapEntry) isMap = true;else if (line instanceof _MsAst.ObjEntry) isObj = true;
		};

		for (const _ of lines) checkLine(_);

		const lastLine = allowLastStatement || isObj || isBag || isMap ? (0, _parseLine2.default)(last) : parseBuilderOrVal(last);
		checkLine(lastLine);
		(0, _context.check)(!(isObj && isBag), lines.loc, 'Block has both Bag and Obj lines.');
		(0, _context.check)(!(isObj && isMap), lines.loc, 'Block has both Obj and Map lines.');
		(0, _context.check)(!(isBag && isMap), lines.loc, 'Block has both Bag and Map lines.');
		const kind = isBag ? Blocks.Bag : isMap ? Blocks.Map : isObj ? Blocks.Obj : Blocks.Plain;

		if (kind !== Blocks.Plain) {
			addLine(lines, lastLine);
			return {
				kind,
				lines
			};
		} else return {
			kind,
			lines,
			lastLine
		};
	}

	function parseBuilderOrVal(tokens) {
		const loc = tokens.loc;
		const head = tokens.head();

		const rest = () => tokens.tail();

		if (head instanceof _Token.Keyword) switch (head.kind) {
			case _Token.Keywords.Dot3:
				return (0, _parseLine.parseBagEntryMany)(rest(), loc);

			case _Token.Keywords.ObjAssign:
				return (0, _parseLine.parseBagEntry)(rest(), loc);

			case _Token.Keywords.Throw:
				return (0, _parseLine.parseThrow)(rest(), loc);

			default:}
		return (0, _util.ifElse)(tokens.opSplitOnce(_ => (0, _Token.isAnyKeyword)(builderSplitKeywords, _)), _ref => {
			let before = _ref.before;
			let at = _ref.at;
			let after = _ref.after;
			return (at.kind === _Token.Keywords.MapEntry ? _parseLine.parseMapEntry : _parseLine.parseObjEntry)(before, after, loc);
		}, () => (0, _parse.parseExpr)(tokens));
	}

	const builderSplitKeywords = new Set([_Token.Keywords.MapEntry, _Token.Keywords.ObjAssign]);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQmxvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBaUJnQixjQUFjLEdBQWQsY0FBYztTQU1kLGdCQUFnQixHQUFoQixnQkFBZ0I7U0FVaEIsY0FBYyxHQUFkLGNBQWM7U0FhZCxTQUFTLEdBQVQsU0FBUztTQVdULHFCQUFxQixHQUFyQixxQkFBcUI7U0FLckIsZ0JBQWdCLEdBQWhCLGdCQUFnQjtTQWFoQixtQkFBbUIsR0FBbkIsbUJBQW1CO1NBY25CLGlCQUFpQixHQUFqQixpQkFBaUI7U0FLakIsWUFBWSxHQUFaLFlBQVk7U0FPWixhQUFhLEdBQWIsYUFBYTtTQWdCYixnQkFBZ0IsR0FBaEIsZ0JBQWdCOzs7Ozs7Ozs7Ozs7VUFwR2hCLGNBQWM7Ozs7Ozs7Ozs7O1VBTWQsZ0JBQWdCOzs7Ozs7O1VBVWhCLGNBQWM7Ozs7VUFhZCxTQUFTOzs7Ozs7Ozs7OztVQVdULHFCQUFxQjs7OztVQUtyQixnQkFBZ0I7Ozs7Ozs7O1VBYWhCLG1CQUFtQjs7Ozs7Ozs7Ozs7VUFjbkIsaUJBQWlCOzs7O1VBS2pCLFlBQVk7Ozs7Ozs7Ozs7O1VBT1osYUFBYTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBZ0JiLGdCQUFnQiIsImZpbGUiOiJwYXJzZUJsb2NrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVjaywgb3B0aW9uc30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7QXNzaWduU2luZ2xlLCBCYWdFbnRyeSwgQmFnRW50cnlNYW55LCBCbG9ja0JhZywgQmxvY2tEbywgQmxvY2tPYmosIEJsb2NrTWFwLFxuXHRCbG9ja1ZhbFJldHVybiwgQmxvY2tWYWxUaHJvdywgQmxvY2tXcmFwLCBNYXBFbnRyeSwgTW9kdWxlRXhwb3J0RGVmYXVsdCwgTW9kdWxlRXhwb3J0TmFtZWQsXG5cdE9iakVudHJ5LCBPYmpFbnRyeUFzc2lnbiwgVGhyb3csIFZhbH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwcywgaXNHcm91cCwgaXNBbnlLZXl3b3JkLCBLZXl3b3JkLCBLZXl3b3Jkcywgc2hvd0tleXdvcmR9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtpZkVsc2V9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2NoZWNrRW1wdHksIGNoZWNrTm9uRW1wdHl9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtwYXJzZUV4cHJ9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IHBhcnNlTGluZSwge3BhcnNlQmFnRW50cnksIHBhcnNlQmFnRW50cnlNYW55LCBwYXJzZU1hcEVudHJ5LCBwYXJzZU9iakVudHJ5LCBwYXJzZVRocm93LFxuXHRwYXJzZUxpbmVPckxpbmVzfSBmcm9tICcuL3BhcnNlTGluZSdcbmltcG9ydCB0cnlUYWtlQ29tbWVudCBmcm9tICcuL3RyeVRha2VDb21tZW50J1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8qKlxuVG9rZW5zIG9uIHRoZSBsaW5lIGJlZm9yZSBhIGJsb2NrLCBhbmQgdG9rZW5zIGZvciB0aGUgYmxvY2sgaXRzZWxmLlxuQHJldHVybiB7W1NsaWNlLCBTbGljZV19XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGJlZm9yZUFuZEJsb2NrKHRva2Vucykge1xuXHRjb25zdCBbYmVmb3JlLCBvcEJsb2NrXSA9IGJlZm9yZUFuZE9wQmxvY2sodG9rZW5zKVxuXHRjaGVjayhvcEJsb2NrICE9PSBudWxsLCBvcEJsb2NrLmxvYywgJ0V4cGVjdGVkIGFuIGluZGVudGVkIGJsb2NrIGF0IHRoZSBlbmQuJylcblx0cmV0dXJuIFtiZWZvcmUsIG9wQmxvY2tdXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmVBbmRPcEJsb2NrKHRva2Vucykge1xuXHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRyZXR1cm4gW3Rva2VucywgbnVsbF1cblx0ZWxzZSB7XG5cdFx0Y29uc3QgYmxvY2sgPSB0b2tlbnMubGFzdCgpXG5cdFx0cmV0dXJuIGlzR3JvdXAoR3JvdXBzLkJsb2NrLCBibG9jaykgPyBbdG9rZW5zLnJ0YWlsKCksIFNsaWNlLmdyb3VwKGJsb2NrKV0gOiBbdG9rZW5zLCBudWxsXVxuXHR9XG59XG5cbi8qKiBQYXJzZSBhIEJsb2NrIGFzIGEgc2luZ2xlIHZhbHVlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQmxvY2tXcmFwKHRva2Vucykge1xuXHRyZXR1cm4gbmV3IEJsb2NrV3JhcCh0b2tlbnMubG9jLCBwYXJzZUJsb2NrVmFsKHRva2VucykpXG59XG5cbi8qKlxuUGFyc2UgYSBibG9jaywgdGhyb3dpbmcgYW4gZXJyb3IgaWYgdGhlcmUncyBhbnl0aGluZyBiZWZvcmUgdGhlIGJsb2NrLlxuQHBhcmFtIHtLZXl3b3Jkc30ga2V5d29yZEtpbmQgS2V5d29yZCB0aGF0IHByZWNlZGVzIHRoZSBibG9jay4gVXNlZCBmb3IgZXJyb3IgbWVzc2FnZS5cbkBwYXJhbSB7U2xpY2V9IHRva2Vuc1xuXHRUb2tlbnMgd2hpY2ggc2hvdWxkIGNvbnRhaW4gYSBibG9jay5cblx0VW5saWtlIHtAbGluayBwYXJzZUJsb2NrRG99LCB0aGVzZSBhcmUgKm5vdCogdGhlIHRva2VucyAqd2l0aGluKiB0aGUgYmxvY2suXG5cdFRoZXNlIHRva2VucyBhcmUgKmV4cGVjdGVkKiB0byBqdXN0IGJlIGEge0BsaW5rIEdyb3Vwcy5CbG9ja30uXG5cdChJZiB0aGVyZSdzIGFueXRoaW5nIGVsc2UsIGEge0BsaW5rIENvbXBpbGVFcnJvcn0gd2lsbCBiZSB0aHJvd24uKVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBqdXN0QmxvY2soa2V5d29yZEtpbmQsIHRva2Vucykge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdGNoZWNrRW1wdHkoYmVmb3JlLCAoKSA9PlxuXHRcdGBEaWQgbm90IGV4cGVjdCBhbnl0aGluZyBiZXR3ZWVuICR7c2hvd0tleXdvcmQoa2V5d29yZEtpbmQpfSBhbmQgYmxvY2suYClcblx0cmV0dXJuIGJsb2NrXG59XG5cbi8qKlxuUGFyc2UgYSB7QGxpbmsgQmxvY2tWYWx9IGlmIGBpc1ZhbGAsIGVsc2UgYSB7QGxpbmsgQmxvY2tEb30sXG5mYWlsaW5nIGlmIHRoZXJlJ3Mgc29tZXRoaW5nIHByZWNpZGluZyBpdC5cbiovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VKdXN0QmxvY2tEb09yVmFsKGlzVmFsLCBrZXl3b3JkLCB0b2tlbnMpIHtcblx0cmV0dXJuIChpc1ZhbCA/IHBhcnNlSnVzdEJsb2NrVmFsIDogcGFyc2VKdXN0QmxvY2tEbykoa2V5d29yZCwgdG9rZW5zKVxufVxuXG4vKiogUGFyc2UgYSB7QGxpbmsgQmxvY2tEb30sIGZhaWxpbmcgaWYgdGhlcmUncyBzb21ldGhpbmcgcHJlY2VkaW5nIGl0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlSnVzdEJsb2NrRG8oa2V5d29yZCwgdG9rZW5zKSB7XG5cdHJldHVybiBwYXJzZUJsb2NrRG8oanVzdEJsb2NrKGtleXdvcmQsIHRva2VucykpXG59XG5cbi8qKiBQYXJzZSBhIHtAbGluayBCbG9ja1ZhbH0sIGZhaWxpbmcgaWYgdGhlcmUncyBzb21ldGhpbmcgcHJlY2VkaW5nIGl0LiAqL1xuZnVuY3Rpb24gcGFyc2VKdXN0QmxvY2tWYWwoa2V5d29yZCwgdG9rZW5zKSB7XG5cdHJldHVybiBwYXJzZUJsb2NrVmFsKGp1c3RCbG9jayhrZXl3b3JkLCB0b2tlbnMpKVxufVxuXG4vKipcbkdldCBsaW5lcyBpbiBhIHJlZ2lvbi5cbkByZXR1cm4ge0FycmF5PE1zQXN0Pn1cbiovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VMaW5lc0Zyb21CbG9jayh0b2tlbnMpIHtcblx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKClcblx0Y2hlY2sodG9rZW5zLnNpemUoKSA+IDEgJiYgdG9rZW5zLnNpemUoKSA9PT0gMiAmJiBpc0dyb3VwKEdyb3Vwcy5CbG9jaywgdG9rZW5zLnNlY29uZCgpKSxcblx0XHRoLmxvYywgKCkgPT5cblx0XHRgRXhwZWN0ZWQgaW5kZW50ZWQgYmxvY2sgYWZ0ZXIgJHtofSwgYW5kIG5vdGhpbmcgZWxzZS5gKVxuXHRjb25zdCBibG9jayA9IHRva2Vucy5zZWNvbmQoKVxuXG5cdGNvbnN0IGxpbmVzID0gW11cblx0Zm9yIChjb25zdCBsaW5lIG9mIFNsaWNlLmdyb3VwKGJsb2NrKS5zbGljZXMoKSlcblx0XHRsaW5lcy5wdXNoKC4uLnBhcnNlTGluZU9yTGluZXMobGluZSkpXG5cdHJldHVybiBsaW5lc1xufVxuXG4vKiogUGFyc2UgYSB7QGxpbmsgQmxvY2tWYWx9IGlmIGBpc1ZhbGAsIGVsc2UgYSB7QGxpbmsgQmxvY2tEb30uICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCbG9ja0RvT3JWYWwoaXNWYWwsIHRva2Vucykge1xuXHRyZXR1cm4gKGlzVmFsID8gcGFyc2VCbG9ja1ZhbCA6IHBhcnNlQmxvY2tEbykodG9rZW5zKVxufVxuXG4vKiogUGFyc2UgYSB7QGxpbmsgQmxvY2tEb30uICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCbG9ja0RvKHRva2Vucykge1xuXHRjb25zdCBbb3BDb21tZW50LCByZXN0XSA9IHRyeVRha2VDb21tZW50KHRva2Vucylcblx0Y29uc3QgbGluZXMgPSBwbGFpbkJsb2NrTGluZXMocmVzdClcblx0cmV0dXJuIG5ldyBCbG9ja0RvKHRva2Vucy5sb2MsIG9wQ29tbWVudCwgbGluZXMpXG59XG5cbi8qKiBQYXJzZSBhIHtAbGluayBCbG9ja1ZhbH0uICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCbG9ja1ZhbCh0b2tlbnMpIHtcblx0Y29uc3QgW29wQ29tbWVudCwgcmVzdF0gPSB0cnlUYWtlQ29tbWVudCh0b2tlbnMpXG5cdGNoZWNrTm9uRW1wdHkocmVzdCwgJ1ZhbHVlIGJsb2NrIG5lZWRzIGF0IGxlYXN0IG9uZSBsaW5lLicpXG5cdGNvbnN0IHtraW5kLCBsaW5lcywgbGFzdExpbmV9ID0gcGFyc2VCbG9ja0tpbmQocmVzdClcblxuXHRpZiAoa2luZCA9PT0gQmxvY2tzLlBsYWluKSB7XG5cdFx0Y29uc3QgY3RyID0gbGFzdExpbmUgaW5zdGFuY2VvZiBUaHJvdyA/IEJsb2NrVmFsVGhyb3cgOiBCbG9ja1ZhbFJldHVyblxuXHRcdHJldHVybiBuZXcgY3RyKHRva2Vucy5sb2MsIG9wQ29tbWVudCwgbGluZXMsIGxhc3RMaW5lKVxuXHR9IGVsc2Vcblx0XHRyZXR1cm4gbmV3IChibG9ja0NvbnN0cnVjdG9yKGtpbmQpKSh0b2tlbnMubG9jLCBvcENvbW1lbnQsIGxpbmVzKVxufVxuXG4vKipcblBhcnNlIHRoZSBib2R5IG9mIGEgbW9kdWxlLlxuQHJldHVybiB7QXJyYXk8TXNBc3Q+fVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1vZHVsZUJsb2NrKHRva2Vucykge1xuXHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRyZXR1cm4gW11cblxuXHRjb25zdCBsb2MgPSB0b2tlbnMubG9jXG5cdGNvbnN0IG5hbWUgPSBvcHRpb25zLm1vZHVsZU5hbWUoKVxuXHRjb25zdCB7a2luZCwgbGluZXMsIGxhc3RMaW5lfSA9IHBhcnNlQmxvY2tLaW5kKHRva2VucywgdHJ1ZSlcblx0c3dpdGNoIChraW5kKSB7XG5cdFx0Y2FzZSBCbG9ja3MuQmFnOiBjYXNlIEJsb2Nrcy5NYXA6IHtcblx0XHRcdGNvbnN0IHZhbCA9IG5ldyBCbG9ja1dyYXAobG9jLCBuZXcgKGJsb2NrQ29uc3RydWN0b3Ioa2luZCkpKGxvYywgbnVsbCwgbGluZXMpKVxuXHRcdFx0cmV0dXJuIFtNb2R1bGVFeHBvcnREZWZhdWx0LmZvclZhbChsb2MsIG5hbWUsIHZhbCldXG5cdFx0fVxuXHRcdGNhc2UgQmxvY2tzLk9iajpcblx0XHRcdHJldHVybiBsaW5lcy5tYXAobGluZSA9PiB7XG5cdFx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgT2JqRW50cnkpIHtcblx0XHRcdFx0XHRjaGVjayhsaW5lIGluc3RhbmNlb2YgT2JqRW50cnlBc3NpZ24sIGxpbmUubG9jLFxuXHRcdFx0XHRcdFx0J01vZHVsZSBleHBvcnRzIGNhbiBub3QgYmUgY29tcHV0ZWQuJylcblx0XHRcdFx0XHRjaGVjayhsaW5lLmFzc2lnbiBpbnN0YW5jZW9mIEFzc2lnblNpbmdsZSwgbGluZS5sb2MsXG5cdFx0XHRcdFx0XHQnRXhwb3J0IEFzc2lnbkRlc3RydWN0dXJlIG5vdCB5ZXQgc3VwcG9ydGVkLicpXG5cdFx0XHRcdFx0cmV0dXJuIGxpbmUuYXNzaWduLmFzc2lnbmVlLm5hbWUgPT09IG5hbWUgP1xuXHRcdFx0XHRcdFx0bmV3IE1vZHVsZUV4cG9ydERlZmF1bHQobGluZS5sb2MsIGxpbmUuYXNzaWduKSA6XG5cdFx0XHRcdFx0XHRuZXcgTW9kdWxlRXhwb3J0TmFtZWQobGluZS5sb2MsIGxpbmUuYXNzaWduKVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHQvLyBUT0RPOiBJZiBSZWdpb24sIGxpbmUubGluZXMgPSBsaW5lLmxpbmVzLm1hcChjb252ZXJ0VG9FeHBvcnRzKVxuXHRcdFx0XHRcdHJldHVybiBsaW5lXG5cdFx0XHR9KVxuXHRcdGNhc2UgQmxvY2tzLlBsYWluOlxuXHRcdFx0aWYgKGxhc3RMaW5lIGluc3RhbmNlb2YgVmFsKVxuXHRcdFx0XHRsaW5lcy5wdXNoKE1vZHVsZUV4cG9ydERlZmF1bHQuZm9yVmFsKGxvYywgbmFtZSwgbGFzdExpbmUpKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRsaW5lcy5wdXNoKGxhc3RMaW5lKVxuXHRcdFx0cmV0dXJuIGxpbmVzXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHRocm93IG5ldyBFcnJvcihraW5kKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBsYWluQmxvY2tMaW5lcyhsaW5lVG9rZW5zKSB7XG5cdGNvbnN0IGxpbmVzID0gW11cblx0Zm9yIChjb25zdCBfIG9mIGxpbmVUb2tlbnMuc2xpY2VzKCkpXG5cdFx0YWRkTGluZShsaW5lcywgcGFyc2VMaW5lKF8pKVxuXHRyZXR1cm4gbGluZXNcbn1cblxuZnVuY3Rpb24gYWRkTGluZShsaW5lcywgbGluZSkge1xuXHRpZiAobGluZSBpbnN0YW5jZW9mIEFycmF5KVxuXHRcdGZvciAoY29uc3QgXyBvZiBsaW5lKVxuXHRcdFx0YWRkTGluZShsaW5lcywgXylcblx0ZWxzZVxuXHRcdGxpbmVzLnB1c2gobGluZSlcbn1cblxuY29uc3QgQmxvY2tzID0ge1xuXHRCYWc6IDAsXG5cdE1hcDogMSxcblx0T2JqOiAyLFxuXHRQbGFpbjogM1xufVxuXG5mdW5jdGlvbiBibG9ja0NvbnN0cnVjdG9yKGtpbmQpIHtcblx0c3dpdGNoIChraW5kKSB7XG5cdFx0Y2FzZSBCbG9ja3MuQmFnOlxuXHRcdFx0cmV0dXJuIEJsb2NrQmFnXG5cdFx0Y2FzZSBCbG9ja3MuTWFwOlxuXHRcdFx0cmV0dXJuIEJsb2NrTWFwXG5cdFx0Y2FzZSBCbG9ja3MuT2JqOlxuXHRcdFx0cmV0dXJuIEJsb2NrT2JqXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHRocm93IG5ldyBFcnJvcihraW5kKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlQmxvY2tLaW5kKHRva2VucywgYWxsb3dMYXN0U3RhdGVtZW50KSB7XG5cdGNvbnN0IGxpbmVzID0gcGxhaW5CbG9ja0xpbmVzKHRva2Vucy5ydGFpbCgpKVxuXHRjb25zdCBsYXN0ID0gU2xpY2UuZ3JvdXAodG9rZW5zLmxhc3QoKSlcblx0bGV0IGlzQmFnID0gZmFsc2UsIGlzTWFwID0gZmFsc2UsIGlzT2JqID0gZmFsc2Vcblx0Y29uc3QgY2hlY2tMaW5lID0gbGluZSA9PiB7XG5cdFx0Ly8gVE9ETzogaWYgUmVnaW9uLCBsb29wIG92ZXIgaXRzIGxpbmVzXG5cdFx0aWYgKGxpbmUgaW5zdGFuY2VvZiBCYWdFbnRyeSB8fCBsaW5lIGluc3RhbmNlb2YgQmFnRW50cnlNYW55KVxuXHRcdFx0aXNCYWcgPSB0cnVlXG5cdFx0ZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIE1hcEVudHJ5KVxuXHRcdFx0aXNNYXAgPSB0cnVlXG5cdFx0ZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIE9iakVudHJ5KVxuXHRcdFx0aXNPYmogPSB0cnVlXG5cdH1cblx0Zm9yIChjb25zdCBfIG9mIGxpbmVzKVxuXHRcdGNoZWNrTGluZShfKVxuXG5cdGNvbnN0IGxhc3RMaW5lID0gYWxsb3dMYXN0U3RhdGVtZW50IHx8IGlzT2JqIHx8IGlzQmFnIHx8IGlzTWFwID9cblx0XHRwYXJzZUxpbmUobGFzdCkgOlxuXHRcdHBhcnNlQnVpbGRlck9yVmFsKGxhc3QpXG5cdGNoZWNrTGluZShsYXN0TGluZSlcblxuXHRjaGVjayghKGlzT2JqICYmIGlzQmFnKSwgbGluZXMubG9jLCAnQmxvY2sgaGFzIGJvdGggQmFnIGFuZCBPYmogbGluZXMuJylcblx0Y2hlY2soIShpc09iaiAmJiBpc01hcCksIGxpbmVzLmxvYywgJ0Jsb2NrIGhhcyBib3RoIE9iaiBhbmQgTWFwIGxpbmVzLicpXG5cdGNoZWNrKCEoaXNCYWcgJiYgaXNNYXApLCBsaW5lcy5sb2MsICdCbG9jayBoYXMgYm90aCBCYWcgYW5kIE1hcCBsaW5lcy4nKVxuXG5cdGNvbnN0IGtpbmQgPSBpc0JhZyA/IEJsb2Nrcy5CYWcgOiBpc01hcCA/IEJsb2Nrcy5NYXAgOiBpc09iaiA/IEJsb2Nrcy5PYmogOiBCbG9ja3MuUGxhaW5cblxuXHRpZiAoa2luZCAhPT0gQmxvY2tzLlBsYWluKSB7XG5cdFx0YWRkTGluZShsaW5lcywgbGFzdExpbmUpXG5cdFx0cmV0dXJuIHtraW5kLCBsaW5lc31cblx0fSBlbHNlXG5cdFx0cmV0dXJuIHtraW5kLCBsaW5lcywgbGFzdExpbmV9XG59XG5cbi8qXG5HZXRzIHZhbHVlIG9yIGJ1aWxkZXIgc3RhdGVtZW50LlxuRG9lcyBub3QgZ2V0IGUuZy4gaWYgc3RhdGVtZW50OyBnZXRzIGlmIHZhbHVlIGluc3RlYWRcbiovXG5mdW5jdGlvbiBwYXJzZUJ1aWxkZXJPclZhbCh0b2tlbnMpIHtcblx0Y29uc3QgbG9jID0gdG9rZW5zLmxvY1xuXHRjb25zdCBoZWFkID0gdG9rZW5zLmhlYWQoKVxuXHRjb25zdCByZXN0ID0gKCkgPT4gdG9rZW5zLnRhaWwoKVxuXG5cdGlmIChoZWFkIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRzd2l0Y2ggKGhlYWQua2luZCkge1xuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5Eb3QzOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VCYWdFbnRyeU1hbnkocmVzdCgpLCBsb2MpXG5cdFx0XHRjYXNlIEtleXdvcmRzLk9iakFzc2lnbjpcblx0XHRcdFx0cmV0dXJuIHBhcnNlQmFnRW50cnkocmVzdCgpLCBsb2MpXG5cdFx0XHRjYXNlIEtleXdvcmRzLlRocm93OlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VUaHJvdyhyZXN0KCksIGxvYylcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8vIGZhbGwgdGhyb3VnaFxuXHRcdH1cblxuXHRyZXR1cm4gaWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZShfID0+IGlzQW55S2V5d29yZChidWlsZGVyU3BsaXRLZXl3b3JkcywgXykpLFxuXHRcdCh7YmVmb3JlLCBhdCwgYWZ0ZXJ9KSA9PlxuXHRcdFx0KGF0LmtpbmQgPT09IEtleXdvcmRzLk1hcEVudHJ5ID8gcGFyc2VNYXBFbnRyeSA6IHBhcnNlT2JqRW50cnkpKGJlZm9yZSwgYWZ0ZXIsIGxvYyksXG5cdFx0KCkgPT4gcGFyc2VFeHByKHRva2VucykpXG59XG5cbmNvbnN0IGJ1aWxkZXJTcGxpdEtleXdvcmRzID0gbmV3IFNldChbS2V5d29yZHMuTWFwRW50cnksIEtleXdvcmRzLk9iakFzc2lnbl0pXG5cbiJdfQ==
'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../../CompileError', '../context', '../MsAst', '../Token', '../util', './checks', './parseLine', './tryTakeComment', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../../CompileError'), require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parseLine'), require('./tryTakeComment'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.MsAst, global.Token, global.util, global.checks, global.parseLine, global.tryTakeComment, global.Slice);
		global.parseBlock = mod.exports;
	}
})(this, function (exports, _CompileError, _context, _MsAst, _Token, _util, _checks, _parseLine, _tryTakeComment5, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.beforeAndBlock = beforeAndBlock;
	exports.beforeAndOpBlock = beforeAndOpBlock;
	exports.parseBlockWrap = parseBlockWrap;
	exports.justBlock = justBlock;
	exports.parseJustBlockDo = parseJustBlockDo;
	exports.parseJustBlockVal = parseJustBlockVal;
	exports.parseLinesFromBlock = parseLinesFromBlock;
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
		(0, _checks.checkEmpty)(before, () => `Did not expect anything between ${ (0, _CompileError.code)((0, _Token.keywordName)(keywordKind)) } and block.`);
		return block;
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

		var _parseBlockLines = parseBlockLines(rest);

		const lines = _parseBlockLines.lines;
		const returnKind = _parseBlockLines.returnKind;

		switch (returnKind) {
			case Returns.Bag:
				return new _MsAst.BlockBag(tokens.loc, opComment, lines);

			case Returns.Map:
				return new _MsAst.BlockMap(tokens.loc, opComment, lines);

			case Returns.Obj:
				return new _MsAst.BlockObj(tokens.loc, opComment, lines);

			default:
				{
					(0, _context.check)(!(0, _util.isEmpty)(lines), tokens.loc, 'Value block must end in a value.');
					const val = (0, _util.last)(lines);
					if (val instanceof _MsAst.Throw) return new _MsAst.BlockValThrow(tokens.loc, opComment, (0, _util.rtail)(lines), val);else {
						(0, _context.check)(val instanceof _MsAst.Val, val.loc, 'Value block must end in a value.');
						return new _MsAst.BlockValReturn(tokens.loc, opComment, (0, _util.rtail)(lines), val);
					}
				}
		}
	}

	function parseModuleBlock(tokens) {
		var _parseBlockLines2 = parseBlockLines(tokens, true);

		const lines = _parseBlockLines2.lines;
		const returnKind = _parseBlockLines2.returnKind;
		const opComment = null;
		const loc = tokens.loc;

		switch (returnKind) {
			case Returns.Bag:
			case Returns.Map:
				{
					const cls = returnKind === Returns.Bag ? _MsAst.BlockBag : _MsAst.BlockMap;
					const block = new cls(loc, opComment, lines);
					const val = new _MsAst.BlockWrap(loc, block);

					const assignee = _MsAst.LocalDeclare.plain(loc, _context.options.moduleName());

					const assign = new _MsAst.AssignSingle(loc, assignee, val);
					return [new _MsAst.ModuleExportDefault(loc, assign)];
				}

			case Returns.Obj:
				{
					const moduleName = _context.options.moduleName();

					const convertToExports = line => {
						if (line instanceof _MsAst.ObjEntry) {
							(0, _context.check)(line instanceof _MsAst.ObjEntryAssign, line.loc, 'Module exports can not be computed.');
							(0, _context.check)(line.assign instanceof _MsAst.AssignSingle, line.loc, 'Export AssignDestructure not yet supported.');
							return line.assign.assignee.name === moduleName ? new _MsAst.ModuleExportDefault(line.loc, line.assign) : new _MsAst.ModuleExportNamed(line.loc, line.assign);
						}

						return line;
					};

					return lines.map(convertToExports);
				}

			default:
				{
					var _tryTakeLastVal = tryTakeLastVal(lines);

					var _tryTakeLastVal2 = _slicedToArray(_tryTakeLastVal, 2);

					const moduleLines = _tryTakeLastVal2[0];
					const opDefaultExport = _tryTakeLastVal2[1];

					if (opDefaultExport !== null) {
						const _ = opDefaultExport;
						moduleLines.push(new _MsAst.ModuleExportDefault(_.loc, new _MsAst.AssignSingle(_.loc, _MsAst.LocalDeclare.plain(opDefaultExport.loc, _context.options.moduleName()), _)));
					}

					return moduleLines;
				}
		}
	}

	function tryTakeLastVal(lines) {
		return !(0, _util.isEmpty)(lines) && (0, _util.last)(lines) instanceof _MsAst.Val ? [(0, _util.rtail)(lines), (0, _util.last)(lines)] : [lines, null];
	}

	function plainBlockLines(lineTokens) {
		const lines = [];

		const addLine = line => {
			if (line instanceof Array) for (const _ of line) addLine(_);else lines.push(line);
		};

		for (const _ of lineTokens.slices()) addLine((0, _parseLine2.default)(_));

		return lines;
	}

	const Returns = {
		Plain: 0,
		Obj: 1,
		Bag: 2,
		Map: 3
	};

	function parseBlockLines(lineTokens) {
		let isBag = false,
		    isMap = false,
		    isObj = false;

		const checkLine = line => {
			if (line instanceof _MsAst.BagEntry) isBag = true;else if (line instanceof _MsAst.MapEntry) isMap = true;else if (line instanceof _MsAst.ObjEntry) isObj = true;
		};

		const lines = plainBlockLines(lineTokens);

		for (const _ of lines) checkLine(_);

		(0, _context.check)(!(isObj && isBag), lines.loc, 'Block has both Bag and Obj lines.');
		(0, _context.check)(!(isObj && isMap), lines.loc, 'Block has both Obj and Map lines.');
		(0, _context.check)(!(isBag && isMap), lines.loc, 'Block has both Bag and Map lines.');
		const returnKind = isObj ? Returns.Obj : isBag ? Returns.Bag : isMap ? Returns.Map : Returns.Plain;
		return {
			lines,
			returnKind
		};
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQmxvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBZ0JnQixjQUFjLEdBQWQsY0FBYztTQU1kLGdCQUFnQixHQUFoQixnQkFBZ0I7U0FVaEIsY0FBYyxHQUFkLGNBQWM7U0FhZCxTQUFTLEdBQVQsU0FBUztTQVFULGdCQUFnQixHQUFoQixnQkFBZ0I7U0FLaEIsaUJBQWlCLEdBQWpCLGlCQUFpQjtTQVFqQixtQkFBbUIsR0FBbkIsbUJBQW1CO1NBY25CLFlBQVksR0FBWixZQUFZO1NBT1osYUFBYSxHQUFiLGFBQWE7U0EyQmIsZ0JBQWdCLEdBQWhCLGdCQUFnQjs7Ozs7Ozs7Ozs7O1VBbEdoQixjQUFjOzs7Ozs7Ozs7OztVQU1kLGdCQUFnQjs7Ozs7OztVQVVoQixjQUFjOzs7O1VBYWQsU0FBUzs7Ozs7Ozs7Ozs7VUFRVCxnQkFBZ0I7Ozs7VUFLaEIsaUJBQWlCOzs7O1VBUWpCLG1CQUFtQjs7Ozs7Ozs7Ozs7VUFjbkIsWUFBWTs7Ozs7Ozs7Ozs7VUFPWixhQUFhOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQTJCYixnQkFBZ0IiLCJmaWxlIjoicGFyc2VCbG9jay5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVjaywgb3B0aW9uc30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7QXNzaWduU2luZ2xlLCBCYWdFbnRyeSwgQmxvY2tCYWcsIEJsb2NrRG8sIEJsb2NrT2JqLCBCbG9ja01hcCwgQmxvY2tWYWxSZXR1cm4sXG5cdEJsb2NrVmFsVGhyb3csIEJsb2NrV3JhcCwgTG9jYWxEZWNsYXJlLCBNYXBFbnRyeSwgTW9kdWxlRXhwb3J0RGVmYXVsdCwgTW9kdWxlRXhwb3J0TmFtZWQsXG5cdE9iakVudHJ5LCBPYmpFbnRyeUFzc2lnbiwgVGhyb3csIFZhbH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwcywgaXNHcm91cCwga2V5d29yZE5hbWV9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtpc0VtcHR5LCBsYXN0LCBydGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tFbXB0eX0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQgcGFyc2VMaW5lLCB7cGFyc2VMaW5lT3JMaW5lc30gZnJvbSAnLi9wYXJzZUxpbmUnXG5pbXBvcnQgdHJ5VGFrZUNvbW1lbnQgZnJvbSAnLi90cnlUYWtlQ29tbWVudCdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKipcblRva2VucyBvbiB0aGUgbGluZSBiZWZvcmUgYSBibG9jaywgYW5kIHRva2VucyBmb3IgdGhlIGJsb2NrIGl0c2VsZi5cbkByZXR1cm4ge1tTbGljZSwgU2xpY2VdfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmVBbmRCbG9jayh0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgb3BCbG9ja10gPSBiZWZvcmVBbmRPcEJsb2NrKHRva2Vucylcblx0Y2hlY2sob3BCbG9jayAhPT0gbnVsbCwgb3BCbG9jay5sb2MsICdFeHBlY3RlZCBhbiBpbmRlbnRlZCBibG9jayBhdCB0aGUgZW5kLicpXG5cdHJldHVybiBbYmVmb3JlLCBvcEJsb2NrXVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYmVmb3JlQW5kT3BCbG9jayh0b2tlbnMpIHtcblx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIFt0b2tlbnMsIG51bGxdXG5cdGVsc2Uge1xuXHRcdGNvbnN0IGJsb2NrID0gdG9rZW5zLmxhc3QoKVxuXHRcdHJldHVybiBpc0dyb3VwKEdyb3Vwcy5CbG9jaywgYmxvY2spID8gW3Rva2Vucy5ydGFpbCgpLCBTbGljZS5ncm91cChibG9jayldIDogW3Rva2VucywgbnVsbF1cblx0fVxufVxuXG4vKiogUGFyc2UgYSBCbG9jayBhcyBhIHNpbmdsZSB2YWx1ZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUJsb2NrV3JhcCh0b2tlbnMpIHtcblx0cmV0dXJuIG5ldyBCbG9ja1dyYXAodG9rZW5zLmxvYywgcGFyc2VCbG9ja1ZhbCh0b2tlbnMpKVxufVxuXG4vKipcblBhcnNlIGEgYmxvY2ssIHRocm93aW5nIGFuIGVycm9yIGlmIHRoZXJlJ3MgYW55dGhpbmcgYmVmb3JlIHRoZSBibG9jay5cbkBwYXJhbSB7S2V5d29yZHN9IGtleXdvcmRLaW5kIEtleXdvcmQgdGhhdCBwcmVjZWRlcyB0aGUgYmxvY2suIFVzZWQgZm9yIGVycm9yIG1lc3NhZ2UuXG5AcGFyYW0ge1NsaWNlfSB0b2tlbnNcblx0VG9rZW5zIHdoaWNoIHNob3VsZCBjb250YWluIGEgYmxvY2suXG5cdFVubGlrZSB7QGxpbmsgcGFyc2VCbG9ja0RvfSwgdGhlc2UgYXJlICpub3QqIHRoZSB0b2tlbnMgKndpdGhpbiogdGhlIGJsb2NrLlxuXHRUaGVzZSB0b2tlbnMgYXJlICpleHBlY3RlZCogdG8ganVzdCBiZSBhIHtAbGluayBHcm91cHMuQmxvY2t9LlxuXHQoSWYgdGhlcmUncyBhbnl0aGluZyBlbHNlLCBhIHtAbGluayBDb21waWxlRXJyb3J9IHdpbGwgYmUgdGhyb3duLilcbiovXG5leHBvcnQgZnVuY3Rpb24ganVzdEJsb2NrKGtleXdvcmRLaW5kLCB0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRjaGVja0VtcHR5KGJlZm9yZSwgKCkgPT5cblx0XHRgRGlkIG5vdCBleHBlY3QgYW55dGhpbmcgYmV0d2VlbiAke2NvZGUoa2V5d29yZE5hbWUoa2V5d29yZEtpbmQpKX0gYW5kIGJsb2NrLmApXG5cdHJldHVybiBibG9ja1xufVxuXG4vKiogUGFyc2UgYSB7QGxpbmsgQmxvY2tEb30sIGZhaWxpbmcgaWYgdGhlcmUncyBzb21ldGhpbmcgcHJlY2VkaW5nIGl0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlSnVzdEJsb2NrRG8oa2V5d29yZCwgdG9rZW5zKSB7XG5cdHJldHVybiBwYXJzZUJsb2NrRG8oanVzdEJsb2NrKGtleXdvcmQsIHRva2VucykpXG59XG5cbi8qKiBQYXJzZSBhIHtAbGluayBCbG9ja1ZhbH0sIGZhaWxpbmcgaWYgdGhlcmUncyBzb21ldGhpbmcgcHJlY2VkaW5nIGl0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlSnVzdEJsb2NrVmFsKGtleXdvcmQsIHRva2Vucykge1xuXHRyZXR1cm4gcGFyc2VCbG9ja1ZhbChqdXN0QmxvY2soa2V5d29yZCwgdG9rZW5zKSlcbn1cblxuLyoqXG5HZXQgbGluZXMgaW4gYSByZWdpb24uXG5AcmV0dXJuIHtBcnJheTxNc0FzdD59XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTGluZXNGcm9tQmxvY2sodG9rZW5zKSB7XG5cdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpXG5cdGNoZWNrKHRva2Vucy5zaXplKCkgPiAxICYmIHRva2Vucy5zaXplKCkgPT09IDIgJiYgaXNHcm91cChHcm91cHMuQmxvY2ssIHRva2Vucy5zZWNvbmQoKSksXG5cdFx0aC5sb2MsICgpID0+XG5cdFx0YEV4cGVjdGVkIGluZGVudGVkIGJsb2NrIGFmdGVyICR7aH0sIGFuZCBub3RoaW5nIGVsc2UuYClcblx0Y29uc3QgYmxvY2sgPSB0b2tlbnMuc2Vjb25kKClcblxuXHRjb25zdCBsaW5lcyA9IFtdXG5cdGZvciAoY29uc3QgbGluZSBvZiBTbGljZS5ncm91cChibG9jaykuc2xpY2VzKCkpXG5cdFx0bGluZXMucHVzaCguLi5wYXJzZUxpbmVPckxpbmVzKGxpbmUpKVxuXHRyZXR1cm4gbGluZXNcbn1cblxuLyoqIFBhcnNlIGEge0BsaW5rIEJsb2NrRG99LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQmxvY2tEbyh0b2tlbnMpIHtcblx0Y29uc3QgW29wQ29tbWVudCwgcmVzdF0gPSB0cnlUYWtlQ29tbWVudCh0b2tlbnMpXG5cdGNvbnN0IGxpbmVzID0gcGxhaW5CbG9ja0xpbmVzKHJlc3QpXG5cdHJldHVybiBuZXcgQmxvY2tEbyh0b2tlbnMubG9jLCBvcENvbW1lbnQsIGxpbmVzKVxufVxuXG4vKiogUGFyc2UgYSB7QGxpbmsgQmxvY2tWYWx9LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQmxvY2tWYWwodG9rZW5zKSB7XG5cdGNvbnN0IFtvcENvbW1lbnQsIHJlc3RdID0gdHJ5VGFrZUNvbW1lbnQodG9rZW5zKVxuXHRjb25zdCB7bGluZXMsIHJldHVybktpbmR9ID0gcGFyc2VCbG9ja0xpbmVzKHJlc3QpXG5cdHN3aXRjaCAocmV0dXJuS2luZCkge1xuXHRcdGNhc2UgUmV0dXJucy5CYWc6XG5cdFx0XHRyZXR1cm4gbmV3IEJsb2NrQmFnKHRva2Vucy5sb2MsIG9wQ29tbWVudCwgbGluZXMpXG5cdFx0Y2FzZSBSZXR1cm5zLk1hcDpcblx0XHRcdHJldHVybiBuZXcgQmxvY2tNYXAodG9rZW5zLmxvYywgb3BDb21tZW50LCBsaW5lcylcblx0XHRjYXNlIFJldHVybnMuT2JqOlxuXHRcdFx0cmV0dXJuIG5ldyBCbG9ja09iaih0b2tlbnMubG9jLCBvcENvbW1lbnQsIGxpbmVzKVxuXHRcdGRlZmF1bHQ6IHtcblx0XHRcdGNoZWNrKCFpc0VtcHR5KGxpbmVzKSwgdG9rZW5zLmxvYywgJ1ZhbHVlIGJsb2NrIG11c3QgZW5kIGluIGEgdmFsdWUuJylcblx0XHRcdGNvbnN0IHZhbCA9IGxhc3QobGluZXMpXG5cdFx0XHRpZiAodmFsIGluc3RhbmNlb2YgVGhyb3cpXG5cdFx0XHRcdHJldHVybiBuZXcgQmxvY2tWYWxUaHJvdyh0b2tlbnMubG9jLCBvcENvbW1lbnQsIHJ0YWlsKGxpbmVzKSwgdmFsKVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGNoZWNrKHZhbCBpbnN0YW5jZW9mIFZhbCwgdmFsLmxvYywgJ1ZhbHVlIGJsb2NrIG11c3QgZW5kIGluIGEgdmFsdWUuJylcblx0XHRcdFx0cmV0dXJuIG5ldyBCbG9ja1ZhbFJldHVybih0b2tlbnMubG9jLCBvcENvbW1lbnQsIHJ0YWlsKGxpbmVzKSwgdmFsKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG4vKipcblBhcnNlIHRoZSBib2R5IG9mIGEgbW9kdWxlLlxuQHJldHVybiB7QXJyYXk8TXNBc3Q+fVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1vZHVsZUJsb2NrKHRva2Vucykge1xuXHRjb25zdCB7bGluZXMsIHJldHVybktpbmR9ID0gcGFyc2VCbG9ja0xpbmVzKHRva2VucywgdHJ1ZSlcblx0Y29uc3Qgb3BDb21tZW50ID0gbnVsbFxuXHRjb25zdCBsb2MgPSB0b2tlbnMubG9jXG5cdHN3aXRjaCAocmV0dXJuS2luZCkge1xuXHRcdGNhc2UgUmV0dXJucy5CYWc6IGNhc2UgUmV0dXJucy5NYXA6IHtcblx0XHRcdGNvbnN0IGNscyA9IHJldHVybktpbmQgPT09IFJldHVybnMuQmFnID8gQmxvY2tCYWcgOiBCbG9ja01hcFxuXHRcdFx0Y29uc3QgYmxvY2sgPSBuZXcgY2xzKGxvYywgb3BDb21tZW50LCBsaW5lcylcblx0XHRcdGNvbnN0IHZhbCA9IG5ldyBCbG9ja1dyYXAobG9jLCBibG9jaylcblx0XHRcdGNvbnN0IGFzc2lnbmVlID0gTG9jYWxEZWNsYXJlLnBsYWluKGxvYywgb3B0aW9ucy5tb2R1bGVOYW1lKCkpXG5cdFx0XHRjb25zdCBhc3NpZ24gPSBuZXcgQXNzaWduU2luZ2xlKGxvYywgYXNzaWduZWUsIHZhbClcblx0XHRcdHJldHVybiBbbmV3IE1vZHVsZUV4cG9ydERlZmF1bHQobG9jLCBhc3NpZ24pXVxuXHRcdH1cblx0XHRjYXNlIFJldHVybnMuT2JqOiB7XG5cdFx0XHRjb25zdCBtb2R1bGVOYW1lID0gb3B0aW9ucy5tb2R1bGVOYW1lKClcblxuXHRcdFx0Ly8gTW9kdWxlIGV4cG9ydHMgbG9vayBsaWtlIGEgQmxvY2tPYmosICBidXQgYXJlIHJlYWxseSBkaWZmZXJlbnQuXG5cdFx0XHQvLyBJbiBFUzYsIG1vZHVsZSBleHBvcnRzIG11c3QgYmUgY29tcGxldGVseSBzdGF0aWMuXG5cdFx0XHQvLyBTbyB3ZSBrZWVwIGFuIGFycmF5IG9mIGV4cG9ydHMgYXR0YWNoZWQgZGlyZWN0bHkgdG8gdGhlIE1vZHVsZSBhc3QuXG5cdFx0XHQvLyBJZiB5b3Ugd3JpdGU6XG5cdFx0XHQvL1x0aWYhIGNvbmRcblx0XHRcdC8vXHRcdGEuIGJcblx0XHRcdC8vIGluIGEgbW9kdWxlIGNvbnRleHQsIGl0IHdpbGwgYmUgYW4gZXJyb3IuIChUaGUgbW9kdWxlIGNyZWF0ZXMgbm8gYGJ1aWx0YCBsb2NhbC4pXG5cdFx0XHRjb25zdCBjb252ZXJ0VG9FeHBvcnRzID0gbGluZSA9PiB7XG5cdFx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgT2JqRW50cnkpIHtcblx0XHRcdFx0XHRjaGVjayhsaW5lIGluc3RhbmNlb2YgT2JqRW50cnlBc3NpZ24sIGxpbmUubG9jLFxuXHRcdFx0XHRcdFx0J01vZHVsZSBleHBvcnRzIGNhbiBub3QgYmUgY29tcHV0ZWQuJylcblx0XHRcdFx0XHRjaGVjayhsaW5lLmFzc2lnbiBpbnN0YW5jZW9mIEFzc2lnblNpbmdsZSwgbGluZS5sb2MsXG5cdFx0XHRcdFx0XHQnRXhwb3J0IEFzc2lnbkRlc3RydWN0dXJlIG5vdCB5ZXQgc3VwcG9ydGVkLicpXG5cdFx0XHRcdFx0cmV0dXJuIGxpbmUuYXNzaWduLmFzc2lnbmVlLm5hbWUgPT09IG1vZHVsZU5hbWUgP1xuXHRcdFx0XHRcdFx0bmV3IE1vZHVsZUV4cG9ydERlZmF1bHQobGluZS5sb2MsIGxpbmUuYXNzaWduKSA6XG5cdFx0XHRcdFx0XHRuZXcgTW9kdWxlRXhwb3J0TmFtZWQobGluZS5sb2MsIGxpbmUuYXNzaWduKVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIFRPRE86IElmIFJlZ2lvbiwgbGluZS5saW5lcyA9IGxpbmUubGluZXMubWFwKGNvbnZlcnRUb0V4cG9ydHMpXG5cdFx0XHRcdHJldHVybiBsaW5lXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBsaW5lcy5tYXAoY29udmVydFRvRXhwb3J0cylcblx0XHR9XG5cdFx0ZGVmYXVsdDoge1xuXHRcdFx0Y29uc3QgW21vZHVsZUxpbmVzLCBvcERlZmF1bHRFeHBvcnRdID0gdHJ5VGFrZUxhc3RWYWwobGluZXMpXG5cdFx0XHRpZiAob3BEZWZhdWx0RXhwb3J0ICE9PSBudWxsKSB7XG5cdFx0XHRcdGNvbnN0IF8gPSBvcERlZmF1bHRFeHBvcnRcblx0XHRcdFx0bW9kdWxlTGluZXMucHVzaChuZXcgTW9kdWxlRXhwb3J0RGVmYXVsdChfLmxvYyxcblx0XHRcdFx0XHRuZXcgQXNzaWduU2luZ2xlKF8ubG9jLFxuXHRcdFx0XHRcdFx0TG9jYWxEZWNsYXJlLnBsYWluKG9wRGVmYXVsdEV4cG9ydC5sb2MsIG9wdGlvbnMubW9kdWxlTmFtZSgpKSxcblx0XHRcdFx0XHRcdF8pKSlcblx0XHRcdH1cblx0XHRcdHJldHVybiBtb2R1bGVMaW5lc1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiB0cnlUYWtlTGFzdFZhbChsaW5lcykge1xuXHRyZXR1cm4gIWlzRW1wdHkobGluZXMpICYmIGxhc3QobGluZXMpIGluc3RhbmNlb2YgVmFsID9cblx0XHRbcnRhaWwobGluZXMpLCBsYXN0KGxpbmVzKV0gOlxuXHRcdFtsaW5lcywgbnVsbF1cbn1cblxuZnVuY3Rpb24gcGxhaW5CbG9ja0xpbmVzKGxpbmVUb2tlbnMpIHtcblx0Y29uc3QgbGluZXMgPSBbXVxuXHRjb25zdCBhZGRMaW5lID0gbGluZSA9PiB7XG5cdFx0aWYgKGxpbmUgaW5zdGFuY2VvZiBBcnJheSlcblx0XHRcdGZvciAoY29uc3QgXyBvZiBsaW5lKVxuXHRcdFx0XHRhZGRMaW5lKF8pXG5cdFx0ZWxzZVxuXHRcdFx0bGluZXMucHVzaChsaW5lKVxuXHR9XG5cdGZvciAoY29uc3QgXyBvZiBsaW5lVG9rZW5zLnNsaWNlcygpKVxuXHRcdGFkZExpbmUocGFyc2VMaW5lKF8pKVxuXHRyZXR1cm4gbGluZXNcbn1cblxuY29uc3QgUmV0dXJucyA9IHtcblx0UGxhaW46IDAsXG5cdE9iajogMSxcblx0QmFnOiAyLFxuXHRNYXA6IDNcbn1cblxuZnVuY3Rpb24gcGFyc2VCbG9ja0xpbmVzKGxpbmVUb2tlbnMpIHtcblx0XHRsZXQgaXNCYWcgPSBmYWxzZSwgaXNNYXAgPSBmYWxzZSwgaXNPYmogPSBmYWxzZVxuXHRjb25zdCBjaGVja0xpbmUgPSBsaW5lID0+IHtcblx0XHQvLyBUT0RPOiBpZiBSZWdpb24sIGxvb3Agb3ZlciBpdHMgbGluZXNcblx0XHRpZiAobGluZSBpbnN0YW5jZW9mIEJhZ0VudHJ5KVxuXHRcdFx0aXNCYWcgPSB0cnVlXG5cdFx0ZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIE1hcEVudHJ5KVxuXHRcdFx0aXNNYXAgPSB0cnVlXG5cdFx0ZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIE9iakVudHJ5KVxuXHRcdFx0aXNPYmogPSB0cnVlXG5cdH1cblx0Y29uc3QgbGluZXMgPSBwbGFpbkJsb2NrTGluZXMobGluZVRva2Vucylcblx0Zm9yIChjb25zdCBfIG9mIGxpbmVzKVxuXHRcdGNoZWNrTGluZShfKVxuXG5cdGNoZWNrKCEoaXNPYmogJiYgaXNCYWcpLCBsaW5lcy5sb2MsICdCbG9jayBoYXMgYm90aCBCYWcgYW5kIE9iaiBsaW5lcy4nKVxuXHRjaGVjayghKGlzT2JqICYmIGlzTWFwKSwgbGluZXMubG9jLCAnQmxvY2sgaGFzIGJvdGggT2JqIGFuZCBNYXAgbGluZXMuJylcblx0Y2hlY2soIShpc0JhZyAmJiBpc01hcCksIGxpbmVzLmxvYywgJ0Jsb2NrIGhhcyBib3RoIEJhZyBhbmQgTWFwIGxpbmVzLicpXG5cblx0Y29uc3QgcmV0dXJuS2luZCA9XG5cdFx0aXNPYmogPyBSZXR1cm5zLk9iaiA6IGlzQmFnID8gUmV0dXJucy5CYWcgOiBpc01hcCA/IFJldHVybnMuTWFwIDogUmV0dXJucy5QbGFpblxuXHRyZXR1cm4ge2xpbmVzLCByZXR1cm5LaW5kfVxufVxuIl19
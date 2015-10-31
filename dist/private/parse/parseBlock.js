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
		(0, _checks.checkNonEmpty)(tokens, 'Expected an indented block.');
		const block = tokens.last();
		(0, _context.check)((0, _Token.isGroup)(_Token.Groups.Block, block), block.loc, 'Expected an indented block.');
		return [tokens.rtail(), _Slice2.default.group(block)];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQmxvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBZ0JnQixjQUFjLEdBQWQsY0FBYztTQVFkLGNBQWMsR0FBZCxjQUFjO1NBYWQsU0FBUyxHQUFULFNBQVM7U0FRVCxnQkFBZ0IsR0FBaEIsZ0JBQWdCO1NBS2hCLGlCQUFpQixHQUFqQixpQkFBaUI7U0FRakIsbUJBQW1CLEdBQW5CLG1CQUFtQjtTQWNuQixZQUFZLEdBQVosWUFBWTtTQU9aLGFBQWEsR0FBYixhQUFhO1NBMkJiLGdCQUFnQixHQUFoQixnQkFBZ0I7Ozs7Ozs7Ozs7OztVQTFGaEIsY0FBYzs7Ozs7OztVQVFkLGNBQWM7Ozs7VUFhZCxTQUFTOzs7Ozs7Ozs7OztVQVFULGdCQUFnQjs7OztVQUtoQixpQkFBaUI7Ozs7VUFRakIsbUJBQW1COzs7Ozs7Ozs7OztVQWNuQixZQUFZOzs7Ozs7Ozs7OztVQU9aLGFBQWE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBMkJiLGdCQUFnQiIsImZpbGUiOiJwYXJzZUJsb2NrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCBvcHRpb25zfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtBc3NpZ25TaW5nbGUsIEJhZ0VudHJ5LCBCbG9ja0JhZywgQmxvY2tEbywgQmxvY2tPYmosIEJsb2NrTWFwLCBCbG9ja1ZhbFJldHVybixcblx0QmxvY2tWYWxUaHJvdywgQmxvY2tXcmFwLCBMb2NhbERlY2xhcmUsIE1hcEVudHJ5LCBNb2R1bGVFeHBvcnREZWZhdWx0LCBNb2R1bGVFeHBvcnROYW1lZCxcblx0T2JqRW50cnksIE9iakVudHJ5QXNzaWduLCBUaHJvdywgVmFsfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXBzLCBpc0dyb3VwLCBrZXl3b3JkTmFtZX0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2lzRW1wdHksIGxhc3QsIHJ0YWlsfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtjaGVja0VtcHR5LCBjaGVja05vbkVtcHR5fSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCBwYXJzZUxpbmUsIHtwYXJzZUxpbmVPckxpbmVzfSBmcm9tICcuL3BhcnNlTGluZSdcbmltcG9ydCB0cnlUYWtlQ29tbWVudCBmcm9tICcuL3RyeVRha2VDb21tZW50J1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8qKlxuVG9rZW5zIG9uIHRoZSBsaW5lIGJlZm9yZSBhIGJsb2NrLCBhbmQgdG9rZW5zIGZvciB0aGUgYmxvY2sgaXRzZWxmLlxuQHJldHVybiB7W1NsaWNlLCBTbGljZV19XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGJlZm9yZUFuZEJsb2NrKHRva2Vucykge1xuXHRjaGVja05vbkVtcHR5KHRva2VucywgJ0V4cGVjdGVkIGFuIGluZGVudGVkIGJsb2NrLicpXG5cdGNvbnN0IGJsb2NrID0gdG9rZW5zLmxhc3QoKVxuXHRjaGVjayhpc0dyb3VwKEdyb3Vwcy5CbG9jaywgYmxvY2spLCBibG9jay5sb2MsICdFeHBlY3RlZCBhbiBpbmRlbnRlZCBibG9jay4nKVxuXHRyZXR1cm4gW3Rva2Vucy5ydGFpbCgpLCBTbGljZS5ncm91cChibG9jayldXG59XG5cbi8qKiBQYXJzZSBhIEJsb2NrIGFzIGEgc2luZ2xlIHZhbHVlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQmxvY2tXcmFwKHRva2Vucykge1xuXHRyZXR1cm4gbmV3IEJsb2NrV3JhcCh0b2tlbnMubG9jLCBwYXJzZUJsb2NrVmFsKHRva2VucykpXG59XG5cbi8qKlxuUGFyc2UgYSBibG9jaywgdGhyb3dpbmcgYW4gZXJyb3IgaWYgdGhlcmUncyBhbnl0aGluZyBiZWZvcmUgdGhlIGJsb2NrLlxuQHBhcmFtIHtLZXl3b3Jkc30ga2V5d29yZEtpbmQgS2V5d29yZCB0aGF0IHByZWNlZGVzIHRoZSBibG9jay4gVXNlZCBmb3IgZXJyb3IgbWVzc2FnZS5cbkBwYXJhbSB7U2xpY2V9IHRva2Vuc1xuXHRUb2tlbnMgd2hpY2ggc2hvdWxkIGNvbnRhaW4gYSBibG9jay5cblx0VW5saWtlIHtAbGluayBwYXJzZUJsb2NrRG99LCB0aGVzZSBhcmUgKm5vdCogdGhlIHRva2VucyAqd2l0aGluKiB0aGUgYmxvY2suXG5cdFRoZXNlIHRva2VucyBhcmUgKmV4cGVjdGVkKiB0byBqdXN0IGJlIGEge0BsaW5rIEdyb3Vwcy5CbG9ja30uXG5cdChJZiB0aGVyZSdzIGFueXRoaW5nIGVsc2UsIGEge0BsaW5rIENvbXBpbGVFcnJvcn0gd2lsbCBiZSB0aHJvd24uKVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBqdXN0QmxvY2soa2V5d29yZEtpbmQsIHRva2Vucykge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdGNoZWNrRW1wdHkoYmVmb3JlLCAoKSA9PlxuXHRcdGBEaWQgbm90IGV4cGVjdCBhbnl0aGluZyBiZXR3ZWVuICR7Y29kZShrZXl3b3JkTmFtZShrZXl3b3JkS2luZCkpfSBhbmQgYmxvY2suYClcblx0cmV0dXJuIGJsb2NrXG59XG5cbi8qKiBQYXJzZSBhIHtAbGluayBCbG9ja0RvfSwgZmFpbGluZyBpZiB0aGVyZSdzIHNvbWV0aGluZyBwcmVjZWRpbmcgaXQuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VKdXN0QmxvY2tEbyhrZXl3b3JkLCB0b2tlbnMpIHtcblx0cmV0dXJuIHBhcnNlQmxvY2tEbyhqdXN0QmxvY2soa2V5d29yZCwgdG9rZW5zKSlcbn1cblxuLyoqIFBhcnNlIGEge0BsaW5rIEJsb2NrVmFsfSwgZmFpbGluZyBpZiB0aGVyZSdzIHNvbWV0aGluZyBwcmVjZWRpbmcgaXQuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VKdXN0QmxvY2tWYWwoa2V5d29yZCwgdG9rZW5zKSB7XG5cdHJldHVybiBwYXJzZUJsb2NrVmFsKGp1c3RCbG9jayhrZXl3b3JkLCB0b2tlbnMpKVxufVxuXG4vKipcbkdldCBsaW5lcyBpbiBhIHJlZ2lvbi5cbkByZXR1cm4ge0FycmF5PE1zQXN0Pn1cbiovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VMaW5lc0Zyb21CbG9jayh0b2tlbnMpIHtcblx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKClcblx0Y2hlY2sodG9rZW5zLnNpemUoKSA+IDEgJiYgdG9rZW5zLnNpemUoKSA9PT0gMiAmJiBpc0dyb3VwKEdyb3Vwcy5CbG9jaywgdG9rZW5zLnNlY29uZCgpKSxcblx0XHRoLmxvYywgKCkgPT5cblx0XHRgRXhwZWN0ZWQgaW5kZW50ZWQgYmxvY2sgYWZ0ZXIgJHtofSwgYW5kIG5vdGhpbmcgZWxzZS5gKVxuXHRjb25zdCBibG9jayA9IHRva2Vucy5zZWNvbmQoKVxuXG5cdGNvbnN0IGxpbmVzID0gW11cblx0Zm9yIChjb25zdCBsaW5lIG9mIFNsaWNlLmdyb3VwKGJsb2NrKS5zbGljZXMoKSlcblx0XHRsaW5lcy5wdXNoKC4uLnBhcnNlTGluZU9yTGluZXMobGluZSkpXG5cdHJldHVybiBsaW5lc1xufVxuXG4vKiogUGFyc2UgYSB7QGxpbmsgQmxvY2tEb30uICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCbG9ja0RvKHRva2Vucykge1xuXHRjb25zdCBbb3BDb21tZW50LCByZXN0XSA9IHRyeVRha2VDb21tZW50KHRva2Vucylcblx0Y29uc3QgbGluZXMgPSBwbGFpbkJsb2NrTGluZXMocmVzdClcblx0cmV0dXJuIG5ldyBCbG9ja0RvKHRva2Vucy5sb2MsIG9wQ29tbWVudCwgbGluZXMpXG59XG5cbi8qKiBQYXJzZSBhIHtAbGluayBCbG9ja1ZhbH0uICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCbG9ja1ZhbCh0b2tlbnMpIHtcblx0Y29uc3QgW29wQ29tbWVudCwgcmVzdF0gPSB0cnlUYWtlQ29tbWVudCh0b2tlbnMpXG5cdGNvbnN0IHtsaW5lcywgcmV0dXJuS2luZH0gPSBwYXJzZUJsb2NrTGluZXMocmVzdClcblx0c3dpdGNoIChyZXR1cm5LaW5kKSB7XG5cdFx0Y2FzZSBSZXR1cm5zLkJhZzpcblx0XHRcdHJldHVybiBuZXcgQmxvY2tCYWcodG9rZW5zLmxvYywgb3BDb21tZW50LCBsaW5lcylcblx0XHRjYXNlIFJldHVybnMuTWFwOlxuXHRcdFx0cmV0dXJuIG5ldyBCbG9ja01hcCh0b2tlbnMubG9jLCBvcENvbW1lbnQsIGxpbmVzKVxuXHRcdGNhc2UgUmV0dXJucy5PYmo6XG5cdFx0XHRyZXR1cm4gbmV3IEJsb2NrT2JqKHRva2Vucy5sb2MsIG9wQ29tbWVudCwgbGluZXMpXG5cdFx0ZGVmYXVsdDoge1xuXHRcdFx0Y2hlY2soIWlzRW1wdHkobGluZXMpLCB0b2tlbnMubG9jLCAnVmFsdWUgYmxvY2sgbXVzdCBlbmQgaW4gYSB2YWx1ZS4nKVxuXHRcdFx0Y29uc3QgdmFsID0gbGFzdChsaW5lcylcblx0XHRcdGlmICh2YWwgaW5zdGFuY2VvZiBUaHJvdylcblx0XHRcdFx0cmV0dXJuIG5ldyBCbG9ja1ZhbFRocm93KHRva2Vucy5sb2MsIG9wQ29tbWVudCwgcnRhaWwobGluZXMpLCB2YWwpXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y2hlY2sodmFsIGluc3RhbmNlb2YgVmFsLCB2YWwubG9jLCAnVmFsdWUgYmxvY2sgbXVzdCBlbmQgaW4gYSB2YWx1ZS4nKVxuXHRcdFx0XHRyZXR1cm4gbmV3IEJsb2NrVmFsUmV0dXJuKHRva2Vucy5sb2MsIG9wQ29tbWVudCwgcnRhaWwobGluZXMpLCB2YWwpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuUGFyc2UgdGhlIGJvZHkgb2YgYSBtb2R1bGUuXG5AcmV0dXJuIHtBcnJheTxNc0FzdD59XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTW9kdWxlQmxvY2sodG9rZW5zKSB7XG5cdGNvbnN0IHtsaW5lcywgcmV0dXJuS2luZH0gPSBwYXJzZUJsb2NrTGluZXModG9rZW5zLCB0cnVlKVxuXHRjb25zdCBvcENvbW1lbnQgPSBudWxsXG5cdGNvbnN0IGxvYyA9IHRva2Vucy5sb2Ncblx0c3dpdGNoIChyZXR1cm5LaW5kKSB7XG5cdFx0Y2FzZSBSZXR1cm5zLkJhZzogY2FzZSBSZXR1cm5zLk1hcDoge1xuXHRcdFx0Y29uc3QgY2xzID0gcmV0dXJuS2luZCA9PT0gUmV0dXJucy5CYWcgPyBCbG9ja0JhZyA6IEJsb2NrTWFwXG5cdFx0XHRjb25zdCBibG9jayA9IG5ldyBjbHMobG9jLCBvcENvbW1lbnQsIGxpbmVzKVxuXHRcdFx0Y29uc3QgdmFsID0gbmV3IEJsb2NrV3JhcChsb2MsIGJsb2NrKVxuXHRcdFx0Y29uc3QgYXNzaWduZWUgPSBMb2NhbERlY2xhcmUucGxhaW4obG9jLCBvcHRpb25zLm1vZHVsZU5hbWUoKSlcblx0XHRcdGNvbnN0IGFzc2lnbiA9IG5ldyBBc3NpZ25TaW5nbGUobG9jLCBhc3NpZ25lZSwgdmFsKVxuXHRcdFx0cmV0dXJuIFtuZXcgTW9kdWxlRXhwb3J0RGVmYXVsdChsb2MsIGFzc2lnbildXG5cdFx0fVxuXHRcdGNhc2UgUmV0dXJucy5PYmo6IHtcblx0XHRcdGNvbnN0IG1vZHVsZU5hbWUgPSBvcHRpb25zLm1vZHVsZU5hbWUoKVxuXG5cdFx0XHQvLyBNb2R1bGUgZXhwb3J0cyBsb29rIGxpa2UgYSBCbG9ja09iaiwgIGJ1dCBhcmUgcmVhbGx5IGRpZmZlcmVudC5cblx0XHRcdC8vIEluIEVTNiwgbW9kdWxlIGV4cG9ydHMgbXVzdCBiZSBjb21wbGV0ZWx5IHN0YXRpYy5cblx0XHRcdC8vIFNvIHdlIGtlZXAgYW4gYXJyYXkgb2YgZXhwb3J0cyBhdHRhY2hlZCBkaXJlY3RseSB0byB0aGUgTW9kdWxlIGFzdC5cblx0XHRcdC8vIElmIHlvdSB3cml0ZTpcblx0XHRcdC8vXHRpZiEgY29uZFxuXHRcdFx0Ly9cdFx0YS4gYlxuXHRcdFx0Ly8gaW4gYSBtb2R1bGUgY29udGV4dCwgaXQgd2lsbCBiZSBhbiBlcnJvci4gKFRoZSBtb2R1bGUgY3JlYXRlcyBubyBgYnVpbHRgIGxvY2FsLilcblx0XHRcdGNvbnN0IGNvbnZlcnRUb0V4cG9ydHMgPSBsaW5lID0+IHtcblx0XHRcdFx0aWYgKGxpbmUgaW5zdGFuY2VvZiBPYmpFbnRyeSkge1xuXHRcdFx0XHRcdGNoZWNrKGxpbmUgaW5zdGFuY2VvZiBPYmpFbnRyeUFzc2lnbiwgbGluZS5sb2MsXG5cdFx0XHRcdFx0XHQnTW9kdWxlIGV4cG9ydHMgY2FuIG5vdCBiZSBjb21wdXRlZC4nKVxuXHRcdFx0XHRcdGNoZWNrKGxpbmUuYXNzaWduIGluc3RhbmNlb2YgQXNzaWduU2luZ2xlLCBsaW5lLmxvYyxcblx0XHRcdFx0XHRcdCdFeHBvcnQgQXNzaWduRGVzdHJ1Y3R1cmUgbm90IHlldCBzdXBwb3J0ZWQuJylcblx0XHRcdFx0XHRyZXR1cm4gbGluZS5hc3NpZ24uYXNzaWduZWUubmFtZSA9PT0gbW9kdWxlTmFtZSA/XG5cdFx0XHRcdFx0XHRuZXcgTW9kdWxlRXhwb3J0RGVmYXVsdChsaW5lLmxvYywgbGluZS5hc3NpZ24pIDpcblx0XHRcdFx0XHRcdG5ldyBNb2R1bGVFeHBvcnROYW1lZChsaW5lLmxvYywgbGluZS5hc3NpZ24pXG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gVE9ETzogSWYgUmVnaW9uLCBsaW5lLmxpbmVzID0gbGluZS5saW5lcy5tYXAoY29udmVydFRvRXhwb3J0cylcblx0XHRcdFx0cmV0dXJuIGxpbmVcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGxpbmVzLm1hcChjb252ZXJ0VG9FeHBvcnRzKVxuXHRcdH1cblx0XHRkZWZhdWx0OiB7XG5cdFx0XHRjb25zdCBbbW9kdWxlTGluZXMsIG9wRGVmYXVsdEV4cG9ydF0gPSB0cnlUYWtlTGFzdFZhbChsaW5lcylcblx0XHRcdGlmIChvcERlZmF1bHRFeHBvcnQgIT09IG51bGwpIHtcblx0XHRcdFx0Y29uc3QgXyA9IG9wRGVmYXVsdEV4cG9ydFxuXHRcdFx0XHRtb2R1bGVMaW5lcy5wdXNoKG5ldyBNb2R1bGVFeHBvcnREZWZhdWx0KF8ubG9jLFxuXHRcdFx0XHRcdG5ldyBBc3NpZ25TaW5nbGUoXy5sb2MsXG5cdFx0XHRcdFx0XHRMb2NhbERlY2xhcmUucGxhaW4ob3BEZWZhdWx0RXhwb3J0LmxvYywgb3B0aW9ucy5tb2R1bGVOYW1lKCkpLFxuXHRcdFx0XHRcdFx0XykpKVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG1vZHVsZUxpbmVzXG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIHRyeVRha2VMYXN0VmFsKGxpbmVzKSB7XG5cdHJldHVybiAhaXNFbXB0eShsaW5lcykgJiYgbGFzdChsaW5lcykgaW5zdGFuY2VvZiBWYWwgP1xuXHRcdFtydGFpbChsaW5lcyksIGxhc3QobGluZXMpXSA6XG5cdFx0W2xpbmVzLCBudWxsXVxufVxuXG5mdW5jdGlvbiBwbGFpbkJsb2NrTGluZXMobGluZVRva2Vucykge1xuXHRjb25zdCBsaW5lcyA9IFtdXG5cdGNvbnN0IGFkZExpbmUgPSBsaW5lID0+IHtcblx0XHRpZiAobGluZSBpbnN0YW5jZW9mIEFycmF5KVxuXHRcdFx0Zm9yIChjb25zdCBfIG9mIGxpbmUpXG5cdFx0XHRcdGFkZExpbmUoXylcblx0XHRlbHNlXG5cdFx0XHRsaW5lcy5wdXNoKGxpbmUpXG5cdH1cblx0Zm9yIChjb25zdCBfIG9mIGxpbmVUb2tlbnMuc2xpY2VzKCkpXG5cdFx0YWRkTGluZShwYXJzZUxpbmUoXykpXG5cdHJldHVybiBsaW5lc1xufVxuXG5jb25zdCBSZXR1cm5zID0ge1xuXHRQbGFpbjogMCxcblx0T2JqOiAxLFxuXHRCYWc6IDIsXG5cdE1hcDogM1xufVxuXG5mdW5jdGlvbiBwYXJzZUJsb2NrTGluZXMobGluZVRva2Vucykge1xuXHRcdGxldCBpc0JhZyA9IGZhbHNlLCBpc01hcCA9IGZhbHNlLCBpc09iaiA9IGZhbHNlXG5cdGNvbnN0IGNoZWNrTGluZSA9IGxpbmUgPT4ge1xuXHRcdC8vIFRPRE86IGlmIFJlZ2lvbiwgbG9vcCBvdmVyIGl0cyBsaW5lc1xuXHRcdGlmIChsaW5lIGluc3RhbmNlb2YgQmFnRW50cnkpXG5cdFx0XHRpc0JhZyA9IHRydWVcblx0XHRlbHNlIGlmIChsaW5lIGluc3RhbmNlb2YgTWFwRW50cnkpXG5cdFx0XHRpc01hcCA9IHRydWVcblx0XHRlbHNlIGlmIChsaW5lIGluc3RhbmNlb2YgT2JqRW50cnkpXG5cdFx0XHRpc09iaiA9IHRydWVcblx0fVxuXHRjb25zdCBsaW5lcyA9IHBsYWluQmxvY2tMaW5lcyhsaW5lVG9rZW5zKVxuXHRmb3IgKGNvbnN0IF8gb2YgbGluZXMpXG5cdFx0Y2hlY2tMaW5lKF8pXG5cblx0Y2hlY2soIShpc09iaiAmJiBpc0JhZyksIGxpbmVzLmxvYywgJ0Jsb2NrIGhhcyBib3RoIEJhZyBhbmQgT2JqIGxpbmVzLicpXG5cdGNoZWNrKCEoaXNPYmogJiYgaXNNYXApLCBsaW5lcy5sb2MsICdCbG9jayBoYXMgYm90aCBPYmogYW5kIE1hcCBsaW5lcy4nKVxuXHRjaGVjayghKGlzQmFnICYmIGlzTWFwKSwgbGluZXMubG9jLCAnQmxvY2sgaGFzIGJvdGggQmFnIGFuZCBNYXAgbGluZXMuJylcblxuXHRjb25zdCByZXR1cm5LaW5kID1cblx0XHRpc09iaiA/IFJldHVybnMuT2JqIDogaXNCYWcgPyBSZXR1cm5zLkJhZyA6IGlzTWFwID8gUmV0dXJucy5NYXAgOiBSZXR1cm5zLlBsYWluXG5cdHJldHVybiB7bGluZXMsIHJldHVybktpbmR9XG59XG4iXX0=
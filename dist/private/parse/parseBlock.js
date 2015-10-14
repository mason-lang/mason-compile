if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', '../../CompileError', '../context', '../MsAst', '../Token', '../util', './checks', './parseLine', './tryTakeComment', './Slice'], function (exports, _CompileError, _context, _MsAst, _Token, _util, _checks, _parseLine, _tryTakeComment4, _Slice) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

	var _parseLine2 = _interopRequireDefault(_parseLine);

	var _tryTakeComment5 = _interopRequireDefault(_tryTakeComment4);

	var _Slice2 = _interopRequireDefault(_Slice);

	const
	// Tokens on the line before a block, and tokens for the block itself.
	beforeAndBlock = tokens => {
		(0, _checks.checkNonEmpty)(tokens, 'Expected an indented block.');
		const block = tokens.last();
		(0, _context.check)((0, _Token.isGroup)(_Token.G_Block, block), block.loc, 'Expected an indented block.');
		return [tokens.rtail(), _Slice2.default.group(block)];
	},
	      blockWrap = tokens => new _MsAst.BlockWrap(tokens.loc, parseBlockVal(tokens)),
	      justBlock = (keyword, tokens) => {
		var _beforeAndBlock = beforeAndBlock(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const block = _beforeAndBlock2[1];

		(0, _checks.checkEmpty)(before, () => `Did not expect anything between ${ (0, _CompileError.code)((0, _Token.keywordName)(keyword)) } and block.`);
		return block;
	},
	      justBlockDo = (keyword, tokens) => parseBlockDo(justBlock(keyword, tokens)),
	      justBlockVal = (keyword, tokens) => parseBlockVal(justBlock(keyword, tokens)),
	     

	// Gets lines in a region.
	parseLinesFromBlock = tokens => {
		const h = tokens.head();
		(0, _context.check)(tokens.size() > 1 && tokens.size() === 2 && (0, _Token.isGroup)(_Token.G_Block, tokens.second()), h.loc, () => `Expected indented block after ${ h }, and nothing else.`);
		const block = tokens.second();

		const lines = [];
		for (const line of _Slice2.default.group(block).slices()) lines.push.apply(lines, _toConsumableArray((0, _parseLine.parseLineOrLines)(line)));
		return lines;
	},
	      parseBlockDo = tokens => {
		var _tryTakeComment = (0, _tryTakeComment5.default)(tokens);

		var _tryTakeComment2 = _slicedToArray(_tryTakeComment, 2);

		const opComment = _tryTakeComment2[0];
		const rest = _tryTakeComment2[1];

		const lines = plainBlockLines(rest);
		return new _MsAst.BlockDo(tokens.loc, opComment, lines);
	},
	      parseBlockVal = tokens => {
		var _tryTakeComment3 = (0, _tryTakeComment5.default)(tokens);

		var _tryTakeComment32 = _slicedToArray(_tryTakeComment3, 2);

		const opComment = _tryTakeComment32[0];
		const rest = _tryTakeComment32[1];

		var _parseBlockLines = parseBlockLines(rest);

		const lines = _parseBlockLines.lines;
		const kReturn = _parseBlockLines.kReturn;

		switch (kReturn) {
			case KReturn_Bag:
				return new _MsAst.BlockBag(tokens.loc, opComment, lines);
			case KReturn_Map:
				return new _MsAst.BlockMap(tokens.loc, opComment, lines);
			case KReturn_Obj:
				return new _MsAst.BlockObj(tokens.loc, opComment, lines);
			default:
				{
					(0, _context.check)(!(0, _util.isEmpty)(lines), tokens.loc, 'Value block must end in a value.');
					const val = (0, _util.last)(lines);
					if (val instanceof _MsAst.Throw) return new _MsAst.BlockValThrow(tokens.loc, opComment, (0, _util.rtail)(lines), val);else {
						(0, _context.check)(val instanceof _MsAst.Val, val.loc, 'Value block must end in a value.');
						return new _MsAst.BlockWithReturn(tokens.loc, opComment, (0, _util.rtail)(lines), val);
					}
				}
		}
	},
	      parseModuleBlock = tokens => {
		var _parseBlockLines2 = parseBlockLines(tokens, true);

		const lines = _parseBlockLines2.lines;
		const kReturn = _parseBlockLines2.kReturn;

		const opComment = null;
		const loc = tokens.loc;
		switch (kReturn) {
			case KReturn_Bag:case KReturn_Map:
				{
					const cls = kReturn === KReturn_Bag ? _MsAst.BlockBag : _MsAst.BlockMap;
					const block = new cls(loc, opComment, lines);
					const val = new _MsAst.BlockWrap(loc, block);
					const assignee = _MsAst.LocalDeclare.plain(loc, _context.options.moduleName());
					const assign = new _MsAst.AssignSingle(loc, assignee, val);
					return [new _MsAst.ModuleExportDefault(loc, assign)];
				}
			case KReturn_Obj:
				{
					const moduleName = _context.options.moduleName();

					// Module exports look like a BlockObj,  but are really different.
					// In ES6, module exports must be completely static.
					// So we keep an array of exports attached directly to the Module ast.
					// If you write:
					//	if! cond
					//		a. b
					// in a module context, it will be an error. (The module creates no `built` local.)
					const convertToExports = line => {
						if (line instanceof _MsAst.ObjEntry) {
							(0, _context.check)(line instanceof _MsAst.ObjEntryAssign, line.loc, 'Module exports can not be computed.');
							(0, _context.check)(line.assign instanceof _MsAst.AssignSingle, line.loc, 'Export AssignDestructure not yet supported.');
							return line.assign.assignee.name === moduleName ? new _MsAst.ModuleExportDefault(line.loc, line.assign) : new _MsAst.ModuleExportNamed(line.loc, line.assign);
						}
						// TODO: If Region, line.lines = line.lines.map(convertToExports)
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
	};

	exports.beforeAndBlock = beforeAndBlock;
	exports.blockWrap = blockWrap;
	exports.justBlock = justBlock;
	exports.justBlockDo = justBlockDo;
	exports.justBlockVal = justBlockVal;
	exports.parseLinesFromBlock = parseLinesFromBlock;
	exports.parseBlockDo = parseBlockDo;
	exports.parseBlockVal = parseBlockVal;
	exports.parseModuleBlock = parseModuleBlock;
	const tryTakeLastVal = lines => !(0, _util.isEmpty)(lines) && (0, _util.last)(lines) instanceof _MsAst.Val ? [(0, _util.rtail)(lines), (0, _util.last)(lines)] : [lines, null],
	      plainBlockLines = lineTokens => {
		const lines = [];
		const addLine = line => {
			if (line instanceof Array) for (const _ of line) addLine(_);else lines.push(line);
		};
		for (const _ of lineTokens.slices()) addLine((0, _parseLine2.default)(_));
		return lines;
	},
	      KReturn_Plain = 0,
	      KReturn_Obj = 1,
	      KReturn_Bag = 2,
	      KReturn_Map = 3,
	      parseBlockLines = lineTokens => {
		let isBag = false,
		    isMap = false,
		    isObj = false;
		const checkLine = line => {
			// TODO: if Region, loop over its lines
			if (line instanceof _MsAst.BagEntry) isBag = true;else if (line instanceof _MsAst.MapEntry) isMap = true;else if (line instanceof _MsAst.ObjEntry) isObj = true;
		};
		const lines = plainBlockLines(lineTokens);
		for (const _ of lines) checkLine(_);

		(0, _context.check)(!(isObj && isBag), lines.loc, 'Block has both Bag and Obj lines.');
		(0, _context.check)(!(isObj && isMap), lines.loc, 'Block has both Obj and Map lines.');
		(0, _context.check)(!(isBag && isMap), lines.loc, 'Block has both Bag and Map lines.');

		const kReturn = isObj ? KReturn_Obj : isBag ? KReturn_Bag : isMap ? KReturn_Map : KReturn_Plain;
		return { lines, kReturn };
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlQmxvY2suanMiLCJwcml2YXRlL3BhcnNlL3BhcnNlQmxvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNZTzs7QUFFTixlQUFjLEdBQUcsTUFBTSxJQUFJO0FBQzFCLGNBUmtCLGFBQWEsRUFRakIsTUFBTSxFQUFFLDZCQUE2QixDQUFDLENBQUE7QUFDcEQsUUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQzNCLGVBaEJNLEtBQUssRUFnQkwsV0FaUyxPQUFPLFNBQWhCLE9BQU8sRUFZVSxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLDZCQUE2QixDQUFDLENBQUE7QUFDeEUsU0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsRUFBRSxnQkFBTSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtFQUMzQztPQUVELFNBQVMsR0FBRyxNQUFNLElBQUksV0FsQkwsU0FBUyxDQWtCVSxNQUFNLENBQUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUV0RSxTQUFTLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxLQUFLO3dCQUNSLGNBQWMsQ0FBQyxNQUFNLENBQUM7Ozs7UUFBdkMsTUFBTTtRQUFFLEtBQUs7O0FBQ3BCLGNBbEJNLFVBQVUsRUFrQkwsTUFBTSxFQUFFLE1BQ2xCLENBQUMsZ0NBQWdDLEdBQUUsa0JBMUI5QixJQUFJLEVBMEIrQixXQXJCakIsV0FBVyxFQXFCa0IsT0FBTyxDQUFDLENBQUMsRUFBQyxXQUFXLENBQUMsQ0FBQyxDQUFBO0FBQzVFLFNBQU8sS0FBSyxDQUFBO0VBQ1o7T0FDRCxXQUFXLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxLQUM3QixZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztPQUN6QyxZQUFZLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxLQUM5QixhQUFh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QUFDLENBQUE7QUFDekMsT0FBSyxNQUFNLENBQUMsSUFBSSxLQUFLLEVBQ3BCLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQTs7QUFFYixlQXhLTSxLQUFLLEVBd0tMLEVBQUUsS0FBSyxJQUFJLEtBQUssQ0FBQSxBQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFBO0FBQ3hFLGVBektNLEtBQUssRUF5S0wsRUFBRSxLQUFLLElBQUksS0FBSyxDQUFBLEFBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLG1DQUFtQyxDQUFDLENBQUE7QUFDeEUsZUExS00sS0FBSyxFQTBLTCxFQUFFLEtBQUssSUFBSSxLQUFLLENBQUEsQUFBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsbUNBQW1DLENBQUMsQ0FBQTs7QUFFeEUsUUFBTSxPQUFPLEdBQ1osS0FBSyxHQUFHLFdBQVcsR0FBRyxLQUFLLEdBQUcsV0FBVyxHQUFHLEtBQUssR0FBRyxXQUFXLEdBQUcsYUFBYSxDQUFBO0FBQ2hGLFNBQU8sRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFDLENBQUE7RUFDdkIsQ0FBQSIsImZpbGUiOiJwcml2YXRlL3BhcnNlL3BhcnNlQmxvY2suanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVjaywgb3B0aW9uc30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7QXNzaWduU2luZ2xlLCBCYWdFbnRyeSwgQmxvY2tCYWcsIEJsb2NrRG8sIEJsb2NrT2JqLCBCbG9ja01hcCwgQmxvY2tWYWxUaHJvdyxcblx0QmxvY2tXaXRoUmV0dXJuLCBCbG9ja1dyYXAsIExvY2FsRGVjbGFyZSwgTWFwRW50cnksIE1vZHVsZUV4cG9ydERlZmF1bHQsIE1vZHVsZUV4cG9ydE5hbWVkLFxuXHRPYmpFbnRyeSwgT2JqRW50cnlBc3NpZ24sIFRocm93LCBWYWx9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtHX0Jsb2NrLCBpc0dyb3VwLCBrZXl3b3JkTmFtZX0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2lzRW1wdHksIGxhc3QsIHJ0YWlsfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtjaGVja0VtcHR5LCBjaGVja05vbkVtcHR5fSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCBwYXJzZUxpbmUsIHtwYXJzZUxpbmVPckxpbmVzfSBmcm9tICcuL3BhcnNlTGluZSdcbmltcG9ydCB0cnlUYWtlQ29tbWVudCBmcm9tICcuL3RyeVRha2VDb21tZW50J1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbmV4cG9ydCBjb25zdFxuXHQvLyBUb2tlbnMgb24gdGhlIGxpbmUgYmVmb3JlIGEgYmxvY2ssIGFuZCB0b2tlbnMgZm9yIHRoZSBibG9jayBpdHNlbGYuXG5cdGJlZm9yZUFuZEJsb2NrID0gdG9rZW5zID0+IHtcblx0XHRjaGVja05vbkVtcHR5KHRva2VucywgJ0V4cGVjdGVkIGFuIGluZGVudGVkIGJsb2NrLicpXG5cdFx0Y29uc3QgYmxvY2sgPSB0b2tlbnMubGFzdCgpXG5cdFx0Y2hlY2soaXNHcm91cChHX0Jsb2NrLCBibG9jayksIGJsb2NrLmxvYywgJ0V4cGVjdGVkIGFuIGluZGVudGVkIGJsb2NrLicpXG5cdFx0cmV0dXJuIFt0b2tlbnMucnRhaWwoKSwgU2xpY2UuZ3JvdXAoYmxvY2spXVxuXHR9LFxuXG5cdGJsb2NrV3JhcCA9IHRva2VucyA9PiBuZXcgQmxvY2tXcmFwKHRva2Vucy5sb2MsIHBhcnNlQmxvY2tWYWwodG9rZW5zKSksXG5cblx0anVzdEJsb2NrID0gKGtleXdvcmQsIHRva2VucykgPT4ge1xuXHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0XHRjaGVja0VtcHR5KGJlZm9yZSwgKCkgPT5cblx0XHRcdGBEaWQgbm90IGV4cGVjdCBhbnl0aGluZyBiZXR3ZWVuICR7Y29kZShrZXl3b3JkTmFtZShrZXl3b3JkKSl9IGFuZCBibG9jay5gKVxuXHRcdHJldHVybiBibG9ja1xuXHR9LFxuXHRqdXN0QmxvY2tEbyA9IChrZXl3b3JkLCB0b2tlbnMpID0+XG5cdFx0cGFyc2VCbG9ja0RvKGp1c3RCbG9jayhrZXl3b3JkLCB0b2tlbnMpKSxcblx0anVzdEJsb2NrVmFsID0gKGtleXdvcmQsIHRva2VucykgPT5cblx0XHRwYXJzZUJsb2NrVmFsKGp1c3RCbG9jayhrZXl3b3JkLCB0b2tlbnMpKSxcblxuXHQvLyBHZXRzIGxpbmVzIGluIGEgcmVnaW9uLlxuXHRwYXJzZUxpbmVzRnJvbUJsb2NrID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXHRcdGNoZWNrKHRva2Vucy5zaXplKCkgPiAxICYmIHRva2Vucy5zaXplKCkgPT09IDIgJiYgaXNHcm91cChHX0Jsb2NrLCB0b2tlbnMuc2Vjb25kKCkpLFxuXHRcdFx0aC5sb2MsICgpID0+XG5cdFx0XHRgRXhwZWN0ZWQgaW5kZW50ZWQgYmxvY2sgYWZ0ZXIgJHtofSwgYW5kIG5vdGhpbmcgZWxzZS5gKVxuXHRcdGNvbnN0IGJsb2NrID0gdG9rZW5zLnNlY29uZCgpXG5cblx0XHRjb25zdCBsaW5lcyA9IFtdXG5cdFx0Zm9yIChjb25zdCBsaW5lIG9mIFNsaWNlLmdyb3VwKGJsb2NrKS5zbGljZXMoKSlcblx0XHRcdGxpbmVzLnB1c2goLi4ucGFyc2VMaW5lT3JMaW5lcyhsaW5lKSlcblx0XHRyZXR1cm4gbGluZXNcblx0fSxcblxuXHRwYXJzZUJsb2NrRG8gPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IFtvcENvbW1lbnQsIHJlc3RdID0gdHJ5VGFrZUNvbW1lbnQodG9rZW5zKVxuXHRcdGNvbnN0IGxpbmVzID0gcGxhaW5CbG9ja0xpbmVzKHJlc3QpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja0RvKHRva2Vucy5sb2MsIG9wQ29tbWVudCwgbGluZXMpXG5cdH0sXG5cblx0cGFyc2VCbG9ja1ZhbCA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgW29wQ29tbWVudCwgcmVzdF0gPSB0cnlUYWtlQ29tbWVudCh0b2tlbnMpXG5cdFx0Y29uc3Qge2xpbmVzLCBrUmV0dXJufSA9IHBhcnNlQmxvY2tMaW5lcyhyZXN0KVxuXHRcdHN3aXRjaCAoa1JldHVybikge1xuXHRcdFx0Y2FzZSBLUmV0dXJuX0JhZzpcblx0XHRcdFx0cmV0dXJuIG5ldyBCbG9ja0JhZyh0b2tlbnMubG9jLCBvcENvbW1lbnQsIGxpbmVzKVxuXHRcdFx0Y2FzZSBLUmV0dXJuX01hcDpcblx0XHRcdFx0cmV0dXJuIG5ldyBCbG9ja01hcCh0b2tlbnMubG9jLCBvcENvbW1lbnQsIGxpbmVzKVxuXHRcdFx0Y2FzZSBLUmV0dXJuX09iajpcblx0XHRcdFx0cmV0dXJuIG5ldyBCbG9ja09iaih0b2tlbnMubG9jLCBvcENvbW1lbnQsIGxpbmVzKVxuXHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHRjaGVjayghaXNFbXB0eShsaW5lcyksIHRva2Vucy5sb2MsICdWYWx1ZSBibG9jayBtdXN0IGVuZCBpbiBhIHZhbHVlLicpXG5cdFx0XHRcdGNvbnN0IHZhbCA9IGxhc3QobGluZXMpXG5cdFx0XHRcdGlmICh2YWwgaW5zdGFuY2VvZiBUaHJvdylcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEJsb2NrVmFsVGhyb3codG9rZW5zLmxvYywgb3BDb21tZW50LCBydGFpbChsaW5lcyksIHZhbClcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y2hlY2sodmFsIGluc3RhbmNlb2YgVmFsLCB2YWwubG9jLCAnVmFsdWUgYmxvY2sgbXVzdCBlbmQgaW4gYSB2YWx1ZS4nKVxuXHRcdFx0XHRcdHJldHVybiBuZXcgQmxvY2tXaXRoUmV0dXJuKHRva2Vucy5sb2MsIG9wQ29tbWVudCwgcnRhaWwobGluZXMpLCB2YWwpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0cGFyc2VNb2R1bGVCbG9jayA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3Qge2xpbmVzLCBrUmV0dXJufSA9IHBhcnNlQmxvY2tMaW5lcyh0b2tlbnMsIHRydWUpXG5cdFx0Y29uc3Qgb3BDb21tZW50ID0gbnVsbFxuXHRcdGNvbnN0IGxvYyA9IHRva2Vucy5sb2Ncblx0XHRzd2l0Y2ggKGtSZXR1cm4pIHtcblx0XHRcdGNhc2UgS1JldHVybl9CYWc6IGNhc2UgS1JldHVybl9NYXA6IHtcblx0XHRcdFx0Y29uc3QgY2xzID0ga1JldHVybiA9PT0gS1JldHVybl9CYWcgPyBCbG9ja0JhZyA6IEJsb2NrTWFwXG5cdFx0XHRcdGNvbnN0IGJsb2NrID0gbmV3IGNscyhsb2MsIG9wQ29tbWVudCwgbGluZXMpXG5cdFx0XHRcdGNvbnN0IHZhbCA9IG5ldyBCbG9ja1dyYXAobG9jLCBibG9jaylcblx0XHRcdFx0Y29uc3QgYXNzaWduZWUgPSBMb2NhbERlY2xhcmUucGxhaW4obG9jLCBvcHRpb25zLm1vZHVsZU5hbWUoKSlcblx0XHRcdFx0Y29uc3QgYXNzaWduID0gbmV3IEFzc2lnblNpbmdsZShsb2MsIGFzc2lnbmVlLCB2YWwpXG5cdFx0XHRcdHJldHVybiBbbmV3IE1vZHVsZUV4cG9ydERlZmF1bHQobG9jLCBhc3NpZ24pXVxuXHRcdFx0fVxuXHRcdFx0Y2FzZSBLUmV0dXJuX09iajoge1xuXHRcdFx0XHRjb25zdCBtb2R1bGVOYW1lID0gb3B0aW9ucy5tb2R1bGVOYW1lKClcblxuXHRcdFx0XHQvLyBNb2R1bGUgZXhwb3J0cyBsb29rIGxpa2UgYSBCbG9ja09iaiwgIGJ1dCBhcmUgcmVhbGx5IGRpZmZlcmVudC5cblx0XHRcdFx0Ly8gSW4gRVM2LCBtb2R1bGUgZXhwb3J0cyBtdXN0IGJlIGNvbXBsZXRlbHkgc3RhdGljLlxuXHRcdFx0XHQvLyBTbyB3ZSBrZWVwIGFuIGFycmF5IG9mIGV4cG9ydHMgYXR0YWNoZWQgZGlyZWN0bHkgdG8gdGhlIE1vZHVsZSBhc3QuXG5cdFx0XHRcdC8vIElmIHlvdSB3cml0ZTpcblx0XHRcdFx0Ly9cdGlmISBjb25kXG5cdFx0XHRcdC8vXHRcdGEuIGJcblx0XHRcdFx0Ly8gaW4gYSBtb2R1bGUgY29udGV4dCwgaXQgd2lsbCBiZSBhbiBlcnJvci4gKFRoZSBtb2R1bGUgY3JlYXRlcyBubyBgYnVpbHRgIGxvY2FsLilcblx0XHRcdFx0Y29uc3QgY29udmVydFRvRXhwb3J0cyA9IGxpbmUgPT4ge1xuXHRcdFx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgT2JqRW50cnkpIHtcblx0XHRcdFx0XHRcdGNoZWNrKGxpbmUgaW5zdGFuY2VvZiBPYmpFbnRyeUFzc2lnbiwgbGluZS5sb2MsXG5cdFx0XHRcdFx0XHRcdCdNb2R1bGUgZXhwb3J0cyBjYW4gbm90IGJlIGNvbXB1dGVkLicpXG5cdFx0XHRcdFx0XHRjaGVjayhsaW5lLmFzc2lnbiBpbnN0YW5jZW9mIEFzc2lnblNpbmdsZSwgbGluZS5sb2MsXG5cdFx0XHRcdFx0XHRcdCdFeHBvcnQgQXNzaWduRGVzdHJ1Y3R1cmUgbm90IHlldCBzdXBwb3J0ZWQuJylcblx0XHRcdFx0XHRcdHJldHVybiBsaW5lLmFzc2lnbi5hc3NpZ25lZS5uYW1lID09PSBtb2R1bGVOYW1lID9cblx0XHRcdFx0XHRcdFx0bmV3IE1vZHVsZUV4cG9ydERlZmF1bHQobGluZS5sb2MsIGxpbmUuYXNzaWduKSA6XG5cdFx0XHRcdFx0XHRcdG5ldyBNb2R1bGVFeHBvcnROYW1lZChsaW5lLmxvYywgbGluZS5hc3NpZ24pXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIFRPRE86IElmIFJlZ2lvbiwgbGluZS5saW5lcyA9IGxpbmUubGluZXMubWFwKGNvbnZlcnRUb0V4cG9ydHMpXG5cdFx0XHRcdFx0cmV0dXJuIGxpbmVcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBsaW5lcy5tYXAoY29udmVydFRvRXhwb3J0cylcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0Y29uc3QgW21vZHVsZUxpbmVzLCBvcERlZmF1bHRFeHBvcnRdID0gdHJ5VGFrZUxhc3RWYWwobGluZXMpXG5cdFx0XHRcdGlmIChvcERlZmF1bHRFeHBvcnQgIT09IG51bGwpIHtcblx0XHRcdFx0XHRjb25zdCBfID0gb3BEZWZhdWx0RXhwb3J0XG5cdFx0XHRcdFx0bW9kdWxlTGluZXMucHVzaChuZXcgTW9kdWxlRXhwb3J0RGVmYXVsdChfLmxvYyxcblx0XHRcdFx0XHRcdG5ldyBBc3NpZ25TaW5nbGUoXy5sb2MsXG5cdFx0XHRcdFx0XHRcdExvY2FsRGVjbGFyZS5wbGFpbihvcERlZmF1bHRFeHBvcnQubG9jLCBvcHRpb25zLm1vZHVsZU5hbWUoKSksXG5cdFx0XHRcdFx0XHRcdF8pKSlcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gbW9kdWxlTGluZXNcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuY29uc3Rcblx0dHJ5VGFrZUxhc3RWYWwgPSBsaW5lcyA9PlxuXHRcdCFpc0VtcHR5KGxpbmVzKSAmJiBsYXN0KGxpbmVzKSBpbnN0YW5jZW9mIFZhbCA/XG5cdFx0XHRbcnRhaWwobGluZXMpLCBsYXN0KGxpbmVzKV0gOlxuXHRcdFx0W2xpbmVzLCBudWxsXSxcblxuXHRwbGFpbkJsb2NrTGluZXMgPSBsaW5lVG9rZW5zID0+IHtcblx0XHRjb25zdCBsaW5lcyA9IFtdXG5cdFx0Y29uc3QgYWRkTGluZSA9IGxpbmUgPT4ge1xuXHRcdFx0aWYgKGxpbmUgaW5zdGFuY2VvZiBBcnJheSlcblx0XHRcdFx0Zm9yIChjb25zdCBfIG9mIGxpbmUpXG5cdFx0XHRcdFx0YWRkTGluZShfKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRsaW5lcy5wdXNoKGxpbmUpXG5cdFx0fVxuXHRcdGZvciAoY29uc3QgXyBvZiBsaW5lVG9rZW5zLnNsaWNlcygpKVxuXHRcdFx0YWRkTGluZShwYXJzZUxpbmUoXykpXG5cdFx0cmV0dXJuIGxpbmVzXG5cdH0sXG5cblx0S1JldHVybl9QbGFpbiA9IDAsXG5cdEtSZXR1cm5fT2JqID0gMSxcblx0S1JldHVybl9CYWcgPSAyLFxuXHRLUmV0dXJuX01hcCA9IDMsXG5cdHBhcnNlQmxvY2tMaW5lcyA9IGxpbmVUb2tlbnMgPT4ge1xuXHRcdGxldCBpc0JhZyA9IGZhbHNlLCBpc01hcCA9IGZhbHNlLCBpc09iaiA9IGZhbHNlXG5cdFx0Y29uc3QgY2hlY2tMaW5lID0gbGluZSA9PiB7XG5cdFx0XHQvLyBUT0RPOiBpZiBSZWdpb24sIGxvb3Agb3ZlciBpdHMgbGluZXNcblx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgQmFnRW50cnkpXG5cdFx0XHRcdGlzQmFnID0gdHJ1ZVxuXHRcdFx0ZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIE1hcEVudHJ5KVxuXHRcdFx0XHRpc01hcCA9IHRydWVcblx0XHRcdGVsc2UgaWYgKGxpbmUgaW5zdGFuY2VvZiBPYmpFbnRyeSlcblx0XHRcdFx0aXNPYmogPSB0cnVlXG5cdFx0fVxuXHRcdGNvbnN0IGxpbmVzID0gcGxhaW5CbG9ja0xpbmVzKGxpbmVUb2tlbnMpXG5cdFx0Zm9yIChjb25zdCBfIG9mIGxpbmVzKVxuXHRcdFx0Y2hlY2tMaW5lKF8pXG5cblx0XHRjaGVjayghKGlzT2JqICYmIGlzQmFnKSwgbGluZXMubG9jLCAnQmxvY2sgaGFzIGJvdGggQmFnIGFuZCBPYmogbGluZXMuJylcblx0XHRjaGVjayghKGlzT2JqICYmIGlzTWFwKSwgbGluZXMubG9jLCAnQmxvY2sgaGFzIGJvdGggT2JqIGFuZCBNYXAgbGluZXMuJylcblx0XHRjaGVjayghKGlzQmFnICYmIGlzTWFwKSwgbGluZXMubG9jLCAnQmxvY2sgaGFzIGJvdGggQmFnIGFuZCBNYXAgbGluZXMuJylcblxuXHRcdGNvbnN0IGtSZXR1cm4gPVxuXHRcdFx0aXNPYmogPyBLUmV0dXJuX09iaiA6IGlzQmFnID8gS1JldHVybl9CYWcgOiBpc01hcCA/IEtSZXR1cm5fTWFwIDogS1JldHVybl9QbGFpblxuXHRcdHJldHVybiB7bGluZXMsIGtSZXR1cm59XG5cdH1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

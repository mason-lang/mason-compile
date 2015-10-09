if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', '../../CompileError', '../MsAst', '../Token', '../util', './context', './parseLine', './tryTakeComment', './Slice'], function (exports, _CompileError, _MsAst, _Token, _util, _context, _parseLine, _tryTakeComment4, _Slice) {
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
		(0, _context.checkNonEmpty)(tokens, 'Expected an indented block.');
		const block = tokens.last();
		_context.context.check((0, _Token.isGroup)(_Token.G_Block, block), block.loc, 'Expected an indented block.');
		return [tokens.rtail(), _Slice2.default.group(block)];
	},
	      blockWrap = tokens => new _MsAst.BlockWrap(tokens.loc, parseBlockVal(tokens)),
	      justBlock = (keyword, tokens) => {
		var _beforeAndBlock = beforeAndBlock(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const block = _beforeAndBlock2[1];

		(0, _context.checkEmpty)(before, () => `Did not expect anything between ${ (0, _CompileError.code)((0, _Token.keywordName)(keyword)) } and block.`);
		return block;
	},
	      justBlockDo = (keyword, tokens) => parseBlockDo(justBlock(keyword, tokens)),
	      justBlockVal = (keyword, tokens) => parseBlockVal(justBlock(keyword, tokens)),
	     

	// Gets lines in a region.
	parseLinesFromBlock = tokens => {
		const h = tokens.head();
		_context.context.check(tokens.size() > 1 && tokens.size() === 2 && (0, _Token.isGroup)(_Token.G_Block, tokens.second()), h.loc, () => `Expected indented block after ${ h }, and nothing else.`);
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
				var _tryTakeLastVal = tryTakeLastVal(lines),
				    _tryTakeLastVal2 = _slicedToArray(_tryTakeLastVal, 2),
				    doLines = _tryTakeLastVal2[0],
				    opVal = _tryTakeLastVal2[1];

				// opName written to by _tryAddName.
				return new _MsAst.BlockObj(tokens.loc, opComment, doLines, opVal, null);
			default:
				{
					_context.context.check(!(0, _util.isEmpty)(lines), tokens.loc, 'Value block must end in a value.');
					const val = (0, _util.last)(lines);
					if (val instanceof _MsAst.Throw) return new _MsAst.BlockValThrow(tokens.loc, opComment, (0, _util.rtail)(lines), val);else {
						_context.context.check(val instanceof _MsAst.Val, val.loc, 'Value block must end in a value.');
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
					const assignee = _MsAst.LocalDeclare.plain(loc, _context.context.opts.moduleName());
					const assign = new _MsAst.AssignSingle(loc, assignee, val);
					return [new _MsAst.ModuleExportDefault(loc, assign)];
				}
			case KReturn_Obj:
				{
					const moduleName = _context.context.opts.moduleName();

					// Module exports look like a BlockObj,  but are really different.
					// In ES6, module exports must be completely static.
					// So we keep an array of exports attached directly to the Module ast.
					// If you write:
					//	if! cond
					//		a. b
					// in a module context, it will be an error. (The module creates no `built` local.)
					const convertToExports = line => {
						if (line instanceof _MsAst.ObjEntry) {
							_context.context.check(line instanceof _MsAst.ObjEntryAssign, line.loc, 'Module exports can not be computed.');
							_context.context.check(line.assign instanceof _MsAst.AssignSingle, line.loc, 'Export AssignDestructure not yet supported.');
							return line.assign.assignee.name === moduleName ? new _MsAst.ModuleExportDefault(line.loc, line.assign) : new _MsAst.ModuleExportNamed(line.loc, line.assign);
						}
						// TODO: If Region, line.lines = line.lines.map(convertToExports)
						return line;
					};

					return lines.map(convertToExports);
				}
			default:
				{
					var _tryTakeLastVal3 = tryTakeLastVal(lines);

					var _tryTakeLastVal32 = _slicedToArray(_tryTakeLastVal3, 2);

					const moduleLines = _tryTakeLastVal32[0];
					const opDefaultExport = _tryTakeLastVal32[1];

					if (opDefaultExport !== null) {
						const _ = opDefaultExport;
						moduleLines.push(new _MsAst.ModuleExportDefault(_.loc, new _MsAst.AssignSingle(_.loc, _MsAst.LocalDeclare.plain(opDefaultExport.loc, _context.context.opts.moduleName()), _)));
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

		_context.context.check(!(isObj && isBag), lines.loc, 'Block has both Bag and Obj lines.');
		_context.context.check(!(isObj && isMap), lines.loc, 'Block has both Obj and Map lines.');
		_context.context.check(!(isBag && isMap), lines.loc, 'Block has both Bag and Map lines.');

		const kReturn = isObj ? KReturn_Obj : isBag ? KReturn_Bag : isMap ? KReturn_Map : KReturn_Plain;
		return { lines, kReturn };
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlQmxvY2suanMiLCJwcml2YXRlL3BhcnNlL3BhcnNlQmxvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNXTzs7QUFFTixlQUFjLEdBQUcsTUFBTSxJQUFJO0FBQzFCLGVBUmtCLGFBQWEsRUFRakIsTUFBTSxFQUFFLDZCQUE2QixDQUFDLENBQUE7QUFDcEQsUUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQzNCLFdBVmlDLE9BQU8sQ0FVaEMsS0FBSyxDQUFDLFdBWkMsT0FBTyxTQUFoQixPQUFPLEVBWWtCLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsNkJBQTZCLENBQUMsQ0FBQTtBQUNoRixTQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLGdCQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0VBQzNDO09BRUQsU0FBUyxHQUFHLE1BQU0sSUFBSSxXQWxCTCxTQUFTLENBa0JVLE1BQU0sQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BRXRFLFNBQVMsR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFNLEtBQUs7d0JBQ1IsY0FBYyxDQUFDLE1BQU0sQ0FBQzs7OztRQUF2QyxNQUFNO1FBQUUsS0FBSzs7QUFDcEIsZUFsQk0sVUFBVSxFQWtCTCxNQUFNLEVBQUUsTUFDbEIsQ0FBQyxnQ0FBZ0MsR0FBRSxrQkF6QjlCLElBQUksRUF5QitCLFdBckJqQixXQUFXLEVBcUJrQixPQUFPLENBQUMsQ0FBQyxFQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUE7QUFDNUUsU0FBTyxLQUFLLENBQUE7RUFDWjtPQUNELFdBQVcsR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFNLEtBQzdCLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO09BQ3pDLFlBQVksR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFN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S0FDUixJQUFJLElBQUksbUJBL0oyQixRQUFRLEFBK0pmLEVBQ2hDLEtBQUssR0FBRyxJQUFJLENBQUEsS0FDUixJQUFJLElBQUksbUJBaEtmLFFBQVEsQUFnSzJCLEVBQ2hDLEtBQUssR0FBRyxJQUFJLENBQUE7R0FDYixDQUFBO0FBQ0QsUUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQ3pDLE9BQUssTUFBTSxDQUFDLElBQUksS0FBSyxFQUNwQixTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7O0FBRWIsV0FwS2lDLE9BQU8sQ0FvS2hDLEtBQUssQ0FBQyxFQUFFLEtBQUssSUFBSSxLQUFLLENBQUEsQUFBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsbUNBQW1DLENBQUMsQ0FBQTtBQUNoRixXQXJLaUMsT0FBTyxDQXFLaEMsS0FBSyxDQUFDLEVBQUUsS0FBSyxJQUFJLEtBQUssQ0FBQSxBQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFBO0FBQ2hGLFdBdEtpQyxPQUFPLENBc0toQyxLQUFLLENBQUMsRUFBRSxLQUFLLElBQUksS0FBSyxDQUFBLEFBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLG1DQUFtQyxDQUFDLENBQUE7O0FBRWhGLFFBQU0sT0FBTyxHQUNaLEtBQUssR0FBRyxXQUFXLEdBQUcsS0FBSyxHQUFHLFdBQVcsR0FBRyxLQUFLLEdBQUcsV0FBVyxHQUFHLGFBQWEsQ0FBQTtBQUNoRixTQUFPLEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBQyxDQUFBO0VBQ3ZCLENBQUEiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9wYXJzZUJsb2NrLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7QXNzaWduU2luZ2xlLCBCYWdFbnRyeSwgQmxvY2tCYWcsIEJsb2NrRG8sIEJsb2NrT2JqLCBCbG9ja01hcCwgQmxvY2tWYWxUaHJvdyxcblx0QmxvY2tXaXRoUmV0dXJuLCBCbG9ja1dyYXAsIExvY2FsRGVjbGFyZSwgTWFwRW50cnksIE1vZHVsZUV4cG9ydERlZmF1bHQsIE1vZHVsZUV4cG9ydE5hbWVkLFxuXHRPYmpFbnRyeSwgT2JqRW50cnlBc3NpZ24sIFRocm93LCBWYWx9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtHX0Jsb2NrLCBpc0dyb3VwLCBrZXl3b3JkTmFtZX0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2lzRW1wdHksIGxhc3QsIHJ0YWlsfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtjaGVja0VtcHR5LCBjaGVja05vbkVtcHR5LCBjb250ZXh0fSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQgcGFyc2VMaW5lLCB7cGFyc2VMaW5lT3JMaW5lc30gZnJvbSAnLi9wYXJzZUxpbmUnXG5pbXBvcnQgdHJ5VGFrZUNvbW1lbnQgZnJvbSAnLi90cnlUYWtlQ29tbWVudCdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG5leHBvcnQgY29uc3Rcblx0Ly8gVG9rZW5zIG9uIHRoZSBsaW5lIGJlZm9yZSBhIGJsb2NrLCBhbmQgdG9rZW5zIGZvciB0aGUgYmxvY2sgaXRzZWxmLlxuXHRiZWZvcmVBbmRCbG9jayA9IHRva2VucyA9PiB7XG5cdFx0Y2hlY2tOb25FbXB0eSh0b2tlbnMsICdFeHBlY3RlZCBhbiBpbmRlbnRlZCBibG9jay4nKVxuXHRcdGNvbnN0IGJsb2NrID0gdG9rZW5zLmxhc3QoKVxuXHRcdGNvbnRleHQuY2hlY2soaXNHcm91cChHX0Jsb2NrLCBibG9jayksIGJsb2NrLmxvYywgJ0V4cGVjdGVkIGFuIGluZGVudGVkIGJsb2NrLicpXG5cdFx0cmV0dXJuIFt0b2tlbnMucnRhaWwoKSwgU2xpY2UuZ3JvdXAoYmxvY2spXVxuXHR9LFxuXG5cdGJsb2NrV3JhcCA9IHRva2VucyA9PiBuZXcgQmxvY2tXcmFwKHRva2Vucy5sb2MsIHBhcnNlQmxvY2tWYWwodG9rZW5zKSksXG5cblx0anVzdEJsb2NrID0gKGtleXdvcmQsIHRva2VucykgPT4ge1xuXHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0XHRjaGVja0VtcHR5KGJlZm9yZSwgKCkgPT5cblx0XHRcdGBEaWQgbm90IGV4cGVjdCBhbnl0aGluZyBiZXR3ZWVuICR7Y29kZShrZXl3b3JkTmFtZShrZXl3b3JkKSl9IGFuZCBibG9jay5gKVxuXHRcdHJldHVybiBibG9ja1xuXHR9LFxuXHRqdXN0QmxvY2tEbyA9IChrZXl3b3JkLCB0b2tlbnMpID0+XG5cdFx0cGFyc2VCbG9ja0RvKGp1c3RCbG9jayhrZXl3b3JkLCB0b2tlbnMpKSxcblx0anVzdEJsb2NrVmFsID0gKGtleXdvcmQsIHRva2VucykgPT5cblx0XHRwYXJzZUJsb2NrVmFsKGp1c3RCbG9jayhrZXl3b3JkLCB0b2tlbnMpKSxcblxuXHQvLyBHZXRzIGxpbmVzIGluIGEgcmVnaW9uLlxuXHRwYXJzZUxpbmVzRnJvbUJsb2NrID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXHRcdGNvbnRleHQuY2hlY2sodG9rZW5zLnNpemUoKSA+IDEgJiYgdG9rZW5zLnNpemUoKSA9PT0gMiAmJiBpc0dyb3VwKEdfQmxvY2ssIHRva2Vucy5zZWNvbmQoKSksXG5cdFx0XHRoLmxvYywgKCkgPT5cblx0XHRcdGBFeHBlY3RlZCBpbmRlbnRlZCBibG9jayBhZnRlciAke2h9LCBhbmQgbm90aGluZyBlbHNlLmApXG5cdFx0Y29uc3QgYmxvY2sgPSB0b2tlbnMuc2Vjb25kKClcblxuXHRcdGNvbnN0IGxpbmVzID0gW11cblx0XHRmb3IgKGNvbnN0IGxpbmUgb2YgU2xpY2UuZ3JvdXAoYmxvY2spLnNsaWNlcygpKVxuXHRcdFx0bGluZXMucHVzaCguLi5wYXJzZUxpbmVPckxpbmVzKGxpbmUpKVxuXHRcdHJldHVybiBsaW5lc1xuXHR9LFxuXG5cdHBhcnNlQmxvY2tEbyA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgW29wQ29tbWVudCwgcmVzdF0gPSB0cnlUYWtlQ29tbWVudCh0b2tlbnMpXG5cdFx0Y29uc3QgbGluZXMgPSBwbGFpbkJsb2NrTGluZXMocmVzdClcblx0XHRyZXR1cm4gbmV3IEJsb2NrRG8odG9rZW5zLmxvYywgb3BDb21tZW50LCBsaW5lcylcblx0fSxcblxuXHRwYXJzZUJsb2NrVmFsID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBbb3BDb21tZW50LCByZXN0XSA9IHRyeVRha2VDb21tZW50KHRva2Vucylcblx0XHRjb25zdCB7bGluZXMsIGtSZXR1cm59ID0gcGFyc2VCbG9ja0xpbmVzKHJlc3QpXG5cdFx0c3dpdGNoIChrUmV0dXJuKSB7XG5cdFx0XHRjYXNlIEtSZXR1cm5fQmFnOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEJsb2NrQmFnKHRva2Vucy5sb2MsIG9wQ29tbWVudCwgbGluZXMpXG5cdFx0XHRjYXNlIEtSZXR1cm5fTWFwOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEJsb2NrTWFwKHRva2Vucy5sb2MsIG9wQ29tbWVudCwgbGluZXMpXG5cdFx0XHRjYXNlIEtSZXR1cm5fT2JqOlxuXHRcdFx0XHRjb25zdCBbZG9MaW5lcywgb3BWYWxdID0gdHJ5VGFrZUxhc3RWYWwobGluZXMpXG5cdFx0XHRcdC8vIG9wTmFtZSB3cml0dGVuIHRvIGJ5IF90cnlBZGROYW1lLlxuXHRcdFx0XHRyZXR1cm4gbmV3IEJsb2NrT2JqKHRva2Vucy5sb2MsIG9wQ29tbWVudCwgZG9MaW5lcywgb3BWYWwsIG51bGwpXG5cdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdGNvbnRleHQuY2hlY2soIWlzRW1wdHkobGluZXMpLCB0b2tlbnMubG9jLCAnVmFsdWUgYmxvY2sgbXVzdCBlbmQgaW4gYSB2YWx1ZS4nKVxuXHRcdFx0XHRjb25zdCB2YWwgPSBsYXN0KGxpbmVzKVxuXHRcdFx0XHRpZiAodmFsIGluc3RhbmNlb2YgVGhyb3cpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBCbG9ja1ZhbFRocm93KHRva2Vucy5sb2MsIG9wQ29tbWVudCwgcnRhaWwobGluZXMpLCB2YWwpXG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2sodmFsIGluc3RhbmNlb2YgVmFsLCB2YWwubG9jLCAnVmFsdWUgYmxvY2sgbXVzdCBlbmQgaW4gYSB2YWx1ZS4nKVxuXHRcdFx0XHRcdHJldHVybiBuZXcgQmxvY2tXaXRoUmV0dXJuKHRva2Vucy5sb2MsIG9wQ29tbWVudCwgcnRhaWwobGluZXMpLCB2YWwpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0cGFyc2VNb2R1bGVCbG9jayA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3Qge2xpbmVzLCBrUmV0dXJufSA9IHBhcnNlQmxvY2tMaW5lcyh0b2tlbnMsIHRydWUpXG5cdFx0Y29uc3Qgb3BDb21tZW50ID0gbnVsbFxuXHRcdGNvbnN0IGxvYyA9IHRva2Vucy5sb2Ncblx0XHRzd2l0Y2ggKGtSZXR1cm4pIHtcblx0XHRcdGNhc2UgS1JldHVybl9CYWc6IGNhc2UgS1JldHVybl9NYXA6IHtcblx0XHRcdFx0Y29uc3QgY2xzID0ga1JldHVybiA9PT0gS1JldHVybl9CYWcgPyBCbG9ja0JhZyA6IEJsb2NrTWFwXG5cdFx0XHRcdGNvbnN0IGJsb2NrID0gbmV3IGNscyhsb2MsIG9wQ29tbWVudCwgbGluZXMpXG5cdFx0XHRcdGNvbnN0IHZhbCA9IG5ldyBCbG9ja1dyYXAobG9jLCBibG9jaylcblx0XHRcdFx0Y29uc3QgYXNzaWduZWUgPSBMb2NhbERlY2xhcmUucGxhaW4obG9jLCBjb250ZXh0Lm9wdHMubW9kdWxlTmFtZSgpKVxuXHRcdFx0XHRjb25zdCBhc3NpZ24gPSBuZXcgQXNzaWduU2luZ2xlKGxvYywgYXNzaWduZWUsIHZhbClcblx0XHRcdFx0cmV0dXJuIFtuZXcgTW9kdWxlRXhwb3J0RGVmYXVsdChsb2MsIGFzc2lnbildXG5cdFx0XHR9XG5cdFx0XHRjYXNlIEtSZXR1cm5fT2JqOiB7XG5cdFx0XHRcdGNvbnN0IG1vZHVsZU5hbWUgPSBjb250ZXh0Lm9wdHMubW9kdWxlTmFtZSgpXG5cblx0XHRcdFx0Ly8gTW9kdWxlIGV4cG9ydHMgbG9vayBsaWtlIGEgQmxvY2tPYmosICBidXQgYXJlIHJlYWxseSBkaWZmZXJlbnQuXG5cdFx0XHRcdC8vIEluIEVTNiwgbW9kdWxlIGV4cG9ydHMgbXVzdCBiZSBjb21wbGV0ZWx5IHN0YXRpYy5cblx0XHRcdFx0Ly8gU28gd2Uga2VlcCBhbiBhcnJheSBvZiBleHBvcnRzIGF0dGFjaGVkIGRpcmVjdGx5IHRvIHRoZSBNb2R1bGUgYXN0LlxuXHRcdFx0XHQvLyBJZiB5b3Ugd3JpdGU6XG5cdFx0XHRcdC8vXHRpZiEgY29uZFxuXHRcdFx0XHQvL1x0XHRhLiBiXG5cdFx0XHRcdC8vIGluIGEgbW9kdWxlIGNvbnRleHQsIGl0IHdpbGwgYmUgYW4gZXJyb3IuIChUaGUgbW9kdWxlIGNyZWF0ZXMgbm8gYGJ1aWx0YCBsb2NhbC4pXG5cdFx0XHRcdGNvbnN0IGNvbnZlcnRUb0V4cG9ydHMgPSBsaW5lID0+IHtcblx0XHRcdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIE9iakVudHJ5KSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKGxpbmUgaW5zdGFuY2VvZiBPYmpFbnRyeUFzc2lnbiwgbGluZS5sb2MsXG5cdFx0XHRcdFx0XHRcdCdNb2R1bGUgZXhwb3J0cyBjYW4gbm90IGJlIGNvbXB1dGVkLicpXG5cdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKGxpbmUuYXNzaWduIGluc3RhbmNlb2YgQXNzaWduU2luZ2xlLCBsaW5lLmxvYyxcblx0XHRcdFx0XHRcdFx0J0V4cG9ydCBBc3NpZ25EZXN0cnVjdHVyZSBub3QgeWV0IHN1cHBvcnRlZC4nKVxuXHRcdFx0XHRcdFx0cmV0dXJuIGxpbmUuYXNzaWduLmFzc2lnbmVlLm5hbWUgPT09IG1vZHVsZU5hbWUgP1xuXHRcdFx0XHRcdFx0XHRuZXcgTW9kdWxlRXhwb3J0RGVmYXVsdChsaW5lLmxvYywgbGluZS5hc3NpZ24pIDpcblx0XHRcdFx0XHRcdFx0bmV3IE1vZHVsZUV4cG9ydE5hbWVkKGxpbmUubG9jLCBsaW5lLmFzc2lnbilcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gVE9ETzogSWYgUmVnaW9uLCBsaW5lLmxpbmVzID0gbGluZS5saW5lcy5tYXAoY29udmVydFRvRXhwb3J0cylcblx0XHRcdFx0XHRyZXR1cm4gbGluZVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGxpbmVzLm1hcChjb252ZXJ0VG9FeHBvcnRzKVxuXHRcdFx0fVxuXHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHRjb25zdCBbbW9kdWxlTGluZXMsIG9wRGVmYXVsdEV4cG9ydF0gPSB0cnlUYWtlTGFzdFZhbChsaW5lcylcblx0XHRcdFx0aWYgKG9wRGVmYXVsdEV4cG9ydCAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdGNvbnN0IF8gPSBvcERlZmF1bHRFeHBvcnRcblx0XHRcdFx0XHRtb2R1bGVMaW5lcy5wdXNoKG5ldyBNb2R1bGVFeHBvcnREZWZhdWx0KF8ubG9jLFxuXHRcdFx0XHRcdFx0bmV3IEFzc2lnblNpbmdsZShfLmxvYyxcblx0XHRcdFx0XHRcdFx0TG9jYWxEZWNsYXJlLnBsYWluKG9wRGVmYXVsdEV4cG9ydC5sb2MsIGNvbnRleHQub3B0cy5tb2R1bGVOYW1lKCkpLFxuXHRcdFx0XHRcdFx0XHRfKSkpXG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIG1vZHVsZUxpbmVzXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cbmNvbnN0XG5cdHRyeVRha2VMYXN0VmFsID0gbGluZXMgPT5cblx0XHQhaXNFbXB0eShsaW5lcykgJiYgbGFzdChsaW5lcykgaW5zdGFuY2VvZiBWYWwgP1xuXHRcdFx0W3J0YWlsKGxpbmVzKSwgbGFzdChsaW5lcyldIDpcblx0XHRcdFtsaW5lcywgbnVsbF0sXG5cblx0cGxhaW5CbG9ja0xpbmVzID0gbGluZVRva2VucyA9PiB7XG5cdFx0Y29uc3QgbGluZXMgPSBbXVxuXHRcdGNvbnN0IGFkZExpbmUgPSBsaW5lID0+IHtcblx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgQXJyYXkpXG5cdFx0XHRcdGZvciAoY29uc3QgXyBvZiBsaW5lKVxuXHRcdFx0XHRcdGFkZExpbmUoXylcblx0XHRcdGVsc2Vcblx0XHRcdFx0bGluZXMucHVzaChsaW5lKVxuXHRcdH1cblx0XHRmb3IgKGNvbnN0IF8gb2YgbGluZVRva2Vucy5zbGljZXMoKSlcblx0XHRcdGFkZExpbmUocGFyc2VMaW5lKF8pKVxuXHRcdHJldHVybiBsaW5lc1xuXHR9LFxuXG5cdEtSZXR1cm5fUGxhaW4gPSAwLFxuXHRLUmV0dXJuX09iaiA9IDEsXG5cdEtSZXR1cm5fQmFnID0gMixcblx0S1JldHVybl9NYXAgPSAzLFxuXHRwYXJzZUJsb2NrTGluZXMgPSBsaW5lVG9rZW5zID0+IHtcblx0XHRsZXQgaXNCYWcgPSBmYWxzZSwgaXNNYXAgPSBmYWxzZSwgaXNPYmogPSBmYWxzZVxuXHRcdGNvbnN0IGNoZWNrTGluZSA9IGxpbmUgPT4ge1xuXHRcdFx0Ly8gVE9ETzogaWYgUmVnaW9uLCBsb29wIG92ZXIgaXRzIGxpbmVzXG5cdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIEJhZ0VudHJ5KVxuXHRcdFx0XHRpc0JhZyA9IHRydWVcblx0XHRcdGVsc2UgaWYgKGxpbmUgaW5zdGFuY2VvZiBNYXBFbnRyeSlcblx0XHRcdFx0aXNNYXAgPSB0cnVlXG5cdFx0XHRlbHNlIGlmIChsaW5lIGluc3RhbmNlb2YgT2JqRW50cnkpXG5cdFx0XHRcdGlzT2JqID0gdHJ1ZVxuXHRcdH1cblx0XHRjb25zdCBsaW5lcyA9IHBsYWluQmxvY2tMaW5lcyhsaW5lVG9rZW5zKVxuXHRcdGZvciAoY29uc3QgXyBvZiBsaW5lcylcblx0XHRcdGNoZWNrTGluZShfKVxuXG5cdFx0Y29udGV4dC5jaGVjayghKGlzT2JqICYmIGlzQmFnKSwgbGluZXMubG9jLCAnQmxvY2sgaGFzIGJvdGggQmFnIGFuZCBPYmogbGluZXMuJylcblx0XHRjb250ZXh0LmNoZWNrKCEoaXNPYmogJiYgaXNNYXApLCBsaW5lcy5sb2MsICdCbG9jayBoYXMgYm90aCBPYmogYW5kIE1hcCBsaW5lcy4nKVxuXHRcdGNvbnRleHQuY2hlY2soIShpc0JhZyAmJiBpc01hcCksIGxpbmVzLmxvYywgJ0Jsb2NrIGhhcyBib3RoIEJhZyBhbmQgTWFwIGxpbmVzLicpXG5cblx0XHRjb25zdCBrUmV0dXJuID1cblx0XHRcdGlzT2JqID8gS1JldHVybl9PYmogOiBpc0JhZyA/IEtSZXR1cm5fQmFnIDogaXNNYXAgPyBLUmV0dXJuX01hcCA6IEtSZXR1cm5fUGxhaW5cblx0XHRyZXR1cm4ge2xpbmVzLCBrUmV0dXJufVxuXHR9XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

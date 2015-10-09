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
				return new _MsAst.BlockObj(tokens.loc, opComment, lines);
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
					var _tryTakeLastVal = tryTakeLastVal(lines);

					var _tryTakeLastVal2 = _slicedToArray(_tryTakeLastVal, 2);

					const moduleLines = _tryTakeLastVal2[0];
					const opDefaultExport = _tryTakeLastVal2[1];

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlQmxvY2suanMiLCJwcml2YXRlL3BhcnNlL3BhcnNlQmxvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNXTzs7QUFFTixlQUFjLEdBQUcsTUFBTSxJQUFJO0FBQzFCLGVBUmtCLGFBQWEsRUFRakIsTUFBTSxFQUFFLDZCQUE2QixDQUFDLENBQUE7QUFDcEQsUUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQzNCLFdBVmlDLE9BQU8sQ0FVaEMsS0FBSyxDQUFDLFdBWkMsT0FBTyxTQUFoQixPQUFPLEVBWWtCLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsNkJBQTZCLENBQUMsQ0FBQTtBQUNoRixTQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLGdCQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0VBQzNDO09BRUQsU0FBUyxHQUFHLE1BQU0sSUFBSSxXQWxCTCxTQUFTLENBa0JVLE1BQU0sQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BRXRFLFNBQVMsR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFNLEtBQUs7d0JBQ1IsY0FBYyxDQUFDLE1BQU0sQ0FBQzs7OztRQUF2QyxNQUFNO1FBQUUsS0FBSzs7QUFDcEIsZUFsQk0sVUFBVSxFQWtCTCxNQUFNLEVBQUUsTUFDbEIsQ0FBQyxnQ0FBZ0MsR0FBRSxrQkF6QjlCLElBQUksRUF5QitCLFdBckJqQixXQUFXLEVBcUJrQixPQUFPLENBQUMsQ0FBQyxFQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUE7QUFDNUUsU0FBTyxLQUFLLENBQUE7RUFDWjtPQUNELFdBQVcsR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFNLEtBQzdCLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO09BQ3pDLFlBQVksR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFN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QUFJLG1CQTlKZixRQUFRLEFBOEoyQixFQUNoQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0dBQ2IsQ0FBQTtBQUNELFFBQU0sS0FBSyxHQUFHLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUN6QyxPQUFLLE1BQU0sQ0FBQyxJQUFJLEtBQUssRUFDcEIsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFBOztBQUViLFdBbEtpQyxPQUFPLENBa0toQyxLQUFLLENBQUMsRUFBRSxLQUFLLElBQUksS0FBSyxDQUFBLEFBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLG1DQUFtQyxDQUFDLENBQUE7QUFDaEYsV0FuS2lDLE9BQU8sQ0FtS2hDLEtBQUssQ0FBQyxFQUFFLEtBQUssSUFBSSxLQUFLLENBQUEsQUFBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsbUNBQW1DLENBQUMsQ0FBQTtBQUNoRixXQXBLaUMsT0FBTyxDQW9LaEMsS0FBSyxDQUFDLEVBQUUsS0FBSyxJQUFJLEtBQUssQ0FBQSxBQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFBOztBQUVoRixRQUFNLE9BQU8sR0FDWixLQUFLLEdBQUcsV0FBVyxHQUFHLEtBQUssR0FBRyxXQUFXLEdBQUcsS0FBSyxHQUFHLFdBQVcsR0FBRyxhQUFhLENBQUE7QUFDaEYsU0FBTyxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUMsQ0FBQTtFQUN2QixDQUFBIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvcGFyc2VCbG9jay5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge0Fzc2lnblNpbmdsZSwgQmFnRW50cnksIEJsb2NrQmFnLCBCbG9ja0RvLCBCbG9ja09iaiwgQmxvY2tNYXAsIEJsb2NrVmFsVGhyb3csXG5cdEJsb2NrV2l0aFJldHVybiwgQmxvY2tXcmFwLCBMb2NhbERlY2xhcmUsIE1hcEVudHJ5LCBNb2R1bGVFeHBvcnREZWZhdWx0LCBNb2R1bGVFeHBvcnROYW1lZCxcblx0T2JqRW50cnksIE9iakVudHJ5QXNzaWduLCBUaHJvdywgVmFsfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R19CbG9jaywgaXNHcm91cCwga2V5d29yZE5hbWV9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtpc0VtcHR5LCBsYXN0LCBydGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tFbXB0eSwgY2hlY2tOb25FbXB0eSwgY29udGV4dH0gZnJvbSAnLi9jb250ZXh0J1xuaW1wb3J0IHBhcnNlTGluZSwge3BhcnNlTGluZU9yTGluZXN9IGZyb20gJy4vcGFyc2VMaW5lJ1xuaW1wb3J0IHRyeVRha2VDb21tZW50IGZyb20gJy4vdHJ5VGFrZUNvbW1lbnQnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuZXhwb3J0IGNvbnN0XG5cdC8vIFRva2VucyBvbiB0aGUgbGluZSBiZWZvcmUgYSBibG9jaywgYW5kIHRva2VucyBmb3IgdGhlIGJsb2NrIGl0c2VsZi5cblx0YmVmb3JlQW5kQmxvY2sgPSB0b2tlbnMgPT4ge1xuXHRcdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAnRXhwZWN0ZWQgYW4gaW5kZW50ZWQgYmxvY2suJylcblx0XHRjb25zdCBibG9jayA9IHRva2Vucy5sYXN0KClcblx0XHRjb250ZXh0LmNoZWNrKGlzR3JvdXAoR19CbG9jaywgYmxvY2spLCBibG9jay5sb2MsICdFeHBlY3RlZCBhbiBpbmRlbnRlZCBibG9jay4nKVxuXHRcdHJldHVybiBbdG9rZW5zLnJ0YWlsKCksIFNsaWNlLmdyb3VwKGJsb2NrKV1cblx0fSxcblxuXHRibG9ja1dyYXAgPSB0b2tlbnMgPT4gbmV3IEJsb2NrV3JhcCh0b2tlbnMubG9jLCBwYXJzZUJsb2NrVmFsKHRva2VucykpLFxuXG5cdGp1c3RCbG9jayA9IChrZXl3b3JkLCB0b2tlbnMpID0+IHtcblx0XHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdFx0Y2hlY2tFbXB0eShiZWZvcmUsICgpID0+XG5cdFx0XHRgRGlkIG5vdCBleHBlY3QgYW55dGhpbmcgYmV0d2VlbiAke2NvZGUoa2V5d29yZE5hbWUoa2V5d29yZCkpfSBhbmQgYmxvY2suYClcblx0XHRyZXR1cm4gYmxvY2tcblx0fSxcblx0anVzdEJsb2NrRG8gPSAoa2V5d29yZCwgdG9rZW5zKSA9PlxuXHRcdHBhcnNlQmxvY2tEbyhqdXN0QmxvY2soa2V5d29yZCwgdG9rZW5zKSksXG5cdGp1c3RCbG9ja1ZhbCA9IChrZXl3b3JkLCB0b2tlbnMpID0+XG5cdFx0cGFyc2VCbG9ja1ZhbChqdXN0QmxvY2soa2V5d29yZCwgdG9rZW5zKSksXG5cblx0Ly8gR2V0cyBsaW5lcyBpbiBhIHJlZ2lvbi5cblx0cGFyc2VMaW5lc0Zyb21CbG9jayA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKClcblx0XHRjb250ZXh0LmNoZWNrKHRva2Vucy5zaXplKCkgPiAxICYmIHRva2Vucy5zaXplKCkgPT09IDIgJiYgaXNHcm91cChHX0Jsb2NrLCB0b2tlbnMuc2Vjb25kKCkpLFxuXHRcdFx0aC5sb2MsICgpID0+XG5cdFx0XHRgRXhwZWN0ZWQgaW5kZW50ZWQgYmxvY2sgYWZ0ZXIgJHtofSwgYW5kIG5vdGhpbmcgZWxzZS5gKVxuXHRcdGNvbnN0IGJsb2NrID0gdG9rZW5zLnNlY29uZCgpXG5cblx0XHRjb25zdCBsaW5lcyA9IFtdXG5cdFx0Zm9yIChjb25zdCBsaW5lIG9mIFNsaWNlLmdyb3VwKGJsb2NrKS5zbGljZXMoKSlcblx0XHRcdGxpbmVzLnB1c2goLi4ucGFyc2VMaW5lT3JMaW5lcyhsaW5lKSlcblx0XHRyZXR1cm4gbGluZXNcblx0fSxcblxuXHRwYXJzZUJsb2NrRG8gPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IFtvcENvbW1lbnQsIHJlc3RdID0gdHJ5VGFrZUNvbW1lbnQodG9rZW5zKVxuXHRcdGNvbnN0IGxpbmVzID0gcGxhaW5CbG9ja0xpbmVzKHJlc3QpXG5cdFx0cmV0dXJuIG5ldyBCbG9ja0RvKHRva2Vucy5sb2MsIG9wQ29tbWVudCwgbGluZXMpXG5cdH0sXG5cblx0cGFyc2VCbG9ja1ZhbCA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgW29wQ29tbWVudCwgcmVzdF0gPSB0cnlUYWtlQ29tbWVudCh0b2tlbnMpXG5cdFx0Y29uc3Qge2xpbmVzLCBrUmV0dXJufSA9IHBhcnNlQmxvY2tMaW5lcyhyZXN0KVxuXHRcdHN3aXRjaCAoa1JldHVybikge1xuXHRcdFx0Y2FzZSBLUmV0dXJuX0JhZzpcblx0XHRcdFx0cmV0dXJuIG5ldyBCbG9ja0JhZyh0b2tlbnMubG9jLCBvcENvbW1lbnQsIGxpbmVzKVxuXHRcdFx0Y2FzZSBLUmV0dXJuX01hcDpcblx0XHRcdFx0cmV0dXJuIG5ldyBCbG9ja01hcCh0b2tlbnMubG9jLCBvcENvbW1lbnQsIGxpbmVzKVxuXHRcdFx0Y2FzZSBLUmV0dXJuX09iajpcblx0XHRcdFx0cmV0dXJuIG5ldyBCbG9ja09iaih0b2tlbnMubG9jLCBvcENvbW1lbnQsIGxpbmVzKVxuXHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHRjb250ZXh0LmNoZWNrKCFpc0VtcHR5KGxpbmVzKSwgdG9rZW5zLmxvYywgJ1ZhbHVlIGJsb2NrIG11c3QgZW5kIGluIGEgdmFsdWUuJylcblx0XHRcdFx0Y29uc3QgdmFsID0gbGFzdChsaW5lcylcblx0XHRcdFx0aWYgKHZhbCBpbnN0YW5jZW9mIFRocm93KVxuXHRcdFx0XHRcdHJldHVybiBuZXcgQmxvY2tWYWxUaHJvdyh0b2tlbnMubG9jLCBvcENvbW1lbnQsIHJ0YWlsKGxpbmVzKSwgdmFsKVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKHZhbCBpbnN0YW5jZW9mIFZhbCwgdmFsLmxvYywgJ1ZhbHVlIGJsb2NrIG11c3QgZW5kIGluIGEgdmFsdWUuJylcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEJsb2NrV2l0aFJldHVybih0b2tlbnMubG9jLCBvcENvbW1lbnQsIHJ0YWlsKGxpbmVzKSwgdmFsKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdHBhcnNlTW9kdWxlQmxvY2sgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IHtsaW5lcywga1JldHVybn0gPSBwYXJzZUJsb2NrTGluZXModG9rZW5zLCB0cnVlKVxuXHRcdGNvbnN0IG9wQ29tbWVudCA9IG51bGxcblx0XHRjb25zdCBsb2MgPSB0b2tlbnMubG9jXG5cdFx0c3dpdGNoIChrUmV0dXJuKSB7XG5cdFx0XHRjYXNlIEtSZXR1cm5fQmFnOiBjYXNlIEtSZXR1cm5fTWFwOiB7XG5cdFx0XHRcdGNvbnN0IGNscyA9IGtSZXR1cm4gPT09IEtSZXR1cm5fQmFnID8gQmxvY2tCYWcgOiBCbG9ja01hcFxuXHRcdFx0XHRjb25zdCBibG9jayA9IG5ldyBjbHMobG9jLCBvcENvbW1lbnQsIGxpbmVzKVxuXHRcdFx0XHRjb25zdCB2YWwgPSBuZXcgQmxvY2tXcmFwKGxvYywgYmxvY2spXG5cdFx0XHRcdGNvbnN0IGFzc2lnbmVlID0gTG9jYWxEZWNsYXJlLnBsYWluKGxvYywgY29udGV4dC5vcHRzLm1vZHVsZU5hbWUoKSlcblx0XHRcdFx0Y29uc3QgYXNzaWduID0gbmV3IEFzc2lnblNpbmdsZShsb2MsIGFzc2lnbmVlLCB2YWwpXG5cdFx0XHRcdHJldHVybiBbbmV3IE1vZHVsZUV4cG9ydERlZmF1bHQobG9jLCBhc3NpZ24pXVxuXHRcdFx0fVxuXHRcdFx0Y2FzZSBLUmV0dXJuX09iajoge1xuXHRcdFx0XHRjb25zdCBtb2R1bGVOYW1lID0gY29udGV4dC5vcHRzLm1vZHVsZU5hbWUoKVxuXG5cdFx0XHRcdC8vIE1vZHVsZSBleHBvcnRzIGxvb2sgbGlrZSBhIEJsb2NrT2JqLCAgYnV0IGFyZSByZWFsbHkgZGlmZmVyZW50LlxuXHRcdFx0XHQvLyBJbiBFUzYsIG1vZHVsZSBleHBvcnRzIG11c3QgYmUgY29tcGxldGVseSBzdGF0aWMuXG5cdFx0XHRcdC8vIFNvIHdlIGtlZXAgYW4gYXJyYXkgb2YgZXhwb3J0cyBhdHRhY2hlZCBkaXJlY3RseSB0byB0aGUgTW9kdWxlIGFzdC5cblx0XHRcdFx0Ly8gSWYgeW91IHdyaXRlOlxuXHRcdFx0XHQvL1x0aWYhIGNvbmRcblx0XHRcdFx0Ly9cdFx0YS4gYlxuXHRcdFx0XHQvLyBpbiBhIG1vZHVsZSBjb250ZXh0LCBpdCB3aWxsIGJlIGFuIGVycm9yLiAoVGhlIG1vZHVsZSBjcmVhdGVzIG5vIGBidWlsdGAgbG9jYWwuKVxuXHRcdFx0XHRjb25zdCBjb252ZXJ0VG9FeHBvcnRzID0gbGluZSA9PiB7XG5cdFx0XHRcdFx0aWYgKGxpbmUgaW5zdGFuY2VvZiBPYmpFbnRyeSkge1xuXHRcdFx0XHRcdFx0Y29udGV4dC5jaGVjayhsaW5lIGluc3RhbmNlb2YgT2JqRW50cnlBc3NpZ24sIGxpbmUubG9jLFxuXHRcdFx0XHRcdFx0XHQnTW9kdWxlIGV4cG9ydHMgY2FuIG5vdCBiZSBjb21wdXRlZC4nKVxuXHRcdFx0XHRcdFx0Y29udGV4dC5jaGVjayhsaW5lLmFzc2lnbiBpbnN0YW5jZW9mIEFzc2lnblNpbmdsZSwgbGluZS5sb2MsXG5cdFx0XHRcdFx0XHRcdCdFeHBvcnQgQXNzaWduRGVzdHJ1Y3R1cmUgbm90IHlldCBzdXBwb3J0ZWQuJylcblx0XHRcdFx0XHRcdHJldHVybiBsaW5lLmFzc2lnbi5hc3NpZ25lZS5uYW1lID09PSBtb2R1bGVOYW1lID9cblx0XHRcdFx0XHRcdFx0bmV3IE1vZHVsZUV4cG9ydERlZmF1bHQobGluZS5sb2MsIGxpbmUuYXNzaWduKSA6XG5cdFx0XHRcdFx0XHRcdG5ldyBNb2R1bGVFeHBvcnROYW1lZChsaW5lLmxvYywgbGluZS5hc3NpZ24pXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIFRPRE86IElmIFJlZ2lvbiwgbGluZS5saW5lcyA9IGxpbmUubGluZXMubWFwKGNvbnZlcnRUb0V4cG9ydHMpXG5cdFx0XHRcdFx0cmV0dXJuIGxpbmVcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBsaW5lcy5tYXAoY29udmVydFRvRXhwb3J0cylcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0Y29uc3QgW21vZHVsZUxpbmVzLCBvcERlZmF1bHRFeHBvcnRdID0gdHJ5VGFrZUxhc3RWYWwobGluZXMpXG5cdFx0XHRcdGlmIChvcERlZmF1bHRFeHBvcnQgIT09IG51bGwpIHtcblx0XHRcdFx0XHRjb25zdCBfID0gb3BEZWZhdWx0RXhwb3J0XG5cdFx0XHRcdFx0bW9kdWxlTGluZXMucHVzaChuZXcgTW9kdWxlRXhwb3J0RGVmYXVsdChfLmxvYyxcblx0XHRcdFx0XHRcdG5ldyBBc3NpZ25TaW5nbGUoXy5sb2MsXG5cdFx0XHRcdFx0XHRcdExvY2FsRGVjbGFyZS5wbGFpbihvcERlZmF1bHRFeHBvcnQubG9jLCBjb250ZXh0Lm9wdHMubW9kdWxlTmFtZSgpKSxcblx0XHRcdFx0XHRcdFx0XykpKVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBtb2R1bGVMaW5lc1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5jb25zdFxuXHR0cnlUYWtlTGFzdFZhbCA9IGxpbmVzID0+XG5cdFx0IWlzRW1wdHkobGluZXMpICYmIGxhc3QobGluZXMpIGluc3RhbmNlb2YgVmFsID9cblx0XHRcdFtydGFpbChsaW5lcyksIGxhc3QobGluZXMpXSA6XG5cdFx0XHRbbGluZXMsIG51bGxdLFxuXG5cdHBsYWluQmxvY2tMaW5lcyA9IGxpbmVUb2tlbnMgPT4ge1xuXHRcdGNvbnN0IGxpbmVzID0gW11cblx0XHRjb25zdCBhZGRMaW5lID0gbGluZSA9PiB7XG5cdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIEFycmF5KVxuXHRcdFx0XHRmb3IgKGNvbnN0IF8gb2YgbGluZSlcblx0XHRcdFx0XHRhZGRMaW5lKF8pXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGxpbmVzLnB1c2gobGluZSlcblx0XHR9XG5cdFx0Zm9yIChjb25zdCBfIG9mIGxpbmVUb2tlbnMuc2xpY2VzKCkpXG5cdFx0XHRhZGRMaW5lKHBhcnNlTGluZShfKSlcblx0XHRyZXR1cm4gbGluZXNcblx0fSxcblxuXHRLUmV0dXJuX1BsYWluID0gMCxcblx0S1JldHVybl9PYmogPSAxLFxuXHRLUmV0dXJuX0JhZyA9IDIsXG5cdEtSZXR1cm5fTWFwID0gMyxcblx0cGFyc2VCbG9ja0xpbmVzID0gbGluZVRva2VucyA9PiB7XG5cdFx0bGV0IGlzQmFnID0gZmFsc2UsIGlzTWFwID0gZmFsc2UsIGlzT2JqID0gZmFsc2Vcblx0XHRjb25zdCBjaGVja0xpbmUgPSBsaW5lID0+IHtcblx0XHRcdC8vIFRPRE86IGlmIFJlZ2lvbiwgbG9vcCBvdmVyIGl0cyBsaW5lc1xuXHRcdFx0aWYgKGxpbmUgaW5zdGFuY2VvZiBCYWdFbnRyeSlcblx0XHRcdFx0aXNCYWcgPSB0cnVlXG5cdFx0XHRlbHNlIGlmIChsaW5lIGluc3RhbmNlb2YgTWFwRW50cnkpXG5cdFx0XHRcdGlzTWFwID0gdHJ1ZVxuXHRcdFx0ZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIE9iakVudHJ5KVxuXHRcdFx0XHRpc09iaiA9IHRydWVcblx0XHR9XG5cdFx0Y29uc3QgbGluZXMgPSBwbGFpbkJsb2NrTGluZXMobGluZVRva2Vucylcblx0XHRmb3IgKGNvbnN0IF8gb2YgbGluZXMpXG5cdFx0XHRjaGVja0xpbmUoXylcblxuXHRcdGNvbnRleHQuY2hlY2soIShpc09iaiAmJiBpc0JhZyksIGxpbmVzLmxvYywgJ0Jsb2NrIGhhcyBib3RoIEJhZyBhbmQgT2JqIGxpbmVzLicpXG5cdFx0Y29udGV4dC5jaGVjayghKGlzT2JqICYmIGlzTWFwKSwgbGluZXMubG9jLCAnQmxvY2sgaGFzIGJvdGggT2JqIGFuZCBNYXAgbGluZXMuJylcblx0XHRjb250ZXh0LmNoZWNrKCEoaXNCYWcgJiYgaXNNYXApLCBsaW5lcy5sb2MsICdCbG9jayBoYXMgYm90aCBCYWcgYW5kIE1hcCBsaW5lcy4nKVxuXG5cdFx0Y29uc3Qga1JldHVybiA9XG5cdFx0XHRpc09iaiA/IEtSZXR1cm5fT2JqIDogaXNCYWcgPyBLUmV0dXJuX0JhZyA6IGlzTWFwID8gS1JldHVybl9NYXAgOiBLUmV0dXJuX1BsYWluXG5cdFx0cmV0dXJuIHtsaW5lcywga1JldHVybn1cblx0fVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

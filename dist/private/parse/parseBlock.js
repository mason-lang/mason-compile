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
	     

	// Gets lines in a region or Debug.
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
						} else if (line instanceof _MsAst.Debug) line.lines = line.lines.map(convertToExports);
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
			if (line instanceof _MsAst.Debug) for (const _ of line.lines) checkLine(_);else if (line instanceof _MsAst.BagEntry) isBag = true;else if (line instanceof _MsAst.MapEntry) isMap = true;else if (line instanceof _MsAst.ObjEntry) isObj = true;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlQmxvY2suanMiLCJwcml2YXRlL3BhcnNlL3BhcnNlQmxvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNXTzs7QUFFTixlQUFjLEdBQUcsTUFBTSxJQUFJO0FBQzFCLGVBUmtCLGFBQWEsRUFRakIsTUFBTSxFQUFFLDZCQUE2QixDQUFDLENBQUE7QUFDcEQsUUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQzNCLFdBVmlDLE9BQU8sQ0FVaEMsS0FBSyxDQUFDLFdBWkMsT0FBTyxTQUFoQixPQUFPLEVBWWtCLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsNkJBQTZCLENBQUMsQ0FBQTtBQUNoRixTQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLGdCQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0VBQzNDO09BRUQsU0FBUyxHQUFHLE1BQU0sSUFBSSxXQWxCTCxTQUFTLENBa0JVLE1BQU0sQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BRXRFLFNBQVMsR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFNLEtBQUs7d0JBQ1IsY0FBYyxDQUFDLE1BQU0sQ0FBQzs7OztRQUF2QyxNQUFNO1FBQUUsS0FBSzs7QUFDcEIsZUFsQk0sVUFBVSxFQWtCTCxNQUFNLEVBQUUsTUFDbEIsQ0FBQyxnQ0FBZ0MsR0FBRSxrQkF6QjlCLElBQUksRUF5QitCLFdBckJqQixXQUFXLEVBcUJrQixPQUFPLENBQUMsQ0FBQyxFQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUE7QUFDNUUsU0FBTyxLQUFLLENBQUE7RUFDWjtPQUNELFdBQVcsR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFNLEtBQzdCLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO09BQ3pDLFlBQVksR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFN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QTtFQUN2QixDQUFBIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvcGFyc2VCbG9jay5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge0Fzc2lnblNpbmdsZSwgQmFnRW50cnksIEJsb2NrQmFnLCBCbG9ja0RvLCBCbG9ja09iaiwgQmxvY2tNYXAsIEJsb2NrVmFsVGhyb3csXG5cdEJsb2NrV2l0aFJldHVybiwgQmxvY2tXcmFwLCBEZWJ1ZywgTG9jYWxEZWNsYXJlLCBNYXBFbnRyeSwgTW9kdWxlRXhwb3J0RGVmYXVsdCxcblx0TW9kdWxlRXhwb3J0TmFtZWQsIE9iakVudHJ5LCBPYmpFbnRyeUFzc2lnbiwgVGhyb3csIFZhbH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dfQmxvY2ssIGlzR3JvdXAsIGtleXdvcmROYW1lfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aXNFbXB0eSwgbGFzdCwgcnRhaWx9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2NoZWNrRW1wdHksIGNoZWNrTm9uRW1wdHksIGNvbnRleHR9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCBwYXJzZUxpbmUsIHtwYXJzZUxpbmVPckxpbmVzfSBmcm9tICcuL3BhcnNlTGluZSdcbmltcG9ydCB0cnlUYWtlQ29tbWVudCBmcm9tICcuL3RyeVRha2VDb21tZW50J1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbmV4cG9ydCBjb25zdFxuXHQvLyBUb2tlbnMgb24gdGhlIGxpbmUgYmVmb3JlIGEgYmxvY2ssIGFuZCB0b2tlbnMgZm9yIHRoZSBibG9jayBpdHNlbGYuXG5cdGJlZm9yZUFuZEJsb2NrID0gdG9rZW5zID0+IHtcblx0XHRjaGVja05vbkVtcHR5KHRva2VucywgJ0V4cGVjdGVkIGFuIGluZGVudGVkIGJsb2NrLicpXG5cdFx0Y29uc3QgYmxvY2sgPSB0b2tlbnMubGFzdCgpXG5cdFx0Y29udGV4dC5jaGVjayhpc0dyb3VwKEdfQmxvY2ssIGJsb2NrKSwgYmxvY2subG9jLCAnRXhwZWN0ZWQgYW4gaW5kZW50ZWQgYmxvY2suJylcblx0XHRyZXR1cm4gW3Rva2Vucy5ydGFpbCgpLCBTbGljZS5ncm91cChibG9jayldXG5cdH0sXG5cblx0YmxvY2tXcmFwID0gdG9rZW5zID0+IG5ldyBCbG9ja1dyYXAodG9rZW5zLmxvYywgcGFyc2VCbG9ja1ZhbCh0b2tlbnMpKSxcblxuXHRqdXN0QmxvY2sgPSAoa2V5d29yZCwgdG9rZW5zKSA9PiB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRcdGNoZWNrRW1wdHkoYmVmb3JlLCAoKSA9PlxuXHRcdFx0YERpZCBub3QgZXhwZWN0IGFueXRoaW5nIGJldHdlZW4gJHtjb2RlKGtleXdvcmROYW1lKGtleXdvcmQpKX0gYW5kIGJsb2NrLmApXG5cdFx0cmV0dXJuIGJsb2NrXG5cdH0sXG5cdGp1c3RCbG9ja0RvID0gKGtleXdvcmQsIHRva2VucykgPT5cblx0XHRwYXJzZUJsb2NrRG8oanVzdEJsb2NrKGtleXdvcmQsIHRva2VucykpLFxuXHRqdXN0QmxvY2tWYWwgPSAoa2V5d29yZCwgdG9rZW5zKSA9PlxuXHRcdHBhcnNlQmxvY2tWYWwoanVzdEJsb2NrKGtleXdvcmQsIHRva2VucykpLFxuXG5cdC8vIEdldHMgbGluZXMgaW4gYSByZWdpb24gb3IgRGVidWcuXG5cdHBhcnNlTGluZXNGcm9tQmxvY2sgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpXG5cdFx0Y29udGV4dC5jaGVjayh0b2tlbnMuc2l6ZSgpID4gMSAmJiB0b2tlbnMuc2l6ZSgpID09PSAyICYmIGlzR3JvdXAoR19CbG9jaywgdG9rZW5zLnNlY29uZCgpKSxcblx0XHRcdGgubG9jLCAoKSA9PlxuXHRcdFx0YEV4cGVjdGVkIGluZGVudGVkIGJsb2NrIGFmdGVyICR7aH0sIGFuZCBub3RoaW5nIGVsc2UuYClcblx0XHRjb25zdCBibG9jayA9IHRva2Vucy5zZWNvbmQoKVxuXG5cdFx0Y29uc3QgbGluZXMgPSBbXVxuXHRcdGZvciAoY29uc3QgbGluZSBvZiBTbGljZS5ncm91cChibG9jaykuc2xpY2VzKCkpXG5cdFx0XHRsaW5lcy5wdXNoKC4uLnBhcnNlTGluZU9yTGluZXMobGluZSkpXG5cdFx0cmV0dXJuIGxpbmVzXG5cdH0sXG5cblx0cGFyc2VCbG9ja0RvID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBbb3BDb21tZW50LCByZXN0XSA9IHRyeVRha2VDb21tZW50KHRva2Vucylcblx0XHRjb25zdCBsaW5lcyA9IHBsYWluQmxvY2tMaW5lcyhyZXN0KVxuXHRcdHJldHVybiBuZXcgQmxvY2tEbyh0b2tlbnMubG9jLCBvcENvbW1lbnQsIGxpbmVzKVxuXHR9LFxuXG5cdHBhcnNlQmxvY2tWYWwgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IFtvcENvbW1lbnQsIHJlc3RdID0gdHJ5VGFrZUNvbW1lbnQodG9rZW5zKVxuXHRcdGNvbnN0IHtsaW5lcywga1JldHVybn0gPSBwYXJzZUJsb2NrTGluZXMocmVzdClcblx0XHRzd2l0Y2ggKGtSZXR1cm4pIHtcblx0XHRcdGNhc2UgS1JldHVybl9CYWc6XG5cdFx0XHRcdHJldHVybiBuZXcgQmxvY2tCYWcodG9rZW5zLmxvYywgb3BDb21tZW50LCBsaW5lcylcblx0XHRcdGNhc2UgS1JldHVybl9NYXA6XG5cdFx0XHRcdHJldHVybiBuZXcgQmxvY2tNYXAodG9rZW5zLmxvYywgb3BDb21tZW50LCBsaW5lcylcblx0XHRcdGNhc2UgS1JldHVybl9PYmo6XG5cdFx0XHRcdGNvbnN0IFtkb0xpbmVzLCBvcFZhbF0gPSB0cnlUYWtlTGFzdFZhbChsaW5lcylcblx0XHRcdFx0Ly8gb3BOYW1lIHdyaXR0ZW4gdG8gYnkgX3RyeUFkZE5hbWUuXG5cdFx0XHRcdHJldHVybiBuZXcgQmxvY2tPYmoodG9rZW5zLmxvYywgb3BDb21tZW50LCBkb0xpbmVzLCBvcFZhbCwgbnVsbClcblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0Y29udGV4dC5jaGVjayghaXNFbXB0eShsaW5lcyksIHRva2Vucy5sb2MsICdWYWx1ZSBibG9jayBtdXN0IGVuZCBpbiBhIHZhbHVlLicpXG5cdFx0XHRcdGNvbnN0IHZhbCA9IGxhc3QobGluZXMpXG5cdFx0XHRcdGlmICh2YWwgaW5zdGFuY2VvZiBUaHJvdylcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEJsb2NrVmFsVGhyb3codG9rZW5zLmxvYywgb3BDb21tZW50LCBydGFpbChsaW5lcyksIHZhbClcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayh2YWwgaW5zdGFuY2VvZiBWYWwsIHZhbC5sb2MsICdWYWx1ZSBibG9jayBtdXN0IGVuZCBpbiBhIHZhbHVlLicpXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBCbG9ja1dpdGhSZXR1cm4odG9rZW5zLmxvYywgb3BDb21tZW50LCBydGFpbChsaW5lcyksIHZhbClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRwYXJzZU1vZHVsZUJsb2NrID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCB7bGluZXMsIGtSZXR1cm59ID0gcGFyc2VCbG9ja0xpbmVzKHRva2VucywgdHJ1ZSlcblx0XHRjb25zdCBvcENvbW1lbnQgPSBudWxsXG5cdFx0Y29uc3QgbG9jID0gdG9rZW5zLmxvY1xuXHRcdHN3aXRjaCAoa1JldHVybikge1xuXHRcdFx0Y2FzZSBLUmV0dXJuX0JhZzogY2FzZSBLUmV0dXJuX01hcDoge1xuXHRcdFx0XHRjb25zdCBjbHMgPSBrUmV0dXJuID09PSBLUmV0dXJuX0JhZyA/IEJsb2NrQmFnIDogQmxvY2tNYXBcblx0XHRcdFx0Y29uc3QgYmxvY2sgPSBuZXcgY2xzKGxvYywgb3BDb21tZW50LCBsaW5lcylcblx0XHRcdFx0Y29uc3QgdmFsID0gbmV3IEJsb2NrV3JhcChsb2MsIGJsb2NrKVxuXHRcdFx0XHRjb25zdCBhc3NpZ25lZSA9IExvY2FsRGVjbGFyZS5wbGFpbihsb2MsIGNvbnRleHQub3B0cy5tb2R1bGVOYW1lKCkpXG5cdFx0XHRcdGNvbnN0IGFzc2lnbiA9IG5ldyBBc3NpZ25TaW5nbGUobG9jLCBhc3NpZ25lZSwgdmFsKVxuXHRcdFx0XHRyZXR1cm4gW25ldyBNb2R1bGVFeHBvcnREZWZhdWx0KGxvYywgYXNzaWduKV1cblx0XHRcdH1cblx0XHRcdGNhc2UgS1JldHVybl9PYmo6IHtcblx0XHRcdFx0Y29uc3QgbW9kdWxlTmFtZSA9IGNvbnRleHQub3B0cy5tb2R1bGVOYW1lKClcblxuXHRcdFx0XHQvLyBNb2R1bGUgZXhwb3J0cyBsb29rIGxpa2UgYSBCbG9ja09iaiwgIGJ1dCBhcmUgcmVhbGx5IGRpZmZlcmVudC5cblx0XHRcdFx0Ly8gSW4gRVM2LCBtb2R1bGUgZXhwb3J0cyBtdXN0IGJlIGNvbXBsZXRlbHkgc3RhdGljLlxuXHRcdFx0XHQvLyBTbyB3ZSBrZWVwIGFuIGFycmF5IG9mIGV4cG9ydHMgYXR0YWNoZWQgZGlyZWN0bHkgdG8gdGhlIE1vZHVsZSBhc3QuXG5cdFx0XHRcdC8vIElmIHlvdSB3cml0ZTpcblx0XHRcdFx0Ly9cdGlmISBjb25kXG5cdFx0XHRcdC8vXHRcdGEuIGJcblx0XHRcdFx0Ly8gaW4gYSBtb2R1bGUgY29udGV4dCwgaXQgd2lsbCBiZSBhbiBlcnJvci4gKFRoZSBtb2R1bGUgY3JlYXRlcyBubyBgYnVpbHRgIGxvY2FsLilcblx0XHRcdFx0Y29uc3QgY29udmVydFRvRXhwb3J0cyA9IGxpbmUgPT4ge1xuXHRcdFx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgT2JqRW50cnkpIHtcblx0XHRcdFx0XHRcdGNvbnRleHQuY2hlY2sobGluZSBpbnN0YW5jZW9mIE9iakVudHJ5QXNzaWduLCBsaW5lLmxvYyxcblx0XHRcdFx0XHRcdFx0J01vZHVsZSBleHBvcnRzIGNhbiBub3QgYmUgY29tcHV0ZWQuJylcblx0XHRcdFx0XHRcdGNvbnRleHQuY2hlY2sobGluZS5hc3NpZ24gaW5zdGFuY2VvZiBBc3NpZ25TaW5nbGUsIGxpbmUubG9jLFxuXHRcdFx0XHRcdFx0XHQnRXhwb3J0IEFzc2lnbkRlc3RydWN0dXJlIG5vdCB5ZXQgc3VwcG9ydGVkLicpXG5cdFx0XHRcdFx0XHRyZXR1cm4gbGluZS5hc3NpZ24uYXNzaWduZWUubmFtZSA9PT0gbW9kdWxlTmFtZSA/XG5cdFx0XHRcdFx0XHRcdG5ldyBNb2R1bGVFeHBvcnREZWZhdWx0KGxpbmUubG9jLCBsaW5lLmFzc2lnbikgOlxuXHRcdFx0XHRcdFx0XHRuZXcgTW9kdWxlRXhwb3J0TmFtZWQobGluZS5sb2MsIGxpbmUuYXNzaWduKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIERlYnVnKVxuXHRcdFx0XHRcdFx0bGluZS5saW5lcyA9IGxpbmUubGluZXMubWFwKGNvbnZlcnRUb0V4cG9ydHMpXG5cdFx0XHRcdFx0cmV0dXJuIGxpbmVcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBsaW5lcy5tYXAoY29udmVydFRvRXhwb3J0cylcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0Y29uc3QgW21vZHVsZUxpbmVzLCBvcERlZmF1bHRFeHBvcnRdID0gdHJ5VGFrZUxhc3RWYWwobGluZXMpXG5cdFx0XHRcdGlmIChvcERlZmF1bHRFeHBvcnQgIT09IG51bGwpIHtcblx0XHRcdFx0XHRjb25zdCBfID0gb3BEZWZhdWx0RXhwb3J0XG5cdFx0XHRcdFx0bW9kdWxlTGluZXMucHVzaChuZXcgTW9kdWxlRXhwb3J0RGVmYXVsdChfLmxvYyxcblx0XHRcdFx0XHRcdG5ldyBBc3NpZ25TaW5nbGUoXy5sb2MsXG5cdFx0XHRcdFx0XHRcdExvY2FsRGVjbGFyZS5wbGFpbihvcERlZmF1bHRFeHBvcnQubG9jLCBjb250ZXh0Lm9wdHMubW9kdWxlTmFtZSgpKSxcblx0XHRcdFx0XHRcdFx0XykpKVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBtb2R1bGVMaW5lc1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5jb25zdFxuXHR0cnlUYWtlTGFzdFZhbCA9IGxpbmVzID0+XG5cdFx0IWlzRW1wdHkobGluZXMpICYmIGxhc3QobGluZXMpIGluc3RhbmNlb2YgVmFsID9cblx0XHRcdFtydGFpbChsaW5lcyksIGxhc3QobGluZXMpXSA6XG5cdFx0XHRbbGluZXMsIG51bGxdLFxuXG5cdHBsYWluQmxvY2tMaW5lcyA9IGxpbmVUb2tlbnMgPT4ge1xuXHRcdGNvbnN0IGxpbmVzID0gW11cblx0XHRjb25zdCBhZGRMaW5lID0gbGluZSA9PiB7XG5cdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIEFycmF5KVxuXHRcdFx0XHRmb3IgKGNvbnN0IF8gb2YgbGluZSlcblx0XHRcdFx0XHRhZGRMaW5lKF8pXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGxpbmVzLnB1c2gobGluZSlcblx0XHR9XG5cdFx0Zm9yIChjb25zdCBfIG9mIGxpbmVUb2tlbnMuc2xpY2VzKCkpXG5cdFx0XHRhZGRMaW5lKHBhcnNlTGluZShfKSlcblx0XHRyZXR1cm4gbGluZXNcblx0fSxcblxuXHRLUmV0dXJuX1BsYWluID0gMCxcblx0S1JldHVybl9PYmogPSAxLFxuXHRLUmV0dXJuX0JhZyA9IDIsXG5cdEtSZXR1cm5fTWFwID0gMyxcblx0cGFyc2VCbG9ja0xpbmVzID0gbGluZVRva2VucyA9PiB7XG5cdFx0bGV0IGlzQmFnID0gZmFsc2UsIGlzTWFwID0gZmFsc2UsIGlzT2JqID0gZmFsc2Vcblx0XHRjb25zdCBjaGVja0xpbmUgPSBsaW5lID0+IHtcblx0XHRcdGlmIChsaW5lIGluc3RhbmNlb2YgRGVidWcpXG5cdFx0XHRcdGZvciAoY29uc3QgXyBvZiBsaW5lLmxpbmVzKVxuXHRcdFx0XHRcdGNoZWNrTGluZShfKVxuXHRcdFx0ZWxzZSBpZiAobGluZSBpbnN0YW5jZW9mIEJhZ0VudHJ5KVxuXHRcdFx0XHRpc0JhZyA9IHRydWVcblx0XHRcdGVsc2UgaWYgKGxpbmUgaW5zdGFuY2VvZiBNYXBFbnRyeSlcblx0XHRcdFx0aXNNYXAgPSB0cnVlXG5cdFx0XHRlbHNlIGlmIChsaW5lIGluc3RhbmNlb2YgT2JqRW50cnkpXG5cdFx0XHRcdGlzT2JqID0gdHJ1ZVxuXHRcdH1cblx0XHRjb25zdCBsaW5lcyA9IHBsYWluQmxvY2tMaW5lcyhsaW5lVG9rZW5zKVxuXHRcdGZvciAoY29uc3QgXyBvZiBsaW5lcylcblx0XHRcdGNoZWNrTGluZShfKVxuXG5cdFx0Y29udGV4dC5jaGVjayghKGlzT2JqICYmIGlzQmFnKSwgbGluZXMubG9jLCAnQmxvY2sgaGFzIGJvdGggQmFnIGFuZCBPYmogbGluZXMuJylcblx0XHRjb250ZXh0LmNoZWNrKCEoaXNPYmogJiYgaXNNYXApLCBsaW5lcy5sb2MsICdCbG9jayBoYXMgYm90aCBPYmogYW5kIE1hcCBsaW5lcy4nKVxuXHRcdGNvbnRleHQuY2hlY2soIShpc0JhZyAmJiBpc01hcCksIGxpbmVzLmxvYywgJ0Jsb2NrIGhhcyBib3RoIEJhZyBhbmQgTWFwIGxpbmVzLicpXG5cblx0XHRjb25zdCBrUmV0dXJuID1cblx0XHRcdGlzT2JqID8gS1JldHVybl9PYmogOiBpc0JhZyA/IEtSZXR1cm5fQmFnIDogaXNNYXAgPyBLUmV0dXJuX01hcCA6IEtSZXR1cm5fUGxhaW5cblx0XHRyZXR1cm4ge2xpbmVzLCBrUmV0dXJufVxuXHR9XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

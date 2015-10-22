(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', '../../CompileError', '../context', '../MsAst', '../Token', '../util', './checks', './parseLine', './tryTakeComment', './Slice'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports, require('../../CompileError'), require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parseLine'), require('./tryTakeComment'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.MsAst, global.Token, global.util, global.checks, global.parseLine, global.tryTakeComment, global.Slice);
		global.parseBlock = mod.exports;
	}
})(this, function (exports, _CompileError, _context, _MsAst, _Token, _util, _checks, _parseLine, _tryTakeComment4, _Slice) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	exports.beforeAndBlock = beforeAndBlock;
	exports.parseBlockWrap = parseBlockWrap;
	exports.justBlock = justBlock;
	exports.parseJustBlockDo = parseJustBlockDo;
	exports.parseJustBlockVal = parseJustBlockVal;
	exports.parseLinesFromBlock = parseLinesFromBlock;
	exports.parseBlockDo = parseBlockDo;
	exports.parseBlockVal = parseBlockVal;
	exports.parseModuleBlock = parseModuleBlock;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

	var _parseLine2 = _interopRequireDefault(_parseLine);

	var _tryTakeComment5 = _interopRequireDefault(_tryTakeComment4);

	var _Slice2 = _interopRequireDefault(_Slice);

	/**
 Tokens on the line before a block, and tokens for the block itself.
 @return {[Slice, Slice]}
 */

	function beforeAndBlock(tokens) {
		(0, _checks.checkNonEmpty)(tokens, 'Expected an indented block.');
		const block = tokens.last();
		(0, _context.check)((0, _Token.isGroup)(_Token.Groups.Block, block), block.loc, 'Expected an indented block.');
		return [tokens.rtail(), _Slice2.default.group(block)];
	}

	/** Parse a Block as a single value. */

	function parseBlockWrap(tokens) {
		return new _MsAst.BlockWrap(tokens.loc, parseBlockVal(tokens));
	}

	/**
 Parse a block, throwing an error if there's anything before the block.
 @param {Keywords} keywordKind Keyword that precedes the block. Used for error message.
 @param {Slice} tokens
 	Tokens which should contain a block.
 	Unlike {@link parseBlockDo}, these are *not* the tokens *within* the block.
 	These tokens are *expected* to just be a {@link Groups.Block}.
 	(If there's anything else, a {@link CompileError} will be thrown.)
 */

	function justBlock(keywordKind, tokens) {
		var _beforeAndBlock = beforeAndBlock(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const block = _beforeAndBlock2[1];

		(0, _checks.checkEmpty)(before, () => `Did not expect anything between ${ (0, _CompileError.code)((0, _Token.keywordName)(keywordKind)) } and block.`);
		return block;
	}

	/** Parse a {@link BlockDo}, failing if there's something preceding it. */

	function parseJustBlockDo(keyword, tokens) {
		return parseBlockDo(justBlock(keyword, tokens));
	}

	/** Parse a {@link BlockVal}, failing if there's something preceding it. */

	function parseJustBlockVal(keyword, tokens) {
		return parseBlockVal(justBlock(keyword, tokens));
	}

	/**
 Get lines in a region.
 @return {Array<MsAst>}
 */

	function parseLinesFromBlock(tokens) {
		const h = tokens.head();
		(0, _context.check)(tokens.size() > 1 && tokens.size() === 2 && (0, _Token.isGroup)(_Token.Groups.Block, tokens.second()), h.loc, () => `Expected indented block after ${ h }, and nothing else.`);
		const block = tokens.second();

		const lines = [];
		for (const line of _Slice2.default.group(block).slices()) lines.push.apply(lines, _toConsumableArray((0, _parseLine.parseLineOrLines)(line)));
		return lines;
	}

	/** Parse a {@link BlockDo}. */

	function parseBlockDo(tokens) {
		var _tryTakeComment = (0, _tryTakeComment5.default)(tokens);

		var _tryTakeComment2 = _slicedToArray(_tryTakeComment, 2);

		const opComment = _tryTakeComment2[0];
		const rest = _tryTakeComment2[1];

		const lines = plainBlockLines(rest);
		return new _MsAst.BlockDo(tokens.loc, opComment, lines);
	}

	/** Parse a {@link BlockVal}. */

	function parseBlockVal(tokens) {
		var _tryTakeComment3 = (0, _tryTakeComment5.default)(tokens);

		var _tryTakeComment32 = _slicedToArray(_tryTakeComment3, 2);

		const opComment = _tryTakeComment32[0];
		const rest = _tryTakeComment32[1];

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

	/**
 Parse the body of a module.
 @return {Array<MsAst>}
 */

	function parseModuleBlock(tokens) {
		var _parseBlockLines2 = parseBlockLines(tokens, true);

		const lines = _parseBlockLines2.lines;
		const returnKind = _parseBlockLines2.returnKind;

		const opComment = null;
		const loc = tokens.loc;
		switch (returnKind) {
			case Returns.Bag:case Returns.Map:
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
			// TODO: if Region, loop over its lines
			if (line instanceof _MsAst.BagEntry) isBag = true;else if (line instanceof _MsAst.MapEntry) isMap = true;else if (line instanceof _MsAst.ObjEntry) isObj = true;
		};
		const lines = plainBlockLines(lineTokens);
		for (const _ of lines) checkLine(_);

		(0, _context.check)(!(isObj && isBag), lines.loc, 'Block has both Bag and Obj lines.');
		(0, _context.check)(!(isObj && isMap), lines.loc, 'Block has both Obj and Map lines.');
		(0, _context.check)(!(isBag && isMap), lines.loc, 'Block has both Bag and Map lines.');

		const returnKind = isObj ? Returns.Obj : isBag ? Returns.Bag : isMap ? Returns.Map : Returns.Plain;
		return { lines, returnKind };
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQmxvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWdCTyxVQUFTLGNBQWMsQ0FBQyxNQUFNLEVBQUU7QUFDdEMsY0FWbUIsYUFBYSxFQVVsQixNQUFNLEVBQUUsNkJBQTZCLENBQUMsQ0FBQTtBQUNwRCxRQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDM0IsZUFsQk8sS0FBSyxFQWtCTixXQWRTLE9BQU8sRUFjUixPQWRQLE1BQU0sQ0FjUSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSw2QkFBNkIsQ0FBQyxDQUFBO0FBQzdFLFNBQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsZ0JBQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7RUFDM0M7Ozs7QUFHTSxVQUFTLGNBQWMsQ0FBQyxNQUFNLEVBQUU7QUFDdEMsU0FBTyxXQXRCUSxTQUFTLENBc0JILE1BQU0sQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7RUFDdkQ7Ozs7Ozs7Ozs7OztBQVdNLFVBQVMsU0FBUyxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUU7d0JBQ3RCLGNBQWMsQ0FBQyxNQUFNLENBQUM7Ozs7UUFBdkMsTUFBTTtRQUFFLEtBQUs7O0FBQ3BCLGNBaENPLFVBQVUsRUFnQ04sTUFBTSxFQUFFLE1BQ2xCLENBQUMsZ0NBQWdDLEdBQUUsa0JBeEM3QixJQUFJLEVBd0M4QixXQW5DakIsV0FBVyxFQW1Da0IsV0FBVyxDQUFDLENBQUMsRUFBQyxXQUFXLENBQUMsQ0FBQyxDQUFBO0FBQ2hGLFNBQU8sS0FBSyxDQUFBO0VBQ1o7Ozs7QUFHTSxVQUFTLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDakQsU0FBTyxZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFBO0VBQy9DOzs7O0FBR00sVUFBUyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQ2xELFNBQU8sYUFBYSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQTtFQUNoRDs7Ozs7OztBQU1NLFVBQVMsbUJBQW1CLENBQUMsTUFBTSxFQUFFO0FBQzNDLFFBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUN2QixlQTNETyxLQUFLLEVBMkROLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxXQXZEbkMsT0FBTyxFQXVEb0MsT0F2RG5ELE1BQU0sQ0F1RG9ELEtBQUssRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFDdkYsQ0FBQyxDQUFDLEdBQUcsRUFBRSxNQUNQLENBQUMsOEJBQThCLEdBQUUsQ0FBQyxFQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQTtBQUN6RCxRQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUE7O0FBRTdCLFFBQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQTtBQUNoQixPQUFLLE1BQU0sSUFBSSxJQUFJLGdCQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFDN0MsS0FBSyxDQUFDLElBQUksTUFBQSxDQUFWLEtBQUsscUJBQVMsZUEzREcsZ0JBQWdCLEVBMkRGLElBQUksQ0FBQyxFQUFDLENBQUE7QUFDdEMsU0FBTyxLQUFLLENBQUE7RUFDWjs7OztBQUdNLFVBQVMsWUFBWSxDQUFDLE1BQU0sRUFBRTt3QkFDViw4QkFBZSxNQUFNLENBQUM7Ozs7UUFBekMsU0FBUztRQUFFLElBQUk7O0FBQ3RCLFFBQU0sS0FBSyxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNuQyxTQUFPLFdBekVrQyxPQUFPLENBeUU3QixNQUFNLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQTtFQUNoRDs7OztBQUdNLFVBQVMsYUFBYSxDQUFDLE1BQU0sRUFBRTt5QkFDWCw4QkFBZSxNQUFNLENBQUM7Ozs7UUFBekMsU0FBUztRQUFFLElBQUk7O3lCQUNNLGVBQWUsQ0FBQyxJQUFJLENBQUM7O1FBQTFDLEtBQUssb0JBQUwsS0FBSztRQUFFLFVBQVUsb0JBQVYsVUFBVTs7QUFDeEIsVUFBUSxVQUFVO0FBQ2pCLFFBQUssT0FBTyxDQUFDLEdBQUc7QUFDZixXQUFPLFdBbEZzQixRQUFRLENBa0ZqQixNQUFNLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQTtBQUFBLEFBQ2xELFFBQUssT0FBTyxDQUFDLEdBQUc7QUFDZixXQUFPLFdBcEZtRCxRQUFRLENBb0Y5QyxNQUFNLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQTtBQUFBLEFBQ2xELFFBQUssT0FBTyxDQUFDLEdBQUc7QUFDZixXQUFPLFdBdEZ5QyxRQUFRLENBc0ZwQyxNQUFNLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQTtBQUFBLEFBQ2xEO0FBQVM7QUFDUixrQkF6RkssS0FBSyxFQXlGSixDQUFDLFVBcEZGLE9BQU8sRUFvRkcsS0FBSyxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFBO0FBQ3RFLFdBQU0sR0FBRyxHQUFHLFVBckZFLElBQUksRUFxRkQsS0FBSyxDQUFDLENBQUE7QUFDdkIsU0FBSSxHQUFHLG1CQXhGaUIsS0FBSyxBQXdGTCxFQUN2QixPQUFPLFdBMUZWLGFBQWEsQ0EwRmUsTUFBTSxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsVUF2RjdCLEtBQUssRUF1RjhCLEtBQUssQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBLEtBQzlEO0FBQ0osbUJBOUZJLEtBQUssRUE4RkgsR0FBRyxtQkEzRnFCLEdBQUcsQUEyRlQsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLGtDQUFrQyxDQUFDLENBQUE7QUFDdEUsYUFBTyxXQTlGNEQsY0FBYyxDQThGdkQsTUFBTSxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsVUExRjlCLEtBQUssRUEwRitCLEtBQUssQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO01BQ25FO0tBQ0Q7QUFBQSxHQUNEO0VBQ0Q7Ozs7Ozs7QUFNTSxVQUFTLGdCQUFnQixDQUFDLE1BQU0sRUFBRTswQkFDWixlQUFlLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQzs7UUFBbEQsS0FBSyxxQkFBTCxLQUFLO1FBQUUsVUFBVSxxQkFBVixVQUFVOztBQUN4QixRQUFNLFNBQVMsR0FBRyxJQUFJLENBQUE7QUFDdEIsUUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQTtBQUN0QixVQUFRLFVBQVU7QUFDakIsUUFBSyxPQUFPLENBQUMsR0FBRyxDQUFDLEFBQUMsS0FBSyxPQUFPLENBQUMsR0FBRztBQUFFO0FBQ25DLFdBQU0sR0FBRyxHQUFHLFVBQVUsS0FBSyxPQUFPLENBQUMsR0FBRyxVQTlHVCxRQUFRLFVBQXFCLFFBQVEsQUE4R04sQ0FBQTtBQUM1RCxXQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFBO0FBQzVDLFdBQU0sR0FBRyxHQUFHLFdBL0dDLFNBQVMsQ0ErR0ksR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFBO0FBQ3JDLFdBQU0sUUFBUSxHQUFHLE9BaEhPLFlBQVksQ0FnSE4sS0FBSyxDQUFDLEdBQUcsRUFBRSxTQWxIN0IsT0FBTyxDQWtIOEIsVUFBVSxFQUFFLENBQUMsQ0FBQTtBQUM5RCxXQUFNLE1BQU0sR0FBRyxXQWxIVixZQUFZLENBa0hlLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDbkQsWUFBTyxDQUFDLFdBbEh3QyxtQkFBbUIsQ0FrSG5DLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFBO0tBQzdDO0FBQUEsQUFDRCxRQUFLLE9BQU8sQ0FBQyxHQUFHO0FBQUU7QUFDakIsV0FBTSxVQUFVLEdBQUcsU0F2SFAsT0FBTyxDQXVIUSxVQUFVLEVBQUUsQ0FBQTs7Ozs7Ozs7O0FBU3ZDLFdBQU0sZ0JBQWdCLEdBQUcsSUFBSSxJQUFJO0FBQ2hDLFVBQUksSUFBSSxtQkE5SFgsUUFBUSxBQThIdUIsRUFBRTtBQUM3QixvQkFsSUcsS0FBSyxFQWtJRixJQUFJLG1CQS9ISixjQUFjLEFBK0hnQixFQUFFLElBQUksQ0FBQyxHQUFHLEVBQzdDLHFDQUFxQyxDQUFDLENBQUE7QUFDdkMsb0JBcElHLEtBQUssRUFvSUYsSUFBSSxDQUFDLE1BQU0sbUJBbklkLFlBQVksQUFtSTBCLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFDbEQsNkNBQTZDLENBQUMsQ0FBQTtBQUMvQyxjQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxVQUFVLEdBQzlDLFdBckk2QyxtQkFBbUIsQ0FxSXhDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUM5QyxXQXRJa0UsaUJBQWlCLENBc0k3RCxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtPQUM3Qzs7QUFFRCxhQUFPLElBQUksQ0FBQTtNQUNYLENBQUE7O0FBRUQsWUFBTyxLQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUE7S0FDbEM7QUFBQSxBQUNEO0FBQVM7MkJBQytCLGNBQWMsQ0FBQyxLQUFLLENBQUM7Ozs7V0FBckQsV0FBVztXQUFFLGVBQWU7O0FBQ25DLFNBQUksZUFBZSxLQUFLLElBQUksRUFBRTtBQUM3QixZQUFNLENBQUMsR0FBRyxlQUFlLENBQUE7QUFDekIsaUJBQVcsQ0FBQyxJQUFJLENBQUMsV0FsSjhCLG1CQUFtQixDQWtKekIsQ0FBQyxDQUFDLEdBQUcsRUFDN0MsV0FwSkcsWUFBWSxDQW9KRSxDQUFDLENBQUMsR0FBRyxFQUNyQixPQXBKcUIsWUFBWSxDQW9KcEIsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsU0F0Si9CLE9BQU8sQ0FzSmdDLFVBQVUsRUFBRSxDQUFDLEVBQzdELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtNQUNOO0FBQ0QsWUFBTyxXQUFXLENBQUE7S0FDbEI7QUFBQSxHQUNEO0VBQ0Q7O0FBRUQsVUFBUyxjQUFjLENBQUMsS0FBSyxFQUFFO0FBQzlCLFNBQU8sQ0FBQyxVQTFKRCxPQUFPLEVBMEpFLEtBQUssQ0FBQyxJQUFJLFVBMUpWLElBQUksRUEwSlcsS0FBSyxDQUFDLG1CQTVKSixHQUFHLEFBNEpnQixHQUNuRCxDQUFDLFVBM0pvQixLQUFLLEVBMkpuQixLQUFLLENBQUMsRUFBRSxVQTNKQSxJQUFJLEVBMkpDLEtBQUssQ0FBQyxDQUFDLEdBQzNCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFBO0VBQ2Q7O0FBRUQsVUFBUyxlQUFlLENBQUMsVUFBVSxFQUFFO0FBQ3BDLFFBQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQTtBQUNoQixRQUFNLE9BQU8sR0FBRyxJQUFJLElBQUk7QUFDdkIsT0FBSSxJQUFJLFlBQVksS0FBSyxFQUN4QixLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFDbkIsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBLEtBRVgsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtHQUNqQixDQUFBO0FBQ0QsT0FBSyxNQUFNLENBQUMsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQ2xDLE9BQU8sQ0FBQyx5QkFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3RCLFNBQU8sS0FBSyxDQUFBO0VBQ1o7O0FBRUQsT0FBTSxPQUFPLEdBQUc7QUFDZixPQUFLLEVBQUUsQ0FBQztBQUNSLEtBQUcsRUFBRSxDQUFDO0FBQ04sS0FBRyxFQUFFLENBQUM7QUFDTixLQUFHLEVBQUUsQ0FBQztFQUNOLENBQUE7O0FBRUQsVUFBUyxlQUFlLENBQUMsVUFBVSxFQUFFO0FBQ25DLE1BQUksS0FBSyxHQUFHLEtBQUs7TUFBRSxLQUFLLEdBQUcsS0FBSztNQUFFLEtBQUssR0FBRyxLQUFLLENBQUE7QUFDaEQsUUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJOztBQUV6QixPQUFJLElBQUksbUJBNUxZLFFBQVEsQUE0TEEsRUFDM0IsS0FBSyxHQUFHLElBQUksQ0FBQSxLQUNSLElBQUksSUFBSSxtQkE3TDBCLFFBQVEsQUE2TGQsRUFDaEMsS0FBSyxHQUFHLElBQUksQ0FBQSxLQUNSLElBQUksSUFBSSxtQkE5TGQsUUFBUSxBQThMMEIsRUFDaEMsS0FBSyxHQUFHLElBQUksQ0FBQTtHQUNiLENBQUE7QUFDRCxRQUFNLEtBQUssR0FBRyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDekMsT0FBSyxNQUFNLENBQUMsSUFBSSxLQUFLLEVBQ3BCLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQTs7QUFFYixlQXhNTyxLQUFLLEVBd01OLEVBQUUsS0FBSyxJQUFJLEtBQUssQ0FBQSxBQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFBO0FBQ3hFLGVBek1PLEtBQUssRUF5TU4sRUFBRSxLQUFLLElBQUksS0FBSyxDQUFBLEFBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLG1DQUFtQyxDQUFDLENBQUE7QUFDeEUsZUExTU8sS0FBSyxFQTBNTixFQUFFLEtBQUssSUFBSSxLQUFLLENBQUEsQUFBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsbUNBQW1DLENBQUMsQ0FBQTs7QUFFeEUsUUFBTSxVQUFVLEdBQ2YsS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQTtBQUNoRixTQUFPLEVBQUMsS0FBSyxFQUFFLFVBQVUsRUFBQyxDQUFBO0VBQzFCIiwiZmlsZSI6InBhcnNlQmxvY2suanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2ssIG9wdGlvbnN9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0Fzc2lnblNpbmdsZSwgQmFnRW50cnksIEJsb2NrQmFnLCBCbG9ja0RvLCBCbG9ja09iaiwgQmxvY2tNYXAsIEJsb2NrVmFsUmV0dXJuLFxuXHRCbG9ja1ZhbFRocm93LCBCbG9ja1dyYXAsIExvY2FsRGVjbGFyZSwgTWFwRW50cnksIE1vZHVsZUV4cG9ydERlZmF1bHQsIE1vZHVsZUV4cG9ydE5hbWVkLFxuXHRPYmpFbnRyeSwgT2JqRW50cnlBc3NpZ24sIFRocm93LCBWYWx9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtHcm91cHMsIGlzR3JvdXAsIGtleXdvcmROYW1lfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aXNFbXB0eSwgbGFzdCwgcnRhaWx9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2NoZWNrRW1wdHksIGNoZWNrTm9uRW1wdHl9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHBhcnNlTGluZSwge3BhcnNlTGluZU9yTGluZXN9IGZyb20gJy4vcGFyc2VMaW5lJ1xuaW1wb3J0IHRyeVRha2VDb21tZW50IGZyb20gJy4vdHJ5VGFrZUNvbW1lbnQnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLyoqXG5Ub2tlbnMgb24gdGhlIGxpbmUgYmVmb3JlIGEgYmxvY2ssIGFuZCB0b2tlbnMgZm9yIHRoZSBibG9jayBpdHNlbGYuXG5AcmV0dXJuIHtbU2xpY2UsIFNsaWNlXX1cbiovXG5leHBvcnQgZnVuY3Rpb24gYmVmb3JlQW5kQmxvY2sodG9rZW5zKSB7XG5cdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAnRXhwZWN0ZWQgYW4gaW5kZW50ZWQgYmxvY2suJylcblx0Y29uc3QgYmxvY2sgPSB0b2tlbnMubGFzdCgpXG5cdGNoZWNrKGlzR3JvdXAoR3JvdXBzLkJsb2NrLCBibG9jayksIGJsb2NrLmxvYywgJ0V4cGVjdGVkIGFuIGluZGVudGVkIGJsb2NrLicpXG5cdHJldHVybiBbdG9rZW5zLnJ0YWlsKCksIFNsaWNlLmdyb3VwKGJsb2NrKV1cbn1cblxuLyoqIFBhcnNlIGEgQmxvY2sgYXMgYSBzaW5nbGUgdmFsdWUuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCbG9ja1dyYXAodG9rZW5zKSB7XG5cdHJldHVybiBuZXcgQmxvY2tXcmFwKHRva2Vucy5sb2MsIHBhcnNlQmxvY2tWYWwodG9rZW5zKSlcbn1cblxuLyoqXG5QYXJzZSBhIGJsb2NrLCB0aHJvd2luZyBhbiBlcnJvciBpZiB0aGVyZSdzIGFueXRoaW5nIGJlZm9yZSB0aGUgYmxvY2suXG5AcGFyYW0ge0tleXdvcmRzfSBrZXl3b3JkS2luZCBLZXl3b3JkIHRoYXQgcHJlY2VkZXMgdGhlIGJsb2NrLiBVc2VkIGZvciBlcnJvciBtZXNzYWdlLlxuQHBhcmFtIHtTbGljZX0gdG9rZW5zXG5cdFRva2VucyB3aGljaCBzaG91bGQgY29udGFpbiBhIGJsb2NrLlxuXHRVbmxpa2Uge0BsaW5rIHBhcnNlQmxvY2tEb30sIHRoZXNlIGFyZSAqbm90KiB0aGUgdG9rZW5zICp3aXRoaW4qIHRoZSBibG9jay5cblx0VGhlc2UgdG9rZW5zIGFyZSAqZXhwZWN0ZWQqIHRvIGp1c3QgYmUgYSB7QGxpbmsgR3JvdXBzLkJsb2NrfS5cblx0KElmIHRoZXJlJ3MgYW55dGhpbmcgZWxzZSwgYSB7QGxpbmsgQ29tcGlsZUVycm9yfSB3aWxsIGJlIHRocm93bi4pXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGp1c3RCbG9jayhrZXl3b3JkS2luZCwgdG9rZW5zKSB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0Y2hlY2tFbXB0eShiZWZvcmUsICgpID0+XG5cdFx0YERpZCBub3QgZXhwZWN0IGFueXRoaW5nIGJldHdlZW4gJHtjb2RlKGtleXdvcmROYW1lKGtleXdvcmRLaW5kKSl9IGFuZCBibG9jay5gKVxuXHRyZXR1cm4gYmxvY2tcbn1cblxuLyoqIFBhcnNlIGEge0BsaW5rIEJsb2NrRG99LCBmYWlsaW5nIGlmIHRoZXJlJ3Mgc29tZXRoaW5nIHByZWNlZGluZyBpdC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUp1c3RCbG9ja0RvKGtleXdvcmQsIHRva2Vucykge1xuXHRyZXR1cm4gcGFyc2VCbG9ja0RvKGp1c3RCbG9jayhrZXl3b3JkLCB0b2tlbnMpKVxufVxuXG4vKiogUGFyc2UgYSB7QGxpbmsgQmxvY2tWYWx9LCBmYWlsaW5nIGlmIHRoZXJlJ3Mgc29tZXRoaW5nIHByZWNlZGluZyBpdC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUp1c3RCbG9ja1ZhbChrZXl3b3JkLCB0b2tlbnMpIHtcblx0cmV0dXJuIHBhcnNlQmxvY2tWYWwoanVzdEJsb2NrKGtleXdvcmQsIHRva2VucykpXG59XG5cbi8qKlxuR2V0IGxpbmVzIGluIGEgcmVnaW9uLlxuQHJldHVybiB7QXJyYXk8TXNBc3Q+fVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxpbmVzRnJvbUJsb2NrKHRva2Vucykge1xuXHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXHRjaGVjayh0b2tlbnMuc2l6ZSgpID4gMSAmJiB0b2tlbnMuc2l6ZSgpID09PSAyICYmIGlzR3JvdXAoR3JvdXBzLkJsb2NrLCB0b2tlbnMuc2Vjb25kKCkpLFxuXHRcdGgubG9jLCAoKSA9PlxuXHRcdGBFeHBlY3RlZCBpbmRlbnRlZCBibG9jayBhZnRlciAke2h9LCBhbmQgbm90aGluZyBlbHNlLmApXG5cdGNvbnN0IGJsb2NrID0gdG9rZW5zLnNlY29uZCgpXG5cblx0Y29uc3QgbGluZXMgPSBbXVxuXHRmb3IgKGNvbnN0IGxpbmUgb2YgU2xpY2UuZ3JvdXAoYmxvY2spLnNsaWNlcygpKVxuXHRcdGxpbmVzLnB1c2goLi4ucGFyc2VMaW5lT3JMaW5lcyhsaW5lKSlcblx0cmV0dXJuIGxpbmVzXG59XG5cbi8qKiBQYXJzZSBhIHtAbGluayBCbG9ja0RvfS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUJsb2NrRG8odG9rZW5zKSB7XG5cdGNvbnN0IFtvcENvbW1lbnQsIHJlc3RdID0gdHJ5VGFrZUNvbW1lbnQodG9rZW5zKVxuXHRjb25zdCBsaW5lcyA9IHBsYWluQmxvY2tMaW5lcyhyZXN0KVxuXHRyZXR1cm4gbmV3IEJsb2NrRG8odG9rZW5zLmxvYywgb3BDb21tZW50LCBsaW5lcylcbn1cblxuLyoqIFBhcnNlIGEge0BsaW5rIEJsb2NrVmFsfS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUJsb2NrVmFsKHRva2Vucykge1xuXHRjb25zdCBbb3BDb21tZW50LCByZXN0XSA9IHRyeVRha2VDb21tZW50KHRva2Vucylcblx0Y29uc3Qge2xpbmVzLCByZXR1cm5LaW5kfSA9IHBhcnNlQmxvY2tMaW5lcyhyZXN0KVxuXHRzd2l0Y2ggKHJldHVybktpbmQpIHtcblx0XHRjYXNlIFJldHVybnMuQmFnOlxuXHRcdFx0cmV0dXJuIG5ldyBCbG9ja0JhZyh0b2tlbnMubG9jLCBvcENvbW1lbnQsIGxpbmVzKVxuXHRcdGNhc2UgUmV0dXJucy5NYXA6XG5cdFx0XHRyZXR1cm4gbmV3IEJsb2NrTWFwKHRva2Vucy5sb2MsIG9wQ29tbWVudCwgbGluZXMpXG5cdFx0Y2FzZSBSZXR1cm5zLk9iajpcblx0XHRcdHJldHVybiBuZXcgQmxvY2tPYmoodG9rZW5zLmxvYywgb3BDb21tZW50LCBsaW5lcylcblx0XHRkZWZhdWx0OiB7XG5cdFx0XHRjaGVjayghaXNFbXB0eShsaW5lcyksIHRva2Vucy5sb2MsICdWYWx1ZSBibG9jayBtdXN0IGVuZCBpbiBhIHZhbHVlLicpXG5cdFx0XHRjb25zdCB2YWwgPSBsYXN0KGxpbmVzKVxuXHRcdFx0aWYgKHZhbCBpbnN0YW5jZW9mIFRocm93KVxuXHRcdFx0XHRyZXR1cm4gbmV3IEJsb2NrVmFsVGhyb3codG9rZW5zLmxvYywgb3BDb21tZW50LCBydGFpbChsaW5lcyksIHZhbClcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRjaGVjayh2YWwgaW5zdGFuY2VvZiBWYWwsIHZhbC5sb2MsICdWYWx1ZSBibG9jayBtdXN0IGVuZCBpbiBhIHZhbHVlLicpXG5cdFx0XHRcdHJldHVybiBuZXcgQmxvY2tWYWxSZXR1cm4odG9rZW5zLmxvYywgb3BDb21tZW50LCBydGFpbChsaW5lcyksIHZhbClcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuLyoqXG5QYXJzZSB0aGUgYm9keSBvZiBhIG1vZHVsZS5cbkByZXR1cm4ge0FycmF5PE1zQXN0Pn1cbiovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VNb2R1bGVCbG9jayh0b2tlbnMpIHtcblx0Y29uc3Qge2xpbmVzLCByZXR1cm5LaW5kfSA9IHBhcnNlQmxvY2tMaW5lcyh0b2tlbnMsIHRydWUpXG5cdGNvbnN0IG9wQ29tbWVudCA9IG51bGxcblx0Y29uc3QgbG9jID0gdG9rZW5zLmxvY1xuXHRzd2l0Y2ggKHJldHVybktpbmQpIHtcblx0XHRjYXNlIFJldHVybnMuQmFnOiBjYXNlIFJldHVybnMuTWFwOiB7XG5cdFx0XHRjb25zdCBjbHMgPSByZXR1cm5LaW5kID09PSBSZXR1cm5zLkJhZyA/IEJsb2NrQmFnIDogQmxvY2tNYXBcblx0XHRcdGNvbnN0IGJsb2NrID0gbmV3IGNscyhsb2MsIG9wQ29tbWVudCwgbGluZXMpXG5cdFx0XHRjb25zdCB2YWwgPSBuZXcgQmxvY2tXcmFwKGxvYywgYmxvY2spXG5cdFx0XHRjb25zdCBhc3NpZ25lZSA9IExvY2FsRGVjbGFyZS5wbGFpbihsb2MsIG9wdGlvbnMubW9kdWxlTmFtZSgpKVxuXHRcdFx0Y29uc3QgYXNzaWduID0gbmV3IEFzc2lnblNpbmdsZShsb2MsIGFzc2lnbmVlLCB2YWwpXG5cdFx0XHRyZXR1cm4gW25ldyBNb2R1bGVFeHBvcnREZWZhdWx0KGxvYywgYXNzaWduKV1cblx0XHR9XG5cdFx0Y2FzZSBSZXR1cm5zLk9iajoge1xuXHRcdFx0Y29uc3QgbW9kdWxlTmFtZSA9IG9wdGlvbnMubW9kdWxlTmFtZSgpXG5cblx0XHRcdC8vIE1vZHVsZSBleHBvcnRzIGxvb2sgbGlrZSBhIEJsb2NrT2JqLCAgYnV0IGFyZSByZWFsbHkgZGlmZmVyZW50LlxuXHRcdFx0Ly8gSW4gRVM2LCBtb2R1bGUgZXhwb3J0cyBtdXN0IGJlIGNvbXBsZXRlbHkgc3RhdGljLlxuXHRcdFx0Ly8gU28gd2Uga2VlcCBhbiBhcnJheSBvZiBleHBvcnRzIGF0dGFjaGVkIGRpcmVjdGx5IHRvIHRoZSBNb2R1bGUgYXN0LlxuXHRcdFx0Ly8gSWYgeW91IHdyaXRlOlxuXHRcdFx0Ly9cdGlmISBjb25kXG5cdFx0XHQvL1x0XHRhLiBiXG5cdFx0XHQvLyBpbiBhIG1vZHVsZSBjb250ZXh0LCBpdCB3aWxsIGJlIGFuIGVycm9yLiAoVGhlIG1vZHVsZSBjcmVhdGVzIG5vIGBidWlsdGAgbG9jYWwuKVxuXHRcdFx0Y29uc3QgY29udmVydFRvRXhwb3J0cyA9IGxpbmUgPT4ge1xuXHRcdFx0XHRpZiAobGluZSBpbnN0YW5jZW9mIE9iakVudHJ5KSB7XG5cdFx0XHRcdFx0Y2hlY2sobGluZSBpbnN0YW5jZW9mIE9iakVudHJ5QXNzaWduLCBsaW5lLmxvYyxcblx0XHRcdFx0XHRcdCdNb2R1bGUgZXhwb3J0cyBjYW4gbm90IGJlIGNvbXB1dGVkLicpXG5cdFx0XHRcdFx0Y2hlY2sobGluZS5hc3NpZ24gaW5zdGFuY2VvZiBBc3NpZ25TaW5nbGUsIGxpbmUubG9jLFxuXHRcdFx0XHRcdFx0J0V4cG9ydCBBc3NpZ25EZXN0cnVjdHVyZSBub3QgeWV0IHN1cHBvcnRlZC4nKVxuXHRcdFx0XHRcdHJldHVybiBsaW5lLmFzc2lnbi5hc3NpZ25lZS5uYW1lID09PSBtb2R1bGVOYW1lID9cblx0XHRcdFx0XHRcdG5ldyBNb2R1bGVFeHBvcnREZWZhdWx0KGxpbmUubG9jLCBsaW5lLmFzc2lnbikgOlxuXHRcdFx0XHRcdFx0bmV3IE1vZHVsZUV4cG9ydE5hbWVkKGxpbmUubG9jLCBsaW5lLmFzc2lnbilcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBUT0RPOiBJZiBSZWdpb24sIGxpbmUubGluZXMgPSBsaW5lLmxpbmVzLm1hcChjb252ZXJ0VG9FeHBvcnRzKVxuXHRcdFx0XHRyZXR1cm4gbGluZVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbGluZXMubWFwKGNvbnZlcnRUb0V4cG9ydHMpXG5cdFx0fVxuXHRcdGRlZmF1bHQ6IHtcblx0XHRcdGNvbnN0IFttb2R1bGVMaW5lcywgb3BEZWZhdWx0RXhwb3J0XSA9IHRyeVRha2VMYXN0VmFsKGxpbmVzKVxuXHRcdFx0aWYgKG9wRGVmYXVsdEV4cG9ydCAhPT0gbnVsbCkge1xuXHRcdFx0XHRjb25zdCBfID0gb3BEZWZhdWx0RXhwb3J0XG5cdFx0XHRcdG1vZHVsZUxpbmVzLnB1c2gobmV3IE1vZHVsZUV4cG9ydERlZmF1bHQoXy5sb2MsXG5cdFx0XHRcdFx0bmV3IEFzc2lnblNpbmdsZShfLmxvYyxcblx0XHRcdFx0XHRcdExvY2FsRGVjbGFyZS5wbGFpbihvcERlZmF1bHRFeHBvcnQubG9jLCBvcHRpb25zLm1vZHVsZU5hbWUoKSksXG5cdFx0XHRcdFx0XHRfKSkpXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbW9kdWxlTGluZXNcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gdHJ5VGFrZUxhc3RWYWwobGluZXMpIHtcblx0cmV0dXJuICFpc0VtcHR5KGxpbmVzKSAmJiBsYXN0KGxpbmVzKSBpbnN0YW5jZW9mIFZhbCA/XG5cdFx0W3J0YWlsKGxpbmVzKSwgbGFzdChsaW5lcyldIDpcblx0XHRbbGluZXMsIG51bGxdXG59XG5cbmZ1bmN0aW9uIHBsYWluQmxvY2tMaW5lcyhsaW5lVG9rZW5zKSB7XG5cdGNvbnN0IGxpbmVzID0gW11cblx0Y29uc3QgYWRkTGluZSA9IGxpbmUgPT4ge1xuXHRcdGlmIChsaW5lIGluc3RhbmNlb2YgQXJyYXkpXG5cdFx0XHRmb3IgKGNvbnN0IF8gb2YgbGluZSlcblx0XHRcdFx0YWRkTGluZShfKVxuXHRcdGVsc2Vcblx0XHRcdGxpbmVzLnB1c2gobGluZSlcblx0fVxuXHRmb3IgKGNvbnN0IF8gb2YgbGluZVRva2Vucy5zbGljZXMoKSlcblx0XHRhZGRMaW5lKHBhcnNlTGluZShfKSlcblx0cmV0dXJuIGxpbmVzXG59XG5cbmNvbnN0IFJldHVybnMgPSB7XG5cdFBsYWluOiAwLFxuXHRPYmo6IDEsXG5cdEJhZzogMixcblx0TWFwOiAzXG59XG5cbmZ1bmN0aW9uIHBhcnNlQmxvY2tMaW5lcyhsaW5lVG9rZW5zKSB7XG5cdFx0bGV0IGlzQmFnID0gZmFsc2UsIGlzTWFwID0gZmFsc2UsIGlzT2JqID0gZmFsc2Vcblx0Y29uc3QgY2hlY2tMaW5lID0gbGluZSA9PiB7XG5cdFx0Ly8gVE9ETzogaWYgUmVnaW9uLCBsb29wIG92ZXIgaXRzIGxpbmVzXG5cdFx0aWYgKGxpbmUgaW5zdGFuY2VvZiBCYWdFbnRyeSlcblx0XHRcdGlzQmFnID0gdHJ1ZVxuXHRcdGVsc2UgaWYgKGxpbmUgaW5zdGFuY2VvZiBNYXBFbnRyeSlcblx0XHRcdGlzTWFwID0gdHJ1ZVxuXHRcdGVsc2UgaWYgKGxpbmUgaW5zdGFuY2VvZiBPYmpFbnRyeSlcblx0XHRcdGlzT2JqID0gdHJ1ZVxuXHR9XG5cdGNvbnN0IGxpbmVzID0gcGxhaW5CbG9ja0xpbmVzKGxpbmVUb2tlbnMpXG5cdGZvciAoY29uc3QgXyBvZiBsaW5lcylcblx0XHRjaGVja0xpbmUoXylcblxuXHRjaGVjayghKGlzT2JqICYmIGlzQmFnKSwgbGluZXMubG9jLCAnQmxvY2sgaGFzIGJvdGggQmFnIGFuZCBPYmogbGluZXMuJylcblx0Y2hlY2soIShpc09iaiAmJiBpc01hcCksIGxpbmVzLmxvYywgJ0Jsb2NrIGhhcyBib3RoIE9iaiBhbmQgTWFwIGxpbmVzLicpXG5cdGNoZWNrKCEoaXNCYWcgJiYgaXNNYXApLCBsaW5lcy5sb2MsICdCbG9jayBoYXMgYm90aCBCYWcgYW5kIE1hcCBsaW5lcy4nKVxuXG5cdGNvbnN0IHJldHVybktpbmQgPVxuXHRcdGlzT2JqID8gUmV0dXJucy5PYmogOiBpc0JhZyA/IFJldHVybnMuQmFnIDogaXNNYXAgPyBSZXR1cm5zLk1hcCA6IFJldHVybnMuUGxhaW5cblx0cmV0dXJuIHtsaW5lcywgcmV0dXJuS2luZH1cbn1cbiJdfQ==
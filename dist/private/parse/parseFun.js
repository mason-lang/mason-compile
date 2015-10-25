(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', '../MsAst', '../Token', '../util', './checks', './parseBlock', './parseCase', './parseLocalDeclares', './parseSpaced', './parseSwitch', './Slice'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports, require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parseBlock'), require('./parseCase'), require('./parseLocalDeclares'), require('./parseSpaced'), require('./parseSwitch'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst, global.Token, global.util, global.checks, global.parseBlock, global.parseCase, global.parseLocalDeclares, global.parseSpaced, global.parseSwitch, global.Slice);
		global.parseFun = mod.exports;
	}
})(this, function (exports, _MsAst, _Token, _util, _checks, _parseBlock, _parseCase, _parseLocalDeclares, _parseSpaced, _parseSwitch, _Slice) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	exports.default = parseFun;
	exports.funArgsAndBlock = funArgsAndBlock;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseCase2 = _interopRequireDefault(_parseCase);

	var _parseLocalDeclares2 = _interopRequireDefault(_parseLocalDeclares);

	var _parseSpaced2 = _interopRequireDefault(_parseSpaced);

	var _parseSwitch2 = _interopRequireDefault(_parseSwitch);

	var _Slice2 = _interopRequireDefault(_Slice);

	/**
 Parse a function.
 @param kind {Keywords} A function keyword.
 @param {Slice} tokens Rest of the line after the function keyword.
 @return {Fun}
 */

	function parseFun(keywordKind, tokens) {
		var _funKind = funKind(keywordKind);

		var _funKind2 = _slicedToArray(_funKind, 3);

		const isThis = _funKind2[0];
		const isDo = _funKind2[1];
		const kind = _funKind2[2];

		var _tryTakeReturnType = tryTakeReturnType(tokens);

		const opReturnType = _tryTakeReturnType.opReturnType;
		const rest = _tryTakeReturnType.rest;

		var _funArgsAndBlock = funArgsAndBlock(rest, isDo);

		const args = _funArgsAndBlock.args;
		const opRestArg = _funArgsAndBlock.opRestArg;
		const block = _funArgsAndBlock.block;

		return new _MsAst.Fun(tokens.loc, args, opRestArg, block, kind, isThis, opReturnType);
	}

	/**
 Parse function arguments and body.
 This also handles the `|case` and `|switch` forms.
 @param {Slice} tokens
 @param {boolean} isDo Whether this is a `!|`
 @param {includeMemberArgs}
 	This is for constructors.
 	If true, output will include `memberArgs`.
 	This is the subset of `args` whose names are prefixed with `.`.
 	e.g.: `construct! .x .y`
 @return {
 	args: Array<LocalDeclare>,
 	opRestArg: ?LocalDeclare,
 	memberArgs:Array<LocalDeclare>,
 	block: Block
 }
 */

	function funArgsAndBlock(tokens, isDo) {
		let includeMemberArgs = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

		(0, _checks.checkNonEmpty)(tokens, 'Expected an indented block.');
		const h = tokens.head();

		// Might be `|case` (or `|case!`, `|switch`, `|switch!`)
		if ((0, _Token.isAnyKeyword)(funFocusKeywords, h)) {
			const isVal = h.kind === _Token.Keywords.CaseVal || h.kind === _Token.Keywords.SwitchVal;
			const isCase = h.kind === _Token.Keywords.CaseVal || h.kind === _Token.Keywords.CaseDo;
			const expr = (isCase ? _parseCase2.default : _parseSwitch2.default)(isVal, true, tokens.tail());

			const args = [_MsAst.LocalDeclare.focus(h.loc)];
			return isVal ? {
				args, opRestArg: null, memberArgs: [],
				block: new _MsAst.BlockValReturn(tokens.loc, null, [], expr)
			} : {
				args, opRestArg: null, memberArgs: [],
				block: new _MsAst.BlockDo(tokens.loc, null, [expr])
			};
		} else {
			var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens);

			var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

			const before = _beforeAndBlock2[0];
			const blockLines = _beforeAndBlock2[1];

			var _parseFunLocals = parseFunLocals(before, includeMemberArgs);

			const args = _parseFunLocals.args;
			const opRestArg = _parseFunLocals.opRestArg;
			const memberArgs = _parseFunLocals.memberArgs;

			for (const arg of args) if (!arg.isLazy()) arg.kind = _MsAst.LocalDeclares.Mutable;
			const block = (isDo ? _parseBlock.parseBlockDo : _parseBlock.parseBlockVal)(blockLines);
			return { args, opRestArg, memberArgs, block };
		}
	}

	function funKind(keywordKind) {
		switch (keywordKind) {
			case _Token.Keywords.Fun:
				return [false, false, _MsAst.Funs.Plain];
			case _Token.Keywords.FunDo:
				return [false, true, _MsAst.Funs.Plain];
			case _Token.Keywords.FunThis:
				return [true, false, _MsAst.Funs.Plain];
			case _Token.Keywords.FunThisDo:
				return [true, true, _MsAst.Funs.Plain];
			case _Token.Keywords.FunAsync:
				return [false, false, _MsAst.Funs.Async];
			case _Token.Keywords.FunAsyncDo:
				return [false, true, _MsAst.Funs.Async];
			case _Token.Keywords.FunThisAsync:
				return [true, false, _MsAst.Funs.Async];
			case _Token.Keywords.FunThisAsyncDo:
				return [true, true, _MsAst.Funs.Async];
			case _Token.Keywords.FunGen:
				return [false, false, _MsAst.Funs.Generator];
			case _Token.Keywords.FunGenDo:
				return [false, true, _MsAst.Funs.Generator];
			case _Token.Keywords.FunThisGen:
				return [true, false, _MsAst.Funs.Generator];
			case _Token.Keywords.FunThisGenDo:
				return [true, true, _MsAst.Funs.Generator];
			default:
				throw new Error(keywordKind);
		}
	}

	function tryTakeReturnType(tokens) {
		if (!tokens.isEmpty()) {
			const h = tokens.head();
			if ((0, _Token.isGroup)(_Token.Groups.Space, h) && (0, _Token.isKeyword)(_Token.Keywords.Type, (0, _util.head)(h.subTokens))) return {
				opReturnType: (0, _parseSpaced2.default)(_Slice2.default.group(h).tail()),
				rest: tokens.tail()
			};
		}
		return { opReturnType: null, rest: tokens };
	}

	const funFocusKeywords = new Set([_Token.Keywords.CaseVal, _Token.Keywords.CaseDo, _Token.Keywords.SwitchVal, _Token.Keywords.SwitchDo]);

	function parseFunLocals(tokens, includeMemberArgs) {
		if (tokens.isEmpty()) return { args: [], memberArgs: [], opRestArg: null };else {
			let rest = tokens,
			    opRestArg = null;
			const l = tokens.last();
			if ((0, _Token.isGroup)(_Token.Groups.Space, l)) {
				const g = _Slice2.default.group(l);
				if ((0, _Token.isKeyword)(_Token.Keywords.Ellipsis, g.head())) {
					rest = tokens.rtail();
					opRestArg = (0, _parseLocalDeclares.parseLocalDeclareFromSpaced)(g.tail());
				}
			}
			if (includeMemberArgs) {
				var _parseLocalDeclaresAndMemberArgs = (0, _parseLocalDeclares.parseLocalDeclaresAndMemberArgs)(rest);

				const args = _parseLocalDeclaresAndMemberArgs.declares;
				const memberArgs = _parseLocalDeclaresAndMemberArgs.memberArgs;

				return { args, memberArgs, opRestArg };
			} else return { args: (0, _parseLocalDeclares2.default)(rest), opRestArg };
		}
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRnVuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFrQndCLFFBQVE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBakIsVUFBUyxRQUFRLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRTtpQkFDeEIsT0FBTyxDQUFDLFdBQVcsQ0FBQzs7OztRQUExQyxNQUFNO1FBQUUsSUFBSTtRQUFFLElBQUk7OzJCQUNJLGlCQUFpQixDQUFDLE1BQU0sQ0FBQzs7UUFBL0MsWUFBWSxzQkFBWixZQUFZO1FBQUUsSUFBSSxzQkFBSixJQUFJOzt5QkFDUSxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQzs7UUFBckQsSUFBSSxvQkFBSixJQUFJO1FBQUUsU0FBUyxvQkFBVCxTQUFTO1FBQUUsS0FBSyxvQkFBTCxLQUFLOztBQUM3QixTQUFPLFdBdEJ5QixHQUFHLENBc0JwQixNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUE7RUFDOUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJNLFVBQVMsZUFBZSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQTJCO01BQXpCLGlCQUFpQix5REFBQyxLQUFLOztBQUNwRSxjQXhDTyxhQUFhLEVBd0NOLE1BQU0sRUFBRSw2QkFBNkIsQ0FBQyxDQUFBO0FBQ3BELFFBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQTs7O0FBR3ZCLE1BQUksV0E5Q1csWUFBWSxFQThDVixnQkFBZ0IsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUN0QyxTQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLE9BL0N1QixRQUFRLENBK0N0QixPQUFPLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxPQS9DUixRQUFRLENBK0NTLFNBQVMsQ0FBQTtB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SyxFQUFFLENBQUE7QUFDckIsY0FBUyxHQUFHLHdCQTVIWSwyQkFBMkIsRUE0SFgsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7S0FDakQ7SUFDRDtBQUNELE9BQUksaUJBQWlCLEVBQUU7MkNBQ2Usd0JBaElpQiwrQkFBK0IsRUFnSWhCLElBQUksQ0FBQzs7VUFBekQsSUFBSSxvQ0FBZCxRQUFRO1VBQVEsVUFBVSxvQ0FBVixVQUFVOztBQUNqQyxXQUFPLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUMsQ0FBQTtJQUNwQyxNQUNBLE9BQU8sRUFBQyxJQUFJLEVBQUUsa0NBQW1CLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBQyxDQUFBO0dBQ25EO0VBQ0QiLCJmaWxlIjoicGFyc2VGdW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Jsb2NrRG8sIEJsb2NrVmFsUmV0dXJuLCBGdW4sIEZ1bnMsIExvY2FsRGVjbGFyZSwgTG9jYWxEZWNsYXJlc30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwcywgaXNBbnlLZXl3b3JkLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aGVhZH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tOb25FbXB0eX0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge2JlZm9yZUFuZEJsb2NrLCBwYXJzZUJsb2NrRG8sIHBhcnNlQmxvY2tWYWx9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZUNhc2UgZnJvbSAnLi9wYXJzZUNhc2UnXG5pbXBvcnQgcGFyc2VMb2NhbERlY2xhcmVzLCB7cGFyc2VMb2NhbERlY2xhcmVGcm9tU3BhY2VkLCBwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzXG5cdH0gZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5pbXBvcnQgcGFyc2VTcGFjZWQgZnJvbSAnLi9wYXJzZVNwYWNlZCdcbmltcG9ydCBwYXJzZVN3aXRjaCBmcm9tICcuL3BhcnNlU3dpdGNoJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8qKlxuUGFyc2UgYSBmdW5jdGlvbi5cbkBwYXJhbSBraW5kIHtLZXl3b3Jkc30gQSBmdW5jdGlvbiBrZXl3b3JkLlxuQHBhcmFtIHtTbGljZX0gdG9rZW5zIFJlc3Qgb2YgdGhlIGxpbmUgYWZ0ZXIgdGhlIGZ1bmN0aW9uIGtleXdvcmQuXG5AcmV0dXJuIHtGdW59XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VGdW4oa2V5d29yZEtpbmQsIHRva2Vucykge1xuXHRjb25zdCBbaXNUaGlzLCBpc0RvLCBraW5kXSA9IGZ1bktpbmQoa2V5d29yZEtpbmQpXG5cdGNvbnN0IHtvcFJldHVyblR5cGUsIHJlc3R9ID0gdHJ5VGFrZVJldHVyblR5cGUodG9rZW5zKVxuXHRjb25zdCB7YXJncywgb3BSZXN0QXJnLCBibG9ja30gPSBmdW5BcmdzQW5kQmxvY2socmVzdCwgaXNEbylcblx0cmV0dXJuIG5ldyBGdW4odG9rZW5zLmxvYywgYXJncywgb3BSZXN0QXJnLCBibG9jaywga2luZCwgaXNUaGlzLCBvcFJldHVyblR5cGUpXG59XG5cbi8qKlxuUGFyc2UgZnVuY3Rpb24gYXJndW1lbnRzIGFuZCBib2R5LlxuVGhpcyBhbHNvIGhhbmRsZXMgdGhlIGB8Y2FzZWAgYW5kIGB8c3dpdGNoYCBmb3Jtcy5cbkBwYXJhbSB7U2xpY2V9IHRva2Vuc1xuQHBhcmFtIHtib29sZWFufSBpc0RvIFdoZXRoZXIgdGhpcyBpcyBhIGAhfGBcbkBwYXJhbSB7aW5jbHVkZU1lbWJlckFyZ3N9XG5cdFRoaXMgaXMgZm9yIGNvbnN0cnVjdG9ycy5cblx0SWYgdHJ1ZSwgb3V0cHV0IHdpbGwgaW5jbHVkZSBgbWVtYmVyQXJnc2AuXG5cdFRoaXMgaXMgdGhlIHN1YnNldCBvZiBgYXJnc2Agd2hvc2UgbmFtZXMgYXJlIHByZWZpeGVkIHdpdGggYC5gLlxuXHRlLmcuOiBgY29uc3RydWN0ISAueCAueWBcbkByZXR1cm4ge1xuXHRhcmdzOiBBcnJheTxMb2NhbERlY2xhcmU+LFxuXHRvcFJlc3RBcmc6ID9Mb2NhbERlY2xhcmUsXG5cdG1lbWJlckFyZ3M6QXJyYXk8TG9jYWxEZWNsYXJlPixcblx0YmxvY2s6IEJsb2NrXG59XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGZ1bkFyZ3NBbmRCbG9jayh0b2tlbnMsIGlzRG8sIGluY2x1ZGVNZW1iZXJBcmdzPWZhbHNlKSB7XG5cdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAnRXhwZWN0ZWQgYW4gaW5kZW50ZWQgYmxvY2suJylcblx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKClcblxuXHQvLyBNaWdodCBiZSBgfGNhc2VgIChvciBgfGNhc2UhYCwgYHxzd2l0Y2hgLCBgfHN3aXRjaCFgKVxuXHRpZiAoaXNBbnlLZXl3b3JkKGZ1bkZvY3VzS2V5d29yZHMsIGgpKSB7XG5cdFx0Y29uc3QgaXNWYWwgPSBoLmtpbmQgPT09IEtleXdvcmRzLkNhc2VWYWwgfHwgaC5raW5kID09PSBLZXl3b3Jkcy5Td2l0Y2hWYWxcblx0XHRjb25zdCBpc0Nhc2UgPSBoLmtpbmQgPT09IEtleXdvcmRzLkNhc2VWYWwgfHwgaC5raW5kID09PSBLZXl3b3Jkcy5DYXNlRG9cblx0XHRjb25zdCBleHByID0gKGlzQ2FzZSA/IHBhcnNlQ2FzZSA6IHBhcnNlU3dpdGNoKShpc1ZhbCwgdHJ1ZSwgdG9rZW5zLnRhaWwoKSlcblxuXHRcdGNvbnN0IGFyZ3MgPSBbTG9jYWxEZWNsYXJlLmZvY3VzKGgubG9jKV1cblx0XHRyZXR1cm4gaXNWYWwgP1xuXHRcdFx0e1xuXHRcdFx0XHRhcmdzLCBvcFJlc3RBcmc6IG51bGwsIG1lbWJlckFyZ3M6IFtdLFxuXHRcdFx0XHRibG9jazogbmV3IEJsb2NrVmFsUmV0dXJuKHRva2Vucy5sb2MsIG51bGwsIFtdLCBleHByKVxuXHRcdFx0fSA6XG5cdFx0XHR7XG5cdFx0XHRcdGFyZ3MsIG9wUmVzdEFyZzogbnVsbCwgbWVtYmVyQXJnczogW10sXG5cdFx0XHRcdGJsb2NrOiBuZXcgQmxvY2tEbyh0b2tlbnMubG9jLCBudWxsLCBbZXhwcl0pXG5cdFx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tMaW5lc10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdFx0Y29uc3Qge2FyZ3MsIG9wUmVzdEFyZywgbWVtYmVyQXJnc30gPSBwYXJzZUZ1bkxvY2FscyhiZWZvcmUsIGluY2x1ZGVNZW1iZXJBcmdzKVxuXHRcdGZvciAoY29uc3QgYXJnIG9mIGFyZ3MpXG5cdFx0XHRpZiAoIWFyZy5pc0xhenkoKSlcblx0XHRcdFx0YXJnLmtpbmQgPSBMb2NhbERlY2xhcmVzLk11dGFibGVcblx0XHRjb25zdCBibG9jayA9IChpc0RvID8gcGFyc2VCbG9ja0RvIDogcGFyc2VCbG9ja1ZhbCkoYmxvY2tMaW5lcylcblx0XHRyZXR1cm4ge2FyZ3MsIG9wUmVzdEFyZywgbWVtYmVyQXJncywgYmxvY2t9XG5cdH1cbn1cblxuZnVuY3Rpb24gZnVuS2luZChrZXl3b3JkS2luZCkge1xuXHRzd2l0Y2ggKGtleXdvcmRLaW5kKSB7XG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW46XG5cdFx0XHRyZXR1cm4gW2ZhbHNlLCBmYWxzZSwgRnVucy5QbGFpbl1cblx0XHRjYXNlIEtleXdvcmRzLkZ1bkRvOlxuXHRcdFx0cmV0dXJuIFtmYWxzZSwgdHJ1ZSwgRnVucy5QbGFpbl1cblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXM6XG5cdFx0XHRyZXR1cm4gW3RydWUsIGZhbHNlLCBGdW5zLlBsYWluXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0RvOlxuXHRcdFx0cmV0dXJuIFt0cnVlLCB0cnVlLCBGdW5zLlBsYWluXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuQXN5bmM6XG5cdFx0XHRyZXR1cm4gW2ZhbHNlLCBmYWxzZSwgRnVucy5Bc3luY11cblx0XHRjYXNlIEtleXdvcmRzLkZ1bkFzeW5jRG86XG5cdFx0XHRyZXR1cm4gW2ZhbHNlLCB0cnVlLCBGdW5zLkFzeW5jXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0FzeW5jOlxuXHRcdFx0cmV0dXJuIFt0cnVlLCBmYWxzZSwgRnVucy5Bc3luY11cblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNBc3luY0RvOlxuXHRcdFx0cmV0dXJuIFt0cnVlLCB0cnVlLCBGdW5zLkFzeW5jXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuR2VuOlxuXHRcdFx0cmV0dXJuIFtmYWxzZSwgZmFsc2UsIEZ1bnMuR2VuZXJhdG9yXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuR2VuRG86XG5cdFx0XHRyZXR1cm4gW2ZhbHNlLCB0cnVlLCBGdW5zLkdlbmVyYXRvcl1cblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNHZW46XG5cdFx0XHRyZXR1cm4gW3RydWUsIGZhbHNlLCBGdW5zLkdlbmVyYXRvcl1cblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNHZW5Ebzpcblx0XHRcdHJldHVybiBbdHJ1ZSwgdHJ1ZSwgRnVucy5HZW5lcmF0b3JdXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHRocm93IG5ldyBFcnJvcihrZXl3b3JkS2luZClcblx0fVxufVxuXG5mdW5jdGlvbiB0cnlUYWtlUmV0dXJuVHlwZSh0b2tlbnMpIHtcblx0aWYgKCF0b2tlbnMuaXNFbXB0eSgpKSB7XG5cdFx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKClcblx0XHRpZiAoaXNHcm91cChHcm91cHMuU3BhY2UsIGgpICYmIGlzS2V5d29yZChLZXl3b3Jkcy5UeXBlLCBoZWFkKGguc3ViVG9rZW5zKSkpXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRvcFJldHVyblR5cGU6IHBhcnNlU3BhY2VkKFNsaWNlLmdyb3VwKGgpLnRhaWwoKSksXG5cdFx0XHRcdHJlc3Q6IHRva2Vucy50YWlsKClcblx0XHRcdH1cblx0fVxuXHRyZXR1cm4ge29wUmV0dXJuVHlwZTogbnVsbCwgcmVzdDogdG9rZW5zfVxufVxuXG5jb25zdCBmdW5Gb2N1c0tleXdvcmRzID0gbmV3IFNldChbXG5cdEtleXdvcmRzLkNhc2VWYWwsIEtleXdvcmRzLkNhc2VEbywgS2V5d29yZHMuU3dpdGNoVmFsLCBLZXl3b3Jkcy5Td2l0Y2hEb1xuXSlcblxuZnVuY3Rpb24gcGFyc2VGdW5Mb2NhbHModG9rZW5zLCBpbmNsdWRlTWVtYmVyQXJncykge1xuXHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRyZXR1cm4ge2FyZ3M6IFtdLCBtZW1iZXJBcmdzOiBbXSwgb3BSZXN0QXJnOiBudWxsfVxuXHRlbHNlIHtcblx0XHRsZXQgcmVzdCA9IHRva2Vucywgb3BSZXN0QXJnID0gbnVsbFxuXHRcdGNvbnN0IGwgPSB0b2tlbnMubGFzdCgpXG5cdFx0aWYgKGlzR3JvdXAoR3JvdXBzLlNwYWNlLCBsKSkge1xuXHRcdFx0Y29uc3QgZyA9IFNsaWNlLmdyb3VwKGwpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkVsbGlwc2lzLCBnLmhlYWQoKSkpIHtcblx0XHRcdFx0cmVzdCA9IHRva2Vucy5ydGFpbCgpXG5cdFx0XHRcdG9wUmVzdEFyZyA9IHBhcnNlTG9jYWxEZWNsYXJlRnJvbVNwYWNlZChnLnRhaWwoKSlcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGluY2x1ZGVNZW1iZXJBcmdzKSB7XG5cdFx0XHRjb25zdCB7ZGVjbGFyZXM6IGFyZ3MsIG1lbWJlckFyZ3N9ID0gcGFyc2VMb2NhbERlY2xhcmVzQW5kTWVtYmVyQXJncyhyZXN0KVxuXHRcdFx0cmV0dXJuIHthcmdzLCBtZW1iZXJBcmdzLCBvcFJlc3RBcmd9XG5cdFx0fSBlbHNlXG5cdFx0XHRyZXR1cm4ge2FyZ3M6IHBhcnNlTG9jYWxEZWNsYXJlcyhyZXN0KSwgb3BSZXN0QXJnfVxuXHR9XG59XG4iXX0=
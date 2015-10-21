if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', '../MsAst', '../Token', '../util', './checks', './parseBlock', './parseCase', './parseLocalDeclares', './parseSpaced', './parseSwitch', './Slice'], function (exports, _MsAst, _Token, _util, _checks, _parseBlock, _parseCase, _parseLocalDeclares, _parseSpaced, _parseSwitch, _Slice) {
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

	function parseFun(kind, tokens) {
		let isThis = false,
		    isDo = false,
		    isGenerator = false;
		switch (kind) {
			case _Token.Keywords.Fun:
				break;
			case _Token.Keywords.FunDo:
				isDo = true;
				break;
			case _Token.Keywords.FunGen:
				isGenerator = true;
				break;
			case _Token.Keywords.FunGenDo:
				isGenerator = true;
				isDo = true;
				break;
			case _Token.Keywords.FunThis:
				isThis = true;
				break;
			case _Token.Keywords.FunThisDo:
				isThis = true;
				isDo = true;
				break;
			case _Token.Keywords.FunThisGen:
				isThis = true;
				isGenerator = true;
				break;
			case _Token.Keywords.FunThisGenDo:
				isThis = true;
				isGenerator = true;
				isDo = true;
				break;
			default:
				throw new Error();
		}
		const opDeclareThis = (0, _util.opIf)(isThis, () => _MsAst.LocalDeclare.this(tokens.loc));

		var _tryTakeReturnType = tryTakeReturnType(tokens);

		const opReturnType = _tryTakeReturnType.opReturnType;
		const rest = _tryTakeReturnType.rest;

		var _funArgsAndBlock = funArgsAndBlock(rest, isDo);

		const args = _funArgsAndBlock.args;
		const opRestArg = _funArgsAndBlock.opRestArg;
		const block = _funArgsAndBlock.block;

		return new _MsAst.Fun(tokens.loc, args, opRestArg, block, isGenerator, opDeclareThis, opReturnType);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlRnVuLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZUZ1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O21CQ2tCd0IsUUFBUTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFqQixVQUFTLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFO0FBQzlDLE1BQUksTUFBTSxHQUFHLEtBQUs7TUFBRSxJQUFJLEdBQUcsS0FBSztNQUFFLFdBQVcsR0FBRyxLQUFLLENBQUE7QUFDckQsVUFBUSxJQUFJO0FBQ1gsUUFBSyxPQXBCMkMsUUFBUSxDQW9CMUMsR0FBRztBQUNoQixVQUFLO0FBQUEsQUFDTixRQUFLLE9BdEIyQyxRQUFRLENBc0IxQyxLQUFLO0FBQ2xCLFFBQUksR0FBRyxJQUFJLENBQUE7QUFDWCxVQUFLO0FBQUEsQUFDTixRQUFLLE9BekIyQyxRQUFRLENBeUIxQyxNQUFNO0FBQ25CLGVBQVcsR0FBRyxJQUFJLENBQUE7QUFDbEIsVUFBSztBQUFBLEFBQ04sUUFBSyxPQTVCMkMsUUFBUSxDQTRCMUMsUUFBUTtBQUNyQixlQUFXLEdBQUcsSUFBSSxDQUFBO0FBQ2xCLFFBQUksR0FBRyxJQUFJLENBQUE7QUFDWCxVQUFLO0FBQUEsQUFDTixRQUFLLE9BaEMyQyxRQUFRLENBZ0MxQyxPQUFPO0FBQ3BCLFVBQU0sR0FBRyxJQUFJLENBQUE7QUFDYixVQUFLO0FBQUEsQUFDTixRQUFLLE9BbkMyQyxRQUFRLENBbUMxQyxTQUFTO0FBQ3RCLFVBQU0sR0FBRyxJQUFJLENBQUE7QUFDYixRQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ1gsVUFBSztBQUFBLEFBQ04sUUFBSyxPQXZDMkMsUUFBUSxDQXVDMUMsVUFBVTtBQUN2QixVQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2IsZUFBVyxHQUFHLElBQUksQ0FBQTtBQUNsQixVQUFLO0FBQUEsQUFDTixRQUFLLE9BM0MyQyxRQUFRLENBMkMxQyxZQUFZO0FBQ3pCLFVBQU0sR0FBRyxJQUFJLENB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RUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFDLENBQUEsS0FDOUM7QUFDSixPQUFJLElBQUksR0FBRyxNQUFNO09BQUUsU0FBUyxHQUFHLElBQUksQ0FBQTtBQUNuQyxTQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDdkIsT0FBSSxXQTlId0IsT0FBTyxFQThIdkIsT0E5SE4sTUFBTSxDQThITyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDN0IsVUFBTSxDQUFDLEdBQUcsZ0JBQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3hCLFFBQUksV0FoSWdDLFNBQVMsRUFnSS9CLE9BaElpQyxRQUFRLENBZ0loQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUU7QUFDM0MsU0FBSSxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNyQixjQUFTLEdBQUcsd0JBN0hZLDJCQUEyQixFQTZIWCxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtLQUNqRDtJQUNEO0FBQ0QsT0FBSSxpQkFBaUIsRUFBRTsyQ0FDZSx3QkFqSWlCLCtCQUErQixFQWlJaEIsSUFBSSxDQUFDOztVQUF6RCxJQUFJLG9DQUFkLFFBQVE7VUFBUSxVQUFVLG9DQUFWLFVBQVU7O0FBQ2pDLFdBQU8sRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBQyxDQUFBO0lBQ3BDLE1BQ0EsT0FBTyxFQUFDLElBQUksRUFBRSxrQ0FBbUIsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFDLENBQUE7R0FDbkQ7RUFDRCIsImZpbGUiOiJwcml2YXRlL3BhcnNlL3BhcnNlRnVuLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge0Jsb2NrRG8sIEJsb2NrVmFsUmV0dXJuLCBGdW4sIExvY2FsRGVjbGFyZSwgTG9jYWxEZWNsYXJlc30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwcywgaXNBbnlLZXl3b3JkLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aGVhZCwgb3BJZn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tOb25FbXB0eX0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge2JlZm9yZUFuZEJsb2NrLCBwYXJzZUJsb2NrRG8sIHBhcnNlQmxvY2tWYWx9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZUNhc2UgZnJvbSAnLi9wYXJzZUNhc2UnXG5pbXBvcnQgcGFyc2VMb2NhbERlY2xhcmVzLCB7cGFyc2VMb2NhbERlY2xhcmVGcm9tU3BhY2VkLCBwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzXG5cdH0gZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5pbXBvcnQgcGFyc2VTcGFjZWQgZnJvbSAnLi9wYXJzZVNwYWNlZCdcbmltcG9ydCBwYXJzZVN3aXRjaCBmcm9tICcuL3BhcnNlU3dpdGNoJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8qKlxuUGFyc2UgYSBmdW5jdGlvbi5cbkBwYXJhbSBraW5kIHtLZXl3b3Jkc30gQSBmdW5jdGlvbiBrZXl3b3JkLlxuQHBhcmFtIHtTbGljZX0gdG9rZW5zIFJlc3Qgb2YgdGhlIGxpbmUgYWZ0ZXIgdGhlIGZ1bmN0aW9uIGtleXdvcmQuXG5AcmV0dXJuIHtGdW59XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VGdW4oa2luZCwgdG9rZW5zKSB7XG5cdGxldCBpc1RoaXMgPSBmYWxzZSwgaXNEbyA9IGZhbHNlLCBpc0dlbmVyYXRvciA9IGZhbHNlXG5cdHN3aXRjaCAoa2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuOlxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtleXdvcmRzLkZ1bkRvOlxuXHRcdFx0aXNEbyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5HZW46XG5cdFx0XHRpc0dlbmVyYXRvciA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5HZW5Ebzpcblx0XHRcdGlzR2VuZXJhdG9yID0gdHJ1ZVxuXHRcdFx0aXNEbyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzOlxuXHRcdFx0aXNUaGlzID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNEbzpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0dlbjpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGlzR2VuZXJhdG9yID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNHZW5Ebzpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGlzR2VuZXJhdG9yID0gdHJ1ZVxuXHRcdFx0aXNEbyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKClcblx0fVxuXHRjb25zdCBvcERlY2xhcmVUaGlzID0gb3BJZihpc1RoaXMsICgpID0+IExvY2FsRGVjbGFyZS50aGlzKHRva2Vucy5sb2MpKVxuXHRjb25zdCB7b3BSZXR1cm5UeXBlLCByZXN0fSA9IHRyeVRha2VSZXR1cm5UeXBlKHRva2Vucylcblx0Y29uc3Qge2FyZ3MsIG9wUmVzdEFyZywgYmxvY2t9ID0gZnVuQXJnc0FuZEJsb2NrKHJlc3QsIGlzRG8pXG5cdHJldHVybiBuZXcgRnVuKHRva2Vucy5sb2MsIGFyZ3MsIG9wUmVzdEFyZywgYmxvY2ssIGlzR2VuZXJhdG9yLCBvcERlY2xhcmVUaGlzLCBvcFJldHVyblR5cGUpXG59XG5cbi8qKlxuUGFyc2UgZnVuY3Rpb24gYXJndW1lbnRzIGFuZCBib2R5LlxuVGhpcyBhbHNvIGhhbmRsZXMgdGhlIGB8Y2FzZWAgYW5kIGB8c3dpdGNoYCBmb3Jtcy5cbkBwYXJhbSB7U2xpY2V9IHRva2Vuc1xuQHBhcmFtIHtib29sZWFufSBpc0RvIFdoZXRoZXIgdGhpcyBpcyBhIGAhfGBcbkBwYXJhbSB7aW5jbHVkZU1lbWJlckFyZ3N9XG5cdFRoaXMgaXMgZm9yIGNvbnN0cnVjdG9ycy5cblx0SWYgdHJ1ZSwgb3V0cHV0IHdpbGwgaW5jbHVkZSBgbWVtYmVyQXJnc2AuXG5cdFRoaXMgaXMgdGhlIHN1YnNldCBvZiBgYXJnc2Agd2hvc2UgbmFtZXMgYXJlIHByZWZpeGVkIHdpdGggYC5gLlxuXHRlLmcuOiBgY29uc3RydWN0ISAueCAueWBcbkByZXR1cm4ge1xuXHRhcmdzOiBBcnJheTxMb2NhbERlY2xhcmU+LFxuXHRvcFJlc3RBcmc6ID9Mb2NhbERlY2xhcmUsXG5cdG1lbWJlckFyZ3M6QXJyYXk8TG9jYWxEZWNsYXJlPixcblx0YmxvY2s6IEJsb2NrXG59XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGZ1bkFyZ3NBbmRCbG9jayh0b2tlbnMsIGlzRG8sIGluY2x1ZGVNZW1iZXJBcmdzPWZhbHNlKSB7XG5cdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAnRXhwZWN0ZWQgYW4gaW5kZW50ZWQgYmxvY2suJylcblx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKClcblxuXHQvLyBNaWdodCBiZSBgfGNhc2VgIChvciBgfGNhc2UhYCwgYHxzd2l0Y2hgLCBgfHN3aXRjaCFgKVxuXHRpZiAoaXNBbnlLZXl3b3JkKGZ1bkZvY3VzS2V5d29yZHMsIGgpKSB7XG5cdFx0Y29uc3QgaXNWYWwgPSBoLmtpbmQgPT09IEtleXdvcmRzLkNhc2VWYWwgfHwgaC5raW5kID09PSBLZXl3b3Jkcy5Td2l0Y2hWYWxcblx0XHRjb25zdCBpc0Nhc2UgPSBoLmtpbmQgPT09IEtleXdvcmRzLkNhc2VWYWwgfHwgaC5raW5kID09PSBLZXl3b3Jkcy5DYXNlRG9cblx0XHRjb25zdCBleHByID0gKGlzQ2FzZSA/IHBhcnNlQ2FzZSA6IHBhcnNlU3dpdGNoKShpc1ZhbCwgdHJ1ZSwgdG9rZW5zLnRhaWwoKSlcblxuXHRcdGNvbnN0IGFyZ3MgPSBbTG9jYWxEZWNsYXJlLmZvY3VzKGgubG9jKV1cblx0XHRyZXR1cm4gaXNWYWwgP1xuXHRcdFx0e1xuXHRcdFx0XHRhcmdzLCBvcFJlc3RBcmc6IG51bGwsIG1lbWJlckFyZ3M6IFtdLFxuXHRcdFx0XHRibG9jazogbmV3IEJsb2NrVmFsUmV0dXJuKHRva2Vucy5sb2MsIG51bGwsIFtdLCBleHByKVxuXHRcdFx0fSA6XG5cdFx0XHR7XG5cdFx0XHRcdGFyZ3MsIG9wUmVzdEFyZzogbnVsbCwgbWVtYmVyQXJnczogW10sXG5cdFx0XHRcdGJsb2NrOiBuZXcgQmxvY2tEbyh0b2tlbnMubG9jLCBudWxsLCBbZXhwcl0pXG5cdFx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tMaW5lc10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdFx0Y29uc3Qge2FyZ3MsIG9wUmVzdEFyZywgbWVtYmVyQXJnc30gPSBwYXJzZUZ1bkxvY2FscyhiZWZvcmUsIGluY2x1ZGVNZW1iZXJBcmdzKVxuXHRcdGZvciAoY29uc3QgYXJnIG9mIGFyZ3MpXG5cdFx0XHRpZiAoIWFyZy5pc0xhenkoKSlcblx0XHRcdFx0YXJnLmtpbmQgPSBMb2NhbERlY2xhcmVzLk11dGFibGVcblx0XHRjb25zdCBibG9jayA9IChpc0RvID8gcGFyc2VCbG9ja0RvIDogcGFyc2VCbG9ja1ZhbCkoYmxvY2tMaW5lcylcblx0XHRyZXR1cm4ge2FyZ3MsIG9wUmVzdEFyZywgbWVtYmVyQXJncywgYmxvY2t9XG5cdH1cbn1cblxuZnVuY3Rpb24gdHJ5VGFrZVJldHVyblR5cGUodG9rZW5zKSB7XG5cdGlmICghdG9rZW5zLmlzRW1wdHkoKSkge1xuXHRcdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpXG5cdFx0aWYgKGlzR3JvdXAoR3JvdXBzLlNwYWNlLCBoKSAmJiBpc0tleXdvcmQoS2V5d29yZHMuVHlwZSwgaGVhZChoLnN1YlRva2VucykpKVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0b3BSZXR1cm5UeXBlOiBwYXJzZVNwYWNlZChTbGljZS5ncm91cChoKS50YWlsKCkpLFxuXHRcdFx0XHRyZXN0OiB0b2tlbnMudGFpbCgpXG5cdFx0XHR9XG5cdH1cblx0cmV0dXJuIHtvcFJldHVyblR5cGU6IG51bGwsIHJlc3Q6IHRva2Vuc31cbn1cblxuY29uc3QgZnVuRm9jdXNLZXl3b3JkcyA9IG5ldyBTZXQoW1xuXHRLZXl3b3Jkcy5DYXNlVmFsLCBLZXl3b3Jkcy5DYXNlRG8sIEtleXdvcmRzLlN3aXRjaFZhbCwgS2V5d29yZHMuU3dpdGNoRG9cbl0pXG5cbmZ1bmN0aW9uIHBhcnNlRnVuTG9jYWxzKHRva2VucywgaW5jbHVkZU1lbWJlckFyZ3MpIHtcblx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIHthcmdzOiBbXSwgbWVtYmVyQXJnczogW10sIG9wUmVzdEFyZzogbnVsbH1cblx0ZWxzZSB7XG5cdFx0bGV0IHJlc3QgPSB0b2tlbnMsIG9wUmVzdEFyZyA9IG51bGxcblx0XHRjb25zdCBsID0gdG9rZW5zLmxhc3QoKVxuXHRcdGlmIChpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgbCkpIHtcblx0XHRcdGNvbnN0IGcgPSBTbGljZS5ncm91cChsKVxuXHRcdFx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5FbGxpcHNpcywgZy5oZWFkKCkpKSB7XG5cdFx0XHRcdHJlc3QgPSB0b2tlbnMucnRhaWwoKVxuXHRcdFx0XHRvcFJlc3RBcmcgPSBwYXJzZUxvY2FsRGVjbGFyZUZyb21TcGFjZWQoZy50YWlsKCkpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChpbmNsdWRlTWVtYmVyQXJncykge1xuXHRcdFx0Y29uc3Qge2RlY2xhcmVzOiBhcmdzLCBtZW1iZXJBcmdzfSA9IHBhcnNlTG9jYWxEZWNsYXJlc0FuZE1lbWJlckFyZ3MocmVzdClcblx0XHRcdHJldHVybiB7YXJncywgbWVtYmVyQXJncywgb3BSZXN0QXJnfVxuXHRcdH0gZWxzZVxuXHRcdFx0cmV0dXJuIHthcmdzOiBwYXJzZUxvY2FsRGVjbGFyZXMocmVzdCksIG9wUmVzdEFyZ31cblx0fVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

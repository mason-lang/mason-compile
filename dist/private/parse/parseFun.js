if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', '../MsAst', '../Token', '../util', './context', './parseBlock', './parseCase', './parseLocalDeclares', './parseSpaced', './parseSwitch', './Slice'], function (exports, _MsAst, _Token, _util, _context, _parseBlock, _parseCase, _parseLocalDeclares, _parseSpaced, _parseSwitch, _Slice) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseCase2 = _interopRequireDefault(_parseCase);

	var _parseLocalDeclares2 = _interopRequireDefault(_parseLocalDeclares);

	var _parseSpaced2 = _interopRequireDefault(_parseSpaced);

	var _parseSwitch2 = _interopRequireDefault(_parseSwitch);

	var _Slice2 = _interopRequireDefault(_Slice);

	exports.default = (kind, tokens) => {
		let isThis = false,
		    isDo = false,
		    isGen = false;
		switch (kind) {
			case _Token.KW_Fun:
				break;
			case _Token.KW_FunDo:
				isDo = true;
				break;
			case _Token.KW_FunGen:
				isGen = true;
				break;
			case _Token.KW_FunGenDo:
				isGen = true;
				isDo = true;
				break;
			case _Token.KW_FunThis:
				isThis = true;
				break;
			case _Token.KW_FunThisDo:
				isThis = true;
				isDo = true;
				break;
			case _Token.KW_FunThisGen:
				isThis = true;
				isGen = true;
				break;
			case _Token.KW_FunThisGenDo:
				isThis = true;
				isGen = true;
				isDo = true;
				break;
			default:
				throw new Error();
		}
		const opDeclareThis = (0, _util.opIf)(isThis, () => new _MsAst.LocalDeclareThis(tokens.loc));

		var _tryTakeReturnType = tryTakeReturnType(tokens);

		const opReturnType = _tryTakeReturnType.opReturnType;
		const rest = _tryTakeReturnType.rest;

		var _funArgsAndBlock2 = _funArgsAndBlock(isDo, rest);

		const args = _funArgsAndBlock2.args;
		const opRestArg = _funArgsAndBlock2.opRestArg;
		const block = _funArgsAndBlock2.block;
		const opIn = _funArgsAndBlock2.opIn;
		const opOut = _funArgsAndBlock2.opOut;
		const opComment = _funArgsAndBlock2.opComment;

		// Need res declare if there is a return type or out condition.
		const opDeclareRes = (0, _util.ifElse)(opReturnType, _ => new _MsAst.LocalDeclareRes(_.loc, _), () => (0, _util.opMap)(opOut, _ => new _MsAst.LocalDeclareRes(_.loc, null)));
		return new _MsAst.Fun(tokens.loc, opDeclareThis, isGen, args, opRestArg, block, opIn, opDeclareRes, opOut, opComment);
	};

	/*
 includeMemberArgs:
 	if true, output will include `memberArgs`.
 	This is a subset of `args` whose names are prefixed with `.`
 	e.g.: `construct! .x .y`
 	This is for constructors only.
 */
	const _funArgsAndBlock = (isDo, tokens, includeMemberArgs) => {
		(0, _context.checkNonEmpty)(tokens, 'Expected an indented block.');
		const h = tokens.head();

		// Might be `|case` (or `|case!`, `|switch`, `|switch!`)
		if ((0, _Token.isAnyKeyword)(funFocusKeywords, h)) {
			const isVal = h.kind === _Token.KW_CaseVal || h.kind === _Token.KW_SwitchVal;
			const isCase = h.kind === _Token.KW_CaseVal || h.kind === _Token.KW_CaseDo;
			const expr = (isCase ? _parseCase2.default : _parseSwitch2.default)(isVal, true, tokens.tail());

			const args = [new _MsAst.LocalDeclareFocus(h.loc)];
			return isVal ? {
				args, opRestArg: null, memberArgs: [], opIn: null, opOut: null,
				block: new _MsAst.BlockWithReturn(tokens.loc, null, [], expr)
			} : {
				args, opRestArg: null, memberArgs: [], opIn: null, opOut: null,
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

			for (const arg of args) if (!arg.isLazy()) arg.kind = _MsAst.LD_Mutable;

			var _tryTakeInOrOut = tryTakeInOrOut(_Token.KW_In, blockLines);

			var _tryTakeInOrOut2 = _slicedToArray(_tryTakeInOrOut, 2);

			const opIn = _tryTakeInOrOut2[0];
			const rest0 = _tryTakeInOrOut2[1];

			var _tryTakeInOrOut3 = tryTakeInOrOut(_Token.KW_Out, rest0);

			var _tryTakeInOrOut32 = _slicedToArray(_tryTakeInOrOut3, 2);

			const opOut = _tryTakeInOrOut32[0];
			const rest1 = _tryTakeInOrOut32[1];

			const block = (isDo ? _parseBlock.parseBlockDo : _parseBlock.parseBlockVal)(rest1);
			return { args, opRestArg, memberArgs, block, opIn, opOut };
		}
	};

	exports._funArgsAndBlock = _funArgsAndBlock;
	const tryTakeReturnType = tokens => {
		if (!tokens.isEmpty()) {
			const h = tokens.head();
			if ((0, _Token.isGroup)(_Token.G_Space, h) && (0, _Token.isKeyword)(_Token.KW_Type, (0, _util.head)(h.subTokens))) return {
				opReturnType: (0, _parseSpaced2.default)(_Slice2.default.group(h).tail()),
				rest: tokens.tail()
			};
		}
		return { opReturnType: null, rest: tokens };
	},
	      funFocusKeywords = new Set([_Token.KW_CaseVal, _Token.KW_CaseDo, _Token.KW_SwitchVal, _Token.KW_SwitchDo]),
	      parseFunLocals = (tokens, includeMemberArgs) => {
		if (tokens.isEmpty()) return { args: [], memberArgs: [], opRestArg: null };else {
			let rest = tokens,
			    opRestArg = null;
			const l = tokens.last();
			if ((0, _Token.isGroup)(_Token.G_Space, l)) {
				const g = _Slice2.default.group(l);
				if ((0, _Token.isKeyword)(_Token.KW_Ellipsis, g.head())) {
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
	},
	      tryTakeInOrOut = (inOrOut, tokens) => {
		if (!tokens.isEmpty()) {
			const firstLine = tokens.headSlice();
			if ((0, _Token.isKeyword)(inOrOut, firstLine.head())) {
				const inOut = new _MsAst.BlockDo(firstLine.loc, null, (0, _parseBlock.parseLinesFromBlock)(firstLine));
				return [inOut, tokens.tail()];
			}
		}
		return [null, tokens];
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlRnVuLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZUZ1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQ2VlLENBQUMsSUFBSSxFQUFFLE1BQU0sS0FBSztBQUNoQyxNQUFJLE1BQU0sR0FBRyxLQUFLO01BQUUsSUFBSSxHQUFHLEtBQUs7TUFBRSxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQy9DLFVBQVEsSUFBSTtBQUNYLGVBaEJxRixNQUFNO0FBaUIxRixVQUFLO0FBQUEsQUFDTixlQWpCRCxRQUFRO0FBa0JOLFFBQUksR0FBRyxJQUFJLENBQUE7QUFDWCxVQUFLO0FBQUEsQUFDTixlQXBCUyxTQUFTO0FBcUJqQixTQUFLLEdBQUcsSUFBSSxDQUFBO0FBQ1osVUFBSztBQUFBLEFBQ04sZUF2Qm9CLFdBQVc7QUF3QjlCLFNBQUssR0FBRyxJQUFJLENBQUE7QUFDWixRQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ1gsVUFBSztBQUFBLEFBQ04sZUEzQmlDLFVBQVU7QUE0QjFDLFVBQU0sR0FBRyxJQUFJLENBQUE7QUFDYixVQUFLO0FBQUEsQUFDTixlQTlCNkMsWUFBWTtBQStCeEQsVUFBTSxHQUFHLElBQUksQ0FBQTtBQUNiLFFBQUksR0FBRyxJQUFJLENBQUE7QUFDWCxVQUFLO0FBQUEsQUFDTixlQWxDMkQsYUFBYTtBQW1DdkUsVUFBTSxHQUFHLElBQUksQ0FBQTtBQUNiLFNBQUssR0FBRyxJQUFJLENBQUE7QUFDWixVQUFLO0FBQUEsQUFDTixlQXRDMEUsZUFBZTtBQXVDeEYsVUFBTSxHQUFHLElBQUksQ0FBQTtBQUNiLFNBQUssR0FBRyxJQUFJLENBQUE7QUFDWixRQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ1gsVUFBSztBQUFBLEFBQ047QUFBUyxVQUFNLElBQUksS0FBSyxFQUFFLENBQUE7QUFBQSxHQUMxQjtBQUNELFFBQU0sYUFBYSxHQUFHLFVBM0NELElBQUksRUEyQ0UsTUFBTSxFQUFFLE1BQU0s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QUNyQyxNQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFO0FBQ3RCLFNBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUNwQyxPQUFJLFdBeklpQyxTQUFTLEVBeUloQyxPQUFPLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUU7QUFDekMsVUFBTSxLQUFLLEdBQUcsV0E1SVYsT0FBTyxDQTZJVixTQUFTLENBQUMsR0FBRyxFQUNiLElBQUksRUFDSixnQkF4SWdELG1CQUFtQixFQXdJL0MsU0FBUyxDQUFDLENBQUMsQ0FBQTtBQUNoQyxXQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0lBQzdCO0dBQ0Q7QUFDRCxTQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0VBQ3JCLENBQUEiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9wYXJzZUZ1bi5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHtCbG9ja0RvLCBCbG9ja1dpdGhSZXR1cm4sIEZ1biwgTERfTXV0YWJsZSwgTG9jYWxEZWNsYXJlRm9jdXMsIExvY2FsRGVjbGFyZVJlcyxcblx0TG9jYWxEZWNsYXJlVGhpc30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dfU3BhY2UsIGlzQW55S2V5d29yZCwgaXNHcm91cCwgaXNLZXl3b3JkLCBLV19DYXNlRG8sIEtXX0Nhc2VWYWwsIEtXX0VsbGlwc2lzLCBLV19GdW4sXG5cdEtXX0Z1bkRvLCBLV19GdW5HZW4sIEtXX0Z1bkdlbkRvLCBLV19GdW5UaGlzLCBLV19GdW5UaGlzRG8sIEtXX0Z1blRoaXNHZW4sIEtXX0Z1blRoaXNHZW5Ebyxcblx0S1dfSW4sIEtXX091dCwgS1dfU3dpdGNoRG8sIEtXX1N3aXRjaFZhbCwgS1dfVHlwZX0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2hlYWQsIGlmRWxzZSwgb3BJZiwgb3BNYXB9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2NoZWNrTm9uRW1wdHl9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB7YmVmb3JlQW5kQmxvY2ssIHBhcnNlQmxvY2tEbywgcGFyc2VCbG9ja1ZhbCwgcGFyc2VMaW5lc0Zyb21CbG9ja30gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlQ2FzZSBmcm9tICcuL3BhcnNlQ2FzZSdcbmltcG9ydCBwYXJzZUxvY2FsRGVjbGFyZXMsIHtwYXJzZUxvY2FsRGVjbGFyZUZyb21TcGFjZWQsIHBhcnNlTG9jYWxEZWNsYXJlc0FuZE1lbWJlckFyZ3Ncblx0fSBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcbmltcG9ydCBwYXJzZVNwYWNlZCBmcm9tICcuL3BhcnNlU3BhY2VkJ1xuaW1wb3J0IHBhcnNlU3dpdGNoIGZyb20gJy4vcGFyc2VTd2l0Y2gnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuZXhwb3J0IGRlZmF1bHQgKGtpbmQsIHRva2VucykgPT4ge1xuXHRsZXQgaXNUaGlzID0gZmFsc2UsIGlzRG8gPSBmYWxzZSwgaXNHZW4gPSBmYWxzZVxuXHRzd2l0Y2ggKGtpbmQpIHtcblx0XHRjYXNlIEtXX0Z1bjpcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5Ebzpcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuR2VuOlxuXHRcdFx0aXNHZW4gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuR2VuRG86XG5cdFx0XHRpc0dlbiA9IHRydWVcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuVGhpczpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5UaGlzRG86XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1blRoaXNHZW46XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRpc0dlbiA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5UaGlzR2VuRG86XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRpc0dlbiA9IHRydWVcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcigpXG5cdH1cblx0Y29uc3Qgb3BEZWNsYXJlVGhpcyA9IG9wSWYoaXNUaGlzLCAoKSA9PiBuZXcgTG9jYWxEZWNsYXJlVGhpcyh0b2tlbnMubG9jKSlcblxuXHRjb25zdCB7b3BSZXR1cm5UeXBlLCByZXN0fSA9IHRyeVRha2VSZXR1cm5UeXBlKHRva2Vucylcblx0Y29uc3Qge2FyZ3MsIG9wUmVzdEFyZywgYmxvY2ssIG9wSW4sIG9wT3V0LCBvcENvbW1lbnR9ID0gX2Z1bkFyZ3NBbmRCbG9jayhpc0RvLCByZXN0KVxuXHQvLyBOZWVkIHJlcyBkZWNsYXJlIGlmIHRoZXJlIGlzIGEgcmV0dXJuIHR5cGUgb3Igb3V0IGNvbmRpdGlvbi5cblx0Y29uc3Qgb3BEZWNsYXJlUmVzID0gaWZFbHNlKG9wUmV0dXJuVHlwZSxcblx0XHRfID0+IG5ldyBMb2NhbERlY2xhcmVSZXMoXy5sb2MsIF8pLFxuXHRcdCgpID0+IG9wTWFwKG9wT3V0LCBfID0+IG5ldyBMb2NhbERlY2xhcmVSZXMoXy5sb2MsIG51bGwpKSlcblx0cmV0dXJuIG5ldyBGdW4odG9rZW5zLmxvYyxcblx0XHRvcERlY2xhcmVUaGlzLCBpc0dlbiwgYXJncywgb3BSZXN0QXJnLCBibG9jaywgb3BJbiwgb3BEZWNsYXJlUmVzLCBvcE91dCwgb3BDb21tZW50KVxufVxuXG4vKlxuaW5jbHVkZU1lbWJlckFyZ3M6XG5cdGlmIHRydWUsIG91dHB1dCB3aWxsIGluY2x1ZGUgYG1lbWJlckFyZ3NgLlxuXHRUaGlzIGlzIGEgc3Vic2V0IG9mIGBhcmdzYCB3aG9zZSBuYW1lcyBhcmUgcHJlZml4ZWQgd2l0aCBgLmBcblx0ZS5nLjogYGNvbnN0cnVjdCEgLnggLnlgXG5cdFRoaXMgaXMgZm9yIGNvbnN0cnVjdG9ycyBvbmx5LlxuKi9cbmV4cG9ydCBjb25zdCBfZnVuQXJnc0FuZEJsb2NrID0gKGlzRG8sIHRva2VucywgaW5jbHVkZU1lbWJlckFyZ3MpID0+IHtcblx0Y2hlY2tOb25FbXB0eSh0b2tlbnMsICdFeHBlY3RlZCBhbiBpbmRlbnRlZCBibG9jay4nKVxuXHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXG5cdC8vIE1pZ2h0IGJlIGB8Y2FzZWAgKG9yIGB8Y2FzZSFgLCBgfHN3aXRjaGAsIGB8c3dpdGNoIWApXG5cdGlmIChpc0FueUtleXdvcmQoZnVuRm9jdXNLZXl3b3JkcywgaCkpIHtcblx0XHRjb25zdCBpc1ZhbCA9IGgua2luZCA9PT0gS1dfQ2FzZVZhbCB8fCBoLmtpbmQgPT09IEtXX1N3aXRjaFZhbFxuXHRcdGNvbnN0IGlzQ2FzZSA9IGgua2luZCA9PT0gS1dfQ2FzZVZhbCB8fCBoLmtpbmQgPT09IEtXX0Nhc2VEb1xuXHRcdGNvbnN0IGV4cHIgPSAoaXNDYXNlID8gcGFyc2VDYXNlIDogcGFyc2VTd2l0Y2gpKGlzVmFsLCB0cnVlLCB0b2tlbnMudGFpbCgpKVxuXG5cdFx0Y29uc3QgYXJncyA9IFtuZXcgTG9jYWxEZWNsYXJlRm9jdXMoaC5sb2MpXVxuXHRcdHJldHVybiBpc1ZhbCA/XG5cdFx0XHR7XG5cdFx0XHRcdGFyZ3MsIG9wUmVzdEFyZzogbnVsbCwgbWVtYmVyQXJnczogW10sIG9wSW46IG51bGwsIG9wT3V0OiBudWxsLFxuXHRcdFx0XHRibG9jazogbmV3IEJsb2NrV2l0aFJldHVybih0b2tlbnMubG9jLCBudWxsLCBbXSwgZXhwcilcblx0XHRcdH0gOlxuXHRcdFx0e1xuXHRcdFx0XHRhcmdzLCBvcFJlc3RBcmc6IG51bGwsIG1lbWJlckFyZ3M6IFtdLCBvcEluOiBudWxsLCBvcE91dDogbnVsbCxcblx0XHRcdFx0YmxvY2s6IG5ldyBCbG9ja0RvKHRva2Vucy5sb2MsIG51bGwsIFtleHByXSlcblx0XHRcdH1cblx0fSBlbHNlIHtcblx0XHRjb25zdCBbYmVmb3JlLCBibG9ja0xpbmVzXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0XHRjb25zdCB7YXJncywgb3BSZXN0QXJnLCBtZW1iZXJBcmdzfSA9IHBhcnNlRnVuTG9jYWxzKGJlZm9yZSwgaW5jbHVkZU1lbWJlckFyZ3MpXG5cdFx0Zm9yIChjb25zdCBhcmcgb2YgYXJncylcblx0XHRcdGlmICghYXJnLmlzTGF6eSgpKVxuXHRcdFx0XHRhcmcua2luZCA9IExEX011dGFibGVcblx0XHRjb25zdCBbb3BJbiwgcmVzdDBdID0gdHJ5VGFrZUluT3JPdXQoS1dfSW4sIGJsb2NrTGluZXMpXG5cdFx0Y29uc3QgW29wT3V0LCByZXN0MV0gPSB0cnlUYWtlSW5Pck91dChLV19PdXQsIHJlc3QwKVxuXHRcdGNvbnN0IGJsb2NrID0gKGlzRG8gPyBwYXJzZUJsb2NrRG8gOiBwYXJzZUJsb2NrVmFsKShyZXN0MSlcblx0XHRyZXR1cm4ge2FyZ3MsIG9wUmVzdEFyZywgbWVtYmVyQXJncywgYmxvY2ssIG9wSW4sIG9wT3V0fVxuXHR9XG59XG5cbmNvbnN0XG5cdHRyeVRha2VSZXR1cm5UeXBlID0gdG9rZW5zID0+IHtcblx0XHRpZiAoIXRva2Vucy5pc0VtcHR5KCkpIHtcblx0XHRcdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpXG5cdFx0XHRpZiAoaXNHcm91cChHX1NwYWNlLCBoKSAmJiBpc0tleXdvcmQoS1dfVHlwZSwgaGVhZChoLnN1YlRva2VucykpKVxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdG9wUmV0dXJuVHlwZTogcGFyc2VTcGFjZWQoU2xpY2UuZ3JvdXAoaCkudGFpbCgpKSxcblx0XHRcdFx0XHRyZXN0OiB0b2tlbnMudGFpbCgpXG5cdFx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHtvcFJldHVyblR5cGU6IG51bGwsIHJlc3Q6IHRva2Vuc31cblx0fSxcblxuXHRmdW5Gb2N1c0tleXdvcmRzID0gbmV3IFNldChbS1dfQ2FzZVZhbCwgS1dfQ2FzZURvLCBLV19Td2l0Y2hWYWwsIEtXX1N3aXRjaERvXSksXG5cblx0cGFyc2VGdW5Mb2NhbHMgPSAodG9rZW5zLCBpbmNsdWRlTWVtYmVyQXJncykgPT4ge1xuXHRcdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdFx0cmV0dXJuIHthcmdzOiBbXSwgbWVtYmVyQXJnczogW10sIG9wUmVzdEFyZzogbnVsbH1cblx0XHRlbHNlIHtcblx0XHRcdGxldCByZXN0ID0gdG9rZW5zLCBvcFJlc3RBcmcgPSBudWxsXG5cdFx0XHRjb25zdCBsID0gdG9rZW5zLmxhc3QoKVxuXHRcdFx0aWYgKGlzR3JvdXAoR19TcGFjZSwgbCkpIHtcblx0XHRcdFx0Y29uc3QgZyA9IFNsaWNlLmdyb3VwKGwpXG5cdFx0XHRcdGlmIChpc0tleXdvcmQoS1dfRWxsaXBzaXMsIGcuaGVhZCgpKSkge1xuXHRcdFx0XHRcdHJlc3QgPSB0b2tlbnMucnRhaWwoKVxuXHRcdFx0XHRcdG9wUmVzdEFyZyA9IHBhcnNlTG9jYWxEZWNsYXJlRnJvbVNwYWNlZChnLnRhaWwoKSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGluY2x1ZGVNZW1iZXJBcmdzKSB7XG5cdFx0XHRcdGNvbnN0IHtkZWNsYXJlczogYXJncywgbWVtYmVyQXJnc30gPSBwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzKHJlc3QpXG5cdFx0XHRcdHJldHVybiB7YXJncywgbWVtYmVyQXJncywgb3BSZXN0QXJnfVxuXHRcdFx0fSBlbHNlXG5cdFx0XHRcdHJldHVybiB7YXJnczogcGFyc2VMb2NhbERlY2xhcmVzKHJlc3QpLCBvcFJlc3RBcmd9XG5cdFx0fVxuXHR9LFxuXG5cdHRyeVRha2VJbk9yT3V0ID0gKGluT3JPdXQsIHRva2VucykgPT4ge1xuXHRcdGlmICghdG9rZW5zLmlzRW1wdHkoKSkge1xuXHRcdFx0Y29uc3QgZmlyc3RMaW5lID0gdG9rZW5zLmhlYWRTbGljZSgpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKGluT3JPdXQsIGZpcnN0TGluZS5oZWFkKCkpKSB7XG5cdFx0XHRcdGNvbnN0IGluT3V0ID0gbmV3IEJsb2NrRG8oXG5cdFx0XHRcdFx0Zmlyc3RMaW5lLmxvYyxcblx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdHBhcnNlTGluZXNGcm9tQmxvY2soZmlyc3RMaW5lKSlcblx0XHRcdFx0cmV0dXJuIFtpbk91dCwgdG9rZW5zLnRhaWwoKV1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIFtudWxsLCB0b2tlbnNdXG5cdH1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

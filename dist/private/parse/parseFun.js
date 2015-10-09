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
			let rest, opRestArg;
			const l = tokens.last();
			if (l instanceof _Token.DotName && l.nDots === 3) {
				rest = tokens.rtail();
				opRestArg = _MsAst.LocalDeclare.plain(l.loc, l.name);
			} else {
				rest = tokens;
				opRestArg = null;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlRnVuLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZUZ1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQ2NlLENBQUMsSUFBSSxFQUFFLE1BQU0sS0FBSztBQUNoQyxNQUFJLE1BQU0sR0FBRyxLQUFLO01BQUUsSUFBSSxHQUFHLEtBQUs7TUFBRSxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQy9DLFVBQVEsSUFBSTtBQUNYLGVBZmlGLE1BQU07QUFnQnRGLFVBQUs7QUFBQSxBQUNOLGVBaEJELFFBQVE7QUFpQk4sUUFBSSxHQUFHLElBQUksQ0FBQTtBQUNYLFVBQUs7QUFBQSxBQUNOLGVBbkJTLFNBQVM7QUFvQmpCLFNBQUssR0FBRyxJQUFJLENBQUE7QUFDWixVQUFLO0FBQUEsQUFDTixlQXRCb0IsV0FBVztBQXVCOUIsU0FBSyxHQUFHLElBQUksQ0FBQTtBQUNaLFFBQUksR0FBRyxJQUFJLENBQUE7QUFDWCxVQUFLO0FBQUEsQUFDTixlQTFCaUMsVUFBVTtBQTJCMUMsVUFBTSxHQUFHLElBQUksQ0FBQTtBQUNiLFVBQUs7QUFBQSxBQUNOLGVBN0I2QyxZQUFZO0FBOEJ4RCxVQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2IsUUFBSSxHQUFHLElBQUksQ0FBQTtBQUNYLFVBQUs7QUFBQSxBQUNOLGVBakMyRCxhQUFhO0FBa0N2RSxVQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2IsU0FBSyxHQUFHLElBQUksQ0FBQTtBQUNaLFVBQUs7QUFBQSxBQUNOLGVBckMwRSxlQUFlO0FBc0N4RixVQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2IsU0FBSyxHQUFHLElBQUksQ0FBQTtBQUNaLFFBQUksR0FBRyxJQUFJLENBQUE7QUFDWCxVQUFLO0FBQUEsQUFDTjtBQUFTLFVBQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQTtBQUFBLEdBQzFCO0FBQ0QsUUFBTSxhQUFhLEdBQUcsVUExQ0QsSUFBSSxFQTBDRSxNQUFNLEVBQUUsTUFBTSxX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TSxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFBO0FBQ3BDLE9BQUksV0F6STBDLFNBQVMsRUF5SXpDLE9BQU8sRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRTtBQUN6QyxVQUFNLEtBQUssR0FBRyxXQTVJVixPQUFPLENBNklWLFNBQVMsQ0FBQyxHQUFHLEVBQ2IsSUFBSSxFQUNKLGdCQXhJZ0QsbUJBQW1CLEVBd0kvQyxTQUFTLENBQUMsQ0FBQyxDQUFBO0FBQ2hDLFdBQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7SUFDN0I7R0FDRDtBQUNELFNBQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7RUFDckIsQ0FBQSIsImZpbGUiOiJwcml2YXRlL3BhcnNlL3BhcnNlRnVuLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge0Jsb2NrRG8sIEJsb2NrV2l0aFJldHVybiwgRnVuLCBMRF9NdXRhYmxlLCBMb2NhbERlY2xhcmUsIExvY2FsRGVjbGFyZUZvY3VzLFxuXHRMb2NhbERlY2xhcmVSZXMsIExvY2FsRGVjbGFyZVRoaXN9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtEb3ROYW1lLCBHX1NwYWNlLCBpc0FueUtleXdvcmQsIGlzR3JvdXAsIGlzS2V5d29yZCwgS1dfQ2FzZURvLCBLV19DYXNlVmFsLCBLV19GdW4sXG5cdEtXX0Z1bkRvLCBLV19GdW5HZW4sIEtXX0Z1bkdlbkRvLCBLV19GdW5UaGlzLCBLV19GdW5UaGlzRG8sIEtXX0Z1blRoaXNHZW4sIEtXX0Z1blRoaXNHZW5Ebyxcblx0S1dfSW4sIEtXX091dCwgS1dfU3dpdGNoRG8sIEtXX1N3aXRjaFZhbCwgS1dfVHlwZX0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2hlYWQsIGlmRWxzZSwgb3BJZiwgb3BNYXB9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2NoZWNrTm9uRW1wdHl9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB7YmVmb3JlQW5kQmxvY2ssIHBhcnNlQmxvY2tEbywgcGFyc2VCbG9ja1ZhbCwgcGFyc2VMaW5lc0Zyb21CbG9ja30gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlQ2FzZSBmcm9tICcuL3BhcnNlQ2FzZSdcbmltcG9ydCBwYXJzZUxvY2FsRGVjbGFyZXMsIHtwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzfSBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcbmltcG9ydCBwYXJzZVNwYWNlZCBmcm9tICcuL3BhcnNlU3BhY2VkJ1xuaW1wb3J0IHBhcnNlU3dpdGNoIGZyb20gJy4vcGFyc2VTd2l0Y2gnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuZXhwb3J0IGRlZmF1bHQgKGtpbmQsIHRva2VucykgPT4ge1xuXHRsZXQgaXNUaGlzID0gZmFsc2UsIGlzRG8gPSBmYWxzZSwgaXNHZW4gPSBmYWxzZVxuXHRzd2l0Y2ggKGtpbmQpIHtcblx0XHRjYXNlIEtXX0Z1bjpcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5Ebzpcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuR2VuOlxuXHRcdFx0aXNHZW4gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuR2VuRG86XG5cdFx0XHRpc0dlbiA9IHRydWVcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuVGhpczpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5UaGlzRG86XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1blRoaXNHZW46XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRpc0dlbiA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5UaGlzR2VuRG86XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRpc0dlbiA9IHRydWVcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcigpXG5cdH1cblx0Y29uc3Qgb3BEZWNsYXJlVGhpcyA9IG9wSWYoaXNUaGlzLCAoKSA9PiBuZXcgTG9jYWxEZWNsYXJlVGhpcyh0b2tlbnMubG9jKSlcblxuXHRjb25zdCB7b3BSZXR1cm5UeXBlLCByZXN0fSA9IHRyeVRha2VSZXR1cm5UeXBlKHRva2Vucylcblx0Y29uc3Qge2FyZ3MsIG9wUmVzdEFyZywgYmxvY2ssIG9wSW4sIG9wT3V0LCBvcENvbW1lbnR9ID0gX2Z1bkFyZ3NBbmRCbG9jayhpc0RvLCByZXN0KVxuXHQvLyBOZWVkIHJlcyBkZWNsYXJlIGlmIHRoZXJlIGlzIGEgcmV0dXJuIHR5cGUgb3Igb3V0IGNvbmRpdGlvbi5cblx0Y29uc3Qgb3BEZWNsYXJlUmVzID0gaWZFbHNlKG9wUmV0dXJuVHlwZSxcblx0XHRfID0+IG5ldyBMb2NhbERlY2xhcmVSZXMoXy5sb2MsIF8pLFxuXHRcdCgpID0+IG9wTWFwKG9wT3V0LCBfID0+IG5ldyBMb2NhbERlY2xhcmVSZXMoXy5sb2MsIG51bGwpKSlcblx0cmV0dXJuIG5ldyBGdW4odG9rZW5zLmxvYyxcblx0XHRvcERlY2xhcmVUaGlzLCBpc0dlbiwgYXJncywgb3BSZXN0QXJnLCBibG9jaywgb3BJbiwgb3BEZWNsYXJlUmVzLCBvcE91dCwgb3BDb21tZW50KVxufVxuXG4vKlxuaW5jbHVkZU1lbWJlckFyZ3M6XG5cdGlmIHRydWUsIG91dHB1dCB3aWxsIGluY2x1ZGUgYG1lbWJlckFyZ3NgLlxuXHRUaGlzIGlzIGEgc3Vic2V0IG9mIGBhcmdzYCB3aG9zZSBuYW1lcyBhcmUgcHJlZml4ZWQgd2l0aCBgLmBcblx0ZS5nLjogYGNvbnN0cnVjdCEgLnggLnlgXG5cdFRoaXMgaXMgZm9yIGNvbnN0cnVjdG9ycyBvbmx5LlxuKi9cbmV4cG9ydCBjb25zdCBfZnVuQXJnc0FuZEJsb2NrID0gKGlzRG8sIHRva2VucywgaW5jbHVkZU1lbWJlckFyZ3MpID0+IHtcblx0Y2hlY2tOb25FbXB0eSh0b2tlbnMsICdFeHBlY3RlZCBhbiBpbmRlbnRlZCBibG9jay4nKVxuXHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXG5cdC8vIE1pZ2h0IGJlIGB8Y2FzZWAgKG9yIGB8Y2FzZSFgLCBgfHN3aXRjaGAsIGB8c3dpdGNoIWApXG5cdGlmIChpc0FueUtleXdvcmQoZnVuRm9jdXNLZXl3b3JkcywgaCkpIHtcblx0XHRjb25zdCBpc1ZhbCA9IGgua2luZCA9PT0gS1dfQ2FzZVZhbCB8fCBoLmtpbmQgPT09IEtXX1N3aXRjaFZhbFxuXHRcdGNvbnN0IGlzQ2FzZSA9IGgua2luZCA9PT0gS1dfQ2FzZVZhbCB8fCBoLmtpbmQgPT09IEtXX0Nhc2VEb1xuXHRcdGNvbnN0IGV4cHIgPSAoaXNDYXNlID8gcGFyc2VDYXNlIDogcGFyc2VTd2l0Y2gpKGlzVmFsLCB0cnVlLCB0b2tlbnMudGFpbCgpKVxuXG5cdFx0Y29uc3QgYXJncyA9IFtuZXcgTG9jYWxEZWNsYXJlRm9jdXMoaC5sb2MpXVxuXHRcdHJldHVybiBpc1ZhbCA/XG5cdFx0XHR7XG5cdFx0XHRcdGFyZ3MsIG9wUmVzdEFyZzogbnVsbCwgbWVtYmVyQXJnczogW10sIG9wSW46IG51bGwsIG9wT3V0OiBudWxsLFxuXHRcdFx0XHRibG9jazogbmV3IEJsb2NrV2l0aFJldHVybih0b2tlbnMubG9jLCBudWxsLCBbXSwgZXhwcilcblx0XHRcdH0gOlxuXHRcdFx0e1xuXHRcdFx0XHRhcmdzLCBvcFJlc3RBcmc6IG51bGwsIG1lbWJlckFyZ3M6IFtdLCBvcEluOiBudWxsLCBvcE91dDogbnVsbCxcblx0XHRcdFx0YmxvY2s6IG5ldyBCbG9ja0RvKHRva2Vucy5sb2MsIG51bGwsIFtleHByXSlcblx0XHRcdH1cblx0fSBlbHNlIHtcblx0XHRjb25zdCBbYmVmb3JlLCBibG9ja0xpbmVzXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0XHRjb25zdCB7YXJncywgb3BSZXN0QXJnLCBtZW1iZXJBcmdzfSA9IHBhcnNlRnVuTG9jYWxzKGJlZm9yZSwgaW5jbHVkZU1lbWJlckFyZ3MpXG5cdFx0Zm9yIChjb25zdCBhcmcgb2YgYXJncylcblx0XHRcdGlmICghYXJnLmlzTGF6eSgpKVxuXHRcdFx0XHRhcmcua2luZCA9IExEX011dGFibGVcblx0XHRjb25zdCBbb3BJbiwgcmVzdDBdID0gdHJ5VGFrZUluT3JPdXQoS1dfSW4sIGJsb2NrTGluZXMpXG5cdFx0Y29uc3QgW29wT3V0LCByZXN0MV0gPSB0cnlUYWtlSW5Pck91dChLV19PdXQsIHJlc3QwKVxuXHRcdGNvbnN0IGJsb2NrID0gKGlzRG8gPyBwYXJzZUJsb2NrRG8gOiBwYXJzZUJsb2NrVmFsKShyZXN0MSlcblx0XHRyZXR1cm4ge2FyZ3MsIG9wUmVzdEFyZywgbWVtYmVyQXJncywgYmxvY2ssIG9wSW4sIG9wT3V0fVxuXHR9XG59XG5cbmNvbnN0XG5cdHRyeVRha2VSZXR1cm5UeXBlID0gdG9rZW5zID0+IHtcblx0XHRpZiAoIXRva2Vucy5pc0VtcHR5KCkpIHtcblx0XHRcdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpXG5cdFx0XHRpZiAoaXNHcm91cChHX1NwYWNlLCBoKSAmJiBpc0tleXdvcmQoS1dfVHlwZSwgaGVhZChoLnN1YlRva2VucykpKVxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdG9wUmV0dXJuVHlwZTogcGFyc2VTcGFjZWQoU2xpY2UuZ3JvdXAoaCkudGFpbCgpKSxcblx0XHRcdFx0XHRyZXN0OiB0b2tlbnMudGFpbCgpXG5cdFx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHtvcFJldHVyblR5cGU6IG51bGwsIHJlc3Q6IHRva2Vuc31cblx0fSxcblxuXHRmdW5Gb2N1c0tleXdvcmRzID0gbmV3IFNldChbS1dfQ2FzZVZhbCwgS1dfQ2FzZURvLCBLV19Td2l0Y2hWYWwsIEtXX1N3aXRjaERvXSksXG5cblx0cGFyc2VGdW5Mb2NhbHMgPSAodG9rZW5zLCBpbmNsdWRlTWVtYmVyQXJncykgPT4ge1xuXHRcdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdFx0cmV0dXJuIHthcmdzOiBbXSwgbWVtYmVyQXJnczogW10sIG9wUmVzdEFyZzogbnVsbH1cblx0XHRlbHNlIHtcblx0XHRcdGxldCByZXN0LCBvcFJlc3RBcmdcblx0XHRcdGNvbnN0IGwgPSB0b2tlbnMubGFzdCgpXG5cdFx0XHRpZiAobCBpbnN0YW5jZW9mIERvdE5hbWUgJiYgbC5uRG90cyA9PT0gMykge1xuXHRcdFx0XHRyZXN0ID0gdG9rZW5zLnJ0YWlsKClcblx0XHRcdFx0b3BSZXN0QXJnID0gTG9jYWxEZWNsYXJlLnBsYWluKGwubG9jLCBsLm5hbWUpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXN0ID0gdG9rZW5zXG5cdFx0XHRcdG9wUmVzdEFyZyA9IG51bGxcblx0XHRcdH1cblxuXHRcdFx0aWYgKGluY2x1ZGVNZW1iZXJBcmdzKSB7XG5cdFx0XHRcdGNvbnN0IHtkZWNsYXJlczogYXJncywgbWVtYmVyQXJnc30gPSBwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzKHJlc3QpXG5cdFx0XHRcdHJldHVybiB7YXJncywgbWVtYmVyQXJncywgb3BSZXN0QXJnfVxuXHRcdFx0fSBlbHNlXG5cdFx0XHRcdHJldHVybiB7YXJnczogcGFyc2VMb2NhbERlY2xhcmVzKHJlc3QpLCBvcFJlc3RBcmd9XG5cdFx0fVxuXHR9LFxuXG5cdHRyeVRha2VJbk9yT3V0ID0gKGluT3JPdXQsIHRva2VucykgPT4ge1xuXHRcdGlmICghdG9rZW5zLmlzRW1wdHkoKSkge1xuXHRcdFx0Y29uc3QgZmlyc3RMaW5lID0gdG9rZW5zLmhlYWRTbGljZSgpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKGluT3JPdXQsIGZpcnN0TGluZS5oZWFkKCkpKSB7XG5cdFx0XHRcdGNvbnN0IGluT3V0ID0gbmV3IEJsb2NrRG8oXG5cdFx0XHRcdFx0Zmlyc3RMaW5lLmxvYyxcblx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdHBhcnNlTGluZXNGcm9tQmxvY2soZmlyc3RMaW5lKSlcblx0XHRcdFx0cmV0dXJuIFtpbk91dCwgdG9rZW5zLnRhaWwoKV1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIFtudWxsLCB0b2tlbnNdXG5cdH1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

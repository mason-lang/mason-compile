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
				const inOut = new _MsAst.Debug(firstLine.loc, (0, _parseBlock.parseLinesFromBlock)(firstLine));
				return [inOut, tokens.tail()];
			}
		}
		return [null, tokens];
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlRnVuLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZUZ1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQ2NlLENBQUMsSUFBSSxFQUFFLE1BQU0sS0FBSztBQUNoQyxNQUFJLE1BQU0sR0FBRyxLQUFLO01BQUUsSUFBSSxHQUFHLEtBQUs7TUFBRSxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQy9DLFVBQVEsSUFBSTtBQUNYLGVBZmlGLE1BQU07QUFnQnRGLFVBQUs7QUFBQSxBQUNOLGVBaEJELFFBQVE7QUFpQk4sUUFBSSxHQUFHLElBQUksQ0FBQTtBQUNYLFVBQUs7QUFBQSxBQUNOLGVBbkJTLFNBQVM7QUFvQmpCLFNBQUssR0FBRyxJQUFJLENBQUE7QUFDWixVQUFLO0FBQUEsQUFDTixlQXRCb0IsV0FBVztBQXVCOUIsU0FBSyxHQUFHLElBQUksQ0FBQTtBQUNaLFFBQUksR0FBRyxJQUFJLENBQUE7QUFDWCxVQUFLO0FBQUEsQUFDTixlQTFCaUMsVUFBVTtBQTJCMUMsVUFBTSxHQUFHLElBQUksQ0FBQTtBQUNiLFVBQUs7QUFBQSxBQUNOLGVBN0I2QyxZQUFZO0FBOEJ4RCxVQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2IsUUFBSSxHQUFHLElBQUksQ0FBQTtBQUNYLFVBQUs7QUFBQSxBQUNOLGVBakMyRCxhQUFhO0FBa0N2RSxVQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2IsU0FBSyxHQUFHLElBQUksQ0FBQTtBQUNaLFVBQUs7QUFBQSxBQUNOLGVBckMwRSxlQUFlO0FBc0N4RixVQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2IsU0FBSyxHQUFHLElBQUksQ0FBQTtBQUNaLFFBQUksR0FBRyxJQUFJLENBQUE7QUFDWCxVQUFLO0FBQUEsQUFDTjtBQUFTLFVBQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQTtBQUFBLEdBQzFCO0FBQ0QsUUFBTSxhQUFhLEdBQUcsVUExQ0QsSUFBSSxFQTBDRSxNQUFNLEVBQUUsTUFBTSxX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TSxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFBO0FBQ3BDLE9BQUksV0F6STBDLFNBQVMsRUF5SXpDLE9BQU8sRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRTtBQUN6QyxVQUFNLEtBQUssR0FBRyxXQTVJZ0IsS0FBSyxDQTZJbEMsU0FBUyxDQUFDLEdBQUcsRUFDYixnQkF2SWdELG1CQUFtQixFQXVJL0MsU0FBUyxDQUFDLENBQUMsQ0FBQTtBQUNoQyxXQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0lBQzdCO0dBQ0Q7QUFDRCxTQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0VBQ3JCLENBQUEiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9wYXJzZUZ1bi5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHtCbG9ja0RvLCBCbG9ja1dpdGhSZXR1cm4sIERlYnVnLCBGdW4sIExEX011dGFibGUsIExvY2FsRGVjbGFyZSwgTG9jYWxEZWNsYXJlRm9jdXMsXG5cdExvY2FsRGVjbGFyZVJlcywgTG9jYWxEZWNsYXJlVGhpc30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0RvdE5hbWUsIEdfU3BhY2UsIGlzQW55S2V5d29yZCwgaXNHcm91cCwgaXNLZXl3b3JkLCBLV19DYXNlRG8sIEtXX0Nhc2VWYWwsIEtXX0Z1bixcblx0S1dfRnVuRG8sIEtXX0Z1bkdlbiwgS1dfRnVuR2VuRG8sIEtXX0Z1blRoaXMsIEtXX0Z1blRoaXNEbywgS1dfRnVuVGhpc0dlbiwgS1dfRnVuVGhpc0dlbkRvLFxuXHRLV19JbiwgS1dfT3V0LCBLV19Td2l0Y2hEbywgS1dfU3dpdGNoVmFsLCBLV19UeXBlfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aGVhZCwgaWZFbHNlLCBvcElmLCBvcE1hcH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tOb25FbXB0eX0gZnJvbSAnLi9jb250ZXh0J1xuaW1wb3J0IHtiZWZvcmVBbmRCbG9jaywgcGFyc2VCbG9ja0RvLCBwYXJzZUJsb2NrVmFsLCBwYXJzZUxpbmVzRnJvbUJsb2NrfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQgcGFyc2VDYXNlIGZyb20gJy4vcGFyc2VDYXNlJ1xuaW1wb3J0IHBhcnNlTG9jYWxEZWNsYXJlcywge3BhcnNlTG9jYWxEZWNsYXJlc0FuZE1lbWJlckFyZ3N9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuaW1wb3J0IHBhcnNlU3BhY2VkIGZyb20gJy4vcGFyc2VTcGFjZWQnXG5pbXBvcnQgcGFyc2VTd2l0Y2ggZnJvbSAnLi9wYXJzZVN3aXRjaCdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG5leHBvcnQgZGVmYXVsdCAoa2luZCwgdG9rZW5zKSA9PiB7XG5cdGxldCBpc1RoaXMgPSBmYWxzZSwgaXNEbyA9IGZhbHNlLCBpc0dlbiA9IGZhbHNlXG5cdHN3aXRjaCAoa2luZCkge1xuXHRcdGNhc2UgS1dfRnVuOlxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1bkRvOlxuXHRcdFx0aXNEbyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5HZW46XG5cdFx0XHRpc0dlbiA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5HZW5Ebzpcblx0XHRcdGlzR2VuID0gdHJ1ZVxuXHRcdFx0aXNEbyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5UaGlzOlxuXHRcdFx0aXNUaGlzID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1blRoaXNEbzpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuVGhpc0dlbjpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGlzR2VuID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1blRoaXNHZW5Ebzpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGlzR2VuID0gdHJ1ZVxuXHRcdFx0aXNEbyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKClcblx0fVxuXHRjb25zdCBvcERlY2xhcmVUaGlzID0gb3BJZihpc1RoaXMsICgpID0+IG5ldyBMb2NhbERlY2xhcmVUaGlzKHRva2Vucy5sb2MpKVxuXG5cdGNvbnN0IHtvcFJldHVyblR5cGUsIHJlc3R9ID0gdHJ5VGFrZVJldHVyblR5cGUodG9rZW5zKVxuXHRjb25zdCB7YXJncywgb3BSZXN0QXJnLCBibG9jaywgb3BJbiwgb3BPdXQsIG9wQ29tbWVudH0gPSBfZnVuQXJnc0FuZEJsb2NrKGlzRG8sIHJlc3QpXG5cdC8vIE5lZWQgcmVzIGRlY2xhcmUgaWYgdGhlcmUgaXMgYSByZXR1cm4gdHlwZSBvciBvdXQgY29uZGl0aW9uLlxuXHRjb25zdCBvcERlY2xhcmVSZXMgPSBpZkVsc2Uob3BSZXR1cm5UeXBlLFxuXHRcdF8gPT4gbmV3IExvY2FsRGVjbGFyZVJlcyhfLmxvYywgXyksXG5cdFx0KCkgPT4gb3BNYXAob3BPdXQsIF8gPT4gbmV3IExvY2FsRGVjbGFyZVJlcyhfLmxvYywgbnVsbCkpKVxuXHRyZXR1cm4gbmV3IEZ1bih0b2tlbnMubG9jLFxuXHRcdG9wRGVjbGFyZVRoaXMsIGlzR2VuLCBhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBvcEluLCBvcERlY2xhcmVSZXMsIG9wT3V0LCBvcENvbW1lbnQpXG59XG5cbi8qXG5pbmNsdWRlTWVtYmVyQXJnczpcblx0aWYgdHJ1ZSwgb3V0cHV0IHdpbGwgaW5jbHVkZSBgbWVtYmVyQXJnc2AuXG5cdFRoaXMgaXMgYSBzdWJzZXQgb2YgYGFyZ3NgIHdob3NlIG5hbWVzIGFyZSBwcmVmaXhlZCB3aXRoIGAuYFxuXHRlLmcuOiBgY29uc3RydWN0ISAueCAueWBcblx0VGhpcyBpcyBmb3IgY29uc3RydWN0b3JzIG9ubHkuXG4qL1xuZXhwb3J0IGNvbnN0IF9mdW5BcmdzQW5kQmxvY2sgPSAoaXNEbywgdG9rZW5zLCBpbmNsdWRlTWVtYmVyQXJncykgPT4ge1xuXHRjaGVja05vbkVtcHR5KHRva2VucywgJ0V4cGVjdGVkIGFuIGluZGVudGVkIGJsb2NrLicpXG5cdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpXG5cblx0Ly8gTWlnaHQgYmUgYHxjYXNlYCAob3IgYHxjYXNlIWAsIGB8c3dpdGNoYCwgYHxzd2l0Y2ghYClcblx0aWYgKGlzQW55S2V5d29yZChmdW5Gb2N1c0tleXdvcmRzLCBoKSkge1xuXHRcdGNvbnN0IGlzVmFsID0gaC5raW5kID09PSBLV19DYXNlVmFsIHx8IGgua2luZCA9PT0gS1dfU3dpdGNoVmFsXG5cdFx0Y29uc3QgaXNDYXNlID0gaC5raW5kID09PSBLV19DYXNlVmFsIHx8IGgua2luZCA9PT0gS1dfQ2FzZURvXG5cdFx0Y29uc3QgZXhwciA9IChpc0Nhc2UgPyBwYXJzZUNhc2UgOiBwYXJzZVN3aXRjaCkoaXNWYWwsIHRydWUsIHRva2Vucy50YWlsKCkpXG5cblx0XHRjb25zdCBhcmdzID0gW25ldyBMb2NhbERlY2xhcmVGb2N1cyhoLmxvYyldXG5cdFx0cmV0dXJuIGlzVmFsID9cblx0XHRcdHtcblx0XHRcdFx0YXJncywgb3BSZXN0QXJnOiBudWxsLCBtZW1iZXJBcmdzOiBbXSwgb3BJbjogbnVsbCwgb3BPdXQ6IG51bGwsXG5cdFx0XHRcdGJsb2NrOiBuZXcgQmxvY2tXaXRoUmV0dXJuKHRva2Vucy5sb2MsIG51bGwsIFtdLCBleHByKVxuXHRcdFx0fSA6XG5cdFx0XHR7XG5cdFx0XHRcdGFyZ3MsIG9wUmVzdEFyZzogbnVsbCwgbWVtYmVyQXJnczogW10sIG9wSW46IG51bGwsIG9wT3V0OiBudWxsLFxuXHRcdFx0XHRibG9jazogbmV3IEJsb2NrRG8odG9rZW5zLmxvYywgbnVsbCwgW2V4cHJdKVxuXHRcdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrTGluZXNdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRcdGNvbnN0IHthcmdzLCBvcFJlc3RBcmcsIG1lbWJlckFyZ3N9ID0gcGFyc2VGdW5Mb2NhbHMoYmVmb3JlLCBpbmNsdWRlTWVtYmVyQXJncylcblx0XHRmb3IgKGNvbnN0IGFyZyBvZiBhcmdzKVxuXHRcdFx0aWYgKCFhcmcuaXNMYXp5KCkpXG5cdFx0XHRcdGFyZy5raW5kID0gTERfTXV0YWJsZVxuXHRcdGNvbnN0IFtvcEluLCByZXN0MF0gPSB0cnlUYWtlSW5Pck91dChLV19JbiwgYmxvY2tMaW5lcylcblx0XHRjb25zdCBbb3BPdXQsIHJlc3QxXSA9IHRyeVRha2VJbk9yT3V0KEtXX091dCwgcmVzdDApXG5cdFx0Y29uc3QgYmxvY2sgPSAoaXNEbyA/IHBhcnNlQmxvY2tEbyA6IHBhcnNlQmxvY2tWYWwpKHJlc3QxKVxuXHRcdHJldHVybiB7YXJncywgb3BSZXN0QXJnLCBtZW1iZXJBcmdzLCBibG9jaywgb3BJbiwgb3BPdXR9XG5cdH1cbn1cblxuY29uc3Rcblx0dHJ5VGFrZVJldHVyblR5cGUgPSB0b2tlbnMgPT4ge1xuXHRcdGlmICghdG9rZW5zLmlzRW1wdHkoKSkge1xuXHRcdFx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKClcblx0XHRcdGlmIChpc0dyb3VwKEdfU3BhY2UsIGgpICYmIGlzS2V5d29yZChLV19UeXBlLCBoZWFkKGguc3ViVG9rZW5zKSkpXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0b3BSZXR1cm5UeXBlOiBwYXJzZVNwYWNlZChTbGljZS5ncm91cChoKS50YWlsKCkpLFxuXHRcdFx0XHRcdHJlc3Q6IHRva2Vucy50YWlsKClcblx0XHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4ge29wUmV0dXJuVHlwZTogbnVsbCwgcmVzdDogdG9rZW5zfVxuXHR9LFxuXG5cdGZ1bkZvY3VzS2V5d29yZHMgPSBuZXcgU2V0KFtLV19DYXNlVmFsLCBLV19DYXNlRG8sIEtXX1N3aXRjaFZhbCwgS1dfU3dpdGNoRG9dKSxcblxuXHRwYXJzZUZ1bkxvY2FscyA9ICh0b2tlbnMsIGluY2x1ZGVNZW1iZXJBcmdzKSA9PiB7XG5cdFx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0XHRyZXR1cm4ge2FyZ3M6IFtdLCBtZW1iZXJBcmdzOiBbXSwgb3BSZXN0QXJnOiBudWxsfVxuXHRcdGVsc2Uge1xuXHRcdFx0bGV0IHJlc3QsIG9wUmVzdEFyZ1xuXHRcdFx0Y29uc3QgbCA9IHRva2Vucy5sYXN0KClcblx0XHRcdGlmIChsIGluc3RhbmNlb2YgRG90TmFtZSAmJiBsLm5Eb3RzID09PSAzKSB7XG5cdFx0XHRcdHJlc3QgPSB0b2tlbnMucnRhaWwoKVxuXHRcdFx0XHRvcFJlc3RBcmcgPSBMb2NhbERlY2xhcmUucGxhaW4obC5sb2MsIGwubmFtZSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJlc3QgPSB0b2tlbnNcblx0XHRcdFx0b3BSZXN0QXJnID0gbnVsbFxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoaW5jbHVkZU1lbWJlckFyZ3MpIHtcblx0XHRcdFx0Y29uc3Qge2RlY2xhcmVzOiBhcmdzLCBtZW1iZXJBcmdzfSA9IHBhcnNlTG9jYWxEZWNsYXJlc0FuZE1lbWJlckFyZ3MocmVzdClcblx0XHRcdFx0cmV0dXJuIHthcmdzLCBtZW1iZXJBcmdzLCBvcFJlc3RBcmd9XG5cdFx0XHR9IGVsc2Vcblx0XHRcdFx0cmV0dXJuIHthcmdzOiBwYXJzZUxvY2FsRGVjbGFyZXMocmVzdCksIG9wUmVzdEFyZ31cblx0XHR9XG5cdH0sXG5cblx0dHJ5VGFrZUluT3JPdXQgPSAoaW5Pck91dCwgdG9rZW5zKSA9PiB7XG5cdFx0aWYgKCF0b2tlbnMuaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCBmaXJzdExpbmUgPSB0b2tlbnMuaGVhZFNsaWNlKClcblx0XHRcdGlmIChpc0tleXdvcmQoaW5Pck91dCwgZmlyc3RMaW5lLmhlYWQoKSkpIHtcblx0XHRcdFx0Y29uc3QgaW5PdXQgPSBuZXcgRGVidWcoXG5cdFx0XHRcdFx0Zmlyc3RMaW5lLmxvYyxcblx0XHRcdFx0XHRwYXJzZUxpbmVzRnJvbUJsb2NrKGZpcnN0TGluZSkpXG5cdFx0XHRcdHJldHVybiBbaW5PdXQsIHRva2Vucy50YWlsKCldXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBbbnVsbCwgdG9rZW5zXVxuXHR9XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

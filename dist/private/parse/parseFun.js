if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', '../MsAst', '../Token', '../util', './checks', './parseBlock', './parseCase', './parseLocalDeclares', './parseSpaced', './parseSwitch', './Slice'], function (exports, _MsAst, _Token, _util, _checks, _parseBlock, _parseCase, _parseLocalDeclares, _parseSpaced, _parseSwitch, _Slice) {
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
		const opComment = _funArgsAndBlock2.opComment;

		// Need res declare if there is a return type.
		const opDeclareRes = (0, _util.opMap)(opReturnType, _ => new _MsAst.LocalDeclareRes(_.loc, _));
		return new _MsAst.Fun(tokens.loc, opDeclareThis, isGen, args, opRestArg, block, opDeclareRes, opComment);
	};

	/*
 includeMemberArgs:
 	if true, output will include `memberArgs`.
 	This is a subset of `args` whose names are prefixed with `.`
 	e.g.: `construct! .x .y`
 	This is for constructors only.
 */
	const _funArgsAndBlock = (isDo, tokens, includeMemberArgs) => {
		(0, _checks.checkNonEmpty)(tokens, 'Expected an indented block.');
		const h = tokens.head();

		// Might be `|case` (or `|case!`, `|switch`, `|switch!`)
		if ((0, _Token.isAnyKeyword)(funFocusKeywords, h)) {
			const isVal = h.kind === _Token.KW_CaseVal || h.kind === _Token.KW_SwitchVal;
			const isCase = h.kind === _Token.KW_CaseVal || h.kind === _Token.KW_CaseDo;
			const expr = (isCase ? _parseCase2.default : _parseSwitch2.default)(isVal, true, tokens.tail());

			const args = [new _MsAst.LocalDeclareFocus(h.loc)];
			return isVal ? {
				args, opRestArg: null, memberArgs: [],
				block: new _MsAst.BlockWithReturn(tokens.loc, null, [], expr)
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

			for (const arg of args) if (!arg.isLazy()) arg.kind = _MsAst.LD_Mutable;
			const block = (isDo ? _parseBlock.parseBlockDo : _parseBlock.parseBlockVal)(blockLines);
			return { args, opRestArg, memberArgs, block };
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
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlRnVuLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZUZ1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQ2VlLENBQUMsSUFBSSxFQUFFLE1BQU0sS0FBSztBQUNoQyxNQUFJLE1BQU0sR0FBRyxLQUFLO01BQUUsSUFBSSxHQUFHLEtBQUs7TUFBRSxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQy9DLFVBQVEsSUFBSTtBQUNYLGVBaEJxRixNQUFNO0FBaUIxRixVQUFLO0FBQUEsQUFDTixlQWpCRCxRQUFRO0FBa0JOLFFBQUksR0FBRyxJQUFJLENBQUE7QUFDWCxVQUFLO0FBQUEsQUFDTixlQXBCUyxTQUFTO0FBcUJqQixTQUFLLEdBQUcsSUFBSSxDQUFBO0FBQ1osVUFBSztBQUFBLEFBQ04sZUF2Qm9CLFdBQVc7QUF3QjlCLFNBQUssR0FBRyxJQUFJLENBQUE7QUFDWixRQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ1gsVUFBSztBQUFBLEFBQ04sZUEzQmlDLFVBQVU7QUE0QjFDLFVBQU0sR0FBRyxJQUFJLENBQUE7QUFDYixVQUFLO0FBQUEsQUFDTixlQTlCNkMsWUFBWTtBQStCeEQsVUFBTSxHQUFHLElBQUksQ0FBQTtBQUNiLFFBQUksR0FBRyxJQUFJLENBQUE7QUFDWCxVQUFLO0FBQUEsQUFDTixlQWxDMkQsYUFBYTtBQW1DdkUsVUFBTSxHQUFHLElBQUksQ0FBQTtBQUNiLFNBQUssR0FBRyxJQUFJLENBQUE7QUFDWixVQUFLO0FBQUEsQUFDTixlQXRDMEUsZUFBZTtBQXVDeEYsVUFBTSxHQUFHLElBQUksQ0FBQTtBQUNiLFNBQUssR0FBRyxJQUFJLENBQUE7QUFDWixRQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ1gsVUFBSztBQUFBLEFBQ047QUFBUyxVQUFNLElBQUksS0FBSyxFQUFFLENBQUE7QUFBQSxHQUMxQjtBQUNELFFBQU0sYUFBYSxHQUFHLFVBM0NULElBQUksRUEyQ1UsTUFBTSxFQUFFLE1BQU0s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QUMsR0FBRyxnQkFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDeEIsUUFBSSxXQXJIZ0MsU0FBUyxTQUF5QixXQUFXLEVBcUh0RCxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRTtBQUNyQyxTQUFJLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ3JCLGNBQVMsR0FBRyx3QkFoSFcsMkJBQTJCLEVBZ0hWLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0tBQ2pEO0lBQ0Q7QUFDRCxPQUFJLGlCQUFpQixFQUFFOzJDQUNlLHdCQXBIZ0IsK0JBQStCLEVBb0hmLElBQUksQ0FBQzs7VUFBekQsSUFBSSxvQ0FBZCxRQUFRO1VBQVEsVUFBVSxvQ0FBVixVQUFVOztBQUNqQyxXQUFPLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUMsQ0FBQTtJQUNwQyxNQUNBLE9BQU8sRUFBQyxJQUFJLEVBQUUsa0NBQW1CLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBQyxDQUFBO0dBQ25EO0VBQ0QsQ0FBQSIsImZpbGUiOiJwcml2YXRlL3BhcnNlL3BhcnNlRnVuLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge0Jsb2NrRG8sIEJsb2NrV2l0aFJldHVybiwgRnVuLCBMRF9NdXRhYmxlLCBMb2NhbERlY2xhcmVGb2N1cywgTG9jYWxEZWNsYXJlUmVzLFxuXHRMb2NhbERlY2xhcmVUaGlzfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R19TcGFjZSwgaXNBbnlLZXl3b3JkLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtXX0Nhc2VEbywgS1dfQ2FzZVZhbCwgS1dfRWxsaXBzaXMsIEtXX0Z1bixcblx0S1dfRnVuRG8sIEtXX0Z1bkdlbiwgS1dfRnVuR2VuRG8sIEtXX0Z1blRoaXMsIEtXX0Z1blRoaXNEbywgS1dfRnVuVGhpc0dlbiwgS1dfRnVuVGhpc0dlbkRvLFxuXHRLV19Td2l0Y2hEbywgS1dfU3dpdGNoVmFsLCBLV19UeXBlfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aGVhZCwgb3BJZiwgb3BNYXB9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2NoZWNrTm9uRW1wdHl9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtiZWZvcmVBbmRCbG9jaywgcGFyc2VCbG9ja0RvLCBwYXJzZUJsb2NrVmFsfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQgcGFyc2VDYXNlIGZyb20gJy4vcGFyc2VDYXNlJ1xuaW1wb3J0IHBhcnNlTG9jYWxEZWNsYXJlcywge3BhcnNlTG9jYWxEZWNsYXJlRnJvbVNwYWNlZCwgcGFyc2VMb2NhbERlY2xhcmVzQW5kTWVtYmVyQXJnc1xuXHR9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuaW1wb3J0IHBhcnNlU3BhY2VkIGZyb20gJy4vcGFyc2VTcGFjZWQnXG5pbXBvcnQgcGFyc2VTd2l0Y2ggZnJvbSAnLi9wYXJzZVN3aXRjaCdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG5leHBvcnQgZGVmYXVsdCAoa2luZCwgdG9rZW5zKSA9PiB7XG5cdGxldCBpc1RoaXMgPSBmYWxzZSwgaXNEbyA9IGZhbHNlLCBpc0dlbiA9IGZhbHNlXG5cdHN3aXRjaCAoa2luZCkge1xuXHRcdGNhc2UgS1dfRnVuOlxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1bkRvOlxuXHRcdFx0aXNEbyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5HZW46XG5cdFx0XHRpc0dlbiA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5HZW5Ebzpcblx0XHRcdGlzR2VuID0gdHJ1ZVxuXHRcdFx0aXNEbyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLV19GdW5UaGlzOlxuXHRcdFx0aXNUaGlzID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1blRoaXNEbzpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS1dfRnVuVGhpc0dlbjpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGlzR2VuID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtXX0Z1blRoaXNHZW5Ebzpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGlzR2VuID0gdHJ1ZVxuXHRcdFx0aXNEbyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKClcblx0fVxuXHRjb25zdCBvcERlY2xhcmVUaGlzID0gb3BJZihpc1RoaXMsICgpID0+IG5ldyBMb2NhbERlY2xhcmVUaGlzKHRva2Vucy5sb2MpKVxuXG5cdGNvbnN0IHtvcFJldHVyblR5cGUsIHJlc3R9ID0gdHJ5VGFrZVJldHVyblR5cGUodG9rZW5zKVxuXHRjb25zdCB7YXJncywgb3BSZXN0QXJnLCBibG9jaywgb3BDb21tZW50fSA9IF9mdW5BcmdzQW5kQmxvY2soaXNEbywgcmVzdClcblx0Ly8gTmVlZCByZXMgZGVjbGFyZSBpZiB0aGVyZSBpcyBhIHJldHVybiB0eXBlLlxuXHRjb25zdCBvcERlY2xhcmVSZXMgPSBvcE1hcChvcFJldHVyblR5cGUsIF8gPT4gbmV3IExvY2FsRGVjbGFyZVJlcyhfLmxvYywgXykpXG5cdHJldHVybiBuZXcgRnVuKHRva2Vucy5sb2MsXG5cdFx0b3BEZWNsYXJlVGhpcywgaXNHZW4sIGFyZ3MsIG9wUmVzdEFyZywgYmxvY2ssIG9wRGVjbGFyZVJlcywgb3BDb21tZW50KVxufVxuXG4vKlxuaW5jbHVkZU1lbWJlckFyZ3M6XG5cdGlmIHRydWUsIG91dHB1dCB3aWxsIGluY2x1ZGUgYG1lbWJlckFyZ3NgLlxuXHRUaGlzIGlzIGEgc3Vic2V0IG9mIGBhcmdzYCB3aG9zZSBuYW1lcyBhcmUgcHJlZml4ZWQgd2l0aCBgLmBcblx0ZS5nLjogYGNvbnN0cnVjdCEgLnggLnlgXG5cdFRoaXMgaXMgZm9yIGNvbnN0cnVjdG9ycyBvbmx5LlxuKi9cbmV4cG9ydCBjb25zdCBfZnVuQXJnc0FuZEJsb2NrID0gKGlzRG8sIHRva2VucywgaW5jbHVkZU1lbWJlckFyZ3MpID0+IHtcblx0Y2hlY2tOb25FbXB0eSh0b2tlbnMsICdFeHBlY3RlZCBhbiBpbmRlbnRlZCBibG9jay4nKVxuXHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXG5cdC8vIE1pZ2h0IGJlIGB8Y2FzZWAgKG9yIGB8Y2FzZSFgLCBgfHN3aXRjaGAsIGB8c3dpdGNoIWApXG5cdGlmIChpc0FueUtleXdvcmQoZnVuRm9jdXNLZXl3b3JkcywgaCkpIHtcblx0XHRjb25zdCBpc1ZhbCA9IGgua2luZCA9PT0gS1dfQ2FzZVZhbCB8fCBoLmtpbmQgPT09IEtXX1N3aXRjaFZhbFxuXHRcdGNvbnN0IGlzQ2FzZSA9IGgua2luZCA9PT0gS1dfQ2FzZVZhbCB8fCBoLmtpbmQgPT09IEtXX0Nhc2VEb1xuXHRcdGNvbnN0IGV4cHIgPSAoaXNDYXNlID8gcGFyc2VDYXNlIDogcGFyc2VTd2l0Y2gpKGlzVmFsLCB0cnVlLCB0b2tlbnMudGFpbCgpKVxuXG5cdFx0Y29uc3QgYXJncyA9IFtuZXcgTG9jYWxEZWNsYXJlRm9jdXMoaC5sb2MpXVxuXHRcdHJldHVybiBpc1ZhbCA/XG5cdFx0XHR7XG5cdFx0XHRcdGFyZ3MsIG9wUmVzdEFyZzogbnVsbCwgbWVtYmVyQXJnczogW10sXG5cdFx0XHRcdGJsb2NrOiBuZXcgQmxvY2tXaXRoUmV0dXJuKHRva2Vucy5sb2MsIG51bGwsIFtdLCBleHByKVxuXHRcdFx0fSA6XG5cdFx0XHR7XG5cdFx0XHRcdGFyZ3MsIG9wUmVzdEFyZzogbnVsbCwgbWVtYmVyQXJnczogW10sXG5cdFx0XHRcdGJsb2NrOiBuZXcgQmxvY2tEbyh0b2tlbnMubG9jLCBudWxsLCBbZXhwcl0pXG5cdFx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tMaW5lc10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdFx0Y29uc3Qge2FyZ3MsIG9wUmVzdEFyZywgbWVtYmVyQXJnc30gPSBwYXJzZUZ1bkxvY2FscyhiZWZvcmUsIGluY2x1ZGVNZW1iZXJBcmdzKVxuXHRcdGZvciAoY29uc3QgYXJnIG9mIGFyZ3MpXG5cdFx0XHRpZiAoIWFyZy5pc0xhenkoKSlcblx0XHRcdFx0YXJnLmtpbmQgPSBMRF9NdXRhYmxlXG5cdFx0Y29uc3QgYmxvY2sgPSAoaXNEbyA/IHBhcnNlQmxvY2tEbyA6IHBhcnNlQmxvY2tWYWwpKGJsb2NrTGluZXMpXG5cdFx0cmV0dXJuIHthcmdzLCBvcFJlc3RBcmcsIG1lbWJlckFyZ3MsIGJsb2NrfVxuXHR9XG59XG5cbmNvbnN0XG5cdHRyeVRha2VSZXR1cm5UeXBlID0gdG9rZW5zID0+IHtcblx0XHRpZiAoIXRva2Vucy5pc0VtcHR5KCkpIHtcblx0XHRcdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpXG5cdFx0XHRpZiAoaXNHcm91cChHX1NwYWNlLCBoKSAmJiBpc0tleXdvcmQoS1dfVHlwZSwgaGVhZChoLnN1YlRva2VucykpKVxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdG9wUmV0dXJuVHlwZTogcGFyc2VTcGFjZWQoU2xpY2UuZ3JvdXAoaCkudGFpbCgpKSxcblx0XHRcdFx0XHRyZXN0OiB0b2tlbnMudGFpbCgpXG5cdFx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHtvcFJldHVyblR5cGU6IG51bGwsIHJlc3Q6IHRva2Vuc31cblx0fSxcblxuXHRmdW5Gb2N1c0tleXdvcmRzID0gbmV3IFNldChbS1dfQ2FzZVZhbCwgS1dfQ2FzZURvLCBLV19Td2l0Y2hWYWwsIEtXX1N3aXRjaERvXSksXG5cblx0cGFyc2VGdW5Mb2NhbHMgPSAodG9rZW5zLCBpbmNsdWRlTWVtYmVyQXJncykgPT4ge1xuXHRcdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdFx0cmV0dXJuIHthcmdzOiBbXSwgbWVtYmVyQXJnczogW10sIG9wUmVzdEFyZzogbnVsbH1cblx0XHRlbHNlIHtcblx0XHRcdGxldCByZXN0ID0gdG9rZW5zLCBvcFJlc3RBcmcgPSBudWxsXG5cdFx0XHRjb25zdCBsID0gdG9rZW5zLmxhc3QoKVxuXHRcdFx0aWYgKGlzR3JvdXAoR19TcGFjZSwgbCkpIHtcblx0XHRcdFx0Y29uc3QgZyA9IFNsaWNlLmdyb3VwKGwpXG5cdFx0XHRcdGlmIChpc0tleXdvcmQoS1dfRWxsaXBzaXMsIGcuaGVhZCgpKSkge1xuXHRcdFx0XHRcdHJlc3QgPSB0b2tlbnMucnRhaWwoKVxuXHRcdFx0XHRcdG9wUmVzdEFyZyA9IHBhcnNlTG9jYWxEZWNsYXJlRnJvbVNwYWNlZChnLnRhaWwoKSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGluY2x1ZGVNZW1iZXJBcmdzKSB7XG5cdFx0XHRcdGNvbnN0IHtkZWNsYXJlczogYXJncywgbWVtYmVyQXJnc30gPSBwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzKHJlc3QpXG5cdFx0XHRcdHJldHVybiB7YXJncywgbWVtYmVyQXJncywgb3BSZXN0QXJnfVxuXHRcdFx0fSBlbHNlXG5cdFx0XHRcdHJldHVybiB7YXJnczogcGFyc2VMb2NhbERlY2xhcmVzKHJlc3QpLCBvcFJlc3RBcmd9XG5cdFx0fVxuXHR9XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

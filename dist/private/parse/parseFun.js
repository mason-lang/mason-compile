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

		// Need res declare if there is a return type.
		const opDeclareRes = (0, _util.opMap)(opReturnType, _ => _MsAst.LocalDeclare.res(_.loc, _));
		return new _MsAst.Fun(tokens.loc, args, opRestArg, block, isGenerator, opDeclareThis, opDeclareRes);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlRnVuLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZUZ1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O21CQ2tCd0IsUUFBUTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFqQixVQUFTLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFO0FBQzlDLE1BQUksTUFBTSxHQUFHLEtBQUs7TUFBRSxJQUFJLEdBQUcsS0FBSztNQUFFLFdBQVcsR0FBRyxLQUFLLENBQUE7QUFDckQsVUFBUSxJQUFJO0FBQ1gsUUFBSyxPQXBCMkMsUUFBUSxDQW9CMUMsR0FBRztBQUNoQixVQUFLO0FBQUEsQUFDTixRQUFLLE9BdEIyQyxRQUFRLENBc0IxQyxLQUFLO0FBQ2xCLFFBQUksR0FBRyxJQUFJLENBQUE7QUFDWCxVQUFLO0FBQUEsQUFDTixRQUFLLE9BekIyQyxRQUFRLENBeUIxQyxNQUFNO0FBQ25CLGVBQVcsR0FBRyxJQUFJLENBQUE7QUFDbEIsVUFBSztBQUFBLEFBQ04sUUFBSyxPQTVCMkMsUUFBUSxDQTRCMUMsUUFBUTtBQUNyQixlQUFXLEdBQUcsSUFBSSxDQUFBO0FBQ2xCLFFBQUksR0FBRyxJQUFJLENBQUE7QUFDWCxVQUFLO0FBQUEsQUFDTixRQUFLLE9BaEMyQyxRQUFRLENBZ0MxQyxPQUFPO0FBQ3BCLFVBQU0sR0FBRyxJQUFJLENBQUE7QUFDYixVQUFLO0FBQUEsQUFDTixRQUFLLE9BbkMyQyxRQUFRLENBbUMxQyxTQUFTO0FBQ3RCLFVBQU0sR0FBRyxJQUFJLENBQUE7QUFDYixRQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ1gsVUFBSztBQUFBLEFBQ04sUUFBSyxPQXZDMkMsUUFBUSxDQXVDMUMsVUFBVTtBQUN2QixVQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2IsZUFBVyxHQUFHLElBQUksQ0FBQTtBQUNsQixVQUFLO0FBQUEsQUFDTixRQUFLLE9BM0MyQyxRQUFRLENBMkMxQyxZQUFZO0FBQ3pCLFVBQU0sR0FBRyxJQUFJLENB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OztBQUVGLFVBQVMsY0FBYyxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsRUFBRTtBQUNsRCxNQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFDbkIsT0FBTyxFQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFDLENBQUEsS0FDOUM7QUFDSixPQUFJLElBQUksR0FBRyxNQUFNO09BQUUsU0FBUyxHQUFHLElBQUksQ0FBQTtBQUNuQyxTQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDdkIsT0FBSSxXQWpJd0IsT0FBTyxFQWlJdkIsT0FqSU4sTUFBTSxDQWlJTyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDN0IsVUFBTSxDQUFDLEdBQUcsZ0JBQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3hCLFFBQUksV0FuSWdDLFNBQVMsRUFtSS9CLE9BbklpQyxRQUFRLENBbUloQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUU7QUFDM0MsU0FBSSxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNyQixjQUFTLEdBQUcsd0JBaElZLDJCQUEyQixFQWdJWCxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtLQUNqRDtJQUNEO0FBQ0QsT0FBSSxpQkFBaUIsRUFBRTsyQ0FDZSx3QkFwSWlCLCtCQUErQixFQW9JaEIsSUFBSSxDQUFDOztVQUF6RCxJQUFJLG9DQUFkLFFBQVE7VUFBUSxVQUFVLG9DQUFWLFVBQVU7O0FBQ2pDLFdBQU8sRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBQyxDQUFBO0lBQ3BDLE1BQ0EsT0FBTyxFQUFDLElBQUksRUFBRSxrQ0FBbUIsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFDLENBQUE7R0FDbkQ7RUFDRCIsImZpbGUiOiJwcml2YXRlL3BhcnNlL3BhcnNlRnVuLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge0Jsb2NrRG8sIEJsb2NrVmFsUmV0dXJuLCBGdW4sIExvY2FsRGVjbGFyZSwgTG9jYWxEZWNsYXJlc30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwcywgaXNBbnlLZXl3b3JkLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aGVhZCwgb3BJZiwgb3BNYXB9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2NoZWNrTm9uRW1wdHl9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtiZWZvcmVBbmRCbG9jaywgcGFyc2VCbG9ja0RvLCBwYXJzZUJsb2NrVmFsfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQgcGFyc2VDYXNlIGZyb20gJy4vcGFyc2VDYXNlJ1xuaW1wb3J0IHBhcnNlTG9jYWxEZWNsYXJlcywge3BhcnNlTG9jYWxEZWNsYXJlRnJvbVNwYWNlZCwgcGFyc2VMb2NhbERlY2xhcmVzQW5kTWVtYmVyQXJnc1xuXHR9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuaW1wb3J0IHBhcnNlU3BhY2VkIGZyb20gJy4vcGFyc2VTcGFjZWQnXG5pbXBvcnQgcGFyc2VTd2l0Y2ggZnJvbSAnLi9wYXJzZVN3aXRjaCdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKipcblBhcnNlIGEgZnVuY3Rpb24uXG5AcGFyYW0ga2luZCB7S2V5d29yZHN9IEEgZnVuY3Rpb24ga2V5d29yZC5cbkBwYXJhbSB7U2xpY2V9IHRva2VucyBSZXN0IG9mIHRoZSBsaW5lIGFmdGVyIHRoZSBmdW5jdGlvbiBrZXl3b3JkLlxuQHJldHVybiB7RnVufVxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlRnVuKGtpbmQsIHRva2Vucykge1xuXHRsZXQgaXNUaGlzID0gZmFsc2UsIGlzRG8gPSBmYWxzZSwgaXNHZW5lcmF0b3IgPSBmYWxzZVxuXHRzd2l0Y2ggKGtpbmQpIHtcblx0XHRjYXNlIEtleXdvcmRzLkZ1bjpcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5Ebzpcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuR2VuOlxuXHRcdFx0aXNHZW5lcmF0b3IgPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuR2VuRG86XG5cdFx0XHRpc0dlbmVyYXRvciA9IHRydWVcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpczpcblx0XHRcdGlzVGhpcyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzRG86XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNHZW46XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRpc0dlbmVyYXRvciA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzR2VuRG86XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRpc0dlbmVyYXRvciA9IHRydWVcblx0XHRcdGlzRG8gPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcigpXG5cdH1cblx0Y29uc3Qgb3BEZWNsYXJlVGhpcyA9IG9wSWYoaXNUaGlzLCAoKSA9PiBMb2NhbERlY2xhcmUudGhpcyh0b2tlbnMubG9jKSlcblxuXHRjb25zdCB7b3BSZXR1cm5UeXBlLCByZXN0fSA9IHRyeVRha2VSZXR1cm5UeXBlKHRva2Vucylcblx0Y29uc3Qge2FyZ3MsIG9wUmVzdEFyZywgYmxvY2t9ID0gZnVuQXJnc0FuZEJsb2NrKHJlc3QsIGlzRG8pXG5cdC8vIE5lZWQgcmVzIGRlY2xhcmUgaWYgdGhlcmUgaXMgYSByZXR1cm4gdHlwZS5cblx0Y29uc3Qgb3BEZWNsYXJlUmVzID0gb3BNYXAob3BSZXR1cm5UeXBlLCBfID0+IExvY2FsRGVjbGFyZS5yZXMoXy5sb2MsIF8pKVxuXHRyZXR1cm4gbmV3IEZ1bih0b2tlbnMubG9jLCBhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBpc0dlbmVyYXRvciwgb3BEZWNsYXJlVGhpcywgb3BEZWNsYXJlUmVzKVxufVxuXG4vKipcblBhcnNlIGZ1bmN0aW9uIGFyZ3VtZW50cyBhbmQgYm9keS5cblRoaXMgYWxzbyBoYW5kbGVzIHRoZSBgfGNhc2VgIGFuZCBgfHN3aXRjaGAgZm9ybXMuXG5AcGFyYW0ge1NsaWNlfSB0b2tlbnNcbkBwYXJhbSB7Ym9vbGVhbn0gaXNEbyBXaGV0aGVyIHRoaXMgaXMgYSBgIXxgXG5AcGFyYW0ge2luY2x1ZGVNZW1iZXJBcmdzfVxuXHRUaGlzIGlzIGZvciBjb25zdHJ1Y3RvcnMuXG5cdElmIHRydWUsIG91dHB1dCB3aWxsIGluY2x1ZGUgYG1lbWJlckFyZ3NgLlxuXHRUaGlzIGlzIHRoZSBzdWJzZXQgb2YgYGFyZ3NgIHdob3NlIG5hbWVzIGFyZSBwcmVmaXhlZCB3aXRoIGAuYC5cblx0ZS5nLjogYGNvbnN0cnVjdCEgLnggLnlgXG5AcmV0dXJuIHtcblx0YXJnczogQXJyYXk8TG9jYWxEZWNsYXJlPixcblx0b3BSZXN0QXJnOiA/TG9jYWxEZWNsYXJlLFxuXHRtZW1iZXJBcmdzOkFycmF5PExvY2FsRGVjbGFyZT4sXG5cdGJsb2NrOiBCbG9ja1xufVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBmdW5BcmdzQW5kQmxvY2sodG9rZW5zLCBpc0RvLCBpbmNsdWRlTWVtYmVyQXJncz1mYWxzZSkge1xuXHRjaGVja05vbkVtcHR5KHRva2VucywgJ0V4cGVjdGVkIGFuIGluZGVudGVkIGJsb2NrLicpXG5cdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpXG5cblx0Ly8gTWlnaHQgYmUgYHxjYXNlYCAob3IgYHxjYXNlIWAsIGB8c3dpdGNoYCwgYHxzd2l0Y2ghYClcblx0aWYgKGlzQW55S2V5d29yZChmdW5Gb2N1c0tleXdvcmRzLCBoKSkge1xuXHRcdGNvbnN0IGlzVmFsID0gaC5raW5kID09PSBLZXl3b3Jkcy5DYXNlVmFsIHx8IGgua2luZCA9PT0gS2V5d29yZHMuU3dpdGNoVmFsXG5cdFx0Y29uc3QgaXNDYXNlID0gaC5raW5kID09PSBLZXl3b3Jkcy5DYXNlVmFsIHx8IGgua2luZCA9PT0gS2V5d29yZHMuQ2FzZURvXG5cdFx0Y29uc3QgZXhwciA9IChpc0Nhc2UgPyBwYXJzZUNhc2UgOiBwYXJzZVN3aXRjaCkoaXNWYWwsIHRydWUsIHRva2Vucy50YWlsKCkpXG5cblx0XHRjb25zdCBhcmdzID0gW0xvY2FsRGVjbGFyZS5mb2N1cyhoLmxvYyldXG5cdFx0cmV0dXJuIGlzVmFsID9cblx0XHRcdHtcblx0XHRcdFx0YXJncywgb3BSZXN0QXJnOiBudWxsLCBtZW1iZXJBcmdzOiBbXSxcblx0XHRcdFx0YmxvY2s6IG5ldyBCbG9ja1ZhbFJldHVybih0b2tlbnMubG9jLCBudWxsLCBbXSwgZXhwcilcblx0XHRcdH0gOlxuXHRcdFx0e1xuXHRcdFx0XHRhcmdzLCBvcFJlc3RBcmc6IG51bGwsIG1lbWJlckFyZ3M6IFtdLFxuXHRcdFx0XHRibG9jazogbmV3IEJsb2NrRG8odG9rZW5zLmxvYywgbnVsbCwgW2V4cHJdKVxuXHRcdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrTGluZXNdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRcdGNvbnN0IHthcmdzLCBvcFJlc3RBcmcsIG1lbWJlckFyZ3N9ID0gcGFyc2VGdW5Mb2NhbHMoYmVmb3JlLCBpbmNsdWRlTWVtYmVyQXJncylcblx0XHRmb3IgKGNvbnN0IGFyZyBvZiBhcmdzKVxuXHRcdFx0aWYgKCFhcmcuaXNMYXp5KCkpXG5cdFx0XHRcdGFyZy5raW5kID0gTG9jYWxEZWNsYXJlcy5NdXRhYmxlXG5cdFx0Y29uc3QgYmxvY2sgPSAoaXNEbyA/IHBhcnNlQmxvY2tEbyA6IHBhcnNlQmxvY2tWYWwpKGJsb2NrTGluZXMpXG5cdFx0cmV0dXJuIHthcmdzLCBvcFJlc3RBcmcsIG1lbWJlckFyZ3MsIGJsb2NrfVxuXHR9XG59XG5cbmZ1bmN0aW9uIHRyeVRha2VSZXR1cm5UeXBlKHRva2Vucykge1xuXHRpZiAoIXRva2Vucy5pc0VtcHR5KCkpIHtcblx0XHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXHRcdGlmIChpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgaCkgJiYgaXNLZXl3b3JkKEtleXdvcmRzLlR5cGUsIGhlYWQoaC5zdWJUb2tlbnMpKSlcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdG9wUmV0dXJuVHlwZTogcGFyc2VTcGFjZWQoU2xpY2UuZ3JvdXAoaCkudGFpbCgpKSxcblx0XHRcdFx0cmVzdDogdG9rZW5zLnRhaWwoKVxuXHRcdFx0fVxuXHR9XG5cdHJldHVybiB7b3BSZXR1cm5UeXBlOiBudWxsLCByZXN0OiB0b2tlbnN9XG59XG5cbmNvbnN0IGZ1bkZvY3VzS2V5d29yZHMgPSBuZXcgU2V0KFtcblx0S2V5d29yZHMuQ2FzZVZhbCwgS2V5d29yZHMuQ2FzZURvLCBLZXl3b3Jkcy5Td2l0Y2hWYWwsIEtleXdvcmRzLlN3aXRjaERvXG5dKVxuXG5mdW5jdGlvbiBwYXJzZUZ1bkxvY2Fscyh0b2tlbnMsIGluY2x1ZGVNZW1iZXJBcmdzKSB7XG5cdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdHJldHVybiB7YXJnczogW10sIG1lbWJlckFyZ3M6IFtdLCBvcFJlc3RBcmc6IG51bGx9XG5cdGVsc2Uge1xuXHRcdGxldCByZXN0ID0gdG9rZW5zLCBvcFJlc3RBcmcgPSBudWxsXG5cdFx0Y29uc3QgbCA9IHRva2Vucy5sYXN0KClcblx0XHRpZiAoaXNHcm91cChHcm91cHMuU3BhY2UsIGwpKSB7XG5cdFx0XHRjb25zdCBnID0gU2xpY2UuZ3JvdXAobClcblx0XHRcdGlmIChpc0tleXdvcmQoS2V5d29yZHMuRWxsaXBzaXMsIGcuaGVhZCgpKSkge1xuXHRcdFx0XHRyZXN0ID0gdG9rZW5zLnJ0YWlsKClcblx0XHRcdFx0b3BSZXN0QXJnID0gcGFyc2VMb2NhbERlY2xhcmVGcm9tU3BhY2VkKGcudGFpbCgpKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoaW5jbHVkZU1lbWJlckFyZ3MpIHtcblx0XHRcdGNvbnN0IHtkZWNsYXJlczogYXJncywgbWVtYmVyQXJnc30gPSBwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzKHJlc3QpXG5cdFx0XHRyZXR1cm4ge2FyZ3MsIG1lbWJlckFyZ3MsIG9wUmVzdEFyZ31cblx0XHR9IGVsc2Vcblx0XHRcdHJldHVybiB7YXJnczogcGFyc2VMb2NhbERlY2xhcmVzKHJlc3QpLCBvcFJlc3RBcmd9XG5cdH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

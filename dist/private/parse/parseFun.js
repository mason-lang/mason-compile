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
		const opDeclareThis = (0, _util.opIf)(isThis, () => new _MsAst.LocalDeclareThis(tokens.loc));

		var _tryTakeReturnType = tryTakeReturnType(tokens);

		const opReturnType = _tryTakeReturnType.opReturnType;
		const rest = _tryTakeReturnType.rest;

		var _funArgsAndBlock = funArgsAndBlock(rest, isDo);

		const args = _funArgsAndBlock.args;
		const opRestArg = _funArgsAndBlock.opRestArg;
		const block = _funArgsAndBlock.block;

		// Need res declare if there is a return type.
		const opDeclareRes = (0, _util.opMap)(opReturnType, _ => new _MsAst.LocalDeclareRes(_.loc, _));
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

			const args = [new _MsAst.LocalDeclareFocus(h.loc)];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlRnVuLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZUZ1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O21CQ21Cd0IsUUFBUTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFqQixVQUFTLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFO0FBQzlDLE1BQUksTUFBTSxHQUFHLEtBQUs7TUFBRSxJQUFJLEdBQUcsS0FBSztNQUFFLFdBQVcsR0FBRyxLQUFLLENBQUE7QUFDckQsVUFBUSxJQUFJO0FBQ1gsUUFBSyxPQXBCMkMsUUFBUSxDQW9CMUMsR0FBRztBQUNoQixVQUFLO0FBQUEsQUFDTixRQUFLLE9BdEIyQyxRQUFRLENBc0IxQyxLQUFLO0FBQ2xCLFFBQUksR0FBRyxJQUFJLENBQUE7QUFDWCxVQUFLO0FBQUEsQUFDTixRQUFLLE9BekIyQyxRQUFRLENBeUIxQyxNQUFNO0FBQ25CLGVBQVcsR0FBRyxJQUFJLENBQUE7QUFDbEIsVUFBSztBQUFBLEFBQ04sUUFBSyxPQTVCMkMsUUFBUSxDQTRCMUMsUUFBUTtBQUNyQixlQUFXLEdBQUcsSUFBSSxDQUFBO0FBQ2xCLFFBQUksR0FBRyxJQUFJLENBQUE7QUFDWCxVQUFLO0FBQUEsQUFDTixRQUFLLE9BaEMyQyxRQUFRLENBZ0MxQyxPQUFPO0FBQ3BCLFVBQU0sR0FBRyxJQUFJLENBQUE7QUFDYixVQUFLO0FBQUEsQUFDTixRQUFLLE9BbkMyQyxRQUFRLENBbUMxQyxTQUFTO0FBQ3RCLFVBQU0sR0FBRyxJQUFJLENBQUE7QUFDYixRQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ1gsVUFBSztBQUFBLEFBQ04sUUFBSyxPQXZDMkMsUUFBUSxDQXVDMUMsVUFBVTtBQUN2QixVQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2IsZUFBVyxHQUFHLElBQUksQ0FBQTtBQUNsQixVQUFLO0FBQUEsQUFDTixRQUFLLE9BM0MyQyxRQUFRLENBMkMxQyxZQUFZO0FBQ3pCLFVBQU0sR0FBRyxJQUFJLENBQUE7QUFDYixlQUFXLEdBQUcsSUFBSSxDQUFBO0FBQ2xCLFFBQUksR0FBRyxJQUFJLENBQUE7QUFDWCxVQUFLO0FBQUEsQUFDTjtBQUFTLFVBQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQTtBQUFBLEdBQzFCO0FBQ0QsUUFBTSxhQUFhLEdBQUcsVUFqRFQsSUFBSSxFQWlEVSxNQUFNLEVBQUUsTUFBTSxXQW5EekMsZ0JBQWdCLENBbUQ4QyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTs7MkJBRTdDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQzs7UUFBL0MsWUFBWSxzQkFBWixZQUFZO1FBQUUsSUFBSSxzQkFBSixJQUFJOzt5QkFDUSxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQzs7UUFBckQsSUFBSSxvQkFBSixJQUFJO1FBQUUsU0FBUyxvQkFBVCxTQUFTO1FBQUUsS0FBSyxvQkFBTCxLQUFLOzs7QUFFN0IsUUFBTSxZQUFZLEdBQUcsVUF0REYsS0FBSyxFQXNERyxZQUFZLEVBQUUsQ0FBQyxJQUFJLFdBekRVLGVBQWUsQ0F5REwsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzVFLFNBQU8sV0ExRHlCLEdBQUcsQ0EwRHBCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQTtFQUM1Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQk0sVUFBUyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUksRUFBMkI7TUFBekIsaUJBQWlCLHlEQUFDLEtBQUs7O0FBQ3BFLGNBM0VPLGFBQWEsRUEyRU4sTUFBTSxFQUFFLDZCQUE2QixDQUFDLENBQUE7QUFDcEQsUUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBOzs7QUFHdkIsTUFBSSxXQWpGVyxZQUFZLEVBaUZWLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxFQUFFO0FBQ3RDLFNBQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssT0FsRnVCLFFBQVEsQ0FrRnRCLE9BQU8sSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLE9BbEZSLFFBQVEsQ0FrRlMsU0FBUyxDQUFBO0FBQzFFLFNBQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssT0FuRnNCLFFBQVEsQ0FtRnJCLE9BQU8sSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLE9BbkZULFFBQVEsQ0FtRlUsTUFBTSxDQUFBO0FBQ3hFLFNBQU0sSUFBSSxHQUFHLENBQUMsTUFBTSwrQ0FBMEIsQ0FBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBOztBQUUzRSxTQUFNLElBQUksR0FBRyxDQUFDLFdBeEZzQixpQkFBaUIsQ0F3RmpCLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0FBQzNDLFVBQU8sS0FBSyxHQUNYO0FBQ0MsUUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQUU7QUFDckMsU0FBSyxFQUFFLFdBNUZNLGNBQWMsQ0E0RkQsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQztJQUNyRCxHQUNEO0FBQ0MsUUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQUU7QUFDckMsU0FBSyxFQUFFLFdBaEdILE9BQU8sQ0FnR1EsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QyxDQUFBO0dBQ0YsTUFBTTt5QkFDdUIsZ0JBOUZ2QixjQUFjLEVBOEZ3QixNQUFNLENBQUM7Ozs7U0FBNUMsTUFBTTtTQUFFLFVBQVU7O3lCQUNhLGNBQWMsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUM7O1NBQXhFLElBQUksbUJBQUosSUFBSTtTQUFFLFNBQVMsbUJBQVQsU0FBUztTQUFFLFVBQVUsbUJBQVYsVUFBVTs7QUFDbEMsUUFBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQ2hCLEdBQUcsQ0FBQyxJQUFJLEdBQUcsT0F2RzJELGFBQWEsQ0F1RzFELE9BQU8sQ0FBQTtBQUNsQyxTQUFNLEtBQUssR0FBRyxDQUFDLElBQUksZUFuR0csWUFBWSxlQUFFLGFBQWEsQ0FtR0MsQ0FBRSxVQUFVLENBQUMsQ0FBQTtBQUMvRCxVQUFPLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFDLENBQUE7R0FDM0M7RUFDRDs7QUFFRCxVQUFTLGlCQUFpQixDQUFDLE1BQU0sRUFBRTtBQUNsQyxNQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFO0FBQ3RCLFNBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUN2QixPQUFJLFdBOUd3QixPQUFPLEVBOEd2QixPQTlHTixNQUFNLENBOEdPLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxXQTlHSyxTQUFTLEVBOEdKLE9BOUdNLFFBQVEsQ0E4R0wsSUFBSSxFQUFFLFVBN0duRCxJQUFJLEVBNkdvRCxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFDMUUsT0FBTztBQUNOLGdCQUFZLEVBQUUsMkJBQVksZ0JBQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2hELFFBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFO0lBQ25CLENBQUE7R0FDRjtBQUNELFNBQU8sRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUMsQ0FBQTtFQUN6Qzs7QUFFRCxPQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxDQUFDLENBQ2hDLE9BeEhpRCxRQUFRLENBd0hoRCxPQUFPLEVBQUUsT0F4SCtCLFFBQVEsQ0F3SDlCLE1BQU0sRUFBRSxPQXhIYyxRQUFRLENBd0hiLFNBQVMsRUFBRSxPQXhITixRQUFRLENBd0hPLFFBQVEsQ0FDeEUsQ0FBQyxDQUFBOztBQUVGLFVBQVMsY0FBYyxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsRUFBRTtBQUNsRCxNQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFDbkIsT0FBTyxFQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFDLENBQUEsS0FDOUM7QUFDSixPQUFJLElBQUksR0FBRyxNQUFNO09BQUUsU0FBUyxHQUFHLElBQUksQ0FBQTtBQUNuQyxTQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDdkIsT0FBSSxXQWpJd0IsT0FBTyxFQWlJdkIsT0FqSU4sTUFBTSxDQWlJTyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDN0IsVUFBTSxDQUFDLEdBQUcsZ0JBQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3hCLFFBQUksV0FuSWdDLFNBQVMsRUFtSS9CLE9BbklpQyxRQUFRLENBbUloQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUU7QUFDM0MsU0FBSSxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNyQixjQUFTLEdBQUcsd0JBaElZLDJCQUEyQixFQWdJWCxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtLQUNqRDtJQUNEO0FBQ0QsT0FBSSxpQkFBaUIsRUFBRTsyQ0FDZSx3QkFwSWlCLCtCQUErQixFQW9JaEIsSUFBSSxDQUFDOztVQUF6RCxJQUFJLG9DQUFkLFFBQVE7VUFBUSxVQUFVLG9DQUFWLFVBQVU7O0FBQ2pDLFdBQU8sRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBQyxDQUFBO0lBQ3BDLE1BQ0EsT0FBTyxFQUFDLElBQUksRUFBRSxrQ0FBbUIsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFDLENBQUE7R0FDbkQ7RUFDRCIsImZpbGUiOiJwcml2YXRlL3BhcnNlL3BhcnNlRnVuLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge0Jsb2NrRG8sIEJsb2NrVmFsUmV0dXJuLCBGdW4sIExvY2FsRGVjbGFyZUZvY3VzLCBMb2NhbERlY2xhcmVSZXMsIExvY2FsRGVjbGFyZXMsXG5cdExvY2FsRGVjbGFyZVRoaXN9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtHcm91cHMsIGlzQW55S2V5d29yZCwgaXNHcm91cCwgaXNLZXl3b3JkLCBLZXl3b3Jkc30gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2hlYWQsIG9wSWYsIG9wTWFwfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtjaGVja05vbkVtcHR5fSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7YmVmb3JlQW5kQmxvY2ssIHBhcnNlQmxvY2tEbywgcGFyc2VCbG9ja1ZhbH0gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlQ2FzZSBmcm9tICcuL3BhcnNlQ2FzZSdcbmltcG9ydCBwYXJzZUxvY2FsRGVjbGFyZXMsIHtwYXJzZUxvY2FsRGVjbGFyZUZyb21TcGFjZWQsIHBhcnNlTG9jYWxEZWNsYXJlc0FuZE1lbWJlckFyZ3Ncblx0fSBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcbmltcG9ydCBwYXJzZVNwYWNlZCBmcm9tICcuL3BhcnNlU3BhY2VkJ1xuaW1wb3J0IHBhcnNlU3dpdGNoIGZyb20gJy4vcGFyc2VTd2l0Y2gnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLyoqXG5QYXJzZSBhIGZ1bmN0aW9uLlxuQHBhcmFtIGtpbmQge0tleXdvcmRzfSBBIGZ1bmN0aW9uIGtleXdvcmQuXG5AcGFyYW0ge1NsaWNlfSB0b2tlbnMgUmVzdCBvZiB0aGUgbGluZSBhZnRlciB0aGUgZnVuY3Rpb24ga2V5d29yZC5cbkByZXR1cm4ge0Z1bn1cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUZ1bihraW5kLCB0b2tlbnMpIHtcblx0bGV0IGlzVGhpcyA9IGZhbHNlLCBpc0RvID0gZmFsc2UsIGlzR2VuZXJhdG9yID0gZmFsc2Vcblx0c3dpdGNoIChraW5kKSB7XG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW46XG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuRG86XG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtleXdvcmRzLkZ1bkdlbjpcblx0XHRcdGlzR2VuZXJhdG9yID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtleXdvcmRzLkZ1bkdlbkRvOlxuXHRcdFx0aXNHZW5lcmF0b3IgPSB0cnVlXG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXM6XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0RvOlxuXHRcdFx0aXNUaGlzID0gdHJ1ZVxuXHRcdFx0aXNEbyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzR2VuOlxuXHRcdFx0aXNUaGlzID0gdHJ1ZVxuXHRcdFx0aXNHZW5lcmF0b3IgPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0dlbkRvOlxuXHRcdFx0aXNUaGlzID0gdHJ1ZVxuXHRcdFx0aXNHZW5lcmF0b3IgPSB0cnVlXG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoKVxuXHR9XG5cdGNvbnN0IG9wRGVjbGFyZVRoaXMgPSBvcElmKGlzVGhpcywgKCkgPT4gbmV3IExvY2FsRGVjbGFyZVRoaXModG9rZW5zLmxvYykpXG5cblx0Y29uc3Qge29wUmV0dXJuVHlwZSwgcmVzdH0gPSB0cnlUYWtlUmV0dXJuVHlwZSh0b2tlbnMpXG5cdGNvbnN0IHthcmdzLCBvcFJlc3RBcmcsIGJsb2NrfSA9IGZ1bkFyZ3NBbmRCbG9jayhyZXN0LCBpc0RvKVxuXHQvLyBOZWVkIHJlcyBkZWNsYXJlIGlmIHRoZXJlIGlzIGEgcmV0dXJuIHR5cGUuXG5cdGNvbnN0IG9wRGVjbGFyZVJlcyA9IG9wTWFwKG9wUmV0dXJuVHlwZSwgXyA9PiBuZXcgTG9jYWxEZWNsYXJlUmVzKF8ubG9jLCBfKSlcblx0cmV0dXJuIG5ldyBGdW4odG9rZW5zLmxvYywgYXJncywgb3BSZXN0QXJnLCBibG9jaywgaXNHZW5lcmF0b3IsIG9wRGVjbGFyZVRoaXMsIG9wRGVjbGFyZVJlcylcbn1cblxuLyoqXG5QYXJzZSBmdW5jdGlvbiBhcmd1bWVudHMgYW5kIGJvZHkuXG5UaGlzIGFsc28gaGFuZGxlcyB0aGUgYHxjYXNlYCBhbmQgYHxzd2l0Y2hgIGZvcm1zLlxuQHBhcmFtIHtTbGljZX0gdG9rZW5zXG5AcGFyYW0ge2Jvb2xlYW59IGlzRG8gV2hldGhlciB0aGlzIGlzIGEgYCF8YFxuQHBhcmFtIHtpbmNsdWRlTWVtYmVyQXJnc31cblx0VGhpcyBpcyBmb3IgY29uc3RydWN0b3JzLlxuXHRJZiB0cnVlLCBvdXRwdXQgd2lsbCBpbmNsdWRlIGBtZW1iZXJBcmdzYC5cblx0VGhpcyBpcyB0aGUgc3Vic2V0IG9mIGBhcmdzYCB3aG9zZSBuYW1lcyBhcmUgcHJlZml4ZWQgd2l0aCBgLmAuXG5cdGUuZy46IGBjb25zdHJ1Y3QhIC54IC55YFxuQHJldHVybiB7XG5cdGFyZ3M6IEFycmF5PExvY2FsRGVjbGFyZT4sXG5cdG9wUmVzdEFyZzogP0xvY2FsRGVjbGFyZSxcblx0bWVtYmVyQXJnczpBcnJheTxMb2NhbERlY2xhcmU+LFxuXHRibG9jazogQmxvY2tcbn1cbiovXG5leHBvcnQgZnVuY3Rpb24gZnVuQXJnc0FuZEJsb2NrKHRva2VucywgaXNEbywgaW5jbHVkZU1lbWJlckFyZ3M9ZmFsc2UpIHtcblx0Y2hlY2tOb25FbXB0eSh0b2tlbnMsICdFeHBlY3RlZCBhbiBpbmRlbnRlZCBibG9jay4nKVxuXHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXG5cdC8vIE1pZ2h0IGJlIGB8Y2FzZWAgKG9yIGB8Y2FzZSFgLCBgfHN3aXRjaGAsIGB8c3dpdGNoIWApXG5cdGlmIChpc0FueUtleXdvcmQoZnVuRm9jdXNLZXl3b3JkcywgaCkpIHtcblx0XHRjb25zdCBpc1ZhbCA9IGgua2luZCA9PT0gS2V5d29yZHMuQ2FzZVZhbCB8fCBoLmtpbmQgPT09IEtleXdvcmRzLlN3aXRjaFZhbFxuXHRcdGNvbnN0IGlzQ2FzZSA9IGgua2luZCA9PT0gS2V5d29yZHMuQ2FzZVZhbCB8fCBoLmtpbmQgPT09IEtleXdvcmRzLkNhc2VEb1xuXHRcdGNvbnN0IGV4cHIgPSAoaXNDYXNlID8gcGFyc2VDYXNlIDogcGFyc2VTd2l0Y2gpKGlzVmFsLCB0cnVlLCB0b2tlbnMudGFpbCgpKVxuXG5cdFx0Y29uc3QgYXJncyA9IFtuZXcgTG9jYWxEZWNsYXJlRm9jdXMoaC5sb2MpXVxuXHRcdHJldHVybiBpc1ZhbCA/XG5cdFx0XHR7XG5cdFx0XHRcdGFyZ3MsIG9wUmVzdEFyZzogbnVsbCwgbWVtYmVyQXJnczogW10sXG5cdFx0XHRcdGJsb2NrOiBuZXcgQmxvY2tWYWxSZXR1cm4odG9rZW5zLmxvYywgbnVsbCwgW10sIGV4cHIpXG5cdFx0XHR9IDpcblx0XHRcdHtcblx0XHRcdFx0YXJncywgb3BSZXN0QXJnOiBudWxsLCBtZW1iZXJBcmdzOiBbXSxcblx0XHRcdFx0YmxvY2s6IG5ldyBCbG9ja0RvKHRva2Vucy5sb2MsIG51bGwsIFtleHByXSlcblx0XHRcdH1cblx0fSBlbHNlIHtcblx0XHRjb25zdCBbYmVmb3JlLCBibG9ja0xpbmVzXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0XHRjb25zdCB7YXJncywgb3BSZXN0QXJnLCBtZW1iZXJBcmdzfSA9IHBhcnNlRnVuTG9jYWxzKGJlZm9yZSwgaW5jbHVkZU1lbWJlckFyZ3MpXG5cdFx0Zm9yIChjb25zdCBhcmcgb2YgYXJncylcblx0XHRcdGlmICghYXJnLmlzTGF6eSgpKVxuXHRcdFx0XHRhcmcua2luZCA9IExvY2FsRGVjbGFyZXMuTXV0YWJsZVxuXHRcdGNvbnN0IGJsb2NrID0gKGlzRG8gPyBwYXJzZUJsb2NrRG8gOiBwYXJzZUJsb2NrVmFsKShibG9ja0xpbmVzKVxuXHRcdHJldHVybiB7YXJncywgb3BSZXN0QXJnLCBtZW1iZXJBcmdzLCBibG9ja31cblx0fVxufVxuXG5mdW5jdGlvbiB0cnlUYWtlUmV0dXJuVHlwZSh0b2tlbnMpIHtcblx0aWYgKCF0b2tlbnMuaXNFbXB0eSgpKSB7XG5cdFx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKClcblx0XHRpZiAoaXNHcm91cChHcm91cHMuU3BhY2UsIGgpICYmIGlzS2V5d29yZChLZXl3b3Jkcy5UeXBlLCBoZWFkKGguc3ViVG9rZW5zKSkpXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRvcFJldHVyblR5cGU6IHBhcnNlU3BhY2VkKFNsaWNlLmdyb3VwKGgpLnRhaWwoKSksXG5cdFx0XHRcdHJlc3Q6IHRva2Vucy50YWlsKClcblx0XHRcdH1cblx0fVxuXHRyZXR1cm4ge29wUmV0dXJuVHlwZTogbnVsbCwgcmVzdDogdG9rZW5zfVxufVxuXG5jb25zdCBmdW5Gb2N1c0tleXdvcmRzID0gbmV3IFNldChbXG5cdEtleXdvcmRzLkNhc2VWYWwsIEtleXdvcmRzLkNhc2VEbywgS2V5d29yZHMuU3dpdGNoVmFsLCBLZXl3b3Jkcy5Td2l0Y2hEb1xuXSlcblxuZnVuY3Rpb24gcGFyc2VGdW5Mb2NhbHModG9rZW5zLCBpbmNsdWRlTWVtYmVyQXJncykge1xuXHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRyZXR1cm4ge2FyZ3M6IFtdLCBtZW1iZXJBcmdzOiBbXSwgb3BSZXN0QXJnOiBudWxsfVxuXHRlbHNlIHtcblx0XHRsZXQgcmVzdCA9IHRva2Vucywgb3BSZXN0QXJnID0gbnVsbFxuXHRcdGNvbnN0IGwgPSB0b2tlbnMubGFzdCgpXG5cdFx0aWYgKGlzR3JvdXAoR3JvdXBzLlNwYWNlLCBsKSkge1xuXHRcdFx0Y29uc3QgZyA9IFNsaWNlLmdyb3VwKGwpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkVsbGlwc2lzLCBnLmhlYWQoKSkpIHtcblx0XHRcdFx0cmVzdCA9IHRva2Vucy5ydGFpbCgpXG5cdFx0XHRcdG9wUmVzdEFyZyA9IHBhcnNlTG9jYWxEZWNsYXJlRnJvbVNwYWNlZChnLnRhaWwoKSlcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGluY2x1ZGVNZW1iZXJBcmdzKSB7XG5cdFx0XHRjb25zdCB7ZGVjbGFyZXM6IGFyZ3MsIG1lbWJlckFyZ3N9ID0gcGFyc2VMb2NhbERlY2xhcmVzQW5kTWVtYmVyQXJncyhyZXN0KVxuXHRcdFx0cmV0dXJuIHthcmdzLCBtZW1iZXJBcmdzLCBvcFJlc3RBcmd9XG5cdFx0fSBlbHNlXG5cdFx0XHRyZXR1cm4ge2FyZ3M6IHBhcnNlTG9jYWxEZWNsYXJlcyhyZXN0KSwgb3BSZXN0QXJnfVxuXHR9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

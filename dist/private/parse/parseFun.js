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

		var _tryTakeReturnType = tryTakeReturnType(tokens);

		const opReturnType = _tryTakeReturnType.opReturnType;
		const rest = _tryTakeReturnType.rest;

		var _funArgsAndBlock = funArgsAndBlock(rest, isDo);

		const args = _funArgsAndBlock.args;
		const opRestArg = _funArgsAndBlock.opRestArg;
		const block = _funArgsAndBlock.block;

		return new _MsAst.Fun(tokens.loc, args, opRestArg, block, isGenerator, isThis, opReturnType);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRnVuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFrQndCLFFBQVE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBakIsVUFBUyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUM5QyxNQUFJLE1BQU0sR0FBRyxLQUFLO01BQUUsSUFBSSxHQUFHLEtBQUs7TUFBRSxXQUFXLEdBQUcsS0FBSyxDQUFBO0FBQ3JELFVBQVEsSUFBSTtBQUNYLFFBQUssT0FwQjJDLFFBQVEsQ0FvQjFDLEdBQUc7QUFDaEIsVUFBSztBQUFBLEFBQ04sUUFBSyxPQXRCMkMsUUFBUSxDQXNCMUMsS0FBSztBQUNsQixRQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ1gsVUFBSztBQUFBLEFBQ04sUUFBSyxPQXpCMkMsUUFBUSxDQXlCMUMsTUFBTTtBQUNuQixlQUFXLEdBQUcsSUFBSSxDQUFBO0FBQ2xCLFVBQUs7QUFBQSxBQUNOLFFBQUssT0E1QjJDLFFBQVEsQ0E0QjFDLFFBQVE7QUFDckIsZUFBVyxHQUFHLElBQUksQ0FBQTtBQUNsQixRQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ1gsVUFBSztBQUFBLEFBQ04sUUFBSyxPQWhDMkMsUUFBUSxDQWdDMUMsT0FBTztBQUNwQixVQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2IsVUFBSztBQUFBLEFBQ04sUUFBSyxPQW5DMkMsUUFBUSxDQW1DMUMsU0FBUztBQUN0QixVQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2IsUUFBSSxHQUFHLElBQUksQ0FBQTtBQUNYLFVBQUs7QUFBQSxBQUNOLFFBQUssT0F2QzJDLFFBQVEsQ0F1QzFDLFVBQVU7QUFDdkIsVUFBTSxHQUFHLElBQUksQ0FBQTtBQUNiLGVBQVcsR0FBRyxJQUFJLENBQUE7QUFDbEIsVUFBSztBQUFBLEFBQ04sUUFBSyxPQTNDMkMsUUFBUSxDQTJDMUMsWUFBWTtBQUN6QixVQUFNLEdBQUcs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R0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDdkIsT0FBSSxXQTdId0IsT0FBTyxFQTZIdkIsT0E3SE4sTUFBTSxDQTZITyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDN0IsVUFBTSxDQUFDLEdBQUcsZ0JBQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3hCLFFBQUksV0EvSGdDLFNBQVMsRUErSC9CLE9BL0hpQyxRQUFRLENBK0hoQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUU7QUFDM0MsU0FBSSxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNyQixjQUFTLEdBQUcsd0JBNUhZLDJCQUEyQixFQTRIWCxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtLQUNqRDtJQUNEO0FBQ0QsT0FBSSxpQkFBaUIsRUFBRTsyQ0FDZSx3QkFoSWlCLCtCQUErQixFQWdJaEIsSUFBSSxDQUFDOztVQUF6RCxJQUFJLG9DQUFkLFFBQVE7VUFBUSxVQUFVLG9DQUFWLFVBQVU7O0FBQ2pDLFdBQU8sRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBQyxDQUFBO0lBQ3BDLE1BQ0EsT0FBTyxFQUFDLElBQUksRUFBRSxrQ0FBbUIsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFDLENBQUE7R0FDbkQ7RUFDRCIsImZpbGUiOiJwYXJzZUZ1bi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QmxvY2tEbywgQmxvY2tWYWxSZXR1cm4sIEZ1biwgTG9jYWxEZWNsYXJlLCBMb2NhbERlY2xhcmVzfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXBzLCBpc0FueUtleXdvcmQsIGlzR3JvdXAsIGlzS2V5d29yZCwgS2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtoZWFkfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtjaGVja05vbkVtcHR5fSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7YmVmb3JlQW5kQmxvY2ssIHBhcnNlQmxvY2tEbywgcGFyc2VCbG9ja1ZhbH0gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlQ2FzZSBmcm9tICcuL3BhcnNlQ2FzZSdcbmltcG9ydCBwYXJzZUxvY2FsRGVjbGFyZXMsIHtwYXJzZUxvY2FsRGVjbGFyZUZyb21TcGFjZWQsIHBhcnNlTG9jYWxEZWNsYXJlc0FuZE1lbWJlckFyZ3Ncblx0fSBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcbmltcG9ydCBwYXJzZVNwYWNlZCBmcm9tICcuL3BhcnNlU3BhY2VkJ1xuaW1wb3J0IHBhcnNlU3dpdGNoIGZyb20gJy4vcGFyc2VTd2l0Y2gnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLyoqXG5QYXJzZSBhIGZ1bmN0aW9uLlxuQHBhcmFtIGtpbmQge0tleXdvcmRzfSBBIGZ1bmN0aW9uIGtleXdvcmQuXG5AcGFyYW0ge1NsaWNlfSB0b2tlbnMgUmVzdCBvZiB0aGUgbGluZSBhZnRlciB0aGUgZnVuY3Rpb24ga2V5d29yZC5cbkByZXR1cm4ge0Z1bn1cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUZ1bihraW5kLCB0b2tlbnMpIHtcblx0bGV0IGlzVGhpcyA9IGZhbHNlLCBpc0RvID0gZmFsc2UsIGlzR2VuZXJhdG9yID0gZmFsc2Vcblx0c3dpdGNoIChraW5kKSB7XG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW46XG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuRG86XG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtleXdvcmRzLkZ1bkdlbjpcblx0XHRcdGlzR2VuZXJhdG9yID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtleXdvcmRzLkZ1bkdlbkRvOlxuXHRcdFx0aXNHZW5lcmF0b3IgPSB0cnVlXG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXM6XG5cdFx0XHRpc1RoaXMgPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0RvOlxuXHRcdFx0aXNUaGlzID0gdHJ1ZVxuXHRcdFx0aXNEbyA9IHRydWVcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzR2VuOlxuXHRcdFx0aXNUaGlzID0gdHJ1ZVxuXHRcdFx0aXNHZW5lcmF0b3IgPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0dlbkRvOlxuXHRcdFx0aXNUaGlzID0gdHJ1ZVxuXHRcdFx0aXNHZW5lcmF0b3IgPSB0cnVlXG5cdFx0XHRpc0RvID0gdHJ1ZVxuXHRcdFx0YnJlYWtcblx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoKVxuXHR9XG5cdGNvbnN0IHtvcFJldHVyblR5cGUsIHJlc3R9ID0gdHJ5VGFrZVJldHVyblR5cGUodG9rZW5zKVxuXHRjb25zdCB7YXJncywgb3BSZXN0QXJnLCBibG9ja30gPSBmdW5BcmdzQW5kQmxvY2socmVzdCwgaXNEbylcblx0cmV0dXJuIG5ldyBGdW4odG9rZW5zLmxvYywgYXJncywgb3BSZXN0QXJnLCBibG9jaywgaXNHZW5lcmF0b3IsIGlzVGhpcywgb3BSZXR1cm5UeXBlKVxufVxuXG4vKipcblBhcnNlIGZ1bmN0aW9uIGFyZ3VtZW50cyBhbmQgYm9keS5cblRoaXMgYWxzbyBoYW5kbGVzIHRoZSBgfGNhc2VgIGFuZCBgfHN3aXRjaGAgZm9ybXMuXG5AcGFyYW0ge1NsaWNlfSB0b2tlbnNcbkBwYXJhbSB7Ym9vbGVhbn0gaXNEbyBXaGV0aGVyIHRoaXMgaXMgYSBgIXxgXG5AcGFyYW0ge2luY2x1ZGVNZW1iZXJBcmdzfVxuXHRUaGlzIGlzIGZvciBjb25zdHJ1Y3RvcnMuXG5cdElmIHRydWUsIG91dHB1dCB3aWxsIGluY2x1ZGUgYG1lbWJlckFyZ3NgLlxuXHRUaGlzIGlzIHRoZSBzdWJzZXQgb2YgYGFyZ3NgIHdob3NlIG5hbWVzIGFyZSBwcmVmaXhlZCB3aXRoIGAuYC5cblx0ZS5nLjogYGNvbnN0cnVjdCEgLnggLnlgXG5AcmV0dXJuIHtcblx0YXJnczogQXJyYXk8TG9jYWxEZWNsYXJlPixcblx0b3BSZXN0QXJnOiA/TG9jYWxEZWNsYXJlLFxuXHRtZW1iZXJBcmdzOkFycmF5PExvY2FsRGVjbGFyZT4sXG5cdGJsb2NrOiBCbG9ja1xufVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBmdW5BcmdzQW5kQmxvY2sodG9rZW5zLCBpc0RvLCBpbmNsdWRlTWVtYmVyQXJncz1mYWxzZSkge1xuXHRjaGVja05vbkVtcHR5KHRva2VucywgJ0V4cGVjdGVkIGFuIGluZGVudGVkIGJsb2NrLicpXG5cdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpXG5cblx0Ly8gTWlnaHQgYmUgYHxjYXNlYCAob3IgYHxjYXNlIWAsIGB8c3dpdGNoYCwgYHxzd2l0Y2ghYClcblx0aWYgKGlzQW55S2V5d29yZChmdW5Gb2N1c0tleXdvcmRzLCBoKSkge1xuXHRcdGNvbnN0IGlzVmFsID0gaC5raW5kID09PSBLZXl3b3Jkcy5DYXNlVmFsIHx8IGgua2luZCA9PT0gS2V5d29yZHMuU3dpdGNoVmFsXG5cdFx0Y29uc3QgaXNDYXNlID0gaC5raW5kID09PSBLZXl3b3Jkcy5DYXNlVmFsIHx8IGgua2luZCA9PT0gS2V5d29yZHMuQ2FzZURvXG5cdFx0Y29uc3QgZXhwciA9IChpc0Nhc2UgPyBwYXJzZUNhc2UgOiBwYXJzZVN3aXRjaCkoaXNWYWwsIHRydWUsIHRva2Vucy50YWlsKCkpXG5cblx0XHRjb25zdCBhcmdzID0gW0xvY2FsRGVjbGFyZS5mb2N1cyhoLmxvYyldXG5cdFx0cmV0dXJuIGlzVmFsID9cblx0XHRcdHtcblx0XHRcdFx0YXJncywgb3BSZXN0QXJnOiBudWxsLCBtZW1iZXJBcmdzOiBbXSxcblx0XHRcdFx0YmxvY2s6IG5ldyBCbG9ja1ZhbFJldHVybih0b2tlbnMubG9jLCBudWxsLCBbXSwgZXhwcilcblx0XHRcdH0gOlxuXHRcdFx0e1xuXHRcdFx0XHRhcmdzLCBvcFJlc3RBcmc6IG51bGwsIG1lbWJlckFyZ3M6IFtdLFxuXHRcdFx0XHRibG9jazogbmV3IEJsb2NrRG8odG9rZW5zLmxvYywgbnVsbCwgW2V4cHJdKVxuXHRcdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrTGluZXNdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRcdGNvbnN0IHthcmdzLCBvcFJlc3RBcmcsIG1lbWJlckFyZ3N9ID0gcGFyc2VGdW5Mb2NhbHMoYmVmb3JlLCBpbmNsdWRlTWVtYmVyQXJncylcblx0XHRmb3IgKGNvbnN0IGFyZyBvZiBhcmdzKVxuXHRcdFx0aWYgKCFhcmcuaXNMYXp5KCkpXG5cdFx0XHRcdGFyZy5raW5kID0gTG9jYWxEZWNsYXJlcy5NdXRhYmxlXG5cdFx0Y29uc3QgYmxvY2sgPSAoaXNEbyA/IHBhcnNlQmxvY2tEbyA6IHBhcnNlQmxvY2tWYWwpKGJsb2NrTGluZXMpXG5cdFx0cmV0dXJuIHthcmdzLCBvcFJlc3RBcmcsIG1lbWJlckFyZ3MsIGJsb2NrfVxuXHR9XG59XG5cbmZ1bmN0aW9uIHRyeVRha2VSZXR1cm5UeXBlKHRva2Vucykge1xuXHRpZiAoIXRva2Vucy5pc0VtcHR5KCkpIHtcblx0XHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXHRcdGlmIChpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgaCkgJiYgaXNLZXl3b3JkKEtleXdvcmRzLlR5cGUsIGhlYWQoaC5zdWJUb2tlbnMpKSlcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdG9wUmV0dXJuVHlwZTogcGFyc2VTcGFjZWQoU2xpY2UuZ3JvdXAoaCkudGFpbCgpKSxcblx0XHRcdFx0cmVzdDogdG9rZW5zLnRhaWwoKVxuXHRcdFx0fVxuXHR9XG5cdHJldHVybiB7b3BSZXR1cm5UeXBlOiBudWxsLCByZXN0OiB0b2tlbnN9XG59XG5cbmNvbnN0IGZ1bkZvY3VzS2V5d29yZHMgPSBuZXcgU2V0KFtcblx0S2V5d29yZHMuQ2FzZVZhbCwgS2V5d29yZHMuQ2FzZURvLCBLZXl3b3Jkcy5Td2l0Y2hWYWwsIEtleXdvcmRzLlN3aXRjaERvXG5dKVxuXG5mdW5jdGlvbiBwYXJzZUZ1bkxvY2Fscyh0b2tlbnMsIGluY2x1ZGVNZW1iZXJBcmdzKSB7XG5cdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdHJldHVybiB7YXJnczogW10sIG1lbWJlckFyZ3M6IFtdLCBvcFJlc3RBcmc6IG51bGx9XG5cdGVsc2Uge1xuXHRcdGxldCByZXN0ID0gdG9rZW5zLCBvcFJlc3RBcmcgPSBudWxsXG5cdFx0Y29uc3QgbCA9IHRva2Vucy5sYXN0KClcblx0XHRpZiAoaXNHcm91cChHcm91cHMuU3BhY2UsIGwpKSB7XG5cdFx0XHRjb25zdCBnID0gU2xpY2UuZ3JvdXAobClcblx0XHRcdGlmIChpc0tleXdvcmQoS2V5d29yZHMuRWxsaXBzaXMsIGcuaGVhZCgpKSkge1xuXHRcdFx0XHRyZXN0ID0gdG9rZW5zLnJ0YWlsKClcblx0XHRcdFx0b3BSZXN0QXJnID0gcGFyc2VMb2NhbERlY2xhcmVGcm9tU3BhY2VkKGcudGFpbCgpKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoaW5jbHVkZU1lbWJlckFyZ3MpIHtcblx0XHRcdGNvbnN0IHtkZWNsYXJlczogYXJncywgbWVtYmVyQXJnc30gPSBwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzKHJlc3QpXG5cdFx0XHRyZXR1cm4ge2FyZ3MsIG1lbWJlckFyZ3MsIG9wUmVzdEFyZ31cblx0XHR9IGVsc2Vcblx0XHRcdHJldHVybiB7YXJnczogcGFyc2VMb2NhbERlY2xhcmVzKHJlc3QpLCBvcFJlc3RBcmd9XG5cdH1cbn1cbiJdfQ==
'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../MsAst', '../Token', '../util', './checks', './parseBlock', './parseCase', './parseLocalDeclares', './parseSpaced', './parseSwitch', './Slice', './tryTakeComment'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parseBlock'), require('./parseCase'), require('./parseLocalDeclares'), require('./parseSpaced'), require('./parseSwitch'), require('./Slice'), require('./tryTakeComment'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst, global.Token, global.util, global.checks, global.parseBlock, global.parseCase, global.parseLocalDeclares, global.parseSpaced, global.parseSwitch, global.Slice, global.tryTakeComment);
		global.parseFun = mod.exports;
	}
})(this, function (exports, _MsAst, _Token, _util, _checks, _parseBlock, _parseCase, _parseLocalDeclares, _parseSpaced, _parseSwitch, _Slice, _tryTakeComment3) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseFun;
	exports.parseFunLike = parseFunLike;
	exports.funArgsAndBlock = funArgsAndBlock;

	var _parseCase2 = _interopRequireDefault(_parseCase);

	var _parseLocalDeclares2 = _interopRequireDefault(_parseLocalDeclares);

	var _parseSpaced2 = _interopRequireDefault(_parseSpaced);

	var _parseSwitch2 = _interopRequireDefault(_parseSwitch);

	var _Slice2 = _interopRequireDefault(_Slice);

	var _tryTakeComment4 = _interopRequireDefault(_tryTakeComment3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	function parseFun(keywordKind, tokens) {
		var _funKind = funKind(keywordKind);

		var _funKind2 = _slicedToArray(_funKind, 3);

		const isThis = _funKind2[0];
		const isDo = _funKind2[1];
		const kind = _funKind2[2];

		var _tryTakeReturnType = tryTakeReturnType(tokens);

		const opReturnType = _tryTakeReturnType.opReturnType;
		const rest = _tryTakeReturnType.rest;

		var _funArgsAndBlock = funArgsAndBlock(rest, !isDo);

		const args = _funArgsAndBlock.args;
		const opRestArg = _funArgsAndBlock.opRestArg;
		const block = _funArgsAndBlock.block;
		return new _MsAst.Fun(tokens.loc, args, opRestArg, block, kind, isThis, opReturnType);
	}

	function parseFunLike(keywordKind, tokens) {
		var _funKind3 = funKind(keywordKind);

		var _funKind4 = _slicedToArray(_funKind3, 3);

		const isThis = _funKind4[0];
		const isDo = _funKind4[1];
		const kind = _funKind4[2];

		var _tryTakeReturnType2 = tryTakeReturnType(tokens);

		const opReturnType = _tryTakeReturnType2.opReturnType;
		const rest = _tryTakeReturnType2.rest;

		var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(rest);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const blockLines = _beforeAndBlock2[1];

		var _tryTakeComment = (0, _tryTakeComment4.default)(blockLines);

		var _tryTakeComment2 = _slicedToArray(_tryTakeComment, 2);

		const opComment = _tryTakeComment2[0];
		const restLines = _tryTakeComment2[1];

		if (restLines.size() === 1) {
			const h = restLines.headSlice();

			if (h.size() === 1 && (0, _Token.isKeyword)(_Token.Keywords.Abstract, h.head())) {
				var _parseFunLocals = parseFunLocals(before);

				const args = _parseFunLocals.args;
				const opRestArg = _parseFunLocals.opRestArg;
				return new _MsAst.FunAbstract(tokens.loc, args, opRestArg, opReturnType, opComment);
			}
		}

		var _funArgsAndBlock2 = funArgsAndBlock(rest, !isDo);

		const args = _funArgsAndBlock2.args;
		const opRestArg = _funArgsAndBlock2.opRestArg;
		const block = _funArgsAndBlock2.block;
		return new _MsAst.Fun(tokens.loc, args, opRestArg, block, kind, isThis, opReturnType);
	}

	function funArgsAndBlock(tokens, isVal) {
		let includeMemberArgs = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
		(0, _checks.checkNonEmpty)(tokens, 'Expected an indented block.');
		const h = tokens.head();

		if ((0, _Token.isAnyKeyword)(funFocusKeywords, h)) {
			const isCase = h.kind === _Token.Keywords.Case;
			const expr = (isCase ? _parseCase2.default : _parseSwitch2.default)(isVal, true, tokens.tail());
			const args = [_MsAst.LocalDeclare.focus(h.loc)];
			return isVal ? {
				args,
				opRestArg: null,
				memberArgs: [],
				block: new _MsAst.BlockValReturn(tokens.loc, null, [], expr)
			} : {
				args,
				opRestArg: null,
				memberArgs: [],
				block: new _MsAst.BlockDo(tokens.loc, null, [expr])
			};
		} else {
			var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(tokens);

			var _beforeAndBlock4 = _slicedToArray(_beforeAndBlock3, 2);

			const before = _beforeAndBlock4[0];
			const blockLines = _beforeAndBlock4[1];

			var _parseFunLocals2 = parseFunLocals(before, includeMemberArgs);

			const args = _parseFunLocals2.args;
			const opRestArg = _parseFunLocals2.opRestArg;
			const memberArgs = _parseFunLocals2.memberArgs;
			const block = (0, _parseBlock.parseBlockDoOrVal)(isVal, blockLines);
			return {
				args,
				opRestArg,
				memberArgs,
				block
			};
		}
	}

	const funFocusKeywords = new Set([_Token.Keywords.Case, _Token.Keywords.Switch]);

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

		return {
			opReturnType: null,
			rest: tokens
		};
	}

	function parseFunLocals(tokens, includeMemberArgs) {
		if (tokens.isEmpty()) return {
			args: [],
			memberArgs: [],
			opRestArg: null
		};else {
			let rest = tokens,
			    opRestArg = null;
			const l = tokens.last();

			if ((0, _Token.isGroup)(_Token.Groups.Space, l)) {
				const g = _Slice2.default.group(l);

				if ((0, _Token.isKeyword)(_Token.Keywords.Dot3, g.head())) {
					rest = tokens.rtail();
					opRestArg = (0, _parseLocalDeclares.parseLocalDeclareFromSpaced)(g.tail());
				}
			}

			if (includeMemberArgs) {
				var _parseLocalDeclaresAn = (0, _parseLocalDeclares.parseLocalDeclaresAndMemberArgs)(rest);

				const args = _parseLocalDeclaresAn.declares;
				const memberArgs = _parseLocalDeclaresAn.memberArgs;
				return {
					args: mutableArgs(args),
					memberArgs,
					opRestArg
				};
			} else return {
				args: mutableArgs((0, _parseLocalDeclares2.default)(rest)),
				opRestArg
			};
		}
	}

	function mutableArgs(args) {
		for (const _ of args) if (!_.isLazy()) _.kind = _MsAst.LocalDeclares.Mutable;

		return args;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRnVuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFtQndCLFFBQVE7U0FRaEIsWUFBWSxHQUFaLFlBQVk7U0FtQ1osZUFBZSxHQUFmLGVBQWU7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQTNDUCxRQUFROzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBUWhCLFlBQVk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQW1DWixlQUFlO01BQWdCLGlCQUFpQix5REFBQyxLQUFLIiwiZmlsZSI6InBhcnNlRnVuLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtCbG9ja0RvLCBCbG9ja1ZhbFJldHVybiwgRnVuLCBGdW5BYnN0cmFjdCwgRnVucywgTG9jYWxEZWNsYXJlLCBMb2NhbERlY2xhcmVzXG5cdH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwcywgaXNBbnlLZXl3b3JkLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aGVhZH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tOb25FbXB0eX0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge2JlZm9yZUFuZEJsb2NrLCBwYXJzZUJsb2NrRG9PclZhbH0gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlQ2FzZSBmcm9tICcuL3BhcnNlQ2FzZSdcbmltcG9ydCBwYXJzZUxvY2FsRGVjbGFyZXMsIHtwYXJzZUxvY2FsRGVjbGFyZUZyb21TcGFjZWQsIHBhcnNlTG9jYWxEZWNsYXJlc0FuZE1lbWJlckFyZ3Ncblx0fSBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcbmltcG9ydCBwYXJzZVNwYWNlZCBmcm9tICcuL3BhcnNlU3BhY2VkJ1xuaW1wb3J0IHBhcnNlU3dpdGNoIGZyb20gJy4vcGFyc2VTd2l0Y2gnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcbmltcG9ydCB0cnlUYWtlQ29tbWVudCBmcm9tICcuL3RyeVRha2VDb21tZW50J1xuXG4vKipcblBhcnNlIGEge0BsaW5rIEZ1bn0uXG5AcGFyYW0ga2V5d29yZEtpbmQge0tleXdvcmRzfSBBIGZ1bmN0aW9uIGtleXdvcmQuXG5AcGFyYW0ge1NsaWNlfSB0b2tlbnMgUmVzdCBvZiB0aGUgbGluZSBhZnRlciB0aGUgZnVuY3Rpb24ga2V5d29yZC5cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUZ1bihrZXl3b3JkS2luZCwgdG9rZW5zKSB7XG5cdGNvbnN0IFtpc1RoaXMsIGlzRG8sIGtpbmRdID0gZnVuS2luZChrZXl3b3JkS2luZClcblx0Y29uc3Qge29wUmV0dXJuVHlwZSwgcmVzdH0gPSB0cnlUYWtlUmV0dXJuVHlwZSh0b2tlbnMpXG5cdGNvbnN0IHthcmdzLCBvcFJlc3RBcmcsIGJsb2NrfSA9IGZ1bkFyZ3NBbmRCbG9jayhyZXN0LCAhaXNEbylcblx0cmV0dXJuIG5ldyBGdW4odG9rZW5zLmxvYywgYXJncywgb3BSZXN0QXJnLCBibG9jaywga2luZCwgaXNUaGlzLCBvcFJldHVyblR5cGUpXG59XG5cbi8qKiBQYXJzZSBhIHtAbGluayBGdW5MaWtlfS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUZ1bkxpa2Uoa2V5d29yZEtpbmQsIHRva2Vucykge1xuXHRjb25zdCBbaXNUaGlzLCBpc0RvLCBraW5kXSA9IGZ1bktpbmQoa2V5d29yZEtpbmQpXG5cdGNvbnN0IHtvcFJldHVyblR5cGUsIHJlc3R9ID0gdHJ5VGFrZVJldHVyblR5cGUodG9rZW5zKVxuXHRjb25zdCBbYmVmb3JlLCBibG9ja0xpbmVzXSA9IGJlZm9yZUFuZEJsb2NrKHJlc3QpXG5cdGNvbnN0IFtvcENvbW1lbnQsIHJlc3RMaW5lc10gPSB0cnlUYWtlQ29tbWVudChibG9ja0xpbmVzKVxuXG5cdGlmIChyZXN0TGluZXMuc2l6ZSgpID09PSAxKSB7XG5cdFx0Y29uc3QgaCA9IHJlc3RMaW5lcy5oZWFkU2xpY2UoKVxuXHRcdGlmIChoLnNpemUoKSA9PT0gMSAmJiBpc0tleXdvcmQoS2V5d29yZHMuQWJzdHJhY3QsIGguaGVhZCgpKSkge1xuXHRcdFx0Y29uc3Qge2FyZ3MsIG9wUmVzdEFyZ30gPSBwYXJzZUZ1bkxvY2FscyhiZWZvcmUpXG5cdFx0XHRyZXR1cm4gbmV3IEZ1bkFic3RyYWN0KHRva2Vucy5sb2MsIGFyZ3MsIG9wUmVzdEFyZywgb3BSZXR1cm5UeXBlLCBvcENvbW1lbnQpXG5cdFx0fVxuXHR9XG5cblx0Y29uc3Qge2FyZ3MsIG9wUmVzdEFyZywgYmxvY2t9ID0gZnVuQXJnc0FuZEJsb2NrKHJlc3QsICFpc0RvKVxuXHRyZXR1cm4gbmV3IEZ1bih0b2tlbnMubG9jLCBhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBraW5kLCBpc1RoaXMsIG9wUmV0dXJuVHlwZSlcbn1cblxuLyoqXG5QYXJzZSBmdW5jdGlvbiBhcmd1bWVudHMgYW5kIGJvZHkuXG5UaGlzIGFsc28gaGFuZGxlcyB0aGUgYHxjYXNlYCBhbmQgYHxzd2l0Y2hgIGZvcm1zLlxuQHBhcmFtIHtTbGljZX0gdG9rZW5zXG5AcGFyYW0ge2Jvb2xlYW59IGlzVmFsIFdoZXRoZXIgdGhpcyBpcyBhIGB8YCBhcyBvcHBvc2VkIHRvIGEgYCF8YFxuQHBhcmFtIFtpbmNsdWRlTWVtYmVyQXJnc11cblx0VGhpcyBpcyBmb3IgY29uc3RydWN0b3JzLlxuXHRJZiB0cnVlLCBvdXRwdXQgd2lsbCBpbmNsdWRlIGBtZW1iZXJBcmdzYC5cblx0VGhpcyBpcyB0aGUgc3Vic2V0IG9mIGBhcmdzYCB3aG9zZSBuYW1lcyBhcmUgcHJlZml4ZWQgd2l0aCBgLmAuXG5cdGUuZy46IGBjb25zdHJ1Y3QhIC54IC55YFxuQHJldHVybiB7XG5cdGFyZ3M6IEFycmF5PExvY2FsRGVjbGFyZT4sXG5cdG9wUmVzdEFyZzogP0xvY2FsRGVjbGFyZSxcblx0bWVtYmVyQXJnczpBcnJheTxMb2NhbERlY2xhcmU+LFxuXHRibG9jazogQmxvY2tcbn1cbiovXG5leHBvcnQgZnVuY3Rpb24gZnVuQXJnc0FuZEJsb2NrKHRva2VucywgaXNWYWwsIGluY2x1ZGVNZW1iZXJBcmdzPWZhbHNlKSB7XG5cdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAnRXhwZWN0ZWQgYW4gaW5kZW50ZWQgYmxvY2suJylcblx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKClcblxuXHQvLyBNaWdodCBiZSBgfGNhc2VgIG9yIGB8c3dpdGNoYFxuXHRpZiAoaXNBbnlLZXl3b3JkKGZ1bkZvY3VzS2V5d29yZHMsIGgpKSB7XG5cdFx0Y29uc3QgaXNDYXNlID0gaC5raW5kID09PSBLZXl3b3Jkcy5DYXNlXG5cdFx0Y29uc3QgZXhwciA9IChpc0Nhc2UgPyBwYXJzZUNhc2UgOiBwYXJzZVN3aXRjaCkoaXNWYWwsIHRydWUsIHRva2Vucy50YWlsKCkpXG5cdFx0Y29uc3QgYXJncyA9IFtMb2NhbERlY2xhcmUuZm9jdXMoaC5sb2MpXVxuXHRcdHJldHVybiBpc1ZhbCA/XG5cdFx0XHR7XG5cdFx0XHRcdGFyZ3MsIG9wUmVzdEFyZzogbnVsbCwgbWVtYmVyQXJnczogW10sXG5cdFx0XHRcdGJsb2NrOiBuZXcgQmxvY2tWYWxSZXR1cm4odG9rZW5zLmxvYywgbnVsbCwgW10sIGV4cHIpXG5cdFx0XHR9IDpcblx0XHRcdHtcblx0XHRcdFx0YXJncywgb3BSZXN0QXJnOiBudWxsLCBtZW1iZXJBcmdzOiBbXSxcblx0XHRcdFx0YmxvY2s6IG5ldyBCbG9ja0RvKHRva2Vucy5sb2MsIG51bGwsIFtleHByXSlcblx0XHRcdH1cblx0fSBlbHNlIHtcblx0XHRjb25zdCBbYmVmb3JlLCBibG9ja0xpbmVzXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0XHRjb25zdCB7YXJncywgb3BSZXN0QXJnLCBtZW1iZXJBcmdzfSA9IHBhcnNlRnVuTG9jYWxzKGJlZm9yZSwgaW5jbHVkZU1lbWJlckFyZ3MpXG5cdFx0Y29uc3QgYmxvY2sgPSBwYXJzZUJsb2NrRG9PclZhbChpc1ZhbCwgYmxvY2tMaW5lcylcblx0XHRyZXR1cm4ge2FyZ3MsIG9wUmVzdEFyZywgbWVtYmVyQXJncywgYmxvY2t9XG5cdH1cbn1cblxuY29uc3QgZnVuRm9jdXNLZXl3b3JkcyA9IG5ldyBTZXQoW0tleXdvcmRzLkNhc2UsIEtleXdvcmRzLlN3aXRjaF0pXG5cbmZ1bmN0aW9uIGZ1bktpbmQoa2V5d29yZEtpbmQpIHtcblx0c3dpdGNoIChrZXl3b3JkS2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuOlxuXHRcdFx0cmV0dXJuIFtmYWxzZSwgZmFsc2UsIEZ1bnMuUGxhaW5dXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5Ebzpcblx0XHRcdHJldHVybiBbZmFsc2UsIHRydWUsIEZ1bnMuUGxhaW5dXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzOlxuXHRcdFx0cmV0dXJuIFt0cnVlLCBmYWxzZSwgRnVucy5QbGFpbl1cblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNEbzpcblx0XHRcdHJldHVybiBbdHJ1ZSwgdHJ1ZSwgRnVucy5QbGFpbl1cblx0XHRjYXNlIEtleXdvcmRzLkZ1bkFzeW5jOlxuXHRcdFx0cmV0dXJuIFtmYWxzZSwgZmFsc2UsIEZ1bnMuQXN5bmNdXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5Bc3luY0RvOlxuXHRcdFx0cmV0dXJuIFtmYWxzZSwgdHJ1ZSwgRnVucy5Bc3luY11cblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNBc3luYzpcblx0XHRcdHJldHVybiBbdHJ1ZSwgZmFsc2UsIEZ1bnMuQXN5bmNdXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzQXN5bmNEbzpcblx0XHRcdHJldHVybiBbdHJ1ZSwgdHJ1ZSwgRnVucy5Bc3luY11cblx0XHRjYXNlIEtleXdvcmRzLkZ1bkdlbjpcblx0XHRcdHJldHVybiBbZmFsc2UsIGZhbHNlLCBGdW5zLkdlbmVyYXRvcl1cblx0XHRjYXNlIEtleXdvcmRzLkZ1bkdlbkRvOlxuXHRcdFx0cmV0dXJuIFtmYWxzZSwgdHJ1ZSwgRnVucy5HZW5lcmF0b3JdXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzR2VuOlxuXHRcdFx0cmV0dXJuIFt0cnVlLCBmYWxzZSwgRnVucy5HZW5lcmF0b3JdXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzR2VuRG86XG5cdFx0XHRyZXR1cm4gW3RydWUsIHRydWUsIEZ1bnMuR2VuZXJhdG9yXVxuXHRcdGRlZmF1bHQ6XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3Ioa2V5d29yZEtpbmQpXG5cdH1cbn1cblxuZnVuY3Rpb24gdHJ5VGFrZVJldHVyblR5cGUodG9rZW5zKSB7XG5cdGlmICghdG9rZW5zLmlzRW1wdHkoKSkge1xuXHRcdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpXG5cdFx0aWYgKGlzR3JvdXAoR3JvdXBzLlNwYWNlLCBoKSAmJiBpc0tleXdvcmQoS2V5d29yZHMuVHlwZSwgaGVhZChoLnN1YlRva2VucykpKVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0b3BSZXR1cm5UeXBlOiBwYXJzZVNwYWNlZChTbGljZS5ncm91cChoKS50YWlsKCkpLFxuXHRcdFx0XHRyZXN0OiB0b2tlbnMudGFpbCgpXG5cdFx0XHR9XG5cdH1cblx0cmV0dXJuIHtvcFJldHVyblR5cGU6IG51bGwsIHJlc3Q6IHRva2Vuc31cbn1cblxuZnVuY3Rpb24gcGFyc2VGdW5Mb2NhbHModG9rZW5zLCBpbmNsdWRlTWVtYmVyQXJncykge1xuXHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRyZXR1cm4ge2FyZ3M6IFtdLCBtZW1iZXJBcmdzOiBbXSwgb3BSZXN0QXJnOiBudWxsfVxuXHRlbHNlIHtcblx0XHRsZXQgcmVzdCA9IHRva2Vucywgb3BSZXN0QXJnID0gbnVsbFxuXHRcdGNvbnN0IGwgPSB0b2tlbnMubGFzdCgpXG5cdFx0aWYgKGlzR3JvdXAoR3JvdXBzLlNwYWNlLCBsKSkge1xuXHRcdFx0Y29uc3QgZyA9IFNsaWNlLmdyb3VwKGwpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkRvdDMsIGcuaGVhZCgpKSkge1xuXHRcdFx0XHRyZXN0ID0gdG9rZW5zLnJ0YWlsKClcblx0XHRcdFx0b3BSZXN0QXJnID0gcGFyc2VMb2NhbERlY2xhcmVGcm9tU3BhY2VkKGcudGFpbCgpKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoaW5jbHVkZU1lbWJlckFyZ3MpIHtcblx0XHRcdGNvbnN0IHtkZWNsYXJlczogYXJncywgbWVtYmVyQXJnc30gPSBwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzKHJlc3QpXG5cdFx0XHRyZXR1cm4ge2FyZ3M6IG11dGFibGVBcmdzKGFyZ3MpLCBtZW1iZXJBcmdzLCBvcFJlc3RBcmd9XG5cdFx0fSBlbHNlXG5cdFx0XHRyZXR1cm4ge2FyZ3M6IG11dGFibGVBcmdzKHBhcnNlTG9jYWxEZWNsYXJlcyhyZXN0KSksIG9wUmVzdEFyZ31cblx0fVxufVxuXG5mdW5jdGlvbiBtdXRhYmxlQXJncyhhcmdzKSB7XG5cdGZvciAoY29uc3QgXyBvZiBhcmdzKVxuXHRcdGlmICghXy5pc0xhenkoKSlcblx0XHRcdF8ua2luZCA9IExvY2FsRGVjbGFyZXMuTXV0YWJsZVxuXHRyZXR1cm4gYXJnc1xufVxuIl19
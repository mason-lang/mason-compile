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

	var _parseBlock2 = _interopRequireDefault(_parseBlock);

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

		const isThisFun = _funKind2[0];
		const isDo = _funKind2[1];
		const kind = _funKind2[2];

		var _tryTakeReturnType = tryTakeReturnType(tokens);

		const opReturnType = _tryTakeReturnType.opReturnType;
		const rest = _tryTakeReturnType.rest;

		var _funArgsAndBlock = funArgsAndBlock(rest, !isDo);

		const args = _funArgsAndBlock.args;
		const opRestArg = _funArgsAndBlock.opRestArg;
		const block = _funArgsAndBlock.block;
		return new _MsAst.Fun(tokens.loc, args, opRestArg, block, {
			kind,
			isThisFun,
			isDo,
			opReturnType
		});
	}

	function parseFunLike(keywordKind, tokens) {
		var _funKind3 = funKind(keywordKind);

		var _funKind4 = _slicedToArray(_funKind3, 3);

		const isThisFun = _funKind4[0];
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
		return new _MsAst.Fun(tokens.loc, args, opRestArg, block, {
			kind,
			isThisFun,
			isDo,
			opReturnType
		});
	}

	function funArgsAndBlock(tokens, isVal) {
		let includeMemberArgs = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
		(0, _checks.checkNonEmpty)(tokens, 'Expected an indented block.');
		const h = tokens.head();

		if ((0, _Token.isAnyKeyword)(funFocusKeywords, h)) {
			const expr = (h.kind === _Token.Keywords.Case ? _parseCase2.default : _parseSwitch2.default)(true, tokens.tail());
			const args = [_MsAst.LocalDeclare.focus(h.loc)];
			return {
				args,
				opRestArg: null,
				memberArgs: [],
				block: new _MsAst.Block(tokens.loc, null, [expr])
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
			const block = (0, _parseBlock2.default)(blockLines);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRnVuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFrQndCLFFBQVE7U0FRaEIsWUFBWSxHQUFaLFlBQVk7U0FtQ1osZUFBZSxHQUFmLGVBQWU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBM0NQLFFBQVE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQVFoQixZQUFZOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQW1DWixlQUFlO01BQWdCLGlCQUFpQix5REFBQyxLQUFLIiwiZmlsZSI6InBhcnNlRnVuLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtCbG9jaywgRnVuLCBGdW5BYnN0cmFjdCwgRnVucywgTG9jYWxEZWNsYXJlLCBMb2NhbERlY2xhcmVzfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXBzLCBpc0FueUtleXdvcmQsIGlzR3JvdXAsIGlzS2V5d29yZCwgS2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtoZWFkfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtjaGVja05vbkVtcHR5fSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCBwYXJzZUJsb2NrLCB7YmVmb3JlQW5kQmxvY2t9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZUNhc2UgZnJvbSAnLi9wYXJzZUNhc2UnXG5pbXBvcnQgcGFyc2VMb2NhbERlY2xhcmVzLCB7cGFyc2VMb2NhbERlY2xhcmVGcm9tU3BhY2VkLCBwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzXG5cdH0gZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5pbXBvcnQgcGFyc2VTcGFjZWQgZnJvbSAnLi9wYXJzZVNwYWNlZCdcbmltcG9ydCBwYXJzZVN3aXRjaCBmcm9tICcuL3BhcnNlU3dpdGNoJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5pbXBvcnQgdHJ5VGFrZUNvbW1lbnQgZnJvbSAnLi90cnlUYWtlQ29tbWVudCdcblxuLyoqXG5QYXJzZSBhIHtAbGluayBGdW59LlxuQHBhcmFtIGtleXdvcmRLaW5kIHtLZXl3b3Jkc30gQSBmdW5jdGlvbiBrZXl3b3JkLlxuQHBhcmFtIHtTbGljZX0gdG9rZW5zIFJlc3Qgb2YgdGhlIGxpbmUgYWZ0ZXIgdGhlIGZ1bmN0aW9uIGtleXdvcmQuXG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VGdW4oa2V5d29yZEtpbmQsIHRva2Vucykge1xuXHRjb25zdCBbaXNUaGlzRnVuLCBpc0RvLCBraW5kXSA9IGZ1bktpbmQoa2V5d29yZEtpbmQpXG5cdGNvbnN0IHtvcFJldHVyblR5cGUsIHJlc3R9ID0gdHJ5VGFrZVJldHVyblR5cGUodG9rZW5zKVxuXHRjb25zdCB7YXJncywgb3BSZXN0QXJnLCBibG9ja30gPSBmdW5BcmdzQW5kQmxvY2socmVzdCwgIWlzRG8pXG5cdHJldHVybiBuZXcgRnVuKHRva2Vucy5sb2MsIGFyZ3MsIG9wUmVzdEFyZywgYmxvY2ssIHtraW5kLCBpc1RoaXNGdW4sIGlzRG8sIG9wUmV0dXJuVHlwZX0pXG59XG5cbi8qKiBQYXJzZSBhIHtAbGluayBGdW5MaWtlfS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUZ1bkxpa2Uoa2V5d29yZEtpbmQsIHRva2Vucykge1xuXHRjb25zdCBbaXNUaGlzRnVuLCBpc0RvLCBraW5kXSA9IGZ1bktpbmQoa2V5d29yZEtpbmQpXG5cdGNvbnN0IHtvcFJldHVyblR5cGUsIHJlc3R9ID0gdHJ5VGFrZVJldHVyblR5cGUodG9rZW5zKVxuXHRjb25zdCBbYmVmb3JlLCBibG9ja0xpbmVzXSA9IGJlZm9yZUFuZEJsb2NrKHJlc3QpXG5cdGNvbnN0IFtvcENvbW1lbnQsIHJlc3RMaW5lc10gPSB0cnlUYWtlQ29tbWVudChibG9ja0xpbmVzKVxuXG5cdGlmIChyZXN0TGluZXMuc2l6ZSgpID09PSAxKSB7XG5cdFx0Y29uc3QgaCA9IHJlc3RMaW5lcy5oZWFkU2xpY2UoKVxuXHRcdGlmIChoLnNpemUoKSA9PT0gMSAmJiBpc0tleXdvcmQoS2V5d29yZHMuQWJzdHJhY3QsIGguaGVhZCgpKSkge1xuXHRcdFx0Y29uc3Qge2FyZ3MsIG9wUmVzdEFyZ30gPSBwYXJzZUZ1bkxvY2FscyhiZWZvcmUpXG5cdFx0XHRyZXR1cm4gbmV3IEZ1bkFic3RyYWN0KHRva2Vucy5sb2MsIGFyZ3MsIG9wUmVzdEFyZywgb3BSZXR1cm5UeXBlLCBvcENvbW1lbnQpXG5cdFx0fVxuXHR9XG5cblx0Y29uc3Qge2FyZ3MsIG9wUmVzdEFyZywgYmxvY2t9ID0gZnVuQXJnc0FuZEJsb2NrKHJlc3QsICFpc0RvKVxuXHRyZXR1cm4gbmV3IEZ1bih0b2tlbnMubG9jLCBhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCB7a2luZCwgaXNUaGlzRnVuLCBpc0RvLCBvcFJldHVyblR5cGV9KVxufVxuXG4vKipcblBhcnNlIGZ1bmN0aW9uIGFyZ3VtZW50cyBhbmQgYm9keS5cblRoaXMgYWxzbyBoYW5kbGVzIHRoZSBgfGNhc2VgIGFuZCBgfHN3aXRjaGAgZm9ybXMuXG5AcGFyYW0ge1NsaWNlfSB0b2tlbnNcbkBwYXJhbSB7Ym9vbGVhbn0gaXNWYWwgV2hldGhlciB0aGlzIGlzIGEgYHxgIGFzIG9wcG9zZWQgdG8gYSBgIXxgXG5AcGFyYW0gW2luY2x1ZGVNZW1iZXJBcmdzXVxuXHRUaGlzIGlzIGZvciBjb25zdHJ1Y3RvcnMuXG5cdElmIHRydWUsIG91dHB1dCB3aWxsIGluY2x1ZGUgYG1lbWJlckFyZ3NgLlxuXHRUaGlzIGlzIHRoZSBzdWJzZXQgb2YgYGFyZ3NgIHdob3NlIG5hbWVzIGFyZSBwcmVmaXhlZCB3aXRoIGAuYC5cblx0ZS5nLjogYGNvbnN0cnVjdCEgLnggLnlgXG5AcmV0dXJuIHtcblx0YXJnczogQXJyYXk8TG9jYWxEZWNsYXJlPixcblx0b3BSZXN0QXJnOiA/TG9jYWxEZWNsYXJlLFxuXHRtZW1iZXJBcmdzOkFycmF5PExvY2FsRGVjbGFyZT4sXG5cdGJsb2NrOiBCbG9ja1xufVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBmdW5BcmdzQW5kQmxvY2sodG9rZW5zLCBpc1ZhbCwgaW5jbHVkZU1lbWJlckFyZ3M9ZmFsc2UpIHtcblx0Y2hlY2tOb25FbXB0eSh0b2tlbnMsICdFeHBlY3RlZCBhbiBpbmRlbnRlZCBibG9jay4nKVxuXHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXG5cdC8vIE1pZ2h0IGJlIGB8Y2FzZWAgb3IgYHxzd2l0Y2hgXG5cdGlmIChpc0FueUtleXdvcmQoZnVuRm9jdXNLZXl3b3JkcywgaCkpIHtcblx0XHRjb25zdCBleHByID0gKGgua2luZCA9PT0gS2V5d29yZHMuQ2FzZSA/IHBhcnNlQ2FzZSA6IHBhcnNlU3dpdGNoKSh0cnVlLCB0b2tlbnMudGFpbCgpKVxuXHRcdGNvbnN0IGFyZ3MgPSBbTG9jYWxEZWNsYXJlLmZvY3VzKGgubG9jKV1cblx0XHRyZXR1cm4ge2FyZ3MsIG9wUmVzdEFyZzogbnVsbCwgbWVtYmVyQXJnczogW10sIGJsb2NrOiBuZXcgQmxvY2sodG9rZW5zLmxvYywgbnVsbCwgW2V4cHJdKX1cblx0fSBlbHNlIHtcblx0XHRjb25zdCBbYmVmb3JlLCBibG9ja0xpbmVzXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0XHRjb25zdCB7YXJncywgb3BSZXN0QXJnLCBtZW1iZXJBcmdzfSA9IHBhcnNlRnVuTG9jYWxzKGJlZm9yZSwgaW5jbHVkZU1lbWJlckFyZ3MpXG5cdFx0Y29uc3QgYmxvY2sgPSBwYXJzZUJsb2NrKGJsb2NrTGluZXMpXG5cdFx0cmV0dXJuIHthcmdzLCBvcFJlc3RBcmcsIG1lbWJlckFyZ3MsIGJsb2NrfVxuXHR9XG59XG5cbmNvbnN0IGZ1bkZvY3VzS2V5d29yZHMgPSBuZXcgU2V0KFtLZXl3b3Jkcy5DYXNlLCBLZXl3b3Jkcy5Td2l0Y2hdKVxuXG5mdW5jdGlvbiBmdW5LaW5kKGtleXdvcmRLaW5kKSB7XG5cdHN3aXRjaCAoa2V5d29yZEtpbmQpIHtcblx0XHRjYXNlIEtleXdvcmRzLkZ1bjpcblx0XHRcdHJldHVybiBbZmFsc2UsIGZhbHNlLCBGdW5zLlBsYWluXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuRG86XG5cdFx0XHRyZXR1cm4gW2ZhbHNlLCB0cnVlLCBGdW5zLlBsYWluXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpczpcblx0XHRcdHJldHVybiBbdHJ1ZSwgZmFsc2UsIEZ1bnMuUGxhaW5dXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzRG86XG5cdFx0XHRyZXR1cm4gW3RydWUsIHRydWUsIEZ1bnMuUGxhaW5dXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5Bc3luYzpcblx0XHRcdHJldHVybiBbZmFsc2UsIGZhbHNlLCBGdW5zLkFzeW5jXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuQXN5bmNEbzpcblx0XHRcdHJldHVybiBbZmFsc2UsIHRydWUsIEZ1bnMuQXN5bmNdXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzQXN5bmM6XG5cdFx0XHRyZXR1cm4gW3RydWUsIGZhbHNlLCBGdW5zLkFzeW5jXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0FzeW5jRG86XG5cdFx0XHRyZXR1cm4gW3RydWUsIHRydWUsIEZ1bnMuQXN5bmNdXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5HZW46XG5cdFx0XHRyZXR1cm4gW2ZhbHNlLCBmYWxzZSwgRnVucy5HZW5lcmF0b3JdXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5HZW5Ebzpcblx0XHRcdHJldHVybiBbZmFsc2UsIHRydWUsIEZ1bnMuR2VuZXJhdG9yXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0dlbjpcblx0XHRcdHJldHVybiBbdHJ1ZSwgZmFsc2UsIEZ1bnMuR2VuZXJhdG9yXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0dlbkRvOlxuXHRcdFx0cmV0dXJuIFt0cnVlLCB0cnVlLCBGdW5zLkdlbmVyYXRvcl1cblx0XHRkZWZhdWx0OlxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGtleXdvcmRLaW5kKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHRyeVRha2VSZXR1cm5UeXBlKHRva2Vucykge1xuXHRpZiAoIXRva2Vucy5pc0VtcHR5KCkpIHtcblx0XHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXHRcdGlmIChpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgaCkgJiYgaXNLZXl3b3JkKEtleXdvcmRzLlR5cGUsIGhlYWQoaC5zdWJUb2tlbnMpKSlcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdG9wUmV0dXJuVHlwZTogcGFyc2VTcGFjZWQoU2xpY2UuZ3JvdXAoaCkudGFpbCgpKSxcblx0XHRcdFx0cmVzdDogdG9rZW5zLnRhaWwoKVxuXHRcdFx0fVxuXHR9XG5cdHJldHVybiB7b3BSZXR1cm5UeXBlOiBudWxsLCByZXN0OiB0b2tlbnN9XG59XG5cbmZ1bmN0aW9uIHBhcnNlRnVuTG9jYWxzKHRva2VucywgaW5jbHVkZU1lbWJlckFyZ3MpIHtcblx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIHthcmdzOiBbXSwgbWVtYmVyQXJnczogW10sIG9wUmVzdEFyZzogbnVsbH1cblx0ZWxzZSB7XG5cdFx0bGV0IHJlc3QgPSB0b2tlbnMsIG9wUmVzdEFyZyA9IG51bGxcblx0XHRjb25zdCBsID0gdG9rZW5zLmxhc3QoKVxuXHRcdGlmIChpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgbCkpIHtcblx0XHRcdGNvbnN0IGcgPSBTbGljZS5ncm91cChsKVxuXHRcdFx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5Eb3QzLCBnLmhlYWQoKSkpIHtcblx0XHRcdFx0cmVzdCA9IHRva2Vucy5ydGFpbCgpXG5cdFx0XHRcdG9wUmVzdEFyZyA9IHBhcnNlTG9jYWxEZWNsYXJlRnJvbVNwYWNlZChnLnRhaWwoKSlcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGluY2x1ZGVNZW1iZXJBcmdzKSB7XG5cdFx0XHRjb25zdCB7ZGVjbGFyZXM6IGFyZ3MsIG1lbWJlckFyZ3N9ID0gcGFyc2VMb2NhbERlY2xhcmVzQW5kTWVtYmVyQXJncyhyZXN0KVxuXHRcdFx0cmV0dXJuIHthcmdzOiBtdXRhYmxlQXJncyhhcmdzKSwgbWVtYmVyQXJncywgb3BSZXN0QXJnfVxuXHRcdH0gZWxzZVxuXHRcdFx0cmV0dXJuIHthcmdzOiBtdXRhYmxlQXJncyhwYXJzZUxvY2FsRGVjbGFyZXMocmVzdCkpLCBvcFJlc3RBcmd9XG5cdH1cbn1cblxuZnVuY3Rpb24gbXV0YWJsZUFyZ3MoYXJncykge1xuXHRmb3IgKGNvbnN0IF8gb2YgYXJncylcblx0XHRpZiAoIV8uaXNMYXp5KCkpXG5cdFx0XHRfLmtpbmQgPSBMb2NhbERlY2xhcmVzLk11dGFibGVcblx0cmV0dXJuIGFyZ3Ncbn1cbiJdfQ==
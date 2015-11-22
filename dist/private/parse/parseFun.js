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

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	var _slicedToArray = (function () {
		function sliceIterator(arr, i) {
			var _arr = [];
			var _n = true;
			var _d = false;
			var _e = undefined;

			try {
				for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
					_arr.push(_s.value);

					if (i && _arr.length === i) break;
				}
			} catch (err) {
				_d = true;
				_e = err;
			} finally {
				try {
					if (!_n && _i["return"]) _i["return"]();
				} finally {
					if (_d) throw _e;
				}
			}

			return _arr;
		}

		return function (arr, i) {
			if (Array.isArray(arr)) {
				return arr;
			} else if (Symbol.iterator in Object(arr)) {
				return sliceIterator(arr, i);
			} else {
				throw new TypeError("Invalid attempt to destructure non-iterable instance");
			}
		};
	})();

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
			if ((0, _Token.isGroup)(_Token.Groups.Space, h) && (0, _Token.isKeyword)(_Token.Keywords.Colon, (0, _util.head)(h.subTokens))) return {
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
					args,
					memberArgs,
					opRestArg
				};
			} else return {
				args: (0, _parseLocalDeclares2.default)(rest),
				opRestArg
			};
		}
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRnVuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFrQndCLFFBQVE7U0FRaEIsWUFBWSxHQUFaLFlBQVk7U0FtQ1osZUFBZSxHQUFmLGVBQWU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQTNDUCxRQUFROzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFRaEIsWUFBWTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFtQ1osZUFBZTtNQUFnQixpQkFBaUIseURBQUMsS0FBSyIsImZpbGUiOiJwYXJzZUZ1bi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QmxvY2ssIEZ1biwgRnVuQWJzdHJhY3QsIEZ1bnMsIExvY2FsRGVjbGFyZX0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwcywgaXNBbnlLZXl3b3JkLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aGVhZH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tOb25FbXB0eX0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQgcGFyc2VCbG9jaywge2JlZm9yZUFuZEJsb2NrfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQgcGFyc2VDYXNlIGZyb20gJy4vcGFyc2VDYXNlJ1xuaW1wb3J0IHBhcnNlTG9jYWxEZWNsYXJlcywge3BhcnNlTG9jYWxEZWNsYXJlRnJvbVNwYWNlZCwgcGFyc2VMb2NhbERlY2xhcmVzQW5kTWVtYmVyQXJnc1xuXHR9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuaW1wb3J0IHBhcnNlU3BhY2VkIGZyb20gJy4vcGFyc2VTcGFjZWQnXG5pbXBvcnQgcGFyc2VTd2l0Y2ggZnJvbSAnLi9wYXJzZVN3aXRjaCdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuaW1wb3J0IHRyeVRha2VDb21tZW50IGZyb20gJy4vdHJ5VGFrZUNvbW1lbnQnXG5cbi8qKlxuUGFyc2UgYSB7QGxpbmsgRnVufS5cbkBwYXJhbSBrZXl3b3JkS2luZCB7S2V5d29yZHN9IEEgZnVuY3Rpb24ga2V5d29yZC5cbkBwYXJhbSB7U2xpY2V9IHRva2VucyBSZXN0IG9mIHRoZSBsaW5lIGFmdGVyIHRoZSBmdW5jdGlvbiBrZXl3b3JkLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlRnVuKGtleXdvcmRLaW5kLCB0b2tlbnMpIHtcblx0Y29uc3QgW2lzVGhpc0Z1biwgaXNEbywga2luZF0gPSBmdW5LaW5kKGtleXdvcmRLaW5kKVxuXHRjb25zdCB7b3BSZXR1cm5UeXBlLCByZXN0fSA9IHRyeVRha2VSZXR1cm5UeXBlKHRva2Vucylcblx0Y29uc3Qge2FyZ3MsIG9wUmVzdEFyZywgYmxvY2t9ID0gZnVuQXJnc0FuZEJsb2NrKHJlc3QsICFpc0RvKVxuXHRyZXR1cm4gbmV3IEZ1bih0b2tlbnMubG9jLCBhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCB7a2luZCwgaXNUaGlzRnVuLCBpc0RvLCBvcFJldHVyblR5cGV9KVxufVxuXG4vKiogUGFyc2UgYSB7QGxpbmsgRnVuTGlrZX0uICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VGdW5MaWtlKGtleXdvcmRLaW5kLCB0b2tlbnMpIHtcblx0Y29uc3QgW2lzVGhpc0Z1biwgaXNEbywga2luZF0gPSBmdW5LaW5kKGtleXdvcmRLaW5kKVxuXHRjb25zdCB7b3BSZXR1cm5UeXBlLCByZXN0fSA9IHRyeVRha2VSZXR1cm5UeXBlKHRva2Vucylcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tMaW5lc10gPSBiZWZvcmVBbmRCbG9jayhyZXN0KVxuXHRjb25zdCBbb3BDb21tZW50LCByZXN0TGluZXNdID0gdHJ5VGFrZUNvbW1lbnQoYmxvY2tMaW5lcylcblxuXHRpZiAocmVzdExpbmVzLnNpemUoKSA9PT0gMSkge1xuXHRcdGNvbnN0IGggPSByZXN0TGluZXMuaGVhZFNsaWNlKClcblx0XHRpZiAoaC5zaXplKCkgPT09IDEgJiYgaXNLZXl3b3JkKEtleXdvcmRzLkFic3RyYWN0LCBoLmhlYWQoKSkpIHtcblx0XHRcdGNvbnN0IHthcmdzLCBvcFJlc3RBcmd9ID0gcGFyc2VGdW5Mb2NhbHMoYmVmb3JlKVxuXHRcdFx0cmV0dXJuIG5ldyBGdW5BYnN0cmFjdCh0b2tlbnMubG9jLCBhcmdzLCBvcFJlc3RBcmcsIG9wUmV0dXJuVHlwZSwgb3BDb21tZW50KVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IHthcmdzLCBvcFJlc3RBcmcsIGJsb2NrfSA9IGZ1bkFyZ3NBbmRCbG9jayhyZXN0LCAhaXNEbylcblx0cmV0dXJuIG5ldyBGdW4odG9rZW5zLmxvYywgYXJncywgb3BSZXN0QXJnLCBibG9jaywge2tpbmQsIGlzVGhpc0Z1biwgaXNEbywgb3BSZXR1cm5UeXBlfSlcbn1cblxuLyoqXG5QYXJzZSBmdW5jdGlvbiBhcmd1bWVudHMgYW5kIGJvZHkuXG5UaGlzIGFsc28gaGFuZGxlcyB0aGUgYHxjYXNlYCBhbmQgYHxzd2l0Y2hgIGZvcm1zLlxuQHBhcmFtIHtTbGljZX0gdG9rZW5zXG5AcGFyYW0ge2Jvb2xlYW59IGlzVmFsIFdoZXRoZXIgdGhpcyBpcyBhIGB8YCBhcyBvcHBvc2VkIHRvIGEgYCF8YFxuQHBhcmFtIFtpbmNsdWRlTWVtYmVyQXJnc11cblx0VGhpcyBpcyBmb3IgY29uc3RydWN0b3JzLlxuXHRJZiB0cnVlLCBvdXRwdXQgd2lsbCBpbmNsdWRlIGBtZW1iZXJBcmdzYC5cblx0VGhpcyBpcyB0aGUgc3Vic2V0IG9mIGBhcmdzYCB3aG9zZSBuYW1lcyBhcmUgcHJlZml4ZWQgd2l0aCBgLmAuXG5cdGUuZy46IGBjb25zdHJ1Y3QhIC54IC55YFxuQHJldHVybiB7XG5cdGFyZ3M6IEFycmF5PExvY2FsRGVjbGFyZT4sXG5cdG9wUmVzdEFyZzogP0xvY2FsRGVjbGFyZSxcblx0bWVtYmVyQXJnczpBcnJheTxMb2NhbERlY2xhcmU+LFxuXHRibG9jazogQmxvY2tcbn1cbiovXG5leHBvcnQgZnVuY3Rpb24gZnVuQXJnc0FuZEJsb2NrKHRva2VucywgaXNWYWwsIGluY2x1ZGVNZW1iZXJBcmdzPWZhbHNlKSB7XG5cdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAnRXhwZWN0ZWQgYW4gaW5kZW50ZWQgYmxvY2suJylcblx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKClcblxuXHQvLyBNaWdodCBiZSBgfGNhc2VgIG9yIGB8c3dpdGNoYFxuXHRpZiAoaXNBbnlLZXl3b3JkKGZ1bkZvY3VzS2V5d29yZHMsIGgpKSB7XG5cdFx0Y29uc3QgZXhwciA9IChoLmtpbmQgPT09IEtleXdvcmRzLkNhc2UgPyBwYXJzZUNhc2UgOiBwYXJzZVN3aXRjaCkodHJ1ZSwgdG9rZW5zLnRhaWwoKSlcblx0XHRjb25zdCBhcmdzID0gW0xvY2FsRGVjbGFyZS5mb2N1cyhoLmxvYyldXG5cdFx0cmV0dXJuIHthcmdzLCBvcFJlc3RBcmc6IG51bGwsIG1lbWJlckFyZ3M6IFtdLCBibG9jazogbmV3IEJsb2NrKHRva2Vucy5sb2MsIG51bGwsIFtleHByXSl9XG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tMaW5lc10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdFx0Y29uc3Qge2FyZ3MsIG9wUmVzdEFyZywgbWVtYmVyQXJnc30gPSBwYXJzZUZ1bkxvY2FscyhiZWZvcmUsIGluY2x1ZGVNZW1iZXJBcmdzKVxuXHRcdGNvbnN0IGJsb2NrID0gcGFyc2VCbG9jayhibG9ja0xpbmVzKVxuXHRcdHJldHVybiB7YXJncywgb3BSZXN0QXJnLCBtZW1iZXJBcmdzLCBibG9ja31cblx0fVxufVxuXG5jb25zdCBmdW5Gb2N1c0tleXdvcmRzID0gbmV3IFNldChbS2V5d29yZHMuQ2FzZSwgS2V5d29yZHMuU3dpdGNoXSlcblxuZnVuY3Rpb24gZnVuS2luZChrZXl3b3JkS2luZCkge1xuXHRzd2l0Y2ggKGtleXdvcmRLaW5kKSB7XG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW46XG5cdFx0XHRyZXR1cm4gW2ZhbHNlLCBmYWxzZSwgRnVucy5QbGFpbl1cblx0XHRjYXNlIEtleXdvcmRzLkZ1bkRvOlxuXHRcdFx0cmV0dXJuIFtmYWxzZSwgdHJ1ZSwgRnVucy5QbGFpbl1cblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXM6XG5cdFx0XHRyZXR1cm4gW3RydWUsIGZhbHNlLCBGdW5zLlBsYWluXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0RvOlxuXHRcdFx0cmV0dXJuIFt0cnVlLCB0cnVlLCBGdW5zLlBsYWluXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuQXN5bmM6XG5cdFx0XHRyZXR1cm4gW2ZhbHNlLCBmYWxzZSwgRnVucy5Bc3luY11cblx0XHRjYXNlIEtleXdvcmRzLkZ1bkFzeW5jRG86XG5cdFx0XHRyZXR1cm4gW2ZhbHNlLCB0cnVlLCBGdW5zLkFzeW5jXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0FzeW5jOlxuXHRcdFx0cmV0dXJuIFt0cnVlLCBmYWxzZSwgRnVucy5Bc3luY11cblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNBc3luY0RvOlxuXHRcdFx0cmV0dXJuIFt0cnVlLCB0cnVlLCBGdW5zLkFzeW5jXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuR2VuOlxuXHRcdFx0cmV0dXJuIFtmYWxzZSwgZmFsc2UsIEZ1bnMuR2VuZXJhdG9yXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuR2VuRG86XG5cdFx0XHRyZXR1cm4gW2ZhbHNlLCB0cnVlLCBGdW5zLkdlbmVyYXRvcl1cblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNHZW46XG5cdFx0XHRyZXR1cm4gW3RydWUsIGZhbHNlLCBGdW5zLkdlbmVyYXRvcl1cblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNHZW5Ebzpcblx0XHRcdHJldHVybiBbdHJ1ZSwgdHJ1ZSwgRnVucy5HZW5lcmF0b3JdXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHRocm93IG5ldyBFcnJvcihrZXl3b3JkS2luZClcblx0fVxufVxuXG5mdW5jdGlvbiB0cnlUYWtlUmV0dXJuVHlwZSh0b2tlbnMpIHtcblx0aWYgKCF0b2tlbnMuaXNFbXB0eSgpKSB7XG5cdFx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKClcblx0XHRpZiAoaXNHcm91cChHcm91cHMuU3BhY2UsIGgpICYmIGlzS2V5d29yZChLZXl3b3Jkcy5Db2xvbiwgaGVhZChoLnN1YlRva2VucykpKVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0b3BSZXR1cm5UeXBlOiBwYXJzZVNwYWNlZChTbGljZS5ncm91cChoKS50YWlsKCkpLFxuXHRcdFx0XHRyZXN0OiB0b2tlbnMudGFpbCgpXG5cdFx0XHR9XG5cdH1cblx0cmV0dXJuIHtvcFJldHVyblR5cGU6IG51bGwsIHJlc3Q6IHRva2Vuc31cbn1cblxuZnVuY3Rpb24gcGFyc2VGdW5Mb2NhbHModG9rZW5zLCBpbmNsdWRlTWVtYmVyQXJncykge1xuXHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRyZXR1cm4ge2FyZ3M6IFtdLCBtZW1iZXJBcmdzOiBbXSwgb3BSZXN0QXJnOiBudWxsfVxuXHRlbHNlIHtcblx0XHRsZXQgcmVzdCA9IHRva2Vucywgb3BSZXN0QXJnID0gbnVsbFxuXHRcdGNvbnN0IGwgPSB0b2tlbnMubGFzdCgpXG5cdFx0aWYgKGlzR3JvdXAoR3JvdXBzLlNwYWNlLCBsKSkge1xuXHRcdFx0Y29uc3QgZyA9IFNsaWNlLmdyb3VwKGwpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkRvdDMsIGcuaGVhZCgpKSkge1xuXHRcdFx0XHRyZXN0ID0gdG9rZW5zLnJ0YWlsKClcblx0XHRcdFx0b3BSZXN0QXJnID0gcGFyc2VMb2NhbERlY2xhcmVGcm9tU3BhY2VkKGcudGFpbCgpKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoaW5jbHVkZU1lbWJlckFyZ3MpIHtcblx0XHRcdGNvbnN0IHtkZWNsYXJlczogYXJncywgbWVtYmVyQXJnc30gPSBwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzKHJlc3QpXG5cdFx0XHRyZXR1cm4ge2FyZ3MsIG1lbWJlckFyZ3MsIG9wUmVzdEFyZ31cblx0XHR9IGVsc2Vcblx0XHRcdHJldHVybiB7YXJnczogcGFyc2VMb2NhbERlY2xhcmVzKHJlc3QpLCBvcFJlc3RBcmd9XG5cdH1cbn1cbiJdfQ==
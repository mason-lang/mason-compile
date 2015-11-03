'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../MsAst', '../Token', '../util', './checks', './parseBlock', './parseCase', './parseLocalDeclares', './parseSpaced', './parseSwitch', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parseBlock'), require('./parseCase'), require('./parseLocalDeclares'), require('./parseSpaced'), require('./parseSwitch'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst, global.Token, global.util, global.checks, global.parseBlock, global.parseCase, global.parseLocalDeclares, global.parseSpaced, global.parseSwitch, global.Slice);
		global.parseFun = mod.exports;
	}
})(this, function (exports, _MsAst, _Token, _util, _checks, _parseBlock, _parseCase, _parseLocalDeclares, _parseSpaced, _parseSwitch, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseFun;
	exports.funArgsAndBlock = funArgsAndBlock;

	var _parseCase2 = _interopRequireDefault(_parseCase);

	var _parseLocalDeclares2 = _interopRequireDefault(_parseLocalDeclares);

	var _parseSpaced2 = _interopRequireDefault(_parseSpaced);

	var _parseSwitch2 = _interopRequireDefault(_parseSwitch);

	var _Slice2 = _interopRequireDefault(_Slice);

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
			var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens);

			var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

			const before = _beforeAndBlock2[0];
			const blockLines = _beforeAndBlock2[1];

			var _parseFunLocals = parseFunLocals(before, includeMemberArgs);

			const args = _parseFunLocals.args;
			const opRestArg = _parseFunLocals.opRestArg;
			const memberArgs = _parseFunLocals.memberArgs;

			for (const arg of args) if (!arg.isLazy()) arg.kind = _MsAst.LocalDeclares.Mutable;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRnVuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFrQndCLFFBQVE7U0F3QmhCLGVBQWUsR0FBZixlQUFlOzs7Ozs7Ozs7Ozs7Ozs7O1VBeEJQLFFBQVE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUF3QmhCLGVBQWU7TUFBZ0IsaUJBQWlCLHlEQUFDLEtBQUsiLCJmaWxlIjoicGFyc2VGdW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Jsb2NrRG8sIEJsb2NrVmFsUmV0dXJuLCBGdW4sIEZ1bnMsIExvY2FsRGVjbGFyZSwgTG9jYWxEZWNsYXJlc30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwcywgaXNBbnlLZXl3b3JkLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aGVhZH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tOb25FbXB0eX0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge2JlZm9yZUFuZEJsb2NrLCBwYXJzZUJsb2NrRG9PclZhbH0gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlQ2FzZSBmcm9tICcuL3BhcnNlQ2FzZSdcbmltcG9ydCBwYXJzZUxvY2FsRGVjbGFyZXMsIHtwYXJzZUxvY2FsRGVjbGFyZUZyb21TcGFjZWQsIHBhcnNlTG9jYWxEZWNsYXJlc0FuZE1lbWJlckFyZ3Ncblx0fSBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcbmltcG9ydCBwYXJzZVNwYWNlZCBmcm9tICcuL3BhcnNlU3BhY2VkJ1xuaW1wb3J0IHBhcnNlU3dpdGNoIGZyb20gJy4vcGFyc2VTd2l0Y2gnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLyoqXG5QYXJzZSBhIGZ1bmN0aW9uLlxuQHBhcmFtIGtleXdvcmRLaW5kIHtLZXl3b3Jkc30gQSBmdW5jdGlvbiBrZXl3b3JkLlxuQHBhcmFtIHtTbGljZX0gdG9rZW5zIFJlc3Qgb2YgdGhlIGxpbmUgYWZ0ZXIgdGhlIGZ1bmN0aW9uIGtleXdvcmQuXG5AcmV0dXJuIHtGdW59XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VGdW4oa2V5d29yZEtpbmQsIHRva2Vucykge1xuXHRjb25zdCBbaXNUaGlzLCBpc0RvLCBraW5kXSA9IGZ1bktpbmQoa2V5d29yZEtpbmQpXG5cdGNvbnN0IHtvcFJldHVyblR5cGUsIHJlc3R9ID0gdHJ5VGFrZVJldHVyblR5cGUodG9rZW5zKVxuXHRjb25zdCB7YXJncywgb3BSZXN0QXJnLCBibG9ja30gPSBmdW5BcmdzQW5kQmxvY2socmVzdCwgIWlzRG8pXG5cdHJldHVybiBuZXcgRnVuKHRva2Vucy5sb2MsIGFyZ3MsIG9wUmVzdEFyZywgYmxvY2ssIGtpbmQsIGlzVGhpcywgb3BSZXR1cm5UeXBlKVxufVxuXG4vKipcblBhcnNlIGZ1bmN0aW9uIGFyZ3VtZW50cyBhbmQgYm9keS5cblRoaXMgYWxzbyBoYW5kbGVzIHRoZSBgfGNhc2VgIGFuZCBgfHN3aXRjaGAgZm9ybXMuXG5AcGFyYW0ge1NsaWNlfSB0b2tlbnNcbkBwYXJhbSB7Ym9vbGVhbn0gaXNWYWwgV2hldGhlciB0aGlzIGlzIGEgYHxgIGFzIG9wcG9zZWQgdG8gYSBgIXxgXG5AcGFyYW0gW2luY2x1ZGVNZW1iZXJBcmdzXVxuXHRUaGlzIGlzIGZvciBjb25zdHJ1Y3RvcnMuXG5cdElmIHRydWUsIG91dHB1dCB3aWxsIGluY2x1ZGUgYG1lbWJlckFyZ3NgLlxuXHRUaGlzIGlzIHRoZSBzdWJzZXQgb2YgYGFyZ3NgIHdob3NlIG5hbWVzIGFyZSBwcmVmaXhlZCB3aXRoIGAuYC5cblx0ZS5nLjogYGNvbnN0cnVjdCEgLnggLnlgXG5AcmV0dXJuIHtcblx0YXJnczogQXJyYXk8TG9jYWxEZWNsYXJlPixcblx0b3BSZXN0QXJnOiA/TG9jYWxEZWNsYXJlLFxuXHRtZW1iZXJBcmdzOkFycmF5PExvY2FsRGVjbGFyZT4sXG5cdGJsb2NrOiBCbG9ja1xufVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBmdW5BcmdzQW5kQmxvY2sodG9rZW5zLCBpc1ZhbCwgaW5jbHVkZU1lbWJlckFyZ3M9ZmFsc2UpIHtcblx0Y2hlY2tOb25FbXB0eSh0b2tlbnMsICdFeHBlY3RlZCBhbiBpbmRlbnRlZCBibG9jay4nKVxuXHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXG5cdC8vIE1pZ2h0IGJlIGB8Y2FzZWAgb3IgYHxzd2l0Y2hgXG5cdGlmIChpc0FueUtleXdvcmQoZnVuRm9jdXNLZXl3b3JkcywgaCkpIHtcblx0XHRjb25zdCBpc0Nhc2UgPSBoLmtpbmQgPT09IEtleXdvcmRzLkNhc2Vcblx0XHRjb25zdCBleHByID0gKGlzQ2FzZSA/IHBhcnNlQ2FzZSA6IHBhcnNlU3dpdGNoKShpc1ZhbCwgdHJ1ZSwgdG9rZW5zLnRhaWwoKSlcblx0XHRjb25zdCBhcmdzID0gW0xvY2FsRGVjbGFyZS5mb2N1cyhoLmxvYyldXG5cdFx0cmV0dXJuIGlzVmFsID9cblx0XHRcdHtcblx0XHRcdFx0YXJncywgb3BSZXN0QXJnOiBudWxsLCBtZW1iZXJBcmdzOiBbXSxcblx0XHRcdFx0YmxvY2s6IG5ldyBCbG9ja1ZhbFJldHVybih0b2tlbnMubG9jLCBudWxsLCBbXSwgZXhwcilcblx0XHRcdH0gOlxuXHRcdFx0e1xuXHRcdFx0XHRhcmdzLCBvcFJlc3RBcmc6IG51bGwsIG1lbWJlckFyZ3M6IFtdLFxuXHRcdFx0XHRibG9jazogbmV3IEJsb2NrRG8odG9rZW5zLmxvYywgbnVsbCwgW2V4cHJdKVxuXHRcdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrTGluZXNdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRcdGNvbnN0IHthcmdzLCBvcFJlc3RBcmcsIG1lbWJlckFyZ3N9ID0gcGFyc2VGdW5Mb2NhbHMoYmVmb3JlLCBpbmNsdWRlTWVtYmVyQXJncylcblx0XHRmb3IgKGNvbnN0IGFyZyBvZiBhcmdzKVxuXHRcdFx0aWYgKCFhcmcuaXNMYXp5KCkpXG5cdFx0XHRcdGFyZy5raW5kID0gTG9jYWxEZWNsYXJlcy5NdXRhYmxlXG5cdFx0Y29uc3QgYmxvY2sgPSBwYXJzZUJsb2NrRG9PclZhbChpc1ZhbCwgYmxvY2tMaW5lcylcblx0XHRyZXR1cm4ge2FyZ3MsIG9wUmVzdEFyZywgbWVtYmVyQXJncywgYmxvY2t9XG5cdH1cbn1cblxuY29uc3QgZnVuRm9jdXNLZXl3b3JkcyA9IG5ldyBTZXQoW0tleXdvcmRzLkNhc2UsIEtleXdvcmRzLlN3aXRjaF0pXG5cbmZ1bmN0aW9uIGZ1bktpbmQoa2V5d29yZEtpbmQpIHtcblx0c3dpdGNoIChrZXl3b3JkS2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuOlxuXHRcdFx0cmV0dXJuIFtmYWxzZSwgZmFsc2UsIEZ1bnMuUGxhaW5dXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5Ebzpcblx0XHRcdHJldHVybiBbZmFsc2UsIHRydWUsIEZ1bnMuUGxhaW5dXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzOlxuXHRcdFx0cmV0dXJuIFt0cnVlLCBmYWxzZSwgRnVucy5QbGFpbl1cblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNEbzpcblx0XHRcdHJldHVybiBbdHJ1ZSwgdHJ1ZSwgRnVucy5QbGFpbl1cblx0XHRjYXNlIEtleXdvcmRzLkZ1bkFzeW5jOlxuXHRcdFx0cmV0dXJuIFtmYWxzZSwgZmFsc2UsIEZ1bnMuQXN5bmNdXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5Bc3luY0RvOlxuXHRcdFx0cmV0dXJuIFtmYWxzZSwgdHJ1ZSwgRnVucy5Bc3luY11cblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNBc3luYzpcblx0XHRcdHJldHVybiBbdHJ1ZSwgZmFsc2UsIEZ1bnMuQXN5bmNdXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzQXN5bmNEbzpcblx0XHRcdHJldHVybiBbdHJ1ZSwgdHJ1ZSwgRnVucy5Bc3luY11cblx0XHRjYXNlIEtleXdvcmRzLkZ1bkdlbjpcblx0XHRcdHJldHVybiBbZmFsc2UsIGZhbHNlLCBGdW5zLkdlbmVyYXRvcl1cblx0XHRjYXNlIEtleXdvcmRzLkZ1bkdlbkRvOlxuXHRcdFx0cmV0dXJuIFtmYWxzZSwgdHJ1ZSwgRnVucy5HZW5lcmF0b3JdXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzR2VuOlxuXHRcdFx0cmV0dXJuIFt0cnVlLCBmYWxzZSwgRnVucy5HZW5lcmF0b3JdXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzR2VuRG86XG5cdFx0XHRyZXR1cm4gW3RydWUsIHRydWUsIEZ1bnMuR2VuZXJhdG9yXVxuXHRcdGRlZmF1bHQ6XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3Ioa2V5d29yZEtpbmQpXG5cdH1cbn1cblxuZnVuY3Rpb24gdHJ5VGFrZVJldHVyblR5cGUodG9rZW5zKSB7XG5cdGlmICghdG9rZW5zLmlzRW1wdHkoKSkge1xuXHRcdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpXG5cdFx0aWYgKGlzR3JvdXAoR3JvdXBzLlNwYWNlLCBoKSAmJiBpc0tleXdvcmQoS2V5d29yZHMuVHlwZSwgaGVhZChoLnN1YlRva2VucykpKVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0b3BSZXR1cm5UeXBlOiBwYXJzZVNwYWNlZChTbGljZS5ncm91cChoKS50YWlsKCkpLFxuXHRcdFx0XHRyZXN0OiB0b2tlbnMudGFpbCgpXG5cdFx0XHR9XG5cdH1cblx0cmV0dXJuIHtvcFJldHVyblR5cGU6IG51bGwsIHJlc3Q6IHRva2Vuc31cbn1cblxuZnVuY3Rpb24gcGFyc2VGdW5Mb2NhbHModG9rZW5zLCBpbmNsdWRlTWVtYmVyQXJncykge1xuXHRpZiAodG9rZW5zLmlzRW1wdHkoKSlcblx0XHRyZXR1cm4ge2FyZ3M6IFtdLCBtZW1iZXJBcmdzOiBbXSwgb3BSZXN0QXJnOiBudWxsfVxuXHRlbHNlIHtcblx0XHRsZXQgcmVzdCA9IHRva2Vucywgb3BSZXN0QXJnID0gbnVsbFxuXHRcdGNvbnN0IGwgPSB0b2tlbnMubGFzdCgpXG5cdFx0aWYgKGlzR3JvdXAoR3JvdXBzLlNwYWNlLCBsKSkge1xuXHRcdFx0Y29uc3QgZyA9IFNsaWNlLmdyb3VwKGwpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkRvdDMsIGcuaGVhZCgpKSkge1xuXHRcdFx0XHRyZXN0ID0gdG9rZW5zLnJ0YWlsKClcblx0XHRcdFx0b3BSZXN0QXJnID0gcGFyc2VMb2NhbERlY2xhcmVGcm9tU3BhY2VkKGcudGFpbCgpKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoaW5jbHVkZU1lbWJlckFyZ3MpIHtcblx0XHRcdGNvbnN0IHtkZWNsYXJlczogYXJncywgbWVtYmVyQXJnc30gPSBwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzKHJlc3QpXG5cdFx0XHRyZXR1cm4ge2FyZ3MsIG1lbWJlckFyZ3MsIG9wUmVzdEFyZ31cblx0XHR9IGVsc2Vcblx0XHRcdHJldHVybiB7YXJnczogcGFyc2VMb2NhbERlY2xhcmVzKHJlc3QpLCBvcFJlc3RBcmd9XG5cdH1cbn1cbiJdfQ==
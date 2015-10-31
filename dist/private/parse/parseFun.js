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

		var _funArgsAndBlock = funArgsAndBlock(rest, isDo);

		const args = _funArgsAndBlock.args;
		const opRestArg = _funArgsAndBlock.opRestArg;
		const block = _funArgsAndBlock.block;
		return new _MsAst.Fun(tokens.loc, args, opRestArg, block, kind, isThis, opReturnType);
	}

	function funArgsAndBlock(tokens, isDo) {
		let includeMemberArgs = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
		(0, _checks.checkNonEmpty)(tokens, 'Expected an indented block.');
		const h = tokens.head();

		if ((0, _Token.isAnyKeyword)(funFocusKeywords, h)) {
			const isVal = h.kind === _Token.Keywords.CaseVal || h.kind === _Token.Keywords.SwitchVal;
			const isCase = h.kind === _Token.Keywords.CaseVal || h.kind === _Token.Keywords.CaseDo;
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

			const block = (isDo ? _parseBlock.parseBlockDo : _parseBlock.parseBlockVal)(blockLines);
			return {
				args,
				opRestArg,
				memberArgs,
				block
			};
		}
	}

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

	const funFocusKeywords = new Set([_Token.Keywords.CaseVal, _Token.Keywords.CaseDo, _Token.Keywords.SwitchVal, _Token.Keywords.SwitchDo]);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRnVuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFrQndCLFFBQVE7U0F3QmhCLGVBQWUsR0FBZixlQUFlOzs7Ozs7Ozs7Ozs7Ozs7O1VBeEJQLFFBQVE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUF3QmhCLGVBQWU7TUFBZSxpQkFBaUIseURBQUMsS0FBSyIsImZpbGUiOiJwYXJzZUZ1bi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QmxvY2tEbywgQmxvY2tWYWxSZXR1cm4sIEZ1biwgRnVucywgTG9jYWxEZWNsYXJlLCBMb2NhbERlY2xhcmVzfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXBzLCBpc0FueUtleXdvcmQsIGlzR3JvdXAsIGlzS2V5d29yZCwgS2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtoZWFkfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtjaGVja05vbkVtcHR5fSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7YmVmb3JlQW5kQmxvY2ssIHBhcnNlQmxvY2tEbywgcGFyc2VCbG9ja1ZhbH0gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlQ2FzZSBmcm9tICcuL3BhcnNlQ2FzZSdcbmltcG9ydCBwYXJzZUxvY2FsRGVjbGFyZXMsIHtwYXJzZUxvY2FsRGVjbGFyZUZyb21TcGFjZWQsIHBhcnNlTG9jYWxEZWNsYXJlc0FuZE1lbWJlckFyZ3Ncblx0fSBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcbmltcG9ydCBwYXJzZVNwYWNlZCBmcm9tICcuL3BhcnNlU3BhY2VkJ1xuaW1wb3J0IHBhcnNlU3dpdGNoIGZyb20gJy4vcGFyc2VTd2l0Y2gnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLyoqXG5QYXJzZSBhIGZ1bmN0aW9uLlxuQHBhcmFtIGtpbmQge0tleXdvcmRzfSBBIGZ1bmN0aW9uIGtleXdvcmQuXG5AcGFyYW0ge1NsaWNlfSB0b2tlbnMgUmVzdCBvZiB0aGUgbGluZSBhZnRlciB0aGUgZnVuY3Rpb24ga2V5d29yZC5cbkByZXR1cm4ge0Z1bn1cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUZ1bihrZXl3b3JkS2luZCwgdG9rZW5zKSB7XG5cdGNvbnN0IFtpc1RoaXMsIGlzRG8sIGtpbmRdID0gZnVuS2luZChrZXl3b3JkS2luZClcblx0Y29uc3Qge29wUmV0dXJuVHlwZSwgcmVzdH0gPSB0cnlUYWtlUmV0dXJuVHlwZSh0b2tlbnMpXG5cdGNvbnN0IHthcmdzLCBvcFJlc3RBcmcsIGJsb2NrfSA9IGZ1bkFyZ3NBbmRCbG9jayhyZXN0LCBpc0RvKVxuXHRyZXR1cm4gbmV3IEZ1bih0b2tlbnMubG9jLCBhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBraW5kLCBpc1RoaXMsIG9wUmV0dXJuVHlwZSlcbn1cblxuLyoqXG5QYXJzZSBmdW5jdGlvbiBhcmd1bWVudHMgYW5kIGJvZHkuXG5UaGlzIGFsc28gaGFuZGxlcyB0aGUgYHxjYXNlYCBhbmQgYHxzd2l0Y2hgIGZvcm1zLlxuQHBhcmFtIHtTbGljZX0gdG9rZW5zXG5AcGFyYW0ge2Jvb2xlYW59IGlzRG8gV2hldGhlciB0aGlzIGlzIGEgYCF8YFxuQHBhcmFtIHtpbmNsdWRlTWVtYmVyQXJnc31cblx0VGhpcyBpcyBmb3IgY29uc3RydWN0b3JzLlxuXHRJZiB0cnVlLCBvdXRwdXQgd2lsbCBpbmNsdWRlIGBtZW1iZXJBcmdzYC5cblx0VGhpcyBpcyB0aGUgc3Vic2V0IG9mIGBhcmdzYCB3aG9zZSBuYW1lcyBhcmUgcHJlZml4ZWQgd2l0aCBgLmAuXG5cdGUuZy46IGBjb25zdHJ1Y3QhIC54IC55YFxuQHJldHVybiB7XG5cdGFyZ3M6IEFycmF5PExvY2FsRGVjbGFyZT4sXG5cdG9wUmVzdEFyZzogP0xvY2FsRGVjbGFyZSxcblx0bWVtYmVyQXJnczpBcnJheTxMb2NhbERlY2xhcmU+LFxuXHRibG9jazogQmxvY2tcbn1cbiovXG5leHBvcnQgZnVuY3Rpb24gZnVuQXJnc0FuZEJsb2NrKHRva2VucywgaXNEbywgaW5jbHVkZU1lbWJlckFyZ3M9ZmFsc2UpIHtcblx0Y2hlY2tOb25FbXB0eSh0b2tlbnMsICdFeHBlY3RlZCBhbiBpbmRlbnRlZCBibG9jay4nKVxuXHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXG5cdC8vIE1pZ2h0IGJlIGB8Y2FzZWAgKG9yIGB8Y2FzZSFgLCBgfHN3aXRjaGAsIGB8c3dpdGNoIWApXG5cdGlmIChpc0FueUtleXdvcmQoZnVuRm9jdXNLZXl3b3JkcywgaCkpIHtcblx0XHRjb25zdCBpc1ZhbCA9IGgua2luZCA9PT0gS2V5d29yZHMuQ2FzZVZhbCB8fCBoLmtpbmQgPT09IEtleXdvcmRzLlN3aXRjaFZhbFxuXHRcdGNvbnN0IGlzQ2FzZSA9IGgua2luZCA9PT0gS2V5d29yZHMuQ2FzZVZhbCB8fCBoLmtpbmQgPT09IEtleXdvcmRzLkNhc2VEb1xuXHRcdGNvbnN0IGV4cHIgPSAoaXNDYXNlID8gcGFyc2VDYXNlIDogcGFyc2VTd2l0Y2gpKGlzVmFsLCB0cnVlLCB0b2tlbnMudGFpbCgpKVxuXG5cdFx0Y29uc3QgYXJncyA9IFtMb2NhbERlY2xhcmUuZm9jdXMoaC5sb2MpXVxuXHRcdHJldHVybiBpc1ZhbCA/XG5cdFx0XHR7XG5cdFx0XHRcdGFyZ3MsIG9wUmVzdEFyZzogbnVsbCwgbWVtYmVyQXJnczogW10sXG5cdFx0XHRcdGJsb2NrOiBuZXcgQmxvY2tWYWxSZXR1cm4odG9rZW5zLmxvYywgbnVsbCwgW10sIGV4cHIpXG5cdFx0XHR9IDpcblx0XHRcdHtcblx0XHRcdFx0YXJncywgb3BSZXN0QXJnOiBudWxsLCBtZW1iZXJBcmdzOiBbXSxcblx0XHRcdFx0YmxvY2s6IG5ldyBCbG9ja0RvKHRva2Vucy5sb2MsIG51bGwsIFtleHByXSlcblx0XHRcdH1cblx0fSBlbHNlIHtcblx0XHRjb25zdCBbYmVmb3JlLCBibG9ja0xpbmVzXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0XHRjb25zdCB7YXJncywgb3BSZXN0QXJnLCBtZW1iZXJBcmdzfSA9IHBhcnNlRnVuTG9jYWxzKGJlZm9yZSwgaW5jbHVkZU1lbWJlckFyZ3MpXG5cdFx0Zm9yIChjb25zdCBhcmcgb2YgYXJncylcblx0XHRcdGlmICghYXJnLmlzTGF6eSgpKVxuXHRcdFx0XHRhcmcua2luZCA9IExvY2FsRGVjbGFyZXMuTXV0YWJsZVxuXHRcdGNvbnN0IGJsb2NrID0gKGlzRG8gPyBwYXJzZUJsb2NrRG8gOiBwYXJzZUJsb2NrVmFsKShibG9ja0xpbmVzKVxuXHRcdHJldHVybiB7YXJncywgb3BSZXN0QXJnLCBtZW1iZXJBcmdzLCBibG9ja31cblx0fVxufVxuXG5mdW5jdGlvbiBmdW5LaW5kKGtleXdvcmRLaW5kKSB7XG5cdHN3aXRjaCAoa2V5d29yZEtpbmQpIHtcblx0XHRjYXNlIEtleXdvcmRzLkZ1bjpcblx0XHRcdHJldHVybiBbZmFsc2UsIGZhbHNlLCBGdW5zLlBsYWluXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuRG86XG5cdFx0XHRyZXR1cm4gW2ZhbHNlLCB0cnVlLCBGdW5zLlBsYWluXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpczpcblx0XHRcdHJldHVybiBbdHJ1ZSwgZmFsc2UsIEZ1bnMuUGxhaW5dXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzRG86XG5cdFx0XHRyZXR1cm4gW3RydWUsIHRydWUsIEZ1bnMuUGxhaW5dXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5Bc3luYzpcblx0XHRcdHJldHVybiBbZmFsc2UsIGZhbHNlLCBGdW5zLkFzeW5jXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuQXN5bmNEbzpcblx0XHRcdHJldHVybiBbZmFsc2UsIHRydWUsIEZ1bnMuQXN5bmNdXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzQXN5bmM6XG5cdFx0XHRyZXR1cm4gW3RydWUsIGZhbHNlLCBGdW5zLkFzeW5jXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0FzeW5jRG86XG5cdFx0XHRyZXR1cm4gW3RydWUsIHRydWUsIEZ1bnMuQXN5bmNdXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5HZW46XG5cdFx0XHRyZXR1cm4gW2ZhbHNlLCBmYWxzZSwgRnVucy5HZW5lcmF0b3JdXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5HZW5Ebzpcblx0XHRcdHJldHVybiBbZmFsc2UsIHRydWUsIEZ1bnMuR2VuZXJhdG9yXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0dlbjpcblx0XHRcdHJldHVybiBbdHJ1ZSwgZmFsc2UsIEZ1bnMuR2VuZXJhdG9yXVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0dlbkRvOlxuXHRcdFx0cmV0dXJuIFt0cnVlLCB0cnVlLCBGdW5zLkdlbmVyYXRvcl1cblx0XHRkZWZhdWx0OlxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGtleXdvcmRLaW5kKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHRyeVRha2VSZXR1cm5UeXBlKHRva2Vucykge1xuXHRpZiAoIXRva2Vucy5pc0VtcHR5KCkpIHtcblx0XHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKVxuXHRcdGlmIChpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgaCkgJiYgaXNLZXl3b3JkKEtleXdvcmRzLlR5cGUsIGhlYWQoaC5zdWJUb2tlbnMpKSlcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdG9wUmV0dXJuVHlwZTogcGFyc2VTcGFjZWQoU2xpY2UuZ3JvdXAoaCkudGFpbCgpKSxcblx0XHRcdFx0cmVzdDogdG9rZW5zLnRhaWwoKVxuXHRcdFx0fVxuXHR9XG5cdHJldHVybiB7b3BSZXR1cm5UeXBlOiBudWxsLCByZXN0OiB0b2tlbnN9XG59XG5cbmNvbnN0IGZ1bkZvY3VzS2V5d29yZHMgPSBuZXcgU2V0KFtcblx0S2V5d29yZHMuQ2FzZVZhbCwgS2V5d29yZHMuQ2FzZURvLCBLZXl3b3Jkcy5Td2l0Y2hWYWwsIEtleXdvcmRzLlN3aXRjaERvXG5dKVxuXG5mdW5jdGlvbiBwYXJzZUZ1bkxvY2Fscyh0b2tlbnMsIGluY2x1ZGVNZW1iZXJBcmdzKSB7XG5cdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdHJldHVybiB7YXJnczogW10sIG1lbWJlckFyZ3M6IFtdLCBvcFJlc3RBcmc6IG51bGx9XG5cdGVsc2Uge1xuXHRcdGxldCByZXN0ID0gdG9rZW5zLCBvcFJlc3RBcmcgPSBudWxsXG5cdFx0Y29uc3QgbCA9IHRva2Vucy5sYXN0KClcblx0XHRpZiAoaXNHcm91cChHcm91cHMuU3BhY2UsIGwpKSB7XG5cdFx0XHRjb25zdCBnID0gU2xpY2UuZ3JvdXAobClcblx0XHRcdGlmIChpc0tleXdvcmQoS2V5d29yZHMuRG90MywgZy5oZWFkKCkpKSB7XG5cdFx0XHRcdHJlc3QgPSB0b2tlbnMucnRhaWwoKVxuXHRcdFx0XHRvcFJlc3RBcmcgPSBwYXJzZUxvY2FsRGVjbGFyZUZyb21TcGFjZWQoZy50YWlsKCkpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChpbmNsdWRlTWVtYmVyQXJncykge1xuXHRcdFx0Y29uc3Qge2RlY2xhcmVzOiBhcmdzLCBtZW1iZXJBcmdzfSA9IHBhcnNlTG9jYWxEZWNsYXJlc0FuZE1lbWJlckFyZ3MocmVzdClcblx0XHRcdHJldHVybiB7YXJncywgbWVtYmVyQXJncywgb3BSZXN0QXJnfVxuXHRcdH0gZWxzZVxuXHRcdFx0cmV0dXJuIHthcmdzOiBwYXJzZUxvY2FsRGVjbGFyZXMocmVzdCksIG9wUmVzdEFyZ31cblx0fVxufVxuIl19
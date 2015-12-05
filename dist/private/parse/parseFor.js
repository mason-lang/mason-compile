'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', '../util', './parse*', './parseBlock', './parseLocalDeclares'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./parse*'), require('./parseBlock'), require('./parseLocalDeclares'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.util, global.parse, global.parseBlock, global.parseLocalDeclares);
		global.parseFor = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _util, _parse, _parseBlock, _parseLocalDeclares) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseFor;

	var _parseBlock2 = _interopRequireDefault(_parseBlock);

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

	function parseFor(kind, tokens) {
		var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const block = _beforeAndBlock2[1];
		const Ctr = kindToCtr.get(kind);
		const opIter = Ctr === _MsAst.ForAsync ? parseIteratee(before) : (0, _util.opIf)(!before.isEmpty(), () => parseIteratee(before));
		return new Ctr(tokens.loc, opIter, (0, _parseBlock2.default)(block));
	}

	const kindToCtr = new Map([[_Token.Keywords.For, _MsAst.For], [_Token.Keywords.ForAsync, _MsAst.ForAsync], [_Token.Keywords.ForBag, _MsAst.ForBag]]);

	function parseIteratee(tokens) {
		var _ifElse = (0, _util.ifElse)(tokens.opSplitOnce(_ => (0, _Token.isKeyword)(_Token.Keywords.Of, _)), _ref => {
			let before = _ref.before;
			let after = _ref.after;
			(0, _context.check)(before.size() === 1, before.loc, 'forPattern');
			return [(0, _parseLocalDeclares.parseLocalDeclaresJustNames)(before)[0], (0, _parse.parseExpr)(after)];
		}, () => [_MsAst.LocalDeclare.focus(tokens.loc), (0, _parse.parseExpr)(tokens)]);

		var _ifElse2 = _slicedToArray(_ifElse, 2);

		const element = _ifElse2[0];
		const bag = _ifElse2[1];
		return new _MsAst.Iteratee(tokens.loc, element, bag);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRm9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFRd0IsUUFBUTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBQVIsUUFBUSIsImZpbGUiOiJwYXJzZUZvci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0ZvciwgRm9yQXN5bmMsIEZvckJhZywgSXRlcmF0ZWUsIExvY2FsRGVjbGFyZX0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2lzS2V5d29yZCwgS2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtpZkVsc2UsIG9wSWZ9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge3BhcnNlRXhwcn0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQgcGFyc2VCbG9jaywge2JlZm9yZUFuZEJsb2NrfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQge3BhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lc30gZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlRm9yKGtpbmQsIHRva2Vucykge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdGNvbnN0IEN0ciA9IGtpbmRUb0N0ci5nZXQoa2luZClcblx0Y29uc3Qgb3BJdGVyID0gQ3RyID09PSBGb3JBc3luYyA/XG5cdFx0cGFyc2VJdGVyYXRlZShiZWZvcmUpIDpcblx0XHRvcElmKCFiZWZvcmUuaXNFbXB0eSgpLCAoKSA9PiBwYXJzZUl0ZXJhdGVlKGJlZm9yZSkpXG5cdHJldHVybiBuZXcgQ3RyKHRva2Vucy5sb2MsIG9wSXRlciwgcGFyc2VCbG9jayhibG9jaykpXG59XG5cbmNvbnN0IGtpbmRUb0N0ciA9IG5ldyBNYXAoXG5cdFtbS2V5d29yZHMuRm9yLCBGb3JdLCBbS2V5d29yZHMuRm9yQXN5bmMsIEZvckFzeW5jXSwgW0tleXdvcmRzLkZvckJhZywgRm9yQmFnXV0pXG5cbmZ1bmN0aW9uIHBhcnNlSXRlcmF0ZWUodG9rZW5zKSB7XG5cdGNvbnN0IFtlbGVtZW50LCBiYWddID1cblx0XHRpZkVsc2UodG9rZW5zLm9wU3BsaXRPbmNlKF8gPT4gaXNLZXl3b3JkKEtleXdvcmRzLk9mLCBfKSksXG5cdFx0XHQoe2JlZm9yZSwgYWZ0ZXJ9KSA9PiB7XG5cdFx0XHRcdGNoZWNrKGJlZm9yZS5zaXplKCkgPT09IDEsIGJlZm9yZS5sb2MsICdmb3JQYXR0ZXJuJylcblx0XHRcdFx0cmV0dXJuIFtwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMoYmVmb3JlKVswXSwgcGFyc2VFeHByKGFmdGVyKV1cblx0XHRcdH0sXG5cdFx0XHQoKSA9PiBbTG9jYWxEZWNsYXJlLmZvY3VzKHRva2Vucy5sb2MpLCBwYXJzZUV4cHIodG9rZW5zKV0pXG5cdHJldHVybiBuZXcgSXRlcmF0ZWUodG9rZW5zLmxvYywgZWxlbWVudCwgYmFnKVxufVxuIl19
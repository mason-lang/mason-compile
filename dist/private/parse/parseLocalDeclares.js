'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', '../util', './checks', './parse*', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parse*'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.util, global.checks, global.parse, global.Slice);
		global.parseLocalDeclares = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _util, _checks, _parse, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseLocalDeclares;
	exports.parseLocalDeclaresJustNames = parseLocalDeclaresJustNames;
	exports.parseLocalDeclare = parseLocalDeclare;
	exports.parseLocalDeclareFromSpaced = parseLocalDeclareFromSpaced;
	exports.parseLocalDeclaresAndMemberArgs = parseLocalDeclaresAndMemberArgs;
	exports.parseLocalName = parseLocalName;
	exports.parseLocalDeclareOrFocus = parseLocalDeclareOrFocus;

	var _Slice2 = _interopRequireDefault(_Slice);

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

	function parseLocalDeclares(tokens) {
		return tokens.map(parseLocalDeclare);
	}

	function parseLocalDeclaresJustNames(tokens) {
		return tokens.map(_ => _MsAst.LocalDeclare.plain(_.loc, parseLocalName(_)));
	}

	function parseLocalDeclare(token) {
		return _parseLocalDeclare(token);
	}

	function parseLocalDeclareFromSpaced(tokens) {
		return _parseLocalDeclareFromSpaced(tokens);
	}

	function parseLocalDeclaresAndMemberArgs(tokens) {
		const declares = [],
		      memberArgs = [];

		for (const token of tokens) {
			var _parseLocalDeclare2 = _parseLocalDeclare(token, true);

			const declare = _parseLocalDeclare2.declare;
			const isMember = _parseLocalDeclare2.isMember;
			declares.push(declare);
			if (isMember) memberArgs.push(declare);
		}

		return {
			declares,
			memberArgs
		};
	}

	function parseLocalName(token) {
		if ((0, _Token.isKeyword)(_Token.Keywords.Focus, token)) return '_';else {
			(0, _context.check)(token instanceof _Token.Name, token.loc, () => `Expected a local name, not ${ token }.`);
			return token.name;
		}
	}

	function parseLocalDeclareOrFocus(tokens) {
		if (tokens.isEmpty()) return _MsAst.LocalDeclare.focus(tokens.loc);else {
			(0, _context.check)(tokens.size() === 1, tokens.loc, 'Expected only one local declare.');
			const token = tokens.head();

			if ((0, _Token.isGroup)(_Token.Groups.Space, token)) {
				const slice = _Slice2.default.group(token);

				if ((0, _Token.isKeyword)(_Token.Keywords.Colon, slice.head())) return _MsAst.LocalDeclare.typedFocus(tokens.loc, (0, _parse.parseSpaced)(slice.tail()));
			}

			return parseLocalDeclare(token);
		}
	}

	function _parseLocalDeclare(token) {
		let orMember = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
		if ((0, _Token.isGroup)(_Token.Groups.Space, token)) return _parseLocalDeclareFromSpaced(_Slice2.default.group(token), orMember);else {
			const declare = _MsAst.LocalDeclare.plain(token.loc, parseLocalName(token));

			return orMember ? {
				declare,
				isMember: false
			} : declare;
		}
	}

	function _parseLocalDeclareFromSpaced(tokens) {
		let orMember = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

		var _ref = (0, _Token.isKeyword)(_Token.Keywords.Lazy, tokens.head()) ? [tokens.tail(), _MsAst.LocalDeclares.Lazy, false] : orMember && (0, _Token.isKeyword)(_Token.Keywords.Dot, tokens.head()) ? [tokens.tail(), _MsAst.LocalDeclares.Eager, true] : [tokens, _MsAst.LocalDeclares.Eager, false];

		var _ref2 = _slicedToArray(_ref, 3);

		const rest = _ref2[0];
		const kind = _ref2[1];
		const isMember = _ref2[2];
		const name = parseLocalName(rest.head());
		const rest2 = rest.tail();
		const opType = (0, _util.opIf)(!rest2.isEmpty(), () => {
			const colon = rest2.head();
			(0, _checks.checkKeyword)(_Token.Keywords.Colon, colon);
			const tokensType = rest2.tail();
			(0, _checks.checkNonEmpty)(tokensType, () => `Expected something after ${ colon }`);
			return (0, _parse.parseSpaced)(tokensType);
		});
		const declare = new _MsAst.LocalDeclare(tokens.loc, name, opType, kind);
		return orMember ? {
			declare,
			isMember
		} : declare;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTG9jYWxEZWNsYXJlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBWXdCLGtCQUFrQjtTQVExQiwyQkFBMkIsR0FBM0IsMkJBQTJCO1NBSzNCLGlCQUFpQixHQUFqQixpQkFBaUI7U0FLakIsMkJBQTJCLEdBQTNCLDJCQUEyQjtTQVMzQiwrQkFBK0IsR0FBL0IsK0JBQStCO1NBZ0IvQixjQUFjLEdBQWQsY0FBYztTQWVkLHdCQUF3QixHQUF4Qix3QkFBd0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQTFEaEIsa0JBQWtCOzs7O1VBUTFCLDJCQUEyQjs7OztVQUszQixpQkFBaUI7Ozs7VUFLakIsMkJBQTJCOzs7O1VBUzNCLCtCQUErQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQWdCL0IsY0FBYzs7Ozs7OztVQWVkLHdCQUF3Qjs7Ozs7Ozs7Ozs7Ozs7OztNQWVMLFFBQVEseURBQUMsS0FBSzs7Ozs7Ozs7Ozs7O01BU0gsUUFBUSx5REFBQyxLQUFLIiwiZmlsZSI6InBhcnNlTG9jYWxEZWNsYXJlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0xvY2FsRGVjbGFyZSwgTG9jYWxEZWNsYXJlc30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwcywgaXNHcm91cCwgaXNLZXl3b3JkLCBLZXl3b3JkcywgTmFtZX0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge29wSWZ9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2NoZWNrTm9uRW1wdHksIGNoZWNrS2V5d29yZH0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge3BhcnNlU3BhY2VkfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKipcblBhcnNlIGxvY2FscyAoYGFgIG9yIGBhOmJgKS5cbkByZXR1cm4ge0FycmF5PExvY2FsRGVjbGFyZT59XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VMb2NhbERlY2xhcmVzKHRva2Vucykge1xuXHRyZXR1cm4gdG9rZW5zLm1hcChwYXJzZUxvY2FsRGVjbGFyZSlcbn1cblxuLyoqXG5QYXJzZSBsb2NhbHMgd2l0aCBubyB0eXBlcyBhbGxvd2VkLlxuQHJldHVybiB7QXJyYXk8TG9jYWxEZWNsYXJlPn1cbiovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKHRva2Vucykge1xuXHRyZXR1cm4gdG9rZW5zLm1hcChfID0+IExvY2FsRGVjbGFyZS5wbGFpbihfLmxvYywgcGFyc2VMb2NhbE5hbWUoXykpKVxufVxuXG4vKiogUGFyc2UgYSBzaW5nbGUgbG9jYWwgZGVjbGFyZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxvY2FsRGVjbGFyZSh0b2tlbikge1xuXHRyZXR1cm4gX3BhcnNlTG9jYWxEZWNsYXJlKHRva2VuKVxufVxuXG4vKiogUGFyc2UgYSBzaW5nbGUgbG9jYWwgZGVjbGFyZSBmcm9tIHRoZSB0b2tlbnMgaW4gYSB7QGxpbmsgR3JvdXBzLlNwYWNlfS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxvY2FsRGVjbGFyZUZyb21TcGFjZWQodG9rZW5zKSB7XG5cdHJldHVybiBfcGFyc2VMb2NhbERlY2xhcmVGcm9tU3BhY2VkKHRva2Vucylcbn1cblxuLyoqXG5Gb3IgY29uc3RydWN0b3IuIFBhcnNlIGxvY2FsIGRlY2xhcmVzIHdoaWxlIGFsbG93aW5nIGAueGAtc3R5bGUgYXJndW1lbnRzLlxuQHJldHVybiB7e2RlY2xhcmVzOiBBcnJheTxMb2NhbERlY2xhcmU+LCBtZW1iZXJBcmdzOiBBcnJheTxMb2NhbERlY2xhcmU+fX1cblx0YG1lbWJlckFyZ3NgIGlzICBhIHN1YnNldCBvZiBgZGVjbGFyZXNgLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzKHRva2Vucykge1xuXHRjb25zdCBkZWNsYXJlcyA9IFtdLCBtZW1iZXJBcmdzID0gW11cblx0Zm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcblx0XHRjb25zdCB7ZGVjbGFyZSwgaXNNZW1iZXJ9ID0gX3BhcnNlTG9jYWxEZWNsYXJlKHRva2VuLCB0cnVlKVxuXHRcdGRlY2xhcmVzLnB1c2goZGVjbGFyZSlcblx0XHRpZiAoaXNNZW1iZXIpXG5cdFx0XHRtZW1iZXJBcmdzLnB1c2goZGVjbGFyZSlcblx0fVxuXHRyZXR1cm4ge2RlY2xhcmVzLCBtZW1iZXJBcmdzfVxufVxuXG4vKipcblBhcnNlIGEgbmFtZSBmb3IgYSBsb2NhbCB2YXJpYWJsZS5cblVubGlrZSB7QGxpbmsgcGFyc2VOYW1lfSwgYF9gIGlzIHRoZSBvbmx5IGFsbG93ZWQgS2V5d29yZC5cbkByZXR1cm4ge3N0cmluZ31cbiovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VMb2NhbE5hbWUodG9rZW4pIHtcblx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5Gb2N1cywgdG9rZW4pKVxuXHRcdHJldHVybiAnXydcblx0ZWxzZSB7XG5cdFx0Y2hlY2sodG9rZW4gaW5zdGFuY2VvZiBOYW1lLCB0b2tlbi5sb2MsICgpID0+IGBFeHBlY3RlZCBhIGxvY2FsIG5hbWUsIG5vdCAke3Rva2VufS5gKVxuXHRcdHJldHVybiB0b2tlbi5uYW1lXG5cdH1cbn1cblxuLyoqXG5JZiBgdG9rZW5zYCBpczpcblx0ZW1wdHk6IHVudHlwZWQgZm9jdXNcblx0YDpUeXBlYDogdHlwZWQgZm9jdXNcblx0YGZvb2Agb3IgYGZvbzpUeXBlYDogQSBub3JtYWwgTG9jYWxEZWNsYXJlLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxvY2FsRGVjbGFyZU9yRm9jdXModG9rZW5zKSB7XG5cdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdHJldHVybiBMb2NhbERlY2xhcmUuZm9jdXModG9rZW5zLmxvYylcblx0ZWxzZSB7XG5cdFx0Y2hlY2sodG9rZW5zLnNpemUoKSA9PT0gMSwgdG9rZW5zLmxvYywgJ0V4cGVjdGVkIG9ubHkgb25lIGxvY2FsIGRlY2xhcmUuJylcblx0XHRjb25zdCB0b2tlbiA9IHRva2Vucy5oZWFkKClcblx0XHRpZiAoaXNHcm91cChHcm91cHMuU3BhY2UsIHRva2VuKSkge1xuXHRcdFx0Y29uc3Qgc2xpY2UgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRcdGlmIChpc0tleXdvcmQoS2V5d29yZHMuQ29sb24sIHNsaWNlLmhlYWQoKSkpXG5cdFx0XHRcdHJldHVybiBMb2NhbERlY2xhcmUudHlwZWRGb2N1cyh0b2tlbnMubG9jLCBwYXJzZVNwYWNlZChzbGljZS50YWlsKCkpKVxuXHRcdH1cblx0XHRyZXR1cm4gcGFyc2VMb2NhbERlY2xhcmUodG9rZW4pXG5cdH1cbn1cblxuZnVuY3Rpb24gX3BhcnNlTG9jYWxEZWNsYXJlKHRva2VuLCBvck1lbWJlcj1mYWxzZSkge1xuXHRpZiAoaXNHcm91cChHcm91cHMuU3BhY2UsIHRva2VuKSlcblx0XHRyZXR1cm4gX3BhcnNlTG9jYWxEZWNsYXJlRnJvbVNwYWNlZChTbGljZS5ncm91cCh0b2tlbiksIG9yTWVtYmVyKVxuXHRlbHNlIHtcblx0XHRjb25zdCBkZWNsYXJlID0gTG9jYWxEZWNsYXJlLnBsYWluKHRva2VuLmxvYywgcGFyc2VMb2NhbE5hbWUodG9rZW4pKVxuXHRcdHJldHVybiBvck1lbWJlciA/IHtkZWNsYXJlLCBpc01lbWJlcjogZmFsc2V9IDogZGVjbGFyZVxuXHR9XG59XG5cbmZ1bmN0aW9uIF9wYXJzZUxvY2FsRGVjbGFyZUZyb21TcGFjZWQodG9rZW5zLCBvck1lbWJlcj1mYWxzZSkge1xuXHRjb25zdCBbcmVzdCwga2luZCwgaXNNZW1iZXJdID1cblx0XHRpc0tleXdvcmQoS2V5d29yZHMuTGF6eSwgdG9rZW5zLmhlYWQoKSkgP1xuXHRcdFx0W3Rva2Vucy50YWlsKCksIExvY2FsRGVjbGFyZXMuTGF6eSwgZmFsc2VdIDpcblx0XHRcdG9yTWVtYmVyICYmIGlzS2V5d29yZChLZXl3b3Jkcy5Eb3QsIHRva2Vucy5oZWFkKCkpID9cblx0XHRcdFt0b2tlbnMudGFpbCgpLCBMb2NhbERlY2xhcmVzLkVhZ2VyLCB0cnVlXSA6XG5cdFx0XHRbdG9rZW5zLCBMb2NhbERlY2xhcmVzLkVhZ2VyLCBmYWxzZV1cblx0Y29uc3QgbmFtZSA9IHBhcnNlTG9jYWxOYW1lKHJlc3QuaGVhZCgpKVxuXHRjb25zdCByZXN0MiA9IHJlc3QudGFpbCgpXG5cdGNvbnN0IG9wVHlwZSA9IG9wSWYoIXJlc3QyLmlzRW1wdHkoKSwgKCkgPT4ge1xuXHRcdGNvbnN0IGNvbG9uID0gcmVzdDIuaGVhZCgpXG5cdFx0Y2hlY2tLZXl3b3JkKEtleXdvcmRzLkNvbG9uLCBjb2xvbilcblx0XHRjb25zdCB0b2tlbnNUeXBlID0gcmVzdDIudGFpbCgpXG5cdFx0Y2hlY2tOb25FbXB0eSh0b2tlbnNUeXBlLCAoKSA9PiBgRXhwZWN0ZWQgc29tZXRoaW5nIGFmdGVyICR7Y29sb259YClcblx0XHRyZXR1cm4gcGFyc2VTcGFjZWQodG9rZW5zVHlwZSlcblx0fSlcblx0Y29uc3QgZGVjbGFyZSA9IG5ldyBMb2NhbERlY2xhcmUodG9rZW5zLmxvYywgbmFtZSwgb3BUeXBlLCBraW5kKVxuXHRyZXR1cm4gb3JNZW1iZXIgPyB7ZGVjbGFyZSwgaXNNZW1iZXJ9IDogZGVjbGFyZVxufVxuIl19
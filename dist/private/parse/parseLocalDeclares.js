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
	exports.parseLocalParts = parseLocalParts;

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
		var _parseLocalParts = parseLocalParts(token);

		const name = _parseLocalParts.name;
		const opType = _parseLocalParts.opType;
		const kind = _parseLocalParts.kind;
		return new _MsAst.LocalDeclare(token.loc, name, opType, kind);
	}

	function parseLocalDeclareFromSpaced(tokens) {
		var _parseLocalPartsFromS = parseLocalPartsFromSpaced(tokens);

		const name = _parseLocalPartsFromS.name;
		const opType = _parseLocalPartsFromS.opType;
		const kind = _parseLocalPartsFromS.kind;
		return new _MsAst.LocalDeclare(tokens.loc, name, opType, kind);
	}

	function parseLocalDeclaresAndMemberArgs(tokens) {
		const declares = [],
		      memberArgs = [];

		for (const token of tokens) {
			var _parseLocalParts2 = parseLocalParts(token, true);

			const name = _parseLocalParts2.name;
			const opType = _parseLocalParts2.opType;
			const kind = _parseLocalParts2.kind;
			const isMember = _parseLocalParts2.isMember;
			const declare = new _MsAst.LocalDeclare(token.loc, name, opType, kind);
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
			(0, _context.check)(token instanceof _Token.Name, token.loc, 'expectedLocalName', token);
			return token.name;
		}
	}

	function parseLocalDeclareOrFocus(tokens) {
		if (tokens.isEmpty()) return _MsAst.LocalDeclare.focus(tokens.loc);else {
			(0, _context.check)(tokens.size() === 1, tokens.loc, 'expectedOneLocal');
			const token = tokens.head();

			if ((0, _Token.isGroup)(_Token.Groups.Space, token)) {
				const slice = _Slice2.default.group(token);

				if ((0, _Token.isKeyword)(_Token.Keywords.Colon, slice.head())) return _MsAst.LocalDeclare.typedFocus(tokens.loc, (0, _parse.parseSpaced)(slice.tail()));
			}

			return parseLocalDeclare(token);
		}
	}

	function parseLocalParts(token) {
		let orMember = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
		return (0, _Token.isGroup)(_Token.Groups.Space, token) ? parseLocalPartsFromSpaced(_Slice2.default.group(token), orMember) : {
			name: parseLocalName(token),
			opType: null,
			kind: _MsAst.LocalDeclares.Eager,
			isMember: false
		};
	}

	function parseLocalPartsFromSpaced(tokens) {
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
			(0, _checks.checkNonEmpty)(tokensType, 'expectedAfterColon');
			return (0, _parse.parseSpaced)(tokensType);
		});
		return {
			name,
			opType,
			kind,
			isMember
		};
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTG9jYWxEZWNsYXJlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBWXdCLGtCQUFrQjtTQVExQiwyQkFBMkIsR0FBM0IsMkJBQTJCO1NBSzNCLGlCQUFpQixHQUFqQixpQkFBaUI7U0FNakIsMkJBQTJCLEdBQTNCLDJCQUEyQjtTQVUzQiwrQkFBK0IsR0FBL0IsK0JBQStCO1NBaUIvQixjQUFjLEdBQWQsY0FBYztTQWVkLHdCQUF3QixHQUF4Qix3QkFBd0I7U0FtQnhCLGVBQWUsR0FBZixlQUFlOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFoRlAsa0JBQWtCOzs7O1VBUTFCLDJCQUEyQjs7OztVQUszQixpQkFBaUI7Ozs7Ozs7OztVQU1qQiwyQkFBMkI7Ozs7Ozs7OztVQVUzQiwrQkFBK0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFpQi9CLGNBQWM7Ozs7Ozs7VUFlZCx3QkFBd0I7Ozs7Ozs7Ozs7Ozs7OztVQW1CeEIsZUFBZTtNQUFRLFFBQVEseURBQUcsS0FBSzs7Ozs7Ozs7OztNQU1aLFFBQVEseURBQUcsS0FBSyIsImZpbGUiOiJwYXJzZUxvY2FsRGVjbGFyZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtMb2NhbERlY2xhcmUsIExvY2FsRGVjbGFyZXN9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtHcm91cHMsIGlzR3JvdXAsIGlzS2V5d29yZCwgS2V5d29yZHMsIE5hbWV9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtvcElmfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtjaGVja05vbkVtcHR5LCBjaGVja0tleXdvcmR9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtwYXJzZVNwYWNlZH0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLyoqXG5QYXJzZSBsb2NhbHMgKGBhYCBvciBgYTpiYCkuXG5AcmV0dXJuIHtBcnJheTxMb2NhbERlY2xhcmU+fVxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlTG9jYWxEZWNsYXJlcyh0b2tlbnMpIHtcblx0cmV0dXJuIHRva2Vucy5tYXAocGFyc2VMb2NhbERlY2xhcmUpXG59XG5cbi8qKlxuUGFyc2UgbG9jYWxzIHdpdGggbm8gdHlwZXMgYWxsb3dlZC5cbkByZXR1cm4ge0FycmF5PExvY2FsRGVjbGFyZT59XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcyh0b2tlbnMpIHtcblx0cmV0dXJuIHRva2Vucy5tYXAoXyA9PiBMb2NhbERlY2xhcmUucGxhaW4oXy5sb2MsIHBhcnNlTG9jYWxOYW1lKF8pKSlcbn1cblxuLyoqIFBhcnNlIGEgc2luZ2xlIGxvY2FsIGRlY2xhcmUuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VMb2NhbERlY2xhcmUodG9rZW4pIHtcblx0Y29uc3Qge25hbWUsIG9wVHlwZSwga2luZH0gPSBwYXJzZUxvY2FsUGFydHModG9rZW4pXG5cdHJldHVybiBuZXcgTG9jYWxEZWNsYXJlKHRva2VuLmxvYywgbmFtZSwgb3BUeXBlLCBraW5kKVxufVxuXG4vKiogUGFyc2UgYSBzaW5nbGUgbG9jYWwgZGVjbGFyZSBmcm9tIHRoZSB0b2tlbnMgaW4gYSB7QGxpbmsgR3JvdXBzLlNwYWNlfS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxvY2FsRGVjbGFyZUZyb21TcGFjZWQodG9rZW5zKSB7XG5cdGNvbnN0IHtuYW1lLCBvcFR5cGUsIGtpbmR9ID0gcGFyc2VMb2NhbFBhcnRzRnJvbVNwYWNlZCh0b2tlbnMpXG5cdHJldHVybiBuZXcgTG9jYWxEZWNsYXJlKHRva2Vucy5sb2MsIG5hbWUsIG9wVHlwZSwga2luZClcbn1cblxuLyoqXG5Gb3IgY29uc3RydWN0b3IuIFBhcnNlIGxvY2FsIGRlY2xhcmVzIHdoaWxlIGFsbG93aW5nIGAueGAtc3R5bGUgYXJndW1lbnRzLlxuQHJldHVybiB7e2RlY2xhcmVzOiBBcnJheTxMb2NhbERlY2xhcmU+LCBtZW1iZXJBcmdzOiBBcnJheTxMb2NhbERlY2xhcmU+fX1cblx0YG1lbWJlckFyZ3NgIGlzICBhIHN1YnNldCBvZiBgZGVjbGFyZXNgLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzKHRva2Vucykge1xuXHRjb25zdCBkZWNsYXJlcyA9IFtdLCBtZW1iZXJBcmdzID0gW11cblx0Zm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcblx0XHRjb25zdCB7bmFtZSwgb3BUeXBlLCBraW5kLCBpc01lbWJlcn0gPSBwYXJzZUxvY2FsUGFydHModG9rZW4sIHRydWUpXG5cdFx0Y29uc3QgZGVjbGFyZSA9IG5ldyBMb2NhbERlY2xhcmUodG9rZW4ubG9jLCBuYW1lLCBvcFR5cGUsIGtpbmQpXG5cdFx0ZGVjbGFyZXMucHVzaChkZWNsYXJlKVxuXHRcdGlmIChpc01lbWJlcilcblx0XHRcdG1lbWJlckFyZ3MucHVzaChkZWNsYXJlKVxuXHR9XG5cdHJldHVybiB7ZGVjbGFyZXMsIG1lbWJlckFyZ3N9XG59XG5cbi8qKlxuUGFyc2UgYSBuYW1lIGZvciBhIGxvY2FsIHZhcmlhYmxlLlxuVW5saWtlIHtAbGluayBwYXJzZU5hbWV9LCBgX2AgaXMgdGhlIG9ubHkgYWxsb3dlZCBLZXl3b3JkLlxuQHJldHVybiB7c3RyaW5nfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxvY2FsTmFtZSh0b2tlbikge1xuXHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkZvY3VzLCB0b2tlbikpXG5cdFx0cmV0dXJuICdfJ1xuXHRlbHNlIHtcblx0XHRjaGVjayh0b2tlbiBpbnN0YW5jZW9mIE5hbWUsIHRva2VuLmxvYywgJ2V4cGVjdGVkTG9jYWxOYW1lJywgdG9rZW4pXG5cdFx0cmV0dXJuIHRva2VuLm5hbWVcblx0fVxufVxuXG4vKipcbklmIGB0b2tlbnNgIGlzOlxuXHRlbXB0eTogdW50eXBlZCBmb2N1c1xuXHRgOlR5cGVgOiB0eXBlZCBmb2N1c1xuXHRgZm9vYCBvciBgZm9vOlR5cGVgOiBBIG5vcm1hbCBMb2NhbERlY2xhcmUuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTG9jYWxEZWNsYXJlT3JGb2N1cyh0b2tlbnMpIHtcblx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIExvY2FsRGVjbGFyZS5mb2N1cyh0b2tlbnMubG9jKVxuXHRlbHNlIHtcblx0XHRjaGVjayh0b2tlbnMuc2l6ZSgpID09PSAxLCB0b2tlbnMubG9jLCAnZXhwZWN0ZWRPbmVMb2NhbCcpXG5cdFx0Y29uc3QgdG9rZW4gPSB0b2tlbnMuaGVhZCgpXG5cdFx0aWYgKGlzR3JvdXAoR3JvdXBzLlNwYWNlLCB0b2tlbikpIHtcblx0XHRcdGNvbnN0IHNsaWNlID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkNvbG9uLCBzbGljZS5oZWFkKCkpKVxuXHRcdFx0XHRyZXR1cm4gTG9jYWxEZWNsYXJlLnR5cGVkRm9jdXModG9rZW5zLmxvYywgcGFyc2VTcGFjZWQoc2xpY2UudGFpbCgpKSlcblx0XHR9XG5cdFx0cmV0dXJuIHBhcnNlTG9jYWxEZWNsYXJlKHRva2VuKVxuXHR9XG59XG5cbi8qKlxuQHBhcmFtIHtib29sZWFufSBvck1lbWJlciBJZiB0cnVlLCBwYXJzZSBsb2NhbHMgbGlrZSBgLnhgIGFuZCByZXR1cm4gYGlzTWVtYmVyYCB3aXRoIHJlc3VsdC5cbkByZXR1cm4ge3tuYW1lLCBvcFR5cGUsIGtpbmQsIGlzTWVtYmVyfX1cbiovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VMb2NhbFBhcnRzKHRva2VuLCBvck1lbWJlciA9IGZhbHNlKSB7XG5cdHJldHVybiBpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgdG9rZW4pID9cblx0XHRwYXJzZUxvY2FsUGFydHNGcm9tU3BhY2VkKFNsaWNlLmdyb3VwKHRva2VuKSwgb3JNZW1iZXIpIDpcblx0XHR7bmFtZTogcGFyc2VMb2NhbE5hbWUodG9rZW4pLCBvcFR5cGU6IG51bGwsIGtpbmQ6IExvY2FsRGVjbGFyZXMuRWFnZXIsIGlzTWVtYmVyOiBmYWxzZX1cbn1cblxuZnVuY3Rpb24gcGFyc2VMb2NhbFBhcnRzRnJvbVNwYWNlZCh0b2tlbnMsIG9yTWVtYmVyID0gZmFsc2UpIHtcblx0Y29uc3QgW3Jlc3QsIGtpbmQsIGlzTWVtYmVyXSA9XG5cdFx0aXNLZXl3b3JkKEtleXdvcmRzLkxhenksIHRva2Vucy5oZWFkKCkpID9cblx0XHRcdFt0b2tlbnMudGFpbCgpLCBMb2NhbERlY2xhcmVzLkxhenksIGZhbHNlXSA6XG5cdFx0XHRvck1lbWJlciAmJiBpc0tleXdvcmQoS2V5d29yZHMuRG90LCB0b2tlbnMuaGVhZCgpKSA/XG5cdFx0XHRbdG9rZW5zLnRhaWwoKSwgTG9jYWxEZWNsYXJlcy5FYWdlciwgdHJ1ZV0gOlxuXHRcdFx0W3Rva2VucywgTG9jYWxEZWNsYXJlcy5FYWdlciwgZmFsc2VdXG5cdGNvbnN0IG5hbWUgPSBwYXJzZUxvY2FsTmFtZShyZXN0LmhlYWQoKSlcblx0Y29uc3QgcmVzdDIgPSByZXN0LnRhaWwoKVxuXHRjb25zdCBvcFR5cGUgPSBvcElmKCFyZXN0Mi5pc0VtcHR5KCksICgpID0+IHtcblx0XHRjb25zdCBjb2xvbiA9IHJlc3QyLmhlYWQoKVxuXHRcdGNoZWNrS2V5d29yZChLZXl3b3Jkcy5Db2xvbiwgY29sb24pXG5cdFx0Y29uc3QgdG9rZW5zVHlwZSA9IHJlc3QyLnRhaWwoKVxuXHRcdGNoZWNrTm9uRW1wdHkodG9rZW5zVHlwZSwgJ2V4cGVjdGVkQWZ0ZXJDb2xvbicpXG5cdFx0cmV0dXJuIHBhcnNlU3BhY2VkKHRva2Vuc1R5cGUpXG5cdH0pXG5cdHJldHVybiB7bmFtZSwgb3BUeXBlLCBraW5kLCBpc01lbWJlcn1cbn1cbiJdfQ==
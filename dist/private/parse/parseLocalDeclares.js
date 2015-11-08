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

	var _Slice2 = _interopRequireDefault(_Slice);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

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

		var _ref = (0, _Token.isKeyword)(_Token.Keywords.Lazy, tokens.head()) ? [tokens.tail(), _MsAst.LocalDeclares.Lazy, false] : orMember && (0, _Token.isKeyword)(_Token.Keywords.Dot, tokens.head()) ? [tokens.tail(), _MsAst.LocalDeclares.Const, true] : [tokens, _MsAst.LocalDeclares.Const, false];

		var _ref2 = _slicedToArray(_ref, 3);

		const rest = _ref2[0];
		const kind = _ref2[1];
		const isMember = _ref2[2];
		const name = parseLocalName(rest.head());
		const rest2 = rest.tail();
		const opType = (0, _util.opIf)(!rest2.isEmpty(), () => {
			const colon = rest2.head();
			(0, _context.check)((0, _Token.isKeyword)(_Token.Keywords.Type, colon), colon.loc, () => `Expected ${ (0, _Token.showKeyword)(_Token.Keywords.Type) }`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTG9jYWxEZWNsYXJlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBWXdCLGtCQUFrQjtTQVExQiwyQkFBMkIsR0FBM0IsMkJBQTJCO1NBSzNCLGlCQUFpQixHQUFqQixpQkFBaUI7U0FLakIsMkJBQTJCLEdBQTNCLDJCQUEyQjtTQVMzQiwrQkFBK0IsR0FBL0IsK0JBQStCO1NBZ0IvQixjQUFjLEdBQWQsY0FBYzs7Ozs7Ozs7VUEzQ04sa0JBQWtCOzs7O1VBUTFCLDJCQUEyQjs7OztVQUszQixpQkFBaUI7Ozs7VUFLakIsMkJBQTJCOzs7O1VBUzNCLCtCQUErQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQWdCL0IsY0FBYzs7Ozs7Ozs7TUFVSyxRQUFRLHlEQUFDLEtBQUs7Ozs7Ozs7Ozs7OztNQVNILFFBQVEseURBQUMsS0FBSyIsImZpbGUiOiJwYXJzZUxvY2FsRGVjbGFyZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtMb2NhbERlY2xhcmUsIExvY2FsRGVjbGFyZXN9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtHcm91cHMsIGlzR3JvdXAsIGlzS2V5d29yZCwgS2V5d29yZHMsIE5hbWUsIHNob3dLZXl3b3JkfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7b3BJZn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tOb25FbXB0eX0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge3BhcnNlU3BhY2VkfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKipcblBhcnNlIGxvY2FscyAoYGFgIG9yIGBhOmJgKS5cbkByZXR1cm4ge0FycmF5PExvY2FsRGVjbGFyZT59XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VMb2NhbERlY2xhcmVzKHRva2Vucykge1xuXHRyZXR1cm4gdG9rZW5zLm1hcChwYXJzZUxvY2FsRGVjbGFyZSlcbn1cblxuLyoqXG5QYXJzZSBsb2NhbHMgd2l0aCBubyB0eXBlcyBhbGxvd2VkLlxuQHJldHVybiB7QXJyYXk8TG9jYWxEZWNsYXJlPn1cbiovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKHRva2Vucykge1xuXHRyZXR1cm4gdG9rZW5zLm1hcChfID0+IExvY2FsRGVjbGFyZS5wbGFpbihfLmxvYywgcGFyc2VMb2NhbE5hbWUoXykpKVxufVxuXG4vKiogUGFyc2UgYSBzaW5nbGUgbG9jYWwgZGVjbGFyZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxvY2FsRGVjbGFyZSh0b2tlbikge1xuXHRyZXR1cm4gX3BhcnNlTG9jYWxEZWNsYXJlKHRva2VuKVxufVxuXG4vKiogUGFyc2UgYSBzaW5nbGUgbG9jYWwgZGVjbGFyZSBmcm9tIHRoZSB0b2tlbnMgaW4gYSB7QGxpbmsgR3JvdXBzLlNwYWNlfS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxvY2FsRGVjbGFyZUZyb21TcGFjZWQodG9rZW5zKSB7XG5cdHJldHVybiBfcGFyc2VMb2NhbERlY2xhcmVGcm9tU3BhY2VkKHRva2Vucylcbn1cblxuLyoqXG5Gb3IgY29uc3RydWN0b3IuIFBhcnNlIGxvY2FsIGRlY2xhcmVzIHdoaWxlIGFsbG93aW5nIGAueGAtc3R5bGUgYXJndW1lbnRzLlxuQHJldHVybiB7e2RlY2xhcmVzOiBBcnJheTxMb2NhbERlY2xhcmU+LCBtZW1iZXJBcmdzOiBBcnJheTxMb2NhbERlY2xhcmU+fX1cblx0YG1lbWJlckFyZ3NgIGlzICBhIHN1YnNldCBvZiBgZGVjbGFyZXNgLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzKHRva2Vucykge1xuXHRjb25zdCBkZWNsYXJlcyA9IFtdLCBtZW1iZXJBcmdzID0gW11cblx0Zm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcblx0XHRjb25zdCB7ZGVjbGFyZSwgaXNNZW1iZXJ9ID0gX3BhcnNlTG9jYWxEZWNsYXJlKHRva2VuLCB0cnVlKVxuXHRcdGRlY2xhcmVzLnB1c2goZGVjbGFyZSlcblx0XHRpZiAoaXNNZW1iZXIpXG5cdFx0XHRtZW1iZXJBcmdzLnB1c2goZGVjbGFyZSlcblx0fVxuXHRyZXR1cm4ge2RlY2xhcmVzLCBtZW1iZXJBcmdzfVxufVxuXG4vKipcblBhcnNlIGEgbmFtZSBmb3IgYSBsb2NhbCB2YXJpYWJsZS5cblVubGlrZSB7QGxpbmsgcGFyc2VOYW1lfSwgYF9gIGlzIHRoZSBvbmx5IGFsbG93ZWQgS2V5d29yZC5cbkByZXR1cm4ge3N0cmluZ31cbiovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VMb2NhbE5hbWUodG9rZW4pIHtcblx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5Gb2N1cywgdG9rZW4pKVxuXHRcdHJldHVybiAnXydcblx0ZWxzZSB7XG5cdFx0Y2hlY2sodG9rZW4gaW5zdGFuY2VvZiBOYW1lLCB0b2tlbi5sb2MsICgpID0+IGBFeHBlY3RlZCBhIGxvY2FsIG5hbWUsIG5vdCAke3Rva2VufS5gKVxuXHRcdHJldHVybiB0b2tlbi5uYW1lXG5cdH1cbn1cblxuXG5mdW5jdGlvbiBfcGFyc2VMb2NhbERlY2xhcmUodG9rZW4sIG9yTWVtYmVyPWZhbHNlKSB7XG5cdGlmIChpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgdG9rZW4pKVxuXHRcdHJldHVybiBfcGFyc2VMb2NhbERlY2xhcmVGcm9tU3BhY2VkKFNsaWNlLmdyb3VwKHRva2VuKSwgb3JNZW1iZXIpXG5cdGVsc2Uge1xuXHRcdGNvbnN0IGRlY2xhcmUgPSBMb2NhbERlY2xhcmUucGxhaW4odG9rZW4ubG9jLCBwYXJzZUxvY2FsTmFtZSh0b2tlbikpXG5cdFx0cmV0dXJuIG9yTWVtYmVyID8ge2RlY2xhcmUsIGlzTWVtYmVyOiBmYWxzZX0gOiBkZWNsYXJlXG5cdH1cbn1cblxuZnVuY3Rpb24gX3BhcnNlTG9jYWxEZWNsYXJlRnJvbVNwYWNlZCh0b2tlbnMsIG9yTWVtYmVyPWZhbHNlKSB7XG5cdGNvbnN0IFtyZXN0LCBraW5kLCBpc01lbWJlcl0gPVxuXHRcdGlzS2V5d29yZChLZXl3b3Jkcy5MYXp5LCB0b2tlbnMuaGVhZCgpKSA/XG5cdFx0XHRbdG9rZW5zLnRhaWwoKSwgTG9jYWxEZWNsYXJlcy5MYXp5LCBmYWxzZV0gOlxuXHRcdFx0b3JNZW1iZXIgJiYgaXNLZXl3b3JkKEtleXdvcmRzLkRvdCwgdG9rZW5zLmhlYWQoKSkgP1xuXHRcdFx0W3Rva2Vucy50YWlsKCksIExvY2FsRGVjbGFyZXMuQ29uc3QsIHRydWVdIDpcblx0XHRcdFt0b2tlbnMsIExvY2FsRGVjbGFyZXMuQ29uc3QsIGZhbHNlXVxuXHRjb25zdCBuYW1lID0gcGFyc2VMb2NhbE5hbWUocmVzdC5oZWFkKCkpXG5cdGNvbnN0IHJlc3QyID0gcmVzdC50YWlsKClcblx0Y29uc3Qgb3BUeXBlID0gb3BJZighcmVzdDIuaXNFbXB0eSgpLCAoKSA9PiB7XG5cdFx0Y29uc3QgY29sb24gPSByZXN0Mi5oZWFkKClcblx0XHRjaGVjayhpc0tleXdvcmQoS2V5d29yZHMuVHlwZSwgY29sb24pLCBjb2xvbi5sb2MsICgpID0+XG5cdFx0XHRgRXhwZWN0ZWQgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5UeXBlKX1gKVxuXHRcdGNvbnN0IHRva2Vuc1R5cGUgPSByZXN0Mi50YWlsKClcblx0XHRjaGVja05vbkVtcHR5KHRva2Vuc1R5cGUsICgpID0+IGBFeHBlY3RlZCBzb21ldGhpbmcgYWZ0ZXIgJHtjb2xvbn1gKVxuXHRcdHJldHVybiBwYXJzZVNwYWNlZCh0b2tlbnNUeXBlKVxuXHR9KVxuXHRjb25zdCBkZWNsYXJlID0gbmV3IExvY2FsRGVjbGFyZSh0b2tlbnMubG9jLCBuYW1lLCBvcFR5cGUsIGtpbmQpXG5cdHJldHVybiBvck1lbWJlciA/IHtkZWNsYXJlLCBpc01lbWJlcn0gOiBkZWNsYXJlXG59XG4iXX0=
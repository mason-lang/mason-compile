(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', '../../CompileError', '../context', '../MsAst', '../Token', '../util', './checks', './parse*', './Slice'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports, require('../../CompileError'), require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parse*'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.MsAst, global.Token, global.util, global.checks, global.parse, global.Slice);
		global.parseLocalDeclares = mod.exports;
	}
})(this, function (exports, _CompileError, _context, _MsAst, _Token, _util, _checks, _parse, _Slice) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	exports.default = parseLocalDeclares;
	exports.parseLocalDeclaresJustNames = parseLocalDeclaresJustNames;
	exports.parseLocalDeclare = parseLocalDeclare;
	exports.parseLocalDeclareFromSpaced = parseLocalDeclareFromSpaced;
	exports.parseLocalDeclaresAndMemberArgs = parseLocalDeclaresAndMemberArgs;
	exports.parseLocalName = parseLocalName;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _Slice2 = _interopRequireDefault(_Slice);

	/**
 Parse locals (`a` or `a:b`).
 @return {Array<LocalDeclare>}
 */

	function parseLocalDeclares(tokens) {
		return tokens.map(parseLocalDeclare);
	}

	/**
 Parse locals with no types allowed.
 @return {Array<LocalDeclare>}
 */

	function parseLocalDeclaresJustNames(tokens) {
		return tokens.map(_ => _MsAst.LocalDeclare.plain(_.loc, parseLocalName(_)));
	}

	/** Parse a single local declare. */

	function parseLocalDeclare(token) {
		return _parseLocalDeclare(token);
	}

	/** Parse a single local declare from the tokens in a {@link Groups.Space}. */

	function parseLocalDeclareFromSpaced(tokens) {
		return _parseLocalDeclareFromSpaced(tokens);
	}

	/**
 For constructor. Parse local declares while allowing `.x`-style arguments.
 @return {{declares: Array<LocalDeclare>, memberArgs: Array<LocalDeclare>}}
 	`memberArgs` is  a subset of `declares`.
 */

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
		return { declares, memberArgs };
	}

	/**
 Parse a name for a local variable.
 Unlike {@link parseName}, `_` is the only allowed Keyword.
 @return {string}
 */

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
			return orMember ? { declare, isMember: false } : declare;
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
			(0, _context.check)((0, _Token.isKeyword)(_Token.Keywords.Type, colon), colon.loc, () => `Expected ${ (0, _CompileError.code)(':') }`);
			const tokensType = rest2.tail();
			(0, _checks.checkNonEmpty)(tokensType, () => `Expected something after ${ colon }`);
			return (0, _parse.parseSpaced)(tokensType);
		});
		const declare = new _MsAst.LocalDeclare(tokens.loc, name, opType, kind);
		return orMember ? { declare, isMember } : declare;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTG9jYWxEZWNsYXJlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBYXdCLGtCQUFrQjs7Ozs7Ozs7Ozs7Ozs7OztBQUEzQixVQUFTLGtCQUFrQixDQUFDLE1BQU0sRUFBRTtBQUNsRCxTQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtFQUNwQzs7Ozs7OztBQU1NLFVBQVMsMkJBQTJCLENBQUMsTUFBTSxFQUFFO0FBQ25ELFNBQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksT0FwQmhCLFlBQVksQ0FvQmlCLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7RUFDcEU7Ozs7QUFHTSxVQUFTLGlCQUFpQixDQUFDLEtBQUssRUFBRTtBQUN4QyxTQUFPLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFBO0VBQ2hDOzs7O0FBR00sVUFBUywyQkFBMkIsQ0FBQyxNQUFNLEVBQUU7QUFDbkQsU0FBTyw0QkFBNEIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtFQUMzQzs7Ozs7Ozs7QUFPTSxVQUFTLCtCQUErQixDQUFDLE1BQU0sRUFBRTtBQUN2RCxRQUFNLFFBQVEsR0FBRyxFQUFFO1FBQUUsVUFBVSxHQUFHLEVBQUUsQ0FBQTtBQUNwQyxPQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTs2QkFDQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDOztTQUFwRCxPQUFPLHVCQUFQLE9BQU87U0FBRSxRQUFRLHVCQUFSLFFBQVE7O0FBQ3hCLFdBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDdEIsT0FBSSxRQUFRLEVBQ1gsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtHQUN6QjtBQUNELFNBQU8sRUFBQyxRQUFRLEVBQUUs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LElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDaEUsU0FBTyxRQUFRLEdBQUcsRUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFDLEdBQUcsT0FBTyxDQUFBO0VBQy9DIiwiZmlsZSI6InBhcnNlTG9jYWxEZWNsYXJlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVja30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7TG9jYWxEZWNsYXJlLCBMb2NhbERlY2xhcmVzfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXBzLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtleXdvcmRzLCBOYW1lfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7b3BJZn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tOb25FbXB0eX0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge3BhcnNlU3BhY2VkfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKipcblBhcnNlIGxvY2FscyAoYGFgIG9yIGBhOmJgKS5cbkByZXR1cm4ge0FycmF5PExvY2FsRGVjbGFyZT59XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VMb2NhbERlY2xhcmVzKHRva2Vucykge1xuXHRyZXR1cm4gdG9rZW5zLm1hcChwYXJzZUxvY2FsRGVjbGFyZSlcbn1cblxuLyoqXG5QYXJzZSBsb2NhbHMgd2l0aCBubyB0eXBlcyBhbGxvd2VkLlxuQHJldHVybiB7QXJyYXk8TG9jYWxEZWNsYXJlPn1cbiovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKHRva2Vucykge1xuXHRyZXR1cm4gdG9rZW5zLm1hcChfID0+IExvY2FsRGVjbGFyZS5wbGFpbihfLmxvYywgcGFyc2VMb2NhbE5hbWUoXykpKVxufVxuXG4vKiogUGFyc2UgYSBzaW5nbGUgbG9jYWwgZGVjbGFyZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxvY2FsRGVjbGFyZSh0b2tlbikge1xuXHRyZXR1cm4gX3BhcnNlTG9jYWxEZWNsYXJlKHRva2VuKVxufVxuXG4vKiogUGFyc2UgYSBzaW5nbGUgbG9jYWwgZGVjbGFyZSBmcm9tIHRoZSB0b2tlbnMgaW4gYSB7QGxpbmsgR3JvdXBzLlNwYWNlfS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxvY2FsRGVjbGFyZUZyb21TcGFjZWQodG9rZW5zKSB7XG5cdHJldHVybiBfcGFyc2VMb2NhbERlY2xhcmVGcm9tU3BhY2VkKHRva2Vucylcbn1cblxuLyoqXG5Gb3IgY29uc3RydWN0b3IuIFBhcnNlIGxvY2FsIGRlY2xhcmVzIHdoaWxlIGFsbG93aW5nIGAueGAtc3R5bGUgYXJndW1lbnRzLlxuQHJldHVybiB7e2RlY2xhcmVzOiBBcnJheTxMb2NhbERlY2xhcmU+LCBtZW1iZXJBcmdzOiBBcnJheTxMb2NhbERlY2xhcmU+fX1cblx0YG1lbWJlckFyZ3NgIGlzICBhIHN1YnNldCBvZiBgZGVjbGFyZXNgLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzKHRva2Vucykge1xuXHRjb25zdCBkZWNsYXJlcyA9IFtdLCBtZW1iZXJBcmdzID0gW11cblx0Zm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcblx0XHRjb25zdCB7ZGVjbGFyZSwgaXNNZW1iZXJ9ID0gX3BhcnNlTG9jYWxEZWNsYXJlKHRva2VuLCB0cnVlKVxuXHRcdGRlY2xhcmVzLnB1c2goZGVjbGFyZSlcblx0XHRpZiAoaXNNZW1iZXIpXG5cdFx0XHRtZW1iZXJBcmdzLnB1c2goZGVjbGFyZSlcblx0fVxuXHRyZXR1cm4ge2RlY2xhcmVzLCBtZW1iZXJBcmdzfVxufVxuXG4vKipcblBhcnNlIGEgbmFtZSBmb3IgYSBsb2NhbCB2YXJpYWJsZS5cblVubGlrZSB7QGxpbmsgcGFyc2VOYW1lfSwgYF9gIGlzIHRoZSBvbmx5IGFsbG93ZWQgS2V5d29yZC5cbkByZXR1cm4ge3N0cmluZ31cbiovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VMb2NhbE5hbWUodG9rZW4pIHtcblx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5Gb2N1cywgdG9rZW4pKVxuXHRcdHJldHVybiAnXydcblx0ZWxzZSB7XG5cdFx0Y2hlY2sodG9rZW4gaW5zdGFuY2VvZiBOYW1lLCB0b2tlbi5sb2MsICgpID0+IGBFeHBlY3RlZCBhIGxvY2FsIG5hbWUsIG5vdCAke3Rva2VufS5gKVxuXHRcdHJldHVybiB0b2tlbi5uYW1lXG5cdH1cbn1cblxuXG5mdW5jdGlvbiBfcGFyc2VMb2NhbERlY2xhcmUodG9rZW4sIG9yTWVtYmVyPWZhbHNlKSB7XG5cdGlmIChpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgdG9rZW4pKVxuXHRcdHJldHVybiBfcGFyc2VMb2NhbERlY2xhcmVGcm9tU3BhY2VkKFNsaWNlLmdyb3VwKHRva2VuKSwgb3JNZW1iZXIpXG5cdGVsc2Uge1xuXHRcdGNvbnN0IGRlY2xhcmUgPSBMb2NhbERlY2xhcmUucGxhaW4odG9rZW4ubG9jLCBwYXJzZUxvY2FsTmFtZSh0b2tlbikpXG5cdFx0cmV0dXJuIG9yTWVtYmVyID8ge2RlY2xhcmUsIGlzTWVtYmVyOiBmYWxzZX0gOiBkZWNsYXJlXG5cdH1cbn1cblxuZnVuY3Rpb24gX3BhcnNlTG9jYWxEZWNsYXJlRnJvbVNwYWNlZCh0b2tlbnMsIG9yTWVtYmVyPWZhbHNlKSB7XG5cdGNvbnN0IFtyZXN0LCBraW5kLCBpc01lbWJlcl0gPVxuXHRcdGlzS2V5d29yZChLZXl3b3Jkcy5MYXp5LCB0b2tlbnMuaGVhZCgpKSA/XG5cdFx0XHRbdG9rZW5zLnRhaWwoKSwgTG9jYWxEZWNsYXJlcy5MYXp5LCBmYWxzZV0gOlxuXHRcdFx0b3JNZW1iZXIgJiYgaXNLZXl3b3JkKEtleXdvcmRzLkRvdCwgdG9rZW5zLmhlYWQoKSkgP1xuXHRcdFx0W3Rva2Vucy50YWlsKCksIExvY2FsRGVjbGFyZXMuQ29uc3QsIHRydWVdIDpcblx0XHRcdFt0b2tlbnMsIExvY2FsRGVjbGFyZXMuQ29uc3QsIGZhbHNlXVxuXHRjb25zdCBuYW1lID0gcGFyc2VMb2NhbE5hbWUocmVzdC5oZWFkKCkpXG5cdGNvbnN0IHJlc3QyID0gcmVzdC50YWlsKClcblx0Y29uc3Qgb3BUeXBlID0gb3BJZighcmVzdDIuaXNFbXB0eSgpLCAoKSA9PiB7XG5cdFx0Y29uc3QgY29sb24gPSByZXN0Mi5oZWFkKClcblx0XHRjaGVjayhpc0tleXdvcmQoS2V5d29yZHMuVHlwZSwgY29sb24pLCBjb2xvbi5sb2MsICgpID0+IGBFeHBlY3RlZCAke2NvZGUoJzonKX1gKVxuXHRcdGNvbnN0IHRva2Vuc1R5cGUgPSByZXN0Mi50YWlsKClcblx0XHRjaGVja05vbkVtcHR5KHRva2Vuc1R5cGUsICgpID0+IGBFeHBlY3RlZCBzb21ldGhpbmcgYWZ0ZXIgJHtjb2xvbn1gKVxuXHRcdHJldHVybiBwYXJzZVNwYWNlZCh0b2tlbnNUeXBlKVxuXHR9KVxuXHRjb25zdCBkZWNsYXJlID0gbmV3IExvY2FsRGVjbGFyZSh0b2tlbnMubG9jLCBuYW1lLCBvcFR5cGUsIGtpbmQpXG5cdHJldHVybiBvck1lbWJlciA/IHtkZWNsYXJlLCBpc01lbWJlcn0gOiBkZWNsYXJlXG59XG4iXX0=
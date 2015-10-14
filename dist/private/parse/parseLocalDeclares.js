if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', '../../CompileError', '../context', '../MsAst', '../Token', '../util', './checks', './parse*', './Slice'], function (exports, _CompileError, _context, _MsAst, _Token, _util, _checks, _parse, _Slice) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _Slice2 = _interopRequireDefault(_Slice);

	exports.default = (tokens, includeMemberArgs) => includeMemberArgs ? parseLocalDeclaresAndMemberArgs(tokens) : tokens.map(parseLocalDeclare);

	const parseLocalDeclaresJustNames = tokens => tokens.map(_ => _MsAst.LocalDeclare.plain(_.loc, parseLocalName(_))),
	     

	// _orMember: if true, will look for `.x` arguments and return {declare, isMember}.
	// TODO:ES6 _orMember=false
	parseLocalDeclare = (token, _orMember) => {
		if ((0, _Token.isGroup)(_Token.G_Space, token)) return parseLocalDeclareFromSpaced(_Slice2.default.group(token), _orMember);else {
			const declare = _MsAst.LocalDeclare.plain(token.loc, parseLocalName(token));
			return _orMember ? { declare, isMember: false } : declare;
		}
	},
	     

	// TODO:ES6 _orMember=false
	parseLocalDeclareFromSpaced = (tokens, _orMember) => {
		var _ref = (0, _Token.isKeyword)(_Token.KW_Lazy, tokens.head()) ? [tokens.tail(), true, false] : _orMember && (0, _Token.isKeyword)(_Token.KW_Dot, tokens.head()) ? [tokens.tail(), false, true] : [tokens, false, false];

		var _ref2 = _slicedToArray(_ref, 3);

		const rest = _ref2[0];
		const isLazy = _ref2[1];
		const isMember = _ref2[2];

		const name = parseLocalName(rest.head());
		const rest2 = rest.tail();
		const opType = (0, _util.opIf)(!rest2.isEmpty(), () => {
			const colon = rest2.head();
			(0, _context.check)((0, _Token.isKeyword)(_Token.KW_Type, colon), colon.loc, () => `Expected ${ (0, _CompileError.code)(':') }`);
			const tokensType = rest2.tail();
			(0, _checks.checkNonEmpty)(tokensType, () => `Expected something after ${ colon }`);
			return (0, _parse.parseSpaced)(tokensType);
		});
		const declare = new _MsAst.LocalDeclare(tokens.loc, name, opType, isLazy ? _MsAst.LD_Lazy : _MsAst.LD_Const);
		return _orMember ? { declare, isMember } : declare;
	},
	      parseLocalDeclaresAndMemberArgs = tokens => {
		const declares = [],
		      memberArgs = [];
		for (const token of tokens) {
			var _parseLocalDeclare = parseLocalDeclare(token, true);

			const declare = _parseLocalDeclare.declare;
			const isMember = _parseLocalDeclare.isMember;

			declares.push(declare);
			if (isMember) memberArgs.push(declare);
		}
		return { declares, memberArgs };
	},
	      parseLocalName = token => {
		if ((0, _Token.isKeyword)(_Token.KW_Focus, token)) return '_';else {
			(0, _context.check)(token instanceof _Token.Name, token.loc, () => `Expected a local name, not ${ token }.`);
			return token.name;
		}
	};
	exports.parseLocalDeclaresJustNames = parseLocalDeclaresJustNames;
	exports.parseLocalDeclare = parseLocalDeclare;
	exports.parseLocalDeclareFromSpaced = parseLocalDeclareFromSpaced;
	exports.parseLocalDeclaresAndMemberArgs = parseLocalDeclaresAndMemberArgs;
	exports.parseLocalName = parseLocalName;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlTG9jYWxEZWNsYXJlcy5qcyIsInByaXZhdGUvcGFyc2UvcGFyc2VMb2NhbERlY2xhcmVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O21CQ1NlLENBQUMsTUFBTSxFQUFFLGlCQUFpQixLQUN4QyxpQkFBaUIsR0FBRywrQkFBK0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDOztBQUVyRixPQUNOLDJCQUEyQixHQUFHLE1BQU0sSUFDbkMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksT0FaUyxZQUFZLENBWVIsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0FBSTlELGtCQUFpQixHQUFHLENBQUMsS0FBSyxFQUFFLFNBQVMsS0FBSztBQUN6QyxNQUFJLFdBaEJXLE9BQU8sU0FBaEIsT0FBTyxFQWdCUSxLQUFLLENBQUMsRUFDMUIsT0FBTywyQkFBMkIsQ0FBQyxnQkFBTSxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUEsS0FDN0Q7QUFDSixTQUFNLE9BQU8sR0FBRyxPQXBCUSxZQUFZLENBb0JQLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQ3BFLFVBQU8sU0FBUyxHQUFHLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUMsR0FBRyxPQUFPLENBQUE7R0FDdkQ7RUFDRDs7OztBQUdELDRCQUEyQixHQUFHLENBQUMsTUFBTSxFQUFFLFNBQVMsS0FBSzthQUVuRCxXQTNCdUIsU0FBUyxTQUFvQixPQUFPLEVBMkJ4QyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsR0FDaEMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUM1QixTQUFTLElBQUksV0E3QlMsU0FBUyxTQUFFLE1BQU0sRUE2QlIsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQzdDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FDNUIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQzs7OztRQUxqQixJQUFJO1FBQUUsTUFBTTtRQUFFLFFBQVE7O0FBTTdCLFFBQU0sSUFBSSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUN4QyxRQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDekIsUUFBTSxNQUFNLEdBQUcsVUFqQ1QsSUFBSSxFQWlDVSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNO0FBQzNDLFNBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUMxQixnQkF0Q0ssS0FBSyxFQXNDSixXQXBDaUIsU0FBUyxTQUE2QixPQUFPLEVBb0MzQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxTQUFTLEdBQUUsa0JBdkN6RCxJQUFJLEVBdUMwRCxHQUFHLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtBQUMxRSxTQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDL0IsZUFwQ0ssYUFBYSxFQW9DSixVQUFVLEVBQUUsTUFBTSxDQUFDLHlCQUF5QixHQUFFLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQTtBQUNwRSxVQUFPLFdBcENGLFdBQVcsRUFvQ0csVUFBVSxDQUFDLENBQUE7R0FDOUIsQ0FBQyxDQUFBO0FBQ0YsUUFBTSxPQUFPLEdBQUksV0ExQ1EsWUFBWSxDQTBDSCxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxVQTFDbEQsT0FBTyxVQUFqQixRQUFRLEFBMEN5RSxDQUFDLENBQUE7QUFDeEYsU0FBTyxTQUFTLEdBQUcsRUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFDLEdBQUcsT0FBTyxDQUFBO0VBQ2hEO09BRUQsK0JBQStCLEdBQUcsTUFBTSxJQUFJO0FBQzNDLFFBQU0sUUFBUSxHQUFHLEVBQUU7UUFBRSxVQUFVLEdBQUcsRUFBRSxDQUFBO0FBQ3BDLE9BQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFOzRCQUNDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7O1NBQW5ELE9BQU8sc0JBQVAsT0FBTztTQUFFLFFBQVEsc0JBQVIsUUFBUTs7QUFDeEIsV0FBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUN0QixPQUFJLFFBQVEsRUFDWCxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQ3pCO0FBQ0QsU0FBTyxFQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUMsQ0FBQTtFQUM3QjtPQUVELGNBQWMsR0FBRyxLQUFLLElBQUk7QUFDekIsTUFBSSxXQXpEb0IsU0FBUyxTQUFVLFFBQVEsRUF5RDNCLEtBQUssQ0FBQyxFQUM3QixPQUFPLEdBQUcsQ0FBQSxLQUNOO0FBQ0osZ0JBOURLLEtBQUssRUE4REosS0FBSyxtQkE1RDJELElBQUksQUE0RC9DLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsMkJBQTJCLEdBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDckYsVUFBTyxLQUFLLENBQUMsSUFBSSxDQUFBO0dBQ2pCO0VBQ0QsQ0FBQSIsImZpbGUiOiJwcml2YXRlL3BhcnNlL3BhcnNlTG9jYWxEZWNsYXJlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtMRF9Db25zdCwgTERfTGF6eSwgTG9jYWxEZWNsYXJlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R19TcGFjZSwgaXNHcm91cCwgaXNLZXl3b3JkLCBLV19Eb3QsIEtXX0ZvY3VzLCBLV19MYXp5LCBLV19UeXBlLCBOYW1lfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7b3BJZn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tOb25FbXB0eX0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge3BhcnNlU3BhY2VkfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG5leHBvcnQgZGVmYXVsdCAodG9rZW5zLCBpbmNsdWRlTWVtYmVyQXJncykgPT5cblx0aW5jbHVkZU1lbWJlckFyZ3MgPyBwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzKHRva2VucykgOiB0b2tlbnMubWFwKHBhcnNlTG9jYWxEZWNsYXJlKVxuXG5leHBvcnQgY29uc3Rcblx0cGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzID0gdG9rZW5zID0+XG5cdFx0dG9rZW5zLm1hcChfID0+IExvY2FsRGVjbGFyZS5wbGFpbihfLmxvYywgcGFyc2VMb2NhbE5hbWUoXykpKSxcblxuXHQvLyBfb3JNZW1iZXI6IGlmIHRydWUsIHdpbGwgbG9vayBmb3IgYC54YCBhcmd1bWVudHMgYW5kIHJldHVybiB7ZGVjbGFyZSwgaXNNZW1iZXJ9LlxuXHQvLyBUT0RPOkVTNiBfb3JNZW1iZXI9ZmFsc2Vcblx0cGFyc2VMb2NhbERlY2xhcmUgPSAodG9rZW4sIF9vck1lbWJlcikgPT4ge1xuXHRcdGlmIChpc0dyb3VwKEdfU3BhY2UsIHRva2VuKSlcblx0XHRcdHJldHVybiBwYXJzZUxvY2FsRGVjbGFyZUZyb21TcGFjZWQoU2xpY2UuZ3JvdXAodG9rZW4pLCBfb3JNZW1iZXIpXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBkZWNsYXJlID0gTG9jYWxEZWNsYXJlLnBsYWluKHRva2VuLmxvYywgcGFyc2VMb2NhbE5hbWUodG9rZW4pKVxuXHRcdFx0cmV0dXJuIF9vck1lbWJlciA/IHtkZWNsYXJlLCBpc01lbWJlcjogZmFsc2V9IDogZGVjbGFyZVxuXHRcdH1cblx0fSxcblxuXHQvLyBUT0RPOkVTNiBfb3JNZW1iZXI9ZmFsc2Vcblx0cGFyc2VMb2NhbERlY2xhcmVGcm9tU3BhY2VkID0gKHRva2VucywgX29yTWVtYmVyKSA9PiB7XG5cdFx0Y29uc3QgW3Jlc3QsIGlzTGF6eSwgaXNNZW1iZXJdID1cblx0XHRcdGlzS2V5d29yZChLV19MYXp5LCB0b2tlbnMuaGVhZCgpKSA/XG5cdFx0XHRcdFt0b2tlbnMudGFpbCgpLCB0cnVlLCBmYWxzZV0gOlxuXHRcdFx0XHRfb3JNZW1iZXIgJiYgaXNLZXl3b3JkKEtXX0RvdCwgdG9rZW5zLmhlYWQoKSkgP1xuXHRcdFx0XHRbdG9rZW5zLnRhaWwoKSwgZmFsc2UsIHRydWVdIDpcblx0XHRcdFx0W3Rva2VucywgZmFsc2UsIGZhbHNlXVxuXHRcdGNvbnN0IG5hbWUgPSBwYXJzZUxvY2FsTmFtZShyZXN0LmhlYWQoKSlcblx0XHRjb25zdCByZXN0MiA9IHJlc3QudGFpbCgpXG5cdFx0Y29uc3Qgb3BUeXBlID0gb3BJZighcmVzdDIuaXNFbXB0eSgpLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBjb2xvbiA9IHJlc3QyLmhlYWQoKVxuXHRcdFx0Y2hlY2soaXNLZXl3b3JkKEtXX1R5cGUsIGNvbG9uKSwgY29sb24ubG9jLCAoKSA9PiBgRXhwZWN0ZWQgJHtjb2RlKCc6Jyl9YClcblx0XHRcdGNvbnN0IHRva2Vuc1R5cGUgPSByZXN0Mi50YWlsKClcblx0XHRcdGNoZWNrTm9uRW1wdHkodG9rZW5zVHlwZSwgKCkgPT4gYEV4cGVjdGVkIHNvbWV0aGluZyBhZnRlciAke2NvbG9ufWApXG5cdFx0XHRyZXR1cm4gcGFyc2VTcGFjZWQodG9rZW5zVHlwZSlcblx0XHR9KVxuXHRcdGNvbnN0IGRlY2xhcmUgPSAgbmV3IExvY2FsRGVjbGFyZSh0b2tlbnMubG9jLCBuYW1lLCBvcFR5cGUsIGlzTGF6eSA/IExEX0xhenkgOiBMRF9Db25zdClcblx0XHRyZXR1cm4gX29yTWVtYmVyID8ge2RlY2xhcmUsIGlzTWVtYmVyfSA6IGRlY2xhcmVcblx0fSxcblxuXHRwYXJzZUxvY2FsRGVjbGFyZXNBbmRNZW1iZXJBcmdzID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBkZWNsYXJlcyA9IFtdLCBtZW1iZXJBcmdzID0gW11cblx0XHRmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuXHRcdFx0Y29uc3Qge2RlY2xhcmUsIGlzTWVtYmVyfSA9IHBhcnNlTG9jYWxEZWNsYXJlKHRva2VuLCB0cnVlKVxuXHRcdFx0ZGVjbGFyZXMucHVzaChkZWNsYXJlKVxuXHRcdFx0aWYgKGlzTWVtYmVyKVxuXHRcdFx0XHRtZW1iZXJBcmdzLnB1c2goZGVjbGFyZSlcblx0XHR9XG5cdFx0cmV0dXJuIHtkZWNsYXJlcywgbWVtYmVyQXJnc31cblx0fSxcblxuXHRwYXJzZUxvY2FsTmFtZSA9IHRva2VuID0+IHtcblx0XHRpZiAoaXNLZXl3b3JkKEtXX0ZvY3VzLCB0b2tlbikpXG5cdFx0XHRyZXR1cm4gJ18nXG5cdFx0ZWxzZSB7XG5cdFx0XHRjaGVjayh0b2tlbiBpbnN0YW5jZW9mIE5hbWUsIHRva2VuLmxvYywgKCkgPT4gYEV4cGVjdGVkIGEgbG9jYWwgbmFtZSwgbm90ICR7dG9rZW59LmApXG5cdFx0XHRyZXR1cm4gdG9rZW4ubmFtZVxuXHRcdH1cblx0fSJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', '../../CompileError', '../MsAst', '../Token', '../util', './context', './parse*', './Slice'], function (exports, _CompileError, _MsAst, _Token, _util, _context, _parse, _Slice) {
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
	parseLocalDeclare = (token, _orMember) => {
		let isMember = false;
		let declare;

		const parseLocalNameOrMember = token => {
			if (_orMember) {
				isMember = token instanceof _Token.DotName && token.nDots === 1;
				return isMember ? token.name : parseLocalName(token);
			} else return parseLocalName(token);
		};

		if ((0, _Token.isGroup)(_Token.G_Space, token)) {
			const tokens = _Slice2.default.group(token);

			var _ref = (0, _Token.isKeyword)(_Token.KW_Lazy, tokens.head()) ? [tokens.tail(), true] : [tokens, false];

			var _ref2 = _slicedToArray(_ref, 2);

			const rest = _ref2[0];
			const isLazy = _ref2[1];

			const name = parseLocalNameOrMember(rest.head());
			const rest2 = rest.tail();
			const opType = (0, _util.opIf)(!rest2.isEmpty(), () => {
				const colon = rest2.head();
				_context.context.check((0, _Token.isKeyword)(_Token.KW_Type, colon), colon.loc, () => `Expected ${ (0, _CompileError.code)(':') }`);
				const tokensType = rest2.tail();
				(0, _context.checkNonEmpty)(tokensType, () => `Expected something after ${ colon }`);
				return (0, _parse.parseSpaced)(tokensType);
			});
			declare = new _MsAst.LocalDeclare(token.loc, name, opType, isLazy ? _MsAst.LD_Lazy : _MsAst.LD_Const);
		} else declare = _MsAst.LocalDeclare.plain(token.loc, parseLocalNameOrMember(token));

		if (_orMember) return { declare, isMember };else return declare;
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
			_context.context.check(token instanceof _Token.Name, token.loc, () => `Expected a local name, not ${ token }.`);
			return token.name;
		}
	};
	exports.parseLocalDeclaresJustNames = parseLocalDeclaresJustNames;
	exports.parseLocalDeclare = parseLocalDeclare;
	exports.parseLocalDeclaresAndMemberArgs = parseLocalDeclaresAndMemberArgs;
	exports.parseLocalName = parseLocalName;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlTG9jYWxEZWNsYXJlcy5qcyIsInByaXZhdGUvcGFyc2UvcGFyc2VMb2NhbERlY2xhcmVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O21CQ1FlLENBQUMsTUFBTSxFQUFFLGlCQUFpQixLQUN4QyxpQkFBaUIsR0FBRywrQkFBK0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDOztBQUVyRixPQUNOLDJCQUEyQixHQUFHLE1BQU0sSUFDbkMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksT0FaUyxZQUFZLENBWVIsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7QUFHOUQsa0JBQWlCLEdBQUcsQ0FBQyxLQUFLLEVBQUUsU0FBUyxLQUFLO0FBQ3pDLE1BQUksUUFBUSxHQUFHLEtBQUssQ0FBQTtBQUNwQixNQUFJLE9BQU8sQ0FBQTs7QUFFWCxRQUFNLHNCQUFzQixHQUFHLEtBQUssSUFBSTtBQUN2QyxPQUFJLFNBQVMsRUFBRTtBQUNkLFlBQVEsR0FBRyxLQUFLLG1CQXBCWixPQUFPLEFBb0J3QixJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFBO0FBQ3hELFdBQU8sUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3BELE1BQ0EsT0FBTyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUE7R0FDN0IsQ0FBQTs7QUFFRCxNQUFJLFdBMUJvQixPQUFPLFNBQWhCLE9BQU8sRUEwQkQsS0FBSyxDQUFDLEVBQUU7QUFDNUIsU0FBTSxNQUFNLEdBQUcsZ0JBQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFBOztjQUVoQyxXQTdCK0IsU0FBUyxTQUFZLE9BQU8sRUE2QnhDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQzs7OztTQURyRSxJQUFJO1NBQUUsTUFBTTs7QUFHbkIsU0FBTSxJQUFJLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7QUFDaEQsU0FBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ3pCLFNBQU0sTUFBTSxHQUFHLFVBaENWLElBQUksRUFnQ1csQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTTtBQUMzQyxVQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDMUIsYUFqQ21CLE9BQU8sQ0FpQ2xCLEtBQUssQ0FBQyxXQW5DaUIsU0FBUyxTQUFxQixPQUFPLEVBbUNuQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxTQUFTLEdBQUUsa0JBckNsRSxJQUFJLEVBcUNtRSxHQUFHLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtBQUNsRixVQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDL0IsaUJBbkNJLGFBQWEsRUFtQ0gsVUFBVSxFQUFFLE1BQU0sQ0FBQyx5QkFBeUIsR0FBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUE7QUFDcEUsV0FBTyxXQW5DSCxXQUFXLEVBbUNJLFVBQVUsQ0FBQyxDQUFBO0lBQzlCLENBQUMsQ0FBQTtBQUNGLFVBQU8sR0FBRyxXQXpDYyxZQUFZLENBeUNULEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBekMzQyxPQUFPLFVBQWpCLFFBQVEsQUF5Q2tFLENBQUMsQ0FBQTtHQUNoRixNQUNBLE9BQU8sR0FBRyxPQTNDYyxZQUFZLENBMkNiLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7O0FBRXZFLE1BQUksU0FBUyxFQUNaLE9BQU8sRUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFDLENBQUEsS0FFMUIsT0FBTyxPQUFPLENBQUE7RUFDZjtPQUVELCtCQUErQixHQUFHLE1BQU0sSUFBSTtBQUMzQyxRQUFNLFFBQVEsR0FBRyxFQUFFO1FBQUUsVUFBVSxHQUFHLEVBQUUsQ0FBQTtBQUNwQyxPQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTs0QkFDQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDOztTQUFuRCxPQUFPLHNCQUFQLE9BQU87U0FBRSxRQUFRLHNCQUFSLFFBQVE7O0FBQ3hCLFdBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDdEIsT0FBSSxRQUFRLEVBQ1gsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtHQUN6QjtBQUNELFNBQU8sRUFBQyxRQUFRLEVBQUUsVUFBVSxFQUFDLENBQUE7RUFDN0I7T0FFRCxjQUFjLEdBQUcsS0FBSyxJQUFJO0FBQ3pCLE1BQUksV0E5RDZCLFNBQVMsU0FBRSxRQUFRLEVBOEQ1QixLQUFLLENBQUMsRUFDN0IsT0FBTyxHQUFHLENBQUEsS0FDTjtBQUNKLFlBL0RvQixPQUFPLENBK0RuQixLQUFLLENBQUMsS0FBSyxtQkFqRW9ELElBQUksQUFpRXhDLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUMvQyxDQUFDLDJCQUEyQixHQUFFLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3hDLFVBQU8sS0FBSyxDQUFDLElBQUksQ0FBQTtHQUNqQjtFQUNELENBQUEiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9wYXJzZUxvY2FsRGVjbGFyZXMuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtMRF9Db25zdCwgTERfTGF6eSwgTG9jYWxEZWNsYXJlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7RG90TmFtZSwgR19TcGFjZSwgaXNHcm91cCwgaXNLZXl3b3JkLCBLV19Gb2N1cywgS1dfTGF6eSwgS1dfVHlwZSwgTmFtZX0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge29wSWZ9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2NoZWNrTm9uRW1wdHksIGNvbnRleHR9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB7cGFyc2VTcGFjZWR9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbmV4cG9ydCBkZWZhdWx0ICh0b2tlbnMsIGluY2x1ZGVNZW1iZXJBcmdzKSA9PlxuXHRpbmNsdWRlTWVtYmVyQXJncyA/IHBhcnNlTG9jYWxEZWNsYXJlc0FuZE1lbWJlckFyZ3ModG9rZW5zKSA6IHRva2Vucy5tYXAocGFyc2VMb2NhbERlY2xhcmUpXG5cbmV4cG9ydCBjb25zdFxuXHRwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMgPSB0b2tlbnMgPT5cblx0XHR0b2tlbnMubWFwKF8gPT4gTG9jYWxEZWNsYXJlLnBsYWluKF8ubG9jLCBwYXJzZUxvY2FsTmFtZShfKSkpLFxuXG5cdC8vIF9vck1lbWJlcjogaWYgdHJ1ZSwgd2lsbCBsb29rIGZvciBgLnhgIGFyZ3VtZW50cyBhbmQgcmV0dXJuIHtkZWNsYXJlLCBpc01lbWJlcn0uXG5cdHBhcnNlTG9jYWxEZWNsYXJlID0gKHRva2VuLCBfb3JNZW1iZXIpID0+IHtcblx0XHRsZXQgaXNNZW1iZXIgPSBmYWxzZVxuXHRcdGxldCBkZWNsYXJlXG5cblx0XHRjb25zdCBwYXJzZUxvY2FsTmFtZU9yTWVtYmVyID0gdG9rZW4gPT4ge1xuXHRcdFx0aWYgKF9vck1lbWJlcikge1xuXHRcdFx0XHRpc01lbWJlciA9IHRva2VuIGluc3RhbmNlb2YgRG90TmFtZSAmJiB0b2tlbi5uRG90cyA9PT0gMVxuXHRcdFx0XHRyZXR1cm4gaXNNZW1iZXIgPyB0b2tlbi5uYW1lIDogcGFyc2VMb2NhbE5hbWUodG9rZW4pXG5cdFx0XHR9IGVsc2Vcblx0XHRcdFx0cmV0dXJuIHBhcnNlTG9jYWxOYW1lKHRva2VuKVxuXHRcdH1cblxuXHRcdGlmIChpc0dyb3VwKEdfU3BhY2UsIHRva2VuKSkge1xuXHRcdFx0Y29uc3QgdG9rZW5zID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0XHRjb25zdCBbcmVzdCwgaXNMYXp5XSA9XG5cdFx0XHRcdGlzS2V5d29yZChLV19MYXp5LCB0b2tlbnMuaGVhZCgpKSA/IFt0b2tlbnMudGFpbCgpLCB0cnVlXSA6IFt0b2tlbnMsIGZhbHNlXVxuXG5cdFx0XHRjb25zdCBuYW1lID0gcGFyc2VMb2NhbE5hbWVPck1lbWJlcihyZXN0LmhlYWQoKSlcblx0XHRcdGNvbnN0IHJlc3QyID0gcmVzdC50YWlsKClcblx0XHRcdGNvbnN0IG9wVHlwZSA9IG9wSWYoIXJlc3QyLmlzRW1wdHkoKSwgKCkgPT4ge1xuXHRcdFx0XHRjb25zdCBjb2xvbiA9IHJlc3QyLmhlYWQoKVxuXHRcdFx0XHRjb250ZXh0LmNoZWNrKGlzS2V5d29yZChLV19UeXBlLCBjb2xvbiksIGNvbG9uLmxvYywgKCkgPT4gYEV4cGVjdGVkICR7Y29kZSgnOicpfWApXG5cdFx0XHRcdGNvbnN0IHRva2Vuc1R5cGUgPSByZXN0Mi50YWlsKClcblx0XHRcdFx0Y2hlY2tOb25FbXB0eSh0b2tlbnNUeXBlLCAoKSA9PiBgRXhwZWN0ZWQgc29tZXRoaW5nIGFmdGVyICR7Y29sb259YClcblx0XHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkKHRva2Vuc1R5cGUpXG5cdFx0XHR9KVxuXHRcdFx0ZGVjbGFyZSA9IG5ldyBMb2NhbERlY2xhcmUodG9rZW4ubG9jLCBuYW1lLCBvcFR5cGUsIGlzTGF6eSA/IExEX0xhenkgOiBMRF9Db25zdClcblx0XHR9IGVsc2Vcblx0XHRcdGRlY2xhcmUgPSBMb2NhbERlY2xhcmUucGxhaW4odG9rZW4ubG9jLCBwYXJzZUxvY2FsTmFtZU9yTWVtYmVyKHRva2VuKSlcblxuXHRcdGlmIChfb3JNZW1iZXIpXG5cdFx0XHRyZXR1cm4ge2RlY2xhcmUsIGlzTWVtYmVyfVxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBkZWNsYXJlXG5cdH0sXG5cblx0cGFyc2VMb2NhbERlY2xhcmVzQW5kTWVtYmVyQXJncyA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgZGVjbGFyZXMgPSBbXSwgbWVtYmVyQXJncyA9IFtdXG5cdFx0Zm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcblx0XHRcdGNvbnN0IHtkZWNsYXJlLCBpc01lbWJlcn0gPSBwYXJzZUxvY2FsRGVjbGFyZSh0b2tlbiwgdHJ1ZSlcblx0XHRcdGRlY2xhcmVzLnB1c2goZGVjbGFyZSlcblx0XHRcdGlmIChpc01lbWJlcilcblx0XHRcdFx0bWVtYmVyQXJncy5wdXNoKGRlY2xhcmUpXG5cdFx0fVxuXHRcdHJldHVybiB7ZGVjbGFyZXMsIG1lbWJlckFyZ3N9XG5cdH0sXG5cblx0cGFyc2VMb2NhbE5hbWUgPSB0b2tlbiA9PiB7XG5cdFx0aWYgKGlzS2V5d29yZChLV19Gb2N1cywgdG9rZW4pKVxuXHRcdFx0cmV0dXJuICdfJ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29udGV4dC5jaGVjayh0b2tlbiBpbnN0YW5jZW9mIE5hbWUsIHRva2VuLmxvYywgKCkgPT5cblx0XHRcdFx0YEV4cGVjdGVkIGEgbG9jYWwgbmFtZSwgbm90ICR7dG9rZW59LmApXG5cdFx0XHRyZXR1cm4gdG9rZW4ubmFtZVxuXHRcdH1cblx0fSJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

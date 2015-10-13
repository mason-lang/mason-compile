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
			_context.context.check((0, _Token.isKeyword)(_Token.KW_Type, colon), colon.loc, () => `Expected ${ (0, _CompileError.code)(':') }`);
			const tokensType = rest2.tail();
			(0, _context.checkNonEmpty)(tokensType, () => `Expected something after ${ colon }`);
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
			_context.context.check(token instanceof _Token.Name, token.loc, () => `Expected a local name, not ${ token }.`);
			return token.name;
		}
	};
	exports.parseLocalDeclaresJustNames = parseLocalDeclaresJustNames;
	exports.parseLocalDeclare = parseLocalDeclare;
	exports.parseLocalDeclareFromSpaced = parseLocalDeclareFromSpaced;
	exports.parseLocalDeclaresAndMemberArgs = parseLocalDeclaresAndMemberArgs;
	exports.parseLocalName = parseLocalName;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlTG9jYWxEZWNsYXJlcy5qcyIsInByaXZhdGUvcGFyc2UvcGFyc2VMb2NhbERlY2xhcmVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O21CQ1FlLENBQUMsTUFBTSxFQUFFLGlCQUFpQixLQUN4QyxpQkFBaUIsR0FBRywrQkFBK0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDOztBQUVyRixPQUNOLDJCQUEyQixHQUFHLE1BQU0sSUFDbkMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksT0FaUyxZQUFZLENBWVIsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0FBSTlELGtCQUFpQixHQUFHLENBQUMsS0FBSyxFQUFFLFNBQVMsS0FBSztBQUN6QyxNQUFJLFdBaEJXLE9BQU8sU0FBaEIsT0FBTyxFQWdCUSxLQUFLLENBQUMsRUFDMUIsT0FBTywyQkFBMkIsQ0FBQyxnQkFBTSxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUEsS0FDN0Q7QUFDSixTQUFNLE9BQU8sR0FBRyxPQXBCUSxZQUFZLENBb0JQLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQ3BFLFVBQU8sU0FBUyxHQUFHLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUMsR0FBRyxPQUFPLENBQUE7R0FDdkQ7RUFDRDs7OztBQUdELDRCQUEyQixHQUFHLENBQUMsTUFBTSxFQUFFLFNBQVMsS0FBSzthQUVuRCxXQTNCdUIsU0FBUyxTQUFvQixPQUFPLEVBMkJ4QyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsR0FDaEMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUM1QixTQUFTLElBQUksV0E3QlMsU0FBUyxTQUFFLE1BQU0sRUE2QlIsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQzdDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FDNUIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQzs7OztRQUxqQixJQUFJO1FBQUUsTUFBTTtRQUFFLFFBQVE7O0FBTTdCLFFBQU0sSUFBSSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUN4QyxRQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDekIsUUFBTSxNQUFNLEdBQUcsVUFqQ1QsSUFBSSxFQWlDVSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNO0FBQzNDLFNBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUMxQixZQWxDb0IsT0FBTyxDQWtDbkIsS0FBSyxDQUFDLFdBcENTLFNBQVMsU0FBNkIsT0FBTyxFQW9DbkMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsU0FBUyxHQUFFLGtCQXRDakUsSUFBSSxFQXNDa0UsR0FBRyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7QUFDbEYsU0FBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFBO0FBQy9CLGdCQXBDSyxhQUFhLEVBb0NKLFVBQVUsRUFBRSxNQUFNLENBQUMseUJBQXlCLEdBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3BFLFVBQU8sV0FwQ0YsV0FBVyxFQW9DRyxVQUFVLENBQUMsQ0FBQTtHQUM5QixDQUFDLENBQUE7QUFDRixRQUFNLE9BQU8sR0FBSSxXQTFDUSxZQUFZLENBMENILE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBMUNsRCxPQUFPLFVBQWpCLFFBQVEsQUEwQ3lFLENBQUMsQ0FBQTtBQUN4RixTQUFPLFNBQVMsR0FBRyxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUMsR0FBRyxPQUFPLENBQUE7RUFDaEQ7T0FFRCwrQkFBK0IsR0FBRyxNQUFNLElBQUk7QUFDM0MsUUFBTSxRQUFRLEdBQUcsRUFBRTtRQUFFLFVBQVUsR0FBRyxFQUFFLENBQUE7QUFDcEMsT0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7NEJBQ0MsaUJBQWlCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQzs7U0FBbkQsT0FBTyxzQkFBUCxPQUFPO1NBQUUsUUFBUSxzQkFBUixRQUFROztBQUN4QixXQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3RCLE9BQUksUUFBUSxFQUNYLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7R0FDekI7QUFDRCxTQUFPLEVBQUMsUUFBUSxFQUFFLFVBQVUsRUFBQyxDQUFBO0VBQzdCO09BRUQsY0FBYyxHQUFHLEtBQUssSUFBSTtBQUN6QixNQUFJLFdBekRvQixTQUFTLFNBQVUsUUFBUSxFQXlEM0IsS0FBSyxDQUFDLEVBQzdCLE9BQU8sR0FBRyxDQUFBLEtBQ047QUFDSixZQTFEb0IsT0FBTyxDQTBEbkIsS0FBSyxDQUFDLEtBQUssbUJBNURtRCxJQUFJLEFBNER2QyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsTUFDL0MsQ0FBQywyQkFBMkIsR0FBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN4QyxVQUFPLEtBQUssQ0FBQyxJQUFJLENBQUE7R0FDakI7RUFDRCxDQUFBIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvcGFyc2VMb2NhbERlY2xhcmVzLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7TERfQ29uc3QsIExEX0xhenksIExvY2FsRGVjbGFyZX0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dfU3BhY2UsIGlzR3JvdXAsIGlzS2V5d29yZCwgS1dfRG90LCBLV19Gb2N1cywgS1dfTGF6eSwgS1dfVHlwZSwgTmFtZX0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge29wSWZ9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2NoZWNrTm9uRW1wdHksIGNvbnRleHR9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB7cGFyc2VTcGFjZWR9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbmV4cG9ydCBkZWZhdWx0ICh0b2tlbnMsIGluY2x1ZGVNZW1iZXJBcmdzKSA9PlxuXHRpbmNsdWRlTWVtYmVyQXJncyA/IHBhcnNlTG9jYWxEZWNsYXJlc0FuZE1lbWJlckFyZ3ModG9rZW5zKSA6IHRva2Vucy5tYXAocGFyc2VMb2NhbERlY2xhcmUpXG5cbmV4cG9ydCBjb25zdFxuXHRwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMgPSB0b2tlbnMgPT5cblx0XHR0b2tlbnMubWFwKF8gPT4gTG9jYWxEZWNsYXJlLnBsYWluKF8ubG9jLCBwYXJzZUxvY2FsTmFtZShfKSkpLFxuXG5cdC8vIF9vck1lbWJlcjogaWYgdHJ1ZSwgd2lsbCBsb29rIGZvciBgLnhgIGFyZ3VtZW50cyBhbmQgcmV0dXJuIHtkZWNsYXJlLCBpc01lbWJlcn0uXG5cdC8vIFRPRE86RVM2IF9vck1lbWJlcj1mYWxzZVxuXHRwYXJzZUxvY2FsRGVjbGFyZSA9ICh0b2tlbiwgX29yTWVtYmVyKSA9PiB7XG5cdFx0aWYgKGlzR3JvdXAoR19TcGFjZSwgdG9rZW4pKVxuXHRcdFx0cmV0dXJuIHBhcnNlTG9jYWxEZWNsYXJlRnJvbVNwYWNlZChTbGljZS5ncm91cCh0b2tlbiksIF9vck1lbWJlcilcblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IGRlY2xhcmUgPSBMb2NhbERlY2xhcmUucGxhaW4odG9rZW4ubG9jLCBwYXJzZUxvY2FsTmFtZSh0b2tlbikpXG5cdFx0XHRyZXR1cm4gX29yTWVtYmVyID8ge2RlY2xhcmUsIGlzTWVtYmVyOiBmYWxzZX0gOiBkZWNsYXJlXG5cdFx0fVxuXHR9LFxuXG5cdC8vIFRPRE86RVM2IF9vck1lbWJlcj1mYWxzZVxuXHRwYXJzZUxvY2FsRGVjbGFyZUZyb21TcGFjZWQgPSAodG9rZW5zLCBfb3JNZW1iZXIpID0+IHtcblx0XHRjb25zdCBbcmVzdCwgaXNMYXp5LCBpc01lbWJlcl0gPVxuXHRcdFx0aXNLZXl3b3JkKEtXX0xhenksIHRva2Vucy5oZWFkKCkpID9cblx0XHRcdFx0W3Rva2Vucy50YWlsKCksIHRydWUsIGZhbHNlXSA6XG5cdFx0XHRcdF9vck1lbWJlciAmJiBpc0tleXdvcmQoS1dfRG90LCB0b2tlbnMuaGVhZCgpKSA/XG5cdFx0XHRcdFt0b2tlbnMudGFpbCgpLCBmYWxzZSwgdHJ1ZV0gOlxuXHRcdFx0XHRbdG9rZW5zLCBmYWxzZSwgZmFsc2VdXG5cdFx0Y29uc3QgbmFtZSA9IHBhcnNlTG9jYWxOYW1lKHJlc3QuaGVhZCgpKVxuXHRcdGNvbnN0IHJlc3QyID0gcmVzdC50YWlsKClcblx0XHRjb25zdCBvcFR5cGUgPSBvcElmKCFyZXN0Mi5pc0VtcHR5KCksICgpID0+IHtcblx0XHRcdGNvbnN0IGNvbG9uID0gcmVzdDIuaGVhZCgpXG5cdFx0XHRjb250ZXh0LmNoZWNrKGlzS2V5d29yZChLV19UeXBlLCBjb2xvbiksIGNvbG9uLmxvYywgKCkgPT4gYEV4cGVjdGVkICR7Y29kZSgnOicpfWApXG5cdFx0XHRjb25zdCB0b2tlbnNUeXBlID0gcmVzdDIudGFpbCgpXG5cdFx0XHRjaGVja05vbkVtcHR5KHRva2Vuc1R5cGUsICgpID0+IGBFeHBlY3RlZCBzb21ldGhpbmcgYWZ0ZXIgJHtjb2xvbn1gKVxuXHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkKHRva2Vuc1R5cGUpXG5cdFx0fSlcblx0XHRjb25zdCBkZWNsYXJlID0gIG5ldyBMb2NhbERlY2xhcmUodG9rZW5zLmxvYywgbmFtZSwgb3BUeXBlLCBpc0xhenkgPyBMRF9MYXp5IDogTERfQ29uc3QpXG5cdFx0cmV0dXJuIF9vck1lbWJlciA/IHtkZWNsYXJlLCBpc01lbWJlcn0gOiBkZWNsYXJlXG5cdH0sXG5cblx0cGFyc2VMb2NhbERlY2xhcmVzQW5kTWVtYmVyQXJncyA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgZGVjbGFyZXMgPSBbXSwgbWVtYmVyQXJncyA9IFtdXG5cdFx0Zm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcblx0XHRcdGNvbnN0IHtkZWNsYXJlLCBpc01lbWJlcn0gPSBwYXJzZUxvY2FsRGVjbGFyZSh0b2tlbiwgdHJ1ZSlcblx0XHRcdGRlY2xhcmVzLnB1c2goZGVjbGFyZSlcblx0XHRcdGlmIChpc01lbWJlcilcblx0XHRcdFx0bWVtYmVyQXJncy5wdXNoKGRlY2xhcmUpXG5cdFx0fVxuXHRcdHJldHVybiB7ZGVjbGFyZXMsIG1lbWJlckFyZ3N9XG5cdH0sXG5cblx0cGFyc2VMb2NhbE5hbWUgPSB0b2tlbiA9PiB7XG5cdFx0aWYgKGlzS2V5d29yZChLV19Gb2N1cywgdG9rZW4pKVxuXHRcdFx0cmV0dXJuICdfJ1xuXHRcdGVsc2Uge1xuXHRcdFx0Y29udGV4dC5jaGVjayh0b2tlbiBpbnN0YW5jZW9mIE5hbWUsIHRva2VuLmxvYywgKCkgPT5cblx0XHRcdFx0YEV4cGVjdGVkIGEgbG9jYWwgbmFtZSwgbm90ICR7dG9rZW59LmApXG5cdFx0XHRyZXR1cm4gdG9rZW4ubmFtZVxuXHRcdH1cblx0fSJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

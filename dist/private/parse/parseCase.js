if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../../CompileError', '../MsAst', '../Token', '../util', './context', './parse*', './parseBlock', './parseLocalDeclares', './parseSpaced', './Slice'], function (exports, module, _CompileError, _MsAst, _Token, _util, _context, _parse, _parseBlock, _parseLocalDeclares, _parseSpaced, _Slice) {
	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseLocalDeclares2 = _interopRequireDefault(_parseLocalDeclares);

	var _parseSpaced2 = _interopRequireDefault(_parseSpaced);

	var _Slice2 = _interopRequireDefault(_Slice);

	module.exports = (isVal, casedFromFun, tokens) => {
		var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const block = _beforeAndBlock2[1];

		let opCased;
		if (casedFromFun) {
			(0, _context.checkEmpty)(before, 'Can\'t make focus — is implicitly provided as first argument.');
			opCased = null;
		} else opCased = (0, _util.opIf)(!before.isEmpty(), () => _MsAst.AssignSingle.focus(before.loc, (0, _parse.parseExpr)(before)));

		const lastLine = _Slice2.default.group(block.last());

		var _ref = (0, _Token.isKeyword)(_Token.KW_Else, lastLine.head()) ? [block.rtail(), (isVal ? _parseBlock.justBlockVal : _parseBlock.justBlockDo)(_Token.KW_Else, lastLine.tail())] : [block, null];

		var _ref2 = _slicedToArray(_ref, 2);

		const partLines = _ref2[0];
		const opElse = _ref2[1];

		const parts = partLines.mapSlices(line => parseCaseLine(isVal, line));
		_context.context.check(parts.length > 0, tokens.loc, () => `Must have at least 1 non-${ (0, _CompileError.code)('else') } test.`);

		return new (isVal ? _MsAst.CaseVal : _MsAst.CaseDo)(tokens.loc, opCased, parts, opElse);
	};

	const parseCaseLine = (isVal, line) => {
		var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(line);

		var _beforeAndBlock32 = _slicedToArray(_beforeAndBlock3, 2);

		const before = _beforeAndBlock32[0];
		const block = _beforeAndBlock32[1];

		const test = parseCaseTest(before);
		const result = (isVal ? _parseBlock.parseBlockVal : _parseBlock.parseBlockDo)(block);
		return new (isVal ? _MsAst.CaseValPart : _MsAst.CaseDoPart)(line.loc, test, result);
	},
	      parseCaseTest = tokens => {
		const first = tokens.head();
		// Pattern match starts with type test and is followed by local declares.
		// E.g., `:Some val`
		if ((0, _Token.isGroup)(_Token.G_Space, first) && tokens.size() > 1) {
			const ft = _Slice2.default.group(first);
			if ((0, _Token.isKeyword)(_Token.KW_Type, ft.head())) {
				const type = (0, _parseSpaced2.default)(ft.tail());
				const locals = (0, _parseLocalDeclares2.default)(tokens.tail());
				return new _MsAst.Pattern(first.loc, type, locals, _MsAst.LocalAccess.focus(tokens.loc));
			}
		}
		return (0, _parse.parseExpr)(tokens);
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlQ2FzZS5qcyIsInByaXZhdGUvcGFyc2UvcGFyc2VDYXNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O2tCQ1llLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxNQUFNLEtBQUs7d0JBQ3ZCLGdCQU5qQixjQUFjLEVBTWtCLE1BQU0sQ0FBQzs7OztRQUF2QyxNQUFNO1FBQUUsS0FBSzs7QUFFcEIsTUFBSSxPQUFPLENBQUE7QUFDWCxNQUFJLFlBQVksRUFBRTtBQUNqQixnQkFaTSxVQUFVLEVBWUwsTUFBTSxFQUFFLCtEQUErRCxDQUFDLENBQUE7QUFDbkYsVUFBTyxHQUFHLElBQUksQ0FBQTtHQUNkLE1BQ0EsT0FBTyxHQUFHLFVBaEJKLElBQUksRUFnQkssQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxPQW5CbEMsWUFBWSxDQW1CbUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsV0FkakUsU0FBUyxFQWNrRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7O0FBRTNGLFFBQU0sUUFBUSxHQUFHLGdCQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTs7YUFDZCxXQXBCSCxTQUFTLFNBQUUsT0FBTyxFQW9CSSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsR0FDOUQsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLGVBakIwQyxZQUFZLGVBQXpCLFdBQVcsQ0FpQlgsUUFyQmhCLE9BQU8sRUFxQm9CLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQy9FLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQzs7OztRQUZQLFNBQVM7UUFBRSxNQUFNOztBQUl4QixRQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSxhQUFhLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7QUFDckUsV0F2Qm1CLE9BQU8sQ0F1QmxCLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQzNDLENBQUMseUJBQXlCLEdBQUUsa0JBN0J0QixJQUFJLEVBNkJ1QixNQUFNLENBQUMsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFBOztBQUVsRCxTQUFPLEtBQUssS0FBSyxVQTlCd0IsT0FBTyxVQUEzQixNQUFNLENBOEJTLENBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0VBQ3pFOztBQUVELE9BQ0MsYUFBYSxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksS0FBSzt5QkFDUixnQkE3QmxCLGNBQWMsRUE2Qm1CLElBQUksQ0FBQzs7OztRQUFyQyxNQUFNO1FBQUUsS0FBSzs7QUFDcEIsUUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2xDLFFBQU0sTUFBTSxHQUFHLENBQUMsS0FBSyxlQS9CZSxhQUFhLGVBQTNCLFlBQVksQ0ErQmtCLENBQUUsS0FBSyxDQUFDLENBQUE7QUFDNUQsU0FBTyxLQUFLLEtBQUssVUF0Q2dDLFdBQVcsVUFBaEMsVUFBVSxDQXNDTSxDQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0VBQ3JFO09BRUQsYUFBYSxHQUFHLE1BQU0sSUFBSTtBQUN6QixRQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUE7OztBQUczQixNQUFJLFdBM0NXLE9BQU8sU0FBaEIsT0FBTyxFQTJDUSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFO0FBQ2pELFNBQU0sRUFBRSxHQUFHLGdCQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUM3QixPQUFJLFdBN0NtQixTQUFTLFNBQVcsT0FBTyxFQTZDM0IsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUU7QUFDbEMsVUFBTSxJQUFJLEdBQUcsMkJBQVksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7QUFDbkMsVUFBTSxNQUFNLEdBQUcsa0NBQW1CLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQ2hELFdBQU8sV0FsRGtFLE9BQU8sQ0FrRDdELEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQWxEZ0IsV0FBVyxDQWtEZixLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDMUU7R0FDRDtBQUNELFNBQU8sV0FoREQsU0FBUyxFQWdERSxNQUFNLENBQUMsQ0FBQTtFQUN4QixDQUFBIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvcGFyc2VDYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7QXNzaWduU2luZ2xlLCBDYXNlRG8sIENhc2VEb1BhcnQsIENhc2VWYWwsIENhc2VWYWxQYXJ0LCBMb2NhbEFjY2VzcywgUGF0dGVyblxuXHR9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtHX1NwYWNlLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtXX0Vsc2UsIEtXX1R5cGV9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtvcElmfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtjaGVja0VtcHR5LCBjb250ZXh0fSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge3BhcnNlRXhwcn0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQge2JlZm9yZUFuZEJsb2NrLCBwYXJzZUJsb2NrRG8sIHBhcnNlQmxvY2tWYWwsIGp1c3RCbG9ja0RvLCBqdXN0QmxvY2tWYWx9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZUxvY2FsRGVjbGFyZXMgZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5pbXBvcnQgcGFyc2VTcGFjZWQgZnJvbSAnLi9wYXJzZVNwYWNlZCdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG5leHBvcnQgZGVmYXVsdCAoaXNWYWwsIGNhc2VkRnJvbUZ1biwgdG9rZW5zKSA9PiB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2VucylcblxuXHRsZXQgb3BDYXNlZFxuXHRpZiAoY2FzZWRGcm9tRnVuKSB7XG5cdFx0Y2hlY2tFbXB0eShiZWZvcmUsICdDYW5cXCd0IG1ha2UgZm9jdXMg4oCUIGlzIGltcGxpY2l0bHkgcHJvdmlkZWQgYXMgZmlyc3QgYXJndW1lbnQuJylcblx0XHRvcENhc2VkID0gbnVsbFxuXHR9IGVsc2Vcblx0XHRvcENhc2VkID0gb3BJZighYmVmb3JlLmlzRW1wdHkoKSwgKCkgPT4gQXNzaWduU2luZ2xlLmZvY3VzKGJlZm9yZS5sb2MsIHBhcnNlRXhwcihiZWZvcmUpKSlcblxuXHRjb25zdCBsYXN0TGluZSA9IFNsaWNlLmdyb3VwKGJsb2NrLmxhc3QoKSlcblx0Y29uc3QgW3BhcnRMaW5lcywgb3BFbHNlXSA9IGlzS2V5d29yZChLV19FbHNlLCBsYXN0TGluZS5oZWFkKCkpID9cblx0XHRbYmxvY2sucnRhaWwoKSwgKGlzVmFsID8ganVzdEJsb2NrVmFsIDoganVzdEJsb2NrRG8pKEtXX0Vsc2UsIGxhc3RMaW5lLnRhaWwoKSldIDpcblx0XHRbYmxvY2ssIG51bGxdXG5cblx0Y29uc3QgcGFydHMgPSBwYXJ0TGluZXMubWFwU2xpY2VzKGxpbmUgPT4gcGFyc2VDYXNlTGluZShpc1ZhbCwgbGluZSkpXG5cdGNvbnRleHQuY2hlY2socGFydHMubGVuZ3RoID4gMCwgdG9rZW5zLmxvYywgKCkgPT5cblx0XHRgTXVzdCBoYXZlIGF0IGxlYXN0IDEgbm9uLSR7Y29kZSgnZWxzZScpfSB0ZXN0LmApXG5cblx0cmV0dXJuIG5ldyAoaXNWYWwgPyBDYXNlVmFsIDogQ2FzZURvKSh0b2tlbnMubG9jLCBvcENhc2VkLCBwYXJ0cywgb3BFbHNlKVxufVxuXG5jb25zdFxuXHRwYXJzZUNhc2VMaW5lID0gKGlzVmFsLCBsaW5lKSA9PiB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sobGluZSlcblx0XHRjb25zdCB0ZXN0ID0gcGFyc2VDYXNlVGVzdChiZWZvcmUpXG5cdFx0Y29uc3QgcmVzdWx0ID0gKGlzVmFsID8gcGFyc2VCbG9ja1ZhbCA6IHBhcnNlQmxvY2tEbykoYmxvY2spXG5cdFx0cmV0dXJuIG5ldyAoaXNWYWwgPyBDYXNlVmFsUGFydCA6IENhc2VEb1BhcnQpKGxpbmUubG9jLCB0ZXN0LCByZXN1bHQpXG5cdH0sXG5cblx0cGFyc2VDYXNlVGVzdCA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgZmlyc3QgPSB0b2tlbnMuaGVhZCgpXG5cdFx0Ly8gUGF0dGVybiBtYXRjaCBzdGFydHMgd2l0aCB0eXBlIHRlc3QgYW5kIGlzIGZvbGxvd2VkIGJ5IGxvY2FsIGRlY2xhcmVzLlxuXHRcdC8vIEUuZy4sIGA6U29tZSB2YWxgXG5cdFx0aWYgKGlzR3JvdXAoR19TcGFjZSwgZmlyc3QpICYmIHRva2Vucy5zaXplKCkgPiAxKSB7XG5cdFx0XHRjb25zdCBmdCA9IFNsaWNlLmdyb3VwKGZpcnN0KVxuXHRcdFx0aWYgKGlzS2V5d29yZChLV19UeXBlLCBmdC5oZWFkKCkpKSB7XG5cdFx0XHRcdGNvbnN0IHR5cGUgPSBwYXJzZVNwYWNlZChmdC50YWlsKCkpXG5cdFx0XHRcdGNvbnN0IGxvY2FscyA9IHBhcnNlTG9jYWxEZWNsYXJlcyh0b2tlbnMudGFpbCgpKVxuXHRcdFx0XHRyZXR1cm4gbmV3IFBhdHRlcm4oZmlyc3QubG9jLCB0eXBlLCBsb2NhbHMsIExvY2FsQWNjZXNzLmZvY3VzKHRva2Vucy5sb2MpKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcGFyc2VFeHByKHRva2Vucylcblx0fSJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

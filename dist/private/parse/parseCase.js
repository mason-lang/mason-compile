(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', '../../CompileError', '../context', '../MsAst', '../Token', '../util', './checks', './parse*', './parseBlock', './parseLocalDeclares', './parseSpaced', './Slice'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('../../CompileError'), require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parse*'), require('./parseBlock'), require('./parseLocalDeclares'), require('./parseSpaced'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.CompileError, global.context, global.MsAst, global.Token, global.util, global.checks, global.parse, global.parseBlock, global.parseLocalDeclares, global.parseSpaced, global.Slice);
		global.parseCase = mod.exports;
	}
})(this, function (exports, module, _CompileError, _context, _MsAst, _Token, _util, _checks, _parse, _parseBlock, _parseLocalDeclares, _parseSpaced, _Slice) {
	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	module.exports = parseCase;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseLocalDeclares2 = _interopRequireDefault(_parseLocalDeclares);

	var _parseSpaced2 = _interopRequireDefault(_parseSpaced);

	var _Slice2 = _interopRequireDefault(_Slice);

	/** Parse a {@link CaseDo} or {@link CaseVal}. */

	function parseCase(isVal, casedFromFun, tokens) {
		const parseJustBlock = isVal ? _parseBlock.parseJustBlockVal : _parseBlock.parseJustBlockDo,
		      Case = isVal ? _MsAst.CaseVal : _MsAst.CaseDo;

		var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const block = _beforeAndBlock2[1];

		let opCased;
		if (casedFromFun) {
			(0, _checks.checkEmpty)(before, 'Can\'t make focus — is implicitly provided as first argument.');
			opCased = null;
		} else opCased = (0, _util.opIf)(!before.isEmpty(), () => _MsAst.AssignSingle.focus(before.loc, (0, _parse.parseExpr)(before)));

		const lastLine = _Slice2.default.group(block.last());

		var _ref = (0, _Token.isKeyword)(_Token.Keywords.Else, lastLine.head()) ? [block.rtail(), parseJustBlock(_Token.Keywords.Else, lastLine.tail())] : [block, null];

		var _ref2 = _slicedToArray(_ref, 2);

		const partLines = _ref2[0];
		const opElse = _ref2[1];

		const parts = partLines.mapSlices(line => parseCaseLine(isVal, line));
		(0, _context.check)(parts.length > 0, tokens.loc, () => `Must have at least 1 non-${ (0, _CompileError.code)('else') } test.`);

		return new Case(tokens.loc, opCased, parts, opElse);
	}

	function parseCaseLine(isVal, line) {
		var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(line);

		var _beforeAndBlock32 = _slicedToArray(_beforeAndBlock3, 2);

		const before = _beforeAndBlock32[0];
		const block = _beforeAndBlock32[1];

		const test = parseCaseTest(before);
		const result = (isVal ? _parseBlock.parseBlockVal : _parseBlock.parseBlockDo)(block);
		return new (isVal ? _MsAst.CaseValPart : _MsAst.CaseDoPart)(line.loc, test, result);
	}

	function parseCaseTest(tokens) {
		const first = tokens.head();
		// Pattern match starts with type test and is followed by local declares.
		// E.g., `:Some val`
		if ((0, _Token.isGroup)(_Token.Groups.Space, first) && tokens.size() > 1) {
			const ft = _Slice2.default.group(first);
			if ((0, _Token.isKeyword)(_Token.Keywords.Type, ft.head())) {
				const type = (0, _parseSpaced2.default)(ft.tail());
				const locals = (0, _parseLocalDeclares2.default)(tokens.tail());
				return new _MsAst.Pattern(tokens.loc, type, locals);
			}
		}
		return (0, _parse.parseExpr)(tokens);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQ2FzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztrQkFjd0IsU0FBUzs7Ozs7Ozs7Ozs7O0FBQWxCLFVBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFO0FBQzlELFFBQ0MsY0FBYyxHQUFHLEtBQUssZUFUK0MsaUJBQWlCLGVBQW5DLGdCQUFnQixBQVNOO1FBQzdELElBQUksR0FBRyxLQUFLLFVBZjRCLE9BQU8sVUFBM0IsTUFBTSxBQWVLLENBQUE7O3dCQUVSLGdCQVpqQixjQUFjLEVBWWtCLE1BQU0sQ0FBQzs7OztRQUF2QyxNQUFNO1FBQUUsS0FBSzs7QUFFcEIsTUFBSSxPQUFPLENBQUE7QUFDWCxNQUFJLFlBQVksRUFBRTtBQUNqQixlQWxCTSxVQUFVLEVBa0JMLE1BQU0sRUFBRSwrREFBK0QsQ0FBQyxDQUFBO0FBQ25GLFVBQU8sR0FBRyxJQUFJLENBQUE7R0FDZCxNQUNBLE9BQU8sR0FBRyxVQXRCSixJQUFJLEVBc0JLLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sT0F4QmxDLFlBQVksQ0F3Qm1DLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLFdBcEJqRSxTQUFTLEVBb0JrRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7O0FBRTNGLFFBQU0sUUFBUSxHQUFHLGdCQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTs7YUFDZCxXQTFCSixTQUFTLEVBMEJLLE9BMUJILFFBQVEsQ0EwQkksSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUNwRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxjQUFjLENBQUMsT0EzQkcsUUFBUSxDQTJCRixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FDL0QsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDOzs7O1FBRlAsU0FBUztRQUFFLE1BQU07O0FBSXhCLFFBQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLGFBQWEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUNyRSxlQWpDTyxLQUFLLEVBaUNOLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFDbkMsQ0FBQyx5QkFBeUIsR0FBRSxrQkFuQ3RCLElBQUksRUFtQ3VCLE1BQU0sQ0FBQyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7O0FBRWxELFNBQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0VBQ25EOztBQUVELFVBQVMsYUFBYSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUU7eUJBQ1gsZ0JBbENqQixjQUFjLEVBa0NrQixJQUFJLENBQUM7Ozs7UUFBckMsTUFBTTtRQUFFLEtBQUs7O0FBQ3BCLFFBQU0sSUFBSSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNsQyxRQUFNLE1BQU0sR0FBRyxDQUFDLEtBQUssZUFwQ2dCLGFBQWEsZUFBM0IsWUFBWSxDQW9DaUIsQ0FBRSxLQUFLLENBQUMsQ0FBQTtBQUM1RCxTQUFPLEtBQUssS0FBSyxVQTFDaUMsV0FBVyxVQUFoQyxVQUFVLENBMENLLENBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7RUFDckU7O0FBRUQsVUFBUyxhQUFhLENBQUMsTUFBTSxFQUFFO0FBQzlCLFFBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQTs7O0FBRzNCLE1BQUksV0FoRFcsT0FBTyxFQWdEVixPQWhETCxNQUFNLENBZ0RNLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFO0FBQ3RELFNBQU0sRUFBRSxHQUFHLGdCQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUM3QixPQUFJLFdBbERtQixTQUFTLEVBa0RsQixPQWxEb0IsUUFBUSxDQWtEbkIsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFO0FBQ3hDLFVBQU0sSUFBSSxHQUFHLDJCQUFZLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQ25DLFVBQU0sTUFBTSxHQUFHLGtDQUFtQixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUNoRCxXQUFPLFdBdERzRCxPQUFPLENBc0RqRCxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUM1QztHQUNEO0FBQ0QsU0FBTyxXQXJEQSxTQUFTLEVBcURDLE1BQU0sQ0FBQyxDQUFBO0VBQ3hCIiwiZmlsZSI6InBhcnNlQ2FzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVja30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7QXNzaWduU2luZ2xlLCBDYXNlRG8sIENhc2VEb1BhcnQsIENhc2VWYWwsIENhc2VWYWxQYXJ0LCBQYXR0ZXJufSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXBzLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7b3BJZn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tFbXB0eX0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge3BhcnNlRXhwcn0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQge2JlZm9yZUFuZEJsb2NrLCBwYXJzZUJsb2NrRG8sIHBhcnNlQmxvY2tWYWwsIHBhcnNlSnVzdEJsb2NrRG8sIHBhcnNlSnVzdEJsb2NrVmFsXG5cdH0gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlTG9jYWxEZWNsYXJlcyBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcbmltcG9ydCBwYXJzZVNwYWNlZCBmcm9tICcuL3BhcnNlU3BhY2VkJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8qKiBQYXJzZSBhIHtAbGluayBDYXNlRG99IG9yIHtAbGluayBDYXNlVmFsfS4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlQ2FzZShpc1ZhbCwgY2FzZWRGcm9tRnVuLCB0b2tlbnMpIHtcblx0Y29uc3Rcblx0XHRwYXJzZUp1c3RCbG9jayA9IGlzVmFsID8gcGFyc2VKdXN0QmxvY2tWYWwgOiBwYXJzZUp1c3RCbG9ja0RvLFxuXHRcdENhc2UgPSBpc1ZhbCA/IENhc2VWYWwgOiBDYXNlRG9cblxuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cblx0bGV0IG9wQ2FzZWRcblx0aWYgKGNhc2VkRnJvbUZ1bikge1xuXHRcdGNoZWNrRW1wdHkoYmVmb3JlLCAnQ2FuXFwndCBtYWtlIGZvY3VzIOKAlCBpcyBpbXBsaWNpdGx5IHByb3ZpZGVkIGFzIGZpcnN0IGFyZ3VtZW50LicpXG5cdFx0b3BDYXNlZCA9IG51bGxcblx0fSBlbHNlXG5cdFx0b3BDYXNlZCA9IG9wSWYoIWJlZm9yZS5pc0VtcHR5KCksICgpID0+IEFzc2lnblNpbmdsZS5mb2N1cyhiZWZvcmUubG9jLCBwYXJzZUV4cHIoYmVmb3JlKSkpXG5cblx0Y29uc3QgbGFzdExpbmUgPSBTbGljZS5ncm91cChibG9jay5sYXN0KCkpXG5cdGNvbnN0IFtwYXJ0TGluZXMsIG9wRWxzZV0gPSBpc0tleXdvcmQoS2V5d29yZHMuRWxzZSwgbGFzdExpbmUuaGVhZCgpKSA/XG5cdFx0W2Jsb2NrLnJ0YWlsKCksIHBhcnNlSnVzdEJsb2NrKEtleXdvcmRzLkVsc2UsIGxhc3RMaW5lLnRhaWwoKSldIDpcblx0XHRbYmxvY2ssIG51bGxdXG5cblx0Y29uc3QgcGFydHMgPSBwYXJ0TGluZXMubWFwU2xpY2VzKGxpbmUgPT4gcGFyc2VDYXNlTGluZShpc1ZhbCwgbGluZSkpXG5cdGNoZWNrKHBhcnRzLmxlbmd0aCA+IDAsIHRva2Vucy5sb2MsICgpID0+XG5cdFx0YE11c3QgaGF2ZSBhdCBsZWFzdCAxIG5vbi0ke2NvZGUoJ2Vsc2UnKX0gdGVzdC5gKVxuXG5cdHJldHVybiBuZXcgQ2FzZSh0b2tlbnMubG9jLCBvcENhc2VkLCBwYXJ0cywgb3BFbHNlKVxufVxuXG5mdW5jdGlvbiBwYXJzZUNhc2VMaW5lKGlzVmFsLCBsaW5lKSB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKGxpbmUpXG5cdGNvbnN0IHRlc3QgPSBwYXJzZUNhc2VUZXN0KGJlZm9yZSlcblx0Y29uc3QgcmVzdWx0ID0gKGlzVmFsID8gcGFyc2VCbG9ja1ZhbCA6IHBhcnNlQmxvY2tEbykoYmxvY2spXG5cdHJldHVybiBuZXcgKGlzVmFsID8gQ2FzZVZhbFBhcnQgOiBDYXNlRG9QYXJ0KShsaW5lLmxvYywgdGVzdCwgcmVzdWx0KVxufVxuXG5mdW5jdGlvbiBwYXJzZUNhc2VUZXN0KHRva2Vucykge1xuXHRjb25zdCBmaXJzdCA9IHRva2Vucy5oZWFkKClcblx0Ly8gUGF0dGVybiBtYXRjaCBzdGFydHMgd2l0aCB0eXBlIHRlc3QgYW5kIGlzIGZvbGxvd2VkIGJ5IGxvY2FsIGRlY2xhcmVzLlxuXHQvLyBFLmcuLCBgOlNvbWUgdmFsYFxuXHRpZiAoaXNHcm91cChHcm91cHMuU3BhY2UsIGZpcnN0KSAmJiB0b2tlbnMuc2l6ZSgpID4gMSkge1xuXHRcdGNvbnN0IGZ0ID0gU2xpY2UuZ3JvdXAoZmlyc3QpXG5cdFx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5UeXBlLCBmdC5oZWFkKCkpKSB7XG5cdFx0XHRjb25zdCB0eXBlID0gcGFyc2VTcGFjZWQoZnQudGFpbCgpKVxuXHRcdFx0Y29uc3QgbG9jYWxzID0gcGFyc2VMb2NhbERlY2xhcmVzKHRva2Vucy50YWlsKCkpXG5cdFx0XHRyZXR1cm4gbmV3IFBhdHRlcm4odG9rZW5zLmxvYywgdHlwZSwgbG9jYWxzKVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gcGFyc2VFeHByKHRva2Vucylcbn1cbiJdfQ==
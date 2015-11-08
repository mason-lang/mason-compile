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
	exports.parseForBag = parseForBag;
	exports.parseFor = parseFor;

	var _parseBlock2 = _interopRequireDefault(_parseBlock);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	function parseForBag(tokens) {
		var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const lines = _beforeAndBlock2[1];
		return new _MsAst.ForBag(tokens.loc, parseOpIteratee(before), (0, _parseBlock2.default)(lines));
	}

	function parseFor(tokens) {
		var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock4 = _slicedToArray(_beforeAndBlock3, 2);

		const before = _beforeAndBlock4[0];
		const block = _beforeAndBlock4[1];
		return new _MsAst.For(tokens.loc, parseOpIteratee(before), (0, _parseBlock2.default)(block));
	}

	function parseOpIteratee(tokens) {
		return (0, _util.opIf)(!tokens.isEmpty(), () => {
			var _ifElse = (0, _util.ifElse)(tokens.opSplitOnce(_ => (0, _Token.isKeyword)(_Token.Keywords.Of, _)), _ref => {
				let before = _ref.before;
				let after = _ref.after;
				(0, _context.check)(before.size() === 1, before.loc, 'TODO: pattern in for');
				return [(0, _parseLocalDeclares.parseLocalDeclaresJustNames)(before)[0], (0, _parse.parseExpr)(after)];
			}, () => [_MsAst.LocalDeclare.focus(tokens.loc), (0, _parse.parseExpr)(tokens)]);

			var _ifElse2 = _slicedToArray(_ifElse, 2);

			const element = _ifElse2[0];
			const bag = _ifElse2[1];
			return new _MsAst.Iteratee(tokens.loc, element, bag);
		});
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRm9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQVdnQixXQUFXLEdBQVgsV0FBVztTQU1YLFFBQVEsR0FBUixRQUFROzs7Ozs7OztVQU5SLFdBQVc7Ozs7Ozs7Ozs7VUFNWCxRQUFRIiwiZmlsZSI6InBhcnNlRm9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVja30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7Rm9yLCBGb3JCYWcsIEl0ZXJhdGVlLCBMb2NhbERlY2xhcmV9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aWZFbHNlLCBvcElmfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtwYXJzZUV4cHJ9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IHBhcnNlQmxvY2ssIHtiZWZvcmVBbmRCbG9ja30gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHtwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXN9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuXG5cbi8vIFRPRE86IC0+IG91dC10eXBlXG4vKiogUGFyc2UgYSB7QGxpbmsgRm9yQmFnfS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUZvckJhZyh0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgbGluZXNdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRyZXR1cm4gbmV3IEZvckJhZyh0b2tlbnMubG9jLCBwYXJzZU9wSXRlcmF0ZWUoYmVmb3JlKSwgcGFyc2VCbG9jayhsaW5lcykpXG59XG5cbi8qKiBQYXJzZSBhIHtAbGluayBGb3J9LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRm9yKHRva2Vucykge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdHJldHVybiBuZXcgRm9yKHRva2Vucy5sb2MsIHBhcnNlT3BJdGVyYXRlZShiZWZvcmUpLCBwYXJzZUJsb2NrKGJsb2NrKSlcbn1cblxuZnVuY3Rpb24gcGFyc2VPcEl0ZXJhdGVlKHRva2Vucykge1xuXHRyZXR1cm4gb3BJZighdG9rZW5zLmlzRW1wdHkoKSwgKCkgPT4ge1xuXHRcdGNvbnN0IFtlbGVtZW50LCBiYWddID1cblx0XHRcdGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2UoXyA9PiBpc0tleXdvcmQoS2V5d29yZHMuT2YsIF8pKSxcblx0XHRcdFx0KHtiZWZvcmUsIGFmdGVyfSkgPT4ge1xuXHRcdFx0XHRcdGNoZWNrKGJlZm9yZS5zaXplKCkgPT09IDEsIGJlZm9yZS5sb2MsICdUT0RPOiBwYXR0ZXJuIGluIGZvcicpXG5cdFx0XHRcdFx0cmV0dXJuIFtwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMoYmVmb3JlKVswXSwgcGFyc2VFeHByKGFmdGVyKV1cblx0XHRcdFx0fSxcblx0XHRcdFx0KCkgPT4gW0xvY2FsRGVjbGFyZS5mb2N1cyh0b2tlbnMubG9jKSwgcGFyc2VFeHByKHRva2VucyldKVxuXHRcdHJldHVybiBuZXcgSXRlcmF0ZWUodG9rZW5zLmxvYywgZWxlbWVudCwgYmFnKVxuXHR9KVxufVxuIl19
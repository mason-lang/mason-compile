(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', '../util', './parse*', './parseBlock', './parseLocalDeclares'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./parse*'), require('./parseBlock'), require('./parseLocalDeclares'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.util, global.parse, global.parseBlock, global.parseLocalDeclares);
		global.parseFor = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _util, _parse, _parseBlock, _parseLocalDeclares) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	exports.parseForDo = parseForDo;
	exports.parseForVal = parseForVal;
	exports.parseForBag = parseForBag;

	/** Parse a {@link ForDo}. */

	function parseForDo(tokens) {
		return parseFor(_MsAst.ForDo, tokens);
	}

	/** Parse a {@link ForVal}. */

	function parseForVal(tokens) {
		return parseFor(_MsAst.ForVal, tokens);
	}

	// TODO: -> out-type
	/** Parse a {@link ForBag}. */

	function parseForBag(tokens) {
		var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const lines = _beforeAndBlock2[1];

		const block = (0, _parseBlock.parseBlockDo)(lines);
		// TODO: Better way?
		if (block.lines.length === 1 && block.lines[0] instanceof _MsAst.Val) block.lines[0] = new _MsAst.BagEntry(block.lines[0].loc, block.lines[0]);
		return new _MsAst.ForBag(tokens.loc, parseOpIteratee(before), block);
	}

	function parseFor(ctr, tokens) {
		var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock32 = _slicedToArray(_beforeAndBlock3, 2);

		const before = _beforeAndBlock32[0];
		const block = _beforeAndBlock32[1];

		return new ctr(tokens.loc, parseOpIteratee(before), (0, _parseBlock.parseBlockDo)(block));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRm9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVNPLFVBQVMsVUFBVSxDQUFDLE1BQU0sRUFBRTtBQUNsQyxTQUFPLFFBQVEsUUFURSxLQUFLLEVBU0MsTUFBTSxDQUFDLENBQUE7RUFDOUI7Ozs7QUFHTSxVQUFTLFdBQVcsQ0FBQyxNQUFNLEVBQUU7QUFDbkMsU0FBTyxRQUFRLFFBZGlCLE1BQU0sRUFjZCxNQUFNLENBQUMsQ0FBQTtFQUMvQjs7Ozs7QUFJTSxVQUFTLFdBQVcsQ0FBQyxNQUFNLEVBQUU7d0JBQ1gsZ0JBaEJqQixjQUFjLEVBZ0JrQixNQUFNLENBQUM7Ozs7UUFBdkMsTUFBTTtRQUFFLEtBQUs7O0FBQ3BCLFFBQU0sS0FBSyxHQUFHLGdCQWpCUyxZQUFZLEVBaUJSLEtBQUssQ0FBQyxDQUFBOztBQUVqQyxNQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxtQkF2QmtCLEdBQUcsQUF1Qk4sRUFDNUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxXQXhCWCxRQUFRLENBd0JnQixLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDbEUsU0FBTyxXQXpCaUIsTUFBTSxDQXlCWixNQUFNLENBQUMsR0FBRyxFQUFFLGVBQWUsQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQTtFQUM3RDs7QUFFRCxVQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFO3lCQUNOLGdCQXpCakIsY0FBYyxFQXlCa0IsTUFBTSxDQUFDOzs7O1FBQXZDLE1BQU07UUFBRSxLQUFLOztBQUNwQixTQUFPLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsZUFBZSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGdCQTFCN0IsWUFBWSxFQTBCOEIsS0FBSyxDQUFDLENBQUMsQ0FBQTtFQUN4RTs7QUFFRCxVQUFTLGVBQWUsQ0FBQyxNQUFNLEVBQUU7QUFDaEMsU0FBTyxVQWhDUSxJQUFJLEVBZ0NQLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU07aUJBRW5DLFVBbENLLE1BQU0sRUFrQ0osTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksV0FuQzFCLFNBQVMsRUFtQzJCLE9BbkN6QixRQUFRLENBbUMwQixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDeEQsQUFBQyxJQUFlLElBQUs7UUFBbkIsTUFBTSxHQUFQLElBQWUsQ0FBZCxNQUFNO1FBQUUsS0FBSyxHQUFkLElBQWUsQ0FBTixLQUFLOztBQUNkLGlCQXZDRyxLQUFLLEVBdUNGLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxzQkFBc0IsQ0FBQyxDQUFBO0FBQzlELFdBQU8sQ0FBQyx3QkFsQ0wsMkJBQTJCLEVBa0NNLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBcEM3QyxTQUFTLEVBb0M4QyxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBQ2pFLEVBQ0QsTUFBTSxDQUFDLE9BekN3QyxZQUFZLENBeUN2QyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFdBdENuQyxTQUFTLEVBc0NvQyxNQUFNLENBQUMsQ0FBQyxDQUFDOzs7O1NBTnJELE9BQU87U0FBRSxHQUFHOztBQU9uQixVQUFPLFdBMUNnQyxRQUFRLENBMEMzQixNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQTtHQUM3QyxDQUFDLENBQUE7RUFDRiIsImZpbGUiOiJwYXJzZUZvci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0JhZ0VudHJ5LCBGb3JEbywgRm9yQmFnLCBGb3JWYWwsIEl0ZXJhdGVlLCBMb2NhbERlY2xhcmUsIFZhbH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2lzS2V5d29yZCwgS2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtpZkVsc2UsIG9wSWZ9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge3BhcnNlRXhwcn0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQge2JlZm9yZUFuZEJsb2NrLCBwYXJzZUJsb2NrRG99IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCB7cGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzfSBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcblxuLyoqIFBhcnNlIGEge0BsaW5rIEZvckRvfS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUZvckRvKHRva2Vucykge1xuXHRyZXR1cm4gcGFyc2VGb3IoRm9yRG8sIHRva2Vucylcbn1cblxuLyoqIFBhcnNlIGEge0BsaW5rIEZvclZhbH0uICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VGb3JWYWwodG9rZW5zKSB7XG5cdHJldHVybiBwYXJzZUZvcihGb3JWYWwsIHRva2Vucylcbn1cblxuLy8gVE9ETzogLT4gb3V0LXR5cGVcbi8qKiBQYXJzZSBhIHtAbGluayBGb3JCYWd9LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRm9yQmFnKHRva2Vucykge1xuXHRjb25zdCBbYmVmb3JlLCBsaW5lc10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdGNvbnN0IGJsb2NrID0gcGFyc2VCbG9ja0RvKGxpbmVzKVxuXHQvLyBUT0RPOiBCZXR0ZXIgd2F5P1xuXHRpZiAoYmxvY2subGluZXMubGVuZ3RoID09PSAxICYmIGJsb2NrLmxpbmVzWzBdIGluc3RhbmNlb2YgVmFsKVxuXHRcdGJsb2NrLmxpbmVzWzBdID0gbmV3IEJhZ0VudHJ5KGJsb2NrLmxpbmVzWzBdLmxvYywgYmxvY2subGluZXNbMF0pXG5cdHJldHVybiBuZXcgRm9yQmFnKHRva2Vucy5sb2MsIHBhcnNlT3BJdGVyYXRlZShiZWZvcmUpLCBibG9jaylcbn1cblxuZnVuY3Rpb24gcGFyc2VGb3IoY3RyLCB0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRyZXR1cm4gbmV3IGN0cih0b2tlbnMubG9jLCBwYXJzZU9wSXRlcmF0ZWUoYmVmb3JlKSwgcGFyc2VCbG9ja0RvKGJsb2NrKSlcbn1cblxuZnVuY3Rpb24gcGFyc2VPcEl0ZXJhdGVlKHRva2Vucykge1xuXHRyZXR1cm4gb3BJZighdG9rZW5zLmlzRW1wdHkoKSwgKCkgPT4ge1xuXHRcdGNvbnN0IFtlbGVtZW50LCBiYWddID1cblx0XHRcdGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2UoXyA9PiBpc0tleXdvcmQoS2V5d29yZHMuT2YsIF8pKSxcblx0XHRcdFx0KHtiZWZvcmUsIGFmdGVyfSkgPT4ge1xuXHRcdFx0XHRcdGNoZWNrKGJlZm9yZS5zaXplKCkgPT09IDEsIGJlZm9yZS5sb2MsICdUT0RPOiBwYXR0ZXJuIGluIGZvcicpXG5cdFx0XHRcdFx0cmV0dXJuIFtwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMoYmVmb3JlKVswXSwgcGFyc2VFeHByKGFmdGVyKV1cblx0XHRcdFx0fSxcblx0XHRcdFx0KCkgPT4gW0xvY2FsRGVjbGFyZS5mb2N1cyh0b2tlbnMubG9jKSwgcGFyc2VFeHByKHRva2VucyldKVxuXHRcdHJldHVybiBuZXcgSXRlcmF0ZWUodG9rZW5zLmxvYywgZWxlbWVudCwgYmFnKVxuXHR9KVxufVxuIl19
if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', '../MsAst', '../Token', '../util', './context', './parse*', './parseBlock', './parseLocalDeclares'], function (exports, _MsAst, _Token, _util, _context, _parse, _parseBlock, _parseLocalDeclares) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	const parseForDo = tokens => parseFor(_MsAst.ForDo, tokens),
	      parseForVal = tokens => parseFor(_MsAst.ForVal, tokens),
	     

	// TODO: -> out-type
	parseForBag = tokens => {
		var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const lines = _beforeAndBlock2[1];

		const block = (0, _parseBlock.parseBlockDo)(lines);
		// TODO: Better way?
		if (block.lines.length === 1 && block.lines[0] instanceof _MsAst.Val) block.lines[0] = new _MsAst.BagEntry(block.lines[0].loc, block.lines[0]);
		return new _MsAst.ForBag(tokens.loc, parseOpIteratee(before), block);
	};

	exports.parseForDo = parseForDo;
	exports.parseForVal = parseForVal;
	exports.parseForBag = parseForBag;
	const parseFor = (ctr, tokens) => {
		var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock32 = _slicedToArray(_beforeAndBlock3, 2);

		const before = _beforeAndBlock32[0];
		const block = _beforeAndBlock32[1];

		return new ctr(tokens.loc, parseOpIteratee(before), (0, _parseBlock.parseBlockDo)(block));
	},
	      parseOpIteratee = tokens => (0, _util.opIf)(!tokens.isEmpty(), () => {
		var _ifElse = (0, _util.ifElse)(tokens.opSplitOnceWhere(_ => (0, _Token.isKeyword)(_Token.KW_Of, _)), _ref => {
			let before = _ref.before;
			let after = _ref.after;

			_context.context.check(before.size() === 1, before.loc, 'TODO: pattern in for');
			return [(0, _parseLocalDeclares.parseLocalDeclaresJustNames)(before)[0], (0, _parse.parseExpr)(after)];
		}, () => [new _MsAst.LocalDeclareFocus(tokens.loc), (0, _parse.parseExpr)(tokens)]);

		var _ifElse2 = _slicedToArray(_ifElse, 2);

		const element = _ifElse2[0];
		const bag = _ifElse2[1];

		return new _MsAst.Iteratee(tokens.loc, element, bag);
	});
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlRm9yLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZUZvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDUU8sT0FDTixVQUFVLEdBQUcsTUFBTSxJQUNsQixRQUFRLFFBVlEsS0FBSyxFQVVMLE1BQU0sQ0FBQztPQUV4QixXQUFXLEdBQUcsTUFBTSxJQUNuQixRQUFRLFFBYnVCLE1BQU0sRUFhcEIsTUFBTSxDQUFDOzs7O0FBR3pCLFlBQVcsR0FBRyxNQUFNLElBQUk7d0JBQ0MsZ0JBWmxCLGNBQWMsRUFZbUIsTUFBTSxDQUFDOzs7O1FBQXZDLE1BQU07UUFBRSxLQUFLOztBQUNwQixRQUFNLEtBQUssR0FBRyxnQkFiUSxZQUFZLEVBYVAsS0FBSyxDQUFDLENBQUE7O0FBRWpDLE1BQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLG1CQXBCc0IsR0FBRyxBQW9CVixFQUM1RCxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBckJaLFFBQVEsQ0FxQmlCLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNsRSxTQUFPLFdBdEJnQixNQUFNLENBc0JYLE1BQU0sQ0FBQyxHQUFHLEVBQUUsZUFBZSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO0VBQzdELENBQUE7Ozs7O0FBRUYsT0FDQyxRQUFRLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxLQUFLO3lCQUNILGdCQXRCbEIsY0FBYyxFQXNCbUIsTUFBTSxDQUFDOzs7O1FBQXZDLE1BQU07UUFBRSxLQUFLOztBQUNwQixTQUFPLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsZUFBZSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGdCQXZCOUIsWUFBWSxFQXVCK0IsS0FBSyxDQUFDLENBQUMsQ0FBQTtFQUN4RTtPQUVELGVBQWUsR0FBRyxNQUFNLElBQ3ZCLFVBOUJjLElBQUksRUE4QmIsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTTtnQkFFNUIsVUFoQ0ksTUFBTSxFQWdDSCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLFdBakNoQyxTQUFTLFNBQUUsS0FBSyxFQWlDaUMsQ0FBQyxDQUFDLENBQUMsRUFDdkQsQUFBQyxJQUFlLElBQUs7T0FBbkIsTUFBTSxHQUFQLElBQWUsQ0FBZCxNQUFNO09BQUUsS0FBSyxHQUFkLElBQWUsQ0FBTixLQUFLOztBQUNkLFlBakNFLE9BQU8sQ0FpQ0QsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxzQkFBc0IsQ0FBQyxDQUFBO0FBQ3RFLFVBQU8sQ0FBQyx3QkEvQk4sMkJBQTJCLEVBK0JPLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBakM5QyxTQUFTLEVBaUMrQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0dBQ2pFLEVBQ0QsTUFBTSxDQUFDLFdBdkN1QyxpQkFBaUIsQ0F1Q2xDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxXQW5DdkMsU0FBUyxFQW1Dd0MsTUFBTSxDQUFDLENBQUMsQ0FBQzs7OztRQU54RCxPQUFPO1FBQUUsR0FBRzs7QUFPbkIsU0FBTyxXQXhDK0IsUUFBUSxDQXdDMUIsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUE7RUFDN0MsQ0FBQyxDQUFBIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvcGFyc2VGb3IuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7QmFnRW50cnksIEZvckRvLCBGb3JCYWcsIEZvclZhbCwgSXRlcmF0ZWUsIExvY2FsRGVjbGFyZUZvY3VzLCBWYWx9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtpc0tleXdvcmQsIEtXX09mfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aWZFbHNlLCBvcElmfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge3BhcnNlRXhwcn0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQge2JlZm9yZUFuZEJsb2NrLCBwYXJzZUJsb2NrRG99IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCB7cGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzfSBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcblxuZXhwb3J0IGNvbnN0XG5cdHBhcnNlRm9yRG8gPSB0b2tlbnMgPT5cblx0XHRwYXJzZUZvcihGb3JEbywgdG9rZW5zKSxcblxuXHRwYXJzZUZvclZhbCA9IHRva2VucyA9PlxuXHRcdHBhcnNlRm9yKEZvclZhbCwgdG9rZW5zKSxcblxuXHQvLyBUT0RPOiAtPiBvdXQtdHlwZVxuXHRwYXJzZUZvckJhZyA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgbGluZXNdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRcdGNvbnN0IGJsb2NrID0gcGFyc2VCbG9ja0RvKGxpbmVzKVxuXHRcdC8vIFRPRE86IEJldHRlciB3YXk/XG5cdFx0aWYgKGJsb2NrLmxpbmVzLmxlbmd0aCA9PT0gMSAmJiBibG9jay5saW5lc1swXSBpbnN0YW5jZW9mIFZhbClcblx0XHRcdGJsb2NrLmxpbmVzWzBdID0gbmV3IEJhZ0VudHJ5KGJsb2NrLmxpbmVzWzBdLmxvYywgYmxvY2subGluZXNbMF0pXG5cdFx0cmV0dXJuIG5ldyBGb3JCYWcodG9rZW5zLmxvYywgcGFyc2VPcEl0ZXJhdGVlKGJlZm9yZSksIGJsb2NrKVxuXHR9XG5cbmNvbnN0XG5cdHBhcnNlRm9yID0gKGN0ciwgdG9rZW5zKSA9PiB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRcdHJldHVybiBuZXcgY3RyKHRva2Vucy5sb2MsIHBhcnNlT3BJdGVyYXRlZShiZWZvcmUpLCBwYXJzZUJsb2NrRG8oYmxvY2spKVxuXHR9LFxuXG5cdHBhcnNlT3BJdGVyYXRlZSA9IHRva2VucyA9PlxuXHRcdG9wSWYoIXRva2Vucy5pc0VtcHR5KCksICgpID0+IHtcblx0XHRcdGNvbnN0IFtlbGVtZW50LCBiYWddID1cblx0XHRcdFx0aWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZVdoZXJlKF8gPT4gaXNLZXl3b3JkKEtXX09mLCBfKSksXG5cdFx0XHRcdFx0KHtiZWZvcmUsIGFmdGVyfSkgPT4ge1xuXHRcdFx0XHRcdFx0Y29udGV4dC5jaGVjayhiZWZvcmUuc2l6ZSgpID09PSAxLCBiZWZvcmUubG9jLCAnVE9ETzogcGF0dGVybiBpbiBmb3InKVxuXHRcdFx0XHRcdFx0cmV0dXJuIFtwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMoYmVmb3JlKVswXSwgcGFyc2VFeHByKGFmdGVyKV1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdCgpID0+IFtuZXcgTG9jYWxEZWNsYXJlRm9jdXModG9rZW5zLmxvYyksIHBhcnNlRXhwcih0b2tlbnMpXSlcblx0XHRcdHJldHVybiBuZXcgSXRlcmF0ZWUodG9rZW5zLmxvYywgZWxlbWVudCwgYmFnKVxuXHRcdH0pXG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

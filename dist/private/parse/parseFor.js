if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', '../context', '../MsAst', '../Token', '../util', './parse*', './parseBlock', './parseLocalDeclares'], function (exports, _context, _MsAst, _Token, _util, _parse, _parseBlock, _parseLocalDeclares) {
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

			(0, _context.check)(before.size() === 1, before.loc, 'TODO: pattern in for');
			return [(0, _parseLocalDeclares.parseLocalDeclaresJustNames)(before)[0], (0, _parse.parseExpr)(after)];
		}, () => [new _MsAst.LocalDeclareFocus(tokens.loc), (0, _parse.parseExpr)(tokens)]);

		var _ifElse2 = _slicedToArray(_ifElse, 2);

		const element = _ifElse2[0];
		const bag = _ifElse2[1];

		return new _MsAst.Iteratee(tokens.loc, element, bag);
	});
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlRm9yLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZUZvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDUU8sT0FDTixVQUFVLEdBQUcsTUFBTSxJQUNsQixRQUFRLFFBVFEsS0FBSyxFQVNMLE1BQU0sQ0FBQztPQUV4QixXQUFXLEdBQUcsTUFBTSxJQUNuQixRQUFRLFFBWnVCLE1BQU0sRUFZcEIsTUFBTSxDQUFDOzs7O0FBR3pCLFlBQVcsR0FBRyxNQUFNLElBQUk7d0JBQ0MsZ0JBWmxCLGNBQWMsRUFZbUIsTUFBTSxDQUFDOzs7O1FBQXZDLE1BQU07UUFBRSxLQUFLOztBQUNwQixRQUFNLEtBQUssR0FBRyxnQkFiUSxZQUFZLEVBYVAsS0FBSyxDQUFDLENBQUE7O0FBRWpDLE1BQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLG1CQW5Cc0IsR0FBRyxBQW1CVixFQUM1RCxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBcEJaLFFBQVEsQ0FvQmlCLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNsRSxTQUFPLFdBckJnQixNQUFNLENBcUJYLE1BQU0sQ0FBQyxHQUFHLEVBQUUsZUFBZSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO0VBQzdELENBQUE7Ozs7O0FBRUYsT0FDQyxRQUFRLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxLQUFLO3lCQUNILGdCQXRCbEIsY0FBYyxFQXNCbUIsTUFBTSxDQUFDOzs7O1FBQXZDLE1BQU07UUFBRSxLQUFLOztBQUNwQixTQUFPLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsZUFBZSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGdCQXZCOUIsWUFBWSxFQXVCK0IsS0FBSyxDQUFDLENBQUMsQ0FBQTtFQUN4RTtPQUVELGVBQWUsR0FBRyxNQUFNLElBQ3ZCLFVBN0JjLElBQUksRUE2QmIsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTTtnQkFFNUIsVUEvQkksTUFBTSxFQStCSCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLFdBaENoQyxTQUFTLFNBQUUsS0FBSyxFQWdDaUMsQ0FBQyxDQUFDLENBQUMsRUFDdkQsQUFBQyxJQUFlLElBQUs7T0FBbkIsTUFBTSxHQUFQLElBQWUsQ0FBZCxNQUFNO09BQUUsS0FBSyxHQUFkLElBQWUsQ0FBTixLQUFLOztBQUNkLGdCQXBDRSxLQUFLLEVBb0NELE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxzQkFBc0IsQ0FBQyxDQUFBO0FBQzlELFVBQU8sQ0FBQyx3QkEvQk4sMkJBQTJCLEVBK0JPLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBakM5QyxTQUFTLEVBaUMrQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0dBQ2pFLEVBQ0QsTUFBTSxDQUFDLFdBdEN1QyxpQkFBaUIsQ0FzQ2xDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxXQW5DdkMsU0FBUyxFQW1Dd0MsTUFBTSxDQUFDLENBQUMsQ0FBQzs7OztRQU54RCxPQUFPO1FBQUUsR0FBRzs7QUFPbkIsU0FBTyxXQXZDK0IsUUFBUSxDQXVDMUIsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUE7RUFDN0MsQ0FBQyxDQUFBIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvcGFyc2VGb3IuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0JhZ0VudHJ5LCBGb3JEbywgRm9yQmFnLCBGb3JWYWwsIEl0ZXJhdGVlLCBMb2NhbERlY2xhcmVGb2N1cywgVmFsfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7aXNLZXl3b3JkLCBLV19PZn0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2lmRWxzZSwgb3BJZn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7cGFyc2VFeHByfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCB7YmVmb3JlQW5kQmxvY2ssIHBhcnNlQmxvY2tEb30gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHtwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXN9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuXG5leHBvcnQgY29uc3Rcblx0cGFyc2VGb3JEbyA9IHRva2VucyA9PlxuXHRcdHBhcnNlRm9yKEZvckRvLCB0b2tlbnMpLFxuXG5cdHBhcnNlRm9yVmFsID0gdG9rZW5zID0+XG5cdFx0cGFyc2VGb3IoRm9yVmFsLCB0b2tlbnMpLFxuXG5cdC8vIFRPRE86IC0+IG91dC10eXBlXG5cdHBhcnNlRm9yQmFnID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBbYmVmb3JlLCBsaW5lc10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdFx0Y29uc3QgYmxvY2sgPSBwYXJzZUJsb2NrRG8obGluZXMpXG5cdFx0Ly8gVE9ETzogQmV0dGVyIHdheT9cblx0XHRpZiAoYmxvY2subGluZXMubGVuZ3RoID09PSAxICYmIGJsb2NrLmxpbmVzWzBdIGluc3RhbmNlb2YgVmFsKVxuXHRcdFx0YmxvY2subGluZXNbMF0gPSBuZXcgQmFnRW50cnkoYmxvY2subGluZXNbMF0ubG9jLCBibG9jay5saW5lc1swXSlcblx0XHRyZXR1cm4gbmV3IEZvckJhZyh0b2tlbnMubG9jLCBwYXJzZU9wSXRlcmF0ZWUoYmVmb3JlKSwgYmxvY2spXG5cdH1cblxuY29uc3Rcblx0cGFyc2VGb3IgPSAoY3RyLCB0b2tlbnMpID0+IHtcblx0XHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdFx0cmV0dXJuIG5ldyBjdHIodG9rZW5zLmxvYywgcGFyc2VPcEl0ZXJhdGVlKGJlZm9yZSksIHBhcnNlQmxvY2tEbyhibG9jaykpXG5cdH0sXG5cblx0cGFyc2VPcEl0ZXJhdGVlID0gdG9rZW5zID0+XG5cdFx0b3BJZighdG9rZW5zLmlzRW1wdHkoKSwgKCkgPT4ge1xuXHRcdFx0Y29uc3QgW2VsZW1lbnQsIGJhZ10gPVxuXHRcdFx0XHRpZkVsc2UodG9rZW5zLm9wU3BsaXRPbmNlV2hlcmUoXyA9PiBpc0tleXdvcmQoS1dfT2YsIF8pKSxcblx0XHRcdFx0XHQoe2JlZm9yZSwgYWZ0ZXJ9KSA9PiB7XG5cdFx0XHRcdFx0XHRjaGVjayhiZWZvcmUuc2l6ZSgpID09PSAxLCBiZWZvcmUubG9jLCAnVE9ETzogcGF0dGVybiBpbiBmb3InKVxuXHRcdFx0XHRcdFx0cmV0dXJuIFtwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMoYmVmb3JlKVswXSwgcGFyc2VFeHByKGFmdGVyKV1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdCgpID0+IFtuZXcgTG9jYWxEZWNsYXJlRm9jdXModG9rZW5zLmxvYyksIHBhcnNlRXhwcih0b2tlbnMpXSlcblx0XHRcdHJldHVybiBuZXcgSXRlcmF0ZWUodG9rZW5zLmxvYywgZWxlbWVudCwgYmFnKVxuXHRcdH0pXG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

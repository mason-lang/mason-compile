if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', './context', '../Token', '../util'], function (exports, _context, _Token, _util) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	exports.default = token => (0, _util.opOr)(tryParseName(token), () => (0, _context.unexpected)(token));

	const tryParseName = token => token instanceof _Token.Name ? token.name : (0, _Token.isNameKeyword)(token) ? (0, _Token.keywordName)(token.kind) : null;
	exports.tryParseName = tryParseName;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlTmFtZS5qcyIsInByaXZhdGUvcGFyc2UvcGFyc2VOYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O21CQ0llLEtBQUssSUFDbkIsVUFITyxJQUFJLEVBR04sWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sYUFMekIsVUFBVSxFQUswQixLQUFLLENBQUMsQ0FBQzs7QUFFNUMsT0FBTSxZQUFZLEdBQUcsS0FBSyxJQUNoQyxLQUFLLG1CQVA4QixJQUFJLEFBT2xCLEdBQ3BCLEtBQUssQ0FBQyxJQUFJLEdBQ1YsV0FUTSxhQUFhLEVBU0wsS0FBSyxDQUFDLEdBQ3BCLFdBVnFCLFdBQVcsRUFVcEIsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUN2QixJQUFJLENBQUEiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9wYXJzZU5hbWUuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7dW5leHBlY3RlZH0gZnJvbSAnLi9jb250ZXh0J1xuaW1wb3J0IHtpc05hbWVLZXl3b3JkLCBrZXl3b3JkTmFtZSwgTmFtZX0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge29wT3J9IGZyb20gJy4uL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IHRva2VuID0+XG5cdG9wT3IodHJ5UGFyc2VOYW1lKHRva2VuKSwgKCkgPT4gdW5leHBlY3RlZCh0b2tlbikpXG5cbmV4cG9ydCBjb25zdCB0cnlQYXJzZU5hbWUgPSB0b2tlbiA9PlxuXHR0b2tlbiBpbnN0YW5jZW9mIE5hbWUgP1xuXHRcdHRva2VuLm5hbWUgOlxuXHRcdGlzTmFtZUtleXdvcmQodG9rZW4pID9cblx0XHRrZXl3b3JkTmFtZSh0b2tlbi5raW5kKSA6XG5cdFx0bnVsbFxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', './checks', '../Token', '../util'], function (exports, _checks, _Token, _util) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	exports.default = token => (0, _util.opOr)(tryParseName(token), () => (0, _checks.unexpected)(token));

	const tryParseName = token => token instanceof _Token.Name ? token.name : (0, _Token.isNameKeyword)(token) ? (0, _Token.keywordName)(token.kind) : null;
	exports.tryParseName = tryParseName;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlTmFtZS5qcyIsInByaXZhdGUvcGFyc2UvcGFyc2VOYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O21CQ0llLEtBQUssSUFDbkIsVUFITyxJQUFJLEVBR04sWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sWUFMekIsVUFBVSxFQUswQixLQUFLLENBQUMsQ0FBQzs7QUFFNUMsT0FBTSxZQUFZLEdBQUcsS0FBSyxJQUNoQyxLQUFLLG1CQVA4QixJQUFJLEFBT2xCLEdBQ3BCLEtBQUssQ0FBQyxJQUFJLEdBQ1YsV0FUTSxhQUFhLEVBU0wsS0FBSyxDQUFDLEdBQ3BCLFdBVnFCLFdBQVcsRUFVcEIsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUN2QixJQUFJLENBQUEiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9wYXJzZU5hbWUuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7dW5leHBlY3RlZH0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge2lzTmFtZUtleXdvcmQsIGtleXdvcmROYW1lLCBOYW1lfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7b3BPcn0gZnJvbSAnLi4vdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgdG9rZW4gPT5cblx0b3BPcih0cnlQYXJzZU5hbWUodG9rZW4pLCAoKSA9PiB1bmV4cGVjdGVkKHRva2VuKSlcblxuZXhwb3J0IGNvbnN0IHRyeVBhcnNlTmFtZSA9IHRva2VuID0+XG5cdHRva2VuIGluc3RhbmNlb2YgTmFtZSA/XG5cdFx0dG9rZW4ubmFtZSA6XG5cdFx0aXNOYW1lS2V5d29yZCh0b2tlbikgP1xuXHRcdGtleXdvcmROYW1lKHRva2VuLmtpbmQpIDpcblx0XHRudWxsXG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../../CompileError', '../lex/chars', '../Token', '../util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../../CompileError'), require('../lex/chars'), require('../Token'), require('../util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.chars, global.Token, global.util);
		global.english = mod.exports;
	}
})(this, function (exports, _CompileError, _chars, _Token, _util) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = {
		// Lex:

		badInterpolation: `${ (0, _CompileError.code)('#') } must be followed by ${ (0, _CompileError.code)('(') }, ${ (0, _CompileError.code)('#') }, or a name.`,
		badSpacedIndent: indent => `Indentation spaces must be a multiple of ${ indent }.`,
		emptyBlock: 'Empty block.',
		extraSpace: 'Unnecessary space.',
		mismatchedGroupClose: (actual, expected) => `Trying to close ${ (0, _Token.showGroupKind)(actual) }, but last opened ${ (0, _Token.showGroupKind)(expected) }.`,
		noLeadingSpace: 'Line begins in a space',
		nonLeadingTab: 'Tab may only be used to indent',
		noNewlineInInterpolation: 'Quote interpolation cannot contain newline.',
		reservedChar: char => `Reserved character ${ (0, _chars.showChar)(char) }.`,
		suggestSimpleQuote: name => `Quoted text could be a simple quote ${ (0, _CompileError.code)(`'${ name }`) }.`,
		tooMuchIndent: 'Line is indented more than once.',
		tooMuchIndentQuote: 'Indented quote must have exactly one more indent than previous line.',
		trailingDocComment: `Doc comment must go on its own line. Did you mean ${ (0, _CompileError.code)('||') }?`,
		trailingSpace: 'Line ends in a space.',
		unclosedQuote: 'Unclosed quote.',

		// Parse:

		assignNothing: 'Assignment to nothing.',
		asToken: `Expected only 1 token after ${ (0, _Token.showKeyword)(_Token.Keywords.As) }.`,
		caseFocusIsImplicit: 'Can\'t make focus — is implicitly provided as first argument.',
		caseSwitchNeedsParts: `Must have at least 1 non-${ (0, _Token.showKeyword)(_Token.Keywords.Else) } test.`,
		condArguments: `${ (0, _Token.showKeyword)(_Token.Keywords.Cond) } takes exactly 3 arguments.`,
		conditionalArguments: kind => `${ (0, _Token.showKeyword)(kind) } with no block takes exactly 2 arguments.`,
		delArgument: `${ (0, _Token.showKeyword)(_Token.Keywords.Del) } takes only one argument.`,
		destructureAllLazy: 'All locals of destructuring assignment must all lazy or all non-lazy.',
		expectedAfterAssert: `Expected something after ${ (0, _Token.showKeyword)(_Token.Keywords.Assert) }.`,
		expectedAfterColon: `Expected something after ${ (0, _Token.showKeyword)(_Token.Keywords.Colon) }.`,
		expectedBlock: 'Expected an indented block.',
		expectedExpression: 'Expected an expression, got nothing.',
		expectedFuncKind: token => `Expected function kind, got ${ token }.`,
		expectedImportModuleName: 'Expected a module name to import.',
		expectedKeyword: keyword => `Expected ${ (0, _Token.showKeyword)(keyword) }`,
		expectedMethodSplit: 'Expected a function keyword somewhere.',
		expectedOneLocal: 'Expected only one local declaration.',
		expectedLocalName: token => `Expected a local name, not ${ token }.`,
		expectedName: token => `Expected a name, not ${ token }`,
		extraParens: `Unnecessary ${ (0, _Token.showGroup)(_Token.Groups.Parenthesis) }`,
		implicitFunctionDot: `Function ${ (0, _chars.showChar)(_chars.Chars.Dot) } is implicit for methods.`,
		infiniteRange: `Use ${ (0, _Token.showKeyword)(_Token.Keywords.Dot3) } for infinite ranges.`,
		invalidImportModule: 'Not a valid module name.',
		noImportFocus: `${ (0, _Token.showKeyword)(_Token.Keywords.Focus) } not allowed as import name.`,
		noSpecialKeyword: kind => `${ (0, _Token.showKeyword)(kind) } is not allowed here.`,
		nothingAfterFinally: `Nothing may come after ${ (0, _Token.showKeyword)(_Token.Keywords.Finally) }.`,
		parensOutsideCall: `Use ${ (0, _CompileError.code)('(a b)') }, not ${ (0, _CompileError.code)('a(b)') }.`,
		reservedWord: token => `Reserved word ${ token }.`,
		switchArgIsImplicit: 'Value to switch on is `_`, the function\'s implicit argument.',
		tokenAfterSuper: `Expected ${ (0, _Token.showKeyword)(_Token.Keywords.Dot) } or ${ (0, _CompileError.code)('()') } after ${ (0, _Token.showKeyword)(_Token.Keywords.Super) }`,
		todoForPattern: 'TODO: pattern in for',
		todoMutateDestructure: 'TODO: LocalDestructureMutate',
		unexpected: token => `Unexpected ${ token }.`,
		unexpectedAfter: token => `Did not expect anything after ${ token }.`,
		unexpectedAfterImportDo: `This is an ${ (0, _Token.showKeyword)(_Token.Keywords.ImportDo) }, so you can't import any values.`,
		unexpectedAfterKind: kind => `Did not expect anything between ${ (0, _Token.showKeyword)(kind) } and block.`,
		unexpectedAfterMethod: `Did not expect anything between ${ (0, _Token.showKeyword)(_Token.Keywords.Method) } and function.`,

		// Verify:

		ambiguousSK: 'Can\'t tell if this is a statement. Some parts are statements but others are values.',
		ambiguousForSK: `Can't tell if ${ (0, _Token.showKeyword)(_Token.Keywords.For) } is a statement. ` + `Some ${ (0, _Token.showKeyword)(_Token.Keywords.Break) }s have a value, others don't.`,
		badRegExp: source => {
			try {
				/* eslint-disable no-new */
				new RegExp(source);
				// This should only be called for bad regexp...
				(0, _util.assert)(false);
			} catch (err) {
				return err.message;
			}
		},
		blockNeedsContent: 'Value block must have some content.',
		breakCantHaveValue: `${ (0, _Token.showKeyword)(_Token.Keywords.Break) } with value needs ${ (0, _Token.showKeyword)(_Token.Keywords.For) } to be in expression position.`,
		breakNeedsValue: `${ (0, _Token.showKeyword)(_Token.Keywords.For) } in expression position must ${ (0, _Token.showKeyword)(_Token.Keywords.Break) } with a value.`,
		breakValInForBag: `${ (0, _Token.showKeyword)(_Token.Keywords.Break) } in ${ (0, _Token.showKeyword)(_Token.Keywords.ForBag) } may not have value.`,
		cantDetermineName: 'Expression must be placed in a position where name can be determined.',
		cantInferBlockKind: 'Block has mixed bag/map/obj entries — can not infer type.',
		doFuncCantHaveType: 'Function with return type must return something.',
		duplicateImport: (name, prevLoc) => `${ (0, _CompileError.code)(name) } already imported at ${ prevLoc }`,
		duplicateKey: key => `Duplicate key ${ key }`,
		duplicateLocal: name => `A local ${ (0, _CompileError.code)(name) } already exists and can't be shadowed.`,
		elseRequiresCatch: `${ (0, _Token.showKeyword)(_Token.Keywords.Else) } must come after a ${ (0, _Token.showKeyword)(_Token.Keywords.Catch) }.`,
		exportName: 'Module export must have a constant name.',
		forAsyncNeedsAsync: `${ (0, _Token.showKeyword)(_Token.Keywords.ForAsync) } as statement must be inside an async function.`,
		logicNeedsArgs: 'Logic expression needs at least 2 arguments.',
		misplacedAwait: `Cannot ${ (0, _Token.showKeyword)(_Token.Keywords.Await) } outside of async function.`,
		misplacedBreak: 'Not in a loop.',
		misplacedYield: kind => `Cannot ${ (0, _Token.showKeyword)(kind) } outside of generator function.`,
		missingLocal: name => `No such local ${ (0, _CompileError.code)(name) }.`,
		noLazyCatch: 'Caught error can not be lazy.',
		noLazyIteratee: 'Iteration element can not be lazy.',
		overriddenBuiltin: (name, builtinPath) => `Local ${ (0, _CompileError.code)(name) } overrides builtin from ${ (0, _CompileError.code)(builtinPath) }.`,
		statementAsValue: 'This can only be used as a statement, but appears in expression context.',
		superForbidden: `Class has no superclass, so ${ (0, _Token.showKeyword)(_Token.Keywords.Super) } is not allowed.`,
		superMustBeStatement: `${ (0, _Token.showKeyword)(_Token.Keywords.Super) } in constructor must appear as a statement.'`,
		superNeeded: `Constructor must contain ${ (0, _Token.showKeyword)(_Token.Keywords.Super) }`,
		superNeedsMethod: `${ (0, _Token.showKeyword)(_Token.Keywords.Super) } must be in a method.`,
		unusedLocal: name => `Unused local variable ${ (0, _CompileError.code)(name) }.`,
		uselessExcept: `${ (0, _Token.showKeyword)(_Token.Keywords.Except) } must have ${ (0, _Token.showKeyword)(_Token.Keywords.Catch) } or ${ (0, _Token.showKeyword)(_Token.Keywords.Finally) }.`,
		valueAsStatement: 'Value appears in statement context, so it does nothing.'
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xhbmd1YWdlcy9lbmdsaXNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFLZTs7O0FBR2Qsa0JBQWdCLEVBQ2YsQ0FBQyxHQUFFLGtCQVRHLElBQUksRUFTRixHQUFHLENBQUMsRUFBQyxxQkFBcUIsR0FBRSxrQkFUOUIsSUFBSSxFQVMrQixHQUFHLENBQUMsRUFBQyxFQUFFLEdBQUUsa0JBVDVDLElBQUksRUFTNkMsR0FBRyxDQUFDLEVBQUMsWUFBWSxDQUFDO0FBQzFFLGlCQUFlLEVBQUUsTUFBTSxJQUN0QixDQUFDLHlDQUF5QyxHQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7QUFDdEQsWUFBVSxFQUNULGNBQWM7QUFDZixZQUFVLEVBQ1Qsb0JBQW9CO0FBQ3JCLHNCQUFvQixFQUFFLENBQUMsTUFBTSxFQUFFLFFBQVEsS0FDdEMsQ0FBQyxnQkFBZ0IsR0FBRSxXQWZnQixhQUFhLEVBZWYsTUFBTSxDQUFDLEVBQUMsa0JBQWtCLEdBQUUsV0FmMUIsYUFBYSxFQWUyQixRQUFRLENBQUMsRUFBQyxDQUFDLENBQUM7QUFDeEYsZ0JBQWMsRUFDYix3QkFBd0I7QUFDekIsZUFBYSxFQUNaLGdDQUFnQztBQUNqQywwQkFBd0IsRUFDdkIsNkNBQTZDO0FBQzlDLGNBQVksRUFBRSxJQUFJLElBQ2pCLENBQUMsbUJBQW1CLEdBQUUsV0F4QlQsUUFBUSxFQXdCVSxJQUFJLENBQUMsRUFBQyxDQUFDLENBQUM7QUFDeEMsb0JBQWtCLEVBQUUsSUFBSSxJQUN2QixDQUFDLG9DQUFvQyxHQUFFLGtCQTNCakMsSUFBSSxFQTJCa0MsQ0FBQyxDQUFDLEdBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztBQUMzRCxlQUFhLEVBQ1osa0NBQWtDO0FBQ25DLG9CQUFrQixFQUNqQixzRUFBc0U7QUFDdkUsb0JBQWtCLEVBQ2pCLENBQUMsa0RBQWtELEdBQUUsa0JBakMvQyxJQUFJ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ZW50IjpbImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtDaGFycywgc2hvd0NoYXJ9IGZyb20gJy4uL2xleC9jaGFycydcbmltcG9ydCB7R3JvdXBzLCBLZXl3b3Jkcywgc2hvd0dyb3VwLCBzaG93R3JvdXBLaW5kLCBzaG93S2V5d29yZCBhcyBrd30gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2Fzc2VydH0gZnJvbSAnLi4vdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQge1xuXHQvLyBMZXg6XG5cblx0YmFkSW50ZXJwb2xhdGlvbjpcblx0XHRgJHtjb2RlKCcjJyl9IG11c3QgYmUgZm9sbG93ZWQgYnkgJHtjb2RlKCcoJyl9LCAke2NvZGUoJyMnKX0sIG9yIGEgbmFtZS5gLFxuXHRiYWRTcGFjZWRJbmRlbnQ6IGluZGVudCA9PlxuXHRcdGBJbmRlbnRhdGlvbiBzcGFjZXMgbXVzdCBiZSBhIG11bHRpcGxlIG9mICR7aW5kZW50fS5gLFxuXHRlbXB0eUJsb2NrOlxuXHRcdCdFbXB0eSBibG9jay4nLFxuXHRleHRyYVNwYWNlOlxuXHRcdCdVbm5lY2Vzc2FyeSBzcGFjZS4nLFxuXHRtaXNtYXRjaGVkR3JvdXBDbG9zZTogKGFjdHVhbCwgZXhwZWN0ZWQpID0+XG5cdFx0YFRyeWluZyB0byBjbG9zZSAke3Nob3dHcm91cEtpbmQoYWN0dWFsKX0sIGJ1dCBsYXN0IG9wZW5lZCAke3Nob3dHcm91cEtpbmQoZXhwZWN0ZWQpfS5gLFxuXHRub0xlYWRpbmdTcGFjZTpcblx0XHQnTGluZSBiZWdpbnMgaW4gYSBzcGFjZScsXG5cdG5vbkxlYWRpbmdUYWI6XG5cdFx0J1RhYiBtYXkgb25seSBiZSB1c2VkIHRvIGluZGVudCcsXG5cdG5vTmV3bGluZUluSW50ZXJwb2xhdGlvbjpcblx0XHQnUXVvdGUgaW50ZXJwb2xhdGlvbiBjYW5ub3QgY29udGFpbiBuZXdsaW5lLicsXG5cdHJlc2VydmVkQ2hhcjogY2hhciA9PlxuXHRcdGBSZXNlcnZlZCBjaGFyYWN0ZXIgJHtzaG93Q2hhcihjaGFyKX0uYCxcblx0c3VnZ2VzdFNpbXBsZVF1b3RlOiBuYW1lID0+XG5cdFx0YFF1b3RlZCB0ZXh0IGNvdWxkIGJlIGEgc2ltcGxlIHF1b3RlICR7Y29kZShgJyR7bmFtZX1gKX0uYCxcblx0dG9vTXVjaEluZGVudDpcblx0XHQnTGluZSBpcyBpbmRlbnRlZCBtb3JlIHRoYW4gb25jZS4nLFxuXHR0b29NdWNoSW5kZW50UXVvdGU6XG5cdFx0J0luZGVudGVkIHF1b3RlIG11c3QgaGF2ZSBleGFjdGx5IG9uZSBtb3JlIGluZGVudCB0aGFuIHByZXZpb3VzIGxpbmUuJyxcblx0dHJhaWxpbmdEb2NDb21tZW50OlxuXHRcdGBEb2MgY29tbWVudCBtdXN0IGdvIG9uIGl0cyBvd24gbGluZS4gRGlkIHlvdSBtZWFuICR7Y29kZSgnfHwnKX0/YCxcblx0dHJhaWxpbmdTcGFjZTpcblx0XHQnTGluZSBlbmRzIGluIGEgc3BhY2UuJyxcblx0dW5jbG9zZWRRdW90ZTpcblx0XHQnVW5jbG9zZWQgcXVvdGUuJyxcblxuXHQvLyBQYXJzZTpcblxuXHRhc3NpZ25Ob3RoaW5nOlxuXHRcdCdBc3NpZ25tZW50IHRvIG5vdGhpbmcuJyxcblx0YXNUb2tlbjpcblx0XHRgRXhwZWN0ZWQgb25seSAxIHRva2VuIGFmdGVyICR7a3coS2V5d29yZHMuQXMpfS5gLFxuXHRjYXNlRm9jdXNJc0ltcGxpY2l0OlxuXHRcdCdDYW5cXCd0IG1ha2UgZm9jdXMg4oCUIGlzIGltcGxpY2l0bHkgcHJvdmlkZWQgYXMgZmlyc3QgYXJndW1lbnQuJyxcblx0Y2FzZVN3aXRjaE5lZWRzUGFydHM6XG5cdFx0YE11c3QgaGF2ZSBhdCBsZWFzdCAxIG5vbi0ke2t3KEtleXdvcmRzLkVsc2UpfSB0ZXN0LmAsXG5cdGNvbmRBcmd1bWVudHM6XG5cdFx0YCR7a3coS2V5d29yZHMuQ29uZCl9IHRha2VzIGV4YWN0bHkgMyBhcmd1bWVudHMuYCxcblx0Y29uZGl0aW9uYWxBcmd1bWVudHM6IGtpbmQgPT5cblx0XHRgJHtrdyhraW5kKX0gd2l0aCBubyBibG9jayB0YWtlcyBleGFjdGx5IDIgYXJndW1lbnRzLmAsXG5cdGRlbEFyZ3VtZW50OlxuXHRcdGAke2t3KEtleXdvcmRzLkRlbCl9IHRha2VzIG9ubHkgb25lIGFyZ3VtZW50LmAsXG5cdGRlc3RydWN0dXJlQWxsTGF6eTpcblx0XHQnQWxsIGxvY2FscyBvZiBkZXN0cnVjdHVyaW5nIGFzc2lnbm1lbnQgbXVzdCBhbGwgbGF6eSBvciBhbGwgbm9uLWxhenkuJyxcblx0ZXhwZWN0ZWRBZnRlckFzc2VydDpcblx0XHRgRXhwZWN0ZWQgc29tZXRoaW5nIGFmdGVyICR7a3coS2V5d29yZHMuQXNzZXJ0KX0uYCxcblx0ZXhwZWN0ZWRBZnRlckNvbG9uOlxuXHRcdGBFeHBlY3RlZCBzb21ldGhpbmcgYWZ0ZXIgJHtrdyhLZXl3b3Jkcy5Db2xvbil9LmAsXG5cdGV4cGVjdGVkQmxvY2s6XG5cdFx0J0V4cGVjdGVkIGFuIGluZGVudGVkIGJsb2NrLicsXG5cdGV4cGVjdGVkRXhwcmVzc2lvbjpcblx0XHQnRXhwZWN0ZWQgYW4gZXhwcmVzc2lvbiwgZ290IG5vdGhpbmcuJyxcblx0ZXhwZWN0ZWRGdW5jS2luZDogdG9rZW4gPT5cblx0XHRgRXhwZWN0ZWQgZnVuY3Rpb24ga2luZCwgZ290ICR7dG9rZW59LmAsXG5cdGV4cGVjdGVkSW1wb3J0TW9kdWxlTmFtZTpcblx0XHQnRXhwZWN0ZWQgYSBtb2R1bGUgbmFtZSB0byBpbXBvcnQuJyxcblx0ZXhwZWN0ZWRLZXl3b3JkOiBrZXl3b3JkID0+XG5cdFx0YEV4cGVjdGVkICR7a3coa2V5d29yZCl9YCxcblx0ZXhwZWN0ZWRNZXRob2RTcGxpdDpcblx0XHQnRXhwZWN0ZWQgYSBmdW5jdGlvbiBrZXl3b3JkIHNvbWV3aGVyZS4nLFxuXHRleHBlY3RlZE9uZUxvY2FsOlxuXHRcdCdFeHBlY3RlZCBvbmx5IG9uZSBsb2NhbCBkZWNsYXJhdGlvbi4nLFxuXHRleHBlY3RlZExvY2FsTmFtZTogdG9rZW4gPT5cblx0XHRgRXhwZWN0ZWQgYSBsb2NhbCBuYW1lLCBub3QgJHt0b2tlbn0uYCxcblx0ZXhwZWN0ZWROYW1lOiB0b2tlbiA9PlxuXHRcdGBFeHBlY3RlZCBhIG5hbWUsIG5vdCAke3Rva2VufWAsXG5cdGV4dHJhUGFyZW5zOlxuXHRcdGBVbm5lY2Vzc2FyeSAke3Nob3dHcm91cChHcm91cHMuUGFyZW50aGVzaXMpfWAsXG5cdGltcGxpY2l0RnVuY3Rpb25Eb3Q6XG5cdFx0YEZ1bmN0aW9uICR7c2hvd0NoYXIoQ2hhcnMuRG90KX0gaXMgaW1wbGljaXQgZm9yIG1ldGhvZHMuYCxcblx0aW5maW5pdGVSYW5nZTpcblx0XHRgVXNlICR7a3coS2V5d29yZHMuRG90Myl9IGZvciBpbmZpbml0ZSByYW5nZXMuYCxcblx0aW52YWxpZEltcG9ydE1vZHVsZTpcblx0XHQnTm90IGEgdmFsaWQgbW9kdWxlIG5hbWUuJyxcblx0bm9JbXBvcnRGb2N1czpcblx0XHRgJHtrdyhLZXl3b3Jkcy5Gb2N1cyl9IG5vdCBhbGxvd2VkIGFzIGltcG9ydCBuYW1lLmAsXG5cdG5vU3BlY2lhbEtleXdvcmQ6IGtpbmQgPT5cblx0XHRgJHtrdyhraW5kKX0gaXMgbm90IGFsbG93ZWQgaGVyZS5gLFxuXHRub3RoaW5nQWZ0ZXJGaW5hbGx5OlxuXHRcdGBOb3RoaW5nIG1heSBjb21lIGFmdGVyICR7a3coS2V5d29yZHMuRmluYWxseSl9LmAsXG5cdHBhcmVuc091dHNpZGVDYWxsOlxuXHRcdGBVc2UgJHtjb2RlKCcoYSBiKScpfSwgbm90ICR7Y29kZSgnYShiKScpfS5gLFxuXHRyZXNlcnZlZFdvcmQ6IHRva2VuID0+XG5cdFx0YFJlc2VydmVkIHdvcmQgJHt0b2tlbn0uYCxcblx0c3dpdGNoQXJnSXNJbXBsaWNpdDpcblx0XHQnVmFsdWUgdG8gc3dpdGNoIG9uIGlzIGBfYCwgdGhlIGZ1bmN0aW9uXFwncyBpbXBsaWNpdCBhcmd1bWVudC4nLFxuXHR0b2tlbkFmdGVyU3VwZXI6XG5cdFx0YEV4cGVjdGVkICR7a3coS2V5d29yZHMuRG90KX0gb3IgJHtjb2RlKCcoKScpfSBhZnRlciAke2t3KEtleXdvcmRzLlN1cGVyKX1gLFxuXHR0b2RvRm9yUGF0dGVybjpcblx0XHQnVE9ETzogcGF0dGVybiBpbiBmb3InLFxuXHR0b2RvTXV0YXRlRGVzdHJ1Y3R1cmU6XG5cdFx0J1RPRE86IExvY2FsRGVzdHJ1Y3R1cmVNdXRhdGUnLFxuXHR1bmV4cGVjdGVkOiB0b2tlbiA9PlxuXHRcdGBVbmV4cGVjdGVkICR7dG9rZW59LmAsXG5cdHVuZXhwZWN0ZWRBZnRlcjogdG9rZW4gPT5cblx0XHRgRGlkIG5vdCBleHBlY3QgYW55dGhpbmcgYWZ0ZXIgJHt0b2tlbn0uYCxcblx0dW5leHBlY3RlZEFmdGVySW1wb3J0RG86XG5cdFx0YFRoaXMgaXMgYW4gJHtrdyhLZXl3b3Jkcy5JbXBvcnREbyl9LCBzbyB5b3UgY2FuJ3QgaW1wb3J0IGFueSB2YWx1ZXMuYCxcblx0dW5leHBlY3RlZEFmdGVyS2luZDoga2luZCA9PlxuXHRcdGBEaWQgbm90IGV4cGVjdCBhbnl0aGluZyBiZXR3ZWVuICR7a3coa2luZCl9IGFuZCBibG9jay5gLFxuXHR1bmV4cGVjdGVkQWZ0ZXJNZXRob2Q6XG5cdFx0YERpZCBub3QgZXhwZWN0IGFueXRoaW5nIGJldHdlZW4gJHtrdyhLZXl3b3Jkcy5NZXRob2QpfSBhbmQgZnVuY3Rpb24uYCxcblxuXHQvLyBWZXJpZnk6XG5cblx0YW1iaWd1b3VzU0s6XG5cdFx0J0NhblxcJ3QgdGVsbCBpZiB0aGlzIGlzIGEgc3RhdGVtZW50LiBTb21lIHBhcnRzIGFyZSBzdGF0ZW1lbnRzIGJ1dCBvdGhlcnMgYXJlIHZhbHVlcy4nLFxuXHRhbWJpZ3VvdXNGb3JTSzpcblx0XHRgQ2FuJ3QgdGVsbCBpZiAke2t3KEtleXdvcmRzLkZvcil9IGlzIGEgc3RhdGVtZW50LiBgICtcblx0XHRgU29tZSAke2t3KEtleXdvcmRzLkJyZWFrKX1zIGhhdmUgYSB2YWx1ZSwgb3RoZXJzIGRvbid0LmAsXG5cdGJhZFJlZ0V4cDogc291cmNlID0+IHtcblx0XHR0cnkge1xuXHRcdFx0LyogZXNsaW50LWRpc2FibGUgbm8tbmV3ICovXG5cdFx0XHRuZXcgUmVnRXhwKHNvdXJjZSlcblx0XHRcdC8vIFRoaXMgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGZvciBiYWQgcmVnZXhwLi4uXG5cdFx0XHRhc3NlcnQoZmFsc2UpXG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRyZXR1cm4gZXJyLm1lc3NhZ2Vcblx0XHR9XG5cdH0sXG5cdGJsb2NrTmVlZHNDb250ZW50OlxuXHRcdCdWYWx1ZSBibG9jayBtdXN0IGhhdmUgc29tZSBjb250ZW50LicsXG5cdGJyZWFrQ2FudEhhdmVWYWx1ZTpcblx0XHRgJHtrdyhLZXl3b3Jkcy5CcmVhayl9IHdpdGggdmFsdWUgbmVlZHMgJHtrdyhLZXl3b3Jkcy5Gb3IpfSB0byBiZSBpbiBleHByZXNzaW9uIHBvc2l0aW9uLmAsXG5cdGJyZWFrTmVlZHNWYWx1ZTpcblx0XHRgJHtrdyhLZXl3b3Jkcy5Gb3IpfSBpbiBleHByZXNzaW9uIHBvc2l0aW9uIG11c3QgJHtrdyhLZXl3b3Jkcy5CcmVhayl9IHdpdGggYSB2YWx1ZS5gLFxuXHRicmVha1ZhbEluRm9yQmFnOlxuXHRcdGAke2t3KEtleXdvcmRzLkJyZWFrKX0gaW4gJHtrdyhLZXl3b3Jkcy5Gb3JCYWcpfSBtYXkgbm90IGhhdmUgdmFsdWUuYCxcblx0Y2FudERldGVybWluZU5hbWU6XG5cdFx0J0V4cHJlc3Npb24gbXVzdCBiZSBwbGFjZWQgaW4gYSBwb3NpdGlvbiB3aGVyZSBuYW1lIGNhbiBiZSBkZXRlcm1pbmVkLicsXG5cdGNhbnRJbmZlckJsb2NrS2luZDpcblx0XHQnQmxvY2sgaGFzIG1peGVkIGJhZy9tYXAvb2JqIGVudHJpZXMg4oCUIGNhbiBub3QgaW5mZXIgdHlwZS4nLFxuXHRkb0Z1bmNDYW50SGF2ZVR5cGU6XG5cdFx0J0Z1bmN0aW9uIHdpdGggcmV0dXJuIHR5cGUgbXVzdCByZXR1cm4gc29tZXRoaW5nLicsXG5cdGR1cGxpY2F0ZUltcG9ydDogKG5hbWUsIHByZXZMb2MpID0+XG5cdFx0YCR7Y29kZShuYW1lKX0gYWxyZWFkeSBpbXBvcnRlZCBhdCAke3ByZXZMb2N9YCxcblx0ZHVwbGljYXRlS2V5OiBrZXkgPT5cblx0XHRgRHVwbGljYXRlIGtleSAke2tleX1gLFxuXHRkdXBsaWNhdGVMb2NhbDogbmFtZSA9PlxuXHRcdGBBIGxvY2FsICR7Y29kZShuYW1lKX0gYWxyZWFkeSBleGlzdHMgYW5kIGNhbid0IGJlIHNoYWRvd2VkLmAsXG5cdGVsc2VSZXF1aXJlc0NhdGNoOlxuXHRcdGAke2t3KEtleXdvcmRzLkVsc2UpfSBtdXN0IGNvbWUgYWZ0ZXIgYSAke2t3KEtleXdvcmRzLkNhdGNoKX0uYCxcblx0ZXhwb3J0TmFtZTpcblx0XHQnTW9kdWxlIGV4cG9ydCBtdXN0IGhhdmUgYSBjb25zdGFudCBuYW1lLicsXG5cdGZvckFzeW5jTmVlZHNBc3luYzpcblx0XHRgJHtrdyhLZXl3b3Jkcy5Gb3JBc3luYyl9IGFzIHN0YXRlbWVudCBtdXN0IGJlIGluc2lkZSBhbiBhc3luYyBmdW5jdGlvbi5gLFxuXHRsb2dpY05lZWRzQXJnczpcblx0XHQnTG9naWMgZXhwcmVzc2lvbiBuZWVkcyBhdCBsZWFzdCAyIGFyZ3VtZW50cy4nLFxuXHRtaXNwbGFjZWRBd2FpdDpcblx0XHRgQ2Fubm90ICR7a3coS2V5d29yZHMuQXdhaXQpfSBvdXRzaWRlIG9mIGFzeW5jIGZ1bmN0aW9uLmAsXG5cdG1pc3BsYWNlZEJyZWFrOlxuXHRcdCdOb3QgaW4gYSBsb29wLicsXG5cdG1pc3BsYWNlZFlpZWxkOiBraW5kID0+XG5cdFx0YENhbm5vdCAke2t3KGtpbmQpfSBvdXRzaWRlIG9mIGdlbmVyYXRvciBmdW5jdGlvbi5gLFxuXHRtaXNzaW5nTG9jYWw6IG5hbWUgPT5cblx0XHRgTm8gc3VjaCBsb2NhbCAke2NvZGUobmFtZSl9LmAsXG5cdG5vTGF6eUNhdGNoOlxuXHRcdCdDYXVnaHQgZXJyb3IgY2FuIG5vdCBiZSBsYXp5LicsXG5cdG5vTGF6eUl0ZXJhdGVlOlxuXHRcdCdJdGVyYXRpb24gZWxlbWVudCBjYW4gbm90IGJlIGxhenkuJyxcblx0b3ZlcnJpZGRlbkJ1aWx0aW46IChuYW1lLCBidWlsdGluUGF0aCkgPT5cblx0XHRgTG9jYWwgJHtjb2RlKG5hbWUpfSBvdmVycmlkZXMgYnVpbHRpbiBmcm9tICR7Y29kZShidWlsdGluUGF0aCl9LmAsXG5cdHN0YXRlbWVudEFzVmFsdWU6XG5cdFx0J1RoaXMgY2FuIG9ubHkgYmUgdXNlZCBhcyBhIHN0YXRlbWVudCwgYnV0IGFwcGVhcnMgaW4gZXhwcmVzc2lvbiBjb250ZXh0LicsXG5cdHN1cGVyRm9yYmlkZGVuOlxuXHRcdGBDbGFzcyBoYXMgbm8gc3VwZXJjbGFzcywgc28gJHtrdyhLZXl3b3Jkcy5TdXBlcil9IGlzIG5vdCBhbGxvd2VkLmAsXG5cdHN1cGVyTXVzdEJlU3RhdGVtZW50OlxuXHRcdGAke2t3KEtleXdvcmRzLlN1cGVyKX0gaW4gY29uc3RydWN0b3IgbXVzdCBhcHBlYXIgYXMgYSBzdGF0ZW1lbnQuJ2AsXG5cdHN1cGVyTmVlZGVkOlxuXHRcdGBDb25zdHJ1Y3RvciBtdXN0IGNvbnRhaW4gJHtrdyhLZXl3b3Jkcy5TdXBlcil9YCxcblx0c3VwZXJOZWVkc01ldGhvZDpcblx0XHRgJHtrdyhLZXl3b3Jkcy5TdXBlcil9IG11c3QgYmUgaW4gYSBtZXRob2QuYCxcblx0dW51c2VkTG9jYWw6IG5hbWUgPT5cblx0XHRgVW51c2VkIGxvY2FsIHZhcmlhYmxlICR7Y29kZShuYW1lKX0uYCxcblx0dXNlbGVzc0V4Y2VwdDpcblx0XHRgJHtrdyhLZXl3b3Jkcy5FeGNlcHQpfSBtdXN0IGhhdmUgJHtrdyhLZXl3b3Jkcy5DYXRjaCl9IG9yICR7a3coS2V5d29yZHMuRmluYWxseSl9LmAsXG5cdHZhbHVlQXNTdGF0ZW1lbnQ6XG5cdFx0J1ZhbHVlIGFwcGVhcnMgaW4gc3RhdGVtZW50IGNvbnRleHQsIHNvIGl0IGRvZXMgbm90aGluZy4nXG59XG4iXX0=
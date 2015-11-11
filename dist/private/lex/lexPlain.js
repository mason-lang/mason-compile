'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', '../../CompileError', '../context', '../MsAst', '../Token', '../util', './chars', './groupContext', './lex*', './sourceContext'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('../../CompileError'), require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./chars'), require('./groupContext'), require('./lex*'), require('./sourceContext'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.CompileError, global.context, global.MsAst, global.Token, global.util, global.chars, global.groupContext, global.lex, global.sourceContext);
		global.lexPlain = mod.exports;
	}
})(this, function (exports, _Loc, _CompileError, _context, _MsAst, _Token, _util, _chars, _groupContext, _lex, _sourceContext) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = lexPlain;

	var _Loc2 = _interopRequireDefault(_Loc);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function lexPlain(isInQuote) {
		let indent = 0;
		let startColumn;

		function startPos() {
			return new _Loc.Pos(_sourceContext.line, startColumn);
		}

		function loc() {
			return new _Loc2.default(startPos(), (0, _sourceContext.pos)());
		}

		function keyword(kind) {
			(0, _groupContext.addToCurrentGroup)(new _Token.Keyword(loc(), kind));
		}

		function funKeyword(kind) {
			keyword(kind);
			(0, _groupContext.space)(loc());
		}

		function eatAndAddNumber() {
			const startIndex = _sourceContext.index - 1;
			(0, _sourceContext.tryEat)(_chars.Chars.Hyphen);

			if ((0, _sourceContext.peek)(-1) === _chars.Chars.N0) {
				const p = (0, _sourceContext.peek)();

				switch (p) {
					case _chars.Chars.LetterB:
					case _chars.Chars.LetterO:
					case _chars.Chars.LetterX:
						(0, _sourceContext.skip)();
						const isDigitSpecial = p === _chars.Chars.LetterB ? _chars.isDigitBinary : p === _chars.Chars.LetterO ? _chars.isDigitOctal : _chars.isDigitHex;
						(0, _sourceContext.skipWhile)(isDigitSpecial);
						break;

					case _chars.Chars.Dot:
						if ((0, _chars.isDigit)((0, _sourceContext.peek)(1))) {
							(0, _sourceContext.skip)();
							(0, _sourceContext.skipWhile)(_chars.isDigit);
						}

						break;

					default:}
			} else {
				(0, _sourceContext.skipWhile)(_chars.isDigit);

				if ((0, _sourceContext.peek)() === _chars.Chars.Dot && (0, _chars.isDigit)((0, _sourceContext.peek)(1))) {
					(0, _sourceContext.skip)();
					(0, _sourceContext.skipWhile)(_chars.isDigit);
				}
			}

			const str = _sourceContext.sourceString.slice(startIndex, _sourceContext.index);

			(0, _groupContext.addToCurrentGroup)(new _MsAst.NumberLiteral(loc(), str));
		}

		function eatIndent() {
			const optIndent = _context.options.indent();

			if (optIndent === '\t') {
				const indent = (0, _sourceContext.skipWhileEquals)(_chars.Chars.Tab);
				(0, _context.check)((0, _sourceContext.peek)() !== _chars.Chars.Space, _sourceContext.pos, 'Line begins in a space');
				return indent;
			} else {
				const spaces = (0, _sourceContext.skipWhileEquals)(_chars.Chars.Space);
				(0, _context.check)(spaces % optIndent === 0, _sourceContext.pos, () => `Indentation spaces must be a multiple of ${ optIndent }`);
				return spaces / optIndent;
			}
		}

		function handleName() {
			(0, _context.check)((0, _chars.isNameCharacter)((0, _sourceContext.peek)(-1)), loc(), () => `Reserved character ${ (0, _chars.showChar)((0, _sourceContext.peek)(-1)) }`);
			const name = (0, _sourceContext.takeWhileWithPrev)(_chars.isNameCharacter);

			if (name.endsWith('_')) {
				if (name.length > 1) handleNameText(name.slice(0, name.length - 1));
				keyword(_Token.Keywords.Focus);
			} else handleNameText(name);
		}

		function handleNameText(name) {
			(0, _util.ifElse)((0, _Token.opKeywordKindFromName)(name), kind => {
				switch (kind) {
					case _Token.Keywords.Region:
						(0, _sourceContext.skipRestOfLine)();
						keyword(_Token.Keywords.Region);
						break;

					case _Token.Keywords.Todo:
						(0, _sourceContext.skipRestOfLine)();
						break;

					default:
						keyword(kind);
				}
			}, () => {
				(0, _groupContext.addToCurrentGroup)(new _Token.Name(loc(), name));
			});
		}

		while (true) {
			startColumn = _sourceContext.column;
			const characterEaten = (0, _sourceContext.eat)();

			switch (characterEaten) {
				case _chars.Chars.Null:
					return;

				case _chars.Chars.CloseBrace:
					(0, _context.check)(isInQuote, loc, () => `Reserved character ${ (0, _chars.showChar)(_chars.Chars.CloseBrace) }`);
					return;

				case _chars.Chars.Quote:
					(0, _lex.lexQuote)(indent);
					break;

				case _chars.Chars.OpenParenthesis:
					if ((0, _sourceContext.tryEat)(_chars.Chars.CloseParenthesis)) (0, _groupContext.addToCurrentGroup)(new _Token.Group(loc(), [], _Token.Groups.Parenthesis));else (0, _groupContext.openParenthesis)(loc());
					break;

				case _chars.Chars.OpenBracket:
					if ((0, _sourceContext.tryEat)(_chars.Chars.CloseBracket)) (0, _groupContext.addToCurrentGroup)(new _Token.Group(loc(), [], _Token.Groups.Bracket));else {
						(0, _groupContext.openGroup)(startPos(), _Token.Groups.Bracket);
						(0, _groupContext.openGroup)((0, _sourceContext.pos)(), _Token.Groups.Space);
					}
					break;

				case _chars.Chars.CloseParenthesis:
					(0, _groupContext.closeParenthesis)(loc());
					break;

				case _chars.Chars.CloseBracket:
					(0, _groupContext.closeGroup)(startPos(), _Token.Groups.Space);
					(0, _groupContext.closeGroup)((0, _sourceContext.pos)(), _Token.Groups.Bracket);
					break;

				case _chars.Chars.Space:
					(0, _groupContext.space)(loc());
					break;

				case _chars.Chars.Newline:
					{
						(0, _context.check)(!isInQuote, loc, 'Quote interpolation cannot contain newline');
						if ((0, _sourceContext.peek)(-2) === _chars.Chars.Space) (0, _context.warn)(_sourceContext.pos, 'Line ends in a space.');
						(0, _sourceContext.skipNewlines)();
						const oldIndent = indent;
						indent = eatIndent();

						if (indent > oldIndent) {
							(0, _context.check)(indent === oldIndent + 1, loc, 'Line is indented more than once');
							const l = loc();

							if ((0, _util.isEmpty)(_groupContext.curGroup.subTokens) || !(0, _Token.isKeyword)(_Token.Keywords.Lazy, (0, _util.last)(_groupContext.curGroup.subTokens))) {
								if (_groupContext.curGroup.kind === _Token.Groups.Space) (0, _groupContext.closeSpaceOKIfEmpty)(l.start);
								(0, _groupContext.openGroup)(l.end, _Token.Groups.Space);
							}

							(0, _groupContext.openGroup)(l.start, _Token.Groups.Block);
							(0, _groupContext.openLine)(l.end);
						} else {
							const l = loc();

							for (let i = indent; i < oldIndent; i = i + 1) (0, _groupContext.closeGroupsForDedent)(l.start);

							(0, _groupContext.closeLine)(l.start);
							(0, _groupContext.openLine)(l.end);
						}

						break;
					}

				case _chars.Chars.Tab:
					(0, _context.fail)(loc(), 'Tab may only be used to indent');

				case _chars.Chars.Bang:
					if ((0, _sourceContext.tryEat)(_chars.Chars.Bar)) funKeyword(_Token.Keywords.FunDo);else handleName();
					break;

				case _chars.Chars.Cash:
					if ((0, _sourceContext.tryEat2)(_chars.Chars.Bang, _chars.Chars.Bar)) funKeyword(_Token.Keywords.FunAsyncDo);else if ((0, _sourceContext.tryEat)(_chars.Chars.Bar)) funKeyword(_Token.Keywords.FunAsync);else handleName();
					break;

				case _chars.Chars.Star:
					if ((0, _sourceContext.tryEat2)(_chars.Chars.Bang, _chars.Chars.Bar)) funKeyword(_Token.Keywords.FunGenDo);else if ((0, _sourceContext.tryEat)(_chars.Chars.Bar)) funKeyword(_Token.Keywords.FunGen);else handleName();
					break;

				case _chars.Chars.Bar:
					if ((0, _sourceContext.tryEat)(_chars.Chars.Space) || (0, _sourceContext.tryEat)(_chars.Chars.Tab)) {
						const text = (0, _sourceContext.eatRestOfLine)();
						(0, _groupContext.closeSpaceOKIfEmpty)(startPos());
						if (!(_groupContext.curGroup.kind === _Token.Groups.Line && _groupContext.curGroup.subTokens.length === 0)) (0, _context.fail)(loc, `Doc comment must go on its own line. Did you mean ${ (0, _CompileError.code)('||') }?`);
						(0, _groupContext.addToCurrentGroup)(new _Token.DocComment(loc(), text));
					} else if ((0, _sourceContext.tryEat)(_chars.Chars.Bar)) (0, _sourceContext.skipRestOfLine)();else funKeyword(_Token.Keywords.Fun);

					break;

				case _chars.Chars.Hyphen:
					if ((0, _chars.isDigit)((0, _sourceContext.peek)())) eatAndAddNumber();else handleName();
					break;

				case _chars.Chars.N0:
				case _chars.Chars.N1:
				case _chars.Chars.N2:
				case _chars.Chars.N3:
				case _chars.Chars.N4:
				case _chars.Chars.N5:
				case _chars.Chars.N6:
				case _chars.Chars.N7:
				case _chars.Chars.N8:
				case _chars.Chars.N9:
					eatAndAddNumber();
					break;

				case _chars.Chars.Dot:
					{
						if ((0, _sourceContext.peek)() === _chars.Chars.Space || (0, _sourceContext.peek)() === _chars.Chars.Newline) {
							(0, _groupContext.closeSpaceOKIfEmpty)(startPos());
							keyword(_Token.Keywords.ObjAssign);
						} else if ((0, _sourceContext.tryEat)(_chars.Chars.Bar)) funKeyword(_Token.Keywords.FunThis);else if ((0, _sourceContext.tryEat2)(_chars.Chars.Bang, _chars.Chars.Bar)) funKeyword(_Token.Keywords.FunThisDo);else if ((0, _sourceContext.tryEat2)(_chars.Chars.Star, _chars.Chars.Bar)) funKeyword(_Token.Keywords.FunThisGen);else if ((0, _sourceContext.tryEat3)(_chars.Chars.Star, _chars.Chars.Bang, _chars.Chars.Bar)) funKeyword(_Token.Keywords.FunThisGenDo);else if ((0, _sourceContext.tryEat)(_chars.Chars.Dot)) if ((0, _sourceContext.tryEat)(_chars.Chars.Dot)) keyword(_Token.Keywords.Dot3);else keyword(_Token.Keywords.Dot2);else keyword(_Token.Keywords.Dot);

						break;
					}

				case _chars.Chars.Colon:
					if ((0, _sourceContext.tryEat)(_chars.Chars.Colon)) {
						(0, _sourceContext.mustEat)(_chars.Chars.Equal, '::');
						keyword(_Token.Keywords.AssignMutable);
					} else if ((0, _sourceContext.tryEat)(_chars.Chars.Equal)) keyword(_Token.Keywords.LocalMutate);else keyword(_Token.Keywords.Type);

					break;

				case _chars.Chars.Tick:
					keyword(_Token.Keywords.Tick);
					break;

				case _chars.Chars.Tilde:
					keyword(_Token.Keywords.Lazy);
					break;

				case _chars.Chars.Ampersand:
					keyword(_Token.Keywords.Ampersand);
					break;

				case _chars.Chars.Backslash:
				case _chars.Chars.Backtick:
				case _chars.Chars.Caret:
				case _chars.Chars.Comma:
				case _chars.Chars.Percent:
				case _chars.Chars.Semicolon:
					(0, _context.fail)(loc(), `Reserved character ${ (0, _chars.showChar)(characterEaten) }`);

				default:
					handleName();
			}
		}
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXhQbGFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBcUJ3QixRQUFROzs7Ozs7VUFBUixRQUFRIiwiZmlsZSI6ImxleFBsYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvYywge1Bvc30gZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2ssIGZhaWwsIG9wdGlvbnMsIHdhcm59IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge051bWJlckxpdGVyYWx9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtEb2NDb21tZW50LCBHcm91cCwgR3JvdXBzLCBpc0tleXdvcmQsIEtleXdvcmQsIEtleXdvcmRzLCBOYW1lLCBvcEtleXdvcmRLaW5kRnJvbU5hbWVcblx0fSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aWZFbHNlLCBpc0VtcHR5LCBsYXN0fSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtDaGFycywgaXNEaWdpdCwgaXNEaWdpdEJpbmFyeSwgaXNEaWdpdEhleCwgaXNEaWdpdE9jdGFsLCBpc05hbWVDaGFyYWN0ZXIsIHNob3dDaGFyXG5cdH0gZnJvbSAnLi9jaGFycydcbmltcG9ydCB7YWRkVG9DdXJyZW50R3JvdXAsIGNsb3NlR3JvdXAsIGNsb3NlR3JvdXBzRm9yRGVkZW50LCBjbG9zZUxpbmUsXG5cdGNsb3NlUGFyZW50aGVzaXMsIGNsb3NlU3BhY2VPS0lmRW1wdHksIGN1ckdyb3VwLCBvcGVuR3JvdXAsIG9wZW5MaW5lLCBvcGVuUGFyZW50aGVzaXMsIHNwYWNlXG5cdH0gZnJvbSAnLi9ncm91cENvbnRleHQnXG5pbXBvcnQge2xleFF1b3RlfSBmcm9tICcuL2xleConXG5pbXBvcnQge2NvbHVtbiwgZWF0LCBlYXRSZXN0T2ZMaW5lLCBpbmRleCwgbXVzdEVhdCwgbGluZSwgcGVlaywgcG9zLCBzb3VyY2VTdHJpbmcsIHNraXAsXG5cdHNraXBOZXdsaW5lcywgc2tpcFJlc3RPZkxpbmUsIHNraXBXaGlsZSwgc2tpcFdoaWxlRXF1YWxzLCB0YWtlV2hpbGVXaXRoUHJldiwgdHJ5RWF0LCB0cnlFYXQyLFxuXHR0cnlFYXQzfSBmcm9tICcuL3NvdXJjZUNvbnRleHQnXG5cbi8qXG5JbiB0aGUgY2FzZSBvZiBxdW90ZSBpbnRlcnBvbGF0aW9uIChcImF7Yn1jXCIpIHdlJ2xsIHJlY3Vyc2UgYmFjayBpbnRvIGhlcmUuXG5XaGVuIGlzSW5RdW90ZSBpcyB0cnVlLCB3ZSB3aWxsIG5vdCBhbGxvdyBuZXdsaW5lcy5cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBsZXhQbGFpbihpc0luUXVvdGUpIHtcblx0Ly8gVGhpcyB0ZWxscyB1cyB3aGljaCBpbmRlbnRlZCBibG9jayB3ZSdyZSBpbi5cblx0Ly8gSW5jcmVtZW50aW5nIGl0IG1lYW5zIGlzc3VpbmcgYSBHUF9PcGVuQmxvY2sgYW5kIGRlY3JlbWVudGluZyBpdCBtZWFucyBhIEdQX0Nsb3NlQmxvY2suXG5cdC8vIERvZXMgbm90aGluZyBpZiBpc0luUXVvdGUuXG5cdGxldCBpbmRlbnQgPSAwXG5cblx0Ly8gVGhpcyBpcyB3aGVyZSB3ZSBzdGFydGVkIGxleGluZyB0aGUgY3VycmVudCB0b2tlbi5cblx0bGV0IHN0YXJ0Q29sdW1uXG5cdGZ1bmN0aW9uIHN0YXJ0UG9zKCkge1xuXHRcdHJldHVybiBuZXcgUG9zKGxpbmUsIHN0YXJ0Q29sdW1uKVxuXHR9XG5cdGZ1bmN0aW9uIGxvYygpIHtcblx0XHRyZXR1cm4gbmV3IExvYyhzdGFydFBvcygpLCBwb3MoKSlcblx0fVxuXHRmdW5jdGlvbiBrZXl3b3JkKGtpbmQpIHtcblx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgS2V5d29yZChsb2MoKSwga2luZCkpXG5cdH1cblx0ZnVuY3Rpb24gZnVuS2V5d29yZChraW5kKSB7XG5cdFx0a2V5d29yZChraW5kKVxuXHRcdC8vIEZpcnN0IGFyZyBpbiBpdHMgb3duIHNwYWNlZCBncm91cFxuXHRcdHNwYWNlKGxvYygpKVxuXHR9XG5cdGZ1bmN0aW9uIGVhdEFuZEFkZE51bWJlcigpIHtcblx0XHRjb25zdCBzdGFydEluZGV4ID0gaW5kZXggLSAxXG5cblx0XHR0cnlFYXQoQ2hhcnMuSHlwaGVuKVxuXHRcdGlmIChwZWVrKC0xKSA9PT0gQ2hhcnMuTjApIHtcblx0XHRcdGNvbnN0IHAgPSBwZWVrKClcblx0XHRcdHN3aXRjaCAocCkge1xuXHRcdFx0XHRjYXNlIENoYXJzLkxldHRlckI6IGNhc2UgQ2hhcnMuTGV0dGVyTzogY2FzZSBDaGFycy5MZXR0ZXJYOlxuXHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdGNvbnN0IGlzRGlnaXRTcGVjaWFsID1cblx0XHRcdFx0XHRcdHAgPT09IENoYXJzLkxldHRlckIgP1xuXHRcdFx0XHRcdFx0aXNEaWdpdEJpbmFyeSA6XG5cdFx0XHRcdFx0XHRwID09PSBDaGFycy5MZXR0ZXJPID9cblx0XHRcdFx0XHRcdGlzRGlnaXRPY3RhbCA6XG5cdFx0XHRcdFx0XHRpc0RpZ2l0SGV4XG5cdFx0XHRcdFx0c2tpcFdoaWxlKGlzRGlnaXRTcGVjaWFsKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgQ2hhcnMuRG90OlxuXHRcdFx0XHRcdGlmIChpc0RpZ2l0KHBlZWsoMSkpKSB7XG5cdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0KVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdGlmIChwZWVrKCkgPT09IENoYXJzLkRvdCAmJiBpc0RpZ2l0KHBlZWsoMSkpKSB7XG5cdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBzdHIgPSBzb3VyY2VTdHJpbmcuc2xpY2Uoc3RhcnRJbmRleCwgaW5kZXgpXG5cdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IE51bWJlckxpdGVyYWwobG9jKCksIHN0cikpXG5cdH1cblx0ZnVuY3Rpb24gZWF0SW5kZW50KCkge1xuXHRcdGNvbnN0IG9wdEluZGVudCA9IG9wdGlvbnMuaW5kZW50KClcblx0XHRpZiAob3B0SW5kZW50ID09PSAnXFx0Jykge1xuXHRcdFx0Y29uc3QgaW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKENoYXJzLlRhYilcblx0XHRcdGNoZWNrKHBlZWsoKSAhPT0gQ2hhcnMuU3BhY2UsIHBvcywgJ0xpbmUgYmVnaW5zIGluIGEgc3BhY2UnKVxuXHRcdFx0cmV0dXJuIGluZGVudFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBzcGFjZXMgPSBza2lwV2hpbGVFcXVhbHMoQ2hhcnMuU3BhY2UpXG5cdFx0XHRjaGVjayhzcGFjZXMgJSBvcHRJbmRlbnQgPT09IDAsIHBvcywgKCkgPT5cblx0XHRcdFx0YEluZGVudGF0aW9uIHNwYWNlcyBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgJHtvcHRJbmRlbnR9YClcblx0XHRcdHJldHVybiBzcGFjZXMgLyBvcHRJbmRlbnRcblx0XHR9XG5cdH1cblxuXG5cdGZ1bmN0aW9uIGhhbmRsZU5hbWUoKSB7XG5cdFx0Y2hlY2soaXNOYW1lQ2hhcmFjdGVyKHBlZWsoLTEpKSwgbG9jKCksICgpID0+XG5cdFx0XHRgUmVzZXJ2ZWQgY2hhcmFjdGVyICR7c2hvd0NoYXIocGVlaygtMSkpfWApXG5cblx0XHQvLyBBbGwgb3RoZXIgY2hhcmFjdGVycyBzaG91bGQgYmUgaGFuZGxlZCBpbiBhIGNhc2UgYWJvdmUuXG5cdFx0Y29uc3QgbmFtZSA9IHRha2VXaGlsZVdpdGhQcmV2KGlzTmFtZUNoYXJhY3RlcilcblxuXHRcdGlmIChuYW1lLmVuZHNXaXRoKCdfJykpIHtcblx0XHRcdGlmIChuYW1lLmxlbmd0aCA+IDEpXG5cdFx0XHRcdGhhbmRsZU5hbWVUZXh0KG5hbWUuc2xpY2UoMCwgbmFtZS5sZW5ndGggLSAxKSlcblx0XHRcdGtleXdvcmQoS2V5d29yZHMuRm9jdXMpXG5cdFx0fSBlbHNlXG5cdFx0XHRoYW5kbGVOYW1lVGV4dChuYW1lKVxuXHR9XG5cdGZ1bmN0aW9uIGhhbmRsZU5hbWVUZXh0KG5hbWUpIHtcblx0XHRpZkVsc2Uob3BLZXl3b3JkS2luZEZyb21OYW1lKG5hbWUpLFxuXHRcdFx0a2luZCA9PiB7XG5cdFx0XHRcdHN3aXRjaCAoa2luZCkge1xuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuUmVnaW9uOlxuXHRcdFx0XHRcdFx0c2tpcFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5SZWdpb24pXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuVG9kbzpcblx0XHRcdFx0XHRcdC8vIFRPRE86IHdhcm5cblx0XHRcdFx0XHRcdHNraXBSZXN0T2ZMaW5lKClcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdGtleXdvcmQoa2luZClcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdCgpID0+IHtcblx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IE5hbWUobG9jKCksIG5hbWUpKVxuXHRcdFx0fSlcblx0fVxuXG5cdHdoaWxlICh0cnVlKSB7XG5cdFx0c3RhcnRDb2x1bW4gPSBjb2x1bW5cblx0XHRjb25zdCBjaGFyYWN0ZXJFYXRlbiA9IGVhdCgpXG5cdFx0Ly8gR2VuZXJhbGx5LCB0aGUgdHlwZSBvZiBhIHRva2VuIGlzIGRldGVybWluZWQgYnkgdGhlIGZpcnN0IGNoYXJhY3Rlci5cblx0XHRzd2l0Y2ggKGNoYXJhY3RlckVhdGVuKSB7XG5cdFx0XHRjYXNlIENoYXJzLk51bGw6XG5cdFx0XHRcdHJldHVyblxuXHRcdFx0Y2FzZSBDaGFycy5DbG9zZUJyYWNlOlxuXHRcdFx0XHRjaGVjayhpc0luUXVvdGUsIGxvYywgKCkgPT5cblx0XHRcdFx0XHRgUmVzZXJ2ZWQgY2hhcmFjdGVyICR7c2hvd0NoYXIoQ2hhcnMuQ2xvc2VCcmFjZSl9YClcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRjYXNlIENoYXJzLlF1b3RlOlxuXHRcdFx0XHRsZXhRdW90ZShpbmRlbnQpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdC8vIEdST1VQU1xuXG5cdFx0XHRjYXNlIENoYXJzLk9wZW5QYXJlbnRoZXNpczpcblx0XHRcdFx0aWYgKHRyeUVhdChDaGFycy5DbG9zZVBhcmVudGhlc2lzKSlcblx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgR3JvdXAobG9jKCksIFtdLCBHcm91cHMuUGFyZW50aGVzaXMpKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0b3BlblBhcmVudGhlc2lzKGxvYygpKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5PcGVuQnJhY2tldDpcblx0XHRcdFx0aWYgKHRyeUVhdChDaGFycy5DbG9zZUJyYWNrZXQpKVxuXHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBHcm91cChsb2MoKSwgW10sIEdyb3Vwcy5CcmFja2V0KSlcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0b3Blbkdyb3VwKHN0YXJ0UG9zKCksIEdyb3Vwcy5CcmFja2V0KVxuXHRcdFx0XHRcdG9wZW5Hcm91cChwb3MoKSwgR3JvdXBzLlNwYWNlKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLkNsb3NlUGFyZW50aGVzaXM6XG5cdFx0XHRcdGNsb3NlUGFyZW50aGVzaXMobG9jKCkpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLkNsb3NlQnJhY2tldDpcblx0XHRcdFx0Y2xvc2VHcm91cChzdGFydFBvcygpLCBHcm91cHMuU3BhY2UpXG5cdFx0XHRcdGNsb3NlR3JvdXAocG9zKCksIEdyb3Vwcy5CcmFja2V0KVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5TcGFjZTpcblx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLk5ld2xpbmU6IHtcblx0XHRcdFx0Y2hlY2soIWlzSW5RdW90ZSwgbG9jLCAnUXVvdGUgaW50ZXJwb2xhdGlvbiBjYW5ub3QgY29udGFpbiBuZXdsaW5lJylcblx0XHRcdFx0aWYgKHBlZWsoLTIpID09PSBDaGFycy5TcGFjZSlcblx0XHRcdFx0XHR3YXJuKHBvcywgJ0xpbmUgZW5kcyBpbiBhIHNwYWNlLicpXG5cblx0XHRcdFx0Ly8gU2tpcCBhbnkgYmxhbmsgbGluZXMuXG5cdFx0XHRcdHNraXBOZXdsaW5lcygpXG5cdFx0XHRcdGNvbnN0IG9sZEluZGVudCA9IGluZGVudFxuXHRcdFx0XHRpbmRlbnQgPSBlYXRJbmRlbnQoKVxuXHRcdFx0XHRpZiAoaW5kZW50ID4gb2xkSW5kZW50KSB7XG5cdFx0XHRcdFx0Y2hlY2soaW5kZW50ID09PSBvbGRJbmRlbnQgKyAxLCBsb2MsXG5cdFx0XHRcdFx0XHQnTGluZSBpcyBpbmRlbnRlZCBtb3JlIHRoYW4gb25jZScpXG5cdFx0XHRcdFx0Y29uc3QgbCA9IGxvYygpXG5cdFx0XHRcdFx0Ly8gQmxvY2sgYXQgZW5kIG9mIGxpbmUgZ29lcyBpbiBpdHMgb3duIHNwYWNlZCBncm91cC5cblx0XHRcdFx0XHQvLyBIb3dldmVyLCBgfmAgcHJlY2VkaW5nIGEgYmxvY2sgZ29lcyBpbiBhIGdyb3VwIHdpdGggaXQuXG5cdFx0XHRcdFx0aWYgKGlzRW1wdHkoY3VyR3JvdXAuc3ViVG9rZW5zKSB8fFxuXHRcdFx0XHRcdFx0IWlzS2V5d29yZChLZXl3b3Jkcy5MYXp5LCBsYXN0KGN1ckdyb3VwLnN1YlRva2VucykpKSB7XG5cdFx0XHRcdFx0XHRpZiAoY3VyR3JvdXAua2luZCA9PT0gR3JvdXBzLlNwYWNlKVxuXHRcdFx0XHRcdFx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KGwuc3RhcnQpXG5cdFx0XHRcdFx0XHRvcGVuR3JvdXAobC5lbmQsIEdyb3Vwcy5TcGFjZSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0b3Blbkdyb3VwKGwuc3RhcnQsIEdyb3Vwcy5CbG9jaylcblx0XHRcdFx0XHRvcGVuTGluZShsLmVuZClcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBsID0gbG9jKClcblx0XHRcdFx0XHRmb3IgKGxldCBpID0gaW5kZW50OyBpIDwgb2xkSW5kZW50OyBpID0gaSArIDEpXG5cdFx0XHRcdFx0XHRjbG9zZUdyb3Vwc0ZvckRlZGVudChsLnN0YXJ0KVxuXHRcdFx0XHRcdGNsb3NlTGluZShsLnN0YXJ0KVxuXHRcdFx0XHRcdG9wZW5MaW5lKGwuZW5kKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0XHRjYXNlIENoYXJzLlRhYjpcblx0XHRcdFx0Ly8gV2UgYWx3YXlzIGVhdCB0YWJzIGluIHRoZSBOZXdsaW5lIGhhbmRsZXIsXG5cdFx0XHRcdC8vIHNvIHRoaXMgd2lsbCBvbmx5IGhhcHBlbiBpbiB0aGUgbWlkZGxlIG9mIGEgbGluZS5cblx0XHRcdFx0ZmFpbChsb2MoKSwgJ1RhYiBtYXkgb25seSBiZSB1c2VkIHRvIGluZGVudCcpXG5cblx0XHRcdC8vIEZVTlxuXG5cdFx0XHRjYXNlIENoYXJzLkJhbmc6XG5cdFx0XHRcdGlmICh0cnlFYXQoQ2hhcnMuQmFyKSlcblx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1bkRvKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLkNhc2g6XG5cdFx0XHRcdGlmICh0cnlFYXQyKENoYXJzLkJhbmcsIENoYXJzLkJhcikpXG5cdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW5Bc3luY0RvKVxuXHRcdFx0XHRlbHNlIGlmICh0cnlFYXQoQ2hhcnMuQmFyKSlcblx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1bkFzeW5jKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLlN0YXI6XG5cdFx0XHRcdGlmICh0cnlFYXQyKENoYXJzLkJhbmcsIENoYXJzLkJhcikpXG5cdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW5HZW5Ebylcblx0XHRcdFx0ZWxzZSBpZiAodHJ5RWF0KENoYXJzLkJhcikpXG5cdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW5HZW4pXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRoYW5kbGVOYW1lKClcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuQmFyOlxuXHRcdFx0XHRpZiAodHJ5RWF0KENoYXJzLlNwYWNlKSB8fCB0cnlFYXQoQ2hhcnMuVGFiKSkge1xuXHRcdFx0XHRcdGNvbnN0IHRleHQgPSBlYXRSZXN0T2ZMaW5lKClcblx0XHRcdFx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KHN0YXJ0UG9zKCkpXG5cdFx0XHRcdFx0aWYgKCEoY3VyR3JvdXAua2luZCA9PT0gR3JvdXBzLkxpbmUgJiYgY3VyR3JvdXAuc3ViVG9rZW5zLmxlbmd0aCA9PT0gMCkpXG5cdFx0XHRcdFx0XHRmYWlsKGxvYyxcblx0XHRcdFx0XHRcdFx0YERvYyBjb21tZW50IG11c3QgZ28gb24gaXRzIG93biBsaW5lLiBEaWQgeW91IG1lYW4gJHtjb2RlKCd8fCcpfT9gKVxuXHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBEb2NDb21tZW50KGxvYygpLCB0ZXh0KSlcblx0XHRcdFx0fSBlbHNlIGlmICh0cnlFYXQoQ2hhcnMuQmFyKSlcblx0XHRcdFx0XHQvLyBub24tZG9jIGNvbW1lbnRcblx0XHRcdFx0XHRza2lwUmVzdE9mTGluZSgpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1bilcblx0XHRcdFx0YnJlYWtcblxuXHRcdFx0Ly8gTlVNQkVSXG5cblx0XHRcdGNhc2UgQ2hhcnMuSHlwaGVuOlxuXHRcdFx0XHRpZiAoaXNEaWdpdChwZWVrKCkpKVxuXHRcdFx0XHRcdC8vIGVhdEFuZEFkZE51bWJlcigpIGxvb2tzIGF0IHByZXYgY2hhcmFjdGVyLCBzbyBoeXBoZW4gaW5jbHVkZWQuXG5cdFx0XHRcdFx0ZWF0QW5kQWRkTnVtYmVyKClcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5OMDogY2FzZSBDaGFycy5OMTogY2FzZSBDaGFycy5OMjogY2FzZSBDaGFycy5OMzogY2FzZSBDaGFycy5ONDpcblx0XHRcdGNhc2UgQ2hhcnMuTjU6IGNhc2UgQ2hhcnMuTjY6IGNhc2UgQ2hhcnMuTjc6IGNhc2UgQ2hhcnMuTjg6IGNhc2UgQ2hhcnMuTjk6XG5cdFx0XHRcdGVhdEFuZEFkZE51bWJlcigpXG5cdFx0XHRcdGJyZWFrXG5cblxuXHRcdFx0Ly8gT1RIRVJcblxuXHRcdFx0Y2FzZSBDaGFycy5Eb3Q6IHtcblx0XHRcdFx0aWYgKHBlZWsoKSA9PT0gQ2hhcnMuU3BhY2UgfHwgcGVlaygpID09PSBDaGFycy5OZXdsaW5lKSB7XG5cdFx0XHRcdFx0Ly8gS2V5d29yZHMuT2JqRW50cnkgaW4gaXRzIG93biBzcGFjZWQgZ3JvdXAuXG5cdFx0XHRcdFx0Ly8gV2UgY2FuJ3QganVzdCBjcmVhdGUgYSBuZXcgR3JvdXAgaGVyZSBiZWNhdXNlIHdlIHdhbnQgdG9cblx0XHRcdFx0XHQvLyBlbnN1cmUgaXQncyBub3QgcGFydCBvZiB0aGUgcHJlY2VkaW5nIG9yIGZvbGxvd2luZyBzcGFjZWQgZ3JvdXAuXG5cdFx0XHRcdFx0Y2xvc2VTcGFjZU9LSWZFbXB0eShzdGFydFBvcygpKVxuXHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuT2JqQXNzaWduKVxuXHRcdFx0XHR9IGVsc2UgaWYgKHRyeUVhdChDaGFycy5CYXIpKVxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuVGhpcylcblx0XHRcdFx0ZWxzZSBpZiAodHJ5RWF0MihDaGFycy5CYW5nLCBDaGFycy5CYXIpKVxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuVGhpc0RvKVxuXHRcdFx0XHRlbHNlIGlmICh0cnlFYXQyKENoYXJzLlN0YXIsIENoYXJzLkJhcikpXG5cdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW5UaGlzR2VuKVxuXHRcdFx0XHRlbHNlIGlmICh0cnlFYXQzKENoYXJzLlN0YXIsIENoYXJzLkJhbmcsIENoYXJzLkJhcikpXG5cdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW5UaGlzR2VuRG8pXG5cdFx0XHRcdGVsc2UgaWYgKHRyeUVhdChDaGFycy5Eb3QpKVxuXHRcdFx0XHRcdGlmICh0cnlFYXQoQ2hhcnMuRG90KSlcblx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuRG90Mylcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkRvdDIpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkRvdClcblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblxuXHRcdFx0Y2FzZSBDaGFycy5Db2xvbjpcblx0XHRcdFx0aWYgKHRyeUVhdChDaGFycy5Db2xvbikpIHtcblx0XHRcdFx0XHRtdXN0RWF0KENoYXJzLkVxdWFsLCAnOjonKVxuXHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuQXNzaWduTXV0YWJsZSlcblx0XHRcdFx0fSBlbHNlIGlmICh0cnlFYXQoQ2hhcnMuRXF1YWwpKVxuXHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuTG9jYWxNdXRhdGUpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLlR5cGUpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdGNhc2UgQ2hhcnMuVGljazpcblx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5UaWNrKVxuXHRcdFx0XHRicmVha1xuXG5cdFx0XHRjYXNlIENoYXJzLlRpbGRlOlxuXHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkxhenkpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdGNhc2UgQ2hhcnMuQW1wZXJzYW5kOlxuXHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkFtcGVyc2FuZClcblx0XHRcdFx0YnJlYWtcblxuXHRcdFx0Y2FzZSBDaGFycy5CYWNrc2xhc2g6IGNhc2UgQ2hhcnMuQmFja3RpY2s6IGNhc2UgQ2hhcnMuQ2FyZXQ6XG5cdFx0XHRjYXNlIENoYXJzLkNvbW1hOiBjYXNlIENoYXJzLlBlcmNlbnQ6IGNhc2UgQ2hhcnMuU2VtaWNvbG9uOlxuXHRcdFx0XHRmYWlsKGxvYygpLCBgUmVzZXJ2ZWQgY2hhcmFjdGVyICR7c2hvd0NoYXIoY2hhcmFjdGVyRWF0ZW4pfWApXG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdH1cblx0fVxufVxuIl19
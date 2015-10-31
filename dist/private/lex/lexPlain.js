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

			if ((0, _sourceContext.peekPrev)() === _chars.Chars.N0) {
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
						if ((0, _chars.isDigit)((0, _sourceContext.peekNext)())) {
							(0, _sourceContext.skip)();
							(0, _sourceContext.skipWhile)(_chars.isDigit);
						}

						break;

					default:}
			} else {
				(0, _sourceContext.skipWhile)(_chars.isDigit);

				if ((0, _sourceContext.peek)() === _chars.Chars.Dot && (0, _chars.isDigit)((0, _sourceContext.peekNext)())) {
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
			(0, _context.check)((0, _chars.isNameCharacter)((0, _sourceContext.peekPrev)()), loc(), () => `Reserved character ${ (0, _chars.showChar)((0, _sourceContext.peekPrev)()) }`);
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
						if ((0, _sourceContext.peek2Before)() === _chars.Chars.Space) (0, _context.warn)(_sourceContext.pos, 'Line ends in a space.');
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
					if ((0, _sourceContext.tryEat)(_chars.Chars.Bang)) {
						(0, _sourceContext.mustEat)(_chars.Chars.Bar, '$!');
						funKeyword(_Token.Keywords.FunAsyncDo);
					} else if ((0, _sourceContext.tryEat)(_chars.Chars.Bar)) funKeyword(_Token.Keywords.FunAsync);else handleName();

					break;

				case _chars.Chars.Tilde:
					if ((0, _sourceContext.tryEat)(_chars.Chars.Bang)) {
						(0, _sourceContext.mustEat)(_chars.Chars.Bar, '~!');
						funKeyword(_Token.Keywords.FunGenDo);
					} else if ((0, _sourceContext.tryEat)(_chars.Chars.Bar)) funKeyword(_Token.Keywords.FunGen);else keyword(_Token.Keywords.Lazy);

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
						const next = (0, _sourceContext.peek)();

						if (next === _chars.Chars.Space || next === _chars.Chars.Newline) {
							(0, _groupContext.closeSpaceOKIfEmpty)(startPos());
							keyword(_Token.Keywords.ObjAssign);
						} else if (next === _chars.Chars.Bar) {
							(0, _sourceContext.skip)();
							keyword(_Token.Keywords.FunThis);
							(0, _groupContext.space)(loc());
						} else if (next === _chars.Chars.Bang && (0, _sourceContext.peekNext)() === _chars.Chars.Bar) {
							(0, _sourceContext.skip)();
							(0, _sourceContext.skip)();
							keyword(_Token.Keywords.FunThisDo);
							(0, _groupContext.space)(loc());
						} else if (next === _chars.Chars.Tilde) {
							(0, _sourceContext.skip)();

							if ((0, _sourceContext.tryEat)(_chars.Chars.Bang)) {
								(0, _sourceContext.mustEat)(_chars.Chars.Bar, '.~!');
								keyword(_Token.Keywords.FunThisGenDo);
							} else {
								(0, _sourceContext.mustEat)(_chars.Chars.Bar, '.~');
								keyword(_Token.Keywords.FunThisGen);
							}

							(0, _groupContext.space)(loc());
						} else if ((0, _sourceContext.tryEat)(_chars.Chars.Dot)) if ((0, _sourceContext.tryEat)(_chars.Chars.Dot)) keyword(_Token.Keywords.Dot3);else keyword(_Token.Keywords.Dot2);else keyword(_Token.Keywords.Dot);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXhQbGFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBcUJ3QixRQUFROzs7Ozs7VUFBUixRQUFRIiwiZmlsZSI6ImxleFBsYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvYywge1Bvc30gZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2ssIGZhaWwsIG9wdGlvbnMsIHdhcm59IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge051bWJlckxpdGVyYWx9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtEb2NDb21tZW50LCBHcm91cCwgR3JvdXBzLCBpc0tleXdvcmQsIEtleXdvcmQsIEtleXdvcmRzLCBOYW1lLCBvcEtleXdvcmRLaW5kRnJvbU5hbWVcblx0fSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aWZFbHNlLCBpc0VtcHR5LCBsYXN0fSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtDaGFycywgaXNEaWdpdCwgaXNEaWdpdEJpbmFyeSwgaXNEaWdpdEhleCwgaXNEaWdpdE9jdGFsLCBpc05hbWVDaGFyYWN0ZXIsIHNob3dDaGFyXG5cdH0gZnJvbSAnLi9jaGFycydcbmltcG9ydCB7YWRkVG9DdXJyZW50R3JvdXAsIGNsb3NlR3JvdXAsIGNsb3NlR3JvdXBzRm9yRGVkZW50LCBjbG9zZUxpbmUsXG5cdGNsb3NlUGFyZW50aGVzaXMsIGNsb3NlU3BhY2VPS0lmRW1wdHksIGN1ckdyb3VwLCBvcGVuR3JvdXAsIG9wZW5MaW5lLCBvcGVuUGFyZW50aGVzaXMsIHNwYWNlXG5cdH0gZnJvbSAnLi9ncm91cENvbnRleHQnXG5pbXBvcnQge2xleFF1b3RlfSBmcm9tICcuL2xleConXG5pbXBvcnQge2NvbHVtbiwgZWF0LCBlYXRSZXN0T2ZMaW5lLCBpbmRleCwgbXVzdEVhdCwgbGluZSwgcGVlaywgcGVla1ByZXYsIHBlZWtOZXh0LCBwZWVrMkJlZm9yZSxcblx0cG9zLCBzb3VyY2VTdHJpbmcsIHNraXAsIHNraXBOZXdsaW5lcywgc2tpcFJlc3RPZkxpbmUsIHNraXBXaGlsZSwgc2tpcFdoaWxlRXF1YWxzLFxuXHR0YWtlV2hpbGVXaXRoUHJldiwgdHJ5RWF0fSBmcm9tICcuL3NvdXJjZUNvbnRleHQnXG5cbi8qXG5JbiB0aGUgY2FzZSBvZiBxdW90ZSBpbnRlcnBvbGF0aW9uIChcImF7Yn1jXCIpIHdlJ2xsIHJlY3Vyc2UgYmFjayBpbnRvIGhlcmUuXG5XaGVuIGlzSW5RdW90ZSBpcyB0cnVlLCB3ZSB3aWxsIG5vdCBhbGxvdyBuZXdsaW5lcy5cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBsZXhQbGFpbihpc0luUXVvdGUpIHtcblx0Ly8gVGhpcyB0ZWxscyB1cyB3aGljaCBpbmRlbnRlZCBibG9jayB3ZSdyZSBpbi5cblx0Ly8gSW5jcmVtZW50aW5nIGl0IG1lYW5zIGlzc3VpbmcgYSBHUF9PcGVuQmxvY2sgYW5kIGRlY3JlbWVudGluZyBpdCBtZWFucyBhIEdQX0Nsb3NlQmxvY2suXG5cdC8vIERvZXMgbm90aGluZyBpZiBpc0luUXVvdGUuXG5cdGxldCBpbmRlbnQgPSAwXG5cblx0Ly8gVGhpcyBpcyB3aGVyZSB3ZSBzdGFydGVkIGxleGluZyB0aGUgY3VycmVudCB0b2tlbi5cblx0bGV0IHN0YXJ0Q29sdW1uXG5cdGZ1bmN0aW9uIHN0YXJ0UG9zKCkge1xuXHRcdHJldHVybiBuZXcgUG9zKGxpbmUsIHN0YXJ0Q29sdW1uKVxuXHR9XG5cdGZ1bmN0aW9uIGxvYygpIHtcblx0XHRyZXR1cm4gbmV3IExvYyhzdGFydFBvcygpLCBwb3MoKSlcblx0fVxuXHRmdW5jdGlvbiBrZXl3b3JkKGtpbmQpIHtcblx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgS2V5d29yZChsb2MoKSwga2luZCkpXG5cdH1cblx0ZnVuY3Rpb24gZnVuS2V5d29yZChraW5kKSB7XG5cdFx0a2V5d29yZChraW5kKVxuXHRcdC8vIEZpcnN0IGFyZyBpbiBpdHMgb3duIHNwYWNlZCBncm91cFxuXHRcdHNwYWNlKGxvYygpKVxuXHR9XG5cdGZ1bmN0aW9uIGVhdEFuZEFkZE51bWJlcigpIHtcblx0XHRjb25zdCBzdGFydEluZGV4ID0gaW5kZXggLSAxXG5cblx0XHR0cnlFYXQoQ2hhcnMuSHlwaGVuKVxuXHRcdGlmIChwZWVrUHJldigpID09PSBDaGFycy5OMCkge1xuXHRcdFx0Y29uc3QgcCA9IHBlZWsoKVxuXHRcdFx0c3dpdGNoIChwKSB7XG5cdFx0XHRcdGNhc2UgQ2hhcnMuTGV0dGVyQjogY2FzZSBDaGFycy5MZXR0ZXJPOiBjYXNlIENoYXJzLkxldHRlclg6XG5cdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0Y29uc3QgaXNEaWdpdFNwZWNpYWwgPVxuXHRcdFx0XHRcdFx0cCA9PT0gQ2hhcnMuTGV0dGVyQiA/XG5cdFx0XHRcdFx0XHRpc0RpZ2l0QmluYXJ5IDpcblx0XHRcdFx0XHRcdHAgPT09IENoYXJzLkxldHRlck8gP1xuXHRcdFx0XHRcdFx0aXNEaWdpdE9jdGFsIDpcblx0XHRcdFx0XHRcdGlzRGlnaXRIZXhcblx0XHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdFNwZWNpYWwpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBDaGFycy5Eb3Q6XG5cdFx0XHRcdFx0aWYgKGlzRGlnaXQocGVla05leHQoKSkpIHtcblx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0c2tpcFdoaWxlKGlzRGlnaXQpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNraXBXaGlsZShpc0RpZ2l0KVxuXHRcdFx0aWYgKHBlZWsoKSA9PT0gQ2hhcnMuRG90ICYmIGlzRGlnaXQocGVla05leHQoKSkpIHtcblx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0KVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IHN0ciA9IHNvdXJjZVN0cmluZy5zbGljZShzdGFydEluZGV4LCBpbmRleClcblx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgTnVtYmVyTGl0ZXJhbChsb2MoKSwgc3RyKSlcblx0fVxuXHRmdW5jdGlvbiBlYXRJbmRlbnQoKSB7XG5cdFx0Y29uc3Qgb3B0SW5kZW50ID0gb3B0aW9ucy5pbmRlbnQoKVxuXHRcdGlmIChvcHRJbmRlbnQgPT09ICdcXHQnKSB7XG5cdFx0XHRjb25zdCBpbmRlbnQgPSBza2lwV2hpbGVFcXVhbHMoQ2hhcnMuVGFiKVxuXHRcdFx0Y2hlY2socGVlaygpICE9PSBDaGFycy5TcGFjZSwgcG9zLCAnTGluZSBiZWdpbnMgaW4gYSBzcGFjZScpXG5cdFx0XHRyZXR1cm4gaW5kZW50XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHNwYWNlcyA9IHNraXBXaGlsZUVxdWFscyhDaGFycy5TcGFjZSlcblx0XHRcdGNoZWNrKHNwYWNlcyAlIG9wdEluZGVudCA9PT0gMCwgcG9zLCAoKSA9PlxuXHRcdFx0XHRgSW5kZW50YXRpb24gc3BhY2VzIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAke29wdEluZGVudH1gKVxuXHRcdFx0cmV0dXJuIHNwYWNlcyAvIG9wdEluZGVudFxuXHRcdH1cblx0fVxuXG5cblx0ZnVuY3Rpb24gaGFuZGxlTmFtZSgpIHtcblx0XHRjaGVjayhpc05hbWVDaGFyYWN0ZXIocGVla1ByZXYoKSksIGxvYygpLCAoKSA9PlxuXHRcdFx0YFJlc2VydmVkIGNoYXJhY3RlciAke3Nob3dDaGFyKHBlZWtQcmV2KCkpfWApXG5cblx0XHQvLyBBbGwgb3RoZXIgY2hhcmFjdGVycyBzaG91bGQgYmUgaGFuZGxlZCBpbiBhIGNhc2UgYWJvdmUuXG5cdFx0Y29uc3QgbmFtZSA9IHRha2VXaGlsZVdpdGhQcmV2KGlzTmFtZUNoYXJhY3RlcilcblxuXHRcdGlmIChuYW1lLmVuZHNXaXRoKCdfJykpIHtcblx0XHRcdGlmIChuYW1lLmxlbmd0aCA+IDEpXG5cdFx0XHRcdGhhbmRsZU5hbWVUZXh0KG5hbWUuc2xpY2UoMCwgbmFtZS5sZW5ndGggLSAxKSlcblx0XHRcdGtleXdvcmQoS2V5d29yZHMuRm9jdXMpXG5cdFx0fSBlbHNlXG5cdFx0XHRoYW5kbGVOYW1lVGV4dChuYW1lKVxuXHR9XG5cdGZ1bmN0aW9uIGhhbmRsZU5hbWVUZXh0KG5hbWUpIHtcblx0XHRpZkVsc2Uob3BLZXl3b3JkS2luZEZyb21OYW1lKG5hbWUpLFxuXHRcdFx0a2luZCA9PiB7XG5cdFx0XHRcdHN3aXRjaCAoa2luZCkge1xuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuUmVnaW9uOlxuXHRcdFx0XHRcdFx0c2tpcFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5SZWdpb24pXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuVG9kbzpcblx0XHRcdFx0XHRcdC8vIFRPRE86IHdhcm5cblx0XHRcdFx0XHRcdHNraXBSZXN0T2ZMaW5lKClcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdGtleXdvcmQoa2luZClcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdCgpID0+IHtcblx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IE5hbWUobG9jKCksIG5hbWUpKVxuXHRcdFx0fSlcblx0fVxuXG5cdHdoaWxlICh0cnVlKSB7XG5cdFx0c3RhcnRDb2x1bW4gPSBjb2x1bW5cblx0XHRjb25zdCBjaGFyYWN0ZXJFYXRlbiA9IGVhdCgpXG5cdFx0Ly8gR2VuZXJhbGx5LCB0aGUgdHlwZSBvZiBhIHRva2VuIGlzIGRldGVybWluZWQgYnkgdGhlIGZpcnN0IGNoYXJhY3Rlci5cblx0XHRzd2l0Y2ggKGNoYXJhY3RlckVhdGVuKSB7XG5cdFx0XHRjYXNlIENoYXJzLk51bGw6XG5cdFx0XHRcdHJldHVyblxuXHRcdFx0Y2FzZSBDaGFycy5DbG9zZUJyYWNlOlxuXHRcdFx0XHRjaGVjayhpc0luUXVvdGUsIGxvYywgKCkgPT5cblx0XHRcdFx0XHRgUmVzZXJ2ZWQgY2hhcmFjdGVyICR7c2hvd0NoYXIoQ2hhcnMuQ2xvc2VCcmFjZSl9YClcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRjYXNlIENoYXJzLlF1b3RlOlxuXHRcdFx0XHRsZXhRdW90ZShpbmRlbnQpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdC8vIEdST1VQU1xuXG5cdFx0XHRjYXNlIENoYXJzLk9wZW5QYXJlbnRoZXNpczpcblx0XHRcdFx0aWYgKHRyeUVhdChDaGFycy5DbG9zZVBhcmVudGhlc2lzKSlcblx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgR3JvdXAobG9jKCksIFtdLCBHcm91cHMuUGFyZW50aGVzaXMpKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0b3BlblBhcmVudGhlc2lzKGxvYygpKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5PcGVuQnJhY2tldDpcblx0XHRcdFx0aWYgKHRyeUVhdChDaGFycy5DbG9zZUJyYWNrZXQpKVxuXHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBHcm91cChsb2MoKSwgW10sIEdyb3Vwcy5CcmFja2V0KSlcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0b3Blbkdyb3VwKHN0YXJ0UG9zKCksIEdyb3Vwcy5CcmFja2V0KVxuXHRcdFx0XHRcdG9wZW5Hcm91cChwb3MoKSwgR3JvdXBzLlNwYWNlKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLkNsb3NlUGFyZW50aGVzaXM6XG5cdFx0XHRcdGNsb3NlUGFyZW50aGVzaXMobG9jKCkpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLkNsb3NlQnJhY2tldDpcblx0XHRcdFx0Y2xvc2VHcm91cChzdGFydFBvcygpLCBHcm91cHMuU3BhY2UpXG5cdFx0XHRcdGNsb3NlR3JvdXAocG9zKCksIEdyb3Vwcy5CcmFja2V0KVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5TcGFjZTpcblx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLk5ld2xpbmU6IHtcblx0XHRcdFx0Y2hlY2soIWlzSW5RdW90ZSwgbG9jLCAnUXVvdGUgaW50ZXJwb2xhdGlvbiBjYW5ub3QgY29udGFpbiBuZXdsaW5lJylcblx0XHRcdFx0aWYgKHBlZWsyQmVmb3JlKCkgPT09IENoYXJzLlNwYWNlKVxuXHRcdFx0XHRcdHdhcm4ocG9zLCAnTGluZSBlbmRzIGluIGEgc3BhY2UuJylcblxuXHRcdFx0XHQvLyBTa2lwIGFueSBibGFuayBsaW5lcy5cblx0XHRcdFx0c2tpcE5ld2xpbmVzKClcblx0XHRcdFx0Y29uc3Qgb2xkSW5kZW50ID0gaW5kZW50XG5cdFx0XHRcdGluZGVudCA9IGVhdEluZGVudCgpXG5cdFx0XHRcdGlmIChpbmRlbnQgPiBvbGRJbmRlbnQpIHtcblx0XHRcdFx0XHRjaGVjayhpbmRlbnQgPT09IG9sZEluZGVudCArIDEsIGxvYyxcblx0XHRcdFx0XHRcdCdMaW5lIGlzIGluZGVudGVkIG1vcmUgdGhhbiBvbmNlJylcblx0XHRcdFx0XHRjb25zdCBsID0gbG9jKClcblx0XHRcdFx0XHQvLyBCbG9jayBhdCBlbmQgb2YgbGluZSBnb2VzIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdC8vIEhvd2V2ZXIsIGB+YCBwcmVjZWRpbmcgYSBibG9jayBnb2VzIGluIGEgZ3JvdXAgd2l0aCBpdC5cblx0XHRcdFx0XHRpZiAoaXNFbXB0eShjdXJHcm91cC5zdWJUb2tlbnMpIHx8XG5cdFx0XHRcdFx0XHQhaXNLZXl3b3JkKEtleXdvcmRzLkxhenksIGxhc3QoY3VyR3JvdXAuc3ViVG9rZW5zKSkpIHtcblx0XHRcdFx0XHRcdGlmIChjdXJHcm91cC5raW5kID09PSBHcm91cHMuU3BhY2UpXG5cdFx0XHRcdFx0XHRcdGNsb3NlU3BhY2VPS0lmRW1wdHkobC5zdGFydClcblx0XHRcdFx0XHRcdG9wZW5Hcm91cChsLmVuZCwgR3JvdXBzLlNwYWNlKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRvcGVuR3JvdXAobC5zdGFydCwgR3JvdXBzLkJsb2NrKVxuXHRcdFx0XHRcdG9wZW5MaW5lKGwuZW5kKVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IGwgPSBsb2MoKVxuXHRcdFx0XHRcdGZvciAobGV0IGkgPSBpbmRlbnQ7IGkgPCBvbGRJbmRlbnQ7IGkgPSBpICsgMSlcblx0XHRcdFx0XHRcdGNsb3NlR3JvdXBzRm9yRGVkZW50KGwuc3RhcnQpXG5cdFx0XHRcdFx0Y2xvc2VMaW5lKGwuc3RhcnQpXG5cdFx0XHRcdFx0b3BlbkxpbmUobC5lbmQpXG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdGNhc2UgQ2hhcnMuVGFiOlxuXHRcdFx0XHQvLyBXZSBhbHdheXMgZWF0IHRhYnMgaW4gdGhlIE5ld2xpbmUgaGFuZGxlcixcblx0XHRcdFx0Ly8gc28gdGhpcyB3aWxsIG9ubHkgaGFwcGVuIGluIHRoZSBtaWRkbGUgb2YgYSBsaW5lLlxuXHRcdFx0XHRmYWlsKGxvYygpLCAnVGFiIG1heSBvbmx5IGJlIHVzZWQgdG8gaW5kZW50JylcblxuXHRcdFx0Ly8gRlVOXG5cblx0XHRcdGNhc2UgQ2hhcnMuQmFuZzpcblx0XHRcdFx0aWYgKHRyeUVhdChDaGFycy5CYXIpKVxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuRG8pXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRoYW5kbGVOYW1lKClcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuQ2FzaDpcblx0XHRcdFx0aWYgKHRyeUVhdChDaGFycy5CYW5nKSkge1xuXHRcdFx0XHRcdG11c3RFYXQoQ2hhcnMuQmFyLCAnJCEnKVxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuQXN5bmNEbylcblx0XHRcdFx0fSBlbHNlIGlmICh0cnlFYXQoQ2hhcnMuQmFyKSlcblx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1bkFzeW5jKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLlRpbGRlOlxuXHRcdFx0XHRpZiAodHJ5RWF0KENoYXJzLkJhbmcpKSB7XG5cdFx0XHRcdFx0bXVzdEVhdChDaGFycy5CYXIsICd+IScpXG5cdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW5HZW5Ebylcblx0XHRcdFx0fSBlbHNlIGlmICh0cnlFYXQoQ2hhcnMuQmFyKSlcblx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1bkdlbilcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuTGF6eSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuQmFyOlxuXHRcdFx0XHRpZiAodHJ5RWF0KENoYXJzLlNwYWNlKSB8fCB0cnlFYXQoQ2hhcnMuVGFiKSkge1xuXHRcdFx0XHRcdGNvbnN0IHRleHQgPSBlYXRSZXN0T2ZMaW5lKClcblx0XHRcdFx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KHN0YXJ0UG9zKCkpXG5cdFx0XHRcdFx0aWYgKCEoY3VyR3JvdXAua2luZCA9PT0gR3JvdXBzLkxpbmUgJiYgY3VyR3JvdXAuc3ViVG9rZW5zLmxlbmd0aCA9PT0gMCkpXG5cdFx0XHRcdFx0XHRmYWlsKGxvYyxcblx0XHRcdFx0XHRcdFx0YERvYyBjb21tZW50IG11c3QgZ28gb24gaXRzIG93biBsaW5lLiBEaWQgeW91IG1lYW4gJHtjb2RlKCd8fCcpfT9gKVxuXHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBEb2NDb21tZW50KGxvYygpLCB0ZXh0KSlcblx0XHRcdFx0fSBlbHNlIGlmICh0cnlFYXQoQ2hhcnMuQmFyKSlcblx0XHRcdFx0XHQvLyBub24tZG9jIGNvbW1lbnRcblx0XHRcdFx0XHRza2lwUmVzdE9mTGluZSgpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1bilcblx0XHRcdFx0YnJlYWtcblxuXHRcdFx0Ly8gTlVNQkVSXG5cblx0XHRcdGNhc2UgQ2hhcnMuSHlwaGVuOlxuXHRcdFx0XHRpZiAoaXNEaWdpdChwZWVrKCkpKVxuXHRcdFx0XHRcdC8vIGVhdEFuZEFkZE51bWJlcigpIGxvb2tzIGF0IHByZXYgY2hhcmFjdGVyLCBzbyBoeXBoZW4gaW5jbHVkZWQuXG5cdFx0XHRcdFx0ZWF0QW5kQWRkTnVtYmVyKClcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5OMDogY2FzZSBDaGFycy5OMTogY2FzZSBDaGFycy5OMjogY2FzZSBDaGFycy5OMzogY2FzZSBDaGFycy5ONDpcblx0XHRcdGNhc2UgQ2hhcnMuTjU6IGNhc2UgQ2hhcnMuTjY6IGNhc2UgQ2hhcnMuTjc6IGNhc2UgQ2hhcnMuTjg6IGNhc2UgQ2hhcnMuTjk6XG5cdFx0XHRcdGVhdEFuZEFkZE51bWJlcigpXG5cdFx0XHRcdGJyZWFrXG5cblxuXHRcdFx0Ly8gT1RIRVJcblxuXHRcdFx0Y2FzZSBDaGFycy5Eb3Q6IHtcblx0XHRcdFx0Y29uc3QgbmV4dCA9IHBlZWsoKVxuXHRcdFx0XHRpZiAobmV4dCA9PT0gQ2hhcnMuU3BhY2UgfHwgbmV4dCA9PT0gQ2hhcnMuTmV3bGluZSkge1xuXHRcdFx0XHRcdC8vIE9iakxpdCBhc3NpZ24gaW4gaXRzIG93biBzcGFjZWQgZ3JvdXAuXG5cdFx0XHRcdFx0Ly8gV2UgY2FuJ3QganVzdCBjcmVhdGUgYSBuZXcgR3JvdXAgaGVyZSBiZWNhdXNlIHdlIHdhbnQgdG9cblx0XHRcdFx0XHQvLyBlbnN1cmUgaXQncyBub3QgcGFydCBvZiB0aGUgcHJlY2VkaW5nIG9yIGZvbGxvd2luZyBzcGFjZWQgZ3JvdXAuXG5cdFx0XHRcdFx0Y2xvc2VTcGFjZU9LSWZFbXB0eShzdGFydFBvcygpKVxuXHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuT2JqQXNzaWduKVxuXHRcdFx0XHR9IGVsc2UgaWYgKG5leHQgPT09IENoYXJzLkJhcikge1xuXHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuRnVuVGhpcylcblx0XHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0fSBlbHNlIGlmIChuZXh0ID09PSBDaGFycy5CYW5nICYmIHBlZWtOZXh0KCkgPT09IENoYXJzLkJhcikge1xuXHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuRnVuVGhpc0RvKVxuXHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHR9IGVsc2UgaWYgKG5leHQgPT09IENoYXJzLlRpbGRlKSB7XG5cdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0aWYgKHRyeUVhdChDaGFycy5CYW5nKSkge1xuXHRcdFx0XHRcdFx0bXVzdEVhdChDaGFycy5CYXIsICcufiEnKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5GdW5UaGlzR2VuRG8pXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG11c3RFYXQoQ2hhcnMuQmFyLCAnLn4nKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5GdW5UaGlzR2VuKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0fSBlbHNlIGlmICh0cnlFYXQoQ2hhcnMuRG90KSlcblx0XHRcdFx0XHRpZiAodHJ5RWF0KENoYXJzLkRvdCkpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkRvdDMpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5Eb3QyKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5Eb3QpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cblx0XHRcdGNhc2UgQ2hhcnMuQ29sb246XG5cdFx0XHRcdGlmICh0cnlFYXQoQ2hhcnMuQ29sb24pKSB7XG5cdFx0XHRcdFx0bXVzdEVhdChDaGFycy5FcXVhbCwgJzo6Jylcblx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkFzc2lnbk11dGFibGUpXG5cdFx0XHRcdH0gZWxzZSBpZiAodHJ5RWF0KENoYXJzLkVxdWFsKSlcblx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkxvY2FsTXV0YXRlKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5UeXBlKVxuXHRcdFx0XHRicmVha1xuXG5cdFx0XHRjYXNlIENoYXJzLlRpY2s6XG5cdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuVGljaylcblx0XHRcdFx0YnJlYWtcblxuXHRcdFx0Y2FzZSBDaGFycy5BbXBlcnNhbmQ6XG5cdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuQW1wZXJzYW5kKVxuXHRcdFx0XHRicmVha1xuXG5cdFx0XHRjYXNlIENoYXJzLkJhY2tzbGFzaDogY2FzZSBDaGFycy5CYWNrdGljazogY2FzZSBDaGFycy5DYXJldDpcblx0XHRcdGNhc2UgQ2hhcnMuQ29tbWE6IGNhc2UgQ2hhcnMuUGVyY2VudDogY2FzZSBDaGFycy5TZW1pY29sb246XG5cdFx0XHRcdGZhaWwobG9jKCksIGBSZXNlcnZlZCBjaGFyYWN0ZXIgJHtzaG93Q2hhcihjaGFyYWN0ZXJFYXRlbil9YClcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0fVxuXHR9XG59XG4iXX0=
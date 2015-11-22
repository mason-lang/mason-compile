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

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

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
						} else if ((0, _sourceContext.tryEat)(_chars.Chars.Bar)) funKeyword(_Token.Keywords.FunThis);else if ((0, _sourceContext.tryEat2)(_chars.Chars.Bang, _chars.Chars.Bar)) funKeyword(_Token.Keywords.FunThisDo);else if ((0, _sourceContext.tryEat2)(_chars.Chars.Star, _chars.Chars.Bar)) funKeyword(_Token.Keywords.FunThisGen);else if ((0, _sourceContext.tryEat3)(_chars.Chars.Star, _chars.Chars.Bang, _chars.Chars.Bar)) funKeyword(_Token.Keywords.FunThisGenDo);else if ((0, _sourceContext.tryEat)(_chars.Chars.Dot)) {
							if ((0, _sourceContext.tryEat)(_chars.Chars.Dot)) keyword(_Token.Keywords.Dot3);else keyword(_Token.Keywords.Dot2);
						} else keyword(_Token.Keywords.Dot);

						break;
					}

				case _chars.Chars.Colon:
					if ((0, _sourceContext.tryEat)(_chars.Chars.Equal)) keyword(_Token.Keywords.LocalMutate);else keyword(_Token.Keywords.Colon);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXhQbGFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBcUJ3QixRQUFROzs7Ozs7Ozs7O1VBQVIsUUFBUSIsImZpbGUiOiJsZXhQbGFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2MsIHtQb3N9IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCBmYWlsLCBvcHRpb25zLCB3YXJufSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtOdW1iZXJMaXRlcmFsfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7RG9jQ29tbWVudCwgR3JvdXAsIEdyb3VwcywgaXNLZXl3b3JkLCBLZXl3b3JkLCBLZXl3b3JkcywgTmFtZSwgb3BLZXl3b3JkS2luZEZyb21OYW1lXG5cdH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2lmRWxzZSwgaXNFbXB0eSwgbGFzdH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Q2hhcnMsIGlzRGlnaXQsIGlzRGlnaXRCaW5hcnksIGlzRGlnaXRIZXgsIGlzRGlnaXRPY3RhbCwgaXNOYW1lQ2hhcmFjdGVyLCBzaG93Q2hhclxuXHR9IGZyb20gJy4vY2hhcnMnXG5pbXBvcnQge2FkZFRvQ3VycmVudEdyb3VwLCBjbG9zZUdyb3VwLCBjbG9zZUdyb3Vwc0ZvckRlZGVudCwgY2xvc2VMaW5lLFxuXHRjbG9zZVBhcmVudGhlc2lzLCBjbG9zZVNwYWNlT0tJZkVtcHR5LCBjdXJHcm91cCwgb3Blbkdyb3VwLCBvcGVuTGluZSwgb3BlblBhcmVudGhlc2lzLCBzcGFjZVxuXHR9IGZyb20gJy4vZ3JvdXBDb250ZXh0J1xuaW1wb3J0IHtsZXhRdW90ZX0gZnJvbSAnLi9sZXgqJ1xuaW1wb3J0IHtjb2x1bW4sIGVhdCwgZWF0UmVzdE9mTGluZSwgaW5kZXgsIGxpbmUsIHBlZWssIHBvcywgc291cmNlU3RyaW5nLCBza2lwLCBza2lwTmV3bGluZXMsXG5cdHNraXBSZXN0T2ZMaW5lLCBza2lwV2hpbGUsIHNraXBXaGlsZUVxdWFscywgdGFrZVdoaWxlV2l0aFByZXYsIHRyeUVhdCwgdHJ5RWF0MiwgdHJ5RWF0M1xuXHR9IGZyb20gJy4vc291cmNlQ29udGV4dCdcblxuLypcbkluIHRoZSBjYXNlIG9mIHF1b3RlIGludGVycG9sYXRpb24gKFwiYXtifWNcIikgd2UnbGwgcmVjdXJzZSBiYWNrIGludG8gaGVyZS5cbldoZW4gaXNJblF1b3RlIGlzIHRydWUsIHdlIHdpbGwgbm90IGFsbG93IG5ld2xpbmVzLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxleFBsYWluKGlzSW5RdW90ZSkge1xuXHQvLyBUaGlzIHRlbGxzIHVzIHdoaWNoIGluZGVudGVkIGJsb2NrIHdlJ3JlIGluLlxuXHQvLyBJbmNyZW1lbnRpbmcgaXQgbWVhbnMgaXNzdWluZyBhIEdQX09wZW5CbG9jayBhbmQgZGVjcmVtZW50aW5nIGl0IG1lYW5zIGEgR1BfQ2xvc2VCbG9jay5cblx0Ly8gRG9lcyBub3RoaW5nIGlmIGlzSW5RdW90ZS5cblx0bGV0IGluZGVudCA9IDBcblxuXHQvLyBUaGlzIGlzIHdoZXJlIHdlIHN0YXJ0ZWQgbGV4aW5nIHRoZSBjdXJyZW50IHRva2VuLlxuXHRsZXQgc3RhcnRDb2x1bW5cblx0ZnVuY3Rpb24gc3RhcnRQb3MoKSB7XG5cdFx0cmV0dXJuIG5ldyBQb3MobGluZSwgc3RhcnRDb2x1bW4pXG5cdH1cblx0ZnVuY3Rpb24gbG9jKCkge1xuXHRcdHJldHVybiBuZXcgTG9jKHN0YXJ0UG9zKCksIHBvcygpKVxuXHR9XG5cdGZ1bmN0aW9uIGtleXdvcmQoa2luZCkge1xuXHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBLZXl3b3JkKGxvYygpLCBraW5kKSlcblx0fVxuXHRmdW5jdGlvbiBmdW5LZXl3b3JkKGtpbmQpIHtcblx0XHRrZXl3b3JkKGtpbmQpXG5cdFx0Ly8gRmlyc3QgYXJnIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwXG5cdFx0c3BhY2UobG9jKCkpXG5cdH1cblx0ZnVuY3Rpb24gZWF0QW5kQWRkTnVtYmVyKCkge1xuXHRcdGNvbnN0IHN0YXJ0SW5kZXggPSBpbmRleCAtIDFcblxuXHRcdHRyeUVhdChDaGFycy5IeXBoZW4pXG5cdFx0aWYgKHBlZWsoLTEpID09PSBDaGFycy5OMCkge1xuXHRcdFx0Y29uc3QgcCA9IHBlZWsoKVxuXHRcdFx0c3dpdGNoIChwKSB7XG5cdFx0XHRcdGNhc2UgQ2hhcnMuTGV0dGVyQjogY2FzZSBDaGFycy5MZXR0ZXJPOiBjYXNlIENoYXJzLkxldHRlclg6XG5cdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0Y29uc3QgaXNEaWdpdFNwZWNpYWwgPVxuXHRcdFx0XHRcdFx0cCA9PT0gQ2hhcnMuTGV0dGVyQiA/XG5cdFx0XHRcdFx0XHRpc0RpZ2l0QmluYXJ5IDpcblx0XHRcdFx0XHRcdHAgPT09IENoYXJzLkxldHRlck8gP1xuXHRcdFx0XHRcdFx0aXNEaWdpdE9jdGFsIDpcblx0XHRcdFx0XHRcdGlzRGlnaXRIZXhcblx0XHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdFNwZWNpYWwpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBDaGFycy5Eb3Q6XG5cdFx0XHRcdFx0aWYgKGlzRGlnaXQocGVlaygxKSkpIHtcblx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0c2tpcFdoaWxlKGlzRGlnaXQpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNraXBXaGlsZShpc0RpZ2l0KVxuXHRcdFx0aWYgKHBlZWsoKSA9PT0gQ2hhcnMuRG90ICYmIGlzRGlnaXQocGVlaygxKSkpIHtcblx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0KVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IHN0ciA9IHNvdXJjZVN0cmluZy5zbGljZShzdGFydEluZGV4LCBpbmRleClcblx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgTnVtYmVyTGl0ZXJhbChsb2MoKSwgc3RyKSlcblx0fVxuXHRmdW5jdGlvbiBlYXRJbmRlbnQoKSB7XG5cdFx0Y29uc3Qgb3B0SW5kZW50ID0gb3B0aW9ucy5pbmRlbnQoKVxuXHRcdGlmIChvcHRJbmRlbnQgPT09ICdcXHQnKSB7XG5cdFx0XHRjb25zdCBpbmRlbnQgPSBza2lwV2hpbGVFcXVhbHMoQ2hhcnMuVGFiKVxuXHRcdFx0Y2hlY2socGVlaygpICE9PSBDaGFycy5TcGFjZSwgcG9zLCAnTGluZSBiZWdpbnMgaW4gYSBzcGFjZScpXG5cdFx0XHRyZXR1cm4gaW5kZW50XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHNwYWNlcyA9IHNraXBXaGlsZUVxdWFscyhDaGFycy5TcGFjZSlcblx0XHRcdGNoZWNrKHNwYWNlcyAlIG9wdEluZGVudCA9PT0gMCwgcG9zLCAoKSA9PlxuXHRcdFx0XHRgSW5kZW50YXRpb24gc3BhY2VzIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAke29wdEluZGVudH1gKVxuXHRcdFx0cmV0dXJuIHNwYWNlcyAvIG9wdEluZGVudFxuXHRcdH1cblx0fVxuXG5cblx0ZnVuY3Rpb24gaGFuZGxlTmFtZSgpIHtcblx0XHRjaGVjayhpc05hbWVDaGFyYWN0ZXIocGVlaygtMSkpLCBsb2MoKSwgKCkgPT5cblx0XHRcdGBSZXNlcnZlZCBjaGFyYWN0ZXIgJHtzaG93Q2hhcihwZWVrKC0xKSl9YClcblxuXHRcdC8vIEFsbCBvdGhlciBjaGFyYWN0ZXJzIHNob3VsZCBiZSBoYW5kbGVkIGluIGEgY2FzZSBhYm92ZS5cblx0XHRjb25zdCBuYW1lID0gdGFrZVdoaWxlV2l0aFByZXYoaXNOYW1lQ2hhcmFjdGVyKVxuXG5cdFx0aWYgKG5hbWUuZW5kc1dpdGgoJ18nKSkge1xuXHRcdFx0aWYgKG5hbWUubGVuZ3RoID4gMSlcblx0XHRcdFx0aGFuZGxlTmFtZVRleHQobmFtZS5zbGljZSgwLCBuYW1lLmxlbmd0aCAtIDEpKVxuXHRcdFx0a2V5d29yZChLZXl3b3Jkcy5Gb2N1cylcblx0XHR9IGVsc2Vcblx0XHRcdGhhbmRsZU5hbWVUZXh0KG5hbWUpXG5cdH1cblx0ZnVuY3Rpb24gaGFuZGxlTmFtZVRleHQobmFtZSkge1xuXHRcdGlmRWxzZShvcEtleXdvcmRLaW5kRnJvbU5hbWUobmFtZSksXG5cdFx0XHRraW5kID0+IHtcblx0XHRcdFx0c3dpdGNoIChraW5kKSB7XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5SZWdpb246XG5cdFx0XHRcdFx0XHRza2lwUmVzdE9mTGluZSgpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLlJlZ2lvbilcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Ub2RvOlxuXHRcdFx0XHRcdFx0Ly8gVE9ETzogd2FyblxuXHRcdFx0XHRcdFx0c2tpcFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0a2V5d29yZChraW5kKVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgTmFtZShsb2MoKSwgbmFtZSkpXG5cdFx0XHR9KVxuXHR9XG5cblx0d2hpbGUgKHRydWUpIHtcblx0XHRzdGFydENvbHVtbiA9IGNvbHVtblxuXHRcdGNvbnN0IGNoYXJhY3RlckVhdGVuID0gZWF0KClcblx0XHQvLyBHZW5lcmFsbHksIHRoZSB0eXBlIG9mIGEgdG9rZW4gaXMgZGV0ZXJtaW5lZCBieSB0aGUgZmlyc3QgY2hhcmFjdGVyLlxuXHRcdHN3aXRjaCAoY2hhcmFjdGVyRWF0ZW4pIHtcblx0XHRcdGNhc2UgQ2hhcnMuTnVsbDpcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRjYXNlIENoYXJzLkNsb3NlQnJhY2U6XG5cdFx0XHRcdGNoZWNrKGlzSW5RdW90ZSwgbG9jLCAoKSA9PlxuXHRcdFx0XHRcdGBSZXNlcnZlZCBjaGFyYWN0ZXIgJHtzaG93Q2hhcihDaGFycy5DbG9zZUJyYWNlKX1gKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdGNhc2UgQ2hhcnMuUXVvdGU6XG5cdFx0XHRcdGxleFF1b3RlKGluZGVudClcblx0XHRcdFx0YnJlYWtcblxuXHRcdFx0Ly8gR1JPVVBTXG5cblx0XHRcdGNhc2UgQ2hhcnMuT3BlblBhcmVudGhlc2lzOlxuXHRcdFx0XHRpZiAodHJ5RWF0KENoYXJzLkNsb3NlUGFyZW50aGVzaXMpKVxuXHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBHcm91cChsb2MoKSwgW10sIEdyb3Vwcy5QYXJlbnRoZXNpcykpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRvcGVuUGFyZW50aGVzaXMobG9jKCkpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLk9wZW5CcmFja2V0OlxuXHRcdFx0XHRpZiAodHJ5RWF0KENoYXJzLkNsb3NlQnJhY2tldCkpXG5cdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IEdyb3VwKGxvYygpLCBbXSwgR3JvdXBzLkJyYWNrZXQpKVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRvcGVuR3JvdXAoc3RhcnRQb3MoKSwgR3JvdXBzLkJyYWNrZXQpXG5cdFx0XHRcdFx0b3Blbkdyb3VwKHBvcygpLCBHcm91cHMuU3BhY2UpXG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuQ2xvc2VQYXJlbnRoZXNpczpcblx0XHRcdFx0Y2xvc2VQYXJlbnRoZXNpcyhsb2MoKSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuQ2xvc2VCcmFja2V0OlxuXHRcdFx0XHRjbG9zZUdyb3VwKHN0YXJ0UG9zKCksIEdyb3Vwcy5TcGFjZSlcblx0XHRcdFx0Y2xvc2VHcm91cChwb3MoKSwgR3JvdXBzLkJyYWNrZXQpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLlNwYWNlOlxuXHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuTmV3bGluZToge1xuXHRcdFx0XHRjaGVjayghaXNJblF1b3RlLCBsb2MsICdRdW90ZSBpbnRlcnBvbGF0aW9uIGNhbm5vdCBjb250YWluIG5ld2xpbmUnKVxuXHRcdFx0XHRpZiAocGVlaygtMikgPT09IENoYXJzLlNwYWNlKVxuXHRcdFx0XHRcdHdhcm4ocG9zLCAnTGluZSBlbmRzIGluIGEgc3BhY2UuJylcblxuXHRcdFx0XHQvLyBTa2lwIGFueSBibGFuayBsaW5lcy5cblx0XHRcdFx0c2tpcE5ld2xpbmVzKClcblx0XHRcdFx0Y29uc3Qgb2xkSW5kZW50ID0gaW5kZW50XG5cdFx0XHRcdGluZGVudCA9IGVhdEluZGVudCgpXG5cdFx0XHRcdGlmIChpbmRlbnQgPiBvbGRJbmRlbnQpIHtcblx0XHRcdFx0XHRjaGVjayhpbmRlbnQgPT09IG9sZEluZGVudCArIDEsIGxvYyxcblx0XHRcdFx0XHRcdCdMaW5lIGlzIGluZGVudGVkIG1vcmUgdGhhbiBvbmNlJylcblx0XHRcdFx0XHRjb25zdCBsID0gbG9jKClcblx0XHRcdFx0XHQvLyBCbG9jayBhdCBlbmQgb2YgbGluZSBnb2VzIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdC8vIEhvd2V2ZXIsIGB+YCBwcmVjZWRpbmcgYSBibG9jayBnb2VzIGluIGEgZ3JvdXAgd2l0aCBpdC5cblx0XHRcdFx0XHRpZiAoaXNFbXB0eShjdXJHcm91cC5zdWJUb2tlbnMpIHx8XG5cdFx0XHRcdFx0XHQhaXNLZXl3b3JkKEtleXdvcmRzLkxhenksIGxhc3QoY3VyR3JvdXAuc3ViVG9rZW5zKSkpIHtcblx0XHRcdFx0XHRcdGlmIChjdXJHcm91cC5raW5kID09PSBHcm91cHMuU3BhY2UpXG5cdFx0XHRcdFx0XHRcdGNsb3NlU3BhY2VPS0lmRW1wdHkobC5zdGFydClcblx0XHRcdFx0XHRcdG9wZW5Hcm91cChsLmVuZCwgR3JvdXBzLlNwYWNlKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRvcGVuR3JvdXAobC5zdGFydCwgR3JvdXBzLkJsb2NrKVxuXHRcdFx0XHRcdG9wZW5MaW5lKGwuZW5kKVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IGwgPSBsb2MoKVxuXHRcdFx0XHRcdGZvciAobGV0IGkgPSBpbmRlbnQ7IGkgPCBvbGRJbmRlbnQ7IGkgPSBpICsgMSlcblx0XHRcdFx0XHRcdGNsb3NlR3JvdXBzRm9yRGVkZW50KGwuc3RhcnQpXG5cdFx0XHRcdFx0Y2xvc2VMaW5lKGwuc3RhcnQpXG5cdFx0XHRcdFx0b3BlbkxpbmUobC5lbmQpXG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdGNhc2UgQ2hhcnMuVGFiOlxuXHRcdFx0XHQvLyBXZSBhbHdheXMgZWF0IHRhYnMgaW4gdGhlIE5ld2xpbmUgaGFuZGxlcixcblx0XHRcdFx0Ly8gc28gdGhpcyB3aWxsIG9ubHkgaGFwcGVuIGluIHRoZSBtaWRkbGUgb2YgYSBsaW5lLlxuXHRcdFx0XHRmYWlsKGxvYygpLCAnVGFiIG1heSBvbmx5IGJlIHVzZWQgdG8gaW5kZW50JylcblxuXHRcdFx0Ly8gRlVOXG5cblx0XHRcdGNhc2UgQ2hhcnMuQmFuZzpcblx0XHRcdFx0aWYgKHRyeUVhdChDaGFycy5CYXIpKVxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuRG8pXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRoYW5kbGVOYW1lKClcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuQ2FzaDpcblx0XHRcdFx0aWYgKHRyeUVhdDIoQ2hhcnMuQmFuZywgQ2hhcnMuQmFyKSlcblx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1bkFzeW5jRG8pXG5cdFx0XHRcdGVsc2UgaWYgKHRyeUVhdChDaGFycy5CYXIpKVxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuQXN5bmMpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRoYW5kbGVOYW1lKClcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuU3Rhcjpcblx0XHRcdFx0aWYgKHRyeUVhdDIoQ2hhcnMuQmFuZywgQ2hhcnMuQmFyKSlcblx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1bkdlbkRvKVxuXHRcdFx0XHRlbHNlIGlmICh0cnlFYXQoQ2hhcnMuQmFyKSlcblx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1bkdlbilcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5CYXI6XG5cdFx0XHRcdGlmICh0cnlFYXQoQ2hhcnMuU3BhY2UpIHx8IHRyeUVhdChDaGFycy5UYWIpKSB7XG5cdFx0XHRcdFx0Y29uc3QgdGV4dCA9IGVhdFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRcdGNsb3NlU3BhY2VPS0lmRW1wdHkoc3RhcnRQb3MoKSlcblx0XHRcdFx0XHRpZiAoIShjdXJHcm91cC5raW5kID09PSBHcm91cHMuTGluZSAmJiBjdXJHcm91cC5zdWJUb2tlbnMubGVuZ3RoID09PSAwKSlcblx0XHRcdFx0XHRcdGZhaWwobG9jLFxuXHRcdFx0XHRcdFx0XHRgRG9jIGNvbW1lbnQgbXVzdCBnbyBvbiBpdHMgb3duIGxpbmUuIERpZCB5b3UgbWVhbiAke2NvZGUoJ3x8Jyl9P2ApXG5cdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IERvY0NvbW1lbnQobG9jKCksIHRleHQpKVxuXHRcdFx0XHR9IGVsc2UgaWYgKHRyeUVhdChDaGFycy5CYXIpKVxuXHRcdFx0XHRcdC8vIG5vbi1kb2MgY29tbWVudFxuXHRcdFx0XHRcdHNraXBSZXN0T2ZMaW5lKClcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuKVxuXHRcdFx0XHRicmVha1xuXG5cdFx0XHQvLyBOVU1CRVJcblxuXHRcdFx0Y2FzZSBDaGFycy5IeXBoZW46XG5cdFx0XHRcdGlmIChpc0RpZ2l0KHBlZWsoKSkpXG5cdFx0XHRcdFx0Ly8gZWF0QW5kQWRkTnVtYmVyKCkgbG9va3MgYXQgcHJldiBjaGFyYWN0ZXIsIHNvIGh5cGhlbiBpbmNsdWRlZC5cblx0XHRcdFx0XHRlYXRBbmRBZGROdW1iZXIoKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLk4wOiBjYXNlIENoYXJzLk4xOiBjYXNlIENoYXJzLk4yOiBjYXNlIENoYXJzLk4zOiBjYXNlIENoYXJzLk40OlxuXHRcdFx0Y2FzZSBDaGFycy5ONTogY2FzZSBDaGFycy5ONjogY2FzZSBDaGFycy5ONzogY2FzZSBDaGFycy5OODogY2FzZSBDaGFycy5OOTpcblx0XHRcdFx0ZWF0QW5kQWRkTnVtYmVyKClcblx0XHRcdFx0YnJlYWtcblxuXG5cdFx0XHQvLyBPVEhFUlxuXG5cdFx0XHRjYXNlIENoYXJzLkRvdDoge1xuXHRcdFx0XHRpZiAocGVlaygpID09PSBDaGFycy5TcGFjZSB8fCBwZWVrKCkgPT09IENoYXJzLk5ld2xpbmUpIHtcblx0XHRcdFx0XHQvLyBLZXl3b3Jkcy5PYmpFbnRyeSBpbiBpdHMgb3duIHNwYWNlZCBncm91cC5cblx0XHRcdFx0XHQvLyBXZSBjYW4ndCBqdXN0IGNyZWF0ZSBhIG5ldyBHcm91cCBoZXJlIGJlY2F1c2Ugd2Ugd2FudCB0b1xuXHRcdFx0XHRcdC8vIGVuc3VyZSBpdCdzIG5vdCBwYXJ0IG9mIHRoZSBwcmVjZWRpbmcgb3IgZm9sbG93aW5nIHNwYWNlZCBncm91cC5cblx0XHRcdFx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KHN0YXJ0UG9zKCkpXG5cdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5PYmpBc3NpZ24pXG5cdFx0XHRcdH0gZWxzZSBpZiAodHJ5RWF0KENoYXJzLkJhcikpXG5cdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW5UaGlzKVxuXHRcdFx0XHRlbHNlIGlmICh0cnlFYXQyKENoYXJzLkJhbmcsIENoYXJzLkJhcikpXG5cdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW5UaGlzRG8pXG5cdFx0XHRcdGVsc2UgaWYgKHRyeUVhdDIoQ2hhcnMuU3RhciwgQ2hhcnMuQmFyKSlcblx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1blRoaXNHZW4pXG5cdFx0XHRcdGVsc2UgaWYgKHRyeUVhdDMoQ2hhcnMuU3RhciwgQ2hhcnMuQmFuZywgQ2hhcnMuQmFyKSlcblx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1blRoaXNHZW5Ebylcblx0XHRcdFx0ZWxzZSBpZiAodHJ5RWF0KENoYXJzLkRvdCkpXG5cdFx0XHRcdFx0aWYgKHRyeUVhdChDaGFycy5Eb3QpKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5Eb3QzKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuRG90Milcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuRG90KVxuXHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXG5cdFx0XHRjYXNlIENoYXJzLkNvbG9uOlxuXHRcdFx0XHRpZiAodHJ5RWF0KENoYXJzLkVxdWFsKSlcblx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkxvY2FsTXV0YXRlKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5Db2xvbilcblx0XHRcdFx0YnJlYWtcblxuXHRcdFx0Y2FzZSBDaGFycy5UaWNrOlxuXHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLlRpY2spXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdGNhc2UgQ2hhcnMuVGlsZGU6XG5cdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuTGF6eSlcblx0XHRcdFx0YnJlYWtcblxuXHRcdFx0Y2FzZSBDaGFycy5BbXBlcnNhbmQ6XG5cdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuQW1wZXJzYW5kKVxuXHRcdFx0XHRicmVha1xuXG5cdFx0XHRjYXNlIENoYXJzLkJhY2tzbGFzaDogY2FzZSBDaGFycy5CYWNrdGljazogY2FzZSBDaGFycy5DYXJldDpcblx0XHRcdGNhc2UgQ2hhcnMuQ29tbWE6IGNhc2UgQ2hhcnMuUGVyY2VudDogY2FzZSBDaGFycy5TZW1pY29sb246XG5cdFx0XHRcdGZhaWwobG9jKCksIGBSZXNlcnZlZCBjaGFyYWN0ZXIgJHtzaG93Q2hhcihjaGFyYWN0ZXJFYXRlbil9YClcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0fVxuXHR9XG59XG4iXX0=
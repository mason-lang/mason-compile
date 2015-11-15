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
						} else if ((0, _sourceContext.tryEat)(_chars.Chars.Bar)) funKeyword(_Token.Keywords.FunThis);else if ((0, _sourceContext.tryEat2)(_chars.Chars.Bang, _chars.Chars.Bar)) funKeyword(_Token.Keywords.FunThisDo);else if ((0, _sourceContext.tryEat2)(_chars.Chars.Star, _chars.Chars.Bar)) funKeyword(_Token.Keywords.FunThisGen);else if ((0, _sourceContext.tryEat3)(_chars.Chars.Star, _chars.Chars.Bang, _chars.Chars.Bar)) funKeyword(_Token.Keywords.FunThisGenDo);else if ((0, _sourceContext.tryEat)(_chars.Chars.Dot)) if ((0, _sourceContext.tryEat)(_chars.Chars.Dot)) keyword(_Token.Keywords.Dot3);else keyword(_Token.Keywords.Dot2);else keyword(_Token.Keywords.Dot);

						break;
					}

				case _chars.Chars.Colon:
					if ((0, _sourceContext.tryEat)(_chars.Chars.Colon)) {
						(0, _sourceContext.mustEat)(_chars.Chars.Equal, '::');
						keyword(_Token.Keywords.AssignMutable);
					} else if ((0, _sourceContext.tryEat)(_chars.Chars.Equal)) keyword(_Token.Keywords.LocalMutate);else keyword(_Token.Keywords.Colon);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXhQbGFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBcUJ3QixRQUFROzs7Ozs7Ozs7O1VBQVIsUUFBUSIsImZpbGUiOiJsZXhQbGFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2MsIHtQb3N9IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCBmYWlsLCBvcHRpb25zLCB3YXJufSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtOdW1iZXJMaXRlcmFsfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7RG9jQ29tbWVudCwgR3JvdXAsIEdyb3VwcywgaXNLZXl3b3JkLCBLZXl3b3JkLCBLZXl3b3JkcywgTmFtZSwgb3BLZXl3b3JkS2luZEZyb21OYW1lXG5cdH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2lmRWxzZSwgaXNFbXB0eSwgbGFzdH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Q2hhcnMsIGlzRGlnaXQsIGlzRGlnaXRCaW5hcnksIGlzRGlnaXRIZXgsIGlzRGlnaXRPY3RhbCwgaXNOYW1lQ2hhcmFjdGVyLCBzaG93Q2hhclxuXHR9IGZyb20gJy4vY2hhcnMnXG5pbXBvcnQge2FkZFRvQ3VycmVudEdyb3VwLCBjbG9zZUdyb3VwLCBjbG9zZUdyb3Vwc0ZvckRlZGVudCwgY2xvc2VMaW5lLFxuXHRjbG9zZVBhcmVudGhlc2lzLCBjbG9zZVNwYWNlT0tJZkVtcHR5LCBjdXJHcm91cCwgb3Blbkdyb3VwLCBvcGVuTGluZSwgb3BlblBhcmVudGhlc2lzLCBzcGFjZVxuXHR9IGZyb20gJy4vZ3JvdXBDb250ZXh0J1xuaW1wb3J0IHtsZXhRdW90ZX0gZnJvbSAnLi9sZXgqJ1xuaW1wb3J0IHtjb2x1bW4sIGVhdCwgZWF0UmVzdE9mTGluZSwgaW5kZXgsIG11c3RFYXQsIGxpbmUsIHBlZWssIHBvcywgc291cmNlU3RyaW5nLCBza2lwLFxuXHRza2lwTmV3bGluZXMsIHNraXBSZXN0T2ZMaW5lLCBza2lwV2hpbGUsIHNraXBXaGlsZUVxdWFscywgdGFrZVdoaWxlV2l0aFByZXYsIHRyeUVhdCwgdHJ5RWF0Mixcblx0dHJ5RWF0M30gZnJvbSAnLi9zb3VyY2VDb250ZXh0J1xuXG4vKlxuSW4gdGhlIGNhc2Ugb2YgcXVvdGUgaW50ZXJwb2xhdGlvbiAoXCJhe2J9Y1wiKSB3ZSdsbCByZWN1cnNlIGJhY2sgaW50byBoZXJlLlxuV2hlbiBpc0luUXVvdGUgaXMgdHJ1ZSwgd2Ugd2lsbCBub3QgYWxsb3cgbmV3bGluZXMuXG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbGV4UGxhaW4oaXNJblF1b3RlKSB7XG5cdC8vIFRoaXMgdGVsbHMgdXMgd2hpY2ggaW5kZW50ZWQgYmxvY2sgd2UncmUgaW4uXG5cdC8vIEluY3JlbWVudGluZyBpdCBtZWFucyBpc3N1aW5nIGEgR1BfT3BlbkJsb2NrIGFuZCBkZWNyZW1lbnRpbmcgaXQgbWVhbnMgYSBHUF9DbG9zZUJsb2NrLlxuXHQvLyBEb2VzIG5vdGhpbmcgaWYgaXNJblF1b3RlLlxuXHRsZXQgaW5kZW50ID0gMFxuXG5cdC8vIFRoaXMgaXMgd2hlcmUgd2Ugc3RhcnRlZCBsZXhpbmcgdGhlIGN1cnJlbnQgdG9rZW4uXG5cdGxldCBzdGFydENvbHVtblxuXHRmdW5jdGlvbiBzdGFydFBvcygpIHtcblx0XHRyZXR1cm4gbmV3IFBvcyhsaW5lLCBzdGFydENvbHVtbilcblx0fVxuXHRmdW5jdGlvbiBsb2MoKSB7XG5cdFx0cmV0dXJuIG5ldyBMb2Moc3RhcnRQb3MoKSwgcG9zKCkpXG5cdH1cblx0ZnVuY3Rpb24ga2V5d29yZChraW5kKSB7XG5cdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IEtleXdvcmQobG9jKCksIGtpbmQpKVxuXHR9XG5cdGZ1bmN0aW9uIGZ1bktleXdvcmQoa2luZCkge1xuXHRcdGtleXdvcmQoa2luZClcblx0XHQvLyBGaXJzdCBhcmcgaW4gaXRzIG93biBzcGFjZWQgZ3JvdXBcblx0XHRzcGFjZShsb2MoKSlcblx0fVxuXHRmdW5jdGlvbiBlYXRBbmRBZGROdW1iZXIoKSB7XG5cdFx0Y29uc3Qgc3RhcnRJbmRleCA9IGluZGV4IC0gMVxuXG5cdFx0dHJ5RWF0KENoYXJzLkh5cGhlbilcblx0XHRpZiAocGVlaygtMSkgPT09IENoYXJzLk4wKSB7XG5cdFx0XHRjb25zdCBwID0gcGVlaygpXG5cdFx0XHRzd2l0Y2ggKHApIHtcblx0XHRcdFx0Y2FzZSBDaGFycy5MZXR0ZXJCOiBjYXNlIENoYXJzLkxldHRlck86IGNhc2UgQ2hhcnMuTGV0dGVyWDpcblx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRjb25zdCBpc0RpZ2l0U3BlY2lhbCA9XG5cdFx0XHRcdFx0XHRwID09PSBDaGFycy5MZXR0ZXJCID9cblx0XHRcdFx0XHRcdGlzRGlnaXRCaW5hcnkgOlxuXHRcdFx0XHRcdFx0cCA9PT0gQ2hhcnMuTGV0dGVyTyA/XG5cdFx0XHRcdFx0XHRpc0RpZ2l0T2N0YWwgOlxuXHRcdFx0XHRcdFx0aXNEaWdpdEhleFxuXHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0U3BlY2lhbClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIENoYXJzLkRvdDpcblx0XHRcdFx0XHRpZiAoaXNEaWdpdChwZWVrKDEpKSkge1xuXHRcdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0c2tpcFdoaWxlKGlzRGlnaXQpXG5cdFx0XHRpZiAocGVlaygpID09PSBDaGFycy5Eb3QgJiYgaXNEaWdpdChwZWVrKDEpKSkge1xuXHRcdFx0XHRza2lwKClcblx0XHRcdFx0c2tpcFdoaWxlKGlzRGlnaXQpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3Qgc3RyID0gc291cmNlU3RyaW5nLnNsaWNlKHN0YXJ0SW5kZXgsIGluZGV4KVxuXHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBOdW1iZXJMaXRlcmFsKGxvYygpLCBzdHIpKVxuXHR9XG5cdGZ1bmN0aW9uIGVhdEluZGVudCgpIHtcblx0XHRjb25zdCBvcHRJbmRlbnQgPSBvcHRpb25zLmluZGVudCgpXG5cdFx0aWYgKG9wdEluZGVudCA9PT0gJ1xcdCcpIHtcblx0XHRcdGNvbnN0IGluZGVudCA9IHNraXBXaGlsZUVxdWFscyhDaGFycy5UYWIpXG5cdFx0XHRjaGVjayhwZWVrKCkgIT09IENoYXJzLlNwYWNlLCBwb3MsICdMaW5lIGJlZ2lucyBpbiBhIHNwYWNlJylcblx0XHRcdHJldHVybiBpbmRlbnRcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3Qgc3BhY2VzID0gc2tpcFdoaWxlRXF1YWxzKENoYXJzLlNwYWNlKVxuXHRcdFx0Y2hlY2soc3BhY2VzICUgb3B0SW5kZW50ID09PSAwLCBwb3MsICgpID0+XG5cdFx0XHRcdGBJbmRlbnRhdGlvbiBzcGFjZXMgbXVzdCBiZSBhIG11bHRpcGxlIG9mICR7b3B0SW5kZW50fWApXG5cdFx0XHRyZXR1cm4gc3BhY2VzIC8gb3B0SW5kZW50XG5cdFx0fVxuXHR9XG5cblxuXHRmdW5jdGlvbiBoYW5kbGVOYW1lKCkge1xuXHRcdGNoZWNrKGlzTmFtZUNoYXJhY3RlcihwZWVrKC0xKSksIGxvYygpLCAoKSA9PlxuXHRcdFx0YFJlc2VydmVkIGNoYXJhY3RlciAke3Nob3dDaGFyKHBlZWsoLTEpKX1gKVxuXG5cdFx0Ly8gQWxsIG90aGVyIGNoYXJhY3RlcnMgc2hvdWxkIGJlIGhhbmRsZWQgaW4gYSBjYXNlIGFib3ZlLlxuXHRcdGNvbnN0IG5hbWUgPSB0YWtlV2hpbGVXaXRoUHJldihpc05hbWVDaGFyYWN0ZXIpXG5cblx0XHRpZiAobmFtZS5lbmRzV2l0aCgnXycpKSB7XG5cdFx0XHRpZiAobmFtZS5sZW5ndGggPiAxKVxuXHRcdFx0XHRoYW5kbGVOYW1lVGV4dChuYW1lLnNsaWNlKDAsIG5hbWUubGVuZ3RoIC0gMSkpXG5cdFx0XHRrZXl3b3JkKEtleXdvcmRzLkZvY3VzKVxuXHRcdH0gZWxzZVxuXHRcdFx0aGFuZGxlTmFtZVRleHQobmFtZSlcblx0fVxuXHRmdW5jdGlvbiBoYW5kbGVOYW1lVGV4dChuYW1lKSB7XG5cdFx0aWZFbHNlKG9wS2V5d29yZEtpbmRGcm9tTmFtZShuYW1lKSxcblx0XHRcdGtpbmQgPT4ge1xuXHRcdFx0XHRzd2l0Y2ggKGtpbmQpIHtcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLlJlZ2lvbjpcblx0XHRcdFx0XHRcdHNraXBSZXN0T2ZMaW5lKClcblx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuUmVnaW9uKVxuXHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLlRvZG86XG5cdFx0XHRcdFx0XHQvLyBUT0RPOiB3YXJuXG5cdFx0XHRcdFx0XHRza2lwUmVzdE9mTGluZSgpXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRrZXl3b3JkKGtpbmQpXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHQoKSA9PiB7XG5cdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBOYW1lKGxvYygpLCBuYW1lKSlcblx0XHRcdH0pXG5cdH1cblxuXHR3aGlsZSAodHJ1ZSkge1xuXHRcdHN0YXJ0Q29sdW1uID0gY29sdW1uXG5cdFx0Y29uc3QgY2hhcmFjdGVyRWF0ZW4gPSBlYXQoKVxuXHRcdC8vIEdlbmVyYWxseSwgdGhlIHR5cGUgb2YgYSB0b2tlbiBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBmaXJzdCBjaGFyYWN0ZXIuXG5cdFx0c3dpdGNoIChjaGFyYWN0ZXJFYXRlbikge1xuXHRcdFx0Y2FzZSBDaGFycy5OdWxsOlxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdGNhc2UgQ2hhcnMuQ2xvc2VCcmFjZTpcblx0XHRcdFx0Y2hlY2soaXNJblF1b3RlLCBsb2MsICgpID0+XG5cdFx0XHRcdFx0YFJlc2VydmVkIGNoYXJhY3RlciAke3Nob3dDaGFyKENoYXJzLkNsb3NlQnJhY2UpfWApXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0Y2FzZSBDaGFycy5RdW90ZTpcblx0XHRcdFx0bGV4UXVvdGUoaW5kZW50KVxuXHRcdFx0XHRicmVha1xuXG5cdFx0XHQvLyBHUk9VUFNcblxuXHRcdFx0Y2FzZSBDaGFycy5PcGVuUGFyZW50aGVzaXM6XG5cdFx0XHRcdGlmICh0cnlFYXQoQ2hhcnMuQ2xvc2VQYXJlbnRoZXNpcykpXG5cdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IEdyb3VwKGxvYygpLCBbXSwgR3JvdXBzLlBhcmVudGhlc2lzKSlcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdG9wZW5QYXJlbnRoZXNpcyhsb2MoKSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuT3BlbkJyYWNrZXQ6XG5cdFx0XHRcdGlmICh0cnlFYXQoQ2hhcnMuQ2xvc2VCcmFja2V0KSlcblx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgR3JvdXAobG9jKCksIFtdLCBHcm91cHMuQnJhY2tldCkpXG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdG9wZW5Hcm91cChzdGFydFBvcygpLCBHcm91cHMuQnJhY2tldClcblx0XHRcdFx0XHRvcGVuR3JvdXAocG9zKCksIEdyb3Vwcy5TcGFjZSlcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5DbG9zZVBhcmVudGhlc2lzOlxuXHRcdFx0XHRjbG9zZVBhcmVudGhlc2lzKGxvYygpKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5DbG9zZUJyYWNrZXQ6XG5cdFx0XHRcdGNsb3NlR3JvdXAoc3RhcnRQb3MoKSwgR3JvdXBzLlNwYWNlKVxuXHRcdFx0XHRjbG9zZUdyb3VwKHBvcygpLCBHcm91cHMuQnJhY2tldClcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuU3BhY2U6XG5cdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5OZXdsaW5lOiB7XG5cdFx0XHRcdGNoZWNrKCFpc0luUXVvdGUsIGxvYywgJ1F1b3RlIGludGVycG9sYXRpb24gY2Fubm90IGNvbnRhaW4gbmV3bGluZScpXG5cdFx0XHRcdGlmIChwZWVrKC0yKSA9PT0gQ2hhcnMuU3BhY2UpXG5cdFx0XHRcdFx0d2Fybihwb3MsICdMaW5lIGVuZHMgaW4gYSBzcGFjZS4nKVxuXG5cdFx0XHRcdC8vIFNraXAgYW55IGJsYW5rIGxpbmVzLlxuXHRcdFx0XHRza2lwTmV3bGluZXMoKVxuXHRcdFx0XHRjb25zdCBvbGRJbmRlbnQgPSBpbmRlbnRcblx0XHRcdFx0aW5kZW50ID0gZWF0SW5kZW50KClcblx0XHRcdFx0aWYgKGluZGVudCA+IG9sZEluZGVudCkge1xuXHRcdFx0XHRcdGNoZWNrKGluZGVudCA9PT0gb2xkSW5kZW50ICsgMSwgbG9jLFxuXHRcdFx0XHRcdFx0J0xpbmUgaXMgaW5kZW50ZWQgbW9yZSB0aGFuIG9uY2UnKVxuXHRcdFx0XHRcdGNvbnN0IGwgPSBsb2MoKVxuXHRcdFx0XHRcdC8vIEJsb2NrIGF0IGVuZCBvZiBsaW5lIGdvZXMgaW4gaXRzIG93biBzcGFjZWQgZ3JvdXAuXG5cdFx0XHRcdFx0Ly8gSG93ZXZlciwgYH5gIHByZWNlZGluZyBhIGJsb2NrIGdvZXMgaW4gYSBncm91cCB3aXRoIGl0LlxuXHRcdFx0XHRcdGlmIChpc0VtcHR5KGN1ckdyb3VwLnN1YlRva2VucykgfHxcblx0XHRcdFx0XHRcdCFpc0tleXdvcmQoS2V5d29yZHMuTGF6eSwgbGFzdChjdXJHcm91cC5zdWJUb2tlbnMpKSkge1xuXHRcdFx0XHRcdFx0aWYgKGN1ckdyb3VwLmtpbmQgPT09IEdyb3Vwcy5TcGFjZSlcblx0XHRcdFx0XHRcdFx0Y2xvc2VTcGFjZU9LSWZFbXB0eShsLnN0YXJ0KVxuXHRcdFx0XHRcdFx0b3Blbkdyb3VwKGwuZW5kLCBHcm91cHMuU3BhY2UpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG9wZW5Hcm91cChsLnN0YXJ0LCBHcm91cHMuQmxvY2spXG5cdFx0XHRcdFx0b3BlbkxpbmUobC5lbmQpXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3QgbCA9IGxvYygpXG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IGluZGVudDsgaSA8IG9sZEluZGVudDsgaSA9IGkgKyAxKVxuXHRcdFx0XHRcdFx0Y2xvc2VHcm91cHNGb3JEZWRlbnQobC5zdGFydClcblx0XHRcdFx0XHRjbG9zZUxpbmUobC5zdGFydClcblx0XHRcdFx0XHRvcGVuTGluZShsLmVuZClcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBDaGFycy5UYWI6XG5cdFx0XHRcdC8vIFdlIGFsd2F5cyBlYXQgdGFicyBpbiB0aGUgTmV3bGluZSBoYW5kbGVyLFxuXHRcdFx0XHQvLyBzbyB0aGlzIHdpbGwgb25seSBoYXBwZW4gaW4gdGhlIG1pZGRsZSBvZiBhIGxpbmUuXG5cdFx0XHRcdGZhaWwobG9jKCksICdUYWIgbWF5IG9ubHkgYmUgdXNlZCB0byBpbmRlbnQnKVxuXG5cdFx0XHQvLyBGVU5cblxuXHRcdFx0Y2FzZSBDaGFycy5CYW5nOlxuXHRcdFx0XHRpZiAodHJ5RWF0KENoYXJzLkJhcikpXG5cdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW5Ebylcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5DYXNoOlxuXHRcdFx0XHRpZiAodHJ5RWF0MihDaGFycy5CYW5nLCBDaGFycy5CYXIpKVxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuQXN5bmNEbylcblx0XHRcdFx0ZWxzZSBpZiAodHJ5RWF0KENoYXJzLkJhcikpXG5cdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW5Bc3luYylcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5TdGFyOlxuXHRcdFx0XHRpZiAodHJ5RWF0MihDaGFycy5CYW5nLCBDaGFycy5CYXIpKVxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuR2VuRG8pXG5cdFx0XHRcdGVsc2UgaWYgKHRyeUVhdChDaGFycy5CYXIpKVxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuR2VuKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLkJhcjpcblx0XHRcdFx0aWYgKHRyeUVhdChDaGFycy5TcGFjZSkgfHwgdHJ5RWF0KENoYXJzLlRhYikpIHtcblx0XHRcdFx0XHRjb25zdCB0ZXh0ID0gZWF0UmVzdE9mTGluZSgpXG5cdFx0XHRcdFx0Y2xvc2VTcGFjZU9LSWZFbXB0eShzdGFydFBvcygpKVxuXHRcdFx0XHRcdGlmICghKGN1ckdyb3VwLmtpbmQgPT09IEdyb3Vwcy5MaW5lICYmIGN1ckdyb3VwLnN1YlRva2Vucy5sZW5ndGggPT09IDApKVxuXHRcdFx0XHRcdFx0ZmFpbChsb2MsXG5cdFx0XHRcdFx0XHRcdGBEb2MgY29tbWVudCBtdXN0IGdvIG9uIGl0cyBvd24gbGluZS4gRGlkIHlvdSBtZWFuICR7Y29kZSgnfHwnKX0/YClcblx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgRG9jQ29tbWVudChsb2MoKSwgdGV4dCkpXG5cdFx0XHRcdH0gZWxzZSBpZiAodHJ5RWF0KENoYXJzLkJhcikpXG5cdFx0XHRcdFx0Ly8gbm9uLWRvYyBjb21tZW50XG5cdFx0XHRcdFx0c2tpcFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW4pXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdC8vIE5VTUJFUlxuXG5cdFx0XHRjYXNlIENoYXJzLkh5cGhlbjpcblx0XHRcdFx0aWYgKGlzRGlnaXQocGVlaygpKSlcblx0XHRcdFx0XHQvLyBlYXRBbmRBZGROdW1iZXIoKSBsb29rcyBhdCBwcmV2IGNoYXJhY3Rlciwgc28gaHlwaGVuIGluY2x1ZGVkLlxuXHRcdFx0XHRcdGVhdEFuZEFkZE51bWJlcigpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRoYW5kbGVOYW1lKClcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuTjA6IGNhc2UgQ2hhcnMuTjE6IGNhc2UgQ2hhcnMuTjI6IGNhc2UgQ2hhcnMuTjM6IGNhc2UgQ2hhcnMuTjQ6XG5cdFx0XHRjYXNlIENoYXJzLk41OiBjYXNlIENoYXJzLk42OiBjYXNlIENoYXJzLk43OiBjYXNlIENoYXJzLk44OiBjYXNlIENoYXJzLk45OlxuXHRcdFx0XHRlYXRBbmRBZGROdW1iZXIoKVxuXHRcdFx0XHRicmVha1xuXG5cblx0XHRcdC8vIE9USEVSXG5cblx0XHRcdGNhc2UgQ2hhcnMuRG90OiB7XG5cdFx0XHRcdGlmIChwZWVrKCkgPT09IENoYXJzLlNwYWNlIHx8IHBlZWsoKSA9PT0gQ2hhcnMuTmV3bGluZSkge1xuXHRcdFx0XHRcdC8vIEtleXdvcmRzLk9iakVudHJ5IGluIGl0cyBvd24gc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdC8vIFdlIGNhbid0IGp1c3QgY3JlYXRlIGEgbmV3IEdyb3VwIGhlcmUgYmVjYXVzZSB3ZSB3YW50IHRvXG5cdFx0XHRcdFx0Ly8gZW5zdXJlIGl0J3Mgbm90IHBhcnQgb2YgdGhlIHByZWNlZGluZyBvciBmb2xsb3dpbmcgc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdGNsb3NlU3BhY2VPS0lmRW1wdHkoc3RhcnRQb3MoKSlcblx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLk9iakFzc2lnbilcblx0XHRcdFx0fSBlbHNlIGlmICh0cnlFYXQoQ2hhcnMuQmFyKSlcblx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1blRoaXMpXG5cdFx0XHRcdGVsc2UgaWYgKHRyeUVhdDIoQ2hhcnMuQmFuZywgQ2hhcnMuQmFyKSlcblx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1blRoaXNEbylcblx0XHRcdFx0ZWxzZSBpZiAodHJ5RWF0MihDaGFycy5TdGFyLCBDaGFycy5CYXIpKVxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuVGhpc0dlbilcblx0XHRcdFx0ZWxzZSBpZiAodHJ5RWF0MyhDaGFycy5TdGFyLCBDaGFycy5CYW5nLCBDaGFycy5CYXIpKVxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuVGhpc0dlbkRvKVxuXHRcdFx0XHRlbHNlIGlmICh0cnlFYXQoQ2hhcnMuRG90KSlcblx0XHRcdFx0XHRpZiAodHJ5RWF0KENoYXJzLkRvdCkpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkRvdDMpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5Eb3QyKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5Eb3QpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cblx0XHRcdGNhc2UgQ2hhcnMuQ29sb246XG5cdFx0XHRcdGlmICh0cnlFYXQoQ2hhcnMuQ29sb24pKSB7XG5cdFx0XHRcdFx0bXVzdEVhdChDaGFycy5FcXVhbCwgJzo6Jylcblx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkFzc2lnbk11dGFibGUpXG5cdFx0XHRcdH0gZWxzZSBpZiAodHJ5RWF0KENoYXJzLkVxdWFsKSlcblx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkxvY2FsTXV0YXRlKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5Db2xvbilcblx0XHRcdFx0YnJlYWtcblxuXHRcdFx0Y2FzZSBDaGFycy5UaWNrOlxuXHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLlRpY2spXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdGNhc2UgQ2hhcnMuVGlsZGU6XG5cdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuTGF6eSlcblx0XHRcdFx0YnJlYWtcblxuXHRcdFx0Y2FzZSBDaGFycy5BbXBlcnNhbmQ6XG5cdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuQW1wZXJzYW5kKVxuXHRcdFx0XHRicmVha1xuXG5cdFx0XHRjYXNlIENoYXJzLkJhY2tzbGFzaDogY2FzZSBDaGFycy5CYWNrdGljazogY2FzZSBDaGFycy5DYXJldDpcblx0XHRcdGNhc2UgQ2hhcnMuQ29tbWE6IGNhc2UgQ2hhcnMuUGVyY2VudDogY2FzZSBDaGFycy5TZW1pY29sb246XG5cdFx0XHRcdGZhaWwobG9jKCksIGBSZXNlcnZlZCBjaGFyYWN0ZXIgJHtzaG93Q2hhcihjaGFyYWN0ZXJFYXRlbil9YClcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0fVxuXHR9XG59XG4iXX0=
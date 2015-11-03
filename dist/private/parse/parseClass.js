'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../MsAst', '../Token', '../util', './parse*', './parseBlock', './parseFun', './parseMethods', './tryTakeComment'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../MsAst'), require('../Token'), require('../util'), require('./parse*'), require('./parseBlock'), require('./parseFun'), require('./parseMethods'), require('./tryTakeComment'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst, global.Token, global.util, global.parse, global.parseBlock, global.parseFun, global.parseMethods, global.tryTakeComment);
		global.parseClass = mod.exports;
	}
})(this, function (exports, _MsAst, _Token, _util, _parse, _parseBlock, _parseFun, _parseMethods, _tryTakeComment3) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseClass;

	var _parseMethods2 = _interopRequireDefault(_parseMethods);

	var _tryTakeComment4 = _interopRequireDefault(_tryTakeComment3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	function parseClass(tokens) {
		var _beforeAndOpBlock = (0, _parseBlock.beforeAndOpBlock)(tokens);

		var _beforeAndOpBlock2 = _slicedToArray(_beforeAndOpBlock, 2);

		const before = _beforeAndOpBlock2[0];
		const opBlock = _beforeAndOpBlock2[1];

		var _parseClassHeader = parseClassHeader(before);

		const opSuperClass = _parseClassHeader.opSuperClass;
		const kinds = _parseClassHeader.kinds;
		let opComment = null,
		    opDo = null,
		    statics = [],
		    opConstructor = null,
		    methods = [];

		const finish = () => new _MsAst.Class(tokens.loc, opSuperClass, kinds, opComment, opDo, statics, opConstructor, methods);

		if (opBlock === null) return finish();

		var _tryTakeComment = (0, _tryTakeComment4.default)(opBlock);

		var _tryTakeComment2 = _slicedToArray(_tryTakeComment, 2);

		let opCom = _tryTakeComment2[0];
		let rest = _tryTakeComment2[1];
		opComment = opCom;
		if (rest.isEmpty()) return finish();
		const line1 = rest.headSlice();

		if ((0, _Token.isKeyword)(_Token.Keywords.Do, line1.head())) {
			const done = (0, _parseBlock.parseJustBlockDo)(_Token.Keywords.Do, line1.tail());
			opDo = new _MsAst.ClassKindDo(line1.loc, done);
			rest = rest.tail();
		}

		if (rest.isEmpty()) return finish();
		const line2 = rest.headSlice();

		if ((0, _Token.isKeyword)(_Token.Keywords.Static, line2.head())) {
			statics = (0, _parseMethods.parseStatics)(line2.tail());
			rest = rest.tail();
		}

		if (rest.isEmpty()) return finish();
		const line3 = rest.headSlice();

		if ((0, _Token.isKeyword)(_Token.Keywords.Construct, line3.head())) {
			opConstructor = parseConstructor(line3.tail());
			rest = rest.tail();
		}

		methods = (0, _parseMethods2.default)(rest);
		return finish();
	}

	function parseClassHeader(tokens) {
		var _ifElse = (0, _util.ifElse)(tokens.opSplitOnce(_ => (0, _Token.isKeyword)(_Token.Keywords.Kind, _)), _ref => {
			let before = _ref.before;
			let after = _ref.after;
			return [before, (0, _parse.parseExprParts)(after)];
		}, () => [tokens, []]);

		var _ifElse2 = _slicedToArray(_ifElse, 2);

		const extendedTokens = _ifElse2[0];
		const kinds = _ifElse2[1];
		const opSuperClass = (0, _parse.opParseExpr)(extendedTokens);
		return {
			opSuperClass,
			kinds
		};
	}

	function parseConstructor(tokens) {
		var _funArgsAndBlock = (0, _parseFun.funArgsAndBlock)(tokens, false, true);

		const args = _funArgsAndBlock.args;
		const memberArgs = _funArgsAndBlock.memberArgs;
		const opRestArg = _funArgsAndBlock.opRestArg;
		const block = _funArgsAndBlock.block;
		const fun = new _MsAst.Fun(tokens.loc, args, opRestArg, block, _MsAst.Funs.Plain, true);
		return new _MsAst.Constructor(tokens.loc, fun, memberArgs);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQ2xhc3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQVV3QixVQUFVOzs7Ozs7Ozs7O1VBQVYsVUFBVSIsImZpbGUiOiJwYXJzZUNsYXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDbGFzcywgQ2xhc3NLaW5kRG8sIENvbnN0cnVjdG9yLCBGdW4sIEZ1bnN9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aWZFbHNlfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtvcFBhcnNlRXhwciwgcGFyc2VFeHByUGFydHN9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IHtiZWZvcmVBbmRPcEJsb2NrLCBwYXJzZUp1c3RCbG9ja0RvfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQge2Z1bkFyZ3NBbmRCbG9ja30gZnJvbSAnLi9wYXJzZUZ1bidcbmltcG9ydCBwYXJzZU1ldGhvZHMsIHtwYXJzZVN0YXRpY3N9IGZyb20gJy4vcGFyc2VNZXRob2RzJ1xuaW1wb3J0IHRyeVRha2VDb21tZW50IGZyb20gJy4vdHJ5VGFrZUNvbW1lbnQnXG5cbi8qKiBQYXJzZSBhIHtAbGluayBDbGFzc30uICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUNsYXNzKHRva2Vucykge1xuXHRjb25zdCBbYmVmb3JlLCBvcEJsb2NrXSA9IGJlZm9yZUFuZE9wQmxvY2sodG9rZW5zKVxuXHRjb25zdCB7b3BTdXBlckNsYXNzLCBraW5kc30gPSBwYXJzZUNsYXNzSGVhZGVyKGJlZm9yZSlcblxuXHRsZXQgb3BDb21tZW50ID0gbnVsbCwgb3BEbyA9IG51bGwsIHN0YXRpY3MgPSBbXSwgb3BDb25zdHJ1Y3RvciA9IG51bGwsIG1ldGhvZHMgPSBbXVxuXHRjb25zdCBmaW5pc2ggPSAoKSA9PiBuZXcgQ2xhc3ModG9rZW5zLmxvYyxcblx0XHRcdG9wU3VwZXJDbGFzcywga2luZHMsIG9wQ29tbWVudCwgb3BEbywgc3RhdGljcywgb3BDb25zdHJ1Y3RvciwgbWV0aG9kcylcblxuXHRpZiAob3BCbG9jayA9PT0gbnVsbClcblx0XHRyZXR1cm4gZmluaXNoKClcblxuXHRsZXQgW29wQ29tLCByZXN0XSA9IHRyeVRha2VDb21tZW50KG9wQmxvY2spXG5cdG9wQ29tbWVudCA9IG9wQ29tXG5cblx0aWYgKHJlc3QuaXNFbXB0eSgpKVxuXHRcdHJldHVybiBmaW5pc2goKVxuXG5cdGNvbnN0IGxpbmUxID0gcmVzdC5oZWFkU2xpY2UoKVxuXHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkRvLCBsaW5lMS5oZWFkKCkpKSB7XG5cdFx0Y29uc3QgZG9uZSA9IHBhcnNlSnVzdEJsb2NrRG8oS2V5d29yZHMuRG8sIGxpbmUxLnRhaWwoKSlcblx0XHRvcERvID0gbmV3IENsYXNzS2luZERvKGxpbmUxLmxvYywgZG9uZSlcblx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0fVxuXG5cdGlmIChyZXN0LmlzRW1wdHkoKSlcblx0XHRyZXR1cm4gZmluaXNoKClcblxuXHRjb25zdCBsaW5lMiA9IHJlc3QuaGVhZFNsaWNlKClcblx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5TdGF0aWMsIGxpbmUyLmhlYWQoKSkpIHtcblx0XHRzdGF0aWNzID0gcGFyc2VTdGF0aWNzKGxpbmUyLnRhaWwoKSlcblx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0fVxuXG5cdGlmIChyZXN0LmlzRW1wdHkoKSlcblx0XHRyZXR1cm4gZmluaXNoKClcblxuXHRjb25zdCBsaW5lMyA9IHJlc3QuaGVhZFNsaWNlKClcblx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5Db25zdHJ1Y3QsIGxpbmUzLmhlYWQoKSkpIHtcblx0XHRvcENvbnN0cnVjdG9yID0gcGFyc2VDb25zdHJ1Y3RvcihsaW5lMy50YWlsKCkpXG5cdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdH1cblx0bWV0aG9kcyA9IHBhcnNlTWV0aG9kcyhyZXN0KVxuXG5cdHJldHVybiBmaW5pc2goKVxufVxuXG5mdW5jdGlvbiBwYXJzZUNsYXNzSGVhZGVyKHRva2Vucykge1xuXHRjb25zdCBbZXh0ZW5kZWRUb2tlbnMsIGtpbmRzXSA9XG5cdFx0aWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZShfID0+IGlzS2V5d29yZChLZXl3b3Jkcy5LaW5kLCBfKSksXG5cdFx0XHQoe2JlZm9yZSwgYWZ0ZXJ9KSA9PiBbYmVmb3JlLCBwYXJzZUV4cHJQYXJ0cyhhZnRlcildLFxuXHRcdFx0KCkgPT4gW3Rva2VucywgW11dKVxuXHRjb25zdCBvcFN1cGVyQ2xhc3MgPSBvcFBhcnNlRXhwcihleHRlbmRlZFRva2Vucylcblx0cmV0dXJuIHtvcFN1cGVyQ2xhc3MsIGtpbmRzfVxufVxuXG5mdW5jdGlvbiBwYXJzZUNvbnN0cnVjdG9yKHRva2Vucykge1xuXHRjb25zdCB7YXJncywgbWVtYmVyQXJncywgb3BSZXN0QXJnLCBibG9ja30gPSBmdW5BcmdzQW5kQmxvY2sodG9rZW5zLCBmYWxzZSwgdHJ1ZSlcblx0Y29uc3QgZnVuID0gbmV3IEZ1bih0b2tlbnMubG9jLCBhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBGdW5zLlBsYWluLCB0cnVlKVxuXHRyZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRva2Vucy5sb2MsIGZ1biwgbWVtYmVyQXJncylcbn1cbiJdfQ==
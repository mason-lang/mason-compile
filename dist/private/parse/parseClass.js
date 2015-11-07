'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../MsAst', '../Token', '../util', './parse*', './parseBlock', './parseFun', './parseMethodImpls', './tryTakeComment'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../MsAst'), require('../Token'), require('../util'), require('./parse*'), require('./parseBlock'), require('./parseFun'), require('./parseMethodImpls'), require('./tryTakeComment'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst, global.Token, global.util, global.parse, global.parseBlock, global.parseFun, global.parseMethodImpls, global.tryTakeComment);
		global.parseClass = mod.exports;
	}
})(this, function (exports, _MsAst, _Token, _util, _parse, _parseBlock, _parseFun, _parseMethodImpls, _tryTakeComment3) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseClass;

	var _parseMethodImpls2 = _interopRequireDefault(_parseMethodImpls);

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
			statics = (0, _parseMethodImpls.parseStatics)(line2.tail());
			rest = rest.tail();
		}

		if (rest.isEmpty()) return finish();
		const line3 = rest.headSlice();

		if ((0, _Token.isKeyword)(_Token.Keywords.Construct, line3.head())) {
			opConstructor = parseConstructor(line3.tail());
			rest = rest.tail();
		}

		methods = (0, _parseMethodImpls2.default)(rest);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQ2xhc3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQVV3QixVQUFVOzs7Ozs7Ozs7O1VBQVYsVUFBVSIsImZpbGUiOiJwYXJzZUNsYXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDbGFzcywgQ2xhc3NLaW5kRG8sIENvbnN0cnVjdG9yLCBGdW4sIEZ1bnN9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aWZFbHNlfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtvcFBhcnNlRXhwciwgcGFyc2VFeHByUGFydHN9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IHtiZWZvcmVBbmRPcEJsb2NrLCBwYXJzZUp1c3RCbG9ja0RvfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQge2Z1bkFyZ3NBbmRCbG9ja30gZnJvbSAnLi9wYXJzZUZ1bidcbmltcG9ydCBwYXJzZU1ldGhvZEltcGxzLCB7cGFyc2VTdGF0aWNzfSBmcm9tICcuL3BhcnNlTWV0aG9kSW1wbHMnXG5pbXBvcnQgdHJ5VGFrZUNvbW1lbnQgZnJvbSAnLi90cnlUYWtlQ29tbWVudCdcblxuLyoqIFBhcnNlIGEge0BsaW5rIENsYXNzfS4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlQ2xhc3ModG9rZW5zKSB7XG5cdGNvbnN0IFtiZWZvcmUsIG9wQmxvY2tdID0gYmVmb3JlQW5kT3BCbG9jayh0b2tlbnMpXG5cdGNvbnN0IHtvcFN1cGVyQ2xhc3MsIGtpbmRzfSA9IHBhcnNlQ2xhc3NIZWFkZXIoYmVmb3JlKVxuXG5cdGxldCBvcENvbW1lbnQgPSBudWxsLCBvcERvID0gbnVsbCwgc3RhdGljcyA9IFtdLCBvcENvbnN0cnVjdG9yID0gbnVsbCwgbWV0aG9kcyA9IFtdXG5cdGNvbnN0IGZpbmlzaCA9ICgpID0+IG5ldyBDbGFzcyh0b2tlbnMubG9jLFxuXHRcdFx0b3BTdXBlckNsYXNzLCBraW5kcywgb3BDb21tZW50LCBvcERvLCBzdGF0aWNzLCBvcENvbnN0cnVjdG9yLCBtZXRob2RzKVxuXG5cdGlmIChvcEJsb2NrID09PSBudWxsKVxuXHRcdHJldHVybiBmaW5pc2goKVxuXG5cdGxldCBbb3BDb20sIHJlc3RdID0gdHJ5VGFrZUNvbW1lbnQob3BCbG9jaylcblx0b3BDb21tZW50ID0gb3BDb21cblxuXHRpZiAocmVzdC5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIGZpbmlzaCgpXG5cblx0Y29uc3QgbGluZTEgPSByZXN0LmhlYWRTbGljZSgpXG5cdGlmIChpc0tleXdvcmQoS2V5d29yZHMuRG8sIGxpbmUxLmhlYWQoKSkpIHtcblx0XHRjb25zdCBkb25lID0gcGFyc2VKdXN0QmxvY2tEbyhLZXl3b3Jkcy5EbywgbGluZTEudGFpbCgpKVxuXHRcdG9wRG8gPSBuZXcgQ2xhc3NLaW5kRG8obGluZTEubG9jLCBkb25lKVxuXHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHR9XG5cblx0aWYgKHJlc3QuaXNFbXB0eSgpKVxuXHRcdHJldHVybiBmaW5pc2goKVxuXG5cdGNvbnN0IGxpbmUyID0gcmVzdC5oZWFkU2xpY2UoKVxuXHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLlN0YXRpYywgbGluZTIuaGVhZCgpKSkge1xuXHRcdHN0YXRpY3MgPSBwYXJzZVN0YXRpY3MobGluZTIudGFpbCgpKVxuXHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHR9XG5cblx0aWYgKHJlc3QuaXNFbXB0eSgpKVxuXHRcdHJldHVybiBmaW5pc2goKVxuXG5cdGNvbnN0IGxpbmUzID0gcmVzdC5oZWFkU2xpY2UoKVxuXHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkNvbnN0cnVjdCwgbGluZTMuaGVhZCgpKSkge1xuXHRcdG9wQ29uc3RydWN0b3IgPSBwYXJzZUNvbnN0cnVjdG9yKGxpbmUzLnRhaWwoKSlcblx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0fVxuXHRtZXRob2RzID0gcGFyc2VNZXRob2RJbXBscyhyZXN0KVxuXG5cdHJldHVybiBmaW5pc2goKVxufVxuXG5mdW5jdGlvbiBwYXJzZUNsYXNzSGVhZGVyKHRva2Vucykge1xuXHRjb25zdCBbZXh0ZW5kZWRUb2tlbnMsIGtpbmRzXSA9XG5cdFx0aWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZShfID0+IGlzS2V5d29yZChLZXl3b3Jkcy5LaW5kLCBfKSksXG5cdFx0XHQoe2JlZm9yZSwgYWZ0ZXJ9KSA9PiBbYmVmb3JlLCBwYXJzZUV4cHJQYXJ0cyhhZnRlcildLFxuXHRcdFx0KCkgPT4gW3Rva2VucywgW11dKVxuXHRjb25zdCBvcFN1cGVyQ2xhc3MgPSBvcFBhcnNlRXhwcihleHRlbmRlZFRva2Vucylcblx0cmV0dXJuIHtvcFN1cGVyQ2xhc3MsIGtpbmRzfVxufVxuXG5mdW5jdGlvbiBwYXJzZUNvbnN0cnVjdG9yKHRva2Vucykge1xuXHRjb25zdCB7YXJncywgbWVtYmVyQXJncywgb3BSZXN0QXJnLCBibG9ja30gPSBmdW5BcmdzQW5kQmxvY2sodG9rZW5zLCBmYWxzZSwgdHJ1ZSlcblx0Y29uc3QgZnVuID0gbmV3IEZ1bih0b2tlbnMubG9jLCBhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBGdW5zLlBsYWluLCB0cnVlKVxuXHRyZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRva2Vucy5sb2MsIGZ1biwgbWVtYmVyQXJncylcbn1cbiJdfQ==
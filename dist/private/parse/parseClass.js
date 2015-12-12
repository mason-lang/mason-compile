'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../MsAst', '../context', '../Token', '../util', './parse*', './parseBlock', './parseFun', './parseMethodImpls', './parseLocalDeclares', './tryTakeComment'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../MsAst'), require('../context'), require('../Token'), require('../util'), require('./parse*'), require('./parseBlock'), require('./parseFun'), require('./parseMethodImpls'), require('./parseLocalDeclares'), require('./tryTakeComment'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst, global.context, global.Token, global.util, global.parse, global.parseBlock, global.parseFun, global.parseMethodImpls, global.parseLocalDeclares, global.tryTakeComment);
		global.parseClass = mod.exports;
	}
})(this, function (exports, _MsAst, _context, _Token, _util, _parse, _parseBlock, _parseFun, _parseMethodImpls, _parseLocalDeclares, _tryTakeComment3) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseClass;

	var _parseMethodImpls2 = _interopRequireDefault(_parseMethodImpls);

	var _tryTakeComment4 = _interopRequireDefault(_tryTakeComment3);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	var _slicedToArray = (function () {
		function sliceIterator(arr, i) {
			var _arr = [];
			var _n = true;
			var _d = false;
			var _e = undefined;

			try {
				for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
					_arr.push(_s.value);

					if (i && _arr.length === i) break;
				}
			} catch (err) {
				_d = true;
				_e = err;
			} finally {
				try {
					if (!_n && _i["return"]) _i["return"]();
				} finally {
					if (_d) throw _e;
				}
			}

			return _arr;
		}

		return function (arr, i) {
			if (Array.isArray(arr)) {
				return arr;
			} else if (Symbol.iterator in Object(arr)) {
				return sliceIterator(arr, i);
			} else {
				throw new TypeError("Invalid attempt to destructure non-iterable instance");
			}
		};
	})();

	function parseClass(tokens) {
		var _beforeAndOpBlock = (0, _parseBlock.beforeAndOpBlock)(tokens);

		var _beforeAndOpBlock2 = _slicedToArray(_beforeAndOpBlock, 2);

		const before = _beforeAndOpBlock2[0];
		const opBlock = _beforeAndOpBlock2[1];

		var _parseClassHeader = parseClassHeader(before);

		const opFields = _parseClassHeader.opFields;
		const opSuperClass = _parseClassHeader.opSuperClass;
		const kinds = _parseClassHeader.kinds;
		let opComment = null,
		    opDo = null,
		    statics = [],
		    opConstructor = null,
		    methods = [];

		const finish = () => new _MsAst.Class(tokens.loc, opFields, opSuperClass, kinds, opComment, opDo, statics, opConstructor, methods);

		if (opBlock === null) return finish();

		var _tryTakeComment = (0, _tryTakeComment4.default)(opBlock);

		var _tryTakeComment2 = _slicedToArray(_tryTakeComment, 2);

		const _opComment = _tryTakeComment2[0];
		const _rest = _tryTakeComment2[1];
		opComment = _opComment;
		let rest = _rest;
		if (rest.isEmpty()) return finish();
		const line1 = rest.headSlice();

		if ((0, _Token.isKeyword)(_Token.Keywords.Do, line1.head())) {
			const done = (0, _parseBlock.parseJustBlock)(_Token.Keywords.Do, line1.tail());
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
		var _tokens$getKeywordSec = tokens.getKeywordSections([_Token.Keywords.Extends, _Token.Keywords.Kind]);

		var _tokens$getKeywordSec2 = _slicedToArray(_tokens$getKeywordSec, 3);

		const fieldsTokens = _tokens$getKeywordSec2[0];
		const extendsTokens = _tokens$getKeywordSec2[1];
		const kindTokens = _tokens$getKeywordSec2[2];
		return {
			opFields: (0, _util.opIf)(!fieldsTokens.isEmpty(), () => fieldsTokens.map(_ => {
				var _parseLocalParts = (0, _parseLocalDeclares.parseLocalParts)(_);

				const name = _parseLocalParts.name;
				const opType = _parseLocalParts.opType;
				const kind = _parseLocalParts.kind;
				(0, _context.check)(kind === _MsAst.LocalDeclares.Eager, _.loc, 'todoLazyField');
				return new _MsAst.Field(_.loc, name, opType);
			})),
			opSuperClass: (0, _util.opMap)(extendsTokens, _parse.parseExpr),
			kinds: (0, _util.ifElse)(kindTokens, _parse.parseExprParts, () => [])
		};
	}

	function parseConstructor(tokens) {
		var _funArgsAndBlock = (0, _parseFun.funArgsAndBlock)(tokens, false, true);

		const args = _funArgsAndBlock.args;
		const memberArgs = _funArgsAndBlock.memberArgs;
		const opRestArg = _funArgsAndBlock.opRestArg;
		const block = _funArgsAndBlock.block;
		const fun = new _MsAst.Fun(tokens.loc, args, opRestArg, block, {
			isThisFun: true,
			isDo: true
		});
		return new _MsAst.Constructor(tokens.loc, fun, memberArgs);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQ2xhc3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQVl3QixVQUFVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQUFWLFVBQVUiLCJmaWxlIjoicGFyc2VDbGFzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q2xhc3MsIENsYXNzS2luZERvLCBDb25zdHJ1Y3RvciwgRmllbGQsIEZ1biwgTG9jYWxEZWNsYXJlc30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aWZFbHNlLCBvcElmLCBvcE1hcH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7cGFyc2VFeHByLCBwYXJzZUV4cHJQYXJ0c30gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQge2JlZm9yZUFuZE9wQmxvY2ssIHBhcnNlSnVzdEJsb2NrfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQge2Z1bkFyZ3NBbmRCbG9ja30gZnJvbSAnLi9wYXJzZUZ1bidcbmltcG9ydCBwYXJzZU1ldGhvZEltcGxzLCB7cGFyc2VTdGF0aWNzfSBmcm9tICcuL3BhcnNlTWV0aG9kSW1wbHMnXG5pbXBvcnQge3BhcnNlTG9jYWxQYXJ0c30gZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5pbXBvcnQgdHJ5VGFrZUNvbW1lbnQgZnJvbSAnLi90cnlUYWtlQ29tbWVudCdcblxuLyoqIFBhcnNlIGEge0BsaW5rIENsYXNzfS4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlQ2xhc3ModG9rZW5zKSB7XG5cdGNvbnN0IFtiZWZvcmUsIG9wQmxvY2tdID0gYmVmb3JlQW5kT3BCbG9jayh0b2tlbnMpXG5cdGNvbnN0IHtvcEZpZWxkcywgb3BTdXBlckNsYXNzLCBraW5kc30gPSBwYXJzZUNsYXNzSGVhZGVyKGJlZm9yZSlcblxuXHRsZXQgb3BDb21tZW50ID0gbnVsbCwgb3BEbyA9IG51bGwsIHN0YXRpY3MgPSBbXSwgb3BDb25zdHJ1Y3RvciA9IG51bGwsIG1ldGhvZHMgPSBbXVxuXHRjb25zdCBmaW5pc2ggPSAoKSA9PiBuZXcgQ2xhc3ModG9rZW5zLmxvYyxcblx0XHRvcEZpZWxkcywgb3BTdXBlckNsYXNzLCBraW5kcywgb3BDb21tZW50LCBvcERvLCBzdGF0aWNzLCBvcENvbnN0cnVjdG9yLCBtZXRob2RzKVxuXG5cdGlmIChvcEJsb2NrID09PSBudWxsKVxuXHRcdHJldHVybiBmaW5pc2goKVxuXG5cdGNvbnN0IFtfb3BDb21tZW50LCBfcmVzdF0gPSB0cnlUYWtlQ29tbWVudChvcEJsb2NrKVxuXHRvcENvbW1lbnQgPSBfb3BDb21tZW50XG5cdGxldCByZXN0ID0gX3Jlc3RcblxuXHRpZiAocmVzdC5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIGZpbmlzaCgpXG5cblx0Y29uc3QgbGluZTEgPSByZXN0LmhlYWRTbGljZSgpXG5cdGlmIChpc0tleXdvcmQoS2V5d29yZHMuRG8sIGxpbmUxLmhlYWQoKSkpIHtcblx0XHRjb25zdCBkb25lID0gcGFyc2VKdXN0QmxvY2soS2V5d29yZHMuRG8sIGxpbmUxLnRhaWwoKSlcblx0XHRvcERvID0gbmV3IENsYXNzS2luZERvKGxpbmUxLmxvYywgZG9uZSlcblx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0fVxuXG5cdGlmIChyZXN0LmlzRW1wdHkoKSlcblx0XHRyZXR1cm4gZmluaXNoKClcblxuXHRjb25zdCBsaW5lMiA9IHJlc3QuaGVhZFNsaWNlKClcblx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5TdGF0aWMsIGxpbmUyLmhlYWQoKSkpIHtcblx0XHRzdGF0aWNzID0gcGFyc2VTdGF0aWNzKGxpbmUyLnRhaWwoKSlcblx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0fVxuXG5cdGlmIChyZXN0LmlzRW1wdHkoKSlcblx0XHRyZXR1cm4gZmluaXNoKClcblxuXHRjb25zdCBsaW5lMyA9IHJlc3QuaGVhZFNsaWNlKClcblx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5Db25zdHJ1Y3QsIGxpbmUzLmhlYWQoKSkpIHtcblx0XHRvcENvbnN0cnVjdG9yID0gcGFyc2VDb25zdHJ1Y3RvcihsaW5lMy50YWlsKCkpXG5cdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdH1cblx0bWV0aG9kcyA9IHBhcnNlTWV0aG9kSW1wbHMocmVzdClcblxuXHRyZXR1cm4gZmluaXNoKClcbn1cblxuZnVuY3Rpb24gcGFyc2VDbGFzc0hlYWRlcih0b2tlbnMpIHtcblx0Y29uc3QgW2ZpZWxkc1Rva2VucywgZXh0ZW5kc1Rva2Vucywga2luZFRva2Vuc10gPVxuXHRcdHRva2Vucy5nZXRLZXl3b3JkU2VjdGlvbnMoW0tleXdvcmRzLkV4dGVuZHMsIEtleXdvcmRzLktpbmRdKVxuXHRyZXR1cm4ge1xuXHRcdG9wRmllbGRzOiBvcElmKCFmaWVsZHNUb2tlbnMuaXNFbXB0eSgpLCAoKSA9PiBmaWVsZHNUb2tlbnMubWFwKF8gPT4ge1xuXHRcdFx0Y29uc3Qge25hbWUsIG9wVHlwZSwga2luZH0gPSBwYXJzZUxvY2FsUGFydHMoXylcblx0XHRcdGNoZWNrKGtpbmQgPT09IExvY2FsRGVjbGFyZXMuRWFnZXIsIF8ubG9jLCAndG9kb0xhenlGaWVsZCcpXG5cdFx0XHRyZXR1cm4gbmV3IEZpZWxkKF8ubG9jLCBuYW1lLCBvcFR5cGUpXG5cdFx0fSkpLFxuXHRcdG9wU3VwZXJDbGFzczogb3BNYXAoZXh0ZW5kc1Rva2VucywgcGFyc2VFeHByKSxcblx0XHRraW5kczogaWZFbHNlKGtpbmRUb2tlbnMsIHBhcnNlRXhwclBhcnRzLCAoKSA9PiBbXSlcblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZUNvbnN0cnVjdG9yKHRva2Vucykge1xuXHRjb25zdCB7YXJncywgbWVtYmVyQXJncywgb3BSZXN0QXJnLCBibG9ja30gPSBmdW5BcmdzQW5kQmxvY2sodG9rZW5zLCBmYWxzZSwgdHJ1ZSlcblx0Y29uc3QgZnVuID0gbmV3IEZ1bih0b2tlbnMubG9jLCBhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCB7aXNUaGlzRnVuOiB0cnVlLCBpc0RvOiB0cnVlfSlcblx0cmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0b2tlbnMubG9jLCBmdW4sIG1lbWJlckFyZ3MpXG59XG4iXX0=
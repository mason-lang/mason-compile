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
		const traits = _parseClassHeader.traits;

		var _ifElse = (0, _util.ifElse)(opBlock, _ => {
			var _tryTakeComment = (0, _tryTakeComment4.default)(opBlock);

			var _tryTakeComment2 = _slicedToArray(_tryTakeComment, 2);

			const opComment = _tryTakeComment2[0];
			const rest = _tryTakeComment2[1];
			if (rest.isEmpty()) return [opComment, null, [], null, []];

			var _opTakeDo = (0, _parseMethodImpls.opTakeDo)(rest);

			var _opTakeDo2 = _slicedToArray(_opTakeDo, 2);

			const opDo = _opTakeDo2[0];
			const rest2 = _opTakeDo2[1];
			if (rest2.isEmpty()) return [opComment, opDo, [], null, []];

			var _takeStatics = (0, _parseMethodImpls.takeStatics)(rest2);

			var _takeStatics2 = _slicedToArray(_takeStatics, 2);

			const statics = _takeStatics2[0];
			const rest3 = _takeStatics2[1];
			if (rest3.isEmpty()) return [opComment, opDo, statics, null, []];

			var _opTakeConstructor = opTakeConstructor(rest3);

			var _opTakeConstructor2 = _slicedToArray(_opTakeConstructor, 2);

			const opConstructor = _opTakeConstructor2[0];
			const rest4 = _opTakeConstructor2[1];
			return [opComment, opDo, statics, opConstructor, (0, _parseMethodImpls2.default)(rest4)];
		}, () => [null, null, [], null, []]);

		var _ifElse2 = _slicedToArray(_ifElse, 5);

		const opComment = _ifElse2[0];
		const opDo = _ifElse2[1];
		const statics = _ifElse2[2];
		const opConstructor = _ifElse2[3];
		const methods = _ifElse2[4];
		return new _MsAst.Class(tokens.loc, opFields, opSuperClass, traits, opComment, opDo, statics, opConstructor, methods);
	}

	function parseClassHeader(tokens) {
		var _tokens$getKeywordSec = tokens.getKeywordSections([_Token.Keywords.Extends, _Token.Keywords.Trait]);

		var _tokens$getKeywordSec2 = _slicedToArray(_tokens$getKeywordSec, 3);

		const fieldsTokens = _tokens$getKeywordSec2[0];
		const extendsTokens = _tokens$getKeywordSec2[1];
		const traitTokens = _tokens$getKeywordSec2[2];
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
			traits: (0, _util.ifElse)(traitTokens, _parse.parseExprParts, () => [])
		};
	}

	function opTakeConstructor(tokens) {
		const line = tokens.headSlice();
		return (0, _Token.isKeyword)(_Token.Keywords.Construct, line.head()) ? [parseConstructor(line.tail()), tokens.tail()] : [null, tokens];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQ2xhc3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQVl3QixVQUFVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQUFWLFVBQVUiLCJmaWxlIjoicGFyc2VDbGFzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q2xhc3MsIENvbnN0cnVjdG9yLCBGaWVsZCwgRnVuLCBMb2NhbERlY2xhcmVzfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge2lzS2V5d29yZCwgS2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtpZkVsc2UsIG9wSWYsIG9wTWFwfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtwYXJzZUV4cHIsIHBhcnNlRXhwclBhcnRzfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCB7YmVmb3JlQW5kT3BCbG9ja30gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHtmdW5BcmdzQW5kQmxvY2t9IGZyb20gJy4vcGFyc2VGdW4nXG5pbXBvcnQgcGFyc2VNZXRob2RJbXBscywge29wVGFrZURvLCB0YWtlU3RhdGljc30gZnJvbSAnLi9wYXJzZU1ldGhvZEltcGxzJ1xuaW1wb3J0IHtwYXJzZUxvY2FsUGFydHN9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuaW1wb3J0IHRyeVRha2VDb21tZW50IGZyb20gJy4vdHJ5VGFrZUNvbW1lbnQnXG5cbi8qKiBQYXJzZSBhIHtAbGluayBDbGFzc30uICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUNsYXNzKHRva2Vucykge1xuXHRjb25zdCBbYmVmb3JlLCBvcEJsb2NrXSA9IGJlZm9yZUFuZE9wQmxvY2sodG9rZW5zKVxuXHRjb25zdCB7b3BGaWVsZHMsIG9wU3VwZXJDbGFzcywgdHJhaXRzfSA9IHBhcnNlQ2xhc3NIZWFkZXIoYmVmb3JlKVxuXHRjb25zdCBbb3BDb21tZW50LCBvcERvLCBzdGF0aWNzLCBvcENvbnN0cnVjdG9yLCBtZXRob2RzXSA9IGlmRWxzZShvcEJsb2NrLFxuXHRcdF8gPT4ge1xuXHRcdFx0Y29uc3QgW29wQ29tbWVudCwgcmVzdF0gPSB0cnlUYWtlQ29tbWVudChvcEJsb2NrKVxuXHRcdFx0aWYgKHJlc3QuaXNFbXB0eSgpKVxuXHRcdFx0XHRyZXR1cm4gW29wQ29tbWVudCwgbnVsbCwgW10sIG51bGwsIFtdXVxuXHRcdFx0Y29uc3QgW29wRG8sIHJlc3QyXSA9IG9wVGFrZURvKHJlc3QpXG5cdFx0XHRpZiAocmVzdDIuaXNFbXB0eSgpKVxuXHRcdFx0XHRyZXR1cm4gW29wQ29tbWVudCwgb3BEbywgW10sIG51bGwsIFtdXVxuXHRcdFx0Y29uc3QgW3N0YXRpY3MsIHJlc3QzXSA9IHRha2VTdGF0aWNzKHJlc3QyKVxuXHRcdFx0aWYgKHJlc3QzLmlzRW1wdHkoKSlcblx0XHRcdFx0cmV0dXJuIFtvcENvbW1lbnQsIG9wRG8sIHN0YXRpY3MsIG51bGwsIFtdXVxuXHRcdFx0Y29uc3QgW29wQ29uc3RydWN0b3IsIHJlc3Q0XSA9IG9wVGFrZUNvbnN0cnVjdG9yKHJlc3QzKVxuXHRcdFx0cmV0dXJuIFtvcENvbW1lbnQsIG9wRG8sIHN0YXRpY3MsIG9wQ29uc3RydWN0b3IsIHBhcnNlTWV0aG9kSW1wbHMocmVzdDQpXVxuXHRcdH0sXG5cdFx0KCkgPT4gW251bGwsIG51bGwsIFtdLCBudWxsLCBbXV0pXG5cdHJldHVybiBuZXcgQ2xhc3ModG9rZW5zLmxvYyxcblx0XHRvcEZpZWxkcywgb3BTdXBlckNsYXNzLCB0cmFpdHMsIG9wQ29tbWVudCwgb3BEbywgc3RhdGljcywgb3BDb25zdHJ1Y3RvciwgbWV0aG9kcylcbn1cblxuZnVuY3Rpb24gcGFyc2VDbGFzc0hlYWRlcih0b2tlbnMpIHtcblx0Y29uc3QgW2ZpZWxkc1Rva2VucywgZXh0ZW5kc1Rva2VucywgdHJhaXRUb2tlbnNdID1cblx0XHR0b2tlbnMuZ2V0S2V5d29yZFNlY3Rpb25zKFtLZXl3b3Jkcy5FeHRlbmRzLCBLZXl3b3Jkcy5UcmFpdF0pXG5cdHJldHVybiB7XG5cdFx0b3BGaWVsZHM6IG9wSWYoIWZpZWxkc1Rva2Vucy5pc0VtcHR5KCksICgpID0+IGZpZWxkc1Rva2Vucy5tYXAoXyA9PiB7XG5cdFx0XHRjb25zdCB7bmFtZSwgb3BUeXBlLCBraW5kfSA9IHBhcnNlTG9jYWxQYXJ0cyhfKVxuXHRcdFx0Y2hlY2soa2luZCA9PT0gTG9jYWxEZWNsYXJlcy5FYWdlciwgXy5sb2MsICd0b2RvTGF6eUZpZWxkJylcblx0XHRcdHJldHVybiBuZXcgRmllbGQoXy5sb2MsIG5hbWUsIG9wVHlwZSlcblx0XHR9KSksXG5cdFx0b3BTdXBlckNsYXNzOiBvcE1hcChleHRlbmRzVG9rZW5zLCBwYXJzZUV4cHIpLFxuXHRcdHRyYWl0czogaWZFbHNlKHRyYWl0VG9rZW5zLCBwYXJzZUV4cHJQYXJ0cywgKCkgPT4gW10pXG5cdH1cbn1cblxuZnVuY3Rpb24gb3BUYWtlQ29uc3RydWN0b3IodG9rZW5zKSB7XG5cdGNvbnN0IGxpbmUgPSB0b2tlbnMuaGVhZFNsaWNlKClcblx0cmV0dXJuIGlzS2V5d29yZChLZXl3b3Jkcy5Db25zdHJ1Y3QsIGxpbmUuaGVhZCgpKSA/XG5cdFx0W3BhcnNlQ29uc3RydWN0b3IobGluZS50YWlsKCkpLCB0b2tlbnMudGFpbCgpXSA6XG5cdFx0W251bGwsIHRva2Vuc11cbn1cblxuZnVuY3Rpb24gcGFyc2VDb25zdHJ1Y3Rvcih0b2tlbnMpIHtcblx0Y29uc3Qge2FyZ3MsIG1lbWJlckFyZ3MsIG9wUmVzdEFyZywgYmxvY2t9ID0gZnVuQXJnc0FuZEJsb2NrKHRva2VucywgZmFsc2UsIHRydWUpXG5cdGNvbnN0IGZ1biA9IG5ldyBGdW4odG9rZW5zLmxvYywgYXJncywgb3BSZXN0QXJnLCBibG9jaywge2lzVGhpc0Z1bjogdHJ1ZSwgaXNEbzogdHJ1ZX0pXG5cdHJldHVybiBuZXcgQ29uc3RydWN0b3IodG9rZW5zLmxvYywgZnVuLCBtZW1iZXJBcmdzKVxufVxuIl19
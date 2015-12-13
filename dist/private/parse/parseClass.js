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
		let opComment = null,
		    opDo = null,
		    statics = [],
		    opConstructor = null,
		    methods = [];

		const finish = () => new _MsAst.Class(tokens.loc, opFields, opSuperClass, traits, opComment, opDo, statics, opConstructor, methods);

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
			opDo = new _MsAst.ClassTraitDo(line1.loc, done);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQ2xhc3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQVl3QixVQUFVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQUFWLFVBQVUiLCJmaWxlIjoicGFyc2VDbGFzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q2xhc3MsIENsYXNzVHJhaXREbywgQ29uc3RydWN0b3IsIEZpZWxkLCBGdW4sIExvY2FsRGVjbGFyZXN9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtjaGVja30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7aXNLZXl3b3JkLCBLZXl3b3Jkc30gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2lmRWxzZSwgb3BJZiwgb3BNYXB9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge3BhcnNlRXhwciwgcGFyc2VFeHByUGFydHN9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IHtiZWZvcmVBbmRPcEJsb2NrLCBwYXJzZUp1c3RCbG9ja30gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHtmdW5BcmdzQW5kQmxvY2t9IGZyb20gJy4vcGFyc2VGdW4nXG5pbXBvcnQgcGFyc2VNZXRob2RJbXBscywge3BhcnNlU3RhdGljc30gZnJvbSAnLi9wYXJzZU1ldGhvZEltcGxzJ1xuaW1wb3J0IHtwYXJzZUxvY2FsUGFydHN9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuaW1wb3J0IHRyeVRha2VDb21tZW50IGZyb20gJy4vdHJ5VGFrZUNvbW1lbnQnXG5cbi8qKiBQYXJzZSBhIHtAbGluayBDbGFzc30uICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUNsYXNzKHRva2Vucykge1xuXHRjb25zdCBbYmVmb3JlLCBvcEJsb2NrXSA9IGJlZm9yZUFuZE9wQmxvY2sodG9rZW5zKVxuXHRjb25zdCB7b3BGaWVsZHMsIG9wU3VwZXJDbGFzcywgdHJhaXRzfSA9IHBhcnNlQ2xhc3NIZWFkZXIoYmVmb3JlKVxuXG5cdGxldCBvcENvbW1lbnQgPSBudWxsLCBvcERvID0gbnVsbCwgc3RhdGljcyA9IFtdLCBvcENvbnN0cnVjdG9yID0gbnVsbCwgbWV0aG9kcyA9IFtdXG5cdGNvbnN0IGZpbmlzaCA9ICgpID0+IG5ldyBDbGFzcyh0b2tlbnMubG9jLFxuXHRcdG9wRmllbGRzLCBvcFN1cGVyQ2xhc3MsIHRyYWl0cywgb3BDb21tZW50LCBvcERvLCBzdGF0aWNzLCBvcENvbnN0cnVjdG9yLCBtZXRob2RzKVxuXG5cdGlmIChvcEJsb2NrID09PSBudWxsKVxuXHRcdHJldHVybiBmaW5pc2goKVxuXG5cdGNvbnN0IFtfb3BDb21tZW50LCBfcmVzdF0gPSB0cnlUYWtlQ29tbWVudChvcEJsb2NrKVxuXHRvcENvbW1lbnQgPSBfb3BDb21tZW50XG5cdGxldCByZXN0ID0gX3Jlc3RcblxuXHRpZiAocmVzdC5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIGZpbmlzaCgpXG5cblx0Y29uc3QgbGluZTEgPSByZXN0LmhlYWRTbGljZSgpXG5cdGlmIChpc0tleXdvcmQoS2V5d29yZHMuRG8sIGxpbmUxLmhlYWQoKSkpIHtcblx0XHRjb25zdCBkb25lID0gcGFyc2VKdXN0QmxvY2soS2V5d29yZHMuRG8sIGxpbmUxLnRhaWwoKSlcblx0XHRvcERvID0gbmV3IENsYXNzVHJhaXREbyhsaW5lMS5sb2MsIGRvbmUpXG5cdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdH1cblxuXHRpZiAocmVzdC5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIGZpbmlzaCgpXG5cblx0Y29uc3QgbGluZTIgPSByZXN0LmhlYWRTbGljZSgpXG5cdGlmIChpc0tleXdvcmQoS2V5d29yZHMuU3RhdGljLCBsaW5lMi5oZWFkKCkpKSB7XG5cdFx0c3RhdGljcyA9IHBhcnNlU3RhdGljcyhsaW5lMi50YWlsKCkpXG5cdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdH1cblxuXHRpZiAocmVzdC5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIGZpbmlzaCgpXG5cblx0Y29uc3QgbGluZTMgPSByZXN0LmhlYWRTbGljZSgpXG5cdGlmIChpc0tleXdvcmQoS2V5d29yZHMuQ29uc3RydWN0LCBsaW5lMy5oZWFkKCkpKSB7XG5cdFx0b3BDb25zdHJ1Y3RvciA9IHBhcnNlQ29uc3RydWN0b3IobGluZTMudGFpbCgpKVxuXHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHR9XG5cdG1ldGhvZHMgPSBwYXJzZU1ldGhvZEltcGxzKHJlc3QpXG5cblx0cmV0dXJuIGZpbmlzaCgpXG59XG5cbmZ1bmN0aW9uIHBhcnNlQ2xhc3NIZWFkZXIodG9rZW5zKSB7XG5cdGNvbnN0IFtmaWVsZHNUb2tlbnMsIGV4dGVuZHNUb2tlbnMsIHRyYWl0VG9rZW5zXSA9XG5cdFx0dG9rZW5zLmdldEtleXdvcmRTZWN0aW9ucyhbS2V5d29yZHMuRXh0ZW5kcywgS2V5d29yZHMuVHJhaXRdKVxuXHRyZXR1cm4ge1xuXHRcdG9wRmllbGRzOiBvcElmKCFmaWVsZHNUb2tlbnMuaXNFbXB0eSgpLCAoKSA9PiBmaWVsZHNUb2tlbnMubWFwKF8gPT4ge1xuXHRcdFx0Y29uc3Qge25hbWUsIG9wVHlwZSwga2luZH0gPSBwYXJzZUxvY2FsUGFydHMoXylcblx0XHRcdGNoZWNrKGtpbmQgPT09IExvY2FsRGVjbGFyZXMuRWFnZXIsIF8ubG9jLCAndG9kb0xhenlGaWVsZCcpXG5cdFx0XHRyZXR1cm4gbmV3IEZpZWxkKF8ubG9jLCBuYW1lLCBvcFR5cGUpXG5cdFx0fSkpLFxuXHRcdG9wU3VwZXJDbGFzczogb3BNYXAoZXh0ZW5kc1Rva2VucywgcGFyc2VFeHByKSxcblx0XHR0cmFpdHM6IGlmRWxzZSh0cmFpdFRva2VucywgcGFyc2VFeHByUGFydHMsICgpID0+IFtdKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlQ29uc3RydWN0b3IodG9rZW5zKSB7XG5cdGNvbnN0IHthcmdzLCBtZW1iZXJBcmdzLCBvcFJlc3RBcmcsIGJsb2NrfSA9IGZ1bkFyZ3NBbmRCbG9jayh0b2tlbnMsIGZhbHNlLCB0cnVlKVxuXHRjb25zdCBmdW4gPSBuZXcgRnVuKHRva2Vucy5sb2MsIGFyZ3MsIG9wUmVzdEFyZywgYmxvY2ssIHtpc1RoaXNGdW46IHRydWUsIGlzRG86IHRydWV9KVxuXHRyZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRva2Vucy5sb2MsIGZ1biwgbWVtYmVyQXJncylcbn1cbiJdfQ==
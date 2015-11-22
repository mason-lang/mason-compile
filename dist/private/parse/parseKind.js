'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../MsAst', '../Token', './parse*', './parseBlock', './parseMethodImpls', './tryTakeComment'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../MsAst'), require('../Token'), require('./parse*'), require('./parseBlock'), require('./parseMethodImpls'), require('./tryTakeComment'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst, global.Token, global.parse, global.parseBlock, global.parseMethodImpls, global.tryTakeComment);
		global.parseKind = mod.exports;
	}
})(this, function (exports, _MsAst, _Token, _parse, _parseBlock, _parseMethodImpls, _tryTakeComment3) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseKind;

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

	function parseKind(tokens) {
		var _beforeAndOpBlock = (0, _parseBlock.beforeAndOpBlock)(tokens);

		var _beforeAndOpBlock2 = _slicedToArray(_beforeAndOpBlock, 2);

		const before = _beforeAndOpBlock2[0];
		const opBlock = _beforeAndOpBlock2[1];
		const superKinds = (0, _parse.parseExprParts)(before);
		let opComment = null,
		    opDo = null,
		    statics = [],
		    methods = [];

		const finish = () => new _MsAst.Kind(tokens.loc, superKinds, opComment, opDo, statics, methods);

		if (opBlock === null) return finish();

		var _tryTakeComment = (0, _tryTakeComment4.default)(opBlock);

		var _tryTakeComment2 = _slicedToArray(_tryTakeComment, 2);

		let opCom = _tryTakeComment2[0];
		let rest = _tryTakeComment2[1];
		opComment = opCom;
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
		methods = (0, _parseMethodImpls2.default)(rest);
		return finish();
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlS2luZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBUXdCLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBQVQsU0FBUyIsImZpbGUiOiJwYXJzZUtpbmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NsYXNzS2luZERvLCBLaW5kfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7aXNLZXl3b3JkLCBLZXl3b3Jkc30gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge3BhcnNlRXhwclBhcnRzfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCB7YmVmb3JlQW5kT3BCbG9jaywgcGFyc2VKdXN0QmxvY2t9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZU1ldGhvZEltcGxzLCB7cGFyc2VTdGF0aWNzfSBmcm9tICcuL3BhcnNlTWV0aG9kSW1wbHMnXG5pbXBvcnQgdHJ5VGFrZUNvbW1lbnQgZnJvbSAnLi90cnlUYWtlQ29tbWVudCdcblxuLyoqIFBhcnNlIGEge0BsaW5rIEtpbmR9LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VLaW5kKHRva2Vucykge1xuXHRjb25zdCBbYmVmb3JlLCBvcEJsb2NrXSA9IGJlZm9yZUFuZE9wQmxvY2sodG9rZW5zKVxuXHRjb25zdCBzdXBlcktpbmRzID0gcGFyc2VFeHByUGFydHMoYmVmb3JlKVxuXG5cdGxldCBvcENvbW1lbnQgPSBudWxsLCBvcERvID0gbnVsbCwgc3RhdGljcyA9IFtdLCBtZXRob2RzID0gW11cblx0Y29uc3QgZmluaXNoID0gKCkgPT4gbmV3IEtpbmQodG9rZW5zLmxvYyxcblx0XHRzdXBlcktpbmRzLCBvcENvbW1lbnQsIG9wRG8sIHN0YXRpY3MsIG1ldGhvZHMpXG5cblx0aWYgKG9wQmxvY2sgPT09IG51bGwpXG5cdFx0cmV0dXJuIGZpbmlzaCgpXG5cblx0bGV0IFtvcENvbSwgcmVzdF0gPSB0cnlUYWtlQ29tbWVudChvcEJsb2NrKVxuXHRvcENvbW1lbnQgPSBvcENvbVxuXG5cdGlmIChyZXN0LmlzRW1wdHkoKSlcblx0XHRyZXR1cm4gZmluaXNoKClcblxuXHRjb25zdCBsaW5lMSA9IHJlc3QuaGVhZFNsaWNlKClcblx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5EbywgbGluZTEuaGVhZCgpKSkge1xuXHRcdGNvbnN0IGRvbmUgPSBwYXJzZUp1c3RCbG9jayhLZXl3b3Jkcy5EbywgbGluZTEudGFpbCgpKVxuXHRcdG9wRG8gPSBuZXcgQ2xhc3NLaW5kRG8obGluZTEubG9jLCBkb25lKVxuXHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHR9XG5cblx0aWYgKHJlc3QuaXNFbXB0eSgpKVxuXHRcdHJldHVybiBmaW5pc2goKVxuXG5cdGNvbnN0IGxpbmUyID0gcmVzdC5oZWFkU2xpY2UoKVxuXHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLlN0YXRpYywgbGluZTIuaGVhZCgpKSkge1xuXHRcdHN0YXRpY3MgPSBwYXJzZVN0YXRpY3MobGluZTIudGFpbCgpKVxuXHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHR9XG5cblx0aWYgKHJlc3QuaXNFbXB0eSgpKVxuXHRcdHJldHVybiBmaW5pc2goKVxuXG5cdG1ldGhvZHMgPSBwYXJzZU1ldGhvZEltcGxzKHJlc3QpXG5cblx0cmV0dXJuIGZpbmlzaCgpXG59XG4iXX0=
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
		global.parseTrait = mod.exports;
	}
})(this, function (exports, _MsAst, _Token, _parse, _parseBlock, _parseMethodImpls, _tryTakeComment3) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseTrait;

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

	function parseTrait(tokens) {
		var _beforeAndOpBlock = (0, _parseBlock.beforeAndOpBlock)(tokens);

		var _beforeAndOpBlock2 = _slicedToArray(_beforeAndOpBlock, 2);

		const before = _beforeAndOpBlock2[0];
		const opBlock = _beforeAndOpBlock2[1];
		const superTraits = (0, _parse.parseExprParts)(before);
		let opComment = null,
		    opDo = null,
		    statics = [],
		    methods = [];

		const finish = () => new _MsAst.Trait(tokens.loc, superTraits, opComment, opDo, statics, methods);

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
		methods = (0, _parseMethodImpls2.default)(rest);
		return finish();
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlVHJhaXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQVF3QixVQUFVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQUFWLFVBQVUiLCJmaWxlIjoicGFyc2VUcmFpdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q2xhc3NUcmFpdERvLCBUcmFpdH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2lzS2V5d29yZCwgS2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtwYXJzZUV4cHJQYXJ0c30gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQge2JlZm9yZUFuZE9wQmxvY2ssIHBhcnNlSnVzdEJsb2NrfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQgcGFyc2VNZXRob2RJbXBscywge3BhcnNlU3RhdGljc30gZnJvbSAnLi9wYXJzZU1ldGhvZEltcGxzJ1xuaW1wb3J0IHRyeVRha2VDb21tZW50IGZyb20gJy4vdHJ5VGFrZUNvbW1lbnQnXG5cbi8qKiBQYXJzZSBhIHtAbGluayBUcmFpdH0uICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZVRyYWl0KHRva2Vucykge1xuXHRjb25zdCBbYmVmb3JlLCBvcEJsb2NrXSA9IGJlZm9yZUFuZE9wQmxvY2sodG9rZW5zKVxuXHRjb25zdCBzdXBlclRyYWl0cyA9IHBhcnNlRXhwclBhcnRzKGJlZm9yZSlcblxuXHRsZXQgb3BDb21tZW50ID0gbnVsbCwgb3BEbyA9IG51bGwsIHN0YXRpY3MgPSBbXSwgbWV0aG9kcyA9IFtdXG5cdGNvbnN0IGZpbmlzaCA9ICgpID0+IG5ldyBUcmFpdCh0b2tlbnMubG9jLFxuXHRcdHN1cGVyVHJhaXRzLCBvcENvbW1lbnQsIG9wRG8sIHN0YXRpY3MsIG1ldGhvZHMpXG5cblx0aWYgKG9wQmxvY2sgPT09IG51bGwpXG5cdFx0cmV0dXJuIGZpbmlzaCgpXG5cblx0Y29uc3QgW19vcENvbW1lbnQsIF9yZXN0XSA9IHRyeVRha2VDb21tZW50KG9wQmxvY2spXG5cdG9wQ29tbWVudCA9IF9vcENvbW1lbnRcblx0bGV0IHJlc3QgPSBfcmVzdFxuXG5cdGlmIChyZXN0LmlzRW1wdHkoKSlcblx0XHRyZXR1cm4gZmluaXNoKClcblxuXHRjb25zdCBsaW5lMSA9IHJlc3QuaGVhZFNsaWNlKClcblx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5EbywgbGluZTEuaGVhZCgpKSkge1xuXHRcdGNvbnN0IGRvbmUgPSBwYXJzZUp1c3RCbG9jayhLZXl3b3Jkcy5EbywgbGluZTEudGFpbCgpKVxuXHRcdG9wRG8gPSBuZXcgQ2xhc3NUcmFpdERvKGxpbmUxLmxvYywgZG9uZSlcblx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0fVxuXG5cdGlmIChyZXN0LmlzRW1wdHkoKSlcblx0XHRyZXR1cm4gZmluaXNoKClcblxuXHRjb25zdCBsaW5lMiA9IHJlc3QuaGVhZFNsaWNlKClcblx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5TdGF0aWMsIGxpbmUyLmhlYWQoKSkpIHtcblx0XHRzdGF0aWNzID0gcGFyc2VTdGF0aWNzKGxpbmUyLnRhaWwoKSlcblx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0fVxuXG5cdGlmIChyZXN0LmlzRW1wdHkoKSlcblx0XHRyZXR1cm4gZmluaXNoKClcblxuXHRtZXRob2RzID0gcGFyc2VNZXRob2RJbXBscyhyZXN0KVxuXG5cdHJldHVybiBmaW5pc2goKVxufVxuIl19
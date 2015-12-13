'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../MsAst', '../util', './parse*', './parseBlock', './parseMethodImpls', './tryTakeComment'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../MsAst'), require('../util'), require('./parse*'), require('./parseBlock'), require('./parseMethodImpls'), require('./tryTakeComment'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst, global.util, global.parse, global.parseBlock, global.parseMethodImpls, global.tryTakeComment);
		global.parseTrait = mod.exports;
	}
})(this, function (exports, _MsAst, _util, _parse, _parseBlock, _parseMethodImpls, _tryTakeComment3) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseTrait;

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

		var _ifElse = (0, _util.ifElse)(opBlock, _ => {
			var _tryTakeComment = (0, _tryTakeComment4.default)(_);

			var _tryTakeComment2 = _slicedToArray(_tryTakeComment, 2);

			const opComment = _tryTakeComment2[0];
			const rest = _tryTakeComment2[1];
			if (rest.isEmpty()) return [opComment, null, [], []];else {
				var _opTakeDo = (0, _parseMethodImpls.opTakeDo)(rest);

				var _opTakeDo2 = _slicedToArray(_opTakeDo, 2);

				const opDo = _opTakeDo2[0];
				const rest2 = _opTakeDo2[1];

				var _parseStaticsAndMetho = (0, _parseMethodImpls.parseStaticsAndMethods)(rest2);

				var _parseStaticsAndMetho2 = _slicedToArray(_parseStaticsAndMetho, 2);

				const statics = _parseStaticsAndMetho2[0];
				const methods = _parseStaticsAndMetho2[1];
				return [opComment, opDo, statics, methods];
			}
		}, () => [null, null, [], []]);

		var _ifElse2 = _slicedToArray(_ifElse, 4);

		const opComment = _ifElse2[0];
		const opDo = _ifElse2[1];
		const statics = _ifElse2[2];
		const methods = _ifElse2[3];
		return new _MsAst.Trait(tokens.loc, superTraits, opComment, opDo, statics, methods);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlVHJhaXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQVF3QixVQUFVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFBVixVQUFVIiwiZmlsZSI6InBhcnNlVHJhaXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1RyYWl0fSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7aWZFbHNlfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtwYXJzZUV4cHJQYXJ0c30gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQge2JlZm9yZUFuZE9wQmxvY2t9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCB7b3BUYWtlRG8sIHBhcnNlU3RhdGljc0FuZE1ldGhvZHN9IGZyb20gJy4vcGFyc2VNZXRob2RJbXBscydcbmltcG9ydCB0cnlUYWtlQ29tbWVudCBmcm9tICcuL3RyeVRha2VDb21tZW50J1xuXG4vKiogUGFyc2UgYSB7QGxpbmsgVHJhaXR9LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VUcmFpdCh0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgb3BCbG9ja10gPSBiZWZvcmVBbmRPcEJsb2NrKHRva2Vucylcblx0Y29uc3Qgc3VwZXJUcmFpdHMgPSBwYXJzZUV4cHJQYXJ0cyhiZWZvcmUpXG5cdGNvbnN0IFtvcENvbW1lbnQsIG9wRG8sIHN0YXRpY3MsIG1ldGhvZHNdID0gaWZFbHNlKG9wQmxvY2ssXG5cdFx0XyA9PiB7XG5cdFx0XHRjb25zdCBbb3BDb21tZW50LCByZXN0XSA9IHRyeVRha2VDb21tZW50KF8pXG5cdFx0XHRpZiAocmVzdC5pc0VtcHR5KCkpXG5cdFx0XHRcdHJldHVybiBbb3BDb21tZW50LCBudWxsLCBbXSwgW11dXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc3QgW29wRG8sIHJlc3QyXSA9IG9wVGFrZURvKHJlc3QpXG5cdFx0XHRcdGNvbnN0IFtzdGF0aWNzLCBtZXRob2RzXSA9IHBhcnNlU3RhdGljc0FuZE1ldGhvZHMocmVzdDIpXG5cdFx0XHRcdHJldHVybiBbb3BDb21tZW50LCBvcERvLCBzdGF0aWNzLCBtZXRob2RzXVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0KCkgPT4gKFtudWxsLCBudWxsLCBbXSwgW11dKSlcblx0cmV0dXJuIG5ldyBUcmFpdCh0b2tlbnMubG9jLCBzdXBlclRyYWl0cywgb3BDb21tZW50LCBvcERvLCBzdGF0aWNzLCBtZXRob2RzKVxufVxuIl19
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

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

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
		methods = (0, _parseMethodImpls2.default)(rest);
		return finish();
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlS2luZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBUXdCLFNBQVM7Ozs7Ozs7Ozs7VUFBVCxTQUFTIiwiZmlsZSI6InBhcnNlS2luZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q2xhc3NLaW5kRG8sIEtpbmR9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7cGFyc2VFeHByUGFydHN9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IHtiZWZvcmVBbmRPcEJsb2NrLCBwYXJzZUp1c3RCbG9ja0RvfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQgcGFyc2VNZXRob2RJbXBscywge3BhcnNlU3RhdGljc30gZnJvbSAnLi9wYXJzZU1ldGhvZEltcGxzJ1xuaW1wb3J0IHRyeVRha2VDb21tZW50IGZyb20gJy4vdHJ5VGFrZUNvbW1lbnQnXG5cbi8qKiBQYXJzZSBhIHtAbGluayBLaW5kfS4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlS2luZCh0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgb3BCbG9ja10gPSBiZWZvcmVBbmRPcEJsb2NrKHRva2Vucylcblx0Y29uc3Qgc3VwZXJLaW5kcyA9IHBhcnNlRXhwclBhcnRzKGJlZm9yZSlcblxuXHRsZXQgb3BDb21tZW50ID0gbnVsbCwgb3BEbyA9IG51bGwsIHN0YXRpY3MgPSBbXSwgbWV0aG9kcyA9IFtdXG5cdGNvbnN0IGZpbmlzaCA9ICgpID0+IG5ldyBLaW5kKHRva2Vucy5sb2MsXG5cdFx0c3VwZXJLaW5kcywgb3BDb21tZW50LCBvcERvLCBzdGF0aWNzLCBtZXRob2RzKVxuXG5cdGlmIChvcEJsb2NrID09PSBudWxsKVxuXHRcdHJldHVybiBmaW5pc2goKVxuXG5cdGxldCBbb3BDb20sIHJlc3RdID0gdHJ5VGFrZUNvbW1lbnQob3BCbG9jaylcblx0b3BDb21tZW50ID0gb3BDb21cblxuXHRpZiAocmVzdC5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIGZpbmlzaCgpXG5cblx0Y29uc3QgbGluZTEgPSByZXN0LmhlYWRTbGljZSgpXG5cdGlmIChpc0tleXdvcmQoS2V5d29yZHMuRG8sIGxpbmUxLmhlYWQoKSkpIHtcblx0XHRjb25zdCBkb25lID0gcGFyc2VKdXN0QmxvY2tEbyhLZXl3b3Jkcy5EbywgbGluZTEudGFpbCgpKVxuXHRcdG9wRG8gPSBuZXcgQ2xhc3NLaW5kRG8obGluZTEubG9jLCBkb25lKVxuXHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHR9XG5cblx0aWYgKHJlc3QuaXNFbXB0eSgpKVxuXHRcdHJldHVybiBmaW5pc2goKVxuXG5cdGNvbnN0IGxpbmUyID0gcmVzdC5oZWFkU2xpY2UoKVxuXHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLlN0YXRpYywgbGluZTIuaGVhZCgpKSkge1xuXHRcdHN0YXRpY3MgPSBwYXJzZVN0YXRpY3MobGluZTIudGFpbCgpKVxuXHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHR9XG5cblx0aWYgKHJlc3QuaXNFbXB0eSgpKVxuXHRcdHJldHVybiBmaW5pc2goKVxuXG5cdG1ldGhvZHMgPSBwYXJzZU1ldGhvZEltcGxzKHJlc3QpXG5cblx0cmV0dXJuIGZpbmlzaCgpXG59XG4iXX0=
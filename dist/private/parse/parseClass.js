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
		const opSuperClass = (0, _util.opIf)(!extendedTokens.isEmpty(), () => (0, _parse.parseExpr)(extendedTokens));
		return {
			opSuperClass,
			kinds
		};
	}

	function parseConstructor(tokens) {
		var _funArgsAndBlock = (0, _parseFun.funArgsAndBlock)(tokens, true, true);

		const args = _funArgsAndBlock.args;
		const memberArgs = _funArgsAndBlock.memberArgs;
		const opRestArg = _funArgsAndBlock.opRestArg;
		const block = _funArgsAndBlock.block;
		const fun = new _MsAst.Fun(tokens.loc, args, opRestArg, block, _MsAst.Funs.Plain, true);
		return new _MsAst.Constructor(tokens.loc, fun, memberArgs);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQ2xhc3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQVV3QixVQUFVOzs7Ozs7Ozs7O1VBQVYsVUFBVSIsImZpbGUiOiJwYXJzZUNsYXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDbGFzcywgQ2xhc3NLaW5kRG8sIENvbnN0cnVjdG9yLCBGdW4sIEZ1bnN9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aWZFbHNlLCBvcElmfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtwYXJzZUV4cHIsIHBhcnNlRXhwclBhcnRzfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCB7YmVmb3JlQW5kT3BCbG9jaywgcGFyc2VKdXN0QmxvY2tEb30gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHtmdW5BcmdzQW5kQmxvY2t9IGZyb20gJy4vcGFyc2VGdW4nXG5pbXBvcnQgcGFyc2VNZXRob2RzLCB7cGFyc2VTdGF0aWNzfSBmcm9tICcuL3BhcnNlTWV0aG9kcydcbmltcG9ydCB0cnlUYWtlQ29tbWVudCBmcm9tICcuL3RyeVRha2VDb21tZW50J1xuXG4vKiogUGFyc2UgYSB7QGxpbmsgQ2xhc3N9LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VDbGFzcyh0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgb3BCbG9ja10gPSBiZWZvcmVBbmRPcEJsb2NrKHRva2Vucylcblx0Y29uc3Qge29wU3VwZXJDbGFzcywga2luZHN9ID0gcGFyc2VDbGFzc0hlYWRlcihiZWZvcmUpXG5cblx0bGV0IG9wQ29tbWVudCA9IG51bGwsIG9wRG8gPSBudWxsLCBzdGF0aWNzID0gW10sIG9wQ29uc3RydWN0b3IgPSBudWxsLCBtZXRob2RzID0gW11cblx0Y29uc3QgZmluaXNoID0gKCkgPT4gbmV3IENsYXNzKHRva2Vucy5sb2MsXG5cdFx0XHRvcFN1cGVyQ2xhc3MsIGtpbmRzLCBvcENvbW1lbnQsIG9wRG8sIHN0YXRpY3MsIG9wQ29uc3RydWN0b3IsIG1ldGhvZHMpXG5cblx0aWYgKG9wQmxvY2sgPT09IG51bGwpXG5cdFx0cmV0dXJuIGZpbmlzaCgpXG5cblx0bGV0IFtvcENvbSwgcmVzdF0gPSB0cnlUYWtlQ29tbWVudChvcEJsb2NrKVxuXHRvcENvbW1lbnQgPSBvcENvbVxuXG5cdGlmIChyZXN0LmlzRW1wdHkoKSlcblx0XHRyZXR1cm4gZmluaXNoKClcblxuXHRjb25zdCBsaW5lMSA9IHJlc3QuaGVhZFNsaWNlKClcblx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5EbywgbGluZTEuaGVhZCgpKSkge1xuXHRcdGNvbnN0IGRvbmUgPSBwYXJzZUp1c3RCbG9ja0RvKEtleXdvcmRzLkRvLCBsaW5lMS50YWlsKCkpXG5cdFx0b3BEbyA9IG5ldyBDbGFzc0tpbmREbyhsaW5lMS5sb2MsIGRvbmUpXG5cdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdH1cblxuXHRpZiAocmVzdC5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIGZpbmlzaCgpXG5cblx0Y29uc3QgbGluZTIgPSByZXN0LmhlYWRTbGljZSgpXG5cdGlmIChpc0tleXdvcmQoS2V5d29yZHMuU3RhdGljLCBsaW5lMi5oZWFkKCkpKSB7XG5cdFx0c3RhdGljcyA9IHBhcnNlU3RhdGljcyhsaW5lMi50YWlsKCkpXG5cdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdH1cblxuXHRpZiAocmVzdC5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIGZpbmlzaCgpXG5cblx0Y29uc3QgbGluZTMgPSByZXN0LmhlYWRTbGljZSgpXG5cdGlmIChpc0tleXdvcmQoS2V5d29yZHMuQ29uc3RydWN0LCBsaW5lMy5oZWFkKCkpKSB7XG5cdFx0b3BDb25zdHJ1Y3RvciA9IHBhcnNlQ29uc3RydWN0b3IobGluZTMudGFpbCgpKVxuXHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHR9XG5cdG1ldGhvZHMgPSBwYXJzZU1ldGhvZHMocmVzdClcblxuXHRyZXR1cm4gZmluaXNoKClcbn1cblxuZnVuY3Rpb24gcGFyc2VDbGFzc0hlYWRlcih0b2tlbnMpIHtcblx0Y29uc3QgW2V4dGVuZGVkVG9rZW5zLCBraW5kc10gPVxuXHRcdGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2UoXyA9PiBpc0tleXdvcmQoS2V5d29yZHMuS2luZCwgXykpLFxuXHRcdFx0KHtiZWZvcmUsIGFmdGVyfSkgPT4gW2JlZm9yZSwgcGFyc2VFeHByUGFydHMoYWZ0ZXIpXSxcblx0XHRcdCgpID0+IFt0b2tlbnMsIFtdXSlcblx0Y29uc3Qgb3BTdXBlckNsYXNzID0gb3BJZighZXh0ZW5kZWRUb2tlbnMuaXNFbXB0eSgpLCAoKSA9PiBwYXJzZUV4cHIoZXh0ZW5kZWRUb2tlbnMpKVxuXHRyZXR1cm4ge29wU3VwZXJDbGFzcywga2luZHN9XG59XG5cbmZ1bmN0aW9uIHBhcnNlQ29uc3RydWN0b3IodG9rZW5zKSB7XG5cdGNvbnN0IHthcmdzLCBtZW1iZXJBcmdzLCBvcFJlc3RBcmcsIGJsb2NrfSA9IGZ1bkFyZ3NBbmRCbG9jayh0b2tlbnMsIHRydWUsIHRydWUpXG5cdGNvbnN0IGZ1biA9IG5ldyBGdW4odG9rZW5zLmxvYywgYXJncywgb3BSZXN0QXJnLCBibG9jaywgRnVucy5QbGFpbiwgdHJ1ZSlcblx0cmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0b2tlbnMubG9jLCBmdW4sIG1lbWJlckFyZ3MpXG59XG4iXX0=
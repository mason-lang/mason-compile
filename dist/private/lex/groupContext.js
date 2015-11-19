'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', '../context', '../Token', '../util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('../context'), require('../Token'), require('../util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.context, global.Token, global.util);
		global.groupContext = mod.exports;
	}
})(this, function (exports, _Loc, _context, _Token, _util) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.curGroup = undefined;
	exports.setupGroupContext = setupGroupContext;
	exports.tearDownGroupContext = tearDownGroupContext;
	exports.addToCurrentGroup = addToCurrentGroup;
	exports.openGroup = openGroup;
	exports.maybeCloseGroup = maybeCloseGroup;
	exports.closeGroup = closeGroup;
	exports.closeSpaceOKIfEmpty = closeSpaceOKIfEmpty;
	exports.openParenthesis = openParenthesis;
	exports.closeParenthesis = closeParenthesis;
	exports.closeGroupsForDedent = closeGroupsForDedent;
	exports.openLine = openLine;
	exports.closeLine = closeLine;
	exports.space = space;

	var _Loc2 = _interopRequireDefault(_Loc);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	let groupStack;
	let curGroup = exports.curGroup = undefined;

	function setupGroupContext() {
		exports.curGroup = curGroup = new _Token.Group(new _Loc2.default(_Loc.StartPos, null), [], _Token.Groups.Block);
		groupStack = [];
	}

	function tearDownGroupContext(endPos) {
		closeLine(endPos);
		(0, _util.assert)((0, _util.isEmpty)(groupStack));
		curGroup.loc.end = endPos;
		const res = curGroup;
		groupStack = exports.curGroup = curGroup = null;
		return res;
	}

	function addToCurrentGroup(token) {
		curGroup.subTokens.push(token);
	}

	function dropGroup() {
		exports.curGroup = curGroup = groupStack.pop();
	}

	function openGroup(openPos, groupKind) {
		groupStack.push(curGroup);
		exports.curGroup = curGroup = new _Token.Group(new _Loc2.default(openPos, null), [], groupKind);
	}

	function maybeCloseGroup(closePos, closeKind) {
		if (curGroup.kind === closeKind) closeGroupNoCheck(closePos, closeKind);
	}

	function closeGroup(closePos, closeKind) {
		(0, _context.check)(closeKind === curGroup.kind, closePos, () => `Trying to close ${ (0, _Token.showGroupKind)(closeKind) }, ` + `but last opened ${ (0, _Token.showGroupKind)(curGroup.kind) }`);
		closeGroupNoCheck(closePos, closeKind);
	}

	function closeGroupNoCheck(closePos, closeKind) {
		let justClosed = curGroup;
		dropGroup();
		justClosed.loc.end = closePos;

		switch (closeKind) {
			case _Token.Groups.Space:
				{
					const size = justClosed.subTokens.length;
					if (size !== 0) addToCurrentGroup(size === 1 ? justClosed.subTokens[0] : justClosed);else (0, _context.warn)(justClosed.loc, 'Unnecessary space.');
					break;
				}

			case _Token.Groups.Line:
				if (!(0, _util.isEmpty)(justClosed.subTokens)) addToCurrentGroup(justClosed);
				break;

			case _Token.Groups.Block:
				(0, _context.check)(!(0, _util.isEmpty)(justClosed.subTokens), closePos, 'Empty block.');
				addToCurrentGroup(justClosed);
				break;

			default:
				addToCurrentGroup(justClosed);
		}
	}

	function closeSpaceOKIfEmpty(pos) {
		(0, _util.assert)(curGroup.kind === _Token.Groups.Space);
		if (curGroup.subTokens.length === 0) dropGroup();else closeGroupNoCheck(pos, _Token.Groups.Space);
	}

	function openParenthesis(loc) {
		openGroup(loc.start, _Token.Groups.Parenthesis);
		openGroup(loc.end, _Token.Groups.Space);
	}

	function closeParenthesis(loc) {
		closeGroupNoCheck(loc.start, _Token.Groups.Space);
		closeGroup(loc.end, _Token.Groups.Parenthesis);
	}

	function closeGroupsForDedent(pos) {
		closeLine(pos);
		closeGroup(pos, _Token.Groups.Block);

		while (curGroup.kind === _Token.Groups.Parenthesis || curGroup.kind === _Token.Groups.Space) closeGroupNoCheck(pos, curGroup.kind);
	}

	function openLine(pos) {
		openGroup(pos, _Token.Groups.Line);
		openGroup(pos, _Token.Groups.Space);
	}

	function closeLine(pos) {
		if (curGroup.kind === _Token.Groups.Space) closeSpaceOKIfEmpty();
		closeGroup(pos, _Token.Groups.Line);
	}

	function space(loc) {
		maybeCloseGroup(loc.start, _Token.Groups.Space);
		openGroup(loc.end, _Token.Groups.Space);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJncm91cENvbnRleHQuanMiLCJzb3VyY2VzQ29udGVudCI6W119
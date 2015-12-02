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
	exports.openInterpolation = openInterpolation;
	exports.closeInterpolationOrParenthesis = closeInterpolationOrParenthesis;
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
		const justClosed = curGroup;
		dropGroup();
		justClosed.loc.end = closePos;

		switch (closeKind) {
			case _Token.Groups.Space:
				{
					const size = justClosed.subTokens.length;
					if (size === 0) (0, _context.warn)(justClosed.loc, 'Unnecessary space.');else addToCurrentGroup(size === 1 ? justClosed.subTokens[0] : justClosed);
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

	function openInterpolation(loc) {
		openGroup(loc.start, _Token.Groups.Interpolation);
		openGroup(loc.end, _Token.Groups.Space);
	}

	function closeInterpolationOrParenthesis(loc) {
		closeGroupNoCheck(loc.start, _Token.Groups.Space);
		const kind = curGroup.kind;
		closeGroup(loc.end, kind);
		return kind === _Token.Groups.Interpolation;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9ncm91cENvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQVFnQixpQkFBaUIsR0FBakIsaUJBQWlCO1NBS2pCLG9CQUFvQixHQUFwQixvQkFBb0I7U0FlcEIsaUJBQWlCLEdBQWpCLGlCQUFpQjtTQVVqQixTQUFTLEdBQVQsU0FBUztTQU9ULGVBQWUsR0FBZixlQUFlO1NBS2YsVUFBVSxHQUFWLFVBQVU7U0FvQ1YsbUJBQW1CLEdBQW5CLG1CQUFtQjtTQVFuQixlQUFlLEdBQWYsZUFBZTtTQUtmLGlCQUFpQixHQUFqQixpQkFBaUI7U0FTakIsK0JBQStCLEdBQS9CLCtCQUErQjtTQU8vQixvQkFBb0IsR0FBcEIsb0JBQW9CO1NBV3BCLFFBQVEsR0FBUixRQUFRO1NBS1IsU0FBUyxHQUFULFNBQVM7U0FPVCxLQUFLLEdBQUwsS0FBSzs7Ozs7Ozs7Ozs7S0FwSVYsUUFBUSxXQUFSLFFBQVE7O1VBRUgsaUJBQWlCO1VBRnRCLFFBQVEsR0FHbEIsUUFBUSxHQUFHLFdBUEosS0FBSyxDQU9TLHVCQVRULFFBQVEsRUFTbUIsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLGNBQU8sS0FBSyxDQUFDOzs7O1VBSWhELG9CQUFvQjs7Ozs7dUJBUHpCLFFBQVEsR0FZTCxRQUFRLEdBQUcsSUFBSTs7OztVQVViLGlCQUFpQjs7Ozs7VUF0QnRCLFFBQVEsR0EyQmxCLFFBQVEsR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFOzs7VUFLWixTQUFTOztVQWhDZCxRQUFRLEdBb0NsQixRQUFRLEdBQUcsV0F4Q0osS0FBSyxDQXdDUyxrQkFBUSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQzs7O1VBRzVDLGVBQWU7Ozs7VUFLZixVQUFVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQW9DVixtQkFBbUI7Ozs7O1VBUW5CLGVBQWU7Ozs7O1VBS2YsaUJBQWlCOzs7OztVQVNqQiwrQkFBK0I7Ozs7Ozs7VUFPL0Isb0JBQW9COzs7Ozs7O1VBV3BCLFFBQVE7Ozs7O1VBS1IsU0FBUzs7Ozs7VUFPVCxLQUFLIiwiZmlsZSI6Imdyb3VwQ29udGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2MsIHtTdGFydFBvc30gZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQge2NoZWNrLCB3YXJufSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtHcm91cCwgR3JvdXBzLCBzaG93R3JvdXBLaW5kfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7YXNzZXJ0LCBpc0VtcHR5fSBmcm9tICcuLi91dGlsJ1xuXG5sZXQgZ3JvdXBTdGFja1xuZXhwb3J0IGxldCBjdXJHcm91cFxuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBHcm91cENvbnRleHQoKSB7XG5cdGN1ckdyb3VwID0gbmV3IEdyb3VwKG5ldyBMb2MoU3RhcnRQb3MsIG51bGwpLCBbXSwgR3JvdXBzLkJsb2NrKVxuXHRncm91cFN0YWNrID0gW11cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRlYXJEb3duR3JvdXBDb250ZXh0KGVuZFBvcykge1xuXHRjbG9zZUxpbmUoZW5kUG9zKVxuXHRhc3NlcnQoaXNFbXB0eShncm91cFN0YWNrKSlcblx0Y3VyR3JvdXAubG9jLmVuZCA9IGVuZFBvc1xuXHRjb25zdCByZXMgPSBjdXJHcm91cFxuXHRncm91cFN0YWNrID0gY3VyR3JvdXAgPSBudWxsXG5cdHJldHVybiByZXNcbn1cblxuLypcbldlIG9ubHkgZXZlciB3cml0ZSB0byB0aGUgaW5uZXJtb3N0IEdyb3VwO1xud2hlbiB3ZSBjbG9zZSB0aGF0IEdyb3VwIHdlIGFkZCBpdCB0byB0aGUgZW5jbG9zaW5nIEdyb3VwIGFuZCBjb250aW51ZSB3aXRoIHRoYXQgb25lLlxuTm90ZSB0aGF0IGBjdXJHcm91cGAgaXMgY29uY2VwdHVhbGx5IHRoZSB0b3Agb2YgdGhlIHN0YWNrLCBidXQgaXMgbm90IHN0b3JlZCBpbiBgc3RhY2tgLlxuKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFRvQ3VycmVudEdyb3VwKHRva2VuKSB7XG5cdGN1ckdyb3VwLnN1YlRva2Vucy5wdXNoKHRva2VuKVxufVxuXG5mdW5jdGlvbiBkcm9wR3JvdXAoKSB7XG5cdGN1ckdyb3VwID0gZ3JvdXBTdGFjay5wb3AoKVxufVxuXG4vLyBQYXVzZSB3cml0aW5nIHRvIGN1ckdyb3VwIGluIGZhdm9yIG9mIHdyaXRpbmcgdG8gYSBzdWItZ3JvdXAuXG4vLyBXaGVuIHRoZSBzdWItZ3JvdXAgZmluaXNoZXMgd2Ugd2lsbCBwb3AgdGhlIHN0YWNrIGFuZCByZXN1bWUgd3JpdGluZyB0byBpdHMgcGFyZW50LlxuZXhwb3J0IGZ1bmN0aW9uIG9wZW5Hcm91cChvcGVuUG9zLCBncm91cEtpbmQpIHtcblx0Z3JvdXBTdGFjay5wdXNoKGN1ckdyb3VwKVxuXHQvLyBDb250ZW50cyB3aWxsIGJlIGFkZGVkIHRvIGJ5IGBhZGRUb0N1cnJlbnRHcm91cGAuXG5cdC8vIGN1ckdyb3VwLmxvYy5lbmQgd2lsbCBiZSB3cml0dGVuIHRvIHdoZW4gY2xvc2luZyBpdC5cblx0Y3VyR3JvdXAgPSBuZXcgR3JvdXAobmV3IExvYyhvcGVuUG9zLCBudWxsKSwgW10sIGdyb3VwS2luZClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1heWJlQ2xvc2VHcm91cChjbG9zZVBvcywgY2xvc2VLaW5kKSB7XG5cdGlmIChjdXJHcm91cC5raW5kID09PSBjbG9zZUtpbmQpXG5cdFx0Y2xvc2VHcm91cE5vQ2hlY2soY2xvc2VQb3MsIGNsb3NlS2luZClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb3NlR3JvdXAoY2xvc2VQb3MsIGNsb3NlS2luZCkge1xuXHRjaGVjayhjbG9zZUtpbmQgPT09IGN1ckdyb3VwLmtpbmQsIGNsb3NlUG9zLCAoKSA9PlxuXHRcdGBUcnlpbmcgdG8gY2xvc2UgJHtzaG93R3JvdXBLaW5kKGNsb3NlS2luZCl9LCBgICtcblx0XHRgYnV0IGxhc3Qgb3BlbmVkICR7c2hvd0dyb3VwS2luZChjdXJHcm91cC5raW5kKX1gKVxuXHRjbG9zZUdyb3VwTm9DaGVjayhjbG9zZVBvcywgY2xvc2VLaW5kKVxufVxuXG5mdW5jdGlvbiBjbG9zZUdyb3VwTm9DaGVjayhjbG9zZVBvcywgY2xvc2VLaW5kKSB7XG5cdGNvbnN0IGp1c3RDbG9zZWQgPSBjdXJHcm91cFxuXHRkcm9wR3JvdXAoKVxuXHRqdXN0Q2xvc2VkLmxvYy5lbmQgPSBjbG9zZVBvc1xuXHRzd2l0Y2ggKGNsb3NlS2luZCkge1xuXHRcdGNhc2UgR3JvdXBzLlNwYWNlOiB7XG5cdFx0XHRjb25zdCBzaXplID0ganVzdENsb3NlZC5zdWJUb2tlbnMubGVuZ3RoXG5cdFx0XHRpZiAoc2l6ZSA9PT0gMClcblx0XHRcdFx0d2FybihqdXN0Q2xvc2VkLmxvYywgJ1VubmVjZXNzYXJ5IHNwYWNlLicpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdC8vIFNwYWNlZCBzaG91bGQgYWx3YXlzIGhhdmUgYXQgbGVhc3QgdHdvIGVsZW1lbnRzLlxuXHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChzaXplID09PSAxID8ganVzdENsb3NlZC5zdWJUb2tlbnNbMF0gOiBqdXN0Q2xvc2VkKVxuXHRcdFx0YnJlYWtcblx0XHR9XG5cdFx0Y2FzZSBHcm91cHMuTGluZTpcblx0XHRcdC8vIExpbmUgbXVzdCBoYXZlIGNvbnRlbnQuXG5cdFx0XHQvLyBUaGlzIGNhbiBoYXBwZW4gaWYgdGhlcmUgd2FzIGp1c3QgYSBjb21tZW50LlxuXHRcdFx0aWYgKCFpc0VtcHR5KGp1c3RDbG9zZWQuc3ViVG9rZW5zKSlcblx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoanVzdENsb3NlZClcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBHcm91cHMuQmxvY2s6XG5cdFx0XHRjaGVjayghaXNFbXB0eShqdXN0Q2xvc2VkLnN1YlRva2VucyksIGNsb3NlUG9zLCAnRW1wdHkgYmxvY2suJylcblx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKGp1c3RDbG9zZWQpXG5cdFx0XHRicmVha1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRhZGRUb0N1cnJlbnRHcm91cChqdXN0Q2xvc2VkKVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9zZVNwYWNlT0tJZkVtcHR5KHBvcykge1xuXHRhc3NlcnQoY3VyR3JvdXAua2luZCA9PT0gR3JvdXBzLlNwYWNlKVxuXHRpZiAoY3VyR3JvdXAuc3ViVG9rZW5zLmxlbmd0aCA9PT0gMClcblx0XHRkcm9wR3JvdXAoKVxuXHRlbHNlXG5cdFx0Y2xvc2VHcm91cE5vQ2hlY2socG9zLCBHcm91cHMuU3BhY2UpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcGVuUGFyZW50aGVzaXMobG9jKSB7XG5cdG9wZW5Hcm91cChsb2Muc3RhcnQsIEdyb3Vwcy5QYXJlbnRoZXNpcylcblx0b3Blbkdyb3VwKGxvYy5lbmQsIEdyb3Vwcy5TcGFjZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wZW5JbnRlcnBvbGF0aW9uKGxvYykge1xuXHRvcGVuR3JvdXAobG9jLnN0YXJ0LCBHcm91cHMuSW50ZXJwb2xhdGlvbilcblx0b3Blbkdyb3VwKGxvYy5lbmQsIEdyb3Vwcy5TcGFjZSlcbn1cblxuLyoqXG5DbG9zZSBhIEdyb3Vwcy5JbnRlcnBvbGF0aW9uIG9yIEdyb3Vwcy5QYXJlbnRoZXNpcyxcbnJldHVybmluZyB3aGV0aGVyIGl0IHdhcyBhbiBpbnRlcnBvbGF0aW9uLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBjbG9zZUludGVycG9sYXRpb25PclBhcmVudGhlc2lzKGxvYykge1xuXHRjbG9zZUdyb3VwTm9DaGVjayhsb2Muc3RhcnQsIEdyb3Vwcy5TcGFjZSlcblx0Y29uc3Qga2luZCA9IGN1ckdyb3VwLmtpbmRcblx0Y2xvc2VHcm91cChsb2MuZW5kLCBraW5kKVxuXHRyZXR1cm4ga2luZCA9PT0gR3JvdXBzLkludGVycG9sYXRpb25cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb3NlR3JvdXBzRm9yRGVkZW50KHBvcykge1xuXHRjbG9zZUxpbmUocG9zKVxuXHRjbG9zZUdyb3VwKHBvcywgR3JvdXBzLkJsb2NrKVxuXHQvLyBJdCdzIE9LIHRvIGJlIG1pc3NpbmcgYSBjbG9zaW5nIHBhcmVudGhlc2lzIGlmIHRoZXJlJ3MgYSBibG9jay4gRS5nLjpcblx0Ly8gYSAoYlxuXHQvL1x0YyB8IG5vIGNsb3NpbmcgcGFyZW4gaGVyZVxuXHR3aGlsZSAoY3VyR3JvdXAua2luZCA9PT0gR3JvdXBzLlBhcmVudGhlc2lzIHx8IGN1ckdyb3VwLmtpbmQgPT09IEdyb3Vwcy5TcGFjZSlcblx0XHRjbG9zZUdyb3VwTm9DaGVjayhwb3MsIGN1ckdyb3VwLmtpbmQpXG59XG5cbi8vIFdoZW4gc3RhcnRpbmcgYSBuZXcgbGluZSwgYSBzcGFjZWQgZ3JvdXAgaXMgY3JlYXRlZCBpbXBsaWNpdGx5LlxuZXhwb3J0IGZ1bmN0aW9uIG9wZW5MaW5lKHBvcykge1xuXHRvcGVuR3JvdXAocG9zLCBHcm91cHMuTGluZSlcblx0b3Blbkdyb3VwKHBvcywgR3JvdXBzLlNwYWNlKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xvc2VMaW5lKHBvcykge1xuXHRpZiAoY3VyR3JvdXAua2luZCA9PT0gR3JvdXBzLlNwYWNlKVxuXHRcdGNsb3NlU3BhY2VPS0lmRW1wdHkoKVxuXHRjbG9zZUdyb3VwKHBvcywgR3JvdXBzLkxpbmUpXG59XG5cbi8vIFdoZW4gZW5jb3VudGVyaW5nIGEgc3BhY2UsIGl0IGJvdGggY2xvc2VzIGFuZCBvcGVucyBhIHNwYWNlZCBncm91cC5cbmV4cG9ydCBmdW5jdGlvbiBzcGFjZShsb2MpIHtcblx0bWF5YmVDbG9zZUdyb3VwKGxvYy5zdGFydCwgR3JvdXBzLlNwYWNlKVxuXHRvcGVuR3JvdXAobG9jLmVuZCwgR3JvdXBzLlNwYWNlKVxufVxuIl19
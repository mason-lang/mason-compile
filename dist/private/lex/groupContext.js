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

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9ncm91cENvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQVFnQixpQkFBaUIsR0FBakIsaUJBQWlCO1NBS2pCLG9CQUFvQixHQUFwQixvQkFBb0I7U0FlcEIsaUJBQWlCLEdBQWpCLGlCQUFpQjtTQVVqQixTQUFTLEdBQVQsU0FBUztTQU9ULGVBQWUsR0FBZixlQUFlO1NBS2YsVUFBVSxHQUFWLFVBQVU7U0FvQ1YsbUJBQW1CLEdBQW5CLG1CQUFtQjtTQVFuQixlQUFlLEdBQWYsZUFBZTtTQUtmLGdCQUFnQixHQUFoQixnQkFBZ0I7U0FLaEIsb0JBQW9CLEdBQXBCLG9CQUFvQjtTQVdwQixRQUFRLEdBQVIsUUFBUTtTQUtSLFNBQVMsR0FBVCxTQUFTO1NBT1QsS0FBSyxHQUFMLEtBQUs7Ozs7Ozs7S0F6SFYsUUFBUSxXQUFSLFFBQVE7O1VBRUgsaUJBQWlCO1VBRnRCLFFBQVEsR0FHbEIsUUFBUSxHQUFHLFdBUEosS0FBSyxDQU9TLHVCQVRULFFBQVEsRUFTbUIsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLGNBQU8sS0FBSyxDQUFDOzs7O1VBSWhELG9CQUFvQjs7Ozs7dUJBUHpCLFFBQVEsR0FZTCxRQUFRLEdBQUcsSUFBSTs7OztVQVViLGlCQUFpQjs7Ozs7VUF0QnRCLFFBQVEsR0EyQmxCLFFBQVEsR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFOzs7VUFLWixTQUFTOztVQWhDZCxRQUFRLEdBb0NsQixRQUFRLEdBQUcsV0F4Q0osS0FBSyxDQXdDUyxrQkFBUSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQzs7O1VBRzVDLGVBQWU7Ozs7VUFLZixVQUFVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQW9DVixtQkFBbUI7Ozs7O1VBUW5CLGVBQWU7Ozs7O1VBS2YsZ0JBQWdCOzs7OztVQUtoQixvQkFBb0I7Ozs7Ozs7VUFXcEIsUUFBUTs7Ozs7VUFLUixTQUFTOzs7OztVQU9ULEtBQUsiLCJmaWxlIjoiZ3JvdXBDb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvYywge1N0YXJ0UG9zfSBmcm9tICdlc2FzdC9kaXN0L0xvYydcbmltcG9ydCB7Y2hlY2ssIHdhcm59IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0dyb3VwLCBHcm91cHMsIHNob3dHcm91cEtpbmR9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHthc3NlcnQsIGlzRW1wdHl9IGZyb20gJy4uL3V0aWwnXG5cbmxldCBncm91cFN0YWNrXG5leHBvcnQgbGV0IGN1ckdyb3VwXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cEdyb3VwQ29udGV4dCgpIHtcblx0Y3VyR3JvdXAgPSBuZXcgR3JvdXAobmV3IExvYyhTdGFydFBvcywgbnVsbCksIFtdLCBHcm91cHMuQmxvY2spXG5cdGdyb3VwU3RhY2sgPSBbXVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdGVhckRvd25Hcm91cENvbnRleHQoZW5kUG9zKSB7XG5cdGNsb3NlTGluZShlbmRQb3MpXG5cdGFzc2VydChpc0VtcHR5KGdyb3VwU3RhY2spKVxuXHRjdXJHcm91cC5sb2MuZW5kID0gZW5kUG9zXG5cdGNvbnN0IHJlcyA9IGN1ckdyb3VwXG5cdGdyb3VwU3RhY2sgPSBjdXJHcm91cCA9IG51bGxcblx0cmV0dXJuIHJlc1xufVxuXG4vKlxuV2Ugb25seSBldmVyIHdyaXRlIHRvIHRoZSBpbm5lcm1vc3QgR3JvdXA7XG53aGVuIHdlIGNsb3NlIHRoYXQgR3JvdXAgd2UgYWRkIGl0IHRvIHRoZSBlbmNsb3NpbmcgR3JvdXAgYW5kIGNvbnRpbnVlIHdpdGggdGhhdCBvbmUuXG5Ob3RlIHRoYXQgYGN1ckdyb3VwYCBpcyBjb25jZXB0dWFsbHkgdGhlIHRvcCBvZiB0aGUgc3RhY2ssIGJ1dCBpcyBub3Qgc3RvcmVkIGluIGBzdGFja2AuXG4qL1xuXG5leHBvcnQgZnVuY3Rpb24gYWRkVG9DdXJyZW50R3JvdXAodG9rZW4pIHtcblx0Y3VyR3JvdXAuc3ViVG9rZW5zLnB1c2godG9rZW4pXG59XG5cbmZ1bmN0aW9uIGRyb3BHcm91cCgpIHtcblx0Y3VyR3JvdXAgPSBncm91cFN0YWNrLnBvcCgpXG59XG5cbi8vIFBhdXNlIHdyaXRpbmcgdG8gY3VyR3JvdXAgaW4gZmF2b3Igb2Ygd3JpdGluZyB0byBhIHN1Yi1ncm91cC5cbi8vIFdoZW4gdGhlIHN1Yi1ncm91cCBmaW5pc2hlcyB3ZSB3aWxsIHBvcCB0aGUgc3RhY2sgYW5kIHJlc3VtZSB3cml0aW5nIHRvIGl0cyBwYXJlbnQuXG5leHBvcnQgZnVuY3Rpb24gb3Blbkdyb3VwKG9wZW5Qb3MsIGdyb3VwS2luZCkge1xuXHRncm91cFN0YWNrLnB1c2goY3VyR3JvdXApXG5cdC8vIENvbnRlbnRzIHdpbGwgYmUgYWRkZWQgdG8gYnkgYGFkZFRvQ3VycmVudEdyb3VwYC5cblx0Ly8gY3VyR3JvdXAubG9jLmVuZCB3aWxsIGJlIHdyaXR0ZW4gdG8gd2hlbiBjbG9zaW5nIGl0LlxuXHRjdXJHcm91cCA9IG5ldyBHcm91cChuZXcgTG9jKG9wZW5Qb3MsIG51bGwpLCBbXSwgZ3JvdXBLaW5kKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWF5YmVDbG9zZUdyb3VwKGNsb3NlUG9zLCBjbG9zZUtpbmQpIHtcblx0aWYgKGN1ckdyb3VwLmtpbmQgPT09IGNsb3NlS2luZClcblx0XHRjbG9zZUdyb3VwTm9DaGVjayhjbG9zZVBvcywgY2xvc2VLaW5kKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xvc2VHcm91cChjbG9zZVBvcywgY2xvc2VLaW5kKSB7XG5cdGNoZWNrKGNsb3NlS2luZCA9PT0gY3VyR3JvdXAua2luZCwgY2xvc2VQb3MsICgpID0+XG5cdFx0YFRyeWluZyB0byBjbG9zZSAke3Nob3dHcm91cEtpbmQoY2xvc2VLaW5kKX0sIGAgK1xuXHRcdGBidXQgbGFzdCBvcGVuZWQgJHtzaG93R3JvdXBLaW5kKGN1ckdyb3VwLmtpbmQpfWApXG5cdGNsb3NlR3JvdXBOb0NoZWNrKGNsb3NlUG9zLCBjbG9zZUtpbmQpXG59XG5cbmZ1bmN0aW9uIGNsb3NlR3JvdXBOb0NoZWNrKGNsb3NlUG9zLCBjbG9zZUtpbmQpIHtcblx0bGV0IGp1c3RDbG9zZWQgPSBjdXJHcm91cFxuXHRkcm9wR3JvdXAoKVxuXHRqdXN0Q2xvc2VkLmxvYy5lbmQgPSBjbG9zZVBvc1xuXHRzd2l0Y2ggKGNsb3NlS2luZCkge1xuXHRcdGNhc2UgR3JvdXBzLlNwYWNlOiB7XG5cdFx0XHRjb25zdCBzaXplID0ganVzdENsb3NlZC5zdWJUb2tlbnMubGVuZ3RoXG5cdFx0XHRpZiAoc2l6ZSAhPT0gMClcblx0XHRcdFx0Ly8gU3BhY2VkIHNob3VsZCBhbHdheXMgaGF2ZSBhdCBsZWFzdCB0d28gZWxlbWVudHMuXG5cdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKHNpemUgPT09IDEgPyBqdXN0Q2xvc2VkLnN1YlRva2Vuc1swXSA6IGp1c3RDbG9zZWQpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdHdhcm4oanVzdENsb3NlZC5sb2MsICdVbm5lY2Vzc2FyeSBzcGFjZS4nKVxuXHRcdFx0YnJlYWtcblx0XHR9XG5cdFx0Y2FzZSBHcm91cHMuTGluZTpcblx0XHRcdC8vIExpbmUgbXVzdCBoYXZlIGNvbnRlbnQuXG5cdFx0XHQvLyBUaGlzIGNhbiBoYXBwZW4gaWYgdGhlcmUgd2FzIGp1c3QgYSBjb21tZW50LlxuXHRcdFx0aWYgKCFpc0VtcHR5KGp1c3RDbG9zZWQuc3ViVG9rZW5zKSlcblx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoanVzdENsb3NlZClcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBHcm91cHMuQmxvY2s6XG5cdFx0XHRjaGVjayghaXNFbXB0eShqdXN0Q2xvc2VkLnN1YlRva2VucyksIGNsb3NlUG9zLCAnRW1wdHkgYmxvY2suJylcblx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKGp1c3RDbG9zZWQpXG5cdFx0XHRicmVha1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRhZGRUb0N1cnJlbnRHcm91cChqdXN0Q2xvc2VkKVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9zZVNwYWNlT0tJZkVtcHR5KHBvcykge1xuXHRhc3NlcnQoY3VyR3JvdXAua2luZCA9PT0gR3JvdXBzLlNwYWNlKVxuXHRpZiAoY3VyR3JvdXAuc3ViVG9rZW5zLmxlbmd0aCA9PT0gMClcblx0XHRkcm9wR3JvdXAoKVxuXHRlbHNlXG5cdFx0Y2xvc2VHcm91cE5vQ2hlY2socG9zLCBHcm91cHMuU3BhY2UpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcGVuUGFyZW50aGVzaXMobG9jKSB7XG5cdG9wZW5Hcm91cChsb2Muc3RhcnQsIEdyb3Vwcy5QYXJlbnRoZXNpcylcblx0b3Blbkdyb3VwKGxvYy5lbmQsIEdyb3Vwcy5TcGFjZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb3NlUGFyZW50aGVzaXMobG9jKSB7XG5cdGNsb3NlR3JvdXBOb0NoZWNrKGxvYy5zdGFydCwgR3JvdXBzLlNwYWNlKVxuXHRjbG9zZUdyb3VwKGxvYy5lbmQsIEdyb3Vwcy5QYXJlbnRoZXNpcylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb3NlR3JvdXBzRm9yRGVkZW50KHBvcykge1xuXHRjbG9zZUxpbmUocG9zKVxuXHRjbG9zZUdyb3VwKHBvcywgR3JvdXBzLkJsb2NrKVxuXHQvLyBJdCdzIE9LIHRvIGJlIG1pc3NpbmcgYSBjbG9zaW5nIHBhcmVudGhlc2lzIGlmIHRoZXJlJ3MgYSBibG9jay4gRS5nLjpcblx0Ly8gYSAoYlxuXHQvL1x0YyB8IG5vIGNsb3NpbmcgcGFyZW4gaGVyZVxuXHR3aGlsZSAoY3VyR3JvdXAua2luZCA9PT0gR3JvdXBzLlBhcmVudGhlc2lzIHx8IGN1ckdyb3VwLmtpbmQgPT09IEdyb3Vwcy5TcGFjZSlcblx0XHRjbG9zZUdyb3VwTm9DaGVjayhwb3MsIGN1ckdyb3VwLmtpbmQpXG59XG5cbi8vIFdoZW4gc3RhcnRpbmcgYSBuZXcgbGluZSwgYSBzcGFjZWQgZ3JvdXAgaXMgY3JlYXRlZCBpbXBsaWNpdGx5LlxuZXhwb3J0IGZ1bmN0aW9uIG9wZW5MaW5lKHBvcykge1xuXHRvcGVuR3JvdXAocG9zLCBHcm91cHMuTGluZSlcblx0b3Blbkdyb3VwKHBvcywgR3JvdXBzLlNwYWNlKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xvc2VMaW5lKHBvcykge1xuXHRpZiAoY3VyR3JvdXAua2luZCA9PT0gR3JvdXBzLlNwYWNlKVxuXHRcdGNsb3NlU3BhY2VPS0lmRW1wdHkoKVxuXHRjbG9zZUdyb3VwKHBvcywgR3JvdXBzLkxpbmUpXG59XG5cbi8vIFdoZW4gZW5jb3VudGVyaW5nIGEgc3BhY2UsIGl0IGJvdGggY2xvc2VzIGFuZCBvcGVucyBhIHNwYWNlZCBncm91cC5cbmV4cG9ydCBmdW5jdGlvbiBzcGFjZShsb2MpIHtcblx0bWF5YmVDbG9zZUdyb3VwKGxvYy5zdGFydCwgR3JvdXBzLlNwYWNlKVxuXHRvcGVuR3JvdXAobG9jLmVuZCwgR3JvdXBzLlNwYWNlKVxufVxuIl19
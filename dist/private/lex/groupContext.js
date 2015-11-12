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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9ncm91cENvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQVFnQixpQkFBaUIsR0FBakIsaUJBQWlCO1NBS2pCLG9CQUFvQixHQUFwQixvQkFBb0I7U0FlcEIsaUJBQWlCLEdBQWpCLGlCQUFpQjtTQVVqQixTQUFTLEdBQVQsU0FBUztTQU9ULGVBQWUsR0FBZixlQUFlO1NBS2YsVUFBVSxHQUFWLFVBQVU7U0FvQ1YsbUJBQW1CLEdBQW5CLG1CQUFtQjtTQVFuQixlQUFlLEdBQWYsZUFBZTtTQUtmLGdCQUFnQixHQUFoQixnQkFBZ0I7U0FLaEIsb0JBQW9CLEdBQXBCLG9CQUFvQjtTQVdwQixRQUFRLEdBQVIsUUFBUTtTQUtSLFNBQVMsR0FBVCxTQUFTO1NBT1QsS0FBSyxHQUFMLEtBQUs7Ozs7Ozs7Ozs7O0tBekhWLFFBQVEsV0FBUixRQUFROztVQUVILGlCQUFpQjtVQUZ0QixRQUFRLEdBR2xCLFFBQVEsR0FBRyxXQVBKLEtBQUssQ0FPUyx1QkFUVCxRQUFRLEVBU21CLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxjQUFPLEtBQUssQ0FBQzs7OztVQUloRCxvQkFBb0I7Ozs7O3VCQVB6QixRQUFRLEdBWUwsUUFBUSxHQUFHLElBQUk7Ozs7VUFVYixpQkFBaUI7Ozs7O1VBdEJ0QixRQUFRLEdBMkJsQixRQUFRLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTs7O1VBS1osU0FBUzs7VUFoQ2QsUUFBUSxHQW9DbEIsUUFBUSxHQUFHLFdBeENKLEtBQUssQ0F3Q1Msa0JBQVEsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUM7OztVQUc1QyxlQUFlOzs7O1VBS2YsVUFBVTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFvQ1YsbUJBQW1COzs7OztVQVFuQixlQUFlOzs7OztVQUtmLGdCQUFnQjs7Ozs7VUFLaEIsb0JBQW9COzs7Ozs7O1VBV3BCLFFBQVE7Ozs7O1VBS1IsU0FBUzs7Ozs7VUFPVCxLQUFLIiwiZmlsZSI6Imdyb3VwQ29udGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2MsIHtTdGFydFBvc30gZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQge2NoZWNrLCB3YXJufSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtHcm91cCwgR3JvdXBzLCBzaG93R3JvdXBLaW5kfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7YXNzZXJ0LCBpc0VtcHR5fSBmcm9tICcuLi91dGlsJ1xuXG5sZXQgZ3JvdXBTdGFja1xuZXhwb3J0IGxldCBjdXJHcm91cFxuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBHcm91cENvbnRleHQoKSB7XG5cdGN1ckdyb3VwID0gbmV3IEdyb3VwKG5ldyBMb2MoU3RhcnRQb3MsIG51bGwpLCBbXSwgR3JvdXBzLkJsb2NrKVxuXHRncm91cFN0YWNrID0gW11cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRlYXJEb3duR3JvdXBDb250ZXh0KGVuZFBvcykge1xuXHRjbG9zZUxpbmUoZW5kUG9zKVxuXHRhc3NlcnQoaXNFbXB0eShncm91cFN0YWNrKSlcblx0Y3VyR3JvdXAubG9jLmVuZCA9IGVuZFBvc1xuXHRjb25zdCByZXMgPSBjdXJHcm91cFxuXHRncm91cFN0YWNrID0gY3VyR3JvdXAgPSBudWxsXG5cdHJldHVybiByZXNcbn1cblxuLypcbldlIG9ubHkgZXZlciB3cml0ZSB0byB0aGUgaW5uZXJtb3N0IEdyb3VwO1xud2hlbiB3ZSBjbG9zZSB0aGF0IEdyb3VwIHdlIGFkZCBpdCB0byB0aGUgZW5jbG9zaW5nIEdyb3VwIGFuZCBjb250aW51ZSB3aXRoIHRoYXQgb25lLlxuTm90ZSB0aGF0IGBjdXJHcm91cGAgaXMgY29uY2VwdHVhbGx5IHRoZSB0b3Agb2YgdGhlIHN0YWNrLCBidXQgaXMgbm90IHN0b3JlZCBpbiBgc3RhY2tgLlxuKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFRvQ3VycmVudEdyb3VwKHRva2VuKSB7XG5cdGN1ckdyb3VwLnN1YlRva2Vucy5wdXNoKHRva2VuKVxufVxuXG5mdW5jdGlvbiBkcm9wR3JvdXAoKSB7XG5cdGN1ckdyb3VwID0gZ3JvdXBTdGFjay5wb3AoKVxufVxuXG4vLyBQYXVzZSB3cml0aW5nIHRvIGN1ckdyb3VwIGluIGZhdm9yIG9mIHdyaXRpbmcgdG8gYSBzdWItZ3JvdXAuXG4vLyBXaGVuIHRoZSBzdWItZ3JvdXAgZmluaXNoZXMgd2Ugd2lsbCBwb3AgdGhlIHN0YWNrIGFuZCByZXN1bWUgd3JpdGluZyB0byBpdHMgcGFyZW50LlxuZXhwb3J0IGZ1bmN0aW9uIG9wZW5Hcm91cChvcGVuUG9zLCBncm91cEtpbmQpIHtcblx0Z3JvdXBTdGFjay5wdXNoKGN1ckdyb3VwKVxuXHQvLyBDb250ZW50cyB3aWxsIGJlIGFkZGVkIHRvIGJ5IGBhZGRUb0N1cnJlbnRHcm91cGAuXG5cdC8vIGN1ckdyb3VwLmxvYy5lbmQgd2lsbCBiZSB3cml0dGVuIHRvIHdoZW4gY2xvc2luZyBpdC5cblx0Y3VyR3JvdXAgPSBuZXcgR3JvdXAobmV3IExvYyhvcGVuUG9zLCBudWxsKSwgW10sIGdyb3VwS2luZClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1heWJlQ2xvc2VHcm91cChjbG9zZVBvcywgY2xvc2VLaW5kKSB7XG5cdGlmIChjdXJHcm91cC5raW5kID09PSBjbG9zZUtpbmQpXG5cdFx0Y2xvc2VHcm91cE5vQ2hlY2soY2xvc2VQb3MsIGNsb3NlS2luZClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb3NlR3JvdXAoY2xvc2VQb3MsIGNsb3NlS2luZCkge1xuXHRjaGVjayhjbG9zZUtpbmQgPT09IGN1ckdyb3VwLmtpbmQsIGNsb3NlUG9zLCAoKSA9PlxuXHRcdGBUcnlpbmcgdG8gY2xvc2UgJHtzaG93R3JvdXBLaW5kKGNsb3NlS2luZCl9LCBgICtcblx0XHRgYnV0IGxhc3Qgb3BlbmVkICR7c2hvd0dyb3VwS2luZChjdXJHcm91cC5raW5kKX1gKVxuXHRjbG9zZUdyb3VwTm9DaGVjayhjbG9zZVBvcywgY2xvc2VLaW5kKVxufVxuXG5mdW5jdGlvbiBjbG9zZUdyb3VwTm9DaGVjayhjbG9zZVBvcywgY2xvc2VLaW5kKSB7XG5cdGxldCBqdXN0Q2xvc2VkID0gY3VyR3JvdXBcblx0ZHJvcEdyb3VwKClcblx0anVzdENsb3NlZC5sb2MuZW5kID0gY2xvc2VQb3Ncblx0c3dpdGNoIChjbG9zZUtpbmQpIHtcblx0XHRjYXNlIEdyb3Vwcy5TcGFjZToge1xuXHRcdFx0Y29uc3Qgc2l6ZSA9IGp1c3RDbG9zZWQuc3ViVG9rZW5zLmxlbmd0aFxuXHRcdFx0aWYgKHNpemUgIT09IDApXG5cdFx0XHRcdC8vIFNwYWNlZCBzaG91bGQgYWx3YXlzIGhhdmUgYXQgbGVhc3QgdHdvIGVsZW1lbnRzLlxuXHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChzaXplID09PSAxID8ganVzdENsb3NlZC5zdWJUb2tlbnNbMF0gOiBqdXN0Q2xvc2VkKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHR3YXJuKGp1c3RDbG9zZWQubG9jLCAnVW5uZWNlc3Nhcnkgc3BhY2UuJylcblx0XHRcdGJyZWFrXG5cdFx0fVxuXHRcdGNhc2UgR3JvdXBzLkxpbmU6XG5cdFx0XHQvLyBMaW5lIG11c3QgaGF2ZSBjb250ZW50LlxuXHRcdFx0Ly8gVGhpcyBjYW4gaGFwcGVuIGlmIHRoZXJlIHdhcyBqdXN0IGEgY29tbWVudC5cblx0XHRcdGlmICghaXNFbXB0eShqdXN0Q2xvc2VkLnN1YlRva2VucykpXG5cdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKGp1c3RDbG9zZWQpXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgR3JvdXBzLkJsb2NrOlxuXHRcdFx0Y2hlY2soIWlzRW1wdHkoanVzdENsb3NlZC5zdWJUb2tlbnMpLCBjbG9zZVBvcywgJ0VtcHR5IGJsb2NrLicpXG5cdFx0XHRhZGRUb0N1cnJlbnRHcm91cChqdXN0Q2xvc2VkKVxuXHRcdFx0YnJlYWtcblx0XHRkZWZhdWx0OlxuXHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoanVzdENsb3NlZClcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xvc2VTcGFjZU9LSWZFbXB0eShwb3MpIHtcblx0YXNzZXJ0KGN1ckdyb3VwLmtpbmQgPT09IEdyb3Vwcy5TcGFjZSlcblx0aWYgKGN1ckdyb3VwLnN1YlRva2Vucy5sZW5ndGggPT09IDApXG5cdFx0ZHJvcEdyb3VwKClcblx0ZWxzZVxuXHRcdGNsb3NlR3JvdXBOb0NoZWNrKHBvcywgR3JvdXBzLlNwYWNlKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3BlblBhcmVudGhlc2lzKGxvYykge1xuXHRvcGVuR3JvdXAobG9jLnN0YXJ0LCBHcm91cHMuUGFyZW50aGVzaXMpXG5cdG9wZW5Hcm91cChsb2MuZW5kLCBHcm91cHMuU3BhY2UpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9zZVBhcmVudGhlc2lzKGxvYykge1xuXHRjbG9zZUdyb3VwTm9DaGVjayhsb2Muc3RhcnQsIEdyb3Vwcy5TcGFjZSlcblx0Y2xvc2VHcm91cChsb2MuZW5kLCBHcm91cHMuUGFyZW50aGVzaXMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9zZUdyb3Vwc0ZvckRlZGVudChwb3MpIHtcblx0Y2xvc2VMaW5lKHBvcylcblx0Y2xvc2VHcm91cChwb3MsIEdyb3Vwcy5CbG9jaylcblx0Ly8gSXQncyBPSyB0byBiZSBtaXNzaW5nIGEgY2xvc2luZyBwYXJlbnRoZXNpcyBpZiB0aGVyZSdzIGEgYmxvY2suIEUuZy46XG5cdC8vIGEgKGJcblx0Ly9cdGMgfCBubyBjbG9zaW5nIHBhcmVuIGhlcmVcblx0d2hpbGUgKGN1ckdyb3VwLmtpbmQgPT09IEdyb3Vwcy5QYXJlbnRoZXNpcyB8fCBjdXJHcm91cC5raW5kID09PSBHcm91cHMuU3BhY2UpXG5cdFx0Y2xvc2VHcm91cE5vQ2hlY2socG9zLCBjdXJHcm91cC5raW5kKVxufVxuXG4vLyBXaGVuIHN0YXJ0aW5nIGEgbmV3IGxpbmUsIGEgc3BhY2VkIGdyb3VwIGlzIGNyZWF0ZWQgaW1wbGljaXRseS5cbmV4cG9ydCBmdW5jdGlvbiBvcGVuTGluZShwb3MpIHtcblx0b3Blbkdyb3VwKHBvcywgR3JvdXBzLkxpbmUpXG5cdG9wZW5Hcm91cChwb3MsIEdyb3Vwcy5TcGFjZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb3NlTGluZShwb3MpIHtcblx0aWYgKGN1ckdyb3VwLmtpbmQgPT09IEdyb3Vwcy5TcGFjZSlcblx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KClcblx0Y2xvc2VHcm91cChwb3MsIEdyb3Vwcy5MaW5lKVxufVxuXG4vLyBXaGVuIGVuY291bnRlcmluZyBhIHNwYWNlLCBpdCBib3RoIGNsb3NlcyBhbmQgb3BlbnMgYSBzcGFjZWQgZ3JvdXAuXG5leHBvcnQgZnVuY3Rpb24gc3BhY2UobG9jKSB7XG5cdG1heWJlQ2xvc2VHcm91cChsb2Muc3RhcnQsIEdyb3Vwcy5TcGFjZSlcblx0b3Blbkdyb3VwKGxvYy5lbmQsIEdyb3Vwcy5TcGFjZSlcbn1cbiJdfQ==
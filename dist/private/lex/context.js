(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'esast/dist/Loc', '../context', '../Token', '../util'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports, require('esast/dist/Loc'), require('../context'), require('../Token'), require('../util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.context, global.Token, global.util);
		global.context = mod.exports;
	}
})(this, function (exports, _esastDistLoc, _context, _Token, _util) {
	//TODO: groupContext.js
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports.setup = setup;
	exports.tearDown = tearDown;
	exports.addToCurrentGroup = addToCurrentGroup;
	exports.dropGroup = dropGroup;
	exports.openGroup = openGroup;
	exports.maybeCloseGroup = maybeCloseGroup;
	exports.closeGroup = closeGroup;
	exports._closeGroup = _closeGroup;
	exports.closeSpaceOKIfEmpty = closeSpaceOKIfEmpty;
	exports.openParenthesis = openParenthesis;
	exports.closeParenthesis = closeParenthesis;
	exports.closeGroupsForDedent = closeGroupsForDedent;
	exports.openLine = openLine;
	exports.closeLine = closeLine;
	exports.space = space;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _Loc = _interopRequireDefault(_esastDistLoc);

	let groupStack;
	exports.groupStack = groupStack;
	let curGroup;

	exports.curGroup = curGroup;

	function setup() {
		exports.curGroup = curGroup = new _Token.Group(new _Loc.default(_esastDistLoc.StartPos, null), [], _Token.Groups.Block);
		exports.groupStack = groupStack = [];
	}

	//call me

	function tearDown() {
		exports.groupStack = groupStack = exports.curGroup = curGroup = null;
	}

	//todo groupContext
	// --------------------------------------------------------------------------------------------
	// GROUPING
	// --------------------------------------------------------------------------------------------
	// We only ever write to the innermost Group;
	// when we close that Group we add it to the enclosing Group and continue with that one.
	// Note that `curGroup` is conceptually the top of the stack, but is not stored in `stack`.

	function addToCurrentGroup(token) {
		curGroup.subTokens.push(token);
	}

	function dropGroup() {
		exports.curGroup = curGroup = groupStack.pop();
	}

	// Pause writing to curGroup in favor of writing to a sub-group.
	// When the sub-group finishes we will pop the stack and resume writing to its parent.

	function openGroup(openPos, groupKind) {
		groupStack.push(curGroup);
		// Contents will be added to by `addToCurrentGroup`.
		// curGroup.loc.end will be written to when closing it.
		exports.curGroup = curGroup = new _Token.Group(new _Loc.default(openPos, null), [], groupKind);
	}

	function maybeCloseGroup(closePos, closeKind) {
		if (curGroup.kind === closeKind) _closeGroup(closePos, closeKind);
	}

	function closeGroup(closePos, closeKind) {
		(0, _context.check)(closeKind === curGroup.kind, closePos, () => `Trying to close ${ (0, _Token.showGroupKind)(closeKind) }, ` + `but last opened ${ (0, _Token.showGroupKind)(curGroup.kind) }`);
		_closeGroup(closePos, closeKind);
	}

	//TODO: name implies this should not be exported...

	function _closeGroup(closePos, closeKind) {
		let justClosed = curGroup;
		dropGroup();
		justClosed.loc.end = closePos;
		switch (closeKind) {
			case _Token.Groups.Space:
				{
					const size = justClosed.subTokens.length;
					if (size !== 0)
						// Spaced should always have at least two elements.
						addToCurrentGroup(size === 1 ? justClosed.subTokens[0] : justClosed);else (0, _context.warn)(justClosed.loc, 'Unnecessary space.');
					break;
				}
			case _Token.Groups.Line:
				// Line must have content.
				// This can happen if there was just a comment.
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
		if (curGroup.subTokens.length === 0) dropGroup();else _closeGroup(pos, _Token.Groups.Space);
	}

	function openParenthesis(loc) {
		openGroup(loc.start, _Token.Groups.Parenthesis);
		openGroup(loc.end, _Token.Groups.Space);
	}

	function closeParenthesis(loc) {
		_closeGroup(loc.start, _Token.Groups.Space);
		closeGroup(loc.end, _Token.Groups.Parenthesis);
	}

	function closeGroupsForDedent(pos) {
		closeLine(pos);
		closeGroup(pos, _Token.Groups.Block);
		// It's OK to be missing a closing parenthesis if there's a block. E.g.:
		// a (b
		//	c | no closing paren here
		while (curGroup.kind === _Token.Groups.Parenthesis || curGroup.kind === _Token.Groups.Space) _closeGroup(pos, curGroup.kind);
	}

	// When starting a new line, a spaced group is created implicitly.

	function openLine(pos) {
		openGroup(pos, _Token.Groups.Line);
		openGroup(pos, _Token.Groups.Space);
	}

	function closeLine(pos) {
		if (curGroup.kind === _Token.Groups.Space) closeSpaceOKIfEmpty();
		closeGroup(pos, _Token.Groups.Line);
	}

	// When encountering a space, it both closes and opens a spaced group.

	function space(loc) {
		maybeCloseGroup(loc.start, _Token.Groups.Space);
		openGroup(loc.end, _Token.Groups.Space);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9jb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU1PLEtBQUksVUFBVSxDQUFBOztBQUNkLEtBQUksUUFBUSxDQUFBOzs7O0FBRVosVUFBUyxLQUFLLEdBQUc7QUFDdkIsVUFIVSxRQUFRLEdBR2xCLFFBQVEsR0FBRyxXQVBKLEtBQUssQ0FPUywrQkFUVCxRQUFRLEVBU21CLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxPQVBwQyxNQUFNLENBT3FDLEtBQUssQ0FBQyxDQUFBO0FBQy9ELFVBTFUsVUFBVSxHQUtwQixVQUFVLEdBQUcsRUFBRSxDQUFBO0VBQ2Y7Ozs7QUFHTSxVQUFTLFFBQVEsR0FBRztBQUMxQixVQVZVLFVBQVUsR0FVcEIsVUFBVSxXQVRBLFFBQVEsR0FTTCxRQUFRLEdBQUcsSUFBSSxDQUFBO0VBQzVCOzs7Ozs7Ozs7O0FBVU0sVUFBUyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUU7QUFDeEMsVUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7RUFDOUI7O0FBRU0sVUFBUyxTQUFTLEdBQUc7QUFDM0IsVUF6QlUsUUFBUSxHQXlCbEIsUUFBUSxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtFQUMzQjs7Ozs7QUFJTSxVQUFTLFNBQVMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFO0FBQzdDLFlBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7OztBQUd6QixVQWxDVSxRQUFRLEdBa0NsQixRQUFRLEdBQUcsV0F0Q0osS0FBSyxDQXNDUyxpQkFBUSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFBO0VBQzNEOztBQUVNLFVBQVMsZUFBZSxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUU7QUFDcEQsTUFBSSxRQUFRLENBQUMsSUFBSSxL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QyxDQUFBO0FBQ2QsWUFBVSxDQUFDLEdBQUcsRUFBRSxPQXZHRixNQUFNLENBdUdHLEtBQUssQ0FBQyxDQUFBOzs7O0FBSTdCLFNBQU8sUUFBUSxDQUFDLElBQUksS0FBSyxPQTNHWCxNQUFNLENBMkdZLFdBQVcsSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLE9BM0duRCxNQUFNLENBMkdvRCxLQUFLLEVBQzVFLFdBQVcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO0VBQ2hDOzs7O0FBR00sVUFBUyxRQUFRLENBQUMsR0FBRyxFQUFFO0FBQzdCLFdBQVMsQ0FBQyxHQUFHLEVBQUUsT0FqSEQsTUFBTSxDQWlIRSxJQUFJLENBQUMsQ0FBQTtBQUMzQixXQUFTLENBQUMsR0FBRyxFQUFFLE9BbEhELE1BQU0sQ0FrSEUsS0FBSyxDQUFDLENBQUE7RUFDNUI7O0FBRU0sVUFBUyxTQUFTLENBQUMsR0FBRyxFQUFFO0FBQzlCLE1BQUksUUFBUSxDQUFDLElBQUksS0FBSyxPQXRIUixNQUFNLENBc0hTLEtBQUssRUFDakMsbUJBQW1CLEVBQUUsQ0FBQTtBQUN0QixZQUFVLENBQUMsR0FBRyxFQUFFLE9BeEhGLE1BQU0sQ0F3SEcsSUFBSSxDQUFDLENBQUE7RUFDNUI7Ozs7QUFHTSxVQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUU7QUFDMUIsaUJBQWUsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BN0hiLE1BQU0sQ0E2SGMsS0FBSyxDQUFDLENBQUE7QUFDeEMsV0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsT0E5SEwsTUFBTSxDQThITSxLQUFLLENBQUMsQ0FBQTtFQUNoQyIsImZpbGUiOiJjb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy9UT0RPOiBncm91cENvbnRleHQuanNcbmltcG9ydCBMb2MsIHtTdGFydFBvc30gZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQge2NoZWNrLCB3YXJufSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtHcm91cCwgR3JvdXBzLCBzaG93R3JvdXBLaW5kfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7YXNzZXJ0LCBpc0VtcHR5fSBmcm9tICcuLi91dGlsJ1xuXG5leHBvcnQgbGV0IGdyb3VwU3RhY2tcbmV4cG9ydCBsZXQgY3VyR3JvdXBcblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwKCkge1xuXHRjdXJHcm91cCA9IG5ldyBHcm91cChuZXcgTG9jKFN0YXJ0UG9zLCBudWxsKSwgW10sIEdyb3Vwcy5CbG9jaylcblx0Z3JvdXBTdGFjayA9IFtdXG59XG5cbi8vY2FsbCBtZVxuZXhwb3J0IGZ1bmN0aW9uIHRlYXJEb3duKCkge1xuXHRncm91cFN0YWNrID0gY3VyR3JvdXAgPSBudWxsXG59XG5cbi8vdG9kbyBncm91cENvbnRleHRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBHUk9VUElOR1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFdlIG9ubHkgZXZlciB3cml0ZSB0byB0aGUgaW5uZXJtb3N0IEdyb3VwO1xuLy8gd2hlbiB3ZSBjbG9zZSB0aGF0IEdyb3VwIHdlIGFkZCBpdCB0byB0aGUgZW5jbG9zaW5nIEdyb3VwIGFuZCBjb250aW51ZSB3aXRoIHRoYXQgb25lLlxuLy8gTm90ZSB0aGF0IGBjdXJHcm91cGAgaXMgY29uY2VwdHVhbGx5IHRoZSB0b3Agb2YgdGhlIHN0YWNrLCBidXQgaXMgbm90IHN0b3JlZCBpbiBgc3RhY2tgLlxuXG5leHBvcnQgZnVuY3Rpb24gYWRkVG9DdXJyZW50R3JvdXAodG9rZW4pIHtcblx0Y3VyR3JvdXAuc3ViVG9rZW5zLnB1c2godG9rZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcm9wR3JvdXAoKSB7XG5cdGN1ckdyb3VwID0gZ3JvdXBTdGFjay5wb3AoKVxufVxuXG4vLyBQYXVzZSB3cml0aW5nIHRvIGN1ckdyb3VwIGluIGZhdm9yIG9mIHdyaXRpbmcgdG8gYSBzdWItZ3JvdXAuXG4vLyBXaGVuIHRoZSBzdWItZ3JvdXAgZmluaXNoZXMgd2Ugd2lsbCBwb3AgdGhlIHN0YWNrIGFuZCByZXN1bWUgd3JpdGluZyB0byBpdHMgcGFyZW50LlxuZXhwb3J0IGZ1bmN0aW9uIG9wZW5Hcm91cChvcGVuUG9zLCBncm91cEtpbmQpIHtcblx0Z3JvdXBTdGFjay5wdXNoKGN1ckdyb3VwKVxuXHQvLyBDb250ZW50cyB3aWxsIGJlIGFkZGVkIHRvIGJ5IGBhZGRUb0N1cnJlbnRHcm91cGAuXG5cdC8vIGN1ckdyb3VwLmxvYy5lbmQgd2lsbCBiZSB3cml0dGVuIHRvIHdoZW4gY2xvc2luZyBpdC5cblx0Y3VyR3JvdXAgPSBuZXcgR3JvdXAobmV3IExvYyhvcGVuUG9zLCBudWxsKSwgW10sIGdyb3VwS2luZClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1heWJlQ2xvc2VHcm91cChjbG9zZVBvcywgY2xvc2VLaW5kKSB7XG5cdGlmIChjdXJHcm91cC5raW5kID09PSBjbG9zZUtpbmQpXG5cdFx0X2Nsb3NlR3JvdXAoY2xvc2VQb3MsIGNsb3NlS2luZClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb3NlR3JvdXAoY2xvc2VQb3MsIGNsb3NlS2luZCkge1xuXHRjaGVjayhjbG9zZUtpbmQgPT09IGN1ckdyb3VwLmtpbmQsIGNsb3NlUG9zLCAoKSA9PlxuXHRcdGBUcnlpbmcgdG8gY2xvc2UgJHtzaG93R3JvdXBLaW5kKGNsb3NlS2luZCl9LCBgICtcblx0XHRgYnV0IGxhc3Qgb3BlbmVkICR7c2hvd0dyb3VwS2luZChjdXJHcm91cC5raW5kKX1gKVxuXHRfY2xvc2VHcm91cChjbG9zZVBvcywgY2xvc2VLaW5kKVxufVxuXG4vL1RPRE86IG5hbWUgaW1wbGllcyB0aGlzIHNob3VsZCBub3QgYmUgZXhwb3J0ZWQuLi5cbmV4cG9ydCBmdW5jdGlvbiBfY2xvc2VHcm91cChjbG9zZVBvcywgY2xvc2VLaW5kKSB7XG5cdGxldCBqdXN0Q2xvc2VkID0gY3VyR3JvdXBcblx0ZHJvcEdyb3VwKClcblx0anVzdENsb3NlZC5sb2MuZW5kID0gY2xvc2VQb3Ncblx0c3dpdGNoIChjbG9zZUtpbmQpIHtcblx0XHRjYXNlIEdyb3Vwcy5TcGFjZToge1xuXHRcdFx0Y29uc3Qgc2l6ZSA9IGp1c3RDbG9zZWQuc3ViVG9rZW5zLmxlbmd0aFxuXHRcdFx0aWYgKHNpemUgIT09IDApXG5cdFx0XHRcdC8vIFNwYWNlZCBzaG91bGQgYWx3YXlzIGhhdmUgYXQgbGVhc3QgdHdvIGVsZW1lbnRzLlxuXHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChzaXplID09PSAxID8ganVzdENsb3NlZC5zdWJUb2tlbnNbMF0gOiBqdXN0Q2xvc2VkKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHR3YXJuKGp1c3RDbG9zZWQubG9jLCAnVW5uZWNlc3Nhcnkgc3BhY2UuJylcblx0XHRcdGJyZWFrXG5cdFx0fVxuXHRcdGNhc2UgR3JvdXBzLkxpbmU6XG5cdFx0XHQvLyBMaW5lIG11c3QgaGF2ZSBjb250ZW50LlxuXHRcdFx0Ly8gVGhpcyBjYW4gaGFwcGVuIGlmIHRoZXJlIHdhcyBqdXN0IGEgY29tbWVudC5cblx0XHRcdGlmICghaXNFbXB0eShqdXN0Q2xvc2VkLnN1YlRva2VucykpXG5cdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKGp1c3RDbG9zZWQpXG5cdFx0XHRicmVha1xuXHRcdGNhc2UgR3JvdXBzLkJsb2NrOlxuXHRcdFx0Y2hlY2soIWlzRW1wdHkoanVzdENsb3NlZC5zdWJUb2tlbnMpLCBjbG9zZVBvcywgJ0VtcHR5IGJsb2NrLicpXG5cdFx0XHRhZGRUb0N1cnJlbnRHcm91cChqdXN0Q2xvc2VkKVxuXHRcdFx0YnJlYWtcblx0XHRkZWZhdWx0OlxuXHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoanVzdENsb3NlZClcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xvc2VTcGFjZU9LSWZFbXB0eShwb3MpIHtcblx0YXNzZXJ0KGN1ckdyb3VwLmtpbmQgPT09IEdyb3Vwcy5TcGFjZSlcblx0aWYgKGN1ckdyb3VwLnN1YlRva2Vucy5sZW5ndGggPT09IDApXG5cdFx0ZHJvcEdyb3VwKClcblx0ZWxzZVxuXHRcdF9jbG9zZUdyb3VwKHBvcywgR3JvdXBzLlNwYWNlKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3BlblBhcmVudGhlc2lzKGxvYykge1xuXHRvcGVuR3JvdXAobG9jLnN0YXJ0LCBHcm91cHMuUGFyZW50aGVzaXMpXG5cdG9wZW5Hcm91cChsb2MuZW5kLCBHcm91cHMuU3BhY2UpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9zZVBhcmVudGhlc2lzKGxvYykge1xuXHRfY2xvc2VHcm91cChsb2Muc3RhcnQsIEdyb3Vwcy5TcGFjZSlcblx0Y2xvc2VHcm91cChsb2MuZW5kLCBHcm91cHMuUGFyZW50aGVzaXMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9zZUdyb3Vwc0ZvckRlZGVudChwb3MpIHtcblx0Y2xvc2VMaW5lKHBvcylcblx0Y2xvc2VHcm91cChwb3MsIEdyb3Vwcy5CbG9jaylcblx0Ly8gSXQncyBPSyB0byBiZSBtaXNzaW5nIGEgY2xvc2luZyBwYXJlbnRoZXNpcyBpZiB0aGVyZSdzIGEgYmxvY2suIEUuZy46XG5cdC8vIGEgKGJcblx0Ly9cdGMgfCBubyBjbG9zaW5nIHBhcmVuIGhlcmVcblx0d2hpbGUgKGN1ckdyb3VwLmtpbmQgPT09IEdyb3Vwcy5QYXJlbnRoZXNpcyB8fCBjdXJHcm91cC5raW5kID09PSBHcm91cHMuU3BhY2UpXG5cdFx0X2Nsb3NlR3JvdXAocG9zLCBjdXJHcm91cC5raW5kKVxufVxuXG4vLyBXaGVuIHN0YXJ0aW5nIGEgbmV3IGxpbmUsIGEgc3BhY2VkIGdyb3VwIGlzIGNyZWF0ZWQgaW1wbGljaXRseS5cbmV4cG9ydCBmdW5jdGlvbiBvcGVuTGluZShwb3MpIHtcblx0b3Blbkdyb3VwKHBvcywgR3JvdXBzLkxpbmUpXG5cdG9wZW5Hcm91cChwb3MsIEdyb3Vwcy5TcGFjZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb3NlTGluZShwb3MpIHtcblx0aWYgKGN1ckdyb3VwLmtpbmQgPT09IEdyb3Vwcy5TcGFjZSlcblx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KClcblx0Y2xvc2VHcm91cChwb3MsIEdyb3Vwcy5MaW5lKVxufVxuXG4vLyBXaGVuIGVuY291bnRlcmluZyBhIHNwYWNlLCBpdCBib3RoIGNsb3NlcyBhbmQgb3BlbnMgYSBzcGFjZWQgZ3JvdXAuXG5leHBvcnQgZnVuY3Rpb24gc3BhY2UobG9jKSB7XG5cdG1heWJlQ2xvc2VHcm91cChsb2Muc3RhcnQsIEdyb3Vwcy5TcGFjZSlcblx0b3Blbkdyb3VwKGxvYy5lbmQsIEdyb3Vwcy5TcGFjZSlcbn1cbiJdfQ==
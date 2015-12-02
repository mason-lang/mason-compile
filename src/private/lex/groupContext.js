import Loc, {StartPos} from 'esast/dist/Loc'
import {check, warn} from '../context'
import {Group, Groups, showGroupKind} from '../Token'
import {assert, isEmpty} from '../util'

let groupStack
export let curGroup

export function setupGroupContext() {
	curGroup = new Group(new Loc(StartPos, null), [], Groups.Block)
	groupStack = []
}

export function tearDownGroupContext(endPos) {
	closeLine(endPos)
	assert(isEmpty(groupStack))
	curGroup.loc.end = endPos
	const res = curGroup
	groupStack = curGroup = null
	return res
}

/*
We only ever write to the innermost Group;
when we close that Group we add it to the enclosing Group and continue with that one.
Note that `curGroup` is conceptually the top of the stack, but is not stored in `stack`.
*/

export function addToCurrentGroup(token) {
	curGroup.subTokens.push(token)
}

function dropGroup() {
	curGroup = groupStack.pop()
}

// Pause writing to curGroup in favor of writing to a sub-group.
// When the sub-group finishes we will pop the stack and resume writing to its parent.
export function openGroup(openPos, groupKind) {
	groupStack.push(curGroup)
	// Contents will be added to by `addToCurrentGroup`.
	// curGroup.loc.end will be written to when closing it.
	curGroup = new Group(new Loc(openPos, null), [], groupKind)
}

export function maybeCloseGroup(closePos, closeKind) {
	if (curGroup.kind === closeKind)
		closeGroupNoCheck(closePos, closeKind)
}

export function closeGroup(closePos, closeKind) {
	check(closeKind === curGroup.kind, closePos, () =>
		`Trying to close ${showGroupKind(closeKind)}, ` +
		`but last opened ${showGroupKind(curGroup.kind)}`)
	closeGroupNoCheck(closePos, closeKind)
}

function closeGroupNoCheck(closePos, closeKind) {
	const justClosed = curGroup
	dropGroup()
	justClosed.loc.end = closePos
	switch (closeKind) {
		case Groups.Space: {
			const size = justClosed.subTokens.length
			if (size === 0)
				warn(justClosed.loc, 'Unnecessary space.')
			else
				// Spaced should always have at least two elements.
				addToCurrentGroup(size === 1 ? justClosed.subTokens[0] : justClosed)
			break
		}
		case Groups.Line:
			// Line must have content.
			// This can happen if there was just a comment.
			if (!isEmpty(justClosed.subTokens))
				addToCurrentGroup(justClosed)
			break
		case Groups.Block:
			check(!isEmpty(justClosed.subTokens), closePos, 'Empty block.')
			addToCurrentGroup(justClosed)
			break
		default:
			addToCurrentGroup(justClosed)
	}
}

export function closeSpaceOKIfEmpty(pos) {
	assert(curGroup.kind === Groups.Space)
	if (curGroup.subTokens.length === 0)
		dropGroup()
	else
		closeGroupNoCheck(pos, Groups.Space)
}

export function openParenthesis(loc) {
	openGroup(loc.start, Groups.Parenthesis)
	openGroup(loc.end, Groups.Space)
}

export function openInterpolation(loc) {
	openGroup(loc.start, Groups.Interpolation)
	openGroup(loc.end, Groups.Space)
}

/**
Close a Groups.Interpolation or Groups.Parenthesis,
returning whether it was an interpolation.
*/
export function closeInterpolationOrParenthesis(loc) {
	closeGroupNoCheck(loc.start, Groups.Space)
	const kind = curGroup.kind
	closeGroup(loc.end, kind)
	return kind === Groups.Interpolation
}

export function closeGroupsForDedent(pos) {
	closeLine(pos)
	closeGroup(pos, Groups.Block)
	// It's OK to be missing a closing parenthesis if there's a block. E.g.:
	// a (b
	//	c | no closing paren here
	while (curGroup.kind === Groups.Parenthesis || curGroup.kind === Groups.Space)
		closeGroupNoCheck(pos, curGroup.kind)
}

// When starting a new line, a spaced group is created implicitly.
export function openLine(pos) {
	openGroup(pos, Groups.Line)
	openGroup(pos, Groups.Space)
}

export function closeLine(pos) {
	if (curGroup.kind === Groups.Space)
		closeSpaceOKIfEmpty()
	closeGroup(pos, Groups.Line)
}

// When encountering a space, it both closes and opens a spaced group.
export function space(loc) {
	maybeCloseGroup(loc.start, Groups.Space)
	openGroup(loc.end, Groups.Space)
}

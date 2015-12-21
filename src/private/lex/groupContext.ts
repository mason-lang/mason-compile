import Loc, {Pos} from 'esast/lib/Loc'
import {check, warn} from '../context'
import Token, {Group, GroupBlock, GroupInterpolation, GroupLine, GroupParenthesis, GroupSpace, GroupType} from '../Token'
import {assert, isEmpty} from '../util'

let groupStack: Array<Group<Token>>
export let curGroup: Group<Token>

export function setupGroupContext(): void {
	curGroup = new GroupBlock(new Loc(Pos.start, null), [])
	groupStack = []
}

export function tearDownGroupContext(endPos: Pos): Group<Token> {
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

export function addToCurrentGroup(token: Token): void {
	curGroup.subTokens.push(<any> token)
}

function dropGroup(): void {
	curGroup = groupStack.pop()
}

// Pause writing to curGroup in favor of writing to a sub-group.
// When the sub-group finishes we will pop the stack and resume writing to its parent.
export function openGroup(openPos: Pos, groupType: GroupType): void {
	groupStack.push(curGroup)
	// Contents will be added to by `addToCurrentGroup`.
	// curGroup.loc.end will be written to when closing it.
	curGroup = new groupType(new Loc(openPos, null), [])
}

export function maybeCloseGroup(closePos: Pos, closeType: GroupType): void {
	if (curGroup instanceof closeType)
		closeGroupNoCheck(closePos, closeType)
}

export function closeGroup(closePos: Pos, closeType: GroupType): void {
	check(curGroup instanceof closeType, closePos, _ => _.mismatchedGroupClose(closeType, curGroup))
	closeGroupNoCheck(closePos, closeType)
}

function closeGroupNoCheck(closePos: Pos, closeType: GroupType): void {
	const justClosed = curGroup
	dropGroup()
	justClosed.loc.end = closePos
	switch (closeType) {
		case GroupSpace: {
			const size = justClosed.subTokens.length
			if (size === 0)
				warn(justClosed.loc, _ => _.extraSpace)
			else
				// Spaced should always have at least two elements.
				addToCurrentGroup(size === 1 ? justClosed.subTokens[0] : justClosed)
			break
		}
		case GroupLine:
			// Line must have content.
			// This can happen if there was just a comment.
			if (!isEmpty(justClosed.subTokens))
				addToCurrentGroup(justClosed)
			break
		case GroupBlock:
			check(!isEmpty(justClosed.subTokens), closePos, _ => _.emptyBlock)
			addToCurrentGroup(justClosed)
			break
		default:
			addToCurrentGroup(justClosed)
	}
}

export function closeSpaceOKIfEmpty(pos: Pos): void {
	assert(curGroup instanceof GroupSpace)
	if (curGroup.subTokens.length === 0)
		dropGroup()
	else
		closeGroupNoCheck(pos, GroupSpace)
}

export function openParenthesis(loc: Loc): void {
	openGroup(loc.start, GroupParenthesis)
	openGroup(loc.end, GroupSpace)
}

export function openInterpolation(loc: Loc): void {
	openGroup(loc.start, GroupInterpolation)
	openGroup(loc.end, GroupSpace)
}

/**
Close a Groups.Interpolation or Groups.Parenthesis,
returning whether it was an interpolation.
*/
export function closeInterpolationOrParenthesis(loc: Loc): boolean {
	closeGroupNoCheck(loc.start, GroupSpace)
	const group = curGroup
	closeGroup(loc.end, group.type)
	return group instanceof GroupInterpolation
}

export function closeGroupsForDedent(pos: Pos): void {
	closeLine(pos)
	closeGroup(pos, GroupBlock)
	// It's OK to be missing a closing parenthesis if there's a block. E.g.:
	// a (b
	//	c | no closing paren here
	while (curGroup instanceof GroupParenthesis || curGroup instanceof GroupSpace)
		closeGroupNoCheck(pos, curGroup.type)
}

// When starting a new line, a spaced group is created implicitly.
export function openLine(pos: Pos): void {
	openGroup(pos, GroupLine)
	openGroup(pos, GroupSpace)
}

export function closeLine(pos: Pos): void {
	if (curGroup instanceof GroupSpace)
		closeSpaceOKIfEmpty(pos)
	closeGroup(pos, GroupLine)
}

// When encountering a space, it both closes and opens a spaced group.
export function space(loc: Loc): void {
	maybeCloseGroup(loc.start, GroupSpace)
	openGroup(loc.end, GroupSpace)
}

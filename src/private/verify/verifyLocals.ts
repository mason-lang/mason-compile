import Loc from 'esast/lib/Loc'
import {opEach, orThrow} from 'op/Op'
import CompileError from '../../CompileError'
import {Assign, AssignDestructure, AssignSingle, LocalAccess, LocalDeclare, LocalMutate
	} from '../ast/locals'
import MsAst from '../ast/MsAst'
import {isNamed} from '../ast/Named'
import {SpecialVal} from '../ast/Val'
import {check, fail, compileOptions, warn} from '../context'
import {isEmpty} from '../util'
import {locals, okToNotUse, results, pendingBlockLocals, setPendingBlockLocals, withName
	} from './context'
import {setName} from './util'
import verifyVal from './verifyVal'

// Adding LocalDeclares to the available locals is done by Fun or lineNewLocals.
export function verifyLocalDeclare({loc, name, opType}: LocalDeclare): void {
	opEach(compileOptions.opBuiltinPath(name), path => {
		warn(loc, _ => _.overriddenBuiltin(name, path))
	})
	opEach(opType, verifyVal)
}

export function verifyLocalAccess(_: LocalAccess): void {
		const {loc, name} = _
		const declare = locals.get(name)
		if (declare === undefined) {
			const builtinPath = orThrow(
				compileOptions.opBuiltinPath(name),
				() => missingLocalFail(loc, name))
			results.accessBuiltin(name, builtinPath)
		} else {
			results.localAccessToDeclare.set(_, declare)
			setDeclareAccessed(declare, _)
		}
}

export function verifyAssign(_: Assign): void {
	if (_ instanceof AssignSingle) {
		const {assignee, value} = _
		withName(assignee.name, () => {
			const doV = () => {
				/*
				Most Named values only get a name if they are immediately after the assignment.
				In `x = |` the function is named "x".
				In `x = $after-time 1000 |` the function is not named.
				SpecialVal.name unconditionally gets a name. See its handler in `verifyVal`.
				*/
				if (isNamed(value) && !(value instanceof SpecialVal))
					setName(value)

				// Assignee registered by verifyLines.
				verifyLocalDeclare(assignee)
				verifyVal(value)
			}
			if (assignee.isLazy)
				withBlockLocals(doV)
			else
				doV()
		})

	} else if (_ instanceof AssignDestructure) {
		const {assignees, value} = _
		// Assignees registered by verifyLines.
		for (const _ of assignees)
			verifyLocalDeclare(_)
		verifyVal(value)

	} else
		throw new Error(_.constructor.name)
}

export function deleteLocal(localDeclare: LocalDeclare): void {
	locals.delete(localDeclare.name)
}

export function setLocal(localDeclare: LocalDeclare): void {
	locals.set(localDeclare.name, localDeclare)
}

export function accessLocal(access: MsAst, name: string): void {
	const declare = getLocalDeclare(name, access.loc)
	setDeclareAccessed(declare, access)
}

export function setDeclareAccessed(declare: LocalDeclare, access: MsAst): void {
	results.localDeclareToAccesses.get(declare).push(access)
}

export function registerLocal(localDeclare: LocalDeclare): void {
	results.localDeclareToAccesses.set(localDeclare, [])
}

export function registerAndPlusLocal(localDeclare: LocalDeclare, action: () => void): void {
	registerLocal(localDeclare)
	plusLocal(localDeclare, action)
}

function plusLocal(addedLocal: LocalDeclare, action: () => void): void {
	const shadowed = locals.get(addedLocal.name)
	locals.set(addedLocal.name, addedLocal)
	action()
	if (shadowed === undefined)
		deleteLocal(addedLocal)
	else
		setLocal(shadowed)
}

// Should have verified that addedLocals all have different names.
export function plusLocals(addedLocals: Array<LocalDeclare>, action: () => void): void {
	const shadowedLocals: Array<LocalDeclare> = []
	for (const _ of addedLocals) {
		const shadowed = locals.get(_.name)
		if (shadowed !== undefined)
			shadowedLocals.push(shadowed)
		setLocal(_)
	}

	action()

	addedLocals.forEach(deleteLocal)
	shadowedLocals.forEach(setLocal)
}

export function verifyAndPlusLocal(addedLocal: LocalDeclare, action: () => void): void {
	registerAndVerifyLocalDeclare(addedLocal)
	plusLocal(addedLocal, action)
}

export function verifyAndPlusLocals(addedLocals: Array<LocalDeclare>, action: () => void): void {
	addedLocals.forEach(registerAndVerifyLocalDeclare)
	const names = new Set()
	for (const {name, loc} of addedLocals) {
		check(!names.has(name), loc, _ => _.duplicateLocal(name))
		names.add(name)
	}
	plusLocals(addedLocals, action)
}

export function withBlockLocals(action: () => void): void {
	const oldPendingBlockLocals = pendingBlockLocals
	setPendingBlockLocals([])
	plusLocals(oldPendingBlockLocals, action)
	setPendingBlockLocals(oldPendingBlockLocals)
}

export function warnUnusedLocals(): void {
	for (const [local, accesses] of results.localDeclareToAccesses)
		if (isEmpty(accesses) && local.name !== 'built' && !okToNotUse.has(local))
			warn(local.loc, _ => _.unusedLocal(local.name))
}

export function addImportedLocal(ld: LocalDeclare): void {
	const prev = locals.get(ld.name)
	check(prev === undefined, ld.loc, _ => _.duplicateImport(ld.name, prev.loc))
	registerAndVerifyLocalDeclare(ld)
	setLocal(ld)
}

function registerAndVerifyLocalDeclare(_: LocalDeclare): void {
	registerLocal(_)
	verifyLocalDeclare(_)
}

function getLocalDeclare(name: string, accessLoc: Loc): LocalDeclare {
	const declare = locals.get(name)
	if (declare === undefined)
		throw missingLocalFail(accessLoc, name)
	return declare
}

function missingLocalFail(loc: Loc, name: string): CompileError {
	return fail(loc, _ => _.missingLocal(name))
}

export function verifyLocalMutate({value}: LocalMutate): void {
	verifyVal(value)
}

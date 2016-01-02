import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import CompileError from '../../CompileError'
import {check, fail, warn} from '../context'
import MsAst, {LocalAccess, LocalDeclare} from '../MsAst'
import {isEmpty} from '../util'
import {locals, okToNotUse, results, pendingBlockLocals, setPendingBlockLocals} from './context'
import {verifyLocalDeclare} from './verifyLocalDeclare'

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

export function plusLocal(addedLocal: LocalDeclare, action: () => void): void {
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
	verifyLocalDeclare(addedLocal)
	plusLocal(addedLocal, action)
}

export function verifyAndPlusLocals(addedLocals: Array<LocalDeclare>, action: () => void): void {
	addedLocals.forEach(verifyLocalDeclare)
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

function getLocalDeclare(name: string, accessLoc: Loc): LocalDeclare {
	const declare = locals.get(name)
	if (declare === undefined)
		throw missingLocalFail(accessLoc, name)
	return declare
}

export function missingLocalFail(loc: Loc, name: string): CompileError {
	return fail(loc, _ => _.missingLocal(name))
}

export function warnUnusedLocals(): void {
	for (const [local, accesses] of results.localDeclareToAccesses)
		if (isEmpty(accesses) && local.name !== 'built' && !okToNotUse.has(local))
			warn(local.loc, _ => _.unusedLocal(local.name))
}

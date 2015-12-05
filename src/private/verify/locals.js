import {check, fail, warn} from '../context'
import {isEmpty} from '../util'
import {locals, okToNotUse, results, pendingBlockLocals, setPendingBlockLocals} from './context'

export function deleteLocal(localDeclare) {
	locals.delete(localDeclare.name)
}

export function setLocal(localDeclare) {
	locals.set(localDeclare.name, localDeclare)
}

export function accessLocal(access, name) {
	const declare = getLocalDeclare(name, access.loc)
	setDeclareAccessed(declare, access)
}

export function setDeclareAccessed(declare, access) {
	results.localDeclareToAccesses.get(declare).push(access)
}

// For expressions affecting lineNewLocals, they will be registered before being verified.
// So, LocalDeclare.verify just the type.
// For locals not affecting lineNewLocals, use this instead of just declare.verify()
export function verifyLocalDeclare(localDeclare) {
	registerLocal(localDeclare)
	localDeclare.verify()
}

export function registerLocal(localDeclare) {
	results.localDeclareToAccesses.set(localDeclare, [])
}

export function registerAndPlusLocal(localDeclare, action) {
	registerLocal(localDeclare)
	plusLocal(localDeclare, action)
}

export function plusLocal(addedLocal, action) {
	const shadowed = locals.get(addedLocal.name)
	locals.set(addedLocal.name, addedLocal)
	action()
	if (shadowed === undefined)
		deleteLocal(addedLocal)
	else
		setLocal(shadowed)
}

// Should have verified that addedLocals all have different names.
export function plusLocals(addedLocals, action) {
	const shadowedLocals = []
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

export function verifyAndPlusLocal(addedLocal, action) {
	verifyLocalDeclare(addedLocal)
	plusLocal(addedLocal, action)
}

export function verifyAndPlusLocals(addedLocals, action) {
	addedLocals.forEach(verifyLocalDeclare)
	const names = new Set()
	for (const _ of addedLocals) {
		check(!names.has(_.name), _.loc, 'duplicateLocal', _.name)
		names.add(_.name)
	}
	plusLocals(addedLocals, action)
}

export function withBlockLocals(action) {
	const oldPendingBlockLocals = pendingBlockLocals
	setPendingBlockLocals([])
	plusLocals(oldPendingBlockLocals, action)
	setPendingBlockLocals(oldPendingBlockLocals)
}

function getLocalDeclare(name, accessLoc) {
	const declare = locals.get(name)
	if (declare === undefined)
		failMissingLocal(accessLoc, name)
	return declare
}

export function failMissingLocal(loc, name) {
	fail(loc, 'missingLocal', name)
}

export function warnUnusedLocals() {
	for (const [local, accesses] of results.localDeclareToAccesses)
		if (isEmpty(accesses) && local.name !== 'built' && !okToNotUse.has(local))
			warn(local.loc, 'unusedLocal', local.name)
}

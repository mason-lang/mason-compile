import tupl from 'tupl/dist//tupl'
import { LocalAccess } from '../MsAst'
import { isEmpty } from './util'

export default class VerifyResults {
	constructor() {
		// LocalAccess -> LocalDeclare.
		// Needed because lazy accesses must be compiled differently.
		this.localAccessToDeclare = new Map()
		// LocalDeclare -> VrLocalInfo.
		// Debug locals will not be output if not in debug mode.
		this.localDeclareToInfo = new Map()
		// TODO:ES6 Can use do `export { a, b, ... }` at the end, so shouldn't need this.
		// Includes both Assigns and AssignDestructures.
		this.exportAssigns = new Set()
	}

	isDebugLocal(localDeclare) {
		return this.localDeclareToInfo.get(localDeclare).isInDebug
	}

	isAccessed(localDeclare) {
		const info = this.localDeclareToInfo.get(localDeclare)
		return !(isEmpty(info.debugAccesses) && isEmpty(info.nonDebugAccesses))
	}

	isExportAssign(assign) {
		return this.exportAssigns.has(assign)
	}

	localDeclareForAccess(localAccess) {
		return this.localAccessToDeclare.get(localAccess)
	}
}

export const LocalInfo = tupl('VrLocalInfo', Object, 'TODO:doc',
	[ 'isInDebug', Boolean, 'debugAccesses', [LocalAccess], 'nonDebugAccesses', [LocalAccess] ],
	{ },
	{
		empty: isInDebug => LocalInfo(isInDebug, [ ], [ ])
	})

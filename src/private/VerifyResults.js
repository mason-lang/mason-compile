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

export class LocalInfo {
	static empty(isInDebug) {
		return new LocalInfo(isInDebug, [ ], [ ])
	}

	constructor(
		isInDebug /* Boolean */,
		debugAccesses /* LocalAccess */,
		nonDebugAccesses /* Array[LocalAccess] */) {
		this.isInDebug = isInDebug
		this.debugAccesses = debugAccesses
		this.nonDebugAccesses = nonDebugAccesses
	}
}

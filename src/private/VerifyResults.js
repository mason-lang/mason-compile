import {check} from './context'

/**
Results of {@link verify}.
This is only the data needed by {@link transpile}.
*/
export default class VerifyResults {
	constructor() {
		/**
		LocalAccess -> LocalDeclare.
		Needed because lazy accesses must be compiled differently.
		*/
		this.localAccessToDeclare = new Map()
		/**
		LocalDeclare -> Array[LocalAccess].
		Debug locals will not be output if not in debug mode.
		*/
		this.localDeclareToAccesses = new Map()
		/**
		Maps Class/Fun to name if one is appropriate.
		Maps *every* {@link SpecialVals.Name} to the nearest name.
		*/
		this.names = new Map()
		/**
		String -> Set.
		For each path, the names of each builtin imported.
		Like the inverse of context.opts.builtinNameToPath,
		but only includes names actually used.
		*/
		this.builtinPathToNames = new Map()
		/** Values are either MethodImpl or the string 'constructor' */
		this.superCallToMethod = new Map()
		/** Links a constructor to its super! call. */
		this.constructorToSuper = new Map()
		/** Stores verified block kind (see verifyBlock.js) */
		this.blockToKind = new Map()
		/**
		Set of MsAsts that have been marked as being statements.
		Those which are always statements (like Throw) are not marked.
		Use a set of statements because there are usually many more vals than statements.
		*/
		this.statements = new Set()
		/** ObjEntry_s that are module exports */
		this.objEntryExports = new Set()
		/** @type {Modules} */
		this.moduleKind = null
		/** Set of {@link Loop}s with at least one {@link Break} in a {@link Switch}. */
		this.loopsNeedingLabel = new Set()
		/** Set of {@link Break}s that are inside {@link Switch}es. */
		this.breaksInSwitch = new Set()
	}

	/** Gets the LocalDeclare that was verified to be the one accessed. */
	localDeclareForAccess(localAccess) {
		return this.localAccessToDeclare.get(localAccess)
	}

	/** Get closest assignment name to an expression. */
	name(expr) {
		const name = this.names.get(expr)
		check(name !== undefined, expr.loc,
			'Expression must be placed in a position where name can be determined.')
		return name
	}

	/**
	Get closest assignment name to an expression,
	or `null` if none is available.
	*/
	opName(expr) {
		const x = this.names.get(expr)
		return x === undefined ? null : x
	}

	/** Certain expressions (such as `if`) are marked if they are statements. */
	isStatement(expr) {
		return this.statements.has(expr)
	}

	/** What kind of block the verifier determined this to be. */
	blockKind(block) {
		return this.blockToKind.get(block)
	}

	/** Whether an ObjEntry is a module export. */
	isObjEntryExport(objEntry) {
		return this.objEntryExports.has(objEntry)
	}

	constructorHasSuper(ctr) {
		return this.constructorToSuper.has(ctr)
	}

	/** Whether some `break` in this loop is in a `switch`. */
	loopNeedsLabel(loop) {
		return this.loopsNeedingLabel.has(loop)
	}

	/** Returns whether there is a `switch` in between this `break` and its loop. */
	isBreakInSwitch(breakAst) {
		return this.breaksInSwitch.has(breakAst)
	}
}

/** Kinds of {@link Block}. */
export const Blocks = {
	Do: 0,
	Throw: 1,
	Return: 2,
	Bag: 3,
	Map: 4,
	Obj: 5
}

/** Kinds of {@link Module}. */
export const Modules = {
	Do: 0,
	Val: 1,
	Exports: 2,
	Bag: 3,
	Map: 4
}

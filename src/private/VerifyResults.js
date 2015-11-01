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
	}

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
}

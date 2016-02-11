import Op, {caseOp} from 'op/Op'
import {fail} from './context'
import Block from './ast/Block'
import {ObjEntry} from './ast/BuildEntry'
import {Constructor, SuperCall} from './ast/Class'
import {MethodImplLike} from './ast/classTraitCommon'
import {LocalAccess, LocalDeclare} from './ast/locals'
import Loop, {Break} from './ast/Loop'
import Named from './ast/Named'
import MsAst from './ast/MsAst'

/**
Results of [[verify]].
Provides additional data needed by [[transpile]].
*/
export default class VerifyResults {
	/**
	LocalAccess -> LocalDeclare.
	Needed because lazy accesses must be compiled differently.
	*/
	localAccessToDeclare: Map<LocalAccess, LocalDeclare>
	/**
	LocalDeclare -> Array[LocalAccess].
	Debug locals will not be output if not in debug mode.
	*/
	localDeclareToAccesses: Map<LocalDeclare, Array<MsAst>>
	/**
	Maps named expression to name if one is appropriate.
	Maps *every* [[SpecialVals.Name]] to the nearest name.
	*/
	names: Map<Named, string>
	/**
	For each path, the names of each builtin imported.
	Like the inverse of context.opts.builtinNameToPath,
	but only includes names actually used.
	*/
	builtinPathToNames: Map<string, Set<string>>
	/** Values are either MethodImpl or the string 'constructor' */
	superCallToMethod: Map<SuperCall, Constructor | MethodImplLike>
	/** Links a constructor to its super! call. */
	constructorToSuper: Map<Constructor, SuperCall>
	/** Stores verified block kind (see verifyBlock.js) */
	blockToKind: Map<Block, Blocks>
	/** ObjEntry_s that are module exports */
	objEntryExports: Set<ObjEntry>
	moduleKind: Modules
	/** Set of [[Loop]]s with at least one [[Break]] in a [[Switch]]. */
	loopsNeedingLabel: Set<Loop>
	/** Set of [[Break]] that are inside [[Switch]]es. */
	breaksInSwitch: Set<Break>

	constructor() {
		this.localAccessToDeclare = new Map()
		this.localDeclareToAccesses = new Map()
		this.names = new Map()
		this.builtinPathToNames = new Map()
		this.superCallToMethod = new Map()
		this.constructorToSuper = new Map()
		this.blockToKind = new Map()
		this.objEntryExports = new Set()
		this.moduleKind = null
		this.loopsNeedingLabel = new Set()
		this.breaksInSwitch = new Set()
	}

	/** Gets the LocalDeclare that was verified to be the one accessed. */
	localDeclareForAccess(localAccess: LocalAccess): LocalDeclare {
		return this.localAccessToDeclare.get(localAccess)
	}

	/** Get closest assignment name to an expression. */
	name(expr: Named): string {
		const name = this.names.get(expr)
		if (name === undefined)
			throw fail(expr.loc, _ => _.cantDetermineName)
		return name
	}

	/**
	Get closest assignment name to an expression,
	or `null` if none is available.
	*/
	opName(expr: Named): Op<string> {
		const x = this.names.get(expr)
		return x === undefined ? null : x
	}

	/** What kind of block the verifier determined this to be. */
	blockKind(block: Block): Blocks {
		return this.blockToKind.get(block)
	}

	/** Whether an ObjEntry is a module export. */
	isObjEntryExport(objEntry: ObjEntry): boolean {
		return this.objEntryExports.has(objEntry)
	}

	/** Whether a given constructor has a `super` call anywhere inside of it. */
	constructorHasSuper(ctr: Constructor): boolean {
		return this.constructorToSuper.has(ctr)
	}

	/** Whether some `break` in this loop is in a `switch`. */
	loopNeedsLabel(loop: Loop): boolean {
		return this.loopsNeedingLabel.has(loop)
	}

	/** Returns whether there is a `switch` in between this `break` and its loop. */
	isBreakInSwitch(breakAst: Break): boolean {
		return this.breaksInSwitch.has(breakAst)
	}

	/**
	Called during [[verify]] a builtin has to be accessed.
	This is used to remember that it needs to be imported during [[transpileModule]].
	*/
	accessBuiltin(name: string, path: string): void {
		// Use `builtinPathToNames` as a multi-map.
		caseOp(
			this.builtinPathToNames.get(path),
			_ => {
				_.add(name)
			},
			() => {
				this.builtinPathToNames.set(path, new Set([name]))
			})
	}
}

/** Kinds of [[Block]]. */
export const enum Blocks { Do, Throw, Return, Bag, Map, Obj }

/** Kinds of [[Module]]. */
export const enum Modules { Do, Val, Exports, Bag, Map }

import Loc from 'esast/lib/Loc'
import {caseOp, opEach} from 'op/Op'
import {check, pathOptions} from '../context'
import {ObjEntry} from '../ast/Block'
import LineContent from '../ast/LineContent'
import {LocalDeclare} from '../ast/locals'
import Module, {Import} from '../ast/Module'
import {isEmpty, last, rtail} from '../util'
import {Blocks, Modules} from '../VerifyResults'
import {opBlockBuildKind} from './autoBlockKind'
import {locals, results, withName} from './context'
import {plusLocals, setLocal} from './locals'
import SK, {getLineSK} from './SK'
import verifyLines, {verifyBuiltLines} from './verifyLines'
import {verifyLocalDeclare} from './verifyLocalDeclare'
import {ensureValAndVerify} from './verifyVal'

export default function verifyModule({imports, lines, loc}: Module): void {
	// No need to verify this.doImports.
	for (const _ of imports)
		verifyImport(_)
	withName(pathOptions.moduleName, () => {
		verifyModuleLines(lines, loc)
	})
}

function verifyImport({imported, opImportDefault}: Import): void {
	// Since Uses are always in the outermost scope, don't have to worry about shadowing.
	// So we mutate `locals` directly.
	function addUseLocal(ld: LocalDeclare): void {
		const prev = locals.get(ld.name)
		check(prev === undefined, ld.loc, _ => _.duplicateImport(ld.name, prev.loc))
		verifyLocalDeclare(ld)
		setLocal(ld)
	}
	for (const _ of imported)
		addUseLocal(_)
	opEach(opImportDefault, addUseLocal)
}

function verifyModuleLines(lines: Array<LineContent>, loc: Loc): void {
	results.moduleKind = caseOp(opBlockBuildKind(lines, loc),
		buildKind => {
			if (buildKind === Blocks.Obj) {
				for (const line of lines)
					if (line instanceof ObjEntry)
						results.objEntryExports.add(line)
				verifyLines(lines)
				return Modules.Exports
			} else {
				verifyBuiltLines(lines, loc)
				return buildKind === Blocks.Bag ? Modules.Bag : Modules.Map
			}
		},
		() => {
			if (isEmpty(lines))
				return Modules.Do
			else {
				const l = last(lines)
				const lastSK = getLineSK(l)
				if (lastSK === SK.Do) {
					verifyLines(lines)
					return Modules.Do
				} else {
					const newLocals = verifyLines(rtail(lines))
					plusLocals(newLocals, () => ensureValAndVerify(l))
					return Modules.Val
				}
			}
		})
}

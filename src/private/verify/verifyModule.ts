import Loc from 'esast/lib/Loc'
import {caseOp, opEach} from 'op/Op'
import {pathOptions} from '../context'
import {ObjEntry} from '../ast/BuildEntry'
import LineContent from '../ast/LineContent'
import Module, {Import} from '../ast/Module'
import {isEmpty, last, rtail} from '../util'
import {Blocks, Modules} from '../VerifyResults'
import {opBlockBuildKind} from './autoBlockKind'
import {results, withName} from './context'
import SK, {getLineSK} from './SK'
import verifyLines, {verifyBuiltLines} from './verifyLines'
import {addImportedLocal, plusLocals} from './verifyLocals'
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
	for (const _ of imported)
		addImportedLocal(_)
	opEach(opImportDefault, addImportedLocal)
}

function verifyModuleLines(lines: Array<LineContent>, loc: Loc): void {
	results.moduleKind = caseOp(
		opBlockBuildKind(lines, loc),
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

import {opEach} from 'op/Op'
import {check, pathOptions} from '../context'
import {Import, LocalDeclare, Module} from '../MsAst'
import {locals, withName} from './context'
import {setLocal} from './locals'
//todo: just do that here?
import {verifyModuleLines} from './verifyBlock'
import {verifyLocalDeclare} from './verifyLocalDeclare'

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
	function addUseLocal(ld: LocalDeclare) {
		const prev = locals.get(ld.name)
		check(prev === undefined, ld.loc, _ => _.duplicateImport(ld.name, prev.loc))
		verifyLocalDeclare(ld)
		setLocal(ld)
	}
	for (const _ of imported)
		addUseLocal(_)
	opEach(opImportDefault, addUseLocal)
}

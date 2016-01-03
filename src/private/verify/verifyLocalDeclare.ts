import {opEach} from 'op/Op'
import {LocalDeclare} from '../ast/locals'
import {options, warn} from '../context'
import {registerLocal} from './locals'
import verifyVal from './verifyVal'

//maybe move this whole file to locals.ts

// For expressions affecting lineNewLocals, they will be registered before being verified.
// So, LocalDeclare.verify just the type.
// For locals not affecting lineNewLocals, use this instead of just declare.verify()
export function verifyLocalDeclare(_: LocalDeclare): void {
	registerLocal(_)
	justVerifyLocalDeclare(_)
}

// Adding LocalDeclares to the available locals is done by Fun or lineNewLocals.
//todo: silly name...
export function justVerifyLocalDeclare({loc, name, opType}: LocalDeclare): void {
	opEach(options.opBuiltinPath(name), path => {
		warn(loc, _ => _.overriddenBuiltin(name, path))
	})
	opEach(opType, verifyVal)
}

import Module from '../ast/Module'
import VerifyResults from '../VerifyResults'
import {results, setup, tearDown} from './context'
import {warnUnusedLocals} from './verifyLocals'
import verifyModule from './verifyModule'

/**
Generates information needed during transpiling, the VerifyResults.
Also checks for existence of local variables and warns for unused locals.
*/
export default function verify(module: Module): VerifyResults {
	setup()
	verifyModule(module)
	warnUnusedLocals()
	const res = results
	tearDown()
	return res
}

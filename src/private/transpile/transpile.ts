import {Module as EsModule} from 'esast/lib/Program'
import Module from '../ast/Module'
import VerifyResults from '../VerifyResults'
import {setup, tearDown, verifyResults} from './context'
import transpileModule from './transpileModule'

/** Transform a [[MsAst]] into an esast. **/
export default function transpile(moduleExpression: Module, verifyResults: VerifyResults): EsModule {
	setup(verifyResults)
	const res = transpileModule(moduleExpression)
	tearDown()
	return res
}

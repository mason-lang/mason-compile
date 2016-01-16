import {Module as EsModule} from 'esast/lib/Program'
import Module from '../ast/Module'
import VerifyResults from '../VerifyResults'
import {setup, tearDown} from './context'
import transpileModule from './transpileModule'

/** Transform a [[MsAst]] into an esast. **/
export default function transpile(moduleExpression: Module, verifyRes: VerifyResults): EsModule {
	setup(verifyRes)
	const res = transpileModule(moduleExpression)
	tearDown()
	return res
}

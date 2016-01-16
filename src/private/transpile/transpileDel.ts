import Expression from 'esast/lib/Expression'
import Del from '../ast/Del'
import {msCall} from './ms'
import transpileVal from './transpileVal'

export function transpileDelNoLoc({subbed, args}: Del): Expression {
	return msCall('del', transpileVal(subbed), ...args.map(transpileVal))
}

import Del from '../ast/Del'
import verifyVal, {verifyEachVal} from './verifyVal'

export default function verifyDel({subbed, args}: Del): void {
	verifyVal(subbed)
	verifyEachVal(args)
}

import Call, {New, Spread} from '../ast/Call'
import {Val} from '../ast/LineContent'
import verifyVal from './verifyVal'

export default function verifyCall({called, args}: Call): void {
	verifyVal(called)
	verifyEachValOrSpread(args)
}

export function verifyNew({type, args}: New): void {
	verifyVal(type)
	verifyEachValOrSpread(args)
}

export function verifyEachValOrSpread(asts: Array<Val | Spread>): void {
	for (const _ of asts)
		if (_ instanceof Spread)
			verifySpread(_)
		else
			verifyVal(_)
}

function verifySpread({spreaded}: Spread): void {
	verifyVal(spreaded)
}

import {check} from '../context'
import {BagEntry, MapEntry, ObjEntry, Throw} from '../MsAst'
import {isEmpty, last, opOr} from '../util'
import {Blocks} from '../VerifyResults'

export default function autoBlockKind(lines, loc) {
	return opOr(opBlockBuildKind(lines, loc), () =>
		!isEmpty(lines) && last(lines) instanceof Throw ? Blocks.Throw : Blocks.Return)
}

export function opBlockBuildKind(lines, loc) {
	let isBag = false, isMap = false, isObj = false
	for (const line of lines)
		if (line instanceof BagEntry)
			isBag = true
		else if (line instanceof MapEntry)
			isMap = true
		else if (line instanceof ObjEntry)
			isObj = true

	check(!(isBag && isMap) && !(isMap && isObj) && !(isBag && isObj), loc,
		'Block has mixed bag/map/obj entries — can not infer type.')

	return isBag ? Blocks.Bag : isMap ? Blocks.Map : isObj ? Blocks.Obj : null
}

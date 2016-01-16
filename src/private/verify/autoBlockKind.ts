import Loc from 'esast/lib/Loc'
import Op, {orDefault} from 'op/Op'
import {Throw} from '../ast/errors'
import {BagEntry, MapEntry, ObjEntry} from '../ast/BuildEntry'
import LineContent from '../ast/LineContent'
import {check} from '../context'
import {isEmpty, last} from '../util'
import {Blocks} from '../VerifyResults'

export default function autoBlockKind(lines: Array<LineContent>, loc: Loc): Blocks {
	return orDefault(opBlockBuildKind(lines, loc), () =>
		!isEmpty(lines) && last(lines) instanceof Throw ? Blocks.Throw : Blocks.Return)
}

export function opBlockBuildKind(lines: Array<LineContent>, loc: Loc): Op<Blocks> {
	let isBag = false, isMap = false, isObj = false
	for (const line of lines)
		if (line instanceof BagEntry)
			isBag = true
		else if (line instanceof MapEntry)
			isMap = true
		else if (line instanceof ObjEntry)
			isObj = true

	check(!(isBag && isMap) && !(isMap && isObj) && !(isBag && isObj), loc, _ => _.cantInferBlockKind)

	return isBag ? Blocks.Bag : isMap ? Blocks.Map : isObj ? Blocks.Obj : null
}

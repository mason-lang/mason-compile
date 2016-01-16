import BuildEntry, {BagEntry, MapEntry, ObjEntryAssign, ObjEntryPlain} from '../ast/BuildEntry'
import {check} from '../context'
import {results} from './context'
import {accessLocal, setDeclareAccessed, verifyAssign} from './verifyLocals'
import verifyMemberName from './verifyMemberName'
import verifyVal from './verifyVal'

export default function verifyBuildEntry(_: BuildEntry): void {
	if (_ instanceof BagEntry) {
		accessLocal(_, 'built')
		verifyVal(_.value)

	} else if (_ instanceof MapEntry) {
		const {key, val} = _
		accessLocal(_, 'built')
		verifyVal(key)
		verifyVal(val)

	} else if (_ instanceof ObjEntryAssign) {
		const {assign} = _
		if (!results.isObjEntryExport(_))
			accessLocal(_, 'built')
		verifyAssign(assign)
		for (const assignee of assign.allAssignees())
			setDeclareAccessed(assignee, _)

	} else if (_ instanceof ObjEntryPlain) {
		const {loc, name, value} = _
		if (results.isObjEntryExport(_))
			check(typeof name === 'string', loc, _ => _.exportName)
		else {
			accessLocal(_, 'built')
			verifyMemberName(name)
		}
		verifyVal(value)

	} else
		throw new Error(_.constructor.name)
}

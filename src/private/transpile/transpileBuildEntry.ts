import {AssignmentExpression} from 'esast/lib/Expression'
import {LiteralString} from 'esast/lib/Literal'
import Statement, {ExpressionStatement} from 'esast/lib/Statement'
import {member} from 'esast-create-util/lib/util'
import BuildEntry, {BagEntry, MapEntry, ObjEntryAssign, ObjEntryPlain} from '../ast/BuildEntry'
import {AssignSingle} from '../ast/locals'
import {cat} from '../util'
import {verifyResults} from './context'
import {idBuilt} from './esast-constants'
import {msCall} from './ms'
import transpileDo from './transpileDo'
import {idForDeclareCached, transpileAssignSingleNoLoc} from './transpileLocals'
import {transpileMember} from './transpileMemberName'
import {exportNamedOrDefault} from './transpileModule'
import transpileVal from './transpileVal'

export function transpileBuildEntryNoLoc(_: BuildEntry): Statement | Array<Statement> {
	if (_ instanceof BagEntry) {
		const {isMany, value} = _
		return new ExpressionStatement(
			msCall(isMany ? 'addMany' : 'add', idBuilt, transpileVal(value)))

	} else if (_ instanceof MapEntry) {
		const {key, val} = _
		return new ExpressionStatement(
			msCall('setSub', idBuilt, transpileVal(key), transpileVal(val)))

	} else if (_ instanceof ObjEntryAssign) {
		const {assign} = _
		if (assign instanceof AssignSingle && !assign.assignee.isLazy) {
			const name = assign.assignee.name
			return transpileAssignSingleNoLoc(assign, val =>
				verifyResults.isObjEntryExport(_) ?
					exportNamedOrDefault(val, name) :
					new AssignmentExpression('=', member(idBuilt, name), val))
		} else {
			const assigns = assign.allAssignees().map(_ => new ExpressionStatement(
				msCall('setLazy', idBuilt, new LiteralString(_.name), idForDeclareCached(_))))
			return cat(transpileDo(assign), assigns)
		}

	} else if (_ instanceof ObjEntryPlain) {
		const {name, value} = _
		const val = transpileVal(value)
		return new ExpressionStatement(
			verifyResults.isObjEntryExport(_) ?
				// We've verified that for module export, name must be a string.
				exportNamedOrDefault(val, <string> name) :
				new AssignmentExpression('=', transpileMember(idBuilt, name), val))

	} else
		throw new Error(_.constructor.name)
}

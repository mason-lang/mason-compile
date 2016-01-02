import Loc from 'esast/lib/Loc'
import Op, {caseOp} from 'op/Op'
import {check} from '../context'
import {Block, LineContent, LocalDeclare, ObjEntry} from '../MsAst'
import {isEmpty, last, rtail} from '../util'
import {Blocks, Modules} from '../VerifyResults'
import autoBlockKind, {opBlockBuildKind} from './autoBlockKind'
import {results} from './context'
import {plusLocals, verifyAndPlusLocal} from './locals'
import SK, {getLineSK} from './SK'
import verifyLines from './verifyLines'
import verifySK from './verifySK'
import verifyVal, {verifyValP} from './verifyVal'

export function verifyBlockSK(_: Block, sk: SK) {
	if (sk === SK.Do)
		verifyBlockDo(_)
	else
		verifyBlockVal(_)
}

export function verifyBlockVal(_: Block) {
	const {lines, loc} = _
	check(!isEmpty(lines), loc, _ => _.blockNeedsContent)
	const kind = autoBlockKind(lines, loc)
	switch (kind) {
		case Blocks.Bag: case Blocks.Map: case Blocks.Obj:
			verifyBuiltLines(lines, loc)
			break
		case Blocks.Throw:
			verifyLines(lines)
			break
		case Blocks.Return:
			plusLocals(verifyLines(rtail(lines)), () => verifyValP(last(lines)))
			break
		default:
			throw new Error(String(kind))
	}
	results.blockToKind.set(_, kind)
}

export function verifyBlockDo(_: Block): Array<LocalDeclare> {
	results.blockToKind.set(_, Blocks.Do)
	return verifyLines(_.lines)
}

export function verifyModuleLines(lines: Array<LineContent>, loc: Loc): void {
	results.moduleKind = caseOp(opBlockBuildKind(lines, loc),
		buildKind => {
			if (buildKind === Blocks.Obj) {
				for (const line of lines)
					if (line instanceof ObjEntry)
						results.objEntryExports.add(line)
				verifyLines(lines)
				return Modules.Exports
			} else {
				verifyBuiltLines(lines, loc)
				return buildKind === Blocks.Bag ? Modules.Bag : Modules.Map
			}
		},
		() => {
			if (isEmpty(lines))
				return Modules.Do
			else {
				const l = last(lines)
				const lastSK = getLineSK(l)
				if (lastSK === SK.Do) {
					verifyLines(lines)
					return Modules.Do
				} else {
					const newLocals = verifyLines(rtail(lines))
					plusLocals(newLocals, () => verifyValP(l))
					return Modules.Val
				}
			}
		})
}

function verifyBuiltLines(lines: Array<LineContent>, loc: Loc): void {
	verifyAndPlusLocal(LocalDeclare.built(loc), () => {
		verifyLines(lines)
	})
}

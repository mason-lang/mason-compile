import {check} from '../context'
import {ObjEntry, LocalDeclare} from '../MsAst'
import {ifElse, isEmpty, last, rtail} from '../util'
import {Blocks, Modules} from '../VerifyResults'
import autoBlockKind, {opBlockBuildKind} from './autoBlockKind'
import {results} from './context'
import {plusLocals, verifyAndPlusLocal} from './locals'
import SK, {getSK} from './SK'
import verifyLines from './verifyLines'

export default function verifyBlock(sk) {
	if (sk === SK.Do)
		verifyDoBlock(this)
	else {
		check(!isEmpty(this.lines), 'blockNeedsContent')
		const kind = autoBlockKind(this.lines, this.loc)
		switch (kind) {
			case Blocks.Bag: case Blocks.Map: case Blocks.Obj:
				verifyBuiltLines(this.lines, this.loc)
				break
			case Blocks.Throw:
				verifyLines(this.lines)
				break
			case Blocks.Return:
				plusLocals(verifyLines(rtail(this.lines)), () => {
					last(this.lines).verify(SK.Val)
				})
				break
			default:
				throw new Error(kind)
		}
		results.blockToKind.set(this, kind)
	}
}

export function verifyDoBlock(_) {
	results.blockToKind.set(_, Blocks.Do)
	return verifyLines(_.lines)
}

export function verifyModuleLines(lines, loc) {
	results.moduleKind = ifElse(opBlockBuildKind(lines, loc),
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
				const lastSK = getSK(l)
				if (lastSK === SK.Do) {
					verifyLines(lines)
					return Modules.Do
				} else {
					const newLocals = verifyLines(rtail(lines))
					plusLocals(newLocals, () => {
						l.verify(lastSK)
					})
					return Modules.Val
				}
			}
		})
}

function verifyBuiltLines(lines, loc) {
	verifyAndPlusLocal(LocalDeclare.built(loc), () => {
		verifyLines(lines)
	})
}

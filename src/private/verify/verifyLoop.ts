import {caseOp, orThrow} from 'op/Op'
import {Funs} from '../ast/Fun'
import {Break, For, ForAsync, ForBag, Iteratee} from '../ast/Loop'
import {check, fail} from '../context'
import {assert} from '../util'
import {funKind, isInSwitch, opLoop, results, withFun, withLoop} from './context'
import SK from './SK'
import {verifyNotLazy} from './util'
import {getBlockSK} from './SK'
import {verifyBlockDo, verifyBlockSK} from './verifyBlock'
import {verifyAndPlusLocal} from './verifyLocals'
import verifyVal, {verifyOpVal} from './verifyVal'

export default function verifyLoop(_: For | ForBag, sk: SK): void {
	const {opIteratee, block} = _
	function verifyBlock(): void {
		withLoop({loop: _, sk}, () => verifyBlockDo(block))
	}
	caseOp(
		opIteratee,
		_ => withVerifyIteratee(_, verifyBlock),
		verifyBlock)
}

export function verifyForAsync(_: ForAsync, sk: SK): void {
	const {loc, iteratee, block} = _
	if (sk === SK.Do)
		check(funKind === Funs.Async, loc, _ => _.forAsyncNeedsAsync)
	withVerifyIteratee(iteratee, () => {
		withFun(Funs.Async, () => {
			// Default block to returning a value, but OK if it doesn't.
			// If a statement, statement, the compiled code will make a Promise
			// that resolves to an array full of `undefined`.
			verifyBlockSK(block, getBlockSK(block))
		})
	})
}

function withVerifyIteratee({element, bag}: Iteratee, action: () => void): void {
	verifyVal(bag)
	verifyNotLazy(element, _ => _.noLazyIteratee)
	verifyAndPlusLocal(element, action)
}

export function verifyBreak(_: Break): void {
	const {opValue, loc} = _
	verifyOpVal(opValue)
	const {loop, sk: loopSK} = orThrow(opLoop, () => fail(loc, _ => _.misplacedBreak))

	if (loop instanceof For)
		if (loopSK === SK.Do)
			check(opValue === null, loc, _ => _.breakCantHaveValue)
		else
			check(opValue !== null, loc, _ => _.breakNeedsValue)
	else {
		// (ForAsync isn't really a loop)
		assert(loop instanceof ForBag)
		check(opValue === null, this.loc, _ => _.breakValInForBag)
	}

	if (isInSwitch) {
		results.loopsNeedingLabel.add(loop)
		results.breaksInSwitch.add(_)
	}
}

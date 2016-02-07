import {opEach, orThrow} from 'op/Op'
import {FunBlock} from '../ast/Fun'
import Poly, {FunAbstract, PolyValue} from '../ast/Poly'
import {makeUseOptional} from './util'
import {verifyFunBlock} from './verifyFun'
import {verifyLocalDeclare} from './verifyLocals'
import {verifyOpVal} from './verifyVal'

export default function verifyPoly({value}: Poly): void {
	if (value instanceof FunBlock)
		// value always has opDeclareThis
		makeUseOptional(orThrow(value.opDeclareThis))
	value.args.forEach(makeUseOptional)
	opEach(value.opRestArg, makeUseOptional)
	verifyMethodValue(value)
	// name set by AssignSingle
}

function verifyMethodValue(_: PolyValue): void {
	if (_ instanceof FunAbstract)
		verifyFunAbstract(_)
	else
		verifyFunBlock(_)
}

function verifyFunAbstract({args, opRestArg, opReturnType}: FunAbstract): void {
	for (const _ of args)
		verifyLocalDeclare(_)
	opEach(opRestArg, verifyLocalDeclare)
	verifyOpVal(opReturnType)
}

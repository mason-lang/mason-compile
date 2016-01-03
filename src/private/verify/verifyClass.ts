import {opEach, orThrow} from 'op/Op'
import {check} from '../context'
import Class, {Constructor, Field} from '../ast/Class'
import {MethodImplLike, MethodImpl, MethodGetter, MethodSetter} from '../ast/classTraitCommon'
import {results, withIife, withMethod, withMethods} from './context'
import {setDeclareAccessed} from './locals'
import {makeUseOptional} from './util'
import verifyMethodImplLike, {verifyClassTraitDo} from './verifyMethodImplLike'
import verifyVal, {verifyEachVal, verifyOpVal} from './verifyVal'

export default function verifyClass(_: Class): void {
	const {opFields, opSuperClass, traits, opDo, statics, opConstructor, methods} = _

	opEach(opFields, fields => {
		for (const _ of fields)
			verifyField(_)
	})
	verifyOpVal(opSuperClass)
	verifyEachVal(traits)

	withIife(() => {
		opEach(opDo, verifyClassTraitDo)
	})

	// Class acts like a Fun: loop/generator context is lost and we get block locals.
	withMethods(() => {
		for (const _ of statics)
			verifyMethodImplLike(_)
		opEach(opConstructor, _ => verifyConstructor(_, opSuperClass !== null))
		for (const _ of methods)
			verifyMethodImplLike(_)
	})
	// name set by AssignSingle
}

function verifyConstructor(_: Constructor, classHasSuper: boolean): void {
	const {loc, fun, memberArgs} = _

	//todo: ctr fun always has opDecalreThis, let type system know this
	makeUseOptional(orThrow(fun.opDeclareThis))
	withMethod(_, () => verifyVal(fun))

	const superCall = results.constructorToSuper.get(_)

	if (classHasSuper)
		check(superCall !== undefined, loc, _ => _.superNeeded)
	else
		check(superCall === undefined, () => superCall.loc, _ => _.superForbidden)

	for (const arg of memberArgs)
		setDeclareAccessed(arg, _)
}

function verifyField(_: Field): void {
	verifyOpVal(_.opType)
}

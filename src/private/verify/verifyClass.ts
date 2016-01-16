import {opEach, orThrow} from 'op/Op'
import {check, fail} from '../context'
import Class, {Constructor, Field, SuperCall, SuperMember} from '../ast/Class'
import {method, results, withMethod, withMethods} from './context'
import SK from './SK'
import {makeUseOptional} from './util'
import {verifyClassTraitDo, verifyMethodImplLike} from './verifyClassTraitCommon'
import {setDeclareAccessed} from './verifyLocals'
import verifyMemberName from './verifyMemberName'
import verifyVal, {verifyEachVal, verifyOpVal} from './verifyVal'

export default function verifyClass(_: Class): void {
	const {opFields, opSuperClass, traits, opDo, statics, opConstructor, methods} = _

	opEach(opFields, fields => {
		for (const _ of fields)
			verifyField(_)
	})
	verifyOpVal(opSuperClass)
	verifyEachVal(traits)

	opEach(opDo, verifyClassTraitDo)

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

	// Constructor function always has opDeclareThis.
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

export function verifySuperCall(_: SuperCall, sk: SK): void {
	const {loc, args} = _
	const meth = orThrow(method, () => fail(loc, _ => _.superNeedsMethod))
	results.superCallToMethod.set(_, meth)

	if (meth instanceof Constructor) {
		check(sk === SK.Do, loc, _ => _.superMustBeStatement)
		results.constructorToSuper.set(meth, _)
	}

	verifyEachVal(args)
}

export function verifySuperMember({loc, name}: SuperMember): void {
	check(method !== null, loc, _ => _.superNeedsMethod)
	verifyMemberName(name)
}

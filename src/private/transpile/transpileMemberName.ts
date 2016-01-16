import Expression, {MemberExpression, MemberExpressionComputed} from 'esast/lib/Expression'
import {LiteralString} from 'esast/lib/Literal'
import {ComputedName, PropertyName} from 'esast/lib/ObjectExpression'
import {member, propertyIdOrLiteral} from 'esast-create-util/lib/util'
import MemberName from '../ast/MemberName'
import transpileVal from './transpileVal'

/** Transpile a [[MemberName]] to a value. */
export default function transpileMemberName(_: MemberName): Expression {
	return typeof _ === 'string' ? new LiteralString(_) : transpileVal(_)
}

/** Transpile a [[MemberName]] to the key of a property. */
export function transpileMemberNameToPropertyName(_: MemberName): PropertyName {
	return typeof _ === 'string' ?
		propertyIdOrLiteral(_) :
		new ComputedName(transpileVal(_))
}

/** Expression to access a member of an object. */
export function transpileMember(object: Expression, memberName: MemberName): MemberExpression {
	return typeof memberName === 'string' ?
		member(object, memberName) :
		new MemberExpressionComputed(object, transpileVal(memberName))
}

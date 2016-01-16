import Expression, { MemberExpression } from 'esast/lib/Expression';
import { PropertyName } from 'esast/lib/ObjectExpression';
import MemberName from '../ast/MemberName';
export default function transpileMemberName(_: MemberName): Expression;
export declare function transpileMemberNameToPropertyName(_: MemberName): PropertyName;
export declare function transpileMember(object: Expression, memberName: MemberName): MemberExpression;

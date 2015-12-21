import { Expression, MethodDefinitionConstructor, Statement } from 'esast/lib/ast';
import { Constructor } from '../MsAst';
export default function transpileClass(): Expression;
export declare function transpileConstructor(): MethodDefinitionConstructor;
export declare function constructorSetMembers(constructor: Constructor): Array<Statement>;

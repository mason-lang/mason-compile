import Expression from 'esast/lib/Expression';
import Statement from 'esast/lib/Statement';
import Class, { Constructor } from '../ast/Class';
export declare function transpileClassNoLoc(_: Class): Expression;
export declare function constructorSetMembers(constructor: Constructor): Array<Statement>;

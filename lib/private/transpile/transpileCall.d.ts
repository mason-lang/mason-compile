import Expression, { SpreadElement } from 'esast/lib/Expression';
import Call, { Arguments, New } from '../ast/Call';
export declare function transpileCallNoLoc({called, args}: Call): Expression;
export declare function transpileNewNoLoc(_: New): Expression;
export declare function transpileArguments(args: Arguments): Array<Expression | SpreadElement>;

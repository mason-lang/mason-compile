import Expression from 'esast/lib/Expression';
import { FunOperator, FunUnary } from '../ast/Fun';
import { Operator, UnaryOperator } from '../ast/Val';
export declare function transpileOperatorNoLoc({kind, args}: Operator): Expression;
export declare function transpileFunOperatorNoLoc(_: FunOperator): Expression;
export declare function transpileUnaryOperatorNoLoc({kind, arg}: UnaryOperator): Expression;
export declare function transpileFunUnaryNoLoc({kind}: FunUnary): Expression;

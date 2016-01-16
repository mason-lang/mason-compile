import Expression from 'esast/lib/Expression';
import { ArrowFunctionExpression, FunctionExpression } from 'esast/lib/Function';
import Statement from 'esast/lib/Statement';
import Op from 'op/Op';
import Fun, { FunBlock } from '../ast/Fun';
export declare function transpileFunNoLoc(_: Fun): Expression;
export declare function transpileFunBlock(_: FunBlock, opts?: TranspileFunBlockOptions): ArrowFunctionExpression | FunctionExpression;
export declare type TranspileFunBlockOptions = {
    leadStatements?: Op<Array<Statement>>;
    dontDeclareThis?: boolean;
};

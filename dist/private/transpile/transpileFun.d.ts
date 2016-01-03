import { ArrowFunctionExpression, FunctionExpression } from 'esast/lib/Function';
import Statement from 'esast/lib/Statement';
import Op from 'op/Op';
import Fun from '../ast/Fun';
export default function transpileFun(_: Fun, leadStatements?: Op<Array<Statement>>, dontDeclareThis?: boolean): ArrowFunctionExpression | FunctionExpression;
export declare function transpileFunNoLoc(_: Fun, leadStatements?: Op<Array<Statement>>, dontDeclareThis?: boolean): ArrowFunctionExpression | FunctionExpression;

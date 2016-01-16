import Expression from 'esast/lib/Expression';
import Statement, { ThrowStatement } from 'esast/lib/Statement';
import { Assert, Except, Throw } from '../ast/errors';
export declare function transpileAssertNoLoc({negate, condition, opThrown}: Assert): Statement;
export declare function transpileExceptValNoLoc(_: Except): Expression;
export declare function transpileExceptDoNoLoc({tried, typedCatches, opCatchAll, opElse, opFinally}: Except): Statement | Array<Statement>;
export declare function transpileThrow(_: Throw): ThrowStatement;
export declare function transpileThrowNoLoc(_: Throw): ThrowStatement;

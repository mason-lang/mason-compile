import Expression from 'esast/lib/Expression';
import Statement from 'esast/lib/Statement';
import { Cond, Conditional } from '../ast/booleans';
export declare function transpileConditionalDoNoLoc(_: Conditional): Statement;
export declare function transpileConditionalValNoLoc(_: Conditional): Expression;
export declare function transpileCondNoLoc({test, ifTrue, ifFalse}: Cond): Expression;

import Expression from 'esast/lib/Expression';
import Statement from 'esast/lib/Statement';
import { Break, For, ForAsync, ForBag } from '../ast/Loop';
export declare function transpileForValNoLoc({opIteratee, block}: For): Expression;
export declare function transpileForDoNoLoc(_: For): Statement;
export declare function transpileForAsyncValNoLoc({iteratee: {element, bag}, block}: ForAsync): Expression;
export declare function transpileForAsyncDoNoLoc(_: ForAsync): Statement;
export declare function transpileForBagNoLoc(_: ForBag): Expression;
export declare function transpileBreakNoLoc(_: Break): Statement;

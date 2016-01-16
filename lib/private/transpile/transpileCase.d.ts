import Expression from 'esast/lib/Expression';
import Statement from 'esast/lib/Statement';
import Case from '../ast/Case';
export declare function transpileCaseValNoLoc({opCased, parts, opElse}: Case): Expression;
export declare function transpileCaseDoNoLoc({opCased, parts, opElse}: Case): Statement | Array<Statement>;

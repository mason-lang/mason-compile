import Expression from 'esast/lib/Expression';
import Statement from 'esast/lib/Statement';
import With from '../ast/With';
export declare function transpileWithDoNoLoc(_: With): Statement;
export declare function transpileWithValNoLoc(_: With): Expression;

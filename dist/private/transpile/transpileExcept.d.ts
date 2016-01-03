import Expression from 'esast/lib/Expression';
import Statement from 'esast/lib/Statement';
import { Except } from '../ast/errors';
export declare function transpileExceptValNoLoc(_: Except): Expression;
export declare function transpileExceptDoNoLoc(_: Except): Statement | Array<Statement>;

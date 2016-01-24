import { Cond, Conditional } from '../ast/booleans';
import SK from './SK';
export declare function verifyCond({test, ifTrue, ifFalse}: Cond, sk: SK): void;
export declare function verifyConditional({test, result}: Conditional, sk: SK): void;

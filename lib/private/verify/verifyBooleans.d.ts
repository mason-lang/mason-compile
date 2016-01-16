import { Cond, Conditional, Logic, Not } from '../ast/booleans';
import SK from './SK';
export declare function verifyCond({test, ifTrue, ifFalse}: Cond, sk: SK): void;
export declare function verifyConditional({test, result}: Conditional, sk: SK): void;
export declare function verifyLogic({loc, args}: Logic): void;
export declare function verifyNot({arg}: Not): void;

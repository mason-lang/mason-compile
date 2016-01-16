import { LocalDeclare } from '../ast/locals';
import Named from '../ast/Named';
import Language from '../languages/Language';
export declare function makeUseOptional(localDeclare: LocalDeclare): void;
export declare function makeUseOptionalIfFocus(localDeclare: LocalDeclare): void;
export declare function setName(expr: Named): void;
export declare function verifyNotLazy(declare: LocalDeclare, errorMessage: (_: Language) => string): void;

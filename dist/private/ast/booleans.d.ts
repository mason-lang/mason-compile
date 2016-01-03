import Loc from 'esast/lib/Loc';
import Block from './Block';
import { Val, ValOnly, ValOrDo } from './LineContent';
export declare class Conditional extends ValOrDo {
    test: Val;
    result: Block | Val;
    isUnless: boolean;
    constructor(loc: Loc, test: Val, result: Block | Val, isUnless: boolean);
}
export declare class Cond extends ValOrDo {
    test: Val;
    ifTrue: Val;
    ifFalse: Val;
    constructor(loc: Loc, test: Val, ifTrue: Val, ifFalse: Val);
}
export declare class Logic extends ValOnly {
    kind: Logics;
    args: Array<Val>;
    constructor(loc: Loc, kind: Logics, args: Array<Val>);
}
export declare const enum Logics {
    And = 0,
    Or = 1,
}
export declare class Not extends ValOnly {
    arg: Val;
    constructor(loc: Loc, arg: Val);
}

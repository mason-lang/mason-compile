import Loc from 'esast/lib/Loc';
import Block from './Block';
import { Val, ValOrDo } from './LineContent';
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

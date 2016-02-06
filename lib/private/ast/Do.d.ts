import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import { DoOnly, Val } from './LineContent';
import MemberName from './MemberName';
export declare class Ignore extends DoOnly {
    ignoredNames: Array<string>;
    constructor(loc: Loc, ignoredNames: Array<string>);
}
export declare class Pass extends DoOnly {
    ignored: Val;
    constructor(loc: Loc, ignored: Val);
}
export declare class SpecialDo extends DoOnly {
    kind: SpecialDos;
    constructor(loc: Loc, kind: SpecialDos);
}
export declare const enum SpecialDos {
    Debugger = 0,
}
export declare class MemberSet extends DoOnly {
    object: Val;
    name: MemberName;
    opType: Op<Val>;
    value: Val;
    constructor(loc: Loc, object: Val, name: MemberName, opType: Op<Val>, value: Val);
}
export declare class SetSub extends DoOnly {
    object: Val;
    subbeds: Array<Val>;
    opType: Op<Val>;
    value: Val;
    constructor(loc: Loc, object: Val, subbeds: Array<Val>, opType: Op<Val>, value: Val);
}

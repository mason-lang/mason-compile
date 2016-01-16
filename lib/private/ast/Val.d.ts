import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import { Val, ValOnly } from './LineContent';
import MsAst from './MsAst';
import MemberName from './MemberName';
export declare class BagSimple extends ValOnly {
    parts: Array<Val>;
    constructor(loc: Loc, parts: Array<Val>);
}
export declare class ObjSimple extends ValOnly {
    pairs: Array<ObjPair>;
    constructor(loc: Loc, pairs: Array<ObjPair>);
}
export declare class ObjPair extends MsAst {
    key: MemberName;
    value: Val;
    constructor(loc: Loc, key: MemberName, value: Val);
}
export declare class NumberLiteral extends ValOnly {
    value: string;
    constructor(loc: Loc, value: string);
    toString(): string;
}
export declare class Member extends ValOnly {
    object: Val;
    name: MemberName;
    constructor(loc: Loc, object: Val, name: MemberName);
}
export declare class Pipe extends ValOnly {
    startValue: Val;
    pipes: Array<Val>;
    constructor(loc: Loc, startValue: Val, pipes: Array<Val>);
}
export declare class Range extends ValOnly {
    start: Val;
    opEnd: Op<Val>;
    isExclusive: boolean;
    constructor(loc: Loc, start: Val, opEnd: Op<Val>, isExclusive: boolean);
}
export declare class Lazy extends ValOnly {
    value: Val;
    constructor(loc: Loc, value: Val);
}
export declare class InstanceOf extends ValOnly {
    instance: Val;
    type: Val;
    constructor(loc: Loc, instance: Val, type: Val);
}
export declare class Sub extends ValOnly {
    subbed: Val;
    args: Array<Val>;
    constructor(loc: Loc, subbed: Val, args: Array<Val>);
}
export declare class SpecialVal extends ValOnly {
    kind: SpecialVals;
    constructor(loc: Loc, kind: SpecialVals);
}
export declare const enum SpecialVals {
    False = 0,
    Name = 1,
    Null = 2,
    True = 3,
    Undefined = 4,
}
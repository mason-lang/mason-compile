import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import { Val, ValOrDo } from './LineContent';
export default class YieldLike extends ValOrDo {
    isYieldLike(): void;
}
export declare class Yield extends YieldLike {
    opValue: Op<Val>;
    constructor(loc: Loc, opValue?: Op<Val>);
}
export declare class YieldTo extends YieldLike {
    value: Val;
    constructor(loc: Loc, value: Val);
}

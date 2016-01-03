import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import { Val, ValOrDo } from './LineContent';
export declare class Yield extends ValOrDo {
    opValue: Op<Val>;
    constructor(loc: Loc, opValue?: Op<Val>);
}
export declare class YieldTo extends ValOrDo {
    value: Val;
    constructor(loc: Loc, value: Val);
}

import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import Block from './Block';
import { DoOnly, Val, ValOnly, ValOrDo } from './LineContent';
import { LocalDeclare } from './locals';
import MsAst from './MsAst';
declare type Loop = For | ForAsync | ForBag;
export default Loop;
export declare class For extends ValOrDo {
    opIteratee: Op<Iteratee>;
    block: Block;
    constructor(loc: Loc, opIteratee: Op<Iteratee>, block: Block);
}
export declare class ForAsync extends ValOrDo {
    iteratee: Iteratee;
    block: Block;
    constructor(loc: Loc, iteratee: Iteratee, block: Block);
}
export declare class ForBag extends ValOnly {
    opIteratee: Op<Iteratee>;
    block: Block;
    built: LocalDeclare;
    constructor(loc: Loc, opIteratee: Op<Iteratee>, block: Block);
}
export declare class Iteratee extends MsAst {
    element: LocalDeclare;
    bag: Val;
    constructor(loc: Loc, element: LocalDeclare, bag: Val);
}
export declare class Break extends DoOnly {
    opValue: Op<Val>;
    constructor(loc: Loc, opValue?: Op<Val>);
}

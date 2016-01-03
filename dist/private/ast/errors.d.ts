import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import Block from './Block';
import { DoOnly, Val, ValOrDo } from './LineContent';
import { LocalDeclare } from './locals';
import MsAst from '../MsAst';
export declare class Throw extends DoOnly {
    opThrown: Op<Val>;
    constructor(loc: Loc, opThrown: Op<Val>);
}
export declare class Assert extends DoOnly {
    negate: boolean;
    condition: Val;
    opThrown: Op<Val>;
    constructor(loc: Loc, negate: boolean, condition: Val, opThrown: Op<Val>);
}
export declare class Except extends ValOrDo {
    typedCatches: Array<Catch>;
    opCatchAll: Op<Catch>;
    opElse: Op<Block>;
    opFinally: Op<Block>;
    try: Block;
    constructor(loc: Loc, _try: Block, typedCatches: Array<Catch>, opCatchAll: Op<Catch>, opElse: Op<Block>, opFinally: Op<Block>);
    allCatches: Array<Catch>;
}
export declare class Catch extends MsAst {
    caught: LocalDeclare;
    block: Block;
    constructor(loc: Loc, caught: LocalDeclare, block: Block);
}

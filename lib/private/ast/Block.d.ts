import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import LineContent, { ValOnly } from './LineContent';
import MsAst from './MsAst';
export default class Block extends MsAst {
    opComment: Op<string>;
    lines: Array<LineContent>;
    constructor(loc: Loc, opComment: Op<string>, lines: Array<LineContent>);
}
export declare class BlockWrap extends ValOnly {
    block: Block;
    constructor(loc: Loc, block: Block);
}

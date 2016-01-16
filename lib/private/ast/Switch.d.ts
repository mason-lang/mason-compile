import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import Block from './Block';
import { Val, ValOrDo } from './LineContent';
import MsAst from './MsAst';
export default class Switch extends ValOrDo {
    switched: Val;
    parts: Array<SwitchPart>;
    opElse: Op<Block>;
    constructor(loc: Loc, switched: Val, parts: Array<SwitchPart>, opElse: Op<Block>);
}
export declare class SwitchPart extends MsAst {
    values: Array<Val>;
    result: Block;
    constructor(loc: Loc, values: Array<Val>, result: Block);
}

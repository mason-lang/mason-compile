import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import { FunBlock } from './Fun';
import { Val, ValOnly } from './LineContent';
import { LocalDeclare } from './locals';
import MsAst from './MsAst';
export default class Method extends ValOnly {
    value: MethodValue;
    constructor(loc: Loc, value: MethodValue);
}
export declare type MethodValue = FunAbstract | FunBlock;
export declare class FunAbstract extends MsAst {
    args: Array<LocalDeclare>;
    opRestArg: Op<LocalDeclare>;
    opReturnType: Op<Val>;
    opComment: Op<string>;
    constructor(loc: Loc, args: Array<LocalDeclare>, opRestArg: Op<LocalDeclare>, opReturnType: Op<Val>, opComment: Op<string>);
}

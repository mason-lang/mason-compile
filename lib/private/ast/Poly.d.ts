import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import { FunBlock } from './Fun';
import { Val, ValOnly } from './LineContent';
import { LocalDeclare } from './locals';
import MsAst from './MsAst';
import Named from './Named';
export default class Poly extends ValOnly implements Named {
    value: PolyValue;
    constructor(loc: Loc, value: PolyValue);
    isNamed(): void;
}
export declare type PolyValue = FunAbstract | FunBlock;
export declare class FunAbstract extends MsAst {
    args: Array<LocalDeclare>;
    opRestArg: Op<LocalDeclare>;
    opReturnType: Op<Val>;
    opComment: Op<string>;
    constructor(loc: Loc, args: Array<LocalDeclare>, opRestArg: Op<LocalDeclare>, opReturnType: Op<Val>, opComment: Op<string>);
}

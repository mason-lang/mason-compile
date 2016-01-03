import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import Block from './Block';
import { Val, ValOnly } from './LineContent';
import { LocalDeclare } from './locals';
import MsAst from './MsAst';
import MemberName from './MemberName';
export interface FunLike extends MsAst {
    args: Array<LocalDeclare>;
    opRestArg: Op<LocalDeclare>;
    opReturnType: Op<Val>;
}
export default class Fun extends ValOnly implements FunLike {
    args: Array<LocalDeclare>;
    opRestArg: Op<LocalDeclare>;
    block: Block;
    kind: Funs;
    opDeclareThis: Op<LocalDeclare>;
    isDo: boolean;
    opReturnType: Op<Val>;
    constructor(loc: Loc, args: Array<LocalDeclare>, opRestArg: Op<LocalDeclare>, block: Block, opts?: FunOptions);
}
export declare const enum Funs {
    Plain = 0,
    Async = 1,
    Generator = 2,
}
export declare type FunOptions = {
    kind?: Funs;
    isThisFun?: boolean;
    isDo?: boolean;
    opReturnType?: Op<Val>;
};
export declare class FunAbstract extends MsAst implements FunLike {
    args: Array<LocalDeclare>;
    opRestArg: Op<LocalDeclare>;
    opReturnType: Op<Val>;
    opComment: Op<string>;
    constructor(loc: Loc, args: Array<LocalDeclare>, opRestArg: Op<LocalDeclare>, opReturnType: Op<Val>, opComment: Op<string>);
}
export declare class MemberFun extends ValOnly {
    opObject: Op<Val>;
    name: MemberName;
    constructor(loc: Loc, opObject: Op<Val>, name: MemberName);
}
export declare class GetterFun extends ValOnly {
    name: MemberName;
    constructor(loc: Loc, name: MemberName);
}
export declare class SimpleFun extends ValOnly {
    value: Val;
    constructor(loc: Loc, value: Val);
}

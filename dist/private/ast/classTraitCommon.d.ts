import Loc from 'esast/lib/Loc';
import Block from './Block';
import Fun from './Fun';
import { LocalDeclare } from './locals';
import MemberName from './MemberName';
import MsAst from './MsAst';
export declare class ClassTraitDo extends MsAst {
    block: Block;
    declareFocus: LocalDeclare;
    constructor(loc: Loc, block: Block);
}
export declare enum MethodImplKind {
    Plain = 0,
    My = 4,
    Virtual = 2,
    Override = 1,
}
export declare abstract class MethodImplLike extends MsAst {
    symbol: MemberName;
    kind: MethodImplKind;
    constructor(loc: Loc, symbol: MemberName, kind: MethodImplKind);
}
export declare class MethodImpl extends MethodImplLike {
    fun: Fun;
    constructor(loc: Loc, symbol: MemberName, fun: Fun, kind: MethodImplKind);
}
export declare class MethodGetter extends MethodImplLike {
    block: Block;
    declareThis: LocalDeclare;
    constructor(loc: Loc, symbol: MemberName, block: Block, kind: MethodImplKind);
}
export declare class MethodSetter extends MethodImplLike {
    block: Block;
    declareThis: LocalDeclare;
    declareFocus: LocalDeclare;
    constructor(loc: Loc, symbol: MemberName, block: Block, kind: MethodImplKind);
}

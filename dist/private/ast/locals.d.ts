import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import { DoOnly, Val, ValOnly } from './LineContent';
import MsAst from './MsAst';
export declare class LocalDeclare extends MsAst {
    name: string;
    opType: Op<Val>;
    kind: LocalDeclares;
    static untyped(loc: Loc, name: string, kind: LocalDeclares): LocalDeclare;
    static plain(loc: Loc, name: string): LocalDeclare;
    static built(loc: Loc): LocalDeclare;
    static focus(loc: Loc): LocalDeclare;
    static typedFocus(loc: Loc, type: Val): LocalDeclare;
    static this(loc: Loc): LocalDeclare;
    constructor(loc: Loc, name: string, opType: Op<Val>, kind: LocalDeclares);
    isLazy: boolean;
}
export declare const enum LocalDeclares {
    Eager = 0,
    Lazy = 1,
}
export declare class LocalAccess extends ValOnly {
    name: string;
    static focus(loc: Loc): LocalAccess;
    static this(loc: Loc): LocalAccess;
    constructor(loc: Loc, name: string);
}
export declare class LocalMutate extends DoOnly {
    name: string;
    value: Val;
    constructor(loc: Loc, name: string, value: Val);
}
export declare abstract class Assign extends DoOnly {
    abstract allAssignees(): Array<LocalDeclare>;
}
export declare class AssignSingle extends Assign {
    assignee: LocalDeclare;
    value: Val;
    static focus(loc: Loc, value: Val): AssignSingle;
    constructor(loc: Loc, assignee: LocalDeclare, value: Val);
    allAssignees(): Array<LocalDeclare>;
}
export declare class AssignDestructure extends Assign {
    assignees: Array<LocalDeclare>;
    value: Val;
    constructor(loc: Loc, assignees: Array<LocalDeclare>, value: Val);
    kind: LocalDeclares;
    allAssignees(): Array<LocalDeclare>;
}

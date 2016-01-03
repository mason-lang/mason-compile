import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import LineContent, { DoOnly, Val, ValOnly } from './LineContent';
import { Assign } from './locals';
import MemberName from './MemberName';
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
export declare abstract class BuildEntry extends DoOnly {
    isBuildEntry(): void;
}
export declare abstract class ObjEntry extends BuildEntry {
    isObjEntry(): void;
}
export declare class ObjEntryAssign extends ObjEntry {
    assign: Assign;
    constructor(loc: Loc, assign: Assign);
}
export declare class ObjEntryPlain extends ObjEntry {
    name: MemberName;
    value: Val;
    static access(loc: Loc, name: string): ObjEntryPlain;
    static nameEntry(loc: Loc, value: Val): ObjEntryPlain;
    constructor(loc: Loc, name: MemberName, value: Val);
}
export declare class BagEntry extends BuildEntry {
    value: Val;
    isMany: boolean;
    constructor(loc: Loc, value: Val, isMany?: boolean);
}
export declare class MapEntry extends BuildEntry {
    key: Val;
    val: Val;
    constructor(loc: Loc, key: Val, val: Val);
}

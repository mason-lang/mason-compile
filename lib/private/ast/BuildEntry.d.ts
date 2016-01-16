import Loc from 'esast/lib/Loc';
import { DoOnly, Val } from './LineContent';
import { Assign } from './locals';
import MemberName from './MemberName';
declare abstract class BuildEntry extends DoOnly {
    isBuildEntry(): void;
}
export default BuildEntry;
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

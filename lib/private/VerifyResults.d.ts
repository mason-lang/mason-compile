import Op from 'op/Op';
import Block from './ast/Block';
import { ObjEntry } from './ast/BuildEntry';
import { Constructor, SuperCall } from './ast/Class';
import { MethodImplLike } from './ast/classTraitCommon';
import { LocalAccess, LocalDeclare } from './ast/locals';
import Loop, { Break } from './ast/Loop';
import Named from './ast/Named';
import MsAst from './ast/MsAst';
export default class VerifyResults {
    localAccessToDeclare: Map<LocalAccess, LocalDeclare>;
    localDeclareToAccesses: Map<LocalDeclare, Array<MsAst>>;
    names: Map<Named, string>;
    builtinPathToNames: Map<string, Set<string>>;
    superCallToMethod: Map<SuperCall, Constructor | MethodImplLike>;
    constructorToSuper: Map<Constructor, SuperCall>;
    blockToKind: Map<Block, Blocks>;
    objEntryExports: Set<ObjEntry>;
    moduleKind: Modules;
    loopsNeedingLabel: Set<Loop>;
    breaksInSwitch: Set<Break>;
    constructor();
    localDeclareForAccess(localAccess: LocalAccess): LocalDeclare;
    name(expr: Named): string;
    opName(expr: Named): Op<string>;
    blockKind(block: Block): Blocks;
    isObjEntryExport(objEntry: ObjEntry): boolean;
    constructorHasSuper(ctr: Constructor): boolean;
    loopNeedsLabel(loop: Loop): boolean;
    isBreakInSwitch(breakAst: Break): boolean;
    accessBuiltin(name: string, path: string): void;
}
export declare const enum Blocks {
    Do = 0,
    Throw = 1,
    Return = 2,
    Bag = 3,
    Map = 4,
    Obj = 5,
}
export declare const enum Modules {
    Do = 0,
    Val = 1,
    Exports = 2,
    Bag = 3,
    Map = 4,
}

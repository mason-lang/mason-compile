import Op from 'op/Op';
import MsAst, { Block, Break, Do, CasePart, Constructor, ForAsync, LocalAccess, LocalDeclare, Loop, MethodImplLike, Named, ObjEntry, SpecialVal, SuperCall, SwitchPart } from './MsAst';
export default class VerifyResults {
    localAccessToDeclare: Map<LocalAccess, LocalDeclare>;
    localDeclareToAccesses: Map<LocalDeclare, Array<MsAst>>;
    names: Map<Named, string>;
    builtinPathToNames: Map<string, Set<string>>;
    superCallToMethod: Map<SuperCall, Constructor | MethodImplLike>;
    constructorToSuper: Map<Constructor, SuperCall>;
    blockToKind: Map<Block, Blocks>;
    statements: Set<Do | CasePart | SwitchPart | ForAsync>;
    objEntryExports: Set<ObjEntry>;
    moduleKind: Modules;
    loopsNeedingLabel: Set<Loop>;
    breaksInSwitch: Set<Break>;
    constructor();
    localDeclareForAccess(localAccess: LocalAccess): LocalDeclare;
    name(expr: SpecialVal): string;
    opName(expr: Named): Op<string>;
    isStatement(expr: Do | CasePart | SwitchPart): boolean;
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

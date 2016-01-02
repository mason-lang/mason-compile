import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
declare abstract class MsAst {
    loc: Loc;
    constructor(loc: Loc);
}
export default MsAst;
interface MsAst {
    transpile(arg1?: any, arg2?: any, arg3?: any): any;
}
export declare abstract class LineContent extends MsAst {
    isLineContent(): void;
}
export interface Val extends LineContent {
    isVal(): void;
}
export declare function isVal(_: LineContent): _ is Val;
export interface Do extends LineContent {
    isDo(): void;
}
export declare function isDo(_: LineContent): _ is Do;
export declare abstract class ValOrDo extends LineContent implements Val, Do {
    isVal(): void;
    isDo(): void;
}
export declare abstract class DoOnly extends LineContent implements Do {
    isDo(): void;
    private isDoOnly();
}
export declare abstract class ValOnly extends LineContent implements Val {
    isVal(): void;
    private isValOnly();
}
export declare type Named = Class | Fun | Method | Trait | SpecialVal;
export declare class Module extends MsAst {
    name: string;
    opComment: Op<string>;
    doImports: Array<ImportDo>;
    imports: Array<Import>;
    lines: Array<LineContent>;
    constructor(loc: Loc, name: string, opComment: Op<string>, doImports: Array<ImportDo>, imports: Array<Import>, lines: Array<LineContent>);
}
export declare class ImportDo extends MsAst {
    path: string;
    constructor(loc: Loc, path: string);
}
export declare class Import extends MsAst {
    path: string;
    imported: Array<LocalDeclare>;
    opImportDefault: Op<LocalDeclare>;
    constructor(loc: Loc, path: string, imported: Array<LocalDeclare>, opImportDefault: Op<LocalDeclare>);
}
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
export declare const enum Setters {
    Init = 0,
    Mutate = 1,
}
export declare type Name = string | Val;
export declare class MemberSet extends DoOnly {
    object: Val;
    name: Name;
    opType: Op<Val>;
    kind: Setters;
    value: Val;
    constructor(loc: Loc, object: Val, name: Name, opType: Op<Val>, kind: Setters, value: Val);
}
export declare class SetSub extends DoOnly {
    object: Val;
    subbeds: Array<Val>;
    opType: Op<Val>;
    kind: Setters;
    value: Val;
    constructor(loc: Loc, object: Val, subbeds: Array<Val>, opType: Op<Val>, kind: Setters, value: Val);
}
export declare class Throw extends DoOnly {
    opThrown: Op<Val>;
    constructor(loc: Loc, opThrown: Op<Val>);
}
export declare class Assert extends DoOnly {
    negate: boolean;
    condition: Val;
    opThrown: Op<Val>;
    constructor(loc: Loc, negate: boolean, condition: Val, opThrown: Op<Val>);
}
export declare class Except extends ValOrDo {
    typedCatches: Array<Catch>;
    opCatchAll: Op<Catch>;
    opElse: Op<Block>;
    opFinally: Op<Block>;
    try: Block;
    constructor(loc: Loc, _try: Block, typedCatches: Array<Catch>, opCatchAll: Op<Catch>, opElse: Op<Block>, opFinally: Op<Block>);
    allCatches: Array<Catch>;
}
export declare class Catch extends MsAst {
    caught: LocalDeclare;
    block: Block;
    constructor(loc: Loc, caught: LocalDeclare, block: Block);
}
export declare class Block extends MsAst {
    opComment: Op<string>;
    lines: Array<LineContent>;
    constructor(loc: Loc, opComment: Op<string>, lines: Array<LineContent>);
}
export declare abstract class BuildEntry extends DoOnly {
}
export declare abstract class ObjEntry extends BuildEntry {
}
export declare class ObjEntryAssign extends ObjEntry {
    assign: Assign;
    constructor(loc: Loc, assign: Assign);
}
export declare class ObjEntryPlain extends ObjEntry {
    name: Name;
    value: Val;
    static access(loc: Loc, name: string): ObjEntryPlain;
    static nameEntry(loc: Loc, value: Val): ObjEntryPlain;
    constructor(loc: Loc, name: Name, value: Val);
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
export declare class Conditional extends ValOrDo {
    test: Val;
    result: Block | Val;
    isUnless: boolean;
    constructor(loc: Loc, test: Val, result: Block | Val, isUnless: boolean);
}
export declare class Cond extends ValOnly {
    test: Val;
    ifTrue: Val;
    ifFalse: Val;
    constructor(loc: Loc, test: Val, ifTrue: Val, ifFalse: Val);
}
export interface FunLike extends MsAst {
    args: Array<LocalDeclare>;
    opRestArg: Op<LocalDeclare>;
    opReturnType: Op<Val>;
}
export declare class Fun extends ValOnly implements FunLike {
    args: Array<LocalDeclare>;
    opRestArg: Op<LocalDeclare>;
    block: Block;
    kind: Funs;
    opDeclareThis: Op<LocalDeclare>;
    isDo: boolean;
    opReturnType: Op<Val>;
    constructor(loc: Loc, args: Array<LocalDeclare>, opRestArg: Op<LocalDeclare>, block: Block, opts?: {
        kind?: Funs;
        isThisFun?: boolean;
        isDo?: boolean;
        opReturnType?: Op<Val>;
    });
}
export declare const enum Funs {
    Plain = 0,
    Async = 1,
    Generator = 2,
}
export declare class FunAbstract extends MsAst implements FunLike {
    args: Array<LocalDeclare>;
    opRestArg: Op<LocalDeclare>;
    opReturnType: Op<Val>;
    opComment: Op<string>;
    constructor(loc: Loc, args: Array<LocalDeclare>, opRestArg: Op<LocalDeclare>, opReturnType: Op<Val>, opComment: Op<string>);
}
export declare class Method extends ValOnly {
    fun: FunLike;
    constructor(loc: Loc, fun: FunLike);
}
export declare class Await extends ValOrDo {
    value: Val;
    constructor(loc: Loc, value: Val);
}
export declare class Yield extends ValOrDo {
    opValue: Op<Val>;
    constructor(loc: Loc, opValue?: Op<Val>);
}
export declare class YieldTo extends ValOrDo {
    value: Val;
    constructor(loc: Loc, value: Val);
}
export declare class Trait extends ValOnly {
    superTraits: Array<Val>;
    opComment: Op<string>;
    opDo: Op<ClassTraitDo>;
    statics: Array<MethodImplLike>;
    methods: Array<MethodImplLike>;
    constructor(loc: Loc, superTraits: Array<Val>, opComment?: Op<string>, opDo?: Op<ClassTraitDo>, statics?: Array<MethodImplLike>, methods?: Array<MethodImplLike>);
}
export declare class TraitDo extends DoOnly {
    implementor: Val;
    trait: Val;
    statics: Array<MethodImplLike>;
    methods: Array<MethodImplLike>;
    constructor(loc: Loc, implementor: Val, trait: Val, statics?: Array<MethodImplLike>, methods?: Array<MethodImplLike>);
}
export declare class Class extends ValOnly {
    opFields: Op<Array<Field>>;
    opSuperClass: Op<Val>;
    traits: Array<Val>;
    opComment: Op<string>;
    opDo: Op<ClassTraitDo>;
    statics: Array<MethodImplLike>;
    opConstructor: Op<Constructor>;
    methods: Array<MethodImplLike>;
    constructor(loc: Loc, opFields: Op<Array<Field>>, opSuperClass: Op<Val>, traits: Array<Val>, opComment?: Op<string>, opDo?: Op<ClassTraitDo>, statics?: Array<MethodImplLike>, opConstructor?: Op<Constructor>, methods?: Array<MethodImplLike>);
    isRecord: boolean;
}
export declare class Field extends MsAst {
    name: string;
    opType: Op<Val>;
    constructor(loc: Loc, name: string, opType?: Op<Val>);
}
export declare class ClassTraitDo extends MsAst {
    block: Block;
    declareFocus: LocalDeclare;
    constructor(loc: Loc, block: Block);
}
export declare class Constructor extends MsAst {
    fun: Fun;
    memberArgs: Array<LocalDeclare>;
    constructor(loc: Loc, fun: Fun, memberArgs: Array<LocalDeclare>);
}
export declare abstract class MethodImplLike extends MsAst {
    isMy: boolean;
    symbol: Name;
    constructor(loc: Loc, isMy: boolean, symbol: Name);
}
export declare class MethodImpl extends MethodImplLike {
    fun: Fun;
    constructor(loc: Loc, isMy: boolean, symbol: Name, fun: Fun);
}
export declare class MethodGetter extends MethodImplLike {
    block: Block;
    declareThis: LocalDeclare;
    constructor(loc: Loc, isMy: boolean, symbol: Name, block: Block);
}
export declare class MethodSetter extends MethodImplLike {
    block: Block;
    declareThis: LocalDeclare;
    declareFocus: LocalDeclare;
    constructor(loc: Loc, isMy: boolean, symbol: Name, block: Block);
}
export declare type Args = Array<Val | Spread>;
export declare class SuperCall extends ValOrDo {
    args: Args;
    constructor(loc: Loc, args: Args);
}
export declare class SuperMember extends ValOnly {
    name: Name;
    constructor(loc: Loc, name: Name);
}
export declare class Call extends ValOrDo {
    called: Val;
    args: Args;
    constructor(loc: Loc, called: Val, args: Args);
}
export declare class New extends ValOnly {
    type: Val;
    args: Args;
    constructor(loc: Loc, type: Val, args: Args);
}
export declare class Spread extends ValOnly {
    spreaded: Val;
    constructor(loc: Loc, spreaded: Val);
}
export declare class Lazy extends ValOnly {
    value: Val;
    constructor(loc: Loc, value: Val);
}
export declare class Case extends ValOrDo {
    opCased: Op<AssignSingle>;
    parts: Array<CasePart>;
    opElse: Op<Block>;
    constructor(loc: Loc, opCased: Op<AssignSingle>, parts: Array<CasePart>, opElse: Op<Block>);
}
export declare class CasePart extends MsAst {
    test: Val | Pattern;
    result: Block;
    constructor(loc: Loc, test: Val | Pattern, result: Block);
}
export declare class Pattern extends MsAst {
    type: Val;
    locals: Array<LocalDeclare>;
    patterned: LocalAccess;
    constructor(loc: Loc, type: Val, locals: Array<LocalDeclare>);
}
export declare class Switch extends ValOrDo {
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
export declare type Loop = For | ForAsync | ForBag;
export declare class For extends ValOrDo {
    opIteratee: Op<Iteratee>;
    block: Block;
    constructor(loc: Loc, opIteratee: Op<Iteratee>, block: Block);
}
export declare class ForAsync extends ValOnly {
    iteratee: Iteratee;
    block: Block;
    constructor(loc: Loc, iteratee: Iteratee, block: Block);
}
export declare class ForBag extends ValOnly {
    opIteratee: Op<Iteratee>;
    block: Block;
    built: LocalDeclare;
    constructor(loc: Loc, opIteratee: Op<Iteratee>, block: Block);
}
export declare class Iteratee extends MsAst {
    element: LocalDeclare;
    bag: Val;
    constructor(loc: Loc, element: LocalDeclare, bag: Val);
}
export declare class Break extends DoOnly {
    opValue: Op<Val>;
    constructor(loc: Loc, opValue?: Op<Val>);
}
export declare class BlockWrap extends ValOnly {
    block: Block;
    constructor(loc: Loc, block: Block);
}
export declare class BagSimple extends ValOnly {
    parts: Array<Val>;
    constructor(loc: Loc, parts: Array<Val>);
}
export declare class ObjSimple extends ValOnly {
    pairs: Array<ObjPair>;
    constructor(loc: Loc, pairs: Array<ObjPair>);
}
export declare class ObjPair extends MsAst {
    key: string;
    value: Val;
    constructor(loc: Loc, key: string, value: Val);
}
export declare class Logic extends ValOnly {
    kind: Logics;
    args: Array<Val>;
    constructor(loc: Loc, kind: Logics, args: Array<Val>);
}
export declare const enum Logics {
    And = 0,
    Or = 1,
}
export declare class Not extends ValOnly {
    arg: Val;
    constructor(loc: Loc, arg: Val);
}
export declare class NumberLiteral extends ValOnly {
    value: string;
    constructor(loc: Loc, value: string);
    toString(): string;
}
export declare class Member extends ValOnly {
    object: Val;
    name: Name;
    constructor(loc: Loc, object: Val, name: Name);
}
export declare type QuotePart = string | Val;
export declare class MsRegExp extends ValOnly {
    parts: Array<QuotePart>;
    flags: string;
    constructor(loc: Loc, parts: Array<QuotePart>, flags?: string);
}
export declare class QuoteAbstract extends ValOnly {
}
export declare class QuotePlain extends QuoteAbstract {
    parts: Array<QuotePart>;
    constructor(loc: Loc, parts: Array<QuotePart>);
}
export declare class QuoteTaggedTemplate extends ValOnly {
    tag: Val;
    quote: QuotePlain;
    constructor(loc: Loc, tag: Val, quote: QuotePlain);
}
export declare class QuoteSimple extends QuoteAbstract {
    value: string;
    constructor(loc: Loc, value: string);
}
export declare class Pipe extends ValOnly {
    startValue: Val;
    pipes: Array<Val>;
    constructor(loc: Loc, startValue: Val, pipes: Array<Val>);
}
export declare class With extends ValOrDo {
    declare: LocalDeclare;
    value: Val;
    block: Block;
    constructor(loc: Loc, declare: LocalDeclare, value: Val, block: Block);
}
export declare class MemberFun extends ValOnly {
    opObject: Op<Val>;
    name: Name;
    constructor(loc: Loc, opObject: Op<Val>, name: Name);
}
export declare class GetterFun extends ValOnly {
    name: Name;
    constructor(loc: Loc, name: Name);
}
export declare class SimpleFun extends ValOnly {
    value: Val;
    constructor(loc: Loc, value: Val);
}
export declare class Range extends ValOnly {
    start: Val;
    end: Op<Val>;
    isExclusive: boolean;
    constructor(loc: Loc, start: Val, end: Op<Val>, isExclusive: boolean);
}
export declare class InstanceOf extends ValOnly {
    instance: Val;
    type: Val;
    constructor(loc: Loc, instance: Val, type: Val);
}
export declare class Sub extends ValOnly {
    subbed: Val;
    args: Array<Val>;
    constructor(loc: Loc, subbed: Val, args: Array<Val>);
}
export declare class Del extends ValOrDo {
    subbed: Val;
    args: Array<Val>;
    constructor(loc: Loc, subbed: Val, args: Array<Val>);
}
export declare class SpecialDo extends DoOnly {
    kind: SpecialDos;
    constructor(loc: Loc, kind: SpecialDos);
}
export declare const enum SpecialDos {
    Debugger = 0,
}
export declare class SpecialVal extends ValOnly {
    kind: SpecialVals;
    constructor(loc: Loc, kind: SpecialVals);
}
export declare const enum SpecialVals {
    False = 0,
    Name = 1,
    Null = 2,
    True = 3,
    Undefined = 4,
}
export declare class Ignore extends DoOnly {
    ignoredNames: Array<string>;
    constructor(loc: Loc, ignoredNames: Array<string>);
}
export declare class Pass extends DoOnly {
    ignored: Val;
    constructor(loc: Loc, ignored: Val);
}

import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import { SpecialVals } from '../ast/Val';
import Token from './Token';
export default class Keyword extends Token {
    kind: Keywords;
    constructor(loc: Loc, kind: Keywords);
    toString(): string;
}
export declare const enum Keywords {
    Enum = 0,
    From = 1,
    Implements = 2,
    Interface = 3,
    Package = 4,
    Private = 5,
    Protected = 6,
    Public = 7,
    Arguments = 8,
    Continue = 9,
    Delete = 10,
    Eval = 11,
    In = 12,
    InstanceOf = 13,
    Return = 14,
    TypeOf = 15,
    Void = 16,
    While = 17,
    Bang = 18,
    LeftAngle = 19,
    LeftArrow = 20,
    RightAngle = 21,
    Data = 22,
    Declare = 23,
    DelPred = 24,
    DoWhile = 25,
    DoUntil = 26,
    Final = 27,
    Flags = 28,
    Implicit = 29,
    Is = 30,
    Macro = 31,
    Meta = 32,
    Mut = 33,
    Native = 34,
    On = 35,
    Operator = 36,
    Out = 37,
    Pure = 38,
    Readonly = 39,
    Sealed = 40,
    Sizeof = 41,
    Struct = 42,
    Throws = 43,
    To = 44,
    Type = 45,
    Until = 46,
    Use = 47,
    Actor = 48,
    Move = 49,
    Send = 50,
    Shared = 51,
    Synchronized = 52,
    Transient = 53,
    Volatile = 54,
    Any = 55,
    Boolean = 56,
    Int = 57,
    Int8 = 58,
    Int16 = 59,
    Int32 = 60,
    Int64 = 61,
    Uint = 62,
    Uint8 = 63,
    Uint16 = 64,
    Uint32 = 65,
    Uint64 = 66,
    Float = 67,
    Float32 = 68,
    Float64 = 69,
    Float128 = 70,
    Mixed = 71,
    Number = 72,
    Object = 73,
    Ptr = 74,
    String = 75,
    Symbol = 76,
    Abstract = 77,
    Ampersand = 78,
    And = 79,
    As = 80,
    Assert = 81,
    Assign = 82,
    Await = 83,
    Break = 84,
    Built = 85,
    Case = 86,
    Catch = 87,
    Cond = 88,
    Class = 89,
    Colon = 90,
    Construct = 91,
    Debugger = 92,
    Del = 93,
    Do = 94,
    Dot = 95,
    Dot2 = 96,
    Dot3 = 97,
    Else = 98,
    Except = 99,
    Extends = 100,
    False = 101,
    Finally = 102,
    Focus = 103,
    For = 104,
    ForAsync = 105,
    ForBag = 106,
    Forbid = 107,
    Fun = 108,
    FunDo = 109,
    FunThis = 110,
    FunThisDo = 111,
    FunAsync = 112,
    FunAsynDo = 113,
    FunThisAsync = 114,
    FunThisAsynDo = 115,
    FunGen = 116,
    FunGenDo = 117,
    FunThisGen = 118,
    FunThisGenDo = 119,
    Get = 120,
    If = 121,
    Ignore = 122,
    Import = 123,
    ImportDo = 124,
    ImportLazy = 125,
    Lazy = 126,
    LocalMutate = 127,
    MapEntry = 128,
    Method = 129,
    My = 130,
    Name = 131,
    New = 132,
    Not = 133,
    Null = 134,
    ObjEntry = 135,
    Of = 136,
    Override = 137,
    Or = 138,
    Pass = 139,
    Pipe = 140,
    Region = 141,
    Set = 142,
    Super = 143,
    Static = 144,
    Switch = 145,
    Tick = 146,
    Throw = 147,
    Todo = 148,
    Trait = 149,
    TraitDo = 150,
    True = 151,
    Try = 152,
    Undefined = 153,
    Unless = 154,
    Virtual = 155,
    With = 156,
    Yield = 157,
    YieldTo = 158,
}
export declare function reservedKeywords(): Iterable<Keywords>;
export declare const allKeywords: Array<Keywords>;
export declare function keywordName(kind: Keywords): string;
export declare function opKeywordKindFromName(name: string): Op<Keywords>;
export declare function opKeywordKindToSpecialValueKind(kind: Keywords): Op<SpecialVals>;
export declare function isKeyword(keywordKind: Keywords, token: Token): token is Keyword;
export declare function isAnyKeyword(keywordKinds: Set<Keywords>, token: Token): token is Keyword;
export declare function tryGetKeywordName(token: Keyword): Op<string>;
export declare function isReservedKeyword(token: Token): token is Keyword;
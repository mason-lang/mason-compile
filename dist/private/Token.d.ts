import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import { SpecialVals } from './ast/Val';
declare abstract class Token {
    loc: Loc;
    constructor(loc: Loc);
}
export default Token;
export declare abstract class Group<SubType extends Token> extends Token {
    subTokens: Array<SubType>;
    constructor(loc: Loc, subTokens: Array<SubType>);
    abstract showType(): string;
    type: GroupType;
}
export declare type GroupType = {
    new (loc: Loc, subTokens: Array<{}>): Group<Token>;
    prototype: {
        showType(): string;
    };
};
export declare class GroupBlock extends Group<GroupLine> {
    showType(): string;
}
export declare type QuoteTokenPart = StringToken | Name | Keyword | GroupInterpolation;
export declare class GroupQuote extends Group<QuoteTokenPart> {
    showType(): string;
}
export declare class GroupRegExp extends Group<QuoteTokenPart> {
    flags: string;
    showType(): string;
}
export declare class GroupParenthesis extends Group<Token> {
    showType(): string;
}
export declare class GroupBracket extends Group<Token> {
    showType(): string;
}
export declare class GroupLine extends Group<Token> {
    showType(): string;
}
export declare class GroupSpace extends Group<Token> {
    showType(): string;
}
export declare class GroupInterpolation extends Group<Token> {
    showType(): string;
}
export declare class Name extends Token {
    name: string;
    constructor(loc: Loc, name: string);
    toString(): string;
}
export declare class DocComment extends Token {
    text: string;
    constructor(loc: Loc, text: string);
    toString(): string;
}
export declare class NumberToken extends Token {
    value: string;
    constructor(loc: Loc, value: string);
    toString(): string;
}
export declare class StringToken extends Token {
    value: string;
    constructor(loc: Loc, value: string);
    toString(): string;
}
export declare class Keyword extends Token {
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
    Implicit = 28,
    Is = 29,
    Macro = 30,
    Meta = 31,
    Mut = 32,
    Native = 33,
    On = 34,
    Operator = 35,
    Out = 36,
    Override = 37,
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
    Virtual = 48,
    Actor = 49,
    Move = 50,
    Send = 51,
    Shared = 52,
    Synchronized = 53,
    Transient = 54,
    Volatile = 55,
    Any = 56,
    Boolean = 57,
    Int = 58,
    Int8 = 59,
    Int16 = 60,
    Int32 = 61,
    Int64 = 62,
    UInt = 63,
    UInt8 = 64,
    UInt16 = 65,
    UInt32 = 66,
    UInt64 = 67,
    Float = 68,
    Float32 = 69,
    Float64 = 70,
    Float128 = 71,
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
    Or = 137,
    Pass = 138,
    Pipe = 139,
    Region = 140,
    Set = 141,
    Super = 142,
    Static = 143,
    Switch = 144,
    Tick = 145,
    Throw = 146,
    Todo = 147,
    Trait = 148,
    TraitDo = 149,
    True = 150,
    Try = 151,
    Undefined = 152,
    Unless = 153,
    With = 154,
    Yield = 155,
    YieldTo = 156,
}
export declare function reservedKeywords(): Iterable<Keywords>;
export declare const allKeywords: Array<Keywords>;
export declare function keywordName(kind: Keywords): string;
export declare function showKeyword(kind: Keywords): string;
export declare function opKeywordKindFromName(name: string): Op<Keywords>;
export declare function opKeywordKindToSpecialValueKind(kind: Keywords): Op<SpecialVals>;
export declare function isKeyword(keywordKind: Keywords, token: Token): token is Keyword;
export declare function isAnyKeyword(keywordKinds: Set<Keywords>, token: Token): token is Keyword;
export declare function tryGetKeywordName(token: Keyword): Op<string>;
export declare function isReservedKeyword(token: Token): token is Keyword;

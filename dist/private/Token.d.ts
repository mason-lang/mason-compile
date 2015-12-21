import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import { SpecialVals } from './MsAst';
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
    Implements = 1,
    Interface = 2,
    Package = 3,
    Private = 4,
    Protected = 5,
    Public = 6,
    Arguments = 7,
    Delete = 8,
    Eval = 9,
    In = 10,
    InstanceOf = 11,
    Return = 12,
    TypeOf = 13,
    Void = 14,
    While = 15,
    Bang = 16,
    LeftAngle = 17,
    LeftArrow = 18,
    RightAngle = 19,
    Actor = 20,
    Data = 21,
    DelPred = 22,
    DoWhile = 23,
    DoUntil = 24,
    Final = 25,
    Is = 26,
    Meta = 27,
    Out = 28,
    Override = 29,
    Send = 30,
    To = 31,
    Type = 32,
    Until = 33,
    Abstract = 34,
    Ampersand = 35,
    And = 36,
    As = 37,
    Assert = 38,
    Assign = 39,
    Await = 40,
    Break = 41,
    Built = 42,
    Case = 43,
    Catch = 44,
    Cond = 45,
    Class = 46,
    Colon = 47,
    Construct = 48,
    Debugger = 49,
    Del = 50,
    Do = 51,
    Dot = 52,
    Dot2 = 53,
    Dot3 = 54,
    Else = 55,
    Except = 56,
    Extends = 57,
    False = 58,
    Finally = 59,
    Focus = 60,
    For = 61,
    ForAsync = 62,
    ForBag = 63,
    Forbid = 64,
    Fun = 65,
    FunDo = 66,
    FunThis = 67,
    FunThisDo = 68,
    FunAsync = 69,
    FunAsynDo = 70,
    FunThisAsync = 71,
    FunThisAsynDo = 72,
    FunGen = 73,
    FunGenDo = 74,
    FunThisGen = 75,
    FunThisGenDo = 76,
    Get = 77,
    If = 78,
    Ignore = 79,
    Import = 80,
    ImportDo = 81,
    ImportLazy = 82,
    Lazy = 83,
    LocalMutate = 84,
    MapEntry = 85,
    Method = 86,
    My = 87,
    Name = 88,
    New = 89,
    Not = 90,
    Null = 91,
    ObjEntry = 92,
    Of = 93,
    Or = 94,
    Pass = 95,
    Pipe = 96,
    Region = 97,
    Set = 98,
    Super = 99,
    Static = 100,
    Switch = 101,
    Tick = 102,
    Throw = 103,
    Todo = 104,
    Trait = 105,
    TraitDo = 106,
    True = 107,
    Try = 108,
    Undefined = 109,
    Unless = 110,
    With = 111,
    Yield = 112,
    YieldTo = 113,
}
export declare const reservedKeywords: Array<Keywords>;
export declare const allKeywords: Array<Keywords>;
export declare function keywordName(kind: Keywords): string;
export declare function showKeyword(kind: Keywords): string;
export declare function opKeywordKindFromName(name: string): Op<Keywords>;
export declare function opKeywordKindToSpecialValueKind(kind: Keywords): Op<SpecialVals>;
export declare function isKeyword(keywordKind: Keywords, token: Token): token is Keyword;
export declare function isAnyKeyword(keywordKinds: Set<Keywords>, token: Token): token is Keyword;
export declare function tryGetKeywordName(token: Keyword): Op<string>;
export declare function isReservedKeyword(token: Token): token is Keyword;

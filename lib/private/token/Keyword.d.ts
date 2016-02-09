import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import { Funs } from '../ast/Fun';
import { Operators, SpecialVals, UnaryOperators } from '../ast/Val';
import Token from './Token';
declare abstract class Keyword extends Token {
    abstract name(): string;
}
export default Keyword;
export declare class KeywordReserved extends Keyword {
    kind: string;
    constructor(loc: Loc, kind: string);
    name(): string;
}
export declare class KeywordPlain extends Keyword {
    kind: Kw;
    constructor(loc: Loc, kind: Kw);
    name(): string;
}
export declare const enum Kw {
    Await = 0,
    Case = 1,
    Class = 2,
    Cond = 3,
    Del = 4,
    Except = 5,
    For = 6,
    ForAsync = 7,
    ForBag = 8,
    If = 9,
    New = 10,
    Poly = 11,
    Pipe = 12,
    Super = 13,
    Switch = 14,
    Trait = 15,
    Unless = 16,
    With = 17,
    Yield = 18,
    YieldTo = 19,
    Assign = 20,
    AssignMutate = 21,
    MapEntry = 22,
    ObjEntry = 23,
    Assert = 24,
    Break = 25,
    Debugger = 26,
    Dot3 = 27,
    Forbid = 28,
    Ignore = 29,
    Pass = 30,
    Throw = 31,
    TraitDo = 32,
    Abstract = 33,
    Ampersand = 34,
    As = 35,
    Built = 36,
    Catch = 37,
    Colon = 38,
    Construct = 39,
    Do = 40,
    Dot = 41,
    Dot2 = 42,
    Else = 43,
    Extends = 44,
    Finally = 45,
    Focus = 46,
    Get = 47,
    Import = 48,
    ImportDo = 49,
    ImportLazy = 50,
    Lazy = 51,
    My = 52,
    Of = 53,
    Override = 54,
    Region = 55,
    Set = 56,
    Static = 57,
    Tick = 58,
    Try = 59,
    Virtual = 60,
}
export declare class KeywordOperator extends Keyword {
    kind: Operators;
    constructor(loc: Loc, kind: Operators);
    name(): string;
}
export declare class KeywordUnaryOperator extends Keyword {
    kind: UnaryOperators;
    constructor(loc: Loc, kind: UnaryOperators);
    name(): string;
}
export declare class KeywordSpecialVal extends Keyword {
    kind: SpecialVals;
    constructor(loc: Loc, kind: SpecialVals);
    name(): string;
}
export declare class KeywordFun extends Keyword {
    options: KeywordFunOptions;
    constructor(loc: Loc, options: KeywordFunOptions);
    name(): string;
}
export declare type KeywordFunOptions = {
    isDo: boolean;
    isThisFun: boolean;
    kind: Funs;
};
export declare class KeywordComment extends Keyword {
    kind: 'todo' | 'region';
    constructor(loc: Loc, kind: 'todo' | 'region');
    name(): string;
}
export declare function isExprSplitKeyword(_: Token): boolean;
export declare function isLineSplitKeyword(_: Token): boolean;
export declare function isLineStartKeyword(_: Token): _ is KeywordPlain;
export declare function keywordName(_: Kw): string;
export declare function isKeyword(kind: Kw, token: Token): token is KeywordPlain;
export declare function isNameKeyword(_: Token): _ is Keyword;
export declare function opKeywordFromName(loc: Loc, name: string): Op<Keyword>;
export declare const allKeywords: IterableIterator<string>;

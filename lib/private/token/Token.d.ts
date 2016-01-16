import Loc from 'esast/lib/Loc';
declare abstract class Token {
    loc: Loc;
    constructor(loc: Loc);
}
export default Token;
export declare class NameToken extends Token {
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

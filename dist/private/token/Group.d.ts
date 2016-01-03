import Loc from 'esast/lib/Loc';
import Keyword from './Keyword';
import Token, { NameToken, StringToken } from './Token';
declare abstract class Group<SubType extends Token> extends Token {
    subTokens: Array<SubType>;
    constructor(loc: Loc, subTokens: Array<SubType>);
    abstract showType(): string;
    type: GroupType;
    toString(): string;
}
export default Group;
export declare type GroupType = {
    new (loc: Loc, subTokens: Array<{}>): Group<Token>;
    prototype: {
        showType(): string;
    };
};
export declare class GroupBlock extends Group<GroupLine> {
    showType(): string;
}
export declare type QuoteTokenPart = StringToken | NameToken | Keyword | GroupInterpolation;
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

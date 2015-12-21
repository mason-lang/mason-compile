import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import Token, { Group, GroupLine, Keywords, QuoteTokenPart } from '../Token';
export default class Slice<SubType extends Token> {
    static of<SubType extends Token>(group: Group<SubType>): Slice<SubType>;
    tokens: Array<SubType>;
    start: number;
    end: number;
    loc: Loc;
    constructor(tokens: Array<SubType>, start: number, end: number, loc: Loc);
    size(): number;
    isEmpty(): boolean;
    head(): SubType;
    second(): SubType;
    last(): SubType;
    nextToLast(): SubType;
    tail(): this;
    rtail(): this;
    opSplitOnce(splitOn: (_: Token) => boolean): Op<SplitOnceResult<this, SubType>>;
    opSplitMany(splitOn: (_: Token) => boolean): Op<SplitManyResult<this, SubType>>;
    [Symbol.iterator](): Iterator<SubType>;
    map<A>(mapper: (_: SubType) => A): Array<A>;
    private slice(newStart, newEnd, newLoc);
    protected chop(newStart: number, newEnd: number): this;
    chopStart(newStart: number): this;
    private chopEnd(newEnd);
}
export declare class Lines extends Slice<GroupLine> {
    static of(group: Group<GroupLine>): Lines;
    slices(): Iterable<Tokens>;
    headSlice(): Tokens;
    lastSlice(): Tokens;
    mapSlices<A>(mapper: (_: Tokens) => A): Array<A>;
}
export declare class Tokens extends Slice<Token> {
    static of(group: Group<Token>): Tokens;
    getKeywordSections(keywords: Array<Keywords>): [this, Array<Op<this>>];
}
export declare type QuoteTokens = Slice<QuoteTokenPart>;
export declare type SplitOnceResult<This, SubType> = {
    before: This;
    at: SubType;
    after: This;
};
export declare type SplitManyResult<This, SubType> = Array<{
    before: This;
    at: SubType;
}>;

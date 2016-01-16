import Loc from 'esast/lib/Loc';
import { Val, ValOnly } from './LineContent';
declare abstract class Quote extends ValOnly {
    isQuote(): void;
}
export default Quote;
export declare class QuoteTemplate extends Quote {
    parts: Array<TemplatePart>;
    constructor(loc: Loc, parts: Array<TemplatePart>);
}
export declare type TemplatePart = string | Val;
export declare class QuoteSimple extends Quote {
    value: string;
    constructor(loc: Loc, value: string);
}
export declare class QuoteTagged extends ValOnly {
    tag: Val;
    quote: QuoteTemplate;
    constructor(loc: Loc, tag: Val, quote: QuoteTemplate);
}
export declare class MsRegExp extends ValOnly {
    parts: Array<TemplatePart>;
    flags: string;
    constructor(loc: Loc, parts: Array<TemplatePart>, flags?: string);
}

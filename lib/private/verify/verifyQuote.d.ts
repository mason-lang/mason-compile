import Quote, { MsRegExp, QuoteTagged } from '../ast/Quote';
export default function verifyQuote(_: Quote): void;
export declare function verifyRegExp(_: MsRegExp): void;
export declare function verifyQuoteTagged({tag, quote}: QuoteTagged): void;

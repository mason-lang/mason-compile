import Expression from 'esast/lib/Expression';
import { TaggedTemplateExpression } from 'esast/lib/TemplateLiteral';
import Quote, { MsRegExp, QuoteTagged } from '../ast/Quote';
export default function transpileQuote(_: Quote): Expression;
export declare function transpileQuoteNoLoc(_: Quote): Expression;
export declare function transpileQuoteTaggedNoLoc({tag, quote}: QuoteTagged): TaggedTemplateExpression;
export declare function transpileRegExpNoLoc(_: MsRegExp): Expression;

import { MsRegExp, QuoteTemplate } from '../ast/Quote';
import { QuoteTokens } from './Slice';
export default function parseQuote(tokens: QuoteTokens): QuoteTemplate;
export declare function parseRegExp(tokens: QuoteTokens, flags: string): MsRegExp;

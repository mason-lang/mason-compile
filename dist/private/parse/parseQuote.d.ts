import { MsRegExp, QuotePlain } from '../ast/Val';
import { QuoteTokens } from './Slice';
export default function parseQuote(tokens: QuoteTokens): QuotePlain;
export declare function parseRegExp(tokens: QuoteTokens, flags: string): MsRegExp;

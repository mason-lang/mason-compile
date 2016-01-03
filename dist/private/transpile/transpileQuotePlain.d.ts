import { TemplateLiteral } from 'esast/lib/Expression';
import { QuotePlain } from '../ast/Val';
export default function transpileQuotePlain(_: QuotePlain): TemplateLiteral;
export declare function transpileQuotePlainNoLoc({parts}: QuotePlain): TemplateLiteral;

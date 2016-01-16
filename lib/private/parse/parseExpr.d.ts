import Op from 'op/Op';
import { Val } from '../ast/LineContent';
import Language from '../languages/Language';
import { Tokens } from './Slice';
export default function parseExpr(tokens: Tokens): Val;
export declare function opParseExpr(tokens: Tokens): Op<Val>;
export declare function parseExprParts(tokens: Tokens): Array<Val>;
export declare function parseNExprParts(tokens: Tokens, n: number, message: (_: Language) => string): Array<Val>;

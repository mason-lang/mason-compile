import { Expression, Statement } from 'esast/lib/ast';
export declare function transpileBreak(): Statement;
export declare function transpileFor(): Expression | Statement;
export declare function transpileForAsync(): Expression;
export declare function transpileForBag(): Expression;

import { BlockStatement, Expression, Statement } from 'esast/lib/ast';
export default function (): Expression | Statement | Array<Statement>;
export declare function transpileCatch(needsErrorDeclare: boolean): BlockStatement;

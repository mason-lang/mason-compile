import { Expression, Statement } from 'esast/lib/ast';
export default function (): Expression | Statement;
export declare function transpileCasePart(alternate: Statement): Statement;

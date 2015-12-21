import { Expression, Statement, SwitchCase } from 'esast/lib/ast';
export default function (): Expression | Statement | Array<Statement>;
export declare function transpileSwitchPart(): Array<SwitchCase>;

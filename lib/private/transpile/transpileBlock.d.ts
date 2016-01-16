import Expression from 'esast/lib/Expression';
import Statement, { BlockStatement } from 'esast/lib/Statement';
import Op from 'op/Op';
import Block from '../ast/Block';
import { Val } from '../ast/LineContent';
export default function transpileBlock(_: Block, options?: TranspileBlockOptions): BlockStatement;
export declare type TranspileBlockOptions = {
    lead?: Op<Statement | Array<Statement>>;
    opReturnType?: Op<Val>;
    follow?: Op<Statement | Array<Statement>>;
};
export declare function transpileBlockNoLoc(_: Block, options?: TranspileBlockOptions): BlockStatement;
export declare function transpileBlockVal(_: Block, options?: TranspileBlockOptions): Expression;
export declare function transpileBlockDo(_: Block): BlockStatement;
export declare function transpileBlockDoWithLeadAndFollow(_: Block, lead?: Op<Statement | Array<Statement>>, follow?: Op<Statement | Array<Statement>>): BlockStatement;
export declare function blockWrap(block: BlockStatement): Expression;
export declare function blockWrapStatement(statement: Statement): Expression;
export declare function blockWrapIfBlock(_: Block | Val): Expression;

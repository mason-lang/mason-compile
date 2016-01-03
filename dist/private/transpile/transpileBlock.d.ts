import Statement, { BlockStatement } from 'esast/lib/Statement';
import Op from 'op/Op';
import Block from '../ast/Block';
import { Val } from '../ast/LineContent';
export default function transpileBlock(_: Block, lead?: Op<Statement | Array<Statement>>, opReturnType?: Op<Val>, follow?: Op<Statement | Array<Statement>>): BlockStatement;
export declare function transpileBlockNoLoc(_: Block, lead?: Op<Statement | Array<Statement>>, opReturnType?: Op<Val>, follow?: Op<Statement | Array<Statement>>): BlockStatement;
export declare function transpileBlockDo(_: Block): BlockStatement;
export declare function transpileBlockDoWithLeadAndFollow(_: Block, lead?: Op<Statement | Array<Statement>>, follow?: Op<Statement | Array<Statement>>): BlockStatement;
export declare function transpileBlockDoWithLeadAndFollowNoLoc(_: Block, lead?: Op<Statement | Array<Statement>>, follow?: Op<Statement | Array<Statement>>): BlockStatement;

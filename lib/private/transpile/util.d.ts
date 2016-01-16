import Expression from 'esast/lib/Expression';
import Node from 'esast/lib/Node';
import Statement from 'esast/lib/Statement';
import Op from 'op/Op';
import { Do, Val } from '../ast/LineContent';
import MsAst from '../ast/MsAst';
export declare function loc<A extends Node>(expr: MsAst, node: A): A;
export declare function transpileLines(exprs: Array<Do>): Array<Statement>;
export declare function maybeWrapInCheckInstance(ast: Expression, opType: Op<Val>, name: string): Expression;
export declare function lazyWrap(value: Expression): Expression;
export declare function callFocusFun(value: Expression, calledOn: Expression): Expression;
export declare function callPreservingFunKind(call: Expression): Expression;

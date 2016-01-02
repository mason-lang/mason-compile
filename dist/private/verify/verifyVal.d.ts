import Op from 'op/Op';
import { LineContent, Val } from '../MsAst';
export default function verifyVal(_: Val): void;
export declare function verifyValP(_: LineContent): void;
export declare function verifyOpVal(_: Op<Val>): void;
export declare function verifyEachVal(vals: Array<Val>): void;

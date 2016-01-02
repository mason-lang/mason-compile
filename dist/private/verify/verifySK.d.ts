import Op from 'op/Op';
import { LineContent } from '../MsAst';
import SK from './SK';
export default function verifySK(_: LineContent, sk: SK): void;
export declare function verifyOpSK(_: Op<LineContent>, sk: SK): void;
export declare function verifyEachSK(asts: Array<LineContent>, sk: SK): void;

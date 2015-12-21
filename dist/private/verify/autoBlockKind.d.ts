import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import { LineContent } from '../MsAst';
import { Blocks } from '../VerifyResults';
export default function autoBlockKind(lines: Array<LineContent>, loc: Loc): Blocks;
export declare function opBlockBuildKind(lines: Array<LineContent>, loc: Loc): Op<Blocks>;

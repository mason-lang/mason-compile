import Loc from 'esast/lib/Loc';
import { Block, LineContent, LocalDeclare } from '../MsAst';
import SK from './SK';
export default function verifyBlock(sk: SK): void;
export declare function verifyDoBlock(_: Block): Array<LocalDeclare>;
export declare function verifyModuleLines(lines: Array<LineContent>, loc: Loc): void;

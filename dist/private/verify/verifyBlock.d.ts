import Loc from 'esast/lib/Loc';
import { Block, LineContent, LocalDeclare } from '../MsAst';
import SK from './SK';
export declare function verifyBlockSK(_: Block, sk: SK): void;
export declare function verifyBlockVal(_: Block): void;
export declare function verifyBlockDo(_: Block): Array<LocalDeclare>;
export declare function verifyModuleLines(lines: Array<LineContent>, loc: Loc): void;

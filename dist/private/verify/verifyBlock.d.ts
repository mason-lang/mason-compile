import Block from '../ast/Block';
import { LocalDeclare } from '../ast/locals';
import SK from './SK';
export declare function verifyBlockSK(_: Block, sk: SK): void;
export declare function verifyBlockVal(_: Block): void;
export declare function verifyBlockDo(_: Block): Array<LocalDeclare>;

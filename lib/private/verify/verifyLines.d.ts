import Loc from 'esast/lib/Loc';
import LineContent from '../ast/LineContent';
import { LocalDeclare } from '../ast/locals';
export default function verifyLines(lines: Array<LineContent>): Array<LocalDeclare>;
export declare function verifyBuiltLines(lines: Array<LineContent>, loc: Loc): void;

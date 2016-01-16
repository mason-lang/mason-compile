import LineContent from '../ast/LineContent';
import { Lines, Tokens } from './Slice';
export default function parseLine(tokens: Tokens): LineContent | Array<LineContent>;
export declare function parseLines(lines: Lines): Array<LineContent>;

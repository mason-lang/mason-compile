import Loc from 'esast/lib/Loc';
import { Pipe } from '../ast/Val';
import { Lines, Tokens } from './Slice';
export default function parsePipe(tokens: Tokens): Pipe;
export declare function parsePipeFun(loc: Loc, lines: Lines): Pipe;

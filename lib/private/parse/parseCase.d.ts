import Loc from 'esast/lib/Loc';
import Block from '../ast/Block';
import Case from '../ast/Case';
import { Lines, Tokens } from './Slice';
export default function parseCase(tokens: Tokens): Case;
export declare function parseCaseFun(loc: Loc, lines: Lines): Case;
export declare function parseCaseSwitchParts<A>(block: Lines, ctr: (loc: Loc, before: Tokens, block: Block) => A): {
    parts: Array<A>;
    opElse: Block;
};

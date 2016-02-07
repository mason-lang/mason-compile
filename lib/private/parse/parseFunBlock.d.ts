import Op from 'op/Op';
import Block from '../ast/Block';
import { FunBlock } from '../ast/Fun';
import { LocalDeclare } from '../ast/locals';
import { PolyValue } from '../ast/Poly';
import { Keywords } from '../token/Keyword';
import { Tokens } from './Slice';
export default function parseFunBlock(keywordKind: Keywords, tokens: Tokens): FunBlock;
export declare function parsePolyValue(keywordKind: Keywords, tokens: Tokens): PolyValue;
export declare function funArgsAndBlock(tokens: Tokens, isVal: boolean, includeMemberArgs?: boolean): {
    args: Array<LocalDeclare>;
    opRestArg: Op<LocalDeclare>;
    memberArgs: Array<LocalDeclare>;
    block: Block;
};

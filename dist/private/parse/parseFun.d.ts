import Op from 'op/Op';
import Block from '../ast/Block';
import Fun, { FunLike } from '../ast/Fun';
import { LocalDeclare } from '../ast/locals';
import { Keywords } from '../token/Keyword';
import { Tokens } from './Slice';
export default function parseFun(keywordKind: Keywords, tokens: Tokens): Fun;
export declare function parseFunLike(keywordKind: Keywords, tokens: Tokens): FunLike;
export declare function funArgsAndBlock(tokens: Tokens, isVal: boolean, includeMemberArgs?: boolean): {
    args: Array<LocalDeclare>;
    opRestArg: Op<LocalDeclare>;
    memberArgs: Array<LocalDeclare>;
    block: Block;
};

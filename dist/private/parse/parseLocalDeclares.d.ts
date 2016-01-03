import Op from 'op/Op';
import { Val } from '../ast/LineContent';
import { LocalDeclare, LocalDeclares } from '../ast/locals';
import Token from '../token/Token';
import { Tokens } from './Slice';
export default function parseLocalDeclares(tokens: Tokens): Array<LocalDeclare>;
export declare function parseLocalDeclaresJustNames(tokens: Tokens): Array<LocalDeclare>;
export declare function parseLocalDeclare(token: Token): LocalDeclare;
export declare function parseLocalDeclareFromSpaced(tokens: Tokens): LocalDeclare;
export declare function parseLocalDeclaresAndMemberArgs(tokens: Tokens): {
    declares: Array<LocalDeclare>;
    memberArgs: Array<LocalDeclare>;
};
export declare function parseLocalName(token: Token): string;
export declare function parseLocalDeclareOrFocus(tokens: Tokens): LocalDeclare;
export declare function parseLocalParts(token: Token, orMember?: boolean): {
    name: string;
    opType: Op<Val>;
    kind: LocalDeclares;
    isMember: boolean;
};

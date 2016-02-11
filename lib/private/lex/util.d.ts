import { Pos } from 'esast/lib/Loc';
import { Funs } from '../ast/Fun';
import { Kw } from '../token/Keyword';
export declare function addKeywordFun(startPos: Pos, opts: {
    isDo?: boolean;
    isThisFun?: boolean;
    kind?: Funs;
}): void;
export declare function addKeywordPlain(startPos: Pos, kind: Kw): void;

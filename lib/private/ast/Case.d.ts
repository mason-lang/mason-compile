import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import Block from './Block';
import { Val, ValOrDo } from './LineContent';
import { AssignSingle, LocalAccess, LocalDeclare } from './locals';
import MsAst from './MsAst';
export default class Case extends ValOrDo {
    opCased: Op<AssignSingle>;
    parts: Array<CasePart>;
    opElse: Op<Block>;
    constructor(loc: Loc, opCased: Op<AssignSingle>, parts: Array<CasePart>, opElse: Op<Block>);
}
export declare class CasePart extends MsAst {
    test: Val | Pattern;
    result: Block;
    constructor(loc: Loc, test: Val | Pattern, result: Block);
}
export declare class Pattern extends MsAst {
    type: Val;
    locals: Array<LocalDeclare>;
    patterned: LocalAccess;
    constructor(loc: Loc, type: Val, locals: Array<LocalDeclare>);
}

import Loc from 'esast/lib/Loc';
import Block from './Block';
import { Val, ValOrDo } from './LineContent';
import { LocalDeclare } from './locals';
export default class With extends ValOrDo {
    declare: LocalDeclare;
    value: Val;
    block: Block;
    constructor(loc: Loc, declare: LocalDeclare, value: Val, block: Block);
}

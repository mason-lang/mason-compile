import Loc from 'esast/lib/Loc';
import { FunLike } from './Fun';
import { ValOnly } from './LineContent';
export default class Method extends ValOnly {
    fun: FunLike;
    constructor(loc: Loc, fun: FunLike);
}

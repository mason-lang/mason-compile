import Loc from 'esast/lib/Loc';
import { Val, ValOrDo } from './LineContent';
export default class Del extends ValOrDo {
    subbed: Val;
    args: Array<Val>;
    constructor(loc: Loc, subbed: Val, args: Array<Val>);
}

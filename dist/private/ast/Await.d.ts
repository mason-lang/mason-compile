import Loc from 'esast/lib/Loc';
import { Val, ValOrDo } from './LineContent';
export default class Await extends ValOrDo {
    value: Val;
    constructor(loc: Loc, value: Val);
}

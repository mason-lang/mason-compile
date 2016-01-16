import Loc from 'esast/lib/Loc';
import { Val, ValOnly, ValOrDo } from './LineContent';
export default class Call extends ValOrDo {
    called: Val;
    args: Arguments;
    constructor(loc: Loc, called: Val, args: Arguments);
}
export declare type Argument = Val | Spread;
export declare type Arguments = Array<Argument>;
export declare class New extends ValOnly {
    type: Val;
    args: Arguments;
    constructor(loc: Loc, type: Val, args: Arguments);
}
export declare class Spread extends ValOnly {
    spreaded: Val;
    constructor(loc: Loc, spreaded: Val);
}

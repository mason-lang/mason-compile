import MsAst, { DoOnly, ValOnly, ValOrDo } from '../MsAst';
declare const enum SK {
    Do = 0,
    Val = 1,
}
export default SK;
export declare function checkDo(_: DoOnly, sk: SK): void;
export declare function checkVal(_: ValOnly, sk: SK): void;
export declare function markStatement(_: ValOrDo, sk: SK): void;
export declare function getSK(_: MsAst): SK;

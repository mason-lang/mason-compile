import { Block, CasePart, ForAsync, LineContent, SwitchPart, ValOrDo } from '../MsAst';
declare const enum SK {
    Do = 0,
    Val = 1,
}
export default SK;
export declare function markStatement(_: ValOrDo | CasePart | SwitchPart | ForAsync, sk: SK): void;
export declare function getBlockSK(_: Block): SK;
export declare function getLineSK(_: LineContent): SK;

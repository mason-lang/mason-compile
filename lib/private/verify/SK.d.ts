import Block from '../ast/Block';
import LineContent from '../ast/LineContent';
declare const enum SK {
    Do = 0,
    Val = 1,
}
export default SK;
export declare function getBlockSK(_: Block): SK;
export declare function getLineSK(_: LineContent): SK;

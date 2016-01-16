import MsAst from './MsAst';
declare abstract class LineContent extends MsAst {
    isLineContent(): void;
}
export default LineContent;
export interface Val extends LineContent {
    isVal(): void;
}
export declare function isVal(_: LineContent): _ is Val;
export interface Do extends LineContent {
    isDo(): void;
}
export declare function isDo(_: LineContent): _ is Do;
export declare abstract class ValOrDo extends LineContent implements Val, Do {
    isVal(): void;
    isDo(): void;
}
export declare abstract class DoOnly extends LineContent implements Do {
    isDo(): void;
    isDoOnly(): void;
}
export declare abstract class ValOnly extends LineContent implements Val {
    isVal(): void;
    isValOnly(): void;
}

import Loc from 'esast/lib/Loc';
export default class CompileError extends Error {
    errorMessage: ErrorMessage;
    constructor(errorMessage: ErrorMessage);
}
export declare class ErrorMessage {
    loc: Loc;
    message: string;
    constructor(loc: Loc, message: string);
    messageParts<A>(codeFormatter: (code: string) => A): Iterator<A | string>;
}

import CompileError, { ErrorMessage } from './CompileError';
import { OptionsObject } from './private/CompileOptions';
import { Module } from './private/MsAst';
export default class Compiler {
    private options;
    constructor(options?: OptionsObject);
    compile(source: string, filename: string): WarningsAnd<{
        code: string;
        sourceMap: string;
    }>;
    parse(source: string, filename: string): WarningsAnd<Module>;
    private CompileError;
}
export interface WarningsAnd<A> {
    warnings: Array<ErrorMessage>;
    result: A | CompileError;
}

import Language from './languages/Language';
export default class CompileOptions {
    includeAmdefine: boolean;
    includeSourceMap: boolean;
    lazyModules: boolean;
    useStrict: boolean;
    checks: boolean;
    importBoot: boolean;
    indent: '\t' | number;
    language: Language;
    noModuleBoilerplate: boolean;
    private mslPath;
    private builtinNameToPath;
    constructor(opts: OptionsObject);
    bootPath: string;
    opBuiltinPath(name: string): string;
}
export interface OptionsObject {
    includeAmdefine?: boolean;
    includeSourceMap?: boolean;
    lazyModules?: boolean;
    useStrict?: boolean;
    checks?: boolean;
    importBoot?: boolean;
    mslPath?: string;
    indent?: '\t' | number;
    language?: 'english';
    builtins?: Builtins;
    noModuleBoilerplate?: boolean;
}
export interface Builtins {
    [moduleName: string]: Array<string>;
}

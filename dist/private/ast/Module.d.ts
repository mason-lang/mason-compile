import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import LineContent from './LineContent';
import { LocalDeclare } from './locals';
import MsAst from './MsAst';
export default class Module extends MsAst {
    name: string;
    opComment: Op<string>;
    doImports: Array<ImportDo>;
    imports: Array<Import>;
    lines: Array<LineContent>;
    constructor(loc: Loc, name: string, opComment: Op<string>, doImports: Array<ImportDo>, imports: Array<Import>, lines: Array<LineContent>);
}
export declare class ImportDo extends MsAst {
    path: string;
    constructor(loc: Loc, path: string);
}
export declare class Import extends MsAst {
    path: string;
    imported: Array<LocalDeclare>;
    opImportDefault: Op<LocalDeclare>;
    constructor(loc: Loc, path: string, imported: Array<LocalDeclare>, opImportDefault: Op<LocalDeclare>);
}

import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import { Arguments } from './Call';
import { ClassTraitDo, MethodImplLike } from './classTraitCommon';
import { FunBlock } from './Fun';
import { Val, ValOnly, ValOrDo } from './LineContent';
import { LocalDeclare } from './locals';
import MemberName from './MemberName';
import MsAst from './MsAst';
import Named from './Named';
export default class Class extends ValOnly implements Named {
    opFields: Op<Array<Field>>;
    opSuperClass: Op<Val>;
    traits: Array<Val>;
    opComment: Op<string>;
    opDo: Op<ClassTraitDo>;
    statics: Array<MethodImplLike>;
    opConstructor: Op<Constructor>;
    methods: Array<MethodImplLike>;
    constructor(loc: Loc, opFields: Op<Array<Field>>, opSuperClass: Op<Val>, traits: Array<Val>, opComment?: Op<string>, opDo?: Op<ClassTraitDo>, statics?: Array<MethodImplLike>, opConstructor?: Op<Constructor>, methods?: Array<MethodImplLike>);
    isRecord: boolean;
    isNamed(): void;
}
export declare class Field extends MsAst {
    name: string;
    opType: Op<Val>;
    constructor(loc: Loc, name: string, opType?: Op<Val>);
}
export declare class Constructor extends MsAst {
    fun: FunBlock;
    memberArgs: Array<LocalDeclare>;
    constructor(loc: Loc, fun: FunBlock, memberArgs: Array<LocalDeclare>);
}
export declare class SuperCall extends ValOrDo {
    args: Arguments;
    constructor(loc: Loc, args: Arguments);
}
export declare class SuperMember extends ValOnly {
    name: MemberName;
    constructor(loc: Loc, name: MemberName);
}

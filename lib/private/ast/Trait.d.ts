import Loc from 'esast/lib/Loc';
import Op from 'op/Op';
import { ClassTraitDo, MethodImplLike } from './classTraitCommon';
import { DoOnly, Val, ValOnly } from './LineContent';
export default class Trait extends ValOnly {
    superTraits: Array<Val>;
    opComment: Op<string>;
    opDo: Op<ClassTraitDo>;
    statics: Array<MethodImplLike>;
    methods: Array<MethodImplLike>;
    constructor(loc: Loc, superTraits: Array<Val>, opComment?: Op<string>, opDo?: Op<ClassTraitDo>, statics?: Array<MethodImplLike>, methods?: Array<MethodImplLike>);
}
export declare class TraitDo extends DoOnly {
    implementor: Val;
    trait: Val;
    statics: Array<MethodImplLike>;
    methods: Array<MethodImplLike>;
    constructor(loc: Loc, implementor: Val, trait: Val, statics?: Array<MethodImplLike>, methods?: Array<MethodImplLike>);
}

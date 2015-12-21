import Op from 'op/Op';
import { ClassTraitDo, MethodImplLike } from '../MsAst';
import { Lines } from './Slice';
export default function parseMethodImpls(lines: Lines): Array<MethodImplLike>;
export declare function takeStatics(lines: Lines): [Array<MethodImplLike>, Lines];
export declare function parseStaticsAndMethods(lines: Lines): [Array<MethodImplLike>, Array<MethodImplLike>];
export declare function opTakeDo(lines: Lines): [Op<ClassTraitDo>, Lines];

import { MethodDefinitionPlain, Property } from 'esast/lib/ast';
import { MethodImplLike } from '../MsAst';
export declare function transpileMethodToDefinition(_: MethodImplLike, isStatic: boolean): MethodDefinitionPlain;
export declare function transpileMethodToProperty(_: MethodImplLike): Property;

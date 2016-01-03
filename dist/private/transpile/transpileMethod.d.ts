import { MethodDefinitionNonConstructor } from 'esast/lib/Class';
import { Property } from 'esast/lib/ObjectExpression';
import { MethodImplLike } from '../ast/classTraitCommon';
export declare function transpileMethodToDefinition(_: MethodImplLike, isStatic: boolean): MethodDefinitionNonConstructor;
export declare function transpileMethodToProperty(_: MethodImplLike): Property;

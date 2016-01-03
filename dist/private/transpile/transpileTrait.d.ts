import Expression from 'esast/lib/Expression';
import Statement from 'esast/lib/Statement';
import Trait, { TraitDo } from '../ast/Trait';
export declare function transpileTraitNoLoc(_: Trait): Expression;
export declare function transpileTraitDoNoLoc(_: TraitDo): Statement;

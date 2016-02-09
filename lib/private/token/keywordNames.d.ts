import { Operators, SpecialVals, UnaryOperators } from '../ast/Val';
import { Kw } from './Keyword';
export declare const kwToName: Map<Kw, string>;
export declare const operatorToName: Map<Operators, string>;
export declare const unaryOperatorToName: Map<UnaryOperators, string>;
export declare const specialValToName: Map<SpecialVals, string>;
export declare const reservedWords: Set<string>;

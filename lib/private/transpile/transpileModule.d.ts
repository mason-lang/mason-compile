import Expression, { AssignmentExpression } from 'esast/lib/Expression';
import { Script } from 'esast/lib/Program';
import Module from '../ast/Module';
export default function transpileModule(_: Module): Script;
export declare function exportNamedOrDefault(val: Expression, name: string): AssignmentExpression;

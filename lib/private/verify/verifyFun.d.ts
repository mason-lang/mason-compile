import Fun, { FunBlock } from '../ast/Fun';
export default function verifyFun(_: Fun): void;
export declare function verifyFunBlock({loc, opReturnType, isDo, opDeclareThis, args, opRestArg, kind, block}: FunBlock): void;

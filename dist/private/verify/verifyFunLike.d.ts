import Fun, { FunLike } from '../ast/Fun';
export default function verifyFunLike(_: FunLike): void;
export declare function verifyFun({loc, opReturnType, isDo, opDeclareThis, args, opRestArg, kind, block}: Fun): void;

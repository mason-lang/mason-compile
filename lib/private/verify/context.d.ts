import Op from 'op/Op';
import { Constructor } from '../ast/Class';
import { MethodImplLike } from '../ast/classTraitCommon';
import { Funs } from '../ast/Fun';
import { LocalDeclare } from '../ast/locals';
import Loop from '../ast/Loop';
import VerifyResults from '../VerifyResults';
import SK from './SK';
export declare let locals: Map<string, LocalDeclare>;
export declare let okToNotUse: Set<LocalDeclare>;
export declare let opLoop: Op<{
    loop: Loop;
    sk: SK;
}>;
export declare let pendingBlockLocals: Array<LocalDeclare>;
export declare let funKind: Funs;
export declare let method: Op<Constructor | MethodImplLike>;
export declare let results: VerifyResults;
export declare let name: string;
export declare let isInSwitch: boolean;
export declare function setup(): void;
export declare function tearDown(): void;
export declare function withLoop(newLoop: Op<{
    loop: Loop;
    sk: SK;
}>, action: () => void): void;
export declare function withMethod(newMethod: Constructor | MethodImplLike, action: () => void): void;
export declare function withName(newName: string, action: () => void): void;
export declare function withIife(action: () => void): void;
export declare function withIifeIf(cond: boolean, action: () => void): void;
export declare function withIifeIfVal(sk: SK, action: () => void): void;
export declare function setPendingBlockLocals(val: Array<LocalDeclare>): void;
export declare function withInSwitch(newInSwitch: boolean, action: () => void): void;
export declare function withFun(funKind: Funs, action: () => void): void;
export declare function withMethods(action: () => void): void;

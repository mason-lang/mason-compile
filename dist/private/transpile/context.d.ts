import { Funs } from '../MsAst';
import VerifyResults from '../VerifyResults';
export declare let verifyResults: VerifyResults;
export declare let funKind: Funs;
export declare let nextDestructuredId: number;
export declare function setup(_verifyResults: VerifyResults): void;
export declare function tearDown(): void;
export declare function getDestructuredId(): number;
export declare function withFunKind<A>(newFunKind: Funs, func: () => A): A;

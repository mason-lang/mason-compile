import { Assert, Except, Throw } from '../ast/errors';
import SK from './SK';
export declare function verifyAssert({condition, opThrown}: Assert): void;
export declare function verifyExcept(_: Except, sk: SK): void;
export declare function verifyThrow(_: Throw): void;

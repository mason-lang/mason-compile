import Op from 'op/Op';
export declare function allSame<A, B>(array: Array<A>, mapper: (a: A) => B): boolean;
export declare function assert(cond: boolean): void;
export declare function cat<A>(...parts: Array<Array<A> | Op<A> | Op<Array<A>>>): Array<A>;
export declare function flatMap<A, B>(mapped: Array<A>, mapper: (a: A, index?: number) => Array<B>): Array<B>;
export declare function head<A>(array: Array<A>): A;
export declare function isEmpty<A>(array: Array<A>): boolean;
export declare function last<A>(array: Array<A>): A;
export declare function reverseIter<A>(array: Array<A>): Iterable<A>;
export declare function rtail<A>(array: Array<A>): Array<A>;
export declare function tail<A>(array: Array<A>): Array<A>;
export declare function toArray<A>(value: A | Array<A>): Array<A>;
export declare function applyDefaults<A>(provided: A, defaults: A): A;
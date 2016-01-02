import { For, ForBag, Iteratee } from '../MsAst';
export default function verifyFor(_: For | ForBag): void;
export declare function withVerifyIteratee({element, bag}: Iteratee, action: () => void): void;

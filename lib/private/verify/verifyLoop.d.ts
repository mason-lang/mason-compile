import { Break, For, ForAsync, ForBag } from '../ast/Loop';
import SK from './SK';
export default function verifyLoop(_: For | ForBag, sk: SK): void;
export declare function verifyForAsync(_: ForAsync, sk: SK): void;
export declare function verifyBreak(_: Break): void;

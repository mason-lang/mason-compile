import Call, { New, Spread } from '../ast/Call';
import { Val } from '../ast/LineContent';
export default function verifyCall({called, args}: Call): void;
export declare function verifyNew({type, args}: New): void;
export declare function verifyEachValOrSpread(asts: Array<Val | Spread>): void;

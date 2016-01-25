import Loc from 'esast/lib/Loc';
import Switch from '../ast/Switch';
import { Lines, Tokens } from './Slice';
export default function parseSwitch(tokens: Tokens): Switch;
export declare function parseSwitchFun(loc: Loc, block: Lines): Switch;

import Class from './Class';
import { FunBlock } from './Fun';
import { Val } from './LineContent';
import Poly from './Poly';
import Trait from './Trait';
import { SpecialVal } from './Val';
declare type Named = Class | FunBlock | Poly | Trait | SpecialVal;
export default Named;
export declare function isNamed(_: Val): _ is Named;

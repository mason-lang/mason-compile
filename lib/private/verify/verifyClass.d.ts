import Class, { SuperCall, SuperMember } from '../ast/Class';
import SK from './SK';
export default function verifyClass(_: Class): void;
export declare function verifySuperCall(_: SuperCall, sk: SK): void;
export declare function verifySuperMember({loc, name}: SuperMember): void;

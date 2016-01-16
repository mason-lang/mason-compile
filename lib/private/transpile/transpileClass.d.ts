import Expression from 'esast/lib/Expression';
import Statement from 'esast/lib/Statement';
import Class, { SuperCall, SuperMember } from '../ast/Class';
export declare function transpileClassNoLoc(_: Class): Expression;
export declare function transpileSuperCallDoNoLoc(_: SuperCall): Statement | Array<Statement>;
export declare function transpileSuperCallValNoLoc(_: SuperCall): Expression;
export declare function transpileSuperMemberNoLoc({name}: SuperMember): Expression;

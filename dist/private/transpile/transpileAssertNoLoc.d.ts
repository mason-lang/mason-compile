import Statement from 'esast/lib/Statement';
import { Assert } from '../ast/errors';
export default function transpileAssertNoLoc({negate, condition, opThrown}: Assert): Statement;

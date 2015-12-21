import { BlockStatement, Statement } from 'esast/lib/ast';
import Op from 'op/Op';
import { Val } from '../MsAst';
export default function (lead?: Op<Array<Statement>>, opReturnType?: Op<Val>, follow?: Op<Array<Statement>>): BlockStatement;

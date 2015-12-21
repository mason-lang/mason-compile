import { ArrowFunctionExpression, Statement } from 'esast/lib/ast';
import Op from 'op/Op';
export default function (leadStatements?: Op<Array<Statement>>, dontDeclareThis?: boolean): ArrowFunctionExpression;

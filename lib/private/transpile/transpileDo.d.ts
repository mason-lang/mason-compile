import Statement from 'esast/lib/Statement';
import { Do } from '../ast/LineContent';
export default function transpileDo(_: Do): Statement | Array<Statement>;

import { Keywords } from '../token/Keyword';
import { Tokens } from './Slice';
export default function parseMethodSplit(tokens: Tokens): {
    before: Tokens;
    kind: Keywords;
    after: Tokens;
};
